// Spring extras, batch smvc27 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc27Extras: Record<string, Extra> = {
    'mvc-parameter-based-content-negotiation': x(
        ['<b>Parameter-based negotiation</b> lets the client choose the response format with a query parameter such as <code>/users?format=json</code> instead of the <code>Accept</code> header.',
            '<b>Why use it</b>: a browser address bar or a plain link cannot set the <code>Accept</code> header, but it can add a query parameter.',
            '<b>Enable it</b> with <code>configurer.favorParameter(true)</code> in <code>configureContentNegotiation</code>; the default parameter name is <code>format</code>.'],
        ['<b>Mapping</b>: register values with <code>mediaType("json", MediaType.APPLICATION_JSON)</code> and <code>mediaType("xml", MediaType.APPLICATION_XML)</code>; an unknown value gives 406.',
            '<b>Parameter name</b> can be changed with <code>parameterName("type")</code>.',
            '<b>Precedence</b>: when the parameter strategy is on it is asked first, then the <code>Accept</code> header strategy.'],
        ['<b>Strategy class</b>: it is <code>ParameterContentNegotiationStrategy</code>, held inside <code>ContentNegotiationManager</code>.',
            '<b>Path extensions</b> like <code>/users.json</code> were removed in Spring Framework 6, so the parameter is the supported URL based option.',
            '<b>Caching</b>: different formats share one URL path, so make sure proxies cache by the full query string.'],
        [['F', 'What is parameter-based content negotiation?', 'The client picks the response format with a request parameter such as format=xml instead of the Accept header.'],
            ['F', 'What is the default parameter name?', 'It is format, and you can change it with parameterName.'],
            ['M', 'How do you enable it?', 'Override configureContentNegotiation in a WebMvcConfigurer and call favorParameter(true) plus mediaType mappings.'],
            ['M', 'What happens for an unknown format value?', 'No media type matches, so Spring answers 406 Not Acceptable.'],
            ['S', 'Which component resolves the parameter?', 'ParameterContentNegotiationStrategy inside ContentNegotiationManager, which the message converters selection uses.'],
            ['S', 'Why was the path extension strategy dropped?', 'It caused security problems (reflected file download) and ambiguity, so Spring 6 removed it.']],
        [['Enable the format parameter.',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer c) {
        c.favorParameter(true)
         .parameterName("format")
         .mediaType("json", MediaType.APPLICATION_JSON)
         .mediaType("xml", MediaType.APPLICATION_XML);
    }
}

// GET /users/1?format=xml
// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/xml
// <User><id>1</id><name>Abaji</name></User>`],
            ['Controller that serves both formats.',
                r`@RestController
class UserController {
    @GetMapping(value = "/users/{id}",
        produces = {"application/json", "application/xml"})
    User get(@PathVariable long id) {
        return new User(id, "Abaji");
    }
}

// GET /users/1?format=json
// OUTPUT:
// {"id":1,"name":"Abaji"}`]],
        [['Test the parameter with MockMvc.',
            r`@WebMvcTest(UserController.class)
class FormatTest {
    @Autowired MockMvc mvc;

    @Test
    void xmlByParameter() throws Exception {
        mvc.perform(get("/users/1").param("format", "xml"))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith("application/xml"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Unknown value gives 406.',
                r`mvc.perform(get("/users/1").param("format", "csv"))
   .andExpect(status().isNotAcceptable());

// GET /users/1?format=csv
// OUTPUT:
// HTTP/1.1 406 Not Acceptable`]]
    ),

    'mvc-header-based-content-negotiation': x(
        ['<b>Header-based negotiation</b> is the default: the client sends an <code>Accept</code> header and Spring picks the matching <code>HttpMessageConverter</code>.',
            '<b>Response</b>: the chosen type is written to the <code>Content-Type</code> header of the reply.',
            '<b>No match</b> means <code>406 Not Acceptable</code>; a wrong request body type means <code>415 Unsupported Media Type</code>.'],
        ['<b>produces</b> in <code>@GetMapping(produces = "application/json")</code> narrows which requests a method accepts based on <code>Accept</code>.',
            '<b>consumes</b> does the same for the request <code>Content-Type</code> header.',
            '<b>Quality values</b>: <code>Accept: application/xml;q=0.9, application/json</code> ranks types; the highest q wins.'],
        ['<b>Strategy class</b>: <code>HeaderContentNegotiationStrategy</code> reads the <code>Accept</code> header.',
            '<b>Vary header</b>: caches must key on <code>Accept</code>, so send <code>Vary: Accept</code> when one URL has several formats.',
            '<b>Spring Boot</b> adds Jackson for JSON and, if <code>jackson-dataformat-xml</code> is on the classpath, XML too.'],
        [['F', 'Which header drives default content negotiation?', 'The Accept request header.'],
            ['F', 'What status is returned when no format fits?', '406 Not Acceptable.'],
            ['M', 'Difference between produces and consumes?', 'produces matches the Accept header and sets the response type; consumes matches the request Content-Type.'],
            ['M', 'What does 415 mean?', 'The server cannot read the request body type sent in Content-Type.'],
            ['S', 'How does Spring choose among several Accept types?', 'ContentNegotiationManager resolves the ordered media types, then the first converter that can write the return type for one of them is used.'],
            ['S', 'Why add Vary: Accept?', 'So shared caches do not serve a JSON body to a client that asked for XML.']],
        [['Two formats from one method.',
            r`@GetMapping(value = "/books/{id}",
    produces = {MediaType.APPLICATION_JSON_VALUE,
                MediaType.APPLICATION_XML_VALUE})
Book get(@PathVariable long id) {
    return new Book(id, "Spring in Action");
}

// curl -H "Accept: application/xml" localhost:8080/books/1
// OUTPUT:
// <Book><id>1</id><title>Spring in Action</title></Book>`],
            ['Different method per type.',
                r`@GetMapping(value = "/books/{id}", produces = "application/json")
Book json(@PathVariable long id) { return service.find(id); }

@GetMapping(value = "/books/{id}", produces = "text/csv")
String csv(@PathVariable long id) {
    Book b = service.find(id);
    return b.id() + "," + b.title();
}

// curl -H "Accept: text/csv" localhost:8080/books/1
// OUTPUT:
// 1,Spring in Action`]],
        [['Test with the Accept header.',
            r`@Test
void jsonWhenAcceptJson() throws Exception {
    mvc.perform(get("/books/1").accept(MediaType.APPLICATION_JSON))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.title").value("Spring in Action"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['No acceptable type.',
                r`mvc.perform(get("/books/1").accept(MediaType.IMAGE_PNG))
   .andExpect(status().isNotAcceptable());

// OUTPUT:
// HTTP/1.1 406 Not Acceptable`]]
    ),

    'mvc-custom-content-negotiation': x(
        ['<b>Custom content negotiation</b> means you replace or extend how Spring decides the response media type, by writing your own <code>ContentNegotiationStrategy</code>.',
            '<b>Typical need</b>: choose the format from a custom header (for example <code>X-Api-Version</code>), a cookie, the host name or the user agent.',
            '<b>Register it</b> with <code>configurer.strategies(List.of(...))</code> in <code>configureContentNegotiation</code>.'],
        ['<b>Interface</b>: implement <code>resolveMediaTypes(NativeWebRequest)</code> and return a list of <code>MediaType</code>; return <code>MEDIA_TYPE_ALL_LIST</code> to mean "no opinion".',
            '<b>Vendor types</b> such as <code>application/vnd.shop.v2+json</code> are a common way to version an API through negotiation.',
            '<b>Custom converter</b>: for a brand-new format also add an <code>HttpMessageConverter</code> through <code>extendMessageConverters</code>.'],
        ['<b>Order</b>: strategies in <code>ContentNegotiationManager</code> run in list order and the first non-empty result wins.',
            '<b>Replacing defaults</b>: calling <code>strategies(...)</code> replaces the built-in header and parameter strategies, so add them back if you still need them.',
            '<b>Keep it cheap</b>: the strategy runs for every request that writes a body, so do no I/O in it.'],
        [['F', 'What is custom content negotiation?', 'Using your own rule, such as a custom header, to decide the response format.'],
            ['F', 'Which interface do you implement?', 'ContentNegotiationStrategy with its resolveMediaTypes method.'],
            ['M', 'How do you register the strategy?', 'Call strategies on ContentNegotiationConfigurer in a WebMvcConfigurer.'],
            ['M', 'What should the strategy return if it has no opinion?', 'MEDIA_TYPE_ALL_LIST so the next strategy can decide.'],
            ['S', 'What is a risk of calling strategies(...)?', 'It replaces the default strategies, so Accept header support disappears unless you add it again.'],
            ['S', 'How can negotiation version an API?', 'Use vendor media types like application/vnd.shop.v2+json and map them with produces.']],
        [['A header-driven strategy.',
            r`public class VersionStrategy implements ContentNegotiationStrategy {
    @Override
    public List<MediaType> resolveMediaTypes(NativeWebRequest req) {
        String v = req.getHeader("X-Api-Version");
        if ("2".equals(v)) {
            return List.of(MediaType.parseMediaType("application/vnd.shop.v2+json"));
        }
        return MEDIA_TYPE_ALL_LIST;      // no opinion
    }
}

// OUTPUT:
// (class compiles; used in the next example)`],
            ['Register it with the default header strategy as fallback.',
                r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.strategies(List.of(
        new VersionStrategy(),
        new HeaderContentNegotiationStrategy()));
}

@GetMapping(value = "/items/1", produces = "application/vnd.shop.v2+json")
ItemV2 v2() { return new ItemV2(1, "Pen", "stationery"); }

// curl -H "X-Api-Version: 2" localhost:8080/items/1
// OUTPUT:
// Content-Type: application/vnd.shop.v2+json
// {"id":1,"name":"Pen","category":"stationery"}`]],
        [['Test the custom header.',
            r`mvc.perform(get("/items/1").header("X-Api-Version", "2"))
   .andExpect(status().isOk())
   .andExpect(content().contentTypeCompatibleWith(
       "application/vnd.shop.v2+json"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Unit test the strategy alone.',
                r`NativeWebRequest req = new ServletWebRequest(
    new MockHttpServletRequest());
List<MediaType> types = new VersionStrategy().resolveMediaTypes(req);
System.out.println(types);

// OUTPUT:
// [*/*]`]]
    ),

    'mvc-what-is-cors': x(
        ['<b>CORS</b> (Cross-Origin Resource Sharing) is a browser mechanism where a server uses HTTP headers to say which other origins may read its responses.',
            '<b>Purpose</b>: browsers block JavaScript on <code>http://localhost:3000</code> from reading a response from <code>http://localhost:8080</code> unless the server allows it.',
            '<b>Server side</b>: Spring adds headers such as <code>Access-Control-Allow-Origin</code>; the browser, not the server, enforces the rule.'],
        ['<b>Not a security tool for the server</b>: tools like curl and Postman ignore CORS, so it never replaces authentication.',
            '<b>Spring options</b>: <code>@CrossOrigin</code>, a global <code>addCorsMappings</code>, or a <code>CorsFilter</code>.',
            '<b>Common error</b>: "has been blocked by CORS policy: No Access-Control-Allow-Origin header" in the browser console.'],
        ['<b>Processing</b>: <code>DispatcherServlet</code> asks the <code>HandlerMapping</code> for a <code>CorsConfiguration</code> and applies it through <code>DefaultCorsProcessor</code>.',
            '<b>Credentials</b>: with cookies, the origin cannot be <code>*</code>; list exact origins or patterns.',
            '<b>With Spring Security</b>: enable <code>http.cors(...)</code> so the CORS check runs before the security filters reject the request.'],
        [['F', 'What does CORS stand for?', 'Cross-Origin Resource Sharing.'],
            ['F', 'Who enforces CORS, the browser or the server?', 'The browser enforces it; the server only sends the headers.'],
            ['M', 'Does CORS protect my API from curl?', 'No, only browsers apply it, so you still need authentication.'],
            ['M', 'Name three ways to configure CORS in Spring.', '@CrossOrigin, WebMvcConfigurer.addCorsMappings and a CorsFilter bean.'],
            ['S', 'Why must CORS be set up in Spring Security too?', 'Security filters run before MVC, so a preflight without CORS config would be rejected with 401 or 403.'],
            ['S', 'Why can you not use * with credentials?', 'The spec forbids it; the server must echo a specific origin when cookies or auth headers are allowed.']],
        [['The failing call and its fix.',
            r`// Browser JavaScript on http://localhost:3000
// fetch("http://localhost:8080/api/hello")
// Console: blocked by CORS policy: No Access-Control-Allow-Origin header

@RestController
class HelloController {
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/api/hello")
    String hello() { return "hi"; }
}

// OUTPUT:
// Access-Control-Allow-Origin: http://localhost:3000
// body: hi`],
            ['Inspect headers with curl.',
                r`// curl -i -H "Origin: http://localhost:3000" localhost:8080/api/hello
// OUTPUT:
// HTTP/1.1 200
// Access-Control-Allow-Origin: http://localhost:3000
// Vary: Origin
// hi`]],
        [['Test a CORS header with MockMvc.',
            r`mvc.perform(get("/api/hello").header("Origin", "http://localhost:3000"))
   .andExpect(status().isOk())
   .andExpect(header().string("Access-Control-Allow-Origin",
       "http://localhost:3000"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['A disallowed origin.',
                r`mvc.perform(get("/api/hello").header("Origin", "http://evil.com"))
   .andExpect(status().isForbidden());

// OUTPUT:
// HTTP/1.1 403 Forbidden
// Invalid CORS request`]]
    ),

    'mvc-same-origin-policy': x(
        ['<b>Same-Origin Policy (SOP)</b> is a browser rule: a page may freely read data only from the same origin, meaning the same scheme, host and port.',
            '<b>Origin parts</b>: <code>https://shop.com:443</code> differs from <code>http://shop.com</code> (scheme), <code>https://api.shop.com</code> (host) and <code>https://shop.com:8443</code> (port).',
            '<b>Why it exists</b>: without it a malicious site could read your bank page using your logged-in cookies.'],
        ['<b>What is blocked</b>: reading cross-origin responses from <code>fetch</code> or <code>XMLHttpRequest</code>; sending the request itself is often still allowed.',
            '<b>What is allowed</b>: embedding images, scripts and stylesheets from other origins, and form posts.',
            '<b>CORS relaxes SOP</b>: the server opts in with <code>Access-Control-Allow-Origin</code>.'],
        ['<b>Simple requests still reach the server</b>, so SOP does not stop CSRF; use CSRF tokens and <code>SameSite</code> cookies.',
            '<b>Dev setup</b>: React on port 3000 and Spring on 8080 are different origins; use CORS config or a dev proxy.',
            '<b>Server code</b>: Spring does not enforce SOP; it only supplies the CORS headers the browser checks.'],
        [['F', 'What is an origin?', 'The combination of scheme, host and port.'],
            ['F', 'Are http://a.com and https://a.com the same origin?', 'No, the scheme differs.'],
            ['M', 'What does SOP block?', 'Scripts reading responses from a different origin.'],
            ['M', 'How does CORS relate to SOP?', 'CORS is the controlled way for a server to relax SOP for chosen origins.'],
            ['S', 'Does SOP prevent CSRF?', 'No, the request is still sent with cookies; you need CSRF tokens or SameSite cookies.'],
            ['S', 'How can you avoid CORS in development?', 'Use a dev-server proxy so the browser sees one origin, or configure CORS on Spring.']],
        [['Compare origins in code.',
            r`static boolean sameOrigin(URI a, URI b) {
    return a.getScheme().equals(b.getScheme())
        && a.getHost().equals(b.getHost())
        && port(a) == port(b);
}
static int port(URI u) {
    if (u.getPort() != -1) return u.getPort();
    return "https".equals(u.getScheme()) ? 443 : 80;
}
System.out.println(sameOrigin(URI.create("https://shop.com/a"),
                              URI.create("https://shop.com:443/b")));
System.out.println(sameOrigin(URI.create("http://shop.com"),
                              URI.create("https://shop.com")));

// OUTPUT:
// true
// false`],
            ['Spring sends the opt-in header.',
                r`@Configuration
class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://shop.com");
    }
}

// OUTPUT:
// Access-Control-Allow-Origin: https://shop.com`]],
        [['Same origin needs no CORS header.',
            r`mvc.perform(get("/api/hello"))      // no Origin header sent
   .andExpect(status().isOk())
   .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Dev proxy instead of CORS.',
                r`// package.json of the React app
// "proxy": "http://localhost:8080"
// fetch("/api/hello") now goes to port 3000 and is forwarded to 8080,
// so the browser sees one origin.

// OUTPUT:
// no CORS error in the console`]]
    ),

    'mvc-cross-origin-requests': x(
        ['<b>Cross-origin request</b> is a request from a page on one origin to a URL on another, for example React on <code>:3000</code> calling Spring on <code>:8080</code>.',
            '<b>Two kinds</b>: <b>simple</b> requests (GET, HEAD, POST with basic content types) go straight out; others trigger a <b>preflight</b> <code>OPTIONS</code> request first.',
            '<b>Headers</b>: the browser sends <code>Origin</code>; the server answers with <code>Access-Control-Allow-Origin</code> and related headers.'],
        ['<b>Non-simple</b> requests include <code>PUT</code>, <code>DELETE</code>, a JSON <code>Content-Type</code> and custom headers like <code>Authorization</code>.',
            '<b>Reading headers</b>: JavaScript sees only safe response headers unless <code>exposedHeaders</code> lists others.',
            '<b>Cookies</b>: <code>fetch</code> needs <code>credentials: "include"</code> and the server needs <code>allowCredentials(true)</code>.'],
        ['<b>Spring flow</b>: the handler mapping builds the CORS config, <code>DefaultCorsProcessor</code> validates the origin, method and headers and writes the response headers.',
            '<b>Rejected</b> requests get <code>403 Invalid CORS request</code> from Spring.',
            '<b>Vary</b>: Spring adds <code>Vary: Origin</code> so caches keep separate copies per origin.'],
        [['F', 'What makes a request cross-origin?', 'The target differs from the page in scheme, host or port.'],
            ['F', 'Which header carries the page origin?', 'The Origin request header.'],
            ['M', 'When does a preflight happen?', 'For non-simple requests such as PUT, DELETE, JSON bodies or custom headers.'],
            ['M', 'How do you send cookies cross-origin?', 'Use credentials include in fetch and allowCredentials true on the server with specific origins.'],
            ['S', 'What does Spring return for a disallowed origin?', '403 with the text Invalid CORS request, produced by DefaultCorsProcessor.'],
            ['S', 'Why is Vary: Origin important?', 'Responses differ by origin, so caches must not reuse one origin response for another.']],
        [['A cross-origin POST with JSON.',
            r`// Browser on http://localhost:3000
// fetch("http://localhost:8080/api/orders", {
//   method: "POST",
//   headers: {"Content-Type": "application/json"},
//   body: JSON.stringify({item: "pen"})
// })

@CrossOrigin(origins = "http://localhost:3000")
@PostMapping("/api/orders")
ResponseEntity<String> create(@RequestBody Order o) {
    return ResponseEntity.status(201).body("created " + o.item());
}

// OUTPUT:
// OPTIONS /api/orders -> 200 (preflight)
// POST /api/orders -> 201 created pen`],
            ['Expose a custom response header.',
                r`@CrossOrigin(origins = "http://localhost:3000",
              exposedHeaders = "X-Total-Count")
@GetMapping("/api/orders")
ResponseEntity<List<Order>> list() {
    return ResponseEntity.ok().header("X-Total-Count", "2").body(orders());
}

// OUTPUT:
// Access-Control-Expose-Headers: X-Total-Count
// X-Total-Count: 2`]],
        [['Simulate a cross-origin request.',
            r`mvc.perform(post("/api/orders")
        .header("Origin", "http://localhost:3000")
        .contentType("application/json")
        .content("{\"item\":\"pen\"}"))
   .andExpect(status().isCreated())
   .andExpect(header().exists("Access-Control-Allow-Origin"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Wrong origin is rejected.',
                r`mvc.perform(get("/api/orders").header("Origin", "http://evil.com"))
   .andExpect(status().isForbidden());

// OUTPUT:
// HTTP/1.1 403 Forbidden`]]
    ),

    'mvc-crossorigin': x(
        ['<b>@CrossOrigin</b> is an annotation that enables CORS for one controller method or a whole controller class.',
            '<b>Attributes</b>: <code>origins</code>, <code>methods</code>, <code>allowedHeaders</code>, <code>exposedHeaders</code>, <code>allowCredentials</code> and <code>maxAge</code>.',
            '<b>Default</b>: with no attributes it allows all origins (patterns) and the methods mapped on the handler, so name the origins you trust.'],
        ['<b>Class and method</b>: a class-level annotation applies to every method; method-level values are combined with it.',
            '<b>Pattern support</b>: <code>originPatterns = "https://*.shop.com"</code> allows subdomains and works with credentials.',
            '<b>maxAge</b> sets how many seconds the browser may cache the preflight answer (default 1800).'],
        ['<b>Processing</b>: <code>RequestMappingHandlerMapping</code> reads the annotation into a <code>CorsConfiguration</code> for that handler.',
            '<b>Scale</b>: repeating it on many controllers is error-prone; use the global configuration for shared rules.',
            '<b>Security</b>: with Spring Security you still need <code>http.cors(Customizer.withDefaults())</code>.'],
        [['F', 'What does @CrossOrigin do?', 'It allows cross-origin browser requests to a controller or one handler method.'],
            ['F', 'Where can you place it?', 'On a controller class or on a handler method.'],
            ['M', 'How do you allow only one origin?', 'Set origins to that value, for example origins = "http://localhost:3000".'],
            ['M', 'What is maxAge for?', 'It tells the browser how long to cache the preflight response.'],
            ['S', 'How are class and method level annotations combined?', 'Their values are merged; list attributes are added together and single values on the method override the class.'],
            ['S', 'Why prefer global config for large apps?', 'One place defines the rules, so no controller is accidentally left open or closed.']],
        [['Class-level and method-level.',
            r`@RestController
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RequestMapping("/api/products")
class ProductController {
    @GetMapping
    List<String> all() { return List.of("pen", "book"); }

    @CrossOrigin(origins = "https://admin.shop.com", methods = RequestMethod.DELETE)
    @DeleteMapping("/{id}")
    void delete(@PathVariable long id) { }
}

// OUTPUT:
// GET with Origin http://localhost:3000 -> Access-Control-Allow-Origin set
// DELETE allowed from both origins (values merged)`],
            ['Credentials with patterns.',
                r`@CrossOrigin(originPatterns = "https://*.shop.com",
              allowCredentials = "true")
@GetMapping("/api/me")
String me() { return "abaji"; }

// OUTPUT:
// Access-Control-Allow-Origin: https://app.shop.com
// Access-Control-Allow-Credentials: true`]],
        [['Test allowed origin.',
            r`@WebMvcTest(ProductController.class)
class ProductCorsTest {
    @Autowired MockMvc mvc;

    @Test
    void allowed() throws Exception {
        mvc.perform(get("/api/products")
                .header("Origin", "http://localhost:3000"))
           .andExpect(header().string("Access-Control-Allow-Origin",
               "http://localhost:3000"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Test blocked origin.',
                r`mvc.perform(get("/api/products").header("Origin", "http://evil.com"))
   .andExpect(status().isForbidden());

// OUTPUT:
// HTTP/1.1 403 Forbidden`]]
    ),

    'mvc-global-cors-configuration': x(
        ['<b>Global CORS configuration</b> defines CORS rules for many URL paths in one place by overriding <code>addCorsMappings</code> in a <code>WebMvcConfigurer</code>.',
            '<b>Example</b>: <code>registry.addMapping("/api/**").allowedOrigins("http://localhost:3000")</code>.',
            '<b>Benefit</b>: controllers stay clean and the rules are easy to audit and change per environment.'],
        ['<b>Options</b> on the registration: <code>allowedMethods</code>, <code>allowedHeaders</code>, <code>exposedHeaders</code>, <code>allowCredentials</code>, <code>maxAge</code>.',
            '<b>allowedOriginPatterns</b> supports wildcards like <code>https://*.shop.com</code> and is the right choice with credentials.',
            '<b>Per environment</b>: read allowed origins from a property so test and production differ.'],
        ['<b>Mechanics</b>: <code>CorsRegistry</code> builds path-pattern keyed <code>CorsConfiguration</code> objects used by <code>AbstractHandlerMapping</code>.',
            '<b>Merging</b>: global config is combined with any <code>@CrossOrigin</code> on the handler.',
            '<b>Security</b>: MVC config is not seen by Spring Security filters; add <code>http.cors()</code> so it reuses this configuration.'],
        [['F', 'How do you configure CORS globally?', 'Implement WebMvcConfigurer and override addCorsMappings.'],
            ['F', 'What does addMapping take?', 'A URL path pattern such as /api/**.'],
            ['M', 'allowedOrigins or allowedOriginPatterns?', 'Use allowedOriginPatterns when you need wildcards or credentials.'],
            ['M', 'How do you keep origins out of code?', 'Bind a property to a list and pass it to allowedOrigins.'],
            ['S', 'How does it interact with @CrossOrigin?', 'Both are merged into one CorsConfiguration for the handler.'],
            ['S', 'Why might CORS still fail with Spring Security?', 'Security filters run first, so the preflight needs http.cors() and a CorsConfigurationSource, or the request is rejected.']],
        [['Global rules.',
            r`@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

// OUTPUT:
// Access-Control-Allow-Origin: http://localhost:3000
// Access-Control-Allow-Credentials: true`],
            ['Origins from properties.',
                r`@Configuration
class CorsConfig implements WebMvcConfigurer {
    private final String[] origins;

    CorsConfig(@Value("$" + "{app.cors.origins}") String[] origins) {
        this.origins = origins;
    }

    @Override
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**").allowedOriginPatterns(origins);
    }
}

# application.properties
# app.cors.origins=https://app.shop.com,https://admin.shop.com
// OUTPUT:
// both origins are allowed for /api/**`]],
        [['Test with @WebMvcTest.',
            r`@WebMvcTest(ProductController.class)
@Import(CorsConfig.class)
class GlobalCorsTest {
    @Autowired MockMvc mvc;

    @Test
    void ok() throws Exception {
        mvc.perform(get("/api/products").header("Origin", "http://localhost:3000"))
           .andExpect(status().isOk())
           .andExpect(header().exists("Access-Control-Allow-Origin"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Path outside the mapping.',
                r`mvc.perform(get("/public/info").header("Origin", "http://localhost:3000"))
   .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-cors-filter-cors': x(
        ['<b>CorsFilter</b> is a servlet filter (<code>org.springframework.web.filter.CorsFilter</code>) that applies CORS rules before the request reaches the <code>DispatcherServlet</code>.',
            '<b>Build it</b> from a <code>CorsConfiguration</code> registered in a <code>UrlBasedCorsConfigurationSource</code> and expose it as a <code>@Bean</code>.',
            '<b>When to use</b>: when you need CORS to apply before other filters, or the app uses Spring Security without MVC-level config.'],
        ['<b>Order</b>: register with <code>FilterRegistrationBean</code> and a high precedence so it runs first.',
            '<b>Source</b>: <code>source.registerCorsConfiguration("/**", config)</code> maps path patterns to configurations.',
            '<b>Short circuit</b>: for a valid preflight it answers directly and does not call the rest of the chain.'],
        ['<b>Security</b>: with Spring Security a <code>CorsConfigurationSource</code> bean plus <code>http.cors(Customizer.withDefaults())</code> installs the same <code>CorsFilter</code> early.',
            '<b>Processor</b>: it delegates to <code>DefaultCorsProcessor</code>, the same class MVC uses.',
            '<b>Duplication</b>: avoid both a filter and MVC config with different rules; pick one source of truth.'],
        [['F', 'What is CorsFilter?', 'A servlet filter that applies CORS rules to incoming requests.'],
            ['F', 'What do you give it?', 'A CorsConfigurationSource such as UrlBasedCorsConfigurationSource.'],
            ['M', 'Why choose a filter over addCorsMappings?', 'It runs before other filters and works for non-MVC endpoints.'],
            ['M', 'How do you control its order?', 'Register it through FilterRegistrationBean and set the order.'],
            ['S', 'How does Spring Security use it?', 'http.cors() looks up a CorsConfigurationSource bean and adds a CorsFilter before authentication filters.'],
            ['S', 'What happens to a preflight request in the filter?', 'If valid, the filter writes the Access-Control headers and returns without continuing the chain.']],
        [['A CorsFilter bean.',
            r`@Bean
FilterRegistrationBean<CorsFilter> corsFilter() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of("http://localhost:3000"));
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    cfg.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/api/**", cfg);
    FilterRegistrationBean<CorsFilter> bean =
        new FilterRegistrationBean<>(new CorsFilter(src));
    bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
    return bean;
}

// OUTPUT:
// Access-Control-Allow-Origin: http://localhost:3000`],
            ['With Spring Security.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .authorizeHttpRequests(a -> a.anyRequest().authenticated());
    return http.build();
}

@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("http://localhost:3000"));
    c.setAllowedMethods(List.of("*"));
    c.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
}

// OUTPUT:
// preflight OPTIONS passes without a login`]],
        [['Test the filter with MockMvc.',
            r`@SpringBootTest
@AutoConfigureMockMvc
class CorsFilterTest {
    @Autowired MockMvc mvc;

    @Test
    void headerPresent() throws Exception {
        mvc.perform(get("/api/hello").header("Origin", "http://localhost:3000"))
           .andExpect(header().string("Access-Control-Allow-Origin",
               "http://localhost:3000"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Disallowed origin.',
                r`mvc.perform(get("/api/hello").header("Origin", "http://evil.com"))
   .andExpect(status().isForbidden());

// OUTPUT:
// HTTP/1.1 403 Forbidden`]]
    ),

    'mvc-preflight-request': x(
        ['<b>Preflight request</b> is an automatic <code>OPTIONS</code> request the browser sends before a non-simple cross-origin request, to ask the server for permission.',
            '<b>Headers sent</b>: <code>Origin</code>, <code>Access-Control-Request-Method</code> and <code>Access-Control-Request-Headers</code>.',
            '<b>Server reply</b>: <code>Access-Control-Allow-Origin</code>, <code>Access-Control-Allow-Methods</code>, <code>Access-Control-Allow-Headers</code> and <code>Access-Control-Max-Age</code>.'],
        ['<b>Triggers</b>: methods like <code>PUT</code> and <code>DELETE</code>, <code>Content-Type: application/json</code>, or custom headers such as <code>Authorization</code>.',
            '<b>Result</b>: if the answer allows the request, the browser sends the real call; otherwise it blocks it and logs a CORS error.',
            '<b>Caching</b>: <code>maxAge</code> lets the browser skip repeated preflights for that URL.'],
        ['<b>Spring handling</b>: <code>AbstractHandlerMapping</code> detects a preflight and returns a <code>PreflightHandler</code>, so your controller method is not called.',
            '<b>Security</b>: the preflight carries no credentials, so Spring Security must let it pass (use <code>http.cors()</code>).',
            '<b>Debug</b>: look at the OPTIONS call in the browser Network tab; a 401, 403 or missing header explains most failures.'],
        [['F', 'What is a preflight request?', 'An OPTIONS request the browser sends first to check whether the real cross-origin request is allowed.'],
            ['F', 'Does your controller method run for a preflight?', 'No, Spring answers it through a PreflightHandler.'],
            ['M', 'Which headers describe the planned request?', 'Access-Control-Request-Method and Access-Control-Request-Headers.'],
            ['M', 'How do you reduce preflight traffic?', 'Set maxAge so the browser caches the preflight result.'],
            ['S', 'Why do preflights fail with Spring Security?', 'OPTIONS has no credentials, so it gets 401 unless CORS is handled before authentication.'],
            ['S', 'Which request is never preflighted?', 'Simple requests: GET, HEAD or POST with a basic content type and no custom headers.']],
        [['What the browser sends and gets.',
            r`// OPTIONS /api/orders HTTP/1.1
// Origin: http://localhost:3000
// Access-Control-Request-Method: PUT
// Access-Control-Request-Headers: content-type

@Override
public void addCorsMappings(CorsRegistry r) {
    r.addMapping("/api/**")
     .allowedOrigins("http://localhost:3000")
     .allowedMethods("GET", "PUT")
     .allowedHeaders("content-type")
     .maxAge(3600);
}

// OUTPUT:
// HTTP/1.1 200
// Access-Control-Allow-Origin: http://localhost:3000
// Access-Control-Allow-Methods: GET,PUT
// Access-Control-Allow-Headers: content-type
// Access-Control-Max-Age: 3600`],
            ['Send a preflight with curl.',
                r`// curl -i -X OPTIONS localhost:8080/api/orders
//   -H "Origin: http://localhost:3000"
//   -H "Access-Control-Request-Method: PUT"
// OUTPUT:
// HTTP/1.1 200
// Vary: Origin, Access-Control-Request-Method
// Access-Control-Allow-Methods: GET,PUT`]],
        [['Test the preflight with MockMvc.',
            r`mvc.perform(options("/api/orders")
        .header("Origin", "http://localhost:3000")
        .header("Access-Control-Request-Method", "PUT"))
   .andExpect(status().isOk())
   .andExpect(header().string("Access-Control-Allow-Methods", "GET,PUT"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['A method that is not allowed.',
                r`mvc.perform(options("/api/orders")
        .header("Origin", "http://localhost:3000")
        .header("Access-Control-Request-Method", "DELETE"))
   .andExpect(status().isForbidden());

// OUTPUT:
// HTTP/1.1 403 Forbidden
// Invalid CORS request`]]
    )
};

export const smvc27Deep: Record<string, Deep> = {
    'mvc-parameter-based-content-negotiation': dv(
        [`<p>Spring resolves the response format through a <code>ContentNegotiationManager</code>.</p><ul><li><b>Strategies:</b> the manager holds an ordered list; <code>ParameterContentNegotiationStrategy</code> reads the request parameter and maps the value through a registered table.</li><li><b>Selection:</b> <code>AbstractMessageConverterMethodProcessor</code> asks for the requested types, intersects them with the <code>produces</code> types, then finds a converter that can write the return value.</li><li><b>Result:</b> the chosen type becomes the <code>Content-Type</code> of the response.</li></ul>`,
            r`ContentNegotiationManager m = new ContentNegotiationManager(
    new ParameterContentNegotiationStrategy(
        Map.of("json", MediaType.APPLICATION_JSON,
               "xml", MediaType.APPLICATION_XML)));
MockHttpServletRequest req = new MockHttpServletRequest();
req.setParameter("format", "xml");
System.out.println(m.resolveMediaTypes(new ServletWebRequest(req)));

// OUTPUT:
// [application/xml]`],
        [`<p>Variants and options:</p><ul><li><b>favorParameter:</b> turns the strategy on.</li><li><b>parameterName:</b> renames the parameter.</li><li><b>mediaType:</b> adds a key to type mapping.</li><li><b>defaultContentType:</b> used when nothing is requested.</li><li><b>ignoreAcceptHeader:</b> makes the parameter the only source.</li></ul>`,
            r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.favorParameter(true)
     .parameterName("type")
     .ignoreAcceptHeader(false)
     .defaultContentType(MediaType.APPLICATION_JSON)
     .mediaType("json", MediaType.APPLICATION_JSON)
     .mediaType("xml", MediaType.APPLICATION_XML);
}

// GET /users/1?type=xml
// OUTPUT:
// Content-Type: application/xml`],
        [`<p>Common mistakes:</p><ul><li><b>Forgot the mapping:</b> <code>?format=xml</code> returns 406 because no key was registered.</li><li><b>No XML converter:</b> add <code>jackson-dataformat-xml</code>, or the type has no writer.</li><li><b>Using path extensions:</b> <code>/users.json</code> no longer works in Spring 6.</li><li><b>Missing produces:</b> a method that only produces JSON cannot answer <code>?format=xml</code>.</li></ul>`,
            r`// WRONG: no mapping for xml, no xml converter on the classpath
// GET /users/1?format=xml  -> 406 Not Acceptable

// FIX 1: pom.xml
// <dependency>
//   <groupId>com.fasterxml.jackson.dataformat</groupId>
//   <artifactId>jackson-dataformat-xml</artifactId>
// </dependency>
// FIX 2: configurer.mediaType("xml", MediaType.APPLICATION_XML);

// OUTPUT:
// GET /users/1?format=xml -> 200 application/xml`],
        [`<p>Performance and tuning:</p><ul><li><b>Cost:</b> resolving is a map lookup, so it is negligible.</li><li><b>Caching:</b> use the full URL, including the query string, as the cache key, or the wrong format can be served.</li><li><b>Fewer formats:</b> expose only the formats you test and support.</li><li><b>Serialization:</b> XML is heavier than JSON, so keep it for clients that need it.</li></ul>`,
            r`@GetMapping(value = "/users/{id}", produces = {"application/json",
                                                 "application/xml"})
ResponseEntity<User> get(@PathVariable long id) {
    return ResponseEntity.ok()
        .header("Vary", "Accept")
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
        .body(service.find(id));
}

// OUTPUT:
// Cache-Control: max-age=300, public
// Vary: Accept`],
        [`<p>Scenario: a reporting API where analysts download data in a browser. A link with <code>?format=csv</code> is easier than setting headers, while API clients keep using <code>Accept</code>.</p><ul><li>Both strategies stay on, so each client style works.</li><li>A custom converter writes CSV.</li><li>Tests cover each format.</li></ul>`,
            r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.favorParameter(true)
     .mediaType("csv", new MediaType("text", "csv"))
     .mediaType("json", MediaType.APPLICATION_JSON);
}

@GetMapping(value = "/reports/sales", produces = {"application/json", "text/csv"})
List<Sale> sales() { return repo.findAll(); }

// GET /reports/sales?format=csv
// OUTPUT:
// Content-Type: text/csv
// id,amount
// 1,250.00`]
    ),

    'mvc-header-based-content-negotiation': dv(
        [`<p>How the Accept header is processed:</p><ul><li><b>Parse:</b> <code>HeaderContentNegotiationStrategy</code> reads <code>Accept</code> and sorts by quality.</li><li><b>Mapping match:</b> <code>produces</code> conditions filter handlers; ambiguity between handlers leads to the best match by specificity.</li><li><b>Write:</b> the first converter whose <code>canWrite</code> succeeds writes the body.</li><li><b>Failure:</b> no compatible type throws <code>HttpMediaTypeNotAcceptableException</code>, which becomes 406.</li></ul>`,
            r`NativeWebRequest req = new ServletWebRequest(
    new MockHttpServletRequest() {{
        addHeader("Accept", "application/xml;q=0.5, application/json");
    }});
System.out.println(
    new HeaderContentNegotiationStrategy().resolveMediaTypes(req));

// OUTPUT:
// [application/json, application/xml;q=0.5]`],
        [`<p>Syntax variants:</p><ul><li><b>produces array:</b> several types on one method.</li><li><b>Negation:</b> <code>produces = "!text/html"</code>.</li><li><b>Wildcards:</b> <code>application/*+json</code>.</li><li><b>Request side:</b> <code>consumes</code> for the body type.</li><li><b>ResponseEntity:</b> set <code>contentType(...)</code> yourself.</li></ul>`,
            r`@PostMapping(value = "/books", consumes = "application/json",
              produces = "application/json")
Book add(@RequestBody Book b) { return service.save(b); }

@GetMapping(value = "/books/{id}", produces = "application/*+json")
ResponseEntity<Book> get(@PathVariable long id) {
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("application/hal+json"))
        .body(service.find(id));
}

// OUTPUT:
// Content-Type: application/hal+json`],
        [`<p>Common mistakes:</p><ul><li><b>Confusing 406 and 415:</b> 406 is about the response type, 415 about the request body.</li><li><b>Browser default Accept:</b> browsers send <code>text/html,...,*/*</code>, so a JSON-only endpoint still answers.</li><li><b>No Vary header:</b> proxies may serve the wrong format.</li><li><b>Testing without accept:</b> MockMvc without <code>accept()</code> means <code>*/*</code>.</li></ul>`,
            r`// WRONG: client sends a JSON body but the header is missing
// curl -X POST localhost:8080/books -d '{"title":"x"}'
// OUTPUT: HTTP/1.1 415 Unsupported Media Type

// FIX
// curl -X POST localhost:8080/books -H "Content-Type: application/json"
//      -d '{"title":"x"}'
// OUTPUT: HTTP/1.1 200`],
        [`<p>Performance and tuning:</p><ul><li><b>Negotiation cost:</b> small; the main cost is serialization.</li><li><b>Fewer candidates:</b> an explicit <code>produces</code> avoids scanning all converters.</li><li><b>Caching:</b> use <code>Vary: Accept</code> with <code>Cache-Control</code>.</li><li><b>Compression:</b> enable <code>server.compression.enabled</code> for large JSON.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml
server.compression.min-response-size=1024

# OUTPUT:
# Content-Encoding: gzip for responses of 1 KB or more`],
        [`<p>Scenario: a public API serves a web app (JSON) and a legacy partner (XML) on the same URLs.</p><ul><li>Keep header negotiation as the one rule.</li><li>Document the supported <code>Accept</code> values.</li><li>Return 406 with a helpful body through <code>@ExceptionHandler</code>.</li></ul>`,
            r`@RestControllerAdvice
class NegotiationAdvice {
    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    ResponseEntity<String> notAcceptable() {
        return ResponseEntity.status(406)
            .contentType(MediaType.TEXT_PLAIN)
            .body("Supported: application/json, application/xml");
    }
}

// curl -H "Accept: image/png" localhost:8080/books/1
// OUTPUT:
// HTTP/1.1 406
// Supported: application/json, application/xml`]
    ),

    'mvc-custom-content-negotiation': dv(
        [`<p>The manager chains strategies.</p><ul><li><b>Loop:</b> <code>ContentNegotiationManager.resolveMediaTypes</code> asks each strategy in order and stops at the first result that is not <code>*/*</code>.</li><li><b>Resolvers:</b> optional <code>MediaTypeFileExtensionResolver</code> objects are used only to look up extensions.</li><li><b>Failure mode:</b> if no strategy has an opinion the result is <code>*/*</code> and the first usable converter wins.</li></ul>`,
            r`ContentNegotiationManager m = new ContentNegotiationManager(
    new VersionStrategy(), new HeaderContentNegotiationStrategy());
MockHttpServletRequest req = new MockHttpServletRequest();
req.addHeader("X-Api-Version", "2");
System.out.println(m.resolveMediaTypes(new ServletWebRequest(req)));

// OUTPUT:
// [application/vnd.shop.v2+json]`],
        [`<p>Other custom sources:</p><ul><li><b>Cookie or session:</b> a user preference.</li><li><b>Host name:</b> <code>xml.api.shop.com</code>.</li><li><b>User agent:</b> mobile clients get compact JSON.</li><li><b>Fixed strategy:</b> <code>FixedContentNegotiationStrategy</code> for a default.</li></ul>`,
            r`public class CookieStrategy implements ContentNegotiationStrategy {
    @Override
    public List<MediaType> resolveMediaTypes(NativeWebRequest req) {
        HttpServletRequest r = req.getNativeRequest(HttpServletRequest.class);
        if (r != null && r.getCookies() != null) {
            for (Cookie c : r.getCookies()) {
                if ("fmt".equals(c.getName()) && "xml".equals(c.getValue())) {
                    return List.of(MediaType.APPLICATION_XML);
                }
            }
        }
        return MEDIA_TYPE_ALL_LIST;
    }
}

// OUTPUT:
// Cookie fmt=xml -> [application/xml]; no cookie -> [*/*]`],
        [`<p>Common mistakes:</p><ul><li><b>Returning an empty list:</b> use <code>MEDIA_TYPE_ALL_LIST</code> for no opinion.</li><li><b>Dropping Accept support:</b> add <code>HeaderContentNegotiationStrategy</code> back.</li><li><b>No matching produces:</b> the vendor type must also appear in <code>produces</code>.</li><li><b>Throwing for unknown values:</b> throw <code>HttpMediaTypeNotAcceptableException</code> only when you truly cannot serve.</li></ul>`,
            r`// WRONG: returns an empty list and hides every later strategy
// return List.of();

// RIGHT
// return MEDIA_TYPE_ALL_LIST;

// OUTPUT:
// the Accept header strategy is still consulted after this one`],
        [`<p>Performance and tuning:</p><ul><li><b>No I/O:</b> read request data only, never call a database.</li><li><b>Stateless:</b> make the strategy a thread-safe singleton.</li><li><b>Parse once:</b> pre-build the <code>MediaType</code> constants instead of parsing each request.</li></ul>`,
            r`public class VersionStrategy implements ContentNegotiationStrategy {
    private static final MediaType V2 =
        MediaType.parseMediaType("application/vnd.shop.v2+json");
    private static final List<MediaType> V2_LIST = List.of(V2);

    @Override
    public List<MediaType> resolveMediaTypes(NativeWebRequest req) {
        return "2".equals(req.getHeader("X-Api-Version"))
            ? V2_LIST : MEDIA_TYPE_ALL_LIST;
    }
}

// OUTPUT:
// no allocation per request`],
        [`<p>Scenario: a mobile app and a web app share an API; the mobile app sends <code>X-Api-Version: 2</code> and receives the new response shape while old clients keep v1.</p><ul><li>Two handlers with different <code>produces</code>.</li><li>One strategy chooses between them.</li><li>Tests pin both versions.</li></ul>`,
            r`@GetMapping(value = "/items/{id}", produces = "application/json")
ItemV1 v1(@PathVariable long id) { return mapper.v1(id); }

@GetMapping(value = "/items/{id}", produces = "application/vnd.shop.v2+json")
ItemV2 v2(@PathVariable long id) { return mapper.v2(id); }

// curl localhost:8080/items/1
// OUTPUT: {"id":1,"name":"Pen"}
// curl -H "X-Api-Version: 2" localhost:8080/items/1
// OUTPUT: {"id":1,"name":"Pen","category":"stationery"}`]
    ),

    'mvc-what-is-cors': dv(
        [`<p>How a CORS check works end to end:</p><ul><li><b>Browser:</b> adds <code>Origin</code> to the cross-origin request.</li><li><b>Spring:</b> the handler mapping builds a <code>CorsConfiguration</code>; <code>DefaultCorsProcessor.processRequest</code> compares origin, method and headers.</li><li><b>Allowed:</b> response headers are added and the request continues.</li><li><b>Rejected:</b> status 403 with the text Invalid CORS request.</li><li><b>Browser again:</b> compares the response headers and either shows the data to the script or hides it.</li></ul>`,
            r`CorsConfiguration cfg = new CorsConfiguration();
cfg.setAllowedOrigins(List.of("http://localhost:3000"));
cfg.setAllowedMethods(List.of("GET"));
System.out.println(cfg.checkOrigin("http://localhost:3000"));
System.out.println(cfg.checkOrigin("http://evil.com"));
System.out.println(cfg.checkHttpMethod(HttpMethod.POST));

// OUTPUT:
// http://localhost:3000
// null
// null`],
        [`<p>Response headers at a glance:</p><ul><li><b>Allow-Origin:</b> which origin may read.</li><li><b>Allow-Methods and Allow-Headers:</b> what the real request may use.</li><li><b>Allow-Credentials:</b> permits cookies.</li><li><b>Expose-Headers:</b> extra headers JavaScript can read.</li><li><b>Max-Age:</b> preflight cache time.</li></ul>`,
            r`CorsConfiguration c = new CorsConfiguration();
c.setAllowedOriginPatterns(List.of("https://*.shop.com"));
c.setAllowedMethods(List.of("GET", "POST"));
c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
c.setExposedHeaders(List.of("X-Total-Count"));
c.setAllowCredentials(true);
c.setMaxAge(3600L);

// OUTPUT:
// Access-Control-Allow-Origin: https://app.shop.com
// Access-Control-Allow-Credentials: true
// Access-Control-Expose-Headers: X-Total-Count`],
        [`<p>Common mistakes:</p><ul><li><b>Wildcard with credentials:</b> <code>*</code> and <code>allowCredentials(true)</code> together throw an exception; use patterns.</li><li><b>Trailing slash in origin:</b> <code>http://localhost:3000/</code> never matches.</li><li><b>Fixing it in the browser:</b> the fix is always on the server.</li><li><b>Treating CORS as security:</b> it only protects browser users.</li></ul>`,
            r`// WRONG: IllegalArgumentException at startup
// registry.addMapping("/api/**")
//         .allowedOrigins("*").allowCredentials(true);

// RIGHT
// registry.addMapping("/api/**")
//         .allowedOriginPatterns("*").allowCredentials(true);

// OUTPUT:
// application starts; the request origin is echoed in Allow-Origin`],
        [`<p>Performance and tuning:</p><ul><li><b>maxAge:</b> a larger value means fewer preflights.</li><li><b>Narrow mappings:</b> apply rules only to <code>/api/**</code>.</li><li><b>Same origin:</b> serving the UI and API from one origin removes CORS cost entirely.</li></ul>`,
            r`registry.addMapping("/api/**")
        .allowedOrigins("https://app.shop.com")
        .maxAge(86400);      // some browsers cap this value

// OUTPUT:
// Access-Control-Max-Age: 86400 (browser may use a lower limit)`],
        [`<p>Scenario: a React single-page app on <code>localhost:3000</code> calls a Spring Boot API. The team starts with a global mapping for the dev origin and moves the production origin into a property.</p><ul><li>Dev: allow the local origin.</li><li>Prod: allow only the real domain.</li><li>Tests assert the headers.</li></ul>`,
            r`# application-dev.properties
app.cors.origins=http://localhost:3000
# application-prod.properties
app.cors.origins=https://app.shop.com

// OUTPUT:
// dev profile -> localhost allowed; prod profile -> only app.shop.com`]
    ),

    'mvc-same-origin-policy': dv(
        [`<p>SOP is implemented inside the browser.</p><ul><li><b>Origin tuple:</b> scheme, host, port.</li><li><b>Reads blocked:</b> script access to cross-origin responses, DOM of other-origin frames and their storage.</li><li><b>Writes allowed:</b> links, form submits and image loads can still send requests.</li><li><b>Spring role:</b> none; Spring only provides CORS headers as the opt-in.</li></ul>`,
            r`URI page = URI.create("https://shop.com/index.html");
URI api1 = URI.create("https://shop.com/api/items");
URI api2 = URI.create("https://api.shop.com/items");
System.out.println(page.getHost().equals(api1.getHost()));
System.out.println(page.getHost().equals(api2.getHost()));

// OUTPUT:
// true
// false`],
        [`<p>Ways around SOP, safest first:</p><ul><li><b>Same origin:</b> serve the SPA from Spring static resources.</li><li><b>Reverse proxy:</b> one host routes <code>/</code> and <code>/api</code>.</li><li><b>CORS:</b> explicit server opt-in.</li><li><b>JSONP:</b> legacy and unsafe; avoid.</li></ul>`,
            r`# nginx.conf (reverse proxy: one origin for the browser)
# location /     { proxy_pass http://frontend:3000; }
# location /api/ { proxy_pass http://backend:8080; }

# OUTPUT:
# browser sees only https://shop.com, so no CORS headers are needed`],
        [`<p>Common mistakes:</p><ul><li><b>Disabling it with a browser flag:</b> hides the problem only on your machine.</li><li><b>Allow-Origin * for private data:</b> any site can read public responses; combine with auth carefully.</li><li><b>Trusting the Origin header:</b> only browsers send it honestly; non-browser clients can fake it.</li><li><b>Port confusion:</b> <code>localhost:3000</code> and <code>localhost:8080</code> are different origins.</li></ul>`,
            r`// WRONG: reflect any origin with credentials
// config.setAllowedOriginPatterns(List.of("*"));
// config.setAllowCredentials(true);

// RIGHT: an explicit list
// config.setAllowedOrigins(List.of("https://app.shop.com"));

// OUTPUT:
// only the listed origin may read credentialed responses`],
        [`<p>Performance angle:</p><ul><li><b>Same origin saves preflights</b>, so it is the fastest option.</li><li><b>Proxy:</b> adds one hop but removes preflight round trips.</li><li><b>Static hosting:</b> bundle the SPA in <code>src/main/resources/static</code> for small apps.</li></ul>`,
            r`# application.properties
spring.web.resources.static-locations=classpath:/static/
spring.web.resources.cache.cachecontrol.max-age=1d

# OUTPUT:
# GET /index.html and GET /api/items share one origin: no preflight`],
        [`<p>Scenario: a developer sees a CORS error from <code>localhost:3000</code> and wants to find the cause.</p><ul><li>Compare scheme, host, port.</li><li>Check the Network tab for the OPTIONS call.</li><li>Add a mapping for the origin on the server.</li></ul>`,
            r`// Console: Origin http://localhost:3000 is not allowed by CORS policy
// Fix on the server:
registry.addMapping("/api/**").allowedOrigins("http://localhost:3000");

// OUTPUT:
// Access-Control-Allow-Origin: http://localhost:3000`]
    ),

    'mvc-cross-origin-requests': dv(
        [`<p>Request classification and handling:</p><ul><li><b>Detect:</b> <code>CorsUtils.isCorsRequest</code> checks for an <code>Origin</code> that differs from the host.</li><li><b>Preflight check:</b> <code>CorsUtils.isPreFlightRequest</code> checks for OPTIONS plus <code>Access-Control-Request-Method</code>.</li><li><b>Apply:</b> <code>DefaultCorsProcessor</code> adds headers for an actual request and answers a preflight directly.</li></ul>`,
            r`MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/x");
req.setServerName("localhost");
req.addHeader("Origin", "http://other.com");
System.out.println(CorsUtils.isCorsRequest(req));
System.out.println(CorsUtils.isPreFlightRequest(req));

// OUTPUT:
// true
// false`],
        [`<p>Client-side options (fetch):</p><ul><li><b>mode:</b> <code>cors</code> is the default for cross-origin.</li><li><b>credentials:</b> <code>include</code> sends cookies.</li><li><b>no-cors:</b> returns an opaque response you cannot read.</li></ul>`,
            r`// JavaScript
// fetch("https://api.shop.com/me", {credentials: "include"})
//   .then(r => r.json());

// Spring side
registry.addMapping("/me")
        .allowedOrigins("https://app.shop.com")
        .allowCredentials(true);

// OUTPUT:
// Access-Control-Allow-Origin: https://app.shop.com
// Access-Control-Allow-Credentials: true`],
        [`<p>Common mistakes:</p><ul><li><b>Missing allowedHeaders:</b> the Authorization header triggers a failed preflight.</li><li><b>Hidden response header:</b> forgot <code>exposedHeaders</code>.</li><li><b>Redirects:</b> a redirect on the preflight URL fails the check.</li><li><b>Error responses without CORS headers:</b> the browser then reports a CORS error instead of the real 500.</li></ul>`,
            r`// WRONG: Authorization header not allowed
// .allowedHeaders("Content-Type")
// Console: Request header field authorization is not allowed

// RIGHT
// .allowedHeaders("Content-Type", "Authorization")

// OUTPUT:
// preflight passes and the real request is sent`],
        [`<p>Performance and tuning:</p><ul><li><b>Avoid preflights:</b> use simple requests where possible.</li><li><b>Cache preflights:</b> <code>maxAge</code>.</li><li><b>Batch calls:</b> fewer cross-origin calls mean fewer round trips.</li></ul>`,
            r`registry.addMapping("/api/**")
        .allowedOrigins("https://app.shop.com")
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .maxAge(7200);

// OUTPUT:
// one preflight per URL every two hours instead of one per call`],
        [`<p>Scenario: an order form on <code>app.shop.com</code> posts JSON to <code>api.shop.com</code>.</p><ul><li>The browser sends a preflight.</li><li>Spring approves it.</li><li>The POST runs with the order data.</li></ul>`,
            r`// 1) OPTIONS /orders  Origin: https://app.shop.com
//    -> 200, Allow-Methods: POST, Allow-Headers: content-type
// 2) POST /orders  Content-Type: application/json
//    -> 201 Created

// OUTPUT:
// order created; browser console shows no CORS error`]
    ),

    'mvc-crossorigin': dv(
        [`<p>How the annotation becomes a rule:</p><ul><li><b>Scan:</b> <code>RequestMappingHandlerMapping.initCorsConfiguration</code> reads <code>@CrossOrigin</code> from class and method.</li><li><b>Merge:</b> <code>CorsConfiguration.combine</code> joins the class and method values.</li><li><b>Apply:</b> the combined config is attached to the handler and processed by <code>DefaultCorsProcessor</code>.</li><li><b>Defaults:</b> origin patterns <code>*</code>, mapped methods, all headers, maxAge 1800 seconds; credentials are off.</li></ul>`,
            r`CorsConfiguration a = new CorsConfiguration();
a.setAllowedOrigins(List.of("http://a.com"));
CorsConfiguration b = new CorsConfiguration();
b.setAllowedOrigins(List.of("http://b.com"));
System.out.println(a.combine(b).getAllowedOrigins());

// OUTPUT:
// [http://a.com, http://b.com]`],
        [`<p>Attribute reference:</p><ul><li><b>origins and originPatterns</b>: who may call.</li><li><b>methods</b>: allowed HTTP methods.</li><li><b>allowedHeaders and exposedHeaders</b>: request and response headers.</li><li><b>allowCredentials</b>: a string value <code>"true"</code> or <code>"false"</code>.</li><li><b>maxAge</b>: preflight cache seconds.</li></ul>`,
            r`@CrossOrigin(
    origins = {"https://app.shop.com", "https://admin.shop.com"},
    methods = {RequestMethod.GET, RequestMethod.POST},
    allowedHeaders = {"Content-Type", "Authorization"},
    exposedHeaders = "X-Total-Count",
    allowCredentials = "true",
    maxAge = 3600)
@GetMapping("/api/data")
List<String> data() { return List.of("a"); }

// OUTPUT:
// Access-Control-Allow-Origin: https://app.shop.com
// Access-Control-Allow-Credentials: true`],
        [`<p>Common mistakes:</p><ul><li><b>Wide open default:</b> a bare <code>@CrossOrigin</code> allows every origin; always list origins.</li><li><b>Credentials with origins star:</b> use <code>originPatterns</code>.</li><li><b>Only on the GET method:</b> the DELETE method in the same controller stays blocked.</li><li><b>Spring Security 401 on OPTIONS:</b> the annotation alone is not enough.</li></ul>`,
            r`// WRONG: DELETE has no CORS config, the browser blocks it
@CrossOrigin("http://localhost:3000")
@GetMapping("/api/p")  List<P> list() { return repo.findAll(); }
@DeleteMapping("/api/p/{id}") void del(@PathVariable long id) { }

// FIX: move the annotation to the class
// OUTPUT:
// DELETE preflight now returns 200`],
        [`<p>Performance and tuning:</p><ul><li>The annotation is read once at startup, so it costs nothing per request.</li><li>Use <code>maxAge</code> to cut preflight traffic.</li><li>Prefer the global config when many controllers share the same rules.</li></ul>`,
            r`@CrossOrigin(origins = "https://app.shop.com", maxAge = 86400)
@RestController
class CatalogController { }

// OUTPUT:
// Access-Control-Max-Age: 86400`],
        [`<p>Scenario: a small internal tool has one controller used by a single front end. A class-level annotation with the exact origin is simple and clear.</p><ul><li>One origin from a property.</li><li>Credentials allowed.</li><li>Test for allowed and blocked origins.</li></ul>`,
            r`@RestController
@CrossOrigin(origins = "https://tool.company.com", allowCredentials = "true")
@RequestMapping("/api/tickets")
class TicketController {
    @GetMapping List<String> list() { return List.of("T-1"); }
}

// OUTPUT:
// GET /api/tickets with Origin https://tool.company.com -> 200 with headers`]
    ),

    'mvc-global-cors-configuration': dv(
        [`<p>Registry internals:</p><ul><li><b>Registry:</b> <code>CorsRegistry.addMapping</code> returns a <code>CorsRegistration</code> holding a <code>CorsConfiguration</code> with defaults applied.</li><li><b>Map:</b> path pattern to config, handed to <code>HandlerMapping</code> through <code>setCorsConfigurations</code>.</li><li><b>Match:</b> at request time the best matching pattern is combined with any handler-level <code>@CrossOrigin</code>.</li></ul>`,
            r`CorsRegistry registry = new CorsRegistry();
registry.addMapping("/api/**").allowedOrigins("https://a.com");
Map<String, CorsConfiguration> m = registry.getCorsConfigurations();
System.out.println(m.keySet());
System.out.println(m.get("/api/**").getAllowedOrigins());

// OUTPUT:
// [/api/**]
// [https://a.com]`],
        [`<p>Variants:</p><ul><li><b>Several mappings:</b> different rules per path.</li><li><b>Boot property style:</b> none; CORS is configured in code.</li><li><b>Spring Security:</b> <code>CorsConfigurationSource</code> bean.</li><li><b>WebFlux:</b> <code>CorsWebFilter</code> is the reactive equivalent.</li></ul>`,
            r`@Override
public void addCorsMappings(CorsRegistry r) {
    r.addMapping("/public/**").allowedOrigins("*").allowedMethods("GET");
    r.addMapping("/api/**")
     .allowedOriginPatterns("https://*.shop.com")
     .allowedMethods("*")
     .allowCredentials(true);
}

// OUTPUT:
// /public/** open for GET; /api/** limited to shop.com subdomains`],
        [`<p>Common mistakes:</p><ul><li><b>Pattern too narrow:</b> <code>/api/*</code> misses nested paths; use <code>/api/**</code>.</li><li><b>@WebMvcTest without the config:</b> import the class.</li><li><b>Forgetting Security:</b> add <code>http.cors()</code>.</li><li><b>Two sources:</b> a filter and a mapping with different rules confuse debugging.</li></ul>`,
            r`// WRONG: nested path /api/v1/users is not matched by /api/*
// registry.addMapping("/api/*");

// RIGHT
// registry.addMapping("/api/**");

// OUTPUT:
// /api/v1/users now returns the CORS headers`],
        [`<p>Performance and tuning:</p><ul><li>Lookup is a path match on each request, which is cheap.</li><li>Set <code>maxAge</code> high to cut preflights.</li><li>Keep the list of origins short and exact.</li></ul>`,
            r`registry.addMapping("/api/**")
        .allowedOrigins("https://app.shop.com")
        .allowedMethods("GET", "POST")
        .maxAge(86400);

// OUTPUT:
// Access-Control-Max-Age: 86400`],
        [`<p>Scenario: dev, test and prod each allow different origins.</p><ul><li>Origins come from a profile property.</li><li>One config class serves all environments.</li><li>A test checks the dev setting.</li></ul>`,
            r`@ConfigurationProperties(prefix = "app.cors")
record CorsProps(List<String> origins) { }

@Configuration
@EnableConfigurationProperties(CorsProps.class)
class CorsConfig implements WebMvcConfigurer {
    private final CorsProps props;
    CorsConfig(CorsProps props) { this.props = props; }

    @Override
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**")
         .allowedOrigins(props.origins().toArray(String[]::new));
    }
}

// OUTPUT:
// app.cors.origins from the active profile decides who may call`]
    ),

    'mvc-cors-filter-cors': dv(
        [`<p>Filter internals:</p><ul><li><b>Class:</b> <code>CorsFilter</code> extends <code>OncePerRequestFilter</code>.</li><li><b>Flow:</b> look up the config from the source, call <code>processor.processRequest</code>, and if it returns false stop; for a preflight stop as well.</li><li><b>Otherwise:</b> continue with <code>filterChain.doFilter</code>.</li><li><b>Spring MVC:</b> <code>DefaultCorsProcessor</code> is shared, so the headers match the annotation approach.</li></ul>`,
            r`UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
CorsConfiguration c = new CorsConfiguration();
c.addAllowedOrigin("http://localhost:3000");
c.addAllowedMethod("GET");
src.registerCorsConfiguration("/api/**", c);
MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/x");
req.addHeader("Origin", "http://localhost:3000");
System.out.println(src.getCorsConfiguration(req).getAllowedOrigins());

// OUTPUT:
// [http://localhost:3000]`],
        [`<p>Registration options:</p><ul><li><b>FilterRegistrationBean:</b> control order and URL patterns.</li><li><b>Plain @Bean CorsFilter:</b> Boot registers it for all paths.</li><li><b>Spring Security:</b> <code>http.cors()</code> with a <code>CorsConfigurationSource</code> bean.</li></ul>`,
            r`@Bean
CorsFilter corsFilter() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOriginPatterns(List.of("https://*.shop.com"));
    c.setAllowedMethods(List.of("*"));
    c.setAllowedHeaders(List.of("*"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return new CorsFilter(s);
}

// OUTPUT:
// the filter handles CORS for every path, before the servlet`],
        [`<p>Common mistakes:</p><ul><li><b>Low filter order:</b> a security filter runs first and rejects the preflight.</li><li><b>Duplicate headers:</b> a filter plus MVC config can add the same header twice; keep one.</li><li><b>Wildcard with credentials:</b> use patterns.</li><li><b>Path pattern:</b> <code>/api/*</code> instead of <code>/api/**</code>.</li></ul>`,
            r`// WRONG: preflight returns 401 from Spring Security
// OPTIONS /api/orders -> 401 Unauthorized

// FIX
// http.cors(Customizer.withDefaults());
// (and define a CorsConfigurationSource bean)

// OUTPUT:
// OPTIONS /api/orders -> 200`],
        [`<p>Performance and tuning:</p><ul><li>The filter runs on every request, but the lookup is a cheap path match.</li><li>A valid preflight ends in the filter and never reaches MVC.</li><li>Restrict the path pattern to <code>/api/**</code>.</li></ul>`,
            r`src.registerCorsConfiguration("/api/**", cfg);   // not "/**"

// OUTPUT:
// static pages skip the CORS check`],
        [`<p>Scenario: a gateway service uses Spring Security with JWT. The front end on another origin sends an <code>Authorization</code> header, so every call is preflighted.</p><ul><li>CORS source bean allows the header.</li><li><code>http.cors()</code> runs before the JWT filter.</li><li>The preflight passes without a token.</li></ul>`,
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    return http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .build();
}

// OUTPUT:
// OPTIONS -> 200 without token; GET with Bearer token -> 200`]
    ),

    'mvc-preflight-request': dv(
        [`<p>How Spring answers a preflight:</p><ul><li><b>Detect:</b> <code>CorsUtils.isPreFlightRequest</code> is true for OPTIONS with <code>Origin</code> and <code>Access-Control-Request-Method</code>.</li><li><b>Map:</b> <code>AbstractHandlerMapping.getHandler</code> swaps the handler for a <code>PreFlightHandler</code> built from the CORS config.</li><li><b>Reply:</b> <code>DefaultCorsProcessor</code> writes the Allow headers with status 200, or 403 if the request is not allowed.</li><li><b>Controller:</b> never invoked, and handler interceptors still run.</li></ul>`,
            r`MockHttpServletRequest req = new MockHttpServletRequest("OPTIONS", "/api/x");
req.addHeader("Origin", "http://localhost:3000");
req.addHeader("Access-Control-Request-Method", "PUT");
System.out.println(CorsUtils.isPreFlightRequest(req));

// OUTPUT:
// true`],
        [`<p>Preflight related settings:</p><ul><li><b>allowedMethods and allowedHeaders:</b> must cover the planned request.</li><li><b>maxAge:</b> caching of the answer.</li><li><b>allowPrivateNetwork:</b> for private network access, set with care.</li><li><b>Spring Security:</b> permit OPTIONS only through CORS handling, not blanket permit.</li></ul>`,
            r`CorsConfiguration c = new CorsConfiguration();
c.setAllowedOrigins(List.of("http://localhost:3000"));
c.setAllowedMethods(List.of("GET", "PUT", "DELETE"));
c.setAllowedHeaders(List.of("Content-Type", "Authorization"));
c.setMaxAge(Duration.ofHours(1));

// OUTPUT:
// Access-Control-Max-Age: 3600`],
        [`<p>Common mistakes:</p><ul><li><b>401 or 403 on OPTIONS:</b> authentication runs before CORS.</li><li><b>Header list mismatch:</b> the planned headers are not allowed.</li><li><b>Custom OPTIONS controller:</b> hand-written handlers often miss headers; let Spring do it.</li><li><b>Redirect on OPTIONS:</b> browsers reject redirected preflights.</li></ul>`,
            r`// WRONG: manual OPTIONS mapping that returns no CORS headers
// @RequestMapping(method = RequestMethod.OPTIONS)
// ResponseEntity<Void> opt() { return ResponseEntity.ok().build(); }

// RIGHT: remove it and configure CORS
// registry.addMapping("/api/**").allowedMethods("*");

// OUTPUT:
// preflight returns Allow-Methods and Allow-Origin headers`],
        [`<p>Performance and tuning:</p><ul><li>Every non-simple call can cost an extra round trip.</li><li>A <code>maxAge</code> such as 3600 or more removes most of them.</li><li>Reduce custom headers and prefer simple content types when possible.</li><li>Browsers cap the cache (for example, Chromium limits it to a few hours).</li></ul>`,
            r`registry.addMapping("/api/**")
        .allowedOrigins("https://app.shop.com")
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .maxAge(7200);

// OUTPUT:
// first PUT: OPTIONS + PUT; later PUTs within 2 hours: only PUT`],
        [`<p>Scenario: a front end shows a CORS error on a DELETE call, but the server logs show no controller call.</p><ul><li>Open the Network tab and find the OPTIONS request.</li><li>Check status and the Allow-Methods header.</li><li>Add <code>DELETE</code> to the allowed methods.</li></ul>`,
            r`// Before: OPTIONS /api/p/7 -> 403 Invalid CORS request
registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:3000")
        .allowedMethods("GET", "POST", "DELETE");
// After:
// OUTPUT:
// OPTIONS /api/p/7 -> 200, Allow-Methods: GET,POST,DELETE
// DELETE /api/p/7 -> 204`]
    )
};
