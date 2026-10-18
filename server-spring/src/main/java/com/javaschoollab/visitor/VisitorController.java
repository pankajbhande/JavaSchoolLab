package com.javaschoollab.visitor;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The page-load counter. One row (id = 1) in visitor_count, so it survives redeploys with the rest of the database. */
@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    private final JdbcTemplate jdbc;

    public VisitorController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostMapping("/increment")
    public Map<String, Object> increment() {
        jdbc.update("UPDATE visitor_count SET count = count + 1 WHERE id = 1");
        return current();
    }

    @GetMapping("/count")
    public Map<String, Object> count() {
        return current();
    }

    private Map<String, Object> current() {
        List<Long> rows = jdbc.queryForList("SELECT count FROM visitor_count WHERE id = 1", Long.class);
        return Map.of("count", rows.isEmpty() ? 0L : rows.get(0));
    }
}
