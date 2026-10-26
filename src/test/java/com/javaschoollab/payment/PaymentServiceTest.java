package com.javaschoollab.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.common.ApiException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The money rules: the price is the server's, a payment counts once, and only a correctly signed confirmation grants Pro. */
class PaymentServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-01T10:00:00Z");

    private PaymentRepository repo;
    private RazorpayGateway gateway;
    private PaymentService service;

    @BeforeEach
    void setUp() {
        repo = mock(PaymentRepository.class);
        gateway = mock(RazorpayGateway.class);
        when(gateway.configured()).thenReturn(true);
        when(gateway.keyId()).thenReturn("rzp_test_key");
        service = new PaymentService(repo, gateway, new ObjectMapper(), Clock.fixed(NOW, ZoneOffset.UTC), 14900, 99900, false);
    }

    private static String sign(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void theSignatureCheckAcceptsTheRightSecretOnlyAndIgnoresCase() throws Exception {
        String sig = sign("order_1|pay_1", "secret");
        assertThat(RazorpayGateway.validSignature("order_1|pay_1", sig, "secret")).isTrue();
        assertThat(RazorpayGateway.validSignature("order_1|pay_1", sig.toUpperCase(), "secret")).isTrue();
        assertThat(RazorpayGateway.validSignature("order_1|pay_1", sig, "other")).isFalse();
        assertThat(RazorpayGateway.validSignature("order_1|pay_2", sig, "secret")).isFalse();
        assertThat(RazorpayGateway.validSignature("order_1|pay_1", null, "secret")).isFalse();
        assertThat(RazorpayGateway.validSignature("order_1|pay_1", sig, "")).isFalse();
    }

    @Test
    void theOrderIsCreatedAtTheServersPriceForTheChosenPlan() {
        when(gateway.createOrder(anyInt(), anyString(), anyMap())).thenReturn("order_9");
        PaymentService.Checkout c = service.checkout(7, "yearly");
        assertThat(c.orderId()).isEqualTo("order_9");
        assertThat(c.amountPaise()).isEqualTo(99900);
        assertThat(c.keyId()).isEqualTo("rzp_test_key");
        verify(gateway).createOrder(eq(99900), anyString(), anyMap());
        verify(repo).addOrder(7, "yearly", 99900, "order_9");
    }

    @Test
    void anUnknownPlanOrSwitchedOffPaymentsCreateNoOrder() {
        assertThatThrownBy(() -> service.checkout(7, "lifetime")).isInstanceOf(ApiException.class);
        when(gateway.configured()).thenReturn(false);
        assertThatThrownBy(() -> service.checkout(7, "monthly")).isInstanceOf(ApiException.class);
        verify(gateway, never()).createOrder(anyInt(), anyString(), anyMap());
    }

    @Test
    void aValidConfirmationGrantsThirtyDaysFromNow() {
        when(repo.findOrder("order_1")).thenReturn(Optional.of(new PaymentRepository.Order(7L, "monthly", 14900, "created")));
        when(gateway.validPayment("order_1", "pay_1", "sig")).thenReturn(true);
        when(repo.markPaid("order_1", "pay_1")).thenReturn(true);
        when(repo.expiry(7)).thenReturn(Optional.empty());
        service.confirm(7, "order_1", "pay_1", "sig");
        verify(repo).setExpiry(7, NOW.plus(Duration.ofDays(30)));
    }

    @Test
    void payingWhileStillProAddsToTheRemainingTime() {
        Instant current = NOW.plus(Duration.ofDays(10));
        when(repo.findOrder("order_1")).thenReturn(Optional.of(new PaymentRepository.Order(7L, "monthly", 14900, "created")));
        when(gateway.validPayment("order_1", "pay_1", "sig")).thenReturn(true);
        when(repo.markPaid("order_1", "pay_1")).thenReturn(true);
        when(repo.expiry(7)).thenReturn(Optional.of(current));
        service.confirm(7, "order_1", "pay_1", "sig");
        verify(repo).setExpiry(7, current.plus(Duration.ofDays(30)));
    }

    @Test
    void aBadSignatureGrantsNothing() {
        when(repo.findOrder("order_1")).thenReturn(Optional.of(new PaymentRepository.Order(7L, "monthly", 14900, "created")));
        when(gateway.validPayment("order_1", "pay_1", "forged")).thenReturn(false);
        assertThatThrownBy(() -> service.confirm(7, "order_1", "pay_1", "forged")).isInstanceOf(ApiException.class);
        verify(repo, never()).markPaid(anyString(), anyString());
        verify(repo, never()).setExpiry(anyLong(), any());
    }

    @Test
    void anotherLearnersOrderCannotBeConfirmed() {
        when(repo.findOrder("order_1")).thenReturn(Optional.of(new PaymentRepository.Order(8L, "monthly", 14900, "created")));
        when(gateway.validPayment(anyString(), anyString(), anyString())).thenReturn(true);
        assertThatThrownBy(() -> service.confirm(7, "order_1", "pay_1", "sig")).isInstanceOf(ApiException.class);
        verify(repo, never()).setExpiry(anyLong(), any());
    }

    @Test
    void anOrderConfirmedTwiceIsAppliedOnce() {
        when(repo.findOrder("order_1")).thenReturn(Optional.of(new PaymentRepository.Order(7L, "monthly", 14900, "paid")));
        when(gateway.validPayment("order_1", "pay_1", "sig")).thenReturn(true);
        when(repo.markPaid("order_1", "pay_1")).thenReturn(false);        // already paid
        service.confirm(7, "order_1", "pay_1", "sig");
        verify(repo, never()).setExpiry(anyLong(), any());
    }

    @Test
    void aSignedWebhookForAMatchingAmountGrantsProAndAWrongAmountDoesNot() {
        String body = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"id\":\"pay_1\",\"order_id\":\"order_1\",\"amount\":14900}}}}";
        when(gateway.validWebhook(body, "sig")).thenReturn(true);
        when(repo.findOrder("order_1")).thenReturn(Optional.of(new PaymentRepository.Order(7L, "monthly", 14900, "created")));
        when(repo.markPaid("order_1", "pay_1")).thenReturn(true);
        when(repo.expiry(7)).thenReturn(Optional.empty());
        service.webhook(body, "sig");
        verify(repo).setExpiry(7, NOW.plus(Duration.ofDays(30)));

        String cheap = body.replace("14900", "100");
        when(gateway.validWebhook(cheap, "sig")).thenReturn(true);
        service.webhook(cheap, "sig");
        verify(repo).markPaid("order_1", "pay_1");                          // still only the first call
    }

    @Test
    void aWebhookWithABadSignatureIsRefused() {
        when(gateway.validWebhook(anyString(), anyString())).thenReturn(false);
        assertThatThrownBy(() -> service.webhook("{}", "x")).isInstanceOf(ApiException.class);
        verify(repo, never()).markPaid(anyString(), anyString());
    }

    @Test
    void proIsOnlyForADateInTheFuture() {
        when(repo.expiry(7)).thenReturn(Optional.of(NOW.plusSeconds(60)));
        when(repo.expiry(8)).thenReturn(Optional.of(NOW.minusSeconds(60)));
        when(repo.expiry(9)).thenReturn(Optional.empty());
        assertThat(service.status(7).pro()).isTrue();
        assertThat(service.status(8).pro()).isFalse();
        assertThat(service.status(9).pro()).isFalse();
    }

    @Test
    void certificatesAreFreeUnlessTheSwitchIsOn() {
        service.requireProForCertificate(9);                                // switch off: nothing happens
        PaymentService strict = new PaymentService(repo, gateway, new ObjectMapper(), Clock.fixed(NOW, ZoneOffset.UTC), 14900, 99900, true);
        when(repo.expiry(9)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> strict.requireProForCertificate(9)).isInstanceOf(ApiException.class).hasMessageContaining("Pro");
        when(repo.expiry(7)).thenReturn(Optional.of(NOW.plusSeconds(60)));
        strict.requireProForCertificate(7);
    }
}
