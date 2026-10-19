package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Page-view and search tracking, and the admin-only dashboard. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "app.admin.emails=boss.analytics@example.com, Second.Admin@example.com")
class AnalyticsTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;

    private ResultActions send(String url, String body, String token) throws Exception {
        var req = post(url).contentType(MediaType.APPLICATION_JSON).content(body);
        if (token != null) req.header("Authorization", "Bearer " + token);
        return mvc.perform(req);
    }

    private String register(String email) throws Exception {
        String sent = send("/api/otp/send", "{\"identifier\":\"%s\",\"identifierType\":\"email\",\"purpose\":\"register\"}".formatted(email), null)
                .andReturn().getResponse().getContentAsString();
        String otp = json.readTree(sent).get("_dev_otp").asText();
        send("/api/otp/verify", "{\"identifier\":\"%s\",\"identifierType\":\"email\",\"otp\":\"%s\",\"purpose\":\"register\"}".formatted(email, otp), null);
        String r = send("/api/auth/register-otp", "{\"fullName\":\"Test Person\",\"email\":\"%s\",\"password\":\"Test1234\",\"loginType\":\"email\",\"otp\":\"%s\"}".formatted(email, otp), null)
                .andReturn().getResponse().getContentAsString();
        return json.readTree(r).get("token").asText();
    }

    private long events(String where) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM analytics_events WHERE " + where, Long.class);
    }

    @Test
    void aPageViewIsStoredWithoutQueryStringOrFragment() throws Exception {
        String sid = "sess-" + UUID.randomUUID();
        send("/api/analytics/event", "{\"type\":\"page_view\",\"sessionId\":\"%s\",\"path\":\"/course/java/basics/x?level=expert&token=SECRET#top\"}".formatted(sid), null)
                .andExpect(status().isNoContent());
        assertThat(jdbc.queryForObject("SELECT path FROM analytics_events WHERE session_id = ?", String.class, sid)).isEqualTo("/course/java/basics/x");
    }

    @Test
    void aSearchStoresTheWordsLowercasedAndHowManyTopicsMatched() throws Exception {
        String sid = "sess-" + UUID.randomUUID();
        send("/api/analytics/event", "{\"type\":\"search\",\"sessionId\":\"%s\",\"detail\":\"  HashMap Collision \",\"value\":7}".formatted(sid), null).andExpect(status().isNoContent());
        var row = jdbc.queryForMap("SELECT detail, result_count FROM analytics_events WHERE session_id = ?", sid);
        assertThat(row.get("DETAIL")).isEqualTo("hashmap collision");
        assertThat(((Number) row.get("RESULT_COUNT")).intValue()).isEqualTo(7);
    }

    @Test
    void unknownEventTypesAndJunkAreDroppedWithoutAnError() throws Exception {
        String sid = "sess-" + UUID.randomUUID();
        for (String body : new String[] {
                "{\"type\":\"purchase\",\"sessionId\":\"%s\"}".formatted(sid),
                "{\"type\":\"page_view\",\"sessionId\":\"%s\",\"path\":\"javascript:alert(1)\"}".formatted(sid),
                "{\"sessionId\":\"%s\"}".formatted(sid), "{}", "{\"type\":123}"}) {
            send("/api/analytics/event", body, null).andExpect(status().isNoContent());
        }
        assertThat(events("session_id = '" + sid + "' AND event_type = 'purchase'")).isZero();
        assertThat(events("session_id = '" + sid + "' AND path IS NOT NULL")).isZero();
    }

    @Test
    void longTextIsCutAndControlCharactersRemoved() throws Exception {
        String sid = "sess-" + UUID.randomUUID();
        send("/api/analytics/event", "{\"type\":\"search\",\"sessionId\":\"%s\",\"detail\":\"%s\",\"value\":999999999}".formatted(sid, "a".repeat(500) + "\\n\\u0007x"), null).andExpect(status().isNoContent());
        var row = jdbc.queryForMap("SELECT detail, result_count FROM analytics_events WHERE session_id = ?", sid);
        assertThat(((String) row.get("DETAIL")).length()).isLessThanOrEqualTo(100);
        assertThat(((Number) row.get("RESULT_COUNT")).intValue()).isEqualTo(100000);
    }

    @Test
    void theDashboardNeedsLoginAndAnAdminEmail() throws Exception {
        mvc.perform(get("/api/admin/analytics")).andExpect(status().is4xxClientError());   // no token
        String normal = register("normal." + UUID.randomUUID().toString().substring(0, 6) + "@example.com");
        mvc.perform(get("/api/admin/analytics").header("Authorization", "Bearer " + normal))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.error").value(containsString("only for the site admin")));
    }

    @Test
    void anAdminSeesTotalsDailySeriesTopPagesAndSearchGaps() throws Exception {
        String sid = "sess-" + UUID.randomUUID();
        for (int i = 0; i < 3; i++) send("/api/analytics/event", "{\"type\":\"page_view\",\"sessionId\":\"%s\",\"path\":\"/dashboard\"}".formatted(sid), null);
        send("/api/analytics/event", "{\"type\":\"search\",\"sessionId\":\"%s\",\"detail\":\"zzz no such topic\",\"value\":0}".formatted(sid), null);
        String admin = register("Boss.Analytics@example.com");      // the admin list is case-insensitive

        String body = mvc.perform(get("/api/admin/analytics").param("days", "7").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days").value(7))
                .andExpect(jsonPath("$.daily.length()").value(7))
                .andReturn().getResponse().getContentAsString();
        JsonNode d = json.readTree(body);
        assertThat(d.at("/totals/pageViews").asLong()).isGreaterThanOrEqualTo(3);
        assertThat(d.at("/totals/users").asLong()).isGreaterThanOrEqualTo(1);
        assertThat(d.at("/totals/visitorCounter").asLong()).isGreaterThanOrEqualTo(0);
        assertThat(d.at("/funnel/signups").asLong()).isGreaterThanOrEqualTo(1);
        boolean hasDashboardPage = false;
        for (JsonNode p : d.get("topPages")) hasDashboardPage |= "/dashboard".equals(p.get("path").asText());
        assertThat(hasDashboardPage).isTrue();
        boolean hasGap = false;
        for (JsonNode s : d.get("emptySearches")) hasGap |= "zzz no such topic".equals(s.get("query").asText());
        assertThat(hasGap).as("a search that matched nothing is listed as a content gap").isTrue();
        assertThat(d.get("daily").get(6).get("pageViews").asLong()).isGreaterThanOrEqualTo(3);   // today is the last day
    }

    @Test
    void sharesAreRecordedAndTheAdminSeesTheMostSharedTopicsAndChannels() throws Exception {
        String sid = "sess-" + UUID.randomUUID();
        for (String channel : new String[] {"whatsapp", "whatsapp", "copy"}) {
            send("/api/analytics/event", "{\"type\":\"share\",\"sessionId\":\"%s\",\"path\":\"/course/java/basics/shared-topic-test\",\"detail\":\"%s\"}".formatted(sid, channel), null)
                    .andExpect(status().isNoContent());
        }
        String admin = register("Second.Admin@example.com");
        String body = mvc.perform(get("/api/admin/analytics").param("days", "7").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode d = json.readTree(body);
        assertThat(d.at("/totals/shares").asLong()).isGreaterThanOrEqualTo(3);
        boolean topic = false;
        for (JsonNode t : d.get("topShared")) topic |= "/course/java/basics/shared-topic-test".equals(t.get("path").asText()) && t.get("shares").asLong() == 3;
        assertThat(topic).isTrue();
        long whatsapp = 0;
        for (JsonNode c : d.get("shareChannels")) if ("whatsapp".equals(c.get("channel").asText())) whatsapp = c.get("shares").asLong();
        assertThat(whatsapp).isGreaterThanOrEqualTo(2);
    }
}
