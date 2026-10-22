package com.javaschoollab.security;

import java.time.Instant;
import java.util.Optional;

/** Where the "tokens issued before ..." moment of each user is kept. Implemented by the user service, which owns the users table. */
public interface TokenCutoffs {

    /** Tokens issued before the returned instant are refused. {@code Instant.EPOCH} = nothing revoked; empty = no such user. */
    Optional<Instant> tokensValidFrom(long userId);

    /** Sign the user out everywhere: every token issued before {@code from} stops working. */
    void revokeTokens(long userId, Instant from);
}
