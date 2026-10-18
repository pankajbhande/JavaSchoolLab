// Spring extras, batch smvc06 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc06Extras: Record<string, Extra> = {
    'mvc-method-level-mapping': x(
        ['<b>Method-level mapping</b> binds a single handler method to a URL and HTTP method with <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code> or <code>@RequestMapping(method = ...)</code>.',
            '<b>Combined with the class</b>: a class-level <code>@RequestMapping("/users")</code> gives a prefix, and each method adds its own path to it.',
            '<b>Shortcut annotations</b> are composed annotations: <code>@GetMapping</code> is just <code>@RequestMapping(method = RequestMethod.GET)</code>.'],
        ['<b>Same path, different verbs</b>: <code>GET /users/{id}</code> and <code>DELETE /users/{id}</code> can be two methods without conflict.',
            '<b>Narrowing</b>: besides path and method, a mapping can be narrowed by <code>params</code>, <code>headers</code>, <code>consumes</code> and <code>produces</code>.',
            '<b>Wrong verb</b> gives <code>405 Method Not Allowed</code>, an unknown path gives <code>404</code>.'],
        ['<b>Registry</b>: at startup <code>RequestMappingHandlerMapping</code> builds a map of <code>RequestMappingInfo</code> to <code>HandlerMethod</code>.',
            '<b>Ambiguity</b>: two methods with the same conditions fail at startup with <code>IllegalStateException: Ambiguous mapping</code>.',
            '<b>Specificity</b>: the most specific match wins, for example <code>/users/me</code> beats <code>/users/{id}</code>.'],
        [['F', 'What does @GetMapping do?', 'It maps HTTP GET requests for a path to a handler method. It is a shortcut for @RequestMapping with method GET.'],
            ['F', 'Can a class and its methods both have mappings?', 'Yes. The class path is a prefix and the method path is appended to it.'],
            ['M', 'What happens if two methods have the same mapping?', 'The application fails to start with an Ambiguous mapping error.'],
            ['M', 'Which status is returned for a wrong HTTP verb?', '405 Method Not Allowed, with an Allow header listing the supported verbs.'],
            ['S', 'Which bean stores the mappings?', 'RequestMappingHandlerMapping, which keeps RequestMappingInfo to HandlerMethod entries.'],
            ['S', 'How does Spring choose between /users/me and /users/{id}?', 'It compares the patterns and prefers the more specific one, so the literal path wins.']],
        [['Write a controller with a class prefix and three methods (list, get one, create).',
            r`@RestController
@RequestMapping("/api/books")
public class BookController {
    @GetMapping
    public List<String> all() { return List.of("Java", "Spring"); }

    @GetMapping("/{id}")
    public String one(@PathVariable int id) { return "Book " + id; }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody String title) {
        return ResponseEntity.status(201).body("created " + title);
    }
}

// OUTPUT:
// GET  /api/books    -> 200 ["Java","Spring"]
// GET  /api/books/7  -> 200 Book 7
// POST /api/books    -> 201 created Clean Code`],
            ['Test the mapping with MockMvc, including the wrong verb.',
                r`@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;

    @Test void getOne() throws Exception {
        mvc.perform(get("/api/books/7")).andExpect(status().isOk())
           .andExpect(content().string("Book 7"));
    }
    @Test void wrongVerb() throws Exception {
        mvc.perform(delete("/api/books")).andExpect(status().isMethodNotAllowed());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]],
        [['Same path with different verbs.',
            r`@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public String get(@PathVariable long id) { return "user " + id; }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) { /* remove */ }
}

// OUTPUT:
// GET    /api/users/5 -> 200 user 5
// DELETE /api/users/5 -> 204 (no body)`],
            ['Narrowing a mapping with params.',
                r`@GetMapping(value = "/search", params = "q")
public String byQuery(@RequestParam String q) { return "query " + q; }

@GetMapping(value = "/search", params = "!q")
public String noQuery() { return "no query"; }

// OUTPUT:
// GET /search?q=spring -> query spring
// GET /search          -> no query`]]
    ),

    'mvc-multiple-url-mappings': x(
        ['<b>Multiple URL mappings</b> let one handler method answer several paths, written as an array: <code>@GetMapping({"/home", "/index"})</code>.',
            '<b>Use cases</b>: aliases, old and new URLs during a migration, and a trailing or alternative path for the same page.',
            '<b>Same method</b>: every listed path runs the same code and returns the same view or body.'],
        ['<b>Array syntax</b>: both <code>value</code> and <code>path</code> accept <code>String[]</code>, and curly braces are needed for more than one path.',
            '<b>Patterns</b>: each entry can be a pattern such as <code>/files/*</code> or <code>/docs/**</code>.',
            '<b>Class level</b>: a class-level array multiplies with method paths, so two prefixes and two paths give four URLs.'],
        ['<b>Many registrations</b>: Spring registers one <code>RequestMappingInfo</code> holding all patterns, not several handlers.',
            '<b>Trailing slash</b>: since Spring Framework 6 <code>/home/</code> no longer matches <code>/home</code> by default, so list both if you need it.',
            '<b>Redirects</b>: for old URLs a <code>redirect:</code> or a 301 is often better than a silent alias.'],
        [['F', 'How do you map two URLs to one method?', 'Pass an array, for example @GetMapping({"/a", "/b"}).'],
            ['F', 'Does the method run twice?', 'No. It runs once per request, whichever path matched.'],
            ['M', 'Does /home/ match @GetMapping("/home") in Spring 6?', 'No. Trailing slash matching is off by default since Spring Framework 6.'],
            ['M', 'What happens with class-level and method-level arrays?', 'Spring combines each class pattern with each method pattern.'],
            ['S', 'How can you find out which pattern matched?', 'Read the request attribute HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE.'],
            ['S', 'Why prefer a redirect for a retired URL?', 'It tells clients and search engines the new location instead of keeping two canonical URLs.']],
        [['Home page with three aliases.',
            r`@Controller
public class HomeController {
    @GetMapping({"/", "/home", "/index"})
    @ResponseBody
    public String home() { return "Welcome"; }
}

// OUTPUT:
// GET /      -> 200 Welcome
// GET /home  -> 200 Welcome
// GET /index -> 200 Welcome`],
            ['MockMvc test over all aliases.',
                r`@WebMvcTest(HomeController.class)
class HomeControllerTest {
    @Autowired MockMvc mvc;

    @ParameterizedTest
    @ValueSource(strings = {"/", "/home", "/index"})
    void aliases(String url) throws Exception {
        mvc.perform(get(url)).andExpect(content().string("Welcome"));
    }
}

// OUTPUT:
// Tests run: 3, Failures: 0, Errors: 0`]],
        [['Class and method arrays multiply.',
            r`@RestController
@RequestMapping({"/api/v1", "/api/v2"})
public class PingController {
    @GetMapping({"/ping", "/health"})
    public String ping() { return "pong"; }
}

// OUTPUT:
// Four URLs answer: /api/v1/ping, /api/v1/health,
// /api/v2/ping, /api/v2/health`],
            ['Pattern with a wildcard.',
                r`@GetMapping({"/docs/*", "/help/**"})
public String docs(HttpServletRequest req) {
    return "served " + req.getRequestURI();
}

// OUTPUT:
// GET /docs/intro        -> served /docs/intro
// GET /help/a/b/c        -> served /help/a/b/c`]]
    ),

    'mvc-consumes': x(
        ['<b>consumes</b> is a mapping condition that limits a handler to requests whose <code>Content-Type</code> header matches, such as <code>consumes = "application/json"</code>.',
            '<b>Purpose</b>: pick the right method for the body format the client sends, for example JSON versus XML versus form data.',
            '<b>Mismatch</b>: a request with another content type gets <code>415 Unsupported Media Type</code>.'],
        ['<b>Constants</b>: use <code>MediaType.APPLICATION_JSON_VALUE</code> instead of raw strings to avoid typos.',
            '<b>Negation</b>: <code>consumes = "!text/plain"</code> accepts everything except plain text.',
            '<b>Only for bodies</b>: it checks <code>Content-Type</code>, so it matters for POST, PUT and PATCH, not for a plain GET.'],
        ['<b>Matching</b>: <code>ConsumesRequestCondition</code> compares the request media type with the declared ones.',
            '<b>Body conversion</b>: after the match an <code>HttpMessageConverter</code> such as Jackson reads the body for <code>@RequestBody</code>.',
            '<b>Class level</b>: a class-level <code>consumes</code> is overridden, not merged, by a method-level one.'],
        [['F', 'What does consumes do?', 'It restricts a handler to requests with a given Content-Type.'],
            ['F', 'Which status is returned when the type does not match?', '415 Unsupported Media Type.'],
            ['M', 'Which header does consumes check?', 'Content-Type of the request, not Accept.'],
            ['M', 'How can two methods share a path?', 'Give them different consumes values, for example JSON and XML.'],
            ['S', 'Class-level and method-level consumes: merged or overridden?', 'The method-level value overrides the class-level one.'],
            ['S', 'How is consumes related to HttpMessageConverter?', 'consumes selects the handler; the converter that supports that media type then reads the body.']],
        [['A JSON-only endpoint.',
            r`@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public String create(@RequestBody Map<String, Object> order) {
        return "got " + order.get("item");
    }
}

// OUTPUT:
// POST /api/orders  Content-Type: application/json  {"item":"pen"} -> 200 got pen
// POST /api/orders  Content-Type: text/plain        pen            -> 415`],
            ['MockMvc test for the 415.',
                r`@Test void wrongType() throws Exception {
    mvc.perform(post("/api/orders")
            .contentType(MediaType.TEXT_PLAIN).content("pen"))
       .andExpect(status().isUnsupportedMediaType());
}
@Test void jsonOk() throws Exception {
    mvc.perform(post("/api/orders")
            .contentType(MediaType.APPLICATION_JSON).content("{\"item\":\"pen\"}"))
       .andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]],
        [['Two methods on one path.',
            r`@PostMapping(value = "/import", consumes = "application/json")
public String importJson(@RequestBody List<String> rows) { return "json"; }

@PostMapping(value = "/import", consumes = "text/csv")
public String importCsv(@RequestBody String csv) { return "csv"; }

// OUTPUT:
// Content-Type: application/json -> json
// Content-Type: text/csv         -> csv`],
            ['Form data endpoint.',
                r`@PostMapping(value = "/login",
        consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
public String login(@RequestParam String user) { return "hi " + user; }

// OUTPUT:
// POST /login  user=ann  (form encoded) -> hi ann`]]
    ),

    'mvc-produces': x(
        ['<b>produces</b> is a mapping condition that declares the media type a handler returns, such as <code>produces = "application/json"</code>.',
            '<b>Content negotiation</b>: Spring compares the request <code>Accept</code> header with <code>produces</code>; no match gives <code>406 Not Acceptable</code>.',
            '<b>Response header</b>: the chosen type is written into the response <code>Content-Type</code>.'],
        ['<b>consumes vs produces</b>: consumes looks at the request Content-Type, produces looks at the request Accept and sets the response type.',
            '<b>Charset</b>: add it when needed, for example <code>text/plain;charset=UTF-8</code>.',
            '<b>Several types</b>: <code>produces = {"application/json", "application/xml"}</code> lets the client choose with Accept.'],
        ['<b>Condition</b>: <code>ProducesRequestCondition</code> filters candidate handlers by Accept.',
            '<b>Converter</b>: <code>HttpMessageConverter</code> instances that can write the chosen type serialize the return value.',
            '<b>Default</b>: without produces Spring negotiates from the Accept header and the available converters.'],
        [['F', 'What does produces do?', 'It states which media type the handler returns and filters requests by Accept.'],
            ['F', 'Which status means the server cannot return an acceptable type?', '406 Not Acceptable.'],
            ['M', 'Which request header does produces compare?', 'Accept.'],
            ['M', 'How do you serve JSON and XML from one path?', 'Declare two methods with different produces, or one method with both types and the right converters.'],
            ['S', 'Does produces affect the response Content-Type?', 'Yes. The negotiated type from produces is set on the response.'],
            ['S', 'Why can produces make a JSON endpoint return 406 for a browser?', 'A client that sends only Accept text/html cannot be served JSON, so no handler matches.']],
        [['JSON and plain text variants.',
            r`@RestController
public class InfoController {
    @GetMapping(value = "/info", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> json() { return Map.of("app", "demo"); }

    @GetMapping(value = "/info", produces = MediaType.TEXT_PLAIN_VALUE)
    public String text() { return "app=demo"; }
}

// OUTPUT:
// Accept: application/json -> {"app":"demo"}
// Accept: text/plain       -> app=demo`],
            ['MockMvc test of negotiation.',
                r`@Test void plain() throws Exception {
    mvc.perform(get("/info").accept(MediaType.TEXT_PLAIN))
       .andExpect(content().string("app=demo"));
}
@Test void notAcceptable() throws Exception {
    mvc.perform(get("/info").accept(MediaType.APPLICATION_XML))
       .andExpect(status().isNotAcceptable());
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]],
        [['Both consumes and produces.',
            r`@PostMapping(value = "/echo",
        consumes = "application/json", produces = "application/json")
public Map<String, Object> echo(@RequestBody Map<String, Object> body) {
    return body;
}

// OUTPUT:
// POST /echo {"a":1} -> 200 {"a":1}  Content-Type: application/json`],
            ['Plain text with charset.',
                r`@GetMapping(value = "/hello", produces = "text/plain;charset=UTF-8")
public String hello() { return "Namaste"; }

// OUTPUT:
// 200  Content-Type: text/plain;charset=UTF-8
// Namaste`]]
    ),

    'mvc-http-request': x(
        ['<b>HTTP request</b> is the message a client sends: a request line (method, URL, version), headers, and an optional body.',
            '<b>In Spring MVC</b> it reaches your code as <code>HttpServletRequest</code> or, more conveniently, as typed method arguments.',
            '<b>Parts</b>: path, query string, headers, cookies, session, and body all can be injected with annotations.'],
        ['<b>Annotations</b>: <code>@RequestParam</code> (query or form), <code>@PathVariable</code> (URL path), <code>@RequestHeader</code>, <code>@CookieValue</code>, <code>@RequestBody</code>.',
            '<b>Raw access</b>: declare <code>HttpServletRequest</code> or <code>WebRequest</code> as an argument when you need everything.',
            '<b>HttpEntity</b>: <code>HttpEntity&lt;T&gt;</code> or <code>RequestEntity&lt;T&gt;</code> gives headers and body together.'],
        ['<b>Resolution</b>: the <code>DispatcherServlet</code> calls <code>HandlerMethodArgumentResolver</code> beans, one per argument type or annotation.',
            '<b>Body</b>: <code>@RequestBody</code> is read by <code>RequestResponseBodyMethodProcessor</code> with an <code>HttpMessageConverter</code>.',
            '<b>One read</b>: the body stream can be read only once, so avoid reading it in a filter without a caching wrapper.'],
        [['F', 'What are the parts of an HTTP request?', 'Request line, headers and an optional body.'],
            ['F', 'How do you read a header in Spring MVC?', 'Use @RequestHeader on a method parameter.'],
            ['M', 'What is the difference between query parameters and the body?', 'Query parameters are in the URL; the body carries the payload, usually JSON or form data.'],
            ['M', 'When use HttpServletRequest directly?', 'When you need low-level data such as the remote address or raw attributes.'],
            ['S', 'Which component fills controller arguments?', 'HandlerMethodArgumentResolver implementations used by RequestMappingHandlerAdapter.'],
            ['S', 'Why can the request body be read only once?', 'It is an input stream; use ContentCachingRequestWrapper if a filter must also read it.']],
        [['Read several parts of a request.',
            r`@RestController
public class RequestInfoController {
    @PostMapping("/info/{id}")
    public String info(@PathVariable int id,
                       @RequestParam(defaultValue = "none") String tag,
                       @RequestHeader("User-Agent") String agent,
                       @RequestBody String body,
                       HttpServletRequest req) {
        return req.getMethod() + " " + id + " " + tag + " " + body;
    }
}

// OUTPUT:
// POST /info/5?tag=a  body "hello" -> POST 5 a hello`],
            ['Test headers and body with MockMvc.',
                r`@Test void request() throws Exception {
    mvc.perform(post("/info/5").param("tag", "a")
            .header("User-Agent", "test").content("hello"))
       .andExpect(content().string("POST 5 a hello"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['RequestEntity gives method, URL, headers and body.',
            r`@PostMapping("/inspect")
public String inspect(RequestEntity<String> request) {
    return request.getMethod() + " " + request.getUrl().getPath()
        + " " + request.getHeaders().getContentType();
}

// OUTPUT:
// POST /inspect  Content-Type: text/plain -> POST /inspect text/plain`],
            ['Cookie and client address.',
                r`@GetMapping("/who")
public String who(@CookieValue(defaultValue = "guest") String user,
                  HttpServletRequest req) {
    return user + " from " + req.getRemoteAddr();
}

// OUTPUT: (varies)
// GET /who  Cookie: user=ann -> ann from 127.0.0.1`]]
    ),

    'mvc-http-response': x(
        ['<b>HTTP response</b> is what the server returns: a status line, headers and an optional body.',
            '<b>In Spring MVC</b> you shape it with return values, <code>ResponseEntity</code>, <code>@ResponseStatus</code> or the raw <code>HttpServletResponse</code>.',
            '<b>Status codes</b>: 2xx success, 3xx redirect, 4xx client error, 5xx server error; choose them on purpose, for example <code>201 Created</code> after a POST.'],
        ['<b>@ResponseBody</b> (or <code>@RestController</code>) writes the return value to the body through an <code>HttpMessageConverter</code>.',
            '<b>ResponseEntity&lt;T&gt;</b> controls status, headers and body in one object.',
            '<b>Views</b>: a plain <code>@Controller</code> returning a String names a view, which a <code>ViewResolver</code> renders as HTML.'],
        ['<b>Handling</b>: <code>RequestResponseBodyMethodProcessor</code> or <code>ViewNameMethodReturnValueHandler</code> processes the return value.',
            '<b>Errors</b>: exceptions go to <code>HandlerExceptionResolver</code> beans, such as <code>@ExceptionHandler</code> and <code>ResponseStatusException</code>.',
            '<b>Committed</b>: once the response is committed (flushed), you cannot change status or headers any more.'],
        [['F', 'What is in an HTTP response?', 'A status line, headers and an optional body.'],
            ['F', 'Which status should a successful create return?', '201 Created, often with a Location header.'],
            ['M', 'How do you set status and headers together?', 'Return a ResponseEntity.'],
            ['M', 'Difference between @Controller and @RestController?', '@RestController adds @ResponseBody, so return values go to the body instead of view resolution.'],
            ['S', 'Which component writes a returned object as JSON?', 'A Jackson-based HttpMessageConverter, used by RequestResponseBodyMethodProcessor.'],
            ['S', 'Why does setting a header late sometimes have no effect?', 'The response was already committed, so status and headers are fixed.']],
        [['Return 201 with a Location header.',
            r`@PostMapping("/api/items")
public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> in) {
    URI uri = URI.create("/api/items/42");
    return ResponseEntity.created(uri).body(Map.of("id", 42, "name", in.get("name")));
}

// OUTPUT:
// HTTP/1.1 201
// Location: /api/items/42
// {"id":42,"name":"pen"}`],
            ['Test status and header.',
                r`@Test void created() throws Exception {
    mvc.perform(post("/api/items").contentType("application/json")
            .content("{\"name\":\"pen\"}"))
       .andExpect(status().isCreated())
       .andExpect(header().string("Location", "/api/items/42"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Status annotation and error response.',
            r`@GetMapping("/api/items/{id}")
public Map<String, Object> find(@PathVariable int id) {
    if (id > 100) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no item " + id);
    }
    return Map.of("id", id);
}

// OUTPUT:
// GET /api/items/5   -> 200 {"id":5}
// GET /api/items/500 -> 404`],
            ['Write directly to the response.',
                r`@GetMapping("/raw")
public void raw(HttpServletResponse res) throws IOException {
    res.setStatus(200);
    res.setContentType("text/plain");
    res.getWriter().write("raw text");
}

// OUTPUT:
// 200  Content-Type: text/plain
// raw text`]]
    ),

    'mvc-request-parameters': x(
        ['<b>Request parameters</b> are name-value pairs sent in the query string (<code>?page=2&amp;size=10</code>) or in a form-encoded body.',
            '<b>Binding</b>: Spring MVC copies them into method arguments, usually with <code>@RequestParam</code>, or into an object with <code>@ModelAttribute</code>.',
            '<b>Always text</b>: they arrive as strings and Spring converts them to int, boolean, enums, dates and so on.'],
        ['<b>Optional or default</b>: use <code>required = false</code>, <code>defaultValue</code> or <code>Optional&lt;T&gt;</code>.',
            '<b>Many values</b>: <code>?tag=a&amp;tag=b</code> binds to a <code>List&lt;String&gt;</code> or array.',
            '<b>All at once</b>: <code>@RequestParam Map&lt;String,String&gt;</code> collects every parameter.'],
        ['<b>Conversion</b>: <code>WebDataBinder</code> and the <code>ConversionService</code> convert strings to target types.',
            '<b>Errors</b>: a missing required parameter gives <code>MissingServletRequestParameterException</code> (400); a bad type gives <code>MethodArgumentTypeMismatchException</code> (400).',
            '<b>Not for secrets</b>: query strings end up in logs and browser history.'],
        [['F', 'What are request parameters?', 'Name-value pairs in the query string or in a form-encoded body.'],
            ['F', 'How do you read one in Spring MVC?', 'With @RequestParam on a method argument.'],
            ['M', 'How do you bind many parameters to an object?', 'Use a plain object argument (or @ModelAttribute); fields are bound by name.'],
            ['M', 'What happens if a required parameter is missing?', 'Spring returns 400 Bad Request.'],
            ['S', 'Which class performs the conversion?', 'WebDataBinder with the ConversionService or registered PropertyEditors.'],
            ['S', 'Why avoid sending passwords as query parameters?', 'URLs are logged and cached, so secrets would leak; use a POST body or headers.']],
        [['Search with paging.',
            r`@GetMapping("/search")
public String search(@RequestParam String q,
                     @RequestParam(defaultValue = "0") int page,
                     @RequestParam(defaultValue = "10") int size) {
    return q + " page=" + page + " size=" + size;
}

// OUTPUT:
// GET /search?q=java            -> java page=0 size=10
// GET /search?q=java&page=2     -> java page=2 size=10
// GET /search                   -> 400 (q is required)`],
            ['Test the 400 and the defaults.',
                r`@Test void missing() throws Exception {
    mvc.perform(get("/search")).andExpect(status().isBadRequest());
}
@Test void defaults() throws Exception {
    mvc.perform(get("/search").param("q", "java"))
       .andExpect(content().string("java page=0 size=10"));
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]],
        [['Bind parameters to an object.',
            r`public record Filter(String city, Integer minAge) { }

@GetMapping("/people")
public String people(Filter f) {
    return f.city() + " " + f.minAge();
}

// OUTPUT:
// GET /people?city=Pune&minAge=21 -> Pune 21`],
            ['Multi-value and map forms.',
                r`@GetMapping("/tags")
public String tags(@RequestParam List<String> t,
                   @RequestParam Map<String, String> all) {
    return t + " " + all.size();
}

// OUTPUT:
// GET /tags?t=a&t=b -> [a, b] 1`]]
    ),

    'mvc-requestparam': x(
        ['<b>@RequestParam</b> binds a query-string or form parameter to a controller method argument: <code>@RequestParam("name") String name</code>.',
            '<b>Attributes</b>: <code>value</code>/<code>name</code> (parameter name), <code>required</code> (default true) and <code>defaultValue</code>.',
            '<b>Missing</b>: a required parameter that is absent returns <code>400 Bad Request</code>.'],
        ['<b>Name inference</b>: the name can be omitted when the code is compiled with <code>-parameters</code> (Spring Boot does this by default).',
            '<b>Optional</b>: <code>@RequestParam Optional&lt;String&gt;</code> or <code>required = false</code> gives null when absent.',
            '<b>Collections</b>: <code>List</code>, arrays, and <code>Map&lt;String,String&gt;</code> are supported.'],
        ['<b>Resolver</b>: <code>RequestParamMethodArgumentResolver</code> reads <code>request.getParameter</code> and converts the value.',
            '<b>Empty vs missing</b>: <code>?name=</code> is present but empty, and <code>defaultValue</code> also replaces an empty value.',
            '<b>Multipart</b>: for file uploads <code>@RequestParam MultipartFile</code> is resolved by the same family of resolvers.'],
        [['F', 'What does @RequestParam do?', 'It binds a request parameter to a method argument.'],
            ['F', 'Is it required by default?', 'Yes. A missing parameter gives 400 unless required is false or a defaultValue is set.'],
            ['M', 'What does defaultValue do?', 'It supplies a value when the parameter is missing or empty and makes the parameter optional.'],
            ['M', 'How to receive ?id=1&id=2?', 'Declare a List<Integer> or int[] argument.'],
            ['S', 'Why can the name be omitted?', 'Spring reads parameter names from bytecode compiled with -parameters.'],
            ['S', 'What is the difference between @RequestParam and @PathVariable?', 'RequestParam reads the query string or form; PathVariable reads a segment of the URL path.']],
        [['Required, optional and default.',
            r`@GetMapping("/greet")
public String greet(@RequestParam String name,
                    @RequestParam(required = false) String title,
                    @RequestParam(defaultValue = "en") String lang) {
    return (title == null ? "" : title + " ") + name + " (" + lang + ")";
}

// OUTPUT:
// GET /greet?name=Ann             -> Ann (en)
// GET /greet?name=Ann&title=Dr    -> Dr Ann (en)
// GET /greet                      -> 400`],
            ['Type mismatch test.',
                r`@GetMapping("/square")
public int square(@RequestParam int n) { return n * n; }

@Test void bad() throws Exception {
    mvc.perform(get("/square").param("n", "abc"))
       .andExpect(status().isBadRequest());
}

// OUTPUT:
// GET /square?n=4   -> 16
// GET /square?n=abc -> 400 Bad Request`]],
        [['List of ids.',
            r`@GetMapping("/items")
public String items(@RequestParam("id") List<Integer> ids) {
    return "ids=" + ids;
}

// OUTPUT:
// GET /items?id=1&id=2&id=3  -> ids=[1, 2, 3]
// GET /items?id=1,2,3        -> ids=[1, 2, 3]`],
            ['Enum and date conversion.',
                r`enum Sort { ASC, DESC }

@GetMapping("/report")
public String report(@RequestParam Sort sort,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from) {
    return sort + " " + from.plusDays(1);
}

// OUTPUT:
// GET /report?sort=ASC&from=2025-01-31 -> ASC 2025-02-01`]]
    ),

    'mvc-path-variables': x(
        ['<b>Path variables</b> are values placed inside the URL path itself, written as template segments such as <code>/users/{id}</code>.',
            '<b>RESTful style</b>: they identify a resource (<code>/orders/17</code>), while query parameters filter or sort.',
            '<b>Binding</b>: Spring extracts the segment and passes it to the method with <code>@PathVariable</code>.'],
        ['<b>Several variables</b>: <code>/users/{userId}/orders/{orderId}</code> works with two arguments.',
            '<b>Regex</b>: <code>{id:[0-9]+}</code> restricts a variable, so <code>/users/abc</code> gives a 404 instead of a conversion error.',
            '<b>Type conversion</b>: the segment is converted to int, long, UUID, enum and more.'],
        ['<b>Matching</b>: <code>PathPattern</code> (the default parser) matches the URL and fills the URI template variables.',
            '<b>Storage</b>: values are kept in the request attribute <code>HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE</code>.',
            '<b>Specificity</b>: literal segments win over variable ones, so <code>/users/me</code> beats <code>/users/{id}</code>.'],
        [['F', 'What is a path variable?', 'A value that is part of the URL path, declared like /users/{id}.'],
            ['F', 'Which annotation reads it?', '@PathVariable.'],
            ['M', 'How do you restrict an id to digits?', 'Use a regex in the template: {id:[0-9]+}.'],
            ['M', 'What happens for /users/abc when id is an int?', 'Conversion fails and Spring returns 400 Bad Request, unless a regex made the mapping not match.'],
            ['S', 'Where does Spring store the extracted variables?', 'In the request attribute URI_TEMPLATE_VARIABLES_ATTRIBUTE, read by PathVariableMethodArgumentResolver.'],
            ['S', 'When choose path variable over query parameter?', 'For identifying a resource; query parameters are better for optional filters, sorting and paging.']],
        [['Nested resource.',
            r`@RestController
public class OrderController {
    @GetMapping("/users/{userId}/orders/{orderId}")
    public String order(@PathVariable long userId, @PathVariable long orderId) {
        return "user " + userId + " order " + orderId;
    }
}

// OUTPUT:
// GET /users/3/orders/9 -> user 3 order 9`],
            ['Test with URI variables.',
                r`@Test void nested() throws Exception {
    mvc.perform(get("/users/{u}/orders/{o}", 3, 9))
       .andExpect(content().string("user 3 order 9"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Regex restriction.',
            r`@GetMapping("/products/{id:[0-9]+}")
public String byId(@PathVariable int id) { return "id " + id; }

@GetMapping("/products/{slug:[a-z-]+}")
public String bySlug(@PathVariable String slug) { return "slug " + slug; }

// OUTPUT:
// GET /products/15        -> id 15
// GET /products/red-shoe  -> slug red-shoe`],
            ['Collect all variables in a map.',
                r`@GetMapping("/{country}/{city}")
public String where(@PathVariable Map<String, String> vars) {
    return vars.get("city") + ", " + vars.get("country");
}

// OUTPUT:
// GET /india/pune -> pune, india`]]
    ),

    'mvc-pathvariable': x(
        ['<b>@PathVariable</b> binds a URI template variable to a method argument: <code>@GetMapping("/users/{id}")</code> with <code>@PathVariable Long id</code>.',
            '<b>Name matching</b>: the argument name must equal the placeholder, or be given explicitly, as in <code>@PathVariable("id") Long userId</code>.',
            '<b>Required</b>: by default the variable is required; a missing one means the mapping did not match.'],
        ['<b>Optional</b>: <code>required = false</code> or <code>Optional&lt;T&gt;</code> works only when another mapping covers the shorter path.',
            '<b>Map form</b>: <code>@PathVariable Map&lt;String,String&gt;</code> receives all variables.',
            '<b>Conversion</b>: a failing conversion (for example text for a Long) gives 400 Bad Request.'],
        ['<b>Resolver</b>: <code>PathVariableMethodArgumentResolver</code> reads the template variables saved by the handler mapping.',
            '<b>Encoding</b>: values are URL-decoded, and a dot or a slash needs care because suffix and path handling changed in Spring 6.',
            '<b>Security</b>: validate the value (type, range, regex) before using it in a query or a file path.'],
        [['F', 'What does @PathVariable do?', 'It binds a part of the URL path to a method argument.'],
            ['F', 'Must the argument name match the placeholder?', 'Yes, unless you give the name in the annotation.'],
            ['M', 'How do you make a path variable optional?', 'Map two paths on the method, and use required = false or Optional.'],
            ['M', 'What status is returned for /users/abc with Long id?', '400 Bad Request, because the conversion fails.'],
            ['S', 'How does Spring know the names without the annotation value?', 'The code is compiled with -parameters, so names are available by reflection.'],
            ['S', 'How can you prevent path traversal with a variable?', 'Validate with a regex, and never concatenate it into a file path without normalization.']],
        [['Basic and renamed binding.',
            r`@GetMapping("/users/{id}")
public String user(@PathVariable Long id) { return "user " + id; }

@GetMapping("/teams/{teamId}")
public String team(@PathVariable("teamId") String code) { return "team " + code; }

// OUTPUT:
// GET /users/8    -> user 8
// GET /teams/dev  -> team dev`],
            ['Optional variable with two mappings.',
                r`@GetMapping({"/blog", "/blog/{year}"})
public String blog(@PathVariable(required = false) Integer year) {
    return year == null ? "all years" : "year " + year;
}

// OUTPUT:
// GET /blog       -> all years
// GET /blog/2025  -> year 2025`]],
        [['Validate the variable.',
            r`@Validated
@RestController
public class FileController {
    @GetMapping("/files/{name}")
    public String file(@PathVariable @Pattern(regexp = "[a-z0-9_]+") String name) {
        return "file " + name;
    }
}

// OUTPUT:
// GET /files/report_1  -> file report_1
// GET /files/..        -> 400 (violates the pattern)`],
            ['Test the type mismatch.',
                r`@Test void notANumber() throws Exception {
    mvc.perform(get("/users/abc")).andExpect(status().isBadRequest());
}
@Test void ok() throws Exception {
    mvc.perform(get("/users/8")).andExpect(content().string("user 8"));
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]]
    )
};

export const smvc06Deep: Record<string, Deep> = {
    'mvc-method-level-mapping': dv(
        [`<p>Method mappings are collected once at startup.</p><ul><li><b>Scan:</b> <code>RequestMappingHandlerMapping</code> finds beans annotated with <code>@Controller</code> or <code>@RequestMapping</code>.</li><li><b>Combine:</b> for each method a <code>RequestMappingInfo</code> is built and merged with the class-level one (paths joined, conditions combined).</li><li><b>Lookup:</b> per request the registry returns the matching infos and the best one is chosen by comparator.</li><li><b>Invoke:</b> <code>RequestMappingHandlerAdapter</code> resolves arguments, calls the method and handles the return value.</li></ul>`,
            r`@RestController
@RequestMapping("/api/v1/books")
public class BookApi {
    @GetMapping("/{id}")
    public String get(@PathVariable int id) { return "b" + id; }
}
// Registered at startup (logged at TRACE for RequestMappingHandlerMapping):
// {GET [/api/v1/books/{id}]} -> BookApi#get(int)

// OUTPUT:
// Mapped "{[/api/v1/books/{id}], methods=[GET]}" onto String BookApi.get(int)`],
        [`<p>Variants of a method-level mapping:</p><ul><li><b>Shortcuts:</b> <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@PatchMapping</code>, <code>@DeleteMapping</code>.</li><li><b>Generic:</b> <code>@RequestMapping(value, method, params, headers, consumes, produces)</code>.</li><li><b>Multiple verbs:</b> <code>method = {GET, HEAD}</code>.</li><li><b>Empty path:</b> a method with no path maps to the class prefix itself.</li><li><b>Version header:</b> <code>headers = "X-API-Version=2"</code> selects between versions.</li></ul>`,
            r`@RestController
@RequestMapping("/api/notes")
public class NoteController {
    @RequestMapping(method = {RequestMethod.GET, RequestMethod.HEAD})
    public String list() { return "all"; }

    @GetMapping(value = "/{id}", headers = "X-API-Version=2")
    public String v2(@PathVariable int id) { return "v2 note " + id; }

    @GetMapping("/{id}")
    public String v1(@PathVariable int id) { return "v1 note " + id; }
}

// OUTPUT:
// GET /api/notes/3  X-API-Version: 2 -> v2 note 3
// GET /api/notes/3                   -> v1 note 3`],
        [`<p>Common mistakes:</p><ul><li><b>Missing slash or double slash:</b> Spring joins paths, but a typo like <code>"users"</code> without prefix slash still works while hiding bugs; keep one style.</li><li><b>Ambiguous mapping:</b> two methods with equal conditions fail at startup; add params or change the path.</li><li><b>Using @Controller without @ResponseBody:</b> a returned string is treated as a view name and gives a 404 or a template error.</li><li><b>Wrong verb in clients:</b> a form can only send GET and POST, so use hidden-method filters or fetch.</li><li><b>Mapping on interface only:</b> works, but keep annotations in one place.</li></ul>`,
            r`@Controller            // MISTAKE: no @ResponseBody, "hello" is read as a view name
public class HelloController {
    @GetMapping("/hello")
    public String hello() { return "hello"; }
}
// FIX: use @RestController, or add @ResponseBody to the method.

// OUTPUT:
// Before: 500 / 404  Error resolving template [hello]
// After : 200 hello`],
        [`<p>Mapping lookup is cheap, but keep it simple:</p><ul><li><b>Direct path:</b> literal paths are looked up in a hash map first, patterns are tried afterwards.</li><li><b>Pattern count:</b> thousands of wildcard patterns slow matching; prefer literal paths.</li><li><b>Startup:</b> mapping scan time grows with controller count, which is rarely a problem.</li><li><b>Observe:</b> Actuator <code>/actuator/mappings</code> lists all mappings.</li></ul>`,
            r`# application.properties
management.endpoints.web.exposure.include=mappings
logging.level.org.springframework.web.servlet.mvc.method.annotation=TRACE

# OUTPUT:
# GET /actuator/mappings -> JSON with every handler, pattern and method (varies)`],
        [`<p>Real-world: a REST API for a library with a class prefix and verbs that match CRUD. Keep one controller per resource, put the shared prefix on the class, and test every mapping with <code>@WebMvcTest</code> so a refactor cannot silently change a URL.</p>`,
            r`@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService service;

    @GetMapping            public List<Member> list() { return service.all(); }
    @GetMapping("/{id}")   public Member get(@PathVariable long id) { return service.get(id); }
    @PostMapping           public ResponseEntity<Member> add(@RequestBody Member m) {
        Member saved = service.save(m);
        return ResponseEntity.created(URI.create("/api/members/" + saved.id())).body(saved);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable long id) { service.delete(id); }
}

// OUTPUT:
// GET /api/members -> 200 [...]   POST -> 201   DELETE /api/members/1 -> 204`]
    ),

    'mvc-multiple-url-mappings': dv(
        [`<p>One handler, many patterns.</p><ul><li><b>Model:</b> <code>RequestMappingInfo</code> holds a <code>PathPatternsRequestCondition</code> with a set of patterns.</li><li><b>Matching:</b> a request matches if any pattern matches; the best one is recorded in a request attribute.</li><li><b>Combination:</b> class patterns and method patterns are combined as a cross product.</li></ul>`,
            r`@GetMapping({"/home", "/index"})
public String home(HttpServletRequest req) {
    Object p = req.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
    return "matched " + p;
}

// OUTPUT:
// GET /index -> matched /index
// GET /home  -> matched /home`],
        [`<p>Ways to expose several URLs:</p><ul><li><b>Array of paths:</b> <code>@GetMapping({"/a", "/b"})</code>.</li><li><b>Wildcards:</b> <code>*</code> for one segment, <code>**</code> for many, <code>?</code> for one character.</li><li><b>Optional segment:</b> map two paths, one with the variable and one without.</li><li><b>View controller:</b> <code>registry.addViewController("/old").setViewName("home")</code> for static aliases.</li><li><b>Redirect:</b> <code>registry.addRedirectViewController("/old", "/new")</code>.</li></ul>`,
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/about-us").setViewName("about");
        registry.addRedirectViewController("/old-about", "/about-us");
    }
}

// OUTPUT:
// GET /about-us  -> renders view "about"
// GET /old-about -> 302 Location: /about-us`],
        [`<p>Mistakes:</p><ul><li><b>Forgetting curly braces:</b> <code>@GetMapping("/a", "/b")</code> does not compile; use an array.</li><li><b>Overlap with another method:</b> a wildcard alias that also matches another handler may be ambiguous.</li><li><b>Trailing slash assumption:</b> in Spring 6 add both <code>/x</code> and <code>/x/</code> if clients use either.</li><li><b>Too many aliases:</b> duplicate URLs hurt SEO and caching; redirect instead.</li></ul>`,
            r`// MISTAKE: client calls /reports/ but only /reports is mapped (404 in Spring 6)
@GetMapping("/reports")
public String reports() { return "ok"; }

// FIX: list both, or normalize with a redirect
@GetMapping({"/reports", "/reports/"})
public String reportsFixed() { return "ok"; }

// OUTPUT:
// GET /reports/ before: 404, after: 200 ok`],
        [`<p>Aliases cost almost nothing at runtime because they are only extra patterns in one condition. The real cost is operational: each alias is another URL to document, secure and cache. Secure all aliases with the same rule, preferably by pattern in the security configuration.</p>`,
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a
        .requestMatchers("/admin/**", "/manage/**").hasRole("ADMIN")
        .anyRequest().permitAll());
    return http.build();
}

// OUTPUT:
// Both /admin/x and /manage/x require ROLE_ADMIN; an alias cannot bypass it`],
        [`<p>Real-world: a site moves from <code>/products</code> to <code>/catalog</code>. During the migration both URLs are served by one handler; later the old one becomes a permanent redirect and finally disappears.</p>`,
            r`@Controller
public class CatalogController {
    // phase 1: both URLs work
    @GetMapping({"/catalog", "/products"})
    @ResponseBody
    public String list() { return "catalog"; }
}
// phase 2: keep only /catalog and redirect the old URL
// registry.addRedirectViewController("/products", "/catalog");

// OUTPUT:
// phase 1: /catalog -> catalog, /products -> catalog
// phase 2: /products -> 302 /catalog`]
    ),

    'mvc-consumes': dv(
        [`<p>Request conditions are evaluated during mapping lookup.</p><ul><li><b>Parse:</b> <code>ConsumesRequestCondition</code> parses the request <code>Content-Type</code> into a <code>MediaType</code>.</li><li><b>Compare:</b> it checks the media type against the declared expressions, including wildcards and negation.</li><li><b>Fail:</b> if the path matches but the type does not, <code>HttpMediaTypeNotSupportedException</code> becomes <code>415</code>.</li><li><b>Read:</b> a converter such as <code>MappingJackson2HttpMessageConverter</code> deserializes the body.</li></ul>`,
            r`@PostMapping(value = "/data", consumes = "application/json")
public String data(@RequestBody Map<String, Object> m) { return "json " + m.size(); }

// Response for a wrong type includes the supported ones:
// OUTPUT:
// HTTP/1.1 415
// Accept: application/json, application/*+json`],
        [`<p>Options:</p><ul><li><b>Exact type:</b> <code>"application/json"</code>.</li><li><b>Wildcard:</b> <code>"application/*"</code> or <code>"*&#47;*"</code>.</li><li><b>Negation:</b> <code>"!text/plain"</code>.</li><li><b>List:</b> <code>{"application/json", "application/xml"}</code>.</li><li><b>Multipart:</b> <code>MediaType.MULTIPART_FORM_DATA_VALUE</code> for uploads.</li><li><b>Class level:</b> shared default for all methods; a method value replaces it.</li></ul>`,
            r`@RestController
@RequestMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public class UploadController {
    @PostMapping
    public String upload(@RequestPart("file") MultipartFile file,
                         @RequestPart("meta") Map<String, String> meta) {
        return file.getOriginalFilename() + " " + meta.get("owner");
    }
}

// OUTPUT:
// POST /upload (multipart: file=a.txt, meta={"owner":"ann"}) -> a.txt ann`],
        [`<p>Mistakes:</p><ul><li><b>Missing Content-Type from the client:</b> curl with <code>-d</code> sends form-encoded, not JSON; add <code>-H "Content-Type: application/json"</code>.</li><li><b>Confusing with Accept:</b> consumes is about the request, produces about the response.</li><li><b>Using consumes on GET:</b> there is no body, so the condition is meaningless.</li><li><b>Charset in value:</b> <code>application/json;charset=UTF-8</code> in consumes can reject plain <code>application/json</code>.</li></ul>`,
            r`// MISTAKE: curl -X POST -d '{"item":"pen"}' http://localhost:8080/api/orders
//   curl sends application/x-www-form-urlencoded -> 415
// FIX:
//   curl -X POST -H "Content-Type: application/json" \
//        -d '{"item":"pen"}' http://localhost:8080/api/orders

// OUTPUT:
// before: 415 Unsupported Media Type
// after : 200 got pen`],
        [`<p>consumes adds almost no cost. Tuning is about the body: set a maximum size, avoid reading huge JSON into memory and prefer streaming for large uploads.</p><ul><li><b>Size limits:</b> <code>spring.servlet.multipart.max-file-size</code>.</li><li><b>Jackson:</b> reuse one <code>ObjectMapper</code> bean.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
server.tomcat.max-swallow-size=2MB

# OUTPUT:
# upload over 5MB -> 413 / MaxUploadSizeExceededException (handled by an advice)`],
        [`<p>Real-world: an import API accepts JSON from web clients and CSV from batch tools. Two methods share a path and differ only by consumes, so each has simple code and its own tests.</p>`,
            r`@RestController
@RequestMapping("/api/customers")
public class CustomerImportController {
    @PostMapping(value = "/import", consumes = "application/json")
    public int fromJson(@RequestBody List<Customer> list) { return list.size(); }

    @PostMapping(value = "/import", consumes = "text/csv")
    public int fromCsv(@RequestBody String csv) {
        return (int) csv.lines().skip(1).count();      // skip header
    }
}

// OUTPUT:
// JSON array of 3 customers -> 3
// CSV header + 4 rows       -> 4`]
    ),

    'mvc-produces': dv(
        [`<p>Content negotiation steps:</p><ul><li><b>Filter:</b> <code>ProducesRequestCondition</code> keeps handlers whose produces list is compatible with Accept.</li><li><b>Pick:</b> the most specific acceptable type is stored in the request attribute <code>PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE</code>.</li><li><b>Write:</b> the return value handler asks the converters in order for one that can write that type.</li><li><b>Fail:</b> no match gives <code>HttpMediaTypeNotAcceptableException</code> and <code>406</code>.</li></ul>`,
            r`@GetMapping(value = "/price", produces = "application/json")
public Map<String, Double> price() { return Map.of("usd", 9.5); }

// OUTPUT:
// GET /price  Accept: application/json -> 200  {"usd":9.5}
// GET /price  Accept: text/html        -> 406`],
        [`<p>Options:</p><ul><li><b>Constants:</b> <code>MediaType.APPLICATION_JSON_VALUE</code>.</li><li><b>Multiple:</b> several types, client chooses by Accept quality.</li><li><b>XML:</b> add <code>jackson-dataformat-xml</code> to support <code>application/xml</code>.</li><li><b>Vendor types:</b> <code>application/vnd.shop.v2+json</code> for API versioning.</li><li><b>Streaming:</b> <code>text/event-stream</code> for server-sent events.</li></ul>`,
            r`@GetMapping(value = "/api/products/{id}",
        produces = "application/vnd.shop.v2+json")
public ProductV2 v2(@PathVariable long id) { return new ProductV2(id, "pen", "INR"); }

@GetMapping(value = "/api/products/{id}",
        produces = "application/vnd.shop.v1+json")
public ProductV1 v1(@PathVariable long id) { return new ProductV1(id, "pen"); }

// OUTPUT:
// Accept: application/vnd.shop.v2+json -> {"id":1,"name":"pen","currency":"INR"}
// Accept: application/vnd.shop.v1+json -> {"id":1,"name":"pen"}`],
        [`<p>Mistakes:</p><ul><li><b>Browser Accept:</b> browsers send <code>text/html,...,*&#47;*;q=0.8</code>, so JSON still matches thanks to the wildcard.</li><li><b>Missing converter:</b> producing XML without the XML library gives 406.</li><li><b>Hardcoded string typos:</b> <code>"application/jason"</code> fails at runtime; use constants.</li><li><b>Returning String as JSON:</b> a String is written as is; with produces JSON you must supply valid JSON yourself or return an object.</li></ul>`,
            r`// MISTAKE: String return with produces json is NOT converted
@GetMapping(value = "/bad", produces = "application/json")
public String bad() { return "hello"; }       // body is: hello (not valid JSON)

// FIX: return an object or a quoted JSON value
@GetMapping(value = "/good", produces = "application/json")
public Map<String, String> good() { return Map.of("msg", "hello"); }

// OUTPUT:
// /bad  -> hello
// /good -> {"msg":"hello"}`],
        [`<p>Performance notes:</p><ul><li><b>Cacheable:</b> send <code>Vary: Accept</code> (Spring adds it) so caches keep one copy per type.</li><li><b>Compression:</b> enable <code>server.compression.enabled=true</code> for text types.</li><li><b>Avoid duplicate work:</b> do not build both JSON and XML models when only one is asked for.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/plain
server.compression.min-response-size=1024

# OUTPUT:
# Response > 1KB with Accept-Encoding: gzip -> Content-Encoding: gzip`],
        [`<p>Real-world: an API serves JSON to apps and a CSV export to analysts from the same URL, selected by Accept. Tests assert both outputs and the 406 case.</p>`,
            r`@RestController
public class ReportController {
    @GetMapping(value = "/reports/sales", produces = "application/json")
    public List<Sale> json() { return repo.findAll(); }

    @GetMapping(value = "/reports/sales", produces = "text/csv")
    public String csv() {
        return "id,amount\n" + repo.findAll().stream()
            .map(s -> s.id() + "," + s.amount())
            .collect(Collectors.joining("\n"));
    }
}

// OUTPUT:
// Accept: text/csv -> id,amount
//                     1,250.0
// Accept: image/png -> 406`]
    ),

    'mvc-http-request': dv(
        [`<p>Journey of a request:</p><ul><li><b>Container:</b> Tomcat parses the bytes into an <code>HttpServletRequest</code> and calls the servlet.</li><li><b>Dispatch:</b> <code>DispatcherServlet</code> asks <code>HandlerMapping</code> for a handler and <code>HandlerAdapter</code> to run it.</li><li><b>Arguments:</b> each parameter is filled by a <code>HandlerMethodArgumentResolver</code>.</li><li><b>Body:</b> converters turn the stream into objects; a <code>HandlerInterceptor</code> can inspect the request before and after.</li></ul>`,
            r`@Component
public class LogInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                             Object handler) {
        System.out.println(req.getMethod() + " " + req.getRequestURI()
            + " -> " + handler);
        return true;
    }
}

// OUTPUT:
// GET /users/5 -> com.example.UserController#get(long)`],
        [`<p>Ways to access request data:</p><ul><li><b>Annotations:</b> <code>@RequestParam</code>, <code>@PathVariable</code>, <code>@RequestHeader</code>, <code>@CookieValue</code>, <code>@RequestBody</code>, <code>@RequestAttribute</code>, <code>@SessionAttribute</code>.</li><li><b>Types:</b> <code>HttpServletRequest</code>, <code>WebRequest</code>, <code>Locale</code>, <code>Principal</code>, <code>HttpMethod</code>.</li><li><b>Wrappers:</b> <code>HttpEntity</code>, <code>RequestEntity</code>.</li><li><b>Static helper:</b> <code>RequestContextHolder</code> for code outside controllers.</li></ul>`,
            r`@GetMapping("/ctx")
public String ctx(Locale locale, Principal user,
                  @RequestHeader Map<String, String> headers,
                  HttpMethod method) {
    return method + " " + locale + " "
        + (user == null ? "anon" : user.getName()) + " " + headers.size();
}

// OUTPUT: (varies)
// GET en_US anon 5`],
        [`<p>Mistakes:</p><ul><li><b>Reading body twice:</b> a filter that reads the stream leaves nothing for <code>@RequestBody</code>; use <code>ContentCachingRequestWrapper</code>.</li><li><b>Trusting headers:</b> <code>X-Forwarded-For</code> can be forged unless set by your proxy.</li><li><b>Storing request in a field:</b> controllers are singletons, so never keep the request in a field.</li><li><b>Case in headers:</b> header names are case-insensitive, so use the API and not string maps with exact case.</li></ul>`,
            r`@RestController
public class BadController {
    private HttpServletRequest saved;          // MISTAKE: shared by all threads

    @GetMapping("/bad")
    public String bad(HttpServletRequest req) {
        this.saved = req;
        return "x";
    }
}
// FIX: use the request only inside the method, or inject it as a method argument.

// OUTPUT:
// Under load, "saved" would point to a recycled request of another user`],
        [`<p>Tuning:</p><ul><li><b>Limits:</b> cap header and body sizes (<code>server.max-http-request-header-size</code>).</li><li><b>Large bodies:</b> stream with <code>InputStream</code> or <code>@RequestPart</code> instead of loading a String.</li><li><b>Logging:</b> avoid logging full bodies in production.</li></ul>`,
            r`# application.properties
server.max-http-request-header-size=16KB
server.tomcat.max-http-form-post-size=2MB
spring.mvc.log-request-details=false

# OUTPUT:
# header larger than 16KB -> 431 or connection closed (varies by server)`],
        [`<p>Real-world: an audit feature records who called which endpoint. An interceptor or filter reads method, URI, user and a correlation id from headers, and puts the id in the logging context.</p>`,
            r`@Component
public class CorrelationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("requestId", id);
        res.setHeader("X-Request-Id", id);
        try { chain.doFilter(req, res); } finally { MDC.clear(); }
    }
}

// OUTPUT: (varies)
// log: [requestId=7d1c...] GET /api/orders 200 12ms`]
    ),

    'mvc-http-response': dv(
        [`<p>How the response is produced:</p><ul><li><b>Return handler:</b> <code>HandlerMethodReturnValueHandler</code> beans decide what to do with the value.</li><li><b>Body:</b> <code>RequestResponseBodyMethodProcessor</code> picks a converter and writes to the output stream.</li><li><b>View:</b> <code>ViewNameMethodReturnValueHandler</code> sends a name to the <code>ViewResolver</code>.</li><li><b>Exceptions:</b> <code>ExceptionHandlerExceptionResolver</code> maps them to a response.</li><li><b>Commit:</b> after the first flush status and headers can not change.</li></ul>`,
            r`@GetMapping("/api/ping")
public ResponseEntity<String> ping() {
    return ResponseEntity.ok()
        .header("X-Server", "demo")
        .cacheControl(CacheControl.maxAge(Duration.ofSeconds(30)))
        .body("pong");
}

// OUTPUT:
// HTTP/1.1 200
// X-Server: demo
// Cache-Control: max-age=30
// pong`],
        [`<p>Response options:</p><ul><li><b>ResponseEntity:</b> builders such as <code>ok()</code>, <code>created(uri)</code>, <code>noContent()</code>, <code>notFound()</code>.</li><li><b>@ResponseStatus:</b> fixed status on a method or exception class.</li><li><b>ResponseStatusException:</b> throw it to set status and reason.</li><li><b>Streaming:</b> <code>StreamingResponseBody</code> and <code>SseEmitter</code>.</li><li><b>Files:</b> <code>Resource</code> with <code>Content-Disposition</code>.</li><li><b>Redirect:</b> return <code>redirect:/path</code> from a view controller.</li></ul>`,
            r`@GetMapping("/download")
public ResponseEntity<Resource> download() {
    Resource file = new ByteArrayResource("a,b\n1,2".getBytes());
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=data.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(file);
}

// OUTPUT:
// 200  Content-Disposition: attachment; filename=data.csv
// a,b
// 1,2`],
        [`<p>Mistakes:</p><ul><li><b>Always 200:</b> returning an error object with status 200 hides failures; use 4xx and 5xx.</li><li><b>Null body:</b> a null return from a <code>@ResponseBody</code> method gives an empty 200; return 404 or 204 on purpose.</li><li><b>Entity leaks:</b> returning JPA entities exposes internal fields and may trigger lazy loading; use DTOs.</li><li><b>Writing after commit:</b> setting headers after flushing is ignored.</li></ul>`,
            r`// MISTAKE: empty 200 when the item does not exist
@GetMapping("/items/{id}")
public Item bad(@PathVariable long id) { return repo.find(id); }   // may be null

// FIX
@GetMapping("/v2/items/{id}")
public ResponseEntity<Item> good(@PathVariable long id) {
    return repo.findById(id).map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}

// OUTPUT:
// /items/999    -> 200 (empty body)
// /v2/items/999 -> 404`],
        [`<p>Tuning the response:</p><ul><li><b>Compression:</b> gzip text responses.</li><li><b>Caching:</b> <code>ETag</code> and <code>Cache-Control</code>; <code>ShallowEtagHeaderFilter</code> saves bandwidth.</li><li><b>Streaming:</b> avoid building a huge list in memory.</li><li><b>Small payloads:</b> return only needed fields.</li></ul>`,
            r`@Bean
FilterRegistrationBean<ShallowEtagHeaderFilter> etag() {
    var reg = new FilterRegistrationBean<>(new ShallowEtagHeaderFilter());
    reg.addUrlPatterns("/api/*");
    return reg;
}

// OUTPUT:
// 1st GET -> 200 ETag: "0a1b..."   2nd GET (If-None-Match) -> 304 Not Modified`],
        [`<p>Real-world: a consistent error format. A <code>@RestControllerAdvice</code> converts exceptions to the same JSON shape with the right status code, so clients can rely on it.</p>`,
            r`@RestControllerAdvice
public class ApiErrors {
    record ErrorBody(String code, String message) { }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorBody> notFound(NoSuchElementException e) {
        return ResponseEntity.status(404)
            .body(new ErrorBody("NOT_FOUND", e.getMessage()));
    }
}

// OUTPUT:
// HTTP/1.1 404
// {"code":"NOT_FOUND","message":"No value present"}`]
    ),

    'mvc-request-parameters': dv(
        [`<p>Where parameters come from and how they are bound.</p><ul><li><b>Container:</b> the servlet container parses the query string and, for form content types, the body into one parameter map.</li><li><b>Resolver:</b> <code>RequestParamMethodArgumentResolver</code> handles simple types; <code>ModelAttributeMethodProcessor</code> binds objects.</li><li><b>Binder:</b> <code>WebDataBinder</code> converts text with <code>ConversionService</code>, applies formatters and collects <code>BindingResult</code> errors.</li><li><b>Unannotated:</b> a simple type without annotation is treated as <code>@RequestParam</code>, a complex type as <code>@ModelAttribute</code>.</li></ul>`,
            r`public record Paging(int page, int size) {
    public Paging { if (size > 100) size = 100; }
}

@GetMapping("/list")
public String list(Paging p) { return p.page() + "/" + p.size(); }

// OUTPUT:
// GET /list?page=1&size=500 -> 1/100`],
        [`<p>Ways to read parameters:</p><ul><li><b>@RequestParam:</b> one value, list, or map.</li><li><b>Object binding:</b> record or class with matching field names, nested as <code>address.city</code>.</li><li><b>HttpServletRequest:</b> <code>getParameter</code>, <code>getParameterValues</code>, <code>getParameterMap</code>.</li><li><b>Formats:</b> <code>@DateTimeFormat</code> and <code>@NumberFormat</code>.</li><li><b>Params condition:</b> <code>params = "mode=fast"</code> selects a method by value.</li></ul>`,
            r`@GetMapping(value = "/export", params = "mode=fast")
public String fast() { return "fast export"; }

@GetMapping(value = "/export", params = "mode=full")
public String full() { return "full export"; }

// OUTPUT:
// GET /export?mode=fast -> fast export
// GET /export?mode=full -> full export
// GET /export           -> 400 (no method matches the params)`],
        [`<p>Mistakes:</p><ul><li><b>Primitive with missing value:</b> <code>int page</code> without a default gives 400; use <code>Integer</code> or a default.</li><li><b>No bounds:</b> accepting <code>size=1000000</code> invites denial of service; clamp it.</li><li><b>Mass assignment:</b> binding to an entity lets callers set fields like <code>role</code>; bind to a DTO or use <code>setAllowedFields</code>.</li><li><b>Date format:</b> without <code>@DateTimeFormat</code> a date string fails with 400.</li></ul>`,
            r`// MISTAKE: binding request data straight to an entity
@PostMapping("/profile")
public String update(User user) { /* user.role can be set by the caller */ return "ok"; }

// FIX: bind to a DTO with only safe fields
public record ProfileForm(String name, String city) { }
@PostMapping("/profile2")
public String update2(ProfileForm form) { return "ok " + form.name(); }

// OUTPUT:
// POST /profile?role=ADMIN  -> would set role (dangerous)
// POST /profile2?role=ADMIN -> role is ignored`],
        [`<p>Tuning:</p><ul><li><b>Paging:</b> always limit page size.</li><li><b>Query efficiency:</b> pass parameters to the database as bound values, never as concatenated SQL.</li><li><b>Max parameters:</b> the container limits their count (<code>server.tomcat.max-parameter-count</code>).</li></ul>`,
            r`@GetMapping("/orders")
public Page<Order> orders(@RequestParam(defaultValue = "0") int page,
                          @RequestParam(defaultValue = "20") int size) {
    int safe = Math.min(size, 100);
    return repo.findAll(PageRequest.of(page, safe, Sort.by("id").descending()));
}

// OUTPUT:
// GET /orders?size=5000 -> page of at most 100 orders`],
        [`<p>Real-world: a product search page with filters. Parameters carry the filter, sort and paging, so every result page is a bookmarkable URL.</p>`,
            r`public record ProductQuery(String q, String category, Double maxPrice,
                           String sort, Integer page) { }

@GetMapping("/products")
public List<Product> search(ProductQuery f) {
    return service.search(f.q(), f.category(), f.maxPrice(),
                          f.sort(), f.page() == null ? 0 : f.page());
}

// OUTPUT:
// GET /products?q=pen&category=office&maxPrice=50&sort=price -> [ ...matches ]`]
    ),

    'mvc-requestparam': dv(
        [`<p>Resolution of one parameter:</p><ul><li><b>Pick:</b> <code>RequestParamMethodArgumentResolver</code> supports arguments with <code>@RequestParam</code> and simple types.</li><li><b>Read:</b> it looks up the name in <code>request.getParameterValues</code> (or multipart parts).</li><li><b>Missing:</b> it uses <code>defaultValue</code> or throws <code>MissingServletRequestParameterException</code>.</li><li><b>Convert:</b> <code>WebDataBinder.convertIfNecessary</code> turns the text into the target type.</li></ul>`,
            r`@GetMapping("/calc")
public int calc(@RequestParam int a, @RequestParam int b) { return a + b; }

// OUTPUT:
// GET /calc?a=2&b=3 -> 5
// GET /calc?a=2     -> 400 Required parameter 'b' is not present.`],
        [`<p>Annotation attributes and types:</p><ul><li><b>value/name:</b> parameter name.</li><li><b>required:</b> default true.</li><li><b>defaultValue:</b> text used when missing or empty; it implies required false.</li><li><b>Types:</b> String, numbers, boolean, enum, <code>LocalDate</code>, <code>UUID</code>, <code>List</code>, <code>Optional</code>, <code>MultipartFile</code>.</li><li><b>MultiValueMap:</b> keeps all values per name.</li></ul>`,
            r`@GetMapping("/filter")
public String filter(@RequestParam MultiValueMap<String, String> all,
                     @RequestParam Optional<Boolean> active) {
    return all.getOrDefault("color", List.of()) + " active=" + active.orElse(true);
}

// OUTPUT:
// GET /filter?color=red&color=blue -> [red, blue] active=true`],
        [`<p>Mistakes:</p><ul><li><b>Primitive and optional:</b> <code>@RequestParam(required = false) int x</code> fails because null cannot be an int; use <code>Integer</code> or a default.</li><li><b>Name mismatch:</b> the client sends <code>userId</code> while the code expects <code>user_id</code>.</li><li><b>Commas in lists:</b> a single value <code>a,b</code> splits into two list items, which can surprise when values contain commas.</li><li><b>Wrong place:</b> an <code>@RequestParam</code> does not read JSON; JSON needs <code>@RequestBody</code>.</li></ul>`,
            r`// MISTAKE
@GetMapping("/a")
public String a(@RequestParam(required = false) int limit) { return "x"; }

// FIX
@GetMapping("/b")
public String b(@RequestParam(required = false) Integer limit) {
    return "limit " + (limit == null ? 10 : limit);
}

// OUTPUT:
// GET /a  -> 500 IllegalStateException (null for primitive)
// GET /b  -> limit 10`],
        [`<p>Notes for performance and safety:</p><ul><li><b>Validation:</b> add <code>@Validated</code> on the class plus constraints such as <code>@Min</code> and <code>@Max</code> on the parameters.</li><li><b>Limits:</b> clamp numbers that drive queries.</li><li><b>Failures:</b> handle <code>ConstraintViolationException</code> in an advice to return 400.</li></ul>`,
            r`@Validated
@RestController
public class PageController {
    @GetMapping("/rows")
    public String rows(@RequestParam @Min(0) int page,
                       @RequestParam @Min(1) @Max(100) int size) {
        return page + ":" + size;
    }
}

// OUTPUT:
// GET /rows?page=0&size=20  -> 0:20
// GET /rows?page=0&size=500 -> 400 (rows.size must be less than or equal to 100)`],
        [`<p>Real-world: a log viewer endpoint filtered by level and time range. Parameters are optional, typed and validated, and the same URL can be shared by support staff.</p>`,
            r`@GetMapping("/logs")
public List<LogLine> logs(
        @RequestParam(defaultValue = "INFO") String level,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Optional<LocalDateTime> since,
        @RequestParam(defaultValue = "50") @Max(500) int limit) {
    return service.find(level, since.orElse(LocalDateTime.now().minusHours(1)), limit);
}

// OUTPUT:
// GET /logs?level=ERROR&since=2025-03-01T10:00:00 -> [ ...at most 50 lines ]`]
    ),

    'mvc-path-variables': dv(
        [`<p>How template variables work.</p><ul><li><b>Parse:</b> at startup <code>PathPatternParser</code> compiles <code>/users/{id}</code> into a pattern object.</li><li><b>Match:</b> per request <code>PathPattern.matchAndExtract</code> returns the variables.</li><li><b>Store:</b> they go into the request attribute <code>URI_TEMPLATE_VARIABLES_ATTRIBUTE</code>.</li><li><b>Bind:</b> <code>PathVariableMethodArgumentResolver</code> reads that attribute and converts the text.</li></ul>`,
            r`@GetMapping("/files/{dir}/{name}")
public String file(@PathVariable String dir, @PathVariable String name,
                   HttpServletRequest req) {
    Object vars = req.getAttribute(
        HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
    return dir + "/" + name + " " + vars;
}

// OUTPUT:
// GET /files/docs/a -> docs/a {dir=docs, name=a}`],
        [`<p>Pattern features:</p><ul><li><b>Regex:</b> <code>{id:[0-9]+}</code>.</li><li><b>Mixed segments:</b> <code>/files/{name}.{ext}</code> or <code>/v{version}/users</code>.</li><li><b>Multi-segment capture:</b> <code>{*rest}</code> at the end captures the remaining path.</li><li><b>Wildcards:</b> <code>*</code> and <code>**</code> alongside variables.</li><li><b>Matrix variables:</b> <code>/cars;color=red</code> with <code>@MatrixVariable</code> (needs enabling).</li></ul>`,
            r`@GetMapping("/static/{*path}")
public String rest(@PathVariable String path) { return "path=" + path; }

@GetMapping("/doc/{name}.{ext}")
public String doc(@PathVariable String name, @PathVariable String ext) {
    return name + " as " + ext;
}

// OUTPUT:
// GET /static/css/site.css -> path=/css/site.css
// GET /doc/report.pdf      -> report as pdf`],
        [`<p>Mistakes:</p><ul><li><b>Dot in the last variable:</b> older versions cut the suffix; in Spring 6 suffix pattern matching is off, but encode special characters anyway.</li><li><b>Encoded slash:</b> <code>%2F</code> is rejected by default for safety.</li><li><b>Sensitive ids:</b> sequential ids invite guessing; also check ownership, not only existence.</li><li><b>Ambiguous patterns:</b> <code>/a/{x}</code> and <code>/a/{y}</code> in two methods with the same verb conflict.</li></ul>`,
            r`// MISTAKE: anyone can read any invoice by changing the number
@GetMapping("/invoices/{id}")
public Invoice get(@PathVariable long id) { return repo.findById(id).orElseThrow(); }

// FIX: also check the owner
@GetMapping("/v2/invoices/{id}")
public Invoice getMine(@PathVariable long id, Principal me) {
    return repo.findByIdAndOwner(id, me.getName()).orElseThrow();
}

// OUTPUT:
// /invoices/5 as another user -> 200 (leak)
// /v2/invoices/5 as another user -> 404`],
        [`<p>Notes:</p><ul><li><b>Cost:</b> pattern matching is fast; literal paths are looked up directly.</li><li><b>Caching:</b> path-based URLs cache better in CDNs than query-based ones.</li><li><b>Parser:</b> the default <code>PathPatternParser</code> is faster than the old <code>AntPathMatcher</code>.</li></ul>`,
            r`# application.properties (usually the default, shown for clarity)
spring.mvc.pathmatch.matching-strategy=path-pattern-parser

# OUTPUT:
# PathPatternParser is used;
patterns are precompiled once at startup`],
        [`<p>Real-world: a nested REST resource where the URL shows ownership. The service checks the parent-child relation, and a missing child returns 404.</p>`,
            r`@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
public class TaskController {
    @GetMapping("/{taskId}")
    public Task get(@PathVariable long projectId, @PathVariable long taskId) {
        return service.findInProject(projectId, taskId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}

// OUTPUT:
// GET /api/projects/2/tasks/10 -> 200 {...}
// GET /api/projects/3/tasks/10 -> 404 (task belongs to project 2)`]
    ),

    'mvc-pathvariable': dv(
        [`<p>@PathVariable internals:</p><ul><li><b>Supports:</b> <code>PathVariableMethodArgumentResolver</code> handles arguments annotated with <code>@PathVariable</code> (and Map form via <code>PathVariableMapMethodArgumentResolver</code>).</li><li><b>Lookup:</b> reads the template variables attribute set by the matched mapping.</li><li><b>Convert:</b> the text is decoded and converted with the binder.</li><li><b>Missing:</b> throws <code>MissingPathVariableException</code>, which is a server error because it usually means a coding mistake.</li></ul>`,
            r`@GetMapping("/users/{id}")
public String user(@PathVariable("id") long userId) { return "u" + userId; }

@GetMapping("/typo/{id}")
public String typo(@PathVariable long userId) { return "x"; }   // no such variable

// OUTPUT:
// GET /users/4  -> u4
// GET /typo/4   -> 500 MissingPathVariableException`],
        [`<p>Usage forms:</p><ul><li><b>Default name:</b> argument name equals the placeholder.</li><li><b>Explicit name:</b> <code>@PathVariable("id")</code>.</li><li><b>Optional:</b> <code>required = false</code> or <code>Optional</code> with two mappings.</li><li><b>Map:</b> all variables.</li><li><b>Types:</b> <code>UUID</code>, enums, <code>LocalDate</code> (with <code>@DateTimeFormat</code>), or your own class through a <code>Converter</code>.</li></ul>`,
            r`@GetMapping("/status/{s}")
public String status(@PathVariable OrderStatus s) { return s.name(); }

@GetMapping("/day/{d}")
public String day(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                  LocalDate d) { return d.getDayOfWeek().toString(); }

// OUTPUT:
// GET /status/SHIPPED -> SHIPPED
// GET /day/2025-01-01 -> WEDNESDAY
// GET /status/WRONG   -> 400`],
        [`<p>Mistakes:</p><ul><li><b>Renamed variable:</b> placeholder and argument differ, and <code>-parameters</code> is missing, so binding fails.</li><li><b>Optional without second mapping:</b> <code>required = false</code> alone does not make <code>/users/</code> match.</li><li><b>No validation:</b> ids from the path are untrusted input.</li><li><b>Using for filters:</b> <code>/products/red/under50</code> is awkward; use query parameters.</li></ul>`,
            r`// MISTAKE: expects /users and /users/5 to both work
@GetMapping("/users/{id}")
public String one(@PathVariable(required = false) Long id) { return "u"; }

// FIX: two paths
@GetMapping({"/members", "/members/{id}"})
public String two(@PathVariable(required = false) Long id) {
    return id == null ? "all" : "member " + id;
}

// OUTPUT:
// GET /users   -> 404
// GET /members -> all, GET /members/5 -> member 5`],
        [`<p>Tuning and safety:</p><ul><li><b>Regex:</b> restrict early so bad input gives 404 without reaching your code.</li><li><b>Validation:</b> <code>@Validated</code> with <code>@Min</code> or <code>@Pattern</code>.</li><li><b>Identifiers:</b> UUIDs avoid guessing and enumeration.</li></ul>`,
            r`@Validated
@RestController
public class InvoiceController {
    @GetMapping("/invoices/{id}")
    public String get(@PathVariable @Min(1) long id) { return "invoice " + id; }

    @GetMapping("/orders/{ref:[A-Z]{3}-\\d{4}}")
    public String order(@PathVariable String ref) { return "order " + ref; }
}

// OUTPUT:
// GET /invoices/0     -> 400
// GET /orders/ABC-1234 -> order ABC-1234
// GET /orders/abc      -> 404`],
        [`<p>Real-world: a document service identifies files by UUID and tests the controller slice, including the invalid UUID case.</p>`,
            r`@RestController
public class DocController {
    @GetMapping("/docs/{id}")
    public String doc(@PathVariable UUID id) { return "doc " + id; }
}

@WebMvcTest(DocController.class)
class DocControllerTest {
    @Autowired MockMvc mvc;

    @Test void invalid() throws Exception {
        mvc.perform(get("/docs/not-a-uuid")).andExpect(status().isBadRequest());
    }
}

// OUTPUT:
// GET /docs/0b8e...-uuid -> 200 doc 0b8e...
// GET /docs/not-a-uuid   -> 400`]
    )
};
