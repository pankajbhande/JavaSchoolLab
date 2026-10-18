package com.javaschoollab.leaderboard;

/** One learner's raw activity counts, straight from the database. */
public record LeaderboardEntry(long id, String fullName, int topics, int modulesPassed, int studyDays) {}
