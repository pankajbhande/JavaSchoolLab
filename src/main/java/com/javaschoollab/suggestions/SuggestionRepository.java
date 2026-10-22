package com.javaschoollab.suggestions;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

/** suggestions: one row per message. */
@Repository
public class SuggestionRepository {

    /** One row of the admin list: the suggestion plus who sent it. */
    public record Row(long id, String category, String message, String pagePath, String status, Instant createdAt, String userName, String userEmail) {}

    private final JdbcTemplate jdbc;

    public SuggestionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void add(long userId, String category, String message, String pagePath) {
        jdbc.update("INSERT INTO suggestions (user_id, category, message, page_path) VALUES (?, ?, ?, ?)", userId, category, message, pagePath);
    }

    /** How many this learner sent in the last 24 hours. */
    public int sentToday(long userId) {
        Timestamp since = Timestamp.from(Instant.now().minus(Duration.ofDays(1)));
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM suggestions WHERE user_id = ? AND created_at > ?", Integer.class, userId, since);
        return n == null ? 0 : n;
    }

    public List<Suggestion> mine(long userId) {
        return jdbc.query("""
                SELECT id, category, message, page_path, status, created_at FROM suggestions
                WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50""",
                (rs, n) -> new Suggestion(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5),
                        rs.getTimestamp(6).toInstant()), userId);
    }

    /** Newest first; a blank {@code status} means all of them. */
    public List<Row> all(String status) {
        boolean filtered = status != null && !status.isBlank();
        String sql = "SELECT s.id, s.category, s.message, s.page_path, s.status, s.created_at, u.full_name, u.email FROM suggestions s "
                + "JOIN users u ON u.id = s.user_id " + (filtered ? "WHERE s.status = ? " : "") + "ORDER BY s.created_at DESC, s.id DESC LIMIT 300";
        RowMapper<Row> map = (rs, n) -> new Row(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5),
                rs.getTimestamp(6).toInstant(), rs.getString(7), rs.getString(8));
        return filtered ? jdbc.query(sql, map, status) : jdbc.query(sql, map);
    }

    public boolean setStatus(long id, String status) {
        return jdbc.update("UPDATE suggestions SET status = ? WHERE id = ?", status, id) > 0;
    }
}
