// Spring extras, batch smvc13 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc13Extras: Record<string, Extra> = {
    'mvc-formatters': x(
        ['<b>Formatter</b>: a Spring SPI (<code>org.springframework.format.Formatter&lt;T&gt;</code>) that converts between a <code>String</code> and an object, in both directions, using the request <code>Locale</code>.',
            '<b>Built-in formatters</b> handle dates, numbers and currency through <code>@DateTimeFormat</code> and <code>@NumberFormat</code> on fields and parameters.',
            '<b>Why not only converters</b>: a converter is locale-free, while a formatter parses and prints text for humans, such as 12/05/2026 or 1,234.50.'],
        ['<b>Registration</b>: formatters are added to the <code>FormatterRegistry</code> by overriding <code>addFormatters</code> in <code>WebMvcConfigurer</code>.',
            '<b>Annotation driven</b>: <code>@DateTimeFormat(pattern = "dd/MM/yyyy")</code> works on <code>LocalDate</code>, <code>Date</code> and <code>Calendar</code> without any extra code.',
            '<b>Print side</b>: formatters also render values in views, for example the Thymeleaf double-brace syntax or the JSP <code>spring:eval</code> tag.'],
        ['<b>ConversionService</b>: Spring MVC uses <code>FormattingConversionService</code>, which holds both converters and formatters behind one API.',
            '<b>Boot defaults</b>: the <code>spring.mvc.format.date</code> property sets a global date pattern, so you avoid repeating annotations.',
            '<b>Scope</b>: formatters apply to request parameters, path variables and form binding, but not to JSON bodies, which Jackson handles.'],
        [['F', 'What does a Formatter do?', 'It parses a String into an object and prints an object as a String, using a Locale.'],
            ['F', 'Which annotation formats a date field?', '@DateTimeFormat, for example with a pattern or an ISO constant.'],
            ['M', 'Difference between Converter and Formatter?', 'A Converter maps any source type to a target type without locale; a Formatter is String-to-object only and locale aware.'],
            ['M', 'Where do you register a custom formatter?', 'In WebMvcConfigurer.addFormatters through the FormatterRegistry.'],
            ['S', 'Do formatters affect JSON request bodies?', 'No. Bodies use HttpMessageConverters and Jackson, so use @JsonFormat there.'],
            ['S', 'What class backs the ConversionService in MVC?', 'DefaultFormattingConversionService (a FormattingConversionService) built by WebMvcConfigurationSupport.']],
        [['Format a date request parameter.',
            r`@GetMapping("/report")
public String report(@RequestParam
        @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate from) {
    return "From " + from;
}

// GET /report?from=05/03/2026
// OUTPUT:
// From 2026-03-05`],
            ['Format a number field.',
                r`public class Invoice {
    @NumberFormat(pattern = "#,##0.00")
    private BigDecimal amount;
    // getters and setters
}
// POST amount=1,234.50 binds to BigDecimal 1234.50

// OUTPUT:
// amount = 1234.50`]],
        [['Global date format in Boot.',
            r`# application.properties
spring.mvc.format.date=dd/MM/yyyy
spring.mvc.format.date-time=dd/MM/yyyy HH:mm

# OUTPUT:
# every LocalDate parameter now accepts 05/03/2026 without annotations`],
            ['Test the binding with MockMvc.',
                r`mockMvc.perform(get("/report").param("from", "05/03/2026"))
        .andExpect(status().isOk())
        .andExpect(content().string("From 2026-03-05"));

// OUTPUT:
// Test passed (status 200, body From 2026-03-05)`]]),

    'mvc-custom-formatter': x(
        ['<b>Custom Formatter</b>: your own class implementing <code>Formatter&lt;T&gt;</code> with two methods, <code>parse(String, Locale)</code> and <code>print(T, Locale)</code>.',
            '<b>Use it</b> when a value has a human text form that built-in formatters do not know, such as a phone number, a money amount with currency or a product code.',
            '<b>Register it</b> in <code>WebMvcConfigurer.addFormatters</code>; after that the type binds automatically from text.'],
        ['<b>Throw ParseException</b> from <code>parse</code> for bad input; Spring turns it into a binding error (typeMismatch) instead of a 500.',
            '<b>Annotation based</b>: implement <code>AnnotationFormatterFactory</code> to create <code>@PhoneNumber</code>-style annotations that carry options.',
            '<b>Be stateless</b>: a formatter is a shared singleton, so keep no per-request fields and do not use non thread safe classes like <code>SimpleDateFormat</code>.'],
        ['<b>Round trip</b>: <code>print(parse(s))</code> should equal <code>s</code>; test that property because forms re-display values.',
            '<b>Component scanning</b>: in Spring Boot a <code>Formatter</code> bean is auto registered, no configurer needed.',
            '<b>Locale</b>: use the passed Locale, never the JVM default, or users in other countries see wrong output.'],
        [['F', 'Which methods does Formatter define?', 'parse(String, Locale) and print(T, Locale) (through the Parser and Printer interfaces).'],
            ['F', 'How do you register one?', 'Override addFormatters in WebMvcConfigurer and call registry.addFormatter.'],
            ['M', 'What happens if parse throws ParseException?', 'Spring records a typeMismatch field error on the BindingResult.'],
            ['M', 'How does Boot register a Formatter?', 'Any Formatter or Converter bean in the context is added to the conversion service automatically.'],
            ['S', 'When use AnnotationFormatterFactory?', 'When the format depends on annotation attributes, as @DateTimeFormat does.'],
            ['S', 'Why must formatters be thread safe?', 'One instance serves all requests, so shared mutable state causes races.']],
        [['A formatter for Money like 12.50 USD.',
            r`public class MoneyFormatter implements Formatter<Money> {
    @Override
    public Money parse(String text, Locale locale) throws ParseException {
        String[] p = text.trim().split("\\s+");
        if (p.length != 2) throw new ParseException(text, 0);
        return new Money(new BigDecimal(p[0]), Currency.getInstance(p[1]));
    }
    @Override
    public String print(Money m, Locale locale) {
        return m.amount() + " " + m.currency().getCurrencyCode();
    }
}

// OUTPUT:
// parse("12.50 USD") -> Money[12.50, USD]; print -> 12.50 USD`],
            ['Register it.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addFormatter(new MoneyFormatter());
    }
}

// OUTPUT:
// @RequestParam Money price now binds from price=12.50+USD`]],
        [['Controller using the formatter.',
            r`@GetMapping("/price")
public String price(@RequestParam Money price) {
    return "Total: " + price.amount();
}

// GET /price?price=12.50 USD
// OUTPUT:
// Total: 12.50`],
            ['Bad input handled.',
                r`// GET /price?price=abc
// Spring: MethodArgumentTypeMismatchException
// (ParseException wrapped as a conversion failure)

// OUTPUT:
// HTTP 400 Bad Request`]]),

    'mvc-custom-converter': x(
        ['<b>Converter</b>: an interface <code>Converter&lt;S, T&gt;</code> with one method <code>T convert(S source)</code> that turns a source type into a target type.',
            '<b>Use it</b> to bind simple request text, such as an id or a code, to a domain object like <code>Country</code> or an enum with a custom spelling.',
            '<b>Register</b> with <code>registry.addConverter</code> in <code>WebMvcConfigurer</code>, or expose it as a Spring Boot bean.'],
        ['<b>Not locale aware</b>: a converter has no Locale, so choose Formatter for user facing text and Converter for technical conversions.',
            '<b>ConverterFactory</b> converts to a family of types (one factory for all enums of a base type); <code>GenericConverter</code> handles collections and several pairs.',
            '<b>Null and empty</b>: decide what an empty string means; return <code>null</code> deliberately and never throw for empty input unless required.'],
        ['<b>Lookup</b>: <code>GenericConversionService</code> searches converters by source and target type hierarchy, so the most specific match wins.',
            '<b>Lambda trap</b>: <code>addConverter(s -&gt; ...)</code> loses generic types, so use an anonymous class or a named class.',
            '<b>Failure</b>: an exception inside <code>convert</code> becomes a <code>ConversionFailedException</code> and finally HTTP 400 or a binding error.'],
        [['F', 'What does Converter do?', 'It converts an object of type S to type T through convert(S).'],
            ['F', 'How do you make Spring use your converter?', 'Register it with FormatterRegistry or define it as a bean in Spring Boot.'],
            ['M', 'Converter versus Formatter?', 'Converter is type to type with no locale; Formatter is String to type with locale.'],
            ['M', 'Why avoid a lambda for addConverter?', 'Erasure removes the generic types, so Spring cannot tell which types it converts.'],
            ['S', 'What is a ConverterFactory?', 'A factory returning a Converter for each subtype of a target base type, used for enum families.'],
            ['S', 'Which converter is chosen when several match?', 'The most specific by class hierarchy of source and target types.']],
        [['String id to Country.',
            r`@Component
public class StringToCountryConverter
        implements Converter<String, Country> {
    private final CountryRepository repo;
    public StringToCountryConverter(CountryRepository repo) {
        this.repo = repo;
    }
    @Override
    public Country convert(String code) {
        return repo.findByCode(code.toUpperCase()).orElse(null);
    }
}

// OUTPUT:
// convert("in") -> Country[IN, India]`],
            ['Use it as a parameter.',
                r`@GetMapping("/countries/{code}")
public String show(@PathVariable Country code) {
    return code.name();
}

// GET /countries/in
// OUTPUT:
// India`]],
        [['Register in plain Spring MVC.',
            r`@Override
public void addFormatters(FormatterRegistry registry) {
    registry.addConverter(new StringToCountryConverter(repo));
}

// OUTPUT:
// Converter added to the FormattingConversionService`],
            ['Unit test the converter.',
                r`@Test
void convertsCode() {
    var c = new StringToCountryConverter(repoWith("IN", "India"));
    assertEquals("India", c.convert("in").name());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),

    'mvc-type-conversion': x(
        ['<b>Type conversion</b> turns request text (always String) into method parameter types such as <code>int</code>, <code>LocalDate</code>, enums or your own classes.',
            '<b>Who does it</b>: <code>WebDataBinder</code> uses the <code>ConversionService</code> first, then falls back to <code>PropertyEditor</code> instances.',
            '<b>Failure</b> gives a <code>MethodArgumentTypeMismatchException</code> (HTTP 400) for parameters or a <code>typeMismatch</code> field error for form objects.'],
        ['<b>Order</b>: custom editors from <code>@InitBinder</code>, then the ConversionService, then default editors for primitives, arrays and collections.',
            '<b>@InitBinder</b> customizes one controller: <code>binder.registerCustomEditor</code> or <code>binder.addCustomFormatter</code>.',
            '<b>Collections</b>: <code>a=1,2,3</code> converts to <code>List&lt;Integer&gt;</code> through the built-in String to Collection converter.'],
        ['<b>Enum binding</b> is case sensitive by default; add a converter to accept lower case values.',
            '<b>Exception path</b>: <code>TypeMismatchException</code> is mapped to 400 by <code>DefaultHandlerExceptionResolver</code>.',
            '<b>Prefer ConversionService</b>: it is thread safe and shared, while <code>PropertyEditor</code> is stateful and created per binder.'],
        [['F', 'Why is conversion needed in MVC?', 'HTTP parameters are Strings, while handler methods use typed arguments.'],
            ['F', 'What happens when conversion fails?', 'A 400 error for request parameters, or a typeMismatch field error for model attributes.'],
            ['M', 'What does @InitBinder do?', 'It customizes the WebDataBinder for a controller, for example registering editors or formatters.'],
            ['M', 'ConversionService or PropertyEditor?', 'ConversionService is preferred: stateless, thread safe and type to type.'],
            ['S', 'In what order are binding conversions tried?', 'Custom editors, then the ConversionService, then default PropertyEditors.'],
            ['S', 'Does type conversion apply to @RequestBody?', 'No. HttpMessageConverters such as Jackson do that work.']],
        [['Built-in conversions.',
            r`@GetMapping("/calc")
public int add(@RequestParam int a, @RequestParam int b,
               @RequestParam List<Integer> extra) {
    return a + b + extra.stream().mapToInt(i -> i).sum();
}

// GET /calc?a=1&b=2&extra=3,4
// OUTPUT:
// 10`],
            ['Failed conversion.',
                r`// GET /calc?a=one&b=2&extra=1
// Failed to convert value of type String to required type int

// OUTPUT:
// HTTP/1.1 400 Bad Request`]],
        [['Controller-local trimming with @InitBinder.',
            r`@InitBinder
public void init(WebDataBinder binder) {
    binder.registerCustomEditor(String.class,
            new StringTrimmerEditor(true));   // blank becomes null
}

// OUTPUT:
// name="  " is bound as null`],
            ['Test a mismatch.',
                r`mockMvc.perform(get("/calc").param("a", "x")
        .param("b", "1").param("extra", "1"))
        .andExpect(status().isBadRequest());

// OUTPUT:
// Test passed (400)`]]),

    'mvc-spring-validation': x(
        ['<b>Spring Validation</b> checks incoming data before business logic runs, using the <code>Validator</code> interface or Bean Validation annotations.',
            '<b>Two styles</b>: implement <code>org.springframework.validation.Validator</code> by hand, or annotate fields with <code>@NotBlank</code>, <code>@Size</code> and trigger with <code>@Valid</code>.',
            '<b>Results</b> are stored in an <code>Errors</code> / <code>BindingResult</code> object, which the view uses to show messages next to fields.'],
        ['<b>Validator contract</b>: <code>supports(Class)</code> says which types it handles and <code>validate(Object, Errors)</code> records problems.',
            '<b>ValidationUtils</b> has helpers like <code>rejectIfEmptyOrWhitespace</code> to keep manual validators short.',
            '<b>Messages</b> come from a <code>MessageSource</code> by error code such as <code>NotBlank.user.name</code>, which allows internationalization.'],
        ['<b>Boot</b> auto configures a <code>LocalValidatorFactoryBean</code> when a Bean Validation provider (Hibernate Validator) is on the classpath.',
            '<b>Combine both</b>: <code>binder.addValidators(new MyValidator())</code> in <code>@InitBinder</code> runs your code together with annotations.',
            '<b>Layering</b>: validate shape in the web layer, and enforce business rules (uniqueness) in the service and the database.'],
        [['F', 'Why validate input?', 'To reject bad data early and protect business logic and the database.'],
            ['F', 'Which interface does a manual validator implement?', 'org.springframework.validation.Validator.'],
            ['M', 'What do supports and validate do?', 'supports tells if the validator handles a class; validate records errors on the Errors object.'],
            ['M', 'How do you add a custom validator to a controller?', 'Call binder.addValidators in an @InitBinder method.'],
            ['S', 'Where do error messages come from?', 'A MessageSource, keyed by codes like Code.object.field, Code.field, Code.type, Code.'],
            ['S', 'Why not rely only on controller validation?', 'Other entry points and concurrent requests bypass it; uniqueness needs a database constraint.']],
        [['Manual validator.',
            r`@Component
public class UserValidator implements Validator {
    public boolean supports(Class<?> c) { return User.class.equals(c); }
    public void validate(Object target, Errors errors) {
        ValidationUtils.rejectIfEmptyOrWhitespace(
                errors, "name", "name.required", "Name is required");
        User u = (User) target;
        if (u.getAge() < 18) errors.rejectValue("age", "age.min");
    }
}

// OUTPUT:
// name="" age=10 -> 2 field errors`],
            ['Annotation style.',
                r`public class User {
    @NotBlank private String name;
    @Min(18) private int age;
}
@PostMapping("/users")
public String save(@Valid @ModelAttribute User user, BindingResult br) {
    return br.hasErrors() ? "form" : "redirect:/users";
}

// OUTPUT:
// invalid input -> view form with errors`]],
        [['Attach a validator to a controller.',
            r`@InitBinder
public void init(WebDataBinder binder) {
    binder.addValidators(userValidator);
}

// OUTPUT:
// userValidator runs on every @Valid User in this controller`],
            ['Test with MockMvc.',
                r`mockMvc.perform(post("/users").param("name", "").param("age", "10"))
        .andExpect(model().attributeHasFieldErrors("user", "name", "age"))
        .andExpect(view().name("form"));

// OUTPUT:
// Test passed`]]),

    'mvc-bean-validation': x(
        ['<b>Bean Validation</b> is the standard (JSR 380 / Jakarta Validation) for declaring constraints as annotations on fields, getters and parameters.',
            '<b>Common constraints</b>: <code>@NotNull</code>, <code>@NotBlank</code>, <code>@Size</code>, <code>@Min</code>, <code>@Max</code>, <code>@Email</code>, <code>@Pattern</code>.',
            '<b>Implementation</b>: the spec is only an API; <b>Hibernate Validator</b> is the reference provider that Spring Boot pulls in with <code>spring-boot-starter-validation</code>.'],
        ['<b>Differences</b>: <code>@NotNull</code> rejects null only, <code>@NotEmpty</code> also empty, <code>@NotBlank</code> also whitespace only (Strings).',
            '<b>Custom constraint</b>: define an annotation with <code>@Constraint(validatedBy = ...)</code> and a class implementing <code>ConstraintValidator</code>.',
            '<b>Nested objects</b>: put <code>@Valid</code> on the field to cascade into the inner object or each element of a collection.'],
        ['<b>Groups</b> let one class have different rules for create and update, selected with <code>@Validated(Create.class)</code>.',
            '<b>Messages</b>: set <code>message</code> on each constraint or use <code>ValidationMessages.properties</code> and Spring MessageSource.',
            '<b>Starter</b>: since Spring Boot 2.3 the validation starter is no longer inside the web starter, so add it explicitly.'],
        [['F', 'What is Bean Validation?', 'A standard way to declare validation rules with annotations such as @NotNull and @Size.'],
            ['F', 'Which Boot starter adds it?', 'spring-boot-starter-validation.'],
            ['M', 'NotNull, NotEmpty, NotBlank?', 'NotNull: not null; NotEmpty: also not empty; NotBlank: also contains a non whitespace character.'],
            ['M', 'How do you validate a nested object?', 'Annotate the nested field with @Valid so validation cascades.'],
            ['S', 'How do you write a custom constraint?', 'Create an annotation with @Constraint and a ConstraintValidator implementation.'],
            ['S', 'What is a validation group?', 'A marker interface that selects a subset of constraints, activated with @Validated.']],
        [['Annotated DTO.',
            r`public record SignupForm(
        @NotBlank @Size(max = 40) String name,
        @Email String email,
        @Min(18) @Max(120) int age,
        @Pattern(regexp = "[0-9]{10}") String phone) { }

// OUTPUT:
// constraints declared on record components`],
            ['Custom constraint.',
                r`@Target(FIELD) @Retention(RUNTIME)
@Constraint(validatedBy = EvenValidator.class)
public @interface Even { String message() default "must be even";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    }

public class EvenValidator implements ConstraintValidator<Even, Integer> {
    public boolean isValid(Integer v, ConstraintValidatorContext c) {
        return v == null || v % 2 == 0;
    }
}

// OUTPUT:
// @Even on 3 -> "must be even"`]],
        [['Validate programmatically.',
            r`Validator v = Validation.buildDefaultValidatorFactory().getValidator();
Set<ConstraintViolation<SignupForm>> errs =
        v.validate(new SignupForm("", "bad", 10, "12"));
errs.forEach(e -> System.out.println(e.getPropertyPath() + " " + e.getMessage()));

// OUTPUT: (order varies)
// name must not be blank
// email must be a well-formed email address
// age must be greater than or equal to 18
// phone must match "[0-9]{10}"`],
            ['Cascade with @Valid.',
                r`public class Order {
    @Valid @NotNull private Address address;
    private List<@Valid Item> items;
}

// OUTPUT:
// address.city must not be blank   (path shows the nesting)`]]),

    'mvc-jakarta-validation': x(
        ['<b>Jakarta Validation</b> is the same Bean Validation API after its move from <code>javax.validation</code> to the <code>jakarta.validation</code> packages (Jakarta EE 9+).',
            '<b>Spring Boot 3 and Framework 6</b> require the Jakarta names, so imports use <code>jakarta.validation.constraints.*</code>.',
            '<b>Same annotations</b>: <code>@NotNull</code>, <code>@Size</code>, <code>@Valid</code> behave as before; only the package prefix changed.'],
        ['<b>Migration</b>: replace <code>javax.validation</code> with <code>jakarta.validation</code> in imports; Boot 3 projects will not compile with the old names.',
            '<b>Provider</b>: use Hibernate Validator 8 (Jakarta Validation 3.0) with Boot 3; Hibernate Validator 6 and 7 are for older stacks.',
            '<b>Mixed classpath</b>: an old library with <code>javax</code> annotations is silently ignored, so constraints seem to do nothing.'],
        ['<b>Expression Language</b>: Hibernate Validator needs an EL implementation (Boot starter includes Tomcat Embed EL) for message interpolation.',
            '<b>Tooling</b>: OpenRewrite and the Spring Boot Migrator automate the javax to jakarta rename.',
            '<b>Spring type</b>: <code>@Validated</code> is Spring specific and stays in <code>org.springframework.validation.annotation</code>.'],
        [['F', 'What changed from javax to jakarta validation?', 'Only the package names; the constraints work the same.'],
            ['F', 'Which package holds @NotNull in Boot 3?', 'jakarta.validation.constraints.'],
            ['M', 'Why do old javax constraints do nothing in Boot 3?', 'The Jakarta provider does not scan javax annotations, so they are ignored.'],
            ['M', 'Which Hibernate Validator goes with Boot 3?', 'The 8.x line, which implements Jakarta Validation 3.0.'],
            ['S', 'Why is an EL implementation required?', 'Message templates with expressions are evaluated by Jakarta Expression Language.'],
            ['S', 'Is @Validated in the jakarta package?', 'No, it is a Spring annotation in org.springframework.validation.annotation.']],
        [['Boot 3 imports.',
            r`import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record Contact(@NotBlank String name, @Email String email) { }

// OUTPUT:
// compiles on Spring Boot 3 / Jakarta EE 9+`],
            ['Maven dependency.',
                r`<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- OUTPUT -->
<!-- adds hibernate-validator and the jakarta.validation API -->`]],
        [['Detect the wrong import.',
            r`// import javax.validation.constraints.NotBlank;   // Boot 2 name
import jakarta.validation.constraints.NotBlank;       // Boot 3 name

// OUTPUT:
// With javax imports on Boot 3: "package javax.validation does not exist"
// or (jar still present) constraints are never enforced`],
            ['Verify it works.',
                r`@WebMvcTest(ContactController.class)
class ContactControllerTest {
    @Autowired MockMvc mvc;
    @Test void blankNameRejected() throws Exception {
        mvc.perform(post("/contacts").contentType("application/json")
                .content("{\"name\":\"\",\"email\":\"a@b.com\"}"))
           .andExpect(status().isBadRequest());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]),

    'mvc-valid': x(
        ['<b>@Valid</b> (<code>jakarta.validation.Valid</code>) tells Spring to run Bean Validation on a method argument, such as a form object or a <code>@RequestBody</code>.',
            '<b>Failure</b>: with <code>@RequestBody</code> it throws <code>MethodArgumentNotValidException</code> (400); with <code>@ModelAttribute</code> and a following <code>BindingResult</code> you handle errors yourself.',
            '<b>Cascade</b>: placed on a field, it validates the nested object or the elements of a collection too.'],
        ['<b>Placement rule</b>: the <code>BindingResult</code> parameter must come immediately after the validated argument.',
            '<b>No groups</b>: <code>@Valid</code> cannot select groups; use <code>@Validated</code> for that.',
            '<b>Bad request body</b>: the response comes from <code>DefaultHandlerExceptionResolver</code>, or from your <code>@ExceptionHandler</code> returning field messages as JSON.'],
        ['<b>Mechanism</b>: <code>RequestResponseBodyMethodProcessor</code> and <code>ModelAttributeMethodProcessor</code> call <code>WebDataBinder.validate()</code> when they see the annotation.',
            '<b>Order</b>: binding and conversion run first; validation runs only on the bound object.',
            '<b>Not for simple params</b>: <code>@Valid</code> on <code>@RequestParam</code> does nothing; put <code>@Validated</code> on the class instead.'],
        [['F', 'What does @Valid do?', 'It triggers Bean Validation for the annotated argument or field.'],
            ['F', 'Which exception is thrown for an invalid @RequestBody?', 'MethodArgumentNotValidException, giving HTTP 400.'],
            ['M', 'Where must BindingResult be placed?', 'Directly after the @Valid argument in the parameter list.'],
            ['M', 'Does @Valid support groups?', 'No. Use Spring @Validated with a group class.'],
            ['S', 'How does @Valid cascade?', 'Annotate a nested field or a collection element type with @Valid and validation recurses.'],
            ['S', 'Which Spring component performs validation for @RequestBody?', 'RequestResponseBodyMethodProcessor, through its WebDataBinder.']],
        [['Validate a JSON body.',
            r`@PostMapping("/users")
public ResponseEntity<User> create(@Valid @RequestBody UserDto dto) {
    return ResponseEntity.status(201).body(service.save(dto));
}

// POST {"name":""}
// OUTPUT:
// HTTP/1.1 400 Bad Request
// MethodArgumentNotValidException: field 'name' must not be blank`],
            ['Form with BindingResult.',
                r`@PostMapping("/register")
public String register(@Valid @ModelAttribute("form") RegisterForm form,
                       BindingResult result) {
    if (result.hasErrors()) return "register";
    service.register(form);
    return "redirect:/login";
}

// OUTPUT:
// errors -> view register; success -> redirect:/login`]],
        [['Return field errors as JSON.',
            r`@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> m = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(f -> m.put(f.getField(), f.getDefaultMessage()));
        return m;
    }
}

// OUTPUT:
// {"name":"must not be blank","email":"must be a well-formed email address"}`],
            ['MockMvc test.',
                r`mockMvc.perform(post("/users").contentType(APPLICATION_JSON)
        .content("{\"name\":\"\"}"))
        .andExpect(status().isBadRequest());

// OUTPUT:
// Test passed`]]),

    'mvc-validated': x(
        ['<b>@Validated</b> (<code>org.springframework.validation.annotation.Validated</code>) is Spring own variant of <code>@Valid</code> that also supports <b>validation groups</b>.',
            '<b>On a class</b>, it enables method validation, so constraints on <code>@RequestParam</code>, <code>@PathVariable</code> and service arguments are checked.',
            '<b>Failure</b> on method parameters throws <code>ConstraintViolationException</code> (not a binding error), which you map to 400 yourself.'],
        ['<b>Groups</b>: <code>@Validated(OnCreate.class)</code> on a parameter checks only constraints with that group.',
            '<b>Simple params</b>: <code>@Validated</code> on the controller plus <code>@Min(1)</code> on <code>@PathVariable long id</code> validates path values.',
            '<b>Service layer</b>: put <code>@Validated</code> on a bean class and constraints on its method arguments to validate non web calls.'],
        ['<b>Mechanism</b>: <code>MethodValidationPostProcessor</code> wraps the bean in an AOP proxy with <code>MethodValidationInterceptor</code>.',
            '<b>Proxy limits</b>: self invocation and <code>private</code> or <code>final</code> methods skip validation.',
            '<b>Spring 6.1</b>: built-in method validation for controllers can raise <code>HandlerMethodValidationException</code> instead; check your version before writing handlers.'],
        [['F', 'How does @Validated differ from @Valid?', 'It supports validation groups and works at class level for method validation.'],
            ['F', 'Which exception do method level violations throw?', 'ConstraintViolationException.'],
            ['M', 'How do you validate a @PathVariable?', 'Add @Validated to the class and a constraint such as @Min(1) on the variable.'],
            ['M', 'How do you use groups?', 'Define marker interfaces, tag constraints with groups, then use @Validated(Group.class).'],
            ['S', 'Why might @Validated not work on a service?', 'Calls inside the same class bypass the proxy, and the bean must be proxied.'],
            ['S', 'What registers the interceptor?', 'MethodValidationPostProcessor, auto configured by Spring Boot validation.']],
        [['Groups for create and update.',
            r`public interface OnCreate { }
public interface OnUpdate { }

public class ProductDto {
    @Null(groups = OnCreate.class)  private Long id;
    @NotNull(groups = OnUpdate.class) private Long version;
    @NotBlank private String name;   // default group
}

@PostMapping
public Product create(@Validated(OnCreate.class) @RequestBody ProductDto d) {
    return service.create(d);
}

// OUTPUT:
// create with id=5 -> 400 (id must be null)`],
            ['Validate path and query values.',
                r`@RestController
@Validated
public class ItemController {
    @GetMapping("/items/{id}")
    public String item(@PathVariable @Min(1) long id,
                       @RequestParam @Size(max = 10) String q) {
        return "item " + id;
    }
}

// GET /items/0
// OUTPUT:
// ConstraintViolationException: item.id must be greater than or equal to 1`]],
        [['Map the exception to 400.',
            r`@ExceptionHandler(ConstraintViolationException.class)
@ResponseStatus(HttpStatus.BAD_REQUEST)
public String bad(ConstraintViolationException ex) {
    return ex.getConstraintViolations().iterator().next().getMessage();
}

// OUTPUT:
// HTTP 400  body: must be greater than or equal to 1`],
            ['Service level validation.',
                r`@Service
@Validated
public class Mailer {
    public void send(@Email String to, @NotBlank String body) { }
}
// mailer.send("bad", "") throws ConstraintViolationException

// OUTPUT:
// send.to must be a well-formed email address; send.body must not be blank (order varies)`]]),

    'mvc-bindingresult-validation': x(
        ['<b>BindingResult</b> holds the outcome of data binding and validation for one model object: field errors, global errors and the rejected values.',
            '<b>Position</b>: it must be declared right after the <code>@Valid</code> or <code>@ModelAttribute</code> parameter, or Spring throws an exception instead of filling it.',
            '<b>Use</b>: check <code>result.hasErrors()</code> and redisplay the form; the view reads the errors, for example with <code>th:errors</code> or <code>form:errors</code>.'],
        ['<b>Add your own error</b>: <code>result.rejectValue("email", "email.taken", "Already used")</code> for a field, <code>result.reject(...)</code> for the whole object.',
            '<b>Read errors</b>: <code>getFieldErrors()</code>, <code>getFieldError("name")</code> and <code>getAllErrors()</code>.',
            '<b>Rejected value</b> is kept (<code>getRejectedValue</code>), so the form can show what the user typed, even when conversion failed.'],
        ['<b>Model key</b>: the result is stored in the model as <code>org.springframework.validation.BindingResult.&lt;name&gt;</code> and shares the object with the same attribute name.',
            '<b>Redirect pitfall</b>: errors are lost on redirect; use forward (return the view) or flash attributes for the result.',
            '<b>REST</b>: for <code>@RequestBody</code> a BindingResult parameter suppresses the exception, so you must return the 400 yourself.'],
        [['F', 'What is BindingResult?', 'An object that collects binding and validation errors for a model attribute.'],
            ['F', 'Where is it declared?', 'Immediately after the validated parameter.'],
            ['M', 'How do you add a custom error?', 'Call rejectValue for a field or reject for a global error.'],
            ['M', 'What if BindingResult is missing?', 'Spring throws MethodArgumentNotValidException (or BindException for form objects) on errors.'],
            ['S', 'Why are errors lost after a redirect?', 'The redirect starts a new request and the model with its BindingResult is gone; use flash attributes or return the view.'],
            ['S', 'Difference between BindingResult and Errors?', 'BindingResult extends Errors with extras such as getModel and rejected values access; in controllers they are interchangeable.']],
        [['Basic pattern.',
            r`@PostMapping("/signup")
public String signup(@Valid @ModelAttribute("user") UserForm user,
                     BindingResult result) {
    if (userRepo.existsByEmail(user.getEmail())) {
        result.rejectValue("email", "email.taken", "Email already used");
    }
    if (result.hasErrors()) return "signup";
    userRepo.save(user.toEntity());
    return "redirect:/welcome";
}

// OUTPUT:
// duplicate email -> view signup with error "Email already used"`],
            ['Show errors in Thymeleaf.',
                r`<input type="text" th:field="*{email}">
<span th:if="$` + r`{#fields.hasErrors('email')}
" th:errors="*{email}
">error</span>

<!-- OUTPUT -->
<!-- <span>Email already used</span> -->`]],
        [['REST controller with BindingResult.',
            r`@PostMapping("/api/users")
public ResponseEntity<?> create(@Valid @RequestBody UserDto dto,
                                BindingResult br) {
    if (br.hasErrors()) {
        var errs = br.getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField,
                     FieldError::getDefaultMessage, (a, b) -> a));
        return ResponseEntity.badRequest().body(errs);
    }
    return ResponseEntity.status(201).body(service.save(dto));
}

// OUTPUT:
// 400 {"name":"must not be blank"}`],
            ['Test error attributes.',
                r`mockMvc.perform(post("/signup").param("email", "bad"))
        .andExpect(model().attributeHasFieldErrorCode("user", "email", "Email"))
        .andExpect(view().name("signup"));

// OUTPUT:
// Test passed`]]),
};

export const smvc13Deep: Record<string, Deep> = {
    'mvc-formatters': dv(
        [`<ul>
<li>Spring MVC builds a <b>FormattingConversionService</b> that holds converters and formatters.</li>
<li>Each <b>Formatter</b> is wrapped by an adapter so it appears as String to T and T to String converters.</li>
<li>During binding, <code>WebDataBinder</code> asks the service to convert the request String to the target type.</li>
<li>Annotations such as <code>@DateTimeFormat</code> are found through <code>AnnotationFormatterFactory</code> beans (JSR-310 and Joda factories).</li>
</ul>`, r`// Simplified view of what the binder does
ConversionService cs = binder.getConversionService();
TypeDescriptor target = new TypeDescriptor(field);  // keeps annotations
LocalDate d = (LocalDate) cs.convert("05/03/2026",
        TypeDescriptor.valueOf(String.class), target);

// OUTPUT:
// 2026-03-05  (the annotation pattern came from the field TypeDescriptor)`],
        [`<ul>
<li><code>@DateTimeFormat(iso = ISO.DATE)</code> uses the ISO form 2026-03-05.</li>
<li><code>@DateTimeFormat(style = "S-")</code> uses the locale short date style.</li>
<li><code>@NumberFormat(style = Style.CURRENCY)</code> or <code>Style.PERCENT</code> for money and percent.</li>
<li>Boot properties <code>spring.mvc.format.date</code>, <code>time</code> and <code>date-time</code> set global patterns.</li>
</ul>`, r`public class Offer {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start;
    @DateTimeFormat(pattern = "HH:mm")            LocalTime opens;
    @NumberFormat(style = NumberFormat.Style.PERCENT) Double discount;
}

// OUTPUT:
// start=2026-03-05  opens=09:30  discount=15%  -> 0.15`],
        [`<ul>
<li><b>Using formatters on JSON</b>: they are ignored; use <code>@JsonFormat</code> or Jackson modules.</li>
<li><b>No pattern given</b>: a LocalDate parameter then needs the locale default style and often fails with 400.</li>
<li><b>Wrong pattern case</b>: <code>MM</code> is month, <code>mm</code> is minutes.</li>
</ul>`, r`// WRONG: minutes instead of month
@DateTimeFormat(pattern = "dd/mm/yyyy") LocalDate d;   // fails to parse
// RIGHT
@DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate d;

// OUTPUT:
// WRONG: Failed to convert String to LocalDate (Text could not be parsed)
// RIGHT: 2026-03-05`],
        [`<ul>
<li>Formatters are singletons; avoid creating <code>DateTimeFormatter</code> per call, since it is immutable and can be cached.</li>
<li>Do not use <code>SimpleDateFormat</code> in a shared formatter, because it is not thread safe.</li>
<li>Heavy parsing inside a formatter (database lookups) should move to a converter plus caching.</li>
</ul>`, r`public class DayFormatter implements Formatter<LocalDate> {
    private static final DateTimeFormatter F =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");   // thread safe, cached
    public LocalDate parse(String t, Locale l) { return LocalDate.parse(t, F); }
    public String print(LocalDate d, Locale l) { return F.format(d); }
}

// OUTPUT:
// no per-request allocation of the formatter`],
        [`<ul>
<li>A booking form accepts dd/MM/yyyy dates from users in India and shows them back in the same style.</li>
<li>One global property sets the format, so no field needs an annotation.</li>
<li>The REST API uses ISO dates through Jackson for machine clients.</li>
</ul>`, r`# application.properties
spring.mvc.format.date=dd/MM/yyyy

@PostMapping("/book")
public String book(@ModelAttribute Booking b) { return "ok " + b.getDate(); }

# OUTPUT:
# POST date=05/03/2026 -> ok 2026-03-05`]),

    'mvc-custom-formatter': dv(
        [`<ul>
<li>Registry call <code>addFormatter(f)</code> reads the generic type T of the formatter and registers a Printer and a Parser for it.</li>
<li>On binding, the parser is invoked with the String and the current <code>Locale</code> from <code>LocaleContextHolder</code>.</li>
<li>A <code>ParseException</code> or <code>IllegalArgumentException</code> becomes a conversion failure.</li>
<li>The printer runs when a view renders the value through the conversion service.</li>
</ul>`, r`public class PhoneFormatter implements Formatter<Phone> {
    public Phone parse(String t, Locale l) throws ParseException {
        String digits = t.replaceAll("\\D", "");
        if (digits.length() != 10) throw new ParseException(t, 0);
        return new Phone(digits);
    }
    public String print(Phone p, Locale l) {
        String d = p.digits();
        return d.substring(0, 3) + "-" + d.substring(3, 6) + "-" + d.substring(6);
    }
}

// OUTPUT:
// parse("(987) 654-3210") -> Phone[9876543210]; print -> 987-654-3210`],
        [`<ul>
<li><b>Plain Formatter</b> bean in Boot or <code>addFormatter</code> in a configurer.</li>
<li><b>addFormatterForFieldType(Class, Printer, Parser)</b> for separate print and parse logic.</li>
<li><b>AnnotationFormatterFactory</b> for options such as <code>@Phone(region = "IN")</code>.</li>
</ul>`, r`public class PhoneAnnotationFactory
        implements AnnotationFormatterFactory<PhoneFormat> {
    public Set<Class<?>> getFieldTypes() { return Set.of(Phone.class); }
    public Printer<Phone> getPrinter(PhoneFormat a, Class<?> t) {
        return new PhoneFormatter(a.region());
    }
    public Parser<Phone> getParser(PhoneFormat a, Class<?> t) {
        return new PhoneFormatter(a.region());
    }
}
// registry.addFormatterForFieldAnnotation(new PhoneAnnotationFactory());

// OUTPUT:
// @PhoneFormat(region = "IN") field uses the IN rules`],
        [`<ul>
<li><b>Returning null on bad input</b> hides errors; throw ParseException.</li>
<li><b>Using the default locale</b> instead of the argument.</li>
<li><b>Forgetting to register</b>: the binding then fails with no converter found.</li>
</ul>`, r`// WRONG
public Phone parse(String t, Locale l) {
    return t.isBlank() ? null : new Phone(t);   // accepts garbage
}
// RIGHT: validate and throw
public Phone parse(String t, Locale l) throws ParseException {
    if (!t.matches("\\d{10}")) throw new ParseException(t, 0);
    return new Phone(t);
}

// OUTPUT:
// WRONG: bad value stored; RIGHT: field error typeMismatch`],
        [`<ul>
<li>Keep parsing allocation free: precompiled <code>Pattern</code> constants.</li>
<li>Do not call remote services in <code>parse</code>; it runs on the request thread for every bind.</li>
<li>Cache lookup results if you must resolve codes.</li>
</ul>`, r`public class CodeFormatter implements Formatter<Code> {
    private static final Pattern P = Pattern.compile("[A-Z]{3}-\\d{4}");
    public Code parse(String t, Locale l) throws ParseException {
        if (!P.matcher(t).matches()) throw new ParseException(t, 0);
        return new Code(t);
    }
    public String print(Code c, Locale l) { return c.value(); }
}

// OUTPUT:
// pattern compiled once at class load`],
        [`<ul>
<li>A logistics app receives shipment codes like ABC-1234 in query strings.</li>
<li>A <code>Code</code> formatter converts them once; controllers just declare a <code>Code</code> parameter.</li>
<li>Invalid codes give a clean 400 with no manual parsing in controllers.</li>
</ul>`, r`@GetMapping("/track")
public String track(@RequestParam Code code) {
    return "Tracking " + code.value();
}

// GET /track?code=ABC-1234  -> Tracking ABC-1234
// GET /track?code=oops      -> 400 Bad Request
// OUTPUT:
// Tracking ABC-1234`]),

    'mvc-custom-converter': dv(
        [`<ul>
<li><code>GenericConversionService</code> stores converters in a map keyed by <code>ConvertiblePair(source, target)</code>.</li>
<li>For a request it walks the class hierarchy of source and target to find the closest match.</li>
<li>The found converter is cached per type pair for the next call.</li>
<li>A <code>Converter</code> is wrapped in <code>ConverterAdapter</code>; its generics are resolved by <code>ResolvableType</code>.</li>
</ul>`, r`GenericConversionService cs = new GenericConversionService();
cs.addConverter(new StringToCountryConverter(repo));
Country c = cs.convert("in", Country.class);
System.out.println(cs.canConvert(String.class, Country.class));

// OUTPUT:
// true   (converter found for the String -> Country pair)`],
        [`<ul>
<li><b>Converter&lt;S,T&gt;</b>: one pair.</li>
<li><b>ConverterFactory&lt;S,R&gt;</b>: all subtypes of R, for example every enum.</li>
<li><b>GenericConverter</b>: several pairs and access to field annotations through <code>TypeDescriptor</code>.</li>
<li><b>ConditionalConverter</b>: add a <code>matches</code> check.</li>
</ul>`, r`public class LenientEnumFactory
        implements ConverterFactory<String, Enum> {
    public <T extends Enum> Converter<String, T> getConverter(Class<T> type) {
        return s -> (T) Enum.valueOf(type, s.trim().toUpperCase());
    }
}
// registry.addConverterFactory(new LenientEnumFactory());

// OUTPUT:
// ?status=active binds to Status.ACTIVE`],
        [`<ul>
<li><b>Lambda registration</b> loses generics and throws an exception at startup.</li>
<li><b>Returning null</b> for unknown ids makes controllers fail later with NullPointerException.</li>
<li><b>Hitting the database</b> per element when binding a list.</li>
</ul>`, r`// WRONG: generics erased
registry.addConverter(s -> new Country(s));
// RIGHT
registry.addConverter(String.class, Country.class, s -> new Country(s));

// OUTPUT:
// WRONG: Unable to determine source type <S> and target type <T>
// RIGHT: registered`],
        [`<ul>
<li>Converters should be fast and side effect free.</li>
<li>For database lookups, cache the table or fetch ids in one query in the service.</li>
<li>Prefer binding an id and loading the entity in the service to keep transactions clear.</li>
</ul>`, r`@Component
public class CachedCountryConverter implements Converter<String, Country> {
    private final Map<String, Country> byCode;
    public CachedCountryConverter(CountryRepository repo) {
        this.byCode = repo.findAll().stream()
            .collect(Collectors.toUnmodifiableMap(Country::code, c -> c));
    }
    public Country convert(String s) { return byCode.get(s.toUpperCase()); }
}

// OUTPUT:
// one query at startup, constant time per request`],
        [`<ul>
<li>An admin screen shows countries as dropdown with code values.</li>
<li>A converter turns the posted code into a <code>Country</code> object inside the form bean.</li>
<li>Unknown codes yield a typeMismatch error rather than a null pointer.</li>
</ul>`, r`public class StringToCountryConverter implements Converter<String, Country> {
    public Country convert(String code) {
        Country c = repo.find(code);
        if (c == null) throw new IllegalArgumentException("Unknown " + code);
        return c;
    }
}

// OUTPUT:
// POST country=ZZ -> field error: Failed to convert ... Unknown ZZ`]),

    'mvc-type-conversion': dv(
        [`<ul>
<li>Argument resolvers (for example <code>RequestParamMethodArgumentResolver</code>) create a <code>WebDataBinder</code>.</li>
<li>The binder calls <code>convertIfNecessary</code> on a <code>TypeConverterDelegate</code>.</li>
<li>Order: custom PropertyEditor, ConversionService, default editors, then constructor or string based fallback.</li>
<li>Failure raises <code>TypeMismatchException</code>, wrapped into <code>MethodArgumentTypeMismatchException</code> for parameters.</li>
</ul>`, r`// What RequestParam resolution does conceptually
WebDataBinder binder = binderFactory.createBinder(request, null, "age");
Integer age = binder.convertIfNecessary("42", Integer.class, methodParam);
System.out.println(age + 1);

// OUTPUT:
// 43`],
        [`<ul>
<li>Primitives and wrappers, enums, <code>UUID</code>, <code>Locale</code>, <code>Currency</code>, <code>Optional</code> wrapping are built in.</li>
<li>Collections from comma separated Strings; arrays likewise.</li>
<li>Id to entity via <code>DomainClassConverter</code> in Spring Data web support.</li>
<li><code>@InitBinder</code> with <code>setDisallowedFields</code> or custom editors for one controller.</li>
</ul>`, r`@InitBinder("filter")
public void bind(WebDataBinder b) {
    b.addCustomFormatter(new DayFormatter(), "from", "to");
}

// OUTPUT:
// only fields from and to of model attribute filter use DayFormatter`],
        [`<ul>
<li><b>Primitive and empty value</b>: <code>int a</code> with <code>a=</code> fails; use <code>Integer</code>.</li>
<li><b>Enum case</b>: <code>?status=active</code> fails against ACTIVE.</li>
<li><b>Expecting JSON conversion</b> from the ConversionService.</li>
</ul>`, r`// WRONG: empty value cannot become int
@RequestParam int page
// RIGHT
@RequestParam(defaultValue = "1") int page

// OUTPUT:
// WRONG: GET /list?page= -> 400   RIGHT: page = 1`],
        [`<ul>
<li>Conversion is cheap, but avoid exceptions for control flow in custom converters.</li>
<li>Reuse the shared <code>ConversionService</code> bean rather than creating one per request.</li>
<li>Prefer typed parameters over parsing Strings in the controller.</li>
</ul>`, r`@Autowired ConversionService conversionService;

int toInt(String s) {
    return conversionService.convert(s, Integer.class);   // shared, thread safe
}

// OUTPUT:
// toInt("7") -> 7`],
        [`<ul>
<li>A search endpoint takes <code>ids=1,2,3</code>, a status enum and a date range.</li>
<li>All types come straight from the query string with no manual parsing.</li>
<li>Bad values give 400 and a clear message from the error handler.</li>
</ul>`, r`@GetMapping("/search")
public List<Item> search(@RequestParam List<Long> ids,
        @RequestParam Status status,
        @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate from) {
    return service.find(ids, status, from);
}

// GET /search?ids=1,2,3&status=ACTIVE&from=2026-03-05
// OUTPUT:
// [Item[1], Item[2], Item[3]]`]),

    'mvc-spring-validation': dv(
        [`<ul>
<li>Spring core defines <code>Validator</code> and <code>Errors</code>; MVC wires them through <code>WebDataBinder</code>.</li>
<li>When the binder finishes binding, <code>binder.validate()</code> calls every registered validator.</li>
<li>Boot provides <code>LocalValidatorFactoryBean</code>, an adapter that exposes Bean Validation as a Spring <code>Validator</code>.</li>
<li>Error codes are resolved by <code>DefaultMessageCodesResolver</code> into a list from most to least specific.</li>
</ul>`, r`// Message codes for field "name" of object "user", constraint NotBlank
// NotBlank.user.name
// NotBlank.name
// NotBlank.java.lang.String
// NotBlank

// OUTPUT:
// the first code found in messages.properties wins`],
        [`<ul>
<li>Manual <code>Validator</code> with <code>ValidationUtils</code>.</li>
<li>Annotation based through <code>LocalValidatorFactoryBean</code>.</li>
<li><code>SmartValidator</code> adds <code>validate(target, errors, hints...)</code> for groups.</li>
<li>Both styles can run together on one binder.</li>
</ul>`, r`@InitBinder
public void init(WebDataBinder binder) {
    if (binder.getTarget() instanceof User) {
        binder.addValidators(new UserValidator());   // adds, keeps annotations
    }
}

// OUTPUT:
// annotation errors and UserValidator errors are merged in BindingResult`],
        [`<ul>
<li><b>setValidator</b> replaces the default validator, so annotations stop working; use <code>addValidators</code>.</li>
<li><b>Missing starter</b>: no Hibernate Validator means annotations are ignored silently in some setups.</li>
<li><b>Validator supports wrong class</b> and never runs.</li>
</ul>`, r`// WRONG: drops the annotation validator
binder.setValidator(new UserValidator());
// RIGHT
binder.addValidators(new UserValidator());

// OUTPUT:
// WRONG: @NotBlank ignored   RIGHT: both validators run`],
        [`<ul>
<li>Validation is CPU cheap; cost comes from extra database checks.</li>
<li>Run expensive checks (uniqueness) only after cheap field checks pass.</li>
<li>The validator factory is created once and reused; never build it per request.</li>
</ul>`, r`if (result.hasFieldErrors()) return "form";      // cheap checks failed
if (repo.existsByEmail(form.getEmail())) {          // costly check after
    result.rejectValue("email", "email.taken");
    return "form";
}

// OUTPUT:
// database touched only when the form shape is valid`],
        [`<ul>
<li>A signup form: annotations check shape, a validator checks that password and confirm match.</li>
<li>Messages are internationalized through <code>messages_hi.properties</code>.</li>
<li>The database unique index remains the final guard.</li>
</ul>`, r`# messages.properties
NotBlank.form.name=Please enter your name
Size.form.password=Password needs 8 to 30 characters
password.mismatch=Passwords do not match

# OUTPUT:
# form shows the three messages next to the fields`]),

    'mvc-bean-validation': dv(
        [`<ul>
<li>A constraint is an annotation marked with <code>@Constraint</code>; its <code>ConstraintValidator</code> holds the logic.</li>
<li><code>Validator.validate(obj)</code> builds a metadata model of the class and runs each validator.</li>
<li>Results are <code>ConstraintViolation</code> objects with path, message and invalid value.</li>
<li>Spring adapts the result to <code>FieldError</code> entries in the <code>BindingResult</code>.</li>
</ul>`, r`Validator v = Validation.buildDefaultValidatorFactory().getValidator();
for (ConstraintViolation<User> cv : v.validate(new User("", 5))) {
    System.out.println(cv.getPropertyPath() + ": " + cv.getMessage()
            + " (value=" + cv.getInvalidValue() + ")");
}

// OUTPUT: (order varies)
// name: must not be blank (value=)
// age: must be greater than or equal to 18 (value=5)`],
        [`<ul>
<li>Strings: <code>@NotBlank</code>, <code>@Size</code>, <code>@Pattern</code>, <code>@Email</code>.</li>
<li>Numbers: <code>@Min</code>, <code>@Max</code>, <code>@Positive</code>, <code>@DecimalMin</code>, <code>@Digits</code>.</li>
<li>Dates: <code>@Past</code>, <code>@Future</code>, <code>@PastOrPresent</code>.</li>
<li>Collections: <code>@NotEmpty</code>, <code>@Size</code>, container element constraints such as <code>List&lt;@NotBlank String&gt;</code>.</li>
<li>Class level constraints for cross field rules.</li>
</ul>`, r`@FieldsMatch(first = "password", second = "confirm")   // class level
public class PasswordForm {
    @Size(min = 8, max = 30) private String password;
    private String confirm;
    private List<@NotBlank String> hints;
}

// OUTPUT:
// violation on the class when password and confirm differ`],
        [`<ul>
<li><b>@NotNull on a String</b> lets empty text pass; use <code>@NotBlank</code>.</li>
<li><b>@Size on a number</b> is invalid; use <code>@Min</code> and <code>@Max</code>.</li>
<li><b>Primitives</b> can never be null, so <code>@NotNull</code> on <code>int</code> is useless.</li>
<li><b>Missing @Valid</b> on the parameter, so nothing is checked.</li>
</ul>`, r`// WRONG
@NotNull private String name;      // "" passes
@Size(min = 1) private int qty;    // wrong constraint for int
// RIGHT
@NotBlank private String name;
@Min(1) private int qty;

// OUTPUT:
// WRONG: invalid data accepted   RIGHT: both rejected`],
        [`<ul>
<li>The validator factory is thread safe and costly to create; Spring creates one.</li>
<li>Use <code>failFast</code> in Hibernate Validator to stop at the first violation for large graphs.</li>
<li>Avoid database calls inside <code>ConstraintValidator</code> unless needed; they run for every request.</li>
</ul>`, r`@Bean
public LocalValidatorFactoryBean validator() {
    var f = new LocalValidatorFactoryBean();
    f.getValidationPropertyMap().put("hibernate.validator.fail_fast", "true");
    return f;
}

// OUTPUT:
// only the first violation per object is reported`],
        [`<ul>
<li>A product API shares a DTO across create and update with groups.</li>
<li>An <code>@UniqueSku</code> constraint calls the service to check the database.</li>
<li>Error responses list each field and message in JSON.</li>
</ul>`, r`public class ProductDto {
    @NotBlank(groups = {OnCreate.class, OnUpdate.class}) String name;
    @UniqueSku(groups = OnCreate.class) String sku;
    @Positive BigDecimal price;
}

// POST sku=EXISTING
// OUTPUT:
// 400 {"sku":"SKU already exists"}`]),

    'mvc-jakarta-validation': dv(
        [`<ul>
<li>Jakarta EE 9 renamed all <code>javax.*</code> specs to <code>jakarta.*</code>; behavior stayed the same.</li>
<li>Spring Framework 6 and Boot 3 are built on Jakarta EE 9/10, so they look for <code>jakarta.validation</code> only.</li>
<li>The provider (Hibernate Validator 8) reads annotations from the jakarta packages.</li>
<li>Annotations from <code>javax.validation</code> are just unknown annotations and are skipped.</li>
</ul>`, r`// Boot 3 / Spring 6
import jakarta.validation.Valid;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.constraints.NotNull;

// OUTPUT:
// all validation types now live under jakarta.validation`],
        [`<ul>
<li>Versions: Jakarta Validation 3.0 (EE 9/10) uses <code>jakarta</code> names; 2.0 (<code>javax</code>) was Java EE 8.</li>
<li>Boot 2.x uses <code>javax</code>; Boot 3.x uses <code>jakarta</code>.</li>
<li>Spring specific <code>@Validated</code> does not change.</li>
</ul>`, r`# Dependency check
./mvnw dependency:tree | grep validat

# OUTPUT: (versions vary)
# org.hibernate.validator:hibernate-validator
# jakarta.validation:jakarta.validation-api`],
        [`<ul>
<li><b>Partial rename</b>: some imports changed, others not, giving mixed errors.</li>
<li><b>Old shared library</b> compiled with javax annotations: constraints silently ignored.</li>
<li><b>Missing EL</b> gives HV000183 style startup errors.</li>
</ul>`, r`// WRONG
import javax.validation.constraints.Email;
// RIGHT
import jakarta.validation.constraints.Email;

// OUTPUT:
// WRONG: package javax.validation.constraints does not exist (or ignored)
// RIGHT: compiles and validates`],
        [`<ul>
<li>No runtime cost for the rename; startup scans the same metadata.</li>
<li>Use OpenRewrite recipes to migrate large code bases in one pass.</li>
<li>Run the full test suite after migration, because ignored constraints do not fail compilation.</li>
</ul>`, r`# Maven (OpenRewrite)
./mvnw org.openrewrite.maven:rewrite-maven-plugin:run -Drewrite.activeRecipes=org.openrewrite.java.migrate.jakarta.JavaxMigrationToJakarta

# OUTPUT:
# imports rewritten from javax.* to jakarta.*  (check the diff)`],
        [`<ul>
<li>A team upgrades a Boot 2.7 service to Boot 3.</li>
<li>Controller tests for 400 responses suddenly fail because a shared DTO jar still uses javax constraints.</li>
<li>Upgrading the jar (or rewriting its imports) restores the validation.</li>
</ul>`, r`@Test
void rejectsBlankName() throws Exception {
    mockMvc.perform(post("/users").contentType("application/json")
            .content("{\"name\":\"\"}"))
        .andExpect(status().isBadRequest());
}

// OUTPUT:
// Before fix: expected 400 but was 200   After fix: passes`]),

    'mvc-valid': dv(
        [`<ul>
<li><code>ModelAttributeMethodProcessor</code> and <code>RequestResponseBodyMethodProcessor</code> create a binder for the argument.</li>
<li>They check for <code>@Valid</code> or <code>@Validated</code> through <code>ValidationAnnotationUtils</code> and call <code>binder.validate()</code>.</li>
<li>If the next parameter is a <code>BindingResult</code> the errors go there, otherwise an exception is thrown.</li>
<li><code>MethodArgumentNotValidException</code> is mapped to 400 by <code>DefaultHandlerExceptionResolver</code>.</li>
</ul>`, r`// Simplified resolver logic
WebDataBinder binder = factory.createBinder(request, arg, name);
binder.validate();                               // because of @Valid
if (binder.getBindingResult().hasErrors() && !isBindExceptionRequired(param)) {
    // BindingResult parameter exists: pass it on
} else {
    throw new MethodArgumentNotValidException(param, binder.getBindingResult());
}

// OUTPUT:
// controller sees errors or the request ends with 400`],
        [`<ul>
<li>On <code>@RequestBody</code>, <code>@ModelAttribute</code>, plain model parameters and <code>HttpEntity</code>.</li>
<li>On a field or collection element for cascading.</li>
<li>Combined with <code>@Validated</code> on the class for simple parameters.</li>
</ul>`, r`@PostMapping("/orders")
public Order place(@RequestBody @Valid OrderDto dto) { return svc.place(dto); }

public class OrderDto {
    @NotEmpty private List<@Valid LineDto> lines;
    @Valid private AddressDto address;
}

// OUTPUT:
// violations include paths such as lines[0].qty and address.city`],
        [`<ul>
<li><b>BindingResult in the wrong place</b>, causing the exception even though a result exists.</li>
<li><b>@Valid on @RequestParam</b> has no effect.</li>
<li><b>Forgetting cascade</b>: nested object constraints are skipped without @Valid on the field.</li>
</ul>`, r`// WRONG: result is not next to the form
public String save(@Valid Form f, Model m, BindingResult r)
// RIGHT
public String save(@Valid Form f, BindingResult r, Model m)

// OUTPUT:
// WRONG: Errors/BindingResult argument declared without preceding model attribute`],
        [`<ul>
<li>Validation runs once per argument, which is cheap for small DTOs.</li>
<li>Large collections: use <code>@Size(max=...)</code> to cap input before deep cascade.</li>
<li>Limit request body size so a huge payload is rejected early.</li>
</ul>`, r`public record BulkRequest(
        @NotEmpty @Size(max = 500) List<@Valid ItemDto> items) { }

// OUTPUT:
// 501 items -> 400 without validating each item`],
        [`<ul>
<li>A REST API returns a uniform error body listing every invalid field.</li>
<li>A <code>@RestControllerAdvice</code> converts <code>MethodArgumentNotValidException</code> to JSON.</li>
<li>The client highlights fields by the keys returned.</li>
</ul>`, r`@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> onInvalid(
        MethodArgumentNotValidException ex) {
    var errors = ex.getFieldErrors().stream()
        .collect(Collectors.toMap(FieldError::getField,
                 f -> String.valueOf(f.getDefaultMessage()), (a, b) -> a));
    return ResponseEntity.badRequest().body(Map.of("errors", errors));
}

// OUTPUT:
// 400 {"errors":{"email":"must be a well-formed email address"}}`]),

    'mvc-validated': dv(
        [`<ul>
<li><code>@Validated</code> on a class marks it for <code>MethodValidationPostProcessor</code>, which creates an AOP proxy.</li>
<li>The proxy calls <code>MethodValidationInterceptor</code>, which uses the Jakarta <code>ExecutableValidator</code> for parameters and return values.</li>
<li>Violations become <code>ConstraintViolationException</code>.</li>
<li>On a parameter, <code>@Validated(Group.class)</code> is read by the MVC argument resolvers to select groups.</li>
</ul>`, r`@Service
@Validated
public class AccountService {
    public void deposit(@Positive BigDecimal amount) { }
    public @NotNull Account find(@NotBlank String id) { return repo.get(id); }
}
// accountService.deposit(BigDecimal.valueOf(-5));

// OUTPUT:
// jakarta.validation.ConstraintViolationException: deposit.amount: must be greater than 0`],
        [`<ul>
<li>Class level: enables method validation.</li>
<li>Parameter level with groups: <code>@Validated(Create.class)</code>.</li>
<li>Group sequences with <code>@GroupSequence</code> to order cheap and expensive checks.</li>
<li>Return value constraints validate what a method returns.</li>
</ul>`, r`@GroupSequence({ Default.class, Expensive.class })
public interface Ordered { }

@PostMapping
public void create(@Validated(Ordered.class) @RequestBody Dto d) { }

// OUTPUT:
// Expensive group is checked only if Default constraints pass`],
        [`<ul>
<li><b>Self invocation</b>: calling <code>this.deposit(-1)</code> skips the proxy.</li>
<li><b>Missing class annotation</b>: parameter constraints on a controller do nothing.</li>
<li><b>Expecting BindingResult</b>: method validation raises an exception instead.</li>
</ul>`, r`@Service @Validated
class Svc {
    void a() { b(-1); }                 // WRONG: self call, no validation
    void b(@Positive int n) { }
}
// RIGHT: call through another bean or inject the proxy

// OUTPUT:
// WRONG: no exception   RIGHT: ConstraintViolationException`],
        [`<ul>
<li>One proxy interceptor per call; overhead is small compared to I/O.</li>
<li>Do not put heavy checks in constraints on frequently called methods.</li>
<li>Use groups to avoid running create rules on update.</li>
</ul>`, r`public record UpdateDto(
        @NotNull(groups = OnUpdate.class) Long id,
        @NotBlank String name) { }

@PutMapping
public void update(@Validated(OnUpdate.class) @RequestBody UpdateDto d) { }

// OUTPUT:
// only OnUpdate constraints run on this endpoint`],
        [`<ul>
<li>A paged API checks <code>page &gt;= 0</code> and <code>size &lt;= 100</code> on query parameters.</li>
<li>A handler for <code>ConstraintViolationException</code> returns 400 with the messages.</li>
<li>The same constraints also protect service methods called from batch jobs.</li>
</ul>`, r`@RestController @Validated
class ListController {
    @GetMapping("/list")
    List<Item> list(@RequestParam @Min(0) int page,
                    @RequestParam @Max(100) int size) {
        return service.page(page, size);
    }
}

// GET /list?page=0&size=500
// OUTPUT:
// 400  list.size: must be less than or equal to 100`]),

    'mvc-bindingresult-validation': dv(
        [`<ul>
<li><code>BindingResult</code> is implemented by <code>BeanPropertyBindingResult</code>, created by the <code>WebDataBinder</code>.</li>
<li>It stores <code>ObjectError</code> and <code>FieldError</code> lists and the original rejected values.</li>
<li>Argument resolvers add it to the model so views can read it.</li>
<li>Type mismatches add a <code>FieldError</code> with code <code>typeMismatch</code>.</li>
</ul>`, r`FieldError fe = result.getFieldError("age");
System.out.println(fe.getField() + " | " + fe.getRejectedValue()
        + " | " + fe.getCode() + " | " + fe.getDefaultMessage());

// OUTPUT:
// age | abc | typeMismatch | Failed to convert value of type String to int`],
        [`<ul>
<li><code>rejectValue(field, code, message)</code> and <code>reject(code, message)</code>.</li>
<li><code>hasErrors()</code>, <code>hasFieldErrors(field)</code>, <code>getErrorCount()</code>.</li>
<li><code>Model</code> attribute name must match the form object name for the view to find errors.</li>
<li>Use <code>RedirectAttributes</code> flash attributes to carry errors across a redirect.</li>
</ul>`, r`@PostMapping("/edit")
public String edit(@Valid @ModelAttribute("form") EditForm form,
                   BindingResult br, RedirectAttributes ra) {
    if (br.hasErrors()) {
        ra.addFlashAttribute("org.springframework.validation.BindingResult.form", br);
        ra.addFlashAttribute("form", form);
        return "redirect:/edit";
    }
    return "redirect:/done";
}

// OUTPUT:
// after redirect the edit page still shows field errors`],
        [`<ul>
<li><b>Wrong parameter order</b>.</li>
<li><b>Ignoring errors</b>: forgetting <code>hasErrors()</code> and saving invalid data.</li>
<li><b>Different attribute names</b> so the view cannot find the errors.</li>
<li><b>Redirect after errors</b> without flash attributes.</li>
</ul>`, r`// WRONG: errors lost after redirect
if (br.hasErrors()) return "redirect:/edit";
// RIGHT: render the same view
if (br.hasErrors()) return "edit";

// OUTPUT:
// WRONG: blank form without messages   RIGHT: form with messages`],
        [`<ul>
<li>Errors are small objects created per request; the cost is negligible.</li>
<li>Avoid database checks before <code>hasFieldErrors</code> short circuits.</li>
<li>Keep messages in a <code>MessageSource</code>, which caches loaded bundles.</li>
</ul>`, r`# application.properties
spring.messages.basename=messages
spring.messages.cache-duration=3600s

# OUTPUT:
# bundles are cached for one hour (no file read per request)`],
        [`<ul>
<li>A signup page shows an error beside each field and a summary on top.</li>
<li>A global error from <code>reject</code> says that the account could not be created.</li>
<li>A test confirms field errors with MockMvc <code>model()</code> assertions.</li>
</ul>`, r`mockMvc.perform(post("/signup").param("email", "dup@x.com").param("name", "A"))
        .andExpect(model().attributeHasFieldErrorCode("user", "email", "email.taken"))
        .andExpect(status().isOk())
        .andExpect(view().name("signup"));

// OUTPUT:
// Test passed (view signup, 1 field error on email)`]),
};
