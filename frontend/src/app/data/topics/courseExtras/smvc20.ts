// Spring extras, batch smvc20 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc20Extras: Record<string, Extra> = {
    'mvc-filter-vs-interceptor': x(
        ['<b>Filter</b> is a servlet-container component (<code>jakarta.servlet.Filter</code>) that runs before the request reaches <code>DispatcherServlet</code>.',
            '<b>Interceptor</b> is a Spring MVC component (<code>HandlerInterceptor</code>) that runs inside the <code>DispatcherServlet</code>, around the controller method.',
            '<b>Rule of thumb</b>: use a filter for cross-cutting web concerns (security, CORS, encoding, logging); use an interceptor when you need to know which handler will run.'],
        ['<b>Handler access</b>: an interceptor receives the <code>handler</code> object (for example a <code>HandlerMethod</code>), a filter only sees raw request and response.',
            '<b>Three callbacks</b>: <code>preHandle</code>, <code>postHandle</code> and <code>afterCompletion</code>; a filter has just <code>doFilter</code> with code before and after <code>chain.doFilter</code>.',
            '<b>Scope</b>: a filter can touch every request including static files and non-Spring servlets; an interceptor only sees requests mapped to the DispatcherServlet.'],
        ['<b>Exceptions</b>: an exception thrown by a controller can be handled by <code>@ControllerAdvice</code> before an interceptor runs <code>afterCompletion</code>, but a filter sees it only if it propagates out.',
            '<b>Body wrapping</b>: only a filter can replace the request or response with a wrapper (for example caching the body), because it controls what goes down the chain.',
            '<b>Spring Security</b> is itself a filter chain (<code>DelegatingFilterProxy</code> or <code>FilterChainProxy</code>), which is why authentication belongs in filters.'],
        [['F', 'What is the main difference between a filter and an interceptor?', 'A filter belongs to the servlet container and runs before DispatcherServlet; an interceptor belongs to Spring MVC and runs around the handler.'],
            ['F', 'Which interface do you implement for an interceptor?', 'HandlerInterceptor, registered through WebMvcConfigurer.addInterceptors.'],
            ['M', 'Which one can see the target controller method?', 'The interceptor, through the handler argument of preHandle. A filter cannot.'],
            ['M', 'How do you limit an interceptor to some URLs?', 'Use addPathPatterns and excludePathPatterns on the InterceptorRegistration.'],
            ['S', 'Where would you put JWT validation and why?', 'In a security filter, because it must run before MVC, work for all paths and set the SecurityContext.'],
            ['S', 'What is the order of execution?', 'Filters first, then DispatcherServlet, then interceptor preHandle, controller, postHandle, view, afterCompletion, then filters unwind.']],
        [['Register a simple interceptor.',
            r`@Component
public class TimingInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                             Object handler) {
        req.setAttribute("start", System.nanoTime());
        return true;                       // false stops the chain
    }
    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
                                Object handler, Exception ex) {
        long ms = (System.nanoTime() - (long) req.getAttribute("start")) / 1_000_000;
        System.out.println(req.getRequestURI() + " took " + ms + " ms");
    }
}

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired TimingInterceptor timing;
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timing).addPathPatterns("/api/**");
    }
}

// OUTPUT: (varies)
// /api/users took 12 ms`],
            ['A filter doing the same job.',
                r`@Component
public class TimingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        long t = System.nanoTime();
        chain.doFilter(req, res);          // everything inside runs here
        long ms = (System.nanoTime() - t) / 1_000_000;
        System.out.println(((HttpServletRequest) req).getRequestURI() + " " + ms);
    }
}

// OUTPUT: (varies)
// /api/users 13
// /favicon.ico 1   <- a filter also sees non-controller requests`]],
        [['Show the call order.',
            r`// Filter.doFilter  (before)
//   Interceptor.preHandle
//     Controller method
//   Interceptor.postHandle
//   View rendering
//   Interceptor.afterCompletion
// Filter.doFilter  (after chain.doFilter returns)

// OUTPUT:
// filter-in -> preHandle -> controller -> postHandle -> afterCompletion -> filter-out`],
            ['Test the interceptor with MockMvc.',
                r`@WebMvcTest(HelloController.class)
@Import({WebConfig.class, TimingInterceptor.class})
class InterceptorTest {
    @Autowired MockMvc mvc;

    @Test
    void interceptorRuns() throws Exception {
        mvc.perform(get("/api/hello")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0
// /api/hello took 3 ms (varies)`]]
    ),

    'mvc-filter': x(
        ['<b>Filter</b> is a servlet component implementing <code>jakarta.servlet.Filter</code> that inspects or changes a request and response before and after the servlet runs.',
            '<b>doFilter</b> is the only method you must write: do pre-work, call <code>chain.doFilter(req, res)</code> to continue, then do post-work.',
            '<b>Typical jobs</b>: logging, authentication, CORS headers, character encoding, compression and rate limiting.'],
        ['<b>Registration</b> in Spring Boot: declare the filter as a <code>@Component</code> or define a <code>FilterRegistrationBean</code> for URL patterns and order.',
            '<b>Short circuit</b>: do not call <code>chain.doFilter</code> and write the response yourself (for example 401) to stop the request.',
            '<b>Lifecycle</b>: <code>init</code> once at startup, <code>doFilter</code> per request, <code>destroy</code> at shutdown; the latter two have default methods since Servlet 4.'],
        ['<b>Singleton</b>: one filter instance serves many threads, so keep it stateless or thread safe.',
            '<b>Wrappers</b>: use <code>HttpServletRequestWrapper</code> or <code>ContentCachingRequestWrapper</code> to read the body more than once.',
            '<b>Async and dispatch types</b>: filters run for REQUEST by default; ASYNC, ERROR and FORWARD dispatches need extra registration or <code>OncePerRequestFilter</code> care.'],
        [['F', 'What does chain.doFilter do?', 'It passes the request to the next filter, or to the servlet when this is the last filter.'],
            ['F', 'How do you register a filter in Spring Boot?', 'Annotate it with @Component, or create a FilterRegistrationBean bean.'],
            ['M', 'How do you stop a request inside a filter?', 'Do not call chain.doFilter; write a status or body to the response and return.'],
            ['M', 'Why must filters be thread safe?', 'The container creates one instance and calls it from many request threads.'],
            ['S', 'How do you read the request body in a filter and still let the controller read it?', 'Wrap the request in a caching wrapper so the stream can be read again.'],
            ['S', 'Difference between @WebFilter and a FilterRegistrationBean?', '@WebFilter needs @ServletComponentScan and has weak ordering control; the bean gives explicit order and patterns.']],
        [['A minimal filter that adds a response header.',
            r`@Component
public class HeaderFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        ((HttpServletResponse) res).setHeader("X-App", "demo");
        chain.doFilter(req, res);
    }
}

// OUTPUT:
// HTTP/1.1 200
// X-App: demo`],
            ['Blocking requests without a header.',
                r`@Component
public class ApiKeyFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest r = (HttpServletRequest) req;
        if (!"secret".equals(r.getHeader("X-Api-Key"))) {
            ((HttpServletResponse) res).sendError(401, "Missing key");
            return;                        // chain stops here
        }
        chain.doFilter(req, res);
    }
}

// OUTPUT:
// GET /api            -> 401 Missing key
// GET /api (X-Api-Key: secret) -> 200`]],
        [['Control URL pattern and order.',
            r`@Configuration
public class FilterConfig {
    @Bean
    FilterRegistrationBean<HeaderFilter> headerFilter() {
        var bean = new FilterRegistrationBean<>(new HeaderFilter());
        bean.addUrlPatterns("/api/*");
        bean.setOrder(1);
        return bean;
    }
}

// OUTPUT:
// Mapping filter: 'headerFilter' to urls: [/api/*]`],
            ['Test with MockMvc.',
                r`@WebMvcTest(HelloController.class)
@Import(HeaderFilter.class)
class HeaderFilterTest {
    @Autowired MockMvc mvc;

    @Test
    void addsHeader() throws Exception {
        mvc.perform(get("/api/hello"))
           .andExpect(header().string("X-App", "demo"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-onceperrequestfilter': x(
        ['<b>OncePerRequestFilter</b> is a Spring base class that guarantees <code>doFilterInternal</code> runs only one time per request, even with forwards or error dispatches.',
            '<b>You override</b> <code>doFilterInternal(request, response, filterChain)</code> and call <code>filterChain.doFilter</code> yourself to continue.',
            '<b>Why use it</b>: a plain <code>Filter</code> can run twice when a request is forwarded internally; this class marks the request with an attribute to skip repeats.'],
        ['<b>shouldNotFilter</b> lets you skip URLs, for example <code>/health</code> or static resources.',
            '<b>Casting done for you</b>: arguments are already <code>HttpServletRequest</code> and <code>HttpServletResponse</code>, no manual casts.',
            '<b>Async</b>: override <code>shouldNotFilterAsyncDispatch</code> and <code>shouldNotFilterErrorDispatch</code> to control those dispatch types.'],
        ['<b>Mechanism</b>: it stores an attribute named from the filter bean name plus <code>.FILTERED</code> on the request and checks it on the next dispatch.',
            '<b>Bean name matters</b>: two instances of the same class with different names are treated as different filters.',
            '<b>Security</b>: Spring Security filters such as <code>BasicAuthenticationFilter</code> extend it, so custom auth filters follow the same pattern.'],
        [['F', 'What problem does OncePerRequestFilter solve?', 'It stops a filter from executing more than once for one logical request.'],
            ['F', 'Which method do you override?', 'doFilterInternal.'],
            ['M', 'How do you exclude a path?', 'Override shouldNotFilter and return true for that path.'],
            ['M', 'How does it remember it already ran?', 'It sets a request attribute based on the filter name and checks it on later dispatches.'],
            ['S', 'Does it run on ERROR and ASYNC dispatches?', 'Error dispatch is skipped and async dispatch is skipped by default; override the shouldNotFilter methods to change that.'],
            ['S', 'Why is a bean registered twice dangerous?', 'Both registrations run unless attribute names differ, and a Boot @Component filter plus a security-chain registration can duplicate work.']],
        [['A request id filter.',
            r`@Component
public class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {
        String id = UUID.randomUUID().toString().substring(0, 8);
        res.setHeader("X-Request-Id", id);
        chain.doFilter(req, res);
    }
}

// OUTPUT: (varies)
// X-Request-Id: 3f9a1c7e`],
            ['Skip health checks.',
                r`@Component
public class AuditFilter extends OncePerRequestFilter {
    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        return req.getRequestURI().startsWith("/actuator");
    }
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {
        System.out.println("AUDIT " + req.getMethod() + " " + req.getRequestURI());
        chain.doFilter(req, res);
    }
}

// OUTPUT:
// AUDIT GET /api/users
// (nothing printed for /actuator/health)`]],
        [['Show the double-run problem avoided.',
            r`// Controller forwards internally: return "forward:/inner";
// A plain Filter prints twice, OncePerRequestFilter prints once.

// OUTPUT:
// plain Filter: run, run
// OncePerRequestFilter: run`],
            ['Test the header.',
                r`@WebMvcTest(HelloController.class)
@Import(RequestIdFilter.class)
class RequestIdFilterTest {
    @Autowired MockMvc mvc;

    @Test
    void setsRequestId() throws Exception {
        mvc.perform(get("/api/hello"))
           .andExpect(header().exists("X-Request-Id"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-request-logging-filter': x(
        ['<b>Request logging filter</b> is a filter that records method, URL, status and duration of every request in one central place.',
            '<b>Spring built-in</b>: <code>CommonsRequestLoggingFilter</code> logs request details at DEBUG level of its own logger.',
            '<b>Custom version</b>: extend <code>OncePerRequestFilter</code>, measure time around <code>chain.doFilter</code> and log after the response is produced.'],
        ['<b>Enable</b> the built-in filter by declaring it as a bean and setting the logger <code>org.springframework.web.filter.CommonsRequestLoggingFilter</code> to DEBUG.',
            '<b>Options</b>: <code>setIncludeQueryString</code>, <code>setIncludePayload</code>, <code>setIncludeHeaders</code> and <code>setMaxPayloadLength</code>.',
            '<b>Correlation</b>: put a request id into the MDC so every log line of that request can be linked.'],
        ['<b>Body logging</b> needs <code>ContentCachingRequestWrapper</code>; the payload is only available after the controller has read it.',
            '<b>Sensitive data</b>: never log passwords, tokens or card numbers; mask headers such as <code>Authorization</code>.',
            '<b>MDC cleanup</b>: always call <code>MDC.clear()</code> in a finally block because threads are reused.'],
        [['F', 'Why log requests in a filter?', 'One place covers every request without touching each controller.'],
            ['F', 'Which Spring class logs requests out of the box?', 'CommonsRequestLoggingFilter.'],
            ['M', 'Why is the payload empty if I log before chain.doFilter?', 'The body is read lazily by the controller; with a caching wrapper it is only filled after reading.'],
            ['M', 'What is MDC for?', 'It holds per-thread context such as a request id that the log pattern prints on every line.'],
            ['S', 'What risks come with logging bodies?', 'Leaking secrets, large memory use and slower requests; limit the length and mask fields.'],
            ['S', 'Why clear the MDC in finally?', 'Container threads are pooled, so stale values would leak into the next request.']],
        [['Built-in filter.',
            r`@Bean
CommonsRequestLoggingFilter requestLogger() {
    var f = new CommonsRequestLoggingFilter();
    f.setIncludeQueryString(true);
    f.setIncludePayload(true);
    f.setMaxPayloadLength(500);
    return f;
}
# application.properties
logging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=DEBUG

// OUTPUT:
// Before request [GET /api/users?page=1]
// After request [GET /api/users?page=1]`],
            ['Custom timing logger.',
                r`@Component
public class LoggingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {
        long t = System.currentTimeMillis();
        try {
            chain.doFilter(req, res);
        } finally {
            log.info("{} {} -> {} in {} ms", req.getMethod(), req.getRequestURI(),
                res.getStatus(), System.currentTimeMillis() - t);
        }
    }
}

// OUTPUT: (varies)
// INFO LoggingFilter : GET /api/users -> 200 in 14 ms`]],
        [['Add a request id to MDC.',
            r`try {
    MDC.put("rid", UUID.randomUUID().toString().substring(0, 8));
    chain.doFilter(req, res);
} finally {
    MDC.clear();
}
// logging.pattern.level=%5p [%X{rid}]

// OUTPUT: (varies)
//  INFO [a1b2c3d4] GET /api/users`],
            ['Test that the filter does not break the request.',
                r`@WebMvcTest(HelloController.class)
@Import(LoggingFilter.class)
class LoggingFilterTest {
    @Autowired MockMvc mvc;

    @Test
    void passesThrough() throws Exception {
        mvc.perform(get("/api/hello")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-authentication-filter': x(
        ['<b>Authentication filter</b> is a filter that finds credentials in a request (header, cookie, token), verifies them and marks the request as authenticated or rejects it.',
            '<b>In Spring Security</b> the filter puts an <code>Authentication</code> object into the <code>SecurityContextHolder</code> so later code can call <code>getPrincipal</code>.',
            '<b>Failure</b> returns 401 Unauthorized before the controller runs.'],
        ['<b>Custom filter</b> usually extends <code>OncePerRequestFilter</code> and is added with <code>http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)</code>.',
            '<b>Typical flow</b>: read the <code>Authorization: Bearer</code> header, validate the token, build <code>UsernamePasswordAuthenticationToken</code>, set the context, continue the chain.',
            '<b>Built-ins</b>: <code>BasicAuthenticationFilter</code> and <code>UsernamePasswordAuthenticationFilter</code> already handle Basic auth and form login.'],
        ['<b>Do not register twice</b>: a filter bean that is also added to the security chain runs outside and inside it; disable the servlet registration with <code>FilterRegistrationBean.setEnabled(false)</code>.',
            '<b>Stateless APIs</b> set <code>SessionCreationPolicy.STATELESS</code> and rebuild the context on every request.',
            '<b>Clear the context</b>: Spring Security clears it after each request; custom code should never keep it in static fields.'],
        [['F', 'What does an authentication filter do?', 'It identifies who is calling by checking credentials on each request.'],
            ['F', 'Which status do you return when authentication fails?', '401 Unauthorized.'],
            ['M', 'Where do you add a custom JWT filter?', 'Before UsernamePasswordAuthenticationFilter using http.addFilterBefore.'],
            ['M', 'Where is the logged-in user stored?', 'In the SecurityContext held by SecurityContextHolder, per thread.'],
            ['S', 'Why would the filter run twice?', 'It is both a Spring bean (auto registered as a servlet filter) and added to the security chain.'],
            ['S', 'Difference between 401 and 403?', '401 means not authenticated; 403 means authenticated but not allowed.']],
        [['A simple token filter.',
            r`public class TokenFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.equals("Bearer abc123")) {
            var auth = new UsernamePasswordAuthenticationToken(
                "anaji", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, res);
    }
}

// OUTPUT:
// Bearer abc123 -> principal anaji, ROLE_USER`],
            ['Add it to the security chain.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .addFilterBefore(new TokenFilter(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
}

// OUTPUT:
// GET /api/me (no token)        -> 401
// GET /api/me (Bearer abc123)   -> 200 anaji`]],
        [['Reject bad token directly.',
            r`if (h == null || !h.startsWith("Bearer ")) {
    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    res.getWriter().write("{\"error\":\"unauthorized\"}");
    return;
}

// OUTPUT:
// HTTP/1.1 401
// {"error":"unauthorized"}`],
            ['Test with MockMvc and a user.',
                r`@SpringBootTest
@AutoConfigureMockMvc
class SecureTest {
    @Autowired MockMvc mvc;

    @Test
    void noTokenIs401() throws Exception {
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
    }
    @Test
    void tokenIsOk() throws Exception {
        mvc.perform(get("/api/me").header("Authorization", "Bearer abc123"))
           .andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0`]]
    ),

    'mvc-cors-filter': x(
        ['<b>CORS</b> (Cross-Origin Resource Sharing) is a browser rule: a page from one origin may call another origin only if the server sends allowing headers such as <code>Access-Control-Allow-Origin</code>.',
            '<b>CORS filter</b> is a filter (Spring provides <code>CorsFilter</code>) that answers the browser preflight <code>OPTIONS</code> request and adds those headers.',
            '<b>Origin</b> means scheme, host and port together; <code>http://localhost:3000</code> and <code>http://localhost:8080</code> are different origins.'],
        ['<b>Simple way</b>: annotate a controller with <code>@CrossOrigin</code> or configure <code>addCorsMappings</code> in <code>WebMvcConfigurer</code>.',
            '<b>Filter way</b>: register <code>CorsFilter</code> with a <code>UrlBasedCorsConfigurationSource</code> so CORS runs before security and MVC.',
            '<b>Preflight</b>: for methods like PUT, DELETE or custom headers the browser first sends <code>OPTIONS</code> with <code>Access-Control-Request-Method</code>.'],
        ['<b>Credentials</b>: with <code>allowCredentials(true)</code> you cannot use the wildcard <code>*</code> for origins; list them or use origin patterns.',
            '<b>Spring Security</b>: enable <code>http.cors(...)</code>, otherwise the security filters reject the preflight before MVC CORS runs.',
            '<b>Not a security feature</b>: CORS only protects browsers; curl or other servers ignore it.'],
        [['F', 'What problem does CORS solve?', 'It lets a server say which other origins may call it from a browser.'],
            ['F', 'What is a preflight request?', 'An OPTIONS request the browser sends first to ask permission for the real call.'],
            ['M', 'Why does Spring Security block my CORS call?', 'The preflight has no credentials and is rejected unless http.cors is enabled so the CorsFilter runs first.'],
            ['M', 'Why not use * with credentials?', 'The CORS spec forbids it; the server must name the origin.'],
            ['S', 'CorsFilter or @CrossOrigin?', 'CorsFilter for global rules and security integration; @CrossOrigin for quick per-controller rules.'],
            ['S', 'Does CORS protect the API from attackers?', 'No, only browsers enforce it; you still need authentication and authorization.']],
        [['Global config with WebMvcConfigurer.',
            r`@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .maxAge(3600);
    }
}

// OUTPUT:
// OPTIONS /api/users -> 200
// Access-Control-Allow-Origin: http://localhost:3000`],
            ['CorsFilter bean.',
                r`@Bean
CorsFilter corsFilter() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("http://localhost:3000"));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("*"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", c);
    return new CorsFilter(src);
}

// OUTPUT:
// Access-Control-Allow-Credentials: true
// Access-Control-Allow-Origin: http://localhost:3000`]],
        [['With Spring Security.',
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())      // uses the CorsConfigurationSource bean
        .authorizeHttpRequests(a -> a.anyRequest().authenticated());
    return http.build();
}

// OUTPUT:
// Preflight now returns 200 instead of 401`],
            ['Test the preflight.',
                r`@Test
void preflight() throws Exception {
    mvc.perform(options("/api/users")
            .header("Origin", "http://localhost:3000")
            .header("Access-Control-Request-Method", "GET"))
       .andExpect(status().isOk())
       .andExpect(header().string("Access-Control-Allow-Origin",
           "http://localhost:3000"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-character-encoding-filter': x(
        ['<b>CharacterEncodingFilter</b> is a Spring filter that sets the character encoding (usually UTF-8) on the request, and optionally the response, so text is decoded correctly.',
            '<b>Without it</b> form data and request bodies may be read as ISO-8859-1, giving broken text such as unreadable symbols for non-English names.',
            '<b>Spring Boot</b> registers it automatically with UTF-8 through <code>server.servlet.encoding</code> properties.'],
        ['<b>Properties</b>: <code>server.servlet.encoding.charset=UTF-8</code>, <code>enabled=true</code> and <code>force=true</code>.',
            '<b>force</b> makes the filter overwrite the encoding even if the request already declares one; <code>forceRequest</code> and <code>forceResponse</code> are separate switches.',
            '<b>Classic Spring MVC</b>: declare the filter in <code>web.xml</code> or in a <code>WebApplicationInitializer</code> with <code>setEncoding(&quot;UTF-8&quot;)</code>.'],
        ['<b>Order</b>: it must run first (before any code calls <code>getParameter</code>), because after parameters are parsed the request encoding cannot be changed.',
            '<b>Implementation</b>: it extends <code>OncePerRequestFilter</code> and calls <code>request.setCharacterEncoding</code> when none is set or force is on.',
            '<b>JSON</b> is always UTF-8 by default in Jackson, so the filter matters mostly for form posts and query strings.'],
        [['F', 'Why do we need a character encoding filter?', 'To decode request text with the right charset so non-ASCII characters are not corrupted.'],
            ['F', 'Do I need to add it in Spring Boot?', 'No, Boot adds it automatically using UTF-8.'],
            ['M', 'What does force=true do?', 'It sets the encoding on the request even if one is already specified.'],
            ['M', 'Why must it run before other filters?', 'Once a parameter has been read the encoding can no longer be changed.'],
            ['S', 'How do you configure it without Boot?', 'Register CharacterEncodingFilter with encoding UTF-8 in web.xml or WebApplicationInitializer.getServletFilters.'],
            ['S', 'Why does the response also need the charset?', 'The Content-Type header must tell the browser which charset the bytes are in.']],
        [['Boot properties.',
            r`# application.properties
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.enabled=true
server.servlet.encoding.force=true

# OUTPUT:
# POST name=Zoë -> controller receives "Zoë" (not "ZoÃ«")`],
            ['Manual bean.',
                r`@Bean
FilterRegistrationBean<CharacterEncodingFilter> encodingFilter() {
    var f = new CharacterEncodingFilter();
    f.setEncoding("UTF-8");
    f.setForceEncoding(true);
    var bean = new FilterRegistrationBean<>(f);
    bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
    return bean;
}

// OUTPUT:
// Filter order: characterEncodingFilter (highest precedence)`]],
        [['Controller that echoes a form field.',
            r`@PostMapping("/greet")
@ResponseBody
String greet(@RequestParam String name) {
    return "Hello " + name;
}

// OUTPUT:
// POST /greet name=José -> Hello José`],
            ['Test with MockMvc.',
                r`@Test
void utf8() throws Exception {
    mvc.perform(post("/greet")
            .characterEncoding("UTF-8")
            .param("name", "José"))
       .andExpect(content().string("Hello José"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-filter-chain': x(
        ['<b>FilterChain</b> is the object passed to <code>doFilter</code> that represents the remaining filters and finally the servlet.',
            '<b>Calling</b> <code>chain.doFilter(req, res)</code> hands control to the next element; code before the call runs on the way in, code after it runs on the way out.',
            '<b>Like layers of an onion</b>: the first filter wraps all the others and sees the response last.'],
        ['<b>Order</b> is decided by <code>FilterRegistrationBean.setOrder</code> or <code>@Order</code>; lower numbers run first.',
            '<b>Skipping</b>: if a filter does not call the chain, later filters and the servlet never run.',
            '<b>Spring Security</b> adds a single <code>springSecurityFilterChain</code> filter that itself holds an inner list of security filters.'],
        ['<b>Container implementation</b>: Tomcat builds an <code>ApplicationFilterChain</code> per request holding the matching filters in order and an index to the next one.',
            '<b>Multiple chains</b>: <code>FilterChainProxy</code> picks one <code>SecurityFilterChain</code> by request matcher, so /api and /admin can have different rules.',
            '<b>Exceptions</b> propagate back through the chain; a filter can catch them in a try/catch around <code>chain.doFilter</code>.'],
        [['F', 'What is a filter chain?', 'The ordered list of filters a request passes through before reaching the servlet.'],
            ['F', 'What happens if a filter forgets chain.doFilter?', 'The request stops there and the controller never runs.'],
            ['M', 'How do you set filter order in Boot?', 'FilterRegistrationBean.setOrder or @Order on the filter bean.'],
            ['M', 'In what order does the response travel?', 'In reverse: the last filter finishes first, the first filter finishes last.'],
            ['S', 'What is FilterChainProxy?', 'The Spring Security filter that selects a matching SecurityFilterChain and runs its filters.'],
            ['S', 'How can a filter handle exceptions from later ones?', 'Wrap chain.doFilter in try/catch and write an error response.']],
        [['Two filters showing the flow.',
            r`@Component @Order(1)
public class A extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                    FilterChain c) throws ServletException, IOException {
        System.out.println("A in");
        c.doFilter(q, s);
        System.out.println("A out");
    }
}
@Component @Order(2)
public class B extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                    FilterChain c) throws ServletException, IOException {
        System.out.println("B in");
        c.doFilter(q, s);
        System.out.println("B out");
    }
}

// OUTPUT:
// A in
// B in
// B out
// A out`],
            ['Stopping the chain.',
                r`if (req.getParameter("blocked") != null) {
    res.sendError(403);
    return;                    // B and the controller never run
}
chain.doFilter(req, res);

// OUTPUT:
// GET /x?blocked=1 -> 403 (only "A in" then "A out" printed)`]],
        [['Catch downstream errors.',
            r`try {
    chain.doFilter(req, res);
} catch (RuntimeException ex) {
    res.setStatus(500);
    res.getWriter().write("failed: " + ex.getMessage());
}

// OUTPUT:
// HTTP/1.1 500
// failed: boom`],
            ['Test filter order.',
                r`@Test
void order() throws Exception {
    mvc.perform(get("/api/hello")).andExpect(status().isOk());
    // inspect the captured log lines
}

// OUTPUT:
// A in, B in, B out, A out`]]
    ),

    'mvc-filter-ordering': x(
        ['<b>Filter ordering</b> decides which filter runs first; lower order value means earlier on the way in and later on the way out.',
            '<b>In Spring Boot</b> set it with <code>@Order(n)</code> on the filter component or <code>setOrder(n)</code> on a <code>FilterRegistrationBean</code>.',
            '<b>Constants</b>: <code>Ordered.HIGHEST_PRECEDENCE</code> is the smallest int and runs first; <code>LOWEST_PRECEDENCE</code> runs last.'],
        ['<b>Default</b>: a filter without order gets <code>LOWEST_PRECEDENCE</code>, and ties have no guaranteed order.',
            '<b>Boot built-ins</b> have fixed orders, for example the character encoding filter is early and Spring Security default filter order is <code>-100</code> (<code>SecurityProperties.DEFAULT_FILTER_ORDER</code>).',
            '<b>Inside security</b> the order is defined by the position in <code>SecurityFilterChain</code>; use <code>addFilterBefore</code>, <code>addFilterAfter</code> or <code>addFilterAt</code>.'],
        ['<b>@Order on a plain @Component</b> works for Boot-detected filters, but @WebFilter classes ignore it unless wrapped in a registration bean.',
            '<b>Typical sequence</b>: encoding, request id and logging, CORS, security, then rate limiting and business filters.',
            '<b>Debug</b> with <code>logging.level.org.springframework.boot.web.servlet=DEBUG</code> or the startup log of mapped filters to confirm order.'],
        [['F', 'Which filter runs first, order 1 or order 10?', 'Order 1; lower numbers run earlier.'],
            ['F', 'How do you set order on a filter bean?', '@Order on the class or FilterRegistrationBean.setOrder.'],
            ['M', 'What is the default order?', 'LOWEST_PRECEDENCE, so it runs last, and equal values have no defined order.'],
            ['M', 'Why should logging run before security?', 'So that rejected requests (401, 403) are still logged with a request id.'],
            ['S', 'How do you place a filter inside the security chain?', 'Use http.addFilterBefore, addFilterAfter or addFilterAt with a reference filter class.'],
            ['S', 'Why would my @Order be ignored?', 'The filter is declared with @WebFilter or is created in a way that Boot does not read the annotation; use FilterRegistrationBean.']],
        [['Order with annotations.',
            r`@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter { /* ... */ }

@Component
@Order(10)
public class LoggingFilter extends OncePerRequestFilter { /* ... */ }

// OUTPUT:
// Filters: requestIdFilter(order=-2147483648), loggingFilter(order=10)`],
            ['Order with registration bean.',
                r`@Bean
FilterRegistrationBean<RateLimitFilter> rate() {
    var b = new FilterRegistrationBean<>(new RateLimitFilter());
    b.addUrlPatterns("/api/*");
    b.setOrder(20);
    return b;
}

// OUTPUT:
// RateLimitFilter runs after logging (10) and before the servlet`]],
        [['Place a filter in the security chain.',
            r`http.addFilterBefore(new TokenFilter(), UsernamePasswordAuthenticationFilter.class)
    .addFilterAfter(new AuditFilter(), AuthorizationFilter.class);

// OUTPUT:
// Security filters: ... TokenFilter, UsernamePasswordAuthenticationFilter, ... AuditFilter`],
            ['Assert order in a test.',
                r`@Autowired List<FilterRegistrationBean<?>> beans;

@Test
void ordersAreSet() {
    beans.forEach(b -> System.out.println(b.getFilter().getClass().getSimpleName()
        + " " + b.getOrder()));
}

// OUTPUT: (varies)
// RequestIdFilter -2147483648
// LoggingFilter 10`]]
    ),

    'mvc-servlet-basics': x(
        ['<b>Servlet</b> is a Java class (extending <code>jakarta.servlet.http.HttpServlet</code>) that runs inside a container such as Tomcat and handles HTTP requests, producing responses.',
            '<b>Container</b> creates the servlet, calls <code>init</code> once, calls <code>service</code> (which dispatches to <code>doGet</code>, <code>doPost</code> and so on) per request, and calls <code>destroy</code> at shutdown.',
            '<b>Spring MVC</b> is built on one servlet: <code>DispatcherServlet</code> receives every request and routes it to your controllers.'],
        ['<b>Request and response</b>: <code>HttpServletRequest</code> gives parameters, headers and body; <code>HttpServletResponse</code> sets status, headers and writes output.',
            '<b>Mapping</b> with <code>@WebServlet(&quot;/hello&quot;)</code> or in <code>web.xml</code>; in Boot use <code>@ServletComponentScan</code> or <code>ServletRegistrationBean</code>.',
            '<b>Scopes</b>: request attributes, <code>HttpSession</code> and the <code>ServletContext</code> (application scope).'],
        ['<b>Threading</b>: one servlet instance serves all requests concurrently, so instance fields are shared; keep servlets stateless.',
            '<b>Jakarta</b>: since Servlet 5 (Spring 6, Boot 3) packages are <code>jakarta.servlet</code>, not <code>javax.servlet</code>.',
            '<b>Layers</b>: filters wrap servlets; <code>DispatcherServlet</code> then adds handler mapping, adapters, view resolvers and exception resolvers on top.'],
        [['F', 'What is a servlet?', 'A Java class that handles HTTP requests inside a servlet container.'],
            ['F', 'Name the servlet lifecycle methods.', 'init, service (doGet, doPost), and destroy.'],
            ['M', 'How many servlet instances exist?', 'Usually one per declaration, shared by all request threads.'],
            ['M', 'What is DispatcherServlet?', 'The Spring MVC front controller servlet that routes requests to handlers.'],
            ['S', 'Why is javax.servlet missing in Boot 3?', 'Jakarta EE 9 renamed the packages to jakarta.servlet and Spring 6 uses the new names.'],
            ['S', 'How do you make servlets safe for concurrency?', 'Do not store request data in instance fields; use local variables or request attributes.']],
        [['Hello servlet.',
            r`@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        String name = req.getParameter("name");
        res.setContentType("text/plain;charset=UTF-8");
        res.getWriter().println("Hello " + (name == null ? "world" : name));
    }
}

// OUTPUT:
// GET /hello?name=Ann -> Hello Ann
// GET /hello          -> Hello world`],
            ['Register in Spring Boot.',
                r`@SpringBootApplication
@ServletComponentScan                // finds @WebServlet classes
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

// OUTPUT:
// Mapping servlets: dispatcherServlet urls=[/], helloServlet urls=[/hello]`]],
        [['Sessions and attributes.',
            r`HttpSession s = req.getSession();
Integer n = (Integer) s.getAttribute("visits");
s.setAttribute("visits", n == null ? 1 : n + 1);
res.getWriter().println("visits=" + s.getAttribute("visits"));

// OUTPUT:
// visits=1
// visits=2`],
            ['Test a servlet with MockMvc-style mocks.',
                r`@Test
void helloServlet() throws Exception {
    var req = new MockHttpServletRequest("GET", "/hello");
    req.setParameter("name", "Ann");
    var res = new MockHttpServletResponse();
    new HelloServlet().service(req, res);
    System.out.println(res.getContentAsString().trim());
}

// OUTPUT:
// Hello Ann`]]
    ),
};

export const smvc20Deep: Record<string, Deep> = {
    'mvc-filter-vs-interceptor': dv(
        [`<p>The two sit at different layers of the stack.</p><ul><li><b>Filter:</b> Tomcat builds an <code>ApplicationFilterChain</code> and the last element calls the servlet.</li><li><b>Interceptor:</b> <code>DispatcherServlet.doDispatch</code> gets a <code>HandlerExecutionChain</code> from the <code>HandlerMapping</code>.</li><li><b>preHandle</b> runs in order; if one returns false the rest are skipped and <code>afterCompletion</code> runs for those that passed.</li><li><b>postHandle</b> runs in reverse order after the handler but before view rendering.</li></ul>`,
            r`// DispatcherServlet.doDispatch (simplified)
HandlerExecutionChain chain = getHandler(request);
if (!chain.applyPreHandle(request, response)) return;
ModelAndView mv = adapter.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
render(mv, request, response);
chain.triggerAfterCompletion(request, response, null);

// OUTPUT:
// filter-in
// preHandle
// controller
// postHandle
// afterCompletion
// filter-out`],
        [`<p>Variants and options:</p><ul><li><b>Filter:</b> <code>Filter</code>, <code>OncePerRequestFilter</code>, <code>GenericFilterBean</code>.</li><li><b>Interceptor:</b> <code>HandlerInterceptor</code> and <code>AsyncHandlerInterceptor</code>.</li><li><b>Registration:</b> <code>addPathPatterns</code>, <code>excludePathPatterns</code> and <code>order</code> for interceptors.</li><li><b>Alternatives:</b> AOP for service-layer concerns and <code>@ControllerAdvice</code> for responses.</li></ul>`,
            r`@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new AuthInterceptor())
            .addPathPatterns("/admin/**")
            .excludePathPatterns("/admin/login")
            .order(1);
}

// Using the handler in preHandle
if (handler instanceof HandlerMethod hm
        && hm.hasMethodAnnotation(AdminOnly.class)) {
    // check role here
}

// OUTPUT:
// /admin/users -> AuthInterceptor runs
// /admin/login -> skipped`],
        [`<p>Common mistakes:</p><ul><li><b>Using an interceptor for security:</b> static resources and error pages can bypass it; use a filter or Spring Security.</li><li><b>Forgetting to return true</b> in <code>preHandle</code>, so the controller never runs.</li><li><b>Reading the body in an interceptor:</b> the stream is consumed; wrap it in a filter instead.</li><li><b>Interceptor not applied:</b> it was not registered through <code>WebMvcConfigurer</code>.</li><li><b>Modifying the response in postHandle</b> after it is committed has no effect.</li></ul>`,
            r`// WRONG: preHandle with no return value logic
public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object h) {
    log.info("hit");
    return false;               // controller never runs, empty 200 response
}
// RIGHT
public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object h) {
    log.info("hit");
    return true;
}

// OUTPUT:
// WRONG: 200 with empty body
// RIGHT: normal controller response`],
        [`<p>Tuning points:</p><ul><li>Keep both cheap; they run on every request.</li><li>Narrow interceptors with path patterns instead of checking the URL inside.</li><li>Avoid blocking calls (remote auth checks) without caching.</li><li>Use filters only for what must happen before MVC.</li></ul>`,
            r`registry.addInterceptor(new MetricsInterceptor())
        .addPathPatterns("/api/**");     // not static resources

// Cache a remote lookup used by the interceptor
Boolean ok = cache.get(token, t -> remoteCheck(t));

// OUTPUT: (varies)
// avg overhead per request: 0.05 ms`],
        [`<p>Real project layout:</p><ul><li><b>Filters:</b> request id, logging, CORS, JWT authentication.</li><li><b>Interceptors:</b> tenant resolution from the handler annotation, audit of admin actions, locale change.</li><li><b>Reason:</b> auth needs to cover every path, while audit needs controller metadata.</li></ul>`,
            r`// Filter: RequestIdFilter (order 1) -> JwtFilter (security chain)
// Interceptor: AuditInterceptor.afterCompletion logs user + handler method
@Override
public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
                            Object handler, Exception ex) {
    if (handler instanceof HandlerMethod hm) {
        audit.log(req.getUserPrincipal().getName(), hm.getMethod().getName(),
            res.getStatus());
    }
}

// OUTPUT: (varies)
// AUDIT anaji deleteUser 204`]
    ),

    'mvc-filter': dv(
        [`<p>How a filter runs in the container:</p><ul><li>Container reads filter declarations (annotations, web.xml or Boot registration beans) at startup and calls <code>init</code>.</li><li>For each request it matches URL patterns and dispatcher types and builds a chain.</li><li>Each <code>doFilter</code> gets the same request and response objects, or wrappers it passes on.</li><li>When the chain ends the servlet (<code>DispatcherServlet</code> in Spring MVC) is invoked.</li></ul>`,
            r`// Tomcat ApplicationFilterChain (simplified)
public void doFilter(ServletRequest req, ServletResponse res) {
    if (pos < filters.length) {
        filters[pos++].getFilter().doFilter(req, res, this);
    } else {
        servlet.service(req, res);
    }
}

// OUTPUT:
// filter0 -> filter1 -> servlet.service -> filter1 (after) -> filter0 (after)`],
        [`<p>Ways to create a filter:</p><ul><li><b>@Component:</b> maps to <code>/*</code>, simplest.</li><li><b>FilterRegistrationBean:</b> patterns, order, init params, dispatcher types.</li><li><b>@WebFilter</b> with <code>@ServletComponentScan</code>.</li><li><b>DelegatingFilterProxy:</b> bridges a servlet filter to a Spring bean in non-Boot apps.</li></ul>`,
            r`@Bean
FilterRegistrationBean<MyFilter> reg() {
    var b = new FilterRegistrationBean<>(new MyFilter());
    b.addUrlPatterns("/api/*");
    b.setDispatcherTypes(DispatcherType.REQUEST, DispatcherType.ASYNC);
    b.addInitParameter("mode", "strict");
    b.setName("myFilter");
    return b;
}

// OUTPUT:
// Mapping filter: 'myFilter' to urls: [/api/*]`],
        [`<p>Mistakes:</p><ul><li><b>No chain.doFilter</b> on the normal path: request hangs or returns blank.</li><li><b>Reading the body</b> without a wrapper: controller gets an empty body.</li><li><b>Storing state in fields</b>: race conditions.</li><li><b>Swallowing exceptions</b> so errors become empty 200 responses.</li><li><b>Casting</b> to <code>HttpServletRequest</code> without checking when the filter may see other types.</li></ul>`,
            r`// WRONG: body consumed
String body = new String(req.getInputStream().readAllBytes());
chain.doFilter(req, res);                 // controller sees empty body

// RIGHT: cache it
var wrapped = new ContentCachingRequestWrapper((HttpServletRequest) req);
chain.doFilter(wrapped, res);
byte[] body2 = wrapped.getContentAsByteArray();   // available after the controller read

// OUTPUT:
// WRONG: 400 Required request body is missing
// RIGHT: controller works, filter logs body`],
        [`<p>Performance:</p><ul><li>Filters run for every request, including images and CSS; restrict patterns.</li><li>Avoid blocking IO and heavy parsing.</li><li>Wrapping and copying bodies costs memory; set a maximum length.</li><li>Prefer static immutable fields (patterns, config) created once.</li></ul>`,
            r`private static final Pattern BOT = Pattern.compile("(?i)bot|crawler");

@Override
protected boolean shouldNotFilter(HttpServletRequest req) {
    String p = req.getRequestURI();
    return p.startsWith("/static/") || p.endsWith(".css");
}

// OUTPUT: (varies)
// filter time per request: 0.02 ms, skipped for static files`],
        [`<p>Scenario: an API needs an API key check, a request id and a response compression rule.</p><ul><li>Request id filter first, so every log has an id.</li><li>API key filter on <code>/api/*</code> only.</li><li>Rate limit counters held in a thread-safe cache, not in the filter instance.</li></ul>`,
            r`@Component @Order(1)
class RequestIdFilter extends OncePerRequestFilter { /* sets MDC rid */ }

@Component @Order(2)
class ApiKeyFilter extends OncePerRequestFilter {
    private final Set<String> keys = Set.of("k1", "k2");
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                    FilterChain c) throws ServletException, IOException {
        if (!keys.contains(q.getHeader("X-Api-Key"))) {
            s.sendError(401);
            return;
        }
        c.doFilter(q, s);
    }
}

// OUTPUT:
// GET /api/orders                  -> 401
// GET /api/orders (X-Api-Key: k1)  -> 200`]
    ),

    'mvc-onceperrequestfilter': dv(
        [`<p>Inside <code>OncePerRequestFilter.doFilter</code>:</p><ul><li>Computes an attribute name from <code>getAlreadyFilteredAttributeName()</code>: the filter bean name plus <code>.FILTERED</code>.</li><li>If the attribute exists, or <code>shouldNotFilter</code> is true, it just calls <code>chain.doFilter</code>.</li><li>Otherwise sets the attribute, calls <code>doFilterInternal</code>, and removes the attribute in a finally block.</li><li>Async and error dispatch types have their own skip methods.</li></ul>`,
            r`// OncePerRequestFilter.doFilter (simplified)
String name = getAlreadyFilteredAttributeName();
if (request.getAttribute(name) != null || shouldNotFilter(request)) {
    chain.doFilter(request, response);
} else {
    request.setAttribute(name, Boolean.TRUE);
    try {
        doFilterInternal(request, response, chain);
    } finally {
        request.removeAttribute(name);
    }
}

// OUTPUT:
// first dispatch: doFilterInternal runs
// forward dispatch: attribute present, skipped`],
        [`<p>Overridable hooks:</p><ul><li><code>shouldNotFilter(request)</code>: skip by URL or header.</li><li><code>shouldNotFilterAsyncDispatch()</code>: default true, skips ASYNC.</li><li><code>shouldNotFilterErrorDispatch()</code>: default true, skips ERROR.</li><li><code>getAlreadyFilteredAttributeName()</code>: custom attribute key.</li></ul>`,
            r`@Component
public class AsyncAwareFilter extends OncePerRequestFilter {
    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;                 // also run on async dispatch
    }
    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        return false;                 // also run on error dispatch
    }
    @Override
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                    FilterChain c) throws ServletException, IOException {
        c.doFilter(q, s);
    }
}

// OUTPUT:
// runs once per REQUEST, ASYNC and ERROR dispatch`],
        [`<p>Mistakes:</p><ul><li>Extending <code>Filter</code> directly and then seeing duplicated work after a forward.</li><li>Forgetting to call <code>filterChain.doFilter</code> inside <code>doFilterInternal</code>.</li><li>Expecting the filter to run on error pages; the default skips ERROR.</li><li>Doing post-processing for an async controller in the wrong dispatch.</li></ul>`,
            r`// WRONG: chain never continues
protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                FilterChain c) {
    log.info("hit");
}
// RIGHT
protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                FilterChain c) throws ServletException, IOException {
    log.info("hit");
    c.doFilter(q, s);
}

// OUTPUT:
// WRONG: blank 200
// RIGHT: controller response`],
        [`<p>Performance is almost free: one attribute read and write per request. Gains come from <code>shouldNotFilter</code> skipping static files, actuator and health endpoints.</p>`,
            r`@Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String p = request.getServletPath();
    return p.startsWith("/static") || p.startsWith("/actuator")
        || p.endsWith(".ico");
}

// OUTPUT: (varies)
// skipped requests: 38%, p99 latency -1 ms`],
        [`<p>Scenario: a tenant filter reads the <code>X-Tenant</code> header and stores it in a <code>ThreadLocal</code>, which must be cleared after one run.</p>`,
            r`@Component
public class TenantFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {
        try {
            TenantContext.set(req.getHeader("X-Tenant"));
            chain.doFilter(req, res);
        } finally {
            TenantContext.clear();      // threads are reused
        }
    }
}

// OUTPUT:
// X-Tenant: acme -> repository queries use schema acme`]
    ),

    'mvc-request-logging-filter': dv(
        [`<p>How the built-in <code>CommonsRequestLoggingFilter</code> works (it extends <code>AbstractRequestLoggingFilter</code>):</p><ul><li>Its <code>doFilterInternal</code> calls <code>beforeRequest</code> and, after the chain, <code>afterRequest</code>.</li><li>With payload logging it wraps the request in <code>ContentCachingRequestWrapper</code>.</li><li>Messages are built from prefix, URI, query, client, session, headers and payload, then sent to the logger only if DEBUG is on.</li></ul>`,
            r`// Idea of AbstractRequestLoggingFilter (simplified)
if (shouldLog(request)) beforeRequest(request, createMessage(request, "Before request ["));
try {
    chain.doFilter(wrappedRequest, response);
} finally {
    if (shouldLog(request)) afterRequest(request, createMessage(request, "After request ["));
}

// OUTPUT:
// Before request [GET /api/users]
// After request [GET /api/users]`],
        [`<p>Options:</p><ul><li><code>setIncludeQueryString</code>, <code>setIncludeClientInfo</code>, <code>setIncludeHeaders</code>, <code>setIncludePayload</code>.</li><li><code>setMaxPayloadLength</code> limits payload size.</li><li><code>setHeaderPredicate</code> chooses which headers are shown.</li><li>Prefix and suffix text through <code>setBeforeMessagePrefix</code> and similar.</li></ul>`,
            r`@Bean
CommonsRequestLoggingFilter logFilter() {
    var f = new CommonsRequestLoggingFilter();
    f.setIncludeHeaders(true);
    f.setHeaderPredicate(h -> !h.equalsIgnoreCase("authorization"));
    f.setIncludePayload(true);
    f.setMaxPayloadLength(1000);
    f.setAfterMessagePrefix("REQ ");
    return f;
}

// OUTPUT:
// REQ [GET /api/users, headers=[host:"localhost", accept:"*/*"]]`],
        [`<p>Mistakes:</p><ul><li>Logger level not DEBUG, so nothing is printed.</li><li>Logging the payload before the controller reads it: always empty.</li><li>Logging the <code>Authorization</code> header or password fields.</li><li>MDC not cleared.</li><li>Using the same filter in the security chain and as a bean: double logs.</li></ul>`,
            r`// WRONG: reads payload too early
log.info("body=" + new String(wrapper.getContentAsByteArray()));
chain.doFilter(wrapper, res);

// RIGHT: after the chain
chain.doFilter(wrapper, res);
log.info("body=" + new String(wrapper.getContentAsByteArray(), UTF_8));

// OUTPUT:
// WRONG: body=
// RIGHT: body={"name":"Ann"}`],
        [`<p>Performance:</p><ul><li>Use parameterized logging so strings are built only if the level is on.</li><li>Cap payload length and skip binary or upload types.</li><li>Use async appenders for heavy traffic.</li><li>Sample (for example 1 percent) when volume is huge.</li></ul>`,
            r`if (log.isDebugEnabled() && isJson(req)) {
    log.debug("body={}", truncate(body, 500));
}

// logback async
// <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
//   <appender-ref ref="FILE"/>
// </appender>

// OUTPUT: (varies)
// throughput impact: under 2 percent with async appender`],
        [`<p>Scenario: support asks why one customer got a 500. Each log line has a request id from the MDC, so the whole request can be found with one search.</p>`,
            r`@Component @Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                    FilterChain c) throws ServletException, IOException {
        String id = Optional.ofNullable(q.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("rid", id);
        s.setHeader("X-Request-Id", id);
        try { c.doFilter(q, s); } finally { MDC.clear(); }
    }
}

// OUTPUT: (varies)
// 10:01:02 [rid=9e1f] GET /api/orders/7 -> 500 in 31 ms`]
    ),

    'mvc-authentication-filter': dv(
        [`<p>Typical internal flow of a token authentication filter:</p><ul><li>Extract the credential from the request.</li><li>Create an unauthenticated token and pass it to the <code>AuthenticationManager</code>, or validate directly.</li><li>On success build an authenticated <code>Authentication</code> and store it in <code>SecurityContextHolder</code>.</li><li>Continue the chain; later <code>AuthorizationFilter</code> checks roles.</li><li>On failure call an <code>AuthenticationEntryPoint</code> to send 401.</li></ul>`,
            r`protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                FilterChain chain) throws ServletException, IOException {
    String token = resolve(req);
    if (token != null) {
        try {
            Authentication auth = manager.authenticate(new BearerToken(token));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (AuthenticationException e) {
            SecurityContextHolder.clearContext();
            entryPoint.commence(req, res, e);
            return;
        }
    }
    chain.doFilter(req, res);
}

// OUTPUT:
// valid token -> 200, invalid token -> 401`],
        [`<p>Variants:</p><ul><li><b>Basic:</b> <code>BasicAuthenticationFilter</code>.</li><li><b>Form login:</b> <code>UsernamePasswordAuthenticationFilter</code>.</li><li><b>Bearer or JWT:</b> <code>BearerTokenAuthenticationFilter</code> in the resource server module, or a custom filter.</li><li><b>API key:</b> custom filter with a fixed header.</li><li><b>Pre-authenticated:</b> <code>AbstractPreAuthenticatedProcessingFilter</code> for gateway headers.</li></ul>`,
            r`http.oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));

// or custom
http.addFilterBefore(apiKeyFilter, UsernamePasswordAuthenticationFilter.class)
    .exceptionHandling(e -> e.authenticationEntryPoint(
        (req, res, ex) -> res.sendError(401, "Unauthorized")));

// OUTPUT:
// Missing credentials -> 401 Unauthorized`],
        [`<p>Mistakes:</p><ul><li>Registering the filter as a bean as well as in the security chain (runs twice).</li><li>Never clearing or setting the context in a stateless app, so stale users appear.</li><li>Returning 403 for bad credentials instead of 401.</li><li>Comparing secrets with <code>equals</code> (timing attack): use <code>MessageDigest.isEqual</code>.</li><li>Placing the filter after <code>AuthorizationFilter</code>.</li></ul>`,
            r`@Bean
FilterRegistrationBean<TokenFilter> disableAuto(TokenFilter f) {
    var b = new FilterRegistrationBean<>(f);
    b.setEnabled(false);               // only the security chain runs it
    return b;
}

boolean same = MessageDigest.isEqual(a.getBytes(UTF_8), b.getBytes(UTF_8));

// OUTPUT:
// TokenFilter runs once per request`],
        [`<p>Performance:</p><ul><li>Cache validated tokens or use signature-only JWT checks to avoid a database call on each request.</li><li>Skip public paths with <code>shouldNotFilter</code>.</li><li>Do not load full user entities each request unless needed.</li></ul>`,
            r`private final Cache<String, Authentication> cache = Caffeine.newBuilder()
    .maximumSize(10_000).expireAfterWrite(Duration.ofMinutes(1)).build();

Authentication auth = cache.get(token, this::verify);

// OUTPUT: (varies)
// auth cost: 0.1 ms cached vs 4 ms uncached`],
        [`<p>Scenario: a mobile app sends a JWT. The filter validates it, loads roles from claims, and controllers use <code>@PreAuthorize</code> and <code>Principal</code>.</p>`,
            r`@GetMapping("/api/me")
String me(Authentication auth) {
    return auth.getName() + " " + auth.getAuthorities();
}

// OUTPUT:
// GET /api/me (Bearer valid) -> anaji [ROLE_USER]
// GET /api/me (expired)      -> 401`]
    ),

    'mvc-cors-filter': dv(
        [`<p>How CORS processing works:</p><ul><li>Browser sends <code>Origin</code>; for non-simple requests it first sends <code>OPTIONS</code> with <code>Access-Control-Request-Method</code>.</li><li><code>CorsFilter</code> asks a <code>CorsConfigurationSource</code> for a configuration for the path.</li><li><code>DefaultCorsProcessor</code> validates origin, method and headers, and adds response headers.</li><li>For a valid preflight it returns immediately without calling the chain; for a normal request it adds headers and continues.</li></ul>`,
            r`// CorsFilter.doFilterInternal (simplified)
CorsConfiguration cfg = source.getCorsConfiguration(request);
boolean ok = processor.processRequest(cfg, request, response);
if (!ok || CorsUtils.isPreFlightRequest(request)) {
    return;                       // preflight answered here
}
chain.doFilter(request, response);

// OUTPUT:
// OPTIONS -> 200 + CORS headers, no controller call`],
        [`<p>Configuration options:</p><ul><li><code>allowedOrigins</code> or <code>allowedOriginPatterns</code>.</li><li><code>allowedMethods</code>, <code>allowedHeaders</code>, <code>exposedHeaders</code>.</li><li><code>allowCredentials</code> and <code>maxAge</code>.</li><li>Per controller: <code>@CrossOrigin(origins = ..., maxAge = ...)</code>.</li></ul>`,
            r`@Bean
CorsConfigurationSource corsSource() {
    var c = new CorsConfiguration();
    c.setAllowedOriginPatterns(List.of("https://*.example.com"));
    c.setAllowedMethods(List.of("GET", "POST"));
    c.setExposedHeaders(List.of("X-Total-Count"));
    c.setMaxAge(3600L);
    var s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/api/**", c);
    return s;
}

// OUTPUT:
// Access-Control-Allow-Origin: https://app.example.com
// Access-Control-Max-Age: 3600`],
        [`<p>Mistakes:</p><ul><li>Wildcard origin with credentials: Spring throws an error at startup.</li><li>Security blocks preflight (no <code>http.cors</code>).</li><li>Missing <code>OPTIONS</code> in allowed methods in a custom filter.</li><li>Trailing slash or wrong port in the origin string.</li><li>Believing CORS blocks server-to-server calls.</li></ul>`,
            r`// WRONG
c.setAllowedOrigins(List.of("*"));
c.setAllowCredentials(true);          // IllegalArgumentException

// RIGHT
c.setAllowedOriginPatterns(List.of("https://app.example.com"));
c.setAllowCredentials(true);

// OUTPUT:
// WRONG: IllegalArgumentException when allowCredentials is true and origins is *
// RIGHT: works`],
        [`<p>Tuning: set <code>maxAge</code> so browsers cache the preflight result and skip repeat <code>OPTIONS</code> calls; limit allowed paths to the API.</p>`,
            r`c.setMaxAge(Duration.ofHours(1));
// Browser then sends one OPTIONS per hour per URL and method combination

// OUTPUT:
// Access-Control-Max-Age: 3600
// repeat calls: no preflight`],
        [`<p>Scenario: a React app on port 3000 calls a Spring Boot API on port 8080 with cookies. Configure the exact origin, allow credentials, enable <code>http.cors</code>.</p>`,
            r`http.cors(c -> c.configurationSource(corsSource()))
    .csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(a -> a.anyRequest().authenticated());

// OUTPUT:
// fetch("http://localhost:8080/api/me", {credentials:"include"}) -> 200`]
    ),

    'mvc-character-encoding-filter': dv(
        [`<p>How it works:</p><ul><li>Extends <code>OncePerRequestFilter</code>.</li><li>If <code>encoding</code> is set and (<code>forceRequestEncoding</code> or the request has no encoding), it calls <code>request.setCharacterEncoding</code>.</li><li>If <code>forceResponseEncoding</code> is on it calls <code>response.setCharacterEncoding</code>.</li><li>Then it continues the chain.</li><li>Boot configures it in <code>HttpEncodingAutoConfiguration</code> from the <code>server.servlet.encoding</code> properties.</li></ul>`,
            r`// CharacterEncodingFilter.doFilterInternal (simplified)
String encoding = getEncoding();
if (encoding != null) {
    if (isForceRequestEncoding() || request.getCharacterEncoding() == null) {
        request.setCharacterEncoding(encoding);
    }
    if (isForceResponseEncoding()) {
        response.setCharacterEncoding(encoding);
    }
}
filterChain.doFilter(request, response);

// OUTPUT:
// request decoded as UTF-8 before any getParameter call`],
        [`<p>Options in Boot:</p><ul><li><code>server.servlet.encoding.charset</code> (default UTF-8).</li><li><code>server.servlet.encoding.force</code>, <code>force-request</code>, <code>force-response</code>.</li><li><code>server.servlet.encoding.mapping</code> maps locales to encodings.</li><li>Classic: <code>AbstractAnnotationConfigDispatcherServletInitializer.getServletFilters</code>.</li></ul>`,
            r`@Override
protected Filter[] getServletFilters() {
    var f = new CharacterEncodingFilter("UTF-8", true);
    return new Filter[] { f };
}

# application.properties
server.servlet.encoding.force-response=true

// OUTPUT:
// Content-Type: text/html;charset=UTF-8`],
        [`<p>Mistakes:</p><ul><li>Filter registered late: <code>getParameter</code> already ran in an earlier filter.</li><li>Different charset on the HTML page, database connection and filter.</li><li>Setting encoding in a controller after reading parameters.</li><li>Using ISO-8859-1 by default in old projects.</li></ul>`,
            r`// WRONG: too late
String n = req.getParameter("name");
req.setCharacterEncoding("UTF-8");     // ignored

// RIGHT: let the first filter do it
// server.servlet.encoding.force=true

// OUTPUT:
// WRONG: name=ZoÃ«
// RIGHT: name=Zoë`],
        [`<p>The filter is nearly free (two setter calls). The real cost is in debugging mismatches, so standardize on UTF-8 everywhere: filter, <code>&lt;meta charset&gt;</code>, JDBC URL and file encoding.</p>`,
            r`# application.properties
spring.datasource.url=jdbc:mysql://localhost/app?characterEncoding=UTF-8
server.servlet.encoding.charset=UTF-8

# OUTPUT:
# Names with accents round-trip browser -> controller -> database -> browser`],
        [`<p>Scenario: a registration form accepts names in many languages. After enabling UTF-8 and the forced filter, saved names display correctly.</p>`,
            r`@PostMapping("/register")
String register(@RequestParam String name, Model model) {
    model.addAttribute("name", name);
    return "welcome";
}

// OUTPUT:
// POST name=Zoë -> welcome page shows: Zoë`]
    ),

    'mvc-filter-chain': dv(
        [`<p>Servlet container chain:</p><ul><li><b>Tomcat:</b> <code>ApplicationFilterFactory.createFilterChain</code> collects filter maps whose URL and dispatcher type match.</li><li><b>Spring Security:</b> <code>FilterChainProxy.doFilter</code> finds the first <code>SecurityFilterChain</code> whose matcher accepts the request and runs a <code>VirtualFilterChain</code> over its filters, then continues the outer chain.</li><li>Each wrapper object created along the way is what later filters see.</li></ul>`,
            r`// FilterChainProxy (simplified)
List<Filter> filters = getFilters(request);   // matching SecurityFilterChain
if (filters == null || filters.isEmpty()) {
    chain.doFilter(request, response);
    return;
}
new VirtualFilterChain(chain, filters).doFilter(request, response);

// OUTPUT:
// /api/** -> chain A (JWT), /web/** -> chain B (form login)`],
        [`<p>Options for building chains:</p><ul><li>Several <code>SecurityFilterChain</code> beans with <code>securityMatcher</code> and <code>@Order</code>.</li><li>Servlet filters through <code>FilterRegistrationBean</code>.</li><li>Dispatcher types (REQUEST, FORWARD, INCLUDE, ERROR, ASYNC).</li></ul>`,
            r`@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}
@Bean @Order(2)
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a.anyRequest().permitAll());
    return http.build();
}

// OUTPUT:
// /api/x -> basic auth required; /home -> open`],
        [`<p>Mistakes:</p><ul><li>Not calling the chain on the happy path.</li><li>Calling the chain twice (duplicate responses).</li><li>Writing to the response and then calling the chain.</li><li>Catching exceptions and hiding them.</li><li>Putting a catch-all <code>SecurityFilterChain</code> first so later ones never match.</li></ul>`,
            r`// WRONG: calls chain twice
chain.doFilter(req, res);
chain.doFilter(req, res);   // IllegalStateException or duplicate work

// RIGHT: once
chain.doFilter(req, res);

// OUTPUT:
// WRONG: IllegalStateException: response already committed (varies)
// RIGHT: single response`],
        [`<p>Chain length adds cost to every request. Remove unused filters, narrow URL patterns, and put cheap rejecting filters (rate limit, auth) early so expensive work is skipped.</p>`,
            r`// Order for cheap rejection first
// 1 RequestId, 2 RateLimit (reject 429), 3 Auth (reject 401), 4 Business filters

// OUTPUT: (varies)
// rejected requests cost 0.1 ms instead of reaching the controller`],
        [`<p>Scenario: debugging "why is my header missing". Print the filter chain in order from the startup log or the Boot actuator <code>/actuator/mappings</code> and check position of the filter.</p>`,
            r`# application.properties
logging.level.org.springframework.security=DEBUG

// OUTPUT: (varies)
// Security filter chain: [DisableEncodeUrlFilter, SecurityContextHolderFilter,
//   HeaderWriterFilter, CorsFilter, LogoutFilter, TokenFilter, ...]`]
    ),

    'mvc-filter-ordering': dv(
        [`<p>Ordering internals:</p><ul><li>Boot collects <code>Filter</code> beans and <code>FilterRegistrationBean</code> beans in <code>ServletContextInitializerBeans</code>.</li><li>It sorts them with <code>AnnotationAwareOrderComparator</code>, which reads <code>Ordered</code> or <code>@Order</code>.</li><li>The sorted list is registered in the servlet context in that order, and the container keeps registration order for the chain.</li><li>Inside security, <code>FilterOrderRegistry</code> assigns a number to each known filter class and custom filters are placed relative to them.</li></ul>`,
            r`// AnnotationAwareOrderComparator sorts ascending
// HIGHEST_PRECEDENCE = Integer.MIN_VALUE  -> first
// LOWEST_PRECEDENCE  = Integer.MAX_VALUE  -> last
List<ServletContextInitializer> sorted = new ArrayList<>(all);
sorted.sort(AnnotationAwareOrderComparator.INSTANCE);

// OUTPUT:
// order -2147483648 (requestId), -100 (security), 10 (logging), 2147483647 (default)`],
        [`<p>Ways to control order:</p><ul><li><code>@Order</code> on a filter bean.</li><li>Implement <code>Ordered</code>.</li><li><code>FilterRegistrationBean.setOrder</code>.</li><li><code>addFilterBefore</code>, <code>addFilterAfter</code>, <code>addFilterAt</code> in security.</li><li>Constants from <code>OrderedFilter</code> such as <code>REQUEST_WRAPPER_FILTER_MAX_ORDER</code> in Boot.</li></ul>`,
            r`@Component
public class MyFilter extends OncePerRequestFilter implements Ordered {
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
                                    FilterChain c) throws ServletException, IOException {
        c.doFilter(q, s);
    }
}

// OUTPUT:
// MyFilter order = -2147483638`],
        [`<p>Mistakes:</p><ul><li>Same order number for two filters: unpredictable.</li><li>Placing a logging filter after security, so 401 requests are not logged.</li><li>Placing a CORS filter after security, so preflight gets 401.</li><li>Using @Order on a filter created with <code>new</code> inside a configuration (not a bean).</li><li>Assuming @Order on @WebFilter works.</li></ul>`,
            r`// WRONG: ties
@Order(1) class A ...
@Order(1) class B ...

// RIGHT: unique values with gaps
@Order(10) class A ...
@Order(20) class B ...

// OUTPUT:
// WRONG: order of A and B may change between runs
// RIGHT: A then B`],
        [`<p>Place cheap rejecting filters before expensive ones, and keep an ordering table in your documentation. Leave gaps (10, 20, 30) so new filters can be inserted without renumbering.</p>`,
            r`// Convention
// -2147483648 .. -101  infrastructure (encoding, request id)
// -100                 Spring Security
// 0 .. 100             application filters
// 1000+                late, optional

// OUTPUT:
// clear and stable filter order across the code base`],
        [`<p>Scenario: logs show requests rejected with 401 but no request id. The request id filter was ordered after the security filter; moving it to <code>HIGHEST_PRECEDENCE</code> fixes it.</p>`,
            r`@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter { /* ... */ }

// OUTPUT: (varies)
// before: 401 GET /api/me
// after:  [rid=ab12cd34] 401 GET /api/me`]
    ),

    'mvc-servlet-basics': dv(
        [`<p>How the container runs a servlet:</p><ul><li>Container (Tomcat) loads the class, creates one instance and calls <code>init(ServletConfig)</code>.</li><li>A connector thread parses the HTTP request into <code>HttpServletRequest</code> and calls <code>service</code>.</li><li><code>HttpServlet.service</code> picks <code>doGet</code>, <code>doPost</code> and so on by the HTTP method.</li><li>When the response is complete the thread returns to the pool.</li><li>On shutdown <code>destroy</code> is called.</li><li>In Spring MVC the single <code>DispatcherServlet</code> does the above and then uses <code>HandlerMapping</code> to find your controller.</li></ul>`,
            r`public class DemoServlet extends HttpServlet {
    @Override public void init() { System.out.println("init"); }
    @Override protected void doGet(HttpServletRequest q, HttpServletResponse s)
            throws IOException {
        s.getWriter().println("GET by " + Thread.currentThread().getName());
    }
    @Override public void destroy() { System.out.println("destroy"); }
}

// OUTPUT: (varies)
// init
// GET by http-nio-8080-exec-1
// destroy`],
        [`<p>Servlet features:</p><ul><li><b>Methods:</b> <code>doGet</code>, <code>doPost</code>, <code>doPut</code>, <code>doDelete</code>.</li><li><b>Reading input:</b> <code>getParameter</code>, <code>getHeader</code>, <code>getInputStream</code>, <code>getReader</code>.</li><li><b>Output:</b> <code>setStatus</code>, <code>setHeader</code>, <code>sendRedirect</code>, <code>getWriter</code>.</li><li><b>Forwarding:</b> <code>RequestDispatcher.forward</code> and <code>include</code>.</li><li><b>Other:</b> <code>@MultipartConfig</code> for uploads, <code>startAsync</code> for async.</li></ul>`,
            r`@WebServlet(urlPatterns = "/api/echo", loadOnStartup = 1)
public class EchoServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        String body = new String(req.getInputStream().readAllBytes(), UTF_8);
        res.setStatus(201);
        res.setContentType("application/json");
        res.getWriter().write("{\"echo\":\"" + body + "\"}");
    }
}

// OUTPUT:
// POST /api/echo hi -> 201 {"echo":"hi"}`],
        [`<p>Mistakes:</p><ul><li>Storing request data in instance fields (shared by all threads).</li><li>Using <code>javax.servlet</code> imports with Boot 3.</li><li>Calling <code>getWriter</code> and <code>getOutputStream</code> on the same response.</li><li>Forwarding or redirecting after the response is committed.</li><li>Forgetting <code>@ServletComponentScan</code>, so <code>@WebServlet</code> is ignored in Boot.</li></ul>`,
            r`// WRONG: shared mutable field
public class BadServlet extends HttpServlet {
    private String user;                        // race condition
    protected void doGet(HttpServletRequest q, HttpServletResponse s) {
        user = q.getParameter("u");
    }
}
// RIGHT: local variable
protected void doGet(HttpServletRequest q, HttpServletResponse s) {
    String user = q.getParameter("u");
}

// OUTPUT:
// WRONG: users see each other's data under load
// RIGHT: thread safe`],
        [`<p>Tuning:</p><ul><li>Tomcat thread pool: <code>server.tomcat.threads.max</code> (default 200).</li><li>Do not block request threads for long; use async or a separate executor.</li><li>Enable compression with <code>server.compression.enabled</code>.</li><li>Use <code>loadOnStartup</code> so the first request is not slow.</li></ul>`,
            r`# application.properties
server.tomcat.threads.max=200
server.tomcat.accept-count=100
server.compression.enabled=true

# OUTPUT:
# Tomcat started on port 8080;
up to 200 concurrent request threads`],
        [`<p>Scenario: a legacy servlet endpoint must live next to Spring MVC controllers. Register it with a <code>ServletRegistrationBean</code> on a path outside the dispatcher.</p>`,
            r`@Bean
ServletRegistrationBean<LegacyServlet> legacy() {
    var b = new ServletRegistrationBean<>(new LegacyServlet(), "/legacy/*");
    b.setLoadOnStartup(1);
    return b;
}

// OUTPUT:
// GET /legacy/report -> LegacyServlet
// GET /api/users     -> DispatcherServlet -> UserController`]
    ),
};
