package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;

import com.javaschoollab.progress.ProgressMath;
import com.javaschoollab.progress.ProgressMath.StreakInfo;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

/** The same cases as server/lib/progress.test.js, so the Java port provably behaves like the Node original. */
class ProgressMathTest {

    // 2026-08-24 is a Monday, so 24..30 Aug is one freeze week.
    private static List<LocalDate> days(String... iso) {
        return Arrays.stream(iso).map(LocalDate::parse).toList();
    }

    private static StreakInfo streak(String today, String... iso) {
        return ProgressMath.computeStreakInfo(days(iso), LocalDate.parse(today));
    }

    private static List<LocalDate> dates(String... iso) {
        return days(iso);
    }

    @Test
    void daysBetweenAndMonday() {
        assertThat(ProgressMath.daysBetween(LocalDate.parse("2026-08-26"), LocalDate.parse("2026-08-27"))).isEqualTo(1);
        assertThat(ProgressMath.daysBetween(LocalDate.parse("2026-08-27"), LocalDate.parse("2026-08-26"))).isEqualTo(-1);
        assertThat(ProgressMath.daysBetween(LocalDate.parse("2026-08-31"), LocalDate.parse("2026-09-01"))).isEqualTo(1);
        assertThat(ProgressMath.daysBetween(LocalDate.parse("2028-02-28"), LocalDate.parse("2028-03-01"))).isEqualTo(2); // leap day
        assertThat(ProgressMath.mondayOf(LocalDate.parse("2026-08-30"))).isEqualTo(LocalDate.parse("2026-08-24")); // Sunday
        assertThat(ProgressMath.mondayOf(LocalDate.parse("2026-08-24"))).isEqualTo(LocalDate.parse("2026-08-24"));
    }

    @Test
    void matchesThePlainStreakWhenNothingIsMissed() {
        var r = streak("2026-08-26", "2026-08-26", "2026-08-25", "2026-08-24");
        assertThat(r.currentStreak()).isEqualTo(3);
        assertThat(r.longestStreak()).isEqualTo(3);
        assertThat(r.freezeUsedDates()).isEmpty();
        assertThat(r.studiedToday()).isTrue();
        assertThat(r.atRisk()).isFalse();
    }

    @Test
    void isZeroAndNotAtRiskWithNoHistory() {
        var r = streak("2026-08-26");
        assertThat(r.currentStreak()).isZero();
        assertThat(r.atRisk()).isFalse();
        assertThat(r.freezeAvailable()).isTrue();
    }

    @Test
    void isAtRiskWhenTheLastStudyDayWasYesterday() {
        // Otherwise every streak would break at midnight, before the student could study.
        var r = streak("2026-08-26", "2026-08-25", "2026-08-24");
        assertThat(r.currentStreak()).isEqualTo(2);
        assertThat(r.studiedToday()).isFalse();
        assertThat(r.atRisk()).isTrue();
        assertThat(r.freezeAvailable()).isTrue();
    }

    @Test
    void bridgesOneMissedDayBetweenTwoStudiedDays() {
        var r = streak("2026-08-26", "2026-08-26", "2026-08-24", "2026-08-23");
        assertThat(r.currentStreak()).isEqualTo(3);                      // 26, 24, 23; the 25th is frozen, not counted
        assertThat(r.freezeUsedDates()).isEqualTo(dates("2026-08-25"));
        assertThat(r.freezeAvailable()).isFalse();
    }

    @Test
    void savesAStreakWhoseLastStudyDayWasTwoDaysAgo() {
        var r = streak("2026-08-26", "2026-08-24", "2026-08-23");
        assertThat(r.currentStreak()).isEqualTo(2);
        assertThat(r.freezeUsedDates()).isEqualTo(dates("2026-08-25"));
        assertThat(r.atRisk()).isTrue();
    }

    @Test
    void letsTheStreakDieAfterThreeDays() {
        var r = streak("2026-08-26", "2026-08-23", "2026-08-22");
        assertThat(r.currentStreak()).isZero();
        assertThat(r.longestStreak()).isEqualTo(2);                      // history still counts
        assertThat(r.atRisk()).isFalse();
    }

    @Test
    void allowsOnlyOneFreezePerMondayWeek() {
        // 28 and 26 are studied, 27 and 25 are missed, all in the week of Mon 24 Aug.
        var r = streak("2026-08-29", "2026-08-29", "2026-08-28", "2026-08-26", "2026-08-24");
        assertThat(r.currentStreak()).isEqualTo(3);                      // the newest gap (27th) takes the week's freeze
        assertThat(r.freezeUsedDates()).isEqualTo(dates("2026-08-27"));
    }

    @Test
    void givesEachWeekItsOwnFreeze() {
        var r = streak("2026-08-26", "2026-08-26", "2026-08-24", "2026-08-22");
        assertThat(r.currentStreak()).isEqualTo(3);
        assertThat(r.freezeUsedDates()).isEqualTo(dates("2026-08-25", "2026-08-23"));
    }

    @Test
    void neverBridgesTwoOrMoreMissedDays() {
        var r = streak("2026-08-26", "2026-08-26", "2026-08-22");
        assertThat(r.currentStreak()).isEqualTo(1);
        assertThat(r.freezeUsedDates()).isEmpty();
    }

    @Test
    void reportsTheLongestRunUsingFreezesInHistory() {
        var r = streak("2026-08-26", "2026-08-26", "2026-08-10", "2026-08-08", "2026-08-07");
        assertThat(r.currentStreak()).isEqualTo(1);
        assertThat(r.longestStreak()).isEqualTo(3);                      // 7, 8, [9 frozen], 10
    }

    @Test
    void ignoresDuplicateDatesAndInputOrder() {
        var r = streak("2026-08-26", "2026-08-24", "2026-08-26", "2026-08-26", "2026-08-25");
        assertThat(r.currentStreak()).isEqualTo(3);
    }

    @Test
    void xpFormula() {
        assertThat(ProgressMath.computeXp(6, 1, 1)).isEqualTo(6 * 10 + 50 + 5);
        assertThat(ProgressMath.computeXp(0, 0, 0)).isZero();
    }
}
