package com.javaschoollab.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads "Authorization: Bearer &lt;token&gt;". A good token signs the request in. A bad one is only
 * remembered (INVALID_TOKEN), because public routes must keep working with a stale token in the
 * browser; the entry point turns it into 403 on protected routes, as the Node server did.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    public static final String INVALID_TOKEN = "jsl.invalidToken";

    private final JwtService jwt;

    public JwtAuthFilter(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String[] parts = header == null ? new String[0] : header.split(" ");
        String token = parts.length > 1 ? parts[1] : null;
        if (token != null && !token.isEmpty()) {
            jwt.parse(token).ifPresentOrElse(
                    user -> SecurityContextHolder.getContext()
                            .setAuthentication(new UsernamePasswordAuthenticationToken(user, null, List.of())),
                    () -> request.setAttribute(INVALID_TOKEN, Boolean.TRUE));
        }
        chain.doFilter(request, response);
    }
}
