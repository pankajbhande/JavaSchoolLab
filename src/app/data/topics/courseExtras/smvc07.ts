// Spring extras, batch smvc07 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc07Extras: Record<string, Extra> = {
    'mvc-request-headers': x(
        ['<b>Request headers</b> are name-value pairs the client sends before the body, such as <code>Accept</code>, <code>Content-Type</code>, <code>Authorization</code> and <code>User-Agent</code>; they describe the client and the request.',
            '<b>Reading them</b> in Spring MVC: use <code>@RequestHeader</code>, a <code>HttpHeaders</code> parameter, <code>RequestEntity</code> or <code>HttpServletRequest.getHeader()</code>.',
            '<b>Case-insensitive</b>: <code>content-type</code> and <code>Content-Type</code> are the same header, and Spring treats them so.'],
        ['<b>Use cases</b>: content negotiation (<code>Accept</code>), authentication tokens (<code>Authorization</code>), API versions and correlation ids (<code>X-Request-Id</code>).',
            '<b>Mapping by header</b>: <code>@GetMapping(headers = "X-Api-Version=2")</code> or <code>consumes</code> and <code>produces</code> choose a handler by header.',
            '<b>Multi-value</b>: one header name can appear more than once; <code>HttpHeaders.get(name)</code> returns a list.'],
        ['<b>Never trust</b> client headers such as <code>X-Forwarded-For</code> unless a trusted proxy sets them; configure forwarded header handling on purpose.',
            '<b>Do not log</b> <code>Authorization</code> or cookie headers in plain text.',
            '<b>Cross-cutting</b> headers (request id, tenant) belong in a filter or interceptor, not in every controller method.'],
        [['F', 'What is a request header?', 'A name-value pair sent by the client with the HTTP request that carries metadata such as content type or credentials.'],
            ['F', 'How do you read a header in a controller?', 'Add a method parameter annotated with @RequestHeader, or take HttpHeaders or HttpServletRequest.'],
            ['M', 'How can a header choose the handler method?', 'Use the headers, consumes or produces attributes of @RequestMapping and its shortcuts.'],
            ['M', 'Are header names case sensitive?', 'No. HttpHeaders stores names case-insensitively.'],
            ['S', 'Why should X-Forwarded-For not be trusted blindly?', 'Any client can send it, so it can spoof the IP. Only accept it from known proxies.'],
            ['S', 'Where do you put a header needed by every request?', 'In a servlet filter or HandlerInterceptor, often copying it into MDC or a request attribute.']],
        [['Read two headers.',
            r`@RestController
class HeaderController {
    @GetMapping("/headers")
    String headers(@RequestHeader("User-Agent") String ua,
                   @RequestHeader HttpHeaders all) {
        return ua + " | accept=" + all.getAccept();
    }
}
// curl -H "User-Agent: demo" -H "Accept: application/json" localhost:8080/headers

// OUTPUT:
// demo | accept=[application/json]`],
            ['Select a handler by header.',
                r`@RestController
class VersionController {
    @GetMapping(path = "/api/info", headers = "X-Api-Version=1")
    String v1() { return "v1"; }

    @GetMapping(path = "/api/info", headers = "X-Api-Version=2")
    String v2() { return "v2"; }
}
// curl -H "X-Api-Version: 2" localhost:8080/api/info

// OUTPUT:
// v2`]],
        [['Test a header with MockMvc.',
            r`@WebMvcTest(HeaderController.class)
class HeaderControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void readsUserAgent() throws Exception {
        mvc.perform(get("/headers")
                .header("User-Agent", "demo")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(content().string(startsWith("demo")));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Iterate over all headers.',
                r`@GetMapping("/dump")
Map<String, List<String>> dump(@RequestHeader HttpHeaders headers) {
    return new TreeMap<>(headers);   // sorted copy for stable output
}
// curl -H "X-Trace: abc" localhost:8080/dump

// OUTPUT:
// {"Accept":["*/*"],"Host":["localhost:8080"],"X-Trace":["abc"]}`]]
    ),
    'mvc-requestheader': x(
        ['<b>@RequestHeader</b> binds an HTTP request header to a controller method parameter, for example <code>@RequestHeader("Accept-Language") String lang</code>.',
            '<b>Required by default</b>: a missing header gives 400; set <code>required = false</code> or <code>defaultValue</code> to relax it.',
            '<b>Type conversion</b>: the header text is converted to the parameter type (<code>int</code>, <code>Locale</code>, <code>Date</code>) like any request value.'],
        ['<b>Aggregates</b>: bind <code>Map&lt;String,String&gt;</code>, <code>MultiValueMap</code> or <code>HttpHeaders</code> to get every header.',
            '<b>Optional</b>: <code>Optional&lt;String&gt;</code> is the clean way to say "may be absent".',
            '<b>Name inference</b>: with the <code>-parameters</code> compiler flag the parameter name can be the header name, but explicit names are safer.'],
        ['<b>Resolver</b>: <code>RequestHeaderMethodArgumentResolver</code> reads the header and runs the <code>ConversionService</code>.',
            '<b>Missing header</b> raises <code>MissingRequestHeaderException</code>, which becomes a 400 response.',
            '<b>Secrets</b>: do not echo <code>Authorization</code> back in responses or logs; use security filters for auth.'],
        [['F', 'What does @RequestHeader do?', 'It binds a request header value to a method parameter.'],
            ['F', 'What happens if a required header is missing?', 'Spring throws MissingRequestHeaderException and answers 400 Bad Request.'],
            ['M', 'How do you make a header optional?', 'Use required = false, a defaultValue, or an Optional parameter.'],
            ['M', 'How do you read all headers?', 'Bind a Map, MultiValueMap or HttpHeaders parameter annotated with @RequestHeader.'],
            ['S', 'Which class resolves @RequestHeader?', 'RequestHeaderMethodArgumentResolver, with conversion through the ConversionService.'],
            ['S', 'Why prefer a filter over @RequestHeader for auth tokens?', 'Authentication is cross-cutting; a security filter runs before the controller and keeps controllers free of token parsing.']],
        [['Defaults and optional headers.',
            r`@GetMapping("/greet")
String greet(@RequestHeader(value = "Accept-Language",
                            defaultValue = "en") String lang,
             @RequestHeader(name = "X-Tenant", required = false) String tenant) {
    return "lang=" + lang + ", tenant=" + tenant;
}
// curl localhost:8080/greet

// OUTPUT:
// lang=en, tenant=null`],
            ['Typed header value.',
                r`@GetMapping("/limit")
String limit(@RequestHeader("X-Max-Items") int max) {
    return "max=" + (max * 2);
}
// curl -H "X-Max-Items: 21" localhost:8080/limit
// curl localhost:8080/limit

// OUTPUT:
// max=42
// (second call) HTTP 400 - Required header 'X-Max-Items' is not present`]],
        [['Test missing and present header.',
            r`@WebMvcTest(HeaderController.class)
class RequestHeaderTest {
    @Autowired MockMvc mvc;

    @Test
    void missingHeaderIs400() throws Exception {
        mvc.perform(get("/limit")).andExpect(status().isBadRequest());
    }

    @Test
    void presentHeaderWorks() throws Exception {
        mvc.perform(get("/limit").header("X-Max-Items", "5"))
           .andExpect(content().string("max=10"));
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`],
            ['Optional parameter.',
                r`@GetMapping("/trace")
String trace(@RequestHeader("X-Trace-Id") Optional<String> id) {
    return id.orElseGet(() -> UUID.randomUUID().toString());
}
// curl localhost:8080/trace

// OUTPUT: (varies)
// 5f1c0a52-8d7e-4c1b-9b1e-2f3a4d5e6f70`]]
    ),
    'mvc-cookies': x(
        ['<b>A cookie</b> is a small name-value pair that the server sets with the <code>Set-Cookie</code> response header; the browser returns it in the <code>Cookie</code> request header on later requests.',
            '<b>Purpose</b>: keep state over stateless HTTP, such as a session id, a language choice or a remember-me token.',
            '<b>Attributes</b> control behaviour: <code>Path</code>, <code>Max-Age</code>, <code>HttpOnly</code>, <code>Secure</code> and <code>SameSite</code>.'],
        ['<b>Read</b> with <code>@CookieValue</code> or <code>request.getCookies()</code>; <b>write</b> with <code>ResponseCookie</code> or <code>jakarta.servlet.http.Cookie</code>.',
            '<b>HttpOnly</b> hides the cookie from JavaScript, which limits theft by XSS; <b>Secure</b> sends it only over HTTPS.',
            '<b>SameSite</b> (Lax or Strict) reduces CSRF risk; the servlet <code>Cookie</code> class has no direct SameSite setter, so use <code>ResponseCookie</code>.'],
        ['<b>Size</b>: browsers allow about 4 KB per cookie, and every cookie travels on every request to the path, so keep them small.',
            '<b>Never store</b> secrets or trusted data (roles, prices) in a plain cookie; sign or encrypt it, or store it server side.',
            '<b>Session cookie</b> <code>JSESSIONID</code> is created by the container; tune it with <code>server.servlet.session.cookie.*</code> properties.'],
        [['F', 'What is a cookie?', 'A small piece of data the server asks the browser to store and send back with later requests.'],
            ['F', 'Which headers carry cookies?', 'Set-Cookie in the response and Cookie in the request.'],
            ['M', 'What does HttpOnly do?', 'It stops JavaScript from reading the cookie, reducing the impact of XSS.'],
            ['M', 'How do you set a cookie in Spring MVC?', 'Build a ResponseCookie and add it to the Set-Cookie header, or call response.addCookie with a servlet Cookie.'],
            ['S', 'How does SameSite help?', 'It stops the browser from sending the cookie on most cross-site requests, which blocks many CSRF attacks.'],
            ['S', 'Why not store a user role in a plain cookie?', 'The client can edit it. Use a signed token or keep the data in the server-side session.']],
        [['Set a cookie.',
            r`@GetMapping("/login")
ResponseEntity<String> login() {
    ResponseCookie cookie = ResponseCookie.from("theme", "dark")
        .httpOnly(true).secure(true).path("/").maxAge(Duration.ofDays(7))
        .sameSite("Lax").build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body("cookie set");
}

// OUTPUT:
// HTTP/1.1 200
// Set-Cookie: theme=dark; Path=/; Max-Age=604800; Secure; HttpOnly; SameSite=Lax`],
            ['Read all cookies.',
                r`@GetMapping("/cookies")
String all(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();      // null when none are sent
    if (cookies == null) return "none";
    return Arrays.stream(cookies)
        .map(c -> c.getName() + "=" + c.getValue())
        .collect(Collectors.joining(", "));
}
// curl -b "theme=dark;lang=en" localhost:8080/cookies

// OUTPUT:
// theme=dark, lang=en`]],
        [['Delete a cookie.',
            r`@GetMapping("/logout")
ResponseEntity<Void> logout() {
    ResponseCookie gone = ResponseCookie.from("theme", "")
        .path("/").maxAge(0).build();            // Max-Age=0 removes it
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, gone.toString()).build();
}

// OUTPUT:
// HTTP/1.1 204
// Set-Cookie: theme=; Path=/; Max-Age=0`],
            ['Test cookies with MockMvc.',
                r`@Test
void readsCookie() throws Exception {
    mvc.perform(get("/cookies").cookie(new Cookie("theme", "dark")))
       .andExpect(content().string("theme=dark"));
}

@Test
void setsCookie() throws Exception {
    mvc.perform(get("/login"))
       .andExpect(cookie().value("theme", "dark"))
       .andExpect(cookie().httpOnly("theme", true));
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]]
    ),
    'mvc-cookievalue': x(
        ['<b>@CookieValue</b> binds the value of a named request cookie to a controller method parameter, for example <code>@CookieValue("theme") String theme</code>.',
            '<b>Required by default</b>: a missing cookie gives 400 (<code>MissingRequestCookieException</code>); use <code>required = false</code> or <code>defaultValue</code>.',
            '<b>Type conversion</b> applies, so you can bind <code>int</code>, <code>boolean</code> or <code>Optional&lt;String&gt;</code>.'],
        ['<b>Cookie object</b>: declare the parameter as <code>jakarta.servlet.http.Cookie</code> to get name, path and age, not only the value.',
            '<b>Name</b> comes from <code>value</code> or <code>name</code>; do not rely on the parameter name alone.',
            '<b>Only reads</b>: it cannot set cookies; use <code>ResponseCookie</code> or <code>HttpServletResponse</code> for writing.'],
        ['<b>Resolver</b>: <code>ServletCookieValueMethodArgumentResolver</code> finds the cookie through the request and converts it.',
            '<b>Trust</b>: the value is client input, so validate it like any parameter and never treat it as proof of identity.',
            '<b>Browsers</b> send only cookies whose path, domain and Secure flag match the request.'],
        [['F', 'What is @CookieValue for?', 'It reads one cookie from the request into a method parameter.'],
            ['F', 'What if the cookie is absent?', 'By default a 400 error; set required = false or a defaultValue to avoid it.'],
            ['M', 'How do you get the whole Cookie object?', 'Use a parameter of type jakarta.servlet.http.Cookie with @CookieValue.'],
            ['M', 'Can @CookieValue set a cookie?', 'No. It only reads. Use ResponseCookie or HttpServletResponse.addCookie to write.'],
            ['S', 'Which class resolves @CookieValue?', 'ServletCookieValueMethodArgumentResolver in the handler adapter argument resolvers.'],
            ['S', 'Is a cookie value safe to trust?', 'No. The client controls it, so validate it and do not use it for authorization without a signature.']],
        [['Optional cookie with default.',
            r`@GetMapping("/theme")
String theme(@CookieValue(name = "theme", defaultValue = "light") String t) {
    return "theme=" + t;
}
// curl localhost:8080/theme
// curl -b "theme=dark" localhost:8080/theme

// OUTPUT:
// theme=light
// theme=dark`],
            ['Get the Cookie object.',
                r`@GetMapping("/visits")
String visits(@CookieValue(name = "visits", required = false) Cookie c) {
    int n = (c == null) ? 0 : Integer.parseInt(c.getValue());
    return "visits=" + (n + 1);
}
// curl -b "visits=4" localhost:8080/visits

// OUTPUT:
// visits=5`]],
        [['Test required cookie.',
            r`@WebMvcTest(CookieController.class)
class CookieValueTest {
    @Autowired MockMvc mvc;

    @Test
    void missingCookieIs400() throws Exception {
        mvc.perform(get("/need")).andExpect(status().isBadRequest());
    }

    @Test
    void cookieIsBound() throws Exception {
        mvc.perform(get("/need").cookie(new Cookie("sid", "abc")))
           .andExpect(content().string("sid=abc"));
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`],
            ['Cookie bound to a number.',
                r`@GetMapping("/page-size")
String size(@CookieValue(name = "size", defaultValue = "10") int size) {
    return "size=" + Math.min(size, 100);       // clamp client input
}
// curl -b "size=500" localhost:8080/page-size

// OUTPUT:
// size=100`]]
    ),
    'mvc-request-body': x(
        ['<b>The request body</b> is the payload after the headers, used by POST, PUT and PATCH to send JSON, XML, form data or files.',
            '<b>Spring reads it</b> through <code>HttpMessageConverter</code> objects, chosen by the <code>Content-Type</code> header; JSON uses Jackson.',
            '<b>Bind it</b> with <code>@RequestBody</code> to a Java object, <code>String</code> or <code>byte[]</code>; the stream can be read only once.'],
        ['<b>Content-Type decides</b>: <code>application/json</code> goes to Jackson, <code>text/plain</code> to the String converter; an unknown type gives 415.',
            '<b>Form data</b> (<code>application/x-www-form-urlencoded</code>) is not read with <code>@RequestBody</code>; use <code>@RequestParam</code> or <code>@ModelAttribute</code>.',
            '<b>GET and DELETE</b> normally have no body, so do not design APIs that depend on one.'],
        ['<b>Size limits</b>: cap body size (servlet container or gateway) to stop memory abuse.',
            '<b>Validate</b> the bound object with <code>@Valid</code> and never trust fields such as ids or roles.',
            '<b>Single read</b>: a filter that reads the stream must wrap the request (for example <code>ContentCachingRequestWrapper</code>) or later binding fails.'],
        [['F', 'What is the request body?', 'The data sent after the headers in requests such as POST and PUT, for example a JSON document.'],
            ['F', 'Which annotation reads it?', '@RequestBody.'],
            ['M', 'What chooses the converter?', 'The request Content-Type header, matched against the registered HttpMessageConverters.'],
            ['M', 'What status for an unsupported Content-Type?', '415 Unsupported Media Type.'],
            ['S', 'Why can the body not be read twice?', 'It is an InputStream that is consumed; to re-read it you must cache it with a wrapper.'],
            ['S', 'How do you protect against huge bodies?', 'Set limits at the server or gateway and validate sizes of collections and strings in the bound object.']],
        [['Receive JSON.',
            r`record Book(String title, int pages) {}

@PostMapping("/books")
Book add(@RequestBody Book book) {
    return book;
}
// curl -X POST localhost:8080/books -H "Content-Type: application/json" \
//      -d "{\"title\":\"Spring\",\"pages\":300}"

// OUTPUT:
// {"title":"Spring","pages":300}`],
            ['Raw text body.',
                r`@PostMapping(path = "/echo", consumes = MediaType.TEXT_PLAIN_VALUE)
String echo(@RequestBody String text) {
    return text.toUpperCase();
}
// curl -X POST localhost:8080/echo -H "Content-Type: text/plain" -d "hello"

// OUTPUT:
// HELLO`]],
        [['Test a JSON body.',
            r`@Test
void postsJson() throws Exception {
    mvc.perform(post("/books")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"Spring\",\"pages\":300}"))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.pages").value(300));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Wrong content type.',
                r`@Test
void wrongTypeIs415() throws Exception {
    mvc.perform(post("/books")
            .contentType(MediaType.TEXT_PLAIN)
            .content("title=Spring"))
       .andExpect(status().isUnsupportedMediaType());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-requestbody': x(
        ['<b>@RequestBody</b> tells Spring to read the HTTP request body and convert it to the method parameter using an <code>HttpMessageConverter</code>.',
            '<b>With JSON</b> and Jackson on the classpath, the body is deserialized into a record, class or <code>Map</code>.',
            '<b>Add @Valid</b> to run Bean Validation; failures raise <code>MethodArgumentNotValidException</code> and a 400 response.'],
        ['<b>Required by default</b>: an empty body gives 400; use <code>required = false</code> to allow it (the parameter is then null).',
            '<b>Generics</b>: <code>@RequestBody List&lt;Book&gt;</code> works because Spring keeps the generic type of the parameter.',
            '<b>Bad JSON</b> raises <code>HttpMessageNotReadableException</code> (400); a wrong media type raises 415.'],
        ['<b>Resolver</b>: <code>RequestResponseBodyMethodProcessor</code> reads the body and also handles <code>@ResponseBody</code>.',
            '<b>Mass assignment</b>: binding straight into an entity lets clients set fields like <code>id</code> or <code>role</code>; use a request DTO.',
            '<b>Unknown fields</b>: Spring Boot disables <code>FAIL_ON_UNKNOWN_PROPERTIES</code> by default, so extra JSON fields are ignored.'],
        [['F', 'What does @RequestBody do?', 'It converts the request body into a Java object for the controller parameter.'],
            ['F', 'Which status results from malformed JSON?', '400 Bad Request, from HttpMessageNotReadableException.'],
            ['M', 'How do you validate the body?', 'Put @Valid or @Validated on the parameter and annotate fields with jakarta.validation constraints.'],
            ['M', 'Difference between @RequestBody and @RequestParam?', '@RequestBody reads the whole body through a converter; @RequestParam reads a query or form parameter.'],
            ['S', 'Why use a DTO instead of an entity here?', 'To avoid mass assignment and to keep the API contract separate from the database model.'],
            ['S', 'Which class processes @RequestBody?', 'RequestResponseBodyMethodProcessor.']],
        [['Validated DTO.',
            r`record CreateUser(@NotBlank String name, @Email String email) {}

@PostMapping("/users")
ResponseEntity<String> create(@Valid @RequestBody CreateUser dto) {
    return ResponseEntity.status(201).body("created " + dto.name());
}
// curl -X POST localhost:8080/users -H "Content-Type: application/json" \
//      -d "{\"name\":\"Asha\",\"email\":\"asha@example.com\"}"

// OUTPUT:
// HTTP/1.1 201
// created Asha`],
            ['Optional body and list.',
                r`@PostMapping("/tags")
String tags(@RequestBody(required = false) List<String> tags) {
    return tags == null ? "no tags" : "count=" + tags.size();
}
// curl -X POST localhost:8080/tags -H "Content-Type: application/json" \
//      -d "[\"a\",\"b\"]"

// OUTPUT:
// count=2`]],
        [['Test validation failure.',
            r`@WebMvcTest(UserController.class)
class UserBodyTest {
    @Autowired MockMvc mvc;

    @Test
    void blankNameIs400() throws Exception {
        mvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\",\"email\":\"a@b.com\"}"))
           .andExpect(status().isBadRequest());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Handle bad JSON.',
                r`@RestControllerAdvice
class JsonErrors {
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> bad(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "malformed JSON body"));
    }
}
// curl -X POST localhost:8080/users -H "Content-Type: application/json" -d "{oops"

// OUTPUT:
// {"error":"malformed JSON body"}`]]
    ),
    'mvc-httpservletrequest': x(
        ['<b>HttpServletRequest</b> (<code>jakarta.servlet.http</code>) is the servlet API object that holds everything about the incoming request: method, URL, headers, parameters, cookies, body stream and session.',
            '<b>Spring injects it</b> into controller methods when you add it as a parameter; there is one object per request.',
            '<b>Prefer annotations</b> such as <code>@RequestParam</code> and <code>@RequestHeader</code> for simple needs, and use the raw request only for what they cannot do.'],
        ['<b>Common methods</b>: <code>getMethod()</code>, <code>getRequestURI()</code>, <code>getParameter()</code>, <code>getHeader()</code>, <code>getRemoteAddr()</code>, <code>getCookies()</code>.',
            '<b>Attributes</b>: <code>setAttribute</code> and <code>getAttribute</code> share data inside one request, for example between a filter and a controller.',
            '<b>Body</b>: <code>getInputStream()</code> or <code>getReader()</code> read it once, and you cannot use both on the same request.'],
        ['<b>Coupling</b>: using the servlet API ties the method to a servlet container and makes tests need a mock request.',
            '<b>Client IP</b>: <code>getRemoteAddr()</code> shows the proxy behind a load balancer; configure forwarded headers instead of parsing them by hand.',
            '<b>Not thread safe to share</b>: never store the request in a field or pass it to another thread after the request ends.'],
        [['F', 'What is HttpServletRequest?', 'The servlet API interface that represents the incoming HTTP request.'],
            ['F', 'How do you get it in a controller?', 'Declare it as a method parameter and Spring supplies the current request.'],
            ['M', 'What are request attributes?', 'Per-request key-value storage set with setAttribute, handy for passing data from filters to controllers.'],
            ['M', 'Difference between getParameter and getAttribute?', 'Parameters come from the client (query or form); attributes are set by server code.'],
            ['S', 'Why prefer @RequestParam to getParameter?', 'It is declarative, converts types, validates presence and makes the method easier to test.'],
            ['S', 'Why can getRemoteAddr be wrong behind a proxy?', 'It returns the proxy address; use forwarded headers handled by the container or Spring.']],
        [['Inspect the request.',
            r`@GetMapping("/info")
String info(HttpServletRequest req) {
    return req.getMethod() + " " + req.getRequestURI()
        + " q=" + req.getQueryString() + " ip=" + req.getRemoteAddr();
}
// curl "localhost:8080/info?a=1"

// OUTPUT:
// GET /info q=a=1 ip=127.0.0.1`],
            ['Pass data with an attribute.',
                r`@Component
class StartTimeFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        req.setAttribute("start", System.nanoTime());
        chain.doFilter(req, res);
    }
}

@GetMapping("/elapsed")
String elapsed(HttpServletRequest req) {
    long start = (Long) req.getAttribute("start");
    return "ok " + ((System.nanoTime() - start) >= 0);
}

// OUTPUT:
// ok true`]],
        [['Test with MockHttpServletRequest.',
            r`@Test
void infoShowsPath() throws Exception {
    mvc.perform(get("/info").queryParam("a", "1"))
       .andExpect(content().string(containsString("GET /info")));
}

// plain unit test without Spring
@Test
void unit() {
    MockHttpServletRequest req = new MockHttpServletRequest("GET", "/info");
    assertEquals("/info", req.getRequestURI());
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`],
            ['Read the raw body once.',
                r`@PostMapping("/raw")
String raw(HttpServletRequest req) throws IOException {
    String body = new String(req.getInputStream().readAllBytes(),
                             StandardCharsets.UTF_8);
    return "length=" + body.length();
}
// curl -X POST localhost:8080/raw -d "hello"

// OUTPUT:
// length=5`]]
    ),
    'mvc-httpservletresponse': x(
        ['<b>HttpServletResponse</b> (<code>jakarta.servlet.http</code>) represents the outgoing response: status code, headers, cookies and the body stream or writer.',
            '<b>Spring injects it</b> when it is a controller parameter, letting you write the response yourself.',
            '<b>Use it rarely</b>: return values, <code>ResponseEntity</code> and <code>@ResponseStatus</code> are cleaner for most responses.'],
        ['<b>Common methods</b>: <code>setStatus</code>, <code>setHeader</code>, <code>addCookie</code>, <code>sendRedirect</code>, <code>sendError</code>, <code>getWriter</code>, <code>getOutputStream</code>.',
            '<b>Streaming</b>: write a large file or CSV directly to <code>getOutputStream()</code> to avoid loading it into memory (or use <code>StreamingResponseBody</code>).',
            '<b>Writer or stream</b>: call one of <code>getWriter</code> or <code>getOutputStream</code>, not both.'],
        ['<b>Committed</b>: once headers and some body are flushed, you cannot change the status or headers; late errors cannot become a clean error page.',
            '<b>Void methods</b>: if a handler writes the response itself, return <code>void</code> so Spring does not try to render a view.',
            '<b>Download safety</b>: set <code>Content-Disposition</code> and a correct <code>Content-Type</code>, and never put unchecked user input in the file name.'],
        [['F', 'What is HttpServletResponse?', 'The servlet API object used to build the HTTP response: status, headers and body.'],
            ['F', 'How do you redirect with it?', 'Call response.sendRedirect(url), or return "redirect:/path" from a view controller.'],
            ['M', 'When is the response committed?', 'When status and headers have been sent to the client, often after the buffer is flushed.'],
            ['M', 'ResponseEntity or HttpServletResponse?', 'ResponseEntity for normal cases; the raw response for streaming or special low-level control.'],
            ['S', 'Why return void when you write the body yourself?', 'So the DispatcherServlet knows the response is already handled and skips view resolution.'],
            ['S', 'How do you stream a big download?', 'Write to the output stream in chunks or return StreamingResponseBody, avoiding a full in-memory copy.']],
        [['Write status, header and body.',
            r`@GetMapping("/plain")
void plain(HttpServletResponse res) throws IOException {
    res.setStatus(HttpServletResponse.SC_OK);
    res.setContentType("text/plain;charset=UTF-8");
    res.setHeader("X-App", "demo");
    res.getWriter().write("written by hand");
}

// OUTPUT:
// HTTP/1.1 200
// X-App: demo
// written by hand`],
            ['CSV download.',
                r`@GetMapping("/report.csv")
void csv(HttpServletResponse res) throws IOException {
    res.setContentType("text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"report.csv\"");
    PrintWriter w = res.getWriter();
    w.println("id,name");
    w.println("1,Asha");
}

// OUTPUT:
// id,name
// 1,Asha`]],
        [['Test the response.',
            r`@Test
void writesBody() throws Exception {
    mvc.perform(get("/plain"))
       .andExpect(status().isOk())
       .andExpect(header().string("X-App", "demo"))
       .andExpect(content().string("written by hand"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Redirect and error.',
                r`@GetMapping("/old")
void old(HttpServletResponse res) throws IOException {
    res.sendRedirect("/new");               // 302 with Location header
}

@GetMapping("/gone")
void gone(HttpServletResponse res) throws IOException {
    res.sendError(HttpServletResponse.SC_NOT_FOUND, "no such page");
}

// OUTPUT:
// GET /old  -> HTTP 302, Location: /new
// GET /gone -> HTTP 404`]]
    ),
    'mvc-httpsession': x(
        ['<b>HttpSession</b> is a server-side object that stores data for one user across several requests; the browser holds only the session id in the <code>JSESSIONID</code> cookie.',
            '<b>Get it</b> by adding <code>HttpSession</code> as a controller parameter (it is created when first used), or with <code>request.getSession(false)</code> to avoid creating one.',
            '<b>Store data</b> with <code>setAttribute</code> and <code>getAttribute</code>; values should be serializable and small.'],
        ['<b>Timeout</b>: the container expires idle sessions; set it with <code>server.servlet.session.timeout</code> or <code>setMaxInactiveInterval</code>.',
            '<b>Logout</b>: call <code>session.invalidate()</code> to remove all data.',
            '<b>@SessionAttributes</b> and <code>@SessionAttribute</code> are Spring helpers built on the same session.'],
        ['<b>Scaling</b>: sessions live in server memory, so multiple instances need sticky sessions or shared storage such as Spring Session with Redis.',
            '<b>Session fixation</b>: change the id after login (<code>changeSessionId</code>); Spring Security does this by default.',
            '<b>Memory</b>: do not keep large objects or entities in the session; keep ids and load data when needed.'],
        [['F', 'What is HttpSession?', 'A server-side store of per-user data kept between requests and tied to a session id cookie.'],
            ['F', 'How does the server recognise the user?', 'The browser sends the JSESSIONID cookie, and the container looks up the session.'],
            ['M', 'getSession() versus getSession(false)?', 'getSession() creates a session if none exists; getSession(false) returns null instead.'],
            ['M', 'How do you end a session?', 'Call invalidate(), or let the timeout expire.'],
            ['S', 'What is session fixation and the fix?', 'An attacker sets a known session id before login. Fix by issuing a new id on login, as Spring Security does.'],
            ['S', 'How do you scale sessions across servers?', 'Use sticky sessions or externalize them with Spring Session (Redis or JDBC), or go stateless with tokens.']],
        [['Count visits.',
            r`@GetMapping("/visit")
String visit(HttpSession session) {
    Integer n = (Integer) session.getAttribute("count");
    n = (n == null) ? 1 : n + 1;
    session.setAttribute("count", n);
    return "visit " + n + " id=" + session.getId().substring(0, 4) + "...";
}
// call twice with the same cookie jar: curl -c jar -b jar localhost:8080/visit

// OUTPUT: (varies)
// visit 1 id=A1B2...
// visit 2 id=A1B2...`],
            ['Logout.',
                r`@PostMapping("/logout")
String logout(HttpSession session) {
    session.invalidate();            // all attributes removed
    return "bye";
}
# application.properties
# server.servlet.session.timeout=15m

// OUTPUT:
// bye`]],
        [['Test with MockHttpSession.',
            r`@Test
void countsAcrossRequests() throws Exception {
    MockHttpSession session = new MockHttpSession();
    mvc.perform(get("/visit").session(session))
       .andExpect(content().string(startsWith("visit 1")));
    mvc.perform(get("/visit").session(session))
       .andExpect(content().string(startsWith("visit 2")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Read without creating.',
                r`@GetMapping("/whoami")
String whoami(HttpServletRequest req) {
    HttpSession s = req.getSession(false);       // no new session
    if (s == null) return "anonymous";
    return "user=" + s.getAttribute("user");
}
// curl localhost:8080/whoami

// OUTPUT:
// anonymous`]]
    ),
    'mvc-principal': x(
        ['<b>Principal</b> (<code>java.security.Principal</code>) represents the authenticated user; its <code>getName()</code> returns the username.',
            '<b>Spring MVC injects it</b> as a controller parameter; it is null when no one is logged in and no security is configured.',
            '<b>With Spring Security</b> the real object is an <code>Authentication</code> (a Principal) holding authorities and details.'],
        ['<b>Richer access</b>: use <code>Authentication</code> or <code>@AuthenticationPrincipal</code> to get your own user type instead of only a name.',
            '<b>Servlet API</b>: <code>request.getUserPrincipal()</code> and <code>request.isUserInRole()</code> expose the same identity.',
            '<b>Authorization</b> belongs in security config or <code>@PreAuthorize</code>, not in manual Principal checks.'],
        ['<b>Source</b>: the principal comes from the <code>SecurityContext</code>, filled by the security filter chain before MVC runs.',
            '<b>Never accept</b> a user id from the request when the Principal already tells you who is calling; that prevents acting on other accounts.',
            '<b>Async threads</b>: the security context does not follow plain new threads, so pass the user explicitly.'],
        [['F', 'What is a Principal?', 'An object that represents the currently authenticated user, with getName() for the username.'],
            ['F', 'How do you get the user in a controller?', 'Add a Principal parameter, or use Authentication or @AuthenticationPrincipal.'],
            ['M', 'Principal versus Authentication?', 'Authentication extends Principal and adds credentials, authorities and details.'],
            ['M', 'What does @AuthenticationPrincipal do?', 'It injects the principal object (for example your UserDetails) from the Authentication.'],
            ['S', 'Why use the Principal instead of a userId parameter?', 'A client-supplied id can be forged. The Principal is set by the server after authentication.'],
            ['S', 'Where is the principal stored per request?', 'In the SecurityContext held by SecurityContextHolder, a thread-bound holder filled by the security filter chain.']],
        [['Principal parameter.',
            r`@GetMapping("/me")
String me(Principal principal) {
    return "hello " + principal.getName();
}
// curl -u asha:secret localhost:8080/me

// OUTPUT:
// hello asha`],
            ['@AuthenticationPrincipal.',
                r`@GetMapping("/profile")
String profile(@AuthenticationPrincipal UserDetails user,
               Authentication auth) {
    return user.getUsername() + " roles=" + auth.getAuthorities();
}
// curl -u asha:secret localhost:8080/profile

// OUTPUT:
// asha roles=[ROLE_USER]`]],
        [['Test with a mock user.',
            r`@WebMvcTest(MeController.class)
class PrincipalTest {
    @Autowired MockMvc mvc;

    @Test
    @WithMockUser(username = "asha")
    void returnsName() throws Exception {
        mvc.perform(get("/me")).andExpect(content().string("hello asha"));
    }

    @Test
    void anonymousIs401() throws Exception {
        mvc.perform(get("/me")).andExpect(status().isUnauthorized());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`],
            ['Own data only.',
                r`@GetMapping("/orders")
List<Order> mine(Principal principal) {
    // the owner comes from the login, never from a request parameter
    return orderService.findByOwner(principal.getName());
}

// OUTPUT:
// [{"id":7,"owner":"asha","total":250.0}]`]]
    )
};

export const smvc07Deep: Record<string, Deep> = {
    'mvc-request-headers': dv(
        [`<p>How a header reaches your method:</p><ul><li>The servlet container parses the header lines into the request.</li><li><code>DispatcherServlet</code> finds a handler, and <code>RequestMappingHandlerAdapter</code> runs its argument resolvers.</li><li><code>RequestHeaderMethodArgumentResolver</code> calls <code>request.getHeader</code> and converts the text.</li><li><code>RequestHeaderMapMethodArgumentResolver</code> handles Map and HttpHeaders parameters.</li></ul>`,
            r`@GetMapping("/inspect")
String inspect(@RequestHeader("Accept") String accept,
               @RequestHeader Map<String, String> map,
               @RequestHeader HttpHeaders headers) {
    return accept + " | " + map.size() + " | " + headers.getContentLength();
}

// OUTPUT: (varies)
// application/json | 4 | -1`],
        [`<p>Variants for headers:</p><ul><li><b>Single value:</b> <code>@RequestHeader("X") String</code>.</li><li><b>List:</b> <code>@RequestHeader("Accept") List&lt;String&gt;</code> for comma separated values.</li><li><b>Map and HttpHeaders:</b> all headers; <code>MultiValueMap</code> keeps repeated names.</li><li><b>Mapping conditions:</b> <code>headers</code>, <code>consumes</code>, <code>produces</code>.</li><li><b>WebRequest:</b> <code>request.getHeader</code> without the servlet API.</li></ul>`,
            r`@GetMapping("/variants")
String variants(@RequestHeader("Accept-Encoding") List<String> enc,
                @RequestHeader MultiValueMap<String, String> all,
                WebRequest web) {
    return enc + " | " + all.containsKey("host") + " | " + web.getHeader("Host");
}
// curl -H "Accept-Encoding: gzip, deflate" localhost:8080/variants

// OUTPUT:
// [gzip, deflate] | true | localhost:8080`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Required header missing:</b> clients get 400; add <code>required = false</code> or a default.</li><li><b>Spaces in header names:</b> header names use hyphens, so copy them exactly.</li><li><b>Reading Authorization manually:</b> use Spring Security instead.</li><li><b>Plain Map with repeated headers:</b> only the first value is kept; use <code>MultiValueMap</code>.</li><li><b>Custom headers blocked by CORS:</b> list them in allowed and exposed headers.</li></ul>`,
            r`// WRONG: a repeated header loses values in a plain Map
@GetMapping("/bad")
String bad(@RequestHeader Map<String, String> h) { return h.get("x-tag"); }

// RIGHT: keep every value
@GetMapping("/good")
String good(@RequestHeader MultiValueMap<String, String> h) {
    return String.valueOf(h.get("x-tag"));
}
// curl -H "X-Tag: a" -H "X-Tag: b" localhost:8080/bad
// curl -H "X-Tag: a" -H "X-Tag: b" localhost:8080/good

// OUTPUT:
// a
// [a, b]`],
        [`<p>Performance notes:</p><ul><li>Header reads are cheap, a map lookup in the container.</li><li>Binding all headers copies them into a new map, so only do it when needed.</li><li>Large headers (big cookies or tokens) cost bandwidth on every request.</li><li>Container limits such as <code>server.max-http-request-header-size</code> reject oversized headers early.</li></ul>`,
            r`# application.properties
server.max-http-request-header-size=16KB
server.tomcat.max-http-response-header-size=16KB

# OUTPUT:
# requests with headers above 16KB get HTTP 431 Request Header Fields Too Large`],
        [`<p>Scenario: every request carries <code>X-Request-Id</code>. A filter reads it, creates one when absent, puts it in the logging MDC and echoes it in the response, so logs from many services can be matched.</p>`,
            r`@Component
class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("requestId", id);
        res.setHeader("X-Request-Id", id);
        try { chain.doFilter(req, res); } finally { MDC.remove("requestId"); }
    }
}

// OUTPUT: (varies)
// HTTP/1.1 200
// X-Request-Id: 9c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f`]
    ),
    'mvc-requestheader': dv(
        [`<p>Inside the binding:</p><ul><li><code>AbstractNamedValueMethodArgumentResolver</code> is the base class; it resolves the name, applies the default value and checks required.</li><li>The header text goes through <code>WebDataBinder</code> and the <code>ConversionService</code> to the target type.</li><li>When nothing is found and the value is required, <code>MissingRequestHeaderException</code> is thrown.</li><li>The exception is turned into 400 by <code>DefaultHandlerExceptionResolver</code> (or <code>ResponseEntityExceptionHandler</code>).</li></ul>`,
            r`@GetMapping("/convert")
String convert(@RequestHeader("X-Date") @DateTimeFormat(iso = ISO.DATE)
               LocalDate date,
               @RequestHeader("X-Locale") Locale locale) {
    return date.plusDays(1) + " " + locale.getLanguage();
}
// curl -H "X-Date: 2026-01-31" -H "X-Locale: fr" localhost:8080/convert

// OUTPUT:
// 2026-02-01 fr`],
        [`<p>Attributes of the annotation:</p><ul><li><code>value</code> / <code>name</code>: the header name.</li><li><code>required</code>: true by default.</li><li><code>defaultValue</code>: used when missing or empty; it also makes the header not required.</li></ul>`,
            r`@GetMapping("/attrs")
String attrs(
    @RequestHeader(name = "X-A") String a,                       // required
    @RequestHeader(name = "X-B", required = false) String b,     // null if absent
    @RequestHeader(name = "X-C", defaultValue = "none") String c) {
    return a + "," + b + "," + c;
}
// curl -H "X-A: 1" localhost:8080/attrs

// OUTPUT:
// 1,null,none`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Missing header gives 400:</b> decide if it is truly required.</li><li><b>Header name typo:</b> the value is then always missing; use constants.</li><li><b>Primitive with missing header:</b> <code>int</code> with <code>required = false</code> fails on null; use <code>Integer</code> or a default.</li><li><b>Conversion error:</b> a bad number gives 400 (<code>MethodArgumentTypeMismatchException</code>).</li></ul>`,
            r`// WRONG: required=false with a primitive cannot hold null
@GetMapping("/p1")
int p1(@RequestHeader(value = "X-N", required = false) int n) { return n; }

// RIGHT: wrapper or default
@GetMapping("/p2")
int p2(@RequestHeader(value = "X-N", defaultValue = "0") int n) { return n; }

// OUTPUT:
// GET /p1 without header -> 500 (cannot convert null to int)
// GET /p2 without header -> 0`],
        [`<p>Tuning: binding a header costs almost nothing. Avoid heavy parsing in the controller; for a token that needs parsing on every call, do it once in a filter. Keep custom headers short because they are repeated in every call, including preflight and proxy hops.</p>`,
            r`// parse once in a filter and share through a request attribute
@Component
class TenantFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        req.setAttribute("tenant", req.getHeader("X-Tenant"));
        chain.doFilter(req, res);
    }
}
// controller side
@GetMapping("/t")
String t(@RequestAttribute("tenant") String tenant) { return tenant; }

// OUTPUT:
// acme`],
        [`<p>Scenario: API versioning by header. Clients send <code>X-Api-Version</code>; the controller gives each version its own handler, and a default handles clients that send nothing.</p>`,
            r`@RestController
@RequestMapping("/api/orders")
class OrderApi {
    @GetMapping(headers = "X-Api-Version=2")
    List<OrderV2> v2() { return List.of(new OrderV2(1, "PAID", 250.0)); }

    @GetMapping
    List<OrderV1> v1() { return List.of(new OrderV1(1, "PAID")); }
}
// curl -H "X-Api-Version: 2" localhost:8080/api/orders

// OUTPUT:
// [{"id":1,"status":"PAID","total":250.0}]`]
    ),
    'mvc-cookies': dv(
        [`<p>The cookie round trip:</p><ul><li>The server sends <code>Set-Cookie: name=value; attributes</code>.</li><li>The browser stores it and sends <code>Cookie: name=value</code> on later requests that match domain, path and flags.</li><li>The container parses the header into <code>Cookie[]</code>, which <code>@CookieValue</code> reads.</li><li>The session id cookie is created by the container (or Spring Session) in the same way.</li></ul>`,
            r`@GetMapping("/trip")
ResponseEntity<String> trip(@CookieValue(value = "n", defaultValue = "0") int n) {
    ResponseCookie next = ResponseCookie.from("n", String.valueOf(n + 1))
        .path("/").build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, next.toString()).body("n=" + n);
}
// curl -c jar -b jar localhost:8080/trip  (three times)

// OUTPUT:
// n=0
// n=1
// n=2`],
        [`<p>Attributes and APIs:</p><ul><li><b>Path / Domain:</b> where the cookie is sent.</li><li><b>Max-Age / Expires:</b> lifetime; without them it is a session cookie.</li><li><b>HttpOnly, Secure, SameSite:</b> security flags.</li><li><b>APIs:</b> <code>ResponseCookie</code> (Spring, supports SameSite), <code>Cookie</code> (servlet), <code>CookieGenerator</code> style helpers in older code.</li></ul>`,
            r`ResponseCookie strict = ResponseCookie.from("pref", "x")
    .httpOnly(true).secure(true).sameSite("Strict")
    .path("/app").maxAge(3600).build();
ResponseCookie sessionOnly = ResponseCookie.from("tmp", "1").build();
System.out.println(strict);
System.out.println(sessionOnly);

// OUTPUT:
// pref=x; Path=/app; Max-Age=3600; Expires=(varies); Secure; HttpOnly; SameSite=Strict
// tmp=1`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Forgot HttpOnly or Secure:</b> add both for session-like cookies.</li><li><b>Wrong path:</b> a cookie set on <code>/a</code> is not sent to <code>/b</code>; use <code>/</code> when needed.</li><li><b>Deleting with a different path:</b> the browser keeps it; match name, path and domain and set Max-Age 0.</li><li><b>Non-ASCII values:</b> encode them (for example Base64 or URL encoding).</li><li><b>Trusting cookie data:</b> sign or encrypt, or keep it on the server.</li></ul>`,
            r`// WRONG: raw user data in a cookie, no flags
Cookie bad = new Cookie("role", "ADMIN");
response.addCookie(bad);

// RIGHT: random id only, with flags; the role lives on the server
ResponseCookie good = ResponseCookie.from("sid", UUID.randomUUID().toString())
    .httpOnly(true).secure(true).sameSite("Lax").path("/").build();
response.addHeader(HttpHeaders.SET_COOKIE, good.toString());

// OUTPUT:
// Set-Cookie: sid=(varies); Path=/; Secure; HttpOnly; SameSite=Lax`],
        [`<p>Performance and tuning:</p><ul><li>Cookies are sent on every request to the path, including images, so large cookies slow pages.</li><li>Serve static files from a cookie-free domain or path.</li><li>Keep each cookie small (browser limit is about 4 KB).</li><li>Tune the container session cookie with properties.</li></ul>`,
            r`# application.properties
server.servlet.session.cookie.name=APPSESSION
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.max-age=30m

# OUTPUT:
# Set-Cookie: APPSESSION=...; Max-Age=1800; Path=/; Secure; HttpOnly; SameSite=Lax`],
        [`<p>Scenario: a "remember language" feature. The first visit stores the chosen language in a cookie, later visits read it and fall back to the browser default.</p>`,
            r`@GetMapping("/lang/{code}")
ResponseEntity<String> set(@PathVariable String code) {
    if (!List.of("en", "fr", "hi").contains(code)) {      // validate input
        return ResponseEntity.badRequest().body("unsupported");
    }
    ResponseCookie c = ResponseCookie.from("lang", code)
        .path("/").maxAge(Duration.ofDays(365)).sameSite("Lax").build();
    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, c.toString())
        .body("saved " + code);
}

@GetMapping("/home")
String home(@CookieValue(value = "lang", required = false) String lang,
            Locale browser) {
    return "language=" + (lang != null ? lang : browser.getLanguage());
}

// OUTPUT:
// GET /lang/fr -> saved fr
// GET /home    -> language=fr`]
    ),
    'mvc-cookievalue': dv(
        [`<p>How the argument is resolved:</p><ul><li><code>ServletCookieValueMethodArgumentResolver</code> extends <code>AbstractCookieValueMethodArgumentResolver</code>, which extends the named-value base class.</li><li>It uses <code>WebUtils.getCookie(request, name)</code> to find the cookie.</li><li>If the parameter type is <code>Cookie</code>, the object is passed; otherwise the value is URL-decoded and converted.</li><li>Missing and required throws <code>MissingRequestCookieException</code>.</li></ul>`,
            r`@GetMapping("/inside")
String inside(@CookieValue("a") Cookie whole, @CookieValue("a") String value) {
    return whole.getName() + "|" + whole.getPath() + "|" + value;
}
// curl -b "a=xyz" localhost:8080/inside

// OUTPUT:
// a|null|xyz`],
        [`<p>Variants:</p><ul><li><b>String / primitive / wrapper:</b> converted value.</li><li><b>Cookie:</b> the full servlet object (the browser only sends name and value, so path and age are null or -1).</li><li><b>Optional:</b> absent means empty.</li><li><b>defaultValue:</b> used when absent.</li></ul>`,
            r`@GetMapping("/variants")
String variants(@CookieValue("id") long id,
                @CookieValue("flag") boolean flag,
                @CookieValue("maybe") Optional<String> maybe) {
    return id + "," + flag + "," + maybe.orElse("-");
}
// curl -b "id=42;flag=true" localhost:8080/variants

// OUTPUT:
// 42,true,-`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Assuming the cookie exists:</b> first-time visitors do not have it; give a default.</li><li><b>Expecting Cookie path or max-age:</b> the browser never sends them back.</li><li><b>Number parsing:</b> a tampered value gives 400; handle it centrally.</li><li><b>Using it for identity:</b> use the security session or a signed token.</li></ul>`,
            r`// WRONG: required cookie, first visit gets 400
@GetMapping("/a")
String a(@CookieValue("seen") String seen) { return seen; }

// RIGHT: default for new visitors
@GetMapping("/b")
String b(@CookieValue(value = "seen", defaultValue = "no") String seen) {
    return seen;
}

// OUTPUT:
// GET /a (no cookie) -> HTTP 400
// GET /b (no cookie) -> no`],
        [`<p>Tuning: reading is cheap because cookies are already parsed once per request. The cost is the size of the cookie header sent on every call, so store only ids and small flags.</p>`,
            r`// handling a tampered numeric cookie centrally
@RestControllerAdvice
class CookieErrors {
    @ExceptionHandler(MissingRequestCookieException.class)
    ResponseEntity<String> missing(MissingRequestCookieException e) {
        return ResponseEntity.badRequest()
            .body("missing cookie " + e.getCookieName());
    }
}

// OUTPUT:
// HTTP 400 missing cookie seen`],
        [`<p>Scenario: a cookie-based A/B test. A cookie holds the bucket; if absent, the server assigns one and sets it for next time.</p>`,
            r`@GetMapping("/landing")
ResponseEntity<String> landing(
        @CookieValue(value = "bucket", required = false) String bucket) {
    String b = (bucket != null) ? bucket
        : (ThreadLocalRandom.current().nextBoolean() ? "A" : "B");
    ResponseCookie c = ResponseCookie.from("bucket", b)
        .path("/").maxAge(Duration.ofDays(30)).build();
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, c.toString()).body("variant " + b);
}

// OUTPUT: (varies)
// variant A   (the same variant on every later visit)`]
    ),
    'mvc-request-body': dv(
        [`<p>How the body is read:</p><ul><li>The adapter calls <code>RequestResponseBodyMethodProcessor</code> for a <code>@RequestBody</code> parameter.</li><li>It wraps the request as an <code>HttpInputMessage</code> and reads <code>Content-Type</code>.</li><li>It asks each <code>HttpMessageConverter</code> if it <code>canRead(type, mediaType)</code>; the first match reads the stream.</li><li>Jackson converter: <code>MappingJackson2HttpMessageConverter</code>; text: <code>StringHttpMessageConverter</code>; bytes: <code>ByteArrayHttpMessageConverter</code>.</li><li>No match gives <code>HttpMediaTypeNotSupportedException</code> (415).</li></ul>`,
            r`@Autowired RequestMappingHandlerAdapter adapter;

void listConverters() {
    adapter.getMessageConverters().forEach(c ->
        System.out.println(c.getClass().getSimpleName()));
}

// OUTPUT: (varies by classpath)
// ByteArrayHttpMessageConverter
// StringHttpMessageConverter
// ResourceHttpMessageConverter
// MappingJackson2HttpMessageConverter`],
        [`<p>Body types you can bind:</p><ul><li><b>Object / record:</b> JSON or XML.</li><li><b>String:</b> raw text.</li><li><b>byte[] / InputStream / Reader:</b> raw data.</li><li><b>Map / List:</b> generic JSON.</li><li><b>HttpEntity or RequestEntity:</b> body plus headers.</li><li><b>Multipart:</b> use <code>@RequestPart</code> or <code>MultipartFile</code>.</li></ul>`,
            r`@PostMapping("/entity")
String entity(RequestEntity<Map<String, Object>> req) {
    return req.getMethod() + " " + req.getHeaders().getContentType()
        + " keys=" + req.getBody().keySet();
}
// curl -X POST localhost:8080/entity -H "Content-Type: application/json" \
//      -d "{\"a\":1}"

// OUTPUT:
// POST application/json keys=[a]`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Missing Content-Type header:</b> gives 415; set <code>application/json</code>.</li><li><b>Reading the stream in a filter:</b> later binding sees an empty body; use a caching wrapper.</li><li><b>Sending form data to @RequestBody:</b> use <code>@ModelAttribute</code>.</li><li><b>Date formats:</b> configure Jackson or use ISO strings.</li><li><b>Entity as body:</b> use a DTO.</li></ul>`,
            r`// WRONG: a filter drains the stream
String body = new String(request.getInputStream().readAllBytes());
chain.doFilter(request, response);       // controller gets an empty body -> 400

// RIGHT: cache the body so it can be read again
ContentCachingRequestWrapper wrapped = new ContentCachingRequestWrapper(request);
chain.doFilter(wrapped, response);
byte[] copy = wrapped.getContentAsByteArray();   // available after the chain

// OUTPUT:
// controller binds the body normally; the filter logs the cached copy afterwards`],
        [`<p>Performance:</p><ul><li>JSON parsing cost grows with body size; the converter reads the stream in one pass.</li><li>Set limits: Tomcat <code>server.tomcat.max-swallow-size</code> and <code>max-http-form-post-size</code>, and gateway limits.</li><li>For very large uploads or feeds, stream with <code>InputStream</code> instead of binding a big object.</li><li>Enable HTTP compression only where it helps.</li></ul>`,
            r`@PostMapping("/import")
String importLines(HttpServletRequest req) throws IOException {
    long count = 0;
    try (BufferedReader r = req.getReader()) {       // streaming, constant memory
        while (r.readLine() != null) count++;
    }
    return "lines=" + count;
}

// OUTPUT:
// lines=100000`],
        [`<p>Scenario: an order API. The client posts an order document; the server validates it, saves it and returns 201 with a Location header.</p>`,
            r`record Item(@NotBlank String sku, @Min(1) int qty) {}
record OrderRequest(@NotEmpty List<@Valid Item> items) {}

@PostMapping("/orders")
ResponseEntity<Void> place(@Valid @RequestBody OrderRequest req) {
    long id = orderService.save(req);
    return ResponseEntity.created(URI.create("/orders/" + id)).build();
}
// curl -X POST localhost:8080/orders -H "Content-Type: application/json" \
//      -d "{\"items\":[{\"sku\":\"A1\",\"qty\":2}]}"

// OUTPUT:
// HTTP/1.1 201
// Location: /orders/101`]
    ),
    'mvc-requestbody': dv(
        [`<p>The annotation at work:</p><ul><li><code>RequestResponseBodyMethodProcessor.resolveArgument</code> calls <code>readWithMessageConverters</code>.</li><li>Then it creates a <code>WebDataBinder</code> and, if the parameter has <code>@Valid</code> or <code>@Validated</code>, runs the validator.</li><li>A <code>RequestBodyAdvice</code> bean can inspect or change the body before and after conversion.</li><li>Errors become <code>MethodArgumentNotValidException</code>.</li></ul>`,
            r`@RestControllerAdvice
class LogBodyAdvice extends RequestBodyAdviceAdapter {
    @Override
    public boolean supports(MethodParameter p, Type t,
            Class<? extends HttpMessageConverter<?>> c) { return true; }

    @Override
    public Object afterBodyRead(Object body, HttpInputMessage in,
            MethodParameter p, Type t,
            Class<? extends HttpMessageConverter<?>> c) {
        System.out.println("body read: " + body);
        return body;
    }
}

// OUTPUT:
// body read: CreateUser[name=Asha, email=asha@example.com]`],
        [`<p>Options and variants:</p><ul><li><code>required</code>: default true.</li><li>Records, classes with setters, and <code>@JsonCreator</code> constructors all work.</li><li>Control fields with Jackson annotations such as <code>@JsonProperty</code>, <code>@JsonIgnoreProperties</code>, <code>@JsonFormat</code>.</li><li>Groups: <code>@Validated(Create.class)</code> for different rules per operation.</li><li><code>@RequestBody</code> is not needed in <code>@RestController</code> for return values, only for parameters.</li></ul>`,
            r`record Product(
    @JsonProperty("product_name") @NotBlank String name,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate expiry,
    @JsonIgnore String internalNote) {}

@PostMapping("/products")
Product add(@Valid @RequestBody Product p) { return p; }
// curl -X POST localhost:8080/products -H "Content-Type: application/json" \
//      -d "{\"product_name\":\"Pen\",\"expiry\":\"2027-01-01\"}"

// OUTPUT:
// {"product_name":"Pen","expiry":"2027-01-01"}`],
        [`<p>Mistakes and fixes:</p><ul><li><b>No @Valid:</b> constraints are ignored; add it.</li><li><b>Binding an entity:</b> clients can set the id or role; use a DTO.</li><li><b>Primitive fields for optional JSON values:</b> a missing field becomes 0 or false; use wrapper types when you must tell absent from zero.</li><li><b>Date text not parsed:</b> add <code>@JsonFormat</code> or send ISO dates.</li><li><b>Missing no-arg constructor on a plain class:</b> use a record or setters.</li></ul>`,
            r`// WRONG: the client can set the id and the role
@PostMapping("/users")
User bad(@RequestBody User entity) { return repo.save(entity); }

// RIGHT: a DTO with only the allowed fields
@PostMapping("/users2")
User good(@Valid @RequestBody CreateUser dto) {
    return repo.save(new User(dto.name(), dto.email(), Role.USER));
}

// OUTPUT:
// POST {"name":"x","role":"ADMIN"} /users  -> saved with role ADMIN (bug)
// POST {"name":"x","role":"ADMIN"} /users2 -> saved with role USER`],
        [`<p>Tuning:</p><ul><li>Reuse the Spring-managed <code>ObjectMapper</code>; do not create a new one per request.</li><li>Use <code>spring.jackson.*</code> properties for global date and null handling.</li><li>Reject oversized collections with <code>@Size</code>.</li><li>Prefer records for small immutable payloads.</li></ul>`,
            r`# application.properties
spring.jackson.deserialization.fail-on-unknown-properties=true
spring.jackson.default-property-inclusion=non_null
spring.mvc.problemdetails.enabled=true

# OUTPUT:
# unknown JSON fields now cause HTTP 400 with an RFC 7807 problem body`],
        [`<p>Scenario: a payment webhook posts JSON signed with a header. The controller needs the raw bytes to verify the signature and the object to process, so it takes both.</p>`,
            r`@PostMapping("/webhook")
ResponseEntity<String> hook(
        @RequestHeader("X-Signature") String signature,
        @RequestBody byte[] raw) throws IOException {
    if (!signer.valid(raw, signature)) {
        return ResponseEntity.status(401).body("bad signature");
    }
    Event event = objectMapper.readValue(raw, Event.class);
    handler.handle(event);
    return ResponseEntity.ok("accepted");
}

// OUTPUT:
// valid signature   -> 200 accepted
// invalid signature -> 401 bad signature`]
    ),
    'mvc-httpservletrequest': dv(
        [`<p>Where the object comes from:</p><ul><li>The container (Tomcat) creates a request object per call, and filters may wrap it.</li><li><code>RequestContextHolder</code> keeps it in a thread local for the current thread.</li><li>The argument resolver <code>ServletRequestMethodArgumentResolver</code> passes it into your method.</li><li>Spring also supports <code>WebRequest</code>, <code>HttpMethod</code>, <code>Locale</code> and <code>InputStream</code> as parameters.</li></ul>`,
            r`@GetMapping("/where")
String where(HttpServletRequest injected) {
    HttpServletRequest fromHolder =
        ((ServletRequestAttributes) RequestContextHolder
            .currentRequestAttributes()).getRequest();
    return String.valueOf(injected == fromHolder);
}

// OUTPUT:
// true`],
        [`<p>Useful groups of methods:</p><ul><li><b>URL:</b> <code>getRequestURL</code>, <code>getContextPath</code>, <code>getServletPath</code>, <code>getQueryString</code>.</li><li><b>Client:</b> <code>getRemoteAddr</code>, <code>getScheme</code>, <code>isSecure</code>, <code>getLocale</code>.</li><li><b>Data:</b> <code>getParameterMap</code>, <code>getHeaderNames</code>, <code>getParts</code>.</li><li><b>Security:</b> <code>getUserPrincipal</code>, <code>isUserInRole</code>.</li></ul>`,
            r`@GetMapping("/details")
Map<String, Object> details(HttpServletRequest r) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("url", r.getRequestURL().toString());
    m.put("scheme", r.getScheme());
    m.put("secure", r.isSecure());
    m.put("locale", r.getLocale().toString());
    m.put("params", r.getParameterMap().keySet());
    return m;
}
// curl "localhost:8080/details?x=1&y=2"

// OUTPUT:
// {"url":"http://localhost:8080/details","scheme":"http","secure":false,
//  "locale":"en_US","params":["x","y"]}`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Calling both getReader and getInputStream:</b> throws <code>IllegalStateException</code>.</li><li><b>Reading the body after a form parameter call:</b> <code>getParameter</code> may consume form bodies.</li><li><b>Using the request in an async thread:</b> it can be recycled; copy needed values first.</li><li><b>Old javax imports:</b> Spring Boot 3 uses <code>jakarta.servlet</code>.</li><li><b>Trusting remote address behind a proxy:</b> configure forwarded headers.</li></ul>`,
            r`// WRONG: the request may be recycled by the time the task runs
@GetMapping("/bad")
void bad(HttpServletRequest req) {
    executor.submit(() -> log.info(req.getRequestURI()));
}

// RIGHT: copy the values first
@GetMapping("/good")
void good(HttpServletRequest req) {
    String uri = req.getRequestURI();
    executor.submit(() -> log.info(uri));
}

// OUTPUT:
// bad  -> may fail or log wrong data
// good -> logs /good`],
        [`<p>Tuning: parameter and header lookups are cheap. Avoid parsing the full parameter map when you need one value. Use <code>server.forward-headers-strategy</code> so scheme, host and client address are right behind a proxy, which avoids bad redirects.</p>`,
            r`# application.properties
server.forward-headers-strategy=framework
server.tomcat.remoteip.remote-ip-header=x-forwarded-for
server.tomcat.remoteip.protocol-header=x-forwarded-proto

# OUTPUT:
# getRemoteAddr() and getScheme() now reflect the real client and HTTPS`],
        [`<p>Scenario: an audit interceptor records who called which endpoint. It uses the request for method, path, client address and user.</p>`,
            r`@Component
class AuditInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger("audit");

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                             Object handler) {
        Principal p = req.getUserPrincipal();
        log.info("{} {} from {} user={}", req.getMethod(), req.getRequestURI(),
            req.getRemoteAddr(), p == null ? "anonymous" : p.getName());
        return true;
    }
}

// OUTPUT:
// audit - GET /orders from 10.0.0.5 user=asha`]
    ),
    'mvc-httpservletresponse': dv(
        [`<p>How the response is produced:</p><ul><li>The container creates a response with a buffer; headers and body are held until the buffer fills or is flushed.</li><li><b>Committed:</b> once flushed, status and headers are fixed.</li><li>If a handler returns a value, <code>HttpMessageConverter</code> writes it to the same output stream.</li><li>If you write the response yourself, return <code>void</code> (or mark it handled) so Spring does not add output.</li></ul>`,
            r`@GetMapping("/commit")
void commit(HttpServletResponse res) throws IOException {
    System.out.println("committed before: " + res.isCommitted());
    res.getWriter().write("data");
    res.flushBuffer();                              // forces the commit
    System.out.println("committed after: " + res.isCommitted());
}

// OUTPUT:
// committed before: false
// committed after: true`],
        [`<p>Ways to send a response:</p><ul><li><b>Return value / ResponseEntity:</b> preferred.</li><li><b>Raw writer or stream:</b> custom formats.</li><li><b>StreamingResponseBody:</b> large output on a separate thread.</li><li><b>SseEmitter:</b> server-sent events.</li><li><b>Redirect:</b> <code>sendRedirect</code> (302) or <code>RedirectView</code>.</li></ul>`,
            r`@GetMapping("/stream")
ResponseEntity<StreamingResponseBody> stream() {
    StreamingResponseBody body = out -> {
        for (int i = 1; i <= 3; i++) {
            out.write(("line " + i + "\n").getBytes(StandardCharsets.UTF_8));
            out.flush();
        }
    };
    return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(body);
}

// OUTPUT:
// line 1
// line 2
// line 3`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Setting a header after commit:</b> it is ignored; set headers before writing.</li><li><b>Using both writer and output stream:</b> <code>IllegalStateException</code>.</li><li><b>Returning a value too:</b> a non-void return after writing causes double output or errors.</li><li><b>Missing Content-Type or charset:</b> garbled text; set it.</li><li><b>Unsafe file name in Content-Disposition:</b> sanitize it.</li></ul>`,
            r`// WRONG: header set after the body is flushed is lost
res.getWriter().write("hi");
res.flushBuffer();
res.setHeader("X-Late", "1");              // ignored, response already committed

// RIGHT: headers first
res.setHeader("X-Early", "1");
res.getWriter().write("hi");

// OUTPUT:
// WRONG -> X-Late header missing from the response
// RIGHT -> X-Early: 1 present`],
        [`<p>Tuning:</p><ul><li>Stream large payloads instead of building them in memory.</li><li>Enable compression for text content with <code>server.compression.enabled=true</code>.</li><li>Set cache headers on static or stable data (<code>Cache-Control</code>, <code>ETag</code>).</li><li>Flush only when you need progressive output.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.mime-types=application/json,text/csv,text/html
server.compression.min-response-size=1KB

# OUTPUT:
# responses above 1KB of those types are sent with Content-Encoding: gzip`],
        [`<p>Scenario: export a large report as CSV. The controller streams rows from the database cursor straight to the client, with a download file name.</p>`,
            r`@GetMapping("/export")
void export(HttpServletResponse res) throws IOException {
    res.setContentType("text/csv;charset=UTF-8");
    res.setHeader(HttpHeaders.CONTENT_DISPOSITION,
        ContentDisposition.attachment().filename("orders.csv").build().toString());
    try (PrintWriter w = res.getWriter()) {
        w.println("id,total");
        orderRepo.streamAll().forEach(o -> w.println(o.id() + "," + o.total()));
    }
}

// OUTPUT:
// id,total
// 1,250.0
// 2,99.5`]
    ),
    'mvc-httpsession': dv(
        [`<p>Inside the session:</p><ul><li>The container keeps a <code>Map</code> of session id to <code>HttpSession</code> (in Tomcat, a <code>StandardManager</code>).</li><li>On first use it creates the object and sends <code>Set-Cookie: JSESSIONID</code>.</li><li>Each request with the cookie looks the session up and updates the last accessed time.</li><li>A background task removes sessions idle past their timeout.</li><li>Listeners (<code>HttpSessionListener</code>) can react to create and destroy.</li></ul>`,
            r`@Component
class SessionLogger implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent e) {
        System.out.println("created " + e.getSession().getId().substring(0, 4));
    }
    @Override
    public void sessionDestroyed(HttpSessionEvent e) {
        System.out.println("destroyed " + e.getSession().getId().substring(0, 4));
    }
}

// OUTPUT: (varies)
// created 7F3A
// destroyed 7F3A`],
        [`<p>Spring helpers around sessions:</p><ul><li><code>@SessionAttributes("cart")</code>: keeps a model attribute in the session for one controller.</li><li><code>@SessionAttribute("user")</code>: reads one attribute into a parameter.</li><li><code>@SessionScope</code> bean: one bean instance per session.</li><li><code>SessionStatus.setComplete()</code> clears <code>@SessionAttributes</code> data.</li></ul>`,
            r`@Component
@SessionScope
class Cart implements Serializable {
    private final List<String> items = new ArrayList<>();
    void add(String i) { items.add(i); }
    List<String> items() { return items; }
}

@RestController
class CartController {
    private final Cart cart;
    CartController(Cart cart) { this.cart = cart; }   // proxied per session

    @PostMapping("/cart/{item}")
    List<String> add(@PathVariable String item) {
        cart.add(item);
        return cart.items();
    }
}

// OUTPUT:
// POST /cart/pen  -> ["pen"]
// POST /cart/book -> ["pen","book"]`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Creating sessions for everyone (bots included):</b> use <code>getSession(false)</code> where no state is needed.</li><li><b>Storing big or non-serializable objects:</b> keep ids, not entities.</li><li><b>No invalidation on logout:</b> call <code>invalidate()</code>.</li><li><b>Not renewing the id on login:</b> allows session fixation.</li><li><b>Concurrent updates to the same attribute:</b> sessions are not locked; synchronize or avoid shared mutable state.</li></ul>`,
            r`// WRONG: login keeps the old session id
session.setAttribute("user", name);

// RIGHT: new id first, then store the user
request.changeSessionId();
request.getSession().setAttribute("user", name);

// OUTPUT:
// the JSESSIONID cookie value changes at login, and the old id is no longer valid`],
        [`<p>Tuning:</p><ul><li>Keep session data small, it is held in memory and may be replicated.</li><li>Set a reasonable timeout, since idle sessions cost memory.</li><li>For several servers use Spring Session so any instance can serve the user.</li><li>Prefer stateless tokens for pure APIs.</li></ul>`,
            r`# application.properties
server.servlet.session.timeout=20m
spring.session.store-type=redis
spring.session.redis.namespace=myapp:sessions

# OUTPUT:
# sessions are stored in Redis, and any application instance can read them`],
        [`<p>Scenario: a shopping flow. The cart lives in the session until checkout, then the session data is cleared after the order is saved.</p>`,
            r`@PostMapping("/checkout")
ResponseEntity<String> checkout(HttpSession session) {
    @SuppressWarnings("unchecked")
    List<String> cart = (List<String>) session.getAttribute("cart");
    if (cart == null || cart.isEmpty()) {
        return ResponseEntity.badRequest().body("cart is empty");
    }
    long id = orderService.place(cart);
    session.removeAttribute("cart");              // keep the login, drop the cart
    return ResponseEntity.ok("order " + id);
}

// OUTPUT:
// empty cart   -> 400 cart is empty
// filled cart  -> 200 order 101`]
    ),
    'mvc-principal': dv(
        [`<p>Where the Principal comes from:</p><ul><li>Spring Security filters authenticate the request and store an <code>Authentication</code> in <code>SecurityContextHolder</code>.</li><li><code>SecurityContextHolderAwareRequestFilter</code> wraps the request so <code>getUserPrincipal()</code> returns it.</li><li>MVC's <code>ServletRequestMethodArgumentResolver</code> then passes <code>request.getUserPrincipal()</code> into a <code>Principal</code> parameter.</li><li><code>@AuthenticationPrincipal</code> is handled by <code>AuthenticationPrincipalArgumentResolver</code>.</li></ul>`,
            r`@GetMapping("/who")
String who(Principal p, Authentication a, HttpServletRequest r) {
    boolean same = (p == a) && (r.getUserPrincipal() == p);
    return same + " " + a.getClass().getSimpleName();
}
// curl -u asha:secret localhost:8080/who

// OUTPUT:
// true UsernamePasswordAuthenticationToken`],
        [`<p>Ways to reach the current user:</p><ul><li><b>Principal:</b> just the name.</li><li><b>Authentication:</b> authorities and details.</li><li><b>@AuthenticationPrincipal:</b> your user object; <code>expression</code> can pick a field.</li><li><b>SecurityContextHolder:</b> anywhere in code, same thread.</li><li><b>JWT:</b> <code>@AuthenticationPrincipal Jwt jwt</code> with a resource server.</li></ul>`,
            r`@GetMapping("/ways")
String ways(@AuthenticationPrincipal(expression = "username") String name) {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    return name + " " + a.getName() + " " + a.isAuthenticated();
}
// curl -u asha:secret localhost:8080/ways

// OUTPUT:
// asha asha true`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Principal is null:</b> the endpoint is public or security is off; require authentication.</li><li><b>Taking user id from the request:</b> use the Principal.</li><li><b>Using the Principal in a new thread:</b> the context is not copied; use <code>DelegatingSecurityContextExecutor</code> or pass values.</li><li><b>Casting the Principal to your class blindly:</b> use <code>@AuthenticationPrincipal</code>.</li></ul>`,
            r`// WRONG: any caller can ask for another user's orders
@GetMapping("/orders")
List<Order> bad(@RequestParam String userId) { return svc.byOwner(userId); }

// RIGHT: identity from the server side
@GetMapping("/my-orders")
List<Order> good(Principal p) { return svc.byOwner(p.getName()); }

// OUTPUT:
// /orders?userId=bob  -> returns bob's orders to anyone (bug)
// /my-orders          -> only the logged in user's orders`],
        [`<p>Tuning: the Principal is already in memory, so reading it is free. Cost lies in authentication; cache user lookups, use stateless tokens to avoid session lookups, and avoid loading the full user entity on each call when the name or id is enough.</p>`,
            r`// keep a small custom principal instead of a heavy entity
record AppUser(long id, String name, Set<String> roles) {}

@GetMapping("/light")
String light(@AuthenticationPrincipal AppUser user) {
    return user.id() + ":" + user.name();
}

// OUTPUT:
// 7:asha`],
        [`<p>Scenario: a "my account" API plus an audit field. Controllers use the Principal to scope data to the caller and to record who changed a record.</p>`,
            r`@PutMapping("/account/email")
ResponseEntity<Void> change(@Valid @RequestBody EmailChange body,
                            Principal principal) {
    accountService.updateEmail(principal.getName(), body.email());
    auditLog.record(principal.getName(), "EMAIL_CHANGED");
    return ResponseEntity.noContent().build();
}

// OUTPUT:
// HTTP/1.1 204
// audit: asha EMAIL_CHANGED`]
    )
};
