package com.javaschoollab;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * The operations endpoints (Spring Boot Actuator): the probes and /info are public but reveal no details, the metrics need the
 * ACTUATOR account, and nothing else (env, beans, heap dump...) is exposed at all.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ActuatorTest {

    @Autowired MockMvc mvc;

    @Test
    void healthIsPublicAndShowsOnlyTheStatusToAnonymousCallers() throws Exception {
        mvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());
    }

    @Test
    void livenessAndReadinessProbesAreUp() throws Exception {
        mvc.perform(get("/actuator/health/liveness")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void theActuatorAccountSeesTheComponentsAndRedisIsLeftOutWhenItIsSwitchedOff() throws Exception {
        mvc.perform(get("/actuator/health").with(httpBasic("actuator", "test-actuator-password")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.db.status").value("UP"))
                .andExpect(jsonPath("$.components.search.status").value("UNKNOWN"))   // search is not configured in tests
                .andExpect(jsonPath("$.components.redis").doesNotExist());            // REDIS_ENABLED is false in tests
    }

    @Test
    void infoIsPublicAndNamesTheApplication() throws Exception {
        mvc.perform(get("/actuator/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.app.name").value("JavaSchoolLab"));
    }

    @Test
    void metricsAndPrometheusNeedTheActuatorAccount() throws Exception {
        mvc.perform(get("/actuator/prometheus")).andExpect(status().isUnauthorized());
        mvc.perform(get("/actuator/metrics")).andExpect(status().isUnauthorized());
        mvc.perform(get("/actuator/prometheus").with(httpBasic("actuator", "wrong-password"))).andExpect(status().isUnauthorized());
    }

    @Test
    void prometheusServesJvmHttpAndSearchMetricsTaggedWithTheApplication() throws Exception {
        mvc.perform(get("/actuator/prometheus").with(httpBasic("actuator", "test-actuator-password")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("jvm_memory_used_bytes")))
                .andExpect(content().string(containsString("application=\"javaschoollab\"")))
                .andExpect(content().string(containsString("jsl_search_ready")));
        mvc.perform(get("/actuator/metrics/jvm.memory.used").with(httpBasic("actuator", "test-actuator-password")))
                .andExpect(status().isOk());
    }

    @Test
    void dangerousEndpointsAreNotExposedEvenToTheActuatorAccount() throws Exception {
        for (String endpoint : new String[] {"env", "beans", "heapdump", "threaddump", "loggers", "configprops", "mappings", "shutdown"}) {
            mvc.perform(get("/actuator/" + endpoint).with(httpBasic("actuator", "test-actuator-password")))
                    .andExpect(status().isNotFound());
        }
    }
}
