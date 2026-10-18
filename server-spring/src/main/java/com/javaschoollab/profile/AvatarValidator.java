package com.javaschoollab.profile;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Re-checks a profile photo on the server: type, size and that the bytes really are that image format.
 * The browser's own check is only a courtesy. Same rules and messages as the Node server.
 */
public final class AvatarValidator {

    public static final int MAX_CHARS = 90_000;
    // Possessive quantifiers: a long base64 string must never trigger regex backtracking.
    private static final Pattern DATA_URL = Pattern.compile("^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/]++={0,2})$");

    private AvatarValidator() {}

    /** The message to show, or null when the image is acceptable. */
    public static String error(Object value) {
        if (!(value instanceof String s)) return "Choose an image";
        if (s.length() > MAX_CHARS) return "That image is too large. Please choose a smaller one";
        Matcher m = DATA_URL.matcher(s);
        if (!m.matches()) return "Use a JPG, PNG or WebP image";
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(m.group(2));
        } catch (IllegalArgumentException e) {
            return "That file is not a valid image";
        }
        return bytes.length > 12 && matchesMagic(m.group(1), bytes) ? null : "That file is not a valid image";
    }

    private static boolean matchesMagic(String type, byte[] b) {
        return switch (type) {
            case "jpeg" -> (b[0] & 0xff) == 0xff && (b[1] & 0xff) == 0xd8 && (b[2] & 0xff) == 0xff;
            case "png" -> (b[0] & 0xff) == 0x89 && b[1] == 0x50 && b[2] == 0x4e && b[3] == 0x47;
            case "webp" -> ascii(b, 0, 4).equals("RIFF") && ascii(b, 8, 12).equals("WEBP");
            default -> false;
        };
    }

    private static String ascii(byte[] b, int from, int to) {
        return new String(b, from, to - from, StandardCharsets.US_ASCII);
    }
}
