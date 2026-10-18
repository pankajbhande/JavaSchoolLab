// Spring extras, batch smvc04 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc04Extras: Record<string, Extra> = {
    'mvc-mvc-configuration': x(
        ['<b>MVC configuration</b> means customizing Spring MVC (formatters, converters, interceptors, resource handlers, CORS, view controllers) by implementing <code>WebMvcConfigurer</code> in a <code>@Configuration</code> class.',
            '<b>@EnableWebMvc</b> turns on the MVC infrastructure in plain Spring; in Spring Boot it is already auto-configured, so you normally do not add it.',
            '<b>Callback methods</b> such as <code>addInterceptors</code>, <code>addViewControllers</code> and <code>addCorsMappings</code> are default methods: override only what you need.'],
        ['<b>Boot and @EnableWebMvc</b>: adding <code>@EnableWebMvc</code> in Boot switches off <code>WebMvcAutoConfiguration</code>, so static resources and JSON defaults can disappear.',
            '<b>DelegatingWebMvcConfiguration</b> collects every <code>WebMvcConfigurer</code> bean and calls each one, so you can split config over many classes.',
            '<b>Order matters</b>: interceptors run in registration order, and message converters are tried in list order.'],
        ['<b>Prefer WebMvcConfigurer</b> over extending <code>WebMvcConfigurationSupport</code>, which replaces the whole default setup.',
            '<b>Test slice</b>: <code>@WebMvcTest</code> loads <code>WebMvcConfigurer</code> beans, so config is verified without the full context.',
            '<b>Properties first</b>: many settings (<code>spring.mvc.*</code>, <code>spring.web.resources.*</code>) need no Java code at all.'],
        [['F', 'What is WebMvcConfigurer?', 'An interface with default callback methods used to customize Spring MVC configuration.'],
            ['F', 'What does @EnableWebMvc do?', 'It imports the MVC configuration that registers handler mappings, adapters and converters in a plain Spring app.'],
            ['M', 'Why is @EnableWebMvc discouraged in Spring Boot?', 'It disables WebMvcAutoConfiguration, so Boot defaults such as static resources and Jackson setup are lost.'],
            ['M', 'How do you add a CORS rule globally?', 'Override addCorsMappings in a WebMvcConfigurer and register path patterns with allowed origins and methods.'],
            ['S', 'Difference between extending WebMvcConfigurationSupport and implementing WebMvcConfigurer?', 'Extending the support class takes over the entire config; the interface only adds to the defaults.'],
            ['S', 'Can there be several WebMvcConfigurer beans?', 'Yes, DelegatingWebMvcConfiguration calls all of them, in bean order.']],
        [['Add a simple view controller (no controller class needed).',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/login").setViewName("login");
    }
}
// GET /login renders the view named "login"

// OUTPUT:
// GET /login -> 200, view "login" rendered`],
            ['Add global CORS.',
                r`@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins("https://app.example.com")
            .allowedMethods("GET", "POST");
}

// OUTPUT:
// OPTIONS /api/users with Origin: https://app.example.com
// -> 200, Access-Control-Allow-Origin: https://app.example.com`]],
        [['Test that the configuration is active.',
            r`@WebMvcTest
@Import(WebConfig.class)
class WebConfigTest {
    @Autowired MockMvc mvc;

    @Test
    void loginViewIsMapped() throws Exception {
        mvc.perform(get("/login")).andExpect(status().isOk())
           .andExpect(view().name("login"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Several configurers side by side.',
                r`@Configuration
class CorsConfig implements WebMvcConfigurer { /* CORS only */ }

@Configuration
class InterceptorConfig implements WebMvcConfigurer { /* interceptors only */ }

// OUTPUT:
// Both beans are applied; no class replaces the other.`]]
    ),
    'mvc-static-resource-configuration': x(
        ['<b>Static resources</b> are files such as CSS, JS and images served directly without a controller, mapped through a <code>ResourceHttpRequestHandler</code>.',
            '<b>Boot defaults</b> serve <code>/static</code>, <code>/public</code>, <code>/resources</code> and <code>/META-INF/resources</code> from the classpath at the root URL.',
            '<b>addResourceHandlers</b> in <code>WebMvcConfigurer</code> maps a URL pattern to one or more locations such as <code>classpath:/assets/</code>.'],
        ['<b>Cache headers</b>: use <code>setCacheControl</code> or <code>spring.web.resources.cache.*</code> so browsers keep files.',
            '<b>Versioned URLs</b>: a <code>VersionResourceResolver</code> adds a content hash so you can cache for a year and still deploy safely.',
            '<b>Welcome page</b>: an <code>index.html</code> in a static location is served at <code>/</code>.'],
        ['<b>Reverse proxy</b>: in production let nginx or a CDN serve static files, not the app server.',
            '<b>Path traversal</b>: the resource resolver rejects <code>..</code> sequences; never build your own file serving with raw user input.',
            '<b>Pattern clash</b>: <code>/**</code> as a static pattern can shadow controller mappings if misordered.'],
        [['F', 'Where does Spring Boot serve static files from?', 'From /static, /public, /resources and /META-INF/resources on the classpath.'],
            ['F', 'What class serves static files?', 'ResourceHttpRequestHandler, mapped through a SimpleUrlHandlerMapping.'],
            ['M', 'How do you serve files from an external folder?', 'Use addResourceHandler("/files/**").addResourceLocations("file:/opt/files/").'],
            ['M', 'How do you enable cache busting?', 'Register a VersionResourceResolver (content hash or fixed version) on the resource chain.'],
            ['S', 'Why can a static handler return 404 for a file that exists?', 'The URL pattern or location prefix is wrong, for example a missing trailing slash on the location.'],
            ['S', 'How is the resource chain organised?', 'Resolvers find the file (path, version, webjars) and transformers rewrite content, with caching optional.']],
        [['Serve an external folder.',
            r`@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/files/**")
            .addResourceLocations("file:/opt/uploads/")
            .setCacheControl(CacheControl.maxAge(Duration.ofDays(7)));
}

// OUTPUT:
// GET /files/logo.png -> 200, Cache-Control: max-age=604800`],
            ['Configure through properties only.',
                r`# application.properties
spring.web.resources.static-locations=classpath:/assets/
spring.mvc.static-path-pattern=/static/**
spring.web.resources.cache.period=3600

# OUTPUT:
# GET /static/app.css -> classpath:/assets/app.css`]],
        [['Cache busting with a version resolver.',
            r`registry.addResourceHandler("/js/**")
        .addResourceLocations("classpath:/static/js/")
        .resourceChain(true)
        .addResolver(new VersionResourceResolver()
                .addContentVersionStrategy("/**"));

// OUTPUT:
// /js/app-3f2a9c1.js resolves to app.js; URL changes when content changes`],
            ['Test a static file.',
                r`@SpringBootTest
@AutoConfigureMockMvc
class StaticTest {
    @Autowired MockMvc mvc;

    @Test
    void servesCss() throws Exception {
        mvc.perform(get("/app.css")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-message-converter-configuration': x(
        ['<b>HttpMessageConverter</b> reads the request body into an object and writes a return value into the response body (JSON, XML, text, bytes).',
            '<b>Selection</b> depends on the Java type and the <code>Content-Type</code> or <code>Accept</code> header; the first converter that supports both wins.',
            '<b>configureMessageConverters</b> replaces the defaults; <code>extendMessageConverters</code> keeps them and lets you add or reorder.'],
        ['<b>Jackson customization</b>: in Boot use <code>spring.jackson.*</code> properties or a <code>Jackson2ObjectMapperBuilderCustomizer</code> bean rather than a new converter.',
            '<b>Overriding is risky</b>: <code>configureMessageConverters</code> removes the defaults, so JSON may stop working unless you re-add it.',
            '<b>406 and 415</b>: no producing converter gives 406 Not Acceptable, no consuming converter gives 415 Unsupported Media Type.'],
        ['<b>Order</b>: put specific converters (for example a CSV one) before generic ones when types overlap.',
            '<b>Custom media type</b>: extend <code>AbstractHttpMessageConverter</code> and declare supported <code>MediaType</code> values.',
            '<b>Streaming</b>: large payloads should use <code>StreamingResponseBody</code> rather than build a full object in memory.'],
        [['F', 'What is an HttpMessageConverter?', 'A strategy that converts HTTP request and response bodies to and from Java objects.'],
            ['F', 'Which converter produces JSON in Boot?', 'MappingJackson2HttpMessageConverter, backed by Jackson ObjectMapper.'],
            ['M', 'configureMessageConverters vs extendMessageConverters?', 'The first replaces the default list; the second modifies the existing list.'],
            ['M', 'What causes HTTP 415?', 'No converter can read the request Content-Type into the target parameter type.'],
            ['S', 'How does Spring pick the converter for a response?', 'It negotiates the media type from Accept and producible types, then takes the first converter that canWrite it.'],
            ['S', 'How do you add a CSV output?', 'Write an AbstractHttpMessageConverter for text/csv and add it with extendMessageConverters.']],
        [['Add a custom converter.',
            r`@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    converters.add(0, new CsvConverter());
}

// OUTPUT:
// GET /users with Accept: text/csv -> CsvConverter writes the body`],
            ['Tune Jackson in Boot.',
                r`@Bean
Jackson2ObjectMapperBuilderCustomizer jackson() {
    return b -> b.simpleDateFormat("yyyy-MM-dd")
                 .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
}

// OUTPUT:
// {"name":"Abaji","joined":"2026-01-15"}`]],
        [['A minimal CSV converter.',
            r`public class CsvConverter extends AbstractHttpMessageConverter<User> {
    public CsvConverter() { super(new MediaType("text", "csv")); }
    protected boolean supports(Class<?> c) { return User.class == c; }
    protected User readInternal(Class<? extends User> c, HttpInputMessage m) {
        throw new UnsupportedOperationException();
    }
    protected void writeInternal(User u, HttpOutputMessage m) throws IOException {
        m.getBody().write((u.id() + "," + u.name()).getBytes());
    }
}

// OUTPUT:
// 1,Abaji`],
            ['Test content negotiation.',
                r`mvc.perform(get("/users/1").accept(MediaType.APPLICATION_JSON))
   .andExpect(content().contentType("application/json"));
mvc.perform(get("/users/1").accept("application/pdf"))
   .andExpect(status().isNotAcceptable());

// OUTPUT:
// 200 application/json
// 406 Not Acceptable`]]
    ),
    'mvc-formatter-configuration': x(
        ['<b>Formatter</b> converts between a String and an object for web binding (for example <code>"2026-01-15"</code> to <code>LocalDate</code>) with a <code>Locale</code>.',
            '<b>Converter vs Formatter</b>: a <code>Converter</code> maps one type to another; a <code>Formatter&lt;T&gt;</code> works only with String and is locale aware.',
            '<b>addFormatters</b> in <code>WebMvcConfigurer</code> registers formatters and converters on a <code>FormatterRegistry</code>.'],
        ['<b>Annotations</b>: <code>@DateTimeFormat</code> and <code>@NumberFormat</code> format a single field without any registry code.',
            '<b>Boot properties</b>: <code>spring.mvc.format.date</code> sets the default date pattern globally.',
            '<b>Where it applies</b>: request parameters, path variables, form fields and model attributes, not JSON bodies (Jackson does that).'],
        ['<b>Jackson separation</b>: JSON dates use Jackson config, so a Formatter will not change <code>@RequestBody</code> parsing.',
            '<b>Thread safety</b>: formatters are shared singletons, so never keep <code>SimpleDateFormat</code> in a field.',
            '<b>Errors</b>: a <code>ParseException</code> becomes a <code>typeMismatch</code> binding error, shown as 400 for a request parameter.'],
        [['F', 'What does a Formatter do?', 'It parses text to an object and prints an object as text, using a Locale.'],
            ['F', 'How do you format a date field quickly?', 'Annotate it with @DateTimeFormat(pattern = "yyyy-MM-dd").'],
            ['M', 'Converter or Formatter for String to Money?', 'A Formatter, because it is String based and locale aware.'],
            ['M', 'Does a Formatter affect JSON request bodies?', 'No, JSON binding uses Jackson, so configure the ObjectMapper.'],
            ['S', 'What registry holds formatters?', 'FormattingConversionService, exposed to you as FormatterRegistry.'],
            ['S', 'What happens on a failed parse?', 'A TypeMismatchException (binding error) occurs, usually giving HTTP 400.']],
        [['A custom Formatter.',
            r`public class MoneyFormatter implements Formatter<Money> {
    public Money parse(String text, Locale l) { return Money.of(text); }
    public String print(Money m, Locale l) { return m.amount() + " " + m.cur(); }
}

@Override
public void addFormatters(FormatterRegistry registry) {
    registry.addFormatter(new MoneyFormatter());
}

// OUTPUT:
// GET /pay?amt=100 INR -> controller receives Money(100, INR)`],
            ['Annotation-based formatting.',
                r`@GetMapping("/report")
String report(@RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate day) {
    return "Report for " + day;
}

// OUTPUT:
// GET /report?day=2026-01-15 -> Report for 2026-01-15`]],
        [['Global date pattern with properties.',
            r`# application.properties
spring.mvc.format.date=dd/MM/yyyy

# OUTPUT:
# ?d=15/01/2026 binds to LocalDate 2026-01-15`],
            ['Test the bad input.',
                r`mvc.perform(get("/report").param("day", "not-a-date"))
   .andExpect(status().isBadRequest());

// OUTPUT:
// 400 Bad Request (Failed to convert String to LocalDate)`]]
    ),
    'mvc-interceptor-configuration': x(
        ['<b>HandlerInterceptor</b> hooks into request handling with <code>preHandle</code>, <code>postHandle</code> and <code>afterCompletion</code>, around the controller call.',
            '<b>Registration</b> happens in <code>addInterceptors</code> of <code>WebMvcConfigurer</code>, with <code>addPathPatterns</code> and <code>excludePathPatterns</code>.',
            '<b>preHandle returns boolean</b>: <code>false</code> stops the chain, so you must write the response yourself.'],
        ['<b>Order</b>: <code>preHandle</code> runs in registration order; <code>postHandle</code> and <code>afterCompletion</code> run in reverse.',
            '<b>Interceptor vs Filter</b>: a filter is a servlet feature that runs before the DispatcherServlet; an interceptor is Spring MVC and knows the handler.',
            '<b>afterCompletion</b> always runs when <code>preHandle</code> returned true, even after an exception, so it suits cleanup and timing.'],
        ['<b>Async requests</b>: use <code>AsyncHandlerInterceptor</code>, because normal hooks are called twice in a different shape for async dispatch.',
            '<b>Not for the body</b>: reading the request body in an interceptor consumes the stream; use a wrapper filter instead.',
            '<b>Ordering across beans</b>: call <code>.order(n)</code> on the registration to control position explicitly.'],
        [['F', 'Name the three interceptor methods.', 'preHandle, postHandle and afterCompletion.'],
            ['F', 'How do you register an interceptor?', 'Override addInterceptors in WebMvcConfigurer and call registry.addInterceptor(...).'],
            ['M', 'What does preHandle returning false do?', 'It stops the chain; the controller is not called and you must produce the response.'],
            ['M', 'Interceptor or filter for authentication?', 'A filter (or Spring Security) for pre-servlet concerns; an interceptor when you need handler details.'],
            ['S', 'Does postHandle run if the controller throws?', 'No, but afterCompletion still runs with the exception.'],
            ['S', 'How do you apply an interceptor only to some URLs?', 'Use addPathPatterns and excludePathPatterns on the InterceptorRegistration.']],
        [['A timing interceptor.',
            r`public class TimingInterceptor implements HandlerInterceptor {
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

// OUTPUT:
// /api/users took 12 ms (varies)`],
            ['Register with patterns.',
                r`@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new TimingInterceptor())
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/health");
}

// OUTPUT:
// /api/users is timed; /api/health is skipped`]],
        [['Block requests without a header.',
            r`public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                         Object handler) throws IOException {
    if (req.getHeader("X-Api-Key") == null) {
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        return false;                      // controller not called
    }
    return true;
}

// OUTPUT:
// no header -> 401, with header -> controller runs`],
            ['Test the interceptor.',
                r`mvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
mvc.perform(get("/api/users").header("X-Api-Key", "k1"))
   .andExpect(status().isOk());

// OUTPUT:
// 401 then 200`]]
    ),
    'mvc-view-resolver-configuration': x(
        ['<b>ViewResolver</b> turns a logical view name returned by a controller (such as <code>"home"</code>) into a <code>View</code> that renders the response.',
            '<b>InternalResourceViewResolver</b> uses a prefix and suffix to find JSPs, for example <code>/WEB-INF/views/</code> and <code>.jsp</code>.',
            '<b>configureViewResolvers</b> in <code>WebMvcConfigurer</code> lets you register resolvers through a <code>ViewResolverRegistry</code>.'],
        ['<b>Boot properties</b>: <code>spring.mvc.view.prefix</code> and <code>spring.mvc.view.suffix</code> set the JSP resolver; Thymeleaf is auto-configured with <code>templates/</code>.',
            '<b>Chain</b>: <code>ContentNegotiatingViewResolver</code> asks each resolver and picks the best view for the requested media type.',
            '<b>Redirects</b>: names starting with <code>redirect:</code> or <code>forward:</code> are handled specially, without a resolver lookup.'],
        ['<b>Order</b>: set <code>setOrder</code> on each resolver; <code>InternalResourceViewResolver</code> accepts every name, so it must be last.',
            '<b>Caching</b>: resolvers cache resolved views by default; disable only in development.',
            '<b>REST apps</b>: <code>@RestController</code> skips view resolution, since the return value goes to a message converter.'],
        [['F', 'What does a ViewResolver do?', 'Maps a logical view name to a concrete View implementation.'],
            ['F', 'What are prefix and suffix?', 'Strings added around the view name to form the template or JSP path.'],
            ['M', 'Why must InternalResourceViewResolver be last?', 'It resolves any name, so resolvers after it would never be asked.'],
            ['M', 'How do you use Thymeleaf in Boot?', 'Add the starter; the default prefix is classpath:/templates/ and the suffix .html.'],
            ['S', 'What does ContentNegotiatingViewResolver do?', 'It delegates to other resolvers and chooses a view that matches the Accept header or format.'],
            ['S', 'Why would a view name give a 404 or a template error?', 'The prefix or suffix is wrong, the file is missing, or the resolver order is wrong.']],
        [['Configure resolvers in Java.',
            r`@Override
public void configureViewResolvers(ViewResolverRegistry registry) {
    registry.jsp("/WEB-INF/views/", ".jsp");
}

// OUTPUT:
// return "home" -> /WEB-INF/views/home.jsp`],
            ['Boot property version.',
                r`# application.properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp

# OUTPUT:
# "home" resolves to /WEB-INF/views/home.jsp`]],
        [['Two resolvers with order.',
            r`@Bean
ViewResolver csvResolver() {
    return (name, locale) -> name.endsWith("Csv") ? new CsvView() : null;
}
// returning null lets the next resolver try; InternalResourceViewResolver last

// OUTPUT:
// "usersCsv" -> CsvView; "home" -> JSP`],
            ['Test the view name.',
                r`mvc.perform(get("/home"))
   .andExpect(status().isOk())
   .andExpect(view().name("home"))
   .andExpect(model().attributeExists("user"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-controller-controllers': x(
        ['<b>@Controller</b> is a stereotype annotation (a <code>@Component</code>) that marks a class as a Spring MVC web controller found by component scanning.',
            '<b>Return value</b>: a <code>String</code> is a logical view name, and a <code>Model</code> carries data to the view.',
            '<b>Mapping</b> methods use <code>@GetMapping</code>, <code>@PostMapping</code> and similar, optionally under a class-level <code>@RequestMapping</code>.'],
        ['<b>Handler detection</b>: <code>RequestMappingHandlerMapping</code> scans beans that have <code>@Controller</code> or <code>@RequestMapping</code> and builds the mapping table.',
            '<b>@ResponseBody</b> on a method makes it write the return value through a message converter instead of resolving a view.',
            '<b>Arguments</b>: parameters like <code>Model</code>, <code>@RequestParam</code> and <code>BindingResult</code> are filled by argument resolvers.'],
        ['<b>Singleton</b>: a controller is one shared bean, so keep it stateless and inject services via the constructor.',
            '<b>Thin controllers</b>: put logic in services; controllers only translate HTTP to calls and back.',
            '<b>Slice test</b>: <code>@WebMvcTest(UserController.class)</code> with <code>@MockBean</code> services is fast.'],
        [['F', 'What is @Controller?', 'A stereotype that marks a class as a Spring MVC controller whose methods handle web requests.'],
            ['F', 'What does returning a String mean?', 'It is the logical view name that the ViewResolver turns into a page.'],
            ['M', '@Controller vs @Component?', '@Controller is a specialization that also lets RequestMappingHandlerMapping detect request handlers.'],
            ['M', 'How do you return JSON from a @Controller method?', 'Add @ResponseBody to the method or use @RestController.'],
            ['S', 'Why must controllers be stateless?', 'One instance serves all threads, so fields with request data cause race conditions.'],
            ['S', 'How does Spring find the method for a URL?', 'RequestMappingHandlerMapping matches path, method, headers and media types against registered mappings.']],
        [['A minimal MVC controller.',
            r`@Controller
@RequestMapping("/hello")
public class HelloController {
    @GetMapping
    public String hello(Model model) {
        model.addAttribute("msg", "Hello MVC");
        return "hello";                 // view name
    }
}

// OUTPUT:
// GET /hello -> renders hello view with msg = Hello MVC`],
            ['Mix view and body.',
                r`@Controller
public class MixController {
    @GetMapping("/page") String page() { return "page"; }
    @GetMapping("/ping") @ResponseBody String ping() { return "pong"; }
}

// OUTPUT:
// GET /page -> HTML view
// GET /ping -> pong (text body)`]],
        [['Slice test of a controller.',
            r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void helloView() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(view().name("hello"))
           .andExpect(model().attribute("msg", "Hello MVC"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Constructor injection.',
                r`@Controller
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @GetMapping("/users")
    String list(Model m) {
        m.addAttribute("users", service.all());
        return "users";
    }
}

// OUTPUT:
// GET /users -> view "users" with the list in the model`]]
    ),
    'mvc-restcontroller': x(
        ['<b>@RestController</b> is <code>@Controller</code> plus <code>@ResponseBody</code>: every method writes its return value to the response body, usually as JSON.',
            '<b>No view resolution</b>: return values go to <code>HttpMessageConverter</code> instances, not to a <code>ViewResolver</code>.',
            '<b>Typical return</b>: a POJO, a <code>List</code>, or <code>ResponseEntity&lt;T&gt;</code> when you need to set status and headers.'],
        ['<b>Status codes</b>: use <code>@ResponseStatus</code> or <code>ResponseEntity</code>, for example 201 Created with a <code>Location</code> header.',
            '<b>Request body</b>: <code>@RequestBody</code> parses JSON into an object, and <code>@Valid</code> triggers Bean Validation.',
            '<b>Error handling</b>: pair it with <code>@RestControllerAdvice</code> to return consistent JSON errors.'],
        ['<b>Content negotiation</b>: <code>produces</code> and <code>consumes</code> on the mapping restrict media types and drive 406 or 415.',
            '<b>Problem Details</b>: Spring 6 supports RFC 7807 through <code>ProblemDetail</code> for standard error bodies.',
            '<b>Never expose entities</b>: return DTOs to avoid lazy-loading problems and leaking fields.'],
        [['F', 'What is @RestController?', 'A combination of @Controller and @ResponseBody for building REST APIs.'],
            ['F', 'What is returned for a POJO?', 'It is serialized to JSON by Jackson through a message converter.'],
            ['M', 'When use ResponseEntity?', 'When you need control over status code, headers and body together.'],
            ['M', 'How do you validate a request body?', 'Annotate the parameter with @Valid and put constraints on the DTO; failures raise MethodArgumentNotValidException.'],
            ['S', 'How does @RestController differ internally from @Controller?', 'RequestResponseBodyMethodProcessor handles the return value, so no view name is resolved.'],
            ['S', 'How do you return 201 with a Location header?', 'Return ResponseEntity.created(uri).body(saved).']],
        [['A CRUD style endpoint.',
            r`@RestController
@RequestMapping("/api/users")
public class UserApi {
    @GetMapping("/{id}")
    public User get(@PathVariable long id) { return new User(id, "Abaji"); }

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody User u) {
        URI uri = URI.create("/api/users/" + u.id());
        return ResponseEntity.created(uri).body(u);
    }
}

// OUTPUT:
// GET /api/users/1 -> 200 {"id":1,"name":"Abaji"}
// POST /api/users  -> 201 Location: /api/users/1`],
            ['Restrict media types.',
                r`@PostMapping(value = "/import", consumes = "text/csv",
             produces = "application/json")
public Result importCsv(@RequestBody String csv) { return new Result(3); }

// OUTPUT:
// Content-Type: text/csv -> 200 {"rows":3}
// Content-Type: text/xml -> 415 Unsupported Media Type`]],
        [['Test with MockMvc and JSON.',
            r`@WebMvcTest(UserApi.class)
class UserApiTest {
    @Autowired MockMvc mvc;

    @Test
    void getUser() throws Exception {
        mvc.perform(get("/api/users/1"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Abaji"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Validation failure.',
                r`mvc.perform(post("/api/users")
        .contentType("application/json")
        .content("{\"id\":1,\"name\":\"\"}"))
   .andExpect(status().isBadRequest());

// OUTPUT:
// 400 Bad Request (name must not be blank)`]]
    ),
    'mvc-controller-lifecycle': x(
        ['<b>Controller lifecycle</b> has two parts: the bean is created once at startup as a singleton, and then each request is handled by the same instance on a different thread.',
            '<b>Request flow</b>: <code>DispatcherServlet</code> finds a handler, applies interceptors, resolves arguments, calls the method, then handles the return value.',
            '<b>Bean callbacks</b> such as <code>@PostConstruct</code> and <code>@PreDestroy</code> run once, not per request.'],
        ['<b>Order per request</b>: filters, then <code>DispatcherServlet</code>, <code>preHandle</code>, argument binding, controller method, return handling, <code>postHandle</code>, view render, <code>afterCompletion</code>.',
            '<b>Scope</b>: controllers are singletons by default; request-scoped data should come from method arguments or scoped beans.',
            '<b>Exceptions</b>: they go to <code>HandlerExceptionResolver</code> instances, including <code>@ExceptionHandler</code> methods.'],
        ['<b>Thread safety</b>: no mutable instance fields; use a <code>@RequestScope</code> bean or local variables.',
            '<b>Lazy init</b>: <code>spring.main.lazy-initialization=true</code> delays controller creation until first use, trading startup for first-request latency.',
            '<b>Proxying</b>: AOP proxies (for example <code>@Transactional</code> on a controller) require a non-final class and public methods.'],
        [['F', 'How many controller instances exist by default?', 'One singleton per controller class, shared by all requests.'],
            ['F', 'Which component receives every request?', 'DispatcherServlet, the front controller.'],
            ['M', 'Where do @PostConstruct methods run?', 'Once after the bean is created and its dependencies are injected.'],
            ['M', 'Where do interceptors fit in the flow?', 'preHandle runs before the controller, postHandle after it, afterCompletion after the view is rendered.'],
            ['S', 'What happens when the controller throws?', 'The exception is passed to HandlerExceptionResolvers; ExceptionHandlerExceptionResolver calls a matching @ExceptionHandler.'],
            ['S', 'How can you have a new controller per request?', 'Use request scope with a proxy, but it is rarely needed; prefer stateless design.']],
        [['Observe the lifecycle.',
            r`@Controller
public class LifeController {
    @PostConstruct void init() { System.out.println("created once"); }
    @PreDestroy void stop() { System.out.println("destroyed once"); }

    @GetMapping("/life")
    @ResponseBody String life() {
        return Thread.currentThread().getName();
    }
}

// OUTPUT:
// created once
// (each request) http-nio-8080-exec-1 (varies)
// destroyed once   (on shutdown)`],
            ['The bug of a shared field.',
                r`@Controller
public class BadController {
    private int counter;                     // shared by all requests!
    @GetMapping("/count") @ResponseBody
    String count() { return String.valueOf(++counter); }
}

// OUTPUT:
// Two users see 1, 2, 3 ... (shared state, not thread-safe)`]],
        [['Trace the order with an interceptor and advice.',
            r`// preHandle        -> true
// controller method -> called
// postHandle
// view render
// afterCompletion

// OUTPUT:
// preHandle
// controller
// postHandle
// afterCompletion`],
            ['Request-scoped state done right.',
                r`@Component
@RequestScope
class RequestInfo { String user; }

@Controller
class InfoController {
    private final RequestInfo info;          // proxy, new data per request
    InfoController(RequestInfo info) { this.info = info; }
}

// OUTPUT:
// each request sees its own RequestInfo instance`]]
    ),
    'mvc-controller-methods': x(
        ['<b>Controller methods</b> are handler methods mapped to requests with <code>@RequestMapping</code> or the shortcuts <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code>.',
            '<b>Parameters</b> are bound by annotations: <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code>, <code>@RequestHeader</code>, <code>@ModelAttribute</code>.',
            '<b>Return types</b> include <code>String</code> (view), POJO (body), <code>ResponseEntity</code>, <code>void</code> and <code>ModelAndView</code>.'],
        ['<b>Mapping attributes</b>: <code>value</code>, <code>method</code>, <code>params</code>, <code>headers</code>, <code>consumes</code> and <code>produces</code> narrow what a method accepts.',
            '<b>Special arguments</b>: <code>HttpServletRequest</code>, <code>Principal</code>, <code>Locale</code>, <code>Model</code>, <code>BindingResult</code> are injected by type.',
            '<b>BindingResult</b> must come right after the validated <code>@ModelAttribute</code> or <code>@Valid</code> argument.'],
        ['<b>Ambiguity</b>: two methods matching the same request cause <code>IllegalStateException: Ambiguous mapping</code> at startup.',
            '<b>Specificity</b>: when several patterns match, the most specific one wins (exact before <code>{var}</code> before <code>**</code>).',
            '<b>Idempotency</b>: use GET and PUT for safe or idempotent actions, POST for creation, to keep caches and retries correct.'],
        [['F', 'What do @GetMapping and @PostMapping do?', 'They map HTTP GET and POST requests to a method; they are shortcuts for @RequestMapping with a method.'],
            ['F', '@PathVariable vs @RequestParam?', 'PathVariable reads from the URL path (/users/5); RequestParam reads from the query string (?id=5).'],
            ['M', 'What are valid return types?', 'String view name, POJO with @ResponseBody, ResponseEntity, ModelAndView, void and others.'],
            ['M', 'Where must BindingResult be placed?', 'Immediately after the argument it validates, otherwise Spring throws an exception.'],
            ['S', 'What is an ambiguous mapping?', 'Two handler methods with identical mapping conditions, detected at startup.'],
            ['S', 'How does Spring bind method arguments?', 'HandlerMethodArgumentResolvers inspect each parameter annotation and type and supply the value.']],
        [['Different binding styles.',
            r`@RestController
@RequestMapping("/api/orders")
public class OrderApi {
    @GetMapping("/{id}")
    Order one(@PathVariable long id) { return new Order(id, 99.5); }

    @GetMapping
    List<Order> search(@RequestParam(defaultValue = "0") int page,
                       @RequestHeader("X-Tenant") String tenant) {
        return List.of(new Order(1, 10.0));
    }
}

// OUTPUT:
// GET /api/orders/7 -> {"id":7,"total":99.5}
// GET /api/orders?page=1 (X-Tenant: a) -> [{"id":1,"total":10.0}]`],
            ['Form binding with validation.',
                r`@PostMapping("/register")
String register(@Valid @ModelAttribute UserForm form, BindingResult result) {
    if (result.hasErrors()) return "register";   // redisplay the form
    return "redirect:/welcome";
}

// OUTPUT:
// invalid form -> view "register" with errors
// valid form   -> 302 redirect to /welcome`]],
        [['Narrow by media type.',
            r`@GetMapping(value = "/export", produces = "text/csv")
String csv() { return "id,name\n1,Abaji"; }

@GetMapping(value = "/export", produces = "application/json")
List<User> json() { return List.of(new User(1, "Abaji")); }

// OUTPUT:
// Accept: text/csv -> csv body
// Accept: application/json -> JSON list`],
            ['Test missing parameter.',
                r`mvc.perform(get("/api/orders/abc"))
   .andExpect(status().isBadRequest());     // type mismatch for long
mvc.perform(get("/api/orders").header("X-Tenant", "a"))
   .andExpect(status().isOk());

// OUTPUT:
// 400 then 200`]]
    )
};

export const smvc04Deep: Record<string, Deep> = {
    'mvc-mvc-configuration': dv(
        [`<p>How the configuration is assembled:</p><ul><li><b>Collection:</b> <code>DelegatingWebMvcConfiguration</code> autowires every <code>WebMvcConfigurer</code> bean.</li><li><b>Callbacks:</b> it calls each configurer for interceptors, converters, resource handlers, formatters and CORS.</li><li><b>Beans produced:</b> <code>RequestMappingHandlerMapping</code>, <code>RequestMappingHandlerAdapter</code>, <code>ContentNegotiationManager</code> and more.</li><li><b>Boot:</b> <code>WebMvcAutoConfiguration</code> backs off when a <code>WebMvcConfigurationSupport</code> bean exists.</li></ul>`,
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override public void addInterceptors(InterceptorRegistry r) { /* ... */ }
    @Override public void addFormatters(FormatterRegistry r) { /* ... */ }
}
// DelegatingWebMvcConfiguration calls both methods at startup

// OUTPUT:
// Mapped "{[/hello]}" onto HelloController#hello()  (startup log, varies)`],
        [`<p>Callbacks available on <code>WebMvcConfigurer</code>:</p><ul><li><code>addInterceptors</code>, <code>addResourceHandlers</code>, <code>addCorsMappings</code></li><li><code>addViewControllers</code>, <code>configureViewResolvers</code></li><li><code>configureMessageConverters</code>, <code>extendMessageConverters</code>, <code>addFormatters</code></li><li><code>configureContentNegotiation</code>, <code>configurePathMatch</code>, <code>addArgumentResolvers</code></li></ul>`,
            r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.defaultContentType(MediaType.APPLICATION_JSON);
}
@Override
public void addArgumentResolvers(List<HandlerMethodArgumentResolver> list) {
    list.add(new CurrentUserResolver());
}

// OUTPUT:
// Requests without Accept default to JSON`],
        [`<p>Typical mistakes:</p><ul><li><b>@EnableWebMvc in Boot:</b> loses auto-configuration; remove it.</li><li><b>configureMessageConverters:</b> wipes defaults; use <code>extend</code> instead.</li><li><b>Forgotten @Configuration:</b> the configurer is never picked up.</li></ul>`,
            r`// WRONG
@Configuration
@EnableWebMvc                       // Boot static resources stop working
public class BadConfig implements WebMvcConfigurer { }

// RIGHT
@Configuration
public class GoodConfig implements WebMvcConfigurer { }

// OUTPUT:
// WRONG: GET /index.html -> 404
// RIGHT: GET /index.html -> 200`],
        [`<p>Performance and tuning:</p><ul><li>Keep interceptors light and path-scoped.</li><li>Cache static resources and use content versioning.</li><li>Prefer one shared <code>ObjectMapper</code> bean over many converters.</li></ul>`,
            r`# application.properties
spring.web.resources.cache.cachecontrol.max-age=7d
spring.mvc.async.request-timeout=30s
server.compression.enabled=true

# OUTPUT:
# Static files cached 7 days;
responses gzip compressed`],
        [`<p>Scenario: a company API needs a tenant interceptor, CORS for the front end, and a custom date format. The team splits one configurer per concern so each can be tested alone with <code>@WebMvcTest</code>.</p>`,
            r`@Configuration
class TenantConfig implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry r) {
        r.addInterceptor(new TenantInterceptor()).addPathPatterns("/api/**");
    }
}
@Configuration
class CorsConfig implements WebMvcConfigurer {
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**").allowedOrigins("https://shop.example.com");
    }
}

// OUTPUT:
// /api/** requests carry tenant context and allow the shop origin`]
    ),
    'mvc-static-resource-configuration': dv(
        [`<p>Internal flow for a static file:</p><ul><li>A <code>SimpleUrlHandlerMapping</code> maps patterns like <code>/**</code> to a <code>ResourceHttpRequestHandler</code> (lowest priority).</li><li>The handler asks a <code>ResourceResolver</code> chain for the file (path, version, webjar).</li><li>Transformers may rewrite content, for example links in cached manifests.</li><li>It sets <code>Last-Modified</code>, <code>ETag</code> and cache headers and streams the file.</li></ul>`,
            r`// Boot registers handlers like these automatically
registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/static/", "classpath:/public/");

// OUTPUT:
// GET /app.css -> found in classpath:/static/app.css, 200`],
        [`<p>Variants:</p><ul><li><b>Properties:</b> <code>spring.web.resources.static-locations</code>, <code>spring.mvc.static-path-pattern</code>.</li><li><b>WebJars:</b> <code>/webjars/**</code> serves library files from jars.</li><li><b>Java config:</b> several locations, tried in order, plus cache control.</li></ul>`,
            r`registry.addResourceHandler("/webjars/**")
        .addResourceLocations("classpath:/META-INF/resources/webjars/");
registry.addResourceHandler("/docs/**")
        .addResourceLocations("file:/srv/docs/", "classpath:/docs/");

// OUTPUT:
// /docs/a.pdf checked in /srv/docs/ first, then the classpath`],
        [`<p>Common mistakes:</p><ul><li>Missing trailing slash in <code>addResourceLocations</code>.</li><li>Using <code>@EnableWebMvc</code> and losing the default handlers.</li><li>Secured apps forgetting to permit static paths.</li></ul>`,
            r`// WRONG: no trailing slash, file lookup fails
.addResourceLocations("file:/srv/docs")

// RIGHT
.addResourceLocations("file:/srv/docs/")

// OUTPUT:
// WRONG: 404 for /docs/a.pdf
// RIGHT: 200`],
        [`<p>Tuning:</p><ul><li>Use content hashes and long max-age.</li><li>Enable gzip or let a CDN do it.</li><li>Serve big files from a proxy or object store.</li></ul>`,
            r`spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
spring.web.resources.cache.cachecontrol.max-age=365d

# OUTPUT:
# app-9a8b7c.css served with Cache-Control: max-age=31536000`],
        [`<p>Scenario: a portal serves user uploads from a mounted volume under <code>/media/**</code> with a 1-day cache while the build output stays on the classpath.</p>`,
            r`registry.addResourceHandler("/media/**")
        .addResourceLocations("file:/mnt/uploads/")
        .setCacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic());

// OUTPUT:
// GET /media/photo.jpg -> 200, Cache-Control: max-age=86400, public`]
    ),
    'mvc-message-converter-configuration': dv(
        [`<p>How conversion runs:</p><ul><li><code>RequestResponseBodyMethodProcessor</code> reads <code>@RequestBody</code> and writes <code>@ResponseBody</code> values.</li><li>It loops over the converter list calling <code>canRead</code> or <code>canWrite</code> for the type and media type.</li><li>On write, the media type comes from the Accept header and the converters producible types.</li><li>No match raises <code>HttpMediaTypeNotSupportedException</code> (415) or <code>HttpMediaTypeNotAcceptableException</code> (406).</li></ul>`,
            r`// Simplified idea of the lookup
for (HttpMessageConverter<?> c : converters) {
    if (c.canWrite(valueType, selectedMediaType)) {
        c.write(value, selectedMediaType, outputMessage);
        return;
    }
}

// OUTPUT:
// First converter that supports type and media type writes the body`],
        [`<p>Default converters in a Boot web app:</p><ul><li><code>ByteArrayHttpMessageConverter</code>, <code>StringHttpMessageConverter</code></li><li><code>MappingJackson2HttpMessageConverter</code> (JSON) when Jackson is present</li><li>XML converters only if an XML library is on the classpath</li></ul>`,
            r`@Bean
HttpMessageConverters customConverters() {
    return new HttpMessageConverters(new CsvConverter());
}
// Boot adds the CSV converter to its defaults

// OUTPUT:
// Converter list: ... Jackson, CsvConverter`],
        [`<p>Mistakes:</p><ul><li>Replacing the list and losing JSON.</li><li>Wrong ordering, so a generic converter swallows the type.</li><li>Assuming a Formatter changes JSON handling.</li></ul>`,
            r`// WRONG: replaces defaults, JSON no longer works
public void configureMessageConverters(List<HttpMessageConverter<?>> l) {
    l.add(new CsvConverter());
}
// RIGHT
public void extendMessageConverters(List<HttpMessageConverter<?>> l) {
    l.add(new CsvConverter());
}

// OUTPUT:
// WRONG: 415/406 for JSON requests
// RIGHT: JSON and CSV both work`],
        [`<p>Tuning:</p><ul><li>Reuse a single <code>ObjectMapper</code>; it is thread safe and costly to create.</li><li>Disable unused features such as <code>FAIL_ON_UNKNOWN_PROPERTIES</code> only when needed.</li><li>Stream large results.</li></ul>`,
            r`spring.jackson.default-property-inclusion=non_null
spring.jackson.deserialization.fail-on-unknown-properties=false

# OUTPUT:
# Null fields omitted from JSON;
unknown fields ignored on input`],
        [`<p>Scenario: a reporting API returns JSON for the web app and CSV for finance users based on the Accept header.</p>`,
            r`@GetMapping(value = "/report", produces = {"application/json", "text/csv"})
List<Row> report() { return service.rows(); }

// OUTPUT:
// Accept: application/json -> [{"id":1}]
// Accept: text/csv         -> id\n1`]
    ),
    'mvc-formatter-configuration': dv(
        [`<p>Internals:</p><ul><li><code>FormattingConversionService</code> holds converters and formatters; Boot builds <code>WebConversionService</code>.</li><li><code>WebDataBinder</code> uses it to convert request strings into field types.</li><li>Formatter annotations (<code>@DateTimeFormat</code>) are handled by <code>AnnotationFormatterFactory</code> implementations.</li><li>A failed conversion becomes a <code>FieldError</code> with code <code>typeMismatch</code>.</li></ul>`,
            r`// Conversion done internally for each @RequestParam
Object value = conversionService.convert("2026-01-15",
        TypeDescriptor.valueOf(String.class),
        TypeDescriptor.valueOf(LocalDate.class));

// OUTPUT:
// 2026-01-15 (LocalDate)`],
        [`<p>Options:</p><ul><li><b>Per field:</b> <code>@DateTimeFormat</code>, <code>@NumberFormat</code>.</li><li><b>Global:</b> properties or <code>addFormatters</code>.</li><li><b>Converter:</b> <code>registry.addConverter(...)</code> for non-text mapping.</li></ul>`,
            r`@Override
public void addFormatters(FormatterRegistry registry) {
    registry.addConverter(String.class, Status.class, Status::valueOf);
    DateTimeFormatterRegistrar r = new DateTimeFormatterRegistrar();
    r.setDateFormatter(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
    r.registerFormatters(registry);
}

// OUTPUT:
// ?s=ACTIVE -> Status.ACTIVE ; ?d=15-01-2026 -> LocalDate`],
        [`<p>Mistakes:</p><ul><li>Expecting formatters to apply to JSON.</li><li>Keeping a non thread safe <code>SimpleDateFormat</code> in a field.</li><li>Locale ignored in tests.</li></ul>`,
            r`// WRONG: shared mutable SimpleDateFormat
private final SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");

// RIGHT: DateTimeFormatter is immutable and thread safe
private static final DateTimeFormatter F =
        DateTimeFormatter.ofPattern("yyyy-MM-dd");

// OUTPUT:
// WRONG: random wrong dates under load
// RIGHT: stable results`],
        [`<p>Tuning: formatters are cheap, but avoid heavy work in <code>parse</code>, and reuse patterns (static final).</p>`,
            r`// Cache the expensive parts once
private static final Pattern P = Pattern.compile("(\\d+)\\s*([A-Z]{3})");

// OUTPUT:
// Pattern compiled once, reused by every request`],
        [`<p>Scenario: an HR form accepts dates as dd/MM/yyyy and amounts like <code>1,234.50</code>; a global date pattern and a money formatter keep controllers free of parsing code.</p>`,
            r`@PostMapping("/salary")
String save(@RequestParam @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate from,
            @RequestParam @NumberFormat(pattern = "#,##0.00") BigDecimal amt) {
    return "ok";
}

// OUTPUT:
// from=15/01/2026&amt=1,234.50 -> LocalDate 2026-01-15, BigDecimal 1234.50`]
    ),
    'mvc-interceptor-configuration': dv(
        [`<p>How interceptors run:</p><ul><li><code>DispatcherServlet</code> gets a <code>HandlerExecutionChain</code> (handler plus interceptors) from the mapping.</li><li><code>applyPreHandle</code> calls each interceptor in order; a <code>false</code> triggers <code>afterCompletion</code> of those already run.</li><li>After the handler, <code>applyPostHandle</code> runs in reverse order.</li><li><code>triggerAfterCompletion</code> runs even on errors.</li></ul>`,
            r`// Order with interceptors A and B
// A.preHandle -> B.preHandle -> controller
// B.postHandle -> A.postHandle -> render view
// B.afterCompletion -> A.afterCompletion

// OUTPUT:
// A.pre B.pre controller B.post A.post B.after A.after`],
        [`<p>Variants:</p><ul><li><b>Path based:</b> <code>addPathPatterns</code> and <code>excludePathPatterns</code>.</li><li><b>WebRequestInterceptor:</b> servlet-independent version.</li><li><b>Handler aware:</b> cast handler to <code>HandlerMethod</code> to read annotations.</li></ul>`,
            r`public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                         Object handler) {
    if (handler instanceof HandlerMethod hm
            && hm.hasMethodAnnotation(AdminOnly.class)) {
        // check role here
    }
    return true;
}

// OUTPUT:
// Only methods marked @AdminOnly get the extra check`],
        [`<p>Mistakes:</p><ul><li>Returning <code>false</code> without writing a response gives an empty 200.</li><li>Storing request state in interceptor fields (singleton).</li><li>Expecting it to run for static resources or errors that bypass MVC.</li></ul>`,
            r`// WRONG: field shared by all threads
private long start;
public boolean preHandle(...) {
    start = System.nanoTime();
    return true;
}

// RIGHT: keep per-request state in a request attribute
public boolean preHandle(HttpServletRequest req, ...) {
    req.setAttribute("start", System.nanoTime());
    return true;
}

// OUTPUT:
// WRONG: timings mixed between users
// RIGHT: correct per request`],
        [`<p>Tuning: keep work per request small, avoid I/O in <code>preHandle</code> and narrow the path patterns so unrelated URLs skip it.</p>`,
            r`registry.addInterceptor(new AuditInterceptor())
        .addPathPatterns("/api/admin/**")
        .order(1);

// OUTPUT:
// Audit runs only for admin API calls`],
        [`<p>Scenario: a platform logs a correlation id, measures latency and rejects calls without an API key, using three small interceptors with explicit order.</p>`,
            r`registry.addInterceptor(new CorrelationIdInterceptor()).order(0);
registry.addInterceptor(new ApiKeyInterceptor()).order(1)
        .addPathPatterns("/api/**");
registry.addInterceptor(new TimingInterceptor()).order(2);

// OUTPUT:
// [cid=ab12] GET /api/users 200 took 8 ms (varies)`]
    ),
    'mvc-view-resolver-configuration': dv(
        [`<p>Resolution steps:</p><ul><li>The controller returns a name, so <code>DispatcherServlet.render</code> loops over its <code>viewResolvers</code>.</li><li>The first resolver returning a non null <code>View</code> wins.</li><li>The view renders the model (JSP forward, Thymeleaf template, JSON view).</li><li>Resolvers are ordered with <code>Ordered</code>; <code>InternalResourceViewResolver</code> has lowest priority.</li></ul>`,
            r`// Simplified lookup in DispatcherServlet
for (ViewResolver vr : this.viewResolvers) {
    View view = vr.resolveViewName(viewName, locale);
    if (view != null) return view;
}

// OUTPUT:
// "home" -> first resolver that returns a View`],
        [`<p>Variants:</p><ul><li><b>JSP:</b> prefix and suffix under WEB-INF.</li><li><b>Thymeleaf or FreeMarker:</b> starter plus properties.</li><li><b>BeanNameViewResolver:</b> view name equals a View bean name.</li></ul>`,
            r`@Bean
public ViewResolver beanNameResolver() {
    BeanNameViewResolver r = new BeanNameViewResolver();
    r.setOrder(0);
    return r;
}

// OUTPUT:
// return "reportPdf" -> uses the View bean named reportPdf`],
        [`<p>Mistakes:</p><ul><li>JSPs outside WEB-INF are reachable directly.</li><li>JSP in an executable jar does not work; use war or a template engine.</li><li>Returning a name from <code>@RestController</code> prints the text, not a page.</li></ul>`,
            r`// WRONG in @RestController: returns the plain text "home"
@RestController
class A {
    @GetMapping("/") String home() { return "home"; }
}

// RIGHT: use @Controller to render a view
@Controller
class B {
    @GetMapping("/") String home() { return "home"; }
}

// OUTPUT:
// WRONG: body is the text "home"
// RIGHT: renders home view`],
        [`<p>Tuning: keep view caching on in production (<code>spring.thymeleaf.cache=true</code>), and keep the resolver chain short.</p>`,
            r`spring.thymeleaf.cache=true
spring.mvc.view.prefix=/WEB-INF/views/

# OUTPUT:
# Templates parsed once and reused`],
        [`<p>Scenario: an app serves HTML pages through Thymeleaf and a PDF export through a bean view, selected by view name.</p>`,
            r`@GetMapping("/invoice/{id}")
String invoice(@PathVariable long id, Model m) {
    m.addAttribute("invoice", service.find(id));
    return "invoicePdf";          // a View bean
}

// OUTPUT:
// GET /invoice/5 -> PDF document`]
    ),
    'mvc-controller-controllers': dv(
        [`<p>How a controller is registered and called:</p><ul><li><b>Scan:</b> <code>@Controller</code> is meta-annotated with <code>@Component</code>, so scanning creates the bean.</li><li><b>Detect:</b> <code>RequestMappingHandlerMapping</code> checks each bean for <code>@Controller</code> or <code>@RequestMapping</code> and registers a <code>HandlerMethod</code> per mapping.</li><li><b>Invoke:</b> <code>RequestMappingHandlerAdapter</code> resolves arguments, invokes the method and processes the return value.</li></ul>`,
            r`// Startup log (varies)
// Mapped to com.app.HelloController#hello(Model)
// DispatcherServlet: Completed initialization in 8 ms

@Controller
public class HelloController {
    @GetMapping("/hello") String hello() { return "hello"; }
}

// OUTPUT:
// GET /hello -> view "hello"`],
        [`<p>Variants:</p><ul><li><code>@Controller</code> plus <code>@ResponseBody</code> equals <code>@RestController</code>.</li><li>Class-level <code>@RequestMapping</code> adds a shared prefix.</li><li>Return <code>ModelAndView</code> or <code>String</code> for views, or <code>void</code> with a response argument.</li></ul>`,
            r`@Controller
@RequestMapping("/shop")
class ShopController {
    @GetMapping("/items")
    ModelAndView items() {
        return new ModelAndView("items", "list", List.of("pen", "book"));
    }
}

// OUTPUT:
// GET /shop/items -> view "items" with list = [pen, book]`],
        [`<p>Mistakes:</p><ul><li>Mutable fields in the singleton.</li><li>Business logic in the controller.</li><li>Missing <code>@ResponseBody</code> so the returned text is treated as a view name.</li></ul>`,
            r`// WRONG: "ok" is looked up as a view, giving a template error
@Controller
class A {
    @GetMapping("/a") String a() { return "ok"; }
}

// RIGHT for plain text
@Controller
class B {
    @GetMapping("/b") @ResponseBody String b() { return "ok"; }
}

// OUTPUT:
// WRONG: 500 Template might not exist
// RIGHT: 200 ok`],
        [`<p>Tuning: keep handlers short, avoid blocking calls on request threads (or return <code>Callable</code> or <code>DeferredResult</code>), and keep the model small.</p>`,
            r`@GetMapping("/slow")
Callable<String> slow() {
    return () -> { Thread.sleep(500); return "done"; };   // runs off the request thread
}

// OUTPUT:
// GET /slow -> done after about 500 ms, container thread freed`],
        [`<p>Scenario: an admin portal has page controllers (HTML) and a few AJAX endpoints. Page methods return view names, while small JSON actions use <code>@ResponseBody</code>, all delegating to services.</p>`,
            r`@Controller
@RequestMapping("/admin/users")
class AdminUserController {
    private final UserService service;
    AdminUserController(UserService s) { this.service = s; }

    @GetMapping String page(Model m) {
        m.addAttribute("users", service.all());
        return "admin/users";
    }
    @PostMapping("/{id}/lock") @ResponseBody Map<String, String> lock(@PathVariable long id) {
        service.lock(id);
        return Map.of("status", "locked");
    }
}

// OUTPUT:
// GET /admin/users -> HTML table
// POST /admin/users/5/lock -> {"status":"locked"}`]
    ),
    'mvc-restcontroller': dv(
        [`<p>Internals:</p><ul><li><code>@RestController</code> is meta-annotated with <code>@Controller</code> and <code>@ResponseBody</code>.</li><li><code>RequestResponseBodyMethodProcessor</code> handles the return value and marks the request as handled, so no view is resolved.</li><li>For <code>ResponseEntity</code>, <code>HttpEntityMethodProcessor</code> writes status, headers and body.</li><li>Content negotiation chooses the converter.</li></ul>`,
            r`@RestController
class PingApi {
    @GetMapping("/ping")
    Map<String, String> ping() { return Map.of("status", "UP"); }
}

// OUTPUT:
// GET /ping -> 200 Content-Type: application/json
// {"status":"UP"}`],
        [`<p>Variants:</p><ul><li><b>ResponseEntity:</b> full control of the response.</li><li><b>@ResponseStatus:</b> fixed status.</li><li><b>ProblemDetail:</b> standard error body.</li><li><b>Streaming:</b> <code>StreamingResponseBody</code>, <code>SseEmitter</code>.</li></ul>`,
            r`@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
void delete(@PathVariable long id) { service.delete(id); }

@GetMapping("/{id}")
ResponseEntity<User> find(@PathVariable long id) {
    return service.find(id).map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

// OUTPUT:
// DELETE -> 204 ; GET missing -> 404`],
        [`<p>Mistakes:</p><ul><li>Returning JPA entities directly.</li><li>Using GET for changes.</li><li>No validation or no central error handler.</li></ul>`,
            r`// WRONG: entity with lazy collections may fail in Jackson
@GetMapping("/{id}") UserEntity get(@PathVariable long id) { ... }

// RIGHT: map to a DTO
@GetMapping("/{id}") UserDto get(@PathVariable long id) {
    return UserDto.from(service.find(id));
}

// OUTPUT:
// WRONG: LazyInitializationException / infinite recursion
// RIGHT: {"id":1,"name":"Abaji"}`],
        [`<p>Tuning:</p><ul><li>Use pagination (<code>Pageable</code>) for lists.</li><li>Add ETag or cache headers for read-heavy resources.</li><li>Enable compression and keep DTOs small.</li></ul>`,
            r`@GetMapping("/{id}")
ResponseEntity<UserDto> get(@PathVariable long id) {
    return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
            .body(service.dto(id));
}

// OUTPUT:
// 200 Cache-Control: max-age=300`],
        [`<p>Scenario: an order service exposes <code>/api/orders</code> with validation, 201 on create, and one <code>@RestControllerAdvice</code> mapping errors to <code>ProblemDetail</code>.</p>`,
            r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(OrderNotFound.class)
    ProblemDetail notFound(OrderNotFound e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }
}

// OUTPUT:
// GET /api/orders/99 -> 404
// {"type":"about:blank","title":"Not Found","status":404,"detail":"Order 99 not found"}`]
    ),
    'mvc-controller-lifecycle': dv(
        [`<p>Full request path:</p><ul><li><b>Startup:</b> bean created, dependencies injected, <code>@PostConstruct</code> runs, mappings registered.</li><li><b>Request:</b> servlet filters, then <code>DispatcherServlet.doDispatch</code>.</li><li><b>Dispatch:</b> <code>getHandler</code>, <code>preHandle</code>, adapter invokes the method, <code>postHandle</code>, render, <code>afterCompletion</code>.</li><li><b>Shutdown:</b> <code>@PreDestroy</code> runs once.</li></ul>`,
            r`// doDispatch outline (simplified)
HandlerExecutionChain chain = getHandler(request);
if (!chain.applyPreHandle(request, response)) return;
ModelAndView mv = adapter.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
render(mv, request, response);

// OUTPUT:
// pre -> handle -> post -> render -> afterCompletion`],
        [`<p>Lifecycle related options:</p><ul><li><b>Scope:</b> <code>@RequestScope</code>, <code>@SessionScope</code> beans injected as proxies.</li><li><b>Lazy:</b> <code>@Lazy</code> or global lazy init.</li><li><b>Callbacks:</b> <code>InitializingBean</code>, <code>@PostConstruct</code>, <code>DisposableBean</code>.</li></ul>`,
            r`@Controller
@Lazy
class ReportController {
    @PostConstruct void warm() { System.out.println("created on first request"); }
}

// OUTPUT:
// (first request to /report) created on first request`],
        [`<p>Mistakes:</p><ul><li>Instance fields holding user data.</li><li>Heavy work in constructors that delays startup.</li><li>Assuming one thread per controller; threads come from the container pool.</li></ul>`,
            r`// WRONG
private User currentUser;               // shared across requests

// RIGHT
@GetMapping("/me")
User me(Principal p) { return service.byName(p.getName()); }

// OUTPUT:
// WRONG: users see each other's data
// RIGHT: data is per request`],
        [`<p>Tuning:</p><ul><li>Keep construction cheap; avoid blocking work in <code>@PostConstruct</code>.</li><li>Size the Tomcat thread pool (<code>server.tomcat.threads.max</code>).</li><li>Use async return types for long calls.</li></ul>`,
            r`server.tomcat.threads.max=200
spring.main.lazy-initialization=false

# OUTPUT:
# Up to 200 requests handled in parallel by the one controller instance`],
        [`<p>Scenario: an intermittent bug where totals mix between users is traced to a controller field <code>private double total</code>. The fix moves it to a local variable and the test fires parallel requests.</p>`,
            r`@Test
void parallelCalls() throws Exception {
    ExecutorService ex = Executors.newFixedThreadPool(8);
    List<Future<String>> f = new ArrayList<>();
    for (int i = 0; i < 8; i++) {
        final int n = i;
        f.add(ex.submit(() -> mvc.perform(get("/total").param("n", "" + n))
                .andReturn().getResponse().getContentAsString()));
    }
    for (int i = 0; i < 8; i++) assertEquals("" + i, f.get(i).get());
}

// OUTPUT:
// Tests run: 1, Failures: 0 (each request sees its own total)`]
    ),
    'mvc-controller-methods': dv(
        [`<p>Method handling internals:</p><ul><li>Each mapping is a <code>RequestMappingInfo</code> (patterns, methods, params, headers, consumes, produces).</li><li><code>InvocableHandlerMethod</code> uses <code>HandlerMethodArgumentResolver</code> beans to get each argument.</li><li>The return value goes to a <code>HandlerMethodReturnValueHandler</code>.</li><li>Type conversion uses the <code>WebDataBinder</code> and conversion service.</li></ul>`,
            r`@GetMapping("/users/{id}")
User get(@PathVariable long id, @RequestParam(required = false) String lang) {
    return service.find(id);
}
// id: PathVariableMethodArgumentResolver; lang: RequestParamMethodArgumentResolver

// OUTPUT:
// GET /users/3?lang=en -> {"id":3,"name":"Raoji"}`],
        [`<p>Mapping options:</p><ul><li><code>method</code>, <code>params</code> (<code>"debug=true"</code>), <code>headers</code>.</li><li><code>consumes</code> and <code>produces</code>.</li><li>Patterns: <code>{id}</code>, <code>{id:[0-9]+}</code>, <code>*</code>, <code>**</code>.</li></ul>`,
            r`@GetMapping(value = "/files/{name:.+}", params = "download=true",
            produces = "application/octet-stream")
byte[] file(@PathVariable String name) { return store.read(name); }

@GetMapping("/items/{id:[0-9]+}")
Item item(@PathVariable long id) { return repo.get(id); }

// OUTPUT:
// /items/12 -> matches ; /items/abc -> 404`],
        [`<p>Mistakes:</p><ul><li>Same mapping twice (ambiguous).</li><li><code>@RequestParam</code> missing gives 400.</li><li>BindingResult after the wrong parameter.</li><li>Primitive parameter with absent optional value.</li></ul>`,
            r`// WRONG: BindingResult not directly after the form
String save(@Valid UserForm f, Model m, BindingResult r) { ... }

// RIGHT
String save(@Valid UserForm f, BindingResult r, Model m) { ... }

// OUTPUT:
// WRONG: 500 An Errors/BindingResult argument is expected
// RIGHT: errors collected in r`],
        [`<p>Tuning:</p><ul><li>Use specific mappings to avoid regex heavy matching.</li><li>Return DTOs and limit page size.</li><li>Use <code>Optional</code> or <code>defaultValue</code> instead of null checks.</li></ul>`,
            r`@GetMapping
Page<UserDto> list(@PageableDefault(size = 20, sort = "name") Pageable p) {
    return service.page(p);
}

// OUTPUT:
// GET /users?page=0 -> first 20 users sorted by name`],
        [`<p>Scenario: a search endpoint takes optional filters, paging and a tenant header, returning a DTO page; tests cover each parameter combination with MockMvc.</p>`,
            r`@GetMapping("/search")
Page<ItemDto> search(@RequestParam Optional<String> q,
                     @RequestParam(defaultValue = "0") int page,
                     @RequestHeader("X-Tenant") String tenant) {
    return service.search(tenant, q.orElse(""), page);
}

// OUTPUT:
// GET /search?q=pen&page=0 (X-Tenant: a) -> {"content":[...],"number":0}`]
    )
};
