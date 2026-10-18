-- Phase 4: opt-in public learner profiles (/u/:handle).
--
-- A separate table rather than columns on users: users holds sign-in identity and personal data
-- (email, mobile, DOB, organisation), and keeping everything public-facing in its own table means a
-- profile query can never accidentally SELECT those columns, and the users table stays untouched.
-- No row = no profile; every flag defaults to 0 so nothing is public until the owner opts in.
-- The handle stays reserved to its owner while unpublished (is_public = 0), so a link cannot be
-- hijacked by someone else after a temporary unpublish.
--
-- Re-runnable: every statement is IF NOT EXISTS.

USE javaschoollab;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id            INT NOT NULL PRIMARY KEY,
  handle             VARCHAR(30) NULL,
  display_name       VARCHAR(60) NULL,
  bio                VARCHAR(160) NULL,
  is_public          TINYINT(1) NOT NULL DEFAULT 0,
  show_certificates  TINYINT(1) NOT NULL DEFAULT 0,
  show_stats         TINYINT(1) NOT NULL DEFAULT 0,
  show_badges        TINYINT(1) NOT NULL DEFAULT 0,
  show_progress      TINYINT(1) NOT NULL DEFAULT 0,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_profile_handle (handle),
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
