package com.javaschoollab.search;

import java.util.Map;
import org.springframework.boot.actuate.autoconfigure.health.ConditionalOnEnabledHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Status;
import org.springframework.stereotype.Component;

/**
 * The "search" component of /actuator/health. Search is optional and the site works without it, so this never reports DOWN:
 * <ul>
 *   <li>UNKNOWN: server-side search is not configured (the browser searches by itself),</li>
 *   <li>DEGRADED: configured, but OpenSearch is unreachable or the index is still being built (still HTTP 200),</li>
 *   <li>UP: the index is ready.</li>
 * </ul>
 * It is shown in the full health report but is deliberately not part of the readiness group, so a search outage never pulls the
 * application out of rotation.
 */
@Component
@ConditionalOnEnabledHealthIndicator("search")
class SearchHealthIndicator implements HealthIndicator {

    static final Status DEGRADED = new Status("DEGRADED");

    private final SearchService search;

    SearchHealthIndicator(SearchService search) {
        this.search = search;
    }

    @Override
    public Health health() {
        Map<String, Object> s = search.status();
        if (!Boolean.TRUE.equals(s.get("enabled"))) {
            return Health.unknown().withDetail("state", "disabled").build();
        }
        Health.Builder b = Boolean.TRUE.equals(s.get("ready")) ? Health.up() : Health.status(DEGRADED);
        return b.withDetail("state", s.get("state")).withDetail("topicsIndexed", s.get("topicsIndexed")).build();
    }
}
