// Spring extras, batch smvc18 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc18Extras: Record<string, Extra> = {
    'mvc-byte-array-converter': x(
        ['<b>ByteArrayHttpMessageConverter</b> is the built-in converter that reads and writes a raw <code>byte[]</code> body, with no JSON or XML mapping at all.',
            '<b>Media types</b>: it supports <code>application/octet-stream</code> and <code>*/*</code>, so it is the usual choice for file downloads such as PDFs and images.',
            '<b>Minimal use</b>: a controller returns <code>byte[]</code> or <code>ResponseEntity&lt;byte[]&gt;</code> and Spring writes the bytes straight to the response.'],
        ['<b>Content-Type</b>: set it yourself in the <code>ResponseEntity</code> (for example <code>MediaType.APPLICATION_PDF</code>), otherwise the browser sees a generic octet-stream.',
            '<b>Download header</b>: add <code>Content-Disposition: attachment; filename=...</code> to make the browser save the file instead of showing it.',
            '<b>Request side</b>: <code>@RequestBody byte[] data</code> reads the whole upload into memory, so it suits small payloads only.'],
        ['<b>Memory</b>: a byte array holds the entire file in the heap; for large files return a <code>Resource</code> or <code>StreamingResponseBody</code> instead.',
            '<b>Order</b>: the converter is registered early in the default list, so <code>byte[]</code> never reaches Jackson.',
            '<b>Testing</b>: with MockMvc assert on <code>content().bytes(...)</code> and the <code>Content-Type</code> header.'],
        [['F', 'What does ByteArrayHttpMessageConverter do?', 'It converts the HTTP body to and from a byte[] without any parsing.'],
            ['F', 'Which media types does it support?', 'application/octet-stream and */*.'],
            ['M', 'How do you return a PDF from a controller?', 'Return ResponseEntity of byte[] with Content-Type application/pdf and a Content-Disposition header.'],
            ['M', 'Why set Content-Type explicitly?', 'Without it the response falls back to octet-stream and the browser may not display or open the file correctly.'],
            ['S', 'Why is byte[] a poor choice for large files?', 'The whole file is loaded into the heap for every request; use Resource, InputStreamResource or StreamingResponseBody to stream.'],
            ['S', 'How does Spring pick this converter?', 'It loops over the converters and uses the first whose canRead or canWrite accepts the Java type and the media type.']],
        [['Return a small file as bytes.',
            r`@RestController
class FileController {
    @GetMapping("/logo")
    ResponseEntity<byte[]> logo() throws IOException {
        byte[] data = new ClassPathResource("logo.png").getContentAsByteArray();
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(data);
    }
}

// OUTPUT:
// GET /logo -> 200 OK
// Content-Type: image/png
// Content-Length: 2048 (varies)`],
            ['Receive raw bytes.',
                r`@PostMapping(value = "/upload", consumes = "application/octet-stream")
String upload(@RequestBody byte[] data) {
    return "received " + data.length + " bytes";
}

// OUTPUT:
// POST /upload (body: 5 bytes) -> received 5 bytes`]],
        [['MockMvc test for a download.',
            r`@WebMvcTest(FileController.class)
class FileControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void logoIsPng() throws Exception {
        mvc.perform(get("/logo"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.IMAGE_PNG));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Force a download with a file name.',
                r`@GetMapping("/report")
ResponseEntity<byte[]> report() {
    byte[] pdf = "%PDF-1.4 demo".getBytes(StandardCharsets.US_ASCII);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=report.pdf")
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
}

// OUTPUT:
// 200 OK
// Content-Disposition: attachment; filename=report.pdf
// Content-Type: application/pdf`]]
    ),

    'mvc-form-converter': x(
        ['<b>FormHttpMessageConverter</b> reads and writes HTML form data (<code>application/x-www-form-urlencoded</code>) and multipart forms (<code>multipart/form-data</code>).',
            '<b>Java type</b>: it maps the body to <code>MultiValueMap&lt;String, String&gt;</code>, where one key can carry several values.',
            '<b>Minimal use</b>: <code>@RequestBody MultiValueMap&lt;String, String&gt; form</code> hands you every submitted field.'],
        ['<b>Usual alternative</b>: for forms most code uses <code>@RequestParam</code> or <code>@ModelAttribute</code>, which read request parameters, not this converter.',
            '<b>Client side</b>: <code>RestTemplate</code> uses this converter to send a <code>MultiValueMap</code> as a form post.',
            '<b>Multipart</b>: this converter can write multipart requests, but for reading uploads use <code>MultipartFile</code> or <code>@RequestPart</code>.'],
        ['<b>Servlet quirk</b>: for urlencoded POST the container may already consume the body into parameters, which is why <code>@RequestBody</code> and <code>@RequestParam</code> should not be mixed.',
            '<b>Charset</b>: default is UTF-8 in Spring 6; a wrong charset gives garbled field values.',
            '<b>Testing</b>: use <code>contentType(APPLICATION_FORM_URLENCODED)</code> and <code>param(...)</code> or <code>formField</code> in MockMvc.'],
        [['F', 'What does FormHttpMessageConverter handle?', 'Form bodies: application/x-www-form-urlencoded and multipart/form-data.'],
            ['F', 'Which Java type represents form data?', 'MultiValueMap of String to String, since a field can repeat.'],
            ['M', 'How do you read a form post in a controller?', 'Use @RequestParam per field, a @ModelAttribute object, or @RequestBody MultiValueMap.'],
            ['M', 'Which header selects this converter?', 'Content-Type: application/x-www-form-urlencoded.'],
            ['S', 'Why can @RequestBody MultiValueMap come back empty?', 'The servlet container or a filter may already have read the form body as parameters, leaving nothing to read.'],
            ['S', 'Where else is this converter used?', 'On the client: RestTemplate and RestClient use it to post a MultiValueMap as a form.']],
        [['Read a form as a map.',
            r`@PostMapping(value = "/login", consumes = "application/x-www-form-urlencoded")
String login(@RequestBody MultiValueMap<String, String> form) {
    return "user=" + form.getFirst("user")
        + " roles=" + form.get("role");
}

// OUTPUT:
// POST /login  body: user=ann&role=a&role=b
// -> user=ann roles=[a, b]`],
            ['Bind a form to an object.',
                r`record Signup(String name, int age) { }

@PostMapping("/signup")
String signup(@ModelAttribute Signup s) {
    return s.name() + " is " + s.age();
}

// OUTPUT:
// POST /signup  body: name=Ravi&age=30
// -> Ravi is 30`]],
        [['MockMvc form post.',
            r`@Test
void loginForm() throws Exception {
    mvc.perform(post("/login")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .param("user", "ann"))
        .andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Client posting a form.',
                r`MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
body.add("user", "ann");
body.add("pass", "secret");
HttpHeaders h = new HttpHeaders();
h.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
ResponseEntity<String> res = new RestTemplate().postForEntity(
    "http://localhost:8080/login", new HttpEntity<>(body, h), String.class);
System.out.println(res.getStatusCode());

// OUTPUT:
// 200 OK`]]
    ),

    'mvc-jackson-integration': x(
        ['<b>Jackson</b> is the default JSON library; <code>MappingJackson2HttpMessageConverter</code> uses an <code>ObjectMapper</code> to turn Java objects into JSON and back.',
            '<b>Auto-config</b>: with <code>spring-boot-starter-web</code> a configured <code>ObjectMapper</code> bean and the converter are registered for you.',
            '<b>Minimal use</b>: <code>@RestController</code> methods returning a record or POJO produce <code>application/json</code> with no extra code.'],
        ['<b>Properties</b>: tune it with <code>spring.jackson.*</code>, for example <code>default-property-inclusion</code> and <code>serialization.write-dates-as-timestamps</code>.',
            '<b>Annotations</b>: <code>@JsonProperty</code>, <code>@JsonIgnore</code>, <code>@JsonFormat</code> and <code>@JsonInclude</code> shape the output per class or field.',
            '<b>Dates</b>: <code>java.time</code> types work through the JavaTimeModule, which Boot registers automatically.'],
        ['<b>One shared mapper</b>: inject the Boot <code>ObjectMapper</code> instead of calling <code>new ObjectMapper()</code>, otherwise your settings are lost.',
            '<b>Customizing</b>: define a <code>Jackson2ObjectMapperBuilderCustomizer</code> bean to keep Boot defaults and add changes.',
            '<b>Failures</b>: bad JSON gives <code>HttpMessageNotReadableException</code>, which becomes 400 by default.'],
        [['F', 'Which class converts JSON in Spring MVC?', 'MappingJackson2HttpMessageConverter, backed by a Jackson ObjectMapper.'],
            ['F', 'How do you hide a field from JSON?', 'Annotate it with @JsonIgnore.'],
            ['M', 'How do you configure Jackson in Spring Boot?', 'With spring.jackson.* properties, or a Jackson2ObjectMapperBuilderCustomizer bean.'],
            ['M', 'What happens with malformed JSON in a request body?', 'HttpMessageNotReadableException is thrown and the response is 400 Bad Request.'],
            ['S', 'Why not call new ObjectMapper() in your own code?', 'It misses Boot modules and settings, so output differs from what the controllers produce; inject the managed bean.'],
            ['S', 'How can unknown JSON properties be tolerated?', 'Boot disables FAIL_ON_UNKNOWN_PROPERTIES by default; with a plain mapper use @JsonIgnoreProperties(ignoreUnknown = true).']],
        [['JSON in and out.',
            r`record Book(String title, int year) { }

@RestController
class BookController {
    @PostMapping("/books")
    Book add(@RequestBody Book b) {
        return new Book(b.title().toUpperCase(), b.year());
    }
}

// OUTPUT:
// POST /books {"title":"spring","year":2024}
// -> 200 {"title":"SPRING","year":2024}`],
            ['Shape output with annotations.',
                r`record User(
    String name,
    @JsonIgnore String password,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate joined) { }

// serialize new User("ann", "pw", LocalDate.of(2024, 5, 1))

// OUTPUT:
// {"name":"ann","joined":"2024-05-01"}`]],
        [['Test JSON with MockMvc.',
            r`@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void echoesUpperCase() throws Exception {
        mvc.perform(post("/books")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"spring\",\"year\":2024}"))
            .andExpect(jsonPath("$.title").value("SPRING"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Customize the shared mapper.',
                r`@Bean
Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
    return b -> b
        .serializationInclusion(JsonInclude.Include.NON_NULL)
        .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
}

// OUTPUT:
// null fields are omitted and dates print as ISO strings`]]
    ),

    'mvc-custom-message-converter': x(
        ['<b>Custom converter</b>: a class that teaches Spring MVC to read or write a Java type in a media type it does not know, such as CSV.',
            '<b>Base class</b>: extend <code>AbstractHttpMessageConverter&lt;T&gt;</code> and implement <code>supports</code>, <code>readInternal</code> and <code>writeInternal</code>.',
            '<b>Registration</b>: add it in <code>WebMvcConfigurer.extendMessageConverters</code> so the default converters stay in place.'],
        ['<b>Media type</b>: pass the supported <code>MediaType</code> to the super constructor; Spring matches it against Accept and Content-Type.',
            '<b>extend or configure</b>: <code>extendMessageConverters</code> adds to the defaults, while <code>configureMessageConverters</code> replaces them all.',
            '<b>Controller</b>: nothing changes; a method with <code>produces = &quot;text/csv&quot;</code> returns the object and your converter writes it.'],
        ['<b>Order</b>: the first converter that can handle the type and media type wins, so use <code>converters.add(0, ...)</code> to take priority.',
            '<b>Generic variant</b>: <code>GenericHttpMessageConverter</code> is needed when you must see generic types such as <code>List&lt;Book&gt;</code>.',
            '<b>Testing</b>: send <code>Accept: text/csv</code> in MockMvc and compare the body string.'],
        [['F', 'When do you write a custom message converter?', 'When you need a body format that Spring does not support out of the box.'],
            ['F', 'Which class do you usually extend?', 'AbstractHttpMessageConverter of your type.'],
            ['M', 'Which methods must you implement?', 'supports(Class), readInternal and writeInternal.'],
            ['M', 'How do you register it?', 'Override extendMessageConverters in a WebMvcConfigurer and add the converter to the list.'],
            ['S', 'What is the risk of configureMessageConverters?', 'It replaces the default list, so JSON, String and others disappear unless you add them back.'],
            ['S', 'How does Spring choose between converters?', 'It walks the list in order and uses the first whose canWrite matches the return type and the negotiated media type.']],
        [['A CSV converter for Book.',
            r`public class BookCsvConverter extends AbstractHttpMessageConverter<Book> {
    public BookCsvConverter() { super(new MediaType("text", "csv")); }

    protected boolean supports(Class<?> c) { return Book.class == c; }

    protected Book readInternal(Class<? extends Book> c, HttpInputMessage in)
            throws IOException {
        String[] p = new String(in.getBody().readAllBytes()).split(",");
        return new Book(p[0], Integer.parseInt(p[1].trim()));
    }

    protected void writeInternal(Book b, HttpOutputMessage out)
            throws IOException {
        out.getBody().write((b.title() + "," + b.year()).getBytes());
    }
}

// OUTPUT:
// (class compiles; used once registered)`],
            ['Register it.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> list) {
        list.add(0, new BookCsvConverter());
    }
}

// OUTPUT:
// GET /book  Accept: text/csv
// -> Spring,2024`]],
        [['Controller serving both formats.',
            r`@GetMapping(value = "/book", produces = {"application/json", "text/csv"})
Book book() { return new Book("Spring", 2024); }

// OUTPUT:
// Accept: application/json -> {"title":"Spring","year":2024}
// Accept: text/csv         -> Spring,2024`],
            ['Test the CSV output.',
                r`@Test
void csv() throws Exception {
    mvc.perform(get("/book").accept("text/csv"))
        .andExpect(status().isOk())
        .andExpect(content().string("Spring,2024"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-content-negotiation': x(
        ['<b>Content negotiation</b> is how Spring MVC decides the response format (JSON, XML, CSV) when a resource can be served in several.',
            '<b>Default strategy</b>: the <code>Accept</code> request header; Spring picks the best match from what the controller can produce.',
            '<b>Result</b>: if nothing matches, the response is <code>406 Not Acceptable</code>.'],
        ['<b>ContentNegotiationManager</b> holds the strategies and returns the list of acceptable media types for a request.',
            '<b>Query parameter</b>: enable it with <code>configurer.favorParameter(true)</code> and a map such as <code>?format=xml</code>; it is off by default.',
            '<b>Path extensions</b> like <code>.json</code> are no longer supported in Spring 6, so do not rely on them.'],
        ['<b>Selection</b>: the acceptable types are intersected with the producible types from <code>produces</code> and the registered converters.',
            '<b>Configuration</b>: override <code>configureContentNegotiation</code> in a <code>WebMvcConfigurer</code>.',
            '<b>Testing</b>: call the same URL with different <code>Accept</code> headers and assert each Content-Type.'],
        [['F', 'What is content negotiation?', 'Choosing the best representation of a resource for the client, based on what it asks for.'],
            ['F', 'Which header drives it by default?', 'The Accept header.'],
            ['M', 'What status is returned when no format matches?', '406 Not Acceptable.'],
            ['M', 'How do you allow ?format=xml?', 'Call favorParameter(true) and mediaType(xml, APPLICATION_XML) in configureContentNegotiation.'],
            ['S', 'Why was path extension negotiation removed?', 'It caused security problems such as reflected file download attacks, so Spring 6 dropped support.'],
            ['S', 'How does negotiation combine with produces?', 'The mapping is chosen by produces versus Accept; the converter then writes the body in the selected type.']],
        [['One URL, two formats.',
            r`@GetMapping(value = "/users/1", produces = {"application/json", "application/xml"})
UserDto user() { return new UserDto(1, "ann"); }

// OUTPUT:
// Accept: application/json -> {"id":1,"name":"ann"}
// Accept: application/xml  -> <UserDto><id>1</id><name>ann</name></UserDto>`],
            ['Enable the format parameter.',
                r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.favorParameter(true)
     .parameterName("format")
     .mediaType("json", MediaType.APPLICATION_JSON)
     .mediaType("xml", MediaType.APPLICATION_XML)
     .defaultContentType(MediaType.APPLICATION_JSON);
}

// OUTPUT:
// GET /users/1?format=xml -> application/xml`]],
        [['Test 406.',
            r`@Test
void unsupportedFormat() throws Exception {
    mvc.perform(get("/users/1").accept("text/csv"))
        .andExpect(status().isNotAcceptable());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Test both formats.',
                r`@Test
void jsonAndXml() throws Exception {
    mvc.perform(get("/users/1").accept(MediaType.APPLICATION_JSON))
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    mvc.perform(get("/users/1").accept(MediaType.APPLICATION_XML))
        .andExpect(content().contentType(MediaType.APPLICATION_XML));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-accept-header': x(
        ['<b>Accept</b> is a request header that tells the server which response media types the client can handle, for example <code>Accept: application/json</code>.',
            '<b>Quality values</b>: <code>q</code> ranks choices, as in <code>application/xml;q=0.5, application/json</code>; higher q wins and the default is 1.0.',
            '<b>Server side</b>: Spring compares Accept with the <code>produces</code> of mappings and the converters that can write the type.'],
        ['<b>produces</b>: <code>@GetMapping(produces = &quot;application/json&quot;)</code> narrows the mapping; a mismatch gives <code>406 Not Acceptable</code>.',
            '<b>Wildcards</b>: <code>*/*</code> means any type, which browsers often send, so the first producible type is used.',
            '<b>Not the same as Content-Type</b>: Accept describes the response wanted, while Content-Type describes the body sent.'],
        ['<b>Resolution</b>: <code>HeaderContentNegotiationStrategy</code> parses and sorts the header by specificity and quality.',
            '<b>Vary</b>: when the response depends on Accept, caches need <code>Vary: Accept</code>; Spring adds it for negotiated responses.',
            '<b>Testing</b>: <code>MockMvc.accept(...)</code> sets the header and <code>content().contentType</code> checks the result.'],
        [['F', 'What is the Accept header?', 'A request header listing the media types the client can accept in the response.'],
            ['F', 'What does q=0.5 mean?', 'A quality weight; types with higher q are preferred, and the default is 1.0.'],
            ['M', 'What happens if no produced type matches Accept?', 'The server answers 406 Not Acceptable.'],
            ['M', 'How do you declare what a method can produce?', 'Use the produces attribute of @GetMapping or @RequestMapping.'],
            ['S', 'How does Accept differ from Content-Type?', 'Accept is about the response format the client wants; Content-Type is the format of the body being sent.'],
            ['S', 'Why does a browser request often get HTML or JSON unexpectedly?', 'Browsers send Accept with */* and many types, so Spring picks the first producible match; set a default or produces explicitly.']],
        [['Two methods, one URL.',
            r`@GetMapping(value = "/report", produces = "application/json")
Map<String, Object> json() { return Map.of("total", 5); }

@GetMapping(value = "/report", produces = "text/plain")
String text() { return "total=5"; }

// OUTPUT:
// Accept: application/json -> {"total":5}
// Accept: text/plain       -> total=5`],
            ['Read the header directly.',
                r`@GetMapping("/echo")
String echo(@RequestHeader(HttpHeaders.ACCEPT) String accept) {
    return "client accepts: " + accept;
}

// OUTPUT:
// Accept: application/json
// -> client accepts: application/json`]],
        [['Mismatch test.',
            r`@Test
void notAcceptable() throws Exception {
    mvc.perform(get("/report").accept(MediaType.APPLICATION_XML))
        .andExpect(status().isNotAcceptable());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Quality value test.',
                r`@Test
void prefersHigherQuality() throws Exception {
    mvc.perform(get("/report")
            .header("Accept", "text/plain;q=0.3, application/json;q=0.9"))
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-content-type-header': x(
        ['<b>Content-Type</b> says what format the message body is in, for example <code>Content-Type: application/json</code> on a POST request.',
            '<b>Request side</b>: Spring uses it to choose the converter that reads <code>@RequestBody</code>.',
            '<b>Response side</b>: it also tells the client how to parse the body Spring sends back.'],
        ['<b>consumes</b>: <code>@PostMapping(consumes = &quot;application/json&quot;)</code> restricts a mapping to that request type.',
            '<b>415</b>: if the type is missing or not supported, Spring answers <code>415 Unsupported Media Type</code>.',
            '<b>Charset</b>: <code>application/json</code> is UTF-8 by default; for text types add <code>;charset=UTF-8</code> if needed.'],
        ['<b>Converter choice</b>: <code>RequestResponseBodyMethodProcessor</code> loops over converters and picks the first with <code>canRead(type, contentType)</code>.',
            '<b>Missing header</b>: Spring assumes <code>application/octet-stream</code>, which usually matches no converter for objects.',
            '<b>Testing</b>: <code>contentType(...)</code> in MockMvc sets the request header; forgetting it is the top cause of 415 in tests.'],
        [['F', 'What does Content-Type describe?', 'The media type of the message body.'],
            ['F', 'Which status means the server does not support the request body format?', '415 Unsupported Media Type.'],
            ['M', 'What does consumes do on a mapping?', 'It limits the method to requests whose Content-Type matches.'],
            ['M', 'Why does a JSON POST without a Content-Type fail?', 'Spring treats it as octet-stream and finds no converter to read an object from it.'],
            ['S', 'Which component reads the body using Content-Type?', 'RequestResponseBodyMethodProcessor, with the HttpMessageConverter list.'],
            ['S', 'How do 406 and 415 differ?', '415 is about the request body type (Content-Type); 406 is about the response type the client wants (Accept).']],
        [['A JSON-only endpoint.',
            r`@PostMapping(value = "/orders", consumes = "application/json")
String create(@RequestBody OrderDto dto) {
    return "created " + dto.item();
}

// OUTPUT:
// POST /orders  Content-Type: application/json  {"item":"pen"} -> created pen
// POST /orders  Content-Type: text/plain        -> 415`],
            ['Different bodies on one path.',
                r`@PostMapping(value = "/data", consumes = "application/json")
String fromJson(@RequestBody Map<String, String> m) { return "json"; }

@PostMapping(value = "/data", consumes = "application/x-www-form-urlencoded")
String fromForm(@RequestParam Map<String, String> m) { return "form"; }

// OUTPUT:
// Content-Type: application/json -> json
// Content-Type: application/x-www-form-urlencoded -> form`]],
        [['Test 415.',
            r`@Test
void wrongType() throws Exception {
    mvc.perform(post("/orders")
            .contentType(MediaType.TEXT_PLAIN)
            .content("item=pen"))
        .andExpect(status().isUnsupportedMediaType());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Test the happy path.',
                r`@Test
void ok() throws Exception {
    mvc.perform(post("/orders")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"item\":\"pen\"}"))
        .andExpect(content().string("created pen"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-spring-mvc-interceptors': x(
        ['<b>Interceptor</b>: a Spring MVC component that runs code before and after a controller method, for cross-cutting work such as logging, timing or authorization checks.',
            '<b>Where it runs</b>: inside the <code>DispatcherServlet</code>, around the handler; filters run earlier, outside Spring MVC.',
            '<b>How to use</b>: implement <code>HandlerInterceptor</code> and register it with <code>InterceptorRegistry</code> in a <code>WebMvcConfigurer</code>.'],
        ['<b>Three hooks</b>: <code>preHandle</code> before the controller, <code>postHandle</code> after it, <code>afterCompletion</code> after the view or response.',
            '<b>Path rules</b>: <code>addPathPatterns</code> and <code>excludePathPatterns</code> choose which URLs get the interceptor.',
            '<b>Beans</b>: the interceptor can be a Spring bean, so it can inject services and be unit tested.'],
        ['<b>Chain</b>: interceptors form a <code>HandlerExecutionChain</code>; preHandle runs in order, postHandle and afterCompletion in reverse.',
            '<b>Versus filters</b>: interceptors know the handler method and Spring context; filters see raw servlet requests and can wrap them.',
            '<b>Versus AOP</b>: interceptors work on web requests, AOP on any bean method.'],
        [['F', 'What is an interceptor?', 'A hook that runs before and after controller handling inside Spring MVC.'],
            ['F', 'Which interface do you implement?', 'HandlerInterceptor.'],
            ['M', 'How do you register one?', 'Override addInterceptors in a WebMvcConfigurer and call registry.addInterceptor.'],
            ['M', 'Name common uses.', 'Logging, request timing, authentication or authorization checks, and setting locale or context data.'],
            ['S', 'Interceptor or filter: how do you choose?', 'Use a filter for servlet-level work such as encoding or security; use an interceptor when you need the handler or Spring beans.'],
            ['S', 'In which order are multiple interceptors called?', 'preHandle in registration order; postHandle and afterCompletion in reverse order.']],
        [['A timing interceptor.',
            r`@Component
public class TimingInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
            Object handler) {
        req.setAttribute("start", System.nanoTime());
        return true;
    }
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
            Object handler, Exception ex) {
        long ms = (System.nanoTime() - (long) req.getAttribute("start")) / 1_000_000;
        System.out.println(req.getRequestURI() + " took " + ms + " ms");
    }
}

// OUTPUT: (varies)
// /hello took 12 ms`],
            ['Register it.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    private final TimingInterceptor timing;
    WebConfig(TimingInterceptor timing) { this.timing = timing; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timing)
            .addPathPatterns("/**")
            .excludePathPatterns("/health");
    }
}

// OUTPUT:
// /hello is timed; /health is skipped`]],
        [['Test through MockMvc.',
            r`@WebMvcTest(HelloController.class)
@Import({WebConfig.class, TimingInterceptor.class})
class InterceptorTest {
    @Autowired MockMvc mvc;

    @Test
    void runs() throws Exception {
        mvc.perform(get("/hello")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0 (log line printed)`],
            ['Trace the order.',
                r`registry.addInterceptor(new A());   // order 1
registry.addInterceptor(new B());   // order 2

// request flow:
// A.preHandle, B.preHandle, controller, B.postHandle, A.postHandle,
// B.afterCompletion, A.afterCompletion

// OUTPUT:
// pre A, pre B, handler, post B, post A, after B, after A`]]
    ),

    'mvc-handlerinterceptor': x(
        ['<b>HandlerInterceptor</b> is the Spring MVC interface (<code>org.springframework.web.servlet</code>) with three callbacks around handler execution.',
            '<b>Methods</b>: <code>preHandle</code> returns a <code>boolean</code>; <code>postHandle</code> and <code>afterCompletion</code> return nothing; all three have default empty implementations.',
            '<b>Minimal use</b>: implement only the methods you need and register the class with <code>InterceptorRegistry</code>.'],
        ['<b>postHandle</b> runs after the controller but before the view is rendered, and can change the <code>ModelAndView</code>; it is skipped if the handler throws.',
            '<b>afterCompletion</b> always runs for interceptors whose <code>preHandle</code> returned true, even after an exception; use it for cleanup.',
            '<b>handler argument</b>: usually a <code>HandlerMethod</code>, which gives access to the controller class, method and annotations.'],
        ['<b>@ResponseBody caveat</b>: the response may already be committed when <code>postHandle</code> runs, so changing headers there is unreliable.',
            '<b>Async</b>: for async requests use <code>AsyncHandlerInterceptor</code>, whose <code>afterConcurrentHandlingStarted</code> is called instead.',
            '<b>Static resources</b>: the handler is a <code>ResourceHttpRequestHandler</code>, not a <code>HandlerMethod</code>, so check the type before casting.'],
        [['F', 'What is HandlerInterceptor?', 'An interface with preHandle, postHandle and afterCompletion callbacks around controller execution.'],
            ['F', 'Which callback can stop the request?', 'preHandle, by returning false.'],
            ['M', 'When does postHandle not run?', 'When preHandle returned false or the handler threw an exception.'],
            ['M', 'Why use afterCompletion for cleanup?', 'It runs even after exceptions, as long as that interceptor preHandle returned true.'],
            ['S', 'How do you read a custom annotation on the target method?', 'Cast the handler to HandlerMethod and call getMethodAnnotation.'],
            ['S', 'Why check instanceof HandlerMethod?', 'Requests for static resources or error pages use other handler types and a blind cast throws ClassCastException.']],
        [['Log all three phases.',
            r`public class LogInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        System.out.println("pre " + q.getMethod() + " " + q.getRequestURI());
        return true;
    }
    public void postHandle(HttpServletRequest q, HttpServletResponse s, Object h,
            ModelAndView mv) {
        System.out.println("post");
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
            Object h, Exception ex) {
        System.out.println("after status=" + s.getStatus());
    }
}

// OUTPUT:
// pre GET /hello
// post
// after status=200`],
            ['Annotation-driven check.',
                r`@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@interface AdminOnly { }

public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    if (h instanceof HandlerMethod hm
            && hm.hasMethodAnnotation(AdminOnly.class)
            && !"admin".equals(q.getHeader("X-Role"))) {
        s.sendError(HttpServletResponse.SC_FORBIDDEN);
        return false;
    }
    return true;
}

// OUTPUT:
// GET /admin without X-Role -> 403 Forbidden`]],
        [['Unit test without Spring.',
            r`@Test
void blocksNonAdmin() throws Exception {
    MockHttpServletRequest req = new MockHttpServletRequest("GET", "/admin");
    MockHttpServletResponse res = new MockHttpServletResponse();
    HandlerMethod hm = new HandlerMethod(new AdminController(),
        AdminController.class.getMethod("panel"));
    boolean ok = new RoleInterceptor().preHandle(req, res, hm);
    assertFalse(ok);
    assertEquals(403, res.getStatus());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Check cleanup runs after errors.',
                r`@Test
void afterCompletionRunsOnError() throws Exception {
    mvc.perform(get("/boom")).andExpect(status().is5xxServerError());
    // the log shows "after status=500" because afterCompletion still ran
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-prehandle': x(
        ['<b>preHandle()</b> is the <code>HandlerInterceptor</code> method that runs before the controller; its signature is <code>boolean preHandle(request, response, handler)</code>.',
            '<b>Return value</b>: <code>true</code> continues the chain to the next interceptor and the controller; <code>false</code> stops it.',
            '<b>Typical use</b>: authentication, rate limiting, request logging and setting request attributes.'],
        ['<b>When returning false</b>: you must write the response yourself, for example <code>response.sendError(401)</code> or set a status and body; otherwise the client gets an empty 200.',
            '<b>handler</b>: the matched target, usually a <code>HandlerMethod</code>, so you can read annotations.',
            '<b>Passing data</b>: use <code>request.setAttribute</code> to hand values to the controller or to <code>afterCompletion</code>.'],
        ['<b>Chain behavior</b>: if interceptor 2 returns false, interceptor 1 still gets <code>afterCompletion</code>, but 2 and later get nothing and the controller never runs.',
            '<b>Exceptions</b>: an exception thrown in preHandle goes to the exception resolvers, such as <code>@ControllerAdvice</code>.',
            '<b>Body reading</b>: do not read the request body here without a caching wrapper, because the controller needs it too.'],
        [['F', 'What does preHandle return?', 'A boolean: true to continue, false to stop processing.'],
            ['F', 'When does preHandle run?', 'Before the controller method is called.'],
            ['M', 'What must you do when preHandle returns false?', 'Write the response yourself, such as sendError or a status with body.'],
            ['M', 'How do you pass data to the controller from preHandle?', 'Set a request attribute and read it with @RequestAttribute or the request.'],
            ['S', 'Which afterCompletion calls happen if the second interceptor returns false?', 'Only the first interceptor afterCompletion runs; the second and later never started the chain.'],
            ['S', 'Why not read the body in preHandle?', 'The servlet input stream can be read only once, so the controller would see an empty body unless you wrap the request.']],
        [['Simple API key check.',
            r`public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
        Object handler) throws IOException {
    if (!"secret".equals(req.getHeader("X-Api-Key"))) {
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "bad key");
        return false;             // controller is not called
    }
    return true;
}

// OUTPUT:
// no key     -> 401 Unauthorized
// X-Api-Key: secret -> 200 OK`],
            ['Pass a value to the controller.',
                r`public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
        Object handler) {
    req.setAttribute("traceId", UUID.randomUUID().toString());
    return true;
}

@GetMapping("/trace")
String trace(@RequestAttribute("traceId") String id) { return id; }

// OUTPUT: (varies)
// 3f2a9c1e-7b64-4d0a-9a55-0c1e2b7d8f10`]],
        [['Test the rejection.',
            r`@Test
void missingKey() throws Exception {
    mvc.perform(get("/secure"))
        .andExpect(status().isUnauthorized());
}

@Test
void withKey() throws Exception {
    mvc.perform(get("/secure").header("X-Api-Key", "secret"))
        .andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`],
            ['Order of two interceptors.',
                r`// A.preHandle -> true, B.preHandle -> false
// Result of the chain:
//   A.preHandle, B.preHandle, A.afterCompletion
//   controller and both postHandle calls are skipped

// OUTPUT:
// pre A, pre B, after A`]]
    )
};

export const smvc18Deep: Record<string, Deep> = {
    'mvc-byte-array-converter': dv(
        [`<p>How a <code>byte[]</code> body travels through Spring MVC:</p><ul><li><b>Write path:</b> <code>RequestResponseBodyMethodProcessor</code> asks each converter <code>canWrite(byte[].class, mediaType)</code>.</li><li><b>Match:</b> <code>ByteArrayHttpMessageConverter</code> supports <code>byte[]</code> for <code>application/octet-stream</code> and <code>*/*</code>.</li><li><b>Order:</b> it is first in the default list, so it wins before Jackson.</li><li><b>Read path:</b> <code>readInternal</code> copies the input stream into an array.</li></ul>`,
            r`// simplified view of the converter
public class ByteArrayHttpMessageConverter
        extends AbstractHttpMessageConverter<byte[]> {
    public ByteArrayHttpMessageConverter() {
        super(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL);
    }
    protected boolean supports(Class<?> clazz) { return byte[].class == clazz; }
    protected byte[] readInternal(Class<? extends byte[]> c, HttpInputMessage in)
            throws IOException {
        return in.getBody().readAllBytes();
    }
    protected void writeInternal(byte[] bytes, HttpOutputMessage out)
            throws IOException {
        out.getBody().write(bytes);
    }
}

// OUTPUT:
// Returning byte[] -> bytes are written unchanged to the response body`],
        [`<p>Ways to send binary content:</p><ul><li><b>byte[]:</b> simplest, whole body in memory.</li><li><b>Resource:</b> handled by <code>ResourceHttpMessageConverter</code>, supports range requests.</li><li><b>InputStreamResource:</b> for streams of unknown length.</li><li><b>StreamingResponseBody:</b> writes directly to the output from another thread.</li><li><b>HttpServletResponse:</b> manual control.</li></ul>`,
            r`@GetMapping("/a")
byte[] asBytes() { return new byte[] {1, 2, 3}; }

@GetMapping("/b")
Resource asResource() { return new FileSystemResource("data/report.pdf"); }

@GetMapping("/c")
ResponseEntity<StreamingResponseBody> asStream() {
    StreamingResponseBody body = out -> out.write("large".getBytes());
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM).body(body);
}

// OUTPUT:
// /a -> 3 bytes, /b -> the PDF with Content-Length, /c -> streamed body`],
        [`<p>Common mistakes:</p><ul><li><b>Missing Content-Type:</b> a PDF served as octet-stream is downloaded with no hint of its type.</li><li><b>Large file in byte[]:</b> causes OutOfMemoryError under load.</li><li><b>Returning byte[] with produces JSON:</b> mismatched type leads to 406 or odd output.</li><li><b>Unsafe file names:</b> never build a path from user input without validation.</li></ul>`,
            r`// WRONG: loads a 500 MB file per request
// byte[] all = Files.readAllBytes(path);

// RIGHT: stream it
@GetMapping("/big")
ResponseEntity<Resource> big() {
    Resource r = new FileSystemResource("data/big.zip");
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("application/zip"))
        .body(r);
}

// OUTPUT:
// heap use stays flat; file is sent in chunks`],
        [`<p>Tuning binary responses:</p><ul><li>Prefer <code>Resource</code> for files; it uses zero-copy paths and supports <code>Range</code> headers.</li><li>Set <code>Content-Length</code> and cache headers (<code>ETag</code>, <code>Cache-Control</code>).</li><li>Let a CDN or static handler serve big files.</li><li>Compression is wasted on already compressed formats like JPEG or ZIP.</li></ul>`,
            r`@GetMapping("/img")
ResponseEntity<byte[]> img() throws IOException {
    byte[] data = new ClassPathResource("logo.png").getContentAsByteArray();
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePublic())
        .eTag("\"v1\"")
        .contentType(MediaType.IMAGE_PNG)
        .body(data);
}

// OUTPUT:
// Cache-Control: max-age=604800, public
// ETag: "v1"`],
        [`<p>Scenario: an invoice service generates a PDF with a library and returns it for download.</p><ul><li>Generate to a byte array (small, short lived).</li><li>Return with the right Content-Type and file name.</li><li>Test status, type and the PDF header bytes.</li></ul>`,
            r`@GetMapping("/invoices/{id}/pdf")
ResponseEntity<byte[]> invoice(@PathVariable long id) {
    byte[] pdf = invoiceService.render(id);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=invoice-" + id + ".pdf")
        .contentType(MediaType.APPLICATION_PDF)
        .contentLength(pdf.length)
        .body(pdf);
}

// OUTPUT: (varies)
// 200 OK, Content-Type: application/pdf, Content-Length: 18342`]
    ),

    'mvc-form-converter': dv(
        [`<p>Internals of form handling:</p><ul><li><b>Read:</b> <code>FormHttpMessageConverter</code> parses the body into a <code>MultiValueMap</code>, splitting on <code>&amp;</code> and URL-decoding names and values.</li><li><b>Write:</b> it encodes the map back to <code>a=1&amp;b=2</code>; for multipart it writes boundaries and parts.</li><li><b>Supported types:</b> <code>MultiValueMap</code> for form types; it does not read multipart into a map.</li><li><b>Servlet interplay:</b> for urlencoded POST, <code>request.getParameter</code> triggers body parsing by the container.</li></ul>`,
            r`FormHttpMessageConverter conv = new FormHttpMessageConverter();
MockHttpOutputMessage out = new MockHttpOutputMessage();
MultiValueMap<String, String> m = new LinkedMultiValueMap<>();
m.add("name", "Ravi Kumar");
m.add("tag", "a");
m.add("tag", "b");
conv.write(m, MediaType.APPLICATION_FORM_URLENCODED, out);
System.out.println(out.getBodyAsString(StandardCharsets.UTF_8));

// OUTPUT:
// name=Ravi+Kumar&tag=a&tag=b`],
        [`<p>Three ways to read the same form:</p><ul><li><b>@RequestParam:</b> one field, with defaults and conversion.</li><li><b>@ModelAttribute:</b> binds to an object and supports validation.</li><li><b>@RequestBody MultiValueMap:</b> raw access to all fields.</li><li><b>@RequestParam Map:</b> only the first value per key.</li></ul>`,
            r`@PostMapping("/f1")
String f1(@RequestParam String name, @RequestParam(defaultValue = "0") int age) {
    return name + age;
}

@PostMapping("/f2")
String f2(@Valid @ModelAttribute Signup s) { return s.name(); }

@PostMapping("/f3")
String f3(@RequestParam MultiValueMap<String, String> all) {
    return all.toString();
}

// OUTPUT:
// body: name=ann&age=3 -> /f1 ann3
// /f3 -> {name=[ann], age=[3]}`],
        [`<p>Common mistakes:</p><ul><li><b>Sending JSON to a form endpoint</b>: gives 415 or empty fields.</li><li><b>Missing Content-Type</b> on the client, so the body is not treated as a form.</li><li><b>Mixing @RequestBody and @RequestParam</b> on the same urlencoded request.</li><li><b>Wrong encoding</b> of special characters such as plus or ampersand in hand-built bodies.</li></ul>`,
            r`// WRONG: raw string with an unescaped ampersand in the value
// body = "note=a&b";        // parsed as note=a and b=

// RIGHT: encode values
String note = URLEncoder.encode("a&b", StandardCharsets.UTF_8);
String body = "note=" + note;
System.out.println(body);

// OUTPUT:
// note=a%26b`],
        [`<p>Form tuning and limits:</p><ul><li>Limit size with <code>server.tomcat.max-http-form-post-size</code>.</li><li>Large uploads: set <code>spring.servlet.multipart.max-file-size</code> and <code>max-request-size</code>.</li><li>Use <code>HiddenHttpMethodFilter</code> (or Boot form-content filter) only when you need PUT and DELETE from forms.</li></ul>`,
            r`# application.properties
server.tomcat.max-http-form-post-size=2MB
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB

# OUTPUT:
# larger form posts are rejected before reaching the controller`],
        [`<p>Scenario: a legacy HTML page posts a login form and a mobile app calls the same logic with JSON.</p><ul><li>Two mappings, one per Content-Type.</li><li>Both delegate to the same service.</li><li>Tests cover both bodies.</li></ul>`,
            r`@PostMapping(value = "/login", consumes = "application/x-www-form-urlencoded")
String loginForm(@RequestParam String user, @RequestParam String pass) {
    return auth.login(user, pass);
}

@PostMapping(value = "/login", consumes = "application/json")
String loginJson(@RequestBody Credentials c) {
    return auth.login(c.user(), c.pass());
}

// OUTPUT:
// form and JSON clients both receive the same token (varies)`]
    ),

    'mvc-jackson-integration': dv(
        [`<p>How Jackson is wired:</p><ul><li><b>Boot:</b> <code>JacksonAutoConfiguration</code> builds an <code>ObjectMapper</code> using <code>Jackson2ObjectMapperBuilder</code> and registers modules found on the classpath (java.time, Jdk8, parameter names).</li><li><b>MVC:</b> <code>MappingJackson2HttpMessageConverter</code> gets that mapper and handles <code>application/json</code> and <code>application/*+json</code>.</li><li><b>Read:</b> the converter calls <code>readValue</code>; <b>write:</b> <code>writeValue</code> to the output stream.</li><li><b>Boot defaults:</b> unknown properties ignored, dates as ISO strings.</li></ul>`,
            r`@Autowired ObjectMapper mapper;

void demo() throws Exception {
    String json = mapper.writeValueAsString(
        new Event("launch", LocalDate.of(2025, 1, 15)));
    Event back = mapper.readValue(json, Event.class);
    System.out.println(json + " -> " + back.name());
}
record Event(String name, LocalDate day) { }

// OUTPUT:
// {"name":"launch","day":"2025-01-15"} -> launch`],
        [`<p>Configuration options:</p><ul><li><b>Properties:</b> <code>spring.jackson.property-naming-strategy</code>, <code>default-property-inclusion</code>, <code>serialization.*</code>, <code>deserialization.*</code>.</li><li><b>Annotations:</b> <code>@JsonProperty</code>, <code>@JsonAlias</code>, <code>@JsonIgnoreProperties</code>, <code>@JsonView</code>, <code>@JsonCreator</code>.</li><li><b>Mixins:</b> annotate classes you cannot edit.</li><li><b>Custom (de)serializers:</b> <code>@JsonComponent</code>.</li></ul>`,
            r`# application.yml
spring:
  jackson:
    property-naming-strategy: SNAKE_CASE
    default-property-inclusion: non_null
    serialization:
      indent-output: true

# OUTPUT:
# {
#   "first_name" : "Ann"
# }`],
        [`<p>Typical mistakes:</p><ul><li><b>Missing default constructor</b> for classes (records and <code>@JsonCreator</code> fix it).</li><li><b>Lazy Hibernate proxies</b> serialized directly; return DTOs instead.</li><li><b>Infinite recursion</b> from bidirectional entities; use DTOs or <code>@JsonIgnore</code>.</li><li><b>Date as array</b> when the JavaTimeModule is missing in a hand-built mapper.</li></ul>`,
            r`// WRONG: entity cycle  Order -> Customer -> orders -> Order ...
// StackOverflowError / HttpMessageNotWritableException

// RIGHT: map to a DTO
record OrderDto(long id, String customerName) {
    static OrderDto of(Order o) {
        return new OrderDto(o.getId(), o.getCustomer().getName());
    }
}

// OUTPUT:
// {"id":7,"customerName":"Ann"}`],
        [`<p>Performance:</p><ul><li>The <code>ObjectMapper</code> is thread safe and costly to create, so share one.</li><li>Return small DTOs and use <code>@JsonView</code> or projections to avoid large payloads.</li><li>Consider the Afterburner or Blackbird module for speed, and gzip for large bodies.</li><li>Use streaming (<code>JsonGenerator</code>) for huge lists.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.mime-types=application/json
server.compression.min-response-size=2048

# OUTPUT:
# responses over 2 KB are gzip compressed (Content-Encoding: gzip)`],
        [`<p>Scenario: an API must return snake_case JSON with ISO dates, hide internal fields and still accept camelCase input from an old client.</p><ul><li>Naming strategy in properties.</li><li><code>@JsonAlias</code> for the old names.</li><li>A slice test locks the contract.</li></ul>`,
            r`record Customer(
    @JsonAlias("fullName") String name,
    @JsonIgnore String internalNote,
    LocalDate since) { }

@Test
void contract() throws Exception {
    mvc.perform(get("/customers/1"))
        .andExpect(jsonPath("$.name").value("Ann"))
        .andExpect(jsonPath("$.since").value("2024-03-01"))
        .andExpect(jsonPath("$.internal_note").doesNotExist());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),

    'mvc-custom-message-converter': dv(
        [`<p>What happens at runtime:</p><ul><li><b>Write:</b> the return value processor loops converters, calls <code>canWrite(type, mediaType)</code>; <code>AbstractHttpMessageConverter</code> checks <code>supports</code> and the media type list.</li><li><b>Headers:</b> the base class sets Content-Type and optionally Content-Length (<code>getContentLength</code>).</li><li><b>Read:</b> <code>canRead</code> is checked against the request Content-Type before <code>readInternal</code>.</li><li><b>List building:</b> Spring starts with defaults, then calls your <code>configureMessageConverters</code> or <code>extendMessageConverters</code>.</li></ul>`,
            r`@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    converters.forEach(c -> System.out.println(c.getClass().getSimpleName()));
}

// OUTPUT: (varies by classpath)
// ByteArrayHttpMessageConverter
// StringHttpMessageConverter
// ResourceHttpMessageConverter
// FormHttpMessageConverter
// MappingJackson2HttpMessageConverter`],
        [`<p>Variants:</p><ul><li><b>AbstractHttpMessageConverter&lt;T&gt;:</b> one concrete class.</li><li><b>AbstractGenericHttpMessageConverter:</b> generic types.</li><li><b>HttpMessageConverters bean (Boot):</b> add converters and keep defaults.</li><li><b>Fully custom:</b> implement <code>HttpMessageConverter</code> directly.</li></ul>`,
            r`// Spring Boot: declare a bean, Boot adds it to the defaults
@Bean
HttpMessageConverters csvConverters() {
    return new HttpMessageConverters(new BookCsvConverter());
}

// OUTPUT:
// BookCsvConverter is available alongside the Jackson converter`],
        [`<p>Mistakes:</p><ul><li><b>configureMessageConverters</b> removes all defaults, so JSON stops working.</li><li><b>supports always true</b>, which hijacks every type.</li><li><b>Not closing or flushing</b>: use the stream given and do not close it.</li><li><b>Charset ignored</b>: encode with an explicit charset.</li></ul>`,
            r`// WRONG
protected boolean supports(Class<?> c) { return true; }

// RIGHT
protected boolean supports(Class<?> c) { return Book.class.isAssignableFrom(c); }

// WRONG: default charset of the platform
// out.getBody().write(text.getBytes());
// RIGHT
// out.getBody().write(text.getBytes(StandardCharsets.UTF_8));

// OUTPUT:
// only Book bodies go through the CSV converter`],
        [`<p>Performance:</p><ul><li>Write straight to the output stream; avoid building big strings.</li><li>Keep converters stateless and thread safe.</li><li>Put frequently used converters first, but only if <code>supports</code> is narrow and cheap.</li></ul>`,
            r`protected void writeInternal(List<Book> books, HttpOutputMessage out)
        throws IOException {
    try (Writer w = new BufferedWriter(
            new OutputStreamWriter(out.getBody(), StandardCharsets.UTF_8))) {
        for (Book b : books) w.write(b.title() + "," + b.year() + "\n");
    }
}

// OUTPUT:
// large lists are streamed row by row without one big String`],
        [`<p>Scenario: a reporting API lets analysts download <code>text/csv</code> from the same endpoint that serves JSON to the web app.</p><ul><li>Same controller, two media types.</li><li>Converter registered once.</li><li>Tests per Accept header.</li></ul>`,
            r`@GetMapping(value = "/books", produces = {"application/json", "text/csv"})
List<Book> books() { return service.all(); }

@Test
void csvExport() throws Exception {
    mvc.perform(get("/books").accept("text/csv"))
        .andExpect(content().contentTypeCompatibleWith("text/csv"));
}

// OUTPUT:
// Accept: text/csv -> Spring,2024 (one line per book)`]
    ),

    'mvc-content-negotiation': dv(
        [`<p>Steps in the pipeline:</p><ul><li><b>1:</b> <code>ContentNegotiationManager</code> asks its strategies for requested media types (header by default, parameter if enabled).</li><li><b>2:</b> the producible types come from <code>produces</code> or from converters that can write the return type.</li><li><b>3:</b> both lists are matched and sorted by specificity and quality.</li><li><b>4:</b> the first compatible pair picks the converter, else <code>HttpMediaTypeNotAcceptableException</code> (406).</li></ul>`,
            r`ContentNegotiationManager mgr = new ContentNegotiationManager(
    new HeaderContentNegotiationStrategy());
NativeWebRequest req = new ServletWebRequest(
    new MockHttpServletRequestBuilder(HttpMethod.GET, "/x")
        .header("Accept", "application/xml;q=0.5, application/json")
        .buildRequest(new MockServletContext()));
System.out.println(mgr.resolveMediaTypes(req));

// OUTPUT:
// [application/json, application/xml;q=0.5]`],
        [`<p>Strategies:</p><ul><li><b>Header:</b> default, uses Accept.</li><li><b>Parameter:</b> <code>?format=json</code> via <code>favorParameter</code>.</li><li><b>Fixed default:</b> <code>defaultContentType</code> when none is requested.</li><li><b>Custom:</b> implement <code>ContentNegotiationStrategy</code>.</li><li>Path extension: removed in Spring 6.</li></ul>`,
            r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.favorParameter(true)
     .ignoreAcceptHeader(false)
     .defaultContentType(MediaType.APPLICATION_JSON)
     .mediaType("json", MediaType.APPLICATION_JSON)
     .mediaType("csv", new MediaType("text", "csv"));
}

# OUTPUT:
# ?format=csv wins when parameter strategy is on; otherwise Accept is used`],
        [`<p>Common mistakes:</p><ul><li>Expecting <code>.json</code> URL suffix to work in Spring 6.</li><li>Missing the XML library, so XML is never offered (add Jackson XML).</li><li>Returning a <code>String</code> and expecting JSON: the String converter writes it as plain text.</li><li>Browsers send XML-friendly Accept headers, so JSON may become XML unexpectedly.</li></ul>`,
            r`// WRONG: returns text/plain, not JSON
@GetMapping("/v1")
String v1() { return "{\"a\":1}"; }

// RIGHT
@GetMapping(value = "/v2", produces = MediaType.APPLICATION_JSON_VALUE)
Map<String, Integer> v2() { return Map.of("a", 1); }

// OUTPUT:
// /v1 -> Content-Type: text/plain
// /v2 -> Content-Type: application/json`],
        [`<p>Tuning:</p><ul><li>Negotiation is cheap, but each extra format needs tests.</li><li>Expose only formats you support; use <code>produces</code> to keep the list small.</li><li>Cache by <code>Vary: Accept</code> or give each format its own URL.</li></ul>`,
            r`@GetMapping(value = "/stats", produces = MediaType.APPLICATION_JSON_VALUE)
ResponseEntity<Stats> stats() {
    return ResponseEntity.ok()
        .header(HttpHeaders.VARY, HttpHeaders.ACCEPT)
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
        .body(service.stats());
}

// OUTPUT:
// Vary: Accept
// Cache-Control: max-age=300`],
        [`<p>Scenario: a public API serves JSON to apps and XML to a partner who cannot change headers, so the partner uses <code>?format=xml</code>.</p><ul><li>Enable the parameter strategy.</li><li>Keep JSON as default.</li><li>Test all three paths.</li></ul>`,
            r`@Test
void partnerUsesParameter() throws Exception {
    mvc.perform(get("/users/1").param("format", "xml"))
        .andExpect(content().contentType(MediaType.APPLICATION_XML));
}

@Test
void defaultsToJson() throws Exception {
    mvc.perform(get("/users/1"))
        .andExpect(content().contentType(MediaType.APPLICATION_JSON));
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]
    ),

    'mvc-accept-header': dv(
        [`<p>Processing steps:</p><ul><li><b>Parse:</b> <code>MediaType.parseMediaTypes</code> splits the header into media types with q values.</li><li><b>Sort:</b> <code>MimeTypeUtils.sortBySpecificity</code>: specific beats wildcard, then higher q.</li><li><b>Map:</b> <code>ProducesRequestCondition</code> on each mapping matches the sorted list.</li><li><b>Fail:</b> no match gives <code>HttpMediaTypeNotAcceptableException</code>, status 406.</li></ul>`,
            r`List<MediaType> list = MediaType.parseMediaTypes(
    "text/*;q=0.3, application/json, */*;q=0.1");
MimeTypeUtils.sortBySpecificity(list);
System.out.println(list);

// OUTPUT:
// [application/json, text/*;q=0.3, */*;q=0.1]`],
        [`<p>Forms of the header:</p><ul><li><code>Accept: application/json</code> exact.</li><li><code>Accept: application/*+json</code> structured suffix.</li><li><code>Accept: */*</code> anything.</li><li><code>Accept: text/html, application/json;q=0.9</code> list with q.</li><li>Negation: <code>produces = &quot;!application/xml&quot;</code>.</li></ul>`,
            r`@GetMapping(value = "/p", produces = "!application/xml")
String notXml() { return "ok"; }

@GetMapping(value = "/q", produces = MediaType.APPLICATION_JSON_VALUE)
Map<String, String> json() { return Map.of("ok", "yes"); }

// OUTPUT:
// /p with Accept: application/xml -> 406
// /q with Accept: */* -> {"ok":"yes"}`],
        [`<p>Mistakes:</p><ul><li>Treating 406 as a server bug; the client asked for an unsupported type.</li><li>Hard-coding <code>Accept</code> in tests instead of using <code>accept(...)</code>.</li><li>Confusing Accept with Content-Type in a POST.</li><li>Ignoring wildcard requests from browsers and curl.</li></ul>`,
            r`// WRONG: client sends only Content-Type, server needs JSON back
// curl -X POST /orders -H "Content-Type: application/json" -d "{}"
// (works only because */* is sent by default)

// RIGHT: say what you expect
// curl -H "Accept: application/json" -H "Content-Type: application/json" ...

// OUTPUT:
// explicit headers behave the same in every client`],
        [`<p>Performance and caching:</p><ul><li>Parsing the header is cheap.</li><li>Different representations at one URL need <code>Vary: Accept</code> for correct caching.</li><li>Many formats multiply cache entries; consider separate URLs for hot resources.</li></ul>`,
            r`@GetMapping(value = "/catalog", produces = {"application/json", "text/csv"})
ResponseEntity<List<Item>> catalog() {
    return ResponseEntity.ok()
        .header("Vary", "Accept")
        .body(items.all());
}

// OUTPUT:
// Vary: Accept`],
        [`<p>Scenario: one endpoint serves a web app (JSON) and a spreadsheet export (CSV) chosen by the Accept header.</p><ul><li>Declare both types in <code>produces</code>.</li><li>Test both and the 406 case.</li></ul>`,
            r`@ParameterizedTest
@CsvSource({"application/json,200", "text/csv,200", "application/pdf,406"})
void formats(String accept, int status) throws Exception {
    mvc.perform(get("/catalog").accept(accept))
        .andExpect(status().is(status));
}

// OUTPUT:
// Tests run: 3, Failures: 0, Errors: 0`]
    ),

    'mvc-content-type-header': dv(
        [`<p>Inside the request path:</p><ul><li><b>Mapping:</b> <code>ConsumesRequestCondition</code> compares Content-Type with <code>consumes</code>; mismatch gives <code>HttpMediaTypeNotSupportedException</code> (415).</li><li><b>Argument:</b> <code>RequestResponseBodyMethodProcessor</code> picks a converter via <code>canRead</code>.</li><li><b>Response:</b> the chosen converter sets Content-Type on output, with charset when relevant.</li></ul>`,
            r`ConsumesRequestCondition cond = new ConsumesRequestCondition("application/json");
MockHttpServletRequest req = new MockHttpServletRequest("POST", "/x");
req.setContentType("application/json;charset=UTF-8");
System.out.println(cond.getMatchingCondition(req) != null);
req.setContentType("text/plain");
System.out.println(cond.getMatchingCondition(req) != null);

// OUTPUT:
// true
// false`],
        [`<p>Variants:</p><ul><li><code>consumes = &quot;application/json&quot;</code> single type.</li><li>Several types in an array.</li><li><code>MediaType</code> constants such as <code>APPLICATION_JSON_VALUE</code>.</li><li>Negation with <code>!</code>.</li><li>Class-level <code>consumes</code>, overridden per method.</li><li>Multipart: <code>@RequestPart</code> with <code>multipart/form-data</code>.</li></ul>`,
            r`@RestController
@RequestMapping(value = "/api", consumes = MediaType.APPLICATION_JSON_VALUE)
class ApiController {
    @PostMapping("/a") String a(@RequestBody Map<String, String> m) { return "a"; }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    String upload(@RequestPart("file") MultipartFile f) { return f.getName(); }
}

// OUTPUT:
// /api/a needs JSON; /api/upload needs multipart (method level overrides class)`],
        [`<p>Mistakes:</p><ul><li>Test or client without Content-Type, then 415.</li><li>Sending form data to a JSON endpoint.</li><li>Wrong charset in header for non-UTF-8 text.</li><li>Putting <code>@RequestBody</code> and <code>@RequestParam</code> for the same form.</li></ul>`,
            r`// WRONG: curl -X POST /orders -d '{"item":"pen"}'
//        curl sends application/x-www-form-urlencoded by default -> 415

// RIGHT
// curl -X POST /orders -H "Content-Type: application/json" -d '{"item":"pen"}'

// OUTPUT:
// WRONG -> 415 Unsupported Media Type
// RIGHT -> 200 created pen`],
        [`<p>Tuning and safety:</p><ul><li>Accept only the types you handle; fewer converters means less attack surface.</li><li>Limit body size (<code>server.tomcat.max-swallow-size</code>, <code>spring.servlet.multipart.*</code>).</li><li>Reject early with <code>consumes</code> before parsing starts.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=5MB
server.tomcat.max-swallow-size=2MB

# OUTPUT:
# oversize bodies are rejected before the controller runs`],
        [`<p>Scenario: a webhook endpoint receives JSON from one partner and XML from another.</p><ul><li>Two methods on one URL, split by <code>consumes</code>.</li><li>Unknown formats receive 415 automatically.</li></ul>`,
            r`@PostMapping(value = "/hook", consumes = "application/json")
void json(@RequestBody Event e) { service.handle(e); }

@PostMapping(value = "/hook", consumes = "application/xml")
void xml(@RequestBody Event e) { service.handle(e); }

// OUTPUT:
// application/json -> 200
// application/xml  -> 200
// text/plain       -> 415`]
    ),

    'mvc-spring-mvc-interceptors': dv(
        [`<p>Where interceptors sit in the flow:</p><ul><li><b>DispatcherServlet.doDispatch</b> finds a handler and its <code>HandlerExecutionChain</code> (handler plus matching interceptors).</li><li><b>applyPreHandle</b> loops in order and stops at the first <code>false</code>, then triggers <code>afterCompletion</code> for those already passed.</li><li><b>handle</b> invokes the controller through a <code>HandlerAdapter</code>.</li><li><b>applyPostHandle</b> runs in reverse, then the view renders, then <code>triggerAfterCompletion</code>.</li></ul>`,
            r`// request pipeline (simplified)
// Filter chain -> DispatcherServlet
//   -> HandlerMapping returns HandlerExecutionChain
//   -> interceptors.preHandle (1..n)
//   -> HandlerAdapter.handle -> controller
//   -> interceptors.postHandle (n..1)
//   -> render view
//   -> interceptors.afterCompletion (n..1)

// OUTPUT:
// a false preHandle at position k skips the controller and calls
// afterCompletion for interceptors 1..k-1`],
        [`<p>Registration options:</p><ul><li><b>addPathPatterns / excludePathPatterns:</b> ant-style or <code>PathPattern</code> URLs.</li><li><b>order(int):</b> explicit ordering.</li><li><b>Built-ins:</b> <code>LocaleChangeInterceptor</code>, <code>ThemeChangeInterceptor</code>, <code>ConversionServiceExposingInterceptor</code>.</li><li><b>WebRequestInterceptor:</b> servlet-independent variant.</li><li><b>Boot:</b> use a <code>WebMvcConfigurer</code> bean; no extra setup.</li></ul>`,
            r`@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new LocaleChangeInterceptor()).order(0);
    registry.addInterceptor(auth)
        .addPathPatterns("/api/**")
        .excludePathPatterns("/api/public/**")
        .order(1);
}

// OUTPUT:
// /api/orders -> locale + auth; /api/public/info -> locale only`],
        [`<p>Mistakes:</p><ul><li><b>Instance created with new</b> inside the registry, so no injection; use a bean.</li><li><b>Wrong pattern</b>: <code>/api/*</code> misses deeper paths.</li><li><b>Expecting interceptors for static files</b> or servlet filters.</li><li><b>Heavy work in preHandle</b> blocks every request.</li></ul>`,
            r`// WRONG: no injection, auth.service is null
registry.addInterceptor(new AuthInterceptor());

// RIGHT: inject the bean
@Configuration
class WebConfig implements WebMvcConfigurer {
    private final AuthInterceptor auth;
    WebConfig(AuthInterceptor auth) { this.auth = auth; }
    public void addInterceptors(InterceptorRegistry r) { r.addInterceptor(auth); }
}

// OUTPUT:
// auth interceptor can call its injected services`],
        [`<p>Performance:</p><ul><li>Interceptors run on every matched request, so keep them cheap.</li><li>Narrow path patterns to avoid needless calls.</li><li>Do slow work (remote calls) with caches, not in each request.</li><li>Use <code>afterCompletion</code> for timing; <code>postHandle</code> is skipped on errors.</li></ul>`,
            r`public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    q.setAttribute("t0", System.nanoTime());
    return true;
}
public void afterCompletion(HttpServletRequest q, HttpServletResponse s, Object h,
        Exception ex) {
    long micros = (System.nanoTime() - (long) q.getAttribute("t0")) / 1_000;
    meterRegistry.timer("http.custom", "uri", q.getRequestURI())
        .record(micros, TimeUnit.MICROSECONDS);
}

// OUTPUT: (varies)
// http.custom{uri=/orders} count=1 total=850us`],
        [`<p>Scenario: audit logging of every API call with user, URL, status and duration.</p><ul><li>Start time in <code>preHandle</code>.</li><li>Log in <code>afterCompletion</code> (always runs).</li><li>Exclude health and static paths.</li></ul>`,
            r`@Component
class AuditInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger("audit");

    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        q.setAttribute("t0", System.currentTimeMillis());
        return true;
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
            Object h, Exception ex) {
        long ms = System.currentTimeMillis() - (long) q.getAttribute("t0");
        log.info("{} {} -> {} in {} ms", q.getMethod(), q.getRequestURI(),
            s.getStatus(), ms);
    }
}

// OUTPUT: (varies)
// audit: GET /api/orders -> 200 in 14 ms`]
    ),

    'mvc-handlerinterceptor': dv(
        [`<p>Contract and call order:</p><ul><li><b>preHandle:</b> called by <code>HandlerExecutionChain.applyPreHandle</code> in order; false stops.</li><li><b>postHandle:</b> called in reverse after the handler, with the <code>ModelAndView</code> (null for <code>@ResponseBody</code>).</li><li><b>afterCompletion:</b> called in reverse for each interceptor that passed preHandle, with the exception if any.</li><li><b>Defaults:</b> since Spring 5 all methods are Java default methods, so implement only what you need.</li></ul>`,
            r`// HandlerInterceptor (Spring 6)
public interface HandlerInterceptor {
    default boolean preHandle(HttpServletRequest request,
            HttpServletResponse response, Object handler) throws Exception {
        return true;
    }
    default void postHandle(HttpServletRequest request,
            HttpServletResponse response, Object handler,
            @Nullable ModelAndView modelAndView) throws Exception { }
    default void afterCompletion(HttpServletRequest request,
            HttpServletResponse response, Object handler,
            @Nullable Exception ex) throws Exception { }
}

// OUTPUT:
// an empty implementation class is valid and changes nothing`],
        [`<p>Related types:</p><ul><li><b>HandlerInterceptor:</b> servlet based, common.</li><li><b>AsyncHandlerInterceptor:</b> adds <code>afterConcurrentHandlingStarted</code>.</li><li><b>WebRequestInterceptor:</b> request abstraction, no way to stop the chain.</li><li><b>MappedInterceptor:</b> wraps an interceptor with path patterns (Boot beans of this type are picked up).</li></ul>`,
            r`@Bean
MappedInterceptor adminOnly(AdminInterceptor i) {
    return new MappedInterceptor(
        new String[] {"/admin/**"}, new String[] {"/admin/login"}, i);
}

// OUTPUT:
// AdminInterceptor applies to /admin/** except /admin/login`],
        [`<p>Mistakes:</p><ul><li>Changing response headers in <code>postHandle</code> for <code>@ResponseBody</code>: already committed.</li><li>Casting handler to <code>HandlerMethod</code> without checking.</li><li>Throwing from <code>afterCompletion</code>: it is logged and ignored.</li><li>Storing request data in fields: interceptors are singletons.</li></ul>`,
            r`// WRONG: shared field, not thread safe
class Bad implements HandlerInterceptor {
    private long start;
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        start = System.nanoTime();
        return true;
    }
}

// RIGHT: keep state on the request
// q.setAttribute("start", System.nanoTime());

// OUTPUT:
// concurrent requests no longer overwrite each other timing`],
        [`<p>Performance:</p><ul><li>Call overhead is tiny; the cost is what you do inside.</li><li>Check the handler type first and return fast for unrelated requests.</li><li>Cache reflection results (annotation lookups) in a map.</li></ul>`,
            r`private final Map<Method, Boolean> cache = new ConcurrentHashMap<>();

public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    if (!(h instanceof HandlerMethod hm)) return true;
    boolean secured = cache.computeIfAbsent(hm.getMethod(),
        m -> m.isAnnotationPresent(Secured.class));
    if (secured && q.getUserPrincipal() == null) {
        s.sendError(401);
        return false;
    }
    return true;
}

// OUTPUT:
// annotation lookup happens once per method, later calls hit the map`],
        [`<p>Scenario: a multi-tenant API reads <code>X-Tenant</code> and stores it for the request, then clears it.</p><ul><li>Set in <code>preHandle</code>.</li><li>Clear in <code>afterCompletion</code> to avoid leaking between pooled threads.</li></ul>`,
            r`public class TenantInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
            throws IOException {
        String t = q.getHeader("X-Tenant");
        if (t == null) { s.sendError(400, "tenant required"); return false; }
        TenantContext.set(t);
        return true;
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
            Object h, Exception ex) {
        TenantContext.clear();      // always runs after a successful preHandle
    }
}

// OUTPUT:
// no header -> 400; with header -> TenantContext set for the request only`]
    ),

    'mvc-prehandle': dv(
        [`<p>Where preHandle is called:</p><ul><li><code>DispatcherServlet.doDispatch</code> calls <code>mappedHandler.applyPreHandle(request, response)</code>.</li><li>The loop records <code>interceptorIndex</code> after each success.</li><li>On <code>false</code> it calls <code>triggerAfterCompletion</code> for the interceptors already passed and returns without calling the controller.</li><li>An exception goes the same way and then to the <code>HandlerExceptionResolver</code> chain.</li></ul>`,
            r`// simplified HandlerExecutionChain.applyPreHandle
boolean applyPreHandle(HttpServletRequest req, HttpServletResponse res)
        throws Exception {
    for (int i = 0; i < interceptors.size(); i++) {
        HandlerInterceptor in = interceptors.get(i);
        if (!in.preHandle(req, res, handler)) {
            triggerAfterCompletion(req, res, null);
            return false;
        }
        this.interceptorIndex = i;
    }
    return true;
}

// OUTPUT:
// false from interceptor k -> afterCompletion for 0..k-1, controller skipped`],
        [`<p>Common ways to end the request from preHandle:</p><ul><li><code>response.sendError(code)</code>: goes to the error page or JSON error handling.</li><li><code>response.setStatus(code)</code> and write the body.</li><li><code>response.sendRedirect(url)</code>: for example to a login page.</li><li>Throw an exception handled by <code>@ControllerAdvice</code>.</li><li>Forward with <code>request.getRequestDispatcher(...)</code>.</li></ul>`,
            r`public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    if (q.getSession(false) == null) {
        s.sendRedirect(q.getContextPath() + "/login");
        return false;
    }
    if (q.getHeader("X-Quota") != null && overQuota(q)) {
        s.setStatus(429);
        s.setContentType("application/json");
        s.getWriter().write("{\"error\":\"too many requests\"}");
        return false;
    }
    return true;
}

// OUTPUT:
// no session -> 302 /login;  over quota -> 429 with JSON body`],
        [`<p>Mistakes:</p><ul><li>Returning false with no response written: empty 200.</li><li>Forgetting <code>return true</code> on the normal path, so no endpoint ever works.</li><li>Doing database calls for every request without a cache.</li><li>Reading the body stream.</li><li>Using an interceptor for CORS preflight; the handling must come from the CORS support.</li></ul>`,
            r`// WRONG: stops the chain but writes nothing
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    return q.getHeader("X-Token") != null;
}

// RIGHT: explain the rejection
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    if (q.getHeader("X-Token") == null) {
        s.sendError(HttpServletResponse.SC_UNAUTHORIZED, "token required");
        return false;
    }
    return true;
}

// OUTPUT:
// WRONG -> 200 with empty body; RIGHT -> 401 token required`],
        [`<p>Performance:</p><ul><li>preHandle is on the hot path: no blocking calls without timeouts.</li><li>Use cheap checks first (header present) before expensive ones (token validation).</li><li>Cache validated tokens briefly.</li><li>Exclude static and health URLs with <code>excludePathPatterns</code>.</li></ul>`,
            r`private final Cache<String, Boolean> valid = Caffeine.newBuilder()
    .expireAfterWrite(Duration.ofMinutes(1)).maximumSize(10_000).build();

public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    String token = q.getHeader("X-Token");
    if (token == null || !valid.get(token, tokens::verify)) {
        s.sendError(401);
        return false;
    }
    return true;
}

// OUTPUT:
// the token service is called once per token per minute`],
        [`<p>Scenario: simple rate limiting per client IP, with a 429 response when exceeded.</p><ul><li>Counter per IP in a concurrent map.</li><li>Return false with <code>Retry-After</code>.</li><li>Test with repeated MockMvc calls.</li></ul>`,
            r`public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    int n = hits.computeIfAbsent(q.getRemoteAddr(), k -> new AtomicInteger())
        .incrementAndGet();
    if (n > 3) {
        s.setHeader("Retry-After", "60");
        s.sendError(429, "slow down");
        return false;
    }
    return true;
}

// OUTPUT:
// calls 1-3 -> 200; call 4 -> 429 with Retry-After: 60`]
    )
};
