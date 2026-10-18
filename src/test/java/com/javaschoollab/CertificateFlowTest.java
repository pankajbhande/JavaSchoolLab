package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CertificateFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String newLearner(String name) throws Exception {
        String email = "yesaji." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"%s","email":"%s","password":"secret123","loginType":"email"}""".formatted(name, email)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private MockHttpServletRequestBuilder as(MockHttpServletRequestBuilder b, String auth, String body) {
        return b.header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private ResultActions attempt(String auth, String moduleName, int score, int total) throws Exception {
        return mvc.perform(as(post("/api/quiz/attempts"), auth,
                "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"moduleName\":\"%s\",\"score\":%d,\"totalQuestions\":%d}"
                        .formatted(moduleName, score, total))).andExpect(status().isCreated());
    }

    private ResultActions issue(String auth, String course, String topic) throws Exception {
        return mvc.perform(as(post("/api/certificates"), auth,
                "{\"courseName\":\"%s\",\"topicName\":\"%s\"}".formatted(course, topic)));
    }

    @Test
    void certificatesNeedALoginExceptVerification() throws Exception {
        mvc.perform(post("/api/certificates").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/certificates")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/certificates/verify/JSL-NOPE-NOPE-NOPE")).andExpect(status().isNotFound());   // reachable, just unknown
    }

    @Test
    void youCannotGetACertificateWithoutPassingTheModule() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        issue(auth, "Core Java", "Java Basics").andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Pass this module's test first, then you can download the certificate."));
        attempt(auth, "Java Basics", 6, 10);                                     // 60%: a fail
        issue(auth, "Core Java", "Java Basics").andExpect(status().isForbidden());
        issue(auth, "", "Java Basics").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Course name and topic name are required"));
    }

    @Test
    void theScoreComesFromTheServerNotTheRequest() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        attempt(auth, "Java Basics", 8, 10);
        // The client tries to claim a perfect score; the body fields are simply ignored.
        mvc.perform(as(post("/api/certificates"), auth,
                        "{\"courseName\":\"Core Java\",\"topicName\":\"Java Basics\",\"score\":100,\"totalQuestions\":100}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.score").value(8))
                .andExpect(jsonPath("$.totalQuestions").value(10))
                .andExpect(jsonPath("$.studentName").value("Tanaji Malusare"))
                .andExpect(jsonPath("$.certificateUid").value(org.hamcrest.Matchers.matchesPattern("^JSL-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$")));
    }

    @Test
    void askingAgainForTheSamePassReturnsTheSameCertificate() throws Exception {
        String auth = newLearner("Baji Prabhu");
        attempt(auth, "OOP", 9, 10);
        JsonNode first = json.readTree(issue(auth, "Core Java", "OOP").andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());
        JsonNode again = json.readTree(issue(auth, "Core Java", "OOP").andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        assertThat(again.get("id").asLong()).isEqualTo(first.get("id").asLong());
        assertThat(again.get("certificateUid").asText()).isEqualTo(first.get("certificateUid").asText());

        mvc.perform(get("/api/certificates").header("Authorization", auth)).andExpect(jsonPath("$", hasSize(1)));

        // A better result later is a new, different certificate.
        attempt(auth, "OOP", 10, 10);
        JsonNode better = json.readTree(issue(auth, "Core Java", "OOP").andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString());
        assertThat(better.get("certificateUid").asText()).isNotEqualTo(first.get("certificateUid").asText());
        assertThat(better.get("score").asInt()).isEqualTo(10);
    }

    @Test
    void anyoneCanVerifyACertificateAndSeesOnlyWhatIsPrinted() throws Exception {
        String auth = newLearner("Yesaji Kank");
        attempt(auth, "Threads", 17, 20);
        String uid = json.readTree(issue(auth, "Core Java", "Threads").andReturn().getResponse().getContentAsString())
                .get("certificateUid").asText();

        mvc.perform(get("/api/certificates/verify/" + uid))                      // no Authorization header
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("max-age=60")))
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.certificateUid").value(uid))
                .andExpect(jsonPath("$.studentName").value("Yesaji Kank"))
                .andExpect(jsonPath("$.courseName").value("Core Java"))
                .andExpect(jsonPath("$.topicName").value("Threads"))
                .andExpect(jsonPath("$.score").value(17))
                .andExpect(jsonPath("$.totalQuestions").value(20))
                .andExpect(jsonPath("$.percentage").value(85))
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.mobile").doesNotExist())
                .andExpect(jsonPath("$.userId").doesNotExist());
    }

    @Test
    void unknownAndMalformedIdsAre404WithValidFalse() throws Exception {
        mvc.perform(get("/api/certificates/verify/JSL-ZZZZ-ZZZZ-ZZZZ"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.valid").value(false));
        mvc.perform(get("/api/certificates/verify/not-an-id"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.valid").value(false));
        mvc.perform(get("/api/certificates/verify/{uid}", "JSL-1' OR '1'='1"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.valid").value(false));
    }

    @Test
    void learnersOnlyListTheirOwnCertificates() throws Exception {
        String mine = newLearner("Murarbaji Deshpande");
        String theirs = newLearner("Kanhoji Angre");
        attempt(mine, "Collections", 7, 10);
        issue(mine, "Core Java", "Collections").andExpect(status().isCreated());
        mvc.perform(get("/api/certificates").header("Authorization", mine))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].topicName").value("Collections"))
                .andExpect(jsonPath("$[0].studentName").value("Murarbaji Deshpande"));
        mvc.perform(get("/api/certificates").header("Authorization", theirs)).andExpect(jsonPath("$", hasSize(0)));
        // Another learner cannot claim a certificate from someone else's pass.
        issue(theirs, "Core Java", "Collections").andExpect(status().isForbidden());
    }
}
