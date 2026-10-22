package com.javaschoollab.config;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * Wraps every public method of every {@code *Service} class in an observation. One observation produces both signals:
 * <ul>
 *   <li>a metric: the timer {@code jsl.service} (Prometheus: {@code jsl_service_seconds_count / _sum / _max}) tagged with
 *       {@code service}, {@code method} and {@code error} ("none" or the exception class), so a dashboard can show how often and how slowly
 *       every business operation runs, and which ones fail;</li>
 *   <li>a span named {@code AuthService.login} (and so on) inside the trace of the HTTP request that called it, between the
 *       request span above and the SQL spans below.</li>
 * </ul>
 * No service class needs an annotation: the pointcut is the naming convention the architecture tests already enforce.
 */
@Aspect
@Component
public class ServiceObservationAspect {

    /** The observation (and timer) name. */
    static final String NAME = "jsl.service";

    private final ObservationRegistry registry;

    public ServiceObservationAspect(ObservationRegistry registry) {
        this.registry = registry;
    }

    // SearchService.status() is read by the health indicator and the Prometheus gauges on every scrape: observing it would only add noise.
    @Around("execution(public * com.javaschoollab..*Service.*(..)) && !execution(* com.javaschoollab.search.SearchService.status(..))")
    public Object observe(ProceedingJoinPoint call) throws Throwable {
        String service = call.getSignature().getDeclaringType().getSimpleName();
        String method = call.getSignature().getName();
        Observation observation = Observation.createNotStarted(NAME, registry)
                .contextualName(service + "." + method)
                .lowCardinalityKeyValue("service", service)
                .lowCardinalityKeyValue("method", method)
                .start();
        try (Observation.Scope ignored = observation.openScope()) {
            return call.proceed();
        } catch (Throwable t) {
            observation.error(t);
            throw t;
        } finally {
            observation.stop();
        }
    }
}
