package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Progress, quiz attempts, the weekly goal, profile edit and avatar, through the real Spring context. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgressFlowTest {

    /** A 16-byte "PNG": the real PNG signature plus padding. Enough to pass the magic-number check. */
    private static final String PNG_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    /** Registers a fresh learner and returns the "Bearer ..." header value. */
    private String newLearner() throws Exception {
        String email = "baji." + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"fullName":"Baji Prabhu","email":"%s","password":"secret123","loginType":"email"}""".formatted(email)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private MockHttpServletRequestBuilder as(MockHttpServletRequestBuilder b, String auth, String body) {
        return b.header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    @Test
    void everyProgressRouteNeedsALogin() throws Exception {
        mvc.perform(get("/api/progress/summary")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/progress/topics")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/progress/topic").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/quiz/attempts")).andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/auth/profile").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/profile/avatar").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isUnauthorized());
    }

    @Test
    void aBrandNewLearnerHasAnEmptySummary() throws Exception {
        String auth = newLearner();
        mvc.perform(get("/api/progress/summary").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.xp").value(0))
                .andExpect(jsonPath("$.currentStreak").value(0))
                .andExpect(jsonPath("$.streakFreeze.available").value(true))
                .andExpect(jsonPath("$.studiedToday").value(false))
                .andExpect(jsonPath("$.streakAtRisk").value(false))
                .andExpect(jsonPath("$.topicsSeen").value(0))
                .andExpect(jsonPath("$.weeklyGoalMinutes").value(nullValue()))
                .andExpect(jsonPath("$.byCourse").isEmpty())
                .andExpect(jsonPath("$.passedModules", hasSize(0)))
                .andExpect(jsonPath("$.resume").value(nullValue()));
    }

    @Test
    void topicsAreRecordedOncePerTopicAndDriveXpAndResume() throws Exception {
        String auth = newLearner();
        for (String t : new String[] {"intro", "setup", "intro"}) {   // "intro" twice: still one row
            mvc.perform(as(post("/api/progress/topic"), auth,
                            "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"topicId\":\"" + t + "\"}"))
                    .andExpect(status().isCreated()).andExpect(jsonPath("$.ok").value(true));
        }
        mvc.perform(as(post("/api/progress/topic"), auth, "{\"courseId\":\"python\",\"moduleId\":\"m1\",\"topicId\":\"hello\"}"))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/progress/topics").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(3)));
        mvc.perform(get("/api/progress/summary").header("Authorization", auth))
                .andExpect(jsonPath("$.topicsSeen").value(3))
                .andExpect(jsonPath("$.xp").value(30))                       // 3 topics x 10, nothing else yet
                .andExpect(jsonPath("$.byCourse.java").value(2))
                .andExpect(jsonPath("$.byCourse.python").value(1))
                .andExpect(jsonPath("$.resume.courseId").exists());
    }

    @Test
    void topicRequiresAllThreeIds() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/progress/topic"), auth, "{\"courseId\":\"java\",\"moduleId\":\"basics\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("courseId, moduleId and topicId are required"));
        mvc.perform(as(post("/api/progress/topic"), auth, "{\"courseId\":\"java\",\"moduleId\":\"\",\"topicId\":\"x\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void importAdoptsAGuestHistoryAndSkipsJunk() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/progress/import"), auth, """
                        {"topics":[{"courseId":"java","moduleId":"m","topicId":"a"},
                                   {"courseId":"java","moduleId":"m","topicId":"b"},
                                   {"courseId":"java"}, null, 5]}"""))
                .andExpect(status().isOk()).andExpect(jsonPath("$.imported").value(2));
        // Re-importing the same history is harmless.
        mvc.perform(as(post("/api/progress/import"), auth,
                        "{\"topics\":[{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"a\"}]}"))
                .andExpect(jsonPath("$.imported").value(1));
        mvc.perform(get("/api/progress/topics").header("Authorization", auth)).andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(as(post("/api/progress/import"), auth, "{\"topics\":[]}")).andExpect(jsonPath("$.imported").value(0));
        mvc.perform(as(post("/api/progress/import"), auth, "{}")).andExpect(jsonPath("$.imported").value(0));
    }

    @Test
    void studyTimeIsClampedAndCountsAsAStreakDay() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/progress/study"), auth, "{\"seconds\":120}"))
                .andExpect(jsonPath("$.added").value(120));
        mvc.perform(as(post("/api/progress/study"), auth, "{\"seconds\":99999}"))           // clamped to 900 per call
                .andExpect(jsonPath("$.added").value(900));
        mvc.perform(as(post("/api/progress/study"), auth, "{\"seconds\":-50}")).andExpect(jsonPath("$.added").value(0));
        mvc.perform(as(post("/api/progress/study"), auth, "{\"seconds\":\"abc\"}")).andExpect(jsonPath("$.added").value(0));
        mvc.perform(as(post("/api/progress/study"), auth, "{}")).andExpect(jsonPath("$.added").value(0));

        mvc.perform(get("/api/progress/summary").header("Authorization", auth))
                .andExpect(jsonPath("$.studySecondsToday").value(1020))
                .andExpect(jsonPath("$.studySecondsTotal").value(1020))
                .andExpect(jsonPath("$.studiedToday").value(true))
                .andExpect(jsonPath("$.currentStreak").value(1))
                .andExpect(jsonPath("$.xp").value(5))                                      // one study day
                .andExpect(jsonPath("$.studiedDates[0]").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.studyDays[0].seconds").value(1020));
    }

    @Test
    void aDayCannotExceed24Hours() throws Exception {
        String auth = newLearner();
        for (int i = 0; i < 120; i++) {   // 120 x 900s = 108000s > 86400s
            mvc.perform(as(post("/api/progress/study"), auth, "{\"seconds\":900}")).andExpect(status().isOk());
        }
        mvc.perform(get("/api/progress/summary").header("Authorization", auth))
                .andExpect(jsonPath("$.studySecondsToday").value(86400));
    }

    @Test
    void weeklyGoalIsBoundedAndClearable() throws Exception {
        String auth = newLearner();
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":120}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.weeklyGoalMinutes").value(120));
        mvc.perform(get("/api/progress/summary").header("Authorization", auth)).andExpect(jsonPath("$.weeklyGoalMinutes").value(120));

        String tooSmall = "Choose a goal between 10 minutes and 28 hours a week";
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":5}")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value(tooSmall));
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":1681}")).andExpect(status().isBadRequest());
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":90.5}")).andExpect(status().isBadRequest());
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":\"lots\"}")).andExpect(status().isBadRequest());
        mvc.perform(as(put("/api/progress/goal"), auth, "{}")).andExpect(status().isBadRequest());
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":1680}")).andExpect(status().isOk());

        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":null}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.weeklyGoalMinutes").value(nullValue()));
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":60}")).andExpect(status().isOk());
        mvc.perform(as(put("/api/progress/goal"), auth, "{\"minutes\":0}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.weeklyGoalMinutes").value(nullValue()));
    }

    @Test
    void quizAttemptsAreGradedOnTheServer() throws Exception {
        String auth = newLearner();
        mvc.perform(as(post("/api/quiz/attempts"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"basics\",\"moduleName\":\"Java Basics\",\"score\":7,\"totalQuestions\":10}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.percentage").value(70))
                .andExpect(jsonPath("$.passed").value(true))                    // 70 is the pass mark
                .andExpect(jsonPath("$.id").isNumber());
        mvc.perform(as(post("/api/quiz/attempts"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"oop\",\"score\":6,\"totalQuestions\":10}"))
                .andExpect(jsonPath("$.percentage").value(60)).andExpect(jsonPath("$.passed").value(false));
        // A score above the total is clamped, so a client can't claim more than 100%.
        mvc.perform(as(post("/api/quiz/attempts"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"threads\",\"score\":50,\"totalQuestions\":10}"))
                .andExpect(jsonPath("$.percentage").value(100));
        mvc.perform(as(post("/api/quiz/attempts"), auth,
                        "{\"courseId\":\"java\",\"moduleId\":\"neg\",\"score\":-3,\"totalQuestions\":10}"))
                .andExpect(jsonPath("$.percentage").value(0));
        mvc.perform(as(post("/api/quiz/attempts"), auth, "{\"courseId\":\"java\",\"moduleId\":\"x\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("courseId, moduleId, score and totalQuestions are required"));

        mvc.perform(get("/api/quiz/attempts").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].attemptedAt").exists())
                .andExpect(jsonPath("$[?(@.moduleId=='oop')].moduleName").value(contains("oop")));   // name defaults to the id

        // Passed modules feed the summary and the XP (2 passed x 50).
        mvc.perform(get("/api/progress/summary").header("Authorization", auth))
                .andExpect(jsonPath("$.modulesPassed").value(2))
                .andExpect(jsonPath("$.xp").value(100));
    }

    @Test
    void reviewQueueListsWeakAndNeverPassedModulesWeakestFirst() throws Exception {
        String auth = newLearner();
        // never passed (40%), barely passed (70%, due after 3 days so not due yet), perfect (not due).
        for (String a : new String[] {
                "{\"courseId\":\"java\",\"moduleId\":\"weak\",\"score\":4,\"totalQuestions\":10}",
                "{\"courseId\":\"java\",\"moduleId\":\"ok\",\"score\":7,\"totalQuestions\":10}",
                "{\"courseId\":\"java\",\"moduleId\":\"great\",\"score\":10,\"totalQuestions\":10}",
                "{\"courseId\":\"java\",\"moduleId\":\"worse\",\"score\":1,\"totalQuestions\":10}"}) {
            mvc.perform(as(post("/api/quiz/attempts"), auth, a)).andExpect(status().isCreated());
        }
        mvc.perform(get("/api/progress/review").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].moduleId").value("worse"))             // 10% before 40%: weakest first
                .andExpect(jsonPath("$[1].moduleId").value("weak"))
                .andExpect(jsonPath("$[0].everPassed").value(false))
                .andExpect(jsonPath("$[0].intervalDays").value(1))
                .andExpect(jsonPath("$[0].attempts").value(1))
                .andExpect(jsonPath("$[0].due").value(true));
    }

    @Test
    void profileEditIsValidatedAndShowsUpInMe() throws Exception {
        String auth = newLearner();
        mvc.perform(as(patch("/api/auth/profile"), auth, "{\"fullName\":\"B\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Name must be 2-100 characters"));
        mvc.perform(as(patch("/api/auth/profile"), auth, "{}")).andExpect(status().isBadRequest());

        mvc.perform(as(patch("/api/auth/profile"), auth, """
                        {"fullName":"  Baji Prabhu Deshpande ","gender":"Male","dob":"1990-05-17","organization":"  Khind Fort "}"""))
                .andExpect(status().isOk()).andExpect(jsonPath("$.ok").value(true));
        mvc.perform(get("/api/auth/me").header("Authorization", auth))
                .andExpect(jsonPath("$.fullName").value("Baji Prabhu Deshpande"))
                .andExpect(jsonPath("$.gender").value("Male"))
                .andExpect(jsonPath("$.dob").value("1990-05-17"))
                .andExpect(jsonPath("$.organization").value("Khind Fort"));

        // A bad date of birth is cleared rather than stored or crashing the request.
        mvc.perform(as(patch("/api/auth/profile"), auth, "{\"fullName\":\"Baji Prabhu\",\"dob\":\"1990-13-99\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/auth/me").header("Authorization", auth))
                .andExpect(jsonPath("$.dob").value(nullValue())).andExpect(jsonPath("$.gender").value(nullValue()));
    }

    @Test
    void avatarIsCheckedByContentNotJustByLabel() throws Exception {
        String auth = newLearner();
        mvc.perform(as(put("/api/profile/avatar"), auth, "{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Choose an image"));
        mvc.perform(as(put("/api/profile/avatar"), auth, "{\"image\":\"data:text/html;base64,PGI+\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Use a JPG, PNG or WebP image"));
        // Labelled PNG, but the bytes are plain text: refused.
        String fake = "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString("this is not an image at all".getBytes());
        mvc.perform(as(put("/api/profile/avatar"), auth, "{\"image\":\"" + fake + "\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("That file is not a valid image"));
        String huge = "data:image/png;base64," + "A".repeat(90_001);
        mvc.perform(as(put("/api/profile/avatar"), auth, "{\"image\":\"" + huge + "\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("That image is too large. Please choose a smaller one"));

        mvc.perform(as(put("/api/profile/avatar"), auth, "{\"image\":\"" + PNG_DATA_URL + "\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.avatar").value(PNG_DATA_URL));
        mvc.perform(get("/api/auth/me").header("Authorization", auth)).andExpect(jsonPath("$.avatar").value(PNG_DATA_URL));

        mvc.perform(delete("/api/profile/avatar").header("Authorization", auth))
                .andExpect(status().isOk()).andExpect(jsonPath("$.avatar").value(nullValue()));
        String me = mvc.perform(get("/api/auth/me").header("Authorization", auth)).andReturn().getResponse().getContentAsString();
        assertThat(json.readTree(me).get("avatar").isNull()).isTrue();
    }

    @Test
    void learnersCannotSeeEachOthersProgress() throws Exception {
        String alice = newLearner();
        String bob = newLearner();
        mvc.perform(as(post("/api/progress/topic"), alice, "{\"courseId\":\"java\",\"moduleId\":\"m\",\"topicId\":\"secret-topic\"}"))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/progress/topics").header("Authorization", bob)).andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/progress/summary").header("Authorization", bob)).andExpect(jsonPath("$.topicsSeen").value(0));
    }
}
