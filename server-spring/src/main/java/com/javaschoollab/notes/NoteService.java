package com.javaschoollab.notes;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.ApiException;
import java.util.List;
import org.springframework.stereotype.Service;

/** Note rules: a topic reference is required, the text is cut to 10,000 characters, and a blank note deletes the row. */
@Service
public class NoteService {

    static final int NOTE_MAX_CHARS = 10_000;

    private final NoteRepository repo;

    public NoteService(NoteRepository repo) {
        this.repo = repo;
    }

    public List<Note> list(long userId) {
        return repo.notes(userId);
    }

    /** Upserts one note; an empty body deletes it so the notes list never holds blanks. Returns true when it deleted. */
    public boolean save(long userId, JsonNode body) {
        TopicRef ref = TopicRef.from(body);
        if (ref == null) throw ApiException.badRequest("courseId, moduleId and topicId are required");
        JsonNode raw = body.get("body");
        String text = raw == null || raw.isNull() ? "" : raw.asText();
        if (text.length() > NOTE_MAX_CHARS) text = text.substring(0, NOTE_MAX_CHARS);
        if (text.strip().isEmpty()) {
            repo.deleteNote(userId, ref.courseId(), ref.topicId());
            return true;
        }
        repo.saveNote(userId, ref.courseId(), ref.moduleId(), ref.topicId(), ref.topicName(), text);
        return false;
    }
}
