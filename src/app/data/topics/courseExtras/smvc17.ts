// Spring extras, batch smvc17 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc17Extras: Record<string, Extra> = {
    'mvc-httpmessageconverter': x(
        ['<b>HttpMessageConverter</b> is the Spring interface that turns an HTTP request body into a Java object and a Java object into a response body.',
            '<b>Where it is used</b>: <code>@RequestBody</code>, <code>@ResponseBody</code>, <code>@RestController</code>, <code>HttpEntity</code> and <code>ResponseEntity</code> all go through converters.',
            '<b>Selection</b> depends on the Java type and the media type, such as <code>application/json</code> or <code>text/plain</code>.'],
        ['<b>Key methods</b>: <code>canRead</code>, <code>canWrite</code>, <code>getSupportedMediaTypes</code>, <code>read</code> and <code>write</code>.',
            '<b>Defaults</b>: Spring MVC registers String, byte array, Resource, form and (when on the classpath) Jackson JSON and XML converters.',
            '<b>Not for views</b>: converters bypass the ViewResolver; the body is written straight to the response.'],
        ['<b>Order matters</b>: the first converter whose <code>canWrite</code> returns true wins, so a broad custom converter can hide the Jackson one.',
            '<b>Customizing</b>: use <code>extendMessageConverters</code> in <code>WebMvcConfigurer</code> to keep defaults, and <code>configureMessageConverters</code> only when you want to replace them.',
            '<b>Errors</b>: no reader gives 415, no writer gives 406, and an unreadable body gives 400.'],
        [['F', 'What does HttpMessageConverter do?', 'It converts between the HTTP body and Java objects in both directions.'],
            ['F', 'Which annotations trigger converters?', '@RequestBody and @ResponseBody, which @RestController applies to every handler method.'],
            ['M', 'How does Spring pick a converter?', 'It loops over the registered converters and uses the first that supports the Java type and the media type.'],
            ['M', 'What status do you get for an unsupported Content-Type?', '415 Unsupported Media Type.'],
            ['S', 'How do you add a custom converter without losing the defaults?', 'Override extendMessageConverters in a WebMvcConfigurer.'],
            ['S', 'Why can a custom converter break JSON output?', 'If it is registered first and its canWrite is too broad, it wins before the Jackson converter is asked.']],
        [['A tiny controller that relies on converters.',
            r`@RestController
@RequestMapping("/api/books")
public class BookController {
    @PostMapping
    public Book create(@RequestBody Book book) {   // JSON -> Book
        return book;                               // Book -> JSON
    }
}
record Book(String title, int pages) {}

// OUTPUT:
// POST /api/books  {"title":"Spring","pages":300}
// 200 OK  Content-Type: application/json
// {"title":"Spring","pages":300}`],
            ['List the registered converters.',
                r`@Component
class ConverterPrinter implements CommandLineRunner {
    private final RequestMappingHandlerAdapter adapter;
    ConverterPrinter(RequestMappingHandlerAdapter adapter) { this.adapter = adapter; }
    public void run(String... args) {
        adapter.getMessageConverters().forEach(c ->
            System.out.println(c.getClass().getSimpleName()));
    }
}

// OUTPUT: (varies by classpath)
// ByteArrayHttpMessageConverter
// StringHttpMessageConverter
// ResourceHttpMessageConverter
// AllEncompassingFormHttpMessageConverter
// MappingJackson2HttpMessageConverter`]],
        [['Extend the converters.',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> list) {
        list.add(new StringHttpMessageConverter(StandardCharsets.UTF_8));
    }
}

// OUTPUT:
// defaults stay registered; the new converter is appended to the list`],
            ['Test the conversion with MockMvc.',
                r`@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;
    @Test
    void echoes() throws Exception {
        mvc.perform(post("/api/books").contentType("application/json")
                .content("{\"title\":\"Spring\",\"pages\":300}"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.title").value("Spring"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-mappingjackson2httpmessageconverter': x(
        ['<b>MappingJackson2HttpMessageConverter</b> is the converter that reads and writes JSON using the Jackson <code>ObjectMapper</code>.',
            '<b>Media types</b>: it supports <code>application/json</code> and <code>application/*+json</code>.',
            '<b>Automatic</b>: it is registered when Jackson is on the classpath, and Spring Boot gives it a pre-configured <code>ObjectMapper</code>.'],
        ['<b>Read side</b>: <code>@RequestBody</code> JSON is deserialized into the target type, and bad JSON gives 400.',
            '<b>Write side</b>: the return value is serialized, with <code>Content-Type: application/json</code>.',
            '<b>Customizing</b>: use annotations like <code>@JsonProperty</code>, <code>@JsonIgnore</code>, <code>@JsonFormat</code>, or Boot properties under <code>spring.jackson</code>.'],
        ['<b>Shared ObjectMapper</b>: the same bean is used for the converter, so register modules (such as JavaTimeModule) as beans and Boot picks them up.',
            '<b>Unknown properties</b>: Boot disables <code>FAIL_ON_UNKNOWN_PROPERTIES</code>, plain Spring does not.',
            '<b>Lazy entities</b>: serializing JPA proxies can fail or trigger queries, so return DTOs.'],
        [['F', 'What does MappingJackson2HttpMessageConverter do?', 'It converts JSON to Java objects and Java objects to JSON using Jackson.'],
            ['F', 'Do you need to register it in Spring Boot?', 'No, it is auto-registered when Jackson is on the classpath.'],
            ['M', 'How do you change the date format globally?', 'Set spring.jackson.date-format or configure the ObjectMapper bean or a Jackson2ObjectMapperBuilderCustomizer.'],
            ['M', 'What happens with malformed JSON?', 'Jackson throws, Spring wraps it in HttpMessageNotReadableException, and the response is 400.'],
            ['S', 'How do you supply your own ObjectMapper in Boot?', 'Declare an ObjectMapper bean or a customizer; Boot backs off its default.'],
            ['S', 'Why does exposing entities as JSON cause trouble?', 'Lazy proxies, cycles and leaking fields; use DTOs or Jackson views.']],
        [['Custom field names and ignored fields.',
            r`public class UserDto {
    @JsonProperty("user_name") public String name;
    @JsonIgnore public String password;
    @JsonFormat(pattern = "yyyy-MM-dd") public LocalDate joined;
}

// OUTPUT:
// {"user_name":"Abaji","joined":"2024-05-01"}`],
            ['Boot properties for Jackson.',
                r`spring.jackson.property-naming-strategy=SNAKE_CASE
spring.jackson.default-property-inclusion=non_null
spring.jackson.serialization.write-dates-as-timestamps=false

# OUTPUT:
# {"first_name":"Abaji","created_at":"2024-05-01T10:15:30"}
(null fields omitted)`]],
        [['Define your own converter bean.',
            r`@Bean
MappingJackson2HttpMessageConverter jsonConverter() {
    ObjectMapper om = new ObjectMapper().registerModule(new JavaTimeModule());
    om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    return new MappingJackson2HttpMessageConverter(om);
}

// OUTPUT:
// Boot adds this converter to the list and uses it for JSON bodies`],
            ['Test the JSON output.',
                r`@WebMvcTest(UserController.class)
class UserJsonTest {
    @Autowired MockMvc mvc;
    @Test
    void renamesField() throws Exception {
        mvc.perform(get("/users/1"))
           .andExpect(jsonPath("$.user_name").value("Abaji"))
           .andExpect(jsonPath("$.password").doesNotExist());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-responseentity': x(
        ['<b>ResponseEntity</b> represents the whole HTTP response: status code, headers and body, returned from a controller method.',
            '<b>Use it</b> when the status or headers depend on the result, for example 201 with a Location header or 404 when nothing is found.',
            '<b>Generic</b>: <code>ResponseEntity&lt;T&gt;</code> where T is the body type, and the body is converted by an <code>HttpMessageConverter</code>.'],
        ['<b>Builders</b>: <code>ResponseEntity.ok(body)</code>, <code>created(uri)</code>, <code>noContent()</code>, <code>notFound()</code> and <code>status(code)</code>.',
            '<b>Headers</b>: add them with <code>.header(name, value)</code> or <code>HttpHeaders</code>.',
            '<b>Versus @ResponseBody</b>: plain <code>@ResponseBody</code> always returns 200 unless you use <code>@ResponseStatus</code>.'],
        ['<b>Handled by</b> <code>HttpEntityMethodProcessor</code>, which writes status and headers, then the body through a converter.',
            '<b>Optional</b>: map it with <code>optional.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build())</code>.',
            '<b>Prefer exceptions</b> with <code>@ControllerAdvice</code> for errors, so success paths stay clean.'],
        [['F', 'What is ResponseEntity?', 'A class that carries status, headers and body of an HTTP response.'],
            ['F', 'How do you return 404 with no body?', 'ResponseEntity.notFound().build().'],
            ['M', 'How do you return 201 Created with a Location header?', 'ResponseEntity.created(uri).body(saved).'],
            ['M', 'ResponseEntity versus @ResponseStatus?', '@ResponseStatus is fixed at compile time; ResponseEntity decides at runtime.'],
            ['S', 'Which component handles a ResponseEntity return value?', 'HttpEntityMethodProcessor, which uses the message converters for the body.'],
            ['S', 'How do you stream a file with ResponseEntity?', 'Return ResponseEntity&lt;Resource&gt; with Content-Disposition and Content-Type headers.']],
        [['Create returns 201 and Location.',
            r`@PostMapping("/users")
public ResponseEntity<User> create(@RequestBody User u) {
    User saved = service.save(u);
    URI uri = URI.create("/users/" + saved.getId());
    return ResponseEntity.created(uri).body(saved);
}

// OUTPUT:
// HTTP/1.1 201 Created
// Location: /users/7
// {"id":7,"name":"Abaji"}`],
            ['Find returns 200 or 404.',
                r`@GetMapping("/users/{id}")
public ResponseEntity<User> find(@PathVariable long id) {
    return service.find(id)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
}

// OUTPUT:
// GET /users/7   -> 200 {"id":7,"name":"Abaji"}
// GET /users/99  -> 404 (empty body)`]],
        [['Custom headers.',
            r`@GetMapping("/ping")
public ResponseEntity<String> ping() {
    return ResponseEntity.ok()
        .header("X-Request-Id", "abc-123")
        .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS))
        .body("pong");
}

// OUTPUT:
// HTTP/1.1 200 OK
// X-Request-Id: abc-123
// Cache-Control: max-age=60
// pong`],
            ['Test status and headers.',
                r`@Test
void createReturns201() throws Exception {
    mvc.perform(post("/users").contentType("application/json")
            .content("{\"name\":\"Abaji\"}"))
       .andExpect(status().isCreated())
       .andExpect(header().string("Location", "/users/7"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-http-status-codes': x(
        ['<b>HTTP status codes</b> are three-digit numbers that tell the client the result: 2xx success, 3xx redirect, 4xx client error, 5xx server error.',
            '<b>Common REST codes</b>: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error.',
            '<b>In Spring</b> set them with <code>ResponseEntity</code>, <code>@ResponseStatus</code> or <code>ResponseStatusException</code>, using the <code>HttpStatus</code> enum.'],
        ['<b>401 versus 403</b>: 401 means not authenticated, 403 means authenticated but not allowed.',
            '<b>400 versus 422</b>: 400 for malformed requests, 422 for well-formed but invalid data; many APIs use 400 for both.',
            '<b>204</b> is the usual answer to a successful DELETE or PUT with no body.'],
        ['<b>Defaults</b>: validation failure gives 400, missing converter gives 415 or 406, unknown URL gives 404, wrong method gives 405.',
            '<b>Central mapping</b>: translate exceptions to statuses in one <code>@RestControllerAdvice</code>.',
            '<b>HttpStatus</b> is an enum; in Spring 6 <code>HttpStatusCode</code> also allows custom numeric codes.'],
        [['F', 'What does 201 mean?', 'Created: a new resource was made, usually with a Location header.'],
            ['F', 'Difference between 4xx and 5xx?', '4xx means the client made a mistake; 5xx means the server failed.'],
            ['M', '401 versus 403?', '401 is missing or invalid credentials; 403 is valid credentials without permission.'],
            ['M', 'How do you throw a 404 from a service?', 'throw new ResponseStatusException(HttpStatus.NOT_FOUND) or a custom exception mapped by an advice.'],
            ['S', 'Which status for a duplicate email?', '409 Conflict.'],
            ['S', 'Why should you not return 200 with an error body?', 'Clients, proxies and monitoring rely on the status code, so errors hidden in a 200 break them.']],
        [['Set a status with an annotation.',
            r`@ResponseStatus(HttpStatus.CREATED)
@PostMapping("/orders")
public Order place(@RequestBody Order o) {
    return service.place(o);
}

// OUTPUT:
// HTTP/1.1 201 Created`],
            ['ResponseStatusException.',
                r`@GetMapping("/orders/{id}")
public Order get(@PathVariable long id) {
    return service.find(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
}

// OUTPUT:
// HTTP/1.1 404 Not Found
// {"status":404,"error":"Not Found","message":"Order not found","path":"/orders/9"}`]],
        [['Map exceptions to statuses.',
            r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(DuplicateEmailException.class)
    ResponseEntity<String> dup(DuplicateEmailException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }
}

// OUTPUT:
// HTTP/1.1 409 Conflict
// Email already exists`],
            ['Assert statuses in tests.',
                r`mvc.perform(get("/orders/9")).andExpect(status().isNotFound());
mvc.perform(delete("/orders/1")).andExpect(status().isNoContent());
mvc.perform(post("/orders").content("{}")).andExpect(status().isBadRequest());

// OUTPUT:
// Tests run: 3, Failures: 0`]]
    ),

    'mvc-api-versioning': x(
        ['<b>API versioning</b> lets you change an API without breaking existing clients, by serving old and new behavior side by side.',
            '<b>Common strategies</b>: URI path (<code>/api/v1/users</code>), request parameter, custom header, and media type (content negotiation).',
            '<b>Spring MVC</b> has no single built-in switch in older releases; you map versions with <code>@RequestMapping</code> attributes such as <code>params</code>, <code>headers</code> and <code>produces</code>.'],
        ['<b>URI versioning</b> is the simplest and cache friendly, but the version becomes part of the resource address.',
            '<b>Header versioning</b>: <code>@GetMapping(path = "/users", headers = "X-API-VERSION=2")</code>.',
            '<b>Media type versioning</b>: <code>produces = "application/vnd.app.v2+json"</code>, matched against the Accept header.'],
        ['<b>Only break when needed</b>: adding fields is backward compatible; removing or renaming is a new version.',
            '<b>Share logic</b>: keep one service and map to different DTOs per version, so controllers stay thin.',
            '<b>Deprecation</b>: announce it, add a <code>Deprecation</code> or <code>Sunset</code> header, and track traffic before removal.'],
        [['F', 'Why version an API?', 'So existing clients keep working while the API evolves.'],
            ['F', 'Name two versioning styles.', 'URI path such as /v1/users, and a request header such as X-API-VERSION.'],
            ['M', 'How do you map two versions in Spring MVC?', 'Use different paths, or @GetMapping with params, headers or produces to separate them.'],
            ['M', 'Is adding a JSON field a breaking change?', 'Normally no, tolerant clients ignore new fields.'],
            ['S', 'Trade-off between URI and header versioning?', 'URI is visible and easy to cache and test; headers keep URLs clean but are harder to try in a browser.'],
            ['S', 'How do you avoid duplicating code across versions?', 'Keep one service layer and convert to version-specific DTOs in thin controllers.']],
        [['URI versioning.',
            r`@RestController
@RequestMapping("/api/v1/users")
class UserV1Controller {
    @GetMapping("/{id}")
    UserV1 get(@PathVariable long id) { return new UserV1("Abaji Rao"); }
}
@RestController
@RequestMapping("/api/v2/users")
class UserV2Controller {
    @GetMapping("/{id}")
    UserV2 get(@PathVariable long id) { return new UserV2("Abaji", "Rao"); }
}

// OUTPUT:
// GET /api/v1/users/1 -> {"name":"Abaji Rao"}
// GET /api/v2/users/1 -> {"firstName":"Abaji","lastName":"Rao"}`],
            ['Header versioning.',
                r`@GetMapping(path = "/api/users/{id}", headers = "X-API-VERSION=1")
UserV1 v1(@PathVariable long id) { return new UserV1("Abaji Rao"); }

@GetMapping(path = "/api/users/{id}", headers = "X-API-VERSION=2")
UserV2 v2(@PathVariable long id) { return new UserV2("Abaji", "Rao"); }

// OUTPUT:
// GET /api/users/1  X-API-VERSION: 2 -> {"firstName":"Abaji","lastName":"Rao"}
// no matching header -> 404 or 400 (varies)`]],
        [['Media type versioning.',
            r`@GetMapping(path = "/api/users/{id}",
        produces = "application/vnd.app.v2+json")
UserV2 v2(@PathVariable long id) { ... }

// OUTPUT:
// Accept: application/vnd.app.v2+json -> v2 body
// Accept: application/json            -> falls to another handler (varies)`],
            ['Test both versions.',
                r`mvc.perform(get("/api/v1/users/1"))
   .andExpect(jsonPath("$.name").value("Abaji Rao"));
mvc.perform(get("/api/v2/users/1"))
   .andExpect(jsonPath("$.firstName").value("Abaji"));

// OUTPUT:
// Tests run: 2, Failures: 0`]]
    ),

    'mvc-rest-api-best-practices': x(
        ['<b>REST best practices</b> make an API predictable: nouns for resources, HTTP methods for actions, and correct status codes.',
            '<b>Naming</b>: plural nouns like <code>/users</code>, no verbs in the path, and nesting only one or two levels such as <code>/users/5/orders</code>.',
            '<b>Methods</b>: GET reads, POST creates, PUT replaces, PATCH updates partly, DELETE removes.'],
        ['<b>Status codes</b>: 201 with Location for create, 204 for delete, 404 for missing, 400 for invalid input.',
            '<b>Use DTOs</b> instead of exposing entities, and validate input with <code>@Valid</code>.',
            '<b>Consistent errors</b>: one JSON error shape for the whole API.'],
        ['<b>Idempotency</b>: GET, PUT and DELETE should be safe to repeat; POST is not, so use an idempotency key for payments.',
            '<b>Pagination, sorting, filtering</b> through query parameters, with <code>Pageable</code> and a bounded page size.',
            '<b>Security and caching</b>: HTTPS, authentication, ETag or Cache-Control, rate limiting, and versioning from day one.'],
        [['F', 'Why use plural nouns for URLs?', 'The path names a collection of resources and the HTTP method says the action.'],
            ['F', 'Which method creates a resource?', 'POST, returning 201 Created.'],
            ['M', 'PUT versus PATCH?', 'PUT replaces the whole resource; PATCH changes only the sent fields.'],
            ['M', 'Why not return entities directly?', 'It leaks internal fields, couples the API to the schema and causes lazy loading problems.'],
            ['S', 'What does idempotent mean?', 'Repeating the request gives the same server state as sending it once.'],
            ['S', 'How do you design error responses?', 'One consistent body, for example RFC 9457 ProblemDetail, with the right status code.']],
        [['A clean resource controller.',
            r`@RestController
@RequestMapping("/api/v1/products")
class ProductController {
    @GetMapping Page<ProductDto> list(Pageable p) { return service.page(p); }
    @GetMapping("/{id}") ProductDto get(@PathVariable long id) { return service.get(id); }
    @PostMapping ResponseEntity<ProductDto> create(@Valid @RequestBody ProductDto d) {
        ProductDto s = service.create(d);
        return ResponseEntity.created(URI.create("/api/v1/products/" + s.id())).body(s);
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

// OUTPUT:
// GET /api/v1/products?page=0&size=10 -> 200 page of products
// POST -> 201 + Location    DELETE -> 204`],
            ['Validation with a DTO.',
                r`public record ProductDto(Long id,
        @NotBlank String name,
        @Positive BigDecimal price) {}

// OUTPUT:
// POST {"name":"","price":-1} -> 400
// {"title":"Bad Request","status":400,"detail":"Invalid request content."}`]],
        [['ProblemDetail error body.',
            r`@RestControllerAdvice
class Errors {
    @ExceptionHandler(NotFoundException.class)
    ProblemDetail notFound(NotFoundException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, e.getMessage());
        pd.setTitle("Resource not found");
        return pd;
    }
}

// OUTPUT:
// HTTP/1.1 404
// {"type":"about:blank","title":"Resource not found","status":404,"detail":"Product 9 not found"}`],
            ['Test the contract.',
                r`mvc.perform(post("/api/v1/products").contentType("application/json")
        .content("{\"name\":\"Pen\",\"price\":5}"))
   .andExpect(status().isCreated())
   .andExpect(header().exists("Location"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-what-is-httpmessageconverter': x(
        ['<b>What it is</b>: an <code>HttpMessageConverter&lt;T&gt;</code> reads the HTTP body into an object of type T and writes an object of type T to the body.',
            '<b>Why it exists</b>: controllers should work with Java objects, not raw bytes, so Spring hides the parsing and formatting.',
            '<b>Negotiation</b>: the <code>Content-Type</code> header picks the reader and the <code>Accept</code> header picks the writer.'],
        ['<b>Request flow</b>: <code>Content-Type</code> and the parameter type choose a converter for <code>@RequestBody</code>.',
            '<b>Response flow</b>: the return type and <code>Accept</code> choose a converter for <code>@ResponseBody</code>.',
            '<b>Built in</b>: String, byte[], Resource, form data, JSON (Jackson or Gson), XML (JAXB or Jackson XML).'],
        ['<b>Processor</b>: <code>RequestResponseBodyMethodProcessor</code> asks each converter <code>canRead</code> or <code>canWrite</code>.',
            '<b>Producible types</b>: <code>produces</code> on the mapping narrows what the server offers.',
            '<b>Tell apart</b>: converters handle bodies; <code>Converter</code> and <code>Formatter</code> handle parameters, and <code>HandlerMethodArgumentResolver</code> handles argument binding.'],
        [['F', 'What problem do converters solve?', 'They turn raw HTTP bodies into Java objects and back so controllers stay simple.'],
            ['F', 'Which header selects the response format?', 'The Accept header.'],
            ['M', 'Which header selects how the request body is read?', 'Content-Type.'],
            ['M', 'What is returned if no writer matches Accept?', '406 Not Acceptable.'],
            ['S', 'Which class drives converter selection for @RequestBody?', 'RequestResponseBodyMethodProcessor, through AbstractMessageConverterMethodArgumentResolver.'],
            ['S', 'Converter versus HttpMessageConverter?', 'Converter transforms parameter values, HttpMessageConverter handles whole request and response bodies.']],
        [['Same method, two formats.',
            r`@GetMapping(value = "/info",
        produces = { "application/json", "application/xml" })
public Info info() { return new Info("app", "1.0"); }

// OUTPUT:
// Accept: application/json -> {"name":"app","version":"1.0"}
// Accept: application/xml  -> <Info><name>app</name><version>1.0</version></Info>`],
            ['Raw text body.',
                r`@PostMapping(value = "/echo", consumes = "text/plain")
public String echo(@RequestBody String body) {
    return "got: " + body;
}

// OUTPUT:
// POST /echo  (text/plain) hello
// got: hello`]],
        [['Trace a failed negotiation.',
            r`// curl -i -H "Accept: image/png" localhost:8080/info
//
// OUTPUT:
// HTTP/1.1 406 Not Acceptable
// (no converter can write Info as image/png)`],
            ['Test negotiation.',
                r`mvc.perform(get("/info").accept("application/json"))
   .andExpect(content().contentType("application/json"));
mvc.perform(get("/info").accept("image/png"))
   .andExpect(status().isNotAcceptable());

// OUTPUT:
// Tests run: 2, Failures: 0`]]
    ),

    'mvc-json-converter': x(
        ['<b>JSON converter</b> is the HttpMessageConverter that maps JSON text to Java objects and back; in Spring it is Jackson by default.',
            '<b>Request</b>: <code>@RequestBody</code> with <code>Content-Type: application/json</code> deserializes into the parameter type.',
            '<b>Response</b>: returning an object from a <code>@RestController</code> serializes it to JSON.'],
        ['<b>Classes</b>: <code>MappingJackson2HttpMessageConverter</code> (Jackson) or <code>GsonHttpMessageConverter</code> (Gson).',
            '<b>Records and classes</b> both work; fields need getters or be public, and a constructor Jackson can use.',
            '<b>Generic bodies</b>: <code>List&lt;User&gt;</code> works because Spring keeps the generic type of the parameter.'],
        ['<b>Dates</b>: add <code>jackson-datatype-jsr310</code> (Boot includes it) and turn off timestamps for ISO dates.',
            '<b>Polymorphism</b>: use <code>@JsonTypeInfo</code> carefully; untrusted type names are a security risk.',
            '<b>Large payloads</b>: Jackson reads the whole body; for huge data stream with <code>JsonParser</code> or a streaming response.'],
        [['F', 'Which library does Spring Boot use for JSON?', 'Jackson.'],
            ['F', 'What annotation reads a JSON body?', '@RequestBody.'],
            ['M', 'What happens on invalid JSON?', 'HttpMessageNotReadableException, giving 400 Bad Request.'],
            ['M', 'How do you rename a JSON field?', 'Use @JsonProperty on the field or getter.'],
            ['S', 'How do you switch from Jackson to Gson?', 'Exclude Jackson, add Gson, and set spring.mvc.converters.preferred-json-mapper=gson.'],
            ['S', 'Why avoid default typing for polymorphic JSON?', 'It can allow gadget-class deserialization attacks.']],
        [['Receive and return a list.',
            r`@PostMapping("/tags")
public List<String> tags(@RequestBody List<String> in) {
    return in.stream().map(String::toUpperCase).toList();
}

// OUTPUT:
// POST /tags ["java","spring"]
// ["JAVA","SPRING"]`],
            ['A record body.',
                r`record Point(int x, int y) {}

@PostMapping("/move")
Point move(@RequestBody Point p) { return new Point(p.x() + 1, p.y() + 1); }

// OUTPUT:
// POST /move {"x":1,"y":2}
// {"x":2,"y":3}`]],
        [['Handle bad JSON.',
            r`@RestControllerAdvice
class JsonErrors {
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<String> bad(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body("Malformed JSON");
    }
}

// OUTPUT:
// POST /move {"x":1,
// HTTP/1.1 400 Bad Request
// Malformed JSON`],
            ['Test with jsonPath.',
                r`mvc.perform(post("/move").contentType("application/json")
        .content("{\"x\":1,\"y\":2}"))
   .andExpect(jsonPath("$.x").value(2))
   .andExpect(jsonPath("$.y").value(3));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-xml-converter': x(
        ['<b>XML converter</b> is an HttpMessageConverter that maps XML to Java objects and back, so an endpoint can speak <code>application/xml</code>.',
            '<b>Two options</b>: <code>MappingJackson2XmlHttpMessageConverter</code> (needs <code>jackson-dataformat-xml</code>) or <code>Jaxb2RootElementHttpMessageConverter</code> (needs JAXB annotations).',
            '<b>Activation</b>: add the dependency and Spring registers it; the <code>Accept</code> header then chooses XML or JSON.'],
        ['<b>Jackson XML</b> reuses Jackson annotations plus <code>@JacksonXmlRootElement</code> and <code>@JacksonXmlProperty</code>.',
            '<b>JAXB</b> needs <code>@XmlRootElement</code> and the Jakarta JAXB runtime, which is not in the JDK any more.',
            '<b>Both formats</b>: once XML is on the classpath, clients without an Accept header may start receiving XML, so set <code>produces</code> when it matters.'],
        ['<b>Security</b>: parse untrusted XML with external entities disabled to avoid XXE attacks.',
            '<b>Order</b>: Jackson JSON usually comes before XML, so a browser sending <code>Accept: */*</code> gets whichever is first.',
            '<b>Collections</b>: a wrapper element is needed for lists; use <code>@JacksonXmlElementWrapper</code>.'],
        [['F', 'How do you make an endpoint return XML?', 'Add jackson-dataformat-xml and request application/xml, or set produces.'],
            ['F', 'Which header chooses XML or JSON?', 'Accept.'],
            ['M', 'Which annotations does JAXB need?', 'At least @XmlRootElement on the class.'],
            ['M', 'Why did my JSON API start returning XML?', 'An XML converter was added to the classpath and Accept allowed it; set produces to JSON.'],
            ['S', 'What is XXE and how do you prevent it?', 'External entity injection in XML parsing; disable DTDs and external entities in the parser.'],
            ['S', 'How do you serialize a list nicely?', 'Use a wrapper element with @JacksonXmlElementWrapper and @JacksonXmlProperty.']],
        [['Dependency.',
            r`<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>

<!-- OUTPUT -->
// MappingJackson2XmlHttpMessageConverter is registered automatically`],
            ['An XML model.',
                r`@JacksonXmlRootElement(localName = "book")
public class Book {
    public String title;
    @JacksonXmlProperty(isAttribute = true) public int id;
}

// OUTPUT:
// <book id="1"><title>Spring</title></book>`]],
        [['Force XML only.',
            r`@GetMapping(value = "/books/{id}", produces = MediaType.APPLICATION_XML_VALUE)
public Book get(@PathVariable int id) {
    return new Book(id, "Spring");
}

// OUTPUT:
// Content-Type: application/xml
// <Book><id>1</id><title>Spring</title></Book>`],
            ['Test XML.',
                r`mvc.perform(get("/books/1").accept(MediaType.APPLICATION_XML))
   .andExpect(status().isOk())
   .andExpect(xpath("/Book/title").string("Spring"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-string-converter': x(
        ['<b>StringHttpMessageConverter</b> reads and writes plain text bodies and supports <code>text/plain</code> and <code>*/*</code>.',
            '<b>Read</b>: <code>@RequestBody String body</code> gives the raw request text.',
            '<b>Write</b>: a method returning <code>String</code> under <code>@ResponseBody</code> or <code>@RestController</code> writes the text directly, not a view name.'],
        ['<b>Charset</b>: it defaults to ISO-8859-1 for write unless the content type says otherwise; Spring Boot sets UTF-8 through <code>server.servlet.encoding</code>.',
            '<b>JSON strings</b>: returning a String from a JSON endpoint is not quoted, because the String converter comes before Jackson.',
            '<b>Raw JSON</b>: you can receive JSON as a String and parse it yourself.'],
        ['<b>Order</b>: it sits before the JSON converter, so a String return value never becomes a JSON string literal.',
            '<b>Content type</b>: set <code>produces = "text/plain;charset=UTF-8"</code> to be explicit.',
            '<b>Gotcha</b>: with <code>@Controller</code> and no <code>@ResponseBody</code>, a returned String is a view name.'],
        [['F', 'What does StringHttpMessageConverter do?', 'It reads and writes String bodies as plain text.'],
            ['F', 'How do you read the raw body?', '@RequestBody String body.'],
            ['M', 'Why is a returned String not wrapped in quotes as JSON?', 'The String converter handles it before Jackson gets a chance.'],
            ['M', 'How do you fix garbled non-ASCII text?', 'Set UTF-8 in the produces attribute or server.servlet.encoding properties.'],
            ['S', 'How do you return a JSON string literal?', 'Return an object, use produces with application/json and a quoted value, or register Jackson before the String converter.'],
            ['S', 'Why would a String return value be treated as a view name?', 'The class uses @Controller and the method has no @ResponseBody.']],
        [['Echo text.',
            r`@PostMapping(value = "/echo", consumes = "text/plain",
        produces = "text/plain;charset=UTF-8")
public String echo(@RequestBody String body) {
    return "You said: " + body;
}

// OUTPUT:
// POST /echo  text/plain  hello
// You said: hello`],
            ['Raw JSON as a String.',
                r`@PostMapping("/raw")
public String raw(@RequestBody String json) throws Exception {
    JsonNode n = new ObjectMapper().readTree(json);
    return "keys=" + n.size();
}

// OUTPUT:
// POST /raw {"a":1,"b":2}
// keys=2`]],
        [['Set the charset in config.',
            r`server.servlet.encoding.charset=UTF-8
server.servlet.encoding.force=true

# OUTPUT:
# Content-Type: text/plain;
charset=UTF-8`],
            ['Test text output.',
                r`mvc.perform(post("/echo").contentType("text/plain").content("hello"))
   .andExpect(status().isOk())
   .andExpect(content().string("You said: hello"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    )
};

export const smvc17Deep: Record<string, Deep> = {
    'mvc-httpmessageconverter': dv(
        [`<p>The interface <code>HttpMessageConverter&lt;T&gt;</code> lives in <code>org.springframework.http.converter</code>.</p><ul><li><b>Interface:</b> <code>canRead(Class, MediaType)</code>, <code>canWrite(Class, MediaType)</code>, <code>getSupportedMediaTypes()</code>, <code>read(...)</code>, <code>write(...)</code>.</li><li><b>Argument side:</b> <code>RequestResponseBodyMethodProcessor</code> loops over converters and calls the first that can read.</li><li><b>Return side:</b> it computes producible types, picks the best match with Accept, and writes with the first capable converter.</li><li><b>Registration:</b> <code>WebMvcConfigurationSupport</code> builds the default list, Boot adds its own through <code>HttpMessageConverters</code>.</li></ul>`,
            r`public class CsvConverter extends AbstractHttpMessageConverter<List<String>> {
    public CsvConverter() { super(new MediaType("text", "csv")); }
    protected boolean supports(Class<?> c) { return List.class.isAssignableFrom(c); }
    protected List<String> readInternal(Class<? extends List<String>> c,
            HttpInputMessage in) throws IOException {
        String s = new String(in.getBody().readAllBytes(), StandardCharsets.UTF_8);
        return List.of(s.split(","));
    }
    protected void writeInternal(List<String> l, HttpOutputMessage out)
            throws IOException {
        out.getBody().write(String.join(",", l).getBytes(StandardCharsets.UTF_8));
    }
}

// OUTPUT:
// GET /tags  Accept: text/csv -> java,spring`],
        [`<p>Ways to register converters:</p><ul><li><b>configureMessageConverters:</b> replaces all defaults.</li><li><b>extendMessageConverters:</b> modifies the default list.</li><li><b>Boot bean:</b> declare a converter or <code>HttpMessageConverters</code> bean.</li><li><b>RestTemplate and RestClient:</b> have their own converter lists.</li></ul>`,
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> list) {
        list.add(0, new CsvConverter());        // first position wins
    }
}
@Bean
HttpMessageConverters customConverters() {
    return new HttpMessageConverters(new CsvConverter());   // Boot style
}

// OUTPUT:
// converter list: CsvConverter, ByteArray, String, Resource, ..., Jackson`],
        [`<p>Common mistakes:</p><ul><li><b>configureMessageConverters used by accident:</b> JSON stops working because defaults are gone; use extend.</li><li><b>Broad canWrite:</b> a converter that supports Object intercepts everything.</li><li><b>Missing Content-Type:</b> the request gets 415.</li><li><b>Forgetting to close or read the stream twice:</b> the body can be read only once.</li></ul>`,
            r`// Wrong: replaces defaults, JSON is lost
@Override
public void configureMessageConverters(List<HttpMessageConverter<?>> l) {
    l.add(new CsvConverter());
}
// Right: keep defaults
@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> l) {
    l.add(new CsvConverter());
}

// OUTPUT:
// wrong: GET /api -> 406 for application/json
// right: GET /api -> 200 for both json and csv`],
        [`<p>Performance notes:</p><ul><li><b>Converter lookup</b> is a linear scan of a short list, which is negligible.</li><li><b>Cost</b> is in serialization, so reuse the thread-safe <code>ObjectMapper</code>.</li><li><b>Large bodies:</b> stream, or use <code>StreamingResponseBody</code>.</li><li><b>Compression:</b> enable <code>server.compression.enabled</code> for text payloads.</li></ul>`,
            r`server.compression.enabled=true
server.compression.mime-types=application/json,text/csv
server.compression.min-response-size=1024

# OUTPUT:
# Content-Encoding: gzip on responses above 1 KB`],
        [`<p>Scenario: a reporting API serves JSON to a web app and CSV to finance. A small converter plus the Accept header lets one endpoint handle both without extra URLs.</p>`,
            r`@GetMapping(value = "/reports/sales",
        produces = { "application/json", "text/csv" })
public List<String> sales() { return List.of("jan:10", "feb:12"); }

// OUTPUT:
// Accept: application/json -> ["jan:10","feb:12"]
// Accept: text/csv         -> jan:10,feb:12`]
    ),

    'mvc-mappingjackson2httpmessageconverter': dv(
        [`<p>The converter extends <code>AbstractJackson2HttpMessageConverter</code> and wraps an <code>ObjectMapper</code>.</p><ul><li><b>canRead:</b> asks <code>ObjectMapper.canDeserialize</code> for the target type.</li><li><b>read:</b> builds a Jackson <code>JavaType</code> from the generic parameter and calls <code>readValue</code>.</li><li><b>write:</b> uses an <code>ObjectWriter</code> with a <code>JsonGenerator</code> and the chosen charset.</li><li><b>Boot:</b> <code>JacksonAutoConfiguration</code> builds the mapper and <code>HttpMessageConvertersAutoConfiguration</code> wraps it.</li></ul>`,
            r`ObjectMapper om = new ObjectMapper();
MappingJackson2HttpMessageConverter c = new MappingJackson2HttpMessageConverter(om);
System.out.println(c.getSupportedMediaTypes());
System.out.println(c.canWrite(Map.class, MediaType.APPLICATION_JSON));

// OUTPUT:
// [application/json, application/*+json]
// true`],
        [`<p>Useful options:</p><ul><li><b>Boot properties:</b> <code>spring.jackson.*</code> for naming, inclusion, dates, features.</li><li><b>Customizer bean:</b> <code>Jackson2ObjectMapperBuilderCustomizer</code>.</li><li><b>Annotations:</b> <code>@JsonView</code>, <code>@JsonInclude</code>, <code>@JsonAlias</code>, <code>@JsonCreator</code>.</li><li><b>Modules:</b> any <code>Module</code> bean is registered automatically.</li></ul>`,
            r`@Bean
Jackson2ObjectMapperBuilderCustomizer customizer() {
    return b -> b.serializationInclusion(JsonInclude.Include.NON_NULL)
                 .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
}

// OUTPUT:
// {"name":"Abaji","joined":"2024-05-01"}   (null fields omitted)`],
        [`<p>Common mistakes:</p><ul><li><b>new ObjectMapper() in code:</b> it ignores Boot settings; inject the bean.</li><li><b>No default constructor:</b> deserialization fails; use records or <code>@JsonCreator</code>.</li><li><b>Bidirectional entities:</b> infinite recursion; use DTOs or <code>@JsonManagedReference</code>.</li><li><b>Dates as numbers:</b> turn off <code>WRITE_DATES_AS_TIMESTAMPS</code>.</li></ul>`,
            r`// Wrong: ignores spring.jackson settings
ObjectMapper bad = new ObjectMapper();
// Right: inject the Boot-configured mapper
@Service
class Json {
    private final ObjectMapper mapper;
    Json(ObjectMapper mapper) { this.mapper = mapper; }
}

// OUTPUT:
// injected mapper: same settings as the HTTP converter`],
        [`<p>Performance notes:</p><ul><li><b>Reuse</b> the mapper; creating one is expensive and it caches serializers.</li><li><b>Afterburner or Blackbird</b> modules can speed up access.</li><li><b>Smaller output:</b> exclude nulls and use DTOs with only needed fields.</li><li><b>Streaming:</b> for large lists write with a <code>JsonGenerator</code>.</li></ul>`,
            r`@GetMapping(value = "/export", produces = "application/x-ndjson")
StreamingResponseBody export(ObjectMapper om) {
    return out -> {
        for (Row row : repo.streamAll()) {
            out.write(om.writeValueAsBytes(row));
            out.write('\n');
        }
    };
}

// OUTPUT:
// {"id":1}
// {"id":2}   (streamed, constant memory)`],
        [`<p>Scenario: the mobile app expects snake_case and ISO dates, while the code uses camelCase. Two Boot properties fix it for the whole API with no code change.</p>`,
            r`spring.jackson.property-naming-strategy=SNAKE_CASE
spring.jackson.serialization.write-dates-as-timestamps=false

# OUTPUT:
# {"order_id":5,"created_at":"2024-05-01T10:15:30"}`]
    ),

    'mvc-responseentity': dv(
        [`<p><code>ResponseEntity&lt;T&gt;</code> extends <code>HttpEntity&lt;T&gt;</code> and adds a status.</p><ul><li><b>Handler:</b> <code>HttpEntityMethodProcessor</code> supports it as a return type.</li><li><b>Steps:</b> copy headers, set status, then write the body through a converter chosen by Accept.</li><li><b>Empty body:</b> with <code>build()</code> no converter is used.</li><li><b>Conditional:</b> for <code>ETag</code> or <code>Last-Modified</code> the processor can return 304 on its own for GET and HEAD.</li></ul>`,
            r`ResponseEntity<String> r = ResponseEntity.status(HttpStatus.ACCEPTED)
    .header("X-Job", "42")
    .body("queued");
System.out.println(r.getStatusCode() + " " + r.getHeaders() + " " + r.getBody());

// OUTPUT:
// 202 ACCEPTED [X-Job:"42"] queued`],
        [`<p>Variants:</p><ul><li><b>Shortcuts:</b> <code>ok</code>, <code>created</code>, <code>accepted</code>, <code>noContent</code>, <code>badRequest</code>, <code>notFound</code>.</li><li><b>HeadersBuilder:</b> <code>build()</code> for no body, <code>BodyBuilder.body()</code> for a body.</li><li><b>Files:</b> <code>ResponseEntity&lt;Resource&gt;</code> with <code>contentType</code> and <code>contentLength</code>.</li><li><b>ETag:</b> <code>.eTag("v1")</code>.</li><li><b>RestTemplate:</b> also returns it, via <code>getForEntity</code>.</li></ul>`,
            r`@GetMapping("/files/{name}")
ResponseEntity<Resource> download(@PathVariable String name) {
    Resource file = storage.load(name);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + name + "\"")
        .body(file);
}

// OUTPUT:
// HTTP/1.1 200 OK
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="report.pdf"`],
        [`<p>Common mistakes:</p><ul><li><b>Body with 204:</b> a 204 must not have a body.</li><li><b>Raw type:</b> <code>ResponseEntity</code> without a type loses documentation; use <code>ResponseEntity&lt;Void&gt;</code> for no body.</li><li><b>Everywhere ResponseEntity:</b> routine 200 responses are simpler as plain return values.</li><li><b>Returning null</b> instead of 404.</li></ul>`,
            r`// Wrong: null body gives 200 with empty content
@GetMapping("/a/{id}") User a(@PathVariable long id) { return repo.find(id); }
// Right
@GetMapping("/b/{id}")
ResponseEntity<User> b(@PathVariable long id) {
    User u = repo.find(id);
    return u == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(u);
}

// OUTPUT:
// /a/99 -> 200 (empty)     /b/99 -> 404`],
        [`<p>Performance notes:</p><ul><li><b>Cost</b> is negligible; the body conversion dominates.</li><li><b>Caching:</b> <code>cacheControl</code> and <code>eTag</code> save bandwidth.</li><li><b>Large files:</b> return a <code>Resource</code> or <code>StreamingResponseBody</code>, not a byte array.</li></ul>`,
            r`@GetMapping("/products/{id}")
ResponseEntity<Product> get(@PathVariable long id) {
    Product p = service.get(id);
    return ResponseEntity.ok()
        .eTag("\"" + p.version() + "\"")
        .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
        .body(p);
}

// OUTPUT:
// 200 with ETag: "3"
// repeat with If-None-Match: "3" -> 304 Not Modified (varies by filter)`],
        [`<p>Scenario: a payment endpoint returns 202 with a status URL while the job runs, then clients poll that URL.</p>`,
            r`@PostMapping("/payments")
ResponseEntity<Void> start(@RequestBody Payment p) {
    String id = service.submit(p);
    return ResponseEntity.accepted()
        .location(URI.create("/payments/" + id + "/status")).build();
}

// OUTPUT:
// HTTP/1.1 202 Accepted
// Location: /payments/p-77/status`]
    ),

    'mvc-http-status-codes': dv(
        [`<p>Spring models status codes with <code>HttpStatusCode</code> and the enum <code>HttpStatus</code>.</p><ul><li><b>Set by:</b> <code>ResponseEntity</code>, <code>@ResponseStatus</code>, <code>ResponseStatusException</code>, or exception resolvers.</li><li><b>Resolvers:</b> <code>ExceptionHandlerExceptionResolver</code>, <code>ResponseStatusExceptionResolver</code> and <code>DefaultHandlerExceptionResolver</code> run in that order.</li><li><b>Default mapping:</b> missing parameter 400, no handler 404, wrong method 405, unsupported media 415.</li><li><b>Fallback:</b> unhandled exceptions become 500 via <code>/error</code> in Boot.</li></ul>`,
            r`HttpStatus s = HttpStatus.valueOf(404);
System.out.println(s.value() + " " + s.getReasonPhrase() + " " + s.is4xxClientError());
System.out.println(HttpStatusCode.valueOf(299).is2xxSuccessful());

// OUTPUT:
// 404 Not Found true
// true`],
        [`<p>Quick reference by use case:</p><ul><li><b>Read:</b> 200, 304, 404.</li><li><b>Create:</b> 201, 202 for async, 409 for duplicates.</li><li><b>Update and delete:</b> 200 or 204, 404, 409, 412 for failed preconditions.</li><li><b>Validation:</b> 400 or 422.</li><li><b>Security:</b> 401, 403, 429 for rate limiting.</li><li><b>Server:</b> 500, 502, 503, 504.</li></ul>`,
            r`@ExceptionHandler(MethodArgumentNotValidException.class)
ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
    Map<String, String> errs = new LinkedHashMap<>();
    e.getBindingResult().getFieldErrors()
        .forEach(f -> errs.put(f.getField(), f.getDefaultMessage()));
    return ResponseEntity.badRequest().body(errs);
}

// OUTPUT:
// HTTP/1.1 400
// {"name":"must not be blank","price":"must be greater than 0"}`],
        [`<p>Common mistakes:</p><ul><li><b>200 with an error message:</b> clients cannot detect failure.</li><li><b>500 for client errors:</b> an uncaught validation exception should be 400.</li><li><b>404 for authorization failure</b> without a reason; fine for hiding existence, wrong otherwise.</li><li><b>Mixing 401 and 403.</b></li></ul>`,
            r`// Wrong
return ResponseEntity.ok(Map.of("error", "not found"));
// Right
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "not found");

// OUTPUT:
// wrong: 200 {"error":"not found"}
// right: 404 {"status":404,"error":"Not Found"}`],
        [`<p>Operational notes:</p><ul><li><b>Monitoring:</b> alert on 5xx rate; 4xx spikes show client or contract problems.</li><li><b>Retry:</b> clients retry 502, 503, 504 and 429, never 400.</li><li><b>429 and Retry-After</b> help clients back off.</li></ul>`,
            r`@GetMapping("/limited")
ResponseEntity<String> limited() {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, "30")
        .body("slow down");
}

// OUTPUT:
// HTTP/1.1 429 Too Many Requests
// Retry-After: 30`],
        [`<p>Scenario: an order API maps domain exceptions to statuses in one advice, so controllers contain only the happy path.</p>`,
            r`@RestControllerAdvice
class OrderErrors {
    @ExceptionHandler(OutOfStockException.class)
    ProblemDetail stock(OutOfStockException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }
    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail denied(AccessDeniedException e) {
        return ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
    }
}

// OUTPUT:
// out of stock -> 409   access denied -> 403`]
    ),

    'mvc-api-versioning': dv(
        [`<p>Versioning works through request mapping conditions that <code>RequestMappingHandlerMapping</code> evaluates.</p><ul><li><b>Conditions:</b> patterns, <code>params</code>, <code>headers</code>, <code>consumes</code>, <code>produces</code>.</li><li><b>Most specific wins:</b> if several mappings match, Spring compares the conditions and picks the best.</li><li><b>No match:</b> 404, 400 for missing params, 406 or 415 for media types.</li><li><b>Custom:</b> a <code>RequestCondition</code> can implement version ranges.</li></ul>`,
            r`@GetMapping(path = "/api/users/{id}", params = "version=2")
UserV2 v2(@PathVariable long id) { return new UserV2("Abaji", "Rao"); }

@GetMapping(path = "/api/users/{id}", params = "version=1")
UserV1 v1(@PathVariable long id) { return new UserV1("Abaji Rao"); }

// OUTPUT:
// GET /api/users/1?version=2 -> v2 body
// GET /api/users/1           -> 400 (parameter condition not met)`],
        [`<p>Strategy comparison:</p><ul><li><b>URI:</b> easy, cacheable, visible; not pure REST.</li><li><b>Query param:</b> easy to test; may be dropped by caches.</li><li><b>Header:</b> clean URLs; harder to test by hand.</li><li><b>Media type:</b> most RESTful; complex for clients.</li><li><b>Newer Spring:</b> recent releases add first-class API versioning support; check your Spring version documentation before relying on it.</li></ul>`,
            r`// Property-driven prefix per version using a shared base path
@Configuration
class VersionConfig implements WebMvcConfigurer {
    @Override
    public void configurePathMatch(PathMatchConfigurer c) {
        c.addPathPrefix("/api/v2", HandlerTypePredicate.forBasePackage("com.app.v2"));
    }
}

// OUTPUT:
// controllers in com.app.v2 are exposed under /api/v2/...`],
        [`<p>Common mistakes:</p><ul><li><b>Versioning too early or too often:</b> prefer additive changes.</li><li><b>Copy-pasting controllers:</b> bugs get fixed in one version only.</li><li><b>No default version:</b> clients without the header fail.</li><li><b>Never retiring old versions.</b></li></ul>`,
            r`// Right: shared service, thin versioned controllers
@RestController @RequestMapping("/api/v1/users")
class V1 {
    V1(UserService s) {...}
    UserV1 get(long id) { return map1(s.get(id)); }
}
@RestController @RequestMapping("/api/v2/users")
class V2 {
    V2(UserService s) {...}
    UserV2 get(long id) { return map2(s.get(id)); }
}

// OUTPUT:
// one UserService, two response shapes`],
        [`<p>Operational notes:</p><ul><li><b>Measure</b> traffic per version (a metrics tag) before deleting one.</li><li><b>Signal deprecation</b> with <code>Deprecation</code> and <code>Sunset</code> headers.</li><li><b>Document</b> each version in OpenAPI groups.</li></ul>`,
            r`@GetMapping("/api/v1/users/{id}")
ResponseEntity<UserV1> v1(@PathVariable long id) {
    return ResponseEntity.ok()
        .header("Deprecation", "true")
        .header("Sunset", "Wed, 31 Dec 2025 23:59:59 GMT")
        .body(map1(service.get(id)));
}

// OUTPUT:
// HTTP/1.1 200 OK
// Deprecation: true
// Sunset: Wed, 31 Dec 2025 23:59:59 GMT`],
        [`<p>Scenario: v1 returned a single name field; the new mobile app needs first and last name. v2 is added, v1 stays for old apps for six months, then is removed after traffic drops to zero.</p>`,
            r`// v1 clients: {"name":"Abaji Rao"}
// v2 clients: {"firstName":"Abaji","lastName":"Rao"}
// both served by UserService.get(id) returning a rich domain object

// OUTPUT:
// GET /api/v1/users/1 -> {"name":"Abaji Rao"}
// GET /api/v2/users/1 -> {"firstName":"Abaji","lastName":"Rao"}`]
    ),

    'mvc-rest-api-best-practices': dv(
        [`<p>Most practices map to a Spring feature.</p><ul><li><b>Resources and verbs:</b> <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@PatchMapping</code>, <code>@DeleteMapping</code>.</li><li><b>Validation:</b> <code>@Valid</code> triggers Bean Validation before the method runs.</li><li><b>Errors:</b> <code>@RestControllerAdvice</code> and <code>ProblemDetail</code> (RFC 9457).</li><li><b>Pagination:</b> <code>Pageable</code> resolved by <code>PageableHandlerMethodArgumentResolver</code> in Spring Data.</li></ul>`,
            r`@GetMapping
Page<ProductDto> list(@RequestParam(required = false) String q,
        @PageableDefault(size = 20, sort = "name") Pageable pageable) {
    return service.search(q, pageable).map(ProductDto::from);
}

// OUTPUT:
// GET /api/v1/products?q=pen&page=0&size=20
// {"content":[...],"totalElements":42,"number":0,"size":20}`],
        [`<p>Variants worth knowing:</p><ul><li><b>PUT vs PATCH:</b> PUT is full replacement and idempotent.</li><li><b>Filtering:</b> <code>?status=active&amp;sort=name,asc</code>.</li><li><b>HATEOAS:</b> optional links with Spring HATEOAS.</li><li><b>Bulk operations:</b> a dedicated endpoint such as <code>POST /orders/batch</code>.</li><li><b>Long tasks:</b> return 202 and a status URL.</li></ul>`,
            r`@PatchMapping("/{id}")
ProductDto patch(@PathVariable long id, @RequestBody Map<String, Object> changes) {
    return service.apply(id, changes);
}
@PutMapping("/{id}")
ProductDto replace(@PathVariable long id, @Valid @RequestBody ProductDto dto) {
    return service.replace(id, dto);
}

// OUTPUT:
// PATCH {"price":9} changes only price
// PUT   needs the full product body`],
        [`<p>Common mistakes:</p><ul><li><b>Verbs in URLs:</b> <code>/getUser</code> instead of <code>GET /users/1</code>.</li><li><b>Entities as responses:</b> leaks data and lazy loading errors.</li><li><b>Unbounded lists:</b> always paginate.</li><li><b>Inconsistent errors and wrong status codes.</b></li><li><b>Returning stack traces:</b> set <code>server.error.include-stacktrace=never</code>.</li></ul>`,
            r`# Wrong: POST /api/createUser, GET /api/getUsers
# Right
# POST /api/v1/users       -> 201
# GET  /api/v1/users       -> 200 (paged)
# GET  /api/v1/users/5     -> 200 or 404

server.error.include-stacktrace=never
server.error.include-message=never

# OUTPUT:
# errors no longer expose internals`],
        [`<p>Performance and robustness:</p><ul><li><b>Cap page size</b> with <code>spring.data.web.pageable.max-page-size</code>.</li><li><b>Caching:</b> ETag and Cache-Control on read endpoints.</li><li><b>Compression</b> for JSON.</li><li><b>Timeouts and rate limits</b> to protect the server.</li><li><b>N+1 queries:</b> fetch DTO projections.</li></ul>`,
            r`spring.data.web.pageable.max-page-size=100
spring.data.web.pageable.default-page-size=20
server.compression.enabled=true

# OUTPUT:
# size=10000 request is clamped to 100`],
        [`<p>Scenario: a team reviews an API before launch with a checklist: plural nouns, status codes, validation, ProblemDetail errors, pagination, versioning, security and OpenAPI documentation.</p>`,
            r`@PostMapping
ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrder req,
        @RequestHeader("Idempotency-Key") String key) {
    OrderDto o = service.createOnce(key, req);   // safe retries
    return ResponseEntity.created(URI.create("/api/v1/orders/" + o.id())).body(o);
}

// OUTPUT:
// first call  -> 201 Created
// same key    -> 201 with the same order (no duplicate)`]
    ),

    'mvc-what-is-httpmessageconverter': dv(
        [`<p>The conversion pipeline for a request and a response:</p><ul><li><b>Request:</b> <code>DispatcherServlet</code> finds the handler, then <code>RequestResponseBodyMethodProcessor</code> resolves the <code>@RequestBody</code> argument by trying converters against Content-Type.</li><li><b>Response:</b> after the handler returns, the same processor collects producible media types, intersects them with Accept, sorts by quality, and writes.</li><li><b>Advice:</b> <code>RequestBodyAdvice</code> and <code>ResponseBodyAdvice</code> can wrap this step.</li><li><b>No view:</b> the <code>ModelAndView</code> is marked handled, so no ViewResolver runs.</li></ul>`,
            r`// Simplified idea of the selection loop
for (HttpMessageConverter<?> c : converters) {
    if (c.canWrite(returnType, selectedMediaType)) {
        ((HttpMessageConverter<Object>) c).write(body, selectedMediaType, out);
        return;
    }
}
throw new HttpMediaTypeNotAcceptableException(producible);

// OUTPUT:
// first matching converter writes the body; none -> 406`],
        [`<p>Controlling the negotiation:</p><ul><li><b>consumes / produces</b> on the mapping.</li><li><b>Accept header</b> from the client, with quality values such as <code>q=0.8</code>.</li><li><b>Path extension and parameter strategies</b> are off by default in modern Spring; use headers.</li><li><b>HttpEntity</b> gives access to headers and body together.</li></ul>`,
            r`@PostMapping(value = "/convert",
        consumes = "application/json", produces = "application/xml")
Item convert(HttpEntity<Item> entity) {
    System.out.println(entity.getHeaders().getContentType());
    return entity.getBody();
}

// OUTPUT:
// application/json
// <Item><name>pen</name></Item>`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong Content-Type from the client:</b> 415.</li><li><b>Reading the body twice</b> in a filter, which breaks <code>@RequestBody</code>; wrap the request with <code>ContentCachingRequestWrapper</code>.</li><li><b>Mixing @Controller and String returns</b> without @ResponseBody.</li><li><b>Assuming JSON</b> when XML is on the classpath.</li></ul>`,
            r`// curl -X POST localhost:8080/convert -d '{"name":"pen"}'
// (curl sends application/x-www-form-urlencoded by default)

// OUTPUT:
// HTTP/1.1 415 Unsupported Media Type
// fix: curl -H "Content-Type: application/json" -d '{"name":"pen"}' ...`],
        [`<p>Tuning notes:</p><ul><li><b>Keep the converter list short:</b> remove unused XML libraries.</li><li><b>Set produces</b> to skip negotiation work and make behavior explicit.</li><li><b>Avoid body logging</b> for large payloads.</li></ul>`,
            r`@GetMapping(value = "/fast", produces = MediaType.APPLICATION_JSON_VALUE)
List<Item> fast() { return service.all(); }

// OUTPUT:
// only JSON is considered; Accept: application/xml -> 406`],
        [`<p>Scenario: a legacy partner sends XML while the new web app sends JSON. One endpoint accepts both through consumes and returns the format asked for in Accept.</p>`,
            r`@PostMapping(value = "/orders",
        consumes = { "application/json", "application/xml" },
        produces = { "application/json", "application/xml" })
OrderDto place(@RequestBody OrderDto o) { return service.place(o); }

// OUTPUT:
// XML in, XML out for the partner; JSON in, JSON out for the web app`]
    ),

    'mvc-json-converter': dv(
        [`<p>Reading JSON with Jackson inside Spring:</p><ul><li><b>Type resolution:</b> the method parameter generic type becomes a Jackson <code>JavaType</code>.</li><li><b>Binding:</b> Jackson uses setters, fields or a constructor (records and <code>@JsonCreator</code>).</li><li><b>Errors:</b> <code>JsonProcessingException</code> is wrapped in <code>HttpMessageNotReadableException</code>.</li><li><b>Writing:</b> getters or record accessors are serialized; null handling follows the inclusion setting.</li></ul>`,
            r`ObjectMapper om = new ObjectMapper();
record Point(int x, int y) {}
Point p = om.readValue("{\"x\":1,\"y\":2}", Point.class);
String json = om.writeValueAsString(p);
List<Point> list = om.readValue("[{\"x\":1,\"y\":2}]",
        new TypeReference<List<Point>>() {});
System.out.println(p + " " + json + " " + list.size());

// OUTPUT:
// Point[x=1, y=2] {"x":1,"y":2} 1`],
        [`<p>Useful variants:</p><ul><li><b>JsonNode / Map</b> for dynamic payloads.</li><li><b>@JsonView</b> to expose different fields to different callers.</li><li><b>@JsonAnySetter</b> for unknown fields.</li><li><b>Gson</b> as an alternative converter.</li><li><b>JSON Patch and Merge Patch</b> media types for PATCH.</li></ul>`,
            r`public class Views {
    public interface Public {}
    public interface Admin extends Public {}
}
class User {
    @JsonView(Views.Public.class) public String name;
    @JsonView(Views.Admin.class)  public String email;
}
@GetMapping("/users/1")
@JsonView(Views.Public.class)
User one() { return new User("Abaji", "a@x.com"); }

// OUTPUT:
// {"name":"Abaji"}`],
        [`<p>Common mistakes:</p><ul><li><b>Lombok or class without accessors:</b> empty JSON <code>{}</code>.</li><li><b>Unknown property errors</b> outside Boot; configure <code>FAIL_ON_UNKNOWN_PROPERTIES</code>.</li><li><b>Wrong date format</b> or timestamps.</li><li><b>Enum mismatch:</b> a bad value gives 400.</li><li><b>Primitive vs wrapper:</b> a missing int becomes 0, a missing Integer becomes null.</li></ul>`,
            r`class Bad { private String name; }          // no getter: serializes as {}
record Good(String name) {}                   // accessor: {"name":"x"}
spring.jackson.deserialization.fail-on-unknown-properties=true

// OUTPUT:
// new Bad() -> {}   new Good("x") -> {"name":"x"}`],
        [`<p>Performance notes:</p><ul><li><b>Smaller DTOs</b> mean less serialization.</li><li><b>Avoid</b> serializing deep lazy graphs.</li><li><b>Reuse the ObjectMapper.</b></li><li><b>Compress</b> large JSON.</li><li><b>Set limits</b> on body size: <code>spring.servlet.multipart</code> and server max sizes.</li></ul>`,
            r`server.tomcat.max-swallow-size=2MB
server.compression.enabled=true

# OUTPUT:
# large JSON responses are gzip compressed`],
        [`<p>Scenario: a mobile client sends a batch of events as a JSON array, and the API returns a summary object with counts, with bad JSON mapped to a clean 400.</p>`,
            r`@PostMapping("/events")
Summary ingest(@RequestBody List<Event> events) {
    long ok = events.stream().filter(Event::valid).count();
    return new Summary(events.size(), ok);
}
record Summary(int received, long valid) {}

// OUTPUT:
// POST /events [{"type":"click"},{"type":""}]
// {"received":2,"valid":1}`]
    ),

    'mvc-xml-converter': dv(
        [`<p>XML support depends on what is on the classpath.</p><ul><li><b>Jackson XML:</b> <code>MappingJackson2XmlHttpMessageConverter</code> is added when <code>jackson-dataformat-xml</code> exists, using an <code>XmlMapper</code>.</li><li><b>JAXB:</b> <code>Jaxb2RootElementHttpMessageConverter</code> needs <code>@XmlRootElement</code> and a JAXB runtime such as Jakarta XML Bind.</li><li><b>Media types:</b> <code>application/xml</code>, <code>text/xml</code>, <code>application/*+xml</code>.</li><li><b>Selection:</b> same canRead and canWrite loop as for JSON.</li></ul>`,
            r`XmlMapper xm = new XmlMapper();
record Book(String title, int pages) {}
String xml = xm.writeValueAsString(new Book("Spring", 300));
Book b = xm.readValue(xml, Book.class);
System.out.println(xml);
System.out.println(b);

// OUTPUT:
// <Book><title>Spring</title><pages>300</pages></Book>
// Book[title=Spring, pages=300]`],
        [`<p>Options:</p><ul><li><b>Attributes:</b> <code>@JacksonXmlProperty(isAttribute = true)</code>.</li><li><b>Lists:</b> <code>@JacksonXmlElementWrapper(localName = "items")</code>.</li><li><b>Namespaces:</b> <code>namespace</code> on <code>@JacksonXmlProperty</code>.</li><li><b>Pretty print:</b> <code>SerializationFeature.INDENT_OUTPUT</code>.</li><li><b>Per endpoint:</b> <code>produces = application/xml</code>.</li></ul>`,
            r`public class Library {
    @JacksonXmlElementWrapper(localName = "books")
    @JacksonXmlProperty(localName = "book")
    public List<Book> books;
}

// OUTPUT:
// <Library><books><book><title>A</title></book><book><title>B</title></book></books></Library>`],
        [`<p>Common mistakes:</p><ul><li><b>Missing dependency:</b> requests for XML return 406.</li><li><b>JAXB on a modern JDK:</b> the runtime is no longer bundled; add Jakarta XML Bind and an implementation.</li><li><b>Unexpected XML responses</b> after adding the library.</li><li><b>XXE:</b> parsing untrusted XML with a permissive parser.</li></ul>`,
            r`// Make JSON the default for clients that send Accept: */*
@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.defaultContentType(MediaType.APPLICATION_JSON);
}

// OUTPUT:
// Accept: */*  -> JSON
// Accept: application/xml -> XML`],
        [`<p>Performance and safety:</p><ul><li><b>XML is bigger and slower</b> than JSON; use it only when a partner needs it.</li><li><b>Limit sizes</b> and disable DTDs.</li><li><b>Streaming</b> parsers (StAX) for large documents.</li></ul>`,
            r`XmlMapper safe = new XmlMapper(
    XmlFactory.builder()
        .xmlInputFactory(secureFactory())    // DTD and external entities disabled
        .build());

// OUTPUT:
// <!DOCTYPE ... SYSTEM "file:///etc/passwd"> is rejected instead of read`],
        [`<p>Scenario: a government partner posts invoices as XML, while the internal web app uses JSON. Both hit the same controller and service.</p>`,
            r`@PostMapping(value = "/invoices",
        consumes = { "application/xml", "application/json" },
        produces = { "application/xml", "application/json" })
InvoiceReceipt receive(@RequestBody Invoice inv) {
    return service.accept(inv);
}

// OUTPUT:
// XML invoice in -> <InvoiceReceipt><id>I-9</id></InvoiceReceipt>
// JSON invoice in -> {"id":"I-9"} when Accept is JSON`]
    ),

    'mvc-string-converter': dv(
        [`<p><code>StringHttpMessageConverter</code> extends <code>AbstractHttpMessageConverter&lt;String&gt;</code>.</p><ul><li><b>Supports:</b> only the <code>String</code> class and all media types by default.</li><li><b>Charset:</b> uses the charset of the Content-Type, or a default (ISO-8859-1 for response unless set).</li><li><b>Position:</b> it is second in the default list, so Strings are written as text before Jackson sees them.</li><li><b>Accept-Charset:</b> it can add the header <code>Accept-Charset</code>; Boot turns that off.</li></ul>`,
            r`StringHttpMessageConverter c =
    new StringHttpMessageConverter(StandardCharsets.UTF_8);
System.out.println(c.getSupportedMediaTypes());
System.out.println(c.canWrite(String.class, MediaType.TEXT_PLAIN));
System.out.println(c.canWrite(Integer.class, MediaType.TEXT_PLAIN));

// OUTPUT:
// [text/plain, */*]
// true
// false`],
        [`<p>Variants:</p><ul><li><b>Plain text:</b> <code>produces = text/plain</code>.</li><li><b>HTML snippet:</b> <code>produces = text/html</code>.</li><li><b>JSON string:</b> build the JSON yourself or return an object.</li><li><b>Fixed charset:</b> use <code>produces</code> with <code>;charset=UTF-8</code>.</li></ul>`,
            r`@GetMapping(value = "/hello", produces = "text/html;charset=UTF-8")
String hello() { return "<h1>Namaste</h1>"; }

@GetMapping(value = "/quoted", produces = "application/json")
String quoted() { return "\"hello\""; }   // manual JSON string literal

// OUTPUT:
// /hello  -> <h1>Namaste</h1>
// /quoted -> "hello"`],
        [`<p>Common mistakes:</p><ul><li><b>Garbled characters:</b> charset not UTF-8.</li><li><b>Expecting quotes</b> around a returned String in a JSON API.</li><li><b>Returning String from @Controller</b> and getting a view name lookup.</li><li><b>Large String bodies</b> held fully in memory.</li></ul>`,
            r`// Wrong in @Controller: looks for a view named "ok"
@Controller class A {
    @GetMapping("/a") String a() { return "ok"; }
}
// Right
@Controller class B {
    @GetMapping("/b") @ResponseBody String b() { return "ok"; }
}

// OUTPUT:
// /a -> 404 or template not found    /b -> ok`],
        [`<p>Performance notes:</p><ul><li><b>Cheap:</b> no parsing, just charset decoding.</li><li><b>Large text:</b> stream with <code>StreamingResponseBody</code> or <code>Resource</code>.</li><li><b>Compression</b> helps text responses.</li></ul>`,
            r`@GetMapping("/log")
StreamingResponseBody log() {
    return out -> Files.copy(Path.of("app.log"), out);
}

// OUTPUT:
// log file streamed in chunks, not loaded into memory`],
        [`<p>Scenario: a webhook endpoint receives a signed payload. The signature is computed over the raw bytes, so the controller takes the body as a String, verifies it, then parses JSON.</p>`,
            r`@PostMapping("/webhook")
ResponseEntity<Void> hook(@RequestBody String raw,
        @RequestHeader("X-Signature") String sig) throws Exception {
    if (!verifier.valid(raw, sig)) return ResponseEntity.status(401).build();
    Event e = mapper.readValue(raw, Event.class);
    service.handle(e);
    return ResponseEntity.ok().build();
}

// OUTPUT:
// valid signature -> 200   bad signature -> 401`]
    )
};
