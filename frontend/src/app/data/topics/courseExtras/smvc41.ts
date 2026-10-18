// Spring extras, batch smvc41 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc41Extras: Record<string, Extra> = {
    'mvc-thread-pool-management': x(
        ['<b>Thread pool</b>: a fixed set of reusable worker threads. Spring MVC on Tomcat handles each request on one pool thread from start to response (thread-per-request).',
            '<b>Key setting</b>: <code>server.tomcat.threads.max</code> (default 200) caps how many requests run at the same time; extra requests wait in the accept queue.',
            '<b>Second pool</b>: work moved off the request thread with <code>@Async</code> runs on a <code>TaskExecutor</code> such as <code>ThreadPoolTaskExecutor</code>, which you size yourself.'],
        ['<b>Pool sizing</b>: CPU-bound work needs about the number of cores; blocking I/O work needs more threads because most of them are waiting.',
            '<b>Queue and rejection</b>: a <code>ThreadPoolTaskExecutor</code> has core size, max size and queue capacity; when all are full the rejection policy decides (abort, caller runs, discard).',
            '<b>Thread names</b>: set <code>setThreadNamePrefix</code> so logs and thread dumps show which pool a thread belongs to.'],
        ['<b>Unbounded is dangerous</b>: an unbounded queue hides overload until memory runs out; use a bounded queue and a clear rejection policy.',
            '<b>Context propagation</b>: MDC, security context and request attributes do not follow a request into another thread unless you copy them with a <code>TaskDecorator</code>.',
            '<b>Virtual threads</b>: on Java 21 with Spring Boot 3.2+, <code>spring.threads.virtual.enabled=true</code> makes blocking code cheap, but a downstream connection pool is still a hard limit.'],
        [['F', 'What is a thread pool?', 'A set of pre-created threads that are reused to run tasks, which avoids the cost of creating a thread per task.'],
            ['F', 'Which property limits Tomcat request threads?', 'server.tomcat.threads.max, which defaults to 200 in Spring Boot.'],
            ['M', 'What do corePoolSize, maxPoolSize and queueCapacity mean?', 'Core threads are kept alive; new tasks fill the queue first, and only when the queue is full does the pool grow up to the max size.'],
            ['M', 'Why does @Async sometimes run on the caller thread?', 'Because @EnableAsync is missing, the method is called from inside the same class (proxy bypass), or it is not public.'],
            ['S', 'How do you size a pool for blocking calls?', 'Use threads = cores x (1 + wait time / compute time) as a start, then load test and watch queue length and latency.'],
            ['S', 'What happens when the pool and queue are full?', 'The RejectedExecutionHandler runs: AbortPolicy throws, CallerRunsPolicy slows the producer by running on its thread, so it gives back-pressure.']],
        [['Define a bounded executor for @Async.',
            r`@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean("mailExecutor")
    public ThreadPoolTaskExecutor mailExecutor() {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(4);
        ex.setMaxPoolSize(8);
        ex.setQueueCapacity(50);
        ex.setThreadNamePrefix("mail-");
        ex.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return ex;
    }
}

@Service
public class MailService {
    @Async("mailExecutor")
    public void send(String to) {
        System.out.println("sending to " + to + " on " + Thread.currentThread().getName());
    }
}

// OUTPUT: (varies)
// sending to a@x.com on mail-1`],
            ['Tune Tomcat in application.properties.',
                r`server.tomcat.threads.max=100
server.tomcat.threads.min-spare=20
server.tomcat.accept-count=50
server.tomcat.max-connections=8192

# OUTPUT:
# Tomcat runs at most 100 request threads;
50 more connections may wait,
# and further connections are refused or queued by the operating system.`]],
        [['Show which thread serves the request.',
            r`@RestController
public class ThreadController {
    @GetMapping("/thread")
    public String thread() {
        return Thread.currentThread().getName();
    }
}

// OUTPUT: (varies)
// GET /thread -> http-nio-8080-exec-3`],
            ['Test that the async executor is used.',
                r`@SpringBootTest
class AsyncTest {
    @Autowired MailService mail;

    @Test
    void runsOnPoolThread() throws Exception {
        CompletableFuture<String> f = mail.sendAndName("a@x.com");
        assertTrue(f.get(2, TimeUnit.SECONDS).startsWith("mail-"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-production-configuration': x(
        ['<b>Production configuration</b>: the settings that make an app safe, fast and observable when real users hit it: ports, timeouts, pools, logging, error detail and secrets.',
            '<b>Externalized</b>: the same jar runs everywhere; only configuration changes, through <code>application-prod.yml</code>, environment variables or a config server.',
            '<b>Defaults are for development</b>: you must review debug logging, stack traces in responses, open actuator endpoints and the default pool sizes before going live.'],
        ['<b>Property order</b>: command line arguments and environment variables override files, so ops can change a value without a rebuild.',
            '<b>Secrets</b>: never commit passwords; read them from environment variables, a vault or a mounted secret file.',
            '<b>Graceful shutdown</b>: <code>server.shutdown=graceful</code> lets in-flight requests finish before the app stops.'],
        ['<b>Error exposure</b>: set <code>server.error.include-stacktrace=never</code> and <code>include-message=never</code> so clients never see internals.',
            '<b>Timeouts everywhere</b>: connection, read and database timeouts stop one slow dependency from exhausting all threads.',
            '<b>Immutable config</b>: validate with <code>@ConfigurationProperties</code> and <code>@Validated</code> so a bad value fails the startup, not a request.'],
        [['F', 'Why separate production configuration?', 'Production needs different databases, secrets, logging and limits than a laptop, and the same build must work in both.'],
            ['F', 'Where do you put prod-only settings?', 'In application-prod.properties or yml, activated with the prod profile.'],
            ['M', 'Which source wins: application.yml or an environment variable?', 'The environment variable, because it has higher precedence in Spring Boot external configuration.'],
            ['M', 'What does server.shutdown=graceful do?', 'It stops accepting new requests and waits up to a timeout for running ones to finish.'],
            ['S', 'How do you keep secrets out of the repository?', 'Inject them at runtime from environment variables, Kubernetes secrets or a vault, and reference them through properties.'],
            ['S', 'How do you make sure a missing property stops the startup?', 'Bind to a @ConfigurationProperties class with @Validated and constraint annotations such as @NotBlank.']],
        [['A production properties file.',
            r`# application-prod.properties
server.port=8080
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s
server.error.include-stacktrace=never
server.error.include-message=never
server.compression.enabled=true
logging.level.root=WARN
logging.level.com.shop=INFO
spring.jpa.open-in-view=false
spring.jpa.show-sql=false

# OUTPUT:
# Started ShopApplication in 4.2 seconds (varies)
# The following 1 profile is active: "prod"`],
            ['Validated configuration properties.',
                r`@Validated
@ConfigurationProperties(prefix = "shop")
public record ShopProperties(
        @NotBlank String apiKey,
        @Min(1) @Max(60) int timeoutSeconds) { }

// OUTPUT:
// If shop.api-key is missing the app fails to start:
// Binding to target ShopProperties failed: Property: shop.apiKey, Reason: must not be blank`]],
        [['Override a value without rebuilding.',
            r`java -jar shop.jar --spring.profiles.active=prod --server.port=9090
# or with environment variables (relaxed binding):
SERVER_PORT=9090 SPRING_PROFILES_ACTIVE=prod java -jar shop.jar

# OUTPUT:
# Tomcat started on port 9090 (http)`],
            ['Test the binding.',
                r`@SpringBootTest(properties = {"shop.api-key=k1", "shop.timeout-seconds=5"})
class ShopPropertiesTest {
    @Autowired ShopProperties props;

    @Test
    void binds() {
        assertEquals("k1", props.apiKey());
        assertEquals(5, props.timeoutSeconds());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-environment-profiles': x(
        ['<b>Profile</b>: a named group of configuration and beans (such as dev, test, prod) that you switch on without changing code.',
            '<b>Activation</b>: set <code>spring.profiles.active=prod</code> as a property, an environment variable or a command line argument.',
            '<b>Profile files</b>: <code>application-dev.yml</code> is loaded on top of <code>application.yml</code> when the dev profile is active, and its values win.'],
        ['<b>@Profile</b> on a <code>@Component</code> or <code>@Bean</code> registers it only when the profile is active, for example an in-memory mail sender in dev.',
            '<b>Expressions</b>: <code>@Profile(&quot;!prod&quot;)</code> means any profile except prod; you can also combine with <code>&amp;</code> and <code>|</code>.',
            '<b>Profile groups</b>: <code>spring.profiles.group.prod=db,metrics</code> turns on several profiles at once.'],
        ['<b>Do not overuse</b>: many profiles create environments that behave differently; keep differences in configuration, not in code paths.',
            '<b>Default profile</b>: when none is active the profile is <code>default</code>; never rely on it in production, set the profile explicitly.',
            '<b>Multi-document yml</b>: one file can hold several sections separated by <code>---</code> with <code>spring.config.activate.on-profile</code>.'],
        [['F', 'What is a Spring profile?', 'A label that switches groups of beans and properties on or off for an environment.'],
            ['F', 'How do you activate a profile?', 'With spring.profiles.active in properties, an environment variable, or the command line.'],
            ['M', 'What does @Profile(&quot;!prod&quot;) do?', 'It registers the bean in every environment where the prod profile is not active.'],
            ['M', 'How do profile properties combine with the base file?', 'Both are loaded and profile-specific values override the same keys in application.properties.'],
            ['S', 'How do you activate a profile in a test?', 'Use @ActiveProfiles(&quot;test&quot;) on the test class, or the properties attribute of @SpringBootTest.'],
            ['S', 'Why avoid if (profile == prod) in code?', 'It hides environment differences in logic; use configuration or beans chosen by @Profile instead.']],
        [['Profile specific beans.',
            r`public interface Notifier { void send(String msg); }

@Component
@Profile("dev")
class ConsoleNotifier implements Notifier {
    public void send(String msg) { System.out.println("[console] " + msg); }
}

@Component
@Profile("prod")
class SmsNotifier implements Notifier {
    public void send(String msg) { /* call SMS gateway */ }
}

// OUTPUT: (with spring.profiles.active=dev)
// [console] Order 42 shipped`],
            ['Profile files in yml.',
                r`# application.yml
spring:
  application:
    name: shop
---
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8081
---
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 8080

# OUTPUT:
# dev  -> Tomcat started on port 8081
# prod -> Tomcat started on port 8080`]],
        [['Choose the profile at run time.',
            r`java -jar shop.jar --spring.profiles.active=dev

# OUTPUT:
# The following 1 profile is active: "dev"`],
            ['Test with a profile.',
                r`@SpringBootTest
@ActiveProfiles("dev")
class NotifierTest {
    @Autowired Notifier notifier;

    @Test
    void usesConsoleNotifier() {
        assertInstanceOf(ConsoleNotifier.class, notifier);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-security-configuration': x(
        ['<b>Spring Security</b> adds a chain of servlet filters in front of the DispatcherServlet that authenticate the caller and authorize each request.',
            '<b>SecurityFilterChain</b>: in Spring Security 6 you declare a bean of this type with <code>HttpSecurity</code> to say which URLs need which role.',
            '<b>Defaults</b>: once the starter is on the classpath every endpoint requires login and CSRF protection is on for form posts.'],
        ['<b>authorizeHttpRequests</b>: match paths with <code>requestMatchers</code>, then use <code>permitAll</code>, <code>hasRole</code> or <code>authenticated</code>; the first matching rule wins.',
            '<b>Password storage</b>: always declare a <code>PasswordEncoder</code> bean such as <code>BCryptPasswordEncoder</code>; never store plain text.',
            '<b>Method security</b>: <code>@EnableMethodSecurity</code> lets you use <code>@PreAuthorize</code> on service methods.'],
        ['<b>Stateless APIs</b>: for token based REST APIs set session creation to <code>STATELESS</code> and disable CSRF only because no cookie session exists.',
            '<b>Order of rules</b>: put specific matchers before general ones and end with <code>anyRequest().authenticated()</code>.',
            '<b>Headers and CORS</b>: configure CORS in the security chain, otherwise the filter rejects the preflight request before MVC sees it.'],
        [['F', 'What does Spring Security do?', 'It authenticates users and authorizes access to URLs and methods using servlet filters.'],
            ['F', 'Why must passwords be encoded?', 'So a database leak does not expose them; BCrypt is a slow salted hash.'],
            ['M', 'How do you configure security in Spring Security 6?', 'Declare a SecurityFilterChain bean using HttpSecurity; WebSecurityConfigurerAdapter was removed.'],
            ['M', 'Difference between hasRole and hasAuthority?', 'hasRole adds the ROLE_ prefix automatically; hasAuthority compares the exact string.'],
            ['S', 'When can CSRF be disabled?', 'For stateless APIs that authenticate with a header token and keep no session cookie.'],
            ['S', 'How do you test secured endpoints with MockMvc?', 'Use @WithMockUser or the SecurityMockMvcRequestPostProcessors, and include csrf() for state changing calls.']],
        [['A basic filter chain.',
            r`@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                .requestMatchers("/public/**", "/actuator/health").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }
}

// OUTPUT:
// GET /public/info -> 200
// GET /orders      -> 401 (no credentials)
// GET /admin/users -> 403 (logged in as USER)`],
            ['In memory users for a demo.',
                r`@Bean
UserDetailsService users(PasswordEncoder enc) {
    UserDetails u = User.withUsername("abaji")
            .password(enc.encode("secret")).roles("USER").build();
    UserDetails a = User.withUsername("root")
            .password(enc.encode("admin")).roles("ADMIN").build();
    return new InMemoryUserDetailsManager(u, a);
}

// OUTPUT:
// Basic auth abaji:secret -> authenticated with ROLE_USER`]],
        [['Test access rules.',
            r`@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminSecurityTest {
    @Autowired MockMvc mvc;

    @Test @WithMockUser(roles = "USER")
    void userIsForbidden() throws Exception {
        mvc.perform(get("/admin/users")).andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "ADMIN")
    void adminAllowed() throws Exception {
        mvc.perform(get("/admin/users")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`],
            ['Method level rule.',
                r`@Service
public class ReportService {
    @PreAuthorize("hasRole('ADMIN') or #owner == authentication.name")
    public Report load(String owner) { return new Report(owner); }
}

// OUTPUT:
// load("abaji") as abaji -> allowed
// load("abaji") as baji  -> AccessDeniedException`]]
    ),
    'mvc-centralized-exception-handling': x(
        ['<b>Centralized handling</b>: one place that turns exceptions from any controller into a consistent HTTP response, instead of try/catch in every method.',
            '<b>@RestControllerAdvice</b>: a class that applies to all controllers; each <code>@ExceptionHandler</code> method handles one exception type.',
            '<b>Status codes</b>: map business errors to the right code, such as 404 for not found, 400 for bad input and 409 for conflict.'],
        ['<b>Error body</b>: return a stable JSON shape (code, message, timestamp, path) so clients can parse every error the same way.',
            '<b>ResponseStatusException</b> and <code>@ResponseStatus</code> are quick options; an advice class gives full control.',
            '<b>Validation errors</b>: <code>MethodArgumentNotValidException</code> carries the field errors from <code>@Valid</code>; turn them into a field to message map.'],
        ['<b>ProblemDetail</b>: Spring 6 supports RFC 7807 with the <code>ProblemDetail</code> class and <code>spring.mvc.problemdetails.enabled=true</code>.',
            '<b>Handler order</b>: the most specific exception type wins; add a final <code>Exception</code> handler that logs and returns a safe 500.',
            '<b>No leaks</b>: never return stack traces or SQL messages to the client; log them with a correlation id and return only the id.'],
        [['F', 'Why centralize exception handling?', 'It removes repeated try/catch code and gives every endpoint the same error format.'],
            ['F', 'Which annotation creates a global handler for REST?', '@RestControllerAdvice, which combines @ControllerAdvice and @ResponseBody.'],
            ['M', 'Which exception does @Valid failure raise on a @RequestBody?', 'MethodArgumentNotValidException, with a BindingResult holding the field errors.'],
            ['M', 'How do you set the status for a handler?', 'Return ResponseEntity with a status, or annotate the handler with @ResponseStatus.'],
            ['S', 'What is ProblemDetail?', 'A Spring 6 class for the RFC 7807 error format with type, title, status, detail and instance.'],
            ['S', 'How do you avoid leaking internals on a 500?', 'Handle Exception generally, log it with an id, and return a generic message plus that id.']],
        [['A global advice.',
            r`@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiError> notFound(ProductNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> other(Exception ex) {
        log.error("Unhandled", ex);
        return ResponseEntity.internalServerError()
                .body(new ApiError("INTERNAL", "Something went wrong"));
    }
}
public record ApiError(String code, String message) { }

// OUTPUT:
// GET /products/99 -> 404 {"code":"NOT_FOUND","message":"Product 99 not found"}`],
            ['Validation errors to JSON.',
                r`@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, String>> invalid(
        MethodArgumentNotValidException ex) {
    Map<String, String> errors = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors()
      .forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));
    return ResponseEntity.badRequest().body(errors);
}

// OUTPUT:
// POST /products {"name":""} -> 400 {"name":"must not be blank"}`]],
        [['ProblemDetail response.',
            r`@ExceptionHandler(OrderConflictException.class)
public ProblemDetail conflict(OrderConflictException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT, ex.getMessage());
    pd.setTitle("Order conflict");
    return pd;
}

// OUTPUT:
// 409 {"type":"about:blank","title":"Order conflict","status":409,
//      "detail":"Order already paid","instance":"/orders/7"}`],
            ['Test the handler with MockMvc.',
                r`@WebMvcTest(ProductController.class)
class ErrorTest {
    @Autowired MockMvc mvc;
    @MockBean ProductService service;

    @Test
    void returns404() throws Exception {
        when(service.find(99L)).thenThrow(new ProductNotFoundException(99L));
        mvc.perform(get("/products/99"))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-api-logging': x(
        ['<b>API logging</b>: recording each request and response (method, path, status, duration) so you can trace and debug production traffic.',
            '<b>Where</b>: do it once in a servlet <code>Filter</code> or a <code>HandlerInterceptor</code>, not inside every controller.',
            '<b>Built in</b>: <code>CommonsRequestLoggingFilter</code> logs request details at DEBUG level when you register it as a bean.'],
        ['<b>Correlation id</b>: put a request id in the MDC so every log line of one request can be found together.',
            '<b>Body caching</b>: the request body stream can be read once; wrap it with <code>ContentCachingRequestWrapper</code> to log it after the controller has read it.',
            '<b>Log levels</b>: use INFO for one summary line per request and DEBUG for payloads.'],
        ['<b>Mask sensitive data</b>: never log passwords, tokens, card numbers or personal data; filter the headers and JSON fields.',
            '<b>Cost</b>: logging large bodies slows the request and fills disks; cap the payload length and skip health checks.',
            '<b>Filter vs interceptor</b>: a filter sees everything including security rejections; an interceptor knows the handler method but only runs for MVC mappings.'],
        [['F', 'What should an API log line contain?', 'Method, URI, status, duration and a request id.'],
            ['F', 'Where do you log all requests in one place?', 'In a servlet filter or a HandlerInterceptor.'],
            ['M', 'Why wrap the request in ContentCachingRequestWrapper?', 'Because the body input stream can be read only once, so the wrapper keeps a copy for logging.'],
            ['M', 'What is MDC?', 'A thread-local map of context values that the logging pattern can print on every line.'],
            ['S', 'Filter or interceptor for logging?', 'A filter for complete coverage including security failures; an interceptor if you need the matched controller method.'],
            ['S', 'How do you keep secrets out of logs?', 'Mask known fields and headers, truncate bodies, and never log the Authorization header.']],
        [['A logging filter with timing and request id.',
            r`@Component
public class RequestLogFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestLogFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", id);
        long start = System.currentTimeMillis();
        try {
            chain.doFilter(req, res);
        } finally {
            log.info("{} {} -> {} ({} ms)", req.getMethod(),
                    req.getRequestURI(), res.getStatus(),
                    System.currentTimeMillis() - start);
            MDC.clear();
        }
    }
}

// OUTPUT: (varies)
// INFO [requestId=3f9a1c2e] GET /products/5 -> 200 (12 ms)`],
            ['Built-in request logging.',
                r`@Bean
CommonsRequestLoggingFilter requestLogging() {
    CommonsRequestLoggingFilter f = new CommonsRequestLoggingFilter();
    f.setIncludeQueryString(true);
    f.setIncludePayload(true);
    f.setMaxPayloadLength(500);
    return f;
}

# application.properties
# logging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=DEBUG

// OUTPUT:
// DEBUG Before request [POST /orders?x=1, payload={"qty":2}]`]],
        [['Log pattern with MDC.',
            r`# application.properties
logging.pattern.console=%d{HH:mm:ss}
%-5level [%X{requestId}] %logger{20}
- %msg%n

# OUTPUT:
# 10:15:02 INFO  [3f9a1c2e] c.s.RequestLogFilter - GET /products/5 -> 200 (12 ms)`],
            ['Test that the filter does not break the chain.',
                r`@WebMvcTest(ProductController.class)
@Import(RequestLogFilter.class)
class LogFilterTest {
    @Autowired MockMvc mvc;

    @Test
    void passesThrough() throws Exception {
        mvc.perform(get("/products/5")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-audit-logging': x(
        ['<b>Audit log</b>: a permanent record of who did what, to which data and when; it answers compliance and investigation questions.',
            '<b>Different from API logging</b>: an application log helps developers debug; an audit log is a business record that must be complete and tamper resistant.',
            '<b>Typical fields</b>: actor (user), action, entity and id, old and new values, timestamp, and source IP.'],
        ['<b>JPA auditing</b>: <code>@EnableJpaAuditing</code> with <code>@CreatedBy</code>, <code>@CreatedDate</code>, <code>@LastModifiedBy</code> and <code>@LastModifiedDate</code> fills the basic columns for you.',
            '<b>AuditorAware</b>: implement this bean to tell Spring who the current user is, usually from the <code>SecurityContext</code>.',
            '<b>Events</b>: publish an application event after a business action and write the audit row in a listener, which keeps services clean.'],
        ['<b>Transaction boundary</b>: write the audit row in the same transaction as the change so they commit or fail together; use <code>@TransactionalEventListener</code> only if losing the row is acceptable.',
            '<b>History tables</b>: Hibernate Envers keeps full revisions of an entity with <code>@Audited</code>.',
            '<b>Append only</b>: never update or delete audit rows; restrict database rights and consider shipping them to a separate store.'],
        [['F', 'What is an audit log?', 'A record of who changed what and when, kept for accountability and compliance.'],
            ['F', 'Which annotation fills the created date automatically?', '@CreatedDate with @EnableJpaAuditing and AuditingEntityListener.'],
            ['M', 'What does AuditorAware do?', 'It supplies the current user so @CreatedBy and @LastModifiedBy can be filled.'],
            ['M', 'Why not use the normal log file for audit?', 'Log files rotate, are unstructured, and are not guaranteed complete; audit data needs durable queryable storage.'],
            ['S', 'How do you make sure the audit row is not lost?', 'Save it in the same database transaction as the business change.'],
            ['S', 'What does Hibernate Envers add?', 'Automatic revision tables that store every version of an @Audited entity with revision number and time.']],
        [['JPA auditing fields.',
            r`@Configuration
@EnableJpaAuditing
class AuditConfig {
    @Bean
    AuditorAware<String> auditor() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName);
    }
}

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {
    @CreatedBy String createdBy;
    @CreatedDate Instant createdAt;
    @LastModifiedBy String updatedBy;
    @LastModifiedDate Instant updatedAt;
}

// OUTPUT: (varies)
// insert into product (created_by, created_at, ...) values ('abaji', '2026-10-09T10:15:00Z', ...)`],
            ['Explicit audit event.',
                r`public record AuditEvent(String actor, String action, String entity, Long id) { }

@Service
public class OrderService {
    private final ApplicationEventPublisher events;
    // constructor omitted

    @Transactional
    public void cancel(Long orderId, String user) {
        // ... change the order ...
        events.publishEvent(new AuditEvent(user, "CANCEL", "Order", orderId));
    }
}

@Component
class AuditListener {
    @EventListener
    void on(AuditEvent e) {
        System.out.println("AUDIT " + e.actor() + " " + e.action() + " "
                + e.entity() + "#" + e.id());
    }
}

// OUTPUT:
// AUDIT abaji CANCEL Order#7`]],
        [['Test the audit event.',
            r`@SpringBootTest
class AuditTest {
    @Autowired OrderService service;
    @Autowired ApplicationEvents events;   // with @RecordApplicationEvents

    @Test
    void cancelPublishesAudit() {
        service.cancel(7L, "abaji");
        assertEquals(1, events.stream(AuditEvent.class).count());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Envers entity.',
                r`@Entity
@Audited
public class Price {
    @Id @GeneratedValue Long id;
    BigDecimal amount;
}

// OUTPUT:
// Tables created: price, price_aud, revinfo
// Each update adds a row to price_aud with the revision number`]]
    ),
    'mvc-monitoring': x(
        ['<b>Monitoring</b>: collecting numbers about a running application (requests, errors, memory, threads) so you notice problems before users do.',
            '<b>Spring Boot Actuator</b>: the starter <code>spring-boot-starter-actuator</code> adds ready-made endpoints under <code>/actuator</code>.',
            '<b>Micrometer</b>: the metrics facade behind Actuator; it sends the same metrics to Prometheus, Datadog and others.'],
        ['<b>Expose endpoints</b>: only health is exposed over HTTP by default; choose more with <code>management.endpoints.web.exposure.include</code>.',
            '<b>Useful endpoints</b>: <code>/actuator/metrics</code>, <code>/actuator/info</code>, <code>/actuator/prometheus</code>, <code>/actuator/loggers</code>.',
            '<b>Automatic metrics</b>: JVM memory, GC, threads, HTTP server request timers and datasource pool numbers appear without code.'],
        ['<b>Custom metrics</b>: inject <code>MeterRegistry</code> and create a <code>Counter</code>, <code>Timer</code> or <code>Gauge</code> for business events.',
            '<b>Tag cardinality</b>: never use user ids or raw URLs as tags; high cardinality explodes memory in the metrics backend.',
            '<b>Secure it</b>: actuator endpoints reveal internals; put them on a separate management port or behind authentication.'],
        [['F', 'What is Spring Boot Actuator?', 'A module that exposes production ready endpoints for health, metrics and application information.'],
            ['F', 'Which URL shows health?', '/actuator/health.'],
            ['M', 'What is Micrometer?', 'A vendor neutral metrics API that Actuator uses to publish metrics to many monitoring systems.'],
            ['M', 'How do you expose more endpoints?', 'Set management.endpoints.web.exposure.include to a list such as health,info,metrics,prometheus.'],
            ['S', 'Counter versus Gauge?', 'A counter only goes up (events); a gauge samples a current value that can go up and down (queue size).'],
            ['S', 'Why is tag cardinality important?', 'Each unique tag value creates a new time series, so unbounded values can overload the monitoring store.']],
        [['Expose actuator endpoints.',
            r`# application.properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when-authorized
management.server.port=9091

# OUTPUT:
# GET http://localhost:9091/actuator/metrics
# {"names":["jvm.memory.used","http.server.requests","system.cpu.usage", ...]}`],
            ['A custom counter.',
                r`@Service
public class CheckoutService {
    private final Counter orders;

    public CheckoutService(MeterRegistry registry) {
        this.orders = Counter.builder("shop.orders.placed")
                .description("Orders placed").register(registry);
    }

    public void place() {
        // ... business logic ...
        orders.increment();
    }
}

// OUTPUT:
// GET /actuator/metrics/shop.orders.placed
// {"name":"shop.orders.placed","measurements":[{"statistic":"COUNT","value":3.0}]}`]],
        [['Read one metric.',
            r`GET /actuator/metrics/http.server.requests?tag=status:200

// OUTPUT: (varies)
// {"name":"http.server.requests","baseUnit":"seconds",
//  "measurements":[{"statistic":"COUNT","value":128.0},
//                  {"statistic":"TOTAL_TIME","value":4.71}]}`],
            ['Test that the metric exists.',
                r`@SpringBootTest
class MetricTest {
    @Autowired MeterRegistry registry;
    @Autowired CheckoutService service;

    @Test
    void countsOrders() {
        service.place();
        assertEquals(1.0, registry.get("shop.orders.placed").counter().count());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-health-checks': x(
        ['<b>Health check</b>: a cheap endpoint that tells a load balancer or orchestrator whether the app is alive and able to serve traffic.',
            '<b>Actuator</b>: <code>/actuator/health</code> returns <code>{&quot;status&quot;:&quot;UP&quot;}</code> or <code>DOWN</code> with HTTP 200 or 503.',
            '<b>Auto indicators</b>: Boot adds checks for the database, disk space, mail and other beans it finds on the classpath.'],
        ['<b>Custom indicator</b>: implement <code>HealthIndicator</code> and return <code>Health.up()</code> or <code>Health.down()</code> with details.',
            '<b>Liveness and readiness</b>: liveness says the process is not stuck; readiness says it can accept requests. Kubernetes probes use <code>/actuator/health/liveness</code> and <code>/readiness</code>.',
            '<b>Details</b>: <code>management.endpoint.health.show-details</code> controls who can see the component breakdown.'],
        ['<b>Do not over-check</b>: a liveness probe that calls the database restarts healthy pods when the database is down; keep liveness internal and put dependencies in readiness.',
            '<b>Timeouts</b>: a slow indicator blocks the probe; keep each check fast and bounded.',
            '<b>Groups</b>: <code>management.endpoint.health.group.readiness.include</code> chooses which indicators belong to readiness.'],
        [['F', 'What is a health check?', 'An endpoint that reports whether the application is running and its dependencies are usable.'],
            ['F', 'Which URL gives health in Spring Boot?', '/actuator/health.'],
            ['M', 'How do you write a custom health check?', 'Create a bean implementing HealthIndicator and return Health.up() or Health.down().'],
            ['M', 'Liveness versus readiness?', 'Liveness means restart me if it fails; readiness means do not send me traffic yet.'],
            ['S', 'Why not check the database in liveness?', 'A database outage would make the orchestrator restart every healthy instance, which makes recovery worse.'],
            ['S', 'How do you hide details from the public?', 'Set show-details to when-authorized or never, and secure the endpoint.']],
        [['A custom health indicator.',
            r`@Component
public class PaymentGatewayHealth implements HealthIndicator {
    private final PaymentClient client;
    public PaymentGatewayHealth(PaymentClient client) { this.client = client; }

    @Override
    public Health health() {
        try {
            long ms = client.ping();
            return Health.up().withDetail("latencyMs", ms).build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}

// OUTPUT:
// GET /actuator/health -> 200
// {"status":"UP","components":{"paymentGateway":{"status":"UP",
//   "details":{"latencyMs":42}}, "db":{"status":"UP"}}}`],
            ['Enable Kubernetes probes.',
                r`# application.properties
management.endpoint.health.probes.enabled=true
management.endpoint.health.show-details=always
management.endpoint.health.group.readiness.include=readinessState,db

# OUTPUT:
# GET /actuator/health/liveness  -> {"status":"UP"}
# GET /actuator/health/readiness -> {"status":"UP"}`]],
        [['Failing check returns 503.',
            r`GET /actuator/health

// OUTPUT: (when the gateway is down)
// HTTP 503 Service Unavailable
// {"status":"DOWN","components":{"paymentGateway":{"status":"DOWN",
//   "details":{"error":"java.net.ConnectException: Connection refused"}}}}`],
            ['Test the indicator.',
                r`class PaymentGatewayHealthTest {
    @Test
    void downWhenPingFails() {
        PaymentClient client = mock(PaymentClient.class);
        when(client.ping()).thenThrow(new RuntimeException("timeout"));
        Health h = new PaymentGatewayHealth(client).health();
        assertEquals(Status.DOWN, h.getStatus());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-performance-monitoring-production': x(
        ['<b>Performance monitoring</b>: measuring latency, throughput, error rate and resource use of the live application to find slow spots and regressions.',
            '<b>Four golden signals</b>: latency, traffic, errors and saturation; watch these first on every service.',
            '<b>Tools</b>: Actuator and Micrometer for metrics, a tracing system for request paths, and the JVM tools (JFR, thread dumps) for deep dives.'],
        ['<b>Percentiles, not averages</b>: an average hides slow requests; track p95 and p99 with <code>management.metrics.distribution.percentiles-histogram.http.server.requests=true</code>.',
            '<b>@Timed and Timer</b>: wrap important methods in a <code>Timer</code> to see how long database or remote calls take.',
            '<b>Saturation</b>: watch Tomcat busy threads, datasource pool usage and JVM heap and GC time.'],
        ['<b>Distributed tracing</b>: Micrometer Tracing adds trace and span ids to logs and to outgoing calls so you can follow one request across services.',
            '<b>Profiling in production</b>: Java Flight Recorder has low overhead and can be started on demand to find hot methods.',
            '<b>Alerts on symptoms</b>: alert on error rate and p99 latency against an SLO, not on every CPU spike.'],
        [['F', 'What do we measure for performance?', 'Response time, throughput, error rate and resource usage such as CPU and memory.'],
            ['F', 'Which Spring module gives metrics?', 'Spring Boot Actuator with Micrometer.'],
            ['M', 'Why use p99 instead of average latency?', 'Averages hide the slowest requests that real users experience; percentiles show them.'],
            ['M', 'What is the metric name for request timing?', 'http.server.requests, tagged by method, uri, status and outcome.'],
            ['S', 'How does distributed tracing help?', 'It links the spans of one request across services, so you see which hop was slow.'],
            ['S', 'How do you find a hot method in production?', 'Record with Java Flight Recorder or take several thread dumps, then read the hottest stacks.']],
        [['Percentile histograms and a timer.',
            r`# application.properties
management.metrics.distribution.percentiles-histogram.http.server.requests=true
management.metrics.distribution.slo.http.server.requests=100ms,500ms
management.endpoints.web.exposure.include=health,metrics,prometheus

@Service
public class ReportService {
    private final Timer timer;
    public ReportService(MeterRegistry registry) {
        this.timer = Timer.builder("shop.report.time").register(registry);
    }
    public Report build() {
        return timer.record(() -> heavyQuery());
    }
}

// OUTPUT:
// GET /actuator/metrics/shop.report.time
// {"measurements":[{"statistic":"COUNT","value":10.0},
//  {"statistic":"TOTAL_TIME","value":8.2},{"statistic":"MAX","value":1.4}]}`],
            ['Trace ids in the log line.',
                r`# pom.xml: micrometer-tracing-bridge-brave (or otel) and actuator
# application.properties
management.tracing.sampling.probability=0.1
logging.pattern.level=%5p [%X{traceId:-},%X{spanId:-}]

# OUTPUT: (varies)
# INFO [6f1c2a9d3b7e4a10,9b2c4d1e8f3a7c55] c.s.OrderService - order placed`]],
        [['Find slow endpoints from metrics.',
            r`GET /actuator/metrics/http.server.requests?tag=uri:/orders&tag=status:200

// OUTPUT: (varies)
// COUNT 5400, TOTAL_TIME 270.0 s, MAX 3.1 s
// average = 50 ms but MAX = 3.1 s -> look at p99 and the slow query`],
            ['Load test sanity check in a test.',
                r`@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class LatencyTest {
    @Autowired TestRestTemplate rest;

    @Test
    void ordersRespondQuickly() {
        long start = System.nanoTime();
        rest.getForEntity("/orders", String.class);
        long ms = (System.nanoTime() - start) / 1_000_000;
        assertTrue(ms < 500, "took " + ms + " ms");
    }
}

// OUTPUT: (varies)
// Tests run: 1, Failures: 0, Errors: 0`]]
    )
};

export const smvc41Deep: Record<string, Deep> = {
    'mvc-thread-pool-management': dv(
        [`<p>Spring MVC runs on a servlet container and each request occupies one thread until the response is written.</p><ul><li><b>Acceptor and poller:</b> Tomcat NIO accepts connections, polls them for data, and hands each ready request to a worker thread.</li><li><b>Worker pool:</b> a <code>ThreadPoolExecutor</code> with min-spare and max threads; the <code>DispatcherServlet</code> runs entirely on one worker.</li><li><b>Queues:</b> the accept-count queue holds connections when all workers are busy.</li><li><b>@Async:</b> a proxy submits the method call to a <code>TaskExecutor</code> bean; the caller returns at once.</li><li><b>ThreadPoolExecutor rule:</b> new tasks fill core threads, then the queue, then extra threads up to the max.</li></ul>`,
            r`ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
ex.setCorePoolSize(2);
ex.setMaxPoolSize(4);
ex.setQueueCapacity(2);
ex.initialize();
for (int i = 1; i <= 6; i++) {
    int n = i;
    ex.execute(() -> sleep(500));
    System.out.println("task " + n + " pool=" + ex.getPoolSize()
            + " queue=" + ex.getThreadPoolExecutor().getQueue().size());
}

// OUTPUT:
// task 1 pool=1 queue=0
// task 2 pool=2 queue=0
// task 3 pool=2 queue=1
// task 4 pool=2 queue=2
// task 5 pool=3 queue=2   (queue full, pool grows)
// task 6 pool=4 queue=2`],
        [`<p>Options for managing threads in a Spring MVC application:</p><ul><li><b>Tomcat:</b> <code>server.tomcat.threads.max</code>, <code>threads.min-spare</code>, <code>accept-count</code>, <code>max-connections</code>.</li><li><b>Jetty and Undertow:</b> have their own equivalent properties.</li><li><b>@Async executor:</b> <code>ThreadPoolTaskExecutor</code> (blocking queue) or <code>SimpleAsyncTaskExecutor</code> (a new thread per task, no pool).</li><li><b>Spring Boot auto executor:</b> <code>spring.task.execution.pool.*</code> properties configure the default <code>applicationTaskExecutor</code>.</li><li><b>Scheduling:</b> <code>spring.task.scheduling.pool.size</code>, because the default scheduler has one thread.</li><li><b>Virtual threads:</b> <code>spring.threads.virtual.enabled=true</code> (Java 21, Boot 3.2+).</li></ul>`,
            r`# application.properties
spring.task.execution.pool.core-size=8
spring.task.execution.pool.max-size=16
spring.task.execution.pool.queue-capacity=100
spring.task.execution.thread-name-prefix=app-
spring.task.scheduling.pool.size=4
spring.task.execution.shutdown.await-termination=true
spring.task.execution.shutdown.await-termination-period=20s

# OUTPUT:
# Default @Async tasks run on app-1 ... app-16
# @Scheduled jobs run on scheduling-1 ... scheduling-4`],
        [`<p>Typical mistakes with thread pools:</p><ul><li><b>Default scheduler:</b> two <code>@Scheduled</code> jobs block each other with a single thread; raise the pool size.</li><li><b>Self invocation:</b> calling an <code>@Async</code> method from the same class skips the proxy and runs synchronously.</li><li><b>Unbounded queue:</b> the default queue capacity is unlimited, so the pool never grows past core size and memory fills under load.</li><li><b>Blocking in the wrong pool:</b> long calls on Tomcat threads starve all other requests.</li><li><b>Lost context:</b> MDC and the security context are empty in the async thread.</li><li><b>Swallowed errors:</b> a void <code>@Async</code> method needs an <code>AsyncUncaughtExceptionHandler</code>.</li></ul>`,
            r`// Wrong: same-class call, runs on the caller thread
@Service
class Wrong {
    public void run() { send(); }          // proxy bypassed
    @Async public void send() { }
}

// Right: copy MDC into the async thread
ex.setTaskDecorator(task -> {
    Map<String, String> ctx = MDC.getCopyOfContextMap();
    return () -> {
        if (ctx != null) MDC.setContextMap(ctx);
        try { task.run(); } finally { MDC.clear(); }
    };
});

// OUTPUT:
// Wrong: [http-nio-8080-exec-1] send
// Right: [mail-1] [requestId=3f9a1c2e] send`],
        [`<p>Tuning approach:</p><ul><li><b>Measure first:</b> watch <code>tomcat.threads.busy</code>, <code>executor.queued</code> and request latency.</li><li><b>Little's law:</b> concurrent requests = throughput x latency; 200 requests per second at 0.5 s needs about 100 busy threads.</li><li><b>Match downstream limits:</b> more threads than database connections only creates waiting.</li><li><b>Bulkheads:</b> use separate pools for slow third party calls so they cannot starve the rest.</li><li><b>Fewer threads can be faster:</b> too many cause context switching and memory use (each stack is about 1 MB).</li></ul>`,
            r`@Bean
MeterBinder executorMetrics(ThreadPoolTaskExecutor mailExecutor) {
    return new ExecutorServiceMetrics(
            mailExecutor.getThreadPoolExecutor(), "mail", List.of());
}

// Prometheus names after binding:
// executor_active_threads{name="mail"}
// executor_queued_tasks{name="mail"}

// OUTPUT: (varies)
// executor_active_threads 3.0
// executor_queued_tasks 12.0   -> consider more threads or slower intake`],
        [`<p>Scenario: an order service calls a slow shipping API (about 2 s). With 200 Tomcat threads, 200 simultaneous slow calls freeze the whole app, including health checks.</p><ul><li><b>Fix:</b> call shipping from a dedicated bounded executor with a timeout.</li><li><b>Back-pressure:</b> use <code>CallerRunsPolicy</code> or return 503 when the pool is full.</li><li><b>Observability:</b> graph busy threads and queue size and alert at 80 percent.</li></ul>`,
            r`@Service
public class ShippingFacade {
    private final ThreadPoolTaskExecutor shippingPool;
    private final ShippingClient client;
    // constructor omitted

    public CompletableFuture<Quote> quote(Order o) {
        return CompletableFuture.supplyAsync(() -> client.quote(o), shippingPool)
                .orTimeout(3, TimeUnit.SECONDS)
                .exceptionally(ex -> Quote.unavailable());
    }
}

// OUTPUT:
// Slow shipping API: request returns in at most 3 s with Quote.unavailable();
// other endpoints and /actuator/health stay fast.`]
    ),
    'mvc-production-configuration': dv(
        [`<p>Spring Boot builds one <code>Environment</code> from many property sources in a fixed order.</p><ul><li><b>Highest to lowest (simplified):</b> command line arguments, <code>SPRING_APPLICATION_JSON</code>, OS environment variables, profile files outside the jar, profile files inside the jar, base <code>application.properties</code>, then <code>@PropertySource</code> and defaults.</li><li><b>Relaxed binding:</b> <code>SERVER_PORT</code>, <code>server.port</code> and <code>server-port</code> all map to the same property.</li><li><b>Binder:</b> <code>@ConfigurationProperties</code> converts and validates values into typed objects at startup.</li><li><b>Config import:</b> <code>spring.config.import</code> can add files, a config tree, or a config server.</li></ul>`,
            r`@Component
class ConfigDump implements CommandLineRunner {
    private final Environment env;
    ConfigDump(Environment env) { this.env = env; }

    public void run(String... args) {
        for (PropertySource<?> ps : ((AbstractEnvironment) env).getPropertySources())
            System.out.println(ps.getName());
    }
}

// OUTPUT: (varies)
// commandLineArgs
// systemProperties
// systemEnvironment
// Config resource 'class path resource [application-prod.properties]'
// Config resource 'class path resource [application.properties]'`],
        [`<p>Where production settings can come from:</p><ul><li><b>Files:</b> <code>application-prod.yml</code> next to the jar, or in a <code>config/</code> folder, which overrides the packaged file.</li><li><b>Environment variables:</b> the usual choice in containers.</li><li><b>Config tree:</b> <code>spring.config.import=configtree:/run/secrets/</code> reads Kubernetes or Docker secrets as properties.</li><li><b>Config server and vaults:</b> Spring Cloud Config or HashiCorp Vault.</li><li><b>Typed binding:</b> records with <code>@ConfigurationProperties</code> and <code>@Validated</code>.</li></ul>`,
            r`# application-prod.yml
spring:
  config:
    import: optional:configtree:/run/secrets/
  datasource:
    url: jdbc:postgresql://db.internal:5432/shop
    hikari:
      maximum-pool-size: 20
      connection-timeout: 3000
server:
  shutdown: graceful
  tomcat:
    threads:
      max: 150

# OUTPUT:
# A file /run/secrets/spring.datasource.password becomes the property
# spring.datasource.password with the file content as value.`],
        [`<p>Common production configuration mistakes:</p><ul><li><b>Dev defaults in prod:</b> <code>show-sql</code>, DEBUG logging, <code>ddl-auto=update</code>.</li><li><b>Open in view:</b> <code>spring.jpa.open-in-view</code> is true by default and holds a database connection for the whole request.</li><li><b>Secrets in git:</b> passwords in <code>application.properties</code>.</li><li><b>Exposed actuator:</b> <code>include=*</code> on the public port.</li><li><b>No timeouts:</b> default HTTP client and database waits are long or infinite.</li><li><b>Hard exit:</b> kill signals that drop in-flight requests because graceful shutdown is off.</li></ul>`,
            r`# Wrong
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
management.endpoints.web.exposure.include=*
spring.datasource.password=admin123

# Right
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
management.endpoints.web.exposure.include=health,info,prometheus
# password comes from the DB_PASSWORD environment variable
spring.datasource.password=

# OUTPUT:
# ddl-auto=validate fails the startup if the schema does not match the entities`],
        [`<p>Tuning for startup, memory and throughput:</p><ul><li><b>JVM flags:</b> set <code>-XX:MaxRAMPercentage=75</code> in containers so the heap follows the memory limit.</li><li><b>Connection pool:</b> size HikariCP to the database capacity, often 10 to 30, not hundreds.</li><li><b>Compression and caching:</b> <code>server.compression.enabled=true</code> and HTTP caching headers for static data.</li><li><b>Lazy initialization:</b> <code>spring.main.lazy-initialization=true</code> speeds startup but moves failures to first use.</li><li><b>Layered jars or native image:</b> faster container builds and starts.</li></ul>`,
            r`# Dockerfile excerpt
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+ExitOnOutOfMemoryError",
            "-jar", "/app/shop.jar"]

# application-prod.properties
spring.datasource.hikari.maximum-pool-size=20
server.compression.enabled=true
server.compression.min-response-size=1024

# OUTPUT:
# Container with 2 GB limit -> max heap about 1.5 GB (varies)`],
        [`<p>Scenario: the team releases one image through test, staging and production.</p><ul><li><b>Image:</b> contains no secrets and no environment specific files.</li><li><b>Config:</b> a Kubernetes ConfigMap supplies non secret values and a Secret supplies passwords.</li><li><b>Validation:</b> a missing database URL stops the pod during startup, so the rollout halts and the old version keeps serving.</li></ul>`,
            r`# Kubernetes container spec (excerpt)
env:
  - name: SPRING_PROFILES_ACTIVE
    value: prod
  - name: SPRING_DATASOURCE_URL
    valueFrom:
      configMapKeyRef: { name: shop-config, key: db-url }
  - name: SPRING_DATASOURCE_PASSWORD
    valueFrom:
      secretKeyRef: { name: shop-secret, key: db-password }

# OUTPUT:
# Same image runs in every environment;
only these values differ.`]
    ),
    'mvc-environment-profiles': dv(
        [`<p>Profiles are evaluated while the application context is prepared.</p><ul><li><b>Environment:</b> holds the active profile names; they come from <code>spring.profiles.active</code> or <code>SpringApplication.setAdditionalProfiles</code>.</li><li><b>Bean registration:</b> <code>@Profile</code> is a <code>@Conditional</code> (<code>ProfileCondition</code>); the condition is checked when the bean definition is scanned.</li><li><b>Config loading:</b> <code>ConfigDataEnvironment</code> loads <code>application.yml</code> first, then <code>application-{profile}.yml</code> for each active profile in order; later profiles win.</li><li><b>Default:</b> when nothing is active the profile named <code>default</code> is used.</li></ul>`,
            r`@Component
class ProfilePrinter implements CommandLineRunner {
    private final Environment env;
    ProfilePrinter(Environment env) { this.env = env; }

    public void run(String... args) {
        System.out.println("active  = " + Arrays.toString(env.getActiveProfiles()));
        System.out.println("default = " + Arrays.toString(env.getDefaultProfiles()));
        System.out.println("accepts prod? " + env.acceptsProfiles(Profiles.of("prod")));
    }
}

// OUTPUT: (run with --spring.profiles.active=dev,metrics)
// active  = [dev, metrics]
// default = [default]
// accepts prod? false`],
        [`<p>Ways to select and combine profiles:</p><ul><li><b>Activate:</b> property, env var <code>SPRING_PROFILES_ACTIVE</code>, <code>--spring.profiles.active</code>, or <code>@ActiveProfiles</code> in tests.</li><li><b>Include:</b> <code>spring.profiles.include</code> adds always-on profiles (not allowed inside a profile specific file).</li><li><b>Groups:</b> <code>spring.profiles.group.prod=proddb,prodmq</code>.</li><li><b>Expressions:</b> <code>@Profile(&quot;dev &amp; !mock&quot;)</code> and <code>@Profile({&quot;dev&quot;, &quot;test&quot;})</code> (either).</li><li><b>Programmatic:</b> <code>app.setAdditionalProfiles(&quot;cloud&quot;)</code>.</li></ul>`,
            r`# application.properties
spring.profiles.group.prod=proddb,metrics
spring.profiles.group.dev=h2,debuglog

@Configuration
@Profile("h2")
class H2Config {
    @Bean DataSource ds() {
        return new EmbeddedDatabaseBuilder().setType(EmbeddedDatabaseType.H2).build();
    }
}

// OUTPUT: (with --spring.profiles.active=prod)
// The following 3 profiles are active: "prod", "proddb", "metrics"`],
        [`<p>Typical profile mistakes:</p><ul><li><b>Typos:</b> <code>prd</code> instead of <code>prod</code> silently loads nothing.</li><li><b>Profile in code branches:</b> <code>if (env.acceptsProfiles(...))</code> spread through services.</li><li><b>Test only profile bean in prod:</b> forgetting <code>@Profile</code> lets a fake bean ship.</li><li><b>Same property in many files:</b> hard to know the winning value; use <code>/actuator/env</code> to check.</li><li><b>Secrets in profile files:</b> they still end up in the repository.</li><li><b>Missing prod profile:</b> the app starts with dev defaults.</li></ul>`,
            r`// Wrong: hidden branching
if (env.acceptsProfiles(Profiles.of("prod"))) {
    sms.send(msg);
} else {
    System.out.println(msg);
}

// Right: one interface, two beans selected by @Profile (see Notifier)
notifier.send(msg);

// Fail fast when no profile is set
@Component
class RequireProfile {
    RequireProfile(Environment env) {
        if (env.getActiveProfiles().length == 0)
            throw new IllegalStateException("No spring profile is active");
    }
}

// OUTPUT:
// Startup without profile -> IllegalStateException: No spring profile is active`],
        [`<p>Profiles have almost no runtime cost, but they change what is loaded:</p><ul><li><b>Startup:</b> inactive profile beans are never created, so heavy dev only beans do not slow production.</li><li><b>Classpath scanning:</b> profile conditions are checked per candidate, which is cheap.</li><li><b>Tests:</b> a distinct profile creates a distinct context cache key, so many profile combinations mean many contexts and slower test runs.</li></ul>`,
            r`// Reuse one cached context for several test classes
@SpringBootTest
@ActiveProfiles("test")
abstract class BaseIT { }

class OrderIT extends BaseIT { /* tests */ }
class ProductIT extends BaseIT { /* tests */ }

// OUTPUT:
// Spring test context cache: 1 context created, reused by both classes`],
        [`<p>Scenario: developers use H2 and a console mailer, CI uses Testcontainers, production uses PostgreSQL and SMTP.</p><ul><li><b>dev:</b> H2, console notifier, DEBUG logs.</li><li><b>test:</b> Testcontainers database, fake clock.</li><li><b>prod:</b> PostgreSQL, real mail, JSON logs, actuator limited.</li></ul>`,
            r`# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:shop
logging:
  level:
    com.shop: DEBUG

# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://db.internal:5432/shop
logging:
  level:
    com.shop: INFO

# OUTPUT:
# dev  -> H2 in memory, verbose logs
# prod -> PostgreSQL, quiet logs`]
    ),
    'mvc-security-configuration': dv(
        [`<p>Spring Security plugs into the servlet container as one filter that delegates to a chain.</p><ul><li><b>DelegatingFilterProxy / FilterChainProxy:</b> the entry filter picks the first <code>SecurityFilterChain</code> whose matcher fits the request.</li><li><b>Filters in order:</b> security context loading, CSRF, logout, authentication (basic, form, bearer token), exception translation, then <code>AuthorizationFilter</code>.</li><li><b>Authentication:</b> an <code>AuthenticationManager</code> asks <code>AuthenticationProvider</code>s, which use <code>UserDetailsService</code> and <code>PasswordEncoder</code>.</li><li><b>Result:</b> a successful login stores an <code>Authentication</code> in the <code>SecurityContext</code> of the thread.</li><li><b>Failures:</b> not logged in gives 401 through the <code>AuthenticationEntryPoint</code>; logged in without rights gives 403 through <code>AccessDeniedHandler</code>.</li></ul>`,
            r`@GetMapping("/me")
public Map<String, Object> me(Authentication auth) {
    return Map.of("user", auth.getName(),
                  "roles", auth.getAuthorities().stream()
                               .map(GrantedAuthority::getAuthority).toList());
}

// OUTPUT:
// GET /me (basic auth abaji:secret)
// {"user":"abaji","roles":["ROLE_USER"]}`],
        [`<p>Common configuration variants:</p><ul><li><b>Form login:</b> <code>formLogin(Customizer.withDefaults())</code> for server rendered pages.</li><li><b>HTTP basic:</b> simple for internal tools and tests.</li><li><b>JWT resource server:</b> <code>oauth2ResourceServer(o -&gt; o.jwt(Customizer.withDefaults()))</code>.</li><li><b>Stateless:</b> <code>sessionManagement(s -&gt; s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))</code>.</li><li><b>CORS and CSRF:</b> <code>cors(...)</code> and <code>csrf(c -&gt; c.disable())</code> for token APIs.</li><li><b>Several chains:</b> use <code>@Order</code> and <code>securityMatcher</code> to give /api and web pages different rules.</li></ul>`,
            r`@Bean
@Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));
    return http.build();
}

@Bean
@Order(2)
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a
            .requestMatchers("/css/**", "/login").permitAll()
            .anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());
    return http.build();
}

// OUTPUT:
// /api/** -> bearer token required (401 without it)
// /orders -> redirect to /login`],
        [`<p>Mistakes that cause real vulnerabilities:</p><ul><li><b>Rule order:</b> <code>anyRequest().permitAll()</code> placed first makes later rules useless.</li><li><b>Disabled CSRF for browser apps:</b> only disable it for stateless APIs.</li><li><b>Plain text or weak hashes:</b> use BCrypt, Argon2 or the delegating encoder.</li><li><b>Trusting hidden fields or client roles:</b> check authorization on the server.</li><li><b>Open actuator:</b> permit only <code>health</code>.</li><li><b>CORS wildcard with credentials:</b> allows any site to call the API as the user.</li><li><b>Old adapter:</b> <code>WebSecurityConfigurerAdapter</code> and <code>antMatchers</code> are gone in Security 6.</li></ul>`,
            r`// Wrong: first match wins
http.authorizeHttpRequests(a -> a
        .anyRequest().permitAll()
        .requestMatchers("/admin/**").hasRole("ADMIN"));   // never reached

// Right: specific first, then fallback
http.authorizeHttpRequests(a -> a
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .requestMatchers("/actuator/health").permitAll()
        .anyRequest().authenticated());

// OUTPUT:
// Wrong: GET /admin/users -> 200 for anyone
// Right: GET /admin/users -> 401 anonymous, 403 for USER`],
        [`<p>Security tuning and cost:</p><ul><li><b>BCrypt strength:</b> each login hashes on purpose; strength 10 to 12 gives about 100 to 300 ms, so cache tokens and not passwords.</li><li><b>Stateless JWT:</b> avoids session lookups but needs short expiry and key rotation.</li><li><b>Filter cost:</b> keep custom filters light; skip static paths with matchers.</li><li><b>Method security:</b> SpEL checks are evaluated on every call, so keep expressions simple.</li><li><b>Headers:</b> the defaults add HSTS, X-Content-Type-Options and cache control, which are cheap and useful.</li></ul>`,
            r`@Bean
PasswordEncoder encoder() {
    return new BCryptPasswordEncoder(12);
}

long t = System.nanoTime();
String hash = encoder().encode("secret");
System.out.println("hash ms=" + (System.nanoTime() - t) / 1_000_000);
System.out.println(hash.substring(0, 7));

// OUTPUT: (varies)
// hash ms=250
// $2a$12$`],
        [`<p>Scenario: a shop has a public catalog, customer orders and an admin area, served by a mobile app and a web page.</p><ul><li><b>Catalog:</b> GET open to all.</li><li><b>Orders:</b> need a login and users may only see their own orders.</li><li><b>Admin:</b> role ADMIN; actuator on a private port.</li></ul>`,
            r`http.authorizeHttpRequests(a -> a
        .requestMatchers(HttpMethod.GET, "/catalog/**").permitAll()
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated());

@GetMapping("/orders/{id}")
@PostAuthorize("returnObject.owner == authentication.name")
public Order get(@PathVariable Long id) { return orders.find(id); }

// OUTPUT:
// GET /catalog/phones     -> 200 (anonymous)
// GET /orders/5 as baji (owner abaji) -> 403
// GET /admin/stats as USER -> 403`]
    ),
    'mvc-centralized-exception-handling': dv(
        [`<p>Exception resolution happens inside the <code>DispatcherServlet</code>.</p><ul><li><b>Catch:</b> if the handler throws, <code>processHandlerException</code> asks each <code>HandlerExceptionResolver</code> in order.</li><li><b>Resolvers:</b> <code>ExceptionHandlerExceptionResolver</code> (for <code>@ExceptionHandler</code>), <code>ResponseStatusExceptionResolver</code>, then <code>DefaultHandlerExceptionResolver</code> for Spring MVC errors.</li><li><b>Lookup order:</b> first handlers in the same controller, then <code>@ControllerAdvice</code> beans by <code>@Order</code>; the closest exception type wins.</li><li><b>Unresolved:</b> the exception goes to the container, which forwards to <code>/error</code> handled by <code>BasicErrorController</code>.</li></ul>`,
            r`@RestControllerAdvice
public class ApiAdvice {
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<String> bad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("bad: " + e.getMessage());
    }
    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<String> any(RuntimeException e) {
        return ResponseEntity.status(500).body("runtime: " + e.getMessage());
    }
}

// OUTPUT:
// throw new IllegalArgumentException("x") -> 400 bad: x      (closest type wins)
// throw new IllegalStateException("y")    -> 500 runtime: y`],
        [`<p>Ways to map an exception to a response:</p><ul><li><b>@ExceptionHandler</b> in a controller: local to that controller.</li><li><b>@RestControllerAdvice:</b> global; can limit with <code>basePackages</code> or <code>annotations</code>.</li><li><b>@ResponseStatus</b> on the exception class: fixed status and reason.</li><li><b>ResponseStatusException:</b> thrown inline with a status and message.</li><li><b>ResponseEntityExceptionHandler:</b> base class that already handles standard Spring MVC exceptions; override its methods.</li><li><b>ProblemDetail:</b> RFC 7807 bodies, enabled globally with <code>spring.mvc.problemdetails.enabled=true</code>.</li></ul>`,
            r`@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) { super("Product " + id + " not found"); }
}

@RestControllerAdvice
public class Handler extends ResponseEntityExceptionHandler {
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        return ResponseEntity.badRequest().body(Map.of("error", "Malformed JSON"));
    }
}

// OUTPUT:
// POST /products with body {bad -> 400 {"error":"Malformed JSON"}
// GET /products/99 -> 404`],
        [`<p>Frequent mistakes:</p><ul><li><b>Catching and swallowing:</b> returning 200 with an error message hides failures from clients and monitors.</li><li><b>Exposing internals:</b> returning <code>e.toString()</code> or stack traces.</li><li><b>Wrong status:</b> 500 for client mistakes, 200 for errors.</li><li><b>No logging:</b> handler returns 500 but never logs the cause.</li><li><b>Handler in the wrong scope:</b> advice does not catch exceptions thrown in filters (before the DispatcherServlet).</li><li><b>Duplicate formats:</b> some endpoints return Spring default JSON, others a custom one.</li></ul>`,
            r`// Wrong
@ExceptionHandler(Exception.class)
public ResponseEntity<String> all(Exception e) {
    return ResponseEntity.ok(e.toString());      // 200 and leaks class names
}

// Right
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiError> all(Exception e) {
    String id = UUID.randomUUID().toString();
    log.error("error id={}", id, e);
    return ResponseEntity.internalServerError()
            .body(new ApiError("INTERNAL", "Contact support, id " + id));
}

// OUTPUT:
// Right: 500 {"code":"INTERNAL","message":"Contact support, id 7c1e..."} (varies)`],
        [`<p>Handlers add little cost, but design choices matter:</p><ul><li><b>Exceptions as control flow:</b> creating a stack trace is slow; override <code>fillInStackTrace</code> or use a constructor with <code>writableStackTrace=false</code> for frequent business exceptions.</li><li><b>Log once:</b> log at the handler, not at every layer.</li><li><b>Log level:</b> client errors at WARN or DEBUG, server errors at ERROR, so alerts stay meaningful.</li><li><b>Count errors:</b> Micrometer records <code>http.server.requests</code> with the outcome tag automatically.</li></ul>`,
            r`public class BusinessException extends RuntimeException {
    private final String code;
    public BusinessException(String code, String message) {
        super(message, null, false, false);     // no stack trace: cheap to create
        this.code = code;
    }
    public String getCode() { return code; }
}

// OUTPUT:
// Throwing 1,000,000 BusinessException objects is several times faster than
// ordinary exceptions with stack traces (varies)`],
        [`<p>Scenario: a mobile client needs one predictable error contract.</p><ul><li><b>Contract:</b> every error returns <code>code</code>, <code>message</code> and optional <code>fields</code>.</li><li><b>Mapping:</b> validation 400, not found 404, conflict 409, unexpected 500 with an incident id.</li><li><b>Tests:</b> a MockMvc test per mapping keeps the contract stable.</li></ul>`,
            r`@Test
void validationReturnsFieldErrors() throws Exception {
    mvc.perform(post("/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"\",\"price\":-1}"))
       .andExpect(status().isBadRequest())
       .andExpect(jsonPath("$.name").exists())
       .andExpect(jsonPath("$.price").exists());
}

// OUTPUT:
// HTTP 400 {"name":"must not be blank","price":"must be greater than 0"}`]
    ),
    'mvc-api-logging': dv(
        [`<p>Logging sits at two layers around the DispatcherServlet.</p><ul><li><b>Filter layer:</b> a <code>OncePerRequestFilter</code> runs before and after the whole chain; it can wrap the request and response.</li><li><b>Interceptor layer:</b> <code>preHandle</code>, <code>postHandle</code> and <code>afterCompletion</code> know the handler method but run only for requests mapped to MVC handlers.</li><li><b>Body wrappers:</b> <code>ContentCachingRequestWrapper</code> and <code>ContentCachingResponseWrapper</code> copy the bytes as they are read or written; the response must be copied back with <code>copyBodyToResponse()</code>.</li><li><b>MDC:</b> values are stored in a thread local, so they must be cleared in a finally block because pool threads are reused.</li></ul>`,
            r`@Component
public class BodyLogFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        var rq = new ContentCachingRequestWrapper(req);
        var rs = new ContentCachingResponseWrapper(res);
        try {
            chain.doFilter(rq, rs);
        } finally {
            String body = new String(rq.getContentAsByteArray(), StandardCharsets.UTF_8);
            logger.info("req body=" + body + " status=" + rs.getStatus());
            rs.copyBodyToResponse();          // do not forget, or the client gets nothing
        }
    }
}

// OUTPUT:
// INFO req body={"qty":2} status=201`],
        [`<p>Implementation options:</p><ul><li><b>CommonsRequestLoggingFilter:</b> quick, logs the request only.</li><li><b>Custom filter:</b> full control over request and response.</li><li><b>HandlerInterceptor:</b> add via <code>WebMvcConfigurer.addInterceptors</code>, with path patterns.</li><li><b>AOP aspect:</b> <code>@Around</code> advice on controllers to log arguments and timing.</li><li><b>Client side:</b> <code>ClientHttpRequestInterceptor</code> for <code>RestTemplate</code> or an exchange filter for <code>WebClient</code>.</li><li><b>Structured logging:</b> JSON logs (Logstash encoder; Boot 3.4 also has built-in structured logging).</li></ul>`,
            r`@Component
public class TimingInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
            Object handler) {
        req.setAttribute("start", System.nanoTime());
        return true;
    }
    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
            Object handler, Exception ex) {
        long ms = (System.nanoTime() - (long) req.getAttribute("start")) / 1_000_000;
        System.out.println(req.getMethod() + " " + req.getRequestURI()
                + " " + res.getStatus() + " " + ms + "ms");
    }
}

@Configuration
class WebConfig implements WebMvcConfigurer {
    @Autowired TimingInterceptor timing;
    public void addInterceptors(InterceptorRegistry r) {
        r.addInterceptor(timing).excludePathPatterns("/actuator/**");
    }
}

// OUTPUT: (varies)
// GET /products/5 200 8ms`],
        [`<p>Typical mistakes:</p><ul><li><b>Reading the body twice:</b> reading <code>getInputStream()</code> in the filter leaves nothing for the controller (400 error).</li><li><b>Forgetting copyBodyToResponse:</b> the response comes back empty.</li><li><b>Logging secrets:</b> passwords, bearer tokens and card data.</li><li><b>MDC leak:</b> not clearing it mixes ids between requests.</li><li><b>Logging huge or binary bodies:</b> file uploads fill the logs.</li><li><b>Logging in the controller:</b> duplicated and inconsistent.</li></ul>`,
            r`private static final Set<String> SENSITIVE = Set.of("password", "token", "cardNumber");

static String mask(String json) {
    String out = json;
    for (String key : SENSITIVE) {
        out = out.replaceAll("(\"" + key + "\"\\s*:\\s*\")[^\"]*(\")", "$1****$2");
    }
    return out;
}

// OUTPUT:
// mask({"user":"abaji","password":"abc123"}) -> {"user":"abaji","password":"****"}`],
        [`<p>Cost and tuning:</p><ul><li><b>Sampling:</b> log bodies only for errors or a small percentage of requests.</li><li><b>Async appenders:</b> Logback <code>AsyncAppender</code> moves disk I/O off the request thread.</li><li><b>Size limits:</b> cap payload length and skip content types such as multipart and octet-stream.</li><li><b>Skip noise:</b> exclude health checks and static resources.</li><li><b>Parameterized messages:</b> use <code>log.info(&quot;a {}&quot;, x)</code> so strings are not built when the level is off.</li></ul>`,
            r`<!-- logback-spring.xml (excerpt) -->
<appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>2048</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <neverBlock>true</neverBlock>
    <appender-ref ref="FILE"/>
</appender>

// OUTPUT:
// Request threads write to an in-memory queue; a background thread writes the file.
// neverBlock=true drops log lines instead of slowing requests when the queue is full.`],
        [`<p>Scenario: support asks why order 8841 failed for a customer yesterday.</p><ul><li><b>Request id:</b> returned in the <code>X-Request-Id</code> response header and printed on every line.</li><li><b>Search:</b> in the log platform, filter by that id to see the whole request including errors.</li><li><b>Safe:</b> masked bodies make the search possible without exposing secrets.</li></ul>`,
            r`@Override
protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
        FilterChain chain) throws ServletException, IOException {
    String id = Optional.ofNullable(req.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());
    MDC.put("requestId", id);
    res.setHeader("X-Request-Id", id);
    try { chain.doFilter(req, res); } finally { MDC.remove("requestId"); }
}

// OUTPUT:
// Response header: X-Request-Id: 3f9a1c2e-...
// Log search requestId=3f9a1c2e shows: validation failed for field qty`]
    ),
    'mvc-audit-logging': dv(
        [`<p>Auditing hooks into the persistence layer or the service layer.</p><ul><li><b>JPA auditing:</b> <code>AuditingEntityListener</code> is a JPA entity listener; on <code>@PrePersist</code> and <code>@PreUpdate</code> it calls <code>AuditingHandler</code>, which asks <code>AuditorAware</code> and the date provider for values.</li><li><b>Envers:</b> a Hibernate integrator listens to flush events and writes a revision row (<code>revinfo</code>) plus a copy of each changed entity in its <code>_aud</code> table, inside the same transaction.</li><li><b>Event based:</b> services publish events; listeners persist audit records. With <code>@TransactionalEventListener</code> the phase decides if it runs before commit.</li><li><b>AOP:</b> an aspect around annotated methods records the call, arguments and result.</li></ul>`,
            r`@Aspect
@Component
public class AuditAspect {
    @Around("@annotation(audited)")
    public Object around(ProceedingJoinPoint pjp, Audited audited) throws Throwable {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        Object result = pjp.proceed();
        System.out.println("AUDIT user=" + user + " action=" + audited.value()
                + " args=" + Arrays.toString(pjp.getArgs()));
        return result;
    }
}

@Retention(RetentionPolicy.RUNTIME)
@interface Audited { String value(); }

// OUTPUT:
// AUDIT user=abaji action=DELETE_PRODUCT args=[12]`],
        [`<p>Design choices for an audit trail:</p><ul><li><b>Row level fields:</b> four auditing columns on every entity (who and when created or changed).</li><li><b>Full history:</b> Envers revisions, queried with <code>AuditReader</code>.</li><li><b>Action log table:</b> one row per business action with actor, action, entity, id, and a JSON diff.</li><li><b>External sink:</b> send events to Kafka or a log platform for long term, write once storage.</li><li><b>Soft delete plus audit:</b> never lose who deleted a row.</li></ul>`,
            r`@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id @GeneratedValue Long id;
    String actor;
    String action;
    String entityType;
    Long entityId;
    @Column(columnDefinition = "text") String detailsJson;
    Instant at = Instant.now();
    String ip;
}

// OUTPUT:
// audit_log row: abaji | UPDATE_PRICE | Product | 12 | {"old":100,"new":120} | 2026-10-09T10:15:00Z`],
        [`<p>Mistakes to avoid:</p><ul><li><b>@CreatedDate stays null:</b> missing <code>@EnableJpaAuditing</code> or the listener annotation.</li><li><b>Auditor is null:</b> background jobs have no user; return a system user such as <code>system</code>.</li><li><b>Audit outside the transaction:</b> a rollback leaves a row that claims a change happened.</li><li><b>Auditing everything:</b> reads and noise bury the important events.</li><li><b>Editable audit rows:</b> if the app can update them, they are not evidence.</li><li><b>Personal data:</b> storing full old and new values may break privacy rules.</li></ul>`,
            r`@Bean
AuditorAware<String> auditor() {
    return () -> {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !a.isAuthenticated() || a instanceof AnonymousAuthenticationToken)
            return Optional.of("system");          // jobs and startup tasks
        return Optional.of(a.getName());
    };
}

// OUTPUT:
// Scheduled job writes created_by = 'system' instead of NULL`],
        [`<p>Audit tables grow forever, so plan for it:</p><ul><li><b>Indexes:</b> on entity type and id, actor, and time for typical searches.</li><li><b>Partitioning and archiving:</b> partition by month and move old data to cheap storage.</li><li><b>Async writing:</b> for non critical audit, batch rows through a queue (accepting small loss risk).</li><li><b>Envers cost:</b> every change writes one more row; do not audit hot, high churn entities without need.</li><li><b>Small payloads:</b> store changed fields only.</li></ul>`,
            r`CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id, at DESC);
CREATE INDEX idx_audit_actor ON audit_log (actor, at DESC);

-- OUTPUT:
-- SELECT * FROM audit_log WHERE entity_type='Product' AND entity_id=12
-- uses idx_audit_entity (index scan, a few ms)`],
        [`<p>Scenario: a finance team must prove who changed a price and when.</p><ul><li><b>Requirement:</b> every price change records the user, old and new value and the reason.</li><li><b>Implementation:</b> the service updates the price and publishes an event inside one transaction.</li><li><b>Review:</b> an admin screen queries the audit table by product.</li></ul>`,
            r`@Transactional
public void changePrice(Long id, BigDecimal newPrice, String reason, String user) {
    Product p = repo.findById(id).orElseThrow();
    BigDecimal old = p.getPrice();
    p.setPrice(newPrice);
    auditRepo.save(new AuditLog(user, "UPDATE_PRICE", "Product", id,
            "{\"old\":" + old + ",\"new\":" + newPrice + ",\"reason\":\"" + reason + "\"}"));
}

// OUTPUT:
// Both rows commit together, or neither does:
// product 12 price 100 -> 120 and audit row UPDATE_PRICE`]
    ),
    'mvc-monitoring': dv(
        [`<p>Actuator and Micrometer are auto-configured from the classpath.</p><ul><li><b>Actuator endpoints:</b> each is an <code>@Endpoint</code> bean exposed over HTTP by Spring MVC (or JMX) when included and enabled.</li><li><b>MeterRegistry:</b> one composite registry holds all meters; a registry per backend (Prometheus, Datadog) is added when its dependency exists.</li><li><b>Binders:</b> built-in <code>MeterBinder</code>s register JVM, system, Tomcat, Hikari and logback metrics.</li><li><b>HTTP timing:</b> an observation filter times every request and tags it with method, uri template, status and outcome.</li><li><b>Pull model:</b> Prometheus scrapes <code>/actuator/prometheus</code> on an interval.</li></ul>`,
            r`@RestController
class MeterPeek {
    private final MeterRegistry registry;
    MeterPeek(MeterRegistry registry) { this.registry = registry; }

    @GetMapping("/peek")
    List<String> names() {
        return registry.getMeters().stream()
                .map(m -> m.getId().getName()).distinct().sorted().limit(5).toList();
    }
}

// OUTPUT: (varies)
// ["application.ready.time","disk.free","executor.active","hikaricp.connections",
//  "http.server.requests"]`],
        [`<p>Monitoring building blocks and options:</p><ul><li><b>Meter types:</b> Counter, Gauge, Timer, DistributionSummary, LongTaskTimer.</li><li><b>Tags:</b> common tags such as <code>management.metrics.tags.application=shop</code>.</li><li><b>Backends:</b> Prometheus plus Grafana, Datadog, New Relic, CloudWatch (one dependency each).</li><li><b>Annotations:</b> <code>@Timed</code> and <code>@Counted</code> need their aspect beans registered.</li><li><b>Info and build:</b> <code>/actuator/info</code> with build and git details.</li><li><b>Logger levels at runtime:</b> POST to <code>/actuator/loggers/{name}</code>.</li></ul>`,
            r`@Bean
MeterBinder queueGauge(OrderQueue queue) {
    return registry -> Gauge.builder("shop.queue.size", queue, OrderQueue::size)
            .description("Pending orders").register(registry);
}

# application.properties
# management.metrics.tags.application=shop
# management.endpoint.loggers.enabled=true

// OUTPUT:
// shop_queue_size{application="shop"} 17.0`],
        [`<p>Common mistakes:</p><ul><li><b>Actuator exposed publicly:</b> <code>env</code>, <code>heapdump</code> and <code>beans</code> leak secrets and internals.</li><li><b>High cardinality tags:</b> user ids, order ids or raw query strings.</li><li><b>Gauge garbage collected:</b> Micrometer holds gauge targets weakly; keep a reference to the object.</li><li><b>Only averages:</b> no histograms or percentiles.</li><li><b>No alerts:</b> dashboards nobody watches.</li><li><b>Metrics in the hot path with locks:</b> using synchronized counters.</li></ul>`,
            r`// Wrong: unbounded tag values
registry.counter("orders", "customer", customerId).increment();

// Right: bounded tag values
registry.counter("orders", "channel", channel).increment();   // web, mobile, store

// Wrong: gauge target can be collected
Gauge.builder("size", new ArrayList<String>(), List::size).register(registry);

// Right: hold the object in a field
private final List<String> pending = new CopyOnWriteArrayList<>();
Gauge.builder("pending.size", pending, List::size).register(registry);

// OUTPUT:
// Wrong: millions of time series; the gauge later shows NaN
// Right: few series and a stable gauge`],
        [`<p>Tuning monitoring itself:</p><ul><li><b>Scrape interval:</b> 15 to 60 seconds is usual.</li><li><b>Meter filters:</b> drop unused meters with <code>management.metrics.enable.jvm=false</code>-style properties or a <code>MeterFilter</code>.</li><li><b>Percentile histograms</b> only for endpoints you care about.</li><li><b>Separate port:</b> <code>management.server.port</code> keeps scraping off the public port.</li><li><b>Overhead:</b> counters and timers cost nanoseconds; the real cost is series count.</li></ul>`,
            r`@Bean
MeterFilter denyNoise() {
    return MeterFilter.deny(id -> id.getName().startsWith("jvm.buffer"));
}

@Bean
MeterFilter limitUriTags() {
    return MeterFilter.maximumAllowableTags("http.server.requests", "uri", 100,
            MeterFilter.deny());
}

// OUTPUT:
// jvm.buffer.* meters are not registered; at most 100 distinct uri tag values`],
        [`<p>Scenario: Monday morning traffic doubles and checkout slows down.</p><ul><li><b>Dashboard:</b> p99 latency, error rate, Hikari pending connections and Tomcat busy threads.</li><li><b>Finding:</b> pending connections rise while the database CPU is fine, so the pool is too small.</li><li><b>Alert:</b> p99 above 1 s for 5 minutes pages the on-call engineer.</li></ul>`,
            r`# Prometheus alert rule
- alert: HighCheckoutLatency
  expr: histogram_quantile(0.99,
          sum(rate(http_server_requests_seconds_bucket{uri="/checkout"}[5m])) by (le)) > 1
  for: 5m
  labels: { severity: page }

# OUTPUT:
# Alert fires when the 99th percentile latency of /checkout stays above 1 second`]
    ),
    'mvc-health-checks': dv(
        [`<p>The health endpoint aggregates many small checks.</p><ul><li><b>HealthContributor beans:</b> each <code>HealthIndicator</code> bean (or reactive one) is collected by name from the bean name minus the suffix.</li><li><b>Aggregation:</b> a <code>StatusAggregator</code> picks the worst status in the order DOWN, OUT_OF_SERVICE, UP, UNKNOWN.</li><li><b>HTTP mapping:</b> DOWN and OUT_OF_SERVICE map to 503, others to 200.</li><li><b>Availability state:</b> <code>ApplicationAvailability</code> tracks the liveness and readiness states; Spring changes readiness to REFUSING_TRAFFIC during shutdown.</li><li><b>Auto-configured indicators:</b> <code>DataSourceHealthIndicator</code> runs a validation query, <code>DiskSpaceHealthIndicator</code> checks free space.</li></ul>`,
            r`@RestController
class StateController {
    private final ApplicationAvailability availability;
    private final ApplicationEventPublisher events;
    // constructor omitted

    @PostMapping("/drain")
    void drain() {
        AvailabilityChangeEvent.publish(events, this, ReadinessState.REFUSING_TRAFFIC);
    }
    @GetMapping("/state")
    String state() { return availability.getReadinessState().name(); }
}

// OUTPUT:
// GET /state -> ACCEPTING_TRAFFIC
// POST /drain
// GET /actuator/health/readiness -> 503 {"status":"OUT_OF_SERVICE"}`],
        [`<p>Configuration options:</p><ul><li><b>Visibility:</b> <code>show-details</code> and <code>show-components</code> take <code>never</code>, <code>when-authorized</code> or <code>always</code>.</li><li><b>Groups:</b> <code>management.endpoint.health.group.custom.include=db,diskSpace</code>.</li><li><b>Disable one:</b> <code>management.health.mail.enabled=false</code>.</li><li><b>Status mapping:</b> <code>management.endpoint.health.status.http-mapping.DOWN=503</code>.</li><li><b>Composite:</b> <code>CompositeHealthContributor</code> groups related checks.</li><li><b>Reactive apps:</b> <code>ReactiveHealthIndicator</code>.</li></ul>`,
            r`# application.properties
management.endpoint.health.show-details=when-authorized
management.endpoint.health.roles=ACTUATOR
management.health.diskspace.threshold=500MB
management.health.mail.enabled=false
management.endpoint.health.group.ready.include=readinessState,db,paymentGateway
management.endpoint.health.group.ready.show-details=never

# OUTPUT:
# GET /actuator/health/ready -> {"status":"UP"}
# GET /actuator/health (anonymous) -> {"status":"UP"}
(no component details)`],
        [`<p>Mistakes with health checks:</p><ul><li><b>Heavy checks:</b> a full query or remote call on each probe overloads dependencies.</li><li><b>Liveness depends on external services:</b> causes restart storms.</li><li><b>Details exposed to the public:</b> hostnames and error messages.</li><li><b>No timeout:</b> a hanging indicator makes the probe time out and the pod restart.</li><li><b>Always UP:</b> a check that catches every exception and returns UP.</li><li><b>Probes too aggressive:</b> a short period and threshold kill slow-starting apps; use a startup probe.</li></ul>`,
            r`// Wrong: a hanging call blocks the probe
public Health health() {
    client.ping();                       // no timeout
    return Health.up().build();
}

// Right: bounded and honest
public Health health() {
    try {
        long ms = CompletableFuture.supplyAsync(client::ping)
                .get(1, TimeUnit.SECONDS);
        return Health.up().withDetail("latencyMs", ms).build();
    } catch (Exception e) {
        return Health.down().withDetail("error", e.getClass().getSimpleName()).build();
    }
}

// OUTPUT:
// Gateway hangs -> after 1 s: {"status":"DOWN","details":{"error":"TimeoutException"}}`],
        [`<p>Tuning health checks:</p><ul><li><b>Cache results:</b> health endpoints cache results for a short time (<code>management.endpoint.health.cache.time-to-live</code>) so repeated probes are cheap.</li><li><b>Cheap database check:</b> the default validation query is a lightweight statement.</li><li><b>Probe settings:</b> a startup probe covers slow boots; liveness period of 10 s; readiness failure threshold of 3.</li><li><b>Graceful shutdown:</b> readiness turns off first so the load balancer stops sending traffic before the app stops.</li></ul>`,
            r`# Kubernetes probes
startupProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
  failureThreshold: 30
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 8080 }
  periodSeconds: 5
  failureThreshold: 3

# OUTPUT:
# Slow start up to 150 s is tolerated;
failing readiness removes the pod from the service.`],
        [`<p>Scenario: the payment provider has an outage.</p><ul><li><b>Wanted behavior:</b> the app stays alive, keeps serving the catalog, and refuses checkout traffic gracefully.</li><li><b>Design:</b> payment health is reported in a separate group and not in liveness, and the checkout code uses a circuit breaker.</li><li><b>Alert:</b> a dashboard and alert on the group status, with no pod restarts.</li></ul>`,
            r`# application.properties
management.endpoint.health.group.liveness.include=livenessState
management.endpoint.health.group.readiness.include=readinessState,db
management.endpoint.health.group.payments.include=paymentGateway

# OUTPUT: (provider down)
# /actuator/health/liveness  -> UP
# /actuator/health/readiness -> UP
# /actuator/health/payments  -> DOWN (503): alert fires, nothing restarts`]
    ),
    'mvc-performance-monitoring-production': dv(
        [`<p>Production performance data comes from several layers.</p><ul><li><b>Metrics:</b> Micrometer timers record count, total time and max, and histograms add buckets for percentiles.</li><li><b>Observation API:</b> Spring 6 wraps requests in an <code>Observation</code> that produces both a metric and a trace span from the same instrumentation.</li><li><b>Tracing:</b> a trace id is created at the edge, passed in headers (W3C <code>traceparent</code>) and put in the MDC.</li><li><b>JVM level:</b> GC logs, JFR events and thread dumps explain pauses and contention.</li></ul>`,
            r`@Service
public class CatalogService {
    private final ObservationRegistry registry;
    CatalogService(ObservationRegistry registry) { this.registry = registry; }

    public List<Product> search(String q) {
        return Observation.createNotStarted("catalog.search", registry)
                .lowCardinalityKeyValue("type", "text")
                .observe(() -> doSearch(q));
    }
}

// OUTPUT:
// Metric: catalog_search_seconds_count{type="text"} 15
// Trace: span "catalog.search" under the request span (when tracing is enabled)`],
        [`<p>Practical tools and settings:</p><ul><li><b>Percentiles:</b> client side (<code>percentiles</code>) or histogram buckets for server side calculation.</li><li><b>SLO buckets:</b> <code>slo.http.server.requests=100ms,500ms,1s</code> to count requests under each limit.</li><li><b>Tracing backends:</b> Zipkin, Tempo, Jaeger through OpenTelemetry or Brave bridges.</li><li><b>JFR:</b> <code>jcmd &lt;pid&gt; JFR.start duration=60s filename=rec.jfr</code>.</li><li><b>Thread dump:</b> <code>jcmd &lt;pid&gt; Thread.print</code> or <code>/actuator/threaddump</code>.</li><li><b>Slow query log:</b> database side and <code>spring.jpa.properties.hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS</code>.</li></ul>`,
            r`# application.properties
management.metrics.distribution.slo.http.server.requests=100ms,500ms,1s
management.metrics.distribution.percentiles.http.server.requests=0.5,0.95,0.99
management.tracing.sampling.probability=0.05
management.otlp.tracing.endpoint=http://collector:4318/v1/traces

# OUTPUT:
# http_server_requests_seconds_bucket{le="0.1"}
4800
# http_server_requests_seconds_bucket{le="0.5"}
5300
# http_server_requests_seconds_bucket{le="+Inf"}
5400`],
        [`<p>Mistakes when monitoring performance:</p><ul><li><b>Averages only:</b> p99 may be 50 times the average.</li><li><b>Measuring in the wrong place:</b> client time includes network and queueing, server time does not.</li><li><b>100 percent trace sampling</b> under heavy load adds cost; sample 1 to 10 percent.</li><li><b>Guessing:</b> tuning code without a profile.</li><li><b>Tests on tiny data:</b> production data volumes expose N+1 queries.</li><li><b>Ignoring saturation:</b> latency rises when the pool or queue is full, not only when the code is slow.</li></ul>`,
            r`// Typical hidden N+1: one query for orders, then one per order for items
List<Order> orders = orderRepo.findAll();
for (Order o : orders) {
    total += o.getItems().size();        // lazy load per order
}

// Fix: fetch in one query
@Query("select distinct o from Order o join fetch o.items")
List<Order> findAllWithItems();

// OUTPUT:
// Before: 101 SQL statements for 100 orders (visible as many db spans in a trace)
// After: 1 SQL statement`],
        [`<p>Where the time usually goes, and what to do:</p><ul><li><b>Database:</b> missing indexes, N+1, big result sets; fix first because it dominates.</li><li><b>Remote calls:</b> add timeouts, caching and parallel calls.</li><li><b>Serialization:</b> large JSON; use DTOs, pagination, compression.</li><li><b>GC:</b> frequent pauses mean too many allocations or a wrong heap size.</li><li><b>Locks:</b> blocked threads in a thread dump.</li><li><b>Cold start:</b> warm up caches and JIT before accepting traffic (readiness).</li></ul>`,
            r`// Add a timeout and cache around a slow remote call
@Cacheable(cacheNames = "rates", key = "#currency")
public Rate rate(String currency) {
    return restClient.get().uri("/rates/{c}", currency)
            .retrieve().body(Rate.class);
}

# application.properties
spring.cache.caffeine.spec=maximumSize=500,expireAfterWrite=5m

// OUTPUT:
// First call 180 ms (remote); next calls within 5 minutes < 1 ms (cache hit)`],
        [`<p>Scenario: users report that the order page is sometimes slow.</p><ul><li><b>Step 1:</b> the p99 graph for <code>/orders</code> shows spikes of 3 s while the average is 80 ms.</li><li><b>Step 2:</b> sampled traces of slow requests show a 2.8 s span in the shipping client.</li><li><b>Step 3:</b> add a 500 ms timeout, a cache for quotes and a circuit breaker; the p99 drops below 400 ms.</li></ul>`,
            r`RestClient client = RestClient.builder()
        .baseUrl("https://shipping.example.com")
        .requestFactory(factory(Duration.ofMillis(200), Duration.ofMillis(500)))
        .build();

// OUTPUT: (after the fix, varies)
// p50 70 ms, p95 180 ms, p99 390 ms; shipping span capped at 500 ms`]
    )
};
