package com.javaschoollab.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * One log line per request, after it has been answered: method, path, status and how long it took.
 * <pre>HTTP GET /api/content/courses/{id} -> 200 in 12 ms</pre>
 * The line is written while the request's trace is still open, so the JSON log carries the request's {@code traceId} and {@code spanId}:
 * in Grafana a log line links to its trace, and a trace links to its log lines.
 * <ul>
 *   <li>5xx responses are logged at ERROR, requests slower than one second at WARN, everything else at INFO.</li>
 *   <li>Only the path is logged: never the query string (it can hold a search text or a token), never headers, bodies or IP addresses.</li>
 *   <li>Health probes, metric scrapes and static files (scripts, images, fonts: anything with a file extension) are skipped as noise.</li>
 * </ul>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)   // inside the observation filter that opens the trace, so the trace id is in the log context
public class RequestLogFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLogFilter.class);
    private static final long SLOW_MS = 1000;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/actuator") || path.startsWith("/assets/") || path.startsWith("/content-assets/")) return true;
        String lastSegment = path.substring(path.lastIndexOf('/') + 1);
        return lastSegment.indexOf('.') > 0;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long started = System.nanoTime();
        try {
            chain.doFilter(request, response);
        } finally {
            long ms = (System.nanoTime() - started) / 1_000_000;
            int status = response.getStatus();
            if (status >= 500) {
                log.error("HTTP {} {} -> {} in {} ms", request.getMethod(), request.getRequestURI(), status, ms);
            } else if (ms >= SLOW_MS) {
                log.warn("HTTP {} {} -> {} in {} ms (slow)", request.getMethod(), request.getRequestURI(), status, ms);
            } else {
                log.info("HTTP {} {} -> {} in {} ms", request.getMethod(), request.getRequestURI(), status, ms);
            }
        }
    }
}
