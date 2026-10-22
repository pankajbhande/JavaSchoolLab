-- Indexes for the clean-up jobs and for erasing an account: without them these statements read the whole table.
CREATE INDEX idx_otp_expires ON otp_codes (expires_at);
CREATE INDEX idx_events_user ON analytics_events (user_id);
