package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;

import com.javaschoollab.certificate.CertificateUid;
import com.javaschoollab.certificate.RateLimiter;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** The same cases as server/lib/certificates.test.js. */
class CertificateUnitTest {

    /** A clock the test can move forward by hand. */
    private static final class TestClock extends Clock {
        private Instant now = Instant.parse("2026-10-18T10:00:00Z");

        void advance(Duration d) {
            now = now.plus(d);
        }

        @Override public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    @Test
    void idsLookLikeJslXxxxXxxxXxxxFromAnUnambiguousAlphabet() {
        for (int i = 0; i < 200; i++) {
            String uid = CertificateUid.generate();
            assertThat(uid).matches("^JSL-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$");
            assertThat(CertificateUid.isValid(uid)).isTrue();
        }
    }

    @Test
    void idsDoNotRepeat() {
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < 5000; i++) seen.add(CertificateUid.generate());
        assertThat(seen).hasSize(5000);
    }

    @Test
    void acceptsOldFormatIdsAndRejectsJunk() {
        assertThat(CertificateUid.isValid("JSL-1760000000000-AB12CD")).isTrue();
        assertThat(CertificateUid.isValid("JSL-MGK4F2XQ")).isTrue();
        for (String bad : new String[] {"", "abc", "JSL-", "JSL-1' OR '1'='1", "jsl-ABCD", "JSL-" + "A".repeat(80), null}) {
            assertThat(CertificateUid.isValid(bad)).as("%s", bad).isFalse();
        }
    }

    @Test
    void rateLimiterLetsRequestsThroughUpToTheLimitThenAsksToWait() {
        var limiter = new RateLimiter(Duration.ofMinutes(1), 3, new TestClock());
        for (int i = 0; i < 3; i++) assertThat(limiter.check("1.1.1.1")).isEmpty();
        var blocked = limiter.check("1.1.1.1");
        assertThat(blocked).isPresent();
        assertThat(blocked.getAsLong()).isBetween(1L, 60L);
    }

    @Test
    void rateLimiterCountsEachClientSeparately() {
        var limiter = new RateLimiter(Duration.ofMinutes(1), 1, new TestClock());
        assertThat(limiter.check("a")).isEmpty();
        assertThat(limiter.check("b")).isEmpty();
        assertThat(limiter.check("a")).isPresent();
    }

    @Test
    void rateLimiterStartsAFreshWindowAfterTheOldOneExpires() {
        var clock = new TestClock();
        var limiter = new RateLimiter(Duration.ofMinutes(1), 1, clock);
        assertThat(limiter.check("a")).isEmpty();
        assertThat(limiter.check("a")).isPresent();
        clock.advance(Duration.ofSeconds(61));
        assertThat(limiter.check("a")).isEmpty();
    }
}
