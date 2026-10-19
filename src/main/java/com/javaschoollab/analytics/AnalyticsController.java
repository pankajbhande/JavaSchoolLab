package com.javaschoollab.analytics;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.RateLimiter;
import com.javaschoollab.common.RateLimiters;
import com.javaschoollab.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * POST /api/analytics/event: the site reports a page view or a search (public, rate limited, always answers 204 so a tracking
 * problem never shows up on the page). GET /api/admin/analytics: the dashboard numbers, for the admin emails only.
 */
@RestController
public class AnalyticsController {

    private final AnalyticsService analytics;
    private final RateLimiter eventLimiter;

    public AnalyticsController(AnalyticsService analytics, RateLimiters limiters) {
        this.analytics = analytics;
        this.eventLimiter = limiters.perMinute("analytics", 240);
    }

    @PostMapping("/api/analytics/event")
    public ResponseEntity<Void> event(@RequestBody JsonNode body, @AuthenticationPrincipal AuthUser user, HttpServletRequest request) {
        if (eventLimiter.check(request.getRemoteAddr()).isPresent()) return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        try {
            analytics.record(text(body, "type"), text(body, "sessionId"), user == null ? null : user.id(), text(body, "path"), text(body, "detail"),
                    body.hasNonNull("value") && body.get("value").isNumber() ? body.get("value").asInt() : null);
        } catch (RuntimeException ignored) {
            // tracking must never break the page
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/analytics")
    public ResponseEntity<Map<String, Object>> dashboard(@AuthenticationPrincipal AuthUser user, @RequestParam(value = "days", defaultValue = "30") int days) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(analytics.dashboard(user.email(), days));
    }

    private static String text(JsonNode n, String field) {
        return n.hasNonNull(field) && n.get(field).isTextual() ? n.get(field).asText() : null;
    }
}
