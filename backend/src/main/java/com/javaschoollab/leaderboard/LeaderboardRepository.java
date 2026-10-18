package com.javaschoollab.leaderboard;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * The leaderboard's one query. It is a deliberate read-only aggregate across users, topic_progress, quiz_attempts and
 * study_days (the leaderboard owns no table of its own), so it reads tables that other services write.
 */
@Repository
public class LeaderboardRepository {

    private final JdbcTemplate jdbc;

    public LeaderboardRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** One row per user (capped at 5000) with the counts XP is derived from. */
    public List<LeaderboardEntry> activityCounts() {
        return jdbc.query("""
                SELECT u.id, u.full_name,
                  (SELECT COUNT(*) FROM topic_progress t WHERE t.user_id = u.id) AS topics,
                  (SELECT COUNT(DISTINCT CONCAT(q.course_id, '/', q.module_id)) FROM quiz_attempts q
                     WHERE q.user_id = u.id AND q.passed = TRUE) AS modules,
                  (SELECT COUNT(*) FROM study_days d WHERE d.user_id = u.id) AS study_days
                FROM users u LIMIT 5000""",
                (rs, n) -> new LeaderboardEntry(rs.getLong("id"), rs.getString("full_name"),
                        rs.getInt("topics"), rs.getInt("modules"), rs.getInt("study_days")));
    }
}
