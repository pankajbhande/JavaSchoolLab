// Spring extras, batch smvc21 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc21Extras: Record<string, Extra> = {
    'mvc-servlet-lifecycle': x(
        ['<b>Servlet lifecycle</b> is the set of stages the container drives for a servlet: load and instantiate, <code>init()</code>, many <code>service()</code> calls, then <code>destroy()</code>.',
            '<b>One instance</b> of a servlet normally serves all requests, each on a different thread, so <code>init()</code> and <code>destroy()</code> run once while <code>service()</code> runs per request.',
            '<b>service()</b> looks at the HTTP method and calls <code>doGet</code>, <code>doPost</code> and the like in <code>HttpServlet</code>.'],
        ['<b>Lazy or eager</b> loading: by default the container creates the servlet on its first request, while <code>load-on-startup</code> (or <code>loadOnStartup</code>) creates it at deployment.',
            '<b>Thread safety</b>: instance fields are shared by all request threads, so keep servlets stateless or guard shared state.',
            '<b>DispatcherServlet</b> is a normal servlet: Spring builds its web application context in <code>init()</code>.'],
        ['<b>Init failure</b>: if <code>init()</code> throws <code>ServletException</code>, the servlet is not put into service and requests get an error.',
            '<b>Graceful shutdown</b>: <code>destroy()</code> is the place to release pools and threads, but it can run while requests are still finishing.',
            '<b>Spring Boot</b> registers <code>DispatcherServlet</code> through <code>DispatcherServletRegistrationBean</code> and the property <code>spring.mvc.servlet.load-on-startup</code> controls early init.'],
        [['F', 'Name the lifecycle methods of a servlet.', 'init(), service() and destroy(). The container calls init once, service for every request and destroy once at the end.'],
            ['F', 'How many servlet instances exist per servlet declaration?', 'Normally one. All requests share it, each on its own thread.'],
            ['M', 'Why is it risky to keep request data in a servlet field?', 'The instance is shared by threads, so two requests can overwrite each other data. Use local variables or the request scope.'],
            ['M', 'What does load-on-startup do?', 'It makes the container create and init the servlet at startup, in the order of the number given, instead of at the first request.'],
            ['S', 'When is DispatcherServlet context created?', 'In init() of the servlet (FrameworkServlet.initServletBean), unless a parent root context was already supplied.'],
            ['S', 'Can destroy() run while a request is in progress?', 'The container waits for running service threads up to a timeout, but long requests can still be cut off, so code defensively.']],
        [['Log each stage.',
            r`@WebServlet(urlPatterns = "/life", loadOnStartup = 1)
public class LifeServlet extends HttpServlet {
    @Override public void init() { System.out.println("init"); }
    @Override protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        System.out.println("service on " + Thread.currentThread().getName());
        res.getWriter().println("hello");
    }
    @Override public void destroy() { System.out.println("destroy"); }
}

// OUTPUT: (thread name varies)
// init
// service on http-nio-8080-exec-1
// service on http-nio-8080-exec-2
// destroy   (on shutdown)`],
            ['Count requests safely.',
                r`private final AtomicLong hits = new AtomicLong();

@Override protected void doGet(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    res.setContentType("text/plain");
    res.getWriter().println("hits=" + hits.incrementAndGet());
}

// OUTPUT:
// hits=1
// hits=2`]],
        [['Unsafe shared field.',
            r`public class BadServlet extends HttpServlet {
    private String user;                 // shared by all threads: WRONG
    @Override protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        user = req.getParameter("u");
        res.getWriter().println("Hi " + user);   // may print another user
    }
}

// OUTPUT: (under load, varies)
// Hi baji   (request from anaji)`],
            ['Test the servlet with Spring mocks.',
                r`@Test
void servletWritesHello() throws Exception {
    var servlet = new LifeServlet();
    var req = new MockHttpServletRequest("GET", "/life");
    var res = new MockHttpServletResponse();
    servlet.service(req, res);
    assertEquals("hello", res.getContentAsString().trim());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-servlet-container': x(
        ['<b>Servlet container</b> (web container) is the server part that runs servlets: it listens on a port, parses HTTP into request and response objects and calls your servlets.',
            '<b>Examples</b> are Tomcat, Jetty and Undertow; they implement the Jakarta Servlet specification.',
            '<b>Container services</b> include the lifecycle, threading, sessions, security, URL mapping and deployment.'],
        ['<b>Embedded vs external</b>: Spring Boot embeds the container in the jar and starts it with <code>SpringApplication.run</code>; classic apps ship a WAR to an external server.',
            '<b>Thread pool</b>: the container owns the request threads, so a slow controller occupies one of them.',
            '<b>Switching</b> the embedded container means excluding <code>spring-boot-starter-tomcat</code> and adding <code>spring-boot-starter-jetty</code> or the Undertow starter.'],
        ['<b>Boot wiring</b>: <code>ServletWebServerFactory</code> creates the container and <code>ServletContextInitializer</code> beans register servlets and filters.',
            '<b>WAR deployment</b> needs a <code>SpringBootServletInitializer</code> subclass and a provided-scope container starter.',
            '<b>Jakarta</b>: Servlet 5 and later moved from <code>javax.servlet</code> to <code>jakarta.servlet</code>; Spring Boot 3 requires the new package.'],
        [['F', 'What is a servlet container?', 'Software that hosts servlets, handles HTTP and manages their lifecycle. Tomcat is the best known.'],
            ['F', 'Name three containers.', 'Tomcat, Jetty and Undertow.'],
            ['M', 'What does Spring Boot do differently from a classic WAR deployment?', 'It starts an embedded container inside the application process, so you run a jar with java -jar.'],
            ['M', 'How do you change the embedded container?', 'Exclude the Tomcat starter from spring-boot-starter-web and add the Jetty or Undertow starter.'],
            ['S', 'Which Boot component builds the web server?', 'A ServletWebServerFactory bean, such as TomcatServletWebServerFactory, used by ServletWebServerApplicationContext.'],
            ['S', 'Who owns the request thread pool?', 'The container. In Tomcat it is the connector executor, tuned with server.tomcat.threads.max.']],
        [['Switch to Jetty in Maven.',
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
// Jetty started on port 8080 (http/1.1) with context path '/'`],
            ['Show which container runs.',
                r`@RestController
class InfoController {
    @GetMapping("/server")
    String server(HttpServletRequest req) {
        return req.getServletContext().getServerInfo();
    }
}

// OUTPUT: (varies by container)
// Apache Tomcat/10.1.x`]],
        [['Mixing javax and jakarta.',
            r`// WRONG with Spring Boot 3: container only knows jakarta.servlet
// import javax.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequest;   // RIGHT

// OUTPUT:
// Without the fix: NoClassDefFoundError / compile error for javax types`],
            ['Run the container in a test.',
                r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ServerTest {
    @LocalServerPort int port;
    @Autowired TestRestTemplate rest;

    @Test void respondsOverRealHttp() {
        var body = rest.getForObject("http://localhost:" + port + "/server", String.class);
        assertNotNull(body);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0   (a real embedded container started)`]]
    ),

    'mvc-tomcat': x(
        ['<b>Tomcat</b> is the Apache open-source servlet container; it implements the Jakarta Servlet, JSP and WebSocket specifications and is the default server in <code>spring-boot-starter-web</code>.',
            '<b>Connector and engine</b>: a connector accepts HTTP connections (default port 8080) and passes requests to the engine, which finds the host and the web application.',
            '<b>Deployment</b>: classic Tomcat runs WAR files from its <code>webapps</code> folder, while Boot embeds Tomcat inside the jar.'],
        ['<b>Properties</b> such as <code>server.port</code>, <code>server.servlet.context-path</code> and <code>server.tomcat.threads.max</code> tune the embedded server.',
            '<b>Thread pool</b>: the default maximum is 200 request threads; more concurrent slow requests than that queue up.',
            '<b>Logs</b>: embedded Tomcat writes to the application log, and access logs can be switched on with <code>server.tomcat.accesslog.enabled</code>.'],
        ['<b>Class loading</b>: each web app has its own class loader in a standalone Tomcat, but an embedded one has a single application.',
            '<b>Customizing</b> through a <code>WebServerFactoryCustomizer&lt;TomcatServletWebServerFactory&gt;</code> bean gives code-level control of connectors.',
            '<b>Graceful shutdown</b> is enabled with <code>server.shutdown=graceful</code> so running requests can finish.'],
        [['F', 'What is the default port of Tomcat?', '8080.'],
            ['F', 'What is Tomcat used for?', 'To run Java web applications built on servlets and JSP.'],
            ['M', 'How do you change the port in Spring Boot?', 'Set server.port in application.properties; server.port=0 picks a random free port.'],
            ['M', 'What is the difference between embedded and standalone Tomcat?', 'Embedded runs inside your jar and is configured by Boot properties; standalone hosts several WAR files and is configured through server.xml.'],
            ['S', 'How do you size the thread pool?', 'Use server.tomcat.threads.max and threads.min-spare, and also set accept-count and max-connections for the queue and socket limits.'],
            ['S', 'Which connector implementation does Tomcat use?', 'NIO by default (Http11NioProtocol), where a small poller handles sockets and worker threads run the servlets.']],
        [['Tune Tomcat in properties.',
            r`# application.properties
server.port=9090
server.servlet.context-path=/shop
server.tomcat.threads.max=100
server.shutdown=graceful

# OUTPUT:
# Tomcat started on port 9090 (http) with context path '/shop'`],
            ['Customize the connector in code.',
                r`@Bean
WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatTuning() {
    return factory -> factory.addConnectorCustomizers(
        connector -> connector.setProperty("maxKeepAliveRequests", "50"));
}

// OUTPUT:
// Tomcat started on port 8080 (http) with context path ''`]],
        [['Port already in use.',
            r`// Fails to start when another process holds 8080
// Fix: change the port or stop the other process
# server.port=8081

// OUTPUT:
// Web server failed to start. Port 8080 was already in use.`],
            ['Check the server in a test.',
                r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class PortTest {
    @LocalServerPort int port;
    @Test void portIsAssigned() { assertTrue(port > 0); }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-httpservletrequest-servlet': x(
        ['<b>HttpServletRequest</b> is the object that represents one incoming HTTP request: method, URL, headers, parameters, cookies and body.',
            '<b>Reading data</b> uses <code>getParameter</code> for query and form values, <code>getHeader</code> for headers and <code>getInputStream</code> for the body.',
            '<b>Request attributes</b> (<code>setAttribute</code> and <code>getAttribute</code>) carry data between filters, servlets and views within one request.'],
        ['<b>Spring MVC</b> hides it: <code>@RequestParam</code>, <code>@RequestHeader</code> and <code>@PathVariable</code> read values for you, but you can still declare <code>HttpServletRequest</code> as a method argument.',
            '<b>Body is read once</b>: the stream can be consumed only one time, so wrap it with <code>ContentCachingRequestWrapper</code> when a filter must also read it.',
            '<b>Encoding</b>: form data is decoded with the request character encoding; Boot sets UTF-8 through <code>CharacterEncodingFilter</code>.'],
        ['<b>Container object</b>: Tomcat creates a <code>Request</code> facade per call and recycles it, so never keep a reference after the request ends.',
            '<b>Async</b>: after <code>startAsync()</code> the request stays valid until completion, which Spring uses for <code>DeferredResult</code> and <code>Callable</code>.',
            '<b>Client address</b>: <code>getRemoteAddr()</code> shows the proxy behind a load balancer, so configure forwarded headers handling.'],
        [['F', 'What does HttpServletRequest represent?', 'One HTTP request with its method, headers, parameters, cookies and body.'],
            ['F', 'How do you read a query parameter?', 'request.getParameter("name"), which returns null if missing.'],
            ['M', 'Difference between parameter and attribute?', 'Parameters come from the client and are strings; attributes are server-side objects set by your code and live for the request.'],
            ['M', 'Why can the request body not be read twice?', 'The input stream is consumed. Use a caching wrapper or read it once and pass the result on.'],
            ['S', 'How do you get the real client IP behind a proxy?', 'Read X-Forwarded-For, or enable server.forward-headers-strategy so the container applies it.'],
            ['S', 'Can you use the request object in another thread?', 'Not safely; the container reuses it. Copy the needed values first, or use async support.']],
        [['Read request details.',
            r`@GetMapping("/info")
String info(HttpServletRequest req) {
    return req.getMethod() + " " + req.getRequestURI()
        + " q=" + req.getParameter("q")
        + " ua=" + req.getHeader("User-Agent");
}

// OUTPUT: (request GET /info?q=java)
// GET /info q=java ua=curl/8.4.0`],
            ['Share data using attributes.',
                r`// In a filter
req.setAttribute("startNanos", System.nanoTime());
// In a controller
long start = (long) req.getAttribute("startNanos");
long micros = (System.nanoTime() - start) / 1000;
System.out.println("elapsed us=" + micros);

// OUTPUT: (varies)
// elapsed us=240`]],
        [['Reading the body twice.',
            r`String a = new String(req.getInputStream().readAllBytes());
String b = new String(req.getInputStream().readAllBytes()); // empty: WRONG
System.out.println("[" + a + "][" + b + "]");

// OUTPUT:
// [{"id":1}][]`],
            ['Test with MockMvc.',
                r`mockMvc.perform(get("/info").param("q", "java").header("User-Agent", "test"))
    .andExpect(status().isOk())
    .andExpect(content().string("GET /info q=java ua=test"));

// OUTPUT:
// Status = 200, Body = GET /info q=java ua=test`]]
    ),

    'mvc-httpservletresponse-servlet': x(
        ['<b>HttpServletResponse</b> is the object you fill to answer a request: status code, headers, cookies and the body.',
            '<b>Body writing</b> uses <code>getWriter()</code> for text or <code>getOutputStream()</code> for bytes; you may use only one of the two per response.',
            '<b>Status and type</b> are set with <code>setStatus</code>, <code>sendError</code> and <code>setContentType</code> before any body is written.'],
        ['<b>Spring MVC</b> normally builds the response for you from <code>@ResponseBody</code>, <code>ResponseEntity</code> and view rendering.',
            '<b>Committed response</b>: once the buffer is flushed, headers and status cannot change and <code>sendRedirect</code> throws <code>IllegalStateException</code>.',
            '<b>Redirect</b>: <code>sendRedirect</code> sends a 302 with a <code>Location</code> header, and the browser makes a new GET request.'],
        ['<b>Buffering</b>: the container buffers (about 8 KB in Tomcat) so that headers can still be changed until the buffer fills or <code>flushBuffer</code> runs.',
            '<b>Streaming</b>: large downloads should use <code>StreamingResponseBody</code> or <code>ResponseEntity&lt;Resource&gt;</code> instead of building bytes in memory.',
            '<b>sendError</b> hands control to the container error page, which Boot maps to <code>/error</code> and <code>BasicErrorController</code>.'],
        [['F', 'What is HttpServletResponse for?', 'To send the status, headers and body back to the client.'],
            ['F', 'How do you set a response header?', 'response.setHeader("X-App", "demo") or addHeader to add another value.'],
            ['M', 'What is the difference between sendRedirect and forward?', 'sendRedirect tells the browser to make a new request (URL changes); forward is internal to the server and keeps the URL.'],
            ['M', 'Why do you get IllegalStateException: response already committed?', 'You changed status, headers or redirected after the body started to be sent.'],
            ['S', 'getWriter or getOutputStream?', 'Writer for character text with the response encoding, stream for binary data. Calling both throws IllegalStateException.'],
            ['S', 'How do you stream a big file?', 'Return a Resource or StreamingResponseBody so data is copied in chunks, not loaded into memory.']],
        [['Write plain text and a header.',
            r`@GetMapping("/hello")
void hello(HttpServletResponse res) throws IOException {
    res.setStatus(HttpServletResponse.SC_OK);
    res.setContentType("text/plain;charset=UTF-8");
    res.setHeader("X-App", "demo");
    res.getWriter().print("Hello");
}

// OUTPUT:
// HTTP/1.1 200
// X-App: demo
// Content-Type: text/plain;charset=UTF-8
//
// Hello`],
            ['Redirect.',
                r`@GetMapping("/old")
void old(HttpServletResponse res) throws IOException {
    res.sendRedirect("/new");
}

// OUTPUT:
// HTTP/1.1 302
// Location: /new`]],
        [['Header after the body.',
            r`res.getWriter().println("data");
res.flushBuffer();
res.setHeader("X-Late", "1");        // ignored: response committed
res.sendRedirect("/x");              // IllegalStateException

// OUTPUT:
// java.lang.IllegalStateException: Cannot call sendRedirect() after the response has been committed`],
            ['Test the response.',
                r`mockMvc.perform(get("/hello"))
    .andExpect(status().isOk())
    .andExpect(header().string("X-App", "demo"))
    .andExpect(content().string("Hello"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-httpsession-servlet': x(
        ['<b>HttpSession</b> stores per-user data across several requests, because HTTP itself is stateless.',
            '<b>Session id</b>: the container creates a session and sends its id in the <code>JSESSIONID</code> cookie; the browser returns it with every request.',
            '<b>API</b>: <code>request.getSession()</code> creates or returns the session, <code>setAttribute</code> and <code>getAttribute</code> store values, and <code>invalidate()</code> ends it (for example on logout).'],
        ['<b>Timeout</b>: an idle session expires after 30 minutes by default; set <code>server.servlet.session.timeout</code> or call <code>setMaxInactiveInterval</code>.',
            '<b>Spring MVC</b> offers <code>@SessionAttributes</code> and <code>@SessionAttribute</code>, and you can inject <code>HttpSession</code> into a handler method.',
            '<b>Serializable</b>: values should implement <code>Serializable</code> so sessions can be persisted or replicated.'],
        ['<b>Clustering</b>: in-memory sessions live on one server, so use sticky sessions or Spring Session with Redis or JDBC to share them.',
            '<b>Security</b>: change the session id after login (session fixation protection) and mark the cookie <code>HttpOnly</code> and <code>Secure</code>.',
            '<b>Memory</b>: big objects in a session multiply by the number of users, so store ids, not entities.'],
        [['F', 'Why do we need a session?', 'HTTP is stateless, so a session lets the server remember a user between requests.'],
            ['F', 'How does the server link a request to a session?', 'Through the session id sent as the JSESSIONID cookie (or URL rewriting).'],
            ['M', 'getSession() versus getSession(false)?', 'getSession() creates a session if none exists; getSession(false) returns null instead.'],
            ['M', 'How do you log a user out?', 'Call session.invalidate(), which removes all attributes and the id.'],
            ['S', 'What is session fixation and the defense?', 'An attacker forces a known session id on the victim. Spring Security changes the id on login.'],
            ['S', 'How do you scale sessions across servers?', 'Externalize them with Spring Session (Redis, JDBC) or keep the app stateless with tokens.']],
        [['Count visits in a session.',
            r`@GetMapping("/visits")
String visits(HttpSession session) {
    Integer n = (Integer) session.getAttribute("visits");
    n = (n == null) ? 1 : n + 1;
    session.setAttribute("visits", n);
    return "visits=" + n;
}

// OUTPUT: (same browser, three calls)
// visits=1
// visits=2
// visits=3`],
            ['Log out.',
                r`@PostMapping("/logout")
String logout(HttpSession session) {
    session.invalidate();
    return "redirect:/login";
}

// OUTPUT:
// HTTP/1.1 302
// Location: /login`]],
        [['Using a session with no cookie.',
            r`// Each curl call without a cookie jar gets a NEW session
// Fix: reuse the cookie
// curl -c jar.txt http://localhost:8080/visits
// curl -b jar.txt http://localhost:8080/visits

// OUTPUT:
// visits=1
// visits=2`],
            ['Test with MockMvc session.',
                r`MockHttpSession session = new MockHttpSession();
mockMvc.perform(get("/visits").session(session)).andExpect(content().string("visits=1"));
mockMvc.perform(get("/visits").session(session)).andExpect(content().string("visits=2"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-servletcontext': x(
        ['<b>ServletContext</b> represents the whole web application; there is exactly one per application (per container deployment).',
            '<b>Shared state</b>: attributes set with <code>setAttribute</code> are visible to every servlet, filter and user, so it works like application scope.',
            '<b>Information</b>: it gives the context path, init parameters, resource access with <code>getResourceAsStream</code> and the server info.'],
        ['<b>Get it</b> by <code>request.getServletContext()</code>, <code>getServletContext()</code> in a servlet, or by injecting it as a Spring bean in a web application.',
            '<b>Thread safety</b>: attributes are shared by all threads, so store thread-safe or immutable objects.',
            '<b>Spring link</b>: the root <code>WebApplicationContext</code> is stored as a ServletContext attribute, and <code>ServletContextAware</code> beans receive the object.'],
        ['<b>Boot</b>: the context is created by the embedded server, and <code>ServletContextInitializer</code> beans can register servlets and filters on it.',
            '<b>Scope</b>: a Spring bean in <code>application</code> scope is stored in the ServletContext.',
            '<b>Resources</b>: <code>getRealPath</code> may return null in a packaged jar, so prefer <code>getResourceAsStream</code> or Spring <code>Resource</code>.'],
        [['F', 'What is ServletContext?', 'The object that represents the web application and is shared by all servlets and users.'],
            ['F', 'How many exist per application?', 'One.'],
            ['M', 'Difference between ServletContext and HttpSession?', 'ServletContext is application wide for everyone; HttpSession is private to one user.'],
            ['M', 'How do you read a context init parameter?', 'getServletContext().getInitParameter("name"), set in web.xml or the initializer.'],
            ['S', 'Why avoid getRealPath in Spring Boot?', 'A jar has no real file system path, so it returns null; use classpath resources.'],
            ['S', 'How can a bean get the ServletContext?', 'Autowire it, implement ServletContextAware, or take it from a WebApplicationContext.']],
        [['Application-wide counter.',
            r`@GetMapping("/total")
String total(HttpServletRequest req) {
    ServletContext ctx = req.getServletContext();
    AtomicInteger c = (AtomicInteger) ctx.getAttribute("total");
    if (c == null) {
        c = new AtomicInteger();
        ctx.setAttribute("total", c);
    }
    return "total=" + c.incrementAndGet();
}

// OUTPUT: (different users)
// total=1
// total=2`],
            ['Context information.',
                r`@Autowired ServletContext ctx;

@GetMapping("/ctx")
String info() {
    return ctx.getContextPath() + " | " + ctx.getServerInfo();
}

// OUTPUT: (varies)
// /shop | Apache Tomcat/10.1.x`]],
        [['Non thread-safe shared value.',
            r`Integer n = (Integer) ctx.getAttribute("n");
ctx.setAttribute("n", n + 1);          // race: lost updates under load
// Fix: store an AtomicInteger or synchronize

// OUTPUT: (varies)
// two parallel calls may both write the same value`],
            ['Test with a mock context.',
                r`MockServletContext ctx = new MockServletContext();
ctx.setAttribute("app", "demo");
assertEquals("demo", ctx.getAttribute("app"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-servletconfig': x(
        ['<b>ServletConfig</b> holds the configuration of ONE servlet: its name, its init parameters and a reference to the <code>ServletContext</code>.',
            '<b>Passed to init()</b> by the container; <code>GenericServlet</code> stores it so you can call <code>getInitParameter</code>.',
            '<b>Per servlet</b>: unlike ServletContext (one per application), every servlet declaration gets its own ServletConfig.'],
        ['<b>Declare</b> init parameters with <code>@WebServlet(initParams = @WebInitParam(...))</code> or in <code>web.xml</code> under <code>init-param</code>.',
            '<b>DispatcherServlet</b> reads its own settings, such as <code>contextConfigLocation</code>, from the ServletConfig.',
            '<b>Context vs config</b>: <code>context-param</code> is shared by the whole app; <code>init-param</code> belongs to a single servlet.'],
        ['<b>Boot</b>: with <code>ServletRegistrationBean</code> you call <code>addInitParameter</code> to fill the ServletConfig.',
            '<b>HttpServletBean</b>: Spring maps init parameters onto bean properties of <code>DispatcherServlet</code> using <code>ServletConfigPropertyValues</code>.',
            '<b>Prefer</b> Spring <code>@Value</code> and properties for your own settings; ServletConfig is mostly a framework concern now.'],
        [['F', 'What is ServletConfig?', 'Configuration object for a single servlet, given to init().'],
            ['F', 'What can you read from it?', 'The servlet name, init parameters and the ServletContext.'],
            ['M', 'ServletConfig versus ServletContext?', 'Config is per servlet; context is per application and shared.'],
            ['M', 'How do you define an init parameter?', 'With @WebInitParam in @WebServlet, or init-param in web.xml, or addInitParameter on ServletRegistrationBean.'],
            ['S', 'How does DispatcherServlet use it?', 'HttpServletBean.init() copies the init parameters to its bean properties, for example contextConfigLocation.'],
            ['S', 'Why is it less important in Spring Boot?', 'Boot configures components through properties and beans, not servlet init parameters.']],
        [['Servlet with an init parameter.',
            r`@WebServlet(urlPatterns = "/greet",
    initParams = @WebInitParam(name = "greeting", value = "Welcome"))
public class GreetServlet extends HttpServlet {
    private String greeting;
    @Override public void init() {
        greeting = getServletConfig().getInitParameter("greeting");
    }
    @Override protected void doGet(HttpServletRequest q, HttpServletResponse r)
            throws IOException {
        r.getWriter().print(greeting);
    }
}

// OUTPUT:
// Welcome`],
            ['Register in Spring Boot.',
                r`@Bean
ServletRegistrationBean<GreetServlet> greet() {
    var bean = new ServletRegistrationBean<>(new GreetServlet(), "/greet");
    bean.addInitParameter("greeting", "Hello");
    return bean;
}

// OUTPUT:
// GET /greet -> Hello`]],
        [['Confusing config and context.',
            r`// WRONG: context-param read through ServletConfig
getServletConfig().getInitParameter("appName");          // null
getServletContext().getInitParameter("appName");         // RIGHT

// OUTPUT:
// null
// MyShop`],
            ['Test it with mocks.',
                r`var config = new MockServletConfig("greet");
config.addInitParameter("greeting", "Hi");
var servlet = new GreetServlet();
servlet.init(config);
var res = new MockHttpServletResponse();
servlet.service(new MockHttpServletRequest("GET", "/greet"), res);
assertEquals("Hi", res.getContentAsString());

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-filter-servlet': x(
        ['<b>Filter</b> is a component that sits in front of servlets and can inspect or change the request and the response, then pass control on with <code>chain.doFilter(request, response)</code>.',
            '<b>Typical uses</b>: logging, authentication, CORS, compression, character encoding and request timing.',
            '<b>Lifecycle</b>: <code>init()</code> once, <code>doFilter()</code> for each matching request and <code>destroy()</code> once.'],
        ['<b>Order</b> matters: filters form a chain, and each one runs before the next and again after it on the way back.',
            '<b>Boot</b>: a filter that is a <code>@Component</code> is registered for all URLs; use <code>FilterRegistrationBean</code> for URL patterns and order.',
            '<b>OncePerRequestFilter</b> is the Spring base class that guarantees one execution per request, even with forwards.'],
        ['<b>Filter vs interceptor</b>: filters belong to the servlet container and see every request; <code>HandlerInterceptor</code> belongs to Spring MVC and knows the handler method.',
            '<b>Spring Security</b> is a chain of filters inside <code>DelegatingFilterProxy</code> or <code>FilterChainProxy</code>.',
            '<b>Skipping the chain</b>: if you do not call <code>doFilter</code>, the request stops there, which is how a filter can block or short-circuit.'],
        [['F', 'What is a servlet filter?', 'A component that intercepts requests and responses before and after the servlet.'],
            ['F', 'Which method passes the request on?', 'chain.doFilter(request, response).'],
            ['M', 'Filter versus HandlerInterceptor?', 'A filter works at servlet level for all requests; an interceptor works inside DispatcherServlet and can use handler details.'],
            ['M', 'How do you set filter order in Boot?', 'Use FilterRegistrationBean.setOrder or @Order on the filter bean.'],
            ['S', 'Why extend OncePerRequestFilter?', 'It avoids running twice on forwards and errors, and gives doFilterInternal plus shouldNotFilter.'],
            ['S', 'How does a filter reject a request?', 'Write the status (for example 401) to the response and return without calling doFilter.']],
        [['Timing filter.',
            r`@Component
public class TimingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        long t = System.nanoTime();
        chain.doFilter(req, res);
        System.out.println(req.getRequestURI() + " took "
            + (System.nanoTime() - t) / 1_000_000 + " ms");
    }
}

// OUTPUT: (varies)
// /orders took 12 ms`],
            ['Register for one URL pattern.',
                r`@Bean
FilterRegistrationBean<TimingFilter> timing() {
    var bean = new FilterRegistrationBean<>(new TimingFilter());
    bean.addUrlPatterns("/api/*");
    bean.setOrder(1);
    return bean;
}

// OUTPUT:
// Mapping filter: 'timingFilter' to urls: [/api/*]`]],
        [['Forgetting the chain call.',
            r`@Override
protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
        FilterChain chain) throws IOException, ServletException {
    log.info("request");
    // chain.doFilter(req, res);    // missing: client gets an empty 200
}

// OUTPUT:
// HTTP/1.1 200   (empty body, controller never ran)`],
            ['Test with MockMvc.',
                r`MockMvc mvc = MockMvcBuilders.standaloneSetup(new OrderController())
    .addFilters(new TimingFilter()).build();
mvc.perform(get("/orders")).andExpect(status().isOk());

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-listener': x(
        ['<b>Listener</b> is a servlet component that gets a callback when something happens in the web application, such as startup, shutdown, a session being created or a request arriving.',
            '<b>Interfaces</b>: <code>ServletContextListener</code>, <code>HttpSessionListener</code>, <code>ServletRequestListener</code> and the matching attribute listeners.',
            '<b>Registration</b>: use <code>@WebListener</code>, <code>web.xml</code>, or in Spring Boot a <code>ServletListenerRegistrationBean</code> or a bean that implements the interface.'],
        ['<b>Startup hook</b>: <code>contextInitialized</code> runs when the application starts, and <code>contextDestroyed</code> when it stops.',
            '<b>Session counting</b>: <code>HttpSessionListener</code> sees <code>sessionCreated</code> and <code>sessionDestroyed</code>, a classic way to count active users.',
            '<b>Spring way</b>: for most startup work use <code>ApplicationRunner</code>, <code>@EventListener</code> or <code>ContextRefreshedEvent</code> instead of servlet listeners.'],
        ['<b>Boot detection</b>: beans implementing the servlet listener interfaces are registered automatically by <code>ServletContextInitializerBeans</code>.',
            '<b>ContextLoaderListener</b> is the classic listener that creates the root Spring context in a web.xml application.',
            '<b>Threading</b>: session listeners are called from request threads, so shared counters need atomic types.'],
        [['F', 'What is a servlet listener?', 'A class notified of lifecycle events of the context, sessions or requests.'],
            ['F', 'Name a listener interface.', 'ServletContextListener, HttpSessionListener or ServletRequestListener.'],
            ['M', 'How do you register a listener in Spring Boot?', 'Declare it as a bean (it is detected), or use ServletListenerRegistrationBean.'],
            ['M', 'How would you count active sessions?', 'Increment an AtomicInteger in sessionCreated and decrement it in sessionDestroyed.'],
            ['S', 'What does ContextLoaderListener do?', 'It starts the root WebApplicationContext in a classic web.xml deployment.'],
            ['S', 'When prefer Spring events over servlet listeners?', 'For application logic, since Spring events are typed, testable and independent of the container.']],
        [['Context listener.',
            r`@WebListener
public class AppListener implements ServletContextListener {
    @Override public void contextInitialized(ServletContextEvent e) {
        System.out.println("app started: " + e.getServletContext().getContextPath());
    }
    @Override public void contextDestroyed(ServletContextEvent e) {
        System.out.println("app stopped");
    }
}

// OUTPUT:
// app started: /shop
// app stopped`],
            ['Count active sessions in Boot.',
                r`@Component
public class SessionCounter implements HttpSessionListener {
    private final AtomicInteger active = new AtomicInteger();
    @Override public void sessionCreated(HttpSessionEvent e) {
        System.out.println("active=" + active.incrementAndGet());
    }
    @Override public void sessionDestroyed(HttpSessionEvent e) {
        System.out.println("active=" + active.decrementAndGet());
    }
}

// OUTPUT:
// active=1
// active=0`]],
        [['Listener not registered.',
            r`// @WebListener is ignored in Boot unless the app uses @ServletComponentScan
@SpringBootApplication
@ServletComponentScan          // RIGHT: enables @WebListener, @WebFilter, @WebServlet
public class App { }

// OUTPUT:
// Without the annotation, contextInitialized never prints`],
            ['Test the listener directly.',
                r`var ctx = new MockServletContext();
new AppListener().contextInitialized(new ServletContextEvent(ctx));

// OUTPUT:
// app started:`]]
    )
};

export const smvc21Deep: Record<string, Deep> = {
    'mvc-servlet-lifecycle': dv(
        [`<p>The container controls the whole life of a servlet.</p><ul><li><b>Load:</b> the class is loaded and one instance is created, lazily or at startup.</li><li><b>init:</b> called once with a <code>ServletConfig</code>; the servlet is not in service until it returns.</li><li><b>service:</b> called on a worker thread for each request; <code>HttpServlet.service</code> dispatches by method.</li><li><b>destroy:</b> called once, after the servlet stops accepting work.</li><li><b>Spring:</b> <code>DispatcherServlet</code> builds its context during init and handles every request in <code>doService</code>.</li></ul>`,
            r`public abstract class HttpServlet extends GenericServlet {
    protected void service(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String m = req.getMethod();
        if (m.equals("GET")) doGet(req, res);
        else if (m.equals("POST")) doPost(req, res);
        else super.service(req, res);   // simplified
    }
}

// OUTPUT:
// GET  -> doGet
// POST -> doPost`],
        [`<p>Options that affect the lifecycle:</p><ul><li><b>Eager start:</b> <code>loadOnStartup</code> with a number; lower numbers start first.</li><li><b>Single thread model:</b> the old <code>SingleThreadModel</code> is removed; use stateless code or locks.</li><li><b>Boot property:</b> <code>spring.mvc.servlet.load-on-startup</code>, where the default -1 means lazy.</li><li><b>Async:</b> a request can leave service and finish later with <code>AsyncContext</code>.</li></ul>`,
            r`# application.properties
spring.mvc.servlet.load-on-startup=1

@WebServlet(urlPatterns = "/a", loadOnStartup = 2)
class A extends HttpServlet { }

// OUTPUT:
// DispatcherServlet initialized at startup (not at the first request)
// A initialized after servlets with a lower number`],
        [`<p>Typical mistakes:</p><ul><li><b>Mutable fields:</b> instance fields shared between threads cause data mix-ups.</li><li><b>Heavy work in init:</b> a slow or failing init delays or blocks the first requests.</li><li><b>Not closing resources:</b> forgetting to release pools in <code>destroy</code>.</li><li><b>Calling service by hand:</b> bypasses the container.</li></ul>`,
            r`public class Bad extends HttpServlet {
    private int counter;                       // WRONG: shared and not atomic
    protected void doGet(HttpServletRequest q, HttpServletResponse r) {
        counter++;
    }
}
// Fix: private final AtomicInteger counter = new AtomicInteger();

// OUTPUT: (varies)
// after 1000 parallel requests counter may be below 1000`],
        [`<p>Performance and tuning:</p><ul><li><b>Eager init</b> moves the cost of context creation from the first user to startup.</li><li><b>Thread pool:</b> request throughput is limited by container threads, not by the number of servlets.</li><li><b>Keep service short:</b> offload long work to async or an executor.</li><li><b>Avoid synchronized</b> on the whole service method.</li></ul>`,
            r`@GetMapping("/report")
Callable<String> report() {
    return () -> {                 // runs on a Spring MVC async thread
        Thread.sleep(2000);
        return "done";
    };
}

// OUTPUT:
// Container thread is released at once; response arrives after about 2 s`],
        [`<p>Real world: a payment service needs its HTTP client pool created once and closed on shutdown. With a plain servlet you do it in <code>init</code> and <code>destroy</code>; in Spring you make it a bean with <code>@PreDestroy</code> and let <code>DispatcherServlet</code> handle the rest.</p>`,
            r`@Component
class PaymentClient {
    private final HttpClient client = HttpClient.newHttpClient();
    @PostConstruct void start() { System.out.println("client ready"); }
    @PreDestroy void stop() { System.out.println("client closed"); }
}

// OUTPUT:
// client ready
// client closed   (on shutdown)`]
    ),

    'mvc-servlet-container': dv(
        [`<p>A container turns sockets into servlet calls.</p><ul><li><b>Connector:</b> accepts connections and parses HTTP.</li><li><b>Pipeline:</b> engine, host, context and wrapper valves pass the request to the right servlet.</li><li><b>Thread pool:</b> one worker thread per active request (NIO poller plus workers).</li><li><b>Boot:</b> <code>ServletWebServerApplicationContext</code> asks a <code>ServletWebServerFactory</code> to create and start the server during refresh.</li></ul>`,
            r`// Simplified Boot startup order
SpringApplication.run(App.class, args);
// 1. create ServletWebServerApplicationContext
// 2. onRefresh() -> createWebServer() using TomcatServletWebServerFactory
// 3. ServletContextInitializer beans register DispatcherServlet and filters
// 4. finishRefresh() -> webServer.start()

// OUTPUT:
// Tomcat initialized with port 8080 (http)
// Tomcat started on port 8080 (http) with context path ''`],
        [`<p>Options:</p><ul><li><b>Tomcat:</b> default, widest use.</li><li><b>Jetty:</b> light, good for embedding.</li><li><b>Undertow:</b> non-blocking core, low memory.</li><li><b>WAR:</b> extend <code>SpringBootServletInitializer</code> and mark the container starter as provided.</li><li><b>Reactive:</b> WebFlux uses Netty and not a servlet container by default.</li></ul>`,
            r`@SpringBootApplication
public class App extends SpringBootServletInitializer {
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder b) {
        return b.sources(App.class);          // used when deployed as a WAR
    }
    public static void main(String[] args) { SpringApplication.run(App.class, args); }
}

// OUTPUT:
// java -jar app.war   -> runs embedded
// copy to webapps/    -> runs in external Tomcat`],
        [`<p>Mistakes:</p><ul><li><b>Two containers</b> on the classpath (Tomcat and Jetty) without exclusion.</li><li><b>Packaging WAR</b> without making the embedded starter provided, causing class conflicts.</li><li><b>javax imports</b> with Boot 3.</li><li><b>Hard-coded port</b> in tests; use <code>RANDOM_PORT</code>.</li></ul>`,
            r`<!-- WAR build: embedded Tomcat must not be packaged -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>

<!-- OUTPUT -->
// Without provided scope, duplicate servlet classes may break deployment`],
        [`<p>Tuning:</p><ul><li><b>Threads:</b> size for blocking time; default 200 is often too many for a small machine.</li><li><b>Keep-alive and compression:</b> reduce connection cost.</li><li><b>Access log</b> costs I/O; enable only when needed.</li><li><b>Virtual threads</b> (Java 21 and Boot 3.2) can serve blocking code with a small pool, enabled by <code>spring.threads.virtual.enabled</code>.</li></ul>`,
            r`# application.properties
server.tomcat.threads.max=100
server.tomcat.accept-count=50
server.compression.enabled=true
server.http2.enabled=true

# OUTPUT:
# Tomcat started on port 8080 (http, h2c) with context path ''`],
        [`<p>Real world: a team moves from an external Tomcat that hosts five WARs to one jar per service in containers. Each service embeds its server, sets its own thread limits and shuts down gracefully when the orchestrator stops it.</p>`,
            r`# application.properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s

# OUTPUT:
# Commencing graceful shutdown. Waiting for active requests to complete
# Graceful shutdown complete`]
    ),

    'mvc-tomcat': dv(
        [`<p>Tomcat is built from nested components.</p><ul><li><b>Server and Service:</b> top-level objects.</li><li><b>Connector:</b> protocol handler, NIO by default.</li><li><b>Engine, Host, Context:</b> the Context is one web application.</li><li><b>Wrapper:</b> one per servlet.</li><li><b>Valves:</b> pipeline steps such as the access log valve.</li><li><b>Embedded:</b> Boot builds this tree in code, with <code>TomcatServletWebServerFactory</code>, instead of server.xml.</li></ul>`,
            r`<!-- standalone conf/server.xml (shortened) -->
<Server port="8005" shutdown="SHUTDOWN">
  <Service name="Catalina">
    <Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000"/>
    <Engine name="Catalina" defaultHost="localhost">
      <Host name="localhost" appBase="webapps"/>
    </Engine>
  </Service>
</Server>

<!-- OUTPUT -->
// Catalina: Server startup in [1520] milliseconds (varies)`],
        [`<p>Useful Boot properties:</p><ul><li><code>server.port</code>, <code>server.address</code></li><li><code>server.servlet.context-path</code></li><li><code>server.tomcat.threads.max</code> and <code>threads.min-spare</code></li><li><code>server.tomcat.max-connections</code> and <code>accept-count</code></li><li><code>server.tomcat.max-http-form-post-size</code></li><li><code>server.tomcat.accesslog.enabled</code></li><li><code>server.ssl.*</code> for HTTPS</li></ul>`,
            r`# application.properties
server.port=8443
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=changeit
server.tomcat.accesslog.enabled=true
server.tomcat.basedir=target/tomcat

# OUTPUT:
# Tomcat started on port 8443 (https) with context path ''`],
        [`<p>Mistakes:</p><ul><li><b>Port clash</b> with another process.</li><li><b>Large upload fails</b> because of the multipart and post size limits.</li><li><b>Context path forgotten</b> in URLs after setting it.</li><li><b>Memory leaks</b> on redeploy in standalone Tomcat from threads or drivers that are not stopped.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=25MB

# OUTPUT:
# Without these limits, a 5 MB file works but a 2 GB file gives
# MaxUploadSizeExceededException (HTTP 413 or 500, varies)`],
        [`<p>Tuning:</p><ul><li><b>Measure first:</b> expose <code>tomcat.threads.busy</code> via Actuator metrics.</li><li><b>Threads:</b> raise only if the CPU is idle while requests queue.</li><li><b>Timeouts:</b> <code>server.tomcat.connection-timeout</code> frees stuck connections.</li><li><b>Compression and HTTP/2</b> reduce bandwidth.</li></ul>`,
            r`# application.properties
management.endpoints.web.exposure.include=metrics
# then query:
# GET /actuator/metrics/tomcat.threads.busy

// OUTPUT: (varies)
// {"name":"tomcat.threads.busy","measurements":[{"statistic":"VALUE","value":4.0}]}`],
        [`<p>Real world: during a sale, requests get slower. Metrics show all 200 threads busy waiting for a slow database. The fix is to optimize queries and add a pool timeout, not to raise the thread count.</p>`,
            r`# application.properties
spring.datasource.hikari.maximum-pool-size=30
spring.datasource.hikari.connection-timeout=2000
server.tomcat.threads.max=200

# OUTPUT:
# Callers fail fast after 2 s instead of piling up on Tomcat threads`]
    ),

    'mvc-httpservletrequest-servlet': dv(
        [`<p>How the request object is built.</p><ul><li>The connector parses the request line, headers and creates a <code>Request</code> object.</li><li>The container hands your code a <code>RequestFacade</code> that limits access to internals.</li><li>Parameters are parsed lazily on the first <code>getParameter</code> call, from the query string and, for form posts, the body.</li><li>Spring wraps it in <code>ServletWebRequest</code> and stores it in <code>RequestContextHolder</code>.</li></ul>`,
            r`// Anywhere in the same request thread
HttpServletRequest req =
    ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
        .getRequest();
System.out.println(req.getMethod());

// OUTPUT:
// GET`],
        [`<p>Main reading options:</p><ul><li><b>Line:</b> <code>getMethod</code>, <code>getRequestURI</code>, <code>getQueryString</code>.</li><li><b>Headers:</b> <code>getHeader</code>, <code>getHeaders</code>, <code>getHeaderNames</code>.</li><li><b>Parameters:</b> <code>getParameter</code>, <code>getParameterValues</code>, <code>getParameterMap</code>.</li><li><b>Body:</b> <code>getReader</code> or <code>getInputStream</code>.</li><li><b>Other:</b> <code>getCookies</code>, <code>getSession</code>, <code>getPart</code> for multipart.</li><li><b>Spring annotations</b> cover most cases.</li></ul>`,
            r`@PostMapping("/echo")
String echo(@RequestParam String name,
            @RequestHeader("X-Trace") String trace,
            @CookieValue(defaultValue = "none") String theme,
            HttpServletRequest raw) {
    return name + "|" + trace + "|" + theme + "|" + raw.getContentType();
}

// OUTPUT:
// ann|abc|dark|application/x-www-form-urlencoded`],
        [`<p>Mistakes:</p><ul><li><b>NullPointerException</b> from a missing parameter; check null or use <code>@RequestParam(required = false)</code>.</li><li><b>Body consumed</b> by a filter, so the controller sees nothing.</li><li><b>Trusting client headers</b> such as X-Forwarded-For without a trusted proxy.</li><li><b>Keeping the request</b> in a background thread.</li></ul>`,
            r`@Component
public class CachingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        var wrapped = new ContentCachingRequestWrapper(req);
        chain.doFilter(wrapped, res);           // body readable afterwards
        System.out.println(new String(wrapped.getContentAsByteArray()));
    }
}

// OUTPUT:
// {"name":"ann"}`],
        [`<p>Tuning:</p><ul><li><b>Do not log full bodies</b> for large uploads.</li><li><b>Limit size:</b> post size and multipart limits protect memory.</li><li><b>Avoid <code>getParameterMap</code></b> copies in hot paths.</li><li><b>Stream big bodies</b> instead of reading all bytes.</li></ul>`,
            r`// Stream a large upload to disk without loading it in memory
try (InputStream in = req.getInputStream()) {
    Files.copy(in, Path.of("upload.bin"), StandardCopyOption.REPLACE_EXISTING);
}

// OUTPUT:
// memory stays flat while 500 MB is written`],
        [`<p>Real world: an audit filter records method, path, user and a request id for every call. It reads headers only, adds the id as an attribute and as a log context entry, and never touches the body.</p>`,
            r`@Override
protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
        FilterChain chain) throws ServletException, IOException {
    String id = UUID.randomUUID().toString();
    req.setAttribute("requestId", id);
    MDC.put("requestId", id);
    try { chain.doFilter(req, res); } finally { MDC.clear(); }
}

// OUTPUT: (varies)
// 2026-10-08 INFO [requestId=3f2a...] GET /orders`]
    ),

    'mvc-httpservletresponse-servlet': dv(
        [`<p>How the response is produced.</p><ul><li>You write to a buffered output; nothing reaches the socket until the buffer flushes.</li><li>The response is <b>committed</b> when the status line and headers are sent.</li><li>Spring message converters write <code>@ResponseBody</code> values to this stream.</li><li>After the handler returns, the container flushes and completes the response.</li></ul>`,
            r`@GetMapping("/state")
void state(HttpServletResponse res) throws IOException {
    System.out.println("committed? " + res.isCommitted());
    res.getWriter().print("x");
    res.flushBuffer();
    System.out.println("committed? " + res.isCommitted());
}

// OUTPUT:
// committed? false
// committed? true`],
        [`<p>Variants:</p><ul><li><b>Status:</b> <code>setStatus(201)</code> or <code>sendError(404)</code>.</li><li><b>Headers:</b> <code>setHeader</code>, <code>addHeader</code>, <code>setDateHeader</code>.</li><li><b>Cookies:</b> <code>addCookie</code> or <code>ResponseCookie</code> for SameSite.</li><li><b>Spring style:</b> <code>ResponseEntity</code> and <code>@ResponseStatus</code>.</li><li><b>Download:</b> <code>Content-Disposition</code> header.</li></ul>`,
            r`@GetMapping("/file")
ResponseEntity<byte[]> file() {
    byte[] data = "id,name\n1,ann\n".getBytes(StandardCharsets.UTF_8);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(data);
}

// OUTPUT:
// HTTP/1.1 200
// Content-Disposition: attachment; filename=users.csv
// Content-Type: text/csv`],
        [`<p>Mistakes:</p><ul><li><b>Writer and stream both used</b> raises <code>IllegalStateException</code>.</li><li><b>Missing content type</b> or encoding gives garbled characters.</li><li><b>Redirect after commit.</b></li><li><b>Writing after a controller already returned a view</b> or body.</li></ul>`,
            r`res.getOutputStream().write(1);
res.getWriter().print("x");        // WRONG after getOutputStream

// OUTPUT:
// java.lang.IllegalStateException: getOutputStream() has already been called`],
        [`<p>Tuning:</p><ul><li><b>Stream</b> large bodies in chunks.</li><li><b>Compression</b> with <code>server.compression.enabled</code>.</li><li><b>Caching headers</b> (<code>Cache-Control</code>, ETag) avoid repeat transfers.</li><li><b>Buffer size</b> via <code>setBufferSize</code> before writing.</li></ul>`,
            r`@GetMapping("/big")
StreamingResponseBody big() {
    return out -> {
        for (int i = 0; i < 100_000; i++) {
            out.write(("line " + i + "\n").getBytes(StandardCharsets.UTF_8));
        }
    };
}

// OUTPUT:
// data is sent in chunks; heap use stays small`],
        [`<p>Real world: a reporting endpoint exports a million rows as CSV. It streams rows from the database cursor straight to the response with a download header, so the server never builds the whole file in memory.</p>`,
            r`@GetMapping("/export")
void export(HttpServletResponse res) throws IOException {
    res.setContentType("text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=all.csv");
    try (PrintWriter w = res.getWriter()) {
        repo.streamAll().forEach(u -> w.println(u.id() + "," + u.name()));
    }
}

// OUTPUT:
// all.csv downloads while rows are still being read`]
    ),

    'mvc-httpsession-servlet': dv(
        [`<p>How sessions work inside the container.</p><ul><li>The container keeps a map from session id to <code>HttpSession</code> (Tomcat <code>StandardManager</code>).</li><li>On the first <code>getSession()</code> it creates a random id and sends <code>Set-Cookie: JSESSIONID</code>.</li><li>On later requests it reads the cookie and finds the object.</li><li>A background task removes sessions idle past the timeout.</li><li>Spring Session replaces the container manager by a filter that stores data in Redis or a database.</li></ul>`,
            r`@GetMapping("/sid")
String sid(HttpSession s) {
    return s.getId() + " new=" + s.isNew() + " idle=" + s.getMaxInactiveInterval();
}

// OUTPUT: (varies)
// 8F2C... new=true idle=1800`],
        [`<p>Options:</p><ul><li><b>Timeout</b> in properties or code.</li><li><b>Cookie settings:</b> <code>server.servlet.session.cookie.http-only</code>, <code>secure</code>, <code>same-site</code>.</li><li><b>Tracking mode:</b> cookie only is safest.</li><li><b>@SessionAttributes</b> keeps model values in the session for a controller.</li><li><b>Spring Session</b> for external storage.</li></ul>`,
            r`# application.properties
server.servlet.session.timeout=20m
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=lax
server.servlet.session.tracking-modes=cookie

# OUTPUT:
# Set-Cookie: JSESSIONID=...;
Path=/;
Secure;
HttpOnly;
SameSite=Lax`],
        [`<p>Mistakes:</p><ul><li><b>Storing large objects</b> or JPA entities.</li><li><b>No invalidate</b> on logout.</li><li><b>Creating sessions for every request</b> (for example bots), which wastes memory.</li><li><b>Non-serializable values</b> in a replicated session.</li><li><b>Concurrent modification</b> of the same session from parallel calls.</li></ul>`,
            r`// WRONG: entity with lazy collections in the session
session.setAttribute("user", userEntity);
// RIGHT: store a small id and load when needed
session.setAttribute("userId", userEntity.getId());

// OUTPUT:
// Smaller sessions and no LazyInitializationException later`],
        [`<p>Tuning:</p><ul><li><b>Short timeout</b> frees memory.</li><li><b>Use <code>getSession(false)</code></b> where a session is not needed.</li><li><b>Stateless APIs</b> with JWT avoid session memory entirely.</li><li><b>External store</b> adds latency but lets you scale out.</li></ul>`,
            r`HttpSession s = req.getSession(false);
if (s == null) {
    res.sendError(HttpServletResponse.SC_UNAUTHORIZED);   // no session created
    return;
}

// OUTPUT:
// HTTP/1.1 401   (no JSESSIONID issued)`],
        [`<p>Real world: a shopping cart is kept in the session for guests. With three app servers behind a load balancer the cart disappears, so the team adds Spring Session with Redis and the cart survives server changes.</p>`,
            r`<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>

# application.properties
spring.session.store-type=redis
spring.session.timeout=30m

# OUTPUT:
# Sessions are stored in Redis under spring:session:sessions:...`]
    ),

    'mvc-servletcontext': dv(
        [`<p>One <code>ServletContext</code> object (a Tomcat <code>ApplicationContext</code> facade) exists per deployed web application.</p><ul><li>It holds an attribute map shared by all components.</li><li>It knows the registered servlets and filters and allows dynamic registration while the app starts.</li><li>Spring stores the root context under the attribute <code>WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE</code>.</li></ul>`,
            r`WebApplicationContext root =
    WebApplicationContextUtils.getRequiredWebApplicationContext(servletContext);
System.out.println(root.getBeanDefinitionCount() > 0);

// OUTPUT:
// true`],
        [`<p>Capabilities:</p><ul><li><b>Attributes:</b> <code>setAttribute</code>, <code>getAttribute</code>, <code>removeAttribute</code>.</li><li><b>Parameters:</b> <code>getInitParameter</code>.</li><li><b>Resources:</b> <code>getResource</code>, <code>getResourceAsStream</code>.</li><li><b>Logging:</b> <code>log()</code>.</li><li><b>Dynamic registration:</b> <code>addServlet</code>, <code>addFilter</code>, <code>addListener</code> during startup.</li><li><b>Dispatch:</b> <code>getRequestDispatcher</code>.</li></ul>`,
            r`@Bean
ServletContextInitializer extraServlet() {
    return ctx -> ctx.addServlet("health", new HttpServlet() {
        @Override protected void doGet(HttpServletRequest q, HttpServletResponse r)
                throws IOException { r.getWriter().print("UP"); }
    }).addMapping("/health-lite");
}

// OUTPUT:
// GET /health-lite -> UP`],
        [`<p>Mistakes:</p><ul><li><b>Global mutable state</b> that is not thread-safe.</li><li><b>Using it as a cache</b> without limits or eviction.</li><li><b>getRealPath</b> in a packaged jar.</li><li><b>Storing user data</b> there, where it leaks to other users.</li></ul>`,
            r`// WRONG: user data in application scope, shared by all users
ctx.setAttribute("currentUser", name);
// RIGHT: use the session or a request attribute
req.getSession().setAttribute("currentUser", name);

// OUTPUT:
// Each user now sees only their own name`],
        [`<p>Tuning:</p><ul><li><b>Prefer Spring beans</b> (singleton scope) over ServletContext attributes for shared objects.</li><li><b>Use concurrent collections</b> for shared caches.</li><li><b>Use a real cache</b> such as Caffeine for size limits.</li></ul>`,
            r`@Bean
Cache<String, Product> productCache() {
    return Caffeine.newBuilder().maximumSize(10_000)
        .expireAfterWrite(Duration.ofMinutes(10)).build();
}

// OUTPUT:
// Bounded cache replaces an unbounded ServletContext map`],
        [`<p>Real world: legacy code stores a configuration map in the ServletContext at startup. During migration to Boot the team moves it to a <code>@ConfigurationProperties</code> bean, so values are typed, validated and injectable.</p>`,
            r`@ConfigurationProperties(prefix = "shop")
public record ShopProps(String name, int maxItems) { }

# application.properties
shop.name=Demo
shop.max-items=20

// OUTPUT:
// ShopProps[name=Demo, maxItems=20]`]
    ),

    'mvc-servletconfig': dv(
        [`<p>The container creates one <code>ServletConfig</code> per servlet registration and passes it to <code>init(ServletConfig)</code>.</p><ul><li><code>GenericServlet</code> keeps it and calls the no-argument <code>init()</code> as a convenience.</li><li><code>HttpServletBean.init()</code> turns init parameters into bean properties of <code>DispatcherServlet</code>.</li><li><code>FrameworkServlet</code> then creates the web application context.</li></ul>`,
            r`public abstract class HttpServletBean extends HttpServlet {
    @Override
    public final void init() throws ServletException {
        PropertyValues pvs = new ServletConfigPropertyValues(
            getServletConfig(), this.requiredProperties);
        // bind init-param names to bean properties, then:
        initServletBean();
    }
}

// OUTPUT:
// init-param contextConfigLocation -> DispatcherServlet.setContextConfigLocation`],
        [`<p>Ways to supply init parameters:</p><ul><li><b>Annotation:</b> <code>@WebInitParam</code>.</li><li><b>web.xml:</b> <code>init-param</code> elements.</li><li><b>Boot:</b> <code>ServletRegistrationBean.addInitParameter</code>.</li><li><b>Spring MVC WAR:</b> <code>AbstractAnnotationConfigDispatcherServletInitializer</code> configures the dispatcher in code.</li></ul>`,
            r`<servlet>
    <servlet-name>dispatcher</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/dispatcher-config.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>

<!-- OUTPUT -->
// Initializing Servlet 'dispatcher'`],
        [`<p>Mistakes:</p><ul><li><b>Wrong object:</b> reading a context parameter from the config.</li><li><b>Using config before init:</b> it is null in the constructor.</li><li><b>Overriding <code>init(ServletConfig)</code></b> without calling <code>super</code>, which loses the config.</li><li><b>Typos</b> in parameter names return null silently.</li></ul>`,
            r`@Override
public void init(ServletConfig config) throws ServletException {
    super.init(config);                  // RIGHT: keeps getServletConfig() working
    this.greeting = config.getInitParameter("greeting");
}

// OUTPUT:
// Without super.init(config): NullPointerException in getServletConfig()`],
        [`<p>Performance is not affected by ServletConfig; the cost is only at init.</p><ul><li>Read values once in <code>init</code> and keep them in final fields.</li><li>Do not call <code>getInitParameter</code> on every request.</li></ul>`,
            r`private volatile int limit;

@Override public void init() {
    limit = Integer.parseInt(getInitParameter("limit"));   // read once
}

// OUTPUT:
// every request uses the cached value`],
        [`<p>Real world: a legacy admin servlet gets its upload folder from an init parameter. During migration the team replaces it with a property bound through <code>@Value</code>, so each environment can change it with an environment variable.</p>`,
            r`@Value("$" + "{upload.dir:/tmp/uploads}")
private String uploadDir;

# application.properties
upload.dir=/data/uploads

// OUTPUT:
// uploadDir = /data/uploads`]
    ),

    'mvc-filter-servlet': dv(
        [`<p>The container builds a <code>FilterChain</code> for each request from the matching filters, then the servlet is the last element.</p><ul><li>Each <code>doFilter</code> call moves to the next link, so code before it runs on the way in, and code after it on the way out.</li><li>Matching uses URL patterns and servlet names; dispatcher types (REQUEST, FORWARD, ERROR, ASYNC) decide when a filter applies.</li><li>Boot registers filter beans in order and Spring Security sits at order -100 by default.</li></ul>`,
            r`// Order demonstration, A before B
// A.in -> B.in -> servlet -> B.out -> A.out
public void doFilter(ServletRequest q, ServletResponse s, FilterChain c)
        throws IOException, ServletException {
    System.out.println("A.in");
    c.doFilter(q, s);
    System.out.println("A.out");
}

// OUTPUT:
// A.in
// B.in
// B.out
// A.out`],
        [`<p>Variants:</p><ul><li><b>Plain Filter</b> interface.</li><li><b>OncePerRequestFilter</b> with <code>shouldNotFilter</code>.</li><li><b>@WebFilter</b> with <code>@ServletComponentScan</code>.</li><li><b>FilterRegistrationBean</b> for patterns, order and dispatcher types.</li><li><b>GenericFilterBean</b> gives access to filter config as bean properties.</li><li><b>CorsFilter</b>, <code>ForwardedHeaderFilter</code> and <code>CharacterEncodingFilter</code> are ready-made.</li></ul>`,
            r`@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiKeyFilter extends OncePerRequestFilter {
    @Override protected boolean shouldNotFilter(HttpServletRequest req) {
        return !req.getRequestURI().startsWith("/api/");
    }
    @Override protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if (!"secret".equals(req.getHeader("X-Api-Key"))) {
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        chain.doFilter(req, res);
    }
}

// OUTPUT:
// GET /api/items (no key) -> 401
// GET /api/items (key)    -> 200`],
        [`<p>Mistakes:</p><ul><li><b>No <code>doFilter</code></b> call.</li><li><b>Wrong order</b>, for example logging before the encoding filter.</li><li><b>Filter as <code>@Component</code></b> also registered manually, so it runs twice.</li><li><b>Heavy work</b> in every request.</li><li><b>Exceptions</b> thrown in filters bypass <code>@ControllerAdvice</code>; handle them with a <code>HandlerExceptionResolver</code> or write the response.</li></ul>`,
            r`@Bean
FilterRegistrationBean<ApiKeyFilter> apiKey(ApiKeyFilter f) {
    var b = new FilterRegistrationBean<>(f);
    b.setEnabled(false);             // stop the automatic duplicate registration
    return b;
}

// OUTPUT:
// Filter runs once per request instead of twice`],
        [`<p>Tuning:</p><ul><li><b>Limit patterns</b> to the URLs that need the filter.</li><li><b>Keep it cheap:</b> avoid reading bodies and heavy lookups.</li><li><b>Cache</b> token or key checks.</li><li><b>Do not buffer</b> whole bodies for logging of large uploads.</li></ul>`,
            r`@Override protected boolean shouldNotFilter(HttpServletRequest req) {
    String p = req.getRequestURI();
    return p.startsWith("/static/") || p.equals("/actuator/health");
}

// OUTPUT:
// static files and health checks skip the filter`],
        [`<p>Real world: a gateway-style filter adds a correlation id to every request, copies it to the response header and to the log context, so one request can be traced across services.</p>`,
            r`@Override protected void doFilterInternal(HttpServletRequest req,
        HttpServletResponse res, FilterChain chain)
        throws ServletException, IOException {
    String id = Optional.ofNullable(req.getHeader("X-Correlation-Id"))
        .orElse(UUID.randomUUID().toString());
    res.setHeader("X-Correlation-Id", id);
    MDC.put("cid", id);
    try { chain.doFilter(req, res); } finally { MDC.remove("cid"); }
}

// OUTPUT: (varies)
// X-Correlation-Id: 9d1c...`]
    ),

    'mvc-listener': dv(
        [`<p>How listeners are called.</p><ul><li>The container finds listeners from annotations, web.xml or programmatic registration before the app starts.</li><li>Context listeners run in declaration order at startup and in reverse order at shutdown.</li><li>Session listeners are triggered by the session manager on create, expire or invalidate.</li><li>In Boot, <code>ServletContextInitializerBeans</code> collects listener beans and registers them on the ServletContext.</li></ul>`,
            r`// Spring ContextLoaderListener (classic) in essence
public class ContextLoaderListener extends ContextLoader
        implements ServletContextListener {
    public void contextInitialized(ServletContextEvent event) {
        initWebApplicationContext(event.getServletContext());   // root context
    }
    public void contextDestroyed(ServletContextEvent event) {
        closeWebApplicationContext(event.getServletContext());
    }
}

// OUTPUT:
// Root WebApplicationContext: initialization completed in 640 ms (varies)`],
        [`<p>Interfaces:</p><ul><li><code>ServletContextListener</code> and <code>ServletContextAttributeListener</code></li><li><code>HttpSessionListener</code>, <code>HttpSessionAttributeListener</code>, <code>HttpSessionIdListener</code></li><li><code>ServletRequestListener</code> and <code>ServletRequestAttributeListener</code></li><li>Spring equivalents: <code>@EventListener</code>, <code>ApplicationListener</code>, <code>SmartLifecycle</code>.</li></ul>`,
            r`@Component
class StartupLogger {
    @EventListener(ApplicationReadyEvent.class)
    void ready() { System.out.println("application ready"); }
}

@Bean
ServletListenerRegistrationBean<RequestLogListener> reqLog() {
    return new ServletListenerRegistrationBean<>(new RequestLogListener());
}

// OUTPUT:
// application ready`],
        [`<p>Mistakes:</p><ul><li><b>@WebListener ignored</b> without <code>@ServletComponentScan</code>.</li><li><b>Slow work</b> in <code>contextInitialized</code> delays startup.</li><li><b>Using Spring beans</b> in a listener created by the container (no injection); register it as a bean instead.</li><li><b>Unbalanced counters</b> when sessions expire.</li><li><b>Exceptions</b> in a startup listener fail the deployment.</li></ul>`,
            r`// WRONG: container-created listener, field not injected
@WebListener
class L implements ServletContextListener {
    @Autowired Service service;      // null
}
// RIGHT: make it a Spring bean (@Component); Boot registers it with injection

// OUTPUT:
// NullPointerException on service
// fixed: works`],
        [`<p>Tuning:</p><ul><li><b>Keep callbacks short;</b> session listeners run on request threads.</li><li><b>Use atomic counters</b>, not locks.</li><li><b>Do startup tasks</b> after readiness, with <code>ApplicationRunner</code>, when they are slow.</li></ul>`,
            r`@Component
class WarmUp implements ApplicationRunner {
    @Override public void run(ApplicationArguments args) {
        System.out.println("warming caches");
    }
}

// OUTPUT:
// warming caches`],
        [`<p>Real world: an operations dashboard shows the number of logged-in users. A session listener updates a Micrometer gauge, so the metric appears in Prometheus without extra queries.</p>`,
            r`@Component
class ActiveSessions implements HttpSessionListener {
    private final AtomicInteger active;
    ActiveSessions(MeterRegistry registry) {
        this.active = registry.gauge("sessions.active", new AtomicInteger());
    }
    @Override public void sessionCreated(HttpSessionEvent e) { active.incrementAndGet(); }
    @Override public void sessionDestroyed(HttpSessionEvent e) { active.decrementAndGet(); }
}

// OUTPUT:
// GET /actuator/metrics/sessions.active -> value 12.0 (varies)`]
    )
};
