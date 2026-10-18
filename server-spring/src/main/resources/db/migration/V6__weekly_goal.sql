-- Mirror of server/migrations/005_weekly_goal.sql (USE line removed: Flyway connects to the right database).
-- Weekly study goal, in minutes. NULL means the learner has not set one.
--
-- A column on users rather than a table: it is one small number per learner, read together with the
-- progress summary. Re-runnable: the column is only added when it is missing.


SET @has_goal = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'weekly_goal_minutes'
);
SET @ddl = IF(@has_goal = 0, 'ALTER TABLE users ADD COLUMN weekly_goal_minutes SMALLINT UNSIGNED NULL', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
