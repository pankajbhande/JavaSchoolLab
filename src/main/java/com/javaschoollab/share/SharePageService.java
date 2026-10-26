package com.javaschoollab.share;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.content.ContentService;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
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

    /** The course tree with ids, used to write real links into the page body so a crawler can follow them. */
    record OutlineTopic(String id, String name) {}
    record OutlineModule(String id, String name, List<OutlineTopic> topics) {}
    record OutlineCourse(String id, String name, List<OutlineModule> modules) {}

    private static final Pattern TITLE = Pattern.compile("<title>.*?</title>", Pattern.DOTALL);
    private static final String ROOT = "<div id=\"root\"></div>";
    private static final int EXCERPT_CHARS = 600;
    private static final int MAX_SIBLINGS = 40;

    private final ContentService content;
    private final ObjectMapper json;
    private volatile Map<String, Topic> topics;      // "courseId|normalised topic id" -> topic
    private volatile Map<String, Course> courses;    // normalised course id -> course
    private volatile List<OutlineCourse> outline;
    private final Map<String, String> excerpts = new ConcurrentHashMap<>();    // "courseId|normalised topic id" -> first lines of the lesson
    private final Set<String> excerptCourses = ConcurrentHashMap.newKeySet();

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
        String out = withCourseTags(html, course.get(), origin + path, origin + "/share-image/" + courseId);
        Optional<OutlineCourse> oc = outlineCourse(courseId);
        if (oc.isEmpty()) return Optional.of(out);
        String url = origin + "/course/" + slug(oc.get().id());
        return Optional.of(withSeo(out, url, courseJsonLd(oc.get(), course.get(), url), courseBody(oc.get(), course.get())));
    }

    /** The home page (/ and /dashboard): index.html plus a crawlable list of every course and the site's name as structured data. */
    public Optional<String> homePage(String origin) {
        String html;
        try {
            html = indexHtml();
        } catch (IOException e) {
            return Optional.empty();
        }
        return Optional.of(withSeo(html, origin + "/dashboard", homeJsonLd(origin), homeBody(outline())));
    }

    static String withCourseTags(String html, Course c, String url, String image) {
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
        out = replaceMeta(out, "property=\"og:image\"", image);
        out = replaceMeta(out, "name=\"twitter:image\"", image);
        out = replaceMeta(out, "property=\"og:image:alt\"", title);
        return out;
    }

    Optional<Topic> find(String courseId, String topicId) {
        return Optional.ofNullable(topics().get(courseId + "|" + norm(topicId)));
    }

    /** The preview picture for a topic, or empty when the topic is unknown. */
    public Optional<byte[]> topicImage(String courseId, String topicId) {
        return find(courseId, topicId).flatMap(t -> draw(t.name(), t.courseName() + "  \u00B7  " + t.moduleName()));
    }

    /** The preview picture for a course, or empty when the course is unknown. */
    public Optional<byte[]> courseImage(String courseId) {
        return findCourse(courseId).flatMap(c -> draw(c.name() + " course", c.topics() + " lessons  \u00B7  " + c.modules() + " modules"));
    }

    private static Optional<byte[]> draw(String title, String line) {
        try {
            return Optional.of(ShareImage.render(title, line, "Free lessons, examples and interview questions"));
        } catch (IOException | RuntimeException | Error e) {   // e.g. no fonts installed on the host
            return Optional.empty();
        }
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
        String out = withTags(html, topic.get(), origin + path, origin + "/share-image/" + courseId + "/" + topicId);
        Optional<OutlineCourse> oc = outlineCourse(courseId);
        if (oc.isEmpty()) return Optional.of(out);
        for (OutlineModule m : oc.get().modules()) {
            for (OutlineTopic t : m.topics()) {
                if (!norm(t.id()).equals(norm(topicId))) continue;
                String url = origin + topicPath(oc.get(), m, t);
                String description = description(topic.get());
                String excerpt = excerpt(oc.get().id(), t.id());
                return Optional.of(withSeo(out, url, topicJsonLd(topic.get(), description, url, origin + "/course/" + slug(oc.get().id())),
                        topicBody(oc.get(), m, t, description, excerpt)));
            }
        }
        return Optional.of(out);
    }

    private static String description(Topic t) {
        return "Learn " + t.name() + " (" + t.moduleName() + ", " + t.courseName() + ") with worked examples, diagrams and interview questions. Free on JavaSchoolLab.";
    }

    private List<OutlineCourse> outline() {
        List<OutlineCourse> o = outline;
        if (o == null) {
            o = new ArrayList<>();
            try {
                for (JsonNode course : json.readTree(content.index().bytes())) {
                    List<OutlineModule> modules = new ArrayList<>();
                    for (JsonNode module : course.path("subTopics")) {
                        List<OutlineTopic> ts = new ArrayList<>();
                        for (JsonNode topic : module.path("topics")) ts.add(new OutlineTopic(topic.path("id").asText(), topic.path("name").asText()));
                        modules.add(new OutlineModule(module.path("id").asText(), module.path("name").asText(), ts));
                    }
                    o.add(new OutlineCourse(course.path("id").asText(), course.path("name").asText(), modules));
                }
            } catch (IOException e) {
                o = List.of();
            }
            outline = o;
        }
        return o;
    }

    private Optional<OutlineCourse> outlineCourse(String courseId) {
        return outline().stream().filter(c -> norm(c.id()).equals(norm(courseId))).findFirst();
    }

    /** The first lines of a lesson as plain text, read from the course file once per course. Empty when there are none. */
    private String excerpt(String courseId, String topicId) {
        loadExcerpts(courseId);
        return excerpts.getOrDefault(courseId + "|" + norm(topicId), "");
    }

    private synchronized void loadExcerpts(String courseId) {
        if (!excerptCourses.add(courseId)) return;
        try {
            content.course(courseId).ifPresent(p -> {
                try {
                    for (JsonNode module : json.readTree(p.bytes()).path("subTopics")) {
                        for (JsonNode topic : module.path("topics")) {
                            String text = firstText(topic);
                            if (!text.isEmpty()) excerpts.put(courseId + "|" + norm(topic.path("id").asText()), text);
                        }
                    }
                } catch (IOException e) {
                    // no excerpt: the page still has its title, description and links
                }
            });
        } catch (RuntimeException e) {
            // integrity failure or unreadable file: serve the page without an excerpt
        }
    }

    private static String firstText(JsonNode topic) {
        for (JsonNode level : topic) {
            if (!level.isArray() || level.isEmpty()) continue;
            String text = plainText(level.get(0).path("content").asText(""));
            if (!text.isEmpty()) return text;
        }
        return "";
    }

    private static final Pattern BLOCKS = Pattern.compile("<(script|style|pre|svg|table)\\b[^>]*>.*?</\\1>", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);

    /** Lesson HTML as a short run of plain text, cut at a word boundary. */
    static String plainText(String html) {
        String t = BLOCKS.matcher(html).replaceAll(" ").replaceAll("<[^>]+>", " ")
                .replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'").replace("&amp;", "&")
                .replaceAll("\\s+", " ").trim();
        if (t.length() <= EXCERPT_CHARS) return t;
        int cut = t.lastIndexOf(' ', EXCERPT_CHARS);
        return t.substring(0, cut > EXCERPT_CHARS / 2 ? cut : EXCERPT_CHARS).trim() + "...";
    }

    static String slug(String id) {
        return id.trim().replaceAll("\\s+", "_");
    }

    private static String topicPath(OutlineCourse c, OutlineModule m, OutlineTopic t) {
        return "/course/" + slug(c.id()) + "/" + slug(m.id()) + "/" + slug(t.id());
    }

    private static String link(String href, String text) {
        return "<a href=\"" + escape(href) + "\">" + escape(text) + "</a>";
    }

    static String homeBody(List<OutlineCourse> courses) {
        StringBuilder b = new StringBuilder("<main><h1>JavaSchoolLab - Learn Java, Spring Boot, React and more</h1>")
                .append("<p>JavaSchoolLab is a free learning site by DHIPAN Software Technologies with ").append(courses.size())
                .append(" courses: worked examples, diagrams, quizzes and interview questions.</p><h2>Courses</h2><ul>");
        for (OutlineCourse c : courses) {
            int topics = c.modules().stream().mapToInt(m -> m.topics().size()).sum();
            b.append("<li>").append(link("/course/" + slug(c.id()), c.name())).append(" - ").append(topics).append(" lessons</li>");
        }
        return b.append("</ul></main>").toString();
    }

    static String courseBody(OutlineCourse c, Course summary) {
        StringBuilder b = new StringBuilder("<main><nav aria-label=\"Breadcrumb\">").append(link("/dashboard", "JavaSchoolLab")).append("</nav>")
                .append("<h1>").append(escape(c.name())).append(" course</h1><p>Learn ").append(escape(c.name())).append(" step by step: ")
                .append(summary.topics()).append(" lessons in ").append(summary.modules())
                .append(" modules with worked examples, quizzes and interview questions. Free on JavaSchoolLab.</p>");
        for (OutlineModule m : c.modules()) {
            b.append("<h2>").append(escape(m.name())).append("</h2><ul>");
            for (OutlineTopic t : m.topics()) b.append("<li>").append(link(topicPath(c, m, t), t.name())).append("</li>");
            b.append("</ul>");
        }
        return b.append("</main>").toString();
    }

    static String topicBody(OutlineCourse c, OutlineModule m, OutlineTopic t, String description, String excerpt) {
        StringBuilder b = new StringBuilder("<main><nav aria-label=\"Breadcrumb\">").append(link("/dashboard", "JavaSchoolLab")).append(" &rsaquo; ")
                .append(link("/course/" + slug(c.id()), c.name())).append(" &rsaquo; ").append(escape(m.name())).append("</nav>")
                .append("<h1>").append(escape(t.name())).append("</h1><p>").append(escape(description)).append("</p>");
        if (!excerpt.isEmpty()) b.append("<p>").append(escape(excerpt)).append("</p>");
        b.append("<h2>More lessons in ").append(escape(m.name())).append("</h2><ul>");
        int shown = 0;
        for (OutlineTopic other : m.topics()) {
            if (other.id().equals(t.id())) continue;
            if (++shown > MAX_SIBLINGS) break;
            b.append("<li>").append(link(topicPath(c, m, other), other.name())).append("</li>");
        }
        return b.append("</ul></main>").toString();
    }

    /** Adds a canonical link and structured data to the head, and the crawlable body inside the empty React root. */
    static String withSeo(String html, String canonical, String jsonLd, String body) {
        String out = html;
        if (!out.contains("rel=\"canonical\"")) {
            int head = out.indexOf("</head>");
            if (head >= 0) {
                String tags = "<link rel=\"canonical\" href=\"" + escape(canonical) + "\" />"
                        + (jsonLd == null ? "" : "<script type=\"application/ld+json\">" + jsonLd.replace("<", "\\u003c") + "</script>");
                out = out.substring(0, head) + tags + out.substring(head);
            }
        }
        int root = out.indexOf(ROOT);
        if (root >= 0 && body != null) out = out.substring(0, root) + "<div id=\"root\">" + body + "</div>" + out.substring(root + ROOT.length());
        return out;
    }

    private String toJson(Map<String, Object> node) {
        try {
            return json.writeValueAsString(node);
        } catch (IOException e) {
            return null;
        }
    }

    private static Map<String, Object> provider() {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("@type", "Organization");
        p.put("name", "JavaSchoolLab");
        return p;
    }

    private String homeJsonLd(String origin) {
        Map<String, Object> site = new LinkedHashMap<>();
        site.put("@type", "WebSite");
        site.put("name", "JavaSchoolLab");
        site.put("alternateName", List.of("Java School Lab", "JavaSchoolLab"));
        site.put("url", origin + "/");
        Map<String, Object> org = new LinkedHashMap<>();
        org.put("@type", "Organization");
        org.put("name", "JavaSchoolLab");
        org.put("alternateName", "Java School Lab");
        org.put("url", origin + "/");
        org.put("logo", origin + "/icon-192.png");
        org.put("parentOrganization", Map.of("@type", "Organization", "name", "DHIPAN Software Technologies Private Limited"));
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("@context", "https://schema.org");
        root.put("@graph", List.of(site, org));
        return toJson(root);
    }

    private String courseJsonLd(OutlineCourse c, Course summary, String url) {
        Map<String, Object> n = new LinkedHashMap<>();
        n.put("@context", "https://schema.org");
        n.put("@type", "Course");
        n.put("name", c.name() + " course");
        n.put("description", "Learn " + c.name() + " step by step: " + summary.topics() + " lessons in " + summary.modules() + " modules.");
        n.put("url", url);
        n.put("inLanguage", "en");
        n.put("isAccessibleForFree", true);
        n.put("provider", provider());
        return toJson(n);
    }

    private String topicJsonLd(Topic t, String description, String url, String courseUrl) {
        Map<String, Object> course = new LinkedHashMap<>();
        course.put("@type", "Course");
        course.put("name", t.courseName() + " course");
        course.put("url", courseUrl);
        Map<String, Object> n = new LinkedHashMap<>();
        n.put("@context", "https://schema.org");
        n.put("@type", "LearningResource");
        n.put("name", t.name());
        n.put("description", description);
        n.put("url", url);
        n.put("inLanguage", "en");
        n.put("isAccessibleForFree", true);
        n.put("isPartOf", course);
        n.put("provider", provider());
        return toJson(n);
    }

    static String withTags(String html, Topic t, String url, String image) {
        String title = t.name() + " | " + t.courseName() + " | JavaSchoolLab";
        String description = description(t);
        String out = html;
        out = replaceTag(out, TITLE, "<title>" + escape(title) + "</title>");
        out = replaceMeta(out, "name=\"description\"", description);
        out = replaceMeta(out, "property=\"og:title\"", title);
        out = replaceMeta(out, "property=\"og:description\"", description);
        out = replaceMeta(out, "property=\"og:url\"", url);
        out = replaceMeta(out, "property=\"og:type\"", "article");
        out = replaceMeta(out, "name=\"twitter:title\"", title);
        out = replaceMeta(out, "name=\"twitter:description\"", description);
        out = replaceMeta(out, "property=\"og:image\"", image);
        out = replaceMeta(out, "name=\"twitter:image\"", image);
        out = replaceMeta(out, "property=\"og:image:alt\"", title);
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
