// Spring extras, batch smvc16 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc16Extras: Record<string, Extra> = {
    'mvc-rest-architecture': x(
        ['<b>REST</b> (Representational State Transfer) is an architectural style where a server exposes <b>resources</b> identified by URLs and clients act on them with HTTP methods.',
            '<b>Representations</b> such as JSON travel between client and server; the resource itself stays on the server.',
            '<b>Stateless</b>: every request carries everything the server needs, so no HTTP session is required.'],
        ['<b>Uniform interface</b>: <code>GET</code> reads, <code>POST</code> creates, <code>PUT</code> replaces, <code>PATCH</code> updates part, <code>DELETE</code> removes.',
            '<b>Layers in Spring</b>: <code>DispatcherServlet</code> routes to a controller, the service holds logic, the repository talks to the database.',
            '<b>Status codes</b> carry the result: 200, 201, 204, 400, 404, 409, 500.'],
        ['<b>Scalability</b>: statelessness lets you add servers behind a load balancer without sticky sessions.',
            '<b>Caching</b>: safe GET responses can use <code>Cache-Control</code> and <code>ETag</code>.',
            '<b>HATEOAS</b> (links inside responses) is the highest REST maturity level, but most APIs stop at level 2 (resources plus verbs).'],
        [['F', 'What is REST?', 'An architectural style for web APIs where resources are addressed by URLs and manipulated with standard HTTP methods.'],
            ['F', 'What does stateless mean?', 'The server keeps no client conversation state between requests; each request is self-contained.'],
            ['M', 'Which HTTP methods are idempotent?', 'GET, PUT, DELETE and HEAD are idempotent; POST is not.'],
            ['M', 'How does Spring MVC support REST?', 'Through @RestController, @RequestMapping variants, HttpMessageConverters and ResponseEntity.'],
            ['S', 'What are the Richardson maturity levels?', 'Level 0 single endpoint, 1 resources, 2 HTTP verbs and codes, 3 hypermedia controls (HATEOAS).'],
            ['S', 'How do you authenticate a stateless REST API?', 'Send a token (for example a JWT) in the Authorization header on every request instead of using a server session.']],
        [['Tiny resource API: list and get.',
            r`@RestController
@RequestMapping("/api/books")
class BookController {
    private final Map<Long, String> books = Map.of(1L, "Clean Code", 2L, "Effective Java");

    @GetMapping
    Collection<String> all() { return books.values(); }

    @GetMapping("/{id}")
    String one(@PathVariable Long id) { return books.get(id); }
}

// OUTPUT:
// GET /api/books/1  ->  200 OK  Clean Code`],
            ['Verb to action mapping.',
                r`// POST   /api/books      -> create   (201 Created)
// GET    /api/books/1    -> read     (200 OK)
// PUT    /api/books/1    -> replace  (200 OK or 204)
// DELETE /api/books/1    -> remove   (204 No Content)

// OUTPUT:
// One URL per resource, the HTTP method decides the action.`]],
        [['Stateless check with MockMvc.',
            r`@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void getsOneBook() throws Exception {
        mvc.perform(get("/api/books/1"))
           .andExpect(status().isOk())
           .andExpect(content().string("Clean Code"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Created with Location header.',
                r`@PostMapping
ResponseEntity<Void> create(@RequestBody String title) {
    URI uri = URI.create("/api/books/3");
    return ResponseEntity.created(uri).build();
}

// OUTPUT:
// HTTP/1.1 201
// Location: /api/books/3`]]
    ),

    'mvc-restful-api-design': x(
        ['<b>RESTful API design</b> means modelling your domain as resources with clear URLs, correct HTTP methods and meaningful status codes.',
            '<b>Use nouns</b> in URLs: <code>/api/orders</code>, not <code>/api/getOrders</code>; the HTTP method is the verb.',
            '<b>Plural collections</b> and nesting: <code>/api/users/5/orders</code> reads as the orders of user 5.'],
        ['<b>Status codes</b>: 201 with a <code>Location</code> header on create, 204 on delete, 404 when missing, 400 for bad input.',
            '<b>Filtering and paging</b> use query parameters: <code>?page=0&amp;size=20&amp;sort=name</code>.',
            '<b>Versioning</b> through the path (<code>/api/v1</code>) or a header keeps old clients working.'],
        ['<b>Consistent errors</b>: return one error shape everywhere, ideally RFC 7807 <code>ProblemDetail</code>, via <code>@RestControllerAdvice</code>.',
            '<b>DTOs</b> keep the API contract separate from JPA entities, so schema changes do not break clients.',
            '<b>Idempotency</b>: make PUT and DELETE safe to retry; use an idempotency key for POST payments.'],
        [['F', 'Why use nouns in REST URLs?', 'The URL names the resource and the HTTP method is the action, so verbs in the URL are redundant.'],
            ['F', 'Which status code for a successful create?', '201 Created, with a Location header pointing to the new resource.'],
            ['M', 'PUT or PATCH?', 'PUT replaces the whole resource; PATCH changes only the sent fields.'],
            ['M', 'How do you version an API?', 'In the path (/v1), a custom header or a media type; path versioning is the simplest and most common.'],
            ['S', 'How do you design error responses?', 'One consistent body (such as ProblemDetail) with status, title, detail and a field error list, produced by a global advice.'],
            ['S', 'How do you page large collections?', 'Use page and size parameters, return total count and links, or cursor-based paging for very large data.']],
        [['CRUD design table in code.',
            r`@RestController
@RequestMapping("/api/v1/users")
class UserController {
    @GetMapping            List<UserDto> list(Pageable p)        { return null; }
    @GetMapping("/{id}")   UserDto get(@PathVariable Long id)    { return null; }
    @PostMapping           ResponseEntity<UserDto> create(@Valid @RequestBody UserDto d) {
        return null;
    }
    @PutMapping("/{id}")   UserDto replace(@PathVariable Long id, @Valid @RequestBody UserDto d) {
        return null;
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> delete(@PathVariable Long id) { return null; }
}

// OUTPUT:
// GET /api/v1/users?page=0&size=10  -> 200 OK`],
            ['Bad and good URLs.',
                r`// BAD : POST /api/createUser, GET /api/getUserById?id=5
// GOOD: POST /api/users,      GET /api/users/5
// GOOD: GET  /api/users/5/orders?status=PAID

// OUTPUT:
// Nouns for resources, query parameters for filters.`]],
        [['Missing resource returns 404.',
            r`@GetMapping("/{id}")
ResponseEntity<UserDto> get(@PathVariable Long id) {
    return service.find(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}

// OUTPUT:
// GET /api/v1/users/99 -> 404 Not Found`],
            ['Test the contract.',
                r`mvc.perform(post("/api/v1/users")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"\"}"))
   .andExpect(status().isBadRequest());

// OUTPUT:
// Status = 400 (validation failed)`]]
    ),

    'mvc-rest-controller': x(
        ['<b>REST controller</b> is a Spring bean that handles HTTP requests and writes the return value straight into the response body (usually JSON) instead of rendering a view.',
            '<b>Declare it</b> with <code>@RestController</code> and map methods with <code>@GetMapping</code>, <code>@PostMapping</code> and friends.',
            '<b>Return values</b> are converted by an <code>HttpMessageConverter</code>, normally Jackson for JSON.'],
        ['<b>Inputs</b>: <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code> and <code>@RequestHeader</code>.',
            '<b>ResponseEntity</b> lets you control status code, headers and body in one object.',
            '<b>Thin controller</b>: only translate HTTP to a service call and back; keep business logic in services.'],
        ['<b>Content negotiation</b>: <code>produces</code> and <code>consumes</code> plus the Accept header pick the converter.',
            '<b>Validation</b>: add <code>@Valid</code> on the body; failures raise <code>MethodArgumentNotValidException</code>.',
            '<b>Testing</b>: use <code>@WebMvcTest</code> with MockMvc and a <code>@MockBean</code> service for fast slice tests.'],
        [['F', 'What is a REST controller?', 'A class that serves HTTP requests and returns data such as JSON directly in the response body.'],
            ['F', 'Which annotation makes a class a REST controller?', '@RestController.'],
            ['M', 'How do you set a custom status code?', 'Return ResponseEntity with a status, or use @ResponseStatus on the method.'],
            ['M', 'Where does business logic go?', 'In a @Service class; the controller only handles the web layer.'],
            ['S', 'How is the return value turned into JSON?', 'RequestMappingHandlerAdapter uses RequestResponseBodyMethodProcessor, which picks MappingJackson2HttpMessageConverter.'],
            ['S', 'How do you unit test a REST controller?', '@WebMvcTest loads only the web layer; use MockMvc and mock the service with @MockBean.']],
        [['Hello REST controller.',
            r`@RestController
class HelloController {
    @GetMapping("/hello")
    Map<String, String> hello(@RequestParam(defaultValue = "world") String name) {
        return Map.of("message", "Hello " + name);
    }
}

// OUTPUT:
// GET /hello?name=Abaji
// {"message":"Hello Abaji"}`],
            ['Path variable and status.',
                r`@GetMapping("/items/{id}")
ResponseEntity<String> item(@PathVariable int id) {
    if (id > 100) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("none");
    return ResponseEntity.ok("item " + id);
}

// OUTPUT:
// GET /items/7   -> 200 item 7
// GET /items/500 -> 404 none`]],
        [['Slice test.',
            r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void greets() throws Exception {
        mvc.perform(get("/hello?name=Abaji"))
           .andExpect(jsonPath("$.message").value("Hello Abaji"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Controller with a service.',
                r`@RestController
@RequiredArgsConstructor
class OrderController {
    private final OrderService service;

    @GetMapping("/orders/{id}")
    OrderDto get(@PathVariable Long id) { return service.find(id); }
}

// OUTPUT:
// Controller stays thin; the service owns the logic.`]]
    ),

    'mvc-restcontroller-rest': x(
        ['<b>@RestController</b> is a stereotype annotation equal to <code>@Controller</code> plus <code>@ResponseBody</code> on every method.',
            '<b>Effect</b>: return values are written to the HTTP response body through message converters, never resolved as a view name.',
            '<b>Component scanning</b> registers it as a bean, so it also works with constructor injection.'],
        ['<b>Compare</b>: <code>@Controller</code> returns view names for Thymeleaf or JSP, while <code>@RestController</code> returns data.',
            '<b>Mixing</b>: if one class needs both, use <code>@Controller</code> and add <code>@ResponseBody</code> only on data methods.',
            '<b>Combine</b> with <code>@RequestMapping</code> on the class for a shared base path.'],
        ['<b>Meta-annotation</b>: it is annotated with <code>@Controller</code> and <code>@ResponseBody</code>, which is why it works with all their features.',
            '<b>Return types</b> that bypass conversion: <code>String</code> goes through StringHttpMessageConverter as plain text, not JSON.',
            '<b>Void and null</b> return an empty body with status 200 unless you set another status.'],
        [['F', 'What is @RestController?', 'A shortcut annotation combining @Controller and @ResponseBody.'],
            ['F', 'What happens to the returned object?', 'It is converted (for example to JSON) and written to the response body.'],
            ['M', 'Difference between @Controller and @RestController?', '@Controller usually returns a view name; @RestController returns the body directly.'],
            ['M', 'Why does my REST endpoint return a 404 page for a view?', 'The class is annotated with @Controller without @ResponseBody, so Spring looks for a view with that name.'],
            ['S', 'Which component handles a @ResponseBody return value?', 'RequestResponseBodyMethodProcessor, which calls the matching HttpMessageConverter.'],
            ['S', 'Is a String return converted to JSON?', 'No, it is written as text/plain; wrap it in an object or set produces to get JSON.']],
        [['Equivalent forms.',
            r`@RestController
class A {
    @GetMapping("/a") String a() { return "A"; }
}

@Controller
@ResponseBody
class B {
    @GetMapping("/b") String b() { return "B"; }
}

// OUTPUT:
// GET /a -> A
// GET /b -> B (identical behaviour)`],
            ['Wrong annotation pitfall.',
                r`@Controller
class C {
    @GetMapping("/c") String c() { return "hello"; }   // looks for view "hello"
}

// OUTPUT:
// 404 or TemplateInputException: view "hello" not found`]],
        [['Test returns JSON.',
            r`mvc.perform(get("/users/1"))
   .andExpect(status().isOk())
   .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
   .andExpect(jsonPath("$.name").value("Abaji"));

// OUTPUT:
// Content-Type: application/json`],
            ['Single method override.',
                r`@Controller
class PageController {
    @GetMapping("/home")  String home() { return "home"; }        // view
    @GetMapping("/ping") @ResponseBody String ping() { return "pong"; }  // data
}

// OUTPUT:
// GET /home -> renders home.html
// GET /ping -> pong`]]
    ),

    'mvc-json-request': x(
        ['<b>JSON request</b> means the client sends a JSON document in the HTTP body, usually with <code>POST</code> or <code>PUT</code> and the header <code>Content-Type: application/json</code>.',
            '<b>@RequestBody</b> tells Spring to read that body and convert it into a Java object.',
            '<b>Conversion</b> is done by Jackson; field names in JSON map to properties of the class.'],
        ['<b>Class shape</b>: a record or a class with a no-args constructor and getters and setters works best.',
            '<b>Validation</b>: add <code>@Valid</code> with <code>@NotBlank</code> or <code>@Size</code> on the fields.',
            '<b>Unknown fields</b> are ignored by default in Spring Boot, because <code>FAIL_ON_UNKNOWN_PROPERTIES</code> is off.'],
        ['<b>Errors</b>: malformed JSON gives <code>HttpMessageNotReadableException</code> (400); a wrong content type gives 415.',
            '<b>Body is read once</b>; to read it twice (for logging) wrap the request in a caching wrapper.',
            '<b>Lists and generics</b> work as <code>@RequestBody List&lt;Item&gt;</code> because Spring keeps the generic type.'],
        [['F', 'What does @RequestBody do?', 'It binds the HTTP request body to a method parameter by converting JSON into a Java object.'],
            ['F', 'Which header must the client send?', 'Content-Type: application/json.'],
            ['M', 'What status for malformed JSON?', '400 Bad Request, from HttpMessageNotReadableException.'],
            ['M', 'What status for a wrong media type?', '415 Unsupported Media Type.'],
            ['S', 'Which class reads the body?', 'RequestResponseBodyMethodProcessor with MappingJackson2HttpMessageConverter.'],
            ['S', 'How do you accept a partial update?', 'Use PATCH with a DTO of optional fields, or JSON Merge Patch handled manually.']],
        [['Create a user from JSON.',
            r`record UserDto(@NotBlank String name, @Email String email) {}

@PostMapping("/users")
ResponseEntity<UserDto> create(@Valid @RequestBody UserDto dto) {
    return ResponseEntity.status(201).body(dto);
}

// OUTPUT:
// POST /users {"name":"Abaji","email":"a@x.com"}
// 201 {"name":"Abaji","email":"a@x.com"}`],
            ['List body.',
                r`@PostMapping("/bulk")
int bulk(@RequestBody List<String> names) {
    return names.size();
}

// OUTPUT:
// POST /bulk ["a","b","c"] -> 3`]],
        [['Test with MockMvc.',
            r`mvc.perform(post("/users")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Abaji\",\"email\":\"a@x.com\"}"))
   .andExpect(status().isCreated());

// OUTPUT:
// Status = 201`],
            ['Bad JSON.',
                r`mvc.perform(post("/users")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{name:"))
   .andExpect(status().isBadRequest());

// OUTPUT:
// Status = 400 (HttpMessageNotReadableException)`]]
    ),

    'mvc-json-response': x(
        ['<b>JSON response</b> is a JSON document written into the HTTP response body with header <code>Content-Type: application/json</code>.',
            '<b>Return an object</b> from a <code>@RestController</code> method and Spring serializes it with Jackson automatically.',
            '<b>Collections and records</b> work too: a <code>List</code> becomes a JSON array, a record becomes an object.'],
        ['<b>ResponseEntity</b> sets the status and headers together with the body.',
            '<b>Content type</b> can be forced with <code>produces = MediaType.APPLICATION_JSON_VALUE</code>.',
            '<b>Error bodies</b> should also be JSON, built by <code>@RestControllerAdvice</code> or <code>ProblemDetail</code>.'],
        ['<b>Hide fields</b> with <code>@JsonIgnore</code> and rename with <code>@JsonProperty</code>.',
            '<b>Never return entities</b> with lazy relations directly; map to DTOs to avoid lazy-loading errors and data leaks.',
            '<b>Dates</b> become ISO strings when <code>WRITE_DATES_AS_TIMESTAMPS</code> is false (the Spring Boot default).'],
        [['F', 'How does a controller return JSON?', 'Return an object from a @RestController method; Jackson converts it.'],
            ['F', 'Which content type is sent?', 'application/json.'],
            ['M', 'How do you set status and headers?', 'Return ResponseEntity.'],
            ['M', 'How do you hide a field?', 'Use @JsonIgnore on the field or return a DTO without it.'],
            ['S', 'Why avoid returning JPA entities?', 'Lazy proxies, cycles and sensitive fields can break serialization or leak data; DTOs give a stable contract.'],
            ['S', 'How does Spring pick JSON over XML?', 'Content negotiation compares the Accept header with converters; Jackson JSON comes first by default.']],
        [['Object to JSON.',
            r`record Product(long id, String name, double price) {}

@GetMapping("/products/1")
Product one() { return new Product(1, "Pen", 9.5); }

// OUTPUT:
// {"id":1,"name":"Pen","price":9.5}`],
            ['ResponseEntity with header.',
                r`@GetMapping("/products")
ResponseEntity<List<Product>> all() {
    return ResponseEntity.ok()
        .header("X-Total-Count", "2")
        .body(List.of(new Product(1, "Pen", 9.5), new Product(2, "Ink", 3)));
}

// OUTPUT:
// 200 X-Total-Count: 2
// [{"id":1,"name":"Pen","price":9.5},{"id":2,"name":"Ink","price":3.0}]`]],
        [['Assert JSON with jsonPath.',
            r`mvc.perform(get("/products/1"))
   .andExpect(status().isOk())
   .andExpect(jsonPath("$.name").value("Pen"))
   .andExpect(jsonPath("$.price").value(9.5));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Hide a field.',
                r`class Account {
    public String user = "abaji";
    @JsonIgnore public String password = "secret";
}

// OUTPUT:
// {"user":"abaji"}`]]
    ),

    'mvc-jackson': x(
        ['<b>Jackson</b> is the JSON library Spring Boot uses by default to turn Java objects into JSON and back.',
            '<b>Modules</b>: <code>jackson-databind</code> does the mapping, and add-ons such as <code>jackson-datatype-jsr310</code> handle Java time types.',
            '<b>Spring Boot</b> includes it through <code>spring-boot-starter-web</code> and configures it automatically.'],
        ['<b>Annotations</b>: <code>@JsonProperty</code>, <code>@JsonIgnore</code>, <code>@JsonInclude</code>, <code>@JsonFormat</code> and <code>@JsonCreator</code>.',
            '<b>Properties</b>: <code>spring.jackson.*</code> in <code>application.properties</code> tunes the shared mapper.',
            '<b>Records</b> are supported out of the box in Jackson 2.12 and later.'],
        ['<b>Auto-configuration</b>: <code>JacksonAutoConfiguration</code> builds one <code>ObjectMapper</code> bean and registers modules found on the classpath.',
            '<b>Customizing</b>: define a <code>Jackson2ObjectMapperBuilderCustomizer</code> bean instead of creating your own mapper.',
            '<b>Security</b>: avoid default typing on untrusted input, because polymorphic deserialization can be exploited.'],
        [['F', 'What is Jackson?', 'The default Java library for converting objects to JSON and JSON to objects.'],
            ['F', 'Which starter brings it?', 'spring-boot-starter-web (through spring-boot-starter-json).'],
            ['M', 'How do you rename a JSON field?', 'Use @JsonProperty("newName") on the field or getter.'],
            ['M', 'How do you change global settings?', 'Use spring.jackson.* properties or a Jackson2ObjectMapperBuilderCustomizer bean.'],
            ['S', 'How does Spring connect Jackson to MVC?', 'MappingJackson2HttpMessageConverter wraps the ObjectMapper and is registered as a message converter.'],
            ['S', 'Why not create your own ObjectMapper with new?', 'You lose Spring Boot configuration and modules such as JavaTimeModule; inject the managed bean instead.']],
        [['Annotations in action.',
            r`@JsonInclude(JsonInclude.Include.NON_NULL)
record Person(
    @JsonProperty("full_name") String name,
    @JsonIgnore String password,
    String nickname) {}

// new Person("Abaji", "pw", null) serializes to:
// OUTPUT:
// {"full_name":"Abaji"}`],
            ['Boot properties.',
                r`spring.jackson.property-naming-strategy=SNAKE_CASE
spring.jackson.default-property-inclusion=non_null
spring.jackson.deserialization.fail-on-unknown-properties=true

# OUTPUT:
# firstName is written as first_name, nulls are skipped`]],
        [['Customizer bean.',
            r`@Bean
Jackson2ObjectMapperBuilderCustomizer customizer() {
    return b -> b.featuresToEnable(SerializationFeature.INDENT_OUTPUT);
}

// OUTPUT:
// Responses are pretty printed with indentation.`],
            ['JSON slice test.',
                r`@JsonTest
class PersonJsonTest {
    @Autowired JacksonTester<Person> json;

    @Test
    void writes() throws Exception {
        assertThat(json.write(new Person("Abaji", "pw", null)))
            .hasJsonPathStringValue("$.full_name");
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-objectmapper': x(
        ['<b>ObjectMapper</b> is the central Jackson class: <code>writeValueAsString</code> converts an object to JSON and <code>readValue</code> converts JSON to an object.',
            '<b>Thread safe</b> once configured, so share one instance instead of creating a new one per call.',
            '<b>In Spring Boot</b> you simply inject the auto-configured bean with <code>@Autowired</code> or constructor injection.'],
        ['<b>Generics</b> need a <code>TypeReference</code>: <code>readValue(json, new TypeReference&lt;List&lt;User&gt;&gt;() {})</code>.',
            '<b>Tree model</b>: <code>readTree</code> gives a <code>JsonNode</code> for dynamic JSON without a class.',
            '<b>Conversion</b>: <code>convertValue</code> maps one object type to another, such as a Map to a DTO.'],
        ['<b>Checked exception</b>: methods throw <code>JsonProcessingException</code>, so wrap them or declare throws.',
            '<b>Configuration</b>: <code>configure(DeserializationFeature...)</code> and modules like <code>JavaTimeModule</code> must be set before first use.',
            '<b>Reuse</b>: <code>ObjectReader</code> and <code>ObjectWriter</code> are cheaper, immutable views for repeated work.'],
        [['F', 'What does ObjectMapper do?', 'It converts Java objects to JSON and JSON to Java objects.'],
            ['F', 'How do you get it in Spring Boot?', 'Inject the auto-configured ObjectMapper bean.'],
            ['M', 'How do you read a JSON list of users?', 'Use a TypeReference such as new TypeReference<List<User>>(){} to keep the generic type.'],
            ['M', 'Is ObjectMapper thread safe?', 'Yes after configuration; configure once and reuse it.'],
            ['S', 'Why does LocalDate fail with a plain new ObjectMapper?', 'The JavaTimeModule is not registered; the Boot bean registers it for you.'],
            ['S', 'When use readTree?', 'For dynamic or partly unknown JSON where you read a few fields without a full class.']],
        [['Write and read.',
            r`ObjectMapper om = new ObjectMapper();
record Item(String name, int qty) {}

String json = om.writeValueAsString(new Item("pen", 3));
Item back = om.readValue(json, Item.class);
System.out.println(json + " -> " + back);

// OUTPUT:
// {"name":"pen","qty":3} -> Item[name=pen, qty=3]`],
            ['Tree model.',
                r`JsonNode root = om.readTree("{\"user\":{\"name\":\"Abaji\"},\"tags\":[\"a\",\"b\"]}");
System.out.println(root.path("user").path("name").asText());
System.out.println(root.get("tags").size());

// OUTPUT:
// Abaji
// 2`]],
        [['Inject and use.',
            r`@Service
class AuditService {
    private final ObjectMapper mapper;
    AuditService(ObjectMapper mapper) { this.mapper = mapper; }

    String snapshot(Object o) throws JsonProcessingException {
        return mapper.writeValueAsString(o);
    }
}

// OUTPUT:
// Uses the Spring configured mapper (dates as ISO strings).`],
            ['Generic list.',
                r`List<Item> items = om.readValue(
    "[{\"name\":\"a\",\"qty\":1},{\"name\":\"b\",\"qty\":2}]",
    new TypeReference<List<Item>>() {});
System.out.println(items.size());

// OUTPUT:
// 2`]]
    ),

    'mvc-json-serialization': x(
        ['<b>Serialization</b> is turning a Java object into JSON text; in Spring MVC it happens when a controller returns an object.',
            '<b>Property discovery</b>: Jackson uses public getters (or record components) to find properties and their names.',
            '<b>Result</b>: nested objects become nested JSON objects and collections become arrays.'],
        ['<b>Control output</b> with <code>@JsonProperty</code>, <code>@JsonIgnore</code>, <code>@JsonInclude</code> and <code>@JsonPropertyOrder</code>.',
            '<b>Dates</b>: use <code>@JsonFormat(pattern = ...)</code> or keep the ISO default from the Boot mapper.',
            '<b>Custom serializer</b>: extend <code>JsonSerializer</code> (or use <code>@JsonComponent</code>) for special types such as money.'],
        ['<b>Cycles</b>: bidirectional JPA relations cause infinite recursion; use DTOs, <code>@JsonManagedReference</code> or <code>@JsonIgnore</code>.',
            '<b>Lazy proxies</b> can fail with Hibernate; map to DTOs inside the transaction.',
            '<b>Views</b>: <code>@JsonView</code> chooses different field sets per endpoint without more classes.'],
        [['F', 'What is JSON serialization?', 'Converting a Java object into a JSON string.'],
            ['F', 'Which fields are written?', 'Properties with public getters or record components, unless ignored.'],
            ['M', 'How do you skip null fields?', '@JsonInclude(NON_NULL) or spring.jackson.default-property-inclusion=non_null.'],
            ['M', 'What is a typical cause of infinite recursion?', 'Parent and child entities referencing each other, which makes the object graph cyclic.'],
            ['S', 'How do you write a custom serializer in Boot?', 'Annotate a JsonSerializer subclass with @JsonComponent and Boot registers it.'],
            ['S', 'How do you show different fields to different roles?', 'Use @JsonView with view marker classes and annotate the controller method.']],
        [['Rename, skip, order.',
            r`@JsonPropertyOrder({"id", "title"})
record Post(long id, String title, @JsonIgnore String internal) {}

String s = new ObjectMapper().writeValueAsString(new Post(1, "Hi", "x"));
System.out.println(s);

// OUTPUT:
// {"id":1,"title":"Hi"}`],
            ['Date format.',
                r`class Event {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    public LocalDate day = LocalDate.of(2026, 10, 8);
}

// OUTPUT:
// {"day":"08-10-2026"}`]],
        [['Custom serializer.',
            r`@JsonComponent
class MoneySerializer extends JsonSerializer<BigDecimal> {
    @Override
    public void serialize(BigDecimal v, JsonGenerator g, SerializerProvider p)
            throws IOException {
        g.writeString(v.setScale(2, RoundingMode.HALF_UP).toPlainString());
    }
}

// OUTPUT:
// BigDecimal 5 is written as "5.00"`],
            ['Assert the JSON.',
                r`mvc.perform(get("/posts/1"))
   .andExpect(jsonPath("$.title").value("Hi"))
   .andExpect(jsonPath("$.internal").doesNotExist());

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-json-deserialization': x(
        ['<b>Deserialization</b> is turning JSON text into a Java object; in Spring MVC it happens for <code>@RequestBody</code> parameters.',
            '<b>How</b>: Jackson creates the object through a constructor (or no-args constructor) and fills properties by name.',
            '<b>Mapping</b>: JSON keys match Java property names; types are converted, for example a number to <code>int</code>.'],
        ['<b>Records and constructors</b>: records work directly; for classes use <code>@JsonCreator</code> with <code>@JsonProperty</code> parameters.',
            '<b>Different names</b>: <code>@JsonProperty("user_name")</code> or <code>@JsonAlias</code> accept alternative keys.',
            '<b>Unknown fields</b> are ignored in Spring Boot unless you enable <code>FAIL_ON_UNKNOWN_PROPERTIES</code>.'],
        ['<b>Errors</b>: bad syntax or a type mismatch (text for a number) raises <code>HttpMessageNotReadableException</code> and a 400 response.',
            '<b>Polymorphism</b>: use <code>@JsonTypeInfo</code> and <code>@JsonSubTypes</code> with a whitelist, never open default typing.',
            '<b>Custom deserializer</b>: extend <code>JsonDeserializer</code> for odd formats such as "12,50" money strings.'],
        [['F', 'What is deserialization?', 'Converting JSON text into a Java object.'],
            ['F', 'Where does Spring MVC deserialize?', 'When it binds a @RequestBody parameter.'],
            ['M', 'What happens with unknown JSON fields?', 'They are ignored by default in Spring Boot; you can make them fail with a property.'],
            ['M', 'How do you accept an alternate key name?', 'Use @JsonAlias on the property.'],
            ['S', 'Why must some classes have a no-args constructor?', 'Jackson needs a way to instantiate the class; otherwise use @JsonCreator or a record.'],
            ['S', 'Why is default typing dangerous?', 'Attackers can pick arbitrary classes to instantiate (gadget attacks), so use explicit subtype whitelists.']],
        [['Record deserialization.',
            r`record Login(String user, String password) {}

Login l = new ObjectMapper()
    .readValue("{\"user\":\"abaji\",\"password\":\"pw\"}", Login.class);
System.out.println(l.user());

// OUTPUT:
// abaji`],
            ['Creator and alias.',
                r`class Customer {
    final String name;
    @JsonCreator
    Customer(@JsonProperty("name") @JsonAlias({"full_name", "fullName"}) String name) {
        this.name = name;
    }
}

// OUTPUT:
// {"full_name":"Abaji"} and {"name":"Abaji"} both give name = Abaji`]],
        [['Strict unknown fields.',
            r`spring.jackson.deserialization.fail-on-unknown-properties=true

# OUTPUT:
# POST {"user":"a","extra":1}
-> 400 Unrecognized field "extra"`],
            ['Type mismatch test.',
                r`mvc.perform(post("/orders")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"qty\":\"many\"}"))
   .andExpect(status().isBadRequest());

// OUTPUT:
// Status = 400 (cannot deserialize int from "many")`]]
    )
};

export const smvc16Deep: Record<string, Deep> = {
    'mvc-rest-architecture': dv(
        [`<p>A REST call in Spring MVC passes through these components:</p><ul><li><b>DispatcherServlet</b> receives every request (front controller).</li><li><b>HandlerMapping</b> finds the controller method from URL and HTTP method.</li><li><b>HandlerAdapter</b> resolves arguments (<code>@RequestBody</code>, <code>@PathVariable</code>) and invokes the method.</li><li><b>HttpMessageConverter</b> reads the request body and writes the return value.</li><li><b>Exception resolvers</b> turn thrown exceptions into error responses.</li></ul>`,
            r`// Request flow (simplified)
// Client -> Filter chain -> DispatcherServlet
//        -> RequestMappingHandlerMapping (find method)
//        -> RequestMappingHandlerAdapter (args + invoke)
//        -> Controller -> Service -> Repository
//        -> HttpMessageConverter (write JSON) -> Client

// OUTPUT:
// GET /api/books/1 -> BookController.one(1) -> {"id":1,"title":"Clean Code"}`],
        [`<p>REST architectural constraints and what they mean in practice:</p><ul><li><b>Client-server:</b> UI and data storage are separate.</li><li><b>Stateless:</b> no server session between calls.</li><li><b>Cacheable:</b> responses declare whether they can be cached.</li><li><b>Uniform interface:</b> resources, representations, standard verbs.</li><li><b>Layered system:</b> proxies, gateways and load balancers sit between client and server.</li><li><b>Code on demand:</b> optional.</li></ul>`,
            r`@GetMapping("/{id}")
ResponseEntity<BookDto> get(@PathVariable Long id) {
    BookDto dto = service.find(id);
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
        .eTag("v" + dto.version())
        .body(dto);
}

// OUTPUT:
// 200 Cache-Control: max-age=300
// ETag: "v3"`],
        [`<p>Common architecture mistakes:</p><ul><li><b>Server session state:</b> breaks horizontal scaling; use tokens.</li><li><b>Verbs in URLs:</b> use nouns plus HTTP methods.</li><li><b>Always returning 200:</b> use proper codes.</li><li><b>POST for everything:</b> loses caching and idempotency.</li><li><b>Chatty APIs:</b> too many tiny calls; offer aggregate endpoints.</li></ul>`,
            r`// WRONG
@PostMapping("/getBook")  BookDto getBook(@RequestBody IdReq r) { return null; }

// RIGHT
@GetMapping("/books/{id}") BookDto getBook(@PathVariable Long id) { return null; }

// OUTPUT:
// The second form can be cached, bookmarked and retried safely.`],
        [`<p>Performance tuning for REST services:</p><ul><li><b>HTTP caching</b> with ETag and <code>ShallowEtagHeaderFilter</code> saves bandwidth.</li><li><b>Compression</b>: <code>server.compression.enabled=true</code>.</li><li><b>Pagination</b> for large collections.</li><li><b>Avoid N+1 queries</b> behind the API with fetch joins.</li><li><b>Keep-alive</b> and HTTP/2 reduce connection cost.</li></ul>`,
            r`server.compression.enabled=true
server.compression.min-response-size=1024
server.http2.enabled=true

# OUTPUT:
# JSON responses over 1 KB are gzip compressed`],
        [`<p>Real-world scenario: an order service behind an API gateway.</p><ul><li>The gateway validates the JWT and forwards the request.</li><li>Any instance can answer, because nothing is stored in a session.</li><li>The controller maps to DTOs; the service runs in a transaction.</li><li>Errors return ProblemDetail JSON with the right status.</li></ul>`,
            r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(OrderNotFound.class)
    ProblemDetail notFound(OrderNotFound e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }
}

// OUTPUT:
// 404 {"status":404,"detail":"Order 42 not found","title":"Not Found"}`]
    ),

    'mvc-restful-api-design': dv(
        [`<p>How design decisions map to Spring internals:</p><ul><li><b>URL and verb</b> are matched by <code>RequestMappingInfo</code> conditions (path, method, consumes, produces).</li><li><b>Status</b> comes from <code>ResponseEntity</code>, <code>@ResponseStatus</code> or an exception resolver.</li><li><b>Paging</b> parameters are bound to <code>Pageable</code> by <code>PageableHandlerMethodArgumentResolver</code> (Spring Data).</li><li><b>Errors</b> are produced by <code>ResponseEntityExceptionHandler</code> or your advice.</li></ul>`,
            r`@GetMapping
Page<ProductDto> list(@RequestParam(required = false) String q,
                      @PageableDefault(size = 20, sort = "name") Pageable pageable) {
    return service.search(q, pageable);
}

// OUTPUT:
// GET /api/products?q=pen&page=1&size=5
// {"content":[...],"totalElements":42,"number":1,"size":5}`],
        [`<p>Design variants worth knowing:</p><ul><li><b>Versioning:</b> path, header (<code>X-API-Version</code>) or media type.</li><li><b>Sub-resources:</b> <code>/orders/5/items</code>; keep nesting to two levels.</li><li><b>Actions:</b> model as sub-resource, for example <code>POST /orders/5/cancellation</code>.</li><li><b>Filtering:</b> query parameters; sorting with <code>sort=price,desc</code>.</li><li><b>Bulk:</b> POST an array, return a per-item result.</li></ul>`,
            r`@RestController
@RequestMapping("/api/v1/orders")
class OrderApi {
    @PostMapping("/{id}/cancellation")
    ResponseEntity<Void> cancel(@PathVariable Long id) {
        return ResponseEntity.accepted().build();
    }

    @GetMapping(value = "/{id}", headers = "X-API-Version=2")
    OrderV2 getV2(@PathVariable Long id) { return null; }
}

// OUTPUT:
// POST /api/v1/orders/5/cancellation -> 202 Accepted`],
        [`<p>Frequent design mistakes:</p><ul><li><b>Exposing entities:</b> use DTOs.</li><li><b>200 with error text:</b> use correct status codes.</li><li><b>Inconsistent naming:</b> pick one case style (camelCase) everywhere.</li><li><b>Unbounded lists:</b> always page.</li><li><b>Breaking changes in place:</b> add fields, do not remove or rename without a new version.</li></ul>`,
            r`// WRONG: 200 and an error message in the body
// {"success":false,"message":"not found"}

// RIGHT: real status and a problem body
// HTTP/1.1 404
// {"type":"about:blank","title":"Not Found","status":404,"detail":"User 9 not found"}

// OUTPUT:
// Clients and monitoring tools can rely on the status line.`],
        [`<p>Tuning API design for speed:</p><ul><li><b>Sparse fields</b>: let clients ask for only the fields they need.</li><li><b>Conditional GET</b> with ETag returns 304 without a body.</li><li><b>Cursor paging</b> beats offset paging on big tables.</li><li><b>Limit page size</b> with a maximum to protect the database.</li></ul>`,
            r`spring.data.web.pageable.max-page-size=100
spring.data.web.pageable.default-page-size=20

# OUTPUT:
# GET /api/users?size=5000 is capped at 100 rows`],
        [`<p>Real-world scenario: an e-commerce catalogue API.</p><ul><li>Public GET endpoints are cacheable and paged.</li><li>Write endpoints need a JWT and validate input.</li><li>A v2 path is introduced when the price object changes shape.</li><li>Contract tests (MockMvc) lock the JSON shape for each version.</li></ul>`,
            r`@Test
void v1KeepsShape() throws Exception {
    mvc.perform(get("/api/v1/products/1"))
       .andExpect(jsonPath("$.price").isNumber());
    mvc.perform(get("/api/v2/products/1"))
       .andExpect(jsonPath("$.price.amount").isNumber());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-rest-controller': dv(
        [`<p>What happens when a REST controller method runs:</p><ul><li><b>RequestMappingHandlerAdapter</b> builds an <code>InvocableHandlerMethod</code>.</li><li><b>Argument resolvers</b> fill parameters (<code>@PathVariable</code>, <code>@RequestBody</code>).</li><li>The method is invoked by reflection.</li><li><b>Return value handlers</b> pick <code>RequestResponseBodyMethodProcessor</code> because of <code>@ResponseBody</code>.</li><li>The processor selects a converter by Accept header and writes the body.</li></ul>`,
            r`// Pseudo flow for: @GetMapping("/hello") Map<String,String> hello()
// 1. HandlerMapping finds HelloController.hello
// 2. no arguments to resolve
// 3. invoke -> Map.of("message","Hello")
// 4. RequestResponseBodyMethodProcessor.handleReturnValue
// 5. MappingJackson2HttpMessageConverter.write(...)

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json
// {"message":"Hello"}`],
        [`<p>Controller method options:</p><ul><li><b>Return types:</b> object, <code>ResponseEntity</code>, <code>void</code> with <code>@ResponseStatus</code>, <code>Optional</code> (not unwrapped specially), reactive or <code>Callable</code> for async.</li><li><b>Mapping attributes:</b> <code>path</code>, <code>method</code>, <code>params</code>, <code>headers</code>, <code>consumes</code>, <code>produces</code>.</li><li><b>Shortcuts:</b> <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@PatchMapping</code>, <code>@DeleteMapping</code>.</li></ul>`,
            r`@RestController
@RequestMapping(path = "/api/notes", produces = MediaType.APPLICATION_JSON_VALUE)
class NoteController {
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    Note add(@Valid @RequestBody Note n) { return n; }

    @GetMapping("/slow")
    Callable<String> slow() { return () -> "done"; }   // async processing
}

// OUTPUT:
// POST /api/notes -> 201 Created`],
        [`<p>Mistakes and fixes:</p><ul><li><b>@Controller instead of @RestController:</b> add the right annotation.</li><li><b>Business logic in the controller:</b> move it to a service.</li><li><b>Returning entities:</b> return DTOs.</li><li><b>Catching exceptions in each method:</b> use one <code>@RestControllerAdvice</code>.</li><li><b>Field injection:</b> use constructor injection for testability.</li><li><b>Missing @RequestBody:</b> the parameter is then bound from form or query data and stays empty.</li></ul>`,
            r`// WRONG: body is not bound, fields stay null
@PostMapping("/users") User add(User u) { return u; }

// RIGHT
@PostMapping("/users") User add(@RequestBody User u) { return u; }

// OUTPUT:
// First form: {"name":null}; second form: {"name":"Abaji"}`],
        [`<p>Performance tips for controllers:</p><ul><li>Keep methods short and non-blocking in logic.</li><li>Use <code>Callable</code> or virtual threads (<code>spring.threads.virtual.enabled=true</code> in Boot 3.2+) for blocking calls under load.</li><li>Avoid reading the body twice.</li><li>Return DTOs with only needed fields.</li><li>Cache read-heavy responses with <code>Cache-Control</code>.</li></ul>`,
            r`spring.threads.virtual.enabled=true
server.tomcat.threads.max=200

# OUTPUT:
# Request handling uses virtual threads on Java 21`],
        [`<p>Real-world scenario: a payments controller.</p><ul><li>Validates the body with <code>@Valid</code>.</li><li>Delegates to <code>PaymentService</code> inside a transaction.</li><li>Returns 201 with a Location header.</li><li>Domain errors become 409 or 422 through the advice.</li></ul>`,
            r`@PostMapping("/payments")
ResponseEntity<PaymentDto> pay(@Valid @RequestBody PaymentRequest req) {
    PaymentDto p = service.pay(req);
    return ResponseEntity.created(URI.create("/payments/" + p.id())).body(p);
}

// OUTPUT:
// 201 Created
// Location: /payments/9001`]
    ),

    'mvc-restcontroller-rest': dv(
        [`<p>The annotation is defined like this in the framework:</p><ul><li><code>@RestController</code> is meta-annotated with <code>@Controller</code> and <code>@ResponseBody</code>.</li><li>Spring checks for <code>@ResponseBody</code> on the method or declaring class when it selects a return value handler.</li><li><code>RequestResponseBodyMethodProcessor</code> supports the return type, so <code>ViewNameMethodReturnValueHandler</code> is skipped.</li><li>Component scanning picks the class up because <code>@Controller</code> is a <code>@Component</code>.</li></ul>`,
            r`@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody
public @interface RestController {
    @AliasFor(annotation = Controller.class)
    String value() default "";
}

// OUTPUT:
// Simplified view of the real declaration (Spring Framework 6).`],
        [`<p>Variants and combinations:</p><ul><li><b>Class level path:</b> <code>@RequestMapping("/api")</code>.</li><li><b>Bean name:</b> <code>@RestController("orders")</code>.</li><li><b>ResponseEntity</b> still works and wins for status and headers.</li><li><b>Mixed controller:</b> <code>@Controller</code> with <code>@ResponseBody</code> on single methods.</li><li><b>@RestControllerAdvice</b> is the matching annotation for global error handling.</li></ul>`,
            r`@RestController("catalog")
@RequestMapping("/api/catalog")
class CatalogController {
    @GetMapping("/count")
    long count() { return 42; }          // written as text/plain? no: JSON number
}

// OUTPUT:
// GET /api/catalog/count -> 42`],
        [`<p>Common mistakes:</p><ul><li><b>Wanting a view from a @RestController:</b> it returns the view name as text; use @Controller.</li><li><b>String returns expected as JSON:</b> a String is plain text.</li><li><b>Forgetting the Jackson dependency:</b> then no converter exists and you get 406 or 500.</li><li><b>Null body:</b> returns an empty 200; return 404 explicitly.</li></ul>`,
            r`@RestController
class PageController {
    @GetMapping("/home")
    String home() { return "home"; }     // WRONG for a page: body is the text "home"
}

// OUTPUT:
// GET /home -> 200 text/plain: home   (no HTML page is rendered)`],
        [`<p>Performance note: the annotation costs nothing at run time beyond a handler lookup, since metadata is cached at startup. What matters is the converter work.</p><ul><li>Return a <code>String</code> or <code>byte[]</code> to skip Jackson when you already have the payload.</li><li>Stream large results with <code>StreamingResponseBody</code> or <code>ResponseBodyEmitter</code>.</li></ul>`,
            r`@GetMapping("/export")
StreamingResponseBody export() {
    return out -> {
        for (int i = 0; i < 3; i++) out.write(("row " + i + "\n").getBytes());
    };
}

// OUTPUT:
// row 0
// row 1
// row 2`],
        [`<p>Real-world scenario: a hybrid app with Thymeleaf pages and a JSON API.</p><ul><li>Page controllers use <code>@Controller</code> and return view names.</li><li>API controllers use <code>@RestController</code> under <code>/api</code>.</li><li>A <code>@RestControllerAdvice</code> limited by <code>basePackages</code> formats errors for the API only.</li></ul>`,
            r`@RestControllerAdvice(basePackageClasses = ApiMarker.class)
class ApiAdvice {
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> bad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

// OUTPUT:
// 400 {"error":"qty must be positive"}`]
    ),

    'mvc-json-request': dv(
        [`<p>How the request body is bound:</p><ul><li><code>RequestResponseBodyMethodProcessor</code> resolves the <code>@RequestBody</code> argument.</li><li>It checks the <code>Content-Type</code> against each converter's <code>canRead</code>.</li><li><code>MappingJackson2HttpMessageConverter</code> calls <code>ObjectMapper.readValue</code> on the input stream.</li><li>If <code>@Valid</code> is present, a validator runs and may throw <code>MethodArgumentNotValidException</code>.</li></ul>`,
            r`// Flow for POST /users with JSON
// 1. DispatcherServlet -> handler method found
// 2. Content-Type application/json -> Jackson converter chosen
// 3. readValue(stream, UserDto.class)
// 4. @Valid -> Bean Validation
// 5. controller method receives UserDto

// OUTPUT:
// Missing or wrong Content-Type -> 415 before the method is called`],
        [`<p>Request body variants:</p><ul><li><b>DTO or record</b> for objects.</li><li><b>List or Map</b> for arrays and free-form JSON.</li><li><b>JsonNode</b> for dynamic structure.</li><li><b>String</b> for the raw body.</li><li><b>HttpEntity</b> to read body and headers together.</li><li><b>@RequestPart</b> for JSON inside multipart requests.</li><li><b>required = false</b> makes an empty body allowed.</li></ul>`,
            r`@PostMapping("/raw")
String raw(@RequestBody String body) { return "len=" + body.length(); }

@PostMapping("/dynamic")
String dyn(@RequestBody JsonNode n) { return n.path("type").asText("none"); }

@PostMapping("/opt")
String opt(@RequestBody(required = false) Map<String, Object> m) {
    return m == null ? "empty" : "keys=" + m.size();
}

// OUTPUT:
// POST /dynamic {"type":"A"} -> A
// POST /opt (no body)        -> empty`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Missing Content-Type:</b> add the header in the client.</li><li><b>No default constructor in a plain class:</b> add one, or use a record.</li><li><b>Single quotes or trailing commas:</b> invalid JSON gives 400.</li><li><b>Mixing @RequestBody and @ModelAttribute</b> for the same data.</li><li><b>Date format mismatch:</b> send ISO text like 2026-10-08.</li><li><b>Reading getInputStream after @RequestBody:</b> the stream is already consumed.</li></ul>`,
            r`// WRONG client call
// curl -X POST /users -d '{"name":"Abaji"}'            -> 415 (form content type)

// RIGHT
// curl -X POST /users -H "Content-Type: application/json" -d '{"name":"Abaji"}'

// OUTPUT:
// 415 Unsupported Media Type, then 201 Created`],
        [`<p>Performance and safety for request bodies:</p><ul><li>Limit body size at the server or gateway, for example <code>server.tomcat.max-swallow-size</code> and proxy limits.</li><li>Avoid huge arrays in one request; use batches.</li><li>Prefer records for lower boilerplate and immutability.</li><li>Use streaming parsing (<code>JsonParser</code>) for very large uploads.</li></ul>`,
            r`server.tomcat.max-http-form-post-size=2MB
spring.servlet.multipart.max-request-size=10MB

# OUTPUT:
# Oversized requests are rejected early instead of exhausting memory`],
        [`<p>Real-world scenario: a signup endpoint.</p><ul><li>Client posts JSON with name, email and password.</li><li>Server validates, hashes the password and saves.</li><li>Validation failures return field errors in a standard body.</li></ul>`,
            r`record SignupRequest(@NotBlank String name, @Email String email,
                      @Size(min = 8) String password) {}

@PostMapping("/signup")
ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest req) {
    service.register(req);
    return ResponseEntity.status(HttpStatus.CREATED).build();
}

// OUTPUT:
// 201 Created   (or 400 with field errors if password is shorter than 8)`]
    ),

    'mvc-json-response': dv(
        [`<p>How a JSON response is produced:</p><ul><li>The handler returns an object.</li><li><code>RequestResponseBodyMethodProcessor</code> reads the <code>Accept</code> header and the possible <code>produces</code> types.</li><li>It picks the first converter that <code>canWrite</code> the type and media type, normally Jackson.</li><li>The converter calls <code>ObjectMapper.writeValue</code> into the response stream and sets <code>Content-Type</code>.</li></ul>`,
            r`// Accept: application/json -> MappingJackson2HttpMessageConverter
// Accept: application/xml  -> 406 Not Acceptable (no XML converter on classpath)
// Accept: */*              -> JSON (first suitable converter)

// OUTPUT:
// Content-Type: application/json
// {"id":1,"name":"Pen"}`],
        [`<p>Response variants:</p><ul><li><b>Plain object</b> with 200.</li><li><b>ResponseEntity</b> with status, headers, body.</li><li><b>@ResponseStatus</b> for a fixed status.</li><li><b>Optional handling</b> with map and orElse.</li><li><b>ProblemDetail</b> for errors.</li><li><b>Streaming</b> with <code>ResponseBodyEmitter</code> or Server-Sent Events.</li></ul>`,
            r`@GetMapping("/{id}")
ResponseEntity<Product> get(@PathVariable long id) {
    return repo.findById(id)
        .map(p -> ResponseEntity.ok(p))
        .orElseGet(() -> ResponseEntity.notFound().build());
}

@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
void delete(@PathVariable long id) { repo.deleteById(id); }

// OUTPUT:
// GET /9 (missing) -> 404; DELETE /1 -> 204`],
        [`<p>Mistakes and fixes:</p><ul><li><b>LazyInitializationException:</b> map to DTOs in the service layer.</li><li><b>Infinite recursion:</b> break cycles with DTOs.</li><li><b>Leaking fields (passwords):</b> use DTOs or <code>@JsonIgnore</code>.</li><li><b>Empty bean error:</b> a class without getters causes <code>FAIL_ON_EMPTY_BEANS</code>; add getters or use a record.</li><li><b>Dates as numbers:</b> register <code>JavaTimeModule</code> (Boot does it) and disable timestamps.</li></ul>`,
            r`class Secret { String value = "x"; }   // no getters

// WRONG: returning new Secret() ->
//   HttpMessageNotWritableException: No serializer found for class Secret

// RIGHT: use a record
record SecretDto(String value) {}

// OUTPUT:
// {"value":"x"}`],
        [`<p>Performance tips:</p><ul><li>Return only the fields needed (DTO projections).</li><li>Enable response compression for large JSON.</li><li>Use <code>NON_NULL</code> inclusion to cut size.</li><li>Cache stable responses with ETag.</li><li>Stream huge lists instead of building them in memory.</li></ul>`,
            r`spring.jackson.default-property-inclusion=non_null
server.compression.enabled=true
server.compression.mime-types=application/json

# OUTPUT:
# Smaller payloads: null fields are dropped and the body is gzip compressed`],
        [`<p>Real-world scenario: a paged product list for a mobile app.</p><ul><li>Response wraps items with paging metadata.</li><li>Prices are formatted as numbers, dates as ISO strings.</li><li>An ETag lets the app skip unchanged pages.</li></ul>`,
            r`record PageDto<T>(List<T> items, long total, int page) {}

@GetMapping("/products")
PageDto<ProductDto> list(Pageable p) {
    Page<ProductDto> pg = service.page(p);
    return new PageDto<>(pg.getContent(), pg.getTotalElements(), pg.getNumber());
}

// OUTPUT:
// {"items":[{"id":1,"name":"Pen"}],"total":42,"page":0}`]
    ),

    'mvc-jackson': dv(
        [`<p>Jackson is built from three core modules and Spring wires it in:</p><ul><li><b>jackson-core:</b> streaming parser and generator.</li><li><b>jackson-annotations:</b> the <code>@Json...</code> annotations.</li><li><b>jackson-databind:</b> the <code>ObjectMapper</code> that binds objects.</li><li><b>Spring Boot</b> adds <code>JacksonAutoConfiguration</code>, which creates the mapper from a <code>Jackson2ObjectMapperBuilder</code>, registers every <code>Module</code> bean and applies <code>spring.jackson.*</code>.</li><li><b>Spring MVC</b> wraps it in <code>MappingJackson2HttpMessageConverter</code>.</li></ul>`,
            r`@Configuration
class Check {
    @Bean
    CommandLineRunner show(ObjectMapper om) {
        return a -> System.out.println(om.getRegisteredModuleIds());
    }
}

// OUTPUT: (varies by classpath)
// [com.fasterxml.jackson.datatype.jsr310.JavaTimeModule, ...Jdk8Module, ...ParameterNamesModule]`],
        [`<p>Useful Jackson options:</p><ul><li><b>Naming:</b> <code>spring.jackson.property-naming-strategy</code> (SNAKE_CASE, KEBAB_CASE).</li><li><b>Inclusion:</b> <code>default-property-inclusion</code>.</li><li><b>Features:</b> <code>spring.jackson.serialization.*</code> and <code>deserialization.*</code> and <code>mapper.*</code>.</li><li><b>Date:</b> <code>spring.jackson.date-format</code> and time zone.</li><li><b>Mixins</b> add annotations to classes you cannot change.</li><li><b>Other formats:</b> XML, YAML and CSV via extra data format modules.</li></ul>`,
            r`spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=Asia/Kolkata
spring.jackson.mapper.accept-case-insensitive-properties=true

# OUTPUT:
# LocalDateTime is written as "2026-10-08T10:15:30" and keys match any case`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Own ObjectMapper bean replaces Boot default:</b> modules and properties are lost; customize instead.</li><li><b>Version mismatch</b> between Jackson modules: let the Spring Boot BOM manage versions.</li><li><b>Annotations from the wrong package:</b> use <code>com.fasterxml.jackson.annotation</code>.</li><li><b>Missing JavaTimeModule</b> outside Spring: register it manually.</li><li><b>Ambiguous constructors:</b> mark one with <code>@JsonCreator</code>.</li></ul>`,
            r`// WRONG in plain Java
ObjectMapper om = new ObjectMapper();
om.writeValueAsString(LocalDate.now());   // InvalidDefinitionException

// RIGHT
ObjectMapper ok = new ObjectMapper().registerModule(new JavaTimeModule());

// OUTPUT:
// First call fails: Java 8 date/time type not supported by default`],
        [`<p>Performance tuning:</p><ul><li>Reuse one mapper; it caches serializers and deserializers.</li><li>Use the <b>Afterburner</b> or <b>Blackbird</b> module to speed up reflection access.</li><li>Prefer streaming API for very large documents.</li><li>Avoid <code>convertValue</code> in hot paths.</li><li>Smaller models (DTOs) mean less work.</li></ul>`,
            r`ObjectMapper om = new ObjectMapper();
ObjectReader reader = om.readerFor(Item.class);   // reusable, cheaper per call
Item i = reader.readValue("{\"name\":\"pen\",\"qty\":2}");

// OUTPUT:
// Item[name=pen, qty=2]`],
        [`<p>Real-world scenario: a service that must expose snake_case JSON and ISO dates, and hide internal fields.</p><ul><li>Set naming strategy and date options in properties.</li><li>Annotate DTOs, not entities.</li><li>Add a <code>@JsonTest</code> to guard the JSON contract.</li></ul>`,
            r`@JsonTest
class ContractTest {
    @Autowired JacksonTester<InvoiceDto> json;

    @Test
    void shape() throws Exception {
        var out = json.write(new InvoiceDto(7, LocalDate.of(2026, 10, 8)));
        assertThat(out).extractingJsonPathStringValue("$.due_date")
                       .isEqualTo("2026-10-08");
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-objectmapper': dv(
        [`<p>Inside <code>ObjectMapper</code>:</p><ul><li>It holds caches: <code>SerializerProvider</code> keeps serializers per class, <code>DeserializationContext</code> keeps deserializers.</li><li>The first use of a type builds and caches them; later calls are fast.</li><li>Configuration (features, modules, mixins) is read while building those; changing it after use is unsafe.</li><li>Spring Boot builds the bean with <code>Jackson2ObjectMapperBuilder</code>.</li></ul>`,
            r`ObjectMapper om = new ObjectMapper();
om.writeValueAsString(new Item("a", 1));   // builds serializer for Item (slower)
long t = System.nanoTime();
for (int i = 0; i < 100_000; i++) om.writeValueAsString(new Item("a", i));
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=60`],
        [`<p>API variants:</p><ul><li><code>writeValueAsString</code>, <code>writeValue(File/OutputStream, obj)</code>, <code>writerWithDefaultPrettyPrinter()</code>.</li><li><code>readValue</code> for String, File, InputStream, byte[].</li><li><code>readTree</code> and <code>JsonNode</code>, <code>createObjectNode()</code> to build JSON.</li><li><code>convertValue</code>, <code>valueToTree</code>, <code>treeToValue</code>.</li><li><code>copy()</code> to create a separately configurable mapper.</li></ul>`,
            r`ObjectNode n = om.createObjectNode();
n.put("id", 1).put("ok", true);
n.putArray("tags").add("a").add("b");
System.out.println(om.writerWithDefaultPrettyPrinter().writeValueAsString(n));

Map<String, Object> m = om.convertValue(new Item("pen", 2), new TypeReference<>() {});
System.out.println(m);

// OUTPUT:
// {
//   "id" : 1,
//   "ok" : true,
//   "tags" : [ "a", "b" ]
// }
// {name=pen, qty=2}`],
        [`<p>Mistakes and fixes:</p><ul><li><b>new ObjectMapper() per call:</b> wasteful and misconfigured; inject the bean.</li><li><b>Mutating the shared bean at run time:</b> use <code>copy()</code> for variations.</li><li><b>Raw List.class:</b> returns maps, not your type; use TypeReference.</li><li><b>Ignoring JsonProcessingException:</b> handle or translate it.</li><li><b>Parsing untrusted JSON to huge trees:</b> set stream read constraints.</li></ul>`,
            r`// WRONG: elements are LinkedHashMap, ClassCastException later
List<Item> bad = om.readValue(json, List.class);

// RIGHT
List<Item> good = om.readValue(json, new TypeReference<List<Item>>() {});

// OUTPUT:
// good.get(0) is an Item; bad.get(0) is a LinkedHashMap`],
        [`<p>Performance tuning:</p><ul><li>One shared instance; build <code>ObjectReader</code> and <code>ObjectWriter</code> once per type.</li><li>Prefer <code>readValue(byte[])</code> and streams over building Strings.</li><li>Avoid the tree model when a class exists.</li><li>Check <code>JsonFactory</code> constraints for large input.</li></ul>`,
            r`private static final ObjectWriter W = new ObjectMapper().writerFor(Item.class);

byte[] bytes = W.writeValueAsBytes(new Item("pen", 3));
System.out.println(new String(bytes));

// OUTPUT:
// {"name":"pen","qty":3}`],
        [`<p>Real-world scenario: store a flexible audit payload as JSON text in a database column.</p><ul><li>Serialize the event with the injected mapper.</li><li>Save the string; on read, use <code>readTree</code> when the structure varies.</li><li>Wrap checked exceptions in an unchecked one.</li></ul>`,
            r`@Component
class AuditJson {
    private final ObjectMapper om;
    AuditJson(ObjectMapper om) { this.om = om; }

    String toJson(Object event) {
        try { return om.writeValueAsString(event); }
        catch (JsonProcessingException e) { throw new IllegalStateException(e); }
    }
}

// OUTPUT:
// {"action":"LOGIN","user":"abaji","at":"2026-10-08T10:15:30"}`]
    ),

    'mvc-json-serialization': dv(
        [`<p>How Jackson serializes:</p><ul><li><code>BeanSerializerFactory</code> inspects the class once and builds a <code>BeanSerializer</code> with a list of property writers.</li><li>Properties come from getters, public fields and record components; annotations adjust names and visibility.</li><li>Each writer reads the value and writes it with the serializer for its type.</li><li>The result is cached for the next call.</li></ul>`,
            r`record Address(String city) {}
record User(String name, Address address, List<String> roles) {}

System.out.println(om.writeValueAsString(
    new User("Abaji", new Address("Pune"), List.of("ADMIN"))));

// OUTPUT:
// {"name":"Abaji","address":{"city":"Pune"},"roles":["ADMIN"]}`],
        [`<p>Serialization options:</p><ul><li><b>@JsonValue</b> writes a whole object as one value (good for enums).</li><li><b>@JsonSerialize(using = ...)</b> per property serializer.</li><li><b>@JsonUnwrapped</b> flattens a nested object.</li><li><b>@JsonView</b> field groups.</li><li><b>Enums</b> write their name by default; change with <code>WRITE_ENUMS_USING_TO_STRING</code>.</li><li><b>Maps</b> become objects; keys must be strings or convertible.</li></ul>`,
            r`enum Status { ACTIVE("A"), CLOSED("C");
    private final String code;
    Status(String c) { code = c; }
    @JsonValue String code() { return code; }
}
record Name(String first, String last) {}
record Person(@JsonUnwrapped Name name, Status status) {}

// new Person(new Name("Abaji","Rao"), Status.ACTIVE)
// OUTPUT:
// {"first":"Abaji","last":"Rao","status":"A"}`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Bidirectional entities:</b> StackOverflowError; use DTOs.</li><li><b>Hibernate lazy proxy:</b> fetch inside the transaction or use a DTO.</li><li><b>Getter side effects:</b> any <code>getX()</code> method is treated as a property; rename it or add <code>@JsonIgnore</code>.</li><li><b>Double precision surprises:</b> use <code>BigDecimal</code> with a formatter for money.</li><li><b>Time zones:</b> store UTC and let clients convert.</li></ul>`,
            r`class Order {
    public List<Line> lines;
    public int getTotal() { return lines.size() * 10; }   // becomes "total" in JSON
    @JsonIgnore public boolean isLarge() { return lines.size() > 5; }
}

// OUTPUT:
// {"lines":[...],"total":30}   (isLarge is hidden)`],
        [`<p>Performance tips:</p><ul><li>Smaller DTOs, fewer nested levels.</li><li>Skip nulls and empty values.</li><li>Reuse the mapper so serializers stay cached.</li><li>Use streaming (<code>JsonGenerator</code>) for huge collections.</li><li>Avoid pretty printing in production.</li></ul>`,
            r`StreamingResponseBody body = out -> {
    try (JsonGenerator g = om.getFactory().createGenerator(out)) {
        g.writeStartArray();
        for (Item i : repo.streamAll()) g.writeObject(i);
        g.writeEndArray();
    }
};

// OUTPUT:
// [{"name":"a","qty":1},{"name":"b","qty":2}, ...]  written without holding all rows`],
        [`<p>Real-world scenario: an API that returns different detail by audience.</p><ul><li>Public view: id and name.</li><li>Admin view: adds email and audit fields.</li><li>Use <code>@JsonView</code> on the DTO and the controller method.</li></ul>`,
            r`class Views {
    interface Public {}
    interface Admin extends Public {}
}

record UserView(@JsonView(Views.Public.class) String name,
                @JsonView(Views.Admin.class) String email) {}

@GetMapping("/users/{id}")
@JsonView(Views.Public.class)
UserView get(@PathVariable long id) { return new UserView("Abaji", "a@x.com"); }

// OUTPUT:
// {"name":"Abaji"}`]
    ),

    'mvc-json-deserialization': dv(
        [`<p>How Jackson deserializes:</p><ul><li><code>BeanDeserializerFactory</code> picks a creator: default constructor, annotated <code>@JsonCreator</code>, or the canonical record constructor.</li><li>The parser reads tokens; for each field name it finds the property and its deserializer.</li><li>Values are set through setters, fields or constructor arguments.</li><li>Unknown fields follow the configured feature (ignored by default in Boot).</li></ul>`,
            r`record Point(int x, int y) {}

Point p = om.readValue("{\"x\":3,\"y\":4,\"z\":5}", Point.class);
System.out.println(p);

// OUTPUT:
// Point[x=3, y=4]    (z ignored in Spring Boot; plain ObjectMapper would throw)`],
        [`<p>Deserialization options:</p><ul><li><b>@JsonCreator</b> and <b>@JsonProperty</b> for immutable classes.</li><li><b>@JsonSetter</b>, <b>@JsonAlias</b>, <b>@JsonIgnoreProperties(ignoreUnknown = true)</b>.</li><li><b>@JsonDeserialize(using = ...)</b> custom logic.</li><li><b>Features:</b> <code>ACCEPT_SINGLE_VALUE_AS_ARRAY</code>, <code>READ_UNKNOWN_ENUM_VALUES_AS_NULL</code>, <code>FAIL_ON_NULL_FOR_PRIMITIVES</code>.</li><li><b>Polymorphism</b> with <code>@JsonTypeInfo</code> and <code>@JsonSubTypes</code>.</li></ul>`,
            r`@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Card.class, name = "card"),
    @JsonSubTypes.Type(value = Upi.class, name = "upi")})
interface Payment {}
record Card(String number) implements Payment {}
record Upi(String vpa) implements Payment {}

Payment p = om.readValue("{\"type\":\"upi\",\"vpa\":\"a@bank\"}", Payment.class);

// OUTPUT:
// p is Upi[vpa=a@bank]`],
        [`<p>Mistakes and fixes:</p><ul><li><b>No usable constructor:</b> add a no-args constructor or <code>@JsonCreator</code>.</li><li><b>Compiled without <code>-parameters</code>:</b> constructor names are lost; Boot parent POM enables it, otherwise annotate.</li><li><b>Primitive and missing field:</b> becomes 0; use wrapper types if absence matters.</li><li><b>Enum mismatch:</b> unknown value fails; enable lenient enum reading.</li><li><b>Number as string:</b> Jackson may coerce "5" to 5, hiding bad clients.</li></ul>`,
            r`record Qty(int amount) {}

Qty q = om.readValue("{}", Qty.class);        // amount silently 0
System.out.println(q);

record QtyBox(Integer amount) {}               // null shows it was missing
System.out.println(om.readValue("{}", QtyBox.class));

// OUTPUT:
// Qty[amount=0]
// QtyBox[amount=null]`],
        [`<p>Performance and safety:</p><ul><li>Reuse <code>ObjectReader</code> for a known type.</li><li>Set limits on nesting depth, string length and document size (<code>StreamReadConstraints</code>).</li><li>Never enable default typing for untrusted data.</li><li>Validate after binding with Bean Validation.</li></ul>`,
            r`ObjectMapper om = JsonMapper.builder()
    .streamReadConstraints(StreamReadConstraints.builder()
        .maxNestingDepth(50).maxStringLength(100_000).build())
    .build();

// OUTPUT:
// Deeply nested or huge strings raise StreamConstraintsException (a 400 in MVC)`],
        [`<p>Real-world scenario: a webhook receiver.</p><ul><li>The third-party adds new fields over time; ignoring unknown fields keeps you working.</li><li>The event type decides the class (polymorphism).</li><li>Signature is verified on the raw body first, then JSON is parsed.</li></ul>`,
            r`@PostMapping("/webhook")
ResponseEntity<Void> hook(@RequestBody byte[] raw,
                          @RequestHeader("X-Signature") String sig) throws IOException {
    if (!signer.valid(raw, sig)) return ResponseEntity.status(401).build();
    WebhookEvent ev = om.readValue(raw, WebhookEvent.class);
    handler.handle(ev);
    return ResponseEntity.ok().build();
}

// OUTPUT:
// 200 OK for a valid signature, 401 otherwise`]
    )
};
