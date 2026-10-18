package com.javaschoollab;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Its own Spring context with a tiny limit, so the 429 path is exercised without sixty requests. */
@SpringBootTest(properties = "app.rate-limit.verify-per-minute=3")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CertificateRateLimitTest {

    @Autowired MockMvc mvc;

    @Test
    void publicVerificationAnswers429WithRetryAfterOnceTheLimitIsPassed() throws Exception {
        for (int i = 0; i < 3; i++) {
            mvc.perform(get("/api/certificates/verify/JSL-AAAA-AAAA-AAAA")).andExpect(status().isNotFound());
        }
        mvc.perform(get("/api/certificates/verify/JSL-AAAA-AAAA-AAAA"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.error").value("Too many requests. Please wait a minute and try again."));
        mvc.perform(get("/api/certificates/verify/JSL-AAAA-AAAA-AAAA"))
                .andExpect(header().string("Retry-After", org.hamcrest.Matchers.matchesPattern("\\d+")));
    }
}
