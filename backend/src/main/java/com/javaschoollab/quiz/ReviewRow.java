package com.javaschoollab.quiz;

import java.time.Instant;

/** All attempts at one module, summarised for the spaced-review queue. */
public record ReviewRow(String courseId, String moduleId, String moduleName, int best, boolean everPassed,
                        int attempts, Instant lastAttempt) {}
