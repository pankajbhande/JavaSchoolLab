package com.javaschoollab.progress;

import com.javaschoollab.quiz.PassedModule;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Everything the dashboard needs, already derived from stored rows.
 *
 * @param studiedDates newest first, at most 60
 * @param studyDays    newest first, at most 371 (about a year, for the heatmap and the weekly goal)
 * @param resume       the most recently opened topic, or null
 */
public record ProgressSummary(int xp, int currentStreak, int longestStreak, StreakFreeze streakFreeze,
                              boolean studiedToday, boolean streakAtRisk, int topicsSeen, int modulesPassed,
                              int studySecondsToday, long studySecondsTotal, List<LocalDate> studiedDates,
                              List<StudyDay> studyDays, Integer weeklyGoalMinutes, Map<String, Integer> byCourse,
                              List<PassedModule> passedModules, TopicRef resume) {

    /** One missed day per Monday-week is forgiven automatically; usedDates lists at most the 3 newest. */
    public record StreakFreeze(boolean available, List<LocalDate> usedDates) {}
}
