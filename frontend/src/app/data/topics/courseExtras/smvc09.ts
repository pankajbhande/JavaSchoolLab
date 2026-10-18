// Spring extras, batch smvc09 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc09Extras: Record<string, Extra> = {
    'mvc-view-resolution': x(
        ['<b>View resolution</b> is the step where Spring MVC turns the logical view name returned by a controller (such as <code>"home"</code>) into a real <code>View</code> object that renders the response.',
            '<b>Who does it</b>: the <code>DispatcherServlet</code> asks each registered <code>ViewResolver</code> in order until one returns a view.',
            '<b>Why</b> it exists: controllers stay free of file paths and technology, so JSP can be swapped for Thymeleaf without touching them.'],
        ['<b>Flow</b>: handler returns a name or <code>ModelAndView</code>, then <code>resolveViewName</code>, then <code>view.render(model, request, response)</code>.',
            '<b>Order</b>: resolvers are sorted by their <code>order</code> value, and the first non-null result wins.',
            '<b>No view name</b>: if a handler returns void, the name is derived from the request URL by <code>RequestToViewNameTranslator</code>.'],
        ['<b>Content negotiation</b>: <code>ContentNegotiatingViewResolver</code> picks among candidate views by the requested media type.',
            '<b>Not for REST</b>: with <code>@ResponseBody</code> or <code>@RestController</code> no view resolution happens; a message converter writes the body.',
            '<b>Failure mode</b>: if no resolver finds a view you see a 404 or a <code>ServletException: Could not resolve view</code>.'],
        [['F', 'What is view resolution?', 'It maps a logical view name from the controller to an actual View that renders the page.'],
            ['F', 'Which component performs it?', 'The DispatcherServlet, using the configured ViewResolver beans.'],
            ['M', 'What happens with several ViewResolvers?', 'They are tried in order and the first one that returns a non-null View is used.'],
            ['M', 'Is a view resolved for a @RestController?', 'No. The return value is written by an HttpMessageConverter, so the view step is skipped.'],
            ['S', 'Which method of DispatcherServlet resolves the view?', 'resolveViewName inside render, which loops over viewResolvers and calls each resolveViewName.'],
            ['S', 'What if a resolver should be a catch-all?', 'Give it the lowest priority order, because resolvers like InternalResourceViewResolver always return a view.']],
        [['Return a logical name from a controller.',
            r`@Controller
public class HomeController {
    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("msg", "Hello");
        return "home";            // logical name, not a file path
    }
}
// view.prefix=/WEB-INF/views/  view.suffix=.jsp

// OUTPUT:
// GET /home -> forwards to /WEB-INF/views/home.jsp with model msg=Hello`],
            ['Write the name through ModelAndView.',
                r`@GetMapping("/profile")
public ModelAndView profile() {
    ModelAndView mav = new ModelAndView("profile");
    mav.addObject("user", "abaji");
    return mav;
}

// OUTPUT:
// viewName=profile, model={user=abaji}, resolved by the first matching ViewResolver`]],
        [['Test the logical view name with MockMvc.',
            r`@WebMvcTest(HomeController.class)
class HomeControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void homeView() throws Exception {
        mvc.perform(get("/home"))
           .andExpect(status().isOk())
           .andExpect(view().name("home"))
           .andExpect(model().attribute("msg", "Hello"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Inspect the registered resolvers.',
                r`@Autowired ListableBeanFactory ctx;

void show() {
    ctx.getBeansOfType(ViewResolver.class)
       .forEach((n, v) -> System.out.println(n + " -> " + v.getClass().getSimpleName()));
}

// OUTPUT: (varies)
// defaultViewResolver -> InternalResourceViewResolver
// viewResolver -> ContentNegotiatingViewResolver
// beanNameViewResolver -> BeanNameViewResolver`]]
    ),
    'mvc-viewresolver-modelview': x(
        ['<b>ViewResolver</b> is an interface with one method, <code>View resolveViewName(String viewName, Locale locale)</code>, that returns a <code>View</code> or null.',
            '<b>Purpose</b>: it decouples the controller from the view technology (JSP, Thymeleaf, FreeMarker, PDF).',
            '<b>With ModelAndView</b>: the view name you put in <code>ModelAndView</code> is exactly the string given to the resolver.'],
        ['<b>Null means pass</b>: returning null lets the next resolver in the chain try.',
            '<b>View object</b>: a controller can also set a concrete <code>View</code> in <code>ModelAndView</code>, which skips resolution.',
            '<b>Common types</b>: <code>InternalResourceViewResolver</code>, <code>ThymeleafViewResolver</code>, <code>BeanNameViewResolver</code>, <code>ContentNegotiatingViewResolver</code>.'],
        ['<b>Caching</b>: <code>AbstractCachingViewResolver</code> caches views by name and locale; disable it in development.',
            '<b>Custom resolver</b>: implement the interface and implement <code>Ordered</code> so it runs before the catch-all one.',
            '<b>Registration</b>: expose a <code>@Bean</code> or use <code>WebMvcConfigurer.configureViewResolvers</code>.'],
        [['F', 'What does a ViewResolver return?', 'A View object for a logical name, or null if it cannot handle the name.'],
            ['F', 'How does ModelAndView relate to it?', 'ModelAndView carries the logical view name and the model; the resolver turns the name into a View.'],
            ['M', 'How do you skip resolution?', 'Put a View instance (for example RedirectView) in ModelAndView instead of a name.'],
            ['M', 'How is the order controlled?', 'Through the order property or the Ordered interface; lower values run first.'],
            ['S', 'Why do internal resolvers need the lowest priority?', 'Because they never return null, so any resolver after them would never be asked.'],
            ['S', 'Why turn off view caching in development?', 'Cached views hide template edits until the cache is cleared or the app restarts.']],
        [['A tiny custom ViewResolver.',
            r`@Component
public class CsvViewResolver implements ViewResolver, Ordered {
    public View resolveViewName(String name, Locale locale) {
        if (!name.startsWith("csv:")) return null;   // not mine, pass on
        return new CsvView();
    }
    public int getOrder() { return 1; }
}

// OUTPUT:
// "csv:report" -> CsvView, other names fall through to the next resolver`],
            ['Register through configurer.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.jsp("/WEB-INF/views/", ".jsp");
    }
}

// OUTPUT:
// "home" -> /WEB-INF/views/home.jsp`]],
        [['Return a ModelAndView with a name and model.',
            r`@GetMapping("/order/{id}")
public ModelAndView order(@PathVariable long id) {
    ModelAndView mav = new ModelAndView("order/detail");
    mav.addObject("order", service.find(id));
    mav.setStatus(HttpStatus.OK);
    return mav;
}

// OUTPUT:
// GET /order/5 -> view "order/detail" with model key order`],
            ['Assert resolution with MockMvc.',
                r`mvc.perform(get("/order/5"))
   .andExpect(view().name("order/detail"))
   .andExpect(model().attributeExists("order"));

// OUTPUT:
// MockMvc result: view name matches, model contains order`]]
    ),
    'mvc-internalresourceviewresolver': x(
        ['<b>InternalResourceViewResolver</b> maps a logical name to a server resource such as a JSP by adding a <code>prefix</code> and a <code>suffix</code>.',
            '<b>Example</b>: prefix <code>/WEB-INF/views/</code> plus name <code>home</code> plus suffix <code>.jsp</code> gives <code>/WEB-INF/views/home.jsp</code>.',
            '<b>Result</b>: it creates an <code>InternalResourceView</code> (or <code>JstlView</code> when JSTL is on the classpath) that forwards to that path.'],
        ['<b>Why WEB-INF</b>: files under it cannot be requested directly by a browser, so pages are only reachable through controllers.',
            '<b>Boot properties</b>: <code>spring.mvc.view.prefix</code> and <code>spring.mvc.view.suffix</code> configure it automatically.',
            '<b>Catch-all</b>: it resolves any name, so it must be the last resolver in the chain.'],
        ['<b>View class</b>: <code>setViewClass(JstlView.class)</code> exposes JSTL locale and message bundles.',
            '<b>Packaging</b>: JSP with embedded Tomcat needs war packaging or extra jasper libraries; Thymeleaf avoids this.',
            '<b>Missing page</b>: a wrong path gives a 404 from the container, not a Spring exception.'],
        [['F', 'What do prefix and suffix do?', 'They wrap the logical view name to build the resource path, for example /WEB-INF/views/ + home + .jsp.'],
            ['F', 'Why keep JSPs under WEB-INF?', 'Browsers cannot access that folder directly, so only controllers can show the pages.'],
            ['M', 'Which View does it create?', 'InternalResourceView, or JstlView if the JSTL classes are present.'],
            ['M', 'How is it set up in Spring Boot?', 'By setting spring.mvc.view.prefix and spring.mvc.view.suffix in application.properties.'],
            ['S', 'Why must it be last in the chain?', 'It never returns null for a name, so later resolvers would never be called.'],
            ['S', 'Does it support redirect: names?', 'Yes. UrlBasedViewResolver checks the redirect: and forward: prefixes before building the view.']],
        [['Java configuration.',
            r`@Bean
public ViewResolver viewResolver() {
    InternalResourceViewResolver vr = new InternalResourceViewResolver();
    vr.setPrefix("/WEB-INF/views/");
    vr.setSuffix(".jsp");
    vr.setViewClass(JstlView.class);
    return vr;
}

// OUTPUT:
// "user/list" -> /WEB-INF/views/user/list.jsp`],
            ['Boot properties.',
                r`# application.properties
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp

# OUTPUT:
# controller returns "home" -> Tomcat forwards to /WEB-INF/views/home.jsp`]],
        [['Test the forwarded URL.',
            r`mvc.perform(get("/home"))
   .andExpect(status().isOk())
   .andExpect(forwardedUrl("/WEB-INF/views/home.jsp"));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Typical mistake: wrong prefix.',
                r`// prefix has no trailing slash
vr.setPrefix("/WEB-INF/views");
// "home" becomes /WEB-INF/viewshome.jsp

// OUTPUT:
// HTTP 404 - /WEB-INF/viewshome.jsp not found (fix: end the prefix with /)`]]
    ),
    'mvc-redirect': x(
        ['<b>Redirect</b> tells the browser to make a new request to another URL: the server answers with status 302 or 303 and a <code>Location</code> header.',
            '<b>Effect</b>: the address bar changes and the model and request attributes are lost, because it is a brand new request.',
            '<b>Use it</b> after a successful POST (Post-Redirect-Get) so that refreshing the page does not submit the form again.'],
        ['<b>Ways to redirect</b>: return <code>"redirect:/users"</code>, return a <code>RedirectView</code>, or return <code>ResponseEntity</code> with a Location header.',
            '<b>Flash attributes</b>: <code>RedirectAttributes.addFlashAttribute</code> keeps a value for exactly one following request.',
            '<b>Path variables</b>: <code>addAttribute</code> adds values to the redirect URL as query parameters.'],
        ['<b>Exposed model</b>: Spring may append simple model attributes to the redirect URL; set <code>ignoreDefaultModelOnRedirect=true</code> to stop that.',
            '<b>Status code</b>: 303 See Other is the cleanest for POST redirects; 302 is the default of <code>redirect:</code>.',
            '<b>Open redirect</b>: never redirect to a URL taken from user input without validating it.'],
        [['F', 'What is a redirect?', 'The server tells the browser to request another URL, so the browser makes a new request.'],
            ['F', 'Does the URL change?', 'Yes, the address bar shows the new URL.'],
            ['M', 'What is Post-Redirect-Get?', 'After a POST the server redirects to a GET page, so a browser refresh does not repeat the POST.'],
            ['M', 'How do you pass a message through a redirect?', 'Use RedirectAttributes.addFlashAttribute, which stores it in the session for one request.'],
            ['S', 'Why is model data lost on redirect?', 'The redirect creates a new request, and the model lives only in the old one.'],
            ['S', 'What is the open redirect risk?', 'Redirecting to an unchecked user-supplied URL lets attackers send victims to malicious sites.']],
        [['Post-Redirect-Get with a flash message.',
            r`@PostMapping("/users")
public String create(@Valid UserForm form, RedirectAttributes ra) {
    User u = service.save(form);
    ra.addFlashAttribute("msg", "Saved " + u.getName());
    return "redirect:/users";
}

// OUTPUT:
// POST /users -> 302 Location: /users, then GET /users shows msg=Saved Abaji`],
            ['Redirect with RedirectView.',
                r`@GetMapping("/old")
public RedirectView old() {
    RedirectView rv = new RedirectView("/new");
    rv.setStatusCode(HttpStatus.MOVED_PERMANENTLY);
    return rv;
}

// OUTPUT:
// GET /old -> 301 Location: /new`]],
        [['Test the redirect with MockMvc.',
            r`mvc.perform(post("/users").param("name", "Abaji"))
   .andExpect(status().is3xxRedirection())
   .andExpect(redirectedUrl("/users"))
   .andExpect(flash().attribute("msg", "Saved Abaji"));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Pitfall: reading a model value after redirect.',
                r`@PostMapping("/save")
public String save(Model model) {
    model.addAttribute("msg", "Saved");   // lost after redirect
    return "redirect:/list";
}

// OUTPUT:
// GET /list shows no msg (fix: use RedirectAttributes.addFlashAttribute)`]]
    ),
    'mvc-forward': x(
        ['<b>Forward</b> hands the same request to another resource on the server, using <code>RequestDispatcher.forward</code>; the browser does not know it happened.',
            '<b>Effect</b>: the URL in the address bar stays the same, and request attributes and the model are still available.',
            '<b>Use it</b> to reuse another handler, or to render a JSP, without an extra round trip.'],
        ['<b>Same request</b>: there is only one HTTP request, so the forwarded target sees the same parameters and attributes.',
            '<b>Server-side only</b>: a forward cannot go to another application or external site.',
            '<b>Default for views</b>: <code>InternalResourceView</code> renders a JSP by forwarding to it.'],
        ['<b>Refresh problem</b>: after a forwarded POST a browser refresh submits the form again, unlike with a redirect.',
            '<b>Dispatcher type</b>: filters can be registered for <code>FORWARD</code> dispatches separately from <code>REQUEST</code>.',
            '<b>Response committed</b>: a forward fails with <code>IllegalStateException</code> if the response is already committed.'],
        [['F', 'What is a forward?', 'The server passes the same request to another internal resource, without telling the browser.'],
            ['F', 'Does the URL change on forward?', 'No, the browser still shows the original URL.'],
            ['M', 'Forward versus redirect?', 'Forward is one request and server-side; redirect is a new request and the browser changes the URL.'],
            ['M', 'Are model attributes kept on a forward?', 'Yes, because it is the same request.'],
            ['S', 'Can a forward target another web application?', 'Only through ServletContext.getContext cross-context dispatch, and it is usually disabled; use redirect for that.'],
            ['S', 'Why can forward cause double submit?', 'The browser URL is still the POST target, so a refresh repeats the POST.']],
        [['Forward to another handler.',
            r`@GetMapping("/start")
public String start() {
    return "forward:/home";          // same request, URL stays /start
}

@GetMapping("/home")
@ResponseBody
public String home() { return "home page"; }

// OUTPUT:
// GET /start -> 200 "home page" (address bar still shows /start)`],
            ['Forward with the servlet API.',
                r`@GetMapping("/legacy")
public void legacy(HttpServletRequest req, HttpServletResponse res)
        throws Exception {
    req.setAttribute("source", "legacy");
    req.getRequestDispatcher("/WEB-INF/views/legacy.jsp").forward(req, res);
}

// OUTPUT:
// legacy.jsp rendered; request attribute source=legacy is visible`]],
        [['Test the forward with MockMvc.',
            r`mvc.perform(get("/start"))
   .andExpect(forwardedUrl("/home"));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Pitfall: forward after commit.',
                r`res.getWriter().write("hi");
res.flushBuffer();                 // response committed
req.getRequestDispatcher("/x").forward(req, res);

// OUTPUT:
// java.lang.IllegalStateException: Cannot forward after response has been committed`]]
    ),
    'mvc-redirect-modelview': x(
        ['<b>redirect:</b> is a prefix on a view name, as in <code>new ModelAndView("redirect:/users")</code>; Spring turns it into a <code>RedirectView</code>.',
            '<b>Handled by</b> <code>UrlBasedViewResolver</code> (and its subclasses), which checks the prefix before applying prefix and suffix.',
            '<b>Result</b>: an HTTP 302 response with a <code>Location</code> header; no template is rendered.'],
        ['<b>Context path</b>: a path beginning with <code>/</code> is relative to the application context, so the context path is added automatically.',
            '<b>Model to query</b>: with <code>ModelAndView</code>, model attributes of simple types are appended to the URL as query parameters.',
            '<b>Absolute URL</b>: <code>redirect:https://example.com</code> redirects outside the app.'],
        ['<b>Avoid exposing data</b>: call <code>setExposeModelAttributes(false)</code> on <code>RedirectView</code> or use <code>RedirectAttributes</code> instead of a bare model.',
            '<b>Relative paths</b>: <code>redirect:list</code> resolves relative to the current request URL, which surprises many developers.',
            '<b>Status</b>: to get 301 or 303 use a <code>RedirectView</code> with <code>setStatusCode</code>.'],
        [['F', 'What does redirect: do in a view name?', 'It makes Spring send an HTTP redirect to the given URL instead of rendering a view.'],
            ['F', 'Which class does the work?', 'RedirectView, created by UrlBasedViewResolver.'],
            ['M', 'What happens to model attributes?', 'Simple values are added to the target URL as query parameters unless exposure is turned off.'],
            ['M', 'Is the context path included?', 'Yes, for URLs starting with a slash, Spring prepends the context path.'],
            ['S', 'How do you send a 301?', 'Use new RedirectView(url) with setStatusCode(HttpStatus.MOVED_PERMANENTLY).'],
            ['S', 'Why use RedirectAttributes?', 'It controls what goes into the URL and supports flash attributes, avoiding leaked model data.']],
        [['ModelAndView with redirect:.',
            r`@PostMapping("/orders")
public ModelAndView place(OrderForm form) {
    Order o = service.place(form);
    return new ModelAndView("redirect:/orders/" + o.getId());
}

// OUTPUT:
// POST /orders -> 302 Location: /shop/orders/17 (context path /shop added)`],
            ['Model attributes become query parameters.',
                r`ModelAndView mav = new ModelAndView("redirect:/search");
mav.addObject("q", "spring");
mav.addObject("page", 2);
return mav;

// OUTPUT:
// 302 Location: /search?q=spring&page=2`]],
        [['Disable model exposure.',
            r`RedirectView rv = new RedirectView("/search", true);
rv.setExposeModelAttributes(false);
return new ModelAndView(rv);

// OUTPUT:
// 302 Location: /search   (no query string)`],
            ['Test it.',
                r`mvc.perform(post("/orders").param("item", "pen"))
   .andExpect(status().is3xxRedirection())
   .andExpect(redirectedUrlPattern("/orders/*"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-forward-modelview': x(
        ['<b>forward:</b> is a prefix on a view name, as in <code>new ModelAndView("forward:/home")</code>; Spring creates an <code>InternalResourceView</code> that forwards the request.',
            '<b>Handled by</b> <code>UrlBasedViewResolver</code>, which detects the prefix before adding the configured prefix and suffix.',
            '<b>Result</b>: the same request is dispatched to another path, and the model is exposed as request attributes.'],
        ['<b>Target</b>: any path the container can dispatch to, including another controller mapping or a JSP.',
            '<b>Model</b>: model entries are copied to request attributes, so the target can read them with <code>request.getAttribute</code>.',
            '<b>URL unchanged</b>: the browser still shows the original address.'],
        ['<b>Re-entering the DispatcherServlet</b>: forwarding to a controller path runs the handler mapping again, including filters set for FORWARD.',
            '<b>Loops</b>: forwarding to the same path leads to an infinite loop and a stack overflow or container error.',
            '<b>Prefer redirect</b> after POST; use forward for internal routing and error pages.'],
        [['F', 'What does forward: do in a view name?', 'It forwards the same request to another internal path instead of rendering a view.'],
            ['F', 'Does the browser see it?', 'No, the URL stays the same and no extra request is sent.'],
            ['M', 'Where does the model go?', 'It is copied into request attributes for the forwarded target.'],
            ['M', 'Which resolver handles the prefix?', 'UrlBasedViewResolver, which makes an InternalResourceView.'],
            ['S', 'What if you forward to the same URL?', 'The request loops until the container stops it with an error.'],
            ['S', 'Do filters run again on forward?', 'Only filters mapped to the FORWARD dispatcher type run again.']],
        [['ModelAndView with forward:.',
            r`@GetMapping("/old-home")
public ModelAndView oldHome() {
    ModelAndView mav = new ModelAndView("forward:/home");
    mav.addObject("note", "moved");
    return mav;
}

// OUTPUT:
// GET /old-home -> handled by /home, request attribute note=moved`],
            ['Target controller reads the attribute.',
                r`@GetMapping("/home")
@ResponseBody
public String home(@RequestAttribute("note") String note) {
    return "home, " + note;
}

// OUTPUT:
// GET /old-home -> 200 "home, moved"`]],
        [['Test the forward.',
            r`mvc.perform(get("/old-home"))
   .andExpect(forwardedUrl("/home"));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Pitfall: forward loop.',
                r`@GetMapping("/loop")
public String loop() { return "forward:/loop"; }

// OUTPUT:
// StackOverflowError or container error after many dispatches (fix: forward elsewhere)`]]
    ),
    'mvc-jsp': x(
        ['<b>JSP</b> (Jakarta Server Pages) is a template technology where HTML mixes with tags and Expression Language; the container compiles each page into a servlet on first use.',
            '<b>In Spring MVC</b> the controller returns a logical name, <code>InternalResourceViewResolver</code> maps it to the JSP, and the JSP renders the model.',
            '<b>Location</b>: keep pages under <code>/WEB-INF/views/</code> so they are only reachable through controllers.'],
        ['<b>Model access</b>: model attributes are request attributes, so a JSP reads them with Expression Language.',
            '<b>Tags</b>: use JSTL and the Spring form tag library instead of scriptlets (<code>&lt;% %&gt;</code> Java code).',
            '<b>Spring Boot</b>: embedded Tomcat needs <code>tomcat-embed-jasper</code> and war packaging; JSP is not supported in executable jars.'],
        ['<b>Compile step</b>: the first request of a JSP is slower because Jasper translates and compiles it.',
            '<b>Security</b>: output must be escaped with <code>c:out</code> or <code>fn:escapeXml</code> to prevent XSS.',
            '<b>Limits</b>: JSPs are not natural templates and are hard to test, which is why many teams move to Thymeleaf.'],
        [['F', 'What is a JSP?', 'A page mixing HTML with tags and expressions that the container compiles into a servlet.'],
            ['F', 'Where do you place JSPs in Spring MVC?', 'Under /WEB-INF/views/, so they cannot be requested directly.'],
            ['M', 'How does a JSP read model data?', 'Model attributes are request attributes, read with Expression Language.'],
            ['M', 'Why avoid scriptlets?', 'They mix Java code with markup, hurting readability and testing; use JSTL and EL instead.'],
            ['S', 'Why is JSP awkward with Spring Boot jars?', 'Embedded containers cannot serve JSPs from a nested jar, so war packaging is required.'],
            ['S', 'How do you stop XSS in a JSP?', 'Escape every user value using c:out or the fn:escapeXml function.']],
        [['Controller and JSP.',
            r`@Controller
public class GreetController {
    @GetMapping("/greet")
    public String greet(Model model) {
        model.addAttribute("name", "Abaji");
        return "greet";
    }
}
// /WEB-INF/views/greet.jsp contains:
// <h1>Hello, <c:out value="$` + r`{name}
"/></h1>

// OUTPUT:
// <h1>Hello, Abaji</h1>`],
            ['Boot dependencies for JSP.',
                r`<!-- pom.xml: packaging war -->
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
    <scope>provided</scope>
</dependency>

// OUTPUT:
// JSP pages under src/main/webapp/WEB-INF/views are compiled and served by Tomcat`]],
        [['Test the view name (JSP is not rendered by MockMvc).',
            r`mvc.perform(get("/greet"))
   .andExpect(view().name("greet"))
   .andExpect(forwardedUrl("/WEB-INF/views/greet.jsp"));

// OUTPUT:
// Tests run: 1, Failures: 0 (MockMvc checks the forward, not the HTML)`],
            ['Pitfall: unescaped output.',
                r`<%-- unsafe: the value is written as raw HTML --%>
<p>Hi $` + r`{param.name}
</p>
<%-- safe --%>
<p>Hi <c:out value="$` + r`{param.name}
"/></p>

// OUTPUT:
// ?name=<script>... runs in the first line, appears as text in the second`]]
    ),
    'mvc-jstl': x(
        ['<b>JSTL</b> (Jakarta Standard Tag Library) is a set of tags for JSP that replace scriptlets: <code>c:if</code>, <code>c:forEach</code>, <code>c:out</code>, <code>fmt:formatDate</code>.',
            '<b>Declare it</b> at the top of the page with a taglib directive, usually with the prefix <code>c</code> for the core library.',
            '<b>Why</b>: logic like loops and conditions stays readable and free of Java code in the page.'],
        ['<b>Core tags</b>: <code>c:out</code> (escapes output), <code>c:if</code>, <code>c:choose</code>, <code>c:forEach</code>, <code>c:url</code>, <code>c:set</code>.',
            '<b>Other libraries</b>: <code>fmt</code> for numbers, dates and messages; <code>fn</code> for string functions.',
            '<b>Dependency</b>: add the Jakarta JSTL API and implementation; the URI for Jakarta EE 10 is <code>jakarta.tags.core</code>.'],
        ['<b>Escaping</b>: <code>c:out</code> escapes XML characters by default, which protects against XSS.',
            '<b>Scopes</b>: tags read page, request, session and application attributes in that order of lookup.',
            '<b>JstlView</b>: with <code>InternalResourceViewResolver</code> and JstlView the JSTL locale and message bundles follow Spring.'],
        [['F', 'What is JSTL?', 'A tag library for JSP that provides loops, conditions, formatting and more without Java code.'],
            ['F', 'How do you include the core tags?', 'Add the taglib directive with prefix c and the URI jakarta.tags.core.'],
            ['M', 'Which tag prints a value safely?', 'c:out, because it escapes HTML special characters.'],
            ['M', 'How do you loop over a list in the model?', 'Use c:forEach with items pointing to the model attribute and var for the current element.'],
            ['S', 'Why use JstlView?', 'It sets JSTL locale and resource bundle from the Spring context, so fmt message tags work.'],
            ['S', 'Why did old JSTL URIs break after Spring 6?', 'Jakarta EE 9 and later renamed javax to jakarta, including the taglib URIs and APIs.']],
        [['Loop over a list.',
            r`<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<ul>
  <c:forEach var="u" items="$` + r`{users}
">
    <li><c:out value="$` + r`{u.name}
"/></li>
  </c:forEach>
</ul>

// OUTPUT:
// <ul><li>Abaji</li><li>Raoji</li></ul>`],
            ['Condition and empty check.',
                r`<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:choose>
  <c:when test="$` + r`{empty users}
">No users found</c:when>
  <c:otherwise>Total: <c:out value="$` + r`{users.size()}
"/></c:otherwise>
</c:choose>

// OUTPUT:
// Total: 2   (or "No users found" for an empty list)`]],
        [['Controller feeding the page, tested with MockMvc.',
            r`mvc.perform(get("/users"))
   .andExpect(view().name("users"))
   .andExpect(model().attribute("users", hasSize(2)));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Pitfall: old taglib URI.',
                r`<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

// OUTPUT:
// Works only with the old javax JSTL; with Spring 6 use uri="jakarta.tags.core"`]]
    ),
    'mvc-thymeleaf': x(
        ['<b>Thymeleaf</b> is a server-side template engine that writes logic as HTML attributes such as <code>th:text</code> and <code>th:each</code>, so templates open correctly in a browser.',
            '<b>In Spring MVC</b> the controller returns a name, <code>ThymeleafViewResolver</code> finds <code>templates/name.html</code> and renders it with the model.',
            '<b>Spring Boot</b> auto-configures it when <code>spring-boot-starter-thymeleaf</code> is on the classpath, with no extra setup.'],
        ['<b>Default location</b>: <code>src/main/resources/templates/</code> with the suffix <code>.html</code>.',
            '<b>Key attributes</b>: <code>th:text</code> (escaped), <code>th:utext</code> (not escaped), <code>th:each</code>, <code>th:if</code>, <code>th:href</code> with <code>@{...}</code> link expressions.',
            '<b>Expression types</b>: variable expressions (dollar sign and braces), selection, message (<code>#{...}</code>), link (<code>@{...}</code>) and fragment (<code>~{...}</code>).'],
        ['<b>Natural templates</b>: the static text inside a tag is a prototype shown when the file is opened directly, and replaced when rendered.',
            '<b>Escaping</b>: <code>th:text</code> escapes HTML by default; use <code>th:utext</code> only for trusted content.',
            '<b>Caching</b>: set <code>spring.thymeleaf.cache=false</code> in development to see changes without restart.'],
        [['F', 'What is Thymeleaf?', 'A server-side HTML template engine that uses th: attributes to bind model data.'],
            ['F', 'Where do templates live in Spring Boot?', 'In src/main/resources/templates and they use the .html suffix by default.'],
            ['M', 'Difference between th:text and th:utext?', 'th:text escapes HTML; th:utext writes the value unescaped and is unsafe for user data.'],
            ['M', 'What is a natural template?', 'A template that is valid HTML and shows sample content in a browser even without a server.'],
            ['S', 'Which beans make up the Spring integration?', 'SpringTemplateEngine, SpringResourceTemplateResolver and ThymeleafViewResolver.'],
            ['S', 'Why is Thymeleaf preferred over JSP in Boot?', 'It works in executable jars, is testable, and its templates are plain HTML.']],
        [['Controller and template.',
            r`@Controller
public class UserController {
    @GetMapping("/users")
    public String list(Model model) {
        model.addAttribute("users", List.of("Abaji", "Raoji"));
        return "users";               // templates/users.html
    }
}
// templates/users.html:
// <li th:each="u : $` + r`{users}
" th:text="$` + r`{u}
">sample</li>

// OUTPUT:
// <li>Abaji</li><li>Raoji</li>`],
            ['Starter and properties.',
                r`# build.gradle: implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
# application.properties
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html

# OUTPUT:
# templates are reloaded on every request (development setting)`]],
        [['Test the model and view.',
            r`mvc.perform(get("/users"))
   .andExpect(status().isOk())
   .andExpect(view().name("users"))
   .andExpect(model().attribute("users", hasSize(2)))
   .andExpect(content().string(containsString("Abaji")));

// OUTPUT:
// Tests run: 1, Failures: 0 (Thymeleaf renders for real in MockMvc)`],
            ['Pitfall: unescaped user text.',
                r`<p th:utext="$` + r`{comment}
">x</p>   <!-- unsafe -->
<p th:text="$` + r`{comment}
">x</p>    <!-- safe: HTML is escaped -->

// OUTPUT:
// comment=<b>hi</b>: first line shows bold text (XSS risk), second shows the tags as text`]]
    )
};

export const smvc09Deep: Record<string, Deep> = {
    'mvc-view-resolution': dv(
        [`<p>View resolution happens inside <code>DispatcherServlet.render</code>.</p><ul><li>The handler adapter returns a <code>ModelAndView</code> (or the name is converted into one).</li><li>If the view is a name, <code>resolveViewName</code> loops through the <code>viewResolvers</code> list.</li><li>The first non-null <code>View</code> is used, otherwise a <code>ServletException</code> is thrown.</li><li>The locale from the <code>LocaleResolver</code> is passed to the resolver.</li><li>Finally <code>view.render(model, request, response)</code> writes the output.</li></ul>`,
            r`// simplified from DispatcherServlet
protected View resolveViewName(String viewName, Map<String, Object> model,
        Locale locale, HttpServletRequest request) throws Exception {
    for (ViewResolver resolver : this.viewResolvers) {
        View view = resolver.resolveViewName(viewName, locale);
        if (view != null) return view;
    }
    return null;
}

// OUTPUT:
// null for all resolvers -> ServletException: Could not resolve view with name 'x'`],
        [`<p>Ways to name a view:</p><ul><li><b>String:</b> <code>return "home"</code>.</li><li><b>ModelAndView:</b> a name plus model in one object.</li><li><b>View instance:</b> skips resolution completely.</li><li><b>void:</b> name derived from the URL path.</li><li><b>Prefixes:</b> <code>redirect:</code> and <code>forward:</code>.</li><li><b>Bean name:</b> <code>BeanNameViewResolver</code> finds a View bean with that name.</li></ul>`,
            r`@Configuration
public class ViewConfig implements WebMvcConfigurer {
    @Bean("pdfReport")
    public View pdfReport() { return new PdfReportView(); }

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.beanName();                     // order 1: find View beans by name
        registry.jsp("/WEB-INF/views/", ".jsp"); // order 2: catch-all
    }
}

// OUTPUT:
// "pdfReport" -> PdfReportView bean; "home" -> /WEB-INF/views/home.jsp`],
        [`<p>Typical problems:</p><ul><li><b>Circular view path:</b> a controller mapped to <code>/home</code> returns <code>"home"</code> with no resolver prefix, so it forwards to itself.</li><li><b>Wrong order:</b> a catch-all resolver placed first hides others.</li><li><b>Missing template:</b> returns 404 or an error page.</li><li><b>@ResponseBody forgotten or added:</b> a name is printed as text, or a page is expected but text arrives.</li></ul>`,
            r`@Controller
public class LoopController {
    @GetMapping("/home")
    public String home() {
        return "home";    // with no prefix/suffix this forwards to /home again
    }
}

// OUTPUT:
// ServletException: Circular view path [home]: would dispatch back to the current handler URL
// Fix: configure prefix and suffix, or return a different view name`],
        [`<p>Performance notes:</p><ul><li>Resolvers cache created views by name and locale (cache limit 1024 by default).</li><li>Keep the number of resolvers small; each one is asked in turn.</li><li>Put cheap, specific resolvers first and the catch-all last.</li><li>Disable caching only in development.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.mvc.contentnegotiation.favor-parameter=false

# OUTPUT:
# production: views and templates cached;
development: set cache=false`],
        [`<p>Scenario: an admin portal serves HTML pages, a PDF report and JSON from the same controller methods. A <code>ContentNegotiatingViewResolver</code> chooses the PDF view for <code>.pdf</code> requests and the HTML template otherwise, while REST endpoints use <code>@ResponseBody</code> and bypass views entirely.</p><ul><li>Pages: Thymeleaf resolver.</li><li>Reports: bean-name resolver.</li><li>API: message converters.</li></ul>`,
            r`@GetMapping("/reports/{id}")
public String report(@PathVariable long id, Model model) {
    model.addAttribute("report", service.load(id));
    return "report";     // html template, or a PDF view when Accept is application/pdf
}

// OUTPUT:
// GET /reports/3 (Accept: text/html) -> HTML page
// GET /reports/3 (Accept: application/pdf) -> PDF download`]
    ),
    'mvc-viewresolver-modelview': dv(
        [`<p>The contract is small.</p><ul><li><code>ViewResolver.resolveViewName(String, Locale)</code> returns a <code>View</code> or null.</li><li><code>View.render(Map model, request, response)</code> writes the response.</li><li><code>AbstractCachingViewResolver</code> keeps a cache keyed by name and locale and calls <code>loadView</code> only on a miss.</li><li><code>UrlBasedViewResolver</code> adds the prefix and suffix and handles <code>redirect:</code> and <code>forward:</code>.</li></ul>`,
            r`public interface ViewResolver {
    View resolveViewName(String viewName, Locale locale) throws Exception;
}

public interface View {
    default String getContentType() { return null; }
    void render(Map<String, ?> model, HttpServletRequest request,
                HttpServletResponse response) throws Exception;
}

// OUTPUT:
// DispatcherServlet calls resolveViewName then render; model entries become request attributes`],
        [`<p>Common ModelAndView forms:</p><ul><li><code>new ModelAndView("name")</code>.</li><li><code>new ModelAndView("name", "key", value)</code> for one attribute.</li><li><code>new ModelAndView("name", map)</code> for many.</li><li><code>new ModelAndView(view)</code> for a ready View.</li><li><code>setStatus</code> to change the HTTP status.</li></ul>`,
            r`ModelAndView a = new ModelAndView("user/detail", "user", user);
ModelAndView b = new ModelAndView("user/list", Map.of("users", users));
ModelAndView c = new ModelAndView(new RedirectView("/users"));
ModelAndView d = new ModelAndView("error/404", HttpStatus.NOT_FOUND);
System.out.println(a.getViewName() + " " + c.getView().getClass().getSimpleName());

// OUTPUT:
// user/detail RedirectView`],
        [`<p>Mistakes:</p><ul><li><b>Returning null from a custom resolver for everything:</b> no view is ever found.</li><li><b>Returning a View for every name:</b> hides the resolvers after it.</li><li><b>Forgetting Ordered:</b> custom resolver runs last, after the catch-all.</li><li><b>Mutating a cached View:</b> views are shared between requests and must be thread-safe.</li></ul>`,
            r`// WRONG: stateful view shared between requests
public class BadView extends AbstractView {
    private Map<String, ?> last;                       // race condition
    protected void renderMergedOutputModel(Map<String, Object> m,
            HttpServletRequest rq, HttpServletResponse rs) { last = m; }
}

// OUTPUT:
// Two parallel requests overwrite last (fix: keep state in local variables)`],
        [`<p>Tuning:</p><ul><li>Leave caching on; it avoids creating views per request.</li><li>Raise <code>setCacheLimit</code> only if many distinct names exist.</li><li>Use <code>setCache(false)</code> only for dynamic names such as per-tenant views.</li></ul>`,
            r`@Bean
public InternalResourceViewResolver jspResolver() {
    InternalResourceViewResolver vr = new InternalResourceViewResolver("/WEB-INF/v/", ".jsp");
    vr.setCacheLimit(2048);       // default 1024
    vr.setOrder(Ordered.LOWEST_PRECEDENCE);
    return vr;
}

// OUTPUT:
// up to 2048 name/locale views are cached`],
        [`<p>Scenario: a multi-tenant portal shows the tenant theme by view name <code>tenantA/home</code>. A custom resolver maps the first path segment to a template directory and falls back to <code>default/home</code> when the tenant has no override.</p>`,
            r`@Component
public class TenantViewResolver implements ViewResolver, Ordered {
    private final ViewResolver delegate;
    public TenantViewResolver(ViewResolver delegate) { this.delegate = delegate; }
    public View resolveViewName(String name, Locale l) throws Exception {
        View v = delegate.resolveViewName("tenant/" + TenantContext.id() + "/" + name, l);
        return v != null ? v : delegate.resolveViewName("default/" + name, l);
    }
    public int getOrder() { return 0; }
}

// OUTPUT:
// tenant acme "home" -> tenant/acme/home if present, else default/home`]
    ),
    'mvc-internalresourceviewresolver': dv(
        [`<p>How it works:</p><ul><li>It extends <code>UrlBasedViewResolver</code>; <code>buildView</code> sets the URL as prefix + name + suffix.</li><li>The created view is <code>InternalResourceView</code>, or <code>JstlView</code> when JSTL is present.</li><li>On render the view copies model entries to request attributes and calls <code>RequestDispatcher.forward</code>.</li><li>If the page was already included, it uses <code>include</code> instead.</li></ul>`,
            r`// simplified InternalResourceView.renderMergedOutputModel
exposeModelAsRequestAttributes(model, request);
String dispatcherPath = prepareForRendering(request, response);
RequestDispatcher rd = request.getRequestDispatcher(dispatcherPath);
if (useInclude(request, response)) rd.include(request, response);
else rd.forward(request, response);

// OUTPUT:
// model key "msg" -> request.getAttribute("msg") inside the JSP`],
        [`<p>Options:</p><ul><li><code>setPrefix</code>, <code>setSuffix</code>.</li><li><code>setViewClass</code> (<code>JstlView</code>).</li><li><code>setExposeContextBeansAsAttributes</code> to read beans from EL.</li><li><code>setAlwaysInclude</code> to use include.</li><li><code>setRequestContextAttribute</code> to expose a RequestContext.</li><li>The registry shortcut <code>registry.jsp(prefix, suffix)</code>.</li></ul>`,
            r`InternalResourceViewResolver vr = new InternalResourceViewResolver();
vr.setPrefix("/WEB-INF/views/");
vr.setSuffix(".jsp");
vr.setViewClass(JstlView.class);
vr.setRequestContextAttribute("rc");     // JSP can use rc.getMessage
vr.setOrder(Integer.MAX_VALUE);          // last in the chain

// OUTPUT:
// /WEB-INF/views/home.jsp with request attribute rc available`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Prefix without a trailing slash:</b> add the slash.</li><li><b>Blank suffix and a name with an extension:</b> be consistent.</li><li><b>Resolver placed before others:</b> set the lowest priority.</li><li><b>Boot executable jar:</b> JSP not found; use war or Thymeleaf.</li><li><b>Missing jasper:</b> the JSP is downloaded as text or gives 404.</li></ul>`,
            r`# WRONG in a Boot jar: JSP files in src/main/resources/META-INF/resources/WEB-INF
# RIGHT: war packaging and src/main/webapp/WEB-INF/views

# OUTPUT:
# jar: 404 for every JSP;
war on external or embedded Tomcat: pages render`],
        [`<p>Tuning notes:</p><ul><li>JSP compile cost occurs once per page; precompile (JspC) for production wars.</li><li>Disable <code>development</code> mode for Jasper so it does not poll for changes.</li><li>Keep pages small and move logic into the controller.</li></ul>`,
            r`# application.properties (embedded Tomcat with Jasper)
server.servlet.jsp.init-parameters.development=false
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp

# OUTPUT:
# Jasper no longer checks timestamps on each request`],
        [`<p>Scenario: a legacy WAR with 200 JSPs migrates to Spring MVC. The team keeps all pages under <code>/WEB-INF/views</code>, configures a single <code>InternalResourceViewResolver</code> and moves scriptlet logic into controllers one page at a time, and later adds a Thymeleaf resolver with a lower order for new pages.</p>`,
            r`@Override
public void configureViewResolvers(ViewResolverRegistry registry) {
    registry.viewResolver(thymeleafViewResolver);   // new pages: order 1
    registry.jsp("/WEB-INF/views/", ".jsp");        // legacy pages: last
}

// OUTPUT:
// "new/dashboard" -> templates/new/dashboard.html (if found); others fall to the JSP resolver`]
    ),
    'mvc-redirect': dv(
        [`<p>Internally:</p><ul><li><code>RedirectView.renderMergedOutputModel</code> builds the target URL, adds the context path and query parameters.</li><li>It then calls <code>sendRedirect</code>, which sets the status and Location header.</li><li>With <code>RedirectAttributes</code>, flash attributes are saved by <code>FlashMapManager</code> (in the session) and picked up by the next request that matches the target URL.</li><li>Flash maps expire after a short time.</li></ul>`,
            r`// HTTP exchange
// POST /users            -> 302 Found
//                           Location: /users
// GET  /users            -> 200 OK (FlashMap msg=Saved is moved to the model)

// OUTPUT:
// the flash attribute is read once and then removed`],
        [`<p>Variants:</p><ul><li><code>redirect:/path</code> (302).</li><li><code>RedirectView</code> with <code>setStatusCode</code> (301, 303, 307, 308).</li><li><code>ResponseEntity.status(...).location(uri).build()</code>.</li><li><code>HttpServletResponse.sendRedirect</code>.</li><li>Use <code>UriComponentsBuilder</code> to build safe URLs.</li><li><code>redirect:/users/{id}</code> expands path variables from the model.</li></ul>`,
            r`@PostMapping("/users")
public ResponseEntity<Void> create(@RequestBody UserForm f) {
    User u = service.save(f);
    URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(u.getId()).toUri();
    return ResponseEntity.created(uri).build();      // 201 + Location
}

// OUTPUT:
// 201 Created
// Location: http://localhost:8080/users/17`],
        [`<p>Mistakes:</p><ul><li><b>Model data after redirect:</b> use flash attributes.</li><li><b>Using redirect for an API:</b> clients may not follow it; return 201 with Location.</li><li><b>Open redirect:</b> check the target against an allow list.</li><li><b>Redirect loop:</b> redirecting to a URL that redirects back.</li><li><b>Relative URL surprises:</b> start with a slash.</li></ul>`,
            r`@GetMapping("/go")
public String go(@RequestParam String next) {
    // WRONG: return "redirect:" + next;       // open redirect
    if (!next.startsWith("/") || next.startsWith("//")) return "redirect:/";
    return "redirect:" + next;
}

// OUTPUT:
// next=https://evil.example -> redirect:/ ; next=/orders -> redirect:/orders`],
        [`<p>Costs and tuning:</p><ul><li>A redirect adds one round trip, so use forward for purely internal routing.</li><li>301 and 308 are cached by browsers; 302 and 303 are not.</li><li>Flash attributes use the session, which affects clustered setups (use sticky sessions or shared sessions).</li></ul>`,
            r`# application.properties
spring.mvc.ignore-default-model-on-redirect=true

# OUTPUT:
# redirect URLs no longer carry model attributes as query parameters`],
        [`<p>Scenario: a checkout form posts an order. The controller saves it, then redirects to the order confirmation page with a flash message, so a browser refresh shows the confirmation again instead of creating a duplicate order.</p>`,
            r`@PostMapping("/checkout")
public String checkout(@Valid CheckoutForm form, BindingResult br, RedirectAttributes ra) {
    if (br.hasErrors()) return "checkout";          // redisplay, no redirect
    Order o = orders.place(form);
    ra.addFlashAttribute("msg", "Order placed");
    return "redirect:/orders/" + o.getId();
}

// OUTPUT:
// POST /checkout -> 302 /orders/42 -> GET /orders/42 -> page shows "Order placed"`]
    ),
    'mvc-forward': dv(
        [`<p>How a forward works:</p><ul><li><code>RequestDispatcher.forward</code> resets the response buffer and dispatches inside the container.</li><li>The request path attributes (<code>jakarta.servlet.forward.request_uri</code> and others) keep the original URL.</li><li>Filters registered for <code>DispatcherType.FORWARD</code> run; others skip it.</li><li>Spring handles <code>forward:</code> by creating an <code>InternalResourceView</code>.</li></ul>`,
            r`@GetMapping("/target")
@ResponseBody
public String target(HttpServletRequest req) {
    return req.getRequestURI() + " | original="
        + req.getAttribute("jakarta.servlet.forward.request_uri");
}

// OUTPUT:
// GET /start (forward:/target) -> "/target | original=/start"`],
        [`<p>Options:</p><ul><li><code>return "forward:/path"</code>.</li><li><code>request.getRequestDispatcher(path).forward</code>.</li><li><code>include</code> merges the output of another resource.</li><li>The <code>ViewControllerRegistry.addViewController("/x").setViewName("forward:/y")</code> shortcut.</li><li><code>@RequestAttribute</code> reads the data set before forwarding.</li></ul>`,
            r`@Override
public void addViewControllers(ViewControllerRegistry registry) {
    registry.addViewController("/").setViewName("forward:/home");
}

// OUTPUT:
// GET / -> handled by /home, URL remains /`],
        [`<p>Mistakes:</p><ul><li><b>Forward after POST:</b> refresh repeats it; use redirect.</li><li><b>Forward loop:</b> check the target mapping.</li><li><b>Forward after writing output:</b> response is committed.</li><li><b>Assuming a new request:</b> request-scoped data is shared.</li><li><b>Forward to a path blocked by security:</b> the filter may apply again.</li></ul>`,
            r`@PostMapping("/pay")
public String pay(PayForm f) {
    service.pay(f);
    return "forward:/receipt";      // WRONG: refresh pays twice
    // RIGHT: return "redirect:/receipt";
}

// OUTPUT:
// Refreshing the receipt page asks to resubmit the form data (double payment risk)`],
        [`<p>Tuning: a forward is cheaper than a redirect because there is no extra browser round trip, and the request object, parameters and body are reused. Use it for internal routing and error handling, and keep chains short because each forward re-enters the filter and handler pipeline.</p>`,
            r`@Bean
public FilterRegistrationBean<AuditFilter> audit() {
    FilterRegistrationBean<AuditFilter> b = new FilterRegistrationBean<>(new AuditFilter());
    b.setDispatcherTypes(EnumSet.of(DispatcherType.REQUEST));   // skip FORWARD
    return b;
}

// OUTPUT:
// the filter runs once per client request, not again on internal forwards`],
        [`<p>Scenario: the root URL <code>/</code> shows the home page without a redirect, so the address bar stays clean. A view controller forwards <code>/</code> to <code>/home</code>, and a custom error page forwards 404 requests to a friendly template.</p>`,
            r`@Controller
public class ErrorPages {
    @GetMapping("/missing")
    public String missing() { return "forward:/error/404"; }

    @GetMapping("/error/404")
    public String notFound() { return "errors/404"; }
}

// OUTPUT:
// GET /missing -> 200 with templates/errors/404.html, URL remains /missing`]
    ),
    'mvc-redirect-modelview': dv(
        [`<p>Under the hood:</p><ul><li><code>UrlBasedViewResolver.createView</code> checks <code>viewName.startsWith("redirect:")</code>.</li><li>It strips the prefix and builds a <code>RedirectView</code> with <code>contextRelative=true</code> and <code>http10Compatible</code> set from the resolver.</li><li>The RedirectView expands URI template variables from the model, appends remaining simple attributes as query parameters, then encodes and sends the redirect.</li></ul>`,
            r`// simplified UrlBasedViewResolver.createView
if (viewName.startsWith(REDIRECT_URL_PREFIX)) {
    String redirectUrl = viewName.substring(REDIRECT_URL_PREFIX.length());
    RedirectView view = new RedirectView(redirectUrl, isRedirectContextRelative(),
            isRedirectHttp10Compatible());
    return applyLifecycleMethods(REDIRECT_URL_PREFIX, view);
}

// OUTPUT:
// "redirect:/users" -> RedirectView(url=/users)`],
        [`<p>Syntax variants:</p><ul><li><code>redirect:/abs</code> context relative.</li><li><code>redirect:rel</code> relative to the current URL.</li><li><code>redirect:http://host/x</code> absolute.</li><li><code>redirect:/users/{id}</code> template variable filled from the model.</li><li><code>redirect:/list?x=1</code> with a manual query string.</li></ul>`,
            r`ModelAndView mav = new ModelAndView("redirect:/users/{id}");
mav.addObject("id", 7);          // used in the path, not repeated in the query
mav.addObject("tab", "orders");  // appended as query parameter
return mav;

// OUTPUT:
// 302 Location: /users/7?tab=orders`],
        [`<p>Mistakes:</p><ul><li><b>Relative path without slash:</b> resolves against the current URL.</li><li><b>Large model:</b> non-simple objects are skipped, but strings can make URLs very long.</li><li><b>Forgetting the status:</b> redirect: always gives 302.</li><li><b>User data in the query:</b> sensitive values appear in logs and history.</li></ul>`,
            r`ModelAndView mav = new ModelAndView("redirect:/done");
mav.addObject("token", user.getToken());     // WRONG: token appears in the URL
return mav;

// OUTPUT:
// 302 Location: /done?token=abc123 (fix: use flash attributes or session)`],
        [`<p>Tuning: avoid query strings from large models; set <code>ignoreDefaultModelOnRedirect</code>; use 303 for POST responses and 301 or 308 only for permanent moves, because browsers cache them.</p>`,
            r`RedirectView rv = new RedirectView("/orders", true);
rv.setStatusCode(HttpStatus.SEE_OTHER);      // 303 after POST
rv.setExposeModelAttributes(false);
return new ModelAndView(rv);

// OUTPUT:
// 303 See Other, Location: /shop/orders (no query string)`],
        [`<p>Scenario: a legacy URL scheme moves from <code>/items?id=5</code> to <code>/products/5</code>. A controller keeps the old URL working with a permanent redirect so search engines update their links.</p>`,
            r`@GetMapping("/items")
public ModelAndView legacy(@RequestParam long id) {
    RedirectView rv = new RedirectView("/products/" + id, true);
    rv.setStatusCode(HttpStatus.MOVED_PERMANENTLY);
    rv.setExposeModelAttributes(false);
    return new ModelAndView(rv);
}

// OUTPUT:
// GET /items?id=5 -> 301 Location: /products/5`]
    ),
    'mvc-forward-modelview': dv(
        [`<p>Under the hood:</p><ul><li><code>UrlBasedViewResolver.createView</code> checks <code>viewName.startsWith("forward:")</code>.</li><li>It strips the prefix and builds an <code>InternalResourceView</code> for the remaining URL.</li><li>When rendered, the model is exposed as request attributes and <code>forward</code> is called.</li><li>The prefix and suffix of the resolver are not applied to a forward: name.</li></ul>`,
            r`// simplified UrlBasedViewResolver.createView
if (viewName.startsWith(FORWARD_URL_PREFIX)) {
    String forwardUrl = viewName.substring(FORWARD_URL_PREFIX.length());
    InternalResourceView view = new InternalResourceView(forwardUrl);
    return applyLifecycleMethods(FORWARD_URL_PREFIX, view);
}

// OUTPUT:
// "forward:/home" -> InternalResourceView(url=/home)`],
        [`<p>Variants:</p><ul><li><code>forward:/path</code> to a controller or resource.</li><li><code>forward:/WEB-INF/views/x.jsp</code> straight to a JSP.</li><li>Use a <code>ModelAndView</code> to pass data as request attributes.</li><li>Use <code>RedirectView</code> instead for an outside URL.</li></ul>`,
            r`@GetMapping("/a")
public ModelAndView a() {
    ModelAndView mav = new ModelAndView("forward:/b");
    mav.addObject("from", "a");
    return mav;
}

@GetMapping("/b")
@ResponseBody
public String b(@RequestAttribute String from) { return "from " + from; }

// OUTPUT:
// GET /a -> "from a"`],
        [`<p>Mistakes:</p><ul><li><b>Expecting prefix and suffix:</b> they are skipped.</li><li><b>Expecting a new request:</b> POST body and method stay the same, so the target must accept that method.</li><li><b>Forward loops.</b></li><li><b>Using forward: to external URLs:</b> not possible.</li></ul>`,
            r`@PostMapping("/submit")
public String submit() { return "forward:/status"; }

@GetMapping("/status")          // WRONG: the forwarded request is still a POST
@ResponseBody
public String status() { return "ok"; }

// OUTPUT:
// 405 Method Not Allowed (fix: map /status for POST or use redirect)`],
        [`<p>Tuning: forwards avoid network round trips, but each one passes through the dispatcher pipeline again. Keep the chain to one hop, and avoid forwarding large uploaded request bodies repeatedly.</p>`,
            r`mvc.perform(post("/submit"))
   .andExpect(forwardedUrl("/status"));

// OUTPUT:
// Tests run: 1, Failures: 0 (verifies the forward without executing the target)`],
        [`<p>Scenario: a front controller inspects the request and forwards to a handler by device type, for example <code>forward:/m/home</code> for mobile clients, keeping one public URL.</p>`,
            r`@GetMapping("/home")
public String home(@RequestHeader("User-Agent") String ua) {
    return ua.contains("Mobile") ? "forward:/m/home" : "forward:/d/home";
}

// OUTPUT:
// GET /home (mobile browser) -> served by /m/home, address bar shows /home`]
    ),
    'mvc-jsp': dv(
        [`<p>Lifecycle of a JSP:</p><ul><li>Jasper translates <code>greet.jsp</code> to a servlet class (<code>greet_jsp.java</code>) and compiles it.</li><li>The container loads the servlet and calls <code>_jspService</code> per request.</li><li>Spring forwards to the JSP, so request attributes hold the model.</li><li>Template text is written with <code>out.write</code> and EL is evaluated by the EL resolver.</li></ul>`,
            r`<%-- greet.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
  <h1>Hello, <c:out value="$` + r`{name}
"/></h1>
</body></html>

// OUTPUT:
// generated servlet: greet_jsp._jspService(request, response) writes the HTML`],
        [`<p>Features:</p><ul><li><b>Directives:</b> <code>page</code>, <code>include</code>, <code>taglib</code>.</li><li><b>EL:</b> expressions for model data.</li><li><b>Standard actions:</b> <code>jsp:include</code>.</li><li><b>Tag files and custom tags</b> for reuse.</li><li><b>Spring tags:</b> <code>spring:message</code>, <code>spring:url</code>, form tags.</li></ul>`,
            r`<%@ taglib prefix="form" uri="jakarta.tags.form" %>
<%@ taglib prefix="spring" uri="jakarta.tags.spring" %>
<form:form modelAttribute="user" method="post">
  <spring:message code="user.name"/>
  <form:input path="name"/> <form:errors path="name"/>
  <button>Save</button>
</form:form>

// OUTPUT:
// <form method="post"> ... <input name="name" value="..."/> ... error message if invalid`],
        [`<p>Mistakes:</p><ul><li><b>Scriptlets:</b> use EL and JSTL instead.</li><li><b>Unescaped output:</b> XSS risk.</li><li><b>JSP in a Boot jar:</b> not served.</li><li><b>Missing taglib directive:</b> tags print as text.</li><li><b>Database access from a JSP:</b> belongs in the service layer.</li></ul>`,
            r`<%-- WRONG: logic in the page --%>
<% List<User> us = new UserDao().findAll();
%>
<%-- RIGHT: controller adds users to the model, page only displays --%>

// OUTPUT:
// untestable page with SQL access; fix by moving logic to controller and service`],
        [`<p>Tuning:</p><ul><li>Precompile JSPs at build time (JspC) to avoid first-request delay.</li><li>Turn off development mode in production.</li><li>Use <code>&lt;%@ page session="false" %&gt;</code> when the page needs no session.</li><li>Avoid huge pages; split with <code>jsp:include</code>.</li></ul>`,
            r`<%@ page session="false" trimDirectiveWhitespaces="true" %>

// OUTPUT:
// no HttpSession is created just for rendering, and blank lines from directives are removed`],
        [`<p>Scenario: an intranet app has existing JSP pages. Controllers prepare data, JSPs show it with JSTL, a shared header uses <code>jsp:include</code>, and the war is deployed to Tomcat. New features use Thymeleaf so the team can leave JSP gradually.</p>`,
            r`@Controller
@RequestMapping("/employees")
public class EmployeeController {
    @GetMapping
    public String list(Model model) {
        model.addAttribute("employees", service.findAll());
        return "employees/list";    // /WEB-INF/views/employees/list.jsp
    }
}

// OUTPUT:
// GET /employees -> list.jsp renders a table with one row per employee`]
    ),
    'mvc-jstl': dv(
        [`<p>How JSTL works:</p><ul><li>The taglib directive maps a prefix to a TLD (tag library descriptor) inside the JSTL jar.</li><li>Jasper turns each tag into calls on a tag handler class (for example <code>ForEachTag</code>).</li><li>Tag attributes use EL, evaluated against page, request, session and application scopes.</li><li><code>c:out</code> calls an escape routine, so characters such as <code>&lt;</code> become <code>&amp;lt;</code>.</li></ul>`,
            r`<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="title" value="a < b" scope="request"/>
<p><c:out value="$` + r`{title}
"/></p>

// OUTPUT:
// <p>a &lt; b</p>`],
        [`<p>Libraries and URIs (Jakarta EE 10):</p><ul><li><b>core:</b> <code>jakarta.tags.core</code>, prefix c.</li><li><b>fmt:</b> <code>jakarta.tags.fmt</code>, numbers, dates, messages.</li><li><b>fn:</b> <code>jakarta.tags.functions</code>, string and collection functions.</li><li><b>sql and xml:</b> exist but are discouraged.</li></ul>`,
            r`<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<fmt:formatNumber value="$` + r`{price}
" type="currency" currencyCode="INR"/>
<c:out value="$` + r`{fn:toUpperCase(name)}
"/>
<c:url value="/orders" var="ordersUrl"/>

// OUTPUT:
// price=1999.5 name=abaji -> "₹1,999.50 ABAJI", ordersUrl=/shop/orders`],
        [`<p>Mistakes:</p><ul><li><b>Old URI:</b> <code>http://java.sun.com/...</code> with Jakarta servlets.</li><li><b>Mixing javax and jakarta JSTL jars:</b> tags fail to load.</li><li><b>Raw EL output:</b> no escaping.</li><li><b>Missing JSTL jar:</b> <code>The absolute uri cannot be resolved</code>.</li><li><b>Using c:forEach on a null:</b> prints nothing; check with <code>empty</code>.</li></ul>`,
            r`<%-- error when the JSTL jar is missing --%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

// OUTPUT:
// org.apache.jasper.JasperException: The absolute uri: [jakarta.tags.core] cannot be resolved
// Fix: add org.glassfish.web:jakarta.servlet.jsp.jstl and jakarta.servlet.jsp.jstl-api`],
        [`<p>Tuning:</p><ul><li>Use <code>varStatus</code> instead of manual counters.</li><li>Use <code>begin</code>, <code>end</code> and <code>step</code> for paging instead of looping all items.</li><li>Do not call methods with side effects from EL.</li><li>Prepare data in the controller; keep loops short.</li></ul>`,
            r`<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:forEach var="u" items="$` + r`{users}
" begin="0" end="9" varStatus="s">
  <tr class="$` + r`{s.index % 2 == 0 ? 'even' : 'odd'}
"><td><c:out value="$` + r`{u.name}
"/></td></tr>
</c:forEach>

// OUTPUT:
// first ten rows with alternating row classes`],
        [`<p>Scenario: an order list page shows rows with a currency format, an empty-state message and a link per row built with <code>c:url</code>, so the context path is always correct.</p>`,
            r`<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<c:forEach var="o" items="$` + r`{orders}
">
  <a href="<c:url value='/orders/$` + r`{o.id}
'/>">#<c:out value="$` + r`{o.id}
"/></a>
  <fmt:formatNumber value="$` + r`{o.total}
" type="currency"/>
</c:forEach>

// OUTPUT:
// #17 $120.00 (link /shop/orders/17)`]
    ),
    'mvc-thymeleaf': dv(
        [`<p>How the integration works:</p><ul><li><code>ThymeleafAutoConfiguration</code> creates <code>SpringResourceTemplateResolver</code>, <code>SpringTemplateEngine</code> and <code>ThymeleafViewResolver</code>.</li><li>The resolver returns a <code>ThymeleafView</code> for a name (it must be before the default resolver in order).</li><li>On render, the model plus request data become a Thymeleaf <code>Context</code>.</li><li>The engine parses the template, runs attribute processors in order and writes the result.</li><li>Spring expressions (SpEL) are used for variable expressions.</li></ul>`,
            r`// what Boot auto-configures (simplified)
SpringResourceTemplateResolver tr = new SpringResourceTemplateResolver();
tr.setPrefix("classpath:/templates/");
tr.setSuffix(".html");
tr.setTemplateMode(TemplateMode.HTML);
SpringTemplateEngine engine = new SpringTemplateEngine();
engine.setTemplateResolver(tr);
ThymeleafViewResolver vr = new ThymeleafViewResolver();
vr.setTemplateEngine(engine);

// OUTPUT:
// "users" -> classpath:/templates/users.html rendered with the model`],
        [`<p>Common syntax:</p><ul><li><code>th:text</code>, <code>th:utext</code>, <code>th:value</code>, <code>th:href</code>.</li><li><code>th:each</code>, <code>th:if</code>, <code>th:unless</code>, <code>th:switch</code>.</li><li><code>th:object</code> and <code>th:field</code> for forms.</li><li><code>th:fragment</code> and <code>th:replace</code> for layouts.</li><li>Message expressions read <code>messages.properties</code>.</li></ul>`,
            r`<h1 th:text="#{app.title}">Title</h1>
<a th:href="@{/users}">All users</a>
<form th:action="@{/users}" th:object="$` + r`{userForm}
" method="post">
  <input th:field="*{name}"/>
  <span th:if="$` + r`{#fields.hasErrors('name')}
" th:errors="*{name}
">error</span>
</form>

// OUTPUT:
// <h1>User Manager</h1> <a href="/shop/users">All users</a> <form action="/shop/users" ...>`],
        [`<p>Mistakes:</p><ul><li><b>Template not found:</b> wrong folder or name (error <code>TemplateInputException</code>).</li><li><b>Missing @Controller:</b> using <code>@RestController</code> returns the name as text.</li><li><b>th:utext with user input.</b></li><li><b>Null property access:</b> use <code>?.</code> safe navigation.</li><li><b>Case-sensitive file names</b> on Linux servers.</li></ul>`,
            r`@RestController            // WRONG for pages
public class PageController {
    @GetMapping("/page")
    public String page() { return "page"; }
}

// OUTPUT:
// the browser shows the word "page" (fix: use @Controller)`],
        [`<p>Tuning:</p><ul><li>Keep template caching on in production.</li><li>Use fragments to reuse markup instead of repeating it.</li><li>Avoid heavy logic and database calls in expressions.</li><li>Use <code>spring.thymeleaf.cache=false</code> only for development.</li><li>Enable HTTP caching for static assets, not for rendered pages with user data.</li></ul>`,
            r`# application-dev.properties
spring.thymeleaf.cache=false
spring.web.resources.cache.period=0

# application-prod.properties
spring.thymeleaf.cache=true
spring.web.resources.cache.period=86400

# OUTPUT:
# dev: changes visible on browser refresh;
prod: parsed templates are reused`],
        [`<p>Scenario: a company site renders product pages on the server for search engines. Controllers add a product to the model, the template shows it, and a shared layout fragment supplies header and footer. Security expressions and form binding work through the same engine.</p>`,
            r`@Controller
public class ProductController {
    @GetMapping("/products/{id}")
    public String show(@PathVariable long id, Model model) {
        model.addAttribute("product", service.get(id));
        return "products/show";
    }
}
// templates/products/show.html:
// <h2 th:text="$` + r`{product.name}
">Name</h2>
// <p th:text="$` + r`{#numbers.formatDecimal(product.price, 1, 2)}
">0.00</p>

// OUTPUT:
// <h2>Notebook</h2><p>49.50</p>`]
    )
};
