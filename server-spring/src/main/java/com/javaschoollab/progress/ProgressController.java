package com.javaschoollab.progress;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.security.AuthUser;
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

/** Learning progress over HTTP. Same URLs, bodies, limits and messages as the Node server; the rules live in {@link ProgressService}. */
@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progress;

    public ProgressController(ProgressService progress) {
        this.progress = progress;
    }

    /** A topic was opened. */
    @PostMapping("/topic")
    public ResponseEntity<Map<String, Object>> topic(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        progress.recordTopic(user.id(), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true));
    }

    @PostMapping("/import")
    public Map<String, Object> importTopics(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        return Map.of("imported", progress.importTopics(user.id(), body));
    }

    @PostMapping("/study")
    public Map<String, Object> study(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        return Map.of("ok", true, "added", progress.addStudy(user.id(), body));
    }

    @GetMapping("/summary")
    public Map<String, Object> summary(@AuthenticationPrincipal AuthUser user) {
        ProgressSummary s = progress.summary(user.id());
        Map<String, Object> freeze = new LinkedHashMap<>();
        freeze.put("available", s.streakFreeze().available());
        freeze.put("usedDates", s.streakFreeze().usedDates().stream().map(Object::toString).toList());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("xp", s.xp());
        out.put("currentStreak", s.currentStreak());
        out.put("longestStreak", s.longestStreak());
        out.put("streakFreeze", freeze);
        out.put("studiedToday", s.studiedToday());
        out.put("streakAtRisk", s.streakAtRisk());
        out.put("topicsSeen", s.topicsSeen());
        out.put("modulesPassed", s.modulesPassed());
        out.put("studySecondsToday", s.studySecondsToday());
        out.put("studySecondsTotal", s.studySecondsTotal());
        out.put("studiedDates", s.studiedDates().stream().map(Object::toString).toList());
        out.put("studyDays", s.studyDays().stream().map(d -> Map.of("date", d.date().toString(), "seconds", d.seconds())).toList());
        out.put("weeklyGoalMinutes", s.weeklyGoalMinutes());
        out.put("byCourse", s.byCourse());
        out.put("passedModules", s.passedModules().stream()
                .map(p -> Map.of("courseId", p.courseId(), "moduleId", p.moduleId(), "best", p.best())).toList());
        out.put("resume", s.resume() == null ? null
                : Map.of("courseId", s.resume().courseId(), "moduleId", s.resume().moduleId(), "topicId", s.resume().topicId()));
        return out;
    }

    @PutMapping("/goal")
    public ResponseEntity<Map<String, Object>> goal(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        Integer minutes = progress.setGoal(user.id(), body);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("weeklyGoalMinutes", minutes);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(out);
    }

    @GetMapping("/topics")
    public List<Map<String, String>> topics(@AuthenticationPrincipal AuthUser user) {
        return progress.visitedTopics(user.id()).stream()
                .map(t -> Map.of("courseId", t.courseId(), "moduleId", t.moduleId(), "topicId", t.topicId())).toList();
    }
}
