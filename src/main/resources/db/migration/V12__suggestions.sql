-- Suggestion box: ideas, content mistakes and bug reports sent by signed-in learners.
CREATE TABLE IF NOT EXISTS suggestions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  category   VARCHAR(20) NOT NULL,
  message    TEXT NOT NULL,
  page_path  VARCHAR(300) NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_suggestions_user (user_id, created_at),
  CONSTRAINT fk_suggestion_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
