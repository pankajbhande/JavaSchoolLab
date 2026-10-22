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

    /**
     * The text of a request field, refused with 400 when longer than {@code max}. The database columns are fixed-size VARCHARs; an oversized value would
     * otherwise reach MySQL and come back as a 500 ("Data too long"), and a client could keep rewriting multi-kilobyte ids.
     */
    public static String bounded(JsonNode n, String field, int max) {
        String text = n == null || n.isNull() ? "" : n.asText();
        if (text.length() > max) throw ApiException.badRequest(field + " is too long (at most " + max + " characters)");
        return text;
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
