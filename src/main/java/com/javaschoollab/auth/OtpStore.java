package com.javaschoollab.auth;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Where one-time codes are kept. {@link OtpRepository} keeps them in the MySQL otp_codes table; {@link RedisOtpRepository}
 * keeps them in Redis with an expiry, so they clean themselves up. {@link OtpService} does not know which one it has.
 */
interface OtpStore {

    /** A new code replaces any earlier unused one for the same identifier. */
    void invalidateUnused(String identifier, String identifierType);

    long insert(String identifier, String identifierType, String otp, String purpose, LocalDateTime expiresAt);

    /** A code that is correct, not yet used and not expired: what "verify" accepts. */
    Optional<Long> findUnused(String identifier, String identifierType, String otp, String purpose, LocalDateTime now);

    /** A code that verify already accepted and that register/login may now spend (valid up to 10 minutes past expiry, as in Node). */
    Optional<Long> findVerified(String identifier, String identifierType, String otp, String purpose, LocalDateTime now);

    void markUsed(long id);

    void delete(long id);
}
