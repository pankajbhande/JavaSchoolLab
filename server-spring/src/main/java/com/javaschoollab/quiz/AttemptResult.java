package com.javaschoollab.quiz;

/** What was stored for a newly recorded attempt: the id, and the percentage and pass flag the server computed. */
public record AttemptResult(long id, int percentage, boolean passed) {}
