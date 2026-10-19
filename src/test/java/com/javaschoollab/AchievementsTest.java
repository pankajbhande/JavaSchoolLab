package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.achievements.AchievementsServiceAccess;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Levels and badges: earned from real activity, celebrated once, never announced for what a learner already had. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AchievementsTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private ResultActions send(String url, String body, String token) throws Exception {
        var req = post(url).contentType(MediaType.APPLICATION_JSON).content(body);
        if (token != null) req.header("Authorization", "Bearer " + token);
        return mvc.perform(req);
    }

    private String newLearner() throws Exception {
        String email = "ach." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String sent = send("/api/otp/send", "{\"identifier\":\"%s\",\"identifierType\":\"email\",\"purpose\":\"register\"}".formatted(email), null).andReturn().getResponse().getContentAsString();
        String otp = json.readTree(sent).get("_dev_otp").asText();
        send("/api/otp/verify", "{\"identifier\":\"%s\",\"identifierType\":\"email\",\"otp\":\"%s\",\"purpose\":\"register\"}".formatted(email, otp), null);
        String r = send("/api/auth/register-otp", "{\"fullName\":\"Ach Learner\",\"email\":\"%s\",\"password\":\"Test1234\",\"loginType\":\"email\",\"otp\":\"%s\"}".formatted(email, otp), null).andReturn().getResponse().getContentAsString();
        return json.readTree(r).get("token").asText();
    }

    private void openTopic(String token, String topic) throws Exception {
        send("/api/progress/topic", "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"%s\"}".formatted(topic), token).andExpect(status().is2xxSuccessful());
    }

    private JsonNode achievements(String token) throws Exception {
        return json.readTree(mvc.perform(get("/api/achievements").header("Authorization", "Bearer " + token)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    private static JsonNode badge(JsonNode a, String id) {
        for (JsonNode b : a.get("badges")) if (id.equals(b.get("id").asText())) return b;
        throw new AssertionError("no badge " + id);
    }

    private static boolean announced(JsonNode a, String id) {
        for (JsonNode n : a.get("newlyEarned")) if (id.equals(n.get("id").asText())) return true;
        return false;
    }

    @Test
    void needsLogin() throws Exception {
        mvc.perform(get("/api/achievements")).andExpect(status().is4xxClientError());
    }

    @Test
    void aNewLearnerStartsAtTornaWithNothingEarned() throws Exception {
        JsonNode a = achievements(newLearner());
        assertThat(a.at("/level/number").asInt()).isEqualTo(1);
        assertThat(a.at("/level/name").asText()).isEqualTo("Torna");
        assertThat(a.at("/level/nextName").asText()).isEqualTo("Sinhagad");
        assertThat(a.get("totalEarned").asInt()).isZero();
        assertThat(a.get("totalBadges").asInt()).isEqualTo(a.get("badges").size());
        assertThat(a.get("newlyEarned")).isEmpty();
        assertThat(badge(a, "first-step").get("earned").asBoolean()).isFalse();
    }

    @Test
    void aBadgeIsAnnouncedOnceWhenEarnedAndNeverAgain() throws Exception {
        String token = newLearner();
        achievements(token);                                   // the first look: nothing earned yet
        openTopic(token, "t1");
        JsonNode second = achievements(token);
        assertThat(announced(second, "first-step")).isTrue();
        assertThat(badge(second, "first-step").get("earned").asBoolean()).isTrue();
        assertThat(badge(second, "first-step").get("earnedAt").isNull()).isFalse();
        assertThat(second.get("newlyEarned").get(0).get("message").asText()).isNotBlank();
        JsonNode third = achievements(token);
        assertThat(third.get("newlyEarned")).as("already celebrated").isEmpty();
        assertThat(badge(third, "first-step").get("earned").asBoolean()).isTrue();
    }

    @Test
    void whatALearnerAlreadyHadBeforeTheFirstLookIsRecordedQuietly() throws Exception {
        String token = newLearner();
        openTopic(token, "a1");                                // progress exists before anyone has looked at achievements
        JsonNode first = achievements(token);
        assertThat(badge(first, "first-step").get("earned").asBoolean()).isTrue();
        assertThat(first.get("newlyEarned")).as("no flood of pop-ups for old progress").isEmpty();
    }

    @Test
    void progressTowardABadgeIsReportedAndCapped() throws Exception {
        String token = newLearner();
        achievements(token);
        for (int i = 0; i < 3; i++) openTopic(token, "p" + i);
        JsonNode a = achievements(token);
        assertThat(badge(a, "curious-10").get("progress").asInt()).isEqualTo(3);
        assertThat(badge(a, "curious-10").get("target").asInt()).isEqualTo(10);
        assertThat(badge(a, "curious-10").get("earned").asBoolean()).isFalse();
    }

    @Test
    void levelsAreNamedAfterFortsAndAdvanceWithXp() {
        assertThat(AchievementsServiceAccess.levelName(0)).isEqualTo("Torna");
        assertThat(AchievementsServiceAccess.levelName(99)).isEqualTo("Torna");
        assertThat(AchievementsServiceAccess.levelName(100)).isEqualTo("Sinhagad");
        assertThat(AchievementsServiceAccess.levelName(700)).isEqualTo("Pratapgad");
        assertThat(AchievementsServiceAccess.levelName(3000)).isEqualTo("Raigad");
        assertThat(AchievementsServiceAccess.levelName(99999)).isEqualTo("Raigad");
    }
}
