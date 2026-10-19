package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Server-side search without an OpenSearch server: the API says "not enabled" and the browser falls back to its own search. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SearchApiTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    @Test
    void whenOpenSearchIsNotConfiguredTheEndpointsSayNotEnabled() throws Exception {
        mvc.perform(get("/api/search").param("q", "constructor"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value(containsString("not enabled")));
        mvc.perform(get("/api/search/status")).andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false))
                .andExpect(jsonPath("$.ready").value(false));
    }

    @Test
    void searchIsPublicLikeTheSiteItself() throws Exception {
        mvc.perform(get("/api/search").param("q", "x")).andExpect(status().isServiceUnavailable());   // not 401/403
    }

    @Test
    void lessonHtmlBecomesPlainSearchableText() throws Exception {
        var topic = json.readTree("""
                {"beginner":[{"content":"<h3>The <b>final</b> keyword</h3> a &lt; b &amp;&amp; c","codeExamples":["final int x = 1;"]}],
                 "expert":[{"content":"<style>p{color:red}</style><p>Immutable</p>"}]}""");
        String text = com.javaschoollab.search.SearchService.plainText(topic);
        assertThat(text).contains("The final keyword").contains("a < b && c").contains("final int x = 1;").contains("Immutable");
        assertThat(text).doesNotContain("<b>").doesNotContain("color:red");
    }
}
