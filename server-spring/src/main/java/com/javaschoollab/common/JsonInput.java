package com.javaschoollab.common;

import com.fasterxml.jackson.databind.JsonNode;

/** Reading loosely typed JSON request fields the way the original Node server did. */
public final class JsonInput {

    private JsonInput() {}

    /** JS-style truthiness for a request field: missing, null, "", 0 and false are all "not provided". */
    public static boolean truthy(JsonNode n) {
        if (n == null || n.isNull() || n.isMissingNode()) return false;
        if (n.isTextual()) return !n.asText().isEmpty();
        if (n.isNumber()) return n.asDouble() != 0;
        if (n.isBoolean()) return n.asBoolean();
        return true;
    }

    /** Number(value) for a JSON scalar: numbers as-is, numeric text parsed, anything else NaN. */
    public static double number(JsonNode n) {
        if (n.isNumber()) return n.asDouble();
        if (n.isTextual()) {
            try {
                return Double.parseDouble(n.asText().trim());
            } catch (NumberFormatException e) {
                return Double.NaN;
            }
        }
        return Double.NaN;
    }
}
