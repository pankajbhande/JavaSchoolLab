package com.javaschoollab.progress;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** topic_progress and study_days (plus the weekly goal on users), with the statements the Node server ran. */
@Repository
public class ProgressRepository {

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
}
