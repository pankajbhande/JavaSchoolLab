package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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

@SpringBootTest(properties = {"app.rate-limit.profile-per-minute=2", "app.rate-limit.handle-check-per-minute=2"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LeaderboardAndProfileLimitTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String newLearner(String name) throws Exception {
        String email = "rank." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"%s","email":"%s","password":"secret123","loginType":"email"}""".formatted(name, email)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private void topics(String auth, int n) throws Exception {
        for (int i = 0; i < n; i++) {
            mvc.perform(post("/api/progress/topic").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"t" + i + "\"}")).andExpect(status().isCreated());
        }
    }

    @Test
    void leaderboardNeedsALogin() throws Exception {
        mvc.perform(get("/api/leaderboard")).andExpect(status().isUnauthorized());
    }

    @Test
    void ranksByXpWithShortenedNamesAndMarksTheCaller() throws Exception {
        String leader = newLearner("Tanaji Malusare Patil");
        String second = newLearner("Baji Prabhu");
        String idle = newLearner("Sambhaji");
        topics(leader, 60);     // 600 XP: ahead of anyone else created by the other tests
        topics(second, 20);     // 200 XP

        JsonNode asLeader = json.readTree(mvc.perform(get("/api/leaderboard").header("Authorization", leader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.top", hasSize(lessThanOrEqualTo(20))))
                .andReturn().getResponse().getContentAsString());
        assertThat(asLeader.get("me").get("rank").asInt()).isEqualTo(1);
        assertThat(asLeader.get("me").get("xp").asInt()).isEqualTo(600);
        JsonNode first = asLeader.get("top").get(0);
        assertThat(first.get("rank").asInt()).isEqualTo(1);
        assertThat(first.get("name").asText()).isEqualTo("Tanaji P.");              // first name + last initial: never the full name
        assertThat(first.get("isMe").asBoolean()).isTrue();
        assertThat(first.get("xp").asInt()).isGreaterThanOrEqualTo(asLeader.get("top").get(1).get("xp").asInt());

        JsonNode asSecond = json.readTree(mvc.perform(get("/api/leaderboard").header("Authorization", second))
                .andReturn().getResponse().getContentAsString());
        assertThat(asSecond.get("me").get("rank").asInt()).isGreaterThan(1);
        assertThat(asSecond.get("top").get(0).get("isMe").asBoolean()).isFalse();
        assertThat(asSecond.get("total").asInt()).isEqualTo(asLeader.get("total").asInt() + 0);

        // A learner with no XP still sees their own place (last), but is not listed among the ranked top.
        JsonNode asIdle = json.readTree(mvc.perform(get("/api/leaderboard").header("Authorization", idle))
                .andReturn().getResponse().getContentAsString());
        assertThat(asIdle.get("me").get("xp").asInt()).isZero();
        assertThat(asIdle.get("me").get("rank").asInt()).isEqualTo(asIdle.get("total").asInt());
    }

    @Test
    void publicProfilesAndHandleChecksAreRateLimited() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        for (int i = 0; i < 2; i++) mvc.perform(get("/api/profiles/someone")).andExpect(status().isNotFound());
        mvc.perform(get("/api/profiles/someone"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.error").value("Too many requests. Please wait a minute and try again."));

        for (int i = 0; i < 2; i++) mvc.perform(get("/api/profile/handle-available?handle=abc").header("Authorization", auth)).andExpect(status().isOk());
        mvc.perform(get("/api/profile/handle-available?handle=abc").header("Authorization", auth)).andExpect(status().isTooManyRequests());
    }
}
