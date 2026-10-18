package com.javaschoollab.progress;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.common.JsonInput;
import com.javaschoollab.quiz.PassedModule;
import com.javaschoollab.quiz.QuizService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * The learning-progress service: topics opened, study time, the weekly goal and the dashboard summary.
 * XP and streaks are derived here from stored rows, never accepted from the browser, so a client cannot inflate them.
 */
@Service
public class ProgressService {

    static final int GOAL_MIN_MINUTES = 10;
    static final int GOAL_MAX_MINUTES = 1680;   // 28 hours: more than a week can reasonably hold
    static final int IMPORT_BATCH_LIMIT = 1000;
    static final int MAX_STUDY_SECONDS_PER_CALL = 900;

    private final ProgressRepository repo;
    private final QuizService quiz;

    public ProgressService(ProgressRepository repo, QuizService quiz) {
        this.repo = repo;
        this.quiz = quiz;
    }

    /** A topic was opened. The body needs courseId, moduleId and topicId. */
    public void recordTopic(long userId, JsonNode body) {
        if (!JsonInput.truthy(body.get("courseId")) || !JsonInput.truthy(body.get("moduleId")) || !JsonInput.truthy(body.get("topicId"))) {
            throw ApiException.badRequest("courseId, moduleId and topicId are required");
        }
        repo.recordTopic(userId, body.get("courseId").asText(), body.get("moduleId").asText(), body.get("topicId").asText());
    }

    /** Adopts a guest's localStorage history. Capped so a hostile client can't push an unbounded insert. Returns how many were imported. */
    public int importTopics(long userId, JsonNode body) {
        JsonNode topics = body.get("topics");
        if (topics == null || !topics.isArray() || topics.isEmpty()) return 0;
        List<TopicRef> batch = new ArrayList<>();
        for (JsonNode t : topics) {
            if (batch.size() >= IMPORT_BATCH_LIMIT) break;
            if (t != null && t.isObject() && JsonInput.truthy(t.get("courseId")) && JsonInput.truthy(t.get("moduleId")) && JsonInput.truthy(t.get("topicId"))) {
                batch.add(new TopicRef(t.get("courseId").asText(), t.get("moduleId").asText(), t.get("topicId").asText()));
            }
        }
        if (batch.isEmpty()) return 0;
        repo.importTopics(userId, batch);
        return batch.size();
    }

    /** Adds studied seconds to today and returns how many were added. Clamped: this runs on a timer, so a tab left open or a replayed request can't manufacture a big number. */
    public int addStudy(long userId, JsonNode body) {
        int seconds = 0;
        JsonNode raw = body.get("seconds");
        if (raw != null && !raw.isNull()) {
            double v = JsonInput.number(raw);
            if (Double.isFinite(v)) seconds = (int) Math.max(0, Math.min(Math.round(v), MAX_STUDY_SECONDS_PER_CALL));
        }
        if (seconds == 0) return 0;
        repo.addStudySeconds(userId, LocalDate.now(), seconds);
        return seconds;
    }

    /** Everything the dashboard needs in one round trip. */
    public ProgressSummary summary(long userId) {
        List<StudyDay> days = repo.studyDays(userId);                 // newest first
        List<PassedModule> passed = quiz.passedModules(userId);
        int topicsSeen = repo.countTopics(userId);

        // A streak stays alive if the most recent studied day is today or yesterday; counting only from today
        // would break every streak the moment midnight passed.
        LocalDate today = LocalDate.now();
        var streak = ProgressMath.computeStreakInfo(days.stream().map(StudyDay::date).toList(), today);

        int todaySeconds = days.stream().filter(d -> d.date().equals(today)).mapToInt(StudyDay::seconds).findFirst().orElse(0);
        long totalSeconds = days.stream().mapToLong(StudyDay::seconds).sum();

        return new ProgressSummary(
                computeXp(topicsSeen, passed.size(), days.size()),
                streak.currentStreak(),
                streak.longestStreak(),
                new ProgressSummary.StreakFreeze(streak.freezeAvailable(), streak.freezeUsedDates().stream().limit(3).toList()),
                streak.studiedToday(),
                streak.atRisk(),
                topicsSeen,
                passed.size(),
                todaySeconds,
                totalSeconds,
                days.stream().limit(60).map(StudyDay::date).toList(),
                days.stream().limit(371).toList(),
                repo.weeklyGoal(userId),
                repo.topicsByCourse(userId),
                passed,
                repo.mostRecentTopic(userId).orElse(null));
    }

    /** Weekly study goal in minutes. null (or 0) clears it; anything else is bounded so a typo can't store nonsense. Returns the stored value. */
    public Integer setGoal(long userId, JsonNode body) {
        JsonNode raw = body.get("minutes");
        Integer minutes = null;
        boolean clear = raw != null && (raw.isNull() || (raw.isNumber() && raw.asDouble() == 0));
        if (!clear) {
            double v = raw == null ? Double.NaN : JsonInput.number(raw);
            if (!Double.isFinite(v) || v != Math.rint(v) || v < GOAL_MIN_MINUTES || v > GOAL_MAX_MINUTES) {
                throw ApiException.badRequest("Choose a goal between " + GOAL_MIN_MINUTES + " minutes and "
                        + (GOAL_MAX_MINUTES / 60) + " hours a week");
            }
            minutes = (int) v;
        }
        repo.setWeeklyGoal(userId, minutes);
        return minutes;
    }

    /** Full visited-topic list, used to paint completion ticks in the sidebar. */
    public List<TopicRef> visitedTopics(long userId) {
        return repo.allTopics(userId);
    }

    /** XP from source rows (see {@link ProgressMath#computeXp}); lets other services rank learners without touching the maths class. */
    public int computeXp(int topicsSeen, int modulesPassed, int studyDays) {
        return ProgressMath.computeXp(topicsSeen, modulesPassed, studyDays);
    }

    /** Streaks with the weekly freeze, for the given studied days as of today. */
    public ProgressMath.StreakInfo streakInfo(java.util.Collection<java.time.LocalDate> days, java.time.LocalDate today) {
        return ProgressMath.computeStreakInfo(days, today);
    }

    /** Topics opened, counted per course. */
    public Map<String, Integer> topicsByCourse(long userId) {
        return repo.topicsByCourse(userId);
    }

    /** Newest first, at most 400 days. */
    public List<StudyDay> studyDays(long userId) {
        return repo.studyDays(userId);
    }
}
