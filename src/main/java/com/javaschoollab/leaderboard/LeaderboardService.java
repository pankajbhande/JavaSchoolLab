package com.javaschoollab.leaderboard;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Ranks learners by the same XP formula as the dashboard, computed on the server. Names are shortened ("Tanaji M.")
 * because this list is visible to every signed-in learner.
 */
@Service
public class LeaderboardService {

    private static final int TOP = 20;

    private final LeaderboardScores scores;

    LeaderboardService(LeaderboardScores scores) {
        this.scores = scores;
    }

    /** Everyone with some XP, plus the viewer even at zero, best first (ties by account age). */
    public Leaderboard leaderboard(long viewerId) {
        List<ScoredLearner> sorted = scores.all().stream()          // cached for a minute, already best first
                .filter(r -> r.xp() > 0 || r.id() == viewerId)
                .toList();
        List<RankedLearner> ranked = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            ScoredLearner s = sorted.get(i);
            ranked.add(new RankedLearner(i + 1, s.id(), s.name(), s.xp(), s.modulesPassed()));
        }
        RankedLearner me = ranked.stream().filter(r -> r.id() == viewerId).findFirst().orElse(null);
        return new Leaderboard(ranked.stream().limit(TOP).toList(), me, ranked.size());
    }

    /** "Tanaji Malusare" becomes "Tanaji M."; a single word stays as it is. */
    static String shortName(String full) {
        String[] parts = (full == null ? "Student" : full).strip().split("\\s+");
        return parts.length > 1 ? parts[0] + " " + parts[parts.length - 1].substring(0, 1).toUpperCase() + "." : parts[0];
    }
}
