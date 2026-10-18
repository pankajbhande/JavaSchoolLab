package com.javaschoollab.certificate;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.RateLimiter;
import com.javaschoollab.config.AppProperties;
import com.javaschoollab.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalLong;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Certificates. They are publicly verifiable (the QR code on one opens /verify/{id}), so the score is taken from
 * the learner's own recorded, passed quiz attempt, never from the request: see {@link CertificateService}.
 */
@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificates;
    private final RateLimiter verifyLimiter;

    public CertificateController(CertificateService certificates, AppProperties props) {
        this.certificates = certificates;
        this.verifyLimiter = new RateLimiter(Duration.ofMinutes(1), props.rateLimit().verifyPerMinute(), Clock.systemUTC());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> issue(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        IssueResult result = certificates.issue(user.id(), user.fullName(), text(body, "courseName"), text(body, "topicName"));
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK).body(owned(result.certificate()));
    }

    /** What the QR code opens: only what is printed on the certificate, and 404 for an unknown id. Rate limited because it needs no login. */
    @GetMapping("/verify/{uid}")
    public ResponseEntity<Map<String, Object>> verify(@PathVariable String uid, HttpServletRequest request) {
        OptionalLong wait = verifyLimiter.check(request.getRemoteAddr());
        if (wait.isPresent()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, String.valueOf(wait.getAsLong()))
                    .body(Map.<String, Object>of("error", "Too many requests. Please wait a minute and try again."));
        }
        return certificates.verify(uid)
                .map(c -> {
                    Map<String, Object> out = new LinkedHashMap<>();
                    out.put("valid", true);
                    out.put("certificateUid", c.certificateUid());
                    out.put("studentName", c.studentName());
                    out.put("courseName", c.courseName());
                    out.put("topicName", c.topicName());
                    out.put("score", c.score());
                    out.put("totalQuestions", c.totalQuestions());
                    out.put("percentage", c.totalQuestions() > 0 ? Math.round(c.score() * 100.0 / c.totalQuestions()) : 0);
                    out.put("issuedAt", c.issuedAt());
                    return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic()).body(out);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.<String, Object>of("valid", false)));
    }

    @GetMapping
    public List<Map<String, Object>> mine(@AuthenticationPrincipal AuthUser user) {
        return certificates.forUser(user.id()).stream().map(CertificateController::owned).toList();
    }

    /** camelCase, matching the CertificateData type the React app declares. */
    private static Map<String, Object> owned(Certificate c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.id());
        m.put("certificateUid", c.certificateUid());
        m.put("studentName", c.studentName());
        m.put("courseName", c.courseName());
        m.put("topicName", c.topicName());
        m.put("score", c.score());
        m.put("totalQuestions", c.totalQuestions());
        m.put("issuedAt", c.issuedAt());
        return m;
    }

    private static String text(JsonNode body, String field) {
        JsonNode n = body.get(field);
        return n == null || n.isNull() ? "" : n.asText();
    }
}
