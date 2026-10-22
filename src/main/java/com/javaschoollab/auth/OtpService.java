package com.javaschoollab.auth;

import com.javaschoollab.common.ApiException;
import com.javaschoollab.user.Identifier;
import com.javaschoollab.user.UserService;
import com.javaschoollab.user.Validation;

import com.javaschoollab.config.AppProperties;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Send and verify the six-digit code that proves someone controls an email address. */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    static final int EXPIRES_MINUTES = 5;

    private final OtpStore otps;
    private final UserService users;
    private final MailService mail;
    private final boolean devEcho;
    private final boolean production;

    public OtpService(OtpStore otps, UserService users, MailService mail, AppProperties props, Environment env) {
        this.otps = otps;
        this.users = users;
        this.mail = mail;
        this.production = env.acceptsProfiles(Profiles.of("prod"));
        this.devEcho = !production && props.otp().devEcho();   // can never leak the code in production
    }

    /** Used and expired codes are of no use to anyone; clear them out every hour so the table does not grow for ever. */
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 17 * * * *")
    void purgeExpired() {
        otps.purgeExpired(LocalDateTime.now().minusHours(1));
    }

    public Map<String, Object> send(String identifier, String identifierType, String purpose) {
        if (isBlank(identifier) || isBlank(identifierType) || isBlank(purpose)) {
            throw ApiException.badRequest("Identifier, type, and purpose are required");
        }
        requireKnownPurpose(purpose);
        Identifier type = Identifier.emailOnly(identifierType);
        String bad = Validation.identifierError(type, identifier);
        if (bad != null) throw ApiException.badRequest(bad);

        if ("register".equals(purpose) && users.exists(type, identifier)) {
            throw ApiException.conflict("User with this " + identifierType + " already exists. Please login instead.");
        }
        if ("login".equals(purpose) && !users.exists(type, identifier)) {
            // Answer exactly as if a code had been sent (nothing is stored or mailed): "no such account" must not be visible from outside.
            return sentBody(null);
        }

        otps.invalidateUnused(identifier, identifierType);
        String otp = String.format("%06d", 100000 + RANDOM.nextInt(900000));
        long id = otps.insert(identifier, identifierType, otp, purpose, LocalDateTime.now().plusMinutes(EXPIRES_MINUTES));

        // Deliver it. If delivery fails the stored code is removed so it can't be guessed or reused.
        boolean delivered = false;
        if (type == Identifier.EMAIL && mail.configured()) {
            try {
                mail.sendOtp(identifier, otp, purpose);
                delivered = true;
            } catch (Exception e) {
                log.error("OTP email failed: {}", e.getMessage());
                otps.delete(id);
                throw new ApiException(HttpStatus.BAD_GATEWAY, "We could not send the verification email. Please try again in a moment.");
            }
        } else if (production) {
            otps.delete(id);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Email verification is temporarily unavailable. Please try again later.");
        }
        if (!delivered && !production) {
            log.info("[OTP] {}: {} => OTP: {} (purpose: {})", identifierType, identifier, otp, purpose);
        }

        Map<String, Object> body = sentBody(devEcho ? otp : null);
        return body;
    }

    private Map<String, Object> sentBody(String devOtp) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "OTP sent to your email");
        body.put("expiresIn", EXPIRES_MINUTES * 60);
        if (devOtp != null) body.put("_dev_otp", devOtp);
        return body;
    }

    public Map<String, Object> verify(String identifier, String identifierType, String otp, String purpose) {
        if (isBlank(identifier) || isBlank(identifierType) || isBlank(otp) || isBlank(purpose)) {
            throw ApiException.badRequest("All fields are required");
        }
        requireKnownPurpose(purpose);
        Identifier.emailOnly(identifierType);
        long id = otps.findUnused(identifier, identifierType, otp, purpose, LocalDateTime.now())
                .orElseThrow(() -> ApiException.unauthorized("Invalid or expired OTP. Please try again."));
        otps.markUsed(id);
        return Map.of("verified", true, "message", "OTP verified successfully");
    }

    /** Register and login-by-OTP spend a code that verify() already accepted. Returns its id so the caller can delete it. */
    long requireVerified(String identifier, String identifierType, String otp, String purpose) {
        return otps.findVerified(identifier, identifierType, otp, purpose, LocalDateTime.now())
                .orElseThrow(() -> ApiException.unauthorized("OTP not verified. Please verify OTP first."));
    }

    void spend(long id) {
        otps.delete(id);
    }

    /** Only the two flows that exist; anything else is a hand-made request (and would not fit the column). */
    private static void requireKnownPurpose(String purpose) {
        if (!"register".equals(purpose) && !"login".equals(purpose)) throw ApiException.badRequest("Invalid purpose");
    }

    private static boolean isBlank(String s) {
        return s == null || s.isEmpty();
    }
}
