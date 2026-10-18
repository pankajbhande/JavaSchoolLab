package com.javaschoollab.certificate;

import java.time.Instant;

/** A certificate as it may be shown on a public profile: no learner ids, only what is printed on it. */
public record PublicCertificate(String certificateUid, String courseName, String topicName, int score,
                                int totalQuestions, Instant issuedAt) {}
