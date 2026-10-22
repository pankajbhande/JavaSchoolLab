-- H2 stand-in for the MySQL tables, with the same columns the code reads and writes.
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NULL UNIQUE,
  mobile        VARCHAR(20)  NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  login_type    VARCHAR(10)  NOT NULL,
  gender        VARCHAR(20)  NULL,
  dob           DATE         NULL,
  organization  VARCHAR(255) NULL,
  avatar        VARCHAR(100000) NULL,
  weekly_goal_minutes SMALLINT NULL,
  tokens_valid_from TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  identifier      VARCHAR(255) NOT NULL,
  identifier_type VARCHAR(10)  NOT NULL,
  otp_code        VARCHAR(10)  NOT NULL,
  purpose         VARCHAR(20)  NOT NULL,
  is_used         BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at      TIMESTAMP NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitor_count (
  id    INT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0
);
MERGE INTO visitor_count (id, count) KEY (id) VALUES (1, 41);

CREATE TABLE IF NOT EXISTS topic_progress (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  course_id     VARCHAR(120) NOT NULL,
  module_id     VARCHAR(120) NOT NULL,
  topic_id      VARCHAR(120) NOT NULL,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_user_course_topic UNIQUE (user_id, course_id, topic_id)
);

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
  attempted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS study_days (
  user_id    INT NOT NULL,
  study_date DATE NOT NULL,
  seconds    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, study_date)
);

CREATE TABLE IF NOT EXISTS certificates (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  certificate_uid VARCHAR(64) NOT NULL UNIQUE,
  course_name     VARCHAR(255) NOT NULL,
  topic_name      VARCHAR(255) NULL,
  score           INT NOT NULL,
  total_questions INT NOT NULL DEFAULT 20,
  issued_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  course_id  VARCHAR(120) NOT NULL,
  module_id  VARCHAR(120) NOT NULL,
  topic_id   VARCHAR(120) NOT NULL,
  topic_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_bookmark UNIQUE (user_id, course_id, topic_id)
);

CREATE TABLE IF NOT EXISTS notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  course_id  VARCHAR(120) NOT NULL,
  module_id  VARCHAR(120) NOT NULL,
  topic_id   VARCHAR(120) NOT NULL,
  topic_name VARCHAR(200) NOT NULL,
  body       CLOB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uniq_note UNIQUE (user_id, course_id, topic_id)
);

CREATE TABLE IF NOT EXISTS suggestions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  category   VARCHAR(20) NOT NULL,
  message    CLOB NOT NULL,
  page_path  VARCHAR(300) NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id            INT NOT NULL PRIMARY KEY,
  handle             VARCHAR(30) NULL,
  display_name       VARCHAR(60) NULL,
  bio                VARCHAR(160) NULL,
  is_public          TINYINT NOT NULL DEFAULT 0,
  show_certificates  TINYINT NOT NULL DEFAULT 0,
  show_stats         TINYINT NOT NULL DEFAULT 0,
  show_badges        TINYINT NOT NULL DEFAULT 0,
  show_progress      TINYINT NOT NULL DEFAULT 0,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uniq_profile_handle UNIQUE (handle)
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type  VARCHAR(30)  NOT NULL,
  session_id  VARCHAR(64)  NULL,
  user_id     INT          NULL,
  path        VARCHAR(255) NULL,
  detail      VARCHAR(160) NULL,
  result_count INT         NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id   INT         NOT NULL,
  badge_id  VARCHAR(40) NOT NULL,
  earned_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id)
);
