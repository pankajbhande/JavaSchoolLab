// Spring extras, batch smvc34 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc34Extras: Record<string, Extra> = {
    'mvc-thymeleaf-fragments': x(
        ['<b>Fragment</b>: a named, reusable piece of a template (header, footer, form row) declared with <code>th:fragment</code> and pulled into pages, so markup is written once.',
            '<b>Include</b> a fragment with <code>th:insert</code> (keeps the host tag) or <code>th:replace</code> (replaces the host tag), using the syntax <code>~{file :: name}</code>.',
            '<b>Location</b>: fragments usually live in <code>templates/fragments/</code>, and the file name is given without <code>.html</code>.'],
        ['<b>Parameters</b>: a fragment can take arguments, as in <code>th:fragment=&quot;alert(type, msg)&quot;</code>, and the caller passes them like a method call.',
            '<b>Selectors</b>: <code>~{file :: #id}</code> or a CSS-like selector can include any element, not only one with <code>th:fragment</code>.',
            '<b>Conditional include</b>: <code>~{}</code> is the empty fragment and <code>~{::}</code> is a no-op, which lets you pick a fragment with a ternary.'],
        ['<b>Rendering</b>: the fragment is resolved by the same <code>TemplateEngine</code> used for the page, so it sees the same model and locale.',
            '<b>Caching</b>: in production the parsed template is cached, so fragment lookup is cheap; turn <code>spring.thymeleaf.cache</code> off only in development.',
            '<b>Fragment expressions as arguments</b>: pass markup into a fragment with <code>~{::selector}</code>, which gives a layout-like effect without extra libraries.'],
        [['F', 'What is a Thymeleaf fragment?', 'A named block of template markup, declared with th:fragment, that other templates can include.'],
            ['F', 'Difference between th:insert and th:replace?', 'th:insert puts the fragment inside the host tag; th:replace swaps the host tag for the fragment.'],
            ['M', 'How do you pass parameters to a fragment?', 'Declare them in th:fragment=&quot;name(a, b)&quot; and call with ~{file :: name(1, 2)}.'],
            ['M', 'Can you include something that has no th:fragment?', 'Yes, use a selector such as ~{file :: #footer} to include an element by id or CSS-like selector.'],
            ['S', 'How can a fragment receive a block of markup from the caller?', 'Pass a fragment expression like ~{::content} as a parameter and render it inside with th:replace.'],
            ['S', 'Why did th:include disappear from documentation?', 'It is deprecated since Thymeleaf 3.0 in favour of th:insert and th:replace.']],
        [['Declare and use a footer fragment.',
            r`<!-- templates/fragments/footer.html -->
<footer th:fragment="footer">
    <p>Copyright 2026 Acme</p>
</footer>

<!-- templates/home.html -->
<body>
    <div th:replace="~{fragments/footer :: footer}"></div>
</body>

// OUTPUT:
// <body>
//     <footer><p>Copyright 2026 Acme</p></footer>
// </body>`],
            ['A fragment with parameters.',
                r`<!-- fragments/alerts.html -->
<div th:fragment="alert(kind, text)" th:class="'alert alert-' + $` + r`{kind}
">
    <span th:text="$` + r`{text}
">message</span>
</div>

<!-- caller -->
<div th:replace="~{fragments/alerts :: alert('danger', 'Save failed')}"></div>

// OUTPUT:
// <div class="alert alert-danger"><span>Save failed</span></div>`]],
        [['Controller returns a page that uses the fragments.',
            r`@Controller
class HomeController {
    @GetMapping("/")
    String home(Model model) {
        model.addAttribute("title", "Welcome");
        return "home";            // resolves templates/home.html
    }
}

// OUTPUT:
// GET / -> 200 OK, HTML page with header, body and footer fragments`],
            ['Test that the fragment is rendered.',
                r`@WebMvcTest(HomeController.class)
class HomeViewTest {
    @Autowired MockMvc mvc;

    @Test
    void footerIsIncluded() throws Exception {
        mvc.perform(get("/"))
           .andExpect(status().isOk())
           .andExpect(content().string(containsString("Copyright 2026")));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-layouts-thymeleaf': x(
        ['<b>Layout</b>: one master template (menu, header, footer, CSS) that every page reuses, so each page only supplies its own content.',
            '<b>Two ways</b>: plain Thymeleaf fragments passed as parameters, or the <code>thymeleaf-layout-dialect</code> library with <code>layout:decorate</code>.',
            '<b>Goal</b>: change the site menu in one file and see it on every page.'],
        ['<b>Layout dialect</b>: the page declares <code>layout:decorate=&quot;~{layouts/main}&quot;</code> and fills slots with <code>layout:fragment=&quot;content&quot;</code>.',
            '<b>Plain approach</b>: the layout is a fragment with a <code>content</code> parameter; each page calls it with <code>th:replace</code> and passes <code>~{::main}</code>.',
            '<b>Title merging</b>: the layout dialect can combine page and layout titles with <code>layout:title-pattern</code>.'],
        ['<b>Dependency</b>: the dialect is a separate artifact (<code>nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect</code>), and Spring Boot registers it automatically when it is on the classpath.',
            '<b>Processing order</b>: the content page is parsed first, then decorated into the layout, so model data is available in both.',
            '<b>Choice</b>: use the fragment approach if you want zero extra dependencies and the dialect if you want a Tiles-like decorator model.'],
        [['F', 'What is a layout in Thymeleaf?', 'A shared master template that holds common page structure while pages provide only their own content.'],
            ['F', 'Why use layouts?', 'To avoid repeating headers, menus and footers in every page.'],
            ['M', 'How does layout:decorate work?', 'The page names a layout; the layout dialect merges the page fragments into the layout slots.'],
            ['M', 'Do you need the layout dialect to build layouts?', 'No, you can pass a fragment expression like ~{::section} to a layout fragment instead.'],
            ['S', 'How do you add page specific CSS to a layout?', 'Define a head slot in the layout and let each page supply its own link tags with layout:fragment.'],
            ['S', 'What is a pitfall of layout:fragment names?', 'A name typo gives silent empty output because unmatched slots keep the layout default content.']],
        [['Layout with the layout dialect.',
            r`<!-- templates/layouts/main.html -->
<html xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<body>
    <nav>Home | Orders</nav>
    <section layout:fragment="content">default content</section>
</body>
</html>

<!-- templates/orders.html -->
<html layout:decorate="~{layouts/main}">
<body>
    <section layout:fragment="content"><h1>Orders</h1></section>
</body>
</html>

// OUTPUT:
// <nav>Home | Orders</nav>
// <section><h1>Orders</h1></section>`],
            ['Layout without a library.',
                r`<!-- layouts/base.html -->
<html th:fragment="layout(title, content)">
<head><title th:replace="$` + r`{title}
">Default</title></head>
<body>
    <nav>Home | Orders</nav>
    <main th:replace="$` + r`{content}
">content</main>
</body>
</html>

<!-- orders.html -->
<html th:replace="~{layouts/base :: layout(~{::title}, ~{::main})}">
<head><title>Orders</title></head>
<body><main><h1>Orders</h1></main></body>
</html>

// OUTPUT:
// full page: shared nav plus the Orders title and main content`]],
        [['Maven dependency for the dialect.',
            r`<dependency>
    <groupId>nz.net.ultraq.thymeleaf</groupId>
    <artifactId>thymeleaf-layout-dialect</artifactId>
</dependency>

// OUTPUT:
// Spring Boot manages the version and auto-registers the dialect`],
            ['Check the layout in a test.',
                r`@WebMvcTest(OrderController.class)
class LayoutTest {
    @Autowired MockMvc mvc;

    @Test
    void ordersUsesMainLayout() throws Exception {
        mvc.perform(get("/orders"))
           .andExpect(content().string(containsString("Home | Orders")))
           .andExpect(content().string(containsString("<h1>Orders</h1>")));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-thymeleaf-security-integration': x(
        ['<b>Integration</b>: the <code>thymeleaf-extras-springsecurity6</code> module lets templates show or hide parts of a page based on the logged-in user.',
            '<b>sec:authorize</b> renders an element only if the expression is true, for example <code>hasRole(&quot;ADMIN&quot;)</code> or <code>isAuthenticated()</code>.',
            '<b>sec:authentication</b> prints data about the current user, such as <code>sec:authentication=&quot;name&quot;</code>.'],
        ['<b>CSRF</b>: a form with <code>th:action</code> gets the hidden CSRF token added automatically when Spring Security is active.',
            '<b>Namespace</b>: add <code>xmlns:sec=&quot;http://www.thymeleaf.org/extras/spring-security&quot;</code> to the html tag for editor support.',
            '<b>Expressions</b>: <code>sec:authorize-url</code> hides a link when the user may not call that URL.'],
        ['<b>Not a security control</b>: hiding a button is only a UI courtesy; the server side must still protect the URL with <code>authorizeHttpRequests</code> or <code>@PreAuthorize</code>.',
            '<b>Security context</b>: the dialect reads the <code>Authentication</code> from the <code>SecurityContextHolder</code> of the current request.',
            '<b>Boot 3</b>: use the <code>springsecurity6</code> artifact for Spring Security 6; the older <code>springsecurity5</code> one does not match.'],
        [['F', 'What does sec:authorize do?', 'It shows the element only when the security expression evaluates to true.'],
            ['F', 'How do you print the username in a template?', 'Use sec:authentication=&quot;name&quot; on an element.'],
            ['M', 'Which dependency is needed?', 'org.thymeleaf.extras:thymeleaf-extras-springsecurity6 together with Spring Security.'],
            ['M', 'How does a form get its CSRF token?', 'th:action makes Thymeleaf add the hidden _csrf input automatically.'],
            ['S', 'Is hiding a link with sec:authorize enough to protect a page?', 'No, the URL must also be secured on the server, because a user can type the address directly.'],
            ['S', 'How do you test a secured view?', 'Use MockMvc with @WithMockUser and spring-security-test, and check that the markup is present or absent.']],
        [['Role based menu.',
            r`<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<body>
    <a href="/orders">Orders</a>
    <a sec:authorize="hasRole('ADMIN')" href="/admin">Admin</a>
    <span sec:authorize="isAuthenticated()">
        Hello <b sec:authentication="name">user</b>
    </span>
</body>
</html>

// OUTPUT: (user "abaji" with ROLE_USER)
// Orders link and "Hello abaji"; the Admin link is not rendered`],
            ['Logout form with CSRF.',
                r`<form th:action="@{/logout}" method="post">
    <button type="submit">Log out</button>
</form>

// OUTPUT:
// <form action="/logout" method="post">
//   <input type="hidden" name="_csrf" value="9f2c..."/>   (varies)
//   <button type="submit">Log out</button>
// </form>`]],
        [['Dependency.',
            r`<dependency>
    <groupId>org.thymeleaf.extras</groupId>
    <artifactId>thymeleaf-extras-springsecurity6</artifactId>
</dependency>

// OUTPUT:
// the sec: attributes become available in all Thymeleaf templates`],
            ['Test the admin link is hidden.',
                r`@WebMvcTest(HomeController.class)
class MenuTest {
    @Autowired MockMvc mvc;

    @Test
    @WithMockUser(roles = "USER")
    void userDoesNotSeeAdminLink() throws Exception {
        mvc.perform(get("/"))
           .andExpect(content().string(not(containsString("/admin"))));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-unit-testing': x(
        ['<b>Unit test</b>: checks one class in isolation, with no Spring context, no server and no database, so it runs in milliseconds.',
            '<b>Tools</b>: JUnit 5 to structure the test and Mockito to fake collaborators.',
            '<b>Arrange, act, assert</b>: set up the data, call the method, then check the result.'],
        ['<b>Plain objects</b>: a controller or service is a normal Java class, so you can create it with <code>new</code> and pass mocks to its constructor.',
            '<b>Constructor injection</b> makes this easy; field injection forces you to use <code>@InjectMocks</code> or reflection.',
            '<b>Test pyramid</b>: write many fast unit tests, fewer slice tests and few full integration tests.'],
        ['<b>No framework behaviour</b>: a unit test does not check <code>@RequestMapping</code>, validation or JSON conversion, because no <code>DispatcherServlet</code> is involved; use MockMvc for that.',
            '<b>Determinism</b>: inject a <code>Clock</code> or supplier instead of calling <code>LocalDate.now()</code> so time based logic is testable.',
            '<b>Naming</b>: a name like <code>shouldReturnEmptyWhenUserMissing</code> describes behaviour and reads well in reports.'],
        [['F', 'What is a unit test?', 'A fast test of one class or method in isolation from other parts of the system.'],
            ['F', 'Why avoid Spring in unit tests?', 'Starting a context is slow and not needed to test plain Java logic.'],
            ['M', 'How do you isolate a class from its dependencies?', 'Replace them with Mockito mocks passed through the constructor.'],
            ['M', 'What does a unit test of a controller not cover?', 'Routing, binding, validation and serialization, since no web layer is running.'],
            ['S', 'How do you make time dependent code testable?', 'Inject a java.time.Clock and use a fixed clock in the test.'],
            ['S', 'How many assertions per test?', 'Prefer one behaviour per test; several asserts are fine if they describe the same outcome.']],
        [['A pure unit test.',
            r`class PriceCalculatorTest {
    private final PriceCalculator calc = new PriceCalculator();

    @Test
    void appliesTenPercentDiscount() {
        BigDecimal result = calc.discount(new BigDecimal("200.00"), 10);
        assertEquals(new BigDecimal("180.00"), result);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Fixed clock.',
                r`class GreetingServiceTest {
    @Test
    void sayGoodMorningBeforeNoon() {
        Clock clock = Clock.fixed(
            Instant.parse("2026-01-01T08:00:00Z"), ZoneOffset.UTC);
        GreetingService svc = new GreetingService(clock);
        assertEquals("Good morning", svc.greet());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Controller as a plain object.',
            r`class HelloControllerTest {
    @Test
    void returnsViewName() {
        HelloController c = new HelloController();
        Model model = new ExtendedModelMap();
        String view = c.hello("Abaji", model);
        assertEquals("hello", view);
        assertEquals("Abaji", model.getAttribute("name"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Run only unit tests with Maven.',
                r`mvn -q test -Dtest=*Test

// OUTPUT:
// [INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
// [INFO] Total time: 3.2 s   (varies)`]]
    ),
    'mvc-controller-testing': x(
        ['<b>Controller test</b>: checks request mapping, parameter binding, validation, status codes and the view or JSON response.',
            '<b>@WebMvcTest</b> loads only the web layer (controllers, advice, converters, filters) and gives you an auto-configured <code>MockMvc</code>.',
            '<b>Collaborators</b> such as services are replaced with <code>@MockBean</code>, so no database is needed.'],
        ['<b>Perform and expect</b>: <code>mvc.perform(get(&quot;/x&quot;))</code> followed by <code>andExpect(status().isOk())</code> and checks on the view, model or body.',
            '<b>JSON</b>: send a body with <code>contentType(APPLICATION_JSON).content(json)</code> and read it with <code>jsonPath</code>.',
            '<b>Validation</b>: post bad data and expect <code>status().isBadRequest()</code> or <code>model().attributeHasFieldErrors</code>.'],
        ['<b>Slice limits</b>: <code>@WebMvcTest</code> does not load <code>@Service</code> or <code>@Repository</code> beans, so a missing <code>@MockBean</code> shows up as a context failure.',
            '<b>Security</b>: Spring Security is active in the slice, so add <code>@WithMockUser</code> and <code>csrf()</code> for POST requests.',
            '<b>Stubbing</b>: use <code>when(service.find(1L)).thenReturn(...)</code> to control what the controller sees.'],
        [['F', 'What does @WebMvcTest load?', 'Only the web layer: controllers, controller advice, filters and converters.'],
            ['F', 'What is MockMvc?', 'A tool to call controllers with fake requests without starting a real server.'],
            ['M', 'Why do you need @MockBean in a controller test?', 'The slice does not load services, so the controller dependency must be supplied as a mock.'],
            ['M', 'How do you check JSON output?', 'Use jsonPath, for example andExpect(jsonPath(&quot;$.name&quot;).value(&quot;Abaji&quot;)).'],
            ['S', 'Why does a POST test return 403 with Spring Security?', 'The CSRF token is missing; add .with(csrf()) to the request.'],
            ['S', 'How do you test exception handlers?', 'Make the mock service throw, then assert the status and body produced by the @ControllerAdvice.']],
        [['GET test with a mocked service.',
            r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test
    void returnsUser() throws Exception {
        when(service.find(1L)).thenReturn(new User(1L, "Abaji"));
        mvc.perform(get("/users/1"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Abaji"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['POST with validation failure.',
                r`@Test
void rejectsBlankName() throws Exception {
    mvc.perform(post("/users")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"\"}"))
       .andExpect(status().isBadRequest());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0
// (service.create was never called)`]],
        [['Test a view controller.',
            r`@Test
void showsListView() throws Exception {
    when(service.all()).thenReturn(List.of(new User(1L, "Abaji")));
    mvc.perform(get("/users/list"))
       .andExpect(status().isOk())
       .andExpect(view().name("users/list"))
       .andExpect(model().attributeExists("users"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Not found handling.',
                r`@Test
void unknownUserGives404() throws Exception {
    when(service.find(9L)).thenThrow(new UserNotFoundException(9L));
    mvc.perform(get("/users/9"))
       .andExpect(status().isNotFound());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-service-testing': x(
        ['<b>Service test</b>: checks business rules in a <code>@Service</code> class, with the repository replaced by a mock.',
            '<b>Setup</b>: <code>@ExtendWith(MockitoExtension.class)</code>, <code>@Mock</code> for dependencies and <code>@InjectMocks</code> for the class under test.',
            '<b>No Spring</b>: the test is a plain JUnit test, so it needs no context and runs very fast.'],
        ['<b>Stub</b> with <code>when(repo.findById(1L)).thenReturn(Optional.of(user))</code> and <b>verify</b> with <code>verify(repo).save(any())</code>.',
            '<b>Exceptions</b>: assert business errors with <code>assertThrows(OrderNotFoundException.class, () -&gt; svc.get(9L))</code>.',
            '<b>Captors</b>: use <code>ArgumentCaptor</code> to inspect the entity the service passes to <code>save</code>.'],
        ['<b>Transactions</b> (<code>@Transactional</code>) are proxy behaviour and are not active in a plain unit test; test rollback in an integration test.',
            '<b>Strict stubs</b>: Mockito reports unused stubbing, which keeps tests honest, so remove stubs that are not needed.',
            '<b>Do not mock the class under test</b> and do not mock simple value objects; mock only collaborators across a boundary.'],
        [['F', 'How do you test a service?', 'Mock its repository with Mockito and call the service method in a plain JUnit test.'],
            ['F', 'What does @InjectMocks do?', 'It creates the class under test and injects the @Mock fields into it.'],
            ['M', 'How do you check that save was called?', 'Use verify(repository).save(...) or verify with times(n).'],
            ['M', 'How do you capture the saved entity?', 'Use ArgumentCaptor, then call captor.getValue() after verify.'],
            ['S', 'Can a unit test check @Transactional rollback?', 'No, the proxy is not created; use @SpringBootTest or @DataJpaTest against a real or in-memory database.'],
            ['S', 'What is UnnecessaryStubbingException?', 'Mockito strict mode fails the test when a stub is configured but never used.']],
        [['Happy path.',
            r`@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository repo;
    @InjectMocks OrderService service;

    @Test
    void findsOrder() {
        when(repo.findById(5L)).thenReturn(Optional.of(new Order(5L, "NEW")));
        Order o = service.get(5L);
        assertEquals("NEW", o.getStatus());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Error path.',
                r`@Test
void missingOrderThrows() {
    when(repo.findById(9L)).thenReturn(Optional.empty());
    assertThrows(OrderNotFoundException.class, () -> service.get(9L));
    verify(repo, never()).save(any());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Capture the saved entity.',
            r`@Test
void placesOrderAsNew() {
    ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
    when(repo.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
    service.place("Abaji", 2);
    verify(repo).save(captor.capture());
    assertEquals("NEW", captor.getValue().getStatus());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Constructor injection keeps tests simple.',
                r`@Service
class OrderService {
    private final OrderRepository repo;
    OrderService(OrderRepository repo) { this.repo = repo; }
}
// test: new OrderService(mock(OrderRepository.class))

// OUTPUT:
// no reflection or Spring needed to build the service in a test`]]
    ),
    'mvc-integration-testing': x(
        ['<b>Integration test</b>: starts the real Spring context and checks that controller, service, repository and database work together.',
            '<b>@SpringBootTest</b> loads the whole application; add <code>@AutoConfigureMockMvc</code> to call it with <code>MockMvc</code>.',
            '<b>Database</b>: use an in-memory H2 database or a Testcontainers container so tests do not touch real data.'],
        ['<b>webEnvironment</b>: <code>MOCK</code> (default) uses a mock servlet; <code>RANDOM_PORT</code> starts a real server and you call it with <code>TestRestTemplate</code> or <code>WebTestClient</code>.',
            '<b>@Transactional</b> on a test class rolls back each test, which keeps data clean for the next one.',
            '<b>Profiles</b>: <code>@ActiveProfiles(&quot;test&quot;)</code> loads <code>application-test.properties</code>.'],
        ['<b>Context caching</b>: Spring reuses a context between tests with the same configuration, so avoid unneeded <code>@MockBean</code> or <code>@DirtiesContext</code>, which force a rebuild.',
            '<b>Real server rollback</b>: with <code>RANDOM_PORT</code> the test and the server run in different threads, so test rollback does not apply and you must clean data yourself.',
            '<b>Speed</b>: keep few integration tests for key flows and cover details with unit and slice tests.'],
        [['F', 'What does @SpringBootTest do?', 'It starts the full application context for the test.'],
            ['F', 'Why use H2 or Testcontainers?', 'To run tests against a real database engine without touching production data.'],
            ['M', 'Difference between MOCK and RANDOM_PORT?', 'MOCK uses a simulated servlet environment; RANDOM_PORT starts an embedded server on a random port.'],
            ['M', 'How do tests stay independent?', 'Roll back with @Transactional or clean tables in @BeforeEach.'],
            ['S', 'Why is my integration test suite slow?', 'Different test configurations create several contexts; share configuration and avoid @DirtiesContext.'],
            ['S', 'Why does rollback not work with RANDOM_PORT?', 'The request runs in a server thread with its own transaction, separate from the test transaction.']],
        [['Full flow with MockMvc.',
            r`@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserFlowIT {
    @Autowired MockMvc mvc;
    @Autowired UserRepository repo;

    @Test
    void createsUser() throws Exception {
        mvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Abaji\"}"))
           .andExpect(status().isCreated());
        assertEquals(1, repo.count());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0   (row rolled back afterwards)`],
            ['Real server on a random port.',
                r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HttpIT {
    @Autowired TestRestTemplate rest;

    @Test
    void healthIsUp() {
        ResponseEntity<String> res = rest.getForEntity("/actuator/health", String.class);
        assertEquals(HttpStatus.OK, res.getStatusCode());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Test properties.',
            r`# src/test/resources/application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop

# OUTPUT:
# the test profile uses an in-memory database that disappears after the run`],
            ['Naming convention.',
                r`mvn test              # unit tests (*Test) by Surefire
mvn verify            # also runs integration tests (*IT) by Failsafe

// OUTPUT:
// [INFO] Tests run: 24 ... then [INFO] Tests run: 6 (integration)`]]
    ),
    'mvc-junit': x(
        ['<b>JUnit 5</b> is the standard Java test framework; it is made of Platform, Jupiter (the API you write) and Vintage (for old JUnit 4 tests).',
            '<b>Basics</b>: mark a method with <code>@Test</code> and check results with <code>assertEquals</code>, <code>assertTrue</code> and <code>assertThrows</code>.',
            '<b>Spring Boot</b>: <code>spring-boot-starter-test</code> already includes JUnit 5, Mockito and AssertJ.'],
        ['<b>Lifecycle</b>: <code>@BeforeEach</code> and <code>@AfterEach</code> run around each test; <code>@BeforeAll</code> and <code>@AfterAll</code> run once and are static by default.',
            '<b>Parameterized</b>: <code>@ParameterizedTest</code> with <code>@ValueSource</code> or <code>@CsvSource</code> runs one test for many inputs.',
            '<b>Readable reports</b>: <code>@DisplayName</code> and <code>@Nested</code> group and describe tests.'],
        ['<b>Extensions</b>: <code>@ExtendWith</code> adds behaviour; <code>SpringExtension</code> (inside <code>@SpringBootTest</code>) and <code>MockitoExtension</code> are examples.',
            '<b>Instance per method</b>: JUnit creates a new test class instance for every test, so fields are not shared between tests.',
            '<b>Assertions</b>: <code>assertAll</code> reports all failures together, and AssertJ gives fluent checks such as <code>assertThat(list).hasSize(2)</code>.'],
        [['F', 'Which annotation marks a test?', '@Test from org.junit.jupiter.api.'],
            ['F', 'What is in spring-boot-starter-test?', 'JUnit 5, Mockito, AssertJ, Hamcrest, JSONassert and Spring Test.'],
            ['M', 'Difference between @BeforeEach and @BeforeAll?', '@BeforeEach runs before every test; @BeforeAll runs once and the method must be static.'],
            ['M', 'How do you run one test with many inputs?', 'Use @ParameterizedTest with a source such as @CsvSource.'],
            ['S', 'Why are test fields not shared between tests?', 'JUnit creates a new instance of the test class per test method by default.'],
            ['S', 'What changed from JUnit 4 to 5?', 'New org.junit.jupiter package, @ExtendWith replaces @RunWith, and @Before became @BeforeEach.']],
        [['Lifecycle and assertions.',
            r`class CartTest {
    Cart cart;

    @BeforeEach
    void init() { cart = new Cart(); }

    @Test
    @DisplayName("adding an item increases the count")
    void addItem() {
        cart.add("pen");
        assertEquals(1, cart.size());
    }
}

// OUTPUT:
// CartTest > adding an item increases the count  PASSED`],
            ['Parameterized test.',
                r`@ParameterizedTest
@CsvSource({"2,3,5", "10,-4,6", "0,0,0"})
void adds(int a, int b, int expected) {
    assertEquals(expected, new Calculator().add(a, b));
}

// OUTPUT:
// adds(int, int, int) [1] 2, 3, 5     PASSED
// adds(int, int, int) [2] 10, -4, 6   PASSED
// adds(int, int, int) [3] 0, 0, 0     PASSED`]],
        [['Assert an exception.',
            r`@Test
void divideByZeroThrows() {
    ArithmeticException ex = assertThrows(ArithmeticException.class,
        () -> new Calculator().divide(1, 0));
    assertEquals("/ by zero", ex.getMessage());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Grouped assertions.',
                r`@Test
void userFields() {
    User u = new User("Abaji", 30);
    assertAll("user",
        () -> assertEquals("Abaji", u.getName()),
        () -> assertEquals(30, u.getAge()));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-mockito': x(
        ['<b>Mockito</b> creates fake objects (mocks) so you can test a class without its real collaborators.',
            '<b>Core calls</b>: <code>mock(Type.class)</code> or <code>@Mock</code>, <code>when(...).thenReturn(...)</code> to stub and <code>verify(...)</code> to check interactions.',
            '<b>Default</b>: an unstubbed mock method returns null, 0, false or an empty collection.'],
        ['<b>Matchers</b>: <code>any()</code>, <code>eq(5)</code> and <code>anyString()</code>; if you use a matcher for one argument you must use matchers for all of them.',
            '<b>Void methods</b>: use <code>doThrow(new X()).when(mock).method()</code> or <code>doNothing()</code> instead of <code>when</code>.',
            '<b>Spy</b>: <code>spy(realObject)</code> keeps real behaviour and lets you stub only some methods.'],
        ['<b>Mock vs @MockBean</b>: <code>@Mock</code> is plain Mockito; <code>@MockBean</code> replaces a bean inside the Spring context.',
            '<b>Limits</b>: Mockito cannot stub static methods by default; <code>mockStatic</code> exists but is a design smell in most cases.',
            '<b>Over-verifying</b> ties tests to implementation details; verify outcomes and important calls, not every call.'],
        [['F', 'What is a mock?', 'A fake object that stands in for a real dependency and records how it is used.'],
            ['F', 'How do you stub a method?', 'when(mock.method()).thenReturn(value).'],
            ['M', 'Mock versus spy?', 'A mock is fully fake; a spy wraps a real object and runs real methods unless stubbed.'],
            ['M', 'Why does Mockito complain about InvalidUseOfMatchersException?', 'You mixed matchers and raw values in one call; use matchers for all arguments.'],
            ['S', 'How do you stub a void method to throw?', 'doThrow(new RuntimeException()).when(mock).run().'],
            ['S', 'When is @MockBean better than @Mock?', 'When the mock must replace a bean in the Spring context, for example in @WebMvcTest.']],
        [['Stub and verify.',
            r`UserRepository repo = mock(UserRepository.class);
when(repo.findById(1L)).thenReturn(Optional.of(new User(1L, "Abaji")));

Optional<User> u = repo.findById(1L);
System.out.println(u.get().getName());
verify(repo, times(1)).findById(1L);

// OUTPUT:
// Abaji`],
            ['Argument matchers and void methods.',
                r`EmailSender sender = mock(EmailSender.class);
doThrow(new IllegalStateException("smtp down"))
    .when(sender).send(eq("a@x.com"), anyString());

try {
    sender.send("a@x.com", "hi");
} catch (IllegalStateException e) {
    System.out.println(e.getMessage());
}

// OUTPUT:
// smtp down`]],
        [['ArgumentCaptor.',
            r`ArgumentCaptor<Order> cap = ArgumentCaptor.forClass(Order.class);
service.place("Abaji", 2);
verify(repo).save(cap.capture());
System.out.println(cap.getValue().getCustomer());

// OUTPUT:
// Abaji`],
            ['Spy on a real list.',
                r`List<String> spy = spy(new ArrayList<>());
spy.add("a");
doReturn(10).when(spy).size();
System.out.println(spy.get(0) + " " + spy.size());

// OUTPUT:
// a 10`]]
    ),
    'mvc-mockmvc': x(
        ['<b>MockMvc</b> sends fake HTTP requests to your controllers through the real <code>DispatcherServlet</code> logic, without a network or server.',
            '<b>Flow</b>: <code>mvc.perform(request)</code> returns a <code>ResultActions</code> that you check with <code>andExpect(...)</code>.',
            '<b>Builders</b>: <code>get</code>, <code>post</code>, <code>put</code>, <code>delete</code> from <code>MockMvcRequestBuilders</code> and matchers from <code>MockMvcResultMatchers</code>.'],
        ['<b>Request details</b>: add <code>param</code>, <code>header</code>, <code>contentType</code>, <code>content</code>, <code>cookie</code> and <code>sessionAttr</code>.',
            '<b>Result checks</b>: <code>status()</code>, <code>content()</code>, <code>jsonPath()</code>, <code>view()</code>, <code>model()</code>, <code>header()</code>, <code>redirectedUrl()</code>.',
            '<b>Debug</b>: <code>andDo(print())</code> writes the full request and response to the console.'],
        ['<b>Three set-ups</b>: auto-configured through <code>@WebMvcTest</code> or <code>@AutoConfigureMockMvc</code>; <code>webAppContextSetup</code> for a full context; <code>standaloneSetup(controller)</code> for a quick isolated test.',
            '<b>Not a real server</b>: no port, no real servlet container features such as error pages from the container, so some behaviour differs from production.',
            '<b>Async</b>: for <code>Callable</code> or <code>DeferredResult</code> results use <code>asyncStarted()</code> and then <code>asyncDispatch(result)</code>.'],
        [['F', 'What is MockMvc?', 'A Spring Test tool that calls controllers with simulated HTTP requests, without starting a server.'],
            ['F', 'How do you print the response?', 'Add andDo(print()) to the ResultActions.'],
            ['M', 'How do you send JSON?', 'Use contentType(MediaType.APPLICATION_JSON) and content(jsonString).'],
            ['M', 'standaloneSetup versus @WebMvcTest?', 'standaloneSetup builds MockMvc for one controller with no Spring context; @WebMvcTest loads the web slice with auto-configuration.'],
            ['S', 'Why does a redirect test not follow the redirect?', 'MockMvc does not follow redirects; assert status().is3xxRedirection() and redirectedUrl().'],
            ['S', 'How do you test async controller methods?', 'Check asyncStarted(), take the MvcResult and call perform(asyncDispatch(result)).']],
        [['GET with parameter.',
            r`mvc.perform(get("/greet").param("name", "Abaji"))
   .andDo(print())
   .andExpect(status().isOk())
   .andExpect(content().string("Hello Abaji"));

// OUTPUT:
// MockHttpServletRequest: HTTP Method = GET, Request URI = /greet
// Status = 200
// Body = Hello Abaji`],
            ['Redirect after POST.',
                r`mvc.perform(post("/orders").with(csrf())
        .param("item", "pen").param("qty", "2"))
   .andExpect(status().is3xxRedirection())
   .andExpect(redirectedUrl("/orders/42"))
   .andExpect(flash().attributeExists("message"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Standalone set-up.',
            r`MockMvc mvc = MockMvcBuilders
    .standaloneSetup(new GreetController())
    .build();
mvc.perform(get("/greet?name=Abaji")).andExpect(status().isOk());

// OUTPUT:
// passes without starting any Spring context`],
            ['Read the result.',
                r`MvcResult res = mvc.perform(get("/users/1")).andReturn();
String body = res.getResponse().getContentAsString();
System.out.println(body);

// OUTPUT:
// {"id":1,"name":"Abaji"}`]]
    )
};

export const smvc34Deep: Record<string, Deep> = {
    'mvc-thymeleaf-fragments': dv(
        [`<p>A fragment is just a part of a parsed template that the engine can locate by name or selector.</p><ul><li><b>Lookup:</b> <code>~{file :: name}</code> asks the <code>SpringResourceTemplateResolver</code> for <code>templates/file.html</code>.</li><li><b>Markup selectors:</b> the engine looks for an element with a matching <code>th:fragment</code> or a CSS-like selector.</li><li><b>Context:</b> the fragment runs with the same model variables, locale and request as the page.</li><li><b>Parameters:</b> the arguments become local variables inside the fragment.</li></ul>`,
            r`<!-- fragments/forms.html -->
<div th:fragment="field(label, name)">
    <label th:text="$` + r`{label}
">Label</label>
    <input type="text" th:name="$` + r`{name}
"/>
</div>

<!-- user.html -->
<div th:replace="~{fragments/forms :: field('Email', 'email')}"></div>

// OUTPUT:
// <div><label>Email</label><input type="text" name="email"/></div>`],
        [`<p>Syntax variants:</p><ul><li><b>th:insert:</b> inserts the fragment inside the host tag.</li><li><b>th:replace:</b> replaces the host tag with the fragment.</li><li><b>th:include:</b> deprecated.</li><li><b>Selectors:</b> <code>~{file :: #id}</code> or <code>~{file :: div.card}</code>.</li><li><b>Same file:</b> <code>~{:: name}</code> refers to the current template.</li><li><b>Without wrapper:</b> a fragment can be inside <code>th:block</code> to avoid an extra tag.</li></ul>`,
            r`<div th:insert="~{fragments/menu :: top}">inserted inside</div>
<div th:replace="~{fragments/menu :: top}">replaced</div>
<th:block th:replace="~{fragments/menu :: #footer}"/>

// OUTPUT:
// <div><nav>...</nav></div>      (insert keeps the host div)
// <nav>...</nav>                 (replace removes the host div)
// <footer>...</footer>           (selector by id)`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong path:</b> including <code>.html</code> or a bad folder gives <code>TemplateInputException</code>; write <code>fragments/footer</code>.</li><li><b>Wrong fragment name:</b> a typo gives an empty output or an error.</li><li><b>Insert vs replace:</b> using insert leaves nested duplicate tags.</li><li><b>Parameter count:</b> calling with the wrong number of arguments fails.</li><li><b>Template mode:</b> do not put a fragment of a different mode (text, javascript) in an HTML page.</li></ul>`,
            r`<!-- WRONG: extension and a typo -->
<div th:replace="~{fragments/footer.html :: foter}"></div>

<!-- RIGHT -->
<div th:replace="~{fragments/footer :: footer}"></div>

// OUTPUT:
// WRONG: TemplateInputException: Error resolving template [fragments/footer.html]
// RIGHT: footer is rendered`],
        [`<p>Performance and tuning:</p><ul><li><b>Cache on:</b> keep <code>spring.thymeleaf.cache=true</code> in production so templates are parsed once.</li><li><b>Small fragments:</b> include small, focused pieces; an enormous page of nested fragments adds lookup cost.</li><li><b>Fragment lookups in loops:</b> including a fragment inside a long <code>th:each</code> repeats the lookup, so keep loop bodies simple.</li><li><b>HTTP caching:</b> cache static parts at the browser or CDN level.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html

# OUTPUT:
# templates are parsed once and served from the cache (set false only in dev)`],
        [`<p>Real world: an admin portal with one <code>fragments/</code> folder holding <code>header</code>, <code>sidebar</code>, <code>pagination(page)</code> and <code>alert(kind, text)</code>. Every page reuses them, and a design change touches one file.</p>`,
            r`<!-- fragments/pagination.html -->
<nav th:fragment="pagination(page)">
    <a th:if="$` + r`{page.hasPrevious()}
"
       th:href="@{/orders(page=$` + r`{page.number - 1})}">Prev</a>
    <span th:text="$` + r`{page.number + 1}
">1</span>
    <a th:if="$` + r`{page.hasNext()}
"
       th:href="@{/orders(page=$` + r`{page.number + 1})}">Next</a>
</nav>

// OUTPUT: (page 2 of 5)
// Prev 2 Next`]
    ),
    'mvc-layouts-thymeleaf': dv(
        [`<p>The layout dialect works as a decorator.</p><ul><li><b>Step 1:</b> the content page is processed and its <code>layout:fragment</code> sections are collected.</li><li><b>Step 2:</b> the layout named in <code>layout:decorate</code> is loaded.</li><li><b>Step 3:</b> content sections replace the same named sections in the layout; the layout head is merged with the page head.</li><li><b>Step 4:</b> the merged tree is rendered with the model of the request.</li></ul>`,
            r`<!-- layouts/main.html -->
<head>
    <title layout:title-pattern="$CONTENT_TITLE - $LAYOUT_TITLE">Shop</title>
</head>
<body>
    <div layout:fragment="content"></div>
</body>

<!-- orders.html (title is Orders) -->

// OUTPUT:
// <title>Orders - Shop</title>`],
        [`<p>Variants:</p><ul><li><b>layout:decorate</b> on the html tag chooses the layout.</li><li><b>layout:fragment</b> defines or fills a slot.</li><li><b>layout:insert / layout:replace</b> include a fragment where the fragment can itself be decorated.</li><li><b>Default dialect-free layout:</b> pass fragment expressions as parameters.</li><li><b>Nested layouts:</b> a layout may decorate a bigger layout, for example admin on top of main.</li></ul>`,
            r`<!-- layouts/admin.html decorates main -->
<html layout:decorate="~{layouts/main}">
<body>
    <div layout:fragment="content">
        <aside>Admin menu</aside>
        <div layout:fragment="admin-content"></div>
    </div>
</body>
</html>

// OUTPUT:
// page -> admin layout -> main layout, three levels merged`],
        [`<p>Mistakes:</p><ul><li><b>Missing namespace:</b> without <code>xmlns:layout</code> the editor warns, though it still works.</li><li><b>No dependency:</b> <code>layout:decorate</code> is ignored and the page renders without the layout.</li><li><b>Slot name mismatch:</b> content in a slot that the layout lacks is dropped.</li><li><b>Script placement:</b> page scripts must go in a slot defined near the end of the layout body.</li></ul>`,
            r`<!-- layout -->
<div layout:fragment="content"></div>
<!-- page: WRONG slot name, content is silently lost -->
<div layout:fragment="contents"><h1>Orders</h1></div>

// OUTPUT:
// the output has an empty content area; fix the name to "content"`],
        [`<p>Performance: the decorator step adds a small cost per render, and template caching hides it. For the best speed in hot pages use plain fragment layouts, which need no merge step. Keep the layout light and avoid database calls in it by using <code>@ControllerAdvice</code> with <code>@ModelAttribute</code> for shared menu data, cached in a service.</p>`,
            r`@ControllerAdvice
class LayoutModel {
    private final MenuService menus;
    LayoutModel(MenuService menus) { this.menus = menus; }

    @ModelAttribute("menu")
    List<MenuItem> menu() {
        return menus.cachedMenu();     // cached, not queried on every page
    }
}

// OUTPUT:
// every view gets the "menu" model attribute for the layout navigation`],
        [`<p>Real world: a shop with three areas (public, customer, admin). One base layout holds CSS and scripts, and two child layouts add sidebars. Each page only writes its main content and is about ten lines long.</p>`,
            r`<!-- customer/orders.html -->
<html layout:decorate="~{layouts/customer}">
<body>
    <main layout:fragment="content">
        <h1>My orders</h1>
        <p th:text="#{orders.empty}">No orders yet.</p>
    </main>
</body>
</html>

// OUTPUT:
// base layout + customer sidebar + the "My orders" content`]
    ),
    'mvc-thymeleaf-security-integration': dv(
        [`<p>The extras module registers a <code>SpringSecurityDialect</code>.</p><ul><li><b>sec:authorize:</b> evaluates a Spring Security web expression through the <code>WebSecurityExpressionHandler</code> for the current request.</li><li><b>sec:authentication:</b> reads a property of the <code>Authentication</code> object from the <code>SecurityContext</code>.</li><li><b>CSRF:</b> a <code>RequestDataValueProcessor</code> adds the hidden token to forms generated by <code>th:action</code>.</li><li><b>Boot:</b> auto-configuration registers the dialect when the jar is on the classpath.</li></ul>`,
            r`<div sec:authorize="hasAnyRole('ADMIN','MANAGER')">
    <p>Role: <span sec:authentication="principal.authorities">roles</span></p>
</div>

// OUTPUT: (admin user)
// Role: [ROLE_ADMIN]`],
        [`<p>Variants:</p><ul><li><b>isAnonymous() / isAuthenticated() / isFullyAuthenticated()</b> for login state.</li><li><b>hasAuthority</b> and <b>hasRole</b> for permissions.</li><li><b>sec:authorize-url</b> checks a URL against the filter chain rules.</li><li><b>#authorization / #authentication</b> utility objects for use inside expressions.</li><li><b>#authorization.expression</b> to compute a boolean for <code>th:if</code>.</li></ul>`,
            r`<a sec:authorize-url="/admin/users" th:href="@{/admin/users}">Users</a>
<span th:if="@{#authorization.expression('isAnonymous()')}">
    <a th:href="@{/login}">Log in</a>
</span>

// OUTPUT: (anonymous)
// Log in link only; the Users link is hidden`],
        [`<p>Mistakes:</p><ul><li><b>Wrong artifact:</b> <code>springsecurity5</code> with Spring Security 6 shows nothing or fails.</li><li><b>UI only:</b> forgetting server side rules lets users open hidden URLs.</li><li><b>Role prefix:</b> <code>hasRole(&quot;ADMIN&quot;)</code> checks <code>ROLE_ADMIN</code>; use <code>hasAuthority</code> for exact names.</li><li><b>Plain HTML form:</b> a form with <code>action</code> instead of <code>th:action</code> has no CSRF token and POST returns 403.</li></ul>`,
            r`<!-- WRONG: no CSRF token added -->
<form action="/logout" method="post"><button>Out</button></form>
<!-- RIGHT -->
<form th:action="@{/logout}" method="post"><button>Out</button></form>

// OUTPUT:
// WRONG: 403 Forbidden (Invalid CSRF Token)
// RIGHT: logout succeeds`],
        [`<p>Performance: the dialect evaluates expressions per request using the existing context, so the cost is small. Avoid many <code>sec:authorize-url</code> checks in loops, because each one runs the matcher chain. Compute a boolean once in the controller or a <code>th:with</code> variable for repeated use.</p>`,
            r`<div th:with="admin=@{#authorization.expression('hasRole(''ADMIN'')')}">
    <button th:if="admin">Delete</button>
    <button th:if="admin">Export</button>
</div>

// OUTPUT:
// the role is evaluated once and reused for both buttons`],
        [`<p>Real world: a back-office app with roles USER, MANAGER and ADMIN. Menus, buttons and columns change by role in the template, while <code>SecurityFilterChain</code> rules and <code>@PreAuthorize</code> enforce the same rules on the server.</p>`,
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());
    return http.build();
}

// OUTPUT:
// /admin/** returns 403 for non admins, and the template also hides the link`]
    ),
    'mvc-unit-testing': dv(
        [`<p>A unit test is run by JUnit alone.</p><ul><li><b>Discovery:</b> the JUnit Platform finds classes and methods marked with <code>@Test</code>.</li><li><b>Instance:</b> a new test object is created per method.</li><li><b>Mocks:</b> Mockito creates subclasses or inline mocks at runtime with ByteBuddy.</li><li><b>No container:</b> no <code>ApplicationContext</code> starts, so no beans, proxies or auto-configuration exist.</li></ul>`,
            r`class DiscountServiceTest {
    private final DiscountService svc = new DiscountService();

    @Test
    void vipGetsTwentyPercent() {
        assertEquals(80.0, svc.apply("VIP", 100.0), 0.001);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0 (about 20 ms)`],
        [`<p>Useful styles:</p><ul><li><b>Plain JUnit:</b> for pure logic.</li><li><b>MockitoExtension:</b> for classes with dependencies.</li><li><b>@Nested:</b> to group scenarios.</li><li><b>@ParameterizedTest:</b> for tables of cases.</li><li><b>AssertJ:</b> fluent, readable checks.</li></ul>`,
            r`@Nested
class WhenCartIsEmpty {
    Cart cart = new Cart();

    @Test
    void totalIsZero() {
        assertThat(cart.total()).isEqualByComparingTo("0");
    }

    @Test
    void checkoutIsRejected() {
        assertThatThrownBy(cart::checkout)
            .isInstanceOf(IllegalStateException.class);
    }
}

// OUTPUT:
// CartTest$WhenCartIsEmpty > totalIsZero PASSED, checkoutIsRejected PASSED`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Starting Spring for plain logic:</b> remove <code>@SpringBootTest</code> and use <code>new</code>.</li><li><b>Testing the mock:</b> an assertion that only checks a stubbed value proves nothing.</li><li><b>Shared static state:</b> tests that depend on order are flaky.</li><li><b>Real time or random:</b> inject a <code>Clock</code> or a seed.</li><li><b>Many asserts about unrelated things:</b> split the test.</li></ul>`,
            r`// WRONG: heavy and slow for a pure calculation
@SpringBootTest
class SlowTest { @Autowired PriceCalculator calc; }

// RIGHT
class FastTest { PriceCalculator calc = new PriceCalculator(); }

// OUTPUT:
// WRONG: about 3 s startup per context; RIGHT: milliseconds`],
        [`<p>Performance: thousands of unit tests should finish in seconds. Keep them free of I/O and sleeps, run them in parallel when they are independent (<code>junit.jupiter.execution.parallel.enabled=true</code>) and run them first in the build so failures show early.</p>`,
            r`# src/test/resources/junit-platform.properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent

# OUTPUT:
# independent test classes run on several threads (varies by machine)`],
        [`<p>Real world: a team keeps business rules in plain service classes, covers them with hundreds of unit tests that run in the commit stage of the CI pipeline, and keeps only a few slow tests for the full application.</p>`,
            r`@Test
void freeShippingAboveThreshold() {
    ShippingPolicy policy = new ShippingPolicy(new BigDecimal("500"));
    assertEquals(BigDecimal.ZERO, policy.fee(new BigDecimal("600")));
    assertEquals(new BigDecimal("40"), policy.fee(new BigDecimal("100")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),
    'mvc-controller-testing': dv(
        [`<p>How <code>@WebMvcTest</code> works inside.</p><ul><li><b>Context:</b> it uses a type filter that keeps only <code>@Controller</code>, <code>@ControllerAdvice</code>, <code>@JsonComponent</code>, converters, filters and <code>WebMvcConfigurer</code>.</li><li><b>Auto-config:</b> only web related auto-configuration is applied.</li><li><b>MockMvc:</b> built on the context and driven through the real <code>DispatcherServlet</code>, handler mappings, argument resolvers and message converters.</li><li><b>Mocks:</b> <code>@MockBean</code> beans are registered in the context in place of real ones.</li></ul>`,
            r`@WebMvcTest(ProductController.class)
class ProductControllerTest {
    @Autowired MockMvc mvc;
    @MockBean ProductService service;

    @Test
    void listsProducts() throws Exception {
        when(service.all()).thenReturn(List.of(new Product(1L, "Pen")));
        mvc.perform(get("/api/products"))
           .andExpect(jsonPath("$[0].name").value("Pen"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Options:</p><ul><li><b>@WebMvcTest(controllers = X.class):</b> limit the slice to one controller.</li><li><b>@Import:</b> add a security config or a converter that the slice skipped.</li><li><b>@WithMockUser, csrf():</b> for secured endpoints.</li><li><b>ObjectMapper:</b> autowire it to build request JSON.</li><li><b>@TestConfiguration:</b> add small test beans.</li></ul>`,
            r`@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)
class OrderSecurityTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockBean OrderService service;

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCreate() throws Exception {
        mvc.perform(post("/api/orders").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new OrderRequest("pen", 2))))
           .andExpect(status().isCreated());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Mistakes:</p><ul><li><b>Missing @MockBean:</b> <code>NoSuchBeanDefinitionException</code> for the service.</li><li><b>403 on POST:</b> add <code>csrf()</code> and a user.</li><li><b>Using @SpringBootTest everywhere:</b> slow, when a slice is enough.</li><li><b>Hand-written JSON strings:</b> they break on rename; serialize with <code>ObjectMapper</code>.</li><li><b>Not checking the failure path:</b> test 400, 404 and 500 mapping too.</li></ul>`,
            r`// WRONG: context fails, UserService is not part of the slice
@WebMvcTest(UserController.class)
class BadTest { @Autowired MockMvc mvc; }

// RIGHT
@WebMvcTest(UserController.class)
class GoodTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;
}

// OUTPUT:
// WRONG: UnsatisfiedDependencyException: No qualifying bean of type UserService
// RIGHT: context starts in about a second`],
        [`<p>Performance: slices start much faster than the full context. Contexts are cached by configuration, so many test classes with the same <code>@MockBean</code> set share one context. A different <code>@MockBean</code> set in each class creates a new context each time, so put shared mocks in a base class or a <code>@TestConfiguration</code>.</p>`,
            r`abstract class WebTestBase {
    @Autowired protected MockMvc mvc;
    @MockBean protected UserService userService;
    @MockBean protected OrderService orderService;
}

// OUTPUT:
// subclasses share one cached context instead of building one per class`],
        [`<p>Real world: a REST API has a controller test for every endpoint covering success, validation error, not found and forbidden. These tests act as living documentation of the contract, and they catch changes in status codes and JSON fields before release.</p>`,
            r`@Test
void createReturns201WithLocation() throws Exception {
    when(service.create(any())).thenReturn(new User(7L, "Abaji"));
    mvc.perform(post("/users").with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Abaji\"}"))
       .andExpect(status().isCreated())
       .andExpect(header().string("Location", endsWith("/users/7")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),
    'mvc-service-testing': dv(
        [`<p>How the service test works inside.</p><ul><li><b>MockitoExtension:</b> before each test it creates fields annotated with <code>@Mock</code>, then builds the <code>@InjectMocks</code> object (constructor first, then setter, then field).</li><li><b>Strictness:</b> the extension uses strict stubs, so unused stubbing fails the test.</li><li><b>No proxies:</b> annotations like <code>@Transactional</code> and <code>@Cacheable</code> do nothing here.</li><li><b>After:</b> mocks are reset and the extension checks for unused stubs.</li></ul>`,
            r`@ExtendWith(MockitoExtension.class)
class TransferServiceTest {
    @Mock AccountRepository accounts;
    @InjectMocks TransferService service;

    @Test
    void movesMoney() {
        Account a = new Account(1L, 500), b = new Account(2L, 100);
        when(accounts.findById(1L)).thenReturn(Optional.of(a));
        when(accounts.findById(2L)).thenReturn(Optional.of(b));
        service.transfer(1L, 2L, 200);
        assertEquals(300, a.getBalance());
        assertEquals(300, b.getBalance());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Variants:</p><ul><li><b>BDD style:</b> <code>given(...).willReturn(...)</code> and <code>then(mock).should().save(...)</code> from <code>BDDMockito</code>.</li><li><b>Answers:</b> <code>thenAnswer</code> to return the argument.</li><li><b>InOrder:</b> check the order of calls.</li><li><b>lenient():</b> allow an unused stub in a shared setup.</li><li><b>Real collaborators:</b> use a small fake or in-memory repository instead of a mock when behaviour is simple.</li></ul>`,
            r`@Test
void savesAndNotifies() {
    given(repo.save(any(Order.class))).willAnswer(i -> i.getArgument(0));
    service.place("Abaji", 2);
    InOrder order = inOrder(repo, notifier);
    order.verify(repo).save(any(Order.class));
    order.verify(notifier).orderPlaced(any());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Mistakes:</p><ul><li><b>Mocking everything:</b> a test that only repeats the implementation breaks on every refactor.</li><li><b>Field injection in the service:</b> <code>@InjectMocks</code> may leave a field null; use constructor injection.</li><li><b>Ignoring the return value:</b> forgetting to assert the result.</li><li><b>Unused stubs:</b> <code>UnnecessaryStubbingException</code>.</li><li><b>Testing the repository query with a mock:</b> use <code>@DataJpaTest</code> for real queries.</li></ul>`,
            r`// WRONG: stub never used, strict mode fails the test
when(repo.findAll()).thenReturn(List.of());
service.get(1L);   // calls findById only

// RIGHT: stub what the code under test really calls
when(repo.findById(1L)).thenReturn(Optional.of(new Order(1L, "NEW")));

// OUTPUT:
// WRONG: UnnecessaryStubbingException: Unnecessary stubbings detected
// RIGHT: test passes`],
        [`<p>Performance: service tests are the cheapest valuable tests and should run in milliseconds. Avoid <code>Thread.sleep</code>, build test data with small builder methods, and keep a single shared fixture class for reusable objects.</p>`,
            r`final class OrderMother {
    static Order newOrder() { return new Order(1L, "NEW"); }
    static Order paidOrder() { return new Order(2L, "PAID"); }
}
// use: when(repo.findById(1L)).thenReturn(Optional.of(OrderMother.newOrder()));

// OUTPUT:
// less duplicated setup code and shorter tests`],
        [`<p>Real world: a payment service has rules for limits, currency and duplicates. Each rule has its own test, and the repository and the gateway are mocked. The tests document the rules and protect them during refactoring.</p>`,
            r`@Test
void duplicatePaymentIsRejected() {
    when(payments.existsByReference("REF-1")).thenReturn(true);
    assertThrows(DuplicatePaymentException.class,
        () -> service.pay("REF-1", new BigDecimal("50")));
    verifyNoInteractions(gateway);
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0 (gateway was never called)`]
    ),
    'mvc-integration-testing': dv(
        [`<p>How an integration test runs inside.</p><ul><li><b>Bootstrap:</b> <code>@SpringBootTest</code> finds the <code>@SpringBootConfiguration</code> class and starts the full context.</li><li><b>Cache:</b> the <code>ContextCache</code> reuses contexts that have the same key (configuration, profiles, properties, mock beans).</li><li><b>Transactions:</b> <code>TransactionalTestExecutionListener</code> starts a transaction before the test and rolls it back after.</li><li><b>Web:</b> MOCK mode uses a <code>MockServletContext</code>; RANDOM_PORT starts embedded Tomcat.</li></ul>`,
            r`@SpringBootTest
@AutoConfigureMockMvc
class ProductApiIT {
    @Autowired MockMvc mvc;
    @Autowired ProductRepository repo;

    @Test
    void returnsStoredProduct() throws Exception {
        repo.save(new Product(null, "Pen"));
        mvc.perform(get("/api/products"))
           .andExpect(jsonPath("$[0].name").value("Pen"));
    }
}

// OUTPUT:
// Started ProductApiIT in 2.8 seconds (varies)
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Options:</p><ul><li><b>@DataJpaTest:</b> a repository slice with an embedded database.</li><li><b>@Testcontainers:</b> a real MySQL or PostgreSQL in Docker.</li><li><b>@DynamicPropertySource:</b> point properties at the container.</li><li><b>@Sql:</b> load test data from a script.</li><li><b>@MockBean:</b> replace external clients such as a payment gateway.</li></ul>`,
            r`@SpringBootTest
@Testcontainers
class MySqlIT {
    @Container
    static MySQLContainer<?> db = new MySQLContainer<>("mysql:8.0");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", db::getJdbcUrl);
        r.add("spring.datasource.username", db::getUsername);
        r.add("spring.datasource.password", db::getPassword);
    }
}

// OUTPUT:
// a MySQL container starts, and the application uses it during the test`],
        [`<p>Mistakes:</p><ul><li><b>@DirtiesContext everywhere:</b> rebuilds the context and slows the suite.</li><li><b>Data left behind:</b> tests depend on each other; roll back or clean up.</li><li><b>Real external calls:</b> mock or stub third-party services.</li><li><b>H2 differences:</b> SQL that works in H2 but fails in MySQL; use Testcontainers for critical queries.</li><li><b>Hard-coded port:</b> use <code>@LocalServerPort</code>.</li></ul>`,
            r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PortIT {
    @LocalServerPort int port;

    @Test
    void usesRandomPort() {
        System.out.println("http://localhost:" + port);
    }
}

// OUTPUT: (varies)
// http://localhost:54213`],
        [`<p>Performance: the largest cost is context start-up. Keep configurations identical across test classes so the cache is reused, use slices where possible, share one container for all tests with a static field, and run integration tests in a separate build phase with Failsafe.</p>`,
            r`@SpringBootTest
abstract class IntegrationTestBase {
    static final MySQLContainer<?> DB = new MySQLContainer<>("mysql:8.0");
    static { DB.start(); }          // one container for the whole suite
}

// OUTPUT:
// first test pays the start-up cost, later tests reuse context and container`],
        [`<p>Real world: before each release the pipeline runs integration tests for the main journeys, such as register, login, place order and pay. They run against a containerized database and a stubbed payment gateway, and they catch wiring and mapping errors that unit tests cannot see.</p>`,
            r`@Test
@WithMockUser
void placeOrderJourney() throws Exception {
    mvc.perform(post("/api/orders").with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"item\":\"pen\",\"qty\":2}"))
       .andExpect(status().isCreated());
    mvc.perform(get("/api/orders"))
       .andExpect(jsonPath("$.length()").value(1));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),
    'mvc-junit': dv(
        [`<p>JUnit 5 is modular.</p><ul><li><b>Platform:</b> launches test engines and reports results to Maven, Gradle or the IDE.</li><li><b>Jupiter engine:</b> discovers <code>@Test</code> methods and runs the lifecycle.</li><li><b>Extension model:</b> callbacks such as <code>BeforeEachCallback</code> and <code>ParameterResolver</code> let extensions like <code>SpringExtension</code> inject beans into test parameters.</li><li><b>Per-method instance:</b> a fresh object for each test unless <code>@TestInstance(PER_CLASS)</code> is used.</li></ul>`,
            r`@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = AppConfig.class)
class WithSpringTest {
    @Autowired GreetingService service;     // injected by the extension

    @Test
    void greets() {
        assertEquals("Hello", service.greet());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Options:</p><ul><li><b>@Disabled, @EnabledOnOs, @EnabledIfSystemProperty:</b> conditional tests.</li><li><b>@RepeatedTest(n):</b> repeat a test.</li><li><b>@Timeout:</b> fail slow tests.</li><li><b>@TestMethodOrder:</b> control order when you must.</li><li><b>@Tag:</b> group tests for the build.</li><li><b>@MethodSource, @EnumSource:</b> more parameter sources.</li></ul>`,
            r`@Tag("slow")
class ReportTest {
    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    void buildsFast() { /* ... */ }

    @ParameterizedTest
    @MethodSource("pairs")
    void multiplies(int a, int b, int expected) {
        assertEquals(expected, a * b);
    }

    static Stream<Arguments> pairs() {
        return Stream.of(Arguments.of(2, 3, 6), Arguments.of(4, 5, 20));
    }
}

// OUTPUT:
// buildsFast PASSED, multiplies [1] PASSED, multiplies [2] PASSED`],
        [`<p>Mistakes:</p><ul><li><b>Mixing JUnit 4 and 5 imports:</b> <code>org.junit.Test</code> is ignored by Jupiter.</li><li><b>Non-static @BeforeAll:</b> fails unless <code>PER_CLASS</code>.</li><li><b>Test order dependence:</b> tests share state.</li><li><b>Swapped arguments:</b> <code>assertEquals(actual, expected)</code> gives confusing messages.</li><li><b>Catching exceptions manually:</b> use <code>assertThrows</code>.</li></ul>`,
            r`// WRONG: JUnit 4 annotation, silently not run by Jupiter
import org.junit.Test;
// RIGHT
import org.junit.jupiter.api.Test;

// OUTPUT:
// WRONG: "No tests found" or test skipped; RIGHT: test runs`],
        [`<p>Performance: enable parallel execution for independent tests, tag slow tests and run them in a separate stage, and avoid heavy work in <code>@BeforeEach</code>; move expensive setup to <code>@BeforeAll</code> when tests only read the data.</p>`,
            r`@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ExpensiveSetupTest {
    List<String> data;

    @BeforeAll
    void load() { data = loadBigFile(); }     // once, non static allowed

    @Test void a() { assertFalse(data.isEmpty()); }
    @Test void b() { assertTrue(data.size() > 10); }
}

// OUTPUT:
// the file is loaded once for both tests`],
        [`<p>Real world: the build runs <code>mvn test</code> on every push. Failing tests block the merge, reports are published by the CI server, and tags let the nightly build run slow tests that the normal build skips.</p>`,
            r`mvn test -Dgroups="fast"
mvn test -DexcludedGroups="slow"

// OUTPUT:
// [INFO] Tests run: 120, Failures: 0, Errors: 0, Skipped: 0`]
    ),
    'mvc-mockito': dv(
        [`<p>How Mockito works inside.</p><ul><li><b>Creation:</b> it generates a subclass or uses inline instrumentation with ByteBuddy, so the mock intercepts every call.</li><li><b>Recording:</b> a call inside <code>when(...)</code> is remembered as the ongoing stubbing, and <code>thenReturn</code> attaches the answer.</li><li><b>Matching:</b> on each call it looks for a matching stub, newest first.</li><li><b>Verification:</b> every invocation is stored, and <code>verify</code> compares the list with the expected calls.</li></ul>`,
            r`Calculator calc = mock(Calculator.class);
when(calc.add(2, 3)).thenReturn(5);
when(calc.add(2, 3)).thenReturn(50);     // newest stub wins

System.out.println(calc.add(2, 3));
System.out.println(calc.add(9, 9));      // not stubbed, default 0

// OUTPUT:
// 50
// 0`],
        [`<p>Variants:</p><ul><li><b>thenReturn / thenThrow / thenAnswer:</b> result, exception or computed value.</li><li><b>Consecutive calls:</b> <code>thenReturn(1, 2, 3)</code>.</li><li><b>verify modes:</b> <code>times</code>, <code>never</code>, <code>atLeastOnce</code>, <code>atMost</code>.</li><li><b>Deep stubs:</b> <code>RETURNS_DEEP_STUBS</code> for chained calls.</li><li><b>BDDMockito:</b> given, willReturn, then.</li><li><b>MockedStatic:</b> mock static methods inside a try-with-resources.</li></ul>`,
            r`Iterator<String> it = mock(Iterator.class);
when(it.next()).thenReturn("a", "b").thenThrow(new NoSuchElementException());

System.out.println(it.next() + it.next());
try { it.next(); } catch (NoSuchElementException e) { System.out.println("done"); }

try (MockedStatic<UUID> uuid = mockStatic(UUID.class)) {
    uuid.when(UUID::randomUUID).thenReturn(new UUID(0, 1));
    System.out.println(UUID.randomUUID());
}

// OUTPUT:
// ab
// done
// 00000000-0000-0000-0000-000000000001`],
        [`<p>Mistakes:</p><ul><li><b>Stubbing a final or static method</b> without inline mock maker or <code>mockStatic</code>.</li><li><b>Mixing matchers and values:</b> <code>eq()</code> for the rest.</li><li><b>Stubbing a spy with when:</b> it calls the real method; use <code>doReturn</code>.</li><li><b>Mocking value types</b> like <code>String</code> or a DTO: create real ones.</li><li><b>Verifying getters:</b> verifies implementation, not behaviour.</li></ul>`,
            r`List<String> spy = spy(new ArrayList<>());
// WRONG: calls the real get(0) first and throws IndexOutOfBoundsException
// when(spy.get(0)).thenReturn("x");
// RIGHT
doReturn("x").when(spy).get(0);
System.out.println(spy.get(0));

// OUTPUT:
// x`],
        [`<p>Performance: creating mocks is cheap but not free. Use <code>@Mock</code> with the extension rather than creating mocks in loops, avoid deep stubs in hot tests, and prefer small real objects for plain data.</p>`,
            r`@ExtendWith(MockitoExtension.class)
class FastMockTest {
    @Mock PaymentGateway gateway;           // created once per test by the extension

    @Test
    void charges() {
        when(gateway.charge(anyLong())).thenReturn(true);
        assertTrue(gateway.charge(100L));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Real world: a notification service calls an email client and an SMS client. Tests mock both, check that the email is sent when the user prefers it, that the SMS is never used, and that a failure of the email client is handled with a retry.</p>`,
            r`@Test
void retriesOnceWhenEmailFails() {
    when(email.send(any())).thenThrow(new MailException("down"))
                           .thenReturn(true);
    boolean ok = service.notifyUser(user);
    assertTrue(ok);
    verify(email, times(2)).send(any());
    verifyNoInteractions(sms);
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),
    'mvc-mockmvc': dv(
        [`<p>How MockMvc works inside.</p><ul><li><b>Request:</b> the builder creates a <code>MockHttpServletRequest</code> with path, params, headers and body.</li><li><b>Dispatch:</b> the request goes through the filter chain (if registered) and <code>DispatcherServlet.doDispatch</code>, which uses the real handler mapping, argument resolvers, validators, return value handlers and exception resolvers.</li><li><b>Response:</b> a <code>MockHttpServletResponse</code> records status, headers and body.</li><li><b>Result:</b> <code>MvcResult</code> gives access to the handler, model, view and response.</li></ul>`,
            r`MvcResult res = mvc.perform(get("/users/1"))
    .andExpect(status().isOk())
    .andReturn();

HandlerMethod hm = (HandlerMethod) res.getHandler();
System.out.println(hm.getMethod().getName());
System.out.println(res.getResponse().getContentType());

// OUTPUT:
// getUser
// application/json`],
        [`<p>Options:</p><ul><li><b>Setup:</b> <code>@AutoConfigureMockMvc</code>, <code>webAppContextSetup</code>, <code>standaloneSetup</code>.</li><li><b>Default request:</b> <code>defaultRequest(...)</code> and <code>apply(springSecurity())</code>.</li><li><b>Filters:</b> <code>addFilters(...)</code> in a manual build.</li><li><b>Spring 6.2 and Boot 3.4:</b> <code>MockMvcTester</code> offers AssertJ style assertions.</li><li><b>Multipart:</b> <code>multipart(...).file(...)</code>.</li></ul>`,
            r`MockMultipartFile file = new MockMultipartFile(
    "file", "a.txt", "text/plain", "hello".getBytes());

mvc.perform(multipart("/upload").file(file).with(csrf()))
   .andExpect(status().isOk())
   .andExpect(content().string("uploaded a.txt"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
        [`<p>Mistakes:</p><ul><li><b>Expecting a followed redirect:</b> check the redirect URL instead.</li><li><b>No content type on POST body:</b> gives 415.</li><li><b>Missing Accept header:</b> may give 406 for JSON.</li><li><b>Forgetting charset or encoding</b> for non-ASCII text in <code>content().string</code>.</li><li><b>Assuming container behaviour:</b> error pages and some filters are not part of MockMvc.</li></ul>`,
            r`// WRONG: body is sent without a content type -> 415
mvc.perform(post("/users").content("{\"name\":\"Abaji\"}"))
   .andExpect(status().isCreated());

// RIGHT
mvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Abaji\"}"))
   .andExpect(status().isCreated());

// OUTPUT:
// WRONG: Status expected:<201> but was:<415>
// RIGHT: passes`],
        [`<p>Performance: MockMvc is fast because it skips networking. Keep the set-up small (<code>@WebMvcTest</code> over full context), reuse one <code>MockMvc</code> per class, and avoid <code>print()</code> in the normal run since it makes the output very long.</p>`,
            r`mvc.perform(get("/health"))
   .andExpect(status().isOk());      // no andDo(print()) in routine tests

// OUTPUT:
// a single request takes a few milliseconds (varies)`],
        [`<p>Real world: a team documents its REST API with tests. Each MockMvc test checks status, headers and JSON fields, and the same tests can feed Spring REST Docs to generate accurate API documentation.</p>`,
            r`mvc.perform(get("/api/orders/5").accept(MediaType.APPLICATION_JSON))
   .andExpect(status().isOk())
   .andExpect(header().string("Content-Type", containsString("json")))
   .andExpect(jsonPath("$.id").value(5))
   .andExpect(jsonPath("$.items", hasSize(2)));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    )
};
