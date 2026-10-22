package com.javaschoollab.search;

import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.binder.MeterBinder;
import org.springframework.stereotype.Component;

/**
 * Search gauges for /actuator/metrics and Prometheus: whether the index is ready and how many topics it holds, so an alert can
 * fire when search has been "not ready" for too long.
 */
@Component
class SearchMetrics implements MeterBinder {

    private final SearchService search;

    SearchMetrics(SearchService search) {
        this.search = search;
    }

    @Override
    public void bindTo(MeterRegistry registry) {
        Gauge.builder("jsl.search.ready", search, s -> Boolean.TRUE.equals(s.status().get("ready")) ? 1 : 0)
                .description("1 when the OpenSearch topic index is ready to answer, otherwise 0")
                .register(registry);
        Gauge.builder("jsl.search.topics.indexed", search, s -> ((Number) s.status().get("topicsIndexed")).doubleValue())
                .description("Number of topics in the OpenSearch index")
                .register(registry);
    }
}
