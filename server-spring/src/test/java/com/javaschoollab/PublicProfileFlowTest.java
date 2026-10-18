package com.javaschoollab;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest(properties = {"app.rate-limit.profile-per-minute=10000", "app.rate-limit.handle-check-per-minute=10000"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicProfileFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    /** A fresh learner; returns the Bearer header. Their email, mobile-style details and org are set so leaks would show. */
    private String newLearner(String name) throws Exception {
        String email = "secret." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"%s","email":"%s","password":"secret123","loginType":"email",
                         "gender":"Male","dob":"1990-05-17","organization":"Raigad Fort Trust"}""".formatted(name, email)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private static String uniqueHandle() {
        return "h" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private MockHttpServletRequestBuilder as(MockHttpServletRequestBuilder b, String auth, String body) {
        return b.header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    @Test
    void settingsNeedALoginButTheProfilePageDoesNot() throws Exception {
        mvc.perform(get("/api/profile/settings")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/profile/settings").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/profile/handle-available?handle=abc")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/profiles/nobody-here")).andExpect(status().isNotFound());   // reachable without a login
    }

    @Test
    void aNewLearnerHasEverythingOff() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        mvc.perform(get("/api/profile/settings").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.isPublic").value(false))
                .andExpect(jsonPath("$.handle").value(""))
                .andExpect(jsonPath("$.showCertificates").value(false))
                .andExpect(jsonPath("$.showStats").value(false))
                .andExpect(jsonPath("$.showBadges").value(false))
                .andExpect(jsonPath("$.showProgress").value(false));
    }

    @Test
    void settingsAreValidated() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"isPublic\":\"yes\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("isPublic must be true or false"));
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"showStats\":null}")).andExpect(status().isBadRequest());
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"bio\":\"" + "x".repeat(161) + "\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Keep your bio to 160 characters or fewer"));
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"displayName\":\"" + "n".repeat(61) + "\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Display name must be 60 characters or fewer"));
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"isPublic\":true}"))                       // publishing needs a handle
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Choose a handle"));
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"handle\":\"admin\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value(containsString("reserved")));
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"handle\":\"a b\"}")).andExpect(status().isBadRequest());
    }

    @Test
    void nothingIsPublicUntilTheOwnerOptsIn() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        String handle = uniqueHandle();
        // Reserving a handle without publishing: the page must still 404.
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"handle\":\"" + handle + "\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/profiles/" + handle))
                .andExpect(status().isNotFound())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.error").value("Profile not found"));
        // Unknown and unpublished handles give the identical body, so the response can't reveal which handles exist.
        String unpublished = mvc.perform(get("/api/profiles/" + handle)).andReturn().getResponse().getContentAsString();
        String unknown = mvc.perform(get("/api/profiles/" + uniqueHandle())).andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(unpublished).isEqualTo(unknown);
    }

    @Test
    void aPublishedProfileSharesOnlyTheChosenSectionsAndNeverIdentityData() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        String handle = uniqueHandle().toUpperCase();   // handles are case-insensitive
        mvc.perform(as(put("/api/profile/settings"), auth,
                        "{\"isPublic\":true,\"handle\":\"" + handle + "\",\"displayName\":\"Subhedar Tanaji\",\"bio\":\"Sinhagad fan\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle.toLowerCase()))
                .andExpect(jsonPath("$.isPublic").value(true));

        String body = mvc.perform(get("/api/profiles/" + handle.toLowerCase()))          // no Authorization header
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("max-age=10")))
                .andExpect(jsonPath("$.displayName").value("Subhedar Tanaji"))
                .andExpect(jsonPath("$.bio").value("Sinhagad fan"))
                .andExpect(jsonPath("$.memberSince").exists())
                .andExpect(jsonPath("$.show.certificates").value(false))
                .andExpect(jsonPath("$.certificates").doesNotExist())
                .andExpect(jsonPath("$.stats").doesNotExist())
                .andExpect(jsonPath("$.badges").doesNotExist())
                .andExpect(jsonPath("$.courses").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        for (String secret : new String[] {"secret.", "@example.com", "1990-05-17", "Raigad Fort Trust", "password", "userId", "mobile"}) {
            org.assertj.core.api.Assertions.assertThat(body).as(secret).doesNotContain(secret);
        }
    }

    @Test
    void displayNameFallsBackToTheRealName() throws Exception {
        String auth = newLearner("Baji Prabhu");
        String handle = uniqueHandle();
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"isPublic\":true,\"handle\":\"" + handle + "\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/profiles/" + handle)).andExpect(jsonPath("$.displayName").value("Baji Prabhu"));
    }

    @Test
    void optedInSectionsAppearWithRealActivity() throws Exception {
        String auth = newLearner("Murarbaji Deshpande");
        String handle = uniqueHandle();
        for (String t : new String[] {"a", "b", "c"}) {
            mvc.perform(as(post("/api/progress/topic"), auth, "{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"" + t + "\"}")).andExpect(status().isCreated());
        }
        mvc.perform(as(post("/api/progress/topic"), auth, "{\"courseId\":\"python\",\"moduleId\":\"m\",\"topicId\":\"p\"}")).andExpect(status().isCreated());
        mvc.perform(as(post("/api/progress/study"), auth, "{\"seconds\":600}")).andExpect(status().isOk());
        mvc.perform(as(post("/api/quiz/attempts"), auth,
                "{\"courseId\":\"java\",\"moduleId\":\"m\",\"moduleName\":\"Java Basics\",\"score\":9,\"totalQuestions\":10}")).andExpect(status().isCreated());
        mvc.perform(as(post("/api/certificates"), auth, "{\"courseName\":\"Core Java\",\"topicName\":\"Java Basics\"}")).andExpect(status().isCreated());

        mvc.perform(as(put("/api/profile/settings"), auth, """
                        {"isPublic":true,"handle":"%s","showCertificates":true,"showStats":true,"showBadges":true,"showProgress":true}"""
                .formatted(handle))).andExpect(status().isOk());

        mvc.perform(get("/api/profiles/" + handle))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.topicsSeen").value(4))
                .andExpect(jsonPath("$.stats.modulesPassed").value(1))
                .andExpect(jsonPath("$.stats.studyDays").value(1))
                .andExpect(jsonPath("$.stats.studySecondsTotal").value(600))
                .andExpect(jsonPath("$.stats.xp").value(4 * 10 + 50 + 5))
                .andExpect(jsonPath("$.stats.currentStreak").value(1))
                .andExpect(jsonPath("$.certificates", hasSize(1)))
                .andExpect(jsonPath("$.certificates[0].courseName").value("Core Java"))
                .andExpect(jsonPath("$.certificates[0].percentage").value(90))
                .andExpect(jsonPath("$.courses[0].courseId").value("java"))              // most-studied course first
                .andExpect(jsonPath("$.courses[0].topicsSeen").value(3))
                .andExpect(jsonPath("$.courses[1].courseId").value("python"))
                .andExpect(jsonPath("$.badges[?(@.id=='first')]").exists())
                .andExpect(jsonPath("$.badges[?(@.id=='quiz1')]").exists())
                .andExpect(jsonPath("$.badges[?(@.id=='cert')]").exists())
                .andExpect(jsonPath("$.badges[?(@.id=='streak3')]").isEmpty());          // not earned: not listed

        // Switching a section off removes it again.
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"showStats\":false,\"showCertificates\":false}")).andExpect(status().isOk());
        mvc.perform(get("/api/profiles/" + handle))
                .andExpect(jsonPath("$.stats").doesNotExist())
                .andExpect(jsonPath("$.certificates").doesNotExist())
                .andExpect(jsonPath("$.badges").exists());
    }

    @Test
    void unpublishingTakesThePageDownButKeepsTheHandle() throws Exception {
        String owner = newLearner("Tanaji Malusare");
        String other = newLearner("Baji Prabhu");
        String handle = uniqueHandle();
        mvc.perform(as(put("/api/profile/settings"), owner, "{\"isPublic\":true,\"handle\":\"" + handle + "\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/profiles/" + handle)).andExpect(status().isOk());

        mvc.perform(as(put("/api/profile/settings"), owner, "{\"isPublic\":false}")).andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value(handle));
        mvc.perform(get("/api/profiles/" + handle)).andExpect(status().isNotFound());
        // The handle stays reserved to its owner, so a link can't be hijacked after a temporary unpublish.
        mvc.perform(as(put("/api/profile/settings"), other, "{\"handle\":\"" + handle + "\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.error").value("That handle is already taken"));
        mvc.perform(get("/api/profile/handle-available?handle=" + handle).header("Authorization", other))
                .andExpect(jsonPath("$.available").value(false)).andExpect(jsonPath("$.reason").value("That handle is already taken"));
    }

    @Test
    void handleAvailability() throws Exception {
        String me = newLearner("Tanaji Malusare");
        String handle = uniqueHandle();
        mvc.perform(get("/api/profile/handle-available?handle=" + handle).header("Authorization", me))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.available").value(true)).andExpect(jsonPath("$.reason").value(nullValue()));
        mvc.perform(as(put("/api/profile/settings"), me, "{\"handle\":\"" + handle + "\"}")).andExpect(status().isOk());
        // My own current handle counts as free.
        mvc.perform(get("/api/profile/handle-available?handle=" + handle.toUpperCase()).header("Authorization", me))
                .andExpect(jsonPath("$.handle").value(handle)).andExpect(jsonPath("$.available").value(true));
        mvc.perform(get("/api/profile/handle-available?handle=ab").header("Authorization", me))
                .andExpect(jsonPath("$.available").value(false)).andExpect(jsonPath("$.reason").value("Use at least 3 characters"));
        mvc.perform(get("/api/profile/handle-available").header("Authorization", me))
                .andExpect(jsonPath("$.available").value(false)).andExpect(jsonPath("$.reason").value("Choose a handle"));
    }

    @Test
    void twoLearnersCannotShareAHandle() throws Exception {
        String first = newLearner("Tanaji Malusare");
        String second = newLearner("Baji Prabhu");
        String handle = uniqueHandle();
        mvc.perform(as(put("/api/profile/settings"), first, "{\"isPublic\":true,\"handle\":\"" + handle + "\",\"bio\":\"first\"}")).andExpect(status().isOk());
        mvc.perform(as(put("/api/profile/settings"), second, "{\"isPublic\":true,\"handle\":\"" + handle + "\",\"bio\":\"second\"}"))
                .andExpect(status().isConflict());
        // The first learner's page is untouched by the failed attempt.
        mvc.perform(get("/api/profiles/" + handle)).andExpect(jsonPath("$.bio").value("first"));
    }

    @Test
    void partialUpdatesKeepWhatWasNotSent() throws Exception {
        String auth = newLearner("Tanaji Malusare");
        String handle = uniqueHandle();
        mvc.perform(as(put("/api/profile/settings"), auth,
                "{\"isPublic\":true,\"handle\":\"" + handle + "\",\"bio\":\"keep me\",\"showStats\":true}")).andExpect(status().isOk());
        mvc.perform(as(put("/api/profile/settings"), auth, "{\"showBadges\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bio").value("keep me"))
                .andExpect(jsonPath("$.showStats").value(true))
                .andExpect(jsonPath("$.showBadges").value(true))
                .andExpect(jsonPath("$.isPublic").value(true));
        mvc.perform(get("/api/profiles/" + handle)).andExpect(content().string(containsString("keep me")));
    }
}
