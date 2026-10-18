// Spring extras, batch smvc44 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc44Extras: Record<string, Extra> = {
    'mvc-controlleradvice-vs-exceptionhandler': x(
        ['<b>@ExceptionHandler</b> is a method annotation that handles exceptions thrown by handler methods; inside a controller it only covers that controller.',
            '<b>@ControllerAdvice</b> is a class-level annotation that shares <code>@ExceptionHandler</code>, <code>@InitBinder</code> and <code>@ModelAttribute</code> methods with all (or selected) controllers.',
            '<b>@RestControllerAdvice</b> is <code>@ControllerAdvice</code> plus <code>@ResponseBody</code>, so handler results are written as JSON.'],
        ['<b>Scope narrowing</b>: <code>@ControllerAdvice(basePackages = ...)</code>, <code>assignableTypes</code> or <code>annotations</code> limit which controllers the advice applies to.',
            '<b>Precedence</b>: a local <code>@ExceptionHandler</code> in the controller wins over an advice handler; the closest exception type match wins inside one class.',
            '<b>Ordering</b>: several advice beans are ordered with <code>@Order</code>; the first one that has a matching handler is used.'],
        ['<b>Resolver chain</b>: <code>ExceptionHandlerExceptionResolver</code> looks first in the controller, then in the advice beans found by <code>ExceptionHandlerMethodResolver</code>.',
            '<b>Error contract</b>: return <code>ProblemDetail</code> (RFC 7807) from one advice so every endpoint fails in the same shape.',
            '<b>Catch-all</b>: a handler for <code>Exception</code> must never leak stack traces; log it and return a generic 500 body.'],
        [['F', 'What does @ExceptionHandler do?', 'It marks a method that handles a given exception type thrown by a controller method and builds the response.'],
            ['F', 'Why use @ControllerAdvice?', 'To put exception handling in one place for all controllers instead of repeating it in each.'],
            ['M', 'Local handler or advice: which wins?', 'The handler inside the controller is tried first; the advice is used only if the controller has no matching handler.'],
            ['M', 'How do you limit an advice to some controllers?', 'Use basePackages, assignableTypes or annotations on @ControllerAdvice.'],
            ['S', 'How are two matching handlers in one advice resolved?', 'The handler whose declared exception is closest in the class hierarchy is chosen.'],
            ['S', 'Which resolver runs these methods?', 'ExceptionHandlerExceptionResolver, which is part of the HandlerExceptionResolver chain in DispatcherServlet.']],
        [['Local handler in one controller.',
            r`@RestController
class OrderController {
    @GetMapping("/orders/{id}")
    Order get(@PathVariable long id) {
        throw new IllegalArgumentException("bad id " + id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<String> bad(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}

// OUTPUT:
// GET /orders/7  ->  400 Bad Request
// bad id 7`],
            ['Global handler with @RestControllerAdvice.',
                r`@RestControllerAdvice
class GlobalHandler {
    @ExceptionHandler(NoSuchElementException.class)
    ProblemDetail notFound(NoSuchElementException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }
}

// OUTPUT:
// 404 Not Found
// {"type":"about:blank","title":"Not Found","status":404,"detail":"order 9 missing"}`]],
        [['Test the advice with MockMvc.',
            r`@WebMvcTest(OrderController.class)
@Import(GlobalHandler.class)
class AdviceTest {
    @Autowired MockMvc mvc;

    @Test
    void mapsTo404() throws Exception {
        mvc.perform(get("/orders/9"))
           .andExpect(status().isNotFound());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Advice limited to a package.',
                r`@RestControllerAdvice(basePackages = "com.shop.api")
class ApiErrors {
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> any(Exception ex) {
        return ResponseEntity.status(500).body(Map.of("error", "internal"));
    }
}

// OUTPUT:
// Controllers in com.shop.api -> {"error":"internal"} on failure
// Controllers elsewhere are not affected`]]
    ),
    'mvc-valid-vs-validated': x(
        ['<b>@Valid</b> is the standard Jakarta Bean Validation annotation that triggers validation of an object and cascades into nested objects.',
            '<b>@Validated</b> is the Spring annotation that adds validation groups and enables method-level validation on a class.',
            '<b>Request body</b>: <code>@Valid @RequestBody UserDto dto</code> checks constraints such as <code>@NotBlank</code> and <code>@Email</code>.'],
        ['<b>Groups</b>: only <code>@Validated(OnCreate.class)</code> can select a validation group; <code>@Valid</code> cannot.',
            '<b>Nested objects</b>: <code>@Valid</code> on a field cascades validation into it; <code>@Validated</code> does not do that.',
            '<b>Method validation</b>: <code>@Validated</code> on the class makes a proxy that checks <code>@Min</code> or <code>@NotNull</code> on parameters like <code>@RequestParam</code>.'],
        ['<b>Exceptions differ</b>: a bad body raises <code>MethodArgumentNotValidException</code>; a bad parameter in a <code>@Validated</code> class raises <code>ConstraintViolationException</code> (in Spring 6.1 also <code>HandlerMethodValidationException</code>).',
            '<b>Who validates</b>: argument resolvers call a <code>Validator</code> (Hibernate Validator) right after binding the body.',
            '<b>Design</b>: use groups sparingly; separate request DTOs for create and update are usually clearer.'],
        [['F', 'What is the difference between @Valid and @Validated?', '@Valid is the Jakarta standard and supports nesting; @Validated is Spring and supports groups and method validation.'],
            ['F', 'Which dependency gives you validation in Boot?', 'spring-boot-starter-validation, which brings Hibernate Validator.'],
            ['M', 'Can @Valid select a group?', 'No. Use @Validated with the group class.'],
            ['M', 'How do you see the validation errors in the controller?', 'Add a BindingResult parameter right after the validated argument, or handle MethodArgumentNotValidException.'],
            ['S', 'Why does validation of @RequestParam do nothing without @Validated?', 'Parameter constraints are checked by a method validation proxy that exists only on classes annotated @Validated (or by built-in method validation in newer Spring).'],
            ['S', 'How do you cascade into a list of items?', 'Put @Valid on the collection field (or on the type argument) so each element is validated.']],
        [['Validate a request body.',
            r`record UserDto(@NotBlank String name, @Email String email) {}

@PostMapping("/users")
ResponseEntity<String> create(@Valid @RequestBody UserDto dto) {
    return ResponseEntity.status(201).body("created " + dto.name());
}

// OUTPUT:
// POST {"name":"","email":"x"}  -> 400 Bad Request
// POST {"name":"Ann","email":"ann@x.com"} -> 201 created Ann`],
            ['Validation groups with @Validated.',
                r`interface OnCreate {}
record Item(@Null(groups = OnCreate.class) Long id, @NotBlank String name) {}

@PostMapping("/items")
Item add(@Validated(OnCreate.class) @RequestBody Item item) {
    return item;
}

// OUTPUT:
// {"id":5,"name":"pen"} -> 400 (id must be null on create)`]],
        [['Parameter constraints.',
            r`@Validated
@RestController
class PageController {
    @GetMapping("/page")
    String page(@RequestParam @Min(1) int n) {
        return "page " + n;
    }
}

// OUTPUT:
// GET /page?n=0 -> 400 (ConstraintViolationException handled by advice)
// GET /page?n=2 -> page 2`],
            ['Test a failing body with MockMvc.',
                r`@Test
void rejectsBlankName() throws Exception {
    mvc.perform(post("/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"\",\"email\":\"a@b.com\"}"))
       .andExpect(status().isBadRequest());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-responseentity-interview': x(
        ['<b>ResponseEntity</b> represents the whole HTTP response: status code, headers and body, all set by your code.',
            '<b>Typed</b>: <code>ResponseEntity&lt;User&gt;</code> carries a body of type User that is converted to JSON by a message converter.',
            '<b>Builders</b>: <code>ResponseEntity.ok(body)</code>, <code>.created(uri)</code>, <code>.noContent().build()</code> and <code>.notFound().build()</code> make intent clear.'],
        ['<b>Headers</b>: add <code>Location</code>, <code>ETag</code> or <code>Cache-Control</code> through the builder, for example <code>.header(&quot;X-Id&quot;, id)</code> style calls.',
            '<b>Versus @ResponseBody</b>: plain return values always give 200 (unless <code>@ResponseStatus</code>); <code>ResponseEntity</code> lets the code choose per call.',
            '<b>201 Created</b>: return the new resource URI in <code>Location</code> using <code>ServletUriComponentsBuilder</code> or <code>URI.create</code>.'],
        ['<b>Handler</b>: <code>HttpEntityMethodProcessor</code> handles this return type and writes the entity through <code>HttpMessageConverter</code>s.',
            '<b>Conditional requests</b>: <code>ResponseEntity.ok().eTag(...)</code> works with <code>ShallowEtagHeaderFilter</code> to return 304.',
            '<b>Errors</b>: prefer exceptions plus an advice for failures; use <code>ResponseEntity</code> for the normal variants of success.'],
        [['F', 'What is ResponseEntity?', 'A class that lets you set the status, headers and body of an HTTP response from a controller.'],
            ['F', 'How do you return 404?', 'Return ResponseEntity.notFound().build() or throw an exception mapped to 404.'],
            ['M', 'ResponseEntity or @ResponseStatus?', '@ResponseStatus gives one fixed status; ResponseEntity decides per request.'],
            ['M', 'How do you return 201 with a Location header?', 'ResponseEntity.created(uri).body(saved).'],
            ['S', 'Which component writes a ResponseEntity?', 'HttpEntityMethodProcessor, using the HttpMessageConverters chosen by content negotiation.'],
            ['S', 'Is ResponseEntity<Void> useful?', 'Yes, for 204 or 201 responses that have no body.']],
        [['Return 200 or 404.',
            r`@GetMapping("/users/{id}")
ResponseEntity<User> get(@PathVariable long id) {
    return repo.findById(id)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
}

// OUTPUT:
// GET /users/1  -> 200 {"id":1,"name":"Ann"}
// GET /users/99 -> 404`],
            ['Create with Location.',
                r`@PostMapping("/users")
ResponseEntity<User> create(@RequestBody User u) {
    User saved = repo.save(u);
    URI uri = URI.create("/users/" + saved.getId());
    return ResponseEntity.created(uri).body(saved);
}

// OUTPUT:
// HTTP/1.1 201
// Location: /users/3
// {"id":3,"name":"Baji"}`]],
        [['Custom headers and cache.',
            r`@GetMapping("/report")
ResponseEntity<String> report() {
    return ResponseEntity.ok()
        .header("X-Report", "daily")
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
        .body("data");
}

// OUTPUT:
// HTTP/1.1 200
// X-Report: daily
// Cache-Control: max-age=300`],
            ['Test status and header.',
                r`@Test
void createReturnsLocation() throws Exception {
    mvc.perform(post("/users").contentType("application/json")
            .content("{\"name\":\"Baji\"}"))
       .andExpect(status().isCreated())
       .andExpect(header().exists("Location"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-httpmessageconverter-interview': x(
        ['<b>HttpMessageConverter</b> converts the HTTP body to a Java object (request) and a Java object to the HTTP body (response).',
            '<b>Common ones</b>: <code>StringHttpMessageConverter</code>, <code>MappingJackson2HttpMessageConverter</code> (JSON) and <code>ByteArrayHttpMessageConverter</code>.',
            '<b>Triggered by</b> <code>@RequestBody</code>, <code>@ResponseBody</code>, <code>@RestController</code>, <code>HttpEntity</code> and <code>ResponseEntity</code>.'],
        ['<b>Selection</b>: a converter is chosen by the Java type and the media type (<code>Content-Type</code> for reading, <code>Accept</code> for writing).',
            '<b>Classpath</b>: Jackson on the classpath adds the JSON converter; a Jackson XML module adds an XML one.',
            '<b>Errors</b>: no converter for the request type gives 415; none for the Accept header gives 406.'],
        ['<b>Processors</b>: <code>RequestResponseBodyMethodProcessor</code> loops over the converter list and calls <code>canRead</code> or <code>canWrite</code>.',
            '<b>Customizing</b>: <code>WebMvcConfigurer.extendMessageConverters</code> adds to the defaults, <code>configureMessageConverters</code> replaces them.',
            '<b>Order matters</b>: the first converter that can handle the pair wins, so put specific ones first.'],
        [['F', 'What does an HttpMessageConverter do?', 'It reads request bodies into objects and writes objects as response bodies.'],
            ['F', 'Which converter produces JSON?', 'MappingJackson2HttpMessageConverter, based on Jackson.'],
            ['M', 'What status do you get for an unsupported Content-Type?', '415 Unsupported Media Type.'],
            ['M', 'And for an unsupported Accept header?', '406 Not Acceptable.'],
            ['S', 'How do you add a custom converter without losing defaults?', 'Override extendMessageConverters in a WebMvcConfigurer.'],
            ['S', 'Who calls the converters?', 'RequestResponseBodyMethodProcessor and HttpEntityMethodProcessor during argument resolving and return value handling.']],
        [['List the converters.',
            r`@Autowired RequestMappingHandlerAdapter adapter;

@PostConstruct
void show() {
    adapter.getMessageConverters()
        .forEach(c -> System.out.println(c.getClass().getSimpleName()));
}

// OUTPUT: (varies by classpath)
// ByteArrayHttpMessageConverter
// StringHttpMessageConverter
// ResourceHttpMessageConverter
// MappingJackson2HttpMessageConverter`],
            ['Plain text response.',
                r`@GetMapping(value = "/ping", produces = "text/plain")
@ResponseBody
String ping() {
    return "pong";
}

// OUTPUT:
// Content-Type: text/plain;charset=UTF-8
// pong`]],
        [['Add a converter.',
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> list) {
        list.add(new CsvConverter());   // custom, handles text/csv
    }
}

// OUTPUT:
// Accept: text/csv -> body written by CsvConverter`],
            ['Test the 415 case.',
                r`@Test
void wrongContentType() throws Exception {
    mvc.perform(post("/users").contentType(MediaType.TEXT_PLAIN)
            .content("hello"))
       .andExpect(status().isUnsupportedMediaType());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-jackson-interview': x(
        ['<b>Jackson</b> is the JSON library Spring MVC uses to turn Java objects into JSON and JSON into objects.',
            '<b>ObjectMapper</b> is its main class; Spring Boot auto-configures one with sensible defaults.',
            '<b>Annotations</b>: <code>@JsonProperty</code> renames a field, <code>@JsonIgnore</code> hides it and <code>@JsonFormat</code> sets a date pattern.'],
        ['<b>Boot properties</b>: <code>spring.jackson.property-naming-strategy</code> and <code>spring.jackson.default-property-inclusion=non_null</code> change output without code.',
            '<b>Dates</b>: with <code>jackson-datatype-jsr310</code> (included in Boot) <code>LocalDate</code> works; disable timestamps to get ISO strings.',
            '<b>Unknown fields</b>: Boot turns off <code>FAIL_ON_UNKNOWN_PROPERTIES</code> so extra JSON fields are ignored.'],
        ['<b>Customizing</b>: define a <code>Jackson2ObjectMapperBuilderCustomizer</code> bean or a <code>Module</code> bean instead of replacing the mapper.',
            '<b>Security</b>: avoid default typing and polymorphic deserialization of untrusted input; use sealed <code>@JsonTypeInfo</code> with allowed subtypes.',
            '<b>Entities</b>: serializing JPA entities causes lazy loading and cycles; map to DTOs or use <code>@JsonIgnore</code> and <code>@JsonManagedReference</code> carefully.'],
        [['F', 'What is Jackson used for in Spring MVC?', 'Converting Java objects to JSON responses and JSON requests to Java objects.'],
            ['F', 'How do you hide a field from JSON?', 'Annotate it with @JsonIgnore.'],
            ['M', 'How do you omit null fields globally?', 'Set spring.jackson.default-property-inclusion=non_null.'],
            ['M', 'Why does LocalDate come out as an array of numbers?', 'Timestamps are enabled; disable WRITE_DATES_AS_TIMESTAMPS to get ISO strings.'],
            ['S', 'How do you customize the mapper without losing Boot defaults?', 'Use a Jackson2ObjectMapperBuilderCustomizer or properties instead of declaring your own ObjectMapper.'],
            ['S', 'What problem do bidirectional JPA relations cause?', 'Infinite recursion during serialization; use DTOs or reference annotations.']],
        [['Rename and hide fields.',
            r`public class UserDto {
    @JsonProperty("user_name") private String name;
    @JsonIgnore private String password;
    // getters and setters omitted
}

// OUTPUT:
// {"user_name":"Ann"}`],
            ['Date format.',
                r`public record Event(String title,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate day) {}

// OUTPUT:
// {"title":"Launch","day":"2025-03-01"}`]],
        [['Manual use of ObjectMapper.',
            r`ObjectMapper om = new ObjectMapper();
String json = om.writeValueAsString(Map.of("id", 1));
Map<?, ?> back = om.readValue(json, Map.class);
System.out.println(json + " " + back.get("id"));

// OUTPUT:
// {"id":1} 1`],
            ['Test the JSON shape with @JsonTest.',
                r`@JsonTest
class UserJsonTest {
    @Autowired JacksonTester<UserDto> json;

    @Test
    void hidesPassword() throws Exception {
        assertThat(json.write(new UserDto("Ann", "secret")))
            .doesNotHaveJsonPath("$.password");
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-content-negotiation-interview': x(
        ['<b>Content negotiation</b> is how the server picks the response format (JSON, XML, ...) that the client can accept.',
            '<b>Accept header</b>: the client sends <code>Accept: application/json</code> and the server answers in that media type.',
            '<b>produces and consumes</b> on <code>@RequestMapping</code> narrow a method to given response and request media types.'],
        ['<b>Strategies</b>: by default Spring uses the Accept header; a query parameter strategy can be enabled, and the path extension strategy is no longer supported.',
            '<b>Errors</b>: no acceptable representation gives 406; unsupported request body type gives 415.',
            '<b>Quality values</b>: <code>Accept: application/xml;q=0.5, application/json</code> prefers JSON.'],
        ['<b>Flow</b>: <code>ContentNegotiationManager</code> resolves the requested types; the return value handler intersects them with what the converters and <code>produces</code> allow.',
            '<b>Config</b>: <code>configureContentNegotiation</code> in <code>WebMvcConfigurer</code> sets default type and parameter strategy.',
            '<b>Caching</b>: if the response varies by Accept, send <code>Vary: Accept</code> so caches stay correct.'],
        [['F', 'What is content negotiation?', 'Choosing the representation of a resource, such as JSON or XML, based on what the client asks for.'],
            ['F', 'Which header does the client use?', 'Accept for the response type, Content-Type for the request body type.'],
            ['M', 'What does produces do?', 'It restricts a handler to requests whose Accept header matches the listed media types.'],
            ['M', 'When do you get 406?', 'When the server cannot produce any of the media types the client accepts.'],
            ['S', 'Which class resolves the requested media types?', 'ContentNegotiationManager with its ContentNegotiationStrategy objects.'],
            ['S', 'How do you support XML as well as JSON?', 'Add jackson-dataformat-xml to the classpath so an XML converter is registered.']],
        [['Two formats from one method.',
            r`@GetMapping(value = "/users/1",
        produces = { "application/json", "application/xml" })
User one() {
    return new User(1, "Ann");
}

// OUTPUT:
// Accept: application/json -> {"id":1,"name":"Ann"}
// Accept: application/xml  -> <User><id>1</id><name>Ann</name></User>`],
            ['Separate methods per type.',
                r`@GetMapping(value = "/doc", produces = "text/plain")
String text() { return "hello"; }

@GetMapping(value = "/doc", produces = "application/json")
Map<String, String> json() { return Map.of("msg", "hello"); }

// OUTPUT:
// Accept: text/plain        -> hello
// Accept: application/json  -> {"msg":"hello"}`]],
        [['Parameter strategy config.',
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer c) {
        c.favorParameter(true).parameterName("format")
         .defaultContentType(MediaType.APPLICATION_JSON);
    }
}

// OUTPUT:
// GET /users/1?format=xml -> XML body
// GET /users/1            -> JSON body`],
            ['Test 406.',
                r`@Test
void notAcceptable() throws Exception {
    mvc.perform(get("/users/1").accept(MediaType.APPLICATION_PDF))
       .andExpect(status().isNotAcceptable());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-cors': x(
        ['<b>CORS</b> (Cross-Origin Resource Sharing) is a browser rule: a page from one origin may call another origin only if that server allows it.',
            '<b>Origin</b> = scheme + host + port; a different port is a different origin.',
            '<b>@CrossOrigin</b> on a controller or method allows chosen origins, for example <code>@CrossOrigin(origins = &quot;http://localhost:3000&quot;)</code> style values.'],
        ['<b>Preflight</b>: for non-simple requests (PUT, DELETE, custom headers, JSON content type) the browser first sends an <code>OPTIONS</code> request.',
            '<b>Headers</b>: the server answers with <code>Access-Control-Allow-Origin</code>, <code>-Methods</code> and <code>-Headers</code>.',
            '<b>Global config</b>: register mappings in <code>WebMvcConfigurer.addCorsMappings</code> instead of annotating every controller.'],
        ['<b>Handled by</b> <code>CorsProcessor</code> and <code>CorsInterceptor</code> through the handler mapping; it works before the controller is called.',
            '<b>Spring Security</b>: the security filter runs first, so enable <code>http.cors(...)</code> or the preflight gets 401/403.',
            '<b>Credentials</b>: with <code>allowCredentials(true)</code> you cannot use the wildcard <code>*</code> origin; list exact origins or patterns.'],
        [['F', 'What is CORS?', 'A browser security mechanism that blocks cross-origin calls unless the server allows them with headers.'],
            ['F', 'Does CORS protect the server?', 'No, it protects the user in the browser; tools like curl are not affected.'],
            ['M', 'What is a preflight request?', 'An OPTIONS request the browser sends first to ask if the real request is allowed.'],
            ['M', 'Where do you configure CORS globally?', 'In WebMvcConfigurer.addCorsMappings.'],
            ['S', 'Why does CORS fail with Spring Security even with @CrossOrigin?', 'The security filter chain rejects the preflight before MVC; enable http.cors().'],
            ['S', 'Why can allowCredentials not be used with a wildcard origin?', 'The CORS spec forbids it; Spring throws an error unless you use allowedOriginPatterns.']],
        [['Controller-level CORS.',
            r`@CrossOrigin(origins = "http://localhost:3000")
@RestController
class UserController {
    @GetMapping("/users")
    List<String> all() { return List.of("Ann", "Baji"); }
}

// OUTPUT:
// Origin: http://localhost:3000
// Access-Control-Allow-Origin: http://localhost:3000`],
            ['Global CORS.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**")
           .allowedOrigins("https://app.example.com")
           .allowedMethods("GET", "POST", "PUT", "DELETE")
           .maxAge(3600);
    }
}

// OUTPUT:
// OPTIONS /api/users -> 200
// Access-Control-Allow-Methods: GET,POST,PUT,DELETE
// Access-Control-Max-Age: 3600`]],
        [['Test a preflight.',
            r`@Test
void preflight() throws Exception {
    mvc.perform(options("/api/users")
            .header("Origin", "https://app.example.com")
            .header("Access-Control-Request-Method", "PUT"))
       .andExpect(status().isOk())
       .andExpect(header().string("Access-Control-Allow-Origin",
            "https://app.example.com"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Security plus CORS.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .authorizeHttpRequests(a -> a.anyRequest().authenticated());
    return http.build();
}

// OUTPUT:
// Preflight OPTIONS is answered with CORS headers before authentication`]]
    ),
    'mvc-csrf-interview': x(
        ['<b>CSRF</b> (Cross-Site Request Forgery) tricks a logged-in browser into sending an unwanted request, because the browser attaches the session cookie automatically.',
            '<b>Defense</b>: the server requires a secret <b>CSRF token</b> on state-changing requests (POST, PUT, DELETE) that an attacker site cannot read.',
            '<b>Spring Security</b> enables CSRF protection by default for browser-style apps.'],
        ['<b>Token flow</b>: the token is stored in the session or a cookie and sent back in a hidden form field or the <code>X-CSRF-TOKEN</code> header.',
            '<b>Safe methods</b>: GET, HEAD, OPTIONS and TRACE are not checked, so never change data in a GET.',
            '<b>SPA</b>: use <code>CookieCsrfTokenRepository.withHttpOnlyFalse()</code> so JavaScript can read the cookie and echo it in a header.'],
        ['<b>Filter</b>: <code>CsrfFilter</code> compares the request token with the stored one; a mismatch gives 403.',
            '<b>Stateless APIs</b>: with token-based auth (JWT in the Authorization header) there is no ambient cookie, so CSRF can be disabled for those endpoints.',
            '<b>SameSite cookies</b> add defense in depth but do not replace tokens for all cases.'],
        [['F', 'What is CSRF?', 'An attack where another site makes the victim browser send an authenticated request to your site.'],
            ['F', 'Which HTTP methods are protected?', 'State-changing ones such as POST, PUT, PATCH and DELETE.'],
            ['M', 'How does the token stop the attack?', 'The attacker page cannot read the token, so it cannot include it in the forged request.'],
            ['M', 'What do you get when the token is missing?', '403 Forbidden from CsrfFilter.'],
            ['S', 'When is it safe to disable CSRF?', 'For stateless APIs that authenticate with a header token instead of cookies.'],
            ['S', 'How does a single page app send the token?', 'Read it from the XSRF-TOKEN cookie and send it in the X-XSRF-TOKEN header.']],
        [['Default form with token (Thymeleaf adds it automatically).',
            r`<form method="post" action="/transfer">
    <input type="hidden" name="_csrf" value="TOKEN_VALUE"/>
    <button>Send</button>
</form>

// OUTPUT:
// POST with valid _csrf -> 200
// POST without it       -> 403 Forbidden`],
            ['Cookie repository for SPAs.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(c -> c.csrfTokenRepository(
        CookieCsrfTokenRepository.withHttpOnlyFalse()));
    return http.build();
}

// OUTPUT:
// Set-Cookie: XSRF-TOKEN=abc123 (varies)`]],
        [['Disable for a stateless API.',
            r`@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(a -> a.anyRequest().authenticated());
    return http.build();
}

// OUTPUT:
// /api/** requests need no CSRF token but need an Authorization header`],
            ['Test with MockMvc.',
                r`@Test
@WithMockUser
void postNeedsCsrf() throws Exception {
    mvc.perform(post("/transfer")).andExpect(status().isForbidden());
    mvc.perform(post("/transfer").with(csrf()))
       .andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-session-vs-stateless': x(
        ['<b>Session-based</b> apps keep user state on the server (an <code>HttpSession</code>) and give the browser a <code>JSESSIONID</code> cookie.',
            '<b>Stateless</b> apps keep no client state on the server; each request carries everything needed, usually a token such as a JWT.',
            '<b>REST</b> style prefers stateless, because any server instance can answer any request.'],
        ['<b>Scaling</b>: sessions need sticky routing or a shared store (Spring Session with Redis); stateless scales by just adding servers.',
            '<b>Revocation</b>: sessions can be killed on the server at once; a JWT is valid until it expires unless you keep a deny list.',
            '<b>Security</b>: cookies need CSRF protection; header tokens need safe storage in the client.'],
        ['<b>Spring Security policy</b>: <code>SessionCreationPolicy.STATELESS</code> stops it from creating or using an HttpSession.',
            '<b>Mixed</b>: web pages can use sessions while <code>/api/**</code> is stateless, using two filter chains.',
            '<b>Trade-off</b>: stateless requests are bigger and need signature checks on each call; sessions use server memory.'],
        [['F', 'What is the difference between session and stateless?', 'Session stores user state on the server; stateless sends all needed data with each request.'],
            ['F', 'What is JSESSIONID?', 'The cookie that links the browser to its server-side HttpSession.'],
            ['M', 'Why do sessions complicate scaling?', 'The state lives in one server, so you need sticky sessions or a shared session store.'],
            ['M', 'How do you make Spring Security stateless?', 'Set sessionCreationPolicy(SessionCreationPolicy.STATELESS).'],
            ['S', 'How do you log out a JWT user at once?', 'You cannot without extra state; use short expiry plus refresh tokens or a deny list.'],
            ['S', 'What does Spring Session add?', 'It stores HttpSession data in Redis or a database so any instance can serve the user.']],
        [['Use of HttpSession.',
            r`@GetMapping("/visit")
String visit(HttpSession session) {
    int n = (Integer) Optional.ofNullable(session.getAttribute("n")).orElse(0) + 1;
    session.setAttribute("n", n);
    return "visits " + n;
}

// OUTPUT:
// 1st call -> visits 1 (Set-Cookie: JSESSIONID=... (varies))
// 2nd call with cookie -> visits 2`],
            ['Stateless security chain.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.sessionManagement(s ->
            s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));
    return http.build();
}

// OUTPUT:
// No JSESSIONID cookie is set; every call needs Authorization: Bearer <jwt>`]],
        [['Shared session store.',
            r`# application.properties (needs spring-session-data-redis)
spring.session.store-type=redis
server.servlet.session.timeout=30m

# OUTPUT:
# Sessions survive restarts and are shared by all instances`],
            ['Test stateless behavior.',
                r`@Test
void noSessionCreated() throws Exception {
    MvcResult res = mvc.perform(get("/api/ping")
            .with(jwt()))
        .andExpect(status().isOk()).andReturn();
    assertThat(res.getRequest().getSession(false)).isNull();
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-mvc-vs-rest': x(
        ['<b>Spring MVC (web pages)</b>: a <code>@Controller</code> returns a view name, and a view technology such as Thymeleaf renders HTML.',
            '<b>REST</b>: a <code>@RestController</code> returns data (usually JSON) that is written directly to the response body.',
            '<b>Same framework</b>: both run on Spring MVC and DispatcherServlet; only the return handling differs.'],
        ['<b>@RestController</b> = <code>@Controller</code> + <code>@ResponseBody</code>, so no <code>ViewResolver</code> is used.',
            '<b>Clients</b>: MVC pages serve browsers; REST APIs serve mobile apps, SPAs and other services.',
            '<b>HTTP semantics</b>: REST uses methods and status codes (GET, POST, 201, 404) as part of the contract; page apps often use only GET and POST.'],
        ['<b>Handler</b>: view names go through <code>ViewNameMethodReturnValueHandler</code>; REST bodies go through <code>RequestResponseBodyMethodProcessor</code> and message converters.',
            '<b>Errors</b>: pages show an error view; APIs return a JSON error body such as <code>ProblemDetail</code>.',
            '<b>Mixing</b>: one app can have both; use separate packages and separate advice and security chains.'],
        [['F', 'What is the difference between MVC and REST controllers?', 'MVC controllers return views to render HTML; REST controllers return data written to the body.'],
            ['F', 'What does @RestController include?', '@Controller and @ResponseBody.'],
            ['M', 'What returns the HTML page in MVC?', 'The ViewResolver finds the view (such as a Thymeleaf template) for the returned name.'],
            ['M', 'How can a @Controller method return JSON?', 'Add @ResponseBody to the method.'],
            ['S', 'Which component writes JSON in REST?', 'An HttpMessageConverter (Jackson) called by RequestResponseBodyMethodProcessor.'],
            ['S', 'Is REST a framework feature?', 'No, it is an architectural style; Spring MVC only gives the tools to build it.']],
        [['MVC page controller.',
            r`@Controller
class PageController {
    @GetMapping("/home")
    String home(Model model) {
        model.addAttribute("name", "Ann");
        return "home";            // resolved to templates/home.html
    }
}

// OUTPUT:
// GET /home -> 200 text/html (rendered page with Ann)`],
            ['REST controller.',
                r`@RestController
class ApiController {
    @GetMapping("/api/user")
    Map<String, String> user() {
        return Map.of("name", "Ann");
    }
}

// OUTPUT:
// GET /api/user -> 200 application/json
// {"name":"Ann"}`]],
        [['Mixed controller.',
            r`@Controller
class MixedController {
    @GetMapping("/page") String page() { return "page"; }

    @GetMapping("/data") @ResponseBody
    List<Integer> data() { return List.of(1, 2); }
}

// OUTPUT:
// GET /page -> HTML view
// GET /data -> [1,2]`],
            ['Test both.',
                r`@Test
void viewAndJson() throws Exception {
    mvc.perform(get("/page")).andExpect(view().name("page"));
    mvc.perform(get("/data"))
       .andExpect(content().json("[1,2]"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    )
};

export const smvc44Deep: Record<string, Deep> = {
    'mvc-controlleradvice-vs-exceptionhandler': dv(
        [`<p>Exceptions thrown by a handler reach <code>DispatcherServlet.processHandlerException</code>.</p><ul><li><b>Chain:</b> it asks each <code>HandlerExceptionResolver</code> in order: <code>ExceptionHandlerExceptionResolver</code>, <code>ResponseStatusExceptionResolver</code>, <code>DefaultHandlerExceptionResolver</code>.</li><li><b>Lookup:</b> the first resolver searches the controller class for a matching <code>@ExceptionHandler</code>, then each <code>@ControllerAdvice</code> bean.</li><li><b>Match:</b> the nearest exception type in the class hierarchy wins.</li><li><b>Result:</b> the method runs like a handler, so it can take the exception, request and return a body.</li></ul>`,
            r`@RestController
class A {
    @GetMapping("/a") String a() { throw new IllegalStateException("x"); }
    @ExceptionHandler(RuntimeException.class)
    String local(RuntimeException e) { return "local"; }
}

@RestControllerAdvice
class Adv {
    @ExceptionHandler(IllegalStateException.class)
    String global(IllegalStateException e) { return "global"; }
}

// OUTPUT:
// GET /a -> local   (controller handlers are searched first, even if less specific)`],
        [`<p>Variants of the advice annotation:</p><ul><li><b>basePackages:</b> limit to packages.</li><li><b>assignableTypes:</b> limit to given controller classes.</li><li><b>annotations:</b> limit to controllers carrying an annotation.</li><li><b>@Order:</b> sets priority between several advices.</li><li><b>Method args:</b> the exception, <code>WebRequest</code>, <code>HttpServletRequest</code>, <code>HandlerMethod</code>.</li><li><b>Return:</b> <code>ResponseEntity</code>, <code>ProblemDetail</code>, a view name or a body.</li></ul>`,
            r`@RestControllerAdvice(annotations = RestController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class ApiAdvice {
    @ExceptionHandler({ IllegalArgumentException.class, DateTimeException.class })
    ResponseEntity<ProblemDetail> bad(Exception ex, HttpServletRequest req) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setProperty("path", req.getRequestURI());
        return ResponseEntity.badRequest().body(pd);
    }
}

// OUTPUT:
// {"title":"Bad Request","status":400,"detail":"bad date","path":"/orders"}`],
        [`<p>Typical mistakes:</p><ul><li><b>Advice not found:</b> it is outside component scan; move it under the main package.</li><li><b>Wrong annotation:</b> <code>@ControllerAdvice</code> without <code>@ResponseBody</code> tries to resolve a view and returns a 404 page.</li><li><b>Swallowed status:</b> returning a body from a handler gives 200 unless you set <code>@ResponseStatus</code> or use <code>ResponseEntity</code>.</li><li><b>Catch-all too early:</b> a handler for <code>Exception</code> in a high-priority advice hides more specific ones in later advices.</li><li><b>No logging:</b> handled exceptions disappear; log unexpected ones.</li></ul>`,
            r`@RestControllerAdvice
class Fixed {
    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)      // without this the status is 200
    Map<String, String> nf(NoSuchElementException e) {
        return Map.of("error", e.getMessage());
    }
}

// OUTPUT:
// 404 {"error":"order 5 missing"}`],
        [`<p>Cost is small, but keep it clean:</p><ul><li><b>Lookup cache:</b> handler methods are cached per class after the first exception.</li><li><b>No heavy work:</b> do not hit the database in an error handler.</li><li><b>Stack traces:</b> logging each one at ERROR for expected client errors (400, 404) floods logs; use WARN or no stack.</li><li><b>Exceptions as flow control:</b> creating stack traces is costly; use lightweight exceptions in hot paths.</li></ul>`,
            r`class NotFoundException extends RuntimeException {
    NotFoundException(String m) { super(m, null, false, false); } // no stack trace
}

@ExceptionHandler(NotFoundException.class)
ResponseEntity<Void> nf(NotFoundException e) {
    log.warn("not found: {}", e.getMessage());   // single line, no stack
    return ResponseEntity.notFound().build();
}

// OUTPUT:
// WARN not found: order 5   (one line per request)`],
        [`<p>Real project: one advice per API module that gives every client the same error JSON.</p><ul><li><b>Mapping:</b> validation errors to 400 with field details, domain not found to 404, conflicts to 409.</li><li><b>Fallback:</b> unknown errors to 500 with a correlation id.</li><li><b>Contract:</b> clients and tests rely on one stable shape.</li></ul>`,
            r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(400);
        pd.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField,
                FieldError::getDefaultMessage, (a, b) -> a)));
        return pd;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail fallback(Exception ex) {
        String id = UUID.randomUUID().toString();
        log.error("error {}", id, ex);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(500, "Unexpected error");
        pd.setProperty("correlationId", id);
        return pd;
    }
}

// OUTPUT: (varies)
// {"status":400,"errors":{"email":"must be a well-formed email address"}}
// {"status":500,"detail":"Unexpected error","correlationId":"7f3c..."}`]
    ),
    'mvc-valid-vs-validated': dv(
        [`<p>Two different mechanisms sit behind the two annotations.</p><ul><li><b>Body and model arguments:</b> <code>RequestResponseBodyMethodProcessor</code> creates a <code>WebDataBinder</code> and calls <code>validate</code> when it sees <code>@Valid</code> or <code>@Validated</code>; errors raise <code>MethodArgumentNotValidException</code>.</li><li><b>Method validation:</b> <code>MethodValidationPostProcessor</code> wraps a bean annotated <code>@Validated</code> in an AOP proxy that checks parameter and return constraints and throws <code>ConstraintViolationException</code>.</li><li><b>Spring 6.1:</b> controllers get built-in method validation without the proxy, raising <code>HandlerMethodValidationException</code>.</li><li><b>Engine:</b> Hibernate Validator implements Jakarta Bean Validation.</li></ul>`,
            r`@Validated
@Service
class TransferService {
    void send(@NotBlank String to, @Positive BigDecimal amount) {
        // runs only when both constraints hold
    }
}

// OUTPUT:
// send("", 5)  -> ConstraintViolationException: send.to: must not be blank
// send("A", 5) -> ok`],
        [`<p>Syntax summary:</p><ul><li><b>@Valid:</b> on parameters, fields (cascade) and return values.</li><li><b>@Validated:</b> on classes, and on parameters with groups.</li><li><b>Groups:</b> marker interfaces such as <code>OnCreate</code>, <code>OnUpdate</code>.</li><li><b>Default group:</b> constraints without a group belong to <code>Default</code>.</li><li><b>BindingResult:</b> must come right after the validated parameter.</li></ul>`,
            r`record Address(@NotBlank String city) {}
record Customer(
    @NotBlank String name,
    @Valid Address address,                       // cascades into Address
    @NotEmpty List<@Valid Address> others) {}

@PostMapping("/customers")
String add(@Valid @RequestBody Customer c, BindingResult br) {
    return br.hasErrors() ? "invalid: " + br.getErrorCount() : "ok";
}

// OUTPUT:
// {"name":"A","address":{"city":""},"others":[{"city":"X"}]} -> invalid: 1`],
        [`<p>Common mistakes:</p><ul><li><b>No cascade:</b> a nested object is skipped without <code>@Valid</code> on the field.</li><li><b>Groups with @Valid:</b> the group is silently ignored; use <code>@Validated</code>.</li><li><b>BindingResult in the wrong place:</b> if it is not directly after the object, Spring throws instead of filling it.</li><li><b>Missing starter:</b> without <code>spring-boot-starter-validation</code> constraints are ignored.</li><li><b>Self-invocation:</b> calling a validated method from the same class skips the proxy.</li></ul>`,
            r`// WRONG: BindingResult not right after the object
@PostMapping("/x")
String bad(@Valid @RequestBody Customer c, @RequestParam int n, BindingResult br) { return "x"; }

// RIGHT
@PostMapping("/x")
String good(@Valid @RequestBody Customer c, BindingResult br, @RequestParam int n) {
    return "x";
}

// OUTPUT:
// bad  -> IllegalStateException: An Errors/BindingResult argument is expected ...
// good -> works`],
        [`<p>Validation is cheap but not free.</p><ul><li><b>Validator is cached:</b> reuse the single <code>Validator</code> bean; never build a factory per request.</li><li><b>Fail fast:</b> Hibernate Validator can stop at the first violation with <code>hibernate.validator.fail_fast=true</code>.</li><li><b>Custom constraints:</b> avoid database calls inside them on hot paths.</li><li><b>Large collections:</b> cascading over thousands of elements adds up; limit sizes with <code>@Size(max = ...)</code> first.</li></ul>`,
            r`@Bean
LocalValidatorFactoryBean validator() {
    LocalValidatorFactoryBean v = new LocalValidatorFactoryBean();
    v.getValidationPropertyMap().put("hibernate.validator.fail_fast", "true");
    return v;
}

record Batch(@Size(max = 100) List<@Valid Item> items) {}

// OUTPUT:
// More than 100 items rejected before each element is checked`],
        [`<p>Real project: create and update share one DTO but differ in rules.</p><ul><li><b>Create:</b> id must be null.</li><li><b>Update:</b> id is required.</li><li><b>Handler:</b> one advice turns violations into 400 with field messages.</li></ul>`,
            r`interface OnCreate {}
interface OnUpdate {}

record ProductDto(
    @Null(groups = OnCreate.class) @NotNull(groups = OnUpdate.class) Long id,
    @NotBlank(groups = { OnCreate.class, OnUpdate.class }) String name) {}

@PostMapping("/products")
ProductDto create(@Validated(OnCreate.class) @RequestBody ProductDto p) { return p; }

@PutMapping("/products")
ProductDto update(@Validated(OnUpdate.class) @RequestBody ProductDto p) { return p; }

// OUTPUT:
// POST {"id":1,"name":"pen"} -> 400
// PUT  {"name":"pen"}        -> 400
// PUT  {"id":1,"name":"pen"} -> 200`]
    ),
    'mvc-responseentity-interview': dv(
        [`<p>How a returned <code>ResponseEntity</code> becomes an HTTP response:</p><ul><li><b>Dispatch:</b> <code>HandlerMethodReturnValueHandlerComposite</code> finds <code>HttpEntityMethodProcessor</code> for <code>HttpEntity</code> and its subclass.</li><li><b>Headers:</b> it copies the entity headers (and applies the status) to the <code>ServletServerHttpResponse</code>.</li><li><b>Body:</b> the body goes through content negotiation to a matching <code>HttpMessageConverter</code>.</li><li><b>Special case:</b> GET with an ETag or Last-Modified can be turned into 304 by <code>checkNotModified</code>.</li></ul>`,
            r`ResponseEntity<String> e = ResponseEntity.status(HttpStatus.ACCEPTED)
    .header("X-Job", "42")
    .body("queued");
System.out.println(e.getStatusCode() + " " + e.getHeaders().getFirst("X-Job"));

// OUTPUT:
// 202 ACCEPTED 42`],
        [`<p>Builder variants:</p><ul><li><b>ok(), created(uri), accepted(), noContent():</b> common statuses.</li><li><b>badRequest(), notFound(), status(int):</b> errors and custom codes.</li><li><b>Terminal call:</b> <code>.body(x)</code> for a body, <code>.build()</code> for none.</li><li><b>Wrappers:</b> <code>ResponseEntity.of(Optional)</code> returns 404 for empty.</li><li><b>Streaming:</b> <code>ResponseEntity&lt;Resource&gt;</code>, <code>StreamingResponseBody</code>.</li></ul>`,
            r`@GetMapping("/users/{id}")
ResponseEntity<User> find(@PathVariable long id) {
    return ResponseEntity.of(repo.findById(id));        // 200 or 404
}

@GetMapping("/files/{name}")
ResponseEntity<Resource> file(@PathVariable String name) {
    Resource res = new FileSystemResource("/data/" + name);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + name)
        .body(res);
}

// OUTPUT:
// GET /users/99 -> 404
// GET /files/a.pdf -> 200 Content-Disposition: attachment; filename=a.pdf`],
        [`<p>Common mistakes:</p><ul><li><b>Always 200:</b> returning an error object inside <code>ok()</code>.</li><li><b>Raw type:</b> <code>ResponseEntity</code> without generics hides body type problems.</li><li><b>Null body with 200:</b> use <code>noContent()</code> or <code>notFound()</code>.</li><li><b>Wrong create status:</b> POST that creates should answer 201, not 200.</li><li><b>Path traversal:</b> never build a file path from user input without checking it.</li></ul>`,
            r`// WRONG: error hidden in a 200
return ResponseEntity.ok(Map.of("error", "not found"));

// RIGHT
return ResponseEntity.status(HttpStatus.NOT_FOUND)
    .body(Map.of("error", "not found"));

// OUTPUT:
// WRONG -> 200 {"error":"not found"}   (clients cannot detect failure)
// RIGHT -> 404 {"error":"not found"}`],
        [`<p>Performance points:</p><ul><li><b>Caching:</b> <code>cacheControl</code> and <code>eTag</code> save bandwidth.</li><li><b>Large files:</b> return a <code>Resource</code> or <code>StreamingResponseBody</code> so the file is not loaded in memory.</li><li><b>Allocation:</b> the entity is a small object; cost is in body conversion, not in the wrapper.</li></ul>`,
            r`@GetMapping("/report/{id}")
ResponseEntity<Report> report(@PathVariable long id) {
    Report r = service.find(id);
    return ResponseEntity.ok()
        .eTag("\"" + r.version() + "\"")
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
        .body(r);
}

// OUTPUT:
// ETag: "7"
// Cache-Control: max-age=600, public
// Second request with If-None-Match: "7" -> 304 (when checkNotModified is used)`],
        [`<p>Real project: a create endpoint that follows REST rules.</p><ul><li><b>201 + Location:</b> the client can fetch the new resource.</li><li><b>409:</b> duplicate resource.</li><li><b>204:</b> delete with no content.</li></ul>`,
            r`@PostMapping("/customers")
ResponseEntity<Customer> create(@Valid @RequestBody Customer c) {
    if (repo.existsByEmail(c.getEmail())) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
    Customer saved = repo.save(c);
    URI loc = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(saved.getId()).toUri();
    return ResponseEntity.created(loc).body(saved);
}

@DeleteMapping("/customers/{id}")
ResponseEntity<Void> delete(@PathVariable long id) {
    repo.deleteById(id);
    return ResponseEntity.noContent().build();
}

// OUTPUT:
// POST /customers -> 201 Location: http://localhost:8080/customers/5
// POST same email -> 409
// DELETE /customers/5 -> 204`]
    ),
    'mvc-httpmessageconverter-interview': dv(
        [`<p>Message conversion steps:</p><ul><li><b>Reading:</b> for <code>@RequestBody</code> the processor loops converters and calls <code>canRead(type, contentType)</code>; the first match runs <code>read</code>.</li><li><b>Writing:</b> for the return value it computes producible media types, intersects them with the Accept header, then calls <code>canWrite</code> and <code>write</code>.</li><li><b>Advice hooks:</b> <code>RequestBodyAdvice</code> and <code>ResponseBodyAdvice</code> run around conversion.</li><li><b>Failure:</b> no reader gives <code>HttpMediaTypeNotSupportedException</code> (415), no writer gives <code>HttpMediaTypeNotAcceptableException</code> (406).</li></ul>`,
            r`public interface HttpMessageConverter<T> {
    boolean canRead(Class<?> clazz, MediaType mediaType);
    boolean canWrite(Class<?> clazz, MediaType mediaType);
    List<MediaType> getSupportedMediaTypes();
    T read(Class<? extends T> clazz, HttpInputMessage in) throws IOException;
    void write(T t, MediaType contentType, HttpOutputMessage out) throws IOException;
}

// OUTPUT:
// (core interface, simplified from spring-web)`],
        [`<p>Writing a custom converter:</p><ul><li><b>Base class:</b> extend <code>AbstractHttpMessageConverter</code>.</li><li><b>Supports:</b> tell which classes it handles and which media types.</li><li><b>Register:</b> a <code>HttpMessageConverters</code> bean in Boot, or <code>extendMessageConverters</code>.</li></ul>`,
            r`class CsvConverter extends AbstractHttpMessageConverter<List<User>> {
    CsvConverter() { super(new MediaType("text", "csv")); }

    @Override protected boolean supports(Class<?> c) { return List.class.isAssignableFrom(c); }

    @Override protected List<User> readInternal(Class<? extends List<User>> c,
            HttpInputMessage in) { throw new UnsupportedOperationException(); }

    @Override protected void writeInternal(List<User> users, HttpOutputMessage out)
            throws IOException {
        String csv = users.stream().map(u -> u.id() + "," + u.name())
            .collect(Collectors.joining("\n"));
        out.getBody().write(csv.getBytes(StandardCharsets.UTF_8));
    }
}

// OUTPUT:
// Accept: text/csv
// 1,Ann
// 2,Baji`],
        [`<p>Common mistakes:</p><ul><li><b>Missing Content-Type:</b> client sends JSON without the header, so no converter matches (415).</li><li><b>Replacing defaults:</b> <code>configureMessageConverters</code> removes the built-in list.</li><li><b>Two JSON libraries:</b> Gson and Jackson both present can change which one wins.</li><li><b>Reading the body twice:</b> the stream is consumed once; cache it with <code>ContentCachingRequestWrapper</code> in filters.</li><li><b>String body JSON:</b> returning a JSON String from <code>@ResponseBody</code> may be quoted by Jackson if its converter runs first.</li></ul>`,
            r`// WRONG: replaces every default converter
@Override
public void configureMessageConverters(List<HttpMessageConverter<?>> l) {
    l.add(new CsvConverter());
}

// RIGHT: keeps the defaults
@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> l) {
    l.add(new CsvConverter());
}

// OUTPUT:
// WRONG -> JSON endpoints fail with 406/415
// RIGHT -> JSON and CSV both work`],
        [`<p>Tuning:</p><ul><li><b>ObjectMapper reuse:</b> converters share one mapper; never create a new one per request.</li><li><b>Streaming:</b> for huge payloads write with <code>StreamingResponseBody</code> or Jackson streaming instead of building one big object.</li><li><b>Compression:</b> <code>server.compression.enabled=true</code> reduces JSON size on the wire.</li><li><b>Fewer converters:</b> a short list means faster <code>canWrite</code> scans (minor).</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.mime-types=application/json,text/csv
server.compression.min-response-size=1024

# OUTPUT:
# Content-Encoding: gzip for responses larger than 1 KB`],
        [`<p>Real project: an export endpoint that serves JSON by default and CSV on request.</p><ul><li><b>Same method:</b> one controller, two representations.</li><li><b>Client choice:</b> the Accept header.</li></ul>`,
            r`@GetMapping(value = "/users",
        produces = { MediaType.APPLICATION_JSON_VALUE, "text/csv" })
List<User> users() {
    return service.findAll();
}

// OUTPUT:
// Accept: application/json -> [{"id":1,"name":"Ann"},{"id":2,"name":"Baji"}]
// Accept: text/csv         -> 1,Ann
//                             2,Baji`]
    ),
    'mvc-jackson-interview': dv(
        [`<p>How Jackson works inside Spring MVC:</p><ul><li><b>Bean:</b> <code>JacksonAutoConfiguration</code> builds an <code>ObjectMapper</code> with <code>Jackson2ObjectMapperBuilder</code>.</li><li><b>Converter:</b> <code>MappingJackson2HttpMessageConverter</code> wraps that mapper.</li><li><b>Serialization:</b> reflection (cached) finds getters or fields and writes tokens with a <code>JsonGenerator</code>.</li><li><b>Deserialization:</b> a <code>JsonParser</code> reads tokens; Jackson needs a default constructor or a record/creator constructor.</li><li><b>Modules:</b> found through <code>ServiceLoader</code> and Boot beans (JavaTime, Jdk8, ParameterNames).</li></ul>`,
            r`@Autowired ObjectMapper mapper;

@PostConstruct
void check() throws Exception {
    System.out.println(mapper.writeValueAsString(LocalDate.of(2025, 3, 1)));
}

// OUTPUT:
// "2025-03-01"`],
        [`<p>Useful configuration:</p><ul><li><b>Properties:</b> <code>spring.jackson.serialization.indent-output</code>, <code>spring.jackson.time-zone</code>, <code>spring.jackson.deserialization.fail-on-unknown-properties</code>.</li><li><b>Annotations:</b> <code>@JsonInclude</code>, <code>@JsonAlias</code>, <code>@JsonCreator</code>, <code>@JsonView</code>, <code>@JsonTypeInfo</code>.</li><li><b>Custom:</b> <code>JsonSerializer</code> or <code>@JsonComponent</code>.</li></ul>`,
            r`@JsonComponent
class MoneySerializer extends JsonSerializer<BigDecimal> {
    @Override
    public void serialize(BigDecimal v, JsonGenerator g, SerializerProvider p)
            throws IOException {
        g.writeString(v.setScale(2, RoundingMode.HALF_UP).toPlainString());
    }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
record Price(String item, BigDecimal amount, String note) {}

// OUTPUT:
// {"item":"pen","amount":"2.50"}      (note is null, so it is omitted)`],
        [`<p>Common mistakes:</p><ul><li><b>No default constructor:</b> a class with only an args constructor fails to deserialize; use a record or <code>@JsonCreator</code>.</li><li><b>Own ObjectMapper bean:</b> a plain <code>new ObjectMapper()</code> bean loses Boot settings and the JavaTime module.</li><li><b>Lazy entities:</b> serializing a Hibernate proxy throws or triggers queries.</li><li><b>Cycles:</b> parent and child referencing each other cause <code>StackOverflowError</code>.</li><li><b>Money as double:</b> precision loss; use <code>BigDecimal</code> as a string.</li></ul>`,
            r`// WRONG: loses Boot defaults
@Bean ObjectMapper om() { return new ObjectMapper(); }

// RIGHT: customize the builder
@Bean
Jackson2ObjectMapperBuilderCustomizer custom() {
    return b -> b.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                 .serializationInclusion(JsonInclude.Include.NON_NULL);
}

// OUTPUT:
// WRONG -> LocalDate fails: "Java 8 date/time type not supported by default"
// RIGHT -> "2025-03-01"`],
        [`<p>Performance:</p><ul><li><b>Reuse the mapper:</b> it caches serializers; creating one per call is slow.</li><li><b>Smaller payloads:</b> omit nulls, use DTOs with only needed fields, enable compression.</li><li><b>Streaming API:</b> <code>JsonGenerator</code> for very large output.</li><li><b>Afterburner:</b> modules that generate bytecode accessors can speed up hot paths; measure first.</li></ul>`,
            r`ObjectMapper om = new ObjectMapper().registerModule(new JavaTimeModule());
try (JsonGenerator g = om.getFactory().createGenerator(out)) {
    g.writeStartArray();
    for (Row row : rows) {            // one row at a time, constant memory
        g.writeObject(row);
    }
    g.writeEndArray();
}

// OUTPUT:
// [{"id":1},{"id":2}, ...]   (memory stays flat for millions of rows)`],
        [`<p>Real project: an API must keep field names stable while the Java model changes.</p><ul><li><b>@JsonProperty:</b> pins the public name.</li><li><b>@JsonAlias:</b> accepts old names on input.</li><li><b>DTOs:</b> separate from entities.</li></ul>`,
            r`public record CustomerDto(
    @JsonProperty("customer_id") long id,
    @JsonAlias({ "fullName", "full_name" }) String name,
    @JsonInclude(JsonInclude.Include.NON_EMPTY) List<String> tags) {}

// OUTPUT:
// in : {"customer_id":1,"full_name":"Ann"}
// out: {"customer_id":1,"name":"Ann"}`]
    ),
    'mvc-content-negotiation-interview': dv(
        [`<p>The negotiation algorithm in <code>AbstractMessageConverterMethodProcessor.writeWithMessageConverters</code>:</p><ul><li><b>Requested types:</b> <code>ContentNegotiationManager</code> returns the list from Accept (sorted by quality).</li><li><b>Producible types:</b> from the mapping <code>produces</code> or from converters that can write the return type.</li><li><b>Select:</b> compatible pairs are sorted by specificity and quality; the first concrete type wins.</li><li><b>None:</b> throws <code>HttpMediaTypeNotAcceptableException</code> (406).</li></ul>`,
            r`@GetMapping("/data")
Map<String, Integer> data() { return Map.of("a", 1); }

// OUTPUT:
// Accept: application/json                    -> {"a":1}
// Accept: */*                                 -> {"a":1}  (first converter that can write)
// Accept: application/xml (no XML module)     -> 406`],
        [`<p>Options:</p><ul><li><b>Header (default):</b> Accept.</li><li><b>Parameter:</b> <code>favorParameter(true)</code> with <code>?format=json</code> (mediaType mapping needed).</li><li><b>Default type:</b> <code>defaultContentType</code> used when the client sends none.</li><li><b>Media types map:</b> <code>mediaType(&quot;xml&quot;, MediaType.APPLICATION_XML)</code> style registration.</li><li><b>Boot property:</b> <code>spring.mvc.contentnegotiation.favor-parameter=true</code>.</li></ul>`,
            r`# application.properties
spring.mvc.contentnegotiation.favor-parameter=true
spring.mvc.contentnegotiation.parameter-name=format
spring.mvc.contentnegotiation.media-types.xml=application/xml
spring.mvc.contentnegotiation.media-types.csv=text/csv

# OUTPUT:
# GET /users?format=csv -> text/csv body
# GET /users?format=xml -> application/xml body`],
        [`<p>Common mistakes:</p><ul><li><b>XML module missing:</b> asking for XML gives 406 until <code>jackson-dataformat-xml</code> is added.</li><li><b>Path extension:</b> <code>/users.json</code> no longer works in Spring 6.</li><li><b>produces too narrow:</b> a mapping with only JSON rejects <code>Accept: text/html</code> from a browser.</li><li><b>Confusing headers:</b> Accept chooses the response; Content-Type describes the request body.</li><li><b>No Vary header:</b> a shared cache may serve JSON to an XML client.</li></ul>`,
            r`// WRONG: browser sending Accept: text/html gets 406
@GetMapping(value = "/page", produces = "application/json")
String page() { return "{}"; }

// RIGHT: allow what clients send
@GetMapping(value = "/page", produces = { "application/json", "text/html" })
String page2() { return "{}"; }

// OUTPUT:
// WRONG -> 406 Not Acceptable
// RIGHT -> 200`],
        [`<p>Tuning and caching:</p><ul><li><b>Few formats:</b> every supported format adds code to test.</li><li><b>Default type:</b> set it so clients with <code>*/*</code> get a predictable result.</li><li><b>Vary:</b> add <code>Vary: Accept</code>.</li><li><b>Versioning:</b> avoid vendor media types unless you really need them.</li></ul>`,
            r`@GetMapping("/users")
ResponseEntity<List<User>> users() {
    return ResponseEntity.ok()
        .header(HttpHeaders.VARY, HttpHeaders.ACCEPT)
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(1)))
        .body(service.findAll());
}

// OUTPUT:
// Vary: Accept
// Cache-Control: max-age=60`],
        [`<p>Real project: a reporting API that serves JSON to the front end and CSV to finance.</p><ul><li><b>One URL:</b> same path, different Accept.</li><li><b>Tests:</b> cover both and the 406 case.</li></ul>`,
            r`@WebMvcTest(ReportController.class)
class ReportNegotiationTest {
    @Autowired MockMvc mvc;

    @Test
    void json() throws Exception {
        mvc.perform(get("/reports").accept(MediaType.APPLICATION_JSON))
           .andExpect(content().contentTypeCompatibleWith("application/json"));
    }

    @Test
    void csv() throws Exception {
        mvc.perform(get("/reports").accept("text/csv"))
           .andExpect(content().contentTypeCompatibleWith("text/csv"));
    }

    @Test
    void pdfNotSupported() throws Exception {
        mvc.perform(get("/reports").accept("application/pdf"))
           .andExpect(status().isNotAcceptable());
    }
}

// OUTPUT:
// Tests run: 3, Failures: 0, Errors: 0`]
    ),
    'mvc-cors': dv(
        [`<p>CORS is enforced by the browser; the server only sends permission headers.</p><ul><li><b>Simple request:</b> the browser sends it and checks <code>Access-Control-Allow-Origin</code> in the response.</li><li><b>Preflight:</b> <code>OPTIONS</code> with <code>Origin</code>, <code>Access-Control-Request-Method</code> and <code>-Headers</code>.</li><li><b>Spring:</b> <code>AbstractHandlerMapping</code> detects a CORS request and uses <code>CorsConfiguration</code> from the mapping, then <code>DefaultCorsProcessor</code> writes the headers.</li><li><b>Short-circuit:</b> a valid preflight is answered by the mapping itself; the controller is not called.</li></ul>`,
            r`OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type

// OUTPUT:
// HTTP/1.1 200
// Access-Control-Allow-Origin: https://app.example.com
// Access-Control-Allow-Methods: PUT
// Access-Control-Allow-Headers: content-type
// Vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers`],
        [`<p>Ways to configure:</p><ul><li><b>@CrossOrigin:</b> per class or method.</li><li><b>addCorsMappings:</b> global, path based.</li><li><b>CorsConfigurationSource bean:</b> used by Spring Security and <code>CorsFilter</code>.</li><li><b>Patterns:</b> <code>allowedOriginPatterns(&quot;https://*.example.com&quot;)</code> style.</li><li><b>Options:</b> <code>allowedHeaders</code>, <code>exposedHeaders</code>, <code>allowCredentials</code>, <code>maxAge</code>.</li></ul>`,
            r`@Bean
CorsConfigurationSource corsSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOriginPatterns(List.of("https://*.example.com"));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    c.setExposedHeaders(List.of("Location"));
    c.setAllowCredentials(true);
    c.setMaxAge(Duration.ofHours(1));
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/api/**", c);
    return s;
}

// OUTPUT:
// /api/** accepts calls from any subdomain of example.com with cookies`],
        [`<p>Common mistakes:</p><ul><li><b>Wildcard with credentials:</b> not allowed; use origin patterns.</li><li><b>Security filter blocks preflight:</b> enable <code>http.cors()</code>.</li><li><b>Custom header not allowed:</b> add it to <code>allowedHeaders</code>.</li><li><b>Header not readable by JS:</b> add it to <code>exposedHeaders</code>.</li><li><b>Treating CORS as security:</b> it does not stop non-browser clients; still authenticate.</li><li><b>Trailing slash in origin:</b> <code>https://a.com/</code> does not match <code>https://a.com</code>.</li></ul>`,
            r`// WRONG
reg.addMapping("/**").allowedOrigins("*").allowCredentials(true);

// RIGHT
reg.addMapping("/**").allowedOriginPatterns("https://*.example.com")
   .allowCredentials(true);

// OUTPUT:
// WRONG -> IllegalArgumentException: allowCredentials cannot be true with allowedOrigins "*"
// RIGHT -> works`],
        [`<p>Tuning:</p><ul><li><b>maxAge:</b> lets browsers cache the preflight, so fewer OPTIONS calls (browsers cap the value).</li><li><b>Narrow mappings:</b> enable CORS only on <code>/api/**</code>.</li><li><b>Same origin:</b> serving the front end and API from one origin or behind one reverse proxy avoids CORS completely.</li></ul>`,
            r`reg.addMapping("/api/**")
   .allowedOrigins("https://app.example.com")
   .maxAge(7200);

// OUTPUT:
// Access-Control-Max-Age: 7200   (browser skips repeated preflights)`],
        [`<p>Real project: React front end on port 3000 calling a Boot API on 8080 in development; in production both sit behind one domain.</p><ul><li><b>Profile based:</b> allowed origins come from a property.</li><li><b>Production:</b> no CORS rules needed with a reverse proxy.</li></ul>`,
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    private final String[] origins;

    WebConfig(@Value("$" + "{app.cors.origins:}") String[] origins) {
        this.origins = origins;
    }

    @Override
    public void addCorsMappings(CorsRegistry reg) {
        if (origins.length > 0) {
            reg.addMapping("/api/**").allowedOrigins(origins);
        }
    }
}

# application-dev.properties
# app.cors.origins=http://localhost:3000

// OUTPUT:
// dev  -> CORS headers for http://localhost:3000
// prod -> no CORS mapping registered`]
    ),
    'mvc-csrf-interview': dv(
        [`<p>The attack and the defense:</p><ul><li><b>Attack:</b> a page on evil.com contains a hidden form posting to bank.com; the browser adds the bank cookie, so the request looks real.</li><li><b>Token:</b> <code>CsrfFilter</code> loads the expected token from a <code>CsrfTokenRepository</code> (session by default) and compares it with the header or parameter.</li><li><b>Why it works:</b> same-origin policy stops evil.com from reading the token.</li><li><b>Failure:</b> <code>AccessDeniedHandler</code> returns 403.</li><li><b>Spring Security 6:</b> tokens are deferred and masked per request to resist BREACH.</li></ul>`,
            r`<form action="https://bank.example/transfer" method="post">
    <input type="hidden" name="to" value="attacker"/>
    <input type="hidden" name="amount" value="1000"/>
</form>
<script>document.forms[0].submit();
</script>

// OUTPUT:
// Without CSRF protection: transfer succeeds using the victim cookie
// With CSRF protection: 403 Forbidden (no valid token)`],
        [`<p>Configuration options:</p><ul><li><b>Default:</b> enabled, session-backed token.</li><li><b>Cookie repository:</b> <code>CookieCsrfTokenRepository</code> for SPAs.</li><li><b>Ignore paths:</b> <code>ignoringRequestMatchers(&quot;/webhooks/**&quot;)</code> style for third-party callbacks.</li><li><b>Disable:</b> <code>csrf(c -&gt; c.disable())</code> for stateless APIs only.</li><li><b>Header name:</b> <code>X-CSRF-TOKEN</code> or, with the cookie repository, <code>X-XSRF-TOKEN</code>.</li></ul>`,
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(c -> c
        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
        .ignoringRequestMatchers("/webhooks/**"));
    return http.build();
}

// OUTPUT:
// Set-Cookie: XSRF-TOKEN=... ; Path=/
// POST /orders with header X-XSRF-TOKEN -> 200
// POST /webhooks/pay (no token) -> 200`],
        [`<p>Common mistakes:</p><ul><li><b>Disabling globally</b> because of a 403 during development, then forgetting it.</li><li><b>State change on GET:</b> GET is not checked, so a link can trigger it.</li><li><b>Missing token in AJAX:</b> forgetting the header causes 403.</li><li><b>JWT in a cookie:</b> if the browser sends it automatically you are back to needing CSRF protection.</li><li><b>Misreading the 403:</b> the cause is often a missing token, not a role problem.</li></ul>`,
            r`// WRONG: data change on GET
@GetMapping("/delete/{id}")
String del(@PathVariable long id) {
    repo.deleteById(id);
    return "ok";
}

// RIGHT
@DeleteMapping("/items/{id}")
ResponseEntity<Void> del2(@PathVariable long id) {
    repo.deleteById(id);
    return ResponseEntity.noContent().build();
}

// OUTPUT:
// WRONG -> an image tag on another site can delete data
// RIGHT -> DELETE needs a CSRF token`],
        [`<p>Operational notes:</p><ul><li><b>Cost:</b> token checks are cheap; the session lookup is the main cost.</li><li><b>Clusters:</b> with the session repository, share sessions or use the cookie repository.</li><li><b>SameSite=Lax/Strict</b> cookies reduce risk further.</li><li><b>Logging:</b> log CSRF rejections at WARN to spot attacks.</li></ul>`,
            r`# application.properties
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true

# OUTPUT:
# Set-Cookie: JSESSIONID=...;
Secure;
HttpOnly;
SameSite=Lax`],
        [`<p>Real project: one app with server-rendered admin pages (CSRF on) and a public mobile API (CSRF off, bearer tokens).</p><ul><li><b>Two chains:</b> ordered with <code>@Order</code>.</li><li><b>Tests:</b> verify 403 without token and 200 with it.</li></ul>`,
            r`@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));
    return http.build();
}

@Bean @Order(2)
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());       // CSRF stays on
    return http.build();
}

// OUTPUT:
// POST /api/orders (Bearer token)      -> 200, no CSRF token needed
// POST /admin/users (session, no token) -> 403`]
    ),
    'mvc-session-vs-stateless': dv(
        [`<p>How each style works:</p><ul><li><b>Session:</b> the container creates an <code>HttpSession</code> and stores the id in the <code>JSESSIONID</code> cookie; later requests find the server object by that id.</li><li><b>Spring Security:</b> <code>SecurityContextHolderFilter</code> loads the security context from the session.</li><li><b>Stateless:</b> a filter reads the <code>Authorization</code> header, verifies the token signature and builds the authentication for that request only.</li><li><b>Nothing kept:</b> no server memory per user.</li></ul>`,
            r`Session flow:
POST /login            -> Set-Cookie: JSESSIONID=abc
GET  /profile + cookie -> server finds session abc -> user Ann

Stateless flow:
POST /token            -> {"access_token":"eyJ..."}
GET  /profile + Authorization: Bearer eyJ... -> signature verified -> user Ann

// OUTPUT:
// Session: server remembers Ann
// Stateless: the token itself proves Ann`],
        [`<p>Variants and options:</p><ul><li><b>Session policies:</b> <code>ALWAYS</code>, <code>IF_REQUIRED</code> (default), <code>NEVER</code>, <code>STATELESS</code>.</li><li><b>Session timeout:</b> <code>server.servlet.session.timeout</code>.</li><li><b>Fixation protection:</b> new session id after login.</li><li><b>Concurrency limit:</b> <code>maximumSessions(1)</code>.</li><li><b>Spring Session:</b> Redis, JDBC or Hazelcast stores.</li><li><b>Tokens:</b> opaque tokens checked by introspection, or self-contained JWT.</li></ul>`,
            r`http.sessionManagement(s -> s
    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
    .sessionFixation(f -> f.changeSessionId())
    .maximumSessions(1));

// OUTPUT:
// A second login from another browser expires the first session`],
        [`<p>Common mistakes:</p><ul><li><b>Storing big objects in the session:</b> memory grows per user.</li><li><b>Non-serializable session data</b> with a shared store fails.</li><li><b>Long-lived JWT with no revocation.</b></li><li><b>Sensitive data inside JWT:</b> the payload is only encoded, not encrypted.</li><li><b>Stateless config but still a session:</b> some code calls <code>request.getSession()</code> and creates one.</li><li><b>Sticky sessions as the only plan:</b> a node failure loses users.</li></ul>`,
            r`// WRONG: large mutable object in session
session.setAttribute("allOrders", orderRepo.findAll());

// RIGHT: keep ids only, load when needed
session.setAttribute("cartId", cart.getId());

// OUTPUT:
// WRONG -> memory and replication cost grow with every user
// RIGHT -> small session, easy to replicate`],
        [`<p>Performance trade-offs:</p><ul><li><b>Session:</b> fast lookup, but memory per user and replication traffic.</li><li><b>Stateless:</b> CPU for signature check on each call (small), bigger headers.</li><li><b>Short access token + refresh token</b> keeps risk and load balanced.</li><li><b>Redis sessions:</b> add a network hop per request; keep attributes small.</li></ul>`,
            r`# application.properties
server.servlet.session.timeout=15m
spring.session.redis.flush-mode=on-save
spring.session.redis.namespace=shop:sessions

# OUTPUT:
# Session writes are batched at the end of the request`],
        [`<p>Real project: a shop with a browser site and a mobile app.</p><ul><li><b>Site:</b> server sessions with Redis, so any instance serves the user.</li><li><b>Mobile API:</b> stateless JWT with refresh tokens.</li><li><b>Tests:</b> assert the API never creates a session.</li></ul>`,
            r`@Test
void apiIsStateless() throws Exception {
    MvcResult res = mvc.perform(get("/api/orders").with(jwt()))
        .andExpect(status().isOk())
        .andReturn();
    assertThat(res.getRequest().getSession(false)).isNull();
    assertThat(res.getResponse().getHeader("Set-Cookie")).isNull();
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),
    'mvc-mvc-vs-rest': dv(
        [`<p>Both styles share the same request flow.</p><ul><li><b>DispatcherServlet:</b> finds the handler through <code>HandlerMapping</code> and runs it with <code>RequestMappingHandlerAdapter</code>.</li><li><b>MVC return:</b> a <code>String</code> or <code>ModelAndView</code> goes to <code>ViewResolver</code>, then the view renders HTML.</li><li><b>REST return:</b> with <code>@ResponseBody</code> the value goes to an <code>HttpMessageConverter</code> and the request ends there (no view).</li><li><b>Error path:</b> pages render an error view; APIs write an error body.</li></ul>`,
            r`Browser:  GET /home
  DispatcherServlet -> PageController.home() -> "home"
  -> ThymeleafViewResolver -> home.html -> HTML

Client:   GET /api/user
  DispatcherServlet -> ApiController.user() -> Map
  -> MappingJackson2HttpMessageConverter -> JSON

// OUTPUT:
// MVC  -> text/html
// REST -> application/json`],
        [`<p>Mixing styles:</p><ul><li><b>@Controller + @ResponseBody</b> on single methods.</li><li><b>@RestController</b> for a whole class.</li><li><b>ResponseEntity</b> for REST status control.</li><li><b>Redirect:</b> <code>return &quot;redirect:/home&quot;</code> belongs to MVC pages.</li><li><b>Model:</b> only used with views.</li><li><b>REST maturity:</b> resources as nouns, HTTP verbs, status codes, and optionally links (HATEOAS).</li></ul>`,
            r`@Controller
@RequestMapping("/products")
class ProductPages {
    @GetMapping
    String list(Model model) {
        model.addAttribute("products", service.findAll());
        return "products/list";
    }

    @PostMapping
    String create(@ModelAttribute ProductForm form) {
        service.save(form);
        return "redirect:/products";       // post-redirect-get
    }
}

@RestController
@RequestMapping("/api/products")
class ProductApi {
    @GetMapping List<Product> list() { return service.findAll(); }

    @PostMapping ResponseEntity<Product> create(@RequestBody Product p) {
        return ResponseEntity.status(201).body(service.save(p));
    }
}

// OUTPUT:
// POST /products     -> 302 Location: /products
// POST /api/products -> 201 {"id":1,...}`],
        [`<p>Common mistakes:</p><ul><li><b>@Controller returning data without @ResponseBody:</b> Spring looks for a view with that name and fails with a template error or 404.</li><li><b>@RestController returning a view name:</b> the client just gets the text.</li><li><b>Wrong errors:</b> HTML error pages sent to API clients.</li><li><b>Entities as API model:</b> couples clients to the database.</li><li><b>Verbs in URLs:</b> <code>/getUsers</code> instead of <code>GET /users</code>.</li></ul>`,
            r`// WRONG: client receives the plain text "home", not a page
@RestController
class Wrong {
    @GetMapping("/home") String home() { return "home"; }
}

// RIGHT
@Controller
class Right {
    @GetMapping("/home") String home() { return "home"; }
}

// OUTPUT:
// WRONG -> body: home
// RIGHT -> rendered home.html`],
        [`<p>Performance and design notes:</p><ul><li><b>REST:</b> small JSON, easy to cache with ETag, good for horizontal scaling because it is stateless.</li><li><b>Server rendered pages:</b> fast first paint, work without JavaScript, but use server CPU per view.</li><li><b>Template cache:</b> keep <code>spring.thymeleaf.cache=true</code> in production.</li><li><b>Pagination:</b> never return unbounded lists from an API.</li></ul>`,
            r`@GetMapping("/api/products")
Page<ProductDto> page(@PageableDefault(size = 20) Pageable p) {
    return service.page(p).map(ProductDto::from);
}

# application-prod.properties
# spring.thymeleaf.cache=true

// OUTPUT:
// GET /api/products?page=0&size=20 -> {"content":[...20 items...],"totalElements":135}`],
        [`<p>Real project: an admin back office rendered on the server and a public JSON API for mobile, in one Spring Boot app.</p><ul><li><b>Packages:</b> <code>web</code> for pages, <code>api</code> for REST.</li><li><b>Advice:</b> a page advice for views and a REST advice limited to the api package.</li><li><b>Security:</b> forms login and CSRF for pages, tokens for the API.</li></ul>`,
            r`@ControllerAdvice(basePackages = "com.shop.web")
class PageErrors {
    @ExceptionHandler(Exception.class)
    String error(Exception e, Model m) {
        m.addAttribute("message", "Something went wrong");
        return "error";                       // HTML error page
    }
}

@RestControllerAdvice(basePackages = "com.shop.api")
class ApiErrors {
    @ExceptionHandler(Exception.class)
    ProblemDetail error(Exception e) {
        return ProblemDetail.forStatusAndDetail(500, "Unexpected error");
    }
}

// OUTPUT:
// /admin/... failure -> HTML error page
// /api/...   failure -> {"status":500,"detail":"Unexpected error"}`]
    )
};
