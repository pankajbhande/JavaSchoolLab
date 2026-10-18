package com.javaschoollab.quiz;

import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** The spaced-review queue. It lives under /api/progress/review for the front end, but it is built from quiz attempts. */
@RestController
public class ReviewController {

    private final QuizService quiz;

    public ReviewController(QuizService quiz) {
        this.quiz = quiz;
    }

    @GetMapping("/api/progress/review")
    public List<Map<String, Object>> review(@AuthenticationPrincipal AuthUser user) {
        return quiz.reviewQueue(user.id()).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("courseId", r.courseId());
            m.put("moduleId", r.moduleId());
            m.put("moduleName", r.moduleName());
            m.put("best", r.best());
            m.put("everPassed", r.everPassed());
            m.put("attempts", r.attempts());
            m.put("intervalDays", r.intervalDays());
            m.put("daysSince", r.daysSince());
            m.put("due", true);
            return m;
        }).toList();
    }
}
