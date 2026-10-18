package com.javaschoollab.visitor;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The page-load counter. One row (id = 1) in visitor_count, so it survives redeploys with the rest of the database. */
@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    private final VisitorService visitors;

    public VisitorController(VisitorService visitors) {
        this.visitors = visitors;
    }

    @PostMapping("/increment")
    public Map<String, Object> increment() {
        return Map.of("count", visitors.increment());
    }

    @GetMapping("/count")
    public Map<String, Object> count() {
        return Map.of("count", visitors.count());
    }
}
