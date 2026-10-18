package com.javaschoollab.content;

import java.util.Arrays;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public course content: the names-only index, the manifest, and each full course as exported JSON.
 * Clients revalidate every time (Cache-Control: no-cache) and the ETag makes that a cheap 304.
 */
@RestController
@RequestMapping("/api/content")
public class ContentController {

    private static final MediaType JSON_UTF8 = MediaType.parseMediaType("application/json;charset=UTF-8");

    private final ContentService content;

    public ContentController(ContentService content) {
        this.content = content;
    }

    @GetMapping("/courses")
    ResponseEntity<?> index(@RequestHeader(value = HttpHeaders.IF_NONE_MATCH, required = false) String ifNoneMatch) {
        return respond(content.index(), ifNoneMatch);
    }

    @GetMapping("/manifest")
    ResponseEntity<?> manifest(@RequestHeader(value = HttpHeaders.IF_NONE_MATCH, required = false) String ifNoneMatch) {
        return respond(content.manifest(), ifNoneMatch);
    }

    @GetMapping("/courses/{id}")
    ResponseEntity<?> course(@PathVariable String id,
                             @RequestHeader(value = HttpHeaders.IF_NONE_MATCH, required = false) String ifNoneMatch) {
        return content.course(id)
                .<ResponseEntity<?>>map(p -> respond(p, ifNoneMatch))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(JSON_UTF8)
                        .body(Map.of("error", "Course not found")));
    }

    @ExceptionHandler(ContentService.IntegrityException.class)
    ResponseEntity<Map<String, String>> integrity() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(JSON_UTF8)
                .body(Map.of("error", "Course content failed its integrity check"));
    }

    static ResponseEntity<?> respond(ContentService.Payload p, String ifNoneMatch) {
        boolean notModified = matches(ifNoneMatch, p.etag());
        ResponseEntity.BodyBuilder b = ResponseEntity.status(notModified ? HttpStatus.NOT_MODIFIED : HttpStatus.OK)
                // A weak tag on purpose: Tomcat refuses to gzip a response that carries a strong ETag, and these files are
                // 2 MB of text that compresses about 5x. A weak tag still gives the 304 revalidation.
                .eTag("W/" + p.etag())
                .cacheControl(CacheControl.noCache());
        return notModified ? b.build() : b.contentType(JSON_UTF8).body(p.bytes());
    }

    /** If-None-Match may be "*", one tag, or a comma-separated list (weak tags compare equal for GET). */
    private static boolean matches(String header, String etag) {
        if (header == null) return false;
        if (header.trim().equals("*")) return true;
        return Arrays.stream(header.split(",")).map(String::trim)
                .map(s -> s.startsWith("W/") ? s.substring(2) : s)
                .anyMatch(etag::equals);
    }
}
