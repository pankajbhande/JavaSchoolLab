// Spring extras, batch smvc02 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc02Extras: Record<string, Extra> = {
    'mvc-front-controller-pattern': x(
        ['<b>Front Controller</b> is a design pattern where ONE central component receives every request and then delegates to the right handler, instead of each URL having its own servlet.',
            '<b>Spring MVC</b> implements it with <code>DispatcherServlet</code>, which is the single entry point for all web requests mapped to it.',
            '<b>Benefit</b>: cross-cutting work such as security, locale, logging and error handling lives in one place instead of being repeated in every servlet.'],
        ['<b>Delegation</b>: the front controller does not contain business logic; it asks <code>HandlerMapping</code> for a handler and <code>HandlerAdapter</code> to call it.',
            '<b>Servlet mapping</b>: <code>/</code> sends nearly every URL to the front controller, while static files are served by the resource handler.',
            '<b>Contrast</b>: Page Controller means one controller per page; Front Controller means one gateway for all pages.'],
        ['<b>Extension points</b>: interceptors, argument resolvers, converters and exception resolvers are the hooks that customize the central flow.',
            '<b>Filters versus the front controller</b>: servlet filters run before the <code>DispatcherServlet</code>, interceptors run inside it and know the chosen handler.',
            '<b>Trade-off</b>: a single entry point is a single place to fail, so keep it thin and fast and push heavy work into services.'],
        [['F', 'What is the Front Controller pattern?', 'One central component receives all requests and dispatches them to handlers. In Spring MVC this is DispatcherServlet.'],
            ['F', 'Which class is the front controller in Spring MVC?', 'DispatcherServlet, which is a normal Jakarta servlet.'],
            ['M', 'Name two benefits of using a front controller.', 'Common concerns such as security, locale and error handling are in one place, and URL routing is configured declaratively with annotations.'],
            ['M', 'Where do filters and interceptors sit relative to it?', 'Filters run before DispatcherServlet in the servlet container. Interceptors run inside it, around the handler.'],
            ['S', 'Can an application have more than one DispatcherServlet?', 'Yes, for example one for the web UI and one for a REST API, each with its own child context and URL mapping.'],
            ['S', 'What is the downside of the pattern?', 'It is a central point that every request passes, so slow logic there hurts everything. Keep it thin.']],
        [['A minimal front controller idea in plain servlet code (what Spring does for you).',
            r`@WebServlet("/*")
public class MyFrontController extends HttpServlet {
    private final Map<String, Handler> routes = Map.of(
        "/hello", req -> "Hello",
        "/time", req -> LocalTime.now().toString());

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        Handler h = routes.get(req.getRequestURI());
        if (h == null) { res.sendError(404); return; }
        res.getWriter().print(h.handle(req));
    }
    interface Handler { String handle(HttpServletRequest r); }
}

// OUTPUT:
// GET /hello -> 200 Hello
// GET /nope  -> 404`],
            ['The Spring MVC version: the front controller is hidden, you only write handlers.',
                r`@RestController
class HelloController {
    @GetMapping("/hello")
    String hello() { return "Hello"; }
}

// OUTPUT:
// GET /hello -> 200 Hello
// (DispatcherServlet did the routing, no servlet code was written)`]],
        [['Prove every request passes the same gate with a logging filter and a MockMvc test.',
            r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void helloGoesThroughDispatcher() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(content().string("Hello"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Observe the dispatcher in the logs.',
                r`# application.properties
logging.level.org.springframework.web.servlet.DispatcherServlet=DEBUG

// OUTPUT:
// DEBUG DispatcherServlet : GET "/hello", parameters={}
// DEBUG DispatcherServlet : Completed 200 OK`]]
    ),
    'mvc-dispatcherservlet': x(
        ['<b>DispatcherServlet</b> is the central servlet of Spring MVC. It receives each HTTP request, finds the matching controller method and builds the response.',
            '<b>Entry point</b>: in Spring Boot it is registered automatically and mapped to <code>/</code>; you never write it yourself.',
            '<b>Helpers</b>: it coordinates <code>HandlerMapping</code>, <code>HandlerAdapter</code>, <code>ViewResolver</code> and exception resolvers; it does the routing, they do the work.'],
        ['<b>Flow</b>: request, find handler, run interceptors, invoke controller, resolve view or write body, return response.',
            '<b>Boot auto-configuration</b>: <code>DispatcherServletAutoConfiguration</code> creates the servlet and its registration bean.',
            '<b>Context</b>: it owns a WebApplicationContext that holds controllers and web beans, and it sees the root context beans too.'],
        ['<b>Customizing</b>: use <code>spring.mvc.servlet.path</code> or a <code>DispatcherServletRegistrationBean</code> to change the mapping.',
            '<b>Unmatched requests</b>: if no handler is found it returns 404; <code>throwExceptionIfNoHandlerFound</code> turns that into an exception you can handle.',
            '<b>Thread model</b>: it is a singleton servlet and each request runs on a container thread, so controllers must be stateless.'],
        [['F', 'What is DispatcherServlet?', 'The front controller servlet of Spring MVC that receives all requests and dispatches them to controllers.'],
            ['F', 'Do you create it in Spring Boot?', 'No, auto-configuration registers it and maps it to the root path.'],
            ['M', 'Which components does it delegate to?', 'HandlerMapping, HandlerAdapter, ViewResolver and HandlerExceptionResolver, among others.'],
            ['M', 'How do you change its URL mapping?', 'Set spring.mvc.servlet.path or define a DispatcherServletRegistrationBean.'],
            ['S', 'Is DispatcherServlet thread safe?', 'Yes, one instance serves many threads. Its helper beans and your controllers must also be stateless or thread safe.'],
            ['S', 'How is it different from a Filter?', 'A filter belongs to the servlet container and knows nothing about handlers. DispatcherServlet is the Spring layer and picks handlers.']],
        [['Read it from the context.',
            r`@SpringBootApplication
public class App {
    public static void main(String[] args) {
        var ctx = SpringApplication.run(App.class, args);
        var ds = ctx.getBean(DispatcherServlet.class);
        System.out.println(ds.getClass().getSimpleName());
    }
}

// OUTPUT:
// DispatcherServlet`],
            ['Change the servlet path.',
                r`# application.properties
spring.mvc.servlet.path=/api

// OUTPUT:
// A controller method @GetMapping("/users") now answers GET /api/users`]],
        [['MockMvc is built around a DispatcherServlet.',
            r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test
    void unknownUrlIs404() throws Exception {
        mvc.perform(get("/missing")).andExpect(status().isNotFound());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Return 404 as an exception.',
                r`# application.properties
spring.mvc.throw-exception-if-no-handler-found=true
spring.web.resources.add-mappings=false

// OUTPUT:
// Unknown URLs now raise NoHandlerFoundException, handled by @ControllerAdvice`]]
    ),
    'mvc-what-is-dispatcherservlet': x(
        ['<b>DispatcherServlet</b> is a class that extends <code>HttpServlet</code> through <code>FrameworkServlet</code>; it is the one servlet that receives web requests in a Spring MVC application.',
            '<b>Purpose</b>: it finds which controller method should handle a request, calls it and turns the result into an HTTP response.',
            '<b>Why needed</b>: without it you would write one servlet per URL and parse parameters, convert data and render pages yourself.'],
        ['<b>What it does</b>: map the URL to a handler, bind request data, call the method, then render a view or write JSON.',
            '<b>What it does not do</b>: it holds no business logic; services and repositories do that.',
            '<b>Spring Boot</b>: embedded Tomcat starts, the servlet is registered, and you only add <code>@RestController</code> classes.'],
        ['<b>Class chain</b>: <code>HttpServlet</code>, <code>HttpServletBean</code>, <code>FrameworkServlet</code>, <code>DispatcherServlet</code>.',
            '<b>doDispatch</b> is the method that holds the real algorithm; everything else prepares the request for it.',
            '<b>Strategy beans</b>: its behaviour is pluggable, because each step is a strategy interface loaded from the context.'],
        [['F', 'What does DispatcherServlet do?', 'It receives HTTP requests and routes them to the correct controller method, then produces the response.'],
            ['F', 'Is it a servlet?', 'Yes, it indirectly extends HttpServlet.'],
            ['M', 'Which method contains the main algorithm?', 'doDispatch, called from doService.'],
            ['M', 'Where does it get its helper strategies?', 'From the WebApplicationContext, with defaults in DispatcherServlet.properties if no bean is defined.'],
            ['S', 'What is FrameworkServlet for?', 'It creates and manages the WebApplicationContext and publishes request handled events.'],
            ['S', 'What happens to a request with no handler?', 'noHandlerFound sends 404, or throws NoHandlerFoundException if configured.']],
        [['The smallest working application.',
            r`@SpringBootApplication
@RestController
public class Demo {
    public static void main(String[] a) { SpringApplication.run(Demo.class, a); }

    @GetMapping("/ping")
    String ping() { return "pong"; }
}

// OUTPUT:
// GET /ping -> 200 pong`],
            ['See the class hierarchy.',
                r`Class<?> c = DispatcherServlet.class;
while (c != null) {
    System.out.println(c.getSimpleName());
    c = c.getSuperclass();
}

// OUTPUT:
// DispatcherServlet
// FrameworkServlet
// HttpServletBean
// HttpServlet
// GenericServlet
// Object`]],
        [['Test that the servlet routes a request.',
            r`@WebMvcTest(Demo.class)
class DemoTest {
    @Autowired MockMvc mvc;

    @Test
    void ping() throws Exception {
        mvc.perform(get("/ping")).andExpect(content().string("pong"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Check the registered servlet in a SpringBootTest.',
                r`@SpringBootTest
class RegistrationTest {
    @Autowired ServletContext sc;

    @Test
    void registered() {
        System.out.println(sc.getServletRegistrations().keySet());
    }
}

// OUTPUT: (embedded server needed, varies)
// [dispatcherServlet]`]]
    ),
    'mvc-dispatcherservlet-architecture': x(
        ['<b>Architecture</b>: DispatcherServlet is a coordinator that delegates each job to a strategy interface instead of doing the job itself.',
            '<b>Strategy beans</b>: <code>HandlerMapping</code>, <code>HandlerAdapter</code>, <code>HandlerExceptionResolver</code>, <code>ViewResolver</code>, <code>LocaleResolver</code> and <code>MultipartResolver</code>.',
            '<b>Two contexts</b>: a root context for services and repositories, and a web context for controllers; the web context is the child.'],
        ['<b>Defaults</b>: if you define no bean of a strategy type, Spring uses defaults from <code>DispatcherServlet.properties</code>.',
            '<b>Boot</b> uses one context, but the logical split of web beans and service beans still holds.',
            '<b>Extending</b>: add a bean of the strategy type, or implement <code>WebMvcConfigurer</code> to adjust the standard ones.'],
        ['<b>initStrategies</b> runs once at startup after the context refreshes and looks up each strategy bean by type.',
            '<b>Ordering</b>: multiple HandlerMappings and resolvers are sorted by <code>Ordered</code>; the first that returns a result wins.',
            '<b>Replace with care</b>: defining your own <code>HandlerMapping</code> bean in Boot can switch off defaults, so prefer <code>WebMvcConfigurer</code>.'],
        [['F', 'What are the main parts of the architecture?', 'DispatcherServlet plus strategy beans such as HandlerMapping, HandlerAdapter, ViewResolver and exception resolvers.'],
            ['F', 'Where do controllers live?', 'In the web (child) application context.'],
            ['M', 'What are the two contexts?', 'A root context with services and data beans, and a servlet context with web beans. The child can see the parent.'],
            ['M', 'What if no ViewResolver bean exists?', 'The default InternalResourceViewResolver from DispatcherServlet.properties is used (Boot adds its own).'],
            ['S', 'Why use strategy interfaces?', 'Each step can be replaced or extended without changing the servlet.'],
            ['S', 'Which method wires the strategies?', 'initStrategies, called from onRefresh.']],
        [['List the strategy beans in a running app.',
            r`@Component
class StrategyPrinter implements CommandLineRunner {
    @Autowired ApplicationContext ctx;
    public void run(String... args) {
        ctx.getBeansOfType(HandlerMapping.class)
           .keySet().forEach(System.out::println);
    }
}

// OUTPUT: (varies)
// requestMappingHandlerMapping
// welcomePageHandlerMapping
// beanNameHandlerMapping
// routerFunctionMapping
// resourceHandlerMapping`],
            ['Customize through WebMvcConfigurer.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry reg) {
        reg.addInterceptor(new LogInterceptor()).addPathPatterns("/api/**");
    }
}

// OUTPUT:
// Every /api request now passes LogInterceptor before the controller`]],
        [['Test with a mocked service in the web slice only.',
            r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService service;   // root-context bean replaced by a mock

    @Test
    void list() throws Exception {
        when(service.all()).thenReturn(List.of());
        mvc.perform(get("/orders")).andExpect(content().json("[]"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Inspect HandlerMapping order.',
                r`ctx.getBeansOfType(HandlerMapping.class).forEach((n, m) ->
    System.out.println(n + " order=" + ((Ordered) m).getOrder()));

// OUTPUT: (varies)
// requestMappingHandlerMapping order=0
// beanNameHandlerMapping order=2
// resourceHandlerMapping order=2147483646`]]
    ),
    'mvc-dispatcherservlet-initialization': x(
        ['<b>Initialization</b>: when the servlet container starts the servlet, <code>init()</code> runs once, builds the web context and sets up all strategies.',
            '<b>Boot</b> registers it with <code>DispatcherServletRegistrationBean</code>; by default it starts lazily on the first request unless load-on-startup is set, which Boot does.',
            '<b>Result</b>: after init the servlet knows its handler mappings, adapters, resolvers and can serve requests.'],
        ['<b>Steps</b>: init, create or find the WebApplicationContext, refresh it, then <code>onRefresh</code> calls <code>initStrategies</code>.',
            '<b>Property</b>: <code>spring.mvc.servlet.load-on-startup</code> controls when the servlet is created (Boot default is eager with -1 meaning lazy).',
            '<b>Classic setup</b>: in web.xml or a <code>WebApplicationInitializer</code> you declare the servlet and its context config.'],
        ['<b>initStrategies</b> calls initMultipartResolver, initLocaleResolver, initThemeResolver, initHandlerMappings, initHandlerAdapters, initHandlerExceptionResolvers, initRequestToViewNameTranslator, initViewResolvers and initFlashMapManager.',
            '<b>Detect all</b>: by default it collects every bean of each type, including from the parent context.',
            '<b>Fail fast</b>: a broken mapping (ambiguous handler) fails at startup, not at request time, which is why startup errors are good news.'],
        [['F', 'When does DispatcherServlet initialize?', 'When the container calls init, at startup if load-on-startup is set or on the first request otherwise.'],
            ['F', 'What does it build at startup?', 'The WebApplicationContext and its strategy beans.'],
            ['M', 'What does initStrategies do?', 'It looks up or defaults the handler mappings, adapters, resolvers and other strategy beans.'],
            ['M', 'How is it registered in plain Spring without web.xml?', 'A WebApplicationInitializer (or AbstractAnnotationConfigDispatcherServletInitializer) adds the servlet in onStartup.'],
            ['S', 'Why can ambiguous mapping fail at startup?', 'RequestMappingHandlerMapping registers all methods in afterPropertiesSet and throws on duplicates.'],
            ['S', 'What does load-on-startup change?', 'It moves the cost of building the context from the first request to startup.']],
        [['Programmatic setup without XML.',
            r`public class WebInit
        extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{ RootCfg.class };
    }
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{ WebCfg.class };
    }
    protected String[] getServletMappings() {
        return new String[]{ "/" };
    }
}

// OUTPUT:
// INFO DispatcherServlet : Initializing Servlet 'dispatcherServlet'
// INFO DispatcherServlet : Completed initialization in 45 ms (varies)`],
            ['Eager start in Boot.',
                r`# application.properties
spring.mvc.servlet.load-on-startup=1

// OUTPUT:
// Servlet initialised during startup, first request is not slower`]],
        [['Verify startup fails on an ambiguous mapping.',
            r`@RestController
class A {
    @GetMapping("/x") String a() { return "a"; }
}
@RestController
class B {
    @GetMapping("/x") String b() { return "b"; }
}

// OUTPUT:
// IllegalStateException: Ambiguous mapping. Cannot map 'b' method
// to {GET [/x]}: There is already 'a' bean method mapped.`],
            ['Log the init time.',
                r`# application.properties
logging.level.org.springframework.web.servlet=DEBUG

// OUTPUT:
// DEBUG DispatcherServlet : Detected StandardServletMultipartResolver
// DEBUG DispatcherServlet : Detected AcceptHeaderLocaleResolver`]]
    ),
    'mvc-dispatcherservlet-request-flow': x(
        ['<b>Request flow</b>: request arrives, HandlerMapping picks the handler, HandlerAdapter calls it, the result becomes a view or a body, and the response goes back.',
            '<b>Controller</b> returns either a view name (with <code>@Controller</code>) or data written directly (with <code>@RestController</code>).',
            '<b>Entry method</b>: all of this happens in <code>DispatcherServlet.doDispatch</code>.'],
        ['<b>Order</b>: mapping, interceptor <code>preHandle</code>, adapter invokes the method, interceptor <code>postHandle</code>, view rendering, <code>afterCompletion</code>.',
            '<b>REST</b>: with <code>@ResponseBody</code> the return value is written by an <code>HttpMessageConverter</code> and no view is resolved.',
            '<b>Errors</b>: an exception from the handler goes to <code>HandlerExceptionResolver</code> beans such as <code>@ExceptionHandler</code> methods.'],
        ['<b>HandlerExecutionChain</b> bundles the handler with its interceptors; the adapter then runs it.',
            '<b>Argument resolvers</b> build method parameters (<code>@RequestParam</code>, <code>@RequestBody</code>); return value handlers process the result.',
            '<b>Async</b>: a Callable or DeferredResult releases the container thread and the flow resumes with an async dispatch.'],
        [['F', 'Describe the request flow in Spring MVC.', 'DispatcherServlet gets the request, HandlerMapping finds the controller, HandlerAdapter invokes it, then a view is resolved or a body written.'],
            ['F', 'Which method does the main work?', 'doDispatch.'],
            ['M', 'When do interceptors run?', 'preHandle before the handler, postHandle after it but before rendering, afterCompletion at the end.'],
            ['M', 'What differs for @RestController?', 'No ViewResolver is used. An HttpMessageConverter serializes the return value.'],
            ['S', 'What happens if the handler throws?', 'DispatcherServlet asks HandlerExceptionResolvers in order; if one handles it a response is produced, otherwise the exception propagates.'],
            ['S', 'Does postHandle run on exceptions?', 'No, but afterCompletion always runs for interceptors whose preHandle returned true.']],
        [['Trace the steps with an interceptor.',
            r`class TraceInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        System.out.println("1 preHandle " + h);
        return true;
    }
    public void postHandle(HttpServletRequest q, HttpServletResponse s, Object h,
                           ModelAndView mv) { System.out.println("3 postHandle"); }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception e) {
        System.out.println("4 afterCompletion");
    }
}

// OUTPUT: (controller prints step 2)
// 1 preHandle com.demo.HelloController#hello()
// 2 controller runs
// 3 postHandle
// 4 afterCompletion`],
            ['View versus body.',
                r`@Controller
class PageController {
    @GetMapping("/home") String home() { return "home"; }       // view name
    @GetMapping("/data") @ResponseBody String d() { return "ok"; } // body
}

// OUTPUT:
// GET /home -> renders view "home"
// GET /data -> 200 ok`]],
        [['MockMvc follows the same flow.',
            r`mvc.perform(get("/home"))
   .andExpect(status().isOk())
   .andExpect(view().name("home"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Debug the flow.',
                r`# application.properties
logging.level.org.springframework.web=TRACE

// OUTPUT:
// TRACE DispatcherServlet : GET "/data", parameters={}
// TRACE RequestMappingHandlerMapping : Mapped to PageController#d()
// TRACE RequestResponseBodyMethodProcessor : Writing "ok"`]]
    ),
    'mvc-handlermapping': x(
        ['<b>HandlerMapping</b> is the strategy interface that maps an incoming request to a handler (usually a controller method) plus its interceptors.',
            '<b>Main implementation</b>: <code>RequestMappingHandlerMapping</code> reads <code>@RequestMapping</code>, <code>@GetMapping</code> and similar annotations.',
            '<b>Result</b>: it returns a <code>HandlerExecutionChain</code>, or null if it cannot match the request.'],
        ['<b>Match criteria</b>: path, HTTP method, params, headers, <code>consumes</code> and <code>produces</code>.',
            '<b>Others</b>: <code>BeanNameUrlHandlerMapping</code> (bean name is the URL), <code>RouterFunctionMapping</code> and <code>SimpleUrlHandlerMapping</code> (used for static resources).',
            '<b>Order</b>: several mappings run in order and the first non-null result wins.'],
        ['<b>Registration</b>: at startup all handler methods are scanned and stored in a <code>MappingRegistry</code> keyed by request mapping info.',
            '<b>Best match</b>: if several mappings fit, the most specific one wins; a tie gives an ambiguous mapping error.',
            '<b>Path patterns</b>: Spring 6 uses <code>PathPattern</code> by default, which is faster than the old AntPathMatcher.'],
        [['F', 'What does HandlerMapping do?', 'It maps a request to the handler that should process it.'],
            ['F', 'Which implementation handles @GetMapping?', 'RequestMappingHandlerMapping.'],
            ['M', 'What does it return?', 'A HandlerExecutionChain with the handler and matching interceptors, or null.'],
            ['M', 'How are two matching methods resolved?', 'The most specific mapping wins. Equal specificity causes an ambiguous mapping error at startup or request time.'],
            ['S', 'How are interceptors attached to a mapping?', 'The mapping adds registered interceptors whose path patterns match to the execution chain.'],
            ['S', 'Why is PathPattern preferred?', 'It is pre-parsed and faster than AntPathMatcher string matching.']],
        [['Mapping by method, header and media type.',
            r`@RestController
class ItemController {
    @GetMapping("/items/{id}")
    String one(@PathVariable long id) { return "item " + id; }

    @PostMapping(path = "/items", consumes = "application/json")
    String create(@RequestBody String body) { return "created"; }
}

// OUTPUT:
// GET  /items/5  -> 200 item 5
// POST /items (text/plain) -> 415 Unsupported Media Type`],
            ['Custom URL mapping bean.',
                r`@Bean
SimpleUrlHandlerMapping docsMapping() {
    var m = new SimpleUrlHandlerMapping(
        Map.of("/docs", new ParameterizableViewController()));
    m.setOrder(1);
    return m;
}

// OUTPUT:
// GET /docs handled by SimpleUrlHandlerMapping (order 1)`]],
        [['List all mappings at runtime.',
            r`@Autowired RequestMappingHandlerMapping mapping;

mapping.getHandlerMethods().forEach((info, method) ->
    System.out.println(info + " -> " + method.getShortLogMessage()));

// OUTPUT: (varies)
// { GET [/items/{id}] } -> com.demo.ItemController#one(long)
// { POST [/items], consumes [application/json] } -> ItemController#create(String)`],
            ['MockMvc mapping test.',
                r`mvc.perform(get("/items/5")).andExpect(content().string("item 5"));
mvc.perform(delete("/items/5")).andExpect(status().isMethodNotAllowed());

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-handleradapter': x(
        ['<b>HandlerAdapter</b> is the strategy that knows how to actually invoke a handler of a certain type, so DispatcherServlet can stay independent of handler kinds.',
            '<b>Main implementation</b>: <code>RequestMappingHandlerAdapter</code> invokes <code>@RequestMapping</code> methods.',
            '<b>Contract</b>: <code>supports(handler)</code> says if it can run the handler, and <code>handle(...)</code> runs it and returns a <code>ModelAndView</code> or null.'],
        ['<b>Argument resolving</b>: the adapter fills method parameters using <code>HandlerMethodArgumentResolver</code> beans (for example for <code>@RequestParam</code>).',
            '<b>Return values</b>: <code>HandlerMethodReturnValueHandler</code> beans process what the method returns.',
            '<b>Conversion</b>: <code>HttpMessageConverter</code> turns JSON into objects and back for <code>@RequestBody</code> and <code>@ResponseBody</code>.'],
        ['<b>Why an adapter</b>: handlers can be controllers, <code>HttpRequestHandler</code> beans or functions, and each needs a different call style.',
            '<b>Flow</b>: DispatcherServlet loops over adapters, takes the first where <code>supports</code> is true and calls <code>handle</code>.',
            '<b>Customization</b>: add resolvers or converters through <code>WebMvcConfigurer</code> instead of replacing the adapter.'],
        [['F', 'What is a HandlerAdapter?', 'An object that invokes a handler found by HandlerMapping, hiding handler differences from DispatcherServlet.'],
            ['F', 'Which adapter runs @RequestMapping methods?', 'RequestMappingHandlerAdapter.'],
            ['M', 'What methods does the interface have?', 'supports(Object handler) and handle(request, response, handler).'],
            ['M', 'Who binds method arguments?', 'The adapter, using HandlerMethodArgumentResolvers.'],
            ['S', 'How do you add a custom argument type?', 'Implement HandlerMethodArgumentResolver and register it in WebMvcConfigurer.addArgumentResolvers.'],
            ['S', 'Why not call controllers directly from DispatcherServlet?', 'Handlers come in different forms. The adapter pattern keeps the servlet open for new kinds without changes.']],
        [['A custom argument resolver.',
            r`public class ClientIpResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.getParameterAnnotation(ClientIp.class) != null;
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer c,
            NativeWebRequest req, WebDataBinderFactory f) {
        return ((HttpServletRequest) req.getNativeRequest()).getRemoteAddr();
    }
}

// OUTPUT:
// @GetMapping("/ip") String ip(@ClientIp String ip) -> "127.0.0.1"`],
            ['Register it.',
                r`@Configuration
class WebCfg implements WebMvcConfigurer {
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> list) {
        list.add(new ClientIpResolver());
    }
}

// OUTPUT:
// The new resolver is added to RequestMappingHandlerAdapter`]],
        [['Test the custom parameter.',
            r`mvc.perform(get("/ip"))
   .andExpect(content().string("127.0.0.1"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Show adapters in the context.',
                r`ctx.getBeansOfType(HandlerAdapter.class).keySet()
   .forEach(System.out::println);

// OUTPUT: (varies)
// requestMappingHandlerAdapter
// handlerFunctionAdapter
// httpRequestHandlerAdapter
// simpleControllerHandlerAdapter`]]
    ),
    'mvc-handlerexceptionresolver': x(
        ['<b>HandlerExceptionResolver</b> is the strategy that turns an exception thrown during request handling into a response, such as an error page or a JSON body.',
            '<b>Default chain</b>: <code>ExceptionHandlerExceptionResolver</code> (for <code>@ExceptionHandler</code>), <code>ResponseStatusExceptionResolver</code> and <code>DefaultHandlerExceptionResolver</code>.',
            '<b>Use</b>: you normally write <code>@ExceptionHandler</code> methods in a <code>@ControllerAdvice</code> class and let Spring wire the resolver.'],
        ['<b>@ResponseStatus</b> on an exception class gives it a fixed status code.',
            '<b>DefaultHandlerExceptionResolver</b> maps standard Spring exceptions, for example a missing parameter becomes 400 and wrong method becomes 405.',
            '<b>ProblemDetail</b>: Spring 6 supports RFC 7807 error bodies with <code>ProblemDetail</code> and <code>ResponseEntityExceptionHandler</code>.'],
        ['<b>Order</b>: resolvers are asked in order; the first returning a non-null <code>ModelAndView</code> (an empty one means handled) ends the search.',
            '<b>Unresolved</b>: the exception goes to the container and, in Boot, to <code>BasicErrorController</code> for the <code>/error</code> page.',
            '<b>Scope</b>: <code>@ExceptionHandler</code> in a controller applies only to it; in <code>@ControllerAdvice</code> it applies globally or to selected packages.'],
        [['F', 'What does HandlerExceptionResolver do?', 'It converts an exception from a handler into an HTTP response or error view.'],
            ['F', 'Where do you usually handle exceptions?', 'In @ExceptionHandler methods inside a @ControllerAdvice class.'],
            ['M', 'Name the default resolvers.', 'ExceptionHandlerExceptionResolver, ResponseStatusExceptionResolver and DefaultHandlerExceptionResolver.'],
            ['M', 'What does @ResponseStatus on an exception do?', 'The status code and reason are used when it is thrown.'],
            ['S', 'What happens when no resolver handles it?', 'It propagates to the servlet container; Boot forwards to /error handled by BasicErrorController.'],
            ['S', 'How do you return RFC 7807 errors?', 'Return a ProblemDetail from an @ExceptionHandler or extend ResponseEntityExceptionHandler.']],
        [['Global handler with a JSON body.',
            r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(NoSuchElementException.class)
    ProblemDetail notFound(NoSuchElementException e) {
        ProblemDetail p = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        p.setDetail(e.getMessage());
        return p;
    }
}

// OUTPUT:
// HTTP/1.1 404
// {"type":"about:blank","title":"Not Found","status":404,"detail":"No item"}`],
            ['Exception with a status.',
                r`@ResponseStatus(HttpStatus.CONFLICT)
class DuplicateUser extends RuntimeException { }

// OUTPUT:
// throw new DuplicateUser() -> HTTP 409`]],
        [['Test the handler.',
            r`when(service.find(9L)).thenThrow(new NoSuchElementException("No item"));
mvc.perform(get("/items/9"))
   .andExpect(status().isNotFound())
   .andExpect(jsonPath("$.detail").value("No item"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['A custom resolver bean.',
                r`@Component
class LoggingResolver implements HandlerExceptionResolver, Ordered {
    public ModelAndView resolveException(HttpServletRequest q,
            HttpServletResponse s, Object h, Exception e) {
        System.out.println("error: " + e);
        return null;                       // null passes to the next resolver
    }
    public int getOrder() { return Ordered.HIGHEST_PRECEDENCE; }
}

// OUTPUT:
// error: java.util.NoSuchElementException: No item`]]
    ),
    'mvc-viewresolver': x(
        ['<b>ViewResolver</b> turns a logical view name returned by a controller (such as <code>home</code>) into a real <code>View</code> object that renders the page.',
            '<b>Why</b>: controllers stay independent of the template technology, so you can switch JSP, Thymeleaf or FreeMarker by configuration.',
            '<b>Not used</b> for <code>@RestController</code> or <code>@ResponseBody</code>, because there is no view to render.'],
        ['<b>InternalResourceViewResolver</b> adds a prefix and suffix, for example <code>/WEB-INF/views/</code> and <code>.jsp</code>.',
            '<b>Thymeleaf</b>: Boot configures <code>ThymeleafViewResolver</code> with <code>classpath:/templates/</code> and <code>.html</code> by default.',
            '<b>Properties</b>: <code>spring.mvc.view.prefix</code> and <code>spring.mvc.view.suffix</code> change the lookup for JSP setups.'],
        ['<b>Chain</b>: several resolvers are ordered and the first that returns a non-null <code>View</code> wins; <code>InternalResourceViewResolver</code> accepts any name so it must be last.',
            '<b>Content negotiation</b>: <code>ContentNegotiatingViewResolver</code> picks among resolvers by the requested media type.',
            '<b>Special prefixes</b>: <code>redirect:</code> and <code>forward:</code> make <code>UrlBasedViewResolver</code> return a redirect or forward view.'],
        [['F', 'What does a ViewResolver do?', 'It maps the view name from a controller to a View implementation that renders the response.'],
            ['F', 'Is it used with @RestController?', 'No, the return value is written as a body instead.'],
            ['M', 'What do prefix and suffix do?', 'They are added around the view name, so home becomes /WEB-INF/views/home.jsp.'],
            ['M', 'What does redirect: do in a view name?', 'It sends an HTTP redirect to the given URL instead of rendering a template.'],
            ['S', 'Why must InternalResourceViewResolver be last?', 'It resolves every name, so later resolvers would never be asked.'],
            ['S', 'How does Boot choose the view technology?', 'Auto-configuration enables the resolver for each template engine found on the classpath.']],
        [['A controller returning a view name.',
            r`@Controller
class HomeController {
    @GetMapping("/home")
    String home(Model model) {
        model.addAttribute("user", "Abaji");
        return "home";          // resolved to templates/home.html
    }
}

// OUTPUT:
// GET /home -> renders <h1>Hello Abaji</h1> from home.html`],
            ['JSP style resolver.',
                r`@Bean
ViewResolver jspResolver() {
    var vr = new InternalResourceViewResolver();
    vr.setPrefix("/WEB-INF/views/");
    vr.setSuffix(".jsp");
    return vr;
}

// OUTPUT:
// "home" -> /WEB-INF/views/home.jsp`]],
        [['Test the view name and model.',
            r`mvc.perform(get("/home"))
   .andExpect(status().isOk())
   .andExpect(view().name("home"))
   .andExpect(model().attribute("user", "Abaji"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Redirect after POST.',
                r`@PostMapping("/save")
String save() { return "redirect:/home"; }

// OUTPUT:
// POST /save -> 302 Location: /home`]]
    )
};

export const smvc02Deep: Record<string, Deep> = {
    'mvc-front-controller-pattern': dv(
        [`<p>How Spring implements the pattern internally.</p><ul><li><b>Single servlet:</b> <code>DispatcherServlet</code> is mapped to <code>/</code>, so the container sends everything to it.</li><li><b>Template method:</b> <code>FrameworkServlet.service</code> calls <code>doService</code>, which calls <code>doDispatch</code>.</li><li><b>Delegation:</b> mapping, invocation, view and error handling are strategy beans.</li><li><b>Static files:</b> a resource handler mapping serves them through the same servlet.</li></ul>`,
            r`protected void doDispatch(HttpServletRequest req, HttpServletResponse res) {
    HandlerExecutionChain chain = getHandler(req);          // HandlerMapping
    HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
    ModelAndView mv = ha.handle(req, res, chain.getHandler());
    processDispatchResult(req, res, chain, mv, null);       // view or error
}

// OUTPUT:
// Simplified from Spring Framework 6: the real method adds interceptors,
// async handling and exception processing around these four steps.`],
        [`<p>Variants and options.</p><ul><li><b>Mapping /:</b> the default; use <code>/api/*</code> style paths to restrict it.</li><li><b>Multiple dispatchers:</b> register extra <code>DispatcherServletRegistrationBean</code> beans.</li><li><b>Page Controller:</b> the alternative, one handler per page, with duplicated cross-cutting code.</li><li><b>Reactive:</b> WebFlux has its own front controller, <code>DispatcherHandler</code>.</li></ul>`,
            r`@Bean
DispatcherServletRegistrationBean adminDispatcher() {
    var ctx = new AnnotationConfigWebApplicationContext();
    ctx.register(AdminConfig.class);
    var servlet = new DispatcherServlet(ctx);
    var reg = new DispatcherServletRegistrationBean(servlet, "/admin/*");
    reg.setName("adminDispatcher");
    reg.setLoadOnStartup(1);
    return reg;
}

// OUTPUT:
// Two front controllers: "/" for the app and "/admin/*" for the admin area`],
        [`<p>Typical mistakes.</p><ul><li><b>Business logic in filters or the front controller:</b> keep it in services.</li><li><b>Assuming filters know the handler:</b> they run before mapping, so use an interceptor.</li><li><b>Mapping to /*:</b> in classic setups it also swallows JSP forwards; use <code>/</code>.</li><li><b>Static resources 404:</b> check the resource handler configuration.</li></ul>`,
            r`// WRONG: filter cannot see which controller will run
// public void doFilter(...) { HandlerMethod hm = ...; }   // not available

// RIGHT: interceptor receives the handler
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    if (h instanceof HandlerMethod hm) {
        System.out.println(hm.getMethod().getName());
    }
    return true;
}

// OUTPUT:
// hello`],
        [`<p>Performance points.</p><ul><li><b>Thin entry:</b> avoid heavy work in interceptors, they run for every request.</li><li><b>Path matching:</b> PathPattern parsing is done once at startup.</li><li><b>Threading:</b> use async return types for long calls so container threads are freed.</li><li><b>Static content:</b> serve it from a CDN or reverse proxy, not the servlet.</li></ul>`,
            r`@GetMapping("/report")
Callable<String> report() {
    return () -> {             // runs on an async executor, container thread freed
        Thread.sleep(2000);
        return "done";
    };
}

// OUTPUT:
// GET /report -> 200 done after about 2 s, without blocking a Tomcat thread`],
        [`<p>Scenario: an API needs request logging, authentication and uniform error JSON for all endpoints.</p><ul><li>One security filter for authentication.</li><li>One interceptor for request timing.</li><li>One <code>@RestControllerAdvice</code> for errors.</li><li>Dozens of controllers stay free of this code.</li></ul>`,
            r`@Component
class TimingInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        q.setAttribute("t0", System.nanoTime());
        return true;
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception e) {
        long ms = (System.nanoTime() - (long) q.getAttribute("t0")) / 1_000_000;
        System.out.println(q.getMethod() + " " + q.getRequestURI() + " " + ms + "ms");
    }
}

// OUTPUT: (varies)
// GET /orders 12ms`]
    ),
    'mvc-dispatcherservlet': dv(
        [`<p>Inside DispatcherServlet.</p><ul><li><b>Auto-config:</b> <code>DispatcherServletAutoConfiguration</code> defines the servlet and a registration bean.</li><li><b>Properties:</b> <code>WebMvcProperties</code> holds the <code>spring.mvc.*</code> options.</li><li><b>Context:</b> in Boot the embedded server context hosts a single application context.</li><li><b>Request attributes:</b> it stores the context, locale and flash maps on the request.</li></ul>`,
            r`// Simplified view of what Boot registers
@Bean(name = "dispatcherServlet")
DispatcherServlet dispatcherServlet(WebMvcProperties props) {
    var ds = new DispatcherServlet();
    ds.setThrowExceptionIfNoHandlerFound(props.isThrowExceptionIfNoHandlerFound());
    ds.setDispatchOptionsRequest(props.isDispatchOptionsRequest());
    return ds;
}

// OUTPUT:
// Bean "dispatcherServlet" and "dispatcherServletRegistration" appear in /actuator/beans`],
        [`<p>Options you can set.</p><ul><li><code>spring.mvc.servlet.path</code>: the prefix.</li><li><code>spring.mvc.servlet.load-on-startup</code>: eager start.</li><li><code>spring.mvc.throw-exception-if-no-handler-found</code>: 404 as exception.</li><li><code>spring.mvc.dispatch-trace-request</code>: pass TRACE requests to controllers.</li><li><code>spring.mvc.async.request-timeout</code>: async timeout.</li></ul>`,
            r`# application.properties
spring.mvc.servlet.path=/api
spring.mvc.servlet.load-on-startup=1
spring.mvc.async.request-timeout=30s
spring.mvc.throw-exception-if-no-handler-found=true

# OUTPUT:
# All controller URLs are served under /api, async requests time out after 30 s`],
        [`<p>Common mistakes.</p><ul><li><b>Servlet path confusion:</b> the controller mapping does not include <code>spring.mvc.servlet.path</code>, the client URL does.</li><li><b>Two DispatcherServlets with overlapping mappings:</b> requests go to the longest match.</li><li><b>Stateful controllers:</b> fields shared across threads cause races.</li><li><b>Calling blocking code at scale:</b> exhausts the thread pool.</li></ul>`,
            r`// WRONG: shared mutable field in a singleton controller
@RestController
class CounterController {
    private int count;                          // race condition
    @GetMapping("/c") int c() { return ++count; }
}
// RIGHT: use an atomic or a service with proper storage
@RestController
class SafeCounter {
    private final AtomicInteger count = new AtomicInteger();
    @GetMapping("/c") int c() { return count.incrementAndGet(); }
}

// OUTPUT:
// Concurrent calls to /c never lose an increment in SafeCounter`],
        [`<p>Tuning.</p><ul><li><b>Thread pool:</b> <code>server.tomcat.threads.max</code> sets request concurrency.</li><li><b>Compression and caching:</b> enable <code>server.compression.enabled</code> and set cache headers for static files.</li><li><b>Virtual threads:</b> <code>spring.threads.virtual.enabled=true</code> on Java 21 with Boot 3.2 or later.</li><li><b>Measure:</b> use Actuator <code>http.server.requests</code> metrics.</li></ul>`,
            r`# application.properties
server.tomcat.threads.max=200
server.compression.enabled=true
spring.web.resources.cache.cachecontrol.max-age=7d
management.endpoints.web.exposure.include=metrics

# OUTPUT:
# GET /actuator/metrics/http.server.requests -> count, total time, max (varies)`],
        [`<p>Scenario: a legacy app has a WAR with a web.xml; migrating to Boot.</p><ul><li>web.xml servlet becomes auto-configuration.</li><li>The URL pattern becomes <code>spring.mvc.servlet.path</code>.</li><li>Context listeners become normal beans.</li><li>Tests move to MockMvc slices.</li></ul>`,
            r`<!-- before: web.xml -->
<servlet>
  <servlet-name>app</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping><servlet-name>app</servlet-name><url-pattern>/</url-pattern></servlet-mapping>

# after: application.properties
# spring.mvc.servlet.load-on-startup=1   (default mapping is already /)

// OUTPUT:
// Same behaviour with zero XML`]
    ),
    'mvc-what-is-dispatcherservlet': dv(
        [`<p>How it works.</p><ul><li><b>service:</b> <code>FrameworkServlet.service</code> sets up context holders and calls <code>doService</code>.</li><li><b>doService:</b> adds request attributes (context, locale resolver, theme) and calls <code>doDispatch</code>.</li><li><b>doDispatch:</b> finds the handler chain, applies interceptors, calls the adapter and processes the result.</li><li><b>Cleanup:</b> it restores holders and publishes a <code>ServletRequestHandledEvent</code>.</li></ul>`,
            r`@Component
class RequestListener {
    @EventListener
    void onHandled(ServletRequestHandledEvent e) {
        System.out.println(e.getRequestUrl() + " " + e.getStatusCode()
            + " " + e.getProcessingTimeMillis() + "ms");
    }
}

// OUTPUT: (varies)
// /hello 200 4ms`],
        [`<p>Variants.</p><ul><li><b>Servlet 3 style:</b> <code>WebApplicationInitializer</code>.</li><li><b>Boot style:</b> auto-configured.</li><li><b>Test style:</b> MockMvc creates a mock servlet environment around a real <code>DispatcherServlet</code>.</li><li><b>Custom subclass:</b> override <code>doService</code> or <code>noHandlerFound</code> in rare cases.</li></ul>`,
            r`public class WebInit implements WebApplicationInitializer {
    public void onStartup(ServletContext sc) {
        var ctx = new AnnotationConfigWebApplicationContext();
        ctx.register(WebCfg.class);
        var reg = sc.addServlet("app", new DispatcherServlet(ctx));
        reg.setLoadOnStartup(1);
        reg.addMapping("/");
    }
}

// OUTPUT:
// INFO DispatcherServlet : Initializing Servlet 'app'`],
        [`<p>Common mistakes.</p><ul><li><b>Missing @EnableWebMvc or Boot:</b> plain Spring has no annotation-driven mapping until configured.</li><li><b>Component scan misses controllers:</b> the result is a 404.</li><li><b>Mapping /* instead of /:</b> hides static resources and JSP forwarding.</li><li><b>Adding @EnableWebMvc in Boot:</b> turns off Boot MVC auto-configuration.</li></ul>`,
            r`// WRONG in Spring Boot: disables Boot defaults (JSON config, static resources)
@Configuration
@EnableWebMvc
class Cfg { }

// RIGHT: implement WebMvcConfigurer without @EnableWebMvc
@Configuration
class Cfg2 implements WebMvcConfigurer { }

// OUTPUT:
// With @EnableWebMvc: static files under /static return 404`],
        [`<p>Performance.</p><ul><li><b>Startup cost:</b> scanning many controllers adds time; keep the scan narrow.</li><li><b>Per request:</b> mapping lookup is a map and trie lookup; the body conversion usually costs more.</li><li><b>JSON:</b> reuse the Boot-configured <code>ObjectMapper</code> bean.</li><li><b>Lazy init:</b> <code>spring.main.lazy-initialization=true</code> lowers startup but moves the cost to first use.</li></ul>`,
            r`# application.properties
spring.main.lazy-initialization=false
spring.jackson.default-property-inclusion=non_null

# OUTPUT:
# Smaller JSON responses and predictable first-request latency`],
        [`<p>Scenario: a 404 for a URL that looks right.</p><ul><li>Check the debug log for the mapped handler.</li><li>Check the servlet path and context path.</li><li>Check that the controller is in a scanned package.</li><li>Check the HTTP method and consumes header.</li></ul>`,
            r`# application.properties
logging.level.org.springframework.web.servlet.mvc.method.annotation=TRACE
server.servlet.context-path=/shop

# OUTPUT:
# Request must be GET /shop/hello (context path + servlet path + mapping)
# TRACE RequestMappingHandlerMapping : Mapped to HelloController#hello()`]
    ),
    'mvc-dispatcherservlet-architecture': dv(
        [`<p>Internals of the architecture.</p><ul><li><b>Defaults:</b> <code>DispatcherServlet.properties</code> in the Spring jar lists default strategy classes.</li><li><b>Lookup:</b> <code>BeanFactoryUtils.beansOfTypeIncludingAncestors</code> collects strategy beans from both contexts.</li><li><b>Sorting:</b> <code>AnnotationAwareOrderComparator</code> orders them.</li><li><b>Fallback:</b> <code>getDefaultStrategies</code> instantiates defaults if none is found.</li></ul>`,
            r`// Simplified initHandlerMappings
var matching = BeanFactoryUtils.beansOfTypeIncludingAncestors(
        context, HandlerMapping.class, true, false);
if (!matching.isEmpty()) {
    this.handlerMappings = new ArrayList<>(matching.values());
    AnnotationAwareOrderComparator.sort(this.handlerMappings);
} else {
    this.handlerMappings = getDefaultStrategies(context, HandlerMapping.class);
}

// OUTPUT:
// handlerMappings sorted by order, first match wins`],
        [`<p>Options for shaping the architecture.</p><ul><li><b>WebMvcConfigurer:</b> safe hook for interceptors, formatters, resolvers, CORS and resources.</li><li><b>WebMvcRegistrations:</b> replace the mapping or adapter class in Boot.</li><li><b>Own beans:</b> define a strategy bean to replace the default one.</li><li><b>Parent and child:</b> classic setup with <code>getRootConfigClasses</code> and <code>getServletConfigClasses</code>.</li></ul>`,
            r`@Configuration
class MvcCfg implements WebMvcConfigurer {
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**").allowedOrigins("https://example.com");
    }
    public void addFormatters(FormatterRegistry r) {
        r.addConverter(String.class, LocalDate.class, LocalDate::parse);
    }
    public void configureViewResolvers(ViewResolverRegistry r) {
        r.jsp("/WEB-INF/views/", ".jsp");
    }
}

// OUTPUT:
// CORS, conversion and view resolution configured in one class`],
        [`<p>Mistakes.</p><ul><li><b>Duplicate beans in both contexts:</b> controllers scanned twice, services created twice.</li><li><b>Component scan in root config picks up @Controller:</b> exclude it.</li><li><b>Transactions not applied:</b> services in the child context are not seen by the root proxy setup.</li><li><b>Ordering mistakes:</b> a catch-all handler mapping with a low order hides specific ones.</li></ul>`,
            r`// Root config: scan only non-web beans
@Configuration
@ComponentScan(basePackages = "com.demo",
    excludeFilters = @ComponentScan.Filter(Controller.class))
class RootCfg { }

// Web config: scan only controllers
@Configuration
@ComponentScan(basePackages = "com.demo",
    useDefaultFilters = false,
    includeFilters = @ComponentScan.Filter(Controller.class))
class WebCfg { }

// OUTPUT:
// Each bean is created once, in the correct context`],
        [`<p>Performance.</p><ul><li><b>Strategy lookups</b> happen once at startup, so the architecture costs little per request.</li><li><b>Interceptors:</b> each one adds a call per request; restrict them with path patterns.</li><li><b>Caching:</b> <code>Cache-Control</code> and ETag filters save work.</li><li><b>Conditional requests:</b> <code>ShallowEtagHeaderFilter</code> saves bandwidth, not compute.</li></ul>`,
            r`@Bean
FilterRegistrationBean<ShallowEtagHeaderFilter> etag() {
    var f = new FilterRegistrationBean<>(new ShallowEtagHeaderFilter());
    f.addUrlPatterns("/api/*");
    return f;
}

// OUTPUT:
// Second GET with If-None-Match returns 304 Not Modified with no body`],
        [`<p>Scenario: you need audit logging of all /admin calls with the handler name.</p><ul><li>An interceptor with path pattern <code>/admin/**</code>.</li><li>It reads the <code>HandlerMethod</code> from the handler argument.</li><li>Registered in a <code>WebMvcConfigurer</code>.</li></ul>`,
            r`@Component
class AuditInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        if (h instanceof HandlerMethod hm) {
            System.out.println("AUDIT " + q.getUserPrincipal() + " -> "
                + hm.getBeanType().getSimpleName() + "." + hm.getMethod().getName());
        }
        return true;
    }
}

// OUTPUT: (varies)
// AUDIT admin -> UserAdminController.deleteUser`]
    ),
    'mvc-dispatcherservlet-initialization': dv(
        [`<p>Initialization sequence.</p><ul><li><b>1. init():</b> <code>HttpServletBean.init</code> binds servlet init parameters to properties.</li><li><b>2. initServletBean():</b> <code>FrameworkServlet</code> calls <code>initWebApplicationContext</code>.</li><li><b>3. Context:</b> uses the injected one, finds an existing one or creates a new one with the root as parent.</li><li><b>4. onRefresh():</b> <code>DispatcherServlet</code> calls <code>initStrategies</code>.</li></ul>`,
            r`protected void initStrategies(ApplicationContext context) {
    initMultipartResolver(context);
    initLocaleResolver(context);
    initThemeResolver(context);
    initHandlerMappings(context);
    initHandlerAdapters(context);
    initHandlerExceptionResolvers(context);
    initRequestToViewNameTranslator(context);
    initViewResolvers(context);
    initFlashMapManager(context);
}

// OUTPUT:
// Runs once per DispatcherServlet instance, after the context refresh event`],
        [`<p>Variants.</p><ul><li><b>web.xml:</b> <code>load-on-startup</code> and <code>contextConfigLocation</code>.</li><li><b>Java config:</b> <code>AbstractAnnotationConfigDispatcherServletInitializer</code>.</li><li><b>Boot:</b> <code>ServletContextInitializer</code> and registration beans.</li><li><b>Context hierarchy:</b> optional parent, set through <code>ContextLoaderListener</code>.</li></ul>`,
            r`<servlet>
  <servlet-name>app</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/app-servlet.xml</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
</servlet>

<!-- OUTPUT -->
// INFO DispatcherServlet : Initializing Servlet 'app'`],
        [`<p>Mistakes.</p><ul><li><b>Lazy init surprises:</b> the first request is slow and startup errors appear late.</li><li><b>Missing config location:</b> <code>FileNotFoundException</code> for <code>app-servlet.xml</code>.</li><li><b>Duplicate registration:</b> two initializers register the same servlet name.</li><li><b>Blocking init:</b> long work in a <code>@PostConstruct</code> of a controller delays readiness.</li></ul>`,
            r`// WRONG: slow remote call during bean creation blocks startup
@RestController
class Slow {
    @PostConstruct void init() { /* 30 s remote call */ }
}
// RIGHT: do it after startup in the background
@Component
class Warmup {
    @EventListener(ApplicationReadyEvent.class)
    @Async void warm() { /* remote call */ }
}

// OUTPUT:
// Application starts in seconds and warms up while serving`],
        [`<p>Performance.</p><ul><li><b>Startup time:</b> mostly component scan and bean creation, not DispatcherServlet itself.</li><li><b>Narrow scan</b> and avoid classpath scanning of huge packages.</li><li><b>AOT and native:</b> Spring Boot 3 supports AOT processing to speed up startup.</li><li><b>Readiness:</b> use actuator health probes so traffic starts only when ready.</li></ul>`,
            r`# application.properties
management.endpoint.health.probes.enabled=true
spring.main.banner-mode=off

# OUTPUT:
# GET /actuator/health/readiness -> {"status":"UP"}
once initialization ends`],
        [`<p>Scenario: the first user request after deploy takes 5 seconds.</p><ul><li>Cause: lazy servlet init or lazy beans.</li><li>Fix: eager load-on-startup and no lazy initialization.</li><li>Verify with the startup log timestamp.</li></ul>`,
            r`# application.properties
spring.mvc.servlet.load-on-startup=1
spring.main.lazy-initialization=false

# OUTPUT: (varies)
# Started App in 4.1 seconds
# First GET /home -> 38 ms instead of 5 s`]
    ),
    'mvc-dispatcherservlet-request-flow': dv(
        [`<p>The steps in doDispatch.</p><ul><li><b>Multipart check:</b> wraps the request if it is multipart.</li><li><b>getHandler:</b> returns the chain from the first matching mapping.</li><li><b>getHandlerAdapter:</b> first adapter whose <code>supports</code> is true.</li><li><b>applyPreHandle:</b> interceptors run in order, and if one returns false the flow stops.</li><li><b>handle:</b> the adapter invokes the method.</li><li><b>applyPostHandle:</b> interceptors run in reverse order.</li><li><b>processDispatchResult:</b> renders the view or resolves the exception, then triggers <code>afterCompletion</code>.</li></ul>`,
            r`HandlerExecutionChain chain = getHandler(req);
if (chain == null) {
    noHandlerFound(req, res);
    return;
}
HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
if (!chain.applyPreHandle(req, res)) return;
ModelAndView mv = ha.handle(req, res, chain.getHandler());
chain.applyPostHandle(req, res, mv);
processDispatchResult(req, res, chain, mv, dispatchException);

// OUTPUT:
// Order for two interceptors A and B: A.pre, B.pre, handler, B.post, A.post,
// then B.after, A.after`],
        [`<p>Flow variants.</p><ul><li><b>View flow:</b> model, view name, <code>ViewResolver</code>, <code>View.render</code>.</li><li><b>Body flow:</b> <code>HttpMessageConverter</code>, no view.</li><li><b>Redirect flow:</b> <code>redirect:</code> view and flash attributes.</li><li><b>Async flow:</b> first dispatch releases the thread, a second dispatch writes the result.</li><li><b>Error flow:</b> exception resolvers, then <code>/error</code>.</li></ul>`,
            r`@GetMapping("/slow")
DeferredResult<String> slow() {
    var dr = new DeferredResult<String>(5000L);
    CompletableFuture.supplyAsync(() -> "result")
        .thenAccept(dr::setResult);
    return dr;
}

// OUTPUT:
// Request thread returned at once; the response "result" is written later`],
        [`<p>Mistakes.</p><ul><li><b>preHandle returns false without writing a response:</b> the client gets an empty 200.</li><li><b>Expecting postHandle on errors:</b> use <code>afterCompletion</code> for cleanup.</li><li><b>Writing to the response and returning a view:</b> causes <code>IllegalStateException</code>.</li><li><b>Missing content negotiation:</b> returns 406 when the Accept header cannot be met.</li></ul>`,
            r`// WRONG: stops the chain but sends nothing
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    return q.getHeader("X-Key") != null;
}
// RIGHT: send a clear error when rejecting
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    if (q.getHeader("X-Key") == null) {
        s.sendError(401);
        return false;
    }
    return true;
}

// OUTPUT:
// GET without X-Key -> 401`],
        [`<p>Performance.</p><ul><li><b>Measure each stage:</b> mapping is cheap, body conversion and view rendering are not.</li><li><b>Skip views for APIs:</b> return data directly.</li><li><b>Template cache:</b> keep Thymeleaf cache on in production, <code>spring.thymeleaf.cache=true</code>.</li><li><b>Async:</b> for slow downstream calls.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
management.metrics.distribution.percentiles-histogram.http.server.requests=true

# OUTPUT:
# http.server.requests histogram shows where time is spent (varies)`],
        [`<p>Scenario: debug why a handler is never reached.</p><ul><li>Log at TRACE for <code>org.springframework.web</code>.</li><li>Look for the mapped handler line.</li><li>Check that an interceptor did not return false.</li><li>Check security filters before the servlet.</li></ul>`,
            r`# application.properties
logging.level.org.springframework.web=TRACE
logging.level.org.springframework.security=DEBUG

# OUTPUT: (varies)
# TRACE DispatcherServlet : GET "/orders/5"
# DEBUG FilterChainProxy : Securing GET /orders/5
# TRACE RequestMappingHandlerMapping : Mapped to OrderController#get(long)`]
    ),
    'mvc-handlermapping': dv(
        [`<p>How RequestMappingHandlerMapping works.</p><ul><li><b>Startup:</b> <code>afterPropertiesSet</code> scans beans annotated with <code>@Controller</code> or <code>@RequestMapping</code>.</li><li><b>Registry:</b> each method becomes a <code>RequestMappingInfo</code> stored in a <code>MappingRegistry</code>.</li><li><b>Lookup:</b> direct path lookup first, then all conditions are tested.</li><li><b>Best match:</b> candidates are sorted by a comparator and the first wins.</li></ul>`,
            r`RequestMappingInfo info = RequestMappingInfo
    .paths("/items/{id}")
    .methods(RequestMethod.GET)
    .produces("application/json")
    .build();

// OUTPUT:
// { GET [/items/{id}], produces [application/json] }`],
        [`<p>Mapping options.</p><ul><li><code>path</code>/<code>value</code>: URL patterns with <code>{var}</code>, <code>*</code> and <code>**</code>.</li><li><code>method</code>: HTTP verbs, or composed annotations such as <code>@PostMapping</code>.</li><li><code>params</code> and <code>headers</code>: require values.</li><li><code>consumes</code> and <code>produces</code>: media types.</li><li><b>Programmatic:</b> <code>registerMapping</code> to add routes at runtime.</li></ul>`,
            r`@GetMapping(path = "/v/{id:[0-9]+}", params = "full=true",
        produces = MediaType.APPLICATION_JSON_VALUE)
Item full(@PathVariable long id) { return service.find(id); }

// OUTPUT:
// GET /v/5?full=true -> 200 JSON
// GET /v/abc?full=true -> 404 (regex fails)
// GET /v/5 -> 400 (params condition fails)`],
        [`<p>Mistakes.</p><ul><li><b>Ambiguous mapping:</b> two methods with the same path and conditions.</li><li><b>Trailing slash:</b> in Spring 6 <code>/items/</code> no longer matches <code>/items</code>.</li><li><b>Wrong media type:</b> 415 for consumes, 406 for produces.</li><li><b>Class-level path forgotten:</b> the method path is appended to it.</li></ul>`,
            r`@RestController
@RequestMapping("/api")
class UserController {
    @GetMapping("/users")        // final URL is /api/users, not /users
    List<String> all() { return List.of("a"); }
}

// OUTPUT:
// GET /users     -> 404
// GET /api/users -> 200 ["a"]
// GET /api/users/ -> 404 in Spring 6 (trailing slash match is off)`],
        [`<p>Performance.</p><ul><li><b>PathPattern:</b> pre-parsed patterns, faster than regex or Ant matching.</li><li><b>Direct lookup:</b> static paths use a hash map.</li><li><b>Avoid many regex-heavy mappings</b> on hot paths.</li><li><b>Cache:</b> the mapping lookup result is cached in a request attribute.</li></ul>`,
            r`# application.properties
spring.mvc.pathmatch.matching-strategy=path_pattern_parser

# OUTPUT:
# Default in Boot 2.6 and later: PathPatternParser is used for request mapping`],
        [`<p>Scenario: API versioning by header, so /orders serves v1 and v2.</p><ul><li>Two methods with the same path.</li><li>Differentiated by a header condition.</li><li>Falls back to 404 or 400 when no version matches.</li></ul>`,
            r`@RestController
class OrderApi {
    @GetMapping(path = "/orders", headers = "X-API-Version=1")
    String v1() { return "v1 orders"; }

    @GetMapping(path = "/orders", headers = "X-API-Version=2")
    String v2() { return "v2 orders"; }
}

// OUTPUT:
// GET /orders  X-API-Version: 2 -> 200 v2 orders
// GET /orders  (no header)      -> 404`]
    ),
    'mvc-handleradapter': dv(
        [`<p>How RequestMappingHandlerAdapter works.</p><ul><li><b>Build:</b> it wraps the <code>HandlerMethod</code> in an <code>InvocableHandlerMethod</code>.</li><li><b>Arguments:</b> a composite of resolvers tries each one until <code>supportsParameter</code> is true.</li><li><b>Invoke:</b> the method is called by reflection.</li><li><b>Return:</b> a composite of return value handlers writes the result or sets the view.</li><li><b>Binder:</b> <code>@InitBinder</code> and conversion are applied before binding.</li></ul>`,
            r`ServletInvocableHandlerMethod m = createInvocableHandlerMethod(handlerMethod);
m.setHandlerMethodArgumentResolvers(this.argumentResolvers);
m.setHandlerMethodReturnValueHandlers(this.returnValueHandlers);
m.invokeAndHandle(webRequest, mavContainer);

// OUTPUT:
// Simplified from RequestMappingHandlerAdapter.invokeHandlerMethod`],
        [`<p>Built-in resolvers and handlers.</p><ul><li><code>@RequestParam</code>, <code>@PathVariable</code>, <code>@RequestHeader</code>, <code>@CookieValue</code>.</li><li><code>@RequestBody</code> and <code>HttpEntity</code> use converters.</li><li><code>Model</code>, <code>Principal</code>, <code>Locale</code>, <code>HttpServletRequest</code> are accepted directly.</li><li><b>Return types:</b> <code>String</code> view name, <code>ResponseEntity</code>, <code>void</code>, <code>Callable</code>, <code>StreamingResponseBody</code>.</li></ul>`,
            r`@GetMapping("/info/{id}")
ResponseEntity<String> info(@PathVariable long id,
                            @RequestParam(defaultValue = "en") String lang,
                            @RequestHeader("User-Agent") String ua,
                            Locale locale) {
    return ResponseEntity.ok(id + " " + lang + " " + locale.getLanguage());
}

// OUTPUT:
// GET /info/5?lang=fr -> 200 5 fr en`],
        [`<p>Mistakes.</p><ul><li><b>Missing parameter:</b> a required <code>@RequestParam</code> gives 400.</li><li><b>Type mismatch:</b> <code>/items/abc</code> for a <code>long</code> gives 400.</li><li><b>Reading the body twice:</b> the input stream is consumed once.</li><li><b>Replacing the adapter bean:</b> loses Boot defaults such as the JSON converter.</li></ul>`,
            r`// WRONG: required param missing -> MissingServletRequestParameterException
@GetMapping("/search") String s(@RequestParam String q) { return q; }
// RIGHT: provide a default or make it optional
@GetMapping("/search2")
String s2(@RequestParam(required = false, defaultValue = "all") String q) {
    return q;
}

// OUTPUT:
// GET /search  -> 400
// GET /search2 -> 200 all`],
        [`<p>Performance.</p><ul><li><b>Reflection is cached:</b> method metadata and parameter resolvers are looked up once per parameter.</li><li><b>Converters:</b> Jackson is the main cost; keep payloads small.</li><li><b>Streaming:</b> use <code>StreamingResponseBody</code> for large downloads.</li><li><b>Avoid</b> reading the whole request into memory.</li></ul>`,
            r`@GetMapping("/export")
StreamingResponseBody export() {
    return out -> {
        for (int i = 0; i < 100_000; i++) {
            out.write(("row " + i + "\n").getBytes());
        }
    };
}

// OUTPUT:
// 200 text streamed row by row, memory stays flat`],
        [`<p>Scenario: inject the current tenant into controllers.</p><ul><li>Annotation <code>@Tenant</code> on a parameter.</li><li>A resolver reads the tenant from a header.</li><li>Controllers need no boilerplate.</li></ul>`,
            r`public class TenantResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.hasParameterAnnotation(Tenant.class);
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer c,
            NativeWebRequest r, WebDataBinderFactory f) {
        return r.getHeader("X-Tenant");
    }
}

// OUTPUT:
// GET /data  X-Tenant: acme -> controller receives tenant "acme"`]
    ),
    'mvc-handlerexceptionresolver': dv(
        [`<p>How resolution works.</p><ul><li><b>Catch:</b> <code>doDispatch</code> catches the exception and calls <code>processHandlerException</code>.</li><li><b>Loop:</b> each resolver in <code>handlerExceptionResolvers</code> gets a chance.</li><li><b>ExceptionHandlerExceptionResolver:</b> finds an <code>@ExceptionHandler</code> method in the controller, then in advice beans, with the closest exception type.</li><li><b>ResponseStatusExceptionResolver:</b> reads <code>@ResponseStatus</code> and <code>ResponseStatusException</code>.</li><li><b>DefaultHandlerExceptionResolver:</b> maps framework exceptions to status codes.</li></ul>`,
            r`protected ModelAndView processHandlerException(HttpServletRequest req,
        HttpServletResponse res, Object handler, Exception ex) {
    for (HandlerExceptionResolver r : this.handlerExceptionResolvers) {
        ModelAndView mv = r.resolveException(req, res, handler, ex);
        if (mv != null) return mv;
    }
    throw ex;      // nobody handled it
}

// OUTPUT:
// Simplified from DispatcherServlet.processHandlerException`],
        [`<p>Ways to handle errors.</p><ul><li><b>@ExceptionHandler</b> in the controller or advice.</li><li><b>@ResponseStatus</b> on an exception class.</li><li><b>ResponseStatusException</b> thrown inline.</li><li><b>ResponseEntityExceptionHandler</b> base class for standard exceptions.</li><li><b>Custom HandlerExceptionResolver</b> bean for special cases.</li></ul>`,
            r`@RestControllerAdvice
class Errors extends ResponseEntityExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail bad(IllegalArgumentException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
    }
}
// inline alternative
// throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no user");

// OUTPUT:
// {"title":"Bad Request","status":400,"detail":"age must be positive"}`],
        [`<p>Mistakes.</p><ul><li><b>Catching Exception broadly:</b> hides bugs and wrong status codes.</li><li><b>Returning 200 with an error body:</b> breaks clients and monitoring.</li><li><b>Leaking stack traces:</b> keep <code>server.error.include-stacktrace=never</code>.</li><li><b>Handler in advice not picked:</b> missing scan, or an earlier handler with a closer type.</li></ul>`,
            r`// WRONG: always 200 and loses the real status
@ExceptionHandler(Exception.class)
Map<String, String> all(Exception e) { return Map.of("error", e.getMessage()); }

// RIGHT: specific type and correct status
@ExceptionHandler(NoSuchElementException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
Map<String, String> missing(NoSuchElementException e) {
    return Map.of("error", e.getMessage());
}

// OUTPUT:
// Missing item -> 404 {"error":"No item"}`],
        [`<p>Performance and robustness.</p><ul><li>Handlers should be cheap; log once, not per layer.</li><li>Use correlation ids in the error body.</li><li>Do not catch and rethrow in each controller.</li><li>Disable the whitelabel page for APIs.</li></ul>`,
            r`# application.properties
server.error.include-stacktrace=never
server.error.include-message=never
spring.mvc.problemdetails.enabled=true

# OUTPUT:
# Errors return RFC 7807 bodies without internal details`],
        [`<p>Scenario: unified error format for a public API.</p><ul><li>One advice class for the whole application.</li><li>Validation errors list the failing fields.</li><li>Unknown errors return 500 with a trace id and are logged.</li></ul>`,
            r`@RestControllerAdvice
class ApiAdvice {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException e) {
        var p = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        p.setProperty("errors", e.getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage()).toList());
        return p;
    }
}

// OUTPUT:
// {"status":400,"errors":["email: must be a well-formed email address"]}`]
    ),
    'mvc-viewresolver': dv(
        [`<p>How view resolution works.</p><ul><li><b>View name:</b> the controller returns a string or a <code>ModelAndView</code>.</li><li><b>Loop:</b> <code>resolveViewName</code> asks each <code>ViewResolver</code> in order.</li><li><b>Base class:</b> <code>AbstractCachingViewResolver</code> caches views by name and locale.</li><li><b>Render:</b> <code>View.render(model, request, response)</code> writes the page.</li><li><b>Default name:</b> if the controller returns nothing, <code>RequestToViewNameTranslator</code> derives the name from the URL.</li></ul>`,
            r`protected View resolveViewName(String name, Map<String, Object> model,
        Locale locale, HttpServletRequest req) throws Exception {
    for (ViewResolver vr : this.viewResolvers) {
        View view = vr.resolveViewName(name, locale);
        if (view != null) return view;
    }
    return null;
}

// OUTPUT:
// null for all resolvers -> ServletException: Could not resolve view with name 'x'`],
        [`<p>Resolver types.</p><ul><li><code>InternalResourceViewResolver</code>: JSP and servlet forwards.</li><li><code>ThymeleafViewResolver</code>, <code>FreeMarkerViewResolver</code>, <code>MustacheViewResolver</code>.</li><li><code>BeanNameViewResolver</code>: view name equals a bean name.</li><li><code>ContentNegotiatingViewResolver</code>: choose by Accept header.</li><li><code>XmlViewResolver</code> and <code>ResourceBundleViewResolver</code>: legacy.</li></ul>`,
            r`@Configuration
class ViewCfg implements WebMvcConfigurer {
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.enableContentNegotiation(new MappingJackson2JsonView());
        registry.jsp("/WEB-INF/views/", ".jsp");
    }
}

// OUTPUT:
// Accept: application/json -> JSON view of the model
// Accept: text/html        -> /WEB-INF/views/<name>.jsp`],
        [`<p>Mistakes.</p><ul><li><b>Wrong prefix or suffix:</b> 404 for the template.</li><li><b>Missing starter:</b> without <code>spring-boot-starter-thymeleaf</code> the name is not resolved.</li><li><b>@Controller instead of @RestController:</b> a returned String is read as a view name.</li><li><b>JSP in an executable jar:</b> not supported well; use Thymeleaf or a WAR.</li></ul>`,
            r`// WRONG: returns "Hello" which is looked up as a view named Hello
@Controller
class Bad {
    @GetMapping("/h") String h() { return "Hello"; }
}

// RIGHT: use @ResponseBody or @RestController for data
@Controller
class Good {
    @GetMapping("/h") @ResponseBody String h() { return "Hello"; }
}

// OUTPUT:
// Bad  -> 500 Error resolving template [Hello]
// Good -> 200 Hello`],
        [`<p>Performance.</p><ul><li><b>View cache:</b> <code>AbstractCachingViewResolver</code> caches views; keep it enabled.</li><li><b>Template cache:</b> <code>spring.thymeleaf.cache=true</code> in production and false in development.</li><li><b>Many resolvers:</b> fewer resolvers means less lookup per request.</li><li><b>Fragments and gzip:</b> reduce output size.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
server.compression.enabled=true

# OUTPUT:
# Templates are parsed once and reused for later requests`],
        [`<p>Scenario: the same URL serves HTML for browsers and JSON for API clients.</p><ul><li>Content negotiation picks the output.</li><li>The model is the shared data.</li><li>Tests check both representations.</li></ul>`,
            r`@Controller
class ProductPage {
    @GetMapping(value = "/products", produces = "text/html")
    String page(Model m) {
        m.addAttribute("items", List.of("pen"));
        return "products";
    }

    @GetMapping(value = "/products", produces = "application/json")
    @ResponseBody List<String> json() { return List.of("pen"); }
}

// OUTPUT:
// Accept: text/html        -> products.html rendered
// Accept: application/json -> ["pen"]`]
    )
};
