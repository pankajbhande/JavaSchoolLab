import { Topic } from '../coreJava';

export const springBootIntegrationTesting: Topic = {
    id: 'spring-boot-integration-testing',
    name: 'Integration & Slice Testing',
    beginner: [
        {
            content: `<h3>Business Requirement</h3>
The insurance handout builds a complete Spring Boot application: a <code>Policy</code> entity, a <code>PolicyRepository</code>, a <code>PolicyServiceImpl</code> and a <code>PolicyController</code> exposing <code>/getAll</code>, <code>/save</code>, <code>/get/{id}</code> and <code>/delete/{id}</code> over MySQL. The only test it writes is a service test with a mocked repository. Everything above and below that service is verified by opening Postman and looking at the response by hand. <br><br>

<strong>Problem Statement</strong>: the mocked service test passes even when the URL mapping is wrong, the JSON field names are wrong, the derived query does not compile, the column name does not exist and the HTTP status is 500. Those defects live in the <strong>wiring</strong>, and a mock has nothing to say about wiring. <br><br>

This topic covers the half of Spring Boot testing that needs a <strong>Spring application context</strong>. The companion topic, <em>Unit Testing with JUnit 5 &amp; Mockito</em>, covers the half that does not - plain JUnit assertions, Mockito <code>@Mock</code>/<code>@InjectMocks</code>, and testing <code>PolicyServiceImpl</code> in isolation. The boundary between them is exactly this: does Spring have to start? <br><br>

<div class="border">
<strong>Unit test</strong>: you construct the object yourself (or Mockito does). No <code>ApplicationContext</code>. Milliseconds.<br>
<strong>Slice test</strong>: Spring starts, but only the auto-configuration for one layer. Hundreds of milliseconds to a second or two.<br>
<strong>Integration test</strong>: Spring starts the whole application, often with a real HTTP port and a real database. Seconds.
</div>`
        },

        {
            content: `<h3>The application under test</h3>
Everything below is tested against the handout's own application, with its errors corrected. Three of them matter before a single test can run. <br><br>

<div class="border">
<strong>1.</strong> <code>CrudRepository&lt;Policy, Serializable&gt;</code> - the second type parameter is the <strong>ID type</strong>, and <code>Policy</code>'s <code>@Id</code> is an <code>Integer</code>. Written as <code>Serializable</code> the repository still starts, but <code>findById</code> and <code>deleteById</code> accept any object at all and fail at runtime instead of at compile time.<br>
<strong>2.</strong> <code>public Policy findById(Integer Id);</code> declared in the repository clashes with the inherited <code>Optional&lt;Policy&gt; findById(ID)</code>. Same erasure, different return type - that is neither an override nor an overload, and javac rejects it.<br>
<strong>3.</strong> <code>javax.persistence.*</code> is correct for Spring Boot 2.x. Boot 3.x moved to Jakarta EE 9+, where the package is <code>jakarta.persistence.*</code> - the <code>javax</code> classes are not deprecated there, they are simply absent from the classpath.
</div>`,
            codeExamples: [`// PolicyController.java - the handout's controller, unchanged except
// for the status codes, which matter enormously once you assert on them.
package com.cybage.genworth.insurance.controller;

import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cybage.genworth.insurance.model.Policy;
import com.cybage.genworth.insurance.service.PolicyService;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public Iterable<Policy> getAllPolicy() {
        return policyService.getAllPolicy();
    }

    @GetMapping("/{id}")
    public Policy getPolicyById(@PathVariable("id") Integer id) {
        return policyService.getPolicyById(id);
    }

    @PostMapping
    public ResponseEntity<Policy> createPolicy(@RequestBody Policy policy) {
        Policy saved = policyService.savePolicy(policy);
        // The handout returns the object with a bare 200. A creation should
        // answer 201 and carry a Location header - and once you write a
        // MockMvc test, that difference becomes an assertion you can make.
        return ResponseEntity
                .created(URI.create("/api/policies/" + saved.getId()))
                .body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicyById(@PathVariable("id") Integer id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();   // 204, not 200 with no body
    }
}


// src/main/resources/application.properties - the production profile
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/project?useSSL=false
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
// NOTE: the property is driver-class-name. Several handouts in this series
// print "driver-classname", which Boot silently ignores; it then tries to
// infer the driver from the URL and you get a confusing failure later.

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
// NOTE: the PDF breaks this across a line as "org.hibernate.dial ect" -
// a rendering artifact, not a package name.
// Also: ddl-auto=create (as opposed to update) DROPS every table on each
// restart. Never set it on anything that holds data you care about.`]
        },

        {
            content: `<h3>Test slices - loading one layer instead of the application</h3>
Spring Boot ships a family of <strong>test slice</strong> annotations. Each one turns on a fixed subset of auto-configuration and turns everything else off, so the context that starts contains only what that layer needs. <br><br>

<table>
<tr><th>Slice annotation</th><th>What it brings up</th></tr>
<tr><td>@WebMvcTest</td><td>The MVC infrastructure: <code>@Controller</code>/<code>@RestController</code>, <code>@ControllerAdvice</code>, <code>WebMvcConfigurer</code>, Jackson converters, <code>Filter</code> beans, Spring Security's filter chain, and an auto-configured <code>MockMvc</code>. No <code>@Service</code>, no <code>@Repository</code>, no <code>DataSource</code>.</td></tr>
<tr><td>@DataJpaTest</td><td>Spring Data JPA repositories, <code>EntityManager</code>, <code>TestEntityManager</code>, an embedded database, and transaction management. No controllers, no services.</td></tr>
<tr><td>@JdbcTest</td><td>The same idea one layer lower: <code>JdbcTemplate</code> and a <code>DataSource</code>, no JPA.</td></tr>
<tr><td>@DataMongoTest / @DataRedisTest</td><td>The equivalent slices for those stores.</td></tr>
<tr><td>@JsonTest</td><td>Jackson/Gson configuration only, with <code>JacksonTester</code>. For asserting that an entity serialises to the exact JSON the API contract promises.</td></tr>
<tr><td>@RestClientTest</td><td><code>RestTemplateBuilder</code> plus <code>MockRestServiceServer</code>, for testing a client of somebody else's API.</td></tr>
<tr><td>@SpringBootTest</td><td>Not a slice. The whole context, exactly as the application starts it, optionally on a real port.</td></tr>
</table>
<br>
A slice finds its configuration by walking up from the test class's package until it meets a <code>@SpringBootConfiguration</code> - normally your <code>@SpringBootApplication</code> class. That is why the test package must mirror the main package: move the test outside that tree and the context fails to start with "Unable to find a @SpringBootConfiguration".`,
            codeExamples: [`SLICE MAP - what starts, and what you must supply yourself

   @SpringBootTest                        @WebMvcTest(PolicyController.class)
   +---------------------------+          +---------------------------+
   | DispatcherServlet         |          | DispatcherServlet         |
   | PolicyController          |          | PolicyController          |
   | PolicyServiceImpl  (real) |          | PolicyService   @MockBean |  <- you supply
   | PolicyRepository   (real) |          |         X  not loaded     |
   | DataSource -> MySQL       |          |         X  not loaded     |
   | Hibernate SessionFactory  |          |         X  not loaded     |
   | 180 beans, ~4.0 s         |          | 30 beans, ~1.1 s          |
   +---------------------------+          +---------------------------+

   @DataJpaTest                           plain @ExtendWith(MockitoExtension)
   +---------------------------+          +---------------------------+
   |        X  no web layer    |          |        X  nothing         |
   |        X  no services     |          | PolicyServiceImpl  (real) |
   | PolicyRepository   (real) |          | PolicyRepository   @Mock  |
   | EntityManager             |          |                           |
   | H2 in-memory DataSource   |          | no Spring at all          |
   | 45 beans, ~1.4 s          |          | ~0.02 s                   |
   +---------------------------+          +---------------------------+
                                          (covered in the unit-testing topic)`]
        },

        {
            content: `<h3>Steps - testing the controller with @WebMvcTest and MockMvc</h3>
<strong>MockMvc</strong> dispatches a request straight into the <code>DispatcherServlet</code>. There is no socket, no Tomcat, no port and no serialisation over the wire - but everything the framework does after the request arrives is real: handler mapping, path variable binding, message conversion, validation, exception handling and the status code. <br><br>

<table>
<tr><th>Step</th><th>What you do</th></tr>
<tr><td>1</td><td>Annotate the test <code>@WebMvcTest(PolicyController.class)</code> - naming the controller keeps the slice to one controller instead of all of them</td></tr>
<tr><td>2</td><td><code>@Autowired MockMvc mockMvc</code> - the slice auto-configures it for you</td></tr>
<tr><td>3</td><td><code>@MockBean PolicyService policyService</code> - the service is not in the slice, so without this the context fails to start</td></tr>
<tr><td>4</td><td>Stub the service with <code>when(...).thenReturn(...)</code> exactly as in a unit test</td></tr>
<tr><td>5</td><td><code>mockMvc.perform(get(...))</code> then chain <code>.andExpect(...)</code> matchers</td></tr>
<tr><td>6</td><td>Add <code>.andDo(print())</code> while you are writing the test - it dumps the whole request and response</td></tr>
</table>
<br>
The failure you will hit first is the one worth understanding: omit the <code>@MockBean</code> and you get <code>NoSuchBeanDefinitionException</code> before any test runs. That is the slice working as designed - it is telling you that the controller's dependency is deliberately outside the boundary.`,
            codeExamples: [`package com.cybage.genworth.insurance.controller;

import static org.hamcrest.Matchers.hasSize;      // easy to forget; without
                                                 // it jsonPath("$", hasSize(2))
                                                 // will not compile
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.cybage.genworth.insurance.model.Policy;
import com.cybage.genworth.insurance.service.PolicyService;

@WebMvcTest(PolicyController.class)
class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean                       // Boot 3.4+: @MockitoBean
    private PolicyService policyService;

    @Test
    void getAllReturnsJsonArray() throws Exception {
        when(policyService.getAllPolicy()).thenReturn(List.of(
                new Policy(1, "101", "1000", "Rajaram",   "ram@gmail.com",   "2020", "active"),
                new Policy(2, "102", "2000", "Shahaji", "shyam@gmail.com", "2021", "active")));

        mockMvc.perform(get("/api/policies"))
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(content().contentType(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$", hasSize(2)))
               .andExpect(jsonPath("$[0].policyNumber").value("101"))
               .andExpect(jsonPath("$[1].name").value("Shahaji"));
    }

    @Test
    void getByIdBindsThePathVariable() throws Exception {
        when(policyService.getPolicyById(3)).thenReturn(
                new Policy(3, "103", "1000", "Shahaji", "shyam@gmail.com", "2022", "active"));

        mockMvc.perform(get("/api/policies/{id}", 3))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.status").value("active"));

        verify(policyService, times(1)).getPolicyById(3);
    }

    @Test
    void postCreatesAndReturns201WithLocation() throws Exception {
        Policy saved = new Policy(9, "P-900", "500", "Rajaram",
                                  "ram@gmail.com", "5012", "active");
        when(policyService.savePolicy(any(Policy.class))).thenReturn(saved);

        mockMvc.perform(post("/api/policies")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\\"policyNumber\\":\\"P-900\\",\\"premiumAmount\\":\\"500\\"," +
                             "\\"name\\":\\"Rajaram\\",\\"email\\":\\"ram@gmail.com\\"," +
                             "\\"claimNumber\\":\\"5012\\",\\"status\\":\\"active\\"}"))
               .andExpect(status().isCreated())
               .andExpect(header().string("Location", "/api/policies/9"))
               .andExpect(jsonPath("$.id").value(9));
    }

    @Test
    void deleteReturns204AndDelegates() throws Exception {
        mockMvc.perform(delete("/api/policies/{id}", 4))
               .andExpect(status().isNoContent());

        verify(policyService).deletePolicy(4);
    }
}

// OUTPUT of .andDo(print()) for the POST:
// MockHttpServletRequest:
//       HTTP Method = POST
//       Request URI = /api/policies
//           Headers = [Content-Type:"application/json"]
//              Body = {"policyNumber":"P-900", ... }
//           Handler = PolicyController#createPolicy(Policy)
// MockHttpServletResponse:
//            Status = 201
//           Headers = [Location:"/api/policies/9",
//                      Content-Type:"application/json"]
//              Body = {"id":9,"policyNumber":"P-900","premiumAmount":"500",
//                      "name":"Rajaram","email":"ram@gmail.com",
//                      "claimNumber":"5012","status":"active"}
//
// Tests run: 4, Failures: 0
// Started PolicyControllerTest in 1.142 seconds (process running for 2.4)
//
// FAILURE you get if you forget @MockBean PolicyService:
// java.lang.IllegalStateException: Failed to load ApplicationContext
// Caused by: NoSuchBeanDefinitionException: No qualifying bean of type
//   'com.cybage.genworth.insurance.service.PolicyService' available:
//   expected at least 1 bean which qualifies as autowire candidate.`]
        },

        {
            content: `<h3>What MockMvc can assert</h3>
The chain reads like the HTTP conversation itself. Everything on the left of the table is a static import from <code>MockMvcResultMatchers</code>. <br><br>

<table>
<tr><th>Matcher</th><th>Checks</th></tr>
<tr><td>status().isOk() / isCreated() / isNotFound() / isBadRequest()</td><td>The response status code. There are named methods for the whole range, plus <code>status().is(418)</code>.</td></tr>
<tr><td>content().contentType(MediaType.APPLICATION_JSON)</td><td>The Content-Type header the converter chose.</td></tr>
<tr><td>content().json(expectedJson)</td><td>Whole-body comparison that ignores field order and, by default, tolerates extra fields. Far less brittle than <code>content().string(...)</code>.</td></tr>
<tr><td>jsonPath("$.name").value("Rajaram")</td><td>One field, addressed by JSONPath. <code>$[0]</code> indexes an array, <code>$..email</code> searches recursively.</td></tr>
<tr><td>jsonPath("$.password").doesNotExist()</td><td>A field is absent - the assertion that stops you leaking a hash into a response body.</td></tr>
<tr><td>header().string("Location", "...")</td><td>A response header.</td></tr>
<tr><td>view().name(...) / model().attribute(...)</td><td>For a classic MVC controller returning a template name rather than JSON.</td></tr>
<tr><td>andReturn()</td><td>Ends the chain and hands back the <code>MvcResult</code>, so you can deserialise the body and assert on a real object.</td></tr>
</table>
<br>
Two request-builder details that catch people out. <code>get("/api/policies/{id}", 3)</code> uses a URI template, so the value is encoded properly - do not build the path by string concatenation. And a POST without <code>.contentType(...)</code> produces <strong>415 Unsupported Media Type</strong>, not a helpful message, because no <code>HttpMessageConverter</code> volunteers to read it.`,
            codeExamples: [`// Error paths are where @WebMvcTest earns its keep, because the status
// code is produced by the framework, not by your controller.

@Test
void unknownIdIsTranslatedTo404() throws Exception {
    when(policyService.getPolicyById(99))
            .thenThrow(new PolicyNotFoundException("No policy with id 99"));

    mockMvc.perform(get("/api/policies/99"))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.message").value("No policy with id 99"));
    // This passes only if a @ControllerAdvice maps the exception to 404.
    // @WebMvcTest loads @ControllerAdvice beans, so the advice is exercised.
    // Without one you get 500, and this test tells you so.
}

@Test
void nonNumericIdIsRejectedBeforeTheControllerRuns() throws Exception {
    mockMvc.perform(get("/api/policies/abc"))
           .andExpect(status().isBadRequest());
    // MethodArgumentTypeMismatchException, thrown during data binding.
    // A mocked-service unit test cannot reach this code path at all.
}

@Test
void missingContentTypeIs415() throws Exception {
    mockMvc.perform(post("/api/policies").content("{}"))
           .andExpect(status().isUnsupportedMediaType());
}

@Test
void deserialiseTheBodyAndAssertOnTheObject() throws Exception {
    when(policyService.getPolicyById(3)).thenReturn(
            new Policy(3, "103", "1000", "Shahaji", "shyam@x.com", "2022", "active"));

    String body = mockMvc.perform(get("/api/policies/3"))
                         .andExpect(status().isOk())
                         .andReturn()
                         .getResponse()
                         .getContentAsString();

    Policy returned = new ObjectMapper().readValue(body, Policy.class);
    assertEquals("103", returned.getPolicyNumber());
}

// OUTPUT of a jsonPath mismatch - it names the path, which is what
// makes these failures quick to read:
// java.lang.AssertionError: JSON path "$.name"
// Expected: "Rajaram"
//      but: was "Ramchandra"

// OUTPUT when the field simply is not in the JSON:
// java.lang.AssertionError: No value at JSON path "$.policyNo"
// - almost always a mismatch between the @JsonProperty name and the
//   name the test asserts on. Exactly the class of defect a mocked
//   service test can never see.`]
        },

        {
            content: `<h3>Steps - testing the repository with @DataJpaTest</h3>
<strong>Problem Statement</strong>: <code>PolicyRepository</code> needs a finder by policy number and one by status. Derived query methods are parsed from the method <strong>name</strong> at context startup, and a JPQL <code>@Query</code> is parsed at startup too. Neither is checked by the compiler, so a typo is a runtime failure - and a mocked repository will never find it. <br><br>

<code>@DataJpaTest</code> gives you the persistence layer and nothing else. Three of its behaviours define how the test feels: <br><br>

<table>
<tr><th>Behaviour</th><th>Effect</th></tr>
<tr><td>Embedded database substitution</td><td>Any <code>DataSource</code> you configured is replaced by an in-memory one (H2, HSQLDB or Derby, whichever is on the classpath). Your MySQL settings in <code>application.properties</code> are ignored.</td></tr>
<tr><td>Transactional and rolled back</td><td>Every test method runs in a transaction that is <strong>rolled back</strong> at the end. Tests cannot pollute each other, and no cleanup code is needed.</td></tr>
<tr><td>TestEntityManager</td><td>A test-facing wrapper over <code>EntityManager</code> with <code>persistAndFlush</code>, <code>find</code> and <code>clear</code>. Use it to set up rows without going through the repository you are trying to test.</td></tr>
</table>
<br>
The <code>flush()</code> and <code>clear()</code> pair is the part beginners miss. Inside one transaction the persistence context is a cache: <code>save()</code> then <code>findById()</code> can hand you back the very same Java object without ever touching the database, so a broken column mapping goes undetected. <code>flush()</code> forces the INSERT to be issued and <code>clear()</code> empties the cache, so the subsequent read is a genuine SELECT.`,
            codeExamples: [`// PolicyRepository.java
package com.cybage.genworth.insurance.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cybage.genworth.insurance.model.Policy;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Integer> {
    //                                                  ^^^^^^^ the ID type.
    // The handout writes CrudRepository<Policy, Serializable> and then
    // declares "public Policy findById(Integer Id);", which clashes with
    // the inherited Optional<Policy> findById(ID) and does not compile.

    Optional<Policy> findByPolicyNumber(String policyNumber);

    List<Policy> findByStatus(String status);

    @Query("select p from Policy p where p.status = :status " +
           "and p.premiumAmount > :minimum")
    List<Policy> findExpensiveByStatus(@Param("status") String status,
                                       @Param("minimum") String minimum);
}


// src/test/java/.../PolicyRepositoryTest.java
package com.cybage.genworth.insurance.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.cybage.genworth.insurance.model.Policy;

@DataJpaTest
class PolicyRepositoryTest {

    @Autowired private TestEntityManager entityManager;
    @Autowired private PolicyRepository  policyRepository;

    @Test
    void findByPolicyNumberReturnsTheRow() {
        entityManager.persistAndFlush(new Policy(null, "P-101", "1000", "Rajaram",
                "ram@gmail.com", "C-1", "active"));
        entityManager.clear();          // force a real SELECT, not a cache hit

        Optional<Policy> found = policyRepository.findByPolicyNumber("P-101");

        assertTrue(found.isPresent());
        assertEquals("Rajaram", found.get().getName());
    }

    @Test
    void findByPolicyNumberIsEmptyForAnUnknownNumber() {
        assertTrue(policyRepository.findByPolicyNumber("P-999").isEmpty());
    }

    @Test
    void findByStatusFiltersCorrectly() {
        entityManager.persist(new Policy(null, "P-1", "100", "A", "a@x.com", "C-1", "active"));
        entityManager.persist(new Policy(null, "P-2", "200", "B", "b@x.com", "C-2", "lapsed"));
        entityManager.persist(new Policy(null, "P-3", "300", "C", "c@x.com", "C-3", "active"));
        entityManager.flush();

        List<Policy> active = policyRepository.findByStatus("active");

        assertEquals(2, active.size());
    }

    @Test
    void idIsGeneratedOnPersist() {
        Policy saved = policyRepository.saveAndFlush(
                new Policy(null, "P-500", "500", "D", "d@x.com", "C-5", "active"));
        assertNotNull(saved.getId());   // IDENTITY column filled in by the INSERT
    }
}

// OUTPUT (with spring.jpa.show-sql=true in application-test.properties):
// Hibernate: create table policy (id integer generated by default as identity,
//            claimnumber varchar(255), email varchar(255), name varchar(255),
//            policynumber varchar(255), premiumamount varchar(255),
//            status varchar(255), primary key (id))
// Hibernate: insert into policy (claimnumber,email,name,policynumber,
//            premiumamount,status) values (?,?,?,?,?,?)
// Hibernate: select p1_0.id,... from policy p1_0 where p1_0.policynumber=?
// Tests run: 4, Failures: 0
// Started PolicyRepositoryTest in 1.431 seconds
//
// FAILURE from a typo in a derived method name - note that it happens at
// CONTEXT STARTUP, before any test body runs:
// org.springframework.data.repository.query.QueryCreationException:
// Could not create query for method
//   public abstract Optional findByPolicyNumbr(String);
// No property 'policyNumbr' found for type 'Policy';
//   Did you mean 'policyNumber'?
//
// A mocked PolicyRepository would have returned exactly what you stubbed
// and this method would have shipped broken.`]
        },

        {
            content: `<h3>Steps - the full integration test with @SpringBootTest</h3>
<strong>@SpringBootTest</strong> starts the real context. Its <code>webEnvironment</code> attribute decides whether a servlet container starts with it, and that choice determines which client you use. <br><br>

<table>
<tr><th>webEnvironment</th><th>What happens</th></tr>
<tr><td>MOCK (the default)</td><td>A mock servlet environment, no port is bound. Combine with <code>@AutoConfigureMockMvc</code> to get a <code>MockMvc</code> that runs through the <strong>whole</strong> context - controller, real service, real repository.</td></tr>
<tr><td>RANDOM_PORT</td><td>A real embedded Tomcat on a free port, injected into the test with <code>@LocalServerPort</code>. Requests go over a real TCP socket. This is the only mode that exercises the HTTP stack, connectors, filters ordering and real serialisation.</td></tr>
<tr><td>DEFINED_PORT</td><td>A real container on the configured port. Avoid it - parallel builds and a developer's running application collide on it.</td></tr>
<tr><td>NONE</td><td>Context only, no web environment. For batch jobs and scheduled components.</td></tr>
</table>
<br>
With <code>RANDOM_PORT</code> you inject a <strong>TestRestTemplate</strong> - a fault-tolerant wrapper over <code>RestTemplate</code> that does <strong>not</strong> throw on 4xx or 5xx, so you can assert on an error status instead of catching an exception. On a reactive stack, or on any Boot 3 project, <strong>WebTestClient</strong> is the better choice: fluent, non-blocking, and usable against either a real port or a mock environment.`,
            codeExamples: [`package com.cybage.genworth.insurance;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import com.cybage.genworth.insurance.model.Policy;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PolicyEndToEndIT {

    @LocalServerPort  private int port;
    @Autowired        private TestRestTemplate restTemplate;

    private String url(String path) {
        return "http://localhost:" + port + "/api/policies" + path;
    }

    @Test
    void saveThenReadItBack() {
        Policy request = new Policy(null, "P-777", "1500", "Rajaram",
                                    "ram@gmail.com", "C-77", "active");

        ResponseEntity<Policy> created =
                restTemplate.postForEntity(url(""), request, Policy.class);

        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        Integer id = created.getBody().getId();
        assertNotNull(id);

        ResponseEntity<Policy> fetched =
                restTemplate.getForEntity(url("/" + id), Policy.class);

        assertEquals(HttpStatus.OK, fetched.getStatusCode());
        assertEquals("P-777", fetched.getBody().getPolicyNumber());
        // Controller -> service -> repository -> Hibernate -> database -> back.
        // Every layer real. This is the Postman check from the handout,
        // written down once and run on every build.
    }

    @Test
    void unknownIdReturns404WithoutThrowing() {
        ResponseEntity<String> response =
                restTemplate.getForEntity(url("/424242"), String.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // A plain RestTemplate would have thrown HttpClientErrorException
        // here. TestRestTemplate deliberately does not, so error responses
        // are assertable like any other.
    }
}


// ---- The same coverage without binding a port: MOCK + MockMvc ----
@SpringBootTest                       // webEnvironment = MOCK, the default
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PolicyFullStackMockMvcTest {

    @Autowired private MockMvc mockMvc;      // real service, real repository

    @Test
    void getAllHitsTheRealDatabase() throws Exception {
        mockMvc.perform(get("/api/policies"))
               .andExpect(status().isOk());
    }
}
// Faster than RANDOM_PORT and still exercises the whole bean graph. What it
// does NOT exercise is the network layer: connectors, TLS, servlet container
// behaviour, and anything that only breaks over a real socket.


// OUTPUT:
// Tomcat started on port 51443 (http) with context path ''
// Started PolicyEndToEndIT in 4.128 seconds (process running for 6.9)
// Hibernate: insert into policy (...) values (?,?,?,?,?,?)
// Hibernate: select p1_0.id,... from policy p1_0 where p1_0.id=?
// Tests run: 2, Failures: 0, Errors: 0
//
// Name it *IT, not *Test, and maven-failsafe-plugin runs it during
// "mvn verify" instead of surefire's "mvn test" - so the slow tests do
// not sit in the fast feedback loop.`]
        },

        {
            content: `<h3>Test configuration and test data</h3>
An integration test must not talk to the developer's MySQL instance, and it must start from a known set of rows. Spring Boot gives several mechanisms; the useful thing is knowing which one wins. <br><br>

<table>
<tr><th>Mechanism</th><th>Purpose</th></tr>
<tr><td>src/test/resources/application.properties</td><td>Replaces the main one entirely for tests on the test classpath. Blunt, but it is where <code>show-sql</code> and log levels belong.</td></tr>
<tr><td>application-test.properties + @ActiveProfiles("test")</td><td>The usual arrangement: a profile-specific file layered over the defaults, activated per test class.</td></tr>
<tr><td>@TestPropertySource(properties = {...})</td><td>Highest precedence, declared inline on the class. Ideal for one or two overrides - but note it changes the context cache key.</td></tr>
<tr><td>@DynamicPropertySource</td><td>A static method that registers properties computed at runtime, which is how a container's randomly-assigned port and JDBC URL reach the context.</td></tr>
<tr><td>@Sql("/data/policies.sql")</td><td>Runs a SQL script before (or, with <code>executionPhase</code>, after) the test method. Precise, readable seed data.</td></tr>
<tr><td>src/test/resources/data.sql + schema.sql</td><td>Run automatically against an embedded database at startup. Convenient, but shared by every test in the context.</td></tr>
<tr><td>@Transactional on the test class</td><td>Wraps each test method in a transaction that is rolled back - what <code>@DataJpaTest</code> does for you. On a <code>RANDOM_PORT</code> test it does <strong>not</strong> work, because the server handles the request on a different thread with its own transaction.</td></tr>
</table>
<br>
That last row is a genuine trap. Developers add <code>@Transactional</code> to a <code>RANDOM_PORT</code> integration test expecting automatic cleanup, the rows persist, and the next test fails on stale data. Over a real socket the only options are an explicit cleanup step, a fresh database per class, or a container that is thrown away.`,
            codeExamples: [`# src/test/resources/application-test.properties
spring.datasource.url=jdbc:h2:mem:policytest;DB_CLOSE_DELAY=-1;MODE=MySQL
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.orm.jdbc.bind=TRACE   # Boot 3 / Hibernate 6:
                                                  # shows the ? parameter values


// ---- @Sql: readable, per-test seed data ----
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PolicySearchIT {

    @Test
    @Sql("/data/three-active-policies.sql")
    void searchReturnsOnlyActivePolicies() { /* ... */ }

    @Test
    @Sql(scripts = "/data/cleanup.sql",
         executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
    void deleteRemovesTheRow() { /* ... */ }
}


// ---- The @Transactional trap on RANDOM_PORT ----
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Transactional          // <-- does NOT roll back what the SERVER wrote
class BrokenCleanupIT {

    @Test
    void createsAPolicy() {
        restTemplate.postForEntity(url(""), request, Policy.class);
        // The insert happened on Tomcat's request thread, in its own
        // transaction, which committed. The test thread's transaction
        // rolls back at the end and takes nothing with it. The row stays.
    }
}
// OUTPUT on the second run:
// org.h2.jdbc.JdbcSQLIntegrityConstraintViolationException:
// Unique index or primary key violation: "PUBLIC.UK_POLICY_NUMBER
//   ON PUBLIC.POLICY(POLICYNUMBER) VALUES ('P-777')"
//
// @Transactional on a test IS correct for @DataJpaTest and for
// MOCK-environment @SpringBootTest, where everything runs on one thread.`]
        },

        {
            content: `<h3>Application Flow - which test sees which defect</h3>
The point of having three levels is that each one can see a class of defect the others cannot. <br><br>

<table>
<tr><th>Defect</th><th>Caught by</th></tr>
<tr><td>Wrong arithmetic or a wrong branch in the service</td><td>The Mockito unit test - fastest, and the right place for it</td></tr>
<tr><td>Wrong URL path, wrong HTTP verb, wrong status code</td><td>@WebMvcTest</td></tr>
<tr><td>JSON field named differently from the API contract</td><td>@WebMvcTest or @JsonTest</td></tr>
<tr><td>Exception not mapped to a status by @ControllerAdvice</td><td>@WebMvcTest</td></tr>
<tr><td>Typo in a derived query method name, broken JPQL</td><td>@DataJpaTest - it fails at context startup</td></tr>
<tr><td>Column name in @Column does not exist in the schema</td><td>@DataJpaTest against a real schema, or a Testcontainers test</td></tr>
<tr><td>Missing @Transactional causing a lazy-loading failure</td><td>@SpringBootTest with a real request thread</td></tr>
<tr><td>Two beans of the same type, ambiguous injection</td><td>Any test that loads the full context - including the generated contextLoads() smoke test</td></tr>
<tr><td>Filter ordering, CORS, security rules</td><td>@SpringBootTest with RANDOM_PORT, or @WebMvcTest with security auto-configuration on</td></tr>
</table>`,
            codeExamples: [`REQUEST PATH, AND WHERE EACH TEST CUTS IT

  HTTP client
      |
      |  <=== TestRestTemplate / WebTestClient enter here  (RANDOM_PORT)
      v
  Tomcat connector  ................. only a real port exercises this
      |
      v
  Servlet filters / Spring Security
      |
      |  <=== MockMvc enters here    (@WebMvcTest, @AutoConfigureMockMvc)
      v
  DispatcherServlet
      |
      +-- HandlerMapping        : is the URL right?
      +-- Argument resolvers    : does @PathVariable bind?
      +-- HttpMessageConverter  : does the JSON deserialise?
      v
  PolicyController
      |
      |  <=== the unit test enters here, calling the object directly
      v
  PolicyServiceImpl                      business rules live here
      |
      |  <=== a mock cuts the chain here (unit test)
      v
  PolicyRepository (Spring Data proxy)
      |
      |  <=== @DataJpaTest covers from here down
      v
  Hibernate  ->  JDBC  ->  H2 / Testcontainers MySQL / real MySQL


  A test is worth writing when it is the CHEAPEST level that can see
  the defect you are trying to prevent. Anything higher is slower and
  more brittle for no additional information.`]
        }
    ],

    expert: [
        {
            content: `<h3>@Mock versus @MockBean, and the price of dirtying the cache</h3>
The unit-testing topic argues for <code>@Mock</code> on the grounds that a service test needs no context at all. Here the question is different: you are already loading a context, so what does adding a <code>@MockBean</code> cost? <br><br>

<table>
<tr><th>Aspect</th><th>@Mock (Mockito)</th><th>@MockBean / @MockitoBean (Spring)</th></tr>
<tr><td>Package</td><td>org.mockito.Mock</td><td>org.springframework.boot.test.mock.mockito.MockBean</td></tr>
<tr><td>Requires a context</td><td>No</td><td>Yes - there is nothing to register into otherwise</td></tr>
<tr><td>Mechanism</td><td>Creates an object</td><td>Creates an object, then <strong>replaces the bean definition</strong> in the <code>BeanFactory</code> before refresh</td></tr>
<tr><td>Reaches collaborators</td><td>Only via @InjectMocks or your own constructor call</td><td>Everywhere Spring would have injected the real bean</td></tr>
<tr><td>Effect on the context cache</td><td>None</td><td>Becomes part of the cache key - a different mock set is a different context</td></tr>
<tr><td>Cost</td><td>Microseconds</td><td>Potentially a full context startup, per test class</td></tr>
</table>
<br>
The mock itself is cheap. What is expensive is that <strong>a set of bean overrides makes the context unique</strong>. Spring's <code>MergedContextConfiguration</code> - the cache key - includes the <code>ContextCustomizer</code> that <code>@MockBean</code> contributes, and that customiser carries the definitions being overridden. Two classes that mock different beans therefore cannot share a context, and each pays a cold start. This is the single largest avoidable cost in most Spring test suites. <br><br>

<div class="border">
On Spring Framework 6.2 / Boot 3.4, <code>@MockBean</code> and <code>@SpyBean</code> are deprecated in favour of <code>@MockitoBean</code> and <code>@MockitoSpyBean</code>, part of a general bean-override mechanism that also includes <code>@TestBean</code> (replace a bean with a real object from a static factory method). The caching consequence is unchanged.<br>
<code>@SpyBean</code> wraps the <strong>real</strong> bean so unstubbed calls still execute. Useful for a legacy component you want to observe rather than replace, and for verifying that a real collaborator was called - but note it forces Spring to create the real bean first, with all its dependencies.
</div>`,
            codeExamples: [`// ---- The pattern that quietly costs a CI build ten minutes ----
@SpringBootTest class PolicyCreateIT   { @MockBean PaymentGateway gw; }
@SpringBootTest class PolicyRenewIT    { @MockBean PaymentGateway gw;
                                         @MockBean NotificationSender ns; }
@SpringBootTest class PolicyCancelIT   { @MockBean NotificationSender ns; }
@SpringBootTest class PolicyReportIT   { /* no mocks at all */ }

// OUTPUT (180-bean application):
// Started PolicyCreateIT in 4.021 seconds
// Started PolicyRenewIT  in 3.980 seconds   <- key differs, cold
// Started PolicyCancelIT in 3.944 seconds   <- key differs, cold
// Started PolicyReportIT in 3.911 seconds   <- key differs, cold
// ~16 s of startup for four classes.


// ---- Hoist the overrides into one shared base ----
@SpringBootTest
@ActiveProfiles("test")
abstract class AbstractPolicyIT {
    @MockBean protected PaymentGateway     gateway;
    @MockBean protected NotificationSender sender;
}

class PolicyCreateIT extends AbstractPolicyIT { }
class PolicyRenewIT  extends AbstractPolicyIT { }
class PolicyCancelIT extends AbstractPolicyIT { }
class PolicyReportIT extends AbstractPolicyIT { }

// OUTPUT:
// Started PolicyCreateIT in 4.055 seconds
// Started PolicyRenewIT  in 0.019 seconds   <- cache hit
// Started PolicyCancelIT in 0.017 seconds   <- cache hit
// Started PolicyReportIT in 0.021 seconds   <- cache hit
// ~4.1 s. Identical coverage.
//
// The mocks are reset between test methods by Boot's
// MockitoTestExecutionListener, so sharing them is safe - the stubs
// from one test never leak into the next.


// ---- @SpyBean: the real bean, observed ----
@SpringBootTest
class PolicyAuditIT {

    @SpyBean private AuditLog auditLog;   // real bean, wrapped

    @Test
    void savingAPolicyWritesAnAuditRow() {
        policyService.savePolicy(newPolicy());
        verify(auditLog).record(argThat(e -> "POLICY_CREATED".equals(e.getType())));
        // The real AuditLog also ran, so the row is genuinely in the table.
    }
}`]
        },

        {
            content: `<h3>How the test context cache actually works, and what invalidates it</h3>
<code>TestContextManager</code> keeps a static, JVM-wide, LRU map from a <strong>context key</strong> to a fully refreshed <code>ApplicationContext</code>. Every test class computes its key; a hit reuses the context, a miss builds a new one. Understanding what goes into that key is the difference between a two-minute suite and a twenty-minute one. <br><br>

<table>
<tr><th>Key component</th><th>Contributed by</th></tr>
<tr><td>locations / classes</td><td><code>@ContextConfiguration</code>, <code>@SpringBootTest(classes = ...)</code>, and the discovered <code>@SpringBootConfiguration</code></td></tr>
<tr><td>context initializers</td><td><code>ApplicationContextInitializer</code> classes named on the test</td></tr>
<tr><td>active profiles</td><td><code>@ActiveProfiles</code> - and the set is order-sensitive unless sorted</td></tr>
<tr><td>property source locations and inlined properties</td><td><code>@TestPropertySource</code>, and <code>@SpringBootTest(properties = ...)</code></td></tr>
<tr><td>context customizers</td><td><code>@MockBean</code>/<code>@MockitoBean</code> sets, <code>@DynamicPropertySource</code> methods, the web environment, <code>@AutoConfigure*</code> annotations, excluded auto-configuration</td></tr>
<tr><td>context loader and parent context</td><td>Rarely varied in practice</td></tr>
</table>
<br>
Everything else is fair game for sharing. Two <code>@WebMvcTest</code> classes for different controllers still produce different keys, because the controller list is a customizer - which is why <code>@WebMvcTest</code> without arguments (all controllers) can, counter-intuitively, be faster across a large suite than many single-controller slices. <br><br>

<strong>@DirtiesContext</strong> is the explicit invalidation: it closes the context and evicts it after the class (or method, with <code>methodMode</code>). It is occasionally necessary - a test that mutates a singleton's state, shuts down a scheduler, or changes a static registry - but it is very often used as a blunt fix for test pollution that would be better fixed at its cause. Every <code>@DirtiesContext</code> costs one startup for the class that carries it and one for the next class that wanted that context. <br><br>

The cache holds <code>32</code> contexts by default (<code>spring.test.context.cache.maxSize</code>). Exceed it and you get LRU thrashing: contexts are evicted and rebuilt in a cycle, which looks exactly like a slow machine and is in fact a configuration problem.`,
            codeExamples: [`// Enable the diagnostic first - it tells you the truth about your suite:
// src/test/resources/logging.properties or application-test.properties
logging.level.org.springframework.test.context.cache=DEBUG

// OUTPUT of a healthy suite:
// Spring test ApplicationContext cache statistics:
//   [DefaultContextCache@6d1e7682 size = 3, maxSize = 32,
//    parentContextCount = 0, hitCount = 47, missCount = 3]

// OUTPUT of a suite in trouble - one context per class:
//   [DefaultContextCache size = 32, maxSize = 32,
//    parentContextCount = 0, hitCount = 4, missCount = 61]
// 61 misses, 4 hits, and the cache is full: it is now evicting contexts
// it will need again. Fix the key variation, do not buy a faster machine.


// ---- Small differences that split the cache ----
@SpringBootTest                                   // key A
class OneTest { }

@SpringBootTest(properties = "app.retries=3")     // key B - different
class TwoTest { }

@SpringBootTest
@ActiveProfiles({"test", "mock-payments"})        // key C - different
class ThreeTest { }

@SpringBootTest
@ActiveProfiles({"mock-payments", "test"})        // ALSO key C:
class FourTest { }                                // profiles are sorted
                                                  // before hashing


// ---- @DirtiesContext: correct use, and the cost ----
@SpringBootTest
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
class SchedulerShutdownIT {
    // This test stops the TaskScheduler. Any later test reusing the
    // context would find scheduling dead. Here the eviction is right.
}

// OUTPUT:
// Started SchedulerShutdownIT in 4.010 seconds
// Closing org.springframework.context...ApplicationContext@1a2b3c
// Started NextIT in 4.130 seconds     <- had to rebuild


// ---- Raise the cache size only when the variation is genuinely needed ----
// src/test/resources/spring.properties
spring.test.context.cache.maxSize=48`]
        },

        {
            content: `<h3>@WebMvcTest versus @SpringBootTest - the real cost, and the real coverage</h3>
The usual claim is that slices are "faster". That is true but imprecise; the interesting part is what each one stops testing. <br><br>

<table>
<tr><th>Question</th><th>@WebMvcTest</th><th>@SpringBootTest</th></tr>
<tr><td>Beans created</td><td>Web infrastructure plus the named controllers - typically 25-40</td><td>Every bean the application defines - hundreds</td></tr>
<tr><td>Auto-configuration applied</td><td>A fixed allow-list from <code>spring.factories</code>: Jackson, MVC, validation, security, error handling</td><td>All of it, including JPA, the connection pool, caching, messaging, metrics, scheduling</td></tr>
<tr><td>DataSource</td><td>None. A repository that is <code>@MockBean</code>-ed still needs no database, and one that is not causes a startup failure</td><td>Real. It will connect, and CI needs that database to exist</td></tr>
<tr><td>Typical startup</td><td>~1 s cold, then cached across classes with the same key</td><td>3-8 s cold on a medium application</td></tr>
<tr><td>What only it can catch</td><td>Nothing the full test cannot; it is a subset</td><td>Bean wiring conflicts, missing configuration properties, transaction boundaries, real query execution, filter ordering, startup failures</td></tr>
<tr><td>What it wrongly reports green</td><td>Anything below the mocked service</td><td>Little - which is also why its failures are harder to localise</td></tr>
</table>
<br>
The subtlety about failure localisation matters more than the seconds. A <code>@WebMvcTest</code> failure points at one controller. A <code>@SpringBootTest</code> failure could be the controller, the service, the mapping, the schema, the profile, or a bean that failed to construct - and you read a two-hundred-line stack trace to find out. Fast tests are not only fast to run, they are fast to <strong>diagnose</strong>. <br><br>

Two operational notes. <code>@WebMvcTest</code> loads Spring Security's filter chain if Spring Security is on the classpath, so every request without credentials comes back <strong>401</strong> and your tests fail for a reason that has nothing to do with the controller - use <code>@WithMockUser</code>, or turn the filters off deliberately. And do not annotate a test with both <code>@SpringBootTest</code> and a slice annotation: they configure the context in incompatible ways and Boot rejects the combination.`,
            codeExamples: [`// ---- Security in a @WebMvcTest ----
@WebMvcTest(PolicyController.class)
class PolicyControllerSecurityTest {

    @Autowired  private MockMvc mockMvc;
    @MockBean   private PolicyService policyService;

    @Test
    void anonymousRequestIsRejected() throws Exception {
        mockMvc.perform(get("/api/policies"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "AGENT")
    void agentCanRead() throws Exception {
        mockMvc.perform(get("/api/policies"))
               .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "AGENT")
    void agentCannotDelete() throws Exception {
        mockMvc.perform(delete("/api/policies/1").with(csrf()))
               .andExpect(status().isForbidden());
        // Without .with(csrf()) this returns 403 for the WRONG reason -
        // a missing CSRF token, not the missing role. The test would pass
        // while proving nothing about authorisation.
    }
}

// Escape hatch when you truly want the controller without security:
@WebMvcTest(controllers = PolicyController.class)
@AutoConfigureMockMvc(addFilters = false)
class PolicyControllerNoSecurityTest { }
// Use sparingly. It also switches off every other filter, so anything
// your application does in a filter is now untested.


// ---- The combination Boot rejects ----
@SpringBootTest
@WebMvcTest(PolicyController.class)     // do not do this
class ConfusedTest { }
// OUTPUT:
// java.lang.IllegalStateException: Configuration error: found multiple
// declarations of @BootstrapWith for test class [ConfusedTest]:
// [@BootstrapWith(SpringBootTestContextBootstrapper.class),
//  @BootstrapWith(WebMvcTestContextBootstrapper.class)]


// ---- Measured on a real 180-bean service, 22 controller test classes ----
// All @SpringBootTest + @AutoConfigureMockMvc:  22 x ~4.0 s  = 88 s
// All @WebMvcTest, one controller each:          1 x 1.1 s + 21 cached
//                                                 keys ... but each
//                                                 controller list is a
//                                                 DIFFERENT key: 22 x 1.1 s
//                                                             = 24 s
// One @WebMvcTest with no arguments, shared base: 1 x 1.6 s + 21 hits
//                                                             = 2.0 s`]
        },

        {
            content: `<h3>@DataJpaTest: rollback by default, and the database it silently swaps in</h3>
Two behaviours of <code>@DataJpaTest</code> are frequently misunderstood, and both change what the test actually proves. <br><br>

<strong>Rollback by default.</strong> <code>@DataJpaTest</code> is meta-annotated <code>@Transactional</code>, and the Spring TestContext framework rolls back a test-managed transaction when the method ends. Nothing is ever committed. Three consequences follow: <br>
• Tests are isolated for free and need no cleanup. <br>
• The persistence context lives for the whole method, so an entity you <code>save()</code> is still managed - a subsequent <code>findById()</code> may return it from the first-level cache without issuing a SELECT. Call <code>flush()</code> and <code>clear()</code> when you want to prove the round trip. <br>
• Because there is always an open transaction, <strong>lazy associations resolve happily</strong> in the test and then throw <code>LazyInitializationException</code> in production, where the session closed at the end of the service call. A <code>@DataJpaTest</code> can never catch that defect. <br><br>
<code>@Rollback(false)</code> or <code>@Commit</code> turns the rollback off, but then you own the cleanup. <br><br>

<strong>Automatic embedded-database substitution.</strong> <code>@DataJpaTest</code> implies <code>@AutoConfigureTestDatabase(replace = Replace.ANY)</code>. Whatever <code>DataSource</code> your configuration defines is discarded and an in-memory one is substituted. This is why the test runs on a laptop with no MySQL - and why it can pass against SQL your production database would reject. <br><br>

<table>
<tr><th>H2 pretends</th><th>MySQL disagrees</th></tr>
<tr><td>Identifier quoting and case handling are forgiving</td><td>Table name case matters on Linux; a name that works on a developer's Windows machine can fail in production</td></tr>
<tr><td>Reserved words differ</td><td>A column called <code>rank</code> or <code>groups</code> is fine in one and a syntax error in the other</td></tr>
<tr><td>No native SQL functions in common</td><td>Any <code>@Query(nativeQuery = true)</code> using <code>GROUP_CONCAT</code>, <code>JSON_EXTRACT</code> or <code>ON DUPLICATE KEY</code> cannot be tested against H2 at all</td></tr>
<tr><td>Default isolation, locking and deadlock behaviour</td><td>Row locking, gap locks and <code>SELECT ... FOR UPDATE</code> semantics are genuinely different</td></tr>
<tr><td>Type coercion and truncation</td><td>MySQL's strict mode, zero dates and implicit conversions have no H2 equivalent</td></tr>
</table>
<br>
<code>MODE=MySQL</code> narrows some of this and closes none of it. If the query matters, test it against the real engine - which is what Testcontainers is for.`,
            codeExamples: [`// ---- Turning the substitution OFF: test against the configured database ----
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class PolicyRepositoryRealDbTest {
    // Now spring.datasource.url from application-test.properties is honoured.
    // Point it at a Testcontainers MySQL, NOT at a shared team database:
    // rolled-back transactions still leave gaps in AUTO_INCREMENT, DDL is
    // not transactional, and two developers running the suite at once
    // will fail each other's tests.

    @Autowired private PolicyRepository repository;

    @Test
    void nativeGroupConcatQueryWorks() {
        // Cannot be expressed in H2 at all.
        List<String> summary = repository.summariseByStatus();
        assertFalse(summary.isEmpty());
    }
}


// ---- The rollback, made visible ----
@DataJpaTest
class RollbackBehaviourTest {

    @Autowired private TestEntityManager em;
    @Autowired private PolicyRepository  repository;

    @Test
    void saveIsNotCommitted() {
        repository.save(new Policy(null, "P-1", "100", "A", "a@x.com", "C", "active"));
        assertEquals(1, repository.count());
    }

    @Test
    void theOtherTestLeftNothingBehind() {
        assertEquals(0, repository.count());   // passes: the first test rolled back
    }

    @Test
    void firstLevelCacheCanHideABrokenMapping() {
        Policy saved = repository.save(newPolicy());
        Policy read  = repository.findById(saved.getId()).orElseThrow();
        assertSame(saved, read);        // the SAME Java object. No SELECT ran.

        em.flush();
        em.clear();                     // now the cache is empty
        Policy reread = repository.findById(saved.getId()).orElseThrow();
        assertNotSame(saved, reread);   // this one came from the database
    }
}

// OUTPUT with logging.level.org.springframework.transaction=DEBUG:
// Creating new transaction with name [...RollbackBehaviourTest.saveIsNotCommitted]
// Hibernate: insert into policy (...) values (?,?,?,?,?,?)
// Rolling back transaction for test context [...]
//
// OUTPUT of the lazy-loading blind spot:
// @DataJpaTest:  policy.getClaims().size()  ->  3     (session still open)
// production:    policy.getClaims().size()  ->
//   org.hibernate.LazyInitializationException: failed to lazily initialize
//   a collection of role: Policy.claims: could not initialize proxy - no Session
// Only an end-to-end test through the web layer sees this.`]
        },

        {
            content: `<h3>Testcontainers - testing against the database you actually deploy on</h3>
The honest answer to "H2 is not MySQL" is to run MySQL. <strong>Testcontainers</strong> starts a real database in a Docker container for the duration of the build, hands the test its randomly-assigned port, and throws it away afterwards. The container is disposable, so tests can commit freely and each class can start from a known state. <br><br>

<table>
<tr><th>Concern</th><th>How Testcontainers handles it</th></tr>
<tr><td>Port conflicts</td><td>The container binds a random host port; the test reads it back at runtime</td></tr>
<tr><td>Leftover containers</td><td>A companion "Ryuk" container reaps everything when the JVM exits, including after a crash</td></tr>
<tr><td>Startup timing</td><td>Wait strategies block until the database is genuinely accepting connections, not merely until the process started</td></tr>
<tr><td>Startup cost</td><td>Real - several seconds. Mitigate with the singleton-container pattern or <code>@Testcontainers(disabledWithoutDocker = true)</code> plus reuse</td></tr>
<tr><td>CI</td><td>Needs a Docker daemon on the agent. That requirement is the main reason teams hesitate, and it is usually a one-line change</td></tr>
</table>
<br>
On <strong>Spring Boot 3.1+</strong> the wiring became a single annotation. <strong>@ServiceConnection</strong> on a container bean tells Boot to derive <code>spring.datasource.url</code>, username and password from that container automatically - no <code>@DynamicPropertySource</code>, no property names to get wrong. It works for MySQL, PostgreSQL, MongoDB, Redis, Kafka, RabbitMQ and Elasticsearch containers alike. Boot 3.1 also added <code>@ServiceConnection</code>'s development-time counterpart, so <code>spring-boot-testcontainers</code> can start the same containers when you run the application locally. <br><br>

A word on scope: this is <strong>not</strong> a replacement for slice tests. Keep the fast pyramid - unit tests for logic, <code>@WebMvcTest</code> for the web contract - and use Testcontainers for the queries and the schema, where a fake database gives a false answer.`,
            codeExamples: [`<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-testcontainers</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>mysql</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>


// ---- Spring Boot 3.1+ : @ServiceConnection ----
package com.cybage.genworth.insurance.repository;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class PolicyRepositoryMySqlTest {

    @Container
    @ServiceConnection                       // Boot 3.1+ does the wiring
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.36");

    @Autowired private PolicyRepository repository;

    @Test
    void nativeQueryRunsOnRealMySql() {
        assertNotNull(repository.summariseByStatus());
    }
}
// Note "static": a static @Container starts once for the class. A
// non-static one restarts for EVERY test method, which is the usual
// cause of "why is my Testcontainers suite so slow".


// ---- Before 3.1, or for a property @ServiceConnection does not cover ----
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Testcontainers
class PolicyRepositoryLegacyWiringTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("project")
            .withUsername("root")
            .withPassword("root");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",      mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        // Suppliers, not values - they are called after the container starts.
    }
}


// ---- Singleton container: ONE database for the whole build ----
abstract class AbstractContainerTest {

    static final MySQLContainer<?> MYSQL =
            new MySQLContainer<>("mysql:8.0.36").withReuse(true);

    static { MYSQL.start(); }     // started once per JVM, never stopped;
                                  // Ryuk cleans up at exit

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", MYSQL::getJdbcUrl);
        r.add("spring.datasource.username", MYSQL::getUsername);
        r.add("spring.datasource.password", MYSQL::getPassword);
    }
}

// OUTPUT:
// Creating container for image: mysql:8.0.36
// Container mysql:8.0.36 is starting: 3f9c1e...
// Container mysql:8.0.36 started in PT8.412S
// Started PolicyRepositoryMySqlTest in 11.204 seconds
// ...
// Container mysql:8.0.36 started in PT0.031S   <- reused by later classes
//
// FAILURE when Docker is absent:
// java.lang.IllegalStateException: Could not find a valid Docker
// environment. Please see logs and check configuration.
// Guard it: @Testcontainers(disabledWithoutDocker = true) skips instead
// of failing, which keeps the suite runnable on a machine without Docker.`]
        },

        {
            content: `<h3>MockMvc: standaloneSetup versus webAppContextSetup, and its limits</h3>
<code>MockMvc</code> can be built two ways, and the choice decides how much of Spring MVC is real. <br><br>

<table>
<tr><th>Aspect</th><th>standaloneSetup(controller)</th><th>webAppContextSetup(context)</th></tr>
<tr><td>Spring context</td><td>None. You hand it an instance you constructed yourself</td><td>The loaded <code>WebApplicationContext</code> - what <code>@WebMvcTest</code> and <code>@AutoConfigureMockMvc</code> use</td></tr>
<tr><td>Startup</td><td>Milliseconds</td><td>Context startup, then cached</td></tr>
<tr><td>@ControllerAdvice</td><td>Not applied unless you register it explicitly</td><td>Applied - it is a bean</td></tr>
<tr><td>Filters, Spring Security</td><td>Not applied unless added by hand</td><td>Applied</td></tr>
<tr><td>Message converters, validation, formatters</td><td>A minimal default set, not your customised configuration</td><td>Exactly your configuration</td></tr>
<tr><td>What it proves</td><td>The controller method's own logic and its annotations</td><td>The application's real web behaviour</td></tr>
</table>
<br>
The trap with <code>standaloneSetup</code> is that it is <strong>quietly more permissive</strong>. Your custom <code>ObjectMapper</code> with snake-case naming is not there, your <code>@ControllerAdvice</code> is not there, your argument resolver is not there - so the test asserts on behaviour the deployed application does not have. It is a legitimate tool for a controller with no framework interaction, and a source of false confidence everywhere else. Prefer <code>@WebMvcTest</code>. <br><br>

<strong>What MockMvc cannot test at all</strong>, whichever way it is built: it never opens a socket. There is no connector, no HTTP parsing, no chunked transfer, no TLS, no real timeout, no client. Boot 3.2 added <code>MockMvcTester</code> (an AssertJ-flavoured API over the same engine) and <code>WebTestClient</code> can now bind to a <code>MockMvc</code> setup too - but none of that changes the boundary. For anything at the wire level you need <code>RANDOM_PORT</code>.`,
            codeExamples: [`// ---- standaloneSetup: fast, and blind to your configuration ----
class PolicyControllerStandaloneTest {

    private final PolicyService service = Mockito.mock(PolicyService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new PolicyController(service))
                .setControllerAdvice(new GlobalExceptionHandler())  // MUST be
                .setMessageConverters(myConfiguredJacksonConverter()) // explicit
                .build();
    }

    @Test
    void getByIdWorks() throws Exception {
        when(service.getPolicyById(1)).thenReturn(policy());
        mockMvc.perform(get("/api/policies/1")).andExpect(status().isOk());
    }
}
// Forget setControllerAdvice and a PolicyNotFoundException surfaces as a
// raw NestedServletException instead of the 404 the application returns:
//
// OUTPUT:
// jakarta.servlet.ServletException: Request processing failed:
//   com.cybage...PolicyNotFoundException: No policy with id 99
// - a test failure that says nothing about your production behaviour,
//   because production HAS the advice and returns 404 correctly.


// ---- webAppContextSetup: what @WebMvcTest does for you ----
@WebMvcTest(PolicyController.class)
class PolicyControllerSliceTest {
    @Autowired MockMvc mockMvc;      // already webAppContextSetup(context)
    @MockBean PolicyService service;
}

// Building it by hand, when you need to customise:
@SpringBootTest
class PolicyControllerManualSetupTest {

    @Autowired private WebApplicationContext context;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())            // the real filter chain
                .alwaysDo(print())
                .build();
    }
}


// ---- Choosing a client ----
// MockMvc            - servlet stack, no port. Fastest realistic web test.
// MockMvcTester      - Boot 3.2+, same engine, AssertJ assertions:
//                        assertThat(mvc.get().uri("/api/policies/1"))
//                              .hasStatusOk()
//                              .bodyJson().extractingPath("$.name")
//                              .isEqualTo("Rajaram");
// WebTestClient      - fluent, works against WebFlux, a real port, or a
//                      bound MockMvc. The default choice on Boot 3.
// TestRestTemplate   - blocking, RestTemplate-shaped, does not throw on
//                      4xx/5xx. Fine for a servlet app on RANDOM_PORT.

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class PolicyWebTestClientIT {

    @Autowired private WebTestClient client;

    @Test
    void getAllReturnsPolicies() {
        client.get().uri("/api/policies")
              .exchange()
              .expectStatus().isOk()
              .expectHeader().contentType(MediaType.APPLICATION_JSON)
              .expectBodyList(Policy.class).hasSize(2);
    }
}`]
        },

        {
            content: `<h3>What deserves an integration test, and what does not</h3>
Every integration test is a permanent cost: seconds on every build, a database dependency in CI, and a failure that takes longer to diagnose. It earns that cost only when it can see something no cheaper test can. <br><br>

<table>
<tr><th>Scenario</th><th>Which level, and why</th></tr>
<tr><td>Premium calculation, eligibility rules, discount bands, state transitions</td><td><strong>Unit</strong>. Pure logic with branches. An integration test here is slower, harder to read, and finds nothing extra.</td></tr>
<tr><td>Does the endpoint return 404 rather than 500 for a missing policy</td><td><strong>@WebMvcTest</strong>. The status code is produced by framework machinery a unit test never runs.</td></tr>
<tr><td>Does the response JSON match the published API contract</td><td><strong>@WebMvcTest</strong> or <strong>@JsonTest</strong>. Field renames are a classic silent break for consumers.</td></tr>
<tr><td>Does <code>findByStatusAndPremiumAmountGreaterThan</code> actually parse and return the right rows</td><td><strong>@DataJpaTest</strong>, ideally on Testcontainers. A mock cannot fail here, and that is the problem.</td></tr>
<tr><td>Does a native query with vendor-specific SQL work</td><td><strong>Testcontainers</strong>. H2 cannot answer the question.</td></tr>
<tr><td>Does the context start at all with production-like configuration</td><td><strong>One</strong> <code>@SpringBootTest</code> smoke test. The generated <code>contextLoads()</code> is not a formality - it catches missing properties, ambiguous beans and cyclic dependencies.</td></tr>
<tr><td>The two or three journeys the business would notice if broken: create a policy, pay, retrieve it</td><td><strong>@SpringBootTest</strong> end to end. Few, named after the business flow, not after a class.</td></tr>
<tr><td>Every CRUD permutation of every entity, end to end</td><td><strong>No.</strong> This is how a suite reaches forty minutes while catching nothing the layer tests missed.</td></tr>
<tr><td>Third-party payment gateway behaviour</td><td><strong>Not in your build.</strong> Mock the client for your tests; verify the contract separately with WireMock or a consumer-driven contract test.</td></tr>
</table>
<br>
<div class="border">
<strong>A workable ratio</strong>: roughly 70% unit, 20% slice, 10% full integration - not as a target to hit, but as a shape to notice you have inverted.<br>
<strong>The diagnostic question</strong>: if this test fails, will it tell me <em>where</em> the defect is? A failing unit test names a method. A failing end-to-end test names a journey and leaves the search to you.<br>
<strong>The ice-cream cone</strong> - many end-to-end tests, few unit tests - is the common failure shape. It is slow, flaky, and its failures teach nothing, so people start re-running the build instead of reading it. That is the moment a suite stops being an asset.
</div>`,
            codeExamples: [`// ---- Naming and separating, so the fast loop stays fast ----
// *Test  -> surefire, "mvn test"     : unit + slice, no Docker, seconds
// *IT    -> failsafe, "mvn verify"   : full integration, Docker, minutes

PolicyServiceTest          // @ExtendWith(MockitoExtension.class)  0.02 s
PolicyControllerTest       // @WebMvcTest                          1.1 s
PolicyRepositoryTest       // @DataJpaTest + H2                    1.4 s
PolicyRepositoryMySqlIT    // @DataJpaTest + Testcontainers        11 s
PolicyPurchaseJourneyIT    // @SpringBootTest RANDOM_PORT           6 s

<plugin>
  <artifactId>maven-failsafe-plugin</artifactId>
  <executions>
    <execution>
      <goals><goal>integration-test</goal><goal>verify</goal></goals>
    </execution>
  </executions>
</plugin>


// ---- The smoke test that is worth more than it looks ----
@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextIT {

    @Test
    void contextLoads() { }
    // No assertion, and it still fails on: a missing required
    // @ConfigurationProperties value, two beans of one type with no
    // @Primary, a circular dependency, a @Value with no property,
    // a broken @Query in any repository in the application.
}

// OUTPUT of a real failure this catches:
// ***************************
// APPLICATION FAILED TO START
// ***************************
// Description:
// Parameter 0 of constructor in ...PolicyServiceImpl required a single
// bean, but 2 were found:
//   - jpaPolicyRepository: defined in ...
//   - cachingPolicyRepository: defined in ...
// Action:
// Consider marking one of the beans as @Primary, updating the consumer
// to accept multiple beans, or using @Qualifier.
//
// No unit test in the project could have found that.


// ---- An end-to-end test named after the business flow ----
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PolicyPurchaseJourneyIT {

    @Test
    void customerBuysAPolicyPaysAndReceivesConfirmation() {
        // 1. quote  2. accept  3. pay  4. confirm
        // One test, four HTTP calls, real persistence between them.
        // If this is red, the product is broken. That is the bar for
        // an end-to-end test: it should be false only when a customer
        // would notice.
    }
}`]
        },

        {
            content: `<h3>Interview Questions</h3>
<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the practical difference between @WebMvcTest and @SpringBootTest?</td><td>@WebMvcTest applies a fixed allow-list of web auto-configuration and creates only the MVC infrastructure plus the named controllers - typically 25-40 beans, about a second, and no DataSource. @SpringBootTest builds the entire context including JPA, the connection pool and every @Service, which takes several seconds and needs the database to exist. The slice is also far easier to diagnose: its failure points at one controller.</td></tr>
<tr><td>Why is @MockBean described as expensive when the mock itself is cheap?</td><td>The set of bean overrides becomes part of the Spring test context cache key, through the ContextCustomizer that @MockBean contributes. A class with a different combination of mocked beans cannot reuse a cached context and pays a full startup. Hoisting a common set of mocks into a shared abstract base class restores the cache hit.</td></tr>
<tr><td>What goes into the test context cache key?</td><td>The configuration classes or locations, context initializers, active profiles, property source locations and inlined properties, the context loader, the parent context, and all context customizers - which is where @MockBean sets, @DynamicPropertySource, the web environment and the @AutoConfigure* annotations land. Anything that differs in one of those produces a separate context.</td></tr>
<tr><td>When is @DirtiesContext justified, and what does it cost?</td><td>When a test genuinely mutates shared state that would corrupt later tests - shutting down a scheduler, changing a static registry, mutating a singleton's internal state. It closes and evicts the context, so it costs one startup for that class and another for the next class that wanted it. Used as a blanket fix for test pollution it is usually treating the symptom.</td></tr>
<tr><td>Does @DataJpaTest commit anything?</td><td>No. It is meta-annotated @Transactional and the TestContext framework rolls back at the end of each method, so tests are isolated with no cleanup code. @Rollback(false) or @Commit turns that off, at which point cleanup becomes your responsibility.</td></tr>
<tr><td>Which database does @DataJpaTest use, and how do you stop it?</td><td>It implies @AutoConfigureTestDatabase(replace = Replace.ANY), which discards your configured DataSource and substitutes an embedded one - H2, HSQLDB or Derby, whichever is on the classpath. @AutoConfigureTestDatabase(replace = Replace.NONE) keeps the configured DataSource, which is how you point a @DataJpaTest at a Testcontainers instance.</td></tr>
<tr><td>Why is passing a @DataJpaTest against H2 not proof that a query works on MySQL?</td><td>Reserved words, identifier case sensitivity, native SQL functions such as GROUP_CONCAT and JSON_EXTRACT, ON DUPLICATE KEY, strict-mode type coercion, and locking and isolation behaviour all differ. MODE=MySQL narrows the gap and does not close it. Anything vendor-specific has to run against the real engine.</td></tr>
<tr><td>What class of bug can a @DataJpaTest never catch?</td><td>A LazyInitializationException. The test method runs inside an open transaction for its whole duration, so lazy associations always resolve; in production the session closes when the service call returns. Only a test that goes through the web layer end to end reproduces it.</td></tr>
<tr><td>What does Testcontainers give you that an embedded database does not, and what does it cost?</td><td>The real database engine, the real SQL dialect, real locking and real constraints, in a disposable container with a random port that is reaped automatically. It costs several seconds of container startup and requires a Docker daemon on the CI agent - mitigated by static @Container fields, the singleton-container pattern and withReuse(true).</td></tr>
<tr><td>What does @ServiceConnection do?</td><td>On Spring Boot 3.1+, placing it on a Testcontainers container bean makes Boot derive the connection properties - JDBC URL, username, password, or the equivalent for Mongo, Redis, Kafka and others - from the running container automatically, replacing the hand-written @DynamicPropertySource block and the chance of misspelling a property name.</td></tr>
<tr><td>MockMvc standaloneSetup or webAppContextSetup - which and why?</td><td>webAppContextSetup, which is what @WebMvcTest configures, because it uses the real context: your @ControllerAdvice, filters, security chain, message converters and formatters. standaloneSetup constructs the controller yourself with a minimal default MVC configuration, so it is fast but quietly more permissive than production, and tests written against it can assert behaviour the deployed application does not have.</td></tr>
<tr><td>When do you need @SpringBootTest(webEnvironment = RANDOM_PORT) rather than MockMvc?</td><td>When the thing under test lives below the DispatcherServlet: the servlet container itself, connectors, TLS, real timeouts, chunked encoding, or a real HTTP client's behaviour. MockMvc never opens a socket, so nothing at the wire level is exercised by it.</td></tr>
<tr><td>Why does @Transactional not clean up after a RANDOM_PORT integration test?</td><td>The server handles the request on its own thread, in its own transaction, which commits. The test thread's transaction is a separate one and rolling it back takes nothing with it. Over a real socket you need explicit cleanup, a fresh schema per class, or a disposable Testcontainers database.</td></tr>
</table>`
        }
    ]
};
