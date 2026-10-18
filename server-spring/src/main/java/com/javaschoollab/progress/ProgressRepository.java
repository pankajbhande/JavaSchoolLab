package com.javaschoollab.progress;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** topic_progress, study_days and quiz_attempts, with the statements the Node server ran. */
@Repository
public class ProgressRepository {

    public record TopicRef(String courseId, String moduleId, String topicId) {}
    public record StudyDay(LocalDate date, int seconds) {}
    public record PassedModule(String courseId, String moduleId, int best) {}
    public record Attempt(String courseId, String moduleId, String moduleName, int score, int totalQuestions,
                          int percentage, boolean passed, Instant attemptedAt) {}
    public record ReviewRow(String courseId, String moduleId, String moduleName, int best, boolean everPassed,
                            int attempts, Instant lastAttempt) {}

    private final JdbcTemplate jdbc;

    public ProgressRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ---------- topics ----------

    public void recordTopic(long userId, String courseId, String moduleId, String topicId) {
        jdbc.update("""
                INSERT INTO topic_progress (user_id, course_id, module_id, topic_id) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE last_seen_at = CURRENT_TIMESTAMP, module_id = VALUES(module_id)""",
                userId, courseId, moduleId, topicId);
    }

    /** Adopts a guest's history. Existing rows keep their own last_seen_at. */
    public void importTopics(long userId, List<TopicRef> topics) {
        jdbc.batchUpdate("""
                INSERT INTO topic_progress (user_id, course_id, module_id, topic_id) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE last_seen_at = last_seen_at""",
                topics, topics.size(), (ps, t) -> {
                    ps.setLong(1, userId);
                    ps.setString(2, t.courseId());
                    ps.setString(3, t.moduleId());
                    ps.setString(4, t.topicId());
                });
    }

    public List<TopicRef> allTopics(long userId) {
        return jdbc.query("SELECT course_id, module_id, topic_id FROM topic_progress WHERE user_id = ?",
                (rs, n) -> new TopicRef(rs.getString(1), rs.getString(2), rs.getString(3)), userId);
    }

    public int countTopics(long userId) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM topic_progress WHERE user_id = ?", Integer.class, userId);
        return n == null ? 0 : n;
    }

    public Map<String, Integer> topicsByCourse(long userId) {
        Map<String, Integer> out = new LinkedHashMap<>();
        jdbc.query("SELECT course_id, COUNT(*) AS topics_seen FROM topic_progress WHERE user_id = ? GROUP BY course_id",
                rs -> { out.put(rs.getString("course_id"), rs.getInt("topics_seen")); }, userId);
        return out;
    }

    public Optional<TopicRef> mostRecentTopic(long userId) {
        return jdbc.query("""
                SELECT course_id, module_id, topic_id FROM topic_progress
                WHERE user_id = ? ORDER BY last_seen_at DESC, id DESC LIMIT 1""",
                (rs, n) -> new TopicRef(rs.getString(1), rs.getString(2), rs.getString(3)), userId).stream().findFirst();
    }

    // ---------- study time ----------

    public void addStudySeconds(long userId, LocalDate day, int seconds) {
        jdbc.update("""
                INSERT INTO study_days (user_id, study_date, seconds) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE seconds = LEAST(seconds + VALUES(seconds), 86400)""",
                userId, day, seconds);
    }

    /** Newest first, at most 400 days (the same window the dashboard has always used). */
    public List<StudyDay> studyDays(long userId) {
        return jdbc.query("SELECT study_date, seconds FROM study_days WHERE user_id = ? ORDER BY study_date DESC LIMIT 400",
                (rs, n) -> new StudyDay(rs.getObject("study_date", LocalDate.class), rs.getInt("seconds")), userId);
    }

    // ---------- weekly goal ----------

    public Integer weeklyGoal(long userId) {
        // A list, not a stream: the column is NULL until a goal is set, and Stream.findFirst() rejects a null element.
        List<Integer> rows = jdbc.query("SELECT weekly_goal_minutes FROM users WHERE id = ?",
                (rs, n) -> rs.getObject(1, Integer.class), userId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public void setWeeklyGoal(long userId, Integer minutes) {
        jdbc.update("UPDATE users SET weekly_goal_minutes = ? WHERE id = ?", minutes, userId);
    }

    // ---------- quizzes ----------

    public long insertAttempt(long userId, String courseId, String moduleId, String moduleName,
                              int score, int total, int percentage, boolean passed) {
        var keys = new org.springframework.jdbc.support.GeneratedKeyHolder();
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

    public List<Attempt> recentAttempts(long userId) {
        return jdbc.query("""
                SELECT course_id, module_id, module_name, score, total_questions, percentage, passed, attempted_at
                FROM quiz_attempts WHERE user_id = ? ORDER BY attempted_at DESC, id DESC LIMIT 100""",
                (rs, n) -> new Attempt(rs.getString("course_id"), rs.getString("module_id"), rs.getString("module_name"),
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
