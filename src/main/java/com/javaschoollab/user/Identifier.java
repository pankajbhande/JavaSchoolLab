package com.javaschoollab.user;

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
}
