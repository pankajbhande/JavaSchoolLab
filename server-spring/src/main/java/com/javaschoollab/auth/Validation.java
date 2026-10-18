package com.javaschoollab.auth;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;
import java.util.regex.Pattern;

/** The same rules, with the same messages, as the sign-in form and the Node server. The browser check is a courtesy; this is the real one. */
public final class Validation {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern MOBILE = Pattern.compile("^\\+?[0-9 ()-]+$");
    private static final Pattern ISO_DATE = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");

    private Validation() {}

    /** Returns the message to show, or null when the identifier is fine. */
    public static String identifierError(Identifier type, String value) {
        if (value == null || value.isBlank()) {
            return type == Identifier.EMAIL ? "Email is required" : "Mobile number is required";
        }
        String v = value.trim();
        if (type == Identifier.EMAIL) {
            return v.length() <= 254 && EMAIL.matcher(v).matches() ? null : "Enter a valid email address, like name@example.com";
        }
        long digits = v.chars().filter(Character::isDigit).count();
        return MOBILE.matcher(v).matches() && digits >= 7 && digits <= 15 ? null : "Enter a valid mobile number (7 to 15 digits)";
    }

    public static String passwordError(String password) {
        if (password == null || password.length() < 4) return "Password must be at least 4 characters";
        return password.length() > 128 ? "Password must be at most 128 characters" : null;
    }

    public static String nameError(String name) {
        return name != null && !name.isBlank() && name.trim().length() <= 100 ? null : "Full name is required (up to 100 characters)";
    }

    /** A date of birth only when it really is a calendar date in YYYY-MM-DD form; anything else is stored as empty. */
    public static Optional<LocalDate> dateOfBirth(String value) {
        if (value == null || !ISO_DATE.matcher(value).matches()) return Optional.empty();
        try {
            return Optional.of(LocalDate.parse(value));
        } catch (DateTimeParseException e) {
            return Optional.empty();
        }
    }

    public static String emptyToNull(String s) {
        return s == null || s.isEmpty() ? null : s;
    }
}
