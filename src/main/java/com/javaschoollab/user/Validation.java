package com.javaschoollab.user;

import com.javaschoollab.common.PublicApi;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/** The same rules, with the same messages, as the sign-in form and the Node server. The browser check is a courtesy; this is the real one. */
@PublicApi
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

    /** The shortest password accepted for a NEW password. Existing, shorter passwords still sign in: sign-in never checks the length. */
    public static final int MIN_PASSWORD_LENGTH = 8;

    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "password1", "password123", "12345678", "123456789", "1234567890", "11111111", "00000000", "qwertyui",
            "qwerty123", "iloveyou", "admin123", "welcome1", "abc12345", "letmein1", "passw0rd", "javaschool", "javaschoollab");

    public static String passwordError(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) return "Password must be at least " + MIN_PASSWORD_LENGTH + " characters";
        if (password.length() > 128) return "Password must be at most 128 characters";
        return COMMON_PASSWORDS.contains(password.toLowerCase(Locale.ROOT)) ? "That password is too common. Choose a less guessable one" : null;
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

    /** At most {@code max} characters (the column size); null stays null. */
    public static String cut(String s, int max) {
        return s == null || s.length() <= max ? s : s.substring(0, max);
    }

    public static String emptyToNull(String s) {
        return s == null || s.isEmpty() ? null : s;
    }
}
