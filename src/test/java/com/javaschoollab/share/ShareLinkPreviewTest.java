package com.javaschoollab.share;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** A shared topic link must preview as that topic (WhatsApp, Telegram, LinkedIn read the HTML and do not run the app). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShareLinkPreviewTest {

    @Autowired MockMvc mvc;

    /** The head of the real index.html, in the same layout (multi-line meta tags included). */
    private static final String HEAD = """
            <head>
              <title>JavaSchoolLab | Learn Java, Spring Boot, React and more</title>
              <meta
                name="description"
                content="Learn Java across 31 courses."
              />
              <meta property="og:type" content="website" />
              <meta property="og:title" content="JavaSchoolLab | Learn Java, Spring Boot, React and more" />
              <meta
                property="og:description"
                content="31 courses, 3,588 topics."
              />
              <meta property="og:url" content="https://javaschoollab.com/" />
              <meta property="og:image" content="https://javaschoollab.com/og-image.png" />
              <meta name="twitter:title" content="JavaSchoolLab | Learn Java, Spring Boot, React and more" />
              <meta
                name="twitter:description"
                content="31 courses, 3,588 topics."
              />
            </head>""";

    @Test
    void theTopicsOwnTitleAndDescriptionReplaceTheGenericOnes() {
        var topic = new SharePageService.Topic("Java", "Java Basics", "Constructor Chaining");
        String html = SharePageService.withTags(HEAD, topic, "https://javaschoollab.com/course/java/basics/constructor-chaining", "https://javaschoollab.com/share-image/java/constructor-chaining");
        assertThat(html).contains("<title>Constructor Chaining | Java | JavaSchoolLab</title>");
        assertThat(html).contains("property=\"og:title\" content=\"Constructor Chaining | Java | JavaSchoolLab\"");
        assertThat(html).contains("property=\"og:url\" content=\"https://javaschoollab.com/course/java/basics/constructor-chaining\"");
        assertThat(html).contains("property=\"og:type\" content=\"article\"");
        assertThat(html).contains("name=\"twitter:title\" content=\"Constructor Chaining | Java | JavaSchoolLab\"");
        assertThat(html.split("Learn Constructor Chaining \\(Java Basics, Java\\)", -1).length - 1).as("description in meta, og and twitter").isEqualTo(3);
        assertThat(html).doesNotContain("31 courses, 3,588 topics").doesNotContain("Learn Java across 31 courses");
        assertThat(html).contains("property=\"og:image\" content=\"https://javaschoollab.com/share-image/java/constructor-chaining\"").doesNotContain("og-image.png");
    }

    @Test
    void namesWithQuotesAndAnglesCannotBreakOutOfTheTag() {
        var topic = new SharePageService.Topic("C&C++", "Pointers", "Q&A \"x\" <script>alert(1)</script>");
        String html = SharePageService.withTags(HEAD, topic, "https://x.test/course/c/q", "https://x.test/share-image/c/q");
        assertThat(html).doesNotContain("<script>");
        assertThat(html).contains("&lt;script&gt;").contains("&quot;x&quot;").contains("Q&amp;A");
    }

    @Test
    void differentSpellingsOfATopicIdAreTheSameTopic() {
        assertThat(SharePageService.norm("Constructor_in_java")).isEqualTo(SharePageService.norm("constructor in java")).isEqualTo(SharePageService.norm("constructor-in-java"));
    }

    @Test
    void aKnownTopicUrlAnswersWithItsOwnTitle() throws Exception {
        mvc.perform(get("/course/java/basics/constructor-chaining"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("<title>Constructor Chaining | Java | JavaSchoolLab</title>")))
                .andExpect(content().string(containsString("test shell")));          // still the app's page, so the browser boots React
    }

    @Test
    void anUnknownTopicStillGetsTheNormalPageSoTheAppShowsItsOwnNotFound() throws Exception {
        mvc.perform(get("/course/java/basics/no-such-topic-xyz"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<title>JavaSchoolLab test shell</title>")));
    }

    @Test
    void theTwoSegmentFormAlsoWorks() throws Exception {
        mvc.perform(get("/course/java/constructor-chaining"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Constructor Chaining | Java | JavaSchoolLab")));
    }

    @Test
    void theCoursesOwnTitleAndCountsReplaceTheGenericOnes() {
        var course = new SharePageService.Course("JavaFX", 18, 120);
        String html = SharePageService.withCourseTags(HEAD, course, "https://javaschoollab.com/course/javafx", "https://javaschoollab.com/share-image/javafx");
        assertThat(html).contains("<title>JavaFX course | JavaSchoolLab</title>");
        assertThat(html).contains("property=\"og:url\" content=\"https://javaschoollab.com/course/javafx\"");
        assertThat(html).contains("120 lessons in 18 modules");
        assertThat(html).doesNotContain("31 courses, 3,588 topics");
    }

    @Test
    void aKnownCourseUrlAnswersWithItsOwnTitle() throws Exception {
        mvc.perform(get("/course/java"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/html"))
                .andExpect(content().string(containsString("course | JavaSchoolLab</title>")))
                .andExpect(content().string(containsString("test shell")));
    }

    @Test
    void anUnknownCourseStillGetsTheNormalPage() throws Exception {
        mvc.perform(get("/course/no-such-course-xyz"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<title>JavaSchoolLab test shell</title>")));
    }
}
