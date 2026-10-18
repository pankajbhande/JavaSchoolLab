package com.javaschoollab.quiz;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

/** quiz_attempts: every graded attempt, passes and fails. */
@Repository
public class QuizRepository {

    private final JdbcTemplate jdbc;

    public QuizRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public long insertAttempt(long userId, String courseId, String moduleId, String moduleName,
                              int score, int total, int percentage, boolean passed) {
        var keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement("""
                    INSERT INTO quiz_attempts (user_id, course_id, module_id, module_name, score, total_questions, percentage, passed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)""", new String[] {"id"});
            ps.setLong(1, userId);
            ps.setString(2, courseId);
            ps.setString(3, moduleId);
            ps.setString(4, moduleName);
            ps.setInt(5, score);
            ps.setInt(6, total);
            ps.setInt(7, percentage);
            ps.setBoolean(8, passed);
            return ps;
        }, keys);
        return keys.getKey().longValue();
    }

    public List<QuizAttempt> recentAttempts(long userId) {
        return jdbc.query("""
                SELECT course_id, module_id, module_name, score, total_questions, percentage, passed, attempted_at
                FROM quiz_attempts WHERE user_id = ? ORDER BY attempted_at DESC, id DESC LIMIT 100""",
                (rs, n) -> new QuizAttempt(rs.getString("course_id"), rs.getString("module_id"), rs.getString("module_name"),
                        rs.getInt("score"), rs.getInt("total_questions"), rs.getInt("percentage"), rs.getBoolean("passed"),
                        rs.getTimestamp("attempted_at").toInstant()), userId);
    }

    /** Best percentage per module among passing attempts: these are the "passed modules". */
    public List<PassedModule> passedModules(long userId) {
        return jdbc.query("""
                SELECT course_id, module_id, MAX(percentage) AS best FROM quiz_attempts
                WHERE user_id = ? AND passed = TRUE GROUP BY course_id, module_id""",
                (rs, n) -> new PassedModule(rs.getString("course_id"), rs.getString("module_id"), rs.getInt("best")), userId);
    }

    /** The learner's best passing attempt at this module (matched by module name, as certificates are issued by it). */
    public Optional<BestScore> bestPassedAttempt(long userId, String moduleName) {
        return jdbc.query("""
                SELECT score, total_questions FROM quiz_attempts
                WHERE user_id = ? AND module_name = ? AND passed = TRUE
                ORDER BY percentage DESC, score DESC, id ASC LIMIT 1""",
                (rs, n) -> new BestScore(rs.getInt(1), rs.getInt(2)), userId, moduleName).stream().findFirst();
    }

    public List<ReviewRow> reviewRows(long userId) {
        return jdbc.query("""
                SELECT course_id, module_id, MAX(module_name) AS module_name, MAX(percentage) AS best,
                       MAX(CASE WHEN passed THEN 1 ELSE 0 END) AS ever_passed,
                       MAX(attempted_at) AS last_attempt, COUNT(*) AS attempts
                FROM quiz_attempts WHERE user_id = ? GROUP BY course_id, module_id""",
                (rs, n) -> new ReviewRow(rs.getString("course_id"), rs.getString("module_id"), rs.getString("module_name"),
                        rs.getInt("best"), rs.getInt("ever_passed") == 1, rs.getInt("attempts"),
                        rs.getTimestamp("last_attempt").toInstant()), userId);
    }
}
