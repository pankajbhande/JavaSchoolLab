package com.javaschoollab.certificate;

import com.javaschoollab.common.ApiException;
import com.javaschoollab.quiz.QuizService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * The certificate service: issuing, listing and public verification. The score is taken from the learner's own
 * recorded, passed quiz attempt, never from the request. Asking again for the same pass returns the same certificate.
 */
@Service
public class CertificateService {

    private static final int ID_ATTEMPTS = 5;

    private final CertificateRepository repo;
    private final QuizService quiz;

    public CertificateService(CertificateRepository repo, QuizService quiz) {
        this.repo = repo;
        this.quiz = quiz;
    }

    /** Issues (or re-reads) the certificate for the learner's best passing attempt at {@code topicName}. */
    public IssueResult issue(long userId, String studentName, String courseName, String topicName) {
        if (courseName.isEmpty() || topicName.isEmpty()) {
            throw ApiException.badRequest("Course name and topic name are required");
        }

        var best = quiz.bestPassedAttempt(userId, topicName)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
                        "Pass this module's test first, then you can download the certificate."));

        var existing = repo.findExisting(userId, topicName, courseName, best.score(), best.totalQuestions());
        if (existing.isPresent()) {
            var e = existing.get();
            return new IssueResult(new Certificate(e.id(), e.certificateUid(), studentName, courseName, topicName,
                    best.score(), best.totalQuestions(), e.issuedAt()), false);
        }

        for (int tries = 0; tries < ID_ATTEMPTS; tries++) {
            String uid = CertificateUid.generate();
            try {
                long id = repo.insert(userId, uid, courseName, topicName, best.score(), best.totalQuestions());
                return new IssueResult(new Certificate(id, uid, studentName, courseName, topicName,
                        best.score(), best.totalQuestions(), Instant.now()), true);
            } catch (DuplicateKeyException collision) {
                // an id collision (about 1 in 10^18): draw another
            }
        }
        throw new IllegalStateException("could not allocate a certificate id");
    }

    /** The public check: empty for a malformed or unknown id. */
    public Optional<Certificate> verify(String uid) {
        String id = uid == null ? "" : uid.trim();
        if (!CertificateUid.isValid(id)) return Optional.empty();
        return repo.findByUid(id);
    }

    public List<Certificate> forUser(long userId) {
        return repo.forUser(userId);
    }

    /** What a public profile may show of a learner's certificates. */
    public List<PublicCertificate> publicCertificates(long userId) {
        return repo.publicList(userId);
    }
}
