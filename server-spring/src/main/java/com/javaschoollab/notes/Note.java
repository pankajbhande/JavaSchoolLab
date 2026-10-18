package com.javaschoollab.notes;

import java.time.Instant;

/** A learner's private note on one topic. */
public record Note(String courseId, String moduleId, String topicId, String topicName, String body, Instant updatedAt) {}
