package com.javaschoollab.leaderboard;

import java.util.List;

/**
 * The leaderboard as one viewer sees it.
 *
 * @param top   the first 20 places
 * @param me    the viewer's own place, or null
 * @param total how many learners are ranked
 */
public record Leaderboard(List<RankedLearner> top, RankedLearner me, int total) {}
