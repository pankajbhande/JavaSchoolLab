// Spring extras, batch smvc12 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc12Extras: Record<string, Extra> = {
    'mvc-redirect-after-post': x(
        ['<b>Redirect after POST</b> means that after a form POST succeeds, the controller returns <code>redirect:/somewhere</code> instead of rendering a view, so the browser makes a new GET request.',
            '<b>Why</b>: if the POST response is a page, pressing refresh re-sends the POST and can create a duplicate order or payment.',
            '<b>Syntax</b>: return the string <code>"redirect:/orders/42"</code> from the handler, and Spring sends an HTTP 302 with a <code>Location</code> header.'],
        ['<b>RedirectAttributes</b>: use <code>addAttribute</code> for URL query parameters and <code>addFlashAttribute</code> for one-time data kept in the session.',
            '<b>Flash attributes</b> survive exactly one redirect, so a success message shows once and disappears on refresh.',
            '<b>Redirect view</b>: the <code>redirect:</code> prefix is handled by <code>UrlBasedViewResolver</code>, which creates a <code>RedirectView</code>.'],
        ['<b>Status code</b>: 302 is the default; use <code>RedirectView</code> or <code>ResponseEntity</code> with 303 See Other when you want a strict GET after POST.',
            '<b>Model leakage</b>: by default model attributes can be appended to the redirect URL, so set <code>ignoreDefaultModelOnRedirect=true</code> to avoid this.',
            '<b>Testing</b>: with MockMvc assert <code>status().is3xxRedirection()</code>, <code>redirectedUrl(...)</code> and <code>flash().attributeExists(...)</code>.'],
        [['F', 'What is redirect after POST?', 'After a successful POST the server answers with a redirect so that the browser loads the result with a GET request.'],
            ['F', 'How do you redirect in Spring MVC?', 'Return a string with the redirect: prefix, for example redirect:/orders.'],
            ['M', 'What is the difference between addAttribute and addFlashAttribute?', 'addAttribute puts values in the redirect URL as query parameters; addFlashAttribute keeps them in the session for one request.'],
            ['M', 'Why does a flash attribute vanish after refresh?', 'FlashMapManager removes the flash map once the redirected request has read it.'],
            ['S', 'Which class handles the redirect: prefix?', 'UrlBasedViewResolver detects the prefix and returns a RedirectView, which calls response.sendRedirect.'],
            ['S', 'Does a flash attribute work across servers in a cluster?', 'Not by default, because it uses the HTTP session; you need sticky sessions or a shared session store.']],
        [['A controller that redirects after saving.',
            r`@Controller
@RequestMapping("/orders")
public class OrderController {

    @PostMapping
    public String create(@ModelAttribute OrderForm form,
                         RedirectAttributes ra) {
        long id = 42;                       // pretend the order was saved
        ra.addFlashAttribute("msg", "Order saved");
        return "redirect:/orders/" + id;    // browser now sends GET /orders/42
    }

    @GetMapping("/{id}")
    public String show(@PathVariable long id) {
        return "order-detail";
    }
}

// OUTPUT:
// POST /orders          -> 302 Location: /orders/42
// GET  /orders/42       -> 200 (message "Order saved" shown once)`],
            ['Test the redirect with MockMvc.',
                r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void redirectsAfterPost() throws Exception {
        mvc.perform(post("/orders").param("item", "pen"))
           .andExpect(status().is3xxRedirection())
           .andExpect(redirectedUrl("/orders/42"))
           .andExpect(flash().attribute("msg", "Order saved"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['addAttribute versus flash.',
            r`@PostMapping("/search")
public String search(@RequestParam String q, RedirectAttributes ra) {
    ra.addAttribute("q", q);              // appended to the URL
    ra.addFlashAttribute("note", "ok");   // kept in the session once
    return "redirect:/results";
}

// OUTPUT:
// 302 Location: /results?q=spring
// the note exists only for the next request`],
            ['Redirect with a 303 status.',
                r`@PostMapping("/pay")
public ResponseEntity<Void> pay() {
    return ResponseEntity.status(HttpStatus.SEE_OTHER)
            .location(URI.create("/receipt/7"))
            .build();
}

// OUTPUT:
// HTTP/1.1 303 See Other
// Location: /receipt/7`]]
    ),

    'mvc-prg-pattern-post-redirect-get': x(
        ['<b>PRG</b> stands for Post/Redirect/Get: the browser POSTs a form, the server answers with a redirect, and the browser then GETs a result page.',
            '<b>Problem solved</b>: the browser history keeps the final GET, so refresh or the back button never re-submits the form.',
            '<b>Three steps</b>: a <code>@PostMapping</code> handler processes the data, returns <code>redirect:/url</code>, and a <code>@GetMapping</code> handler renders the page.'],
        ['<b>Validation errors</b> are the exception: when <code>BindingResult.hasErrors()</code> is true, return the form view directly (no redirect) so the errors are shown.',
            '<b>Success message</b>: pass it with <code>addFlashAttribute</code>, because model data is lost at a redirect.',
            '<b>Idempotent GET</b>: the page you redirect to must be safe to load many times.'],
        ['<b>Double submit</b>: PRG does not stop a user who clicks the button twice quickly; add a token or a unique constraint as well.',
            '<b>Flash and validation</b>: to keep errors across a redirect you must also flash the <code>BindingResult</code>, which is rarely worth the effort.',
            '<b>Testing</b>: one MockMvc test for the invalid path (200 with the form) and one for the valid path (redirect).'],
        [['F', 'What does PRG mean?', 'Post/Redirect/Get: answer a POST with a redirect so the user ends on a GET page.'],
            ['F', 'Which problem does PRG solve?', 'It prevents duplicate form submissions when the user refreshes the result page.'],
            ['M', 'Do you redirect when validation fails?', 'No, you return the form view with status 200 so the field errors are displayed.'],
            ['M', 'How do you show a success message after PRG?', 'Use RedirectAttributes.addFlashAttribute and read the value in the next view.'],
            ['S', 'Does PRG fully prevent double submits?', 'No, a fast double click can send two POSTs before the redirect; use an idempotency token or a database constraint.'],
            ['S', 'Why is a GET result page a good design?', 'GET is safe and idempotent, so it can be bookmarked, cached and reloaded without side effects.']],
        [['Full PRG with validation.',
            r`@Controller
public class SignupController {

    @GetMapping("/signup")
    public String form(Model model) {
        model.addAttribute("user", new SignupForm());
        return "signup";
    }

    @PostMapping("/signup")
    public String submit(@Valid @ModelAttribute("user") SignupForm form,
                         BindingResult result, RedirectAttributes ra) {
        if (result.hasErrors()) return "signup";      // no redirect
        ra.addFlashAttribute("msg", "Welcome " + form.getName());
        return "redirect:/signup/done";               // R of PRG
    }

    @GetMapping("/signup/done")
    public String done() { return "done"; }           // G of PRG
}

// OUTPUT:
// POST /signup (invalid) -> 200 form with errors
// POST /signup (valid)   -> 302 /signup/done, then GET -> 200`],
            ['MockMvc test of both paths.',
                r`@Test
void invalidStaysOnForm() throws Exception {
    mvc.perform(post("/signup").param("name", ""))
       .andExpect(status().isOk())
       .andExpect(view().name("signup"));
}

@Test
void validRedirects() throws Exception {
    mvc.perform(post("/signup").param("name", "Abaji"))
       .andExpect(redirectedUrl("/signup/done"));
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]],
        [['Without PRG (the bug).',
            r`@PostMapping("/buy")
public String buy(@RequestParam long id) {
    orderService.place(id);
    return "thanks";     // BAD: refresh re-sends POST and orders again
}

// OUTPUT:
// F5 in the browser -> "Confirm form resubmission" and a second order`],
            ['Fixed with PRG.',
                r`@PostMapping("/buy")
public String buy(@RequestParam long id) {
    orderService.place(id);
    return "redirect:/thanks";
}

@GetMapping("/thanks")
public String thanks() { return "thanks"; }

// OUTPUT:
// F5 now repeats only GET /thanks, so no second order`]]
    ),

    'mvc-data-binding': x(
        ['<b>Data binding</b> is the automatic copying of request values (form fields, query parameters, path variables) into Java objects, with type conversion.',
            '<b>Purpose</b>: you write <code>save(UserForm form)</code> instead of calling <code>request.getParameter</code> for every field.',
            '<b>Names match</b>: a parameter called <code>name</code> is copied into the setter <code>setName</code> of the target object.'],
        ['<b>Sources</b>: <code>@ModelAttribute</code> binds request parameters to an object, while <code>@RequestBody</code> uses message converters (JSON) instead.',
            '<b>Conversion</b>: the string "25" becomes an <code>int</code>, and "2024-05-01" can become a <code>LocalDate</code> with <code>@DateTimeFormat</code>.',
            '<b>Errors</b>: a failed conversion does not throw; it is stored in <code>BindingResult</code> as a field error.'],
        ['<b>Engine</b>: a <code>WebDataBinder</code> created per request does the work through <code>BeanWrapper</code> and a <code>ConversionService</code>.',
            '<b>Security</b>: binding to an entity can let a client set fields you did not intend (mass assignment), so bind to a form or DTO class.',
            '<b>Testing</b>: send parameters with MockMvc <code>param(...)</code> and assert on the model with <code>model().attribute(...)</code>.'],
        [['F', 'What is data binding in Spring MVC?', 'It is copying request data into Java objects automatically, with type conversion.'],
            ['F', 'Which annotation binds form fields to an object?', '@ModelAttribute, which is also applied implicitly to a non-simple method argument.'],
            ['M', 'What happens when "abc" is sent for an int field?', 'The binder records a typeMismatch error in BindingResult; if there is no BindingResult argument, a BindException is thrown.'],
            ['M', 'Difference between @ModelAttribute and @RequestBody?', '@ModelAttribute binds parameters by name; @RequestBody reads the body with an HttpMessageConverter such as Jackson.'],
            ['S', 'Which classes perform the binding?', 'WebDataBinder with BeanWrapper, using a ConversionService and PropertyEditors.'],
            ['S', 'What is mass assignment and how do you avoid it?', 'A client sets fields you did not expose; bind to a dedicated DTO or restrict fields with setAllowedFields.']],
        [['Binding a form to an object.',
            r`public class UserForm {
    private String name;
    private int age;
    // getters and setters
}

@PostMapping("/users")
@ResponseBody
public String create(UserForm form) {      // implicit @ModelAttribute
    return form.getName() + " is " + form.getAge();
}

// OUTPUT:
// POST /users  name=Abaji&age=25   ->  Abaji is 25`],
            ['Test the binding.',
                r`@Test
void binds() throws Exception {
    mvc.perform(post("/users").param("name", "Abaji").param("age", "25"))
       .andExpect(content().string("Abaji is 25"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Binding errors.',
            r`@PostMapping("/users")
@ResponseBody
public String create(UserForm form, BindingResult result) {
    if (result.hasFieldErrors("age")) return "bad age";
    return "ok";
}

// OUTPUT:
// POST age=abc -> bad age   (typeMismatch recorded)
// POST age=25  -> ok`],
            ['Path and query binding.',
                r`@GetMapping("/users/{id}")
@ResponseBody
public String find(@PathVariable long id, @RequestParam(defaultValue = "en") String lang) {
    return id + "/" + lang;
}

// OUTPUT:
// GET /users/7?lang=fr -> 7/fr
// GET /users/7         -> 7/en`]]
    ),

    'mvc-property-binding': x(
        ['<b>Property binding</b> means mapping one request parameter to one property of a bean through its setter, such as <code>address.city</code> to <code>getAddress().setCity()</code>.',
            '<b>Property path</b>: dots reach nested objects, brackets reach lists and maps, as in <code>items[0].name</code> or <code>tags[red]</code>.',
            '<b>Requirement</b>: the bean needs a public setter (or a field set up for direct access) for each bound property.'],
        ['<b>Nested objects</b> are created automatically when <code>autoGrowNestedPaths</code> is true, which is the default.',
            '<b>Collections</b> grow as needed up to <code>autoGrowCollectionLimit</code>, which is 256 by default.',
            '<b>Name rule</b>: the name is the property name, so <code>setFirstName</code> binds the parameter <code>firstName</code>.'],
        ['<b>Engine</b>: <code>BeanPropertyBindingResult</code> wraps a <code>BeanWrapperImpl</code> that resolves each path segment.',
            '<b>Direct field access</b>: call <code>initDirectFieldAccess()</code> in an <code>@InitBinder</code> to bind private fields without setters.',
            '<b>Pitfall</b>: unknown parameters are ignored silently unless <code>ignoreUnknownFields</code> is set to false.'],
        [['F', 'What is property binding?', 'Copying a single request parameter into a property of a Java object by name.'],
            ['F', 'How do you bind a nested field?', 'Name the parameter with a dot path such as address.city, and the nested object is created.'],
            ['M', 'How do you bind a list of objects?', 'Use indexed names such as items[0].name and items[1].name.'],
            ['M', 'What if the bean has no setter?', 'The property is not bound unless field access is enabled with initDirectFieldAccess.'],
            ['S', 'What limits list growth during binding?', 'autoGrowCollectionLimit, 256 by default, protects against huge indexes.'],
            ['S', 'Which class resolves property paths?', 'BeanWrapperImpl, used inside the BeanPropertyBindingResult of the WebDataBinder.']],
        [['Nested and indexed properties.',
            r`public class Order {
    private Address address = new Address();
    private List<Item> items = new ArrayList<>();
    // getters and setters
}

@PostMapping("/orders")
@ResponseBody
public String create(Order order) {
    return order.getAddress().getCity() + " " + order.getItems().size();
}

// OUTPUT:
// POST address.city=Pune&items[0].name=pen&items[1].name=ink  ->  Pune 2`],
            ['Test the nested binding.',
                r`@Test
void nested() throws Exception {
    mvc.perform(post("/orders")
            .param("address.city", "Pune")
            .param("items[0].name", "pen"))
       .andExpect(content().string("Pune 1"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Map binding.',
            r`public class Prefs {
    private Map<String, String> tags = new HashMap<>();
    // getter and setter
}

@PostMapping("/prefs")
@ResponseBody
public String save(Prefs p) { return p.getTags().toString(); }

// OUTPUT:
// POST tags[color]=red&tags[size]=L -> {size=L, color=red} (order varies)`],
            ['Field access without setters.',
                r`@InitBinder
void init(WebDataBinder binder) {
    binder.initDirectFieldAccess();   // bind private fields directly
}

// OUTPUT:
// private fields without setters are now bound from request parameters`]]
    ),

    'mvc-automatic-binding': x(
        ['<b>Automatic binding</b> is what Spring MVC does without extra code: any controller argument that is not a simple type or a special type is bound from the request as a model attribute.',
            '<b>Implicit @ModelAttribute</b>: <code>save(UserForm form)</code> works exactly like <code>save(@ModelAttribute UserForm form)</code>.',
            '<b>Simple types</b> (int, String, and so on) are treated as <code>@RequestParam</code> by default, with the parameter name taken from the argument name.'],
        ['<b>Argument resolvers</b>: <code>RequestMappingHandlerAdapter</code> asks each <code>HandlerMethodArgumentResolver</code> in turn; <code>ServletModelAttributeMethodProcessor</code> handles the bean case.',
            '<b>Parameter names</b> are available because Spring Boot compiles with <code>-parameters</code>; without it use <code>@RequestParam("name")</code>.',
            '<b>Missing values</b> leave the property at its default (null or 0) instead of failing.'],
        ['<b>Order of work</b>: create the object, bind parameters, run validation if <code>@Valid</code> is present, then call the method.',
            '<b>Pitfall</b>: a record or constructor-bound class is built through its constructor, so a missing primitive parameter can throw instead of defaulting.',
            '<b>Testing</b>: test the binding with <code>@WebMvcTest</code> and check both the model and the returned view.'],
        [['F', 'What is automatic binding?', 'Spring fills controller method arguments from the request without manual code.'],
            ['F', 'Is @ModelAttribute required on a form object?', 'No, a non-simple argument gets it implicitly.'],
            ['M', 'Which component binds a bean argument?', 'ServletModelAttributeMethodProcessor, an argument resolver.'],
            ['M', 'Why does binding by argument name sometimes fail?', 'The class was compiled without the -parameters flag, so the names are unknown; use explicit annotation names.'],
            ['S', 'How does binding work for a record?', 'Spring uses constructor binding, matching parameter names to constructor arguments and converting the types.'],
            ['S', 'In what order do binding and validation happen?', 'The attribute is created and bound first, then validated, and errors go to BindingResult.']],
        [['Implicit binding and the model.',
            r`@Controller
public class CourseController {

    @PostMapping("/courses")
    public String add(CourseForm form, Model model) {
        // form is bound AND added to the model as "courseForm"
        model.addAttribute("saved", true);
        return "course-result";
    }
}

// OUTPUT:
// model contains: courseForm -> CourseForm(title=Java), saved -> true`],
            ['Constructor binding with a record.',
                r`public record CourseForm(String title, int hours) { }

@PostMapping("/courses")
@ResponseBody
public String add(CourseForm form) {
    return form.title() + ":" + form.hours();
}

// OUTPUT:
// POST title=Java&hours=40 -> Java:40`]],
        [['Simple type defaults.',
            r`@GetMapping("/hello")
@ResponseBody
public String hello(String name, int times) {   // both are request params
    return name + " x" + times;
}

// OUTPUT:
// GET /hello?name=Raoji&times=2 -> Raoji x2
// GET /hello?name=Raoji         -> 500 (int cannot be null)`],
            ['Safe version.',
                r`@GetMapping("/hello")
@ResponseBody
public String hello(@RequestParam(defaultValue = "guest") String name,
                    @RequestParam(defaultValue = "1") int times) {
    return name + " x" + times;
}

// OUTPUT:
// GET /hello -> guest x1`]]
    ),

    'mvc-custom-data-binding': x(
        ['<b>Custom data binding</b> means teaching Spring MVC how to convert a request string into your own type, such as a <code>Money</code> or <code>Email</code> class.',
            '<b>Ways to do it</b>: a <code>Converter</code>, a <code>Formatter</code>, a <code>PropertyEditor</code>, or a type with a single-string constructor or <code>valueOf</code>.',
            '<b>Why</b>: without it the binder cannot convert and records a <code>typeMismatch</code> error.'],
        ['<b>Converter</b>: <code>Converter&lt;String, Money&gt;</code> converts one way and is registered in <code>WebMvcConfigurer.addFormatters</code>.',
            '<b>Formatter</b>: <code>Formatter&lt;T&gt;</code> converts both ways (text to object and object to text) and supports a <code>Locale</code>.',
            '<b>Annotations</b>: <code>@DateTimeFormat</code> and <code>@NumberFormat</code> customize built-in types per field without any class.'],
        ['<b>Scope</b>: a global converter applies everywhere; an <code>@InitBinder</code> applies to one controller only.',
            '<b>Error handling</b>: throw <code>IllegalArgumentException</code> from the converter to produce a clean field error.',
            '<b>Testing</b>: unit test the converter alone, then one MockMvc test to prove it is registered.'],
        [['F', 'Why would you write custom binding?', 'To convert request text into your own class that Spring cannot convert by itself.'],
            ['F', 'Name two ways to add a custom conversion.', 'A Converter or Formatter registered in WebMvcConfigurer, and an @InitBinder with a PropertyEditor.'],
            ['M', 'Converter versus Formatter?', 'A Converter goes one way between two types; a Formatter works with Strings in both directions and knows the Locale.'],
            ['M', 'Where do you register a global converter?', 'Override addFormatters(FormatterRegistry) in a WebMvcConfigurer.'],
            ['S', 'How should a converter report bad input?', 'Throw IllegalArgumentException; the binder turns it into a typeMismatch field error.'],
            ['S', 'Do Spring Boot beans of type Converter register themselves?', 'Yes, Spring Boot adds Converter and Formatter beans to the MVC conversion service automatically.']],
        [['A Money converter.',
            r`public record Money(long cents) { }

@Component
public class StringToMoney implements Converter<String, Money> {
    @Override
    public Money convert(String s) {
        try {
            return new Money(Math.round(Double.parseDouble(s) * 100));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("bad money: " + s);
        }
    }
}

@GetMapping("/price")
@ResponseBody
public String price(@RequestParam Money amount) {
    return "cents=" + amount.cents();
}

// OUTPUT:
// GET /price?amount=12.50 -> cents=1250`],
            ['Test the converter and the endpoint.',
                r`@Test
void converts() {
    assertEquals(1250, new StringToMoney().convert("12.50").cents());
}

@Test
void badValue() throws Exception {
    mvc.perform(get("/price").param("amount", "abc"))
       .andExpect(status().isBadRequest());
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]],
        [['Registering manually.',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToMoney());
    }
}

// OUTPUT:
// Money parameters now convert in every controller`],
            ['Per-field formats.',
                r`public class EventForm {
    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private LocalDate date;
    @NumberFormat(pattern = "#,##0.00")
    private BigDecimal fee;
}

// OUTPUT:
// date=25/12/2025 and fee=1,500.50 bind to LocalDate and BigDecimal`]]
    ),

    'mvc-webdatabinder': x(
        ['<b>WebDataBinder</b> is the object that binds request parameters onto a target object, converts types, and (optionally) validates the result.',
            '<b>One per attribute</b>: Spring creates a new binder for each <code>@ModelAttribute</code> or <code>@RequestBody</code> argument that needs it.',
            '<b>Results</b>: it fills the target and keeps all problems in a <code>BindingResult</code> that you can receive as the next method argument.'],
        ['<b>Key settings</b>: <code>setAllowedFields</code>, <code>setDisallowedFields</code>, <code>setRequiredFields</code> and <code>setIgnoreUnknownFields</code>.',
            '<b>Registering conversion</b>: <code>registerCustomEditor</code> adds a <code>PropertyEditor</code>, and <code>addCustomFormatter</code> adds a <code>Formatter</code>.',
            '<b>Customizing</b>: use <code>@InitBinder</code> methods in a controller or <code>@ControllerAdvice</code> to configure it.'],
        ['<b>Creation</b>: <code>DefaultDataBinderFactory</code> builds the binder and applies the <code>WebBindingInitializer</code> and all <code>@InitBinder</code> methods.',
            '<b>Class hierarchy</b>: <code>WebDataBinder</code> extends <code>DataBinder</code>, which uses <code>BeanWrapper</code> and a <code>ConversionService</code>.',
            '<b>Security</b>: set allowed fields to stop mass-assignment attacks.'],
        [['F', 'What is WebDataBinder?', 'The Spring class that binds web request parameters to an object and records errors.'],
            ['F', 'Where do you get access to it?', 'As an argument of an @InitBinder method.'],
            ['M', 'How do you stop a field from being bound?', 'Call binder.setDisallowedFields("id") or use setAllowedFields to whitelist.'],
            ['M', 'What does setRequiredFields do?', 'It adds an error when a listed field is missing or empty in the request.'],
            ['S', 'Which factory creates the binder?', 'DefaultDataBinderFactory (ServletRequestDataBinderFactory in MVC), which runs the @InitBinder methods on each new binder.'],
            ['S', 'What is the relation between binding and validation?', 'The binder runs the Validator after binding when @Valid or @Validated is present and adds errors to the same BindingResult.']],
        [['Protecting fields.',
            r`@Controller
public class UserController {

    @InitBinder
    public void init(WebDataBinder binder) {
        binder.setDisallowedFields("id", "role");   // never bind these
        binder.setRequiredFields("email");
    }

    @PostMapping("/users")
    @ResponseBody
    public String save(User user, BindingResult result) {
        return result.hasErrors() ? "errors=" + result.getErrorCount() : "saved";
    }
}

// OUTPUT:
// POST email=a@b.com&role=ADMIN -> saved  (role ignored)
// POST name=Abaji                -> errors=1 (email required)`],
            ['Test that the role is ignored.',
                r`@Test
void roleNotBound() throws Exception {
    mvc.perform(post("/users").param("email", "a@b.com").param("role", "ADMIN"))
       .andExpect(content().string("saved"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Using the binder by hand.',
            r`User user = new User();
WebDataBinder binder = new WebDataBinder(user);
MutablePropertyValues pvs = new MutablePropertyValues();
pvs.add("name", "Abaji");
pvs.add("age", "25");
binder.bind(pvs);
System.out.println(user.getName() + " " + user.getAge()
        + " errors=" + binder.getBindingResult().getErrorCount());

// OUTPUT:
// Abaji 25 errors=0`],
            ['Registering a formatter.',
                r`@InitBinder
void init(WebDataBinder binder) {
    binder.addCustomFormatter(new DateFormatter("yyyy-MM-dd"));
}

// OUTPUT:
// Date fields in this controller accept 2025-12-25`]]
    ),

    'mvc-initbinder': x(
        ['<b>@InitBinder</b> marks a controller method that customizes the <code>WebDataBinder</code> before binding starts for each request.',
            '<b>Typical uses</b>: register custom editors or formatters, trim strings, and allow or block fields.',
            '<b>Signature</b>: the method returns <code>void</code> and takes a <code>WebDataBinder</code> (and optionally a <code>WebRequest</code> or <code>Locale</code>).'],
        ['<b>Scope</b>: inside a controller it affects only that controller; inside a <code>@ControllerAdvice</code> it affects all controllers.',
            '<b>Limit names</b>: <code>@InitBinder("user")</code> applies only to the model attribute or parameter called <code>user</code>.',
            '<b>Trim example</b>: <code>StringTrimmerEditor(true)</code> turns blank input into null, which is handy for optional fields.'],
        ['<b>Run time</b>: it runs for every binder created in a request, so keep it fast and free of database calls.',
            '<b>Pitfall</b>: it does not run for <code>@RequestBody</code> JSON, because Jackson does that conversion, not the binder.',
            '<b>Testing</b>: check the effect with MockMvc, for example that " Abaji " arrives as "Abaji".'],
        [['F', 'What is @InitBinder for?', 'To configure the WebDataBinder, for example register converters or restrict fields.'],
            ['F', 'What does an @InitBinder method return?', 'void.'],
            ['M', 'How do you apply it to one attribute only?', 'Give the attribute name: @InitBinder("user").'],
            ['M', 'How do you make it global?', 'Put the method in a @ControllerAdvice class.'],
            ['S', 'Does @InitBinder affect @RequestBody?', 'No, JSON is handled by HttpMessageConverters, not by the WebDataBinder.'],
            ['S', 'When is the method invoked?', 'Each time a new WebDataBinder is created for an argument, before binding happens.']],
        [['Trim strings and format dates.',
            r`@Controller
public class ProfileController {

    @InitBinder
    public void init(WebDataBinder binder) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
        binder.registerCustomEditor(LocalDate.class, new LocalDateEditor());
    }

    @PostMapping("/profile")
    @ResponseBody
    public String save(String name) {
        return "[" + name + "]";
    }
}

// OUTPUT:
// POST name=%20Abaji%20  -> [Abaji]
// POST name=%20%20      -> [null]`],
            ['Global version.',
                r`@ControllerAdvice
public class GlobalBinding {
    @InitBinder
    public void init(WebDataBinder binder) {
        binder.setDisallowedFields("id");
    }
}

// OUTPUT:
// the id field is never bound in any controller`]],
        [['Scoped to one attribute.',
            r`@InitBinder("order")
void orderBinder(WebDataBinder binder) {
    binder.setAllowedFields("item", "quantity");
}

@InitBinder("customer")
void customerBinder(WebDataBinder binder) {
    binder.setAllowedFields("name");
}

// OUTPUT:
// each model attribute has its own whitelist`],
            ['MockMvc check.',
                r`@Test
void trims() throws Exception {
    mvc.perform(post("/profile").param("name", "  Abaji  "))
       .andExpect(content().string("[Abaji]"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-property-editors': x(
        ['<b>PropertyEditor</b> is the older <code>java.beans</code> API that converts a String to an object and back; Spring MVC still supports it for data binding.',
            '<b>How to write one</b>: extend <code>PropertyEditorSupport</code>, override <code>setAsText</code> to parse and <code>getAsText</code> to print.',
            '<b>Register</b> it in an <code>@InitBinder</code> method with <code>binder.registerCustomEditor(Type.class, editor)</code>.'],
        ['<b>Built-in editors</b>: Spring ships <code>CustomDateEditor</code>, <code>StringTrimmerEditor</code>, <code>CustomNumberEditor</code> and many more.',
            '<b>Call setValue</b>: inside <code>setAsText</code> you must call <code>setValue(object)</code> with the parsed result.',
            '<b>Thread safety</b>: editors are stateful, so create a new one for each binder instead of sharing one instance.'],
        ['<b>Why Converters won</b>: editors are not thread-safe, only convert from String, and are tied to the binder, so modern code prefers <code>Converter</code> and <code>Formatter</code>.',
            '<b>Order</b>: the binder tries a custom editor first, then the <code>ConversionService</code>, then default editors.',
            '<b>Testing</b>: an editor is plain Java, so unit test it by calling <code>setAsText</code> and <code>getValue</code>.'],
        [['F', 'What is a PropertyEditor?', 'A java.beans class that converts between a String and an object, used by Spring for binding.'],
            ['F', 'Which class do you extend?', 'PropertyEditorSupport.'],
            ['M', 'Which methods do you override?', 'setAsText to parse text into an object and getAsText to format it.'],
            ['M', 'Why must you create a new editor for every binder?', 'Editors keep state and are not thread-safe.'],
            ['S', 'Why are Converters preferred today?', 'They are stateless, thread-safe, reusable outside web binding, and registered once globally.'],
            ['S', 'Which is used first, an editor or the ConversionService?', 'Custom editors registered on the binder win; then the ConversionService is tried.']],
        [['A custom editor.',
            r`public class MoneyEditor extends PropertyEditorSupport {
    @Override
    public void setAsText(String text) {
        setValue(new Money(Math.round(Double.parseDouble(text) * 100)));
    }
    @Override
    public String getAsText() {
        Money m = (Money) getValue();
        return m == null ? "" : String.valueOf(m.cents() / 100.0);
    }
}

@InitBinder
void init(WebDataBinder binder) {
    binder.registerCustomEditor(Money.class, new MoneyEditor());
}

// OUTPUT:
// amount=12.50 -> Money[cents=1250]`],
            ['Unit test of the editor.',
                r`@Test
void parses() {
    MoneyEditor e = new MoneyEditor();
    e.setAsText("2.5");
    assertEquals(250, ((Money) e.getValue()).cents());
    assertEquals("2.5", e.getAsText());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Built-in date editor.',
            r`@InitBinder
void init(WebDataBinder binder) {
    SimpleDateFormat f = new SimpleDateFormat("dd-MM-yyyy");
    f.setLenient(false);
    binder.registerCustomEditor(Date.class, new CustomDateEditor(f, true));
}

// OUTPUT:
// date=25-12-2025 binds to java.util.Date; 31-02-2025 gives a field error`],
            ['Trimming blanks to null.',
                r`@InitBinder
void init(WebDataBinder binder) {
    binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
}

// OUTPUT:
// "   " becomes null, "  x " becomes "x"`]]
    ),

    'mvc-converters': x(
        ['<b>Converter</b> is the Spring interface <code>Converter&lt;S, T&gt;</code> with one method, <code>T convert(S source)</code>, that turns one type into another.',
            '<b>Use in MVC</b>: it converts request parameters, path variables and headers (strings) into your own types before a controller runs.',
            '<b>Stateless and thread-safe</b>, so one instance can be shared across all requests.'],
        ['<b>Registering</b>: in Spring Boot, expose the converter as a <code>@Component</code>; otherwise override <code>addFormatters</code> in <code>WebMvcConfigurer</code>.',
            '<b>Variants</b>: <code>ConverterFactory</code> for a family of types (for example all enums) and <code>GenericConverter</code> for several type pairs.',
            '<b>Returning null</b> from a converter means "no value", so handle bad input by throwing <code>IllegalArgumentException</code> instead.'],
        ['<b>ConversionService</b>: <code>WebConversionService</code> (a <code>FormattingConversionService</code>) holds all converters and is used by the binder and by <code>@Value</code>.',
            '<b>Lookup</b>: it searches by source and target type, walking class hierarchies to the closest match.',
            '<b>Testing</b>: call <code>convert</code> in a unit test and add one MockMvc test to prove the endpoint uses it.'],
        [['F', 'What is a Spring Converter?', 'An interface with one method that converts an object of type S to type T.'],
            ['F', 'How do you register one in Spring Boot?', 'Declare it as a bean with @Component and Boot adds it to the MVC conversion service.'],
            ['M', 'Converter versus ConverterFactory?', 'A Converter handles one pair; a ConverterFactory produces converters for a whole hierarchy such as all enum types.'],
            ['M', 'How do you signal invalid input?', 'Throw IllegalArgumentException, which the binder converts to a typeMismatch error.'],
            ['S', 'Which class stores the converters?', 'A FormattingConversionService (WebConversionService in Boot), which implements ConversionService.'],
            ['S', 'Why use a Converter rather than a PropertyEditor?', 'It is type-safe, stateless, thread-safe and works everywhere ConversionService is used.']],
        [['String to enum, case-insensitive.',
            r`public enum Level { LOW, HIGH }

@Component
public class StringToLevel implements Converter<String, Level> {
    @Override
    public Level convert(String s) {
        return Level.valueOf(s.trim().toUpperCase());
    }
}

@GetMapping("/alerts")
@ResponseBody
public String alerts(@RequestParam Level level) {
    return "level=" + level;
}

// OUTPUT:
// GET /alerts?level=high -> level=HIGH`],
            ['Test the endpoint.',
                r`@WebMvcTest(AlertController.class)
@Import(StringToLevel.class)
class AlertControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void lowerCaseWorks() throws Exception {
        mvc.perform(get("/alerts").param("level", "high"))
           .andExpect(content().string("level=HIGH"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['ConverterFactory for all enums.',
            r`public class StringToEnumFactory implements ConverterFactory<String, Enum> {
    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public <T extends Enum> Converter<String, T> getConverter(Class<T> type) {
        return s -> (T) Enum.valueOf(type, s.trim().toUpperCase());
    }
}

// OUTPUT:
// any enum request parameter now accepts lower case text`],
            ['Manual registration.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToLevel());
    }
}

// OUTPUT:
// the converter is active in all controllers`]]
    )
};

export const smvc12Deep: Record<string, Deep> = {
    'mvc-redirect-after-post': dv(
        [`<p>How a redirect travels through Spring MVC:</p><ul><li>The handler returns the string <code>redirect:/orders/42</code>.</li><li><code>ViewNameMethodReturnValueHandler</code> stores it as the view name.</li><li><code>UrlBasedViewResolver</code> sees the prefix and builds a <code>RedirectView</code>.</li><li><code>RedirectView</code> writes the flash attributes to the <code>FlashMapManager</code>, builds the URL and calls <code>sendRedirect</code>.</li><li>On the next request, <code>DispatcherServlet</code> reads the flash map and puts it into the model.</li></ul>`,
            r`@PostMapping("/orders")
public String create(RedirectAttributes ra) {
    ra.addFlashAttribute("msg", "saved");   // stored by SessionFlashMapManager
    return "redirect:/orders/42";           // RedirectView is created
}

// OUTPUT:
// HTTP/1.1 302
// Location: /orders/42
// Set-Cookie: JSESSIONID=... (varies; the flash map lives in the session)`],
        [`<p>Redirect variants:</p><ul><li><b>redirect: prefix</b>: relative to the application context path.</li><li><b>RedirectView</b>: lets you set <code>contextRelative</code>, <code>http10Compatible</code> and the status.</li><li><b>ResponseEntity</b>: full control, for example 303 or 301.</li><li><b>forward: prefix</b>: a server-side forward, no new request.</li><li><b>RedirectAttributes</b>: query parameters versus flash attributes.</li></ul>`,
            r`@GetMapping("/old")
public RedirectView old() {
    RedirectView rv = new RedirectView("/new");
    rv.setStatusCode(HttpStatus.MOVED_PERMANENTLY);   // 301
    return rv;
}

@PostMapping("/x")
public String x() { return "forward:/y"; }   // same request, URL unchanged

// OUTPUT:
// GET /old -> 301 Location: /new
// POST /x  -> handled by /y without a new browser request`],
        [`<p>Common mistakes:</p><ul><li><b>Model data lost</b>: model attributes do not survive a redirect; use flash attributes.</li><li><b>Ugly URLs</b>: model values leaking into the query string; set <code>spring.mvc.ignore-default-model-on-redirect</code> (true by default in Boot).</li><li><b>Redirect to user input</b>: an open redirect vulnerability when you redirect to a URL taken from a parameter; validate it.</li><li><b>Missing slash</b>: <code>redirect:orders</code> is relative to the current path.</li><li><b>Flash on non-redirect</b>: flash data is for the next request only.</li></ul>`,
            r`// BAD: open redirect
@GetMapping("/go")
public String go(@RequestParam String next) {
    return "redirect:" + next;          // attacker can send to evil.com
}

// GOOD: allow only local paths
@GetMapping("/go")
public String go(@RequestParam String next) {
    if (!next.startsWith("/") || next.startsWith("//")) return "redirect:/";
    return "redirect:" + next;
}

// OUTPUT:
// next=https://evil.com -> redirect:/   (blocked)
// next=/home            -> redirect:/home`],
        [`<p>Performance and tuning:</p><ul><li>A redirect costs one extra round trip; that is acceptable for a POST but avoid it for every GET.</li><li>Flash attributes use the HTTP session, so keep them small.</li><li>For stateless services, put the id in the URL instead of a flash attribute.</li><li>Use a 303 status so clients always switch to GET.</li></ul>`,
            r`// stateless alternative: carry what you need in the URL
@PostMapping("/orders")
public String create(RedirectAttributes ra) {
    ra.addAttribute("id", 42);          // becomes ?id=42, no session needed
    return "redirect:/orders/confirm";
}

// OUTPUT:
// 302 Location: /orders/confirm?id=42`],
        [`<p>Real-world scenario: an online shop checkout. The POST charges the card once, then redirects to an order confirmation page that is safe to refresh, bookmark and email.</p><ul><li>The POST creates the order and returns the order id.</li><li>The GET page loads the order by id.</li><li>A unique order token in the form blocks double clicks.</li></ul>`,
            r`@PostMapping("/checkout")
public String checkout(@ModelAttribute Cart cart, @RequestParam String token) {
    long id = checkoutService.placeOnce(cart, token);   // idempotent by token
    return "redirect:/orders/" + id + "/confirmation";
}

@GetMapping("/orders/{id}/confirmation")
public String confirmation(@PathVariable long id, Model model) {
    model.addAttribute("order", orderService.find(id));
    return "confirmation";
}

// OUTPUT:
// POST /checkout -> 302 /orders/1001/confirmation
// F5 on the page -> only GET, no second charge`]
    ),

    'mvc-prg-pattern-post-redirect-get': dv(
        [`<p>PRG works with HTTP and the browser history, not with a Spring trick.</p><ul><li>A browser remembers the last navigation request. After a POST that returns 200, that entry is the POST, so refresh re-sends it.</li><li>After a 302 or 303, the history entry is the GET of the new URL.</li><li>Spring just returns the redirect; <code>DispatcherServlet</code> and <code>RedirectView</code> do the rest.</li><li>The state needed by the GET page is either in the database (read by id) or in a flash attribute.</li></ul>`,
            r`// sequence seen by the server
// 1. POST /signup        -> 302 Location: /signup/done
// 2. GET  /signup/done   -> 200 page
// refresh sends step 2 only

// OUTPUT:
// access log: POST /signup 302, GET /signup/done 200, GET /signup/done 200`],
        [`<p>Variants of the pattern:</p><ul><li><b>Redirect to the created resource</b>: <code>/users/{id}</code>.</li><li><b>Redirect to a list</b> with a flash message.</li><li><b>Redirect back to the form</b> with errors flashed, using <code>BindingResult</code> as a flash attribute.</li><li><b>REST APIs</b>: return 201 Created with a <code>Location</code> header instead of a redirect.</li></ul>`,
            r`// redirect back with errors preserved
@PostMapping("/signup")
public String submit(@Valid SignupForm form, BindingResult br,
                     RedirectAttributes ra) {
    if (br.hasErrors()) {
        ra.addFlashAttribute("org.springframework.validation.BindingResult.form", br);
        ra.addFlashAttribute("form", form);
        return "redirect:/signup";
    }
    return "redirect:/signup/done";
}

// OUTPUT:
// errors and entered values are shown again after a GET /signup`],
        [`<p>Common mistakes:</p><ul><li><b>Redirecting on validation errors</b>: the messages disappear.</li><li><b>Using model.addAttribute</b> instead of flash attributes before a redirect.</li><li><b>Doing work in the GET</b> page such as saving data; GET must stay safe.</li><li><b>Forgetting the form token</b>: PRG alone does not stop two quick clicks.</li></ul>`,
            r`// BAD: state-changing GET target
@GetMapping("/thanks")
public String thanks() {
    mailService.sendReceipt();      // runs on every refresh!
    return "thanks";
}

// GOOD: send the mail in the POST handler, GET only renders
// OUTPUT:
// BAD sends one mail per refresh; GOOD sends exactly one`],
        [`<p>Performance notes:</p><ul><li>PRG adds one cheap request; the GET page can often be served from a cache.</li><li>Prefer reading by id from the database over keeping a large object in a flash attribute.</li><li>With several servers, flash attributes need a shared session or sticky routing.</li></ul>`,
            r`// cluster-friendly: redirect with the id, read from the database
@PostMapping("/report")
public String create(ReportForm form) {
    long id = reportService.save(form);
    return "redirect:/reports/" + id;      // no session state required
}

// OUTPUT:
// works behind any load balancer node`],
        [`<p>Real-world scenario: a registration form in a school portal. The POST validates and saves the student, then redirects to a welcome page. Invalid input stays on the form with messages; valid input never causes a duplicate account on refresh.</p>`,
            r`@PostMapping("/register")
public String register(@Valid StudentForm form, BindingResult br,
                       RedirectAttributes ra) {
    if (br.hasErrors()) return "register";
    Student s = studentService.register(form);
    ra.addFlashAttribute("welcome", "Welcome, " + s.getName());
    return "redirect:/students/" + s.getId();
}

// OUTPUT:
// valid   -> 302 /students/12, banner shown once
// invalid -> 200 register page with field errors`]
    ),

    'mvc-data-binding': dv(
        [`<p>Inside a request:</p><ul><li><code>RequestMappingHandlerAdapter</code> prepares the argument list through <code>HandlerMethodArgumentResolver</code> objects.</li><li><code>ModelAttributeMethodProcessor</code> creates the target object (default constructor, or the primary constructor for records).</li><li>A <code>WebDataBinder</code> is made by the binder factory, which applies <code>@InitBinder</code> methods.</li><li>The binder takes the request parameters as <code>MutablePropertyValues</code> and binds them with <code>BeanWrapper</code>.</li><li>Each value goes through the <code>ConversionService</code> or a <code>PropertyEditor</code>.</li><li>Validation runs, then errors and the target form the <code>BindingResult</code>.</li></ul>`,
            r`// what Spring does for save(UserForm form, BindingResult br), simplified
UserForm target = new UserForm();
WebDataBinder binder = binderFactory.createBinder(webRequest, target, "userForm");
binder.bind(new ServletRequestParameterPropertyValues(request));
binder.validate();                          // only when @Valid is present
BindingResult br = binder.getBindingResult();

// OUTPUT:
// target filled, br.getErrorCount() == 0 for good input`],
        [`<p>Binding sources and options:</p><ul><li><b>@RequestParam</b>: one parameter.</li><li><b>@PathVariable</b>: URI template value.</li><li><b>@ModelAttribute</b>: many parameters into one object.</li><li><b>@RequestHeader, @CookieValue</b>: headers and cookies.</li><li><b>@RequestBody</b>: the body, JSON by Jackson.</li><li><b>@RequestPart</b>: multipart files and parts.</li><li><b>@SessionAttribute</b>: session data.</li></ul>`,
            r`@PostMapping("/demo/{id}")
@ResponseBody
public String demo(@PathVariable long id,
                   @RequestParam String q,
                   @RequestHeader("X-Trace") String trace,
                   @CookieValue(defaultValue = "none") String theme,
                   @ModelAttribute UserForm form) {
    return id + q + trace + theme + form.getName();
}

// OUTPUT:
// each argument comes from a different part of the request`],
        [`<p>Common mistakes:</p><ul><li><b>Binding straight to a JPA entity</b>: mass assignment; use a DTO.</li><li><b>Missing getters and setters</b>: nothing is bound and no error appears.</li><li><b>No BindingResult</b> right after the object: a bad value throws an exception.</li><li><b>Wrong parameter name</b>: HTML field name and property name differ.</li><li><b>Date format</b>: no <code>@DateTimeFormat</code>, so the date does not convert.</li></ul>`,
            r`// BAD: BindingResult not next to the model attribute
@PostMapping("/u")
public String bad(@Valid UserForm f, Model m, BindingResult br) { ... }
// -> MethodArgumentNotValidException / BindException

// GOOD: BindingResult directly after the validated object
@PostMapping("/u")
public String good(@Valid UserForm f, BindingResult br, Model m) {
    return br.hasErrors() ? "form" : "redirect:/ok";
}

// OUTPUT:
// BAD  -> 400 Bad Request with a stack trace in logs
// GOOD -> the form is redisplayed with errors`],
        [`<p>Performance and tuning:</p><ul><li>Binding uses reflection but is cached by <code>BeanWrapper</code> and is rarely a bottleneck.</li><li>Keep form classes small and avoid large nested graphs.</li><li>Limit list growth with <code>setAutoGrowCollectionLimit</code>.</li><li>Use <code>setAllowedFields</code> to ignore unwanted input early.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.setAutoGrowCollectionLimit(50);
    binder.setAllowedFields("name", "age", "items[*].name");
}

// OUTPUT:
// items[100].name is rejected, and unknown fields are skipped`],
        [`<p>Real-world scenario: a job application form with personal data, an address and a list of skills. One DTO gets all fields; validation messages come back on the same page.</p>`,
            r`public class ApplicationForm {
    @NotBlank private String name;
    @Email private String email;
    private Address address = new Address();
    private List<String> skills = new ArrayList<>();
    // getters and setters
}

@PostMapping("/apply")
public String apply(@Valid ApplicationForm form, BindingResult br) {
    if (br.hasErrors()) return "apply";
    applicationService.save(form);
    return "redirect:/apply/thanks";
}

// OUTPUT:
// POST name=Abaji&email=a@b.com&address.city=Pune&skills=java&skills=sql -> 302`]
    ),

    'mvc-property-binding': dv(
        [`<p>The path <code>items[0].name</code> is handled by <code>BeanWrapperImpl</code>:</p><ul><li>It splits the path into tokens: <code>items</code>, index <code>0</code>, then <code>name</code>.</li><li>It reads <code>getItems()</code>; if the value is null and auto-grow is on, it creates a new list.</li><li>It grows the list to size 1 and creates an <code>Item</code> instance using its default constructor.</li><li>It calls <code>setName</code> with the converted value.</li></ul>`,
            r`BeanWrapper bw = new BeanWrapperImpl(new Order());
bw.setAutoGrowNestedPaths(true);
bw.setPropertyValue("address.city", "Pune");
bw.setPropertyValue("items[1].name", "ink");
Order o = (Order) bw.getWrappedInstance();
System.out.println(o.getAddress().getCity() + " " + o.getItems().size());

// OUTPUT:
// Pune 2`],
        [`<p>Syntax summary:</p><ul><li><code>name</code>: simple property.</li><li><code>address.city</code>: nested property.</li><li><code>items[0]</code> or <code>items[0].name</code>: list or array index.</li><li><code>tags[color]</code>: map key.</li><li><code>skills=a&amp;skills=b</code>: repeated parameter into a list or array.</li><li><code>_flag</code> prefix (<code>_subscribe</code>): marker for unchecked checkboxes.</li><li><code>!field</code> prefix: default value when the field is absent.</li></ul>`,
            r`public class Settings {
    private boolean subscribe;
    private String[] skills;
    // getters and setters
}

@PostMapping("/settings")
@ResponseBody
public String save(Settings s) {
    return s.isSubscribe() + " " + Arrays.toString(s.getSkills());
}

// OUTPUT:
// POST skills=a&skills=b&_subscribe=on  -> false [a, b]
// POST skills=a&subscribe=true          -> true [a]`],
        [`<p>Common mistakes:</p><ul><li><b>Null nested object</b> when auto-grow is disabled, giving <code>NullValueInNestedPathException</code>.</li><li><b>Missing default constructor</b> on the list element class.</li><li><b>Index gaps</b>: <code>items[5]</code> creates five empty items.</li><li><b>Property name case</b>: <code>setURL</code> maps to <code>URL</code>, not <code>url</code>.</li><li><b>Typos</b> in names are silently ignored.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.setIgnoreUnknownFields(false);   // typos now become errors
}

// OUTPUT:
// POST adress.city=Pune -> field error "adress.city" is not a known property`],
        [`<p>Performance and tuning:</p><ul><li>Large indexes allocate many objects; cap them with <code>autoGrowCollectionLimit</code>.</li><li>Prefer a flat form class for simple forms.</li><li>Direct field access avoids setter calls but skips setter logic.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.setAutoGrowCollectionLimit(20);  // default is 256
}

// OUTPUT:
// items[500].name -> IndexOutOfBoundsException (becomes a binding error)`],
        [`<p>Real-world scenario: an invoice form where the user can add lines dynamically. JavaScript names the inputs <code>lines[0].product</code>, <code>lines[0].qty</code>, <code>lines[1].product</code> and so on, and Spring builds the list.</p>`,
            r`public class InvoiceForm {
    private List<Line> lines = new ArrayList<>();
    // getter and setter
}
public class Line {
    private String product;
    private int qty;
    public Line() { }                       // needed for auto-grow
    // getters and setters
}

@PostMapping("/invoices")
@ResponseBody
public String create(InvoiceForm f) { return "lines=" + f.getLines().size(); }

// OUTPUT:
// lines[0].product=pen&lines[0].qty=2&lines[1].product=ink&lines[1].qty=1
// -> lines=2`]
    ),

    'mvc-automatic-binding': dv(
        [`<p>Argument resolution order in <code>RequestMappingHandlerAdapter</code>:</p><ul><li>Annotation-based resolvers first (<code>@RequestParam</code>, <code>@PathVariable</code>, <code>@RequestBody</code>, ...).</li><li>Type-based resolvers next (<code>Model</code>, <code>HttpServletRequest</code>, <code>Principal</code>, <code>Locale</code>).</li><li>Custom resolvers you registered.</li><li>Catch-all resolvers last: simple types become <code>@RequestParam</code>, everything else becomes <code>@ModelAttribute</code>.</li></ul>`,
            r`// Simplified view of the catch-all rule
if (BeanUtils.isSimpleProperty(parameterType)) {
    resolver = new RequestParamMethodArgumentResolver(true);   // by name
} else {
    resolver = new ServletModelAttributeMethodProcessor(true); // bean binding
}

// OUTPUT:
// String name -> request parameter; UserForm form -> model attribute`],
        [`<p>Automatic does not mean fixed. You can change it:</p><ul><li><b>@ModelAttribute("name")</b> to change the model name.</li><li><b>@ModelAttribute method</b> to preload data into every request.</li><li><b>@RequestParam(required = false)</b> or <code>Optional</code> for optional values.</li><li><b>Custom HandlerMethodArgumentResolver</b> to bind your own argument type, such as <code>CurrentUser</code>.</li></ul>`,
            r`@Component
public class CurrentUserResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.getParameterType() == CurrentUser.class;
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer mc,
            NativeWebRequest req, WebDataBinderFactory f) {
        return new CurrentUser(req.getHeader("X-User"));
    }
}

// OUTPUT:
// any controller can now declare a CurrentUser argument`],
        [`<p>Common mistakes:</p><ul><li><b>int instead of Integer</b> for optional input: absent value gives an error.</li><li><b>Compiling without -parameters</b> (non-Boot builds) so names are lost.</li><li><b>Two beans with the same attribute name</b> clashing in the model.</li><li><b>Mutable shared form objects</b> kept as fields in the controller; controllers are singletons.</li></ul>`,
            r`// BAD: state in a singleton controller
@Controller
public class BadController {
    private UserForm form;                // shared between requests!
    @PostMapping("/u") public String save(UserForm f) {
        this.form = f;
        return "ok";
    }
}

// GOOD: keep form data in method arguments only
// OUTPUT:
// BAD: two users can see each other's data under load`],
        [`<p>Performance and tuning:</p><ul><li>Resolver lookup is cached per parameter.</li><li>Do not do database access inside argument resolvers on hot paths unless it is cached.</li><li>Use records for immutable, small form objects.</li></ul>`,
            r`public record SearchForm(String q, int page) { }

@GetMapping("/search")
@ResponseBody
public String search(SearchForm f) { return f.q() + "#" + f.page(); }

// OUTPUT:
// GET /search?q=java&page=2 -> java#2`],
        [`<p>Real-world scenario: a search page. Filters (text, category, page, sort) arrive as query parameters and are bound in one object, which is then passed to a service.</p>`,
            r`public record ProductFilter(String text, String category,
                            Integer page, String sort) { }

@GetMapping("/products")
public String list(ProductFilter f, Model model) {
    int page = f.page() == null ? 0 : f.page();
    model.addAttribute("items", productService.search(f.text(), f.category(), page));
    return "products";
}

// OUTPUT:
// GET /products?text=pen&category=office -> page 0 of matching products`]
    ),

    'mvc-custom-data-binding': dv(
        [`<p>How a custom type is bound:</p><ul><li>The binder asks its <code>TypeConverterDelegate</code> to convert the String to your target type.</li><li>Order of attempts: custom <code>PropertyEditor</code> on the binder, then the <code>ConversionService</code> (your Converter or Formatter), then default editors, then a constructor or <code>valueOf</code> taking a String.</li><li>If nothing works, a <code>TypeMismatchException</code> becomes a field error.</li></ul>`,
            r`// A class with a static valueOf(String) needs no converter at all
public record Email(String value) {
    public static Email valueOf(String s) {
        if (!s.contains("@")) throw new IllegalArgumentException("bad email");
        return new Email(s);
    }
}

// OUTPUT:
// @RequestParam Email e works with e=a@b.com`],
        [`<p>Options:</p><ul><li><b>Converter</b> for one direction.</li><li><b>Formatter</b> for text in both directions with a Locale.</li><li><b>AnnotationFormatterFactory</b> for your own format annotation, such as <code>@Phone</code>.</li><li><b>ConditionalGenericConverter</b> to decide by field annotations.</li><li><b>HttpMessageConverter</b> for bodies, not parameters.</li></ul>`,
            r`@Component
public class MoneyFormatter implements Formatter<Money> {
    public Money parse(String text, Locale locale) throws ParseException {
        return new Money(Math.round(Double.parseDouble(text) * 100));
    }
    public String print(Money m, Locale locale) {
        return String.format(locale, "%.2f", m.cents() / 100.0);
    }
}

// OUTPUT:
// parse("12.50") -> Money[cents=1250]; print -> 12.50`],
        [`<p>Common mistakes:</p><ul><li><b>Returning null</b> on bad input, so the field is silently empty.</li><li><b>Forgetting to register</b> the converter (plain class, no <code>@Component</code>).</li><li><b>Using the wrong generic types</b>: <code>Converter&lt;Object, Money&gt;</code> may clash with others.</li><li><b>Shared editor instances</b> used from many threads.</li><li><b>Expecting JSON bodies to use it</b>: Jackson needs its own deserializer.</li></ul>`,
            r`// BAD: silently ignores bad input
public Money convert(String s) {
    try { return parse(s); } catch (Exception e) { return null; }
}

// GOOD: report it
public Money convert(String s) {
    try { return parse(s); }
    catch (NumberFormatException e) {
        throw new IllegalArgumentException("not a number: " + s, e);
    }
}

// OUTPUT:
// BAD  -> money is null, later NullPointerException
// GOOD -> 400 with a clear field error`],
        [`<p>Performance and tuning:</p><ul><li>Converters are singletons, so keep them stateless and cheap.</li><li>Cache expensive lookups, for example <code>String</code> to entity, or avoid converting to entities and pass the id instead.</li><li>Prefer the built-in <code>@DateTimeFormat</code> over hand-written parsing.</li></ul>`,
            r`// Converter that loads an entity: use a cache
@Component
public class StringToCategory implements Converter<String, Category> {
    private final Map<String, Category> cache = new ConcurrentHashMap<>();
    private final CategoryRepository repo;
    public StringToCategory(CategoryRepository repo) { this.repo = repo; }
    public Category convert(String code) {
        return cache.computeIfAbsent(code, c -> repo.findByCode(c).orElseThrow(
            () -> new IllegalArgumentException("unknown category " + c)));
    }
}

// OUTPUT:
// the database is queried once per category code`],
        [`<p>Real-world scenario: a finance screen with amounts like <code>12,50</code> in one locale and <code>12.50</code> in another. A <code>Formatter</code> using the request <code>Locale</code> parses and prints both consistently.</p>`,
            r`@Component
public class LocaleMoneyFormatter implements Formatter<Money> {
    public Money parse(String t, Locale l) throws ParseException {
        Number n = NumberFormat.getInstance(l).parse(t);
        return new Money(Math.round(n.doubleValue() * 100));
    }
    public String print(Money m, Locale l) {
        return NumberFormat.getInstance(l).format(m.cents() / 100.0);
    }
}

// OUTPUT:
// Locale.GERMANY: "12,50" -> Money[cents=1250]; Locale.US: "12.50" -> same`]
    ),

    'mvc-webdatabinder': dv(
        [`<p>Class structure and flow:</p><ul><li><code>DataBinder</code> holds the target, a <code>BindingResult</code>, validators and conversion settings.</li><li><code>WebDataBinder</code> adds web features: the <code>_</code> and <code>!</code> field prefixes and multipart support.</li><li><code>ServletRequestDataBinder</code> reads parameters from a <code>ServletRequest</code>.</li><li><code>bind()</code> checks allowed and disallowed fields, checks required fields, then calls <code>applyPropertyValues</code>.</li><li>Errors are stored as <code>FieldError</code> objects with codes used for message lookup.</li></ul>`,
            r`ServletRequestDataBinder binder = new ServletRequestDataBinder(target, "user");
binder.setConversionService(conversionService);
binder.bind(request);                       // filter, convert, set
BindingResult br = binder.getBindingResult();
for (FieldError e : br.getFieldErrors()) {
    System.out.println(e.getField() + " " + e.getCode());
}

// OUTPUT:
// age typeMismatch`],
        [`<p>Main configuration methods:</p><ul><li><code>setAllowedFields</code> / <code>setDisallowedFields</code>: whitelist or blacklist, patterns allowed.</li><li><code>setRequiredFields</code>: must be present.</li><li><code>setIgnoreInvalidFields</code>, <code>setIgnoreUnknownFields</code>.</li><li><code>setFieldMarkerPrefix</code> and <code>setFieldDefaultPrefix</code>.</li><li><code>setValidator</code> / <code>addValidators</code>.</li><li><code>setConversionService</code>, <code>registerCustomEditor</code>.</li><li><code>setBindEmptyMultipartFiles</code>.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.addValidators(new PasswordMatchValidator());
    binder.setDisallowedFields("admin");
    binder.setIgnoreInvalidFields(false);
}

// OUTPUT:
// the extra validator runs after binding, together with bean validation`],
        [`<p>Common mistakes:</p><ul><li><b>Forgetting to disallow sensitive fields</b>: <code>id</code>, <code>role</code>, <code>price</code>.</li><li><b>Setting a validator with setValidator</b> that replaces the default bean validator; use <code>addValidators</code>.</li><li><b>Using the same editor instance</b> in every request.</li><li><b>Reading BindingResult before binding</b> finishes.</li></ul>`,
            r`// BAD: replaces the Jakarta Bean Validation validator
binder.setValidator(new PasswordMatchValidator());

// GOOD: adds to it
binder.addValidators(new PasswordMatchValidator());

// OUTPUT:
// BAD  -> @NotBlank and other annotations stop working
// GOOD -> annotations and the custom validator both run`],
        [`<p>Performance and tuning:</p><ul><li>A binder is created per argument per request; its cost is small but not zero, so keep <code>@InitBinder</code> methods light.</li><li>Use patterns in allowed fields to avoid long lists.</li><li>Do not create a new <code>SimpleDateFormat</code> per call outside the binder scope; they are not thread-safe.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder binder) {
    // new editor per binder because the format object is not thread-safe
    binder.registerCustomEditor(Date.class,
        new CustomDateEditor(new SimpleDateFormat("yyyy-MM-dd"), true));
}

// OUTPUT:
// safe under concurrent requests`],
        [`<p>Real-world scenario: an admin profile edit page. The form is bound to the user entity, so the binder protects fields that must not be changed from the browser.</p>`,
            r`@Controller
public class ProfileController {
    @InitBinder("user")
    void init(WebDataBinder binder) {
        binder.setAllowedFields("name", "phone", "address.*");
    }

    @PostMapping("/profile")
    public String save(@ModelAttribute("user") User user, BindingResult br) {
        if (br.hasErrors()) return "profile";
        userService.update(user);
        return "redirect:/profile";
    }
}

// OUTPUT:
// POST name=Abaji&role=ADMIN -> name updated, role ignored`]
    ),

    'mvc-initbinder': dv(
        [`<p>Discovery and execution:</p><ul><li><code>RequestMappingHandlerAdapter</code> scans the controller class (and every <code>@ControllerAdvice</code>) for methods annotated with <code>@InitBinder</code> and caches them.</li><li>When an argument needs binding, <code>ServletRequestDataBinderFactory</code> creates the binder.</li><li><code>InitBinderDataBinderFactory</code> invokes each matching method, filtering by the optional attribute names.</li><li>Methods from advice run first, then those of the controller.</li></ul>`,
            r`// conceptual flow
WebDataBinder binder = createBinder(request, target, "user");
for (InvocableHandlerMethod m : initBinderMethods) {
    if (m.appliesTo("user")) m.invokeForRequest(request, null, binder);
}
// after this the binder is ready for bind()

// OUTPUT:
// @InitBinder methods run once per binder, before binding`],
        [`<p>Variants:</p><ul><li><code>@InitBinder</code>: all attributes in this controller.</li><li><code>@InitBinder("a", "b")</code>: named attributes only.</li><li>In <code>@ControllerAdvice</code>: all controllers, or narrowed by <code>basePackages</code> or <code>assignableTypes</code>.</li><li>Extra arguments: <code>WebRequest</code>, <code>Locale</code>, <code>HttpServletRequest</code>.</li></ul>`,
            r`@ControllerAdvice(basePackages = "com.school.web")
public class BindingAdvice {

    @InitBinder
    void init(WebDataBinder binder, Locale locale) {
        binder.addCustomFormatter(new DateFormatter("dd/MM/yyyy"), LocalDate.class.getName());
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }
}

// OUTPUT:
// controllers in com.school.web trim strings and parse dates`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong return type</b>: a non-void method fails at startup.</li><li><b>Name mismatch</b>: <code>@InitBinder("user")</code> but the attribute is <code>userForm</code>, so it never runs.</li><li><b>Expecting it to run for @RequestBody</b>.</li><li><b>Heavy work</b> such as database calls in the method.</li><li><b>Trimming passwords</b> globally by accident.</li></ul>`,
            r`// BAD: name does not match, never applied
@InitBinder("user")
void init(WebDataBinder b) { b.setDisallowedFields("id"); }

@PostMapping("/save")
public String save(@ModelAttribute UserForm userForm) { ... }   // name is userForm

// GOOD: match the real name
@InitBinder("userForm")

// OUTPUT:
// BAD: id is still bound; GOOD: id is blocked`],
        [`<p>Performance and tuning:</p><ul><li>The method list is cached, so the cost is one invocation per binder.</li><li>Create editors with new instances only when they are not thread-safe.</li><li>Put shared rules in one advice class instead of repeating them.</li></ul>`,
            r`private static final DateFormatter FORMATTER = new DateFormatter("yyyy-MM-dd");

@InitBinder
void init(WebDataBinder binder) {
    binder.addCustomFormatter(FORMATTER);    // Formatter is thread-safe, reuse it
}

// OUTPUT:
// no per-request allocation of a formatter`],
        [`<p>Real-world scenario: a student portal where every text field must be trimmed and empty strings stored as null, and the <code>id</code> and <code>createdBy</code> fields must never come from a browser. One advice class covers all controllers.</p>`,
            r`@ControllerAdvice
public class PortalBinding {
    @InitBinder
    public void init(WebDataBinder binder) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
        binder.setDisallowedFields("id", "createdBy", "createdAt");
    }
}

// OUTPUT:
// "  Abaji " -> "Abaji", "" -> null, id and createdBy never bound`]
    ),

    'mvc-property-editors': dv(
        [`<p>Inside the binder:</p><ul><li><code>PropertyEditorRegistrySupport</code> keeps default editors (numbers, booleans, <code>Class</code>, <code>Locale</code>, ...) and custom editors.</li><li><code>TypeConverterDelegate</code> looks up a custom editor by type or by type plus property path.</li><li>It calls <code>setAsText</code>, then <code>getValue</code> to get the result.</li><li>For output (for example in a form tag), <code>getAsText</code> is used.</li></ul>`,
            r`PropertyEditor ed = new CustomNumberEditor(Integer.class, true);
ed.setAsText("42");
Integer v = (Integer) ed.getValue();
ed.setAsText("");                       // allowEmpty = true
System.out.println(v + " " + ed.getValue());

// OUTPUT:
// 42 null`],
        [`<p>Registration variants:</p><ul><li><code>registerCustomEditor(Type.class, editor)</code>: for every property of that type.</li><li><code>registerCustomEditor(Type.class, "field", editor)</code>: for one property path.</li><li><code>PropertyEditorRegistrar</code>: a reusable set of editors shared by many binders.</li><li><code>CustomCollectionEditor</code>: converts a comma list or array into a collection.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.registerCustomEditor(Date.class, "birthDate",
        new CustomDateEditor(new SimpleDateFormat("dd-MM-yyyy"), false));
    binder.registerCustomEditor(Set.class, "tags",
        new CustomCollectionEditor(TreeSet.class));
}

// OUTPUT:
// only the birthDate property uses the date editor`],
        [`<p>Common mistakes:</p><ul><li><b>Not calling setValue</b>, so the property stays null.</li><li><b>Sharing one editor in a static field</b> across threads.</li><li><b>Lenient SimpleDateFormat</b>: 31-02 becomes 03-03; call <code>setLenient(false)</code>.</li><li><b>Throwing the wrong exception</b>: use <code>IllegalArgumentException</code> for bad text.</li><li><b>Using editors for new code</b> where a Converter is better.</li></ul>`,
            r`// BAD: setAsText forgets setValue
public void setAsText(String text) {
    Money m = parse(text);            // never stored
}

// GOOD
public void setAsText(String text) {
    setValue(parse(text));
}

// OUTPUT:
// BAD -> property is null; GOOD -> property is set`],
        [`<p>Performance and tuning:</p><ul><li>An editor is created for each binder, so keep construction cheap.</li><li>Prefer thread-safe converters and formatters to avoid allocation on each request.</li><li>Use <code>DateTimeFormatter</code>-based formatters instead of <code>SimpleDateFormat</code>.</li></ul>`,
            r`// modern replacement for a date editor: annotation, no editor needed
public class EventForm {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate day;
}

// OUTPUT:
// day=2025-12-25 binds with no custom code`],
        [`<p>Real-world scenario: maintaining an old Spring MVC application that has a <code>BirthDateEditor</code> in many controllers. The migration plan moves them to one global <code>Formatter</code> registered in <code>WebMvcConfigurer</code>.</p>`,
            r`// before: repeated in every controller
@InitBinder
void init(WebDataBinder b) {
    b.registerCustomEditor(LocalDate.class, new BirthDateEditor());
}

// after: one global registration
@Override
public void addFormatters(FormatterRegistry registry) {
    registry.addFormatter(new LocalDateFormatter("dd-MM-yyyy"));
}

// OUTPUT:
// all controllers share one thread-safe formatter`]
    ),

    'mvc-converters': dv(
        [`<p>The conversion machinery:</p><ul><li><code>GenericConversionService</code> stores converters in a map keyed by <code>ConvertiblePair</code> (source type, target type).</li><li>Lookup walks the class hierarchy of both types and picks the closest registered pair, with a cache.</li><li><code>Converter</code> is adapted to a <code>GenericConverter</code> internally.</li><li>Spring Boot builds a <code>WebConversionService</code> and adds all <code>Converter</code>, <code>GenericConverter</code> and <code>Formatter</code> beans.</li><li>The binder, <code>@RequestParam</code>, <code>@PathVariable</code> and <code>@Value</code> all use it.</li></ul>`,
            r`DefaultConversionService cs = new DefaultConversionService();
cs.addConverter(new StringToLevel());
Level lv = cs.convert("high", Level.class);
List<Integer> nums = cs.convert("1,2,3", List.class);   // built-in String to collection
System.out.println(lv + " " + nums);

// OUTPUT:
// HIGH [1, 2, 3]`],
        [`<p>Converter types:</p><ul><li><b>Converter&lt;S,T&gt;</b>: one pair.</li><li><b>ConverterFactory&lt;S,R&gt;</b>: one source, a family of targets.</li><li><b>GenericConverter</b>: several pairs and access to <code>TypeDescriptor</code> with annotations.</li><li><b>ConditionalConverter</b>: decide at run time with <code>matches</code>.</li><li><b>Built-in</b>: String to numbers, enums, dates, collections, <code>Optional</code>.</li></ul>`,
            r`public class IdToUserConverter implements GenericConverter {
    public Set<ConvertiblePair> getConvertibleTypes() {
        return Set.of(new ConvertiblePair(String.class, User.class),
                      new ConvertiblePair(Long.class, User.class));
    }
    public Object convert(Object src, TypeDescriptor from, TypeDescriptor to) {
        return users.findById(Long.valueOf(src.toString())).orElseThrow();
    }
}

// OUTPUT:
// @PathVariable User user receives the loaded entity for /users/5`],
        [`<p>Common mistakes:</p><ul><li><b>Not a bean</b> in a Boot app, so it is never used.</li><li><b>Ambiguous converters</b> for overlapping types.</li><li><b>Returning null</b> for bad data.</li><li><b>Hidden database calls</b> in a converter without caching.</li><li><b>Expecting it for JSON bodies</b>: Jackson does not use the Spring ConversionService.</li><li><b>@WebMvcTest without the converter</b>: import it with <code>@Import</code>.</li></ul>`,
            r`// BAD: slice test fails with "Failed to convert String to Level"
@WebMvcTest(AlertController.class)
class T { }

// GOOD: converters are not scanned in a slice, so import them
@WebMvcTest(AlertController.class)
@Import(StringToLevel.class)
class T { }

// OUTPUT:
// BAD  -> 400 MethodArgumentTypeMismatchException
// GOOD -> test passes`],
        [`<p>Performance and tuning:</p><ul><li>The conversion lookup is cached; converting is cheap for simple types.</li><li>Keep converters stateless so one instance serves every thread.</li><li>Avoid converting to entities in the converter on high-traffic endpoints; pass the id and load in the service.</li></ul>`,
            r`// cheaper: pass the id, load once where you need it
@GetMapping("/users/{id}")
public String show(@PathVariable long id, Model m) {
    m.addAttribute("user", userService.find(id));
    return "user";
}

// OUTPUT:
// one query, and the controller stays easy to test`],
        [`<p>Real-world scenario: an API that accepts <code>?status=active</code> and <code>?since=2025-01-31</code>. One converter maps text to an enum, and <code>@DateTimeFormat</code> handles the date; both are covered by a single MockMvc test.</p>`,
            r`@GetMapping("/tickets")
@ResponseBody
public String tickets(@RequestParam Status status,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate since) {
    return status + " since " + since;
}

@Test
void filters() throws Exception {
    mvc.perform(get("/tickets").param("status", "active").param("since", "2025-01-31"))
       .andExpect(content().string("ACTIVE since 2025-01-31"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    )
};
