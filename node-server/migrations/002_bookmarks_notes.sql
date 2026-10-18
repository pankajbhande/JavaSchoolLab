-- Phase 3: per-user bookmarks and private topic notes.
-- Re-runnable: every statement is IF NOT EXISTS.

USE javaschoollab;

CREATE TABLE IF NOT EXISTS bookmarks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  course_id  VARCHAR(120) NOT NULL,
  module_id  VARCHAR(120) NOT NULL,
  topic_id   VARCHAR(120) NOT NULL,
  topic_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_course_topic (user_id, course_id, topic_id),
  CONSTRAINT fk_bookmark_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  course_id  VARCHAR(120) NOT NULL,
  module_id  VARCHAR(120) NOT NULL,
  topic_id   VARCHAR(120) NOT NULL,
  topic_name VARCHAR(200) NOT NULL,
  body       TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_course_topic (user_id, course_id, topic_id),
  CONSTRAINT fk_note_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
