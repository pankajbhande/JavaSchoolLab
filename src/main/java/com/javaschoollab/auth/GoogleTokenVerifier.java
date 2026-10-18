package com.javaschoollab.auth;

import com.javaschoollab.common.ApiException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

/**
 * Checks a Google ID token: Google's signature (keys fetched from Google and cached), that it was issued to this site's
 * client id, that it has not expired, and that Google has verified the email. Nothing the browser sends is trusted
 * until all of that holds.
 */
@Component
public class GoogleTokenVerifier {

    private static final String KEYS = "https://www.googleapis.com/oauth2/v3/certs";
    private static final List<String> ISSUERS = List.of("https://accounts.google.com", "accounts.google.com");

    private final String clientId;
    private volatile JwtDecoder decoder;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
    }

    public boolean configured() {
        return !clientId.isEmpty();
    }

    public String clientId() {
        return clientId;
    }

    public GoogleProfile verify(String credential) {
        if (!configured()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not set up on this server.");
        }
        Jwt jwt;
        try {
            jwt = decoder().decode(credential);
        } catch (JwtException e) {
            throw ApiException.unauthorized("Google sign-in could not be verified. Please try again.");
        }
        String email = jwt.getClaimAsString("email");
        if (!Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified")) || email == null || !email.contains("@")) {
            throw ApiException.unauthorized("Your Google account has no verified email address.");
        }
        email = email.trim().toLowerCase();
        String name = jwt.getClaimAsString("name");
        return new GoogleProfile(email, name == null || name.isBlank() ? email.substring(0, email.indexOf('@')) : name.trim());
    }

    private JwtDecoder decoder() {
        JwtDecoder d = decoder;
        if (d == null) {
            NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(KEYS).build();
            OAuth2TokenValidator<Jwt> issuer = jwt -> ISSUERS.contains(String.valueOf(jwt.getClaimAsString("iss")))
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "wrong issuer", null));
            OAuth2TokenValidator<Jwt> audience = jwt -> jwt.getAudience() != null && jwt.getAudience().contains(clientId)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "wrong audience", null));
            nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), issuer, audience));
            decoder = d = nimbus;
        }
        return d;
    }
}
