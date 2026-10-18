// Spring extras, batch smvc26 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc26Extras: Record<string, Extra> = {
    'mvc-spring-mvc-themes': x(
        ['<b>Theme</b> means a named set of static resources (CSS, images) that changes the look of a page without changing its logic. Classic Spring MVC (5.x) had built-in theme support for this.',
            '<b>Three pieces</b> made it work: a <code>ThemeSource</code> (finds the theme properties), a <code>ThemeResolver</code> (picks the theme per request) and a <code>ThemeChangeInterceptor</code> (switches it from a request parameter).',
            '<b>Important</b>: built-in theme support was removed in Spring Framework 6.0, so on Spring Boot 3 you use CSS variables, a cookie and a template attribute instead.'],
        ['<b>Properties file</b>: in 5.x a theme was a file such as <code>dark.properties</code> that mapped keys like <code>styleSheet</code> to a CSS path.',
            '<b>View side</b>: JSP used the <code>spring:theme</code> tag, which looked the key up for the current theme and printed the value.',
            '<b>Modern replacement</b>: ship one stylesheet that reads CSS custom properties, and set <code>data-theme</code> on the html element.'],
        ['<b>Migration</b>: when upgrading from Spring 5 to 6, delete the theme beans and the interceptor, or the application fails to compile.',
            '<b>Persistence</b>: store the choice in a cookie (anonymous users) or in the user profile (logged-in users), not in the session only.',
            '<b>Caching</b>: if the server renders the theme into the HTML, add <code>Vary: Cookie</code> or the shared cache serves the wrong theme.'],
        [['F', 'What is a theme in a web application?', 'A named set of styles and images that changes the appearance of the pages while the behavior stays the same.'],
            ['F', 'Does Spring Boot 3 have built-in themes?', 'No. Theme support was removed in Spring Framework 6.0, so you implement it with CSS and a cookie.'],
            ['M', 'Which three types formed Spring 5 theme support?', 'ThemeSource, ThemeResolver and ThemeChangeInterceptor.'],
            ['M', 'How do you switch the theme in modern Spring MVC?', 'Read a cookie or a request parameter in a controller or advice, put the value in the model and render it as data-theme.'],
            ['S', 'Why is a client-side theme better for caching?', 'The HTML stays identical for everyone, so it can be cached, and a small script applies the stored preference.'],
            ['S', 'How would you avoid a flash of the wrong theme?', 'Set the attribute from an inline script in the head before first paint, or render it on the server from the cookie.']],
        [['Legacy Spring 5 configuration (for reading old code).',
            r`// Spring Framework 5.x only. Removed in 6.0.
@Configuration
public class LegacyThemeConfig implements WebMvcConfigurer {
    @Bean
    public ThemeResolver themeResolver() {
        CookieThemeResolver r = new CookieThemeResolver();
        r.setDefaultThemeName("light");
        return r;
    }
    @Override
    public void addInterceptors(InterceptorRegistry reg) {
        ThemeChangeInterceptor i = new ThemeChangeInterceptor();
        i.setParamName("theme");
        reg.addInterceptor(i);
    }
}

// OUTPUT:
// GET /home?theme=dark  -> cookie "theme=dark" is set
// next requests render with the dark theme`],
            ['Modern theme with CSS variables.',
                r`/* app.css */
:root {
    --bg: #ffffff;
    --fg: #1a1a1a;
}
:root[data-theme="dark"] { --bg: #121212; --fg: #eeeeee; }
body {
    background: var(--bg);
    color: var(--fg);
}

// OUTPUT:
// <html data-theme="dark"> shows a dark page
// <html data-theme="light"> shows a light page`]],
        [['Controller that reads the theme cookie.',
            r`@ControllerAdvice
public class ThemeAdvice {
    @ModelAttribute("theme")
    public String theme(@CookieValue(name = "theme",
                                     defaultValue = "light") String t) {
        return t.equals("dark") ? "dark" : "light";   // whitelist
    }
}

// OUTPUT:
// no cookie      -> model theme = light
// cookie=dark    -> model theme = dark
// cookie=hacker  -> model theme = light`],
            ['Testing the model attribute.',
                r`@WebMvcTest(HomeController.class)
class ThemeTest {
    @Autowired MockMvc mvc;

    @Test
    void usesCookie() throws Exception {
        mvc.perform(get("/home").cookie(new Cookie("theme", "dark")))
           .andExpect(model().attribute("theme", "dark"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-themeresolver': x(
        ['<b>ThemeResolver</b> is the Spring 5 interface that answers one question per request: which theme name is active? It has <code>resolveThemeName</code> and <code>setThemeName</code>.',
            '<b>Implementations</b>: <code>FixedThemeResolver</code> (always one theme), <code>SessionThemeResolver</code> (stores it in the session) and <code>CookieThemeResolver</code> (stores it in a cookie).',
            '<b>Bean name</b>: the <code>DispatcherServlet</code> looked for a bean named <code>themeResolver</code>; it was removed in Spring Framework 6.0.'],
        ['<b>Fixed</b> is the default and is fine for a site with a single look.',
            '<b>Session</b> loses the choice when the session ends, while <b>cookie</b> remembers it across visits.',
            '<b>Same idea as LocaleResolver</b>: the resolver reads the request and returns a small value; the interceptor changes it.'],
        ['<b>Custom resolver</b>: implement the interface to pick the theme from the user profile or from the subdomain.',
            '<b>Thread safety</b>: resolvers are singletons, so keep no per-request state in fields.',
            '<b>Today</b>: write a small <code>HandlerInterceptor</code> or a <code>@ControllerAdvice</code> that returns the same decision.'],
        [['F', 'What does a ThemeResolver do?', 'It decides which theme name applies to the current request.'],
            ['F', 'Name its implementations.', 'FixedThemeResolver, SessionThemeResolver and CookieThemeResolver.'],
            ['M', 'Which resolver survives a browser restart?', 'CookieThemeResolver, if the cookie has a max age.'],
            ['M', 'How is it similar to LocaleResolver?', 'Both read request state to return a per-request value and both can be changed by an interceptor.'],
            ['S', 'Why must a resolver be stateless?', 'One instance serves all threads, so fields would be shared between users.'],
            ['S', 'What replaces it in Spring 6?', 'Your own component: a cookie reader in an advice or interceptor that exposes the theme to the view.']],
        [['Legacy resolver beans (Spring 5).',
            r`// Spring Framework 5.x
@Bean
public ThemeResolver themeResolver() {
    SessionThemeResolver r = new SessionThemeResolver();
    r.setDefaultThemeName("light");
    return r;
}

// OUTPUT:
// first request  -> theme "light"
// after ?theme=dark -> theme "dark" for that session`],
            ['Own resolver as a plain class (works in Spring 6).',
                r`@Component
public class ThemeCookieResolver {
    private static final Set<String> ALLOWED = Set.of("light", "dark");

    public String resolve(HttpServletRequest req) {
        if (req.getCookies() == null) return "light";
        for (Cookie c : req.getCookies()) {
            if (c.getName().equals("theme") && ALLOWED.contains(c.getValue()))
                return c.getValue();
        }
        return "light";
    }
}

// OUTPUT:
// cookie theme=dark  -> dark
// no cookie          -> light`]],
        [['Setting the cookie.',
            r`@GetMapping("/theme/{name}")
public ResponseEntity<Void> set(@PathVariable String name) {
    if (!Set.of("light", "dark").contains(name))
        return ResponseEntity.badRequest().build();
    ResponseCookie c = ResponseCookie.from("theme", name)
            .path("/").maxAge(Duration.ofDays(365)).sameSite("Lax").build();
    return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, c.toString()).build();
}

// OUTPUT:
// GET /theme/dark -> 204 No Content
// Set-Cookie: theme=dark; Max-Age=31536000; Path=/; SameSite=Lax`],
            ['Testing the endpoint.',
                r`@Test
void rejectsUnknown() throws Exception {
    mvc.perform(get("/theme/neon")).andExpect(status().isBadRequest());
    mvc.perform(get("/theme/dark"))
       .andExpect(cookie().value("theme", "dark"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-themesource': x(
        ['<b>ThemeSource</b> is the Spring 5 interface that turns a theme name into a <code>Theme</code> object, which holds a <code>MessageSource</code> with the theme keys.',
            '<b>Default implementation</b>: <code>ResourceBundleThemeSource</code>, which loads a properties file named after the theme, such as <code>dark.properties</code>.',
            '<b>Removed</b> in Spring Framework 6.0 together with the other theme classes.'],
        ['<b>Theme file</b> content looked like <code>styleSheet=/css/dark.css</code>; the key names were chosen by the application.',
            '<b>Lookup</b>: the view tag asked the <code>Theme</code> for a key and the bundle returned the value for the active theme name.',
            '<b>Basename prefix</b>: <code>setBasenamePrefix("themes.")</code> placed the files in a package or folder.'],
        ['<b>Resolver plus source</b>: the resolver gives the name, the source gives the values; they were deliberately separate.',
            '<b>Replacement</b>: a plain properties class bound with <code>@ConfigurationProperties</code>, or a map of theme name to CSS path.',
            '<b>Static content</b>: with CSS variables you need no per-theme lookup at runtime.'],
        [['F', 'What does ThemeSource return?', 'A Theme object for a given theme name.'],
            ['F', 'Which class implemented it by default?', 'ResourceBundleThemeSource.'],
            ['M', 'What did a theme properties file contain?', 'Keys such as styleSheet that map to resource paths or text.'],
            ['M', 'Why separate ThemeSource from ThemeResolver?', 'The resolver answers which theme, the source answers what that theme contains.'],
            ['S', 'How would you reproduce it in Spring Boot 3?', 'Bind a map of theme names to asset paths with @ConfigurationProperties and expose it to the view.'],
            ['S', 'Is the lookup safe for user input?', 'Only if the theme name is checked against a whitelist, because it picks a file or key.']],
        [['Legacy source bean (Spring 5).',
            r`// Spring Framework 5.x
@Bean
public ThemeSource themeSource() {
    ResourceBundleThemeSource s = new ResourceBundleThemeSource();
    s.setBasenamePrefix("themes.");
    return s;
}
// themes/dark.properties:  styleSheet=/css/dark.css

// OUTPUT:
// theme "dark" -> styleSheet = /css/dark.css`],
            ['Modern version with configuration properties.',
                r`@ConfigurationProperties(prefix = "app")
public record ThemeProps(Map<String, String> themes) {}

# application.yml
# app:
#   themes:
#     light: /css/light.css
#     dark: /css/dark.css

// OUTPUT:
// themes() -> {light=/css/light.css, dark=/css/dark.css}`]],
        [['Using the properties.',
            r`@ControllerAdvice
public class ThemeAssets {
    private final ThemeProps props;
    public ThemeAssets(ThemeProps props) { this.props = props; }

    @ModelAttribute("themeCss")
    public String css(@CookieValue(defaultValue = "light") String theme) {
        return props.themes().getOrDefault(theme, props.themes().get("light"));
    }
}

// OUTPUT:
// cookie theme=dark -> themeCss = /css/dark.css`],
            ['Test with a property override.',
                r`@SpringBootTest(properties = {
    "app.themes.light=/css/l.css", "app.themes.dark=/css/d.css"})
class ThemePropsTest {
    @Autowired ThemeProps props;
    @Test void loads() {
        assertEquals("/css/d.css", props.themes().get("dark"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-theme-configuration': x(
        ['<b>Theme configuration</b> is wiring the pieces together: a theme source, a resolver, an interceptor, and the theme files. In Spring 5 this was Java config or XML; Spring 6 removed the classes.',
            '<b>Order of setup</b>: register the <code>ThemeResolver</code> bean, add the <code>ThemeChangeInterceptor</code> through <code>WebMvcConfigurer</code>, and put the theme properties on the classpath.',
            '<b>Modern setup</b>: one CSS file with variables, a cookie, and a few lines in a <code>@ControllerAdvice</code>.'],
        ['<b>Bean names</b> mattered: <code>themeResolver</code> and <code>themeSource</code> were found by name in the web application context.',
            '<b>Interceptor param</b>: <code>setParamName("theme")</code> chose the request parameter, with <code>?theme=dark</code> as the usual call.',
            '<b>Spring Boot</b> never auto-configured themes, so you always added them by hand.'],
        ['<b>Validate input</b>: a theme name from the URL must be checked against known values before it is stored.',
            '<b>Cookie flags</b>: set <code>Path</code>, <code>Max-Age</code> and <code>SameSite</code>; a theme cookie holds no secret, so it needs no HttpOnly if the script reads it.',
            '<b>Testing</b>: use MockMvc with a cookie and assert the model or the rendered attribute.'],
        [['F', 'What do you need to configure themes in Spring 5?', 'A ThemeSource, a ThemeResolver, a ThemeChangeInterceptor and theme properties files.'],
            ['F', 'Where is the interceptor registered?', 'In addInterceptors of a WebMvcConfigurer.'],
            ['M', 'Why do the bean names matter?', 'The DispatcherServlet looks up themeResolver by name in the context.'],
            ['M', 'What is the simplest modern configuration?', 'An allowed-values set, a cookie and a data-theme attribute set by an advice.'],
            ['S', 'How do you guard against a bad theme value?', 'Compare it with a whitelist and fall back to the default.'],
            ['S', 'How do you make the setting configurable per environment?', 'Use @ConfigurationProperties for the default theme and the allowed list.']],
        [['Modern configuration class.',
            r`@ConfigurationProperties(prefix = "app.theme")
public record ThemeSettings(String defaultName, Set<String> allowed) {}

@Configuration
@EnableConfigurationProperties(ThemeSettings.class)
public class ThemeConfig {}

# application.yml
# app.theme.default-name: light
# app.theme.allowed: light,dark,contrast

// OUTPUT:
// ThemeSettings[defaultName=light, allowed=[light, dark, contrast]]`],
            ['Interceptor that sets the cookie from a parameter.',
                r`public class ThemeInterceptor implements HandlerInterceptor {
    private final ThemeSettings s;
    public ThemeInterceptor(ThemeSettings s) { this.s = s; }

    @Override
    public boolean preHandle(HttpServletRequest req,
                             HttpServletResponse res, Object h) {
        String t = req.getParameter("theme");
        if (t != null && s.allowed().contains(t)) {
            Cookie c = new Cookie("theme", t);
            c.setPath("/");
            c.setMaxAge(31536000);
            res.addCookie(c);
        }
        return true;
    }
}

// OUTPUT:
// GET /?theme=dark  -> Set-Cookie: theme=dark
// GET /?theme=evil  -> no cookie set`]],
        [['Registering the interceptor.',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final ThemeSettings settings;
    public WebConfig(ThemeSettings settings) { this.settings = settings; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ThemeInterceptor(settings));
    }
}

// OUTPUT:
// the interceptor runs before every controller method`],
            ['Test the configuration.',
                r`@Test
void setsCookieForAllowed() throws Exception {
    mvc.perform(get("/home").param("theme", "dark"))
       .andExpect(cookie().value("theme", "dark"));
    mvc.perform(get("/home").param("theme", "evil"))
       .andExpect(cookie().doesNotExist("theme"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-dynamic-themes': x(
        ['<b>Dynamic theme</b> means the user can change the look at runtime, for example with a dark mode toggle, and the choice is remembered.',
            '<b>Flow</b>: the user clicks a toggle, the browser or server stores the name in a cookie, and the next page renders with that name on the html element.',
            '<b>Two styles</b>: client-side (JavaScript and <code>localStorage</code>) and server-side (cookie read by a <code>@ControllerAdvice</code>).'],
        ['<b>CSS variables</b> let one stylesheet serve every theme; only the values under <code>[data-theme]</code> change.',
            '<b>prefers-color-scheme</b>: use the media query as the default when the user has not chosen yet.',
            '<b>Legacy way</b>: <code>?theme=dark</code> handled by <code>ThemeChangeInterceptor</code> in Spring 5.'],
        ['<b>Flash of wrong theme</b>: render the attribute on the server or set it from an inline script before the page paints.',
            '<b>Caching</b>: server-rendered themes need <code>Vary: Cookie</code>; a client-side toggle keeps the HTML cacheable.',
            '<b>User profile</b>: for logged-in users save the theme in the database so it follows them across devices.'],
        [['F', 'What is a dynamic theme?', 'A theme the user can switch at runtime, with the choice remembered.'],
            ['F', 'Where can the choice be stored?', 'In a cookie, localStorage, the session or the user profile.'],
            ['M', 'Why use CSS variables for themes?', 'One stylesheet serves all themes and switching needs only a changed attribute.'],
            ['M', 'How do you set a default from the operating system?', 'Use the prefers-color-scheme media query when no choice is stored.'],
            ['S', 'How do you avoid a flash of the wrong theme?', 'Set data-theme before first paint, from the server-rendered value or an inline head script.'],
            ['S', 'What breaks when the theme is rendered on the server?', 'Shared caches may serve one user page to another, so add Vary: Cookie or do it on the client.']],
        [['Toggle endpoint and cookie.',
            r`@PostMapping("/theme")
public ResponseEntity<Void> toggle(@RequestParam String name) {
    if (!Set.of("light", "dark").contains(name))
        return ResponseEntity.badRequest().build();
    ResponseCookie c = ResponseCookie.from("theme", name)
            .path("/").maxAge(Duration.ofDays(365)).build();
    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, c.toString())
            .build();
}

// OUTPUT:
// POST /theme?name=dark -> 200 OK, Set-Cookie: theme=dark`],
            ['Client-side switch.',
                r`<script>
  const saved = localStorage.getItem("theme");
  const sys = matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = saved || (sys ? "dark" : "light");
  function toggle() {
    const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
  }
</script>

// OUTPUT:
// first visit on a dark OS -> data-theme="dark"
// after toggle()          -> data-theme="light", saved for next visit`]],
        [['Server-rendered attribute with Thymeleaf attribute th:attr (no expressions shown).',
            r`@ControllerAdvice
public class ThemeAdvice {
    @ModelAttribute("theme")
    String theme(@CookieValue(defaultValue = "light") String theme) {
        return theme.equals("dark") ? "dark" : "light";
    }
}
// template: <html th:data-theme="$` + r`{theme}
">

// OUTPUT:
// cookie theme=dark -> <html data-theme="dark">`],
            ['Test the toggle.',
                r`@Test
void togglePersists() throws Exception {
    mvc.perform(post("/theme").param("name", "dark"))
       .andExpect(status().isOk())
       .andExpect(cookie().value("theme", "dark"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-content-negotiation-negotiation': x(
        ['<b>Content negotiation</b> is how the server and client agree on the representation of a resource, such as JSON or XML, for one URL.',
            '<b>Strategies</b>: Spring MVC looks at the <code>Accept</code> header first. Older options were a path extension or a query parameter, and the parameter strategy is still available if you enable it.',
            '<b>Who does it</b>: <code>ContentNegotiationManager</code> picks the media types, and an <code>HttpMessageConverter</code> writes the body.'],
        ['<b>produces</b> on <code>@GetMapping</code> lists what a method can return, and <code>consumes</code> lists what it accepts.',
            '<b>Failure codes</b>: <code>406 Not Acceptable</code> when nothing matches the Accept header; <code>415 Unsupported Media Type</code> when the request body type is not accepted.',
            '<b>Default</b>: Spring Boot registers a Jackson JSON converter, so JSON is returned unless you add an XML converter.'],
        ['<b>Quality values</b>: <code>Accept: application/xml;q=0.9, application/json</code> ranks types; the highest q wins.',
            '<b>Vary</b>: responses that depend on Accept should send <code>Vary: Accept</code> for correct caching.',
            '<b>Configure</b> with <code>configureContentNegotiation</code> in <code>WebMvcConfigurer</code>, or Boot properties under <code>spring.mvc.contentnegotiation</code>.'],
        [['F', 'What is content negotiation?', 'The client and server agreeing on the media type of the response, such as JSON or XML.'],
            ['F', 'Which header carries the client wish?', 'The Accept header.'],
            ['M', 'What status is returned if no type matches?', '406 Not Acceptable.'],
            ['M', 'What does produces do on a mapping?', 'It narrows the mapping to requests whose Accept matches and sets the response Content-Type.'],
            ['S', 'Which component chooses the final media type?', 'ContentNegotiationManager, using its strategies, and then the matching HttpMessageConverter writes the body.'],
            ['S', 'How do you add XML support in Boot?', 'Add jackson-dataformat-xml to the classpath so the XML converter is registered.']],
        [['One method, two formats.',
            r`@RestController
public class UserController {
    @GetMapping(value = "/users/1",
                produces = { "application/json", "application/xml" })
    public User one() { return new User(1, "Abaji"); }
}
public record User(int id, String name) {}

// OUTPUT:
// Accept: application/json -> {"id":1,"name":"Abaji"}
// Accept: application/xml  -> <User><id>1</id><name>Abaji</name></User>
// Accept: text/csv         -> 406 Not Acceptable`],
            ['Configuring defaults.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(
            ContentNegotiationConfigurer c) {
        c.defaultContentType(MediaType.APPLICATION_JSON)
         .favorParameter(true).parameterName("format")
         .mediaType("json", MediaType.APPLICATION_JSON)
         .mediaType("xml", MediaType.APPLICATION_XML);
    }
}

// OUTPUT:
// GET /users/1?format=xml -> XML body
// GET /users/1 (no Accept) -> JSON body`]],
        [['Reading the negotiated type in a test.',
            r`@WebMvcTest(UserController.class)
class NegotiationTest {
    @Autowired MockMvc mvc;

    @Test
    void json() throws Exception {
        mvc.perform(get("/users/1").accept(MediaType.APPLICATION_JSON))
           .andExpect(content().contentTypeCompatibleWith("application/json"))
           .andExpect(jsonPath("$.name").value("Abaji"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['406 test.',
                r`@Test
void notAcceptable() throws Exception {
    mvc.perform(get("/users/1").accept("text/csv"))
       .andExpect(status().isNotAcceptable());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-json-vs-xml': x(
        ['<b>JSON</b> (JavaScript Object Notation) is a light text format of objects, arrays, strings, numbers and booleans. <b>XML</b> is a tag-based format with attributes, namespaces and schemas.',
            '<b>Spring support</b>: JSON through Jackson (<code>MappingJackson2HttpMessageConverter</code>), XML through <code>jackson-dataformat-xml</code> or JAXB.',
            '<b>Default choice</b>: JSON for web and mobile APIs because it is shorter and maps easily to objects; XML where partners or standards (SOAP, SAML, some banking APIs) require it.'],
        ['<b>Size</b>: the same data is usually smaller in JSON, since XML repeats closing tags.',
            '<b>Features</b>: XML has attributes, comments, namespaces and XSD validation; JSON has none of these but has native arrays and numbers.',
            '<b>Annotations</b>: <code>@JsonProperty</code> and <code>@JacksonXmlProperty</code> rename fields for each format.'],
        ['<b>Security</b>: XML parsers need XXE protection (disable external entities); JSON parsers need limits on depth and size.',
            '<b>Same model</b>: one record can serve both formats, so content negotiation decides at runtime.',
            '<b>Evolution</b>: ignore unknown properties (<code>FAIL_ON_UNKNOWN_PROPERTIES</code> off, Boot default) to keep clients compatible.'],
        [['F', 'Which format is more common for REST APIs?', 'JSON.'],
            ['F', 'Name one place XML is still used.', 'SOAP services, SAML, configuration files and some enterprise integrations.'],
            ['M', 'Which library gives XML support in Boot?', 'jackson-dataformat-xml on the classpath.'],
            ['M', 'How do you rename a field in JSON?', 'With @JsonProperty on the field or accessor.'],
            ['S', 'What is the XXE risk?', 'An XML document can reference external entities that read local files or call internal URLs, so disable them in the parser.'],
            ['S', 'How can one endpoint serve both?', 'List both types in produces and let the Accept header choose the converter.']],
        [['Same record in both formats.',
            r`public record Book(
    @JsonProperty("isbn") String isbn,
    String title,
    double price) {}

@GetMapping(value = "/book", produces = { "application/json", "application/xml" })
public Book book() { return new Book("111", "Spring", 29.5); }

// OUTPUT:
// JSON: {"isbn":"111","title":"Spring","price":29.5}
// XML : <Book><isbn>111</isbn><title>Spring</title><price>29.5</price></Book>`],
            ['XML attribute.',
                r`public class Item {
    @JacksonXmlProperty(isAttribute = true)
    private int id = 7;
    private String name = "Pen";
    public int getId() { return id; }
    public String getName() { return name; }
}

// OUTPUT:
// XML : <Item id="7"><name>Pen</name></Item>
// JSON: {"id":7,"name":"Pen"}`]],
        [['Parsing with a small test.',
            r`@Test
void both() throws Exception {
    mvc.perform(get("/book").accept("application/xml"))
       .andExpect(xpath("/Book/title").string("Spring"));
    mvc.perform(get("/book").accept("application/json"))
       .andExpect(jsonPath("$.title").value("Spring"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Hardening XML input (JAXB style factory).',
                r`DocumentBuilderFactory f = DocumentBuilderFactory.newInstance();
f.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
f.setXIncludeAware(false);
f.setExpandEntityReferences(false);

// OUTPUT:
// a document with a DOCTYPE or external entity is rejected
// with a parse exception`]]
    ),
    'mvc-accept-header-negotiation': x(
        ['<b>Accept header</b> is a request header where the client lists the media types it can handle, for example <code>Accept: application/json</code>.',
            '<b>Spring behavior</b>: <code>HeaderContentNegotiationStrategy</code> reads it and the handler mapping matches it against <code>produces</code>; this is the default strategy.',
            '<b>Result</b>: a match gives the body in that type; no match gives <code>406 Not Acceptable</code>.'],
        ['<b>Quality factor</b>: <code>q</code> values from 0 to 1 rank types; a missing q means 1.',
            '<b>Wildcards</b>: <code>*/*</code> and <code>application/*</code> match many types; browsers usually send a long list ending in <code>*/*</code>.',
            '<b>Accept vs Content-Type</b>: Accept describes the response you want; Content-Type describes the body you send.'],
        ['<b>Most specific wins</b> at the same q, so <code>application/json</code> beats <code>application/*</code>.',
            '<b>Order of produces</b>: if the client accepts <code>*/*</code>, the first type in your <code>produces</code> list is used.',
            '<b>Errors</b>: a custom <code>@ExceptionHandler</code> for <code>HttpMediaTypeNotAcceptableException</code> should return a type the client accepts, or a plain text fallback.'],
        [['F', 'What is the Accept header?', 'A request header listing the media types the client can accept in the response.'],
            ['F', 'What happens when nothing matches?', 'Spring returns 406 Not Acceptable.'],
            ['M', 'What does q=0.5 mean?', 'A relative preference weight; higher q means a more wanted type.'],
            ['M', 'What is chosen for Accept: */*?', 'The first type in the mapping produces list, or the default converter type.'],
            ['S', 'Which exception is thrown on mismatch?', 'HttpMediaTypeNotAcceptableException, handled by the default exception resolver.'],
            ['S', 'Why send Vary: Accept?', 'So caches store a separate copy per Accept value and do not return JSON to an XML client.']],
        [['Two methods, one URL, different produces.',
            r`@RestController
@RequestMapping("/report")
public class ReportController {
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Integer> json() { return Map.of("total", 5); }

    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public String text() { return "total=5"; }
}

// OUTPUT:
// Accept: application/json -> {"total":5}
// Accept: text/plain       -> total=5
// Accept: image/png        -> 406 Not Acceptable`],
            ['Weighted Accept.',
                r`// curl -H "Accept: application/xml;q=0.5, application/json;q=0.9" /users/1
// Spring picks application/json (q=0.9 beats q=0.5)

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json
// {"id":1,"name":"Abaji"}`]],
        [['Reading the header manually.',
            r`@GetMapping("/echo")
public String echo(@RequestHeader(value = "Accept", defaultValue = "*/*")
                   String accept) {
    return "client accepts: " + accept;
}

// OUTPUT:
// GET /echo with Accept: text/html -> client accepts: text/html`],
            ['Test with MockMvc.',
                r`@Test
void picksByAccept() throws Exception {
    mvc.perform(get("/report").accept(MediaType.TEXT_PLAIN))
       .andExpect(content().string("total=5"));
    mvc.perform(get("/report").accept(MediaType.IMAGE_PNG))
       .andExpect(status().isNotAcceptable());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-content-type': x(
        ['<b>Content-Type</b> is a header that tells the receiver the media type of the body, such as <code>application/json</code> or <code>multipart/form-data</code>. It is sent on a request that has a body and on every response with a body.',
            '<b>Request side</b>: Spring picks the <code>HttpMessageConverter</code> that reads the body into your <code>@RequestBody</code> parameter based on it.',
            '<b>Mapping</b>: <code>consumes</code> on <code>@PostMapping</code> restricts accepted types; a wrong type gives <code>415 Unsupported Media Type</code>.'],
        ['<b>Response side</b>: <code>produces</code> or <code>ResponseEntity.contentType(...)</code> sets the response Content-Type, and the charset is added for text types.',
            '<b>Common types</b>: <code>application/json</code>, <code>application/xml</code>, <code>application/x-www-form-urlencoded</code>, <code>multipart/form-data</code>, <code>text/plain</code>.',
            '<b>Not the same as Accept</b>: Content-Type describes what is being sent; Accept describes what is wanted back.'],
        ['<b>Missing header</b>: a POST with a JSON body but no Content-Type fails with 415 on a <code>consumes</code> mapping.',
            '<b>Charset</b>: JSON is UTF-8 by default; do not rely on <code>ISO-8859-1</code> defaults for text types.',
            '<b>Security</b>: <code>X-Content-Type-Options: nosniff</code> stops browsers from guessing a different type for your response.'],
        [['F', 'What does Content-Type say?', 'The media type of the message body.'],
            ['F', 'Which status means the body type is not supported?', '415 Unsupported Media Type.'],
            ['M', 'How do you limit an endpoint to JSON input?', 'Use consumes = application/json on the mapping.'],
            ['M', 'Difference between Content-Type and Accept?', 'Content-Type is the type of what you send; Accept is the type you want to receive.'],
            ['S', 'How does Spring read a JSON body?', 'RequestResponseBodyMethodProcessor selects a converter that can read the Content-Type and the target class, here Jackson.'],
            ['S', 'Why add nosniff?', 'To stop content sniffing, where a browser treats a response as a different, possibly executable, type.']],
        [['consumes and produces together.',
            r`@PostMapping(value = "/orders",
             consumes = MediaType.APPLICATION_JSON_VALUE,
             produces = MediaType.APPLICATION_JSON_VALUE)
public Order create(@RequestBody Order o) { return o; }
public record Order(int id, String item) {}

// OUTPUT:
// Content-Type: application/json, body {"id":1,"item":"pen"} -> 200
// Content-Type: text/plain                                   -> 415`],
            ['Setting the response type.',
                r`@GetMapping("/data.csv")
public ResponseEntity<String> csv() {
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("text/csv"))
        .header("X-Content-Type-Options", "nosniff")
        .body("id,name\n1,Abaji\n");
}

// OUTPUT:
// HTTP/1.1 200
// Content-Type: text/csv
// X-Content-Type-Options: nosniff`]],
        [['Test the 415.',
            r`@Test
void wrongType() throws Exception {
    mvc.perform(post("/orders").contentType(MediaType.TEXT_PLAIN)
            .content("hello"))
       .andExpect(status().isUnsupportedMediaType());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Sending JSON from a client.',
                r`HttpHeaders h = new HttpHeaders();
h.setContentType(MediaType.APPLICATION_JSON);
HttpEntity<String> req = new HttpEntity<>("{\"id\":1,\"item\":\"pen\"}", h);
ResponseEntity<String> res =
    new RestTemplate().postForEntity("http://localhost:8080/orders", req, String.class);
System.out.println(res.getStatusCode());

// OUTPUT:
// 200 OK`]]
    ),
    'mvc-url-based-content-negotiation': x(
        ['<b>URL-based negotiation</b> chooses the representation from the URL instead of the Accept header: a path extension such as <code>/users.json</code>, or a parameter such as <code>?format=xml</code>.',
            '<b>Current status</b>: since Spring 5.3 the path extension strategy is off and deprecated; the <b>parameter strategy</b> is still supported if you enable it.',
            '<b>Why use it</b>: it is easy to try in a browser address bar, where you cannot set an Accept header.'],
        ['<b>Enable the parameter</b>: <code>favorParameter(true)</code> or the Boot property <code>spring.mvc.contentnegotiation.favor-parameter=true</code>.',
            '<b>Name and mapping</b>: <code>parameterName("format")</code> and <code>mediaType("xml", APPLICATION_XML)</code> bind keywords to types.',
            '<b>Order</b>: strategies are tried in order, parameter first, then the header.'],
        ['<b>Cache and links</b>: each format has its own URL, which is easy to cache and share, unlike the header approach.',
            '<b>REST purity</b>: the same resource having several URLs is debated; many teams keep the header as the main method and the parameter only as a helper.',
            '<b>Extension risk</b>: suffix patterns caused security problems (reflected file download), which is why they were removed.'],
        [['F', 'What is URL-based negotiation?', 'Choosing the response format from the URL, for example a format parameter.'],
            ['F', 'Give an example URL.', '/users/1?format=xml.'],
            ['M', 'Is the path extension still supported?', 'No. It was deprecated in 5.3 and is disabled by default; use a parameter or the header.'],
            ['M', 'How do you enable the parameter strategy in Boot?', 'Set spring.mvc.contentnegotiation.favor-parameter to true.'],
            ['S', 'What if both the parameter and the header are present?', 'The parameter strategy is consulted first, so it wins.'],
            ['S', 'What was the security issue with extensions?', 'Reflected file download: an attacker crafted a URL with an extension that made a browser treat a response as an executable file.']],
        [['Boot properties.',
            r`# application.properties
spring.mvc.contentnegotiation.favor-parameter=true
spring.mvc.contentnegotiation.parameter-name=format
spring.mvc.contentnegotiation.media-types.xml=application/xml
spring.mvc.contentnegotiation.media-types.json=application/json

# OUTPUT:
# GET /users/1?format=xml  -> XML
# GET /users/1?format=json -> JSON`],
            ['Java configuration.',
                r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.favorParameter(true)
     .parameterName("format")
     .ignoreAcceptHeader(false)
     .defaultContentType(MediaType.APPLICATION_JSON)
     .mediaType("xml", MediaType.APPLICATION_XML)
     .mediaType("json", MediaType.APPLICATION_JSON);
}

// OUTPUT:
// ?format=xml wins over Accept: application/json
// no parameter and no Accept -> JSON`]],
        [['Test the parameter.',
            r`@Test
void byParameter() throws Exception {
    mvc.perform(get("/users/1").param("format", "xml"))
       .andExpect(content().contentTypeCompatibleWith("application/xml"));
    mvc.perform(get("/users/1").param("format", "json"))
       .andExpect(content().contentTypeCompatibleWith("application/json"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Unknown format value.',
                r`@Test
void unknownFormat() throws Exception {
    mvc.perform(get("/users/1").param("format", "yaml"))
       .andExpect(status().isNotAcceptable());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0
// (a format keyword that is not registered gives 406)`]]
    )
};

export const smvc26Deep: Record<string, Deep> = {
    'mvc-spring-mvc-themes': dv(
        [`<p>How theme support worked in Spring 5 and what replaces it.</p><ul><li><b>Request flow:</b> <code>DispatcherServlet</code> called the <code>ThemeResolver</code> bean in <code>doService</code> and stored it as a request attribute.</li><li><b>View access:</b> the <code>spring:theme</code> tag used the resolver and the <code>ThemeSource</code> to get a <code>Theme</code> and then the message for a key.</li><li><b>Removal:</b> Spring Framework 6.0 removed these classes, so a Boot 3 app has no such beans.</li><li><b>Now:</b> the choice is a plain request or cookie value that you expose to the view.</li></ul>`,
            r`// Spring 5 (internal idea, simplified)
// request.setAttribute(THEME_RESOLVER_ATTRIBUTE, themeResolver);
// Theme theme = RequestContextUtils.getTheme(request);
// String css = theme.getMessageSource().getMessage("styleSheet", null, locale);

// Spring 6: no framework class; this is your own code
String name = cookieValueOrDefault(request, "theme", "light");
model.addAttribute("theme", name);

// OUTPUT:
// Spring 5: css = /css/dark.css (from dark.properties)
// Spring 6: model theme = dark`],
        [`<p>Variants available today:</p><ul><li><b>CSS variables + data-theme:</b> the simplest and fastest.</li><li><b>Separate stylesheets:</b> <code>link</code> to <code>light.css</code> or <code>dark.css</code> chosen on the server.</li><li><b>Class on body:</b> a <code>theme-dark</code> class, easy to combine with utility CSS.</li><li><b>Per-tenant themes:</b> pick the stylesheet from the subdomain or tenant record.</li></ul>`,
            r`/* one file, three themes */
:root {
    --bg:#fff;
    --fg:#111;
    --accent:#0a6;
}
:root[data-theme="dark"] { --bg:#111; --fg:#eee; --accent:#4c8; }
:root[data-theme="contrast"] { --bg:#000; --fg:#ff0; --accent:#0ff; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
      --bg:#111;
      --fg:#eee;
      --accent:#4c8;
  }
}

// OUTPUT:
// no data-theme + dark OS  -> dark colors
// data-theme="contrast"    -> yellow on black`],
        [`<p>Typical mistakes:</p><ul><li><b>Keeping Spring 5 theme beans</b> after the upgrade: the classes are gone, so remove them.</li><li><b>Trusting the cookie value</b> and writing it into HTML or a file path: whitelist it.</li><li><b>Duplicating CSS</b> for every theme instead of using variables.</li><li><b>Theme only in session:</b> the user loses it on logout or timeout.</li></ul>`,
            r`// WRONG: file path built from user input (path traversal risk)
// String css = "/css/" + cookieTheme + ".css";

// RIGHT: whitelist, then map
private static final Map<String, String> CSS =
    Map.of("light", "/css/light.css", "dark", "/css/dark.css");
String css = CSS.getOrDefault(cookieTheme, CSS.get("light"));

// OUTPUT:
// cookie "../../etc/passwd" -> /css/light.css`],
        [`<p>Performance and tuning:</p><ul><li><b>Static assets:</b> serve CSS with long cache headers and a content hash in the name.</li><li><b>One stylesheet</b> for all themes means one request and one cache entry.</li><li><b>Server-rendered theme:</b> adds <code>Vary: Cookie</code>, which lowers shared cache hits.</li><li><b>Client-side:</b> keeps the HTML identical for everyone.</li></ul>`,
            r`# application.properties
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
spring.web.resources.cache.cachecontrol.max-age=365d

# OUTPUT:
# /css/app.css  is served as /css/app-3f9a1c.css with Cache-Control: max-age=31536000`],
        [`<p>Real-world scenario: a company portal needs light and dark modes and a corporate high-contrast mode for accessibility.</p><ul><li>Store the choice in the user profile for logged-in users and in a cookie for visitors.</li><li>An advice reads either source and gives the view one value.</li><li>The stylesheet uses variables, so a new theme is a new block of colors.</li></ul>`,
            r`@ControllerAdvice
public class ThemeAdvice {
    private static final Set<String> OK = Set.of("light", "dark", "contrast");

    @ModelAttribute("theme")
    String theme(Principal p, @CookieValue(required = false) String theme,
                 UserPrefs prefs) {
        String t = p != null ? prefs.themeOf(p.getName()) : theme;
        return t != null && OK.contains(t) ? t : "light";
    }
}

// OUTPUT:
// logged-in user with saved "contrast" -> contrast
// visitor with cookie dark            -> dark
// anything else                       -> light`]
    ),
    'mvc-themeresolver': dv(
        [`<p>Inside the Spring 5 resolver.</p><ul><li><b>Interface:</b> <code>resolveThemeName(HttpServletRequest)</code> returns a String; <code>setThemeName</code> changes it.</li><li><b>Abstract base:</b> <code>AbstractThemeResolver</code> holds the default theme name (default <code>theme</code>).</li><li><b>Cookie variant:</b> <code>CookieThemeResolver</code> reads the cookie, validates it and caches the value in a request attribute.</li><li><b>Removal:</b> gone in Spring Framework 6.0.</li></ul>`,
            r`// Spring 5 source idea (simplified)
public interface ThemeResolver {
    String resolveThemeName(HttpServletRequest request);
    void setThemeName(HttpServletRequest request,
                      HttpServletResponse response, String themeName);
}

// OUTPUT:
// FixedThemeResolver.setThemeName throws UnsupportedOperationException`],
        [`<p>Resolver choices:</p><ul><li><b>Fixed:</b> one theme, cannot change.</li><li><b>Session:</b> per session, lost on expiry.</li><li><b>Cookie:</b> per browser, with cookie name, path and max age settings.</li><li><b>Custom:</b> user profile, tenant or A/B test group.</li></ul>`,
            r`// Spring 5 cookie resolver options
CookieThemeResolver r = new CookieThemeResolver();
r.setCookieName("site-theme");
r.setCookieMaxAge(Duration.ofDays(30));
r.setCookiePath("/");
r.setDefaultThemeName("light");

// OUTPUT:
// Set-Cookie: site-theme=dark; Max-Age=2592000; Path=/`],
        [`<p>Mistakes:</p><ul><li><b>Wrong bean name:</b> a bean called anything other than <code>themeResolver</code> was ignored.</li><li><b>Resolver state in fields:</b> shared across users.</li><li><b>Missing interceptor:</b> the resolver alone never changes the theme.</li><li><b>Unvalidated theme name:</b> it selects a file, so check it.</li></ul>`,
            r`// WRONG: stores request data in a singleton field
@Component
class BadResolver {
    private String last;                 // shared by all users
    String resolve(HttpServletRequest r) {
        last = param(r);
        return last;
    }
}

// RIGHT: pure function of the request
@Component
class GoodResolver {
    String resolve(HttpServletRequest r) { return param(r); }
}

// OUTPUT:
// BadResolver: user B can see the theme chosen by user A under load`],
        [`<p>Performance:</p><ul><li>Resolution costs one cookie scan per request; keep it simple.</li><li>Do not hit the database in a resolver without a cache.</li><li>For profile themes, load the preference once into the security principal or session.</li></ul>`,
            r`@Component
public class ProfileThemeResolver {
    private final Cache<String, String> cache = Caffeine.newBuilder()
            .maximumSize(10_000).expireAfterWrite(Duration.ofMinutes(10)).build();
    private final UserPrefs prefs;
    public ProfileThemeResolver(UserPrefs prefs) { this.prefs = prefs; }

    public String resolve(String user) {
        return cache.get(user, prefs::themeOf);
    }
}

// OUTPUT:
// first call hits the database; calls within 10 minutes use the cache`],
        [`<p>Scenario: a multi-tenant SaaS shows each customer its own colors.</p><ul><li>The tenant is read from the host name.</li><li>A resolver maps tenant id to a theme name.</li><li>Unknown tenants get the default.</li></ul>`,
            r`@Component
public class TenantThemeResolver {
    private final Map<String, String> byTenant =
        Map.of("acme", "acme-blue", "globex", "globex-green");

    public String resolve(HttpServletRequest req) {
        String tenant = req.getServerName().split("\\.")[0];
        return byTenant.getOrDefault(tenant, "default");
    }
}

// OUTPUT:
// acme.example.com   -> acme-blue
// other.example.com  -> default`]
    ),
    'mvc-themesource': dv(
        [`<p>Inside the Spring 5 source.</p><ul><li><b>Interface:</b> <code>ThemeSource.getTheme(String themeName)</code>, returning <code>null</code> if unknown.</li><li><b>Resource bundle:</b> <code>ResourceBundleThemeSource</code> creates a <code>SimpleTheme</code> around a <code>ResourceBundleMessageSource</code> per theme and caches it.</li><li><b>Context:</b> the web application context itself implements <code>ThemeSource</code> and delegates to a bean named <code>themeSource</code>.</li><li><b>Removal:</b> gone in Spring Framework 6.0.</li></ul>`,
            r`// Spring 5 (simplified idea)
Theme theme = themeSource.getTheme("dark");        // cached per name
String css = theme.getMessageSource()
                  .getMessage("styleSheet", null, Locale.ENGLISH);

// OUTPUT:
// css = /css/dark.css`],
        [`<p>Options:</p><ul><li><b>Basename prefix:</b> where the files live, such as <code>themes.</code>.</li><li><b>Default encoding:</b> set to UTF-8 for non-ASCII text.</li><li><b>Parent source:</b> a fallback theme.</li><li><b>Modern equivalent:</b> a map in configuration properties, or a database table.</li></ul>`,
            r`// Modern: a service that returns a theme definition
public record ThemeDef(String name, String css, String logo) {}

@Service
public class ThemeCatalog {
    private final Map<String, ThemeDef> all = Map.of(
        "light", new ThemeDef("light", "/css/light.css", "/img/logo.svg"),
        "dark",  new ThemeDef("dark",  "/css/dark.css",  "/img/logo-w.svg"));
    public ThemeDef get(String n) { return all.getOrDefault(n, all.get("light")); }
}

// OUTPUT:
// get("dark").css() = /css/dark.css
// get("zzz").name() = light`],
        [`<p>Mistakes:</p><ul><li><b>Properties file not on the classpath</b> under the prefix.</li><li><b>Missing key</b> in one theme: add a default or fail fast at startup.</li><li><b>Non-UTF-8 files</b> garble text; set the encoding.</li><li><b>Null theme</b> from an unknown name used without a check.</li></ul>`,
            r`// WRONG
// String css = catalog.get(name).css();   // NPE if get returns null

// RIGHT: always fall back
ThemeDef t = Optional.ofNullable(catalog.get(name)).orElse(catalog.get("light"));

// OUTPUT:
// unknown theme name -> light theme, no exception`],
        [`<p>Performance:</p><ul><li>Load definitions once at startup into an immutable map.</li><li>Avoid reading files per request.</li><li>If themes live in the database, cache them with a short expiry.</li></ul>`,
            r`@Service
public class CachedThemes {
    private final ThemeRepository repo;
    public CachedThemes(ThemeRepository repo) { this.repo = repo; }

    @Cacheable("themes")
    public ThemeDef find(String name) { return repo.findByName(name); }
}

// OUTPUT:
// first find("dark") queries the database; later calls are served from the cache`],
        [`<p>Scenario: marketing wants to add a seasonal theme without a release.</p><ul><li>Themes are rows in a table with CSS path and logo.</li><li>An admin screen adds a row and clears the cache.</li><li>The cookie value is checked against the table.</li></ul>`,
            r`@CacheEvict(value = "themes", allEntries = true)
@PostMapping("/admin/themes")
public ThemeDef add(@RequestBody ThemeDef def) {
    return repo.save(def);
}

// OUTPUT:
// POST /admin/themes {"name":"winter","css":"/css/winter.css"} -> 200
// the next request with cookie theme=winter renders the winter theme`]
    ),
    'mvc-theme-configuration': dv(
        [`<p>How the pieces connect in modern configuration.</p><ul><li><b>Properties binding:</b> Boot binds <code>app.theme.*</code> into a record at startup and fails fast on a bad value.</li><li><b>Interceptor chain:</b> <code>HandlerExecutionChain</code> runs the interceptor before the controller.</li><li><b>Model:</b> an advice adds the theme to every model before the view renders.</li></ul>`,
            r`@ConfigurationProperties(prefix = "app.theme")
@Validated
public record ThemeSettings(
    @NotBlank String defaultName,
    @NotEmpty Set<String> allowed) {}

# application.yml
# app.theme:
#   default-name: light
#   allowed: [light, dark]

// OUTPUT:
// startup fails with "defaultName must not be blank" if the key is missing`],
        [`<p>Configuration variants:</p><ul><li><b>Properties or YAML:</b> per environment.</li><li><b>Java config:</b> beans and interceptors.</li><li><b>Legacy XML or Java (Spring 5):</b> the same set of theme beans.</li><li><b>Profiles:</b> different defaults for dev and prod.</li></ul>`,
            r`# application-prod.yml
app:
  theme:
    default-name: dark
    allowed: [light, dark, contrast]

# application-dev.yml
app:
  theme:
    default-name: light
    allowed: [light, dark]

# OUTPUT:
# --spring.profiles.active=prod -> default dark, three allowed themes`],
        [`<p>Mistakes:</p><ul><li><b>Forgetting @EnableConfigurationProperties</b> (or scanning) so the record is not a bean.</li><li><b>Interceptor not registered</b> because the config class does not implement <code>WebMvcConfigurer</code>.</li><li><b>Path patterns:</b> the interceptor also runs for static files unless you exclude them.</li></ul>`,
            r`@Override
public void addInterceptors(InterceptorRegistry r) {
    r.addInterceptor(new ThemeInterceptor(settings))
     .addPathPatterns("/**")
     .excludePathPatterns("/css/**", "/js/**", "/img/**");
}

// OUTPUT:
// /home?theme=dark runs the interceptor; /css/app.css does not`],
        [`<p>Performance: interceptors run on every request, so keep them cheap.</p><ul><li>No database calls.</li><li>Exclude static resources.</li><li>Use set lookups, not lists.</li></ul>`,
            r`public record ThemeSettings(String defaultName, Set<String> allowed) {
    public ThemeSettings {
        allowed = Set.copyOf(allowed);       // immutable, O(1) contains
    }
}

// OUTPUT:
// allowed.contains("dark") is a constant-time hash lookup`],
        [`<p>Scenario: moving a Spring 5 application to Spring Boot 3.</p><ul><li>Delete <code>ThemeResolver</code>, <code>ThemeSource</code> and <code>ThemeChangeInterceptor</code> beans and the theme properties files.</li><li>Replace <code>spring:theme</code> tags with a CSS file chosen by the model value.</li><li>Keep the same <code>?theme=</code> URL so bookmarks and links still work.</li></ul>`,
            r`@GetMapping("/**")                       // simplified example
public String page(@RequestParam(required = false) String theme,
                   HttpServletResponse res, Model model) {
    String t = settings.allowed().contains(theme) ? theme : settings.defaultName();
    res.addCookie(new Cookie("theme", t));
    model.addAttribute("theme", t);
    return "page";
}

// OUTPUT:
// /page?theme=dark -> cookie set, page rendered with data-theme="dark"`]
    ),
    'mvc-dynamic-themes': dv(
        [`<p>How a dynamic switch works end to end.</p><ul><li><b>Client-side:</b> a script sets <code>data-theme</code> on the html element and writes <code>localStorage</code>; the CSS cascade does the rest.</li><li><b>Server-side:</b> a request carries the cookie, an advice puts it in the model, the template prints it.</li><li><b>Hybrid:</b> the script also writes a cookie so the server can render the right value on the next request.</li></ul>`,
            r`// hybrid: script writes both
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem("theme", t);
  document.cookie = "theme=" + t + "; path=/; max-age=31536000; samesite=lax";
}

// OUTPUT:
// setTheme("dark") -> html data-theme="dark", cookie theme=dark`],
        [`<p>Variants:</p><ul><li><b>Toggle button</b> for two modes.</li><li><b>Select box</b> for many themes.</li><li><b>Follow system:</b> <code>matchMedia</code> listener updates when the OS changes.</li><li><b>Server API:</b> <code>PUT /api/me/theme</code> saves to the profile.</li></ul>`,
            r`// follow the operating system until the user chooses
const mq = matchMedia("(prefers-color-scheme: dark)");
mq.addEventListener("change", e => {
  if (!localStorage.getItem("theme"))
    document.documentElement.dataset.theme = e.matches ? "dark" : "light";
});

// OUTPUT:
// OS switches to dark at sunset -> page switches, unless the user picked a theme`],
        [`<p>Mistakes:</p><ul><li><b>Flash of wrong theme:</b> the script runs after the page paints.</li><li><b>Cached HTML</b> with a baked-in theme served to everyone.</li><li><b>No CSRF thought:</b> a state-changing theme endpoint with cookie auth should still use POST and a token if it changes profile data.</li><li><b>Untrusted value</b> printed into HTML without escaping.</li></ul>`,
            r`<!-- put in head, before the stylesheet, to avoid the flash -->
<script>
  (function () {
    var t = localStorage.getItem("theme");
    if (t) document.documentElement.dataset.theme = t;
  })();
</script>

// OUTPUT:
// the correct theme is applied before first paint`],
        [`<p>Performance:</p><ul><li>Switching an attribute repaints once; avoid loading a new stylesheet for each switch.</li><li>Use <code>transition</code> only on a few properties.</li><li>Keep the cookie small and scoped to <code>/</code>.</li></ul>`,
            r`/* animate only what is needed */
body { background: var(--bg); color: var(--fg);
       transition: background-color .2s, color .2s;
       }

// OUTPUT:
// theme switch fades in 200 ms without a layout shift`],
        [`<p>Scenario: dashboard with an admin who works on several machines.</p><ul><li>The toggle calls an API that saves the theme in the profile.</li><li>On login the server sends the saved value in the first page.</li><li>The cookie is only a fallback for the login page.</li></ul>`,
            r`@PutMapping("/api/me/theme")
public ResponseEntity<Void> save(@RequestBody Map<String, String> body,
                                 Principal p) {
    String t = body.get("theme");
    if (!Set.of("light", "dark", "contrast").contains(t))
        return ResponseEntity.badRequest().build();
    prefs.save(p.getName(), t);
    return ResponseEntity.noContent().build();
}

// OUTPUT:
// PUT {"theme":"dark"} -> 204; the next login on any device opens in dark`]
    ),
    'mvc-content-negotiation-negotiation': dv(
        [`<p>How a request is negotiated inside Spring MVC.</p><ul><li><b>Mapping phase:</b> <code>RequestMappingHandlerMapping</code> matches path, method, <code>consumes</code> and <code>produces</code>.</li><li><b>Manager:</b> <code>ContentNegotiationManager</code> runs its strategies (parameter, header) to get the requested types.</li><li><b>Return value:</b> <code>RequestResponseBodyMethodProcessor</code> picks the best producible type, then the first <code>HttpMessageConverter</code> that can write it.</li><li><b>Failure:</b> no match throws <code>HttpMediaTypeNotAcceptableException</code>.</li></ul>`,
            r`// simplified selection in AbstractMessageConverterMethodProcessor
// 1. acceptable = negotiationManager.resolveMediaTypes(request)
// 2. producible = types any converter can write for the return class
// 3. pick the first compatible pair, most specific and highest q first
// 4. converter.write(body, selectedType, outputMessage)

// OUTPUT:
// Accept: application/xml, produces json+xml -> selected application/xml`],
        [`<p>Variants:</p><ul><li><b>Header:</b> default.</li><li><b>Parameter:</b> optional.</li><li><b>Default content type:</b> used when the client sends no preference.</li><li><b>Per method:</b> <code>produces</code> and <code>consumes</code>.</li><li><b>Manual:</b> return <code>ResponseEntity</code> with an explicit content type.</li></ul>`,
            r`@GetMapping(value = "/export", produces = {
    MediaType.APPLICATION_JSON_VALUE,
    MediaType.APPLICATION_XML_VALUE,
    "text/csv" })
public ResponseEntity<List<Row>> export() {
    return ResponseEntity.ok(rows());
}

// OUTPUT:
// application/json -> JSON array
// application/xml  -> XML list
// text/csv         -> 406 unless a CSV converter is registered`],
        [`<p>Mistakes:</p><ul><li><b>No converter</b> for a type listed in <code>produces</code>: results in 406 or 500.</li><li><b>Confusing 406 and 415</b>: 406 concerns the response type, 415 the request body type.</li><li><b>Returning a String</b> when you want JSON: it is written as plain text.</li><li><b>Missing getters</b> make Jackson produce empty objects or an error.</li></ul>`,
            r`// WRONG: String is written as text, not JSON-quoted
@GetMapping("/a") public String a() { return "hello"; }   // body: hello

// RIGHT: return an object or use ResponseEntity with a JSON type
@GetMapping("/b") public Map<String, String> b() { return Map.of("m", "hello"); }

// OUTPUT:
// /a -> hello
// /b -> {"m":"hello"}`],
        [`<p>Performance:</p><ul><li>Narrow <code>produces</code> so mapping resolution is cheap.</li><li>Reuse one <code>ObjectMapper</code>; Boot already does.</li><li>Send <code>Vary: Accept</code> so caches stay correct.</li><li>Use compression (<code>server.compression.enabled</code>) for large bodies.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/csv
server.compression.min-response-size=1024

# OUTPUT:
# responses larger than 1 KB are gzipped when the client sends Accept-Encoding: gzip`],
        [`<p>Scenario: a public API serves a JavaScript front end (JSON) and a partner system (XML).</p><ul><li>One controller and one record serve both.</li><li>The partner is told to send <code>Accept: application/xml</code>.</li><li>A test per format guards the contract.</li></ul>`,
            r`@RestController
@RequestMapping("/api/invoices")
public class InvoiceApi {
    @GetMapping(value = "/{id}", produces = { "application/json", "application/xml" })
    public Invoice get(@PathVariable long id) {
        return new Invoice(id, "Acme", 120.0);
    }
}
public record Invoice(long id, String customer, double total) {}

// OUTPUT:
// JS client : {"id":5,"customer":"Acme","total":120.0}
// partner   : <Invoice><id>5</id><customer>Acme</customer><total>120.0</total></Invoice>`]
    ),
    'mvc-json-vs-xml': dv(
        [`<p>How each format is handled internally.</p><ul><li><b>JSON:</b> <code>MappingJackson2HttpMessageConverter</code> uses <code>ObjectMapper</code> to bind JSON to Java objects through getters, setters or record components.</li><li><b>XML:</b> <code>MappingJackson2XmlHttpMessageConverter</code> uses <code>XmlMapper</code> from jackson-dataformat-xml; the same annotations mostly apply.</li><li><b>Order:</b> converters are tried in order, and Boot places the XML converter next to the JSON one once the library is on the classpath.</li></ul>`,
            r`<!-- pom.xml: enables XML in Boot -->
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>

// OUTPUT:
// startup registers MappingJackson2XmlHttpMessageConverter
// requests with Accept: application/xml now succeed`],
        [`<p>Comparison points:</p><ul><li><b>Verbosity:</b> XML is longer.</li><li><b>Schema:</b> XSD for XML; JSON Schema for JSON.</li><li><b>Mixed content and attributes:</b> XML only.</li><li><b>Types:</b> JSON has numbers and booleans; XML values are text.</li><li><b>Tooling:</b> JSON is native in browsers.</li></ul>`,
            r`// same data
// JSON (41 chars): {"id":1,"name":"Abaji","active":true}
// XML  (61 chars): <u><id>1</id><name>Abaji</name><active>true</active></u>

String json = new ObjectMapper().writeValueAsString(new U(1, "Abaji", true));
String xml  = new XmlMapper().writeValueAsString(new U(1, "Abaji", true));
System.out.println(json.length() + " vs " + xml.length());

// OUTPUT:
// 39 vs 69 (varies with root name)`],
        [`<p>Mistakes:</p><ul><li><b>XXE</b> through unsafe parsers.</li><li><b>Date formats:</b> dates become timestamps unless <code>WRITE_DATES_AS_TIMESTAMPS</code> is disabled (Boot disables it).</li><li><b>Lists in XML:</b> a wrapper element name is needed to control output.</li><li><b>Null handling</b> differs: JSON writes null; XML may write an empty tag.</li></ul>`,
            r`public class Order {
    @JacksonXmlElementWrapper(localName = "items")
    @JacksonXmlProperty(localName = "item")
    public List<String> items = List.of("pen", "ink");
}

// OUTPUT:
// <Order><items><item>pen</item><item>ink</item></items></Order>`],
        [`<p>Performance:</p><ul><li>JSON parsing is usually faster and allocates less than XML.</li><li>Reuse mappers (they are thread-safe once configured).</li><li>Stream large payloads with <code>JsonGenerator</code> or <code>StreamingResponseBody</code>.</li><li>Compress both formats; text compresses well.</li></ul>`,
            r`@GetMapping("/big")
public StreamingResponseBody big() {
    return out -> {
        try (JsonGenerator g = new ObjectMapper().getFactory().createGenerator(out)) {
            g.writeStartArray();
            for (int i = 0; i < 100_000; i++) g.writeNumber(i);
            g.writeEndArray();
        }
    };
}

// OUTPUT:
// streams [0,1,2,...] without building the whole array in memory`],
        [`<p>Scenario: a bank exposes JSON for its mobile app and XML for an older partner.</p><ul><li>Same service layer and DTO.</li><li>XML needs a namespace and attribute for the partner schema; use annotations only on the DTO.</li><li>Contract tests validate XML against the XSD.</li></ul>`,
            r`@JacksonXmlRootElement(localName = "Payment", namespace = "urn:bank:v1")
public record PaymentDto(
    @JacksonXmlProperty(isAttribute = true) String ref,
    double amount) {}

// OUTPUT:
// XML : <Payment xmlns="urn:bank:v1" ref="P1"><amount>10.0</amount></Payment>
// JSON: {"ref":"P1","amount":10.0}`]
    ),
    'mvc-accept-header-negotiation': dv(
        [`<p>Matching Accept to produces in detail.</p><ul><li><b>Parse:</b> <code>MediaType.parseMediaTypes</code> splits the header and reads q values.</li><li><b>Sort:</b> <code>MimeTypeUtils.sortBySpecificity</code> puts concrete types before wildcards and higher quality first.</li><li><b>Mapping:</b> <code>ProducesRequestCondition</code> keeps only handlers whose produces is compatible; more specific conditions win ties.</li><li><b>Ambiguity:</b> two methods that both match raise <code>IllegalStateException</code> (ambiguous mapping) at startup or at request time.</li></ul>`,
            r`List<MediaType> list = MediaType.parseMediaTypes(
    "text/html, application/xml;q=0.9, */*;q=0.8");
MimeTypeUtils.sortBySpecificity(list);
System.out.println(list);

// OUTPUT:
// [text/html, application/xml;q=0.9, */*;q=0.8]`],
        [`<p>Variants of the header and of mappings:</p><ul><li><b>Negation:</b> <code>produces = "!text/plain"</code> excludes a type.</li><li><b>Wildcard:</b> <code>produces = "application/*"</code>.</li><li><b>Vendor types:</b> <code>application/vnd.shop.v2+json</code> for versioning.</li><li><b>Class level:</b> produces on the controller applies to all methods.</li></ul>`,
            r`@RestController
@RequestMapping(value = "/products", produces = "application/vnd.shop.v1+json")
class ProductsV1 {
    @GetMapping("/{id}") Product get(@PathVariable long id) { return new Product(id); }
}
@RestController
@RequestMapping(value = "/products", produces = "application/vnd.shop.v2+json")
class ProductsV2 {
    @GetMapping("/{id}") ProductV2 get(@PathVariable long id) { return new ProductV2(id, "new"); }
}

// OUTPUT:
// Accept: application/vnd.shop.v2+json -> V2 body
// Accept: application/vnd.shop.v1+json -> V1 body`],
        [`<p>Mistakes:</p><ul><li><b>Browser sends */*</b> and gets the first produces type, which may surprise you.</li><li><b>Ambiguous mappings</b> from two methods with the same path and overlapping produces.</li><li><b>Custom error body</b> in a type the client did not accept, which causes a second 406.</li><li><b>Ignoring Accept</b> by setting the content type manually in the controller.</li></ul>`,
            r`@ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
public ResponseEntity<String> notAcceptable() {
    return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
            .contentType(MediaType.TEXT_PLAIN)       // always writable
            .body("Supported: application/json, application/xml");
}

// OUTPUT:
// Accept: image/png -> 406, Content-Type: text/plain,
// body: Supported: application/json, application/xml`],
        [`<p>Performance:</p><ul><li>Header parsing is cheap and cached per request.</li><li>Fewer overlapping mappings mean faster matching.</li><li>Add <code>Vary: Accept</code> only where the output really depends on it.</li></ul>`,
            r`@GetMapping(value = "/rates", produces = { "application/json", "application/xml" })
public ResponseEntity<Rates> rates() {
    return ResponseEntity.ok()
        .header(HttpHeaders.VARY, HttpHeaders.ACCEPT)
        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
        .body(service.rates());
}

// OUTPUT:
// Vary: Accept
// Cache-Control: max-age=300`],
        [`<p>Scenario: API versioning by media type.</p><ul><li>Clients ask for <code>application/vnd.shop.v2+json</code>.</li><li>Old clients keep v1.</li><li>Tests send both Accept values.</li></ul>`,
            r`@Test
void versions() throws Exception {
    mvc.perform(get("/products/1").accept("application/vnd.shop.v2+json"))
       .andExpect(jsonPath("$.label").value("new"));
    mvc.perform(get("/products/1").accept("application/vnd.shop.v1+json"))
       .andExpect(jsonPath("$.label").doesNotExist());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),
    'mvc-content-type': dv(
        [`<p>How the request Content-Type is used.</p><ul><li><b>Mapping:</b> <code>ConsumesRequestCondition</code> compares it with <code>consumes</code>; a mismatch throws <code>HttpMediaTypeNotSupportedException</code> (415).</li><li><b>Reading:</b> <code>RequestResponseBodyMethodProcessor.readWithMessageConverters</code> finds a converter with <code>canRead(targetClass, contentType)</code>.</li><li><b>Default:</b> a body without Content-Type is treated as <code>application/octet-stream</code>.</li><li><b>Forms:</b> <code>x-www-form-urlencoded</code> and multipart are read by the servlet container or special converters, not by <code>@RequestBody</code> JSON.</li></ul>`,
            r`// simplified idea
MediaType ct = inputMessage.getHeaders().getContentType();   // may be null
if (ct == null) ct = MediaType.APPLICATION_OCTET_STREAM;
for (HttpMessageConverter<?> c : converters) {
    if (c.canRead(targetClass, ct)) return c.read(targetClass, inputMessage);
}
throw new HttpMediaTypeNotSupportedException(ct, supported);

// OUTPUT:
// text/plain body into a JSON-only endpoint -> 415 Unsupported Media Type`],
        [`<p>Common Content-Type values and handling:</p><ul><li><b>JSON:</b> <code>@RequestBody</code>.</li><li><b>Form:</b> <code>@RequestParam</code> or a model attribute.</li><li><b>Multipart:</b> <code>@RequestPart</code> or <code>MultipartFile</code>.</li><li><b>Plain text:</b> <code>@RequestBody String</code>.</li><li><b>Binary:</b> <code>byte[]</code> or <code>InputStream</code>.</li></ul>`,
            r`@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public String upload(@RequestPart("file") MultipartFile f,
                     @RequestPart("meta") Meta meta) {
    return f.getOriginalFilename() + " " + meta.tag();
}
record Meta(String tag) {}

@PostMapping(value = "/form", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
public String form(@RequestParam String name) { return "hi " + name; }

// OUTPUT:
// multipart upload -> a.png docs
// form name=Abaji   -> hi Abaji`],
        [`<p>Mistakes:</p><ul><li><b>Client forgets the header</b>: curl <code>-d</code> sends form encoding, not JSON; add <code>-H "Content-Type: application/json"</code>.</li><li><b>Wrong annotation</b>: <code>@RequestParam</code> does not read a JSON body.</li><li><b>Charset assumptions</b> for non-JSON text.</li><li><b>Trusting an upload type:</b> the header is client-controlled, so check the file content too.</li></ul>`,
            r`// WRONG: JSON body but @RequestParam
// @PostMapping("/x") String x(@RequestParam String name) -> 400 missing parameter

// RIGHT
@PostMapping("/x")
String x(@RequestBody Map<String, String> body) { return body.get("name"); }

// OUTPUT:
// curl -H "Content-Type: application/json" -d "{\"name\":\"Abaji\"}" /x -> Abaji`],
        [`<p>Performance and safety:</p><ul><li>Limit request sizes (<code>spring.servlet.multipart.max-file-size</code>, server max post size).</li><li>Reject unexpected types early with <code>consumes</code>.</li><li>Stream large uploads instead of loading them in memory.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
server.tomcat.max-http-form-post-size=2MB

# OUTPUT:
# a 6 MB upload fails with 413 / MaxUploadSizeExceededException`],
        [`<p>Scenario: an endpoint accepts either JSON or XML orders and answers in the format that was sent.</p><ul><li>Both types appear in <code>consumes</code>.</li><li>The response type follows Accept, defaulting to the request type.</li><li>Tests send each type.</li></ul>`,
            r`@PostMapping(value = "/orders",
    consumes = { "application/json", "application/xml" },
    produces = { "application/json", "application/xml" })
public Order echo(@RequestBody Order o) { return o; }

// OUTPUT:
// Content-Type: application/xml + Accept: application/xml -> XML in, XML out
// Content-Type: application/json (no Accept)              -> JSON in, JSON out`]
    ),
    'mvc-url-based-content-negotiation': dv(
        [`<p>How the strategies chain together.</p><ul><li><b>ParameterContentNegotiationStrategy:</b> reads the query parameter and maps its value through a registered keyword table.</li><li><b>HeaderContentNegotiationStrategy:</b> reads Accept.</li><li><b>FixedContentNegotiationStrategy:</b> default type when nothing else decided.</li><li><b>Order:</b> the manager asks them in that order and uses the first answer.</li></ul>`,
            r`// what configureContentNegotiation builds, simplified
List<ContentNegotiationStrategy> strategies = List.of(
    new ParameterContentNegotiationStrategy(Map.of(
        "json", MediaType.APPLICATION_JSON, "xml", MediaType.APPLICATION_XML)),
    new HeaderContentNegotiationStrategy(),
    new FixedContentNegotiationStrategy(MediaType.APPLICATION_JSON));
ContentNegotiationManager m = new ContentNegotiationManager(strategies);

// OUTPUT:
// ?format=xml -> [application/xml] (parameter strategy answers first)`],
        [`<p>Options:</p><ul><li><b>parameterName:</b> default is <code>format</code>.</li><li><b>mediaType(key, type):</b> add keywords.</li><li><b>ignoreAcceptHeader:</b> force URL-only negotiation.</li><li><b>defaultContentType:</b> fallback.</li><li><b>Separate URLs:</b> two methods at <code>/users/json</code> and <code>/users/xml</code> need no negotiation at all.</li></ul>`,
            r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.favorParameter(true)
     .ignoreAcceptHeader(true)            // URL only
     .defaultContentType(MediaType.APPLICATION_JSON)
     .mediaType("xml", MediaType.APPLICATION_XML)
     .mediaType("json", MediaType.APPLICATION_JSON);
}

// OUTPUT:
// Accept: application/xml is ignored; ?format=xml is used`],
        [`<p>Mistakes:</p><ul><li><b>Using a path extension</b> on Spring 5.3 or later and wondering why <code>.json</code> returns 404 or 406.</li><li><b>Forgetting to register</b> the keyword, so an unknown value gives 406.</li><li><b>Parameter name clash</b> with a business parameter called <code>format</code>.</li><li><b>Missing converter</b> for the type behind a keyword.</li></ul>`,
            r`// WRONG (no longer works by default): GET /users/1.xml -> 404/406

// RIGHT: parameter strategy
// GET /users/1?format=xml
// or a dedicated mapping:
@GetMapping(value = "/users/{id}.xml", produces = MediaType.APPLICATION_XML_VALUE)
public User oneXml(@PathVariable long id) { return service.find(id); }

// OUTPUT:
// /users/1?format=xml -> XML
// /users/1.xml        -> XML via the explicit mapping`],
        [`<p>Performance and caching:</p><ul><li>URL-selected formats cache naturally, since each URL is distinct.</li><li>Do not send <code>Vary: Accept</code> when you ignore the header.</li><li>Allow only a small set of keywords.</li></ul>`,
            r`@GetMapping(value = "/catalog", params = "format=json")
public ResponseEntity<Catalog> json() {
    return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofHours(1)))
            .body(catalog());
}

// OUTPUT:
// GET /catalog?format=json -> Cache-Control: max-age=3600 (CDN caches it per URL)`],
        [`<p>Scenario: a report page where analysts paste links into spreadsheets and email.</p><ul><li>They need a link that returns CSV or JSON without custom headers.</li><li>The parameter strategy gives <code>/reports/7?format=csv</code>.</li><li>Browsers and spreadsheet tools can open it directly.</li></ul>`,
            r`@Override
public void configureContentNegotiation(ContentNegotiationConfigurer c) {
    c.favorParameter(true)
     .mediaType("csv", MediaType.parseMediaType("text/csv"))
     .mediaType("json", MediaType.APPLICATION_JSON);
}

// a custom HttpMessageConverter writes text/csv for ReportRows
// OUTPUT:
// GET /reports/7?format=csv  -> id,total
//                               7,120.0`]
    )
};
