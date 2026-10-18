package com.javaschoollab.leaderboard;

import com.javaschoollab.progress.ProgressService;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Ranks learners by the same XP formula as the dashboard, computed on the server. Names are shortened ("Tanaji M.")
 * because this list is visible to every signed-in learner.
 */
@Service
public class LeaderboardService {

    private static final int TOP = 20;

    private final LeaderboardRepository repo;
    private final ProgressService progress;

    public LeaderboardService(LeaderboardRepository repo, ProgressService progress) {
        this.repo = repo;
        this.progress = progress;
    }

    /** Everyone with some XP, plus the viewer even at zero, best first (ties by account age). */
    public Leaderboard leaderboard(long viewerId) {
        record Scored(long id, String name, int xp, int modulesPassed) {}
        List<Scored> sorted = repo.activityCounts().stream()
                .map(e -> new Scored(e.id(), shortName(e.fullName()),
                        progress.computeXp(e.topics(), e.modulesPassed(), e.studyDays()), e.modulesPassed()))
                .filter(r -> r.xp() > 0 || r.id() == viewerId)
                .sorted(Comparator.comparingInt(Scored::xp).reversed().thenComparingLong(Scored::id))
                .toList();
        List<RankedLearner> ranked = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            Scored s = sorted.get(i);
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
