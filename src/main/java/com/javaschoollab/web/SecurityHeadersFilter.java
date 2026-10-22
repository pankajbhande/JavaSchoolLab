package com.javaschoollab.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Browser-side defences, sent with every response (Spring Security already adds {@code X-Content-Type-Options: nosniff} and
 * {@code X-Frame-Options: DENY}; HSTS is sent by nginx).
 * <ul>
 *   <li>{@code Referrer-Policy}, {@code Permissions-Policy}: send no more information, and ask for no more browser power, than the site needs.</li>
 *   <li>{@code Content-Security-Policy}: an ENFORCED part that cannot break a page (no plug-ins, no base-tag hijack, forms post to this site,
 *       nobody may frame the site), and a script / connection allow-list. The allow-list's mode is {@code app.security.csp-mode}:
 *       {@code report-only} (the default: the browser console lists what it would block, nothing breaks), {@code enforce}, or {@code off}.
 *       Switch to {@code enforce} after opening the site once with the console open and seeing no "[Report Only]" messages for your ads and sign-in.</li>
 * </ul>
 * The two stand-alone practice pages (HTML viewer, Java compiler) run learner-typed code in a sandboxed frame, so they get no script allow-list.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final Set<String> PRACTICE_PAGES = Set.of("/html-viewer.html", "/java-compiler.html");

    /** Always on: directives that do not depend on which scripts, images or fonts a page uses. */
    private static final String ENFORCED = "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    /**
     * The allow-list: this site, Google sign-in, Google AdSense, Google Fonts, the JDoodle runner. Styles keep 'unsafe-inline' because
     * React and the lesson HTML use style attributes. Images may come from anywhere over https (lesson pictures, ad creatives, avatars as data:).
     */
    private static final String ALLOW_LIST = String.join("; ",
            "default-src 'self'",
            "script-src 'self' https://accounts.google.com https://pagead2.googlesyndication.com https://*.googlesyndication.com "
                    + "https://*.adtrafficquality.google https://www.googletagservices.com https://partner.googleadservices.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' https://accounts.google.com https://*.googlesyndication.com https://*.adtrafficquality.google https://*.google.com",
            "frame-src 'self' https://accounts.google.com https://www.jdoodle.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.adtrafficquality.google",
            "worker-src 'self' blob:",
            "manifest-src 'self'",
            "media-src 'self' https: data: blob:");

    private final String mode;

    public SecurityHeadersFilter(@Value("${app.security.csp-mode:report-only}") String mode) {
        this.mode = mode == null ? "report-only" : mode.trim().toLowerCase();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
        if (!"off".equals(mode)) {
            boolean practicePage = PRACTICE_PAGES.contains(request.getRequestURI());
            if (practicePage) {
                // Opened in its own tab by "Try it yourself"; it must frame itself and run the learner's own code.
                response.setHeader("Content-Security-Policy", "object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
            } else {
                response.setHeader("Content-Security-Policy", ENFORCED + ("enforce".equals(mode) ? "; " + ALLOW_LIST : ""));
                if (!"enforce".equals(mode)) response.setHeader("Content-Security-Policy-Report-Only", ALLOW_LIST);
            }
        }
        chain.doFilter(request, response);
    }
}
