package com.javaschoollab.visitor;

import com.javaschoollab.common.RateLimiter;
import com.javaschoollab.common.RateLimiters;
import jakarta.servlet.http.HttpServletRequest;
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
    private final RateLimiter incrementLimiter;

    public VisitorController(VisitorService visitors, RateLimiters limiters) {
        this.visitors = visitors;
        this.incrementLimiter = limiters.perMinute("visitor-increment", 120);
    }

    /**
     * Counts one page load. From an address that is flooding it, the count is simply not raised (and nothing is written): the answer stays
     * a normal 200, so a shared school address never sees an error, but the counter cannot be inflated by a script.
     */
    @PostMapping("/increment")
    public Map<String, Object> increment(HttpServletRequest request) {
        if (incrementLimiter.check(request.getRemoteAddr()).isPresent()) return Map.of("count", visitors.count());
        return Map.of("count", visitors.increment());
    }

    @GetMapping("/count")
    public Map<String, Object> count() {
        return Map.of("count", visitors.count());
    }
}
