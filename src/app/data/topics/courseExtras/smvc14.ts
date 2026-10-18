// Spring extras, batch smvc14 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc14Extras: Record<string, Extra> = {
    'mvc-validator': x(
        ['<b>Validator</b> is the Spring interface <code>org.springframework.validation.Validator</code> that checks an object and records problems in an <code>Errors</code> object.',
            '<b>Two methods</b>: <code>supports(Class)</code> says which types it can check, and <code>validate(Object, Errors)</code> does the checking.',
            '<b>Use it</b> by registering it in <code>@InitBinder</code> with <code>binder.addValidators(...)</code> or by calling it by hand.'],
        ['<b>ValidationUtils</b> has helpers such as <code>rejectIfEmptyOrWhitespace</code> that keep validate() short.',
            '<b>Bean Validation bridge</b>: <code>LocalValidatorFactoryBean</code> is a Spring Validator that runs <code>jakarta.validation</code> annotations.',
            '<b>Order</b>: validators added in @InitBinder run when the model attribute is bound, before the handler body.'],
        ['<b>supports()</b> must be exact; a wrong class makes the binder throw <code>IllegalStateException</code> on addValidators.',
            '<b>Combine</b> annotations for simple rules and a Validator for cross-field or database rules.',
            '<b>Testing</b>: a Validator is a plain class, so unit test it with <code>BeanPropertyBindingResult</code> and no Spring context.'],
        [['F', 'What is a Spring Validator?', 'An interface with supports() and validate() that checks an object and reports problems to an Errors object.'],
            ['F', 'Where do you register one for a controller?', 'In an @InitBinder method with binder.addValidators(new MyValidator()).'],
            ['M', 'What is ValidationUtils for?', 'Static helpers like rejectIfEmpty that add field errors with less code.'],
            ['M', 'Validator or Bean Validation annotations?', 'Annotations for declarative per-field rules; a Validator for logic that is programmatic or spans fields.'],
            ['S', 'How does Spring run both kinds together?', 'The DataBinder holds a list of validators; the global one runs the annotations and the added ones run their validate().'],
            ['S', 'Why must supports() use isAssignableFrom?', 'So subclasses and proxies of the target type are also accepted.']],
        [['A Validator for a Person.',
            r`public class PersonValidator implements Validator {
    @Override
    public boolean supports(Class<?> c) {
        return Person.class.isAssignableFrom(c);
    }
    @Override
    public void validate(Object target, Errors errors) {
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name", "name.empty");
        Person p = (Person) target;
        if (p.getAge() < 0) errors.rejectValue("age", "age.negative");
    }
}

// OUTPUT:
// Person(name="", age=-1) -> 2 errors: name.empty, age.negative`],
            ['Register it on a controller.',
                r`@Controller
public class PersonController {
    @InitBinder("person")
    void init(WebDataBinder binder) {
        binder.addValidators(new PersonValidator());
    }
    @PostMapping("/people")
    String save(@Valid @ModelAttribute Person person, BindingResult br) {
        return br.hasErrors() ? "person-form" : "redirect:/people";
    }
}

// OUTPUT:
// POST /people name= -> view "person-form" with the field error
// POST /people name=Ann&age=20 -> 302 redirect to /people`]],
        [['Unit test without Spring.',
            r`@Test
void rejectsNegativeAge() {
    Person p = new Person("Ann", -1);
    Errors errors = new BeanPropertyBindingResult(p, "person");
    new PersonValidator().validate(p, errors);
    assertTrue(errors.hasFieldErrors("age"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Calling a validator by hand.',
                r`Person p = new Person("", 5);
BindException ex = new BindException(p, "person");
new PersonValidator().validate(p, ex);
System.out.println(ex.getErrorCount() + " " + ex.getFieldError("name").getCode());

// OUTPUT:
// 1 name.empty`]]
    ),

    'mvc-custom-validator': x(
        ['<b>Custom validator</b> means your own constraint: an annotation plus a <code>ConstraintValidator</code> class that holds the rule.',
            '<b>Annotation</b> needs <code>message</code>, <code>groups</code> and <code>payload</code> attributes and <code>@Constraint(validatedBy=...)</code>.',
            '<b>Use it</b> like any built-in constraint: put it on a field and add <code>@Valid</code> to the controller parameter.'],
        ['<b>isValid</b> receives the value and a context; treat <code>null</code> as valid and let <code>@NotNull</code> handle it.',
            '<b>Spring beans</b> can be injected into a ConstraintValidator, because Spring creates it through its own factory.',
            '<b>Class-level</b> constraints (target TYPE) compare several fields, for example password and confirm.'],
        ['<b>Custom node</b>: use <code>context.buildConstraintViolationWithTemplate(...).addPropertyNode(...)</code> to put the error on the right field.',
            '<b>Cost</b>: a validator that calls the database runs on every request, so keep it cheap or cache.',
            '<b>Testing</b>: test the ConstraintValidator directly, and the whole path with @WebMvcTest.'],
        [['F', 'How do you create a custom constraint?', 'Define an annotation with @Constraint and implement ConstraintValidator for it.'],
            ['F', 'What attributes must the annotation have?', 'message, groups and payload.'],
            ['M', 'Should isValid return false for null?', 'Usually no; return true and combine with @NotNull.'],
            ['M', 'How do you validate two fields together?', 'Put a class-level constraint and read both fields in isValid.'],
            ['S', 'Can a ConstraintValidator use @Autowired?', 'Yes, Spring builds validators with a SpringConstraintValidatorFactory so injection works.'],
            ['S', 'How do you attach the error to a single field in a class-level rule?', 'Disable the default violation and build one with addPropertyNode(field).']],
        [['A @StrongPassword constraint.',
            r`@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {
    String message() default "Password is too weak";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class StrongPasswordValidator
        implements ConstraintValidator<StrongPassword, String> {
    public boolean isValid(String v, ConstraintValidatorContext c) {
        return v == null || v.matches("(?=.*\\d)(?=.*[A-Z]).{8,}");
    }
}

// OUTPUT:
// "abc" -> invalid: Password is too weak
// "Secret123" -> valid`],
            ['Use it in a DTO.',
                r`public record SignUp(
        @NotBlank String user,
        @StrongPassword String password) { }

// OUTPUT:
// POST {"user":"ann","password":"abc"} -> 400, field password: Password is too weak`]],
        [['Class-level match rule.',
            r`public class MatchValidator
        implements ConstraintValidator<PasswordsMatch, SignUpForm> {
    public boolean isValid(SignUpForm f, ConstraintValidatorContext c) {
        boolean ok = Objects.equals(f.password(), f.confirm());
        if (!ok) {
            c.disableDefaultConstraintViolation();
            c.buildConstraintViolationWithTemplate("Passwords differ")
                .addPropertyNode("confirm").addConstraintViolation();
        }
        return ok;
    }
}

// OUTPUT:
// confirm: Passwords differ`],
            ['Test the validator alone.',
                r`@Test
void weakRejected() {
    var v = new StrongPasswordValidator();
    assertFalse(v.isValid("abc", null));
    assertTrue(v.isValid("Secret123", null));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-errors': x(
        ['<b>Errors</b> is the Spring interface <code>org.springframework.validation.Errors</code> that stores binding and validation problems for one target object.',
            '<b>Methods</b> include <code>reject</code> (object error), <code>rejectValue</code> (field error), <code>hasErrors</code> and <code>getFieldError</code>.',
            '<b>BindingResult</b> extends Errors and is the type you declare in a handler to receive the problems.'],
        ['<b>Position</b>: the <code>BindingResult</code> parameter must come right after the model attribute it describes.',
            '<b>Missing it</b> makes Spring throw <code>MethodArgumentNotValidException</code> or <code>BindException</code> instead of calling the method.',
            '<b>Nested path</b>: <code>pushNestedPath("address")</code> lets a validator report errors on a sub-object.'],
        ['<b>Model key</b>: errors live in the model under <code>BindingResult.MODEL_KEY_PREFIX + name</code>, so a redirect loses them.',
            '<b>Codes</b>: each error carries several message codes from specific to general for message lookup.',
            '<b>Counting</b>: <code>getErrorCount</code>, <code>getFieldErrors</code> and <code>getGlobalErrors</code> help build custom responses.'],
        [['F', 'What is the Errors interface?', 'A holder for validation and binding errors of one object.'],
            ['F', 'Where must BindingResult be declared?', 'Immediately after the validated parameter.'],
            ['M', 'Difference between reject and rejectValue?', 'reject adds a global (object) error; rejectValue adds an error for one field.'],
            ['M', 'Errors versus BindingResult?', 'BindingResult extends Errors and adds model support and access to the target and raw values.'],
            ['S', 'What happens with no BindingResult and invalid input?', 'Spring throws an exception (MethodArgumentNotValidException or BindException) before the handler runs.'],
            ['S', 'Why do errors vanish after a redirect?', 'They are in the model of that request; use flash attributes or keep the view in the same request.']],
        [['Use BindingResult.',
            r`@PostMapping("/register")
String register(@Valid @ModelAttribute User user, BindingResult errors) {
    if (errors.hasErrors()) {
        System.out.println(errors.getErrorCount() + " error(s)");
        return "register";
    }
    return "redirect:/ok";
}

// OUTPUT:
// 2 error(s)`],
            ['Add errors by hand.',
                r`void check(User u, Errors errors) {
    if (u.getAge() < 18) errors.rejectValue("age", "age.min", "Must be adult");
    if (u.isBanned()) errors.reject("user.banned", "Account blocked");
}

// OUTPUT:
// field error: age -> Must be adult
// global error: Account blocked`]],
        [['Read errors.',
            r`for (FieldError fe : errors.getFieldErrors()) {
    System.out.println(fe.getField() + ": " + fe.getDefaultMessage());
}
errors.getGlobalErrors().forEach(g -> System.out.println(g.getObjectName()));

// OUTPUT:
// age: Must be adult
// user`],
            ['MockMvc check.',
                r`mockMvc.perform(post("/register").param("age", "5"))
    .andExpect(model().attributeHasFieldErrors("user", "age"))
    .andExpect(view().name("register"));

// OUTPUT:
// Status = 200, View name = register`]]
    ),

    'mvc-fielderror': x(
        ['<b>FieldError</b> is an <code>ObjectError</code> subclass for a problem with one property, such as a blank name.',
            '<b>Data</b>: it holds the object name, <code>field</code>, <code>rejectedValue</code>, codes, arguments and a default message.',
            '<b>Created</b> by <code>@Valid</code> constraint failures, type mismatches and <code>errors.rejectValue(...)</code>.'],
        ['<b>Get them</b> with <code>getFieldErrors()</code> or <code>getFieldError("age")</code> from the BindingResult.',
            '<b>bindingFailure</b> is true when the error came from type conversion (for example "abc" into an int), not from a constraint.',
            '<b>Views</b> show them with Thymeleaf <code>th:errors</code> or the JSP form tag <code>form:errors</code>.'],
        ['<b>Rejected value</b> lets the form show what the user typed; never log it for passwords.',
            '<b>JSON APIs</b>: map each FieldError to field plus message in your own error body.',
            '<b>Codes order</b>: for field age on object user: <code>Min.user.age</code>, <code>Min.age</code>, <code>Min.int</code>, <code>Min</code>.'],
        [['F', 'What is a FieldError?', 'An error tied to one property of the validated object.'],
            ['F', 'What does getRejectedValue return?', 'The value the user submitted that failed.'],
            ['M', 'How do you get the error of one field?', 'errors.getFieldError("age") or getFieldErrors("age").'],
            ['M', 'What is isBindingFailure?', 'True when the failure is a type conversion error, not a validation rule.'],
            ['S', 'How is a FieldError message found?', 'The MessageSource tries each code from specific to general, then the default message.'],
            ['S', 'How do you build a JSON error list from FieldErrors?', 'Stream getFieldErrors and map each to a field and message pair in an advice.']],
        [['Read a FieldError.',
            r`FieldError fe = errors.getFieldError("age");
System.out.println(fe.getField() + " | " + fe.getRejectedValue());
System.out.println(fe.getCode() + " | " + fe.getDefaultMessage());

// OUTPUT:
// age | 5
// Min | must be greater than or equal to 18`],
            ['Create one manually.',
                r`FieldError fe = new FieldError("user", "email", "bad@", false,
        new String[]{"Email.user.email"}, null, "Invalid email");
bindingResult.addError(fe);
System.out.println(bindingResult.hasFieldErrors("email"));

// OUTPUT:
// true`]],
        [['Show in Thymeleaf.',
            r`<input type="text" th:field="*{email}">
<span th:if="#fields.hasErrors('email')" th:errors="*{email}">Error</span>

<!-- OUTPUT -->
// <span>Invalid email</span> shown next to the input`],
            ['Type mismatch.',
                r`// form field age=abc for an int property
FieldError fe = errors.getFieldError("age");
System.out.println(fe.isBindingFailure() + " " + fe.getCode());

// OUTPUT:
// true typeMismatch`]]
    ),

    'mvc-objecterror': x(
        ['<b>ObjectError</b> is a validation problem about the whole object, not one field, also called a global error.',
            '<b>FieldError</b> extends ObjectError, so <code>getAllErrors()</code> returns both kinds.',
            '<b>Created</b> by <code>errors.reject("code", "message")</code> or by class-level constraints.'],
        ['<b>Examples</b>: passwords do not match, end date before start date, the account is blocked.',
            '<b>Read them</b> with <code>getGlobalErrors()</code> from BindingResult.',
            '<b>Views</b>: Thymeleaf shows them with <code>#fields.hasGlobalErrors()</code> and loop over <code>#fields.globalErrors()</code>.'],
        ['<b>Class-level constraints</b> produce an ObjectError unless the validator moves the violation to a property node.',
            '<b>Design</b>: attach to a field when the user can fix that field; use global errors for rules without one clear field.',
            '<b>API output</b>: give global errors a separate list or a null field in your error body.'],
        [['F', 'What is an ObjectError?', 'An error that applies to the whole object rather than a single field.'],
            ['F', 'How do you add one?', 'errors.reject("code", "default message").'],
            ['M', 'Relation between ObjectError and FieldError?', 'FieldError is a subclass of ObjectError.'],
            ['M', 'Which method lists only global errors?', 'BindingResult.getGlobalErrors().'],
            ['S', 'When does a class-level constraint create an ObjectError?', 'When the violation has no property node, so it is bound to the object itself.'],
            ['S', 'How do you convert an ObjectError to a response?', 'Use getObjectName and getDefaultMessage, and branch with instanceof FieldError for field details.']],
        [['Add a global error.',
            r`if (!form.password().equals(form.confirm())) {
    errors.reject("password.mismatch", "Passwords do not match");
}
System.out.println(errors.getGlobalErrors().get(0).getDefaultMessage());

// OUTPUT:
// Passwords do not match`],
            ['List all errors.',
                r`for (ObjectError e : errors.getAllErrors()) {
    String kind = e instanceof FieldError ? "field" : "global";
    System.out.println(kind + ": " + e.getDefaultMessage());
}

// OUTPUT:
// field: Invalid email
// global: Passwords do not match`]],
        [['Date range rule.',
            r`public void validate(Object t, Errors errors) {
    Booking b = (Booking) t;
    if (b.getTo().isBefore(b.getFrom())) {
        errors.reject("booking.range", "End must be after start");
    }
}

// OUTPUT:
// global error: End must be after start`],
            ['Test it.',
                r`mockMvc.perform(post("/book").param("from", "2026-05-02").param("to", "2026-05-01"))
    .andExpect(model().attributeHasErrors("booking"));

// OUTPUT:
// Status = 200, errors on booking`]]
    ),

    'mvc-validation-messages': x(
        ['<b>Validation messages</b> are the texts users see for failed rules; they come from the annotation <code>message</code> or from a properties file.',
            '<b>Placeholders</b> such as <code>{min}</code> and <code>{max}</code> are filled from the annotation attributes.',
            '<b>Keys</b> in curly braces, like <code>message = "{user.name.required}"</code>, are looked up in <code>ValidationMessages.properties</code>.'],
        ['<b>Two sources</b>: Bean Validation reads <code>ValidationMessages.properties</code>; Spring MVC reads its <code>MessageSource</code> with codes like <code>NotBlank.user.name</code>.',
            '<b>Locale</b>: add <code>messages_fr.properties</code> and the <code>LocaleResolver</code> picks the file per request.',
            '<b>Boot</b> sets the basename with <code>spring.messages.basename</code>.'],
        ['<b>One source</b>: make Bean Validation use the Spring MessageSource through <code>LocalValidatorFactoryBean.setValidationMessageSource</code>.',
            '<b>Encoding</b>: set <code>spring.messages.encoding=UTF-8</code> for non-Latin text.',
            '<b>Never hardcode</b> user text in annotations on a product with several languages.'],
        [['F', 'Where do default validation messages come from?', 'From the constraint annotation message attribute or the Hibernate Validator bundle.'],
            ['F', 'What file overrides Bean Validation messages?', 'ValidationMessages.properties on the classpath.'],
            ['M', 'What is the lookup code for NotBlank on user.name?', 'NotBlank.user.name, then NotBlank.name, NotBlank.java.lang.String, NotBlank.'],
            ['M', 'How do you get messages in several languages?', 'Provide messages_xx.properties files and a LocaleResolver.'],
            ['S', 'How do you use one MessageSource for both systems?', 'Create a LocalValidatorFactoryBean and call setValidationMessageSource with the Spring one.'],
            ['S', 'Why do accents show as question marks?', 'The properties file encoding is wrong; use UTF-8 and set spring.messages.encoding.']],
        [['Messages in a properties file.',
            r`# messages.properties
NotBlank.user.name=Please enter a name
Size.user.name=Name must be {min}
to {max}
characters
Min.user.age=You must be at least {value}

# OUTPUT:
# name "" -> Please enter a name
# name "A" -> Name must be 2 to 20 characters`],
            ['Annotation with key.',
                r`public class User {
    @NotBlank(message = "{user.name.required}")
    @Size(min = 2, max = 20)
    private String name;
}
# ValidationMessages.properties: user.name.required=Name is required

// OUTPUT:
// name: Name is required`]],
        [['Spring config for both.',
            r`@Bean
public LocalValidatorFactoryBean validator(MessageSource ms) {
    LocalValidatorFactoryBean v = new LocalValidatorFactoryBean();
    v.setValidationMessageSource(ms);
    return v;
}

// OUTPUT:
// constraint messages now resolve from messages*.properties`],
            ['Test a locale.',
                r`mockMvc.perform(post("/users").param("name", "").locale(Locale.FRENCH))
    .andExpect(model().attributeHasFieldErrors("user", "name"));

// OUTPUT:
// Status = 200, message from messages_fr.properties`]]
    ),

    'mvc-validation-groups': x(
        ['<b>Validation groups</b> let one class have different rule sets by use case, for example create versus update.',
            '<b>A group</b> is just an empty marker interface, like <code>interface OnCreate {}</code>.',
            '<b>Selecting</b> a group in a controller uses <code>@Validated(OnCreate.class)</code> instead of <code>@Valid</code>.'],
        ['<b>Constraints</b> name their groups: <code>@NotNull(groups = OnUpdate.class)</code> on the id field.',
            '<b>Default group</b>: a constraint without groups belongs to <code>Default</code>, which does not run when you select another group.',
            '<b>Extend</b> Default in your marker (<code>interface OnCreate extends Default</code>) to run both.'],
        ['<b>@Valid cannot choose</b> a group; only the Spring <code>@Validated</code> can.',
            '<b>Order</b>: <code>@GroupSequence</code> runs groups one after another and stops at the first failing group, useful to avoid costly checks.',
            '<b>Design</b>: often separate DTOs for create and update are simpler than groups.'],
        [['F', 'What is a validation group?', 'A marker interface that tags constraints so you can run a subset of them.'],
            ['F', 'Which annotation selects a group in Spring MVC?', '@Validated with the group class.'],
            ['M', 'Can @Valid pick a group?', 'No, it always uses the Default group.'],
            ['M', 'What happens to constraints with no group?', 'They are in Default and are skipped when you validate only another group.'],
            ['S', 'What does @GroupSequence do?', 'Runs groups in order and stops at the first group that has violations.'],
            ['S', 'Groups or separate DTOs?', 'Separate DTOs are clearer and safer; groups suit one shared model with small differences.']],
        [['Define and use groups.',
            r`public interface OnCreate {}
public interface OnUpdate {}

public class Product {
    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    private Long id;
    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    private String name;
}

// OUTPUT:
// create with id=5 -> id must be null
// update with id=null -> id must not be null`],
            ['Controller.',
                r`@PostMapping("/products")
Product create(@Validated(OnCreate.class) @RequestBody Product p) { return p; }

@PutMapping("/products")
Product update(@Validated(OnUpdate.class) @RequestBody Product p) { return p; }

// OUTPUT:
// PUT {"name":"Pen"} -> 400 (id must not be null)`]],
        [['GroupSequence.',
            r`@GroupSequence({Default.class, Expensive.class})
public interface Ordered {}

// Expensive checks run only if all Default checks pass

// OUTPUT:
// Default fails -> Expensive never runs`],
            ['Test groups.',
                r`Validator v = Validation.buildDefaultValidatorFactory().getValidator();
Product p = new Product();
System.out.println(v.validate(p, OnUpdate.class).size());

// OUTPUT:
// 2`]]
    ),

    'mvc-form-validation-validation': x(
        ['<b>Form validation</b> in Spring MVC checks submitted form data and, on errors, shows the same form again with messages.',
            '<b>Flow</b>: bind request params to a form object, validate it with <code>@Valid</code>, test <code>BindingResult.hasErrors()</code>.',
            '<b>Success</b> redirects (Post-Redirect-Get); failure returns the form view name.'],
        ['<b>Form object</b> is a plain class with constraints like <code>@NotBlank</code> and <code>@Email</code>.',
            '<b>View</b> uses <code>th:field</code> and <code>th:errors</code> so values and messages are kept.',
            '<b>GET form</b> must put an empty object in the model, for example <code>model.addAttribute("user", new UserForm())</code>.'],
        ['<b>PRG</b>: never return a view after a successful POST, or a refresh submits again.',
            '<b>Server rules</b> always matter; HTML <code>required</code> attributes are only hints and are easy to bypass.',
            '<b>Testing</b>: use MockMvc with <code>.param()</code> and check the model errors and view name.'],
        [['F', 'What does @Valid do on a form object?', 'It triggers Bean Validation after binding.'],
            ['F', 'What do you return when there are errors?', 'The form view name, so the form is shown again.'],
            ['M', 'Why redirect after a successful POST?', 'To avoid a duplicate submit on refresh (Post-Redirect-Get).'],
            ['M', 'Why must the GET handler add an empty object?', 'The view binds th:field to it; without it rendering fails.'],
            ['S', 'Is client-side validation enough?', 'No, it can be bypassed; the server must validate.'],
            ['S', 'How do you keep errors across a redirect?', 'Do not redirect on errors; for success messages use RedirectAttributes flash attributes.']],
        [['Form controller.',
            r`@Controller
public class SignUpController {
    @GetMapping("/signup")
    String form(Model m) {
        m.addAttribute("form", new SignUpForm());
        return "signup";
    }

    @PostMapping("/signup")
    String submit(@Valid @ModelAttribute("form") SignUpForm f, BindingResult br) {
        if (br.hasErrors()) return "signup";
        return "redirect:/welcome";
    }
}

// OUTPUT:
// POST name= -> 200 view signup (errors)
// POST name=Ann&email=a@b.com -> 302 /welcome`],
            ['Form class.',
                r`public class SignUpForm {
    @NotBlank(message = "Name is required")
    private String name;
    @Email(message = "Invalid email")
    @NotBlank
    private String email;
    // getters and setters
}

// OUTPUT:
// name blank -> Name is required`]],
        [['Thymeleaf form.',
            r`<form th:action="@{/signup}" th:object="$` + r`{form}
" method="post">
    <input th:field="*{name}">
    <span th:errors="*{name}">err</span>
    <button>Save</button>
</form>

<!-- OUTPUT -->
// <span>Name is required</span> after a blank submit`],
            ['MockMvc test.',
                r`mockMvc.perform(post("/signup").param("name", "").param("email", "x"))
    .andExpect(status().isOk())
    .andExpect(view().name("signup"))
    .andExpect(model().attributeHasFieldErrors("form", "name", "email"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-rest-request-validation': x(
        ['<b>REST request validation</b> checks a JSON body or parameters: put <code>@Valid</code> on a <code>@RequestBody</code> and constraints on the DTO.',
            '<b>Failure</b> throws <code>MethodArgumentNotValidException</code>, which Spring turns into <code>400 Bad Request</code> by default.',
            '<b>Parameters</b>: constraints on <code>@RequestParam</code> and <code>@PathVariable</code> need <code>@Validated</code> on the class.'],
        ['<b>Java records</b> work well as DTOs: <code>record CreateUser(@NotBlank String name)</code>.',
            '<b>Custom body</b>: handle the exception in <code>@RestControllerAdvice</code> and return a list of field errors.',
            '<b>Param violations</b> throw <code>ConstraintViolationException</code> (or <code>HandlerMethodValidationException</code> in Spring 6.1+).'],
        ['<b>Bad JSON</b> (wrong types, broken syntax) throws <code>HttpMessageNotReadableException</code>, a different path from constraint errors.',
            '<b>Nested objects</b> need <code>@Valid</code> on the nested field and on list elements to be checked.',
            '<b>Security</b>: validate size limits (<code>@Size</code>) so clients cannot send huge payloads.'],
        [['F', 'How do you validate a JSON body?', 'Annotate the DTO fields and add @Valid to the @RequestBody parameter.'],
            ['F', 'Which status does a failed body validation give?', '400 Bad Request.'],
            ['M', 'What exception is thrown for an invalid body?', 'MethodArgumentNotValidException.'],
            ['M', 'How do you validate a path variable?', 'Add @Validated on the controller class and a constraint such as @Min on the parameter.'],
            ['S', 'Why are nested fields not validated?', 'Cascading needs @Valid on the nested field.'],
            ['S', 'How is malformed JSON different from invalid data?', 'Malformed JSON fails in the message converter with HttpMessageNotReadableException before validation runs.']],
        [['Validated REST endpoint.',
            r`public record CreateUser(
        @NotBlank String name,
        @Email String email,
        @Min(18) int age) { }

@RestController
class UserApi {
    @PostMapping("/api/users")
    ResponseEntity<CreateUser> create(@Valid @RequestBody CreateUser u) {
        return ResponseEntity.status(201).body(u);
    }
}

// OUTPUT:
// POST {"name":"","email":"x","age":10} -> 400 Bad Request
// POST {"name":"Ann","email":"a@b.com","age":20} -> 201 Created`],
            ['Error body from an advice.',
                r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> handle(MethodArgumentNotValidException e) {
        Map<String, String> m = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
            .forEach(f -> m.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(m);
    }
}

// OUTPUT:
// 400 {"name":"must not be blank","age":"must be greater than or equal to 18"}`]],
        [['WebMvcTest.',
            r`@WebMvcTest(UserApi.class)
class UserApiTest {
    @Autowired MockMvc mvc;
    @Test
    void badBody() throws Exception {
        mvc.perform(post("/api/users").contentType("application/json")
                .content("{\"name\":\"\"}"))
           .andExpect(status().isBadRequest());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Parameter validation.',
                r`@Validated
@RestController
class ItemApi {
    @GetMapping("/items/{id}")
    String get(@PathVariable @Min(1) long id) { return "item " + id; }
}

// OUTPUT:
// GET /items/0 -> 400 (constraint violation)
// GET /items/7 -> 200 item 7`]]
    ),

    'mvc-exception-handling-in-spring-mvc': x(
        ['<b>Exception handling</b> in Spring MVC turns exceptions thrown by controllers into proper responses instead of a raw error page.',
            '<b>@ExceptionHandler</b> marks a method that handles a given exception type in one controller.',
            '<b>@ControllerAdvice</b> (or <code>@RestControllerAdvice</code>) shares such handlers across all controllers.'],
        ['<b>Status</b>: set it with <code>@ResponseStatus</code>, <code>ResponseEntity</code> or throw <code>ResponseStatusException</code>.',
            '<b>Resolvers</b>: the DispatcherServlet asks <code>HandlerExceptionResolver</code> beans, such as <code>ExceptionHandlerExceptionResolver</code>, in order.',
            '<b>Unhandled</b> exceptions go to the servlet container error page; Boot maps it to <code>/error</code>.'],
        ['<b>ProblemDetail</b> (RFC 7807, Spring 6) is the standard JSON error body; extend <code>ResponseEntityExceptionHandler</code> to customize built-in errors.',
            '<b>Specific first</b>: the most specific exception type wins, so put a generic <code>Exception</code> handler last.',
            '<b>Logging</b>: log the stack trace once in the advice and send only a safe message to clients.'],
        [['F', 'What does @ExceptionHandler do?', 'It marks a method that handles a given exception thrown by controller handlers.'],
            ['F', 'What is @ControllerAdvice for?', 'Global exception handling (and binder or model setup) for all controllers.'],
            ['M', 'Difference between @ControllerAdvice and @RestControllerAdvice?', 'The REST one adds @ResponseBody so return values are written as JSON.'],
            ['M', 'How do you return a 404 quickly?', 'Throw ResponseStatusException(HttpStatus.NOT_FOUND) or an exception annotated with @ResponseStatus.'],
            ['S', 'Which resolvers run, and in what order?', 'ExceptionHandlerExceptionResolver, ResponseStatusExceptionResolver, DefaultHandlerExceptionResolver.'],
            ['S', 'What is ProblemDetail?', 'A Spring 6 class for the RFC 7807 problem JSON; enable with spring.mvc.problemdetails.enabled in Boot.']],
        [['Global JSON handler.',
            r`@RestControllerAdvice
class GlobalHandler {
    @ExceptionHandler(UserNotFoundException.class)
    ResponseEntity<Map<String, String>> notFound(UserNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> other(Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Server error"));
    }
}

// OUTPUT:
// GET /users/9 -> 404 {"error":"User 9 not found"}
// unexpected failure -> 500 {"error":"Server error"}`],
            ['Annotated exception.',
                r`@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(long id) { super("User " + id + " not found"); }
}

// OUTPUT:
// throw new UserNotFoundException(9) -> HTTP 404`]],
        [['ProblemDetail.',
            r`@ExceptionHandler(UserNotFoundException.class)
ProblemDetail notFound(UserNotFoundException e) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    pd.setTitle("User not found");
    return pd;
}

// OUTPUT:
// 404 {"type":"about:blank","title":"User not found","status":404,
//  "detail":"User 9 not found","instance":"/users/9"}`],
            ['Test the handler.',
                r`mockMvc.perform(get("/users/9"))
    .andExpect(status().isNotFound())
    .andExpect(jsonPath("$.error").value("User 9 not found"));

// OUTPUT:
// Status = 404, Body = {"error":"User 9 not found"}`]]
    )
};

export const smvc14Deep: Record<string, Deep> = {
    'mvc-validator': dv(
        [`<p>The <code>DataBinder</code> owns the validators and calls them after binding.</p><ul><li><b>Binding:</b> request params are bound to the target, then <code>binder.validate()</code> runs.</li><li><b>Loop:</b> each registered Validator is called with the target and the <code>BindingResult</code>.</li><li><b>Global validator:</b> Boot registers <code>LocalValidatorFactoryBean</code>, which runs Bean Validation.</li><li><b>Check:</b> <code>addValidators</code> calls <code>supports</code> first and fails fast if the type is wrong.</li></ul>`,
            r`WebDataBinder binder = ...;
binder.addValidators(new PersonValidator());
binder.bind(propertyValues);
binder.validate();
BindingResult result = binder.getBindingResult();
System.out.println(result.getErrorCount());

// OUTPUT:
// 2`],
        [`<p>Variants of Validator usage.</p><ul><li><b>@InitBinder:</b> per controller, optional model name filter.</li><li><b>setValidator:</b> replaces the default one instead of adding.</li><li><b>SmartValidator:</b> adds <code>validate(target, errors, hints)</code> for groups.</li><li><b>Manual:</b> call <code>validate</code> in a service.</li></ul>`,
            r`@InitBinder("person")
void init(WebDataBinder b) { b.addValidators(new PersonValidator()); }

@InitBinder
void replace(WebDataBinder b) { b.setValidator(new OtherValidator()); }

// OUTPUT:
// addValidators keeps annotation checks; setValidator removes them`],
        [`<p>Typical mistakes.</p><ul><li><b>Wrong supports:</b> using <code>equals</code> instead of <code>isAssignableFrom</code> breaks proxies.</li><li><b>No @InitBinder name:</b> the validator is applied to every model attribute and fails supports().</li><li><b>Null target:</b> forgetting null checks in validate.</li></ul>`,
            r`// WRONG: applies to every attribute, throws IllegalStateException
@InitBinder
void bad(WebDataBinder b) { b.addValidators(new PersonValidator()); }

// RIGHT: name the attribute
@InitBinder("person")
void good(WebDataBinder b) { b.addValidators(new PersonValidator()); }

// OUTPUT:
// bad: Invalid target for Validator ... when another attribute is bound`],
        [`<p>Performance notes.</p><ul><li><b>Cheap:</b> a Validator is a plain object with no reflection cost.</li><li><b>Reuse:</b> make it stateless and share one instance.</li><li><b>Database checks:</b> avoid a query per field; do one lookup and report it.</li></ul>`,
            r`private static final PersonValidator V = new PersonValidator();

@InitBinder("person")
void init(WebDataBinder b) { b.addValidators(V); }

// OUTPUT:
// one shared stateless instance, no allocation per request`],
        [`<p>Scenario: a booking form needs a rule that the room is free. Annotations cover required fields, and a Validator calls the booking service once and rejects the dates when taken.</p>`,
            r`public void validate(Object t, Errors errors) {
    Booking b = (Booking) t;
    if (!errors.hasFieldErrors() && !rooms.isFree(b.getRoom(), b.getFrom(), b.getTo())) {
        errors.reject("room.taken", "Room is not free for these dates");
    }
}

// OUTPUT:
// POST /book -> form shown again with: Room is not free for these dates`]
    ),

    'mvc-custom-validator': dv(
        [`<p>How a custom constraint is resolved.</p><ul><li><b>Scan:</b> Hibernate Validator reads <code>@Constraint(validatedBy)</code> on your annotation.</li><li><b>Create:</b> <code>SpringConstraintValidatorFactory</code> builds the validator as a bean-like object, so injection works.</li><li><b>Init:</b> <code>initialize(annotation)</code> receives attribute values once.</li><li><b>Call:</b> <code>isValid</code> runs for each validation and returns true or false.</li></ul>`,
            r`public class RangeValidator implements ConstraintValidator<InRange, Integer> {
    private int min, max;
    public void initialize(InRange a) {
        min = a.min();
        max = a.max();
    }
    public boolean isValid(Integer v, ConstraintValidatorContext c) {
        return v == null || (v >= min && v <= max);
    }
}

// OUTPUT:
// @InRange(min=1, max=5): 3 -> valid, 9 -> invalid`],
        [`<p>Options for a custom constraint.</p><ul><li><b>Field or parameter:</b> choose with <code>@Target</code>.</li><li><b>Composed:</b> combine existing constraints into one annotation using <code>@ReportAsSingleViolation</code>.</li><li><b>Cross-parameter:</b> <code>@SupportedValidationTarget</code> for methods.</li><li><b>Repeatable:</b> add a container annotation.</li></ul>`,
            r`@NotBlank
@Size(min = 8)
@Pattern(regexp = ".*\\d.*")
@Constraint(validatedBy = {})
@ReportAsSingleViolation
@Retention(RetentionPolicy.RUNTIME)
public @interface Password {
    String message() default "Invalid password";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// OUTPUT:
// any inner failure -> one violation: Invalid password`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Missing groups or payload:</b> the provider throws a ConstraintDefinitionException.</li><li><b>Null returns false:</b> optional fields fail; return true for null.</li><li><b>Not discovered:</b> forgetting <code>@Retention(RUNTIME)</code>.</li></ul>`,
            r`// WRONG
public boolean isValid(String v, ConstraintValidatorContext c) {
    return v.length() > 3;      // NullPointerException for null
}
// RIGHT
public boolean isValid(String v, ConstraintValidatorContext c) {
    return v == null || v.length() > 3;
}

// OUTPUT:
// null input -> valid (use @NotNull to forbid it)`],
        [`<p>Performance notes.</p><ul><li><b>Compile regex once:</b> store a <code>Pattern</code> field, not <code>matches</code> per call.</li><li><b>Remote calls:</b> a database check in isValid runs on each request.</li><li><b>Thread safety:</b> validators must be stateless after initialize.</li></ul>`,
            r`public class CodeValidator implements ConstraintValidator<Code, String> {
    private static final Pattern P = Pattern.compile("[A-Z]{3}-\\d{4}");
    public boolean isValid(String v, ConstraintValidatorContext c) {
        return v == null || P.matcher(v).matches();
    }
}

// OUTPUT:
// pattern compiled once per class`],
        [`<p>Scenario: usernames must be unique. A <code>@UniqueUsername</code> constraint injects the repository and checks existence, so every DTO that uses it gets the same rule.</p>`,
            r`public class UniqueUsernameValidator
        implements ConstraintValidator<UniqueUsername, String> {
    private final UserRepository repo;
    public UniqueUsernameValidator(UserRepository repo) { this.repo = repo; }
    public boolean isValid(String v, ConstraintValidatorContext c) {
        return v == null || !repo.existsByUsername(v);
    }
}

// OUTPUT:
// "ann" taken -> 400 username: Username already exists`]
    ),

    'mvc-errors': dv(
        [`<p>The Errors hierarchy.</p><ul><li><b>Implementation:</b> <code>BeanPropertyBindingResult</code> (or <code>BindException</code>) holds lists of ObjectError and FieldError.</li><li><b>Binder:</b> the DataBinder creates it and adds type mismatches and validator results.</li><li><b>Argument resolver:</b> <code>ModelAttributeMethodProcessor</code> passes it to the BindingResult parameter.</li><li><b>No parameter:</b> it throws <code>MethodArgumentNotValidException</code> when errors exist.</li></ul>`,
            r`BeanPropertyBindingResult br = new BeanPropertyBindingResult(user, "user");
br.rejectValue("age", "age.min", "Too young");
br.reject("account.locked");
System.out.println(br.getFieldErrorCount() + " " + br.getGlobalErrorCount());

// OUTPUT:
// 1 1`],
        [`<p>Useful Errors API.</p><ul><li><b>Check:</b> <code>hasErrors</code>, <code>hasFieldErrors(name)</code>, <code>hasGlobalErrors</code>.</li><li><b>Read:</b> <code>getAllErrors</code>, <code>getFieldValue(field)</code>.</li><li><b>Nested:</b> <code>pushNestedPath</code> and <code>popNestedPath</code>.</li></ul>`,
            r`errors.pushNestedPath("address");
errors.rejectValue("city", "city.empty");
errors.popNestedPath();
System.out.println(errors.getFieldError().getField());

// OUTPUT:
// address.city`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Wrong order:</b> a parameter between the model attribute and BindingResult causes an exception.</li><li><b>Redirect:</b> returning redirect with errors loses them.</li><li><b>Ignoring errors:</b> not checking hasErrors saves bad data.</li></ul>`,
            r`// WRONG: Model sits between the attribute and its BindingResult
String bad(@Valid User u, Model m, BindingResult br) { return "x"; }
// RIGHT
String good(@Valid User u, BindingResult br, Model m) { return "x"; }

// OUTPUT:
// bad: IllegalStateException: An Errors/BindingResult argument is expected ...`],
        [`<p>Performance notes.</p><ul><li><b>Lazy messages:</b> message lookup happens at render time.</li><li><b>Large forms:</b> stop early with <code>hasErrors</code> in a multi-step validator.</li><li><b>Memory:</b> errors are request scoped, so cost is small.</li></ul>`,
            r`if (errors.getErrorCount() > 20) {
    return;            // stop expensive checks once the form is hopeless
}

// OUTPUT:
// validation ends early on large invalid payloads`],
        [`<p>Scenario: an admin screen validates a user form. The handler checks <code>BindingResult</code>, adds a global error when the account is locked, and shows both field and global messages.</p>`,
            r`@PostMapping("/admin/users")
String save(@Valid @ModelAttribute UserForm f, BindingResult br) {
    if (!br.hasFieldErrors() && accounts.isLocked(f.getName())) {
        br.reject("account.locked", "Account is locked");
    }
    return br.hasErrors() ? "admin/user-form" : "redirect:/admin/users";
}

// OUTPUT:
// locked user -> form view with global error: Account is locked`]
    ),

    'mvc-fielderror': dv(
        [`<p>How a FieldError appears.</p><ul><li><b>Constraint:</b> <code>SpringValidatorAdapter</code> converts each ConstraintViolation into a FieldError.</li><li><b>Codes:</b> <code>DefaultMessageCodesResolver</code> builds codes such as <code>NotBlank.user.name</code>.</li><li><b>Arguments:</b> include a <code>DefaultMessageSourceResolvable</code> for the field name, then the annotation attributes.</li><li><b>Message:</b> the MessageSource formats the first matching code.</li></ul>`,
            r`FieldError fe = errors.getFieldError("name");
System.out.println(Arrays.toString(fe.getCodes()));

// OUTPUT:
// [NotBlank.user.name, NotBlank.name, NotBlank.java.lang.String, NotBlank]`],
        [`<p>Constructors and options.</p><ul><li><b>Short:</b> <code>new FieldError(object, field, message)</code>.</li><li><b>Full:</b> adds rejectedValue, bindingFailure, codes, arguments.</li><li><b>rejectValue:</b> the simplest way inside a Validator.</li></ul>`,
            r`errors.rejectValue("email", "email.taken", new Object[]{email}, "Email in use");

// OUTPUT:
// FieldError on email, code email.taken`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Wrong field name:</b> an unknown property throws <code>NotReadablePropertyException</code>.</li><li><b>Leaking input:</b> echoing rejected passwords.</li><li><b>Mixed lists:</b> casting every ObjectError to FieldError throws ClassCastException.</li></ul>`,
            r`// WRONG
FieldError fe = (FieldError) errors.getAllErrors().get(0);
// RIGHT
errors.getFieldErrors().forEach(fe -> System.out.println(fe.getField()));

// OUTPUT:
// no ClassCastException for global errors`],
        [`<p>Performance notes.</p><ul><li><b>Message lookup</b> is cached by the MessageSource per locale.</li><li><b>Many errors:</b> mapping thousands of FieldErrors for an API is cheap but cap the list size.</li></ul>`,
            r`List<Map<String, String>> out = errors.getFieldErrors().stream()
    .limit(50)
    .map(f -> Map.of("field", f.getField(), "message", f.getDefaultMessage()))
    .toList();

// OUTPUT:
// at most 50 entries returned`],
        [`<p>Scenario: a form shows the user own wrong entry in the input and a message below it. Thymeleaf uses the FieldError rejected value and message; a CSS class is added with <code>th:errorclass</code>.</p>`,
            r`<input th:field="*{age}" th:errorclass="is-invalid">
<div th:errors="*{age}"></div>

<!-- OUTPUT -->
// input keeps "5" and shows: must be greater than or equal to 18`]
    ),

    'mvc-objecterror': dv(
        [`<p>How global errors arise.</p><ul><li><b>Direct:</b> <code>errors.reject(code)</code> creates an ObjectError with the object name.</li><li><b>Class-level constraint:</b> a violation with an empty property path becomes an ObjectError.</li><li><b>Codes:</b> built as <code>code.objectName</code> then <code>code</code>.</li></ul>`,
            r`errors.reject("range.invalid", "Bad range");
ObjectError oe = errors.getGlobalError();
System.out.println(Arrays.toString(oe.getCodes()));

// OUTPUT:
// [range.invalid.booking, range.invalid]`],
        [`<p>Variants.</p><ul><li><b>With args:</b> <code>reject(code, args, defaultMessage)</code>.</li><li><b>Class constraint:</b> <code>@ScriptAssert</code> or your own TYPE-level annotation.</li><li><b>Move to field:</b> <code>addPropertyNode</code> in the validator context.</li></ul>`,
            r`errors.reject("stock.low", new Object[]{3}, "Only 3 left");

// OUTPUT:
// global error: Only 3 left`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Not displayed:</b> forgetting to render global errors in the view.</li><li><b>Wrong type:</b> using reject when the field is known.</li></ul>`,
            r`<div th:if="$` + r`{#fields.hasGlobalErrors()}
">
    <p th:each="e : $` + r`{#fields.globalErrors()}
" th:text="$` + r`{e}
"></p>
</div>

<!-- OUTPUT -->
// lists each global error message above the form`],
        [`<p>Performance notes.</p><ul><li><b>Order:</b> run cheap field checks first and global checks only if no field errors.</li><li><b>Cost:</b> global rules often touch several fields or a service, so guard them.</li></ul>`,
            r`if (!errors.hasFieldErrors()) {
    checkCrossFieldRules(form, errors);
}

// OUTPUT:
// cross-field rules skipped when single fields already failed`],
        [`<p>Scenario: a transfer form with source, target and amount. Fields are checked first; then a global error is added when source equals target.</p>`,
            r`if (!errors.hasFieldErrors() && t.getFrom().equals(t.getTo())) {
    errors.reject("transfer.same", "Accounts must differ");
}

// OUTPUT:
// global error: Accounts must differ`]
    ),

    'mvc-validation-messages': dv(
        [`<p>Message resolution flow.</p><ul><li><b>Violation:</b> Hibernate Validator interpolates the template, replacing <code>{min}</code> and resolving keys from <code>ValidationMessages</code>.</li><li><b>Adapter:</b> Spring wraps the result in a FieldError with codes and the interpolated default message.</li><li><b>Render:</b> the view calls the Spring MessageSource with the codes and locale.</li><li><b>Fallback:</b> if no code matches, the default message is used.</li></ul>`,
            r`# messages.properties
Size.user.name=Name must be between {2}
and {1}
characters

# Spring arguments are positional: {0}
=field, {1}
=max, {2}
=min

# OUTPUT:
# "A" -> Name must be between 2 and 20 characters`],
        [`<p>Configuration.</p><ul><li><b>Basename:</b> <code>spring.messages.basename=messages,errors</code>.</li><li><b>Locale:</b> <code>AcceptHeaderLocaleResolver</code> by default, or a session or cookie resolver.</li><li><b>Fallback:</b> <code>spring.messages.fallback-to-system-locale</code>.</li></ul>`,
            r`# application.properties
spring.messages.basename=messages
spring.messages.encoding=UTF-8
spring.messages.cache-duration=PT10M

# OUTPUT:
# messages reload at most every 10 minutes`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Two systems:</b> keys in messages.properties not applied to annotation braces, since those use ValidationMessages.</li><li><b>Wrong placeholder order:</b> Spring uses positional numbers, Bean Validation uses names.</li><li><b>Cache:</b> edits not visible until restart.</li></ul>`,
            r`// WRONG: key lives in messages.properties but the annotation resolves
// it with Bean Validation, so the text shows as {user.name.required}
@NotBlank(message = "{user.name.required}")

// RIGHT: add the key to ValidationMessages.properties or link the MessageSource
v.setValidationMessageSource(messageSource);

// OUTPUT:
// message shows the real text instead of the raw key`],
        [`<p>Performance notes.</p><ul><li><b>Caching:</b> ResourceBundleMessageSource caches bundles; set a cache duration in development only.</li><li><b>Interpolation:</b> Bean Validation caches parsed templates.</li></ul>`,
            r`# production: cache forever (default);
development: short cache
spring.messages.cache-duration=-1

# OUTPUT:
# bundles loaded once`],
        [`<p>Scenario: an app in English and Hindi. messages_en and messages_hi hold the same keys, the locale comes from a <code>lang</code> parameter via <code>LocaleChangeInterceptor</code>, and the same form shows translated errors.</p>`,
            r`@Bean
LocaleResolver localeResolver() { return new SessionLocaleResolver(); }

@Override
public void addInterceptors(InterceptorRegistry r) {
    r.addInterceptor(new LocaleChangeInterceptor());   // ?lang=hi
}

// OUTPUT:
// POST /signup?lang=hi -> error messages in Hindi`]
    ),

    'mvc-validation-groups': dv(
        [`<p>How groups are applied.</p><ul><li><b>Selection:</b> <code>@Validated(Group.class)</code> is read by the argument resolver and passed as hints to <code>SmartValidator.validate</code>.</li><li><b>Filter:</b> Hibernate Validator runs only constraints whose groups match.</li><li><b>Inheritance:</b> a group interface extending another includes the parent constraints.</li></ul>`,
            r`SmartValidator sv = ...;
sv.validate(product, errors, OnCreate.class);
System.out.println(errors.getErrorCount());

// OUTPUT:
// 1`],
        [`<p>Syntax variants.</p><ul><li><b>Several groups:</b> <code>groups = {A.class, B.class}</code>.</li><li><b>Combine with Default:</b> <code>@Validated({Default.class, OnCreate.class})</code>.</li><li><b>Sequence:</b> <code>@GroupSequence</code> on a class redefines Default.</li></ul>`,
            r`public interface OnCreate extends Default {}

@PostMapping("/p")
Product add(@Validated(OnCreate.class) @RequestBody Product p) { return p; }

// OUTPUT:
// Default and OnCreate constraints both run`],
        [`<p>Mistakes and fixes.</p><ul><li><b>@Valid used:</b> groups ignored; switch to @Validated.</li><li><b>Default skipped:</b> plain constraints not checked when a custom group is selected.</li><li><b>Nested:</b> cascaded objects also need matching groups.</li></ul>`,
            r`// WRONG: runs only Default, so @Null(groups = OnCreate.class) is skipped
Product bad(@Valid @RequestBody Product p)
// RIGHT
Product good(@Validated(OnCreate.class) @RequestBody Product p)

// OUTPUT:
// bad: id=5 accepted on create; good: 400`],
        [`<p>Performance notes.</p><ul><li><b>Fewer checks:</b> groups skip irrelevant constraints per request.</li><li><b>Sequences:</b> put cheap groups first so expensive checks run only when needed.</li></ul>`,
            r`@GroupSequence({Basic.class, Costly.class})
public interface Ordered {}

// OUTPUT:
// Costly rules (database) run only after Basic rules pass`],
        [`<p>Scenario: one <code>Employee</code> payload used for POST and PUT. Create must have no id, update must have one; groups keep one class and two clear rules.</p>`,
            r`public class Employee {
    @Null(groups = OnCreate.class) @NotNull(groups = OnUpdate.class)
    private Long id;
    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    private String name;
}

// OUTPUT:
// POST with id -> 400; PUT without id -> 400`]
    ),

    'mvc-form-validation-validation': dv(
        [`<p>The request path for a form post.</p><ul><li><b>Mapping:</b> <code>RequestMappingHandlerAdapter</code> invokes the handler method.</li><li><b>Resolver:</b> <code>ServletModelAttributeMethodProcessor</code> creates the object and binds the params.</li><li><b>Validate:</b> it calls the validators when <code>@Valid</code> or <code>@Validated</code> is present.</li><li><b>Result:</b> the BindingResult is put in the model so the view can read it.</li></ul>`,
            r`// inside the argument resolver (simplified)
WebDataBinder binder = factory.createBinder(request, target, "form");
binder.bind(request);
binder.validate();
mavContainer.addAllAttributes(binder.getBindingResult().getModel());

// OUTPUT:
// model has "form" and "org.springframework.validation.BindingResult.form"`],
        [`<p>Form options.</p><ul><li><b>Names:</b> <code>@ModelAttribute("form")</code> sets the model key.</li><li><b>Allowed fields:</b> <code>binder.setAllowedFields</code> blocks mass assignment.</li><li><b>Trimming:</b> <code>StringTrimmerEditor</code> turns blanks into null.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder b) {
    b.setAllowedFields("name", "email");
    b.registerCustomEditor(String.class, new StringTrimmerEditor(true));
}

// OUTPUT:
// "  " -> null, extra field "admin" ignored`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Return view after success:</b> double submit.</li><li><b>No empty object on GET:</b> template error.</li><li><b>@NotNull on strings:</b> empty text passes; use <code>@NotBlank</code>.</li></ul>`,
            r`// WRONG
if (!br.hasErrors()) {
    service.save(f);
    return "done";
}
// RIGHT
if (!br.hasErrors()) {
    service.save(f);
    return "redirect:/done";
}

// OUTPUT:
// refresh no longer repeats the save`],
        [`<p>Performance notes.</p><ul><li><b>Validate once:</b> avoid calling validate again in the service for the same data.</li><li><b>Binding limits:</b> <code>setAutoGrowCollectionLimit</code> protects against huge lists.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder b) { b.setAutoGrowCollectionLimit(100); }

// OUTPUT:
// index beyond 100 in items[...] is rejected`],
        [`<p>Scenario: a registration page. The GET shows an empty form, the POST validates, shows errors in place, and on success redirects with a flash message.</p>`,
            r`@PostMapping("/register")
String register(@Valid @ModelAttribute("form") RegForm f, BindingResult br,
        RedirectAttributes ra) {
    if (br.hasErrors()) return "register";
    users.create(f);
    ra.addFlashAttribute("msg", "Welcome " + f.getName());
    return "redirect:/login";
}

// OUTPUT:
// success -> 302 /login with flash message "Welcome Ann"`]
    ),

    'mvc-rest-request-validation': dv(
        [`<p>What happens for a JSON body.</p><ul><li><b>Convert:</b> <code>RequestResponseBodyMethodProcessor</code> reads JSON with Jackson.</li><li><b>Validate:</b> it runs the validator when the parameter has @Valid.</li><li><b>Fail:</b> it throws MethodArgumentNotValidException with the BindingResult.</li><li><b>Resolve:</b> <code>DefaultHandlerExceptionResolver</code> sends 400, or your advice handles it.</li></ul>`,
            r`// bad JSON syntax:   HttpMessageNotReadableException (400)
// constraint failure: MethodArgumentNotValidException (400)
// @Validated params:  ConstraintViolationException / HandlerMethodValidationException

// OUTPUT:
// three different exception types, all mapped to 400 unless customized`],
        [`<p>Variants.</p><ul><li><b>Lists:</b> <code>List&lt;@Valid Item&gt;</code> or a wrapper with @Valid on the list.</li><li><b>Params:</b> <code>@RequestParam @NotBlank String q</code> with class-level @Validated.</li><li><b>Groups:</b> <code>@Validated(Group.class)</code> on the body.</li></ul>`,
            r`public record Order(
        @NotEmpty List<@Valid Line> lines,
        @Valid Address address) { }
public record Line(@NotBlank String sku, @Positive int qty) { }

// OUTPUT:
// lines[1].qty: must be greater than 0`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Missing @Valid:</b> no check at all.</li><li><b>Primitive defaults:</b> a missing <code>int</code> becomes 0 and may pass; use <code>Integer</code> with @NotNull.</li><li><b>Leaking details:</b> returning stack traces.</li></ul>`,
            r`// WRONG: missing age silently becomes 0
public record P(@Min(1) int age) { }
// RIGHT: null is detected
public record P(@NotNull @Min(1) Integer age) { }

// OUTPUT:
// {} -> 400 age: must not be null`],
        [`<p>Performance notes.</p><ul><li><b>Limit sizes:</b> <code>@Size(max=...)</code> and a server max request size.</li><li><b>Fail fast:</b> Hibernate Validator can stop on the first violation with the <code>hibernate.validator.fail_fast</code> property.</li><li><b>Cheap rules first:</b> avoid database lookups in constraints.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-request-size=2MB
server.tomcat.max-http-form-post-size=2MB

# OUTPUT:
# oversized request rejected before validation`],
        [`<p>Scenario: a public orders API returns a uniform error list. The advice maps field errors to <code>{field, message}</code>, so clients can highlight the right input.</p>`,
            r`@ExceptionHandler(MethodArgumentNotValidException.class)
ProblemDetail invalid(MethodArgumentNotValidException e) {
    ProblemDetail pd = ProblemDetail.forStatus(400);
    pd.setTitle("Validation failed");
    pd.setProperty("errors", e.getBindingResult().getFieldErrors().stream()
        .map(f -> Map.of("field", f.getField(), "message", f.getDefaultMessage()))
        .toList());
    return pd;
}

// OUTPUT:
// 400 {"title":"Validation failed","errors":[{"field":"qty","message":"must be greater than 0"}]}`]
    ),

    'mvc-exception-handling-in-spring-mvc': dv(
        [`<p>How an exception is resolved.</p><ul><li><b>Catch:</b> <code>DispatcherServlet.processHandlerException</code> receives the exception.</li><li><b>Chain:</b> it asks each <code>HandlerExceptionResolver</code> in order.</li><li><b>1:</b> <code>ExceptionHandlerExceptionResolver</code> finds @ExceptionHandler methods, controller first, then advice.</li><li><b>2:</b> <code>ResponseStatusExceptionResolver</code> handles @ResponseStatus and ResponseStatusException.</li><li><b>3:</b> <code>DefaultHandlerExceptionResolver</code> maps Spring exceptions to statuses such as 405 and 400.</li></ul>`,
            r`// order of resolvers (simplified)
// 1 ExceptionHandlerExceptionResolver  -> @ExceptionHandler / advice
// 2 ResponseStatusExceptionResolver    -> @ResponseStatus
// 3 DefaultHandlerExceptionResolver    -> standard Spring errors

// OUTPUT:
// no resolver handles it -> container error page (/error in Boot)`],
        [`<p>Ways to handle errors.</p><ul><li><b>Local:</b> @ExceptionHandler inside the controller.</li><li><b>Global:</b> @ControllerAdvice, optionally limited by <code>basePackages</code> or annotations.</li><li><b>Status only:</b> @ResponseStatus on the exception class.</li><li><b>Programmatic:</b> <code>ResponseStatusException</code>.</li><li><b>Standard body:</b> extend <code>ResponseEntityExceptionHandler</code>.</li></ul>`,
            r`@RestControllerAdvice
class Handler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(IllegalStateException.class)
    ProblemDetail conflict(IllegalStateException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, e.getMessage());
    }
}

// OUTPUT:
// IllegalStateException -> 409 problem+json`],
        [`<p>Mistakes and fixes.</p><ul><li><b>Catch-all first:</b> a general handler hides specific ones in the same class only if types are ambiguous; keep it specific.</li><li><b>Swallowing:</b> returning 200 with an error text.</li><li><b>Handler throws:</b> an exception inside a handler goes unhandled.</li><li><b>Lost status:</b> returning a plain object gives 200; use ResponseEntity.</li></ul>`,
            r`// WRONG: error body but status 200
@ExceptionHandler(NotFound.class)
Map<String, String> bad(NotFound e) { return Map.of("error", "missing"); }
// RIGHT
@ExceptionHandler(NotFound.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
Map<String, String> good(NotFound e) { return Map.of("error", "missing"); }

// OUTPUT:
// bad -> 200; good -> 404`],
        [`<p>Performance notes.</p><ul><li><b>Stack traces:</b> creating them is costly; override <code>fillInStackTrace</code> for high-volume business exceptions.</li><li><b>Not control flow:</b> prefer checking conditions to throwing in hot paths.</li><li><b>Logging:</b> log once, at the advice, with the right level (warn for client errors).</li></ul>`,
            r`public class QuotaException extends RuntimeException {
    public QuotaException(String m) { super(m, null, false, false); }
}

// OUTPUT:
// no stack trace captured, cheaper to throw`],
        [`<p>Scenario: a shop API. Domain exceptions (not found, out of stock) are thrown by services. One advice maps them to 404 and 409 with a ProblemDetail, logs unexpected errors with a correlation id, and returns a safe 500.</p>`,
            r`@ExceptionHandler(Exception.class)
ProblemDetail unexpected(Exception e) {
    String id = UUID.randomUUID().toString();
    log.error("Unexpected error " + id, e);
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    pd.setProperty("errorId", id);
    return pd;
}

// OUTPUT:
// 500 {"title":"Internal Server Error","detail":"Something went wrong","errorId":"(varies)"}`]
    )
};
