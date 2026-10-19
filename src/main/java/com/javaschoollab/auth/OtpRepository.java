package com.javaschoollab.auth;

import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

/** One-time codes. Times are compared as parameters (not MySQL NOW()), so the rules are explicit and testable. */
@Repository
class OtpRepository implements OtpStore {

    private final JdbcTemplate jdbc;

    public OtpRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void invalidateUnused(String identifier, String identifierType) {
        jdbc.update("UPDATE otp_codes SET is_used = TRUE WHERE identifier = ? AND identifier_type = ? AND is_used = FALSE",
                identifier, identifierType);
    }

    @Override
    public long insert(String identifier, String identifierType, String otp, String purpose, LocalDateTime expiresAt) {
        var keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO otp_codes (identifier, identifier_type, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?, ?)",
                    new String[] {"id"});
            ps.setString(1, identifier);
            ps.setString(2, identifierType);
            ps.setString(3, otp);
            ps.setString(4, purpose);
            ps.setObject(5, expiresAt);
            return ps;
        }, keys);
        return keys.getKey().longValue();
    }

    @Override
    public Optional<Long> findUnused(String identifier, String identifierType, String otp, String purpose, LocalDateTime now) {
        return jdbc.queryForList(
                "SELECT id FROM otp_codes WHERE identifier = ? AND identifier_type = ? AND otp_code = ? AND purpose = ? "
                        + "AND is_used = FALSE AND expires_at > ? ORDER BY created_at DESC, id DESC LIMIT 1",
                Long.class, identifier, identifierType, otp, purpose, now).stream().findFirst();
    }

    @Override
    public Optional<Long> findVerified(String identifier, String identifierType, String otp, String purpose, LocalDateTime now) {
        return jdbc.queryForList(
                "SELECT id FROM otp_codes WHERE identifier = ? AND identifier_type = ? AND otp_code = ? AND purpose = ? "
                        + "AND is_used = TRUE AND expires_at > ? ORDER BY created_at DESC, id DESC LIMIT 1",
                Long.class, identifier, identifierType, otp, purpose, now.minusMinutes(10)).stream().findFirst();
    }

    @Override
    public void markUsed(long id) {
        jdbc.update("UPDATE otp_codes SET is_used = TRUE WHERE id = ?", id);
    }

    @Override
    public void delete(long id) {
        jdbc.update("DELETE FROM otp_codes WHERE id = ?", id);
    }
}
