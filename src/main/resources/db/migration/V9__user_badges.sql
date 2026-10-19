-- Badges and levels a learner has earned. What counts as earned is worked out from the learner's real activity (topics, streaks, quizzes,
-- certificates); this table only remembers WHEN each one was earned, so the site can celebrate it exactly once.
-- The row with badge_id '_init' marks that the learner's existing progress has been looked at, so earlier achievements are not announced as new.
CREATE TABLE IF NOT EXISTS user_badges (
  user_id   INT         NOT NULL,
  badge_id  VARCHAR(40) NOT NULL,
  earned_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  CONSTRAINT fk_badge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
