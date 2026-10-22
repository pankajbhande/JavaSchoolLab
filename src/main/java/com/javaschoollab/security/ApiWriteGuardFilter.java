package com.javaschoollab.security;

import com.javaschoollab.common.RateLimiter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.OptionalLong;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Two cheap guards in front of every write to the API:
 * <ul>
 *   <li><b>Body size:</b> a request that declares more than {@link #MAX_BODY_BYTES} is refused (413) before Jackson reads it. The largest real body is
 *       a profile photo (about 90 KB of text); nothing else comes close.</li>
 *   <li><b>Write rate per signed-in user:</b> at most {@code writesPerMinute} POST / PUT / PATCH / DELETE requests a minute, so one account cannot
 *       flood the database (notes, bookmarks, progress, quiz attempts). Anonymous routes have their own per-address limits.</li>
 * </ul>
 */
public class ApiWriteGuardFilter extends OncePerRequestFilter {

    static final long MAX_BODY_BYTES = 300_000;

    private final RateLimiter writes;

    public ApiWriteGuardFilter(RateLimiter writes) {
        this.writes = writes;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String m = request.getMethod();
        return !request.getRequestURI().startsWith("/api/") || "GET".equals(m) || "HEAD".equals(m) || "OPTIONS".equals(m);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (request.getContentLengthLong() > MAX_BODY_BYTES) {
            reject(response, 413, "That request is too large", 0);
            return;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthUser user) {
            OptionalLong wait = writes.check("user:" + user.id());
            if (wait.isPresent()) {
                reject(response, 429, "Too many requests. Please slow down and try again in a moment.", wait.getAsLong());
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private static void reject(HttpServletResponse response, int status, String message, long retryAfter) throws IOException {
        response.setStatus(status);
        if (retryAfter > 0) response.setHeader("Retry-After", String.valueOf(retryAfter));
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
