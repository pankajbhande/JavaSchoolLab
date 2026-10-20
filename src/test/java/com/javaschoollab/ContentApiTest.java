package com.javaschoollab;

import static org.hamcrest.Matchers.containsString;
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
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** The course content API against the exported JSON: every course must arrive byte-for-byte and recount to the manifest. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContentApiTest {

    private static final String[] COUNT_KEYS = {"modules", "topics", "blocks", "codeExamples", "codeExplanations",
            "interviewQA", "cheatNotes", "interviewQuestions"};

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private byte[] body(String url) throws Exception {
        return mvc.perform(get(url)).andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
    }

    /** The id goes in as a URI template variable, so spaces are encoded by MockMvc. */
    private byte[] course(String id) throws Exception {
        return mvc.perform(get("/api/content/courses/{id}", id)).andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
    }

    private static String sha256(byte[] b) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));
    }

    @Test
    void indexListsAllCoursesAndTopics() throws Exception {
        JsonNode index = json.readTree(body("/api/content/courses"));
        assertTrue(index.size() >= 29, "courses in the index: " + index.size());
        int topics = 0;
        for (JsonNode c : index) for (JsonNode m : c.get("subTopics")) topics += m.get("topics").size();
        assertTrue(topics > 3000, "topics in the index: " + topics);
        mvc.perform(get("/api/content/courses"))   // no Authorization header: the content is public
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(header().string("Cache-Control", "no-cache"));
    }

    @Test
    void everyCourseMatchesItsManifestHashAndCounts() throws Exception {
        JsonNode manifest = json.readTree(body("/api/content/manifest"));
        assertEquals(json.readTree(body("/api/content/courses")).size(), manifest.get("items").size(), "manifest lists every course in the index");
        for (JsonNode item : manifest.get("items")) {
            String id = item.get("id").asText();
            byte[] bytes = course(id);
            assertEquals(item.get("sha256").asText(), sha256(bytes), id + " hash");
            assertEquals(item.get("bytes").asLong(), bytes.length, id + " size");
            JsonNode course = json.readTree(bytes);
            assertEquals(id, course.get("id").asText());
            int[] counted = recount(course);
            for (int i = 0; i < COUNT_KEYS.length; i++) {
                assertEquals(item.get("counts").get(COUNT_KEYS[i]).asInt(), counted[i], id + " " + COUNT_KEYS[i]);
            }
        }
    }

    /** Same order as COUNT_KEYS. */
    private static int[] recount(JsonNode course) {
        int modules = course.get("subTopics").size(), topics = 0, blocks = 0, examples = 0, explanations = 0, qa = 0;
        for (JsonNode m : course.get("subTopics")) for (JsonNode t : m.get("topics")) {
            topics++;
            qa += t.path("interviewQA").size();
            for (String level : new String[] {"beginner", "intermediate", "expert"}) {
                for (JsonNode b : t.path(level)) {
                    blocks++;
                    examples += b.path("codeExamples").size();
                    explanations += b.path("codeExplanations").size();
                }
            }
        }
        int questions = 0;
        for (JsonNode q : course.get("interviewQuestions")) questions += q.get("questions").size();
        return new int[] {modules, topics, blocks, examples, explanations, qa, course.get("cheatNotes").size(), questions};
    }

    @Test
    void servedIndexAgreesWithTheCourseFiles() throws Exception {
        JsonNode index = json.readTree(body("/api/content/courses"));
        for (JsonNode entry : index) {
            JsonNode course = json.readTree(course(entry.get("id").asText()));
            assertEquals(course.get("name").asText(), entry.get("name").asText());
            assertEquals(topicKeys(course), topicKeys(entry), entry.get("id").asText());
        }
    }

    private static Set<String> topicKeys(JsonNode course) {
        Set<String> keys = new HashSet<>();
        for (JsonNode m : course.get("subTopics")) for (JsonNode t : m.get("topics")) keys.add(m.get("id").asText() + "/" + t.get("id").asText());
        return keys;
    }

    @Test
    void etagGivesNotModified() throws Exception {
        for (String url : new String[] {"/api/content/courses", "/api/content/manifest", "/api/content/courses/java"}) {
            String etag = mvc.perform(get(url)).andExpect(status().isOk()).andReturn().getResponse().getHeader("ETag");
            assertNotNull(etag, url);
            assertTrue(etag.startsWith("W/\"") && etag.endsWith("\""), "weak, quoted (a strong ETag would stop gzip): " + etag);
            mvc.perform(get(url).header("If-None-Match", etag)).andExpect(status().isNotModified())
                    .andExpect(header().string("ETag", etag));
            mvc.perform(get(url).header("If-None-Match", "\"other\"")).andExpect(status().isOk());
        }
    }

    @Test
    void idWithSpacesWorksEncodedOrAsTemplate() throws Exception {
        byte[] viaTemplate = course("HTML and CSS");
        byte[] viaRaw = mvc.perform(get(java.net.URI.create("/api/content/courses/HTML%20and%20CSS")))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
        assertEquals(sha256(viaTemplate), sha256(viaRaw));
        assertEquals("HTML and CSS", json.readTree(viaRaw).get("id").asText());
    }

    @Test
    void unknownCourseIs404() throws Exception {
        mvc.perform(get("/api/content/courses/no-such-course"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Course not found"));
    }

    @Test
    void contentImagesAreServedAsRealFiles() throws Exception {
        String text = new String(course("java"), StandardCharsets.UTF_8);
        Matcher m = Pattern.compile("/content-assets/[A-Za-z0-9_.-]+\\.png").matcher(text);
        assertTrue(m.find(), "the java course references a content image");
        String url = m.group();
        byte[] image = mvc.perform(get(url)).andExpect(status().isOk())
                .andExpect(content().contentType("image/png"))
                .andExpect(header().string("Cache-Control", containsString("immutable")))
                .andReturn().getResponse().getContentAsByteArray();
        try (InputStream in = new ClassPathResource("static" + url).getInputStream()) {
            assertEquals(in.readAllBytes().length, image.length);
        }
        mvc.perform(get("/content-assets/missing-AAAAAAAA.png")).andExpect(status().isNotFound());
    }
}
