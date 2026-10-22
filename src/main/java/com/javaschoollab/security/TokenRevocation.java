package com.javaschoollab.security;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Lets a login token be cut off before its 7 days are over: a password change, or "sign out of all devices", records a moment in the
 * database and every token issued before it is refused. The moment is cached for a few seconds per user so the check is not a
 * database call on every request; another app server notices a revocation within {@link #CACHE_SECONDS} seconds, this one at once.
 */
@Component
public class TokenRevocation {

    static final long CACHE_SECONDS = 15;

    private record Cached(Instant validFrom, long loadedAtMillis) {}

    private final TokenCutoffs users;
    private final Clock clock;
    private final Map<Long, Cached> cache = new ConcurrentHashMap<>();

    public TokenRevocation(TokenCutoffs users) {
        this.users = users;
        this.clock = Clock.systemUTC();
    }

    /** True when the token was issued before the user's cut-off (or the user no longer exists). Tokens without an iat are left alone. */
    public boolean isRevoked(AuthUser user) {
        if (user.issuedAt() == null) return false;
        Instant validFrom = validFrom(user.id());
        if (validFrom == null) return true;                          // the account was deleted
        // Compared in whole seconds: a token is issued with a second-precision iat, and the token handed out right after a password
        // change carries the same second as the cut-off, so it must stay valid.
        return user.issuedAt().isBefore(validFrom.truncatedTo(ChronoUnit.SECONDS));
    }

    /** Refuse every token issued before now. */
    public void revokeAll(long userId) {
        Instant now = clock.instant();
        users.revokeTokens(userId, now);
        cache.put(userId, new Cached(now, clock.millis()));
    }

    public void forget(long userId) {
        cache.remove(userId);
    }

    private Instant validFrom(long userId) {
        long now = clock.millis();
        Cached c = cache.get(userId);
        if (c != null && now - c.loadedAtMillis() < CACHE_SECONDS * 1000) return c.validFrom();
        Instant loaded = users.tokensValidFrom(userId).orElse(null);
        if (cache.size() > 20000) cache.clear();                     // keep memory bounded
        if (loaded != null) cache.put(userId, new Cached(loaded, now));
        return loaded;
    }
}
