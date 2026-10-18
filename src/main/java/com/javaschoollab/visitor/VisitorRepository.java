package com.javaschoollab.visitor;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** visitor_count: a single row (id = 1). */
@Repository
public class VisitorRepository {

    private final JdbcTemplate jdbc;

    public VisitorRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void increment() {
        jdbc.update("UPDATE visitor_count SET count = count + 1 WHERE id = 1");
    }

    /** The counter, or empty when the row is missing. */
    public List<Long> count() {
        return jdbc.queryForList("SELECT count FROM visitor_count WHERE id = 1", Long.class);
    }
}
