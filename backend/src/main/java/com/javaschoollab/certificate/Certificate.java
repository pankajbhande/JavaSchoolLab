package com.javaschoollab.certificate;

import java.time.Instant;

/** A certificate with the holder's name: what the owner's list and the public check both return. */
public record Certificate(long id, String certificateUid, String studentName, String courseName, String topicName,
                          int score, int totalQuestions, Instant issuedAt) {}
