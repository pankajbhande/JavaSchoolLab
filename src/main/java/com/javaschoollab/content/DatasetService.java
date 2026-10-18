package com.javaschoollab.content;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/**
 * Serves the small data sets (quiz banks, predict-the-output challenges, study packs, learning paths) that live as JSON in
 * src/main/resources/datasets. Same rules as the courses: raw bytes, read on first request, checked against the
 * SHA-256 in datasets/manifest.json, then cached.
 */
@Service
public class DatasetService {

    private static final Logger log = LoggerFactory.getLogger(DatasetService.class);
    private static final String BASE = "datasets/";

    private final ObjectMapper json;
    private final Map<String, ContentService.Item> items = new LinkedHashMap<>();
    private final Map<String, byte[]> cache = new ConcurrentHashMap<>();
    private ContentService.Payload manifest;

    public DatasetService(ObjectMapper json) {
        this.json = json;
    }

    @PostConstruct
    void load() throws IOException {
        byte[] manifestBytes = read(BASE + "manifest.json");
        JsonNode m = json.readTree(manifestBytes);
        for (JsonNode i : m.get("items")) {
            String name = i.get("name").asText();
            items.put(name, new ContentService.Item(name, name, i.get("file").asText(), i.get("sha256").asText()));
        }
        manifest = new ContentService.Payload(manifestBytes, "\"" + ContentService.sha256(manifestBytes) + "\"");
        JsonNode t = m.get("totals");
        log.info("Datasets: {} files, {} quiz banks ({} questions), {} predict-output challenges, {} study packs, {} learning paths",
                m.get("datasets").asInt(), t.get("banks").asInt(), t.get("questions").asInt(), t.get("challenges").asInt(),
                t.get("packs").asInt(), t.get("paths").asInt());
    }

    public ContentService.Payload manifest() { return manifest; }

    /** The data set, or empty if the name is unknown. Throws {@link ContentService.IntegrityException} if the file was altered. */
    public Optional<ContentService.Payload> dataset(String name) {
        ContentService.Item item = items.get(name);
        if (item == null) return Optional.empty();
        try {
            byte[] bytes = cache.computeIfAbsent(name, k -> {
                try {
                    return verified(item, read(BASE + item.file()));
                } catch (IOException e) {
                    throw new ContentService.IntegrityException("Dataset file could not be read: " + item.file());
                }
            });
            return Optional.of(new ContentService.Payload(bytes, "\"" + item.sha256() + "\""));
        } catch (ContentService.IntegrityException e) {
            log.error("Dataset integrity check failed for '{}': {}", name, e.getMessage());
            throw e;
        }
    }

    /** Returns the bytes if their SHA-256 equals the manifest's, otherwise throws. */
    byte[] verified(ContentService.Item item, byte[] bytes) {
        String actual = ContentService.sha256(bytes);
        if (!actual.equalsIgnoreCase(item.sha256())) {
            throw new ContentService.IntegrityException("SHA-256 mismatch for " + item.file() + " (manifest " + item.sha256() + ", file " + actual + ")");
        }
        return bytes;
    }

    private static byte[] read(String path) throws IOException {
        try (InputStream in = new ClassPathResource(path).getInputStream()) {
            return in.readAllBytes();
        }
    }
}
