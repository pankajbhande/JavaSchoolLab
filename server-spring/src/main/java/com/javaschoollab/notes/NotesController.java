package com.javaschoollab.notes;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.auth.ApiException;
import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** A learner's bookmarks and private topic notes. Same URLs, bodies, limits and messages as the Node server. */
@RestController
public class NotesController {

    static final int NOTE_MAX_CHARS = 10_000;
    static final int TOPIC_NAME_MAX_CHARS = 200;

    private final NotesRepository repo;

    public NotesController(NotesRepository repo) {
        this.repo = repo;
    }

    /** course + module + topic ids, plus a display name that defaults to the topic id. Null when an id is missing. */
    private record TopicRef(String courseId, String moduleId, String topicId, String topicName) {}

    private static TopicRef topicRef(JsonNode body) {
        if (!present(body.get("courseId")) || !present(body.get("moduleId")) || !present(body.get("topicId"))) return null;
        String topicId = body.get("topicId").asText();
        String name = present(body.get("topicName")) ? body.get("topicName").asText() : topicId;
        return new TopicRef(body.get("courseId").asText(), body.get("moduleId").asText(), topicId, cut(name, TOPIC_NAME_MAX_CHARS));
    }

    // ---------- bookmarks ----------

    @GetMapping("/api/bookmarks")
    public List<Map<String, Object>> bookmarks(@AuthenticationPrincipal AuthUser user) {
        return repo.bookmarks(user.id()).stream().map(b -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("courseId", b.courseId());
            m.put("moduleId", b.moduleId());
            m.put("topicId", b.topicId());
            m.put("topicName", b.topicName());
            m.put("createdAt", b.createdAt());
            return m;
        }).toList();
    }

    @PostMapping("/api/bookmarks")
    public ResponseEntity<Map<String, Object>> addBookmark(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        TopicRef ref = topicRef(body);
        if (ref == null) throw ApiException.badRequest("courseId, moduleId and topicId are required");
        repo.addBookmark(user.id(), ref.courseId(), ref.moduleId(), ref.topicId(), ref.topicName());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true));
    }

    @DeleteMapping("/api/bookmarks")
    public Map<String, Object> removeBookmark(@AuthenticationPrincipal AuthUser user, @RequestBody(required = false) JsonNode body) {
        if (body == null || !present(body.get("courseId")) || !present(body.get("topicId"))) {
            throw ApiException.badRequest("courseId and topicId are required");
        }
        repo.removeBookmark(user.id(), body.get("courseId").asText(), body.get("topicId").asText());
        return Map.of("ok", true);
    }

    // ---------- notes ----------

    @GetMapping("/api/notes")
    public List<Map<String, Object>> notes(@AuthenticationPrincipal AuthUser user) {
        return repo.notes(user.id()).stream().map(n -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("courseId", n.courseId());
            m.put("moduleId", n.moduleId());
            m.put("topicId", n.topicId());
            m.put("topicName", n.topicName());
            m.put("body", n.body());
            m.put("updatedAt", n.updatedAt());
            return m;
        }).toList();
    }

    /** Upserts one note; an empty body deletes it so the notes list never holds blanks. */
    @PutMapping("/api/notes")
    public Map<String, Object> saveNote(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        TopicRef ref = topicRef(body);
        if (ref == null) throw ApiException.badRequest("courseId, moduleId and topicId are required");
        JsonNode raw = body.get("body");
        String text = cut(raw == null || raw.isNull() ? "" : raw.asText(), NOTE_MAX_CHARS);
        if (text.strip().isEmpty()) {
            repo.deleteNote(user.id(), ref.courseId(), ref.topicId());
            return Map.of("ok", true, "deleted", true);
        }
        repo.saveNote(user.id(), ref.courseId(), ref.moduleId(), ref.topicId(), ref.topicName(), text);
        return Map.of("ok", true);
    }

    /** JS-style "was provided": missing, null, "", 0 and false are not. */
    private static boolean present(JsonNode n) {
        if (n == null || n.isNull() || n.isMissingNode()) return false;
        if (n.isTextual()) return !n.asText().isEmpty();
        if (n.isNumber()) return n.asDouble() != 0;
        if (n.isBoolean()) return n.asBoolean();
        return true;
    }

    private static String cut(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
