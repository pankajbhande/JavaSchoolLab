// Spring extras, batch smvc03 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc03Extras: Record<string, Extra> = {
    'mvc-view-dispatcher': x(
        ['<b>View</b> is the V in MVC: the object that renders the model into the response, for example an HTML page, JSON or a PDF. In Spring it is the interface <code>org.springframework.web.servlet.View</code>.',
            '<b>Logical view name</b>: a controller usually returns a plain string such as <code>"home"</code>. It does not build the page itself.',
            '<b>Who renders</b>: <code>DispatcherServlet</code> asks a <code>ViewResolver</code> to turn the name into a <code>View</code>, then calls <code>view.render(model, request, response)</code>.'],
        ['<b>ViewResolver</b> implementations: <code>InternalResourceViewResolver</code> for JSP, Thymeleaf and FreeMarker resolvers, and <code>ContentNegotiatingViewResolver</code> to choose by media type.',
            '<b>Redirect and forward</b>: the prefixes <code>redirect:</code> and <code>forward:</code> in a view name create a <code>RedirectView</code> or an internal forward.',
            '<b>@ResponseBody</b> skips the view layer: the return value is written by an <code>HttpMessageConverter</code>, so no <code>View</code> is involved.'],
        ['<b>Custom View</b>: implement <code>View</code> or extend <code>AbstractView</code> to produce CSV, Excel or PDF output from the model.',
            '<b>Resolver order</b>: several resolvers form a chain sorted by <code>order</code>; the first one that returns a non-null view wins.',
            '<b>Caching</b>: resolvers cache resolved views by name, so a missing template shows up as an error at render time, not at startup.'],
        [['F', 'What is a View in Spring MVC?', 'The component that renders the model data into the HTTP response, such as a JSP or Thymeleaf page.'],
            ['F', 'What does a controller return to select a view?', 'A logical view name string, for example "home", which is resolved later.'],
            ['M', 'What does a ViewResolver do?', 'It maps a logical view name to a concrete View object, for example "home" to /WEB-INF/views/home.jsp.'],
            ['M', 'How do you redirect from a controller?', 'Return "redirect:/path", which DispatcherServlet turns into a RedirectView (HTTP 302).'],
            ['S', 'How is a REST endpoint different from a view-based endpoint?', 'With @ResponseBody or @RestController the body is written by a message converter and no ViewResolver is used.'],
            ['S', 'How would you add a CSV download?', 'Write a custom View (or a message converter), register it, and return its name or object from the controller.']],
        [['Controller returning a logical view name.',
            r`@Controller
public class HomeController {
    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("msg", "Hello MVC");
        return "home";            // logical name, not a file
    }
}
// ViewResolver prefix=/WEB-INF/views/ suffix=.jsp

// OUTPUT:
// GET /home -> renders /WEB-INF/views/home.jsp with msg=Hello MVC`],
            ['Redirect after a form post.',
                r`@PostMapping("/save")
public String save(@ModelAttribute Item item) {
    service.save(item);
    return "redirect:/items";     // RedirectView, HTTP 302
}

// OUTPUT:
// HTTP/1.1 302
// Location: /items`]],
        [['Registering a view resolver.',
            r`@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.jsp("/WEB-INF/views/", ".jsp");
    }
}

// OUTPUT:
// "home" is resolved to /WEB-INF/views/home.jsp`],
            ['Testing the chosen view name with MockMvc.',
                r`@WebMvcTest(HomeController.class)
class HomeControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void homeView() throws Exception {
        mvc.perform(get("/home"))
           .andExpect(status().isOk())
           .andExpect(view().name("home"))
           .andExpect(model().attribute("msg", "Hello MVC"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-model-dispatcher': x(
        ['<b>Model</b> is the M in MVC: a map of named attributes that carries data from the controller to the view. In Spring it is the interface <code>org.springframework.ui.Model</code>.',
            '<b>Adding data</b>: call <code>model.addAttribute("name", value)</code> in a handler method, then the view reads <code>name</code>.',
            '<b>Declared as a parameter</b>: Spring injects the model into the handler method, so you never create it yourself.'],
        ['<b>Types</b>: <code>Model</code> is the simple interface, <code>ModelMap</code> is a <code>LinkedHashMap</code> variant, and <code>Map&lt;String,Object&gt;</code> also works as a parameter.',
            '<b>Request scope</b>: model attributes are copied into request attributes when the view renders, so they live for one request.',
            '<b>@ModelAttribute</b> on a method adds attributes before every handler of that controller runs.'],
        ['<b>BindingAwareModelMap</b> is the real class behind the parameter; it also holds <code>BindingResult</code> entries for validation.',
            '<b>Redirects</b>: the model is not kept across a redirect; use <code>RedirectAttributes</code> and flash attributes instead.',
            '<b>Size</b>: keep the model small, because everything in it is exposed to the view and sometimes serialized into the page.'],
        [['F', 'What is the Model?', 'A container of key-value attributes the controller fills so the view can display them.'],
            ['F', 'How do you add data to the Model?', 'Call model.addAttribute("key", value) inside the handler method.'],
            ['M', 'Difference between Model and ModelMap?', 'Both hold attributes; ModelMap extends LinkedHashMap and adds map-style helpers, Model is the lighter interface.'],
            ['M', 'How long do model attributes live?', 'For the current request only; they are exposed as request attributes while the view renders.'],
            ['S', 'How can data survive a redirect?', 'Use RedirectAttributes.addFlashAttribute, which stores it in the session for the next request.'],
            ['S', 'What does @ModelAttribute on a method do?', 'It runs before each handler method of the controller and puts its return value into the model.']],
        [['Fill the model and read it in the view.',
            r`@GetMapping("/users")
public String users(Model model) {
    model.addAttribute("users", List.of("Asha", "Ravi"));
    model.addAttribute("count", 2);
    return "users";
}
// users.jsp: use the EL expression for "users" and "count"

// OUTPUT:
// page shows: 2 users: Asha, Ravi`],
            ['Shared attribute for all handlers.',
                r`@ModelAttribute("appName")
public String appName() {
    return "JavaSchoolLab";       // added to the model of every handler here
}

// OUTPUT:
// every view in this controller can read appName = JavaSchoolLab`]],
        [['Flash attribute across a redirect.',
            r`@PostMapping("/orders")
public String create(RedirectAttributes ra) {
    ra.addFlashAttribute("msg", "Order saved");
    return "redirect:/orders";
}

// OUTPUT:
// after the redirect the next request sees model attribute msg = Order saved`],
            ['Asserting model content in a test.',
                r`mvc.perform(get("/users"))
   .andExpect(model().attributeExists("users"))
   .andExpect(model().attribute("count", 2));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-modelandview': x(
        ['<b>ModelAndView</b> is a holder object that carries both the model data and the view (name or object) back to <code>DispatcherServlet</code> in one return value.',
            '<b>Creation</b>: <code>new ModelAndView("home", "msg", "Hi")</code> sets the view name plus one attribute; <code>addObject</code> adds more.',
            '<b>Result</b>: <code>DispatcherServlet</code> reads the view and model from it, resolves the view and renders it.'],
        ['<b>Fields</b>: it wraps a <code>view</code> (a name string or a <code>View</code>), a <code>ModelMap</code> and an optional <code>HttpStatus</code>.',
            '<b>Common in</b> older code and in <code>HandlerExceptionResolver</code> implementations, which must return a <code>ModelAndView</code>.',
            '<b>Modern style</b>: returning a <code>String</code> plus a <code>Model</code> parameter does the same job with less code.'],
        ['<b>Internally</b> every handler result is normalized to a <code>ModelAndView</code> by <code>ModelAndViewContainer</code> and the return value handlers.',
            '<b>Empty view</b>: <code>new ModelAndView()</code> without a name makes Spring use the default view name translator (the URL path).',
            '<b>Redirect</b>: <code>new ModelAndView("redirect:/x")</code> works exactly like the string form.'],
        [['F', 'What is ModelAndView?', 'An object that holds the model data and the view to render, returned from a controller method.'],
            ['F', 'How do you add data to it?', 'With addObject("key", value) or the constructor overloads.'],
            ['M', 'ModelAndView or String plus Model?', 'Both work; String plus Model is shorter and more common, ModelAndView suits code that builds view and data together.'],
            ['M', 'Where must you still use ModelAndView?', 'In HandlerExceptionResolver.resolveException and in classic Controller interface implementations.'],
            ['S', 'How does DispatcherServlet use it?', 'After the handler returns, it takes the view and model from it, calls the ViewResolver, then view.render.'],
            ['S', 'How do you set an HTTP status with it?', 'Call setStatus(HttpStatus) on the ModelAndView before returning it.']],
        [['Return a ModelAndView.',
            r`@GetMapping("/profile")
public ModelAndView profile() {
    ModelAndView mav = new ModelAndView("profile");
    mav.addObject("name", "Asha");
    mav.addObject("age", 28);
    return mav;
}

// OUTPUT:
// renders view "profile" with name=Asha, age=28`],
            ['Set a status code.',
                r`@GetMapping("/gone")
public ModelAndView gone() {
    ModelAndView mav = new ModelAndView("error/gone");
    mav.setStatus(HttpStatus.GONE);
    return mav;
}

// OUTPUT:
// HTTP/1.1 410 with the error/gone page`]],
        [['Exception resolver returning a ModelAndView.',
            r`@Component
public class MyResolver implements HandlerExceptionResolver {
    public ModelAndView resolveException(HttpServletRequest req,
            HttpServletResponse res, Object handler, Exception ex) {
        ModelAndView mav = new ModelAndView("error");
        mav.addObject("msg", ex.getMessage());
        return mav;
    }
}

// OUTPUT:
// any uncaught exception renders the error view with msg set`],
            ['Testing the returned object.',
                r`mvc.perform(get("/profile"))
   .andExpect(view().name("profile"))
   .andExpect(model().attribute("name", "Asha"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-request-processing-pipeline': x(
        ['<b>Request pipeline</b>: the ordered steps a request passes from the servlet container to the response. <code>DispatcherServlet</code> is the front controller that drives them.',
            '<b>Main steps</b>: find the handler (<code>HandlerMapping</code>), call it (<code>HandlerAdapter</code>), get a <code>ModelAndView</code>, resolve the view (<code>ViewResolver</code>), render it.',
            '<b>Extra hooks</b>: servlet filters run before the servlet, and interceptors run around the handler.'],
        ['<b>Order</b>: Filter, DispatcherServlet, HandlerMapping, interceptor <code>preHandle</code>, argument resolvers, handler method, return value handler, <code>postHandle</code>, view render, <code>afterCompletion</code>.',
            '<b>Argument resolution</b>: <code>HandlerMethodArgumentResolver</code> fills parameters such as <code>@RequestParam</code> and <code>@RequestBody</code>.',
            '<b>Errors</b>: exceptions go to <code>HandlerExceptionResolver</code> beans, including <code>@ExceptionHandler</code> and <code>@ControllerAdvice</code> methods.'],
        ['<b>doDispatch</b> in <code>DispatcherServlet</code> contains the whole flow; reading it once explains most behavior.',
            '<b>Filter or interceptor</b>: filters see every request and work at servlet level; interceptors know the handler and work at Spring level.',
            '<b>REST path</b>: with <code>@ResponseBody</code> the return value handler writes the body directly and the view step is skipped.'],
        [['F', 'What is the front controller?', 'DispatcherServlet, the single servlet that receives all requests and delegates to handlers.'],
            ['F', 'Name the first Spring step after DispatcherServlet gets a request.', 'It asks the HandlerMapping beans which handler matches the URL and method.'],
            ['M', 'What does a HandlerAdapter do?', 'It knows how to invoke a particular kind of handler, such as an annotated method, and returns a ModelAndView.'],
            ['M', 'Filter versus interceptor?', 'A filter is a servlet-level component around the whole servlet; an interceptor is Spring-level and wraps the chosen handler.'],
            ['S', 'In what order do interceptor callbacks run?', 'preHandle in order, postHandle in reverse order, afterCompletion in reverse order, even after an exception.'],
            ['S', 'Where is an uncaught controller exception handled?', 'In processHandlerException, which asks the HandlerExceptionResolver chain; unresolved ones go to the container.']],
        [['Logging the pipeline with an interceptor.',
            r`public class TimingInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req,
            HttpServletResponse res, Object handler) {
        req.setAttribute("t0", System.nanoTime());
        return true;                       // continue the chain
    }
    public void afterCompletion(HttpServletRequest req,
            HttpServletResponse res, Object h, Exception ex) {
        long t0 = (long) req.getAttribute("t0");
        System.out.println(req.getRequestURI() + " took "
            + (System.nanoTime() - t0) / 1_000_000 + " ms");
    }
}

// OUTPUT: (varies)
// /home took 4 ms`],
            ['Register it for some paths.',
                r`@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new TimingInterceptor())
            .addPathPatterns("/**")
            .excludePathPatterns("/static/**");
}

// OUTPUT:
// all requests except /static/** are timed`]],
        [['Seeing the order with a filter and an interceptor.',
            r`// Filter.doFilter       -> prints "filter in"
// Interceptor.preHandle -> prints "pre"
// Controller method     -> prints "handler"
// Interceptor.postHandle-> prints "post"
// View render           -> prints "render"
// afterCompletion       -> prints "after"
// Filter.doFilter       -> prints "filter out"

// OUTPUT:
// filter in, pre, handler, post, render, after, filter out`],
            ['Testing the pipeline.',
                r`@Test
void interceptorRuns() throws Exception {
    mvc.perform(get("/home"))
       .andExpect(status().isOk())
       .andExpect(request().attribute("t0", notNullValue()));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-xml-based-configuration': x(
        ['<b>XML configuration</b> defines Spring beans and MVC settings in files such as <code>applicationContext.xml</code> and <code>dispatcher-servlet.xml</code>, the original Spring style.',
            '<b>web.xml</b> declares <code>DispatcherServlet</code> and the context config location, so the servlet container can start Spring.',
            '<b>Key tags</b>: <code>&lt;context:component-scan&gt;</code>, <code>&lt;mvc:annotation-driven/&gt;</code> and a view resolver <code>&lt;bean&gt;</code>.'],
        ['<b>Two contexts</b>: a root context (services, repositories) loaded by <code>ContextLoaderListener</code>, and a web context (controllers) owned by the servlet.',
            '<b>Default file</b>: a servlet named <code>dispatcher</code> loads <code>/WEB-INF/dispatcher-servlet.xml</code> unless <code>contextConfigLocation</code> says otherwise.',
            '<b>Resources</b>: <code>&lt;mvc:resources&gt;</code> serves static files and <code>&lt;mvc:interceptors&gt;</code> registers interceptors.'],
        ['<b>Parsing</b>: namespace handlers turn each XML tag into bean definitions, so <code>mvc:annotation-driven</code> registers the same beans as <code>@EnableWebMvc</code>.',
            '<b>Trade-off</b>: XML needs no recompile and is explicit, but it is verbose and has no compile-time checking.',
            '<b>Mixing</b>: <code>@ImportResource</code> lets a Java configuration load legacy XML during migration.'],
        [['F', 'What is XML-based configuration?', 'Declaring beans and MVC settings in XML files that Spring reads at startup.'],
            ['F', 'Which file registers DispatcherServlet in the old style?', 'web.xml, with a servlet and servlet-mapping element.'],
            ['M', 'What does mvc:annotation-driven do?', 'It enables annotation support such as @RequestMapping, conversion, validation and message converters.'],
            ['M', 'What does context:component-scan do?', 'It scans a base package and registers classes annotated with @Component and its stereotypes.'],
            ['S', 'Root context versus servlet context?', 'The root context is shared and holds services; each DispatcherServlet has a child context for web beans that can see the root beans.'],
            ['S', 'How do you move from XML to Java config gradually?', 'Use @ImportResource on a @Configuration class and convert pieces one by one.']],
        [['web.xml wiring.',
            r`<web-app>
  <servlet>
    <servlet-name>dispatcher</servlet-name>
    <servlet-class>
      org.springframework.web.servlet.DispatcherServlet
    </servlet-class>
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>dispatcher</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>

<!-- OUTPUT: the servlet loads /WEB-INF/dispatcher-servlet.xml at startup -->`],
            ['dispatcher-servlet.xml.',
                r`<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:context="http://www.springframework.org/schema/context">
  <context:component-scan base-package="com.example.web"/>
  <mvc:annotation-driven/>
  <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/WEB-INF/views/"/>
    <property name="suffix" value=".jsp"/>
  </bean>
</beans>

<!-- OUTPUT: controllers in com.example.web are found; views map to JSPs -->`]],
        [['Static resources and interceptor in XML.',
            r`<mvc:resources mapping="/static/**" location="/static/"/>
<mvc:interceptors>
  <bean class="com.example.web.TimingInterceptor"/>
</mvc:interceptors>

<!-- OUTPUT: /static/app.css is served directly; every request is timed -->`],
            ['Loading XML in a test.',
                r`@SpringJUnitWebConfig(locations = "classpath:dispatcher-servlet.xml")
class XmlConfigTest {
    @Test
    void loads(WebApplicationContext ctx) {
        assertTrue(ctx.containsBean("homeController"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-java-based-configuration': x(
        ['<b>Java-based configuration</b> replaces XML with classes annotated <code>@Configuration</code>, so beans and MVC settings are plain, type-checked Java code.',
            '<b>Servlet setup</b> also needs no <code>web.xml</code>: a class extending <code>AbstractAnnotationConfigDispatcherServletInitializer</code> registers <code>DispatcherServlet</code>.',
            '<b>MVC setup</b>: a class with <code>@EnableWebMvc</code>, <code>@ComponentScan</code> and <code>WebMvcConfigurer</code> replaces <code>mvc:annotation-driven</code>.'],
        ['<b>Initializer</b>: override <code>getRootConfigClasses</code>, <code>getServletConfigClasses</code> and <code>getServletMappings</code>.',
            '<b>Beans</b>: methods annotated <code>@Bean</code> create objects, such as a view resolver or a <code>DataSource</code>.',
            '<b>Spring Boot</b> goes one step further: auto-configuration provides most of this, so you write only what differs.'],
        ['<b>Discovery</b>: the container finds the initializer through <code>ServletContainerInitializer</code> and <code>SpringServletContainerInitializer</code> (Servlet 3.0 plus).',
            '<b>CGLIB</b>: a full <code>@Configuration</code> class is proxied so that calls between <code>@Bean</code> methods return the same singleton.',
            '<b>Benefits</b>: refactoring support, compile-time checks, conditional beans with <code>@Profile</code> and <code>@Conditional</code>.'],
        [['F', 'What is Java-based configuration?', 'Configuring Spring with Java classes and annotations instead of XML.'],
            ['F', 'Which annotation marks a configuration class?', '@Configuration.'],
            ['M', 'How do you register DispatcherServlet without web.xml?', 'Extend AbstractAnnotationConfigDispatcherServletInitializer and return your config classes and mappings.'],
            ['M', 'What does @Bean do?', 'It tells Spring that the method result is a bean to manage, named after the method by default.'],
            ['S', 'Why are @Configuration classes proxied?', 'So that one @Bean method calling another returns the existing singleton, not a new object.'],
            ['S', 'What is @Configuration(proxyBeanMethods = false)?', 'A lite mode without a CGLIB proxy; it starts faster but inter-bean method calls create new objects.']],
        [['Initializer replacing web.xml.',
            r`public class AppInit
        extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() {
        return new Class<?>[] { RootConfig.class };
    }
    protected Class<?>[] getServletConfigClasses() {
        return new Class<?>[] { WebConfig.class };
    }
    protected String[] getServletMappings() {
        return new String[] { "/" };
    }
}

// OUTPUT:
// container startup registers DispatcherServlet mapped to "/"`],
            ['Web configuration class.',
                r`@Configuration
@EnableWebMvc
@ComponentScan("com.example.web")
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureViewResolvers(ViewResolverRegistry r) {
        r.jsp("/WEB-INF/views/", ".jsp");
    }
}

// OUTPUT:
// controllers scanned; views resolve to JSP files`]],
        [['A bean method.',
            r`@Configuration
public class RootConfig {
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}

// OUTPUT:
// bean "clock" is available for injection`],
            ['Testing the configuration.',
                r`@SpringJUnitWebConfig(WebConfig.class)
class WebConfigTest {
    @Test
    void contextLoads(WebApplicationContext ctx) {
        assertNotNull(ctx.getBean(RequestMappingHandlerMapping.class));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-configuration': x(
        ['<b>@Configuration</b> marks a class as a source of bean definitions. Spring reads its <code>@Bean</code> methods and registers the returned objects in the container.',
            '<b>Stereotype</b>: it is itself meta-annotated with <code>@Component</code>, so component scanning picks it up.',
            '<b>Typical use</b>: define infrastructure beans (<code>DataSource</code>, <code>ObjectMapper</code>, view resolvers) and import other configuration with <code>@Import</code>.'],
        ['<b>@Bean</b> methods: the method name is the bean name; parameters are injected from the container.',
            '<b>Related</b>: <code>@ComponentScan</code>, <code>@PropertySource</code>, <code>@Import</code>, <code>@Profile</code> and <code>@EnableXxx</code> annotations combine with it.',
            '<b>Boot</b>: <code>@SpringBootApplication</code> includes <code>@SpringBootConfiguration</code>, which is a <code>@Configuration</code>.'],
        ['<b>Full versus lite</b> mode: a class with <code>@Configuration</code> is subclassed by CGLIB so that <code>@Bean</code> methods return singletons; <code>proxyBeanMethods = false</code> disables it.',
            '<b>Processing</b>: <code>ConfigurationClassPostProcessor</code> parses these classes early and registers bean definitions before any bean is created.',
            '<b>Static @Bean</b> methods are needed for <code>BeanFactoryPostProcessor</code> beans so that the configuration class is not created too early.'],
        [['F', 'What does @Configuration do?', 'It declares a class that defines beans through @Bean methods.'],
            ['F', 'What is the default bean name of a @Bean method?', 'The method name.'],
            ['M', 'How do you split configuration into several classes?', 'Use @Import or component scanning to bring other @Configuration classes in.'],
            ['M', 'How do you inject another bean into a @Bean method?', 'Declare it as a method parameter and Spring supplies it.'],
            ['S', 'What does CGLIB proxying of @Configuration guarantee?', 'That calling a @Bean method from another @Bean method returns the container singleton, not a new instance.'],
            ['S', 'When would you set proxyBeanMethods to false?', 'When beans do not call each other directly, to speed up startup and cut memory, as many Boot auto-configurations do.']],
        [['Basic configuration class.',
            r`@Configuration
public class AppConfig {
    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public UserService userService(PasswordEncoder encoder) {
        return new UserService(encoder);     // encoder injected
    }
}

// OUTPUT:
// beans "encoder" and "userService" registered; one shared encoder`],
            ['Profile-specific bean.',
                r`@Configuration
public class DataConfig {
    @Bean @Profile("dev")
    DataSource devDs() { return new EmbeddedDatabaseBuilder().build(); }

    @Bean @Profile("prod")
    DataSource prodDs() { return new HikariDataSource(); }
}

// OUTPUT:
// with profile dev only devDs exists`]],
        [['Singleton guarantee.',
            r`@Configuration
class Cfg {
    @Bean A a() { return new A(b()); }   // b() is intercepted by the proxy
    @Bean B b() { return new B(); }
}
// context.getBean(A.class).b == context.getBean(B.class)

// OUTPUT:
// true (with proxyBeanMethods = false this would print false)`],
            ['Testing with a slice.',
                r`@SpringJUnitConfig(AppConfig.class)
class AppConfigTest {
    @Autowired UserService service;
    @Test void wired() { assertNotNull(service); }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-enablewebmvc': x(
        ['<b>@EnableWebMvc</b> imports the default Spring MVC configuration (<code>DelegatingWebMvcConfiguration</code>), which registers handler mappings, adapters, converters and validators.',
            '<b>Where</b>: put it on a <code>@Configuration</code> class in a plain Spring MVC (non Boot) application.',
            '<b>Customizing</b>: implement <code>WebMvcConfigurer</code> in the same class to change parts of the defaults.'],
        ['<b>Registers</b>: <code>RequestMappingHandlerMapping</code>, <code>RequestMappingHandlerAdapter</code>, <code>HandlerExceptionResolver</code> beans, message converters (JSON if Jackson is present).',
            '<b>Not needed in Boot</b>: Spring Boot auto-configures MVC. Adding <code>@EnableWebMvc</code> there switches off Boot MVC auto-configuration, including static resources and JSON settings.',
            '<b>Same as XML</b>: it is the Java equivalent of <code>&lt;mvc:annotation-driven/&gt;</code>.'],
        ['<b>Mechanism</b>: the annotation uses <code>@Import(DelegatingWebMvcConfiguration.class)</code>, which collects every <code>WebMvcConfigurer</code> bean and calls their methods.',
            '<b>Auto-config back-off</b>: Boot <code>WebMvcAutoConfiguration</code> is <code>@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)</code>, so the import turns it off.',
            '<b>Only one</b>: use a single <code>@EnableWebMvc</code> in the application; extending <code>WebMvcConfigurationSupport</code> has the same effect.'],
        [['F', 'What does @EnableWebMvc do?', 'It turns on the default Spring MVC setup: mappings, adapters, converters and validation.'],
            ['F', 'Is it required in Spring Boot?', 'No, Boot auto-configures MVC already.'],
            ['M', 'What happens if you add it to a Boot app?', 'Boot MVC auto-configuration backs off, so you lose defaults such as static resource handling and Boot JSON settings.'],
            ['M', 'How do you customize while keeping the defaults?', 'Implement WebMvcConfigurer and override only the methods you need.'],
            ['S', 'Which class does @EnableWebMvc import?', 'DelegatingWebMvcConfiguration, which delegates to all WebMvcConfigurer beans.'],
            ['S', 'How do you keep Boot defaults and still customize?', 'Use WebMvcConfigurer without @EnableWebMvc.']],
        [['Plain Spring MVC setup.',
            r`@Configuration
@EnableWebMvc
@ComponentScan("com.example.web")
public class WebConfig { }

// OUTPUT:
// @RequestMapping, @RequestBody, conversion and validation all work`],
            ['Boot: customize without the annotation.',
                r`@Configuration                      // no @EnableWebMvc here
public class WebCfg implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry r) {
        r.addViewController("/login").setViewName("login");
    }
}

// OUTPUT:
// GET /login renders "login"; Boot defaults stay active`]],
        [['Mistake: static files break in Boot.',
            r`@SpringBootApplication
@EnableWebMvc                          // disables Boot MVC defaults
public class App { }

// GET /static/app.css  -> 404 until resource handlers are added manually

// OUTPUT:
// HTTP/1.1 404 for static resources (fix: remove @EnableWebMvc)`],
            ['Test that the infrastructure is present.',
                r`@SpringJUnitWebConfig(WebConfig.class)
class MvcTest {
    @Test
    void hasMapping(WebApplicationContext ctx) {
        assertEquals(1,
            ctx.getBeansOfType(RequestMappingHandlerMapping.class).size());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-webmvcconfigurer': x(
        ['<b>WebMvcConfigurer</b> is a callback interface for customizing Spring MVC. All methods are <code>default</code>, so you override only what you need.',
            '<b>Typical hooks</b>: <code>addInterceptors</code>, <code>addResourceHandlers</code>, <code>addCorsMappings</code>, <code>addViewControllers</code> and <code>configureMessageConverters</code>.',
            '<b>Use with</b>: <code>@EnableWebMvc</code> in plain Spring, or alone in Spring Boot to keep the defaults.'],
        ['<b>CORS</b>: <code>registry.addMapping("/api/**").allowedOrigins("https://app.example.com")</code>.',
            '<b>Formatters</b>: <code>addFormatters</code> registers converters for request parameters and path variables.',
            '<b>Resources</b>: <code>addResourceHandlers</code> maps <code>/static/**</code> to a classpath or file location.'],
        ['<b>Delegation</b>: <code>DelegatingWebMvcConfiguration</code> autowires all <code>WebMvcConfigurer</code> beans and calls each one while building the MVC beans.',
            '<b>Order</b>: several configurers are combined, in <code>@Order</code> order; later ones can add to earlier ones.',
            '<b>Message converters</b>: <code>configureMessageConverters</code> replaces the defaults, while <code>extendMessageConverters</code> only adds or edits them.'],
        [['F', 'What is WebMvcConfigurer?', 'An interface with callback methods to customize Spring MVC configuration.'],
            ['F', 'Must you implement every method?', 'No, all methods have default empty implementations.'],
            ['M', 'How do you register an interceptor?', 'Override addInterceptors and call registry.addInterceptor with path patterns.'],
            ['M', 'How do you enable CORS for an API?', 'Override addCorsMappings, or use @CrossOrigin on controllers.'],
            ['S', 'configureMessageConverters or extendMessageConverters?', 'The first replaces the default converter list, the second modifies it and keeps the defaults.'],
            ['S', 'Why implement it instead of extending WebMvcConfigurationSupport?', 'The interface is additive and works with Boot auto-configuration; extending the support class replaces the defaults.']],
        [['Interceptor, CORS and resources together.',
            r`@Configuration
public class WebCfg implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry r) {
        r.addInterceptor(new TimingInterceptor()).addPathPatterns("/**");
    }
    @Override
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**").allowedOrigins("https://app.example.com");
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry r) {
        r.addResourceHandler("/static/**")
         .addResourceLocations("classpath:/static/");
    }
}

// OUTPUT:
// requests are timed; /api/** allows the origin; /static/** served`],
            ['View controller without a handler class.',
                r`@Override
public void addViewControllers(ViewControllerRegistry r) {
    r.addViewController("/about").setViewName("about");
    r.addRedirectViewController("/old", "/about");
}

// OUTPUT:
// GET /about renders "about"; GET /old redirects to /about`]],
        [['Custom formatter.',
            r`@Override
public void addFormatters(FormatterRegistry registry) {
    registry.addConverter(String.class, LocalDate.class,
        s -> LocalDate.parse(s.trim()));
}
// @GetMapping("/d") String d(@RequestParam LocalDate on) ...

// OUTPUT:
// GET /d?on=2026-10-08 binds on = 2026-10-08`],
            ['Testing CORS.',
                r`mvc.perform(options("/api/items")
        .header("Origin", "https://app.example.com")
        .header("Access-Control-Request-Method", "GET"))
   .andExpect(header().string("Access-Control-Allow-Origin",
        "https://app.example.com"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-component-scanning': x(
        ['<b>Component scanning</b> makes Spring search packages for classes marked <code>@Component</code> (or <code>@Controller</code>, <code>@Service</code>, <code>@Repository</code>) and register them as beans.',
            '<b>Enable it</b> with <code>@ComponentScan("com.example")</code> on a configuration class, or <code>&lt;context:component-scan&gt;</code> in XML.',
            '<b>Result</b>: you do not write <code>@Bean</code> methods or XML for each class; annotating the class is enough.'],
        ['<b>Stereotypes</b>: <code>@Controller</code>, <code>@Service</code> and <code>@Repository</code> are specializations of <code>@Component</code> with extra meaning.',
            '<b>Base packages</b>: <code>basePackages</code> or <code>basePackageClasses</code> set where to look, and sub-packages are included.',
            '<b>Filters</b>: <code>includeFilters</code> and <code>excludeFilters</code> narrow the scan by annotation, type or regex.'],
        ['<b>Mechanism</b>: <code>ClassPathBeanDefinitionScanner</code> reads class files with ASM metadata, without loading the classes, and registers bean definitions.',
            '<b>Boot</b>: <code>@SpringBootApplication</code> includes <code>@ComponentScan</code> for the package of the main class, so keep the main class in the root package.',
            '<b>Names</b>: the default bean name is the decapitalized class name; <code>@Component("x")</code> sets it explicitly.'],
        [['F', 'What is component scanning?', 'Spring finds annotated classes in given packages and registers them as beans automatically.'],
            ['F', 'Which annotations are detected?', '@Component and its stereotypes @Controller, @Service and @Repository.'],
            ['M', 'How do you set the packages to scan?', 'Use basePackages or basePackageClasses in @ComponentScan.'],
            ['M', 'Why does Boot find my classes without @ComponentScan?', '@SpringBootApplication includes it, scanning the main class package and its sub-packages.'],
            ['S', 'Why is a bean in another package not found in Boot?', 'It is outside the main class package; move the class or add scanBasePackages.'],
            ['S', 'How can you exclude classes from the scan?', 'Use excludeFilters with a FilterType, for example ANNOTATION, ASSIGNABLE_TYPE or REGEX.']],
        [['Scan configuration.',
            r`@Configuration
@ComponentScan(basePackages = {"com.example.web", "com.example.service"})
public class AppConfig { }

@Service
public class GreetingService {
    public String hi() { return "hi"; }
}

// OUTPUT:
// bean "greetingService" is registered automatically`],
            ['Excluding by annotation.',
                r`@ComponentScan(basePackages = "com.example",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ANNOTATION, classes = Controller.class))
public class RootConfig { }

// OUTPUT:
// controllers are skipped here; the web context scans them instead`]],
        [['Boot: scan another package.',
            r`@SpringBootApplication(scanBasePackages = {"com.example", "com.shared"})
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

// OUTPUT:
// beans from com.example and com.shared are registered`],
            ['Checking registration in a test.',
                r`@SpringJUnitConfig(AppConfig.class)
class ScanTest {
    @Autowired ApplicationContext ctx;
    @Test
    void found() {
        assertTrue(ctx.containsBean("greetingService"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    )
};

export const smvc03Deep: Record<string, Deep> = {
    'mvc-view-dispatcher': dv(
        [`<p>How a view gets rendered:</p><ul><li><b>Handler result:</b> the controller returns a name, a <code>View</code> or a <code>ModelAndView</code>.</li><li><b>render():</b> <code>DispatcherServlet.render</code> calls <code>resolveViewName</code>, which loops over all <code>ViewResolver</code> beans in order.</li><li><b>Locale:</b> the resolver receives the request locale, so one name can map to different templates.</li><li><b>Output:</b> <code>view.render(model, request, response)</code> merges the model into request attributes (JSP) or a template context (Thymeleaf).</li><li><b>Missing view:</b> if no resolver answers, a <code>ServletException</code> says "Could not resolve view with name".</li></ul>`,
            r`// Simplified from DispatcherServlet.render
View view = null;
for (ViewResolver vr : this.viewResolvers) {
    view = vr.resolveViewName(viewName, locale);
    if (view != null) break;           // first resolver that answers wins
}
if (view == null) {
    throw new ServletException("Could not resolve view with name '"
        + viewName + "'");
}
view.render(mv.getModelInternal(), request, response);

// OUTPUT:
// GET /home -> view "home" resolved -> HTML written to the response`],
        [`<p>Variants of returning a view:</p><ul><li><b>String name:</b> the usual choice.</li><li><b>View object:</b> returned directly, no resolver needed.</li><li><b>redirect: and forward:</b> special prefixes handled by <code>UrlBasedViewResolver</code>.</li><li><b>void:</b> the default view name is derived from the URL.</li><li><b>ContentNegotiatingViewResolver:</b> picks a view by <code>Accept</code> header or extension.</li><li><b>Chaining:</b> set <code>order</code> on each resolver; JSP resolvers match every name, so keep them last.</li></ul>`,
            r`@Configuration
public class ViewCfg implements WebMvcConfigurer {
    @Bean
    public BeanNameViewResolver beanNameResolver() {
        BeanNameViewResolver r = new BeanNameViewResolver();
        r.setOrder(0);                    // try bean names first
        return r;
    }
    @Override
    public void configureViewResolvers(ViewResolverRegistry reg) {
        reg.jsp("/WEB-INF/views/", ".jsp");   // fallback, registered last
    }
    @Bean("report")                       // view named "report" is this bean
    public View reportView() {
        return (model, req, res) -> {
            res.setContentType("text/plain");
            res.getWriter().write("report for " + model.get("user"));
        };
    }
}

// OUTPUT:
// return "report" -> text/plain "report for Asha"; return "home" -> JSP`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>@Controller with a string meant as JSON:</b> add <code>@ResponseBody</code> or use <code>@RestController</code>, or the string is treated as a view name.</li><li><b>Circular view path:</b> a controller path equal to the view name makes a forward loop.</li><li><b>Wrong prefix:</b> a missing slash gives 404 for the JSP.</li><li><b>Views under WEB-INF:</b> put templates there so they cannot be requested directly.</li><li><b>Model data lost on redirect:</b> use flash attributes.</li></ul>`,
            r`// WRONG: returns the text "ok" as a view name -> 404 / Circular view path
@Controller
class Bad {
    @GetMapping("/ping") String ping() { return "ok"; }
}

// RIGHT: write the string into the body
@Controller
class Good {
    @GetMapping("/ping")
    @ResponseBody
    String ping() { return "ok"; }
}

// OUTPUT:
// Bad  -> HTTP 404 (view "ok" not found)
// Good -> HTTP 200 body: ok`],
        [`<p>Performance and tuning:</p><ul><li><b>View caching:</b> keep the resolver cache enabled in production; turn off template caching only in development.</li><li><b>Template engine:</b> precompile JSPs and cache Thymeleaf templates.</li><li><b>Resolver count:</b> every resolver is tried for each miss, so register few.</li><li><b>Large pages:</b> avoid heavy logic in templates; compute in the controller or service.</li><li><b>APIs:</b> skip the view layer with <code>@ResponseBody</code>.</li></ul>`,
            r`# application.properties (Spring Boot with Thymeleaf)
spring.thymeleaf.cache=true
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.web.resources.cache.cachecontrol.max-age=1d

# OUTPUT:
# templates are parsed once and reused; static assets cached by the browser for a day`],
        [`<p>Scenario: an admin portal serves HTML pages and also a CSV export of orders.</p><ul><li>The HTML page returns a logical name resolved by Thymeleaf.</li><li>The export returns a custom <code>View</code> that streams CSV.</li><li>Both read the same model attributes, so the service layer is shared.</li></ul>`,
            r`@Controller
@RequestMapping("/orders")
public class OrderController {
    private final OrderService service;
    OrderController(OrderService service) { this.service = service; }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("orders", service.findAll());
        return "orders/list";
    }

    @GetMapping("/export")
    public View export(Model model) {
        model.addAttribute("orders", service.findAll());
        return new CsvOrderView();         // extends AbstractView
    }
}

// OUTPUT:
// GET /orders        -> HTML table
// GET /orders/export -> text/csv: id,total / 1,250.00 / 2,99.50`]
    ),

    'mvc-model-dispatcher': dv(
        [`<p>What the model really is:</p><ul><li><b>Creation:</b> <code>RequestMappingHandlerAdapter</code> creates a <code>ModelAndViewContainer</code> holding a <code>BindingAwareModelMap</code>.</li><li><b>Injection:</b> <code>ModelMethodProcessor</code> passes that map when a handler parameter is <code>Model</code>, <code>ModelMap</code> or <code>Map</code>.</li><li><b>Before the handler:</b> <code>@ModelAttribute</code> methods run and fill the model.</li><li><b>After the handler:</b> the model is passed to the view, and values are exposed as request attributes.</li><li><b>Binding results:</b> <code>BindingResult</code> objects are stored under keys that start with <code>org.springframework.validation.BindingResult.</code></li></ul>`,
            r`@Controller
public class DemoController {
    @ModelAttribute("year")
    int year() { return 2026; }            // runs first

    @GetMapping("/demo")
    public String demo(Model model) {
        System.out.println(model.getClass().getSimpleName());
        System.out.println(model.asMap());
        return "demo";
    }
}

// OUTPUT:
// BindingAwareModelMap
// {year=2026}`],
        [`<p>Options for passing data:</p><ul><li><b>Model:</b> the common choice.</li><li><b>ModelMap:</b> map-style helpers such as <code>addAllAttributes</code>.</li><li><b>Map parameter:</b> works the same but hides intent.</li><li><b>ModelAndView:</b> data and view together.</li><li><b>Auto-naming:</b> <code>addAttribute(value)</code> without a name derives one from the type, for example a <code>User</code> becomes <code>user</code> and a <code>List&lt;User&gt;</code> becomes <code>userList</code>.</li><li><b>@SessionAttributes:</b> keeps chosen attributes in the session across requests.</li></ul>`,
            r`@Controller
@SessionAttributes("cart")
public class CartController {
    @ModelAttribute("cart")
    Cart newCart() { return new Cart(); }

    @PostMapping("/cart/add")
    public String add(@ModelAttribute("cart") Cart cart, @RequestParam String sku) {
        cart.add(sku);
        return "redirect:/cart";
    }

    @PostMapping("/cart/done")
    public String done(SessionStatus status) {
        status.setComplete();              // clears the session attribute
        return "redirect:/";
    }
}

// OUTPUT:
// the cart survives several requests until done() completes the session status`],
        [`<p>Common mistakes:</p><ul><li><b>Mutable shared objects:</b> putting a singleton bean in the model lets a view change shared state.</li><li><b>Forgetting that the model is per request:</b> data is gone after a redirect.</li><li><b>Large objects:</b> loading whole entity graphs into the model slows rendering and can trigger lazy-loading errors.</li><li><b>Name clashes:</b> two attributes with the same key overwrite each other.</li><li><b>Wrong type in the view:</b> a mistyped attribute name gives an empty value without an error in JSP.</li></ul>`,
            r`// WRONG: entity with lazy collection -> LazyInitializationException in the view
model.addAttribute("order", orderRepository.findById(id).get());

// RIGHT: map to a flat DTO inside the service transaction
model.addAttribute("order", orderService.getSummary(id));

// OUTPUT:
// WRONG: could not initialize proxy - no Session
// RIGHT: page renders with the summary fields`],
        [`<p>Performance and tuning:</p><ul><li><b>Keep it small:</b> send only what the page shows.</li><li><b>Avoid session attributes:</b> they use memory and need replication in a cluster.</li><li><b>Pagination:</b> pass a <code>Page</code>, not the whole table.</li><li><b>Open-in-view:</b> disable <code>spring.jpa.open-in-view</code> and use DTOs, so database sessions are not held during rendering.</li></ul>`,
            r`# application.properties
spring.jpa.open-in-view=false

# OUTPUT:
# the connection returns to the pool before the view renders`],
        [`<p>Scenario: a product list page needs the products, the current filter and a total count.</p><ul><li>The controller builds a DTO page in the service.</li><li>The filter is added so the form shows the chosen values.</li><li>A test checks the model keys, so the page contract is protected.</li></ul>`,
            r`@GetMapping("/products")
public String products(@RequestParam(defaultValue = "") String q,
                       @RequestParam(defaultValue = "0") int page,
                       Model model) {
    Page<ProductDto> result = service.search(q, PageRequest.of(page, 10));
    model.addAttribute("products", result.getContent());
    model.addAttribute("total", result.getTotalElements());
    model.addAttribute("q", q);
    return "products/list";
}

// OUTPUT:
// GET /products?q=pen -> model: products (10 items), total=37, q=pen`]
    ),

    'mvc-modelandview': dv(
        [`<p>Inside <code>ModelAndView</code>:</p><ul><li><b>Fields:</b> <code>Object view</code>, <code>ModelMap model</code>, <code>HttpStatusCode status</code> and a <code>cleared</code> flag.</li><li><b>View</b> is a <code>String</code> name or a <code>View</code>; <code>isReference()</code> tells which.</li><li><b>Return handler:</b> <code>ModelAndViewMethodReturnValueHandler</code> copies the view and model into the <code>ModelAndViewContainer</code>.</li><li><b>Other types</b> (String, View, Model) are converted to the same container, so ModelAndView is just one input form.</li></ul>`,
            r`ModelAndView mav = new ModelAndView("invoice");
mav.addObject("no", 1001);
mav.addObject("total", 250.0);
System.out.println(mav.getViewName() + " " + mav.isReference());
System.out.println(mav.getModel());
System.out.println(mav.hasView() + " " + mav.isEmpty());

// OUTPUT:
// invoice true
// {no=1001, total=250.0}
// true false`],
        [`<p>Constructor and helper variants:</p><ul><li><code>new ModelAndView()</code>: empty, fill later.</li><li><code>new ModelAndView(String viewName)</code>.</li><li><code>new ModelAndView(String viewName, String attrName, Object value)</code>.</li><li><code>new ModelAndView(String viewName, Map&lt;String,?&gt; model)</code>.</li><li><code>new ModelAndView(View view)</code>: an explicit view object.</li><li><code>new ModelAndView(String viewName, HttpStatusCode status)</code>: with a status.</li><li><code>setViewName</code>, <code>addAllObjects</code>, <code>clear()</code> and <code>RedirectView</code> for redirects with options.</li></ul>`,
            r`@GetMapping("/search")
public ModelAndView search(@RequestParam String q) {
    ModelAndView mav = new ModelAndView();
    mav.setViewName("search");
    mav.addObject("q", q);
    mav.addAllObjects(Map.of("hits", 3, "took", 12));
    return mav;
}

@GetMapping("/legacy")
public ModelAndView legacy() {
    RedirectView rv = new RedirectView("/new", true);   // context-relative
    rv.setStatusCode(HttpStatus.MOVED_PERMANENTLY);
    return new ModelAndView(rv);
}

// OUTPUT:
// GET /search?q=spring -> view "search" with q, hits, took
// GET /legacy -> HTTP 301 Location: /new`],
        [`<p>Common mistakes:</p><ul><li><b>No view and no model:</b> an empty <code>ModelAndView</code> means the request is already handled, so nothing is rendered.</li><li><b>Returning null</b> has the same effect and often gives a blank page.</li><li><b>Mixing @ResponseBody with ModelAndView:</b> the body writer wins and the view is ignored.</li><li><b>Reusing one instance</b> as a field makes it shared across threads; always create it per request.</li></ul>`,
            r`// WRONG: shared mutable instance -> data from other users can leak
private final ModelAndView mav = new ModelAndView("list");

// RIGHT: new instance per request
@GetMapping("/list")
public ModelAndView list() {
    return new ModelAndView("list", "items", service.findAll());
}

// OUTPUT:
// WRONG: concurrent requests overwrite each other's items
// RIGHT: each request has its own model`],
        [`<p>Performance notes:</p><ul><li>The object is cheap; one per request costs almost nothing.</li><li>The cost is in the model content and in the view rendering.</li><li>Prefer plain <code>String</code> returns in new code to reduce boilerplate.</li><li>Do not copy large maps with <code>addAllObjects</code> when a reference will do.</li></ul>`,
            r`// Compare: same result, less code
@GetMapping("/a")
public ModelAndView a() { return new ModelAndView("a", "x", 1); }

@GetMapping("/b")
public String b(Model m) { m.addAttribute("x", 1); return "b"; }

// OUTPUT:
// both render a view with attribute x = 1; /b is the modern style`],
        [`<p>Scenario: a global error page built from an exception resolver.</p><ul><li>The resolver logs the error and picks a view by exception type.</li><li>It returns a <code>ModelAndView</code> with the status and a message.</li><li>It returns <code>null</code> for exceptions it does not handle, so the next resolver gets a turn.</li></ul>`,
            r`@Component
public class ErrorPageResolver implements HandlerExceptionResolver, Ordered {
    public int getOrder() { return 0; }

    public ModelAndView resolveException(HttpServletRequest req,
            HttpServletResponse res, Object handler, Exception ex) {
        if (ex instanceof AccessDeniedException) {
            ModelAndView mav = new ModelAndView("error/403");
            mav.setStatus(HttpStatus.FORBIDDEN);
            return mav;
        }
        if (ex instanceof NoSuchElementException) {
            ModelAndView mav = new ModelAndView("error/404");
            mav.setStatus(HttpStatus.NOT_FOUND);
            mav.addObject("msg", ex.getMessage());
            return mav;
        }
        return null;                        // let other resolvers decide
    }
}

// OUTPUT:
// AccessDeniedException -> 403 page; NoSuchElementException -> 404 page`]
    ),

    'mvc-request-processing-pipeline': dv(
        [`<p>The flow inside <code>DispatcherServlet.doDispatch</code>:</p><ul><li><b>1.</b> Container filters run, then <code>FrameworkServlet.service</code> calls <code>doService</code>.</li><li><b>2.</b> <code>getHandler</code> loops over <code>HandlerMapping</code> beans and returns a <code>HandlerExecutionChain</code> (handler plus interceptors).</li><li><b>3.</b> <code>getHandlerAdapter</code> finds an adapter that supports the handler.</li><li><b>4.</b> Interceptors <code>preHandle</code>; if one returns false the chain stops.</li><li><b>5.</b> <code>ha.handle</code> resolves arguments, invokes the method and handles the return value.</li><li><b>6.</b> <code>postHandle</code>, then <code>processDispatchResult</code> renders the view or runs exception resolvers.</li><li><b>7.</b> <code>afterCompletion</code> always runs for interceptors that returned true.</li></ul>`,
            r`// Heavily simplified from DispatcherServlet.doDispatch
HandlerExecutionChain chain = getHandler(request);          // mapping
HandlerAdapter ha = getHandlerAdapter(chain.getHandler());  // adapter
if (!chain.applyPreHandle(request, response)) return;       // interceptors
ModelAndView mv = ha.handle(request, response, chain.getHandler());
chain.applyPostHandle(request, response, mv);
processDispatchResult(request, response, chain, mv, ex);    // view or error
// finally: chain.triggerAfterCompletion(...)

// OUTPUT:
// request flow: mapping -> adapter -> pre -> handler -> post -> render -> after`],
        [`<p>Where you can plug in:</p><ul><li><b>Filter:</b> <code>OncePerRequestFilter</code> for logging, security and encoding.</li><li><b>Interceptor:</b> <code>HandlerInterceptor</code> for handler-aware cross-cutting logic.</li><li><b>Argument resolver:</b> a custom <code>HandlerMethodArgumentResolver</code> for your own parameter types.</li><li><b>Return value handler:</b> custom return types.</li><li><b>Advice:</b> <code>RequestBodyAdvice</code> and <code>ResponseBodyAdvice</code> around body conversion.</li><li><b>Exception resolver:</b> <code>@ControllerAdvice</code> with <code>@ExceptionHandler</code>.</li></ul>`,
            r`@Component
public class CurrentUserResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.getParameterType().equals(CurrentUser.class);
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer c,
            NativeWebRequest req, WebDataBinderFactory f) {
        String name = req.getHeader("X-User");
        return new CurrentUser(name == null ? "guest" : name);
    }
}
// @GetMapping("/me") String me(CurrentUser u) { return u.name(); }

// OUTPUT:
// GET /me with header X-User: asha -> asha`],
        [`<p>Common mistakes:</p><ul><li><b>Interceptor returns false without writing a response:</b> the client gets an empty 200.</li><li><b>Filter order wrong:</b> a security filter placed after the logging filter hides the user name.</li><li><b>Reading the body twice:</b> the request stream can be read only once; wrap the request if needed.</li><li><b>Thinking interceptors see static files:</b> that depends on the resource handler setup.</li><li><b>Handling exceptions in the interceptor</b> instead of in <code>@ControllerAdvice</code>.</li></ul>`,
            r`// WRONG: stops the chain but sends nothing
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    return q.getHeader("X-Key") != null;
}

// RIGHT: stop and answer
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h)
        throws IOException {
    if (q.getHeader("X-Key") == null) {
        s.sendError(HttpServletResponse.SC_UNAUTHORIZED, "key required");
        return false;
    }
    return true;
}

// OUTPUT:
// WRONG: HTTP 200 with empty body
// RIGHT: HTTP 401 key required`],
        [`<p>Performance and tuning:</p><ul><li><b>Cheap interceptors:</b> they run on every request, so avoid database calls.</li><li><b>Path patterns:</b> limit interceptors to the paths they need.</li><li><b>Handler lookup</b> is cached after startup; the mapping uses a path-pattern tree, so large controller counts are fine.</li><li><b>Async:</b> return <code>Callable</code> or <code>DeferredResult</code> to free the container thread for slow work.</li><li><b>Measure:</b> Micrometer exposes <code>http.server.requests</code> timing for every handler.</li></ul>`,
            r`@GetMapping("/report")
public Callable<String> report() {
    return () -> {                 // runs on an executor, not the request thread
        Thread.sleep(500);
        return "done";
    };
}

// OUTPUT:
// GET /report -> after about 500 ms: done (container thread was free meanwhile)`],
        [`<p>Scenario: audit every API call with the user, path, status and duration.</p><ul><li>A filter wraps the request so it can read the status and time the whole chain.</li><li>The audit entry is written after the response, so failures are logged as well.</li><li>The same entry can add the handler name through an interceptor attribute.</li></ul>`,
            r`@Component
public class AuditFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(AuditFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        long t0 = System.nanoTime();
        try {
            chain.doFilter(req, res);
        } finally {
            log.info("{} {} -> {} in {} ms", req.getMethod(), req.getRequestURI(),
                res.getStatus(), (System.nanoTime() - t0) / 1_000_000);
        }
    }
}

// OUTPUT: (varies)
// INFO GET /api/orders/7 -> 200 in 12 ms`]
    ),

    'mvc-xml-based-configuration': dv(
        [`<p>How the XML is processed:</p><ul><li><b>Startup:</b> the container reads <code>web.xml</code>, creates <code>ContextLoaderListener</code> (root context) and <code>DispatcherServlet</code> (child context).</li><li><b>Reader:</b> <code>XmlBeanDefinitionReader</code> parses each file into <code>BeanDefinition</code> objects.</li><li><b>Namespaces:</b> <code>NamespaceHandler</code> classes registered in <code>META-INF/spring.handlers</code> translate tags such as <code>mvc:annotation-driven</code>.</li><li><b>Refresh:</b> <code>AbstractApplicationContext.refresh</code> instantiates singletons and runs post-processors.</li><li><b>Visibility:</b> child beans see root beans, but root beans do not see child beans.</li></ul>`,
            r`<!-- web.xml: root context -->
<context-param>
  <param-name>contextConfigLocation</param-name>
  <param-value>/WEB-INF/applicationContext.xml</param-value>
</context-param>
<listener>
  <listener-class>
    org.springframework.web.context.ContextLoaderListener
  </listener-class>
</listener>

<!-- OUTPUT:
     root context = services and repositories
     dispatcher-servlet.xml = child context with controllers -->`],
        [`<p>Useful XML options:</p><ul><li><b>Bean wiring:</b> <code>constructor-arg</code> and <code>property</code> elements, with <code>ref</code> or <code>value</code>.</li><li><b>Properties:</b> <code>context:property-placeholder</code> loads a properties file.</li><li><b>Profiles:</b> a nested <code>beans profile="dev"</code> element.</li><li><b>Imports:</b> <code>import resource="other.xml"</code> splits large files.</li><li><b>Annotation config:</b> <code>context:annotation-config</code> turns on <code>@Autowired</code> without scanning.</li><li><b>Message converters:</b> nested elements under <code>mvc:annotation-driven</code>.</li></ul>`,
            r`<beans profile="dev">
  <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="url" value="jdbc:h2:mem:test"/>
  </bean>
</beans>
<beans profile="prod">
  <bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
    <property name="jdbcUrl" value="jdbc:postgresql://db/app"/>
  </bean>
</beans>

<!-- OUTPUT: the bean for the active profile (spring.profiles.active) is created -->`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Wrong XSD or namespace:</b> tags are unknown; check the schema declarations.</li><li><b>Controllers scanned in the root context:</b> mappings do not work in the child context; scan controllers only in the servlet file.</li><li><b>Duplicate scan:</b> scanning the same package in both contexts creates two copies of each bean.</li><li><b>Missing mvc:annotation-driven:</b> <code>@RequestMapping</code> methods return 404.</li><li><b>Typos in class names</b> fail only at startup.</li></ul>`,
            r`<!-- root context: services only -->
<context:component-scan base-package="com.example">
  <context:exclude-filter type="annotation"
      expression="org.springframework.stereotype.Controller"/>
</context:component-scan>

<!-- servlet context: controllers only -->
<context:component-scan base-package="com.example" use-default-filters="false">
  <context:include-filter type="annotation"
      expression="org.springframework.stereotype.Controller"/>
</context:component-scan>

<!-- OUTPUT: each bean exists once, in the right context -->`],
        [`<p>Performance and tuning:</p><ul><li><b>Startup time:</b> classpath scanning plus big XML files slow startup; narrow base packages.</li><li><b>Lazy init:</b> <code>default-lazy-init="true"</code> on the beans element postpones creation.</li><li><b>Validation:</b> XML schema validation costs a little; it stays on in dev to catch errors.</li><li><b>Migration:</b> moving to Java config gives IDE refactoring and faster feedback.</li></ul>`,
            r`<beans default-lazy-init="true" xmlns="http://www.springframework.org/schema/beans">
  <!-- beans are created on first use -->
</beans>

<!-- OUTPUT:
     startup time drops; the first request pays the creation cost -->`],
        [`<p>Scenario: a ten-year-old WAR application moves to Java configuration step by step.</p><ul><li>Create a <code>@Configuration</code> class that imports the old XML.</li><li>Convert beans one module at a time and delete their XML.</li><li>Replace <code>web.xml</code> with an initializer when no listeners remain.</li><li>Keep tests loading the context after each step.</li></ul>`,
            r`@Configuration
@ImportResource("classpath:legacy-beans.xml")   // old beans keep working
@ComponentScan("com.example.newcode")           // new code uses annotations
public class MigrationConfig { }

// OUTPUT:
// legacy XML beans and new annotated beans live in one context`]
    ),

    'mvc-java-based-configuration': dv(
        [`<p>Bootstrapping without XML:</p><ul><li><b>Discovery:</b> the servlet container finds <code>SpringServletContainerInitializer</code>, which calls every <code>WebApplicationInitializer</code>.</li><li><b>Context:</b> the base class builds an <code>AnnotationConfigWebApplicationContext</code> for root and servlet configs.</li><li><b>Parsing:</b> <code>ConfigurationClassPostProcessor</code> parses <code>@Configuration</code>, <code>@ComponentScan</code>, <code>@Import</code> and <code>@Bean</code>.</li><li><b>Registration:</b> the servlet is added with <code>ServletContext.addServlet</code>.</li></ul>`,
            r`// What the abstract base class does, written by hand
public class ManualInit implements WebApplicationInitializer {
    public void onStartup(ServletContext ctx) {
        AnnotationConfigWebApplicationContext web =
            new AnnotationConfigWebApplicationContext();
        web.register(WebConfig.class);
        ServletRegistration.Dynamic reg =
            ctx.addServlet("dispatcher", new DispatcherServlet(web));
        reg.setLoadOnStartup(1);
        reg.addMapping("/");
    }
}

// OUTPUT:
// DispatcherServlet registered at "/" with WebConfig as its context`],
        [`<p>Options in Java configuration:</p><ul><li><b>@Import</b> of other configuration classes or selectors.</li><li><b>@PropertySource</b> plus <code>Environment</code> to read properties.</li><li><b>@Profile</b> and <code>@Conditional</code> for environment-specific beans.</li><li><b>@Bean</b> attributes: <code>name</code>, <code>initMethod</code>, <code>destroyMethod</code>.</li><li><b>@Scope</b> to change singleton to prototype or request.</li><li><b>@Lazy</b> to delay creation.</li></ul>`,
            r`@Configuration
@PropertySource("classpath:app.properties")
public class InfraConfig {
    @Autowired Environment env;

    @Bean(destroyMethod = "close")
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(env.getProperty("db.url"));
        ds.setMaximumPoolSize(env.getProperty("db.pool", Integer.class, 10));
        return ds;
    }

    @Bean @Scope("prototype")
    public ReportBuilder reportBuilder() { return new ReportBuilder(); }
}

// OUTPUT:
// one shared pool bean; a new ReportBuilder on every injection`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Calling a @Bean method from a lite class:</b> with <code>proxyBeanMethods = false</code> it creates a new object; pass a parameter instead.</li><li><b>Final configuration class:</b> CGLIB cannot subclass it.</li><li><b>Wrong root and servlet split:</b> controllers in the root config are not found by the servlet.</li><li><b>Circular dependencies</b> between beans; use setter injection or redesign.</li><li><b>Hard-coded values:</b> read them from the <code>Environment</code>.</li></ul>`,
            r`// WRONG in lite mode: creates a second Engine
@Configuration(proxyBeanMethods = false)
class Lite {
    @Bean Engine engine() { return new Engine(); }
    @Bean Car car() { return new Car(engine()); }       // new Engine!
}

// RIGHT: ask the container for it
@Configuration(proxyBeanMethods = false)
class Fixed {
    @Bean Engine engine() { return new Engine(); }
    @Bean Car car(Engine engine) { return new Car(engine); }
}

// OUTPUT:
// Lite: two Engine objects; Fixed: one shared Engine`],
        [`<p>Performance and tuning:</p><ul><li><b>Lite mode</b> avoids CGLIB subclass creation and speeds startup.</li><li><b>Narrow scanning</b> with specific packages reduces classpath work.</li><li><b>@Lazy</b> on rarely used beans defers cost.</li><li><b>Static @Bean</b> methods for post-processors avoid early creation of the configuration class.</li><li><b>Conditionals</b> keep unused infrastructure out of the context.</li></ul>`,
            r`@Configuration(proxyBeanMethods = false)
public class FastConfig {
    @Bean
    static BeanFactoryPostProcessor customizer() {   // static: no early config init
        return bf -> { /* adjust bean definitions */ };
    }
    @Bean @Lazy
    HeavyService heavy() { return new HeavyService(); }
}

// OUTPUT:
// context starts faster; HeavyService is created on first use`],
        [`<p>Scenario: a team builds a new Spring MVC WAR without Boot for a container that is mandated by the customer.</p><ul><li>An initializer replaces <code>web.xml</code>.</li><li>Root config holds services, JPA and security; web config holds MVC.</li><li>Tests use <code>@SpringJUnitWebConfig</code> and MockMvc.</li></ul>`,
            r`@SpringJUnitWebConfig({RootConfig.class, WebConfig.class})
class AppIT {
    MockMvc mvc;

    @BeforeEach
    void setUp(WebApplicationContext ctx) {
        mvc = MockMvcBuilders.webAppContextSetup(ctx).build();
    }

    @Test
    void homeRenders() throws Exception {
        mvc.perform(get("/home")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),

    'mvc-configuration': dv(
        [`<p>How <code>@Configuration</code> is processed:</p><ul><li><b>Early parsing:</b> <code>ConfigurationClassPostProcessor</code>, a <code>BeanDefinitionRegistryPostProcessor</code>, finds candidate classes.</li><li><b>ConfigurationClassParser</b> handles <code>@ComponentScan</code>, <code>@Import</code>, <code>@PropertySource</code> and <code>@Bean</code> methods.</li><li><b>Enhancement:</b> full classes are replaced by a CGLIB subclass that intercepts <code>@Bean</code> calls.</li><li><b>Interception:</b> a call first checks the container for an existing singleton and creates one only if missing.</li><li><b>Loading:</b> <code>ConfigurationClassBeanDefinitionReader</code> turns each <code>@Bean</code> method into a bean definition.</li></ul>`,
            r`@Configuration
class Cfg {
    @Bean Engine engine() { System.out.println("new Engine"); return new Engine(); }
    @Bean Car car() { return new Car(engine()); }
    @Bean Bike bike() { return new Bike(engine()); }
}
// ctx = new AnnotationConfigApplicationContext(Cfg.class);
System.out.println(ctx.getBean(Cfg.class).getClass().getSimpleName());

// OUTPUT:
// new Engine
// Cfg$$SpringCGLIB$$0`],
        [`<p>Ways to compose configuration:</p><ul><li><b>@Import(Other.class):</b> pull in another configuration.</li><li><b>ImportSelector and ImportBeanDefinitionRegistrar:</b> choose or register beans programmatically (used by <code>@Enable...</code> annotations).</li><li><b>@ComponentScan:</b> discover nested configuration classes.</li><li><b>@Conditional variants:</b> <code>@ConditionalOnProperty</code> (Boot), <code>@Profile</code>.</li><li><b>@ConfigurationProperties</b> in Boot: bind a group of properties to a typed class.</li></ul>`,
            r`@Retention(RetentionPolicy.RUNTIME)
@Import(AuditConfig.class)
public @interface EnableAudit { }

@Configuration
class AuditConfig {
    @Bean AuditService auditService() { return new AuditService(); }
}

@Configuration
@EnableAudit                        // one annotation turns the feature on
class App { }

// OUTPUT:
// bean "auditService" is registered because @EnableAudit imported AuditConfig`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>@Configuration on a class with a constructor needing unavailable args:</b> keep constructors simple or inject by parameters.</li><li><b>Missing @Configuration:</b> a class with only <code>@Bean</code> methods (lite mode) works but without the singleton guarantee.</li><li><b>Beans defined twice</b> by scanning and an <code>@Import</code>; the later definition may override or fail.</li><li><b>Non-static BeanPostProcessor beans</b> trigger warnings that the configuration class is created too early.</li></ul>`,
            r`@Configuration
public class Fix {
    // WRONG: instance method for a BeanFactoryPostProcessor
    // @Bean PropertySourcesPlaceholderConfigurer p() { ... }

    // RIGHT: static method
    @Bean
    static PropertySourcesPlaceholderConfigurer placeholder() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}

// OUTPUT:
// WRONG logs: @Bean method is non-static and returns an object assignable to BeanFactoryPostProcessor
// RIGHT: no warning`],
        [`<p>Performance and tuning:</p><ul><li><b>proxyBeanMethods = false</b> on classes whose beans do not call each other.</li><li><b>Slim classes:</b> many small configurations are easier to test and conditionally load.</li><li><b>Startup report:</b> Boot <code>--debug</code> shows conditions evaluation; Actuator <code>/actuator/beans</code> lists the beans.</li><li><b>GraalVM:</b> lite mode and static analysis friendly code help native images.</li></ul>`,
            r`# application.properties: list what was created
management.endpoints.web.exposure.include=beans,conditions

# OUTPUT:
# GET /actuator/beans -> JSON of every bean and its dependencies`],
        [`<p>Scenario: a service needs a different HTTP client per environment.</p><ul><li>A configuration reads the base URL and timeout from properties.</li><li>A profile switches to a stub client in tests.</li><li>The rest of the code only sees the <code>PaymentClient</code> interface.</li></ul>`,
            r`@Configuration
public class ClientConfig {
    @Bean @Profile("!test")
    PaymentClient realClient(RestClient.Builder builder,
            @Value("` + r`$` + r`{payment.url}") String url) {
        return new HttpPaymentClient(builder.baseUrl(url).build());
    }

    @Bean @Profile("test")
    PaymentClient stubClient() {
        return amount -> "OK-" + amount;
    }
}

// OUTPUT:
// profile test -> stub returns OK-100; other profiles call the real URL`]
    ),

    'mvc-enablewebmvc': dv(
        [`<p>What the annotation sets up:</p><ul><li><b>Import:</b> <code>@Import(DelegatingWebMvcConfiguration.class)</code>.</li><li><b>Support class:</b> <code>WebMvcConfigurationSupport</code> declares the beans: <code>RequestMappingHandlerMapping</code>, <code>RequestMappingHandlerAdapter</code>, <code>ContentNegotiationManager</code>, <code>HandlerExceptionResolver</code> chain and more.</li><li><b>Delegation:</b> the delegating subclass autowires every <code>WebMvcConfigurer</code> and calls them in turn.</li><li><b>Detection:</b> Jackson, JAXB and others are added when found on the classpath.</li></ul>`,
            r`@Configuration
@EnableWebMvc
class Cfg implements WebMvcConfigurer { }

// check what exists
String[] names = ctx.getBeanNamesForType(HandlerMapping.class);
System.out.println(Arrays.toString(names));

// OUTPUT:
// [requestMappingHandlerMapping, viewControllerHandlerMapping,
//  beanNameHandlerMapping, resourceHandlerMapping]`],
        [`<p>Variants and alternatives:</p><ul><li><b>@EnableWebMvc + WebMvcConfigurer:</b> standard in plain Spring.</li><li><b>Extend WebMvcConfigurationSupport:</b> full control, override <code>@Bean</code> methods yourself.</li><li><b>Boot without the annotation:</b> auto-configuration plus <code>WebMvcConfigurer</code>.</li><li><b>@EnableWebMvc in Boot:</b> intentional full takeover.</li><li><b>WebMvcRegistrations:</b> Boot hook to replace a core MVC component but keep the rest.</li></ul>`,
            r`@Configuration
public class MvcRegs implements WebMvcRegistrations {
    @Override
    public RequestMappingHandlerMapping getRequestMappingHandlerMapping() {
        RequestMappingHandlerMapping m = new RequestMappingHandlerMapping();
        m.setUseTrailingSlashMatch(false);       // customized core bean
        return m;
    }
}

// OUTPUT:
// Boot keeps its other MVC defaults but uses this handler mapping`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>@EnableWebMvc in a Boot app</b> by habit: static files, welcome page and Boot JSON properties stop working; remove it.</li><li><b>Two @EnableWebMvc classes</b> or a class extending the support class plus the annotation: duplicate beans.</li><li><b>Forgetting resource handling</b> after enabling it in plain Spring: add <code>addResourceHandlers</code> or <code>configurer.enable()</code> for the default servlet.</li><li><b>No Jackson on the classpath:</b> <code>@ResponseBody</code> objects fail with 406.</li></ul>`,
            r`@Override
public void configureDefaultServletHandling(
        DefaultServletHandlerConfigurer configurer) {
    configurer.enable();        // let the container serve other static files
}

// OUTPUT:
// URLs not matched by a controller are forwarded to the default servlet`],
        [`<p>Performance and tuning:</p><ul><li>The annotation itself has no runtime cost; the cost is in the registered components.</li><li>Remove unused message converters to shorten the search for the right one.</li><li>Cache static resources with <code>setCachePeriod</code> or a resource chain with versioned URLs.</li><li>Configure a single <code>ObjectMapper</code> bean and reuse it.</li></ul>`,
            r`@Override
public void addResourceHandlers(ResourceHandlerRegistry r) {
    r.addResourceHandler("/assets/**")
     .addResourceLocations("classpath:/assets/")
     .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic());
}

// OUTPUT:
// GET /assets/app.js -> Cache-Control: max-age=2592000, public`],
        [`<p>Scenario: a legacy WAR migrates to Spring Boot.</p><ul><li>The old <code>@EnableWebMvc</code> class has many customizations.</li><li>The annotation is removed and the class keeps only <code>implements WebMvcConfigurer</code>.</li><li>Tests with <code>@WebMvcTest</code> confirm the pages and JSON are unchanged.</li></ul>`,
            r`@WebMvcTest(ItemController.class)
class ItemControllerTest {
    @Autowired MockMvc mvc;
    @MockBean ItemService service;

    @Test
    void json() throws Exception {
        given(service.find(1L)).willReturn(new Item(1L, "pen"));
        mvc.perform(get("/items/1").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("pen"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),

    'mvc-webmvcconfigurer': dv(
        [`<p>How the callbacks are used:</p><ul><li><b>Collection:</b> <code>DelegatingWebMvcConfiguration.setConfigurers</code> receives all <code>WebMvcConfigurer</code> beans.</li><li><b>Composite:</b> a <code>WebMvcConfigurerComposite</code> loops over them for each hook.</li><li><b>Hooks:</b> the support class calls <code>addInterceptors</code>, <code>addResourceHandlers</code> and others while it builds the MVC beans.</li><li><b>Java 8 defaults:</b> since all methods are default, you do not need the old adapter class.</li></ul>`,
            r`@Configuration
class A implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry r) {
        System.out.println("A adds interceptor");
    }
}
@Configuration
class B implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry r) {
        System.out.println("B adds interceptor");
    }
}

// OUTPUT:
// A adds interceptor
// B adds interceptor   (order follows bean order, use @Order to control it)`],
        [`<p>Frequently used hooks:</p><ul><li><code>addInterceptors</code>, <code>addCorsMappings</code>, <code>addResourceHandlers</code>.</li><li><code>addViewControllers</code>, <code>configureViewResolvers</code>.</li><li><code>addArgumentResolvers</code>, <code>addReturnValueHandlers</code>.</li><li><code>configureMessageConverters</code>, <code>extendMessageConverters</code>.</li><li><code>addFormatters</code>, <code>getValidator</code>.</li><li><code>configureContentNegotiation</code>, <code>configureAsyncSupport</code>, <code>configurePathMatch</code>.</li></ul>`,
            r`@Override
public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    for (HttpMessageConverter<?> c : converters) {
        if (c instanceof MappingJackson2HttpMessageConverter j) {
            j.getObjectMapper()
             .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        }
    }
}

@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.defaultContentType(MediaType.APPLICATION_JSON);
}

// OUTPUT:
// dates are written as ISO text; clients without Accept get JSON`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>configureMessageConverters instead of extend:</b> the defaults vanish and some content types stop working.</li><li><b>Interceptor on "/**" blocking static files:</b> exclude resource paths.</li><li><b>CORS with credentials and wildcard origin:</b> browsers reject it; list explicit origins.</li><li><b>Spring Security ignoring MVC CORS:</b> enable <code>http.cors()</code> as well.</li><li><b>Interceptor bean not registered:</b> an interceptor is only active after <code>addInterceptor</code>.</li></ul>`,
            r`// WRONG: wildcard with credentials
registry.addMapping("/api/**").allowedOrigins("*").allowCredentials(true);

// RIGHT: explicit origin
registry.addMapping("/api/**")
        .allowedOrigins("https://app.example.com")
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .allowCredentials(true)
        .maxAge(3600);

// OUTPUT:
// WRONG: IllegalArgumentException when allowCredentials is true and origin is "*"
// RIGHT: preflight answered, cached for one hour`],
        [`<p>Performance and tuning:</p><ul><li><b>maxAge</b> on CORS caches preflight results in the browser.</li><li><b>Resource chain</b> with a content hash and <code>CachingResourceResolver</code> reduces repeated lookups.</li><li><b>Async support:</b> set a task executor with <code>configureAsyncSupport</code> for <code>Callable</code> returns.</li><li><b>Interceptor patterns:</b> keep them narrow.</li></ul>`,
            r`@Override
public void configureAsyncSupport(AsyncSupportConfigurer c) {
    ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
    ex.setCorePoolSize(8);
    ex.setMaxPoolSize(32);
    ex.setThreadNamePrefix("mvc-async-");
    ex.initialize();
    c.setTaskExecutor(ex);
    c.setDefaultTimeout(30_000);
}

// OUTPUT:
// Callable results run on mvc-async-* threads; requests time out after 30 s`],
        [`<p>Scenario: a single-page app on one domain calls an API on another.</p><ul><li>CORS is allowed for the front-end origin only.</li><li>A request-ID interceptor adds a header for tracing.</li><li>A test checks both behaviors through MockMvc.</li></ul>`,
            r`@Override
public void addInterceptors(InterceptorRegistry r) {
    r.addInterceptor(new HandlerInterceptor() {
        public boolean preHandle(HttpServletRequest q, HttpServletResponse s,
                Object h) {
            s.setHeader("X-Request-Id", UUID.randomUUID().toString());
            return true;
        }
    }).addPathPatterns("/api/**");
}

// OUTPUT: (varies)
// GET /api/items -> X-Request-Id: 3f2c9d1e-...`]
    ),

    'mvc-component-scanning': dv(
        [`<p>How the scan works:</p><ul><li><b>Parser:</b> <code>ComponentScanAnnotationParser</code> creates a <code>ClassPathBeanDefinitionScanner</code>.</li><li><b>Search:</b> it lists <code>.class</code> resources under the base package (<code>classpath*:com/example/**/*.class</code>).</li><li><b>Metadata:</b> the ASM-based <code>MetadataReader</code> reads annotations without loading the class.</li><li><b>Filter:</b> classes with <code>@Component</code> (directly or as a meta-annotation) pass; abstract classes and interfaces are skipped.</li><li><b>Registration:</b> a <code>ScannedGenericBeanDefinition</code> is registered with a name from <code>AnnotationBeanNameGenerator</code>.</li></ul>`,
            r`AnnotationConfigApplicationContext ctx =
    new AnnotationConfigApplicationContext("com.example");
for (String n : ctx.getBeanDefinitionNames()) {
    if (!n.contains(".") && !n.startsWith("org.")) System.out.println(n);
}

// OUTPUT: (varies)
// greetingService
// orderController
// orderRepository`],
        [`<p>Variants:</p><ul><li><code>@ComponentScan(basePackageClasses = X.class)</code>: type-safe marker class instead of a string.</li><li><code>useDefaultFilters = false</code> with <code>includeFilters</code>: scan only chosen types.</li><li><code>nameGenerator</code>: custom naming.</li><li><code>lazyInit = true</code>: scanned beans created on demand.</li><li><code>@ComponentScans</code> or repeated <code>@ComponentScan</code>: several scans.</li><li>Boot: <code>@SpringBootApplication(scanBasePackages = ...)</code>.</li></ul>`,
            r`@Configuration
@ComponentScan(
    basePackageClasses = ServiceMarker.class,
    useDefaultFilters = false,
    includeFilters = @ComponentScan.Filter(
        type = FilterType.ANNOTATION, classes = Service.class),
    lazyInit = true)
public class ServiceScanConfig { }

public interface ServiceMarker { }       // marks the package com.example.service

// OUTPUT:
// only @Service classes in com.example.service are registered, created lazily`],
        [`<p>Common mistakes and fixes:</p><ul><li><b>Class outside the scanned package:</b> bean not found, <code>NoSuchBeanDefinitionException</code>.</li><li><b>Main class in the default package:</b> Boot scans everything and warns; use a named package.</li><li><b>Two beans with the same name</b> from different packages: <code>ConflictingBeanDefinitionException</code>; set explicit names.</li><li><b>Annotation on an interface</b> only: scanning ignores interfaces.</li><li><b>Scanning too wide</b> (for example the package <code>com</code>) picks up library classes and slows startup.</li></ul>`,
            r`// WRONG: two classes both named Client -> default name "client" clashes
package com.a;  @Component public class Client { }
package com.b;  @Component public class Client { }

// RIGHT: explicit names
package com.a;  @Component("aClient") public class Client { }
package com.b;  @Component("bClient") public class Client { }

// OUTPUT:
// WRONG: ConflictingBeanDefinitionException: annotation-specified bean name 'client'
// RIGHT: both beans registered`],
        [`<p>Performance and tuning:</p><ul><li><b>Narrow base packages</b> cut the number of classes read.</li><li><b>Spring Boot 3 AOT</b> and native images do the scan at build time.</li><li><b>Index:</b> the optional <code>spring-context-indexer</code> (older versions) listed candidates at build time; AOT is the modern route.</li><li><b>Lazy init</b> postpones creation of scanned beans.</li><li><b>Measure:</b> startup logs with <code>logging.level.org.springframework.context.annotation=DEBUG</code> show scanning detail.</li></ul>`,
            r`# application.properties
spring.main.lazy-initialization=true
logging.level.org.springframework.context.annotation=DEBUG

# OUTPUT:
# faster startup; DEBUG lines list each scanned candidate component`],
        [`<p>Scenario: a modular monolith has a shared library with its own beans.</p><ul><li>The main app lives in <code>com.shop</code>, the library in <code>com.shared</code>.</li><li>Boot does not scan the library package by default.</li><li>The app lists both packages, and a test proves the library beans are present.</li></ul>`,
            r`@SpringBootApplication(scanBasePackages = {"com.shop", "com.shared"})
public class ShopApp { }

@SpringBootTest
class ScanIT {
    @Autowired ApplicationContext ctx;

    @Test
    void sharedBeansPresent() {
        assertTrue(ctx.containsBean("auditService"));   // from com.shared
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    )
};
