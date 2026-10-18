package com.javaschoollab.certificate;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class CertificateRepository {

    public record Score(int score, int totalQuestions) {}
    public record Issued(long id, String certificateUid, Instant issuedAt) {}
    /** A certificate with the holder's name: what the owner's list and the public check both return. */
    public record Certificate(long id, String certificateUid, String studentName, String courseName, String topicName,
                              int score, int totalQuestions, Instant issuedAt) {}

    private static final RowMapper<Certificate> CERTIFICATE = (rs, n) -> new Certificate(
            rs.getLong("id"), rs.getString("certificate_uid"), rs.getString("full_name"), rs.getString("course_name"),
            rs.getString("topic_name"), rs.getInt("score"), rs.getInt("total_questions"), rs.getTimestamp("issued_at").toInstant());

    private final JdbcTemplate jdbc;

    public CertificateRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** The learner's best passing attempt at this module (matched by module name, as the certificate is issued by it). */
    public Optional<Score> bestPassedAttempt(long userId, String moduleName) {
        return jdbc.query("""
                SELECT score, total_questions FROM quiz_attempts
                WHERE user_id = ? AND module_name = ? AND passed = TRUE
                ORDER BY percentage DESC, score DESC, id ASC LIMIT 1""",
                (rs, n) -> new Score(rs.getInt(1), rs.getInt(2)), userId, moduleName).stream().findFirst();
    }

    public Optional<Issued> findExisting(long userId, String topicName, String courseName, int score, int total) {
        return jdbc.query("""
                SELECT id, certificate_uid, issued_at FROM certificates
                WHERE user_id = ? AND topic_name = ? AND course_name = ? AND score = ? AND total_questions = ?
                ORDER BY id ASC LIMIT 1""",
                (rs, n) -> new Issued(rs.getLong(1), rs.getString(2), rs.getTimestamp(3).toInstant()),
                userId, topicName, courseName, score, total).stream().findFirst();
    }

    /** Throws DuplicateKeyException when the uid is already taken: the caller draws another. */
    public long insert(long userId, String uid, String courseName, String topicName, int score, int total) {
        var keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement("""
                    INSERT INTO certificates (user_id, certificate_uid, course_name, topic_name, score, total_questions)
                    VALUES (?, ?, ?, ?, ?, ?)""", new String[] {"id"});
            ps.setLong(1, userId);
            ps.setString(2, uid);
            ps.setString(3, courseName);
            ps.setString(4, topicName);
            ps.setInt(5, score);
            ps.setInt(6, total);
            return ps;
        }, keys);
        return keys.getKey().longValue();
    }

    public Optional<Certificate> findByUid(String uid) {
        return jdbc.query("""
                SELECT c.id, c.certificate_uid, u.full_name, c.course_name, c.topic_name, c.score, c.total_questions, c.issued_at
                FROM certificates c JOIN users u ON u.id = c.user_id WHERE c.certificate_uid = ? LIMIT 1""",
                CERTIFICATE, uid).stream().findFirst();
    }

    public List<Certificate> forUser(long userId) {
        return jdbc.query("""
                SELECT c.id, c.certificate_uid, u.full_name, c.course_name, c.topic_name, c.score, c.total_questions, c.issued_at
                FROM certificates c JOIN users u ON u.id = c.user_id
                WHERE c.user_id = ? ORDER BY c.issued_at DESC, c.id DESC""", CERTIFICATE, userId);
    }
}
