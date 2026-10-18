-- Mirror of server/migrations/000_base_tables.sql (USE line removed: Flyway connects to the right database).
-- Base tables the API reads and writes: users, otp_codes, certificates, visitor_count.
--
-- Kept identical to docker/mysql-init/000_base_schema.sql (which seeds a brand-new Docker volume) so a
-- database built either way ends up with the same columns. This copy is for every other host: it lets
-- `npm run migrate` build the full schema on a bare MySQL, where 001-005 would otherwise fail on their
-- foreign key to users.
--
-- Re-runnable: every statement is IF NOT EXISTS / INSERT IGNORE, so it is a no-op on a database that
-- already has these tables (your existing users and data are never touched).

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NULL UNIQUE,
  mobile        VARCHAR(20)  NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  login_type    ENUM('email','mobile') NOT NULL,
  gender        VARCHAR(20)  NULL,
  dob           DATE         NULL,
  organization  VARCHAR(255) NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  identifier      VARCHAR(255) NOT NULL,
  identifier_type ENUM('email','mobile') NOT NULL,
  otp_code        VARCHAR(10)  NOT NULL,
  purpose         VARCHAR(20)  NOT NULL,
  is_used         BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at      DATETIME NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_otp_lookup (identifier, identifier_type, purpose)
);

CREATE TABLE IF NOT EXISTS certificates (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  certificate_uid VARCHAR(64) NOT NULL UNIQUE,
  course_name     VARCHAR(255) NOT NULL,
  topic_name      VARCHAR(255) NULL,
  score           INT NOT NULL,
  total_questions INT NOT NULL DEFAULT 20,
  issued_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_cert_user (user_id, issued_at),
  CONSTRAINT fk_cert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS visitor_count (
  id    INT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0
);
INSERT IGNORE INTO visitor_count (id, count) VALUES (1, 0);
