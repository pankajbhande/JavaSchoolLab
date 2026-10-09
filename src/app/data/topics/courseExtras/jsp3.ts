// JSP-Servlet extras, part 3: request, response, redirect, dispatcher and form data (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jsp3Extras: Record<string, Extra> = {
    'http-servlet-request': x(
        ['<b>Request object</b>: the container builds one <code>HttpServletRequest</code> per HTTP request and passes it to <code>doGet</code> or <code>doPost</code>.',
            '<b>What it holds</b>: method, URL, headers, parameters, cookies, session and the body stream.',
            '<b>Common getters</b>: <code>getMethod()</code>, <code>getRequestURI()</code>, <code>getHeader("User-Agent")</code>, <code>getRemoteAddr()</code>.'],
        ['<b>Parameters or attributes</b>: parameters come from the client and are always Strings; attributes are server-side objects you set with <code>setAttribute</code>.',
            '<b>URL parts</b>: <code>getContextPath()</code>, <code>getServletPath()</code> and <code>getPathInfo()</code> together make up <code>getRequestURI()</code>.',
            '<b>Body is read once</b>: after <code>getParameter</code> reads a form body, <code>getReader()</code> may return nothing.'],
        ['<b>Never trust it</b>: headers such as <code>X-Forwarded-For</code> and <code>Host</code> can be forged, so validate or take them only from a trusted proxy.',
            '<b>Wrappers</b>: <code>HttpServletRequestWrapper</code> lets a filter change headers, parameters or the body for later servlets.',
            '<b>Not thread safe</b>: never store the request in a field or pass it to another thread after the service method returns.'],
        [['F', 'Who creates the HttpServletRequest object?', 'The servlet container (for example Tomcat) creates it for every incoming request and passes it to the service method.'],
            ['F', 'How do you get the HTTP method?', 'Call request.getMethod(), which returns GET, POST and so on.'],
            ['M', 'Difference between getRequestURI and getRequestURL?', 'getRequestURI returns the path only (with context path); getRequestURL returns the full URL as a StringBuffer including scheme and host.'],
            ['M', 'Parameter versus attribute?', 'A parameter is a String sent by the client; an attribute is any object that server code stores in the request scope.'],
            ['S', 'How do you get the real client IP behind a load balancer?', 'getRemoteAddr returns the proxy; read X-Forwarded-For only if the proxy is trusted, or configure the container RemoteIpValve or ForwardedHeaderFilter.'],
            ['S', 'Why can you not read the body twice?', 'The input stream is consumed once; cache it in a request wrapper if several components need it.']],
        [['Print basic request info.',
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setContentType("text/plain;charset=UTF-8");
    PrintWriter out = resp.getWriter();
    out.println("Method : " + req.getMethod());
    out.println("URI    : " + req.getRequestURI());
    out.println("Query  : " + req.getQueryString());
    out.println("Agent  : " + req.getHeader("User-Agent"));
}

// OUTPUT: (GET /shop/info?x=1)
// Method : GET
// URI    : /shop/info
// Query  : x=1
// Agent  : Mozilla/5.0 (varies)`],
            ['List all header names.',
                r`Enumeration<String> names = req.getHeaderNames();
while (names.hasMoreElements()) {
    String n = names.nextElement();
    out.println(n + ": " + req.getHeader(n));
}

// OUTPUT: (varies)
// host: localhost:8080
// accept: text/html
// accept-language: en-US`]],
        [['URL parts.',
            r`// Request: GET http://localhost:8080/shop/items/42?sort=asc
out.println(req.getContextPath());   // application name
out.println(req.getServletPath());   // servlet mapping
out.println(req.getPathInfo());      // extra path after the mapping
out.println(req.getQueryString());

// OUTPUT: (servlet mapped to /items/*)
// /shop
// /items
// /42
// sort=asc`],
            ['Attribute for a forward.',
                r`req.setAttribute("user", "Asha");           // server side only
Object u = req.getAttribute("user");
out.println(u);
out.println(req.getParameter("user"));       // not the same thing

// OUTPUT: (no ?user= in the URL)
// Asha
// null`]]
    ),

    'sending-text-html-response': x(
        ['<b>Writer</b>: <code>resp.getWriter()</code> gives a <code>PrintWriter</code> for text; the HTML you print becomes the response body.',
            '<b>Set type first</b>: call <code>setContentType("text/html;charset=UTF-8")</code> before <code>getWriter()</code>.',
            '<b>One body</b>: use either <code>getWriter()</code> or <code>getOutputStream()</code> for a response, not both.'],
        ['<b>Escape output</b>: user data printed into HTML must be encoded (<code>&lt;</code> becomes <code>&amp;lt;</code>) or you create an XSS hole.',
            '<b>Buffering</b>: output is buffered; <code>flush()</code> sends the status line and headers, after which they cannot change.',
            '<b>HTML in Java strings</b> is hard to maintain, so use a JSP or a template for real pages and keep servlets for logic.'],
        ['<b>Status first</b>: set status and headers before the first byte is committed; check <code>isCommitted()</code>.',
            '<b>Streaming</b>: for big pages flush in chunks (chunked transfer encoding) instead of building a huge String.',
            '<b>Security headers</b>: add <code>Content-Security-Policy</code> and <code>X-Content-Type-Options: nosniff</code> to HTML responses.'],
        [['F', 'How does a servlet send HTML to the browser?', 'Set the content type to text/html and print the HTML with response.getWriter().'],
            ['F', 'What does PrintWriter do?', 'It writes character text to the response body, converting it with the response character encoding.'],
            ['M', 'Why set the content type before getWriter?', 'The writer picks its character encoding when it is created, so a later charset setting is ignored.'],
            ['M', 'Can you use getWriter and getOutputStream together?', 'No, the second call throws IllegalStateException.'],
            ['S', 'How do you prevent XSS when echoing a name?', 'Encode it for the HTML context (for example OWASP Java Encoder Encode.forHtml) or use a template engine that escapes by default.'],
            ['S', 'What happens if you set a header after flushing?', 'The response is committed, so the header is silently ignored and setStatus or sendRedirect may throw IllegalStateException.']],
        [['Hello page.',
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setContentType("text/html;charset=UTF-8");
    PrintWriter out = resp.getWriter();
    out.println("<html><body>");
    out.println("<h1>Hello, Servlet</h1>");
    out.println("</body></html>");
}

// OUTPUT:
// HTTP/1.1 200
// Content-Type: text/html;charset=UTF-8
//
// <html><body>
// <h1>Hello, Servlet</h1>
// </body></html>`],
            ['A small table.',
                r`out.println("<table border='1'>");
for (int i = 1; i <= 3; i++) {
    out.println("<tr><td>" + i + "</td><td>" + i * i + "</td></tr>");
}
out.println("</table>");

// OUTPUT: (rendered table)
// 1 | 1
// 2 | 4
// 3 | 9`]],
        [['Escaping user input.',
            r`String name = req.getParameter("name");       // e.g. <script>alert(1)</script>
if (name == null) name = "guest";
String safe = name.replace("&", "&amp;").replace("<", "&lt;")
                  .replace(">", "&gt;").replace("\"", "&quot;");
out.println("<p>Hello " + safe + "</p>");

// OUTPUT:
// <p>Hello &lt;script&gt;alert(1)&lt;/script&gt;</p>`],
            ['Check committed state.',
                r`out.println("part one");
out.flush();                                   // commits the response
System.out.println(resp.isCommitted());
// resp.sendRedirect("/x");                    // would throw IllegalStateException

// OUTPUT:
// true`]]
    ),

    'setting-content-type': x(
        ['<b>Content-Type header</b> tells the browser how to read the body, set with <code>resp.setContentType("text/html")</code>.',
            '<b>Common types</b>: <code>text/html</code>, <code>text/plain</code>, <code>application/json</code>, <code>application/pdf</code>, <code>image/png</code>.',
            '<b>Charset</b>: add it as <code>text/html;charset=UTF-8</code> so non-English text shows correctly.'],
        ['<b>Wrong type</b>: HTML sent as <code>text/plain</code> shows tags as text; JSON sent as HTML is risky for XSS.',
            '<b>setCharacterEncoding</b> on the response must be called before <code>getWriter()</code>; the request one is a different method for the input.',
            '<b>Downloads</b>: add <code>Content-Disposition: attachment; filename="report.pdf"</code> to force a Save dialog.'],
        ['<b>nosniff</b>: send <code>X-Content-Type-Options: nosniff</code> so browsers do not guess a different type from the content.',
            '<b>Default</b>: with no type set, the container may send none or a default; always set it explicitly.',
            '<b>Content negotiation</b>: choose the type from the <code>Accept</code> header, and set <code>Vary: Accept</code> for caches.'],
        [['F', 'What does setContentType do?', 'It sets the Content-Type response header so the browser knows how to treat the body.'],
            ['F', 'Give the content type for JSON.', 'application/json.'],
            ['M', 'Why add charset=UTF-8?', 'Without it the browser may guess a legacy encoding and show garbled characters.'],
            ['M', 'How do you make the browser download a file?', 'Set Content-Disposition to attachment with a filename, and the right content type.'],
            ['S', 'Why send X-Content-Type-Options nosniff?', 'It stops MIME sniffing, so a file served as text cannot be executed as script.'],
            ['S', 'Does setContentType after getWriter change the encoding?', 'The type changes but the writer keeps its already chosen charset, so set both before getWriter.']],
        [['Plain text versus HTML.',
            r`resp.setContentType("text/plain;charset=UTF-8");
resp.getWriter().println("<b>bold</b>");

// OUTPUT: (browser shows the tags literally)
// Content-Type: text/plain;charset=UTF-8
// <b>bold</b>`],
            ['JSON response.',
                r`resp.setContentType("application/json;charset=UTF-8");
resp.getWriter().write("{\"id\":7,\"name\":\"Asha\"}");

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json;charset=UTF-8
//
// {"id":7,"name":"Asha"}`]],
        [['File download.',
            r`resp.setContentType("application/pdf");
resp.setHeader("Content-Disposition", "attachment; filename=\"report.pdf\"");
resp.setHeader("X-Content-Type-Options", "nosniff");
try (OutputStream os = resp.getOutputStream()) {
    os.write(pdfBytes);
}

// OUTPUT: (headers)
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="report.pdf"
// X-Content-Type-Options: nosniff`],
            ['Choose type from Accept.',
                r`String accept = req.getHeader("Accept");
boolean wantsJson = accept != null && accept.contains("application/json");
resp.setContentType(wantsJson ? "application/json" : "text/html");
resp.setHeader("Vary", "Accept");

// OUTPUT: (Accept: application/json)
// Content-Type: application/json
// Vary: Accept`]]
    ),

    'sending-redirect': x(
        ['<b>sendRedirect</b> tells the browser to make a new request: <code>resp.sendRedirect("home.jsp")</code> sends status 302 with a <code>Location</code> header.',
            '<b>Browser does it</b>: the URL in the address bar changes, and the browser sends a second GET.',
            '<b>Request data lost</b>: request attributes and parameters are not carried to the new request.'],
        ['<b>Redirect or forward</b>: redirect is a round trip to the client and can leave the application; forward stays on the server.',
            '<b>Post-Redirect-Get</b>: redirect after a successful POST so a page refresh does not submit the form again.',
            '<b>Carry data</b> across a redirect with the session, a flash attribute or query parameters; encode with <code>URLEncoder</code>.'],
        ['<b>Open redirect</b>: never redirect to a raw <code>next</code> parameter; allow only relative paths or a whitelist of hosts.',
            '<b>Cannot redirect after commit</b>: once the response is committed, <code>sendRedirect</code> throws <code>IllegalStateException</code>.',
            '<b>Status codes</b>: use <code>setStatus(303)</code> plus a <code>Location</code> header when you need 303 or 307 instead of the default 302.'],
        [['F', 'What does sendRedirect do?', 'It sends a 302 response with a Location header so the browser requests the new URL.'],
            ['F', 'Does the URL change after a redirect?', 'Yes, the browser address bar shows the new URL.'],
            ['M', 'Redirect versus forward?', 'Redirect makes the browser send a new request and loses request attributes; forward is handled inside the server with the same request.'],
            ['M', 'What is Post-Redirect-Get?', 'After handling a POST, redirect to a GET page so refreshing does not resubmit the form.'],
            ['S', 'What is an open redirect and how do you stop it?', 'Redirecting to an attacker-controlled URL taken from input; validate that the target is a local path or on a whitelist.'],
            ['S', 'Why use 303 instead of 302 after POST?', '302 handling of the method was historically inconsistent; 303 clearly says to fetch the new URL with GET.']],
        [['Simple redirect.',
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.sendRedirect(req.getContextPath() + "/home");
}

// OUTPUT:
// HTTP/1.1 302
// Location: http://localhost:8080/shop/home
// Content-Length: 0`],
            ['Redirect after login.',
                r`String user = req.getParameter("user");
if ("admin".equals(user)) {
    resp.sendRedirect("dashboard.jsp");
} else {
    resp.sendRedirect("login.jsp?error=1");
}

// OUTPUT: (user=admin)
// HTTP/1.1 302
// Location: http://localhost:8080/shop/dashboard.jsp`]],
        [['Safe redirect target.',
            r`String next = req.getParameter("next");
// allow only a local path, reject "//evil.com" and "http://evil.com"
boolean local = next != null && next.startsWith("/") && !next.startsWith("//");
resp.sendRedirect(req.getContextPath() + (local ? next : "/home"));

// OUTPUT: (next=http://evil.com)
// HTTP/1.1 302
// Location: http://localhost:8080/shop/home`],
            ['Post-Redirect-Get.',
                r`protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    orderService.save(req.getParameter("item"));
    req.getSession().setAttribute("msg", "Order saved");
    resp.sendRedirect("orders");                     // browser then does GET
}

// OUTPUT:
// POST /shop/orders -> 302 Location: /shop/orders
// GET  /shop/orders -> 200 (refresh now repeats only the GET)`]]
    ),

    'request-dispatcher': x(
        ['<b>RequestDispatcher</b> passes a request to another servlet or JSP on the server: <code>req.getRequestDispatcher("result.jsp")</code>.',
            '<b>forward</b>: hands control to the target, which produces the whole response; the browser URL does not change.',
            '<b>include</b>: adds the output of another resource into the current response, then continues.'],
        ['<b>Same request</b>: forward and include share the same request and response, so <code>setAttribute</code> data is visible to the target.',
            '<b>Path rules</b>: a path starting with <code>/</code> is relative to the context root; no slash means relative to the current servlet.',
            '<b>No output before forward</b>: the response buffer must not be committed, or forward throws <code>IllegalStateException</code>.'],
        ['<b>WEB-INF</b>: JSPs placed under <code>/WEB-INF/</code> cannot be opened directly, so forwarding is the only way in (a good MVC rule).',
            '<b>Dispatcher types</b>: filters can be mapped to FORWARD, INCLUDE, ERROR and ASYNC dispatches, not only REQUEST.',
            '<b>Return after forward</b>: code after <code>forward()</code> still runs, so <code>return</code> to avoid writing twice.'],
        [['F', 'What is RequestDispatcher used for?', 'To forward a request to, or include the output of, another servlet or JSP on the server.'],
            ['F', 'Does the URL change on forward?', 'No, the browser still shows the original URL.'],
            ['M', 'Forward versus include?', 'Forward transfers control and the target writes the response; include merges the target output and the caller continues.'],
            ['M', 'How do you send data to the forwarded JSP?', 'Store it with request.setAttribute and read it in the JSP with getAttribute or EL.'],
            ['S', 'Why put JSPs under WEB-INF in MVC?', 'They cannot be requested directly, so every view is reached through a controller servlet.'],
            ['S', 'What happens if you write output and then forward?', 'If the buffer was already flushed it throws IllegalStateException; otherwise the buffered output is cleared by forward.']],
        [['Forward with data.',
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    req.setAttribute("items", List.of("pen", "book"));
    req.getRequestDispatcher("/WEB-INF/list.jsp").forward(req, resp);
}

// OUTPUT: (browser URL stays /shop/list)
// HTTP/1.1 200
// Content-Type: text/html;charset=UTF-8
// <ul><li>pen</li><li>book</li></ul>`],
            ['Include a header.',
                r`PrintWriter out = resp.getWriter();
out.println("<h1>Page</h1>");
req.getRequestDispatcher("/footer.html").include(req, resp);
out.println("<p>after include</p>");

// OUTPUT:
// <h1>Page</h1>
// <small>(c) Example</small>
// <p>after include</p>`]],
        [['Validate then forward or redirect.',
            r`String age = req.getParameter("age");
if (age == null || !age.matches("\\d{1,3}")) {
    req.setAttribute("error", "Enter a valid age");
    req.getRequestDispatcher("form.jsp").forward(req, resp);   // keep input
    return;                                                    // stop here
}
resp.sendRedirect("thanks.jsp");

// OUTPUT: (age=abc)
// HTTP/1.1 200 ... form page with the error message, URL unchanged`],
            ['Dispatcher by name.',
                r`RequestDispatcher rd = getServletContext().getNamedDispatcher("ReportServlet");
rd.forward(req, resp);        // target chosen by servlet name, not by URL

// OUTPUT:
// the response is produced by ReportServlet (varies)`]]
    ),

    'reading-form-data': x(
        ['<b>getParameter</b>: <code>req.getParameter("name")</code> returns the value of an input field as a String, or <code>null</code> if it is missing.',
            '<b>Name match</b>: the argument must equal the <code>name</code> attribute of the HTML input, not its <code>id</code>.',
            '<b>Same call</b> for GET (query string) and POST (body) data.'],
        ['<b>Multiple values</b>: use <code>getParameterValues("hobby")</code> for checkboxes and multi-selects; it returns a <code>String[]</code> or null.',
            '<b>Convert and check</b>: numbers arrive as Strings, so use <code>Integer.parseInt</code> inside try-catch for <code>NumberFormatException</code>.',
            '<b>Encoding</b>: call <code>req.setCharacterEncoding("UTF-8")</code> before the first <code>getParameter</code> on a POST.'],
        ['<b>Validate on the server</b>: client checks are only a convenience; check null, length, range and format again.',
            '<b>Parameter pollution</b>: <code>?id=1&amp;id=2</code> gives two values, and <code>getParameter</code> returns only the first.',
            '<b>Limits</b>: containers cap the number and size of parameters (for example Tomcat <code>maxParameterCount</code>, <code>maxPostSize</code>) against denial of service.'],
        [['F', 'How do you read a text field in a servlet?', 'Call request.getParameter with the field name attribute.'],
            ['F', 'What does getParameter return for a missing field?', 'null.'],
            ['M', 'How do you read checkboxes with the same name?', 'Use getParameterValues, which returns a String array.'],
            ['M', 'Why can POST text look garbled?', 'The request encoding was not set; call setCharacterEncoding("UTF-8") before reading parameters.'],
            ['S', 'Does getParameter work for multipart file uploads?', 'Only if the servlet has @MultipartConfig; then use getPart for files, and text fields are available through getParameter.'],
            ['S', 'How do you stop SQL injection with form data?', 'Use PreparedStatement parameters, never string concatenation, and also validate input.']],
        [['Read two fields.',
            r`protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    req.setCharacterEncoding("UTF-8");
    String name = req.getParameter("name");
    String email = req.getParameter("email");
    resp.setContentType("text/plain;charset=UTF-8");
    resp.getWriter().println(name + " <" + email + ">");
}

// OUTPUT: (name=Asha&email=asha@example.com)
// Asha <asha@example.com>`],
            ['Checkboxes.',
                r`String[] hobbies = req.getParameterValues("hobby");
if (hobbies != null) {
    for (String h : hobbies) out.println(h);
}

// OUTPUT: (hobby=music&hobby=chess)
// music
// chess`]],
        [['Safe number parsing.',
            r`String qty = req.getParameter("qty");
int n = 1;
try {
    n = Integer.parseInt(qty.trim());
    if (n < 1 || n > 100) throw new NumberFormatException("range");
} catch (NullPointerException | NumberFormatException e) {
    resp.sendError(400, "qty must be a number from 1 to 100");
    return;
}
out.println("qty=" + n);

// OUTPUT: (qty=abc)
// HTTP/1.1 400 qty must be a number from 1 to 100`],
            ['All parameters.',
                r`Map<String, String[]> all = req.getParameterMap();
all.forEach((k, v) -> out.println(k + " = " + Arrays.toString(v)));

// OUTPUT: (POST name=Asha&hobby=a&hobby=b)
// name = [Asha]
// hobby = [a, b]`]]
    )
};

export const jsp3Deep: Record<string, Deep> = {
    'http-servlet-request': dv(
        [`<p>The container parses the raw HTTP message and wraps it in a request object.</p><ul><li><b>Connector:</b> reads the request line and headers from the socket, then builds the object (in Tomcat a <code>Request</code> wrapped by a facade).</li><li><b>Lazy parsing:</b> the body and parameters are parsed on the first call to <code>getParameter</code> or <code>getReader</code>.</li><li><b>Pooling:</b> the objects are recycled after the response, which is why you must not keep a reference.</li><li><b>Interfaces:</b> <code>ServletRequest</code> is protocol neutral; <code>HttpServletRequest</code> adds headers, cookies and session.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    // body not yet parsed here
    String ct = req.getContentType();
    String id = req.getParameter("id");   // first parameter call parses the body
    resp.setContentType("text/plain");
    resp.getWriter().println(ct + " id=" + id);
}

// OUTPUT: (POST id=5)
// application/x-www-form-urlencoded id=5`],
        [`<p>Useful groups of methods:</p><ul><li><b>Line:</b> <code>getMethod</code>, <code>getRequestURI</code>, <code>getProtocol</code>, <code>getScheme</code>.</li><li><b>Headers:</b> <code>getHeader</code>, <code>getHeaders</code>, <code>getIntHeader</code>, <code>getDateHeader</code>.</li><li><b>Body:</b> <code>getReader</code>, <code>getInputStream</code>, <code>getContentLength</code>.</li><li><b>Client:</b> <code>getRemoteAddr</code>, <code>getLocale</code>, <code>getCookies</code>.</li><li><b>State:</b> <code>getSession(false)</code>, attributes.</li><li><b>Imports:</b> Jakarta EE 9+ uses <code>jakarta.servlet.http.*</code>; Java EE and Tomcat 9 use <code>javax.servlet.http.*</code>.</li></ul>`,
            r`// Jakarta EE 9+ / Tomcat 10+ :  import jakarta.servlet.http.*;
// Java EE / Tomcat 9        :  import javax.servlet.http.*;
String lang = req.getLocale().getLanguage();
int len = req.getContentLength();                 // -1 when unknown
Cookie[] cookies = req.getCookies();              // null when there are none
HttpSession s = req.getSession(false);            // null, no session is created
out.println(lang + " " + len + " " + (cookies == null) + " " + (s == null));

// OUTPUT: (GET with no cookies, varies)
// en -1 true true`],
        [`<p>Common mistakes:</p><ul><li><b>getCookies null:</b> the array is null, not empty, when no cookie exists.</li><li><b>getSession() creates:</b> it makes a session for every visitor; use <code>getSession(false)</code> to only look.</li><li><b>Reading the body twice:</b> a filter that reads the body leaves nothing for the servlet; wrap and cache it.</li><li><b>Trusting headers:</b> <code>Referer</code> and <code>X-Forwarded-For</code> are client controlled.</li><li><b>Keeping the request:</b> using it in another thread after return gives wrong or recycled data.</li></ul>`,
            r`Cookie[] cookies = req.getCookies();
if (cookies != null) {                       // WRONG without this: NullPointerException
    for (Cookie c : cookies) {
        if ("theme".equals(c.getName())) out.println(c.getValue());
    }
}
HttpSession s = req.getSession(false);       // RIGHT: do not create a session
out.println(s == null ? "anonymous" : "user session");

// OUTPUT: (no cookies)
// anonymous`],
        [`<p>Request handling is cheap, but a few habits help:</p><ul><li><b>Avoid sessions</b> for anonymous traffic, since each one uses memory.</li><li><b>Stream large bodies</b> with <code>getInputStream</code> instead of reading them into a String.</li><li><b>Limits:</b> configure <code>maxPostSize</code>, header size and connection timeouts in the connector.</li><li><b>Async:</b> <code>startAsync()</code> frees the container thread while a slow backend call runs.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    byte[] buf = new byte[8192];
    long total = 0;
    try (InputStream in = req.getInputStream()) {
        int n;
        while ((n = in.read(buf)) != -1) total += n;     // constant memory
    }
    resp.getWriter().println("received " + total + " bytes");
}

// OUTPUT: (varies)
// received 1048576 bytes`],
        [`<p>A logging filter records each request, using a wrapper for the real client address.</p><ul><li><b>Proxy:</b> trust <code>X-Forwarded-For</code> only from your own load balancer.</li><li><b>Privacy:</b> do not log passwords, tokens or full query strings that hold secrets.</li><li><b>Correlation id:</b> read or create a request id and put it in the log context.</li></ul>`,
            r`@WebFilter("/*")
public class AccessLogFilter implements Filter {
    public void doFilter(ServletRequest rq, ServletResponse rs, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) rq;
        long t = System.nanoTime();
        chain.doFilter(rq, rs);
        long ms = (System.nanoTime() - t) / 1_000_000;
        System.out.println(req.getMethod() + " " + req.getRequestURI()
            + " from " + req.getRemoteAddr() + " " + ms + "ms");
    }
}

// OUTPUT: (varies)
// GET /shop/items from 10.0.0.5 12ms`]
    ),

    'sending-text-html-response': dv(
        [`<p>The response is built in a buffer and sent when committed.</p><ul><li><b>Buffer:</b> default size is usually 8 KB (<code>getBufferSize()</code>); small pages are sent in one go with a <code>Content-Length</code>.</li><li><b>Commit:</b> the status line and headers are written on the first flush or when the buffer fills.</li><li><b>Writer:</b> <code>PrintWriter</code> encodes characters with the response charset.</li><li><b>PrintWriter swallows IOException:</b> check <code>checkError()</code> if you care.</li></ul>`,
            r`PrintWriter out = resp.getWriter();
System.out.println("buffer = " + resp.getBufferSize());
System.out.println("committed = " + resp.isCommitted());
out.println("<p>hello</p>");
System.out.println("committed after small write = " + resp.isCommitted());
out.flush();
System.out.println("committed after flush = " + resp.isCommitted());

// OUTPUT: (server console, varies by container)
// buffer = 8192
// committed = false
// committed after small write = false
// committed after flush = true`],
        [`<p>Ways to produce a body:</p><ul><li><b>getWriter():</b> text and HTML.</li><li><b>getOutputStream():</b> binary data such as images.</li><li><b>forward to a JSP:</b> the usual choice for pages.</li><li><b>setBufferSize / resetBuffer / reset:</b> control and clear the buffer before commit.</li><li><b>sendError(404):</b> produce the container error page.</li></ul>`,
            r`resp.setBufferSize(32 * 1024);
resp.setStatus(HttpServletResponse.SC_OK);
resp.setHeader("Cache-Control", "no-store");
resp.setContentType("text/html;charset=UTF-8");
resp.getWriter().println("<h1>Report</h1>");
// resp.resetBuffer();                 // would discard the body written so far
// resp.sendError(500, "oops");        // would replace it by an error page

// OUTPUT:
// HTTP/1.1 200
// Cache-Control: no-store
// Content-Type: text/html;charset=UTF-8
//
// <h1>Report</h1>`],
        [`<p>Common mistakes:</p><ul><li><b>XSS:</b> printing request data raw; encode it for HTML.</li><li><b>Type after writer:</b> setting charset after <code>getWriter()</code> has no effect.</li><li><b>Both writer and stream:</b> throws <code>IllegalStateException</code>.</li><li><b>Hand-built HTML:</b> hard to read and test; use JSP, JSTL <code>c:out</code> or a template engine.</li><li><b>Missing html escape in attributes:</b> quotes inside <code>value="..."</code> break out of the attribute.</li></ul>`,
            r`String q = req.getParameter("q");                  // <img src=x onerror=alert(1)>
// WRONG: out.println("<p>You searched " + q + "</p>");
out.println("<p>You searched " + org.owasp.encoder.Encode.forHtml(q) + "</p>");
out.println("<input value=\"" + org.owasp.encoder.Encode.forHtmlAttribute(q) + "\">");

// OUTPUT:
// <p>You searched &lt;img src=x onerror=alert(1)&gt;</p>
// <input value="&lt;img src=x onerror=alert(1)&gt;">`],
        [`<p>Tuning:</p><ul><li><b>Compression:</b> enable gzip on the connector or in a filter for HTML.</li><li><b>Buffer size:</b> a larger buffer lets you change status or redirect later, but uses more memory per request.</li><li><b>Streaming:</b> flush periodically for long reports so the user sees progress.</li><li><b>StringBuilder:</b> build big strings with it, or write directly to the writer.</li></ul>`,
            r`resp.setContentType("text/csv;charset=UTF-8");
PrintWriter out = resp.getWriter();
for (int i = 1; i <= 100_000; i++) {
    out.println(i + ",item" + i);
    if (i % 5_000 == 0) out.flush();       // chunked transfer, constant memory
}

// OUTPUT: (varies)
// HTTP/1.1 200
// Transfer-Encoding: chunked
// 1,item1
// 2,item2`],
        [`<p>A health page for a load balancer.</p><ul><li><b>Cheap:</b> no database call, or a very fast one.</li><li><b>No cache:</b> add <code>Cache-Control: no-store</code>.</li><li><b>Status:</b> return 503 when the app is not ready so the balancer stops sending traffic.</li></ul>`,
            r`@WebServlet("/health")
public class HealthServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        boolean ok = Db.ping();
        resp.setStatus(ok ? 200 : 503);
        resp.setHeader("Cache-Control", "no-store");
        resp.setContentType("text/plain;charset=UTF-8");
        resp.getWriter().print(ok ? "UP" : "DOWN");
    }
}

// OUTPUT:
// HTTP/1.1 200
// Cache-Control: no-store
// Content-Type: text/plain;charset=UTF-8
//
// UP`]
    ),

    'setting-content-type': dv(
        [`<p>The content type is just a header plus a hint to the writer.</p><ul><li><b>Header:</b> <code>setContentType</code> writes <code>Content-Type</code>; a charset part also sets the character encoding.</li><li><b>Order:</b> the writer fixes its encoding when first obtained, so set the type first.</li><li><b>Container default:</b> if no charset is given, the servlet default is ISO-8859-1 (Servlet 4 and earlier); newer containers can set a default in <code>web.xml</code> or <code>response-character-encoding</code>.</li><li><b>Case:</b> header names are case insensitive; types are conventionally lower case.</li></ul>`,
            r`resp.setContentType("text/html");
System.out.println(resp.getCharacterEncoding());   // default, container dependent
resp.setCharacterEncoding("UTF-8");
System.out.println(resp.getContentType());
resp.setContentType("text/html;charset=UTF-8");
System.out.println(resp.getContentType());

// OUTPUT: (varies by container)
// ISO-8859-1
// text/html;charset=UTF-8
// text/html;charset=UTF-8`],
        [`<p>Typical values:</p><ul><li><b>Text:</b> <code>text/html</code>, <code>text/plain</code>, <code>text/css</code>, <code>text/csv</code>.</li><li><b>Data:</b> <code>application/json</code>, <code>application/xml</code>.</li><li><b>Files:</b> <code>application/pdf</code>, <code>application/zip</code>, <code>application/octet-stream</code>.</li><li><b>Images:</b> <code>image/png</code>, <code>image/jpeg</code>.</li><li><b>Guess it:</b> <code>getServletContext().getMimeType("a.png")</code> uses the container mime mappings.</li></ul>`,
            r`ServletContext ctx = getServletContext();
System.out.println(ctx.getMimeType("logo.png"));
System.out.println(ctx.getMimeType("data.json"));
System.out.println(ctx.getMimeType("notes.xyz"));          // unknown

// OUTPUT: (Tomcat defaults, varies)
// image/png
// application/json
// null`],
        [`<p>Mistakes:</p><ul><li><b>No charset:</b> accented text shows as garbage; add <code>;charset=UTF-8</code>.</li><li><b>JSON as text/html:</b> clients may not parse it, and it invites XSS.</li><li><b>Setting after commit:</b> ignored once the response is committed.</li><li><b>Uploads served as HTML:</b> user files must be served with a safe type, <code>nosniff</code> and a download disposition.</li><li><b>Binary through the writer:</b> corrupts bytes; use the output stream.</li></ul>`,
            r`// WRONG: binary through a character writer corrupts the file
// resp.getWriter().write(new String(imageBytes));
resp.setContentType("image/png");
resp.setContentLength(imageBytes.length);
resp.getOutputStream().write(imageBytes);           // RIGHT

// OUTPUT:
// HTTP/1.1 200
// Content-Type: image/png
// Content-Length: 5120 (varies)`],
        [`<p>Performance related:</p><ul><li><b>Content-Length:</b> lets the client reuse the connection and show progress.</li><li><b>Caching:</b> static types need <code>Cache-Control</code> and <code>ETag</code>.</li><li><b>Compression:</b> compress text types only; images and zips are already compressed.</li></ul>`,
            r`resp.setContentType("text/css");
resp.setHeader("Cache-Control", "public, max-age=86400");
resp.setHeader("ETag", "\"v12\"");
if ("\"v12\"".equals(req.getHeader("If-None-Match"))) {
    resp.setStatus(304);                            // no body is sent
    return;
}

// OUTPUT: (second visit)
// HTTP/1.1 304
// ETag: "v12"`],
        [`<p>One endpoint serving both browsers and API clients.</p><ul><li><b>Negotiate</b> using <code>Accept</code>.</li><li><b>Errors</b> should use the same type the client asked for.</li><li><b>Security headers</b> on every response through a filter.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    resp.setHeader("X-Content-Type-Options", "nosniff");
    resp.setHeader("Vary", "Accept");
    String accept = String.valueOf(req.getHeader("Accept"));
    if (accept.contains("application/json")) {
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write("{\"status\":\"ok\"}");
    } else {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().write("<p>Status: ok</p>");
    }
}

// OUTPUT: (Accept: application/json)
// Content-Type: application/json;charset=UTF-8
// {"status":"ok"}`]
    ),

    'sending-redirect': dv(
        [`<p>A redirect is only a response; the browser does the work.</p><ul><li><b>Server side:</b> <code>sendRedirect</code> sets status 302, writes the <code>Location</code> header, clears the buffer and commits the response.</li><li><b>Relative paths:</b> resolved by the container against the request URL; a leading <code>/</code> is relative to the server root, not the context, so add <code>getContextPath()</code>.</li><li><b>Client side:</b> the browser sends a new GET to the Location URL (cookies for that host are sent).</li><li><b>Code after it still runs:</b> add <code>return</code>.</li></ul>`,
            r`resp.sendRedirect("/home");                       // server root: http://host/home
resp.sendRedirect(req.getContextPath() + "/home"); // inside this application
resp.sendRedirect("detail?id=7");                  // relative to current URL
System.out.println("this line still executes");     // so write: return;

// OUTPUT: (second call; the first call already committed, so later ones fail)
// HTTP/1.1 302
// Location: http://localhost:8080/shop/home
// then IllegalStateException: Cannot call sendRedirect() after the response has been committed`],
        [`<p>Choices:</p><ul><li><b>302 Found:</b> the default temporary redirect.</li><li><b>301 Moved Permanently:</b> cached by browsers; set status and header yourself.</li><li><b>303 See Other:</b> redirect after POST using GET.</li><li><b>307 / 308:</b> keep the original method and body.</li><li><b>encodeRedirectURL:</b> adds a session id when cookies are off.</li></ul>`,
            r`resp.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);       // 301
resp.setHeader("Location", req.getContextPath() + "/new-home");
// 303 after POST:
// resp.setStatus(303); resp.setHeader("Location", "orders");
String url = resp.encodeRedirectURL(req.getContextPath() + "/cart");

// OUTPUT:
// HTTP/1.1 301
// Location: /shop/new-home`],
        [`<p>Mistakes:</p><ul><li><b>Open redirect:</b> using an unchecked parameter as the target enables phishing.</li><li><b>Forgetting return:</b> the code continues and may write a body or redirect twice.</li><li><b>Redirect after output:</b> throws <code>IllegalStateException</code>.</li><li><b>Expecting attributes:</b> request attributes are gone; use the session or the URL.</li><li><b>Unencoded parameters:</b> spaces and ampersands break the query string.</li></ul>`,
            r`String q = "tea & coffee";
String url = "search?q=" + URLEncoder.encode(q, StandardCharsets.UTF_8);
if (user == null) {
    resp.sendRedirect("login.jsp");
    return;                                    // RIGHT: stop processing
}
resp.sendRedirect(url);

// OUTPUT:
// Location: http://localhost:8080/shop/search?q=tea+%26+coffee`],
        [`<p>Cost and tuning:</p><ul><li><b>Extra round trip:</b> a redirect adds one request, so avoid chains of redirects.</li><li><b>Prefer forward</b> inside the application when the URL need not change.</li><li><b>301 caching:</b> a permanent redirect saves repeated trips, but a mistake is hard to undo in browsers.</li><li><b>Link directly</b> to the final URL in pages you control.</li></ul>`,
            r`// Bad: /a -> /b -> /c  (three requests)
// Good: /a -> /c            (two requests)
resp.sendRedirect(req.getContextPath() + "/c");

// OUTPUT: (curl -sIL http://localhost:8080/shop/a)
// HTTP/1.1 302
// Location: http://localhost:8080/shop/c
// HTTP/1.1 200`],
        [`<p>Login flow with a safe return URL.</p><ul><li><b>Remember</b> the requested page in the session or a validated parameter.</li><li><b>Validate</b> the return path as local.</li><li><b>PRG:</b> redirect after the POST so the back button is safe.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws IOException {
    if (!auth.check(req.getParameter("user"), req.getParameter("pass"))) {
        resp.sendRedirect("login.jsp?error=1");
        return;
    }
    req.changeSessionId();                       // stop session fixation
    req.getSession().setAttribute("user", req.getParameter("user"));
    String back = req.getParameter("back");
    boolean local = back != null && back.startsWith("/") && !back.startsWith("//");
    resp.sendRedirect(req.getContextPath() + (local ? back : "/home"));
}

// OUTPUT: (valid login, back=/orders)
// HTTP/1.1 302
// Location: http://localhost:8080/shop/orders`]
    ),

    'request-dispatcher': dv(
        [`<p>Dispatching happens fully inside the container.</p><ul><li><b>Lookup:</b> the container maps the path to a servlet or JSP through the same rules as a normal request.</li><li><b>Forward:</b> clears the unflushed buffer, runs the target, then closes the response.</li><li><b>Include:</b> the target cannot change the status or headers; such calls are ignored.</li><li><b>Attributes:</b> the container sets <code>jakarta.servlet.forward.request_uri</code> (or <code>javax.servlet.forward.*</code>) so the target can see the original URL.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    req.getRequestDispatcher("/WEB-INF/view.jsp").forward(req, resp);
}
// inside view.jsp (scriptlet): request.getRequestURI() is /shop/WEB-INF/view.jsp
// original URI: request.getAttribute("jakarta.servlet.forward.request_uri")

// OUTPUT:
// /shop/list      (the original URI, from the forward attribute)`],
        [`<p>Where to get a dispatcher:</p><ul><li><b>request.getRequestDispatcher(path):</b> path may be relative to the current resource.</li><li><b>context.getRequestDispatcher(path):</b> path must start with <code>/</code>.</li><li><b>context.getNamedDispatcher(name):</b> by servlet name.</li><li><b>Query string:</b> the path may contain one, such as <code>/view.jsp?mode=edit</code>.</li><li><b>Cross context:</b> <code>context.getContext("/other")</code> then its dispatcher, if allowed.</li></ul>`,
            r`RequestDispatcher a = req.getRequestDispatcher("detail.jsp");       // relative
RequestDispatcher b = req.getRequestDispatcher("/detail.jsp");      // from context root
RequestDispatcher c = getServletContext().getRequestDispatcher("/detail.jsp?mode=edit");
RequestDispatcher d = getServletContext().getNamedDispatcher("DetailServlet");
System.out.println(a != null && b != null && c != null);
System.out.println(getServletContext().getRequestDispatcher("/missing.jsp") != null);

// OUTPUT:
// true
// true   (a dispatcher is returned even for some missing paths; forward then gives 404)`],
        [`<p>Mistakes:</p><ul><li><b>Output before forward:</b> flushed content causes <code>IllegalStateException</code>.</li><li><b>No return:</b> code after forward runs and may forward or redirect again.</li><li><b>Forward then refresh on POST:</b> the browser URL is the POST, so a refresh resubmits; use redirect for success.</li><li><b>Dispatcher null:</b> a path the container cannot map may give null, so check.</li><li><b>User-controlled path:</b> forwarding to <code>req.getParameter("page")</code> exposes internal files such as WEB-INF.</li></ul>`,
            r`String page = req.getParameter("page");                 // user supplied
Set<String> allowed = Set.of("home", "about", "contact");
if (page == null || !allowed.contains(page)) page = "home";   // whitelist
req.getRequestDispatcher("/WEB-INF/pages/" + page + ".jsp").forward(req, resp);
return;

// OUTPUT: (page=../web.xml)
// the home page is shown; the unsafe path is never used`],
        [`<p>Performance:</p><ul><li><b>Cheap:</b> a forward has no network round trip, so it is faster than a redirect.</li><li><b>Include for fragments</b> is fine, but a deep chain of includes adds overhead; prefer JSP tags or templates.</li><li><b>Avoid heavy attributes:</b> keep large objects out of the request unless the view needs them.</li></ul>`,
            r`// One request, one thread, no extra round trip:
//   browser -> /list (controller servlet) -> forward -> /WEB-INF/list.jsp
long t = System.nanoTime();
req.getRequestDispatcher("/WEB-INF/list.jsp").forward(req, resp);
System.out.println("render ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (server console, varies)
// render ms=4`],
        [`<p>Front controller (MVC) pattern.</p><ul><li><b>One servlet</b> receives all <code>*.do</code> or <code>/app/*</code> requests.</li><li><b>Action</b> runs the logic and stores a model in the request.</li><li><b>View</b> is chosen by name and forwarded from <code>/WEB-INF</code>.</li></ul>`,
            r`@WebServlet("/app/*")
public class FrontController extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String action = String.valueOf(req.getPathInfo());          // /products
        if ("/products".equals(action)) {
            req.setAttribute("products", productDao.findAll());
            req.getRequestDispatcher("/WEB-INF/views/products.jsp").forward(req, resp);
        } else {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
}

// OUTPUT: (GET /shop/app/products)
// HTTP/1.1 200  (products.jsp rendered; URL stays /shop/app/products)
// GET /shop/app/unknown -> HTTP/1.1 404`]
    ),

    'reading-form-data': dv(
        [`<p>Form data is parsed by the container from the query string and the body.</p><ul><li><b>GET:</b> parameters come from the query string, <code>application/x-www-form-urlencoded</code>.</li><li><b>POST:</b> the same encoding in the body, parsed on the first <code>getParameter</code> call.</li><li><b>Decoding:</b> percent encoding is decoded using the request encoding (body) or the connector URIEncoding (query, UTF-8 by default in Tomcat 8+).</li><li><b>Multipart:</b> <code>multipart/form-data</code> bodies are parsed only with <code>@MultipartConfig</code>.</li></ul>`,
            r`// <form method="post" action="register"> <input name="city"> ... </form>
// Body: city=Z%C3%BCrich&tag=a&tag=b
req.setCharacterEncoding("UTF-8");                   // before any getParameter
System.out.println(req.getParameter("city"));
System.out.println(req.getParameter("tag"));          // first value only
System.out.println(Arrays.toString(req.getParameterValues("tag")));

// OUTPUT:
// Zürich
// a
// [a, b]`],
        [`<p>Reading options:</p><ul><li><b>getParameter:</b> one value.</li><li><b>getParameterValues:</b> all values.</li><li><b>getParameterNames:</b> enumeration of names.</li><li><b>getParameterMap:</b> read-only map of all.</li><li><b>getPart:</b> files and multipart fields.</li><li><b>JSON body:</b> use <code>getReader()</code> and a JSON library, because getParameter does not parse JSON.</li></ul>`,
            r`@MultipartConfig(maxFileSize = 2_000_000)
@WebServlet("/upload")
public class UploadServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, ServletException {
        String title = req.getParameter("title");        // text field in multipart
        Part file = req.getPart("photo");
        resp.getWriter().println(title + " " + file.getSubmittedFileName()
            + " " + file.getSize());
    }
}

// OUTPUT: (varies)
// Holiday me.png 18234`],
        [`<p>Mistakes:</p><ul><li><b>Null not checked:</b> <code>getParameter("age").trim()</code> throws <code>NullPointerException</code>.</li><li><b>Wrong name:</b> using the <code>id</code> attribute instead of <code>name</code>.</li><li><b>Garbled UTF-8:</b> forgetting <code>setCharacterEncoding</code>, or calling it after a parameter was read.</li><li><b>Unchecked boxes:</b> an unchecked checkbox sends nothing, so null means false.</li><li><b>Concatenated SQL:</b> leads to SQL injection.</li><li><b>Printing raw:</b> leads to XSS.</li></ul>`,
            r`String user = req.getParameter("user");
boolean agree = req.getParameter("agree") != null;         // checkbox: null is false
if (user == null || user.isBlank() || user.length() > 50) {
    resp.sendError(400, "user is required");
    return;
}
// WRONG: "SELECT * FROM users WHERE name='" + user + "'"
try (PreparedStatement ps =
         con.prepareStatement("SELECT id FROM users WHERE name = ?")) {
    ps.setString(1, user);                                  // RIGHT
}

// OUTPUT: (user missing)
// HTTP/1.1 400 user is required`],
        [`<p>Performance and limits:</p><ul><li><b>Parameter count:</b> a huge number of parameters is a denial of service vector, so keep the connector <code>maxParameterCount</code> reasonable (Tomcat default 10000).</li><li><b>POST size:</b> <code>maxPostSize</code> limits the body parsed as parameters (Tomcat default 2 MB).</li><li><b>Large uploads:</b> set <code>maxFileSize</code>, <code>maxRequestSize</code> and <code>fileSizeThreshold</code>.</li><li><b>Parse once:</b> store the converted object in a request attribute instead of re-parsing.</li></ul>`,
            r`// server.xml (Tomcat connector)
// <Connector port="8080" maxParameterCount="1000" maxPostSize="1048576" />
// Request exceeding the limit:
//   Tomcat ignores the extra parameters or answers 400 (varies by version)

// OUTPUT: (log line, varies)
// WARN: More than the maximum number of request parameters (GET plus POST) was found`],
        [`<p>A registration form handler combining the good practices.</p><ul><li><b>Encoding</b> first.</li><li><b>Validate</b> each field and collect errors.</li><li><b>Forward back</b> with errors and old values (escaped in the JSP) or <b>redirect</b> on success.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    req.setCharacterEncoding("UTF-8");
    Map<String, String> errors = new LinkedHashMap<>();
    String name = Optional.ofNullable(req.getParameter("name")).orElse("").trim();
    String email = Optional.ofNullable(req.getParameter("email")).orElse("").trim();
    if (name.isEmpty()) errors.put("name", "Name is required");
    if (!email.matches("[^@\\s]+@[^@\\s]+\\.[a-z]{2,}")) errors.put("email", "Invalid email");
    if (!errors.isEmpty()) {
        req.setAttribute("errors", errors);
        req.setAttribute("name", name);                    // escape when printing
        req.getRequestDispatcher("/WEB-INF/register.jsp").forward(req, resp);
        return;
    }
    userDao.save(name, email);
    resp.sendRedirect(req.getContextPath() + "/welcome");   // PRG
}

// OUTPUT: (email=abc)
// HTTP/1.1 200  register.jsp with "Invalid email"
// (valid input) HTTP/1.1 302  Location: http://localhost:8080/shop/welcome`]
    )
};
