package com.javaschoollab.search;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.content.ContentService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Full-text search over every topic, served by OpenSearch. The index is built from the course content itself: at start-up
 * (in the background, so the site is never held up) the content version is compared with the one stored in OpenSearch, and the
 * index is rebuilt only when the content has changed. If OpenSearch is not configured or not ready the API says so (503) and
 * the browser falls back to its own in-page search.
 */
@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);
    private static final int BATCH = 120;

    private final SearchRepository repo;
    private final ContentService content;
    private final ObjectMapper json;

    private volatile boolean ready;
    private volatile String state = "disabled";
    private volatile long indexed;

    SearchService(SearchRepository repo, ContentService content, ObjectMapper json) {
        this.repo = repo;
        this.content = content;
        this.json = json;
    }

    public boolean enabled() {
        return repo.configured();
    }

    public Map<String, Object> status() {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("enabled", enabled());
        s.put("ready", ready);
        s.put("state", state);
        s.put("topicsIndexed", indexed);
        return s;
    }

    @EventListener(ApplicationReadyEvent.class)
    void startIndexing() {
        if (!enabled()) return;
        state = "waiting for OpenSearch";
        Thread t = new Thread(this::syncUntilReady, "search-indexer");
        t.setDaemon(true);
        t.start();
    }

    /** Waits for OpenSearch (it starts slower than the app), then makes sure the index matches the current content. */
    void syncUntilReady() {
        for (int attempt = 1; attempt <= 120 && !ready; attempt++) {
            try {
                if (!repo.reachable()) { Thread.sleep(5000); continue; }
                String version = content.manifest().etag();
                if (version.equals(repo.indexedVersion().orElse(null)) && repo.count() > 0) {
                    indexed = repo.count();
                    log.info("Search index is current ({} topics)", indexed);
                } else {
                    rebuild(version);
                }
                ready = true;
                state = "ready";
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            } catch (Exception e) {
                state = "indexing failed, retrying";
                log.warn("Search indexing failed (attempt {}): {}", attempt, e.getMessage());
                try { Thread.sleep(30000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); return; }
            }
        }
    }

    private void rebuild(String version) throws IOException, InterruptedException {
        state = "indexing";
        long started = System.currentTimeMillis();
        repo.recreateIndex();
        List<SearchRepository.Doc> batch = new ArrayList<>(BATCH);
        long total = 0;
        for (JsonNode c : json.readTree(content.index().bytes())) {
            String courseId = c.get("id").asText();
            JsonNode course = json.readTree(content.course(courseId).orElseThrow().bytes());
            for (JsonNode module : course.path("subTopics")) {
                for (JsonNode topic : module.path("topics")) {
                    batch.add(new SearchRepository.Doc(courseId, course.path("name").asText(), module.path("id").asText(),
                            module.path("name").asText(), topic.path("id").asText(), topic.path("name").asText(), plainText(topic)));
                    if (batch.size() == BATCH) { repo.bulk(batch); total += batch.size(); batch.clear(); }
                }
            }
        }
        if (!batch.isEmpty()) { repo.bulk(batch); total += batch.size(); }
        repo.markIndexed(version);
        indexed = total;
        log.info("Search index built: {} topics in {} ms", total, System.currentTimeMillis() - started);
    }

    /** The searchable text of a topic: every level's lesson text and code, with HTML tags and entities removed. */
    public static String plainText(JsonNode topic) {
        StringBuilder sb = new StringBuilder();
        for (String level : new String[] {"beginner", "intermediate", "expert"}) {
            for (JsonNode block : topic.path(level)) {
                if (block.hasNonNull("content")) sb.append(stripHtml(block.get("content").asText())).append(' ');
                for (JsonNode code : block.path("codeExamples")) sb.append(code.asText()).append(' ');
            }
        }
        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    static String stripHtml(String html) {
        return html
                .replaceAll("(?is)<(script|style)[^>]*>.*?</\\1>", " ")
                .replaceAll("<[^>]+>", " ")
                .replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
                .replace("&quot;", "\"").replace("&#39;", "'");
    }

    public List<SearchHit> search(String query, String course, int limit) {
        if (!enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Server-side search is not enabled.");
        if (!ready) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Search is still being prepared. Please try again in a moment.");
        String q = query == null ? "" : query.trim();
        if (q.length() < 2) return List.of();
        if (q.length() > 200) throw ApiException.badRequest("Search text is too long");
        try {
            return repo.search(q, course, Math.max(1, Math.min(limit, 50)));
        } catch (IOException e) {
            log.warn("Search failed: {}", e.getMessage());
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Search is temporarily unavailable.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Search was interrupted.");
        }
    }
}
