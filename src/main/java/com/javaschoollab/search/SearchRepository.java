package com.javaschoollab.search;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

/**
 * Everything that talks to OpenSearch, over its plain REST API (no client library needed): create the index, add topics in
 * bulk, remember which content version is indexed, and run a search. Nothing else in the app knows OpenSearch's JSON.
 */
@Repository
class SearchRepository {

    static final String INDEX = "jsl-topics";
    private static final String META = "jsl-topics-meta";
    private static final char MARK_START = '\u0001';
    private static final char MARK_END = '\u0002';

    /** A topic ready to index. */
    record Doc(String courseId, String courseName, String moduleId, String moduleName, String topicId, String topicName, String text) {
        String id() { return courseId + "/" + topicId; }
    }

    private final String base;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    SearchRepository(@Value("${app.search.url:}") String url, ObjectMapper json) {
        this.base = url == null ? "" : url.trim().replaceAll("/+$", "");
        this.json = json;
    }

    boolean configured() {
        return !base.isEmpty();
    }

    private HttpResponse<String> call(String method, String path, String body, Duration timeout) throws IOException, InterruptedException {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(base + path)).timeout(timeout)
                .header("Content-Type", path.endsWith("_bulk") ? "application/x-ndjson" : "application/json");
        b.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        return http.send(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private JsonNode ok(HttpResponse<String> r) throws IOException {
        if (r.statusCode() / 100 != 2) throw new IOException("OpenSearch answered " + r.statusCode() + ": " + r.body().substring(0, Math.min(300, r.body().length())));
        return json.readTree(r.body());
    }

    /** True when the server answers. */
    boolean reachable() {
        try {
            return call("GET", "/", null, Duration.ofSeconds(3)).statusCode() == 200;
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            return false;
        }
    }

    /** The content version (hash) stored when the index was last built; empty if never built. */
    Optional<String> indexedVersion() throws IOException, InterruptedException {
        HttpResponse<String> r = call("GET", "/" + META + "/_doc/version", null, Duration.ofSeconds(5));
        if (r.statusCode() == 404) return Optional.empty();
        JsonNode n = ok(r);
        return n.path("found").asBoolean() ? Optional.of(n.path("_source").path("hash").asText()) : Optional.empty();
    }

    /** Drops and recreates the topic index. The mapping is fixed here: titles are weighted over lesson text at query time. */
    void recreateIndex() throws IOException, InterruptedException {
        call("DELETE", "/" + INDEX, null, Duration.ofSeconds(30));
        String mapping = """
                {"settings":{"number_of_shards":1,"number_of_replicas":0,"index.highlight.max_analyzed_offset":5000000},
                 "mappings":{"properties":{
                   "courseId":{"type":"keyword"},"courseName":{"type":"keyword"},
                   "moduleId":{"type":"keyword"},"moduleName":{"type":"text"},
                   "topicId":{"type":"keyword"},"topicName":{"type":"text"},
                   "preview":{"type":"keyword","index":false,"doc_values":false},
                   "text":{"type":"text"}}}}""";
        ok(call("PUT", "/" + INDEX, mapping, Duration.ofSeconds(30)));
    }

    void bulk(List<Doc> docs) throws IOException, InterruptedException {
        StringBuilder nd = new StringBuilder();
        for (Doc d : docs) {
            ObjectNode action = json.createObjectNode();
            action.putObject("index").put("_index", INDEX).put("_id", d.id());
            nd.append(json.writeValueAsString(action)).append('\n');
            ObjectNode src = json.createObjectNode();
            src.put("courseId", d.courseId()).put("courseName", d.courseName()).put("moduleId", d.moduleId())
                    .put("moduleName", d.moduleName()).put("topicId", d.topicId()).put("topicName", d.topicName())
                    .put("preview", d.text().length() > 170 ? d.text().substring(0, 170) + "…" : d.text())
                    .put("text", d.text());
            nd.append(json.writeValueAsString(src)).append('\n');
        }
        JsonNode r = ok(call("POST", "/_bulk", nd.toString(), Duration.ofMinutes(2)));
        if (r.path("errors").asBoolean()) throw new IOException("OpenSearch rejected some topics: " + r.path("items").path(0));
    }

    void markIndexed(String hash) throws IOException, InterruptedException {
        call("POST", "/" + INDEX + "/_refresh", null, Duration.ofSeconds(30));
        ObjectNode body = json.createObjectNode().put("hash", hash);
        ok(call("PUT", "/" + META + "/_doc/version?refresh=true", json.writeValueAsString(body), Duration.ofSeconds(10)));
    }

    long count() throws IOException, InterruptedException {
        HttpResponse<String> r = call("GET", "/" + INDEX + "/_count", null, Duration.ofSeconds(5));
        return r.statusCode() == 404 ? 0 : ok(r).path("count").asLong();
    }

    /** Topics containing every word of the query (words may be spread across title and body), best first. */
    List<SearchHit> search(String query, String courseId, int size) throws IOException, InterruptedException {
        ObjectNode q = json.createObjectNode();
        q.put("size", size);
        ArrayNode src = q.putArray("_source");
        for (String f : new String[] {"courseId", "courseName", "moduleId", "moduleName", "topicId", "topicName", "preview"}) src.add(f);

        ObjectNode bool = q.putObject("query").putObject("bool");
        ObjectNode must = bool.putArray("must").addObject().putObject("multi_match");
        must.put("query", query).put("type", "cross_fields").put("operator", "and");
        must.putArray("fields").add("topicName^6").add("moduleName^2").add("courseName^1").add("text");
        ArrayNode should = bool.putArray("should");
        should.addObject().putObject("match_phrase").putObject("topicName").put("query", query).put("boost", 30);
        should.addObject().putObject("match_phrase").putObject("text").put("query", query).put("boost", 3);
        if (courseId != null && !courseId.isBlank()) bool.putArray("filter").addObject().putObject("term").put("courseId", courseId);

        ObjectNode hl = q.putObject("highlight");
        hl.putArray("pre_tags").add(String.valueOf(MARK_START));
        hl.putArray("post_tags").add(String.valueOf(MARK_END));
        hl.putObject("fields").putObject("text").put("fragment_size", 170).put("number_of_fragments", 1);

        JsonNode r = ok(call("POST", "/" + INDEX + "/_search", json.writeValueAsString(q), Duration.ofSeconds(10)));
        List<SearchHit> hits = new ArrayList<>();
        for (JsonNode h : r.path("hits").path("hits")) {
            JsonNode s = h.path("_source");
            String snippet = h.path("highlight").path("text").path(0).asText(s.path("preview").asText());
            snippet = snippet.replace(String.valueOf(MARK_START), "").replace(String.valueOf(MARK_END), "").trim();
            hits.add(new SearchHit(s.path("courseId").asText(), s.path("courseName").asText(), s.path("moduleId").asText(),
                    s.path("moduleName").asText(), s.path("topicId").asText(), s.path("topicName").asText(), snippet, h.path("_score").asDouble()));
        }
        return hits;
    }
}
