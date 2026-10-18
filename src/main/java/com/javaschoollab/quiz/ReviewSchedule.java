package com.javaschoollab.quiz;

/** Spaced-review timing: pure functions of their arguments, so they can be tested without a database or a clock. */
public final class ReviewSchedule {

    private ReviewSchedule() {}

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
