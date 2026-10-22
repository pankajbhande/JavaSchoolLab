package com.javaschoollab;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Brute-force limits, no account enumeration, token revocation, account export and deletion, and the browser security headers. */
@SpringBootTest(properties = {"app.rate-limit.login-per-minute=3", "app.rate-limit.otp-send-per-minute=2", "app.rate-limit.otp-verify-per-minute=3"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthHardeningTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private ResultActions send(String method, String url, String body, String token) throws Exception {
        var b = "DELETE".equals(method) ? delete(url) : post(url);
        b.contentType(MediaType.APPLICATION_JSON).content(body);
        if (token != null) b.header("Authorization", "Bearer " + token);
        return mvc.perform(b);
    }

    private static String email() {
        return "hard." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    private String registerWithPassword(String email, String password) throws Exception {
        String body = send("POST", "/api/auth/register", """
                {"fullName":"Baji Prabhu","email":"%s","password":"%s","loginType":"email"}""".formatted(email, password), null)
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asText();
    }

    @Test
    void passwordGuessingIsStoppedPerAccount() throws Exception {
        String email = email();
        String login = """
                {"email":"%s","password":"wrong-guess","loginType":"email"}""".formatted(email);
        for (int i = 0; i < 3; i++) send("POST", "/api/auth/login", login, null).andExpect(status().isUnauthorized());
        send("POST", "/api/auth/login", login, null)
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.error").value(containsString("Too many attempts")));
    }

    @Test
    void oneTimeCodesCannotBeGuessedOrFlooded() throws Exception {
        String email = email();
        String sendBody = """
                {"identifier":"%s","identifierType":"email","purpose":"register"}""".formatted(email);
        send("POST", "/api/otp/send", sendBody, null).andExpect(status().isOk());
        send("POST", "/api/otp/send", sendBody, null).andExpect(status().isOk());
        send("POST", "/api/otp/send", sendBody, null).andExpect(status().isTooManyRequests());

        String other = email();
        String verify = """
                {"identifier":"%s","identifierType":"email","otp":"000000","purpose":"register"}""".formatted(other);
        for (int i = 0; i < 3; i++) send("POST", "/api/otp/verify", verify, null).andExpect(status().isUnauthorized());
        send("POST", "/api/otp/verify", verify, null).andExpect(status().isTooManyRequests());
    }

    @Test
    void anUnknownAccountIsNotDistinguishableFromAKnownOne() throws Exception {
        String known = email();
        registerWithPassword(known, "secret-pass-1");
        String sentKnown = send("POST", "/api/otp/send", """
                {"identifier":"%s","identifierType":"email","purpose":"login"}""".formatted(known), null)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String sentUnknown = send("POST", "/api/otp/send", """
                {"identifier":"%s","identifierType":"email","purpose":"login"}""".formatted(email()), null)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        // same fields; only the (development-only) echoed code differs
        org.assertj.core.api.Assertions.assertThat(json.readTree(sentUnknown).get("message")).isEqualTo(json.readTree(sentKnown).get("message"));
        org.assertj.core.api.Assertions.assertThat(json.readTree(sentUnknown).get("expiresIn")).isEqualTo(json.readTree(sentKnown).get("expiresIn"));
    }

    @Test
    void changingThePasswordSignsOutEveryOtherDevice() throws Exception {
        String email = email();
        String oldToken = registerWithPassword(email, "secret-pass-1");
        Thread.sleep(1100);   // tokens carry whole-second timestamps

        String body = send("POST", "/api/auth/change-password",
                "{\"currentPassword\":\"secret-pass-1\",\"newPassword\":\"secret-pass-2\"}", oldToken)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String newToken = json.readTree(body).get("token").asText();

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + oldToken)).andExpect(status().isForbidden());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + newToken)).andExpect(status().isOk());
    }

    @Test
    void signOutEverywhereRefusesEarlierTokens() throws Exception {
        String token = registerWithPassword(email(), "secret-pass-1");
        Thread.sleep(1100);
        send("POST", "/api/auth/logout-all", "{}", token).andExpect(status().isOk());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
    }

    @Test
    void anAccountCanBeDownloadedAndDeleted() throws Exception {
        String email = email();
        String token = registerWithPassword(email, "secret-pass-1");

        String exported = mvc.perform(get("/api/account/export").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("javaschoollab-my-data.json")))
                .andExpect(jsonPath("$.bookmarks").isArray())
                .andReturn().getResponse().getContentAsString().toLowerCase();
        org.assertj.core.api.Assertions.assertThat(exported).contains(email).doesNotContain("password_hash");

        send("DELETE", "/api/account", "{\"confirm\":\"someone-else@example.com\"}", token).andExpect(status().isBadRequest());
        send("DELETE", "/api/account", "{\"confirm\":\"" + email.toUpperCase() + "\"}", token).andExpect(status().isOk());

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
        send("POST", "/api/auth/login", """
                {"email":"%s","password":"secret-pass-1","loginType":"email"}""".formatted(email), null).andExpect(status().isUnauthorized());
    }

    @Test
    void browserSecurityHeadersAreSent() throws Exception {
        mvc.perform(get("/api/visitors/count"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().string("Permissions-Policy", containsString("camera=()")))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")))
                .andExpect(header().string("Content-Security-Policy-Report-Only", containsString("script-src 'self'")))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }
}
