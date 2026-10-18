package com.javaschoollab.quiz;

import com.fasterxml.jackson.databind.JsonNode;
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

/** Graded quiz attempts over HTTP. Every attempt is stored, not just passes, so weak modules surface and improvement shows. */
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quiz;

    public QuizController(QuizService quiz) {
        this.quiz = quiz;
    }

    @PostMapping("/attempts")
    public ResponseEntity<Map<String, Object>> record(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        AttemptResult result = quiz.recordAttempt(user.id(), body);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", result.id());
        out.put("percentage", result.percentage());
        out.put("passed", result.passed());
        return ResponseEntity.status(HttpStatus.CREATED).body(out);
    }

    @GetMapping("/attempts")
    public List<Map<String, Object>> list(@AuthenticationPrincipal AuthUser user) {
        return quiz.recentAttempts(user.id()).stream().map(a -> {
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
