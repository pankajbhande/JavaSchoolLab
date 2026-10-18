package com.javaschoollab;

import com.javaschoollab.user.Identifier;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
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

/** The whole sign-in journey against the real Spring context, with H2 standing in for MySQL. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private ResultActions send(String url, String body) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private static String uniqueEmail() {
        return "abaji." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    /** send + verify; returns the six-digit code (the test profile echoes it, as OTP_DEV_ECHO does in dev). */
    private String verifiedOtp(String email, String purpose) throws Exception {
        String sent = send("/api/otp/send", """
                {"identifier":"%s","identifierType":"email","purpose":"%s"}""".formatted(email, purpose))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expiresIn").value(300))
                .andReturn().getResponse().getContentAsString();
        String otp = json.readTree(sent).get("_dev_otp").asText();
        send("/api/otp/verify", """
                {"identifier":"%s","identifierType":"email","otp":"%s","purpose":"%s"}""".formatted(email, otp, purpose))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true));
        return otp;
    }

    private String register(String email, String password) throws Exception {
        String otp = verifiedOtp(email, "register");
        String body = send("/api/auth/register-otp", """
                {"fullName":"Tanaji Malusare","email":"%s","password":"%s","loginType":"email","otp":"%s",
                 "gender":"Male","dob":"1995-08-20","organization":"Sinhagad Fort"}""".formatted(email, password, otp))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email").value(email))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asText();
    }

    @Test
    void registerWithOtpThenReadProfile() throws Exception {
        String email = uniqueEmail();
        String token = register(email, "secret123");

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Tanaji Malusare"))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.loginType").value("email"))
                .andExpect(jsonPath("$.dob").value("1995-08-20"))
                .andExpect(jsonPath("$.organization").value("Sinhagad Fort"))
                .andExpect(jsonPath("$.avatar").value(nullValue()))
                .andExpect(jsonPath("$.password_hash").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void aSpentOtpCannotRegisterTwice() throws Exception {
        String email = uniqueEmail();
        String otp = verifiedOtp(email, "register");
        String body = """
                {"fullName":"Baji Prabhu","email":"%s","password":"secret123","loginType":"email","otp":"%s"}""".formatted(email, otp);
        send("/api/auth/register-otp", body).andExpect(status().isCreated());
        send("/api/auth/register-otp", body).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("OTP not verified. Please verify OTP first."));
    }

    @Test
    void registerNeedsAVerifiedOtp() throws Exception {
        send("/api/auth/register-otp", """
                {"fullName":"Baji Prabhu","email":"%s","password":"secret123","loginType":"email","otp":"123456"}""".formatted(uniqueEmail()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void wrongOtpIsRejected() throws Exception {
        String email = uniqueEmail();
        send("/api/otp/send", """
                {"identifier":"%s","identifierType":"email","purpose":"register"}""".formatted(email)).andExpect(status().isOk());
        send("/api/otp/verify", """
                {"identifier":"%s","identifierType":"email","otp":"000000","purpose":"register"}""".formatted(email))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid or expired OTP. Please try again."));
    }

    @Test
    void otpRequestsAreValidated() throws Exception {
        send("/api/otp/send", """
                {"identifier":"not-an-email","identifierType":"email","purpose":"register"}""")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(containsString("valid email")));
        send("/api/otp/send", """
                {"identifier":"x@y.zz","identifierType":"fax","purpose":"register"}""")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Identifier type must be email or mobile"));
        send("/api/otp/send", "{}").andExpect(status().isBadRequest());
    }

    @Test
    void cannotRegisterAnExistingEmailOrLoginWithAnUnknownOne() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123");
        send("/api/otp/send", """
                {"identifier":"%s","identifierType":"email","purpose":"register"}""".formatted(email))
                .andExpect(status().isConflict());
        send("/api/otp/send", """
                {"identifier":"%s","identifierType":"email","purpose":"login"}""".formatted(uniqueEmail()))
                .andExpect(status().isNotFound());
    }

    @Test
    void passwordLogin() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123");

        send("/api/auth/login", """
                {"email":"%s","password":"secret123","loginType":"email"}""".formatted(email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.fullName").value("Tanaji Malusare"));
        send("/api/auth/login", """
                {"email":"%s","password":"wrong","loginType":"email"}""".formatted(email))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid password"));
        send("/api/auth/login", """
                {"email":"%s","password":"secret123","loginType":"email"}""".formatted(uniqueEmail()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("User not found. Please register first."));
        send("/api/auth/login", """
                {"loginType":"email"}""").andExpect(status().isBadRequest());
    }

    @Test
    void otpLoginIsSingleUse() throws Exception {
        String email = uniqueEmail();
        register(email, "secret123");

        String otp = verifiedOtp(email, "login");
        String body = """
                {"email":"%s","loginType":"email","otp":"%s"}""".formatted(email, otp);
        send("/api/auth/login-otp", body).andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
        send("/api/auth/login-otp", body).andExpect(status().isUnauthorized());
    }

    @Test
    void registerWithPasswordOnlyStillWorksAndRejectsDuplicates() throws Exception {
        String email = uniqueEmail();
        String body = """
                {"fullName":"Yesaji Kank","email":"%s","password":"secret123","loginType":"email"}""".formatted(email);
        send("/api/auth/register", body).andExpect(status().isCreated());
        send("/api/auth/register", body).andExpect(status().isConflict());
        send("/api/auth/register", """
                {"fullName":"Yesaji Kank","email":"%s","password":"abc","loginType":"email"}""".formatted(uniqueEmail()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Password must be at least 4 characters"));
    }

    @Test
    void changePassword() throws Exception {
        String email = uniqueEmail();
        String token = register(email, "secret123");
        String auth = "Bearer " + token;

        mvc.perform(post("/api/auth/change-password").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"nope\",\"newPassword\":\"newsecret1\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Current password is incorrect"));
        mvc.perform(post("/api/auth/change-password").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"secret123\",\"newPassword\":\"abc\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/change-password").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"secret123\",\"newPassword\":\"newsecret1\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ok").value(true));

        send("/api/auth/login", """
                {"email":"%s","password":"newsecret1","loginType":"email"}""".formatted(email)).andExpect(status().isOk());
        send("/api/auth/login", """
                {"email":"%s","password":"secret123","loginType":"email"}""".formatted(email)).andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRoutesNeedAValidToken() throws Exception {
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Login required"));
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer garbage"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Invalid or expired token"));
        // Routes that aren't ported yet must not leak: still behind the login wall.
        mvc.perform(get("/api/progress/summary")).andExpect(status().isUnauthorized());
    }

    @Test
    void publicRoutesIgnoreAStaleToken() throws Exception {
        mvc.perform(get("/api/visitors/count").header("Authorization", "Bearer stale.token.here"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(greaterThanOrEqualTo(41)));
    }

    @Test
    void visitorCounterIncrements() throws Exception {
        String before = mvc.perform(get("/api/visitors/count")).andReturn().getResponse().getContentAsString();
        long start = json.readTree(before).get("count").asLong();
        String after = mvc.perform(post("/api/visitors/increment")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode n = json.readTree(after);
        org.assertj.core.api.Assertions.assertThat(n.get("count").asLong()).isEqualTo(start + 1);
    }

    @Test
    void servesTheReactSiteAndItsClientSideRoutes() throws Exception {
        // "/" is forwarded to index.html by the servlet container (MockMvc does not follow forwards).
        mvc.perform(get("/")).andExpect(status().isOk());
        mvc.perform(get("/index.html")).andExpect(status().isOk()).andExpect(content().string(containsString("test shell")));
        // A refresh or shared link on a React Router route must load the app, not 404.
        mvc.perform(get("/course/java/basics/Constructor_in_java"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("test shell")));
        // A missing real file is a genuine 404, and unknown API paths are never answered with the site.
        mvc.perform(get("/assets/missing-abc123.js")).andExpect(status().isNotFound());
        mvc.perform(get("/api/does-not-exist")).andExpect(status().isUnauthorized());
        mvc.perform(get("/course/java")).andExpect(content().string(not(containsString("error"))));
    }

    @Test
    void corsAllowsAnyOriginWhenNoneIsConfigured() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/auth/login")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
    }
}
