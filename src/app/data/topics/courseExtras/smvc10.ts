// Spring extras, batch smvc10 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc10Extras: Record<string, Extra> = {
    'mvc-freemarker': x(
        ['<b>FreeMarker</b> is a server-side template engine: you write a <code>.ftlh</code> file with placeholders and directives, and Spring MVC merges it with the model into HTML.',
            '<b>Setup</b>: add <code>spring-boot-starter-freemarker</code>; templates live in <code>src/main/resources/templates</code> and the controller returns the view name without the suffix.',
            '<b>Directives</b> start with <code>&lt;#</code>, for example <code>&lt;#list items as i&gt;</code>, <code>&lt;#if&gt;</code> and <code>&lt;#include&gt;</code>; user macros use <code>&lt;@name/&gt;</code>.'],
        ['<b>Auto-escaping</b>: the <code>.ftlh</code> extension turns on HTML escaping for interpolations, so user text is safe by default; the older <code>.ftl</code> does not escape.',
            '<b>Beans</b>: Boot configures <code>FreeMarkerConfigurer</code> (loads templates) and <code>FreeMarkerViewResolver</code> (maps view names to templates); both can be tuned with <code>spring.freemarker.*</code>.',
            '<b>Null handling</b>: a missing value fails the render unless you write a default, as in <code>name!&quot;guest&quot;</code>, or test with <code>name??</code>.'],
        ['<b>Caching</b>: FreeMarker caches parsed templates; in production keep <code>spring.freemarker.cache=true</code> and turn it off only in development.',
            '<b>Security</b>: never use <code>?no_esc</code> on user data and avoid exposing the whole <code>Configuration</code> to templates, because template authors could then reach internals.',
            '<b>Choosing</b>: FreeMarker has richer logic (macros, functions, built-ins) than Mustache, but Thymeleaf keeps templates valid HTML, which is why it is the Boot default choice.'],
        [['F', 'What is FreeMarker?', 'A Java template engine that generates text such as HTML from templates and a data model.'],
            ['F', 'Which file extension does Boot use by default?', 'Boot 3 uses <code>.ftlh</code>, which enables HTML auto-escaping.'],
            ['M', 'Which Spring beans make FreeMarker work in MVC?', '<code>FreeMarkerConfigurer</code> locates and loads templates and <code>FreeMarkerViewResolver</code> turns view names into <code>FreeMarkerView</code> objects.'],
            ['M', 'How do you avoid an error for a null value?', 'Use the default operator <code>user.name!&quot;n/a&quot;</code> or check with <code>user.name??</code> first.'],
            ['S', 'What is the difference between .ftl and .ftlh?', '<code>.ftlh</code> selects the HTML output format with automatic escaping; <code>.ftl</code> is plain unescaped output.'],
            ['S', 'How do you test a FreeMarker view?', 'Use <code>@WebMvcTest</code> with MockMvc and assert <code>view().name()</code> and the rendered content, since the engine is auto-configured.']],
        [['Create the starter page: a controller that fills the model and a template that lists names.',
            r`@Controller
public class HelloController {
    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("names", List.of("Abaji", "Raoji"));
        return "hello";               // templates/hello.ftlh
    }
}
// templates/hello.ftlh
// <ul>
//   <#list names as n><li>` + r`$` + r`{n}
</li></#list>
// </ul>

// OUTPUT:
// GET /hello -> 200 OK
// <ul>
//   <li>Abaji</li><li>Raoji</li>
// </ul>`],
            ['Show a default when a value is missing.',
                r`// model has no "nick" attribute
// templates/profile.ftlh
// <p>Nick: ` + r`$` + r`{nick!"anonymous"}
</p>
// <#if nick??>has nick<#else>no nick</#if>

// OUTPUT:
// <p>Nick: anonymous</p>
// no nick`]],
        [['A reusable macro.',
            r`<#-- templates/macros.ftlh -->
<#macro badge text>
  <span class="badge">` + r`$` + r`{text}
</span>
</#macro>
<#-- templates/page.ftlh -->
<#import "macros.ftlh" as m>
<@m.badge text="New"/>

<!-- OUTPUT -->
// <span class="badge">New</span>`],
            ['Escaping on .ftlh.',
                r`// model: comment = "<script>alert(1)</script>"
// templates/c.ftlh  ->  <p>` + r`$` + r`{comment}
</p>

// OUTPUT:
// <p>&lt;script&gt;alert(1)&lt;/script&gt;</p>`]]
    ),
    'mvc-mustache': x(
        ['<b>Mustache</b> is a logic-less template engine: templates contain only tags such as <code>{{name}}</code> and sections, no real code.',
            '<b>Setup</b>: add <code>spring-boot-starter-mustache</code>; templates go in <code>templates/</code> with the <code>.mustache</code> suffix and the controller returns the name without it.',
            '<b>Tags</b>: <code>{{name}}</code> prints an escaped value, <code>{{{html}}}</code> prints raw, <code>{{#list}}...{{/list}}</code> loops, and <code>{{^list}}...{{/list}}</code> shows when empty.'],
        ['<b>Escaping</b>: double braces escape HTML; triple braces do not, so use them only for trusted markup.',
            '<b>Context lookup</b>: inside a section the current item becomes the context, and Mustache falls back to the parent context when a name is not found.',
            '<b>Partials</b>: <code>{{&gt; header}}</code> includes <code>header.mustache</code>, which is the basis for layouts.'],
        ['<b>Logic-less by design</b>: conditions and formatting must be prepared in Java (view model or DTO), which keeps templates simple and testable.',
            '<b>Engine</b>: Boot uses JMustache; settings live under <code>spring.mustache.*</code>, for example <code>suffix</code> and <code>servlet.expose-request-attributes</code>.',
            '<b>Trade-off</b>: tiny and fast, and the same syntax works in JavaScript, but there are no expressions, so complex pages need more view-model code.'],
        [['F', 'What does logic-less mean?', 'The template has no if/else or expressions; it only substitutes values and repeats sections.'],
            ['F', 'How do you print a list?', 'Wrap the markup in <code>{{#items}}...{{/items}}</code> and print <code>{{name}}</code> inside.'],
            ['M', 'What is the difference between {{x}} and {{{x}}}?', 'Double braces HTML-escape the value; triple braces output it raw.'],
            ['M', 'How do you show a message for an empty list?', 'Use an inverted section <code>{{^items}}No items{{/items}}</code>.'],
            ['S', 'How do you do a conditional in Mustache?', 'Expose a boolean or a prepared object in the model and use a section; the decision is made in Java.'],
            ['S', 'How do you read request or session data?', 'Enable <code>spring.mustache.servlet.expose-request-attributes</code> or copy the values into the model.']],
        [['List users with Mustache.',
            r`@GetMapping("/users")
String users(Model model) {
    model.addAttribute("users", List.of(
        Map.of("name", "Abaji"), Map.of("name", "Raoji")));
    return "users";                       // templates/users.mustache
}
// users.mustache:
// <ul>{{#users}}<li>{{name}}</li>{{/users}}</ul>
// {{^users}}<p>No users</p>{{/users}}

// OUTPUT:
// <ul><li>Abaji</li><li>Raoji</li></ul>`],
            ['Raw versus escaped output.',
                r`// model: bio = "<b>Hi</b>"
// {{bio}}   -> escaped
// {{{bio}}} -> raw

// OUTPUT:
// &lt;b&gt;Hi&lt;/b&gt;
// <b>Hi</b>`]],
        [['Partials for a shared header.',
            r`// templates/header.mustache : <header>{{title}}</header>
// templates/home.mustache   : {{> header}}<main>Welcome</main>

// OUTPUT:
// <header>Home</header><main>Welcome</main>`],
            ['Prepare logic in Java.',
                r`record Row(String name, boolean admin) {}
// model "rows" = List.of(new Row("Abaji", true), new Row("Raoji", false))
// {{#rows}}{{name}}{{#admin}} (admin){{/admin}}
// {{/rows}}

// OUTPUT:
// Abaji (admin)
// Raoji`]]
    ),
    'mvc-html-templates': x(
        ['<b>HTML template</b>: an HTML file with placeholders that Spring MVC fills with model data on the server before sending the page to the browser.',
            '<b>Flow</b>: the controller returns a view name, the <code>ViewResolver</code> finds the template, and the engine renders it with the <code>Model</code>.',
            '<b>Engines</b>: Thymeleaf, FreeMarker, Mustache and JSP all plug into the same flow; only the template syntax differs.'],
        ['<b>Model data</b>: <code>Model</code>, <code>ModelMap</code> and <code>ModelAndView</code> carry attributes to the template; <code>@ModelAttribute</code> methods add shared data.',
            '<b>Natural templates</b>: Thymeleaf pages open correctly in a browser without a server because directives are attributes, such as <code>th:text</code>.',
            '<b>Location</b>: Boot reads templates from <code>classpath:/templates/</code>; the path is not served directly, only through a controller.'],
        ['<b>Escaping</b>: use the escaping output form (<code>th:text</code>) for user data; unescaped output (<code>th:utext</code>) is an XSS risk.',
            '<b>Caching</b>: set <code>spring.thymeleaf.cache=false</code> only in development; production keeps parsed templates in memory.',
            '<b>Separation</b>: pass small view objects to the template instead of entities, so lazy loading and sensitive fields never leak into rendering.'],
        [['F', 'Where do templates go in Boot?', 'In <code>src/main/resources/templates</code>.'],
            ['F', 'What does the controller return to render a template?', 'The view name as a String, for example <code>&quot;home&quot;</code>.'],
            ['M', 'Which component maps the view name to a template?', 'A <code>ViewResolver</code>, for Thymeleaf the <code>ThymeleafViewResolver</code>.'],
            ['M', 'Why can you not open /templates/home.html by URL?', 'Templates are not in the static folder, so only a controller can render them.'],
            ['S', 'th:text or th:utext?', '<code>th:text</code> escapes HTML; <code>th:utext</code> does not and should only show trusted content.'],
            ['S', 'How do you test the rendered HTML?', 'MockMvc with <code>andExpect(content().string(containsString(...)))</code> inside <code>@WebMvcTest</code>.']],
        [['Render a greeting with Thymeleaf.',
            r`@Controller
class HomeController {
    @GetMapping("/")
    String home(Model model) {
        model.addAttribute("name", "Abaji");
        return "home";
    }
}
// templates/home.html
// <h1 th:text="Hello, ` + r`$` + r`{name}
">Hello, placeholder</h1>

// OUTPUT:
// <h1>Hello, Abaji</h1>`],
            ['Iterate a list.',
                r`// <ul>
//   <li th:each="n : ` + r`$` + r`{names}
" th:text="` + r`$` + r`{n}
">x</li>
// </ul>

// OUTPUT:
// <ul><li>Abaji</li><li>Raoji</li></ul>`]],
        [['Test the view.',
            r`@WebMvcTest(HomeController.class)
class HomeControllerTest {
    @Autowired MockMvc mvc;
    @Test
    void rendersName() throws Exception {
        mvc.perform(get("/"))
           .andExpect(status().isOk())
           .andExpect(view().name("home"))
           .andExpect(content().string(containsString("Hello, Abaji")));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Conditional markup.',
                r`// <p th:if="` + r`$` + r`{items.isEmpty()}
">Nothing here</p>
// <p th:unless="` + r`$` + r`{items.isEmpty()}
">Has items</p>

// OUTPUT:
// <p>Nothing here</p>   (when the list is empty)`]]
    ),
    'mvc-static-html': x(
        ['<b>Static HTML</b> is a plain file served as it is, with no model and no rendering; Boot serves such files from <code>src/main/resources/static</code>.',
            '<b>URL mapping</b>: <code>static/about.html</code> is reachable at <code>/about.html</code>; the folder name is not part of the URL.',
            '<b>Welcome page</b>: an <code>index.html</code> in a static folder answers the root URL <code>/</code>.'],
        ['<b>Locations</b>: Boot checks <code>/static</code>, <code>/public</code>, <code>/resources</code> and <code>/META-INF/resources</code> on the classpath.',
            '<b>Handler</b>: <code>ResourceHttpRequestHandler</code> serves these files, after controllers had no matching mapping.',
            '<b>Static or template</b>: use static for fixed pages, CSS, JS and images; use a template when the page needs model data.'],
        ['<b>Caching</b>: set <code>spring.web.resources.cache.period</code> or use versioned URLs with <code>ResourceUrlProvider</code> so browsers cache assets safely.',
            '<b>Custom mapping</b>: <code>spring.mvc.static-path-pattern</code> and <code>spring.web.resources.static-locations</code> change the URL prefix and folders.',
            '<b>Security</b>: Spring Security protects static files too, so permit <code>/css/**</code> and <code>/js/**</code> explicitly for a login page.'],
        [['F', 'Where do static files go?', 'In <code>src/main/resources/static</code>.'],
            ['F', 'What URL serves static/css/app.css?', '<code>/css/app.css</code>.'],
            ['M', 'Which class serves static resources?', '<code>ResourceHttpRequestHandler</code>, registered by <code>WebMvcAutoConfiguration</code>.'],
            ['M', 'What happens if a controller and a static file match the same URL?', 'The controller mapping wins because handler mappings are checked before the resource handler.'],
            ['S', 'How do you cache-bust static files?', 'Enable the resource chain with a content version strategy so the URL changes when the file changes.'],
            ['S', 'How do you serve files from a folder outside the jar?', 'Add a resource handler with <code>file:/opt/assets/</code> or set <code>spring.web.resources.static-locations</code>.']],
        [['Serve a plain page and a stylesheet.',
            r`// src/main/resources/static/index.html
// <link rel="stylesheet" href="/css/app.css"><h1>Home</h1>
// src/main/resources/static/css/app.css
// h1 { color: teal; }

// OUTPUT:
// GET /          -> 200 text/html (index.html)
// GET /css/app.css -> 200 text/css`],
            ['Change the URL prefix.',
                r`# application.properties
spring.mvc.static-path-pattern=/assets/**
spring.web.resources.static-locations=classpath:/static/

# OUTPUT:
# GET /assets/css/app.css -> 200
# GET /css/app.css        -> 404`]],
        [['Custom resource handler.',
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry reg) {
        reg.addResourceHandler("/files/**")
           .addResourceLocations("file:/opt/files/")
           .setCacheControl(CacheControl.maxAge(Duration.ofDays(7)));
    }
}

// OUTPUT:
// GET /files/a.pdf -> 200, Cache-Control: max-age=604800`],
            ['Test a static file.',
                r`@SpringBootTest
@AutoConfigureMockMvc
class StaticTest {
    @Autowired MockMvc mvc;
    @Test
    void servesIndex() throws Exception {
        mvc.perform(get("/index.html")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-template-resolution': x(
        ['<b>Template resolution</b> is the step that turns the view name returned by a controller into a real template file.',
            '<b>Two steps</b>: Spring MVC first picks a <code>ViewResolver</code> to create a <code>View</code>, then the engine finds the template file using prefix and suffix.',
            '<b>Defaults</b>: for Thymeleaf in Boot, prefix <code>classpath:/templates/</code> and suffix <code>.html</code>, so <code>&quot;home&quot;</code> becomes <code>templates/home.html</code>.'],
        ['<b>Resolver chain</b>: <code>DispatcherServlet</code> asks each <code>ViewResolver</code> in order; the first one that returns a view wins.',
            '<b>Prefixes</b>: <code>redirect:/x</code> sends a 302 and <code>forward:/x</code> forwards inside the server; both skip template lookup.',
            '<b>No view name</b>: a void handler gets a name from the URL through <code>RequestToViewNameTranslator</code>, which is a common surprise.'],
        ['<b>Ordering</b>: <code>ContentNegotiatingViewResolver</code> comes first and asks the others; set <code>order</code> when you add several engines.',
            '<b>Thymeleaf inside</b>: <code>SpringResourceTemplateResolver</code> loads the file, and fragment expressions such as <code>&quot;page :: part&quot;</code> render only a piece.',
            '<b>Failure</b>: a missing template ends in <code>TemplateInputException</code> and a 500 page, so cover each view name with a MockMvc test.'],
        [['F', 'What does a ViewResolver do?', 'It maps the logical view name from the controller to a View object that renders the response.'],
            ['F', 'Where is home.html looked up?', 'At <code>classpath:/templates/home.html</code> in Boot with Thymeleaf.'],
            ['M', 'What does the redirect: prefix do?', 'It makes <code>RedirectView</code> send an HTTP redirect, so no template is used.'],
            ['M', 'Which properties change prefix and suffix?', '<code>spring.thymeleaf.prefix</code> and <code>spring.thymeleaf.suffix</code>.'],
            ['S', 'What is ContentNegotiatingViewResolver?', 'A resolver that delegates to other resolvers and picks the view that matches the requested media type.'],
            ['S', 'How do you use two engines together?', 'Register both starters and give each resolver a different <code>order</code>; names that one cannot resolve fall through to the next.']],
        [['See how names map to files.',
            r`@Controller
class PageController {
    @GetMapping("/a") String a() { return "home"; }     // templates/home.html
    @GetMapping("/b") String b() { return "admin/list"; } // templates/admin/list.html
    @GetMapping("/c") String c() { return "redirect:/a"; }
}

// OUTPUT:
// GET /a -> renders templates/home.html
// GET /b -> renders templates/admin/list.html
// GET /c -> 302 Location: /a`],
            ['Customize prefix and suffix.',
                r`# application.properties
spring.thymeleaf.prefix=classpath:/views/
spring.thymeleaf.suffix=.html

# OUTPUT:
# return "home" -> classpath:/views/home.html`]],
        [['Render one fragment only.',
            r`@GetMapping("/cart")
String cart(Model model) {
    model.addAttribute("items", cartService.items());
    return "cart :: items";     // only th:fragment="items" is returned
}

// OUTPUT:
// <ul><li>Pen</li><li>Book</li></ul>   (no full page)`],
            ['Test the resolved view.',
                r`mvc.perform(get("/b"))
   .andExpect(view().name("admin/list"));
mvc.perform(get("/c"))
   .andExpect(redirectedUrl("/a"));

// OUTPUT:
// Tests run: 2, Failures: 0`]]
    ),
    'mvc-layouts': x(
        ['<b>Layout</b>: a shared page frame (header, menu, footer) written once and reused by every page, so you do not copy markup.',
            '<b>Thymeleaf fragments</b>: define with <code>th:fragment=&quot;header&quot;</code> and use with <code>th:replace</code> or <code>th:insert</code>.',
            '<b>Other engines</b>: FreeMarker uses <code>&lt;#include&gt;</code> and macros, and Mustache uses partials such as <code>{{&gt; header}}</code>.'],
        ['<b>replace or insert</b>: <code>th:replace</code> swaps the host tag with the fragment; <code>th:insert</code> puts the fragment inside the host tag.',
            '<b>Parameters</b>: a fragment can take arguments, as in <code>th:fragment=&quot;nav(active)&quot;</code>, to highlight the current menu item.',
            '<b>Layout dialect</b>: the <code>thymeleaf-layout-dialect</code> library adds <code>layout:decorate</code>, so a page fills the slots of a base layout.'],
        ['<b>Content slots</b>: pass the page body as a fragment parameter or use the layout dialect, so one base template controls head, scripts and footer.',
            '<b>Cost</b>: each fragment lookup is parsed once and cached; deep nesting is cheap, but a missing fragment fails at render time, not at startup.',
            '<b>Testing</b>: assert that shared markup (for example the nav) appears in the response of several pages.'],
        [['F', 'Why use layouts?', 'To avoid repeating the same header and footer in every page and to change them in one place.'],
            ['F', 'How do you define a Thymeleaf fragment?', 'Put <code>th:fragment=&quot;name&quot;</code> on an element in a template.'],
            ['M', 'th:insert versus th:replace?', 'Insert keeps the host tag and adds the fragment inside; replace removes the host tag.'],
            ['M', 'How does a fragment get parameters?', 'Declare them like <code>th:fragment=&quot;box(title)&quot;</code> and call <code>th:replace=&quot;~{f :: box(&#39;Hi&#39;)}&quot;</code>.'],
            ['S', 'What does layout:decorate do?', 'It wraps the current page in a base layout and fills its <code>layout:fragment</code> slots with the page content.'],
            ['S', 'How is a partial in Mustache different?', 'It is a plain include with the same context and no parameters, so shared logic stays in Java.']],
        [['A header fragment reused on a page.',
            r`<!-- templates/fragments.html -->
<header th:fragment="header">
  <a href="/">Home</a>
</header>
<!-- templates/home.html -->
<div th:replace="~{fragments :: header}"></div>
<main>Welcome</main>

// OUTPUT:
// <header><a href="/">Home</a></header>
// <main>Welcome</main>`],
            ['A fragment with a parameter.',
                r`<!-- fragments.html -->
<nav th:fragment="nav(active)">
  <a th:classappend="` + r`$` + r`{active == 'home'}
? 'on'" href="/">Home</a>
</nav>
<!-- page -->
<nav th:replace="~{fragments :: nav('home')}"></nav>

// OUTPUT:
// <nav><a class="on" href="/">Home</a></nav>`]],
        [['Layout dialect decorator.',
            r`<!-- templates/base.html -->
<html xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<body>
  <header>My App</header>
  <section layout:fragment="content">default</section>
</body></html>
<!-- templates/page.html -->
<html layout:decorate="~{base}">
<body><section layout:fragment="content">Page body</section></body>
</html>

// OUTPUT:
// <header>My App</header><section>Page body</section>`],
            ['FreeMarker include and Mustache partial.',
                r`<#-- FreeMarker -->
<#include "header.ftlh">
<#-- Mustache -->
{{> header}}

// OUTPUT:
// the header markup appears at that position`]]
    ),
    'mvc-form-binding': x(
        ['<b>Form binding</b> copies the submitted form fields into the properties of a Java object, so you work with an object instead of many strings.',
            '<b>How</b>: the field name must match the property name; a field <code>email</code> is set through <code>setEmail</code> on the <code>@ModelAttribute</code> object.',
            '<b>Both ways</b>: on GET the object is put in the model to fill the form; on POST Spring creates it from the request and passes it to the handler.'],
        ['<b>Thymeleaf</b>: <code>th:object</code> names the form bean, and <code>th:field=&quot;*{email}&quot;</code> sets <code>id</code>, <code>name</code> and <code>value</code> in one step.',
            '<b>Conversion</b>: strings become numbers, dates and enums using converters and formatters; <code>@DateTimeFormat</code> controls date patterns.',
            '<b>Errors</b>: a failed conversion or validation is stored in <code>BindingResult</code>, which must come right after the bound parameter.'],
        ['<b>Mass assignment</b>: a client can post extra fields such as <code>admin=true</code>; bind to a form class (DTO) or restrict with <code>@InitBinder</code> and <code>setAllowedFields</code>.',
            '<b>Engine</b>: <code>WebDataBinder</code> does the work using <code>ConversionService</code>; custom types need a <code>Converter</code> or <code>Formatter</code>.',
            '<b>Empty strings</b>: register <code>StringTrimmerEditor(true)</code> so blank input becomes null and validation like <code>@NotNull</code> works as expected.'],
        [['F', 'What is form binding?', 'Automatically filling a Java object from the fields of a submitted form.'],
            ['F', 'What must match between HTML and Java?', 'The input <code>name</code> must equal the property name of the object.'],
            ['M', 'What does BindingResult hold?', 'Conversion and validation errors for the bound object; it must directly follow the object parameter.'],
            ['M', 'What does th:field generate?', 'The <code>id</code>, <code>name</code> and <code>value</code> attributes for the property.'],
            ['S', 'How do you stop mass assignment?', 'Bind to a dedicated form class, or use <code>@InitBinder</code> with <code>setAllowedFields</code> or <code>setDisallowedFields</code>.'],
            ['S', 'Which class performs the binding?', '<code>WebDataBinder</code>, created per request by the <code>ModelAttributeMethodProcessor</code>.']],
        [['Bind a registration form.',
            r`public class RegisterForm {
    private String name;
    private int age;
    // getters and setters
}
@PostMapping("/register")
String register(@ModelAttribute RegisterForm form) {
    return "done";
}

// OUTPUT:
// POST name=Abaji&age=21 -> form.name = "Abaji", form.age = 21`],
            ['The Thymeleaf side.',
                r`<form th:object="` + r`$` + r`{registerForm}
" th:action="@{/register}
" method="post">
  <input type="text" th:field="*{name}">
  <input type="number" th:field="*{age}">
  <button>Save</button>
</form>

// OUTPUT:
// <input type="text" id="name" name="name" value="">`]],
        [['Restrict bindable fields.',
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.setAllowedFields("name", "age");   // ignore everything else
}

// OUTPUT:
// POST name=Abaji&age=21&admin=true -> admin is ignored`],
            ['Handle a conversion error.',
                r`@PostMapping("/register")
String register(@ModelAttribute RegisterForm form, BindingResult br) {
    if (br.hasErrors()) return "register";
    return "redirect:/done";
}

// OUTPUT:
// POST age=abc -> BindingResult error "typeMismatch" on field age,
//                 page re-rendered with the form`]]
    ),
    'mvc-server-side-rendering': x(
        ['<b>Server-side rendering (SSR)</b> means the server builds the complete HTML page and sends it, so the browser only displays it.',
            '<b>In Spring MVC</b>: a <code>@Controller</code> returns a view name, a template engine fills the page, and the response body is HTML.',
            '<b>Compare</b>: client-side rendering sends mostly JavaScript and JSON and builds the page in the browser; SSR needs no JavaScript to show content.'],
        ['<b>Benefits</b>: fast first paint, good for SEO and simple to secure because logic and data stay on the server.',
            '<b>Post/Redirect/Get</b>: after a successful form POST, redirect to a GET page, so a browser refresh does not submit the form again.',
            '<b>Flash attributes</b>: <code>RedirectAttributes.addFlashAttribute</code> carries a success message across the redirect once.'],
        ['<b>Partial updates</b>: return only a fragment (<code>&quot;page :: part&quot;</code>) for libraries such as htmx, to refresh a part of the page without a full SPA.',
            '<b>Scaling</b>: rendering costs CPU on the server; cache fragments, enable gzip, and keep sessions small or stateless.',
            '<b>Controller or REST</b>: <code>@Controller</code> returns views; <code>@RestController</code> returns data. Mixing them by accident (missing <code>@ResponseBody</code>) gives a missing-template error.'],
        [['F', 'What is server-side rendering?', 'The server creates the full HTML for each request and the browser just shows it.'],
            ['F', 'Name a Spring tool for SSR.', 'Thymeleaf with Spring MVC (also FreeMarker, Mustache or JSP).'],
            ['M', 'What is Post/Redirect/Get?', 'After a POST the server redirects to a GET URL so a refresh does not repeat the action.'],
            ['M', 'How do you show a message after a redirect?', 'Use a flash attribute with <code>RedirectAttributes</code>; it survives one redirect.'],
            ['S', 'SSR versus SPA trade-offs?', 'SSR gives better SEO and first load and simpler security; an SPA gives richer interaction but needs an API and more client code.'],
            ['S', 'How do you refresh part of a page with SSR?', 'Return a template fragment from a dedicated endpoint and let htmx or a small script swap it into the page.']],
        [['A full SSR flow.',
            r`@Controller
class TodoController {
    private final List<String> todos = new ArrayList<>();
    @GetMapping("/todos")
    String list(Model m) {
        m.addAttribute("todos", todos);
        return "todos";
    }
    @PostMapping("/todos")
    String add(@RequestParam String text, RedirectAttributes ra) {
        todos.add(text);
        ra.addFlashAttribute("msg", "Added");
        return "redirect:/todos";
    }
}

// OUTPUT:
// POST /todos text=Milk -> 302 Location: /todos
// GET  /todos           -> HTML list with the message "Added"`],
            ['The matching template.',
                r`<p th:if="` + r`$` + r`{msg}
" th:text="` + r`$` + r`{msg}
"></p>
<ul><li th:each="t : ` + r`$` + r`{todos}
" th:text="` + r`$` + r`{t}
"></li></ul>

// OUTPUT:
// <p>Added</p><ul><li>Milk</li></ul>`]],
        [['Return a fragment for htmx.',
            r`@GetMapping("/todos/fragment")
String fragment(Model m) {
    m.addAttribute("todos", todos);
    return "todos :: list";        // th:fragment="list"
}

// OUTPUT:
// <ul>...</ul>   (only the list, not the full page)`],
            ['Test the redirect.',
                r`mvc.perform(post("/todos").param("text", "Milk"))
   .andExpect(status().is3xxRedirection())
   .andExpect(redirectedUrl("/todos"))
   .andExpect(flash().attribute("msg", "Added"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-html-forms': x(
        ['<b>HTML form</b>: a <code>&lt;form&gt;</code> element groups inputs and sends them to the server when the user submits.',
            '<b>Main attributes</b>: <code>action</code> is the URL and <code>method</code> is <code>get</code> or <code>post</code>; each input needs a <code>name</code> because the name is the request parameter key.',
            '<b>Spring side</b>: read single values with <code>@RequestParam</code> or bind many values to an object with <code>@ModelAttribute</code>.'],
        ['<b>GET or POST</b>: GET puts values in the URL and suits searches; POST puts them in the body and suits changes.',
            '<b>Input types</b>: text, email, number, date, checkbox, radio, select and textarea; unchecked checkboxes are not sent at all.',
            '<b>Browsers only send GET and POST</b>: for PUT or DELETE add a hidden <code>_method</code> field and enable <code>spring.mvc.hiddenmethod.filter.enabled=true</code>.'],
        ['<b>File upload</b>: use <code>enctype=&quot;multipart/form-data&quot;</code> and a <code>MultipartFile</code> parameter; limits are in <code>spring.servlet.multipart.*</code>.',
            '<b>CSRF</b>: with Spring Security every POST form needs the CSRF token; Thymeleaf adds it automatically when you use <code>th:action</code>.',
            '<b>Validation twice</b>: HTML attributes such as <code>required</code> help the user, but only server-side validation protects the application.'],
        [['F', 'Which attribute decides where a form is sent?', 'The <code>action</code> attribute; the <code>method</code> attribute chooses GET or POST.'],
            ['F', 'Why does an input need a name?', 'The name becomes the parameter key; inputs without a name are not submitted.'],
            ['M', 'What happens to an unchecked checkbox?', 'Nothing is sent for it, so the Java side sees null or false by default.'],
            ['M', 'How do you submit a DELETE from a form?', 'Use method post with a hidden <code>_method=delete</code> field and enable the hidden method filter.'],
            ['S', 'Which enctype is needed for file upload?', '<code>multipart/form-data</code>, handled by <code>MultipartResolver</code> into a <code>MultipartFile</code>.'],
            ['S', 'Why is client validation not enough?', 'A client can skip the browser and send any request, so the server must validate again.']],
        [['A login form and its handler.',
            r`<form action="/login" method="post">
  <input name="user"><input name="pass" type="password">
  <button>Login</button>
</form>
@PostMapping("/login")
String login(@RequestParam String user, @RequestParam String pass) {
    return "redirect:/home";
}

// OUTPUT:
// POST /login  user=abaji&pass=*** -> 302 Location: /home`],
            ['A search form with GET.',
                r`<form action="/search" method="get"><input name="q"></form>
@GetMapping("/search")
String search(@RequestParam(defaultValue = "") String q, Model m) {
    m.addAttribute("q", q);
    return "results";
}

// OUTPUT:
// GET /search?q=spring -> view "results", q = "spring"`]],
        [['Checkbox with a default.',
            r`<input type="checkbox" name="news" value="true">
<input type="hidden" name="_news" value="on">
@PostMapping("/prefs")
String prefs(@RequestParam(defaultValue = "false") boolean news) {
    return "ok";
}

// OUTPUT:
// unchecked -> news = false ; checked -> news = true`],
            ['Test a form post.',
                r`mvc.perform(post("/login")
        .param("user", "abaji").param("pass", "x"))
   .andExpect(status().is3xxRedirection())
   .andExpect(redirectedUrl("/home"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-spring-mvc-forms': x(
        ['<b>Spring MVC form</b>: the usual flow is GET shows an empty form backed by an object, POST receives the filled object, validates it and either shows errors or redirects.',
            '<b>Pieces</b>: a form class, a GET handler that adds it to the model, a POST handler with <code>@Valid</code> and <code>BindingResult</code>, and a template that shows fields and errors.',
            '<b>Views</b>: Thymeleaf uses <code>th:object</code> and <code>th:field</code>; JSP uses the Spring tag library <code>&lt;form:form modelAttribute=&quot;user&quot;&gt;</code>.'],
        ['<b>Validation</b>: put Jakarta annotations such as <code>@NotBlank</code>, <code>@Email</code> and <code>@Size</code> on the form class and add <code>@Valid</code> on the parameter.',
            '<b>Order rule</b>: <code>BindingResult</code> must come immediately after the <code>@Valid</code> parameter, or Spring throws <code>MethodArgumentNotValidException</code> instead.',
            '<b>Show errors</b>: <code>th:errors=&quot;*{email}&quot;</code> prints messages and <code>#fields.hasErrors(&#39;email&#39;)</code> can change CSS classes.'],
        ['<b>Post/Redirect/Get</b>: redirect after success so refresh does not resubmit; return the view directly (no redirect) on errors so the entered values and messages stay.',
            '<b>Messages</b>: field errors use codes like <code>NotBlank.form.name</code>, which you can override in <code>messages.properties</code> for friendly, translated text.',
            '<b>Edit forms</b>: load the entity into a form object on GET and copy only allowed fields back on POST; never bind straight to a JPA entity.'],
        [['F', 'What is the GET and POST pattern for forms?', 'GET returns the empty form; POST processes the submitted data and redirects on success.'],
            ['F', 'How do you validate a form object?', 'Annotate its fields with Jakarta validation and add <code>@Valid</code> to the parameter.'],
            ['M', 'Why must BindingResult follow the form parameter?', 'Spring matches it to the preceding argument; otherwise validation errors are thrown as an exception.'],
            ['M', 'How do you show a field error in Thymeleaf?', 'With <code>th:if=&quot;#fields.hasErrors(&#39;name&#39;)&quot;</code> and <code>th:errors=&quot;*{name}&quot;</code>.'],
            ['S', 'Why not bind a JPA entity directly?', 'It exposes every field to mass assignment and mixes web and persistence concerns; use a form DTO.'],
            ['S', 'How do you translate error messages?', 'Define the codes in <code>messages.properties</code> (and locale variants) and Spring resolves them through the <code>MessageSource</code>.']],
        [['The form class and the controller.',
            r`public class UserForm {
    @NotBlank private String name;
    @Email @NotBlank private String email;
    // getters and setters
}
@Controller
class UserController {
    @GetMapping("/users/new")
    String form(Model m) {
        m.addAttribute("userForm", new UserForm());
        return "user-form";
    }
    @PostMapping("/users")
    String save(@Valid @ModelAttribute UserForm userForm, BindingResult br) {
        if (br.hasErrors()) return "user-form";
        return "redirect:/users";
    }
}

// OUTPUT:
// POST name=&email=bad -> 200 user-form with 2 field errors
// POST name=Abaji&email=a@b.com -> 302 Location: /users`],
            ['The Thymeleaf template.',
                r`<form th:object="` + r`$` + r`{userForm}
" th:action="@{/users}
" method="post">
  <input th:field="*{name}">
  <span th:if="` + r`$` + r`{#fields.hasErrors('name')}
" th:errors="*{name}
"></span>
  <input th:field="*{email}">
  <span th:errors="*{email}"></span>
  <button>Save</button>
</form>

// OUTPUT:
// <span>must not be blank</span>   (when name is empty)`]],
        [['Test validation errors.',
            r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @Test
    void rejectsBadEmail() throws Exception {
        mvc.perform(post("/users").param("name", "Abaji").param("email", "bad"))
           .andExpect(status().isOk())
           .andExpect(model().attributeHasFieldErrors("userForm", "email"))
           .andExpect(view().name("user-form"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Custom error message.',
                r`# messages.properties
NotBlank.userForm.name=Please enter your name
Email.userForm.email=Enter a valid email address

# OUTPUT:
# The page shows "Please enter your name" for an empty name.`]]
    )
};

export const smvc10Deep: Record<string, Deep> = {
    'mvc-freemarker': dv(
        [`<p>FreeMarker renders in two phases: parse the template once into an object tree, then process it with a data model.</p><ul><li><b>Config:</b> Boot creates a <code>FreeMarkerConfigurer</code> that owns the FreeMarker <code>Configuration</code> and the template loader path.</li><li><b>Resolver:</b> <code>FreeMarkerViewResolver</code> builds a <code>FreeMarkerView</code> for a view name plus the suffix.</li><li><b>Render:</b> the view merges model, request and session attributes, then calls <code>template.process</code> on the response writer.</li><li><b>Cache:</b> parsed templates are cached and refreshed after <code>templateUpdateDelay</code> in development.</li></ul>`,
            r`# Boot auto-configuration (FreeMarkerAutoConfiguration) in short:
# 1. FreeMarkerConfigurer  -> Configuration, loader path classpath:/templates/
# 2. FreeMarkerViewResolver -> suffix .ftlh, content type text/html
# 3. view.render(model) -> template.process(model, response.getWriter())

# OUTPUT:
# "hello" -> templates/hello.ftlh -> HTML written to the response`],
        [`<p>Useful options and syntax:</p><ul><li><b>Properties:</b> <code>spring.freemarker.suffix</code>, <code>template-loader-path</code>, <code>cache</code>, <code>charset</code>, <code>settings.*</code>.</li><li><b>Directives:</b> <code>list</code>, <code>if/elseif/else</code>, <code>assign</code>, <code>macro</code>, <code>import</code>, <code>include</code>.</li><li><b>Built-ins:</b> <code>?upper_case</code>, <code>?size</code>, <code>?string(&quot;0.00&quot;)</code>, <code>?date</code>, <code>?has_content</code>.</li><li><b>Request data:</b> enable <code>expose-request-attributes</code> and <code>expose-session-attributes</code> when needed.</li></ul>`,
            r`<#assign total = 0>
<#list items as i>
  <#assign total = total + i.price>
  <p>` + r`$` + r`{i.name?upper_case}
-` + r`$` + r`{i.price?string("0.00")}
</p>
</#list>
<#if items?has_content>Total ` + r`$` + r`{total?string("0.00")}
<#else>Empty</#if>

# OUTPUT:
# <p>PEN - 2.50</p>
# <p>BOOK - 10.00</p>
# Total 12.50`],
        [`<p>Common mistakes:</p><ul><li><b>Missing variable:</b> an undefined name stops rendering; use <code>!</code> or <code>??</code>.</li><li><b>Wrong extension:</b> <code>.ftl</code> gives no escaping, so XSS is possible; use <code>.ftlh</code>.</li><li><b>Suffix in the view name:</b> returning <code>&quot;hello.ftlh&quot;</code> looks for <code>hello.ftlh.ftlh</code>.</li><li><b>Number formatting:</b> <code>1,234</code> is printed by default; use <code>?c</code> for machine output such as ids.</li><li><b>Entity access:</b> lazy collections in templates fail after the session is closed; map to DTOs.</li></ul>`,
            r`// WRONG
return "hello.ftlh";      // looks for templates/hello.ftlh.ftlh
// RIGHT
return "hello";

// template: id=1234 prints "1,234"; for a URL use the c builtin
// <a href="/u/` + r`$` + r`{id?c}
">profile</a>

// OUTPUT:
// <a href="/u/1234">profile</a>`],
        [`<p>Performance and tuning:</p><ul><li><b>Cache on:</b> parsing is the expensive part, so keep <code>spring.freemarker.cache=true</code> in production.</li><li><b>Keep logic out:</b> prepare totals and flags in Java instead of heavy template computation.</li><li><b>Output size:</b> add <code>&lt;#compress&gt;</code> or enable gzip compression at the server.</li><li><b>Fail fast:</b> set <code>template_exception_handler=rethrow</code> so errors give a clear 500, not half a page.</li></ul>`,
            r`# application.properties (production)
spring.freemarker.cache=true
spring.freemarker.settings.template_exception_handler=rethrow
spring.freemarker.settings.number_format=0.##
server.compression.enabled=true

# OUTPUT:
# Templates parsed once;
errors surface as a 500 with a stack trace in the log.`],
        [`<p>Scenario: an order confirmation page and an invoice email share the same engine.</p><ul><li>The same FreeMarker <code>Configuration</code> renders the web page and an HTML email.</li><li>A shared macro file keeps the address and price blocks identical.</li><li>A MockMvc test checks the page; a unit test processes the email template with a sample model.</li></ul>`,
            r`@Autowired Configuration cfg;      // freemarker.template.Configuration
String renderEmail(Order o) throws Exception {
    Template t = cfg.getTemplate("order-email.ftlh");
    StringWriter out = new StringWriter();
    t.process(Map.of("order", o), out);
    return out.toString();
}

// OUTPUT:
// <p>Thanks Abaji, your order #1001 is confirmed.</p>`]
    ),
    'mvc-mustache': dv(
        [`<p>Mustache templates are compiled by JMustache into a tree of text and tag nodes.</p><ul><li><b>Config:</b> <code>MustacheAutoConfiguration</code> creates a <code>Mustache.Compiler</code> and a <code>MustacheViewResolver</code>.</li><li><b>Lookup:</b> a name is searched in the current context, then its parents, then the model map.</li><li><b>Sections:</b> a collection repeats, a boolean true shows once, false or empty hides, and an object becomes the new context.</li><li><b>Output:</b> the compiled template executes against the model and writes to the response.</li></ul>`,
            r`# MustacheAutoConfiguration in short:
# Mustache.Compiler (JMustache) + TemplateLoader classpath:/templates/
# MustacheViewResolver -> suffix .mustache

# OUTPUT:
# "users" -> templates/users.mustache compiled once, executed per request`],
        [`<p>Syntax summary:</p><ul><li><b>Variable:</b> <code>{{name}}</code> escaped, <code>{{{name}}}</code> or <code>{{&amp;name}}</code> raw.</li><li><b>Section:</b> <code>{{#x}}...{{/x}}</code>; inverted <code>{{^x}}...{{/x}}</code>.</li><li><b>Partial:</b> <code>{{&gt; file}}</code>.</li><li><b>Comment:</b> <code>{{! note }}</code>.</li><li><b>Dot:</b> <code>{{.}}</code> is the current item in a list of simple values.</li></ul>`,
            r`<!-- tags.mustache -->
{{! a comment, not printed }}
<ul> {
    {#tags}
}
<li> {
    {.}
}
</li> {
    {/tags}
}
</ul>
{{^tags}}No tags {
    {/tags}
}

<!-- model: tags = ["java", "spring"] -->
// OUTPUT:
// <ul><li>java</li><li>spring</li></ul>`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Missing key:</b> JMustache throws for an undefined variable by default; set <code>spring.mustache.check-template-location</code> and provide defaults in the model, or configure the compiler to default to empty.</li><li><b>Wanting if/else:</b> compute a boolean in Java and use a section.</li><li><b>Raw output of user text:</b> triple braces open an XSS hole.</li><li><b>Formatting dates:</b> format in Java; there are no functions in templates.</li></ul>`,
            r`// WRONG: raw output of user input
// {{{comment}}}
// RIGHT: escaped output
// {{comment}}
record View(String when, boolean hasItems) {}   // dates preformatted in Java

// OUTPUT:
// {{comment}} with "<b>x</b>" prints &lt;b&gt;x&lt;/b&gt;`],
        [`<p>Performance:</p><ul><li><b>Cheap:</b> compilation is quick and the compiled template is cached.</li><li><b>Small models:</b> pass flat records so lookups stay short.</li><li><b>Dev reload:</b> set <code>spring.mustache.servlet.cache=false</code> only while developing.</li></ul>`,
            r`# application.properties
spring.mustache.servlet.cache=true
spring.mustache.suffix=.mustache
spring.mustache.servlet.expose-request-attributes=false

# OUTPUT:
# Templates are compiled once and reused for every request.`],
        [`<p>Scenario: a small status page that must also render in a JavaScript front end.</p><ul><li>The same <code>.mustache</code> file is used on the server and in the browser.</li><li>Java prepares a view record with labels and flags.</li><li>A MockMvc test checks the HTML for each state.</li></ul>`,
            r`record Status(String service, boolean up) {}
@GetMapping("/status")
String status(Model m) {
    m.addAttribute("items", List.of(new Status("db", true), new Status("mq", false)));
    return "status";
}
// {{#items}}{{service}}: {{#up}}UP{{/up}}{{^up}}DOWN{{/up}}
// {{/items}}

// OUTPUT:
// db: UP
// mq: DOWN`]
    ),
    'mvc-html-templates': dv(
        [`<p>Rendering an HTML template involves several Spring components.</p><ul><li><b>DispatcherServlet:</b> finds the handler, runs it and receives the view name and model.</li><li><b>ViewResolver:</b> turns the name into a <code>View</code>.</li><li><b>View.render:</b> the engine merges the model into the template and writes to the response.</li><li><b>Boot:</b> the matching auto-configuration (Thymeleaf, FreeMarker, Mustache) registers the resolver when its library is on the classpath.</li></ul>`,
            r`// Simplified DispatcherServlet flow
// ModelAndView mav = handlerAdapter.handle(request, response, handler);
// View view = viewResolver.resolveViewName(mav.getViewName(), locale);
// view.render(mav.getModel(), request, response);

// OUTPUT:
// "home" + {name=Abaji} -> text/html body`],
        [`<p>Ways to supply model data:</p><ul><li><b>Model parameter:</b> <code>model.addAttribute</code>.</li><li><b>ModelAndView:</b> return view and data together.</li><li><b>@ModelAttribute method:</b> data added for every handler in the controller.</li><li><b>@ControllerAdvice:</b> data shared by all controllers, such as the current user.</li></ul>`,
            r`@ControllerAdvice
class GlobalModel {
    @ModelAttribute("appName")
    String appName() { return "Shop"; }
}
@GetMapping("/")
ModelAndView home() {
    return new ModelAndView("home", Map.of("name", "Abaji"));
}

// OUTPUT:
// Template sees both appName = "Shop" and name = "Abaji".`],
        [`<p>Mistakes:</p><ul><li><b>Forgetting @Controller:</b> <code>@RestController</code> writes the view name as text.</li><li><b>Template in wrong folder:</b> a 500 with <code>TemplateInputException</code>.</li><li><b>th:utext with user data:</b> XSS risk.</li><li><b>Entities with lazy fields:</b> <code>LazyInitializationException</code> during render.</li></ul>`,
            r`// WRONG: prints the text "home" in the browser
@RestController
class Bad {
    @GetMapping("/") String home() { return "home"; }
}
// RIGHT
@Controller
class Good {
    @GetMapping("/") String home() { return "home"; }
}

// OUTPUT:
// Bad  -> body: home
// Good -> body: <html>...</html>`],
        [`<p>Performance:</p><ul><li>Keep template caching on in production.</li><li>Avoid database calls inside templates; load data in the service layer.</li><li>Enable gzip and long cache headers for assets, not for dynamic pages.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
server.compression.enabled=true
server.compression.mime-types=text/html,text/css,application/javascript

# OUTPUT:
# HTML responses are compressed;
template parsing happens once.`],
        [`<p>Scenario: a product list page.</p><ul><li>The service returns a list of small view records.</li><li>The controller adds it to the model and returns the view name.</li><li>A <code>@WebMvcTest</code> with a mocked service checks the HTML.</li></ul>`,
            r`record ProductView(String name, String price) {}
@Controller
class ProductController {
    private final ProductService service;
    ProductController(ProductService s) { this.service = s; }
    @GetMapping("/products")
    String list(Model m) {
        m.addAttribute("products", service.views());
        return "products";
    }
}

// OUTPUT:
// GET /products -> 200, table with one row per product`]
    ),
    'mvc-static-html': dv(
        [`<p>Static files are served by a resource handler, not by controllers.</p><ul><li><b>Registration:</b> <code>WebMvcAutoConfiguration</code> adds a <code>ResourceHttpRequestHandler</code> for <code>/**</code> with the static locations.</li><li><b>Order:</b> <code>RequestMappingHandlerMapping</code> is asked first; the resource mapping has the lowest priority.</li><li><b>Response:</b> the handler resolves the file, sets content type, <code>Last-Modified</code> and <code>ETag</code>, and supports conditional requests (304).</li><li><b>Welcome page:</b> <code>WelcomePageHandlerMapping</code> maps <code>/</code> to <code>index.html</code> or an <code>index</code> template.</li></ul>`,
            r`# Request flow for GET /css/app.css
# 1. RequestMappingHandlerMapping -> no controller matches
# 2. SimpleUrlHandlerMapping(/**) -> ResourceHttpRequestHandler
# 3. found classpath:/static/css/app.css -> 200 + ETag

# OUTPUT:
# HTTP/1.1 200
# Content-Type: text/css
# ETag: "0a1b2c" (varies)`],
        [`<p>Options:</p><ul><li><b>Folders:</b> <code>spring.web.resources.static-locations</code>.</li><li><b>Prefix:</b> <code>spring.mvc.static-path-pattern</code>.</li><li><b>Caching:</b> <code>spring.web.resources.cache.period</code> and <code>cachecontrol.*</code>.</li><li><b>Versioning:</b> <code>spring.web.resources.chain.strategy.content.enabled=true</code>.</li><li><b>Disable:</b> <code>spring.web.resources.add-mappings=false</code> for an API-only app.</li></ul>`,
            r`# application.properties
spring.web.resources.cache.cachecontrol.max-age=7d
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**

# OUTPUT:
# Cache-Control: max-age=604800 on static responses`],
        [`<p>Mistakes:</p><ul><li><b>/static in the URL:</b> the folder name is not part of the path.</li><li><b>Static file in templates folder:</b> it is not served directly.</li><li><b>Stale cache after deploy:</b> use content-versioned URLs.</li><li><b>Security blocks CSS:</b> permit the asset paths on the login page.</li></ul>`,
            r`// WRONG
// <link href="/static/css/app.css" rel="stylesheet">     -> 404
// RIGHT
// <link href="/css/app.css" rel="stylesheet">
http.authorizeHttpRequests(a -> a
    .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
    .anyRequest().authenticated());

// OUTPUT:
// GET /css/app.css -> 200 even for anonymous users`],
        [`<p>Performance:</p><ul><li>Long cache periods plus content hashes in the URL.</li><li>Serve big assets through a CDN or reverse proxy such as nginx.</li><li>Enable compression for text assets.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.min-response-size=1024
spring.web.resources.cache.period=365d

# OUTPUT:
# Browser reuses assets for a year;
URL changes when content changes.`],
        [`<p>Scenario: a marketing landing page next to a dynamic app.</p><ul><li><code>static/index.html</code> is the public home page.</li><li>Dynamic pages use templates and controllers.</li><li>Assets are versioned and cached, and a test confirms the welcome page.</li></ul>`,
            r`mvc.perform(get("/"))
   .andExpect(status().isOk())
   .andExpect(content().contentTypeCompatibleWith("text/html"));

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),
    'mvc-template-resolution': dv(
        [`<p>Resolution happens in two layers.</p><ul><li><b>Spring layer:</b> <code>DispatcherServlet.resolveViewName</code> loops over <code>viewResolvers</code> sorted by order.</li><li><b>Engine layer:</b> for Thymeleaf, <code>ThymeleafViewResolver</code> makes a <code>ThymeleafView</code>; <code>SpringResourceTemplateResolver</code> adds prefix and suffix and loads the resource.</li><li><b>Special names:</b> <code>redirect:</code> and <code>forward:</code> are handled before the engine.</li><li><b>Default order:</b> content negotiation, bean name, then the engine resolvers.</li></ul>`,
            r`# resolveViewName("admin/list")
# ContentNegotiatingViewResolver -> asks the others
# BeanNameViewResolver           -> no bean named admin/list
# ThymeleafViewResolver          -> templates/admin/list.html

# OUTPUT:
# View: ThymeleafView[admin/list]`],
        [`<p>Variants:</p><ul><li><b>Plain MVC:</b> <code>InternalResourceViewResolver</code> with prefix <code>/WEB-INF/views/</code> and suffix <code>.jsp</code>.</li><li><b>Fragments:</b> <code>name :: fragment</code> or a selector like <code>name :: #id</code>.</li><li><b>Custom view:</b> a bean implementing <code>View</code> found by <code>BeanNameViewResolver</code>.</li><li><b>Order:</b> <code>spring.thymeleaf.servlet.produce-partial-output-while-processing</code> and resolver <code>setOrder</code> for tuning.</li></ul>`,
            r`@Bean
InternalResourceViewResolver jsp() {
    var r = new InternalResourceViewResolver("/WEB-INF/views/", ".jsp");
    r.setOrder(10);
    return r;
}
@Bean("report")
View report() { return (model, req, res) -> res.getWriter().print("custom"); }

// OUTPUT:
// return "report" -> body: custom (BeanNameViewResolver)`],
        [`<p>Mistakes:</p><ul><li><b>Leading slash or suffix in the name:</b> <code>&quot;/home.html&quot;</code> misses the file.</li><li><b>Void handler:</b> the view name comes from the URL, which may not exist.</li><li><b>Wrong case:</b> file lookups are case sensitive on Linux.</li><li><b>Resolver order clash:</b> a catch-all resolver (JSP) swallows names meant for another engine.</li></ul>`,
            r`// WRONG
@GetMapping("/about") void about() { }     // view name "about" by URL
return "/home.html";                       // misses templates/home.html
// RIGHT
@GetMapping("/about") String about() { return "about"; }
return "home";

// OUTPUT:
// TemplateInputException avoided; both pages render.`],
        [`<p>Performance:</p><ul><li>Resolved views are cached by <code>ViewResolver</code> cache (<code>setCache</code>, default on).</li><li>Fewer resolvers means fewer lookups per request.</li><li>Use <code>spring.thymeleaf.check-template-location=true</code> to fail early in development.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.thymeleaf.check-template-location=true
spring.thymeleaf.view-names=pages/*,admin/*

# OUTPUT:
# Only names under pages/ and admin/ are handled by Thymeleaf.`],
        [`<p>Scenario: migrating a legacy JSP area while new pages use Thymeleaf.</p><ul><li>Thymeleaf handles <code>view-names=new/*</code>.</li><li>The JSP resolver has a higher order number and takes the rest.</li><li>Tests assert <code>view().name()</code> for both groups.</li></ul>`,
            r`mvc.perform(get("/new/dashboard")).andExpect(view().name("new/dashboard"));
mvc.perform(get("/old/report")).andExpect(forwardedUrl("/WEB-INF/views/old/report.jsp"));

// OUTPUT:
// Tests run: 2, Failures: 0`]
    ),
    'mvc-layouts': dv(
        [`<p>Fragments are resolved at render time by the engine.</p><ul><li><b>Expression:</b> <code>~{file :: name}</code> loads another template and selects the element with a matching <code>th:fragment</code> or id.</li><li><b>replace:</b> the host element is removed and the fragment takes its place.</li><li><b>Layout dialect:</b> the decorator page is processed first, then the content page fills the slots of the base.</li><li><b>Caching:</b> each template file is parsed once; fragment selection runs per request.</li></ul>`,
            r`<!-- host -->
<div th:replace="~{fragments :: footer}"></div>
<!-- fragments.html -->
<footer th:fragment="footer">(c) Shop</footer>

<!-- OUTPUT -->
// <footer>(c) Shop</footer>`],
        [`<p>Layout techniques:</p><ul><li><b>Fragment with content:</b> pass markup as a parameter using a fragment expression.</li><li><b>Optional parameters:</b> use <code>th:with</code> or null checks.</li><li><b>Head merging:</b> <code>layout:title-pattern</code> builds page titles.</li><li><b>FreeMarker:</b> <code>&lt;#macro layout&gt;&lt;#nested&gt;&lt;/#macro&gt;</code> wraps page content.</li></ul>`,
            r`<!-- layout.ftlh -->
<#macro page title>
<html><head><title>` + r`$` + r`{title}
</title></head>
<body><header>Shop</header><#nested><footer>2026</footer></body></html>
</#macro>
<!-- page.ftlh -->
<#import "layout.ftlh" as l>
<@l.page title="Home">Welcome</@l.page>

// OUTPUT:
// <title>Home</title> ... <header>Shop</header>Welcome<footer>2026</footer>`],
        [`<p>Mistakes:</p><ul><li><b>Wrong path:</b> <code>~{fragments :: header}</code> without the folder if the file is in a subfolder.</li><li><b>Fragment name typo:</b> fails only at render time.</li><li><b>replace versus insert:</b> an extra wrapper tag appears when you use insert by mistake.</li><li><b>Missing dialect dependency:</b> <code>layout:decorate</code> is ignored without the library.</li></ul>`,
            r`// WRONG (file is templates/shared/fragments.html)
// <div th:replace="~{fragments :: header}"></div>
// RIGHT
// <div th:replace="~{shared/fragments :: header}"></div>

// OUTPUT:
// TemplateInputException avoided; header appears.`],
        [`<p>Performance:</p><ul><li>Fragments cost almost nothing once templates are cached.</li><li>Do not call services from fragments; pass data in the model.</li><li>Cache rarely changing fragments such as the footer with an HTTP cache if the whole page is static.</li></ul>`,
            r`# production settings
spring.thymeleaf.cache=true
spring.thymeleaf.enabled=true

# OUTPUT:
# Layout and fragments are parsed once and reused.`],
        [`<p>Scenario: an admin portal with 30 pages.</p><ul><li>One <code>base.html</code> holds the head, menu and scripts.</li><li>Each page only supplies its content slot and title.</li><li>A test checks that the menu appears on several pages.</li></ul>`,
            r`for (String url : List.of("/", "/users", "/reports")) {
    mvc.perform(get(url))
       .andExpect(content().string(containsString("<nav")));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),
    'mvc-form-binding': dv(
        [`<p>Binding is performed by a <code>WebDataBinder</code> for each request.</p><ul><li><b>Argument resolver:</b> <code>ModelAttributeMethodProcessor</code> creates the object (or takes it from the model), then calls <code>binder.bind(request)</code>.</li><li><b>Property access:</b> request parameters are matched to bean properties, including nested ones like <code>address.city</code>.</li><li><b>Conversion:</b> <code>ConversionService</code> converts strings; failures add a <code>FieldError</code> with code <code>typeMismatch</code>.</li><li><b>Validation:</b> if <code>@Valid</code> is present, the validator runs after binding.</li></ul>`,
            r`// Simplified
// Object target = new RegisterForm();
// WebDataBinder binder = factory.createBinder(request, target, "registerForm");
// binder.bind(new ServletRequestParameterPropertyValues(request));
// if (valid) binder.validate();
// BindingResult result = binder.getBindingResult();

// OUTPUT:
// name=Abaji&address.city=Pune -> form.getAddress().getCity() = "Pune"`],
        [`<p>Binding options:</p><ul><li><b>Formats:</b> <code>@DateTimeFormat(pattern = &quot;yyyy-MM-dd&quot;)</code>, <code>@NumberFormat</code>.</li><li><b>Custom type:</b> register a <code>Converter</code> or <code>Formatter</code> in <code>WebMvcConfigurer.addFormatters</code>.</li><li><b>Lists:</b> repeated names or indexed names such as <code>items[0].name</code>.</li><li><b>Binder rules:</b> <code>@InitBinder</code> with allowed, disallowed and required fields.</li></ul>`,
            r`public class BookingForm {
    @DateTimeFormat(pattern = "yyyy-MM-dd") private LocalDate date;
    private List<String> guests = new ArrayList<>();
    // getters and setters
}
@InitBinder
void init(WebDataBinder b) {
    b.registerCustomEditor(String.class, new StringTrimmerEditor(true));
}

// OUTPUT:
// date=2026-12-01&guests=A&guests=B -> date = 2026-12-01, guests = [A, B]
// name="   " -> null`],
        [`<p>Mistakes:</p><ul><li><b>BindingResult in the wrong place:</b> it must follow the model parameter immediately.</li><li><b>No setters:</b> properties stay empty without setters or field access.</li><li><b>Binding an entity:</b> users can set <code>id</code> or <code>role</code>.</li><li><b>Date format mismatch:</b> use the pattern the HTML input sends (<code>yyyy-MM-dd</code> for type date).</li></ul>`,
            r`// WRONG: BindingResult not directly after the form
@PostMapping("/b")
String bad(@Valid BookingForm f, Model m, BindingResult br) { return "x"; }
// RIGHT
@PostMapping("/b")
String good(@Valid BookingForm f, BindingResult br, Model m) { return "x"; }

// OUTPUT:
// bad  -> 400 / BindException on invalid input
// good -> br.hasErrors() is true, handler runs`],
        [`<p>Performance and safety:</p><ul><li>Binding is reflective but fast; the cost is small compared with I/O.</li><li>Limit collection growth with <code>setAutoGrowCollectionLimit</code> to stop huge indexes like <code>items[100000]</code>.</li><li>Use form classes with only the needed fields.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.setAutoGrowCollectionLimit(50);
    binder.setDisallowedFields("id", "role");
}

// OUTPUT:
// items[5000].name=x -> IndexOutOfBounds handled as a binding error`],
        [`<p>Scenario: a profile edit page.</p><ul><li>GET loads the user into <code>ProfileForm</code> with only name, phone and birthday.</li><li>POST binds, validates and copies the fields back to the entity.</li><li>The role field is never bindable.</li></ul>`,
            r`@PostMapping("/profile")
String save(@Valid ProfileForm form, BindingResult br, Principal p) {
    if (br.hasErrors()) return "profile";
    userService.update(p.getName(), form.getName(), form.getPhone());
    return "redirect:/profile?saved";
}

// OUTPUT:
// valid input -> 302 /profile?saved ; invalid -> profile page with errors`]
    ),
    'mvc-server-side-rendering': dv(
        [`<p>SSR in Spring MVC follows the normal request cycle.</p><ul><li><b>Handler:</b> the controller prepares the model.</li><li><b>View:</b> <code>ThymeleafView</code> (or another engine view) writes HTML into the response.</li><li><b>Session:</b> state such as login lives in the <code>HttpSession</code> and is sent back by a cookie.</li><li><b>Each click:</b> a new request returns a full document, unless a fragment endpoint is used.</li></ul>`,
            r`// Browser                     Server
// GET /todos            ->    TodoController.list
//                       <-    200 text/html (full page)
// POST /todos text=Milk ->    add() then redirect
//                       <-    302 Location: /todos
// GET /todos            ->    200 text/html (updated page)

// OUTPUT:
// Two GETs and one POST; the browser never needs JavaScript here.`],
        [`<p>Variants:</p><ul><li><b>Full pages:</b> <code>@Controller</code> plus a template.</li><li><b>Fragments:</b> <code>&quot;page :: part&quot;</code> for htmx or fetch.</li><li><b>Mixed:</b> an HTML page plus a <code>@RestController</code> for the data a widget needs.</li><li><b>Errors:</b> <code>templates/error/404.html</code> and <code>500.html</code> are used by Boot automatically.</li></ul>`,
            r`<!-- templates/error/404.html -->
<h1>Page not found</h1>
<a th:href="@{/}">Back home</a>
@GetMapping("/products/{id}")
String one(@PathVariable long id, Model m) {
    m.addAttribute("p", service.find(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    return "product";
}

// OUTPUT:
// GET /products/999 -> 404 with the custom error page`],
        [`<p>Mistakes:</p><ul><li><b>No redirect after POST:</b> refresh repeats the action.</li><li><b>Large session:</b> storing lists in the session hurts scaling.</li><li><b>Mixing @RestController:</b> returns text instead of a page.</li><li><b>Flash with forward:</b> flash attributes only work with redirect.</li></ul>`,
            r`// WRONG: returns the page after POST; refresh re-posts the form
@PostMapping("/todos")
String bad(@RequestParam String text) {
    todos.add(text);
    return "todos";
}
// RIGHT
@PostMapping("/todos")
String good(@RequestParam String text) {
    todos.add(text);
    return "redirect:/todos";
}

// OUTPUT:
// good -> refresh after the POST only reloads the list`],
        [`<p>Performance:</p><ul><li>Rendering cost grows with template size; keep pages light and paginate lists.</li><li>Compress HTML and cache static assets.</li><li>Use ETag filters or HTTP caching for pages that rarely change.</li><li>Keep the session small, or use Spring Session for several instances.</li></ul>`,
            r`@Bean
ShallowEtagHeaderFilter etagFilter() { return new ShallowEtagHeaderFilter(); }

# application.properties
server.compression.enabled=true
spring.data.web.pageable.default-page-size=20

# OUTPUT:
# Unchanged pages return 304 Not Modified;
lists are paged by 20.`],
        [`<p>Scenario: an internal admin application built only with SSR.</p><ul><li>Thymeleaf pages with a shared layout and Spring Security form login.</li><li>htmx loads table rows as fragments for sorting and paging.</li><li>MockMvc tests cover each page and each redirect.</li></ul>`,
            r`mvc.perform(get("/admin/users").with(user("admin").roles("ADMIN")))
   .andExpect(status().isOk())
   .andExpect(view().name("admin/users"))
   .andExpect(model().attributeExists("users"));

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),
    'mvc-html-forms': dv(
        [`<p>What happens when a form is submitted.</p><ul><li><b>Browser:</b> collects named, enabled controls into <code>name=value</code> pairs and URL-encodes them.</li><li><b>GET:</b> pairs go in the query string; <b>POST:</b> in the body with <code>application/x-www-form-urlencoded</code> or multipart.</li><li><b>Servlet:</b> the container parses them into request parameters.</li><li><b>Spring:</b> <code>@RequestParam</code> and <code>@ModelAttribute</code> read those parameters; a <code>HiddenHttpMethodFilter</code> can change the method.</li></ul>`,
            r`POST /login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

user=abaji&pass=secret%21&remember=on

# OUTPUT:
# request.getParameter("pass") = "secret!"   (decoded by the container)`],
        [`<p>Options and variants:</p><ul><li><b>enctype:</b> urlencoded (default), <code>multipart/form-data</code>, <code>text/plain</code>.</li><li><b>Multiple values:</b> several checkboxes with the same name bind to a <code>List</code> or array.</li><li><b>Buttons:</b> <code>name</code> on the submit button tells which one was pressed.</li><li><b>Hidden method:</b> <code>_method</code> field for PUT, PATCH and DELETE.</li></ul>`,
            r`<form method="post" action="/files" enctype="multipart/form-data">
  <input type="file" name="doc">
  <input type="checkbox" name="tags" value="a"><input type="checkbox" name="tags" value="b">
  <button name="action" value="save">Save</button>
</form>
@PostMapping("/files")
String up(@RequestParam MultipartFile doc, @RequestParam List<String> tags,
          @RequestParam String action) { return "ok"; }

// OUTPUT:
// doc = report.pdf, tags = [a, b], action = save`],
        [`<p>Mistakes:</p><ul><li><b>Missing name:</b> field not sent.</li><li><b>Missing enctype for upload:</b> file arrives empty.</li><li><b>POST without CSRF token:</b> 403 with Spring Security.</li><li><b>Required parameter absent:</b> 400 <code>MissingServletRequestParameterException</code>.</li></ul>`,
            r`<!-- WRONG -->
<form action="/upload" method="post"><input type="file" name="doc"></form>
<!-- RIGHT -->
<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="doc">
</form>

// OUTPUT:
// WRONG -> doc.isEmpty() is true ; RIGHT -> file bytes received`],
        [`<p>Performance and limits:</p><ul><li>Set upload limits to protect memory and disk.</li><li>Stream large files instead of reading them into memory.</li><li>Use GET for safe, cacheable searches.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
server.tomcat.max-http-form-post-size=2MB

# OUTPUT:
# A 6 MB upload fails with MaxUploadSizeExceededException (HTTP 413 or 400).`],
        [`<p>Scenario: a contact form on a company site.</p><ul><li>HTML form posts name, email and message.</li><li>The controller validates, saves and redirects to a thank-you page.</li><li>A hidden honeypot field stops simple bots.</li></ul>`,
            r`@PostMapping("/contact")
String contact(@RequestParam String name, @RequestParam String email,
               @RequestParam String message,
               @RequestParam(required = false) String website) {
    if (website != null && !website.isBlank()) return "redirect:/thanks";
    contactService.save(name, email, message);
    return "redirect:/thanks";
}

// OUTPUT:
// real user -> saved ; bot filling "website" -> ignored`]
    ),
    'mvc-spring-mvc-forms': dv(
        [`<p>A full Spring MVC form request passes through these steps.</p><ul><li><b>GET:</b> handler adds an empty form bean to the model; the view renders it with <code>th:object</code>.</li><li><b>POST:</b> <code>ModelAttributeMethodProcessor</code> binds and, with <code>@Valid</code>, validates through <code>LocalValidatorFactoryBean</code>.</li><li><b>Errors:</b> collected in <code>BindingResult</code> and exposed to the view as <code>#fields</code>.</li><li><b>Success:</b> service call, then redirect.</li></ul>`,
            r`// GET /users/new   -> model userForm (empty) -> user-form.html
// POST /users      -> bind -> validate
//    errors  -> view user-form (same model, errors attached) -> 200
//    no errors -> service.save -> redirect:/users -> 302

// OUTPUT:
// Invalid post keeps the typed values; valid post ends in a redirect.`],
        [`<p>Features:</p><ul><li><b>Groups:</b> validation groups through <code>@Validated(Group.class)</code>.</li><li><b>Class-level rules:</b> a custom constraint for password and confirm password.</li><li><b>JSP tags:</b> <code>&lt;form:form&gt;</code>, <code>&lt;form:input path=&quot;name&quot;/&gt;</code>, <code>&lt;form:errors path=&quot;name&quot;/&gt;</code>.</li><li><b>Select options:</b> a list in the model with <code>th:each</code> on <code>option</code>.</li></ul>`,
            r`public class SignupForm {
    @NotBlank @Size(min = 8) private String password;
    private String confirm;
    @AssertTrue(message = "Passwords differ")
    public boolean isPasswordsMatch() {
        return password != null && password.equals(confirm);
    }
}

// OUTPUT:
// password=abc12345&confirm=abc1234 -> error "Passwords differ"`],
        [`<p>Mistakes:</p><ul><li><b>Wrong model attribute name:</b> <code>th:object=&quot;$` + `{form}&quot;</code> must match the name in the model (default is the class name in camelCase).</li><li><b>Redirect on errors:</b> loses the errors and typed values.</li><li><b>No GET model object:</b> the form page fails with a missing bean error.</li><li><b>Forgetting @Valid:</b> annotations on the class are never checked.</li></ul>`,
            r`// WRONG: redirect on error loses BindingResult
if (br.hasErrors()) return "redirect:/users/new";
// RIGHT: return the view name so errors and values are shown
if (br.hasErrors()) return "user-form";

// OUTPUT:
// RIGHT -> the page shows "must not be blank" next to the field`],
        [`<p>Performance and robustness:</p><ul><li>Avoid database checks in plain annotations; do uniqueness checks in the service and add the error with <code>br.rejectValue</code>.</li><li>Guard against double submit with Post/Redirect/Get and a disabled button.</li><li>Cache lookup lists for select boxes.</li></ul>`,
            r`if (userRepo.existsByEmail(form.getEmail())) {
    br.rejectValue("email", "duplicate", "Email already registered");
    return "user-form";
}

// OUTPUT:
// duplicate email -> 200 user-form with the message under the email field`],
        [`<p>Scenario: user registration.</p><ul><li>Form class with name, email, password and confirm password.</li><li>Controller validates, checks for duplicates, hashes the password and redirects to login.</li><li>MockMvc tests cover valid, invalid and duplicate cases.</li></ul>`,
            r`mvc.perform(post("/register").with(csrf())
        .param("name", "Abaji").param("email", "abaji@x.com")
        .param("password", "secret123").param("confirm", "secret123"))
   .andExpect(status().is3xxRedirection())
   .andExpect(redirectedUrl("/login"));

// OUTPUT:
// Tests run: 1, Failures: 0`]
    )
};
