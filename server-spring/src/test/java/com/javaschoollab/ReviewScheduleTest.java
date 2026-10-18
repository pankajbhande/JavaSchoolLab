package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;

import com.javaschoollab.quiz.ReviewSchedule;
import org.junit.jupiter.api.Test;

/** The review-timing cases from server/lib/progress.test.js. */
class ReviewScheduleTest {

    @Test
    void reviewIntervalsAtTheDocumentedBoundaries() {
        int[][] cases = {{0, 1}, {69, 1}, {70, 3}, {84, 3}, {85, 7}, {94, 7}, {95, 21}, {100, 21}};
        for (int[] c : cases) assertThat(ReviewSchedule.reviewIntervalDays(c[0])).as("best " + c[0]).isEqualTo(c[1]);
    }

    @Test
    void dueRules() {
        assertThat(ReviewSchedule.isDue(false, 95, 0)).isTrue();           // never passed: always due
        assertThat(ReviewSchedule.isDue(true, 100, 20)).isFalse();         // a perfect score waits three weeks
        assertThat(ReviewSchedule.isDue(true, 100, 21)).isTrue();
        assertThat(ReviewSchedule.isDue(true, 70, 2)).isFalse();
        assertThat(ReviewSchedule.isDue(true, 70, 3)).isTrue();
    }
}
