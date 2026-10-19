package com.javaschoollab.auth;

import com.javaschoollab.common.ApiException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;

/**
 * One-time codes in Redis (used when REDIS_ENABLED=true). Each code is a small hash under jsl:otp:{id} that Redis deletes by
 * itself after 16 minutes (5 to use it, plus the 10-minute window to finish registering); a per-identifier list holds the
 * newest ids so a code can be found by who it was sent to. The rules are the same as the MySQL version.
 */
@Repository
@Primary
@ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
class RedisOtpRepository implements OtpStore {

    private static final Duration KEEP = Duration.ofMinutes(16);
    private static final String SEQ = "jsl:otp:seq";
    private static final int PER_IDENTIFIER = 10;

    private final StringRedisTemplate redis;

    RedisOtpRepository(StringRedisTemplate redis) {
        this.redis = redis;
    }

    private static String key(long id) {
        return "jsl:otp:" + id;
    }

    private static String index(String type, String identifier) {
        return "jsl:otp:for:" + type + ":" + identifier.toLowerCase();
    }

    private static long epoch(LocalDateTime t) {
        return t.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }

    /** A Redis outage must read as "try again later", not as a crash or a wrong code. */
    private static <T> T guard(Supplier<T> action) {
        try {
            return action.get();
        } catch (RedisConnectionFailureException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Verification is temporarily unavailable. Please try again in a moment.");
        }
    }

    private List<String> ids(String type, String identifier) {
        List<String> ids = redis.opsForList().range(index(type, identifier), 0, -1);   // newest first
        return ids == null ? List.of() : ids;
    }

    private Map<Object, Object> code(String id) {
        return redis.opsForHash().entries(key(Long.parseLong(id)));
    }

    @Override
    public void invalidateUnused(String identifier, String identifierType) {
        guard(() -> {
            for (String id : ids(identifierType, identifier)) {
                if ("0".equals(code(id).get("used"))) redis.opsForHash().put(key(Long.parseLong(id)), "used", "1");
            }
            return null;
        });
    }

    @Override
    public long insert(String identifier, String identifierType, String otp, String purpose, LocalDateTime expiresAt) {
        return guard(() -> {
            long id = redis.opsForValue().increment(SEQ);
            String k = key(id);
            redis.opsForHash().putAll(k, Map.of("code", otp, "purpose", purpose, "used", "0", "exp", String.valueOf(epoch(expiresAt))));
            redis.expire(k, KEEP);
            String idx = index(identifierType, identifier);
            redis.opsForList().leftPush(idx, String.valueOf(id));
            redis.opsForList().trim(idx, 0, PER_IDENTIFIER - 1);
            redis.expire(idx, KEEP);
            return id;
        });
    }

    private Optional<Long> find(String identifier, String type, String otp, String purpose, String used, long notBefore) {
        for (String id : ids(type, identifier)) {
            Map<Object, Object> c = code(id);
            if (c.isEmpty()) continue;
            if (otp.equals(c.get("code")) && purpose.equals(c.get("purpose")) && used.equals(c.get("used"))
                    && Long.parseLong((String) c.get("exp")) > notBefore) {
                return Optional.of(Long.parseLong(id));
            }
        }
        return Optional.empty();
    }

    @Override
    public Optional<Long> findUnused(String identifier, String identifierType, String otp, String purpose, LocalDateTime now) {
        return guard(() -> find(identifier, identifierType, otp, purpose, "0", epoch(now)));
    }

    @Override
    public Optional<Long> findVerified(String identifier, String identifierType, String otp, String purpose, LocalDateTime now) {
        return guard(() -> find(identifier, identifierType, otp, purpose, "1", epoch(now.minusMinutes(10))));
    }

    @Override
    public void markUsed(long id) {
        guard(() -> {
            if (Boolean.TRUE.equals(redis.hasKey(key(id)))) redis.opsForHash().put(key(id), "used", "1");
            return null;
        });
    }

    @Override
    public void delete(long id) {
        guard(() -> redis.delete(key(id)));
    }
}
