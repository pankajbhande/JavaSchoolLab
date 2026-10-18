package com.javaschoollab.quiz;

import java.time.Instant;

/** One graded attempt. */
public record QuizAttempt(String courseId, String moduleId, String moduleName, int score, int totalQuestions,
                          int percentage, boolean passed, Instant attemptedAt) {}
