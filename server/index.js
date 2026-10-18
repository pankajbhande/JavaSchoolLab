import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import {
  XP_PER_TOPIC, XP_PER_MODULE_PASSED, XP_PER_STUDY_DAY,
  todayLocal, toLocalDateString, computeStreakInfo, computeXp, reviewIntervalDays, isDue,
} from './lib/progress.js';
import { smtpConfigured, sendOtpEmail } from './lib/mailer.js';
import { generateCertificateUid, isCertificateUid, createRateLimiter } from './lib/certificates.js';
import {
  normalizeHandle, handleError, cleanBio, bioError, cleanDisplayName, DISPLAY_NAME_MAX,
  buildPublicProfile, settingsFromRow,
} from './lib/profiles.js';

// Load server/.env when present (Node >= 20.6 built-in; no dotenv dependency needed).
// Missing file is fine — the defaults below keep local dev working out of the box.
try { process.loadEnvFile(new URL('.env', import.meta.url)); } catch { /* no .env — use defaults */ }

const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();
// Behind a reverse proxy (nginx, a load balancer) every request arrives from the proxy address, so the
// per-client rate limit would be shared by everyone. Set TRUST_PROXY=1 (number of proxies) there.
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

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
const verifyLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const IDENTIFIER_COLUMNS = { email: 'email', mobile: 'mobile' };

// Same rules as the sign-in form (LoginModal), enforced here too: the browser check is a courtesy,
// the server is what stops junk or abuse reaching the database.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function identifierError(type, value) {
  if (typeof value !== 'string' || !value.trim()) return `${type === 'email' ? 'Email' : 'Mobile number'} is required`;
  const v = value.trim();
  if (type === 'email') return v.length <= 254 && EMAIL_RE.test(v) ? null : 'Enter a valid email address, like name@example.com';
  const digits = v.replace(/\D/g, '');
  return /^\+?[0-9 ()-]+$/.test(v) && digits.length >= 7 && digits.length <= 15 ? null : 'Enter a valid mobile number (7 to 15 digits)';
}
function passwordError(password) {
  if (typeof password !== 'string' || password.length < 4) return 'Password must be at least 4 characters';
  return password.length > 128 ? 'Password must be at most 128 characters' : null;
}
function nameError(name) {
  return typeof name === 'string' && name.trim() && name.trim().length <= 100 ? null : 'Full name is required (up to 100 characters)';
}
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
    const badIdentifier = identifierError(identifierType, identifier);
    if (badIdentifier) return res.status(400).json({ error: badIdentifier });

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
    if (!IDENTIFIER_COLUMNS[loginType]) {
      return res.status(400).json({ error: 'Login type must be email or mobile' });
    }
    const invalid = identifierError(loginType, identifier) || passwordError(password) || nameError(fullName);
    if (invalid) return res.status(400).json({ error: invalid });

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
    // The code has done its job: remove it so it cannot be used a second time
    await pool.query('DELETE FROM otp_codes WHERE id = ?', [otpRows[0].id]);

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
    // Single use: a verified code must not log anyone in a second time
    await pool.query('DELETE FROM otp_codes WHERE id = ?', [otpRows[0].id]);
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

    if (!IDENTIFIER_COLUMNS[loginType]) {
      return res.status(400).json({ error: 'Login type must be email or mobile' });
    }
    const invalid = identifierError(loginType, loginType === 'email' ? email : mobile) || passwordError(password) || nameError(fullName);
    if (invalid) return res.status(400).json({ error: invalid });

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
    const [rows] = await pool.query('SELECT id, full_name, email, mobile, login_type, gender, dob, organization, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = rows[0];
    res.json({
      id: u.id, fullName: u.full_name, email: u.email, mobile: u.mobile, loginType: u.login_type,
      gender: u.gender, dob: u.dob ? toLocalDateString(u.dob) : null, organization: u.organization,
      avatar: u.avatar || null, createdAt: u.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==================== CERTIFICATE ROUTES ====================

// Issue certificate (requires login).
// The score is taken from the student's own recorded, passed quiz attempt for this module, never
// from the request: certificates are publicly verifiable now, so the server must not print
// whatever a client claims. Asking again for the same pass returns the same certificate (same ID).
app.post('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const { courseName, topicName } = req.body;
    if (!courseName || !topicName) {
      return res.status(400).json({ error: 'Course name and topic name are required' });
    }

    const [attempts] = await pool.query(
      `SELECT score, total_questions FROM quiz_attempts
       WHERE user_id = ? AND module_name = ? AND passed = TRUE
       ORDER BY percentage DESC, score DESC, id ASC LIMIT 1`,
      [req.user.id, topicName]
    );
    if (attempts.length === 0) {
      return res.status(403).json({ error: 'Pass this module\'s test first, then you can download the certificate.' });
    }
    const { score, total_questions: totalQuestions } = attempts[0];

    const [existing] = await pool.query(
      `SELECT id, certificate_uid, issued_at FROM certificates
       WHERE user_id = ? AND topic_name = ? AND course_name = ? AND score = ? AND total_questions = ?
       ORDER BY id ASC LIMIT 1`,
      [req.user.id, topicName, courseName, score, totalQuestions]
    );
    if (existing.length > 0) {
      return res.json({
        id: existing[0].id, certificateUid: existing[0].certificate_uid, studentName: req.user.fullName,
        courseName, topicName, score, totalQuestions, issuedAt: existing[0].issued_at,
      });
    }

    let certificateUid, result;
    for (let tries = 0; tries < 5; tries++) {
      certificateUid = generateCertificateUid();
      try {
        [result] = await pool.query(
          'INSERT INTO certificates (user_id, certificate_uid, course_name, topic_name, score, total_questions) VALUES (?, ?, ?, ?, ?, ?)',
          [req.user.id, certificateUid, courseName, topicName, score, totalQuestions]
        );
        break;
      } catch (e) {
        if (e.code !== 'ER_DUP_ENTRY') throw e; // an ID collision: draw another
      }
    }
    if (!result) throw new Error('could not allocate a certificate id');

    res.status(201).json({
      id: result.insertId,
      certificateUid,
      studentName: req.user.fullName,
      courseName,
      topicName,
      score,
      totalQuestions,
      issuedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

// Public verification: what the QR code on a certificate opens. Returns only what is printed on the
// certificate itself, and 404 for an unknown ID. Rate limited because it needs no login.
app.get('/api/certificates/verify/:uid', verifyLimiter, async (req, res) => {
  try {
    const uid = String(req.params.uid || '').trim();
    if (!isCertificateUid(uid)) return res.status(404).json({ valid: false });
    const [rows] = await pool.query(
      `SELECT c.certificate_uid, c.course_name, c.topic_name, c.score, c.total_questions, c.issued_at, u.full_name
       FROM certificates c JOIN users u ON u.id = c.user_id WHERE c.certificate_uid = ? LIMIT 1`,
      [uid]
    );
    if (rows.length === 0) return res.status(404).json({ valid: false });
    const r = rows[0];
    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      valid: true,
      certificateUid: r.certificate_uid,
      studentName: r.full_name,
      courseName: r.course_name,
      topicName: r.topic_name,
      score: r.score,
      totalQuestions: r.total_questions,
      percentage: r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0,
      issuedAt: r.issued_at,
    });
  } catch (err) {
    console.error('Certificate verify error:', err);
    res.status(500).json({ error: 'Could not verify this certificate right now' });
  }
});

// Get user's certificates
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, u.full_name FROM certificates c JOIN users u ON u.id = c.user_id WHERE c.user_id = ? ORDER BY c.issued_at DESC',
      [req.user.id]
    );
    // camelCase, matching the CertificateData type the client declares.
    res.json(rows.map(r => ({
      id: r.id,
      certificateUid: r.certificate_uid,
      studentName: r.full_name,
      courseName: r.course_name,
      topicName: r.topic_name,
      score: r.score,
      totalQuestions: r.total_questions,
      issuedAt: r.issued_at,
    })));
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
    const [[topicRows], [courseRows], [dayRows], [attemptRows], [recentRows], [goalRows]] = await Promise.all([
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
      pool.query('SELECT weekly_goal_minutes FROM users WHERE id = ?', [uid]),
    ]);

    const days = dayRows.map(r => ({
      date: toLocalDateString(r.study_date),
      seconds: r.seconds,
    }));

    // A streak stays alive if the most recent studied day is today or yesterday; counting
    // only from today would break every streak the moment midnight passed.
    const today = todayLocal();
    const { currentStreak, longestStreak, freezeUsedDates, freezeAvailable, studiedToday, atRisk } = computeStreakInfo(days, today);

    const topicsSeen = topicRows[0].n;
    const modulesPassed = attemptRows.length;
    const xp = computeXp({ topicsSeen, modulesPassed, studyDays: days.length });

    const todaySeconds = days.find(d => d.date === today)?.seconds || 0;
    const totalSeconds = days.reduce((a, d) => a + d.seconds, 0);

    res.json({
      xp,
      currentStreak,
      longestStreak,
      // Weekly streak freeze: one missed day per Monday-week is forgiven automatically.
      streakFreeze: { available: freezeAvailable, usedDates: freezeUsedDates.slice(0, 3) },
      studiedToday,
      streakAtRisk: atRisk,
      topicsSeen,
      modulesPassed,
      studySecondsToday: todaySeconds,
      studySecondsTotal: totalSeconds,
      studiedDates: days.slice(0, 60).map(d => d.date),
      // About a year of per-day seconds, newest first, for the activity heatmap and the weekly goal.
      studyDays: days.slice(0, 371),
      weeklyGoalMinutes: goalRows[0]?.weekly_goal_minutes ?? null,
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

// Weekly study goal in minutes. `null` (or 0) clears it. Bounded so a typo cannot store nonsense.
const GOAL_MIN_MINUTES = 10;
const GOAL_MAX_MINUTES = 1680; // 28 hours; more than a week can reasonably hold
app.put('/api/progress/goal', authenticateToken, async (req, res) => {
  try {
    const raw = req.body?.minutes;
    let minutes = null;
    if (raw !== null && raw !== 0) {
      minutes = Number(raw);
      if (!Number.isInteger(minutes) || minutes < GOAL_MIN_MINUTES || minutes > GOAL_MAX_MINUTES) {
        return res.status(400).json({ error: `Choose a goal between ${GOAL_MIN_MINUTES} minutes and ${GOAL_MAX_MINUTES / 60} hours a week` });
      }
    }
    await pool.query('UPDATE users SET weekly_goal_minutes = ? WHERE id = ?', [minutes, req.user.id]);
    res.set('Cache-Control', 'no-store').json({ weeklyGoalMinutes: minutes });
  } catch (err) {
    console.error('progress/goal error:', err);
    res.status(500).json({ error: 'Failed to save your goal' });
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

// ==================== PROFILE ====================

app.patch('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const fullName = String(req.body?.fullName ?? '').trim();
    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({ error: 'Name must be 2-100 characters' });
    }
    const gender = req.body?.gender ? String(req.body.gender).slice(0, 20) : null;
    const organization = req.body?.organization ? String(req.body.organization).trim().slice(0, 150) : null;
    const dob = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.dob || '') ? req.body.dob : null;
    await pool.query(
      'UPDATE users SET full_name = ?, gender = ?, dob = ?, organization = ? WHERE id = ?',
      [fullName, gender, dob, organization, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Profile photo. The browser sends a ~256px JPEG/PNG/WebP as a data URL; the server re-checks everything
// (type, size, and that the bytes really are that image format) because the browser check is only a courtesy.
const AVATAR_MAX_CHARS = 90_000;
const AVATAR_MAGIC = {
  jpeg: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  webp: b => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
};
function avatarError(value) {
  if (typeof value !== 'string') return 'Choose an image';
  if (value.length > AVATAR_MAX_CHARS) return 'That image is too large. Please choose a smaller one';
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!m) return 'Use a JPG, PNG or WebP image';
  const bytes = Buffer.from(m[2], 'base64');
  return bytes.length > 12 && AVATAR_MAGIC[m[1]](bytes) ? null : 'That file is not a valid image';
}

app.put('/api/profile/avatar', authenticateToken, async (req, res) => {
  try {
    const image = req.body?.image;
    const problem = avatarError(image);
    if (problem) return res.status(400).json({ error: problem });
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [image, req.user.id]);
    res.set('Cache-Control', 'no-store').json({ avatar: image });
  } catch (err) {
    console.error('avatar save error:', err);
    res.status(500).json({ error: 'Failed to save your photo' });
  }
});

app.delete('/api/profile/avatar', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE users SET avatar = NULL WHERE id = ?', [req.user.id]);
    res.set('Cache-Control', 'no-store').json({ avatar: null });
  } catch (err) {
    console.error('avatar delete error:', err);
    res.status(500).json({ error: 'Failed to remove your photo' });
  }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(String(currentPassword || ''), rows[0].password_hash);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(String(newPassword), 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('change-password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ==================== BOOKMARKS & NOTES ====================

function topicRef(body) {
  const { courseId, moduleId, topicId, topicName } = body || {};
  if (!courseId || !moduleId || !topicId) return null;
  return [String(courseId), String(moduleId), String(topicId), String(topicName || topicId).slice(0, 200)];
}

app.get('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT course_id, module_id, topic_id, topic_name, created_at FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC LIMIT 500',
      [req.user.id]
    );
    res.json(rows.map(r => ({
      courseId: r.course_id, moduleId: r.module_id, topicId: r.topic_id,
      topicName: r.topic_name, createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load bookmarks' });
  }
});

app.post('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const ref = topicRef(req.body);
    if (!ref) return res.status(400).json({ error: 'courseId, moduleId and topicId are required' });
    await pool.query(
      `INSERT INTO bookmarks (user_id, course_id, module_id, topic_id, topic_name) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE topic_name = VALUES(topic_name)`,
      [req.user.id, ...ref]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('bookmark add error:', err);
    res.status(500).json({ error: 'Failed to save bookmark' });
  }
});

app.delete('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { courseId, topicId } = req.body || {};
    if (!courseId || !topicId) return res.status(400).json({ error: 'courseId and topicId are required' });
    await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND course_id = ? AND topic_id = ?',
      [req.user.id, String(courseId), String(topicId)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT course_id, module_id, topic_id, topic_name, body, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 500',
      [req.user.id]
    );
    res.json(rows.map(r => ({
      courseId: r.course_id, moduleId: r.module_id, topicId: r.topic_id,
      topicName: r.topic_name, body: r.body, updatedAt: r.updated_at,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notes' });
  }
});

// Upsert one note; an empty body deletes it so the notes list never holds blanks.
app.put('/api/notes', authenticateToken, async (req, res) => {
  try {
    const ref = topicRef(req.body);
    if (!ref) return res.status(400).json({ error: 'courseId, moduleId and topicId are required' });
    const body = String(req.body?.body ?? '').slice(0, 10000);
    if (body.trim() === '') {
      await pool.query('DELETE FROM notes WHERE user_id = ? AND course_id = ? AND topic_id = ?',
        [req.user.id, ref[0], ref[2]]);
      return res.json({ ok: true, deleted: true });
    }
    await pool.query(
      `INSERT INTO notes (user_id, course_id, module_id, topic_id, topic_name, body) VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE body = VALUES(body), topic_name = VALUES(topic_name), module_id = VALUES(module_id)`,
      [req.user.id, ...ref, body]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('note save error:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// ==================== LEADERBOARD ====================

function shortName(full) {
  const parts = String(full || 'Student').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

// Ranked by the same XP formula as the dashboard, computed server-side. Names are shortened
// because this list is visible to every signed-in student.
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name,
         (SELECT COUNT(*) FROM topic_progress t WHERE t.user_id = u.id) AS topics,
         (SELECT COUNT(DISTINCT CONCAT(q.course_id, '/', q.module_id)) FROM quiz_attempts q
            WHERE q.user_id = u.id AND q.passed = TRUE) AS modules,
         (SELECT COUNT(*) FROM study_days d WHERE d.user_id = u.id) AS study_days
       FROM users u LIMIT 5000`
    );
    const ranked = rows
      .map(r => ({
        id: r.id,
        name: shortName(r.full_name),
        xp: computeXp({ topicsSeen: Number(r.topics), modulesPassed: Number(r.modules), studyDays: Number(r.study_days) }),
        modulesPassed: Number(r.modules),
      }))
      .filter(r => r.xp > 0 || r.id === req.user.id)
      .sort((a, b) => b.xp - a.xp || a.id - b.id)
      .map((r, i) => ({ ...r, rank: i + 1 }));
    const me = ranked.find(r => r.id === req.user.id) || null;
    res.json({
      top: ranked.slice(0, 20).map(r => ({ rank: r.rank, name: r.name, xp: r.xp, modulesPassed: r.modulesPassed, isMe: r.id === req.user.id })),
      me: me && { rank: me.rank, xp: me.xp },
      total: ranked.length,
    });
  } catch (err) {
    console.error('leaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// ==================== PUBLIC LEARNER PROFILES ====================
// Strictly opt-in (migration 003). The public route returns only the sections the owner switched on,
// via buildPublicProfile() in lib/profiles.js; email, mobile, DOB, organisation and ids are never read.

const profileLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const handleCheckLimiter = createRateLimiter({ windowMs: 60_000, max: 40 });

// One body for "no such handle" and "not published", so the response cannot reveal which handles exist.
const PROFILE_NOT_FOUND = { error: 'Profile not found' };

// Public: GET /api/profiles/:handle
app.get('/api/profiles/:handle', profileLimiter, async (req, res) => {
  try {
    const handle = normalizeHandle(req.params.handle);
    const notFound = () => res.set('Cache-Control', 'no-store').status(404).json(PROFILE_NOT_FOUND);
    if (handleError(handle)) return notFound();
    const [rows] = await pool.query(
      `SELECT p.user_id, p.handle, p.display_name, p.bio, p.show_certificates, p.show_stats, p.show_badges, p.show_progress,
              u.full_name, u.avatar, u.created_at
       FROM user_profiles p JOIN users u ON u.id = p.user_id
       WHERE p.handle = ? AND p.is_public = 1 LIMIT 1`,
      [handle]
    );
    if (rows.length === 0) return notFound();
    const profile = rows[0];
    const uid = profile.user_id;
    const data = {};

    const needActivity = profile.show_stats || profile.show_badges;
    const [certRows, topicCourseRows, dayRows, passedRows] = await Promise.all([
      profile.show_certificates || profile.show_badges
        ? pool.query(
            `SELECT certificate_uid, course_name, topic_name, score, total_questions, issued_at
             FROM certificates WHERE user_id = ? ORDER BY issued_at DESC LIMIT 200`, [uid]).then(r => r[0])
        : [],
      profile.show_progress || needActivity
        ? pool.query('SELECT course_id, COUNT(*) AS n FROM topic_progress WHERE user_id = ? GROUP BY course_id', [uid]).then(r => r[0])
        : [],
      needActivity
        ? pool.query('SELECT study_date, seconds FROM study_days WHERE user_id = ? ORDER BY study_date DESC LIMIT 400', [uid]).then(r => r[0])
        : [],
      needActivity
        ? pool.query(
            `SELECT COUNT(DISTINCT CONCAT(course_id, '/', module_id)) AS n FROM quiz_attempts
             WHERE user_id = ? AND passed = TRUE`, [uid]).then(r => r[0])
        : [],
    ]);

    data.certificates = certRows;
    data.byCourse = Object.fromEntries(topicCourseRows.map(r => [r.course_id, Number(r.n)]));
    if (needActivity) {
      const days = dayRows.map(r => ({ date: toLocalDateString(r.study_date), seconds: r.seconds }));
      const { currentStreak, longestStreak } = computeStreakInfo(days, todayLocal());
      const topicsSeen = topicCourseRows.reduce((a, r) => a + Number(r.n), 0);
      const modulesPassed = Number(passedRows[0]?.n || 0);
      const studySecondsTotal = days.reduce((a, d) => a + d.seconds, 0);
      data.stats = {
        xp: computeXp({ topicsSeen, modulesPassed, studyDays: days.length }),
        currentStreak, longestStreak, topicsSeen, modulesPassed, studyDays: days.length, studySecondsTotal,
      };
      data.badgeInput = { topicsSeen, longestStreak, modulesPassed, studySecondsTotal, certificates: certRows.length };
    }

    res.set('Cache-Control', 'public, max-age=10');
    res.json(buildPublicProfile(profile, data));
  } catch (err) {
    console.error('public profile error:', err);
    res.status(500).json({ error: 'Could not load this profile right now' });
  }
});

async function loadProfileSettings(userId) {
  const [rows] = await pool.query('SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0] || null;
}

// Mine: current settings (everything off when I have never configured a profile).
app.get('/api/profile/settings', authenticateToken, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(settingsFromRow(await loadProfileSettings(req.user.id)));
  } catch (err) {
    console.error('profile settings error:', err);
    res.status(500).json({ error: 'Failed to load profile settings' });
  }
});

// Mine: is this handle free? (My own current handle counts as free.)
app.get('/api/profile/handle-available', authenticateToken, handleCheckLimiter, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const handle = normalizeHandle(req.query.handle);
    const problem = handleError(handle);
    if (problem) return res.json({ handle, available: false, reason: problem });
    const [rows] = await pool.query('SELECT user_id FROM user_profiles WHERE handle = ? LIMIT 1', [handle]);
    const taken = rows.length > 0 && rows[0].user_id !== req.user.id;
    res.json({ handle, available: !taken, reason: taken ? 'That handle is already taken' : null });
  } catch (err) {
    console.error('handle check error:', err);
    res.status(500).json({ error: 'Could not check that handle' });
  }
});

// Mine: update settings. Only the fields sent change. Publishing needs a valid, free handle.
app.put('/api/profile/settings', authenticateToken, async (req, res) => {
  try {
    const body = req.body || {};
    const cur = settingsFromRow(await loadProfileSettings(req.user.id));
    const flag = (key) => {
      if (body[key] === undefined) return cur[key];
      if (typeof body[key] !== 'boolean') throw Object.assign(new Error(`${key} must be true or false`), { status: 400 });
      return body[key];
    };
    const next = {
      isPublic: flag('isPublic'),
      showCertificates: flag('showCertificates'),
      showStats: flag('showStats'),
      showBadges: flag('showBadges'),
      showProgress: flag('showProgress'),
      handle: body.handle === undefined ? cur.handle : normalizeHandle(body.handle),
      bio: body.bio === undefined ? cur.bio : cleanBio(body.bio),
      displayName: body.displayName === undefined ? cur.displayName : cleanDisplayName(body.displayName),
    };
    if (next.bio) { const e = bioError(next.bio); if (e) return res.status(400).json({ error: e }); }
    if (next.displayName.length > DISPLAY_NAME_MAX) return res.status(400).json({ error: `Display name must be ${DISPLAY_NAME_MAX} characters or fewer` });
    if (next.isPublic || next.handle) {
      const e = handleError(next.handle);
      if (e) return res.status(400).json({ error: e });
    }
    try {
      // Not INSERT ... ON DUPLICATE KEY UPDATE: that also fires on the UNIQUE handle key and would overwrite
      // the OTHER user's row when a handle is taken. An explicit update/insert turns a clash into ER_DUP_ENTRY.
      const values = [next.handle || null, next.displayName || null, next.bio || null, next.isPublic, next.showCertificates,
        next.showStats, next.showBadges, next.showProgress];
      if (await loadProfileSettings(req.user.id)) {
        await pool.query(
          `UPDATE user_profiles SET handle = ?, display_name = ?, bio = ?, is_public = ?, show_certificates = ?,
             show_stats = ?, show_badges = ?, show_progress = ? WHERE user_id = ?`,
          [...values, req.user.id]
        );
      } else {
        await pool.query(
          `INSERT INTO user_profiles
             (handle, display_name, bio, is_public, show_certificates, show_stats, show_badges, show_progress, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [...values, req.user.id]
        );
      }
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That handle is already taken' });
      throw e;
    }
    res.set('Cache-Control', 'no-store');
    res.json(settingsFromRow(await loadProfileSettings(req.user.id)));
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    console.error('profile update error:', err);
    res.status(500).json({ error: 'Failed to save profile settings' });
  }
});

// ==================== START SERVER ====================

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`JavaSchoolLab API server running on http://localhost:${PORT}`);
});
