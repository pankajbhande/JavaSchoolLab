package com.javaschoollab.progress;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.auth.ApiException;
import com.javaschoollab.progress.ProgressRepository.PassedModule;
import com.javaschoollab.progress.ProgressRepository.StudyDay;
import com.javaschoollab.progress.ProgressRepository.TopicRef;
import com.javaschoollab.security.AuthUser;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Learning progress. Same URLs, bodies, limits and messages as the Node server. XP and streaks are derived
 * here from stored rows, never accepted from the browser, so a client cannot inflate them.
 */
@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    static final int GOAL_MIN_MINUTES = 10;
    static final int GOAL_MAX_MINUTES = 1680;   // 28 hours: more than a week can reasonably hold
    static final int IMPORT_BATCH_LIMIT = 1000;
    static final int MAX_STUDY_SECONDS_PER_CALL = 900;

    private final ProgressRepository repo;

    public ProgressController(ProgressRepository repo) {
        this.repo = repo;
    }

    /** A topic was opened. */
    @PostMapping("/topic")
    public ResponseEntity<Map<String, Object>> topic(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        if (!truthy(body.get("courseId")) || !truthy(body.get("moduleId")) || !truthy(body.get("topicId"))) {
            throw ApiException.badRequest("courseId, moduleId and topicId are required");
        }
        repo.recordTopic(user.id(), body.get("courseId").asText(), body.get("moduleId").asText(), body.get("topicId").asText());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true));
    }

    /** Used once when a guest signs in and their localStorage history is adopted. Capped so a hostile client can't push an unbounded insert. */
    @PostMapping("/import")
    public Map<String, Object> importTopics(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        JsonNode topics = body.get("topics");
        if (topics == null || !topics.isArray() || topics.isEmpty()) return Map.of("imported", 0);
        List<TopicRef> batch = new ArrayList<>();
        for (JsonNode t : topics) {
            if (batch.size() >= IMPORT_BATCH_LIMIT) break;
            if (t != null && t.isObject() && truthy(t.get("courseId")) && truthy(t.get("moduleId")) && truthy(t.get("topicId"))) {
                batch.add(new TopicRef(t.get("courseId").asText(), t.get("moduleId").asText(), t.get("topicId").asText()));
            }
        }
        if (batch.isEmpty()) return Map.of("imported", 0);
        repo.importTopics(user.id(), batch);
        return Map.of("imported", batch.size());
    }

    /** Adds studied seconds to today. Clamped: this runs on a timer, so a tab left open or a replayed request can't manufacture a big number. */
    @PostMapping("/study")
    public Map<String, Object> study(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        int seconds = 0;
        JsonNode raw = body.get("seconds");
        if (raw != null && !raw.isNull()) {
            double v = number(raw);
            if (Double.isFinite(v)) seconds = (int) Math.max(0, Math.min(Math.round(v), MAX_STUDY_SECONDS_PER_CALL));
        }
        if (seconds == 0) return Map.of("ok", true, "added", 0);
        repo.addStudySeconds(user.id(), LocalDate.now(), seconds);
        return Map.of("ok", true, "added", seconds);
    }

    /** Everything the dashboard needs in one round trip. */
    @GetMapping("/summary")
    public Map<String, Object> summary(@AuthenticationPrincipal AuthUser user) {
        long uid = user.id();
        List<StudyDay> days = repo.studyDays(uid);                 // newest first
        List<PassedModule> passed = repo.passedModules(uid);
        int topicsSeen = repo.countTopics(uid);

        // A streak stays alive if the most recent studied day is today or yesterday; counting only from today
        // would break every streak the moment midnight passed.
        LocalDate today = LocalDate.now();
        var streak = ProgressMath.computeStreakInfo(days.stream().map(StudyDay::date).toList(), today);

        int todaySeconds = days.stream().filter(d -> d.date().equals(today)).mapToInt(StudyDay::seconds).findFirst().orElse(0);
        long totalSeconds = days.stream().mapToLong(StudyDay::seconds).sum();

        Map<String, Object> freeze = new LinkedHashMap<>();
        freeze.put("available", streak.freezeAvailable());
        freeze.put("usedDates", streak.freezeUsedDates().stream().limit(3).map(LocalDate::toString).toList());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("xp", ProgressMath.computeXp(topicsSeen, passed.size(), days.size()));
        out.put("currentStreak", streak.currentStreak());
        out.put("longestStreak", streak.longestStreak());
        out.put("streakFreeze", freeze);                           // one missed day per Monday-week is forgiven automatically
        out.put("studiedToday", streak.studiedToday());
        out.put("streakAtRisk", streak.atRisk());
        out.put("topicsSeen", topicsSeen);
        out.put("modulesPassed", passed.size());
        out.put("studySecondsToday", todaySeconds);
        out.put("studySecondsTotal", totalSeconds);
        out.put("studiedDates", days.stream().limit(60).map(d -> d.date().toString()).toList());
        // About a year of per-day seconds, newest first, for the activity heatmap and the weekly goal.
        out.put("studyDays", days.stream().limit(371).map(d -> Map.of("date", d.date().toString(), "seconds", d.seconds())).toList());
        out.put("weeklyGoalMinutes", repo.weeklyGoal(uid));
        out.put("byCourse", repo.topicsByCourse(uid));
        out.put("passedModules", passed.stream()
                .map(p -> Map.of("courseId", p.courseId(), "moduleId", p.moduleId(), "best", p.best())).toList());
        out.put("resume", repo.mostRecentTopic(uid)
                .map(t -> Map.of("courseId", t.courseId(), "moduleId", t.moduleId(), "topicId", t.topicId()))
                .orElse(null));
        return out;
    }

    /** Weekly study goal in minutes. null (or 0) clears it; anything else is bounded so a typo can't store nonsense. */
    @PutMapping("/goal")
    public ResponseEntity<Map<String, Object>> goal(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        JsonNode raw = body.get("minutes");
        Integer minutes = null;
        boolean clear = raw != null && (raw.isNull() || (raw.isNumber() && raw.asDouble() == 0));
        if (!clear) {
            double v = raw == null ? Double.NaN : number(raw);
            if (!Double.isFinite(v) || v != Math.rint(v) || v < GOAL_MIN_MINUTES || v > GOAL_MAX_MINUTES) {
                throw ApiException.badRequest("Choose a goal between " + GOAL_MIN_MINUTES + " minutes and "
                        + (GOAL_MAX_MINUTES / 60) + " hours a week");
            }
            minutes = (int) v;
        }
        repo.setWeeklyGoal(user.id(), minutes);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("weeklyGoalMinutes", minutes);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(out);
    }

    /** Full visited-topic list, used to paint completion ticks in the sidebar. */
    @GetMapping("/topics")
    public List<Map<String, String>> topics(@AuthenticationPrincipal AuthUser user) {
        return repo.allTopics(user.id()).stream()
                .map(t -> Map.of("courseId", t.courseId(), "moduleId", t.moduleId(), "topicId", t.topicId())).toList();
    }

    /**
     * Modules due for review: the cheapest useful spaced repetition. The weaker the best score, the sooner it
     * comes back; a never-passed module is always due. Weakest first.
     */
    @GetMapping("/review")
    public List<Map<String, Object>> review(@AuthenticationPrincipal AuthUser user) {
        Instant now = Instant.now();
        record Due(Map<String, Object> json, boolean everPassed, int best) {}
        List<Due> due = new ArrayList<>();
        for (var r : repo.reviewRows(user.id())) {
            double ageDays = (now.toEpochMilli() - r.lastAttempt().toEpochMilli()) / 86_400_000.0;
            if (!ProgressMath.isDue(r.everPassed(), r.best(), ageDays)) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("courseId", r.courseId());
            m.put("moduleId", r.moduleId());
            m.put("moduleName", r.moduleName());
            m.put("best", r.best());
            m.put("everPassed", r.everPassed());
            m.put("attempts", r.attempts());
            m.put("intervalDays", ProgressMath.reviewIntervalDays(r.best()));
            m.put("daysSince", (long) Math.floor(ageDays));
            m.put("due", true);
            due.add(new Due(m, r.everPassed(), r.best()));
        }
        // Weakest first, and never-passed ahead of passed: that is where another attempt is worth the most.
        due.sort(Comparator.<Due, Boolean>comparing(Due::everPassed).thenComparingInt(Due::best));
        return due.stream().map(Due::json).toList();
    }

    // ---------- JSON helpers (the same truthiness the Node code relied on) ----------

    /** JS-style truthiness for a request field: missing, null, "", 0 and false are all "not provided". */
    static boolean truthy(JsonNode n) {
        if (n == null || n.isNull() || n.isMissingNode()) return false;
        if (n.isTextual()) return !n.asText().isEmpty();
        if (n.isNumber()) return n.asDouble() != 0;
        if (n.isBoolean()) return n.asBoolean();
        return true;
    }

    /** Number(value) for a JSON scalar: numbers as-is, numeric text parsed, anything else NaN. */
    static double number(JsonNode n) {
        if (n.isNumber()) return n.asDouble();
        if (n.isTextual()) {
            try {
                return Double.parseDouble(n.asText().trim());
            } catch (NumberFormatException e) {
                return Double.NaN;
            }
        }
        return Double.NaN;
    }
}
