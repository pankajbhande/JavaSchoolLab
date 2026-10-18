package com.javaschoollab.progress;

import com.javaschoollab.security.AuthUser;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * Ranked by the same XP formula as the dashboard, computed on the server. Names are shortened ("Tanaji M.") because
 * this list is visible to every signed-in learner.
 */
@RestController
public class LeaderboardController {

    private record Row(long id, String name, int xp, int modulesPassed) {}
    private record Ranked(int rank, Row row) {}

    private final JdbcTemplate jdbc;

    public LeaderboardController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/leaderboard")
    public Map<String, Object> leaderboard(@AuthenticationPrincipal AuthUser me) {
        List<Row> rows = jdbc.query("""
                SELECT u.id, u.full_name,
                  (SELECT COUNT(*) FROM topic_progress t WHERE t.user_id = u.id) AS topics,
                  (SELECT COUNT(DISTINCT CONCAT(q.course_id, '/', q.module_id)) FROM quiz_attempts q
                     WHERE q.user_id = u.id AND q.passed = TRUE) AS modules,
                  (SELECT COUNT(*) FROM study_days d WHERE d.user_id = u.id) AS study_days
                FROM users u LIMIT 5000""",
                (rs, n) -> new Row(rs.getLong("id"), shortName(rs.getString("full_name")),
                        ProgressMath.computeXp(rs.getInt("topics"), rs.getInt("modules"), rs.getInt("study_days")),
                        rs.getInt("modules")));

        List<Row> sorted = rows.stream()
                .filter(r -> r.xp() > 0 || r.id() == me.id())
                .sorted(Comparator.comparingInt(Row::xp).reversed().thenComparingLong(Row::id))
                .toList();
        List<Ranked> ranked = new java.util.ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) ranked.add(new Ranked(i + 1, sorted.get(i)));

        List<Map<String, Object>> top = ranked.stream().limit(20).map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("rank", r.rank());
            m.put("name", r.row().name());
            m.put("xp", r.row().xp());
            m.put("modulesPassed", r.row().modulesPassed());
            m.put("isMe", r.row().id() == me.id());
            return m;
        }).toList();

        Map<String, Object> mine = ranked.stream().filter(r -> r.row().id() == me.id()).findFirst()
                .map(r -> Map.<String, Object>of("rank", r.rank(), "xp", r.row().xp())).orElse(null);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("top", top);
        out.put("me", mine);
        out.put("total", ranked.size());
        return out;
    }

    /** "Tanaji Malusare" becomes "Tanaji M."; a single word stays as it is. */
    static String shortName(String full) {
        String[] parts = (full == null ? "Student" : full).strip().split("\\s+");
        return parts.length > 1 ? parts[0] + " " + parts[parts.length - 1].substring(0, 1).toUpperCase() + "." : parts[0];
    }
}
