// JSP-Servlet extras, part 1: web basics, HTTP, Tomcat, JSP intro, servlet lifecycle.
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jsp1Extras: Record<string, Extra> = {
    'web-architecture-client-server': x(
        ['<b>Client</b> (browser or app) sends a request; the <b>server</b> processes it and returns a response, and the two talk over a network using a protocol.',
            '<b>Tiers</b>: presentation (HTML in the browser), business logic (servlets, services) and data (database) are kept in separate layers.',
            '<b>Stateless web</b>: the server does not remember you between requests unless you use cookies or a session.'],
        ['<b>Thin and thick client</b>: a browser page is a thin client; a single-page app moves more logic into the browser and calls JSON APIs.',
            '<b>Scaling</b>: put a load balancer in front of several identical app servers; keep them stateless or share session data.',
            '<b>Static versus dynamic</b>: static files (images, CSS) can be served by a web server or CDN; dynamic pages need a servlet container.'],
        ['<b>Reverse proxy</b>: Nginx or a cloud gateway terminates TLS, caches, compresses and forwards to Tomcat on a private port.',
            '<b>Session strategy</b>: sticky sessions, a shared store such as Redis, or stateless tokens (JWT) decide how well you scale out.',
            '<b>Failure thinking</b>: every network call can time out, so set timeouts, retries and health checks at each tier.'],
        [['F', 'What is the client-server model?', 'A client requests a service and a server provides it. The browser is the client and Tomcat is a typical server.'],
            ['F', 'What is a 3-tier architecture?', 'Presentation, business logic and data layers that can change and scale independently.'],
            ['M', 'Why is HTTP called stateless?', 'Each request is independent and the server keeps no memory of earlier ones. Sessions and cookies add state on top.'],
            ['M', 'Why put a reverse proxy before Tomcat?', 'It handles TLS, static files, compression and load balancing, and hides the app server from the internet.'],
            ['S', 'How do you scale a session-based web app horizontally?', 'Use sticky sessions, replicate or externalize sessions (Redis, database), or move to stateless tokens.'],
            ['S', 'Where do you put caching in this architecture?', 'At several levels: browser cache headers, CDN, reverse proxy, application cache and database query cache.']],
        [['Simple client in Java: talk to a server with a raw socket.',
            r`import java.io.*;
import java.net.Socket;

public class RawClient {
    public static void main(String[] args) throws IOException {
        try (Socket s = new Socket("example.com", 80)) {
            PrintWriter out = new PrintWriter(s.getOutputStream(), true);
            out.print("GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n");
            out.flush();
            BufferedReader in = new BufferedReader(
                new InputStreamReader(s.getInputStream()));
            System.out.println(in.readLine());      // status line only
        }
    }
}

// OUTPUT: (varies)
// HTTP/1.1 200 OK`],
            ['Tiny server: one tier answers every client.',
                r`import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class MiniServer {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/hello", ex -> {
            byte[] body = "Hello client".getBytes();
            ex.sendResponseHeaders(200, body.length);
            ex.getResponseBody().write(body);
            ex.close();
        });
        server.start();
        System.out.println("listening on 8080");
    }
}

// OUTPUT:
// listening on 8080`]],
        [['Layered code: servlet to service to DAO.',
            r`// Presentation: servlet only reads input and chooses the view
String id = request.getParameter("id");
Order o = orderService.find(Long.parseLong(id));   // business tier
request.setAttribute("order", o);
request.getRequestDispatcher("/order.jsp").forward(request, response);

// Business tier: rules
public Order find(long id) { return orderDao.findById(id); }

// Data tier: SQL only
public Order findById(long id) { /* SELECT ... WHERE id = ? */ return null; }

// OUTPUT:
// browser -> servlet -> service -> dao -> database, and the response flows back`],
            ['Inspect where a request goes with curl.',
                r`curl -v http://localhost:8080/shop/products

// OUTPUT: (varies)
// * Connected to localhost (127.0.0.1) port 8080
// > GET /shop/products HTTP/1.1
// > Host: localhost:8080
// < HTTP/1.1 200
// < Content-Type: text/html;charset=UTF-8`]]
    ),

    'http-https-basics': x(
        ['<b>HTTP</b> is a text request-response protocol on top of TCP; default port is <code>80</code> and for HTTPS it is <code>443</code>.',
            '<b>Methods</b>: <code>GET</code> reads, <code>POST</code> creates or submits, <code>PUT</code> replaces, <code>DELETE</code> removes.',
            '<b>HTTPS</b> is HTTP inside TLS, so the traffic is encrypted and the server is verified by a certificate.'],
        ['<b>Status codes</b>: 2xx success, 3xx redirect, 4xx client error (<code>404</code>), 5xx server error (<code>500</code>).',
            '<b>Safe and idempotent</b>: <code>GET</code> is safe, and <code>PUT</code> and <code>DELETE</code> are idempotent, so repeating them gives the same result.',
            '<b>Headers</b> carry metadata such as <code>Content-Type</code>, <code>Cookie</code>, <code>Cache-Control</code> and <code>Authorization</code>.'],
        ['<b>TLS handshake</b>: client and server agree on a cipher, the server proves its identity with a certificate chain, and session keys are derived.',
            '<b>HTTP versions</b>: HTTP/1.1 uses keep-alive; HTTP/2 multiplexes streams over one connection; HTTP/3 uses QUIC over UDP.',
            '<b>Security headers</b>: <code>Strict-Transport-Security</code>, <code>Secure</code> and <code>HttpOnly</code> cookie flags reduce attacks.'],
        [['F', 'What is the difference between HTTP and HTTPS?', 'HTTPS adds TLS encryption and server authentication to HTTP.'],
            ['F', 'GET versus POST?', 'GET puts data in the URL and is for reading; POST sends data in the body and is for changes.'],
            ['M', 'What does status 302 mean?', 'A temporary redirect: the client should request the URL in the Location header.'],
            ['M', 'What is idempotency?', 'Repeating the request has the same effect as sending it once. PUT and DELETE are idempotent, POST is not.'],
            ['S', 'How does the TLS handshake protect a session?', 'The certificate proves identity, a key exchange creates shared session keys, and then data is encrypted and integrity-checked.'],
            ['S', 'Why use HSTS?', 'It tells browsers to always use HTTPS for the domain, which blocks downgrade and stripping attacks.']],
        [['A raw HTTP request and response.',
            r`GET /shop/hello HTTP/1.1
Host: localhost:8080
Accept: text/html

// OUTPUT:
// HTTP/1.1 200
// Content-Type: text/html;charset=UTF-8
// Content-Length: 18
//
// <h1>Hello Shop</h1>`],
            ['Send a POST with curl.',
                r`curl -i -X POST -d "name=Asha&city=Pune" http://localhost:8080/shop/register

// OUTPUT: (varies)
// HTTP/1.1 302
// Location: http://localhost:8080/shop/welcome.jsp
// Content-Length: 0`]],
        [['Read request line and headers in a servlet.',
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setContentType("text/plain");
    resp.getWriter().println(req.getMethod() + " " + req.getRequestURI());
    resp.getWriter().println("Host: " + req.getHeader("Host"));
    resp.getWriter().println("Secure: " + req.isSecure());
}

// OUTPUT: (curl http://localhost:8080/shop/info)
// GET /shop/info
// Host: localhost:8080
// Secure: false`],
            ['Redirect HTTP to HTTPS.',
                r`String url = req.getRequestURL().toString();
if (!req.isSecure()) {
    resp.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);   // 301
    resp.setHeader("Location", url.replaceFirst("^http:", "https:"));
    return;
}

// OUTPUT:
// HTTP/1.1 301
// Location: https://shop.example.com/login`]]
    ),

    'http-request-response-cycle': x(
        ['<b>Cycle</b>: the client opens a connection, sends a request line, headers and optional body, and the server replies with a status line, headers and body.',
            '<b>Request parts</b>: method, URL (path and query string), HTTP version, headers and body.',
            '<b>Response parts</b>: status code, headers (for example <code>Content-Type</code>) and the body.'],
        ['<b>Servlet view</b>: the container turns the raw request into <code>HttpServletRequest</code> and gives you an empty <code>HttpServletResponse</code> to fill.',
            '<b>Parameters</b>: <code>getParameter</code> reads query-string and form data; JSON bodies you must read yourself from <code>getReader()</code>.',
            '<b>Committed response</b>: once headers are sent you cannot change the status or redirect; this causes <code>IllegalStateException</code>.'],
        ['<b>Threading</b>: the container takes a thread from a pool for each request, so servlets must be thread-safe.',
            '<b>Keep-alive</b> reuses a TCP connection for many requests, which saves handshake time.',
            '<b>Timeouts and buffering</b>: the response is buffered (about 8 KB by default in many containers); flush explicitly for streaming.'],
        [['F', 'What happens when you type a URL and press Enter?', 'DNS finds the IP, a TCP (and TLS) connection opens, the browser sends a request and the server returns a response that is rendered.'],
            ['F', 'What is in an HTTP response?', 'A status line, headers and an optional body.'],
            ['M', 'Forward versus redirect?', 'Forward happens inside the server in the same request; redirect sends 302 and the browser makes a new request, so the URL changes.'],
            ['M', 'Where does form data go in GET and POST?', 'GET puts it in the query string; POST puts it in the body, and getParameter reads both.'],
            ['S', 'Why can setStatus fail after writing output?', 'The response is committed once buffer content is flushed, and headers can no longer change.'],
            ['S', 'How do you diagnose a slow request?', 'Check timing per phase (DNS, connect, TLS, wait, download) with browser tools or curl -w, then server access logs.']],
        [['Raw cycle with a form post.',
            r`POST /shop/login HTTP/1.1
Host: localhost:8080
Content-Type: application/x-www-form-urlencoded
Content-Length: 25

user=asha&password=secret

// OUTPUT:
// HTTP/1.1 200
// Set-Cookie: JSESSIONID=3F2A9C...; Path=/shop; HttpOnly
// Content-Type: text/html;charset=UTF-8
//
// <p>Welcome asha</p>`],
            ['Timing phases with curl.',
                r`curl -s -o /dev/null -w "dns=%{time_namelookup} connect=%{time_connect} total=%{time_total}\n" http://localhost:8080/shop/

// OUTPUT: (varies)
// dns=0.001 connect=0.002 total=0.045`]],
        [['Forward versus redirect.',
            r`// forward: same request, URL stays /shop/go
req.getRequestDispatcher("/result.jsp").forward(req, resp);

// redirect: 302 and the browser calls the new URL
resp.sendRedirect(req.getContextPath() + "/result.jsp");

// OUTPUT: (curl -i for the redirect)
// HTTP/1.1 302
// Location: http://localhost:8080/shop/result.jsp`],
            ['Log every request phase.',
                r`long start = System.nanoTime();
chain.doFilter(req, resp);                       // inside a Filter
long ms = (System.nanoTime() - start) / 1_000_000;
HttpServletRequest h = (HttpServletRequest) req;
System.out.println(h.getMethod() + " " + h.getRequestURI() + " took " + ms + " ms");

// OUTPUT: (varies)
// GET /shop/products took 12 ms`]]
    ),

    'web-servers-tomcat-glassfish': x(
        ['<b>Web server</b> serves static files over HTTP; an <b>application server</b> also runs Java code. Tomcat is a servlet container; GlassFish is a full Jakarta EE server.',
            '<b>Folders</b> in Tomcat: <code>bin</code> (start scripts), <code>conf</code> (<code>server.xml</code>), <code>webapps</code> (apps) and <code>logs</code>.',
            '<b>Default port</b> of Tomcat is <code>8080</code>; the port is set in <code>conf/server.xml</code> on the Connector element.'],
        ['<b>Deploy</b> by copying a <code>.war</code> file into <code>webapps</code>; Tomcat unpacks it and the context path is the file name.',
            '<b>Components</b>: Server, Service, Connector, Engine, Host and Context are nested in <code>server.xml</code>.',
            '<b>Logs</b>: <code>catalina.out</code> holds startup messages and stack traces; access logs record each request.'],
        ['<b>Tuning</b>: set <code>maxThreads</code>, <code>acceptCount</code> and JVM heap flags (<code>-Xms</code>, <code>-Xmx</code>) based on load tests.',
            '<b>Versions</b>: Tomcat 9 uses <code>javax.servlet</code>; Tomcat 10 and later use <code>jakarta.servlet</code>, so migrate imports.',
            '<b>Production</b>: run as a non-root user, remove sample apps, put TLS at a proxy or a Connector and keep the manager app locked.'],
        [['F', 'Is Tomcat a web server or an application server?', 'A servlet and JSP container, often called a lightweight web server; it does not include full EJB support.'],
            ['F', 'How do you deploy an application on Tomcat?', 'Copy the WAR file into webapps or use the manager application.'],
            ['M', 'What does the Connector do?', 'It listens on a port and protocol (HTTP or AJP) and hands requests to the Engine.'],
            ['M', 'Why did my code stop compiling on Tomcat 10?', 'Packages moved from javax.servlet to jakarta.servlet.'],
            ['S', 'How do you size the thread pool?', 'Start from expected concurrency and request time, then load test; too many threads cause memory pressure and context switching.'],
            ['S', 'Tomcat versus GlassFish for a new project?', 'Tomcat for simple servlet apps (often with Spring); GlassFish or similar when you need the full Jakarta EE stack such as EJB and JMS.']],
        [['Start and stop Tomcat on Windows and Linux.',
            r`# Windows
bin\startup.bat
bin\shutdown.bat
# Linux
./bin/catalina.sh start
tail -f logs/catalina.out

// OUTPUT: (varies)
// INFO [main] org.apache.catalina.startup.Catalina.start Server startup in [820] milliseconds`],
            ['Change the HTTP port in server.xml.',
                r`<Connector port="9090" protocol="HTTP/1.1"
           connectionTimeout="20000" redirectPort="8443" />

// OUTPUT:
// after restart: http://localhost:9090/ shows the Tomcat home page`]],
        [['Minimal web.xml and WAR layout.',
            r`shop/
  index.jsp
  WEB-INF/
    web.xml
    classes/com/acme/HelloServlet.class
    lib/mysql-connector.jar

// OUTPUT:
// jar cvf shop.war -C shop .   ->  shop.war copied to webapps/ is served at /shop`],
            ['Tune the connector thread pool.',
                r`<Connector port="8080" protocol="HTTP/1.1"
           maxThreads="200" minSpareThreads="10" acceptCount="100"
           connectionTimeout="20000" compression="on" />

// OUTPUT:
// up to 200 requests run at once; 100 more wait in the queue; the rest are refused`]]
    ),

    'jsp-intro': x(
        ['<b>JSP</b> (JavaServer Pages) lets you write HTML with embedded Java, which is easier than printing HTML from a servlet.',
            '<b>Elements</b>: scriptlet <code>&lt;% ... %&gt;</code>, expression <code>&lt;%= ... %&gt;</code>, declaration <code>&lt;%! ... %&gt;</code> and directive <code>&lt;%@ ... %&gt;</code>.',
            '<b>Translation</b>: the container converts a JSP into a servlet class, compiles it on first request and then reuses it.'],
        ['<b>Implicit objects</b> such as <code>request</code>, <code>response</code>, <code>session</code>, <code>out</code> and <code>application</code> are available without declaring them.',
            '<b>MVC</b>: servlet does the logic, JSP only shows data; use <code>forward</code> with request attributes.',
            '<b>JSTL and EL</b> replace scriptlets with tags and expressions, which keeps pages clean.'],
        ['<b>First-request cost</b>: translation and compile make the first hit slow, so precompile JSPs (Jasper) in production.',
            '<b>Thread safety</b>: a JSP is one servlet instance, so declaration variables are shared by all requests.',
            '<b>Security</b>: escape output (<code>c:out</code>, <code>fn:escapeXml</code>) to prevent XSS and keep JSPs under <code>WEB-INF</code> when they must not be called directly.'],
        [['F', 'What is JSP?', 'A server-side page technology that mixes HTML and Java and is compiled to a servlet.'],
            ['F', 'Name some JSP implicit objects.', 'request, response, out, session, application, config, pageContext, page and exception.'],
            ['M', 'JSP versus servlet?', 'A servlet is Java with HTML inside; a JSP is HTML with Java inside. Use servlets for control and JSPs for the view.'],
            ['M', 'Include directive versus include action?', 'The directive merges the file at translation time; the action includes the output at request time.'],
            ['S', 'Why avoid scriptlets?', 'They mix logic with markup, are hard to test and can cause XSS; use EL and JSTL.'],
            ['S', 'How do you remove first-request latency?', 'Precompile JSPs at build time with the Jasper compiler or warm the application after deploy.']],
        [['A first JSP.',
            r`<%@ page contentType="text/html;charset=UTF-8" %>
<html><body>
<h2>Hello JSP</h2>
<% String name = request.getParameter("name"); %>
<p>Welcome, <%= name == null ? "guest" : name %></p>
</body></html>

// OUTPUT: (GET /shop/hello.jsp?name=Asha)
// <h2>Hello JSP</h2>
// <p>Welcome, Asha</p>`],
            ['Page directive and include.',
                r`<%@ page import="java.util.Date" errorPage="error.jsp" %>
<%@ include file="header.jspf" %>
<p>Now: <%= new Date() %></p>

// OUTPUT: (varies)
// <header>...</header>
// <p>Now: Wed Oct 07 10:15:00 IST 2026</p>`]],
        [['Controller forwards to a view.',
            r`// Servlet
req.setAttribute("items", productService.all());
req.getRequestDispatcher("/WEB-INF/views/list.jsp").forward(req, resp);

// list.jsp (JSTL)
// <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
// <c:forEach var="p" items="items"> ... </c:forEach>

// OUTPUT:
// the list page renders products with no Java in the JSP`],
            ['Shared declaration variable is not thread safe.',
                r`<%! int hits = 0; %>
<% hits++; %>
<p>Hits: <%= hits %></p>

// OUTPUT: (varies; two parallel requests can race and lose updates)
// Hits: 1
// Hits: 2`]]
    ),

    'servlet-api-lifecycle': x(
        ['<b>Lifecycle</b> methods: <code>init()</code> once, <code>service()</code> for every request, and <code>destroy()</code> once at the end.',
            '<b>Packages</b>: <code>jakarta.servlet</code> (generic) and <code>jakarta.servlet.http</code> (HTTP); older apps use <code>javax.servlet</code>.',
            '<b>HttpServlet</b> routes <code>service()</code> to <code>doGet</code>, <code>doPost</code> and the other do-methods.'],
        ['<b>One instance</b> per servlet declaration; many threads call <code>service()</code> on it at the same time.',
            '<b>Mapping</b> by <code>@WebServlet("/path")</code> or by <code>web.xml</code>; <code>load-on-startup</code> creates it at deploy time.',
            '<b>Config</b>: <code>ServletConfig</code> gives init parameters of one servlet; <code>ServletContext</code> is shared by the whole app.'],
        ['<b>Thread safety</b>: do not keep per-request data in instance fields; use local variables and request attributes.',
            '<b>Cleanup</b>: close pools and executors in <code>destroy()</code>, or better in a <code>ServletContextListener</code>.',
            '<b>Async</b>: <code>startAsync()</code> frees the container thread during slow work such as remote calls.'],
        [['F', 'Explain the servlet life cycle.', 'The container loads the class, calls init once, calls service for each request and calls destroy before unloading.'],
            ['F', 'Which method handles GET?', 'doGet(HttpServletRequest, HttpServletResponse).'],
            ['M', 'How many servlet objects exist?', 'One per declaration, shared by all request threads.'],
            ['M', 'What does load-on-startup do?', 'It creates and initializes the servlet at deploy time instead of at the first request.'],
            ['S', 'Why are instance fields in servlets dangerous?', 'Threads share them, so concurrent requests overwrite each other; use locals, or synchronize shared state.'],
            ['S', 'When do you use async servlets?', 'For long waits (remote calls, events) so that container threads are not blocked.']],
        [['Lifecycle in action.',
            r`@WebServlet(urlPatterns = "/life", loadOnStartup = 1)
public class LifeServlet extends HttpServlet {
    @Override public void init() { System.out.println("init"); }
    @Override protected void doGet(HttpServletRequest rq, HttpServletResponse rs)
            throws IOException {
        System.out.println("doGet on " + Thread.currentThread().getName());
        rs.getWriter().println("ok");
    }
    @Override public void destroy() { System.out.println("destroy"); }
}

// OUTPUT: (varies)
// init
// doGet on http-nio-8080-exec-1
// destroy`],
            ['web.xml mapping with init parameter.',
                r`<servlet>
  <servlet-name>life</servlet-name>
  <servlet-class>com.acme.LifeServlet</servlet-class>
  <init-param><param-name>greeting</param-name><param-value>Hi</param-value></init-param>
</servlet>
<servlet-mapping>
  <servlet-name>life</servlet-name><url-pattern>/life</url-pattern>
</servlet-mapping>

// OUTPUT:
// getServletConfig().getInitParameter("greeting") returns Hi`]],
        [['Thread-unsafe field.',
            r`public class BadServlet extends HttpServlet {
    private String user;                          // shared by all threads
    protected void doGet(HttpServletRequest rq, HttpServletResponse rs)
            throws IOException {
        user = rq.getParameter("u");              // BUG
        rs.getWriter().println("Hello " + user);  // may print another user
    }
}

// OUTPUT: (varies under load)
// Hello bob   (printed to the request that sent u=asha)`],
            ['Count requests safely.',
                r`private final AtomicLong count = new AtomicLong();
protected void doGet(HttpServletRequest rq, HttpServletResponse rs)
        throws IOException {
    rs.getWriter().println("request #" + count.incrementAndGet());
}

// OUTPUT:
// request #1
// request #2`]]
    )
};

export const jsp1Deep: Record<string, Deep> = {
    'web-architecture-client-server': dv(
        [`<p>A request crosses several layers before your code runs.</p><ul><li><b>DNS:</b> the name is resolved to an IP address and cached.</li><li><b>TCP:</b> a three-way handshake opens the connection; TLS adds more round trips.</li><li><b>Server:</b> a connector thread reads bytes and the container builds request objects.</li><li><b>Pipeline:</b> filters, then the servlet, then the response travels back on the same connection.</li><li><b>Keep-alive:</b> the connection stays open for the next request.</li></ul>`,
            r`curl -v --http1.1 http://localhost:8080/shop/ -o /dev/null

// OUTPUT: (varies)
// * Trying 127.0.0.1:8080...
// * Connected to localhost (127.0.0.1) port 8080
// > GET /shop/ HTTP/1.1
// < HTTP/1.1 200
// < Keep-Alive: timeout=20
// * Connection #0 to host localhost left intact`],
        [`<p>Common deployment shapes:</p><ul><li><b>Single server:</b> browser to Tomcat to database; simple, one point of failure.</li><li><b>Reverse proxy:</b> Nginx in front for TLS and static files.</li><li><b>Load balanced:</b> several Tomcat nodes behind a balancer.</li><li><b>Microservices:</b> small services each with its own database, called over HTTP.</li><li><b>CDN:</b> static content served near the user.</li></ul>`,
            r`upstream shop_app {
    server 10.0.0.11:8080;
    server 10.0.0.12:8080;
}
server {
    listen 443 ssl;
    location /shop/ { proxy_pass http://shop_app; }
    location /static/ { root /var/www; expires 7d; }
}

// OUTPUT:
// requests to /shop/ alternate between the two Tomcat nodes; /static/ is served by Nginx`],
        [`<p>Typical architecture mistakes:</p><ul><li><b>Business logic in JSP:</b> move it to services.</li><li><b>Storing big objects in the session:</b> memory grows per user; keep ids only.</li><li><b>No timeouts:</b> a slow database blocks all threads; set connection and read timeouts.</li><li><b>Trusting the client:</b> always validate on the server, since the browser can be bypassed.</li><li><b>Chatty calls:</b> many small remote calls instead of one coarse call.</li></ul>`,
            r`// WRONG: trusting a hidden field for the price
double price = Double.parseDouble(req.getParameter("price"));

// RIGHT: look up the price on the server
double price = productDao.findById(id).getPrice();

// OUTPUT:
// tampering with the hidden form field no longer changes what the customer pays`],
        [`<p>Performance levers by tier:</p><ul><li><b>Browser:</b> cache headers, compression, fewer requests.</li><li><b>Edge:</b> CDN and HTTP/2.</li><li><b>App:</b> thread pool size, connection pool, avoiding blocking calls.</li><li><b>Data:</b> indexes, caching of hot reads.</li><li><b>Measure first:</b> use percentiles (p95, p99), not averages.</li></ul>`,
            r`curl -s -o /dev/null -H "Accept-Encoding: gzip" -D - http://localhost:8080/shop/app.js

// OUTPUT: (varies)
// HTTP/1.1 200
// Cache-Control: public, max-age=604800
// Content-Encoding: gzip
// Content-Length: 18342`],
        [`<p>Scenario: a shop slows down on sale days. Fixes by tier:</p><ul><li>Static images move to a CDN.</li><li>Tomcat nodes scale from one to three behind a balancer, with sessions in Redis.</li><li>Product reads are cached for 60 seconds.</li><li>A health endpoint lets the balancer remove a sick node automatically.</li></ul>`,
            r`@WebServlet("/health")
public class HealthServlet extends HttpServlet {
    protected void doGet(HttpServletRequest rq, HttpServletResponse rs)
            throws IOException {
        rs.setContentType("application/json");
        rs.getWriter().print("{\"status\":\"UP\"}");
    }
}

// OUTPUT:
// GET /health -> 200 {"status":"UP"}`]
    ),

    'http-https-basics': dv(
        [`<p>HTTP/1.1 is plain text on a TCP stream, and TLS wraps it for HTTPS.</p><ul><li><b>Framing:</b> the body length comes from <code>Content-Length</code> or chunked encoding.</li><li><b>Handshake:</b> ClientHello, ServerHello with certificate, key exchange, then encrypted data.</li><li><b>Certificate:</b> signed by a certificate authority; the client checks the chain and host name.</li><li><b>Keep-alive:</b> one connection serves many requests.</li></ul>`,
            r`openssl s_client -connect example.com:443 -brief </dev/null

// OUTPUT: (varies)
// CONNECTION ESTABLISHED
// Protocol version: TLSv1.3
// Ciphersuite: TLS_AES_256_GCM_SHA384
// Verification: OK`],
        [`<p>Methods and status codes to know:</p><ul><li><b>GET, HEAD:</b> safe reads.</li><li><b>POST:</b> create or run an action.</li><li><b>PUT, PATCH:</b> replace or partly update.</li><li><b>DELETE:</b> remove.</li><li><b>200, 201, 204:</b> success variants.</li><li><b>301, 302, 304:</b> redirect and not-modified.</li><li><b>400, 401, 403, 404, 409:</b> client problems.</li><li><b>500, 502, 503:</b> server problems.</li></ul>`,
            r`curl -i -X DELETE http://localhost:8080/shop/api/items/42
curl -i http://localhost:8080/shop/api/missing

// OUTPUT: (varies)
// HTTP/1.1 204
//
// HTTP/1.1 404
// Content-Type: text/html;charset=utf-8`],
        [`<p>Common mistakes:</p><ul><li><b>Sensitive data in GET URLs:</b> they appear in logs and history; use POST.</li><li><b>Changing data with GET:</b> crawlers and prefetch can trigger it.</li><li><b>Mixed content:</b> an HTTPS page loading HTTP scripts is blocked.</li><li><b>Missing Secure flag:</b> a session cookie can leak over HTTP.</li><li><b>Ignoring character encoding:</b> call <code>setCharacterEncoding("UTF-8")</code> before reading parameters.</li></ul>`,
            r`Cookie c = new Cookie("JSESSIONID", id);
c.setSecure(true);       // only over HTTPS
c.setHttpOnly(true);     // not readable by JavaScript
resp.addCookie(c);

// OUTPUT:
// Set-Cookie: JSESSIONID=ab12...; Secure; HttpOnly`],
        [`<p>Tuning HTTP:</p><ul><li><b>Cache validators:</b> <code>ETag</code> and <code>Last-Modified</code> return cheap 304 answers.</li><li><b>Compression:</b> gzip text responses.</li><li><b>HTTP/2:</b> fewer connections and header compression.</li><li><b>TLS session resumption</b> cuts handshake cost.</li></ul>`,
            r`curl -i -H "If-None-Match: \"v7\"" http://localhost:8080/shop/logo.png

// OUTPUT: (varies)
// HTTP/1.1 304
// ETag: "v7"
// Cache-Control: max-age=86400`],
        [`<p>Scenario: moving a site to HTTPS. Steps:</p><ul><li>Get a certificate and configure TLS at the proxy or Connector.</li><li>Redirect all HTTP traffic with 301.</li><li>Add the HSTS header.</li><li>Fix mixed content and mark cookies Secure.</li></ul>`,
            r`<Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"
           SSLEnabled="true" scheme="https" secure="true">
  <SSLHostConfig>
    <Certificate certificateKeystoreFile="conf/keystore.p12"
                 certificateKeystorePassword="changeit" type="RSA" />
  </SSLHostConfig>
</Connector>

// OUTPUT:
// https://localhost:8443/shop/ serves the app over TLS`]
    ),

    'http-request-response-cycle': dv(
        [`<p>Inside the container, one request goes through fixed stages.</p><ul><li><b>Accept:</b> the connector accepts the socket and a worker thread parses the request.</li><li><b>Map:</b> host, context and servlet are chosen from the URL.</li><li><b>Filter chain:</b> filters run before and after the servlet.</li><li><b>Service:</b> <code>service()</code> calls <code>doGet</code> or <code>doPost</code>.</li><li><b>Commit:</b> the response is flushed and the thread returns to the pool.</li></ul>`,
            r`protected void doGet(HttpServletRequest rq, HttpServletResponse rs)
        throws IOException {
    System.out.println("thread=" + Thread.currentThread().getName());
    System.out.println("uri=" + rq.getRequestURI() + " query=" + rq.getQueryString());
    rs.getWriter().println("done");
}

// OUTPUT: (varies; GET /shop/find?q=pen)
// thread=http-nio-8080-exec-3
// uri=/shop/find query=q=pen`],
        [`<p>Ways to write the response:</p><ul><li><b>getWriter():</b> text.</li><li><b>getOutputStream():</b> binary data; you cannot use both in one response.</li><li><b>setStatus, sendError:</b> status and error page.</li><li><b>sendRedirect:</b> 302.</li><li><b>Headers:</b> <code>setHeader</code>, <code>addHeader</code>.</li></ul>`,
            r`resp.setContentType("application/json;charset=UTF-8");
resp.setStatus(HttpServletResponse.SC_CREATED);          // 201
resp.setHeader("Location", "/shop/api/items/43");
resp.getWriter().write("{\"id\":43}");

// OUTPUT:
// HTTP/1.1 201
// Location: /shop/api/items/43
// {"id":43}`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Forward after commit:</b> causes <code>IllegalStateException</code>; call <code>return</code> after redirect or forward.</li><li><b>Reading POST body twice:</b> the stream can be read only once.</li><li><b>Encoding:</b> set UTF-8 before reading parameters.</li><li><b>Duplicate form submit:</b> use the post-redirect-get pattern.</li></ul>`,
            r`protected void doPost(HttpServletRequest rq, HttpServletResponse rs)
        throws IOException {
    orderService.save(rq.getParameter("item"));
    rs.sendRedirect(rq.getContextPath() + "/thanks");   // PRG: refresh is safe
    return;
}

// OUTPUT:
// POST /shop/order -> 302 Location: /shop/thanks -> GET /shop/thanks 200`],
        [`<p>Performance points:</p><ul><li><b>Keep handlers short:</b> a busy thread is not free for other requests.</li><li><b>Stream big responses</b> instead of building them in memory.</li><li><b>Pool connections</b> to the database.</li><li><b>Measure</b> with access log time fields.</li></ul>`,
            r`<Valve className="org.apache.catalina.valves.AccessLogValve"
       directory="logs" prefix="access" suffix=".log"
       pattern="%h %m %U %s %b %D" />

// OUTPUT: (varies; %D is time in milliseconds)
// 127.0.0.1 GET /shop/products 200 5120 14`],
        [`<p>Scenario: a report page times out. Investigation:</p><ul><li>Access log shows 30 second requests.</li><li>Thread dump shows threads waiting on the database.</li><li>Fix: add a query index, a timeout, and run the export asynchronously.</li></ul>`,
            r`jstack -l <pid> | grep -A5 "http-nio-8080-exec"

// OUTPUT: (varies)
// "http-nio-8080-exec-7" #52 daemon prio=5 WAITING
//    at com.mysql.cj.protocol.read(...)
//    at com.acme.ReportDao.load(ReportDao.java:41)`]
    ),

    'web-servers-tomcat-glassfish': dv(
        [`<p>Tomcat is built from nested components.</p><ul><li><b>Server and Service:</b> the top of the tree.</li><li><b>Connector:</b> protocol handling (HTTP, AJP), with a thread pool.</li><li><b>Engine, Host:</b> virtual host routing.</li><li><b>Context:</b> one web application with its own class loader.</li><li><b>Wrapper:</b> one servlet.</li><li><b>Jasper:</b> the JSP compiler.</li></ul>`,
            r`<Server port="8005" shutdown="SHUTDOWN">
  <Service name="Catalina">
    <Connector port="8080" protocol="HTTP/1.1" />
    <Engine name="Catalina" defaultHost="localhost">
      <Host name="localhost" appBase="webapps" autoDeploy="true" />
    </Engine>
  </Service>
</Server>

// OUTPUT:
// Server startup: webapps/shop.war is deployed as context /shop`],
        [`<p>Deployment options:</p><ul><li><b>WAR in webapps:</b> easiest.</li><li><b>Context XML file:</b> in <code>conf/Catalina/localhost</code>, to set a path or resources.</li><li><b>Manager app:</b> upload or reload remotely.</li><li><b>Embedded Tomcat:</b> a Java main starts the server (Spring Boot does this).</li><li><b>GlassFish:</b> <code>asadmin deploy shop.war</code>.</li></ul>`,
            r`asadmin deploy --contextroot shop target/shop.war
asadmin list-applications

// OUTPUT: (varies)
// Application deployed with name shop.
// shop <web>`],
        [`<p>Common problems:</p><ul><li><b>Port already in use:</b> change the port or stop the other process.</li><li><b>404 after deploy:</b> wrong context path or missing class; read <code>catalina.out</code>.</li><li><b>ClassNotFoundException servlet:</b> javax versus jakarta mismatch.</li><li><b>JAVA_HOME not set:</b> Tomcat will not start.</li><li><b>OutOfMemoryError:</b> raise <code>-Xmx</code> or fix the leak.</li></ul>`,
            r`netstat -ano | findstr :8080
taskkill /PID 4321 /F

// OUTPUT: (varies)
// TCP 0.0.0.0:8080 0.0.0.0:0 LISTENING 4321
// SUCCESS: The process with PID 4321 has been terminated.`],
        [`<p>Tuning checklist:</p><ul><li><b>JVM:</b> set heap with <code>-Xms</code> and <code>-Xmx</code> equal, choose G1.</li><li><b>Threads:</b> <code>maxThreads</code> from load test results.</li><li><b>Compression and keep-alive:</b> enable.</li><li><b>Logging:</b> avoid debug logging in production.</li><li><b>JSP:</b> precompile and disable development mode.</li></ul>`,
            r`# bin/setenv.sh
export CATALINA_OPTS="-Xms1g -Xmx1g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError"

// OUTPUT: (varies)
// Using CATALINA_OPTS:   -Xms1g -Xmx1g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError`],
        [`<p>Scenario: team moves from Tomcat 9 to 10.1. Steps:</p><ul><li>Replace <code>javax.servlet</code> imports with <code>jakarta.servlet</code>.</li><li>Upgrade libraries (JSTL, Spring) to Jakarta versions.</li><li>Or use the Tomcat migration tool for a quick WAR conversion.</li></ul>`,
            r`java -jar jakartaee-migration-1.0.8-shaded.jar shop-old.war shop-new.war

// OUTPUT: (varies)
// Migration process completed successfully
// shop-new.war uses jakarta.servlet.* packages`]
    ),

    'jsp-intro': dv(
        [`<p>A JSP is translated and compiled once, then runs as a servlet.</p><ul><li><b>Translate:</b> <code>hello.jsp</code> becomes <code>hello_jsp.java</code> that extends <code>HttpJspBase</code>.</li><li><b>Compile:</b> to a class in the work directory.</li><li><b>Run:</b> <code>_jspService()</code> handles each request; template text becomes <code>out.write</code> calls.</li><li><b>Recompile:</b> when the file timestamp changes.</li></ul>`,
            r`// work/Catalina/localhost/shop/org/apache/jsp/hello_jsp.java (generated)
public void _jspService(HttpServletRequest request, HttpServletResponse response)
        throws java.io.IOException, ServletException {
    out.write("<html><body>\n<h2>Hello JSP</h2>\n");
    String name = request.getParameter("name");
    out.print(name == null ? "guest" : name);
}

// OUTPUT:
// first request: translation + compile; later requests call _jspService directly`],
        [`<p>Syntax summary:</p><ul><li><b>Directives:</b> <code>page</code>, <code>include</code>, <code>taglib</code>.</li><li><b>Actions:</b> <code>jsp:include</code>, <code>jsp:forward</code>, <code>jsp:useBean</code>.</li><li><b>Comments:</b> JSP comments are not sent to the browser, HTML comments are.</li><li><b>Scopes:</b> page, request, session, application.</li><li><b>EL:</b> written as dollar-brace name, reads scoped attributes.</li></ul>`,
            r`<jsp:include page="menu.jsp" />
<%-- hidden comment --%>
<!-- visible comment -->
<% request.setAttribute("msg", "hi"); %>
<p><%= request.getAttribute("msg") %></p>

// OUTPUT:
// <nav>...</nav>
// <!-- visible comment -->
// <p>hi</p>`],
        [`<p>Mistakes:</p><ul><li><b>Logic in scriptlets:</b> move to servlet or service.</li><li><b>Unescaped output:</b> XSS; use <code>c:out</code>.</li><li><b>Direct access to private pages:</b> place under <code>WEB-INF</code>.</li><li><b>Large session objects:</b> keep them small.</li><li><b>Missing encoding:</b> add <code>pageEncoding="UTF-8"</code>.</li></ul>`,
            r`<%-- WRONG: user input printed raw --%>
<p>Hello <%= request.getParameter("name") %></p>

<%-- RIGHT --%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<p>Hello <c:out value="param.name" /></p>

// OUTPUT: (name=&lt;script&gt;)
// raw version runs the script; c:out prints &amp;lt;script&amp;gt;`],
        [`<p>Performance:</p><ul><li><b>Precompile</b> at build with Jasper Ant or Maven plugin.</li><li><b>Disable the session</b> with <code>session="false"</code> for pages that do not need it.</li><li><b>Use buffer</b> and avoid huge output in one page.</li><li><b>Cache fragments</b> that rarely change.</li></ul>`,
            r`<%@ page session="false" buffer="16kb" trimDirectiveWhitespaces="true" %>

// OUTPUT:
// no JSESSIONID cookie is created for this page and blank lines are trimmed`],
        [`<p>Scenario: a legacy product list page. Refactor plan:</p><ul><li>A servlet loads data and sets a request attribute.</li><li>The JSP only loops with JSTL and prints with EL.</li><li>Pages move to <code>WEB-INF/views</code>.</li></ul>`,
            r`@WebServlet("/products")
public class ProductsServlet extends HttpServlet {
    protected void doGet(HttpServletRequest rq, HttpServletResponse rs)
            throws ServletException, IOException {
        rq.setAttribute("products", List.of("Pen", "Book", "Ink"));
        rq.getRequestDispatcher("/WEB-INF/views/products.jsp").forward(rq, rs);
    }
}

// OUTPUT:
// GET /shop/products -> 200 with <li>Pen</li><li>Book</li><li>Ink</li>`]
    ),

    'servlet-api-lifecycle': dv(
        [`<p>The container manages the servlet.</p><ul><li><b>Load:</b> class loaded and instance created with the no-arg constructor.</li><li><b>init(config):</b> once, and must finish before any request is served.</li><li><b>service:</b> many threads in parallel on one instance.</li><li><b>destroy:</b> once, after in-flight requests finish.</li><li><b>Unavailable:</b> throwing <code>UnavailableException</code> in init makes the servlet fail.</li></ul>`,
            r`public class TraceServlet extends HttpServlet {
    @Override public void init(ServletConfig cfg) throws ServletException {
        super.init(cfg);
        log("init id=" + System.identityHashCode(this));
    }
    @Override protected void service(HttpServletRequest rq, HttpServletResponse rs)
            throws ServletException, IOException {
        log("service " + rq.getMethod());
        super.service(rq, rs);                    // routes to doGet/doPost
    }
}

// OUTPUT: (varies)
// init id=1829745123
// service GET
// service POST`],
        [`<p>Variants of the API:</p><ul><li><b>GenericServlet:</b> protocol independent.</li><li><b>HttpServlet:</b> HTTP with do-methods.</li><li><b>Filter:</b> pre and post processing.</li><li><b>Listeners:</b> context, session and request events.</li><li><b>Async and multipart:</b> <code>startAsync</code> and <code>@MultipartConfig</code>.</li></ul>`,
            r`@WebServlet(urlPatterns = "/report", asyncSupported = true)
public class ReportServlet extends HttpServlet {
    protected void doGet(HttpServletRequest rq, HttpServletResponse rs) {
        AsyncContext ac = rq.startAsync();
        ac.start(() -> {
            try { ac.getResponse().getWriter().println("report ready"); }
            catch (IOException e) { /* log */ }
            ac.complete();
        });
    }
}

// OUTPUT:
// report ready`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Instance fields for request data:</b> use locals.</li><li><b>Heavy work in the constructor:</b> use <code>init</code>.</li><li><b>Forgetting super.init(config):</b> <code>getServletConfig()</code> returns null if you override <code>init(ServletConfig)</code>.</li><li><b>Not closing resources:</b> use try-with-resources.</li><li><b>Swallowing exceptions:</b> log and return a proper status.</li></ul>`,
            r`protected void doGet(HttpServletRequest rq, HttpServletResponse rs)
        throws IOException {
    try (Connection c = ds.getConnection()) {          // closed automatically
        rs.getWriter().println("rows ok");
    } catch (SQLException e) {
        log("db failure", e);
        rs.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
}

// OUTPUT: (database down)
// HTTP/1.1 500`],
        [`<p>Tuning:</p><ul><li><b>Create heavy objects once</b> in init or a listener (thread-safe ones only).</li><li><b>Pool</b> database connections.</li><li><b>Avoid synchronized</b> on the whole <code>service</code>.</li><li><b>Async</b> for slow downstream calls.</li></ul>`,
            r`private DataSource ds;                         // thread-safe pool
@Override public void init() throws ServletException {
    try {
        ds = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/shop");
    } catch (NamingException e) { throw new ServletException(e); }
}

// OUTPUT:
// the pool is looked up once at startup, not per request`],
        [`<p>Scenario: a servlet that must start a background job and stop it cleanly.</p><ul><li>Use a <code>ServletContextListener</code> to start the executor.</li><li>Shut it down in <code>contextDestroyed</code> to avoid leaks on redeploy.</li></ul>`,
            r`@WebListener
public class JobListener implements ServletContextListener {
    private ScheduledExecutorService ex;
    public void contextInitialized(ServletContextEvent e) {
        ex = Executors.newSingleThreadScheduledExecutor();
        ex.scheduleAtFixedRate(() -> System.out.println("cleanup"), 1, 60, TimeUnit.SECONDS);
    }
    public void contextDestroyed(ServletContextEvent e) { ex.shutdownNow(); }
}

// OUTPUT: (varies)
// cleanup   (every 60 seconds until the application is stopped)`]
    )
};
