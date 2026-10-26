package com.javaschoollab.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.common.ApiException;
import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * The Pro plan. The price of a plan is held here, never taken from the request. Access is granted by {@link #activate} and only once per
 * Razorpay order, whichever of the two confirmations (the browser's, or Razorpay's webhook) arrives first.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    /** A plan on sale: {@code days} of Pro for {@code amountPaise} (100 paise = 1 rupee). */
    public record Plan(String id, String label, int amountPaise, int days) {}

    /** Whether a learner is Pro, and until when. */
    public record Status(boolean pro, Instant expiresAt) {}

    /** What the browser needs to open Razorpay Checkout. */
    public record Checkout(String keyId, String orderId, int amountPaise, String currency, String description) {}

    private final PaymentRepository payments;
    private final RazorpayGateway gateway;
    private final ObjectMapper json;
    private final Clock clock;
    private final List<Plan> plans;
    private final boolean certificatesProOnly;

    @Autowired
    public PaymentService(PaymentRepository payments, RazorpayGateway gateway, ObjectMapper json,
                          @Value("${app.premium.monthly-paise:14900}") int monthlyPaise,
                          @Value("${app.premium.yearly-paise:99900}") int yearlyPaise,
                          @Value("${app.premium.certificates-pro-only:false}") boolean certificatesProOnly) {
        this(payments, gateway, json, Clock.systemUTC(), monthlyPaise, yearlyPaise, certificatesProOnly);
    }

    PaymentService(PaymentRepository payments, RazorpayGateway gateway, ObjectMapper json, Clock clock,
                   int monthlyPaise, int yearlyPaise, boolean certificatesProOnly) {
        this.payments = payments;
        this.gateway = gateway;
        this.json = json;
        this.clock = clock;
        this.plans = List.of(
                new Plan("monthly", "Pro - 1 month", monthlyPaise, 30),
                new Plan("yearly", "Pro - 1 year", yearlyPaise, 365));
        this.certificatesProOnly = certificatesProOnly;
    }

    public boolean enabled() {
        return gateway.configured();
    }

    public List<Plan> plans() {
        return plans;
    }

    public boolean certificatesProOnly() {
        return certificatesProOnly;
    }

    public Status status(long userId) {
        Optional<Instant> expiry = payments.expiry(userId);
        boolean pro = expiry.isPresent() && expiry.get().isAfter(clock.instant());
        return new Status(pro, expiry.orElse(null));
    }

    /** Called before a certificate is issued: refuses with 402 when certificates are a Pro feature and the learner is not Pro. */
    public void requireProForCertificate(long userId) {
        if (certificatesProOnly && !status(userId).pro()) {
            throw new ApiException(HttpStatus.PAYMENT_REQUIRED, "Certificates are part of JavaSchoolLab Pro. Upgrade on the Pro page to download yours.");
        }
    }

    /** Creates the Razorpay order for the plan and remembers it, so the payment can be matched to this learner later. */
    public Checkout checkout(long userId, String planId) {
        if (!enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Payments are not switched on yet.");
        Plan plan = plan(planId).orElseThrow(() -> ApiException.badRequest("Unknown plan."));
        if (plan.amountPaise() < 100) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "This plan has no valid price yet.");
        String receipt = "jsl_" + userId + "_" + clock.millis();
        String orderId = gateway.createOrder(plan.amountPaise(), receipt, Map.of("userId", String.valueOf(userId), "plan", plan.id()));
        payments.addOrder(userId, plan.id(), plan.amountPaise(), orderId);
        return new Checkout(gateway.keyId(), orderId, plan.amountPaise(), "INR", plan.label());
    }

    /** The browser reports a finished payment: it counts only if Razorpay's signature over it is valid and the order is this learner's. */
    public Status confirm(long userId, String orderId, String paymentId, String signature) {
        PaymentRepository.Order order = payments.findOrder(orderId).orElseThrow(() -> ApiException.notFound("Unknown payment."));
        if (order.userId() == null || order.userId() != userId) throw ApiException.notFound("Unknown payment.");
        if (!gateway.validPayment(orderId, paymentId, signature)) throw ApiException.badRequest("The payment could not be verified. If money was taken, it will be applied automatically within a few minutes.");
        activate(orderId, paymentId, order);
        return status(userId);
    }

    /**
     * Razorpay tells the server about a captured payment itself, which covers a learner who paid and then closed the tab before the browser
     * could confirm. Always answers normally for a correctly signed call, so Razorpay does not retry for an order that is not ours.
     */
    public void webhook(String rawBody, String signature) {
        if (!gateway.validWebhook(rawBody, signature)) throw ApiException.badRequest("Invalid signature.");
        try {
            JsonNode root = json.readTree(rawBody);
            String event = root.path("event").asText("");
            if (!event.equals("payment.captured") && !event.equals("order.paid")) return;
            JsonNode payment = root.path("payload").path("payment").path("entity");
            String orderId = payment.path("order_id").asText("");
            String paymentId = payment.path("id").asText("");
            if (orderId.isEmpty() || paymentId.isEmpty()) return;
            Optional<PaymentRepository.Order> order = payments.findOrder(orderId);
            if (order.isEmpty()) return;
            if (payment.path("amount").asInt(-1) != order.get().amountPaise()) {
                log.warn("Webhook for order {} has amount {} but the order is for {}; not applied", orderId, payment.path("amount").asInt(-1), order.get().amountPaise());
                return;
            }
            activate(orderId, paymentId, order.get());
        } catch (IOException e) {
            throw ApiException.badRequest("Unreadable webhook.");
        }
    }

    /** Marks the order paid and extends Pro; does nothing the second time the same order is confirmed. */
    private void activate(String orderId, String paymentId, PaymentRepository.Order order) {
        if (order.userId() == null || !payments.markPaid(orderId, paymentId)) return;
        Plan plan = plan(order.plan()).orElse(null);
        if (plan == null) {
            log.error("Order {} was paid for unknown plan '{}'; Pro not granted", orderId, order.plan());
            return;
        }
        Instant now = clock.instant();
        Instant from = payments.expiry(order.userId()).filter(e -> e.isAfter(now)).orElse(now);
        payments.setExpiry(order.userId(), from.plus(Duration.ofDays(plan.days())));
        log.info("Pro granted to user {} for {} days (order {})", order.userId(), plan.days(), orderId);
    }

    private Optional<Plan> plan(String id) {
        return plans.stream().filter(p -> p.id().equals(id)).findFirst();
    }
}
