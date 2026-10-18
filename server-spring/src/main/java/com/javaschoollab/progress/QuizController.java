package com.javaschoollab.progress;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.auth.ApiException;
import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Graded quiz attempts. Every attempt is stored, not just passes, so weak modules surface and improvement shows. */
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    static final int PASS_PERCENTAGE = 70;

    private final ProgressRepository repo;

    public QuizController(ProgressRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/attempts")
    public ResponseEntity<Map<String, Object>> record(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        JsonNode courseId = body.get("courseId"), moduleId = body.get("moduleId"), score = body.get("score"), totalQuestions = body.get("totalQuestions");
        if (!ProgressController.truthy(courseId) || !ProgressController.truthy(moduleId)
                || score == null || !ProgressController.truthy(totalQuestions)) {
            throw ApiException.badRequest("courseId, moduleId, score and totalQuestions are required");
        }
        double totalRaw = ProgressController.number(totalQuestions);
        double scoreRaw = ProgressController.number(score);
        if (!Double.isFinite(totalRaw) || !Double.isFinite(scoreRaw)) {
            throw ApiException.badRequest("score and totalQuestions must be numbers");
        }
        long total = Math.max(1, Math.round(totalRaw));
        long got = Math.max(0, Math.min(Math.round(scoreRaw), total));
        // Recomputed here rather than trusted from the client, so the stored percentage and pass flag always agree with the stored score.
        int percentage = (int) Math.round(got * 100.0 / total);
        boolean passed = percentage >= PASS_PERCENTAGE;

        String moduleName = ProgressController.truthy(body.get("moduleName")) ? body.get("moduleName").asText() : moduleId.asText();
        long id = repo.insertAttempt(user.id(), courseId.asText(), moduleId.asText(), moduleName, (int) got, (int) total, percentage, passed);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", id);
        out.put("percentage", percentage);
        out.put("passed", passed);
        return ResponseEntity.status(HttpStatus.CREATED).body(out);
    }

    @GetMapping("/attempts")
    public List<Map<String, Object>> list(@AuthenticationPrincipal AuthUser user) {
        return repo.recentAttempts(user.id()).stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("courseId", a.courseId());
            m.put("moduleId", a.moduleId());
            m.put("moduleName", a.moduleName());
            m.put("score", a.score());
            m.put("totalQuestions", a.totalQuestions());
            m.put("percentage", a.percentage());
            m.put("passed", a.passed());
            m.put("attemptedAt", a.attemptedAt());
            return m;
        }).toList();
    }
}
