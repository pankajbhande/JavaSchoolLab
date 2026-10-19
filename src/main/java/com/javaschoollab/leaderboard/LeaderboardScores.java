package com.javaschoollab.leaderboard;

import com.javaschoollab.progress.ProgressService;
import java.util.ArrayList;
import java.util.Comparator;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

/**
 * Everyone's XP, best first. Working it out reads several tables for every learner, so the result is cached for a minute
 * (60 seconds, in Redis when it is on, otherwise in this app's memory). Which rows a viewer sees is decided afterwards by
 * {@link LeaderboardService}, so one cached list serves every viewer.
 */
@Component
class LeaderboardScores {

    private final LeaderboardRepository repo;
    private final ProgressService progress;

    LeaderboardScores(LeaderboardRepository repo, ProgressService progress) {
        this.repo = repo;
        this.progress = progress;
    }

    @Cacheable("leaderboardScores")
    public ArrayList<ScoredLearner> all() {
        ArrayList<ScoredLearner> scored = new ArrayList<>(repo.activityCounts().stream()
                .map(e -> new ScoredLearner(e.id(), LeaderboardService.shortName(e.fullName()),
                        progress.computeXp(e.topics(), e.modulesPassed(), e.studyDays()), e.modulesPassed()))
                .toList());
        scored.sort(Comparator.comparingInt(ScoredLearner::xp).reversed().thenComparingLong(ScoredLearner::id));
        return scored;
    }
}
