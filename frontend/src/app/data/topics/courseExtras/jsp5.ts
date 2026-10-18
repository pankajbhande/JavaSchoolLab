// JSP and Servlet extras, part 5: hidden fields, tracking comparison, web.xml, mapping, parameters.
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jsp5Extras: Record<string, Extra> = {
    'hiddenformfields': x(
        ['<b>Hidden field</b>: <code>&lt;input type="hidden" name="step" value="2"&gt;</code> is sent with the form but not shown on screen.',
            '<b>Stateless trick</b>: HTTP forgets each request, so a hidden field carries a small value (step number, item id) from one page to the next.',
            '<b>Not secret</b>: the user can see it with View Source or change it with browser tools, so never trust it blindly.'],
        ['<b>Multi-step wizard</b>: every page re-posts the earlier answers as hidden fields, and the last page submits everything together.',
            '<b>Limits</b>: works only with form submits (POST or GET), not with plain links, and every page must be generated dynamically.',
            '<b>Versus other techniques</b>: cookies and <code>HttpSession</code> keep data on the server or browser across all pages, hidden fields only across a chain of forms.'],
        ['<b>Tampering</b>: a user can change <code>price</code> or <code>userId</code> in a hidden field, so re-read the real value from the database on the server.',
            '<b>Signing</b>: when you must round-trip data, add an HMAC over the value or store it in the session and send only a random token.',
            '<b>CSRF token</b>: a hidden field holding a per-session random token is the standard defence against cross-site request forgery.'],
        [['F', 'What is a hidden form field?', 'An input with type hidden. The browser sends its value with the form but does not display it.'],
            ['F', 'Can the user see a hidden field?', 'Yes, in View Source or developer tools. Hidden only means not displayed.'],
            ['M', 'When is a hidden field better than a session?', 'For short flows where you want no server memory, such as passing an id between two forms.'],
            ['M', 'Why do hidden fields not work with hyperlinks?', 'Only a form submit sends input values. A link would need the value in the query string instead.'],
            ['S', 'How do you stop price tampering in a hidden field?', 'Never accept the price from the client. Send only the product id and read the price from the server.'],
            ['S', 'How does a hidden field help against CSRF?', 'It carries a random token tied to the session. The server rejects a post whose token is missing or wrong.']],
        [['Wizard step 1 passing data to step 2.',
            r`<form action="step2" method="post">
  Name: <input type="text" name="name">
  <input type="hidden" name="step" value="1">
  <input type="submit" value="Next">
</form>

// OUTPUT:
// POST /step2  body: name=Abaji&step=1  (the step value is never shown on the page)`],
            ['Servlet echoing the hidden value into the next form.',
                r`protected void doPost(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    String name = req.getParameter("name");
    res.setContentType("text/html");
    PrintWriter out = res.getWriter();
    out.println("<form action='step3' method='post'>");
    out.println("<input type='hidden' name='name' value='" + escape(name) + "'>");
    out.println("Email: <input name='email'><input type='submit'></form>");
}

// OUTPUT:
// The step 2 page shows only the email box; name travels hidden to step3.`]],
        [['Tampering demo.',
            r`<input type="hidden" name="price" value="500">
<!-- the user edits value to 1 in the browser tools and submits -->

// OUTPUT:
// The server receives price=1. Fix: ignore it and load the price by product id.`],
            ['CSRF token in a hidden field.',
                r`String token = UUID.randomUUID().toString();
session.setAttribute("csrf", token);
out.println("<input type='hidden' name='csrf' value='" + token + "'>");
// on submit:
if (!token.equals(req.getParameter("csrf"))) {
    res.sendError(403);
}

// OUTPUT:
// A forged cross-site post has no valid token and gets 403.`]]
    ),
    'sessiontrackingcomparison': x(
        ['<b>Four techniques</b>: cookies, URL rewriting, hidden form fields and <code>HttpSession</code>. Each one tries to link many requests to one user.',
            '<b>Where data lives</b>: cookies and hidden fields keep data on the client, <code>HttpSession</code> keeps data on the server and sends only an id.',
            '<b>Default choice</b>: use <code>HttpSession</code>, which normally uses a cookie named <code>JSESSIONID</code> and falls back to URL rewriting.'],
        ['<b>Cookies</b> work on every page and survive browser restarts if given a max age, but users can disable them and they are limited to about 4 KB each.',
            '<b>URL rewriting</b> works when cookies are off, but ids show up in logs, bookmarks and the Referer header.',
            '<b>Hidden fields</b> need a form on every page and carry data only along a form chain.'],
        ['<b>Security</b>: prefer <code>HttpOnly</code> and <code>Secure</code> cookies, and avoid session ids in URLs to prevent session fixation and leaks.',
            '<b>Scaling</b>: server sessions need sticky routing, replication or an external store such as Redis. Signed tokens (JWT) move state to the client.',
            '<b>Hybrid</b>: keep identity in the session, keep small preferences in a long-lived cookie, and use hidden tokens for CSRF.'],
        [['F', 'Name the session tracking techniques.', 'Cookies, URL rewriting, hidden form fields and HttpSession.'],
            ['F', 'Which one is easiest in a servlet?', 'HttpSession, via request.getSession().'],
            ['M', 'What happens when the browser blocks cookies?', 'The container can use URL rewriting through response.encodeURL, which adds ;jsessionid to links.'],
            ['M', 'Why not store everything in cookies?', 'They travel with every request, are size limited and can be read or edited by the user.'],
            ['S', 'How do you prevent session fixation?', 'Call request.changeSessionId() after login and avoid accepting ids from the URL.'],
            ['S', 'How do you scale sessions across servers?', 'Use sticky load balancing, session replication, or an external store; or keep stateless signed tokens.']],
        [['Using encodeURL for cookie-less browsers.',
            r`HttpSession s = req.getSession();
String link = res.encodeURL("cart");
out.println("<a href='" + link + "'>Cart</a>");

// OUTPUT: (varies)
// first request: cart;jsessionid=3F2A...   later with cookie: cart`],
            ['Setting a safe cookie.',
                r`Cookie c = new Cookie("theme", "dark");
c.setMaxAge(60 * 60 * 24 * 30);   // 30 days
c.setHttpOnly(true);
c.setSecure(true);
c.setPath("/");
res.addCookie(c);

// OUTPUT:
// Set-Cookie: theme=dark; Max-Age=2592000; Path=/; Secure; HttpOnly`]],
        [['Login with session fixation protection.',
            r`if (valid(user, pass)) {
    req.getSession();                 // make sure one exists
    req.changeSessionId();            // new id after login
    req.getSession().setAttribute("user", user);
}

// OUTPUT:
// The pre-login JSESSIONID is no longer valid after login.`],
            ['Choosing by need.',
                r`// Shopping cart across pages     -> HttpSession
// Remember me for 30 days         -> persistent cookie with a signed token
// Two-step form                   -> hidden fields
// Cookies blocked, legacy client  -> URL rewriting

// OUTPUT:
// Rule of thumb: session for identity, cookie for preference, hidden for one flow.`]]
    ),
    'web-xml-deployment-descriptor': x(
        ['<b>web.xml</b> is the deployment descriptor in <code>WEB-INF/</code>. It tells the container which servlets, filters, listeners and settings the application uses.',
            '<b>Root element</b> is <code>&lt;web-app&gt;</code>. Inside go <code>&lt;servlet&gt;</code>, <code>&lt;servlet-mapping&gt;</code>, <code>&lt;welcome-file-list&gt;</code> and more.',
            '<b>Optional since Servlet 3.0</b>: annotations such as <code>@WebServlet</code> can replace most entries.'],
        ['<b>Welcome files</b>: <code>&lt;welcome-file-list&gt;</code> picks the page served for a directory URL such as <code>/</code>. The first existing file wins.',
            '<b>Other entries</b>: <code>&lt;context-param&gt;</code>, <code>&lt;filter&gt;</code>, <code>&lt;listener&gt;</code>, <code>&lt;session-config&gt;</code>, <code>&lt;error-page&gt;</code>, <code>&lt;security-constraint&gt;</code>.',
            '<b>Namespaces</b>: Tomcat 9 uses <code>javax.servlet</code> and the Java EE schema; Tomcat 10 and Jakarta EE 9+ use <code>jakarta.servlet</code> and the Jakarta schema.'],
        ['<b>web.xml versus annotations</b>: web.xml wins when both set the same thing, and only web.xml can change settings without recompiling.',
            '<b>metadata-complete</b>: <code>metadata-complete="true"</code> stops annotation scanning, which speeds startup. <code>web-fragment.xml</code> in libraries adds parts.',
            '<b>Ordering</b>: filters run in the order their mappings appear in web.xml; with annotations the order is not defined.'],
        [['F', 'Where is web.xml placed?', 'Inside the WEB-INF folder of the web application.'],
            ['F', 'Is web.xml mandatory?', 'No, not since Servlet 3.0, if you use annotations.'],
            ['M', 'What does welcome-file-list do?', 'It lists the files tried, in order, when the request is for a directory like /.'],
            ['M', 'What if web.xml and annotation both configure a servlet?', 'The web.xml value overrides the annotation.'],
            ['S', 'What is a web-fragment.xml?', 'A descriptor inside a library jar META-INF that adds servlets or filters to the app, with ordering rules.'],
            ['S', 'Why would you use metadata-complete?', 'To skip annotation scanning of all classes and jars, which shortens startup.']],
        [['Minimal web.xml with welcome file and error page.',
            r`<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee" version="6.0">
  <servlet>
    <servlet-name>Hello</servlet-name>
    <servlet-class>com.example.HelloServlet</servlet-class>
  </servlet>
  <servlet-mapping>
    <servlet-name>Hello</servlet-name>
    <url-pattern>/hello</url-pattern>
  </servlet-mapping>
  <welcome-file-list><welcome-file>index.html</welcome-file></welcome-file-list>
  <error-page><error-code>404</error-code><location>/404.html</location></error-page>
</web-app>

<!-- OUTPUT:
GET /app/        -> index.html
GET /app/hello   -> HelloServlet
GET /app/nothing -> 404.html -->`],
            ['Session timeout and listener.',
                r`<session-config><session-timeout>20</session-timeout></session-config>
<listener><listener-class>com.example.AppStartListener</listener-class></listener>

<!-- OUTPUT:
Sessions expire after 20 idle minutes;
AppStartListener runs at startup. -->`]],
        [['Same servlet with an annotation.',
            r`@WebServlet(name = "Hello", urlPatterns = {"/hello"}, loadOnStartup = 1)
public class HelloServlet extends HttpServlet { }

<!-- OUTPUT:
Equal to the web.xml servlet and servlet-mapping pair above. -->`],
            ['Security constraint.',
                r`<security-constraint>
  <web-resource-collection>
    <web-resource-name>Admin</web-resource-name>
    <url-pattern>/admin/*</url-pattern>
  </web-resource-collection>
  <auth-constraint><role-name>admin</role-name></auth-constraint>
</security-constraint>

<!-- OUTPUT:
Anyone opening /admin/* must log in with the admin role. -->`]]
    ),
    'servlet-mapping': x(
        ['<b>Servlet mapping</b> links a URL pattern to a servlet, so a request for <code>/hello</code> reaches the right class.',
            '<b>Pattern types</b>: exact (<code>/hello</code>), path prefix (<code>/api/*</code>), extension (<code>*.do</code>) and default (<code>/</code>).',
            '<b>Annotation form</b>: <code>@WebServlet("/hello")</code> does the same as the web.xml pair.'],
        ['<b>Precedence</b>: exact match first, then the longest path prefix, then extension, then the default servlet.',
            '<b>Several patterns</b>: one servlet can have many mappings, for example <code>/a</code> and <code>/b</code>.',
            '<b>Path info</b>: for <code>/api/users/5</code> matched by <code>/api/*</code>, <code>getServletPath()</code> is <code>/api</code> and <code>getPathInfo()</code> is <code>/users/5</code>.'],
        ['<b>Default servlet</b>: the pattern <code>/</code> catches everything not matched, and the container serves static files with it. <code>/*</code> is different and overrides everything, even JSPs.',
            '<b>Conflicts</b>: two servlets with the same pattern make the deployment fail or behave unpredictably.',
            '<b>Modern routing</b>: frameworks use one front controller on <code>/*</code> or <code>/</code> and route inside, as Spring DispatcherServlet does.'],
        [['F', 'What does servlet mapping do?', 'It maps a URL pattern to a servlet name so the container knows which servlet handles the request.'],
            ['F', 'Give an extension mapping.', 'url-pattern *.do, which matches any URL ending in .do.'],
            ['M', 'In what order are patterns matched?', 'Exact, longest path prefix, extension, then default.'],
            ['M', 'Difference between / and /*?', 'The first is the default servlet used when nothing else matches. The second matches every request and hides all others.'],
            ['S', 'What do getServletPath and getPathInfo return?', 'The matched part of the pattern and the remaining part after it.'],
            ['S', 'Why use a front controller?', 'One entry point handles security, logging and routing in one place, and it keeps URLs clean.']],
        [['Matching examples.',
            r`<!-- patterns:  /shop  /shop/*  *.do  /  -->
<!-- OUTPUT:
/shop        -> exact /shop
/shop/cart   -> /shop/*  (path prefix)
/login.do    -> *.do     (extension)
/logo.png    -> /        (default servlet, static file) -->`],
            ['Reading path parts.',
                r`// servlet mapped to /api/*, request GET /app/api/users/5?x=1
String ctx  = req.getContextPath();   // /app
String path = req.getServletPath();   // /api
String info = req.getPathInfo();      // /users/5
String qs   = req.getQueryString();   // x=1
System.out.println(ctx + " " + path + " " + info + " " + qs);

// OUTPUT:
// /app /api /users/5 x=1`]],
        [['Multiple mappings.',
            r`@WebServlet(urlPatterns = {"/home", "/index", "*.html5"})
public class HomeServlet extends HttpServlet { }

// OUTPUT:
// /home, /index and any x.html5 all reach HomeServlet.`],
            ['Longest prefix wins.',
                r`<!-- /api/* -> Generic,  /api/admin/* -> Admin -->
<!-- OUTPUT:
GET /api/admin/users -> Admin   (longer prefix)
GET /api/orders      -> Generic -->`]]
    ),
    'init-parameters': x(
        ['<b>Init parameter</b> is a name/value setting given to one servlet, read with <code>getInitParameter("name")</code> from <code>ServletConfig</code>.',
            '<b>Set in web.xml</b> with <code>&lt;init-param&gt;</code> inside <code>&lt;servlet&gt;</code>, or with <code>@WebInitParam</code> in an annotation.',
            '<b>Private</b> to that servlet: another servlet cannot see it. For app-wide values use context parameters.'],
        ['<b>When read</b>: the container calls <code>init(ServletConfig)</code> once, so read the values there and store them in fields.',
            '<b>Type</b>: values are always Strings. Convert with <code>Integer.parseInt</code> and handle a missing value (null).',
            '<b>Use cases</b>: a database name, page size, email sender address, feature flag per servlet.'],
        ['<b>Config without recompiling</b>: change web.xml and redeploy; keep secrets out and use environment variables or a vault instead.',
            '<b>Defaults</b>: always provide a fallback when <code>getInitParameter</code> returns null, and fail fast in <code>init</code> if a value is mandatory.',
            '<b>Thread safety</b>: values read in init and not changed are safe to share between request threads.'],
        [['F', 'What is an init parameter?', 'A configuration value for a single servlet, defined in web.xml or by @WebInitParam.'],
            ['F', 'Which object reads it?', 'ServletConfig, through getInitParameter.'],
            ['M', 'When is it read?', 'In init(), which runs once after the servlet is created.'],
            ['M', 'Can two servlets share an init parameter?', 'No. Each servlet has its own. Use context-param to share.'],
            ['S', 'Why not store passwords in init-param?', 'web.xml is plain text inside the war and in source control. Use environment variables or a secret store.'],
            ['S', 'What does getInitParameterNames return?', 'An Enumeration of all parameter names for that servlet.']],
        [['web.xml init-param and servlet.',
            r`<servlet>
  <servlet-name>Mail</servlet-name>
  <servlet-class>com.example.MailServlet</servlet-class>
  <init-param>
    <param-name>sender</param-name>
    <param-value>noreply@example.com</param-value>
  </init-param>
</servlet>

public class MailServlet extends HttpServlet {
    private String sender;
    @Override public void init() {
        sender = getInitParameter("sender");
    }
}

<!-- OUTPUT:
sender field holds noreply@example.com after init. -->`],
            ['Annotation form.',
                r`@WebServlet(urlPatterns = "/page", initParams = {
    @WebInitParam(name = "size", value = "20") })
public class PageServlet extends HttpServlet {
    int size;
    public void init() { size = Integer.parseInt(getInitParameter("size")); }
}

// OUTPUT:
// size = 20`]],
        [['Listing all init parameters.',
            r`Enumeration<String> names = getServletConfig().getInitParameterNames();
while (names.hasMoreElements()) {
    String n = names.nextElement();
    System.out.println(n + " = " + getInitParameter(n));
}

// OUTPUT: (varies)
// sender = noreply@example.com`],
            ['Safe default.',
                r`String v = getInitParameter("size");
int size = (v == null) ? 10 : Integer.parseInt(v);
System.out.println("page size " + size);

// OUTPUT:
// page size 10   (when the parameter is not set)`]]
    ),
    'context-parameters': x(
        ['<b>Context parameter</b> is an application-wide setting, defined with <code>&lt;context-param&gt;</code> directly under <code>&lt;web-app&gt;</code>.',
            '<b>Read</b> with <code>getServletContext().getInitParameter("name")</code>. Every servlet, filter and JSP in the app can read it.',
            '<b>Versus init-param</b>: init-param belongs to one servlet through <code>ServletConfig</code>; context-param belongs to the whole app through <code>ServletContext</code>.'],
        ['<b>Read only</b>: context parameters cannot be changed at run time. For shared changing data use <code>setAttribute</code> on the context.',
            '<b>Typical values</b>: database URL, application name, default locale, admin e-mail.',
            '<b>Listener</b>: read them in a <code>ServletContextListener</code> at startup to build shared resources such as a connection pool.'],
        ['<b>Parameter versus attribute</b>: parameters are String configuration from the descriptor; attributes are live objects set by code and need thread-safe handling.',
            '<b>Environment</b>: use different values per environment with overrides (system properties, JNDI env-entry) instead of editing the war.',
            '<b>Secrets</b>: never keep passwords in plain context-param; use JNDI datasources or a secret store.'],
        [['F', 'What is a context parameter?', 'A configuration value shared by the whole web application, defined with context-param in web.xml.'],
            ['F', 'Which object reads it?', 'ServletContext, using getInitParameter.'],
            ['M', 'Difference between ServletConfig and ServletContext?', 'Config is per servlet. Context is per application and is shared by all servlets.'],
            ['M', 'Can you change a context parameter at run time?', 'No. They are read only. Use context attributes for changing values.'],
            ['S', 'Where do you build shared resources from context params?', 'In a ServletContextListener contextInitialized method, then store them as context attributes.'],
            ['S', 'Is the ServletContext thread safe?', 'The object is, but attributes you store in it are shared by all threads and must be safe themselves.']],
        [['Define and read a context parameter.',
            r`<context-param>
  <param-name>appName</param-name>
  <param-value>JavaSchoolLab</param-value>
</context-param>

ServletContext ctx = getServletContext();
String app = ctx.getInitParameter("appName");
System.out.println(app);

// OUTPUT:
// JavaSchoolLab`],
            ['Listener using it at startup.',
                r`@WebListener
public class Boot implements ServletContextListener {
    public void contextInitialized(ServletContextEvent e) {
        ServletContext c = e.getServletContext();
        String url = c.getInitParameter("dbUrl");
        c.setAttribute("pool", createPool(url));
    }
}

// OUTPUT:
// pool is created once at startup and shared as an attribute.`]],
        [['Config versus context side by side.',
            r`String mine   = getServletConfig().getInitParameter("size");   // this servlet
String shared = getServletContext().getInitParameter("appName");  // whole app
System.out.println(mine + " / " + shared);

// OUTPUT: (varies)
// 20 / JavaSchoolLab`],
            ['Listing context parameters.',
                r`Enumeration<String> en = getServletContext().getInitParameterNames();
while (en.hasMoreElements()) System.out.println(en.nextElement());

// OUTPUT: (varies)
// appName
// dbUrl`]]
    )
};

export const jsp5Deep: Record<string, Deep> = {
    'hiddenformfields': dv(
        [`<p>A hidden field is plain form data with no visual control.</p><ul><li><b>Encoding:</b> the browser adds it to the query string (GET) or the body (POST) like any other input.</li><li><b>Server view:</b> the container parses it into <code>getParameter</code> with no difference from a visible field.</li><li><b>Trust:</b> the value is client input, so the same validation applies as for a text box.</li></ul>`,
            r`<form method="post" action="checkout">
  <input type="hidden" name="productId" value="42">
  <input type="number" name="qty" value="1">
  <button>Buy</button>
</form>

// OUTPUT:
// POST /checkout  body: productId=42&qty=1`],
        [`<p>Variants of the technique:</p><ul><li><b>GET form:</b> hidden values appear in the URL and in logs.</li><li><b>POST form:</b> values go in the body, better for larger or private data.</li><li><b>Many values:</b> use several hidden inputs, or one input with an encoded string.</li><li><b>Arrays:</b> repeat the same name and read with <code>getParameterValues</code>.</li></ul>`,
            r`String[] ids = req.getParameterValues("itemId");
for (String id : ids) System.out.println("item " + id);

// OUTPUT:
// item 7
// item 9`],
        [`<p>Common mistakes:</p><ul><li><b>Trusting price or role:</b> reload from the database.</li><li><b>Unescaped output:</b> a value containing a quote breaks the HTML or enables XSS; escape it.</li><li><b>Secrets in hidden fields:</b> they are visible in the page source.</li><li><b>Lost state:</b> a page reached by a link, not a form, drops the values.</li></ul>`,
            r`static String escape(String s) {
    return s.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace("\"", "&quot;");
}

// OUTPUT:
// escape("a\"b") returns a&quot;b so the attribute stays intact.`],
        [`<p>Hidden fields cost nothing on the server, but large ones slow every page.</p><ul><li><b>Page weight:</b> each field is sent again on every submit.</li><li><b>Alternative:</b> past a few hundred bytes keep the data in the session and send an id.</li><li><b>Signing cost:</b> an HMAC is cheap compared with a database call.</li></ul>`,
            r`Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(key, "HmacSHA256"));
String sig = Base64.getUrlEncoder().withoutPadding()
    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));

// OUTPUT: (varies)
// sig is sent as a second hidden field and checked on the next request.`],
        [`<p>Scenario: a three-page registration wizard.</p><ul><li><b>Design:</b> store partial answers in the session, and use hidden fields only for the step number and a CSRF token.</li><li><b>Back button:</b> the step field lets the server detect out-of-order posts.</li></ul>`,
            r`int step = Integer.parseInt(req.getParameter("step"));
int expected = (Integer) session.getAttribute("step");
if (step != expected) {
    res.sendRedirect("step" + expected);
    return;
}

// OUTPUT:
// A tampered or replayed step number is redirected to the correct page.`]
    ),
    'sessiontrackingcomparison': dv(
        [`<p>All techniques give the server a key that identifies the client.</p><ul><li><b>Cookie:</b> the browser stores <code>JSESSIONID</code> and sends it in the <code>Cookie</code> header.</li><li><b>URL rewriting:</b> the id is added to the path as <code>;jsessionid=...</code>.</li><li><b>Hidden field:</b> the id or state sits in the form body.</li><li><b>HttpSession:</b> the container maps the id to a server-side map of attributes.</li></ul>`,
            r`HttpSession s = req.getSession(true);
System.out.println(s.getId() + " new=" + s.isNew());
System.out.println("timeout s=" + s.getMaxInactiveInterval());

// OUTPUT: (varies)
// 8C1F... new=true
// timeout s=1800`],
        [`<p>Comparison at a glance:</p><ul><li><b>Cookies:</b> client store, any page, can be blocked.</li><li><b>URL rewriting:</b> any client, ids leak in URLs.</li><li><b>Hidden fields:</b> form chains only, no cookies needed.</li><li><b>HttpSession:</b> server store, full objects, uses one of the other three to carry the id.</li></ul>`,
            r`<!-- Technique      Stores on   Survives restart  Needs cookies
     Cookie         client      yes (max age)     yes
     URL rewriting  URL         no                no
     Hidden field   page        no                no
     HttpSession    server      no                usually -->

<!-- OUTPUT: a summary table only, nothing is executed. -->`],
        [`<p>Mistakes:</p><ul><li><b>Cookie without HttpOnly:</b> scripts can steal it.</li><li><b>Large objects in the session:</b> memory grows per user.</li><li><b>No logout invalidate:</b> call <code>session.invalidate()</code>.</li><li><b>Non-serializable attributes:</b> replication and restarts fail.</li></ul>`,
            r`public void doGet(HttpServletRequest req, HttpServletResponse res)
        throws IOException {
    HttpSession s = req.getSession(false);
    if (s != null) s.invalidate();
    res.sendRedirect("login.html");
}

// OUTPUT:
// The session is destroyed and the user lands on the login page.`],
        [`<p>Tuning:</p><ul><li><b>Timeout:</b> set <code>session-timeout</code> to the real need, not hours.</li><li><b>Lazy creation:</b> use <code>getSession(false)</code> on public pages so crawlers do not create sessions.</li><li><b>Size:</b> keep only ids and small objects.</li><li><b>Clustering:</b> prefer an external store for many nodes.</li></ul>`,
            r`<session-config>
  <session-timeout>15</session-timeout>
  <cookie-config><http-only>true</http-only><secure>true</secure></cookie-config>
  <tracking-mode>COOKIE</tracking-mode>
</session-config>

<!-- OUTPUT:
15 minute idle timeout, safe cookie, no URL rewriting. -->`],
        [`<p>Scenario: an online shop.</p><ul><li><b>Cart:</b> in the session.</li><li><b>Guest preferences:</b> a 90 day cookie for language.</li><li><b>Checkout CSRF:</b> hidden token.</li><li><b>Mobile apps:</b> signed tokens in a header instead of cookies.</li></ul>`,
            r`session.setAttribute("cart", cart);
Cookie lang = new Cookie("lang", "hi");
lang.setMaxAge(90 * 24 * 3600);
res.addCookie(lang);

// OUTPUT: (varies)
// Set-Cookie: lang=hi; Max-Age=7776000   plus JSESSIONID for the cart`]
    ),
    'web-xml-deployment-descriptor': dv(
        [`<p>The container reads the descriptor at deployment.</p><ul><li><b>Parse:</b> web.xml is validated against the schema and merged with annotations and web-fragment.xml files.</li><li><b>Build:</b> it creates servlet definitions, mappings, filters in order and listeners.</li><li><b>Startup:</b> listeners fire, then servlets with <code>load-on-startup</code> are initialized in ascending order.</li><li><b>Lazy:</b> others are created at the first request.</li></ul>`,
            r`<servlet>
  <servlet-name>Warm</servlet-name>
  <servlet-class>com.example.WarmServlet</servlet-class>
  <load-on-startup>2</load-on-startup>
</servlet>

<!-- OUTPUT: (varies)
INFO: WarmServlet init called during deployment, before any request. -->`],
        [`<p>Main elements and options:</p><ul><li><b>welcome-file-list:</b> tried in order for directory URLs.</li><li><b>filter and filter-mapping:</b> by url-pattern or servlet-name, with dispatcher types.</li><li><b>error-page:</b> by status code or exception type.</li><li><b>mime-mapping:</b> extension to content type.</li><li><b>session-config:</b> timeout, cookie settings, tracking modes.</li><li><b>display-name:</b> label for tools.</li></ul>`,
            r`<error-page>
  <exception-type>java.lang.IllegalStateException</exception-type>
  <location>/error.jsp</location>
</error-page>
<mime-mapping><extension>json</extension><mime-type>application/json</mime-type></mime-mapping>
<welcome-file-list>
  <welcome-file>index.jsp</welcome-file>
  <welcome-file>index.html</welcome-file>
</welcome-file-list>

<!-- OUTPUT:
GET / serves index.jsp if it exists, else index.html. -->`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong schema or version:</b> an old 2.3 DTD turns off newer features such as EL.</li><li><b>Servlet-name mismatch:</b> mapping name differs from the servlet name, so deployment fails.</li><li><b>Missing leading slash:</b> url-pattern <code>hello</code> is invalid; use <code>/hello</code>.</li><li><b>Duplicate mapping:</b> same pattern for two servlets.</li><li><b>javax versus jakarta:</b> a class built for the wrong package fails with ClassNotFoundException.</li></ul>`,
            r`<!-- WRONG -->
<servlet-mapping><servlet-name>Hello</servlet-name><url-pattern>hello</url-pattern></servlet-mapping>
<!-- RIGHT -->
<servlet-mapping><servlet-name>Hello</servlet-name><url-pattern>/hello</url-pattern></servlet-mapping>

<!-- OUTPUT:
WRONG: Invalid <url-pattern> hello in servlet mapping (container message varies). -->`],
        [`<p>Tuning with the descriptor:</p><ul><li><b>metadata-complete:</b> skips class scanning for faster start.</li><li><b>load-on-startup:</b> moves slow initialization out of the first request.</li><li><b>absolute-ordering:</b> controls fragment order and scanning.</li><li><b>Compression and caching:</b> usually set in the container, not in web.xml.</li></ul>`,
            r`<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee" version="6.0"
         metadata-complete="true">
  <absolute-ordering/>
</web-app>

<!-- OUTPUT: (varies)
Startup is faster;
annotations like @WebServlet are no longer scanned. -->`],
        [`<p>Scenario: moving from XML to annotations.</p><ul><li><b>Keep in XML:</b> security, error pages, session config, filter order.</li><li><b>Move to annotations:</b> simple servlets and listeners.</li><li><b>Rule:</b> one place per setting, to avoid surprises when XML overrides annotation.</li></ul>`,
            r`@WebServlet("/report")
public class ReportServlet extends HttpServlet { }
// web.xml still holds: session-config, error-page, security-constraint

// OUTPUT:
// Code owns routing, the descriptor owns environment and policy.`]
    ),
    'servlet-mapping': dv(
        [`<p>The container matches the request path, after removing the context path, in a fixed order.</p><ul><li><b>1. Exact:</b> the whole path equals a pattern.</li><li><b>2. Path prefix:</b> the longest pattern ending in <code>/*</code> that matches.</li><li><b>3. Extension:</b> the last segment ends with the <code>*.ext</code> suffix.</li><li><b>4. Default:</b> the servlet mapped to <code>/</code>. If none, the container built-in one serves files.</li></ul>`,
            r`// mappings: /a/b  /a/*  /a/b/*  *.jsp  /
// OUTPUT:
// /a/b      -> exact /a/b
// /a/b/c    -> /a/b/*   (longest prefix)
// /a/x      -> /a/*
// /p/q.jsp  -> *.jsp (JSP engine)
// /p/q.css  -> / (default servlet)`],
        [`<p>Pattern rules:</p><ul><li><b>Exact:</b> starts with <code>/</code>, no wildcard.</li><li><b>Prefix:</b> starts with <code>/</code> and ends with <code>/*</code>.</li><li><b>Extension:</b> starts with <code>*.</code> with no slash.</li><li><b>Empty string:</b> maps the context root only.</li><li><b>Welcome files:</b> a directory request is first mapped, then the welcome list is tried.</li></ul>`,
            r`<servlet-mapping>
  <servlet-name>Root</servlet-name>
  <url-pattern></url-pattern>
</servlet-mapping>

<!-- OUTPUT:
Only GET /app (the context root) goes to Root, not /app/anything. -->`],
        [`<p>Mistakes:</p><ul><li><b>Using /* for a servlet:</b> JSPs and static files stop working.</li><li><b>Extension with a slash:</b> <code>/*.do</code> is invalid; use <code>*.do</code>.</li><li><b>Forgetting the context path in links:</b> use <code>req.getContextPath()</code>.</li><li><b>Relative links after path-info:</b> <code>/api/x/y</code> changes how relative links resolve.</li></ul>`,
            r`out.println("<a href='" + req.getContextPath() + "/hello'>Hello</a>");

// OUTPUT: (varies)
// <a href='/myapp/hello'>Hello</a>`],
        [`<p>Matching is cheap. The container builds a lookup structure at startup, so request cost does not grow noticeably with mappings.</p><ul><li><b>Keep patterns specific:</b> clearer and avoids shadowing.</li><li><b>Static assets:</b> serve through the default servlet or a CDN, not through your front controller.</li><li><b>Filters:</b> map them narrowly so they do not run on images.</li></ul>`,
            r`<filter-mapping>
  <filter-name>AuthFilter</filter-name>
  <url-pattern>/secure/*</url-pattern>
  <dispatcher>REQUEST</dispatcher>
</filter-mapping>

<!-- OUTPUT:
AuthFilter runs only for /secure/* requests. -->`],
        [`<p>Scenario: a REST style API on a plain servlet.</p><ul><li><b>Map:</b> <code>/api/*</code>.</li><li><b>Route:</b> split <code>getPathInfo()</code> inside the servlet.</li><li><b>Static site:</b> left to the default servlet.</li></ul>`,
            r`@WebServlet("/api/*")
public class Api extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        String[] p = req.getPathInfo().substring(1).split("/");
        res.getWriter().println(p[0] + " id=" + (p.length > 1 ? p[1] : "none"));
    }
}

// OUTPUT:
// GET /app/api/users/5 -> users id=5`]
    ),
    'init-parameters': dv(
        [`<p>How init parameters reach the servlet:</p><ul><li><b>Parse:</b> the container reads <code>init-param</code> entries into a map for that servlet.</li><li><b>Create:</b> it builds a <code>ServletConfig</code> holding the map and the context.</li><li><b>Init:</b> it calls <code>init(config)</code>; <code>GenericServlet</code> stores the config so <code>getInitParameter</code> works.</li></ul>`,
            r`@Override public void init(ServletConfig config) throws ServletException {
    super.init(config);                 // required, or getServletConfig() is null
    System.out.println(config.getServletName() + " "
        + config.getInitParameter("sender"));
}

// OUTPUT: (varies)
// Mail noreply@example.com`],
        [`<p>Options:</p><ul><li><b>web.xml:</b> several <code>init-param</code> blocks, each with an optional description.</li><li><b>Annotation:</b> <code>@WebInitParam</code> inside <code>initParams</code>.</li><li><b>Programmatic:</b> <code>ServletContext.addServlet</code> then <code>setInitParameter</code> in a listener.</li><li><b>Override:</b> web.xml beats the annotation.</li></ul>`,
            r`@WebListener
public class Register implements ServletContextListener {
    public void contextInitialized(ServletContextEvent e) {
        ServletRegistration.Dynamic d =
            e.getServletContext().addServlet("Dyn", new DynServlet());
        d.addMapping("/dyn");
        d.setInitParameter("mode", "fast");
    }
}

// OUTPUT:
// /dyn is served by DynServlet with mode=fast.`],
        [`<p>Mistakes:</p><ul><li><b>Overriding init(ServletConfig) without super:</b> config is lost; override <code>init()</code> instead.</li><li><b>Reading in doGet each time:</b> wasteful; read once.</li><li><b>NumberFormatException:</b> a bad value crashes init; the servlet is then unavailable.</li><li><b>Wrong place:</b> param under context-param is not visible through ServletConfig.</li></ul>`,
            r`@Override public void init() throws ServletException {
    try {
        size = Integer.parseInt(getInitParameter("size"));
    } catch (NumberFormatException e) {
        throw new ServletException("size must be a number", e);
    }
}

// OUTPUT:
// Deployment logs a clear message instead of failing later per request.`],
        [`<p>Tuning:</p><ul><li><b>Cache:</b> copy values to final fields in init.</li><li><b>Fail fast:</b> check mandatory values during startup.</li><li><b>Startup order:</b> use <code>load-on-startup</code> to see errors at deploy time.</li></ul>`,
            r`private int size;
private String sender;
public void init() throws ServletException {
    sender = Objects.requireNonNull(getInitParameter("sender"), "sender missing");
    size = Integer.parseInt(getInitParameter("size"));
}

// OUTPUT:
// Missing config stops the servlet at startup, not at the first user request.`],
        [`<p>Scenario: one servlet class reused with different settings.</p><ul><li><b>Two registrations:</b> the same class under two names, each with its own init-params and mappings.</li></ul>`,
            r`<servlet><servlet-name>Small</servlet-name><servlet-class>com.example.Grid</servlet-class>
  <init-param><param-name>rows</param-name><param-value>5</param-value></init-param></servlet>
<servlet><servlet-name>Big</servlet-name><servlet-class>com.example.Grid</servlet-class>
  <init-param><param-name>rows</param-name><param-value>50</param-value></init-param></servlet>

<!-- OUTPUT:
Two instances of Grid exist, one with rows=5 and one with rows=50. -->`]
    ),
    'context-parameters': dv(
        [`<p>How they work:</p><ul><li><b>Load:</b> the container reads every <code>context-param</code> into the single <code>ServletContext</code> of the app.</li><li><b>Access:</b> any component calls <code>getServletContext().getInitParameter</code>.</li><li><b>Immutable:</b> the API has no setter for parameters after startup (a listener may call <code>setInitParameter</code> before the context starts).</li></ul>`,
            r`ServletContext ctx = getServletContext();
System.out.println(ctx.getContextPath() + " " + ctx.getInitParameter("appName"));
System.out.println(ctx.getServerInfo());

// OUTPUT: (varies)
// /myapp JavaSchoolLab
// Apache Tomcat/10.1.x`],
        [`<p>Variants and related tools:</p><ul><li><b>context-param:</b> String configuration.</li><li><b>Context attribute:</b> <code>setAttribute</code>, any object, changes at run time.</li><li><b>env-entry and JNDI:</b> typed values from the server.</li><li><b>Properties file:</b> load with <code>getResourceAsStream</code>.</li></ul>`,
            r`try (InputStream in =
        getServletContext().getResourceAsStream("/WEB-INF/app.properties")) {
    Properties p = new Properties();
    p.load(in);
    System.out.println(p.getProperty("mail.host"));
}

// OUTPUT: (varies)
// smtp.example.com`],
        [`<p>Mistakes:</p><ul><li><b>Placing the tag inside a servlet element:</b> then it is an init-param; context-param belongs under web-app.</li><li><b>Mixing up the two getInitParameter calls:</b> ServletConfig versus ServletContext.</li><li><b>Mutable shared state:</b> attributes need synchronization or concurrent classes.</li><li><b>Secrets:</b> plain text in web.xml.</li></ul>`,
            r`String shared = getServletConfig().getInitParameter("appName");   // null: wrong object
String right  = getServletContext().getInitParameter("appName");   // correct

// OUTPUT:
// shared is null, right is JavaSchoolLab`],
        [`<p>Tuning:</p><ul><li><b>Read once:</b> at startup in a listener, and keep a parsed config object.</li><li><b>Concurrent attributes:</b> store immutable or concurrent objects.</li><li><b>Restart cost:</b> changing a context-param needs a redeploy or reload.</li></ul>`,
            r`public void contextInitialized(ServletContextEvent e) {
    ServletContext c = e.getServletContext();
    AppConfig cfg = new AppConfig(c.getInitParameter("appName"),
        Integer.parseInt(c.getInitParameter("maxUsers")));
    c.setAttribute("config", cfg);          // immutable object, safe to share
}

// OUTPUT:
// Servlets read the parsed AppConfig from the context with no repeated parsing.`],
        [`<p>Scenario: one war for three environments.</p><ul><li><b>Defaults:</b> put safe values in web.xml.</li><li><b>Overrides:</b> read system properties or environment variables first.</li><li><b>Result:</b> the same artifact is promoted from test to production.</li></ul>`,
            r`String url = System.getenv("DB_URL");
if (url == null) url = ctx.getInitParameter("dbUrl");    // fall back to descriptor
ctx.setAttribute("pool", createPool(url));

// OUTPUT: (varies)
// Production uses DB_URL; a developer machine uses the web.xml default.`]
    )
};
