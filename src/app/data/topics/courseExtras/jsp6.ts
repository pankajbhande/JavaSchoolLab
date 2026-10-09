// JSP-Servlet extras, part 6: annotations, filters and listeners (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jsp6Extras: Record<string, Extra> = {
    'annotations-webservlet': x(
        ['<b>@WebServlet</b> registers a servlet without <code>web.xml</code>: <code>@WebServlet("/hello")</code> on a class that extends <code>HttpServlet</code>.',
            '<b>URL patterns</b> can be exact (<code>/hello</code>), a path (<code>/api/*</code>) or an extension (<code>*.do</code>).',
            '<b>Packages</b>: Jakarta EE 9+ (Tomcat 10+) uses <code>jakarta.servlet.*</code>; Java EE and Tomcat 9 use <code>javax.servlet.*</code>.'],
        ['<b>Attributes</b>: <code>name</code>, <code>urlPatterns</code>, <code>initParams</code>, <code>loadOnStartup</code> and <code>asyncSupported</code> are the common ones.',
            '<b>Init parameters</b> go in <code>@WebInitParam(name, value)</code> and are read with <code>getInitParameter</code>.',
            '<b>Conflicts</b>: two servlets mapped to the same pattern make the application fail to start, so keep patterns unique.'],
        ['<b>Precedence</b>: a <code>web.xml</code> entry for the same servlet name overrides the annotation, which helps per-environment tuning.',
            '<b>metadata-complete</b>: <code>metadata-complete="true"</code> in <code>web.xml</code> turns annotation scanning off, and it also speeds up startup.',
            '<b>Startup cost</b>: the container scans classes for annotations, so keep jars out of <code>WEB-INF/lib</code> that you do not need, or use <code>web-fragment</code> excludes.'],
        [['F', 'What does @WebServlet do?', 'It tells the container to register the class as a servlet for the given URL pattern, so web.xml is not needed.'],
            ['F', 'Which class must the servlet extend?', 'Normally HttpServlet; it is also valid to implement the Servlet interface directly.'],
            ['M', 'How do you pass init parameters with annotations?', 'Use initParams = @WebInitParam(name = "k", value = "v") and read them with getServletConfig().getInitParameter("k").'],
            ['M', 'What does loadOnStartup do?', 'A value of 0 or more makes the container create and init the servlet at startup, in ascending order, instead of at the first request.'],
            ['S', 'Annotation versus web.xml: who wins?', 'web.xml wins for the same servlet name, so you can override annotated values without recompiling. Mapping the same URL to two servlets is an error.'],
            ['S', 'Why would you set metadata-complete to true?', 'It stops annotation scanning, which shortens startup of large applications and makes the deployment descriptor the single source of truth.']],
        [['A first annotated servlet.',
            r`import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet(name = "Hello", urlPatterns = {"/hello", "/hi"})
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setContentType("text/plain");
        resp.getWriter().println("Hello from " + req.getServletPath());
    }
}

// OUTPUT:
// GET /app/hello -> 200 "Hello from /hello"
// GET /app/hi    -> 200 "Hello from /hi"`],
            ['Init parameters and startup order.',
                r`@WebServlet(urlPatterns = "/report", loadOnStartup = 1,
    initParams = {@WebInitParam(name = "format", value = "pdf")})
public class ReportServlet extends HttpServlet {
    private String format;
    @Override public void init() {
        format = getInitParameter("format");
        log("ReportServlet ready, format=" + format);
    }
}

// OUTPUT: (varies)
// INFO [main] ReportServlet ready, format=pdf`]],
        [['Three pattern types.',
            r`@WebServlet("/orders")        // exact match
public class OrderServlet extends HttpServlet { }

@WebServlet("/api/*")          // path mapping, req.getPathInfo() holds the rest
public class ApiServlet extends HttpServlet { }

@WebServlet("*.do")            // extension mapping
public class LegacyServlet extends HttpServlet { }

// OUTPUT:
// /orders -> OrderServlet, /api/users/7 -> ApiServlet (pathInfo=/users/7)
// /save.do -> LegacyServlet`],
            ['Duplicate mapping failure.',
                r`@WebServlet("/dup") public class A extends HttpServlet { }
@WebServlet("/dup") public class B extends HttpServlet { }

// OUTPUT: (varies by container)
// SEVERE: Context [/app] startup failed: IllegalArgumentException:
//   The servlets named [A] and [B] are both mapped to the url-pattern [/dup]`]]
    ),

    'introduction-to-filters': x(
        ['<b>Filter</b> is a component that runs before and after a servlet, so it can inspect or change the request and the response.',
            '<b>Typical uses</b>: logging, authentication, compression, character encoding and CORS headers.',
            '<b>Declaration</b>: put <code>@WebFilter("/*")</code> on a class that implements <code>jakarta.servlet.Filter</code>.'],
        ['<b>doFilter</b> receives <code>request</code>, <code>response</code> and <code>FilterChain</code>; calling <code>chain.doFilter(req, resp)</code> passes control on.',
            '<b>Not calling the chain</b> blocks the request, which is how an authentication filter rejects a user.',
            '<b>Dispatchers</b>: by default filters run for <code>REQUEST</code> only; add <code>FORWARD</code>, <code>INCLUDE</code>, <code>ERROR</code> or <code>ASYNC</code> when needed.'],
        ['<b>Order</b>: with <code>web.xml</code> the order of <code>filter-mapping</code> elements decides; with annotations the order is not defined by the spec, so use web.xml when order matters.',
            '<b>Wrapping</b>: <code>HttpServletRequestWrapper</code> and <code>HttpServletResponseWrapper</code> let a filter change headers or buffer the body for later filters and the servlet.',
            '<b>Cross-cutting</b>: keep filters small and stateless, and put business rules in services, not in filters.'],
        [['F', 'What is a servlet filter?', 'A class that intercepts requests and responses before they reach a servlet and after the servlet answers.'],
            ['F', 'Which method do you implement?', 'doFilter(ServletRequest, ServletResponse, FilterChain).'],
            ['M', 'What happens if doFilter never calls chain.doFilter?', 'The request stops there and the servlet never runs; the filter must write the response itself.'],
            ['M', 'How do you map a filter to only some URLs?', 'Use @WebFilter(urlPatterns = ...) or servletNames, or the matching filter-mapping in web.xml.'],
            ['S', 'How is filter order decided?', 'In web.xml by the order of filter-mapping elements (URL mappings first, then servlet-name mappings). Annotations give no guaranteed order.'],
            ['S', 'Why wrap a response?', 'To capture or transform the output, for example compression or content rewriting, because the servlet writes into the wrapper instead of the real stream.']],
        [['A request timing filter.',
            r`@WebFilter("/*")
public class TimingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        long t = System.nanoTime();
        chain.doFilter(req, resp);                 // run the rest of the chain
        long ms = (System.nanoTime() - t) / 1_000_000;
        System.out.println(((HttpServletRequest) req).getRequestURI() + " took " + ms + " ms");
    }
}

// OUTPUT: (varies)
// /app/orders took 12 ms`],
            ['Setting character encoding.',
                r`@WebFilter("/*")
public class EncodingFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        req.setCharacterEncoding("UTF-8");         // must happen before reading params
        resp.setCharacterEncoding("UTF-8");
        chain.doFilter(req, resp);
    }
}

// OUTPUT:
// Content-Type: text/html;charset=UTF-8`]],
        [['Blocking with a filter.',
            r`@WebFilter("/admin/*")
public class AdminOnly implements Filter {
    public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain c)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) rq;
        if (req.getParameter("key") == null) {
            ((HttpServletResponse) rs).sendError(403, "Forbidden");
            return;                                // chain is NOT called
        }
        c.doFilter(rq, rs);
    }
}

// OUTPUT:
// GET /app/admin/users          -> 403 Forbidden
// GET /app/admin/users?key=abc  -> 200 OK`],
            ['Order in web.xml.',
                r`<filter-mapping><filter-name>Encoding</filter-name>
  <url-pattern>/*</url-pattern></filter-mapping>
<filter-mapping><filter-name>Auth</filter-name>
  <url-pattern>/*</url-pattern></filter-mapping>
<filter-mapping><filter-name>Timing</filter-name>
  <url-pattern>/*</url-pattern></filter-mapping>

// OUTPUT:
// request path : Encoding -> Auth -> Timing -> servlet
// response path: servlet -> Timing -> Auth -> Encoding`]]
    ),

    'filter-lifecycle': x(
        ['<b>init</b> runs once when the container creates the filter, before it handles any request.',
            '<b>doFilter</b> runs for every matching request, often by many threads at the same time.',
            '<b>destroy</b> runs once when the application stops, so close resources there.'],
        ['<b>One instance</b> of each filter exists per declaration, so instance fields are shared between all requests.',
            '<b>FilterConfig</b> given to <code>init</code> gives <code>getInitParameter</code> and <code>getServletContext</code>.',
            '<b>Default methods</b>: in Servlet 4.0+ <code>init</code> and <code>destroy</code> are default methods, so implement only what you need.'],
        ['<b>Thread safety</b>: keep per-request data in local variables or request attributes, never in filter fields without synchronization.',
            '<b>Fail fast</b>: throw <code>ServletException</code> from <code>init</code> if configuration is missing; the filter is then not put in service.',
            '<b>Stack order</b>: the code after <code>chain.doFilter</code> runs in reverse order of the filters before it.'],
        [['F', 'Name the three filter lifecycle methods.', 'init, doFilter and destroy.'],
            ['F', 'How many times is init called?', 'Once per filter instance, at application startup (or first use on some older containers).'],
            ['M', 'Is a filter thread-safe by default?', 'No. One instance serves many requests concurrently, so mutable fields need care.'],
            ['M', 'Where do you read init parameters?', 'In init(FilterConfig) with config.getInitParameter, then store them in final fields.'],
            ['S', 'What is the order of filters on the way back?', 'Reverse of the way in: the last filter to be called finishes first, like nested method calls.'],
            ['S', 'What if init throws an exception?', 'The container marks the filter unavailable and the application normally fails to start or the mapped requests get an error.']],
        [['A filter with all three methods.',
            r`@WebFilter(urlPatterns = "/*", initParams = @WebInitParam(name = "slow", value = "500"))
public class SlowLogFilter implements Filter {
    private long slowMs;
    @Override public void init(FilterConfig cfg) {
        slowMs = Long.parseLong(cfg.getInitParameter("slow"));
        System.out.println("init: threshold " + slowMs + " ms");
    }
    @Override public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain c)
            throws IOException, ServletException {
        long t = System.currentTimeMillis();
        c.doFilter(rq, rs);
        long d = System.currentTimeMillis() - t;
        if (d > slowMs) System.out.println("SLOW request: " + d + " ms");
    }
    @Override public void destroy() { System.out.println("destroy"); }
}

// OUTPUT: (varies)
// init: threshold 500 ms
// SLOW request: 730 ms
// destroy`],
            ['Observing the order.',
                r`// FilterA and FilterB print before and after chain.doFilter
// OUTPUT:
// A before
// B before
// servlet runs
// B after
// A after`]],
        [['Unsafe shared field.',
            r`public class BadCounter implements Filter {
    private int count;                      // shared by all threads!
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        count++;                            // lost updates under load
        c.doFilter(a, b);
    }
}

// OUTPUT: (varies)
// after 1000 parallel requests count may be less than 1000`],
            ['Safe version.',
                r`public class GoodCounter implements Filter {
    private final java.util.concurrent.atomic.AtomicLong count =
        new java.util.concurrent.atomic.AtomicLong();
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        count.incrementAndGet();
        c.doFilter(a, b);
    }
}

// OUTPUT:
// after 1000 parallel requests count is exactly 1000`]]
    ),

    'authentication-filter-example': x(
        ['<b>Idea</b>: a filter checks the session for a logged-in user and redirects to the login page when it is missing.',
            '<b>getSession(false)</b> returns <code>null</code> instead of creating a new session, which is what a check needs.',
            '<b>Redirect</b>: <code>resp.sendRedirect(req.getContextPath() + "/login")</code>.'],
        ['<b>Public URLs</b>: the login page, static files and the login POST must be excluded, or the user can never log in (redirect loop).',
            '<b>Authorization</b> is a second step: after "who are you", check "may you do this", for example a role in the session.',
            '<b>Session fixation</b>: after a successful login call <code>request.changeSessionId()</code> to issue a new session id.'],
        ['<b>API clients</b> do not follow login redirects; return <code>401</code> with <code>WWW-Authenticate</code> or a JSON error for <code>/api/*</code>.',
            '<b>Prefer the container</b>: for real security use container security or a framework (Spring Security) and treat a hand-made filter as a learning or small-app tool.',
            '<b>Cache</b>: add <code>Cache-Control: no-store</code> on protected pages so the browser back button does not show them after logout.'],
        [['F', 'How does an authentication filter know the user is logged in?', 'It looks for a user attribute in the HttpSession that the login servlet stored.'],
            ['F', 'Why use getSession(false)?', 'It does not create a session for anonymous visitors, so you can tell that nobody is logged in.'],
            ['M', 'What causes a redirect loop in such a filter?', 'Protecting the login page itself. Exclude the login URL and static resources.'],
            ['M', 'How do you do role checks?', 'Store the role at login and compare it in the filter or a second filter mapped to /admin/*.'],
            ['S', 'How do you prevent session fixation?', 'Call request.changeSessionId() right after authentication so an attacker-known id becomes useless.'],
            ['S', 'How should APIs differ from pages?', 'Return 401 or 403 with a JSON body instead of a 302 to an HTML login page, and use tokens or the Authorization header.']],
        [['Login check filter.',
            r`@WebFilter("/*")
public class AuthFilter implements Filter {
    private static final Set<String> PUBLIC = Set.of("/login", "/logout", "/css", "/js");
    public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) rq;
        HttpServletResponse resp = (HttpServletResponse) rs;
        String path = req.getRequestURI().substring(req.getContextPath().length());
        boolean open = PUBLIC.stream().anyMatch(path::startsWith);
        HttpSession s = req.getSession(false);
        boolean in = s != null && s.getAttribute("user") != null;
        if (open || in) chain.doFilter(rq, rs);
        else resp.sendRedirect(req.getContextPath() + "/login");
    }
}

// OUTPUT:
// GET /app/dashboard (no session) -> 302 Location: /app/login
// GET /app/login                  -> 200
// GET /app/dashboard (logged in)  -> 200`],
            ['Login servlet storing the user.',
                r`@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String u = req.getParameter("user");
        if (UserDao.check(u, req.getParameter("pass"))) {
            req.getSession(true);
            req.changeSessionId();                  // against fixation
            req.getSession().setAttribute("user", u);
            resp.sendRedirect(req.getContextPath() + "/dashboard");
        } else resp.sendRedirect(req.getContextPath() + "/login?error=1");
    }
}

// OUTPUT:
// POST /app/login ok  -> 302 /app/dashboard, Set-Cookie: JSESSIONID=... (varies)
// POST /app/login bad -> 302 /app/login?error=1`]],
        [['Role filter for admin pages.',
            r`@WebFilter("/admin/*")
public class AdminFilter implements Filter {
    public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain c)
            throws IOException, ServletException {
        HttpSession s = ((HttpServletRequest) rq).getSession(false);
        Object role = s == null ? null : s.getAttribute("role");
        if ("ADMIN".equals(role)) c.doFilter(rq, rs);
        else ((HttpServletResponse) rs).sendError(403);
    }
}

// OUTPUT:
// role USER  -> 403 Forbidden
// role ADMIN -> 200`],
            ['JSON 401 for APIs.',
                r`HttpServletResponse resp = (HttpServletResponse) rs;
resp.setStatus(401);
resp.setContentType("application/json");
resp.getWriter().write("{\"error\":\"unauthenticated\"}");

// OUTPUT:
// HTTP/1.1 401
// {"error":"unauthenticated"}`]]
    ),

    'servletcontextlistener': x(
        ['<b>ServletContextListener</b> gets <code>contextInitialized</code> at startup and <code>contextDestroyed</code> at shutdown of the web application.',
            '<b>Register</b> it with <code>@WebListener</code> on the class, or with a <code>listener</code> element in <code>web.xml</code>.',
            '<b>Typical jobs</b>: load configuration, create a connection pool, start a scheduler, and clean up at the end.'],
        ['<b>Share objects</b> by storing them in the context: <code>sce.getServletContext().setAttribute("ds", ds)</code>, and read them in servlets.',
            '<b>Runs first</b>: context listeners are initialized before filters and servlets, so resources are ready for them.',
            '<b>Shutdown order</b>: <code>contextDestroyed</code> is called in reverse order of registration.'],
        ['<b>Leaks on redeploy</b>: threads, JDBC drivers and executors that you start must be stopped in <code>contextDestroyed</code>, or the old class loader stays in memory.',
            '<b>Fail fast</b>: an exception in <code>contextInitialized</code> stops the application from starting, which is good for missing configuration.',
            '<b>Dependency injection</b>: in a CDI or Spring setup prefer managed beans, and use the listener only for bootstrap.'],
        [['F', 'When is contextInitialized called?', 'When the web application starts, before any request is served.'],
            ['F', 'How do you register a listener?', 'Annotate it with @WebListener or declare it in web.xml.'],
            ['M', 'How do servlets reach an object created in the listener?', 'Through ServletContext attributes, set in the listener and read with getServletContext().getAttribute.'],
            ['M', 'Why shut down an executor in contextDestroyed?', 'Otherwise its non-daemon threads keep running after undeploy and leak the class loader.'],
            ['S', 'What happens if contextInitialized throws?', 'The context fails to start and the application is not available, so use it to validate critical configuration.'],
            ['S', 'In which order do listeners run?', 'Initialization in declaration order (web.xml order), destruction in reverse. Annotation order is not specified.']],
        [['Startup and shutdown with a pool.',
            r`@WebListener
public class AppBootstrap implements ServletContextListener {
    @Override public void contextInitialized(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(ctx.getInitParameter("jdbcUrl"));
        ctx.setAttribute("ds", ds);
        ctx.log("DataSource created");
    }
    @Override public void contextDestroyed(ServletContextEvent sce) {
        Object ds = sce.getServletContext().getAttribute("ds");
        if (ds instanceof HikariDataSource h) h.close();
        sce.getServletContext().log("DataSource closed");
    }
}

// OUTPUT: (varies)
// INFO [main] DataSource created
// INFO [main] DataSource closed`],
            ['A scheduler stopped on shutdown.',
                r`@WebListener
public class JobListener implements ServletContextListener {
    private ScheduledExecutorService pool;
    public void contextInitialized(ServletContextEvent e) {
        pool = Executors.newSingleThreadScheduledExecutor();
        pool.scheduleAtFixedRate(() -> System.out.println("cleanup tick"),
            0, 60, TimeUnit.SECONDS);
    }
    public void contextDestroyed(ServletContextEvent e) { pool.shutdownNow(); }
}

// OUTPUT: (varies)
// cleanup tick
// cleanup tick`]],
        [['Read config in a servlet.',
            r`@WebServlet("/health")
public class HealthServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        DataSource ds = (DataSource) getServletContext().getAttribute("ds");
        resp.getWriter().println(ds != null ? "UP" : "DOWN");
    }
}

// OUTPUT:
// GET /app/health -> 200 UP`],
            ['web.xml registration.',
                r`<listener>
  <listener-class>com.example.AppBootstrap</listener-class>
</listener>
<context-param>
  <param-name>jdbcUrl</param-name>
  <param-value>jdbc:mysql://localhost/shop</param-value>
</context-param>

// OUTPUT:
// context-param is read with ctx.getInitParameter("jdbcUrl")`]]
    ),

    'httpsessionlistener': x(
        ['<b>HttpSessionListener</b> gets <code>sessionCreated</code> and <code>sessionDestroyed</code> when a session starts and ends.',
            '<b>Active users</b> are counted by adding one on create and subtracting one on destroy.',
            '<b>Register</b> with <code>@WebListener</code> or the <code>listener</code> element in <code>web.xml</code>.'],
        ['<b>Session ends</b> by <code>invalidate()</code> or by timeout, set with <code>session-timeout</code> in minutes in <code>web.xml</code> or <code>setMaxInactiveInterval</code> in seconds.',
            '<b>Thread safety</b>: use <code>AtomicInteger</code> for the counter, since many requests create sessions at once.',
            '<b>Related listeners</b>: <code>HttpSessionAttributeListener</code> sees attribute changes, and <code>HttpSessionBindingListener</code> is called on the attribute value itself.'],
        ['<b>Not exact</b>: a count of sessions is not a count of users; one user can have several, and an unseen timeout destroys a session later than the user left.',
            '<b>Clusters</b>: a local counter sees only one node, so use a shared store (Redis, database) for a global figure.',
            '<b>JSP sessions</b>: JSP pages create a session by default, so crawlers can inflate the count; set <code>session="false"</code> where a session is not needed.'],
        [['F', 'When is sessionCreated called?', 'When the container creates a new HttpSession, for example on the first getSession() call or a JSP page access.'],
            ['F', 'How do you count online users?', 'Increment an AtomicInteger in sessionCreated and decrement it in sessionDestroyed.'],
            ['M', 'When is sessionDestroyed called?', 'On session.invalidate() and when the session times out.'],
            ['M', 'Where do you publish the count?', 'In a ServletContext attribute, so every servlet and JSP can read it.'],
            ['S', 'Why is the session count not a reliable user count?', 'Bots, several browsers per user and delayed timeouts distort it; count authenticated users separately.'],
            ['S', 'How do you handle clustering?', 'Keep the count in a shared store or use session replication events; a per-JVM counter is only local.']],
        [['Online users counter.',
            r`@WebListener
public class SessionCounter implements HttpSessionListener {
    private static final AtomicInteger ACTIVE = new AtomicInteger();
    @Override public void sessionCreated(HttpSessionEvent se) {
        int n = ACTIVE.incrementAndGet();
        se.getSession().getServletContext().setAttribute("activeSessions", n);
        System.out.println("session created " + se.getSession().getId() + " active=" + n);
    }
    @Override public void sessionDestroyed(HttpSessionEvent se) {
        int n = ACTIVE.decrementAndGet();
        se.getSession().getServletContext().setAttribute("activeSessions", n);
        System.out.println("session destroyed active=" + n);
    }
}

// OUTPUT: (varies)
// session created 8F2A... active=1
// session created 3C9B... active=2
// session destroyed active=1`],
            ['Showing it in a JSP.',
                r`<p>Users online: $` + r`{applicationScope.activeSessions}</p>

// OUTPUT:
// Users online: 2`]],
        [['Setting the timeout.',
            r`<session-config>
  <session-timeout>15</session-timeout>   <!-- minutes -->
</session-config>

// OUTPUT:
// idle sessions are destroyed after 15 minutes and sessionDestroyed runs`],
            ['Logout invalidates.',
                r`@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        HttpSession s = req.getSession(false);
        if (s != null) s.invalidate();      // triggers sessionDestroyed
        resp.sendRedirect(req.getContextPath() + "/login");
    }
}

// OUTPUT:
// session destroyed active=0
// 302 Location: /app/login`]]
    )
};

export const jsp6Deep: Record<string, Deep> = {
    'annotations-webservlet': dv(
        [`<p>The container finds annotated classes at deployment time.</p><ul><li><b>Scanning:</b> Tomcat scans <code>WEB-INF/classes</code> and jars in <code>WEB-INF/lib</code> for <code>@WebServlet</code>, <code>@WebFilter</code> and <code>@WebListener</code>.</li><li><b>Merge:</b> annotation metadata is merged with <code>web.xml</code>; the descriptor wins on conflicts for the same name.</li><li><b>Mapping:</b> patterns go into a mapper: exact first, then longest path prefix, then extension, then the default servlet.</li><li><b>Lifecycle:</b> one instance per declaration, created lazily unless <code>loadOnStartup</code> is set.</li></ul>`,
            r`@WebServlet(urlPatterns = "/a/*", loadOnStartup = 2)
public class A extends HttpServlet {
    public void init() { log("A init"); }
}
@WebServlet(urlPatterns = "/b", loadOnStartup = 1)
public class B extends HttpServlet {
    public void init() { log("B init"); }
}

// OUTPUT: (varies)
// INFO B init      <- lower loadOnStartup value first
// INFO A init`],
        [`<p>Options of the annotation:</p><ul><li><b>value / urlPatterns:</b> alias of each other; use one only.</li><li><b>name:</b> servlet name used in logs and by <code>servletNames</code> filter mappings.</li><li><b>initParams:</b> array of <code>@WebInitParam</code>.</li><li><b>loadOnStartup:</b> negative means lazy.</li><li><b>asyncSupported:</b> required for <code>startAsync()</code>.</li><li><b>@MultipartConfig:</b> a separate annotation for file upload.</li></ul>`,
            r`@WebServlet(name = "Upload", urlPatterns = "/upload", asyncSupported = true)
@MultipartConfig(maxFileSize = 5 * 1024 * 1024)
public class UploadServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, ServletException {
        Part p = req.getPart("file");
        resp.getWriter().println(p.getSubmittedFileName() + " " + p.getSize());
    }
}

// OUTPUT: (varies)
// POST /app/upload (photo.png) -> 200 "photo.png 20480"`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong package:</b> <code>javax.servlet</code> annotations on Tomcat 10 are ignored; use <code>jakarta.servlet</code> there.</li><li><b>Missing leading slash:</b> <code>"hello"</code> is invalid and fails deployment.</li><li><b>Both value and urlPatterns:</b> not allowed.</li><li><b>Duplicate mappings</b> across classes or with web.xml.</li><li><b>metadata-complete=true</b> left in an old descriptor, so annotations silently do nothing.</li><li><b>Instance state:</b> servlet fields are shared by all threads.</li></ul>`,
            r`@WebServlet("hello")            // wrong: no leading slash
public class Bad extends HttpServlet { }
// fix: @WebServlet("/hello")

// OUTPUT: (varies)
// SEVERE: Invalid <url-pattern> [hello] in servlet mapping
// Fix: use "/hello"`],
        [`<p>Tuning startup and runtime:</p><ul><li><b>Scan less:</b> <code>metadata-complete</code> or Tomcat <code>jarsToSkip</code> shortens startup.</li><li><b>Warm up:</b> use <code>loadOnStartup</code> for servlets with costly init so the first user does not wait.</li><li><b>Stateless:</b> a stateless servlet scales well on the thread pool.</li><li><b>Async:</b> use <code>asyncSupported</code> for long-polling, not for short work.</li></ul>`,
            r`@WebServlet(urlPatterns = "/heavy", loadOnStartup = 1)
public class HeavyServlet extends HttpServlet {
    private volatile Map<String, String> cache;
    public void init() { cache = loadBigTable(); }   // paid once at startup
}

// OUTPUT: (varies)
// INFO HeavyServlet init took 850 ms during deployment, first request fast`],
        [`<p>Real-world layout of a small app: one servlet per feature area, a path mapping for an API, and web.xml only for environment settings.</p><ul><li><b>/api/*:</b> one front servlet, dispatches on <code>getPathInfo()</code>.</li><li><b>Pages:</b> exact mappings that forward to JSP under <code>WEB-INF</code>.</li><li><b>Config:</b> context-params and welcome files in web.xml.</li></ul>`,
            r`@WebServlet("/api/*")
public class ApiServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String path = req.getPathInfo() == null ? "/" : req.getPathInfo();
        resp.setContentType("application/json");
        switch (path) {
            case "/ping" -> resp.getWriter().write("{\"pong\":true}");
            default -> resp.sendError(404);
        }
    }
}

// OUTPUT:
// GET /app/api/ping -> 200 {"pong":true}
// GET /app/api/x    -> 404`]
    ),

    'introduction-to-filters': dv(
        [`<p>Filters are a chain of responsibility built by the container for each request.</p><ul><li><b>Matching:</b> the container picks filters whose URL or servlet mapping matches and whose dispatcher type fits.</li><li><b>Chain:</b> a <code>FilterChain</code> holds them in order; each <code>chain.doFilter</code> moves to the next, and the last one calls <code>servlet.service</code>.</li><li><b>Order:</b> web.xml URL mappings in declaration order, then servlet-name mappings. Annotation order is unspecified, often by class name.</li><li><b>Unwinding:</b> code after <code>chain.doFilter</code> runs in reverse.</li></ul>`,
            r`public class F1 implements Filter {
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        System.out.println("F1 in");
        c.doFilter(a, b);
        System.out.println("F1 out");
    }
}
// F2 is the same with "F2"

// OUTPUT:
// F1 in
// F2 in
// servlet
// F2 out
// F1 out`],
        [`<p>Variants of declaration:</p><ul><li><b>@WebFilter:</b> <code>urlPatterns</code>, <code>servletNames</code>, <code>dispatcherTypes</code>, <code>initParams</code>.</li><li><b>web.xml:</b> <code>filter</code> plus <code>filter-mapping</code> with <code>dispatcher</code> children.</li><li><b>Programmatic:</b> <code>ctx.addFilter</code> with <code>addMappingForUrlPatterns(types, isMatchAfter, patterns)</code> in a context listener.</li><li><b>Wrappers:</b> extend <code>HttpServletRequestWrapper</code> or <code>HttpServletResponseWrapper</code>.</li></ul>`,
            r`@WebListener
public class Registrar implements ServletContextListener {
    public void contextInitialized(ServletContextEvent e) {
        FilterRegistration.Dynamic fr =
            e.getServletContext().addFilter("cors", new CorsFilter());
        fr.addMappingForUrlPatterns(
            EnumSet.of(DispatcherType.REQUEST), true, "/api/*");
    }
}

// OUTPUT:
// filter "cors" is mapped to /api/* without web.xml or @WebFilter`],
        [`<p>Common mistakes:</p><ul><li><b>Forgetting chain.doFilter:</b> the page is blank or 200 with no body.</li><li><b>Reading the body twice:</b> the stream can be read once; wrap and cache it.</li><li><b>Writing after commit:</b> setting headers after the servlet wrote output has no effect.</li><li><b>Casting blindly</b> to <code>HttpServletRequest</code> for non-HTTP requests.</li><li><b>Assuming annotation order</b> for security filters.</li><li><b>Swallowing exceptions</b> and returning 200.</li></ul>`,
            r`// WRONG: header set after the response is committed is ignored
chain.doFilter(req, resp);
resp.setHeader("X-Late", "1");        // too late if the servlet flushed

// RIGHT: set headers before chain.doFilter
resp.setHeader("X-Early", "1");
chain.doFilter(req, resp);

// OUTPUT:
// X-Early: 1 appears; X-Late is missing when the response was committed`],
        [`<p>Performance advice:</p><ul><li><b>Narrow mappings:</b> do not map heavy filters to <code>/*</code> when static files do not need them.</li><li><b>No blocking calls</b> (remote auth) on each request without caching.</li><li><b>Buffering wrappers</b> cost memory; use them only for the URLs that need them.</li><li><b>Order cheap checks first:</b> reject early, before expensive filters.</li><li><b>Compression:</b> let the server or proxy gzip when it can.</li></ul>`,
            r`@WebFilter(urlPatterns = {"/api/*", "*.jsp"})   // not /* so images skip it
public class AuditFilter implements Filter {
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        c.doFilter(a, b);
    }
}

// OUTPUT:
// /app/img/logo.png does not pass through AuditFilter`],
        [`<p>A typical production filter stack, outermost first:</p><ul><li><b>Request id and logging</b> (puts an id in the log context).</li><li><b>CORS</b> (answers preflight early).</li><li><b>Encoding</b>.</li><li><b>Authentication</b>, then <b>authorization</b>.</li><li><b>Rate limit</b> or metrics.</li></ul>`,
            r`public class RequestIdFilter implements Filter {
    public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain c)
            throws IOException, ServletException {
        String id = java.util.UUID.randomUUID().toString().substring(0, 8);
        org.slf4j.MDC.put("rid", id);
        ((HttpServletResponse) rs).setHeader("X-Request-Id", id);
        try { c.doFilter(rq, rs); } finally { org.slf4j.MDC.remove("rid"); }
    }
}

// OUTPUT: (varies)
// 10:02:11 [rid=a1b2c3d4] GET /app/orders 200
// X-Request-Id: a1b2c3d4`]
    ),

    'filter-lifecycle': dv(
        [`<p>The container manages the filter instance.</p><ul><li><b>Create and init:</b> at deployment it calls the no-arg constructor, then <code>init(FilterConfig)</code> once.</li><li><b>Service:</b> one shared instance receives concurrent <code>doFilter</code> calls from the request thread pool.</li><li><b>Destroy:</b> on undeploy it waits for running calls to finish (or for a timeout), then calls <code>destroy</code> once.</li><li><b>Order of init:</b> follows declaration order; destroy follows the reverse.</li></ul>`,
            r`public class LifeFilter implements Filter {
    public void init(FilterConfig c) { System.out.println("init " + Thread.currentThread().getName()); }
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        System.out.println("do " + Thread.currentThread().getName());
        c.doFilter(a, b);
    }
    public void destroy() { System.out.println("destroy"); }
}

// OUTPUT: (varies)
// init main
// do http-nio-8080-exec-1
// do http-nio-8080-exec-2
// destroy`],
        [`<p>Lifecycle-related options:</p><ul><li><b>init-param:</b> per-filter settings from annotation or web.xml.</li><li><b>Context:</b> <code>config.getServletContext()</code> for shared objects.</li><li><b>Lazy init:</b> do heavy work in the first call guarded by a lock, only if startup time matters.</li><li><b>async-supported:</b> required if the chain uses async processing.</li></ul>`,
            r`public class ConfigFilter implements Filter {
    private Set<String> skip;
    public void init(FilterConfig cfg) throws ServletException {
        String raw = cfg.getInitParameter("skip");
        if (raw == null) throw new ServletException("skip init-param is required");
        skip = Set.of(raw.split(","));
    }
}

// OUTPUT:
// without the param: SEVERE: Filter [ConfigFilter] failed to init
// with skip=/css,/js: starts normally`],
        [`<p>Common mistakes:</p><ul><li><b>Per-request state in fields</b> causes data leaks between users.</li><li><b>Resources not closed</b> in <code>destroy</code>.</li><li><b>Heavy work in init</b> that blocks deployment on a slow remote service.</li><li><b>Assuming one init per request</b>.</li><li><b>Swallowing exceptions from init</b>, so the filter runs half configured.</li></ul>`,
            r`public class LeakyFilter implements Filter {
    private String currentUser;                       // WRONG: shared field
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        currentUser = ((HttpServletRequest) a).getRemoteUser();
        c.doFilter(a, b);
    }
}
// Fix: use a local variable or request.setAttribute("user", ...)

// OUTPUT: (varies)
// user A may see user B name under concurrent load`],
        [`<p>Lifecycle tuning:</p><ul><li><b>Build once:</b> compile regexes, parse config and create clients in <code>init</code>.</li><li><b>Immutable fields:</b> final fields need no locks.</li><li><b>Graceful stop:</b> flush buffers and close clients in <code>destroy</code>.</li></ul>`,
            r`public class PatternFilter implements Filter {
    private java.util.regex.Pattern bad;
    public void init(FilterConfig c) {
        bad = java.util.regex.Pattern.compile("(?i)<script");   // compiled once
    }
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        String q = ((HttpServletRequest) a).getQueryString();
        if (q != null && bad.matcher(q).find()) {
            ((HttpServletResponse) b).sendError(400);
            return;
        }
        c.doFilter(a, b);
    }
}

// OUTPUT:
// GET /app/s?q=<script>  -> 400
// GET /app/s?q=java      -> 200`],
        [`<p>Real case: an audit filter that opens a file or queue client at start and closes it at stop.</p><ul><li><b>init:</b> create the writer.</li><li><b>doFilter:</b> write one line after the chain, with status and duration.</li><li><b>destroy:</b> flush and close.</li></ul>`,
            r`public class AuditFilter implements Filter {
    private java.io.PrintWriter out;
    public void init(FilterConfig c) throws ServletException {
        try { out = new java.io.PrintWriter(new java.io.FileWriter("audit.log", true)); }
        catch (IOException e) { throw new ServletException(e); }
    }
    public void doFilter(ServletRequest a, ServletResponse b, FilterChain c)
            throws IOException, ServletException {
        c.doFilter(a, b);
        synchronized (this) {
            out.println(((HttpServletRequest) a).getRequestURI()
                + " " + ((HttpServletResponse) b).getStatus());
        }
    }
    public void destroy() { out.close(); }
}

// OUTPUT: (varies)
// audit.log: /app/orders 200
// audit.log: /app/missing 404`]
    ),

    'authentication-filter-example': dv(
        [`<p>Flow of an authentication filter:</p><ul><li><b>Request arrives</b> with a <code>JSESSIONID</code> cookie, or none.</li><li><b>Lookup:</b> <code>getSession(false)</code> finds the server-side session, if any.</li><li><b>Decision:</b> a user attribute means pass on through the chain; otherwise redirect or send 401.</li><li><b>Login:</b> the login servlet verifies the credentials and stores the user, which marks the session as authenticated.</li><li><b>Logout:</b> <code>invalidate()</code> removes the session, so the next request fails the check.</li></ul>`,
            r`// Browser                         Filter                      Servlet
// GET /dashboard (no cookie) ---> getSession(false)=null
//                              <--- 302 /login
// POST /login user,pass ---------------------------------> sets session attr
//                              <--- 302 /dashboard, Set-Cookie JSESSIONID
// GET /dashboard (cookie) ---> attr found -> chain ------> 200

// OUTPUT:
// the filter runs on every request, the login servlet only on /login`],
        [`<p>Variants:</p><ul><li><b>Session-based:</b> as above, the classic approach for server-rendered pages.</li><li><b>Token-based:</b> read <code>Authorization: Bearer ...</code> and validate a JWT or an opaque token.</li><li><b>Basic auth:</b> decode the <code>Authorization: Basic</code> header; only safe over HTTPS.</li><li><b>Remember-me:</b> a signed long-lived cookie that recreates the session.</li><li><b>Container security:</b> <code>security-constraint</code> and <code>login-config</code> in web.xml.</li></ul>`,
            r`String h = ((HttpServletRequest) rq).getHeader("Authorization");
if (h != null && h.startsWith("Bearer ")) {
    String token = h.substring(7);
    String user = TokenService.verify(token);         // null when invalid
    if (user != null) {
        rq.setAttribute("user", user);
        chain.doFilter(rq, rs);
        return;
    }
}
((HttpServletResponse) rs).sendError(401);

// OUTPUT:
// Authorization: Bearer valid -> 200
// no header or bad token       -> 401`],
        [`<p>Common mistakes:</p><ul><li><b>Redirect loop:</b> the login page is protected.</li><li><b>getSession() instead of getSession(false)</b> creates sessions for everyone.</li><li><b>Trusting a client flag</b> (a hidden field or cookie holding the role).</li><li><b>No HTTPS</b>, so the session cookie can be stolen; set <code>Secure</code> and <code>HttpOnly</code>.</li><li><b>Plain-text passwords</b>; store a salted hash such as bcrypt.</li><li><b>Session fixation</b> not handled.</li><li><b>Open redirect</b> from an unchecked <code>next</code> parameter.</li></ul>`,
            r`<session-config>
  <cookie-config>
    <http-only>true</http-only>
    <secure>true</secure>
  </cookie-config>
</session-config>

// OUTPUT:
// Set-Cookie: JSESSIONID=...; Path=/app; Secure; HttpOnly (id varies)`],
        [`<p>Performance and robustness:</p><ul><li><b>Cheap check first:</b> a session attribute lookup is fast; do not query the database on each request.</li><li><b>Cache tokens:</b> keep validated tokens in a small expiring cache.</li><li><b>Skip static files</b> with a narrow mapping.</li><li><b>No-store headers</b> on protected pages.</li><li><b>Timeouts:</b> a sensible <code>session-timeout</code> bounds memory.</li></ul>`,
            r`HttpServletResponse resp = (HttpServletResponse) rs;
resp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
resp.setHeader("Pragma", "no-cache");
resp.setDateHeader("Expires", 0);
chain.doFilter(rq, resp);

// OUTPUT:
// Cache-Control: no-store, no-cache, must-revalidate
// the back button after logout does not show the cached page`],
        [`<p>Scenario: an intranet app with user and admin areas.</p><ul><li><b>AuthFilter</b> on <code>/*</code> with a public list.</li><li><b>AdminFilter</b> on <code>/admin/*</code> checks the role.</li><li><b>Audit:</b> log denied attempts with user and path.</li><li><b>Migration:</b> move to a framework when requirements grow (SSO, MFA).</li></ul>`,
            r`String user = String.valueOf(session.getAttribute("user"));
if (!"ADMIN".equals(session.getAttribute("role"))) {
    req.getServletContext().log("DENIED " + user + " -> " + req.getRequestURI());
    resp.sendError(403);
    return;
}
chain.doFilter(req, resp);

// OUTPUT: (varies)
// INFO DENIED asha -> /app/admin/users
// 403 returned to the browser`]
    ),

    'servletcontextlistener': dv(
        [`<p>The container notifies listeners around the context lifecycle.</p><ul><li><b>Discovery:</b> from <code>@WebListener</code>, <code>web.xml</code> and fragments.</li><li><b>Startup:</b> <code>contextInitialized</code> runs before filters and <code>loadOnStartup</code> servlets are initialized.</li><li><b>Shutdown:</b> servlets and filters are destroyed first, then <code>contextDestroyed</code> in reverse listener order.</li><li><b>Event:</b> <code>ServletContextEvent.getServletContext()</code> gives the shared context.</li></ul>`,
            r`// Tomcat startup log (order, thread names vary)
// OUTPUT: (varies)
// INFO AppBootstrap.contextInitialized
// INFO TimingFilter init
// INFO ReportServlet init (loadOnStartup)
// ... serving ...
// INFO ReportServlet destroy
// INFO TimingFilter destroy
// INFO AppBootstrap.contextDestroyed`],
        [`<p>Related listener types:</p><ul><li><b>ServletContextAttributeListener:</b> attribute added, replaced, removed.</li><li><b>HttpSessionListener:</b> session created or destroyed.</li><li><b>ServletRequestListener:</b> every request starts and ends.</li><li><b>Programmatic API:</b> <code>ServletContainerInitializer</code> and <code>ctx.addServlet</code> for framework-style bootstrap.</li><li><b>Init params:</b> read <code>context-param</code> values with <code>getInitParameter</code>.</li></ul>`,
            r`@WebListener
public class CtxAttrLogger implements ServletContextAttributeListener {
    public void attributeAdded(ServletContextAttributeEvent e) {
        System.out.println("added " + e.getName());
    }
    public void attributeRemoved(ServletContextAttributeEvent e) {
        System.out.println("removed " + e.getName());
    }
}

// OUTPUT:
// added ds
// removed ds`],
        [`<p>Common mistakes:</p><ul><li><b>Not stopping threads</b> on destroy, which leaks the class loader on redeploy.</li><li><b>Catching and hiding startup errors</b>, so the app starts broken.</li><li><b>Slow startup work</b> that makes the deployment time out.</li><li><b>Static singletons</b> that survive a hot redeploy of the class loader.</li><li><b>Using the listener for request work.</b></li><li><b>Not deregistering JDBC drivers</b> in container-less pools.</li></ul>`,
            r`public void contextDestroyed(ServletContextEvent e) {
    pool.shutdown();
    try { if (!pool.awaitTermination(5, TimeUnit.SECONDS)) pool.shutdownNow(); }
    catch (InterruptedException ex) { pool.shutdownNow(); Thread.currentThread().interrupt(); }
}

// OUTPUT: (varies)
// WARN The web application [app] appears to have started a thread named [pool-1-thread-1]
//   but has failed to stop it (shown when the code above is missing)`],
        [`<p>Tuning:</p><ul><li><b>Fast startup:</b> start slow loads on a background thread and expose readiness through <code>/health</code>.</li><li><b>Pool sizes</b> from <code>context-param</code>, not constants.</li><li><b>Lazy singletons</b> for rarely used services.</li></ul>`,
            r`public void contextInitialized(ServletContextEvent e) {
    ServletContext ctx = e.getServletContext();
    ctx.setAttribute("ready", Boolean.FALSE);
    new Thread(() -> {
        ctx.setAttribute("cache", loadCatalog());     // slow
        ctx.setAttribute("ready", Boolean.TRUE);
    }, "warmup").start();
}

// OUTPUT: (varies)
// deployment finishes quickly; /health says WARMING until the cache loads`],
        [`<p>Scenario: an app that needs a pool, a scheduler and a feature flags map.</p><ul><li><b>Start:</b> create the pool, run migrations, schedule jobs.</li><li><b>Share:</b> keep services in the context.</li><li><b>Stop:</b> stop jobs, then close the pool.</li></ul>`,
            r`public void contextInitialized(ServletContextEvent e) {
    ServletContext ctx = e.getServletContext();
    DataSource ds = Pools.create(ctx.getInitParameter("jdbcUrl"));
    ctx.setAttribute("ds", ds);
    jobs = Executors.newScheduledThreadPool(1);
    jobs.scheduleWithFixedDelay(() -> Purge.run(ds), 1, 60, TimeUnit.MINUTES);
    ctx.log("bootstrap done");
}

// OUTPUT: (varies)
// INFO bootstrap done`]
    ),

    'httpsessionlistener': dv(
        [`<p>Session events come from the session manager.</p><ul><li><b>Create:</b> <code>getSession(true)</code>, or a JSP page with sessions enabled, builds a session and fires <code>sessionCreated</code>.</li><li><b>Destroy:</b> <code>invalidate()</code> or a background expiry thread fires <code>sessionDestroyed</code>.</li><li><b>Expiry check</b> in Tomcat runs about once a minute, so timeouts are not instantaneous.</li><li><b>Event:</b> <code>HttpSessionEvent.getSession()</code> gives the session; in destroy its attributes are still readable.</li></ul>`,
            r`public void sessionDestroyed(HttpSessionEvent se) {
    Object user = se.getSession().getAttribute("user");   // still available here
    System.out.println("bye " + user);
}

// OUTPUT: (varies)
// bye asha     (printed when the idle timeout is detected, not exactly at expiry)`],
        [`<p>Options and related APIs:</p><ul><li><b>sessionIdChanged:</b> from <code>HttpSessionIdListener</code>, fires after <code>changeSessionId</code>.</li><li><b>HttpSessionAttributeListener:</b> add, replace, remove events.</li><li><b>HttpSessionBindingListener:</b> <code>valueBound</code> and <code>valueUnbound</code> on the value object.</li><li><b>Timeout:</b> <code>setMaxInactiveInterval(seconds)</code>; a negative value means never.</li><li><b>HttpSessionActivationListener:</b> for sessions that are passivated or moved between nodes.</li></ul>`,
            r`public class UserHolder implements HttpSessionBindingListener {
    private final String name;
    public UserHolder(String n) { name = n; }
    public void valueBound(HttpSessionBindingEvent e) {
        System.out.println(name + " logged in");
    }
    public void valueUnbound(HttpSessionBindingEvent e) {
        System.out.println(name + " logged out");
    }
}
// session.setAttribute("holder", new UserHolder("asha"));

// OUTPUT:
// asha logged in
// asha logged out   (on removeAttribute, invalidate or timeout)`],
        [`<p>Common mistakes:</p><ul><li><b>Plain int counter:</b> races lose updates; use <code>AtomicInteger</code>.</li><li><b>Counting sessions as users.</b></li><li><b>Sessions created by bots</b> or by JSP pages that do not need them.</li><li><b>Forgetting the decrement</b> on destroy after a restart (sessions are persisted but the counter is not).</li><li><b>Heavy work in the callback</b> blocks the request or the expiry thread.</li></ul>`,
            r`<%@ page session="false" %>
<%-- public marketing page: no session, no sessionCreated event --%>

// OUTPUT:
// visiting this page no longer increases the active session count`],
        [`<p>Tuning:</p><ul><li><b>Short timeouts</b> for anonymous traffic keep memory low.</li><li><b>Small session data:</b> store ids, not big objects.</li><li><b>Hand over heavy work</b> to an executor.</li><li><b>Shared counters</b> in Redis for clusters.</li></ul>`,
            r`public void sessionCreated(HttpSessionEvent se) {
    se.getSession().setMaxInactiveInterval(10 * 60);     // 10 minutes (seconds)
    metrics.counter("sessions.created").increment();     // cheap, no I/O
}

// OUTPUT: (varies)
// sessions.created = 1432 at the time of reading`],
        [`<p>Scenario: a dashboard that shows users online, and a cleanup of per-session temp files.</p><ul><li><b>Created:</b> increment and publish.</li><li><b>Destroyed:</b> delete the temp upload folder of that session.</li><li><b>Admin page:</b> read <code>applicationScope.activeSessions</code>.</li></ul>`,
            r`public void sessionDestroyed(HttpSessionEvent se) {
    HttpSession s = se.getSession();
    java.nio.file.Path tmp = java.nio.file.Path.of("uploads", s.getId());
    try (var files = java.nio.file.Files.walk(tmp)) {
        files.sorted(java.util.Comparator.reverseOrder())
             .forEach(p -> p.toFile().delete());
    } catch (IOException ignored) { }
    s.getServletContext().setAttribute("activeSessions", ACTIVE.decrementAndGet());
}

// OUTPUT: (varies)
// uploads/8F2A... removed, activeSessions=3`]
    )
};
