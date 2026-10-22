package com.javaschoollab.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Everything under "app." in application.yml; each value comes from the same env var the Node server used. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Otp otp, Mail mail, RateLimit rateLimit) {

    /** Requests per minute per client address on public routes that need no login. */
    public record RateLimit(int verifyPerMinute, int profilePerMinute, int handleCheckPerMinute,
                            int loginPerMinute, int otpSendPerMinute, int otpVerifyPerMinute) {}

    public record Jwt(String secret, int expiresDays) {}

    public record Cors(String origins) {
        public List<String> list() {
            if (origins == null) return List.of();
            return Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        }
    }

    public record Otp(boolean devEcho) {}

    public record Mail(String host, int port, String user, String pass, String from, String secure) {
        /** Same rule as the Node mailer: sending is on only when host, user and password are all set. */
        public boolean configured() {
            return notBlank(host) && notBlank(user) && notBlank(pass);
        }

        /** 465 is implicit TLS; 587 is STARTTLS. SMTP_SECURE overrides the guess. */
        public boolean implicitTls() {
            return notBlank(secure) ? "true".equals(secure) : port == 465;
        }

        public String fromAddress() {
            return notBlank(from) ? from : "JavaSchoolLab <" + user + ">";
        }

        private static boolean notBlank(String s) {
            return s != null && !s.isBlank();
        }
    }
}
