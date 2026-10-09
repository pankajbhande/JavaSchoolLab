import { Topic } from '../coreJava';

export const springBootValidation: Topic = {
    id: 'spring-boot-validation',
    name: 'Bean Validation',
    beginner: [
        {
            content: `<h3>Why Validate at All?</h3>
Every request that arrives from outside your application is <strong>untrusted</strong>. A browser form can be bypassed, a mobile client can be out of date, and a script can send anything at all. If the controller passes bad data straight into the service layer, the failure surfaces somewhere deep and unhelpful - a database constraint violation, a <code>NullPointerException</code>, or worse, a row of nonsense saved successfully.<br><br>

Without validation:<br>`,
            codeExamples: [
                `// POST /api/employees   with this body:
{
    "name": "",
    "age": -5,
    "email": "not-an-email"
}

// The service happily saves it.
// OUTPUT in the database:
// +----+------+-----+---------------+
// | id | name | age | email         |
// +----+------+-----+---------------+
// |  7 |      |  -5 | not-an-email  |
// +----+------+-----+---------------+
//
// Or, if the column is NOT NULL, a 500 with:
// java.sql.SQLIntegrityConstraintViolationException:
//     Column 'name' cannot be null
// The client is told "Internal Server Error" for a mistake it made.`
            ]
        },
        {
            content: `<h3>Bean Validation - the Standard</h3>
Java has a specification for this - <strong>Bean Validation</strong> (JSR 380, now Jakarta Validation). You declare the rules as annotations on the fields, and the framework enforces them.<br><br>

<table>
<tr><th>Piece</th><th>Purpose</th></tr>
<tr><td>Jakarta Validation API</td><td>The specification - the annotations themselves.</td></tr>
<tr><td>Hibernate Validator</td><td>The reference implementation that actually does the checking.</td></tr>
<tr><td>spring-boot-starter-validation</td><td>Brings both in and auto-configures them.</td></tr>
</table>
<br>
<strong>Important:</strong> since Spring Boot 2.3 validation is <em>not</em> included in <code>spring-boot-starter-web</code>. If you add <code>@NotBlank</code> and nothing happens, this missing dependency is almost always why.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Without it, the annotations compile (they come in transitively
     via JPA in some setups) but NOTHING enforces them. Invalid data
     passes straight through with no error - the most confusing
     possible failure mode, because the code looks correct. -->`
            ]
        },
        {
            content: `<h3>The Core Constraint Annotations</h3>

<table>
<tr><th>Annotation</th><th>What it requires</th></tr>
<tr><td>@NotNull</td><td>The value is not null. An empty string passes.</td></tr>
<tr><td>@NotEmpty</td><td>Not null and not empty. A string of spaces passes.</td></tr>
<tr><td>@NotBlank</td><td>Not null, and contains at least one non-whitespace character. For Strings, this is usually what you want.</td></tr>
<tr><td>@Size(min, max)</td><td>Length of a String, or size of a collection or map.</td></tr>
<tr><td>@Min / @Max</td><td>Numeric bounds, inclusive.</td></tr>
<tr><td>@Positive / @PositiveOrZero</td><td>Greater than zero / not negative.</td></tr>
<tr><td>@Email</td><td>A syntactically well-formed email address.</td></tr>
<tr><td>@Pattern(regexp)</td><td>Matches a regular expression.</td></tr>
<tr><td>@Past / @Future</td><td>A date before / after now.</td></tr>
<tr><td>@DecimalMin / @DecimalMax</td><td>Bounds for BigDecimal, where precision matters.</td></tr>
<tr><td>@Digits(integer, fraction)</td><td>Limits digits before and after the decimal point.</td></tr>
</table>
<br>
The distinction between the first three catches people constantly:<br>`,
            codeExamples: [
                `// value:       null    ""      "   "   "ajay"
// @NotNull     FAIL    pass    pass    pass
// @NotEmpty    FAIL    FAIL    pass    pass
// @NotBlank    FAIL    FAIL    FAIL    pass
//
// For a String field, @NotBlank is nearly always the right choice.
// @NotNull on a String lets "" and "   " through, which is how blank
// names end up in the database.

// On a COLLECTION, @NotBlank does not apply - use @NotEmpty:
@NotEmpty(message = "at least one item is required")
private List<OrderLine> lines;`
            ]
        },
        {
            content: `<h3>Applying Them: <code>@Valid</code> on the Request Body</h3>
Two things are needed, and forgetting either means no validation happens:<br><br>

<div class="border">
1. Constraint annotations on the DTO fields.<br>
2. <code>@Valid</code> on the controller parameter - this is what <em>triggers</em> the check.
</div><br>

The annotations alone do nothing. <code>@Valid</code> is the switch.<br>`,
            codeExamples: [
                `// The DTO carries the rules
public class EmployeeRequest {

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must be at most 100 characters")
    private String name;

    @NotNull(message = "age is required")
    @Min(value = 18, message = "employee must be at least 18")
    @Max(value = 70, message = "employee must be at most 70")
    private Integer age;

    @NotBlank
    @Email(message = "must be a valid email address")
    private String email;

    @Pattern(regexp = "^[6-9]\\\\d{9}$",
             message = "must be a 10-digit Indian mobile number")
    private String mobile;

    // getters and setters
}`,
                `@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @PostMapping
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        //                          ^^^^^^ without this, nothing is checked
        return service.create(request);
    }
}
// OUTPUT with a valid body: 200/201 and the created employee.
//
// OUTPUT with the bad body from earlier:
// 400 Bad Request
// {
//   "timestamp": "2026-09-03T10:22:41.123+00:00",
//   "status": 400,
//   "error": "Bad Request",
//   "path": "/api/employees"
// }
// The status is right, but the body does not say WHAT was wrong.
// Fixing that is the next section.`
            ]
        },
        {
            content: `<h3>Returning Useful Error Messages</h3>
A bare 400 tells the client something was wrong but not what. Spring throws <code>MethodArgumentNotValidException</code>, and a <code>@RestControllerAdvice</code> can turn it into a response the client can act on - ideally field by field, so a form can highlight the offending inputs.<br>`,
            codeExamples: [
                `@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {

        // field name -> first message for that field
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }

        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", 400,
                "message", "validation failed",
                "errors", fieldErrors);
    }
}`,
                `// POST /api/employees
// { "name": "", "age": -5, "email": "not-an-email" }

// RESPONSE 400 Bad Request
{
    "timestamp": "2026-09-03T10:22:41Z",
    "status": 400,
    "message": "validation failed",
    "errors": {
        "name":   "name is required",
        "age":    "employee must be at least 18",
        "email":  "must be a valid email address",
        "mobile": "must be a 10-digit Indian mobile number"
    }
}
// Every problem reported at once, keyed by field. A form can now
// mark all four inputs in a single round trip instead of making
// the user resubmit four times.`
            ]
        },
        {
            content: `<h3>Validating Path Variables and Request Parameters</h3>
<code>@Valid</code> works on objects. To constrain a bare <code>@PathVariable</code> or <code>@RequestParam</code>, put the annotation directly on the parameter and add <code>@Validated</code> to the <strong>class</strong>.<br><br>

Without the class-level <code>@Validated</code>, parameter constraints are silently ignored - the same quiet failure as the missing starter dependency.<br>`,
            codeExamples: [
                `@RestController
@RequestMapping("/api/employees")
@Validated                          // required for the annotations below
public class EmployeeController {

    @GetMapping("/{id}")
    public EmployeeResponse get(@PathVariable @Positive Integer id) {
        return service.findById(id);
    }

    @GetMapping
    public List<EmployeeResponse> search(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "0")  @PositiveOrZero int page,
            @RequestParam(defaultValue = "20") @Max(100) int size) {
        return service.search(city, page, size);
    }
}
// OUTPUT:
// GET /api/employees/-3        -> ConstraintViolationException
// GET /api/employees?size=500  -> ConstraintViolationException
//
// Note this is a DIFFERENT exception from @Valid on a body, so it
// needs its own handler - see the Expert tab.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Two Exceptions, Not One</h3>
This is the detail that makes validation error handling look inconsistent until you know it. Where the constraint sits decides which exception is thrown, and they need separate handlers.<br><br>

<table>
<tr><th>Trigger</th><th>Exception</th><th>Default status</th></tr>
<tr><td><code>@Valid</code> on <code>@RequestBody</code></td><td>MethodArgumentNotValidException</td><td>400</td></tr>
<tr><td><code>@Valid</code> on <code>@ModelAttribute</code> (form binding)</td><td>BindException</td><td>400</td></tr>
<tr><td><code>@Validated</code> class + constrained params</td><td>ConstraintViolationException</td><td><strong>500</strong></td></tr>
<tr><td><code>@Valid</code> on a service method argument</td><td>ConstraintViolationException</td><td><strong>500</strong></td></tr>
</table>
<br>
That third row is a real bug in a lot of applications: a client sends <code>?size=500</code>, breaks a <code>@Max(100)</code>, and receives <strong>500 Internal Server Error</strong> - telling them the server is broken when they made the mistake. It defaults to 500 because <code>ConstraintViolationException</code> is a generic Jakarta exception with no HTTP meaning attached.<br>`,
            codeExamples: [
                `@RestControllerAdvice
public class ValidationExceptionHandler {

    // Body validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleBody(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return new ApiError(400, "validation failed", errors);
    }

    // Parameter validation - MUST be handled, or clients get a 500
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleParams(ConstraintViolationException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (ConstraintViolation<?> v : ex.getConstraintViolations()) {
            // propertyPath is "search.city" - keep the last segment
            String path = v.getPropertyPath().toString();
            String field = path.substring(path.lastIndexOf('.') + 1);
            errors.putIfAbsent(field, v.getMessage());
        }
        return new ApiError(400, "validation failed", errors);
    }
}
// OUTPUT:
// GET /api/employees?size=500
// 400 Bad Request
// { "status":400, "message":"validation failed",
//   "errors": { "size": "must be less than or equal to 100" } }`
            ]
        },
        {
            content: `<h3>Nested Objects Need <code>@Valid</code> Too</h3>
Constraints do not cascade automatically. A DTO containing another DTO, or a list of them, is validated only at the top level unless the nested field is itself annotated <code>@Valid</code>.<br><br>

This is a silent gap: the outer object passes, the inner rubbish goes through.<br>`,
            codeExamples: [
                `public class OrderRequest {

    @NotBlank
    private String customerName;

    @Valid                            // <-- without this, Address is NOT checked
    @NotNull
    private AddressRequest address;

    @Valid                            // <-- validates EVERY element of the list
    @NotEmpty
    private List<OrderLineRequest> lines;
}

public class AddressRequest {
    @NotBlank private String line1;
    @NotBlank private String city;
    @Pattern(regexp = "\\\\d{6}", message = "pincode must be 6 digits")
    private String pincode;
}`,
                `// POST /api/orders
{
    "customerName": "ajay",
    "address": { "line1": "", "city": "", "pincode": "12" },
    "lines": [ { "sku": "", "quantity": -1 } ]
}

// WITHOUT @Valid on the nested fields:
// 200 OK - the bad address and line are saved.

// WITH @Valid:
// 400 Bad Request
// "errors": {
//     "address.line1":     "must not be blank",
//     "address.city":      "must not be blank",
//     "address.pincode":   "pincode must be 6 digits",
//     "lines[0].sku":      "must not be blank",
//     "lines[0].quantity": "must be greater than 0"
// }
// Note the paths: dotted for nested objects, indexed for collections.`
            ]
        },
        {
            content: `<h3>Custom Constraints</h3>
The built-in annotations cover shape, not meaning. "Must be a valid PAN number", "must not be a disposable email domain", "delivery date must be a working day" - those need a custom constraint.<br><br>

A custom constraint is two pieces: the annotation, and a <code>ConstraintValidator</code> that implements the check.<br>`,
            codeExamples: [
                `@Documented
@Constraint(validatedBy = PanNumberValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPan {

    String message() default "must be a valid PAN number";

    // These two are REQUIRED by the spec - omitting them gives
    // "ValidPan contains Constraint annotation, but does not
    //  contain a groups parameter"
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}`,
                `public class PanNumberValidator implements ConstraintValidator<ValidPan, String> {

    private static final Pattern PAN = Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // null is handled by @NotNull, not here. Returning true for null
        // keeps the constraints composable - this is the convention.
        if (value == null) return true;
        return PAN.matcher(value).matches();
    }
}

// Usage:
public class TaxDetailsRequest {
    @NotBlank
    @ValidPan
    private String panNumber;
}
// OUTPUT:
// "ABCDE1234F" -> passes
// "abcde1234f" -> "must be a valid PAN number"`,
                `// A validator can inject Spring beans - it is a Spring-managed
// component, so it can hit the database or another service.
@Component
public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {

    private final EmployeeRepository repository;

    public UniqueEmailValidator(EmployeeRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null) return true;
        return !repository.existsByEmail(email);
    }
}
// Convenient, and be careful: this runs a query on every request,
// and it is inherently racy - two concurrent signups both pass the
// check, then one fails on the database's UNIQUE constraint. Treat
// it as a friendly early message, and keep the DB constraint as the
// real guarantee.`,
                `// A CLASS-level constraint, for rules spanning several fields -
// something field-level annotations cannot express.
@Documented
@Constraint(validatedBy = DateRangeValidator.class)
@Target(ElementType.TYPE)              // <-- TYPE, not FIELD
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDateRange {
    String message() default "end date must be after start date";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class DateRangeValidator
        implements ConstraintValidator<ValidDateRange, BookingRequest> {

    @Override
    public boolean isValid(BookingRequest req, ConstraintValidatorContext ctx) {
        if (req.getStart() == null || req.getEnd() == null) return true;
        if (req.getEnd().isAfter(req.getStart())) return true;

        // Attach the message to a FIELD rather than the whole object,
        // so the client can highlight the right input.
        ctx.disableDefaultConstraintViolation();
        ctx.buildConstraintViolationWithTemplate(ctx.getDefaultConstraintMessageTemplate())
           .addPropertyNode("end")
           .addConstraintViolation();
        return false;
    }
}
// OUTPUT: "errors": { "end": "end date must be after start date" }`
            ]
        },
        {
            content: `<h3>Validation Groups - Different Rules for Different Operations</h3>
Create and update rarely have the same rules. On create the id must be absent; on update it is mandatory. One DTO cannot express both with plain annotations - which is why people duplicate the DTO.<br><br>

Groups solve it: tag each constraint with a marker interface, then activate a group per endpoint with <code>@Validated</code> (note: <code>@Valid</code> cannot select a group - this is the one place you must use <code>@Validated</code> on the parameter).<br>`,
            codeExamples: [
                `public interface OnCreate {}
public interface OnUpdate {}

public class EmployeeRequest {

    @Null(groups = OnCreate.class,    message = "id must not be supplied on create")
    @NotNull(groups = OnUpdate.class, message = "id is required on update")
    private Integer id;

    // No group -> belongs to Default, which is NOT active when you
    // name a specific group. Tag it with both to apply it always.
    @NotBlank(groups = { OnCreate.class, OnUpdate.class })
    private String name;

    @NotBlank(groups = OnCreate.class)          // required on create only
    private String email;
}`,
                `@PostMapping
public EmployeeResponse create(
        @Validated(OnCreate.class) @RequestBody EmployeeRequest request) {
    return service.create(request);
}

@PutMapping("/{id}")
public EmployeeResponse update(
        @PathVariable Integer id,
        @Validated(OnUpdate.class) @RequestBody EmployeeRequest request) {
    return service.update(id, request);
}
// OUTPUT:
// POST with an id       -> 400 "id must not be supplied on create"
// PUT  without an id    -> 400 "id is required on update"
// PUT  without an email -> 200 (email is OnCreate-only)
//
// THE TRAP: an untagged constraint sits in the Default group, and
// @Validated(OnCreate.class) activates ONLY OnCreate. Every untagged
// constraint is then skipped. Either tag everything explicitly, or
// include Default: @Validated({ Default.class, OnCreate.class }).`
            ]
        },
        {
            content: `<h3>Where Validation Belongs - and What It Cannot Do</h3>
Bean Validation checks the <strong>shape</strong> of data. It cannot check anything requiring context, state, or a decision.<br><br>

<table>
<tr><th>Bean Validation handles</th><th>Business logic handles</th></tr>
<tr><td>Is the email well-formed?</td><td>Is this user allowed to change that email?</td></tr>
<tr><td>Is the amount positive?</td><td>Does the account have sufficient balance?</td></tr>
<tr><td>Is the date in the future?</td><td>Is the venue free on that date?</td></tr>
<tr><td>Is the SKU 8 characters?</td><td>Is that product still in stock?</td></tr>
</table>
<br>
Validation belongs at the <strong>boundary</strong> - reject malformed input before it reaches the service. Business rules belong in the service and throw domain exceptions. Putting a balance check in a <code>ConstraintValidator</code> hides an important rule inside an annotation where nobody looks for it.<br><br>

<strong>Layered defence.</strong> None of these replaces the others:<br><br>

<table>
<tr><th>Layer</th><th>Protects against</th></tr>
<tr><td>Client-side (browser)</td><td>Nothing - it is UX only. Trivially bypassed.</td></tr>
<tr><td>Bean Validation at the controller</td><td>Malformed input from any client.</td></tr>
<tr><td>Service-layer business rules</td><td>Operations that are well-formed but not allowed.</td></tr>
<tr><td>Database constraints</td><td>Everything else, including bugs and races. The last line, and the only one that cannot be bypassed.</td></tr>
</table>`,
            codeExamples: [
                `// Validation at the boundary, business rules in the service
@PostMapping("/transfers")
public TransferResponse transfer(@Valid @RequestBody TransferRequest request) {
    return transferService.execute(request);   // shape is already guaranteed
}

public class TransferRequest {
    @NotNull                     private Long fromAccountId;
    @NotNull                     private Long toAccountId;
    @NotNull @DecimalMin("0.01") private BigDecimal amount;
}

@Service
public class TransferService {

    @Transactional
    public TransferResponse execute(TransferRequest request) {

        Account from = accounts.findById(request.getFromAccountId())
                .orElseThrow(() -> new AccountNotFoundException(request.getFromAccountId()));

        // A BUSINESS rule, not a validation rule: it needs state.
        if (from.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(from.getId());
        }
        ...
    }
}
// OUTPUT:
// amount = -50  -> 400 "must be greater than or equal to 0.01"  (validation)
// amount = 1e9  -> 409 "insufficient balance"                   (business rule)
// Two different failures, two different status codes, both clear.`,
                `// Entity-level constraints ALSO fire, on flush - a useful backstop
@Entity
public class Employee {

    @Column(nullable = false, length = 100)
    @NotBlank
    private String name;

    @Column(nullable = false, unique = true)
    @Email
    private String email;
}
// Hibernate validates before INSERT/UPDATE and throws
// ConstraintViolationException on flush.
//
// Careful: that happens at COMMIT, often after the controller has
// returned, so the error is far from its cause and the transaction
// rolls back late. Validate at the boundary; treat entity
// constraints as a safety net, not the primary check.
//
// And note @Column(nullable = false) generates the DDL, while
// @NotBlank does the Java-side check. You want both.`
            ]
        },
        {
            content: `<h3>Localised Messages</h3>
Hard-coded English strings in <code>message = "..."</code> cannot be translated. Bean Validation supports message keys in braces, resolved from a resource bundle - so validation errors come back in the caller's language.<br>`,
            codeExamples: [
                `public class EmployeeRequest {
    @NotBlank(message = "{employee.name.required}")
    private String name;

    @Min(value = 18, message = "{employee.age.min}")
    private Integer age;
}`,
                `# messages_en.properties
employee.name.required=Name is required
employee.age.min=Employee must be at least {value} years old

# messages_fr.properties
employee.name.required=Le nom est obligatoire
employee.age.min=L'employe doit avoir au moins {value} ans

# {value} interpolates the constraint's own attribute, so the
# message stays correct if you change @Min(18) to @Min(21).`,
                `// Wire the MessageSource into the validator, or the keys come back
// literally as "{employee.name.required}"
@Configuration
public class ValidationConfig {

    @Bean
    public LocalValidatorFactoryBean validator(MessageSource messageSource) {
        LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
        bean.setValidationMessageSource(messageSource);
        return bean;
    }
}
// OUTPUT:
// Accept-Language: en -> { "name": "Name is required" }
// Accept-Language: fr -> { "name": "Le nom est obligatoire" }`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Bean Validation?</td><td>The Jakarta specification (JSR 380) for declaring constraints as annotations, implemented by Hibernate Validator.</td></tr>
<tr><td>Why do the annotations sometimes do nothing?</td><td><code>spring-boot-starter-validation</code> is missing - it was removed from the web starter in Boot 2.3 - or <code>@Valid</code> is not on the parameter.</td></tr>
<tr><td>Difference between @NotNull, @NotEmpty and @NotBlank?</td><td>@NotNull rejects only null; @NotEmpty also rejects empty; @NotBlank also rejects whitespace-only. For Strings, @NotBlank is usually correct.</td></tr>
<tr><td>@Valid vs @Validated?</td><td>@Valid is the Jakarta annotation and triggers validation; @Validated is Spring's, and additionally selects validation groups and enables method-parameter validation at class level.</td></tr>
<tr><td>Which exception does body validation throw?</td><td><code>MethodArgumentNotValidException</code>, which Spring maps to 400.</td></tr>
<tr><td>Which exception does parameter validation throw, and why does it matter?</td><td><code>ConstraintViolationException</code>, which defaults to <strong>500</strong>. You must handle it, or clients get a server error for their own bad input.</td></tr>
<tr><td>Why is a nested object not validated?</td><td>Constraints do not cascade. The nested field itself needs <code>@Valid</code>.</td></tr>
<tr><td>How do you write a custom constraint?</td><td>An annotation meta-annotated <code>@Constraint(validatedBy = ...)</code> with <code>message</code>, <code>groups</code> and <code>payload</code> attributes, plus a <code>ConstraintValidator</code> implementation.</td></tr>
<tr><td>Should a custom validator return true or false for null?</td><td>True - let <code>@NotNull</code> own null so constraints compose.</td></tr>
<tr><td>What are validation groups for?</td><td>Applying different rules to the same DTO per operation, e.g. id forbidden on create and required on update.</td></tr>
<tr><td>What is the trap with groups?</td><td>Naming a group deactivates <code>Default</code>, so every untagged constraint is skipped. Tag them all, or include <code>Default.class</code>.</td></tr>
<tr><td>Can validation check a database uniqueness rule?</td><td>Technically yes via an injected validator, but it is racy - keep the database UNIQUE constraint as the real guarantee.</td></tr>
<tr><td>Where does validation end and business logic begin?</td><td>Validation checks the shape of the input; anything needing state or context - balance, availability, permission - is a business rule that belongs in the service.</td></tr>
<tr><td>Is client-side validation a security control?</td><td>No. It is purely UX and is trivially bypassed; the server must revalidate everything.</td></tr>
</table>`
        }
    ]
};
