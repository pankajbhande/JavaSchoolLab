package com.javaschoollab.user;

import java.sql.PreparedStatement;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

/** The users table, read and written with plain SQL (the same statements the Node server ran). */
@Repository
public class UserRepository {

    private static final String COLUMNS =
            "id, full_name, email, mobile, password_hash, login_type, gender, dob, organization, avatar, created_at";

    private static final RowMapper<UserRow> MAPPER = (rs, n) -> new UserRow(
            rs.getLong("id"), rs.getString("full_name"), rs.getString("email"), rs.getString("mobile"),
            rs.getString("password_hash"), rs.getString("login_type"), rs.getString("gender"),
            rs.getObject("dob", LocalDate.class), rs.getString("organization"), rs.getString("avatar"),
            rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toInstant());

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean exists(Identifier by, String value) {
        // by.column() comes from the enum, never from the request.
        return !jdbc.queryForList("SELECT id FROM users WHERE " + by.column() + " = ?", value).isEmpty();
    }

    public Optional<UserRow> findBy(Identifier by, String value) {
        List<UserRow> rows = jdbc.query("SELECT " + COLUMNS + " FROM users WHERE " + by.column() + " = ?", MAPPER, value);
        return rows.stream().findFirst();
    }

    public Optional<UserRow> findById(long id) {
        return jdbc.query("SELECT " + COLUMNS + " FROM users WHERE id = ?", MAPPER, id).stream().findFirst();
    }

    public long insert(String fullName, String email, String mobile, String passwordHash, String loginType,
                       String gender, LocalDate dob, String organization) {
        var keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO users (full_name, email, mobile, password_hash, login_type, gender, dob, organization) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)", new String[] {"id"});
            ps.setString(1, fullName);
            ps.setString(2, email);
            ps.setString(3, mobile);
            ps.setString(4, passwordHash);
            ps.setString(5, loginType);
            ps.setString(6, gender);
            ps.setObject(7, dob);
            ps.setString(8, organization);
            return ps;
        }, keys);
        return keys.getKey().longValue();
    }

    public void updateProfile(long id, String fullName, String gender, LocalDate dob, String organization) {
        jdbc.update("UPDATE users SET full_name = ?, gender = ?, dob = ?, organization = ? WHERE id = ?",
                fullName, gender, dob, organization, id);
    }

    /** null removes the photo. */
    public void setAvatar(long id, String dataUrl) {
        jdbc.update("UPDATE users SET avatar = ? WHERE id = ?", dataUrl, id);
    }

    public void updatePasswordHash(long id, String hash) {
        jdbc.update("UPDATE users SET password_hash = ? WHERE id = ?", hash, id);
    }
}
