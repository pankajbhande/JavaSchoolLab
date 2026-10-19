package com.javaschoollab.search;

import com.javaschoollab.common.RateLimiter;
import com.javaschoollab.common.RateLimiters;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalLong;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/search?q=...&course=...&limit=...: public like the site itself, rate limited because it costs a query each time. */
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService search;
    private final RateLimiter limiter;

    public SearchController(SearchService search, RateLimiters limiters) {
        this.search = search;
        this.limiter = limiters.perMinute("search", 120);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam("q") String q,
                                                      @RequestParam(value = "course", required = false) String course,
                                                      @RequestParam(value = "limit", defaultValue = "30") int limit,
                                                      HttpServletRequest request) {
        OptionalLong wait = limiter.check(request.getRemoteAddr());
        if (wait.isPresent()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, String.valueOf(wait.getAsLong()))
                    .body(Map.<String, Object>of("error", "Too many searches. Please wait a minute and try again."));
        }
        List<SearchHit> hits = search.search(q, course, limit);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("query", q.trim());
        body.put("count", hits.size());
        body.put("hits", hits);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
    }

    /** Whether server-side search is on and its index is ready (the front end uses it to choose between server and in-page search). */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return search.status();
    }
}
