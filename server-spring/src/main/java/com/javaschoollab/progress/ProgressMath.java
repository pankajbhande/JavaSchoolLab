package com.javaschoollab.progress;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Streaks, XP and review timing. A direct port of server/lib/progress.js: same rules, same boundaries,
 * and pure functions of their arguments so they can be tested without a database or a clock.
 */
public final class ProgressMath {

    public static final int XP_PER_TOPIC = 10;
    public static final int XP_PER_MODULE_PASSED = 50;
    public static final int XP_PER_STUDY_DAY = 5;

    private ProgressMath() {}

    /**
     * @param freezeUsedDates missed days the current streak survived thanks to a freeze, newest first
     * @param freezeAvailable this week's freeze is still unspent
     * @param atRisk          there is a live streak and nothing has been studied yet today
     */
    public record StreakInfo(int currentStreak, int longestStreak, List<LocalDate> freezeUsedDates,
                             boolean freezeAvailable, boolean studiedToday, boolean atRisk) {}

    /** Whole days from a to b. Positive when b is later. */
    public static long daysBetween(LocalDate a, LocalDate b) {
        return ChronoUnit.DAYS.between(a, b);
    }

    /** The Monday of the week containing d; a freeze is an allowance per Monday-week. */
    public static LocalDate mondayOf(LocalDate d) {
        return d.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    /**
     * Streaks with the weekly streak freeze.
     *
     * Every learner gets ONE freeze per Monday-to-Sunday week, applied automatically: a single missed day
     * between two studied days (or between the last studied day and today) is bridged instead of ending the
     * streak, if that week's freeze is unspent. A bridged day keeps the streak alive but adds nothing to its
     * length. Nothing extra is stored: freezes are re-derived from the study days on every call. Bridges are
     * assigned newest-first, so the current streak gets first claim on a week's freeze.
     */
    public static StreakInfo computeStreakInfo(Collection<LocalDate> days, LocalDate today) {
        List<LocalDate> dates = days.stream().distinct().sorted(Comparator.reverseOrder()).toList(); // newest first
        if (dates.isEmpty()) return new StreakInfo(0, 0, List.of(), true, false, false);

        Set<LocalDate> usedWeeks = new HashSet<>();
        List<LocalDate> frozen = new ArrayList<>();
        boolean studiedToday = dates.get(0).equals(today);

        // Is the streak still alive as of today?
        long gapToday = daysBetween(dates.get(0), today);
        boolean currentActive = gapToday <= 1;
        if (!currentActive && gapToday == 2) {
            LocalDate yesterday = today.minusDays(1);
            if (tryFreeze(usedWeeks, yesterday)) {
                currentActive = true;
                frozen.add(yesterday);
            }
        }

        int currentStreak = 0;
        int longestStreak = 0;
        int run = 1;
        for (int i = 1; i < dates.size(); i++) {
            long gap = daysBetween(dates.get(i), dates.get(i - 1));
            LocalDate missed = dates.get(i).plusDays(1);
            if (gap == 1) {
                run++;
            } else if (gap == 2 && tryFreeze(usedWeeks, missed)) {
                if (currentActive) frozen.add(missed);
                run++;
            } else {
                longestStreak = Math.max(longestStreak, run);
                if (currentActive) {
                    currentStreak = run;
                    currentActive = false;
                }
                run = 1;
            }
        }
        longestStreak = Math.max(longestStreak, run);   // close the final run
        if (currentActive) currentStreak = run;

        return new StreakInfo(currentStreak, longestStreak, frozen, !usedWeeks.contains(mondayOf(today)),
                studiedToday, !studiedToday && currentStreak > 0);
    }

    private static boolean tryFreeze(Set<LocalDate> usedWeeks, LocalDate missed) {
        return usedWeeks.add(mondayOf(missed));   // false when that week's freeze is already spent
    }

    /** XP is recomputed from source rows on every request, never stored, so it cannot drift or be inflated. */
    public static int computeXp(int topicsSeen, int modulesPassed, int studyDays) {
        return topicsSeen * XP_PER_TOPIC + modulesPassed * XP_PER_MODULE_PASSED + studyDays * XP_PER_STUDY_DAY;
    }

    /** Review interval by best score: nearly perfect comes back in three weeks, scraped through comes back tomorrow. */
    public static int reviewIntervalDays(double bestPercentage) {
        if (bestPercentage < 70) return 1;
        if (bestPercentage < 85) return 3;
        if (bestPercentage < 95) return 7;
        return 21;
    }

    /** A module is due if it was never passed, or its interval has elapsed. */
    public static boolean isDue(boolean everPassed, double best, double daysSinceLastAttempt) {
        if (!everPassed) return true;
        return daysSinceLastAttempt >= reviewIntervalDays(best);
    }
}
