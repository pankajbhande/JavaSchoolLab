package com.javaschoollab.analytics;

import com.javaschoollab.common.ApiException;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * What the site records about its own use, and the numbers the admin dashboard shows. Events are anonymous (a per-tab session id,
 * the user id when signed in, the page path, search words and result count); the dashboard is open only to the emails listed in
 * ADMIN_EMAILS.
 */
@Service
public class AnalyticsService {

    /** The only event types the browser may report; anything else is rejected, so the table cannot be filled with junk. */
    static final Set<String> TYPES = Set.of("page_view", "search", "share");
    static final int KEEP_DAYS = 400;

    private final AnalyticsRepository repo;
    private final Set<String> adminEmails;

    AnalyticsService(AnalyticsRepository repo, @Value("${app.admin.emails:}") String adminEmails) {
        this.repo = repo;
        this.adminEmails = java.util.Arrays.stream(adminEmails.split(",")).map(s -> s.trim().toLowerCase(Locale.ROOT)).filter(s -> !s.isEmpty())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    public boolean isAdmin(String email) {
        return email != null && adminEmails.contains(email.trim().toLowerCase(Locale.ROOT));
    }

    /** Records one browser event. Bad input is dropped quietly: tracking must never break the page that sends it. */
    public void record(String type, String sessionId, Long userId, String path, String detail, Integer value) {
        if (type == null || !TYPES.contains(type)) return;
        repo.insertEvent(type, clean(sessionId, 64), userId, cleanPath(path), "search".equals(type) ? clean(detail == null ? null : detail.toLowerCase(Locale.ROOT), 100) : clean(detail, 100),
                value == null ? null : Math.max(0, Math.min(value, 100000)));
    }

    /** "/course/java?level=expert#x" becomes "/course/java": no query strings or fragments are ever stored. */
    static String cleanPath(String p) {
        if (p == null) return null;
        String s = p.strip();
        int cut = s.indexOf('?');
        if (cut >= 0) s = s.substring(0, cut);
        cut = s.indexOf('#');
        if (cut >= 0) s = s.substring(0, cut);
        if (!s.startsWith("/")) return null;
        return clean(s, 255);
    }

    private static String clean(String s, int max) {
        if (s == null) return null;
        String t = s.strip().replaceAll("[\\p{Cntrl}]", " ");
        if (t.isEmpty()) return null;
        return t.length() > max ? t.substring(0, max) : t;
    }

    public Map<String, Object> dashboard(String adminEmail, int days) {
        if (!isAdmin(adminEmail)) throw new ApiException(org.springframework.http.HttpStatus.FORBIDDEN, "Analytics is only for the site admin.");
        int span = Math.max(1, Math.min(days, 365));
        LocalDate today = LocalDate.now();
        LocalDateTime since = today.minusDays(span - 1L).atStartOfDay();

        TreeMap<LocalDate, Map<String, Object>> byDay = new TreeMap<>();
        for (int i = span - 1; i >= 0; i--) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", today.minusDays(i).toString());
            for (String k : new String[] {"pageViews", "sessions", "signups", "quizAttempts", "certificates", "searches"}) row.put(k, 0L);
            byDay.put(today.minusDays(i), row);
        }
        fill(byDay, repo.daily(AnalyticsRepository.PAGE_VIEWS_DAILY, since), "pageViews", "c");
        fill(byDay, repo.daily(AnalyticsRepository.PAGE_VIEWS_DAILY, since), "sessions", "s");
        fill(byDay, repo.daily(AnalyticsRepository.SEARCHES_DAILY, since), "searches", "c");
        fill(byDay, repo.daily(AnalyticsRepository.SIGNUPS_DAILY, since), "signups", "c");
        fill(byDay, repo.daily(AnalyticsRepository.QUIZZES_DAILY, since), "quizAttempts", "c");
        fill(byDay, repo.daily(AnalyticsRepository.CERTIFICATES_DAILY, since), "certificates", "c");

        java.sql.Timestamp ts = java.sql.Timestamp.valueOf(since);
        long sessions = repo.count("SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE event_type = 'page_view' AND created_at >= ?", ts);
        long signups = repo.count("SELECT COUNT(*) FROM users WHERE created_at >= ?", ts);
        long quizTakers = repo.count("SELECT COUNT(DISTINCT user_id) FROM quiz_attempts WHERE attempted_at >= ?", ts);
        long certEarners = repo.count("SELECT COUNT(DISTINCT user_id) FROM certificates WHERE issued_at >= ?", ts);

        Map<String, Object> totals = new LinkedHashMap<>();
        totals.put("visitorCounter", repo.visitorCounter());
        totals.put("users", repo.count("SELECT COUNT(*) FROM users"));
        totals.put("certificates", repo.count("SELECT COUNT(*) FROM certificates"));
        totals.put("quizAttempts", repo.count("SELECT COUNT(*) FROM quiz_attempts"));
        totals.put("topicsStudied", repo.count("SELECT COUNT(*) FROM topic_progress"));
        totals.put("pageViews", repo.count("SELECT COUNT(*) FROM analytics_events WHERE event_type = 'page_view' AND created_at >= ?", ts));
        totals.put("sessions", sessions);
        totals.put("searches", repo.count("SELECT COUNT(*) FROM analytics_events WHERE event_type = 'search' AND created_at >= ?", ts));
        totals.put("signups", signups);
        totals.put("shares", repo.count("SELECT COUNT(*) FROM analytics_events WHERE event_type = 'share' AND created_at >= ?", ts));

        Map<String, Object> funnel = new LinkedHashMap<>();
        funnel.put("sessions", sessions);
        funnel.put("signups", signups);
        funnel.put("quizTakers", quizTakers);
        funnel.put("certificateEarners", certEarners);
        funnel.put("signupRatePercent", sessions == 0 ? 0 : Math.round(1000.0 * signups / sessions) / 10.0);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("days", span);
        out.put("generatedAt", LocalDateTime.now().toString());
        out.put("totals", totals);
        out.put("funnel", funnel);
        out.put("daily", new ArrayList<>(byDay.values()));
        out.put("topPages", repo.topPages(since, 10));
        out.put("topSearches", repo.topSearches(since, 15, false));
        out.put("emptySearches", repo.topSearches(since, 15, true));
        out.put("topCourses", repo.topCourses(since, 10));
        out.put("topShared", repo.topShared(since, 10));
        out.put("shareChannels", repo.shareChannels(since));
        return out;
    }

    private static void fill(TreeMap<LocalDate, Map<String, Object>> byDay, List<Map<String, Object>> rows, String key, String column) {
        for (Map<String, Object> r : rows) {
            Object d = r.get("d");
            LocalDate day = d instanceof Date sql ? sql.toLocalDate() : LocalDate.parse(String.valueOf(d));
            Map<String, Object> row = byDay.get(day);
            if (row != null) row.put(key, ((Number) r.get(column)).longValue());
        }
    }

    /** Events older than a year add nothing to the dashboard, so they are cleared out once a day. */
    @Scheduled(cron = "0 30 3 * * *")
    void purgeOld() {
        repo.deleteOlderThan(LocalDateTime.now().minusDays(KEEP_DAYS));
    }
}
