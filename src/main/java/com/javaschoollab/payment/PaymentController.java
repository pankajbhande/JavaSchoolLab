package com.javaschoollab.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The Pro plan: public price list and Razorpay webhook, and the signed-in learner's checkout, confirmation and status. */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService payments;

    public PaymentController(PaymentService payments) {
        this.payments = payments;
    }

    /** Public, so the pricing page can show prices to a visitor who has not signed in. */
    @GetMapping("/plans")
    public Map<String, Object> plans() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("enabled", payments.enabled());
        out.put("certificatesProOnly", payments.certificatesProOnly());
        out.put("plans", payments.plans().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.id());
            m.put("label", p.label());
            m.put("amountPaise", p.amountPaise());
            m.put("days", p.days());
            return m;
        }).toList());
        return out;
    }

    @GetMapping("/status")
    public Map<String, Object> status(@AuthenticationPrincipal AuthUser user) {
        return statusBody(payments.status(user.id()));
    }

    @PostMapping("/order")
    public Map<String, Object> order(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        PaymentService.Checkout c = payments.checkout(user.id(), text(body, "plan"));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("keyId", c.keyId());
        out.put("orderId", c.orderId());
        out.put("amountPaise", c.amountPaise());
        out.put("currency", c.currency());
        out.put("description", c.description());
        return out;
    }

    @PostMapping("/verify")
    public Map<String, Object> verify(@AuthenticationPrincipal AuthUser user, @RequestBody JsonNode body) {
        return statusBody(payments.confirm(user.id(), text(body, "orderId"), text(body, "paymentId"), text(body, "signature")));
    }

    /** Called by Razorpay, not by a browser: authenticated by the signature over the raw body, never by a token. */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String rawBody, @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        payments.webhook(rawBody, signature);
        return ResponseEntity.ok().build();
    }

    private static Map<String, Object> statusBody(PaymentService.Status s) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("pro", s.pro());
        out.put("expiresAt", s.expiresAt());
        return out;
    }

    private static String text(JsonNode body, String field) {
        JsonNode n = body.get(field);
        if (n == null || !n.isTextual() || n.asText().isBlank() || n.asText().length() > 100) throw ApiException.badRequest("Missing or invalid " + field + ".");
        return n.asText().trim();
    }
}
