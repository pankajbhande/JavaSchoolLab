package com.javaschoollab.notes;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** A learner's private topic notes. Same URLs, bodies, limits and messages as the Node server. */
@RestController
public class NotesController {

    private final NoteService notes;

    public NotesController(NoteService notes) {
        this.notes = notes;
    }

    @GetMapping("/api/notes")
    public List<Map<String, Object>> list(@AuthenticationPrincipal AuthUser user) {
        return notes.list(user.id()).stream().map(n -> {
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

    @PutMapping("/api/notes")
    public Map<String, Object> save(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        return notes.save(user.id(), body) ? Map.of("ok", true, "deleted", true) : Map.of("ok", true);
    }
}
