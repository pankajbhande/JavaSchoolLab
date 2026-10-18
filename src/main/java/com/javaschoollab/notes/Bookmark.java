package com.javaschoollab.notes;

import java.time.Instant;

/** One bookmarked topic. */
public record Bookmark(String courseId, String moduleId, String topicId, String topicName, Instant createdAt) {}
