package com.javaschoollab.common;

import java.time.Clock;
import java.time.Duration;
import java.util.OptionalLong;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Fixed-window limiter counted in Redis: one counter per client per window (INCR, expiring with the window), so every app
 * server shares the count. If Redis cannot be reached the request is counted by the in-memory limiter instead: a Redis outage
 * must never take the site down, and the limit still holds on each server.
 */
public final class RedisRateLimiter implements RateLimiter {

    private static final Logger log = LoggerFactory.getLogger(RedisRateLimiter.class);

    private final StringRedisTemplate redis;
    private final String name;
    private final long windowMs;
    private final int max;
    private final Clock clock;
    private final RateLimiter fallback;
    private final AtomicBoolean warned = new AtomicBoolean();

    public RedisRateLimiter(StringRedisTemplate redis, String name, Duration window, int max, Clock clock) {
        this.redis = redis;
        this.name = name;
        this.windowMs = window.toMillis();
        this.max = max;
        this.clock = clock;
        this.fallback = new InMemoryRateLimiter(window, max, clock);
    }

    @Override
    public OptionalLong check(String clientKey) {
        long now = clock.millis();
        long windowIndex = now / windowMs;
        String key = "jsl:rl:" + name + ":" + clientKey + ":" + windowIndex;
        try {
            Long count = redis.opsForValue().increment(key);
            if (count == null) return fallback.check(clientKey);
            if (count == 1L) redis.expire(key, Duration.ofMillis(windowMs).plusSeconds(1));
            warned.set(false);
            if (count <= max) return OptionalLong.empty();
            return OptionalLong.of((long) Math.ceil(((windowIndex + 1) * windowMs - now) / 1000.0));
        } catch (RuntimeException e) {
            if (warned.compareAndSet(false, true)) log.warn("Redis rate limiter '{}' unavailable, counting in memory: {}", name, e.getMessage());
            return fallback.check(clientKey);
        }
    }
}
