package com.javaschoollab;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class NotesFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String newLearner() throws Exception {
        String email = "tanaji." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"Tanaji Malusare","email":"%s","password":"secret123","loginType":"email"}""".formatted(email)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private MockHttpServletRequestBuilder as(MockHttpServletRequestBuilder b, String auth, String body) {
        return b.header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    @Test
    void needALogin() throws Exception {
        mvc.perform(get("/api/bookmarks")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/notes")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/bookmarks").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/notes").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
    }

    @Test
    void bookmarkAddListUpdateAndRemove() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/bookmarks"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"ctor\",\"topicName\":\"Constructor in Java\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.ok").value(true));
        // Same topic again: still one bookmark, with the newer name.
        mvc.perform(as(post("/api/bookmarks"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"ctor\",\"topicName\":\"Constructors\"}"))
                .andExpect(status().isCreated());
        // No topicName: it defaults to the topic id.
        mvc.perform(as(post("/api/bookmarks"), auth, "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"static\"}"))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/bookmarks").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[?(@.topicId=='ctor')].topicName").value("Constructors"))
                .andExpect(jsonPath("$[?(@.topicId=='static')].topicName").value("static"))
                .andExpect(jsonPath("$[0].createdAt").exists());

        mvc.perform(as(delete("/api/bookmarks"), auth, "{\"courseId\":\"java\",\"topicId\":\"ctor\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ok").value(true));
        mvc.perform(get("/api/bookmarks").header("Authorization", auth)).andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void bookmarkRequestsAreValidated() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/bookmarks"), auth, "{\"courseId\":\"java\",\"moduleId\":\"basics\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("courseId, moduleId and topicId are required"));
        mvc.perform(as(delete("/api/bookmarks"), auth, "{\"courseId\":\"java\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("courseId and topicId are required"));
        mvc.perform(delete("/api/bookmarks").header("Authorization", auth)).andExpect(status().isBadRequest());
    }

    @Test
    void aVeryLongTopicNameIsCutTo200Characters() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/bookmarks"), auth,
                "{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"t\",\"topicName\":\"" + "x".repeat(500) + "\"}"));
        mvc.perform(get("/api/bookmarks").header("Authorization", auth))
                .andExpect(jsonPath("$[0].topicName").value("x".repeat(200)));
    }

    @Test
    void noteSaveEditAndEmptyBodyDeletes() throws Exception {
        String auth = newLearner();
        mvc.perform(as(put("/api/notes"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"ctor\",\"topicName\":\"Constructor\",\"body\":\"this() must be first\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ok").value(true)).andExpect(jsonPath("$.deleted").doesNotExist());
        mvc.perform(as(put("/api/notes"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"ctor\",\"topicName\":\"Constructor\",\"body\":\"edited\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/notes").header("Authorization", auth))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].body").value("edited"))
                .andExpect(jsonPath("$[0].topicName").value("Constructor"))
                .andExpect(jsonPath("$[0].updatedAt").exists());

        // A blank body removes the note, so the list never holds empty notes.
        mvc.perform(as(put("/api/notes"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"ctor\",\"body\":\"   \\n \"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.deleted").value(true));
        mvc.perform(get("/api/notes").header("Authorization", auth)).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void noteRequestsAreValidatedAndCappedAt10000Characters() throws Exception {
        String auth = newLearner();
        mvc.perform(as(put("/api/notes"), auth, "{\"courseId\":\"java\",\"body\":\"x\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("courseId, moduleId and topicId are required"));
        mvc.perform(as(put("/api/notes"), auth,
                "{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"t\",\"body\":\"" + "y".repeat(12_000) + "\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/notes").header("Authorization", auth))
                .andExpect(jsonPath("$[0].body").value("y".repeat(10_000)));
    }

    @Test
    void learnersOnlySeeTheirOwnBookmarksAndNotes() throws Exception {
        String first = newLearner();
        String second = newLearner();
        mvc.perform(as(post("/api/bookmarks"), first, "{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"private\"}"));
        mvc.perform(as(put("/api/notes"), first, "{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"private\",\"body\":\"secret\"}"));
        mvc.perform(get("/api/bookmarks").header("Authorization", second)).andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/notes").header("Authorization", second)).andExpect(jsonPath("$", hasSize(0)));
        // And one learner can't delete another's bookmark by guessing ids.
        mvc.perform(as(delete("/api/bookmarks"), second, "{\"courseId\":\"java\",\"topicId\":\"private\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/bookmarks").header("Authorization", first)).andExpect(jsonPath("$", hasSize(1)));
    }
}
