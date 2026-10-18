package com.javaschoollab.profile;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.auth.ApiException;
import com.javaschoollab.certificate.RateLimiter;
import com.javaschoollab.config.AppProperties;
import com.javaschoollab.profile.ProfileSettingsRepository.PublishedProfile;
import com.javaschoollab.profile.PublicProfiles.Cert;
import com.javaschoollab.progress.ProgressMath;
import com.javaschoollab.progress.ProgressRepository;
import com.javaschoollab.progress.ProgressRepository.StudyDay;
import com.javaschoollab.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalLong;
import org.springframework.dao.DuplicateKeyException;
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
 * the sections they chose, built by {@link PublicProfiles#build}. Same URLs, rules and messages as the Node server.
 */
@RestController
public class PublicProfileController {

    private static final Map<String, Object> NOT_FOUND = Map.of("error", "Profile not found");

    private final ProfileSettingsRepository repo;
    private final ProgressRepository progress;
    private final RateLimiter profileLimiter;
    private final RateLimiter handleLimiter;

    public PublicProfileController(ProfileSettingsRepository repo, ProgressRepository progress, AppProperties props) {
        this.repo = repo;
        this.progress = progress;
        this.profileLimiter = new RateLimiter(Duration.ofMinutes(1), props.rateLimit().profilePerMinute(), Clock.systemUTC());
        this.handleLimiter = new RateLimiter(Duration.ofMinutes(1), props.rateLimit().handleCheckPerMinute(), Clock.systemUTC());
    }

    // ---------- public ----------

    /** GET /api/profiles/{handle}: one body for "no such handle" and "not published", so it can't reveal which handles exist. */
    @GetMapping("/api/profiles/{handle}")
    public ResponseEntity<Map<String, Object>> publicProfile(@PathVariable String handle, HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> limited = tooMany(profileLimiter, request);
        if (limited != null) return limited;

        String h = ProfileRules.normalizeHandle(handle);
        if (ProfileRules.handleError(h) != null) return notFound();
        var found = repo.published(h);
        if (found.isEmpty()) return notFound();

        PublishedProfile pp = found.get();
        var profile = pp.profile();
        long uid = pp.userId();
        boolean needActivity = profile.showStats() || profile.showBadges();

        List<Cert> certs = profile.showCertificates() || profile.showBadges() ? repo.certificatesOf(uid) : List.of();
        Map<String, Integer> byCourse = profile.showProgress() || needActivity ? progress.topicsByCourse(uid) : Map.of();
        PublicProfiles.Stats stats = null;
        ProfileRules.BadgeInput badgeInput = null;
        if (needActivity) {
            List<StudyDay> days = progress.studyDays(uid);
            var streak = ProgressMath.computeStreakInfo(days.stream().map(StudyDay::date).toList(), LocalDate.now());
            int topicsSeen = byCourse.values().stream().mapToInt(Integer::intValue).sum();
            int modulesPassed = progress.passedModules(uid).size();
            long totalSeconds = days.stream().mapToLong(StudyDay::seconds).sum();
            stats = new PublicProfiles.Stats(ProgressMath.computeXp(topicsSeen, modulesPassed, days.size()),
                    streak.currentStreak(), streak.longestStreak(), topicsSeen, modulesPassed, days.size(), totalSeconds);
            badgeInput = new ProfileRules.BadgeInput(topicsSeen, streak.longestStreak(), modulesPassed, totalSeconds, certs.size());
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofSeconds(10)).cachePublic())
                .body(PublicProfiles.build(profile, new PublicProfiles.Data(certs, stats, badgeInput, byCourse)));
    }

    private static ResponseEntity<Map<String, Object>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).cacheControl(CacheControl.noStore()).body(NOT_FOUND);
    }

    // ---------- mine ----------

    /** My current settings (everything off when I have never configured a profile). */
    @GetMapping("/api/profile/settings")
    public ResponseEntity<Map<String, Object>> settings(@AuthenticationPrincipal AuthUser user) {
        var s = repo.settingsOf(user.id()).orElse(ProfileRules.Settings.none());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(s.toJson());
    }

    /** Is this handle free? My own current handle counts as free. */
    @GetMapping("/api/profile/handle-available")
    public ResponseEntity<Map<String, Object>> handleAvailable(@AuthenticationPrincipal AuthUser user,
                                                              @RequestParam(required = false) String handle,
                                                              HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> limited = tooMany(handleLimiter, request);
        if (limited != null) return limited;

        String h = ProfileRules.normalizeHandle(handle);
        String problem = ProfileRules.handleError(h);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("handle", h);
        if (problem != null) {
            out.put("available", false);
            out.put("reason", problem);
        } else {
            boolean taken = repo.ownerOfHandle(h).filter(owner -> owner != user.id()).isPresent();
            out.put("available", !taken);
            out.put("reason", taken ? "That handle is already taken" : null);
        }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(out);
    }

    /** Update my settings. Only the fields sent change. Publishing needs a valid, free handle. */
    @PutMapping("/api/profile/settings")
    public ResponseEntity<Map<String, Object>> update(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        var cur = repo.settingsOf(user.id()).orElse(ProfileRules.Settings.none());
        var next = new ProfileRules.Settings(
                flag(body, "isPublic", cur.isPublic()),
                body.has("handle") ? ProfileRules.normalizeHandle(textOrNull(body.get("handle"))) : cur.handle(),
                body.has("displayName") ? ProfileRules.cleanDisplayName(textOrNull(body.get("displayName"))) : cur.displayName(),
                body.has("bio") ? ProfileRules.cleanBio(textOrNull(body.get("bio"))) : cur.bio(),
                flag(body, "showCertificates", cur.showCertificates()),
                flag(body, "showStats", cur.showStats()),
                flag(body, "showBadges", cur.showBadges()),
                flag(body, "showProgress", cur.showProgress()));

        if (!next.bio().isEmpty()) {
            String e = ProfileRules.bioError(next.bio());
            if (e != null) throw ApiException.badRequest(e);
        }
        if (next.displayName().length() > ProfileRules.DISPLAY_NAME_MAX) {
            throw ApiException.badRequest("Display name must be " + ProfileRules.DISPLAY_NAME_MAX + " characters or fewer");
        }
        if (next.isPublic() || !next.handle().isEmpty()) {
            String e = ProfileRules.handleError(next.handle());
            if (e != null) throw ApiException.badRequest(e);
        }
        try {
            repo.save(user.id(), next);
        } catch (DuplicateKeyException taken) {
            throw ApiException.conflict("That handle is already taken");
        }
        var saved = repo.settingsOf(user.id()).orElse(ProfileRules.Settings.none());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(saved.toJson());
    }

    // ---------- helpers ----------

    /** A flag that is absent keeps its current value; one that is present must be a real true/false. */
    private static boolean flag(JsonNode body, String key, boolean current) {
        if (!body.has(key)) return current;
        JsonNode n = body.get(key);
        if (!n.isBoolean()) throw ApiException.badRequest(key + " must be true or false");
        return n.asBoolean();
    }

    /** The JSON string value, or null for anything that is not a string (the rules turn that into ""). */
    private static Object textOrNull(JsonNode n) {
        return n != null && n.isTextual() ? n.asText() : null;
    }

    private static ResponseEntity<Map<String, Object>> tooMany(RateLimiter limiter, HttpServletRequest request) {
        OptionalLong wait = limiter.check(request.getRemoteAddr());
        if (wait.isEmpty()) return null;
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(wait.getAsLong()))
                .body(Map.<String, Object>of("error", "Too many requests. Please wait a minute and try again."));
    }
}
