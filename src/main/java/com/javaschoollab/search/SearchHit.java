package com.javaschoollab.search;

/** One matching topic, in the same shape the browser's own search produces (see frontend services/contentSearch.ts). */
public record SearchHit(String courseId, String courseName, String moduleId, String moduleName,
                        String topicId, String topicName, String snippet, double score) {}
