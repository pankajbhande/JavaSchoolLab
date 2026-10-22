package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.javaschoollab.config.AppProperties;
import com.javaschoollab.security.AuthUser;
import com.javaschoollab.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Proves the switch from the Node server is invisible to existing users: tokens and password hashes
 * made by Node (jsonwebtoken, bcryptjs) are accepted here, and ours are accepted there.
 */
class CompatibilityTest {

    private static final String SECRET = "test-secret-test-secret-test-secret-1234";

    /** Made by Node: jwt.sign({id:7, fullName:'Abaji Rao', email:'abaji@example.com', mobile:null, exp:4102444800}, SECRET). */
    private static final String NODE_TOKEN =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZnVsbE5hbWUiOiJBYmFqaSBSYW8iLCJlbWFpbCI6ImFiYWppQGV4YW1wbGUuY29tIiwibW9iaWxlIjpudWxsLCJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTc5MjMzMzk1NX0.3fJeVKZcUTXWPtHnNiqa224wAZWra2QLNKSZZf31h4M";

    /** Made by Node: bcryptjs.hashSync('secret123', 10). */
    private static final String NODE_HASH = "$2a$10$/1zuLNHwyw2qZ.BqlZKUlelVMZLLiaJvAeDiN54xNAhUgHKXmZr9G";

    private static JwtService jwt(String secret) {
        return new JwtService(new AppProperties(new AppProperties.Jwt(secret, 7), new AppProperties.Cors(""),
                new AppProperties.Otp(false), new AppProperties.Mail("", 465, "", "", "", ""), new AppProperties.RateLimit(60, 60, 40, 10, 3, 6)));
    }

    @Test
    void acceptsATokenIssuedByTheNodeServer() {
        var user = jwt(SECRET).parse(NODE_TOKEN);
        assertThat(user).isPresent();
        assertThat(user.get()).usingRecursiveComparison().ignoringFields("issuedAt")
                .isEqualTo(new AuthUser(7, "Abaji Rao", "abaji@example.com", null));
    }

    @Test
    void rejectsATokenSignedWithAnotherSecret() {
        assertThat(jwt("another-secret-another-secret-another-1").parse(NODE_TOKEN)).isEmpty();
    }

    @Test
    void rejectsGarbageAndTamperedTokens() {
        JwtService service = jwt(SECRET);
        assertThat(service.parse("not.a.token")).isEmpty();
        assertThat(service.parse("")).isEmpty();
        assertThat(service.parse(NODE_TOKEN.substring(0, NODE_TOKEN.length() - 2) + "xx")).isEmpty();
    }

    @Test
    void roundTripsItsOwnTokens() {
        JwtService service = jwt(SECRET);
        var user = new AuthUser(42, "Tanaji Malusare", null, "9876543210");
        var parsed = service.parse(service.issue(user));
        assertThat(parsed).isPresent();
        assertThat(parsed.get()).usingRecursiveComparison().ignoringFields("issuedAt").isEqualTo(user);
        assertThat(parsed.get().issuedAt()).isNotNull();
    }

    @Test
    void signsWithHs256EvenForALongSecretSoNodeCanVerifyIt() {
        // jjwt would pick HS512 for a 64+ byte key by default; Node's server is configured for HS256.
        String longSecret = "a".repeat(96);
        String token = jwt(longSecret).issue(new AuthUser(1, "x", "x@y.zz", null));
        String header = new String(Base64.getUrlDecoder().decode(token.split("\\.")[0]), StandardCharsets.UTF_8);
        assertThat(header).contains("\"alg\":\"HS256\"");
    }

    @Test
    void refusesToStartWithoutAUsableSecret() {
        assertThatThrownBy(() -> jwt("")).isInstanceOf(IllegalStateException.class).hasMessageContaining("JWT_SECRET");
        assertThatThrownBy(() -> jwt("too-short")).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void verifiesPasswordHashesCreatedByBcryptjs() {
        var encoder = new BCryptPasswordEncoder(10);
        assertThat(encoder.matches("secret123", NODE_HASH)).isTrue();
        assertThat(encoder.matches("wrong-password", NODE_HASH)).isFalse();
    }
}
