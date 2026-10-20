package com.javaschoollab.share;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.content.ContentService;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/**
 * Link previews for shared topics. WhatsApp, Telegram, LinkedIn and Google read the HTML they are given and do not run the React app, so
 * a shared topic link would always preview as the generic site. For a topic page this service returns the real index.html with that
 * topic's title and description written into the page title and the Open Graph / Twitter tags. The browser then boots the app as usual.
 */
@Service
public class SharePageService {

    /** A topic as found in the course index. */
    record Topic(String courseName, String moduleName, String name) {}

    /** A course as found in the course index. */
    record Course(String name, int modules, int topics) {}

    private static final Pattern TITLE = Pattern.compile("<title>.*?</title>", Pattern.DOTALL);

    private final ContentService content;
    private final ObjectMapper json;
    private volatile Map<String, Topic> topics;      // "courseId|normalised topic id" -> topic
    private volatile Map<String, Course> courses;    // normalised course id -> course

    SharePageService(ContentService content, ObjectMapper json) {
        this.content = content;
        this.json = json;
    }

    /** "Constructor_in_java", "constructor in java" and "constructor-in-java" are the same topic. */
    static String norm(String s) {
        return s == null ? "" : s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "");
    }

    private Map<String, Topic> topics() {
        Map<String, Topic> t = topics;
        if (t == null) {
            t = new HashMap<>();
            try {
                for (JsonNode course : json.readTree(content.index().bytes())) {
                    String courseId = course.path("id").asText();
                    for (JsonNode module : course.path("subTopics")) {
                        for (JsonNode topic : module.path("topics")) {
                            t.putIfAbsent(courseId + "|" + norm(topic.path("id").asText()),
                                    new Topic(course.path("name").asText(), module.path("name").asText(), topic.path("name").asText()));
                        }
                    }
                }
            } catch (IOException e) {
                t = Map.of();
            }
            topics = t;
        }
        return t;
    }

    private Map<String, Course> courses() {
        Map<String, Course> c = courses;
        if (c == null) {
            c = new HashMap<>();
            try {
                for (JsonNode course : json.readTree(content.index().bytes())) {
                    int modules = 0;
                    int topicCount = 0;
                    for (JsonNode module : course.path("subTopics")) {
                        modules++;
                        topicCount += module.path("topics").size();
                    }
                    c.putIfAbsent(norm(course.path("id").asText()), new Course(course.path("name").asText(), modules, topicCount));
                }
            } catch (IOException e) {
                c = Map.of();
            }
            courses = c;
        }
        return c;
    }

    Optional<Course> findCourse(String courseId) {
        return Optional.ofNullable(courses().get(norm(courseId)));
    }

    /** The page for a course URL (/course/{id}): the real index.html carrying that course's title and description. */
    public Optional<String> coursePage(String courseId, String origin, String path) {
        String html;
        try {
            html = indexHtml();
        } catch (IOException e) {
            return Optional.empty();
        }
        Optional<Course> course = findCourse(courseId);
        if (course.isEmpty()) return Optional.of(html);           // unknown course: the plain app, which shows its own "not found"
        return Optional.of(withCourseTags(html, course.get(), origin + path));
    }

    static String withCourseTags(String html, Course c, String url) {
        String title = c.name() + " course | JavaSchoolLab";
        String description = "Learn " + c.name() + " step by step: " + c.topics() + " lessons in " + c.modules()
                + " modules with worked examples, quizzes and interview questions. Free on JavaSchoolLab.";
        String out = html;
        out = replaceTag(out, TITLE, "<title>" + escape(title) + "</title>");
        out = replaceMeta(out, "name=\"description\"", description);
        out = replaceMeta(out, "property=\"og:title\"", title);
        out = replaceMeta(out, "property=\"og:description\"", description);
        out = replaceMeta(out, "property=\"og:url\"", url);
        out = replaceMeta(out, "property=\"og:type\"", "website");
        out = replaceMeta(out, "name=\"twitter:title\"", title);
        out = replaceMeta(out, "name=\"twitter:description\"", description);
        return out;
    }

    Optional<Topic> find(String courseId, String topicId) {
        return Optional.ofNullable(topics().get(courseId + "|" + norm(topicId)));
    }

    private static String indexHtml() throws IOException {
        try (InputStream in = new ClassPathResource("static/index.html").getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /** The page for this topic URL, or empty when the site is not built into this app (development without the front end). */
    public Optional<String> page(String courseId, String topicId, String origin, String path) {
        String html;
        try {
            html = indexHtml();
        } catch (IOException e) {
            return Optional.empty();
        }
        Optional<Topic> topic = find(courseId, topicId);
        if (topic.isEmpty()) return Optional.of(html);          // unknown topic: the plain app, which shows its own "not found"
        return Optional.of(withTags(html, topic.get(), origin + path));
    }

    static String withTags(String html, Topic t, String url) {
        String title = t.name() + " | " + t.courseName() + " | JavaSchoolLab";
        String description = "Learn " + t.name() + " (" + t.moduleName() + ", " + t.courseName() + ") with worked examples, diagrams and interview questions. Free on JavaSchoolLab.";
        String out = html;
        out = replaceTag(out, TITLE, "<title>" + escape(title) + "</title>");
        out = replaceMeta(out, "name=\"description\"", description);
        out = replaceMeta(out, "property=\"og:title\"", title);
        out = replaceMeta(out, "property=\"og:description\"", description);
        out = replaceMeta(out, "property=\"og:url\"", url);
        out = replaceMeta(out, "property=\"og:type\"", "article");
        out = replaceMeta(out, "name=\"twitter:title\"", title);
        out = replaceMeta(out, "name=\"twitter:description\"", description);
        return out;
    }

    private static String replaceTag(String html, Pattern p, String replacement) {
        return p.matcher(html).replaceFirst(Matcher.quoteReplacement(replacement));
    }

    /** Rewrites the content="..." of the first &lt;meta&gt; carrying the given name or property attribute. */
    private static String replaceMeta(String html, String attribute, String value) {
        Pattern p = Pattern.compile("(<meta\\s+[^>]*?" + Pattern.quote(attribute) + "[^>]*?content=\")[^\"]*(\")", Pattern.DOTALL);
        Matcher m = p.matcher(html);
        if (m.find()) return m.replaceFirst(Matcher.quoteReplacement(m.group(1)) + Matcher.quoteReplacement(escape(value)) + Matcher.quoteReplacement(m.group(2)));
        Pattern reversed = Pattern.compile("(<meta\\s+[^>]*?content=\")[^\"]*(\"[^>]*?" + Pattern.quote(attribute) + ")", Pattern.DOTALL);
        Matcher r = reversed.matcher(html);
        if (r.find()) return r.replaceFirst(Matcher.quoteReplacement(r.group(1)) + Matcher.quoteReplacement(escape(value)) + Matcher.quoteReplacement(r.group(2)));
        return html;
    }

    static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
