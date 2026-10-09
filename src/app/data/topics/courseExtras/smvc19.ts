// Spring extras, batch smvc19 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc19Extras: Record<string, Extra> = {
    'mvc-posthandle': x(
        ['<b>postHandle()</b> is a <code>HandlerInterceptor</code> callback that runs after the controller method returned but before the view is rendered.',
            'It receives the <code>ModelAndView</code>, so you can add shared model attributes (such as the current year or the user name) for every page.',
            'It is <b>skipped</b> when the controller throws an exception or when <code>preHandle()</code> returned <code>false</code>.'],
        ['<b>Signature</b>: <code>void postHandle(HttpServletRequest req, HttpServletResponse res, Object handler, ModelAndView mav)</code>; <code>mav</code> can be <code>null</code>.',
            '<b>@ResponseBody</b>: for REST controllers the body is already written when <code>postHandle</code> runs, so changing headers or the body there has no effect.',
            '<b>Reverse order</b>: with several interceptors, <code>postHandle</code> runs in the reverse of the registration order.'],
        ['<b>Prefer advice</b>: use <code>@ControllerAdvice</code> with <code>@ModelAttribute</code> for shared model data; use <code>postHandle</code> only when you need the handler or request context.',
            '<b>Not for cleanup</b>: because it is skipped on exceptions, put cleanup in <code>afterCompletion()</code>, never here.',
            '<b>Async requests</b>: for async handlers use <code>AsyncHandlerInterceptor</code>, as the callbacks run on the initial and the dispatched thread.'],
        [['F', 'When does postHandle run?', 'After the handler method finishes and before the view is rendered.'],
            ['F', 'Can postHandle change the model?', 'Yes, through the ModelAndView argument, if it is not null.'],
            ['M', 'Is postHandle called when the controller throws?', 'No. Only afterCompletion is guaranteed to run after preHandle returned true.'],
            ['M', 'Why is changing a response header in postHandle useless for @RestController?', 'The response is already committed once the message converter has written the body.'],
            ['S', 'In which order do postHandle methods of several interceptors run?', 'In reverse registration order, like a stack.'],
            ['S', 'How would you add a common attribute to all views without an interceptor?', 'Use a @ControllerAdvice class with a @ModelAttribute method.']],
        [['Add a shared attribute after the handler.',
            r`public class FooterInterceptor implements HandlerInterceptor {
    @Override
    public void postHandle(HttpServletRequest req, HttpServletResponse res,
                           Object handler, ModelAndView mav) {
        if (mav != null) {
            mav.addObject("year", java.time.Year.now().getValue());
        }
    }
}

// OUTPUT:
// GET /home -> view "home" now also has model attribute year=2026 (varies)`],
            ['Test it with MockMvc.',
                r`@WebMvcTest(HomeController.class)
class FooterTest {
    @Autowired MockMvc mvc;

    @Test
    void addsYear() throws Exception {
        mvc.perform(get("/home"))
           .andExpect(status().isOk())
           .andExpect(model().attributeExists("year"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Order of callbacks.',
            r`@Override
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    System.out.println("preHandle");
    return true;
}
@Override
public void postHandle(HttpServletRequest q, HttpServletResponse s,
                       Object h, ModelAndView m) {
    System.out.println("postHandle");
}
@Override
public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                            Object h, Exception e) {
    System.out.println("afterCompletion");
}

// OUTPUT:
// preHandle
// (controller runs)
// postHandle
// (view renders)
// afterCompletion`],
            ['postHandle skipped on exception.',
                r`@GetMapping("/boom")
public String boom() {
    throw new IllegalStateException("fail");
}

// OUTPUT:
// preHandle
// afterCompletion      <- postHandle is NOT printed`]]),

    'mvc-aftercompletion': x(
        ['<b>afterCompletion()</b> is the last <code>HandlerInterceptor</code> callback; it runs after the view is rendered, or after an exception was handled.',
            'It is called whenever <code>preHandle()</code> of <b>that</b> interceptor returned <code>true</code>, even if the controller threw an exception.',
            'The <code>Exception ex</code> parameter is non-null when the handler failed and no resolver has already handled it.'],
        ['<b>Cleanup</b>: release resources opened in <code>preHandle</code>, such as <code>ThreadLocal</code> values, MDC keys and timers.',
            '<b>Exception argument</b>: exceptions handled by <code>@ExceptionHandler</code> do not show up in <code>ex</code>, so it is null in that case.',
            '<b>Reverse order</b>: it runs only for interceptors whose <code>preHandle</code> passed, in reverse order.'],
        ['<b>ThreadLocal leaks</b>: servlet threads are pooled; forgetting <code>remove()</code> here leaks data into the next request.',
            '<b>Do not throw</b>: an exception thrown here is only logged by Spring, it cannot change the response which is already sent.',
            '<b>Status code</b>: use <code>res.getStatus()</code> to log the final HTTP status, which is known at this point.'],
        [['F', 'When is afterCompletion called?', 'After request processing finishes and the view is rendered, provided preHandle returned true.'],
            ['F', 'What is it typically used for?', 'Cleanup and logging, for example removing a ThreadLocal or MDC value.'],
            ['M', 'Is it called if the controller throws?', 'Yes, if preHandle returned true; the exception may be passed in.'],
            ['M', 'Why is ex often null even when an error happened?', 'Because an @ExceptionHandler or resolver already handled the exception.'],
            ['S', 'Which interceptors get afterCompletion if the third preHandle returns false?', 'The first and second, in reverse order; the third and later ones are not called.'],
            ['S', 'What happens if afterCompletion throws?', 'Spring logs the error and continues with the other interceptors; the response is unchanged.']],
        [['Clean up a ThreadLocal.',
            r`public class UserContextInterceptor implements HandlerInterceptor {
    public static final ThreadLocal<String> USER = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        USER.set(q.getHeader("X-User"));
        return true;
    }
    @Override
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception ex) {
        USER.remove();     // always runs, so no leak
    }
}

// OUTPUT:
// USER is set during the request and empty again afterwards`],
            ['Log status and failure.',
                r`@Override
public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                            Object h, Exception ex) {
    log.info("{} {} -> {}", q.getMethod(), q.getRequestURI(), s.getStatus());
    if (ex != null) log.error("handler failed", ex);
}

// OUTPUT:
// INFO  GET /orders/7 -> 200
// INFO  GET /orders/x -> 500`]],
        [['Guaranteed even on failure.',
            r`@GetMapping("/fail")
public String fail() { throw new RuntimeException("db down"); }

// OUTPUT (interceptor log):
// preHandle /fail
// afterCompletion /fail ex=java.lang.RuntimeException: db down`],
            ['Test the cleanup.',
                r`@Test
void cleansUp() throws Exception {
    mvc.perform(get("/ok").header("X-User", "ana")).andExpect(status().isOk());
    assertNull(UserContextInterceptor.USER.get());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),

    'mvc-interceptor-registration': x(
        ['<b>Registration</b> means telling Spring MVC about your interceptor: implement <code>WebMvcConfigurer</code> and override <code>addInterceptors(InterceptorRegistry)</code>.',
            'An interceptor class alone does nothing; it must be added with <code>registry.addInterceptor(new MyInterceptor())</code>.',
            'Choose the URLs with <code>addPathPatterns(&quot;/admin/**&quot;)</code> and exclude some with <code>excludePathPatterns</code>.'],
        ['<b>Default</b>: with no path pattern the interceptor applies to every request that reaches the <code>DispatcherServlet</code>.',
            '<b>order()</b>: <code>registration.order(1)</code> sets the position; lower numbers run first.',
            '<b>Spring Boot</b>: put the <code>@Configuration</code> class with <code>WebMvcConfigurer</code> in your app and do not add <code>@EnableWebMvc</code>, which turns off Boot auto-configuration.'],
        ['<b>Dependency injection</b>: make the interceptor a <code>@Component</code> and inject it into the config class; <code>new</code> gives no injected fields.',
            '<b>Static resources</b>: patterns also match static resource requests, so exclude <code>/css/**</code> and <code>/js/**</code> when needed.',
            '<b>Filters differ</b>: a Servlet filter is registered through <code>FilterRegistrationBean</code>, not here.'],
        [['F', 'How do you register an interceptor?', 'Override addInterceptors in a WebMvcConfigurer and call registry.addInterceptor.'],
            ['F', 'How do you limit it to some URLs?', 'Use addPathPatterns and excludePathPatterns on the returned registration.'],
            ['M', 'Why does @Autowired fail inside an interceptor created with new?', 'Spring does not manage objects created with new; register it as a bean instead.'],
            ['M', 'What does @EnableWebMvc do in Spring Boot?', 'It disables the MVC auto-configuration, so use it only when you want full manual control.'],
            ['S', 'How is the execution order controlled?', 'By registration order, or explicitly with InterceptorRegistration.order().'],
            ['S', 'Does the interceptor see requests that never reach a controller?', 'It sees requests mapped by the DispatcherServlet, including 404 resource handlers, but not requests handled before it, such as filters.']],
        [['Register one interceptor for /admin.',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuditInterceptor audit;

    public WebConfig(AuditInterceptor audit) { this.audit = audit; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(audit)
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/health");
    }
}

// OUTPUT:
// GET /admin/users   -> AuditInterceptor runs
// GET /admin/health  -> skipped
// GET /home          -> skipped`],
            ['Verify with MockMvc.',
                r`@Test
void interceptorRuns() throws Exception {
    mvc.perform(get("/admin/users"))
       .andExpect(header().string("X-Audited", "true"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Two ways to build the interceptor.',
            r`@Component
public class AuditInterceptor implements HandlerInterceptor {
    private final AuditService service;      // injected by Spring
    public AuditInterceptor(AuditService service) { this.service = service; }

    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        service.record(q.getRequestURI());
        s.setHeader("X-Audited", "true");
        return true;
    }
}

// OUTPUT:
// Header X-Audited: true on every /admin/** response`],
            ['Order set explicitly.',
                r`registry.addInterceptor(new LogInterceptor()).order(1);
registry.addInterceptor(new AuthInterceptor()).order(2);

// OUTPUT:
// preHandle: Log -> Auth`]]),

    'mvc-multiple-interceptors': x(
        ['<b>Interceptor chain</b>: all registered interceptors that match the URL form a <code>HandlerExecutionChain</code> around the handler.',
            '<b>preHandle</b> runs in registration order (1, 2, 3); <b>postHandle</b> and <b>afterCompletion</b> run in the reverse order (3, 2, 1).',
            'If one <code>preHandle</code> returns <code>false</code>, the chain stops: the handler and later interceptors are skipped.'],
        ['<b>Short circuit</b>: when interceptor 2 returns <code>false</code>, only <code>afterCompletion</code> of interceptor 1 runs afterwards.',
            '<b>Response duty</b>: an interceptor that returns <code>false</code> must write the response itself (error status, redirect), or the client gets an empty 200.',
            '<b>Ordering rule</b>: put cheap and generic interceptors (logging, request id) first and expensive ones (auth lookups) later.'],
        ['<b>Hidden dependencies</b>: if interceptor B reads a request attribute set by A, document and enforce the order with <code>order()</code>.',
            '<b>Cost</b>: every interceptor adds work on each request; limit each to the paths where it is needed.',
            '<b>Filters first</b>: servlet filters run before the whole interceptor chain and after it on the way out.'],
        [['F', 'In which order do preHandle methods run?', 'In the order the interceptors were registered.'],
            ['F', 'And postHandle?', 'In the reverse order.'],
            ['M', 'What happens if the second preHandle returns false?', 'The controller and the third interceptor are skipped, and afterCompletion runs for the first.'],
            ['M', 'Who sends the response when preHandle returns false?', 'The interceptor itself must set a status or redirect; Spring does nothing.'],
            ['S', 'How do you guarantee interceptor A runs before B?', 'Register A first, or set order(1) and order(2) on the registrations.'],
            ['S', 'Why do afterCompletion calls run in reverse?', 'It unwinds the chain like a stack, so resources opened last are closed first.']],
        [['Print the order.',
            r`registry.addInterceptor(new Tracer("A"));
registry.addInterceptor(new Tracer("B"));

// Tracer prints "<name>.pre", "<name>.post", "<name>.done"

// OUTPUT:
// A.pre
// B.pre
// (controller)
// B.post
// A.post
// B.done
// A.done`],
            ['Short circuit in B.',
                r`// B.preHandle returns false after sending 403
// OUTPUT:
// A.pre
// B.pre   (returns false, status 403 written)
// A.done  <- only A afterCompletion; controller never runs`]],
        [['Order enforced with order().',
            r`@Override
public void addInterceptors(InterceptorRegistry r) {
    r.addInterceptor(new RequestIdInterceptor()).order(0);
    r.addInterceptor(new AuthInterceptor()).order(10).addPathPatterns("/api/**");
    r.addInterceptor(new TimingInterceptor()).order(20);
}

// OUTPUT:
// preHandle: RequestId -> Auth -> Timing
// afterCompletion: Timing -> Auth -> RequestId`],
            ['Test the short circuit.',
                r`@Test
void blocked() throws Exception {
    mvc.perform(get("/api/data"))        // no token
       .andExpect(status().isUnauthorized());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),

    'mvc-logging-interceptor': x(
        ['<b>Logging interceptor</b>: an interceptor that logs every request (method, URL, status, duration) in one place instead of in each controller.',
            'Log the start in <code>preHandle()</code> and the result in <code>afterCompletion()</code>, where the status and the exception are known.',
            'Use a unique <b>request id</b> in the log lines so you can follow one request through many log entries.'],
        ['<b>MDC</b>: <code>MDC.put(&quot;requestId&quot;, id)</code> in <code>preHandle</code> and <code>MDC.clear()</code> in <code>afterCompletion</code>; the log pattern prints <code>%X{requestId}</code>.',
            '<b>Logger</b>: use SLF4J (<code>LoggerFactory.getLogger</code>), not <code>System.out</code>.',
            '<b>Skip noise</b>: exclude health checks and static resources with <code>excludePathPatterns</code>.'],
        ['<b>Sensitive data</b>: never log passwords, tokens or full request bodies; mask headers such as <code>Authorization</code>.',
            '<b>Body logging</b>: reading the body in an interceptor consumes the stream; use <code>ContentCachingRequestWrapper</code> in a filter if you really need it.',
            '<b>Alternative</b>: <code>CommonsRequestLoggingFilter</code> is a ready-made filter for simple request logging.'],
        [['F', 'Why log in an interceptor?', 'It centralizes logging for all controllers without repeating code.'],
            ['F', 'Where do you log the HTTP status?', 'In afterCompletion, because the response status is final there.'],
            ['M', 'What is MDC for?', 'It stores per-thread context such as a request id that the logging pattern adds to every line.'],
            ['M', 'Why call MDC.clear() in afterCompletion?', 'Threads are reused, so leftover values would leak into later requests.'],
            ['S', 'Why is logging the request body in an interceptor hard?', 'The body stream can be read only once; you need a caching wrapper from a filter.'],
            ['S', 'Interceptor or filter for request logging?', 'A filter sees everything including errors before MVC; an interceptor sees handler info. Pick by what you need to log.']],
        [['A simple logging interceptor.',
            r`@Component
public class LoggingInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger(LoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        MDC.put("requestId", UUID.randomUUID().toString().substring(0, 8));
        log.info("--> {} {}", q.getMethod(), q.getRequestURI());
        return true;
    }
    @Override
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception ex) {
        log.info("<-- {} {}", s.getStatus(), q.getRequestURI());
        MDC.clear();
    }
}

// OUTPUT:
// [a1b2c3d4] --> GET /products
// [a1b2c3d4] <-- 200 /products   (id varies)`],
            ['Log pattern with MDC.',
                r`# application.properties
logging.pattern.console=%d{HH:mm:ss} [%X{requestId}] %-5level %msg%n

# OUTPUT:
# 10:15:02 [a1b2c3d4] INFO  --> GET /products`]],
        [['Mask sensitive headers.',
            r`private String safe(String name, String value) {
    return "Authorization".equalsIgnoreCase(name) ? "***" : value;
}

// OUTPUT:
// header Authorization=***
// header Accept=application/json`],
            ['Verify the interceptor does not change responses.',
                r`@Test
void stillWorks() throws Exception {
    mvc.perform(get("/products")).andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),

    'mvc-authentication-interceptor': x(
        ['<b>Authentication interceptor</b>: checks in <code>preHandle()</code> that the caller is logged in and rejects the request otherwise.',
            'For session apps check a session attribute and <b>redirect</b> to <code>/login</code>; for APIs check a token header and reply <code>401 Unauthorized</code>.',
            'Return <code>false</code> after sending the redirect or error, so the controller is never reached.'],
        ['<b>Session check</b>: <code>request.getSession(false)</code> returns <code>null</code> when there is no session; avoid creating one by accident.',
            '<b>Public URLs</b>: exclude <code>/login</code>, <code>/register</code> and static files with <code>excludePathPatterns</code>, or you cause a redirect loop.',
            '<b>Status codes</b>: <code>401</code> means not authenticated, <code>403</code> means authenticated but not allowed.'],
        ['<b>Use Spring Security</b> for real applications: it handles sessions, password hashing, CSRF and token validation; a hand-made interceptor is fine for learning or small internal tools.',
            '<b>Token validation</b>: verify signature and expiry on every request; never trust a header only because it exists.',
            '<b>Return to page</b>: store the original URL before redirecting to login so you can send the user back after login.'],
        [['F', 'What does an authentication interceptor check?', 'Whether the request belongs to a logged-in user, for example a session attribute or a valid token.'],
            ['F', 'What should preHandle return for an unauthenticated user?', 'false, after writing a 401 or a redirect to the login page.'],
            ['M', 'Why exclude /login from the interceptor?', 'Otherwise the login page itself needs a login and the user is stuck in a redirect loop.'],
            ['M', 'Difference between 401 and 403?', '401 means the user is not authenticated; 403 means the user is known but lacks permission.'],
            ['S', 'Why is Spring Security preferred over a custom interceptor?', 'It is a tested filter chain covering sessions, CSRF, password storage and method security.'],
            ['S', 'Why use getSession(false)?', 'It does not create a new session for anonymous requests, which avoids wasted memory and session fixation issues.']],
        [['Session-based check.',
            r`@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
            throws IOException {
        HttpSession session = q.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            s.sendRedirect(q.getContextPath() + "/login");
            return false;
        }
        return true;
    }
}

// OUTPUT:
// GET /dashboard (no session) -> 302 Location: /login
// GET /dashboard (logged in)  -> 200`],
            ['Token check for an API.',
                r`@Override
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    String auth = q.getHeader("Authorization");
    if (auth == null || !auth.startsWith("Bearer ")) {
        s.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing token");
        return false;
    }
    return tokenService.isValid(auth.substring(7));
}

// OUTPUT:
// GET /api/me (no header)     -> 401 Missing token
// GET /api/me (Bearer valid)  -> 200`]],
        [['Registration with public paths.',
            r`registry.addInterceptor(authInterceptor)
        .addPathPatterns("/**")
        .excludePathPatterns("/login", "/register", "/css/**", "/js/**");

// OUTPUT:
// /login and static files stay public; every other URL needs a user`],
            ['MockMvc test with a session.',
                r`@Test
void allowsLoggedInUser() throws Exception {
    mvc.perform(get("/dashboard").sessionAttr("user", "ana"))
       .andExpect(status().isOk());
}

@Test
void redirectsAnonymous() throws Exception {
    mvc.perform(get("/dashboard"))
       .andExpect(status().is3xxRedirection())
       .andExpect(redirectedUrl("/login"));
}

// OUTPUT:
// Tests run: 2, Failures: 0`]]),

    'mvc-authorization-interceptor': x(
        ['<b>Authorization interceptor</b>: after the user is known, it checks whether the user has the role or permission needed for the requested handler.',
            'The handler is passed as <code>Object handler</code>; cast it to <code>HandlerMethod</code> to read annotations on the controller method.',
            'Reply with <code>403 Forbidden</code> and return <code>false</code> when the user lacks the permission.'],
        ['<b>Custom annotation</b>: define <code>@RequiresRole(&quot;ADMIN&quot;)</code> with <code>@Retention(RUNTIME)</code> and read it with <code>handlerMethod.getMethodAnnotation(...)</code>.',
            '<b>instanceof check</b>: static resources use a different handler type, so test <code>handler instanceof HandlerMethod</code> first.',
            '<b>Order</b>: run it after the authentication interceptor, since it needs the user.'],
        ['<b>Prefer Spring Security</b>: <code>@PreAuthorize(&quot;hasRole(&apos;ADMIN&apos;)&quot;)</code> with method security does the same with far more features.',
            '<b>Class and method</b>: check the annotation on both the method and the class (<code>getBeanType()</code>).',
            '<b>Never trust the client</b>: take roles from the server side session or verified token, not from a request parameter.'],
        [['F', 'What is the difference between authentication and authorization?', 'Authentication proves who you are; authorization decides what you may do.'],
            ['F', 'Which status code is used for a denied action?', '403 Forbidden.'],
            ['M', 'How can an interceptor read an annotation on the controller method?', 'Cast the handler to HandlerMethod and call getMethodAnnotation.'],
            ['M', 'Why check handler instanceof HandlerMethod?', 'Resource requests use other handler types and the cast would fail.'],
            ['S', 'Why must authorization run after authentication?', 'It needs the identified user and roles that the first step puts on the request or session.'],
            ['S', 'What would you use in production instead?', 'Spring Security with method security (@PreAuthorize) or URL rules in a SecurityFilterChain.']],
        [['Annotation-driven roles.',
            r`@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresRole { String value(); }

@Component
public class RoleInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
            throws IOException {
        if (!(h instanceof HandlerMethod hm)) return true;
        RequiresRole need = hm.getMethodAnnotation(RequiresRole.class);
        if (need == null) return true;
        String role = (String) q.getSession().getAttribute("role");
        if (!need.value().equals(role)) {
            s.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied");
            return false;
        }
        return true;
    }
}

// OUTPUT:
// role=USER  GET /admin/report -> 403 Access denied
// role=ADMIN GET /admin/report -> 200`],
            ['Use it on a controller.',
                r`@GetMapping("/admin/report")
@RequiresRole("ADMIN")
public String report() { return "report"; }

// OUTPUT:
// only sessions with role ADMIN reach this method`]],
        [['Test both outcomes.',
            r`@Test
void adminAllowed() throws Exception {
    mvc.perform(get("/admin/report").sessionAttr("role", "ADMIN"))
       .andExpect(status().isOk());
}
@Test
void userDenied() throws Exception {
    mvc.perform(get("/admin/report").sessionAttr("role", "USER"))
       .andExpect(status().isForbidden());
}

// OUTPUT:
// Tests run: 2, Failures: 0`],
            ['Class level plus method level.',
                r`RequiresRole need = hm.getMethodAnnotation(RequiresRole.class);
if (need == null) {
    need = hm.getBeanType().getAnnotation(RequiresRole.class);
}

// OUTPUT:
// a role on the controller class protects all of its methods`]]),

    'mvc-request-tracking': x(
        ['<b>Request tracking</b> means giving each request an id and recording counts or timings so one call can be followed across logs and services.',
            'An interceptor reads the <code>X-Request-Id</code> header or generates a UUID in <code>preHandle()</code> and sets it on the request and response.',
            'Keep the id in the <b>MDC</b> so every log line of that request shows it.'],
        ['<b>Propagation</b>: when your service calls another service, send the same <code>X-Request-Id</code> header so logs can be joined.',
            '<b>Counters</b>: use <code>AtomicLong</code> or a <code>ConcurrentHashMap</code> for hit counts; plain <code>HashMap</code> is not thread safe.',
            '<b>Request attribute</b>: <code>request.setAttribute(&quot;requestId&quot;, id)</code> makes the id available to controllers.'],
        ['<b>Use real tools</b>: Micrometer and Micrometer Tracing give metrics and distributed trace ids; hand-made counters are only for learning.',
            '<b>Memory growth</b>: do not store one map entry per request or per raw URL with ids inside; the map grows without limit.',
            '<b>Trust</b>: validate an incoming request id (length, characters) before logging it to avoid log injection.'],
        [['F', 'Why add a request id?', 'To find all log lines that belong to one request.'],
            ['F', 'Where is the id created?', 'In preHandle of an interceptor (or a filter), before the controller runs.'],
            ['M', 'How do you show the id in every log line?', 'Put it in the MDC and use %X{requestId} in the log pattern.'],
            ['M', 'Why not use a HashMap for hit counters?', 'It is not thread safe; use ConcurrentHashMap and AtomicLong or LongAdder.'],
            ['S', 'How is a trace followed across microservices?', 'The id is sent in a header on each outgoing call, and tools like Micrometer Tracing do this automatically.'],
            ['S', 'What is log injection and how do you avoid it?', 'A client puts newlines or fake entries in a header you log; validate or sanitize the value before using it.']],
        [['Assign and echo a request id.',
            r`@Component
public class RequestIdInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        String id = q.getHeader("X-Request-Id");
        if (id == null || !id.matches("[A-Za-z0-9-]{1,64}")) {
            id = UUID.randomUUID().toString();
        }
        q.setAttribute("requestId", id);
        s.setHeader("X-Request-Id", id);
        MDC.put("requestId", id);
        return true;
    }
    @Override
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception ex) {
        MDC.remove("requestId");
    }
}

// OUTPUT:
// HTTP/1.1 200
// X-Request-Id: 6f1c0d52-8d0a-4a4e-9a52-1b2c3d4e5f60   (varies)`],
            ['Count hits per path.',
                r`private final Map<String, LongAdder> hits = new ConcurrentHashMap<>();

@Override
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    hits.computeIfAbsent(q.getRequestURI(), k -> new LongAdder()).increment();
    return true;
}

// OUTPUT:
// /products=12, /orders=5   (varies)`]],
        [['Read the id in a controller.',
            r`@GetMapping("/ping")
public Map<String, String> ping(@RequestAttribute("requestId") String id) {
    return Map.of("requestId", id);
}

// OUTPUT:
// {"requestId":"6f1c0d52-8d0a-4a4e-9a52-1b2c3d4e5f60"}   (varies)`],
            ['Test that the header is returned.',
                r`@Test
void returnsId() throws Exception {
    mvc.perform(get("/ping").header("X-Request-Id", "abc-1"))
       .andExpect(header().string("X-Request-Id", "abc-1"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),

    'mvc-performance-monitoring': x(
        ['<b>Performance monitoring</b> with an interceptor measures how long each request takes, from <code>preHandle()</code> to <code>afterCompletion()</code>.',
            'Store the start time as a <b>request attribute</b> in <code>preHandle</code> and compute the difference in <code>afterCompletion</code>.',
            'Log slow requests with a warning when the duration is above a threshold, such as 500 ms.'],
        ['<b>Clock</b>: use <code>System.nanoTime()</code> for durations; <code>currentTimeMillis()</code> can jump when the clock changes.',
            '<b>No instance field</b>: an interceptor is a singleton shared by all threads, so a start time field would be overwritten by other requests.',
            '<b>Scope</b>: the measured time covers the handler and view rendering, but not time spent in servlet filters before the interceptor.'],
        ['<b>Real metrics</b>: Spring Boot Actuator with Micrometer already records <code>http.server.requests</code> timers; prefer it over hand-made code.',
            '<b>Percentiles</b>: averages hide slow requests; track p95 and p99 with histograms.',
            '<b>Overhead</b>: measuring is cheap, but logging every request at INFO adds I/O; log only slow ones or sample them.'],
        [['F', 'How do you measure request time in an interceptor?', 'Save the start time in preHandle and subtract it from the end time in afterCompletion.'],
            ['F', 'Where do you keep the start time?', 'As a request attribute, not in a field.'],
            ['M', 'Why is a field for start time a bug?', 'The interceptor is a shared singleton, so concurrent requests overwrite each other.'],
            ['M', 'Why nanoTime and not currentTimeMillis?', 'nanoTime is monotonic and meant for elapsed time; the wall clock can change.'],
            ['S', 'What does the measurement exclude?', 'Work done in servlet filters before the interceptor and network time to the client.'],
            ['S', 'What do you use in production?', 'Actuator and Micrometer timers with percentiles, exported to Prometheus or a similar system.']],
        [['Timing interceptor.',
            r`@Component
public class TimingInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger(TimingInterceptor.class);
    private static final String START = "startNanos";

    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        q.setAttribute(START, System.nanoTime());
        return true;
    }
    @Override
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception ex) {
        long ms = (System.nanoTime() - (Long) q.getAttribute(START)) / 1_000_000;
        if (ms > 500) log.warn("SLOW {} {} took {} ms", q.getMethod(), q.getRequestURI(), ms);
        else log.debug("{} {} took {} ms", q.getMethod(), q.getRequestURI(), ms);
    }
}

// OUTPUT:
// DEBUG GET /products took 12 ms   (varies)
// WARN  SLOW GET /report took 1340 ms   (varies)`],
            ['Add the time as a response header.',
                r`// in postHandle (header must be set before the body is committed)
long ms = (System.nanoTime() - (Long) q.getAttribute("startNanos")) / 1_000_000;
s.setHeader("X-Response-Time", ms + "ms");

// OUTPUT:
// X-Response-Time: 12ms   (varies)`]],
        [['Use Actuator instead.',
            r`# application.properties
management.endpoints.web.exposure.include=health,metrics
management.metrics.distribution.percentiles-histogram.http.server.requests=true

# OUTPUT:
# GET /actuator/metrics/http.server.requests
# {"name":"http.server.requests","measurements":[{"statistic":"COUNT","value":42.0}]}`],
            ['Test the header.',
                r`@Test
void hasTiming() throws Exception {
    mvc.perform(get("/products"))
       .andExpect(header().exists("X-Response-Time"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),

    'mvc-servlet-filter': x(
        ['<b>Servlet filter</b>: a class implementing <code>jakarta.servlet.Filter</code> that runs before a request reaches the servlet and again after the response is produced.',
            'It works at the <b>servlet container level</b>, before the <code>DispatcherServlet</code>, so it knows nothing about controllers or handlers.',
            'Its method <code>doFilter(request, response, chain)</code> must call <code>chain.doFilter(request, response)</code> to continue; skipping it blocks the request.'],
        ['<b>Registration</b>: annotate with <code>@Component</code> in Spring Boot, or use <code>FilterRegistrationBean</code> to set URL patterns and order.',
            '<b>OncePerRequestFilter</b>: the Spring base class guarantees one execution per request, even across forwards and error dispatches.',
            '<b>Filter vs interceptor</b>: filters wrap everything and can replace the request or response (wrappers); interceptors see the handler and the model.'],
        ['<b>Typical uses</b>: encoding, CORS, security (Spring Security is a filter chain), compression and request body caching.',
            '<b>Order</b>: <code>setOrder(...)</code> on the registration bean or <code>@Order</code> on the class; lower runs first.',
            '<b>Exceptions</b>: exceptions thrown in a filter are not handled by <code>@ControllerAdvice</code> because MVC has not started; use a <code>HandlerExceptionResolver</code> or write the response in the filter.'],
        [['F', 'What is a servlet filter?', 'A component that intercepts requests and responses at the servlet container level, before and after the servlet.'],
            ['F', 'Which method must you call to continue the request?', 'chain.doFilter(request, response).'],
            ['M', 'What is OncePerRequestFilter for?', 'It makes sure the filter logic runs only once per request, even with forwards.'],
            ['M', 'How do you set the URL pattern and order of a filter in Spring Boot?', 'Declare a FilterRegistrationBean with addUrlPatterns and setOrder.'],
            ['S', 'Filter or interceptor for logging the request body?', 'A filter, because it can wrap the request with a caching wrapper; interceptors cannot replace the request.'],
            ['S', 'Why does @ControllerAdvice not catch exceptions from a filter?', 'The filter runs before the DispatcherServlet, so MVC exception handling is not active.']],
        [['A timing filter.',
            r`@Component
public class TimingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {
        long t0 = System.nanoTime();
        try {
            chain.doFilter(req, res);          // continue to the servlet
        } finally {
            long ms = (System.nanoTime() - t0) / 1_000_000;
            logger.info(req.getMethod() + " " + req.getRequestURI() + " " + ms + " ms");
        }
    }
}

// OUTPUT:
// INFO GET /products 14 ms   (varies)`],
            ['Register with a pattern and order.',
                r`@Bean
FilterRegistrationBean<TimingFilter> timingFilter() {
    var reg = new FilterRegistrationBean<>(new TimingFilter());
    reg.addUrlPatterns("/api/*");
    reg.setOrder(1);
    return reg;
}

// OUTPUT:
// the filter runs only for /api/* requests, first in the chain`]],
        [['Block a request in a filter.',
            r`@Override
protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                FilterChain chain) throws ServletException, IOException {
    if (req.getHeader("X-Api-Key") == null) {
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "API key required");
        return;                                 // chain not called
    }
    chain.doFilter(req, res);
}

// OUTPUT:
// GET /api/data (no key)  -> 401 API key required
// GET /api/data (key)     -> 200`],
            ['Test with MockMvc (filters added explicitly in slice tests).',
                r`@Test
void rejectsMissingKey() throws Exception {
    MockMvc m = MockMvcBuilders.standaloneSetup(new DataController())
            .addFilters(new ApiKeyFilter()).build();
    m.perform(get("/api/data")).andExpect(status().isUnauthorized());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),
};

export const smvc19Deep: Record<string, Deep> = {
    'mvc-posthandle': dv(
        [`<ul><li><code>DispatcherServlet.doDispatch()</code> gets a <code>HandlerExecutionChain</code> from the <code>HandlerMapping</code>.</li>
<li>It calls <code>applyPreHandle</code>, then the <code>HandlerAdapter</code> runs the controller and returns a <code>ModelAndView</code>.</li>
<li><code>applyPostHandle</code> loops over the interceptors from the last to the first, then <code>processDispatchResult</code> renders the view.</li>
<li>If the handler throws, control jumps to exception resolution and <code>applyPostHandle</code> is never called.</li></ul>`,
            r`// simplified from DispatcherServlet.doDispatch
if (!mappedHandler.applyPreHandle(req, res)) return;
mv = ha.handle(req, res, mappedHandler.getHandler());
mappedHandler.applyPostHandle(req, res, mv);   // reverse order
processDispatchResult(req, res, mappedHandler, mv, ex);  // render + afterCompletion

// OUTPUT:
// pre(1) pre(2) handler post(2) post(1) render done(2) done(1)`],
        [`<ul><li>Signature has four parameters; <code>modelAndView</code> is <code>null</code> for <code>@ResponseBody</code> methods and for handlers that return a view name only in some cases, so null-check it.</li>
<li>Extend <code>HandlerInterceptor</code> default methods: all three callbacks have default implementations, override only what you need.</li>
<li><code>AsyncHandlerInterceptor</code> adds <code>afterConcurrentHandlingStarted</code> for async requests.</li></ul>`,
            r`public class ViewTweakInterceptor implements HandlerInterceptor {
    @Override
    public void postHandle(HttpServletRequest q, HttpServletResponse s,
                           Object h, ModelAndView mav) {
        if (mav != null && mav.getViewName() != null
                && !mav.getViewName().startsWith("redirect:")) {
            mav.addObject("appName", "Shop");
        }
    }
}

// OUTPUT:
// view "home" gets appName=Shop; "redirect:/x" views are untouched`],
        [`<ul><li><b>Mistake</b>: cleaning resources in <code>postHandle</code>. <b>Fix</b>: use <code>afterCompletion</code>.</li>
<li><b>Mistake</b>: setting a header for a JSON response. <b>Fix</b>: set it in <code>preHandle</code>, or use a filter or <code>ResponseBodyAdvice</code>.</li>
<li><b>Mistake</b>: using <code>mav</code> without a null check, giving <code>NullPointerException</code>.</li></ul>`,
            r`// WRONG for @RestController: response is already committed
@Override
public void postHandle(HttpServletRequest q, HttpServletResponse s,
                       Object h, ModelAndView mav) {
    s.setHeader("X-Late", "1");        // ignored
}
// RIGHT: s.setHeader("X-Late", "1") inside preHandle

// OUTPUT:
// WRONG: header X-Late missing in the response
// RIGHT: header X-Late: 1 present`],
        [`<ul><li>postHandle is cheap, but heavy work (database calls for menus) on every request slows all pages.</li>
<li>Cache shared model data (menu, footer) with <code>@Cacheable</code> instead of loading it per request.</li>
<li>Restrict the interceptor to HTML paths so API calls do not pay for it.</li></ul>`,
            r`registry.addInterceptor(new MenuInterceptor())
        .addPathPatterns("/", "/shop/**")
        .excludePathPatterns("/api/**");

// OUTPUT:
// MenuInterceptor runs for pages only; API latency unchanged`],
        [`<ul><li>A site needs the logged-in user name and cart size in the header of every page.</li>
<li>A <code>postHandle</code> adds both to the model once, so no controller repeats the code.</li>
<li>The team later moves the data to <code>@ControllerAdvice</code> to ease testing.</li></ul>`,
            r`@Override
public void postHandle(HttpServletRequest q, HttpServletResponse s,
                       Object h, ModelAndView mav) {
    if (mav == null) return;
    Object user = q.getSession().getAttribute("user");
    mav.addObject("headerUser", user);
    mav.addObject("cartSize", cartService.size(user));
}

// OUTPUT:
// every Thymeleaf page can print headerUser and cartSize`]),

    'mvc-aftercompletion': dv(
        [`<ul><li>After <code>processDispatchResult</code> renders the view, <code>triggerAfterCompletion</code> is invoked.</li>
<li><code>HandlerExecutionChain</code> keeps an index <code>interceptorIndex</code> of the last interceptor whose <code>preHandle</code> returned true.</li>
<li><code>triggerAfterCompletion</code> loops from that index down to 0, which is why only the passed interceptors are cleaned up and in reverse order.</li>
<li>Exceptions thrown by an interceptor here are caught and logged, so the loop continues.</li></ul>`,
            r`// simplified from HandlerExecutionChain
void triggerAfterCompletion(req, res, Exception ex) {
    for (int i = this.interceptorIndex; i >= 0; i--) {
        try {
            interceptors.get(i).afterCompletion(req, res, handler, ex);
        } catch (Throwable t) {
            logger.error("HandlerInterceptor.afterCompletion threw exception", t);
        }
    }
}

// OUTPUT:
// done(2) done(1)   (even if done(2) throws, done(1) still runs)`],
        [`<ul><li>The <code>ex</code> argument is set only for exceptions that no resolver handled, plus view rendering errors.</li>
<li>For <code>@ExceptionHandler</code> handled errors, check <code>res.getStatus()</code> instead.</li>
<li>For async requests it is called once, after the async dispatch finishes.</li></ul>`,
            r`@Override
public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                            Object h, Exception ex) {
    boolean failed = ex != null || s.getStatus() >= 500;
    metrics.counter(failed ? "req.fail" : "req.ok").increment();
}

// OUTPUT:
// req.ok=120, req.fail=3   (varies)`],
        [`<ul><li><b>Mistake</b>: forgetting <code>ThreadLocal.remove()</code>. <b>Fix</b>: always remove in <code>afterCompletion</code>.</li>
<li><b>Mistake</b>: expecting it for an interceptor whose <code>preHandle</code> returned false. <b>Fix</b>: do not rely on it for that interceptor, and clean up before returning false.</li>
<li><b>Mistake</b>: trying to change the response here. <b>Fix</b>: the response is already committed.</li></ul>`,
            r`@Override
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    TX.set(txManager.begin());
    if (!allowed(q)) {
        TX.get().rollback();      // clean up now: afterCompletion will not run
        TX.remove();
        return false;
    }
    return true;
}

// OUTPUT:
// no leaked transaction when the request is rejected`],
        [`<ul><li>The cost is tiny, but a slow <code>afterCompletion</code> (remote audit call) delays the thread release.</li>
<li>The response is usually already sent, yet the servlet thread stays busy; send audit data to a queue or <code>@Async</code> method.</li>
<li>A leaked ThreadLocal in a pool of 200 threads can hold large objects for a long time.</li></ul>`,
            r`@Override
public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                            Object h, Exception ex) {
    auditQueue.offer(new AuditEvent(q.getRequestURI(), s.getStatus()));  // fast
    CTX.remove();
}

// OUTPUT:
// thread returns to the pool immediately; audit is written by a worker`],
        [`<ul><li>A multi-tenant app sets the tenant id in a ThreadLocal in <code>preHandle</code>.</li>
<li>Production showed users seeing another tenant data: the id was never removed.</li>
<li>Adding the cleanup in <code>afterCompletion</code> fixed it; a test now asserts the ThreadLocal is empty.</li></ul>`,
            r`@Override
public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                            Object h, Exception ex) {
    TenantContext.clear();
}

// OUTPUT:
// next request on the same thread starts with no tenant until preHandle sets it`]),

    'mvc-interceptor-registration': dv(
        [`<ul><li>Spring Boot auto-configures <code>WebMvcAutoConfiguration</code>, which collects all <code>WebMvcConfigurer</code> beans through <code>DelegatingWebMvcConfiguration</code>.</li>
<li>Each <code>addInterceptors</code> call fills an <code>InterceptorRegistry</code>.</li>
<li>The registry builds <code>MappedInterceptor</code> objects (interceptor plus include and exclude patterns) sorted by order.</li>
<li>The <code>RequestMappingHandlerMapping</code> receives them and, for each request, adds those whose patterns match to the <code>HandlerExecutionChain</code>.</li></ul>`,
            r`// what addPathPatterns creates internally (simplified)
new MappedInterceptor(
    new String[] {"/admin/**"},        // include
    new String[] {"/admin/health"},    // exclude
    interceptor);

// OUTPUT:
// chain for GET /admin/users = [AuditInterceptor]
// chain for GET /home        = []`],
        [`<ul><li><code>addPathPatterns(String...)</code> and a <code>List</code> overload.</li>
<li><code>excludePathPatterns</code> wins over include patterns.</li>
<li><code>pathMatcher(...)</code> switches the matching strategy; the default uses <code>PathPatternParser</code> in Spring 6.</li>
<li><code>order(int)</code> sets position; <code>WebRequestInterceptor</code> can be added via <code>addWebRequestInterceptor</code>.</li></ul>`,
            r`registry.addInterceptor(new A())
        .addPathPatterns("/api/**", "/admin/**")
        .excludePathPatterns("/api/public/**")
        .order(5);

// OUTPUT:
// /api/orders -> A     /api/public/info -> not A`],
        [`<ul><li><b>Mistake</b>: <code>new</code> interceptor with <code>@Autowired</code> fields gives <code>NullPointerException</code>. <b>Fix</b>: inject the bean through the config constructor.</li>
<li><b>Mistake</b>: <code>@EnableWebMvc</code> in Boot hides auto-configured static resources and JSON settings. <b>Fix</b>: remove it.</li>
<li><b>Mistake</b>: pattern <code>/admin/*</code> misses <code>/admin/a/b</code>. <b>Fix</b>: use <code>/admin/**</code>.</li></ul>`,
            r`// WRONG
registry.addInterceptor(new AuthInterceptor());   // fields stay null

// RIGHT
registry.addInterceptor(authInterceptor);          // Spring bean, injected

// OUTPUT:
// WRONG: NullPointerException at tokenService.isValid
// RIGHT: works`],
        [`<ul><li>Matching runs on every request for every mapped interceptor; keep the list short and patterns simple.</li>
<li>Narrow patterns avoid the interceptor cost for static files.</li>
<li>Interceptor beans are singletons and must be thread safe.</li></ul>`,
            r`registry.addInterceptor(heavy).addPathPatterns("/api/v2/**");
// not "/**"

// OUTPUT:
// static files and other APIs bypass the heavy interceptor`],
        [`<ul><li>A team has three cross-cutting needs: request id, authentication, audit.</li>
<li>One <code>WebConfig</code> registers all three with explicit order and path rules, and an integration test checks the chain for <code>/api</code>, <code>/login</code> and <code>/css</code>.</li></ul>`,
            r`registry.addInterceptor(requestId).order(0);
registry.addInterceptor(auth).order(1)
        .addPathPatterns("/api/**").excludePathPatterns("/api/login");
registry.addInterceptor(audit).order(2).addPathPatterns("/api/**");

// OUTPUT:
// /api/orders: requestId -> auth -> audit
// /api/login : requestId`]),

    'mvc-multiple-interceptors': dv(
        [`<ul><li><code>HandlerExecutionChain.applyPreHandle</code> loops forward and increments <code>interceptorIndex</code> after each true result.</li>
<li>When one returns <code>false</code>, it calls <code>triggerAfterCompletion</code> itself and returns <code>false</code> to the dispatcher.</li>
<li><code>applyPostHandle</code> loops backward from the last interceptor.</li>
<li>So the chain is a stack: first in, last out for the closing callbacks.</li></ul>`,
            r`// simplified HandlerExecutionChain.applyPreHandle
for (int i = 0; i < interceptors.size(); i++) {
    if (!interceptors.get(i).preHandle(req, res, handler)) {
        triggerAfterCompletion(req, res, null);  // runs for 0..i-1
        return false;
    }
    this.interceptorIndex = i;
}
return true;

// OUTPUT:
// A.pre ok, B.pre false -> A.done only`],
        [`<ul><li>Order is decided by <code>order()</code> first, then by registration order for equal values.</li>
<li>Different interceptors can use different path patterns, so the chain differs per URL.</li>
<li>To share data between interceptors use request attributes with constant names.</li></ul>`,
            r`public final class Attrs {
    public static final String USER = "app.user";
    private Attrs() {}
}
// Auth interceptor:   q.setAttribute(Attrs.USER, user);
// Role interceptor:   User u = (User) q.getAttribute(Attrs.USER);

// OUTPUT:
// Role interceptor reads the user set by the Auth interceptor`],
        [`<ul><li><b>Mistake</b>: relying on bean scan order for the sequence. <b>Fix</b>: set <code>order()</code>.</li>
<li><b>Mistake</b>: returning false without a response. <b>Fix</b>: send the error or redirect first.</li>
<li><b>Mistake</b>: assuming afterCompletion runs for all interceptors. <b>Fix</b>: only those with passed preHandle.</li></ul>`,
            r`// WRONG: empty 200 response
if (!allowed) return false;

// RIGHT
if (!allowed) {
    res.sendError(HttpServletResponse.SC_FORBIDDEN);
    return false;
}

// OUTPUT:
// WRONG: 200 with empty body
// RIGHT: 403`],
        [`<ul><li>Put the most likely to reject interceptor (authentication) early so later work is skipped.</li>
<li>Avoid per-request object creation and remote calls inside preHandle; use caches.</li>
<li>Merge small related interceptors if they always apply to the same paths.</li></ul>`,
            r`// cheap request id first, expensive permission lookup last
registry.addInterceptor(requestId).order(0);
registry.addInterceptor(permissions).order(10);

// OUTPUT:
// unauthenticated calls stop before the permission lookup`],
        [`<ul><li>An API has request id, logging, authentication and rate limiting.</li>
<li>Order: request id, logging (so rejected requests are logged too), authentication, rate limit.</li>
<li>An integration test calls with and without a token and checks status and headers.</li></ul>`,
            r`registry.addInterceptor(requestId).order(0);
registry.addInterceptor(logging).order(1);
registry.addInterceptor(auth).order(2).addPathPatterns("/api/**");
registry.addInterceptor(rateLimit).order(3).addPathPatterns("/api/**");

// OUTPUT:
// 401 responses are still logged with a request id`]),

    'mvc-logging-interceptor': dv(
        [`<ul><li>The interceptor is a singleton called by the container thread of the request, so MDC (a ThreadLocal map in SLF4J) is safe.</li>
<li>Logback reads MDC values when formatting each line with <code>%X{key}</code>.</li>
<li>With a servlet filter before the interceptor, you can put the id there to also cover error pages.</li>
<li>Async work on other threads does not inherit MDC unless you copy it (for example with a task decorator).</li></ul>`,
            r`// copy MDC into async tasks
@Bean
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
// async log lines keep the same requestId as the request`],
        [`<ul><li>Levels: log start at DEBUG and failures at ERROR to control volume.</li>
<li>Structured logging: Spring Boot 3.4 and later can output JSON; otherwise use a Logback JSON encoder.</li>
<li>Choose what to log: method, path, status, duration, user id; avoid full query strings with secrets.</li></ul>`,
            r`log.atInfo()
   .addKeyValue("method", q.getMethod())
   .addKeyValue("path", q.getRequestURI())
   .addKeyValue("status", s.getStatus())
   .log("request done");

# OUTPUT:
# {"msg":"request done","method":"GET","path":"/products","status":200}`],
        [`<ul><li><b>Mistake</b>: logging <code>Authorization</code> or passwords. <b>Fix</b>: mask or skip them.</li>
<li><b>Mistake</b>: not clearing MDC. <b>Fix</b>: clear in <code>afterCompletion</code>.</li>
<li><b>Mistake</b>: reading <code>getInputStream()</code> to log the body, so the controller gets an empty body. <b>Fix</b>: use a caching wrapper in a filter.</li></ul>`,
            r`// WRONG: consumes the body
String body = new String(q.getInputStream().readAllBytes());

// RIGHT: in a filter, wrap first
chain.doFilter(new ContentCachingRequestWrapper(req), res);

// OUTPUT:
// WRONG: controller fails with "Required request body is missing"
// RIGHT: both logger and controller can read the content`],
        [`<ul><li>Use parameterized logging (<code>log.info("{}", x)</code>) so strings are built only when the level is on.</li>
<li>Log at DEBUG for noisy endpoints and sample high traffic ones.</li>
<li>Async appenders keep slow disks away from request threads.</li></ul>`,
            r`<appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
    <appender-ref ref="FILE"/>
    <queueSize>1024</queueSize>
</appender>

// OUTPUT:
// request threads hand log events to a queue instead of writing to disk`],
        [`<ul><li>Support receives: "order 42 failed at 10:15". With the request id in every line, an engineer greps one id and sees the whole story.</li>
<li>The id is also returned in the <code>X-Request-Id</code> response header, so the user can quote it.</li></ul>`,
            r`// grep a single request
// $ grep a1b2c3d4 app.log

// OUTPUT:
// [a1b2c3d4] --> POST /orders
// [a1b2c3d4] stock check failed for item 9
// [a1b2c3d4] <-- 409 /orders`]),

    'mvc-authentication-interceptor': dv(
        [`<ul><li>The <code>preHandle</code> runs after servlet filters but before the controller, with the <code>HttpSession</code> managed by the container (cookie <code>JSESSIONID</code>).</li>
<li><code>getSession(false)</code> only looks up the existing session by the cookie.</li>
<li>Rejecting means writing the response in the interceptor and returning false; the dispatcher then skips the handler.</li>
<li>Spring Security does this earlier, in a servlet filter chain (<code>FilterChainProxy</code>), which also protects non-MVC resources.</li></ul>`,
            r`// request flow
// Browser -> Filters -> DispatcherServlet -> AuthInterceptor.preHandle
//         -> (true) Controller   |  (false) 302 /login or 401

// OUTPUT:
// anonymous: Filters -> DispatcherServlet -> AuthInterceptor -> 302`],
        [`<ul><li>Session variant: redirect to login. Token variant: <code>401</code> JSON body.</li>
<li>Remember me or API keys: validate in a service, cache the result briefly.</li>
<li>Return the original URL after login by storing it in the session.</li></ul>`,
            r`if (user == null) {
    q.getSession().setAttribute("returnTo", q.getRequestURI());
    s.sendRedirect("/login");
    return false;
}

// OUTPUT:
// after login the app redirects back to the stored /orders/7`],
        [`<ul><li><b>Mistake</b>: redirect loop because <code>/login</code> is protected. <b>Fix</b>: exclude it.</li>
<li><b>Mistake</b>: returning true after <code>sendRedirect</code>, causing <code>IllegalStateException</code> later. <b>Fix</b>: return false.</li>
<li><b>Mistake</b>: trusting a <code>role</code> or <code>userId</code> request parameter. <b>Fix</b>: use server-side data.</li></ul>`,
            r`// WRONG
s.sendRedirect("/login");
return true;     // controller still runs and may write to the response

// RIGHT
s.sendRedirect("/login");
return false;

// OUTPUT:
// WRONG: IllegalStateException: Cannot forward after response committed
// RIGHT: clean 302`],
        [`<ul><li>Session lookups are in memory and cheap; remote token validation is not, so cache validated tokens for a short time.</li>
<li>Avoid creating sessions for anonymous traffic (<code>getSession(false)</code>).</li>
<li>For many servers use stateless tokens or a shared session store (Spring Session).</li></ul>`,
            r`# application.properties
server.servlet.session.timeout=30m
spring.session.store-type=redis

# OUTPUT:
# sessions shared between instances and expire after 30 minutes`],
        [`<ul><li>An internal admin tool needs a quick login gate for 20 pages and has no security library yet.</li>
<li>One interceptor checks the session user; later the team migrates to Spring Security without touching controllers.</li></ul>`,
            r`registry.addInterceptor(auth)
        .excludePathPatterns("/login", "/logout", "/css/**", "/img/**");

// OUTPUT:
// anonymous visitors see only the login page and its static assets`]),

    'mvc-authorization-interceptor': dv(
        [`<ul><li>For controller methods, the <code>handler</code> argument is a <code>HandlerMethod</code>, which exposes the bean type, method and annotations.</li>
<li>For static resources it is a <code>ResourceHttpRequestHandler</code>, so the cast needs a guard.</li>
<li><code>getMethodAnnotation</code> finds annotations on the method, including meta annotations.</li>
<li>The role comes from earlier authentication (session or request attribute).</li></ul>`,
            r`if (h instanceof HandlerMethod hm) {
    Class<?> controller = hm.getBeanType();
    Method m = hm.getMethod();
    System.out.println(controller.getSimpleName() + "#" + m.getName());
}

// OUTPUT:
// ReportController#report`],
        [`<ul><li>Allow several roles: <code>String[] value()</code> in the annotation.</li>
<li>Permission checks can use a service: <code>permissionService.can(user, action)</code>.</li>
<li>Spring Security equivalents: <code>@PreAuthorize</code>, <code>@Secured</code>, <code>requestMatchers(...).hasRole(...)</code>.</li></ul>`,
            r`@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface RequiresRole { String[] value(); }

boolean ok = Arrays.asList(need.value()).contains(role);

// OUTPUT:
// @RequiresRole({"ADMIN","MANAGER"}) allows either role`],
        [`<ul><li><b>Mistake</b>: forgetting <code>RetentionPolicy.RUNTIME</code>, so the annotation is invisible. <b>Fix</b>: add it.</li>
<li><b>Mistake</b>: <code>ClassCastException</code> on static resources. <b>Fix</b>: use <code>instanceof</code>.</li>
<li><b>Mistake</b>: 401 instead of 403 for a logged-in user. <b>Fix</b>: send 403.</li></ul>`,
            r`// WRONG: default retention is CLASS, annotation not readable at runtime
public @interface RequiresRole { String value(); }

// RIGHT
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresRole { String value(); }

// OUTPUT:
// WRONG: getMethodAnnotation returns null, everyone gets through
// RIGHT: check enforced`],
        [`<ul><li>Reflection lookups per request are fast but can be cached in a <code>ConcurrentHashMap</code> keyed by method.</li>
<li>Permission service calls to a database should be cached per user.</li>
<li>Do the cheap role check before any heavy query.</li></ul>`,
            r`private final Map<Method, Optional<RequiresRole>> cache = new ConcurrentHashMap<>();

RequiresRole need = cache.computeIfAbsent(hm.getMethod(),
        m -> Optional.ofNullable(m.getAnnotation(RequiresRole.class))).orElse(null);

// OUTPUT:
// annotation lookup happens once per method`],
        [`<ul><li>A back office has USER, MANAGER and ADMIN. Report pages need MANAGER or ADMIN; user deletion needs ADMIN.</li>
<li>Annotations on controller methods document the rule next to the code, and a MockMvc test per role guards it.</li></ul>`,
            r`@DeleteMapping("/users/{id}")
@RequiresRole("ADMIN")
public void delete(@PathVariable long id) { users.delete(id); }

// OUTPUT:
// MANAGER -> 403 Access denied
// ADMIN   -> 204`]),

    'mvc-request-tracking': dv(
        [`<ul><li>The interceptor creates or reads the id in <code>preHandle</code>, stores it as an attribute and in MDC, and echoes it in the response header.</li>
<li>Outgoing calls (<code>RestClient</code>, <code>WebClient</code>) add the header from MDC.</li>
<li>Logs of all services then share the id, so a log tool can join them.</li>
<li>Micrometer Tracing standardizes this with trace and span ids (W3C <code>traceparent</code>).</li></ul>`,
            r`// propagate the id to another service
RestClient client = RestClient.builder()
        .requestInterceptor((req, body, exec) -> {
            String id = MDC.get("requestId");
            if (id != null) req.getHeaders().set("X-Request-Id", id);
            return exec.execute(req, body);
        }).build();

// OUTPUT:
// downstream service logs show the same X-Request-Id`],
        [`<ul><li>Counters: <code>LongAdder</code> is faster than <code>AtomicLong</code> under heavy contention.</li>
<li>Per-user or per-path stats: bounded maps only, or Micrometer tags with a small number of values.</li>
<li>Use the route template (<code>/orders/{id}</code>), not the raw URL, as a key.</li></ul>`,
            r`String route = (String) q.getAttribute(
        HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
counters.computeIfAbsent(route, k -> new LongAdder()).increment();

// OUTPUT:
// /orders/{id}=40  (one key, not 40 different URLs)`],
        [`<ul><li><b>Mistake</b>: raw URLs as map keys give unbounded memory. <b>Fix</b>: use the pattern.</li>
<li><b>Mistake</b>: logging the incoming id unchecked. <b>Fix</b>: validate with a regex.</li>
<li><b>Mistake</b>: using a plain <code>HashMap</code> across threads. <b>Fix</b>: <code>ConcurrentHashMap</code>.</li></ul>`,
            r`// WRONG: one entry per distinct id, grows forever
hits.merge(q.getRequestURI(), 1L, Long::sum);   // /orders/1, /orders/2, ...

// RIGHT: key by pattern
hits.merge(pattern, 1L, Long::sum);

// OUTPUT:
// WRONG: 1,000,000 keys after a day
// RIGHT: a few dozen keys`],
        [`<ul><li>Tracking cost is small; unbounded keys and synchronized blocks are the real risk.</li>
<li>UUID generation is fast, but avoid <code>SecureRandom</code> blocking by using <code>UUID.randomUUID()</code> as usual.</li>
<li>Prefer Micrometer for metrics so you get aggregation and export for free.</li></ul>`,
            r`# application.properties
management.tracing.sampling.probability=0.1

# OUTPUT:
# 10 percent of requests are traced, lowering overhead`],
        [`<ul><li>A checkout call passes through gateway, order service and payment service.</li>
<li>One failed payment is found in seconds by searching its request id in the central log tool.</li></ul>`,
            r`// log lines from three services
// gateway  [6f1c] POST /checkout
// orders   [6f1c] creating order 77
// payments [6f1c] card declined

// OUTPUT:
// the failing service is visible at a glance`]),

    'mvc-performance-monitoring': dv(
        [`<ul><li>The interceptor instance is shared, so per-request state lives in the request (attributes) or on the stack.</li>
<li><code>preHandle</code> stores <code>System.nanoTime()</code>; <code>afterCompletion</code> subtracts it.</li>
<li>Spring Boot Actuator does the same through <code>WebMvcMetricsFilter</code> (a filter) feeding a Micrometer <code>Timer</code>.</li>
<li>Because a filter wraps the interceptors, Actuator numbers include more work than an interceptor measures.</li></ul>`,
            r`// WRONG: shared field
private long start;          // overwritten by parallel requests

// RIGHT: per request
q.setAttribute("startNanos", System.nanoTime());

// OUTPUT:
// WRONG: negative or mixed timings under load
// RIGHT: correct per request`],
        [`<ul><li>Use a Micrometer <code>Timer</code> for percentiles instead of manual logs.</li>
<li>Tag with route template and status, never with raw URL or user id.</li>
<li><code>@Timed</code> on controller methods is another option.</li></ul>`,
            r`@Component
public class MetricsInterceptor implements HandlerInterceptor {
    private final MeterRegistry registry;
    public MetricsInterceptor(MeterRegistry registry) { this.registry = registry; }

    @Override
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        q.setAttribute("sample", Timer.start(registry));
        return true;
    }
    @Override
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception ex) {
        Timer.Sample sample = (Timer.Sample) q.getAttribute("sample");
        sample.stop(registry.timer("app.request", "status",
                String.valueOf(s.getStatus())));
    }
}

// OUTPUT:
// GET /actuator/metrics/app.request?tag=status:200 -> count, total time, max`],
        [`<ul><li><b>Mistake</b>: storing start time in a field. <b>Fix</b>: request attribute.</li>
<li><b>Mistake</b>: timing with <code>currentTimeMillis</code>. <b>Fix</b>: <code>nanoTime</code>.</li>
<li><b>Mistake</b>: calling <code>postHandle</code> to measure, missing failed requests. <b>Fix</b>: use <code>afterCompletion</code>.</li></ul>`,
            r`// WRONG: not called when the handler throws
public void postHandle(...) { record(elapsed(q)); }

// RIGHT
public void afterCompletion(...) { record(elapsed(q)); }

// OUTPUT:
// WRONG: failed slow requests are missing from the statistics
// RIGHT: all requests measured`],
        [`<ul><li>Alert on p95 and p99 latency and error rate, not on the average.</li>
<li>Slow request logs help find the cause; add a trace id for details.</li>
<li>Do not call remote systems in the measuring code.</li></ul>`,
            r`# Prometheus style query
# histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))

# OUTPUT:
# 0.42  (seconds, varies)`],
        [`<ul><li>After a release the report page became slow only for large customers.</li>
<li>The slow request warning in the log named the URL and duration; a trace pointed to an N+1 query, fixed with a fetch join.</li></ul>`,
            r`// log
// WARN SLOW GET /reports/monthly took 4200 ms   (varies)
// fix: JOIN FETCH in the repository query

// OUTPUT:
// after the fix: took 180 ms   (varies)`]),

    'mvc-servlet-filter': dv(
        [`<ul><li>The servlet container (Tomcat) builds a <code>FilterChain</code> per request from the registered filters and the target servlet.</li>
<li>Spring Boot registers every <code>Filter</code> bean (and <code>FilterRegistrationBean</code>) with the embedded container.</li>
<li>Each <code>doFilter</code> calls <code>chain.doFilter</code>, which runs the next filter and finally the <code>DispatcherServlet</code>.</li>
<li>Code after <code>chain.doFilter</code> runs on the way back, after the response is produced.</li></ul>`,
            r`// request path
// Client -> Filter1 -> Filter2 -> DispatcherServlet -> Interceptors -> Controller
// Client <- Filter1 <- Filter2 <- DispatcherServlet <- Interceptors <- Controller

// OUTPUT:
// filters wrap interceptors; interceptors wrap the controller`],
        [`<ul><li>Plain <code>Filter</code> (<code>init</code>, <code>doFilter</code>, <code>destroy</code>) or <code>OncePerRequestFilter</code> with <code>doFilterInternal</code>.</li>
<li>Skip logic: override <code>shouldNotFilter(request)</code>.</li>
<li>Async and error dispatches: <code>shouldNotFilterAsyncDispatch()</code> and <code>shouldNotFilterErrorDispatch()</code>.</li>
<li>Wrappers: <code>HttpServletRequestWrapper</code> and <code>ContentCachingResponseWrapper</code> to change or capture data.</li></ul>`,
            r`@Override
protected boolean shouldNotFilter(HttpServletRequest req) {
    return req.getRequestURI().startsWith("/actuator");
}

// OUTPUT:
// /actuator/** requests pass without running this filter`],
        [`<ul><li><b>Mistake</b>: forgetting <code>chain.doFilter</code>, so every request hangs or returns empty. <b>Fix</b>: call it on the allowed path.</li>
<li><b>Mistake</b>: expecting <code>@ControllerAdvice</code> to handle filter exceptions. <b>Fix</b>: catch and write the response, or delegate to a <code>HandlerExceptionResolver</code>.</li>
<li><b>Mistake</b>: registering the same filter twice (bean plus <code>FilterRegistrationBean</code>). <b>Fix</b>: use only one.</li></ul>`,
            r`// route filter exceptions to @ControllerAdvice
@Component
public class SafeFilter extends OncePerRequestFilter {
    private final HandlerExceptionResolver resolver;
    public SafeFilter(@Qualifier("handlerExceptionResolver")
                      HandlerExceptionResolver resolver) { this.resolver = resolver; }

    @Override
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                    FilterChain c) throws IOException, ServletException {
        try { c.doFilter(q, s); }
        catch (Exception e) { resolver.resolveException(q, s, null, e); }
    }
}

// OUTPUT:
// exceptions are rendered by the same @ExceptionHandler as controller errors`],
        [`<ul><li>Filters run for every request including static files; use URL patterns or <code>shouldNotFilter</code>.</li>
<li>Do not buffer whole bodies in memory for large uploads.</li>
<li>Keep the number of filters small; each adds a call level to the stack.</li></ul>`,
            r`@Bean
FilterRegistrationBean<TimingFilter> f() {
    var reg = new FilterRegistrationBean<>(new TimingFilter());
    reg.addUrlPatterns("/api/*");      // not "/*"
    return reg;
}

// OUTPUT:
// only API calls pay the filter cost`],
        [`<ul><li>A service must accept only requests with a valid API key and log all rejects, even for URLs with no controller.</li>
<li>A filter is the right place: it runs before MVC, covers every path, and can reject early and cheaply.</li>
<li>Per-controller rules (roles) stay in interceptors or Spring Security.</li></ul>`,
            r`@Override
protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                FilterChain c) throws ServletException, IOException {
    if (!keys.isValid(q.getHeader("X-Api-Key"))) {
        log.warn("rejected {} from {}", q.getRequestURI(), q.getRemoteAddr());
        s.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        return;
    }
    c.doFilter(q, s);
}

// OUTPUT:
// WARN rejected /api/orders from 10.0.0.5   (varies)
// HTTP 401`]),
};
