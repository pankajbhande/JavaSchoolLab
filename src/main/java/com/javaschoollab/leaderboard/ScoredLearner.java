package com.javaschoollab.leaderboard;

import java.io.Serializable;

/** One learner with their XP already worked out (Serializable so the cache can keep it in Redis). */
public record ScoredLearner(long id, String name, int xp, int modulesPassed) implements Serializable {
    private static final long serialVersionUID = 1L;
}
