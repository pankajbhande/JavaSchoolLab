package com.javaschoollab.account;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** Reads and erases everything stored for one user id. Table names are fixed in code, never taken from a request. */
@Repository
class AccountRepository {

    /** Every table that carries a user id; each is declared ON DELETE CASCADE, so deleting the user row removes them too. */
    private static final List<String> TABLES = List.of(
            "topic_progress", "quiz_attempts", "study_days", "bookmarks", "notes", "user_profiles", "user_badges", "certificates", "suggestions");

    private final JdbcTemplate jdbc;

    AccountRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** The account row (never the password hash) and every row of the tables above. */
    Map<String, Object> export(long userId) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("account", jdbc.queryForList(
                "SELECT id, full_name, email, mobile, login_type, gender, dob, organization, weekly_goal_minutes, created_at FROM users WHERE id = ?",
                userId).stream().findFirst().orElse(Map.of()));
        for (String table : TABLES) {
            out.put(table, jdbc.queryForList("SELECT * FROM " + table + " WHERE user_id = ?", userId));
        }
        return out;
    }

    /** Removes the account and, through the cascade, everything that belongs to it. */
    void erase(long userId, String email, String mobile) {
        jdbc.update("UPDATE analytics_events SET user_id = NULL WHERE user_id = ?", userId);   // kept only as anonymous statistics
        if (email != null) jdbc.update("DELETE FROM otp_codes WHERE identifier = ?", email);
        if (mobile != null) jdbc.update("DELETE FROM otp_codes WHERE identifier = ?", mobile);
        jdbc.update("DELETE FROM users WHERE id = ?", userId);
    }
}
