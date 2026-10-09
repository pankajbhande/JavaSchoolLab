// Spring extras, batch smvc35 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc35Extras: Record<string, Extra> = {
    'mvc-webmvctest': x(
        ['<b>@WebMvcTest</b> is a test slice annotation that starts only the web layer (controllers, advice, filters, converters) and not services or repositories.',
            '<b>MockMvc</b> is auto-configured and injected with <code>@Autowired</code>; you call <code>mockMvc.perform(get(&quot;/x&quot;))</code> without a real server or port.',
            '<b>Collaborators</b> such as services are replaced with <code>@MockBean</code> (or <code>@MockitoBean</code> in newer Spring), so the test checks only the controller.'],
        ['<b>Target one controller</b> with <code>@WebMvcTest(UserController.class)</code> so the context stays small and fast.',
            '<b>Assertions</b> use <code>andExpect(status().isOk())</code>, <code>content()</code> and <code>jsonPath()</code> from the MockMvc result matchers.',
            '<b>Not included</b>: <code>@Service</code>, <code>@Repository</code> and <code>@Component</code> beans are not scanned, so a missing mock gives a NoSuchBeanDefinitionException.'],
        ['<b>Security</b> auto-configuration is applied, so requests may return 401 or 403 unless you add <code>@WithMockUser</code> or a test security config.',
            '<b>Custom beans</b> needed by the slice (a converter, a config class) must be added with <code>@Import</code>.',
            '<b>Speed</b>: slices share a cached context when the configuration is identical, so keep mock sets consistent across test classes.'],
        [['F', 'What does @WebMvcTest load?', 'Only the Spring MVC infrastructure and the controllers, advice and filters; no services or repositories.'],
            ['F', 'How do you fake the service a controller calls?', 'Declare it with @MockBean (or @MockitoBean) and stub it using Mockito when().'],
            ['M', 'Does @WebMvcTest start a Tomcat server?', 'No. MockMvc calls the DispatcherServlet directly in memory.'],
            ['M', 'Why do I get 401 in a @WebMvcTest?', 'Spring Security is auto-configured in the slice; add @WithMockUser or disable filters for the test.'],
            ['S', 'How is the slice context cached?', 'The test context cache key includes the config and mock beans, so identical sets reuse one context.'],
            ['S', 'How do you test a controller that needs a custom bean?', 'Add the bean to the slice with @Import or a @TestConfiguration class.']],
        [['Minimal controller slice test.',
            r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean GreetingService service;

    @Test
    void greets() throws Exception {
        when(service.greet("Asha")).thenReturn("Hello Asha");
        mockMvc.perform(get("/hello").param("name", "Asha"))
            .andExpect(status().isOk())
            .andExpect(content().string("Hello Asha"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Missing mock fails the context.',
                r`@WebMvcTest(HelloController.class)
class BrokenTest {
    @Autowired MockMvc mockMvc;      // no @MockBean for GreetingService
    @Test void load() { }
}

// OUTPUT:
// UnsatisfiedDependencyException: Error creating bean 'helloController':
// No qualifying bean of type 'GreetingService' available`]],
        [['JSON endpoint check.',
            r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserService users;

    @Test
    void returnsUser() throws Exception {
        when(users.find(1L)).thenReturn(new User(1L, "Ravi"));
        mvc.perform(get("/users/1").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Ravi"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Not found mapping.',
                r`mvc.perform(get("/nope")).andExpect(status().isNotFound());

// OUTPUT:
// MockHttpServletResponse: Status = 404 (assertion passed)`]]
    ),
    'mvc-springboottest': x(
        ['<b>@SpringBootTest</b> loads the full application context, as if the app were started, so it tests real wiring of controllers, services and repositories.',
            '<b>webEnvironment</b> controls the server: <code>MOCK</code> (default, no real port), <code>RANDOM_PORT</code> and <code>DEFINED_PORT</code> start an embedded server.',
            '<b>Slower than slices</b>, so use it for a few end-to-end checks and use <code>@WebMvcTest</code> for most controller tests.'],
        ['<b>RANDOM_PORT</b> with <code>TestRestTemplate</code> or <code>WebTestClient</code> sends real HTTP requests; inject the port with <code>@LocalServerPort</code>.',
            '<b>@AutoConfigureMockMvc</b> adds MockMvc to a full-context test when you want speed without a real server.',
            '<b>Profiles and properties</b>: use <code>@ActiveProfiles(&quot;test&quot;)</code> or <code>@TestPropertySource</code> to point at a test database.'],
        ['<b>Context caching</b>: Spring reuses a context across test classes with the same config; <code>@MockBean</code> or <code>@DirtiesContext</code> create new contexts and slow the suite.',
            '<b>Real databases</b>: prefer Testcontainers over H2 when behavior must match production, wired with <code>@ServiceConnection</code> in Boot 3.1+.',
            '<b>Transactions</b>: <code>@Transactional</code> rolls back in MOCK mode but not with RANDOM_PORT because the server runs on another thread.'],
        [['F', 'What does @SpringBootTest do?', 'It starts the whole application context for integration tests.'],
            ['F', 'Default webEnvironment?', 'MOCK, which provides a mock servlet environment and no real port.'],
            ['M', 'How do you call the app over real HTTP in a test?', 'Use webEnvironment RANDOM_PORT and TestRestTemplate or WebTestClient.'],
            ['M', 'When use @AutoConfigureMockMvc?', 'To get a MockMvc bean in a full-context test without opening a port.'],
            ['S', 'Why is @Transactional rollback unreliable with RANDOM_PORT?', 'The server handles the request on a different thread, so it uses its own transaction.'],
            ['S', 'Why do too many @MockBean variants slow the build?', 'Each distinct set creates a new cached application context.']],
        [['Full context with MockMvc.',
            r`@SpringBootTest
@AutoConfigureMockMvc
class OrderFlowTest {
    @Autowired MockMvc mvc;

    @Test
    void createsOrder() throws Exception {
        mvc.perform(post("/orders").contentType("application/json")
                .content("{\"item\":\"pen\",\"qty\":2}"))
            .andExpect(status().isCreated());
    }
}

// OUTPUT:
// Started OrderFlowTest in 3.1 seconds (varies)
// Tests run: 1, Failures: 0`],
            ['Real HTTP on a random port.',
                r`@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class HttpTest {
    @Autowired TestRestTemplate rest;
    @LocalServerPort int port;

    @Test
    void health() {
        var res = rest.getForEntity("/actuator/health", String.class);
        System.out.println(port + " " + res.getStatusCode());
    }
}

// OUTPUT: (varies)
// 54321 200 OK`]],
        [['Override a property in a test.',
            r`@SpringBootTest(properties = "app.feature.enabled=false")
class FeatureOffTest {
    @Value("app.feature.enabled") String flag;   // plain literal here
    @Test void ctx() { }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Test profile.',
                r`@SpringBootTest
@ActiveProfiles("test")
class ProfileTest {
    @Autowired Environment env;
    @Test void profile() {
        System.out.println(Arrays.toString(env.getActiveProfiles()));
    }
}

// OUTPUT:
// [test]`]]
    ),
    'mvc-controller-mocking': x(
        ['<b>Controller mocking</b> means testing a controller in isolation by replacing its dependencies (services) with mocks, so only the web logic is verified.',
            '<b>@MockBean</b> puts a Mockito mock into the Spring context; <code>when(...).thenReturn(...)</code> defines its answers.',
            '<b>verify</b> checks that the controller called the service as expected, for example <code>verify(service).save(any())</code>.'],
        ['<b>Two styles</b>: <code>@WebMvcTest</code> with <code>@MockBean</code>, or standalone <code>MockMvcBuilders.standaloneSetup(controller)</code> with <code>@Mock</code> and no Spring context.',
            '<b>Stubbing errors</b> with <code>thenThrow(...)</code> lets you check that the controller or advice maps the exception to the right status.',
            '<b>ArgumentCaptor</b> captures the object the controller built from the request so you can assert on its fields.'],
        ['<b>Do not over-mock</b>: asserting every call couples tests to implementation; verify only meaningful interactions.',
            '<b>Strict stubs</b>: Mockito reports unused stubs with MockitoExtension, which catches dead test setup.',
            '<b>Standalone setup</b> skips advice, converters and validation unless you add them (<code>setControllerAdvice</code>, <code>setValidator</code>).'],
        [['F', 'Why mock the service when testing a controller?', 'So the test checks only controller behavior and does not depend on business logic or a database.'],
            ['F', 'Which annotation adds a mock to the Spring context?', '@MockBean (or @MockitoBean in newer Spring versions).'],
            ['M', 'Difference between @Mock and @MockBean?', '@Mock is plain Mockito with no Spring; @MockBean registers the mock as a bean in the application context.'],
            ['M', 'How do you check what the controller passed to the service?', 'Use ArgumentCaptor with verify().'],
            ['S', 'What is lost in standaloneSetup?', 'Spring context features such as advice, validation and message converters unless added by hand.'],
            ['S', 'Why can verifying everything be harmful?', 'It ties tests to implementation details and breaks on harmless refactoring.']],
        [['Stub and verify.',
            r`@WebMvcTest(UserController.class)
class UserMockTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test
    void getUser() throws Exception {
        when(service.find(7L)).thenReturn(new User(7L, "Meera"));
        mvc.perform(get("/users/7")).andExpect(status().isOk());
        verify(service).find(7L);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Standalone setup without Spring.',
                r`@ExtendWith(MockitoExtension.class)
class StandaloneTest {
    @Mock UserService service;
    @InjectMocks UserController controller;
    MockMvc mvc;

    @BeforeEach void init() {
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }
    @Test void ok() throws Exception {
        when(service.find(1L)).thenReturn(new User(1L, "A"));
        mvc.perform(get("/users/1")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (no Spring context started)`]],
        [['Capture the argument.',
            r`ArgumentCaptor<User> cap = ArgumentCaptor.forClass(User.class);
mvc.perform(post("/users").contentType("application/json")
        .content("{\"name\":\"Dev\"}"))
    .andExpect(status().isCreated());
verify(service).save(cap.capture());
System.out.println(cap.getValue().getName());

// OUTPUT:
// Dev`],
            ['Stub an exception.',
                r`when(service.find(99L)).thenThrow(new UserNotFoundException(99L));
mvc.perform(get("/users/99")).andExpect(status().isNotFound());

// OUTPUT:
// Status = 404 (handled by @RestControllerAdvice)`]]
    ),
    'mvc-request-testing': x(
        ['<b>Request testing</b> builds an HTTP request with <code>MockMvcRequestBuilders</code> (<code>get</code>, <code>post</code>, <code>put</code>, <code>delete</code>) and sends it with <code>perform</code>.',
            '<b>Request data</b> is set with <code>param</code>, <code>header</code>, <code>contentType</code>, <code>content</code>, <code>cookie</code> and path variables in the URL template.',
            '<b>Goal</b>: prove that mappings, binding of path, query, header and body values, and content negotiation work.'],
        ['<b>Path variables</b>: <code>get(&quot;/users/{id}&quot;, 5)</code> expands the template with the arguments.',
            '<b>JSON body</b>: set <code>contentType(APPLICATION_JSON)</code> and pass a string, or serialize an object with <code>ObjectMapper</code>.',
            '<b>Form and multipart</b>: use <code>param</code> for forms and <code>multipart(&quot;/upload&quot;).file(...)</code> for uploads.'],
        ['<b>Missing content type</b> gives 415 Unsupported Media Type; a missing <code>@RequestParam</code> gives 400.',
            '<b>CSRF</b>: with Spring Security, POST tests need <code>.with(csrf())</code> or they return 403.',
            '<b>Print on failure</b>: <code>andDo(print())</code> shows the full request and response for debugging.'],
        [['F', 'How do you send a GET with a query parameter?', 'mockMvc.perform(get("/search").param("q", "java")).'],
            ['F', 'Which method sends the request?', 'MockMvc.perform(RequestBuilder).'],
            ['M', 'Why does a POST test return 415?', 'The request has no matching Content-Type, for example application/json is missing.'],
            ['M', 'How do you send multipart data?', 'Use MockMvcRequestBuilders.multipart with a MockMultipartFile.'],
            ['S', 'Why does a secured POST return 403 in tests?', 'CSRF protection needs a token; add with(csrf()).'],
            ['S', 'How do you test a custom header binding?', 'Add header("X-Tenant", "a") and assert the controller used it.']],
        [['Query, path and header.',
            r`mvc.perform(get("/users/{id}", 5)
        .param("expand", "roles")
        .header("X-Tenant", "acme"))
    .andExpect(status().isOk());

// OUTPUT:
// GET /users/5?expand=roles  X-Tenant: acme  -> 200`],
            ['JSON POST with ObjectMapper.',
                r`@Autowired ObjectMapper om;

mvc.perform(post("/users")
        .contentType(MediaType.APPLICATION_JSON)
        .content(om.writeValueAsString(new UserDto("Asha", 25))))
    .andExpect(status().isCreated());

// OUTPUT:
// POST /users  {"name":"Asha","age":25} -> 201`]],
        [['File upload.',
            r`MockMultipartFile f = new MockMultipartFile(
    "file", "a.txt", "text/plain", "hello".getBytes());
mvc.perform(multipart("/upload").file(f))
    .andExpect(status().isOk());

// OUTPUT:
// POST /upload (multipart) -> 200`],
            ['Debug with print().',
                r`mvc.perform(get("/ping")).andDo(print());

// OUTPUT:
// MockHttpServletRequest: HTTP Method = GET, Request URI = /ping
// MockHttpServletResponse: Status = 200, Body = pong`]]
    ),
    'mvc-response-testing': x(
        ['<b>Response testing</b> asserts the result of <code>perform</code> with <code>andExpect</code> and matchers for status, headers, content type and body.',
            '<b>Common matchers</b>: <code>status()</code>, <code>header()</code>, <code>content()</code>, <code>jsonPath()</code>, <code>view()</code>, <code>model()</code> and <code>redirectedUrl()</code>.',
            '<b>jsonPath</b> reads values from the JSON body, for example <code>jsonPath(&quot;$.items.length()&quot;).value(3)</code>.'],
        ['<b>Status helpers</b>: <code>isOk()</code>, <code>isCreated()</code>, <code>isBadRequest()</code>, <code>isNotFound()</code> read better than raw numbers.',
            '<b>Whole-body compare</b>: <code>content().json(expected)</code> compares JSON leniently by default, ignoring field order.',
            '<b>View tests</b>: for MVC pages use <code>view().name(&quot;home&quot;)</code> and <code>model().attribute(&quot;user&quot;, ...)</code>.'],
        ['<b>Strict vs lenient</b>: <code>content().json(json, true)</code> is strict and fails on extra fields.',
            '<b>Extract the result</b> with <code>andReturn()</code> when you need to deserialize the body and assert in plain Java.',
            '<b>AssertJ style</b>: Spring 6.2 adds <code>MockMvcTester</code> for fluent assertions, but classic matchers remain the common choice.'],
        [['F', 'How do you check the status code?', 'andExpect(status().isOk()) or another status matcher.'],
            ['F', 'How do you check a JSON field?', 'andExpect(jsonPath("$.name").value("Ravi")).'],
            ['M', 'What does content().json() do?', 'Compares the body with expected JSON, leniently unless strict mode is set.'],
            ['M', 'How do you test a redirect?', 'Use status().is3xxRedirection() and redirectedUrl("/target").'],
            ['S', 'How do you read the body into an object?', 'Call andReturn() and use ObjectMapper on getResponse().getContentAsString().'],
            ['S', 'Why prefer jsonPath over string equality?', 'It is independent of field order and whitespace and targets only the field you care about.']],
        [['Status, header and JSON.',
            r`mvc.perform(get("/users/1"))
    .andExpect(status().isOk())
    .andExpect(header().string("Content-Type", "application/json"))
    .andExpect(jsonPath("$.id").value(1))
    .andExpect(jsonPath("$.roles.length()").value(2));

// OUTPUT:
// Status = 200, Content-Type = application/json
// Body = {"id":1,"name":"Ravi","roles":["USER","ADMIN"]}`],
            ['View and model.',
                r`mvc.perform(get("/home"))
    .andExpect(status().isOk())
    .andExpect(view().name("home"))
    .andExpect(model().attributeExists("user"));

// OUTPUT:
// View name = home, Model = {user=User[name=Ravi]}`]],
        [['Redirect after POST.',
            r`mvc.perform(post("/orders").param("item", "pen"))
    .andExpect(status().is3xxRedirection())
    .andExpect(redirectedUrl("/orders/10"));

// OUTPUT:
// Status = 302, Redirected URL = /orders/10`],
            ['Read body into an object.',
                r`MvcResult res = mvc.perform(get("/users/1")).andReturn();
User u = om.readValue(res.getResponse().getContentAsString(), User.class);
System.out.println(u.getName());

// OUTPUT:
// Ravi`]]
    ),
    'mvc-exception-testing': x(
        ['<b>Exception testing</b> checks that errors thrown by controllers or services are turned into the right HTTP status and body, usually by <code>@ExceptionHandler</code> or <code>@RestControllerAdvice</code>.',
            '<b>Stub a failure</b> with <code>when(service.find(9L)).thenThrow(new NotFoundException())</code> and assert <code>status().isNotFound()</code>.',
            '<b>@WebMvcTest</b> includes <code>@ControllerAdvice</code> beans automatically, so the real error mapping is exercised.'],
        ['<b>Error body</b>: assert the JSON that your advice returns, such as <code>jsonPath(&quot;$.message&quot;)</code>, or an RFC 7807 <code>ProblemDetail</code> with <code>$.title</code>.',
            '<b>Framework exceptions</b> map to codes by default: <code>MethodArgumentNotValidException</code> to 400, <code>HttpRequestMethodNotSupportedException</code> to 405.',
            '<b>Unhandled exceptions</b> surface from MockMvc as a <code>ServletException</code> (NestedServletException in old versions) instead of a 500 response.'],
        ['<b>assertThrows trap</b>: with MockMvc an unhandled exception is thrown by <code>perform</code>, so wrap the call in <code>assertThatThrownBy</code> to test it.',
            '<b>resolvedException()</b> returns the exception that a resolver handled, letting you assert its type.',
            '<b>Do not leak</b> stack traces: assert that the body has no <code>trace</code> field in production-like config.'],
        [['F', 'How do you test that a missing item returns 404?', 'Stub the service to throw a not-found exception and expect status().isNotFound().'],
            ['F', 'What converts an exception to a response?', '@ExceptionHandler methods, usually in a @RestControllerAdvice.'],
            ['M', 'What happens to an unhandled exception in MockMvc?', 'perform rethrows it as a ServletException, no 500 response is produced.'],
            ['M', 'How do you check which exception was resolved?', 'andExpect(result -> assertThat(result.getResolvedException()).isInstanceOf(X.class)).'],
            ['S', 'Why test the advice with the controller?', 'Because the mapping from exception to status and body is part of the API contract.'],
            ['S', 'How do you verify a ProblemDetail response?', 'Assert content type application/problem+json and fields like $.status and $.title.']],
        [['Not found mapped by advice.',
            r`when(service.find(9L)).thenThrow(new UserNotFoundException(9L));
mvc.perform(get("/users/9"))
    .andExpect(status().isNotFound())
    .andExpect(jsonPath("$.message").value("User 9 not found"));

// OUTPUT:
// Status = 404
// Body = {"message":"User 9 not found"}`],
            ['Unhandled exception.',
                r`when(service.find(1L)).thenThrow(new IllegalStateException("boom"));
assertThatThrownBy(() -> mvc.perform(get("/users/1")))
    .hasRootCauseInstanceOf(IllegalStateException.class);

// OUTPUT:
// ServletException: Request processing failed (assertion passed)`]],
        [['Resolved exception type.',
            r`mvc.perform(get("/users/abc"))
    .andExpect(status().isBadRequest())
    .andExpect(result -> assertThat(result.getResolvedException())
        .isInstanceOf(MethodArgumentTypeMismatchException.class));

// OUTPUT:
// Status = 400, resolved = MethodArgumentTypeMismatchException`],
            ['Method not allowed.',
                r`mvc.perform(delete("/users/1")).andExpect(status().isMethodNotAllowed());

// OUTPUT:
// Status = 405, Allow = GET,PUT`]]
    ),
    'mvc-validation-testing': x(
        ['<b>Validation testing</b> sends valid and invalid input and asserts that Bean Validation (<code>@Valid</code>, <code>@NotBlank</code>, <code>@Size</code>) rejects bad data with HTTP 400.',
            '<b>Constraint annotations</b> on a DTO are checked when the controller parameter has <code>@Valid</code> or <code>@Validated</code>.',
            '<b>Failure type</b>: a bad <code>@RequestBody</code> throws <code>MethodArgumentNotValidException</code>, which Spring maps to 400 by default.'],
        ['<b>Check field errors</b>: with an advice returning a map, assert <code>jsonPath(&quot;$.errors.name&quot;)</code>; for forms use <code>model().attributeHasFieldErrors(&quot;user&quot;, &quot;name&quot;)</code>.',
            '<b>Unit-test the DTO</b> alone with <code>Validation.buildDefaultValidatorFactory().getValidator()</code> to test constraints without MVC.',
            '<b>Path and query</b> constraints need <code>@Validated</code> on the controller class and give <code>ConstraintViolationException</code> (400 in Spring 6.1+ with HandlerMethodValidationException).'],
        ['<b>Missing @Valid</b> means no validation at all, a silent bug that only a negative test finds.',
            '<b>Test both sides</b>: one valid request expecting 201 and several invalid ones, each with a single broken field.',
            '<b>Custom validators</b> that need beans work in <code>@WebMvcTest</code> only if their dependencies are mocked or imported.'],
        [['F', 'What does @Valid do on a controller parameter?', 'It triggers Bean Validation on the bound object before the method runs.'],
            ['F', 'Which status for invalid input?', '400 Bad Request.'],
            ['M', 'Which exception is thrown for an invalid @RequestBody?', 'MethodArgumentNotValidException.'],
            ['M', 'How do you test a DTO constraint without MVC?', 'Create a Validator from the default factory and call validate on the object.'],
            ['S', 'Why would an invalid request return 201?', 'The @Valid annotation is missing on the parameter, so nothing was checked.'],
            ['S', 'How are query parameter constraints validated?', 'Put @Validated on the class and constraints on the parameters; failures raise a validation exception mapped to 400.']],
        [['Invalid body returns 400.',
            r`mvc.perform(post("/users").contentType("application/json")
        .content("{\"name\":\"\",\"age\":-1}"))
    .andExpect(status().isBadRequest())
    .andExpect(jsonPath("$.errors.name").exists());

// OUTPUT:
// Status = 400
// Body = {"errors":{"name":"must not be blank","age":"must be at least 0"}}`],
            ['DTO validator unit test.',
                r`Validator v = Validation.buildDefaultValidatorFactory().getValidator();
var violations = v.validate(new UserDto("", 25));
violations.forEach(c -> System.out.println(c.getPropertyPath()
    + " " + c.getMessage()));

// OUTPUT:
// name must not be blank`]],
        [['Valid request passes.',
            r`mvc.perform(post("/users").contentType("application/json")
        .content("{\"name\":\"Asha\",\"age\":25}"))
    .andExpect(status().isCreated());

// OUTPUT:
// Status = 201`],
            ['Form field error.',
                r`mvc.perform(post("/register").param("email", "bad"))
    .andExpect(status().isOk())
    .andExpect(model().attributeHasFieldErrors("form", "email"))
    .andExpect(view().name("register"));

// OUTPUT:
// Form redisplayed with field error on email`]]
    ),
    'mvc-security-testing': x(
        ['<b>Security testing</b> checks that endpoints reject anonymous users and allow the right roles, using <code>spring-security-test</code> with MockMvc.',
            '<b>@WithMockUser</b> runs a test as a fake logged-in user: <code>@WithMockUser(username = &quot;admin&quot;, roles = &quot;ADMIN&quot;)</code>.',
            '<b>Expected codes</b>: 401 for unauthenticated REST calls, 403 for an authenticated user without permission, and a redirect to login for form login.'],
        ['<b>Request post-processors</b>: <code>.with(user(&quot;bob&quot;).roles(&quot;USER&quot;))</code>, <code>.with(csrf())</code> and <code>.with(jwt())</code> shape a single request.',
            '<b>Setup</b>: <code>@WebMvcTest</code> applies the security filter chain when your <code>SecurityFilterChain</code> bean is imported with <code>@Import</code>.',
            '<b>Method security</b>: <code>@PreAuthorize</code> can be tested with <code>@WithMockUser</code> in a <code>@SpringBootTest</code> or slice that enables it.'],
        ['<b>CSRF</b>: POST, PUT and DELETE return 403 without <code>.with(csrf())</code> even for an authorized user.',
            '<b>Silent pass</b>: forgetting to import the security config in a slice tests the default config, not yours.',
            '<b>Custom principal</b>: use <code>@WithUserDetails</code> or a custom annotation with <code>@WithSecurityContext</code> when your code reads a custom user type.'],
        [['F', 'What is @WithMockUser?', 'An annotation that runs the test with a fake authenticated user and chosen roles.'],
            ['F', 'Status for an anonymous call to a secured API?', '401 Unauthorized (or a redirect to login for form login).'],
            ['M', 'Why does my POST return 403 for an admin?', 'CSRF protection is on and the request lacks a CSRF token; add with(csrf()).'],
            ['M', 'How do you set the user on one request only?', 'Use the request post-processor user("name").roles("USER") via with().'],
            ['S', 'How do you test @PreAuthorize rules?', 'Enable method security in the test context and run with different @WithMockUser roles, expecting AccessDeniedException or 403.'],
            ['S', 'How do you test JWT-secured resource servers?', 'Use SecurityMockMvcRequestPostProcessors.jwt() to supply claims and authorities without a real token.']],
        [['Anonymous vs admin.',
            r`@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminSecurityTest {
    @Autowired MockMvc mvc;

    @Test void anonymousDenied() throws Exception {
        mvc.perform(get("/admin")).andExpect(status().isUnauthorized());
    }
    @Test @WithMockUser(roles = "ADMIN")
    void adminAllowed() throws Exception {
        mvc.perform(get("/admin")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0`],
            ['CSRF on POST.',
                r`mvc.perform(post("/admin/users")
        .with(user("root").roles("ADMIN"))
        .with(csrf())
        .contentType("application/json").content("{}"))
    .andExpect(status().isCreated());

// OUTPUT:
// Status = 201 (403 without csrf())`]],
        [['Role forbidden.',
            r`mvc.perform(get("/admin").with(user("bob").roles("USER")))
    .andExpect(status().isForbidden());

// OUTPUT:
// Status = 403`],
            ['JWT resource server.',
                r`mvc.perform(get("/api/me")
        .with(jwt().jwt(j -> j.subject("u1")).authorities(
            new SimpleGrantedAuthority("SCOPE_read"))))
    .andExpect(status().isOk());

// OUTPUT:
// Status = 200, subject = u1`]]
    ),
    'mvc-slf4j': x(
        ['<b>SLF4J</b> (Simple Logging Facade for Java) is a common logging API; your code logs through it and a backend such as Logback does the real work.',
            '<b>Usage</b>: <code>private static final Logger log = LoggerFactory.getLogger(MyClass.class);</code>, or the Lombok annotation <code>@Slf4j</code>.',
            '<b>Levels</b> from low to high: <code>TRACE</code>, <code>DEBUG</code>, <code>INFO</code>, <code>WARN</code>, <code>ERROR</code>; Spring Boot logs at INFO by default.'],
        ['<b>Placeholders</b>: <code>log.info(&quot;User {} logged in&quot;, name)</code> builds the message only when the level is enabled, so avoid string concatenation.',
            '<b>Exceptions</b>: pass the throwable as the last argument, <code>log.error(&quot;Failed {}&quot;, id, ex)</code>, to log the stack trace.',
            '<b>Set levels</b> in <code>application.properties</code>: <code>logging.level.com.shop=DEBUG</code> or <code>logging.level.root=WARN</code>.'],
        ['<b>Facade</b>: SLF4J has no output of its own; the binding on the classpath (Logback in Boot) decides format and destination.',
            '<b>MDC</b> (Mapped Diagnostic Context) adds per-request data such as a request id to every log line.',
            '<b>Never log secrets</b> such as passwords, tokens or full card numbers, and be careful with personal data.'],
        [['F', 'What is SLF4J?', 'A logging facade API that lets code log without depending on one logging library.'],
            ['F', 'Why use {} placeholders?', 'The message is only built if the level is enabled, which is faster than concatenation.'],
            ['M', 'What is the default log level in Spring Boot?', 'INFO.'],
            ['M', 'How do you log an exception with its stack trace?', 'Pass the exception as the last argument to log.error.'],
            ['S', 'What is MDC for?', 'It stores thread-local key-value data that the log pattern prints on every line, such as a correlation id.'],
            ['S', 'What problem do multiple SLF4J bindings cause?', 'Two backends on the classpath give a warning and only one is used, so exclude the extra one.']],
        [['Logger in a controller.',
            r`@RestController
class HelloController {
    private static final Logger log =
        LoggerFactory.getLogger(HelloController.class);

    @GetMapping("/hello")
    String hello(@RequestParam String name) {
        log.info("Hello requested for {}", name);
        log.debug("debug detail, not shown at INFO");
        return "Hello " + name;
    }
}

// OUTPUT: (timestamp and pid vary)
// 2026-10-08T10:00:00.000  INFO 4321 --- [nio-8080-exec-1] c.s.HelloController : Hello requested for Asha`],
            ['Logging an exception.',
                r`try {
    service.pay(42L);
} catch (PaymentException ex) {
    log.error("Payment {} failed", 42L, ex);
}

// OUTPUT:
// ERROR ... c.s.PayController : Payment 42 failed
// com.shop.PaymentException: card declined
//     at com.shop.PayService.pay(PayService.java:21)`]],
        [['Lombok shortcut.',
            r`@Slf4j
@Service
class OrderService {
    void place(long id) {
        log.info("Placing order {}", id);
    }
}

// OUTPUT:
// INFO ... c.s.OrderService : Placing order 7`],
            ['Guard for costly arguments.',
                r`if (log.isDebugEnabled()) {
    log.debug("Cart dump: {}", cart.toJson());   // costly call
}

// OUTPUT:
// (nothing printed at INFO; dump printed only when DEBUG is on)`]]
    ),
    'mvc-logback': x(
        ['<b>Logback</b> is the default logging backend of Spring Boot (through <code>spring-boot-starter-logging</code>) and the native implementation of SLF4J.',
            '<b>Appenders</b> decide where logs go (console, file, rolling file) and <b>encoders or layouts</b> decide the format of each line.',
            '<b>Configuration</b> can be simple properties (<code>logging.file.name</code>, <code>logging.level.*</code>) or a full <code>logback-spring.xml</code> in <code>src/main/resources</code>.'],
        ['<b>Prefer logback-spring.xml</b> over <code>logback.xml</code>, because the <code>-spring</code> name lets you use <code>&lt;springProfile&gt;</code> and Spring properties.',
            '<b>Rolling files</b>: <code>RollingFileAppender</code> with <code>SizeAndTimeBasedRollingPolicy</code> rotates by day and size and limits history with <code>maxHistory</code>.',
            '<b>Pattern</b> tokens: <code>%d</code> date, <code>%-5level</code> level, <code>%thread</code>, <code>%logger{36}</code>, <code>%msg%n</code>, <code>%X{key}</code> for MDC.'],
        ['<b>AsyncAppender</b> moves disk writes to another thread so request threads are not blocked; set a queue size and a discard policy.',
            '<b>JSON logs</b> (for ELK or cloud) can use an encoder such as the logstash-logback-encoder, or the structured logging support in Spring Boot 3.4+.',
            '<b>Runtime levels</b>: change a level without restart through the Actuator <code>/actuator/loggers</code> endpoint.'],
        [['F', 'Which logging library does Spring Boot use by default?', 'Logback, via spring-boot-starter-logging, with SLF4J as the API.'],
            ['F', 'How do you write logs to a file?', 'Set logging.file.name in application.properties or add a FileAppender in logback-spring.xml.'],
            ['M', 'Why name the file logback-spring.xml?', 'Spring loads it later and supports springProfile and property substitution.'],
            ['M', 'What does a RollingFileAppender do?', 'It writes to a file and starts a new one by time or size, keeping a limited history.'],
            ['S', 'How do you stop logging from slowing requests?', 'Use an AsyncAppender with a bounded queue and an acceptable discard policy.'],
            ['S', 'How do you change a log level on a running app?', 'POST to /actuator/loggers/{name} with a configuredLevel, if the endpoint is exposed.']],
        [['Properties-only configuration.',
            r`# application.properties
logging.level.root=INFO
logging.level.com.shop=DEBUG
logging.file.name=logs/app.log
logging.logback.rollingpolicy.max-history=14
logging.logback.rollingpolicy.max-file-size=10MB

# OUTPUT:
# logs/app.log created; com.shop logs at DEBUG, others at INFO`],
            ['logback-spring.xml with profiles.',
                r`<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss} %-5level [%thread] %logger{30} - %msg%n</pattern>
    </encoder>
  </appender>
  <springProfile name="dev">
    <logger name="com.shop" level="DEBUG"/>
  </springProfile>
  <root level="INFO"><appender-ref ref="CONSOLE"/></root>
</configuration>

<!-- OUTPUT -->
// 10:00:01 INFO  [main] c.s.ShopApplication - Started ShopApplication`]],
        [['Rolling file appender.',
            r`<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
  <file>logs/app.log</file>
  <rollingPolicy
      class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
    <fileNamePattern>logs/app.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
    <maxFileSize>10MB</maxFileSize>
    <maxHistory>14</maxHistory>
  </rollingPolicy>
  <encoder><pattern>%d %-5level %logger{30} - %msg%n</pattern></encoder>
</appender>

<!-- OUTPUT -->
// logs/app.log, logs/app.2026-10-07.0.log, ... (14 days kept)`],
            ['MDC request id.',
                r`MDC.put("reqId", UUID.randomUUID().toString());
try {
    log.info("Handling request");
} finally {
    MDC.clear();
}
// pattern: %d %-5level [%X{reqId}] %msg%n

// OUTPUT: (id varies)
// 2026-10-08 10:00:00 INFO  [3f2a9c1e-...] Handling request`]]
    )
};

export const smvc35Deep: Record<string, Deep> = {
    'mvc-webmvctest': dv(
        [`<p>@WebMvcTest is a slice: a meta-annotation that limits auto-configuration.</p><ul><li><b>Meta-annotations:</b> it carries <code>@BootstrapWith(WebMvcTestContextBootstrapper)</code>, <code>@ExtendWith(SpringExtension)</code> and <code>@AutoConfigureWebMvc</code>.</li><li><b>Type filter:</b> a <code>TypeExcludeFilter</code> keeps only <code>@Controller</code>, <code>@ControllerAdvice</code>, <code>@JsonComponent</code>, <code>Converter</code>, <code>Filter</code>, <code>WebMvcConfigurer</code> and similar beans.</li><li><b>Auto-config:</b> only the imports listed for the slice are applied, so no DataSource or JPA.</li><li><b>MockMvc:</b> built from the web application context and wired to the DispatcherServlet with no network.</li></ul>`,
            r`@WebMvcTest(OrderController.class)
class SliceTest {
    @Autowired ApplicationContext ctx;

    @Test void sliceContents() {
        System.out.println(ctx.containsBean("orderController"));
        System.out.println(ctx.containsBean("orderService"));
    }
}

// OUTPUT:
// true
// false`],
        [`<p>Variants and options:</p><ul><li><code>@WebMvcTest</code> with no class scans all controllers.</li><li><code>@WebMvcTest(controllers = {A.class, B.class})</code> targets several.</li><li><code>@AutoConfigureMockMvc(addFilters = false)</code> skips security filters.</li><li><code>@MockBean</code> / <code>@MockitoBean</code>, <code>@SpyBean</code> for collaborators.</li><li><code>@Import</code> and <code>@TestConfiguration</code> for extra beans.</li><li><code>@WithMockUser</code> for authenticated tests.</li><li>Properties via <code>properties = ...</code>.</li></ul>`,
            r`@WebMvcTest(controllers = {UserController.class, AdminController.class},
        properties = "spring.mvc.problemdetails.enabled=true")
@AutoConfigureMockMvc(addFilters = false)
@Import(JacksonConfig.class)
class OptionsTest {
    @Autowired MockMvc mvc;
    @MockBean UserService users;
    @MockBean AdminService admins;
}

// OUTPUT:
// Context started with 2 controllers, security filters disabled`],
        [`<p>Common mistakes:</p><ul><li><b>Missing @MockBean</b> gives UnsatisfiedDependencyException; add a mock for each constructor dependency.</li><li><b>Expecting JPA</b>: repositories are not loaded; mock them or use <code>@DataJpaTest</code> separately.</li><li><b>401/403 surprise</b>: add <code>@WithMockUser</code>, <code>csrf()</code> or import your security config.</li><li><b>Using @SpringBootTest</b> for everything makes the suite slow.</li></ul>`,
            r`// WRONG: controller needs UserService, but no mock declared
@WebMvcTest(UserController.class)
class BadTest { @Autowired MockMvc mvc; }

// RIGHT
@WebMvcTest(UserController.class)
class GoodTest {
    @Autowired MockMvc mvc;
    @MockBean UserService users;
}

// OUTPUT:
// BadTest: UnsatisfiedDependencyException (UserService)
// GoodTest: context loads`],
        [`<p>Performance:</p><ul><li>Slices start in a fraction of the time of a full context because few beans exist.</li><li>The context cache is keyed by configuration, so share the same <code>@MockBean</code> set across classes via a common base class.</li><li>Avoid <code>@DirtiesContext</code> unless state truly leaks.</li><li>Run with parallel test classes only if tests do not share mutable mocks.</li></ul>`,
            r`abstract class WebTestBase {
    @Autowired protected MockMvc mvc;
    @MockBean protected UserService users;     // same set in every subclass
    @MockBean protected OrderService orders;   // -> one cached context
}

@WebMvcTest
class AuthTest extends WebTestBase { }
@WebMvcTest
class ProfileTest extends WebTestBase { }

// OUTPUT:
// Context created once, reused by both classes (cache hit in logs)`],
        [`<p>Scenario: a team has 120 controller tests and the build takes 9 minutes because each uses @SpringBootTest.</p><ul><li>Move controller tests to <code>@WebMvcTest</code> with a shared base class.</li><li>Keep a handful of <code>@SpringBootTest</code> tests for the critical flows.</li><li>The controller suite drops to about a minute.</li></ul>`,
            r`// Before: @SpringBootTest + @AutoConfigureMockMvc on 120 classes
// After: @WebMvcTest(X.class) + shared mocks on 118 classes,
//        2 end-to-end @SpringBootTest classes kept.

// OUTPUT: (varies)
// Before: Tests run: 122, Time: 9 min 10 s
// After:  Tests run: 122, Time: 1 min 05 s`]
    ),
    'mvc-springboottest': dv(
        [`<p>How @SpringBootTest builds its context:</p><ul><li><b>Bootstrapper:</b> <code>SpringBootTestContextBootstrapper</code> finds the <code>@SpringBootConfiguration</code> by searching up from the test package.</li><li><b>Environment:</b> MOCK creates a mock servlet web application context; RANDOM_PORT starts the embedded Tomcat on port 0.</li><li><b>Properties:</b> the order is test properties, command-line args, then <code>application.properties</code> files.</li><li><b>Caching:</b> the merged context configuration is the cache key.</li></ul>`,
            r`@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class PortTest {
    @LocalServerPort int port;
    @Autowired WebServerApplicationContext ctx;

    @Test void info() {
        System.out.println(port > 0);
        System.out.println(ctx.getWebServer().getClass().getSimpleName());
    }
}

// OUTPUT:
// true
// TomcatWebServer`],
        [`<p>Options:</p><ul><li><code>classes = App.class</code> picks the configuration explicitly.</li><li><code>webEnvironment</code>: MOCK, RANDOM_PORT, DEFINED_PORT, NONE.</li><li><code>properties</code> inline overrides.</li><li><code>@ActiveProfiles</code>, <code>@TestPropertySource</code>, <code>@Sql</code> for data.</li><li><code>@AutoConfigureMockMvc</code>, <code>@AutoConfigureTestDatabase</code>.</li><li><code>@Testcontainers</code> with <code>@ServiceConnection</code>.</li></ul>`,
            r`@SpringBootTest(classes = ShopApplication.class,
        webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
class FullStackTest {
    @Container @ServiceConnection
    static PostgreSQLContainer<?> db =
        new PostgreSQLContainer<>("postgres:16");
}

// OUTPUT:
// Container postgres:16 started; datasource URL set automatically`],
        [`<p>Mistakes:</p><ul><li><b>Using it for unit logic</b>: slow; test services with plain JUnit and Mockito.</li><li><b>Shared database state</b> between tests; clean with <code>@Sql</code> or roll back.</li><li><b>Rollback assumption</b> with RANDOM_PORT: data stays committed.</li><li><b>Hard-coded port</b>: use RANDOM_PORT and <code>@LocalServerPort</code>.</li></ul>`,
            r`// WRONG: expects rollback, but the server thread commits separately
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Transactional
class LeakTest { /* POST /users leaves a row behind */ }

// RIGHT: clean explicitly
@Sql(statements = "DELETE FROM users", executionPhase = AFTER_TEST_METHOD)
class CleanTest { }

// OUTPUT:
// LeakTest: row remains after test; CleanTest: table empty`],
        [`<p>Performance:</p><ul><li>Each new context costs seconds; reuse it across classes.</li><li>Limit <code>@MockBean</code> variety, since each combination makes a new context.</li><li>Use <code>spring.main.lazy-initialization=true</code> in tests to start faster.</li><li>Consider Testcontainers reuse and a singleton container for the suite.</li></ul>`,
            r`# src/test/resources/application-test.properties
spring.main.lazy-initialization=true
spring.jpa.hibernate.ddl-auto=create-drop
logging.level.root=WARN

# OUTPUT: (varies)
# Context start time: 3.4 s -> 2.1 s with lazy initialization`],
        [`<p>Scenario: before a release, a smoke test boots the real app against a Postgres container and walks through create order, pay, and fetch.</p><ul><li>Uses RANDOM_PORT and <code>TestRestTemplate</code>.</li><li>Catches wiring, serialization and migration issues that slices miss.</li></ul>`,
            r`@Test
void orderLifecycle() {
    var created = rest.postForEntity("/orders", new OrderReq("pen", 2),
        OrderRes.class);
    assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    var fetched = rest.getForObject(created.getHeaders().getLocation(),
        OrderRes.class);
    assertThat(fetched.item()).isEqualTo("pen");
}

// OUTPUT:
// Tests run: 1, Failures: 0 (Flyway migrated, order persisted)`]
    ),
    'mvc-controller-mocking': dv(
        [`<p>How mocks enter the controller:</p><ul><li><b>@MockBean:</b> the test context post-processor replaces or registers a bean definition with a Mockito mock of that type.</li><li><b>Injection:</b> the controller receives the mock through its constructor, just like the real service.</li><li><b>Reset:</b> mocks are reset after each test method by default.</li><li><b>Standalone:</b> <code>@InjectMocks</code> uses Mockito reflection, no Spring.</li></ul>`,
            r`@WebMvcTest(UserController.class)
class InjectionTest {
    @Autowired UserController controller;
    @MockBean UserService service;

    @Test void isMock() {
        System.out.println(Mockito.mockingDetails(service).isMock());
    }
}

// OUTPUT:
// true`],
        [`<p>Mockito features useful here:</p><ul><li><code>when().thenReturn()</code>, <code>thenThrow()</code>, <code>thenAnswer()</code>.</li><li><code>doNothing().when(mock).delete(1L)</code> for void methods.</li><li><code>verify(mock, times(1))</code>, <code>never()</code>, <code>verifyNoMoreInteractions()</code>.</li><li><code>ArgumentMatchers</code>: <code>any()</code>, <code>eq()</code>, <code>argThat()</code>.</li><li><code>BDDMockito</code>: <code>given().willReturn()</code>.</li></ul>`,
            r`given(service.find(anyLong())).willReturn(new User(1L, "A"));
doNothing().when(service).delete(5L);

mvc.perform(delete("/users/5")).andExpect(status().isNoContent());
verify(service).delete(5L);
verifyNoMoreInteractions(service);

// OUTPUT:
// Status = 204; service.delete(5) called once`],
        [`<p>Mistakes:</p><ul><li><b>Mixing raw values and matchers</b> in one call: <code>eq(1L)</code> with a literal fails with InvalidUseOfMatchersException.</li><li><b>Unstubbed call</b> returns null or empty, producing confusing 200 responses with empty bodies.</li><li><b>Mocking the controller itself</b>, which tests nothing.</li><li><b>Stubbing after perform</b>.</li></ul>`,
            r`// WRONG: mixes a matcher and a raw value
// when(service.search(anyString(), 10)).thenReturn(list);
// RIGHT
when(service.search(anyString(), eq(10))).thenReturn(List.of());

// OUTPUT:
// WRONG -> InvalidUseOfMatchersException
// RIGHT -> stub applied`],
        [`<p>Performance and hygiene:</p><ul><li>Plain Mockito tests with standaloneSetup start in milliseconds.</li><li>Use the same <code>@MockBean</code> set across classes to keep the context cached.</li><li>Enable strict stubs (MockitoExtension) to remove unused stubbing.</li><li>Keep verify calls to meaningful interactions.</li></ul>`,
            r`@ExtendWith(MockitoExtension.class)   // strict stubs by default
class FastTest {
    @Mock UserService service;
    @InjectMocks UserController controller;
}

// OUTPUT: (varies)
// Tests run: 15, Time: 0.3 s (no Spring context)`],
        [`<p>Scenario: the payment controller must return 402 when the service reports a declined card, without touching any payment gateway.</p><ul><li>Stub the service to throw <code>CardDeclinedException</code>.</li><li>Assert status 402 and a clear message.</li><li>Verify that no receipt email was triggered.</li></ul>`,
            r`when(payments.charge(any())).thenThrow(new CardDeclinedException());
mvc.perform(post("/pay").contentType("application/json")
        .content("{\"amount\":10}"))
    .andExpect(status().isPaymentRequired())
    .andExpect(jsonPath("$.message").value("Card declined"));
verifyNoInteractions(mailer);

// OUTPUT:
// Status = 402, Body = {"message":"Card declined"}`]
    ),
    'mvc-request-testing': dv(
        [`<p>What happens inside perform:</p><ul><li><b>Builder:</b> a <code>MockHttpServletRequestBuilder</code> produces a <code>MockHttpServletRequest</code> with URI, params, headers and body.</li><li><b>Dispatch:</b> MockMvc runs the filter chain, then the DispatcherServlet in the same thread.</li><li><b>Mapping:</b> HandlerMapping finds the method, argument resolvers bind path, query and body, and message converters read JSON.</li><li><b>Result:</b> a <code>ResultActions</code> object exposes the response for matchers.</li></ul>`,
            r`MvcResult res = mvc.perform(get("/echo").param("a", "1")).andReturn();
MockHttpServletRequest req = res.getRequest();
System.out.println(req.getMethod() + " " + req.getRequestURI()
    + " " + req.getParameter("a"));

// OUTPUT:
// GET /echo 1`],
        [`<p>Builder options:</p><ul><li>Verbs: <code>get</code>, <code>post</code>, <code>put</code>, <code>patch</code>, <code>delete</code>, <code>options</code>, <code>head</code>.</li><li><code>param</code>, <code>queryParam</code>, <code>formField</code> (6.1+), <code>header</code>, <code>cookie</code>.</li><li><code>accept</code>, <code>contentType</code>, <code>content</code>, <code>locale</code>.</li><li><code>sessionAttr</code>, <code>flashAttr</code>, <code>requestAttr</code>.</li><li><code>principal</code> and <code>with(postProcessor)</code>.</li></ul>`,
            r`mvc.perform(put("/users/{id}", 3)
        .contentType(MediaType.APPLICATION_JSON)
        .accept(MediaType.APPLICATION_JSON)
        .header("If-Match", "\"v2\"")
        .cookie(new Cookie("lang", "en"))
        .content("{\"name\":\"Neha\"}"))
    .andExpect(status().isOk());

// OUTPUT:
// PUT /users/3 -> 200`],
        [`<p>Mistakes:</p><ul><li><b>Missing Content-Type</b> gives 415.</li><li><b>Wrong param kind</b>: <code>param</code> for a JSON body parameter never binds.</li><li><b>Hand-written JSON</b> with escaping errors; use <code>ObjectMapper</code>.</li><li><b>Forgot csrf()</b> on secured POST gives 403.</li></ul>`,
            r`// WRONG: body sent but no content type -> 415
mvc.perform(post("/users").content("{\"name\":\"A\"}"));

// RIGHT
mvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON)
    .content("{\"name\":\"A\"}"));

// OUTPUT:
// WRONG -> Status = 415, RIGHT -> Status = 201`],
        [`<p>Performance and reuse:</p><ul><li>MockMvc requests are in-memory and take about a millisecond.</li><li>Create small helper methods or a request factory for common headers.</li><li>Use <code>defaultRequest</code> on the builder for headers sent on every call.</li></ul>`,
            r`mvc = MockMvcBuilders.webAppContextSetup(ctx)
    .defaultRequest(get("/").header("X-Tenant", "acme")
        .accept(MediaType.APPLICATION_JSON))
    .build();

// OUTPUT:
// Every request now carries X-Tenant: acme and Accept: application/json`],
        [`<p>Scenario: an API reads a tenant from a header and a page size from a query string.</p><ul><li>Test missing header (400), invalid size (400) and valid case (200).</li><li>Prevents regressions in binding defaults.</li></ul>`,
            r`mvc.perform(get("/items").param("size", "500")
        .header("X-Tenant", "acme"))
    .andExpect(status().isBadRequest());
mvc.perform(get("/items").param("size", "20"))
    .andExpect(status().isBadRequest());           // no tenant header

// OUTPUT:
// 400 (size too large), 400 (missing X-Tenant)`]
    ),
    'mvc-response-testing': dv(
        [`<p>How matchers work:</p><ul><li><b>ResultMatcher:</b> a functional interface taking an <code>MvcResult</code>; <code>andExpect</code> runs it and throws AssertionError on mismatch.</li><li><b>jsonPath:</b> uses Jayway JsonPath on the response string; a path that finds nothing fails.</li><li><b>content().json:</b> uses JSONassert for lenient or strict compare.</li><li><b>Async:</b> for <code>Callable</code> or <code>DeferredResult</code> use <code>asyncStarted()</code> then <code>asyncDispatch(result)</code>.</li></ul>`,
            r`MvcResult started = mvc.perform(get("/slow"))
    .andExpect(request().asyncStarted()).andReturn();
mvc.perform(asyncDispatch(started))
    .andExpect(status().isOk())
    .andExpect(content().string("done"));

// OUTPUT:
// async started, then Status = 200, Body = done`],
        [`<p>Matcher families:</p><ul><li><code>status()</code>, <code>header()</code>, <code>cookie()</code>.</li><li><code>content()</code>: <code>string</code>, <code>json</code>, <code>contentType</code>, <code>xml</code>.</li><li><code>jsonPath()</code> with <code>value</code>, <code>exists</code>, <code>isArray</code>, <code>hasJsonPath</code>.</li><li><code>view()</code>, <code>model()</code>, <code>forwardedUrl()</code>, <code>redirectedUrl()</code>, <code>flash()</code>.</li><li>Hamcrest matchers like <code>hasSize</code> and <code>containsString</code>.</li></ul>`,
            r`mvc.perform(get("/users"))
    .andExpect(jsonPath("$", hasSize(2)))
    .andExpect(jsonPath("$[0].name", containsString("A")))
    .andExpect(jsonPath("$[*].id").isArray())
    .andExpect(cookie().exists("SESSION"));

// OUTPUT:
// Body = [{"id":1,"name":"Asha"},{"id":2,"name":"Ravi"}]`],
        [`<p>Mistakes:</p><ul><li><b>String equality on JSON</b> breaks on field order or spacing.</li><li><b>Wrong path</b>: <code>$.items[0]</code> vs <code>$[0]</code> for a root array.</li><li><b>Lenient json</b> hiding extra fields when a contract needs strict.</li><li><b>Dates</b>: compare formatted strings, which depend on Jackson settings.</li></ul>`,
            r`// WRONG: depends on exact serialization
// .andExpect(content().string("{\"id\":1,\"name\":\"A\"}"))
// RIGHT
.andExpect(content().json("{\"id\":1,\"name\":\"A\"}"))
.andExpect(jsonPath("$.name").value("A"))

// OUTPUT:
// RIGHT passes even if field order changes`],
        [`<p>Performance and clarity:</p><ul><li>Combine several matchers in one chain to reuse a single request.</li><li>Use <code>andDo(print())</code> only when debugging; it is noisy.</li><li>Use <code>@AutoConfigureMockMvc(print = MockMvcPrint.NONE)</code> to silence default printing.</li></ul>`,
            r`@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
class QuietTest { }

// OUTPUT:
// Build log no longer contains MockHttpServletRequest dumps`],
        [`<p>Scenario: a public API contract says paged results have <code>content</code>, <code>page</code> and <code>total</code>.</p><ul><li>One test locks these fields and the content type.</li><li>Any rename in a DTO fails the build before clients break.</li></ul>`,
            r`mvc.perform(get("/orders?page=0&size=2"))
    .andExpect(status().isOk())
    .andExpect(content().contentType("application/json"))
    .andExpect(jsonPath("$.content").isArray())
    .andExpect(jsonPath("$.page").value(0))
    .andExpect(jsonPath("$.total").isNumber());

// OUTPUT:
// Status = 200, Body = {"content":[...],"page":0,"total":17}`]
    ),
    'mvc-exception-testing': dv(
        [`<p>How exceptions flow in MockMvc:</p><ul><li>The handler method throws.</li><li><code>DispatcherServlet</code> asks its <code>HandlerExceptionResolver</code> chain: <code>ExceptionHandlerExceptionResolver</code> (your advice), <code>ResponseStatusExceptionResolver</code>, <code>DefaultHandlerExceptionResolver</code>.</li><li>If one resolves it, the response is built and no exception escapes.</li><li>If none does, the exception propagates out of <code>perform</code> because MockMvc has no container error page.</li></ul>`,
            r`@RestControllerAdvice
class ApiAdvice {
    @ExceptionHandler(UserNotFoundException.class)
    ResponseEntity<Map<String, String>> nf(UserNotFoundException e) {
        return ResponseEntity.status(404)
            .body(Map.of("message", e.getMessage()));
    }
}

// OUTPUT:
// Resolved by ExceptionHandlerExceptionResolver -> 404`],
        [`<p>Variants:</p><ul><li><code>@ExceptionHandler</code> in the controller or in an advice.</li><li><code>@ResponseStatus</code> on the exception class.</li><li><code>ResponseStatusException</code> thrown directly.</li><li><code>ProblemDetail</code> via <code>ResponseEntityExceptionHandler</code> and <code>spring.mvc.problemdetails.enabled</code>.</li><li>Test helpers: <code>getResolvedException()</code>, <code>assertThatThrownBy</code>.</li></ul>`,
            r`@ResponseStatus(HttpStatus.CONFLICT)
class DuplicateEmailException extends RuntimeException { }

mvc.perform(post("/users").contentType("application/json")
        .content("{\"email\":\"a@x.com\"}"))
    .andExpect(status().isConflict());

// OUTPUT:
// Status = 409 (from @ResponseStatus, no handler method needed)`],
        [`<p>Mistakes:</p><ul><li><b>assertThrows around a handled exception</b>: nothing is thrown, the test fails.</li><li><b>Advice not in slice</b>: a plain <code>@Component</code> advice-like class is not picked up; use <code>@ControllerAdvice</code>.</li><li><b>Catch-all handler</b> hiding bugs as 500 with the same body.</li><li><b>Wrong handler order</b> when two handlers match; the most specific type wins.</li></ul>`,
            r`// WRONG: expects an exception but advice already handled it
// assertThrows(Exception.class, () -> mvc.perform(get("/users/9")));
// RIGHT
mvc.perform(get("/users/9")).andExpect(status().isNotFound());

// OUTPUT:
// WRONG -> AssertionFailedError: nothing was thrown
// RIGHT -> passes`],
        [`<p>Tuning and quality:</p><ul><li>Keep one test per exception type in the advice.</li><li>Make error bodies stable with a shared record such as <code>ApiError</code>.</li><li>Log server errors once, in the advice, not in every catch block.</li></ul>`,
            r`record ApiError(int status, String code, String message) { }

mvc.perform(get("/users/9"))
    .andExpect(jsonPath("$.code").value("USER_NOT_FOUND"))
    .andExpect(jsonPath("$.status").value(404));

// OUTPUT:
// Body = {"status":404,"code":"USER_NOT_FOUND","message":"User 9 not found"}`],
        [`<p>Scenario: mobile clients depend on error codes.</p><ul><li>A test table checks each exception type against its status and code.</li><li>When a developer adds a new exception without a handler, the test for 500 fails and flags it.</li></ul>`,
            r`@ParameterizedTest
@CsvSource({"/users/9,404", "/users/abc,400", "/boom,500"})
void errorMapping(String url, int status) throws Exception {
    mvc.perform(get(url)).andExpect(status().is(status));
}

// OUTPUT:
// 3 tests passed`]
    ),
    'mvc-validation-testing': dv(
        [`<p>The validation path:</p><ul><li><b>Argument resolver:</b> <code>RequestResponseBodyMethodProcessor</code> reads the body, then calls the <code>Validator</code> because of <code>@Valid</code>.</li><li><b>Binding result:</b> violations become <code>FieldError</code> objects; with no <code>BindingResult</code> parameter the controller call is aborted with <code>MethodArgumentNotValidException</code>.</li><li><b>Resolver:</b> <code>DefaultHandlerExceptionResolver</code> sets 400, or your advice builds the body.</li><li><b>Validator:</b> Hibernate Validator, auto-configured by Boot when <code>spring-boot-starter-validation</code> is present.</li></ul>`,
            r`record UserDto(
    @NotBlank String name,
    @Min(0) @Max(120) int age,
    @Email String email) { }

@PostMapping("/users")
ResponseEntity<Void> create(@Valid @RequestBody UserDto dto) {
    return ResponseEntity.status(201).build();
}

// OUTPUT:
// Invalid body -> MethodArgumentNotValidException -> 400`],
        [`<p>Options:</p><ul><li><code>@Valid</code> vs <code>@Validated</code> (groups, class-level for parameters).</li><li>Constraints: <code>@NotNull</code>, <code>@NotBlank</code>, <code>@Size</code>, <code>@Pattern</code>, <code>@Positive</code>, <code>@Past</code>.</li><li>Custom <code>@Constraint</code> with a <code>ConstraintValidator</code>.</li><li><code>BindingResult</code> after the parameter for manual handling.</li><li>Nested objects need <code>@Valid</code> on the field.</li></ul>`,
            r`@PostMapping("/orders")
ResponseEntity<?> place(@Valid @RequestBody OrderDto dto,
                        BindingResult result) {
    if (result.hasErrors()) {
        return ResponseEntity.badRequest().body(
            result.getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .toList());
    }
    return ResponseEntity.ok().build();
}

// OUTPUT:
// 400 ["qty: must be greater than 0"]`],
        [`<p>Mistakes:</p><ul><li><b>No @Valid</b>: constraints silently ignored.</li><li><b>Nested object without @Valid</b>: inner fields not checked.</li><li><b>Starter missing</b>: no validator bean, annotations do nothing.</li><li><b>Primitive defaults</b>: <code>int age</code> is 0 when absent; use <code>Integer</code> with <code>@NotNull</code> to detect it.</li></ul>`,
            r`// WRONG: address is not validated
record Req(@NotBlank String name, Address address) { }
// RIGHT
record ReqOk(@NotBlank String name, @Valid @NotNull Address address) { }

// OUTPUT:
// WRONG -> blank street accepted; RIGHT -> 400 address.street`],
        [`<p>Performance:</p><ul><li>Validator creation is costly; Boot shares one bean, so do not build factories per call.</li><li>Cheap constraints first; avoid database checks inside a validator on hot paths.</li><li>Unit-test constraints with a shared static <code>Validator</code> for speed.</li></ul>`,
            r`private static final Validator V =
    Validation.buildDefaultValidatorFactory().getValidator();

@Test void blankName() {
    assertThat(V.validate(new UserDto("", 20, "a@x.com"))).hasSize(1);
}

// OUTPUT:
// Tests run: 1, Failures: 0 (no Spring context)`],
        [`<p>Scenario: a registration form is rejected in production because a new field had no @Valid.</p><ul><li>Add a negative test per constraint.</li><li>Parameterize bad inputs so each broken field is covered.</li></ul>`,
            r`@ParameterizedTest
@ValueSource(strings = {"{\"name\":\"\"}", "{\"name\":\"A\",\"age\":-5}",
    "{\"name\":\"A\",\"email\":\"x\"}"})
void rejectsBad(String json) throws Exception {
    mvc.perform(post("/users").contentType("application/json")
        .content(json)).andExpect(status().isBadRequest());
}

// OUTPUT:
// 3 tests passed (all 400)`]
    ),
    'mvc-security-testing': dv(
        [`<p>How the test security works:</p><ul><li><b>Filter chain:</b> MockMvc built with <code>springSecurity()</code> (automatic in Boot) adds the <code>FilterChainProxy</code> before the DispatcherServlet.</li><li><b>@WithMockUser:</b> a <code>TestExecutionListener</code> stores an <code>Authentication</code> in the <code>SecurityContext</code> before the test.</li><li><b>Post-processors:</b> per-request changes put the user in the repository used by the filters.</li><li><b>Failures:</b> <code>ExceptionTranslationFilter</code> turns AccessDenied into 401, 403 or a redirect.</li></ul>`,
            r`@Test @WithMockUser(username = "bob", roles = "USER")
void whoAmI() {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    System.out.println(a.getName() + " " + a.getAuthorities());
}

// OUTPUT:
// bob [ROLE_USER]`],
        [`<p>Tools:</p><ul><li><code>@WithMockUser</code>, <code>@WithAnonymousUser</code>, <code>@WithUserDetails</code>.</li><li><code>user()</code>, <code>httpBasic()</code>, <code>csrf()</code>, <code>jwt()</code>, <code>opaqueToken()</code>, <code>oauth2Login()</code>.</li><li><code>SecurityMockMvcResultMatchers.authenticated()</code> and <code>unauthenticated()</code>.</li><li><code>formLogin()</code> request builder to test login.</li></ul>`,
            r`mvc.perform(formLogin("/login").user("bob").password("secret"))
    .andExpect(authenticated().withUsername("bob"))
    .andExpect(redirectedUrl("/"));

mvc.perform(get("/api/data").with(httpBasic("bob", "secret")))
    .andExpect(status().isOk());

// OUTPUT:
// Login -> 302 /, Basic auth -> 200`],
        [`<p>Mistakes:</p><ul><li><b>Security config not imported</b> in a slice: the default rules apply.</li><li><b>Only testing allowed paths</b>: always add a denied case.</li><li><b>csrf missing</b>: 403 hides the real status.</li><li><b>Role prefix</b>: <code>roles = &quot;ADMIN&quot;</code> adds ROLE_ automatically; <code>authorities</code> does not.</li></ul>`,
            r`// WRONG: hasRole("ADMIN") needs ROLE_ADMIN, but authority is "ADMIN"
@WithMockUser(authorities = "ADMIN")
// RIGHT
@WithMockUser(roles = "ADMIN")

// OUTPUT:
// WRONG -> 403; RIGHT -> 200`],
        [`<p>Performance and maintenance:</p><ul><li>Prefer slice tests with <code>@Import(SecurityConfig.class)</code> to full contexts.</li><li>Create a custom meta-annotation like <code>@WithAdmin</code> for repeated setups.</li><li>Use a password encoder with a low cost in tests to reduce time.</li></ul>`,
            r`@Retention(RetentionPolicy.RUNTIME)
@WithMockUser(username = "admin", roles = "ADMIN")
@interface WithAdmin { }

@Test @WithAdmin void adminSees() { /* ... */ }

// OUTPUT:
// Reusable annotation applied; no repeated role strings`],
        [`<p>Scenario: an audit finds that a DELETE endpoint was open to any logged-in user.</p><ul><li>Add a matrix test: anonymous, USER and ADMIN against each endpoint.</li><li>Fail the build when a new endpoint is missing a rule.</li></ul>`,
            r`@ParameterizedTest
@CsvSource({"anon,401", "USER,403", "ADMIN,204"})
void deleteMatrix(String who, int expected) throws Exception {
    var req = delete("/users/1").with(csrf());
    if (!who.equals("anon")) req.with(user("u").roles(who));
    mvc.perform(req).andExpect(status().is(expected));
}

// OUTPUT:
// 3 tests passed`]
    ),
    'mvc-slf4j': dv(
        [`<p>How SLF4J works internally:</p><ul><li><b>Facade:</b> <code>LoggerFactory</code> finds a provider on the classpath through <code>ServiceLoader</code> (SLF4J 2.x) and asks it for a logger.</li><li><b>Logback:</b> the provider returns a <code>ch.qos.logback.classic.Logger</code> that checks its effective level.</li><li><b>Spring Boot:</b> <code>LoggingSystem</code> configures Logback at startup, and <code>jul-to-slf4j</code> and <code>log4j-to-slf4j</code> bridges route other libraries into it.</li><li><b>Parameterized message:</b> formatting happens only after the level check passes.</li></ul>`,
            r`Logger log = LoggerFactory.getLogger("demo");
System.out.println(log.getClass().getName());
System.out.println(log.isDebugEnabled());

// OUTPUT: (with Spring Boot defaults)
// ch.qos.logback.classic.Logger
// false`],
        [`<p>Syntax and variants:</p><ul><li>Levels: <code>trace</code>, <code>debug</code>, <code>info</code>, <code>warn</code>, <code>error</code>.</li><li>Fluent API (SLF4J 2): <code>log.atInfo().addKeyValue(&quot;id&quot;, 1).log(&quot;done&quot;)</code>.</li><li>Markers for tagging, MDC for context.</li><li>Lombok <code>@Slf4j</code> or <code>@Log4j2</code> annotations.</li><li>Group levels in Boot: <code>logging.group.web=...</code>.</li></ul>`,
            r`log.atInfo()
   .addKeyValue("orderId", 42)
   .addKeyValue("user", "asha")
   .log("Order placed");

MDC.put("reqId", "r-1");
log.warn("Slow call took {} ms", 840);
MDC.clear();

// OUTPUT: (varies)
// INFO ... Order placed
// WARN [r-1] ... Slow call took 840 ms`],
        [`<p>Common mistakes:</p><ul><li><b>String concatenation</b> in log calls; use placeholders.</li><li><b>Logging then throwing</b> the same exception, producing duplicate stack traces.</li><li><b>Swallowing the exception</b>: <code>log.error(e.getMessage())</code> loses the stack trace.</li><li><b>System.out.println</b> in services instead of a logger.</li><li><b>Sensitive data</b> in messages.</li></ul>`,
            r`// WRONG
log.error("Failed for " + id + ": " + e.getMessage());
// RIGHT
log.error("Failed for {}", id, e);

// OUTPUT:
// WRONG -> one line, no stack trace
// RIGHT -> message plus full stack trace`],
        [`<p>Performance:</p><ul><li>Disabled levels cost almost nothing with placeholders.</li><li>Guard expensive argument creation with <code>isDebugEnabled()</code> or use lambdas in the fluent API.</li><li>Heavy DEBUG logging in production slows throughput and fills disks.</li><li>Use a sampling or async appender for noisy paths.</li></ul>`,
            r`// Lazy argument with the fluent API (computed only if DEBUG is on)
log.atDebug().log("State: {}", () -> bigObject.toJson());

// OUTPUT:
// At INFO level: toJson() is never called`],
        [`<p>Scenario: tracing a failed checkout across services.</p><ul><li>A filter puts a correlation id into MDC for each request.</li><li>Every log line carries it, so support can grep one id.</li></ul>`,
            r`@Component
class CorrelationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("reqId", id);
        try { chain.doFilter(req, res); } finally { MDC.clear(); }
    }
}

// OUTPUT: (id varies)
// INFO [9c1d...] c.s.CheckoutService : Charging card for order 7
// ERROR [9c1d...] c.s.CheckoutService : Payment declined`]
    ),
    'mvc-logback': dv(
        [`<p>How Logback works inside Spring Boot:</p><ul><li><b>Starter:</b> <code>spring-boot-starter-logging</code> brings logback-classic, <code>log4j-to-slf4j</code> and <code>jul-to-slf4j</code>.</li><li><b>LoggingSystem:</b> <code>LogbackLoggingSystem</code> loads <code>logback-spring.xml</code> (or defaults) and maps the <code>logging.*</code> properties.</li><li><b>Pipeline:</b> Logger, then level check, then Appenders, each with an Encoder that formats the event.</li><li><b>Additivity:</b> child loggers pass events to parent appenders unless <code>additivity=&quot;false&quot;</code>.</li></ul>`,
            r`# Boot default console pattern is built from these properties
logging.pattern.console=%d{HH:mm:ss.SSS} %-5level [%thread] %logger{36} - %msg%n
logging.level.org.springframework.web=DEBUG

# OUTPUT:
# 10:00:01.123 DEBUG [http-nio-8080-exec-1] o.s.web.servlet.DispatcherServlet - GET "/hello"`],
        [`<p>Configuration options:</p><ul><li>Properties: <code>logging.level.*</code>, <code>logging.file.name</code>, <code>logging.file.path</code>, <code>logging.pattern.*</code>, <code>logging.logback.rollingpolicy.*</code>.</li><li>XML: appenders, loggers, <code>springProfile</code>, <code>springProperty</code>.</li><li>Alternative file with <code>logging.config=classpath:custom.xml</code>.</li><li>Include Boot defaults with <code>&lt;include resource=&quot;org/springframework/boot/logging/logback/base.xml&quot;/&gt;</code>.</li></ul>`,
            r`<configuration>
  <include resource="org/springframework/boot/logging/logback/base.xml"/>
  <springProperty scope="context" name="app" source="spring.application.name"/>
  <logger name="org.hibernate.SQL" level="DEBUG" additivity="false">
    <appender-ref ref="CONSOLE"/>
  </logger>
  <springProfile name="prod">
    <root level="WARN"><appender-ref ref="FILE"/></root>
  </springProfile>
</configuration>

<!-- OUTPUT -->
// dev: Boot defaults plus SQL logging; prod: WARN to file`],
        [`<p>Common mistakes:</p><ul><li><b>logback.xml with springProfile</b>: it fails; use <code>logback-spring.xml</code>.</li><li><b>Duplicate lines</b> from additivity true plus an extra appender.</li><li><b>Log files never rotate</b> because no rolling policy is set.</li><li><b>Two backends</b> (Logback and Log4j2 starters) giving a conflict; exclude one.</li><li><b>Editing logs at DEBUG in production</b> leaking data.</li></ul>`,
            r`<!-- WRONG: line printed twice (additivity default true) -->
<logger name="com.shop" level="INFO"><appender-ref ref="CONSOLE"/></logger>
<!-- RIGHT -->
<logger name="com.shop" level="INFO" additivity="false">
  <appender-ref ref="CONSOLE"/>
</logger>

<!-- OUTPUT -->
// WRONG: each message appears twice; RIGHT: once`],
        [`<p>Performance tuning:</p><ul><li>Wrap file appenders in <code>AsyncAppender</code> with a queue size such as 512 and <code>discardingThreshold</code>.</li><li>Avoid <code>%class</code>, <code>%method</code> and <code>%line</code> in patterns; they capture stack traces and are slow.</li><li>Keep production at INFO or WARN.</li><li>Set <code>immediateFlush</code> carefully; false is faster but risks losing the tail on a crash.</li></ul>`,
            r`<appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
  <queueSize>1024</queueSize>
  <discardingThreshold>0</discardingThreshold>
  <neverBlock>true</neverBlock>
  <appender-ref ref="FILE"/>
</appender>

<!-- OUTPUT -->
// Request threads enqueue events; a worker thread writes to disk`],
        [`<p>Scenario: production disk fills in a week because of one chatty DEBUG logger.</p><ul><li>Use the Actuator loggers endpoint to lower the level without restart.</li><li>Then add rolling limits so it cannot happen again.</li></ul>`,
            r`# management.endpoints.web.exposure.include=loggers
curl -X POST localhost:8080/actuator/loggers/com.shop.search \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel":"WARN"}'

# OUTPUT:
# HTTP/1.1 204 No Content
# com.shop.search now logs at WARN`]
    )
};
