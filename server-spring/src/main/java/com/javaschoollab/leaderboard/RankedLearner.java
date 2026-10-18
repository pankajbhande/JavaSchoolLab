package com.javaschoollab.leaderboard;

/** A learner's place on the leaderboard; the name is already shortened for display. */
public record RankedLearner(int rank, long id, String name, int xp, int modulesPassed) {}
