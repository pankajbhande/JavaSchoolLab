package com.javaschoollab.notes;

import com.fasterxml.jackson.databind.JsonNode;

/** course + module + topic ids, plus a display name that defaults to the topic id. */
record TopicRef(String courseId, String moduleId, String topicId, String topicName) {

    static final int TOPIC_NAME_MAX_CHARS = 200;

    /** The reference in a request body, or null when an id is missing. */
    static TopicRef from(JsonNode body) {
        if (!present(body.get("courseId")) || !present(body.get("moduleId")) || !present(body.get("topicId"))) return null;
        String topicId = body.get("topicId").asText();
        String name = present(body.get("topicName")) ? body.get("topicName").asText() : topicId;
        String cut = name.length() <= TOPIC_NAME_MAX_CHARS ? name : name.substring(0, TOPIC_NAME_MAX_CHARS);
        return new TopicRef(body.get("courseId").asText(), body.get("moduleId").asText(), topicId, cut);
    }

    /** JS-style "was provided": missing, null, "", 0 and false are not. */
    static boolean present(JsonNode n) {
        if (n == null || n.isNull() || n.isMissingNode()) return false;
        if (n.isTextual()) return !n.asText().isEmpty();
        if (n.isNumber()) return n.asDouble() != 0;
        if (n.isBoolean()) return n.asBoolean();
        return true;
    }
}
