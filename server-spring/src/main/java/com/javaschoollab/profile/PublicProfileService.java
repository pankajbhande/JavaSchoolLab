package com.javaschoollab.profile;

import com.fasterxml.jackson.databind.JsonNode;
import com.javaschoollab.certificate.CertificateService;
import com.javaschoollab.common.ApiException;
import com.javaschoollab.profile.PublicProfiles.Cert;
import com.javaschoollab.progress.ProgressService;
import com.javaschoollab.progress.StudyDay;
import com.javaschoollab.quiz.QuizService;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

/**
 * Opt-in public learner profiles: the published page (only the sections the learner chose, built by
 * {@link PublicProfiles#build}), and the learner's own settings with their validation.
 */
@Service
public class PublicProfileService {

    private final ProfileSettingsRepository repo;
    private final ProgressService progress;
    private final QuizService quiz;
    private final CertificateService certificates;

    public PublicProfileService(ProfileSettingsRepository repo, ProgressService progress, QuizService quiz,
                                CertificateService certificates) {
        this.repo = repo;
        this.progress = progress;
        this.quiz = quiz;
        this.certificates = certificates;
    }

    /** The public JSON of a handle; empty for "no such handle", a bad handle and "not published" alike. */
    public Optional<Map<String, Object>> publicProfile(String handle) {
        String h = ProfileRules.normalizeHandle(handle);
        if (ProfileRules.handleError(h) != null) return Optional.empty();
        var found = repo.published(h);
        if (found.isEmpty()) return Optional.empty();

        var pp = found.get();
        var profile = pp.profile();
        long uid = pp.userId();
        boolean needActivity = profile.showStats() || profile.showBadges();

        List<Cert> certs = profile.showCertificates() || profile.showBadges() ? certificatesOf(uid) : List.of();
        Map<String, Integer> byCourse = profile.showProgress() || needActivity ? progress.topicsByCourse(uid) : Map.of();
        PublicProfiles.Stats stats = null;
        ProfileRules.BadgeInput badgeInput = null;
        if (needActivity) {
            List<StudyDay> days = progress.studyDays(uid);
            var streak = progress.streakInfo(days.stream().map(StudyDay::date).toList(), LocalDate.now());
            int topicsSeen = byCourse.values().stream().mapToInt(Integer::intValue).sum();
            int modulesPassed = quiz.passedModules(uid).size();
            long totalSeconds = days.stream().mapToLong(StudyDay::seconds).sum();
            stats = new PublicProfiles.Stats(progress.computeXp(topicsSeen, modulesPassed, days.size()),
                    streak.currentStreak(), streak.longestStreak(), topicsSeen, modulesPassed, days.size(), totalSeconds);
            badgeInput = new ProfileRules.BadgeInput(topicsSeen, streak.longestStreak(), modulesPassed, totalSeconds, certs.size());
        }
        return Optional.of(PublicProfiles.build(profile, new PublicProfiles.Data(certs, stats, badgeInput, byCourse)));
    }

    private List<Cert> certificatesOf(long userId) {
        return certificates.publicCertificates(userId).stream()
                .map(c -> new Cert(c.certificateUid(), c.courseName(), c.topicName(), c.score(), c.totalQuestions(), c.issuedAt()))
                .toList();
    }

    /** My current settings as JSON (everything off when I have never configured a profile). */
    public Map<String, Object> settings(long userId) {
        return settingsOf(userId).toJson();
    }

    /** Is this handle free? My own current handle counts as free. */
    public Map<String, Object> handleAvailable(long userId, String handle) {
        String h = ProfileRules.normalizeHandle(handle);
        String problem = ProfileRules.handleError(h);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("handle", h);
        if (problem != null) {
            out.put("available", false);
            out.put("reason", problem);
        } else {
            boolean taken = repo.ownerOfHandle(h).filter(owner -> owner != userId).isPresent();
            out.put("available", !taken);
            out.put("reason", taken ? "That handle is already taken" : null);
        }
        return out;
    }

    /** Update my settings. Only the fields sent change. Publishing needs a valid, free handle. */
    public Map<String, Object> update(long userId, JsonNode body) {
        var cur = settingsOf(userId);
        var next = new ProfileRules.Settings(
                flag(body, "isPublic", cur.isPublic()),
                body.has("handle") ? ProfileRules.normalizeHandle(textOrNull(body.get("handle"))) : cur.handle(),
                body.has("displayName") ? ProfileRules.cleanDisplayName(textOrNull(body.get("displayName"))) : cur.displayName(),
                body.has("bio") ? ProfileRules.cleanBio(textOrNull(body.get("bio"))) : cur.bio(),
                flag(body, "showCertificates", cur.showCertificates()),
                flag(body, "showStats", cur.showStats()),
                flag(body, "showBadges", cur.showBadges()),
                flag(body, "showProgress", cur.showProgress()));

        if (!next.bio().isEmpty()) {
            String e = ProfileRules.bioError(next.bio());
            if (e != null) throw ApiException.badRequest(e);
        }
        if (next.displayName().length() > ProfileRules.DISPLAY_NAME_MAX) {
            throw ApiException.badRequest("Display name must be " + ProfileRules.DISPLAY_NAME_MAX + " characters or fewer");
        }
        if (next.isPublic() || !next.handle().isEmpty()) {
            String e = ProfileRules.handleError(next.handle());
            if (e != null) throw ApiException.badRequest(e);
        }
        try {
            repo.save(userId, next);
        } catch (DuplicateKeyException taken) {
            throw ApiException.conflict("That handle is already taken");
        }
        return settingsOf(userId).toJson();
    }

    private ProfileRules.Settings settingsOf(long userId) {
        return repo.settingsOf(userId).orElse(ProfileRules.Settings.none());
    }

    /** A flag that is absent keeps its current value; one that is present must be a real true/false. */
    private static boolean flag(JsonNode body, String key, boolean current) {
        if (!body.has(key)) return current;
        JsonNode n = body.get(key);
        if (!n.isBoolean()) throw ApiException.badRequest(key + " must be true or false");
        return n.asBoolean();
    }

    /** The JSON string value, or null for anything that is not a string (the rules turn that into ""). */
    private static Object textOrNull(JsonNode n) {
        return n != null && n.isTextual() ? n.asText() : null;
    }
}
