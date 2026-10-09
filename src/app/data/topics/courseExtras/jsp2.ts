// JSP-Servlet extras, part 2: servlet lifecycle and request/response methods (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jsp2Extras: Record<string, Extra> = {
    'servlet-loading-instantiation': x(
        ['<b>Loading</b>: the container finds the class from <code>web.xml</code> or <code>@WebServlet</code>, loads it and creates <b>one</b> instance with the no-argument constructor.',
            '<b>Lazy by default</b>: without <code>load-on-startup</code> the servlet is created on the first request that maps to it.',
            '<b>Eager loading</b>: <code>&lt;load-on-startup&gt;1&lt;/load-on-startup&gt;</code> or <code>@WebServlet(loadOnStartup = 1)</code> creates it when the application starts.'],
        ['<b>Order</b>: a lower load-on-startup number loads first; a negative or missing value means lazy loading.',
            '<b>Constructor</b>: keep it empty, because the <code>ServletConfig</code> and <code>ServletContext</code> are not available until <code>init()</code>.',
            '<b>Packages</b>: Tomcat 9 and older use <code>javax.servlet.*</code>; Tomcat 10+ and Jakarta EE 9+ use <code>jakarta.servlet.*</code>.'],
        ['<b>Single instance</b>: the container does not create one servlet per request or per user, so instance fields are shared by all threads.',
            '<b>Fail fast</b>: load-on-startup makes configuration errors appear at deployment instead of at the first user request.',
            '<b>Several mappings</b>: one servlet class declared twice in <code>web.xml</code> with different names gives two separate instances.'],
        [['F', 'When is a servlet instantiated?', 'On the first request by default, or at application start if load-on-startup is set.'],
            ['F', 'How many instances of a servlet exist?', 'Normally one per servlet declaration; the container reuses it for every request.'],
            ['M', 'What does a load-on-startup value of 1 mean?', 'The servlet is created when the web app starts; lower numbers are loaded before higher ones.'],
            ['M', 'Why avoid work in the servlet constructor?', 'The config and context are not set yet, so initialization belongs in init().'],
            ['S', 'Why can lazy loading hurt production?', 'The first user pays the startup cost and any init failure shows up as a runtime error instead of a failed deployment.'],
            ['S', 'Can the container create more than one instance of the same servlet class?', 'Yes, once per declaration with a different name in web.xml; the old SingleThreadModel pool was removed in Servlet 6.']],
        [['Eager loading with an annotation.',
            r`@WebServlet(urlPatterns = "/report", loadOnStartup = 1)
public class ReportServlet extends HttpServlet {
    public ReportServlet() {
        System.out.println("constructor called");
    }
    @Override
    public void init() {
        System.out.println("init called");
    }
}

// OUTPUT: (container log at deployment, varies)
// constructor called
// init called`],
            ['Equivalent web.xml.',
                r`<servlet>
    <servlet-name>report</servlet-name>
    <servlet-class>com.shop.ReportServlet</servlet-class>
    <load-on-startup>2</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>report</servlet-name>
    <url-pattern>/report</url-pattern>
</servlet-mapping>

// OUTPUT:
// Servlet report is loaded after servlets with load-on-startup 0 or 1`]],
        [['Showing that there is one instance.',
            r`@WebServlet("/who")
public class WhoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.getWriter().println(System.identityHashCode(this)
            + " thread=" + Thread.currentThread().getName());
    }
}

// OUTPUT: (varies)
// 1893245 thread=http-nio-8080-exec-3
// 1893245 thread=http-nio-8080-exec-7`],
            ['Lazy versus eager order.',
                r`@WebServlet(urlPatterns = "/a", loadOnStartup = 2)
public class A extends HttpServlet { }
@WebServlet(urlPatterns = "/b", loadOnStartup = 1)
public class B extends HttpServlet { }
@WebServlet("/c")                        // lazy: created on first request
public class C extends HttpServlet { }

// OUTPUT: (startup order)
// B initialized
// A initialized
// (C is created at the first GET /c)`]]
    ),
    'servlet-init-method': x(
        ['<b>init()</b> runs <b>once</b> after the instance is created and before any request is served.',
            '<b>Use it for</b> one-time setup: read init parameters, open a data source lookup, load a properties file, warm a cache.',
            '<b>Two forms</b>: <code>init(ServletConfig config)</code> and the no-argument <code>init()</code>; prefer the no-argument one in <code>HttpServlet</code> subclasses.'],
        ['<b>super.init(config)</b>: if you override the one-argument form you must call it, or <code>getServletConfig()</code> returns null.',
            '<b>Init parameters</b>: read them with <code>getInitParameter("name")</code>; they come from <code>@WebInitParam</code> or <code>&lt;init-param&gt;</code>.',
            '<b>Exceptions</b>: throw <code>ServletException</code> (or <code>UnavailableException</code>) when setup fails; the servlet is then not put into service.'],
        ['<b>Failed init</b>: the container may retry on the next request for a normal exception, so make init idempotent and clean up partial work.',
            '<b>Shared resources</b>: build thread-safe objects here (a <code>DataSource</code>, an immutable config) and only read them in <code>service()</code>.',
            '<b>Slow init</b>: combine it with load-on-startup so the delay happens at deployment, not on a user request.'],
        [['F', 'How many times is init() called?', 'Once in the life of a servlet instance.'],
            ['F', 'What is init() used for?', 'One-time initialization such as reading config and creating shared resources.'],
            ['M', 'Which init() should you override?', 'The no-argument init(); it avoids forgetting super.init(config).'],
            ['M', 'How do you read an init parameter?', 'Call getInitParameter(name) on the servlet or on its ServletConfig.'],
            ['S', 'What happens if init() throws an exception?', 'The servlet is not placed in service and the request gets an error; UnavailableException can mark it temporarily or permanently unavailable.'],
            ['S', 'Is it safe to store request data in a field set in init()?', 'Only data that never changes after init; anything mutable needs thread-safe handling.']],
        [['Reading init parameters.',
            r`@WebServlet(urlPatterns = "/mail", initParams = {
    @WebInitParam(name = "host", value = "smtp.example.com"),
    @WebInitParam(name = "port", value = "587")})
public class MailServlet extends HttpServlet {
    private String host;
    private int port;
    @Override
    public void init() throws ServletException {
        host = getInitParameter("host");
        port = Integer.parseInt(getInitParameter("port"));
        log("MailServlet ready for " + host + ":" + port);
    }
}

// OUTPUT: (servlet log)
// MailServlet ready for smtp.example.com:587`],
            ['Failing fast.',
                r`@Override
public void init() throws ServletException {
    String url = getServletContext().getInitParameter("db.url");
    if (url == null) {
        throw new UnavailableException("db.url is missing");
    }
}

// OUTPUT: (container log)
// SEVERE: Servlet [DbServlet] init failed: db.url is missing
// HTTP Status 503 - Service Unavailable on the first request`]],
        [['Looking up a DataSource once.',
            r`private DataSource ds;
@Override
public void init() throws ServletException {
    try {
        Context ctx = new InitialContext();
        ds = (DataSource) ctx.lookup("java:comp/env/jdbc/shopDB");
    } catch (NamingException e) {
        throw new ServletException("Cannot find DataSource", e);
    }
}

// OUTPUT:
// DataSource is found once; every request reuses the field ds`],
            ['The config-based form.',
                r`@Override
public void init(ServletConfig config) throws ServletException {
    super.init(config);                      // required in this form
    log("name=" + config.getServletName());
}

// OUTPUT: (servlet log)
// name=ReportServlet`]]
    ),
    'servlet-service-method': x(
        ['<b>service()</b> is called by the container for <b>every request</b>, on a thread taken from the container pool.',
            '<b>HttpServlet.service()</b> reads the HTTP method and calls <code>doGet()</code>, <code>doPost()</code>, <code>doPut()</code>, <code>doDelete()</code> and so on.',
            '<b>Normally</b> you override <code>doGet</code> and <code>doPost</code>, not <code>service()</code> itself.'],
        ['<b>Concurrency</b>: many threads run <code>service()</code> on the <b>same</b> servlet object at the same time.',
            '<b>Safe data</b>: local variables, request and response objects are per request; instance fields are shared.',
            '<b>Unsupported method</b>: the default <code>doGet()</code> returns 405 or 400, so override only the methods you support.'],
        ['<b>Thread safety</b>: avoid mutable fields, or guard them with <code>synchronized</code>, atomics or concurrent collections.',
            '<b>Pool size</b>: the container thread pool (for example <code>maxThreads</code> in Tomcat) limits how many requests run at once.',
            '<b>Overriding service()</b>: do it only for cross-cutting needs and call <code>super.service()</code>; filters are usually a better place.'],
        [['F', 'When is service() called?', 'For each client request that maps to the servlet.'],
            ['F', 'Which methods does service() dispatch to?', 'doGet, doPost, doPut, doDelete, doHead, doOptions and doTrace depending on the HTTP method.'],
            ['M', 'Do you usually override service() in an HttpServlet?', 'No, you override doGet or doPost; service() already dispatches.'],
            ['M', 'Is a local variable in doGet thread safe?', 'Yes, each thread has its own stack, so locals are private to the request.'],
            ['S', 'Why is an instance counter field in a servlet a bug?', 'Concurrent threads race on it (lost updates); use AtomicInteger or avoid shared state.'],
            ['S', 'Where should cross-cutting logic such as logging or auth go instead of service()?', 'In a Filter, which wraps all servlets and keeps servlets focused.']],
        [['A shared field race.',
            r`@WebServlet("/count")
public class CountServlet extends HttpServlet {
    private int hits = 0;                       // BUG: shared, not thread safe
    private final AtomicInteger safe = new AtomicInteger();
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        hits++;                                 // can lose updates
        resp.getWriter().println("safe=" + safe.incrementAndGet());
    }
}

// OUTPUT: (after 3 requests)
// safe=1
// safe=2
// safe=3`],
            ['Overriding service() carefully.',
                r`@Override
protected void service(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    long t = System.nanoTime();
    super.service(req, resp);                  // dispatches to doGet or doPost
    log(req.getMethod() + " " + req.getRequestURI() + " took "
        + (System.nanoTime() - t) / 1_000_000 + " ms");
}

// OUTPUT: (servlet log, varies)
// GET /count took 2 ms`]],
        [['What dispatch looks like.',
            r`// Simplified idea of HttpServlet.service(req, resp)
String m = req.getMethod();
switch (m) {
    case "GET"    -> doGet(req, resp);
    case "POST"   -> doPost(req, resp);
    case "DELETE" -> doDelete(req, resp);
    default       -> resp.sendError(501, "Method not implemented");
}

// OUTPUT:
// PATCH /count -> HTTP 501 (when the container does not handle PATCH)`],
            ['Thread name per request.',
                r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setContentType("text/plain");
    resp.getWriter().println(Thread.currentThread().getName());
}

// OUTPUT: (two quick requests, varies)
// http-nio-8080-exec-1
// http-nio-8080-exec-2`]]
    ),
    'servlet-destroy-method': x(
        ['<b>destroy()</b> is called <b>once</b> when the container removes the servlet, for example at undeploy, reload or server shutdown.',
            '<b>Use it for</b> cleanup: close connection pools, stop background threads, flush caches and release files.',
            '<b>After destroy()</b> the instance is not used again and becomes eligible for garbage collection.'],
        ['<b>Waiting</b>: the container tries to let running <code>service()</code> calls finish (or time out) before it calls <code>destroy()</code>.',
            '<b>Not guaranteed</b>: if the JVM is killed (<code>kill -9</code>, crash, power loss) <code>destroy()</code> never runs.',
            '<b>Symmetry</b>: whatever <code>init()</code> opens, <code>destroy()</code> should close.'],
        ['<b>Leaks</b>: a thread started in <code>init()</code> and never stopped is the classic cause of redeploy memory leaks (ClassLoader leaks).',
            '<b>Robust cleanup</b>: wrap each close in its own try-catch so one failure does not skip the rest.',
            '<b>Alternative</b>: use <code>ServletContextListener.contextDestroyed()</code> for application-wide resources shared by many servlets.'],
        [['F', 'When does destroy() run?', 'Once, just before the container takes the servlet out of service.'],
            ['F', 'What goes in destroy()?', 'Cleanup code such as closing resources and stopping threads.'],
            ['M', 'Is destroy() guaranteed to run?', 'No; a forced kill or crash skips it, so do not keep critical state only in memory.'],
            ['M', 'Can a servlet serve requests after destroy()?', 'No, the container will not send more requests to that instance.'],
            ['S', 'How does a forgotten thread cause a leak on redeploy?', 'The thread keeps a reference to the old classloader and its classes, so the old app version cannot be collected.'],
            ['S', 'When prefer ServletContextListener over destroy()?', 'For resources shared by the whole application, so cleanup happens once instead of per servlet.']],
        [['Stopping a background task.',
            r`private ScheduledExecutorService pool;
@Override
public void init() {
    pool = Executors.newSingleThreadScheduledExecutor();
    pool.scheduleAtFixedRate(() -> log("tick"), 1, 1, TimeUnit.MINUTES);
}
@Override
public void destroy() {
    pool.shutdown();
    log("scheduler stopped");
}

// OUTPUT: (servlet log at undeploy)
// scheduler stopped`],
            ['Independent closes.',
                r`@Override
public void destroy() {
    try { cache.flush(); } catch (Exception e) { log("flush failed", e); }
    try { client.close(); } catch (Exception e) { log("close failed", e); }
}

// OUTPUT: (if flush fails)
// flush failed
// (client.close() still runs)`]],
        [['Lifecycle log of all three methods.',
            r`public class LifeServlet extends HttpServlet {
    public void init()    { log("init"); }
    protected void doGet(HttpServletRequest q, HttpServletResponse p)
            throws IOException { log("service"); p.getWriter().print("ok"); }
    public void destroy() { log("destroy"); }
}

// OUTPUT: (Tomcat log: start, one request, stop)
// init
// service
// destroy`],
            ['Shutdown wait.',
                r`@Override
public void destroy() {
    pool.shutdown();
    try {
        if (!pool.awaitTermination(10, TimeUnit.SECONDS)) pool.shutdownNow();
    } catch (InterruptedException e) {
        pool.shutdownNow();
        Thread.currentThread().interrupt();
    }
}

// OUTPUT:
// the pool drains its tasks, or is forced to stop after 10 seconds`]]
    ),
    'servlet-doget-dopost': x(
        ['<b>doGet()</b> handles HTTP GET: reading data, with parameters in the URL query string.',
            '<b>doPost()</b> handles HTTP POST: submitting data, with parameters in the request body.',
            '<b>Signature</b>: <code>protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException</code>.'],
        ['<b>Idempotent</b>: GET must not change server state, because browsers, caches and crawlers may repeat it; use POST for changes.',
            '<b>Visibility</b>: GET data appears in the URL, history and logs, so never send passwords with GET.',
            '<b>Sharing logic</b>: when both methods do the same job, let <code>doPost</code> call <code>doGet</code> (or a private method).'],
        ['<b>Encoding</b>: call <code>req.setCharacterEncoding("UTF-8")</code> before reading POST parameters, or non-ASCII text is garbled.',
            '<b>Post-Redirect-Get</b>: after a successful POST send a redirect so a browser refresh does not submit the form twice.',
            '<b>Status codes</b>: return 405 for unsupported methods, 400 for bad input and 201 for created resources instead of always 200.'],
        [['F', 'Difference between GET and POST?', 'GET sends data in the URL and is for reading; POST sends it in the body and is for changes.'],
            ['F', 'Which method handles a form with method="post"?', 'doPost().'],
            ['M', 'Why not use GET for a login form?', 'The password would appear in the URL, browser history and server logs.'],
            ['M', 'What if only doGet is overridden and a POST arrives?', 'The default doPost responds with an HTTP 405 (or 400 in old containers) error.'],
            ['S', 'What is the Post-Redirect-Get pattern?', 'Redirect to a GET page after processing a POST so refresh or back does not resubmit the data.'],
            ['S', 'Why must GET be safe and idempotent?', 'Because proxies, prefetchers and retries may call it many times; side effects would repeat.']],
        [['Reading both kinds of parameters.',
            r`@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.getRequestDispatcher("/login.jsp").forward(req, resp);
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        req.setCharacterEncoding("UTF-8");
        String user = req.getParameter("user");
        resp.sendRedirect(req.getContextPath() + "/home?u=" + user);
    }
}

// OUTPUT:
// GET  /login          -> 200, shows the form
// POST /login (user=ravi) -> 302 Location: /app/home?u=ravi`],
            ['Sharing one code path.',
                r`@Override
protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    doGet(req, resp);                     // same handling for both
}

// OUTPUT:
// GET /search?q=java and POST /search (q=java) give the same result`]],
        [['Rejecting a missing parameter.',
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    String id = req.getParameter("id");
    if (id == null || id.isBlank()) {
        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "id is required");
        return;
    }
    resp.getWriter().println("order " + id);
}

// OUTPUT:
// GET /order?id=42 -> 200 order 42
// GET /order       -> 400 id is required`],
            ['Unsupported method.',
                r`@WebServlet("/report")
public class ReportServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException { resp.getWriter().print("report"); }
}

// OUTPUT:
// POST /report -> HTTP 405 Method Not Allowed (default doPost)`]]
    ),
    'http-servlet-response': x(
        ['<b>HttpServletResponse</b> is the object you fill to send the reply: status line, headers and body.',
            '<b>Body</b>: <code>getWriter()</code> for text, <code>getOutputStream()</code> for binary data; use only one of them per response.',
            '<b>Key calls</b>: <code>setContentType</code>, <code>setStatus</code>, <code>setHeader</code>, <code>sendRedirect</code> and <code>sendError</code>.'],
        ['<b>Order matters</b>: set status, headers and content type <b>before</b> writing the body, because after the response is committed they are ignored.',
            '<b>Committed</b>: the response is committed once the buffer is flushed; <code>isCommitted()</code> tells you, and a later <code>sendRedirect</code> throws <code>IllegalStateException</code>.',
            '<b>Redirect</b>: <code>sendRedirect</code> sends a 302 and the browser makes a new request; a <code>forward</code> stays inside the server.'],
        ['<b>Character set</b>: <code>resp.setContentType("text/html;charset=UTF-8")</code> must be set before <code>getWriter()</code>.',
            '<b>Buffering</b>: tune <code>setBufferSize</code>, and call <code>flushBuffer()</code> for streaming such as large downloads.',
            '<b>Security headers</b>: add <code>X-Content-Type-Options</code>, cache control and cookie flags (<code>HttpOnly</code>, <code>Secure</code>) centrally in a filter.'],
        [['F', 'What does HttpServletResponse do?', 'It lets the servlet send the status, headers and body back to the client.'],
            ['F', 'How do you send HTML text?', 'Set the content type to text/html and write with response.getWriter().'],
            ['M', 'Difference between sendRedirect and forward?', 'sendRedirect tells the browser to make a new request (URL changes); forward is server-side and keeps the same request.'],
            ['M', 'Why set the content type before getWriter()?', 'The writer picks its character encoding when it is created, so a later charset is ignored.'],
            ['S', 'What is a committed response?', 'Headers and status are already sent; you can no longer change them or redirect, and doing so throws IllegalStateException.'],
            ['S', 'How do you stream a large file without loading it all in memory?', 'Set headers, then copy from an InputStream to getOutputStream() in chunks and flush.']],
        [['Plain text, status and headers.',
            r`@WebServlet("/ping")
public class PingServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setContentType("text/plain;charset=UTF-8");
        resp.setHeader("Cache-Control", "no-store");
        resp.getWriter().println("pong");
    }
}

// OUTPUT:
// HTTP/1.1 200
// Content-Type: text/plain;charset=UTF-8
// Cache-Control: no-store
//
// pong`],
            ['Redirect and error.',
                r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    if (req.getParameter("old") != null) {
        resp.sendRedirect(req.getContextPath() + "/new");
        return;
    }
    resp.sendError(HttpServletResponse.SC_NOT_FOUND, "No such page");
}

// OUTPUT:
// GET /app/page?old=1 -> 302 Location: /app/new
// GET /app/page       -> 404 No such page`]],
        [['JSON response.',
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setContentType("application/json;charset=UTF-8");
    resp.getWriter().write("{\"id\":7,\"name\":\"Asha\"}");
}

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json;charset=UTF-8
//
// {"id":7,"name":"Asha"}`],
            ['File download.',
                r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setContentType("application/pdf");
    resp.setHeader("Content-Disposition", "attachment; filename=\"bill.pdf\"");
    try (InputStream in = getServletContext().getResourceAsStream("/bill.pdf");
         OutputStream out = resp.getOutputStream()) {
        in.transferTo(out);
    }
}

// OUTPUT:
// Content-Disposition: attachment; filename="bill.pdf"
// the browser saves bill.pdf`]]
    )
};

export const jsp2Deep: Record<string, Deep> = {
    'servlet-loading-instantiation': dv(
        [`<p>The container (Catalina in Tomcat) turns a declaration into a ready servlet in a few steps.</p><ul><li><b>Scan:</b> at deployment it reads <code>web.xml</code> and scans classes for <code>@WebServlet</code>.</li><li><b>Wrapper:</b> each declaration gets a wrapper object that holds the config, the mappings and the instance.</li><li><b>Load:</b> the class is loaded by the web application classloader and created through reflection with the no-argument constructor.</li><li><b>Init:</b> the container then calls <code>init(ServletConfig)</code> exactly once, and only after it succeeds can <code>service()</code> run.</li><li><b>Lazy path:</b> without load-on-startup, the first request makes the wrapper allocate the servlet while later requests wait for that to finish.</li></ul>`,
            r`@WebServlet(urlPatterns = "/lazy")
public class LazyServlet extends HttpServlet {
    static { System.out.println("class loaded"); }
    public LazyServlet() { System.out.println("constructor"); }
    @Override public void init() { System.out.println("init"); }
    @Override
    protected void doGet(HttpServletRequest q, HttpServletResponse p)
            throws IOException { p.getWriter().print("hi"); }
}

// OUTPUT: (nothing at startup; at the first GET /lazy, varies)
// class loaded
// constructor
// init`],
        [`<p>Ways to control loading:</p><ul><li><b>Annotation:</b> <code>@WebServlet(loadOnStartup = n)</code>.</li><li><b>web.xml:</b> <code>&lt;load-on-startup&gt;n&lt;/load-on-startup&gt;</code>, and an empty element means any order.</li><li><b>Programmatic:</b> <code>ServletContext.addServlet()</code> inside a <code>ServletContainerInitializer</code> or listener, then <code>setLoadOnStartup()</code>.</li><li><b>Annotation or web.xml:</b> web.xml settings override annotations for the same servlet name.</li><li><b>Metadata-complete:</b> <code>metadata-complete="true"</code> turns annotation scanning off, which speeds startup.</li></ul>`,
            r`@WebListener
public class Boot implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent e) {
        ServletContext ctx = e.getServletContext();
        ServletRegistration.Dynamic reg =
            ctx.addServlet("healthServlet", new HealthServlet());
        reg.addMapping("/health");
        reg.setLoadOnStartup(1);
    }
}

// OUTPUT: (container log, varies)
// INFO: Deploying web application [shop]
// INFO: healthServlet initialized`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Missing public no-argument constructor:</b> a constructor that needs arguments makes loading fail with <code>InstantiationException</code>; keep the default constructor.</li><li><b>Using getServletContext() in the constructor:</b> it returns null or throws; move the code to <code>init()</code>.</li><li><b>Assuming one instance per user:</b> state is shared; keep user data in the session or request.</li><li><b>Wrong package for the container:</b> <code>javax.servlet</code> classes on Tomcat 10+ are ignored or fail with <code>ClassNotFoundException</code>; switch to <code>jakarta.servlet</code>.</li><li><b>Duplicate mappings:</b> two servlets with the same URL pattern fail deployment.</li></ul>`,
            r`public class BadServlet extends HttpServlet {
    private final ServletContext ctx = getServletContext();   // BUG: too early
    public BadServlet(String name) { }                        // BUG: no default
}

public class GoodServlet extends HttpServlet {
    private ServletContext ctx;
    @Override public void init() { ctx = getServletContext(); }
}

// OUTPUT: (container log for BadServlet)
// SEVERE: Allocate exception for servlet [BadServlet]
// java.lang.InstantiationException: BadServlet`],
        [`<p>Load time can matter when the app has many servlets or heavy startup work.</p><ul><li><b>Eager critical servlets:</b> give load-on-startup to those that connect to databases or caches, so health checks see real readiness.</li><li><b>Lazy rare servlets:</b> leave admin or report servlets lazy so startup stays short.</li><li><b>Scanning cost:</b> exclude unused jars from annotation scanning (Tomcat <code>jarsToSkip</code>) and use <code>metadata-complete</code> for big apps.</li><li><b>Warm up:</b> a load-on-startup servlet can also call its own heavy code paths once so the JIT is warm for the first user.</li><li><b>Measure:</b> the container log timestamps show deploy time per app (varies).</li></ul>`,
            r`@WebServlet(urlPatterns = "/warm", loadOnStartup = 1)
public class WarmServlet extends HttpServlet {
    @Override
    public void init() {
        long t = System.nanoTime();
        PriceCalculator.precompute();                 // heavy, once
        log("warm-up took " + (System.nanoTime() - t) / 1_000_000 + " ms");
    }
}

// OUTPUT: (varies)
// WarmServlet: warm-up took 180 ms
// Deployment of web application [shop] has finished in [2,430] ms`],
        [`<p>An online shop has a price-cache servlet that loads 50,000 products from the database. As a lazy servlet, the first customer after each deployment waited about 8 seconds (an example figure). The team set <code>loadOnStartup = 1</code>, so the load happens during deployment, and added a health check that waits for the cache. The load balancer now sends traffic only after the app is ready, and a database failure fails the deployment instead of hurting a customer.</p>`,
            r`@WebServlet(urlPatterns = "/prices", loadOnStartup = 1)
public class PriceServlet extends HttpServlet {
    private volatile Map<Integer, BigDecimal> prices = Map.of();
    @Override
    public void init() throws ServletException {
        try { prices = ProductDao.loadAllPrices(); }
        catch (SQLException e) { throw new ServletException("price load failed", e); }
    }
    @Override
    protected void doGet(HttpServletRequest q, HttpServletResponse p)
            throws IOException {
        p.getWriter().println(prices.get(Integer.parseInt(q.getParameter("id"))));
    }
}

// OUTPUT: (varies)
// INFO: PriceServlet loaded 50000 prices
// GET /prices?id=7 -> 499.00`]
    ),
    'servlet-init-method': dv(
        [`<p>The container calls <code>init(ServletConfig)</code> right after construction.</p><ul><li><b>GenericServlet:</b> stores the config in a field, then calls the no-argument <code>init()</code> hook, which is why overriding <code>init()</code> is easy and safe.</li><li><b>Visibility:</b> the container publishes the initialized servlet safely, so fields set in <code>init()</code> are visible to request threads without extra locks.</li><li><b>Failure:</b> a <code>ServletException</code> or <code>RuntimeException</code> makes the wrapper throw away the instance; <code>UnavailableException</code> adds a retry time (temporary) or none (permanent).</li><li><b>Requests meanwhile:</b> a request for a servlet that is still initializing waits, or gets 503 if init failed.</li></ul>`,
            r`// Simplified GenericServlet
public void init(ServletConfig config) throws ServletException {
    this.config = config;
    this.init();                          // calls your no-argument override
}
public void init() throws ServletException { }

// OUTPUT:
// Overriding init() keeps getServletConfig() working because the
// one-argument form already stored the config.`],
        [`<p>Where init data can come from:</p><ul><li><b>Servlet init params:</b> <code>@WebInitParam</code> or <code>&lt;init-param&gt;</code>, visible only to that servlet.</li><li><b>Context params:</b> <code>&lt;context-param&gt;</code>, read with <code>getServletContext().getInitParameter()</code> by the whole app.</li><li><b>JNDI:</b> data sources and environment entries.</li><li><b>Files:</b> <code>getServletContext().getResourceAsStream("/WEB-INF/app.properties")</code>.</li><li><b>System properties and env vars:</b> for secrets and per-environment values.</li></ul>`,
            r`private final Properties props = new Properties();
@Override
public void init() throws ServletException {
    try (InputStream in =
            getServletContext().getResourceAsStream("/WEB-INF/app.properties")) {
        if (in == null) throw new ServletException("app.properties missing");
        props.load(in);
    } catch (IOException e) {
        throw new ServletException(e);
    }
    String env = System.getenv().getOrDefault("APP_ENV", "dev");
    log("loaded " + props.size() + " properties, env=" + env);
}

// OUTPUT: (servlet log, varies)
// loaded 4 properties, env=dev`],
        [`<p>Common init mistakes and fixes:</p><ul><li><b>Forgot super.init(config):</b> <code>getServletConfig()</code> and <code>getInitParameter()</code> then throw <code>NullPointerException</code>; override the no-argument <code>init()</code>.</li><li><b>Swallowed exception:</b> catching and only printing the error leaves a half-working servlet; rethrow as <code>ServletException</code>.</li><li><b>Parsing without a check:</b> <code>Integer.parseInt(null)</code> fails with a poor message; validate and give a clear one.</li><li><b>Leaked resources on failure:</b> if init opens a pool then fails, close it before throwing.</li><li><b>Mutable shared fields:</b> filled in init but changed later by requests.</li></ul>`,
            r`@Override
public void init(ServletConfig config) throws ServletException {
    // BUG: super.init(config) is missing
    String size = getInitParameter("poolSize");         // NullPointerException
}

@Override
public void init() throws ServletException {
    String size = getInitParameter("poolSize");
    if (size == null) throw new ServletException("init param poolSize is required");
    pool = new ConnPool(Integer.parseInt(size));
}

// OUTPUT: (container log for the buggy version)
// SEVERE: Servlet.init() for servlet [Pool] threw exception
// java.lang.NullPointerException`],
        [`<p>Init is the right place for expensive one-time work, but it should stay predictable.</p><ul><li><b>Cache once:</b> parse config, compile regular expressions and build immutable lookup maps here instead of per request.</li><li><b>Avoid long blocking:</b> a slow remote call in init delays deployment; set timeouts.</li><li><b>Pool sizing:</b> create the connection pool or thread pool here, sized from init params (varies by hardware).</li><li><b>Immutability:</b> build immutable objects so request threads need no locks.</li><li><b>Lazy parts:</b> use holder or lazy init for rarely used expensive objects.</li></ul>`,
            r`private Pattern emailPattern;
private Map<String, String> countries;
@Override
public void init() {
    emailPattern = Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[\\w.]+$");   // once
    countries = Map.copyOf(loadCountries());                           // immutable
}
protected void doPost(HttpServletRequest q, HttpServletResponse p)
        throws IOException {
    boolean ok = emailPattern.matcher(q.getParameter("email")).matches();
    p.getWriter().print(ok);
}

// OUTPUT: (POST email=a@b.com)
// true`],
        [`<p>A reporting servlet needs an API key, a template folder and a connection to a report database. In <code>init()</code> it reads the key from an environment variable, checks that the folder exists and tests the connection once. If anything is wrong it throws <code>UnavailableException</code> with a clear message, so the problem appears in the deployment log and monitoring marks the node unhealthy before users arrive.</p>`,
            r`@WebServlet(urlPatterns = "/reports", loadOnStartup = 1)
public class ReportServlet extends HttpServlet {
    private String apiKey;
    private Path templates;
    @Override
    public void init() throws ServletException {
        apiKey = System.getenv("REPORT_API_KEY");
        if (apiKey == null) throw new UnavailableException("REPORT_API_KEY not set");
        templates = Path.of(getInitParameter("templates"));
        if (!Files.isDirectory(templates)) {
            throw new UnavailableException("no template folder: " + templates);
        }
        log("ReportServlet ready");
    }
}

// OUTPUT: (varies)
// SEVERE: Servlet [ReportServlet] unavailable: REPORT_API_KEY not set
// GET /reports -> 503 Service Unavailable`]
    ),
    'servlet-service-method': dv(
        [`<p>For each request the container connector hands the work to a pool thread.</p><ul><li><b>Request flow:</b> connector parses the HTTP request, builds the request and response objects, runs the filter chain and finally calls <code>servlet.service()</code>.</li><li><b>HttpServlet.service(ServletRequest, ServletResponse):</b> casts to HTTP types and calls the protected <code>service(HttpServletRequest, HttpServletResponse)</code>.</li><li><b>Dispatch:</b> that method switches on the HTTP method name; for GET it also checks <code>getLastModified()</code> to support conditional GET (304).</li><li><b>Same instance:</b> the same servlet object is used by all threads; only the request and response objects are new per request.</li><li><b>Recycling:</b> request and response objects can be recycled, so never keep a reference after the method returns.</li></ul>`,
            r`// Simplified view of HttpServlet.service
protected void service(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    String method = req.getMethod();
    if (method.equals("GET")) {
        long lm = getLastModified(req);
        if (lm == -1) { doGet(req, resp); return; }
        // otherwise compare If-Modified-Since and maybe send 304
    } else if (method.equals("POST")) {
        doPost(req, resp);
    } else {
        resp.sendError(501, "Method not implemented");
    }
}

// OUTPUT:
// GET with unchanged getLastModified -> 304 Not Modified (no body)`],
        [`<p>Variants and related ideas:</p><ul><li><b>Generic servlet:</b> extend <code>GenericServlet</code> and implement <code>service(ServletRequest, ServletResponse)</code> for a non-HTTP protocol.</li><li><b>HEAD and OPTIONS:</b> <code>doHead</code> reuses <code>doGet</code> without the body; <code>doOptions</code> lists the allowed methods.</li><li><b>Async:</b> <code>req.startAsync()</code> frees the container thread while work continues elsewhere.</li><li><b>Multipart:</b> <code>@MultipartConfig</code> enables <code>getPart()</code> for file upload.</li><li><b>Virtual threads:</b> some containers can run each request on a virtual thread (Java 21+), but the shared-state rules stay the same.</li></ul>`,
            r`@WebServlet(urlPatterns = "/slow", asyncSupported = true)
public class SlowServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        AsyncContext ac = req.startAsync();
        ac.start(() -> {
            try {
                Thread.sleep(200);                       // pretend remote call
                ac.getResponse().getWriter().print("done");
            } catch (Exception e) { /* log */ }
            finally { ac.complete(); }
        });
    }
}

// OUTPUT:
// GET /slow -> 200 done (the container thread was free during the wait)`],
        [`<p>Common service-time mistakes and fixes:</p><ul><li><b>Mutable instance fields:</b> for example a <code>SimpleDateFormat</code> or <code>StringBuilder</code> field; make it a local variable or use <code>DateTimeFormatter</code>.</li><li><b>Over-synchronizing:</b> <code>synchronized</code> on the whole <code>doGet</code> turns the app into a single-user app; lock only small critical parts.</li><li><b>Keeping request or response in a field:</b> later requests overwrite them.</li><li><b>Swallowing exceptions:</b> the user gets an empty 200; let them propagate or send an error.</li><li><b>Writing the body twice:</b> calling both <code>getWriter()</code> and <code>getOutputStream()</code> throws <code>IllegalStateException</code>.</li></ul>`,
            r`private final SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd");  // BUG
private static final DateTimeFormatter OK =
    DateTimeFormatter.ofPattern("yyyy-MM-dd");                               // FIX

protected void doGet(HttpServletRequest q, HttpServletResponse p)
        throws IOException {
    p.getWriter().println(LocalDate.now().format(OK));
}

// OUTPUT: (varies)
// 2026-10-07
// (the SimpleDateFormat field can print corrupted dates under load)`],
        [`<p>Performance of <code>service()</code> is mostly about concurrency and what the thread does.</p><ul><li><b>Do not block the pool:</b> slow database or remote calls hold a thread; use timeouts, async or virtual threads.</li><li><b>Pool size:</b> Tomcat <code>maxThreads</code> defaults to 200, and raising it without capacity only moves the queue.</li><li><b>Keep servlets thin:</b> push business code into services that are easy to test and cache.</li><li><b>Avoid shared locks:</b> prefer <code>LongAdder</code> or <code>ConcurrentHashMap</code> over <code>synchronized</code> counters.</li><li><b>Measure:</b> use an access log valve or a metrics filter to track request time and thread use.</li></ul>`,
            r`private final LongAdder requests = new LongAdder();
private final ConcurrentHashMap<String, LongAdder> perPath = new ConcurrentHashMap<>();

@Override
protected void service(HttpServletRequest q, HttpServletResponse p)
        throws ServletException, IOException {
    requests.increment();
    perPath.computeIfAbsent(q.getRequestURI(), k -> new LongAdder()).increment();
    super.service(q, p);
}

// OUTPUT: (metrics after load, varies)
// requests=15234 /orders=9800 /health=5434`],
        [`<p>A checkout servlet had a field <code>Order current</code> that was set in <code>doPost</code>. In testing it worked, but under real traffic two customers sometimes saw each other's order summary. The fix was to make <code>Order</code> a local variable inside <code>doPost</code> and put the order id in the session. Load tests with many threads were added so the same race would be caught early.</p>`,
            r`// BEFORE (bug): private Order current;   shared by all threads
protected void doPost(HttpServletRequest q, HttpServletResponse p)
        throws IOException {
    Order order = orderService.create(q.getParameter("cart"));   // local = safe
    q.getSession().setAttribute("orderId", order.id());
    p.sendRedirect(q.getContextPath() + "/summary");
}

// OUTPUT: (two concurrent customers, varies)
// customer A -> /summary shows order 1001
// customer B -> /summary shows order 1002`]
    ),
    'servlet-destroy-method': dv(
        [`<p>The container ends a servlet in a controlled order.</p><ul><li><b>Trigger:</b> undeploy, redeploy, context reload, or an orderly server stop (Tomcat shutdown script).</li><li><b>Quiesce:</b> the container stops sending new requests to the servlet, and waits for running <code>service()</code> calls to end (the wait is limited).</li><li><b>Call:</b> it then calls <code>destroy()</code> once and drops its reference, so the instance can be collected when nothing else points to it.</li><li><b>Order:</b> servlets are destroyed in the reverse of loading order, and then context listeners get <code>contextDestroyed</code> (filters are destroyed before servlets in typical containers).</li><li><b>Exceptions:</b> an exception thrown from <code>destroy()</code> is only logged; shutdown continues.</li></ul>`,
            r`@Override
public void destroy() {
    log("destroy start, active=" + active.get());
    // cleanup here
    log("destroy end");
}

// OUTPUT: (Tomcat log at stop, varies)
// INFO: Stopping service [Catalina]
// DestroyServlet: destroy start, active=0
// DestroyServlet: destroy end`],
        [`<p>Cleanup choices:</p><ul><li><b>destroy():</b> for resources owned by that servlet.</li><li><b>ServletContextListener:</b> for app-wide resources such as a shared pool.</li><li><b>JVM shutdown hook:</b> <code>Runtime.addShutdownHook</code> is risky in a container because it can leak the classloader.</li><li><b>AutoCloseable fields:</b> keep them in a list and close in reverse order.</li><li><b>Graceful drain:</b> stop accepting new work, finish running work, then close.</li></ul>`,
            r`private final Deque<AutoCloseable> resources = new ArrayDeque<>();

@Override
public void init() {
    var pool = new ConnPool();
    resources.push(pool);                       // closed last
    var audit = new AuditWriter(pool);
    resources.push(audit);                      // closed first
}

@Override
public void destroy() {
    while (!resources.isEmpty()) {
        try { resources.pop().close(); }
        catch (Exception e) { log("close failed", e); }
    }
}

// OUTPUT: (servlet log)
// AuditWriter closed
// ConnPool closed`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Orphan threads:</b> a non-daemon thread keeps running after undeploy; stop it in <code>destroy()</code> and give threads names for diagnosis.</li><li><b>JDBC driver leak:</b> deregister drivers loaded by the app, or the old classloader stays in memory.</li><li><b>ThreadLocal values:</b> clear them with <code>remove()</code>, or pooled container threads keep old objects.</li><li><b>Long destroy:</b> a blocking wait with no timeout delays shutdown; use <code>awaitTermination</code> with a limit.</li><li><b>Relying on destroy for data safety:</b> persist important data as you go.</li></ul>`,
            r`@Override
public void destroy() {
    scheduler.shutdownNow();
    Enumeration<Driver> drivers = DriverManager.getDrivers();
    while (drivers.hasMoreElements()) {
        Driver d = drivers.nextElement();
        if (d.getClass().getClassLoader() == getClass().getClassLoader()) {
            try { DriverManager.deregisterDriver(d); } catch (SQLException ignore) { }
        }
    }
    CURRENT_USER.remove();                      // ThreadLocal cleanup
}

// OUTPUT: (Tomcat log, if cleanup were missing)
// WARNING: The web application [shop] registered the JDBC driver [...] but failed
// to unregister it when the web application was stopped.`],
        [`<p>Cleanup speed affects redeploys and rolling restarts.</p><ul><li><b>Bounded waits:</b> use timeouts (for example 10 to 30 seconds, tune per app) so one stuck task does not block the node.</li><li><b>Fast flush:</b> batch writes should flush quickly on shutdown.</li><li><b>Memory leaks:</b> repeated redeploys in dev are a good test; watch heap and class counts with a profiler.</li><li><b>Container settings:</b> Tomcat <code>unloadDelay</code> and <code>stopTimeout</code> control how long it waits.</li><li><b>Rolling restart:</b> health endpoints should report "draining" so the load balancer stops traffic first.</li></ul>`,
            r`private volatile boolean draining;
@Override
public void destroy() {
    draining = true;
    executor.shutdown();
    try {
        if (!executor.awaitTermination(15, TimeUnit.SECONDS)) {
            int dropped = executor.shutdownNow().size();
            log("forced stop, dropped " + dropped + " tasks");
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}

// OUTPUT: (varies)
// forced stop, dropped 3 tasks`],
        [`<p>An email servlet queues messages in memory and sends them from a background worker. After a redeploy, queued mails were lost and the old worker thread kept running, so memory grew. The fix: <code>destroy()</code> stops accepting new mails, drains the queue to the database within a time limit, then stops the worker. The next instance reads pending mails at <code>init()</code>.</p>`,
            r`@Override
public void destroy() {
    accepting = false;
    worker.shutdown();
    try {
        if (!worker.awaitTermination(20, TimeUnit.SECONDS)) {
            List<Runnable> left = worker.shutdownNow();
            outboxDao.saveAll(left);                // persist for the next start
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
    log("mail worker stopped");
}

// OUTPUT: (varies)
// mail worker stopped
// next startup: MailServlet re-queued 3 pending mails`]
    ),
    'servlet-doget-dopost': dv(
        [`<p>How a request reaches <code>doGet</code> or <code>doPost</code>:</p><ul><li><b>Browser:</b> a link, address bar or <code>method="get"</code> form sends GET; a form with <code>method="post"</code> sends POST.</li><li><b>Parsing:</b> the container parses the query string for GET; for POST with <code>application/x-www-form-urlencoded</code> it parses the body on the first <code>getParameter()</code> call.</li><li><b>Dispatch:</b> <code>HttpServlet.service()</code> picks the method by name; HEAD calls <code>doGet</code> and drops the body.</li><li><b>Body streams:</b> if you read <code>getInputStream()</code> or <code>getReader()</code> first, parameters from the body are not parsed.</li><li><b>Limits:</b> servers limit the URL length and POST size (Tomcat <code>maxPostSize</code>, default 2 MB for form data).</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    req.setCharacterEncoding("UTF-8");              // before any getParameter
    String name = req.getParameter("name");
    String json = new String(req.getInputStream().readAllBytes(), UTF_8);
    // for urlencoded POST the stream is already consumed by getParameter
    resp.getWriter().println("name=" + name);
}

// OUTPUT: (POST name=Asha, content-type form-urlencoded)
// name=Asha`],
        [`<p>Variants of request handling:</p><ul><li><b>Other verbs:</b> <code>doPut</code>, <code>doDelete</code>, <code>doHead</code>, <code>doOptions</code> for REST style APIs.</li><li><b>Forms:</b> HTML forms only send GET and POST, so PUT and DELETE come from JavaScript.</li><li><b>JSON bodies:</b> read the body with <code>req.getReader()</code> and parse it with a JSON library.</li><li><b>Multipart:</b> add <code>@MultipartConfig</code> and use <code>req.getPart("file")</code>.</li><li><b>Multi-value:</b> <code>getParameterValues()</code> for checkboxes and <code>getParameterMap()</code> for all.</li></ul>`,
            r`@WebServlet("/api/items")
@MultipartConfig(maxFileSize = 2_000_000)
public class ItemServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, ServletException {
        String[] tags = req.getParameterValues("tag");
        Part file = req.getPart("photo");
        resp.setStatus(HttpServletResponse.SC_CREATED);
        resp.getWriter().println(tags.length + " tags, " + file.getSize() + " bytes");
    }
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) {
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }
}

// OUTPUT: (varies)
// POST /api/items -> 201 2 tags, 10432 bytes
// DELETE /api/items -> 204`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Changing data in doGet:</b> a crawler or prefetch can delete or create records; use POST.</li><li><b>Double submit:</b> user presses refresh after POST; use Post-Redirect-Get and a token.</li><li><b>No encoding:</b> garbled text from POST; call <code>setCharacterEncoding</code> first (or configure a filter).</li><li><b>Null parameters:</b> <code>getParameter</code> returns null when missing, so check before use.</li><li><b>SQL built from parameters:</b> use <code>PreparedStatement</code> to avoid SQL injection.</li><li><b>Output injection:</b> escape user text before writing it in HTML to avoid XSS.</li></ul>`,
            r`String id = req.getParameter("id");
// BUG: "SELECT * FROM users WHERE id=" + id   (SQL injection)
try (PreparedStatement ps = con.prepareStatement(
        "SELECT name FROM users WHERE id = ?")) {
    ps.setInt(1, Integer.parseInt(id));         // NumberFormatException -> 400
    // ...
}
resp.setContentType("text/html;charset=UTF-8");
resp.getWriter().println("Hello " + escapeHtml(name));    // avoid XSS

// OUTPUT: (GET /user?id=1 OR 1=1)
// HTTP 400 Bad Request (not a number, so no injection)`],
        [`<p>Tuning request handling:</p><ul><li><b>GET and caching:</b> GET responses can be cached; set <code>Cache-Control</code> and <code>ETag</code> or override <code>getLastModified</code>.</li><li><b>Small handlers:</b> parse, validate, call a service and write the result.</li><li><b>Stream big bodies:</b> do not read huge uploads fully into memory.</li><li><b>Connection reuse:</b> keep-alive is on by default; avoid blocking inside the handler.</li><li><b>Limit input:</b> set maximum sizes and parameter counts (Tomcat <code>maxParameterCount</code>) against abuse.</li></ul>`,
            r`@Override
protected long getLastModified(HttpServletRequest req) {
    return catalog.lastUpdated().toEpochMilli() / 1000 * 1000;
}
@Override
protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setHeader("Cache-Control", "public, max-age=60");
    resp.getWriter().println(catalog.toJson());
}

// OUTPUT: (second request with If-Modified-Since)
// HTTP/1.1 304 (no body, saves bandwidth)`],
        [`<p>A registration page uses <code>doGet</code> to show the empty form and <code>doPost</code> to process it. On success it saves the user and redirects to a welcome page (Post-Redirect-Get). On errors it forwards back to the form with messages in request attributes, so the visitor does not lose typed values.</p>`,
            r`@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    protected void doGet(HttpServletRequest q, HttpServletResponse p)
            throws ServletException, IOException {
        q.getRequestDispatcher("/WEB-INF/register.jsp").forward(q, p);
    }
    protected void doPost(HttpServletRequest q, HttpServletResponse p)
            throws ServletException, IOException {
        q.setCharacterEncoding("UTF-8");
        String email = q.getParameter("email");
        if (email == null || !email.contains("@")) {
            q.setAttribute("error", "Enter a valid email");
            p.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            q.getRequestDispatcher("/WEB-INF/register.jsp").forward(q, p);
            return;
        }
        userService.register(email);
        p.sendRedirect(q.getContextPath() + "/welcome");
    }
}

// OUTPUT:
// POST email=bad     -> 400 form shown again with "Enter a valid email"
// POST email=a@b.com -> 302 Location: /app/welcome`]
    ),
    'http-servlet-response': dv(
        [`<p>The response object wraps a buffered output channel.</p><ul><li><b>Parts:</b> status line, headers, then the body, written in that order on the wire.</li><li><b>Buffer:</b> the body goes first to a buffer (commonly 8 KB); headers stay changeable until the buffer is flushed or full.</li><li><b>Commit:</b> the first flush sends status and headers, so after that <code>setStatus</code>, <code>setHeader</code> and <code>sendRedirect</code> have no effect or throw.</li><li><b>Writer or stream:</b> <code>getWriter()</code> encodes characters with the response charset; <code>getOutputStream()</code> sends raw bytes.</li><li><b>Completion:</b> when the servlet returns, the container flushes, closes the response and, with keep-alive, reuses the connection.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    System.out.println("buffer=" + resp.getBufferSize()
        + " committed=" + resp.isCommitted());
    resp.getWriter().println("hello");
    resp.flushBuffer();                              // commits the response
    System.out.println("committed=" + resp.isCommitted());
}

// OUTPUT: (container log, buffer size varies)
// buffer=8192 committed=false
// committed=true`],
        [`<p>Most used response features:</p><ul><li><b>Status:</b> <code>setStatus(int)</code> for normal codes; <code>sendError(code, msg)</code> to use the container error page.</li><li><b>Redirect:</b> <code>sendRedirect(url)</code> (302); for 301 or 303 set the status and the <code>Location</code> header yourself.</li><li><b>Headers:</b> <code>setHeader</code> replaces, <code>addHeader</code> adds; date and int variants exist.</li><li><b>Cookies:</b> <code>addCookie(cookie)</code> with <code>setHttpOnly</code>, <code>setSecure</code> and <code>setMaxAge</code>.</li><li><b>Content:</b> <code>setContentType</code>, <code>setCharacterEncoding</code>, <code>setContentLength</code>.</li><li><b>URL rewriting:</b> <code>encodeURL</code> adds the session id when cookies are off.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    Cookie c = new Cookie("theme", "dark");
    c.setHttpOnly(true);
    c.setSecure(true);
    c.setPath("/");
    c.setMaxAge(7 * 24 * 3600);
    resp.addCookie(c);
    resp.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);       // 301
    resp.setHeader("Location", req.getContextPath() + "/home");
}

// OUTPUT:
// HTTP/1.1 301
// Set-Cookie: theme=dark; Max-Age=604800; Path=/; Secure; HttpOnly
// Location: /app/home`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Headers after writing:</b> status and headers set after the buffer flush are lost; set them first.</li><li><b>Redirect after output:</b> <code>IllegalStateException: Cannot call sendRedirect() after the response has been committed</code>; redirect before writing and <code>return</code>.</li><li><b>Both writer and stream:</b> <code>getWriter()</code> then <code>getOutputStream()</code> throws <code>IllegalStateException</code>.</li><li><b>Missing return after sendRedirect:</b> the code continues and tries to write more.</li><li><b>Wrong content type:</b> HTML sent as text/plain shows as raw text.</li><li><b>No charset:</b> accented characters show as question marks.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    PrintWriter out = resp.getWriter();
    out.println("start");
    out.flush();
    resp.sendRedirect("/app/home");     // BUG: response already committed
}

protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    if (!loggedIn(req)) {
        resp.sendRedirect(req.getContextPath() + "/login");
        return;                          // FIX: stop here
    }
    resp.getWriter().println("ok");
}

// OUTPUT: (container log for the buggy doGet)
// java.lang.IllegalStateException: Cannot call sendRedirect() after the
// response has been committed`],
        [`<p>Response tuning:</p><ul><li><b>Compression:</b> enable gzip in the connector for text content (Tomcat <code>compression="on"</code>) instead of coding it.</li><li><b>Cache headers:</b> static content gets long <code>max-age</code>, dynamic data <code>no-store</code> where needed.</li><li><b>Streaming:</b> for large files copy in chunks (for example 8 to 64 KB) and avoid building whole content in memory.</li><li><b>Content-Length:</b> set it for known sizes to avoid chunked encoding.</li><li><b>Slow clients:</b> use async writes or timeouts so they do not pin threads.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    Path file = Path.of("/data/export/big.csv");
    resp.setContentType("text/csv;charset=UTF-8");
    resp.setHeader("Content-Disposition", "attachment; filename=\"big.csv\"");
    resp.setContentLengthLong(Files.size(file));
    try (OutputStream out = resp.getOutputStream()) {
        Files.copy(file, out);                           // streams in chunks
    }
}

// OUTPUT: (response headers, size varies)
// Content-Type: text/csv;charset=UTF-8
// Content-Length: 52428800
// Content-Disposition: attachment; filename="big.csv"`],
        [`<p>A bank statement servlet must send a PDF, make sure it is never cached, and show a friendly error when the account is unknown. It sets the status and headers first, validates input before writing any bytes, and uses <code>sendError</code> for failures. A filter adds security headers to every response, so each servlet stays small.</p>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    byte[] pdf = statements.render(req.getParameter("acct"));
    if (pdf == null) {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Unknown account");
        return;
    }
    resp.setContentType("application/pdf");
    resp.setHeader("Cache-Control", "no-store");
    resp.setHeader("Content-Disposition", "inline; filename=\"statement.pdf\"");
    resp.setContentLength(pdf.length);
    resp.getOutputStream().write(pdf);
}

// OUTPUT: (varies)
// GET /statement?acct=991 -> 200 application/pdf, 48211 bytes
// GET /statement?acct=000 -> 404 Unknown account`]
    )
};
