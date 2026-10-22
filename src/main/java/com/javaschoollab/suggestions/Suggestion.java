package com.javaschoollab.suggestions;

import java.time.Instant;

/** One suggestion a learner sent; {@code status} is "new" until the team has looked at it. */
public record Suggestion(long id, String category, String message, String pagePath, String status, Instant createdAt) {}
