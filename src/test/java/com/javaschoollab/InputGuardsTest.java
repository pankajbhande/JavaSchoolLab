package com.javaschoollab;

import static org.hamcrest.Matchers.containsString;
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

/** Oversized or hand-made requests are refused with a clear 4xx instead of reaching the database, and one account cannot flood the writes. */
@SpringBootTest(properties = {"app.rate-limit.writes-per-minute=6", "app.site-url=https://learn.example.org/"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InputGuardsTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String token() throws Exception {
        String email = "guard." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Suryaji Kakade\",\"email\":\"" + email + "\",\"password\":\"secret-pass-1\",\"loginType\":\"email\"}"))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asText();
    }

    private ResultActions send(String url, String body, String token) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body).header("Authorization", "Bearer " + token));
    }

    @Test
    void oversizedFieldsAreRefusedNotStored() throws Exception {
        String token = token();
        String longId = "x".repeat(121);
        send("/api/quiz/attempts", "{\"courseId\":\"" + longId + "\",\"moduleId\":\"m\",\"score\":3,\"totalQuestions\":5}", token)
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value(containsString("courseId is too long")));
        send("/api/quiz/attempts", "{\"courseId\":\"c\",\"moduleId\":\"m\",\"score\":3,\"totalQuestions\":99999999999}", token)
                .andExpect(status().isBadRequest());
        send("/api/progress/topic", "{\"courseId\":\"c\",\"moduleId\":\"m\",\"topicId\":\"" + longId + "\"}", token)
                .andExpect(status().isBadRequest());
        send("/api/bookmarks", "{\"courseId\":\"c\",\"moduleId\":\"m\",\"topicId\":\"" + longId + "\"}", token)
                .andExpect(status().isBadRequest());
        send("/api/certificates", "{\"courseName\":\"" + "y".repeat(300) + "\",\"topicName\":\"t\"}", token)
                .andExpect(status().isBadRequest());
    }

    @Test
    void aBodyLargerThanAnyRealRequestIsRefusedBeforeItIsRead() throws Exception {
        String token = token();
        send("/api/notes", "{\"courseId\":\"c\",\"moduleId\":\"m\",\"topicId\":\"t\",\"body\":\"" + "z".repeat(310_000) + "\"}", token)
                .andExpect(status().isPayloadTooLarge());
    }

    @Test
    void oneAccountCannotFloodTheWrites() throws Exception {
        String token = token();
        String ok = "{\"courseId\":\"c\",\"moduleId\":\"m\",\"topicId\":\"t\"}";
        int refused = 0;
        for (int i = 0; i < 10; i++) {
            if (send("/api/progress/topic", ok, token).andReturn().getResponse().getStatus() == 429) refused++;
        }
        org.assertj.core.api.Assertions.assertThat(refused).isGreaterThan(0);
        // reading is never limited by this guard
        mvc.perform(get("/api/progress/summary").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
    }

    @Test
    void anUnknownOtpPurposeIsRefused() throws Exception {
        mvc.perform(post("/api/otp/send").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"someone@example.com\",\"identifierType\":\"email\",\"purpose\":\"<script>\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Invalid purpose"));
    }

    @Test
    void sharedLinksUseTheConfiguredSiteAddressNotTheHostHeader() throws Exception {
        String html = mvc.perform(get("/course/java").header("Host", "evil.example.net"))
                .andExpect(status().isOk()).andExpect(header().string("Content-Type", containsString("text/html")))
                .andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(html).doesNotContain("evil.example.net");
    }
}
