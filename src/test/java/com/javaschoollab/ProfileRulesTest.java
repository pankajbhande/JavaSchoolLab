package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import com.javaschoollab.profile.ProfileRules;
import com.javaschoollab.profile.PublicProfiles;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/** The same cases as node-server/lib/profiles.test.js. */
class ProfileRulesTest {

    @Test
    void acceptsGoodHandles() {
        for (String h : new String[] {"abc", "baji_p", "dev-ops", "a1b2", "x".repeat(30), "123"}) {
            assertThat(ProfileRules.handleError(h)).as(h).isNull();
        }
    }

    @Test
    void rejectsBadHandles() {
        for (String h : new String[] {"", "ab", "x".repeat(31), "Has Space", "UPPER", "a.b", "a@b", "-abc", "abc-", "_abc", "abc_",
                "ünï", "a/b", "<script>"}) {
            assertThat(ProfileRules.handleError(h)).as(h).isNotNull();
        }
    }

    @Test
    void blocksReservedWords() {
        for (String h : new String[] {"admin", "api", "login", "verify", "dashboard", "users", "javaschoollab"}) {
            assertThat(ProfileRules.handleError(h)).as(h).contains("reserved");
        }
    }

    @Test
    void normalisesCaseWhitespaceAndNonStrings() {
        assertThat(ProfileRules.normalizeHandle("  Baji_P ")).isEqualTo("baji_p");
        assertThat(ProfileRules.normalizeHandle(null)).isEmpty();
        assertThat(ProfileRules.normalizeHandle(42)).isEmpty();
    }

    @Test
    void agreesWithTheTypeScriptCopyUsedForInstantFeedback() throws Exception {
        Path ts = Path.of("frontend", "src", "app", "lib", "profileHandle.ts");
        assumeTrue(Files.exists(ts), "front-end source not alongside this module");
        String src = Files.readString(ts);

        Matcher set = Pattern.compile("RESERVED_HANDLES[^=]*=\\s*new Set\\(\\[(.*?)\\]\\)", Pattern.DOTALL).matcher(src);
        assertThat(set.find()).isTrue();
        Set<String> client = new HashSet<>();
        Matcher word = Pattern.compile("'([^']+)'").matcher(set.group(1));
        while (word.find()) client.add(word.group(1));
        assertThat(client).isEqualTo(ProfileRules.RESERVED_HANDLES);

        assertThat(src).contains("HANDLE_MIN = " + ProfileRules.HANDLE_MIN)
                .contains("HANDLE_MAX = " + ProfileRules.HANDLE_MAX)
                .contains("BIO_MAX = " + ProfileRules.BIO_MAX)
                .contains("DISPLAY_NAME_MAX = " + ProfileRules.DISPLAY_NAME_MAX);
    }

    @Test
    void bioStripsControlCharactersAndEnforcesTheCap() {
        assertThat(ProfileRules.cleanBio("hi\u0000 there\u0007")).isEqualTo("hi there");
        assertThat(ProfileRules.cleanBio(5)).isEmpty();
        assertThat(ProfileRules.cleanBio("a\n\n\n\nb")).isEqualTo("a\n\nb");
        assertThat(ProfileRules.bioError("x".repeat(160))).isNull();
        assertThat(ProfileRules.bioError("x".repeat(161))).isNotNull();
        // Markup is left alone: React renders it escaped.
        assertThat(ProfileRules.cleanBio("<b>hi</b>")).isEqualTo("<b>hi</b>");
    }

    @Test
    void displayNameCollapsesWhitespaceAndControlCharacters() {
        assertThat(ProfileRules.cleanDisplayName("  Tanaji\t\nMalusare\u0000 ")).isEqualTo("Tanaji Malusare");
        assertThat(ProfileRules.cleanDisplayName(null)).isEmpty();
    }

    @Test
    void badgesAreOnlyReturnedWhenEarned() {
        assertThat(ProfileRules.computeBadges(new ProfileRules.BadgeInput(0, 0, 0, 0, 0))).isEmpty();
        var ids = ProfileRules.computeBadges(new ProfileRules.BadgeInput(30, 7, 1, 4000, 1)).stream().map(ProfileRules.Badge::id).toList();
        assertThat(ids).containsExactly("first", "explorer", "streak3", "streak7", "quiz1", "cert", "focus");
    }

    // ---- privacy of the public builder ----

    private static PublicProfiles.Profile profile(boolean certs, boolean stats, boolean badges, boolean progress) {
        return new PublicProfiles.Profile("tanaji", null, "hello", "Tanaji Malusare", null,
                Instant.parse("2026-03-04T00:00:00Z"), certs, stats, badges, progress);
    }

    private static final PublicProfiles.Data DATA = new PublicProfiles.Data(
            List.of(new PublicProfiles.Cert("JSL-AAAA-BBBB-CCCC", "Java", "Loops", 9, 10, Instant.parse("2026-04-01T00:00:00Z"))),
            new PublicProfiles.Stats(100, 2, 3, 5, 1, 4, 99),
            new ProfileRules.BadgeInput(5, 3, 1, 99, 1),
            Map.of("java", 5));

    @Test
    void sharesNothingOptionalByDefault() {
        var out = PublicProfiles.build(profile(false, false, false, false), DATA);
        assertThat(out.keySet()).containsExactlyInAnyOrder("handle", "displayName", "bio", "memberSince", "show");
        assertThat(out.get("displayName")).isEqualTo("Tanaji Malusare");
    }

    @Test
    void addsOnlyTheOptedInSections() {
        var out = PublicProfiles.build(profile(false, true, false, true), DATA);
        assertThat(out).containsKeys("stats", "courses");
        assertThat(out).doesNotContainKeys("certificates", "badges");
        assertThat((List<?>) out.get("courses")).hasSize(1);
    }

    @Test
    void neverContainsIdentityFields() {
        var out = PublicProfiles.build(profile(true, true, true, true), DATA);
        String text = out.toString();
        for (String secret : new String[] {"email", "mobile", "dob", "organization", "userId", "user_id", "password"}) {
            assertThat(text).as(secret).doesNotContain(secret);
        }
        @SuppressWarnings("unchecked")
        var cert = ((List<Map<String, Object>>) out.get("certificates")).get(0);
        assertThat(cert).containsEntry("certificateUid", "JSL-AAAA-BBBB-CCCC").containsEntry("percentage", 90L);
    }

    @Test
    void settingsDefaultToEverythingOff() {
        assertThat(ProfileRules.Settings.none().toJson()).isEqualTo(Map.of(
                "isPublic", false, "handle", "", "displayName", "", "bio", "",
                "showCertificates", false, "showStats", false, "showBadges", false, "showProgress", false));
    }
}
