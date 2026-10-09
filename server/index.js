import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import {
  XP_PER_TOPIC, XP_PER_MODULE_PASSED, XP_PER_STUDY_DAY,
  todayLocal, toLocalDateString, computeStreaks, computeXp, reviewIntervalDays, isDue,
} from './lib/progress.js';
import { smtpConfigured, sendOtpEmail } from './lib/mailer.js';

// Load server/.env when present (Node >= 20.6 built-in; no dotenv dependency needed).
// Missing file is fine — the defaults below keep local dev working out of the box.
try { process.loadEnvFile(new URL('.env', import.meta.url)); } catch { /* no .env — use defaults */ }

const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();

// In production, only the configured front-end origin may call this API.
// CORS_ORIGIN accepts a comma-separated list; unset means "allow any" (dev only).
const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors(corsOrigins.length ? { origin: corsOrigins, credentials: true } : {}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Copy server/.env.example to server/.env and set it.');
  console.error(String.raw`Generate one with:  node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`);
  process.exit(1);
}

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'javaschoollab',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
});

// The OTP/auth routes select users by a column named in the request body
// (identifierType / loginType). Resolving it through this allowlist keeps an
// attacker-controlled string from ever reaching the SQL text.
const IDENTIFIER_COLUMNS = { email: 'email', mobile: 'mobile' };
function columnFor(identifierType) {
  const column = IDENTIFIER_COLUMNS[identifierType];
  if (!column) throw new Error('Invalid identifier type');
  return column;
}

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ==================== OTP ROUTES ====================

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Send OTP
app.post('/api/otp/send', async (req, res) => {
  try {
    const { identifier, identifierType, purpose } = req.body;

    if (!identifier || !identifierType || !purpose) {
      return res.status(400).json({ error: 'Identifier, type, and purpose are required' });
    }
    if (!IDENTIFIER_COLUMNS[identifierType]) {
      return res.status(400).json({ error: 'Identifier type must be email or mobile' });
    }

    // For register: check user doesn't already exist
    if (purpose === 'register') {
      const [existing] = await pool.query(
        `SELECT id FROM users WHERE ${columnFor(identifierType)} = ?`, [identifier]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: `User with this ${identifierType} already exists. Please login instead.` });
      }
    }

    // For login: check user exists
    if (purpose === 'login') {
      const [existing] = await pool.query(
        `SELECT id FROM users WHERE ${columnFor(identifierType)} = ?`, [identifier]
      );
      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found. Please register first.' });
      }
    }

    // Invalidate old unused OTPs for this identifier
    await pool.query(
      'UPDATE otp_codes SET is_used = TRUE WHERE identifier = ? AND identifier_type = ? AND is_used = FALSE',
      [identifier, identifierType]
    );

    // Generate new OTP (expires in 5 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const [inserted] = await pool.query(
      'INSERT INTO otp_codes (identifier, identifier_type, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)',
      [identifier, identifierType, otp, purpose, expiresAt]
    );

    // Deliver the code. Email goes out over SMTP (see lib/mailer.js). There is no SMS
    // provider yet, so in production a mobile OTP is refused rather than silently "sent".
    // If delivery fails the stored code is removed so it cannot be guessed or reused.
    const discardOtp = () => pool.query('DELETE FROM otp_codes WHERE id = ?', [inserted.insertId]).catch(() => {});
    let delivered = false;
    if (identifierType === 'email' && smtpConfigured()) {
      try {
        await sendOtpEmail({ to: identifier, otp, purpose });
        delivered = true;
      } catch (mailErr) {
        console.error('OTP email failed:', mailErr.message);
        await discardOtp();
        return res.status(502).json({ error: 'We could not send the verification email. Please try again in a moment.' });
      }
    } else if (IS_PROD) {
      await discardOtp();
      return res.status(identifierType === 'email' ? 503 : 501).json({
        error: identifierType === 'email'
          ? 'Email verification is temporarily unavailable. Please try again later.'
          : 'Mobile OTP is not available yet. Please register with your email address.',
      });
    }

    // Development only: no provider configured, so make the code visible to the developer.
    if (!delivered && !IS_PROD) {
      console.log(`[OTP] ${identifierType}: ${identifier} => OTP: ${otp} (purpose: ${purpose})`);
    }

    res.json({
      message: `OTP sent to your ${identifierType}`,
      expiresIn: 300,
      // Echoing the code back to the browser defeats the point of a second factor.
      // Opt in explicitly for local dev; impossible once NODE_ENV=production.
      ...(!IS_PROD && process.env.OTP_DEV_ECHO === 'true' ? { _dev_otp: otp } : {}),
    });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Verify OTP
app.post('/api/otp/verify', async (req, res) => {
  try {
    const { identifier, identifierType, otp, purpose } = req.body;

    if (!identifier || !identifierType || !otp || !purpose) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!IDENTIFIER_COLUMNS[identifierType]) {
      return res.status(400).json({ error: 'Identifier type must be email or mobile' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE identifier = ? AND identifier_type = ? AND otp_code = ? AND purpose = ?
       AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [identifier, identifierType, otp, purpose]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired OTP. Please try again.' });
    }

    // Mark OTP as used
    await pool.query('UPDATE otp_codes SET is_used = TRUE WHERE id = ?', [rows[0].id]);

    res.json({ verified: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Register with OTP
app.post('/api/auth/register-otp', async (req, res) => {
  try {
    const { fullName, email, mobile, password, loginType, otp, gender, dob, organization } = req.body;

    if (!fullName || !password || !loginType || !otp) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const identifier = loginType === 'email' ? email : mobile;
    if (!identifier) {
      return res.status(400).json({ error: `${loginType} is required` });
    }

    // Verify OTP
    const [otpRows] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE identifier = ? AND identifier_type = ? AND otp_code = ? AND purpose = 'register'
       AND is_used = TRUE AND expires_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
       ORDER BY created_at DESC LIMIT 1`,
      [identifier, loginType, otp]
    );

    if (otpRows.length === 0) {
      return res.status(401).json({ error: 'OTP not verified. Please verify OTP first.' });
    }

    // Check if user already exists
    const [existing] = await pool.query(`SELECT id FROM users WHERE ${columnFor(loginType)} = ?`, [identifier]);
    if (existing.length > 0) {
      return res.status(409).json({ error: `User with this ${loginType} already exists` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, mobile, password_hash, login_type, gender, dob, organization) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fullName, email || null, mobile || null, passwordHash, loginType, gender || null, dob || null, organization || null]
    );

    const token = jwt.sign({ id: result.insertId, fullName, email, mobile }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: result.insertId, fullName, email, mobile, loginType, gender, dob, organization }
    });
  } catch (err) {
    console.error('Register OTP error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with OTP (passwordless)
app.post('/api/auth/login-otp', async (req, res) => {
  try {
    const { email, mobile, loginType, otp } = req.body;

    if (!loginType || !otp) {
      return res.status(400).json({ error: 'Login type and OTP are required' });
    }

    const identifier = loginType === 'email' ? email : mobile;
    if (!identifier) {
      return res.status(400).json({ error: `${loginType} is required` });
    }

    // Verify OTP
    const [otpRows] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE identifier = ? AND identifier_type = ? AND otp_code = ? AND purpose = 'login'
       AND is_used = TRUE AND expires_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
       ORDER BY created_at DESC LIMIT 1`,
      [identifier, loginType, otp]
    );

    if (otpRows.length === 0) {
      return res.status(401).json({ error: 'OTP not verified. Please verify OTP first.' });
    }

    // Get user
    const [rows] = await pool.query(`SELECT * FROM users WHERE ${columnFor(loginType)} = ?`, [identifier]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, fullName: user.full_name, email: user.email, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, mobile: user.mobile, loginType: user.login_type }
    });
  } catch (err) {
    console.error('Login OTP error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, mobile, password, loginType, gender, dob, organization } = req.body;

    if (!fullName || !password || !loginType) {
      return res.status(400).json({ error: 'Full name, password, and login type are required' });
    }

    if (loginType === 'email' && !email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (loginType === 'mobile' && !mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Check if user already exists
    const field = loginType === 'email' ? 'email' : 'mobile';
    const value = loginType === 'email' ? email : mobile;
    const [existing] = await pool.query(`SELECT id FROM users WHERE ${columnFor(field)} = ?`, [value]);
    if (existing.length > 0) {
      return res.status(409).json({ error: `User with this ${field} already exists` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, mobile, password_hash, login_type, gender, dob, organization) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fullName, email || null, mobile || null, passwordHash, loginType, gender || null, dob || null, organization || null]
    );

    const token = jwt.sign({ id: result.insertId, fullName, email, mobile }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: result.insertId, fullName, email, mobile, loginType, gender, dob, organization }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, mobile, password, loginType } = req.body;

    if (!password || !loginType) {
      return res.status(400).json({ error: 'Password and login type are required' });
    }

    const field = loginType === 'email' ? 'email' : 'mobile';
    const value = loginType === 'email' ? email : mobile;

    if (!value) {
      return res.status(400).json({ error: `${field} is required` });
    }

    const [rows] = await pool.query(`SELECT * FROM users WHERE ${columnFor(field)} = ?`, [value]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found. Please register first.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, fullName: user.full_name, email: user.email, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, mobile: user.mobile, loginType: user.login_type }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, full_name, email, mobile, login_type, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = rows[0];
    res.json({ id: u.id, fullName: u.full_name, email: u.email, mobile: u.mobile, loginType: u.login_type, createdAt: u.created_at });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==================== CERTIFICATE ROUTES ====================

// Issue certificate (requires login)
app.post('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const { courseName, topicName, score, totalQuestions } = req.body;
    if (!courseName || !topicName || score === undefined) {
      return res.status(400).json({ error: 'Course name, topic name, and score are required' });
    }

    const certificateUid = `JSL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const [result] = await pool.query(
      'INSERT INTO certificates (user_id, certificate_uid, course_name, topic_name, score, total_questions) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, certificateUid, courseName, topicName, score, totalQuestions || 20]
    );

    res.status(201).json({
      id: result.insertId,
      certificateUid,
      studentName: req.user.fullName,
      courseName,
      topicName,
      score,
      totalQuestions: totalQuestions || 20,
      issuedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

// Get user's certificates
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// ==================== VISITOR ROUTES ====================

// Increment and get visitor count
app.post('/api/visitors/increment', async (req, res) => {
  try {
    await pool.query('UPDATE visitor_count SET count = count + 1 WHERE id = 1');
    const [rows] = await pool.query('SELECT count FROM visitor_count WHERE id = 1');
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update visitor count' });
  }
});

// Get visitor count
app.get('/api/visitors/count', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT count FROM visitor_count WHERE id = 1');
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get visitor count' });
  }
});

// ==================== LEARNING PROGRESS ====================
//
// Progress used to live only in localStorage, so it was per-device and invisible to the
// platform. These routes move it behind the account. Everything is derived server-side —
// XP and streaks in particular — so a client cannot inflate them.

// Record that a topic was opened.
app.post('/api/progress/topic', authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId, topicId } = req.body;
    if (!courseId || !moduleId || !topicId) {
      return res.status(400).json({ error: 'courseId, moduleId and topicId are required' });
    }
    await pool.query(
      `INSERT INTO topic_progress (user_id, course_id, module_id, topic_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE last_seen_at = CURRENT_TIMESTAMP, module_id = VALUES(module_id)`,
      [req.user.id, courseId, moduleId, topicId]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('progress/topic error:', err);
    res.status(500).json({ error: 'Failed to record progress' });
  }
});

// Bulk import, used once when a guest signs in and their localStorage history is adopted.
app.post('/api/progress/import', authenticateToken, async (req, res) => {
  try {
    const { topics } = req.body;
    if (!Array.isArray(topics) || topics.length === 0) return res.json({ imported: 0 });
    // Cap the batch so a malformed or hostile client cannot push an unbounded insert.
    const batch = topics
      .filter(t => t && t.courseId && t.moduleId && t.topicId)
      .slice(0, 1000)
      .map(t => [req.user.id, String(t.courseId), String(t.moduleId), String(t.topicId)]);
    if (batch.length === 0) return res.json({ imported: 0 });
    await pool.query(
      `INSERT INTO topic_progress (user_id, course_id, module_id, topic_id) VALUES ?
       ON DUPLICATE KEY UPDATE last_seen_at = last_seen_at`,
      [batch]
    );
    res.json({ imported: batch.length });
  } catch (err) {
    console.error('progress/import error:', err);
    res.status(500).json({ error: 'Failed to import progress' });
  }
});

// Add studied seconds to today. Clamped: this is called on a timer, so a tab left open
// or a replayed request should not be able to manufacture a large number.
app.post('/api/progress/study', authenticateToken, async (req, res) => {
  try {
    const raw = Number(req.body?.seconds);
    const seconds = Number.isFinite(raw) ? Math.max(0, Math.min(Math.round(raw), 900)) : 0;
    if (seconds === 0) return res.json({ ok: true, added: 0 });
    await pool.query(
      `INSERT INTO study_days (user_id, study_date, seconds) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE seconds = LEAST(seconds + VALUES(seconds), 86400)`,
      [req.user.id, todayLocal(), seconds]
    );
    res.json({ ok: true, added: seconds });
  } catch (err) {
    console.error('progress/study error:', err);
    res.status(500).json({ error: 'Failed to record study time' });
  }
});

// Everything the dashboard needs in one round trip.
app.get('/api/progress/summary', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.id;
    const [[topicRows], [courseRows], [dayRows], [attemptRows], [recentRows]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS n FROM topic_progress WHERE user_id = ?', [uid]),
      pool.query(
        `SELECT course_id, COUNT(*) AS topics_seen, MAX(last_seen_at) AS last_seen
         FROM topic_progress WHERE user_id = ? GROUP BY course_id`, [uid]
      ),
      pool.query(
        'SELECT study_date, seconds FROM study_days WHERE user_id = ? ORDER BY study_date DESC LIMIT 400', [uid]
      ),
      pool.query(
        `SELECT course_id, module_id, MAX(percentage) AS best
         FROM quiz_attempts WHERE user_id = ? AND passed = TRUE
         GROUP BY course_id, module_id`, [uid]
      ),
      pool.query(
        `SELECT course_id, module_id, topic_id, last_seen_at
         FROM topic_progress WHERE user_id = ? ORDER BY last_seen_at DESC LIMIT 1`, [uid]
      ),
    ]);

    const days = dayRows.map(r => ({
      date: toLocalDateString(r.study_date),
      seconds: r.seconds,
    }));

    // A streak stays alive if the most recent studied day is today or yesterday; counting
    // only from today would break every streak the moment midnight passed.
    const today = todayLocal();
    const { currentStreak, longestStreak } = computeStreaks(days, today);

    const topicsSeen = topicRows[0].n;
    const modulesPassed = attemptRows.length;
    const xp = computeXp({ topicsSeen, modulesPassed, studyDays: days.length });

    const todaySeconds = days.find(d => d.date === today)?.seconds || 0;
    const totalSeconds = days.reduce((a, d) => a + d.seconds, 0);

    res.json({
      xp,
      currentStreak,
      longestStreak,
      topicsSeen,
      modulesPassed,
      studySecondsToday: todaySeconds,
      studySecondsTotal: totalSeconds,
      studiedDates: days.slice(0, 60).map(d => d.date),
      byCourse: Object.fromEntries(courseRows.map(r => [r.course_id, r.topics_seen])),
      passedModules: attemptRows.map(r => ({ courseId: r.course_id, moduleId: r.module_id, best: r.best })),
      resume: recentRows[0]
        ? { courseId: recentRows[0].course_id, moduleId: recentRows[0].module_id, topicId: recentRows[0].topic_id }
        : null,
    });
  } catch (err) {
    console.error('progress/summary error:', err);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// Full visited-topic list, used to paint completion ticks in the sidebar.
app.get('/api/progress/topics', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT course_id, module_id, topic_id FROM topic_progress WHERE user_id = ?', [req.user.id]
    );
    res.json(rows.map(r => ({ courseId: r.course_id, moduleId: r.module_id, topicId: r.topic_id })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load visited topics' });
  }
});

// ==================== QUIZ ATTEMPTS & REVIEW ====================

// Record a graded attempt. Every attempt is stored, not just passes, so weak modules
// surface and improvement over retries is visible.
app.post('/api/quiz/attempts', authenticateToken, async (req, res) => {
  try {
    const { courseId, moduleId, moduleName, score, totalQuestions } = req.body;
    if (!courseId || !moduleId || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'courseId, moduleId, score and totalQuestions are required' });
    }
    const total = Math.max(1, Number(totalQuestions));
    const got = Math.max(0, Math.min(Number(score), total));
    // Recomputed here rather than trusted from the client, so the stored percentage and
    // pass flag always agree with the stored score.
    const percentage = Math.round((got / total) * 100);
    const passed = percentage >= 70;

    const [result] = await pool.query(
      `INSERT INTO quiz_attempts
         (user_id, course_id, module_id, module_name, score, total_questions, percentage, passed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, courseId, moduleId, moduleName || moduleId, got, total, percentage, passed]
    );
    res.status(201).json({ id: result.insertId, percentage, passed });
  } catch (err) {
    console.error('quiz/attempts error:', err);
    res.status(500).json({ error: 'Failed to record attempt' });
  }
});

app.get('/api/quiz/attempts', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT course_id, module_id, module_name, score, total_questions, percentage, passed, attempted_at
       FROM quiz_attempts WHERE user_id = ? ORDER BY attempted_at DESC LIMIT 100`, [req.user.id]
    );
    res.json(rows.map(r => ({
      courseId: r.course_id, moduleId: r.module_id, moduleName: r.module_name,
      score: r.score, totalQuestions: r.total_questions,
      percentage: r.percentage, passed: !!r.passed, attemptedAt: r.attempted_at,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load attempts' });
  }
});

/**
 * Modules due for review, cheapest useful form of spaced repetition: the weaker the best
 * score, the sooner it comes back. Never-passed modules are always due.
 */
app.get('/api/progress/review', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT course_id, module_id,
              ANY_VALUE(module_name) AS module_name,
              MAX(percentage) AS best,
              MAX(passed) AS ever_passed,
              MAX(attempted_at) AS last_attempt,
              COUNT(*) AS attempts
       FROM quiz_attempts WHERE user_id = ?
       GROUP BY course_id, module_id`, [req.user.id]
    );
    const now = Date.now();
    const due = rows.map(r => {
      const best = Number(r.best);
      const everPassed = !!Number(r.ever_passed);
      const intervalDays = reviewIntervalDays(best);
      const ageDays = (now - new Date(r.last_attempt).getTime()) / 86400000;
      return {
        courseId: r.course_id,
        moduleId: r.module_id,
        moduleName: r.module_name,
        best,
        everPassed,
        attempts: Number(r.attempts),
        intervalDays,
        daysSince: Math.floor(ageDays),
        due: isDue({ everPassed, best, daysSinceLastAttempt: ageDays }),
      };
    })
      .filter(m => m.due)
      // Weakest first: that is where another attempt is worth the most.
      .sort((a, b) => (a.everPassed === b.everPassed ? a.best - b.best : a.everPassed ? 1 : -1));
    res.json(due);
  } catch (err) {
    console.error('progress/review error:', err);
    res.status(500).json({ error: 'Failed to load review queue' });
  }
});

// ==================== START SERVER ====================

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`JavaSchoolLab API server running on http://localhost:${PORT}`);
});
