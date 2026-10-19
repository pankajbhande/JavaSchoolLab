-- Page views and searches reported by the site, for the admin analytics dashboard. Sign-ups, quiz attempts, certificates and
-- topic progress are already recorded in their own tables, so the dashboard reads those directly.
-- No IP address and no personal data is stored: only an anonymous per-tab session id, the signed-in user id if there is one,
-- the page path and (for searches) the words searched and how many topics matched.
CREATE TABLE IF NOT EXISTS analytics_events (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type  VARCHAR(30)  NOT NULL,
  session_id  VARCHAR(64)  NULL,
  user_id     INT          NULL,
  path        VARCHAR(255) NULL,
  detail      VARCHAR(160) NULL,
  result_count INT         NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  KEY idx_events_type_time (event_type, created_at),
  KEY idx_events_time (created_at)
);
