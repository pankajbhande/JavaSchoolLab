package com.javaschoollab.profile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Public learner profile rules: handle and bio validation, badges, and the builder that decides what may leave
 * the server. A port of the original Node server's profiles.js. Privacy lives in one pure place: {@link PublicProfiles#build} starts
 * from an empty object and adds a section only when the owner switched it on, and it never receives email, mobile,
 * date of birth, organisation or internal ids, so it cannot leak them.
 */
public final class ProfileRules {

    public static final int HANDLE_MIN = 3;
    public static final int HANDLE_MAX = 30;
    public static final int BIO_MAX = 160;
    public static final int DISPLAY_NAME_MAX = 60;

    /** Words that would collide with routes or impersonate the site. Kept identical to src/app/lib/profileHandle.ts. */
    public static final Set<String> RESERVED_HANDLES = Set.of(
            "admin", "administrator", "api", "app", "account", "accounts", "dashboard", "login", "logout", "signin", "signup",
            "register", "verify", "certificate", "certificates", "course", "courses", "flashcards", "interview", "interview-practice",
            "leaderboard", "me", "u", "user", "users", "profile", "profiles", "settings", "support", "help", "about", "contact",
            "root", "system", "sysadmin", "moderator", "mod", "staff", "team", "official", "javaschoollab", "jsl", "dhipan",
            "null", "undefined", "true", "false", "www", "mail", "email", "static", "assets", "public", "terms", "privacy",
            "security", "billing", "blog", "docs", "status", "search", "home", "index", "new", "edit", "delete", "anonymous",
            "guest", "test", "demo", "webmaster", "postmaster", "abuse", "noreply", "no-reply");

    private static final Pattern HANDLE_CHARS = Pattern.compile("^[a-z0-9_-]+$");
    private static final Pattern STARTS_ALNUM = Pattern.compile("^[a-z0-9].*");
    private static final Pattern ENDS_ALNUM = Pattern.compile(".*[a-z0-9]$");
    private static final Pattern CONTROL_KEEP_NEWLINE_TAB = Pattern.compile("[\\u0000-\\u0008\\u000B-\\u001F\\u007F]");
    private static final Pattern SPACES_TABS = Pattern.compile("[ \\t]+");
    private static final Pattern MANY_NEWLINES = Pattern.compile("\\n{3,}");
    private static final Pattern ANY_CONTROL = Pattern.compile("[\\u0000-\\u001F\\u007F]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private ProfileRules() {}

    /** Trim and lowercase, so "  Baji_P " is treated as "baji_p". Non-text becomes an empty string. */
    public static String normalizeHandle(Object value) {
        return value instanceof String s ? s.strip().toLowerCase(Locale.ROOT) : "";
    }

    /** The message to show, or null when the (already normalised) handle is acceptable. */
    public static String handleError(String handle) {
        if (handle == null || handle.isEmpty()) return "Choose a handle";
        if (handle.length() < HANDLE_MIN) return "Use at least " + HANDLE_MIN + " characters";
        if (handle.length() > HANDLE_MAX) return "Use at most " + HANDLE_MAX + " characters";
        if (!HANDLE_CHARS.matcher(handle).matches()) return "Use only lowercase letters, digits, hyphen (-) and underscore (_)";
        if (!STARTS_ALNUM.matcher(handle).matches() || !ENDS_ALNUM.matcher(handle).matches()) return "Start and end with a letter or digit";
        if (RESERVED_HANDLES.contains(handle)) return "That handle is reserved. Please pick another";
        return null;
    }

    /** Plain-text bio. Control characters are dropped and whitespace collapsed; the browser renders it escaped. */
    public static String cleanBio(Object value) {
        if (!(value instanceof String s)) return "";
        String t = CONTROL_KEEP_NEWLINE_TAB.matcher(s).replaceAll("");
        t = SPACES_TABS.matcher(t).replaceAll(" ");
        t = MANY_NEWLINES.matcher(t).replaceAll("\n\n");
        return t.strip();
    }

    public static String bioError(String bio) {
        return bio.length() > BIO_MAX ? "Keep your bio to " + BIO_MAX + " characters or fewer" : null;
    }

    public static String cleanDisplayName(Object value) {
        if (!(value instanceof String s)) return "";
        return WHITESPACE.matcher(ANY_CONTROL.matcher(s).replaceAll(" ")).replaceAll(" ").strip();
    }

    public record Badge(String id, String name, String hint) {}

    public record BadgeInput(int topicsSeen, int longestStreak, int modulesPassed, long studySecondsTotal, int certificates) {}

    /** Badge rules, mirroring the account page. Only EARNED badges are ever returned publicly. */
    public static List<Badge> computeBadges(BadgeInput in) {
        List<Badge> out = new ArrayList<>();
        if (in.topicsSeen() >= 1) out.add(new Badge("first", "First Steps", "Opened a first topic"));
        if (in.topicsSeen() >= 25) out.add(new Badge("explorer", "Explorer", "Opened 25 topics"));
        if (in.topicsSeen() >= 100) out.add(new Badge("scholar", "Scholar", "Opened 100 topics"));
        if (in.longestStreak() >= 3) out.add(new Badge("streak3", "On Fire", "3-day streak"));
        if (in.longestStreak() >= 7) out.add(new Badge("streak7", "Week Warrior", "7-day streak"));
        if (in.longestStreak() >= 30) out.add(new Badge("streak30", "Unstoppable", "30-day streak"));
        if (in.modulesPassed() >= 1) out.add(new Badge("quiz1", "Quiz Passer", "Passed a module test"));
        if (in.modulesPassed() >= 5) out.add(new Badge("quiz5", "Quiz Master", "Passed 5 module tests"));
        if (in.certificates() >= 1) out.add(new Badge("cert", "Certified", "Earned a certificate"));
        if (in.studySecondsTotal() >= 3600) out.add(new Badge("focus", "Deep Focus", "Studied for 1 hour in total"));
        return out;
    }

    /** The owner's own settings, in the shape the account page edits. */
    public record Settings(boolean isPublic, String handle, String displayName, String bio,
                           boolean showCertificates, boolean showStats, boolean showBadges, boolean showProgress) {
        public static Settings none() {
            return new Settings(false, "", "", "", false, false, false, false);
        }

        public Map<String, Object> toJson() {
            return Map.of("isPublic", isPublic, "handle", handle, "displayName", displayName, "bio", bio,
                    "showCertificates", showCertificates, "showStats", showStats, "showBadges", showBadges, "showProgress", showProgress);
        }
    }
}
