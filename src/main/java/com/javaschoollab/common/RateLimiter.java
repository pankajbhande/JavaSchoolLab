package com.javaschoollab.common;

import java.util.OptionalLong;

/**
 * Per-client request limit for routes that need no login (certificate verification, public profiles). Without a limit anyone
 * could hammer them. {@link InMemoryRateLimiter} counts inside this app; {@link RedisRateLimiter} counts in Redis so the limit
 * is shared by every app server and survives a restart. {@link RateLimiters} picks one.
 */
public interface RateLimiter {

    /** Empty when the request may go ahead; otherwise how many seconds the client should wait. */
    OptionalLong check(String clientKey);
}
