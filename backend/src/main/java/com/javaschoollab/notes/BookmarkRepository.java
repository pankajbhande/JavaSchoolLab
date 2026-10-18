package com.javaschoollab.notes;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** bookmarks: one row per learner per topic. */
@Repository
public class BookmarkRepository {

    private final JdbcTemplate jdbc;

    public BookmarkRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Bookmark> bookmarks(long userId) {
        return jdbc.query("""
                SELECT course_id, module_id, topic_id, topic_name, created_at FROM bookmarks
                WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 500""",
                (rs, n) -> new Bookmark(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4),
                        rs.getTimestamp(5).toInstant()), userId);
    }

    public void addBookmark(long userId, String courseId, String moduleId, String topicId, String topicName) {
        jdbc.update("""
                INSERT INTO bookmarks (user_id, course_id, module_id, topic_id, topic_name) VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE topic_name = VALUES(topic_name)""",
                userId, courseId, moduleId, topicId, topicName);
    }

    public void removeBookmark(long userId, String courseId, String topicId) {
        jdbc.update("DELETE FROM bookmarks WHERE user_id = ? AND course_id = ? AND topic_id = ?", userId, courseId, topicId);
    }
}
