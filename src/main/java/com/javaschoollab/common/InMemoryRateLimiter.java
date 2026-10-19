package com.javaschoollab.common;

import java.time.Clock;
import java.time.Duration;
import java.util.OptionalLong;
import java.util.concurrent.ConcurrentHashMap;

/** A small fixed-window limiter kept in this app's memory. Same behaviour as the Node limiter. */
public final class InMemoryRateLimiter implements RateLimiter {

    private static final class Window {
        final long start;
        int count;

        Window(long start) {
            this.start = start;
            this.count = 1;
        }
    }

    private final long windowMs;
    private final int max;
    private final Clock clock;
    private final ConcurrentHashMap<String, Window> hits = new ConcurrentHashMap<>();

    public InMemoryRateLimiter(Duration window, int max, Clock clock) {
        this.windowMs = window.toMillis();
        this.max = max;
        this.clock = clock;
    }

    @Override
    public OptionalLong check(String clientKey) {
        long now = clock.millis();
        long[] retryAfter = {-1};
        hits.compute(clientKey, (k, w) -> {
            if (w == null || now - w.start >= windowMs) return new Window(now);
            if (++w.count > max) retryAfter[0] = (long) Math.ceil((w.start + windowMs - now) / 1000.0);
            return w;
        });
        if (hits.size() > 5000) hits.entrySet().removeIf(e -> now - e.getValue().start >= windowMs);   // keep memory bounded
        return retryAfter[0] >= 0 ? OptionalLong.of(retryAfter[0]) : OptionalLong.empty();
    }
}
