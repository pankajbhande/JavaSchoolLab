package com.javaschoollab.profile;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.RateLimiter;
import com.javaschoollab.common.RateLimiters;
import com.javaschoollab.config.AppProperties;
import com.javaschoollab.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import java.util.OptionalLong;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Opt-in public learner profiles. A learner publishes nothing until they switch it on; the public route returns only
 * the sections they chose (see {@link PublicProfileService}). Same URLs, rules and messages as the Node server.
 */
@RestController
public class PublicProfileController {

    private static final Map<String, Object> NOT_FOUND = Map.of("error", "Profile not found");

    private final PublicProfileService profiles;
    private final RateLimiter profileLimiter;
    private final RateLimiter handleLimiter;

    public PublicProfileController(PublicProfileService profiles, AppProperties props, RateLimiters limiters) {
        this.profiles = profiles;
        this.profileLimiter = limiters.perMinute("profile", props.rateLimit().profilePerMinute());
        this.handleLimiter = limiters.perMinute("handle", props.rateLimit().handleCheckPerMinute());
    }

    /** GET /api/profiles/{handle}: one body for "no such handle" and "not published", so it can't reveal which handles exist. */
    @GetMapping("/api/profiles/{handle}")
    public ResponseEntity<Map<String, Object>> publicProfile(@PathVariable String handle, HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> limited = tooMany(profileLimiter, request);
        if (limited != null) return limited;

        return profiles.publicProfile(handle)
                .map(body -> ResponseEntity.ok()
                        .cacheControl(CacheControl.maxAge(Duration.ofSeconds(10)).cachePublic())
                        .body(body))
                .orElseGet(PublicProfileController::notFound);
    }

    private static ResponseEntity<Map<String, Object>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).cacheControl(CacheControl.noStore()).body(NOT_FOUND);
    }

    /** My current settings (everything off when I have never configured a profile). */
    @GetMapping("/api/profile/settings")
    public ResponseEntity<Map<String, Object>> settings(@AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(profiles.settings(user.id()));
    }

    /** Is this handle free? My own current handle counts as free. */
    @GetMapping("/api/profile/handle-available")
    public ResponseEntity<Map<String, Object>> handleAvailable(@AuthenticationPrincipal AuthUser user,
                                                              @RequestParam(required = false) String handle,
                                                              HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> limited = tooMany(handleLimiter, request);
        if (limited != null) return limited;
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(profiles.handleAvailable(user.id(), handle));
    }

    /** Update my settings. Only the fields sent change. Publishing needs a valid, free handle. */
    @PutMapping("/api/profile/settings")
    public ResponseEntity<Map<String, Object>> update(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(profiles.update(user.id(), body));
    }

    private static ResponseEntity<Map<String, Object>> tooMany(RateLimiter limiter, HttpServletRequest request) {
        OptionalLong wait = limiter.check(request.getRemoteAddr());
        if (wait.isEmpty()) return null;
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(wait.getAsLong()))
                .body(Map.<String, Object>of("error", "Too many requests. Please wait a minute and try again."));
    }
}
