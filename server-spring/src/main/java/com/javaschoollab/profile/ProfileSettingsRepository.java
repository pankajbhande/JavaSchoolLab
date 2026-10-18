package com.javaschoollab.profile;

import com.javaschoollab.profile.PublicProfiles.Cert;
import com.javaschoollab.profile.PublicProfiles.Profile;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** user_profiles (opt-in public profile settings) and the public-safe reads the profile page needs. */
@Repository
public class ProfileSettingsRepository {

    public record PublishedProfile(long userId, Profile profile) {}

    private final JdbcTemplate jdbc;

    public ProfileSettingsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<ProfileRules.Settings> settingsOf(long userId) {
        List<ProfileRules.Settings> rows = jdbc.query("""
                SELECT handle, display_name, bio, is_public, show_certificates, show_stats, show_badges, show_progress
                FROM user_profiles WHERE user_id = ? LIMIT 1""",
                (rs, n) -> new ProfileRules.Settings(rs.getBoolean("is_public"),
                        nz(rs.getString("handle")), nz(rs.getString("display_name")), nz(rs.getString("bio")),
                        rs.getBoolean("show_certificates"), rs.getBoolean("show_stats"),
                        rs.getBoolean("show_badges"), rs.getBoolean("show_progress")), userId);
        return rows.stream().findFirst();
    }

    /** Who owns this handle, published or not (a handle stays reserved to its owner while unpublished). */
    public Optional<Long> ownerOfHandle(String handle) {
        return jdbc.queryForList("SELECT user_id FROM user_profiles WHERE handle = ? LIMIT 1", Long.class, handle).stream().findFirst();
    }

    public boolean hasRow(long userId) {
        return !jdbc.queryForList("SELECT user_id FROM user_profiles WHERE user_id = ? LIMIT 1", Long.class, userId).isEmpty();
    }

    /**
     * Plain UPDATE then INSERT, not INSERT ... ON DUPLICATE KEY UPDATE: that also fires on the UNIQUE handle key
     * and would overwrite the OTHER learner's row when a handle is taken. This way a clash is a DuplicateKeyException.
     */
    public void save(long userId, ProfileRules.Settings s) {
        String handle = emptyToNull(s.handle()), name = emptyToNull(s.displayName()), bio = emptyToNull(s.bio());
        if (hasRow(userId)) {
            jdbc.update("""
                    UPDATE user_profiles SET handle = ?, display_name = ?, bio = ?, is_public = ?, show_certificates = ?,
                      show_stats = ?, show_badges = ?, show_progress = ? WHERE user_id = ?""",
                    handle, name, bio, s.isPublic(), s.showCertificates(), s.showStats(), s.showBadges(), s.showProgress(), userId);
        } else {
            jdbc.update("""
                    INSERT INTO user_profiles (handle, display_name, bio, is_public, show_certificates, show_stats, show_badges, show_progress, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    handle, name, bio, s.isPublic(), s.showCertificates(), s.showStats(), s.showBadges(), s.showProgress(), userId);
        }
    }

    /** A published profile by handle. Only columns that are safe to show: never email, mobile, date of birth or organisation. */
    public Optional<PublishedProfile> published(String handle) {
        return jdbc.query("""
                SELECT p.user_id, p.handle, p.display_name, p.bio, p.show_certificates, p.show_stats, p.show_badges, p.show_progress,
                       u.full_name, u.avatar, u.created_at
                FROM user_profiles p JOIN users u ON u.id = p.user_id
                WHERE p.handle = ? AND p.is_public = 1 LIMIT 1""",
                (rs, n) -> new PublishedProfile(rs.getLong("user_id"), new Profile(
                        rs.getString("handle"), rs.getString("display_name"), rs.getString("bio"), rs.getString("full_name"),
                        rs.getString("avatar"), rs.getTimestamp("created_at").toInstant(),
                        rs.getBoolean("show_certificates"), rs.getBoolean("show_stats"), rs.getBoolean("show_badges"),
                        rs.getBoolean("show_progress"))), handle).stream().findFirst();
    }

    public List<Cert> certificatesOf(long userId) {
        return jdbc.query("""
                SELECT certificate_uid, course_name, topic_name, score, total_questions, issued_at
                FROM certificates WHERE user_id = ? ORDER BY issued_at DESC, id DESC LIMIT 200""",
                (rs, n) -> new Cert(rs.getString(1), rs.getString(2), rs.getString(3), rs.getInt(4), rs.getInt(5),
                        rs.getTimestamp(6).toInstant()), userId);
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    private static String emptyToNull(String s) {
        return s == null || s.isEmpty() ? null : s;
    }
}
