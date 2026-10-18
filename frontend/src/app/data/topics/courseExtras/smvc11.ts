// Spring extras, batch smvc11 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc11Extras: Record<string, Extra> = {
    'mvc-form-submission': x(
        ['<b>Form submission</b> is the browser sending the field values of an HTML <code>&lt;form&gt;</code> to the server as a request, usually <code>application/x-www-form-urlencoded</code> through POST.',
            '<b>Spring MVC flow</b>: the <code>DispatcherServlet</code> picks a handler, binds the parameters to an object, validates it and then returns a view or a redirect.',
            '<b>Two handlers</b> are typical: a <code>@GetMapping</code> that shows the empty form and a <code>@PostMapping</code> that receives it.'],
        ['<b>Post-Redirect-Get</b>: after a successful POST return <code>redirect:/...</code> so a browser refresh does not submit the form twice.',
            '<b>Flash attributes</b> (<code>RedirectAttributes.addFlashAttribute</code>) carry a one-time message across the redirect.',
            '<b>Content types</b>: a plain form sends urlencoded data, a file form needs <code>multipart/form-data</code>.'],
        ['<b>CSRF</b>: Spring Security rejects a POST without the token, so Thymeleaf forms add a hidden <code>_csrf</code> field automatically.',
            '<b>Hidden method</b>: browsers only send GET and POST, so PUT or DELETE from a form needs <code>HiddenHttpMethodFilter</code> or a JavaScript call.',
            '<b>Double submit</b>: besides PRG, disable the button on click or use an idempotency token for payments.'],
        [['F', 'What does a browser send when a form is submitted?', 'It sends the field names and values as request parameters, in the query string for GET or in the body for POST.'],
            ['F', 'Which annotation handles the submitted form?', '@PostMapping on a controller method, usually with a form object as a parameter.'],
            ['M', 'What is Post-Redirect-Get?', 'The POST handler redirects to a GET URL after success, so refreshing the page does not repeat the submission.'],
            ['M', 'How do you show a success message after a redirect?', 'Use RedirectAttributes.addFlashAttribute, which stores the value in the session for one request.'],
            ['S', 'Why does a POST from a form get a 403 with Spring Security?', 'The CSRF token is missing; add the hidden _csrf field or use the Thymeleaf th:action which adds it.'],
            ['S', 'How does Spring read the urlencoded body?', 'The servlet container parses it into parameters and the ServletModelAttributeMethodProcessor binds them to the object.']],
        [['Show a form and receive it.',
            r`@Controller
@RequestMapping("/register")
public class RegisterController {
    @GetMapping
    public String show(Model model) {
        model.addAttribute("form", new RegisterForm());
        return "register";
    }

    @PostMapping
    public String submit(@ModelAttribute("form") RegisterForm form) {
        System.out.println("Registering " + form.getName());
        return "redirect:/register/done";
    }
}

// OUTPUT:
// GET  /register       -> 200 view "register"
// POST /register name=Abaji -> prints "Registering Abaji", 302 Location: /register/done`],
            ['Test the submission with MockMvc.',
                r`mockMvc.perform(post("/register")
        .param("name", "Abaji")
        .param("email", "abaji@example.com"))
    .andExpect(status().is3xxRedirection())
    .andExpect(redirectedUrl("/register/done"));

// OUTPUT:
// MockHttpServletResponse: Status = 302, Redirected URL = /register/done
// Test passed`]],
        [['Flash message after redirect.',
            r`@PostMapping
public String submit(RegisterForm form, RedirectAttributes ra) {
    service.register(form);
    ra.addFlashAttribute("msg", "Welcome " + form.getName());
    return "redirect:/register/done";
}

// OUTPUT:
// POST /register   -> 302 /register/done
// GET  /register/done -> model contains msg = "Welcome Abaji" (shown once)`],
            ['Plain HTML form with CSRF (Thymeleaf).',
                r`<form th:action="@{/register}" method="post">
    <input type="text" name="name"/>
    <button type="submit">Save</button>
</form>

<!-- OUTPUT: rendered HTML -->
// <form action="/register" method="post">
//   <input type="hidden" name="_csrf" value="a1b2..."/>   (token varies)`]]
    ),
    'mvc-form-data-binding': x(
        ['<b>Data binding</b> copies request parameters into the fields of a Java object by name, converting each text value to the field type.',
            '<b>Name match</b>: a parameter <code>age=30</code> goes to <code>setAge(int)</code>; nested names such as <code>address.city</code> reach nested objects.',
            '<b>Binder</b>: the work is done by <code>WebDataBinder</code> with a <code>ConversionService</code>; a failed conversion becomes a field error, not a crash.'],
        ['<b>Lists and maps</b>: <code>items[0].name</code> binds into a <code>List</code>; the list grows automatically up to a limit (autoGrowCollectionLimit).',
            '<b>@InitBinder</b> registers custom editors, formatters or allowed fields for one controller.',
            '<b>@DateTimeFormat</b> and <b>@NumberFormat</b> on a field tell the binder how to parse dates and numbers.'],
        ['<b>Mass assignment</b>: binding a JPA entity directly lets a client set fields like <code>role</code>; bind a DTO or call <code>setAllowedFields</code>.',
            '<b>Constructor binding</b>: with records or a single constructor Spring 6 binds through the constructor, so objects can be immutable.',
            '<b>typeMismatch</b> errors keep the rejected value, so the form can show what the user typed.'],
        [['F', 'What is data binding?', 'Copying request parameters into the properties of an object by matching names.'],
            ['F', 'What happens with age=abc for an int field?', 'The binder cannot convert it, records a typeMismatch field error in BindingResult and the handler can show the form again.'],
            ['M', 'How do you bind a date field?', 'Annotate it with @DateTimeFormat(pattern = "yyyy-MM-dd") or register a formatter.'],
            ['M', 'How are nested objects bound?', 'With dotted names such as address.city; the binder creates the nested object when needed.'],
            ['S', 'How do you prevent mass assignment?', 'Bind to a dedicated form DTO, or use @InitBinder with setAllowedFields or setDisallowedFields.'],
            ['S', 'Which class performs binding?', 'WebDataBinder, created by the DataBinderFactory for each @ModelAttribute argument.']],
        [['Bind nested and date fields.',
            r`public class OrderForm {
    private String customer;
    private Address address = new Address();
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate;
    // getters and setters omitted
}
// POST /order?customer=Raoji&address.city=Pune&deliveryDate=2026-11-01

// OUTPUT:
// form.customer = Raoji
// form.address.city = Pune
// form.deliveryDate = 2026-11-01`],
            ['Restrict bound fields.',
                r`@InitBinder
public void init(WebDataBinder binder) {
    binder.setAllowedFields("name", "email");
}
// POST /register?name=Abaji&email=a@x.com&role=ADMIN

// OUTPUT:
// name = Abaji, email = a@x.com, role = null (ignored)`]],
        [['Bind a list of items.',
            r`public class CartForm {
    private List<Item> items = new ArrayList<>();
    // getter and setter
}
// POST /cart?items[0].sku=A1&items[1].sku=B2

// OUTPUT:
// items.size() = 2
// items[1].sku = B2`],
            ['Binding error is kept, not thrown.',
                r`@PostMapping("/age")
public String age(@ModelAttribute PersonForm f, BindingResult br) {
    System.out.println(br.getFieldError("age"));
    return "age";
}
// POST /age?age=abc

// OUTPUT:
// Field error in object 'personForm' on field 'age': rejected value [abc];
// codes [typeMismatch.personForm.age,typeMismatch.age,typeMismatch.int,typeMismatch]`]]
    ),
    'mvc-modelattribute': x(
        ['<b>@ModelAttribute</b> marks a method parameter that Spring binds from request data and adds to the model, or a method that adds data to the model before every handler.',
            '<b>On a parameter</b>: <code>@ModelAttribute("form") RegisterForm form</code> creates the object, binds the parameters and exposes it to the view under the name <code>form</code>.',
            '<b>Default name</b>: without a name Spring uses the decapitalized class name, so <code>RegisterForm</code> becomes <code>registerForm</code>.'],
        ['<b>On a method</b>: a <code>@ModelAttribute</code> method runs before each handler of the controller and puts its return value in the model, good for dropdown lists.',
            '<b>Optional annotation</b>: a non-simple parameter type with no annotation is treated as <code>@ModelAttribute</code> by default.',
            '<b>Not for JSON</b>: <code>@ModelAttribute</code> reads form parameters; use <code>@RequestBody</code> for a JSON body.'],
        ['<b>Resolver</b>: <code>ModelAttributeMethodProcessor</code> (servlet version) creates, binds and validates the object.',
            '<b>Order</b>: the controller @ModelAttribute methods run first, then the handler, so a handler can rely on the shared data.',
            '<b>Session reuse</b>: with <code>@SessionAttributes</code> the object survives between requests, which suits multi-step wizards.'],
        [['F', 'What does @ModelAttribute on a parameter do?', 'It binds request parameters to the object and adds it to the model.'],
            ['F', 'What is the default model name?', 'The decapitalized simple class name, for example registerForm.'],
            ['M', 'What does @ModelAttribute on a method do?', 'It runs before each handler of the controller and adds its return value to the model.'],
            ['M', 'Difference from @RequestBody?', '@ModelAttribute binds form or query parameters; @RequestBody converts the whole body such as JSON with an HttpMessageConverter.'],
            ['S', 'Which class resolves @ModelAttribute arguments?', 'ModelAttributeMethodProcessor, which uses a WebDataBinder to bind and validate.'],
            ['S', 'Why must the BindingResult follow the model attribute?', 'Spring matches the BindingResult to the argument just before it; otherwise a binding error throws an exception.']],
        [['Parameter and method usage.',
            r`@Controller
public class CourseController {
    @ModelAttribute("levels")
    public List<String> levels() {
        return List.of("Beginner", "Advanced");
    }

    @PostMapping("/course")
    public String save(@ModelAttribute("course") CourseForm course) {
        return "course-saved";
    }
}

// OUTPUT:
// every view of this controller can read "levels" = [Beginner, Advanced]
// POST /course title=Spring -> course.title = Spring`],
            ['Test the model with MockMvc.',
                r`mockMvc.perform(post("/course").param("title", "Spring"))
    .andExpect(model().attribute("course",
        hasProperty("title", is("Spring"))))
    .andExpect(model().attributeExists("levels"));

// OUTPUT:
// Test passed: model has course.title = Spring and levels`]],
        [['Dropdown data shared by two handlers.',
            r`@ModelAttribute("countries")
List<String> countries() { return List.of("IN", "US"); }

@GetMapping("/new")  String blank(Model m) {
    m.addAttribute("form", new F());
    return "f";
}
@PostMapping("/new") String save(@ModelAttribute("form") F f) { return "f"; }

// OUTPUT:
// both GET and POST views can render the countries dropdown`],
            ['Implicit model attribute.',
                r`@PostMapping("/user")
public String save(UserForm userForm) {   // no annotation needed
    return "ok";
}

// OUTPUT:
// userForm is bound and available in the model as "userForm"`]]
    ),
    'mvc-command-objects': x(
        ['<b>Command object</b> (form-backing object) is a plain Java class whose fields mirror the form fields; Spring fills it from the request and the view reads it back.',
            '<b>Round trip</b>: the GET handler puts an empty (or pre-filled) command object in the model, the form binds to it, and the POST handler receives it filled.',
            '<b>Plain bean</b>: it needs a default constructor and getters and setters, or a record or a constructor Spring can bind to.'],
        ['<b>Pre-fill for edit</b>: load an entity, copy its values into the command object and add it to the model, so the form shows current data.',
            '<b>Validation</b>: put Bean Validation annotations on the command object and use <code>@Valid</code> on the parameter.',
            '<b>Thymeleaf link</b>: <code>th:object</code> names the command object and <code>th:field</code> binds each input to a property.'],
        ['<b>Separate from the entity</b>: a command object shaped for the screen avoids exposing database fields and lazy-loading problems.',
            '<b>Records</b> work as immutable command objects with constructor binding in Spring 6.',
            '<b>Scope</b>: the object lives for one request unless you add <code>@SessionAttributes</code>.'],
        [['F', 'What is a command object?', 'A plain Java object that holds the form data, bound by Spring from the request parameters.'],
            ['F', 'Why must the GET handler add an empty object to the model?', 'The view binds the form fields to it, and without it the template fails because the object does not exist.'],
            ['M', 'How do you edit an existing record with a form?', 'Load it, map it into a command object, add that to the model and show the form.'],
            ['M', 'Command object or entity?', 'A command object shaped for the form is safer, because it keeps database fields out of the binding.'],
            ['S', 'Can a record be a command object?', 'Yes, Spring 6 binds through the canonical constructor, so the data is immutable.'],
            ['S', 'How can a command object survive several pages?', 'Mark it with @SessionAttributes and call SessionStatus.setComplete() at the end.']],
        [['Command object and controller.',
            r`public class LoginForm {
    private String username;
    private String password;
    // getters and setters
}

@GetMapping("/login")
public String form(Model model) {
    model.addAttribute("loginForm", new LoginForm());
    return "login";
}

// OUTPUT:
// GET /login -> view "login" with an empty loginForm in the model`],
            ['Record as command object.',
                r`public record ContactForm(String name, String message) {}

@PostMapping("/contact")
public String send(ContactForm form) {
    return "redirect:/thanks";
}
// POST /contact name=Abaji&message=Hi

// OUTPUT:
// form = ContactForm[name=Abaji, message=Hi]`]],
        [['Pre-filled edit form.',
            r`@GetMapping("/users/{id}/edit")
public String edit(@PathVariable long id, Model model) {
    User u = service.find(id);
    model.addAttribute("form", new UserForm(u.getName(), u.getEmail()));
    return "user-edit";
}

// OUTPUT:
// GET /users/7/edit -> form fields show name=Abaji, email=abaji@example.com`],
            ['Thymeleaf binding.',
                r`<form th:object="$` + r`{form}
" th:action="@{/users}
" method="post">
    <input type="text" th:field="*{name}"/>
</form>

<!-- OUTPUT: rendered -->
// <input type="text" id="name" name="name" value="Abaji"/>`]]
    ),
    'mvc-form-dto': x(
        ['<b>Form DTO</b> is a data transfer object designed only for one form: it holds just the fields the user may send and the rules to check them.',
            '<b>Why</b>: it separates the web layer from the entity, so the screen can change without touching the database model.',
            '<b>Mapping</b>: the controller or a service copies the DTO into an entity; the DTO itself has no persistence annotations.'],
        ['<b>Validation lives here</b>: <code>@NotBlank</code>, <code>@Email</code> and <code>@Size</code> on the DTO describe form rules.',
            '<b>Different DTOs</b> for create and update are common, because update has an id and may skip the password.',
            '<b>Mapping tools</b>: write a small mapper by hand, or use MapStruct for many fields.'],
        ['<b>Security</b>: a DTO without <code>role</code> or <code>enabled</code> makes mass assignment impossible.',
            '<b>Cross-field rules</b> (password equals confirm) use a class-level constraint or a check in the service.',
            '<b>Records</b> keep DTOs short and immutable; validation annotations go on the record components.'],
        [['F', 'What is a form DTO?', 'A simple class that carries only the data of one form between the browser and the controller.'],
            ['F', 'Why not bind the entity directly?', 'A client could set fields you never meant to expose, and the entity ties the screen to the database.'],
            ['M', 'Where do validation annotations go?', 'On the form DTO fields, checked by @Valid in the controller.'],
            ['M', 'How do you convert a DTO to an entity?', 'With a manual mapper method or MapStruct, in the service or controller.'],
            ['S', 'How do you validate that two password fields match?', 'Use a class-level custom constraint or compare them in the service and call BindingResult.rejectValue.'],
            ['S', 'Should create and update share one DTO?', 'Usually not; they differ in id, required fields and password handling, so separate DTOs avoid conditional rules.']],
        [['A record DTO with rules.',
            r`public record SignupForm(
        @NotBlank String name,
        @Email @NotBlank String email,
        @Size(min = 8) String password) {}

@PostMapping("/signup")
public String signup(@Valid SignupForm form, BindingResult br) {
    return br.hasErrors() ? "signup" : "redirect:/welcome";
}

// OUTPUT:
// valid input   -> 302 /welcome
// password "abc" -> 200 view "signup" with an error on password`],
            ['Map DTO to entity.',
                r`User toEntity(SignupForm f) {
    User u = new User();
    u.setName(f.name());
    u.setEmail(f.email());
    u.setPasswordHash(encoder.encode(f.password()));
    return u;
}

// OUTPUT:
// User{name=Abaji, email=abaji@example.com, passwordHash=$2a$10... (varies)}`]],
        [['Mass assignment blocked.',
            r`// SignupForm has no "role" field
// POST /signup?name=A&email=a@x.com&password=secret123&role=ADMIN

// OUTPUT:
// role is ignored: the DTO cannot carry it, the user gets the default role`],
            ['Separate update DTO.',
                r`public record ProfileUpdateForm(long id, @NotBlank String name) {}

@PutMapping("/profile")
public String update(@Valid ProfileUpdateForm f, BindingResult br) { return "ok"; }

// OUTPUT:
// no password field, so a profile update cannot change the password`]]
    ),
    'mvc-bindingresult': x(
        ['<b>BindingResult</b> holds the result of binding and validating one model attribute: the field errors, the global errors and the rejected values.',
            '<b>Position rule</b>: declare it immediately after the model attribute parameter, for example <code>(@Valid Form f, BindingResult br)</code>.',
            '<b>Without it</b> a binding or validation failure throws <code>MethodArgumentNotValidException</code> (or <code>BindException</code>) and the user gets a 400 page.'],
        ['<b>hasErrors()</b> tells whether anything failed; <code>getFieldErrors()</code> lists each field problem.',
            '<b>rejectValue</b> adds your own field error, for example a duplicate email found in the database.',
            '<b>reject</b> adds a global (object-level) error that is not tied to a field.'],
        ['<b>Error codes</b>: each error has codes like <code>NotBlank.form.name</code> that a <code>MessageSource</code> turns into text.',
            '<b>Rejected value</b> is kept so the form can redisplay what the user typed.',
            '<b>Errors</b> is the parent interface; <code>BindingResult</code> adds access to the target object and the model.'],
        [['F', 'What is BindingResult?', 'An object that collects binding and validation errors for a form object.'],
            ['F', 'Where is it placed in the method signature?', 'Right after the validated model attribute parameter.'],
            ['M', 'What happens if you forget it?', 'Spring throws an exception on errors, which usually results in an HTTP 400 response.'],
            ['M', 'How do you add a custom error?', 'br.rejectValue("email", "duplicate", "Email already used").'],
            ['S', 'Difference between field error and global error?', 'A field error names a property; a global error applies to the whole object, such as password and confirm not matching.'],
            ['S', 'How is the error text chosen?', 'The MessageSource resolves the error codes from most to least specific, falling back to the default message.']],
        [['Check errors in the handler.',
            r`@PostMapping("/signup")
public String signup(@Valid SignupForm form, BindingResult br) {
    if (br.hasErrors()) {
        br.getFieldErrors().forEach(e ->
            System.out.println(e.getField() + ": " + e.getDefaultMessage()));
        return "signup";
    }
    return "redirect:/welcome";
}

// OUTPUT:
// email: must be a well-formed email address
// name: must not be blank`],
            ['Add a business error.',
                r`if (users.existsByEmail(form.email())) {
    br.rejectValue("email", "duplicate", "Email is already registered");
    return "signup";
}

// OUTPUT:
// field error on email: Email is already registered
// the view is shown again with the message next to the email field`]],
        [['Wrong order causes failure.',
            r`// WRONG: another parameter sits between the form and BindingResult
public String bad(@Valid Form f, Model m, BindingResult br) { return "x"; }

// OUTPUT:
// IllegalStateException: An Errors/BindingResult argument is expected
// to be declared immediately after the model attribute`],
            ['Global error.',
                r`if (!form.password().equals(form.confirm())) {
    br.reject("password.mismatch", "Passwords do not match");
}

// OUTPUT:
// global error: Passwords do not match
// (th:errors="*" or #fields.globalErrors() show it)`]]
    ),
    'mvc-form-validation': x(
        ['<b>Form validation</b> checks the submitted data against rules before the application uses it; in Spring MVC rules are Bean Validation annotations and <code>@Valid</code> triggers them.',
            '<b>Common annotations</b>: <code>@NotBlank</code>, <code>@NotNull</code>, <code>@Size</code>, <code>@Min</code>, <code>@Max</code>, <code>@Email</code> and <code>@Pattern</code>.',
            '<b>Dependency</b>: add <code>spring-boot-starter-validation</code>, which brings Hibernate Validator as the implementation.'],
        ['<b>Namespace</b>: in Spring Boot 3 the annotations are in <code>jakarta.validation.constraints</code>.',
            '<b>Groups</b> let one DTO have different rules for create and update, selected with <code>@Validated(Group.class)</code>.',
            '<b>Custom constraint</b>: write an annotation plus a <code>ConstraintValidator</code> for rules such as a unique username.'],
        ['<b>Trigger</b>: the argument resolver validates after binding; failures go to <code>BindingResult</code>.',
            '<b>Client validation is not enough</b>: always validate on the server, since requests can skip the browser.',
            '<b>Messages</b> come from <code>messages.properties</code> using keys like <code>NotBlank.form.name</code>, which supports other languages.'],
        [['F', 'How do you validate a form object?', 'Put constraint annotations on its fields and add @Valid before the parameter.'],
            ['F', 'Which dependency do you need in Spring Boot?', 'spring-boot-starter-validation.'],
            ['M', 'NotNull, NotEmpty or NotBlank for a text field?', 'NotBlank, because it also rejects strings with only spaces.'],
            ['M', 'How do you show a custom message?', 'Use the message attribute of the annotation or define the key in messages.properties.'],
            ['S', '@Valid or @Validated?', '@Valid is the standard annotation and cascades into nested objects; @Validated is Spring and supports validation groups.'],
            ['S', 'How do you write a custom constraint?', 'Create an annotation marked with @Constraint(validatedBy = ...) and implement ConstraintValidator with the check in isValid.']],
        [['Annotated form and handler.',
            r`public class ProductForm {
    @NotBlank(message = "Name is required")
    private String name;
    @Min(value = 1, message = "Price must be at least 1")
    private int price;
    // getters and setters
}

@PostMapping("/products")
public String save(@Valid ProductForm form, BindingResult br) {
    return br.hasErrors() ? "product-form" : "redirect:/products";
}

// OUTPUT:
// name="" price=0 -> view "product-form" with 2 errors
// name=Pen price=5 -> 302 /products`],
            ['Test validation failure.',
                r`mockMvc.perform(post("/products").param("name", "").param("price", "0"))
    .andExpect(status().isOk())
    .andExpect(model().attributeHasFieldErrors("productForm", "name", "price"));

// OUTPUT:
// Test passed: errors on name and price`]],
        [['Custom constraint.',
            r`@Target(FIELD) @Retention(RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {
    String message() default "Password too weak";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class StrongPasswordValidator
        implements ConstraintValidator<StrongPassword, String> {
    public boolean isValid(String v, ConstraintValidatorContext c) {
        return v != null && v.length() >= 8 && v.matches(".*\\d.*");
    }
}

// OUTPUT:
// "abc"       -> invalid: Password too weak
// "secret123" -> valid`],
            ['Messages file.',
                r`# messages.properties
NotBlank.productForm.name=Please enter the product name
Min.productForm.price=Price must be 1 or more

# OUTPUT:
# the form shows "Please enter the product name" instead of the default text`]]
    ),
    'mvc-get-form': x(
        ['<b>GET form</b> sends the field values in the URL query string (<code>/search?q=spring</code>); it is used for reading and searching, never for changing data.',
            '<b>Safe and idempotent</b>: the result can be bookmarked, shared and repeated without side effects.',
            '<b>Handler</b>: a <code>@GetMapping</code> method reads the values with <code>@RequestParam</code> or a form object.'],
        ['<b>Show a form</b> also uses GET: the handler only adds an empty object to the model and returns the view name.',
            '<b>Optional parameters</b>: <code>@RequestParam(required = false)</code> or <code>defaultValue</code> help with search boxes and paging.',
            '<b>Encoding</b>: browsers URL-encode the values, and Spring decodes them before binding.'],
        ['<b>No secrets</b>: URLs end up in logs, history and the Referer header, so passwords never go in GET.',
            '<b>Length limits</b>: servers and proxies limit the URL size, so use POST for long input.',
            '<b>Caching</b>: GET responses can be cached, so add <code>Cache-Control</code> if the page must always be fresh.'],
        [['F', 'When do you use a GET form?', 'For searches and filters, where the request only reads data and the URL can be shared.'],
            ['F', 'How do you read the values?', 'With @RequestParam or by binding them into a form object.'],
            ['M', 'Why not use GET to submit a password?', 'The password appears in the URL, browser history and server logs.'],
            ['M', 'How do you make a parameter optional?', '@RequestParam(required = false) or defaultValue = "..." .'],
            ['S', 'Can you bind a GET query to an object?', 'Yes, a @ModelAttribute (or an unannotated object) binds query parameters just like form data.'],
            ['S', 'How do you test a GET form with MockMvc?', 'Use get("/search").param("q", "spring") and assert on the model and view.']],
        [['Search form handler.',
            r`@GetMapping("/search")
public String search(@RequestParam(defaultValue = "") String q,
                     @RequestParam(defaultValue = "0") int page,
                     Model model) {
    model.addAttribute("results", service.search(q, page));
    return "search";
}

// OUTPUT:
// GET /search?q=spring&page=1 -> view "search" with results for "spring", page 1`],
            ['Bind a query into an object.',
                r`public record SearchForm(String q, String category) {}

@GetMapping("/products")
public String list(SearchForm f, Model model) {
    model.addAttribute("items", service.find(f));
    return "products";
}

// OUTPUT:
// GET /products?q=pen&category=office -> f = SearchForm[q=pen, category=office]`]],
        [['Test with MockMvc.',
            r`mockMvc.perform(get("/search").param("q", "spring"))
    .andExpect(status().isOk())
    .andExpect(view().name("search"))
    .andExpect(model().attributeExists("results"));

// OUTPUT:
// Test passed`],
            ['HTML GET form.',
                r`<form action="/search" method="get">
    <input type="text" name="q"/>
    <button type="submit">Search</button>
</form>

<!-- OUTPUT: browser requests -->
// GET /search?q=spring+mvc   (space becomes +)`]]
    ),
    'mvc-post-form': x(
        ['<b>POST form</b> sends the values in the request body and is used to create or change data, such as registration, login or payment.',
            '<b>Not idempotent</b>: repeating a POST can repeat its effect, so apply Post-Redirect-Get after success.',
            '<b>Handler</b>: a <code>@PostMapping</code> method takes a form object, validates it and returns a view or a redirect.'],
        ['<b>Error path</b>: on validation errors return the form view directly (status 200) so the entered values stay; on success redirect.',
            '<b>Body encoding</b>: urlencoded for simple forms, <code>multipart/form-data</code> for file upload with <code>MultipartFile</code>.',
            '<b>Hidden fields</b> such as the id or CSRF token travel with the form but can be edited by a user, so never trust them.'],
        ['<b>CSRF</b>: Spring Security expects the token on every POST; test with <code>.with(csrf())</code> in MockMvc.',
            '<b>Size limits</b>: <code>spring.servlet.multipart.max-file-size</code> and the server post size limit protect memory.',
            '<b>Authorization</b>: check that the user may change the record, not only that the form is valid.'],
        [['F', 'When do you use POST for a form?', 'When the request changes server state or carries sensitive or large data.'],
            ['F', 'Which annotation maps it?', '@PostMapping.'],
            ['M', 'Why redirect after a successful POST?', 'So a browser refresh repeats only the harmless GET, not the submission.'],
            ['M', 'What do you return when validation fails?', 'The form view itself, not a redirect, so the errors and typed values are shown.'],
            ['S', 'How do you test a POST with Spring Security?', 'Add .with(csrf()) and a user, for example @WithMockUser, to the MockMvc request.'],
            ['S', 'How can you prevent a double click creating two records?', 'Use PRG, disable the button, and for critical actions an idempotency key or a unique database constraint.']],
        [['Complete POST handler.',
            r`@PostMapping("/products")
public String create(@Valid ProductForm form, BindingResult br,
                     RedirectAttributes ra) {
    if (br.hasErrors()) return "product-form";
    Product p = service.create(form);
    ra.addFlashAttribute("msg", "Created " + p.getName());
    return "redirect:/products";
}

// OUTPUT:
// invalid -> 200 view "product-form"
// valid   -> 302 /products, flash msg = "Created Pen"`],
            ['MockMvc with CSRF.',
                r`mockMvc.perform(post("/products")
        .with(csrf())
        .param("name", "Pen").param("price", "5"))
    .andExpect(status().is3xxRedirection())
    .andExpect(flash().attribute("msg", "Created Pen"));

// OUTPUT:
// Test passed (without csrf(): 403 Forbidden)`]],
        [['File upload form.',
            r`@PostMapping("/avatar")
public String upload(@RequestParam("file") MultipartFile file) throws IOException {
    Files.copy(file.getInputStream(), Path.of("uploads", file.getOriginalFilename()));
    return "redirect:/profile";
}
// <form method="post" enctype="multipart/form-data">

// OUTPUT:
// POST /avatar (multipart) -> file saved, 302 /profile`],
            ['PRG in action.',
                r`// 1. POST /orders        -> 302 Location: /orders/42
// 2. GET  /orders/42     -> 200 order page
// 3. user presses F5     -> repeats only step 2

// OUTPUT:
// one order created even after several refreshes`]]
    ),
    'mvc-form-error-handling': x(
        ['<b>Form error handling</b> means showing the user what went wrong in a submitted form, next to the field, while keeping the values they typed.',
            '<b>Flow</b>: binding or validation fails, errors go into <code>BindingResult</code>, the handler returns the form view again and the template prints the errors.',
            '<b>Thymeleaf</b>: <code>th:errors="*{email}"</code> prints the messages of a field and <code>#fields.hasErrors(...)</code> checks for them.'],
        ['<b>Re-display</b>: return the same view name, not a redirect, so the model with the errors is still available.',
            '<b>Global errors</b> are shown with <code>#fields.globalErrors()</code> or <code>th:errors="*{global}"</code>.',
            '<b>CSS class</b>: <code>th:errorclass="error"</code> adds a class to invalid inputs for red borders.'],
        ['<b>Unexpected exceptions</b> are handled by <code>@ExceptionHandler</code> or <code>@ControllerAdvice</code>, not by BindingResult.',
            '<b>Type mismatch</b> messages use keys like <code>typeMismatch.age</code> in <code>messages.properties</code>.',
            '<b>Never leak</b> stack traces or SQL errors to the page; map them to a friendly global error.'],
        [['F', 'How do you show an error next to a field?', 'With th:errors="*{field}" inside the form that uses th:object.'],
            ['F', 'Why return the view instead of a redirect on errors?', 'A redirect loses the BindingResult and the typed values; returning the view keeps them.'],
            ['M', 'How do you highlight the invalid input?', 'Use th:errorclass or check #fields.hasErrors(name) in th:classappend.'],
            ['M', 'How do you change the default message?', 'Set the message on the annotation or define the key in messages.properties.'],
            ['S', 'How do you handle a duplicate key error from the database?', 'Catch DataIntegrityViolationException in the service or handler and call BindingResult.rejectValue.'],
            ['S', 'How do you handle binding errors globally for REST?', 'A @RestControllerAdvice handling MethodArgumentNotValidException that returns a structured error body.']],
        [['Handler and template.',
            r`@PostMapping("/signup")
public String signup(@Valid SignupForm form, BindingResult br) {
    if (br.hasErrors()) return "signup";      // same view, errors kept
    return "redirect:/welcome";
}

// signup.html
// <input th:field="*{email}" th:errorclass="error"/>
// <span th:if="$` + r`{#fields.hasErrors('email')}
" th:errors="*{email}
">msg</span>

// OUTPUT:
// <input name="email" value="bad" class="error"/>
// <span>must be a well-formed email address</span>`],
            ['Duplicate email as field error.',
                r`try {
    service.register(form);
} catch (DataIntegrityViolationException e) {
    br.rejectValue("email", "duplicate", "Email already registered");
    return "signup";
}
return "redirect:/welcome";

// OUTPUT:
// the form is shown again with "Email already registered" under the email field`]],
        [['REST style error body.',
            r`@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> m = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> m.put(e.getField(), e.getDefaultMessage()));
        return m;
    }
}

// OUTPUT:
// 400 {"email":"must be a well-formed email address","name":"must not be blank"}`],
            ['Test error display.',
                r`mockMvc.perform(post("/signup").with(csrf()).param("email", "bad"))
    .andExpect(status().isOk())
    .andExpect(view().name("signup"))
    .andExpect(model().attributeHasFieldErrors("signupForm", "email"));

// OUTPUT:
// Test passed: view signup, email has an error`]]
    )
};

export const smvc11Deep: Record<string, Deep> = {
    'mvc-form-submission': dv(
        [`<p>What happens between the browser click and your method:</p><ul><li>The servlet container parses the urlencoded body into parameters.</li><li><code>DispatcherServlet</code> asks <code>RequestMappingHandlerMapping</code> for the handler method.</li><li><code>RequestMappingHandlerAdapter</code> runs the argument resolvers; <code>ModelAttributeMethodProcessor</code> creates and binds the form object.</li><li>The handler returns a view name or <code>redirect:</code>; a <code>ViewResolver</code> renders it.</li></ul>`,
            r`@PostMapping("/register")
public String submit(RegisterForm form) {
    return "redirect:/done";
}
// Trace (DEBUG logging for org.springframework.web):
// OUTPUT:
// DispatcherServlet : POST "/register", parameters={masked}
// RequestMappingHandlerMapping : Mapped to RegisterController#submit(RegisterForm)
// DispatcherServlet : Completed 302 FOUND`],
        [`<p>Variants of submitting a form:</p><ul><li><b>Urlencoded:</b> default for a simple form.</li><li><b>Multipart:</b> add <code>enctype="multipart/form-data"</code> for files.</li><li><b>Method override:</b> hidden <code>_method</code> field with <code>spring.mvc.hiddenmethod.filter.enabled=true</code>.</li><li><b>Fetch or AJAX:</b> send JSON and use <code>@RequestBody</code> instead.</li><li><b>Consumes:</b> restrict a handler with <code>consumes = "application/x-www-form-urlencoded"</code>.</li></ul>`,
            r`@PostMapping(value = "/register",
        consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
public String form(RegisterForm f) { return "ok"; }

@DeleteMapping("/users/{id}")      // reached by POST + _method=delete
public String delete(@PathVariable long id) { return "redirect:/users"; }

# application.properties
# spring.mvc.hiddenmethod.filter.enabled=true

// OUTPUT:
// POST /register (JSON body) -> 415 Unsupported Media Type
// POST /users/5 _method=delete -> delete(5)`],
        [`<p>Common mistakes:</p><ul><li><b>No redirect after success:</b> refresh creates a duplicate; use PRG.</li><li><b>Forgot the CSRF token:</b> 403 on every POST.</li><li><b>Missing empty object on GET:</b> template error because the form object is not in the model.</li><li><b>Field name differs from the property:</b> value stays null.</li><li><b>Missing setters:</b> binding silently skips the field.</li></ul>`,
            r`// Symptom: Neither BindingResult nor plain target object for bean name
// 'form' available as request attribute
// Fix: in the GET handler
model.addAttribute("form", new RegisterForm());

// Symptom: name is always null
// Fix: input name="name" must equal the setter setName

// OUTPUT:
// after the fix the form renders and POST binds name = Abaji`],
        [`<p>Performance and tuning:</p><ul><li>Binding is cheap; keep the form small and avoid binding large graphs.</li><li>Set <code>server.tomcat.max-http-form-post-size</code> and multipart limits to block huge bodies.</li><li>Use PRG so the heavy page is a cacheable GET.</li><li>Enable compression for rendered pages with <code>server.compression.enabled=true</code>.</li></ul>`,
            r`# application.properties
server.tomcat.max-http-form-post-size=1MB
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=6MB
server.compression.enabled=true

# OUTPUT:
# POST with an 8 MB file -> 413 / MaxUploadSizeExceededException`],
        [`<p>Scenario: a sign-up page.</p><ul><li>GET shows the form; POST validates, saves and redirects with a welcome flash message.</li><li>A duplicate email is shown as a field error.</li><li>A MockMvc test covers valid, invalid and CSRF-less requests.</li></ul>`,
            r`@WebMvcTest(RegisterController.class)
class RegisterControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test void validSubmitRedirects() throws Exception {
        mvc.perform(post("/register").with(csrf())
                .param("name", "Abaji").param("email", "a@x.com"))
           .andExpect(redirectedUrl("/register/done"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),
    'mvc-form-data-binding': dv(
        [`<p>Binding internals:</p><ul><li>A <code>WebDataBinder</code> is created per attribute by <code>ServletRequestDataBinderFactory</code>.</li><li>Request parameters become <code>MutablePropertyValues</code>.</li><li>A <code>BeanWrapper</code> sets each property and uses the <code>ConversionService</code> (or PropertyEditors) to convert strings.</li><li>Failures are stored as <code>FieldError</code> with the rejected value; the binder never throws for them.</li></ul>`,
            r`WebDataBinder binder = new WebDataBinder(new PersonForm(), "personForm");
binder.setConversionService(new DefaultFormattingConversionService());
MutablePropertyValues pv = new MutablePropertyValues();
pv.add("name", "Abaji");
pv.add("age", "x");
binder.bind(pv);
System.out.println(binder.getBindingResult().getFieldErrorCount());

// OUTPUT:
// 1   (age: typeMismatch)`],
        [`<p>Options and variants:</p><ul><li><b>Setter binding:</b> default with a no-arg constructor.</li><li><b>Constructor binding:</b> records or one constructor with parameter names.</li><li><b>@InitBinder:</b> custom editors, allowed fields, validators.</li><li><b>Formatter:</b> a global <code>Formatter&lt;T&gt;</code> bean for a type.</li><li><b>Prefix:</b> <code>@ModelAttribute("a")</code> with parameters named <code>a.field</code> is not required; names are plain.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder b) {
    b.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    b.setDisallowedFields("id", "role");
}

// OUTPUT:
// "  Abaji " -> "Abaji"; empty string -> null; id and role never bound`],
        [`<p>Common mistakes:</p><ul><li><b>Binding entities:</b> mass assignment risk.</li><li><b>Missing setters or getters:</b> value stays null.</li><li><b>Primitive for optional field:</b> empty input gives a typeMismatch; use the wrapper type.</li><li><b>Date without format:</b> parsing fails for ISO strings in some locales.</li><li><b>Ignoring BindingResult:</b> conversion errors become a 400.</li></ul>`,
            r`// WRONG: int price, form field left empty -> typeMismatch error
// private int price;
// RIGHT: Integer allows null, then @NotNull gives a clear message
private Integer price;

// OUTPUT:
// empty price -> price = null, error "must not be null" (not a conversion error)`],
        [`<p>Performance and limits:</p><ul><li>Auto-grow limit for collections defaults to 256 elements, which stops memory attacks via <code>items[100000]</code>.</li><li>Tune it with <code>binder.setAutoGrowCollectionLimit</code>.</li><li>Prefer shallow DTOs to keep reflection cost low.</li></ul>`,
            r`@InitBinder
void limit(WebDataBinder b) { b.setAutoGrowCollectionLimit(50); }

// OUTPUT:
// items[60].sku=X -> IndexOutOfBoundsException / error: grow limit exceeded`],
        [`<p>Scenario: an order form with several lines.</p><ul><li>Line items are bound to a list in a DTO.</li><li>Dates and money use formatting annotations.</li><li>Only whitelisted fields are accepted.</li></ul>`,
            r`public class OrderForm {
    @NotBlank private String customer;
    @Valid private List<LineForm> lines = new ArrayList<>();
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) private LocalDate due;
}
// POST customer=Raoji&lines[0].sku=A1&lines[0].qty=2&due=2026-11-01

// OUTPUT:
// OrderForm{customer=Raoji, lines=[A1 x2], due=2026-11-01}`]
    ),
    'mvc-modelattribute': dv(
        [`<p>How it works:</p><ul><li>Before the handler, <code>RequestMappingHandlerAdapter</code> invokes every <code>@ModelAttribute</code> method of the controller (and its advice) and fills the <code>ModelAndViewContainer</code>.</li><li>For a parameter, <code>ModelAttributeMethodProcessor</code> first looks in the model (or session attributes), else creates the object by constructor.</li><li>It binds, optionally validates, then adds the object and its <code>BindingResult</code> to the model.</li></ul>`,
            r`@ModelAttribute
void common(Model m) { m.addAttribute("year", 2026); }

@PostMapping("/x")
String x(@ModelAttribute("f") F f) { return "v"; }

// OUTPUT:
// order of execution: common() -> bind F -> x()
// model: year=2026, f=F{..}, org.springframework.validation.BindingResult.f`],
        [`<p>Variants:</p><ul><li><code>@ModelAttribute("name")</code> sets the model name.</li><li><code>binding = false</code> adds the attribute without binding request data.</li><li>A method can return void and write into <code>Model</code>.</li><li><code>@ControllerAdvice</code> + <code>@ModelAttribute</code> shares data across controllers.</li><li><code>@SessionAttributes</code> keeps the attribute between requests.</li></ul>`,
            r`@ControllerAdvice
class GlobalModel {
    @ModelAttribute("appName")
    String appName() { return "JavaSchoolLab"; }
}

@PostMapping("/pay")
String pay(@ModelAttribute(name = "order", binding = false) Order order) {
    return "pay";
}

// OUTPUT:
// every view has appName; order is taken from the model, request values ignored`],
        [`<p>Common mistakes:</p><ul><li><b>Using it for JSON:</b> fields stay null; use <code>@RequestBody</code>.</li><li><b>Heavy work in a @ModelAttribute method:</b> it runs for every handler, even those that do not need it.</li><li><b>Name clash:</b> two attributes with the same name overwrite each other.</li><li><b>BindingResult in wrong place.</b></li></ul>`,
            r`// WRONG: runs a DB query on every request of the controller
@ModelAttribute("all") List<Item> all() { return repo.findAll(); }

// RIGHT: load only in handlers that need it
@GetMapping("/list") String list(Model m) {
    m.addAttribute("all", repo.findAll());
    return "list";
}

// OUTPUT:
// queries per request drop from 1 to 0 for unrelated handlers`],
        [`<p>Performance: keep @ModelAttribute methods cheap, cache lookup lists (countries, roles) and prefer explicit loading for large data.</p>`,
            r`@Cacheable("countries")
public List<String> countries() { return repo.findCountryNames(); }

@ModelAttribute("countries")
List<String> countries() { return lookup.countries(); }

// OUTPUT:
// first request hits the database, later requests read the cache`],
        [`<p>Scenario: a create/edit product form with category dropdown.</p><ul><li>@ModelAttribute method supplies categories to both GET and POST views.</li><li>The POST handler returns the form with errors and the dropdown still works.</li></ul>`,
            r`@ModelAttribute("categories")
List<Category> categories() { return catalog.categories(); }

@PostMapping("/products")
String save(@Valid @ModelAttribute("product") ProductForm p, BindingResult br) {
    return br.hasErrors() ? "product-form" : "redirect:/products";
}

// OUTPUT:
// on error the page re-renders with the categories list intact`]
    ),
    'mvc-command-objects': dv(
        [`<p>Internals:</p><ul><li>The GET handler stores the object in the model under a name.</li><li>The view engine binds fields with <code>th:field</code>, which reads the property value for display.</li><li>On POST a new instance is created and bound; for <code>@SessionAttributes</code> the stored instance is reused and updated.</li></ul>`,
            r`@Controller
@SessionAttributes("wizard")
class WizardController {
    @ModelAttribute("wizard") WizardForm wizard() { return new WizardForm(); }

    @PostMapping("/wizard/step1")
    String step1(@ModelAttribute("wizard") WizardForm w) { return "step2"; }

    @PostMapping("/wizard/done")
    String done(@ModelAttribute("wizard") WizardForm w, SessionStatus s) {
        s.setComplete();
        return "redirect:/ok";
    }
}

// OUTPUT:
// step1 data is kept in the session until setComplete() clears it`],
        [`<p>Variants:</p><ul><li>Class with setters.</li><li>Record with constructor binding.</li><li>Class with a constructor having parameters named like the fields (compile with <code>-parameters</code>, default in Spring Boot plugin).</li><li>Nested command objects for grouped fields.</li></ul>`,
            r`public class AddressForm {
    private final String city;
    private final String zip;
    public AddressForm(String city, String zip) {
        this.city = city;
        this.zip = zip;
    }
}

// OUTPUT:
// POST city=Pune&zip=411001 -> new AddressForm("Pune", "411001")`],
        [`<p>Common mistakes:</p><ul><li>Putting an entity with lazy relations in the form.</li><li>Not initializing nested objects, which gives NullPointerException in the view.</li><li>Sharing one object between users by storing it in a field of the controller (controllers are singletons).</li></ul>`,
            r`// WRONG: state in a singleton controller shared by all users
private LoginForm form = new LoginForm();

// RIGHT: create per request in the handler
model.addAttribute("loginForm", new LoginForm());

// OUTPUT:
// two users no longer see each other's typed values`],
        [`<p>Performance: command objects are short-lived, so keep them small; avoid large session attributes since sessions are held in memory.</p>`,
            r`# application.properties
server.servlet.session.timeout=15m

# OUTPUT:
# abandoned wizard objects are released after 15 minutes of inactivity`],
        [`<p>Scenario: profile edit page.</p><ul><li>GET loads the user and fills a command object.</li><li>POST validates it and updates only allowed fields.</li></ul>`,
            r`@GetMapping("/profile")
String edit(Principal p, Model m) {
    User u = users.byName(p.getName());
    m.addAttribute("form", new ProfileForm(u.getName(), u.getBio()));
    return "profile";
}

// OUTPUT:
// the page shows the saved name and bio ready to edit`]
    ),
    'mvc-form-dto': dv(
        [`<p>Internals and layers:</p><ul><li>Controller binds and validates the DTO.</li><li>Service maps it to the entity inside a transaction.</li><li>The reverse mapping (entity to DTO) fills the edit form.</li><li>Binding uses only the DTO properties, so no unexpected setter is reachable.</li></ul>`,
            r`public record ProductForm(
        @NotBlank String name,
        @DecimalMin("0.01") BigDecimal price) {}

@Service
class ProductService {
    @Transactional
    public Product create(ProductForm f) {
        return repo.save(new Product(f.name(), f.price()));
    }
}

// OUTPUT:
// INSERT INTO product (name, price) VALUES ('Pen', 5.00)`],
        [`<p>Variants:</p><ul><li>Hand-written mapper method.</li><li>MapStruct interface generated at compile time.</li><li>ModelMapper (reflection based, slower and less safe).</li><li>Class-level constraints for cross-field rules.</li></ul>`,
            r`@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toEntity(ProductForm form);
    ProductForm toForm(Product entity);
}

// OUTPUT:
// generated ProductMapperImpl with plain getter/setter calls (no reflection)`],
        [`<p>Common mistakes:</p><ul><li>Reusing one DTO for request and response, leaking fields.</li><li>Putting JPA annotations on the DTO.</li><li>Trusting a hidden id field from the form.</li><li>Mapping nulls over existing data on update.</li></ul>`,
            r`// WRONG: id comes from the form body
// RIGHT: id comes from the URL, checked against the logged-in user
@PostMapping("/products/{id}")
String update(@PathVariable long id, @Valid ProductForm f, BindingResult br) {
    service.update(id, f);
    return "redirect:/products";
}

// OUTPUT:
// the id in the path is authoritative; a forged hidden field has no effect`],
        [`<p>Performance: DTOs add a copy, which is negligible; MapStruct avoids reflection. Use projections for read-only list pages instead of loading entities.</p>`,
            r`interface ProductRow {
    String getName();
    BigDecimal getPrice();
}
List<ProductRow> findAllBy();

// OUTPUT:
// SELECT name, price FROM product   (only two columns loaded)`],
        [`<p>Scenario: user registration.</p><ul><li>SignupForm carries name, email, password and confirm.</li><li>The service creates the User with a hashed password and default role.</li></ul>`,
            r`public record SignupForm(@NotBlank String name, @Email String email,
        @Size(min = 8) String password, String confirm) {}

User u = new User(f.name(), f.email(), encoder.encode(f.password()), Role.USER);

// OUTPUT:
// role is always USER, whatever the client sent`]
    ),
    'mvc-bindingresult': dv(
        [`<p>Internals:</p><ul><li><code>BindingResult</code> is implemented by <code>BeanPropertyBindingResult</code>, created by the <code>WebDataBinder</code>.</li><li>The resolver puts it in the model under <code>org.springframework.validation.BindingResult.</code> + the attribute name, which is how views find it.</li><li>If the next parameter is an <code>Errors</code> or <code>BindingResult</code>, the processor passes it; otherwise it throws on errors.</li></ul>`,
            r`@PostMapping("/x")
String x(@Valid Form f, BindingResult br, Model m) {
    System.out.println(m.asMap().keySet());
    return "x";
}

// OUTPUT:
// [form, org.springframework.validation.BindingResult.form]`],
        [`<p>API summary:</p><ul><li><code>hasErrors()</code>, <code>hasFieldErrors("f")</code>, <code>getErrorCount()</code></li><li><code>getFieldError("f")</code>, <code>getFieldErrors()</code>, <code>getGlobalErrors()</code></li><li><code>rejectValue(field, code, msg)</code> and <code>reject(code, msg)</code></li><li><code>getRawFieldValue("f")</code>, <code>getFieldValue("f")</code></li></ul>`,
            r`if (br.hasFieldErrors("email")) {
    FieldError e = br.getFieldError("email");
    System.out.println(e.getRejectedValue() + " -> " + e.getCode());
}
br.rejectValue("age", "range", new Object[]{18, 60}, "Age must be 18-60");

// OUTPUT:
// bad@ -> Email
// (age error added with arguments for message formatting)`],
        [`<p>Common mistakes:</p><ul><li>Wrong parameter order.</li><li>One BindingResult for two form objects (each needs its own).</li><li>Returning a redirect when errors exist.</li><li>Calling <code>rejectValue</code> with a field that does not exist (NotReadablePropertyException).</li></ul>`,
            r`// WRONG
String s(@Valid A a, @Valid B b, BindingResult br)
// RIGHT
String s(@Valid A a, BindingResult ra, @Valid B b, BindingResult rb)

// OUTPUT:
// each object gets its own error holder; the wrong form throws IllegalStateException`],
        [`<p>Performance: errors are small objects; the cost is in message resolution, which is cached by <code>MessageSource</code> (set <code>spring.messages.cache-duration</code> in production).</p>`,
            r`# application.properties
spring.messages.basename=messages
spring.messages.cache-duration=1h

# OUTPUT:
# message files are re-read at most once per hour`],
        [`<p>Scenario: signup with a database uniqueness check that must appear on the form.</p>`,
            r`@PostMapping("/signup")
String signup(@Valid SignupForm f, BindingResult br) {
    if (!br.hasErrors() && users.existsByEmail(f.email())) {
        br.rejectValue("email", "duplicate", "Email already registered");
    }
    return br.hasErrors() ? "signup" : "redirect:/welcome";
}

// OUTPUT:
// existing email -> 200 "signup" with the duplicate message under the field`]
    ),
    'mvc-form-validation': dv(
        [`<p>Internals:</p><ul><li><code>ModelAttributeMethodProcessor</code> calls <code>binder.validate()</code> when <code>@Valid</code> or <code>@Validated</code> is present.</li><li>The binder delegates to <code>SpringValidatorAdapter</code> which wraps the Hibernate Validator <code>Validator</code>.</li><li>Each <code>ConstraintViolation</code> becomes a <code>FieldError</code> in the <code>BindingResult</code>.</li></ul>`,
            r`ValidatorFactory vf = Validation.buildDefaultValidatorFactory();
Set<ConstraintViolation<ProductForm>> v =
    vf.getValidator().validate(new ProductForm());
v.forEach(c -> System.out.println(c.getPropertyPath() + ": " + c.getMessage()));

// OUTPUT: (order varies)
// name: Name is required
// price: Price must be at least 1`],
        [`<p>Options:</p><ul><li><b>Groups:</b> <code>@Validated(OnCreate.class)</code>.</li><li><b>Cascade:</b> <code>@Valid</code> on nested field or list.</li><li><b>Class level:</b> constraint on the class for cross-field checks.</li><li><b>Method validation:</b> <code>@Validated</code> on the class and constraints on parameters (Spring 6.1 validates handler arguments too).</li></ul>`,
            r`public interface OnCreate {}
public interface OnUpdate {}

public class UserForm {
    @Null(groups = OnCreate.class) @NotNull(groups = OnUpdate.class)
    private Long id;
}

@PostMapping("/users")
String create(@Validated(OnCreate.class) UserForm f, BindingResult br) { return "ok"; }

// OUTPUT:
// create: id must be null; update: id must not be null`],
        [`<p>Common mistakes:</p><ul><li>Missing starter, so annotations are silently ignored.</li><li>Using <code>javax.validation</code> imports in Boot 3.</li><li>Using <code>@NotNull</code> on strings and expecting blank rejection.</li><li>Forgetting <code>@Valid</code> on nested objects.</li><li>Only client-side validation.</li></ul>`,
            r`// WRONG (Boot 3): import javax.validation.constraints.NotBlank;
// RIGHT:
import jakarta.validation.constraints.NotBlank;

// OUTPUT:
// with the right import and starter, empty names are rejected`],
        [`<p>Performance: the validator is created once and is thread safe; constraint metadata is cached per class. Avoid database calls inside validators unless needed.</p>`,
            r`@Component
class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {
    private final UserRepository repo;
    UniqueEmailValidator(UserRepository repo) { this.repo = repo; }
    public boolean isValid(String v, ConstraintValidatorContext c) {
        return v == null || !repo.existsByEmail(v);   // one indexed query
    }
}

// OUTPUT:
// validators can be Spring beans and use injection`],
        [`<p>Scenario: checkout form with address, card number and consent.</p>`,
            r`public record CheckoutForm(
        @NotBlank String fullName,
        @Pattern(regexp = "\\d{16}") String card,
        @AssertTrue(message = "Accept the terms") boolean terms) {}

// OUTPUT:
// card "1234" -> error on card; terms=false -> error "Accept the terms"`]
    ),
    'mvc-get-form': dv(
        [`<p>Internals:</p><ul><li>The browser builds <code>?name=value&amp;...</code> from the inputs, URL-encoding each value.</li><li>The servlet container decodes it into parameters.</li><li><code>@RequestParam</code> uses <code>RequestParamMethodArgumentResolver</code>; an object parameter uses the model attribute resolver.</li></ul>`,
            r`@GetMapping("/search")
String s(@RequestParam String q) { return "r"; }

// OUTPUT:
// GET /search?q=a%20b -> q = "a b"
// GET /search         -> 400 Required parameter 'q' is not present`],
        [`<p>Variants:</p><ul><li><code>@RequestParam Map&lt;String,String&gt;</code> for all parameters.</li><li><code>@RequestParam List&lt;String&gt;</code> for repeated names (<code>tag=a&amp;tag=b</code>).</li><li><code>Pageable</code> for page, size and sort.</li><li><code>@RequestParam Optional&lt;String&gt;</code>.</li></ul>`,
            r`@GetMapping("/items")
String items(@RequestParam(name = "tag", required = false) List<String> tags,
             Pageable pageable, Model m) {
    m.addAttribute("page", repo.findAll(pageable));
    return "items";
}

// OUTPUT:
// GET /items?tag=a&tag=b&page=0&size=10&sort=name,asc -> tags=[a, b], page 0`],
        [`<p>Common mistakes:</p><ul><li>Sensitive data in the URL.</li><li>Required parameter missing gives 400; use a default.</li><li>Using GET to delete or update.</li><li>Not encoding values when building links by hand; use <code>UriComponentsBuilder</code> or <code>th:href</code> with parameters.</li></ul>`,
            r`// WRONG: href="/search?q=" + userText   (breaks on & and spaces)
// RIGHT (Thymeleaf): th:href="@{/search(q=userText)}"

// OUTPUT:
// /search?q=a%26b   (encoded correctly)`],
        [`<p>Performance: GET results can be cached by browser and proxies; add paging and indexes behind search queries and limit the maximum page size.</p>`,
            r`# application.properties
spring.data.web.pageable.max-page-size=100
spring.data.web.pageable.default-page-size=20

# OUTPUT:
# size=100000 is capped to 100`],
        [`<p>Scenario: product search with filters, kept in the URL so users can bookmark results.</p>`,
            r`@GetMapping("/products")
String list(@RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) String category,
            Model m) {
    m.addAttribute("q", q);                      // keep the box filled
    m.addAttribute("items", service.search(q, category));
    return "products";
}

// OUTPUT:
// GET /products?q=pen&category=office -> filtered list, search box shows "pen"`]
    ),
    'mvc-post-form': dv(
        [`<p>Internals:</p><ul><li>The body is read once by the container (urlencoded) or by <code>MultipartResolver</code> (multipart).</li><li>With Spring Security the <code>CsrfFilter</code> checks the token before the dispatcher runs.</li><li>The handler result decides the response: view render (200) or redirect (302/303).</li></ul>`,
            r`// Filter chain order for a POST:
// CsrfFilter -> ... -> DispatcherServlet -> handler

// OUTPUT:
// POST without token: 403 Forbidden, handler never called
// POST with token:    handler runs`],
        [`<p>Variants:</p><ul><li>Urlencoded form object.</li><li>Multipart with <code>@RequestPart</code> or <code>MultipartFile</code>.</li><li>Redirect with <code>RedirectView</code> or <code>redirect:</code> prefix.</li><li>Status 303 See Other via <code>RedirectView</code> with <code>setStatusCode</code>.</li></ul>`,
            r`@PostMapping("/docs")
String upload(@RequestParam MultipartFile file, @RequestParam String title) {
    return "redirect:/docs";
}

// OUTPUT:
// POST multipart (title=CV, file=cv.pdf) -> 302 /docs`],
        [`<p>Common mistakes:</p><ul><li>Returning the view after success (duplicate on refresh).</li><li>Redirecting after errors (errors lost).</li><li>Wrong enctype for files: file arrives empty.</li><li>Trusting hidden fields and client-supplied ids.</li></ul>`,
            r`// WRONG: <form method="post"> with a file input and no enctype
// RIGHT: <form method="post" enctype="multipart/form-data">

// OUTPUT:
// with the right enctype the MultipartFile has name and size > 0`],
        [`<p>Performance: stream large uploads to disk or storage, set size limits, and move heavy work (image processing, email) out of the request thread with <code>@Async</code> or a queue.</p>`,
            r`@Async
public void generateThumbnail(Path p) { /* slow work */ }

// OUTPUT:
// POST returns 302 immediately; the thumbnail is created in the background`],
        [`<p>Scenario: order checkout.</p><ul><li>Validated POST, transaction in the service, unique order number.</li><li>PRG to the confirmation page.</li></ul>`,
            r`@PostMapping("/checkout")
String checkout(@Valid CheckoutForm f, BindingResult br, Principal p) {
    if (br.hasErrors()) return "checkout";
    Order o = orders.place(p.getName(), f);
    return "redirect:/orders/" + o.getId();
}

// OUTPUT:
// 302 Location: /orders/1042 (varies)`]
    ),
    'mvc-form-error-handling': dv(
        [`<p>Internals:</p><ul><li>Errors live in the <code>BindingResult</code> that is stored in the model.</li><li>Thymeleaf's <code>th:errors</code> and <code>#fields</code> read it through the form-backing object name set by <code>th:object</code>.</li><li>Messages are resolved by the <code>MessageSource</code> from error codes, most specific first: <code>Code.object.field</code>, <code>Code.field</code>, <code>Code.type</code>, <code>Code</code>.</li></ul>`,
            r`# messages.properties
NotBlank.signupForm.email=Email is required
NotBlank.email=Email is required (generic)
NotBlank=This field is required

# OUTPUT:
# the first matching key wins: "Email is required"`],
        [`<p>Display options:</p><ul><li><b>Per field:</b> <code>th:errors="*{field}"</code>.</li><li><b>All errors:</b> <code>#fields.allErrors()</code> in a <code>th:each</code> loop.</li><li><b>Global:</b> <code>#fields.hasGlobalErrors()</code>.</li><li><b>Summary:</b> <code>th:errors="*"</code>.</li><li><b>JSP:</b> <code>form:errors</code> tag.</li></ul>`,
            r`<!-- signup.html -->
<form th:object="$` + r`{signupForm}
" th:action="@{/signup}
" method="post">
  <div th:if="$` + r`{#fields.hasGlobalErrors()}
" th:errors="*{global}
"></div>
  <input th:field="*{email}" th:errorclass="is-invalid"/>
  <small th:errors="*{email}"></small>
</form>

<!-- OUTPUT: -->
// <input class="is-invalid" value="bad"/> <small>must be a well-formed email address</small>`],
        [`<p>Common mistakes:</p><ul><li>Redirecting on error loses the errors; use flash attributes only if you really redirect.</li><li>Form attribute name differs from <code>th:object</code>.</li><li>Showing raw exception messages.</li><li>Not handling <code>MethodArgumentNotValidException</code> for JSON endpoints.</li></ul>`,
            r`// WRONG
if (br.hasErrors()) return "redirect:/signup";   // errors and typed values lost
// RIGHT
if (br.hasErrors()) return "signup";

// OUTPUT:
// after the fix the user sees messages and keeps the entered values`],
        [`<p>Performance: message lookups are cached; keep error pages light and do not run extra queries when rendering errors.</p>`,
            r`# application.properties
spring.messages.cache-duration=-1
spring.messages.fallback-to-system-locale=false

# OUTPUT:
# messages cached forever;
no surprise language fallback`],
        [`<p>Scenario: one handler advice that turns validation failures into a consistent JSON error for the API and HTML re-display for the web form.</p>`,
            r`@RestControllerAdvice(basePackages = "com.shop.api")
class ApiAdvice {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        var body = Map.<String, Object>of("status", 400,
            "errors", ex.getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage()).toList());
        return ResponseEntity.badRequest().body(body);
    }
}

// OUTPUT:
// 400 {"status":400,"errors":["email: must be a well-formed email address"]}`]
    )
};
