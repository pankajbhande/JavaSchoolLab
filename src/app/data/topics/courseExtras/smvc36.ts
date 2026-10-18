// Spring extras, batch smvc36 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc36Extras: Record<string, Extra> = {
    'mvc-request-logging': x(
        ['<b>Request logging</b> records what came in: method, URI, query string, selected headers, client address and optionally the body, so you can trace and debug traffic.',
            '<b>Where</b>: a servlet <code>Filter</code> (sees everything, including errors before MVC) or a <code>HandlerInterceptor</code> (sees only requests mapped to a handler).',
            '<b>Quick start</b>: register <code>CommonsRequestLoggingFilter</code> and set the logger <code>org.springframework.web.filter.CommonsRequestLoggingFilter</code> to DEBUG.'],
        ['<b>OncePerRequestFilter</b> guarantees one execution per request, even across forwards and error dispatches.',
            '<b>Body caching</b>: the request stream can be read only once, so wrap the request in <code>ContentCachingRequestWrapper</code> and read the cached bytes after the chain runs.',
            '<b>Selective logging</b>: log headers and URI always, but body only for small payloads and never for sensitive paths.'],
        ['<b>Never log secrets</b>: mask <code>Authorization</code>, cookies, passwords and card numbers before writing a line.',
            '<b>Size limit</b>: cap the logged payload (for example 1000 characters) and skip multipart and binary content types.',
            '<b>Order</b>: register the filter with a high precedence so it sees requests before security rejects them, but after the correlation id filter.'],
        [['F', 'What is request logging?', 'Writing the details of each incoming HTTP request (method, path, headers, sometimes body) to the log for debugging and auditing.'],
            ['F', 'Which Spring class logs requests out of the box?', 'CommonsRequestLoggingFilter, enabled by registering it as a bean and setting its logger to DEBUG.'],
            ['M', 'Why wrap the request in ContentCachingRequestWrapper?', 'The servlet input stream can be read once; the wrapper copies the bytes so both the controller and the logger can use them.'],
            ['M', 'Filter or interceptor for request logging?', 'A filter sees all requests including those rejected before MVC; an interceptor only sees handler-mapped requests but has access to the handler.'],
            ['S', 'How do you avoid logging sensitive data?', 'Whitelist headers, mask known fields, skip sensitive paths and cap the body length.'],
            ['S', 'What is the cost of body logging?', 'Extra memory for the cached bytes and extra I/O per request, so enable it only for debugging or small payloads.']],
        [['Built-in filter bean.',
            r`@Configuration
public class LoggingConfig {
    @Bean
    CommonsRequestLoggingFilter requestLogger() {
        var f = new CommonsRequestLoggingFilter();
        f.setIncludeQueryString(true);
        f.setIncludeClientInfo(true);
        f.setIncludePayload(true);
        f.setMaxPayloadLength(500);
        return f;
    }
}
// application.properties
// logging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=DEBUG

// OUTPUT:
// DEBUG ...CommonsRequestLoggingFilter : Before request
//   [POST /api/orders?src=web, client=127.0.0.1, payload={"item":"pen","qty":2}]`],
            ['Custom filter.',
                r`@Component
public class RequestLogFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestLogFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        log.info("--> {} {}", req.getMethod(), req.getRequestURI());
        chain.doFilter(req, res);
    }
}

// OUTPUT:
// INFO  RequestLogFilter : --> GET /api/users/7`]],
        [['Log the body safely.',
            r`var wrapped = new ContentCachingRequestWrapper(req);
chain.doFilter(wrapped, res);                 // controller reads the body here
byte[] body = wrapped.getContentAsByteArray(); // available after the chain
String text = new String(body, 0, Math.min(body.length, 500), UTF_8);
log.debug("body={}", text);

// OUTPUT:
// DEBUG RequestLogFilter : body={"item":"pen","qty":2}`],
            ['Test that the filter logs.',
                r`@WebMvcTest(UserController.class)
@Import(RequestLogFilter.class)
@ExtendWith(OutputCaptureExtension.class)
class RequestLogFilterTest {
    @Autowired MockMvc mvc;

    @Test
    void logsMethodAndPath(CapturedOutput out) throws Exception {
        mvc.perform(get("/api/users/7")).andExpect(status().isOk());
        assertThat(out).contains("--> GET /api/users/7");
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-response-logging': x(
        ['<b>Response logging</b> records the status code, selected headers, body size and optionally the body that the application sent back to the client.',
            '<b>Why wrapping</b>: the response body is written straight to the output stream, so you wrap it in <code>ContentCachingResponseWrapper</code> to keep a copy.',
            '<b>Key call</b>: after logging, you must call <code>copyBodyToResponse()</code>, otherwise the client receives an empty body.'],
        ['<b>Order of work</b>: call <code>chain.doFilter</code> first, then read <code>getContentAsByteArray()</code>, log, and finally copy the body back.',
            '<b>Status and timing</b>: log <code>getStatus()</code> together with the duration so one line tells the whole story of the exchange.',
            '<b>ResponseBodyAdvice</b> is an alternative that sees the controller return value before conversion, but it does not see error pages or static resources.'],
        ['<b>Streaming</b>: wrappers buffer everything in memory, so skip large downloads, SSE and file streaming endpoints.',
            '<b>Content type</b>: log text and JSON bodies only; for binary content log just the length.',
            '<b>Compression and ETag</b>: body wrapping can interact with filters that write the response, so keep the order explicit.'],
        [['F', 'What is response logging?', 'Logging the HTTP status, headers and sometimes the body that the server returns.'],
            ['F', 'Why is the response body hard to log?', 'It is written directly to the output stream and cannot be read back, unless it is cached by a wrapper.'],
            ['M', 'What does ContentCachingResponseWrapper do?', 'It buffers the written body so you can read it, and you must call copyBodyToResponse to send it to the client.'],
            ['M', 'What happens if you forget copyBodyToResponse?', 'The client gets the correct headers but an empty body.'],
            ['S', 'When do you avoid body logging?', 'For large, streamed or binary responses and for responses containing personal data.'],
            ['S', 'Filter or ResponseBodyAdvice?', 'A filter sees the final bytes and the status including errors; ResponseBodyAdvice sees the object before serialization but only for controller results.']],
        [['Response logging filter.',
            r`@Component
public class ResponseLogFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(ResponseLogFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        var wrapped = new ContentCachingResponseWrapper(res);
        try {
            chain.doFilter(req, wrapped);
        } finally {
            log.info("<-- {} {} status={} bytes={}", req.getMethod(),
                req.getRequestURI(), wrapped.getStatus(),
                wrapped.getContentSize());
            wrapped.copyBodyToResponse();      // never forget this
        }
    }
}

// OUTPUT:
// INFO  ResponseLogFilter : <-- GET /api/users/7 status=200 bytes=42`],
            ['Log the body for JSON only.',
                r`String type = wrapped.getContentType();
if (type != null && type.startsWith("application/json")) {
    byte[] b = wrapped.getContentAsByteArray();
    log.debug("response body={}", new String(b, 0, Math.min(b.length, 500), UTF_8));
}
wrapped.copyBodyToResponse();

// OUTPUT:
// DEBUG ResponseLogFilter : response body={"id":7,"name":"Abaji"}`]],
        [['Missing copyBodyToResponse.',
            r`// WRONG
chain.doFilter(req, wrapped);
log.info("status={}", wrapped.getStatus());
// the method ends: client receives 200 with Content-Length 0

// RIGHT
chain.doFilter(req, wrapped);
log.info("status={}", wrapped.getStatus());
wrapped.copyBodyToResponse();

// OUTPUT:
// WRONG: curl shows an empty body
// RIGHT: curl shows {"id":7,"name":"Abaji"}`],
            ['MockMvc test.',
                r`@Test
void bodyStillReachesClient() throws Exception {
    mvc.perform(get("/api/users/7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Abaji"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-exception-logging': x(
        ['<b>Exception logging</b> means recording failures with enough context (request, user, correlation id, stack trace) to find the cause, without logging the same error many times.',
            '<b>Central place</b>: a <code>@RestControllerAdvice</code> with <code>@ExceptionHandler</code> methods is the single point where controller exceptions are logged and converted to responses.',
            '<b>Log levels</b>: expected client errors (400, 404) are WARN or INFO without a stack trace; unexpected server errors (500) are ERROR with the full stack trace.'],
        ['<b>Log once</b>: log in the handler, not in every layer, and do not log and rethrow, or the same stack trace appears three times.',
            '<b>Pass the exception last</b>: <code>log.error("msg {}", id, ex)</code> prints the stack trace because the last argument is a Throwable.',
            '<b>Catch-all</b>: a handler for <code>Exception.class</code> prevents leaking stack traces to the client and guarantees the failure is logged.'],
        ['<b>No internals to clients</b>: return a <code>ProblemDetail</code> with a safe message and the correlation id, keep the stack trace in the log.',
            '<b>Filter exceptions</b>: errors thrown in filters never reach <code>@ControllerAdvice</code>, so they need their own logging or the error page path.',
            '<b>Alerting</b>: ERROR logs feed alerts, so keep that level for real defects only.'],
        [['F', 'Where do you log exceptions in Spring MVC?', 'In a @RestControllerAdvice class with @ExceptionHandler methods.'],
            ['F', 'How do you print a stack trace with SLF4J?', 'Pass the exception as the last argument: log.error("message", ex).'],
            ['M', 'Why not log and rethrow in every layer?', 'It produces duplicate stack traces for one failure and makes logs noisy and misleading.'],
            ['M', 'Which level for a 404 caused by a missing id?', 'WARN or INFO without a stack trace, since it is an expected client error.'],
            ['S', 'Why can an advice not log filter exceptions?', 'Filters run outside the DispatcherServlet, so exception handlers of MVC are never consulted.'],
            ['S', 'How do you link a client error report to a log entry?', 'Return the correlation id in the error body and write it to every log line through MDC.']],
        [['Central handler with levels.',
            r`@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(UserNotFoundException.class)
    ProblemDetail notFound(UserNotFoundException ex) {
        log.warn("not found: {}", ex.getMessage());          // no stack trace
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception ex) {
        log.error("unexpected failure", ex);                  // full stack trace
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "Internal error");
    }
}

// OUTPUT:
// WARN  ApiExceptionHandler : not found: user 99
// ERROR ApiExceptionHandler : unexpected failure
// java.lang.IllegalStateException: db down
//     at com.example.UserService.load(UserService.java:31)`],
            ['Add request context.',
                r`@ExceptionHandler(Exception.class)
ProblemDetail unexpected(Exception ex, HttpServletRequest req) {
    log.error("failed {} {} user={}", req.getMethod(), req.getRequestURI(),
        req.getRemoteUser(), ex);
    return ProblemDetail.forStatus(500);
}

// OUTPUT:
// ERROR ApiExceptionHandler : failed POST /api/orders user=abaji`]],
        [['Duplicate logging anti-pattern.',
            r`// WRONG: logged in service, controller and advice
try { repo.save(o); }
catch (DataAccessException e) {
    log.error("save failed", e);
    throw e;                       // advice logs it again
}

// RIGHT: let it propagate, log once in the advice
repo.save(o);

// OUTPUT:
// WRONG: three identical stack traces per failure
// RIGHT: one stack trace`],
            ['Test the handler.',
                r`@WebMvcTest(UserController.class)
class ErrorLoggingTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test
    void returns404AndLogsWarn() throws Exception {
        when(service.find(99L)).thenThrow(new UserNotFoundException("user 99"));
        mvc.perform(get("/api/users/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("user 99"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-correlation-id': x(
        ['<b>Correlation id</b> is a unique value (often a UUID) attached to a request so every log line, across all classes and services, can be tied to that one request.',
            '<b>Header</b>: clients or gateways send it, commonly as <code>X-Correlation-Id</code> or <code>X-Request-Id</code>; if it is missing, the server generates one.',
            '<b>Flow</b>: a filter reads or creates the id, puts it into <code>MDC</code>, adds it to the response header and removes it in a <code>finally</code> block.'],
        ['<b>Log pattern</b>: include <code>%X{correlationId}</code> in the logback pattern so each line prints the id without any code in the business classes.',
            '<b>Propagation</b>: copy the id into outgoing calls (<code>RestClient</code>, <code>WebClient</code>, messages) so the next service logs the same id.',
            '<b>Response</b>: return the id in a response header and in error bodies so support can ask the user for it.'],
        ['<b>Validation</b>: accept only a safe format and length from the client, otherwise log injection and huge values are possible.',
            '<b>Early filter</b>: give the filter the highest precedence so even security failures carry the id.',
            '<b>Tracing</b>: with Micrometer Tracing the trace id plays this role and is placed in MDC automatically; a manual id is still useful for simple apps.'],
        [['F', 'What is a correlation id?', 'A unique identifier added to a request so all log lines of that request can be found together.'],
            ['F', 'Where is it usually created?', 'In a servlet filter at the start of the request, unless the client already sent one.'],
            ['M', 'How does it appear in every log line?', 'The filter stores it in MDC and the logback pattern prints it with %X{correlationId}.'],
            ['M', 'Why remove it in finally?', 'Server threads are reused, so a leftover id would show up on the next unrelated request.'],
            ['S', 'How do you carry it to another microservice?', 'Add the header in an outgoing request interceptor, reading the value from MDC.'],
            ['S', 'How does it relate to distributed tracing?', 'A trace id is a standardised, automatically propagated correlation id; Micrometer Tracing writes it into MDC.']],
        [['Correlation filter.',
            r`@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {
    static final String HEADER = "X-Correlation-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        String id = req.getHeader(HEADER);
        if (id == null || !id.matches("[A-Za-z0-9-]{8,64}")) {
            id = UUID.randomUUID().toString();
        }
        MDC.put("correlationId", id);
        res.setHeader(HEADER, id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.remove("correlationId");
        }
    }
}

// OUTPUT:
// HTTP/1.1 200
// X-Correlation-Id: 6b1c2f6e-...-9a (varies)`],
            ['Print it in logs.',
                r`# application.properties
logging.pattern.console=%d{HH:mm:ss}
%-5level [%X{correlationId}] %logger{20}
- %msg%n

# OUTPUT:
# 10:15:02 INFO  [6b1c2f6e-77a1] c.e.OrderService - order created
# 10:15:02 INFO  [6b1c2f6e-77a1] c.e.PayClient - calling payment`]],
        [['Propagate to a downstream service.',
            r`@Bean
RestClient restClient(RestClient.Builder builder) {
    return builder
        .requestInterceptor((req, body, exec) -> {
            String id = MDC.get("correlationId");
            if (id != null) req.getHeaders().add("X-Correlation-Id", id);
            return exec.execute(req, body);
        })
        .build();
}

// OUTPUT:
// outgoing GET http://payment/charge
//   X-Correlation-Id: 6b1c2f6e-77a1`],
            ['Test the header.',
                r`@WebMvcTest(UserController.class)
@Import(CorrelationIdFilter.class)
class CorrelationIdTest {
    @Autowired MockMvc mvc;

    @Test
    void echoesGivenId() throws Exception {
        mvc.perform(get("/api/users/7").header("X-Correlation-Id", "abc-12345678"))
            .andExpect(header().string("X-Correlation-Id", "abc-12345678"));
    }

    @Test
    void generatesWhenMissing() throws Exception {
        mvc.perform(get("/api/users/7"))
            .andExpect(header().exists("X-Correlation-Id"));
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]]
    ),

    'mvc-mdc': x(
        ['<b>MDC</b> (Mapped Diagnostic Context) is a per-thread map of key-value pairs offered by SLF4J; the logging framework can print these values on every log line.',
            '<b>API</b>: <code>MDC.put("user", "abaji")</code> adds a value, <code>MDC.get</code> reads it, <code>MDC.remove</code> and <code>MDC.clear</code> delete it.',
            '<b>Use</b>: set request-wide data (correlation id, user, tenant) once in a filter and print it with <code>%X{key}</code> in the log pattern.'],
        ['<b>ThreadLocal</b>: MDC is stored per thread, so a value set in the request thread is visible to every class that runs on that thread.',
            '<b>Always clean up</b>: servlet containers reuse threads, so remove keys in a <code>finally</code> block, or values leak into later requests.',
            '<b>Try-with-resources</b>: <code>MDC.putCloseable(key, value)</code> removes the key automatically at the end of the block.'],
        ['<b>Async boundary</b>: a new thread (<code>@Async</code>, executors, CompletableFuture) does not inherit the map, so copy it with a <code>TaskDecorator</code>.',
            '<b>Virtual threads and reactive code</b>: ThreadLocal assumptions break in reactive pipelines, which use Reactor context instead of MDC.',
            '<b>JSON logs</b>: structured logging prints MDC entries as separate JSON fields, which makes them searchable.'],
        [['F', 'What is MDC?', 'A thread-bound map in SLF4J whose values can be included in each log line.'],
            ['F', 'How do you print an MDC value?', 'Use %X{key} in the logback pattern.'],
            ['M', 'Why clear MDC at the end of a request?', 'Container threads are pooled, so stale values would appear on later requests.'],
            ['M', 'Does MDC work in an @Async method?', 'Not automatically, because the new thread has its own empty map; use a TaskDecorator to copy it.'],
            ['S', 'How does MDC store its data?', 'In a ThreadLocal map held by the logging backend adapter (for example the Logback MDC adapter).'],
            ['S', 'What replaces MDC in reactive applications?', 'The Reactor Context, with bridging such as Micrometer context propagation to fill MDC when logging.']],
        [['Set and clear MDC.',
            r`public void handle(String user) {
    MDC.put("user", user);
    try {
        log.info("processing");
        service.run();
    } finally {
        MDC.clear();                       // always clean up
    }
}
// logging.pattern.console=%-5level [%X{user}] %msg%n

// OUTPUT:
// INFO  [abaji] processing
// INFO  [abaji] order saved`],
            ['Closeable form.',
                r`try (MDC.MDCCloseable c = MDC.putCloseable("tenant", "acme")) {
    log.info("loading data");
}
log.info("after block");

// OUTPUT:
// INFO  [acme] loading data
// INFO  [] after block`]],
        [['Propagate MDC to async threads.',
            r`@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    ThreadPoolTaskExecutor taskExecutor() {
        var ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(4);
        ex.setTaskDecorator(runnable -> {
            Map<String, String> ctx = MDC.getCopyOfContextMap();   // request thread
            return () -> {
                if (ctx != null) MDC.setContextMap(ctx);
                try { runnable.run(); } finally { MDC.clear(); }
            };
        });
        ex.initialize();
        return ex;
    }
}

// OUTPUT:
// INFO  [6b1c2f6e] http-nio-8080-exec-1 : request received
// INFO  [6b1c2f6e] task-1 : async work done`],
            ['Test the MDC value.',
                r`@Test
void mdcIsClearedAfterRequest() throws Exception {
    mvc.perform(get("/api/users/7").header("X-Correlation-Id", "abc-12345678"));
    assertThat(MDC.get("correlationId")).isNull();
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-performance-logging': x(
        ['<b>Performance logging</b> measures how long each request takes and logs it, so slow endpoints can be found before users complain.',
            '<b>Simple tool</b>: a <code>HandlerInterceptor</code> stores the start time in <code>preHandle</code> and logs the elapsed time in <code>afterCompletion</code>.',
            '<b>Output</b>: one line per request with method, path, status and milliseconds, for example <code>GET /api/users 200 12ms</code>.'],
        ['<b>Clock</b>: use <code>System.nanoTime()</code> or Spring <code>StopWatch</code>, not wall-clock time, because nanoTime is monotonic.',
            '<b>Request attribute</b>: keep the start time in <code>request.setAttribute</code>, never in a field of the singleton interceptor.',
            '<b>Threshold</b>: log everything at DEBUG and slow requests (above a limit such as 500 ms) at WARN so the slow ones stand out.'],
        ['<b>afterCompletion</b> always runs, even after an exception, while <code>postHandle</code> is skipped on errors, so the timing belongs in afterCompletion.',
            '<b>Filter vs interceptor</b>: a filter also measures security and serialization time; an interceptor measures mostly handler time.',
            '<b>Metrics instead of logs</b>: Micrometer timers give percentiles and dashboards, logs give the individual slow cases; use both.'],
        [['F', 'How can you log request duration in Spring MVC?', 'Record the start time in a HandlerInterceptor preHandle and log the difference in afterCompletion.'],
            ['F', 'Which clock should you use?', 'System.nanoTime, because it is monotonic and not affected by clock changes.'],
            ['M', 'Why afterCompletion and not postHandle?', 'afterCompletion runs even when the handler throws, and the response status is final there.'],
            ['M', 'Where do you keep the start time?', 'In a request attribute, because the interceptor is a shared singleton and fields would mix requests.'],
            ['S', 'How is a filter timing different?', 'It covers the whole chain including other filters, security and view rendering.'],
            ['S', 'Why also use Micrometer?', 'It aggregates timings into percentiles and exports them to monitoring, while log lines are hard to aggregate.']],
        [['Timing interceptor.',
            r`@Component
public class TimingInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger(TimingInterceptor.class);
    private static final String START = "startNanos";

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
            Object handler) {
        req.setAttribute(START, System.nanoTime());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
            Object handler, Exception ex) {
        long ms = (System.nanoTime() - (long) req.getAttribute(START)) / 1_000_000;
        if (ms > 500) log.warn("SLOW {} {} {} {}ms", req.getMethod(),
            req.getRequestURI(), res.getStatus(), ms);
        else log.debug("{} {} {} {}ms", req.getMethod(),
            req.getRequestURI(), res.getStatus(), ms);
    }
}

// OUTPUT: (varies)
// DEBUG TimingInterceptor : GET /api/users 200 12ms
// WARN  TimingInterceptor : SLOW GET /api/report 200 1840ms`],
            ['Register it.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final TimingInterceptor timing;
    public WebConfig(TimingInterceptor timing) { this.timing = timing; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timing).addPathPatterns("/api/**");
    }
}

// OUTPUT:
// only /api/** requests are timed`]],
        [['Time a method with StopWatch.',
            r`StopWatch sw = new StopWatch("report");
sw.start("query");
List<Row> rows = repo.load();
sw.stop();
sw.start("render");
String html = renderer.render(rows);
sw.stop();
log.info(sw.prettyPrint());

// OUTPUT: (varies)
// StopWatch 'report': 0.231 seconds
//   ms     %     Task name
//   180   78%   query
//   51    22%   render`],
            ['Test with MockMvc.',
                r`@WebMvcTest(UserController.class)
@Import({TimingInterceptor.class, WebConfig.class})
class TimingTest {
    @Autowired MockMvc mvc;

    @Test
    void requestStillSucceeds() throws Exception {
        mvc.perform(get("/api/users")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-actuator-integration': x(
        ['<b>Spring Boot Actuator</b> adds production-ready endpoints (health, metrics, loggers, info, env) to an application; you add it with <code>spring-boot-starter-actuator</code>.',
            '<b>Exposure</b>: over HTTP only <code>health</code> is exposed by default; others are enabled with <code>management.endpoints.web.exposure.include</code>.',
            '<b>Base path</b>: endpoints live under <code>/actuator</code>, for example <code>/actuator/health</code> and <code>/actuator/metrics</code>.'],
        ['<b>Loggers endpoint</b>: <code>/actuator/loggers</code> lists levels and a POST changes a logger level at runtime without a restart.',
            '<b>Separate port</b>: <code>management.server.port</code> moves the endpoints to another port, which can be firewalled from the public.',
            '<b>Info</b>: <code>/actuator/info</code> shows build and git details when the build plugin and properties provide them.'],
        ['<b>Security</b>: expose only what you need, and protect the rest with Spring Security, because <code>env</code> and <code>heapdump</code> can reveal secrets.',
            '<b>Custom endpoint</b>: annotate a bean with <code>@Endpoint</code> and its methods with <code>@ReadOperation</code> or <code>@WriteOperation</code>.',
            '<b>Integration with MVC</b>: web endpoints are served by the same DispatcherServlet through a dedicated handler mapping, so filters and interceptors can apply.'],
        [['F', 'What is Spring Boot Actuator?', 'A module that provides operational endpoints such as health, metrics and loggers for monitoring and managing an app.'],
            ['F', 'Which dependency adds it?', 'spring-boot-starter-actuator.'],
            ['M', 'How do you expose more endpoints over HTTP?', 'Set management.endpoints.web.exposure.include, for example to health,info,metrics,loggers.'],
            ['M', 'How do you change a log level at runtime?', 'POST to /actuator/loggers/{name} with a body that contains configuredLevel.'],
            ['S', 'How do you secure actuator endpoints?', 'Use Spring Security with EndpointRequest matchers, a separate management port and minimal exposure.'],
            ['S', 'How do you create a custom endpoint?', 'Declare a component with @Endpoint(id = "x") and read or write operations.']],
        [['Enable endpoints.',
            r`# application.properties
management.endpoints.web.exposure.include=health,info,metrics,loggers
management.endpoint.health.show-details=when-authorized

// OUTPUT:
// GET /actuator -> {"_links":{"health":{...},"info":{...},"metrics":{...},"loggers":{...}}}`],
            ['Change a log level live.',
                r`# request
curl -X POST localhost:8080/actuator/loggers/com.example.orders ^
  -H "Content-Type: application/json" ^
  -d "{\"configuredLevel\":\"DEBUG\"}"

# OUTPUT:
# HTTP/1.1 204 No Content
# (com.example.orders now logs at DEBUG until restart or reset with null)`]],
        [['Custom endpoint.',
            r`@Component
@Endpoint(id = "features")
public class FeaturesEndpoint {
    private final Map<String, Boolean> flags = new ConcurrentHashMap<>(
        Map.of("newCheckout", true));

    @ReadOperation
    public Map<String, Boolean> all() { return flags; }

    @WriteOperation
    public void set(String name, boolean enabled) { flags.put(name, enabled); }
}

// OUTPUT:
// GET /actuator/features -> {"newCheckout":true}`],
            ['Secure it.',
                r`@Bean
SecurityFilterChain actuatorChain(HttpSecurity http) throws Exception {
    http.securityMatcher(EndpointRequest.toAnyEndpoint())
        .authorizeHttpRequests(a -> a
            .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
            .anyRequest().hasRole("OPS"))
        .httpBasic(Customizer.withDefaults());
    return http.build();
}

// OUTPUT:
// GET /actuator/health  -> 200 (public)
// GET /actuator/metrics -> 401 without OPS credentials`]]
    ),

    'mvc-health-monitoring': x(
        ['<b>Health monitoring</b> reports whether the application and its dependencies (database, disk, message broker) work; Actuator exposes it at <code>/actuator/health</code>.',
            '<b>Status</b>: the overall status is <code>UP</code>, <code>DOWN</code>, <code>OUT_OF_SERVICE</code> or <code>UNKNOWN</code>; DOWN maps to HTTP 503.',
            '<b>HealthIndicator</b>: a bean implementing this interface adds your own check, such as calling a payment service.'],
        ['<b>Details</b>: <code>management.endpoint.health.show-details</code> controls whether component details are shown; keep it restricted in production.',
            '<b>Probes</b>: <code>/actuator/health/liveness</code> and <code>/actuator/health/readiness</code> serve Kubernetes probes when enabled.',
            '<b>Groups</b>: health groups let you decide which indicators make up readiness (for example the database) and which do not.'],
        ['<b>Cheap checks</b>: a slow indicator makes every probe slow and can restart healthy pods; use timeouts and keep the check light.',
            '<b>Liveness vs readiness</b>: liveness says the process should be restarted, readiness says it should receive traffic; do not put external dependencies in liveness.',
            '<b>Reactive</b>: use <code>ReactiveHealthIndicator</code> in WebFlux, and the health contributor naming comes from the bean name.'],
        [['F', 'What does /actuator/health return?', 'The overall status such as UP or DOWN, and optionally details of each component.'],
            ['F', 'What HTTP status does a DOWN health give?', '503 Service Unavailable.'],
            ['M', 'How do you add a custom health check?', 'Implement HealthIndicator and return Health.up() or Health.down() with details.'],
            ['M', 'Liveness versus readiness?', 'Liveness decides if the app must be restarted; readiness decides if it can receive traffic.'],
            ['S', 'Why keep external systems out of liveness?', 'A failing dependency would restart every instance and make an outage worse.'],
            ['S', 'How do you test an indicator?', 'Unit test the health() method directly, or use @SpringBootTest with MockMvc on /actuator/health.']],
        [['Custom indicator.',
            r`@Component
public class PaymentHealthIndicator implements HealthIndicator {
    private final PaymentClient client;
    public PaymentHealthIndicator(PaymentClient client) { this.client = client; }

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
// GET /actuator/health ->
// {"status":"UP","components":{"payment":{"status":"UP","details":{"latencyMs":18}}}}`],
            ['Configuration.',
                r`# application.properties
management.endpoint.health.show-details=always
management.endpoint.health.probes.enabled=true
management.endpoint.health.group.readiness.include=readinessState,db

# OUTPUT:
# GET /actuator/health/readiness -> {"status":"UP"}
# GET /actuator/health/liveness  -> {"status":"UP"}`]],
        [['Unit test an indicator.',
            r`@Test
void downWhenPingFails() {
    PaymentClient client = mock(PaymentClient.class);
    when(client.ping()).thenThrow(new IllegalStateException("timeout"));
    Health h = new PaymentHealthIndicator(client).health();
    assertThat(h.getStatus()).isEqualTo(Status.DOWN);
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Integration test.',
                r`@SpringBootTest
@AutoConfigureMockMvc
class HealthEndpointTest {
    @Autowired MockMvc mvc;

    @Test
    void healthIsUp() throws Exception {
        mvc.perform(get("/actuator/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-metrics': x(
        ['<b>Metrics</b> are numeric measurements of a running application (request count, latency, memory, pool usage); Spring Boot uses <b>Micrometer</b> as the facade, much like SLF4J for logging.',
            '<b>MeterRegistry</b> is the central bean; you create meters from it: <code>Counter</code> (only goes up), <code>Gauge</code> (current value) and <code>Timer</code> (duration and count).',
            '<b>Automatic</b>: with Actuator, MVC requests are recorded as <code>http.server.requests</code>, and JVM, CPU and datasource metrics are added too.'],
        ['<b>Browse</b>: <code>/actuator/metrics</code> lists names and <code>/actuator/metrics/http.server.requests</code> shows count, total time and max.',
            '<b>Tags</b>: dimensions such as <code>uri</code>, <code>method</code> and <code>status</code> let you filter and group one metric.',
            '<b>Export</b>: add a registry dependency (for example Prometheus) and expose <code>/actuator/prometheus</code> for scraping.'],
        ['<b>Cardinality</b>: never tag with unbounded values (user id, raw URL); each unique tag set creates a new time series and can exhaust memory.',
            '<b>Percentiles</b>: enable histograms or publish percentiles on timers to see p95 and p99, which averages hide.',
            '<b>Annotations</b>: <code>@Timed</code> on a controller or method works when a <code>TimedAspect</code> bean is registered; MVC requests are timed automatically.'],
        [['F', 'What is Micrometer?', 'A metrics facade used by Spring Boot that records measurements and exports them to monitoring systems.'],
            ['F', 'Name the basic meter types.', 'Counter, Gauge and Timer, plus DistributionSummary.'],
            ['M', 'Which metric records MVC requests?', 'http.server.requests, tagged with uri, method, status and outcome.'],
            ['M', 'How do you count business events?', 'Inject MeterRegistry and call registry.counter("orders.created").increment().'],
            ['S', 'What is high cardinality and why is it bad?', 'Tags with many unique values create many time series, which uses memory and overloads the monitoring backend.'],
            ['S', 'Why use percentiles instead of the average?', 'Averages hide slow outliers; p95 and p99 show what the slowest users experience.']],
        [['Custom counter and timer.',
            r`@Service
public class OrderService {
    private final Counter created;
    private final Timer saveTimer;

    public OrderService(MeterRegistry registry) {
        this.created = Counter.builder("orders.created")
            .tag("channel", "web").register(registry);
        this.saveTimer = Timer.builder("orders.save.time").register(registry);
    }

    public void create(Order o) {
        saveTimer.record(() -> repository.save(o));
        created.increment();
    }
}

// OUTPUT:
// GET /actuator/metrics/orders.created ->
// {"name":"orders.created","measurements":[{"statistic":"COUNT","value":3.0}]}`],
            ['Enable Prometheus.',
                r`# pom.xml: micrometer-registry-prometheus
# application.properties
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.distribution.percentiles-histogram.http.server.requests=true

# OUTPUT:
# GET /actuator/prometheus ->
# http_server_requests_seconds_count{method="GET",status="200",uri="/api/users"}
42.0`]],
        [['Gauge for a live value.',
            r`@Component
public class QueueMetrics {
    public QueueMetrics(MeterRegistry registry, BlockingQueue<Job> queue) {
        Gauge.builder("jobs.queue.size", queue, BlockingQueue::size)
            .register(registry);
    }
}

// OUTPUT:
// GET /actuator/metrics/jobs.queue.size -> VALUE 7.0 (varies)`],
            ['Test a counter.',
                r`@Test
void countsCreatedOrders() {
    var registry = new SimpleMeterRegistry();
    var service = new OrderService(registry, mock(OrderRepository.class));
    service.create(new Order());
    assertThat(registry.get("orders.created").counter().count()).isEqualTo(1.0);
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-custom-handlermapping': x(
        ['<b>HandlerMapping</b> is the DispatcherServlet strategy that finds the handler (and its interceptors) for a request; the result is a <code>HandlerExecutionChain</code>.',
            '<b>Defaults</b>: <code>RequestMappingHandlerMapping</code> handles <code>@RequestMapping</code> controllers; others handle simple URL mappings, bean names and static resources.',
            '<b>Custom</b>: you write your own by implementing <code>HandlerMapping</code> or extending <code>AbstractHandlerMapping</code>, and register it as a bean.'],
        ['<b>Order</b>: the DispatcherServlet asks each mapping in order and the first non-null result wins, so set a suitable <code>setOrder(...)</code> value.',
            '<b>Adapter needed</b>: whatever handler object you return needs a <code>HandlerAdapter</code> that supports it, for example <code>HttpRequestHandlerAdapter</code> for <code>HttpRequestHandler</code>.',
            '<b>Return null</b> when the mapping does not apply, so the next mapping gets a chance.'],
        ['<b>Rarely needed</b>: most needs (versioning, header or host matching) are solved with <code>@RequestMapping</code> conditions or <code>RequestCondition</code>, not a new mapping.',
            '<b>Extension point</b>: for custom matching on annotated controllers, subclass <code>RequestMappingHandlerMapping</code> and override <code>getCustomTypeCondition</code> or <code>getCustomMethodCondition</code>.',
            '<b>Registering</b>: define the bean with a lower order value than the default mappings if it must take priority.'],
        [['F', 'What does a HandlerMapping do?', 'It maps an incoming request to a handler object plus its interceptors.'],
            ['F', 'Which mapping serves @RequestMapping methods?', 'RequestMappingHandlerMapping.'],
            ['M', 'What does getHandler return?', 'A HandlerExecutionChain with the handler and its interceptors, or null if there is no match.'],
            ['M', 'How is mapping order decided?', 'By the Ordered value; the lowest order is asked first and the first non-null answer wins.'],
            ['S', 'Why is a HandlerAdapter also needed?', 'The DispatcherServlet does not know how to call arbitrary handler types; an adapter that supports the type invokes it.'],
            ['S', 'When would you customize RequestMappingHandlerMapping instead of writing a new mapping?', 'When you still want annotated controllers but need extra matching rules such as an API version condition.']],
        [['Minimal custom mapping.',
            r`public class LegacyHandlerMapping extends AbstractHandlerMapping {
    private final HttpRequestHandler legacy;

    public LegacyHandlerMapping(HttpRequestHandler legacy) {
        this.legacy = legacy;
        setOrder(0);                               // ask before the defaults
    }

    @Override
    protected Object getHandlerInternal(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/legacy/") ? legacy : null;   // null = not mine
    }
}

// OUTPUT:
// /legacy/report -> handled by the HttpRequestHandler
// /api/users     -> null here, next mapping answers`],
            ['Register it with a handler.',
                r`@Configuration
public class MappingConfig {
    @Bean
    HttpRequestHandler legacyHandler() {
        return (req, res) -> {
            res.setContentType("text/plain");
            res.getWriter().write("legacy ok");
        };
    }

    @Bean
    LegacyHandlerMapping legacyMapping(HttpRequestHandler legacyHandler) {
        return new LegacyHandlerMapping(legacyHandler);
    }
}

// OUTPUT:
// GET /legacy/report -> 200 legacy ok`]],
        [['Add an interceptor to the chain.',
            r`LegacyHandlerMapping m = new LegacyHandlerMapping(legacy);
m.setInterceptors(new TimingInterceptor());   // part of the execution chain

// OUTPUT:
// the interceptor wraps every request that this mapping resolves`],
            ['Test it.',
                r`@SpringBootTest
@AutoConfigureMockMvc
class LegacyMappingTest {
    @Autowired MockMvc mvc;

    @Test
    void legacyPathUsesCustomMapping() throws Exception {
        mvc.perform(get("/legacy/report"))
            .andExpect(status().isOk())
            .andExpect(content().string("legacy ok"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    )
};

export const smvc36Deep: Record<string, Deep> = {
    'mvc-request-logging': dv(
        [`<p>How a logged request travels:</p><ul><li><b>Container:</b> Tomcat builds <code>HttpServletRequest</code> and runs the filter chain.</li><li><b>Filter:</b> <code>OncePerRequestFilter</code> checks a request attribute so it runs once per request.</li><li><b>Wrapper:</b> <code>ContentCachingRequestWrapper</code> fills its byte buffer only while the downstream code reads the stream.</li><li><b>Consequence:</b> the cached body is empty before <code>chain.doFilter</code>, so log after the chain.</li><li><b>Interceptor:</b> <code>preHandle</code> runs after the handler is chosen by <code>HandlerMapping</code>, so unmapped requests never reach it.</li></ul>`,
            r`protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
        FilterChain chain) throws ServletException, IOException {
    var wrapped = new ContentCachingRequestWrapper(req, 2048);
    log.debug("before: cached={}", wrapped.getContentAsByteArray().length);
    chain.doFilter(wrapped, res);
    log.debug("after: cached={}", wrapped.getContentAsByteArray().length);
}

// OUTPUT:
// DEBUG before: cached=0
// DEBUG after: cached=27`],
        [`<p>Options for request logging:</p><ul><li><b>CommonsRequestLoggingFilter:</b> setters for query string, headers, payload, client info, prefixes and suffixes.</li><li><b>Custom filter:</b> full control over masking and format.</li><li><b>HandlerInterceptor:</b> access to the handler method for logging the controller name.</li><li><b>Tomcat access log:</b> <code>server.tomcat.accesslog.enabled=true</code> gives one line per request without code.</li><li><b>Spring Boot 3.x HTTP exchanges:</b> <code>HttpExchangeRepository</code> with Actuator records recent exchanges in memory.</li></ul>`,
            r`# application.properties
server.tomcat.accesslog.enabled=true
server.tomcat.accesslog.pattern=%h %t "%r" %s %b %D
server.tomcat.basedir=logs

# OUTPUT:
# 127.0.0.1 [08/Oct/2026:10:15:02 +0000] "GET /api/users HTTP/1.1" 200 312 14`],
        [`<p>Typical mistakes:</p><ul><li><b>Logging passwords:</b> mask fields and skip login paths.</li><li><b>Reading the body in the filter:</b> the controller then gets an empty stream; use the caching wrapper.</li><li><b>Logging the cached body before the chain:</b> it is empty.</li><li><b>Logging multipart uploads:</b> huge memory use; skip by content type.</li><li><b>INFO level for everything:</b> use DEBUG for bodies.</li></ul>`,
            r`static final Set<String> SENSITIVE = Set.of("authorization", "cookie");

static String safeHeaders(HttpServletRequest req) {
    return Collections.list(req.getHeaderNames()).stream()
        .map(n -> n + "=" + (SENSITIVE.contains(n.toLowerCase()) ? "***" : req.getHeader(n)))
        .collect(Collectors.joining(", "));
}

// OUTPUT:
// headers: host=localhost:8080, authorization=***, accept=application/json`],
        [`<p>Performance and tuning:</p><ul><li><b>Cost:</b> the wrapper copies the body, so memory grows with payload size; set a cache limit.</li><li><b>Async logging:</b> use an async appender so disk I/O does not block request threads.</li><li><b>Guards:</b> check <code>log.isDebugEnabled()</code> before building large strings.</li><li><b>Sampling:</b> log bodies for a small percentage of requests in production.</li></ul>`,
            r`if (log.isDebugEnabled() && sampled(req)) {
    byte[] b = wrapped.getContentAsByteArray();
    log.debug("body={}", new String(b, 0, Math.min(b.length, 500), UTF_8));
}

// logback-spring.xml: <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">

// OUTPUT:
// body logged for about 1 request in 100 (varies)`],
        [`<p>Scenario: support receives a complaint that an order was rejected. With request logging plus a correlation id, the team searches the log by id and sees the exact payload and path.</p><ul><li><b>Step 1:</b> user gives the id from the error response.</li><li><b>Step 2:</b> search logs for that id.</li><li><b>Step 3:</b> compare the logged request body with the validation rules.</li></ul>`,
            r`// log search result
// 10:15:02 INFO  [6b1c2f6e] --> POST /api/orders
// 10:15:02 DEBUG [6b1c2f6e] body={"item":"pen","qty":-2}
// 10:15:02 WARN  [6b1c2f6e] validation failed: qty must be positive
// 10:15:02 INFO  [6b1c2f6e] <-- 400

// OUTPUT:
// root cause found: the client sent a negative quantity`]
    ),

    'mvc-response-logging': dv(
        [`<p>How the response wrapper works:</p><ul><li><b>Buffering:</b> <code>ContentCachingResponseWrapper</code> returns a stream that writes into a <code>FastByteArrayOutputStream</code> instead of the socket.</li><li><b>Headers:</b> it also holds back content length, so headers are not committed early.</li><li><b>Copy:</b> <code>copyBodyToResponse()</code> sets the content length and writes the buffered bytes to the real response.</li><li><b>Status:</b> <code>getStatus()</code> is valid after the chain, including error codes set by <code>sendError</code>.</li></ul>`,
            r`var wrapped = new ContentCachingResponseWrapper(res);
chain.doFilter(req, wrapped);
System.out.println("buffered=" + wrapped.getContentSize()
    + " committed=" + res.isCommitted());
wrapped.copyBodyToResponse();
System.out.println("committed=" + res.isCommitted());

// OUTPUT:
// buffered=42 committed=false
// committed=true`],
        [`<p>Variants:</p><ul><li><b>Filter with wrapper:</b> sees final bytes and status.</li><li><b>ResponseBodyAdvice:</b> sees the controller object before the message converter; good for logging a DTO.</li><li><b>Interceptor afterCompletion:</b> gives the status but not the body.</li><li><b>Header logging:</b> <code>res.getHeaderNames()</code> works without a wrapper.</li></ul>`,
            r`@RestControllerAdvice
public class BodyLogAdvice implements ResponseBodyAdvice<Object> {
    private static final Logger log = LoggerFactory.getLogger(BodyLogAdvice.class);

    @Override
    public boolean supports(MethodParameter p, Class<? extends HttpMessageConverter<?>> c) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter p, MediaType t,
            Class<? extends HttpMessageConverter<?>> c,
            ServerHttpRequest req, ServerHttpResponse res) {
        log.debug("returning {}", body);
        return body;
    }
}

// OUTPUT:
// DEBUG BodyLogAdvice : returning User[id=7, name=Abaji]`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Missing copyBodyToResponse:</b> empty body for the client; put it in <code>finally</code>.</li><li><b>Wrapping streaming endpoints:</b> SSE and downloads stall or use huge memory; skip them with <code>shouldNotFilter</code>.</li><li><b>Logging errors twice:</b> the advice and the filter both log; keep one.</li><li><b>Reading bytes as the wrong charset:</b> use the response character encoding.</li></ul>`,
            r`@Override
protected boolean shouldNotFilter(HttpServletRequest req) {
    String p = req.getRequestURI();
    return p.startsWith("/downloads/") || p.startsWith("/actuator/")
        || "text/event-stream".equals(req.getHeader("Accept"));
}

// OUTPUT:
// downloads, actuator and SSE requests bypass the response logger`],
        [`<p>Performance:</p><ul><li><b>Memory:</b> the whole body lives in memory until copied; this doubles peak usage for large responses.</li><li><b>Latency:</b> clients cannot start receiving data until the controller finishes.</li><li><b>Mitigation:</b> log only the size and status in production, and the body in test environments.</li></ul>`,
            r`log.info("<-- {} {} {} {}B {}ms", method, uri, status, size, ms);

// OUTPUT:
// INFO  <-- GET /api/users 200 1830B 14ms`],
        [`<p>Scenario: a partner says the API returned wrong data last night. Response logging with size and status for every call, plus bodies in a short-retention debug index, lets you compare what was sent with what the partner reports.</p>`,
            r`// 22:41:09 INFO  [c-81f2] <-- GET /api/prices 200 9120B 31ms
// 22:41:09 DEBUG [c-81f2] response body={"items":[{"sku":"A1","price":0}]}

// OUTPUT:
// the price 0 is visible in the logged body, so the bug is in the pricing service`]
    ),

    'mvc-exception-logging': dv(
        [`<p>Exception flow in MVC:</p><ul><li><b>Throw:</b> the controller throws and <code>DispatcherServlet</code> catches it in <code>processHandlerException</code>.</li><li><b>Resolvers:</b> <code>HandlerExceptionResolver</code> beans are asked in order: <code>ExceptionHandlerExceptionResolver</code> (your advice), <code>ResponseStatusExceptionResolver</code>, <code>DefaultHandlerExceptionResolver</code>.</li><li><b>Unresolved:</b> the exception propagates to the container, which forwards to <code>/error</code> (<code>BasicErrorController</code>).</li><li><b>Interceptor:</b> <code>afterCompletion</code> still receives the exception.</li></ul>`,
            r`@Override
public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
        Object handler, Exception ex) {
    if (ex != null) log.debug("exception reached afterCompletion: {}", ex.toString());
}

// OUTPUT:
// DEBUG exception reached afterCompletion: java.lang.IllegalStateException: db down`],
        [`<p>Options:</p><ul><li><b>@ExceptionHandler per class:</b> local to one controller.</li><li><b>@RestControllerAdvice:</b> global, can be limited by package or annotation.</li><li><b>ResponseEntityExceptionHandler:</b> base class that handles standard MVC exceptions and returns <code>ProblemDetail</code>.</li><li><b>@ResponseStatus:</b> maps an exception class to a status.</li><li><b>Logger args:</b> markers and structured arguments for searchable fields.</li></ul>`,
            r`@RestControllerAdvice
public class GlobalHandler extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalHandler.class);

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        log.warn("MVC exception {}: {}", status.value(), ex.getMessage());
        return super.handleExceptionInternal(ex, body, headers, status, request);
    }
}

// OUTPUT:
// WARN  GlobalHandler : MVC exception 405: Request method POST is not supported`],
        [`<p>Mistakes:</p><ul><li><b>Swallowing:</b> <code>catch (Exception e) {}</code> hides failures; log or rethrow.</li><li><b>e.printStackTrace():</b> bypasses the log format and levels.</li><li><b>Message only:</b> <code>log.error(e.getMessage())</code> loses the stack trace.</li><li><b>String concatenation:</b> use placeholders.</li><li><b>Leaking details:</b> return a safe message to clients.</li></ul>`,
            r`// WRONG
log.error("failed: " + e.getMessage());     // no stack trace
// RIGHT
log.error("failed for order {}", orderId, e);  // placeholder plus stack trace

// OUTPUT:
// WRONG: ERROR failed: null
// RIGHT: ERROR failed for order 15 + full stack trace`],
        [`<p>Performance and noise control:</p><ul><li><b>Stack traces cost:</b> filling a trace is expensive; do not log full traces for expected 4xx errors.</li><li><b>Flooding:</b> a failing dependency can write thousands of identical traces; use rate limiting or a logging filter.</li><li><b>Custom exceptions:</b> override <code>fillInStackTrace</code> only for control-flow exceptions you never log.</li></ul>`,
            r`public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String m) { super(m, null, false, false); }
    // writableStackTrace=false: cheaper to create, no trace to print
}

// OUTPUT:
// cheap expected-error exception without a stack trace`],
        [`<p>Scenario: at 02:00 the nightly import fails with a 500. The handler logs one ERROR with the stack trace and the correlation id; the client also receives that id in a <code>ProblemDetail</code> property, and the on-call engineer finds the line with one search.</p>`,
            r`// response body
// {"type":"about:blank","title":"Internal Server Error","status":500,
//  "detail":"Internal error","correlationId":"6b1c2f6e-77a1"}

// OUTPUT:
// search 6b1c2f6e-77a1 in logs -> one ERROR line with the stack trace`]
    ),

    'mvc-correlation-id': dv(
        [`<p>Mechanics:</p><ul><li><b>Entry:</b> the filter reads the header or generates a UUID.</li><li><b>MDC:</b> the value is stored in the thread-local map of the logging backend.</li><li><b>Output:</b> the log encoder reads the map for each event and prints <code>%X{correlationId}</code>.</li><li><b>Exit:</b> the response header is set and the key is removed in <code>finally</code>.</li><li><b>Boot 3 tracing:</b> with Micrometer Tracing, <code>traceId</code> and <code>spanId</code> are placed in MDC for you.</li></ul>`,
            r`String id = Optional.ofNullable(req.getHeader("X-Correlation-Id"))
    .filter(v -> v.matches("[A-Za-z0-9-]{8,64}"))
    .orElseGet(() -> UUID.randomUUID().toString());
MDC.put("correlationId", id);

// OUTPUT:
// incoming header "abc-12345678" accepted; invalid header replaced by a new UUID`],
        [`<p>Variants:</p><ul><li><b>Header names:</b> <code>X-Correlation-Id</code>, <code>X-Request-Id</code>, W3C <code>traceparent</code>.</li><li><b>Generators:</b> UUID, ULID or short random strings.</li><li><b>Error bodies:</b> include the id as a <code>ProblemDetail</code> property.</li><li><b>Async and messaging:</b> copy to message headers.</li></ul>`,
            r`@ExceptionHandler(Exception.class)
ProblemDetail unexpected(Exception ex) {
    log.error("unexpected failure", ex);
    ProblemDetail pd = ProblemDetail.forStatus(500);
    pd.setProperty("correlationId", MDC.get("correlationId"));
    return pd;
}

// OUTPUT:
// {"status":500,"correlationId":"6b1c2f6e-77a1"}`],
        [`<p>Mistakes:</p><ul><li><b>No cleanup:</b> the id leaks to the next request on the same thread.</li><li><b>Trusting input:</b> unvalidated headers allow log forging with newlines.</li><li><b>Wrong order:</b> a security filter running first rejects the request without an id.</li><li><b>Not propagated:</b> downstream services create new ids and the trail breaks.</li></ul>`,
            r`// WRONG: header taken as is, may contain "\n INFO fake line"
MDC.put("correlationId", req.getHeader("X-Correlation-Id"));
// RIGHT: validate with a pattern, else generate

// OUTPUT:
// WRONG: forged log line possible
// RIGHT: only [A-Za-z0-9-]{8,64} accepted`],
        [`<p>Performance:</p><ul><li><b>Cost:</b> an MDC put and remove is a few map operations, negligible.</li><li><b>UUID generation:</b> <code>UUID.randomUUID()</code> uses a secure random; fine at normal rates, use a faster generator at extreme volume.</li><li><b>Log size:</b> a 36 character id on each line adds storage; shorten if needed.</li></ul>`,
            r`String shortId = UUID.randomUUID().toString().substring(0, 8);

// OUTPUT:
// 6b1c2f6e (varies)`],
        [`<p>Scenario: a checkout call passes through the gateway, the order service and the payment service. All three print the same id, so one search shows the full path and which hop was slow.</p>`,
            r`// gateway : [6b1c2f6e] POST /checkout
// orders  : [6b1c2f6e] creating order
// payment : [6b1c2f6e] charge timeout after 3000ms

// OUTPUT:
// the failing hop is the payment service`]
    ),

    'mvc-mdc': dv(
        [`<p>Internals:</p><ul><li><b>Facade:</b> <code>org.slf4j.MDC</code> delegates to an <code>MDCAdapter</code> supplied by the backend.</li><li><b>Logback:</b> <code>LogbackMDCAdapter</code> keeps a map per thread and copies it into each <code>ILoggingEvent</code> when the event is created.</li><li><b>Printing:</b> the layout pattern <code>%X{key}</code> reads from that event map.</li><li><b>Thread pool effect:</b> the map belongs to the thread, not the request.</li></ul>`,
            r`MDC.put("a", "1");
Map<String, String> copy = MDC.getCopyOfContextMap();
Thread t = new Thread(() -> System.out.println("child sees: " + MDC.get("a")));
t.start();
t.join();
System.out.println("copy has: " + copy);

// OUTPUT:
// child sees: null
// copy has: {a=1}`],
        [`<p>API and options:</p><ul><li><b>put / get / remove / clear:</b> basic operations.</li><li><b>putCloseable:</b> scoped value.</li><li><b>getCopyOfContextMap / setContextMap:</b> transfer between threads.</li><li><b>Pattern:</b> <code>%X</code> prints the whole map, <code>%X{key:-default}</code> adds a default.</li><li><b>JSON:</b> Spring Boot 3.4 and later supports structured logging formats that include MDC, and Logstash encoders do the same.</li></ul>`,
            r`# application.properties
logging.pattern.console=%d{HH:mm:ss}
%-5level [%X{user:-anon}] %msg%n

# OUTPUT:
# 10:15:02 INFO  [anon] application started
# 10:15:03 INFO  [abaji] order saved`],
        [`<p>Mistakes:</p><ul><li><b>Forgetting remove:</b> pooled threads reuse stale values.</li><li><b>Assuming async propagation:</b> new threads start empty.</li><li><b>Storing objects:</b> values are strings only.</li><li><b>Clearing too early:</b> <code>MDC.clear()</code> in a nested method removes the outer filter values.</li></ul>`,
            r`// WRONG: inner service wipes everything the filter put in
void inner() { MDC.clear(); }

// RIGHT: remove only your own key
void inner() {
    MDC.put("step", "inner");
    try { work(); } finally { MDC.remove("step"); }
}

// OUTPUT:
// WRONG: later lines lose correlationId
// RIGHT: correlationId stays on every line`],
        [`<p>Performance:</p><ul><li><b>Cheap:</b> map operations per request; Logback copies the map per event only if the event is enabled.</li><li><b>Copy cost:</b> <code>getCopyOfContextMap</code> allocates a new map; avoid in tight loops.</li><li><b>Keep it small:</b> five to ten keys is typical.</li></ul>`,
            r`long t = System.nanoTime();
for (int i = 0; i < 1_000_000; i++) {
    MDC.put("k", "v");
    MDC.remove("k");
}
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=60`],
        [`<p>Scenario: a multi-tenant system sets <code>tenant</code> and <code>user</code> in a filter after authentication, so every line from services and repositories carries them; support filters logs by tenant to debug one customer.</p>`,
            r`// 10:20:11 INFO  [acme/abaji] c.e.InvoiceService - invoice 55 generated
// 10:20:12 WARN  [acme/abaji] c.e.TaxClient - slow response 2100ms

// OUTPUT:
// logs filtered by tenant acme show only that customer activity`]
    ),

    'mvc-performance-logging': dv(
        [`<p>Where time goes in a request:</p><ul><li><b>Filters:</b> security, encoding, logging.</li><li><b>Mapping:</b> <code>HandlerMapping</code> lookup.</li><li><b>preHandle:</b> interceptors before the handler.</li><li><b>Handler:</b> argument resolving, controller body, return value handling.</li><li><b>Conversion:</b> message converter writes JSON or a view renders HTML.</li><li><b>afterCompletion:</b> interceptors, in reverse order, always.</li></ul><p>An interceptor therefore sees most of the time, a filter sees all of it.</p>`,
            r`// order of calls for one request
// filter.before
//   interceptor.preHandle
//     controller
//   interceptor.postHandle
//   (view or JSON rendering)
//   interceptor.afterCompletion
// filter.after

// OUTPUT:
// timing in afterCompletion includes rendering; timing in postHandle does not`],
        [`<p>Ways to measure:</p><ul><li><b>Interceptor:</b> per request, path based.</li><li><b>Filter:</b> includes everything.</li><li><b>AOP:</b> <code>@Around</code> advice on services to time business methods.</li><li><b>@Timed and Micrometer:</b> metrics with percentiles.</li><li><b>Server-Timing header:</b> sends the duration to the browser dev tools.</li></ul>`,
            r`@Aspect
@Component
public class TimingAspect {
    private static final Logger log = LoggerFactory.getLogger(TimingAspect.class);

    @Around("execution(* com.example.service..*(..))")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long t = System.nanoTime();
        try {
            return pjp.proceed();
        } finally {
            log.debug("{} took {}ms", pjp.getSignature().toShortString(),
                (System.nanoTime() - t) / 1_000_000);
        }
    }
}

// OUTPUT: (varies)
// DEBUG TimingAspect : OrderService.create(..) took 23ms`],
        [`<p>Mistakes:</p><ul><li><b>Field for start time:</b> shared singleton, concurrent requests overwrite it.</li><li><b>postHandle only:</b> skipped when the handler throws.</li><li><b>Wall clock:</b> <code>currentTimeMillis</code> can jump.</li><li><b>Ignoring async:</b> for <code>Callable</code> or <code>DeferredResult</code> the first <code>preHandle</code> returns early and a second dispatch follows.</li></ul>`,
            r`// WRONG
private long start;                       // shared by all requests
public boolean preHandle(...) {
    start = System.nanoTime();
    return true;
}

// RIGHT
req.setAttribute("startNanos", System.nanoTime());

// OUTPUT:
// WRONG: two parallel requests report the same wrong time
// RIGHT: each request keeps its own start`],
        [`<p>Tuning:</p><ul><li><b>Overhead:</b> two nanoTime calls and one log line, tiny.</li><li><b>Thresholds:</b> log only slow requests at WARN to cut volume.</li><li><b>Slow causes:</b> N+1 queries, remote calls, large payloads, GC pauses.</li><li><b>Next step:</b> once a slow path is known, use a profiler or tracing to find the cause.</li></ul>`,
            r`# application.properties
logging.level.com.example.web.TimingInterceptor=INFO
spring.jpa.properties.hibernate.generate_statistics=true

# OUTPUT:
# WARN  TimingInterceptor : SLOW GET /api/report 200 1840ms
# INFO  StatisticsLogger  : 52 JDBC statements executed (N+1 suspected)`],
        [`<p>Scenario: the team sets a 500 ms budget. A WARN line shows <code>/api/report</code> at 1840 ms; statistics reveal 52 queries for one request, a join fetch cuts it to 2 queries and 90 ms.</p>`,
            r`@Query("select o from Order o join fetch o.items where o.customer.id = :id")
List<Order> findWithItems(@Param("id") Long id);

// OUTPUT:
// before: SLOW GET /api/report 200 1840ms
// after : DEBUG GET /api/report 200 90ms`]
    ),

    'mvc-actuator-integration': dv(
        [`<p>How Actuator plugs into MVC:</p><ul><li><b>Auto-configuration:</b> <code>WebMvcEndpointManagementContextConfiguration</code> creates a <code>WebMvcEndpointHandlerMapping</code>.</li><li><b>Mapping:</b> that mapping resolves paths under <code>/actuator</code> to endpoint operations, ahead of the regular controllers.</li><li><b>Endpoint beans:</b> <code>@Endpoint</code> classes are discovered and their operations become web operations.</li><li><b>Technology neutral:</b> the same endpoint can also be exposed over JMX.</li></ul>`,
            r`@Autowired ApplicationContext ctx;

void show() {
    ctx.getBeansOfType(HandlerMapping.class).forEach((n, m) ->
        System.out.println(n + " -> " + m.getClass().getSimpleName()));
}

// OUTPUT: (varies)
// requestMappingHandlerMapping -> RequestMappingHandlerMapping
// webEndpointServletHandlerMapping -> WebMvcEndpointHandlerMapping
// viewControllerHandlerMapping -> EmptyHandlerMapping`],
        [`<p>Configuration choices:</p><ul><li><b>include / exclude:</b> pick endpoints by id, or <code>*</code> for all.</li><li><b>enabled per endpoint:</b> <code>management.endpoint.X.enabled</code>.</li><li><b>base-path:</b> change <code>/actuator</code> to something else.</li><li><b>server.port and address:</b> bind to localhost or an internal port.</li><li><b>Info contributors:</b> build, git, env and java details.</li></ul>`,
            r`# application.properties
management.endpoints.web.base-path=/ops
management.endpoints.web.exposure.include=health,info,metrics,loggers
management.server.port=9090
management.server.address=127.0.0.1
management.info.env.enabled=true
info.app.name=orders-service

# OUTPUT:
# GET http://127.0.0.1:9090/ops/info -> {"app":{"name":"orders-service"}}`],
        [`<p>Mistakes:</p><ul><li><b>include=*</b> in production: exposes env, heapdump and more.</li><li><b>Unsecured:</b> anyone can change log levels.</li><li><b>Blocked by security:</b> the default Spring Security chain returns 401 for actuator paths.</li><li><b>Wrong path:</b> forgetting the base path after changing it.</li></ul>`,
            r`# WRONG
management.endpoints.web.exposure.include=*

# RIGHT
management.endpoints.web.exposure.include=health,info,metrics
management.endpoints.web.exposure.exclude=env,heapdump

# OUTPUT:
# GET /actuator/env -> 404 (not exposed)`],
        [`<p>Performance and operations:</p><ul><li><b>Cost:</b> endpoints are idle until called, but health checks run on a schedule from probes.</li><li><b>Metrics scrape interval:</b> 15 to 60 seconds is common.</li><li><b>Heavy endpoints:</b> <code>heapdump</code> and <code>threaddump</code> pause or burden the JVM; restrict them.</li><li><b>Separate port:</b> isolates probe traffic from user traffic.</li></ul>`,
            r`# application.properties
management.endpoint.health.cache.time-to-live=10s

# OUTPUT:
# repeated health calls within 10s reuse the cached result`],
        [`<p>Scenario: during an incident the team raises one package to DEBUG through <code>/actuator/loggers</code>, reproduces the problem, then resets it to null, all without a restart.</p>`,
            r`# raise
curl -X POST localhost:9090/ops/loggers/com.example.orders -H "Content-Type: application/json" -d "{\"configuredLevel\":\"DEBUG\"}"
# reset
curl -X POST localhost:9090/ops/loggers/com.example.orders -H "Content-Type: application/json" -d "{\"configuredLevel\":null}"

# OUTPUT:
# 204 No Content, 204 No Content`]
    ),

    'mvc-health-monitoring': dv(
        [`<p>How health is computed:</p><ul><li><b>Contributors:</b> every <code>HealthIndicator</code> bean becomes a contributor named from the bean name (without the suffix).</li><li><b>Aggregator:</b> <code>SimpleStatusAggregator</code> picks the worst status by order DOWN, OUT_OF_SERVICE, UP, UNKNOWN.</li><li><b>Mapping:</b> <code>HttpCodeStatusMapper</code> turns DOWN and OUT_OF_SERVICE into 503.</li><li><b>Auto-configured indicators:</b> db, diskSpace, ping and others when their classes exist.</li></ul>`,
            r`@Component("inventory")
public class InventoryHealth implements HealthIndicator {
    public Health health() { return Health.up().build(); }
}

// OUTPUT:
// GET /actuator/health -> {"status":"UP","components":{"inventory":{"status":"UP"},
//   "diskSpace":{"status":"UP"},"ping":{"status":"UP"}}}`],
        [`<p>Variants:</p><ul><li><b>AbstractHealthIndicator:</b> override <code>doHealthCheck</code> and exceptions become DOWN automatically.</li><li><b>CompositeHealthContributor:</b> group nested checks.</li><li><b>Custom status:</b> <code>management.endpoint.health.status.order</code>.</li><li><b>Availability states:</b> <code>ApplicationAvailability</code> and <code>AvailabilityChangeEvent</code> change readiness programmatically.</li></ul>`,
            r`@Component
public class WarmupListener {
    private final ApplicationEventPublisher publisher;
    public WarmupListener(ApplicationEventPublisher p) { this.publisher = p; }

    public void markBusy() {
        AvailabilityChangeEvent.publish(publisher, this,
            ReadinessState.REFUSING_TRAFFIC);
    }
}

// OUTPUT:
// GET /actuator/health/readiness -> 503 {"status":"OUT_OF_SERVICE"}`],
        [`<p>Mistakes:</p><ul><li><b>Slow indicator:</b> a remote call without timeout blocks the probe.</li><li><b>Dependencies in liveness:</b> a database outage restarts all pods.</li><li><b>Details always shown:</b> leaks host names and versions.</li><li><b>Swallowing exceptions:</b> returning UP on error hides problems.</li></ul>`,
            r`// WRONG: no timeout, always UP
public Health health() {
    try { client.ping(); } catch (Exception e) {}
    return Health.up().build();
}

// RIGHT: bounded call, DOWN on failure with the cause
public Health health() {
    try {
        client.pingWithTimeout(Duration.ofSeconds(1));
        return Health.up().build();
    }
    catch (Exception e) { return Health.down(e).build(); }
}

// OUTPUT:
// RIGHT: DOWN with {"error":"java.net.SocketTimeoutException: ..."}`],
        [`<p>Performance:</p><ul><li><b>Caching:</b> <code>management.endpoint.health.cache.time-to-live</code> applies to each indicator.</li><li><b>Probe period:</b> every 10 seconds is typical in Kubernetes; the check must finish well within the probe timeout.</li><li><b>Async checks:</b> run expensive checks in the background and expose the last result.</li></ul>`,
            r`# Kubernetes
# livenessProbe:  httpGet /actuator/health/liveness   periodSeconds: 10
# readinessProbe: httpGet /actuator/health/readiness  periodSeconds: 5

# OUTPUT:
# pod receives traffic only after readiness is UP`],
        [`<p>Scenario: the database goes down. Readiness (which includes <code>db</code>) turns DOWN, so the load balancer stops sending requests, while liveness stays UP and pods are not restarted needlessly. When the database returns, traffic resumes automatically.</p>`,
            r`# GET /actuator/health/readiness during outage
# HTTP/1.1 503
# {"status":"DOWN"}
# GET /actuator/health/liveness
# HTTP/1.1 200
# {"status":"UP"}

# OUTPUT:
# no restarts, no traffic until the database is back`]
    ),

    'mvc-metrics': dv(
        [`<p>Internals of Micrometer:</p><ul><li><b>Registry:</b> <code>MeterRegistry</code> stores meters keyed by name and tags; registering the same id again returns the existing meter.</li><li><b>Composite:</b> Boot creates a composite registry that forwards to every backend on the classpath.</li><li><b>Binders:</b> <code>MeterBinder</code> beans register JVM, system, Tomcat and datasource meters.</li><li><b>MVC timing:</b> <code>WebMvcMetricsFilter</code> times each request and records <code>http.server.requests</code>.</li><li><b>Naming:</b> dotted names are converted to each backend convention, such as <code>http_server_requests_seconds</code> in Prometheus.</li></ul>`,
            r`MeterRegistry registry = new SimpleMeterRegistry();
Counter a = registry.counter("hits", "path", "/a");
Counter b = registry.counter("hits", "path", "/a");
a.increment();
System.out.println((a == b) + " count=" + b.count());

// OUTPUT:
// true count=1.0`],
        [`<p>Meter types and options:</p><ul><li><b>Counter:</b> events that only increase.</li><li><b>Gauge:</b> a value that goes up and down; the registry holds only a weak reference to the object.</li><li><b>Timer:</b> count, total time and max for short durations.</li><li><b>LongTaskTimer:</b> for jobs that run long.</li><li><b>DistributionSummary:</b> sizes such as payload bytes.</li><li><b>Observation API:</b> one instrumentation point that produces both metrics and traces.</li></ul>`,
            r`DistributionSummary size = DistributionSummary.builder("payload.bytes")
    .baseUnit("bytes").publishPercentiles(0.5, 0.95).register(registry);
size.record(1200);

Observation.createNotStarted("order.create", observationRegistry)
    .lowCardinalityKeyValue("channel", "web")
    .observe(() -> service.create(order));

// OUTPUT:
// metrics: payload.bytes (p50, p95) and order.create timer plus trace span`],
        [`<p>Mistakes:</p><ul><li><b>High cardinality tags:</b> user id or full URL with ids.</li><li><b>Gauge on a temporary object:</b> garbage collected, then the gauge reports NaN.</li><li><b>Creating meters in a loop with new names:</b> memory growth.</li><li><b>Counter for a value that decreases:</b> use a gauge.</li></ul>`,
            r`// WRONG: one time series per user
registry.counter("login", "user", username).increment();

// RIGHT: bounded tag values
registry.counter("login", "outcome", success ? "success" : "failure").increment();

// OUTPUT:
// WRONG: 1 million series
// RIGHT: 2 series`],
        [`<p>Performance and tuning:</p><ul><li><b>Cost:</b> a counter increment is a lock-free add; timers are slightly more costly.</li><li><b>Histograms:</b> each bucket is a series, so enable them only for key timers.</li><li><b>Cache meters:</b> hold the meter in a field instead of looking it up on every call.</li><li><b>URI tag:</b> MVC uses the path template (<code>/users/{id}</code>), which keeps cardinality low.</li></ul>`,
            r`# application.properties
management.metrics.distribution.percentiles-histogram.http.server.requests=true
management.metrics.distribution.slo.http.server.requests=100ms,500ms,1s
management.metrics.tags.application=orders-service

# OUTPUT:
# http_server_requests_seconds_bucket{le="0.1",uri="/users/{id}"}
120.0`],
        [`<p>Scenario: an alert rule fires when the p95 of <code>http.server.requests</code> for <code>/api/checkout</code> stays above 800 ms for five minutes, and a dashboard shows the order counter by channel to spot a drop after a release.</p>`,
            r`# PromQL
# histogram_quantile(0.95,
#   sum(rate(http_server_requests_seconds_bucket{uri="/api/checkout"}[5m])) by (le))

# OUTPUT:
# 0.93 (varies) -> alert fires, team checks the latest deployment`]
    ),

    'mvc-custom-handlermapping': dv(
        [`<p>How the DispatcherServlet uses mappings:</p><ul><li><b>Discovery:</b> at startup it collects all <code>HandlerMapping</code> beans and sorts them by order.</li><li><b>getHandler:</b> for each request it loops, and the first mapping returning a non-null <code>HandlerExecutionChain</code> wins.</li><li><b>AbstractHandlerMapping:</b> calls your <code>getHandlerInternal</code>, then adds matching interceptors and CORS setup.</li><li><b>Adapter:</b> <code>getHandlerAdapter</code> finds an adapter whose <code>supports</code> returns true and calls <code>handle</code>.</li><li><b>No match:</b> 404 through <code>noHandlerFound</code>.</li></ul>`,
            r`// simplified DispatcherServlet logic
for (HandlerMapping mapping : handlerMappings) {
    HandlerExecutionChain chain = mapping.getHandler(request);
    if (chain != null) return chain;
}
return null;   // -> 404

// OUTPUT:
// order 0: LegacyHandlerMapping, order 0: RequestMappingHandlerMapping, ...`],
        [`<p>Variants:</p><ul><li><b>Implement HandlerMapping:</b> one method, <code>getHandler</code>.</li><li><b>AbstractHandlerMapping:</b> adds order, interceptors, CORS.</li><li><b>AbstractUrlHandlerMapping:</b> register handlers by URL pattern; <code>SimpleUrlHandlerMapping</code> is the ready-made form.</li><li><b>RequestMappingHandlerMapping subclass:</b> custom <code>RequestCondition</code> for annotated controllers.</li><li><b>Path matching:</b> Spring 6 uses <code>PathPatternParser</code> by default.</li></ul>`,
            r`@Bean
SimpleUrlHandlerMapping simpleMapping(HttpRequestHandler legacy) {
    var m = new SimpleUrlHandlerMapping();
    m.setUrlMap(Map.of("/legacy/**", legacy));
    m.setOrder(0);
    return m;
}

// OUTPUT:
// /legacy/anything -> legacy handler, no custom class needed`],
        [`<p>Mistakes:</p><ul><li><b>No adapter:</b> returning an unsupported handler type gives <code>ServletException: No adapter for handler</code>.</li><li><b>Order too high:</b> default mappings answer first.</li><li><b>Returning an empty chain instead of null:</b> blocks later mappings.</li><li><b>Not a bean:</b> an unregistered instance is never consulted.</li></ul>`,
            r`// WRONG: handler type has no adapter
return new Object();

// RIGHT: return a type with an adapter, for example HttpRequestHandler
return legacy;

// OUTPUT:
// WRONG: jakarta.servlet.ServletException: No adapter for handler [java.lang.Object]
// RIGHT: 200 legacy ok`],
        [`<p>Performance:</p><ul><li><b>Cost:</b> each request walks the mappings, so keep <code>getHandlerInternal</code> fast and non-allocating.</li><li><b>Order:</b> put the most frequent mapping first.</li><li><b>Lookups:</b> precompute a map of paths at startup.</li><li><b>Prefer annotations:</b> the built-in mapping uses an optimised registry.</li></ul>`,
            r`private final Map<String, HttpRequestHandler> byPath = Map.of("/legacy/report", legacy);

@Override
protected Object getHandlerInternal(HttpServletRequest req) {
    return byPath.get(req.getRequestURI());      // O(1) lookup
}

// OUTPUT:
// constant time resolution for known legacy paths`],
        [`<p>Scenario: a company migrates an old servlet-style application. Old <code>/legacy/**</code> URLs must keep working through existing <code>HttpRequestHandler</code> classes, while new endpoints use annotated controllers. A custom mapping at order 0 routes the old paths, and everything else falls through.</p>`,
            r`// GET /legacy/report -> LegacyHandlerMapping -> HttpRequestHandler -> 200
// GET /api/users     -> LegacyHandlerMapping returns null
//                       -> RequestMappingHandlerMapping -> UserController -> 200

// OUTPUT:
// both old and new URLs served by one DispatcherServlet`]
    )
};
