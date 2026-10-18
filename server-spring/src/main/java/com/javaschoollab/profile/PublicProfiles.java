package com.javaschoollab.profile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Builds the public JSON of a learner profile. The one place that decides what may leave the server. */
public final class PublicProfiles {

    private PublicProfiles() {}

    /** The user_profiles row joined with the two public-safe users columns (name, avatar) and the join date. */
    public record Profile(String handle, String displayName, String bio, String fullName, String avatar, Instant memberSince,
                          boolean showCertificates, boolean showStats, boolean showBadges, boolean showProgress) {}

    public record Cert(String certificateUid, String courseName, String topicName, int score, int totalQuestions, Instant issuedAt) {}

    public record Stats(int xp, int currentStreak, int longestStreak, int topicsSeen, int modulesPassed, int studyDays, long studySecondsTotal) {}

    /**
     * What the owner has opted to share. Sections are copied in only when their flag is set. Anything the caller
     * did not load (because the flag is off) can simply be null/empty.
     */
    public record Data(List<Cert> certificates, Stats stats, ProfileRules.BadgeInput badgeInput, Map<String, Integer> byCourse) {
        public static Data empty() {
            return new Data(List.of(), null, null, Map.of());
        }
    }

    public static Map<String, Object> build(Profile p, Data d) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("handle", p.handle());
        out.put("displayName", p.displayName() != null && !p.displayName().isEmpty() ? p.displayName() : p.fullName());
        out.put("bio", p.bio() == null ? "" : p.bio());
        out.put("memberSince", p.memberSince());
        Map<String, Object> show = new LinkedHashMap<>();
        show.put("certificates", p.showCertificates());
        show.put("stats", p.showStats());
        show.put("badges", p.showBadges());
        show.put("progress", p.showProgress());
        out.put("show", show);
        if (p.avatar() != null && !p.avatar().isEmpty()) out.put("avatar", p.avatar());

        if (p.showCertificates()) {
            List<Map<String, Object>> certs = new ArrayList<>();
            for (Cert c : d.certificates()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("certificateUid", c.certificateUid());
                m.put("courseName", c.courseName());
                m.put("topicName", c.topicName());
                m.put("score", c.score());
                m.put("totalQuestions", c.totalQuestions());
                m.put("percentage", c.totalQuestions() > 0 ? Math.round(c.score() * 100.0 / c.totalQuestions()) : 0);
                m.put("issuedAt", c.issuedAt());
                certs.add(m);
            }
            out.put("certificates", certs);
        }
        if (p.showStats() && d.stats() != null) {
            Stats s = d.stats();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("xp", s.xp());
            m.put("currentStreak", s.currentStreak());
            m.put("longestStreak", s.longestStreak());
            m.put("topicsSeen", s.topicsSeen());
            m.put("modulesPassed", s.modulesPassed());
            m.put("studyDays", s.studyDays());
            m.put("studySecondsTotal", s.studySecondsTotal());
            out.put("stats", m);
        }
        if (p.showBadges() && d.badgeInput() != null) {
            out.put("badges", ProfileRules.computeBadges(d.badgeInput()).stream()
                    .map(b -> Map.of("id", b.id(), "name", b.name(), "hint", b.hint())).toList());
        }
        if (p.showProgress()) {
            // Most-studied course first; equal counts keep their original order (the sort is stable).
            out.put("courses", d.byCourse().entrySet().stream()
                    .map(e -> Map.<String, Object>of("courseId", e.getKey(), "topicsSeen", e.getValue()))
                    .sorted(Comparator.comparingInt((Map<String, Object> m) -> (Integer) m.get("topicsSeen")).reversed())
                    .toList());
        }
        return out;
    }
}
