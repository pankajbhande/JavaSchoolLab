package com.javaschoollab.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaschoollab.common.ApiException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * The only class that talks to Razorpay: creates an order over its REST API and checks the HMAC-SHA256 signatures Razorpay puts on a payment
 * and on a webhook. The secrets come from the environment and are never sent to the browser; only the public key id is.
 */
@Component
public class RazorpayGateway {

    private static final Logger log = LoggerFactory.getLogger(RazorpayGateway.class);
    private static final String ORDERS_URL = "https://api.razorpay.com/v1/orders";

    private final String keyId;
    private final String keySecret;
    private final String webhookSecret;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public RazorpayGateway(@Value("${app.razorpay.key-id:}") String keyId,
                           @Value("${app.razorpay.key-secret:}") String keySecret,
                           @Value("${app.razorpay.webhook-secret:}") String webhookSecret,
                           ObjectMapper json) {
        this.keyId = keyId == null ? "" : keyId.trim();
        this.keySecret = keySecret == null ? "" : keySecret.trim();
        this.webhookSecret = webhookSecret == null ? "" : webhookSecret.trim();
        this.json = json;
    }

    /** Payments are on only when both the key id and its secret are set. */
    public boolean configured() {
        return !keyId.isEmpty() && !keySecret.isEmpty();
    }

    public String keyId() {
        return keyId;
    }

    public boolean webhookConfigured() {
        return !webhookSecret.isEmpty();
    }

    /** Creates an order for {@code amountPaise} rupees-in-paise and returns Razorpay's order id. */
    public String createOrder(int amountPaise, String receipt, Map<String, String> notes) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amountPaise);
        body.put("currency", "INR");
        body.put("receipt", receipt);
        body.put("notes", notes);
        try {
            String auth = Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder(URI.create(ORDERS_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.error("Razorpay refused the order (HTTP {}): {}", response.statusCode(), response.body());
                throw unavailable();
            }
            JsonNode order = json.readTree(response.body());
            String id = order.path("id").asText("");
            if (id.isEmpty()) throw unavailable();
            return id;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw unavailable();
        } catch (IOException e) {
            log.error("Could not reach Razorpay: {}", e.toString());
            throw unavailable();
        }
    }

    /** What the browser gets back from Razorpay Checkout: the signature of {@code order_id|payment_id} made with the key secret. */
    public boolean validPayment(String orderId, String paymentId, String signature) {
        return configured() && validSignature(orderId + "|" + paymentId, signature, keySecret);
    }

    /** A webhook is signed over its raw body with the webhook secret. */
    public boolean validWebhook(String rawBody, String signature) {
        return webhookConfigured() && validSignature(rawBody, signature, webhookSecret);
    }

    /** HMAC-SHA256 of {@code payload} as lower-case hex, compared in constant time. */
    static boolean validSignature(String payload, String signature, String secret) {
        if (payload == null || signature == null || secret == null || secret.isEmpty()) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }

    private static ApiException unavailable() {
        return new ApiException(HttpStatus.BAD_GATEWAY, "Payments are unavailable right now. Please try again in a few minutes.");
    }
}
