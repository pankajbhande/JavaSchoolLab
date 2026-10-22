package com.javaschoollab.common;

import org.springframework.http.HttpStatus;

/** An expected failure with the HTTP status and message the React app shows: always answered as {"error": "..."}. */
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final long retryAfterSeconds;

    public ApiException(HttpStatus status, String message) {
        this(status, message, 0);
    }

    public ApiException(HttpStatus status, String message, long retryAfterSeconds) {
        super(message);
        this.status = status;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    /** Seconds the caller should wait before trying again (sent as Retry-After); 0 when not applicable. */
    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }

    /** 429: too many attempts. The message is the one the React app shows. */
    public static ApiException tooManyRequests(long waitSeconds) {
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Please wait a minute and try again.", Math.max(1, waitSeconds));
    }

    public HttpStatus status() {
        return status;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }
}
