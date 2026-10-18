package com.javaschoollab.user;

import com.javaschoollab.common.ApiException;

import java.util.Optional;

/**
 * How a learner signs in. The users table column is chosen from this enum and never from request text,
 * so a caller-supplied string can't reach the SQL (the same allowlist idea as IDENTIFIER_COLUMNS in Node).
 */
public enum Identifier {
    EMAIL("email"),
    MOBILE("mobile");

    private final String column;

    Identifier(String column) {
        this.column = column;
    }

    public String column() {
        return column;
    }

    public String wire() {
        return column;
    }

    public static Optional<Identifier> of(String value) {
        if ("email".equals(value)) return Optional.of(EMAIL);
        if ("mobile".equals(value)) return Optional.of(MOBILE);
        return Optional.empty();
    }

    /**
     * Sign-up, sign-in and one-time codes are email only. Mobile numbers stay a known identifier (old accounts and
     * the users.mobile column) but nobody can register or sign in with one, and no code is ever sent to one.
     */
    public static Identifier emailOnly(String value) {
        if (EMAIL.wire().equals(value)) return EMAIL;
        throw ApiException.badRequest("Only email is supported for sign-up and sign-in. Please use your email address.");
    }
}
