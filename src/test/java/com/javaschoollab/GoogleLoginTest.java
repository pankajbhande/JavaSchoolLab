package com.javaschoollab;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.auth.GoogleProfile;
import com.javaschoollab.auth.GoogleTokenVerifier;
import com.javaschoollab.common.ApiException;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** "Continue with Google", with Google's token check replaced by a stub (the real check needs a real Google token). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoogleLoginTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean GoogleTokenVerifier google;

    private ResultActions google(String credential) throws Exception {
        return mvc.perform(post("/api/auth/google").contentType(MediaType.APPLICATION_JSON)
                .content("{\"credential\":\"" + credential + "\"}"));
    }

    @Test
    void firstGoogleSignInCreatesTheAccountAndLaterOnesReuseIt() throws Exception {
        String email = "shambhuraje." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        when(google.verify("token-1")).thenReturn(new GoogleProfile(email, "Shambhuraje Bhosale"));

        String first = google("token-1").andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.fullName").value("Shambhuraje Bhosale"))
                .andExpect(jsonPath("$.user.loginType").value("email"))
                .andReturn().getResponse().getContentAsString();
        String token = json.readTree(first).get("token").asText();
        long id = json.readTree(first).get("user").get("id").asLong();

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email));

        // Signing in again finds the same account instead of making a second one.
        google("token-1").andExpect(status().isOk()).andExpect(jsonPath("$.user.id").value(id));
    }

    @Test
    void anExistingPasswordAccountWithTheSameEmailIsSignedIn() throws Exception {
        String email = "tanaji." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        when(google.verify("token-a")).thenReturn(new GoogleProfile(email, "Tanaji Malusare"));
        long id = json.readTree(google("token-a").andReturn().getResponse().getContentAsString()).get("user").get("id").asLong();

        when(google.verify("token-b")).thenReturn(new GoogleProfile(email, "A Different Name"));
        google("token-b").andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(id))
                .andExpect(jsonPath("$.user.fullName").value("Tanaji Malusare"));
    }

    @Test
    void aTokenGoogleRejectsIsRejected() throws Exception {
        when(google.verify(anyString())).thenThrow(ApiException.unauthorized("Google sign-in could not be verified. Please try again."));
        google("forged").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value(containsString("could not be verified")));
    }

    @Test
    void aMissingCredentialIsABadRequest() throws Exception {
        mvc.perform(post("/api/auth/google").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void theLoginFormCanReadTheClientIdWithoutSigningIn() throws Exception {
        when(google.clientId()).thenReturn("123-abc.apps.googleusercontent.com");
        mvc.perform(get("/api/auth/config")).andExpect(status().isOk())
                .andExpect(jsonPath("$.googleClientId").value("123-abc.apps.googleusercontent.com"));
    }
}
