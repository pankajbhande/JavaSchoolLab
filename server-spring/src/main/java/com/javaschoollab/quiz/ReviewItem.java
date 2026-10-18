package com.javaschoollab.quiz;

/** A module that is due for another attempt, with how long since the last one. */
public record ReviewItem(String courseId, String moduleId, String moduleName, int best, boolean everPassed,
                         int attempts, int intervalDays, long daysSince) {}
