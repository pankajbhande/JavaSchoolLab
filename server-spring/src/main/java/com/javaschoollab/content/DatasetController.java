package com.javaschoollab.content;

import java.util.Map;
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

/** Public data sets: quiz-banks, predict-output, study-packs, learning-paths and their manifest. Same caching as the courses. */
@RestController
@RequestMapping("/api/content/datasets")
public class DatasetController {

    private static final MediaType JSON_UTF8 = MediaType.parseMediaType("application/json;charset=UTF-8");

    private final DatasetService datasets;

    public DatasetController(DatasetService datasets) {
        this.datasets = datasets;
    }

    @GetMapping("/{name}")
    ResponseEntity<?> dataset(@PathVariable String name,
                              @RequestHeader(value = HttpHeaders.IF_NONE_MATCH, required = false) String ifNoneMatch) {
        if (name.equals("manifest")) return ContentController.respond(datasets.manifest(), ifNoneMatch);
        return datasets.dataset(name)
                .<ResponseEntity<?>>map(p -> ContentController.respond(p, ifNoneMatch))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(JSON_UTF8)
                        .body(Map.of("error", "Dataset not found")));
    }

    @ExceptionHandler(ContentService.IntegrityException.class)
    ResponseEntity<Map<String, String>> integrity() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(JSON_UTF8)
                .body(Map.of("error", "Dataset failed its integrity check"));
    }
}
