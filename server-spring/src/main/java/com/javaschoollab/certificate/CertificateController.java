package com.javaschoollab.certificate;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.auth.ApiException;
import com.javaschoollab.certificate.CertificateRepository.Certificate;
import com.javaschoollab.config.AppProperties;
import com.javaschoollab.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalLong;
import org.springframework.dao.DuplicateKeyException;
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
 * the learner's own recorded, passed quiz attempt, never from the request: the server must not print whatever a
 * client claims. Asking again for the same pass returns the same certificate and id.
 */
@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private static final int ID_ATTEMPTS = 5;

    private final CertificateRepository repo;
    private final RateLimiter verifyLimiter;

    public CertificateController(CertificateRepository repo, AppProperties props) {
        this.repo = repo;
        this.verifyLimiter = new RateLimiter(Duration.ofMinutes(1), props.rateLimit().verifyPerMinute(), Clock.systemUTC());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> issue(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        String courseName = text(body, "courseName");
        String topicName = text(body, "topicName");
        if (courseName.isEmpty() || topicName.isEmpty()) {
            throw ApiException.badRequest("Course name and topic name are required");
        }

        var best = repo.bestPassedAttempt(user.id(), topicName)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                        "Pass this module's test first, then you can download the certificate."));

        var existing = repo.findExisting(user.id(), topicName, courseName, best.score(), best.totalQuestions());
        if (existing.isPresent()) {
            var e = existing.get();
            return ResponseEntity.ok(owned(e.id(), e.certificateUid(), user.fullName(), courseName, topicName, best.score(), best.totalQuestions(), e.issuedAt()));
        }

        for (int tries = 0; tries < ID_ATTEMPTS; tries++) {
            String uid = CertificateUid.generate();
            try {
                long id = repo.insert(user.id(), uid, courseName, topicName, best.score(), best.totalQuestions());
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(owned(id, uid, user.fullName(), courseName, topicName, best.score(), best.totalQuestions(), Instant.now()));
            } catch (DuplicateKeyException collision) {
                // an id collision (about 1 in 10^18): draw another
            }
        }
        throw new IllegalStateException("could not allocate a certificate id");
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
        String id = uid == null ? "" : uid.trim();
        if (!CertificateUid.isValid(id)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.<String, Object>of("valid", false));

        return repo.findByUid(id)
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
        return repo.forUser(user.id()).stream()
                .map(c -> owned(c.id(), c.certificateUid(), c.studentName(), c.courseName(), c.topicName(), c.score(), c.totalQuestions(), c.issuedAt()))
                .toList();
    }

    /** camelCase, matching the CertificateData type the React app declares. */
    private static Map<String, Object> owned(long id, String uid, String studentName, String courseName, String topicName,
                                             int score, int totalQuestions, Instant issuedAt) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("certificateUid", uid);
        m.put("studentName", studentName);
        m.put("courseName", courseName);
        m.put("topicName", topicName);
        m.put("score", score);
        m.put("totalQuestions", totalQuestions);
        m.put("issuedAt", issuedAt);
        return m;
    }

    private static String text(JsonNode body, String field) {
        JsonNode n = body.get(field);
        return n == null || n.isNull() ? "" : n.asText();
    }
}
