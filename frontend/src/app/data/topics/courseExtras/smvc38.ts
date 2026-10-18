// Spring extras, batch smvc38 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc38Extras: Record<string, Extra> = {
    'mvc-custom-message-converter-advanced': x(
        ['<b>HttpMessageConverter</b> is the Spring MVC strategy that turns a request body into a Java object and a Java object into a response body, based on the media type.',
            '<b>Custom converter</b>: write one when you need a format Spring does not support, such as CSV, a vendor JSON type or a signed payload; extend <code>AbstractHttpMessageConverter</code>.',
            '<b>Registration</b>: add it through <code>WebMvcConfigurer.extendMessageConverters</code>, so the built-in converters stay in place.'],
        ['<b>Selection</b>: <code>RequestResponseBodyMethodProcessor</code> asks each converter <code>canRead</code> or <code>canWrite</code> for the Java type plus the <code>Content-Type</code> or <code>Accept</code> header.',
            '<b>Order matters</b>: the first converter that says yes wins, so a custom one added at index 0 can shadow Jackson for the same type.',
            '<b>Content negotiation</b>: <code>produces</code> and <code>consumes</code> on the mapping narrow which converters can be used.'],
        ['<b>Prefer Jackson modules</b> (<code>Module</code>, <code>@JsonSerialize</code>) when only the shape of JSON changes; write a converter only for a new media type.',
            '<b>Streaming</b>: implement <code>readInternal</code> and <code>writeInternal</code> with streams, not full strings, for large payloads.',
            '<b>Errors</b>: throw <code>HttpMessageNotReadableException</code> so Spring returns 400 instead of 500.'],
        [['F', 'What does an HttpMessageConverter do?', 'It converts between the HTTP body and Java objects for @RequestBody, @ResponseBody and ResponseEntity.'],
            ['F', 'Which class is a good base for a custom converter?', 'AbstractHttpMessageConverter, where you set supported media types and implement supports, readInternal and writeInternal.'],
            ['M', 'How do you register a custom converter without losing the defaults?', 'Override extendMessageConverters in a WebMvcConfigurer; configureMessageConverters replaces the defaults.'],
            ['M', 'How does Spring choose a converter for a response?', 'It compares the Accept header and produces with each converter canWrite result and uses the first match.'],
            ['S', 'Why might a custom converter never be called?', 'An earlier converter such as Jackson already accepts the type and media type, or the media type you declared does not match the Accept header.'],
            ['S', 'Custom converter or Jackson module?', 'A Jackson module for a different JSON shape; a converter for a different wire format.']],
        [['CSV converter for a list of users.',
            r`public class UserCsvConverter extends AbstractHttpMessageConverter<List<User>> {
    public UserCsvConverter() { super(new MediaType("text", "csv")); }

    @Override protected boolean supports(Class<?> c) { return List.class.isAssignableFrom(c); }

    @Override protected List<User> readInternal(Class<? extends List<User>> c,
            HttpInputMessage in) { throw new HttpMessageNotReadableException(
                "read not supported", in); }

    @Override protected void writeInternal(List<User> users, HttpOutputMessage out)
            throws IOException {
        var w = new OutputStreamWriter(out.getBody(), StandardCharsets.UTF_8);
        for (User u : users) w.write(u.id() + "," + u.name() + "\n");
        w.flush();
    }
}

// OUTPUT:
// GET /users with Accept: text/csv
// 1,Abaji
// 2,Raoji`],
            ['Register it.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(0, new UserCsvConverter());   // first, so it can win
    }
}

// OUTPUT:
// Accept: text/csv  -> UserCsvConverter writes CSV
// Accept: application/json -> Jackson still writes JSON`]],
        [['Controller that produces CSV.',
            r`@RestController
class UserController {
    @GetMapping(value = "/users", produces = {"application/json", "text/csv"})
    List<User> all() { return List.of(new User(1, "Abaji"), new User(2, "Raoji")); }
}

// OUTPUT:
// curl -H "Accept: text/csv" /users
// 1,Abaji
// 2,Raoji`],
            ['Test with MockMvc.',
                r`@WebMvcTest(UserController.class)
@Import(WebConfig.class)
class UserCsvTest {
    @Autowired MockMvc mvc;
    @Test void csv() throws Exception {
        mvc.perform(get("/users").accept("text/csv"))
           .andExpect(status().isOk())
           .andExpect(content().string("1,Abaji\n2,Raoji\n"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-custom-annotation': x(
        ['<b>Custom annotation</b> is your own <code>@interface</code>, which carries metadata that Spring or your code reads at runtime, for example <code>@CurrentUser</code> or <code>@Audited</code>.',
            '<b>Meta-annotations</b> <code>@Retention(RUNTIME)</code> and <code>@Target</code> decide when the annotation is kept and where it can be placed.',
            '<b>Composed annotation</b>: stack Spring annotations on a new one, such as <code>@GetMapping</code> plus <code>@ResponseStatus</code>, to remove repetition.'],
        ['<b>Argument resolver</b>: a <code>HandlerMethodArgumentResolver</code> that checks <code>supportsParameter</code> for your annotation injects values into controller parameters.',
            '<b>Interceptor or AOP</b>: read the annotation with <code>HandlerMethod.getMethodAnnotation</code> in an interceptor, or use an <code>@Around</code> advice.',
            '<b>Validation</b>: a constraint annotation needs <code>@Constraint(validatedBy = ...)</code> and a <code>ConstraintValidator</code>.'],
        ['<b>Retention</b>: with the default CLASS retention the annotation is invisible at runtime, a very common bug.',
            '<b>AnnotatedElementUtils</b> finds annotations through meta-annotations and <code>@AliasFor</code>; plain reflection does not.',
            '<b>Proxies</b>: on a class-based proxy, look up the annotation on the target class, not the proxy.'],
        [['F', 'What is a custom annotation?', 'A user-defined @interface used to mark code with metadata that is read at runtime or build time.'],
            ['F', 'Which retention is needed for runtime reading?', 'RetentionPolicy.RUNTIME.'],
            ['M', 'How do you inject a custom value into a controller method?', 'Write a HandlerMethodArgumentResolver for the annotated parameter and register it in addArgumentResolvers.'],
            ['M', 'How do you build a composed annotation?', 'Annotate your @interface with the Spring annotations to combine; Spring treats them as meta-annotations.'],
            ['S', 'Why does getAnnotation return null on a proxied bean?', 'The proxy class may not carry the annotation; use AopUtils.getTargetClass or AnnotatedElementUtils.'],
            ['S', 'Interceptor or AOP for an annotation?', 'Interceptor for web-only checks with request access; AOP for any bean method.']],
        [['Define and use a @CurrentUser annotation.',
            r`@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser { }

@GetMapping("/me")
String me(@CurrentUser User user) { return "Hello " + user.name(); }

// OUTPUT:
// GET /me (header X-User: abaji)
// Hello abaji`],
            ['The argument resolver behind it.',
                r`public class CurrentUserResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.hasParameterAnnotation(CurrentUser.class);
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer mc,
            NativeWebRequest req, WebDataBinderFactory f) {
        return new User(req.getHeader("X-User"));
    }
}

// OUTPUT:
// the controller parameter is filled before the method runs`]],
        [['Register the resolver.',
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> list) {
        list.add(new CurrentUserResolver());
    }
}

// OUTPUT:
// RequestMappingHandlerAdapter now consults CurrentUserResolver`],
            ['Composed annotation.',
                r`@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@GetMapping
@ResponseStatus(HttpStatus.OK)
public @interface ApiGet {
    @AliasFor(annotation = GetMapping.class, attribute = "value")
    String[] value() default {};
}

@ApiGet("/ping") String ping() { return "pong"; }

// OUTPUT:
// GET /ping -> 200 pong`]]
    ),

    'mvc-request-lifecycle-customization': x(
        ['<b>Request lifecycle</b> is the path of a request: servlet filters, <code>DispatcherServlet</code>, handler mapping, interceptors, argument resolvers, the controller, return value handlers and message converters.',
            '<b>Customization points</b> let you hook into each stage: <code>Filter</code>, <code>HandlerInterceptor</code>, <code>@ControllerAdvice</code>, resolvers and <code>WebMvcConfigurer</code>.',
            '<b>Choose the stage</b> by what you need: raw request wrapping goes in a filter, handler-aware checks in an interceptor.'],
        ['<b>Filter</b> runs before the DispatcherServlet and knows nothing about handlers; use it for logging, CORS and request wrapping.',
            '<b>Interceptor</b> has <code>preHandle</code>, <code>postHandle</code> and <code>afterCompletion</code>, and it can read the matched <code>HandlerMethod</code>.',
            '<b>Advice</b>: <code>@ControllerAdvice</code> adds <code>@ExceptionHandler</code>, <code>@InitBinder</code> and <code>@ModelAttribute</code> to all controllers.'],
        ['<b>Order</b>: filters wrap the whole servlet call; interceptors run in registration order on the way in and reverse order on the way out.',
            '<b>Async requests</b>: <code>afterCompletion</code> still runs, but <code>postHandle</code> may be skipped; use <code>AsyncHandlerInterceptor</code>.',
            '<b>RequestBodyAdvice and ResponseBodyAdvice</b> modify bodies around the message converters.'],
        [['F', 'What is the first Spring MVC component to receive a request?', 'The DispatcherServlet, after any servlet filters.'],
            ['F', 'Where do you register an interceptor?', 'In addInterceptors of a WebMvcConfigurer.'],
            ['M', 'Filter or interceptor?', 'A filter is a servlet feature that works on every request; an interceptor is a Spring feature that knows the handler.'],
            ['M', 'Which interceptor method runs even after an exception?', 'afterCompletion.'],
            ['S', 'What happens if preHandle returns false?', 'The chain stops: the handler is not called and later interceptors are skipped, so you must write the response yourself.'],
            ['S', 'How do you change a response body for all controllers?', 'Implement ResponseBodyAdvice and annotate it with @ControllerAdvice.']],
        [['Timing interceptor.',
            r`public class TimingInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
            Object handler) {
        req.setAttribute("t0", System.nanoTime());
        return true;
    }
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
            Object handler, Exception ex) {
        long ms = (System.nanoTime() - (long) req.getAttribute("t0")) / 1_000_000;
        System.out.println(req.getRequestURI() + " took " + ms + " ms");
    }
}

// OUTPUT: (varies)
// /orders took 12 ms`],
            ['Register with a path pattern.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry reg) {
        reg.addInterceptor(new TimingInterceptor())
           .addPathPatterns("/api/**")
           .excludePathPatterns("/api/health");
    }
}

// OUTPUT:
// /api/orders is timed, /api/health is not`]],
        [['Order of calls.',
            r`// filter.before
//   interceptor.preHandle
//     controller
//   interceptor.postHandle
//   (view or message converter)
//   interceptor.afterCompletion
// filter.after

// OUTPUT:
// filter.before, preHandle, controller, postHandle, afterCompletion, filter.after`],
            ['Test the interceptor.',
                r`@WebMvcTest(OrderController.class)
@Import(WebConfig.class)
class InterceptorTest {
    @Autowired MockMvc mvc;
    @Test void ok() throws Exception {
        mvc.perform(get("/api/orders")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (WebMvcTest loads WebMvcConfigurer beans you import)`]]
    ),

    'mvc-front-controller-pattern-patterns': x(
        ['<b>Front Controller</b> is a design pattern where one single component receives every request and then delegates to the right handler.',
            '<b>In Spring MVC</b> the front controller is <code>DispatcherServlet</code>; it is a servlet mapped to <code>/</code> that routes all requests.',
            '<b>Benefit</b>: common work such as security, logging and error handling lives in one place instead of in every controller.'],
        ['<b>Flow</b>: the servlet asks a <code>HandlerMapping</code> for the handler, a <code>HandlerAdapter</code> invokes it, then a <code>ViewResolver</code> or message converter produces the output.',
            '<b>Strategies</b>: each step is an interface, so you can replace it; this is the Strategy pattern inside the Front Controller.',
            '<b>Before Spring</b>: one servlet or JSP per URL, which duplicated cross-cutting code.'],
        ['<b>Boot</b> registers the DispatcherServlet through <code>DispatcherServletAutoConfiguration</code>; you can map it to another path with <code>spring.mvc.servlet.path</code>.',
            '<b>Multiple dispatchers</b> can exist (for example one for web and one for API), each with its own child context.',
            '<b>Static resources</b> are handled by a resource handler mapping inside the same front controller.'],
        [['F', 'What is the Front Controller pattern?', 'A single entry point that receives all requests and dispatches them to handlers.'],
            ['F', 'Which class is the front controller in Spring MVC?', 'DispatcherServlet.'],
            ['M', 'Which components does the DispatcherServlet use?', 'HandlerMapping, HandlerAdapter, HandlerExceptionResolver, ViewResolver and others.'],
            ['M', 'Why is a front controller useful?', 'It centralizes cross-cutting concerns and removes duplication.'],
            ['S', 'How does DispatcherServlet find the handler?', 'It loops over HandlerMapping beans in order and uses the first one that returns a handler execution chain.'],
            ['S', 'How can you change the URL the dispatcher serves?', 'Set spring.mvc.servlet.path in Boot, or change the servlet mapping.']],
        [['A tiny hand-made front controller.',
            r`@WebServlet("/*")
public class FrontServlet extends HttpServlet {
    private final Map<String, Consumer<HttpServletResponse>> routes = Map.of(
        "/hello", res -> write(res, "Hello"),
        "/bye",   res -> write(res, "Bye"));

    protected void service(HttpServletRequest req, HttpServletResponse res) {
        routes.getOrDefault(req.getRequestURI(),
            r -> r.setStatus(404)).accept(res);
    }
    static void write(HttpServletResponse res, String s) {
        try { res.getWriter().write(s); } catch (IOException e) { }
    }
}

// OUTPUT:
// GET /hello -> Hello
// GET /x     -> 404`],
            ['The same job in Spring MVC.',
                r`@RestController
class HelloController {
    @GetMapping("/hello") String hello() { return "Hello"; }
    @GetMapping("/bye")   String bye()   { return "Bye"; }
}

// OUTPUT:
// GET /hello -> Hello (routed by DispatcherServlet)`]],
        [['Find the dispatcher in a running app.',
            r`@Autowired ApplicationContext ctx;
// ctx.getBean(DispatcherServlet.class) works in a Boot web app
System.out.println(ctx.getBean(DispatcherServlet.class).getServletName());

// OUTPUT:
// dispatcherServlet`],
            ['Test routing with MockMvc.',
                r`@WebMvcTest(HelloController.class)
class RoutingTest {
    @Autowired MockMvc mvc;
    @Test void routes() throws Exception {
        mvc.perform(get("/hello")).andExpect(content().string("Hello"));
        mvc.perform(get("/nothing")).andExpect(status().isNotFound());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-mvc-pattern': x(
        ['<b>MVC pattern</b> splits an application into Model (data and rules), View (presentation) and Controller (handles input and picks the view).',
            '<b>Purpose</b>: separation of concerns, so you can change the UI without touching business logic and test each part alone.',
            '<b>In Spring MVC</b>: the Model is the <code>Model</code> map and domain objects, the View is Thymeleaf or JSP, the Controller is a class with <code>@Controller</code>.'],
        ['<b>Flow</b>: request, <code>DispatcherServlet</code>, controller method, model filled, view name returned, <code>ViewResolver</code>, rendered HTML.',
            '<b>Thin controller</b>: keep controllers small and call a service for the logic; the service uses repositories.',
            '<b>REST variant</b>: with <code>@RestController</code> the view is the JSON body, written by a message converter.'],
        ['<b>Anemic model</b> is a common smell: put behavior in domain objects, not only in services.',
            '<b>DTOs</b> keep entities out of the view layer and stop lazy loading errors in templates.',
            '<b>Layering</b>: controller to service to repository; do not let the view call repositories.'],
        [['F', 'What do M, V and C stand for?', 'Model, View and Controller.'],
            ['F', 'Which annotation marks a Spring MVC controller?', '@Controller (or @RestController for JSON).'],
            ['M', 'How does a controller pass data to a view?', 'By adding attributes to the Model and returning a view name.'],
            ['M', 'What resolves a view name to a template?', 'A ViewResolver such as ThymeleafViewResolver.'],
            ['S', 'Why keep controllers thin?', 'Logic in services is reusable and testable without the web layer.'],
            ['S', 'How does @RestController change the MVC flow?', 'No view resolution happens; the return value is written to the body by a message converter.']],
        [['Controller, model and view.',
            r`@Controller
class ProductController {
    private final ProductService service;
    ProductController(ProductService service) { this.service = service; }

    @GetMapping("/products")
    String list(Model model) {
        model.addAttribute("products", service.findAll());   // Model
        return "products";                                    // View name
    }
}

// OUTPUT:
// GET /products renders templates/products.html with the list`],
            ['The view template.',
                r`<!-- templates/products.html (Thymeleaf) -->
<ul>
  <li th:each="p : $` + r`{products}
" th:text="$` + r`{p.name}
"></li>
</ul>

// OUTPUT:
// <ul><li>Pen</li><li>Book</li></ul>`]],
        [['Test the controller layer.',
            r`@WebMvcTest(ProductController.class)
class ProductControllerTest {
    @Autowired MockMvc mvc;
    @MockBean ProductService service;
    @Test void list() throws Exception {
        given(service.findAll()).willReturn(List.of(new Product("Pen")));
        mvc.perform(get("/products"))
           .andExpect(view().name("products"))
           .andExpect(model().attributeExists("products"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['REST version of the same controller.',
                r`@RestController
class ProductApi {
    @GetMapping("/api/products")
    List<Product> list() { return List.of(new Product("Pen")); }
}

// OUTPUT:
// [{"name":"Pen"}]`]]
    ),

    'mvc-dependency-injection': x(
        ['<b>Dependency Injection</b> means an object receives the things it needs from outside instead of creating them with <code>new</code>.',
            '<b>In Spring</b> the container creates beans and injects them through the constructor, a setter or a field marked <code>@Autowired</code>.',
            '<b>Benefit</b>: loose coupling and easy testing, because a test can pass a fake instead of the real dependency.'],
        ['<b>Constructor injection</b> is preferred: dependencies are final, required and visible; with one constructor <code>@Autowired</code> is optional.',
            '<b>Qualifiers</b>: with several beans of one type use <code>@Qualifier</code> or <code>@Primary</code> to pick one.',
            '<b>Scopes</b>: the default is singleton; a prototype or request-scoped bean needs a provider or a scoped proxy when injected into a singleton.'],
        ['<b>Resolution</b>: <code>AutowiredAnnotationBeanPostProcessor</code> finds the injection points and the <code>BeanFactory</code> resolves candidates by type, then by name.',
            '<b>Circular dependency</b>: constructor cycles fail at startup; Boot 2.6 and later forbids cycles by default.',
            '<b>Optional</b> dependencies: use <code>ObjectProvider</code> or <code>Optional</code>.'],
        [['F', 'What is dependency injection?', 'Supplying an object with its dependencies from outside rather than creating them inside.'],
            ['F', 'Which injection style is recommended?', 'Constructor injection.'],
            ['M', 'What if two beans match a type?', 'Spring throws NoUniqueBeanDefinitionException unless you use @Primary or @Qualifier.'],
            ['M', 'Why avoid field injection?', 'It hides dependencies, prevents final fields and makes tests need reflection or the container.'],
            ['S', 'How do you inject a prototype bean into a singleton?', 'Use ObjectProvider, a lookup method, or a scoped proxy so a new instance is fetched per use.'],
            ['S', 'How does Spring detect a circular dependency?', 'It tracks beans currently in creation and throws BeanCurrentlyInCreationException on a constructor cycle.']],
        [['Constructor injection.',
            r`@Service
class OrderService {
    private final PaymentGateway gateway;          // final, required
    OrderService(PaymentGateway gateway) { this.gateway = gateway; }
    String pay(int amount) { return gateway.charge(amount); }
}

@Component
class CardGateway implements PaymentGateway {
    public String charge(int amount) { return "charged " + amount; }
}

// OUTPUT:
// new OrderService(...).pay(50) -> charged 50`],
            ['Choosing between two implementations.',
                r`@Component @Primary
class CardGateway implements PaymentGateway { /* default */ }

@Component("upi")
class UpiGateway implements PaymentGateway { /* alternative */ }

OrderService(@Qualifier("upi") PaymentGateway gateway) { this.gateway = gateway; }

// OUTPUT:
// OrderService receives UpiGateway; other injection points get CardGateway`]],
        [['Unit test without Spring.',
            r`class OrderServiceTest {
    @Test void pays() {
        PaymentGateway fake = amount -> "fake " + amount;
        OrderService s = new OrderService(fake);       // plain new, no container
        assertEquals("fake 10", s.pay(10));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Slice test with a mock bean.',
                r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService service;      // replaces the real bean in the context
    @Test void ok() throws Exception {
        given(service.pay(5)).willReturn("done");
        mvc.perform(post("/pay").param("amount", "5"))
           .andExpect(content().string("done"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-ioc': x(
        ['<b>Inversion of Control</b> means the framework, not your code, controls object creation and the program flow; you supply classes and configuration.',
            '<b>Spring IoC container</b> is the <code>ApplicationContext</code>: it reads bean definitions, creates the beans, wires them and manages their life cycle.',
            '<b>Relation to DI</b>: dependency injection is the main way Spring implements IoC.'],
        ['<b>Configuration sources</b>: annotations (<code>@Component</code>, <code>@Bean</code>), Java config with <code>@Configuration</code>, or XML.',
            '<b>BeanFactory vs ApplicationContext</b>: the context adds events, internationalization, resource loading and eager singleton creation.',
            '<b>Hollywood principle</b>: do not call us, we will call you; Spring calls your <code>@PostConstruct</code>, controller methods and listeners.'],
        ['<b>Startup steps</b>: scan classes, register <code>BeanDefinition</code> objects, run <code>BeanFactoryPostProcessor</code>, instantiate singletons, inject, run <code>BeanPostProcessor</code>, then proxies.',
            '<b>Lazy beans</b> with <code>@Lazy</code> are created on first use, which speeds startup but hides errors until later.',
            '<b>Hierarchy</b>: a web app has a root context and a child servlet context; children see parents, not the reverse.'],
        [['F', 'What is IoC?', 'A principle where the container controls creation and wiring of objects instead of your code.'],
            ['F', 'What is the Spring container called?', 'ApplicationContext (and its parent BeanFactory).'],
            ['M', 'IoC versus DI?', 'IoC is the broad principle; DI is the technique of passing dependencies in.'],
            ['M', 'BeanFactory versus ApplicationContext?', 'ApplicationContext adds events, i18n and eager initialization on top of BeanFactory.'],
            ['S', 'Describe bean creation order.', 'Definitions are loaded, factory post processors run, beans are instantiated, populated, initialized and wrapped by bean post processors.'],
            ['S', 'What is a BeanPostProcessor used for?', 'To change beans around initialization; AOP proxies and @Autowired handling use it.']],
        [['Bootstrapping the container.',
            r`@Configuration
@ComponentScan("com.example")
class AppConfig { }

public class Main {
    public static void main(String[] args) {
        var ctx = new AnnotationConfigApplicationContext(AppConfig.class);
        GreetingService s = ctx.getBean(GreetingService.class);
        System.out.println(s.greet("Abaji"));
        ctx.close();
    }
}

// OUTPUT:
// Hello Abaji`],
            ['Without IoC for comparison.',
                r`class Report {
    private final Printer printer = new ConsolePrinter();   // tied to one class
}
// With IoC: Report(Printer printer) and the container supplies the implementation.

// OUTPUT:
// Swapping ConsolePrinter for PdfPrinter needs a config change, not a code change`]],
        [['Lifecycle callbacks.',
            r`@Component
class Cache {
    @PostConstruct void init() { System.out.println("cache ready"); }
    @PreDestroy   void stop()  { System.out.println("cache closed"); }
}

// OUTPUT:
// cache ready   (after injection)
// cache closed  (on context close)`],
            ['Inspect the context in a test.',
                r`@SpringBootTest
class ContextTest {
    @Autowired ApplicationContext ctx;
    @Test void beans() {
        assertTrue(ctx.containsBean("cache"));
        assertSame(ctx.getBean(Cache.class), ctx.getBean(Cache.class)); // singleton
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-singleton': x(
        ['<b>Singleton</b> is a pattern where a class has only one instance in the whole application, reached through a global access point.',
            '<b>Spring singleton scope</b> is the default: one bean instance per container, not one per JVM; two contexts hold two instances.',
            '<b>Not the GoF singleton</b>: Spring beans are plain classes with a normal public constructor, and the container keeps the single instance.'],
        ['<b>Thread safety</b>: one shared instance is used by many request threads, so a singleton bean must be stateless or protect its state.',
            '<b>Classic form</b>: private constructor plus a static <code>getInstance()</code>; the enum singleton is the simplest safe form.',
            '<b>Other scopes</b>: <code>prototype</code>, <code>request</code>, <code>session</code> create new instances when needed.'],
        ['<b>Storage</b>: <code>DefaultSingletonBeanRegistry</code> keeps a map of singleton objects, with early references to resolve cycles.',
            '<b>Testing cost</b>: a static GoF singleton is hard to mock; a Spring singleton can be replaced with <code>@MockBean</code>.',
            '<b>Lazy</b>: singletons are created at startup unless marked <code>@Lazy</code>.'],
        [['F', 'What is the default scope of a Spring bean?', 'Singleton.'],
            ['F', 'What does singleton mean in Spring?', 'One shared instance per ApplicationContext.'],
            ['M', 'Is a Spring singleton thread safe?', 'Not automatically; it must be stateless or synchronize its mutable state.'],
            ['M', 'Name a safe way to write a GoF singleton.', 'Use an enum, or a holder class with a static inner class.'],
            ['S', 'Singleton versus static class?', 'A singleton is an object that can implement interfaces, be injected and be mocked; a static class cannot.'],
            ['S', 'Why is double-checked locking risky?', 'Without volatile the instance can be seen half built; the holder idiom avoids the problem.']],
        [['Enum and holder singletons.',
            r`enum Config {
    INSTANCE;
    private final Map<String, String> values = new ConcurrentHashMap<>();
    void put(String k, String v) { values.put(k, v); }
    String get(String k) { return values.get(k); }
}

class Registry {
    private Registry() { }
    private static class Holder { static final Registry I = new Registry(); }
    static Registry getInstance() { return Holder.I; }   // lazy and thread safe
}
System.out.println(Registry.getInstance() == Registry.getInstance());

// OUTPUT:
// true`],
            ['Spring singleton bean.',
                r`@Service
class CounterService {
    private final AtomicInteger count = new AtomicInteger();   // safe shared state
    int next() { return count.incrementAndGet(); }
}

// OUTPUT:
// every caller shares one CounterService: next() returns 1, 2, 3 ...`]],
        [['Prove one instance.',
            r`@SpringBootTest
class SingletonTest {
    @Autowired ApplicationContext ctx;
    @Test void same() {
        assertSame(ctx.getBean(CounterService.class),
                   ctx.getBean(CounterService.class));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Prototype inside singleton problem.',
                r`@Component @Scope("prototype")
class Ticket { }

@Service
class Desk {
    private final ObjectProvider<Ticket> tickets;
    Desk(ObjectProvider<Ticket> tickets) { this.tickets = tickets; }
    Ticket issue() { return tickets.getObject(); }     // new Ticket every call
}

// OUTPUT:
// desk.issue() != desk.issue()   (two different tickets)`]]
    ),

    'mvc-factory-pattern': x(
        ['<b>Factory pattern</b> hides object creation behind a method or class, so callers ask for a product by type or parameter and do not use <code>new</code> directly.',
            '<b>In Spring</b> the <code>BeanFactory</code> and <code>ApplicationContext</code> are factories; a <code>@Bean</code> method is a factory method.',
            '<b>Benefit</b>: callers depend on an interface, and the choice of implementation lives in one place.'],
        ['<b>Simple factory</b>: a static method with a switch on a parameter; <b>factory method</b>: subclasses decide the product; <b>abstract factory</b>: creates families of products.',
            '<b>FactoryBean</b>: implement <code>FactoryBean&lt;T&gt;</code> for a bean whose creation is complex; the context returns the product, and <code>&amp;name</code> returns the factory itself.',
            '<b>Map of strategies</b>: inject <code>Map&lt;String, Handler&gt;</code> and look up by bean name instead of a switch.'],
        ['<b>@Bean methods</b> in a <code>@Configuration</code> class run through a CGLIB proxy so repeated calls return the same singleton.',
            '<b>Static factory</b>: XML <code>factory-method</code> or a static <code>@Bean</code> method for early beans such as post processors.',
            '<b>ServiceLoader</b> and <code>ObjectProvider</code> are other creation helpers.'],
        [['F', 'What is the Factory pattern?', 'A way to create objects without exposing the creation logic and the concrete class.'],
            ['F', 'Give a Spring example of a factory.', 'BeanFactory or ApplicationContext, and any @Bean method.'],
            ['M', 'What is a FactoryBean?', 'A Spring interface for beans that produce other objects; getObject returns the product.'],
            ['M', 'Simple factory versus factory method?', 'A simple factory is one class with a creating method; factory method lets subclasses choose the product.'],
            ['S', 'Why does calling a @Bean method twice give one object?', 'In a full @Configuration class the method is intercepted by a CGLIB proxy that returns the cached singleton.'],
            ['S', 'How to replace a switch of types in Spring?', 'Inject a Map of beans keyed by name, or a List of strategies that each declare what they support.']],
        [['Simple factory and a Spring map.',
            r`interface Notifier { String send(String msg); }
@Component("email") class EmailNotifier implements Notifier {
    public String send(String m) { return "email:" + m; }
    }
@Component("sms") class SmsNotifier implements Notifier {
    public String send(String m) { return "sms:" + m; }
    }

@Component
class NotifierFactory {
    private final Map<String, Notifier> notifiers;       // name -> bean
    NotifierFactory(Map<String, Notifier> notifiers) { this.notifiers = notifiers; }
    Notifier get(String type) { return notifiers.get(type); }
}
// new factory.get("sms").send("hi")

// OUTPUT:
// sms:hi`],
            ['@Bean as a factory method.',
                r`@Configuration
class ClientConfig {
    @Bean
    HttpClient httpClient() {
        return HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    }
}

// OUTPUT:
// one HttpClient singleton is created and injected where needed`]],
        [['A FactoryBean.',
            r`@Component("connection")
class ConnectionFactoryBean implements FactoryBean<Connection> {
    public Connection getObject() { return new Connection("db://local"); }
    public Class<?> getObjectType() { return Connection.class; }
}
// ctx.getBean("connection")  -> Connection
// ctx.getBean("&connection") -> ConnectionFactoryBean

// OUTPUT:
// Connection(url=db://local)`],
            ['Test the factory.',
                r`@SpringBootTest
class FactoryTest {
    @Autowired NotifierFactory factory;
    @Test void picks() {
        assertEquals("email:x", factory.get("email").send("x"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-strategy-pattern': x(
        ['<b>Strategy pattern</b> defines a family of interchangeable algorithms behind one interface, so the caller picks one at runtime.',
            '<b>In Spring MVC</b> strategies are everywhere: <code>HandlerMapping</code>, <code>HandlerAdapter</code>, <code>ViewResolver</code> and <code>HttpMessageConverter</code> are all strategy interfaces.',
            '<b>Benefit</b>: new behavior is added by writing a new class, with no change to the code that uses it (open-closed principle).'],
        ['<b>Structure</b>: a strategy interface, several implementations and a context that holds one and delegates to it.',
            '<b>With DI</b>: make each strategy a bean and inject <code>List&lt;Strategy&gt;</code> or <code>Map&lt;String, Strategy&gt;</code>; the container finds them all.',
            '<b>Replaces</b> long if-else or switch chains on a type.'],
        ['<b>Selection</b>: either by key (map lookup) or by asking each strategy <code>supports(ctx)</code>, the style Spring MVC itself uses.',
            '<b>Ordering</b>: with a list of strategies use <code>@Order</code> or <code>Ordered</code> so the first match is deterministic.',
            '<b>Lambdas</b> make small strategies cheap: a functional interface can be given as a lambda or method reference.'],
        [['F', 'What is the Strategy pattern?', 'Interchangeable algorithms behind a common interface, chosen at runtime.'],
            ['F', 'Name a Spring MVC strategy interface.', 'ViewResolver, HandlerMapping, HttpMessageConverter or HandlerAdapter.'],
            ['M', 'How does Spring help build strategies?', 'It injects all beans of an interface as a List or Map, so adding a class adds a strategy.'],
            ['M', 'Strategy versus State?', 'Strategy is chosen by the caller and does not change itself; State changes by itself as the object moves between states.'],
            ['S', 'How does HandlerAdapter show the pattern?', 'DispatcherServlet loops over adapters, asks supports(handler) and delegates handle to the first match.'],
            ['S', 'How to keep selection deterministic?', 'Define an explicit order with @Order, or use a keyed Map with an explicit default.']],
        [['Discount strategies selected by key.',
            r`interface Discount { int apply(int price); }
@Component("none")    class NoDiscount implements Discount {
    public int apply(int p) { return p; }
    }
@Component("student") class StudentDiscount implements Discount {
    public int apply(int p) { return p * 80 / 100; }
    }

@Service
class PriceService {
    private final Map<String, Discount> strategies;
    PriceService(Map<String, Discount> strategies) { this.strategies = strategies; }
    int price(String type, int base) {
        return strategies.getOrDefault(type, strategies.get("none")).apply(base);
    }
}

// OUTPUT:
// price("student", 100) -> 80
// price("unknown", 100) -> 100`],
            ['Supports-style selection.',
                r`interface Exporter {
    boolean supports(String f);
    String export(String d);
}
@Service
class ExportService {
    private final List<Exporter> exporters;
    ExportService(List<Exporter> exporters) { this.exporters = exporters; }
    String run(String format, String data) {
        return exporters.stream().filter(e -> e.supports(format)).findFirst()
            .orElseThrow(() -> new IllegalArgumentException(format)).export(data);
    }
}

// OUTPUT:
// run("csv", "a") -> uses the CSV exporter; run("xml", "a") -> IllegalArgumentException: xml`]],
        [['Strategy as a lambda.',
            r`Map<String, IntUnaryOperator> ops = Map.of(
    "double", n -> n * 2,
    "square", n -> n * n);
System.out.println(ops.get("square").applyAsInt(7));

// OUTPUT:
// 49`],
            ['Test each strategy and the service.',
                r`@SpringBootTest
class PriceServiceTest {
    @Autowired PriceService service;
    @Test void student() { assertEquals(80, service.price("student", 100)); }
    @Test void fallback() { assertEquals(100, service.price("x", 100)); }
}

// OUTPUT:
// Tests run: 2, Failures: 0`]]
    )
};

export const smvc38Deep: Record<string, Deep> = {
    'mvc-custom-message-converter-advanced': dv(
        [`<p>How a converter is used inside Spring MVC:</p><ul><li><b>Entry:</b> <code>RequestResponseBodyMethodProcessor</code> handles <code>@RequestBody</code> and <code>@ResponseBody</code>, delegating to <code>AbstractMessageConverterMethodProcessor</code>.</li><li><b>Read:</b> it loops over the converters, calling <code>canRead(type, contentType)</code>; the first true reads the body.</li><li><b>Write:</b> it computes the producible media types, sorts them against the <code>Accept</code> header by quality, and uses the first converter whose <code>canWrite</code> is true.</li><li><b>No match:</b> 415 on read, 406 on write.</li><li><b>Advice:</b> <code>RequestBodyAdvice</code> and <code>ResponseBodyAdvice</code> run before and after conversion.</li></ul>`,
            r`public abstract class AbstractHttpMessageConverter<T> implements HttpMessageConverter<T> {
    public boolean canWrite(Class<?> clazz, MediaType mediaType) {
        return supports(clazz) && canWrite(mediaType);   // type plus media type
    }
    protected abstract boolean supports(Class<?> clazz);
    protected abstract void writeInternal(T t, HttpOutputMessage out) throws IOException;
}
// Simplified view of the framework base class

// OUTPUT:
// converter chosen = first one where supports(type) and media type both match`],
        [`<p>Variants of a converter:</p><ul><li><b>AbstractHttpMessageConverter:</b> one Java type, a fixed set of media types.</li><li><b>AbstractGenericHttpMessageConverter:</b> generic types such as <code>List&lt;User&gt;</code>.</li><li><b>GenericHttpMessageConverter:</b> receives the full generic <code>Type</code>.</li><li><b>Jackson customization:</b> a <code>Jackson2ObjectMapperBuilderCustomizer</code> bean or <code>spring.jackson.*</code> properties.</li><li><b>Registration:</b> <code>configureMessageConverters</code> replaces all defaults; <code>extendMessageConverters</code> adds to them.</li></ul>`,
            r`@Bean
Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
    return b -> b.simpleDateFormat("yyyy-MM-dd")
                 .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
}

// In Boot, a HttpMessageConverter bean is added to the list automatically:
@Bean
HttpMessageConverter<?> csvConverter() { return new UserCsvConverter(); }

// OUTPUT:
// Dates are written as 2026-10-09; the CSV converter joins the Boot converter list`],
        [`<p>Typical mistakes:</p><ul><li><b>Replacing defaults:</b> <code>configureMessageConverters</code> removes Jackson, and every JSON endpoint then fails with 406 or 415. Use <code>extendMessageConverters</code>.</li><li><b>Wrong media type:</b> the converter declares <code>text/csv</code> but the client sends <code>*/*</code> with a different producer first.</li><li><b>Closing the stream:</b> do not close the output body yourself; Spring does it.</li><li><b>Charset:</b> always write with an explicit UTF-8 charset.</li><li><b>Generic type erasure:</b> use the generic converter base for <code>List&lt;User&gt;</code>.</li></ul>`,
            r`// WRONG: drops Jackson, so JSON endpoints break
@Override
public void configureMessageConverters(List<HttpMessageConverter<?>> c) {
    c.add(new UserCsvConverter());
}
// RIGHT: keep the defaults and add one
@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> c) {
    c.add(0, new UserCsvConverter());
}

// OUTPUT:
// WRONG: GET /users (Accept: application/json) -> 406 Not Acceptable
// RIGHT: JSON and CSV both work`],
        [`<p>Performance and tuning:</p><ul><li><b>Stream</b> large bodies with a <code>Writer</code> in small chunks; do not build one big String.</li><li><b>Reuse</b> thread-safe parsers (such as an <code>ObjectMapper</code>) instead of creating them per call.</li><li><b>Order</b> frequent converters early; each <code>canWrite</code> call is cheap but it runs for every request.</li><li><b>Compression:</b> enable <code>server.compression.enabled</code> for text formats.</li></ul>`,
            r`@Override
protected void writeInternal(List<User> users, HttpOutputMessage out)
        throws IOException {
    try (var w = new BufferedWriter(
            new OutputStreamWriter(out.getBody(), StandardCharsets.UTF_8), 8192)) {
        for (User u : users) {
            w.write(u.id() + "," + u.name());
            w.newLine();                       // chunked writes, constant memory
        }
    }
}

# OUTPUT:
# 100000 rows exported with a heap that stays flat (varies by machine)`],
        [`<p>Real-world scenario: a partner system posts orders as a signed vendor type <code>application/vnd.acme.order+json</code>. A converter verifies the signature header, then delegates to Jackson.</p><ul><li><b>Declare</b> the media type on the converter.</li><li><b>Verify</b> before parsing and throw <code>HttpMessageNotReadableException</code> on failure.</li><li><b>Map</b> the exception to 400 in a <code>@ControllerAdvice</code>.</li></ul>`,
            r`public class SignedOrderConverter extends AbstractHttpMessageConverter<Order> {
    private final ObjectMapper mapper;
    private final SignatureVerifier verifier;
    public SignedOrderConverter(ObjectMapper m, SignatureVerifier v) {
        super(MediaType.valueOf("application/vnd.acme.order+json"));
        this.mapper = m;
        this.verifier = v;
    }
    protected boolean supports(Class<?> c) { return Order.class.equals(c); }
    protected Order readInternal(Class<? extends Order> c, HttpInputMessage in)
            throws IOException {
        byte[] body = in.getBody().readAllBytes();
        if (!verifier.valid(in.getHeaders().getFirst("X-Signature"), body))
            throw new HttpMessageNotReadableException("bad signature", in);
        return mapper.readValue(body, Order.class);
    }
    protected void writeInternal(Order o, HttpOutputMessage out) throws IOException {
        mapper.writeValue(out.getBody(), o);
    }
}

// OUTPUT:
// valid signature -> 201 Created; tampered body -> 400 Bad Request`]
    ),

    'mvc-custom-annotation': dv(
        [`<p>How Spring reads your annotation:</p><ul><li><b>Compile:</b> the annotation is stored in the class file when retention allows.</li><li><b>Discovery:</b> reflection on <code>Method</code> or <code>MethodParameter</code>; Spring uses <code>MergedAnnotations</code> for meta-annotation and alias support.</li><li><b>Parameter:</b> <code>HandlerMethodArgumentResolverComposite</code> asks each resolver <code>supportsParameter</code> and caches the answer per parameter.</li><li><b>Method:</b> <code>HandlerInterceptor</code> or an AOP pointcut such as <code>@annotation(Audited)</code>.</li></ul>`,
            r`Method m = OrderController.class.getMethod("create", Order.class);
Audited a = AnnotatedElementUtils.findMergedAnnotation(m, Audited.class);
System.out.println(a == null ? "none" : a.action());

// OUTPUT:
// CREATE_ORDER`],
        [`<p>Options for an annotation definition:</p><ul><li><b>@Target:</b> TYPE, METHOD, PARAMETER, FIELD or ANNOTATION_TYPE.</li><li><b>@Retention:</b> SOURCE, CLASS (default) or RUNTIME.</li><li><b>@Documented</b> and <b>@Inherited</b> for docs and class inheritance.</li><li><b>Attributes</b> with defaults; <code>@AliasFor</code> links attributes.</li><li><b>Constraint annotation:</b> <code>@Constraint(validatedBy = ...)</code> with <code>message</code>, <code>groups</code> and <code>payload</code>.</li></ul>`,
            r`@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "invalid phone number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<Phone, String> {
    public boolean isValid(String v, ConstraintValidatorContext c) {
        return v == null || v.matches("\\d{10}");
    }
}

// OUTPUT:
// @Phone String mobile = "12ab" -> 400 with message "invalid phone number"`],
        [`<p>Common mistakes:</p><ul><li><b>Default retention:</b> forgetting <code>RUNTIME</code> makes reflection return null.</li><li><b>Wrong target:</b> the compiler rejects the placement.</li><li><b>Resolver not registered:</b> parameter stays null or the request fails with a binding error.</li><li><b>Interface annotations:</b> plain <code>getAnnotation</code> does not see them on the implementation; use <code>AnnotatedElementUtils</code>.</li><li><b>Self-invocation:</b> an AOP-based annotation does not fire for calls inside the same class.</li></ul>`,
            r`// WRONG: default CLASS retention, invisible at runtime
public @interface Audited { String action(); }

// RIGHT
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Audited { String action(); }

// OUTPUT:
// WRONG: method.getAnnotation(Audited.class) -> null
// RIGHT: returns the annotation instance`],
        [`<p>Performance and tuning:</p><ul><li><b>Reflection cost:</b> look the annotation up once at startup and cache it, not on every request.</li><li><b>Spring caches</b> merged annotation results in <code>MergedAnnotations</code>, so prefer its utilities over raw loops.</li><li><b>Pointcut precision:</b> a narrow <code>@annotation</code> pointcut avoids proxying unneeded beans.</li></ul>`,
            r`@Component
class AuditRegistry {
    private final Map<Method, Audited> cache = new ConcurrentHashMap<>();
    Audited find(Method m) {
        return cache.computeIfAbsent(m,
            k -> AnnotatedElementUtils.findMergedAnnotation(k, Audited.class));
    }
}

# OUTPUT:
# annotation lookup done once per method;
later calls are a map read`],
        [`<p>Real-world scenario: audit logging for sensitive endpoints with <code>@Audited(action = ...)</code>. An aspect writes who did what after the method succeeds.</p><ul><li><b>Marker</b> on the controller method.</li><li><b>Aspect</b> reads the annotation and the current user.</li><li><b>Test</b> verifies one audit row per call.</li></ul>`,
            r`@Aspect @Component
class AuditAspect {
    private final AuditLog log;
    AuditAspect(AuditLog log) { this.log = log; }

    @AfterReturning("@annotation(audited)")
    void record(JoinPoint jp, Audited audited) {
        log.write(audited.action(), jp.getSignature().getName());
    }
}

@PostMapping("/orders")
@Audited(action = "CREATE_ORDER")
Order create(@RequestBody Order o) { return service.save(o); }

// OUTPUT:
// audit: CREATE_ORDER by create() at 2026-10-09T10:15 (varies)`]
    ),

    'mvc-request-lifecycle-customization': dv(
        [`<p>The path of a request inside Spring MVC:</p><ul><li><b>Container:</b> servlet filters run first, as a chain.</li><li><b>doDispatch:</b> <code>DispatcherServlet</code> finds a <code>HandlerExecutionChain</code> (handler plus interceptors).</li><li><b>preHandle</b> of each interceptor, then <code>HandlerAdapter.handle</code>.</li><li><b>Handler:</b> argument resolvers, the method, return value handlers, message converters.</li><li><b>postHandle</b> in reverse order, view rendering, then <code>afterCompletion</code>.</li><li><b>Exceptions</b> go to <code>HandlerExceptionResolver</code> beans, including <code>@ExceptionHandler</code>.</li></ul>`,
            r`// Simplified DispatcherServlet.doDispatch
HandlerExecutionChain chain = getHandler(request);
HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
if (!chain.applyPreHandle(request, response)) return;
ModelAndView mv = ha.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
processDispatchResult(request, response, chain, mv, ex);   // afterCompletion

// OUTPUT:
// preHandle(1,2) -> handler -> postHandle(2,1) -> afterCompletion(2,1)`],
        [`<p>Where to customize:</p><ul><li><b>OncePerRequestFilter:</b> runs once per request, even with forwards; add it as a bean or with <code>FilterRegistrationBean</code>.</li><li><b>HandlerInterceptor:</b> path patterns and ordering via <code>InterceptorRegistry</code>.</li><li><b>@ControllerAdvice:</b> global error and binding rules.</li><li><b>Request and Response BodyAdvice:</b> adjust the body around conversion.</li><li><b>HandlerMethodArgumentResolver and ReturnValueHandler:</b> new parameter or return types.</li></ul>`,
            r`@Component
public class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        String id = UUID.randomUUID().toString();
        MDC.put("requestId", id);
        res.setHeader("X-Request-Id", id);
        try { chain.doFilter(req, res); } finally { MDC.clear(); }
    }
}

// OUTPUT:
// Response header X-Request-Id: 7c1f... (varies); every log line carries requestId`],
        [`<p>Common mistakes:</p><ul><li><b>preHandle returns false without a response:</b> the client gets an empty 200.</li><li><b>Using an interceptor for CORS or raw body:</b> the body can be read only once; wrap the request in a filter.</li><li><b>Missing cleanup:</b> thread locals or MDC not cleared leak into the next request on the same thread.</li><li><b>Wrong order:</b> a security check placed after a logging interceptor that needs the user.</li><li><b>Path patterns:</b> forgetting <code>/**</code> so nested paths are skipped.</li></ul>`,
            r`// WRONG: stops the chain with no response
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    return q.getHeader("X-Key") != null;
}
// RIGHT: write the error when rejecting
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    if (q.getHeader("X-Key") == null) {
        s.sendError(HttpServletResponse.SC_UNAUTHORIZED, "missing key");
        return false;
    }
    return true;
}

// OUTPUT:
// WRONG: 200 with empty body
// RIGHT: 401 Unauthorized`],
        [`<p>Performance and tuning:</p><ul><li><b>Scope</b> interceptors with path patterns so cheap endpoints skip them.</li><li><b>Keep hooks fast:</b> no blocking calls in <code>preHandle</code>.</li><li><b>Avoid body copies:</b> caching wrappers double memory; limit their size.</li><li><b>Metrics:</b> use Micrometer observation instead of hand-made timing.</li></ul>`,
            r`reg.addInterceptor(new TimingInterceptor())
   .addPathPatterns("/api/**")            // only API paths pay the cost
   .excludePathPatterns("/api/health", "/api/ping");

# OUTPUT:
# health checks bypass the interceptor entirely`],
        [`<p>Real-world scenario: a multi-tenant API reads the tenant from a header, stores it for the request, and cleans it up. Filter or interceptor sets it, services read it, and the cleanup always runs.</p><ul><li><b>Interceptor</b> sets the tenant in <code>preHandle</code>.</li><li><b>afterCompletion</b> clears it, also on errors.</li><li><b>Test</b> sends the header with MockMvc.</li></ul>`,
            r`public class TenantInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
            Object h) throws IOException {
        String t = req.getHeader("X-Tenant");
        if (t == null) {
            res.sendError(400, "tenant required");
            return false;
        }
        TenantContext.set(t);
        return true;
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
            Object h, Exception ex) { TenantContext.clear(); }
}

mvc.perform(get("/api/orders").header("X-Tenant", "acme"))
   .andExpect(status().isOk());

// OUTPUT:
// with header -> 200; without header -> 400 tenant required`]
    ),

    'mvc-front-controller-pattern-patterns': dv(
        [`<p>How DispatcherServlet works inside:</p><ul><li><b>Init:</b> <code>initStrategies</code> loads the strategy beans: mappings, adapters, resolvers, exception resolvers.</li><li><b>Request:</b> <code>FrameworkServlet.service</code> builds the context, then <code>doDispatch</code>.</li><li><b>Lookup:</b> the first <code>HandlerMapping</code> returning a chain wins; <code>RequestMappingHandlerMapping</code> handles <code>@RequestMapping</code>.</li><li><b>Invoke:</b> <code>RequestMappingHandlerAdapter</code> calls the method.</li><li><b>Boot:</b> <code>DispatcherServletRegistrationBean</code> maps it to <code>/</code>.</li></ul>`,
            r`// Simplified idea of strategy lookup in DispatcherServlet
protected HandlerExecutionChain getHandler(HttpServletRequest request)
        throws Exception {
    for (HandlerMapping mapping : this.handlerMappings) {
        HandlerExecutionChain chain = mapping.getHandler(request);
        if (chain != null) return chain;       // first match wins
    }
    return null;                                // leads to 404
}

// OUTPUT:
// /orders -> RequestMappingHandlerMapping; /static/a.css -> resource handler mapping`],
        [`<p>Configuration options:</p><ul><li><b>spring.mvc.servlet.path:</b> prefix for the dispatcher.</li><li><b>spring.mvc.throw-exception-if-no-handler-found:</b> turn 404 into an exception for a global handler.</li><li><b>spring.mvc.async.request-timeout</b> for async requests.</li><li><b>load-on-startup:</b> <code>spring.mvc.servlet.load-on-startup</code> to create it at boot.</li><li><b>Extra dispatcher:</b> register a second <code>DispatcherServlet</code> with its own context.</li></ul>`,
            r`# application.properties
spring.mvc.servlet.path=/api
spring.mvc.servlet.load-on-startup=1
spring.mvc.throw-exception-if-no-handler-found=true
spring.web.resources.add-mappings=false

# OUTPUT:
# GET /api/orders is served;
GET /api/nothing -> NoHandlerFoundException -> 404 JSON`],
        [`<p>Common mistakes:</p><ul><li><b>Mapping the servlet to /*:</b> JSPs and static files stop working because they are also routed to it.</li><li><b>Handler in the wrong package:</b> not component scanned, so 404.</li><li><b>Two contexts:</b> beans defined in the child context are invisible to filters in the root.</li><li><b>Doing cross-cutting work in each controller</b> instead of a filter or advice.</li></ul>`,
            r`// WRONG: controller outside the scanned packages
package org.other;              // main class is in com.example.app
@RestController class Hidden {
    @GetMapping("/h") String h() { return "x"; }
}

// RIGHT: move it under com.example.app, or
@SpringBootApplication(scanBasePackages = {"com.example", "org.other"})

// OUTPUT:
// WRONG: GET /h -> 404
// RIGHT: GET /h -> x`],
        [`<p>Performance and tuning:</p><ul><li><b>Path matching:</b> Boot uses <code>PathPatternParser</code>, which is faster than the old Ant matcher.</li><li><b>Mapping lookup</b> for exact paths is a hash lookup; pattern paths are a trie-like match.</li><li><b>Keep the chain short:</b> every interceptor and filter adds time to each request.</li><li><b>Static files</b> are better served by a CDN or a web server.</li></ul>`,
            r`# application.properties
spring.mvc.pathmatch.matching-strategy=path_pattern_parser
server.tomcat.threads.max=200
spring.web.resources.cache.cachecontrol.max-age=7d

# OUTPUT:
# faster mapping, tuned thread pool, browser-cached static resources`],
        [`<p>Real-world scenario: an app serves a web UI and a REST API; operations wants all API calls logged and errors in JSON. Because everything passes the front controller, one filter and one <code>@RestControllerAdvice</code> cover every endpoint.</p>`,
            r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<Map<String, String>> notFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
}

// OUTPUT:
// GET /api/orders/99 -> 404 {"error":"order 99 not found"}`]
    ),

    'mvc-mvc-pattern': dv(
        [`<p>How Spring MVC realizes the pattern:</p><ul><li><b>Controller:</b> found by <code>RequestMappingHandlerMapping</code>, invoked by <code>RequestMappingHandlerAdapter</code>.</li><li><b>Model:</b> a <code>ModelMap</code> inside <code>ModelAndViewContainer</code>, plus your domain and service objects.</li><li><b>View:</b> a view name goes to <code>ContentNegotiatingViewResolver</code> and the template engine.</li><li><b>REST:</b> the return value handler writes the body directly and skips the view.</li></ul>`,
            r`@Controller
class HomeController {
    @GetMapping("/")
    ModelAndView home() {
        ModelAndView mv = new ModelAndView("home");   // view name
        mv.addObject("title", "Welcome");              // model data
        return mv;
    }
}

// OUTPUT:
// ViewResolver maps "home" -> templates/home.html; model title = Welcome`],
        [`<p>Variants and options:</p><ul><li><b>Return types:</b> <code>String</code> view name, <code>ModelAndView</code>, <code>void</code>, <code>ResponseEntity</code>.</li><li><b>Redirect:</b> <code>redirect:/path</code>, with <code>RedirectAttributes</code> for flash data.</li><li><b>Forward:</b> <code>forward:/path</code>.</li><li><b>@ModelAttribute:</b> shared model data and form binding.</li><li><b>Form flow:</b> GET shows the form, POST validates and redirects (Post-Redirect-Get).</li></ul>`,
            r`@PostMapping("/products")
String create(@Valid @ModelAttribute ProductForm form, BindingResult br,
        RedirectAttributes ra) {
    if (br.hasErrors()) return "product-form";          // redisplay with errors
    service.save(form);
    ra.addFlashAttribute("msg", "Saved");
    return "redirect:/products";                         // Post-Redirect-Get
}

// OUTPUT:
// valid form -> 302 to /products with flash message; invalid -> form page again`],
        [`<p>Common mistakes:</p><ul><li><b>Fat controller:</b> business rules and database calls inside the controller.</li><li><b>Entities in views:</b> lazy loading outside a transaction fails, and extra fields get exposed.</li><li><b>No redirect after POST:</b> a refresh submits the form again.</li><li><b>Using @Controller for JSON</b> without <code>@ResponseBody</code>, so Spring looks for a view.</li></ul>`,
            r`// WRONG: logic and persistence in the controller
@PostMapping("/pay")
String pay(@RequestParam int amount) {
    if (amount > 1000) { /* rules */ }
    jdbc.update("insert into pay values (?)", amount);
    return "ok";
}
// RIGHT: delegate
@PostMapping("/pay")
String pay(@RequestParam int amount) {
    paymentService.pay(amount);
    return "ok";
}

// OUTPUT:
// the same URL works, but the rule is now testable without the web layer`],
        [`<p>Performance and tuning:</p><ul><li><b>Template cache:</b> keep <code>spring.thymeleaf.cache=true</code> in production.</li><li><b>Open session in view:</b> consider <code>spring.jpa.open-in-view=false</code> and fetch what the view needs in the service.</li><li><b>Pagination</b> of large lists in the model.</li><li><b>HTTP caching</b> headers for rarely changing pages.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.jpa.open-in-view=false
server.compression.enabled=true

# OUTPUT:
# templates compiled once, no hidden queries during rendering, smaller responses`],
        [`<p>Real-world scenario: an admin product page. The controller loads one page of products through a service, maps them to view DTOs and returns a view; a REST endpoint reuses the same service for a mobile app.</p><ul><li><b>Service</b> is shared by both controllers.</li><li><b>Test</b> checks view name and model.</li></ul>`,
            r`@GetMapping("/admin/products")
String list(@RequestParam(defaultValue = "0") int page, Model model) {
    Page<ProductView> p = service.page(PageRequest.of(page, 20));
    model.addAttribute("page", p);
    return "admin/products";
}

@GetMapping("/api/products")
@ResponseBody
Page<ProductView> api(Pageable pageable) { return service.page(pageable); }

// OUTPUT:
// HTML table of 20 rows at /admin/products; the same data as JSON at /api/products`]
    ),

    'mvc-dependency-injection': dv(
        [`<p>How injection happens:</p><ul><li><b>Definitions:</b> component scanning registers a <code>BeanDefinition</code> per class.</li><li><b>Creation:</b> <code>AbstractAutowireCapableBeanFactory.createBean</code> picks a constructor; <code>ConstructorResolver</code> resolves each argument.</li><li><b>Field and setter:</b> <code>AutowiredAnnotationBeanPostProcessor</code> injects after instantiation.</li><li><b>Candidates:</b> by type, then <code>@Primary</code>, <code>@Qualifier</code>, then parameter name.</li><li><b>Proxies</b> are applied after initialization.</li></ul>`,
            r`@Component
class Mailer {
    private final Sender sender;
    private final Optional<Tracker> tracker;
    Mailer(Sender sender, ObjectProvider<Tracker> tracker) {
        this.sender = sender;                       // required
        this.tracker = tracker.stream().findFirst(); // optional
    }
}

// OUTPUT:
// startup fails with NoSuchBeanDefinitionException if no Sender bean exists;
// a missing Tracker is fine`],
        [`<p>Injection forms:</p><ul><li><b>Constructor</b> (recommended), <b>setter</b> for optional parts, <b>field</b> only in tests.</li><li><b>Collections:</b> <code>List&lt;T&gt;</code>, <code>Map&lt;String, T&gt;</code>, <code>Set&lt;T&gt;</code>.</li><li><b>@Value:</b> property values; <b>@ConfigurationProperties</b> for groups of properties.</li><li><b>@Resource and @Inject</b> are standard alternatives.</li><li><b>@Lazy</b> on a parameter injects a lazy proxy.</li></ul>`,
            r`@Component
@ConfigurationProperties(prefix = "mail")
class MailProps {
    private String host;
    private int port = 25;
    public String getHost() { return host; }
    public void setHost(String h) { host = h; }
    public int getPort() { return port; }
    public void setPort(int p) { port = p; }
}

# application.properties
# mail.host=smtp.example.com
# mail.port=587

// OUTPUT:
// MailProps(host=smtp.example.com, port=587)`],
        [`<p>Common mistakes:</p><ul><li><b>new inside a bean:</b> <code>new OrderService()</code> gives an object with no injected fields.</li><li><b>Two candidates:</b> missing <code>@Primary</code> or <code>@Qualifier</code>.</li><li><b>Constructor cycles:</b> A needs B and B needs A; redesign or extract a third bean.</li><li><b>Field injection of a final field</b> is impossible; use the constructor.</li><li><b>Injecting a request-scoped bean</b> into a singleton without a proxy.</li></ul>`,
            r`// WRONG
@RestController
class Api {
    private final OrderService service = new OrderService();   // no injection
}
// RIGHT
@RestController
class Api {
    private final OrderService service;
    Api(OrderService service) { this.service = service; }
}

// OUTPUT:
// WRONG: NullPointerException on service.repository
// RIGHT: fully wired service`],
        [`<p>Performance and tuning:</p><ul><li><b>Startup:</b> many beans cost startup time; use <code>@Lazy</code> sparingly or Spring AOT for native images.</li><li><b>Collection injection</b> is resolved once at startup, so it is free at runtime.</li><li><b>Prototype lookups</b> in hot paths create objects every time; measure first.</li></ul>`,
            r`# application.properties
spring.main.lazy-initialization=true     # faster startup, errors appear later
logging.level.org.springframework.beans=DEBUG   # see wiring while debugging

# OUTPUT:
# startup time drops (varies);
wiring failures show on first use`],
        [`<p>Real-world scenario: a payment module has Card and UPI gateways. The checkout service receives all gateways as a map and picks one by customer choice, and tests plug in a fake gateway.</p>`,
            r`@Service
class Checkout {
    private final Map<String, PaymentGateway> gateways;
    Checkout(Map<String, PaymentGateway> gateways) { this.gateways = gateways; }
    String pay(String method, int amount) {
        PaymentGateway g = gateways.get(method);
        if (g == null) throw new IllegalArgumentException("unknown method " + method);
        return g.charge(amount);
    }
}

// OUTPUT:
// pay("upi", 250) -> charged 250 via UPI`]
    ),

    'mvc-ioc': dv(
        [`<p>Container startup in steps:</p><ul><li><b>1:</b> read configuration and scan components into <code>BeanDefinition</code> objects.</li><li><b>2:</b> run <code>BeanFactoryPostProcessor</code> beans, for example property placeholder resolution.</li><li><b>3:</b> register <code>BeanPostProcessor</code> beans.</li><li><b>4:</b> create singletons: instantiate, inject, call Aware callbacks, <code>postProcessBeforeInitialization</code>, init methods, <code>postProcessAfterInitialization</code> (proxies).</li><li><b>5:</b> publish <code>ContextRefreshedEvent</code>.</li></ul>`,
            r`@Component
class TraceProcessor implements BeanPostProcessor {
    public Object postProcessAfterInitialization(Object bean, String name) {
        if (name.endsWith("Service")) System.out.println("ready: " + name);
        return bean;
    }
}

// OUTPUT:
// ready: orderService
// ready: paymentService`],
        [`<p>Configuration styles:</p><ul><li><b>Stereotypes:</b> <code>@Component</code>, <code>@Service</code>, <code>@Repository</code>, <code>@Controller</code>.</li><li><b>Java config:</b> <code>@Configuration</code> with <code>@Bean</code> for third-party classes.</li><li><b>Conditions:</b> <code>@Profile</code>, <code>@ConditionalOnProperty</code>.</li><li><b>Imports:</b> <code>@Import</code> and Boot auto configuration.</li><li><b>Events:</b> <code>ApplicationEventPublisher</code> and <code>@EventListener</code>.</li></ul>`,
            r`@Configuration
class InfraConfig {
    @Bean
    @Profile("dev")
    DataSource devDb() { return new EmbeddedDatabaseBuilder().build(); }

    @Bean
    @ConditionalOnProperty(name = "feature.cache", havingValue = "true")
    CacheManager cache() { return new ConcurrentMapCacheManager(); }
}

// OUTPUT:
// dev profile: embedded DB bean exists; cache bean only if feature.cache=true`],
        [`<p>Common mistakes:</p><ul><li><b>Creating objects with new</b> and expecting injection.</li><li><b>Missing scan:</b> class outside the base package of <code>@SpringBootApplication</code>.</li><li><b>Missing @Configuration</b> on a class with <code>@Bean</code> methods ("lite" mode, no inter-bean proxy).</li><li><b>Heavy work in constructors</b> that slows startup or fails the whole context.</li><li><b>Using ApplicationContext.getBean everywhere</b> (service locator) instead of injection.</li></ul>`,
            r`// WRONG: service locator hides the dependency
class Report {
    String run() { return ctx.getBean(Printer.class).print("x"); }
}
// RIGHT: declare it
class Report {
    private final Printer printer;
    Report(Printer printer) { this.printer = printer; }
    String run() { return printer.print("x"); }
}

// OUTPUT:
// RIGHT: dependencies are visible in the constructor and easy to fake`],
        [`<p>Performance and tuning:</p><ul><li><b>Startup:</b> narrow component scanning, exclude unused auto configurations.</li><li><b>Lazy init</b> for rarely used beans.</li><li><b>Spring AOT and native image</b> move work from startup to build time.</li><li><b>Diagnostics:</b> <code>--debug</code> prints the auto configuration report.</li></ul>`,
            r`# application.properties
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration
spring.jmx.enabled=false

# OUTPUT:
# fewer beans created, startup a little faster (varies)`],
        [`<p>Real-world scenario: swapping an email provider per environment. Production uses SMTP, tests use a recording fake. No business code changes, because IoC wires the implementation by profile.</p>`,
            r`interface MailSender { void send(String to, String body); }

@Service @Profile("prod")
class SmtpMailSender implements MailSender {
    public void send(String to, String body) { /* real SMTP */ }
}

@Service @Profile("test")
class RecordingMailSender implements MailSender {
    final List<String> sent = new ArrayList<>();
    public void send(String to, String body) { sent.add(to); }
}

// OUTPUT:
// profile prod -> SmtpMailSender is injected; profile test -> RecordingMailSender`]
    ),

    'mvc-singleton': dv(
        [`<p>How singletons work:</p><ul><li><b>GoF:</b> a private constructor and one static field per class loader.</li><li><b>Spring:</b> <code>DefaultSingletonBeanRegistry.singletonObjects</code>, a <code>ConcurrentHashMap</code> from bean name to instance.</li><li><b>Cycles:</b> a three-level cache (<code>singletonObjects</code>, <code>earlySingletonObjects</code>, <code>singletonFactories</code>) lets setter or field cycles resolve.</li><li><b>Scope:</b> one per bean name per container, so two beans of the same class under different names are two instances.</li></ul>`,
            r`@Configuration
class TwoConfig {
    @Bean Clock first()  { return Clock.systemUTC(); }
    @Bean Clock second() { return Clock.systemUTC(); }
}
// ctx.getBean("first") == ctx.getBean("first")   -> true
// ctx.getBean("first") == ctx.getBean("second")  -> false

// OUTPUT:
// true
// false`],
        [`<p>Implementation options:</p><ul><li><b>Eager static field:</b> simple, created at class load.</li><li><b>Holder idiom:</b> lazy and thread safe.</li><li><b>Enum:</b> safe against reflection and serialization.</li><li><b>Double-checked locking</b> with a <code>volatile</code> field.</li><li><b>Spring:</b> <code>@Scope("singleton")</code>, usually left implicit.</li></ul>`,
            r`final class Lazy {
    private static volatile Lazy instance;
    private Lazy() { }
    static Lazy get() {
        Lazy local = instance;
        if (local == null) {
            synchronized (Lazy.class) {
                local = instance;
                if (local == null) instance = local = new Lazy();
            }
        }
        return local;
    }
}

// OUTPUT:
// Lazy.get() == Lazy.get()  -> true, created once even under many threads`],
        [`<p>Common mistakes:</p><ul><li><b>Mutable state in a singleton bean:</b> a field like <code>currentUser</code> in a service is shared by all requests.</li><li><b>Non-volatile double-checked locking.</b></li><li><b>Non-thread-safe types</b> such as <code>SimpleDateFormat</code> or <code>HashMap</code> as shared fields.</li><li><b>Hidden global state</b> makes tests depend on each other.</li></ul>`,
            r`// WRONG: shared request data in a singleton
@Service
class ProfileService {
    private User current;                       // overwritten by other threads
    String name(User u) {
        current = u;
        return current.name();
    }
}
// RIGHT: keep data in locals
@Service
class ProfileService {
    String name(User u) { return u.name(); }
}

// OUTPUT:
// WRONG: users sometimes see another user's name
// RIGHT: stateless and safe`],
        [`<p>Performance and tuning:</p><ul><li><b>Cheap:</b> one instance means no allocation per request.</li><li><b>Contention:</b> avoid <code>synchronized</code> on hot singleton methods; use <code>AtomicLong</code>, <code>LongAdder</code> or concurrent collections.</li><li><b>Startup:</b> eager creation moves failures to startup, which is often what you want.</li></ul>`,
            r`@Component
class Stats {
    private final LongAdder hits = new LongAdder();   // low contention counter
    void hit() { hits.increment(); }
    long total() { return hits.sum(); }
}

# OUTPUT:
# 1,000,000 increments from 16 threads finish without lock waits (varies)`],
        [`<p>Real-world scenario: a rate limiter shared by all requests. It is a singleton by design, so its state must be thread safe.</p>`,
            r`@Component
class RateLimiter {
    private final ConcurrentHashMap<String, AtomicInteger> calls =
        new ConcurrentHashMap<>();
    boolean allow(String user) {
        return calls.computeIfAbsent(user, k -> new AtomicInteger())
                    .incrementAndGet() <= 100;
    }
    @Scheduled(fixedRate = 60_000) void reset() { calls.clear(); }
}

// OUTPUT:
// call 1..100 -> true; call 101 within the minute -> false`]
    ),

    'mvc-factory-pattern': dv(
        [`<p>How factories work in Spring:</p><ul><li><b>BeanFactory:</b> <code>DefaultListableBeanFactory</code> holds bean definitions and creates beans on request.</li><li><b>Factory method:</b> a definition can name a factory bean and method; <code>@Bean</code> methods compile to that.</li><li><b>FactoryBean:</b> <code>getBean(name)</code> returns <code>getObject()</code>, and <code>&amp;name</code> returns the factory.</li><li><b>@Configuration proxy:</b> CGLIB intercepts <code>@Bean</code> calls so singletons stay single.</li></ul>`,
            r`@Configuration
class Cfg {
    @Bean Engine engine() { return new Engine(); }
    @Bean Car car() { return new Car(engine()); }     // same Engine bean
    @Bean Bike bike() { return new Bike(engine()); }  // same Engine bean
}

// OUTPUT:
// car.engine() == bike.engine()  -> true (CGLIB proxy returns the singleton)`],
        [`<p>Factory variants:</p><ul><li><b>Static factory method:</b> <code>Money.of(5)</code>, <code>List.of()</code>.</li><li><b>Factory method:</b> an abstract <code>create()</code> overridden by subclasses.</li><li><b>Abstract factory:</b> related families, such as Windows or Linux widgets.</li><li><b>Spring:</b> <code>@Bean</code>, <code>FactoryBean</code>, <code>ObjectProvider</code>, <code>Supplier</code> beans.</li><li><b>Builder</b> is related but for step-by-step construction.</li></ul>`,
            r`enum Shape {
    CIRCLE, SQUARE;
    static Shape parse(String s) { return valueOf(s.toUpperCase()); }
}

interface Document { String render(); }
static Document create(String type) {
    return switch (type) {
        case "pdf"  -> () -> "PDF";
        case "html" -> () -> "HTML";
        default -> throw new IllegalArgumentException("unknown type " + type);
    };
}
System.out.println(create("pdf").render());

// OUTPUT:
// PDF`],
        [`<p>Common mistakes:</p><ul><li><b>Growing switch:</b> every new type edits the factory; use a map of beans.</li><li><b>Returning null</b> for unknown types instead of failing clearly.</li><li><b>Static factory with state</b> that cannot be mocked.</li><li><b>@Bean in a lite class:</b> calling one bean method from another creates a second instance.</li><li><b>Forgetting getObjectType</b> on a FactoryBean, so type-based injection misses it.</li></ul>`,
            r`// WRONG: @Component class, not @Configuration: two Engine objects
@Component
class Cfg {
    @Bean Engine engine() { return new Engine(); }
    @Bean Car car() { return new Car(engine()); }   // new, separate Engine
}
// RIGHT: use @Configuration, or take the bean as a parameter
@Bean Car car(Engine engine) { return new Car(engine); }

// OUTPUT:
// WRONG: car.engine() != the engine bean
// RIGHT: same instance`],
        [`<p>Performance and tuning:</p><ul><li><b>Map lookup</b> beats long switches and is open for extension.</li><li><b>Cache</b> expensive products; make the factory return shared immutable instances where possible.</li><li><b>Avoid reflection</b> in hot factories; prefer a map of suppliers.</li></ul>`,
            r`private final Map<String, Supplier<Parser>> parsers = Map.of(
    "json", JsonParser::new,
    "xml",  XmlParser::new);

Parser create(String type) {
    Supplier<Parser> s = parsers.get(type);
    if (s == null) throw new IllegalArgumentException("no parser for " + type);
    return s.get();
}

# OUTPUT:
# create("json") -> new JsonParser, one hash lookup, no reflection`],
        [`<p>Real-world scenario: a notification service sends email, SMS or push depending on user preference. The factory returns the right notifier, and new channels are added as new beans.</p>`,
            r`@Service
class NotificationService {
    private final Map<String, Notifier> byChannel;
    NotificationService(Map<String, Notifier> byChannel) { this.byChannel = byChannel; }

    void notify(User u, String msg) {
        Notifier n = byChannel.get(u.preferredChannel());
        if (n == null) throw new IllegalStateException("no channel " + u.preferredChannel());
        n.send(msg);
    }
}

// OUTPUT:
// user prefers "sms" -> SmsNotifier sends; new "push" bean is picked up automatically`]
    ),

    'mvc-strategy-pattern': dv(
        [`<p>Strategy inside Spring MVC:</p><ul><li><b>HandlerMapping:</b> finds the handler for a request.</li><li><b>HandlerAdapter:</b> <code>supports(handler)</code> then <code>handle</code>.</li><li><b>ViewResolver:</b> turns a view name into a <code>View</code>.</li><li><b>HttpMessageConverter:</b> <code>canRead</code> and <code>canWrite</code> then convert.</li><li><b>HandlerMethodArgumentResolver:</b> one resolver per parameter kind.</li><li>The DispatcherServlet is the context that loops over these strategies.</li></ul>`,
            r`// Simplified idea from DispatcherServlet
protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {
    for (HandlerAdapter adapter : this.handlerAdapters) {
        if (adapter.supports(handler)) return adapter;     // strategy selection
    }
    throw new ServletException("No adapter for handler [" + handler + "]");
}

// OUTPUT:
// @RequestMapping method -> RequestMappingHandlerAdapter;
// HttpRequestHandler -> HttpRequestHandlerAdapter`],
        [`<p>Ways to select a strategy:</p><ul><li><b>Key:</b> <code>Map&lt;String, S&gt;</code> using bean names.</li><li><b>Supports:</b> <code>List&lt;S&gt;</code> and ask each one.</li><li><b>Enum with behavior:</b> each constant implements the method.</li><li><b>Lambda:</b> functional interface passed as an argument.</li><li><b>Profile or property:</b> a conditional bean chooses one at startup.</li></ul>`,
            r`enum Shipping {
    STANDARD {
        int cost(int kg) { return 5 * kg; }
    },
    EXPRESS {
        int cost(int kg) { return 12 * kg; }
    };
    abstract int cost(int kg);
}
System.out.println(Shipping.EXPRESS.cost(3));

@Bean
@ConditionalOnProperty(name = "tax.mode", havingValue = "gst")
TaxStrategy gst() { return amount -> amount * 18 / 100; }

// OUTPUT:
// 36`],
        [`<p>Common mistakes:</p><ul><li><b>Big if-else</b> kept next to a strategy interface.</li><li><b>Unknown key</b> returns null and later throws NullPointerException; fail fast or use a default.</li><li><b>Overlapping supports</b> methods with no order, so results depend on bean order.</li><li><b>Strategies with shared mutable state</b> in singletons.</li><li><b>Too many tiny strategies</b> for a rule that never changes.</li></ul>`,
            r`// WRONG
if (type.equals("student")) return p * 80 / 100;
else if (type.equals("senior")) return p * 70 / 100;
else return p;
// RIGHT
return strategies.getOrDefault(type, strategies.get("none")).apply(p);

// OUTPUT:
// RIGHT: adding "veteran" is a new class only; the service is untouched`],
        [`<p>Performance and tuning:</p><ul><li><b>Map lookup</b> is constant time; a list scan is linear but tiny for a few strategies.</li><li><b>Build the map once</b> at startup, never per call.</li><li><b>Stateless strategies</b> can be singletons and shared by all threads.</li></ul>`,
            r`@Component
class StrategyRegistry {
    private final Map<String, Discount> byName;
    StrategyRegistry(List<Discount> all) {
        byName = all.stream().collect(Collectors.toUnmodifiableMap(
            Discount::name, Function.identity()));       // built once
    }
    Discount get(String n) { return byName.get(n); }
}

# OUTPUT:
# lookup per request is a single hash read`],
        [`<p>Real-world scenario: a pricing engine applies different rules per customer type and season. Each rule is a bean implementing <code>PricingRule</code>; the engine applies those that support the order, in <code>@Order</code>.</p>`,
            r`interface PricingRule {
    boolean supports(Order o);
    int adjust(Order o, int price);
}

@Service
class PricingEngine {
    private final List<PricingRule> rules;           // ordered by @Order
    PricingEngine(List<PricingRule> rules) { this.rules = rules; }
    int price(Order o) {
        int price = o.base();
        for (PricingRule r : rules) if (r.supports(o)) price = r.adjust(o, price);
        return price;
    }
}

// OUTPUT:
// base 1000, student rule -20%, festival rule -5% -> 760`]
    )
};
