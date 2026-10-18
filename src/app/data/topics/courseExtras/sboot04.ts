// Spring extras, batch sboot04 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const sboot04Extras: Record<string, Extra> = {
    'sb-spring-boot-starter': x(
        ['<b>Starter</b> is a curated dependency descriptor: one Maven or Gradle entry such as <code>spring-boot-starter-web</code> pulls in every library a feature needs, with compatible versions.',
            '<b>Naming</b>: official starters are called <code>spring-boot-starter-*</code>; third-party ones use <code>*-spring-boot-starter</code>.',
            '<b>Core starter</b>: <code>spring-boot-starter</code> itself brings Spring Core, auto-configuration, logging (Logback) and YAML support, and every other starter depends on it.'],
        ['<b>BOM</b>: the parent <code>spring-boot-starter-parent</code> or the <code>spring-boot-dependencies</code> import manages versions, so you leave out the version tag.',
            '<b>No code inside</b>: a starter jar is nearly empty; the behavior comes from the transitive libraries plus the auto-configuration jar.',
            '<b>Exclusions</b>: swap a default with <code>exclusions</code>, for example Tomcat for Jetty, or Logback for Log4j2.'],
        ['<b>Custom starter</b>: ship an <code>autoconfigure</code> module and a thin starter module that depends on it, registered in <code>AutoConfiguration.imports</code>.',
            '<b>Dependency hygiene</b>: run <code>mvn dependency:tree</code> to find clashes, and prefer starters over hand-picked versions.',
            '<b>Startup cost</b>: every starter adds classpath conditions that activate beans, so remove unused starters to shrink the jar and startup time.'],
        [['F', 'What is a Spring Boot starter?', 'A single dependency that brings a set of related libraries with tested versions for one feature, such as web or JPA.'],
            ['F', 'Why do we not write versions for starters?', 'The Boot parent or BOM manages them.'],
            ['M', 'Does a starter contain code?', 'Almost none; it is a pom with dependencies, and auto-configuration does the wiring.'],
            ['M', 'How do you replace Tomcat with Jetty?', 'Exclude spring-boot-starter-tomcat from the web starter and add spring-boot-starter-jetty.'],
            ['S', 'How do you build your own starter?', 'Create an autoconfigure module with conditional configuration classes, list them in the AutoConfiguration.imports file, and add a starter pom that depends on it.'],
            ['S', 'How do you find why a library is on the classpath?', 'Use mvn dependency:tree or gradle dependencies and read which starter brings it.']],
        [['Minimal starter dependency.',
            r`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

// OUTPUT:
// Maven resolves spring-webmvc, jackson, tomcat-embed-core and logging
// with versions chosen by the Boot BOM`],
            ['Inspect what a starter brings.',
                r`mvn dependency:tree -Dincludes=org.apache.tomcat.embed

// OUTPUT: (varies)
// [INFO] com.example:demo:jar:0.0.1
// [INFO] \- org.springframework.boot:spring-boot-starter-web:jar:3.x
// [INFO]    \- spring-boot-starter-tomcat
// [INFO]       \- org.apache.tomcat.embed:tomcat-embed-core`]],
        [['Swap Tomcat for Jetty.',
            r`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>

// OUTPUT:
// Jetty started on port 8080 (http/1.1)`],
            ['Gradle with the version-free starter.',
                r`dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

// OUTPUT:
// versions come from the org.springframework.boot Gradle plugin`]]
    ),

    'sb-spring-boot-starter-web': x(
        ['<b>spring-boot-starter-web</b> is the starter for building web applications and REST APIs: it brings Spring MVC, Jackson for JSON and an embedded Tomcat server.',
            '<b>Run</b>: add the starter, write a <code>@RestController</code>, start <code>main</code>, and the app listens on port 8080 with no server install.',
            '<b>Configure</b> with <code>server.port</code>, <code>server.servlet.context-path</code> and similar properties in <code>application.properties</code>.'],
        ['<b>Auto-configuration</b> registers <code>DispatcherServlet</code>, message converters, error handling and static resource mapping.',
            '<b>JSON</b>: Jackson converts objects to JSON through <code>MappingJackson2HttpMessageConverter</code>, tuned with <code>spring.jackson.*</code> properties.',
            '<b>Static content</b> in <code>/static</code> or <code>/public</code> on the classpath is served without any controller.'],
        ['<b>Server choice</b>: exclude the Tomcat starter to use Jetty or Undertow; tune threads with <code>server.tomcat.threads.max</code>.',
            '<b>Virtual threads</b>: on Java 21 with a recent Boot 3 version, <code>spring.threads.virtual.enabled=true</code> serves requests on virtual threads.',
            '<b>Not reactive</b>: for non-blocking code use <code>spring-boot-starter-webflux</code>; having both makes MVC win.'],
        [['F', 'What does spring-boot-starter-web give you?', 'Spring MVC, Jackson and an embedded Tomcat, ready to serve REST endpoints.'],
            ['F', 'How do you change the port?', 'Set server.port in application.properties.'],
            ['M', 'Which servlet handles requests?', 'DispatcherServlet, registered by auto-configuration.'],
            ['M', 'How do you serve static files?', 'Put them under src/main/resources/static; Boot maps them automatically.'],
            ['S', 'How do you run on Jetty?', 'Exclude spring-boot-starter-tomcat and add spring-boot-starter-jetty.'],
            ['S', 'What if both web and webflux starters are present?', 'Boot starts a servlet-based MVC application, because MVC takes precedence.']],
        [['Smallest web app.',
            r`@SpringBootApplication
@RestController
public class DemoApp {
    @GetMapping("/hello")
    String hello() { return "Hello Boot"; }

    public static void main(String[] args) {
        SpringApplication.run(DemoApp.class, args);
    }
}

// OUTPUT:
// Tomcat started on port 8080 (http) with context path ''
// GET /hello -> 200 Hello Boot`],
            ['Port and context path.',
                r`server.port=9090
server.servlet.context-path=/api

# OUTPUT:
# GET http://localhost:9090/api/hello -> 200 Hello Boot`]],
        [['JSON response from a record.',
            r`record User(long id, String name) {}

@RestController
class UserController {
    @GetMapping("/users/1")
    User one() { return new User(1, "Abaji"); }
}

// OUTPUT:
// GET /users/1 -> 200 {"id":1,"name":"Abaji"}`],
            ['Test with MockMvc.',
                r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void returnsUser() throws Exception {
        mvc.perform(get("/users/1"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Abaji"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'sb-spring-boot-starter-data-jpa': x(
        ['<b>spring-boot-starter-data-jpa</b> is the starter for relational database access: it brings Spring Data JPA, Hibernate as the JPA provider, JDBC and a HikariCP connection pool.',
            '<b>Repository</b>: declare an interface extending <code>JpaRepository&lt;Entity, Id&gt;</code> and Spring creates the implementation at runtime.',
            '<b>Setup</b>: add a JDBC driver, set <code>spring.datasource.url</code>, username and password, and mark classes with <code>@Entity</code>.'],
        ['<b>DataSource</b> is auto-configured from the <code>spring.datasource.*</code> properties and pooled by HikariCP.',
            '<b>Schema</b>: <code>spring.jpa.hibernate.ddl-auto</code> accepts none, validate, update, create and create-drop; use <code>validate</code> or migrations in production.',
            '<b>Derived queries</b>: a method name such as <code>findByEmail</code> becomes a query; use <code>@Query</code> for custom JPQL.'],
        ['<b>Transactions</b>: repository methods are transactional, and services should add <code>@Transactional</code> to group several calls.',
            '<b>Open-in-view</b> is on by default and keeps a session through the web layer; set <code>spring.jpa.open-in-view=false</code> to avoid lazy loading surprises and held connections.',
            '<b>N+1 selects</b> appear with lazy associations; fix with <code>JOIN FETCH</code> or <code>@EntityGraph</code>.'],
        [['F', 'What does the JPA starter include?', 'Spring Data JPA, Hibernate, Jakarta Persistence API and HikariCP.'],
            ['F', 'How do you define a repository?', 'Extend JpaRepository for your entity and id type.'],
            ['M', 'What does ddl-auto=update do?', 'Hibernate alters the schema to match entities; fine for demos, not for production.'],
            ['M', 'How is a method like findByEmail implemented?', 'Spring Data parses the method name and builds the query at startup.'],
            ['S', 'What is the N+1 problem and the fix?', 'One query for parents plus one per child on lazy access; use JOIN FETCH or an entity graph.'],
            ['S', 'Why disable open-in-view?', 'It keeps a database connection open during view rendering and hides lazy loading in controllers.']],
        [['Entity and repository.',
            r`@Entity
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    // getters and setters omitted
}

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
}

// OUTPUT:
// select c.id, c.email from customer c where c.email=?`],
            ['Datasource properties.',
                r`spring.datasource.url=jdbc:mysql://localhost:3306/shop
spring.datasource.username=app
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

# OUTPUT:
# HikariPool-1 - Start completed.`]],
        [['Repository test with an embedded database.',
            r`@DataJpaTest
class CustomerRepositoryTest {
    @Autowired CustomerRepository repo;

    @Test
    void findsByEmail() {
        Customer c = new Customer();
        c.setEmail("a@x.com");
        repo.save(c);
        assertTrue(repo.findByEmail("a@x.com").isPresent());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Fetch join against N+1.',
                r`public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("select o from Order o join fetch o.items where o.id = :id")
    Optional<Order> findWithItems(@Param("id") Long id);
}

// OUTPUT:
// one select joins orders and items instead of 1 + N selects`]]
    ),

    'sb-spring-boot-starter-validation': x(
        ['<b>spring-boot-starter-validation</b> is the starter for bean validation: it brings the Jakarta Validation API and Hibernate Validator so you can check input with annotations.',
            '<b>Constraints</b>: put <code>@NotBlank</code>, <code>@Email</code>, <code>@Size</code>, <code>@Min</code> and similar annotations on fields.',
            '<b>Trigger</b>: add <code>@Valid</code> on a <code>@RequestBody</code> parameter, and a bad request is rejected with HTTP 400.'],
        ['<b>MethodArgumentNotValidException</b> is thrown when a body fails validation; handle it in a <code>@RestControllerAdvice</code> for a clean error JSON.',
            '<b>BindingResult</b> placed right after the parameter lets the method inspect errors itself instead of failing.',
            '<b>Path and query values</b>: put <code>@Validated</code> on the controller class to validate <code>@RequestParam</code> and <code>@PathVariable</code> with constraints.'],
        ['<b>Groups</b> apply different rules for create and update, using the <code>groups</code> attribute and <code>@Validated</code>.',
            '<b>Custom constraint</b>: write an annotation plus a <code>ConstraintValidator</code> implementation; it can inject Spring beans.',
            '<b>Messages</b> can move to <code>ValidationMessages.properties</code> for translation.'],
        [['F', 'What does the validation starter provide?', 'Jakarta Bean Validation with the Hibernate Validator implementation.'],
            ['F', 'Which annotation triggers validation of a request body?', '@Valid (or @Validated) on the method parameter.'],
            ['M', 'Which exception signals a failed body validation?', 'MethodArgumentNotValidException, mapped to 400 by default.'],
            ['M', 'Difference between @NotNull, @NotEmpty and @NotBlank?', 'NotNull rejects null, NotEmpty also rejects empty, NotBlank also rejects whitespace-only strings.'],
            ['S', 'How do you validate query parameters?', 'Annotate the controller with @Validated and put constraints on the parameters; failures raise ConstraintViolationException.'],
            ['S', 'Why did validation stop working after upgrading to Boot 2.3 or later?', 'The validation starter is no longer included in the web starter and must be added explicitly.']],
        [['DTO with constraints.',
            r`public record SignupRequest(
    @NotBlank String name,
    @Email String email,
    @Min(18) int age) {}

@PostMapping("/signup")
ResponseEntity<String> signup(@Valid @RequestBody SignupRequest req) {
    return ResponseEntity.ok("welcome " + req.name());
}

// OUTPUT:
// POST {"name":"","email":"bad","age":10} -> 400 Bad Request`],
            ['Central error handler.',
                r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
        Map<String, String> m = new TreeMap<>();
        e.getBindingResult().getFieldErrors()
            .forEach(f -> m.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(m);
    }
}

// OUTPUT:
// 400 {"age":"must be greater than or equal to 18","email":"must be a well-formed email address"}`]],
        [['Custom constraint.',
            r`@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "invalid phone";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<Phone, String> {
    public boolean isValid(String v, ConstraintValidatorContext c) {
        return v != null && v.matches("\\d{10}");
    }
}

// OUTPUT:
// @Phone on "12345" -> violation "invalid phone"`],
            ['MockMvc validation test.',
                r`mvc.perform(post("/signup")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"\",\"email\":\"x\",\"age\":5}"))
   .andExpect(status().isBadRequest());

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'sb-spring-boot-starter-security': x(
        ['<b>spring-boot-starter-security</b> is the starter that adds Spring Security: authentication and authorization for web applications, protecting every endpoint by default.',
            '<b>Default behavior</b>: after adding it, all URLs need login; Boot creates a user named <code>user</code> with a random password printed in the startup log.',
            '<b>Customize</b> by declaring a <code>SecurityFilterChain</code> bean to say which paths are public and which need roles.'],
        ['<b>Filter chain</b>: security is a chain of servlet filters in front of <code>DispatcherServlet</code>, such as authentication, CSRF and authorization filters.',
            '<b>UserDetailsService</b> loads users and <code>PasswordEncoder</code> (usually <code>BCryptPasswordEncoder</code>) checks passwords; never store plain text.',
            '<b>CSRF</b> protection is on for browser forms; for stateless token APIs you usually disable it deliberately.'],
        ['<b>Method security</b>: <code>@EnableMethodSecurity</code> enables <code>@PreAuthorize</code> rules on service methods.',
            '<b>Lambda DSL</b>: Spring Security 6 configures with <code>http.authorizeHttpRequests(...)</code> lambdas; <code>WebSecurityConfigurerAdapter</code> is removed.',
            '<b>Testing</b>: <code>@WithMockUser</code> and the <code>spring-security-test</code> helpers such as <code>csrf()</code> make MockMvc tests simple.'],
        [['F', 'What happens when you add the security starter?', 'All endpoints require authentication, with a generated user and password.'],
            ['F', 'Where is the generated password shown?', 'In the application startup log.'],
            ['M', 'How do you permit some URLs?', 'Define a SecurityFilterChain bean and use requestMatchers(...).permitAll().'],
            ['M', 'Which encoder should you use for passwords?', 'BCryptPasswordEncoder or the delegating encoder, never plain text.'],
            ['S', 'Why was WebSecurityConfigurerAdapter removed?', 'Spring Security 5.7 and 6 moved to component-based configuration with SecurityFilterChain beans.'],
            ['S', 'When do you disable CSRF?', 'For stateless APIs that use tokens in headers rather than cookies; keep it for cookie-based browser sessions.']],
        [['Open and protected paths.',
            r`@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}

// OUTPUT:
// GET /public/info -> 200
// GET /orders (no login) -> 401 Unauthorized`],
            ['In-memory user and encoder.',
                r`@Bean
UserDetailsService users(PasswordEncoder enc) {
    return new InMemoryUserDetailsManager(
        User.withUsername("abaji").password(enc.encode("pw"))
            .roles("USER").build());
}

@Bean
PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }

// OUTPUT:
// httpBasic abaji:pw -> 200 on /orders`]],
        [['Method-level rule.',
            r`@EnableMethodSecurity
class MethodConfig {}

@Service
class ReportService {
    @PreAuthorize("hasRole('ADMIN')")
    public String secret() { return "payroll"; }
}

// OUTPUT:
// USER role calls secret() -> AccessDeniedException (403 in a web call)`],
            ['MockMvc with a mock user.',
                r`@Test
@WithMockUser(username = "abaji", roles = "USER")
void userSeesOrders() throws Exception {
    mvc.perform(get("/orders")).andExpect(status().isOk());
    mvc.perform(get("/admin/stats")).andExpect(status().isForbidden());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'sb-spring-boot-starter-test': x(
        ['<b>spring-boot-starter-test</b> is the starter that gives you the testing toolbox: JUnit 5, Mockito, AssertJ, Hamcrest, JSONassert, JsonPath and Spring Test with MockMvc.',
            '<b>Scope</b>: declare it with test scope (<code>testImplementation</code> in Gradle) so it never reaches production.',
            '<b>Start</b>: annotate a class with <code>@SpringBootTest</code> to load the whole application context, then write ordinary JUnit <code>@Test</code> methods.'],
        ['<b>Slices</b> load only part of the context: <code>@WebMvcTest</code> for controllers, <code>@DataJpaTest</code> for repositories, <code>@JsonTest</code> for JSON.',
            '<b>@MockBean</b> (or <code>@MockitoBean</code> in newer Spring versions) replaces a bean with a Mockito mock inside the context.',
            '<b>MockMvc</b> calls controllers without a real server, so tests are fast.'],
        ['<b>Test speed</b>: the context is cached between tests with the same configuration, so avoid needless <code>@MockBean</code> variations that force new contexts.',
            '<b>Integration with real services</b> uses Testcontainers with <code>@ServiceConnection</code> on Boot 3.1 and later.',
            '<b>Random port</b>: <code>@SpringBootTest(webEnvironment = RANDOM_PORT)</code> with <code>TestRestTemplate</code> or <code>WebTestClient</code> tests the real HTTP stack.'],
        [['F', 'What libraries does the test starter include?', 'JUnit 5, Mockito, AssertJ, Hamcrest, JsonPath, JSONassert and Spring Test.'],
            ['F', 'What does @SpringBootTest do?', 'It starts the full application context for the test.'],
            ['M', 'When use @WebMvcTest?', 'To test controllers only, with services replaced by mocks.'],
            ['M', 'What does @MockBean do?', 'It puts a Mockito mock into the Spring context in place of the real bean.'],
            ['S', 'Why are some Spring tests slow?', 'Each distinct context configuration loads a new context; reuse configuration and prefer slices.'],
            ['S', 'How do you test against a real database?', 'Use Testcontainers, ideally with @ServiceConnection, instead of H2 when behavior must match.']],
        [['Context loads test.',
            r`@SpringBootTest
class DemoApplicationTests {
    @Autowired ApplicationContext ctx;

    @Test
    void contextLoads() {
        assertNotNull(ctx.getBean(OrderService.class));
    }
}

// OUTPUT:
// Started DemoApplicationTests in 2.1 seconds (varies)
// Tests run: 1, Failures: 0`],
            ['Controller slice with a mock service.',
                r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService service;

    @Test
    void ok() throws Exception {
        when(service.count()).thenReturn(3);
        mvc.perform(get("/orders/count"))
           .andExpect(status().isOk())
           .andExpect(content().string("3"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Real HTTP on a random port.',
            r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HttpTest {
    @Autowired TestRestTemplate rest;

    @Test
    void hello() {
        ResponseEntity<String> r = rest.getForEntity("/hello", String.class);
        assertEquals(HttpStatus.OK, r.getStatusCode());
    }
}

// OUTPUT:
// Tomcat started on port 51234 (varies)
// Tests run: 1, Failures: 0`],
            ['AssertJ and Mockito together.',
                r`@Test
void discount() {
    PriceService svc = mock(PriceService.class);
    when(svc.price("pen")).thenReturn(10.0);
    assertThat(svc.price("pen")).isEqualTo(10.0);
    verify(svc).price("pen");
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'spring-boot-annotations': x(
        ['<b>@SpringBootApplication</b> is a shortcut for three annotations: <code>@SpringBootConfiguration</code>, <code>@EnableAutoConfiguration</code> and <code>@ComponentScan</code>.',
            '<b>Stereotypes</b>: <code>@Component</code>, <code>@Service</code>, <code>@Repository</code> and <code>@Controller</code> register beans; the last three add meaning for layers.',
            '<b>Web mapping</b>: <code>@RestController</code>, <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code>.'],
        ['<b>Configuration</b>: <code>@Configuration</code> with <code>@Bean</code> methods, <code>@ConfigurationProperties</code> for typed settings and <code>@Value</code> for single values.',
            '<b>Conditions</b>: <code>@ConditionalOnProperty</code>, <code>@ConditionalOnClass</code> and <code>@ConditionalOnMissingBean</code> make beans appear only when needed.',
            '<b>Profiles</b>: <code>@Profile(&quot;dev&quot;)</code> limits a bean to one environment.'],
        ['<b>Meta-annotations</b>: Spring reads annotations on annotations, so you can create your own composed annotation that bundles several.',
            '<b>Proxy limits</b>: <code>@Transactional</code>, <code>@Async</code> and <code>@Cacheable</code> work through proxies, so self-invocation inside one class bypasses them.',
            '<b>Test annotations</b>: <code>@SpringBootTest</code>, <code>@WebMvcTest</code>, <code>@DataJpaTest</code>, <code>@MockBean</code>.'],
        [['F', 'What three annotations make up @SpringBootApplication?', '@SpringBootConfiguration, @EnableAutoConfiguration and @ComponentScan.'],
            ['F', 'Difference between @Controller and @RestController?', '@RestController is @Controller plus @ResponseBody, so return values become the response body.'],
            ['M', 'When use @ConfigurationProperties instead of @Value?', 'For grouped, typed, validated settings with relaxed binding.'],
            ['M', 'What does @ConditionalOnMissingBean do?', 'Creates the bean only if the application has not defined one, so users can override defaults.'],
            ['S', 'Why does a @Transactional method called from the same class not start a transaction?', 'The proxy is bypassed on self-invocation; call through another bean or restructure.'],
            ['S', 'What is a composed annotation?', 'A custom annotation meta-annotated with others, for example one combining @RestController and @RequestMapping.']],
        [['Composed bootstrap annotation.',
            r`// equivalent to @SpringBootApplication
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

// OUTPUT:
// Started App in 1.9 seconds (varies)`],
            ['Typed properties.',
                r`@ConfigurationProperties(prefix = "app.mail")
public record MailProps(String host, int port) {}

# application.properties
app.mail.host=smtp.example.com
app.mail.port=587

// OUTPUT:
// MailProps[host=smtp.example.com, port=587]`]],
        [['Custom composed annotation.',
            r`@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@RestController
@RequestMapping("/api/v1")
public @interface ApiController {}

@ApiController
class PingController {
    @GetMapping("/ping") String ping() { return "pong"; }
}

// OUTPUT:
// GET /api/v1/ping -> 200 pong`],
            ['Conditional bean.',
                r`@Configuration
class ClockConfig {
    @Bean
    @ConditionalOnProperty(name = "app.fake-clock", havingValue = "true")
    Clock fixed() {
        return Clock.fixed(Instant.parse("2025-01-01T00:00:00Z"), ZoneOffset.UTC);
    }
}

// OUTPUT:
// app.fake-clock=true -> fixed Clock bean is created; otherwise skipped`]]
    ),

    'sb-auto-configuration': x(
        ['<b>Auto-configuration</b> is the Spring Boot feature that creates and wires beans for you based on the libraries on the classpath, the properties you set and the beans you already defined.',
            '<b>Switch on</b> through <code>@EnableAutoConfiguration</code>, which is already part of <code>@SpringBootApplication</code>.',
            '<b>Example</b>: with <code>spring-boot-starter-web</code> on the classpath Boot configures <code>DispatcherServlet</code> and Tomcat; with a database driver and JPA it configures a <code>DataSource</code> and <code>EntityManagerFactory</code>.'],
        ['<b>Candidates</b> are listed in <code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code> inside each autoconfigure jar.',
            '<b>Conditions</b> decide if each class applies: <code>@ConditionalOnClass</code>, <code>@ConditionalOnMissingBean</code>, <code>@ConditionalOnProperty</code>.',
            '<b>Back-off</b>: define your own bean of the same type and the auto-configured one steps aside.'],
        ['<b>Debug</b>: run with <code>--debug</code> or <code>debug=true</code> to print the conditions report with positive and negative matches.',
            '<b>Exclude</b> with <code>@SpringBootApplication(exclude = X.class)</code> or <code>spring.autoconfigure.exclude</code>.',
            '<b>Ordering</b>: <code>@AutoConfiguration(after = ...)</code> controls order; user configuration is always processed before auto-configuration.'],
        [['F', 'What is auto-configuration?', 'Boot automatically configures beans based on the classpath, properties and existing beans.'],
            ['F', 'Which annotation enables it?', '@EnableAutoConfiguration, included in @SpringBootApplication.'],
            ['M', 'Where does Boot find auto-configuration classes?', 'In the AutoConfiguration.imports file inside spring-boot-autoconfigure and other jars.'],
            ['M', 'How do you see which ones were applied?', 'Start with --debug to get the conditions evaluation report, or use the Actuator conditions endpoint.'],
            ['S', 'How can you override an auto-configured bean?', 'Declare your own bean of that type; the @ConditionalOnMissingBean condition makes Boot back off.'],
            ['S', 'How do you disable one auto-configuration?', 'Use the exclude attribute or the spring.autoconfigure.exclude property.']],
        [['Excluding an auto-configuration.',
            r`@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
public class NoDbApp {
    public static void main(String[] args) {
        SpringApplication.run(NoDbApp.class, args);
    }
}

// OUTPUT:
// starts without a DataSource even though a JDBC driver is on the classpath`],
            ['Conditions report.',
                r`java -jar demo.jar --debug

// OUTPUT: (varies)
// Positive matches:
//   DispatcherServletAutoConfiguration matched
//     - @ConditionalOnClass found 'DispatcherServlet'
// Negative matches:
//   MongoAutoConfiguration: Did not match
//     - @ConditionalOnClass did not find 'MongoClient'`]],
        [['Own bean makes Boot back off.',
            r`@Configuration
class JsonConfig {
    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapper().findAndRegisterModules();
    }
}

// OUTPUT:
// JacksonAutoConfiguration ObjectMapper is skipped (ConditionalOnMissingBean)`],
            ['Test the conditions.',
                r`new ApplicationContextRunner()
    .withConfiguration(AutoConfigurations.of(MyAutoConfig.class))
    .withPropertyValues("my.enabled=true")
    .run(ctx -> assertThat(ctx).hasSingleBean(MyService.class));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'sb-component-scanning-basics': x(
        ['<b>Component scanning</b> is how Spring finds classes annotated with <code>@Component</code>, <code>@Service</code>, <code>@Repository</code> or <code>@Controller</code> and registers them as beans automatically.',
            '<b>Default root</b>: <code>@SpringBootApplication</code> scans the package of the main class and all its sub-packages.',
            '<b>Rule</b>: keep the main class in the top package, such as <code>com.example.shop</code>, so every feature package is scanned.'],
        ['<b>Outside the root</b>: a bean in <code>com.other</code> is not found; add <code>@ComponentScan(basePackages = ...)</code> or import the class.',
            '<b>Filters</b>: <code>includeFilters</code> and <code>excludeFilters</code> narrow what is registered.',
            '<b>Bean name</b> defaults to the class name with a lowercase first letter, for example <code>orderService</code>.'],
        ['<b>Startup time</b>: scanning reads class metadata from the classpath; narrow packages in huge applications, or use Spring AOT for faster startup.',
            '<b>Name clashes</b>: two classes with the same simple name in different packages cause a conflict unless you give explicit names.',
            '<b>Slices</b>: test slices such as <code>@WebMvcTest</code> scan only web components, which is why services are missing unless mocked.'],
        [['F', 'What is component scanning?', 'Spring searching packages for stereotype-annotated classes to register as beans.'],
            ['F', 'Which package is scanned by default?', 'The package of the @SpringBootApplication class and its sub-packages.'],
            ['M', 'A bean is not found; what do you check first?', 'Whether its package is under the main class package; otherwise add basePackages.'],
            ['M', 'How is the default bean name built?', 'The simple class name with the first letter in lowercase.'],
            ['S', 'How do you scan only some classes?', 'Use @ComponentScan with includeFilters or excludeFilters (annotation, assignable type, regex).'],
            ['S', 'Why can two same-named classes break startup?', 'Both get the same default bean name, causing ConflictingBeanDefinitionException; set names in the annotation.']],
        [['Scanned structure.',
            r`// com.example.shop.ShopApp          (main class, root)
// com.example.shop.order.OrderService   (scanned)
// com.example.shop.order.OrderController (scanned)
// com.audit.AuditService                (NOT scanned)

@SpringBootApplication
@ComponentScan(basePackages = {"com.example.shop", "com.audit"})
public class ShopApp {}

// OUTPUT:
// orderService, orderController and auditService are all registered`],
            ['Stereotype registration.',
                r`@Service
public class OrderService {}

@Repository
public class OrderRepo {}

// OUTPUT:
// beans: orderService, orderRepo (names default to lowercase-first class names)`]],
        [['Exclude by filter.',
            r`@ComponentScan(
    basePackages = "com.example.shop",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE, classes = LegacyService.class))
class ScanConfig {}

// OUTPUT:
// LegacyService is not registered as a bean`],
            ['List what was scanned.',
                r`@Bean
CommandLineRunner show(ApplicationContext ctx) {
    return args -> Arrays.stream(ctx.getBeanDefinitionNames())
        .filter(n -> n.endsWith("Service")).sorted().forEach(System.out::println);
}

// OUTPUT: (varies)
// auditService
// orderService`]]
    ),

    'spring-boot-internal-working': x(
        ['<b>Startup sequence</b>: <code>SpringApplication.run</code> prepares the environment, creates the context, loads beans, starts the embedded server and calls runners.',
            '<b>Three engines</b>: component scanning finds your beans, auto-configuration adds framework beans, and the embedded server runs the web layer.',
            '<b>Executable jar</b>: Boot builds a fat jar whose launcher loads nested dependency jars, so <code>java -jar</code> is enough.'],
        ['<b>Events</b>: Boot publishes <code>ApplicationStartingEvent</code>, <code>ApplicationReadyEvent</code> and others; listen to them for hooks.',
            '<b>Runners</b>: <code>CommandLineRunner</code> and <code>ApplicationRunner</code> beans run after the context is ready.',
            '<b>Type choice</b>: Boot picks servlet, reactive or none as the application type from the classpath.'],
        ['<b>Property sources</b> follow a fixed order: command line, environment variables, profile files, then default <code>application</code> files.',
            '<b>Startup cost</b>: measure with <code>ApplicationStartup</code> or Actuator startup endpoint; lazy initialization and AOT or native image reduce it.',
            '<b>Failure analysis</b>: <code>FailureAnalyzer</code> classes turn common startup errors into readable messages with an action.'],
        [['F', 'What does SpringApplication.run do?', 'It creates the application context, applies auto-configuration, starts the embedded server and returns the context.'],
            ['F', 'Why can you run a Boot app with java -jar?', 'The fat jar contains a launcher and nested dependencies.'],
            ['M', 'What is the difference between CommandLineRunner and ApplicationRunner?', 'Both run after startup; ApplicationRunner receives parsed ApplicationArguments instead of raw strings.'],
            ['M', 'How does Boot choose the web server?', 'By the starter on the classpath, for example Tomcat from the web starter.'],
            ['S', 'In what order are properties resolved?', 'Command line arguments override environment variables, which override application files; profile files override the defaults.'],
            ['S', 'How do you speed up startup?', 'Trim dependencies, narrow scanning, use lazy initialization, and consider AOT or GraalVM native images.']],
        [['Hook into startup.',
            r`@Component
class StartupLogger implements ApplicationRunner {
    public void run(ApplicationArguments args) {
        System.out.println("ready, args=" + args.getOptionNames());
    }
}

// OUTPUT:
// Started App in 2.0 seconds (varies)
// ready, args=[]`],
            ['Listen to the ready event.',
                r`@Component
class ReadyListener {
    @EventListener(ApplicationReadyEvent.class)
    void onReady() { System.out.println("application is ready"); }
}

// OUTPUT:
// application is ready`]],
        [['Custom application type and banner.',
            r`public static void main(String[] args) {
    SpringApplication app = new SpringApplication(App.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.setLazyInitialization(true);
    app.run(args);
}

// OUTPUT:
// no banner; beans are created on first use`],
            ['Property precedence.',
                r`# application.properties
server.port=8080

java -jar app.jar --server.port=9000

// OUTPUT:
// Tomcat started on port 9000 (command line overrides the file)`]]
    )
};

export const sboot04Deep: Record<string, Deep> = {
    'sb-spring-boot-starter': dv(
        [`<p>A starter is only a packaging convention.</p><ul><li><b>Pom only:</b> the starter jar holds no classes, just a pom listing dependencies.</li><li><b>Versions:</b> the <code>spring-boot-dependencies</code> BOM pins every version, inherited through the parent pom.</li><li><b>Wiring:</b> the actual beans come from <code>spring-boot-autoconfigure</code>, which activates when the libraries appear on the classpath.</li><li><b>Chain:</b> web starter depends on the core starter, Tomcat starter, Jackson starter and Spring MVC.</li></ul>`,
            r`<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
</parent>
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

// OUTPUT:
// no version needed on the starter; the parent supplies it`],
        [`<p>Common official starters:</p><ul><li><b>Web and API:</b> web, webflux, validation, security, oauth2-client.</li><li><b>Data:</b> data-jpa, data-jdbc, data-mongodb, data-redis.</li><li><b>Operations:</b> actuator, logging.</li><li><b>Integration:</b> mail, amqp, kafka.</li><li><b>Template:</b> thymeleaf.</li><li><b>Testing:</b> test.</li></ul><p>Without the parent, import the BOM in dependencyManagement.</p>`,
            r`<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.3.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

// OUTPUT:
// all starters get managed versions without inheriting the Boot parent`],
        [`<p>Typical mistakes:</p><ul><li><b>Overriding versions blindly:</b> a hand-set Jackson or Hibernate version can break compatibility; change the managed property only when needed.</li><li><b>Two web servers:</b> keeping Tomcat and adding Jetty without an exclusion.</li><li><b>Starter for everything:</b> pulling in JPA without a database leads to a startup failure about a missing DataSource.</li><li><b>Mixing Boot versions:</b> some starters at one version and others at another.</li></ul>`,
            r`Description:
Failed to configure a DataSource: 'url' attribute is not specified

Action:
Consider the following:
    If you want an embedded database, add H2 to the classpath.
    If you have database settings, set spring.datasource.url.

// OUTPUT:
// fix: configure the datasource, add an embedded database, or remove the JPA starter`],
        [`<p>Each starter widens the classpath and can add startup work.</p><ul><li>Remove starters you do not use, for example security or actuator in a tiny tool.</li><li>Use <code>mvn dependency:analyze</code> to find unused declarations.</li><li>Pick a lighter server or exclude defaults when memory matters.</li><li>Layered jars improve Docker caching of dependency layers.</li></ul>`,
            r`mvn dependency:analyze

// OUTPUT: (varies)
// [WARNING] Unused declared dependencies found:
// [WARNING]    org.springframework.boot:spring-boot-starter-mail:jar
// action: delete it, rebuild, compare jar size and startup time`],
        [`<p>A team wants a shared audit library used by many services. They create two modules: <code>audit-spring-boot-autoconfigure</code> with the configuration class and <code>audit-spring-boot-starter</code> that only depends on it. Services add one dependency and get an <code>AuditService</code> bean, which they can override.</p>`,
            r`@AutoConfiguration
@ConditionalOnClass(AuditService.class)
@EnableConfigurationProperties(AuditProps.class)
public class AuditAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    AuditService auditService(AuditProps p) { return new AuditService(p.sink()); }
}

# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
# com.acme.audit.AuditAutoConfiguration

// OUTPUT:
// a service that adds the starter gets an auditService bean with no extra code`]
    ),

    'sb-spring-boot-starter-web': dv(
        [`<p>What the web starter assembles at startup:</p><ul><li><b>Server:</b> <code>ServletWebServerFactoryAutoConfiguration</code> creates the embedded Tomcat.</li><li><b>Dispatcher:</b> <code>DispatcherServletAutoConfiguration</code> registers <code>DispatcherServlet</code> at the root path.</li><li><b>MVC:</b> <code>WebMvcAutoConfiguration</code> adds handler mappings, adapters, resource handlers and message converters.</li><li><b>Errors:</b> <code>BasicErrorController</code> serves <code>/error</code> JSON or HTML.</li><li><b>Flow:</b> request, connector thread, filters, DispatcherServlet, handler method, converter writes response.</li></ul>`,
            r`curl -i localhost:8080/missing

// OUTPUT:
// HTTP/1.1 404
// Content-Type: application/json
// {"timestamp":"2025-01-01T10:00:00.000+00:00","status":404,
//  "error":"Not Found","path":"/missing"}`],
        [`<p>Useful settings:</p><ul><li><code>server.port</code>, <code>server.address</code>, <code>server.servlet.context-path</code></li><li><code>server.compression.enabled</code> for gzip</li><li><code>spring.mvc.pathmatch.*</code> and <code>spring.web.resources.*</code> for static content and caching</li><li><code>server.error.include-message</code> to show error text</li><li><code>spring.jackson.default-property-inclusion=non_null</code></li></ul>`,
            r`server.port=8081
server.compression.enabled=true
server.error.include-message=always
spring.jackson.default-property-inclusion=non_null
spring.web.resources.cache.period=3600

# OUTPUT:
# gzip is applied to JSON responses over the minimum size;
null fields are omitted`],
        [`<p>Mistakes:</p><ul><li><b>Main class in the default package:</b> scanning fails or is too broad.</li><li><b>Controller outside the scan root:</b> endpoint returns 404.</li><li><b>Returning an entity with lazy fields:</b> serialization errors; return a DTO.</li><li><b>Using @Controller and returning a String:</b> Boot looks for a view; use <code>@RestController</code>.</li><li><b>Blocking calls on request threads</b> exhaust the pool.</li></ul>`,
            r`@Controller            // WRONG for JSON APIs
class BadController {
    @GetMapping("/hi") String hi() { return "hi"; }
}
// GET /hi -> 404 or template error: view "hi" not found

@RestController          // RIGHT
class GoodController {
    @GetMapping("/hi") String hi() { return "hi"; }
}

// OUTPUT:
// GET /hi -> 200 hi`],
        [`<p>Tuning:</p><ul><li><b>Threads:</b> <code>server.tomcat.threads.max</code> (default 200) and <code>accept-count</code>.</li><li><b>Compression and caching:</b> reduce bytes sent.</li><li><b>Virtual threads:</b> on Java 21, enable for blocking I/O heavy services.</li><li><b>Keep-alive</b> and timeouts: <code>server.tomcat.connection-timeout</code>.</li><li><b>Measure</b> with Actuator and Micrometer before changing.</li></ul>`,
            r`server.tomcat.threads.max=100
server.tomcat.accept-count=50
server.tomcat.connection-timeout=10s
spring.threads.virtual.enabled=true

# OUTPUT:
# bounded pool with a queue of 50;
requests beyond that are refused`],
        [`<p>An order API serves a React front end. The team returns DTO records, maps validation errors in one advice class, enables gzip, and tests each controller with <code>@WebMvcTest</code>. Static build output from the front end goes into <code>static</code> so one jar serves both.</p>`,
            r`@RestController
@RequestMapping("/api/orders")
class OrderApi {
    private final OrderService svc;
    OrderApi(OrderService svc) { this.svc = svc; }

    @GetMapping("/{id}")
    OrderDto get(@PathVariable long id) { return svc.find(id); }
}

// OUTPUT:
// GET /api/orders/7 -> 200 {"id":7,"status":"PAID"}`]
    ),

    'sb-spring-boot-starter-data-jpa': dv(
        [`<p>How the stack is wired:</p><ul><li><b>DataSource:</b> <code>DataSourceAutoConfiguration</code> builds a HikariCP pool from properties.</li><li><b>JPA:</b> <code>HibernateJpaAutoConfiguration</code> creates the <code>EntityManagerFactory</code> and scans entities under the main package.</li><li><b>Transactions:</b> <code>JpaTransactionManager</code> is registered.</li><li><b>Repositories:</b> <code>JpaRepositoriesAutoConfiguration</code> creates a proxy for each repository interface, backed by <code>SimpleJpaRepository</code>.</li></ul>`,
            r`// at runtime the proxy delegates to SimpleJpaRepository
CustomerRepository repo = ctx.getBean(CustomerRepository.class);
System.out.println(repo.getClass().getSimpleName());

// OUTPUT: (varies)
// $Proxy112`],
        [`<p>Query options:</p><ul><li><b>Derived:</b> <code>findByLastNameAndAge</code>, <code>existsByEmail</code>, <code>countByStatus</code>.</li><li><b>@Query:</b> JPQL or native with <code>nativeQuery = true</code>.</li><li><b>Paging:</b> <code>Pageable</code> parameter returning <code>Page</code> or <code>Slice</code>.</li><li><b>Projections:</b> interface or record results fetch only chosen columns.</li><li><b>Specifications</b> for dynamic filters.</li></ul>`,
            r`public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategory(String category, Pageable page);

    @Query("select p.name as name, p.price as price from Product p")
    List<NameAndPrice> summaries();
}
interface NameAndPrice {
    String getName();
    BigDecimal getPrice();
}

// OUTPUT:
// findByCategory("toys", PageRequest.of(0, 10)) -> Page with 10 rows and total count`],
        [`<p>Mistakes:</p><ul><li><b>ddl-auto=create in production</b> drops data; use <code>validate</code> plus Flyway or Liquibase.</li><li><b>Exposing entities</b> from controllers causes lazy and cycle errors.</li><li><b>LazyInitializationException</b> after the session closes; fetch what you need in the service.</li><li><b>Missing equals and hashCode</b> on entities in sets.</li><li><b>Wrong database dialect</b> or missing driver.</li></ul>`,
            r`// LazyInitializationException: could not initialize proxy - no Session
Order o = repo.findById(1L).orElseThrow();
o.getItems().size();            // lazy load outside a transaction

// FIX: load in the service inside a transaction, or join fetch
@Transactional(readOnly = true)
public int itemCount(long id) {
    return repo.findWithItems(id).orElseThrow().getItems().size();
}

// OUTPUT:
// itemCount(1) -> 3`],
        [`<p>Tuning:</p><ul><li><b>Pool size:</b> <code>spring.datasource.hikari.maximum-pool-size</code> (default 10) matches database capacity.</li><li><b>Batching:</b> <code>spring.jpa.properties.hibernate.jdbc.batch_size=50</code> with ordered inserts.</li><li><b>Pagination</b> instead of loading all rows.</li><li><b>Indexes</b> for query columns.</li><li><b>Read-only transactions</b> skip dirty checking.</li><li><b>Identity ids</b> disable insert batching; consider sequences.</li></ul>`,
            r`spring.datasource.hikari.maximum-pool-size=20
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.open-in-view=false

# OUTPUT:
# saveAll of 1000 rows runs as 20 batches instead of 1000 statements`],
        [`<p>A shop service stores orders. The team uses Flyway for schema changes, <code>ddl-auto=validate</code>, DTO projections for list screens, a fetch join for the detail screen and <code>@DataJpaTest</code> with Testcontainers MySQL to test repositories.</p>`,
            r`@Service
class OrderService {
    private final OrderRepository repo;
    OrderService(OrderRepository repo) { this.repo = repo; }

    @Transactional
    public Order place(Order o) { return repo.save(o); }

    @Transactional(readOnly = true)
    public Page<Order> list(Pageable p) { return repo.findAll(p); }
}

// OUTPUT:
// place(order) -> Order(id=42); list(PageRequest.of(0, 20)) -> first 20 orders`]
    ),

    'sb-spring-boot-starter-validation': dv(
        [`<p>How validation runs:</p><ul><li><b>Provider:</b> Hibernate Validator is found through the Jakarta Validation service loader and exposed as a <code>LocalValidatorFactoryBean</code>.</li><li><b>Request body:</b> <code>RequestResponseBodyMethodProcessor</code> reads JSON, then calls the validator when <code>@Valid</code> is present.</li><li><b>Failure:</b> a <code>BindingResult</code> with errors becomes <code>MethodArgumentNotValidException</code>, handled by <code>DefaultHandlerExceptionResolver</code> as 400.</li><li><b>Method validation:</b> with <code>@Validated</code> a proxy checks parameters and throws <code>ConstraintViolationException</code>.</li></ul>`,
            r`@RestController
@Validated
class SearchController {
    @GetMapping("/search")
    String search(@RequestParam @Size(min = 3) String q) { return q; }
}

// OUTPUT:
// GET /search?q=ab -> ConstraintViolationException: search.q: size must be between 3 and 2147483647`],
        [`<p>Constraint options:</p><ul><li><b>Strings:</b> <code>@NotBlank</code>, <code>@Size</code>, <code>@Pattern</code>, <code>@Email</code>.</li><li><b>Numbers:</b> <code>@Min</code>, <code>@Max</code>, <code>@Positive</code>, <code>@DecimalMin</code>.</li><li><b>Dates:</b> <code>@Past</code>, <code>@Future</code>.</li><li><b>Collections:</b> <code>@NotEmpty</code>, container elements like <code>List&lt;@NotBlank String&gt;</code>.</li><li><b>Nested:</b> put <code>@Valid</code> on a field to cascade.</li><li><b>Groups</b> for create versus update.</li></ul>`,
            r`public record OrderReq(
    @NotEmpty List<@NotBlank String> items,
    @Valid Address address,
    @Positive BigDecimal total) {}

public record Address(@NotBlank String city, @Pattern(regexp = "\\d{6}") String pin) {}

// OUTPUT:
// items=[""] -> violation on items[0]; pin "12" -> violation on address.pin`],
        [`<p>Mistakes:</p><ul><li><b>Forgetting @Valid</b> so nothing is checked.</li><li><b>Missing starter</b> so annotations compile but are ignored (no provider).</li><li><b>@NotNull on a String</b> when empty text should also fail.</li><li><b>Validating entities only</b> at persist time, giving ugly 500 errors.</li><li><b>Not cascading</b> into nested objects.</li></ul>`,
            r`// WRONG: no @Valid, so constraints are never evaluated
@PostMapping("/a") void a(@RequestBody SignupRequest r) {}

// RIGHT
@PostMapping("/b") void b(@Valid @RequestBody SignupRequest r) {}

// OUTPUT:
// /a with bad data -> 200 (bug); /b with bad data -> 400`],
        [`<p>Validation is cheap, but keep these in mind:</p><ul><li>The validator is thread-safe and cached; do not create <code>Validator</code> objects per call.</li><li>Avoid database lookups inside constraint validators on hot paths.</li><li>Fail fast with <code>hibernate.validator.fail_fast</code> when you only need to know if the input is invalid.</li><li>Keep regexes simple to avoid backtracking.</li></ul>`,
            r`@Bean
LocalValidatorFactoryBean validator() {
    LocalValidatorFactoryBean v = new LocalValidatorFactoryBean();
    v.getValidationPropertyMap().put("hibernate.validator.fail_fast", "true");
    return v;
}

// OUTPUT:
// stops at the first violation instead of collecting all of them`],
        [`<p>A signup API returns a stable error JSON that front-end forms map to fields. One advice class converts <code>MethodArgumentNotValidException</code> and <code>ConstraintViolationException</code> into the same shape, and a unit test covers each rule.</p>`,
            r`@ExceptionHandler(ConstraintViolationException.class)
ResponseEntity<Map<String, Object>> params(ConstraintViolationException e) {
    Map<String, Object> body = new TreeMap<>();
    e.getConstraintViolations().forEach(v ->
        body.put(v.getPropertyPath().toString(), v.getMessage()));
    return ResponseEntity.badRequest().body(body);
}

// OUTPUT:
// 400 {"search.q":"size must be between 3 and 2147483647"}`]
    ),

    'sb-spring-boot-starter-security': dv(
        [`<p>Internals of the default setup:</p><ul><li><b>Registration:</b> <code>SecurityFilterAutoConfiguration</code> registers <code>DelegatingFilterProxy</code>, pointing to the bean <code>springSecurityFilterChain</code>.</li><li><b>Chain:</b> <code>FilterChainProxy</code> picks the first matching <code>SecurityFilterChain</code> and runs its filters.</li><li><b>Order:</b> context persistence, CSRF, logout, authentication filters, exception translation, then <code>AuthorizationFilter</code>.</li><li><b>Authentication:</b> <code>AuthenticationManager</code> asks providers, which use <code>UserDetailsService</code> and <code>PasswordEncoder</code>.</li><li><b>Result:</b> the <code>SecurityContext</code> holds the <code>Authentication</code>.</li></ul>`,
            r`Authentication a = SecurityContextHolder.getContext().getAuthentication();
System.out.println(a.getName() + " " + a.getAuthorities());

// OUTPUT:
// abaji [ROLE_USER]`],
        [`<p>Configuration variants:</p><ul><li><b>Basic and form login:</b> <code>httpBasic</code>, <code>formLogin</code>.</li><li><b>Stateless JWT:</b> <code>sessionManagement</code> with STATELESS, a custom filter and resource server support (<code>oauth2ResourceServer</code>).</li><li><b>Matchers:</b> <code>requestMatchers</code> with HTTP method and patterns.</li><li><b>CORS and headers:</b> <code>cors</code>, <code>headers</code>.</li><li><b>Roles versus authorities:</b> <code>hasRole(&quot;ADMIN&quot;)</code> expects <code>ROLE_ADMIN</code>.</li></ul>`,
            r`http.csrf(c -> c.disable())
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(a -> a
        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
        .anyRequest().authenticated())
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));

// OUTPUT:
// no session cookie; every request must carry a valid Bearer token`],
        [`<p>Mistakes:</p><ul><li><b>Plain-text passwords</b> or no encoder: error "There is no PasswordEncoder mapped for id null".</li><li><b>Rule order:</b> a broad <code>anyRequest().permitAll()</code> before specific rules makes them useless.</li><li><b>Disabling CSRF</b> for cookie sessions.</li><li><b>POST gives 403</b> in tests because the CSRF token is missing.</li><li><b>Role prefix confusion</b> with <code>hasAuthority</code>.</li></ul>`,
            r`// WRONG: first match wins, admin rule never reached
.requestMatchers("/**").permitAll()
.requestMatchers("/admin/**").hasRole("ADMIN")

// RIGHT: specific first, catch-all last
.requestMatchers("/admin/**").hasRole("ADMIN")
.anyRequest().authenticated()

// OUTPUT:
// /admin/users without ADMIN -> 403`],
        [`<p>Security cost is mostly password hashing and filter work.</p><ul><li>BCrypt strength is intentionally slow; do not lower it for speed, but avoid hashing on every request by using tokens or sessions.</li><li>Cache user lookups carefully.</li><li>Keep custom filters cheap and early-exit for public paths.</li><li>Use method security only where needed.</li></ul>`,
            r`PasswordEncoder enc = new BCryptPasswordEncoder(12);
long t = System.nanoTime();
String hash = enc.encode("secret");
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=250`],
        [`<p>An internal admin portal uses form login for staff and a stateless JWT chain for a mobile API. Two <code>SecurityFilterChain</code> beans with <code>securityMatcher</code> and <code>@Order</code> split the rules, and MockMvc tests cover each role.</p>`,
            r`@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .csrf(c -> c.disable());
    return http.build();
}

@Bean @Order(2)
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());
    return http.build();
}

// OUTPUT:
// /api/** uses tokens; all other paths use a login page`]
    ),

    'sb-spring-boot-starter-test': dv(
        [`<p>How Spring tests run:</p><ul><li><b>Runner:</b> <code>SpringExtension</code> hooks the JUnit 5 lifecycle.</li><li><b>Context cache:</b> the <code>TestContext</code> framework caches contexts by configuration key (classes, properties, mock beans, profiles).</li><li><b>Boot support:</b> <code>@SpringBootTest</code> finds <code>@SpringBootConfiguration</code> by searching upward from the test package.</li><li><b>Slices</b> apply auto-configuration filters so only related beans load.</li><li><b>Transactions:</b> test methods with a transaction roll back by default.</li></ul>`,
            r`@SpringBootTest
@Transactional
class RollbackTest {
    @Autowired CustomerRepository repo;

    @Test
    void rolledBack() {
        repo.save(new Customer());
        assertEquals(1, repo.count());
    }
}

// OUTPUT:
// after the test the insert is rolled back automatically`],
        [`<p>Test types:</p><ul><li><b>Unit:</b> plain JUnit and Mockito, no Spring.</li><li><b>Slice:</b> <code>@WebMvcTest</code>, <code>@DataJpaTest</code>, <code>@JsonTest</code>, <code>@RestClientTest</code>.</li><li><b>Integration:</b> <code>@SpringBootTest</code> with MOCK, RANDOM_PORT or DEFINED_PORT.</li><li><b>Properties:</b> <code>@TestPropertySource</code>, <code>@ActiveProfiles</code>, <code>@DynamicPropertySource</code>.</li><li><b>Output:</b> <code>OutputCaptureExtension</code>.</li></ul>`,
            r`@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = "app.feature.x=true")
class FeatureTest {
    @Value("$" + "{app.feature.x}") boolean enabled;

    @Test
    void on() { assertTrue(enabled); }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
        [`<p>Mistakes:</p><ul><li><b>@SpringBootTest for everything</b> makes the suite slow; use slices and plain unit tests.</li><li><b>@WebMvcTest without mocking services</b> fails with NoSuchBeanDefinitionException.</li><li><b>Shared mutable state</b> across tests.</li><li><b>H2 instead of the real database</b> hides dialect problems.</li><li><b>Sleeping</b> instead of using Awaitility.</li></ul>`,
            r`// WRONG: service bean missing in the web slice
@WebMvcTest(OrderController.class)
class BadTest {}   // NoSuchBeanDefinitionException: OrderService

// RIGHT
@WebMvcTest(OrderController.class)
class GoodTest { @MockBean OrderService service; }

// OUTPUT:
// context loads with the mock service`],
        [`<p>Keep the suite fast:</p><ul><li>Reuse one configuration so the context cache hits.</li><li>Prefer slices; use full context tests for a few flows.</li><li>Share Testcontainers containers with a static or singleton pattern.</li><li>Run tests in parallel only if they are isolated.</li></ul>`,
            r`@Testcontainers
@SpringBootTest
class MysqlIT {
    @Container @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @Test
    void up() { assertTrue(mysql.isRunning()); }
}

// OUTPUT:
// container started once and wired as the DataSource automatically`],
        [`<p>A CI pipeline runs fast unit tests and web or JPA slices on every commit, and a smaller set of <code>@SpringBootTest</code> integration tests with Testcontainers before merge. Each endpoint has one happy-path and one error-path MockMvc test.</p>`,
            r`@Test
void createsOrder() throws Exception {
    mvc.perform(post("/orders")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"item\":\"pen\",\"qty\":2}"))
       .andExpect(status().isCreated())
       .andExpect(header().exists("Location"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'spring-boot-annotations': dv(
        [`<p>Annotations are processed in distinct phases.</p><ul><li><b>Scanning:</b> <code>ClassPathBeanDefinitionScanner</code> reads class metadata without loading classes and registers stereotypes.</li><li><b>Configuration:</b> <code>ConfigurationClassPostProcessor</code> processes <code>@Configuration</code>, <code>@Bean</code>, <code>@Import</code>; configuration classes are CGLIB-proxied so inter-bean calls return singletons.</li><li><b>Injection:</b> <code>AutowiredAnnotationBeanPostProcessor</code> handles <code>@Autowired</code> and <code>@Value</code>.</li><li><b>Proxies:</b> AOP post-processors wrap beans for <code>@Transactional</code>, <code>@Async</code>, <code>@Cacheable</code>.</li><li><b>Web:</b> <code>RequestMappingHandlerMapping</code> reads mapping annotations at startup.</li></ul>`,
            r`@Configuration
class Cfg {
    @Bean A a() { return new A(); }
    @Bean B b() { return new B(a()); }   // returns the same singleton A
}

// OUTPUT:
// one A instance, because Cfg is proxied (proxyBeanMethods = true by default)`],
        [`<p>Groups worth knowing:</p><ul><li><b>Injection:</b> <code>@Autowired</code>, <code>@Qualifier</code>, <code>@Primary</code>, constructor injection without annotation when there is one constructor.</li><li><b>Lifecycle:</b> <code>@PostConstruct</code>, <code>@PreDestroy</code>, <code>@Lazy</code>, <code>@Scope</code>.</li><li><b>Exceptions:</b> <code>@ExceptionHandler</code>, <code>@ControllerAdvice</code>, <code>@ResponseStatus</code>.</li><li><b>Scheduling and async:</b> <code>@Scheduled</code>, <code>@EnableScheduling</code>, <code>@Async</code>.</li><li><b>Caching:</b> <code>@EnableCaching</code>, <code>@Cacheable</code>.</li></ul>`,
            r`@Service
class Notifier {
    private final Sender sender;
    Notifier(@Qualifier("smsSender") Sender sender) { this.sender = sender; }

    @Scheduled(fixedRate = 60_000)
    void ping() { sender.send("alive"); }
}

// OUTPUT:
// smsSender is injected; ping runs every minute once @EnableScheduling is present`],
        [`<p>Mistakes:</p><ul><li><b>Self-invocation</b> bypasses proxy annotations.</li><li><b>@Transactional on private or final methods</b> is ignored by proxies.</li><li><b>Missing @EnableScheduling</b> so @Scheduled never fires.</li><li><b>Field injection</b> hides dependencies and blocks easy testing.</li><li><b>@Value for many properties</b> instead of @ConfigurationProperties.</li><li><b>Two beans of one type</b> without @Primary or @Qualifier.</li></ul>`,
            r`@Service
class PayService {
    public void outer() { inner(); }          // WRONG: no transaction started

    @Transactional
    public void inner() { /* writes */ }
}

// FIX: move inner() to another bean, or inject self via a separate service
// OUTPUT:
// outer() runs inner() without a transaction`],
        [`<p>Annotation cost is mostly at startup.</p><ul><li>Scanning and CGLIB proxy creation add time; <code>@Configuration(proxyBeanMethods = false)</code> avoids a proxy when no inter-bean calls exist.</li><li><code>@Lazy</code> delays creation of rarely used beans.</li><li>Spring AOT moves annotation processing to build time for native images.</li></ul>`,
            r`@Configuration(proxyBeanMethods = false)
class LightConfig {
    @Bean Clock clock() { return Clock.systemUTC(); }
}

// OUTPUT:
// no CGLIB subclass is generated for LightConfig; slightly faster startup`],
        [`<p>A team builds a REST module: a composed <code>@ApiController</code> annotation, <code>@ConfigurationProperties</code> for settings, <code>@ConditionalOnProperty</code> for a feature flag, and <code>@RestControllerAdvice</code> for errors. New developers learn the whole pattern from one example package.</p>`,
            r`@RestControllerAdvice
class Errors {
    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    Map<String, String> notFound(NoSuchElementException e) {
        return Map.of("error", "not found");
    }
}

// OUTPUT:
// GET /orders/999 -> 404 {"error":"not found"}`]
    ),

    'sb-auto-configuration': dv(
        [`<p>The mechanism step by step:</p><ul><li><b>Import:</b> <code>@EnableAutoConfiguration</code> imports <code>AutoConfigurationImportSelector</code>.</li><li><b>Load:</b> the selector reads the <code>AutoConfiguration.imports</code> files from all jars (older Boot versions used <code>spring.factories</code>).</li><li><b>Filter:</b> an annotation-based filter checks class and bean conditions cheaply from metadata before loading classes.</li><li><b>Deferred:</b> it is a <code>DeferredImportSelector</code>, so user beans are registered first and conditions like missing bean work.</li><li><b>Order:</b> sorted by <code>@AutoConfiguration(before, after)</code>.</li></ul>`,
            r`@AutoConfiguration(after = DataSourceAutoConfiguration.class)
@ConditionalOnClass(JdbcTemplate.class)
@ConditionalOnSingleCandidate(DataSource.class)
public class JdbcTemplateAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    JdbcTemplate jdbcTemplate(DataSource ds) { return new JdbcTemplate(ds); }
}

// OUTPUT:
// JdbcTemplate is created only when exactly one DataSource exists and none is user-defined`],
        [`<p>Condition annotations:</p><ul><li><b>Class:</b> <code>@ConditionalOnClass</code>, <code>@ConditionalOnMissingClass</code>.</li><li><b>Bean:</b> <code>@ConditionalOnBean</code>, <code>@ConditionalOnMissingBean</code>, <code>@ConditionalOnSingleCandidate</code>.</li><li><b>Property:</b> <code>@ConditionalOnProperty</code>.</li><li><b>Environment:</b> <code>@ConditionalOnWebApplication</code>, <code>@ConditionalOnCloudPlatform</code>, <code>@ConditionalOnExpression</code>.</li><li><b>Resource:</b> <code>@ConditionalOnResource</code>.</li></ul>`,
            r`@Configuration
@ConditionalOnProperty(prefix = "app.cache", name = "enabled",
        havingValue = "true", matchIfMissing = false)
class CacheFeature {
    @Bean CacheManager cacheManager() { return new ConcurrentMapCacheManager(); }
}

# OUTPUT:
# app.cache.enabled=true -> CacheManager bean exists;
absent or false -> skipped`],
        [`<p>Mistakes:</p><ul><li><b>Putting auto-configuration under component scan:</b> it loses ordering and condition semantics; register it in the imports file instead.</li><li><b>ConditionalOnBean in ordinary configuration</b> depends on registration order and may fail.</li><li><b>Excluding the wrong class</b> and then missing beans.</li><li><b>Assuming magic:</b> not reading the conditions report when something does not apply.</li></ul>`,
            r`Positive matches / Negative matches (from --debug):

SecurityAutoConfiguration: Did not match
   - @ConditionalOnClass did not find required class
     'org.springframework.security.web.SecurityFilterChain'

// OUTPUT:
// fix: add spring-boot-starter-security so the class is on the classpath`],
        [`<p>Auto-configuration runs once at startup.</p><ul><li>Each active auto-configuration adds beans; trim starters and exclude what you never use.</li><li>Lazy initialization (<code>spring.main.lazy-initialization=true</code>) shortens startup but moves errors to first use.</li><li>AOT processing evaluates conditions at build time for native images.</li></ul>`,
            r`spring.main.lazy-initialization=true
spring.autoconfigure.exclude=\
org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration

# OUTPUT:
# Started App in 1.2 seconds (varies); Mongo beans are never created`],
        [`A platform team wants every service to ship metrics to the company system. They write an auto-configuration with <code>@ConditionalOnProperty</code> so it can be switched off, and <code>@ConditionalOnMissingBean</code> so a service with special needs can supply its own reporter. A test with <code>ApplicationContextRunner</code> verifies both cases.`,
            r`new ApplicationContextRunner()
    .withConfiguration(AutoConfigurations.of(MetricsAutoConfiguration.class))
    .withBean(Reporter.class, () -> custom)
    .run(ctx -> assertThat(ctx.getBean(Reporter.class)).isSameAs(custom));

// OUTPUT:
// Tests run: 1, Failures: 0 (the user bean wins over the default)`]
    ),

    'sb-component-scanning-basics': dv(
        [`<p>How scanning works:</p><ul><li><b>Trigger:</b> <code>@ComponentScan</code> is processed by <code>ConfigurationClassPostProcessor</code>.</li><li><b>Search:</b> <code>ClassPathBeanDefinitionScanner</code> lists class files under the base package and reads annotation metadata with ASM, without loading classes.</li><li><b>Match:</b> classes annotated with <code>@Component</code> or an annotation meta-annotated with it (<code>@Service</code>, <code>@Repository</code>, <code>@Controller</code>, <code>@Configuration</code>) become bean definitions.</li><li><b>Naming:</b> <code>AnnotationBeanNameGenerator</code> creates names.</li><li><b>Instantiation</b> happens later, in the singleton pre-instantiation phase.</li></ul>`,
            r`@Component("fastCalc")
class Calculator {}

ctx.getBean("fastCalc");           // explicit name
ctx.getBean(Calculator.class);     // by type

// OUTPUT:
// both lookups return the same singleton instance`],
        [`<p>Ways to control scanning:</p><ul><li><code>@SpringBootApplication(scanBasePackages = ...)</code></li><li><code>@SpringBootApplication(scanBasePackageClasses = ...)</code> is refactor-safe</li><li><code>@ComponentScan</code> with filters of type ANNOTATION, ASSIGNABLE_TYPE, ASPECTJ, REGEX or CUSTOM</li><li><code>@Import</code> to register a class directly</li><li><code>@Bean</code> methods for third-party classes you cannot annotate</li></ul>`,
            r`@SpringBootApplication(scanBasePackageClasses = {ShopApp.class, AuditMarker.class})
public class ShopApp {}

// marker class in the other package keeps the scan refactor-safe
package com.audit;
public interface AuditMarker {}

// OUTPUT:
// packages of ShopApp and AuditMarker are both scanned`],
        [`<p>Mistakes:</p><ul><li><b>Default package:</b> the main class with no package scans every class on the classpath.</li><li><b>Main class in a sub-package</b> so sibling packages are skipped.</li><li><b>Scanning too wide</b> such as <code>com</code>, picking up library classes.</li><li><b>Forgetting a stereotype annotation</b> on the class.</li><li><b>Duplicate names</b> across packages.</li></ul>`,
            r`// WRONG: main class in com.example.shop.app, services in com.example.shop.order
package com.example.shop.app;
@SpringBootApplication
public class ShopApp {}
// OrderService is NOT found: NoSuchBeanDefinitionException

// FIX: move ShopApp to com.example.shop, or add scanBasePackages

// OUTPUT:
// after the move, orderService is registered`],
        [`<p>Scanning is a startup cost proportional to the number of classes under the base packages.</p><ul><li>Keep base packages narrow.</li><li>Exclude test or generated packages.</li><li>Spring AOT and native images replace runtime scanning with generated registrations.</li><li>Use the Actuator startup endpoint to see the time spent.</li></ul>`,
            r`@SpringBootApplication(scanBasePackages = "com.example.shop")
public class ShopApp {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ShopApp.class);
        app.setApplicationStartup(new BufferingApplicationStartup(2048));
        app.run(args);
    }
}

// OUTPUT:
// /actuator/startup lists steps such as spring.context.component-scan (varies)`],
        [`A modular monolith has packages <code>order</code>, <code>billing</code> and <code>inventory</code> under one root. Each module exposes a small public service interface and keeps its internals package-private. Because the main class sits at the root, no scan configuration is needed, and an architecture test checks that modules do not reach into each other.`,
            r`package com.example.shop.billing;

public interface BillingApi { void charge(long orderId); }

@Service
class BillingService implements BillingApi {   // package-private implementation
    public void charge(long orderId) { /* ... */ }
}

// OUTPUT:
// other modules inject BillingApi only; scanning registers billingService`]
    ),

    'spring-boot-internal-working': dv(
        [`<p>Inside <code>SpringApplication.run</code>:</p><ul><li><b>1.</b> Create the <code>SpringApplicationRunListeners</code> and publish <code>ApplicationStartingEvent</code>.</li><li><b>2.</b> Prepare the <code>Environment</code>: property sources and profiles, then <code>ApplicationEnvironmentPreparedEvent</code>.</li><li><b>3.</b> Print the banner and create the context (servlet web, reactive or plain).</li><li><b>4.</b> Prepare the context: apply initializers and load the main class as a bean source.</li><li><b>5.</b> Refresh: scan, auto-configure, create singletons and start the embedded server (<code>onRefresh</code> and <code>finishRefresh</code>).</li><li><b>6.</b> Call runners, then publish <code>ApplicationReadyEvent</code>.</li></ul>`,
            r`public ConfigurableApplicationContext run(String... args) {
    // simplified view of SpringApplication.run
    // listeners.starting(); prepareEnvironment(); createApplicationContext();
    // prepareContext(); refreshContext(); callRunners(); listeners.ready();
    return context;
}

// OUTPUT:
// log order: Starting App, active profile, Tomcat initialized, Started App in X seconds (varies)`],
        [`<p>Startup extension points:</p><ul><li><b>ApplicationContextInitializer</b> runs before refresh.</li><li><b>EnvironmentPostProcessor</b> adds property sources.</li><li><b>BeanPostProcessor</b> and <code>BeanFactoryPostProcessor</code> change beans or definitions.</li><li><b>SmartLifecycle</b> starts and stops components in phases.</li><li><b>Graceful shutdown:</b> <code>server.shutdown=graceful</code>.</li><li><b>SpringApplicationBuilder</b> for parent-child contexts.</li></ul>`,
            r`@Component
class WarmUp implements SmartLifecycle {
    private boolean running;
    public void start() {
        System.out.println("warm cache");
        running = true;
    }
    public void stop() { running = false; }
    public boolean isRunning() { return running; }
}

// OUTPUT:
// warm cache (printed during context refresh, after beans exist)`],
        [`<p>Mistakes:</p><ul><li><b>Heavy work in a constructor</b> or <code>@PostConstruct</code> delays or fails startup; use a runner or async task.</li><li><b>Circular dependencies:</b> Boot 2.6 and later forbid them by default; redesign instead of enabling them.</li><li><b>Port in use</b> error: change the port or stop the other process.</li><li><b>Config property typos</b> silently ignored; use <code>@ConfigurationProperties</code> with validation.</li><li><b>Reading beans before the context is ready.</b></li></ul>`,
            r`***************************
APPLICATION FAILED TO START
***************************

Description:
Web server failed to start. Port 8080 was already in use.

Action:
Identify and stop the process that is listening on port 8080
or configure this application to listen on another port.

// OUTPUT:
// fix: server.port=0 picks a random free port`],
        [`<p>Startup tuning:</p><ul><li>Measure first with <code>BufferingApplicationStartup</code> and the Actuator startup endpoint.</li><li>Lazy initialization, fewer starters and narrower scanning.</li><li>Class data sharing, layered jars and AOT or native images for containers.</li><li>Graceful shutdown and readiness probes for rolling deployments.</li></ul>`,
            r`server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s
management.endpoint.health.probes.enabled=true

# OUTPUT:
# on SIGTERM the app finishes in-flight requests (up to 20 s) before stopping`],
        [`A service takes 40 seconds to become ready in Kubernetes and gets restarted. The team reads the startup report, finds a bean loading a large file in <code>@PostConstruct</code>, moves it to an <code>ApplicationRunner</code> with readiness set only after loading, and adds a startup probe.`,
            r`@Component
class CacheLoader implements ApplicationRunner {
    private final ApplicationEventPublisher events;
    CacheLoader(ApplicationEventPublisher events) { this.events = events; }

    public void run(ApplicationArguments args) {
        // load data here
        AvailabilityChangeEvent.publish(events, this, ReadinessState.ACCEPTING_TRAFFIC);
    }
}

// OUTPUT:
// /actuator/health/readiness -> {"status":"UP"} only after the load finishes`]
    )
};
