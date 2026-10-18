package com.javaschoollab.notes;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** notes: one row per learner per topic. */
@Repository
public class NoteRepository {

    private final JdbcTemplate jdbc;

    public NoteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

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
