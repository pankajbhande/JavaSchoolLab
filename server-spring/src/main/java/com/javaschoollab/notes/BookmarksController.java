package com.javaschoollab.notes;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** A learner's bookmarks. Same URLs, bodies, limits and messages as the Node server. */
@RestController
public class BookmarksController {

    private final BookmarkService bookmarks;

    public BookmarksController(BookmarkService bookmarks) {
        this.bookmarks = bookmarks;
    }

    @GetMapping("/api/bookmarks")
    public List<Map<String, Object>> list(@AuthenticationPrincipal AuthUser user) {
        return bookmarks.list(user.id()).stream().map(b -> {
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
    public ResponseEntity<Map<String, Object>> add(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        bookmarks.add(user.id(), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true));
    }

    @DeleteMapping("/api/bookmarks")
    public Map<String, Object> remove(@AuthenticationPrincipal AuthUser user, @RequestBody(required = false) JsonNode body) {
        bookmarks.remove(user.id(), body);
        return Map.of("ok", true);
    }
}
