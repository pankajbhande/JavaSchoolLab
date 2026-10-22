package com.javaschoollab.suggestions;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.common.RateLimiter;
import com.javaschoollab.common.RateLimiters;
import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in learner's suggestion box, and the admin's list of everything that was sent. */
@RestController
public class SuggestionsController {

    private final SuggestionService suggestions;
    private final RateLimiter sendLimiter;

    public SuggestionsController(SuggestionService suggestions, RateLimiters limiters) {
        this.suggestions = suggestions;
        this.sendLimiter = limiters.perMinute("suggestions", 5);
    }

    @PostMapping("/api/suggestions")
    public Map<String, Object> send(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        sendLimiter.check(String.valueOf(user.id())).ifPresent(wait -> { throw ApiException.tooManyRequests(wait); });
        suggestions.send(user, body);
        return Map.of("ok", true);
    }

    @GetMapping("/api/suggestions")
    public List<Map<String, Object>> mine(@AuthenticationPrincipal AuthUser user) {
        return suggestions.mine(user.id()).stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.id());
            m.put("category", s.category());
            m.put("message", s.message());
            m.put("pagePath", s.pagePath());
            m.put("status", s.status());
            m.put("createdAt", s.createdAt());
            return m;
        }).toList();
    }

    @GetMapping("/api/admin/suggestions")
    public List<SuggestionRepository.Row> all(@AuthenticationPrincipal AuthUser user, @RequestParam(value = "status", required = false) String status) {
        return suggestions.all(user.email(), status);
    }

    @PutMapping("/api/admin/suggestions/{id}/status")
    public Map<String, Object> setStatus(@AuthenticationPrincipal AuthUser user, @PathVariable long id, @RequestBody JsonNode body) {
        suggestions.setStatus(user.email(), id, body.path("status").asText(""));
        return Map.of("ok", true);
    }
}
