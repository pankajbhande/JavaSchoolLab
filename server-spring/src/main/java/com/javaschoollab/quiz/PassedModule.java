package com.javaschoollab.quiz;

/** A module the learner has passed, with the best percentage they reached. */
public record PassedModule(String courseId, String moduleId, int best) {}
