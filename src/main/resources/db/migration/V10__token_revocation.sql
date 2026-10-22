-- Login tokens issued before this moment are no longer accepted for the user. Set when the password is changed or the user chooses
-- "sign out of all devices", so a stolen or forgotten token stops working at once instead of living out its 7 days. NULL = never revoked.
ALTER TABLE users ADD COLUMN tokens_valid_from DATETIME NULL;
