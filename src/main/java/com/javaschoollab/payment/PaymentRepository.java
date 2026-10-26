package com.javaschoollab.payment;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** payments (one row per checkout) and premium_access (the date a learner stays Pro until). */
@Repository
public class PaymentRepository {

    /** A checkout as stored; {@code userId} is null once the account was deleted. */
    public record Order(Long userId, String plan, int amountPaise, String status) {}

    private final JdbcTemplate jdbc;

    public PaymentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void addOrder(long userId, String plan, int amountPaise, String orderId) {
        jdbc.update("INSERT INTO payments (user_id, plan, amount_paise, razorpay_order_id) VALUES (?, ?, ?, ?)", userId, plan, amountPaise, orderId);
    }

    public Optional<Order> findOrder(String orderId) {
        List<Order> rows = jdbc.query("SELECT user_id, plan, amount_paise, status FROM payments WHERE razorpay_order_id = ?",
                (rs, n) -> new Order(rs.getObject(1) == null ? null : rs.getLong(1), rs.getString(2), rs.getInt(3), rs.getString(4)), orderId);
        return rows.stream().findFirst();
    }

    /** True only for the call that flips the order to paid, so a payment that is confirmed twice (browser and webhook) is applied once. */
    public boolean markPaid(String orderId, String paymentId) {
        return jdbc.update("UPDATE payments SET status = 'paid', razorpay_payment_id = ?, paid_at = CURRENT_TIMESTAMP "
                + "WHERE razorpay_order_id = ? AND status <> 'paid'", paymentId, orderId) > 0;
    }

    public Optional<Instant> expiry(long userId) {
        List<Timestamp> rows = jdbc.query("SELECT expires_at FROM premium_access WHERE user_id = ?", (rs, n) -> rs.getTimestamp(1), userId);
        return rows.stream().findFirst().map(Timestamp::toInstant);
    }

    public void setExpiry(long userId, Instant expiresAt) {
        jdbc.update("INSERT INTO premium_access (user_id, expires_at) VALUES (?, ?) ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)",
                userId, Timestamp.from(expiresAt));
    }
}
