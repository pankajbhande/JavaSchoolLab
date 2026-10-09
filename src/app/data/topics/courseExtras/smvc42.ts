// Spring extras, batch smvc42 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc42Extras: Record<string, Extra> = {
    'mvc-rate-limiting': x(
        ['<b>Rate limiting</b> caps how many requests a client may send in a time window, to protect the service from abuse and overload.',
            '<b>HTTP 429</b> (Too Many Requests) is the standard rejection status, usually with a <code>Retry-After</code> header.',
            '<b>Client key</b>: limits are counted per API key, user or IP address, so one noisy client cannot starve the others.'],
        ['<b>Algorithms</b>: fixed window is simplest, sliding window is fairer, and token bucket allows short bursts while keeping a steady average.',
            '<b>Where to put it</b>: a <code>HandlerInterceptor</code> or servlet <code>Filter</code> in Spring MVC, or better at the gateway or Nginx in front of the app.',
            '<b>Libraries</b>: Bucket4j or Resilience4j <code>RateLimiter</code> give tested token-bucket logic instead of hand-written counters.'],
        ['<b>Distributed state</b>: with many instances a local counter allows N times the limit, so keep counters in Redis or enforce at the edge.',
            '<b>Headers</b>: expose <code>X-RateLimit-Remaining</code> and <code>Retry-After</code> so well-behaved clients can slow down.',
            '<b>Memory</b>: evict idle client buckets, or an attacker with many fake keys can exhaust the heap.'],
        [['F', 'What is rate limiting?', 'Restricting how many requests a client can make in a period. Excess requests are rejected, usually with HTTP 429.'],
            ['F', 'Which status code means too many requests?', '429 Too Many Requests, often with a Retry-After header.'],
            ['M', 'Where would you implement it in Spring MVC?', 'In a HandlerInterceptor or Filter that checks a per-client bucket before the controller runs.'],
            ['M', 'Token bucket versus fixed window?', 'Fixed window can allow a double burst at a window edge. Token bucket refills steadily and allows controlled bursts.'],
            ['S', 'Why is an in-memory limiter wrong behind a load balancer?', 'Each instance counts separately, so the real limit is multiplied. Use a shared store such as Redis or limit at the gateway.'],
            ['S', 'How do you test a rate limiter?', 'With MockMvc, send more requests than the limit and assert the last ones return 429 with Retry-After.']],
        [['A simple per-IP interceptor (fixed window).',
            r`@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private static final int LIMIT = 3;
    private final Map<String, AtomicInteger> hits = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res) {
        int n = hits.computeIfAbsent(req.getRemoteAddr(),
            k -> new AtomicInteger()).incrementAndGet();
        if (n > LIMIT) {
            res.setStatus(429);
            res.setHeader("Retry-After", "60");
            return false;                 // stop: controller is not called
        }
        return true;
    }
    // a scheduled task clears the map every minute
}

// OUTPUT:
// request 1..3 -> 200 OK
// request 4    -> 429 Too Many Requests, Retry-After: 60`],
            ['Register the interceptor for the API paths only.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final RateLimitInterceptor limiter;
    public WebConfig(RateLimitInterceptor limiter) { this.limiter = limiter; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(limiter).addPathPatterns("/api/**");
    }
}

// OUTPUT:
// GET /api/orders -> limited
// GET /health     -> not limited`]],
        [['MockMvc test for the 429.',
            r`@WebMvcTest(OrderController.class)
@Import({WebConfig.class, RateLimitInterceptor.class})
class RateLimitTest {
    @Autowired MockMvc mvc;

    @Test
    void fourthCallIsRejected() throws Exception {
        for (int i = 0; i < 3; i++)
            mvc.perform(get("/api/orders")).andExpect(status().isOk());
        mvc.perform(get("/api/orders"))
           .andExpect(status().isTooManyRequests())
           .andExpect(header().string("Retry-After", "60"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Token bucket with Bucket4j (sketch).',
                r`Bucket bucket = Bucket.builder()
    .addLimit(Bandwidth.simple(10, Duration.ofMinutes(1)))
    .build();

if (bucket.tryConsume(1)) {
    // handle request
} else {
    // return 429
}

// OUTPUT:
// first 10 calls in a minute pass, the 11th is rejected until tokens refill`]]
    ),
    'mvc-request-tracing': x(
        ['<b>Request tracing</b> means giving every request a unique id and putting that id in every log line, so one request can be followed end to end.',
            '<b>Correlation id</b>: read it from a header such as <code>X-Request-Id</code>, or generate one, and return it in the response.',
            '<b>MDC</b> (Mapped Diagnostic Context) holds the id per thread so the logging pattern can print it automatically.'],
        ['<b>Filter</b>: a servlet <code>OncePerRequestFilter</code> is the right place, because it wraps the whole request.',
            '<b>Cleanup</b>: always call <code>MDC.remove</code> in a <code>finally</code> block, because servlet threads are reused.',
            '<b>Log pattern</b>: add <code>%X{requestId}</code> to the logging pattern so the id appears in every line.'],
        ['<b>Distributed tracing</b>: Micrometer Tracing propagates <code>traceparent</code> (W3C) headers between services and creates spans.',
            '<b>Async</b>: MDC is thread-local, so it is lost in <code>@Async</code> and executors unless you copy it with a task decorator.',
            '<b>Outbound calls</b>: pass the id on to <code>RestClient</code> or <code>WebClient</code> calls so downstream logs match.'],
        [['F', 'What is a correlation id?', 'A unique id attached to a request and written in all its log lines, so you can find everything one request did.'],
            ['F', 'What is MDC?', 'A per-thread map in the logging framework. Values put there can be printed by the log pattern.'],
            ['M', 'Why clear the MDC in finally?', 'Servlet container threads are pooled. A leftover id would appear in the logs of a different request.'],
            ['M', 'Which Spring class suits a tracing filter?', 'OncePerRequestFilter, which runs once per request even with forwards.'],
            ['S', 'Why does MDC vanish in @Async methods?', 'MDC is ThreadLocal, and the async method runs on another thread. Use a TaskDecorator to copy the context.'],
            ['S', 'How do traces cross services?', 'The trace id travels in the traceparent header. Micrometer Tracing reads it and continues the same trace.']],
        [['A request id filter.',
            r`@Component
public class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("requestId", id);
        res.setHeader("X-Request-Id", id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.remove("requestId");      // threads are reused
        }
    }
}

// OUTPUT:
// response header: X-Request-Id: 3f1c9a52-7d0e-4b7e-9d34-1a2b3c4d5e6f (varies)`],
            ['Log pattern in application.properties.',
                r`logging.pattern.level=%5p [%X{requestId}]

# OUTPUT:
# INFO [3f1c9a52-7d0e-4b7e-9d34-1a2b3c4d5e6f] Loading order 42
# WARN [3f1c9a52-7d0e-4b7e-9d34-1a2b3c4d5e6f] Stock low for item 7`]],
        [['Test that the header is returned.',
            r`@WebMvcTest(OrderController.class)
@Import(RequestIdFilter.class)
class RequestIdTest {
    @Autowired MockMvc mvc;

    @Test
    void echoesProvidedId() throws Exception {
        mvc.perform(get("/api/orders").header("X-Request-Id", "abc-1"))
           .andExpect(header().string("X-Request-Id", "abc-1"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Copy MDC into async tasks.',
                r`@Bean
TaskDecorator mdcDecorator() {
    return task -> {
        Map<String, String> ctx = MDC.getCopyOfContextMap();
        return () -> {
            if (ctx != null) MDC.setContextMap(ctx);
            try { task.run(); } finally { MDC.clear(); }
        };
    };
}

// OUTPUT:
// async log lines now show the same requestId as the caller`]]
    ),
    'mvc-graceful-error-handling': x(
        ['<b>Graceful error handling</b> means every failure returns a clear, consistent response and a correct status code, never a raw stack trace.',
            '<b>@RestControllerAdvice</b> holds <code>@ExceptionHandler</code> methods that apply to all controllers.',
            '<b>Status codes</b>: 400 for bad input, 404 for missing data, 409 for conflicts, 500 only for real server faults.'],
        ['<b>ProblemDetail</b> (RFC 7807 / 9457) is the built-in error body in Spring 6: <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>.',
            '<b>Validation errors</b>: <code>MethodArgumentNotValidException</code> carries field errors that you should map to a 400 body.',
            '<b>ResponseEntityExceptionHandler</b> is a base class that already handles the standard MVC exceptions.'],
        ['<b>Do not leak</b>: log the full exception on the server, but return a short message and a request id to the client.',
            '<b>Order</b>: the most specific handler wins, so add a final <code>Exception</code> handler as a safety net.',
            '<b>Enable</b> <code>spring.mvc.problemdetails.enabled=true</code> to get ProblemDetail for built-in exceptions.'],
        [['F', 'What does @RestControllerAdvice do?', 'It applies exception handlers (and other advice) globally to all controllers, and writes the return value as the body.'],
            ['F', 'Which status for a missing resource?', '404 Not Found.'],
            ['M', 'What is ProblemDetail?', 'A Spring 6 class for the standard problem JSON format with type, title, status and detail fields.'],
            ['M', 'Handler for a controller only?', 'Put @ExceptionHandler inside that controller. It applies to that controller only.'],
            ['S', 'Why log but not return the stack trace?', 'Stack traces leak internals useful to attackers. The client gets a safe message and an id to quote to support.'],
            ['S', 'How do you test error handling?', 'MockMvc with @WebMvcTest: make the service throw, then assert status and JSON fields.']],
        [['Global handler with ProblemDetail.',
            r`public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(long id) { super("Order " + id + " not found"); }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail notFound(OrderNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Order not found");
        return pd;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail fallback(Exception ex) {
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
    }
}

// OUTPUT:
// GET /api/orders/99 -> 404
// {"title":"Order not found","status":404,"detail":"Order 99 not found"}`],
            ['Validation errors to 400.',
                r`@ExceptionHandler(MethodArgumentNotValidException.class)
ProblemDetail invalid(MethodArgumentNotValidException ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
    pd.setTitle("Validation failed");
    pd.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
        .map(f -> f.getField() + ": " + f.getDefaultMessage()).toList());
    return pd;
}

// OUTPUT:
// POST /api/orders {} -> 400
// {"title":"Validation failed","status":400,"errors":["qty: must be greater than 0"]}`]],
        [['Test the 404 mapping.',
            r`@WebMvcTest(OrderController.class)
class ErrorHandlingTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService service;

    @Test
    void missingOrderIs404() throws Exception {
        when(service.find(99L)).thenThrow(new OrderNotFoundException(99));
        mvc.perform(get("/api/orders/99"))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.title").value("Order not found"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Throw ResponseStatusException for quick cases.',
                r`@GetMapping("/{id}")
Order get(@PathVariable long id) {
    return repo.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "No order " + id));
}

// OUTPUT:
// GET /orders/5 (missing) -> 404 with a problem body`]]
    ),
    'mvc-production-deployment': x(
        ['<b>Production deployment</b> means running the app on real servers with safe configuration, monitoring and a repeatable release process.',
            '<b>Executable jar</b>: Spring Boot builds one fat jar with embedded Tomcat, started with <code>java -jar app.jar</code>.',
            '<b>Profiles</b>: <code>spring.profiles.active=prod</code> selects production settings, kept apart from development ones.'],
        ['<b>External config</b>: secrets and URLs come from environment variables or a config server, never from the jar.',
            '<b>Actuator</b>: <code>/actuator/health</code> lets load balancers and orchestrators know if the app is alive and ready.',
            '<b>Graceful shutdown</b>: <code>server.shutdown=graceful</code> lets running requests finish before the process stops.'],
        ['<b>Containers</b>: build a small image (layered jar, non-root user) and set JVM memory with <code>-XX:MaxRAMPercentage</code>.',
            '<b>Zero downtime</b>: rolling or blue-green releases, with readiness probes and database migrations that stay backward compatible.',
            '<b>Observability</b>: logs to stdout, metrics through Micrometer, and traces, all collected by the platform.'],
        [['F', 'How do you run a Spring Boot app in production?', 'Build the executable jar and run it with java -jar, or package it in a container, with the prod profile active.'],
            ['F', 'What is a profile?', 'A named set of configuration, such as dev or prod, chosen at startup.'],
            ['M', 'Why graceful shutdown?', 'So in-flight requests complete during a deploy instead of being cut off.'],
            ['M', 'How should secrets be supplied?', 'Through environment variables or a secret store, not committed in application.properties.'],
            ['S', 'Liveness versus readiness?', 'Liveness says the process is healthy (restart if not). Readiness says it can take traffic (remove from balancer if not).'],
            ['S', 'How do you deploy without downtime?', 'Rolling update with readiness checks and backward compatible database changes, so old and new versions can run together.']],
        [['Production properties.',
            r`# application-prod.properties
server.port=8080
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.probes.enabled=true
logging.level.root=WARN
logging.level.com.shop=INFO

# OUTPUT:
# java -jar app.jar --spring.profiles.active=prod
# Tomcat started on port 8080, profile prod active`],
            ['A small Dockerfile.',
                r`FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd -r appuser
COPY target/app.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]

# OUTPUT:
# docker build -t shop-api:1.0 .   -> image built
# docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod shop-api:1.0`]],
        [['Check health after deploy.',
            r`// curl http://localhost:8080/actuator/health
// {"status":"UP","groups":["liveness","readiness"]}
// curl http://localhost:8080/actuator/health/readiness
// {"status":"UP"}

// OUTPUT:
// both probes return UP, so the load balancer sends traffic`],
            ['Smoke test with SpringBootTest.',
                r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SmokeTest {
    @Autowired TestRestTemplate rest;

    @Test
    void healthIsUp() {
        var res = rest.getForEntity("/actuator/health", String.class);
        assertThat(res.getStatusCode().is2xxSuccessful()).isTrue();
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-load-balancing': x(
        ['<b>Load balancing</b> spreads incoming requests over several app instances, for more capacity and for survival when one instance fails.',
            '<b>Stateless app</b>: if no request depends on data kept in one instance, any instance can serve any request.',
            '<b>Health checks</b>: the balancer stops sending traffic to an instance that fails its check.'],
        ['<b>Algorithms</b>: round robin, least connections, and IP hash (the same client goes to the same server).',
            '<b>Sticky sessions</b> pin a user to one instance, but they hurt balance and fail when that instance dies.',
            '<b>Spring Session</b> stores the HTTP session in Redis, so every instance sees the same session.'],
        ['<b>Layers</b>: L4 balancers route TCP, L7 balancers (Nginx, cloud ALB) route by HTTP path and headers.',
            '<b>Graceful drain</b>: on shutdown mark the instance not ready first, so the balancer stops sending new requests before the app exits.',
            '<b>Client IP</b>: behind a balancer the real address is in <code>X-Forwarded-For</code>, not <code>getRemoteAddr()</code>.'],
        [['F', 'Why use a load balancer?', 'To share traffic across instances for higher capacity and availability.'],
            ['F', 'What is round robin?', 'Requests are sent to each server in turn.'],
            ['M', 'What problem do local HTTP sessions cause?', 'The session lives in one instance only. Another instance would not find it, so the user appears logged out.'],
            ['M', 'How does Spring Session help?', 'It keeps session data in a shared store such as Redis, making instances interchangeable.'],
            ['S', 'Why prefer stateless design over sticky sessions?', 'Sticky sessions unbalance load and lose sessions on instance failure. Stateless apps scale and recover freely.'],
            ['S', 'How do you avoid errors during a rolling deploy?', 'Use readiness probes plus graceful shutdown so the balancer drains an instance before it stops.']],
        [['Nginx round robin upstream.',
            r`upstream shop_app {
    least_conn;
    server 10.0.0.11:8080 max_fails=3 fail_timeout=10s;
    server 10.0.0.12:8080 max_fails=3 fail_timeout=10s;
}
server {
    listen 80;
    location / { proxy_pass http://shop_app; }
}

# OUTPUT:
# requests go to the instance with fewest active connections
# a failing instance is skipped for 10 seconds`],
            ['Shared sessions with Spring Session and Redis.',
                r`# pom: spring-session-data-redis
spring.session.store-type=redis
spring.data.redis.host=redis.internal
spring.data.redis.port=6379
server.servlet.session.timeout=30m

# OUTPUT:
# login on instance A, next request on instance B still sees the session`]],
        [['Show which instance answered.',
            r`@RestController
class WhoAmIController {
    @Value("$" + "{HOSTNAME:local}") String host;

    @GetMapping("/whoami")
    String whoami() { return host; }
}

// OUTPUT:
// curl /whoami (3 times) -> app-1, app-2, app-1 (varies)`],
            ['Readiness probe before traffic.',
                r`management.endpoint.health.probes.enabled=true
management.health.readinessstate.enabled=true

# OUTPUT:
# GET /actuator/health/readiness -> {"status":"UP"} when ready
# balancer health check path: /actuator/health/readiness`]]
    ),
    'mvc-reverse-proxy': x(
        ['<b>Reverse proxy</b> is a server in front of your app (Nginx, Apache, cloud gateway) that receives client requests and forwards them to the app.',
            '<b>Why</b>: TLS termination, compression, caching, static files, routing and hiding the app servers from the internet.',
            '<b>Forwarded headers</b>: the proxy adds <code>X-Forwarded-For</code>, <code>X-Forwarded-Proto</code> and <code>X-Forwarded-Host</code> so the app knows the original request.'],
        ['<b>The problem</b>: without these headers the app sees http and the proxy IP, and builds wrong redirect and link URLs.',
            '<b>Boot setting</b>: <code>server.forward-headers-strategy=framework</code> (or <code>native</code>) makes Spring honour them.',
            '<b>Context path</b>: if the proxy maps <code>/shop</code> to <code>/</code>, the app must know the prefix for links and redirects.'],
        ['<b>Trust</b>: only accept forwarded headers from your own proxy, because a client can fake them.',
            '<b>Filter</b>: <code>ForwardedHeaderFilter</code> applies the headers in MVC; Boot registers it for the framework strategy.',
            '<b>Timeouts and body size</b> are enforced by the proxy too, so 502, 504 and 413 can come from it and not from the app.'],
        [['F', 'What is a reverse proxy?', 'A server that accepts client requests and passes them to backend servers, returning their responses.'],
            ['F', 'Name a common reverse proxy.', 'Nginx, Apache httpd, HAProxy or a cloud load balancer.'],
            ['M', 'Why does request.isSecure() return false behind a TLS proxy?', 'The proxy talks plain HTTP to the app. The original scheme is only in X-Forwarded-Proto, which must be enabled.'],
            ['M', 'Which property enables forwarded headers in Boot?', 'server.forward-headers-strategy=framework or native.'],
            ['S', 'Why not trust X-Forwarded-For blindly?', 'Any client can send it. Trust only values set by your own proxy, and strip incoming ones at the edge.'],
            ['S', 'A redirect points to http://internal:8080. Why?', 'The app builds absolute URLs from the request it sees. Forward headers are missing or not enabled.']],
        [['Enable forwarded headers.',
            r`server.forward-headers-strategy=framework
server.tomcat.remoteip.internal-proxies=10\.0\.0\.\d+

# OUTPUT:
# request.getScheme() -> https
# request.getRemoteAddr() -> real client IP (varies)`],
            ['Controller showing what the app sees.',
                r`@GetMapping("/debug/request")
Map<String, Object> info(HttpServletRequest req) {
    return Map.of("scheme", req.getScheme(),
        "host", req.getServerName(),
        "ip", req.getRemoteAddr());
}

// OUTPUT:
// without forwarding: {"scheme":"http","host":"10.0.0.5","ip":"10.0.0.2"}
// with forwarding:    {"scheme":"https","host":"shop.example.com","ip":"203.0.113.9"}`]],
        [['Test forwarded headers with MockMvc.',
            r`@SpringBootTest(properties =
    "server.forward-headers-strategy=framework")
@AutoConfigureMockMvc
class ForwardedTest {
    @Autowired MockMvc mvc;

    @Test
    void usesForwardedProto() throws Exception {
        mvc.perform(get("/debug/request")
                .header("X-Forwarded-Proto", "https")
                .header("X-Forwarded-Host", "shop.example.com"))
           .andExpect(jsonPath("$.scheme").value("https"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Build correct absolute links.',
                r`URI location = ServletUriComponentsBuilder.fromCurrentRequest()
    .path("/{id}").buildAndExpand(42).toUri();
return ResponseEntity.created(location).build();

// OUTPUT:
// Location: https://shop.example.com/api/orders/42`]]
    ),
    'mvc-nginx-plus-spring-mvc': x(
        ['<b>Nginx in front of Spring MVC</b> is the usual production layout: Nginx handles TLS and static files, and proxies dynamic requests to Tomcat.',
            '<b>proxy_pass</b> forwards a location to the app, for example <code>proxy_pass http://127.0.0.1:8080;</code>.',
            '<b>proxy_set_header</b> lines pass <code>Host</code>, <code>X-Real-IP</code>, <code>X-Forwarded-For</code> and <code>X-Forwarded-Proto</code> to the app.'],
        ['<b>Upstream block</b>: lists several app servers, so Nginx also load balances them.',
            '<b>Timeouts</b>: <code>proxy_read_timeout</code> must be longer than your slowest endpoint, or clients see 504.',
            '<b>Static files</b>: serve <code>/static/</code> directly from disk with caching headers, so Tomcat is not used for them.'],
        ['<b>Client body size</b>: <code>client_max_body_size</code> defaults to 1 MB and returns 413 for larger uploads.',
            '<b>Buffering</b>: for streaming or server-sent events set <code>proxy_buffering off</code>.',
            '<b>HTTP/1.1 keepalive</b> to the upstream (<code>proxy_http_version 1.1</code>) saves connection setup.'],
        [['F', 'What does Nginx do in front of Spring MVC?', 'It terminates TLS, serves static files and forwards other requests to Tomcat.'],
            ['F', 'Which directive forwards a request?', 'proxy_pass.'],
            ['M', 'Why set proxy_set_header Host $host?', 'So the app sees the original host name and builds correct URLs.'],
            ['M', 'File upload fails with 413. Why?', 'Nginx client_max_body_size is too small. Raise it (and the Spring multipart limits).'],
            ['S', 'Clients get 504 on a long report. Fix?', 'Increase proxy_read_timeout, or better make the endpoint asynchronous.'],
            ['S', 'How do you make the app aware of HTTPS?', 'Send X-Forwarded-Proto from Nginx and set server.forward-headers-strategy=framework.']],
        [['A complete server block.',
            r`server {
    listen 443 ssl;
    server_name shop.example.com;
    ssl_certificate     /etc/ssl/shop.crt;
    ssl_certificate_key /etc/ssl/shop.key;
    client_max_body_size 10m;

    location /static/ {
        root /var/www/shop;
        expires 7d;
    }
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}

# OUTPUT:
# nginx -t   -> syntax is ok, test is successful
# nginx -s reload`],
            ['Matching Spring Boot settings.',
                r`server.address=127.0.0.1
server.port=8080
server.forward-headers-strategy=framework
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# OUTPUT:
# app listens on loopback only, so clients must use Nginx`]],
        [['Verify with curl.',
            r`// curl -I https://shop.example.com/static/logo.png
// HTTP/1.1 200 OK
// Cache-Control: max-age=604800
// curl -s https://shop.example.com/debug/request
// {"scheme":"https","host":"shop.example.com","ip":"203.0.113.9"}

// OUTPUT:
// static served by Nginx with caching, dynamic request shows https and real IP`],
            ['Several instances behind Nginx.',
                r`upstream shop {
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
    keepalive 16;
}

# OUTPUT:
# proxy_pass http://shop; alternates between ports 8081 and 8082`]]
    ),
    'mvc-tomcat-configuration': x(
        ['<b>Embedded Tomcat</b> is the default server in Spring Boot MVC, and it is tuned with <code>server.tomcat.*</code> properties.',
            '<b>Worker threads</b>: <code>server.tomcat.threads.max</code> (default 200) is how many requests are handled at the same time.',
            '<b>Port and context</b>: <code>server.port</code> and <code>server.servlet.context-path</code> set where the app listens.'],
        ['<b>Queues</b>: <code>accept-count</code> is the wait queue when all threads and connections are busy, and <code>max-connections</code> caps open sockets.',
            '<b>Timeouts</b>: <code>server.tomcat.connection-timeout</code> closes idle connections that send nothing.',
            '<b>Access log</b>: <code>server.tomcat.accesslog.enabled=true</code> records each request for debugging and audits.'],
        ['<b>Sizing</b>: more threads help I/O-bound apps, but they cost memory and can overload the database pool, so match thread count to downstream capacity.',
            '<b>Customizer</b>: a <code>WebServerFactoryCustomizer&lt;TomcatServletWebServerFactory&gt;</code> sets what properties cannot, such as connector options.',
            '<b>Virtual threads</b>: on Java 21 with Boot 3.2+, <code>spring.threads.virtual.enabled=true</code> serves requests on virtual threads.'],
        [['F', 'Which server does Spring Boot use by default?', 'Embedded Tomcat.'],
            ['F', 'How do you change the port?', 'Set server.port in application.properties.'],
            ['M', 'What does server.tomcat.threads.max control?', 'The maximum number of worker threads, so the number of requests processed in parallel.'],
            ['M', 'What is accept-count?', 'The length of the queue for connections waiting when all worker threads are busy.'],
            ['S', 'Why not just set threads.max to 2000?', 'Each thread uses memory, and it could overwhelm the database pool or CPU. Size it to the slowest shared resource.'],
            ['S', 'How do you change something with no property?', 'Register a WebServerFactoryCustomizer bean and configure the Tomcat factory in code.']],
        [['Tomcat properties.',
            r`server.port=8080
server.tomcat.threads.max=200
server.tomcat.threads.min-spare=20
server.tomcat.accept-count=100
server.tomcat.max-connections=8192
server.tomcat.connection-timeout=20s
server.tomcat.accesslog.enabled=true
server.tomcat.accesslog.directory=logs

# OUTPUT:
# Tomcat initialized with port 8080 (http)
# access log: logs/access_log.2025-01-15.log`],
            ['A customizer bean.',
                r`@Bean
WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatTuning() {
    return factory -> factory.addConnectorCustomizers(connector -> {
        connector.setMaxPostSize(4 * 1024 * 1024);   // 4 MB form posts
        connector.setProperty("relaxedQueryChars", "[]");
    });
}

// OUTPUT:
// Tomcat connector started with maxPostSize=4194304`]],
        [['Load test hint and metrics.',
            r`management.endpoints.web.exposure.include=metrics
server.tomcat.mbeanregistry.enabled=true

// GET /actuator/metrics/tomcat.threads.busy
// {"name":"tomcat.threads.busy","measurements":[{"statistic":"VALUE","value":12.0}]}

// OUTPUT: (varies)
// busy near threads.max under load means requests queue: tune or scale out`],
            ['Verify the port in a test.',
                r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PortTest {
    @LocalServerPort int port;

    @Test
    void serverStarts() {
        assertThat(port).isGreaterThan(0);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-spring-mvc-architecture': x(
        ['<b>Spring MVC</b> is a web framework built on the Front Controller pattern: one servlet, the <code>DispatcherServlet</code>, receives every request and delegates.',
            '<b>MVC roles</b>: the Model holds data, the View renders it, and the Controller handles the request and chooses the view.',
            '<b>Flow</b>: request, DispatcherServlet, HandlerMapping, controller method, then a view or a JSON body is returned.'],
        ['<b>HandlerMapping</b> finds the controller method for the URL and HTTP method (from <code>@RequestMapping</code> and friends).',
            '<b>HandlerAdapter</b> calls the method, resolving arguments like <code>@PathVariable</code> and <code>@RequestBody</code>.',
            '<b>ViewResolver</b> turns a view name into a template; for REST, <code>HttpMessageConverter</code> writes JSON instead.'],
        ['<b>Interceptors</b> run before and after the handler; servlet <code>Filter</code>s run earlier, before the DispatcherServlet.',
            '<b>Exceptions</b> go to <code>HandlerExceptionResolver</code>s, which is how <code>@ExceptionHandler</code> works.',
            '<b>Contexts</b>: Boot uses one application context; classic setups had a root context and a web context.'],
        [['F', 'What is the front controller in Spring MVC?', 'The DispatcherServlet. All requests pass through it first.'],
            ['F', 'What do M, V and C stand for?', 'Model for data, View for display, Controller for handling requests.'],
            ['M', 'What does HandlerMapping do?', 'It maps a request to the handler (controller method) that should process it.'],
            ['M', 'Filter versus Interceptor?', 'A Filter is a servlet component that runs before the DispatcherServlet. An Interceptor is a Spring component around the handler call.'],
            ['S', 'How does a @RestController return JSON?', 'The return value is written by an HttpMessageConverter (Jackson) chosen by the Accept header, and no view is resolved.'],
            ['S', 'Where are exceptions handled?', 'HandlerExceptionResolvers inside the DispatcherServlet, such as ExceptionHandlerExceptionResolver for @ExceptionHandler.']],
        [['A minimal controller.',
            r`@Controller
class HelloController {
    @GetMapping("/hello")
    String hello(@RequestParam(defaultValue = "World") String name, Model model) {
        model.addAttribute("name", name);
        return "hello";                 // view name, resolved to hello.html
    }
}

// OUTPUT:
// GET /hello?name=Asha -> renders hello.html with name = Asha`],
            ['A REST variant.',
                r`@RestController
@RequestMapping("/api")
class GreetingApi {
    record Greeting(String message) {}

    @GetMapping("/greet/{name}")
    Greeting greet(@PathVariable String name) {
        return new Greeting("Hello " + name);
    }
}

// OUTPUT:
// GET /api/greet/Asha -> {"message":"Hello Asha"}`]],
        [['Test the layer with MockMvc.',
            r`@WebMvcTest(GreetingApi.class)
class GreetingApiTest {
    @Autowired MockMvc mvc;

    @Test
    void greets() throws Exception {
        mvc.perform(get("/api/greet/Asha"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.message").value("Hello Asha"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Trace the flow with debug logging.',
                r`logging.level.org.springframework.web.servlet.DispatcherServlet=DEBUG

# OUTPUT:
# GET "/api/greet/Asha", parameters={}
# Mapped to com.shop.GreetingApi#greet(String)
# Completed 200 OK`]]
    ),
    'mvc-dispatcherservlet-interview': x(
        ['<b>DispatcherServlet</b> is the front controller of Spring MVC: a single <code>HttpServlet</code> that receives requests and coordinates the handling.',
            '<b>Core job</b>: find a handler, run interceptors, call the handler, then render the view or write the response body.',
            '<b>Registration</b>: Spring Boot registers it automatically (mapped to <code>/</code>) through <code>DispatcherServletAutoConfiguration</code>.'],
        ['<b>Strategy beans</b>: it delegates to <code>HandlerMapping</code>, <code>HandlerAdapter</code>, <code>HandlerExceptionResolver</code>, <code>ViewResolver</code> and more.',
            '<b>Main method</b>: <code>doDispatch()</code> contains the whole processing sequence.',
            '<b>Defaults</b>: if you do not define a strategy bean, it uses defaults from <code>DispatcherServlet.properties</code>.'],
        ['<b>Handler chain</b>: <code>getHandler()</code> returns a <code>HandlerExecutionChain</code> (handler plus interceptors).',
            '<b>Order</b>: interceptor <code>preHandle</code>, handler, <code>postHandle</code>, view rendering, then <code>afterCompletion</code>.',
            '<b>404</b>: if no handler is found it sends 404 (or throws <code>NoHandlerFoundException</code> when configured).'],
        [['F', 'What is DispatcherServlet?', 'The front controller servlet of Spring MVC that routes every request to the right handler.'],
            ['F', 'Who creates it in Spring Boot?', 'DispatcherServletAutoConfiguration registers it, mapped to the root path.'],
            ['M', 'Name the steps in doDispatch.', 'Find handler, find adapter, run preHandle, invoke the handler, run postHandle, render or write the result, run afterCompletion.'],
            ['M', 'HandlerMapping versus HandlerAdapter?', 'The mapping finds which handler matches the request. The adapter knows how to invoke that kind of handler.'],
            ['S', 'Can you have several DispatcherServlets?', 'Yes. Each has its own WebApplicationContext, for example for separate API and admin areas, though Boot normally uses one.'],
            ['S', 'How is a REST response produced without a ViewResolver?', 'The adapter sees @ResponseBody, uses an HttpMessageConverter to write the body, and returns no ModelAndView.']],
        [['Custom interceptor showing the order.',
            r`public class TimingInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        System.out.println("preHandle");
        return true;
    }
    public void postHandle(HttpServletRequest q, HttpServletResponse s,
            Object h, ModelAndView mv) {
        System.out.println("postHandle");
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
            Object h, Exception ex) {
        System.out.println("afterCompletion");
    }
}

// OUTPUT:
// preHandle
// (controller runs)
// postHandle
// afterCompletion`],
            ['Customize the DispatcherServlet registration.',
                r`spring.mvc.servlet.path=/app
spring.mvc.throw-exception-if-no-handler-found=true
spring.mvc.dispatch-options-request=true

# OUTPUT:
# all MVC URLs now start with /app
# unknown URL raises NoHandlerFoundException (handle it for a JSON 404)`]],
        [['Inspect mappings at startup.',
            r`logging.level.org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping=TRACE

# OUTPUT:
# 'GET /api/greet/{name}' to com.shop.GreetingApi#greet(String)`],
            ['Test that an unknown URL gives 404.',
                r`@WebMvcTest
class NotFoundTest {
    @Autowired MockMvc mvc;

    @Test
    void unknownIs404() throws Exception {
        mvc.perform(get("/nope")).andExpect(status().isNotFound());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    )
};

export const smvc42Deep: Record<string, Deep> = {
    'mvc-rate-limiting': dv(
        [`<p>A limiter is a small state machine per client key.</p><ul><li><b>Token bucket:</b> a bucket holds up to N tokens, refilled at a steady rate; each request takes one, and an empty bucket means 429.</li><li><b>Fixed window:</b> a counter resets each interval; cheap, but allows a double burst around the boundary.</li><li><b>Sliding window:</b> counts requests in the last interval; fairer, costs more memory.</li><li><b>Where it runs:</b> a <code>HandlerInterceptor.preHandle</code> returns false to stop the chain before the controller.</li></ul>`,
            r`class TokenBucket {
    private final long capacity; private final double refillPerSec;
    private double tokens; private long last = System.nanoTime();
    TokenBucket(long capacity, double refillPerSec) {
        this.capacity = capacity; this.refillPerSec = refillPerSec;
        this.tokens = capacity;
    }
    synchronized boolean tryConsume() {
        long now = System.nanoTime();
        tokens = Math.min(capacity, tokens + (now - last) / 1e9 * refillPerSec);
        last = now;
        if (tokens >= 1) { tokens -= 1; return true; }
        return false;
    }
}

// OUTPUT:
// capacity 5, refill 1 per second: 5 quick calls pass, the 6th fails, one passes after 1 s`],
        [`<p>Variants and options:</p><ul><li><b>Key:</b> IP, API key, user id, or a mix by route.</li><li><b>Tiers:</b> different limits per plan (free, paid).</li><li><b>Per route:</b> a custom annotation such as <code>@RateLimited</code> read in the interceptor.</li><li><b>Libraries:</b> Bucket4j (with Redis or Hazelcast), Resilience4j <code>RateLimiter</code>.</li><li><b>Edge:</b> Nginx <code>limit_req</code>, API gateway, cloud WAF.</li></ul>`,
            r`@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited { int perMinute() default 60; }

// in the interceptor
if (handler instanceof HandlerMethod hm) {
    RateLimited rl = hm.getMethodAnnotation(RateLimited.class);
    if (rl != null && !bucketFor(req, rl.perMinute()).tryConsume()) {
        res.sendError(429);
        return false;
    }
}

// OUTPUT:
// @RateLimited(perMinute = 5) on /api/search -> sixth call in a minute gets 429`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Local counters on many instances:</b> the real limit is multiplied; use Redis or the gateway.</li><li><b>Counting the proxy IP:</b> every user shares one bucket; use the forwarded client address and trust only your proxy.</li><li><b>Unbounded map:</b> idle keys never leave; use a cache with expiry such as Caffeine.</li><li><b>No Retry-After:</b> clients retry immediately and make it worse.</li><li><b>Limiting health checks:</b> exclude actuator paths.</li></ul>`,
            r`Cache<String, TokenBucket> buckets = Caffeine.newBuilder()
    .expireAfterAccess(Duration.ofMinutes(10))
    .maximumSize(100_000)
    .build();

TokenBucket b = buckets.get(clientKey, k -> new TokenBucket(60, 1.0));

// OUTPUT:
// idle clients are dropped after 10 minutes; memory stays bounded`],
        [`<p>Tuning tips:</p><ul><li><b>Cheap check first:</b> run the limiter early, before authentication or body parsing.</li><li><b>Lock-free:</b> prefer atomics or a library to a global <code>synchronized</code> block.</li><li><b>Shared store cost:</b> a Redis round trip per request adds latency; use Lua scripts or local pre-counting.</li><li><b>Edge first:</b> let Nginx reject floods so Tomcat threads are never used.</li></ul>`,
            r`limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:8080;
    }
}

# OUTPUT:
# more than 10 requests/s per IP (burst 20) get 429 without reaching Spring`],
        [`<p>Real-world scenario: a public search API is scraped by one client and slows everyone down.</p><ul><li>Edge limit by IP at Nginx for floods.</li><li>Per API key limits in the app, with tiers.</li><li>Return 429 with <code>Retry-After</code> and rate headers.</li><li>Dashboard of 429 counts per key to find abusers.</li></ul>`,
            r`res.setStatus(429);
res.setHeader("Retry-After", String(waitSeconds));
res.setHeader("X-RateLimit-Limit", "60");
res.setHeader("X-RateLimit-Remaining", "0");
res.setContentType("application/problem+json");
res.getWriter().write("{\"title\":\"Too many requests\",\"status\":429}");

// OUTPUT:
// HTTP/1.1 429
// Retry-After: 12
// {"title":"Too many requests","status":429}`]
    ),
    'mvc-request-tracing': dv(
        [`<p>How tracing works inside the servlet thread:</p><ul><li>One request is handled by one pooled thread from start to end (in classic MVC).</li><li>The MDC is a <code>ThreadLocal</code> map, so values set in the filter are visible to every log call on that thread.</li><li>The logging pattern reads <code>%X{requestId}</code> when it formats each line.</li><li>The filter must clear the MDC, as the thread goes back to the pool.</li></ul>`,
            r`// Thread http-nio-8080-exec-3
MDC.put("requestId", "abc");        // filter
log.info("controller called");      // prints [abc]
service.process();                  // same thread: log prints [abc]
MDC.remove("requestId");            // filter finally block

// OUTPUT:
// INFO [abc] controller called
// INFO [abc] processing order 42`],
        [`<p>Options and variants:</p><ul><li><b>Manual filter:</b> small and clear, good for one service.</li><li><b>Micrometer Tracing:</b> adds <code>traceId</code> and <code>spanId</code> to the MDC automatically with a bridge (Brave or OpenTelemetry).</li><li><b>Header formats:</b> W3C <code>traceparent</code>, or B3 headers.</li><li><b>Sampling:</b> <code>management.tracing.sampling.probability</code> controls how many traces are exported.</li></ul>`,
            r`management.tracing.sampling.probability=0.1
logging.pattern.level=%5p [$` + r`{spring.application.name:},%X{traceId:-},%X{spanId:-}]

# OUTPUT:
# INFO [shop-api,6f2e9d41a1c04b7e,a91c33b2e0f1d455] Order created`],
        [`<p>Common mistakes:</p><ul><li><b>No MDC cleanup:</b> ids leak into other requests.</li><li><b>Trusting any incoming id:</b> validate its length and characters, to prevent log injection.</li><li><b>Async loss:</b> context missing in executors; use a <code>TaskDecorator</code>.</li><li><b>Not returning the id:</b> support cannot ask the user for it.</li><li><b>Id missing in error bodies:</b> add it to the ProblemDetail.</li></ul>`,
            r`String incoming = req.getHeader("X-Request-Id");
String id = (incoming != null && incoming.matches("[A-Za-z0-9-]{1,64}"))
    ? incoming : UUID.randomUUID().toString();

// OUTPUT:
// "abc\nINFO fake line" is rejected, a fresh UUID is used instead`],
        [`<p>Performance notes:</p><ul><li>MDC put and remove are cheap; the cost is in formatting longer log lines.</li><li>Keep trace sampling low in busy systems, but always log the id.</li><li>Use async appenders so logging does not block request threads.</li><li>Virtual threads still support MDC, as it is per thread.</li></ul>`,
            r`<!-- logback-spring.xml -->
<appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>8192</queueSize>
    <appender-ref ref="STDOUT"/>
</appender>

// OUTPUT:
// log calls return immediately; a background thread writes the lines`],
        [`<p>Real-world scenario: a customer reports "checkout failed at 14:05".</p><ul><li>Support asks for the <code>X-Request-Id</code> from the error page.</li><li>Search the log platform for that id.</li><li>See the gateway, order service and payment service lines together.</li><li>Find the timeout in the payment call.</li></ul>`,
            r`// error body returned to the customer
// {"title":"Payment failed","status":502,"requestId":"3f1c9a52-7d0e"}

// log search: requestId:3f1c9a52-7d0e
// OUTPUT:
// gateway   INFO  POST /checkout
// orders    INFO  creating order
// payments  ERROR read timeout calling card provider`]
    ),
    'mvc-graceful-error-handling': dv(
        [`<p>How errors travel through MVC:</p><ul><li>An exception thrown in a controller reaches <code>DispatcherServlet.processHandlerException</code>.</li><li>The registered <code>HandlerExceptionResolver</code>s try in order: <code>ExceptionHandlerExceptionResolver</code> (your @ExceptionHandler), <code>ResponseStatusExceptionResolver</code>, <code>DefaultHandlerExceptionResolver</code>.</li><li>The best-matching handler method is chosen by exception type distance.</li><li>If nothing handles it, the container's error page (<code>/error</code>, BasicErrorController in Boot) is used.</li></ul>`,
            r`@ExceptionHandler(RuntimeException.class)     // general
ProblemDetail general(RuntimeException e) { /* ... */ return null; }

@ExceptionHandler(IllegalStateException.class)  // more specific: wins
ProblemDetail state(IllegalStateException e) { /* ... */ return null; }

// OUTPUT:
// throw new IllegalStateException() -> state(...) is called, not general(...)`],
        [`<p>Variants:</p><ul><li><b>@ResponseStatus</b> on an exception class gives a fixed status.</li><li><b>ResponseStatusException</b> for inline errors.</li><li><b>ResponseEntityExceptionHandler</b> to customise built-in MVC exceptions.</li><li><b>@ControllerAdvice(basePackages)</b> to limit the scope.</li><li><b>ErrorAttributes</b> to adjust the Boot <code>/error</code> JSON.</li></ul>`,
            r`@RestControllerAdvice
class ApiErrors extends ResponseEntityExceptionHandler {
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "Malformed JSON body");
        return handleExceptionInternal(ex, pd, headers, status, request);
    }
}

// OUTPUT:
// POST /api/orders with body {bad -> 400 {"detail":"Malformed JSON body"}`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Catching everything in the controller:</b> duplicates code; use advice.</li><li><b>Returning 200 with an error text:</b> clients cannot detect failure; use real status codes.</li><li><b>Leaking messages:</b> SQL or class names in the detail; log them, return a safe message.</li><li><b>Swallowing exceptions:</b> always log at least once with the stack trace.</li><li><b>Only a catch-all handler:</b> every error becomes 500; add specific handlers.</li></ul>`,
            r`@ExceptionHandler(DataIntegrityViolationException.class)
ProblemDetail conflict(DataIntegrityViolationException ex) {
    log.warn("constraint violation", ex);                 // full detail in log
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.CONFLICT, "Record already exists");    // safe for clients
}

// OUTPUT:
// duplicate email -> 409 {"detail":"Record already exists"}`],
        [`<p>Performance and tuning:</p><ul><li>Exceptions are costly mostly through stack trace creation; for expected business errors you can override <code>fillInStackTrace</code> or use a no-stacktrace constructor.</li><li>Do not log expected 4xx at ERROR level; use WARN or INFO to keep alerts meaningful.</li><li>Alert on the 5xx rate, not on the 4xx rate.</li></ul>`,
            r`public class BusinessException extends RuntimeException {
    public BusinessException(String msg) {
        super(msg, null, false, false);   // no suppression, no stack trace
    }
}

// OUTPUT:
// throwing this exception is much cheaper than a normal RuntimeException`],
        [`<p>Real-world scenario: a mobile app needs predictable errors.</p><ul><li>All APIs return ProblemDetail with an application <code>code</code> property.</li><li>The app switches on <code>code</code>, not on message text.</li><li>Every response carries the request id.</li><li>Monitoring counts 5xx per endpoint.</li></ul>`,
            r`ProblemDetail pd = ProblemDetail.forStatusAndDetail(
    HttpStatus.UNPROCESSABLE_ENTITY, "Insufficient stock");
pd.setProperty("code", "STOCK_001");
pd.setProperty("requestId", MDC.get("requestId"));
return pd;

// OUTPUT:
// {"status":422,"detail":"Insufficient stock","code":"STOCK_001","requestId":"3f1c9a52"}`]
    ),
    'mvc-production-deployment': dv(
        [`<p>What happens when you run the jar:</p><ul><li><code>JarLauncher</code> reads the nested jar layout and builds a class loader.</li><li>Then <code>SpringApplication.run</code> picks profiles, loads config sources in order (command line, environment, files), and creates the context.</li><li>Auto-configuration starts embedded Tomcat and registers the DispatcherServlet.</li><li>On SIGTERM the shutdown hook runs; with graceful shutdown the web server stops new requests, waits, then closes the context.</li></ul>`,
            r`// property precedence (highest first)
// 1. command line:        --server.port=9000
// 2. environment:         SERVER_PORT=9001
// 3. application-prod.properties
// 4. application.properties

// OUTPUT:
// java -jar app.jar --server.port=9000 -> listens on 9000`],
        [`<p>Deployment options:</p><ul><li><b>Plain jar</b> as a systemd service.</li><li><b>Container</b> on Docker, Kubernetes or a cloud runtime.</li><li><b>WAR</b> into an external Tomcat (extend <code>SpringBootServletInitializer</code>); rarer today.</li><li><b>Buildpacks:</b> <code>mvn spring-boot:build-image</code> creates an image without a Dockerfile.</li></ul>`,
            r`[Unit]
Description=Shop API
After=network.target

[Service]
User=shop
Environment=SPRING_PROFILES_ACTIVE=prod
ExecStart=/usr/bin/java -jar /opt/shop/app.jar
SuccessExitStatus=143
Restart=on-failure

[Install]
WantedBy=multi-user.target

# OUTPUT:
# systemctl start shop -> active (running); stop sends SIGTERM, exit 143 is success`],
        [`<p>Common mistakes:</p><ul><li><b>Dev settings in prod:</b> H2 console, <code>ddl-auto=create</code>, debug logging.</li><li><b>Secrets in the repository:</b> use environment variables.</li><li><b>No memory limit:</b> JVM sized to the host, not the container.</li><li><b>Exposing all actuator endpoints:</b> publish only health, info and metrics, and protect the rest.</li><li><b>Running as root.</b></li></ul>`,
            r`spring.jpa.hibernate.ddl-auto=validate
spring.h2.console.enabled=false
management.endpoints.web.exposure.include=health,info
management.endpoint.env.enabled=false

# OUTPUT:
# schema is only validated, never changed by the app; sensitive endpoints stay hidden`],
        [`<p>Performance and tuning:</p><ul><li>Set heap with <code>-XX:MaxRAMPercentage</code> and leave room for metaspace and threads.</li><li>Use layered jars so image rebuilds are small and fast.</li><li>Consider CDS or AOT to cut startup time.</li><li>Connection pool size should match the database capacity across all instances.</li></ul>`,
            r`FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app
COPY target/extracted/dependencies/ ./
COPY target/extracted/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]

# OUTPUT:
# dependency layer is cached; only the small application layer changes per build`],
        [`<p>Real-world scenario: weekly zero-downtime release of a shop API.</p><ul><li>CI builds, tests and pushes the image.</li><li>Kubernetes does a rolling update with readiness probes.</li><li>Flyway migrations are additive, so old pods still work.</li><li>Rollback is redeploying the previous image tag.</li></ul>`,
            r`# deployment excerpt
readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 8080 }
livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
lifecycle:
  preStop:
    exec: { command: ["sleep", "5"] }

# OUTPUT:
# new pod becomes ready, old pod drains for 5 s then receives SIGTERM`]
    ),
    'mvc-load-balancing': dv(
        [`<p>How balancing works with MVC apps:</p><ul><li>The balancer picks an instance per request (or per connection), by an algorithm.</li><li>Active health checks or failed responses mark an instance down.</li><li>Each instance runs its own Tomcat and DispatcherServlet with no knowledge of the others.</li><li>Shared state (sessions, caches, files) must sit outside the instance.</li></ul>`,
            r`// state that breaks behind a balancer
private final Map<String, Cart> carts = new HashMap<>();   // local memory

// state that works
@Autowired StringRedisTemplate redis;                       // shared store

// OUTPUT:
// local map: request 2 hits another instance and the cart looks empty
// redis: any instance sees the same cart`],
        [`<p>Algorithms and options:</p><ul><li><b>Round robin / weighted:</b> equal or proportional spread.</li><li><b>Least connections:</b> good for uneven request times.</li><li><b>IP or cookie hash:</b> stickiness.</li><li><b>Client-side balancing:</b> Spring Cloud LoadBalancer for service-to-service calls.</li></ul>`,
            r`@Bean
@LoadBalanced
RestClient.Builder restClientBuilder() {
    return RestClient.builder();
}

String body = restClientBuilder.build()
    .get().uri("http://inventory-service/stock/7")
    .retrieve().body(String.class);

// OUTPUT:
// "inventory-service" is resolved to one of its registered instances per call`],
        [`<p>Common mistakes:</p><ul><li><b>Relying on sticky sessions</b> as the only session strategy.</li><li><b>Writing uploads to local disk:</b> other instances cannot read them; use shared storage.</li><li><b>Scheduled jobs on every instance:</b> the job runs N times; use a lock such as ShedLock.</li><li><b>Health check on a slow endpoint</b> that marks healthy nodes as down.</li><li><b>Local caches without invalidation.</b></li></ul>`,
            r`@Scheduled(cron = "0 0 2 * * *")
@SchedulerLock(name = "nightlyReport", lockAtMostFor = "10m")
public void nightlyReport() {
    // only one instance gets the lock and runs this
}

// OUTPUT:
// 3 instances, one execution at 02:00`],
        [`<p>Tuning tips:</p><ul><li>Enable keepalive between balancer and app.</li><li>Use a light health endpoint.</li><li>Set connection draining time longer than your slowest request.</li><li>Keep instance count and database pool size in balance.</li></ul>`,
            r`server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s
server.tomcat.keep-alive-timeout=30s
server.tomcat.max-keep-alive-requests=200

# OUTPUT:
# on SIGTERM the app finishes in-flight requests for up to 30 s before exiting`],
        [`<p>Real-world scenario: sales day traffic is 10 times normal.</p><ul><li>Autoscaler adds instances based on CPU or request rate.</li><li>All instances are stateless; sessions are in Redis.</li><li>Balancer health checks remove a crashed pod within seconds.</li><li>Rate limits at the edge protect the database.</li></ul>`,
            r`# Kubernetes horizontal autoscaler
minReplicas: 3
maxReplicas: 30
metrics:
  - type: Resource
    resource: { name: cpu, target: { type: Utilization, averageUtilization: 65 } }

# OUTPUT:
# traffic rises -> pods scale from 3 toward 30; balancer includes each pod once ready`]
    ),
    'mvc-reverse-proxy': dv(
        [`<p>What the app really sees:</p><ul><li>The TCP connection comes from the proxy, so <code>getRemoteAddr()</code> is the proxy address.</li><li>The scheme is http because TLS ended at the proxy.</li><li>With <code>ForwardedHeaderFilter</code> (framework strategy) the request is wrapped, so <code>getScheme</code>, <code>getServerName</code>, <code>getRemoteAddr</code> and URL building use the forwarded values.</li><li>With the <code>native</code> strategy Tomcat's <code>RemoteIpValve</code> does the same.</li></ul>`,
            r`// headers sent by the proxy
// X-Forwarded-For:   203.0.113.9
// X-Forwarded-Proto: https
// X-Forwarded-Host:  shop.example.com
// X-Forwarded-Prefix: /shop        (framework strategy only)

// OUTPUT:
// request.getRequestURL() -> https://shop.example.com/shop/orders`],
        [`<p>Options:</p><ul><li><b>framework:</b> Spring filter; supports the Forwarded header and X-Forwarded-Prefix.</li><li><b>native:</b> Tomcat valve, configured by <code>server.tomcat.remoteip.*</code> properties.</li><li><b>none:</b> default; headers are ignored (safe if no proxy).</li><li><b>Standard Forwarded header</b> (RFC 7239) is also understood.</li></ul>`,
            r`server.forward-headers-strategy=native
server.tomcat.remoteip.remote-ip-header=x-forwarded-for
server.tomcat.remoteip.protocol-header=x-forwarded-proto
server.tomcat.remoteip.internal-proxies=10\.\d+\.\d+\.\d+

# OUTPUT:
# only requests from 10.x.x.x proxies may set the client address`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Wrong redirect scheme:</b> enable forwarded headers.</li><li><b>Wrong IP in logs and rate limits:</b> same cause.</li><li><b>Trusting spoofed headers:</b> restrict trusted proxies; have the edge overwrite headers.</li><li><b>Cookies not Secure:</b> the app thinks the request is http; fix the scheme first.</li><li><b>Double slashes or lost prefix:</b> trailing slash differences in <code>proxy_pass</code>.</li></ul>`,
            r`# proxy_pass with URI part: /shop/orders -> /orders
location /shop/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header X-Forwarded-Prefix /shop;
}

# OUTPUT:
# app sees /orders, and builds links with the /shop prefix`],
        [`<p>Performance notes:</p><ul><li>Terminate TLS at the proxy to save app CPU.</li><li>Enable gzip or brotli at the proxy.</li><li>Cache public responses (with correct Cache-Control from the app).</li><li>Reuse upstream connections with keepalive.</li></ul>`,
            r`gzip on;
gzip_types application/json text/css application/javascript;
proxy_cache_path /var/cache/nginx keys_zone=api:10m max_size=200m;

location /api/catalog/ {
    proxy_cache api;
    proxy_cache_valid 200 30s;
    proxy_pass http://shop;
}

# OUTPUT:
# repeat catalog requests within 30 s are served from Nginx without reaching Tomcat`],
        [`<p>Real-world scenario: HTTPS site where login redirect goes to http.</p><ul><li>Symptom: after login the browser lands on <code>http://shop.example.com</code>.</li><li>Cause: Nginx did not send X-Forwarded-Proto.</li><li>Fix: add the header and set the forward-headers strategy.</li><li>Check with a debug endpoint.</li></ul>`,
            r`// before fix
// Location: http://shop.example.com/home
// after fix
// Location: https://shop.example.com/home

// OUTPUT:
// redirects keep https and the cookie gets the Secure flag`]
    ),
    'mvc-nginx-plus-spring-mvc': dv(
        [`<p>Request path through Nginx:</p><ul><li>Client opens TLS to Nginx; Nginx decrypts it and matches a <code>location</code>.</li><li>For proxied locations it opens (or reuses) a connection to the upstream and rewrites the request line and headers.</li><li>Tomcat's connector hands it to a worker thread and the DispatcherServlet.</li><li>The response is buffered by Nginx and sent back to the slow client, which frees the Tomcat thread sooner.</li></ul>`,
            r`# buffering protects Tomcat from slow clients
proxy_buffering on;
proxy_buffers 16 16k;
proxy_buffer_size 16k;

# OUTPUT:
# Tomcat writes the full response quickly and its thread is released;
# Nginx trickles the bytes to a slow mobile client`],
        [`<p>Useful variants:</p><ul><li><b>Path routing:</b> <code>/api/</code> to Spring, <code>/</code> to a static front end.</li><li><b>WebSocket:</b> needs the <code>Upgrade</code> and <code>Connection</code> headers.</li><li><b>SSE or streaming:</b> turn buffering off.</li><li><b>Nginx Plus:</b> the commercial edition adds active health checks, a dashboard and more load balancing features.</li></ul>`,
            r`location /ws/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
}
location /events/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_buffering off;
}

# OUTPUT:
# WebSocket handshake returns 101; event stream arrives without delay`],
        [`<p>Common mistakes:</p><ul><li><b>502 Bad Gateway:</b> the app is down or the port is wrong.</li><li><b>504 Gateway Timeout:</b> <code>proxy_read_timeout</code> too short.</li><li><b>413:</b> <code>client_max_body_size</code> too small.</li><li><b>Missing Host header:</b> app sees 127.0.0.1.</li><li><b>Forgetting reload:</b> run <code>nginx -t</code> and then reload.</li></ul>`,
            r`# diagnose
// tail -f /var/log/nginx/error.log
// connect() failed (111: Connection refused) while connecting to upstream

# OUTPUT:
# fix: start the Spring Boot app or correct the upstream port, then retry`],
        [`<p>Tuning:</p><ul><li><code>worker_processes auto</code> and sensible <code>worker_connections</code>.</li><li>Upstream <code>keepalive</code> pool.</li><li>Cache static assets for a long time with hashed file names.</li><li>Rate limit with <code>limit_req</code>.</li><li>Match Nginx timeouts to Tomcat timeouts.</li></ul>`,
            r`upstream shop {
    server 127.0.0.1:8080;
    keepalive 32;
}
location / {
    proxy_pass http://shop;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
}

# OUTPUT:
# upstream connections are reused, lowering latency per request`],
        [`<p>Real-world scenario: moving a Spring MVC site behind Nginx.</p><ul><li>Bind Spring to loopback so only Nginx is reachable.</li><li>Move TLS certificates to Nginx.</li><li>Serve the static folder from Nginx.</li><li>Add forwarded headers and test redirects.</li><li>Reload with zero downtime.</li></ul>`,
            r`// checklist run
// nginx -t                       -> ok
// curl -I http://shop.example.com -> 301 to https
// curl -I https://shop.example.com/login -> 200
// curl http://shop.example.com:8080 -> connection refused (loopback only)

// OUTPUT:
// all four checks pass, so the proxy layout is correct`]
    ),
    'mvc-tomcat-configuration': dv(
        [`<p>How the Tomcat connector handles load:</p><ul><li>The acceptor thread accepts sockets, up to <code>max-connections</code>.</li><li>When more connections arrive and all are in use, the OS-level backlog (<code>accept-count</code>) queues them.</li><li>NIO poller threads watch idle keep-alive sockets cheaply.</li><li>When a request is readable, a worker thread (up to <code>threads.max</code>) runs the filter chain and DispatcherServlet.</li></ul>`,
            r`// capacity summary (defaults)
// threads.max      = 200   concurrent requests being processed
// max-connections  = 8192  open sockets (mostly idle keep-alive)
// accept-count     = 100   waiting queue beyond max-connections

// OUTPUT:
// 200 slow requests occupy all workers; new requests wait, then time out`],
        [`<p>Configuration options by area:</p><ul><li><b>Threads:</b> <code>threads.max</code>, <code>threads.min-spare</code>.</li><li><b>Connections:</b> <code>max-connections</code>, <code>accept-count</code>, <code>keep-alive-timeout</code>.</li><li><b>Limits:</b> <code>max-http-form-post-size</code>, <code>max-swallow-size</code>, <code>max-http-response-header-size</code>.</li><li><b>Logs:</b> <code>accesslog.*</code> with a pattern.</li><li><b>TLS:</b> <code>server.ssl.*</code> if no proxy terminates it.</li><li><b>Compression:</b> <code>server.compression.enabled</code>.</li></ul>`,
            r`server.compression.enabled=true
server.compression.min-response-size=1KB
server.tomcat.max-http-form-post-size=2MB
server.tomcat.accesslog.pattern=%h %l %u %t "%r" %s %b %D

# OUTPUT:
# 203.0.113.9 - - [15/Jan/2025:10:00:01 +0000] "GET /api/orders HTTP/1.1" 200 512 12`],
        [`<p>Common mistakes:</p><ul><li><b>Raising threads to hide slow code:</b> fix the slow query instead.</li><li><b>Pool mismatch:</b> 200 threads and a 10-connection database pool means threads wait on the pool.</li><li><b>Tiny timeouts:</b> legitimate slow clients get cut off.</li><li><b>Accesslog on a container disk:</b> fills the filesystem; log to stdout or rotate.</li><li><b>Wrong property names</b> from older Boot versions (check the current <code>server.tomcat.threads.*</code>).</li></ul>`,
            r`spring.datasource.hikari.maximum-pool-size=30
server.tomcat.threads.max=100

# OUTPUT:
# at most 100 requests in flight; up to 30 of them use the database at once`],
        [`<p>Tuning approach:</p><ul><li>Measure first: busy threads, queue time, p99 latency, with Micrometer.</li><li>Load test with realistic traffic (JMeter, Gatling, k6).</li><li>For blocking I/O workloads try virtual threads on Java 21.</li><li>For very high concurrency of waiting calls consider a reactive stack instead of ever larger pools.</li></ul>`,
            r`spring.threads.virtual.enabled=true

// GET /actuator/metrics/tomcat.threads.busy
// GET /actuator/metrics/http.server.requests

# OUTPUT:
# requests run on virtual threads; the platform thread cap no longer limits blocking calls`],
        [`<p>Real-world scenario: latency spikes at peak time.</p><ul><li>Metrics show busy threads at the maximum and requests queuing.</li><li>A thread dump shows most threads waiting for the database pool.</li><li>Fix: add an index to the slow query and size the pool; scale out one instance.</li><li>Threads were not the problem, the downstream was.</li></ul>`,
            r`// jstack output excerpt
// "http-nio-8080-exec-41" WAITING
//    at com.zaxxer.hikari.pool.HikariPool.getConnection

// OUTPUT:
// many exec threads waiting on getConnection: pool exhaustion, not Tomcat sizing`]
    ),
    'mvc-spring-mvc-architecture': dv(
        [`<p>Inside the request cycle:</p><ul><li>The servlet container (Tomcat) calls <code>DispatcherServlet.service</code>, which reaches <code>doDispatch</code>.</li><li><code>getHandler</code> asks each <code>HandlerMapping</code> for a match and returns a chain with interceptors.</li><li><code>getHandlerAdapter</code> picks the adapter; <code>RequestMappingHandlerAdapter</code> uses argument resolvers and return value handlers.</li><li>Return values are rendered through a <code>ViewResolver</code> or an <code>HttpMessageConverter</code>.</li><li>Exceptions go to the resolver chain; <code>afterCompletion</code> always runs.</li></ul>`,
            r`// simplified doDispatch
HandlerExecutionChain chain = getHandler(request);
HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
if (!chain.applyPreHandle(request, response)) return;
ModelAndView mv = ha.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
processDispatchResult(request, response, chain, mv, null);

// OUTPUT:
// order: mapping, adapter, preHandle, handler, postHandle, render, afterCompletion`],
        [`<p>Controller variants and the extension points:</p><ul><li><b>@Controller</b> with views vs <b>@RestController</b> with bodies.</li><li><b>Argument resolvers:</b> <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code>, <code>@ModelAttribute</code>.</li><li><b>Binding and validation:</b> <code>@Valid</code> with Bean Validation.</li><li><b>Extension:</b> <code>WebMvcConfigurer</code> to add interceptors, converters, CORS and resolvers.</li></ul>`,
            r`@Configuration
class MvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins("https://shop.example.com");
    }
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("home");
    }
}

// OUTPUT:
// GET / renders view home without a controller class; CORS allowed for the API`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>@Controller returning a String</b> when JSON was intended: the String is treated as a view name; use <code>@RestController</code> or <code>@ResponseBody</code>.</li><li><b>Business logic in controllers:</b> move it to services.</li><li><b>Missing @Valid:</b> constraints are not checked.</li><li><b>Ambiguous mappings:</b> two methods for one path and verb fail at startup.</li><li><b>Entities exposed directly:</b> use DTOs.</li></ul>`,
            r`@Controller
class Wrong {
    @GetMapping("/status")
    String status() { return "ok"; }       // looks for a view named ok -> 404
}

@RestController
class Right {
    @GetMapping("/status")
    String status() { return "ok"; }       // body is ok
}

// OUTPUT:
// Wrong: 404 (view "ok" not found)
// Right: 200 ok`],
        [`<p>Performance notes:</p><ul><li>Mapping lookup is precomputed at startup, so it is fast per request.</li><li>Keep controllers thin; work happens in services.</li><li>Use pagination and DTO projections.</li><li>Compression and ETags reduce payload cost.</li><li>Async return types (<code>Callable</code>, <code>DeferredResult</code>, <code>CompletableFuture</code>) free container threads for long calls.</li></ul>`,
            r`@GetMapping("/report")
Callable<String> report() {
    return () -> {                   // runs on an MVC async executor
        Thread.sleep(2000);
        return "done";
    };
}

// OUTPUT:
// the Tomcat thread is released at once; response sent after 2 s`],
        [`<p>Real-world scenario: layered shop application.</p><ul><li>Controller: parse, validate, call a service, map to a DTO.</li><li>Service: business rules and transactions.</li><li>Repository: data access.</li><li>Advice: errors. Interceptor: logging and auth checks.</li></ul>`,
            r`@RestController
@RequestMapping("/api/orders")
class OrderController {
    private final OrderService service;
    OrderController(OrderService service) { this.service = service; }

    @PostMapping
    ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrder req) {
        OrderDto dto = service.create(req);
        return ResponseEntity.created(URI.create("/api/orders/" + dto.id())).body(dto);
    }
}

// OUTPUT:
// POST /api/orders -> 201 Created, Location: /api/orders/17`]
    ),
    'mvc-dispatcherservlet-interview': dv(
        [`<p>Key facts for the interview:</p><ul><li>It extends <code>FrameworkServlet</code> and then <code>HttpServlet</code>; each request enters <code>doService</code> and <code>doDispatch</code>.</li><li>On startup <code>onRefresh</code> calls <code>initStrategies</code>, which loads the mapping, adapter, resolver, locale, theme and multipart beans.</li><li>Request attributes (web application context, locale resolver) are exposed during processing.</li><li>Multipart requests are wrapped first; the wrapper is cleaned up at the end.</li></ul>`,
            r`protected void initStrategies(ApplicationContext context) {
    initMultipartResolver(context);
    initLocaleResolver(context);
    initHandlerMappings(context);
    initHandlerAdapters(context);
    initHandlerExceptionResolvers(context);
    initViewResolvers(context);
    initFlashMapManager(context);
}

// OUTPUT:
// these strategy beans are looked up once at startup and reused for every request`],
        [`<p>Configuration variants:</p><ul><li><b>Boot:</b> auto-configured; tune with <code>spring.mvc.*</code>.</li><li><b>Java config:</b> <code>AbstractAnnotationConfigDispatcherServletInitializer</code> for non-Boot apps.</li><li><b>web.xml:</b> classic declaration with a servlet-mapping.</li><li><b>Multiple servlets:</b> a <code>ServletRegistrationBean</code> for an extra DispatcherServlet.</li></ul>`,
            r`public class AppInit
        extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() { return new Class[] { RootConfig.class }; }
    protected Class<?>[] getServletConfigClasses() { return new Class[] { WebConfig.class }; }
    protected String[] getServletMappings() { return new String[] { "/" }; }
}

// OUTPUT:
// DispatcherServlet mapped to / with a root context and a web context`],
        [`<p>Typical interview traps:</p><ul><li><b>Filter vs interceptor</b> ordering: filters run before the DispatcherServlet.</li><li><b>postHandle not called</b> when the handler throws; <code>afterCompletion</code> still runs.</li><li><b>Mapping to / vs /*</b>: <code>/</code> keeps static resources and JSP handling working; <code>/*</code> captures everything.</li><li><b>Static resources</b> go through a resource handler registered by Boot.</li><li><b>Singleton controllers:</b> one instance serves all threads, so keep it stateless.</li></ul>`,
            r`@RestController
class Counter {
    private int hits;                       // BUG: shared mutable state
    @GetMapping("/hit")
    int hit() { return ++hits; }            // not thread safe
}

// OUTPUT:
// concurrent requests can lose updates; keep state in services or use atomics`],
        [`<p>Performance points:</p><ul><li>Handler lookup uses a prebuilt registry, with direct URL matches checked first.</li><li>Argument resolvers are cached per method.</li><li>The interceptor chain is cheap, but expensive code in <code>preHandle</code> hits every request.</li><li>Use async handling for long calls.</li></ul>`,
            r`logging.level.org.springframework.web=DEBUG
spring.mvc.log-request-details=false

# OUTPUT:
# debug lines show the mapped handler and the resolved arguments
# keep DEBUG off in production (cost and sensitive data)`],
        [`<p>Sample answer to "explain the request flow":</p><ul><li>Tomcat passes the request to the DispatcherServlet.</li><li>HandlerMapping returns the handler and its interceptors.</li><li>HandlerAdapter invokes the controller method.</li><li>The controller returns a view name or data.</li><li>ViewResolver and View render HTML, or a message converter writes JSON.</li><li>The response goes back to the client.</li></ul>`,
            r`// one-line memory aid
// Request -> DispatcherServlet -> HandlerMapping -> HandlerAdapter
//         -> Controller -> ViewResolver / MessageConverter -> Response

// OUTPUT:
// interviewer follow-up: where do filters and exception resolvers fit? (before / around)`]
    )
};
