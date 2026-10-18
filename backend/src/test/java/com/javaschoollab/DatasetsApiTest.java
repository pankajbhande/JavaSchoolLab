package com.javaschoollab;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** The small data sets (quiz banks, predict-output, study packs, learning paths) arrive byte-for-byte and agree with the courses. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DatasetsApiTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private byte[] body(String url) throws Exception {
        return mvc.perform(get(url)).andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
    }

    private JsonNode dataset(String name) throws Exception {
        return json.readTree(body("/api/content/datasets/" + name));
    }

    private static String sha256(byte[] b) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));
    }

    /** "courseId/topicId" for every topic in the names-only index. */
    private Set<String> topicKeys() throws Exception {
        Set<String> keys = new HashSet<>();
        for (JsonNode c : json.readTree(body("/api/content/courses")))
            for (JsonNode m : c.get("subTopics")) for (JsonNode t : m.get("topics")) keys.add(c.get("id").asText() + "/" + t.get("id").asText());
        return keys;
    }

    @Test
    void everyFileMatchesItsManifestHashAndSize() throws Exception {
        JsonNode manifest = dataset("manifest");
        assertEquals(4, manifest.get("items").size());
        for (JsonNode item : manifest.get("items")) {
            String name = item.get("name").asText();
            byte[] bytes = body("/api/content/datasets/" + name);
            assertEquals(item.get("sha256").asText(), sha256(bytes), name + " hash");
            assertEquals(item.get("bytes").asLong(), bytes.length, name + " size");
            mvc.perform(get("/api/content/datasets/" + name))   // public: no Authorization header
                    .andExpect(content().contentTypeCompatibleWith("application/json"))
                    .andExpect(header().string("Cache-Control", "no-cache"));
        }
    }

    @Test
    void manifestCountsEqualARecountFromTheData() throws Exception {
        JsonNode manifest = dataset("manifest");
        int banks = 0, questions = 0;
        for (JsonNode b : dataset("quiz-banks")) { banks++; questions += b.get("questions").size(); }
        int challenges = dataset("predict-output").size();
        int packs = 0, keypoints = 0, qa = 0, mcq = 0;
        for (JsonNode p : dataset("study-packs")) {
            packs++;
            keypoints += p.path("keypoints").size();
            qa += p.path("interview").size();
            mcq += p.path("mcq").size();
        }
        int paths = 0, steps = 0;
        for (JsonNode p : dataset("learning-paths")) { paths++; steps += p.get("steps").size(); }

        JsonNode totals = manifest.get("totals");
        assertEquals(8, banks);
        assertEquals(68, questions);
        assertEquals(99, challenges);
        assertEquals(19, packs);
        assertEquals(6, paths);
        assertEquals(totals.get("banks").asInt(), banks);
        assertEquals(totals.get("questions").asInt(), questions);
        assertEquals(totals.get("challenges").asInt(), challenges);
        assertEquals(totals.get("packs").asInt(), packs);
        assertEquals(totals.get("keypoints").asInt(), keypoints);
        assertEquals(totals.get("interviewQA").asInt(), qa);
        assertEquals(totals.get("mcq").asInt(), mcq);
        assertEquals(totals.get("paths").asInt(), paths);
        assertEquals(totals.get("steps").asInt(), steps);
        for (JsonNode item : manifest.get("items")) {
            JsonNode c = item.get("counts");
            switch (item.get("name").asText()) {
                case "quiz-banks" -> {
                    assertEquals(banks, c.get("banks").asInt());
                    assertEquals(questions, c.get("questions").asInt());
                }
                case "predict-output" -> assertEquals(challenges, c.get("challenges").asInt());
                case "study-packs" -> {
                    assertEquals(packs, c.get("packs").asInt());
                    assertEquals(keypoints, c.get("keypoints").asInt());
                    assertEquals(qa, c.get("interviewQA").asInt());
                    assertEquals(mcq, c.get("mcq").asInt());
                }
                default -> {
                    assertEquals(paths, c.get("paths").asInt());
                    assertEquals(steps, c.get("steps").asInt());
                }
            }
        }
    }

    @Test
    void etagGivesNotModified() throws Exception {
        for (String name : new String[] {"manifest", "quiz-banks", "predict-output", "study-packs", "learning-paths"}) {
            String url = "/api/content/datasets/" + name;
            String etag = mvc.perform(get(url)).andExpect(status().isOk()).andReturn().getResponse().getHeader("ETag");
            assertNotNull(etag, name);
            assertTrue(etag.startsWith("W/\"") && etag.endsWith("\""), "weak, quoted (a strong ETag would stop gzip): " + etag);
            mvc.perform(get(url).header("If-None-Match", etag)).andExpect(status().isNotModified());
            mvc.perform(get(url).header("If-None-Match", "\"other\"")).andExpect(status().isOk());
        }
    }

    @Test
    void unknownDatasetIs404() throws Exception {
        mvc.perform(get("/api/content/datasets/nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Dataset not found"));
    }

    @Test
    void predictOutputTopicsExistInTheJavaCourse() throws Exception {
        Set<String> javaTopics = new HashSet<>();
        for (String key : topicKeys()) if (key.startsWith("java/")) javaTopics.add(key.substring(5));
        for (JsonNode c : dataset("predict-output")) {
            assertTrue(javaTopics.contains(c.get("topicId").asText()), "unknown topic " + c.get("topicId").asText() + " in " + c.get("id").asText());
        }
    }

    @Test
    void studyPackKeysAndPathStepsExistInTheIndex() throws Exception {
        Set<String> keys = topicKeys();
        Set<String> courses = new HashSet<>();
        for (String k : keys) courses.add(k.substring(0, k.indexOf('/')));
        dataset("study-packs").fieldNames().forEachRemaining(k -> assertTrue(keys.contains(k), "unknown study pack " + k));
        for (JsonNode path : dataset("learning-paths"))
            for (JsonNode step : path.get("steps"))
                assertTrue(courses.contains(step.get("courseId").asText()), "unknown course " + step.get("courseId").asText());
    }

    @Test
    void quizQuestionsHaveUniqueIdsAndAValidCorrectAnswer() throws Exception {
        for (JsonNode bank : dataset("quiz-banks")) {
            Set<String> ids = new HashSet<>();
            for (JsonNode q : bank.get("questions")) {
                assertTrue(ids.add(q.get("id").asText()), "duplicate id " + q.get("id").asText() + " in " + bank.get("key").asText());
                int answer = q.get("correctAnswer").asInt();
                assertTrue(answer >= 0 && answer < q.get("options").size(), "bad correctAnswer in " + q.get("id").asText());
            }
        }
    }
}
