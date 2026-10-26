package com.javaschoollab.payment;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Which payment routes are public and which need a token. No Razorpay keys are set in tests, so payments report as switched off. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentApiTest {

    @Autowired MockMvc mvc;

    @Test
    void thePriceListIsPublicAndSaysPaymentsAreOffWithoutKeys() throws Exception {
        mvc.perform(get("/api/payments/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false))
                .andExpect(jsonPath("$.plans[0].id").value("monthly"))
                .andExpect(jsonPath("$.plans[0].amountPaise").value(14900))
                .andExpect(jsonPath("$.plans[1].id").value("yearly"));
    }

    @Test
    void statusCheckoutAndConfirmationNeedASignedInLearner() throws Exception {
        mvc.perform(get("/api/payments/status")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/payments/order").contentType(MediaType.APPLICATION_JSON).content("{\"plan\":\"monthly\"}")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/payments/verify").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
    }

    @Test
    void aWebhookWithoutAValidSignatureIsRefusedNotUnauthorised() throws Exception {
        mvc.perform(post("/api/payments/webhook").contentType(MediaType.APPLICATION_JSON).header("X-Razorpay-Signature", "forged").content("{\"event\":\"payment.captured\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Invalid signature")));
    }
}
