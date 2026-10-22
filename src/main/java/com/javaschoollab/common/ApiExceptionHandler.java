package com.javaschoollab.common;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Every failure leaves as {"error": "..."}, the shape the React app already reads. */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, String>> expected(ApiException e) {
        ResponseEntity.BodyBuilder response = ResponseEntity.status(e.status());
        if (e.retryAfterSeconds() > 0) response.header("Retry-After", String.valueOf(e.retryAfterSeconds()));
        return response.body(Map.of("error", e.getMessage()));
    }

    /** A body that isn't valid JSON is the caller's mistake, not a server fault. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> unreadableBody(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid request body"));
    }

    /** Spring's own client errors (unknown path 404, wrong method 405, unsupported type 415) keep their real status. */
    @ExceptionHandler({NoResourceFoundException.class, HttpRequestMethodNotSupportedException.class, HttpMediaTypeNotSupportedException.class})
    ResponseEntity<Map<String, String>> springClientError(Exception ex) {
        ErrorResponse e = (ErrorResponse) ex;
        HttpStatusCode status = e.getStatusCode();
        String message = status.value() == 404 ? "Not found" : e.getBody().getTitle() != null ? e.getBody().getTitle() : "Request failed";
        return ResponseEntity.status(status).body(Map.of("error", message));
    }

    /** Anything unexpected: log the cause for the developer, tell the browser nothing internal. */
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> unexpected(Exception e) {
        log.error("Unhandled error", e);
        return ResponseEntity.status(500).body(Map.of("error", "Something went wrong. Please try again."));
    }
}
