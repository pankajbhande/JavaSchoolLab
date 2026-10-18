package com.javaschoollab.security;

import com.javaschoollab.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/**
 * Issues and checks the login token. It is wire-compatible with the Node server's jsonwebtoken tokens:
 * HS256, the secret's UTF-8 bytes as the key, claims id / fullName / email / mobile. Using the same
 * JWT_SECRET in both therefore keeps everyone signed in across the switch.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration lifetime;

    public JwtService(AppProperties props) {
        String secret = props.jwt().secret();
        byte[] bytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET is not set (or shorter than 32 characters). Set it in the environment; "
                            + "use the same value as the Node server so existing logins stay valid.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.lifetime = Duration.ofDays(props.jwt().expiresDays());
    }

    public String issue(AuthUser user) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .claim("id", user.id())
                .claim("fullName", user.fullName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(lifetime)));
        if (user.email() != null) builder.claim("email", user.email());
        if (user.mobile() != null) builder.claim("mobile", user.mobile());
        // HS256 explicitly: jjwt would otherwise pick HS512 for a 64+ byte secret, which Node would reject.
        return builder.signWith(key, Jwts.SIG.HS256).compact();
    }

    /** Empty when the token is malformed, tampered with or expired. */
    public Optional<AuthUser> parse(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            Number id = c.get("id", Number.class);
            if (id == null) return Optional.empty();
            return Optional.of(new AuthUser(id.longValue(), c.get("fullName", String.class),
                    c.get("email", String.class), c.get("mobile", String.class)));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
