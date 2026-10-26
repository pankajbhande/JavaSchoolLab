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
 * Course pages (/course/{course}) and topic pages (/course/{course}/{module}/{topic}, /course/{course}/{topic}) answer with the React app's index.html carrying that
 * course's or topic's title and description, so a shared link previews properly. Everything else is served by the normal site handler.
 */
@RestController
public class SharePageController {

    private final SharePageService pages;

    private final String siteUrl;

    public SharePageController(SharePageService pages, @org.springframework.beans.factory.annotation.Value("${app.site-url:}") String siteUrl) {
        this.pages = pages;
        this.siteUrl = siteUrl == null ? "" : siteUrl.trim().replaceAll("/+$", "");
    }

    @GetMapping({"/", "/dashboard"})
    public ResponseEntity<byte[]> home(HttpServletRequest request) {
        return html(pages.homePage(origin(request)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<byte[]> course(@PathVariable String courseId, HttpServletRequest request) {
        return html(pages.coursePage(courseId, origin(request), request.getRequestURI()));
    }

    @GetMapping("/course/{courseId}/{topicId}")
    public ResponseEntity<byte[]> twoSegments(@PathVariable String courseId, @PathVariable String topicId, HttpServletRequest request) {
        return respond(courseId, topicId, request);
    }

    @GetMapping("/course/{courseId}/{moduleId}/{topicId}")
    public ResponseEntity<byte[]> threeSegments(@PathVariable String courseId, @PathVariable String moduleId, @PathVariable String topicId, HttpServletRequest request) {
        return respond(courseId, topicId, request);
    }

    @GetMapping("/share-image/{courseId}")
    public ResponseEntity<byte[]> courseImage(@PathVariable String courseId) {
        return png(pages.courseImage(courseId));
    }

    @GetMapping("/share-image/{courseId}/{topicId}")
    public ResponseEntity<byte[]> topicImage(@PathVariable String courseId, @PathVariable String topicId) {
        return png(pages.topicImage(courseId, topicId));
    }

    private static ResponseEntity<byte[]> png(java.util.Optional<byte[]> image) {
        return image
                .map(bytes -> ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(1)).cachePublic())
                        .body(bytes))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private ResponseEntity<byte[]> respond(String courseId, String topicId, HttpServletRequest request) {
        return html(pages.page(courseId, topicId, origin(request), request.getRequestURI()));
    }

    /**
     * The address written into og:url. SITE_URL when it is set, because the Host header is sent by the caller and a spoofed one must never end up
     * in a page that WhatsApp, LinkedIn or a cache may keep. Without SITE_URL (development) it falls back to the request.
     */
    private String origin(HttpServletRequest request) {
        if (!siteUrl.isEmpty()) return siteUrl;
        return request.getScheme() + "://" + request.getServerName()
                + ((request.getServerPort() == 80 || request.getServerPort() == 443) ? "" : ":" + request.getServerPort());
    }

    private static ResponseEntity<byte[]> html(java.util.Optional<String> page) {
        return page
                .map(html -> ResponseEntity.ok()
                        .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
                        .cacheControl(CacheControl.noCache())
                        .body(html.getBytes(StandardCharsets.UTF_8)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
