package com.javaschoollab.notes;

import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** bookmarks and notes: one row per learner per topic, with the statements the Node server ran. */
@Repository
public class NotesRepository {

    public record Bookmark(String courseId, String moduleId, String topicId, String topicName, Instant createdAt) {}
    public record Note(String courseId, String moduleId, String topicId, String topicName, String body, Instant updatedAt) {}

    private final JdbcTemplate jdbc;

    public NotesRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ---------- bookmarks ----------

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

    // ---------- notes ----------

    public List<Note> notes(long userId) {
        return jdbc.query("""
                SELECT course_id, module_id, topic_id, topic_name, body, updated_at FROM notes
                WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 500""",
                (rs, n) -> new Note(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5),
                        rs.getTimestamp(6).toInstant()), userId);
    }

    public void saveNote(long userId, String courseId, String moduleId, String topicId, String topicName, String body) {
        jdbc.update("""
                INSERT INTO notes (user_id, course_id, module_id, topic_id, topic_name, body) VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE body = VALUES(body), topic_name = VALUES(topic_name), module_id = VALUES(module_id)""",
                userId, courseId, moduleId, topicId, topicName, body);
    }

    public void deleteNote(long userId, String courseId, String topicId) {
        jdbc.update("DELETE FROM notes WHERE user_id = ? AND course_id = ? AND topic_id = ?", userId, courseId, topicId);
    }
}
