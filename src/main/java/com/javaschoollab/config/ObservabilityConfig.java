package com.javaschoollab.config;

import io.micrometer.observation.ObservationPredicate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.observation.ServerRequestObservationContext;

/**
 * Observability settings that cannot be expressed in application.yml.
 */
@Configuration
public class ObservabilityConfig {

    /**
     * Health probes and metric scrapes run every few seconds. Observing them would fill the traces and the request-latency
     * histograms with noise, so requests to /actuator are skipped. Real traffic is unaffected.
     */
    @Bean
    ObservationPredicate skipActuatorRequests() {
        return (name, context) -> {
            if (context instanceof ServerRequestObservationContext request && request.getCarrier() != null) {
                return !request.getCarrier().getRequestURI().startsWith("/actuator");
            }
            return true;
        };
    }
}
