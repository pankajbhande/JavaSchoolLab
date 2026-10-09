// JSP-Servlet extras, part 4: GET vs POST, hidden fields, URL rewriting, cookies, sessions.
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jsp4Extras: Record<string, Extra> = {
    'handling-get-vs-post': x(
        ['<b>GET</b> reads data: parameters travel in the URL query string, so the request can be bookmarked and cached.',
            '<b>POST</b> sends data in the request body, so it suits forms that change data, such as login or checkout.',
            '<b>Servlet methods</b>: override <code>doGet</code> and <code>doPost</code>; <code>service()</code> dispatches by HTTP method.'],
        ['<b>Safe and idempotent</b>: GET must not change server state; repeating a PUT or DELETE gives the same result, a POST may not.',
            '<b>Post/Redirect/Get</b>: after a successful POST, call <code>response.sendRedirect()</code> so a browser refresh does not resubmit the form.',
            '<b>Encoding</b>: call <code>request.setCharacterEncoding("UTF-8")</code> before reading POST parameters, otherwise non-ASCII text is garbled.'],
        ['<b>Never put secrets in GET</b>: URLs end up in browser history, proxy logs and the Referer header.',
            '<b>CSRF</b>: POST alone is not protection; add a per-session token and check <code>SameSite</code> cookies.',
            '<b>Limits</b>: servers cap URL and header size (often 8 KB), while the POST body limit is set by the container, for example <code>maxPostSize</code> in Tomcat.'],
        [['F', 'Which method puts data in the URL?', 'GET appends the parameters to the URL as a query string.'],
            ['F', 'Which servlet method handles a form with method="post"?', 'doPost(HttpServletRequest, HttpServletResponse).'],
            ['M', 'Why use Post/Redirect/Get?', 'It stops duplicate submissions when the user refreshes, because the final page is loaded by a GET.'],
            ['M', 'What happens if you only override doGet and a POST arrives?', 'The default doPost answers 405 Method Not Allowed (or 400 for HTTP/1.1 clients in some servers).'],
            ['S', 'Is POST more secure than GET?', 'Not by itself. Both are plain text without HTTPS; POST only keeps data out of the URL and logs.'],
            ['S', 'How do you share logic between doGet and doPost?', 'Put the work in a private method and call it from both, or call doGet from doPost when the logic is truly identical.']],
        [['A servlet that handles both methods.',
            r`@WebServlet("/greet")
public class GreetServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("text/html;charset=UTF-8");
        res.getWriter().println("<form method='post'><input name='n'>"
            + "<button>Send</button></form>");
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        req.setCharacterEncoding("UTF-8");
        res.setContentType("text/plain;charset=UTF-8");
        res.getWriter().println("Hello " + req.getParameter("n"));
    }
}

// OUTPUT:
// GET  /greet            -> 200, HTML form
// POST /greet  n=Asha    -> 200, body: Hello Asha`],
            ['Reading the query string on GET.',
                r`// URL: /search?q=java&page=2
String q = request.getParameter("q");          // "java"
int page = Integer.parseInt(request.getParameter("page"));
String raw = request.getQueryString();         // "q=java&page=2"
System.out.println(q + " " + page + " " + raw);

// OUTPUT:
// java 2 q=java&page=2`]],
        [['Post/Redirect/Get.',
            r`protected void doPost(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    orderService.save(req.getParameter("item"));
    res.sendRedirect(req.getContextPath() + "/thanks");   // 302, browser does GET
}

// OUTPUT:
// HTTP/1.1 302
// Location: /shop/thanks`],
            ['Rejecting an unsupported method.',
                r`@Override
protected void doDelete(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    res.setHeader("Allow", "GET, POST");
    res.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
}

// OUTPUT:
// HTTP/1.1 405
// Allow: GET, POST`]]
    ),

    'hidden-fields': x(
        ['<b>Hidden field</b>: <code>&lt;input type="hidden" name="step" value="2"&gt;</code> carries data with a form but shows nothing on screen.',
            '<b>State on a stateless protocol</b>: the value comes back to the servlet on submit, so you can pass data between pages of a form.',
            '<b>Reading it</b>: use <code>request.getParameter("step")</code>, exactly like a visible field.'],
        ['<b>Not secret</b>: anyone can see and edit a hidden field with View Source or developer tools.',
            '<b>Always revalidate</b>: re-check price, role and ids on the server; never trust the hidden value.',
            '<b>Multi-step forms</b>: copy earlier answers into hidden fields, or store them in the session and keep only a step id in the page.'],
        ['<b>Tampering</b>: a hidden <code>price</code> field is a classic vulnerability; look the price up in the database instead.',
            '<b>CSRF token</b>: a hidden random token stored also in the session proves the form came from your site.',
            '<b>Escape output</b>: when you write a value back into <code>value="..."</code>, HTML-escape it to avoid XSS.'],
        [['F', 'What does type="hidden" do?', 'It sends a value with the form but does not display a visible control.'],
            ['F', 'Is a hidden field safe for passwords?', 'No. The user can read and change it in the browser.'],
            ['M', 'Name one valid use of hidden fields.', 'A CSRF token, the id of the record being edited, or the step number of a wizard.'],
            ['M', 'Do hidden fields survive a plain link click?', 'No. They travel only when the form is submitted.'],
            ['S', 'How do you protect a hidden record id?', 'Check on the server that the logged-in user is allowed to touch that record.'],
            ['S', 'Hidden fields or session for a wizard?', 'Session keeps data server-side and tamper-proof, hidden fields keep the server stateless; large or sensitive data belongs in the session.']],
        [['Carrying a record id in an edit form.',
            r`<form action="update" method="post">
  <input type="hidden" name="id" value="42">
  <input name="name" value="Asha">
  <button>Save</button>
</form>

// OUTPUT:
// POST /update  body: id=42&name=Asha`],
            ['Reading it in the servlet.',
                r`int id = Integer.parseInt(request.getParameter("id"));
String name = request.getParameter("name");
if (!accessPolicy.canEdit(currentUser, id)) {          // never trust the id
    response.sendError(403);
    return;
}
System.out.println("update " + id + " -> " + name);

// OUTPUT:
// update 42 -> Asha`]],
        [['CSRF token in a hidden field.',
            r`// doGet: create and remember the token
String token = UUID.randomUUID().toString();
request.getSession().setAttribute("csrf", token);
request.setAttribute("csrf", token);
// JSP: <input type="hidden" name="csrf" value="<c:out value='X'/>">
// doPost: compare
String sent = request.getParameter("csrf");
Object saved = request.getSession().getAttribute("csrf");
if (saved == null || !saved.equals(sent)) response.sendError(403);

// OUTPUT:
// valid token -> 200, missing or wrong token -> 403`],
            ['Tampered price.',
                r`// Attacker edits <input type="hidden" name="price" value="1">
double sent = Double.parseDouble(request.getParameter("price"));
double real = productDao.priceOf(request.getParameter("sku"));
System.out.println("sent=" + sent + " real=" + real + " use=" + real);

// OUTPUT:
// sent=1.0 real=499.0 use=499.0`]]
    ),

    'url-rewriting': x(
        ['<b>URL rewriting</b> adds data to the link itself, for example <code>/cart?item=7</code> or <code>/cart;jsessionid=ABC123</code>.',
            '<b>Works without cookies</b>: it is the fallback when the browser blocks cookies.',
            '<b>Servlet API</b>: <code>response.encodeURL(url)</code> adds the session id only when needed.'],
        ['<b>encodeRedirectURL</b>: use it for <code>sendRedirect</code>, because redirects follow different rules than normal links.',
            '<b>Every link</b> must be encoded; one forgotten link loses the session.',
            '<b>Query string</b> data is visible, bookmarkable and length-limited, so keep it small and not secret.'],
        ['<b>Leak risk</b>: a session id in the URL appears in logs, history and the Referer header, which enables session hijacking.',
            '<b>Disable it</b>: in Servlet 3.0+ set <code>&lt;tracking-mode&gt;COOKIE&lt;/tracking-mode&gt;</code> in web.xml so ids are never put in URLs.',
            '<b>Encode parameters</b> with <code>URLEncoder.encode(value, UTF_8)</code> so spaces and symbols do not break the URL.'],
        [['F', 'What is URL rewriting?', 'Appending state, such as a session id or parameters, to the URL.'],
            ['F', 'Which method rewrites a URL for the session?', 'HttpServletResponse.encodeURL(String).'],
            ['M', 'When does encodeURL add the session id?', 'Only when the session is new or the client has not shown that it accepts cookies.'],
            ['M', 'Why use encodeRedirectURL?', 'Redirect URLs have different rules for what counts as the same session context.'],
            ['S', 'Why is URL rewriting a security risk?', 'The session id is exposed in logs, history and Referer headers, so it can be stolen or fixed by an attacker.'],
            ['S', 'How do you stop the container from rewriting URLs?', 'Set tracking-mode to COOKIE in web.xml or via ServletContext.setSessionTrackingModes.']],
        [['Encoding a link.',
            r`HttpSession s = request.getSession();
String link = response.encodeURL("cart");
out.println("<a href='" + link + "'>Cart</a>");

// OUTPUT: (varies)
// first visit (cookie not yet confirmed):
// <a href='cart;jsessionid=3F2A9C...'>Cart</a>
// later visits with cookie: <a href='cart'>Cart</a>`],
            ['Query parameter with safe encoding.',
                r`String q = URLEncoder.encode("tea & coffee", StandardCharsets.UTF_8);
String url = "search?q=" + q;
System.out.println(url);

// OUTPUT:
// search?q=tea+%26+coffee`]],
        [['Redirect with a session id.',
            r`String target = response.encodeRedirectURL(request.getContextPath() + "/home");
response.sendRedirect(target);

// OUTPUT: (varies)
// HTTP/1.1 302
// Location: /shop/home;jsessionid=3F2A9C1B...`],
            ['Cookie-only tracking in web.xml.',
                r`<session-config>
  <tracking-mode>COOKIE</tracking-mode>
</session-config>

// OUTPUT:
// URLs are never rewritten, encodeURL(x) returns x unchanged`]]
    ),

    'cookies': x(
        ['<b>Cookie</b>: a small name-value pair the server sends in <code>Set-Cookie</code> and the browser returns in every matching request.',
            '<b>Servlet API</b>: <code>new Cookie(name, value)</code>, <code>response.addCookie(c)</code> and <code>request.getCookies()</code>.',
            '<b>Lifetime</b>: <code>setMaxAge(seconds)</code>; without it the cookie is a session cookie and dies when the browser closes.'],
        ['<b>Scope</b>: <code>setPath</code> and <code>setDomain</code> decide which URLs receive the cookie.',
            '<b>Delete</b> a cookie by sending the same name, path and domain with <code>setMaxAge(0)</code>.',
            '<b>getCookies() can be null</b> when the request has no cookies, so check before the loop.'],
        ['<b>HttpOnly</b> hides the cookie from JavaScript and limits XSS damage; <b>Secure</b> sends it only over HTTPS.',
            '<b>SameSite</b> (Lax or Strict) limits cross-site sending and helps against CSRF; set it with a header or container config.',
            '<b>No sensitive data</b>: store an opaque id in the cookie and the data on the server; the client can edit any cookie.'],
        [['F', 'How do you create a cookie in a servlet?', 'new Cookie("user", "asha") and response.addCookie(cookie).'],
            ['F', 'What is the default lifetime?', 'A session cookie that is removed when the browser is closed.'],
            ['M', 'How do you delete a cookie?', 'Add a cookie with the same name, path and domain and maxAge 0.'],
            ['M', 'Why can getCookies() return null?', 'The servlet API returns null when the request carries no Cookie header.'],
            ['S', 'What do HttpOnly, Secure and SameSite do?', 'HttpOnly blocks JavaScript access, Secure restricts to HTTPS, SameSite restricts sending on cross-site requests.'],
            ['S', 'How big can cookies be?', 'About 4 KB per cookie and around 50 per domain are typical browser limits (varies by browser).']],
        [['Set and read a cookie.',
            r`Cookie c = new Cookie("theme", "dark");
c.setMaxAge(7 * 24 * 3600);
c.setPath("/");
c.setHttpOnly(true);
c.setSecure(true);
response.addCookie(c);
// next request
for (Cookie k : request.getCookies() == null ? new Cookie[0] : request.getCookies())
    System.out.println(k.getName() + "=" + k.getValue());

// OUTPUT:
// Set-Cookie: theme=dark; Max-Age=604800; Expires=...; Path=/; Secure; HttpOnly
// theme=dark`],
            ['Delete a cookie.',
                r`Cookie c = new Cookie("theme", "");
c.setMaxAge(0);
c.setPath("/");                 // must match the original path
response.addCookie(c);

// OUTPUT:
// Set-Cookie: theme=; Max-Age=0; Expires=Thu, 01-Jan-1970 00:00:10 GMT; Path=/`]],
        [['Helper that finds a cookie.',
            r`static Optional<String> cookie(HttpServletRequest req, String name) {
    Cookie[] all = req.getCookies();
    if (all == null) return Optional.empty();
    return Arrays.stream(all).filter(c -> c.getName().equals(name))
                 .map(Cookie::getValue).findFirst();
}
System.out.println(cookie(request, "theme").orElse("light"));

// OUTPUT:
// dark`],
            ['SameSite through a header.',
                r`response.addHeader("Set-Cookie",
    "remember=abc123; Max-Age=86400; Path=/; Secure; HttpOnly; SameSite=Lax");

// OUTPUT:
// Set-Cookie: remember=abc123; Max-Age=86400; Path=/; Secure; HttpOnly; SameSite=Lax`]]
    ),

    'httpsession': x(
        ['<b>HttpSession</b> keeps per-user data on the server between requests; get it with <code>request.getSession()</code>.',
            '<b>Session id</b>: the container sends a <code>JSESSIONID</code> cookie, and the browser returns it to find the session.',
            '<b>Attributes</b>: <code>setAttribute</code>, <code>getAttribute</code> and <code>removeAttribute</code>; end the session with <code>invalidate()</code>.'],
        ['<b>getSession(false)</b> returns null instead of creating a new session; use it to check whether a user is logged in.',
            '<b>Timeout</b>: set in web.xml with <code>&lt;session-timeout&gt;30&lt;/session-timeout&gt;</code> (minutes) or <code>setMaxInactiveInterval(seconds)</code>.',
            '<b>Logout</b>: call <code>invalidate()</code>, and the old id stops working.'],
        ['<b>Session fixation</b>: call <code>request.changeSessionId()</code> right after login so an attacker-chosen id is replaced.',
            '<b>Memory and clustering</b>: keep sessions small and attributes <code>Serializable</code>; use sticky sessions or a shared store such as Redis.',
            '<b>Cookie flags</b>: configure <code>HttpOnly</code>, <code>Secure</code> and <code>SameSite</code> through <code>&lt;cookie-config&gt;</code>.'],
        [['F', 'What is the session id cookie called?', 'JSESSIONID.'],
            ['F', 'How do you store a value in the session?', 'request.getSession().setAttribute("user", user).'],
            ['M', 'Difference between getSession() and getSession(false)?', 'getSession() creates a session if missing; getSession(false) returns null in that case.'],
            ['M', 'How is the timeout set?', 'In web.xml with session-timeout in minutes, or in code with setMaxInactiveInterval in seconds.'],
            ['S', 'What is session fixation and the fix?', 'The attacker plants a known session id before login; call changeSessionId() after authentication to rotate it.'],
            ['S', 'How do you scale sessions across servers?', 'Use sticky sessions, session replication, or an external store such as Redis, and keep attributes serializable.']],
        [['Login and read back.',
            r`// LoginServlet.doPost
request.changeSessionId();                       // only if a session already exists
HttpSession s = request.getSession();
s.setAttribute("user", "asha");
s.setMaxInactiveInterval(15 * 60);
// ProfileServlet.doGet
HttpSession cur = request.getSession(false);
String u = cur == null ? null : (String) cur.getAttribute("user");
System.out.println("user=" + u);

// OUTPUT: (varies)
// Set-Cookie: JSESSIONID=8A1F...; Path=/shop; HttpOnly
// user=asha`],
            ['Logout.',
                r`HttpSession s = request.getSession(false);
if (s != null) s.invalidate();
response.sendRedirect("login");

// OUTPUT:
// HTTP/1.1 302
// Location: login`]],
        [['Visit counter per user.',
            r`HttpSession s = request.getSession();
Integer n = (Integer) s.getAttribute("visits");
n = (n == null) ? 1 : n + 1;
s.setAttribute("visits", n);
response.getWriter().println("Visit " + n + " id=" + s.getId().substring(0, 6));

// OUTPUT: (varies)
// Visit 1 id=8A1F3C
// Visit 2 id=8A1F3C`],
            ['Secure cookie config in web.xml.',
                r`<session-config>
  <session-timeout>20</session-timeout>
  <cookie-config>
    <http-only>true</http-only>
    <secure>true</secure>
  </cookie-config>
  <tracking-mode>COOKIE</tracking-mode>
</session-config>

// OUTPUT:
// Set-Cookie: JSESSIONID=...; Path=/shop; Secure; HttpOnly`]]
    ),

    'urlrewriting': x(
        ['<b>Compare the options</b>: cookies are simple and automatic, sessions keep data on the server, URL rewriting works when cookies are off.',
            '<b>Default</b>: the container tries a cookie first and rewrites URLs only until it knows cookies work.',
            '<b>jsessionid</b> in a path, as in <code>/app/page;jsessionid=...</code>, is the sign that rewriting is active.'],
        ['<b>Choose by need</b>: preferences go in a cookie, user state in the session, shareable or stateless links in query parameters.',
            '<b>JSP</b>: <code>&lt;c:url value="/cart"/&gt;</code> calls <code>encodeURL</code> for you, so prefer it over hard-coded links.',
            '<b>Bookmarks</b>: a link with a session id, once bookmarked, is stale or dangerous; never share such links.'],
        ['<b>Prefer cookie tracking</b> in modern apps; rewriting widens the attack surface through logs and Referer leaks.',
            '<b>REST and APIs</b> avoid sessions: use tokens in the <code>Authorization</code> header instead of URL ids.',
            '<b>Search engines</b> may index jsessionid URLs and create duplicate pages; disabling rewriting avoids it.'],
        [['F', 'Name three ways to track a user.', 'Cookies, HttpSession and URL rewriting (also hidden fields).'],
            ['F', 'When is URL rewriting needed?', 'When the browser does not accept cookies.'],
            ['M', 'Which is tried first, cookie or URL?', 'The container sends a cookie and rewrites URLs only until it sees the cookie come back.'],
            ['M', 'How does JSTL help?', 'c:url encodes the URL with the session id when needed.'],
            ['S', 'Why do security guides say to turn rewriting off?', 'Session ids in URLs leak through logs, history, Referer and shared links.'],
            ['S', 'Cookie vs session vs token for an API?', 'Browser apps use a session cookie; stateless APIs prefer signed tokens in a header so no server memory is needed.']],
        [['Using c:url in a JSP.',
            r`<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<a href="<c:url value='/orders'/>">Orders</a>

// OUTPUT: (varies)
// first response:  <a href="/shop/orders;jsessionid=3F2A9C...">Orders</a>
// after cookie:    <a href="/shop/orders">Orders</a>`],
            ['Checking how the session is tracked.',
                r`System.out.println("cookie=" + request.isRequestedSessionIdFromCookie());
System.out.println("url=" + request.isRequestedSessionIdFromURL());

// OUTPUT: (varies)
// cookie=true
// url=false`]],
        [['Forcing cookie-only mode in code.',
            r`@Override
public void contextInitialized(ServletContextEvent e) {
    e.getServletContext().setSessionTrackingModes(
        EnumSet.of(SessionTrackingMode.COOKIE));
}

// OUTPUT:
// encodeURL("/cart") returns "/cart" with no jsessionid`],
            ['Stateless link with a signed token.',
                r`String token = jwt.sign(userId, Duration.ofMinutes(10));   // hypothetical helper
String link = "/reset?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
System.out.println(link.substring(0, 15) + "...");

// OUTPUT: (varies)
// /reset?token=ey...`]]
    )
};

export const jsp4Deep: Record<string, Deep> = {
    'handling-get-vs-post': dv(
        [`<p>The container turns each HTTP request into an <code>HttpServletRequest</code> and calls <code>service()</code>.</p><ul><li><b>Dispatch:</b> <code>HttpServlet.service</code> reads the method and calls <code>doGet</code>, <code>doPost</code>, <code>doPut</code> and so on.</li><li><b>GET data:</b> the query string is parsed lazily when you first call <code>getParameter</code>.</li><li><b>POST data:</b> for <code>application/x-www-form-urlencoded</code> the container reads the body and merges it with the query parameters.</li><li><b>HEAD and OPTIONS:</b> HEAD reuses doGet without the body; OPTIONS lists the overridden methods.</li><li><b>Multipart:</b> file uploads need <code>@MultipartConfig</code> and <code>getPart()</code>.</li></ul>`,
            r`protected void service(HttpServletRequest req, HttpServletResponse res)
        throws ServletException, IOException {
    System.out.println(req.getMethod() + " " + req.getRequestURI()
        + " type=" + req.getContentType());
    super.service(req, res);          // dispatches to doGet or doPost
}

// OUTPUT:
// GET /shop/greet type=null
// POST /shop/greet type=application/x-www-form-urlencoded`],
        [`<p>Syntax and variants:</p><ul><li><b>Form:</b> <code>method="get"</code> is the default; <code>enctype</code> may be urlencoded, multipart or text/plain.</li><li><b>Annotations:</b> <code>@WebServlet("/x")</code> maps the URL; both methods share one class.</li><li><b>Other verbs:</b> HTML forms only send GET and POST; PUT and DELETE come from fetch or AJAX.</li><li><b>Parameters:</b> <code>getParameterValues</code> for multi-value, <code>getParameterMap</code> for all.</li><li><b>Body:</b> JSON bodies are read with <code>getReader()</code>, not <code>getParameter</code>.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    if ("application/json".equals(req.getContentType())) {
        String body = req.getReader().lines().collect(Collectors.joining());
        res.getWriter().println("json length " + body.length());
    } else {
        String[] hobbies = req.getParameterValues("hobby");
        res.getWriter().println(Arrays.toString(hobbies));
    }
}

// OUTPUT:
// POST body hobby=a&hobby=b   -> [a, b]
// POST {"x":1} as JSON        -> json length 7`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong encoding:</b> read parameters before <code>setCharacterEncoding</code>, so text is garbled; set it first or use a filter.</li><li><b>Sensitive data in GET:</b> passwords end up in logs; switch to POST over HTTPS.</li><li><b>State change on GET:</b> a link like <code>/delete?id=3</code> can be triggered by crawlers or image tags.</li><li><b>No redirect after POST:</b> refresh resubmits the order.</li><li><b>Forgetting doPost:</b> the form returns 405.</li><li><b>Parsing numbers without checking:</b> <code>NumberFormatException</code> gives a 500; validate and return 400.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    req.setCharacterEncoding("UTF-8");              // before any getParameter
    String raw = req.getParameter("qty");
    try {
        int qty = Integer.parseInt(raw);
        res.sendRedirect("done?qty=" + qty);        // PRG
    } catch (NumberFormatException e) {
        res.sendError(400, "qty must be a number");
    }
}

// OUTPUT:
// qty=3   -> 302 Location: done?qty=3
// qty=abc -> 400 qty must be a number`],
        [`<p>Performance and tuning:</p><ul><li><b>Caching:</b> GET responses can carry <code>Cache-Control</code> and <code>ETag</code>; POST is not cached.</li><li><b>Body limits:</b> set <code>maxPostSize</code> and upload limits to stop abuse.</li><li><b>Streaming:</b> read large bodies as streams, not as one string.</li><li><b>Parameter count:</b> Tomcat caps <code>maxParameterCount</code> to resist hash-collision attacks.</li><li><b>Compression:</b> enable gzip for text responses at the connector or a filter.</li></ul>`,
            r`protected void doGet(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    String etag = "\"v" + catalog.version() + "\"";
    if (etag.equals(req.getHeader("If-None-Match"))) {
        res.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
        return;
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "max-age=60");
    res.getWriter().println(catalog.toJson());
}

// OUTPUT: (varies)
// first request: 200 ETag: "v12"
// repeat request with If-None-Match: 304 (no body)`],
        [`<p>Real-world scenario: a product search page and a checkout form.</p><ul><li><b>Search:</b> GET, so results are bookmarkable and cacheable.</li><li><b>Checkout:</b> POST with a CSRF token, then redirect to a confirmation page.</li><li><b>Idempotency key:</b> a hidden unique id lets the server ignore a double click.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    String key = req.getParameter("orderKey");           // hidden, unique per form
    if (orderService.alreadyProcessed(key)) {
        res.sendRedirect("confirm?order=" + orderService.idFor(key));
        return;
    }
    long id = orderService.place(key, req.getParameter("sku"));
    res.sendRedirect("confirm?order=" + id);
}

// OUTPUT:
// first submit  -> 302 confirm?order=1001
// double submit -> 302 confirm?order=1001 (no second order)`]
    ),

    'hidden-fields': dv(
        [`<p>A hidden field is ordinary form data with no visible control.</p><ul><li><b>Browser:</b> it serializes every named control, hidden or not, into the query string or body on submit.</li><li><b>Server:</b> the container cannot tell it from a visible field; both appear in <code>getParameterMap</code>.</li><li><b>No storage:</b> the value lives only in the page HTML; a new page load needs the servlet to write it again.</li><li><b>Trust:</b> the data crosses the user machine twice, so treat it as user input.</li></ul>`,
            r`Map<String, String[]> m = request.getParameterMap();
m.forEach((k, v) -> System.out.println(k + " = " + Arrays.toString(v)));

// OUTPUT:
// id = [42]
// name = [Asha]
// csrf = [9f1c7e2a-...]`],
        [`<p>Variants:</p><ul><li><b>Plain value:</b> ids, steps, return URLs.</li><li><b>Token:</b> CSRF or one-time form key.</li><li><b>Signed value:</b> add an HMAC so tampering is detectable.</li><li><b>JSP output:</b> use <code>&lt;c:out&gt;</code> or <code>fn:escapeXml</code> to encode the value.</li><li><b>Alternative:</b> keep the state in <code>HttpSession</code> and send only a step id.</li></ul>`,
            r`static String sign(String value, byte[] key) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(key, "HmacSHA256"));
    byte[] h = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
    return value + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(h);
}
// <input type="hidden" name="state" value="step2.NzE5...">

// OUTPUT: (varies)
// step2.q3F1x8Z0...`],
        [`<p>Common mistakes:</p><ul><li><b>Trusting price or role:</b> look them up server-side.</li><li><b>Unescaped values:</b> a quote in the value breaks the HTML and enables XSS.</li><li><b>Leaking secrets:</b> API keys or passwords in hidden fields.</li><li><b>Stale data:</b> two browser tabs overwrite each other; add a version field and check it.</li><li><b>Missing name attribute:</b> a field without <code>name</code> is not submitted.</li></ul>`,
            r`// Optimistic locking with a hidden version field
int version = Integer.parseInt(request.getParameter("version"));
int updated = jdbc.update(
    "UPDATE item SET name=?, version=version+1 WHERE id=? AND version=?",
    name, id, version);
if (updated == 0) response.sendError(409, "Edited by someone else");

// OUTPUT:
// matching version -> saved
// old version      -> 409 Edited by someone else`],
        [`<p>Performance and tuning:</p><ul><li><b>Page weight:</b> every hidden field is sent on each submit, so a wizard that copies big data bloats requests.</li><li><b>Prefer the session</b> for large or many values.</li><li><b>ViewState-style</b> frameworks compress and sign such state; do the same if you carry much.</li></ul>`,
            r`// Instead of 30 hidden fields, keep one reference
HttpSession s = request.getSession();
s.setAttribute("wizard", wizardData);           // server side
// JSP keeps only: <input type="hidden" name="step" value="3">

// OUTPUT:
// request body shrinks from several KB to step=3`],
        [`<p>Real-world scenario: an edit-profile page.</p><ul><li><b>Hidden id</b> identifies the record, checked against the logged-in user.</li><li><b>Hidden CSRF token</b> blocks forged submits.</li><li><b>Hidden version</b> detects concurrent edits.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    HttpSession s = req.getSession(false);
    String user = s == null ? null : (String) s.getAttribute("user");
    long id = Long.parseLong(req.getParameter("id"));
    boolean csrfOk = s != null
        && req.getParameter("csrf") != null
        && req.getParameter("csrf").equals(s.getAttribute("csrf"));
    if (user == null || !csrfOk || !profiles.ownedBy(user, id)) {
        res.sendError(403);
        return;
    }
    profiles.update(id, req.getParameter("name"));
    res.sendRedirect("profile");
}

// OUTPUT:
// valid owner + token  -> 302 profile
// anything else        -> 403`]
    ),

    'url-rewriting': dv(
        [`<p>The container decides in <code>encodeURL</code> whether rewriting is needed.</p><ul><li><b>Check:</b> it adds the id when the session is new, or the request did not arrive with a cookie.</li><li><b>Format:</b> a path parameter <code>;jsessionid=ID</code> is added before the query string.</li><li><b>Incoming:</b> the container parses the path parameter and finds the session.</li><li><b>Absolute URLs</b> to other hosts are never rewritten, which protects the id from leaking to them.</li></ul>`,
            r`String in  = "/shop/cart?item=7";
String out = response.encodeURL(in);
System.out.println(out);
System.out.println("fromURL=" + request.isRequestedSessionIdFromURL());

// OUTPUT: (varies)
// /shop/cart;jsessionid=3F2A9C1B7D?item=7
// fromURL=false`],
        [`<p>Options:</p><ul><li><b>encodeURL:</b> for links, form actions and images.</li><li><b>encodeRedirectURL:</b> for <code>sendRedirect</code>.</li><li><b>Query parameters:</b> your own data, not the session, such as <code>?page=2</code>.</li><li><b>Path parameters:</b> <code>;key=value</code> matrix style.</li><li><b>Tracking modes:</b> <code>COOKIE</code>, <code>URL</code>, <code>SSL</code> (set in web.xml or on the context).</li></ul>`,
            r`out.println("<form action='" + response.encodeURL("save") + "' method='post'>");
Set<SessionTrackingMode> modes =
    request.getServletContext().getEffectiveSessionTrackingModes();
System.out.println(modes);

// OUTPUT: (varies)
// <form action='save;jsessionid=3F2A9C1B7D' method='post'>
// [COOKIE, URL]`],
        [`<p>Mistakes:</p><ul><li><b>Not encoding a link:</b> that page loses the session when cookies are off.</li><li><b>Encoding twice:</b> do not wrap an already encoded URL.</li><li><b>Hand-built jsessionid:</b> never append it yourself.</li><li><b>Query strings with raw text:</b> unencoded <code>&amp;</code> or spaces break parsing.</li><li><b>Logging full URLs:</b> they contain the id; strip it in access logs.</li></ul>`,
            r`String url = request.getContextPath() + "/orders"
    + "?status=" + URLEncoder.encode("on hold", StandardCharsets.UTF_8);
String safe = response.encodeURL(url);                  // once only
System.out.println(safe);

// OUTPUT: (varies)
// /shop/orders;jsessionid=3F2A9C1B7D?status=on+hold`],
        [`<p>Performance and tuning:</p><ul><li><b>Cost:</b> encodeURL is cheap, but URLs vary per user so shared caches cannot reuse the pages.</li><li><b>CDN:</b> pages with jsessionid in links defeat caching; switch to cookie tracking.</li><li><b>Tomcat:</b> the <code>disableURLRewriting</code> context attribute turns it off in Tomcat 8.5+ (check your version).</li></ul>`,
            r`<!-- META-INF/context.xml (Tomcat) -->
<Context path="/shop" cookies="true" />
<!-- web.xml -->
<session-config><tracking-mode>COOKIE</tracking-mode></session-config>

// OUTPUT:
// links stay identical for all users, so CDN and browser caches work`],
        [`<p>Real-world scenario: an older intranet app must still work on kiosks with cookies blocked.</p><ul><li><b>Keep rewriting</b> but only over HTTPS and on an internal network.</li><li><b>Short timeout</b> reduces the window for a leaked id.</li><li><b>Bind the session</b> to a client attribute where practical and rotate the id after login.</li></ul>`,
            r`HttpSession s = request.getSession();
if (s.getAttribute("ip") == null) s.setAttribute("ip", request.getRemoteAddr());
else if (!s.getAttribute("ip").equals(request.getRemoteAddr())) {
    s.invalidate();                   // possible stolen id
    response.sendRedirect("login");
    return;
}
s.setMaxInactiveInterval(10 * 60);

// OUTPUT:
// same client -> continues; different address -> session invalidated, 302 login`]
    ),

    'cookies': dv(
        [`<p>Cookies are plain HTTP headers.</p><ul><li><b>Set:</b> the response carries <code>Set-Cookie: name=value; attributes</code>.</li><li><b>Send:</b> the browser stores it and adds <code>Cookie: name=value</code> to every request matching domain, path and Secure rules.</li><li><b>Container:</b> <code>addCookie</code> only formats the header; <code>getCookies</code> parses the Cookie header.</li><li><b>Expiry:</b> Max-Age is a countdown, Expires a date; browsers prefer Max-Age.</li><li><b>Order:</b> a cookie is chosen by the most specific path first.</li></ul>`,
            r`GET /shop/home HTTP/1.1
Host: example.com
Cookie: theme=dark; JSESSIONID=8A1F3C

// OUTPUT:
// HTTP/1.1 200
// Set-Cookie: lastVisit=2026-10-07; Max-Age=2592000; Path=/shop; HttpOnly; Secure
// (varies)`],
        [`<p>Attributes and variants:</p><ul><li><b>Max-Age / Expires:</b> persistent versus session cookie.</li><li><b>Path / Domain:</b> scope; a Domain makes the cookie available to subdomains.</li><li><b>HttpOnly / Secure:</b> script protection and HTTPS only.</li><li><b>SameSite:</b> <code>Strict</code>, <code>Lax</code> or <code>None</code> (None requires Secure).</li><li><b>Cookie prefixes:</b> <code>__Host-</code> forces Secure, Path=/ and no Domain.</li><li><b>Servlet 6:</b> <code>setAttribute("SameSite", "Lax")</code> exists on <code>Cookie</code>.</li></ul>`,
            r`Cookie c = new Cookie("__Host-sid", "opaque123");
c.setPath("/");
c.setSecure(true);
c.setHttpOnly(true);
c.setAttribute("SameSite", "Strict");     // Servlet 6.0 / Jakarta EE 10
response.addCookie(c);

// OUTPUT:
// Set-Cookie: __Host-sid=opaque123; Path=/; Secure; HttpOnly; SameSite=Strict`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Delete fails:</b> path or domain differs from the original; repeat them exactly.</li><li><b>Spaces or semicolons in the value:</b> encode with URLEncoder or Base64.</li><li><b>NullPointerException:</b> check <code>getCookies()</code> for null.</li><li><b>Setting a cookie after the response is committed:</b> headers must be added before writing the body.</li><li><b>Storing passwords or roles:</b> store an opaque id server-side.</li><li><b>Missing Secure on HTTPS sites:</b> the cookie can leak over HTTP.</li></ul>`,
            r`Cookie c = new Cookie("note", URLEncoder.encode("a b;c", StandardCharsets.UTF_8));
response.addCookie(c);                 // before getWriter() or flush
response.getWriter().println("ok");
// later
String v = URLDecoder.decode(c.getValue(), StandardCharsets.UTF_8);
System.out.println(v);

// OUTPUT:
// Set-Cookie: note=a+b%3Bc
// a b;c`],
        [`<p>Performance and tuning:</p><ul><li><b>Size:</b> cookies are sent with every request, including images; keep them small.</li><li><b>Static domain:</b> serve static files from a cookie-free domain or path.</li><li><b>Count:</b> fewer, shorter cookies lower header cost; limits are about 4 KB each (varies).</li><li><b>Lifetime:</b> short for authentication, longer for preferences.</li></ul>`,
            r`Cookie pref = new Cookie("lang", "en");
pref.setPath("/app");                  // not sent for /static
pref.setMaxAge(180 * 24 * 3600);
response.addCookie(pref);

// OUTPUT:
// Set-Cookie: lang=en; Max-Age=15552000; Path=/app
// requests to /static/logo.png carry no lang cookie`],
        [`<p>Real-world scenario: a remember-me login.</p><ul><li><b>Selector and validator:</b> store a random token pair, only a hash of the validator in the database.</li><li><b>Rotate</b> the token on each use and delete it at logout.</li><li><b>Flags:</b> HttpOnly, Secure, SameSite=Lax, and a limited life such as 30 days.</li></ul>`,
            r`String selector = randomToken(12), validator = randomToken(32);
tokens.save(selector, sha256(validator), Instant.now().plus(Duration.ofDays(30)));
response.addHeader("Set-Cookie", "remember=" + selector + ":" + validator
    + "; Max-Age=2592000; Path=/; Secure; HttpOnly; SameSite=Lax");

// OUTPUT: (varies)
// Set-Cookie: remember=Qx8d...:Zp3L...; Max-Age=2592000; Path=/; Secure; HttpOnly; SameSite=Lax`]
    ),

    'httpsession': dv(
        [`<p>Session data stays in server memory; the client holds only an id.</p><ul><li><b>Creation:</b> <code>getSession()</code> makes a <code>StandardSession</code> in a map keyed by id (Tomcat) and sends <code>Set-Cookie: JSESSIONID</code>.</li><li><b>Lookup:</b> each request id is looked up and <code>lastAccessedTime</code> updated.</li><li><b>Expiry:</b> a background thread removes sessions idle longer than the max inactive interval.</li><li><b>Persistence:</b> Tomcat can save sessions on restart (<code>PersistentManager</code>) if attributes are serializable.</li><li><b>Listeners:</b> <code>HttpSessionListener</code> and <code>HttpSessionAttributeListener</code> observe changes.</li></ul>`,
            r`HttpSession s = request.getSession();
System.out.println("id=" + s.getId());
System.out.println("new=" + s.isNew());
System.out.println("created=" + new Date(s.getCreationTime()));
System.out.println("idleLimit=" + s.getMaxInactiveInterval() + "s");

// OUTPUT: (varies)
// id=8A1F3C5E9B2D...
// new=true
// created=Wed Oct 07 10:15:02 IST 2026
// idleLimit=1800s`],
        [`<p>API variants:</p><ul><li><b>getSession(true/false):</b> create or only find.</li><li><b>changeSessionId():</b> new id, same data (Servlet 3.1+).</li><li><b>invalidate():</b> destroy now.</li><li><b>setMaxInactiveInterval(n):</b> seconds; a negative value means never expire (avoid it).</li><li><b>Binding listener:</b> <code>HttpSessionBindingListener</code> on an attribute reacts to bind and unbind.</li><li><b>Package:</b> <code>jakarta.servlet.http</code> in Tomcat 10+, <code>javax.servlet.http</code> in Tomcat 9.</li></ul>`,
            r`public class CartListener implements HttpSessionListener {
    @Override public void sessionCreated(HttpSessionEvent e) {
        System.out.println("created " + e.getSession().getId());
    }
    @Override public void sessionDestroyed(HttpSessionEvent e) {
        System.out.println("destroyed " + e.getSession().getId());
    }
}

// OUTPUT: (varies)
// created 8A1F3C5E...
// destroyed 8A1F3C5E...`],
        [`<p>Mistakes and fixes:</p><ul><li><b>No fixation defense:</b> call <code>changeSessionId()</code> after login.</li><li><b>Using getSession() to test login:</b> it creates sessions for bots; use <code>getSession(false)</code>.</li><li><b>Non-serializable attributes:</b> replication and restart fail.</li><li><b>Mutating a stored object without setAttribute:</b> clustered stores do not notice; call <code>setAttribute</code> again.</li><li><b>Thread safety:</b> sessions are shared across tabs; synchronize changes to mutable objects.</li><li><b>Huge attributes:</b> large lists exhaust memory.</li></ul>`,
            r`HttpSession s = request.getSession(false);
if (s == null || s.getAttribute("user") == null) {
    response.sendRedirect("login");
    return;
}
Cart cart = (Cart) s.getAttribute("cart");
synchronized (s) {                     // coarse lock per user
    cart.add(request.getParameter("sku"));
    s.setAttribute("cart", cart);      // lets a clustered store see the change
}

// OUTPUT:
// not logged in -> 302 login
// logged in     -> cart updated`],
        [`<p>Performance and tuning:</p><ul><li><b>Memory:</b> sessions times average size is your heap cost; store ids, not objects.</li><li><b>Timeout:</b> shorter timeouts free memory; 15 to 30 minutes is common.</li><li><b>Bots:</b> avoid creating sessions for anonymous pages.</li><li><b>Clustering:</b> sticky sessions are cheapest; replication costs network; Redis is common.</li><li><b>JSP:</b> add <code>&lt;%@ page session="false" %&gt;</code> where no session is needed.</li></ul>`,
            r`<%@ page session="false" %>
<!-- public page: no JSESSIONID created -->

// OUTPUT:
// response has no Set-Cookie header, no session object allocated`],
        [`<p>Real-world scenario: login with a shopping cart.</p><ul><li><b>Before login:</b> anonymous cart in the session.</li><li><b>On login:</b> rotate the id, merge the cart, set a user attribute.</li><li><b>Idle timeout:</b> 20 minutes, with a warning for a longer absolute limit.</li><li><b>Logout:</b> invalidate and expire the cookie.</li></ul>`,
            r`protected void doPost(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    User u = auth.check(req.getParameter("u"), req.getParameter("p"));
    if (u == null) { res.sendError(401); return; }
    HttpSession before = req.getSession();
    Object anonCart = before.getAttribute("cart");
    req.changeSessionId();                      // defeats session fixation
    HttpSession s = req.getSession();
    s.setAttribute("user", u.name());
    s.setAttribute("cart", carts.merge(u, anonCart));
    s.setMaxInactiveInterval(20 * 60);
    res.sendRedirect("home");
}

// OUTPUT: (varies)
// Set-Cookie: JSESSIONID=NEWID...; Path=/shop; Secure; HttpOnly
// HTTP/1.1 302  Location: home`]
    ),

    'urlrewriting': dv(
        [`<p>This topic is about choosing a tracking technique, not the mechanics of one link.</p><ul><li><b>Cookie:</b> data on the client, sent automatically; the session id usually rides in one.</li><li><b>Session:</b> data on the server, referenced by that id.</li><li><b>URL rewriting:</b> the same id carried in the path when cookies fail.</li><li><b>Hidden field:</b> data carried only through form posts.</li><li><b>Container logic:</b> the first response includes both a cookie and a rewritten URL; once a cookie returns, rewriting stops.</li></ul>`,
            r`// Request 1 (no cookie yet) response:
//   Set-Cookie: JSESSIONID=ABC; Path=/shop
//   <a href="/shop/next;jsessionid=ABC">
// Request 2 arrives with Cookie: JSESSIONID=ABC
System.out.println("fromCookie=" + request.isRequestedSessionIdFromCookie());

// OUTPUT: (varies)
// fromCookie=true   (links are now written without jsessionid)`],
        [`<p>Comparison to guide the choice:</p><ul><li><b>Cookies:</b> small, per-browser preferences; need user consent in many regions.</li><li><b>HttpSession:</b> login state, carts; needs server memory.</li><li><b>URL rewriting:</b> only when cookies are unavailable; least secure.</li><li><b>Hidden fields:</b> multi-page forms.</li><li><b>Query parameters:</b> shareable state such as search filters and page numbers.</li><li><b>Token in header:</b> APIs and mobile clients.</li></ul>`,
            r`String how = request.isRequestedSessionIdFromCookie() ? "cookie"
    : request.isRequestedSessionIdFromURL() ? "url" : "none";
System.out.println("session tracked by: " + how);

// OUTPUT: (varies)
// session tracked by: cookie`],
        [`<p>Mistakes when mixing techniques:</p><ul><li><b>Sharing a link with jsessionid:</b> the other person joins your session.</li><li><b>Relying on rewriting for security:</b> it does not add any.</li><li><b>Redirects without encodeRedirectURL</b> in cookie-less clients.</li><li><b>Cookie and URL ids disagreeing:</b> the container prefers the cookie; clear stale URLs.</li><li><b>Third-party cookie blocking:</b> embedded widgets lose cookies even if your site works; test it.</li></ul>`,
            r`String q = request.getQueryString();
if (request.isRequestedSessionIdFromURL()) {
    // someone followed a link with ;jsessionid=... : do not trust, rotate on login
    request.changeSessionId();
}
System.out.println("query=" + q);

// OUTPUT: (varies)
// query=page=2`],
        [`<p>Performance and tuning:</p><ul><li><b>Caching:</b> cookie tracking keeps URLs identical, so CDNs and browsers cache pages.</li><li><b>SEO:</b> no jsessionid duplicates.</li><li><b>Stateless alternatives</b> remove session memory and sticky-session needs.</li></ul>`,
            r`response.setHeader("Cache-Control", "public, max-age=300");
// safe only because cookie mode keeps the URL free of per-user ids

// OUTPUT:
// Cache-Control: public, max-age=300`],
        [`<p>Real-world scenario: pick the tracking for three features of one shop.</p><ul><li><b>Language preference:</b> cookie, lives 6 months.</li><li><b>Cart and login:</b> session with cookie-only tracking, fixation defense.</li><li><b>Product filters:</b> query parameters, so links can be shared and cached.</li></ul>`,
            r`// 1. preference cookie
response.addHeader("Set-Cookie", "lang=en; Max-Age=15552000; Path=/; SameSite=Lax");
// 2. session for state (cookie tracking only in web.xml)
request.getSession().setAttribute("cart", new Cart());
// 3. filters in the URL
response.sendRedirect("products?cat=books&sort=price");

// OUTPUT: (varies)
// Set-Cookie: lang=en; Max-Age=15552000; Path=/; SameSite=Lax
// Set-Cookie: JSESSIONID=...; Path=/shop; HttpOnly
// Location: products?cat=books&sort=price`]
    )
};
