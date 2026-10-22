package com.javaschoollab.security;

import java.time.Instant;

/** The signed-in user, as carried inside the JWT (same claims as the Node server). {@code issuedAt} is the token's iat; null for a user not read from a token. */
public record AuthUser(long id, String fullName, String email, String mobile, Instant issuedAt) {

    public AuthUser(long id, String fullName, String email, String mobile) {
        this(id, fullName, email, mobile, null);
    }
}
