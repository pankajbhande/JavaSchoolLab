/**
 * Auth service: sign-up, sign-in (password or one-time code), the current user and password change.
 * Owns the {@code otp_codes} table (through {@code OtpRepository}); accounts themselves are read and written
 * through the user service ({@code UserService}). Sends codes by email with {@code MailService}.
 */
package com.javaschoollab.auth;
