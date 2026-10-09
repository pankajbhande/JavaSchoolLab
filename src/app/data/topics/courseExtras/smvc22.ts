// Spring extras, batch smvc22 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc22Extras: Record<string, Extra> = {
    'mvc-dispatcherservlet-and-servlet-container': x(
        ['<b>DispatcherServlet</b> is the front controller of Spring MVC: one servlet that receives every request and hands it to the right controller.',
            '<b>Servlet container</b> (Tomcat, Jetty, Undertow) accepts the HTTP connection, builds <code>HttpServletRequest</code> and <code>HttpServletResponse</code> and calls the servlet.',
            '<b>Flow</b>: container, filters, DispatcherServlet, HandlerMapping, HandlerAdapter, controller, view or message converter, response.'],
        ['<b>Registration</b>: Spring Boot registers it through <code>DispatcherServletAutoConfiguration</code> mapped to <code>/</code>; a classic app uses <code>web.xml</code> or <code>AbstractAnnotationConfigDispatcherServletInitializer</code>.',
            '<b>Strategies</b>: it delegates to beans such as <code>HandlerMapping</code>, <code>HandlerAdapter</code>, <code>ViewResolver</code> and <code>HandlerExceptionResolver</code>.',
            '<b>Contexts</b>: the servlet owns a WebApplicationContext, which can have a parent root context holding services and repositories.'],
        ['<b>Threading</b>: the container uses one thread per request from its pool, so controllers must be stateless or thread-safe.',
            '<b>Embedded vs external</b>: Boot embeds Tomcat and runs a jar; a WAR is deployed into an external container through <code>SpringBootServletInitializer</code>.',
            '<b>Tuning</b>: <code>server.tomcat.threads.max</code> and <code>spring.mvc.servlet.path</code> change capacity and the mapping.'],
        [['F', 'What is DispatcherServlet?', 'The front controller servlet of Spring MVC that routes every request to a handler.'],
            ['F', 'What is a servlet container?', 'A server such as Tomcat that manages servlets, threads and the HTTP protocol.'],
            ['M', 'What does HandlerMapping do?', 'It finds the handler (controller method) for the request, based on URL, method and headers.'],
            ['M', 'Why a HandlerAdapter?', 'It lets the servlet call different handler types in one uniform way, for example annotated methods.'],
            ['S', 'Where do filters run compared with DispatcherServlet?', 'Filters run in the container before the servlet; interceptors run inside it, around the handler.'],
            ['S', 'How do you register more than one DispatcherServlet?', 'Declare extra ServletRegistrationBean beans, each with its own context and URL mapping.']],
        [['Print the dispatcher bean and its mapping in a Boot app.',
            r`@SpringBootApplication
public class App {
    public static void main(String[] args) {
        var ctx = SpringApplication.run(App.class, args);
        System.out.println(ctx.getBean("dispatcherServlet").getClass().getSimpleName());
        System.out.println(ctx.getBean("dispatcherServletRegistration",
            ServletRegistrationBean.class).getUrlMappings());
    }
}

// OUTPUT:
// DispatcherServlet
// [/]`],
            ['Log every step with a filter and a controller.',
                r`@Component
class TraceFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        System.out.println("filter before " + req.getRequestURI());
        chain.doFilter(req, res);
        System.out.println("filter after " + res.getStatus());
    }
}
@RestController
class HelloController {
    @GetMapping("/hello")
    String hello() { System.out.println("controller"); return "hi"; }
}

// OUTPUT:
// filter before /hello
// controller
// filter after 200`]],
        [['Test the full dispatch path with MockMvc.',
            r`@WebMvcTest(HelloController.class)
class HelloTest {
    @Autowired MockMvc mvc;
    @Test
    void hello() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(content().string("hi"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Change the servlet path.',
                r`# application.properties
spring.mvc.servlet.path=/api
server.servlet.context-path=/shop

# OUTPUT:
# GET http://localhost:8080/shop/api/hello  -> 200 hi
# GET http://localhost:8080/shop/hello      -> 404`]]
    ),
    'mvc-http-session': x(
        ['<b>HTTP session</b> is server-side memory that remembers one user across several requests, because HTTP itself is stateless.',
            '<b>Session id</b>: the server creates a random id and sends it to the browser, usually in the <code>JSESSIONID</code> cookie; the browser returns it on each request.',
            '<b>Data lives on the server</b>: only the id travels over the network, never the stored objects.'],
        ['<b>Lifecycle</b>: created on first <code>getSession()</code>, kept alive by each request, destroyed by <code>invalidate()</code> or by timeout.',
            '<b>Typical use</b>: login state, shopping cart, wizard steps and flash data between pages.',
            '<b>Container managed</b>: Tomcat keeps a session manager with a map from id to session object.'],
        ['<b>Memory</b>: each session costs heap, so store small ids and not big object graphs.',
            '<b>Scaling</b>: with several servers use sticky sessions or a shared store such as Spring Session with Redis.',
            '<b>Security</b>: use HTTPS, <code>HttpOnly</code> and <code>Secure</code> cookies and a new id after login.'],
        [['F', 'Why do we need sessions?', 'HTTP is stateless, so a session lets the server link requests from the same user.'],
            ['F', 'What is JSESSIONID?', 'The default cookie name that carries the servlet session id.'],
            ['M', 'Where is session data stored?', 'In server memory by default; only the id is sent to the client.'],
            ['M', 'How does a session end?', 'By invalidate(), by the inactivity timeout, or when the server restarts without persistence.'],
            ['S', 'What breaks sessions in a cluster?', 'A request landing on a node that does not hold the session; fix with sticky sessions or a shared store.'],
            ['S', 'What is session fixation?', 'An attacker sets a known session id before login; defend by changing the id after authentication.']],
        [['Count visits per user.',
            r`@RestController
class VisitController {
    @GetMapping("/visits")
    String visits(HttpSession session) {
        Integer n = (Integer) session.getAttribute("n");
        n = (n == null) ? 1 : n + 1;
        session.setAttribute("n", n);
        return "visit " + n + " id=" + session.getId().substring(0, 6);
    }
}

// OUTPUT: (varies)
// GET /visits -> visit 1 id=7F3A91
// GET /visits -> visit 2 id=7F3A91   (same cookie)`],
            ['Invalidate on logout.',
                r`@PostMapping("/logout")
String logout(HttpSession session) {
    session.invalidate();
    return "redirect:/login";
}

// OUTPUT:
// HTTP/1.1 302  Location: /login
// the old JSESSIONID is no longer valid`]],
        [['Test a session with MockMvc.',
            r`@Test
void keepsCounter() throws Exception {
    MockHttpSession s = new MockHttpSession();
    mvc.perform(get("/visits").session(s)).andExpect(content().string(startsWith("visit 1")));
    mvc.perform(get("/visits").session(s)).andExpect(content().string(startsWith("visit 2")));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Inspect the cookie with curl.',
                r`curl -i -c jar.txt http://localhost:8080/visits
curl -b jar.txt http://localhost:8080/visits

# OUTPUT: (varies)
# Set-Cookie: JSESSIONID=7F3A91...; Path=/; HttpOnly
# visit 2`]]
    ),
    'mvc-httpsession-session': x(
        ['<b>HttpSession</b> is the servlet API interface (<code>jakarta.servlet.http.HttpSession</code>) that represents one user session.',
            '<b>Get it</b> by adding it as a controller parameter, or call <code>request.getSession()</code>.',
            '<b>Main methods</b>: <code>setAttribute</code>, <code>getAttribute</code>, <code>removeAttribute</code>, <code>invalidate</code>, <code>getId</code> and <code>setMaxInactiveInterval</code>.'],
        ['<b>getSession(false)</b> returns null instead of creating a session, which avoids useless sessions for anonymous users.',
            '<b>Metadata</b>: <code>getCreationTime</code>, <code>getLastAccessedTime</code> and <code>isNew</code> describe the session.',
            '<b>Listeners</b>: <code>HttpSessionListener</code> and <code>HttpSessionAttributeListener</code> react to creation, destruction and attribute changes.'],
        ['<b>Serializable</b>: attributes should implement <code>Serializable</code> so they survive persistence and replication.',
            '<b>Thread safety</b>: one user may send parallel requests, so guard mutable attributes with synchronization or use immutable values.',
            '<b>Binding events</b>: an attribute implementing <code>HttpSessionBindingListener</code> is told when it is added or removed.'],
        [['F', 'How do you get the HttpSession in a controller?', 'Declare an HttpSession parameter or call request.getSession().'],
            ['F', 'Which method destroys a session?', 'invalidate().'],
            ['M', 'getSession() versus getSession(false)?', 'getSession() creates one if missing; getSession(false) returns null.'],
            ['M', 'What does isNew mean?', 'The client has not yet joined the session, so it is the first request.'],
            ['S', 'Is HttpSession thread-safe?', 'The container makes the object itself safe to access, but the objects you store are not, so protect them.'],
            ['S', 'Why make attributes Serializable?', 'The container may write sessions to disk or replicate them to other nodes.']],
        [['Store and read a user object.',
            r`record LoginUser(String name, String role) implements Serializable {}

@PostMapping("/login")
String login(String name, HttpSession session) {
    session.setAttribute("user", new LoginUser(name, "USER"));
    session.setMaxInactiveInterval(900);       // 15 minutes
    return "redirect:/home";
}
@GetMapping("/home")
@ResponseBody
String home(HttpSession session) {
    LoginUser u = (LoginUser) session.getAttribute("user");
    return u == null ? "guest" : "hello " + u.name();
}

// OUTPUT:
// POST /login name=asha -> 302 /home
// GET /home -> hello asha`],
            ['Do not create sessions for anonymous reads.',
                r`@GetMapping("/peek")
@ResponseBody
String peek(HttpServletRequest req) {
    HttpSession s = req.getSession(false);
    return s == null ? "no session" : "session " + s.getId().substring(0, 6);
}

// OUTPUT: (varies)
// first call without cookie -> no session`]],
        [['Session listener that counts active sessions.',
            r`@Component
public class SessionCounter implements HttpSessionListener {
    private final AtomicInteger active = new AtomicInteger();
    public void sessionCreated(HttpSessionEvent e) {
        System.out.println("active=" + active.incrementAndGet());
    }
    public void sessionDestroyed(HttpSessionEvent e) {
        System.out.println("active=" + active.decrementAndGet());
    }
}

// OUTPUT:
// active=1
// active=2
// active=1`],
            ['Test that login stores the user.',
                r`@Test
void loginStoresUser() throws Exception {
    MvcResult res = mvc.perform(post("/login").param("name", "asha"))
        .andExpect(status().is3xxRedirection()).andReturn();
    HttpSession s = res.getRequest().getSession();
    assertEquals("asha", ((LoginUser) s.getAttribute("user")).name());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-session-attributes': x(
        ['<b>@SessionAttributes</b> on a controller class lists model attribute names that Spring keeps in the HTTP session between requests.',
            '<b>@SessionAttribute</b> (singular) on a method parameter reads one existing session attribute, for example <code>@SessionAttribute(&quot;user&quot;) User u</code>.',
            '<b>SessionStatus</b>: call <code>status.setComplete()</code> to remove the attributes that <code>@SessionAttributes</code> stored.'],
        ['<b>Scope</b>: <code>@SessionAttributes</code> only applies to the controller that declares it; it does not read attributes set elsewhere.',
            '<b>Wizard pattern</b>: keep a form object across several pages, then complete it on the last step.',
            '<b>required</b>: <code>@SessionAttribute(required = false)</code> gives null instead of an exception when the attribute is missing.'],
        ['<b>Handled by</b> <code>SessionAttributesHandler</code> and the <code>SessionAttributeStore</code> inside <code>RequestMappingHandlerAdapter</code>.',
            '<b>Pitfall</b>: data stays until <code>setComplete()</code> or timeout, so forgotten cleanup leaks memory.',
            '<b>Alternative</b>: for a plain value use <code>HttpSession</code> directly or a session-scoped bean.'],
        [['F', 'What does @SessionAttributes do?', 'It stores the named model attributes in the session so they survive across requests.'],
            ['F', 'Which annotation reads a session value?', '@SessionAttribute on a method parameter.'],
            ['M', 'How do you clear @SessionAttributes data?', 'Call setComplete() on a SessionStatus parameter.'],
            ['M', 'Can another controller see them?', 'No, they are managed per controller through its handler; use plain HttpSession to share.'],
            ['S', 'Which class stores the attributes?', 'DefaultSessionAttributeStore, called from SessionAttributesHandler.'],
            ['S', 'What happens if a required @SessionAttribute is absent?', 'Spring throws ServletRequestBindingException, which becomes a 400 response.']],
        [['Multi-step form with a session-held object.',
            r`@Controller
@SessionAttributes("order")
class OrderWizard {
    @ModelAttribute("order") Order order() { return new Order(); }

    @PostMapping("/wizard/step1")
    String step1(@ModelAttribute("order") Order o, String item) {
        o.setItem(item); return "redirect:/wizard/step2";
    }
    @PostMapping("/wizard/done")
    @ResponseBody
    String done(@ModelAttribute("order") Order o, SessionStatus status) {
        status.setComplete();                       // removes it from the session
        return "saved " + o.getItem();
    }
}

// OUTPUT:
// POST step1 item=pen -> 302
// POST done -> saved pen`],
            ['Read a value set at login.',
                r`@GetMapping("/profile")
@ResponseBody
String profile(@SessionAttribute(name = "user", required = false) String user) {
    return user == null ? "please log in" : "profile of " + user;
}

// OUTPUT:
// without login -> please log in
// after login   -> profile of asha`]],
        [['Test with sessionAttr.',
            r`@Test
void profile() throws Exception {
    mvc.perform(get("/profile").sessionAttr("user", "asha"))
       .andExpect(content().string("profile of asha"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Check that the attribute is in the session.',
                r`mvc.perform(post("/wizard/step1").param("item", "pen"))
   .andExpect(request().sessionAttribute("order", notNullValue()));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-session-timeout': x(
        ['<b>Session timeout</b> is the number of idle seconds after which the container destroys a session; each request resets the clock.',
            '<b>Spring Boot property</b>: <code>server.servlet.session.timeout=30m</code>.',
            '<b>Per session</b>: <code>session.setMaxInactiveInterval(seconds)</code> overrides the default; a negative value means never expire.'],
        ['<b>Default</b>: the servlet default is 30 minutes, and Tomcat rounds the value to whole minutes.',
            '<b>web.xml</b>: <code>session-config / session-timeout</code> takes minutes, not seconds.',
            '<b>After expiry</b>: <code>getSession(false)</code> is null, and the user must log in again.'],
        ['<b>Spring Security</b>: configure <code>sessionManagement().invalidSessionUrl(...)</code> to redirect users whose session expired.',
            '<b>Token-based apps</b> use token expiry instead of a server session.',
            '<b>UX</b>: warn the user before expiry or refresh the session with a periodic call.'],
        [['F', 'What is the default session timeout?', 'Usually 30 minutes of inactivity.'],
            ['F', 'How to set it in Boot?', 'server.servlet.session.timeout in application.properties.'],
            ['M', 'What resets the timer?', 'Any request that carries the session id.'],
            ['M', 'Unit in web.xml?', 'Minutes.'],
            ['S', 'How do you handle expired sessions in Spring Security?', 'Use invalidSessionUrl or an InvalidSessionStrategy to send the user to a login page with a message.'],
            ['S', 'Why can a timeout cause lost form data?', 'A long form edit sends no requests, so the session may expire before submit; save drafts or ping the server.']],
        [['Set the timeout in properties and in code.',
            r`# application.properties
server.servlet.session.timeout=15m

// in a controller
@GetMapping("/short")
@ResponseBody
String shortSession(HttpSession s) {
    s.setMaxInactiveInterval(60);
    return "timeout=" + s.getMaxInactiveInterval();
}

// OUTPUT:
// timeout=60`],
            ['Redirect after expiry with Spring Security.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .sessionManagement(s -> s.invalidSessionUrl("/login?expired"));
    return http.build();
}

// OUTPUT:
// expired cookie -> 302 Location: /login?expired`]],
        [['Test the configured interval.',
            r`@Test
void interval() throws Exception {
    MockHttpSession s = new MockHttpSession();
    s.setMaxInactiveInterval(60);
    assertEquals(60, s.getMaxInactiveInterval());
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Listener logs expiry.',
                r`@Override
public void sessionDestroyed(HttpSessionEvent e) {
    System.out.println("destroyed " + e.getSession().getId());
}

// OUTPUT: (varies)
// destroyed 7F3A91C2...   (logged by the container after the idle time)`]]
    ),
    'mvc-cookie-based-session': x(
        ['<b>Cookie-based session</b> means the browser stores only a session id cookie (such as <code>JSESSIONID</code>) while the real data stays on the server.',
            '<b>Round trip</b>: the server answers with <code>Set-Cookie</code>; the browser sends <code>Cookie: JSESSIONID=...</code> on each later request to that site.',
            '<b>Default</b>: the container prefers cookies for session tracking and falls back to URL rewriting only if cookies are off.'],
        ['<b>Cookie flags</b>: <code>HttpOnly</code> hides it from JavaScript, <code>Secure</code> sends it only over HTTPS, <code>SameSite</code> limits cross-site sending.',
            '<b>Boot properties</b>: <code>server.servlet.session.cookie.name</code>, <code>.http-only</code>, <code>.secure</code>, <code>.same-site</code> and <code>.max-age</code>.',
            '<b>Tracking modes</b>: <code>server.servlet.session.tracking-modes=cookie</code> turns off URL rewriting.'],
        ['<b>Client-side sessions</b> (signed cookies holding data) remove server memory but are limited to about 4 KB and need signing or encryption.',
            '<b>CSRF</b>: because browsers attach the cookie automatically, state-changing requests need a CSRF token.',
            '<b>Spring Session</b> replaces the container manager and can use a cookie or a header to carry the id.'],
        [['F', 'What does the browser keep in a cookie session?', 'Only the session id, not the user data.'],
            ['F', 'Which header sets the cookie?', 'Set-Cookie in the response.'],
            ['M', 'What does HttpOnly do?', 'It stops JavaScript from reading the cookie, which limits theft through XSS.'],
            ['M', 'What does SameSite do?', 'It limits when the browser sends the cookie on cross-site requests, reducing CSRF risk.'],
            ['S', 'Why is a CSRF token still needed?', 'The browser sends the cookie automatically, so a malicious site could trigger actions; the token proves intent.'],
            ['S', 'How do you rename JSESSIONID in Boot?', 'Set server.servlet.session.cookie.name.']],
        [['Harden the session cookie.',
            r`# application.properties
server.servlet.session.cookie.name=APPSESSION
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=lax
server.servlet.session.tracking-modes=cookie

# OUTPUT:
# Set-Cookie: APPSESSION=ab12...; Path=/; Secure; HttpOnly; SameSite=Lax`],
            ['Show the cookie exchange.',
                r`@GetMapping("/hello")
@ResponseBody
String hello(HttpSession s) { return "id=" + s.getId().substring(0, 4); }

// OUTPUT: (varies)
// 1st response: Set-Cookie: APPSESSION=ab12...   body: id=ab12
// 2nd request:  Cookie: APPSESSION=ab12...       body: id=ab12`]],
        [['Test that the cookie is set.',
            r`mvc.perform(get("/hello"))
   .andExpect(request().sessionAttributeDoesNotExist("x"));
// MockMvc keeps the session object; check the real cookie with an integration test:
ResponseEntity<String> r = rest.getForEntity("/hello", String.class);
assertTrue(r.getHeaders().getFirst("Set-Cookie").contains("APPSESSION"));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Inspect with curl.',
                r`curl -i http://localhost:8080/hello

# OUTPUT: (varies)
# HTTP/1.1 200
# Set-Cookie: APPSESSION=ab12...; Path=/; HttpOnly`]]
    ),
    'mvc-url-rewriting': x(
        ['<b>URL rewriting</b> keeps the session id in the URL, for example <code>/cart;jsessionid=ABC123</code>, for browsers that block cookies.',
            '<b>Encode links</b>: call <code>response.encodeURL(url)</code>; it appends the id only when the container needs it.',
            '<b>Fallback only</b>: containers use cookies first and add the id to URLs when no cookie came back.'],
        ['<b>Redirects</b>: use <code>encodeRedirectURL</code> for <code>sendRedirect</code> targets.',
            '<b>Security risk</b>: the id appears in logs, history, bookmarks and the Referer header, so it can leak and enable hijacking.',
            '<b>Spring Security</b> rejects URLs with <code>;jsessionid</code> through <code>StrictHttpFirewall</code>.'],
        ['<b>Disable it</b> in Boot with <code>server.servlet.session.tracking-modes=cookie</code>.',
            '<b>Thymeleaf</b> link expressions encode URLs automatically, which is how the id can appear unexpectedly.',
            '<b>Modern practice</b>: avoid rewriting; use cookies or tokens in a header.'],
        [['F', 'What is URL rewriting?', 'Adding the session id to the URL so the server can track the session without cookies.'],
            ['F', 'Which method adds the id?', 'HttpServletResponse.encodeURL.'],
            ['M', 'Why is it risky?', 'The id can leak through logs, browser history and Referer headers.'],
            ['M', 'How do you turn it off in Boot?', 'Set tracking-modes to cookie.'],
            ['S', 'Why do you sometimes see jsessionid in a Thymeleaf link?', 'Thymeleaf calls encodeURL, and on the first request no cookie exists yet so the id is appended.'],
            ['S', 'How does Spring Security react to it?', 'The firewall blocks semicolons in the path, so such requests fail with 400.']],
        [['Encode a link manually.',
            r`@GetMapping("/links")
@ResponseBody
String links(HttpServletRequest req, HttpServletResponse res) {
    req.getSession();                       // make sure a session exists
    return res.encodeURL("/cart");
}

// OUTPUT: (varies)
// first request, no cookie yet: /cart;jsessionid=7F3A91C2
// with cookie present:          /cart`],
            ['Switch rewriting off.',
                r`# application.properties
server.servlet.session.tracking-modes=cookie

# OUTPUT:
# /cart   (never carries jsessionid; cookie-less clients lose the session)`]],
        [['Test that no id is appended.',
            r`@Test
void noJsessionId() throws Exception {
    String body = mvc.perform(get("/links")).andReturn().getResponse().getContentAsString();
    assertFalse(body.contains("jsessionid"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Redirect with encoding.',
                r`@GetMapping("/go")
void go(HttpServletResponse res) throws IOException {
    res.sendRedirect(res.encodeRedirectURL("/cart"));
}

// OUTPUT:
// HTTP/1.1 302  Location: /cart`]]
    ),
    'mvc-session-management': x(
        ['<b>Session management</b> covers how an app creates, protects, limits and ends user sessions.',
            '<b>Spring Security</b> configures it through <code>http.sessionManagement(...)</code>: creation policy, fixation protection and concurrency limits.',
            '<b>Creation policy</b>: <code>IF_REQUIRED</code> (default), <code>ALWAYS</code>, <code>NEVER</code> or <code>STATELESS</code>.'],
        ['<b>Fixation protection</b>: by default Security changes the session id after login (<code>changeSessionId</code>).',
            '<b>Concurrent sessions</b>: <code>maximumSessions(1)</code> limits one user to a number of sessions, and <code>maxSessionsPreventsLogin(true)</code> blocks the new login.',
            '<b>Registry</b>: <code>SessionRegistry</code> and an <code>HttpSessionEventPublisher</code> bean track active sessions.'],
        ['<b>Cluster</b>: Spring Session stores sessions in Redis or a database so any node can serve the user.',
            '<b>Logout</b>: invalidate the session, clear the cookie and clear the SecurityContext.',
            '<b>Audit</b>: log session creation, expiry and forced logout for security review.'],
        [['F', 'What is session management?', 'Controlling how sessions are created, used, limited and destroyed.'],
            ['F', 'Which Security method configures it?', 'http.sessionManagement().'],
            ['M', 'What is session fixation protection?', 'Giving the user a new session id after authentication so a pre-set id is useless.'],
            ['M', 'How to allow only one login per user?', 'sessionManagement(s -> s.maximumSessions(1)).'],
            ['S', 'Why register HttpSessionEventPublisher?', 'So Security hears about session destruction and keeps the SessionRegistry accurate.'],
            ['S', 'How do you scale sessions across servers?', 'Use Spring Session with Redis or JDBC, or go stateless with tokens.']],
        [['Limit concurrent sessions.',
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults())
        .sessionManagement(s -> s
            .sessionFixation(f -> f.changeSessionId())
            .maximumSessions(1)
            .maxSessionsPreventsLogin(false)      // newest login wins
            .expiredUrl("/login?expired"));
    return http.build();
}
@Bean
HttpSessionEventPublisher sessionEvents() { return new HttpSessionEventPublisher(); }

// OUTPUT:
// login on device A, then device B -> A is expired; A next request -> /login?expired`],
            ['List active sessions of a user.',
                r`@Autowired SessionRegistry registry;

List<String> ids(Object principal) {
    return registry.getAllSessions(principal, false).stream()
        .map(SessionInformation::getSessionId).toList();
}

// OUTPUT: (varies)
// [7F3A91C2..., 4B20D1AA...]`]],
        [['Test fixation protection.',
            r`@Test
void idChangesAfterLogin() throws Exception {
    MockHttpSession before = new MockHttpSession();
    String oldId = before.getId();
    MvcResult res = mvc.perform(formLogin().user("asha").password("pw").session(before))
        .andReturn();
    assertNotEquals(oldId, res.getRequest().getSession().getId());
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Stateless API policy.',
                r`http.sessionManagement(s ->
    s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

// OUTPUT:
// no Set-Cookie: JSESSIONID in any response`]]
    ),
    'mvc-stateless-vs-stateful-application': x(
        ['<b>Stateful</b> servers remember the client between requests (for example an HTTP session); <b>stateless</b> servers keep nothing, and each request carries all it needs.',
            '<b>Stateless example</b>: a REST call with an <code>Authorization: Bearer</code> token that the server validates each time.',
            '<b>Stateful example</b>: a login that stores the user in <code>HttpSession</code>.'],
        ['<b>Scaling</b>: stateless servers are easy to clone behind a load balancer; stateful ones need sticky sessions or a shared store.',
            '<b>Resilience</b>: if a stateless node dies, the next request just goes to another node.',
            '<b>Trade-off</b>: stateless requests are larger, because they repeat tokens and parameters.'],
        ['<b>Not totally stateless</b>: state moves to the client (token) or to a database or cache.',
            '<b>Spring</b>: <code>SessionCreationPolicy.STATELESS</code> tells Security not to create or use an HttpSession.',
            '<b>Controller beans</b> are singletons, so they must not hold per-user fields in either style.'],
        [['F', 'Define stateless.', 'The server stores no client state between requests.'],
            ['F', 'Give a stateful example.', 'Keeping the logged-in user in HttpSession.'],
            ['M', 'Why is stateless easier to scale?', 'Any server can handle any request, so nodes can be added or removed freely.'],
            ['M', 'Is REST stateless?', 'Yes, REST requires each request to contain all information needed to process it.'],
            ['S', 'Where does the state go in a JWT design?', 'Into the signed token held by the client, with data in the database as needed.'],
            ['S', 'Drawback of stateless tokens?', 'They are hard to revoke before expiry unless you keep a deny list, which reintroduces state.']],
        [['Stateful counter versus stateless echo.',
            r`@RestController
class Demo {
    @GetMapping("/stateful")
    String stateful(HttpSession s) {
        int n = (int) Optional.ofNullable(s.getAttribute("n")).orElse(0) + 1;
        s.setAttribute("n", n);
        return "count " + n;
    }
    @GetMapping("/stateless")
    String stateless(@RequestParam int n) { return "count " + (n + 1); }
}

// OUTPUT:
// /stateful -> count 1, count 2 (needs the cookie)
// /stateless?n=5 -> count 6 (works from any server)`],
            ['Make Security stateless with a bearer token.',
                r`http.csrf(c -> c.disable())
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
    .authorizeHttpRequests(a -> a.anyRequest().authenticated());

// OUTPUT:
// request without token -> 401; with valid token -> 200; no JSESSIONID cookie`]],
        [['Test the stateless endpoint.',
            r`@Test
void stateless() throws Exception {
    mvc.perform(get("/stateless").param("n", "5"))
       .andExpect(content().string("count 6"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Check no session is created.',
                r`MvcResult res = mvc.perform(get("/stateless").param("n", "1")).andReturn();
assertNull(res.getRequest().getSession(false));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-http-cookies': x(
        ['<b>HTTP cookie</b> is a small name-value pair that the server asks the browser to store and send back on later requests.',
            '<b>Set</b> with the <code>Set-Cookie</code> response header; the browser returns it in the <code>Cookie</code> request header.',
            '<b>Read in Spring</b> with <code>@CookieValue(&quot;theme&quot;) String theme</code>; write with <code>jakarta.servlet.http.Cookie</code> or <code>ResponseCookie</code>.'],
        ['<b>Attributes</b>: <code>Path</code>, <code>Domain</code>, <code>Max-Age</code>, <code>Expires</code>, <code>Secure</code>, <code>HttpOnly</code> and <code>SameSite</code>.',
            '<b>Session vs persistent</b>: without <code>Max-Age</code> the cookie dies when the browser closes.',
            '<b>Deleting</b>: send the same name, path and domain with <code>Max-Age=0</code>.'],
        ['<b>Size limits</b>: about 4 KB per cookie, and every matching cookie is sent with every request, so keep them small.',
            '<b>Never store secrets</b> or trust cookie values without a signature; the user can edit them.',
            '<b>Privacy</b>: tracking cookies need user consent in many regions.'],
        [['F', 'What is a cookie?', 'A small piece of data stored by the browser and sent back to the same site.'],
            ['F', 'Which annotation reads a cookie?', '@CookieValue.'],
            ['M', 'How do you delete a cookie?', 'Send it again with the same name, path and domain and Max-Age of 0.'],
            ['M', 'What does Secure mean?', 'The browser sends the cookie only over HTTPS.'],
            ['S', 'Why prefer ResponseCookie?', 'It supports SameSite, which the older Cookie class handles poorly, and it builds a header value directly.'],
            ['S', 'Can the client change a cookie?', 'Yes, so never trust values such as role=admin; sign or keep them on the server.']],
        [['Remember a theme.',
            r`@GetMapping("/theme/{name}")
ResponseEntity<String> set(@PathVariable String name) {
    ResponseCookie c = ResponseCookie.from("theme", name)
        .path("/").maxAge(Duration.ofDays(30)).httpOnly(true)
        .sameSite("Lax").build();
    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, c.toString())
        .body("saved " + name);
}
@GetMapping("/theme")
String get(@CookieValue(name = "theme", defaultValue = "light") String t) {
    return "theme=" + t;
}

// OUTPUT:
// GET /theme/dark -> Set-Cookie: theme=dark; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax
// GET /theme (with cookie) -> theme=dark`],
            ['Delete a cookie.',
                r`@GetMapping("/theme/reset")
ResponseEntity<Void> reset() {
    ResponseCookie c = ResponseCookie.from("theme", "").path("/").maxAge(0).build();
    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, c.toString()).build();
}

// OUTPUT:
// Set-Cookie: theme=; Path=/; Max-Age=0`]],
        [['Test reading a cookie.',
            r`@Test
void readsTheme() throws Exception {
    mvc.perform(get("/theme").cookie(new Cookie("theme", "dark")))
       .andExpect(content().string("theme=dark"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Test the cookie is set.',
                r`mvc.perform(get("/theme/dark"))
   .andExpect(cookie().value("theme", "dark"))
   .andExpect(cookie().httpOnly("theme", true));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    )
};

export const smvc22Deep: Record<string, Deep> = {
    'mvc-dispatcherservlet-and-servlet-container': dv(
        [`<p>The container and the servlet share the work:</p><ul><li><b>Container:</b> accepts the socket, parses HTTP, picks a pool thread, runs the filter chain, then calls <code>service()</code> on the servlet.</li><li><b>doService:</b> <code>DispatcherServlet</code> stores request attributes and calls <code>doDispatch</code>.</li><li><b>Lookup:</b> <code>getHandler</code> asks each <code>HandlerMapping</code>, and <code>getHandlerAdapter</code> picks the adapter.</li><li><b>Invoke:</b> interceptors <code>preHandle</code>, the adapter runs the method with argument resolvers, and return value handlers write the result.</li><li><b>Finish:</b> <code>postHandle</code>, view rendering, then <code>afterCompletion</code>; exceptions go to <code>HandlerExceptionResolver</code> beans.</li></ul>`,
            r`// simplified shape of DispatcherServlet.doDispatch
HandlerExecutionChain chain = getHandler(request);
HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
if (!chain.applyPreHandle(request, response)) return;
ModelAndView mv = ha.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
processDispatchResult(request, response, chain, mv, null);

// OUTPUT:
// enable logging.level.org.springframework.web.servlet.DispatcherServlet=DEBUG
// GET "/hello", parameters={}
// Mapped to HelloController#hello()
// Completed 200 OK`],
        [`<p>Ways to set it up:</p><ul><li><b>Boot:</b> auto-configured, mapped to <code>/</code>; change with <code>spring.mvc.servlet.path</code>.</li><li><b>Java config:</b> extend <code>AbstractAnnotationConfigDispatcherServletInitializer</code> and return root and servlet config classes.</li><li><b>Several servlets:</b> add <code>ServletRegistrationBean</code> with its own context.</li><li><b>Startup:</b> <code>spring.mvc.servlet.load-on-startup=1</code> initializes it early.</li><li><b>Unmatched 404:</b> <code>spring.mvc.throw-exception-if-no-handler-found</code> turns it into an exception.</li></ul>`,
            r`public class WebInit
        extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() { return new Class<?>[] { RootConfig.class }; }
    protected Class<?>[] getServletConfigClasses() { return new Class<?>[] { WebConfig.class }; }
    protected String[] getServletMappings() { return new String[] { "/" }; }
}

@Bean
ServletRegistrationBean<DispatcherServlet> adminServlet() {
    var ctx = new AnnotationConfigWebApplicationContext();
    ctx.register(AdminConfig.class);
    var bean = new ServletRegistrationBean<>(new DispatcherServlet(ctx), "/admin/*");
    bean.setName("adminDispatcher");
    return bean;
}

// OUTPUT:
// /admin/* handled by adminDispatcher, everything else by dispatcherServlet`],
        [`<p>Typical mistakes:</p><ul><li><b>Component scan misses controllers:</b> controllers outside the main package give 404; scan the package or move the class.</li><li><b>Mapping <code>/*</code> instead of <code>/</code>:</b> static files and JSPs stop working.</li><li><b>Per-user fields in a controller:</b> singletons are shared by threads; keep state in the session or a database.</li><li><b>Slow work in the request thread:</b> starves the pool; use async return types.</li><li><b>Double context:</b> beans defined in both root and servlet context get created twice.</li></ul>`,
            r`@RestController
class BadController {
    private String lastUser;                 // BUG: shared by all requests
    @GetMapping("/who")
    String who(@RequestParam String u) { lastUser = u; return lastUser; }
}
// FIX: use local variables only
@GetMapping("/who")
String who(@RequestParam String u) { return u; }

// OUTPUT:
// two parallel calls with u=a and u=b can both return "b" in the buggy version`],
        [`<p>Tuning the container and servlet:</p><ul><li><b>Threads:</b> <code>server.tomcat.threads.max</code> (default 200) and <code>accept-count</code>.</li><li><b>Compression:</b> <code>server.compression.enabled=true</code>.</li><li><b>Keep-alive:</b> reuse connections to reduce handshakes.</li><li><b>Virtual threads:</b> <code>spring.threads.virtual.enabled=true</code> on Java 21 with a supported Boot version.</li><li><b>Async:</b> return <code>Callable</code>, <code>DeferredResult</code> or <code>CompletableFuture</code> to free the container thread.</li><li><b>Lean filters:</b> every filter and interceptor adds work to every request.</li></ul>`,
            r`# application.properties
server.tomcat.threads.max=100
server.tomcat.accept-count=50
server.compression.enabled=true
server.http2.enabled=true

@GetMapping("/report")
Callable<String> report() {
    return () -> { Thread.sleep(500); return "done"; };   // container thread freed
}

# OUTPUT:
# slow requests no longer pin a container thread while the Callable runs`],
        [`<p>Scenario: an API returns 404 for a valid URL after an upgrade.</p><ul><li><b>Check logs:</b> DEBUG on the DispatcherServlet shows which mapping matched.</li><li><b>Check scan:</b> the controller is in a sub-package of the main class.</li><li><b>Check path:</b> a changed <code>servlet.path</code> or <code>context-path</code> shifts all URLs.</li><li><b>Check filters:</b> a filter that does not call <code>chain.doFilter</code> ends the request early.</li><li><b>Interview angle:</b> explain the request path from socket to controller.</li></ul>`,
            r`# application.properties
logging.level.org.springframework.web.servlet.DispatcherServlet=DEBUG
logging.level.org.springframework.web.servlet.mvc.method.annotation=TRACE

// actuator view of all mappings: GET /actuator/mappings

// OUTPUT:
// DEBUG DispatcherServlet : GET "/api/items", parameters={}
// DEBUG DispatcherServlet : Completed 404 NOT_FOUND   <- no handler: check scan and path`]
    ),
    'mvc-http-session': dv(
        [`<p>How a container session works:</p><ul><li><b>Creation:</b> <code>request.getSession()</code> asks the session manager to build a <code>StandardSession</code> with a random id.</li><li><b>Id delivery:</b> the response gets <code>Set-Cookie: JSESSIONID</code>.</li><li><b>Lookup:</b> on later requests the container reads the cookie, finds the session in a concurrent map and attaches it to the request.</li><li><b>Expiry:</b> a background thread checks idle time and destroys old sessions, firing listener events.</li><li><b>Persistence:</b> Tomcat can write sessions to disk at restart if they are serializable.</li></ul>`,
            r`@GetMapping("/inspect")
@ResponseBody
String inspect(HttpSession s) {
    return "id=" + s.getId().substring(0, 6)
        + " new=" + s.isNew()
        + " created=" + Instant.ofEpochMilli(s.getCreationTime())
        + " idle=" + s.getMaxInactiveInterval() + "s";
}

// OUTPUT: (varies)
// id=7F3A91 new=true created=2026-10-08T09:00:00Z idle=1800s`],
        [`<p>Session options:</p><ul><li><b>Request-scoped access:</b> <code>HttpSession</code> parameter or <code>RequestContextHolder</code>.</li><li><b>Session-scoped bean:</b> <code>@SessionScope</code> with a scoped proxy.</li><li><b>Model attributes:</b> <code>@SessionAttributes</code>.</li><li><b>Redirect data:</b> <code>RedirectAttributes.addFlashAttribute</code> uses the session for one redirect.</li><li><b>Spring Session:</b> external store for the same API.</li></ul>`,
            r`@Component
@SessionScope
public class Cart implements Serializable {
    private final List<String> items = new ArrayList<>();
    public void add(String i) { items.add(i); }
    public List<String> items() { return items; }
}

@RestController
class CartController {
    private final Cart cart;                       // proxy injected into a singleton
    CartController(Cart cart) { this.cart = cart; }
    @PostMapping("/cart/{item}")
    List<String> add(@PathVariable String item) { cart.add(item); return cart.items(); }
}

// OUTPUT:
// POST /cart/pen  -> ["pen"]
// POST /cart/book -> ["pen","book"]   (same user)`],
        [`<p>Common mistakes:</p><ul><li><b>Large objects in the session:</b> memory grows with users; store ids.</li><li><b>Non-serializable attributes:</b> fail on replication or restart.</li><li><b>Mutating a stored object without <code>setAttribute</code>:</b> some stores do not notice the change; call it again.</li><li><b>Creating sessions for bots:</b> use <code>getSession(false)</code> where possible.</li><li><b>Using session state in a REST API</b> that must scale out.</li></ul>`,
            r`List<String> cart = (List<String>) session.getAttribute("cart");
cart.add("pen");
session.setAttribute("cart", cart);   // FIX: re-set so Redis/JDBC stores save the change

// OUTPUT:
// without the re-set, a Spring Session store may keep the old cart`],
        [`<p>Tuning sessions:</p><ul><li><b>Keep them small</b> and short-lived.</li><li><b>Shorter timeout</b> for anonymous traffic.</li><li><b>Spring Session Redis:</b> choose a flush mode and a serializer such as JSON.</li><li><b>Avoid sticky-only designs</b> if you need rolling restarts.</li><li><b>Measure:</b> active sessions through Micrometer (Tomcat exposes session metrics).</li></ul>`,
            r`# application.properties
server.servlet.session.timeout=20m
spring.session.store-type=redis
spring.session.redis.flush-mode=on-save
spring.session.timeout=20m

# OUTPUT:
# metrics: tomcat.sessions.active.current (varies)`],
        [`<p>Scenario: users are logged out randomly in production behind two servers.</p><ul><li><b>Cause:</b> the load balancer sends requests to different nodes, each with its own memory.</li><li><b>Fix 1:</b> sticky sessions at the balancer.</li><li><b>Fix 2:</b> Spring Session with Redis so all nodes share data.</li><li><b>Interview angle:</b> explain trade-offs of sticky versus shared sessions.</li></ul>`,
            r`<!-- pom.xml -->
// spring-session-data-redis and spring-boot-starter-data-redis

@EnableRedisHttpSession
class SessionConfig {}

// OUTPUT:
// node A creates the session; node B reads the same SESSION cookie data from Redis`]
    ),
    'mvc-httpsession-session': dv(
        [`<p>Inside the interface:</p><ul><li><b>Implementation:</b> Tomcat uses <code>StandardSession</code> wrapped by <code>StandardSessionFacade</code>, which hides internals from your code.</li><li><b>Attributes</b> live in a <code>ConcurrentHashMap</code>.</li><li><b>Access time</b> updates at the start and end of each request.</li><li><b>Events:</b> adding or removing an attribute fires binding and attribute listeners.</li><li><b>Argument resolution:</b> Spring uses <code>ServletRequestMethodArgumentResolver</code> to inject <code>HttpSession</code> in a handler method.</li></ul>`,
            r`public class Audit implements HttpSessionBindingListener {
    public void valueBound(HttpSessionBindingEvent e) {
        System.out.println("bound " + e.getName());
    }
    public void valueUnbound(HttpSessionBindingEvent e) {
        System.out.println("unbound " + e.getName());
    }
}
session.setAttribute("audit", new Audit());
session.invalidate();

// OUTPUT:
// bound audit
// unbound audit`],
        [`<p>API variants:</p><ul><li><b>Create or get:</b> <code>getSession()</code> and <code>getSession(true)</code>.</li><li><b>Get only:</b> <code>getSession(false)</code>.</li><li><b>New id:</b> <code>request.changeSessionId()</code> keeps data and swaps the id.</li><li><b>Attribute names:</b> <code>getAttributeNames()</code>.</li><li><b>Servlet context:</b> <code>getServletContext()</code> for application-wide data.</li></ul>`,
            r`@PostMapping("/promote")
@ResponseBody
String promote(HttpServletRequest req) {
    HttpSession s = req.getSession(false);
    if (s == null) return "no session";
    String old = s.getId();
    String fresh = req.changeSessionId();       // same data, new id
    return (old.equals(fresh) ? "same" : "changed");
}

// OUTPUT:
// changed`],
        [`<p>Mistakes:</p><ul><li><b>Casting without a null check:</b> <code>getAttribute</code> may return null.</li><li><b>Using the session as a cache</b> for shared data; use a real cache.</li><li><b>Race conditions:</b> two parallel requests do read-modify-write on a counter.</li><li><b>Forgetting to invalidate on logout.</b></li><li><b>Keeping entities</b> from a closed persistence context; store ids.</li></ul>`,
            r`// BUG: read-modify-write race
int n = (int) session.getAttribute("n");
session.setAttribute("n", n + 1);

// FIX: lock on a per-session object
synchronized (WebUtils.getSessionMutex(session)) {
    int c = (int) session.getAttribute("n");
    session.setAttribute("n", c + 1);
}

// OUTPUT:
// parallel requests no longer lose updates`],
        [`<p>Performance notes:</p><ul><li><b>Every <code>setAttribute</code> may cost</b> a write to Redis or JDBC stores.</li><li><b>Batch changes</b> and write once per request.</li><li><b>Small immutable values</b> serialize quickly.</li><li><b>Avoid <code>getSession()</code> on static resources.</b></li></ul>`,
            r`@Bean
FilterRegistrationBean<Filter> noSessionForStatics() {
    // exclude /static/* from filters that call getSession()
    var reg = new FilterRegistrationBean<Filter>(new MyFilter());
    reg.addUrlPatterns("/app/*");
    return reg;
}

// OUTPUT:
// static file requests create no sessions (check the active session metric)`],
        [`<p>Scenario: remember a logged-in user and show a welcome message.</p><ul><li><b>Login</b> stores a small <code>LoginUser</code> record.</li><li><b>Interceptor</b> checks the attribute and redirects guests.</li><li><b>Logout</b> invalidates.</li><li><b>Real apps</b> use Spring Security rather than hand-made checks.</li></ul>`,
            r`public class LoginInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object h)
            throws IOException {
        HttpSession s = req.getSession(false);
        if (s != null && s.getAttribute("user") != null) return true;
        res.sendRedirect(req.getContextPath() + "/login");
        return false;
    }
}

// OUTPUT:
// guest GET /account -> 302 /login
// logged-in GET /account -> 200`]
    ),
    'mvc-session-attributes': dv(
        [`<p>How <code>@SessionAttributes</code> works:</p><ul><li><b>Before the handler:</b> <code>ModelFactory.initModel</code> copies the named attributes from the session into the model.</li><li><b>After the handler:</b> <code>updateModel</code> copies the listed attributes from the model back into the session.</li><li><b>Store:</b> <code>DefaultSessionAttributeStore</code> prefixes names with a constant and calls <code>WebRequest.setAttribute</code> in session scope.</li><li><b>Complete:</b> <code>SessionStatus.setComplete()</code> marks the handler done, and the attributes are removed.</li></ul>`,
            r`@Controller
@SessionAttributes({"cart", "user"})
class ShopController {
    @ModelAttribute("cart")
    List<String> cart() { return new ArrayList<>(); }   // runs once, then session value is used

    @PostMapping("/add")
    String add(@ModelAttribute("cart") List<String> cart, String item) {
        cart.add(item);
        return "redirect:/cart";
    }
}

// OUTPUT:
// the first request creates the list; later requests receive the same list from the session`],
        [`<p>Variants:</p><ul><li><b>By name:</b> <code>@SessionAttributes(&quot;order&quot;)</code> or <code>names = {...}</code>.</li><li><b>By type:</b> <code>types = Order.class</code> stores any model attribute of that type.</li><li><b>Read:</b> <code>@SessionAttribute</code> on a parameter or <code>WebRequest.getAttribute(name, SCOPE_SESSION)</code>.</li><li><b>Reset:</b> <code>SessionStatus</code> or <code>WebRequest.removeAttribute</code>.</li></ul>`,
            r`@SessionAttributes(types = Order.class)
@Controller
class ByType {
    @GetMapping("/order/new")
    String form(Model m) { m.addAttribute(new Order()); return "orderForm"; }

    @GetMapping("/order/cancel")
    String cancel(SessionStatus status) { status.setComplete(); return "redirect:/"; }
}

// OUTPUT:
// the Order lives in the session until /order/cancel`],
        [`<p>Mistakes:</p><ul><li><b>No cleanup:</b> the object stays in the session for 30 minutes or more.</li><li><b>Expecting sharing across controllers.</b></li><li><b>Back button and two tabs:</b> both tabs edit the same session object.</li><li><b>Missing <code>@ModelAttribute</code> factory:</b> a form post then fails with HttpSessionRequiredException.</li><li><b>Binding too much:</b> a posted form can overwrite fields; use <code>@InitBinder</code> to allow only certain fields.</li></ul>`,
            r`@InitBinder("order")
void binder(WebDataBinder b) {
    b.setAllowedFields("item", "quantity");     // block binding of price, id
}

// OUTPUT:
// POST price=0 is ignored; item and quantity are bound`],
        [`<p>Performance:</p><ul><li><b>Small objects only;</b> each wizard keeps its form data in memory per user.</li><li><b>Complete early</b> to free memory.</li><li><b>With Redis sessions</b> the object is serialized, so keep it Serializable and compact.</li></ul>`,
            r`public class Order implements Serializable {
    private static final long serialVersionUID = 1L;
    private String item;
    private int quantity;
    // getters and setters
}

// OUTPUT:
// Serializable wizard object, safe for session persistence and replication`],
        [`<p>Scenario: a three-step checkout wizard.</p><ul><li><b>Step 1</b> collects the address, step 2 the payment, step 3 confirms.</li><li><b>Session</b> holds one <code>Checkout</code> object.</li><li><b>Confirm</b> saves and calls <code>setComplete</code>.</li><li><b>Alternative:</b> Spring Web Flow, or a hidden-field approach for stateless designs.</li></ul>`,
            r`@PostMapping("/checkout/confirm")
String confirm(@ModelAttribute("checkout") Checkout c, SessionStatus status) {
    orderService.place(c);
    status.setComplete();
    return "redirect:/thanks";
}

// OUTPUT:
// POST /checkout/confirm -> 302 /thanks; the session no longer holds "checkout"`]
    ),
    'mvc-session-timeout': dv(
        [`<p>How timeout is enforced:</p><ul><li><b>Tracking:</b> each session stores <code>lastAccessedTime</code> and <code>maxInactiveInterval</code>.</li><li><b>Check:</b> Tomcat <code>ManagerBase</code> runs a background process about every 10 seconds and expires idle sessions; a lookup also checks validity.</li><li><b>Expiry:</b> listeners are called, attributes unbound and the session removed.</li><li><b>Reset:</b> the access time is refreshed when a request enters.</li><li><b>Redis store:</b> uses key expiry plus Spring Session cleanup.</li></ul>`,
            r`HttpSession s = request.getSession();
long idleMs = System.currentTimeMillis() - s.getLastAccessedTime();
boolean expired = idleMs > s.getMaxInactiveInterval() * 1000L;
System.out.println("idle=" + idleMs + "ms expired=" + expired);

// OUTPUT: (varies)
// idle=1200ms expired=false`],
        [`<p>Ways to configure:</p><ul><li><b>Boot:</b> <code>server.servlet.session.timeout</code> with units such as <code>90s</code> or <code>30m</code>.</li><li><b>Code:</b> <code>setMaxInactiveInterval</code>.</li><li><b>Web.xml:</b> minutes.</li><li><b>Spring Session:</b> <code>spring.session.timeout</code> or <code>maxInactiveIntervalInSeconds</code>.</li><li><b>Remember-me</b> cookie gives long-lived login without a long session.</li></ul>`,
            r`http.rememberMe(r -> r.key("app-key").tokenValiditySeconds(14 * 24 * 3600))
    .sessionManagement(s -> s.invalidSessionUrl("/login?timeout"));

// OUTPUT:
// session expired but remember-me cookie valid -> user is logged in again silently`],
        [`<p>Mistakes:</p><ul><li><b>Seconds versus minutes:</b> web.xml uses minutes.</li><li><b>Sub-minute values</b> in Tomcat are rounded up to a minute.</li><li><b>Ajax calls that keep the session alive</b> unintentionally.</li><li><b>Not handling expiry in Ajax:</b> the login page HTML comes back as a 200 for a JSON call; return 401.</li><li><b>Infinite timeout</b> (negative) leaks memory.</li></ul>`,
            r`http.exceptionHandling(e -> e.defaultAuthenticationEntryPointFor(
    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
    new RequestHeaderRequestMatcher("X-Requested-With", "XMLHttpRequest")));

// OUTPUT:
// expired Ajax call -> 401 so the front end can redirect to login`],
        [`<p>Performance and cost:</p><ul><li><b>Shorter timeouts</b> free memory sooner.</li><li><b>Long timeouts</b> help users but raise memory and security exposure.</li><li><b>Choose</b> by risk: banking minutes, shopping hours.</li><li><b>Absolute timeout</b> (maximum session age) needs custom code or a filter.</li></ul>`,
            r`public class AbsoluteTimeoutFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        HttpSession s = req.getSession(false);
        if (s != null && System.currentTimeMillis() - s.getCreationTime() > 8 * 3600_000L) {
            s.invalidate();
        }
        chain.doFilter(req, res);
    }
}

// OUTPUT:
// sessions older than 8 hours are ended even when active`],
        [`<p>Scenario: users complain that long forms are lost.</p><ul><li><b>Diagnose:</b> the idle timeout is 5 minutes and typing sends no requests.</li><li><b>Fix:</b> a small script pings the server every few minutes while the form is open, or autosave drafts.</li><li><b>Balance</b> against security needs.</li></ul>`,
            r`@GetMapping("/keepalive")
@ResponseStatus(HttpStatus.NO_CONTENT)
void keepAlive(HttpSession s) { /* touching the session resets the idle clock */ }

// OUTPUT:
// GET /keepalive -> 204; session idle time reset to 0`]
    ),
    'mvc-cookie-based-session': dv(
        [`<p>The mechanism:</p><ul><li><b>Response:</b> the container adds <code>Set-Cookie</code> built by <code>SessionConfig</code> and its cookie settings.</li><li><b>Request:</b> Tomcat parses the <code>Cookie</code> header and matches the session id.</li><li><b>Boot customization:</b> <code>server.servlet.session.cookie.*</code> maps to the servlet <code>SessionCookieConfig</code>.</li><li><b>Spring Session:</b> <code>CookieSerializer</code> (DefaultCookieSerializer) writes a base64 session id in the <code>SESSION</code> cookie.</li></ul>`,
            r`@Bean
CookieSerializer cookieSerializer() {
    DefaultCookieSerializer s = new DefaultCookieSerializer();
    s.setCookieName("APPSESSION");
    s.setUseHttpOnlyCookie(true);
    s.setUseSecureCookie(true);
    s.setSameSite("Lax");
    return s;
}

// OUTPUT:
// Set-Cookie: APPSESSION=NzE...; Path=/; Secure; HttpOnly; SameSite=Lax`],
        [`<p>Options:</p><ul><li><b>Domain and path:</b> restrict to a subdomain or path.</li><li><b>Max-age:</b> persistent session cookie, rarely wanted.</li><li><b>Header-based id:</b> <code>HeaderHttpSessionIdResolver.xAuthToken()</code> for APIs.</li><li><b>Cookie prefix:</b> <code>__Host-</code> names enforce Secure and path of slash.</li></ul>`,
            r`@Bean
HttpSessionIdResolver resolver() {
    return HeaderHttpSessionIdResolver.xAuthToken();   // X-Auth-Token header instead of cookie
}

// OUTPUT:
// response header X-Auth-Token: 3b8f...; clients send it back on each request`],
        [`<p>Mistakes:</p><ul><li><b>No Secure flag</b> in production.</li><li><b>SameSite=None</b> without Secure is rejected by browsers.</li><li><b>Cookie set on the wrong domain or path</b> so it is not sent.</li><li><b>Cross-origin Ajax</b> without <code>credentials: include</code> and CORS <code>allowCredentials</code>.</li><li><b>Missing CSRF protection</b> for forms.</li></ul>`,
            r`@Bean
CorsConfigurationSource cors() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("https://app.example.com"));
    c.setAllowedMethods(List.of("GET", "POST"));
    c.setAllowCredentials(true);                       // required to send the cookie
    var src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", c);
    return src;
}

// OUTPUT:
// Access-Control-Allow-Credentials: true on responses to the allowed origin`],
        [`<p>Performance:</p><ul><li><b>Small cookie:</b> only the id, a few dozen bytes.</li><li><b>Path scoping</b> stops cookies being sent with static asset requests; serve static files from a cookie-free domain.</li><li><b>Lookup cost:</b> one map or Redis read per request.</li></ul>`,
            r`# application.properties
server.servlet.session.cookie.path=/app
server.servlet.session.cookie.max-age=-1

# OUTPUT:
# requests to /static/* carry no session cookie`],
        [`<p>Scenario: security audit flags the session cookie.</p><ul><li><b>Findings:</b> missing Secure and SameSite.</li><li><b>Fix:</b> set the properties and force HTTPS.</li><li><b>Verify</b> with browser dev tools or curl.</li><li><b>Interview angle:</b> why HttpOnly does not stop CSRF but helps against XSS theft.</li></ul>`,
            r`curl -sI https://app.example.com/login | grep -i set-cookie

# OUTPUT: (varies)
# set-cookie: SESSION=NzE...; Path=/; Secure; HttpOnly; SameSite=Lax`]
    ),
    'mvc-url-rewriting': dv(
        [`<p>How rewriting works:</p><ul><li><b>Decision:</b> <code>encodeURL</code> calls the request <code>isRequestedSessionIdFromCookie</code>; if the cookie is not confirmed, the id is added.</li><li><b>Format:</b> a path parameter <code>;jsessionid=ID</code> after the path and before the query string.</li><li><b>Incoming:</b> Tomcat parses the path parameter and finds the session.</li><li><b>First request:</b> the server cannot know whether cookies work yet, so it rewrites links once.</li></ul>`,
            r`String url = response.encodeURL("/orders?page=2");
System.out.println(url);

// OUTPUT: (varies)
// first visit : /orders;jsessionid=7F3A91C2?page=2
// later visit : /orders?page=2`],
        [`<p>Controls:</p><ul><li><b>Tracking modes:</b> <code>COOKIE</code>, <code>URL</code>, <code>SSL</code>.</li><li><b>Java config:</b> <code>servletContext.setSessionTrackingModes(EnumSet.of(SessionTrackingMode.COOKIE))</code>.</li><li><b>Boot:</b> property <code>server.servlet.session.tracking-modes</code>.</li><li><b>JSTL:</b> <code>c:url</code> also encodes.</li></ul>`,
            r`@Bean
ServletContextInitializer cookieOnly() {
    return ctx -> ctx.setSessionTrackingModes(EnumSet.of(SessionTrackingMode.COOKIE));
}

// OUTPUT:
// encodeURL never appends jsessionid afterwards`],
        [`<p>Mistakes:</p><ul><li><b>Leaving it on</b> in a public site: ids in URLs get shared.</li><li><b>Only encoding some links</b> so the session is lost on others.</li><li><b>SEO duplicates:</b> search engines index jsessionid URLs.</li><li><b>Security firewall errors</b> for semicolon URLs.</li></ul>`,
            r`// Thymeleaf template with plain href avoids encoding:
// <a th:href="@{/cart}">Cart</a> encodes; a literal href does not.
// FIX at config level instead: tracking-modes=cookie

# application.properties
server.servlet.session.tracking-modes=cookie

# OUTPUT:
# href="/cart" on every response`],
        [`<p>Cost of rewriting:</p><ul><li><b>Cache busting:</b> unique URLs hurt caches.</li><li><b>More CPU</b> to encode every link.</li><li><b>Longer URLs.</b></li></ul>`,
            r`// Prefer cookies: cacheable, shorter URLs
// OUTPUT:
// /products/42 is cached by CDN; /products/42;jsessionid=X is not`],
        [`<p>Scenario: Google shows pages with jsessionid in results.</p><ul><li><b>Cause:</b> crawlers send no cookies, so every link gets an id.</li><li><b>Fix:</b> cookie-only tracking and a canonical link tag.</li></ul>`,
            r`server.servlet.session.tracking-modes=cookie

# OUTPUT:
# crawler gets clean URLs; users keep sessions through cookies`]
    ),
    'mvc-session-management': dv(
        [`<p>Inside Spring Security:</p><ul><li><b>SessionManagementFilter / strategies:</b> a composite <code>SessionAuthenticationStrategy</code> runs after login.</li><li><b>Parts:</b> <code>ChangeSessionIdAuthenticationStrategy</code>, <code>ConcurrentSessionControlAuthenticationStrategy</code> and <code>RegisterSessionAuthenticationStrategy</code>.</li><li><b>Repository:</b> <code>HttpSessionSecurityContextRepository</code> saves the SecurityContext in the session.</li><li><b>ConcurrentSessionFilter</b> checks whether the session was marked expired.</li></ul>`,
            r`// default behaviour after successful login:
// 1. request.changeSessionId()     (fixation protection)
// 2. SessionRegistry registers the new session
// 3. SecurityContext is stored in the HttpSession

// OUTPUT:
// Set-Cookie: JSESSIONID=NEWID...   (id differs from the pre-login one)`],
        [`<p>Policies:</p><ul><li><b>Fixation:</b> <code>changeSessionId</code> (default), <code>newSession</code>, <code>migrateSession</code>, <code>none</code>.</li><li><b>Creation:</b> <code>ALWAYS</code>, <code>IF_REQUIRED</code>, <code>NEVER</code>, <code>STATELESS</code>.</li><li><b>Concurrency:</b> <code>maximumSessions</code>, <code>maxSessionsPreventsLogin</code>.</li><li><b>Expired handling:</b> <code>expiredUrl</code> or <code>expiredSessionStrategy</code>.</li></ul>`,
            r`http.sessionManagement(s -> s
    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
    .sessionFixation(f -> f.migrateSession())
    .maximumSessions(2)
        .maxSessionsPreventsLogin(true)
        .expiredSessionStrategy(e -> e.getResponse().sendError(401, "Session expired")));

// OUTPUT:
// third login attempt while two sessions exist -> authentication fails`],
        [`<p>Mistakes:</p><ul><li><b>Missing <code>HttpSessionEventPublisher</code>:</b> logged-out sessions still count toward the limit.</li><li><b>Missing equals/hashCode on a custom principal:</b> the registry cannot match the same user.</li><li><b>Disabling fixation protection.</b></li><li><b>Mixing STATELESS and form login.</b></li><li><b>Not clearing cookies at logout.</b></li></ul>`,
            r`http.logout(l -> l
    .logoutUrl("/logout")
    .invalidateHttpSession(true)
    .clearAuthentication(true)
    .deleteCookies("JSESSIONID"));

// OUTPUT:
// Set-Cookie: JSESSIONID=; Max-Age=0   (browser drops the cookie)`],
        [`<p>Performance:</p><ul><li><b>SessionRegistry</b> is in memory; use a Spring Session backed one in a cluster.</li><li><b>Every authenticated request</b> loads the SecurityContext from the session; keep the principal light.</li><li><b>Stateless tokens</b> remove this load but need revocation design.</li></ul>`,
            r`@Bean
SpringSessionBackedSessionRegistry<? extends Session> registry(
        FindByIndexNameSessionRepository<? extends Session> repo) {
    return new SpringSessionBackedSessionRegistry<>(repo);
}

// OUTPUT:
// concurrent session control works across all nodes`],
        [`<p>Scenario: a banking app must allow one active session and end the old one.</p><ul><li><b>Config:</b> <code>maximumSessions(1)</code> with newest login winning.</li><li><b>Admin tool:</b> expire a user session through the registry.</li><li><b>Audit:</b> log events.</li></ul>`,
            r`void forceLogout(String username) {
    registry.getAllPrincipals().stream()
        .filter(p -> p instanceof UserDetails u && u.getUsername().equals(username))
        .flatMap(p -> registry.getAllSessions(p, false).stream())
        .forEach(SessionInformation::expireNow);
}

// OUTPUT:
// the user next request is redirected to the expired URL`]
    ),
    'mvc-stateless-vs-stateful-application': dv(
        [`<p>Where state can live:</p><ul><li><b>Server memory:</b> fast, lost on restart, tied to one node.</li><li><b>Shared store:</b> Redis or a database; any node can serve.</li><li><b>Client:</b> a token or cookie with signed data.</li><li><b>Stateless server:</b> verifies the signature and reads claims, no lookup.</li><li><b>Spring Security:</b> with STATELESS, the <code>SecurityContext</code> is rebuilt on every request by a filter such as <code>BearerTokenAuthenticationFilter</code>.</li></ul>`,
            r`// stateless flow per request
// 1. read Authorization header
// 2. verify signature and expiry
// 3. build Authentication, store it only for this request
// 4. clear SecurityContext at the end

// OUTPUT:
// no HttpSession created; 100 requests may hit 100 different servers`],
        [`<p>Design variants:</p><ul><li><b>Sticky stateful:</b> simple, weak on failover.</li><li><b>Shared session:</b> stateful for the user, stateless servers.</li><li><b>JWT:</b> self-contained token.</li><li><b>Opaque token:</b> random string looked up in a store.</li><li><b>Hybrid:</b> short access token plus a refresh token.</li></ul>`,
            r`@RestController
class TokenController {
    @PostMapping("/token")
    Map<String, String> token(Authentication a) {
        String jwt = jwtService.issue(a.getName(), Duration.ofMinutes(15));
        return Map.of("access_token", jwt, "token_type", "Bearer");
    }
}

// OUTPUT:
// {"access_token":"eyJhbGciOi...","token_type":"Bearer"}`],
        [`<p>Mistakes:</p><ul><li><b>Claiming REST while using sessions.</b></li><li><b>Singleton fields holding user data.</b></li><li><b>Long-lived tokens</b> that cannot be revoked.</li><li><b>Tokens in local storage</b> exposed to XSS; prefer HttpOnly cookies when possible.</li><li><b>Forgetting CSRF</b> when a stateless API still uses cookies.</li></ul>`,
            r`@Service
class BadCounter {
    private int hits;                        // shared state across users
    int hit() { return ++hits; }
}
// FIX: AtomicInteger for a global counter, or a database/session for per-user counts

// OUTPUT:
// concurrent users see each other counts in the buggy version`],
        [`<p>Performance trade-offs:</p><ul><li><b>Stateless:</b> more CPU per request (signature check), less memory and no shared store.</li><li><b>Stateful:</b> small requests, but memory and store costs.</li><li><b>Cache</b> parsed keys such as the JWK set.</li><li><b>Short tokens</b> keep payloads small.</li></ul>`,
            r`spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://auth.example.com/jwks

# OUTPUT:
# keys fetched once and cached; each request verifies locally in microseconds (varies)`],
        [`<p>Scenario: moving a monolith to many instances on Kubernetes.</p><ul><li><b>Step 1:</b> find session usage with a search for <code>getSession</code>.</li><li><b>Step 2:</b> move shared state to Redis through Spring Session, or to tokens.</li><li><b>Step 3:</b> test a rolling restart.</li><li><b>Interview angle:</b> discuss the twelve-factor rule of stateless processes.</li></ul>`,
            r`# application.properties
spring.session.store-type=redis
spring.data.redis.host=redis
server.shutdown=graceful

# OUTPUT:
# pods can be killed at any time without logging users out`]
    ),
    'mvc-http-cookies': dv(
        [`<p>How cookies work internally:</p><ul><li><b>Wire format:</b> <code>Set-Cookie: name=value; Path=/; Max-Age=3600; Secure; HttpOnly; SameSite=Lax</code>.</li><li><b>Browser jar:</b> keyed by name, domain and path; sent when the request URL matches and flags allow.</li><li><b>Spring:</b> <code>@CookieValue</code> is resolved by <code>ServletCookieValueMethodArgumentResolver</code> from <code>request.getCookies()</code>.</li><li><b>Writing:</b> <code>HttpServletResponse.addCookie</code> or a <code>Set-Cookie</code> header built by <code>ResponseCookie</code>.</li></ul>`,
            r`@GetMapping("/cookies")
@ResponseBody
String list(HttpServletRequest req) {
    Cookie[] cs = req.getCookies();
    if (cs == null) return "none";
    return Arrays.stream(cs).map(c -> c.getName() + "=" + c.getValue())
        .collect(Collectors.joining(", "));
}

// OUTPUT: (varies)
// theme=dark, JSESSIONID=7F3A91C2`],
        [`<p>Variants:</p><ul><li><b>Cookie class:</b> <code>setHttpOnly</code>, <code>setSecure</code>, <code>setMaxAge</code>; recent servlet versions also allow attributes through <code>setAttribute</code>.</li><li><b>ResponseCookie:</b> fluent builder with <code>sameSite</code>.</li><li><b>CookieValue options:</b> <code>required</code> and <code>defaultValue</code>.</li><li><b>Prefixes:</b> <code>__Host-</code> and <code>__Secure-</code>.</li><li><b>CookieLocaleResolver</b> stores the locale in a cookie.</li></ul>`,
            r`@Bean
LocaleResolver localeResolver() {
    CookieLocaleResolver r = new CookieLocaleResolver("lang");
    r.setDefaultLocale(Locale.ENGLISH);
    r.setCookieMaxAge(Duration.ofDays(365));
    return r;
}

// OUTPUT:
// GET /?lang=fr (with LocaleChangeInterceptor) -> Set-Cookie: lang=fr; Max-Age=31536000`],
        [`<p>Mistakes:</p><ul><li><b>Sensitive data in cookies</b> such as passwords.</li><li><b>Spaces or semicolons in values:</b> encode them.</li><li><b>Wrong path on delete:</b> the cookie stays.</li><li><b>Forgetting HttpOnly</b> for auth cookies.</li><li><b>Required cookie missing</b> gives 400; use a default.</li><li><b>Trusting a role cookie.</b></li></ul>`,
            r`// BUG: client controls the role
@GetMapping("/admin")
String admin(@CookieValue("role") String role) { return role.equals("admin") ? "ok" : "no"; }

// FIX: derive the role from the authenticated principal on the server
@GetMapping("/admin")
String admin(Authentication a) { return a.getAuthorities().toString(); }

// OUTPUT:
// the buggy version lets anyone set role=admin in the browser`],
        [`<p>Performance:</p><ul><li><b>Every cookie is sent with every matching request,</b> including images.</li><li><b>Keep names and values short.</b></li><li><b>Use Path and Domain</b> to limit scope.</li><li><b>Serve static files</b> from a cookieless host.</li></ul>`,
            r`ResponseCookie c = ResponseCookie.from("pref", "a1").path("/app").build();

// OUTPUT:
// Set-Cookie: pref=a1; Path=/app   (not sent for /static/logo.png)`],
        [`<p>Scenario: remember the chosen language and a consent choice.</p><ul><li><b>Language:</b> <code>CookieLocaleResolver</code> with a one-year cookie.</li><li><b>Consent:</b> a small cookie <code>consent=yes</code>; set tracking only when present.</li><li><b>Test</b> with MockMvc <code>cookie()</code> assertions.</li></ul>`,
            r`@GetMapping("/consent")
ResponseEntity<String> consent() {
    ResponseCookie c = ResponseCookie.from("consent", "yes")
        .path("/").maxAge(Duration.ofDays(180)).sameSite("Lax").build();
    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, c.toString()).body("ok");
}

// OUTPUT:
// Set-Cookie: consent=yes; Path=/; Max-Age=15552000; SameSite=Lax`]
    )
};
