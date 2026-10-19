package com.javaschoollab.achievements;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** user_badges: which badge or level a learner earned, and when. */
@Repository
class AchievementsRepository {

    private final JdbcTemplate jdbc;

    AchievementsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    Map<String, LocalDateTime> earned(long userId) {
        Map<String, LocalDateTime> out = new LinkedHashMap<>();
        jdbc.query("SELECT badge_id, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at, badge_id", rs -> {
            Timestamp t = rs.getTimestamp(2);
            out.put(rs.getString(1), t == null ? null : t.toLocalDateTime());
        }, userId);
        return out;
    }

    /** True only for the call that really added the row, so two requests at once cannot both announce the same badge. */
    boolean insert(long userId, String badgeId) {
        return jdbc.update("INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)", userId, badgeId) == 1;
    }
}
