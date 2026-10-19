package com.javaschoollab.common;

import java.time.Clock;
import java.time.Duration;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/** Makes the per-minute limiters the controllers use: Redis-backed when REDIS_ENABLED=true, in-memory otherwise. */
@Component
public class RateLimiters {

    private final StringRedisTemplate redis;
    private final Clock clock = Clock.systemUTC();

    public RateLimiters(ObjectProvider<StringRedisTemplate> redis, @Value("${app.redis.enabled:false}") boolean enabled) {
        this.redis = enabled ? redis.getIfAvailable() : null;
    }

    /** A limiter named {@code name} (used in the Redis key) allowing {@code max} requests per client per minute. */
    public RateLimiter perMinute(String name, int max) {
        Duration window = Duration.ofMinutes(1);
        return redis != null ? new RedisRateLimiter(redis, name, window, max, clock) : new InMemoryRateLimiter(window, max, clock);
    }
}
