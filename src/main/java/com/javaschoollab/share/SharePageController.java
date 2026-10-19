package com.javaschoollab.share;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Topic pages (/course/{course}/{module}/{topic} and /course/{course}/{topic}) answer with the React app's index.html carrying that
 * topic's title and description, so a shared link previews properly. Everything else is served by the normal site handler.
 */
@RestController
public class SharePageController {

    private final SharePageService pages;

    public SharePageController(SharePageService pages) {
        this.pages = pages;
    }

    @GetMapping("/course/{courseId}/{topicId}")
    public ResponseEntity<byte[]> twoSegments(@PathVariable String courseId, @PathVariable String topicId, HttpServletRequest request) {
        return respond(courseId, topicId, request);
    }

    @GetMapping("/course/{courseId}/{moduleId}/{topicId}")
    public ResponseEntity<byte[]> threeSegments(@PathVariable String courseId, @PathVariable String moduleId, @PathVariable String topicId, HttpServletRequest request) {
        return respond(courseId, topicId, request);
    }

    private ResponseEntity<byte[]> respond(String courseId, String topicId, HttpServletRequest request) {
        String origin = request.getScheme() + "://" + request.getServerName()
                + ((request.getServerPort() == 80 || request.getServerPort() == 443) ? "" : ":" + request.getServerPort());
        return pages.page(courseId, topicId, origin, request.getRequestURI())
                .map(html -> ResponseEntity.ok()
                        .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
                        .cacheControl(CacheControl.noCache())
                        .body(html.getBytes(StandardCharsets.UTF_8)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
