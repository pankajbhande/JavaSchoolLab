package com.javaschoollab;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuggestionsFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String newLearner() throws Exception {
        String email = "shivaji." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"Shivaji Raje","email":"%s","password":"secret123","loginType":"email"}""".formatted(email)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private MockHttpServletRequestBuilder as(MockHttpServletRequestBuilder b, String auth, String body) {
        return b.header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    @Test
    void needALogin() throws Exception {
        mvc.perform(get("/api/suggestions")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/suggestions").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
    }

    @Test
    void sendAndListOwnSuggestions() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/suggestions"), auth,
                        "{\"category\":\"content\",\"message\":\"The Optional lesson has a typo in orElseGet.\",\"pagePath\":\"/course/java/java8/optional\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ok").value(true));
        mvc.perform(get("/api/suggestions").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].category").value("content"))
                .andExpect(jsonPath("$[0].status").value("new"))
                .andExpect(jsonPath("$[0].pagePath").value("/course/java/java8/optional"));
        // Another learner sees none of it.
        mvc.perform(get("/api/suggestions").header("Authorization", newLearner())).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void theAdminListIsNotForOrdinaryLearners() throws Exception {
        String auth = newLearner();
        mvc.perform(get("/api/admin/suggestions").header("Authorization", auth)).andExpect(status().isForbidden());
        mvc.perform(as(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/admin/suggestions/1/status"), auth, "{\"status\":\"done\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/suggestions")).andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsABadCategoryAndATooShortMessage() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/suggestions"), auth, "{\"category\":\"spam\",\"message\":\"A perfectly long message here\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(as(post("/api/suggestions"), auth, "{\"category\":\"idea\",\"message\":\"too short\"}"))
                .andExpect(status().isBadRequest());
    }
}
