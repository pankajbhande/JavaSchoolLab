package com.javaschoollab.quiz;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.common.JsonInput;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** The quiz service: graded attempts and what they say about a learner. */
@Service
public class QuizService {

    static final int PASS_PERCENTAGE = 70;
    /** No real test is longer; a bigger number would overflow the INT column and is a sign of a hand-made request. */
    static final int MAX_QUESTIONS = 1000;

    private final QuizRepository repo;

    public QuizService(QuizRepository repo) {
        this.repo = repo;
    }

    /** Validates and stores one attempt. The body needs courseId, moduleId, score and totalQuestions; moduleName is optional. */
    public AttemptResult recordAttempt(long userId, JsonNode body) {
        JsonNode courseId = body.get("courseId"), moduleId = body.get("moduleId"), score = body.get("score"), totalQuestions = body.get("totalQuestions");
        if (!JsonInput.truthy(courseId) || !JsonInput.truthy(moduleId)
                || score == null || !JsonInput.truthy(totalQuestions)) {
            throw ApiException.badRequest("courseId, moduleId, score and totalQuestions are required");
        }
        double totalRaw = JsonInput.number(totalQuestions);
        double scoreRaw = JsonInput.number(score);
        if (!Double.isFinite(totalRaw) || !Double.isFinite(scoreRaw)) {
            throw ApiException.badRequest("score and totalQuestions must be numbers");
        }
        if (totalRaw > MAX_QUESTIONS) throw ApiException.badRequest("totalQuestions must be at most " + MAX_QUESTIONS);
        long total = Math.max(1, Math.round(totalRaw));
        long got = Math.max(0, Math.min(Math.round(scoreRaw), total));
        // Recomputed here rather than trusted from the client, so the stored percentage and pass flag always agree with the stored score.
        int percentage = (int) Math.round(got * 100.0 / total);
        boolean passed = percentage >= PASS_PERCENTAGE;

        String course = JsonInput.bounded(courseId, "courseId", 120);
        String module = JsonInput.bounded(moduleId, "moduleId", 120);
        String moduleName = JsonInput.truthy(body.get("moduleName")) ? JsonInput.bounded(body.get("moduleName"), "moduleName", 150) : module;
        long id = repo.insertAttempt(userId, course, module, moduleName, (int) got, (int) total, percentage, passed);
        return new AttemptResult(id, percentage, passed);
    }

    /** The learner's latest attempts, newest first. */
    public List<QuizAttempt> recentAttempts(long userId) {
        return repo.recentAttempts(userId);
    }

    /** Modules the learner has passed, with their best percentage. */
    public List<PassedModule> passedModules(long userId) {
        return repo.passedModules(userId);
    }

    /** The best passing attempt at a module, matched by module name. */
    public Optional<BestScore> bestPassedAttempt(long userId, String moduleName) {
        return repo.bestPassedAttempt(userId, moduleName);
    }

    public List<ReviewRow> reviewRows(long userId) {
        return repo.reviewRows(userId);
    }

    /**
     * Modules due for review: the cheapest useful spaced repetition. The weaker the best score, the sooner it
     * comes back; a never-passed module is always due. Weakest first.
     */
    public List<ReviewItem> reviewQueue(long userId) {
        Instant now = Instant.now();
        List<ReviewItem> due = new ArrayList<>();
        for (var r : repo.reviewRows(userId)) {
            double ageDays = (now.toEpochMilli() - r.lastAttempt().toEpochMilli()) / 86_400_000.0;
            if (!ReviewSchedule.isDue(r.everPassed(), r.best(), ageDays)) continue;
            due.add(new ReviewItem(r.courseId(), r.moduleId(), r.moduleName(), r.best(), r.everPassed(), r.attempts(),
                    ReviewSchedule.reviewIntervalDays(r.best()), (long) Math.floor(ageDays)));
        }
        // Weakest first, and never-passed ahead of passed: that is where another attempt is worth the most.
        due.sort(Comparator.<ReviewItem, Boolean>comparing(ReviewItem::everPassed).thenComparingInt(ReviewItem::best));
        return due;
    }
}
