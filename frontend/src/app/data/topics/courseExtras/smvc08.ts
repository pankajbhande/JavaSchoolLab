// Spring extras, batch smvc08 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc08Extras: Record<string, Extra> = {
    'mvc-locale': x(
        ['<b>Locale</b> is the language and region (for example <code>en_US</code> or <code>fr_FR</code>) that Spring MVC works out for each request, so messages, dates and numbers can be shown in the user language.',
            '<b>Controller argument</b>: declare a <code>java.util.Locale</code> parameter and Spring fills it with the current request locale.',
            '<b>Default source</b>: the <code>Accept-Language</code> header sent by the browser is used unless another <code>LocaleResolver</code> is configured.'],
        ['<b>LocaleResolver</b> decides the locale: <code>AcceptHeaderLocaleResolver</code> (default), <code>SessionLocaleResolver</code>, <code>CookieLocaleResolver</code> and <code>FixedLocaleResolver</code>.',
            '<b>MessageSource</b> turns a key plus a locale into text from <code>messages_fr.properties</code> style files.',
            '<b>LocaleContextHolder</b> gives the current locale anywhere in the thread, even outside a controller.'],
        ['<b>Bean name</b>: a resolver bean must be named <code>localeResolver</code>, or <code>DispatcherServlet</code> ignores it.',
            '<b>Thread binding</b>: the locale is stored in a thread-local, so it is not visible in new threads you start yourself.',
            '<b>Testing</b>: use <code>MockMvc</code> with <code>.locale(Locale.FRANCE)</code> or an <code>Accept-Language</code> header.'],
        [['F', 'What is a Locale?', 'An object holding a language and optional country that controls how text, dates and numbers are formatted.'],
            ['F', 'How do you get the locale in a controller?', 'Add a Locale parameter to the handler method and Spring injects the resolved locale.'],
            ['M', 'What is the default LocaleResolver?', 'AcceptHeaderLocaleResolver, which reads the Accept-Language request header.'],
            ['M', 'How can a user switch language?', 'Register a LocaleChangeInterceptor with a request parameter and a Session or Cookie locale resolver.'],
            ['S', 'Why is my LocaleResolver bean ignored?', 'DispatcherServlet looks it up by the bean name localeResolver, so a different name is not used.'],
            ['S', 'How do you read the locale in a service?', 'Call LocaleContextHolder.getLocale(), which reads the thread-bound request locale.']],
        [['Locale as a controller argument.',
            r`@RestController
class HelloController {
    @GetMapping("/hello")
    String hello(Locale locale) {
        return "Locale = " + locale + ", language = " + locale.getLanguage();
    }
}
// request: GET /hello with header Accept-Language: fr-FR

// OUTPUT:
// Locale = fr_FR, language = fr`],
            ['Format a date for the locale.',
                r`@GetMapping("/today")
String today(Locale locale) {
    DateTimeFormatter f = DateTimeFormatter
        .ofLocalizedDate(FormatStyle.LONG).withLocale(locale);
    return LocalDate.of(2025, 3, 14).format(f);
}
// GET /today with Accept-Language: en-US, then de-DE

// OUTPUT:
// March 14, 2025
// 14. März 2025`]],
        [['Test with MockMvc.',
            r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void usesRequestLocale() throws Exception {
        mvc.perform(get("/hello").locale(Locale.GERMANY))
           .andExpect(content().string("Locale = de_DE, language = de"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Use LocaleContextHolder in a service.',
                r`@Service
class GreetingService {
    String greet(String name) {
        Locale l = LocaleContextHolder.getLocale();   // request locale
        return l.getLanguage().equals("fr") ? "Bonjour " + name : "Hello " + name;
    }
}

// OUTPUT:
// Accept-Language: fr -> Bonjour Abaji
// Accept-Language: en -> Hello Abaji`]]
    ),

    'mvc-request-attributes': x(
        ['<b>Request attributes</b> are named objects stored on the current <code>HttpServletRequest</code> with <code>setAttribute</code>; they live only until the response is finished.',
            '<b>Read them</b> in a handler with <code>@RequestAttribute</code>, or with <code>request.getAttribute(name)</code>.',
            '<b>Typical use</b>: a filter or interceptor computes something (user id, trace id) and the controller reads it later in the same request.'],
        ['<b>Not parameters</b>: request parameters come from the client; attributes are set by server code, so users cannot forge them.',
            '<b>@RequestAttribute</b> is required by default; use <code>required = false</code> or a default value when it may be missing.',
            '<b>Scope</b>: request attributes differ from session attributes (<code>@SessionAttribute</code>) and from model attributes, which are for the view.'],
        ['<b>Forward</b>: attributes survive a <code>forward:</code> because it is the same request, but they are lost on a <code>redirect:</code>.',
            '<b>Name clashes</b>: use namespaced names such as <code>com.shop.userId</code> to avoid overwriting framework attributes.',
            '<b>Testing</b>: use <code>MockMvc</code> with <code>.requestAttr(name, value)</code> to supply the attribute.'],
        [['F', 'What is a request attribute?', 'A server-side object stored on the HttpServletRequest that lasts for one request.'],
            ['F', 'How do you read one in a controller?', 'Use the @RequestAttribute annotation on a method parameter.'],
            ['M', 'Request parameter versus request attribute?', 'A parameter is sent by the client; an attribute is set by server code during processing.'],
            ['M', 'Does a request attribute survive a redirect?', 'No. A redirect creates a new request; use flash attributes instead.'],
            ['S', 'How does an interceptor pass data to a controller?', 'It calls request.setAttribute in preHandle and the controller reads it with @RequestAttribute.'],
            ['S', 'What happens if a required attribute is missing?', 'Spring throws ServletRequestBindingException, which becomes a 400 response.']],
        [['Filter sets, controller reads.',
            r`@Component
class TraceFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        req.setAttribute("traceId", "T-1001");
        chain.doFilter(req, res);
    }
}

@RestController
class TraceController {
    @GetMapping("/trace")
    String trace(@RequestAttribute("traceId") String id) {
        return "trace=" + id;
    }
}

// OUTPUT:
// GET /trace -> 200 trace=T-1001`],
            ['Optional attribute.',
                r`@GetMapping("/tenant")
String tenant(@RequestAttribute(name = "tenant", required = false) String t) {
    return t == null ? "no tenant" : "tenant=" + t;
}

// OUTPUT:
// GET /tenant -> no tenant (attribute not set)`]],
        [['MockMvc supplies the attribute.',
            r`@WebMvcTest(TraceController.class)
class TraceControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void readsAttribute() throws Exception {
        mvc.perform(get("/trace").requestAttr("traceId", "T-7"))
           .andExpect(content().string("trace=T-7"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Interceptor passes the user id.',
                r`class AuthInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req,
            HttpServletResponse res, Object handler) {
        req.setAttribute("userId", 42L);   // set by server code only
        return true;
    }
}

@GetMapping("/me")
String me(@RequestAttribute Long userId) {
    return "user " + userId;
}

// OUTPUT:
// GET /me -> user 42`]]
    ),

    'mvc-model-modelview': x(
        ['<b>Model</b> is the Spring MVC interface that carries data from the controller to the view; you add named objects and the view reads them while rendering.',
            '<b>Declare it</b> as a handler parameter: <code>String list(Model model)</code>; Spring creates it and passes it in.',
            '<b>Add data</b> with <code>model.addAttribute("name", value)</code> and return the view name as a <code>String</code>.'],
        ['<b>Per request</b>: the model is created for each request and discarded after the view renders.',
            '<b>Implementation</b>: the argument is really a <code>BindingAwareModelMap</code>, a map of attribute names to values.',
            '<b>Model or ModelMap or ModelAndView</b>: all hold the same kind of data; <code>Model</code> is the simplest and most common choice.'],
        ['<b>Exposed to the view</b>: attributes are copied to request attributes (or template variables) by the <code>View</code>.',
            '<b>Name by type</b>: <code>addAttribute(value)</code> without a name derives one, such as <code>userList</code> from a <code>List&lt;User&gt;</code>.',
            '<b>Testing</b>: <code>MockMvc</code> checks it with <code>model().attribute(name, value)</code>.'],
        [['F', 'What is Model in Spring MVC?', 'An interface used to pass data from a controller to the view.'],
            ['F', 'How do you add data to it?', 'Call model.addAttribute with a name and a value.'],
            ['M', 'How long does model data live?', 'For one request; it is gone after the view is rendered.'],
            ['M', 'What class does Spring actually inject?', 'A BindingAwareModelMap, which also manages binding results.'],
            ['S', 'What happens to the model on a redirect?', 'Simple values are appended to the redirect URL as query parameters; use RedirectAttributes for flash data.'],
            ['S', 'Is Model thread safe?', 'It is request scoped and used by one thread, so it needs no synchronization.']],
        [['A controller filling the Model.',
            r`@Controller
class ProductController {
    @GetMapping("/products")
    String list(Model model) {
        model.addAttribute("title", "All products");
        model.addAttribute("products", List.of("Pen", "Book"));
        return "products";       // view name
    }
}

// OUTPUT:
// view "products" renders with title=All products, products=[Pen, Book]`],
            ['Derived attribute name.',
                r`@GetMapping("/users")
String users(Model model) {
    model.addAttribute(List.of("Abaji", "Raoji"));   // name from type
    return "users";
}

// OUTPUT:
// model attribute name: stringList = [Abaji, Raoji]`]],
        [['MockMvc checks the model.',
            r`@WebMvcTest(ProductController.class)
class ProductControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void listFillsModel() throws Exception {
        mvc.perform(get("/products"))
           .andExpect(status().isOk())
           .andExpect(view().name("products"))
           .andExpect(model().attribute("title", "All products"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Model is not session data.',
                r`@GetMapping("/a")
String a(Model m) {
    m.addAttribute("x", 1);
    return "a";
}

@GetMapping("/b")
String b(Model m) {
    System.out.println(m.containsAttribute("x"));   // fresh model each request
    return "b";
}

// OUTPUT:
// false`]]
    ),

    'mvc-modelmap': x(
        ['<b>ModelMap</b> is a <code>LinkedHashMap&lt;String, Object&gt;</code> subclass in Spring that holds model attributes and keeps the order in which you added them.',
            '<b>Use it</b> as a handler parameter: <code>String show(ModelMap map)</code>, then <code>map.addAttribute("k", v)</code>.',
            '<b>Same job as Model</b>: both pass data to the view; <code>ModelMap</code> just exposes the map methods as well.'],
        ['<b>Chaining</b>: <code>addAttribute</code> returns the map, so you can write <code>map.addAttribute("a", 1).addAttribute("b", 2)</code>.',
            '<b>Map methods</b>: <code>get</code>, <code>containsKey</code>, <code>putAll</code> and <code>mergeAttributes</code> are available.',
            '<b>Null values</b>: <code>addAttribute</code> accepts a null value but the name must not be null.'],
        ['<b>Which to pick</b>: prefer <code>Model</code> for new code because it is an interface; use <code>ModelMap</code> when you need map behaviour.',
            '<b>Same instance</b>: Spring passes the same <code>BindingAwareModelMap</code> whichever of the two types you declare.',
            '<b>Pitfall</b>: do not declare both <code>Model</code> and <code>ModelMap</code> and expect separate data; they share one model.'],
        [['F', 'What is ModelMap?', 'A LinkedHashMap based class used to hold attributes for the view.'],
            ['F', 'How do you add an attribute?', 'Call modelMap.addAttribute(name, value).'],
            ['M', 'Difference between Model and ModelMap?', 'Model is an interface; ModelMap is a map class. Both feed the same model.'],
            ['M', 'Does ModelMap keep insertion order?', 'Yes, because it extends LinkedHashMap.'],
            ['S', 'If a method has both Model and ModelMap, how many models exist?', 'One. Spring gives both parameters the same underlying model object.'],
            ['S', 'Can addAttribute take a null name?', 'No, it asserts the name is not null; a null value is allowed.']],
        [['Fill a ModelMap.',
            r`@GetMapping("/profile")
String profile(ModelMap map) {
    map.addAttribute("name", "Abaji")
       .addAttribute("age", 28)
       .addAttribute("skills", List.of("Java", "Spring"));
    return "profile";
}

// OUTPUT:
// model = {name=Abaji, age=28, skills=[Java, Spring]}`],
            ['Use the map methods.',
                r`@GetMapping("/info")
String info(ModelMap map) {
    map.put("a", 1);                       // plain Map method
    map.addAttribute("b", 2);
    System.out.println(map.containsKey("a") + " " + map.keySet());
    return "info";
}

// OUTPUT:
// true [a, b]`]],
        [['One model, two parameters.',
            r`@GetMapping("/both")
String both(Model model, ModelMap map) {
    model.addAttribute("x", 1);
    System.out.println(map.get("x"));      // same underlying model
    return "both";
}

// OUTPUT:
// 1`],
            ['Test the ModelMap data.',
                r`@Test
void profileModel() throws Exception {
    mvc.perform(get("/profile"))
       .andExpect(model().attribute("name", "Abaji"))
       .andExpect(model().attributeExists("skills"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-modelandview-modelview': x(
        ['<b>ModelAndView</b> is a single object that holds both the view (a name or a <code>View</code>) and the model data a handler wants rendered.',
            '<b>Create it</b> as <code>new ModelAndView("viewName")</code> and add data with <code>addObject(name, value)</code>.',
            '<b>Return it</b> from the handler method; <code>DispatcherServlet</code> then picks the view and renders it with the model.'],
        ['<b>Constructors</b>: <code>ModelAndView(String viewName)</code>, <code>(String, String, Object)</code> for one attribute, and <code>(String, Map)</code>.',
            '<b>Extras</b>: <code>setStatus(HttpStatus)</code> sets the response status and <code>setViewName</code> changes the view later.',
            '<b>Redirect</b>: <code>new ModelAndView("redirect:/home")</code> works just like returning a redirect string.'],
        ['<b>Model plus view</b> in one return value is handy when the view depends on logic, but a plain <code>String</code> plus <code>Model</code> is simpler.',
            '<b>Inspect</b>: <code>getModel()</code> and <code>getViewName()</code> help in tests and in <code>HandlerInterceptor.postHandle</code>.',
            '<b>Empty</b>: returning <code>null</code> means the handler handled the response itself.'],
        [['F', 'What is ModelAndView?', 'A holder for the view name and the model data returned by a controller.'],
            ['F', 'How do you add data to it?', 'Call addObject(name, value).'],
            ['M', 'When prefer ModelAndView over String?', 'When you build the view and model together, set a status, or need to change them in an interceptor.'],
            ['M', 'How do you redirect with it?', 'Create new ModelAndView("redirect:/path").'],
            ['S', 'Who consumes the returned ModelAndView?', 'ModelAndViewMethodReturnValueHandler passes it on, and DispatcherServlet resolves and renders the view.'],
            ['S', 'Can an interceptor change it?', 'Yes, postHandle receives it and may alter the view name or model before rendering.']],
        [['Return a ModelAndView.',
            r`@Controller
class OrderController {
    @GetMapping("/order/{id}")
    ModelAndView order(@PathVariable long id) {
        ModelAndView mav = new ModelAndView("orderDetail");
        mav.addObject("orderId", id);
        mav.addObject("status", "SHIPPED");
        return mav;
    }
}

// OUTPUT:
// GET /order/5 -> view orderDetail, model {orderId=5, status=SHIPPED}`],
            ['Set a status and a redirect.',
                r`@GetMapping("/missing")
ModelAndView missing() {
    ModelAndView mav = new ModelAndView("error/404");
    mav.setStatus(HttpStatus.NOT_FOUND);
    return mav;
}

@PostMapping("/save")
ModelAndView save() {
    return new ModelAndView("redirect:/done");
}

// OUTPUT:
// GET /missing -> 404 with view error/404
// POST /save -> 302 Location: /done`]],
        [['Test the returned object.',
            r`@Test
void orderView() throws Exception {
    mvc.perform(get("/order/5"))
       .andExpect(view().name("orderDetail"))
       .andExpect(model().attribute("status", "SHIPPED"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Adjust in an interceptor.',
                r`public void postHandle(HttpServletRequest req, HttpServletResponse res,
        Object handler, ModelAndView mav) {
    if (mav != null && !mav.isEmpty()) {
        mav.addObject("appName", "ShopApp");   // visible to every view
    }
}

// OUTPUT:
// every rendered page can show appName = ShopApp`]]
    ),

    'mvc-adding-data-to-model': x(
        ['<b>Adding data</b> means putting named values into the model so the view can show them; the main call is <code>model.addAttribute(name, value)</code>.',
            '<b>Many at once</b>: <code>addAllAttributes(Map)</code> or <code>addAllAttributes(Collection)</code> adds several values.',
            '<b>Shared data</b>: a method annotated with <code>@ModelAttribute</code> runs before every handler and adds data for all of them.'],
        ['<b>@ModelAttribute method</b>: <code>@ModelAttribute("countries") List&lt;String&gt; countries()</code> fills a dropdown on each request.',
            '<b>Form binding</b>: a <code>@ModelAttribute</code> parameter is created, filled from request parameters and added to the model by name.',
            '<b>@ControllerAdvice</b>: put <code>@ModelAttribute</code> methods in an advice class to add data to every controller.'],
        ['<b>Order</b>: <code>@ModelAttribute</code> methods run before the handler, so the handler may overwrite their values.',
            '<b>Cost</b>: a shared <code>@ModelAttribute</code> method runs on every request of that controller, so keep it cheap or cache the result.',
            '<b>Do not add secrets</b>: anything in the model may be rendered or leaked by a template mistake, so add only what the view needs.'],
        [['F', 'How do you add data to the model?', 'Use model.addAttribute(name, value) in the handler method.'],
            ['F', 'Can you add several attributes at once?', 'Yes, with addAllAttributes using a Map or a Collection.'],
            ['M', 'What does a @ModelAttribute method do?', 'It runs before each handler in the controller and adds its return value to the model.'],
            ['M', 'How do you add data for all controllers?', 'Put the @ModelAttribute method in a @ControllerAdvice class.'],
            ['S', 'What is the problem with expensive @ModelAttribute methods?', 'They run for every request, even those that do not need the data, so they slow all handlers.'],
            ['S', 'What does a @ModelAttribute parameter do?', 'It binds request parameters to an object and also exposes the object in the model under its name.']],
        [['addAttribute and addAllAttributes.',
            r`@GetMapping("/dashboard")
String dashboard(Model model) {
    model.addAttribute("user", "Abaji");
    model.addAllAttributes(Map.of("unread", 3, "plan", "PRO"));
    return "dashboard";
}

// OUTPUT:
// model has user=Abaji, unread=3, plan=PRO (map order varies)`],
            ['Shared data with @ModelAttribute.',
                r`@Controller
@RequestMapping("/register")
class RegisterController {
    @ModelAttribute("countries")
    List<String> countries() { return List.of("India", "Japan", "Brazil"); }

    @GetMapping
    String form() { return "register"; }   // countries is already in the model
}

// OUTPUT:
// GET /register -> view register, model countries=[India, Japan, Brazil]`]],
        [['Global data in a ControllerAdvice.',
            r`@ControllerAdvice
class GlobalModel {
    @ModelAttribute("appName")
    String appName() { return "ShopApp"; }
}

// OUTPUT:
// every controller view receives appName = ShopApp`],
            ['Verify in a test.',
                r`@Test
void dashboardHasData() throws Exception {
    mvc.perform(get("/dashboard"))
       .andExpect(model().attribute("user", "Abaji"))
       .andExpect(model().attribute("unread", 3));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-reading-model-data': x(
        ['<b>Reading model data</b> happens in the view: a template uses the attribute name to show the value the controller added.',
            '<b>In a controller</b> you can read model data already added with <code>model.getAttribute</code>, <code>containsAttribute</code> or <code>asMap()</code>.',
            '<b>Parameters</b>: <code>@ModelAttribute</code> on a handler parameter reads an object that an earlier <code>@ModelAttribute</code> method or a redirect flash put in the model.'],
        ['<b>View side</b>: Thymeleaf, JSP and FreeMarker all read the model by attribute name; in JSP the values are exposed as request attributes.',
            '<b>Flash attributes</b>: <code>RedirectAttributes.addFlashAttribute</code> keeps data for one redirect, and the next handler reads it from the model.',
            '<b>Missing name</b>: a template usually shows an empty value when the attribute does not exist, so typos fail silently.'],
        ['<b>Testing</b>: use <code>model().attribute</code>, <code>model().attributeExists</code> and <code>result.getModelAndView().getModel()</code>.',
            '<b>Types</b>: read with the correct type; <code>getAttribute</code> returns <code>Object</code> and needs a cast.',
            '<b>Scope</b>: model data is not available after the view renders; use the session or a database for data that must last longer.'],
        [['F', 'Where is model data read?', 'In the view template, using the attribute name set by the controller.'],
            ['F', 'How do you check if an attribute exists in the model?', 'Call model.containsAttribute(name).'],
            ['M', 'How do you read data passed through a redirect?', 'Use flash attributes with RedirectAttributes; the target handler sees them in its model.'],
            ['M', 'How does a JSP read the model?', 'The view copies model attributes to request attributes, and the JSP reads them by name.'],
            ['S', 'How do you test model contents with MockMvc?', 'Use andExpect(model().attribute(name, value)) or read the ModelAndView from the MvcResult.'],
            ['S', 'Why does a template show nothing for a wrong name?', 'Missing attributes resolve to null or empty in most templates, so no error is raised.']],
        [['Read inside a handler.',
            r`@GetMapping("/check")
String check(Model model) {
    model.addAttribute("count", 5);
    boolean has = model.containsAttribute("count");
    Object count = model.getAttribute("count");
    System.out.println(has + " " + count + " " + model.asMap().keySet());
    return "check";
}

// OUTPUT:
// true 5 [count]`],
            ['Flash attribute across a redirect.',
                r`@PostMapping("/save")
String save(RedirectAttributes ra) {
    ra.addFlashAttribute("message", "Saved!");
    return "redirect:/list";
}

@GetMapping("/list")
String list(Model model) {
    System.out.println(model.getAttribute("message"));
    return "list";
}

// OUTPUT:
// Saved!`]],
        [['Read the model in a test.',
            r`@Test
void readModel() throws Exception {
    MvcResult res = mvc.perform(get("/check")).andReturn();
    Map<String, Object> m = res.getModelAndView().getModel();
    assertEquals(5, m.get("count"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['A template typo fails silently.',
                r`// controller: model.addAttribute("userName", "Abaji");
// template uses the name "username" (wrong case)
// the page renders an empty value and no error is shown

// OUTPUT:
// Hello !   (expected: Hello Abaji!)`]]
    ),

    'mvc-returning-view-name': x(
        ['<b>Returning a view name</b> means the handler returns a <code>String</code> such as <code>"home"</code>; Spring treats it as a logical view name, not as the response text.',
            '<b>ViewResolver</b> turns the logical name into a real view, for example <code>home</code> into <code>/templates/home.html</code> with Thymeleaf.',
            '<b>@Controller needed</b>: with <code>@RestController</code> or <code>@ResponseBody</code> the string is written to the body instead.'],
        ['<b>Prefixes</b>: <code>redirect:/path</code> sends a 302 to a new URL and <code>forward:/path</code> forwards inside the server.',
            '<b>void return</b>: a <code>void</code> handler uses the request path as the view name by default.',
            '<b>Model together</b>: the view name plus the <code>Model</code> argument gives the view its data.'],
        ['<b>Resolver chain</b>: <code>DispatcherServlet</code> asks each <code>ViewResolver</code> in order until one returns a view.',
            '<b>Post-Redirect-Get</b>: redirect after a successful POST so a browser refresh does not submit the form twice.',
            '<b>Testing</b>: <code>MockMvc</code> checks the name with <code>view().name("home")</code>, and redirects with <code>redirectedUrl</code>.'],
        [['F', 'What does returning a String from a @Controller method mean?', 'It is the logical view name that a ViewResolver turns into a page.'],
            ['F', 'How do you redirect?', 'Return "redirect:/url" from the handler.'],
            ['M', 'Difference between redirect and forward?', 'Redirect sends a new request through the browser; forward stays inside the server in the same request.'],
            ['M', 'Why does my String appear as text instead of a page?', 'The class is a @RestController or the method has @ResponseBody, so the string is the body.'],
            ['S', 'What is Post-Redirect-Get?', 'After a POST, redirect to a GET page so refreshing does not repeat the POST.'],
            ['S', 'What view name is used for a void handler?', 'The view name is derived from the request path by the RequestToViewNameTranslator.']],
        [['Return a view name.',
            r`@Controller
class HomeController {
    @GetMapping("/")
    String home(Model model) {
        model.addAttribute("msg", "Welcome");
        return "home";           // resolved to templates/home.html
    }
}

// OUTPUT:
// GET / -> 200 text/html rendered from home.html with msg=Welcome`],
            ['Redirect and forward.',
                r`@PostMapping("/login")
String login() { return "redirect:/dashboard"; }   // browser makes a new GET

@GetMapping("/old")
String old() { return "forward:/new"; }            // same request, URL unchanged

// OUTPUT:
// POST /login -> 302 Location: /dashboard
// GET /old -> content of /new, address bar still /old`]],
        [['Test view name and redirect.',
            r`@Test
void viewAndRedirect() throws Exception {
    mvc.perform(get("/")).andExpect(view().name("home"));
    mvc.perform(post("/login"))
       .andExpect(status().is3xxRedirection())
       .andExpect(redirectedUrl("/dashboard"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['RestController returns text.',
                r`@RestController
class TextController {
    @GetMapping("/t")
    String t() { return "home"; }   // written as the body, no view lookup
}

// OUTPUT:
// GET /t -> 200 body: home`]]
    ),

    'mvc-returning-modelandview': x(
        ['<b>Returning ModelAndView</b> means the handler gives back one object holding the view and the data; Spring renders that view with that model.',
            '<b>Build it</b>: <code>new ModelAndView("view")</code> then <code>addObject("key", value)</code>, and <code>return mav;</code>.',
            '<b>Return type</b> of the method is <code>ModelAndView</code>; the class must be a <code>@Controller</code>, not a <code>@RestController</code>.'],
        ['<b>Choose the view at run time</b>: set the name from logic, such as <code>mav.setViewName(isAdmin ? "admin" : "user")</code>.',
            '<b>Status</b>: <code>mav.setStatus(HttpStatus.CREATED)</code> sets the response code with the page.',
            '<b>Empty result</b>: <code>new ModelAndView()</code> without a name makes Spring use the default view name from the path.'],
        ['<b>Handler return handler</b>: <code>ModelAndViewMethodReturnValueHandler</code> copies the object into the request <code>ModelAndViewContainer</code>.',
            '<b>Exception resolvers</b>: a <code>HandlerExceptionResolver</code> can also return a <code>ModelAndView</code> to show an error page.',
            '<b>Style</b>: modern code usually returns a view name plus <code>Model</code>; use <code>ModelAndView</code> when you need its extra control.'],
        [['F', 'What does a handler returning ModelAndView do?', 'It supplies both the view and the data, which Spring then renders.'],
            ['F', 'How do you set the view name?', 'Pass it to the constructor or call setViewName.'],
            ['M', 'How do you set an HTTP status with it?', 'Call setStatus on the ModelAndView before returning it.'],
            ['M', 'Can it be used in a @RestController?', 'No; a RestController writes return values to the body, so use a @Controller.'],
            ['S', 'Which component handles the returned ModelAndView?', 'ModelAndViewMethodReturnValueHandler, inside RequestMappingHandlerAdapter.'],
            ['S', 'How can an exception handler show an error page?', 'Return a ModelAndView with an error view from a HandlerExceptionResolver or an @ExceptionHandler method.']],
        [['Choose view by role.',
            r`@GetMapping("/home")
ModelAndView home(@RequestParam(defaultValue = "user") String role) {
    ModelAndView mav = new ModelAndView();
    mav.setViewName(role.equals("admin") ? "adminHome" : "userHome");
    mav.addObject("role", role);
    return mav;
}

// OUTPUT:
// GET /home?role=admin -> view adminHome, model {role=admin}
// GET /home            -> view userHome, model {role=user}`],
            ['Error page from an exception handler.',
                r`@ExceptionHandler(IllegalArgumentException.class)
ModelAndView bad(IllegalArgumentException ex) {
    ModelAndView mav = new ModelAndView("error/bad");
    mav.addObject("reason", ex.getMessage());
    mav.setStatus(HttpStatus.BAD_REQUEST);
    return mav;
}

// OUTPUT:
// 400 page error/bad showing reason = the exception message`]],
        [['Test the ModelAndView.',
            r`@Test
void adminHome() throws Exception {
    mvc.perform(get("/home").param("role", "admin"))
       .andExpect(view().name("adminHome"))
       .andExpect(model().attribute("role", "admin"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Same result with String and Model.',
                r`@GetMapping("/home2")
String home2(@RequestParam(defaultValue = "user") String role, Model model) {
    model.addAttribute("role", role);
    return role.equals("admin") ? "adminHome" : "userHome";
}

// OUTPUT:
// identical rendering to the ModelAndView version`]]
    ),

    'mvc-view-rendering': x(
        ['<b>View rendering</b> is the last step of a request: <code>DispatcherServlet</code> resolves the view name to a <code>View</code> object and calls <code>view.render(model, request, response)</code>.',
            '<b>ViewResolver</b> maps the logical name to a view: <code>ThymeleafViewResolver</code>, <code>InternalResourceViewResolver</code> for JSP, and so on.',
            '<b>Result</b>: the view merges the model data into the template and writes the HTML to the response.'],
        ['<b>Flow</b>: handler returns name and model, <code>DispatcherServlet.render</code> asks resolvers, the first non-null <code>View</code> renders.',
            '<b>Spring Boot</b> auto-configures resolvers for Thymeleaf, FreeMarker and others when the library is on the classpath; templates live in <code>src/main/resources/templates</code>.',
            '<b>Content negotiation</b>: <code>ContentNegotiatingViewResolver</code> picks a view that matches what the client accepts, such as HTML or JSON.'],
        ['<b>Order</b>: several resolvers can exist; set <code>setOrder</code> so the right one runs first, because a catch-all resolver can swallow names.',
            '<b>Errors</b>: a missing template gives a <code>TemplateInputException</code> (Thymeleaf) and a 500 response.',
            '<b>Testing</b>: <code>MockMvc</code> does not run a real template engine for JSP, so check the view name; use <code>@SpringBootTest</code> to test real HTML output.'],
        [['F', 'What is view rendering?', 'Turning the model data and a template into the HTML response.'],
            ['F', 'Which object renders the view?', 'The View object chosen by a ViewResolver, via its render method.'],
            ['M', 'What does a ViewResolver do?', 'It converts a logical view name into an actual View implementation.'],
            ['M', 'Where do Thymeleaf templates go in Spring Boot?', 'In src/main/resources/templates, by default with an .html suffix.'],
            ['S', 'Which DispatcherServlet method triggers rendering?', 'render, called from processDispatchResult after the handler and interceptors finish.'],
            ['S', 'How do you control resolver order?', 'Implement Ordered or call setOrder on each resolver; the lowest value is asked first.']],
        [['Boot templates and a view.',
            r`// src/main/resources/templates/hello.html  (Thymeleaf)
// <h1 th:text="#{greeting}">Hi</h1>   (any model expression works here)

@Controller
class HelloController {
    @GetMapping("/hello")
    String hello(Model model) {
        model.addAttribute("name", "Abaji");
        return "hello";      // ThymeleafViewResolver -> hello.html
    }
}

// OUTPUT:
// GET /hello -> 200 text/html;charset=UTF-8 <h1>...</h1>`],
            ['Configure JSP style resolver.',
                r`@Bean
ViewResolver jspResolver() {
    InternalResourceViewResolver vr = new InternalResourceViewResolver();
    vr.setPrefix("/WEB-INF/views/");
    vr.setSuffix(".jsp");
    return vr;
}

// OUTPUT:
// view name "home" -> /WEB-INF/views/home.jsp`]],
        [['Test the rendered HTML.',
            r`@SpringBootTest
@AutoConfigureMockMvc
class HelloRenderTest {
    @Autowired MockMvc mvc;

    @Test
    void rendersHtml() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(content().contentTypeCompatibleWith("text/html"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Custom View object.',
                r`@Component("report")          // bean name = view name
class ReportView implements View {
    public String getContentType() { return "text/plain"; }
    public void render(Map<String, ?> model, HttpServletRequest req,
            HttpServletResponse res) throws Exception {
        res.setContentType("text/plain");
        res.getWriter().write("Report for " + model.get("name"));
    }
}

// OUTPUT:
// return "report" from a handler -> Report for Abaji`]]
    )
};

export const smvc08Deep: Record<string, Deep> = {
    'mvc-locale': dv(
        [`<p>The locale is resolved once per request by <code>DispatcherServlet</code>.</p><ul><li><b>doService:</b> it stores the resolver as a request attribute and calls <code>buildLocaleContext</code>.</li><li><b>Lookup:</b> the <code>LocaleResolver</code> bean must be named <code>localeResolver</code>.</li><li><b>Argument:</b> <code>ServletRequestMethodArgumentResolver</code> fills a <code>Locale</code> parameter from the resolver.</li><li><b>Thread:</b> <code>FrameworkServlet</code> sets <code>LocaleContextHolder</code> for the request thread and clears it afterwards.</li></ul>`,
            r`// Request: Accept-Language: fr-CH, fr;q=0.9, en;q=0.8
Locale l = RequestContextUtils.getLocale(request);
System.out.println(l);
System.out.println(LocaleContextHolder.getLocale());

// OUTPUT:
// fr_CH
// fr_CH`],
        [`<p>Resolver choices:</p><ul><li><b>AcceptHeaderLocaleResolver:</b> default, read-only; <code>setLocale</code> throws an exception.</li><li><b>SessionLocaleResolver:</b> stores the locale in the HTTP session.</li><li><b>CookieLocaleResolver:</b> stores it in a cookie; works across sessions.</li><li><b>FixedLocaleResolver:</b> always one locale.</li><li><b>LocaleChangeInterceptor:</b> reads a parameter such as <code>lang</code> and calls <code>setLocale</code>.</li></ul>`,
            r`@Configuration
class I18nConfig implements WebMvcConfigurer {
    @Bean
    LocaleResolver localeResolver() {          // name must be localeResolver
        SessionLocaleResolver r = new SessionLocaleResolver();
        r.setDefaultLocale(Locale.ENGLISH);
        return r;
    }
    @Override
    public void addInterceptors(InterceptorRegistry reg) {
        LocaleChangeInterceptor i = new LocaleChangeInterceptor();
        i.setParamName("lang");
        reg.addInterceptor(i);
    }
}

// OUTPUT:
// GET /hello?lang=fr -> session locale becomes fr for later requests`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong bean name:</b> a method called <code>resolver()</code> is ignored; name it <code>localeResolver</code>.</li><li><b>Language switch ignored:</b> the default header resolver cannot change locale, so use Session or Cookie.</li><li><b>Missing fallback:</b> a locale with no bundle should fall back to the base file.</li><li><b>Wrong thread:</b> <code>@Async</code> code does not see the request locale.</li><li><b>Default JVM locale:</b> set a default so servers behave the same everywhere.</li></ul>`,
            r`@Bean
LocaleResolver resolver() { return new SessionLocaleResolver(); }   // WRONG name

@Bean
LocaleResolver localeResolver() { return new SessionLocaleResolver(); } // RIGHT

// OUTPUT:
// With the wrong name Spring Boot keeps AcceptHeaderLocaleResolver and
// ?lang=fr has no effect.`],
        [`<p>Tuning points:</p><ul><li><b>Cost:</b> the header resolver is cheap and stateless, so it scales well.</li><li><b>Session resolver:</b> adds memory and sticky-session needs; a cookie resolver avoids that.</li><li><b>MessageSource:</b> set <code>setCacheSeconds</code> or rely on the default cache, and avoid reloading bundles on every request.</li><li><b>Formatters:</b> reuse <code>DateTimeFormatter</code> instances per locale.</li></ul>`,
            r`# application.properties
spring.messages.basename=messages
spring.messages.cache-duration=3600s
spring.messages.fallback-to-system-locale=false

# OUTPUT:
# bundles are cached for an hour;
unknown locales fall back to messages.properties`],
        [`<p>A shop supports English, French and German. Choose a cookie resolver so the choice persists, show prices with locale-aware formatting, and test each language with MockMvc.</p><ul><li><b>Cookie:</b> keeps the language between visits.</li><li><b>Switch link:</b> <code>?lang=de</code> in the page header.</li><li><b>Test:</b> one test per supported language.</li></ul>`,
            r`@Bean
LocaleResolver localeResolver() {
    CookieLocaleResolver r = new CookieLocaleResolver("lang");
    r.setDefaultLocale(Locale.ENGLISH);
    r.setCookieMaxAge(Duration.ofDays(30));
    return r;
}

@GetMapping("/price")
String price(Locale l) {
    return NumberFormat.getCurrencyInstance(l).format(1234.5);
}

// OUTPUT: (symbols depend on JDK locale data)
// en_US -> $1,234.50
// de_DE -> 1.234,50 EUR style output`]
    ),

    'mvc-request-attributes': dv(
        [`<p>Attributes are stored in the servlet container request object.</p><ul><li><b>Storage:</b> <code>setAttribute</code> writes to a map on the request; there is no copy to the client.</li><li><b>Binding:</b> <code>RequestAttributeMethodArgumentResolver</code> calls <code>request.getAttribute(name, SCOPE_REQUEST)</code>.</li><li><b>Required:</b> a missing required value throws <code>ServletRequestBindingException</code>.</li><li><b>Lifetime:</b> the container discards them after the response; wrappers and forwards share them.</li></ul>`,
            r`// What the resolver does, simplified
Object value = request.getAttribute("traceId");
if (value == null && required) {
    throw new ServletRequestBindingException(
        "Missing request attribute 'traceId' of type String");
}

// OUTPUT:
// missing attribute -> HTTP 400 Bad Request`],
        [`<p>Variants:</p><ul><li><b>@RequestAttribute:</b> read a request-scope value.</li><li><b>@SessionAttribute:</b> read a session value without creating a session.</li><li><b>@SessionAttributes:</b> keep model attributes in the session for a controller.</li><li><b>RequestContextHolder:</b> read attributes outside a controller.</li><li><b>@RequestScope:</b> a bean that lives for one request.</li></ul>`,
            r`@GetMapping("/vars")
String vars(@RequestAttribute("userId") Long uid,
            @SessionAttribute(name = "cart", required = false) Cart cart,
            HttpServletRequest req) {
    Object trace = req.getAttribute("traceId");
    return uid + " " + (cart == null ? "no cart" : "cart") + " " + trace;
}

// OUTPUT:
// 42 no cart T-1001`],
        [`<p>Common mistakes:</p><ul><li><b>Using a parameter name:</b> the value was set as an attribute, so <code>@RequestParam</code> returns nothing.</li><li><b>Type mismatch:</b> setting a <code>String</code> and reading a <code>Long</code> fails with a conversion error.</li><li><b>Redirect loss:</b> data set before <code>redirect:</code> is gone; use flash attributes.</li><li><b>Filter order:</b> the filter must run before the handler, so check its order.</li><li><b>Trusting input:</b> never copy client input into a trusted attribute name.</li></ul>`,
            r`// WRONG: attribute set, but read as a parameter
req.setAttribute("userId", 42L);
// @GetMapping String me(@RequestParam Long userId)  -> 400 missing parameter

// RIGHT
// @GetMapping String me(@RequestAttribute Long userId)

// OUTPUT:
// RequestParam: 400 Required request parameter 'userId' is not present
// RequestAttribute: 200 user 42`],
        [`<p>Request attributes cost almost nothing: they are in-memory map entries.</p><ul><li><b>Compute once:</b> a filter that parses a token once and stores the result avoids repeating the work in each handler.</li><li><b>Keep small:</b> store ids or small objects, not large payloads.</li><li><b>Prefer @RequestScope beans</b> when many classes need the same value, to avoid passing the request around.</li></ul>`,
            r`@Component
@RequestScope
class CurrentUser {
    private Long id;
    Long getId() { return id; }
    void setId(Long id) { this.id = id; }
}

// filter: currentUser.setId(parseToken(req));   // computed once
// service: currentUser.getId();                 // read anywhere in the request

// OUTPUT:
// token parsed one time per request, not once per layer`],
        [`<p>A multi-tenant API resolves the tenant from the host name in a filter and stores it for the whole request.</p><ul><li><b>Filter:</b> reads the host, validates the tenant, sets the attribute.</li><li><b>Controller:</b> uses <code>@RequestAttribute</code> to stay clean.</li><li><b>Test:</b> supply the attribute with <code>requestAttr</code>.</li></ul>`,
            r`@Component
class TenantFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String host = req.getServerName();          // acme.shop.com
        req.setAttribute("tenant", host.split("\\.")[0]);
        chain.doFilter(req, res);
    }
}

@GetMapping("/orders")
List<String> orders(@RequestAttribute String tenant) {
    return List.of(tenant + "-order-1");
}

// OUTPUT:
// GET http://acme.shop.com/orders -> ["acme-order-1"]`]
    ),

    'mvc-model-modelview': dv(
        [`<p>The model is created by the framework before the handler runs.</p><ul><li><b>Container:</b> <code>ModelAndViewContainer</code> holds a <code>BindingAwareModelMap</code> for the request.</li><li><b>Argument:</b> <code>ModelMethodProcessor</code> passes that map as the <code>Model</code> parameter.</li><li><b>After handler:</b> the container's model plus the view name become a <code>ModelAndView</code>.</li><li><b>Render:</b> the view copies the map into request attributes or template context.</li></ul>`,
            r`// Simplified view of the flow
ModelAndViewContainer mavContainer = new ModelAndViewContainer();
// @ModelAttribute methods run first and fill the model
// the handler adds more with model.addAttribute(...)
ModelAndView mav = getModelAndView(mavContainer, factory, webRequest);
// DispatcherServlet.render(mav, request, response)

// OUTPUT:
// model attributes become visible to the template by name`],
        [`<p>Ways to use the model:</p><ul><li><b>Model:</b> the standard interface with <code>addAttribute</code>.</li><li><b>Map&lt;String,Object&gt;:</b> a plain map parameter works too.</li><li><b>ModelMap:</b> the map subclass.</li><li><b>ModelAndView:</b> return value with view and model.</li><li><b>@ModelAttribute:</b> method or parameter for shared and bound data.</li></ul>`,
            r`@GetMapping("/forms")
String forms(Model model, Map<String, Object> map) {
    model.addAttribute("a", 1);
    map.put("b", 2);                       // both land in the same model
    System.out.println(model.asMap());
    return "forms";
}

// OUTPUT:
// {a=1, b=2}`],
        [`<p>Common mistakes:</p><ul><li><b>Returning the model:</b> a <code>Model</code> return type is not a view name.</li><li><b>@RestController:</b> the model is ignored because the return value is the body.</li><li><b>Large objects:</b> adding whole entity graphs causes lazy loading and big pages.</li><li><b>Expecting persistence:</b> the model is gone after the request.</li><li><b>Name clash:</b> two attributes with the same name overwrite each other.</li></ul>`,
            r`@GetMapping("/clash")
String clash(Model model) {
    model.addAttribute("item", "first");
    model.addAttribute("item", "second");   // overwrites the first value
    return "clash";
}

// OUTPUT:
// item = second`],
        [`<p>Keep the model small and ready for display.</p><ul><li><b>DTOs:</b> add view objects, not full entities.</li><li><b>Paging:</b> add one page of data, not the whole table.</li><li><b>Lazy loading:</b> load what the page needs inside the service, because open-in-view hides extra queries.</li><li><b>Caching:</b> cache reference data used by shared <code>@ModelAttribute</code> methods.</li></ul>`,
            r`@GetMapping("/orders")
String orders(Model model, @PageableDefault(size = 20) Pageable page) {
    Page<OrderView> p = orderService.view(page);   // DTO page, 20 rows
    model.addAttribute("orders", p.getContent());
    model.addAttribute("total", p.getTotalElements());
    return "orders";
}

// OUTPUT:
// the view receives 20 rows and a total, not the full table`],
        [`<p>A product list page shows a title, a page of products and a filter list.</p><ul><li><b>Handler:</b> adds only these three attributes.</li><li><b>Test:</b> checks each attribute and the view name.</li><li><b>Template:</b> loops over <code>products</code>.</li></ul>`,
            r`@GetMapping("/catalog")
String catalog(@RequestParam(required = false) String cat, Model model) {
    model.addAttribute("title", "Catalog");
    model.addAttribute("products", service.find(cat));
    model.addAttribute("categories", service.categories());
    return "catalog";
}

// OUTPUT:
// GET /catalog?cat=books -> view catalog with title, products, categories`]
    ),

    'mvc-modelmap': dv(
        [`<p>The class is small and sits in <code>org.springframework.ui</code>.</p><ul><li><b>Hierarchy:</b> <code>ModelMap extends LinkedHashMap&lt;String, Object&gt;</code>.</li><li><b>addAttribute:</b> asserts the name is not null, then calls <code>put</code>.</li><li><b>Runtime type:</b> the injected object is a <code>BindingAwareModelMap</code>, which extends <code>ExtendedModelMap</code> and implements both <code>Model</code> and the map.</li><li><b>Ordering:</b> insertion order is kept for predictable output.</li></ul>`,
            r`ModelMap map = new ModelMap();
map.addAttribute("z", 1).addAttribute("a", 2);
System.out.println(map);
System.out.println(map instanceof LinkedHashMap);

// OUTPUT:
// {z=1, a=2}
// true`],
        [`<p>Useful methods:</p><ul><li><b>addAttribute(name, value):</b> add one.</li><li><b>addAttribute(value):</b> name derived from the type.</li><li><b>addAllAttributes:</b> from a map or collection.</li><li><b>mergeAttributes:</b> add only names not present.</li><li><b>containsAttribute:</b> existence check.</li><li><b>getAttribute:</b> read a value.</li></ul>`,
            r`ModelMap m = new ModelMap();
m.addAttribute("a", 1);
m.mergeAttributes(Map.of("a", 99, "b", 2));   // a is kept
System.out.println(m.get("a") + " " + m.get("b"));
m.addAttribute(List.of("x"));                 // name: stringList
System.out.println(m.containsKey("stringList"));

// OUTPUT:
// 1 2
// true`],
        [`<p>Common mistakes:</p><ul><li><b>Empty collection name:</b> <code>addAttribute(emptyList)</code> cannot derive a name and fails.</li><li><b>Null name:</b> throws <code>IllegalArgumentException</code>.</li><li><b>Two parameter types:</b> using <code>Model</code> and <code>ModelMap</code> together does not create two models.</li><li><b>Mutating a shared map:</b> storing a ModelMap in a field leaks request data between users.</li></ul>`,
            r`ModelMap m = new ModelMap();
try {
    m.addAttribute(new ArrayList<String>());   // empty list: type unknown
} catch (IllegalArgumentException e) {
    System.out.println("cannot derive name: " + e.getMessage());
}

// OUTPUT:
// cannot derive name: Cannot generate variable name for non-typed Collection
//   parameter value (all elements are null or the collection is empty)`],
        [`<p>Performance is the same as a <code>LinkedHashMap</code>: constant-time puts and gets. Tuning notes:</p><ul><li><b>Small:</b> a request model has few entries, so size is not a concern.</li><li><b>Values:</b> avoid heavy objects.</li><li><b>No sharing:</b> never keep it in a singleton field; it is per request.</li></ul>`,
            r`// WRONG: shared mutable state in a singleton controller
@Controller
class BadController {
    private final ModelMap shared = new ModelMap();   // leaks data between users
}

// RIGHT: take ModelMap as a parameter in each handler

// OUTPUT:
// the parameter style is safe; the field is a data leak and a race condition`],
        [`<p>A report page builds many ordered attributes and a helper method fills them.</p><ul><li><b>Helper:</b> accepts the <code>ModelMap</code> and fills a section.</li><li><b>Order:</b> preserved for debugging output.</li><li><b>Test:</b> checks each key.</li></ul>`,
            r`@GetMapping("/report")
String report(ModelMap map) {
    addHeader(map);
    addTotals(map);
    return "report";
}
private void addHeader(ModelMap m) { m.addAttribute("title", "Q1"); }
private void addTotals(ModelMap m) { m.addAttribute("total", 1200); }

// OUTPUT:
// model = {title=Q1, total=1200}`]
    ),

    'mvc-modelandview-modelview': dv(
        [`<p>The class stores a view and a model together.</p><ul><li><b>Fields:</b> <code>view</code> (a name string or a <code>View</code> object), a <code>ModelMap</code> and an optional <code>HttpStatusCode</code>.</li><li><b>Handling:</b> <code>ModelAndViewMethodReturnValueHandler</code> puts the name and model into the container.</li><li><b>Render:</b> <code>DispatcherServlet.render</code> resolves the name with the <code>ViewResolver</code> chain.</li><li><b>Reference flag:</b> a name starting with <code>redirect:</code> is handled as a redirect view.</li></ul>`,
            r`ModelAndView mav = new ModelAndView("home");
mav.addObject("n", 1);
System.out.println(mav.getViewName());
System.out.println(mav.getModel());
System.out.println(mav.hasView() + " " + mav.isReference());

// OUTPUT:
// home
// {n=1}
// true true`],
        [`<p>Constructors and helpers:</p><ul><li><b>new ModelAndView():</b> empty; set later.</li><li><b>(String viewName):</b> name only.</li><li><b>(String, String, Object):</b> name plus one attribute.</li><li><b>(String, Map):</b> name plus a model map.</li><li><b>(String, HttpStatusCode):</b> name plus status.</li><li><b>clear():</b> removes view and model.</li></ul>`,
            r`ModelAndView a = new ModelAndView("v", "k", "value");
ModelAndView b = new ModelAndView("v", Map.of("x", 1));
ModelAndView c = new ModelAndView("error", HttpStatus.NOT_FOUND);
System.out.println(a.getModel() + " " + b.getModel() + " " + c.getStatus());

// OUTPUT:
// {k=value} {x=1} 404 NOT_FOUND`],
        [`<p>Common mistakes:</p><ul><li><b>Null return:</b> returning <code>null</code> from a controller without writing the response gives an empty page.</li><li><b>Wrong controller type:</b> inside a <code>@RestController</code> the object is serialised as JSON instead of rendered.</li><li><b>No view:</b> an empty <code>ModelAndView</code> falls back to the path-derived name and may fail with a missing template.</li><li><b>Mixing:</b> do not both return a <code>ModelAndView</code> and write directly to the response.</li></ul>`,
            r`@RestController
class WrongController {
    @GetMapping("/w")
    ModelAndView w() { return new ModelAndView("home"); }   // WRONG type of controller
}

// OUTPUT:
// the response body is JSON of the ModelAndView or an error, not the home page`],
        [`<p>Overhead is one small object per request. Tuning points:</p><ul><li><b>Interceptor cost:</b> <code>postHandle</code> work runs on every page, so keep it light.</li><li><b>Model size:</b> add only what the view shows.</li><li><b>Reuse nothing:</b> a new instance per request is correct and cheap.</li></ul>`,
            r`public void postHandle(HttpServletRequest req, HttpServletResponse res,
        Object handler, ModelAndView mav) {
    if (mav != null && mav.hasView()) {
        mav.addObject("year", Year.now().getValue());   // cheap
    }
}

// OUTPUT:
// each page can print the current year`],
        [`<p>A checkout controller returns different views by result.</p><ul><li><b>Success:</b> redirect to the receipt page.</li><li><b>Validation failure:</b> same form view with errors and status 422.</li><li><b>Test:</b> one test per outcome.</li></ul>`,
            r`@PostMapping("/checkout")
ModelAndView checkout(@Valid CartForm form, BindingResult br) {
    if (br.hasErrors()) {
        ModelAndView mav = new ModelAndView("checkout");
        mav.setStatus(HttpStatus.UNPROCESSABLE_ENTITY);
        return mav;               // errors are added to the model by Spring
    }
    long id = orderService.place(form);
    return new ModelAndView("redirect:/receipt/" + id);
}

// OUTPUT:
// invalid -> 422 and checkout form with errors
// valid   -> 302 Location: /receipt/101 (id varies)`]
    ),

    'mvc-adding-data-to-model': dv(
        [`<p>Data reaches the model in a fixed order.</p><ul><li><b>1:</b> <code>ModelFactory.initModel</code> runs the <code>@ModelAttribute</code> methods.</li><li><b>2:</b> <code>@SessionAttributes</code> values are merged in.</li><li><b>3:</b> the handler runs and adds its own attributes.</li><li><b>4:</b> after the handler, <code>updateModel</code> adds <code>BindingResult</code> objects for bound attributes.</li></ul>`,
            r`@ModelAttribute("stamp")
String stamp() {
    System.out.println("1: @ModelAttribute method");
    return "S";
}

@GetMapping("/order")
String order(Model model) {
    System.out.println("2: handler, has stamp=" + model.containsAttribute("stamp"));
    return "order";
}

// OUTPUT:
// 1: @ModelAttribute method
// 2: handler, has stamp=true`],
        [`<p>Variants:</p><ul><li><b>addAttribute(name, value):</b> explicit name.</li><li><b>addAttribute(value):</b> derived name.</li><li><b>addAllAttributes:</b> map or collection.</li><li><b>mergeAttributes:</b> do not overwrite existing.</li><li><b>@ModelAttribute method:</b> per controller.</li><li><b>@ControllerAdvice:</b> global.</li><li><b>RedirectAttributes:</b> for redirects.</li></ul>`,
            r`@GetMapping("/v")
String v(Model model) {
    model.addAttribute("a", 1);
    model.mergeAttributes(Map.of("a", 5, "b", 2));   // a stays 1
    model.addAttribute("a", 9);                       // overwrite
    System.out.println(model.asMap());
    return "v";
}

// OUTPUT: (order of a and b)
// {a=9, b=2}`],
        [`<p>Common mistakes:</p><ul><li><b>Overwriting by name:</b> two sources using the same name replace each other.</li><li><b>Heavy shared method:</b> a database call in <code>@ModelAttribute</code> runs for every handler.</li><li><b>Redirect parameters:</b> simple values in the model are added to the redirect URL; use <code>RedirectAttributes</code>.</li><li><b>Mutable cached lists:</b> a template or handler changing a shared list affects other users.</li></ul>`,
            r`@ModelAttribute("countries")
List<String> countries() {
    return countryRepo.findAll();       // WRONG: query on every request
}

// RIGHT: cache it
@ModelAttribute("countries")
List<String> countriesCached() { return countryCache.get(); }

// OUTPUT:
// without cache: one SELECT per request; with cache: none after the first`],
        [`<p>Make shared data cheap.</p><ul><li><b>Cache:</b> use <code>@Cacheable</code> for reference data.</li><li><b>Scope:</b> use a controller-specific method, not a global advice, if only some pages need it.</li><li><b>Lazy:</b> add data only in the handlers that need it.</li></ul>`,
            r`@Service
class RefData {
    @Cacheable("countries")
    public List<String> countries() { return repo.findAllNames(); }
}

// OUTPUT:
// first call hits the database; later calls return the cached list`],
        [`<p>A registration page needs dropdown lists, a blank form object and a title.</p><ul><li><b>@ModelAttribute methods:</b> countries and roles.</li><li><b>Handler:</b> adds the blank form and title.</li><li><b>Test:</b> asserts all four attributes.</li></ul>`,
            r`@Controller
@RequestMapping("/signup")
class SignupController {
    @ModelAttribute("roles")
    List<String> roles() { return List.of("USER", "ADMIN"); }

    @GetMapping
    String form(Model model) {
        model.addAttribute("form", new SignupForm());
        model.addAttribute("title", "Sign up");
        return "signup";
    }
}

// OUTPUT:
// model: roles=[USER, ADMIN], form=SignupForm, title=Sign up`]
    ),

    'mvc-reading-model-data': dv(
        [`<p>Reading depends on where you are.</p><ul><li><b>View:</b> the <code>View.render</code> method receives the model map and merges it into the template or request attributes.</li><li><b>Handler:</b> the <code>Model</code> argument is the live map, so reads see earlier additions.</li><li><b>After redirect:</b> <code>FlashMapManager</code> keeps flash values in the session, then puts them into the next request model.</li><li><b>Interceptor:</b> <code>postHandle</code> reads <code>mav.getModel()</code>.</li></ul>`,
            r`public void postHandle(HttpServletRequest req, HttpServletResponse res,
        Object handler, ModelAndView mav) {
    if (mav != null) {
        System.out.println("model keys: " + mav.getModel().keySet());
    }
}

// OUTPUT:
// model keys: [title, products]`],
        [`<p>Ways to read:</p><ul><li><b>Template:</b> by attribute name.</li><li><b>Model methods:</b> <code>getAttribute</code>, <code>containsAttribute</code>, <code>asMap</code>.</li><li><b>@ModelAttribute parameter:</b> flash or earlier data.</li><li><b>RequestContextUtils.getInputFlashMap:</b> direct flash access.</li><li><b>MockMvc:</b> <code>model()</code> matchers.</li></ul>`,
            r`@GetMapping("/result")
String result(@ModelAttribute("message") String message, Model model) {
    // message came from addFlashAttribute before the redirect
    model.addAttribute("shown", message.toUpperCase());
    return "result";
}

// OUTPUT:
// flash message "Saved" -> shown = SAVED`],
        [`<p>Common mistakes:</p><ul><li><b>Direct access to a flash page:</b> the flash value is missing, so a <code>@ModelAttribute</code> String is created empty or fails.</li><li><b>Refresh loses data:</b> flash lasts for one redirect only.</li><li><b>Casting:</b> a wrong cast from <code>getAttribute</code> gives <code>ClassCastException</code>.</li><li><b>Name typos:</b> silent empty values in the page.</li><li><b>Unescaped output:</b> showing model text with an unsafe tag allows script injection; use the escaping tag.</li></ul>`,
            r`Object o = model.getAttribute("count");
String s = (String) o;      // WRONG if count is an Integer

Integer ok = (Integer) o;   // RIGHT

// OUTPUT:
// WRONG: ClassCastException: Integer cannot be cast to String`],
        [`<p>Reading is free, but what you stored matters.</p><ul><li><b>Eager data:</b> load before rendering, not inside the template.</li><li><b>Lazy collections:</b> touching them in the view can start extra queries.</li><li><b>Large lists:</b> page them.</li></ul>`,
            r`// application.properties
spring.jpa.open-in-view=false

// controller/service loads exactly what the page needs
model.addAttribute("order", orderService.loadWithItems(id));

# OUTPUT:
# the template cannot trigger hidden lazy queries;
a missing fetch fails loudly`],
        [`<p>Post-Redirect-Get with a success message is the classic case.</p><ul><li><b>POST:</b> saves and sets a flash message.</li><li><b>GET:</b> reads it from the model and shows it once.</li><li><b>Test:</b> checks <code>flash().attribute</code>.</li></ul>`,
            r`@PostMapping("/profile")
String update(ProfileForm f, RedirectAttributes ra) {
    service.update(f);
    ra.addFlashAttribute("message", "Profile updated");
    return "redirect:/profile";
}

@Test
void flashSet() throws Exception {
    mvc.perform(post("/profile"))
       .andExpect(flash().attribute("message", "Profile updated"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),

    'mvc-returning-view-name': dv(
        [`<p>The String return is handled by <code>ViewNameMethodReturnValueHandler</code>.</p><ul><li><b>Step 1:</b> it sets the view name on the <code>ModelAndViewContainer</code>.</li><li><b>Step 2:</b> a name that starts with <code>redirect:</code> marks it as a redirect and ignores the default model.</li><li><b>Step 3:</b> <code>DispatcherServlet.resolveViewName</code> loops over the resolvers.</li><li><b>Step 4:</b> the chosen <code>View</code> renders.</li></ul>`,
            r`// ViewNameMethodReturnValueHandler, simplified
String viewName = returnValue.toString();
mavContainer.setViewName(viewName);
if (isRedirectViewName(viewName)) {
    mavContainer.setRedirectModelScenario(true);   // use redirect model
}

// OUTPUT:
// "redirect:/x" -> RedirectView; "home" -> ViewResolver lookup`],
        [`<p>Return forms:</p><ul><li><b>String name:</b> <code>"home"</code>.</li><li><b>redirect:</b> a 302 to another URL.</li><li><b>forward:</b> internal forward.</li><li><b>void:</b> view name from the request path.</li><li><b>View object:</b> return a <code>View</code> directly.</li><li><b>Fragment name:</b> Thymeleaf allows <code>"page :: section"</code>.</li></ul>`,
            r`@GetMapping("/frag")
String frag() { return "cart :: summary"; }     // only the summary fragment

@GetMapping("/hello")
void hello() { }                               // view name: hello

@GetMapping("/go")
String go() { return "redirect:/target?x=1"; }

// OUTPUT:
// /frag -> the summary fragment only
// /hello -> view "hello"
// /go -> 302 Location: /target?x=1`],
        [`<p>Common mistakes:</p><ul><li><b>@RestController:</b> the name is returned as text.</li><li><b>Missing template:</b> a typo gives a 500 (Thymeleaf) or a 404 (JSP).</li><li><b>Leading slash:</b> <code>"/home"</code> may resolve to a wrong path; use <code>"home"</code>.</li><li><b>Redirect without PRG:</b> returning a view after POST allows duplicate submits.</li><li><b>Open redirect:</b> do not build <code>redirect:</code> from user input without checks.</li></ul>`,
            r`@PostMapping("/pay")
String pay() {
    service.pay();
    return "paid";            // WRONG: refresh repeats the payment
}

@PostMapping("/pay2")
String pay2() {
    service.pay();
    return "redirect:/paid";  // RIGHT: Post-Redirect-Get
}

// OUTPUT:
// WRONG: browser refresh asks to resubmit the form
// RIGHT: refresh just reloads the GET page`],
        [`<p>Notes:</p><ul><li><b>Template cache:</b> keep <code>spring.thymeleaf.cache=true</code> in production.</li><li><b>Resolver count:</b> fewer resolvers mean faster lookup.</li><li><b>Fragments:</b> return a fragment for partial page updates to send less HTML.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html

# OUTPUT:
# templates are parsed once and cached for later requests`],
        [`<p>A form flow: show form, validate, then redirect.</p><ul><li><b>GET:</b> returns the form view.</li><li><b>POST invalid:</b> returns the form view again.</li><li><b>POST valid:</b> redirects to a success page.</li></ul>`,
            r`@GetMapping("/contact")
String form(Model model) {
    model.addAttribute("form", new ContactForm());
    return "contact";
}

@PostMapping("/contact")
String submit(@Valid @ModelAttribute("form") ContactForm form,
              BindingResult br) {
    if (br.hasErrors()) return "contact";        // redisplay with errors
    service.send(form);
    return "redirect:/contact/thanks";
}

// OUTPUT:
// invalid -> 200 contact page with errors
// valid   -> 302 Location: /contact/thanks`]
    ),

    'mvc-returning-modelandview': dv(
        [`<p>Handling happens in <code>ModelAndViewMethodReturnValueHandler</code>.</p><ul><li><b>Null:</b> marks the request as handled, so no view is rendered.</li><li><b>View name:</b> if it is a reference, it sets the name; otherwise it sets the <code>View</code> object.</li><li><b>Model:</b> the attributes are merged into the container model.</li><li><b>Redirect:</b> a redirect name switches the container to redirect scenario.</li></ul>`,
            r`// ModelAndViewMethodReturnValueHandler, simplified
ModelAndView mav = (ModelAndView) returnValue;
if (mav.isReference()) {
    mavContainer.setViewName(mav.getViewName());
} else {
    mavContainer.setView(mav.getView());
}
mavContainer.addAllAttributes(mav.getModel());

// OUTPUT:
// the container then goes to DispatcherServlet.render`],
        [`<p>Options:</p><ul><li><b>Name:</b> logical view.</li><li><b>View object:</b> <code>new ModelAndView(new RedirectView("/x"))</code>.</li><li><b>Status:</b> <code>setStatus</code>.</li><li><b>Redirect with attributes:</b> use <code>RedirectView</code> with flash map or <code>RedirectAttributes</code>.</li><li><b>JSON view:</b> <code>MappingJackson2JsonView</code> renders the model as JSON.</li></ul>`,
            r`@GetMapping("/json-view")
ModelAndView jsonView() {
    ModelAndView mav = new ModelAndView(new MappingJackson2JsonView());
    mav.addObject("id", 7);
    mav.addObject("ok", true);
    return mav;
}

// OUTPUT:
// {"id":7,"ok":true}`],
        [`<p>Common mistakes:</p><ul><li><b>Forgetting to return:</b> building the object and returning <code>null</code> shows no page.</li><li><b>RestController:</b> leads to unexpected JSON.</li><li><b>Duplicate name:</b> adding the same attribute twice keeps the last value.</li><li><b>Mixing responses:</b> writing to <code>HttpServletResponse</code> and returning a view causes "response already committed".</li></ul>`,
            r`@GetMapping("/bad")
ModelAndView bad(HttpServletResponse res) throws IOException {
    res.getWriter().write("hi");
    res.flushBuffer();
    return new ModelAndView("home");     // WRONG: response already committed
}

// OUTPUT:
// IllegalStateException: Cannot forward after response has been committed`],
        [`<p>Notes:</p><ul><li><b>Object cost:</b> trivial per request.</li><li><b>View choice:</b> avoid looking up expensive data just to choose a view.</li><li><b>Testing speed:</b> <code>@WebMvcTest</code> loads only web beans, so tests stay fast.</li></ul>`,
            r`@WebMvcTest(OrderController.class)   // only web layer is loaded
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService service;
}

// OUTPUT:
// context start is much faster than a full @SpringBootTest`],
        [`<p>A legacy admin app returns different views by user type and also exposes a JSON view for export.</p><ul><li><b>HTML:</b> normal pages through a template engine.</li><li><b>JSON view:</b> export of the same model.</li><li><b>Interceptor:</b> adds the logged in user name to every model.</li></ul>`,
            r`@GetMapping("/users")
ModelAndView users(@RequestParam(defaultValue = "html") String fmt) {
    List<String> names = service.names();
    ModelAndView mav = fmt.equals("json")
        ? new ModelAndView(new MappingJackson2JsonView())
        : new ModelAndView("users");
    mav.addObject("users", names);
    return mav;
}

// OUTPUT:
// /users          -> HTML page
// /users?fmt=json -> {"users":["abaji","raoji"]}`]
    ),

    'mvc-view-rendering': dv(
        [`<p>Rendering starts after the handler and interceptors.</p><ul><li><b>processDispatchResult:</b> checks for exceptions, then calls <code>render</code> if a <code>ModelAndView</code> exists.</li><li><b>resolveViewName:</b> loops through <code>viewResolvers</code> and returns the first non-null view.</li><li><b>view.render:</b> merges the model with the template and writes the response.</li><li><b>Locale:</b> the resolved locale is set on the response before rendering.</li></ul>`,
            r`// DispatcherServlet.render, simplified
View view = resolveViewName(mv.getViewName(), mv.getModelInternal(),
                            locale, request);
if (view == null) {
    throw new ServletException("Could not resolve view with name '"
        + mv.getViewName() + "'");
}
view.render(mv.getModelInternal(), request, response);

// OUTPUT:
// unknown name -> ServletException: Could not resolve view with name 'x'`],
        [`<p>Common view technologies:</p><ul><li><b>Thymeleaf:</b> HTML templates, Boot default for server pages.</li><li><b>FreeMarker, Mustache:</b> other template engines.</li><li><b>JSP:</b> needs <code>InternalResourceViewResolver</code> and a WAR style setup.</li><li><b>MappingJackson2JsonView:</b> JSON from the model.</li><li><b>BeanNameViewResolver:</b> views registered as beans.</li><li><b>ContentNegotiatingViewResolver:</b> chooses by Accept header or extension.</li></ul>`,
            r`@Bean
ViewResolver beanNameResolver() {
    BeanNameViewResolver r = new BeanNameViewResolver();
    r.setOrder(0);                // asked before the template resolver
    return r;
}

// OUTPUT:
// return "report" -> the bean named report is used as the View`],
        [`<p>Common mistakes:</p><ul><li><b>Template not found:</b> wrong folder or suffix; Boot expects <code>templates/name.html</code>.</li><li><b>Resolver order:</b> an internal resource resolver accepts every name and blocks later ones; give it the lowest priority.</li><li><b>Wrong path in JSP:</b> files must be under <code>WEB-INF</code> to avoid direct access.</li><li><b>Disabled cache in production:</b> slows every request.</li><li><b>Unescaped output:</b> use the escaping attribute to prevent XSS.</li></ul>`,
            r`@Bean
InternalResourceViewResolver jsp() {
    InternalResourceViewResolver r = new InternalResourceViewResolver();
    r.setPrefix("/WEB-INF/views/");
    r.setSuffix(".jsp");
    r.setOrder(Ordered.LOWEST_PRECEDENCE);   // last, it accepts any name
    return r;
}

// OUTPUT:
// Thymeleaf resolver gets the first chance; JSP only if nothing else matches`],
        [`<p>Rendering time often dominates a page request.</p><ul><li><b>Template cache:</b> keep it on in production.</li><li><b>Compression:</b> enable <code>server.compression.enabled</code> for HTML.</li><li><b>Fragments:</b> cache parts with a cache layer.</li><li><b>Avoid logic:</b> keep heavy loops and queries out of templates.</li><li><b>Streaming:</b> large output can be written in chunks.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
server.compression.enabled=true
server.compression.mime-types=text/html,text/css,application/json

# OUTPUT:
# smaller responses and no repeated template parsing`],
        [`<p>A storefront renders the same data as HTML for browsers and JSON for API clients.</p><ul><li><b>Browser:</b> view name plus model.</li><li><b>API:</b> a separate <code>@RestController</code> path, or content negotiation.</li><li><b>Test:</b> a full test checks the HTML title.</li></ul>`,
            r`@Test
void pageShowsTitle() throws Exception {
    mvc.perform(get("/catalog"))
       .andExpect(status().isOk())
       .andExpect(content().string(containsString("<h1>Catalog</h1>")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    )
};
