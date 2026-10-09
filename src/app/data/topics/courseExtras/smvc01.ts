// Spring extras, batch smvc01 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc01Extras: Record<string, Extra> = {
    'introductiontospringmvc': x(
        ['<b>Spring MVC</b> is the web module of the Spring Framework; it maps HTTP requests to Java methods using a front controller called <code>DispatcherServlet</code>.',
            '<b>Controller</b> classes are marked with <code>@Controller</code> or <code>@RestController</code>, and methods with <code>@GetMapping</code>, <code>@PostMapping</code> and similar.',
            '<b>Return value</b> is either a view name (HTML page) or a body written as JSON (with <code>@ResponseBody</code>).'],
        ['<b>Binding</b>: <code>@RequestParam</code>, <code>@PathVariable</code>, <code>@RequestBody</code> and <code>@ModelAttribute</code> convert request data into Java arguments.',
            '<b>Validation</b>: add <code>@Valid</code> on an argument and put constraints such as <code>@NotBlank</code> on the fields; failures are reported in <code>BindingResult</code> or as an exception.',
            '<b>Error handling</b>: <code>@ControllerAdvice</code> with <code>@ExceptionHandler</code> gives one place for translating exceptions into responses.'],
        ['<b>Extension points</b>: <code>HandlerInterceptor</code>, <code>HandlerMethodArgumentResolver</code>, <code>HttpMessageConverter</code> and <code>WebMvcConfigurer</code> customize the pipeline without changing controllers.',
            '<b>Servlet stack</b>: Spring MVC is blocking and thread-per-request, unlike Spring WebFlux which is reactive.',
            '<b>Testing</b>: <code>@WebMvcTest</code> with <code>MockMvc</code> tests the web layer without starting a server.'],
        [['F', 'What is Spring MVC?', 'A web framework in Spring built on the Servlet API that follows the Model-View-Controller pattern.'],
            ['F', 'What does DispatcherServlet do?', 'It is the front controller: it receives every request and delegates to handlers, then renders the response.'],
            ['M', 'Difference between @Controller and @RestController?', '@RestController is @Controller plus @ResponseBody, so return values are written to the body instead of resolved as view names.'],
            ['M', 'How is a request body turned into an object?', 'An HttpMessageConverter such as the Jackson converter reads the body when the parameter has @RequestBody.'],
            ['S', 'Where can you hook in before and after a controller?', 'In a HandlerInterceptor (preHandle, postHandle, afterCompletion); servlet filters run even earlier.'],
            ['S', 'Spring MVC or WebFlux?', 'MVC for blocking, JDBC-based applications; WebFlux for non-blocking streaming with many concurrent connections.']],
        [['Smallest controller.',
            r`@RestController
class HelloController {
    @GetMapping("/hello")
    String hello(@RequestParam(defaultValue = "world") String name) {
        return "Hello, " + name;
    }
}
// curl "localhost:8080/hello?name=Asha"

// OUTPUT:
// HTTP/1.1 200
// Hello, Asha`],
            ['Path variable and status code.',
                r`@RestController
class UserController {
    @GetMapping("/users/{id}")
    ResponseEntity<String> find(@PathVariable long id) {
        if (id > 100) return ResponseEntity.notFound().build();
        return ResponseEntity.ok("user-" + id);
    }
}

// OUTPUT:
// GET /users/7   -> 200 user-7
// GET /users/500 -> 404`]],
        [['MockMvc test.',
            r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void greets() throws Exception {
        mvc.perform(get("/hello").param("name", "Asha"))
           .andExpect(status().isOk())
           .andExpect(content().string("Hello, Asha"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['View-returning controller.',
                r`@Controller
class PageController {
    @GetMapping("/welcome")
    String welcome(Model model) {
        model.addAttribute("title", "Welcome");
        return "welcome";          // resolved to templates/welcome.html
    }
}

// OUTPUT:
// GET /welcome -> 200 text/html rendered from welcome.html with title=Welcome`]]
    ),

    'mvc-mvc-architecture': x(
        ['<b>MVC</b> splits an application into three parts: the <b>Model</b> (data and rules), the <b>View</b> (what the user sees) and the <b>Controller</b> (handles input and connects the two).',
            '<b>Why</b>: separation of concerns lets several people work on UI and logic at once, and each part can be tested alone.',
            '<b>Flow</b>: the user sends a request, the controller calls the model, then picks a view that shows the model data.'],
        ['<b>Layers</b>: in a Spring app the model side is usually split into service and repository layers below the controller.',
            '<b>Thin controller</b>: keep business rules out of controllers; they only translate HTTP to method calls and back.',
            '<b>Variants</b>: server-side MVC renders HTML; in a REST API the JSON body plays the role of the view.'],
        ['<b>Front controller</b>: MVC on the web adds one entry point (<code>DispatcherServlet</code>) so common work such as mapping and error handling lives in one place.',
            '<b>Anemic model</b>: a model of only getters and setters pushes all logic into services; consider richer domain objects.',
            '<b>Coupling</b>: the view must not call repositories, and the model must not know about HTTP classes.'],
        [['F', 'What do M, V and C stand for?', 'Model, View and Controller.'],
            ['F', 'Which part handles user input?', 'The controller.'],
            ['M', 'Why keep logic out of the controller?', 'It keeps the controller small and lets business rules be tested and reused without HTTP.'],
            ['M', 'Does the model know about the view?', 'No. The view reads the model, but the model has no dependency on the view.'],
            ['S', 'How does MVC apply to a REST API?', 'The controller maps requests, the model is the domain and DTOs, and the serialized JSON is the view.'],
            ['S', 'What is the front controller pattern?', 'One servlet receives all requests and dispatches to handlers, as DispatcherServlet does.']],
        [['Three roles in code.',
            r`record Book(long id, String title) {}                 // model

@Service
class BookService {                                    // model side
    Book find(long id) { return new Book(id, "Clean Code"); }
}

@Controller
class BookController {                                 // controller
    private final BookService service;
    BookController(BookService s) { this.service = s; }

    @GetMapping("/books/{id}")
    String show(@PathVariable long id, Model model) {
        model.addAttribute("book", service.find(id));
        return "book";                                 // view name
    }
}

// OUTPUT:
// GET /books/1 -> view "book" with model {book=Book[id=1, title=Clean Code]}`],
            ['Tracing the three parts.',
                r`// 1. Browser:    GET /books/1
// 2. Controller: BookController.show(1)
// 3. Model:      BookService.find(1) returns Book
// 4. View:       book.html renders the title
System.out.println("controller -> model -> view");

// OUTPUT:
// controller -> model -> view`]],
        [['Layer test without HTTP.',
            r`class BookServiceTest {
    @Test
    void findsBook() {
        Book b = new BookService().find(5);
        assertEquals("Clean Code", b.title());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (no web server or MockMvc needed)`],
            ['Controller test with mocked model.',
                r`@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;
    @MockBean BookService service;

    @Test
    void showsBook() throws Exception {
        when(service.find(1)).thenReturn(new Book(1, "Clean Code"));
        mvc.perform(get("/books/1"))
           .andExpect(view().name("book"))
           .andExpect(model().attributeExists("book"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-model': x(
        ['<b>Model</b> is the data (and rules) the application works with, such as a <code>Book</code> object, plus the data handed to the view.',
            '<b>Model interface</b>: in Spring, <code>Model</code> is a map-like holder; <code>model.addAttribute("key", value)</code> makes data available to the view.',
            '<b>ModelAndView</b> bundles the model and the view name into one return value.'],
        ['<b>@ModelAttribute</b> on a method adds data to every request of that controller; on a parameter it binds form fields to an object.',
            '<b>Scope</b>: model attributes live for one request; use <code>HttpSession</code> or <code>@SessionAttributes</code> to keep them longer.',
            '<b>DTO versus entity</b>: pass a DTO to the view instead of a JPA entity to avoid lazy-loading errors and leaking fields.'],
        ['<b>Implementation</b>: the model is a <code>BindingAwareModelMap</code> inside a <code>ModelAndViewContainer</code> for the request.',
            '<b>Redirects</b>: <code>RedirectAttributes</code> and flash attributes survive one redirect (Post-Redirect-Get).',
            '<b>Domain model</b>: the word also means the business objects; keep them free of web types.'],
        [['F', 'What is the Model in Spring MVC?', 'The data passed from the controller to the view for rendering.'],
            ['F', 'How do you add data to the model?', 'Call model.addAttribute(name, value) on a Model parameter.'],
            ['M', 'What does @ModelAttribute do?', 'On a parameter it binds request data to an object; on a method it adds an attribute before each handler runs.'],
            ['M', 'How long does a model attribute live?', 'For the current request only, unless stored in the session or as a flash attribute.'],
            ['S', 'Why not put a JPA entity in the model?', 'Lazy associations may fail after the session closes and extra fields can leak to the page; use a DTO.'],
            ['S', 'What are flash attributes for?', 'They carry data across one redirect, which supports the Post-Redirect-Get pattern.']],
        [['Model parameter.',
            r`@Controller
class GreetController {
    @GetMapping("/greet")
    String greet(Model model) {
        model.addAttribute("name", "Asha");
        model.addAttribute("count", 3);
        return "greet";
    }
}

// OUTPUT:
// view "greet" receives name=Asha, count=3`],
            ['ModelAndView.',
                r`@GetMapping("/report")
ModelAndView report() {
    ModelAndView mav = new ModelAndView("report");
    mav.addObject("rows", List.of("a", "b"));
    return mav;
}

// OUTPUT:
// view "report" receives rows=[a, b]`]],
        [['Binding a form to a model object.',
            r`record Signup(String name, int age) {}

@PostMapping("/signup")
String signup(@ModelAttribute Signup form, Model model) {
    model.addAttribute("msg", "Welcome " + form.name());
    return "done";
}
// curl -d "name=Asha&age=30" localhost:8080/signup

// OUTPUT:
// view "done" with msg=Welcome Asha`],
            ['Testing model content.',
                r`mvc.perform(get("/greet"))
   .andExpect(status().isOk())
   .andExpect(model().attribute("name", "Asha"))
   .andExpect(view().name("greet"));

// OUTPUT:
// Test passes: model holds name=Asha and view is greet`]]
    ),

    'mvc-view': x(
        ['<b>View</b> is the part that renders the response for the user, such as an HTML page built from a template and the model data.',
            '<b>View name</b>: a controller returns a plain string like <code>"home"</code>; a <code>ViewResolver</code> turns it into a real template.',
            '<b>Technologies</b>: Thymeleaf, FreeMarker, Mustache and JSP; Spring Boot auto-configures the common ones.'],
        ['<b>Location</b>: Thymeleaf templates live in <code>src/main/resources/templates</code> and static files in <code>static</code>.',
            '<b>No logic</b>: a view should only display data; avoid database calls and heavy rules in templates.',
            '<b>JSON views</b>: with <code>@ResponseBody</code> there is no template, and a message converter writes the data.'],
        ['<b>Resolution</b>: <code>DispatcherServlet</code> asks each <code>ViewResolver</code> in order; the first non-null <code>View</code> renders the model.',
            '<b>Escaping</b>: Thymeleaf <code>th:text</code> escapes HTML, while <code>th:utext</code> does not and risks XSS.',
            '<b>Redirect views</b>: the prefixes <code>redirect:</code> and <code>forward:</code> create special views.'],
        [['F', 'What is a View?', 'The component that presents model data to the user, usually as HTML.'],
            ['F', 'What does a controller return for a page?', 'A logical view name string such as "home".'],
            ['M', 'What does a ViewResolver do?', 'It maps a logical view name to an actual View implementation.'],
            ['M', 'Where do Thymeleaf templates go in Spring Boot?', 'In src/main/resources/templates.'],
            ['S', 'Why use th:text rather than th:utext?', 'th:text escapes HTML and prevents cross-site scripting; th:utext outputs raw markup.'],
            ['S', 'How does redirect: work?', 'The view name prefix makes Spring return an HTTP 302 with a Location header, so the browser makes a new request.']],
        [['Controller and template.',
            r`@Controller
class HomeController {
    @GetMapping("/")
    String home(Model model) {
        model.addAttribute("user", "Asha");
        return "home";
    }
}
// templates/home.html:
// <h1 th:text="Hello">Hello</h1>

// OUTPUT:
// GET / -> 200 text/html (home.html rendered)`],
            ['Redirect after POST.',
                r`@PostMapping("/orders")
String create(Order o) {
    // save the order ...
    return "redirect:/orders/42";
}

// OUTPUT:
// HTTP/1.1 302
// Location: /orders/42`]],
        [['Properties for views.',
            r`# application.properties
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html

# OUTPUT:
# templates reload on every request in development`],
            ['Testing the view name and content.',
                r`mvc.perform(get("/"))
   .andExpect(status().isOk())
   .andExpect(view().name("home"))
   .andExpect(content().string(containsString("Hello")));

// OUTPUT:
// Test passes`]]
    ),

    'mvc-controller': x(
        ['<b>Controller</b> is a class that receives web requests, calls the business layer and chooses what to return.',
            '<b>Stereotype</b>: <code>@Controller</code> is detected by component scanning; <code>@RestController</code> adds <code>@ResponseBody</code> for APIs.',
            '<b>Mapping</b>: <code>@RequestMapping</code> at class level sets a prefix, and <code>@GetMapping</code> or <code>@PostMapping</code> on methods set the path and verb.'],
        ['<b>Arguments</b>: methods can take <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestBody</code>, <code>Model</code>, <code>HttpSession</code> and <code>Principal</code>.',
            '<b>Return types</b>: <code>String</code> view name, <code>ResponseEntity</code>, a plain object, <code>void</code> or <code>ModelAndView</code>.',
            '<b>Status codes</b>: set with <code>ResponseEntity</code> or <code>@ResponseStatus</code>.'],
        ['<b>Handler lookup</b>: <code>RequestMappingHandlerMapping</code> builds a registry of mappings at startup and <code>RequestMappingHandlerAdapter</code> invokes the chosen method.',
            '<b>Singleton</b>: a controller is one shared bean, so never keep per-request state in fields.',
            '<b>Thin design</b>: validate, call a service, map the result; transactions belong in the service layer.'],
        [['F', 'What is a controller?', 'A class that handles incoming HTTP requests and returns a response or view.'],
            ['F', 'Which annotation marks a REST controller?', '@RestController.'],
            ['M', 'Is a controller thread-safe by default?', 'Only if it holds no mutable state; it is a singleton used by many threads.'],
            ['M', 'How do you return a 201 Created?', 'Return ResponseEntity.created(uri).body(x) or use @ResponseStatus(HttpStatus.CREATED).'],
            ['S', 'Which classes resolve the method and call it?', 'RequestMappingHandlerMapping finds it and RequestMappingHandlerAdapter invokes it.'],
            ['S', 'Where should transactions start?', 'In the service layer, not the controller.']],
        [['CRUD style controller.',
            r`@RestController
@RequestMapping("/api/items")
class ItemController {
    private final Map<Long, String> db = new ConcurrentHashMap<>();

    @PostMapping
    ResponseEntity<String> add(@RequestBody String name) {
        long id = db.size() + 1L;
        db.put(id, name);
        return ResponseEntity.created(URI.create("/api/items/" + id)).body(name);
    }

    @GetMapping("/{id}")
    String get(@PathVariable long id) { return db.get(id); }
}

// OUTPUT:
// POST /api/items "pen" -> 201 Location: /api/items/1
// GET  /api/items/1     -> 200 pen`],
            ['Status annotation.',
                r`@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
void remove(@PathVariable long id) {
    db.remove(id);
}

// OUTPUT:
// DELETE /api/items/1 -> 204 (empty body)`]],
        [['Slice test of a controller.',
            r`@WebMvcTest(ItemController.class)
class ItemControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void createReturns201() throws Exception {
        mvc.perform(post("/api/items").content("pen")
                .contentType("text/plain"))
           .andExpect(status().isCreated())
           .andExpect(header().string("Location", "/api/items/1"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Bug: state in a singleton.',
                r`@Controller
class CounterController {
    private int hits;                  // BAD: shared by all threads
    @GetMapping("/hit") @ResponseBody
    int hit() { return ++hits; }       // use AtomicInteger or a service
}

// OUTPUT: (varies)
// concurrent requests can lose updates; fix with AtomicInteger`]]
    ),

    'mvc-spring-mvc-architecture-flow': x(
        ['<b>Request flow</b>: the client sends a request, <code>DispatcherServlet</code> finds a handler, the controller runs, and a view or body is returned.',
            '<b>HandlerMapping</b> chooses the controller method for the URL and HTTP verb.',
            '<b>ViewResolver</b> turns a view name into a view; for REST the converter writes the body instead.'],
        ['<b>Order</b>: filters, then DispatcherServlet, then interceptor <code>preHandle</code>, then argument resolvers, controller, return value handler, then <code>postHandle</code> and <code>afterCompletion</code>.',
            '<b>HandlerAdapter</b> knows how to call the handler and prepare arguments.',
            '<b>Exceptions</b> thrown by the handler go to <code>HandlerExceptionResolver</code> beans such as <code>@ExceptionHandler</code> methods.'],
        ['<b>Core method</b>: <code>DispatcherServlet.doDispatch</code> runs the whole cycle; reading it is the best way to learn the flow.',
            '<b>Content negotiation</b>: the Accept header and message converters decide JSON versus XML.',
            '<b>Async</b>: returning <code>Callable</code> or <code>DeferredResult</code> frees the container thread while work continues.'],
        [['F', 'Who receives every request in Spring MVC?', 'The DispatcherServlet.'],
            ['F', 'What does HandlerMapping do?', 'It finds the handler (controller method) for the request.'],
            ['M', 'What is the role of HandlerAdapter?', 'It invokes the handler, hiding the different handler types from the DispatcherServlet.'],
            ['M', 'When does an interceptor run compared to a filter?', 'Filters run before the DispatcherServlet; interceptors run inside it around the handler.'],
            ['S', 'How is an exception handled?', 'doDispatch passes it to HandlerExceptionResolvers, which can render an error response.'],
            ['S', 'How is JSON chosen?', 'Content negotiation picks a HttpMessageConverter from the Accept header and return type.']],
        [['Observing the order.',
            r`@Component
class LogInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse p, Object h) {
        System.out.println("1 preHandle " + q.getRequestURI());
        return true;
    }
    public void postHandle(HttpServletRequest q, HttpServletResponse p,
                           Object h, ModelAndView mv) {
        System.out.println("3 postHandle");
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse p,
                                Object h, Exception ex) {
        System.out.println("4 afterCompletion");
    }
}
// controller prints "2 handler"

// OUTPUT:
// 1 preHandle /hello
// 2 handler
// 3 postHandle
// 4 afterCompletion`],
            ['Registering the interceptor.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Autowired LogInterceptor log;
    @Override
    public void addInterceptors(InterceptorRegistry reg) {
        reg.addInterceptor(log).addPathPatterns("/**");
    }
}

// OUTPUT:
// interceptor applies to every mapped request`]],
        [['Enable request mapping debug logs.',
            r`# application.properties
logging.level.org.springframework.web.servlet.DispatcherServlet=DEBUG
logging.level.org.springframework.web=TRACE

# OUTPUT:
# GET "/hello", parameters={}
# Mapped to HelloController#hello(String)
# Completed 200 OK`],
            ['Testing the full flow.',
                r`mvc.perform(get("/hello"))
   .andExpect(handler().handlerType(HelloController.class))
   .andExpect(handler().methodName("hello"));

// OUTPUT:
// Test passes: request was mapped to HelloController.hello`]]
    ),

    'mvc-spring-mvc-vs-spring-boot': x(
        ['<b>Spring MVC</b> is a web framework (controllers, views, mapping); <b>Spring Boot</b> is a tool that auto-configures and runs Spring applications.',
            '<b>Not rivals</b>: a Boot web application uses Spring MVC inside, through <code>spring-boot-starter-web</code>.',
            '<b>Boot adds</b> auto-configuration, an embedded server, starter dependencies and Actuator.'],
        ['<b>Plain MVC setup</b>: you declare <code>DispatcherServlet</code>, a view resolver and a WAR for an external Tomcat; Boot does all that for you.',
            '<b>Entry point</b>: Boot uses <code>@SpringBootApplication</code> and a <code>main</code> method.',
            '<b>Overrides</b>: you can still define your own beans or implement <code>WebMvcConfigurer</code> to adjust MVC under Boot.'],
        ['<b>Auto-config</b>: <code>WebMvcAutoConfiguration</code> registers resolvers, converters, static resources and the DispatcherServlet when classes are on the classpath.',
            '<b>Conditional beans</b>: auto-configuration backs off when you define your own bean of the same kind.',
            '<b>Full control</b>: <code>@EnableWebMvc</code> turns off Boot MVC defaults, which is rarely wanted.'],
        [['F', 'Is Spring Boot a replacement for Spring MVC?', 'No. Boot configures and launches an application, and Spring MVC still handles web requests.'],
            ['F', 'What gives an embedded server in Boot?', 'spring-boot-starter-web includes embedded Tomcat.'],
            ['M', 'What did you configure manually in plain Spring MVC?', 'DispatcherServlet, component scan, view resolver and message converters, plus a WAR deployment.'],
            ['M', 'What class auto-configures MVC in Boot?', 'WebMvcAutoConfiguration.'],
            ['S', 'What does @EnableWebMvc do under Boot?', 'It disables the Boot MVC auto-configuration so you must configure everything yourself.'],
            ['S', 'How do you customize MVC in Boot but keep defaults?', 'Implement WebMvcConfigurer without @EnableWebMvc.']],
        [['Plain Spring MVC config (Java).',
            r`@Configuration
@EnableWebMvc
@ComponentScan("com.example.web")
class MvcConfig implements WebMvcConfigurer {
    @Bean
    ViewResolver viewResolver() {
        var vr = new InternalResourceViewResolver();
        vr.setPrefix("/WEB-INF/views/");
        vr.setSuffix(".jsp");
        return vr;
    }
}
// plus a WebApplicationInitializer registering DispatcherServlet

// OUTPUT:
// WAR deployed to an external Tomcat serves /WEB-INF/views/*.jsp`],
            ['Spring Boot version.',
                r`@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

// OUTPUT:
// Tomcat started on port 8080 (http)
// Started App in 2.1 seconds (varies)`]],
        [['Inspecting what Boot configured.',
            r`# application.properties
debug=true

# OUTPUT:
# Positive matches:
#   DispatcherServletAutoConfiguration matched
#   WebMvcAutoConfiguration matched
#   ServletWebServerFactoryAutoConfiguration matched`],
            ['Testing with Boot.',
                r`@SpringBootTest(webEnvironment = RANDOM_PORT)
class AppTest {
    @Autowired TestRestTemplate rest;

    @Test
    void hello() {
        assertEquals("Hello, world", rest.getForObject("/hello", String.class));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-spring-mvc-vs-spring-framework': x(
        ['<b>Spring Framework</b> is the whole platform: core container (IoC, DI), AOP, data access, transactions, testing and web.',
            '<b>Spring MVC</b> is one module of it (<code>spring-webmvc</code>) that handles servlet-based web requests.',
            '<b>Relationship</b>: MVC is built on the core container, so controllers are ordinary Spring beans with injection.'],
        ['<b>Other modules</b>: <code>spring-jdbc</code>, <code>spring-tx</code>, <code>spring-orm</code>, <code>spring-aop</code> and <code>spring-webflux</code>.',
            '<b>Use without web</b>: you can use the container and transactions in a console or batch program with no MVC at all.',
            '<b>Web choice</b>: the framework offers two web stacks, blocking Spring MVC and reactive WebFlux.'],
        ['<b>Contexts</b>: a root application context holds services and repositories; a child web context holds controllers and MVC beans (Boot merges them into one).',
            '<b>Jars</b>: <code>spring-webmvc</code> depends on <code>spring-web</code>, <code>spring-context</code> and <code>spring-core</code>.',
            '<b>Boundary</b>: MVC knows the Servlet API; the core container does not.'],
        [['F', 'Is Spring MVC the same as Spring Framework?', 'No. MVC is the web module inside the larger Spring Framework.'],
            ['F', 'Name two other Spring Framework modules.', 'For example spring-jdbc and spring-aop (also spring-tx, spring-test).'],
            ['M', 'Can you use Spring without MVC?', 'Yes, the core container, AOP and data access work in any Java application.'],
            ['M', 'What is spring-webmvc?', 'The jar that contains DispatcherServlet and the annotation-based MVC support.'],
            ['S', 'What is the root and servlet context in classic MVC?', 'Root context holds shared beans like services; the servlet context holds web beans and sees root beans but not the reverse.'],
            ['S', 'MVC or WebFlux inside the framework?', 'Both are web modules; MVC is servlet and blocking, WebFlux is reactive and non-blocking.']],
        [['Spring Framework without MVC.',
            r`public class Main {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            GreetingService s = ctx.getBean(GreetingService.class);
            System.out.println(s.greet("Asha"));
        }
    }
}

// OUTPUT:
// Hello, Asha`],
            ['MVC adds the web layer.',
                r`@Controller
class GreetingController {
    private final GreetingService service;
    GreetingController(GreetingService s) { this.service = s; }

    @GetMapping("/greet") @ResponseBody
    String greet() { return service.greet("Asha"); }
}

// OUTPUT:
// GET /greet -> Hello, Asha  (service injected by the core container)`]],
        [['Maven dependencies.',
            r`<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-webmvc</artifactId>
  <version>6.1.x</version>
</dependency>

<!-- OUTPUT: pulls spring-web, spring-context, spring-core transitively -->`],
            ['Unit test without MVC.',
                r`class GreetingServiceTest {
    @Test
    void greets() {
        assertEquals("Hello, Asha", new GreetingService().greet("Asha"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (plain JUnit, no Spring context)`]]
    ),

    'mvc-advantages-of-spring-mvc': x(
        ['<b>Separation of concerns</b>: controller, model and view are separate, so code is easier to understand and maintain.',
            '<b>Annotation-driven</b>: <code>@GetMapping</code>, <code>@RequestParam</code> and <code>@Valid</code> remove much boilerplate compared with raw servlets.',
            '<b>Flexible views</b>: works with Thymeleaf, JSP, FreeMarker or JSON REST output.'],
        ['<b>Testability</b>: controllers are plain classes, so <code>MockMvc</code> tests them without a server.',
            '<b>Integration</b>: works with Spring Security, Data JPA, transactions and validation out of the box.',
            '<b>Extensible</b>: interceptors, converters and argument resolvers can be swapped or added.'],
        ['<b>Trade-offs</b>: the servlet model is thread-per-request, so very high concurrency with slow calls needs more threads or WebFlux.',
            '<b>Learning curve</b>: many abstractions (adapters, resolvers) make debugging harder at first; use DEBUG logging.',
            '<b>Maturity</b>: wide community, documentation and long-term support.'],
        [['F', 'Name two advantages of Spring MVC.', 'Clear separation of concerns and annotation-based, low-boilerplate development.'],
            ['F', 'Can it produce JSON?', 'Yes, with @RestController and Jackson message converters.'],
            ['M', 'Why is it easy to test?', 'Controllers are plain beans and MockMvc simulates requests without a running server.'],
            ['M', 'How does it help with form handling?', 'Data binding and validation convert and check form fields automatically.'],
            ['S', 'What is a drawback of Spring MVC?', 'Blocking thread-per-request model; for huge numbers of idle connections WebFlux fits better.'],
            ['S', 'How do you swap the JSON library?', 'Register another HttpMessageConverter, for example for Gson, instead of the Jackson one.']],
        [['Less boilerplate than a servlet.',
            r`// Raw servlet
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest q, HttpServletResponse p)
            throws IOException {
        String n = q.getParameter("name");
        p.getWriter().write("Hello, " + (n == null ? "world" : n));
    }
}

// Spring MVC
@GetMapping("/hello")
String hello(@RequestParam(defaultValue = "world") String name) {
    return "Hello, " + name;
}

// OUTPUT:
// both return "Hello, world"; the MVC version has no parsing or writing code`],
            ['Built-in validation.',
                r`record Signup(@NotBlank String name, @Min(18) int age) {}

@PostMapping("/signup")
ResponseEntity<String> signup(@Valid @RequestBody Signup s) {
    return ResponseEntity.ok("ok");
}

// OUTPUT:
// {"name":"","age":10} -> 400 Bad Request (validation failed)`]],
        [['Fast web-layer test.',
            r`@WebMvcTest(HelloController.class)
class HelloTest {
    @Autowired MockMvc mvc;

    @Test
    void ok() throws Exception {
        mvc.perform(get("/hello")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1 (no server started, only web beans loaded)`],
            ['Global error handling.',
                r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<String> bad(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

// OUTPUT:
// any controller throwing IllegalArgumentException -> 400 with the message`]]
    ),

    'mvc-request-response-lifecycle': x(
        ['<b>Lifecycle</b> is the path of one HTTP request from arrival at the server to the response sent back to the client.',
            '<b>Main steps</b>: filter chain, <code>DispatcherServlet</code>, handler mapping, controller, view or message converter, response.',
            '<b>Request scope</b>: request-scoped beans and model attributes are created and discarded within this lifecycle.'],
        ['<b>Binding</b>: before the method runs, arguments are built from path, query, headers and body; after it, the return value is processed.',
            '<b>Interceptor hooks</b>: <code>preHandle</code> can stop the request, <code>postHandle</code> sees the model, <code>afterCompletion</code> always runs for cleanup.',
            '<b>Status and headers</b>: set in the controller or via <code>ResponseEntity</code>; once the response is committed they cannot change.'],
        ['<b>Argument and return handling</b>: <code>HandlerMethodArgumentResolver</code> and <code>HandlerMethodReturnValueHandler</code> do the conversion work.',
            '<b>Exceptions</b>: a thrown exception skips <code>postHandle</code> but still triggers <code>afterCompletion</code>.',
            '<b>Thread</b>: the whole cycle runs on one container thread unless you return async types.'],
        [['F', 'What is the request-response lifecycle?', 'The sequence of steps from receiving a request to sending the response.'],
            ['F', 'Which component starts the Spring part of the cycle?', 'DispatcherServlet.'],
            ['M', 'Which interceptor method always runs?', 'afterCompletion, even when the handler throws.'],
            ['M', 'What happens to the return value of a @RestController method?', 'A HttpMessageConverter writes it into the response body.'],
            ['S', 'Why can you not change headers late?', 'After the response is committed the status and headers are already sent.'],
            ['S', 'How do async requests change the cycle?', 'The container thread is released while the work runs, and the request is dispatched again with the result.']],
        [['Following one request.',
            r`@RestController
class DemoController {
    @GetMapping("/demo/{id}")
    Map<String, Object> demo(@PathVariable int id,
                             @RequestHeader("User-Agent") String ua) {
        return Map.of("id", id, "agent", ua);
    }
}
// curl -H "User-Agent: curl" localhost:8080/demo/5

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json
// {"id":5,"agent":"curl"}`],
            ['A filter before Spring.',
                r`@Component
class TimingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse p,
                                    FilterChain chain)
            throws ServletException, IOException {
        long t = System.nanoTime();
        chain.doFilter(q, p);
        System.out.println(q.getRequestURI() + " took "
            + (System.nanoTime() - t) / 1_000_000 + " ms");
    }
}

// OUTPUT: (varies)
// /demo/5 took 3 ms`]],
        [['Exception path.',
            r`@GetMapping("/boom")
String boom() { throw new IllegalStateException("bad"); }

@ExceptionHandler(IllegalStateException.class)
ResponseEntity<String> handle(IllegalStateException e) {
    return ResponseEntity.status(500).body("handled: " + e.getMessage());
}

// OUTPUT:
// GET /boom -> 500 handled: bad  (afterCompletion still runs)`],
            ['Testing the response.',
                r`mvc.perform(get("/demo/5").header("User-Agent", "curl"))
   .andExpect(status().isOk())
   .andExpect(content().contentType("application/json"))
   .andExpect(jsonPath("$.id").value(5));

// OUTPUT:
// Test passes`]]
    )
};

export const smvc01Deep: Record<string, Deep> = {
    'introductiontospringmvc': dv(
        [`<p>Spring MVC is built around one servlet.</p><ul><li><b>Startup:</b> <code>RequestMappingHandlerMapping</code> scans all beans for <code>@RequestMapping</code> methods and stores them in a registry.</li><li><b>Per request:</b> <code>doDispatch</code> gets the handler chain, picks a <code>HandlerAdapter</code>, runs interceptors, then invokes the method.</li><li><b>Arguments:</b> resolvers read path, query, headers and body into parameters.</li><li><b>Result:</b> a return value handler writes the body or the model and view are rendered.</li></ul>`,
            r`// Simplified view of DispatcherServlet.doDispatch
HandlerExecutionChain chain = getHandler(request);          // mapping lookup
HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
if (!chain.applyPreHandle(request, response)) return;       // interceptors
ModelAndView mv = ha.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
render(mv, request, response);                              // view or nothing

// OUTPUT:
// one pass per request; mapping registry was built at startup`],
        [`<p>Mapping options:</p><ul><li><b>Verb shortcuts:</b> <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code>, <code>@PatchMapping</code>.</li><li><b>Narrowing:</b> <code>params</code>, <code>headers</code>, <code>consumes</code> and <code>produces</code>.</li><li><b>Patterns:</b> <code>/files/{name:.+}</code> with a regex and <code>/**</code> wildcards.</li><li><b>Return types:</b> <code>String</code>, <code>ResponseEntity</code>, <code>ModelAndView</code>, <code>void</code>, <code>Callable</code>.</li></ul>`,
            r`@RestController
@RequestMapping("/api")
class DemoApi {
    @GetMapping(value = "/report", produces = "application/json")
    List<String> json() { return List.of("a"); }

    @GetMapping(value = "/report", produces = "text/csv")
    String csv() { return "a"; }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    String upload(@RequestPart MultipartFile file) { return file.getName(); }
}

// OUTPUT:
// GET /api/report Accept: application/json -> ["a"]
// GET /api/report Accept: text/csv         -> a`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong stereotype:</b> <code>@Controller</code> returning a string for an API gives a missing-template error; use <code>@RestController</code>.</li><li><b>Missing component scan:</b> a controller outside the main package is not found, so the URL returns 404.</li><li><b>Entity in JSON:</b> a bidirectional JPA entity causes infinite recursion; return DTOs.</li><li><b>Ambiguous mapping:</b> two methods with the same path and verb fail at startup.</li><li><b>Missing @RequestBody:</b> the JSON arrives but the object stays empty.</li></ul>`,
            r`// WRONG: returns the string as a view name
@Controller
class Bad {
    @GetMapping("/api/ping")
    String ping() { return "pong"; }
}
// RIGHT
@RestController
class Good {
    @GetMapping("/api/ping")
    String ping() { return "pong"; }
}

// OUTPUT:
// Bad:  500 Error resolving template [pong]
// Good: 200 pong`],
        [`<p>Tuning a Spring MVC application:</p><ul><li><b>Thread pool:</b> set <code>server.tomcat.threads.max</code> to the expected concurrency.</li><li><b>Compression:</b> <code>server.compression.enabled=true</code> for large JSON.</li><li><b>Caching:</b> ETag and <code>Cache-Control</code> for static resources.</li><li><b>Async:</b> return <code>Callable</code> for long work so threads are freed.</li><li><b>Template cache:</b> keep it on in production.</li></ul>`,
            r`# application.properties
server.tomcat.threads.max=200
server.compression.enabled=true
server.compression.min-response-size=1024
spring.thymeleaf.cache=true
spring.web.resources.cache.cachecontrol.max-age=7d

# OUTPUT:
# responses over 1 KB are gzipped; static files are cached for 7 days`],
        [`<p>A typical request in a production shop application:</p><ul><li>A filter adds a trace id and Spring Security authenticates the user.</li><li>The controller validates the JSON, calls a service and returns a DTO.</li><li>A <code>@RestControllerAdvice</code> turns failures into a uniform error body.</li></ul>`,
            r`@RestController
@RequestMapping("/api/orders")
class OrderApi {
    private final OrderService service;
    OrderApi(OrderService s) { this.service = s; }

    @PostMapping
    ResponseEntity<OrderDto> place(@Valid @RequestBody PlaceOrder cmd,
                                   Principal user) {
        OrderDto dto = service.place(user.getName(), cmd);
        return ResponseEntity.created(URI.create("/api/orders/" + dto.id()))
                             .body(dto);
    }
}

// OUTPUT:
// POST /api/orders {"sku":"A1","qty":2}
// HTTP/1.1 201  Location: /api/orders/1001
// {"id":1001,"status":"NEW"}`]
    ),

    'mvc-mvc-architecture': dv(
        [`<p>MVC is a pattern; Spring implements it with specific classes.</p><ul><li><b>Model:</b> <code>Model</code> map plus domain objects from services.</li><li><b>View:</b> a <code>View</code> implementation such as <code>ThymeleafView</code>.</li><li><b>Controller:</b> a handler method found by <code>HandlerMapping</code>.</li><li><b>Front controller:</b> <code>DispatcherServlet</code> coordinates all three.</li></ul>`,
            r`// The three roles meet in ModelAndView
ModelAndView mv = new ModelAndView();
mv.setViewName("book");                       // View (by name)
mv.addObject("book", new Book(1, "Clean Code")); // Model
// the DispatcherServlet gives mv to a ViewResolver, then calls view.render(model)

// OUTPUT:
// view "book" is rendered with model {book=Book[id=1, title=Clean Code]}`],
        [`<p>Variants of MVC on the web:</p><ul><li><b>Server-side MVC:</b> controller returns a view name and HTML is rendered on the server.</li><li><b>REST MVC:</b> controller returns data and the view is JSON.</li><li><b>MVP and MVVM:</b> related patterns where a presenter or view-model replaces the controller, common in front-end frameworks.</li><li><b>Layered architecture:</b> controller, service, repository on top of MVC.</li></ul>`,
            r`// Layered structure of a typical Boot MVC app
// com.example.shop
//   web/        OrderController      (controller)
//   service/    OrderService         (model: business rules)
//   repo/       OrderRepository      (model: persistence)
//   domain/     Order                (model: data)
//   resources/templates/orders.html  (view)
System.out.println("controller -> service -> repository");

// OUTPUT:
// controller -> service -> repository`],
        [`<p>Typical architecture mistakes:</p><ul><li><b>Fat controller:</b> business rules in the controller; move them to a service.</li><li><b>Logic in the view:</b> long conditionals and queries in templates.</li><li><b>Repository in the controller:</b> skips the transaction boundary.</li><li><b>Model knows HTTP:</b> services taking <code>HttpServletRequest</code> cannot be reused or tested easily.</li></ul>`,
            r`// WRONG: business rule in the controller
@PostMapping("/pay")
String pay(@RequestParam double amount) {
    if (amount > 10_000) { /* risk rules, db calls ... */ }
    return "ok";
}
// RIGHT: controller delegates
@PostMapping("/pay")
String pay(@RequestParam double amount) {
    paymentService.pay(amount);       // rules and transaction live here
    return "ok";
}

// OUTPUT:
// the service can be unit tested without any web classes`],
        [`<p>Architecture affects speed through the layer boundaries:</p><ul><li><b>Open Session in View:</b> keeping the JPA session open during rendering causes lazy queries in the view; disable it with <code>spring.jpa.open-in-view=false</code>.</li><li><b>DTO projections:</b> load only the fields the view shows.</li><li><b>Fragments and caching:</b> cache expensive view fragments.</li></ul>`,
            r`# application.properties
spring.jpa.open-in-view=false

# OUTPUT:
# no lazy loading from templates; the service must fetch what the view needs
# (a LazyInitializationException shows a missing fetch)`],
        [`<p>A catalogue site: a request for <code>/books</code> goes to the controller, which asks the service for a page of books, adds them to the model and returns the view. The same service is reused by a REST controller for the mobile app.</p>`,
            r`@Controller
class CatalogController {
    private final BookService books;
    CatalogController(BookService b) { this.books = b; }

    @GetMapping("/books")
    String list(@RequestParam(defaultValue = "0") int page, Model model) {
        model.addAttribute("page", books.page(page, 20));
        return "books";
    }
}

@RestController
class CatalogApi {
    private final BookService books;
    CatalogApi(BookService b) { this.books = b; }
    @GetMapping("/api/books")
    List<BookDto> list() { return books.page(0, 20).getContent(); }
}

// OUTPUT:
// /books     -> HTML page of 20 books
// /api/books -> JSON array of 20 books (same service)`]
    ),

    'mvc-model': dv(
        [`<p>How the model is carried through a request.</p><ul><li>Before the handler runs, <code>ModelFactory</code> invokes <code>@ModelAttribute</code> methods and fills a <code>ModelAndViewContainer</code>.</li><li>The <code>Model</code> argument is a <code>BindingAwareModelMap</code>, which also holds <code>BindingResult</code> entries.</li><li>After the handler, the container is turned into a <code>ModelAndView</code> and given to the view.</li><li>For redirects, the model values become query parameters unless you use flash attributes.</li></ul>`,
            r`@ControllerAdvice
class CommonModel {
    @ModelAttribute("appName")
    String appName() { return "Shop"; }      // added to every model
}

@GetMapping("/x")
String x(Model model) {
    System.out.println(model.asMap().keySet());
    return "x";
}

// OUTPUT:
// [appName]`],
        [`<p>Ways to put data in the model:</p><ul><li><b>Model:</b> <code>addAttribute(name, value)</code>.</li><li><b>ModelMap and Map:</b> same effect.</li><li><b>ModelAndView:</b> <code>addObject</code>.</li><li><b>@ModelAttribute method:</b> shared data such as dropdown lists.</li><li><b>@SessionAttributes:</b> keep named attributes in the session across requests.</li><li><b>RedirectAttributes:</b> <code>addFlashAttribute</code> for one redirect.</li></ul>`,
            r`@Controller
@SessionAttributes("cart")
class CartController {
    @ModelAttribute("cart")
    Cart newCart() { return new Cart(); }

    @PostMapping("/cart/add")
    String add(@ModelAttribute("cart") Cart cart, @RequestParam String sku,
               RedirectAttributes ra) {
        cart.add(sku);
        ra.addFlashAttribute("msg", sku + " added");
        return "redirect:/cart";
    }
}

// OUTPUT:
// POST /cart/add sku=A1 -> 302 /cart ; next page shows msg "A1 added" once`],
        [`<p>Mistakes with the model:</p><ul><li><b>Expecting model data after redirect:</b> it is gone; use flash attributes.</li><li><b>BindingResult placement:</b> it must come directly after the validated argument.</li><li><b>Mass assignment:</b> binding a form straight to an entity lets users set fields like <code>role</code>; use a form object or <code>@InitBinder</code> allowed fields.</li><li><b>Session bloat:</b> large objects in <code>@SessionAttributes</code>.</li></ul>`,
            r`// WRONG: BindingResult not right after the model attribute
@PostMapping("/a")
String bad(@Valid Signup s, Model m, BindingResult r) { return "a"; }

// RIGHT
@PostMapping("/a")
String good(@Valid Signup s, BindingResult r, Model m) {
    if (r.hasErrors()) return "a";
    return "redirect:/ok";
}

// OUTPUT:
// bad:  IllegalStateException: An Errors/BindingResult argument is expected
//       to be declared immediately after the model attribute
// good: errors shown on the form`],
        [`<p>Performance points for the model:</p><ul><li>Put only the data the page needs; large lists cost memory and rendering time.</li><li>Use paging (<code>Page</code>) instead of loading all rows.</li><li>Prefer DTO projections over full entities.</li><li>Do not keep big graphs in the session on clustered servers.</li></ul>`,
            r`@GetMapping("/orders")
String orders(Pageable pageable, Model model) {
    Page<OrderRow> page = repo.findRows(pageable);   // projection, 20 rows
    model.addAttribute("page", page);
    return "orders";
}

// OUTPUT:
// GET /orders?page=0&size=20 -> 20 rows instead of the whole table`],
        [`<p>Registration form: show a blank form (GET), validate on POST, redisplay with errors or redirect with a success message (Post-Redirect-Get).</p>`,
            r`@Controller
class RegisterController {
    @GetMapping("/register")
    String form(Model model) {
        model.addAttribute("form", new RegisterForm());
        return "register";
    }

    @PostMapping("/register")
    String submit(@Valid @ModelAttribute("form") RegisterForm form,
                  BindingResult result, RedirectAttributes ra) {
        if (result.hasErrors()) return "register";
        ra.addFlashAttribute("msg", "Welcome " + form.getName());
        return "redirect:/home";
    }
}

// OUTPUT:
// invalid: 200 register page with field errors
// valid:   302 /home, then page shows "Welcome Asha" once`]
    ),

    'mvc-view': dv(
        [`<p>How a view name becomes HTML.</p><ul><li><code>DispatcherServlet.render</code> calls <code>resolveViewName</code> on each <code>ViewResolver</code> in order.</li><li>Boot registers <code>ContentNegotiatingViewResolver</code>, <code>BeanNameViewResolver</code>, <code>ThymeleafViewResolver</code> and others.</li><li>The resolved <code>View</code> receives the model map and writes to the response.</li><li>For <code>@ResponseBody</code> no view is used at all.</li></ul>`,
            r`// Custom view resolver ordering
@Bean
ViewResolver csvResolver() {
    return (viewName, locale) ->
        viewName.endsWith("Csv") ? new CsvView() : null;   // null = try next
}

// OUTPUT:
// "reportCsv" -> CsvView ; other names fall through to Thymeleaf`],
        [`<p>View technologies and prefixes:</p><ul><li><b>Thymeleaf:</b> natural HTML templates, default choice in Boot.</li><li><b>FreeMarker and Mustache:</b> alternatives.</li><li><b>JSP:</b> needs a WAR and is poorly supported with embedded jar packaging.</li><li><b>redirect: and forward:</b> special prefixes in view names.</li><li><b>Fragments:</b> a view name like <code>orders :: table</code> returns only a fragment.</li></ul>`,
            r`@GetMapping("/orders/table")
String table(Model model) {
    model.addAttribute("rows", service.rows());
    return "orders :: table";          // only the table fragment (for AJAX)
}

@GetMapping("/old")
String old() { return "forward:/new"; }  // same request, no new URL

// OUTPUT:
// /orders/table -> HTML fragment only
// /old          -> content of /new, browser URL stays /old`],
        [`<p>View mistakes:</p><ul><li><b>Template not found:</b> wrong folder or name, giving a 500 error.</li><li><b>XSS:</b> using <code>th:utext</code> with user input.</li><li><b>Logic in templates:</b> hard to test and slow.</li><li><b>Stale templates in development:</b> cache not disabled.</li><li><b>Null model value:</b> template fails; check with <code>th:if</code>.</li></ul>`,
            r`<!-- WRONG: raw user input -->
<p th:utext="comment">...</p>
<!-- RIGHT: escaped -->
<p th:text="comment">...</p>

<!-- OUTPUT:
  input  <script>alert(1)</script>
  utext -> script runs
  text  -> shown as plain text -->`],
        [`<p>View performance:</p><ul><li>Keep template caching on in production.</li><li>Use fragments and HTTP caching for static parts.</li><li>Avoid method calls that hit the database inside loops.</li><li>Enable gzip and cache static resources with versioned names.</li></ul>`,
            r`# application.properties (production)
spring.thymeleaf.cache=true
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
server.compression.enabled=true

# OUTPUT:
# /app.css is served as /app-5f3a2c.css with long cache headers`],
        [`<p>A page shows the logged-in user name and a list of orders. The controller prepares all data, and the template only loops and prints.</p>`,
            r`@GetMapping("/my/orders")
String mine(Principal p, Model model) {
    model.addAttribute("user", p.getName());
    model.addAttribute("orders", service.forUser(p.getName()));
    return "orders";
}
// orders.html:
// <h1 th:text="user">User</h1>
// <tr th:each="o : orders"><td th:text="o.id">1</td></tr>

// OUTPUT:
// <h1>asha</h1>
// <tr><td>1001</td></tr> <tr><td>1002</td></tr>`]
    ),

    'mvc-controller': dv(
        [`<p>How a controller method gets called.</p><ul><li>At startup <code>RequestMappingHandlerMapping</code> reads annotations and registers a <code>RequestMappingInfo</code> for each method.</li><li>At runtime the best match is chosen by path, verb, params, headers and media types.</li><li><code>RequestMappingHandlerAdapter</code> uses a <code>ServletInvocableHandlerMethod</code> to resolve each argument and invoke the method by reflection.</li><li>The return value goes to a <code>HandlerMethodReturnValueHandler</code>.</li></ul>`,
            r`@Autowired RequestMappingHandlerMapping mapping;

void dump() {
    mapping.getHandlerMethods().forEach((info, method) ->
        System.out.println(info + " -> " + method));
}

// OUTPUT:
// { GET [/api/items/{id}] } -> ItemController#get(long)
// { POST [/api/items] } -> ItemController#add(String)`],
        [`<p>Controller method variants:</p><ul><li><b>Parameters:</b> <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestHeader</code>, <code>@CookieValue</code>, <code>@RequestBody</code>, <code>@ModelAttribute</code>.</li><li><b>Optional parameters:</b> <code>required=false</code>, <code>defaultValue</code> or <code>Optional</code>.</li><li><b>Return:</b> <code>ResponseEntity</code> for status and headers, plain object for 200.</li><li><b>Class-level:</b> <code>@RequestMapping</code> prefix and <code>@CrossOrigin</code>.</li></ul>`,
            r`@RestController
@RequestMapping("/api/search")
class SearchController {
    @GetMapping
    List<String> search(@RequestParam String q,
                        @RequestParam(defaultValue = "10") int limit,
                        @RequestHeader(value = "X-Trace", required = false)
                        String trace,
                        @CookieValue(value = "lang", defaultValue = "en")
                        String lang) {
        return List.of(q + ":" + limit + ":" + lang);
    }
}

// OUTPUT:
// GET /api/search?q=java -> ["java:10:en"]`],
        [`<p>Controller mistakes:</p><ul><li><b>Instance state:</b> fields mutated per request are shared between threads.</li><li><b>Missing parameter:</b> a required parameter that is absent gives 400.</li><li><b>Type mismatch:</b> <code>/users/abc</code> for a <code>long</code> gives 400.</li><li><b>Swallowed exceptions:</b> returning "error" strings with status 200 hides failures.</li><li><b>Large logic:</b> hundreds of lines in one controller.</li></ul>`,
            r`// WRONG: failure with status 200
@GetMapping("/u/{id}")
String bad(@PathVariable long id) {
    try { return service.name(id); }
    catch (Exception e) { return "error"; }
}
// RIGHT: let the advice map the exception
@GetMapping("/u/{id}")
String good(@PathVariable long id) { return service.name(id); }

@ExceptionHandler(NoSuchElementException.class)
ResponseEntity<Void> nf() { return ResponseEntity.notFound().build(); }

// OUTPUT:
// bad:  200 error
// good: 404 for unknown id`],
        [`<p>Controller tuning:</p><ul><li>Return quickly; do slow work asynchronously with <code>Callable</code> or messaging.</li><li>Stream big downloads with <code>StreamingResponseBody</code>.</li><li>Paginate lists.</li><li>Set cache headers with <code>CacheControl</code>.</li></ul>`,
            r`@GetMapping("/export")
StreamingResponseBody export() {
    return out -> {
        for (int i = 0; i < 1_000_000; i++) {
            out.write(("row" + i + "\n").getBytes());
        }
    };
}

@GetMapping("/slow")
Callable<String> slow() {
    return () -> { Thread.sleep(2000); return "done"; };   // frees the thread
}

// OUTPUT:
// /export streams without holding all rows in memory
// /slow   -> done after 2 s without blocking a container thread`],
        [`<p>Order API with validation, service call and proper status codes, plus a global handler for not found.</p>`,
            r`@RestController
@RequestMapping("/api/orders")
class OrderController {
    private final OrderService service;
    OrderController(OrderService s) { this.service = s; }

    @GetMapping("/{id}")
    OrderDto get(@PathVariable long id) { return service.get(id); }

    @PutMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void cancel(@PathVariable long id) { service.cancel(id); }
}

@RestControllerAdvice
class Errors {
    @ExceptionHandler(OrderNotFound.class)
    ResponseEntity<Map<String, String>> nf(OrderNotFound e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
}

// OUTPUT:
// GET /api/orders/9 -> 404 {"error":"Order 9 not found"}
// PUT /api/orders/1/cancel -> 204`]
    ),

    'mvc-spring-mvc-architecture-flow': dv(
        [`<p>The ordered flow inside <code>DispatcherServlet.doDispatch</code>.</p><ul><li>1. <code>getHandler</code> asks each <code>HandlerMapping</code> and returns a <code>HandlerExecutionChain</code> (handler plus interceptors).</li><li>2. <code>getHandlerAdapter</code> finds an adapter that supports the handler.</li><li>3. <code>applyPreHandle</code> runs interceptors in order.</li><li>4. <code>ha.handle</code> resolves arguments, invokes the method and handles the return value.</li><li>5. <code>applyPostHandle</code> runs in reverse order.</li><li>6. <code>processDispatchResult</code> renders the view or runs exception resolvers.</li><li>7. <code>triggerAfterCompletion</code> runs in reverse order.</li></ul>`,
            r`// Pseudocode of the sequence for GET /demo/5
// Filter chain (servlet container)
//   -> DispatcherServlet.doDispatch
//        mappedHandler = getHandler(req)         // DemoController#demo
//        ha = getHandlerAdapter(handler)         // RequestMappingHandlerAdapter
//        preHandle (interceptors)
//        mv = ha.handle(...)                     // resolve args, call, convert result
//        postHandle (reverse)
//        processDispatchResult(...)              // render or resolve exception
//        afterCompletion (reverse)

// OUTPUT:
// one JSON response written by MappingJackson2HttpMessageConverter`],
        [`<p>Component options in the flow:</p><ul><li><b>HandlerMapping:</b> <code>RequestMappingHandlerMapping</code> (annotations), <code>SimpleUrlHandlerMapping</code>, <code>RouterFunctionMapping</code>.</li><li><b>HandlerAdapter:</b> <code>RequestMappingHandlerAdapter</code>, <code>HttpRequestHandlerAdapter</code>.</li><li><b>Exception resolvers:</b> <code>ExceptionHandlerExceptionResolver</code>, <code>ResponseStatusExceptionResolver</code>, <code>DefaultHandlerExceptionResolver</code>.</li><li><b>Resolvers:</b> <code>ViewResolver</code>, <code>LocaleResolver</code>, <code>MultipartResolver</code>.</li></ul>`,
            r`@Configuration
class FlowConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry reg) {
        reg.addViewController("/about").setViewName("about");   // no controller class
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry reg) {
        reg.addResourceHandler("/files/**").addResourceLocations("file:/data/");
    }
}

// OUTPUT:
// GET /about     -> view "about" (ParameterizableViewController)
// GET /files/a.txt -> served by ResourceHttpRequestHandler`],
        [`<p>Flow-related mistakes:</p><ul><li><b>404 for existing controller:</b> not scanned, wrong path or context path.</li><li><b>405:</b> wrong HTTP verb.</li><li><b>415 and 406:</b> content type or Accept header not supported.</li><li><b>Interceptor not called:</b> it was not registered with <code>addInterceptors</code>.</li><li><b>Interceptor returns false:</b> request stops silently; set a response status.</li></ul>`,
            r`// Diagnose: print the status line of each case
// GET  /users          (only @PostMapping exists)     -> 405 Method Not Allowed
// POST /users text/plain (consumes json)              -> 415 Unsupported Media Type
// GET  /users Accept: application/xml (only json)     -> 406 Not Acceptable
// GET  /nothing                                       -> 404 Not Found
System.out.println("check mapping, verb, consumes and produces");

// OUTPUT:
// check mapping, verb, consumes and produces`],
        [`<p>Every step adds cost, so keep it lean.</p><ul><li>Keep interceptors and filters cheap.</li><li>Avoid regex-heavy path patterns on hot endpoints.</li><li>Use <code>OncePerRequestFilter</code> and skip static paths.</li><li>Use async handlers for slow downstream calls.</li></ul>`,
            r`@Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String p = request.getRequestURI();
    return p.startsWith("/static/") || p.startsWith("/actuator/");
}

// OUTPUT:
// the filter body is skipped for static and actuator requests`],
        [`<p>Request tracing: a filter creates a trace id, an interceptor logs the handler name and duration, and an exception handler returns the trace id in the error body so support can find the logs.</p>`,
            r`@Component
class TraceInterceptor implements HandlerInterceptor {
    private static final String START = "start";

    public boolean preHandle(HttpServletRequest q, HttpServletResponse p, Object h) {
        q.setAttribute(START, System.nanoTime());
        return true;
    }

    public void afterCompletion(HttpServletRequest q, HttpServletResponse p,
                                Object h, Exception ex) {
        long ms = (System.nanoTime() - (long) q.getAttribute(START)) / 1_000_000;
        System.out.println(q.getMethod() + " " + q.getRequestURI()
            + " " + p.getStatus() + " " + ms + "ms");
    }
}

// OUTPUT: (varies)
// GET /api/orders/9 404 4ms`]
    ),

    'mvc-spring-mvc-vs-spring-boot': dv(
        [`<p>What Boot adds on top of MVC at startup.</p><ul><li><code>@SpringBootApplication</code> combines <code>@Configuration</code>, <code>@EnableAutoConfiguration</code> and <code>@ComponentScan</code>.</li><li>Auto-configuration classes are listed in <code>META-INF/spring/...AutoConfiguration.imports</code> and filtered by <code>@ConditionalOnClass</code> and <code>@ConditionalOnMissingBean</code>.</li><li><code>ServletWebServerFactoryAutoConfiguration</code> starts embedded Tomcat; <code>DispatcherServletAutoConfiguration</code> registers the servlet.</li><li>Defaults come from <code>spring.mvc.*</code> and <code>server.*</code> properties.</li></ul>`,
            r`@AutoConfiguration
@ConditionalOnWebApplication(type = Type.SERVLET)
@ConditionalOnClass({ Servlet.class, DispatcherServlet.class })
public class DispatcherServletAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    DispatcherServlet dispatcherServlet(WebMvcProperties props) {
        return new DispatcherServlet();      // simplified
    }
}

// OUTPUT:
// DispatcherServlet registered because Servlet classes are present
// and you did not define your own bean`],
        [`<p>Boot options for MVC:</p><ul><li><b>Starter:</b> <code>spring-boot-starter-web</code> (Tomcat), swap to Jetty by excluding Tomcat.</li><li><b>Packaging:</b> executable jar by default; WAR with <code>SpringBootServletInitializer</code>.</li><li><b>Properties:</b> <code>server.port</code>, <code>server.servlet.context-path</code>, <code>spring.mvc.static-path-pattern</code>.</li><li><b>Customization:</b> <code>WebMvcConfigurer</code> without <code>@EnableWebMvc</code>.</li></ul>`,
            r`# application.properties
server.port=9090
server.servlet.context-path=/shop
spring.mvc.static-path-pattern=/assets/**
spring.mvc.problemdetails.enabled=true

# OUTPUT:
# Tomcat started on port 9090 with context path '/shop'`],
        [`<p>Mistakes mixing the two:</p><ul><li><b>@EnableWebMvc in Boot:</b> turns off static resources, Jackson defaults and more.</li><li><b>Main class in a sub-package:</b> component scan misses controllers.</li><li><b>Two web starters:</b> WebFlux and MVC together make Boot choose MVC.</li><li><b>Old XML and servlet config copied:</b> duplicate DispatcherServlet.</li></ul>`,
            r`// WRONG: disables Boot MVC defaults
@Configuration
@EnableWebMvc
class Cfg implements WebMvcConfigurer { }

// RIGHT: keep defaults, add only what you need
@Configuration
class Cfg implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**").allowedOrigins("https://example.com");
    }
}

// OUTPUT:
// wrong: /static files and JSON date settings stop working
// right: defaults kept, CORS added`],
        [`<p>Boot improves startup and ops, not request speed itself.</p><ul><li>Remove unused starters to cut startup time.</li><li>Use <code>spring.main.lazy-initialization=true</code> in development.</li><li>Use Actuator metrics to watch request timings.</li><li>Native images and CDS can reduce start time.</li></ul>`,
            r`# application.properties
spring.main.lazy-initialization=true
management.endpoints.web.exposure.include=health,metrics
management.metrics.distribution.percentiles-histogram.http.server.requests=true

# OUTPUT:
# GET /actuator/metrics/http.server.requests -> count, total time, max`],
        [`<p>A team moves a legacy WAR-based Spring MVC app to Boot: the XML and servlet initializer are replaced with <code>@SpringBootApplication</code>, controllers stay unchanged, and the app now runs as a jar in a container.</p>`,
            r`// Before: web.xml + dispatcher-servlet.xml + WAR on Tomcat
// After:
@SpringBootApplication
public class LegacyApp {
    public static void main(String[] args) {
        SpringApplication.run(LegacyApp.class, args);
    }
}
// Existing @Controller classes are reused without changes.

// OUTPUT:
// java -jar legacy-app.jar
// Tomcat started on port 8080 (http)`]
    ),

    'mvc-spring-mvc-vs-spring-framework': dv(
        [`<p>How the framework modules stack.</p><ul><li><code>spring-core</code> and <code>spring-beans</code> provide the IoC container.</li><li><code>spring-context</code> adds the application context, events and resources.</li><li><code>spring-web</code> has the HTTP abstractions and message converters shared by MVC and WebFlux.</li><li><code>spring-webmvc</code> adds <code>DispatcherServlet</code> and the MVC programming model.</li><li>In classic setups the <code>ContextLoaderListener</code> creates the root context and the <code>DispatcherServlet</code> a child context.</li></ul>`,
            r`// Classic two-context setup (no Boot)
public class WebInit extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses()    { return new Class[]{ RootConfig.class }; }
    protected Class<?>[] getServletConfigClasses() { return new Class[]{ MvcConfig.class }; }
    protected String[] getServletMappings()        { return new String[]{ "/" }; }
}

// OUTPUT:
// root context: services, repositories
// servlet context: controllers, view resolvers (can see root beans)`],
        [`<p>Where each piece lives:</p><ul><li><b>Core and DI:</b> any Java program.</li><li><b>Data access:</b> <code>JdbcTemplate</code>, transactions, ORM support.</li><li><b>Messaging:</b> <code>spring-jms</code>, <code>spring-messaging</code>.</li><li><b>Web servlet:</b> Spring MVC.</li><li><b>Web reactive:</b> Spring WebFlux.</li><li><b>Test:</b> <code>spring-test</code> with <code>MockMvc</code>.</li></ul>`,
            r`// Same service used from three entry points
@Service class PriceService { double price(String sku) { return 9.99; } }

// 1. console:   ctx.getBean(PriceService.class).price("A1")
// 2. MVC:       @GetMapping("/price/{sku}") returns service.price(sku)
// 3. scheduler: @Scheduled calls service.price("A1")
System.out.println("one container, many entry points");

// OUTPUT:
// one container, many entry points`],
        [`<p>Confusions to avoid:</p><ul><li><b>Saying "Spring" means MVC:</b> interviewers expect you to separate container and web layer.</li><li><b>Putting service beans in the servlet context:</b> they become invisible to other servlets and filters.</li><li><b>Duplicate scanning:</b> scanning the same package in both contexts creates two copies of beans, and transactions may not apply to one of them.</li></ul>`,
            r`// WRONG: root and servlet config both scan everything
@ComponentScan("com.example")          // in RootConfig
@ComponentScan("com.example")          // in MvcConfig  -> duplicate beans

// RIGHT: split by role
@ComponentScan(basePackages = "com.example",
    excludeFilters = @Filter(Controller.class))      // RootConfig
@ComponentScan(basePackages = "com.example.web")     // MvcConfig

// OUTPUT:
// wrong: services created twice (one without proxies)
// right: one service bean, controllers only in the web context`],
        [`<p>Keep modules light: depend only on what you use (for example <code>spring-context</code> for a worker, not <code>spring-webmvc</code>), which reduces jar size and startup time.</p>`,
            r`<!-- Worker module: no web dependencies -->
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-context</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-jdbc</artifactId>
</dependency>

<!-- OUTPUT: fewer jars, faster startup, no servlet API needed -->`],
        [`<p>A company shares a domain and service library (plain Spring Framework) between a web application (Spring MVC) and a nightly batch job (no web), so business rules are written once.</p>`,
            r`// shared-lib
@Service
public class InvoiceService {
    public Invoice create(long orderId) { return new Invoice(orderId); }
}

// web-app (MVC)
@RestController
class InvoiceApi {
    InvoiceApi(InvoiceService s) { this.s = s; }
    private final InvoiceService s;
    @PostMapping("/invoices/{id}") Invoice make(@PathVariable long id) {
        return s.create(id);
    }
}

// batch-app (no web)
// ctx.getBean(InvoiceService.class).create(orderId);

// OUTPUT:
// the same InvoiceService runs in both applications`]
    ),

    'mvc-advantages-of-spring-mvc': dv(
        [`<p>Why those advantages exist technically.</p><ul><li><b>Strategy interfaces:</b> each step (mapping, adapter, resolver, converter) is an interface, so any part can be replaced.</li><li><b>IoC:</b> controllers get services by injection, making them easy to mock.</li><li><b>Annotation metadata:</b> read once at startup and cached, so request handling needs little reflection lookup.</li><li><b>Data binding:</b> <code>WebDataBinder</code> and <code>ConversionService</code> convert strings to typed values.</li></ul>`,
            r`@Component
class StringToMoney implements Converter<String, Money> {
    public Money convert(String s) {
        String[] p = s.split(" ");
        return new Money(new BigDecimal(p[0]), p[1]);
    }
}

@GetMapping("/pay")
String pay(@RequestParam Money amount) { return amount.toString(); }

// OUTPUT:
// GET /pay?amount=10.50 EUR -> Money[10.50 EUR]  (converter applied automatically)`],
        [`<p>Features that make up the advantages:</p><ul><li><b>Binding and validation:</b> <code>@Valid</code>, <code>BindingResult</code>.</li><li><b>Content negotiation:</b> JSON, XML or CSV from the same method.</li><li><b>i18n:</b> <code>MessageSource</code> and <code>LocaleResolver</code>.</li><li><b>File upload:</b> <code>MultipartFile</code>.</li><li><b>CORS and security:</b> built-in support.</li><li><b>Problem details:</b> RFC 7807 error bodies in Spring 6.</li></ul>`,
            r`@PostMapping("/avatar")
String upload(@RequestParam MultipartFile file) throws IOException {
    Files.write(Path.of("/data", file.getOriginalFilename()), file.getBytes());
    return "saved " + file.getSize() + " bytes";
}

@GetMapping(value = "/hello", produces = { "application/json", "application/xml" })
Greeting hello() { return new Greeting("hi"); }

// OUTPUT:
// POST /avatar -> saved 2048 bytes
// GET /hello Accept: application/xml -> <Greeting><text>hi</text></Greeting>`],
        [`<p>Using the advantages wrongly:</p><ul><li><b>Overusing @ModelAttribute magic:</b> hidden data makes controllers hard to follow.</li><li><b>Binding entities directly:</b> mass-assignment risk.</li><li><b>Ignoring validation:</b> trusting client data.</li><li><b>Blocking calls everywhere:</b> exhausting the thread pool.</li></ul>`,
            r`// WRONG: bind straight to an entity with an admin flag
@PostMapping("/users")
User create(@RequestBody User user) { return repo.save(user); }

// RIGHT: bind to a request DTO
record CreateUser(@NotBlank String name, @Email String email) {}
@PostMapping("/users")
User create(@Valid @RequestBody CreateUser req) {
    return repo.save(new User(req.name(), req.email()));
}

// OUTPUT:
// wrong: client can send {"admin":true}
// right: only name and email are accepted`],
        [`<p>Performance related strengths:</p><ul><li>Mapping registry is built once, so lookup is fast.</li><li>Jackson converters are tuned and can be configured for streaming.</li><li>ETag and conditional requests are supported with <code>ShallowEtagHeaderFilter</code> or <code>ResponseEntity.eTag</code>.</li><li>Async support for slow calls.</li></ul>`,
            r`@GetMapping("/products/{id}")
ResponseEntity<Product> get(@PathVariable long id) {
    Product p = service.find(id);
    return ResponseEntity.ok()
        .eTag("v" + p.version())
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
        .body(p);
}

// OUTPUT:
// 200 ETag: "v3" Cache-Control: max-age=300
// repeat with If-None-Match: "v3" -> 304 Not Modified`],
        [`<p>A startup builds a single service that serves a web site (Thymeleaf pages) and a mobile API (JSON) with the same business layer, security rules and error handling, and tests both layers quickly with slice tests.</p>`,
            r`@WebMvcTest(ProductApi.class)
class ProductApiTest {
    @Autowired MockMvc mvc;
    @MockBean ProductService service;

    @Test
    void returnsJson() throws Exception {
        when(service.find(1)).thenReturn(new Product(1, "Pen", 3));
        mvc.perform(get("/api/products/1").accept("application/json"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Pen"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (loads only web beans, runs in under a second)`]
    ),

    'mvc-request-response-lifecycle': dv(
        [`<p>Inside one request.</p><ul><li>The container creates <code>HttpServletRequest</code> and <code>HttpServletResponse</code> and runs the filter chain.</li><li><code>DispatcherServlet</code> stores request attributes, the locale and the web application context.</li><li>Arguments are resolved, the method runs, and the return value handler writes the response.</li><li>With <code>@ResponseBody</code> the converter writes bytes straight to the output stream and marks the request handled (no view).</li><li>The request ends; request-scoped beans are destroyed and <code>afterCompletion</code> runs.</li></ul>`,
            r`// Request scoped bean lives for exactly one lifecycle
@Component
@RequestScope
class RequestInfo {
    private final String id = UUID.randomUUID().toString();
    String id() { return id; }
}

@GetMapping("/id")
String id(RequestInfo info) { return info.id(); }

// OUTPUT: (varies)
// GET /id -> 3f1c...a2 ; the next request returns a different id`],
        [`<p>Lifecycle variants:</p><ul><li><b>Normal view:</b> model rendered through a view.</li><li><b>Body response:</b> <code>@ResponseBody</code> or <code>ResponseEntity</code>.</li><li><b>Redirect:</b> 302/303 and a new request.</li><li><b>Forward:</b> same request goes to another path internally.</li><li><b>Async:</b> <code>Callable</code>, <code>DeferredResult</code>, SSE with <code>SseEmitter</code>.</li><li><b>Error dispatch:</b> container forwards to <code>/error</code> for unhandled errors.</li></ul>`,
            r`@GetMapping("/events")
SseEmitter events() {
    SseEmitter emitter = new SseEmitter(30_000L);
    Executors.newSingleThreadExecutor().submit(() -> {
        try {
            for (int i = 1; i <= 3; i++) {
                emitter.send("tick " + i);
                Thread.sleep(500);
            }
            emitter.complete();
        } catch (Exception e) { emitter.completeWithError(e); }
    });
    return emitter;
}

// OUTPUT:
// data:tick 1
// data:tick 2
// data:tick 3`],
        [`<p>Lifecycle mistakes:</p><ul><li><b>Reading the body twice:</b> the input stream can be read once; use <code>ContentCachingRequestWrapper</code>.</li><li><b>Writing after commit:</b> <code>IllegalStateException: response already committed</code>.</li><li><b>Using request objects in other threads:</b> the container recycles them after the request.</li><li><b>Exception in a filter:</b> controller advice does not see it.</li><li><b>Cleanup in postHandle:</b> use <code>afterCompletion</code> so errors do not skip it.</li></ul>`,
            r`// WRONG: body read in a filter, controller then sees an empty body
String body = new String(request.getInputStream().readAllBytes());

// RIGHT: wrap the request so it can be read again
var wrapped = new ContentCachingRequestWrapper(request);
chain.doFilter(wrapped, response);
String logged = new String(wrapped.getContentAsByteArray());

// OUTPUT:
// wrong: @RequestBody fails with "Required request body is missing"
// right: controller and logger both get the body`],
        [`<p>Lifecycle performance:</p><ul><li>Measure latency per stage (filter, controller, database) with Actuator or Micrometer timers.</li><li>Avoid heavy work in <code>preHandle</code>.</li><li>Do not buffer big bodies in memory; stream them.</li><li>Keep sessions small or stateless.</li></ul>`,
            r`@Timed(value = "orders.place", percentiles = {0.5, 0.95})
@PostMapping("/orders")
OrderDto place(@RequestBody PlaceOrder cmd) {
    return service.place(cmd);
}

// OUTPUT:
// GET /actuator/metrics/orders.place
//   COUNT 120, TOTAL_TIME 14.2 s, MAX 0.9 s   (varies)`],
        [`<p>A support team gets a complaint about a slow checkout. Using a trace id added by a filter, an interceptor timing log and the error body, they find the request, see the time spent in the payment service call, and fix it with a timeout and retry.</p>`,
            r`@Component
class TraceFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse p,
                                    FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(q.getHeader("X-Trace"))
                            .orElse(UUID.randomUUID().toString());
        MDC.put("traceId", id);
        p.setHeader("X-Trace", id);
        try { chain.doFilter(q, p); }
        finally { MDC.clear(); }
    }
}

// OUTPUT: (varies)
// 12:01:07 [traceId=9b1e..] POST /api/checkout 200 1840ms
// response header X-Trace: 9b1e...`]
    )
};
