-- Mirror of server/migrations/001_learning_progress.sql (USE line removed: Flyway connects to the right database).
-- Phase 2: server-side learning progress.
--
-- Before this, all progress lived in localStorage (jsl_visited_topics and a per-day
-- jsl_study_seconds_* key), so it was per-device, per-browser, lost on a cache clear and
-- invisible to the platform. These tables move it behind the user account so progress,
-- streaks and completion follow the student.
--
-- Re-runnable: every statement is IF NOT EXISTS.


-- One row per topic a user has opened. course_id and module_id are denormalised so
-- per-course completion can be computed without the app shipping the course tree to SQL.
-- Longest real ids today: course 26, module 31, topic 46 chars.
CREATE TABLE IF NOT EXISTS topic_progress (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  course_id     VARCHAR(120) NOT NULL,
  module_id     VARCHAR(120) NOT NULL,
  topic_id      VARCHAR(120) NOT NULL,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Topic ids are globally unique today; course_id is in the key anyway so that a future
  -- id collision across courses cannot silently merge two students' progress rows.
  UNIQUE KEY uniq_user_course_topic (user_id, course_id, topic_id),
  KEY idx_user_course (user_id, course_id),
  KEY idx_user_recent (user_id, last_seen_at),
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Every graded attempt, not just the passing one. Needed to spot weak modules and to
-- show whether a student is improving.
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  course_id       VARCHAR(120) NOT NULL,
  module_id       VARCHAR(120) NOT NULL,
  module_name     VARCHAR(150) NOT NULL,
  score           INT NOT NULL,
  total_questions INT NOT NULL,
  percentage      INT NOT NULL,
  passed          BOOLEAN NOT NULL,
  attempted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user_module (user_id, course_id, module_id),
  KEY idx_user_time (user_id, attempted_at),
  CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- One row per user per calendar day studied. Streaks are derived from the presence of
-- consecutive days here, so a day only counts once the student actually spends time.
CREATE TABLE IF NOT EXISTS study_days (
  user_id    INT NOT NULL,
  study_date DATE NOT NULL,
  seconds    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, study_date),
  CONSTRAINT fk_study_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
