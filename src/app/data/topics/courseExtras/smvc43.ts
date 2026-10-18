// Spring extras, batch smvc43 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc43Extras: Record<string, Extra> = {
    'mvc-dispatcherservlet-request-flow-interview': x(
        ['<b>DispatcherServlet</b> is the front controller of Spring MVC: one servlet that receives every request and delegates the work to other components.',
            '<b>Flow</b>: HandlerMapping finds the handler, HandlerAdapter calls it, the controller returns a view name or body, and a ViewResolver or message converter writes the response.',
            '<b>Interceptors</b> run before and after the handler (<code>preHandle</code>, <code>postHandle</code>, <code>afterCompletion</code>).'],
        ['<b>Handler chain</b>: <code>getHandler()</code> returns a <code>HandlerExecutionChain</code> holding the handler and its interceptors.',
            '<b>Exceptions</b> thrown by the handler go to the <code>HandlerExceptionResolver</code> beans, for example <code>@ExceptionHandler</code> and <code>@ControllerAdvice</code> methods.',
            '<b>REST responses</b> skip view resolution: a <code>@ResponseBody</code> return value is written by an <code>HttpMessageConverter</code>.'],
        ['<b>Entry point</b>: <code>doService()</code> calls <code>doDispatch()</code>, which holds the whole algorithm.',
            '<b>Strategy beans</b> such as mappings, adapters, resolvers and converters are discovered from the context and can be replaced.',
            '<b>Boot</b> registers the servlet through <code>DispatcherServletAutoConfiguration</code> mapped to <code>/</code>.'],
        [['F', 'What is the DispatcherServlet?', 'The front controller servlet of Spring MVC. Every request goes through it and it delegates to mappings, adapters and view resolvers.'],
            ['F', 'Which component finds the controller method?', 'A HandlerMapping, usually RequestMappingHandlerMapping, which matches the URL and HTTP method.'],
            ['M', 'What is the order of the main steps?', 'HandlerMapping, interceptors preHandle, HandlerAdapter invokes the method, postHandle, view rendering, afterCompletion.'],
            ['M', 'How is JSON written for a REST controller?', 'The return value handler picks an HttpMessageConverter (Jackson) and writes the body, so no view is resolved.'],
            ['S', 'Where do exceptions go?', 'doDispatch catches them and asks the HandlerExceptionResolvers in order, such as ExceptionHandlerExceptionResolver.'],
            ['S', 'Can you have several DispatcherServlets?', 'Yes, each has its own child WebApplicationContext, useful for separating an API from an admin area.']],
        [['Print the sequence with an interceptor.',
            r`@Component
class TraceInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        System.out.println("preHandle " + h.getClass().getSimpleName());
        return true;
    }
    public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
                                Object h, Exception ex) {
        System.out.println("afterCompletion");
    }
}
// GET /hello to a controller method

// OUTPUT:
// preHandle HandlerMethod
// afterCompletion`],
            ['Enable debug logging of the flow.',
                r`# application.properties
logging.level.org.springframework.web.servlet.DispatcherServlet=DEBUG

// OUTPUT:
// DispatcherServlet : GET "/hello", parameters={}
// RequestMappingHandlerMapping : Mapped to HelloController#hello()
// DispatcherServlet : Completed 200 OK`]],
        [['Test the full flow with MockMvc.',
            r`@WebMvcTest(HelloController.class)
class HelloTest {
    @Autowired MockMvc mvc;
    @Test void ok() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(content().string("hi"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Return a view name versus a body.',
                r`@Controller
class PageController {
    @GetMapping("/page") String page() { return "home"; }  // ViewResolver
    @GetMapping("/text") @ResponseBody String text() { return "raw"; }
}

// OUTPUT:
// GET /page -> renders home.html
// GET /text -> raw`]]
    ),
    'mvc-handlermapping-interview': x(
        ['<b>HandlerMapping</b> is a strategy interface that maps an incoming request to a handler, usually a controller method.',
            '<b>RequestMappingHandlerMapping</b> is the default one: it reads <code>@RequestMapping</code>, <code>@GetMapping</code> and similar annotations.',
            '<b>Result</b>: a <code>HandlerExecutionChain</code> with the handler plus the matching interceptors, or nothing, which gives a 404.'],
        ['<b>Matching</b> uses URL pattern, HTTP method, params, headers, <code>consumes</code> and <code>produces</code>.',
            '<b>Other mappings</b>: <code>BeanNameUrlHandlerMapping</code>, <code>RouterFunctionMapping</code> and <code>SimpleUrlHandlerMapping</code> for static resources.',
            '<b>Ordering</b>: several mappings are tried in order, and the first that returns a handler wins.'],
        ['<b>Startup scan</b>: at startup each controller method is registered in a mapping registry as a <code>RequestMappingInfo</code>.',
            '<b>Ambiguity</b>: two methods matching the same request cause an <code>IllegalStateException: Ambiguous mapping</code> at startup or request time.',
            '<b>Path patterns</b>: Spring 6 uses <code>PathPatternParser</code>, which is faster than the old AntPathMatcher.'],
        [['F', 'What does a HandlerMapping do?', 'It finds which handler (controller method) should process a request.'],
            ['F', 'Which mapping handles @RequestMapping?', 'RequestMappingHandlerMapping.'],
            ['M', 'What does it return?', 'A HandlerExecutionChain: the handler plus interceptors.'],
            ['M', 'What happens when nothing matches?', 'No handler is found, so DispatcherServlet sends 404 (NoHandlerFoundException or NoResourceFoundException).'],
            ['S', 'How is the best match chosen when several patterns fit?', 'RequestMappingInfo compares conditions; the more specific pattern wins, for example /users/42 over /users/{id}.'],
            ['S', 'How do you add a custom mapping?', 'Declare another HandlerMapping bean and set its order, or implement WebMvcRegistrations for the annotation-based one.']],
        [['List all mappings from the bean.',
            r`@Autowired RequestMappingHandlerMapping mapping;

@PostConstruct void dump() {
    mapping.getHandlerMethods().forEach((k, v) ->
        System.out.println(k + " -> " + v.getMethod().getName()));
}

// OUTPUT:
// { GET [/hello] } -> hello
// { POST [/users] } -> create`],
            ['Narrow a mapping with conditions.',
                r`@GetMapping(value = "/report", produces = "application/json",
            params = "year")
Report json(@RequestParam int year) { ... }

// OUTPUT:
// GET /report?year=2024 Accept: application/json -> 200
// GET /report (no year) -> 400`]],
        [['Ambiguous mapping failure.',
            r`@GetMapping("/a") String one() { return "1"; }
@GetMapping("/a") String two() { return "2"; }

// OUTPUT:
// IllegalStateException: Ambiguous mapping. Cannot map 'two' method
// to { GET [/a] }: There is already 'one' mapped.`],
            ['Test that a route exists.',
                r`mvc.perform(get("/nope")).andExpect(status().isNotFound());
mvc.perform(get("/hello")).andExpect(status().isOk());

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-handleradapter-interview': x(
        ['<b>HandlerAdapter</b> knows how to actually invoke a handler. DispatcherServlet does not call controllers itself, it asks an adapter.',
            '<b>Why</b>: handlers can be of different types (annotated methods, <code>HttpRequestHandler</code>, functional routes), and the adapter hides the difference.',
            '<b>Main adapter</b>: <code>RequestMappingHandlerAdapter</code> invokes <code>@RequestMapping</code> methods and returns a <code>ModelAndView</code> or writes the body.'],
        ['<b>Two methods</b>: <code>supports(handler)</code> says whether the adapter fits, and <code>handle(...)</code> calls the handler.',
            '<b>Argument resolution</b> is done by <code>HandlerMethodArgumentResolver</code>s (for <code>@RequestParam</code>, <code>@RequestBody</code> and more).',
            '<b>Return values</b> are processed by <code>HandlerMethodReturnValueHandler</code>s (view name, <code>ResponseEntity</code>, <code>@ResponseBody</code>).'],
        ['<b>InvocableHandlerMethod</b> does the reflection call after the arguments are resolved.',
            '<b>Binding and validation</b> happen through <code>WebDataBinder</code> and <code>@InitBinder</code> methods before the call.',
            '<b>Custom resolver</b>: register a <code>HandlerMethodArgumentResolver</code> through <code>WebMvcConfigurer</code> to inject your own types.'],
        [['F', 'What is a HandlerAdapter?', 'The component that invokes the chosen handler for DispatcherServlet.'],
            ['F', 'Why not call the controller directly?', 'Handlers have different shapes, and the adapter pattern lets the servlet stay generic.'],
            ['M', 'Which adapter runs annotated controllers?', 'RequestMappingHandlerAdapter.'],
            ['M', 'Who converts request data to method arguments?', 'HandlerMethodArgumentResolvers used by the adapter.'],
            ['S', 'How does @ResponseBody get written?', 'A return value handler (RequestResponseBodyMethodProcessor) uses an HttpMessageConverter.'],
            ['S', 'How would you inject the current tenant into a method parameter?', 'Write a custom HandlerMethodArgumentResolver and register it via WebMvcConfigurer.addArgumentResolvers.']],
        [['A custom argument resolver.',
            r`public class TenantResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.getParameterType() == Tenant.class;
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer c,
            NativeWebRequest req, WebDataBinderFactory f) {
        return new Tenant(req.getHeader("X-Tenant"));
    }
}

// OUTPUT:
// controller method hello(Tenant t) receives Tenant[acme]`],
            ['Register it.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> l) {
        l.add(new TenantResolver());
    }
}

// OUTPUT:
// no output; the resolver is now consulted for every handler method`]],
        [['Use the injected type.',
            r`@GetMapping("/whoami")
String who(Tenant t) { return t.name(); }

// OUTPUT:
// GET /whoami with header X-Tenant: acme -> acme`],
            ['Test the header based argument.',
                r`mvc.perform(get("/whoami").header("X-Tenant", "acme"))
   .andExpect(content().string("acme"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-viewresolver-interview': x(
        ['<b>ViewResolver</b> turns the logical view name returned by a controller (for example <code>home</code>) into a real <code>View</code> object that renders the page.',
            '<b>Purpose</b>: controllers stay free of file paths and technology, so JSP, Thymeleaf or FreeMarker can be swapped.',
            '<b>Not used</b> for <code>@RestController</code> or <code>@ResponseBody</code>, which write the body directly.'],
        ['<b>InternalResourceViewResolver</b> adds a prefix and suffix, for example <code>/WEB-INF/views/</code> + name + <code>.jsp</code>.',
            '<b>ThymeleafViewResolver</b> is set up by Spring Boot and looks in <code>classpath:/templates/</code>.',
            '<b>Prefixes</b> <code>redirect:</code> and <code>forward:</code> in a view name are handled specially and skip the template.'],
        ['<b>ContentNegotiatingViewResolver</b> picks a view by the Accept header or extension and delegates to other resolvers.',
            '<b>Chain</b>: resolvers are ordered, and the first one that returns a non-null view wins.',
            '<b>Caching</b>: resolved views are cached by name, which is why a template change needs devtools or cache off in development.'],
        [['F', 'What does a ViewResolver do?', 'It maps a logical view name to a View implementation.'],
            ['F', 'What is the prefix and suffix for?', 'They build the template path from a short name, like /WEB-INF/views/ + home + .jsp.'],
            ['M', 'Which resolver does Boot configure for Thymeleaf?', 'ThymeleafViewResolver through ThymeleafAutoConfiguration.'],
            ['M', 'What happens with return "redirect:/list"?', 'UrlBasedViewResolver creates a RedirectView, which sends an HTTP 302 to /list.'],
            ['S', 'Why is the view not resolved in a REST controller?', 'The return value handler for @ResponseBody writes the body, so the view stage is skipped.'],
            ['S', 'How do you combine JSP and Thymeleaf?', 'Register both resolvers with different order values and view names patterns (viewNames).']],
        [['Classic JSP configuration.',
            r`@Bean
ViewResolver jspResolver() {
    InternalResourceViewResolver v = new InternalResourceViewResolver();
    v.setPrefix("/WEB-INF/views/");
    v.setSuffix(".jsp");
    return v;
}

// OUTPUT:
// return "home" -> /WEB-INF/views/home.jsp`],
            ['Boot properties for the same job.',
                r`# application.properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
spring.thymeleaf.cache=false

# OUTPUT:
# view names now resolve with the prefix and suffix;
Thymeleaf cache is off`]],
        [['Redirect after POST.',
            r`@PostMapping("/save")
String save(Item i) {
    repo.save(i);
    return "redirect:/items";
}

// OUTPUT:
// POST /save -> 302 Location: /items`],
            ['Test the view name.',
                r`mvc.perform(get("/page"))
   .andExpect(status().isOk())
   .andExpect(view().name("home"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-model-vs-modelmap-vs-modelandview': x(
        ['<b>Model</b> is an interface for passing attributes from the controller to the view; Spring injects it as a method parameter.',
            '<b>ModelMap</b> is a <code>LinkedHashMap</code> based implementation with the same job and a few helper methods.',
            '<b>ModelAndView</b> holds both the model data and the view name in one return object.'],
        ['<b>Model</b> is the most common: take <code>Model m</code>, call <code>m.addAttribute(&quot;k&quot;, v)</code> and return the view name as a String.',
            '<b>ModelAndView</b> is useful when the method decides the view and data together, or sets a status.',
            '<b>All three</b> end up in the same underlying <code>ModelAndViewContainer</code> model.'],
        ['<b>Differences</b> are mostly API style: Model is an interface, ModelMap is a class that is also a Map, ModelAndView is a return holder.',
            '<b>Redirects</b>: model attributes become URL query parameters on <code>redirect:</code>, so use <code>RedirectAttributes</code> to avoid that.',
            '<b>REST</b>: none of them are needed with <code>@ResponseBody</code>.'],
        [['F', 'What does Model do?', 'It carries data from the controller to the view.'],
            ['F', 'What does ModelAndView contain?', 'A view name (or View) and the model data.'],
            ['M', 'Model versus ModelMap?', 'Model is an interface with addAttribute methods; ModelMap is a Map implementation. Both fill the same model.'],
            ['M', 'When prefer ModelAndView?', 'When you want to return the view and data together, or build the result programmatically.'],
            ['S', 'What happens to model attributes on redirect?', 'Simple values are appended to the redirect URL as query parameters unless RedirectAttributes is used.'],
            ['S', 'What is the implicit model?', 'The BindingAwareModelMap that Spring creates for each request and shares with @ModelAttribute methods.']],
        [['The three styles.',
            r`@GetMapping("/a") String a(Model m) {
    m.addAttribute("msg", "A");
    return "page";
}
@GetMapping("/b") String b(ModelMap m) {
    m.addAttribute("msg", "B");
    return "page";
}
@GetMapping("/c") ModelAndView c() {
    return new ModelAndView("page", "msg", "C");
}

// OUTPUT:
// page.html shows msg: A, B or C
// all three produce the same page`],
            ['Flash attributes on redirect.',
                r`@PostMapping("/save")
String save(RedirectAttributes ra) {
    ra.addFlashAttribute("ok", "Saved");
    return "redirect:/list";
}

// OUTPUT:
// 302 to /list; "ok" is available once on the next request`]],
        [['Set a status with ModelAndView.',
            r`ModelAndView mv = new ModelAndView("error");
mv.setStatus(HttpStatus.NOT_FOUND);
mv.addObject("reason", "missing");
return mv;

// OUTPUT:
// 404 with the error view and reason=missing`],
            ['Assert the model in a test.',
                r`mvc.perform(get("/a"))
   .andExpect(model().attribute("msg", "A"))
   .andExpect(view().name("page"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-controller-vs-restcontroller': x(
        ['<b>@Controller</b> marks a web component whose methods usually return a view name for server-side rendering.',
            '<b>@RestController</b> is <code>@Controller</code> plus <code>@ResponseBody</code>: every method returns data written straight to the response.',
            '<b>Use</b> @Controller for HTML pages and @RestController for JSON APIs.'],
        ['<b>@ResponseBody</b> on a method in a @Controller gives the same behavior for that method only.',
            '<b>Return type</b>: in a @Controller a String is a view name; in a @RestController it is the response text.',
            '<b>Conversion</b>: objects are turned into JSON by Jackson through an <code>HttpMessageConverter</code>.'],
        ['<b>Meta annotation</b>: <code>@RestController</code> is annotated with both <code>@Controller</code> and <code>@ResponseBody</code>.',
            '<b>Handling</b>: the return value handler is <code>RequestResponseBodyMethodProcessor</code> for body methods and <code>ViewNameMethodReturnValueHandler</code> for views.',
            '<b>Mixing</b>: use <code>ResponseEntity</code> for status and headers in either style.'],
        [['F', 'Difference between @Controller and @RestController?', '@RestController adds @ResponseBody, so return values are written as the body instead of resolved as views.'],
            ['F', 'Which one for a JSON API?', '@RestController.'],
            ['M', 'What does returning a String do in each?', 'In @Controller it is a view name; in @RestController it is plain text in the body.'],
            ['M', 'Can @Controller return JSON?', 'Yes, by adding @ResponseBody to the method or using ResponseEntity.'],
            ['S', 'Which component writes the JSON?', 'An HttpMessageConverter (MappingJackson2HttpMessageConverter) chosen by content negotiation.'],
            ['S', 'Why did my REST endpoint return a 404 for a view?', 'It was annotated with @Controller without @ResponseBody, so the String was treated as a missing view name.']],
        [['Side by side.',
            r`@Controller
class PageController {
    @GetMapping("/home") String home() { return "home"; }   // view
}
@RestController
class ApiController {
    @GetMapping("/api/user") User user() { return new User(1, "Abaji"); }
}

// OUTPUT:
// GET /home -> HTML from home.html
// GET /api/user -> {"id":1,"name":"Abaji"}`],
            ['@ResponseBody on one method.',
                r`@Controller
class MixedController {
    @GetMapping("/view") String view() { return "page"; }
    @GetMapping("/data") @ResponseBody Map<String, Integer> data() {
        return Map.of("count", 3);
    }
}

// OUTPUT:
// GET /data -> {"count":3}`]],
        [['The classic mistake.',
            r`@Controller
class Oops {
    @GetMapping("/hello") String hello() { return "hello"; }
}

// OUTPUT:
// Error resolving template [hello] (expected JSON text "hello")`],
            ['Test JSON output.',
                r`mvc.perform(get("/api/user"))
   .andExpect(content().contentType("application/json"))
   .andExpect(jsonPath("$.name").value("Abaji"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-requestmapping-vs-getmapping': x(
        ['<b>@RequestMapping</b> is the general annotation that maps a request to a method and accepts any HTTP method through <code>method</code>.',
            '<b>@GetMapping</b>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code> and <code>@PatchMapping</code> are shortcuts for it with the method preset.',
            '<b>Class level</b>: put <code>@RequestMapping</code> on the controller for a shared base path.'],
        ['<b>Equivalence</b>: <code>@GetMapping(&quot;/x&quot;)</code> means <code>@RequestMapping(value = &quot;/x&quot;, method = RequestMethod.GET)</code>.',
            '<b>Attributes</b>: <code>value</code>/<code>path</code>, <code>params</code>, <code>headers</code>, <code>consumes</code> and <code>produces</code> work on both.',
            '<b>No method</b> given on @RequestMapping means it matches every HTTP method.'],
        ['<b>Composed annotations</b>: each shortcut is meta-annotated with <code>@RequestMapping</code>, and Spring merges the attributes.',
            '<b>Safety</b>: shortcuts make the intent clear and prevent accidentally exposing a state change over GET.',
            '<b>405</b>: a path that exists with a different HTTP method returns 405 Method Not Allowed.'],
        [['F', 'What is @GetMapping?', 'A shortcut for @RequestMapping(method = GET).'],
            ['F', 'Where can @RequestMapping be placed?', 'On a class for a common prefix and on methods for the rest of the path.'],
            ['M', 'Which attributes narrow a mapping?', 'path, method, params, headers, consumes and produces.'],
            ['M', 'What does @RequestMapping without a method do?', 'It matches all HTTP methods.'],
            ['S', 'What status when the URL exists but the method is wrong?', '405 Method Not Allowed with an Allow header.'],
            ['S', 'How is @GetMapping implemented?', 'It is a composed annotation with @RequestMapping(method = RequestMethod.GET) as meta annotation, merged by AnnotatedElementUtils.']],
        [['Equivalent forms.',
            r`@RequestMapping(value = "/hi", method = RequestMethod.GET)
String a() { return "hi"; }

@GetMapping("/hi2")
String b() { return "hi"; }

// OUTPUT:
// GET /hi -> hi
// GET /hi2 -> hi`],
            ['Class level prefix.',
                r`@RestController
@RequestMapping("/api/orders")
class OrderController {
    @GetMapping("/{id}") Order one(@PathVariable long id) { ... }
    @PostMapping Order create(@RequestBody Order o) { ... }
}

// OUTPUT:
// GET /api/orders/7 -> order 7
// POST /api/orders -> created`]],
        [['Wrong method gives 405.',
            r`mvc.perform(post("/hi")).andExpect(status().isMethodNotAllowed());

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Restrict by media type.',
                r`@PostMapping(path = "/upload", consumes = "application/json",
             produces = "application/json")
Result up(@RequestBody Data d) { ... }

// OUTPUT:
// Content-Type text/plain -> 415 Unsupported Media Type`]]
    ),
    'mvc-requestparam-vs-pathvariable': x(
        ['<b>@RequestParam</b> reads a query string or form parameter, for example <code>/users?role=admin</code>.',
            '<b>@PathVariable</b> reads a value from the URL path itself, for example <code>/users/42</code> with <code>/users/{id}</code>.',
            '<b>Rule of thumb</b>: use the path variable to identify a resource, and request parameters to filter, sort or page.'],
        ['<b>Required</b>: <code>@RequestParam</code> is required by default; use <code>required = false</code> or <code>defaultValue</code>.',
            '<b>Names</b>: when the parameter name differs, write <code>@RequestParam(&quot;q&quot;)</code> or <code>@PathVariable(&quot;id&quot;)</code>.',
            '<b>Conversion</b>: both convert text to <code>int</code>, <code>long</code>, enums or dates through the ConversionService.'],
        ['<b>Missing</b>: a missing required param gives 400 (<code>MissingServletRequestParameterException</code>).',
            '<b>Bad type</b>: <code>/users/abc</code> for a <code>long</code> gives 400 (<code>MethodArgumentTypeMismatchException</code>).',
            '<b>Resolvers</b>: <code>RequestParamMethodArgumentResolver</code> and <code>PathVariableMethodArgumentResolver</code> do the work.'],
        [['F', 'Difference between the two?', 'RequestParam reads query or form parameters; PathVariable reads a template variable from the URL path.'],
            ['F', 'Example URL for each?', '/search?name=ann for RequestParam; /users/42 for PathVariable.'],
            ['M', 'Is @RequestParam required?', 'Yes by default; set required=false or a defaultValue to make it optional.'],
            ['M', 'What if the path variable has the wrong type?', 'A MethodArgumentTypeMismatchException is raised and the response is 400.'],
            ['S', 'Which fits REST resource identity better?', 'PathVariable, because the id is part of the resource URI; filters belong in query parameters.'],
            ['S', 'How can a parameter be optional with Java types?', 'Use Optional&lt;T&gt;, a defaultValue, or a nullable wrapper type with required=false.']],
        [['Both together.',
            r`@GetMapping("/users/{id}/orders")
List<Order> orders(@PathVariable long id,
                   @RequestParam(defaultValue = "0") int page,
                   @RequestParam(required = false) String status) {
    return service.find(id, status, page);
}
// GET /users/5/orders?page=1&status=PAID

// OUTPUT:
// id=5 page=1 status=PAID`],
            ['Regex in the path.',
                r`@GetMapping("/files/{name:[a-z]+}.{ext}")
String file(@PathVariable String name, @PathVariable String ext) {
    return name + "." + ext;
}

// OUTPUT:
// GET /files/report.pdf -> report.pdf`]],
        [['Missing parameter.',
            r`mvc.perform(get("/search")).andExpect(status().isBadRequest());
mvc.perform(get("/search").param("q", "java")).andExpect(status().isOk());

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Wrong type in the path.',
                r`mvc.perform(get("/users/abc")).andExpect(status().isBadRequest());

// OUTPUT:
// MethodArgumentTypeMismatchException: Failed to convert value "abc" to long`]]
    ),
    'mvc-requestbody-vs-modelattribute': x(
        ['<b>@RequestBody</b> reads the whole HTTP body (usually JSON) and converts it to an object with an <code>HttpMessageConverter</code>.',
            '<b>@ModelAttribute</b> binds request parameters (query string or form fields) onto an object field by field.',
            '<b>Choose</b>: JSON APIs use @RequestBody; HTML forms use @ModelAttribute.'],
        ['<b>Content type</b>: @RequestBody needs a body such as <code>application/json</code>; @ModelAttribute works with <code>application/x-www-form-urlencoded</code> and multipart.',
            '<b>Default</b>: a simple object parameter without any annotation is treated as @ModelAttribute.',
            '<b>Validation</b>: add <code>@Valid</code> to either; errors go to a <code>BindingResult</code> for @ModelAttribute or raise an exception for @RequestBody.'],
        ['<b>Converter</b>: Jackson reads the stream once, so only one @RequestBody is allowed per method.',
            '<b>Binder</b>: @ModelAttribute uses <code>WebDataBinder</code>, which sets properties through setters or constructor binding.',
            '<b>Errors</b>: bad JSON gives <code>HttpMessageNotReadableException</code> (400); a wrong content type gives 415.'],
        [['F', 'What does @RequestBody do?', 'Converts the request body, typically JSON, into a Java object.'],
            ['F', 'What does @ModelAttribute do?', 'Binds form or query parameters to an object and adds it to the model.'],
            ['M', 'Which for an HTML form post?', 'ModelAttribute (or no annotation), because form data is parameters, not a JSON body.'],
            ['M', 'How does validation failure differ?', 'ModelAttribute fills BindingResult so the method can continue; RequestBody throws MethodArgumentNotValidException.'],
            ['S', 'Why can there be only one @RequestBody?', 'The body stream is read once by the message converter.'],
            ['S', 'What happens if the JSON is sent with a form content type?', 'A 415 Unsupported Media Type, since no converter reads that type into the object.']],
        [['JSON versus form.',
            r`record UserForm(String name, int age) {}

@PostMapping("/api/users")
UserForm api(@RequestBody UserForm u) { return u; }

@PostMapping("/form/users")
String form(@ModelAttribute UserForm u) { return "ok " + u.name(); }

// OUTPUT:
// POST /api/users {"name":"Abaji","age":30} -> {"name":"Abaji","age":30}
// POST /form/users name=Abaji&age=30 -> ok Abaji`],
            ['Validation with BindingResult.',
                r`@PostMapping("/register")
String register(@Valid @ModelAttribute UserForm u, BindingResult br) {
    if (br.hasErrors()) return "register";   // redisplay the form
    return "redirect:/done";
}

// OUTPUT:
// invalid input -> register view with field errors
// valid input -> 302 /done`]],
        [['Test both bindings.',
            r`mvc.perform(post("/api/users").contentType("application/json")
       .content("{\"name\":\"Abaji\",\"age\":30}"))
   .andExpect(status().isOk());
mvc.perform(post("/form/users").param("name", "Abaji").param("age", "30"))
   .andExpect(status().isOk());

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Bad JSON.',
                r`mvc.perform(post("/api/users").contentType("application/json")
       .content("{bad")).andExpect(status().isBadRequest());

// OUTPUT:
// HttpMessageNotReadableException -> 400`]]
    ),
    'mvc-filter-vs-interceptor-interview': x(
        ['<b>Filter</b> is a Servlet API component (<code>jakarta.servlet.Filter</code>) that runs before the request reaches DispatcherServlet.',
            '<b>Interceptor</b> is a Spring MVC component (<code>HandlerInterceptor</code>) that runs inside DispatcherServlet around the handler.',
            '<b>Use</b> filters for low level concerns (encoding, security, CORS, logging) and interceptors for handler aware logic.'],
        ['<b>Interceptor hooks</b>: <code>preHandle</code> (can stop the request), <code>postHandle</code> and <code>afterCompletion</code>.',
            '<b>Handler access</b>: an interceptor receives the handler object, so it can read annotations on the method; a filter cannot.',
            '<b>Registration</b>: filters as a <code>@Component</code> or <code>FilterRegistrationBean</code>; interceptors through <code>WebMvcConfigurer.addInterceptors</code>.'],
        ['<b>Order</b>: filter chain first, then DispatcherServlet, then interceptors, handler, and back out in reverse.',
            '<b>Scope</b>: filters see every request including static files and errors; interceptors only see requests mapped to Spring handlers.',
            '<b>Body</b>: reading the body in a filter needs a wrapper (<code>ContentCachingRequestWrapper</code>) because the stream is read once.'],
        [['F', 'Where does a filter run versus an interceptor?', 'A filter runs in the servlet container before DispatcherServlet; an interceptor runs inside Spring MVC around the handler.'],
            ['F', 'Name the interceptor methods.', 'preHandle, postHandle and afterCompletion.'],
            ['M', 'Which can read handler annotations?', 'The interceptor, since it receives the HandlerMethod.'],
            ['M', 'How do you register an interceptor?', 'Implement WebMvcConfigurer.addInterceptors and add it with path patterns.'],
            ['S', 'What is the order of execution?', 'Filters, DispatcherServlet, interceptor preHandle, controller, postHandle, view, afterCompletion, then the filters unwind.'],
            ['S', 'Where does Spring Security live?', 'In a filter (DelegatingFilterProxy to FilterChainProxy), so it works before MVC and covers non-MVC resources.']],
        [['A filter.',
            r`@Component
class TimingFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
            FilterChain chain) throws ServletException, IOException {
        long t = System.nanoTime();
        chain.doFilter(q, s);
        System.out.println(q.getRequestURI() + " took "
            + (System.nanoTime() - t) / 1_000_000 + " ms");
    }
}

// OUTPUT: (varies)
// /hello took 4 ms`],
            ['An interceptor with path patterns.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry reg) {
        reg.addInterceptor(new AuthInterceptor())
           .addPathPatterns("/admin/**")
           .excludePathPatterns("/admin/login");
    }
}

// OUTPUT:
// /admin/users -> AuthInterceptor.preHandle runs
// /admin/login -> skipped`]],
        [['Block a request in preHandle.',
            r`public boolean preHandle(HttpServletRequest q, HttpServletResponse s,
        Object h) throws IOException {
    if (q.getHeader("X-Key") == null) {
        s.sendError(401);
        return false;                // stop the chain
    }
    return true;
}

// OUTPUT:
// no header -> 401, handler not called`],
            ['Test the interceptor.',
                r`mvc.perform(get("/admin/users")).andExpect(status().isUnauthorized());
mvc.perform(get("/admin/users").header("X-Key", "k")).andExpect(status().isOk());

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    )
};

export const smvc43Deep: Record<string, Deep> = {
    'mvc-dispatcherservlet-request-flow-interview': dv(
        [`<p>Everything happens in <code>DispatcherServlet.doDispatch()</code>.</p><ul><li><b>Lookup:</b> <code>getHandler()</code> asks each HandlerMapping until one returns a chain.</li><li><b>Adapter:</b> <code>getHandlerAdapter()</code> picks the adapter whose <code>supports()</code> is true.</li><li><b>Interceptors:</b> <code>applyPreHandle</code> runs in order, and a false result stops the flow.</li><li><b>Invoke:</b> <code>ha.handle()</code> returns a ModelAndView or null when the body is already written.</li><li><b>Render:</b> <code>processDispatchResult</code> resolves exceptions, then renders the view.</li></ul>`,
            r`// simplified from DispatcherServlet.doDispatch
HandlerExecutionChain chain = getHandler(request);
if (chain == null) {
    noHandlerFound(request, response);
    return;
}
HandlerAdapter ha = getHandlerAdapter(chain.getHandler());
if (!chain.applyPreHandle(request, response)) return;
ModelAndView mv = ha.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
processDispatchResult(request, response, chain, mv, null);

// OUTPUT:
// log (DEBUG): GET "/hello" -> Mapped to HelloController#hello() -> 200 OK`],
        [`<p>Variants and options:</p><ul><li><b>Multiple servlets:</b> register more <code>DispatcherServlet</code> beans with different paths.</li><li><b>Path:</b> <code>spring.mvc.servlet.path</code> sets a prefix in Boot.</li><li><b>404 handling:</b> <code>throwExceptionIfNoHandlerFound</code> lets @ControllerAdvice handle it.</li><li><b>Async:</b> returning <code>Callable</code> or <code>DeferredResult</code> frees the container thread.</li></ul>`,
            r`# application.properties
spring.mvc.servlet.path=/app
spring.mvc.throw-exception-if-no-handler-found=true
spring.web.resources.add-mappings=false

# OUTPUT:
# GET /app/hello -> controller;
GET /app/unknown -> NoHandlerFoundException`],
        [`<p>Common mistakes:</p><ul><li><b>Controller not scanned:</b> it sits outside the base package of <code>@SpringBootApplication</code>, so no mapping exists (404).</li><li><b>Wrong servlet path:</b> forgetting the prefix in URLs.</li><li><b>Swallowed exceptions:</b> a broad handler hides root causes.</li><li><b>Blocking calls:</b> long work on the request thread exhausts the pool.</li></ul>`,
            r`// WRONG: package com.other is not under com.shop (the application class)
package com.other;
@RestController class LostController {
    @GetMapping("/lost") String lost() { return "x"; }
}
// FIX: move it under com.shop or @ComponentScan("com.other")

// OUTPUT:
// before: GET /lost -> 404
// after: GET /lost -> x`],
        [`<p>Performance notes:</p><ul><li><b>Mapping lookup</b> is a registry lookup, not a scan, so it is cheap.</li><li><b>Heavy interceptors</b> add cost to every request.</li><li><b>Threads:</b> tune <code>server.tomcat.threads.max</code> for blocking work.</li><li><b>Async:</b> offload slow calls with <code>DeferredResult</code> or virtual threads.</li></ul>`,
            r`# application.properties (Spring Boot 3.2+ with Java 21)
spring.threads.virtual.enabled=true
server.tomcat.threads.max=200

# OUTPUT:
# request handling runs on virtual threads;
blocking I/O no longer ties up platform threads`],
        [`<p>Scenario: a slow endpoint. Turn on DEBUG for the DispatcherServlet and add a timing interceptor to see whether time goes to the handler or to rendering.</p><ul><li><b>preHandle:</b> record the start time.</li><li><b>afterCompletion:</b> log the elapsed time with the handler name.</li></ul>`,
            r`public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
        Object h, Exception ex) {
    Long t0 = (Long) q.getAttribute("t0");
    log.info("{} {} took {} ms", q.getMethod(), q.getRequestURI(),
        (System.nanoTime() - t0) / 1_000_000);
}

// OUTPUT: (varies)
// GET /orders took 182 ms`]
    ),
    'mvc-handlermapping-interview': dv(
        [`<p>How the annotation mapping works:</p><ul><li><b>Startup:</b> <code>afterPropertiesSet</code> scans beans with @Controller or @RequestMapping and builds a <code>RequestMappingInfo</code> per method.</li><li><b>Registry:</b> infos are stored in a <code>MappingRegistry</code> with a direct URL lookup map plus a pattern list.</li><li><b>Request:</b> <code>lookupHandlerMethod</code> collects candidates, sorts them with a comparator and takes the best.</li><li><b>Result:</b> a <code>HandlerMethod</code> wrapped into a <code>HandlerExecutionChain</code>.</li></ul>`,
            r`// conceptual
RequestMappingInfo info = RequestMappingInfo
    .paths("/users/{id}").methods(RequestMethod.GET).build();
registry.register(info, controllerBean, method);
HandlerMethod hm = mapping.getHandler(request).getHandler() instanceof HandlerMethod h
    ? h : null;

// OUTPUT:
// GET /users/42 -> UserController#one(long)`],
        [`<p>Options on a mapping:</p><ul><li><b>path:</b> templates, wildcards <code>*</code> and <code>**</code>, regex like <code>{id:[0-9]+}</code>.</li><li><b>method:</b> one or several HTTP methods.</li><li><b>params and headers:</b> require or forbid values, for example <code>params = &quot;!debug&quot;</code>.</li><li><b>consumes and produces:</b> media type matching.</li><li><b>Versioning:</b> use a header or path prefix to separate API versions.</li></ul>`,
            r`@GetMapping(path = "/v/{id:[0-9]+}", headers = "X-Api=2")
String v2(@PathVariable long id) { return "v2:" + id; }

// OUTPUT:
// GET /v/7 with X-Api: 2 -> v2:7
// GET /v/abc -> 404`],
        [`<p>Mistakes:</p><ul><li><b>Duplicate mappings:</b> two methods with the same conditions fail with Ambiguous mapping.</li><li><b>Trailing slash:</b> Spring 6 no longer matches <code>/users/</code> to <code>/users</code>, so expect 404.</li><li><b>Catch all path:</b> <code>/**</code> hides other handlers and static files.</li><li><b>Missing scan:</b> controller outside the component scan.</li></ul>`,
            r`@GetMapping("/users") String list() { return "list"; }
// GET /users/  -> 404 in Spring 6 (trailing slash match is off)
// FIX: map both or normalise at the proxy
@GetMapping({"/users", "/users/"}) String list2() { return "list"; }

// OUTPUT:
// GET /users -> list
// GET /users/ -> list`],
        [`<p>Performance:</p><ul><li><b>Direct lookup:</b> exact paths use a hash map, so thousands of endpoints stay fast.</li><li><b>Patterns:</b> pre-parsed <code>PathPattern</code> objects avoid string parsing per request.</li><li><b>Avoid</b> regex heavy templates in hot paths.</li></ul>`,
            r`# application.properties
# PathPatternParser is the default since Spring Boot 2.6
spring.mvc.pathmatch.matching-strategy=path_pattern_parser

# OUTPUT:
# no output;
the faster matcher is used for all mappings`],
        [`<p>Scenario: expose the mappings for debugging. Spring Boot Actuator has a <code>mappings</code> endpoint that lists every handler, which helps find ambiguous or missing routes.</p>`,
            r`# application.properties
management.endpoints.web.exposure.include=mappings

# GET /actuator/mappings

# OUTPUT: (shortened)
# {"contexts":{"application":{"mappings":{"dispatcherServlets":{
#   "dispatcherServlet":[{"handler":"UserController#one(long)",
#   "predicate":"{GET [/users/{id}]}"}]}}}}}`]
    ),
    'mvc-handleradapter-interview': dv(
        [`<p>Inside RequestMappingHandlerAdapter:</p><ul><li><b>Prepare:</b> collects @InitBinder, @ModelAttribute and @SessionAttributes methods for the controller.</li><li><b>Invoke:</b> builds a <code>ServletInvocableHandlerMethod</code> with the resolver and handler lists.</li><li><b>Arguments:</b> loops over parameters and finds the first resolver that supports each one.</li><li><b>Return:</b> the first return value handler that supports the type writes or prepares the result.</li></ul>`,
            r`// conceptual flow of invokeAndHandle
Object[] args = getMethodArgumentValues(request, mavContainer);
Object value = doInvoke(args);                  // reflection call
returnValueHandlers.handleReturnValue(value, returnType, mavContainer, request);

// OUTPUT:
// for hello(@RequestParam String n): args=["Abaji"], value="hi Abaji"`],
        [`<p>Built in resolvers and handlers you meet daily:</p><ul><li><b>Arguments:</b> @RequestParam, @PathVariable, @RequestBody, @RequestHeader, @CookieValue, Model, HttpServletRequest, Principal.</li><li><b>Returns:</b> String view name, ModelAndView, ResponseEntity, void, Callable, DeferredResult, @ResponseBody.</li><li><b>Other adapters:</b> HttpRequestHandlerAdapter and HandlerFunctionAdapter for functional endpoints.</li></ul>`,
            r`@GetMapping("/info")
ResponseEntity<String> info(@RequestHeader("User-Agent") String ua,
                            @CookieValue(defaultValue = "none") String sid,
                            Principal p) {
    return ResponseEntity.ok(ua + "|" + sid);
}

// OUTPUT: (varies)
// 200 curl/8.0|none`],
        [`<p>Mistakes:</p><ul><li><b>Unsupported parameter type:</b> an unknown type without annotation is bound as a model attribute and fails to instantiate.</li><li><b>Resolver order:</b> custom resolvers added late may be shadowed by a built in one.</li><li><b>Consuming the body twice</b> in a resolver and in the controller.</li></ul>`,
            r`// WRONG: interface type cannot be created by the data binder
@GetMapping("/x") String x(Tenant t) { ... }   // no resolver registered
// FIX: register TenantResolver in WebMvcConfigurer.addArgumentResolvers

// OUTPUT:
// before: BeanInstantiationException: Failed to instantiate Tenant
// after: injected Tenant`],
        [`<p>Performance:</p><ul><li><b>Reflection</b> cost is small and cached per method.</li><li><b>Resolver lookup</b> results are cached per parameter.</li><li><b>Heavy work</b> in a resolver runs on every request, so cache what you can.</li></ul>`,
            r`public Object resolveArgument(MethodParameter p, ModelAndViewContainer c,
        NativeWebRequest req, WebDataBinderFactory f) {
    // cheap: read header only; avoid database calls here
    return new Tenant(req.getHeader("X-Tenant"));
}

// OUTPUT:
// negligible overhead per request`],
        [`<p>Scenario: a multi tenant API. Reading the tenant header in one resolver removes repeated code from many controllers and keeps them easy to test.</p>`,
            r`@RestController
class InvoiceController {
    @GetMapping("/invoices")
    List<Invoice> all(Tenant t) { return repo.findByTenant(t.name()); }
}

// OUTPUT:
// GET /invoices with X-Tenant: acme -> only acme invoices`]
    ),
    'mvc-viewresolver-interview': dv(
        [`<p>Rendering flow after the handler returns a view name:</p><ul><li><b>render():</b> DispatcherServlet calls <code>resolveViewName</code> over all ViewResolvers in order.</li><li><b>Create:</b> <code>UrlBasedViewResolver</code> builds a View (InternalResourceView, ThymeleafView, RedirectView).</li><li><b>Prefixes:</b> <code>redirect:</code> and <code>forward:</code> are checked before the normal resolve.</li><li><b>Render:</b> <code>view.render(model, request, response)</code> writes the page.</li></ul>`,
            r`// conceptual
for (ViewResolver vr : viewResolvers) {
    View view = vr.resolveViewName("home", locale);
    if (view != null) {
        view.render(model, request, response);
        break;
    }
}

// OUTPUT:
// "home" -> ThymeleafView(templates/home.html) -> HTML`],
        [`<p>Variants:</p><ul><li><b>InternalResourceViewResolver:</b> JSP; it matches any name, so keep it last.</li><li><b>ThymeleafViewResolver / FreeMarkerViewResolver:</b> template engines.</li><li><b>BeanNameViewResolver:</b> view name equals a View bean name.</li><li><b>ContentNegotiatingViewResolver:</b> chooses by media type.</li><li><b>Order:</b> <code>setOrder</code> controls the chain.</li></ul>`,
            r`@Bean
BeanNameViewResolver beanNameResolver() {
    BeanNameViewResolver v = new BeanNameViewResolver();
    v.setOrder(0);                    // before the template resolvers
    return v;
}
@Bean("pdfReport") View pdfReport() { return new PdfReportView(); }

// OUTPUT:
// return "pdfReport" -> PdfReportView renders the PDF`],
        [`<p>Mistakes:</p><ul><li><b>Template not found:</b> wrong folder or name, giving <code>TemplateInputException</code>.</li><li><b>@RestController returning a view name</b> prints the text instead of a page.</li><li><b>JSP in a Boot jar:</b> JSP needs a war or an exploded setup.</li><li><b>Catch all resolver first:</b> InternalResourceViewResolver ahead of others swallows every name.</li></ul>`,
            r`// WRONG: file is at src/main/resources/templates/pages/home.html
@GetMapping("/") String home() { return "home"; }
// FIX: return the full logical path
@GetMapping("/") String home2() { return "pages/home"; }

// OUTPUT:
// before: TemplateInputException: Error resolving template [home]
// after: page renders`],
        [`<p>Performance:</p><ul><li><b>View cache</b> keeps resolved views, so disable it only in development.</li><li><b>Template cache</b> in Thymeleaf avoids reparsing.</li><li><b>Redirect after POST</b> prevents double submit.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.mvc.view.prefix=
spring.web.resources.cache.cachecontrol.max-age=1d

# OUTPUT:
# templates are parsed once;
static assets cached by the browser for a day`],
        [`<p>Scenario: one controller serving both HTML and PDF. A custom View bean for the PDF plus a BeanNameViewResolver ahead of Thymeleaf lets the controller return a name without caring about the format.</p>`,
            r`@GetMapping("/report")
String report(Model m, @RequestParam(defaultValue = "html") String f) {
    m.addAttribute("rows", service.rows());
    return f.equals("pdf") ? "pdfReport" : "report";
}

// OUTPUT:
// /report -> HTML table; /report?f=pdf -> PDF download`]
    ),
    'mvc-model-vs-modelmap-vs-modelandview': dv(
        [`<p>Internals:</p><ul><li><b>Container:</b> each request has a <code>ModelAndViewContainer</code> that owns a <code>BindingAwareModelMap</code>.</li><li><b>Model parameter:</b> the resolver injects that same map as a <code>Model</code> or <code>ModelMap</code>.</li><li><b>ModelAndView:</b> when returned, its model is merged into the container.</li><li><b>Exposure:</b> before rendering, the model entries become request attributes for the view.</li></ul>`,
            r`@GetMapping("/p")
String p(Model model, ModelMap map) {
    model.addAttribute("a", 1);
    map.addAttribute("b", 2);
    System.out.println(model == map || model.asMap().equals(map));
    return "page";
}

// OUTPUT:
// true   (both views see a=1 and b=2 of the same model)`],
        [`<p>API variants:</p><ul><li><b>Model:</b> <code>addAttribute</code>, <code>addAllAttributes</code>, <code>mergeAttributes</code>, <code>containsAttribute</code>.</li><li><b>Naming:</b> <code>addAttribute(Object)</code> derives the key from the type, so a <code>User</code> becomes <code>user</code>.</li><li><b>ModelAndView:</b> constructors take a name, a model or a status; use <code>addObject</code>.</li><li><b>@ModelAttribute method:</b> adds data to every request of the controller.</li></ul>`,
            r`@ModelAttribute("countries")
List<String> countries() { return List.of("IN", "US"); }   // every view gets it

@GetMapping("/form")
String form(Model m) {
    m.addAttribute(new UserForm("", 0));     // key: userForm
    return "form";
}

// OUTPUT:
// form view has countries and userForm in the model`],
        [`<p>Mistakes:</p><ul><li><b>Using Model with @RestController:</b> data is ignored, only the return body is sent.</li><li><b>Null attribute value:</b> <code>addAttribute(&quot;k&quot;, null)</code> is allowed but the view sees nothing.</li><li><b>Large objects in the model</b> kept in the session by <code>@SessionAttributes</code>.</li><li><b>Redirect leaks:</b> simple values appear in the URL.</li></ul>`,
            r`// WRONG: model values appended to the redirect URL
@PostMapping("/s1") String s1(Model m) {
    m.addAttribute("id", 5);
    return "redirect:/list";  // /list?id=5
}
// FIX: use flash attributes
@PostMapping("/s2") String s2(RedirectAttributes ra) {
    ra.addFlashAttribute("id", 5);
    return "redirect:/list";
}

// OUTPUT:
// s1 -> Location: /list?id=5
// s2 -> Location: /list`],
        [`<p>Performance: the model is a small per request map, so the cost is the data you put in it. Keep entities small, send DTOs and avoid loading lazy collections inside the view.</p>`,
            r`@GetMapping("/orders")
String orders(Model m) {
    m.addAttribute("orders", service.summaries());   // DTO list, not entities
    return "orders";
}

// OUTPUT:
// one query for summaries; no lazy loading while rendering`],
        [`<p>Scenario: a search page. The controller adds the results and the current filter so the form can show them again.</p>`,
            r`@GetMapping("/search")
String search(@RequestParam(defaultValue = "") String q, Model m) {
    m.addAttribute("q", q);
    m.addAttribute("hits", service.search(q));
    return "search";
}

// OUTPUT:
// /search?q=java -> page shows the box with java and the hit list`]
    ),
    'mvc-controller-vs-restcontroller': dv(
        [`<p>Under the hood:</p><ul><li><b>Meta annotation:</b> <code>@RestController</code> = <code>@Controller</code> + <code>@ResponseBody</code>, and @Controller itself is a @Component.</li><li><b>Handler selection:</b> if the method or class has @ResponseBody, <code>RequestResponseBodyMethodProcessor</code> handles the return.</li><li><b>Otherwise</b> a String goes to <code>ViewNameMethodReturnValueHandler</code>.</li><li><b>Negotiation:</b> the converter is chosen from the Accept header and return type.</li></ul>`,
            r`@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Controller
@ResponseBody
public @interface RestController {
    @AliasFor(annotation = Controller.class) String value() default "";
}

// OUTPUT:
// (source of org.springframework.web.bind.annotation.RestController, simplified)`],
        [`<p>Variants:</p><ul><li><b>ResponseEntity:</b> control status, headers and body.</li><li><b>@ResponseStatus:</b> fixed status such as 201.</li><li><b>produces:</b> force JSON or XML.</li><li><b>Mixed controller:</b> HTML methods and a few @ResponseBody methods.</li><li><b>@ControllerAdvice vs @RestControllerAdvice:</b> same split for exception handlers.</li></ul>`,
            r`@RestController
@RequestMapping("/api/items")
class ItemApi {
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    Item add(@RequestBody Item i) { return repo.save(i); }

    @GetMapping("/{id}")
    ResponseEntity<Item> get(@PathVariable long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
}

// OUTPUT:
// POST /api/items -> 201 {"id":1,...}
// GET /api/items/99 -> 404`],
        [`<p>Mistakes:</p><ul><li><b>@Controller for JSON:</b> the String is treated as a view name.</li><li><b>@RestController for pages:</b> the template name is printed as text.</li><li><b>Returning entities:</b> lazy loading and infinite recursion in JSON.</li><li><b>No Jackson on classpath:</b> 406 Not Acceptable.</li></ul>`,
            r`// WRONG: bidirectional entity -> infinite JSON recursion
@GetMapping("/users/{id}") User user(@PathVariable long id) { ... }
// FIX: return a DTO record
record UserDto(long id, String name) {}
@GetMapping("/v2/users/{id}") UserDto dto(@PathVariable long id) { ... }

// OUTPUT:
// before: HttpMessageNotWritableException: Infinite recursion
// after: {"id":1,"name":"Abaji"}`],
        [`<p>Performance: JSON writing is usually cheap; large payloads need paging, compression and streaming.</p><ul><li><b>Paging:</b> never return unbounded lists.</li><li><b>Compression:</b> <code>server.compression.enabled=true</code>.</li><li><b>Streaming:</b> <code>StreamingResponseBody</code> for big downloads.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.min-response-size=1024
spring.jackson.default-property-inclusion=non_null

# OUTPUT:
# responses over 1 KB are gzipped;
null fields are omitted`],
        [`<p>Scenario: one application serving an admin site and a mobile API. Page controllers use @Controller and Thymeleaf, API controllers use @RestController under <code>/api</code>, and each has its own advice class for errors.</p>`,
            r`@RestControllerAdvice(annotations = RestController.class)
class ApiErrors {
    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<Map<String, String>> nf(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
}

// OUTPUT:
// API error -> {"error":"item 9 not found"}; page controllers keep their error page`]
    ),
    'mvc-requestmapping-vs-getmapping': dv(
        [`<p>How the merge works:</p><ul><li><b>Meta annotation:</b> <code>@GetMapping</code> carries <code>@RequestMapping(method = RequestMethod.GET)</code>.</li><li><b>Lookup:</b> <code>AnnotatedElementUtils.findMergedAnnotation</code> merges attributes with @AliasFor.</li><li><b>Class plus method:</b> <code>RequestMappingInfo.combine</code> joins the class prefix with the method path.</li></ul>`,
            r`@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@RequestMapping(method = RequestMethod.GET)
public @interface GetMapping {
    @AliasFor(annotation = RequestMapping.class) String[] value() default {};
    @AliasFor(annotation = RequestMapping.class) String[] produces() default {};
}

// OUTPUT:
// (simplified source of GetMapping)`],
        [`<p>Syntax options:</p><ul><li><b>Several paths:</b> <code>@GetMapping({&quot;/a&quot;, &quot;/b&quot;})</code>.</li><li><b>Several methods:</b> only with @RequestMapping(method = {GET, HEAD}).</li><li><b>HEAD and OPTIONS:</b> handled automatically for GET mappings.</li><li><b>@HttpExchange:</b> the client side counterpart in Spring 6.</li></ul>`,
            r`@RequestMapping(path = "/ping", method = {RequestMethod.GET, RequestMethod.HEAD})
String ping() { return "pong"; }

@GetMapping({"/a", "/b"}) String ab() { return "ab"; }

// OUTPUT:
// GET /ping -> pong, HEAD /ping -> 200 no body
// GET /a and GET /b -> ab`],
        [`<p>Mistakes:</p><ul><li><b>State change on GET:</b> deleting or updating through a link is unsafe and cacheable.</li><li><b>Using @RequestMapping with no method</b> for an endpoint that should only read.</li><li><b>Body on GET:</b> clients and proxies often drop it.</li><li><b>Wrong verb name:</b> @PostMapping for an idempotent update that should be PUT.</li></ul>`,
            r`// WRONG: any method, including DELETE, reaches this
@RequestMapping("/orders/cancel") String cancel(@RequestParam long id) { ... }
// FIX: explicit verb
@PostMapping("/orders/{id}/cancel") String cancel2(@PathVariable long id) { ... }

// OUTPUT:
// GET /orders/5/cancel -> 405 Method Not Allowed`],
        [`<p>Performance: no difference at runtime, since the mapping is built once at startup. The real gain is clarity, plus HTTP caching only works safely for GET.</p>`,
            r`@GetMapping("/catalog")
ResponseEntity<List<Item>> catalog() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
        .body(service.items());
}

// OUTPUT:
// 200 Cache-Control: max-age=300`],
        [`<p>Scenario: a REST resource with the full set of verbs under one class level path.</p>`,
            r`@RestController
@RequestMapping("/api/books")
class BookApi {
    @GetMapping List<Book> all() { ... }
    @GetMapping("/{id}") Book one(@PathVariable long id) { ... }
    @PostMapping Book add(@RequestBody Book b) { ... }
    @PutMapping("/{id}") Book replace(@PathVariable long id, @RequestBody Book b) { ... }
    @DeleteMapping("/{id}") void remove(@PathVariable long id) { ... }
}

// OUTPUT:
// GET/POST /api/books, GET/PUT/DELETE /api/books/{id}`]
    ),
    'mvc-requestparam-vs-pathvariable': dv(
        [`<p>How they are resolved:</p><ul><li><b>@PathVariable:</b> <code>PathVariableMethodArgumentResolver</code> reads the URI template variables stored as a request attribute during mapping.</li><li><b>@RequestParam:</b> <code>RequestParamMethodArgumentResolver</code> calls <code>request.getParameter</code> or the multipart map.</li><li><b>Conversion:</b> text goes through <code>WebDataBinder</code> and the ConversionService.</li><li><b>Names:</b> parameter names need <code>-parameters</code> (Boot sets it) or an explicit name.</li></ul>`,
            r`@GetMapping("/books/{isbn}")
String book(@PathVariable String isbn,
            @RequestParam(name = "lang", defaultValue = "en") String lang) {
    return isbn + "/" + lang;
}

// OUTPUT:
// GET /books/978-1?lang=fr -> 978-1/fr`],
        [`<p>Variants:</p><ul><li><b>Map:</b> <code>@RequestParam Map&lt;String,String&gt;</code> collects all parameters; <code>@PathVariable Map</code> all path variables.</li><li><b>Multi value:</b> <code>List&lt;Long&gt; ids</code> from <code>?ids=1,2,3</code>.</li><li><b>Optional:</b> <code>Optional&lt;String&gt;</code> or <code>required = false</code>.</li><li><b>Matrix variables:</b> <code>@MatrixVariable</code> for <code>;key=value</code> segments.</li><li><b>Dates:</b> add <code>@DateTimeFormat</code>.</li></ul>`,
            r`@GetMapping("/find")
List<Item> find(@RequestParam List<Long> ids,
                @RequestParam Optional<String> sort,
                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                LocalDate from) {
    return service.find(ids, sort.orElse("id"), from);
}

// OUTPUT:
// GET /find?ids=1,2&from=2024-01-31 -> items 1 and 2 sorted by id`],
        [`<p>Mistakes:</p><ul><li><b>Path variable name mismatch</b> with the template, which gives 500 (<code>MissingPathVariableException</code>).</li><li><b>Forgetting the default</b> on an optional primitive: <code>int</code> with required=false fails when absent.</li><li><b>Sensitive data in the URL</b> ends up in logs; use the body.</li><li><b>Trailing dot</b> in a path variable losing the extension part.</li></ul>`,
            r`// WRONG: template says {id}, parameter is named userId (no explicit name)
@GetMapping("/u/{id}") String u(@PathVariable String userId) { ... }
// FIX
@GetMapping("/u2/{id}") String u2(@PathVariable("id") String userId) { ... }

// OUTPUT:
// before: MissingPathVariableException
// after: works`],
        [`<p>Performance: both are cheap. Concerns are design ones:</p><ul><li><b>Cache keys:</b> path based URLs cache well in CDNs.</li><li><b>Paging:</b> cap <code>size</code> to stop huge queries.</li></ul>`,
            r`@GetMapping("/products")
Page<Product> list(@RequestParam(defaultValue = "0") int page,
                   @RequestParam(defaultValue = "20") int size) {
    return repo.findAll(PageRequest.of(page, Math.min(size, 100)));
}

// OUTPUT:
// GET /products?size=5000 -> at most 100 rows`],
        [`<p>Scenario: a shop API. The resource is identified by the path, the view of it by parameters.</p>`,
            r`@GetMapping("/shops/{shopId}/products")
List<Product> products(@PathVariable long shopId,
                       @RequestParam(required = false) String category,
                       @RequestParam(defaultValue = "price") String sort) {
    return service.find(shopId, category, sort);
}

// OUTPUT:
// GET /shops/3/products?category=toys&sort=price -> toys of shop 3 by price`]
    ),
    'mvc-requestbody-vs-modelattribute': dv(
        [`<p>Internals:</p><ul><li><b>@RequestBody:</b> <code>RequestResponseBodyMethodProcessor</code> picks an <code>HttpMessageConverter</code> by Content-Type and reads the stream.</li><li><b>@ModelAttribute:</b> <code>ModelAttributeMethodProcessor</code> creates the object, then <code>WebDataBinder</code> binds parameters to fields.</li><li><b>Validation:</b> both call the validator when @Valid or @Validated is present.</li><li><b>Advice:</b> <code>RequestBodyAdvice</code> can alter the body before conversion.</li></ul>`,
            r`// binder flow (conceptual)
WebDataBinder binder = binderFactory.createBinder(request, target, "userForm");
binder.bind(new ServletRequestParameterPropertyValues(request));
if (binder.getBindingResult().hasErrors()) { /* BindingResult argument */ }

// OUTPUT:
// name=Abaji&age=30 -> UserForm[name=Abaji, age=30]`],
        [`<p>Variants:</p><ul><li><b>@RequestBody:</b> <code>String</code>, <code>byte[]</code>, <code>Map</code>, DTO, <code>List&lt;DTO&gt;</code>; <code>required = false</code> allows an empty body.</li><li><b>@ModelAttribute:</b> custom name, constructor binding for records, nested properties like <code>address.city</code>.</li><li><b>@RequestPart:</b> parts of multipart requests with JSON.</li><li><b>@InitBinder:</b> restrict allowed fields or add editors.</li></ul>`,
            r`@PostMapping(path = "/upload", consumes = "multipart/form-data")
String upload(@RequestPart("meta") Meta meta,
              @RequestPart("file") MultipartFile file) {
    return meta.title() + ":" + file.getOriginalFilename();
}

// OUTPUT:
// meta part {"title":"CV"} + file cv.pdf -> CV:cv.pdf`],
        [`<p>Mistakes:</p><ul><li><b>JSON to @ModelAttribute:</b> fields stay null because there are no parameters.</li><li><b>Form data to @RequestBody:</b> 415 Unsupported Media Type.</li><li><b>Mass assignment:</b> binding an entity lets clients set fields like <code>role</code>; use a DTO or <code>setAllowedFields</code>.</li><li><b>Missing getters or default constructor</b> for Jackson on a class without records.</li></ul>`,
            r`// WRONG: entity bound directly, client can post role=ADMIN
@PostMapping("/signup") String signup(@ModelAttribute User u) { ... }
// FIX: a DTO with only the allowed fields
record SignupForm(String name, String email) {}
@PostMapping("/signup2") String signup2(@ModelAttribute SignupForm f) { ... }

// OUTPUT:
// role is no longer bindable from the request`],
        [`<p>Performance: JSON parsing dominates for large bodies. Limit the size, avoid deep nesting, and stream with Jackson for huge arrays.</p>`,
            r`# application.properties
server.tomcat.max-http-form-post-size=2MB
spring.servlet.multipart.max-file-size=5MB
spring.jackson.deserialization.fail-on-unknown-properties=true

# OUTPUT:
# oversized bodies are rejected early;
unknown JSON fields cause 400`],
        [`<p>Scenario: the same registration feature offered as a web form and as a mobile API, sharing one DTO and one service.</p>`,
            r`record Signup(@NotBlank String name, @Email String email) {}

@Controller class WebSignup {
    @PostMapping("/signup")
    String form(@Valid @ModelAttribute Signup s, BindingResult br) {
        if (br.hasErrors()) return "signup";
        service.register(s);
        return "redirect:/welcome";
    }
}
@RestController class ApiSignup {
    @PostMapping("/api/signup")
    ResponseEntity<Void> api(@Valid @RequestBody Signup s) {
        service.register(s);
        return ResponseEntity.status(201).build();
    }
}

// OUTPUT:
// form: invalid -> signup page; valid -> 302 /welcome
// api: invalid -> 400; valid -> 201`]
    ),
    'mvc-filter-vs-interceptor-interview': dv(
        [`<p>Where each sits in the stack:</p><ul><li><b>Filter:</b> part of the servlet container; <code>ApplicationFilterChain</code> calls each filter, then the servlet.</li><li><b>Interceptor:</b> stored in the <code>HandlerExecutionChain</code>; DispatcherServlet calls <code>applyPreHandle</code> in order and <code>triggerAfterCompletion</code> in reverse.</li><li><b>Boot:</b> filter beans are registered automatically in the embedded server.</li><li><b>postHandle</b> is skipped when the handler throws, while afterCompletion always runs for interceptors that passed preHandle.</li></ul>`,
            r`client -> Filter A -> Filter B -> DispatcherServlet
   -> Interceptor1.preHandle -> Interceptor2.preHandle -> Controller
   <- Interceptor2.postHandle <- Interceptor1.postHandle -> view render
   <- Interceptor2.afterCompletion <- Interceptor1.afterCompletion
   <- Filter B <- Filter A <- client

// OUTPUT:
// (call order diagram)`],
        [`<p>Options:</p><ul><li><b>OncePerRequestFilter:</b> runs once even with forwards; override <code>shouldNotFilter</code> to skip paths.</li><li><b>FilterRegistrationBean:</b> set URL patterns and order.</li><li><b>@Order:</b> controls the filter sequence.</li><li><b>Interceptor patterns:</b> <code>addPathPatterns</code>, <code>excludePathPatterns</code>, <code>order</code>.</li><li><b>AsyncHandlerInterceptor:</b> hook for async requests.</li></ul>`,
            r`@Bean
FilterRegistrationBean<TimingFilter> timing() {
    FilterRegistrationBean<TimingFilter> b =
        new FilterRegistrationBean<>(new TimingFilter());
    b.addUrlPatterns("/api/*");
    b.setOrder(1);
    return b;
}

// OUTPUT:
// TimingFilter runs only for /api/* requests, first in the chain`],
        [`<p>Mistakes:</p><ul><li><b>Forgetting chain.doFilter</b> so the request hangs or returns an empty page.</li><li><b>Reading the body in a filter</b> without caching it, so the controller gets nothing.</li><li><b>Relying on handler info in a filter</b>, which is not available yet.</li><li><b>Throwing from a filter</b> expecting @ControllerAdvice to catch it (it does not).</li><li><b>Interceptor not applied</b> to static resources or errors.</li></ul>`,
            r`// WRONG: missing chain.doFilter -> empty 200 response
protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
        FilterChain chain) { log.info("seen"); }
// FIX
protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
        FilterChain chain) throws ServletException, IOException {
    log.info("seen");
    chain.doFilter(q, s);
}

// OUTPUT:
// before: blank response; after: normal response`],
        [`<p>Performance: both run on every matching request, so keep them light.</p><ul><li><b>Narrow patterns</b> so they skip static content.</li><li><b>No blocking calls</b> (database, remote) in them if avoidable.</li><li><b>Cache body wrappers</b> only when logging bodies is really needed.</li></ul>`,
            r`reg.addInterceptor(new AuditInterceptor())
   .addPathPatterns("/api/**")
   .excludePathPatterns("/api/health", "/api/static/**");

// OUTPUT:
// health checks and static files bypass the audit interceptor`],
        [`<p>Scenario: request tracing. A filter assigns a correlation id and puts it in the logging MDC for all code, even outside MVC. An interceptor then uses handler annotations to apply per endpoint rate limits.</p>`,
            r`@Component @Order(1)
class CorrelationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest q, HttpServletResponse s,
            FilterChain chain) throws ServletException, IOException {
        String id = Optional.ofNullable(q.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("rid", id);
        s.setHeader("X-Request-Id", id);
        try { chain.doFilter(q, s); } finally { MDC.clear(); }
    }
}

// OUTPUT: (varies)
// every log line carries rid=3f2a...; the response has X-Request-Id`]
    )
};
