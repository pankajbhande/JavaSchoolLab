package com.javaschoollab.auth;

import com.javaschoollab.config.AppProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends the sign-in code by email over SMTP. Settings are the same SMTP_* variables the Node mailer used.
 * With SMTP_HOST unset, {@link #configured()} is false and the caller decides: development logs the code,
 * production refuses to pretend it was sent.
 */
@Service
public class MailService {

    private final AppProperties.Mail cfg;
    private final JavaMailSenderImpl sender;

    public MailService(AppProperties props) {
        this.cfg = props.mail();
        this.sender = cfg.configured() ? build(cfg) : null;
    }

    public boolean configured() {
        return sender != null;
    }

    public void sendOtp(String to, String otp, String purpose) throws MessagingException {
        String action = "login".equals(purpose) ? "sign in" : "create your account";
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper h = new MimeMessageHelper(message, true, "UTF-8");
        h.setFrom(cfg.fromAddress());
        h.setTo(to);
        h.setSubject(otp + " is your JavaSchoolLab verification code");
        h.setText(
                "Your JavaSchoolLab verification code is " + otp + ".\n\n"
                        + "Use it to " + action + ". It expires in 5 minutes.\n"
                        + "If you did not request this, you can ignore this email.",
                "<div style=\"font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px\">"
                        + "<h2 style=\"color:#ea580c;margin:0 0 12px\">JavaSchoolLab</h2>"
                        + "<p>Use this code to " + action + ":</p>"
                        + "<p style=\"font-size:32px;letter-spacing:6px;font-weight:bold;margin:16px 0\">" + otp + "</p>"
                        + "<p style=\"color:#555\">It expires in 5 minutes. If you did not request this, you can ignore this email.</p></div>");
        sender.send(message);
    }

    private static JavaMailSenderImpl build(AppProperties.Mail cfg) {
        JavaMailSenderImpl s = new JavaMailSenderImpl();
        s.setHost(cfg.host());
        s.setPort(cfg.port());
        s.setUsername(cfg.user());
        s.setPassword(cfg.pass());
        Properties p = s.getJavaMailProperties();
        p.put("mail.smtp.auth", "true");
        if (cfg.implicitTls()) p.put("mail.smtp.ssl.enable", "true");
        else p.put("mail.smtp.starttls.enable", "true");
        p.put("mail.smtp.connectiontimeout", "10000");
        p.put("mail.smtp.timeout", "15000");
        p.put("mail.smtp.writetimeout", "15000");
        return s;
    }
}
