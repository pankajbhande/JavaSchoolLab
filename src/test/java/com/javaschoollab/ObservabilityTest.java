package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Observability that must not silently stop working: the request log line, the latency histograms, and the per-service timers.
 * (Each of these was once configured but did nothing, and nobody noticed until a dashboard came up empty.)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@ExtendWith(OutputCaptureExtension.class)
class ObservabilityTest {

    @Autowired MockMvc mvc;

    private String prometheus() throws Exception {
        return mvc.perform(get("/actuator/prometheus").with(httpBasic("actuator", "test-actuator-password")))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    }

    @Test
    void everyApiRequestWritesOneLogLineWithMethodPathStatusAndDuration(CapturedOutput output) throws Exception {
        mvc.perform(get("/api/search/status")).andExpect(status().isOk());

        assertThat(output.getAll()).containsPattern("HTTP GET /api/search/status -> 200 in \\d+ ms");
    }

    @Test
    void theRequestLogNeverContainsTheQueryString(CapturedOutput output) throws Exception {
        mvc.perform(get("/api/search/status").param("secret", "do-not-log-me")).andExpect(status().isOk());

        assertThat(output.getAll()).contains("HTTP GET /api/search/status -> 200").doesNotContain("do-not-log-me");
    }

    @Test
    void healthProbesAndStaticFilesAreNotLogged(CapturedOutput output) throws Exception {
        mvc.perform(get("/actuator/health"));
        mvc.perform(get("/some-missing-file.js"));

        assertThat(output.getAll()).doesNotContain("HTTP GET /actuator/health").doesNotContain("HTTP GET /some-missing-file.js");
    }

    @Test
    void requestLatencyIsPublishedAsAHistogramSoPercentilesCanBeComputed() throws Exception {
        mvc.perform(get("/api/search/status")).andExpect(status().isOk());

        String metrics = prometheus();
        assertThat(metrics).contains("http_server_requests_seconds_bucket");
        assertThat(metrics).contains("le=\"0.3\"");      // the 300 ms objective the SLO dashboards and alerts use
    }

    @Test
    void everyServiceMethodIsTimedAsABusinessOperation() throws Exception {
        mvc.perform(get("/api/visitors/count")).andExpect(status().isOk());

        String metrics = prometheus();
        assertThat(metrics).contains("jsl_service_seconds_count");
        assertThat(metrics).contains("service=\"VisitorService\"");
        assertThat(metrics).contains("jsl_service_seconds_bucket");
    }

    @Test
    void sqlStatementsAreMeasured() throws Exception {
        mvc.perform(get("/api/visitors/count")).andExpect(status().isOk());

        assertThat(prometheus()).contains("jdbc_query_seconds_count");
    }
}
