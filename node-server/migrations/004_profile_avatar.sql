-- Optional profile photo.
--
-- Stored on users as a small data URL (the browser resizes to 256x256 before upload, so a few tens of
-- KB at most). NULL means "no photo": the UI falls back to the initial-letter circle. Keeping it in the
-- database means no upload folder to back up or serve; move to object storage later if volume demands it.
--
-- Re-runnable: the column is only added when it is missing (MySQL has no ADD COLUMN IF NOT EXISTS).

USE javaschoollab;

SET @has_avatar = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar'
);
SET @ddl = IF(@has_avatar = 0, 'ALTER TABLE users ADD COLUMN avatar MEDIUMTEXT NULL', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
