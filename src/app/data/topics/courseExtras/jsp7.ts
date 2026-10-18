// JSP and Servlet extras, part 7: listeners, error pages, JSP basics (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jsp7Extras: Record<string, Extra> = {
    'requestlistener': x(
        ['<b>ServletRequestListener</b> is called when a request enters (<code>requestInitialized</code>) and leaves (<code>requestDestroyed</code>) the web application.',
            '<b>Registration</b>: annotate the class with <code>@WebListener</code> or declare a <code>&lt;listener&gt;</code> element in <code>web.xml</code>.',
            '<b>Event object</b>: <code>ServletRequestEvent</code> gives <code>getServletRequest()</code> and <code>getServletContext()</code>.'],
        ['<b>Cast needed</b>: cast the request to <code>HttpServletRequest</code> to read the URI, method and headers.',
            '<b>Attribute listener</b>: <code>ServletRequestAttributeListener</code> reports <code>setAttribute</code>, replace and remove on a request.',
            '<b>Use cases</b>: request logging, timing, a correlation id, and cleaning per-request resources.'],
        ['<b>Cross-cutting</b>: a Filter is better for changing the request or response; a listener only observes lifecycle events.',
            '<b>Thread context</b>: set and clear a logging context (MDC) in the pair of methods so thread-pool threads never leak data.',
            '<b>Async</b>: with <code>startAsync</code> the request is destroyed only when the async cycle completes.'],
        [['F', 'When is requestInitialized called?', 'When a request is about to enter the first servlet or filter of the application.'],
            ['F', 'How do you register a request listener?', 'Use @WebListener on the class or a listener element in web.xml.'],
            ['M', 'Listener or filter for logging?', 'A filter can wrap the chain and time it; a listener is fine for simple start and end hooks.'],
            ['M', 'How do you get the HTTP method in a listener?', 'Cast event.getServletRequest() to HttpServletRequest and call getMethod().'],
            ['S', 'Why clear the MDC in requestDestroyed?', 'Container threads are reused, so leftover context would show up in the next request log lines.'],
            ['S', 'Does a forward trigger the listener again?', 'No. Listeners fire once per request; a forward stays in the same request. Only an ASYNC dispatch or error dispatch needs care.']],
        [['Count requests with a listener.',
            r`@WebListener
public class CountListener implements ServletRequestListener {
    private final AtomicLong total = new AtomicLong();

    @Override
    public void requestInitialized(ServletRequestEvent e) {
        HttpServletRequest req = (HttpServletRequest) e.getServletRequest();
        long n = total.incrementAndGet();
        e.getServletContext().log("#" + n + " " + req.getMethod() + " " + req.getRequestURI());
    }

    @Override
    public void requestDestroyed(ServletRequestEvent e) {
        e.getServletContext().log("request finished");
    }
}

// OUTPUT: (container log, varies)
// INFO: #1 GET /shop/products
// INFO: request finished`],
            ['web.xml registration.',
                r`<listener>
    <listener-class>com.example.CountListener</listener-class>
</listener>

<!-- Same effect as @WebListener;
the class must have a public no-arg constructor -->

// OUTPUT:
// The container instantiates CountListener once at startup and calls it for every request.`]],
        [['Timing a request.',
            r`@WebListener
public class TimerListener implements ServletRequestListener {
    public void requestInitialized(ServletRequestEvent e) {
        e.getServletRequest().setAttribute("startNanos", System.nanoTime());
    }
    public void requestDestroyed(ServletRequestEvent e) {
        long start = (Long) e.getServletRequest().getAttribute("startNanos");
        long ms = (System.nanoTime() - start) / 1_000_000;
        e.getServletContext().log("took " + ms + " ms");
    }
}

// OUTPUT: (container log, varies)
// INFO: took 12 ms`],
            ['Watch attribute changes.',
                r`@WebListener
public class AttrListener implements ServletRequestAttributeListener {
    public void attributeAdded(ServletRequestAttributeEvent e) {
        System.out.println("added " + e.getName() + "=" + e.getValue());
    }
    public void attributeRemoved(ServletRequestAttributeEvent e) { }
    public void attributeReplaced(ServletRequestAttributeEvent e) { }
}

// OUTPUT: (varies)
// added startNanos=123456789012`]]
    ),
    'error-pages-webxml': x(
        ['<b>error-page element</b> in <code>web.xml</code> maps an HTTP status code or an exception type to a page, servlet or JSP.',
            '<b>By status</b>: <code>&lt;error-code&gt;404&lt;/error-code&gt;</code> plus <code>&lt;location&gt;/errors/404.jsp&lt;/location&gt;</code>.',
            '<b>By exception</b>: <code>&lt;exception-type&gt;java.lang.Exception&lt;/exception-type&gt;</code> catches uncaught exceptions from servlets.'],
        ['<b>Request attributes</b>: the container sets <code>javax.servlet.error.status_code</code>, <code>exception_type</code>, <code>message</code>, <code>exception</code> and <code>request_uri</code> (Jakarta EE 9+ uses <code>jakarta.servlet.error.*</code>).',
            '<b>Most specific wins</b>: an exact exception type beats its superclass, and a status code entry is used when no exception entry matches.',
            '<b>Default page</b>: an <code>error-page</code> with neither code nor type (Servlet 3.0+) is the catch-all.'],
        ['<b>Status preserved</b>: the container keeps the original status code when it dispatches to the error page, unless the page changes it.',
            '<b>Committed response</b>: if the response is already committed, the error page cannot be shown, so buffer output and handle errors early.',
            '<b>Security</b>: never print stack traces to users; log them and show a reference id.'],
        [['F', 'How do you show a custom 404 page?', 'Add an error-page with error-code 404 and a location in web.xml.'],
            ['F', 'Can you map an exception to a page?', 'Yes, with exception-type and location.'],
            ['M', 'Which attribute holds the failing URL?', 'javax.servlet.error.request_uri.'],
            ['M', 'What if two entries match an exception?', 'The container picks the closest class in the exception hierarchy.'],
            ['S', 'Why might your error page not appear?', 'The response was already committed, or the error page itself threw, or IE style friendly pages replace small bodies.'],
            ['S', 'How do you set the error page status in a JSP?', 'Use isErrorPage on the page directive; the container already sets the status, and you can read it from the error attributes.']],
        [['Error pages in web.xml.',
            r`<error-page>
    <error-code>404</error-code>
    <location>/errors/404.jsp</location>
</error-page>
<error-page>
    <error-code>500</error-code>
    <location>/errors/500.jsp</location>
</error-page>
<error-page>
    <exception-type>java.lang.NullPointerException</exception-type>
    <location>/errors/npe.jsp</location>
</error-page>

// OUTPUT:
// GET /missing  -> HTTP 404, body from /errors/404.jsp
// NullPointerException in a servlet -> HTTP 500, body from /errors/npe.jsp`],
            ['A catch-all page.',
                r`<error-page>
    <location>/errors/generic.jsp</location>
</error-page>

<!-- Servlet 3.0+: used when no code or exception entry matches -->

// OUTPUT:
// GET /api/x returns 405 with no matching entry -> /errors/generic.jsp`]],
        [['Read the error attributes.',
            r`<%@ page isErrorPage="true" contentType="text/html;charset=UTF-8" %>
<html><body>
<h2>Error <%= request.getAttribute("javax.servlet.error.status_code") %></h2>
<p>URL: <%= request.getAttribute("javax.servlet.error.request_uri") %></p>
<p>Type: <%= request.getAttribute("javax.servlet.error.exception_type") %></p>
</body></html>

// OUTPUT: (rendered, varies)
// Error 500
// URL: /shop/order
// Type: class java.lang.NullPointerException`],
            ['Trigger an error from a servlet.',
                r`@WebServlet("/boom")
public class BoomServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        if (req.getParameter("nf") != null) {
            res.sendError(HttpServletResponse.SC_NOT_FOUND, "no such item");
        }
        throw new IllegalStateException("broken");
    }
}

// OUTPUT:
// /boom?nf=1 -> HTTP 404 (404 page)
// /boom      -> HTTP 500 (500 page, exception_type = IllegalStateException)`]]
    ),
    'customErrorHandling': x(
        ['<b>Custom error handling</b> means showing friendly pages and logging details instead of the raw container stack trace.',
            '<b>sendError</b>: <code>response.sendError(404, "msg")</code> triggers the matching error page; <code>setStatus</code> does not.',
            '<b>Error servlet</b>: the <code>location</code> can be a servlet that reads the error attributes and builds the response.'],
        ['<b>Page-level</b>: a JSP uses <code>errorPage="/err.jsp"</code> in its page directive, and the target declares <code>isErrorPage="true"</code> to get the <code>exception</code> object.',
            '<b>Application-level</b>: <code>web.xml</code> entries apply to all resources and are the default choice.',
            '<b>Logging</b>: log the exception with a correlation id and show only that id to the user.'],
        ['<b>Content negotiation</b>: return JSON for API paths and HTML for browser paths from the same error servlet, using the Accept header or URL prefix.',
            '<b>Never swallow</b>: catching an exception and returning 200 hides failures from monitoring and clients.',
            '<b>Frameworks</b>: Spring and others add their own handlers (such as <code>@ControllerAdvice</code>) before the container error page runs.'],
        [['F', 'sendError or setStatus?', 'sendError triggers the error page mechanism; setStatus only sets the code and your body is kept.'],
            ['F', 'What does isErrorPage do?', 'It makes the implicit exception object available in that JSP.'],
            ['M', 'How do page-level and web.xml handling combine?', 'A JSP errorPage attribute takes precedence over web.xml mappings for exceptions in that page.'],
            ['M', 'What should the user see on a 500?', 'A short friendly message and a reference id; the stack trace goes to the log.'],
            ['S', 'How do you serve JSON errors for an API?', 'Map errors to a servlet that checks the request URI or Accept header and writes JSON with the original status.'],
            ['S', 'Why can an error page fail?', 'If it throws itself, or the response is committed, the container falls back to its default page.']],
        [['Error servlet with log id.',
            r`@WebServlet("/error")
public class ErrorServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        Integer code = (Integer) req.getAttribute("javax.servlet.error.status_code");
        Throwable t = (Throwable) req.getAttribute("javax.servlet.error.exception");
        String id = UUID.randomUUID().toString().substring(0, 8);
        getServletContext().log("error " + id + " code=" + code, t);
        res.setContentType("text/html;charset=UTF-8");
        res.getWriter().println("<p>Something went wrong. Reference: " + id + "</p>");
    }
}

// OUTPUT: (varies)
// SEVERE: error 3fa9c1d2 code=500 ... stack trace ...
// Browser: Something went wrong. Reference: 3fa9c1d2`],
            ['Page-level error handling.',
                r`<%-- order.jsp --%>
<%@ page errorPage="/errors/page-error.jsp" %>
<% int qty = Integer.parseInt(request.getParameter("qty"));
%>

<%-- page-error.jsp --%>
<%@ page isErrorPage="true" %>
<p>Bad input: <%= exception.getMessage() %></p>

// OUTPUT: (qty=abc)
// Bad input: For input string: "abc"`]],
        [['Forward to a friendly page.',
            r`try {
    orderService.place(order);
} catch (OutOfStockException e) {
    req.setAttribute("msg", e.getMessage());
    req.getRequestDispatcher("/WEB-INF/views/stock.jsp").forward(req, res);
    return;
}

// OUTPUT:
// The user sees stock.jsp with HTTP 200; use sendError(409) if clients need a status.`],
            ['JSON for API paths.',
                r`String uri = (String) req.getAttribute("javax.servlet.error.request_uri");
int code = (Integer) req.getAttribute("javax.servlet.error.status_code");
if (uri != null && uri.startsWith("/api/")) {
    res.setStatus(code);
    res.setContentType("application/json");
    res.getWriter().print("{\"status\":" + code + "}");
}

// OUTPUT:
// GET /api/missing -> HTTP 404  {"status":404}`]]
    ),
    'jsp-introduction': x(
        ['<b>JSP</b> (JavaServer Pages) lets you write HTML with embedded Java and tags; the server turns it into a servlet.',
            '<b>Lifecycle</b>: translation, compilation, loading, <code>jspInit</code>, <code>_jspService</code> per request, and <code>jspDestroy</code>.',
            '<b>First request</b> is slower because the page is translated and compiled; later requests reuse the loaded class.'],
        ['<b>Generated servlet</b>: the page becomes a class extending <code>HttpJspBase</code> (Tomcat), with HTML written through <code>out.write</code>.',
            '<b>Implicit objects</b>: <code>request</code>, <code>response</code>, <code>session</code>, <code>out</code>, <code>application</code>, <code>config</code>, <code>pageContext</code>, <code>page</code>, <code>exception</code>.',
            '<b>Placement</b>: pages under <code>WEB-INF</code> cannot be requested directly, so they are shown only through a servlet forward.'],
        ['<b>MVC</b>: servlets handle logic (controller), JSP only renders (view), and beans carry the model.',
            '<b>Precompile</b>: translate pages at build time (Jasper ant or Maven plugin) to avoid first-hit delay and to find errors early.',
            '<b>Thread safety</b>: one servlet instance serves many threads, so declarations (fields) in a page are shared and unsafe.'],
        [['F', 'What is JSP?', 'A server-side technology that mixes HTML and Java and is compiled into a servlet.'],
            ['F', 'When is a JSP translated?', 'On the first request (or at deploy time if precompiled) and again when the file changes.'],
            ['M', 'Name the lifecycle methods.', 'jspInit, _jspService and jspDestroy.'],
            ['M', 'Why put JSPs under WEB-INF?', 'So users cannot open them directly and bypass the controller.'],
            ['S', 'Why is the _jspService method not overridable?', 'The container generates it from the page body; you may only override jspInit and jspDestroy.'],
            ['S', 'How does JSP differ from a template engine like Thymeleaf?', 'JSP compiles to a servlet class and allows raw Java, while Thymeleaf interprets natural templates without arbitrary Java.']],
        [['A first JSP page.',
            r`<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<body>
<h1>Hello from JSP</h1>
<p>Time: <%= new java.util.Date() %></p>
</body>
</html>

// OUTPUT: (rendered, varies)
// Hello from JSP
// Time: Wed Oct 07 10:15:00 IST 2026`],
            ['Controller forwards to a view.',
                r`@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        req.setAttribute("name", "Abaji");
        req.getRequestDispatcher("/WEB-INF/views/hello.jsp").forward(req, res);
    }
}

// OUTPUT:
// GET /hello -> HTTP 200 and the HTML produced by hello.jsp`]],
        [['Using an implicit object.',
            r`<p>Method: <%= request.getMethod() %></p>
<p>Session id: <%= session.getId() %></p>
<p>App: <%= application.getContextPath() %></p>

// OUTPUT: (varies)
// Method: GET
// Session id: 9A3F0C1D5B7E...
// App: /shop`],
            ['Declare lifecycle hooks.',
                r`<%!
    public void jspInit()    { System.out.println("jspInit"); }
    public void jspDestroy() { System.out.println("jspDestroy"); }
%>
<p>Ready</p>

// OUTPUT: (container console)
// jspInit        (on first request)
// jspDestroy     (on undeploy or reload)`]]
    ),
    'jsp-elements': x(
        ['<b>Scriptlet</b> <code>&lt;% code %&gt;</code> puts Java statements inside <code>_jspService</code>.',
            '<b>Expression</b> <code>&lt;%= value %&gt;</code> prints a value and has no semicolon.',
            '<b>Declaration</b> <code>&lt;%! int n; %&gt;</code> adds fields and methods to the generated class; <b>comment</b> <code>&lt;%-- text --%&gt;</code> never reaches the browser.'],
        ['<b>Scope of variables</b>: scriptlet variables are local to one request; declaration variables are instance fields shared by all requests.',
            '<b>HTML comment</b> <code>&lt;!-- --&gt;</code> is sent to the client, unlike the JSP comment.',
            '<b>Directives and actions</b> are other element types: <code>&lt;%@ ... %&gt;</code> and <code>&lt;jsp:... /&gt;</code>.'],
        ['<b>Avoid scriptlets</b>: they mix logic with markup, are hard to test and reuse, and invite XSS; use JSTL and dollar-brace EL instead.',
            '<b>Escaping</b>: an expression prints raw text, so user data must be escaped (<code>c:out</code> or <code>fn:escapeXml</code>).',
            '<b>Config</b>: <code>scripting-invalid</code> in <code>jsp-config</code> can ban scriptlets for a project.'],
        [['F', 'Three scripting elements?', 'Scriptlet, expression and declaration.'],
            ['F', 'Does an expression end with a semicolon?', 'No, it is wrapped in out.print(...) by the container.'],
            ['M', 'Scriptlet variable versus declaration variable?', 'A scriptlet variable is local to _jspService; a declaration creates an instance field shared across threads.'],
            ['M', 'JSP comment versus HTML comment?', 'The JSP comment is removed during translation; the HTML comment is sent to the browser.'],
            ['S', 'Why are scriptlets discouraged?', 'They break separation of concerns, cannot be unit tested and make XSS and null bugs likely.'],
            ['S', 'How do you ban scriptlets?', 'Set scripting-invalid to true in a jsp-property-group in web.xml.']],
        [['The elements together.',
            r`<%! private int visits = 0;
%>
<% visits++;
String user = request.getParameter("user");
%>
<%-- this comment is not sent --%>
<!-- this HTML comment is sent -->
<p>Visits: <%= visits %></p>
<p>User: <%= user == null ? "guest" : user %></p>

// OUTPUT: (rendered, first request)
// <!-- this HTML comment is sent -->
// Visits: 1
// User: guest`],
            ['Loop with a scriptlet.',
                r`<ul>
<% String[] items = {"pen", "ink"};
   for (String s : items) { %>
    <li><%= s %></li>
<% } %>
</ul>

// OUTPUT:
// <ul>
//     <li>pen</li>
//     <li>ink</li>
// </ul>`]],
        [['Same loop with JSTL.',
            r`<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<ul>
<c:forEach var="s" items="` + r`$` + r`{items}
">
    <li><c:out value="` + r`$` + r`{s}
"/></li>
</c:forEach>
</ul>

// NOTE: JSTL c:forEach over a request attribute named items replaces the scriptlet loop.
// OUTPUT:
// one li element per item, without Java code in the page`],
            ['Danger of declarations.',
                r`<%! int counter = 0;
%>
<% counter++;
%>
<p>Count: <%= counter %></p>

// OUTPUT: (varies)
// Count: 7   (shared by every user and not thread-safe)`]]
    ),
    'jsp-directives': x(
        ['<b>Directives</b> give translation-time instructions to the container and have the form <code>&lt;%@ name attr="v" %&gt;</code>.',
            '<b>page</b> sets <code>contentType</code>, <code>import</code>, <code>session</code>, <code>errorPage</code>, <code>isErrorPage</code> and <code>language</code>.',
            '<b>include</b> copies a file into the page at translation time; <b>taglib</b> declares a tag library prefix.'],
        ['<b>import</b>: <code>&lt;%@ page import="java.util.*" %&gt;</code> may appear several times; other attributes may appear only once.',
            '<b>include directive</b> is static: the included file is merged before compilation, so it shares variables with the host page.',
            '<b>taglib</b>: <code>&lt;%@ taglib prefix="c" uri="..." %&gt;</code>; the URI for JSTL core is <code>http://java.sun.com/jsp/jstl/core</code> (Jakarta: <code>jakarta.tags.core</code>).'],
        ['<b>Include trade-off</b>: the include directive is fast at runtime but changes in the included file may need a recompile (container dependent); jsp:include is dynamic.',
            '<b>session=false</b> on pages that do not need a session avoids creating one needlessly.',
            '<b>buffer and autoFlush</b>: the default buffer is 8kb; error pages and forwards only work before the response is committed.'],
        [['F', 'Name the three directives.', 'page, include and taglib.'],
            ['F', 'Where do directives usually go?', 'At the top of the page, though they may appear anywhere.'],
            ['M', 'Which page attribute can repeat?', 'Only import.'],
            ['M', 'What does session="false" do?', 'The page does not join or create an HttpSession, and the session object is unavailable.'],
            ['S', 'Include directive versus jsp:include?', 'The directive merges source at translation time; jsp:include calls the other resource at request time and merges its output.'],
            ['S', 'Why use a prelude in jsp-config?', 'include-prelude automatically adds a common taglib and page directives file to every page.']],
        [['Page and taglib directives.',
            r`<%@ page contentType="text/html;charset=UTF-8" import="java.util.List" %>
<%@ page session="false" errorPage="/errors/500.jsp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html><body>
<c:out value="Hello"/>
</body></html>

// OUTPUT: (rendered)
// Hello`],
            ['Static include for a header.',
                r`<%@ include file="/WEB-INF/fragments/header.jspf" %>
<p>Page body</p>
<%@ include file="/WEB-INF/fragments/footer.jspf" %>

// OUTPUT:
// header markup, then Page body, then footer markup,
// all compiled into one servlet`]],
        [['Common prelude via web.xml.',
            r`<jsp-config>
    <jsp-property-group>
        <url-pattern>*.jsp</url-pattern>
        <include-prelude>/WEB-INF/fragments/taglibs.jspf</include-prelude>
        <scripting-invalid>true</scripting-invalid>
    </jsp-property-group>
</jsp-config>

// OUTPUT:
// Every JSP gets the taglib declarations and scriptlets are rejected at translation.`],
            ['Duplicate attribute error.',
                r`<%@ page contentType="text/html" contentType="text/plain" %>

// OUTPUT:
// org.apache.jasper.JasperException: Page directive: illegal to have multiple
// occurrences of contentType with different values`]]
    ),
    'jsp-standard-action-tags': x(
        ['<b>Standard actions</b> are built-in tags with the form <code>&lt;jsp:name /&gt;</code> that run at request time.',
            '<b>Main actions</b>: <code>jsp:include</code>, <code>jsp:forward</code>, <code>jsp:param</code>, <code>jsp:useBean</code>, <code>jsp:setProperty</code>, <code>jsp:getProperty</code>.',
            '<b>jsp:forward</b> passes control to another resource on the server; the browser URL does not change.'],
        ['<b>jsp:include</b> runs the target and inserts its output, so each is compiled separately; pass data with nested <code>jsp:param</code>.',
            '<b>jsp:useBean</b> finds or creates a bean in a scope (<code>page</code>, <code>request</code>, <code>session</code>, <code>application</code>) using <code>id</code> and <code>class</code>.',
            '<b>setProperty</b> can bind all matching request parameters with <code>property="*"</code>; the bean needs a public no-arg constructor and setters.'],
        ['<b>Prefer EL and JSTL</b> for reading beans; useBean is mostly legacy, and the controller should create the model.',
            '<b>forward rule</b>: do not write output before a forward, because a committed response cannot be forwarded (IllegalStateException).',
            '<b>Cost</b>: <code>jsp:include</code> performs a dispatch each time; for static, rarely changing fragments the include directive is cheaper.'],
        [['F', 'What does jsp:forward do?', 'It transfers the request to another resource on the server without changing the URL.'],
            ['F', 'What does jsp:include do?', 'It includes the output of another resource at request time.'],
            ['M', 'How do you pass a value to an included page?', 'Nest jsp:param inside jsp:include and read it with request.getParameter.'],
            ['M', 'What are the bean scopes for useBean?', 'page, request, session and application.'],
            ['S', 'Why does jsp:forward sometimes throw IllegalStateException?', 'Output was already flushed, so the response is committed and cannot be redirected.'],
            ['S', 'Why is useBean discouraged today?', 'It lets the view create model objects; the controller should set attributes and the view should read them with EL.']],
        [['useBean with setProperty.',
            r`<jsp:useBean id="user" class="com.example.User" scope="request" />
<jsp:setProperty name="user" property="*" />
<p>Name: <jsp:getProperty name="user" property="name" /></p>

// OUTPUT: (GET ?name=Abaji&age=30)
// Name: Abaji`],
            ['include and forward.',
                r`<jsp:include page="menu.jsp">
    <jsp:param name="active" value="home" />
</jsp:include>
<% if (request.getParameter("login") == null) { %>
    <jsp:forward page="login.jsp" />
<% } %>

// OUTPUT:
// without ?login the menu is not shown; the user sees login.jsp content`]],
        [['Static versus dynamic include.',
            r`<%@ include file="a.jspf" %>      <%-- merged at translation --%>
<jsp:include page="b.jsp" />        <%-- called at request time --%>

// OUTPUT:
// a.jspf: one servlet, shared local variables
// b.jsp: its own servlet; changes show without recompiling the host page`],
            ['Forward after the response is committed.',
                r`<p>Welcome</p>
<% out.flush();
%>
<jsp:forward page="home.jsp" />

// OUTPUT:
// java.lang.IllegalStateException: Cannot forward after response has been committed
// HTTP 500`]]
    )
};

export const jsp7Deep: Record<string, Deep> = {
    'requestlistener': dv(
        [`<p>The container calls listeners around the request pipeline.</p><ul><li><b>Discovery:</b> at startup the container scans for <code>@WebListener</code> classes and reads <code>listener</code> entries, then keeps one instance for each.</li><li><b>Order:</b> <code>requestInitialized</code> runs in declaration order, <code>requestDestroyed</code> in reverse order.</li><li><b>Timing:</b> initialized fires before the first filter, destroyed after the last filter and servlet have completed.</li><li><b>Thread:</b> both calls usually run on the same container thread, but with async they may not.</li></ul>`,
            r`public class OrderListener implements ServletRequestListener {
    public void requestInitialized(ServletRequestEvent e) {
        System.out.println("L1 init");
    }
    public void requestDestroyed(ServletRequestEvent e) {
        System.out.println("L1 destroy");
    }
}
// L2 declared after L1 in web.xml

// OUTPUT: (console, one request)
// L1 init
// L2 init
// servlet runs
// L2 destroy
// L1 destroy`],
        [`<p>Related listener interfaces:</p><ul><li><b>ServletContextListener:</b> startup and shutdown of the whole application.</li><li><b>HttpSessionListener:</b> session create and destroy.</li><li><b>ServletRequestAttributeListener:</b> attribute add, remove and replace on requests.</li><li><b>AsyncListener:</b> complete, timeout, error and start events of async processing.</li><li><b>Registration:</b> annotation, <code>web.xml</code>, or <code>ServletContext.addListener</code> inside a <code>ServletContainerInitializer</code>.</li></ul>`,
            r`@WebListener
public class AppBoot implements ServletContextListener {
    public void contextInitialized(ServletContextEvent e) {
        e.getServletContext().log("app started");
    }
    public void contextDestroyed(ServletContextEvent e) {
        e.getServletContext().log("app stopping");
    }
}

// OUTPUT: (container log)
// INFO: app started
// INFO: app stopping`],
        [`<p>Common mistakes:</p><ul><li><b>Storing request data in a field:</b> the listener is shared, so a field is overwritten by concurrent requests; use a request attribute.</li><li><b>Heavy work:</b> slow code in <code>requestInitialized</code> delays every request.</li><li><b>Not casting:</b> forgetting that the request is a <code>ServletRequest</code> and not an <code>HttpServletRequest</code>.</li><li><b>Missing cleanup:</b> a ThreadLocal set in initialized but not cleared in destroyed.</li><li><b>Wrong class:</b> a listener without a public no-arg constructor fails at startup.</li></ul>`,
            r`// WRONG: shared field, race between threads
public class BadListener implements ServletRequestListener {
    private String uri;
    public void requestInitialized(ServletRequestEvent e) {
        uri = ((HttpServletRequest) e.getServletRequest()).getRequestURI();
    }
    public void requestDestroyed(ServletRequestEvent e) { }
}
// RIGHT: store it as a request attribute: e.getServletRequest().setAttribute("uri", ...)

// OUTPUT:
// With concurrent requests the field holds another user URI (varies)`],
        [`<p>Performance and tuning:</p><ul><li><b>Cost:</b> the listener runs for every request, including static files, so keep it to a few microseconds.</li><li><b>Logging:</b> use asynchronous appenders and avoid string building when the level is disabled.</li><li><b>Counters:</b> use <code>AtomicLong</code> or <code>LongAdder</code>, not synchronized blocks.</li><li><b>Filter alternative:</b> a filter with a url pattern can skip static resources.</li></ul>`,
            r`private final LongAdder hits = new LongAdder();

public void requestInitialized(ServletRequestEvent e) {
    HttpServletRequest r = (HttpServletRequest) e.getServletRequest();
    if (r.getRequestURI().endsWith(".css")) return;   // skip static assets
    hits.increment();
}

// OUTPUT:
// hits counts only dynamic requests; LongAdder scales better than AtomicLong under contention`],
        [`<p>Scenario: add a correlation id to every log line for support tracing.</p><ul><li><b>Start:</b> read <code>X-Request-Id</code> or generate one, put it in the MDC.</li><li><b>End:</b> clear the MDC so the pooled thread is clean.</li><li><b>Result:</b> logs from one request are searchable by one id.</li></ul>`,
            r`@WebListener
public class CorrelationListener implements ServletRequestListener {
    public void requestInitialized(ServletRequestEvent e) {
        HttpServletRequest req = (HttpServletRequest) e.getServletRequest();
        String id = req.getHeader("X-Request-Id");
        MDC.put("rid", id != null ? id : UUID.randomUUID().toString());
    }
    public void requestDestroyed(ServletRequestEvent e) {
        MDC.clear();
    }
}

// OUTPUT: (log pattern includes rid, varies)
// 10:15:00 [rid=8d3f...] OrderService - order placed`]
    ),
    'error-pages-webxml': dv(
        [`<p>When an error happens, the container runs an error dispatch.</p><ul><li><b>Trigger:</b> <code>sendError</code>, an uncaught exception, or a status such as 404 produced by the container.</li><li><b>Lookup:</b> first the exception type (walking up the class hierarchy, also checking the root cause of a <code>ServletException</code>), then the status code, then the default entry.</li><li><b>Dispatch:</b> the response buffer is reset, the attributes are set, and the page is invoked with dispatcher type <code>ERROR</code>.</li><li><b>Attributes:</b> <code>javax.servlet.error.status_code</code>, <code>exception_type</code>, <code>message</code>, <code>exception</code>, <code>request_uri</code>, <code>servlet_name</code>.</li></ul>`,
            r`<error-page>
    <exception-type>java.io.IOException</exception-type>
    <location>/errors/io.jsp</location>
</error-page>
<error-page>
    <exception-type>java.lang.Throwable</exception-type>
    <location>/errors/any.jsp</location>
</error-page>

// OUTPUT:
// FileNotFoundException (subclass of IOException) -> /errors/io.jsp
// IllegalStateException                           -> /errors/any.jsp`],
        [`<p>Variants of the mapping:</p><ul><li><b>error-code:</b> any valid HTTP status, for example 400, 403, 404, 405, 500, 503.</li><li><b>exception-type:</b> a fully qualified class name.</li><li><b>location:</b> must begin with a slash and can be a JSP, HTML file or servlet path.</li><li><b>Default:</b> an entry without code or type.</li><li><b>Spring Boot:</b> embedded containers use <code>/error</code> and <code>ErrorController</code> instead of web.xml.</li></ul>`,
            r`<error-page>
    <error-code>403</error-code>
    <location>/errors/forbidden.html</location>
</error-page>
<error-page>
    <error-code>503</error-code>
    <location>/errors/maintenance.html</location>
</error-page>

// OUTPUT:
// HTTP 403 shows forbidden.html; HTTP 503 shows maintenance.html (static files work too)`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Location without slash:</b> the path is rejected at startup; always start with <code>/</code>.</li><li><b>Error page throws:</b> keep it simple and avoid dependencies that can fail.</li><li><b>Wrong attribute prefix:</b> on Jakarta EE 9+ use <code>jakarta.servlet.error.*</code>.</li><li><b>Duplicate entries:</b> two entries for the same code or type make deployment fail.</li><li><b>Small body in IE:</b> old browsers replace error bodies shorter than 512 bytes.</li><li><b>Leaking details:</b> printing the stack trace exposes class names and paths.</li></ul>`,
            r`// Jakarta EE 9+ (Tomcat 10+)
Integer code = (Integer) request.getAttribute("jakarta.servlet.error.status_code");
// Java EE (Tomcat 9)
Integer old = (Integer) request.getAttribute("javax.servlet.error.status_code");

// OUTPUT:
// On Tomcat 10 the javax.* attribute is null and the jakarta.* one holds 404`],
        [`<p>Tuning:</p><ul><li><b>Static error pages:</b> HTML files are cheap and have no failure path.</li><li><b>Cache headers:</b> set <code>Cache-Control: no-store</code> on dynamic error output.</li><li><b>Bots:</b> many 404s from scanners can flood logs, so log them at a lower level.</li><li><b>Status integrity:</b> do not turn errors into 200, because proxies and monitoring rely on the status.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    res.setHeader("Cache-Control", "no-store");
    // status is already set by the container; keep it
    res.getWriter().println("<h1>Page not found</h1>");
}

// OUTPUT:
// HTTP/1.1 404
// Cache-Control: no-store
// <h1>Page not found</h1>`],
        [`<p>Scenario: a storefront needs a branded 404, a maintenance page and no stack traces.</p><ul><li><b>404:</b> static page with search box and links.</li><li><b>500:</b> servlet that logs and shows a reference id.</li><li><b>503:</b> static maintenance page, usable even when the database is down.</li></ul>`,
            r`<error-page><error-code>404</error-code><location>/errors/404.html</location></error-page>
<error-page><error-code>500</error-code><location>/error</location></error-page>
<error-page><error-code>503</error-code><location>/errors/maint.html</location></error-page>
<error-page><location>/error</location></error-page>

// OUTPUT:
// /nope -> 404.html, DB outage -> 500 via /error with id, deploy window -> 503 page`]
    ),
    'customErrorHandling': dv(
        [`<p>Custom handling works at several layers.</p><ul><li><b>Code level:</b> try-catch in servlets decides the status and view.</li><li><b>Page level:</b> the <code>errorPage</code> attribute makes the JSP catch its own exception and forward to the error JSP, which sets the <code>exception</code> variable.</li><li><b>Container level:</b> <code>error-page</code> entries handle whatever escapes.</li><li><b>Framework level:</b> filters or advice objects can convert exceptions before the container sees them.</li></ul>`,
            r`<%-- generated code idea inside _jspService --%>
try {
    // page body
} catch (Throwable t) {
    if (pageContext != null) pageContext.handlePageException(t);
}

// OUTPUT:
// handlePageException forwards to the errorPage JSP with the exception in the request`],
        [`<p>Options for choosing the response:</p><ul><li><b>sendError(code):</b> container error page, resets the buffer.</li><li><b>setStatus plus body:</b> you own the page, the container does not intervene.</li><li><b>Redirect:</b> use for post-redirect-get, not for errors.</li><li><b>Forward to view:</b> keeps the URL and request attributes.</li><li><b>Filter wrapper:</b> a filter that catches exceptions from <code>chain.doFilter</code> gives one handling place.</li></ul>`,
            r`@WebFilter("/*")
public class ErrorFilter implements Filter {
    public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain c)
            throws IOException, ServletException {
        try {
            c.doFilter(rq, rs);
        } catch (IllegalArgumentException e) {
            ((HttpServletResponse) rs).sendError(400, e.getMessage());
        }
    }
}

// OUTPUT:
// An IllegalArgumentException thrown by any servlet becomes HTTP 400 with the 400 page`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Catch and ignore:</b> add logging and rethrow or send a proper status.</li><li><b>Returning 200 for errors:</b> clients cannot tell failure from success.</li><li><b>Exposing the message:</b> exception messages may contain SQL or paths.</li><li><b>sendError after output:</b> throws IllegalStateException; buffer first.</li><li><b>Forgetting isErrorPage:</b> the <code>exception</code> object is null in the target JSP.</li></ul>`,
            r`try {
    dao.save(order);
} catch (SQLException e) {
    log.error("save failed for order " + order.getId(), e);   // log full detail
    res.sendError(500, "Could not save the order");           // safe message
}

// OUTPUT: (log)
// ERROR save failed for order 42 java.sql.SQLException: ...
// Client: HTTP 500 with the generic 500 page`],
        [`<p>Tuning and operations:</p><ul><li><b>Log once:</b> log at the point of handling to avoid duplicate stack traces.</li><li><b>Rate limits:</b> bursts of the same error should not flood storage.</li><li><b>Metrics:</b> count errors by status for alerting.</li><li><b>Error budget:</b> alerts on the 5xx rate, not on single failures.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse res) {
    int code = (Integer) req.getAttribute("javax.servlet.error.status_code");
    errorCounter.computeIfAbsent(code, k -> new LongAdder()).increment();
}

// OUTPUT: (metric, varies)
// errors{status="500"} 3
// errors{status="404"} 41`],
        [`<p>Scenario: a REST plus web application needs both views.</p><ul><li><b>Browser paths:</b> HTML page with reference id.</li><li><b>API paths:</b> JSON body with code and id.</li><li><b>Support:</b> the id lets staff find the log entry.</li></ul>`,
            r`String uri = (String) req.getAttribute("javax.servlet.error.request_uri");
String id = UUID.randomUUID().toString().substring(0, 8);
if (uri != null && uri.startsWith("/api/")) {
    res.setContentType("application/json");
    res.getWriter().print("{\"error\":\"internal\",\"ref\":\"" + id + "\"}");
} else {
    req.setAttribute("ref", id);
    req.getRequestDispatcher("/WEB-INF/views/error.jsp").forward(req, res);
}

// OUTPUT: (varies)
// /api/orders -> {"error":"internal","ref":"a41c9e07"}
// /checkout   -> HTML page showing Reference: a41c9e07`]
    ),
    'jsp-introduction': dv(
        [`<p>JSP runs through a translation pipeline.</p><ul><li><b>Translation:</b> Jasper converts the page into a Java source file (Tomcat keeps it under <code>work/Catalina/...</code>): HTML becomes <code>out.write("...")</code>, scriptlets are copied, expressions become <code>out.print(...)</code>, declarations become members.</li><li><b>Compilation:</b> the source is compiled to a class and loaded by a per-page class loader.</li><li><b>Request:</b> <code>_jspService(request, response)</code> runs once per request on many threads.</li><li><b>Reload:</b> when the file timestamp changes (development mode), the page is retranslated.</li></ul>`,
            r`public final class hello_jsp extends org.apache.jasper.runtime.HttpJspBase {
    public void _jspService(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {
        JspWriter out = pageContext.getOut();
        out.write("<html><body>\r\n<h1>Hello from JSP</h1>\r\n");
        out.write("<p>Time: ");
        out.print(new java.util.Date());
        out.write("</p>\r\n</body></html>");
    }
}

// OUTPUT: (shape of generated code, simplified)
// Written by Jasper into hello_jsp.java and hello_jsp.class`],
        [`<p>Variants and configuration:</p><ul><li><b>JSP syntax:</b> classic tags or XML form (<code>.jspx</code>).</li><li><b>Fragments:</b> <code>.jspf</code> files for includes.</li><li><b>Tag files:</b> <code>.tag</code> files define reusable tags in JSP syntax.</li><li><b>Jasper options:</b> <code>development</code>, <code>checkInterval</code>, <code>genStringAsCharArray</code> in the JspServlet init-params.</li><li><b>Mapping:</b> <code>*.jsp</code> is handled by the built-in JspServlet.</li></ul>`,
            r`<servlet>
    <servlet-name>jsp</servlet-name>
    <servlet-class>org.apache.jasper.servlet.JspServlet</servlet-class>
    <init-param><param-name>development</param-name><param-value>false</param-value></init-param>
    <init-param><param-name>checkInterval</param-name><param-value>0</param-value></init-param>
</servlet>

// OUTPUT:
// Production: no file timestamp checks, so pages are not retranslated after deployment`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Business logic in pages:</b> move it to servlets and services.</li><li><b>Direct access to private pages:</b> place views under <code>WEB-INF</code>.</li><li><b>Wrong encoding:</b> set <code>pageEncoding</code> and <code>contentType</code> to UTF-8.</li><li><b>Unescaped output:</b> leads to cross-site scripting.</li><li><b>Shared fields:</b> declarations are not thread-safe.</li><li><b>Large pages:</b> a method over 64KB fails to compile; split with includes.</li></ul>`,
            r`<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%-- WRONG: <%= request.getParameter("q") %> prints raw input --%>
<%-- RIGHT: use c:out so that markup in q is escaped --%>

// OUTPUT: (q=<script>alert(1)</script>)
// WRONG: the script runs in the browser
// RIGHT: &lt;script&gt;alert(1)&lt;/script&gt; is shown as text`],
        [`<p>Tuning:</p><ul><li><b>Precompile:</b> avoids first-request latency and moves errors to build time.</li><li><b>Buffer:</b> keep the default buffer or increase it for large pages; avoid <code>autoFlush</code> surprises.</li><li><b>Whitespace:</b> <code>trimDirectiveWhitespaces</code> reduces output size.</li><li><b>session=false</b> where not needed.</li><li><b>Caching:</b> cache rendered fragments or use HTTP caching for static parts.</li></ul>`,
            r`<%@ page session="false" trimDirectiveWhitespaces="true" buffer="16kb" %>

// OUTPUT:
// No HttpSession is created for this page and blank lines from directives are removed
// (saves memory per visitor and a few bytes per response)`],
        [`<p>Scenario: a product list built with MVC.</p><ul><li><b>Servlet:</b> loads products from the service and sets a request attribute.</li><li><b>JSP:</b> only renders the list.</li><li><b>Benefit:</b> the designer edits the page and the developer tests the servlet.</li></ul>`,
            r`// Controller
req.setAttribute("products", productService.findAll());
req.getRequestDispatcher("/WEB-INF/views/products.jsp").forward(req, res);

// products.jsp (JSTL, no scriptlets)
// <c:forEach var="p" items="dollar-brace products end-brace">
//     <li><c:out value="dollar-brace p.name end-brace"/></li>
// </c:forEach>

// OUTPUT: (rendered)
// <li>Pen</li>
// <li>Ink</li>`]
    ),
    'jsp-elements': dv(
        [`<p>Each element maps to generated Java code.</p><ul><li><b>Template text:</b> <code>out.write("...")</code> in order.</li><li><b>Scriptlet:</b> the code is pasted inside <code>_jspService</code>, so variables are local and the code runs on every request.</li><li><b>Expression:</b> becomes <code>out.print(expr)</code>; the value is converted with <code>String.valueOf</code>.</li><li><b>Declaration:</b> pasted at class level; fields and methods are shared by all request threads.</li><li><b>Comment:</b> removed in translation.</li></ul>`,
            r`// JSP
// <%! int n = 0; %>
// <% n++; %>Count <%= n %>

// Generated (simplified)
public final class c_jsp extends HttpJspBase {
    int n = 0;                                 // declaration: instance field
    public void _jspService(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {
        JspWriter out = pageContext.getOut();
        n++;                                   // scriptlet
        out.write("Count ");
        out.print(n);                          // expression
    }
}

// OUTPUT: (varies)
// Count 1, then Count 2 on the next request, by any user`],
        [`<p>Variants:</p><ul><li><b>Scriptlet:</b> <code>&lt;% ... %&gt;</code>; code may be split over several scriptlets, with HTML between.</li><li><b>Expression:</b> <code>&lt;%= ... %&gt;</code>, no semicolon.</li><li><b>Declaration:</b> <code>&lt;%! ... %&gt;</code>, methods and fields.</li><li><b>XML form:</b> <code>&lt;jsp:scriptlet&gt;</code>, <code>&lt;jsp:expression&gt;</code>, <code>&lt;jsp:declaration&gt;</code>.</li><li><b>Replacement:</b> EL (dollar-brace expressions) and JSTL tags.</li></ul>`,
            r`<%!
    private String greet(String n) { return "Hi " + n; }
%>
<%
    String who = request.getParameter("who");
    if (who == null) { who = "guest"; }
%>
<p><%= greet(who) %></p>

// OUTPUT: (?who=Abaji)
// <p>Hi Abaji</p>`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Semicolon in expression:</b> causes a compile error; remove it.</li><li><b>Unbalanced braces:</b> a scriptlet block opened with <code>{</code> must close in a later scriptlet.</li><li><b>Declaration used for per-request data:</b> use a scriptlet or an attribute.</li><li><b>Raw output of input:</b> escape it.</li><li><b>Null printing:</b> an expression returning null prints the text null, so check or use <code>c:out</code> with a default.</li></ul>`,
            r`<%-- WRONG --%>
<p><%= name;
%></p>

<%-- RIGHT --%>
<p><%= name %></p>

// OUTPUT:
// WRONG: JasperException: Unable to compile class for JSP (syntax error on token ";")
// RIGHT: <p>Abaji</p>`],
        [`<p>Performance and quality:</p><ul><li><b>Scriptlet loops over large data</b> are not slower than JSTL, but logic in pages is hard to profile and test.</li><li><b>Static text:</b> converted to byte arrays by Jasper, so it is cheap.</li><li><b>Database access in a scriptlet:</b> avoid; it blocks rendering and leaks connections on errors.</li><li><b>Thread safety:</b> remove mutable declarations.</li></ul>`,
            r`<%-- WRONG: connection opened in the page --%>
<% Connection c = DriverManager.getConnection(url); /* leaked if an exception occurs */ %>

// RIGHT: DAO in the controller with try-with-resources, page only renders the result.

// OUTPUT:
// Wrong version: connection leak under errors (pool exhausted after many requests)`],
        [`<p>Scenario: migrating a legacy page with scriptlets.</p><ul><li><b>Step 1:</b> move the database and logic into a servlet.</li><li><b>Step 2:</b> pass data as request attributes.</li><li><b>Step 3:</b> replace loops with <code>c:forEach</code> and values with EL.</li><li><b>Step 4:</b> turn on <code>scripting-invalid</code> to prevent regressions.</li></ul>`,
            r`<jsp-config>
    <jsp-property-group>
        <url-pattern>/WEB-INF/views/*.jsp</url-pattern>
        <scripting-invalid>true</scripting-invalid>
    </jsp-property-group>
</jsp-config>

// OUTPUT:
// A page containing a scriptlet now fails with
// "Scripting elements are disallowed here" at translation`]
    ),
    'jsp-directives': dv(
        [`<p>Directives act at translation time and produce no output themselves.</p><ul><li><b>page:</b> changes the generated class: <code>import</code> becomes import statements, <code>extends</code> changes the superclass, <code>session</code> toggles session creation, <code>contentType</code> sets the response header.</li><li><b>include:</b> the container reads the file and inserts its text before parsing, then translates one combined page.</li><li><b>taglib:</b> binds a prefix to a URI, resolved through <code>.tld</code> files in the application or jars.</li></ul>`,
            r`<%@ page import="java.util.*, java.time.LocalDate" %>
<%@ page contentType="text/html;charset=UTF-8" %>

// Generated class header (simplified):
// import java.util.*;
// import java.time.LocalDate;
// response.setContentType("text/html;charset=UTF-8");

// OUTPUT:
// Content-Type: text/html;charset=UTF-8`],
        [`<p>Useful page attributes:</p><ul><li><b>info, language, extends:</b> metadata and base class.</li><li><b>buffer, autoFlush:</b> output buffering.</li><li><b>isELIgnored:</b> turn dollar-brace evaluation off for a page.</li><li><b>isThreadSafe:</b> false was once used for single-thread model; it is deprecated and should not be used.</li><li><b>errorPage, isErrorPage:</b> error handling.</li><li><b>trimDirectiveWhitespaces:</b> removes blank lines.</li></ul>`,
            r`<%@ page errorPage="/errors/500.jsp" buffer="32kb" autoFlush="true" %>
<%@ page isELIgnored="false" trimDirectiveWhitespaces="true" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

// OUTPUT:
// Page uses a 32kb buffer, EL is active, and JSTL functions are available as fn:
// (Jakarta EE 10 URIs look like jakarta.tags.functions)`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Missing taglib:</b> tags print as plain text; declare the prefix.</li><li><b>Wrong URI for the server version:</b> javax JSTL and Jakarta JSTL URIs differ.</li><li><b>Variable clash with include:</b> a static include shares scope, so duplicate declarations fail to compile.</li><li><b>Changed include not visible:</b> some containers do not track dependencies of static includes; touch the host page.</li><li><b>Wrong encoding:</b> set <code>pageEncoding</code> as well as <code>contentType</code>.</li></ul>`,
            r`<%-- header.jspf --%>
<% int count = 1;
%>
<%-- main.jsp --%>
<%@ include file="header.jspf" %>
<% int count = 2;
%>

// OUTPUT:
// JasperException: Duplicate local variable count (the pages were merged into one method)`],
        [`<p>Tuning:</p><ul><li><b>Static include</b> for fixed headers and footers is cheapest at runtime.</li><li><b>Prelude and coda</b> avoid repeating directives.</li><li><b>session false</b> and <b>buffer</b> choices reduce memory.</li><li><b>Tag libraries</b> are cached after first parse; keep the <code>.tld</code> files in a jar for faster scanning, and skip unneeded jar scans with <code>tomcat.util.scan.StandardJarScanFilter</code>.</li></ul>`,
            r`<jsp-property-group>
    <url-pattern>*.jsp</url-pattern>
    <include-prelude>/WEB-INF/fragments/prelude.jspf</include-prelude>
    <include-coda>/WEB-INF/fragments/coda.jspf</include-coda>
</jsp-property-group>

// OUTPUT:
// Every page starts with the prelude (taglibs) and ends with the coda (scripts)`],
        [`<p>Scenario: a site layout.</p><ul><li><b>header.jspf and footer.jspf:</b> static includes.</li><li><b>menu.jsp:</b> dynamic, because it depends on the user.</li><li><b>taglibs.jspf:</b> prelude declaring JSTL.</li></ul>`,
            r`<%@ include file="/WEB-INF/fragments/header.jspf" %>
<jsp:include page="/WEB-INF/fragments/menu.jsp" />
<main>Content</main>
<%@ include file="/WEB-INF/fragments/footer.jspf" %>

// OUTPUT: (rendered order)
// header markup, menu for the current user, Content, footer markup`]
    ),
    'jsp-standard-action-tags': dv(
        [`<p>Actions are evaluated at request time.</p><ul><li><b>jsp:include:</b> becomes <code>JspRuntimeLibrary.include(request, response, "page", out, true)</code>, a <code>RequestDispatcher.include</code>.</li><li><b>jsp:forward:</b> becomes a <code>RequestDispatcher.forward</code> after clearing the buffer.</li><li><b>jsp:useBean:</b> looks the id up with <code>pageContext.getAttribute</code> in the scope and creates it when missing.</li><li><b>setProperty and getProperty:</b> call setters and getters using introspection.</li></ul>`,
            r`// JSP: <jsp:useBean id="cart" class="com.example.Cart" scope="session" />

// Generated (simplified)
Cart cart = (Cart) pageContext.getAttribute("cart", PageContext.SESSION_SCOPE);
if (cart == null) {
    cart = new Cart();
    pageContext.setAttribute("cart", cart, PageContext.SESSION_SCOPE);
}

// OUTPUT:
// The same Cart object is reused for the whole session`],
        [`<p>Action list and options:</p><ul><li><b>useBean:</b> <code>id</code>, <code>class</code> or <code>type</code>, <code>scope</code>; body runs only when the bean is newly created.</li><li><b>setProperty:</b> <code>param</code>, <code>value</code>, or <code>property="*"</code>.</li><li><b>include:</b> <code>page</code>, <code>flush</code>.</li><li><b>forward:</b> <code>page</code>.</li><li><b>param:</b> name and value for include and forward.</li><li><b>Others:</b> <code>jsp:plugin</code> (obsolete), <code>jsp:element</code>, <code>jsp:attribute</code>, <code>jsp:body</code>, <code>jsp:text</code>.</li></ul>`,
            r`<jsp:useBean id="prefs" class="com.example.Prefs" scope="session">
    <jsp:setProperty name="prefs" property="theme" value="dark" />
</jsp:useBean>
<jsp:forward page="/WEB-INF/views/home.jsp">
    <jsp:param name="from" value="actions" />
</jsp:forward>

// OUTPUT:
// theme is set only the first time (when the bean is created); home.jsp gets from=actions`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Bean without default constructor:</b> InstantiationException; add one.</li><li><b>Property type mismatch:</b> conversion errors on <code>property="*"</code>; validate in the controller.</li><li><b>Mass assignment risk:</b> <code>property="*"</code> binds any matching parameter such as an admin flag.</li><li><b>Relative page paths</b> in includes behave differently from forwards; use context-relative paths starting with a slash.</li><li><b>Forward after output:</b> IllegalStateException.</li><li><b>Code after forward:</b> still executes unless you return; keep forward last.</li></ul>`,
            r`// Bean
public class User {
    private String name;
    private boolean admin;                 // dangerous with property="*"
    public String getName() { return name; }
    public void setName(String n) { name = n; }
    public boolean isAdmin() { return admin; }
    public void setAdmin(boolean a) { admin = a; }
}
// GET ?name=x&admin=true makes the user an admin when property="*" is used.

// OUTPUT:
// admin=true is bound without any check (use explicit property names instead)`],
        [`<p>Performance:</p><ul><li><b>jsp:include</b> costs a dispatch and a separate servlet call each time, so avoid it in tight loops.</li><li><b>Cache</b> expensive fragments in the application scope.</li><li><b>Forward</b> is cheaper than redirect because it avoids an extra browser round trip.</li><li><b>Bean scope:</b> use the narrowest scope; session beans consume server memory per user.</li></ul>`,
            r`<%-- avoid: 500 dynamic includes in one page --%>
<%-- better: a single JSTL loop in the page, or a tag file --%>

// OUTPUT: (varies)
// 500 jsp:include calls: noticeably slower than one loop that renders the rows directly`],
        [`<p>Scenario: a legacy form handler using actions, and its modern replacement.</p><ul><li><b>Legacy:</b> useBean plus setProperty binds a form to a bean.</li><li><b>Modern:</b> a servlet validates and builds the bean, the JSP reads it with EL.</li></ul>`,
            r`<jsp:useBean id="form" class="com.example.SignupForm" scope="request" />
<jsp:setProperty name="form" property="email" />
<jsp:setProperty name="form" property="plan" />
<jsp:forward page="/WEB-INF/views/confirm.jsp" />

// OUTPUT: (POST email=a@b.com&plan=pro)
// confirm.jsp renders the form bean with email a@b.com and plan pro (HTTP 200)`]
    )
};
