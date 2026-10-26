-- Pro plan paid through Razorpay. One row per checkout in payments; premium_access holds the date until which a learner is Pro.
-- user_id on a payment is cleared (not deleted) when the account is deleted, so the money record outlives the account.
CREATE TABLE IF NOT EXISTS payments (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NULL,
  plan                VARCHAR(20) NOT NULL,
  amount_paise        INT NOT NULL,
  currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
  razorpay_order_id   VARCHAR(64) NOT NULL,
  razorpay_payment_id VARCHAR(64) NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'created',
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at             TIMESTAMP NULL,
  CONSTRAINT uq_payment_order UNIQUE (razorpay_order_id),
  INDEX idx_payments_user (user_id, created_at),
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS premium_access (
  user_id    INT PRIMARY KEY,
  expires_at DATETIME NOT NULL,
  CONSTRAINT fk_premium_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
