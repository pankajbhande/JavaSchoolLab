package com.javaschoollab.suggestions;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.auth.MailService;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.security.AuthUser;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Rules: a known category, a message of 10 to 2,000 characters, at most 10 a day per learner. Admins are told by e-mail. */
@Service
public class SuggestionService {

    private static final Logger log = LoggerFactory.getLogger(SuggestionService.class);

    static final Set<String> CATEGORIES = Set.of("idea", "content", "bug", "other");
    static final Set<String> STATUSES = Set.of("new", "seen", "done");
    static final int MIN_CHARS = 10;
    static final int MAX_CHARS = 2_000;
    static final int PER_DAY = 10;

    private final SuggestionRepository repo;
    private final MailService mail;
    private final Set<String> adminEmails;

    public SuggestionService(SuggestionRepository repo, MailService mail, @Value("${app.admin.emails:}") String adminEmails) {
        this.repo = repo;
        this.mail = mail;
        this.adminEmails = Arrays.stream(adminEmails.split(",")).map(s -> s.trim().toLowerCase(Locale.ROOT)).filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public void send(AuthUser user, JsonNode body) {
        String category = text(body, "category");
        if (!CATEGORIES.contains(category)) throw ApiException.badRequest("Choose what kind of suggestion this is");
        String message = text(body, "message").strip();
        if (message.length() < MIN_CHARS) throw ApiException.badRequest("Please write at least " + MIN_CHARS + " characters");
        if (message.length() > MAX_CHARS) throw ApiException.badRequest("Please keep it under " + MAX_CHARS + " characters");
        String path = text(body, "pagePath").strip();
        if (path.length() > 300) path = path.substring(0, 300);
        if (repo.sentToday(user.id()) >= PER_DAY) throw ApiException.badRequest("You have sent many suggestions today. Please try again tomorrow.");
        String pagePath = path.isEmpty() ? null : path;
        repo.add(user.id(), category, message, pagePath);
        notifyAdmins(user, category, message, pagePath);
    }

    /** Best effort and off the request thread: a mail problem must never stop a learner's suggestion from being saved. */
    private void notifyAdmins(AuthUser user, String category, String message, String pagePath) {
        if (adminEmails.isEmpty() || !mail.configured()) return;
        String from = user.fullName() + " <" + (user.email() != null ? user.email() : user.mobile()) + ">";
        CompletableFuture.runAsync(() -> {
            try {
                mail.sendSuggestionNotice(adminEmails, from, category, message, pagePath);
            } catch (Exception e) {
                log.warn("Could not e-mail the suggestion notice: {}", e.toString());
            }
        });
    }

    public List<Suggestion> mine(long userId) {
        return repo.mine(userId);
    }

    /** The admin list. Only the ADMIN_EMAILS accounts may read it. */
    public List<SuggestionRepository.Row> all(String adminEmail, String status) {
        requireAdmin(adminEmail);
        return repo.all(status);
    }

    public void setStatus(String adminEmail, long id, String status) {
        requireAdmin(adminEmail);
        if (!STATUSES.contains(status)) throw ApiException.badRequest("Status must be new, seen or done");
        if (!repo.setStatus(id, status)) throw new ApiException(HttpStatus.NOT_FOUND, "Suggestion not found");
    }

    private void requireAdmin(String email) {
        if (email == null || !adminEmails.contains(email.trim().toLowerCase(Locale.ROOT)))
            throw new ApiException(HttpStatus.FORBIDDEN, "Suggestions are only for the site admin.");
    }

    private static String text(JsonNode body, String field) {
        JsonNode v = body == null ? null : body.get(field);
        return v == null || v.isNull() ? "" : v.asText();
    }
}
