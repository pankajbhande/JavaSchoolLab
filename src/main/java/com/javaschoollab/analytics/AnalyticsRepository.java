package com.javaschoollab.analytics;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * The analytics_events table, plus read-only counts over the tables that already record what learners do (users, quiz_attempts,
 * certificates, topic_progress, visitor_count). All dates are passed in as parameters, so the same SQL runs on MySQL and in tests.
 */
@Repository
class AnalyticsRepository {

    private final JdbcTemplate jdbc;

    AnalyticsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    void insertEvent(String type, String sessionId, Long userId, String path, String detail, Integer value) {
        jdbc.update("INSERT INTO analytics_events (event_type, session_id, user_id, path, detail, result_count) VALUES (?, ?, ?, ?, ?, ?)",
                type, sessionId, userId, path, detail, value);
    }

    /** One row per day: {d, c} (c is the count, or the distinct sessions when the query says so). */
    List<Map<String, Object>> daily(String sql, LocalDateTime since) {
        return jdbc.queryForList(sql, Timestamp.valueOf(since));
    }

    static final String PAGE_VIEWS_DAILY =
            "SELECT DATE(created_at) AS d, COUNT(*) AS c, COUNT(DISTINCT session_id) AS s FROM analytics_events "
                    + "WHERE event_type = 'page_view' AND created_at >= ? GROUP BY DATE(created_at)";
    static final String SEARCHES_DAILY =
            "SELECT DATE(created_at) AS d, COUNT(*) AS c FROM analytics_events WHERE event_type = 'search' AND created_at >= ? GROUP BY DATE(created_at)";
    static final String SIGNUPS_DAILY =
            "SELECT DATE(created_at) AS d, COUNT(*) AS c FROM users WHERE created_at >= ? GROUP BY DATE(created_at)";
    static final String QUIZZES_DAILY =
            "SELECT DATE(attempted_at) AS d, COUNT(*) AS c FROM quiz_attempts WHERE attempted_at >= ? GROUP BY DATE(attempted_at)";
    static final String CERTIFICATES_DAILY =
            "SELECT DATE(issued_at) AS d, COUNT(*) AS c FROM certificates WHERE issued_at >= ? GROUP BY DATE(issued_at)";

    List<Map<String, Object>> topPages(LocalDateTime since, int limit) {
        return jdbc.query("SELECT path, COUNT(*) AS views FROM analytics_events WHERE event_type = 'page_view' AND created_at >= ? "
                + "AND path IS NOT NULL GROUP BY path ORDER BY views DESC, path LIMIT " + limit,
                (rs, i) -> row("path", rs.getString(1), "views", rs.getLong(2)), Timestamp.valueOf(since));
    }

    List<Map<String, Object>> topSearches(LocalDateTime since, int limit, boolean onlyEmpty) {
        return jdbc.query("SELECT detail, COUNT(*), AVG(result_count) FROM analytics_events "
                + "WHERE event_type = 'search' AND created_at >= ? AND detail IS NOT NULL " + (onlyEmpty ? "AND result_count = 0 " : "")
                + "GROUP BY detail ORDER BY COUNT(*) DESC, detail LIMIT " + limit,
                (rs, i) -> row("query", rs.getString(1), "searches", rs.getLong(2), "avgResults", Math.round(rs.getDouble(3) * 10) / 10.0),
                Timestamp.valueOf(since));
    }

    /** Topics people shared most, with how many shares each got. */
    List<Map<String, Object>> topShared(LocalDateTime since, int limit) {
        return jdbc.query("SELECT path, COUNT(*) FROM analytics_events WHERE event_type = 'share' AND created_at >= ? AND path IS NOT NULL "
                + "GROUP BY path ORDER BY COUNT(*) DESC, path LIMIT " + limit,
                (rs, i) -> row("path", rs.getString(1), "shares", rs.getLong(2)), Timestamp.valueOf(since));
    }

    /** Which way people share: whatsapp, telegram, copy, system (the phone's share sheet), and so on. */
    List<Map<String, Object>> shareChannels(LocalDateTime since) {
        return jdbc.query("SELECT detail, COUNT(*) FROM analytics_events WHERE event_type = 'share' AND created_at >= ? AND detail IS NOT NULL "
                + "GROUP BY detail ORDER BY COUNT(*) DESC, detail",
                (rs, i) -> row("channel", rs.getString(1), "shares", rs.getLong(2)), Timestamp.valueOf(since));
    }

    List<Map<String, Object>> topCourses(LocalDateTime since, int limit) {
        return jdbc.query("SELECT course_id, COUNT(DISTINCT user_id), COUNT(*) FROM topic_progress "
                + "WHERE first_seen_at >= ? GROUP BY course_id ORDER BY COUNT(*) DESC, course_id LIMIT " + limit,
                (rs, i) -> row("courseId", rs.getString(1), "learners", rs.getLong(2), "topics", rs.getLong(3)), Timestamp.valueOf(since));
    }

    /** A row with fixed lowercase keys, so the JSON is the same on MySQL and in tests (H2 upper-cases column names). */
    private static Map<String, Object> row(Object... keyValues) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) m.put((String) keyValues[i], keyValues[i + 1]);
        return m;
    }

    long count(String sql, Object... args) {
        Long n = jdbc.queryForObject(sql, Long.class, args);
        return n == null ? 0 : n;
    }

    long visitorCounter() {
        return jdbc.queryForList("SELECT count FROM visitor_count WHERE id = 1", Long.class).stream().findFirst().orElse(0L);
    }

    /** Removes events older than the cutoff (the dashboard never looks that far back). Returns how many were deleted. */
    int deleteOlderThan(LocalDateTime cutoff) {
        return jdbc.update("DELETE FROM analytics_events WHERE created_at < ?", Timestamp.valueOf(cutoff));
    }
}
