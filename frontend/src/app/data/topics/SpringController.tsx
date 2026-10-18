import { Topic } from '../coreJava';

export const springController: Topic = {
    id: 'sb-controller',
    name: "@Controller",
    beginner: [
        {
            content: `<h3>The Stereotype Spring MVC Looks For</h3>
<code>@Controller</code> registers a bean like any <code>@Component</code>, and it does one thing more: it tells Spring MVC that this class contains <strong>request handlers</strong>.<br><br>

That second part is not optional. When the application starts, <code>RequestMappingHandlerMapping</code> walks the beans looking for classes annotated with <code>@Controller</code> and builds its URL-to-method table from their <code>@GetMapping</code> and <code>@PostMapping</code> methods. A class it does not recognise is never inspected.<br>`,
            codeExamples: [
                `// This works.
@Controller
public class HomeController {

    @GetMapping("/home")
    public String home() { return "home"; }
}


// This does NOT. The class is a perfectly good bean - it is just
// never scanned for handlers.
@Component                                  // <-- wrong stereotype
public class HomeController {

    @GetMapping("/home")
    public String home() { return "home"; }
}

// OUTPUT:
// GET /home  ->  404 Not Found
//
// No error, no warning at startup. The mapping simply does not exist.
// When a URL 404s and the method is clearly right there, check the
// class annotation first - this is the most common cause.`
            ]
        },
        {
            content: `<h3><code>@Controller</code> vs <code>@RestController</code></h3>
<code>@RestController</code> is <code>@Controller</code> plus <code>@ResponseBody</code>, applied to the whole class. That single difference changes what a returned value <em>means</em>.<br><br>

<table>
<tr><th></th><th><code>@Controller</code></th><th><code>@RestController</code></th></tr>
<tr><td>A returned <code>String</code> is</td><td>a <strong>view name</strong> to render</td><td>the <strong>response body</strong></td></tr>
<tr><td>A returned object is</td><td>a model attribute (needs a view)</td><td>serialised to JSON</td></tr>
<tr><td>Used for</td><td>Server-rendered pages - Thymeleaf, JSP</td><td>REST APIs</td></tr>
</table>`,
            codeExamples: [
                `// The Spring source - @RestController is a composed annotation:

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Controller                                 // it IS a @Controller
@ResponseBody                               // ...with this added
public @interface RestController { }

// Which is why everything true of @Controller is true of it, and why
// @Controller + @ResponseBody on every method is exactly equivalent.`,
                `// SERVER-RENDERED - the String is a view name.
@Controller
public class OrderPageController {

    @GetMapping("/orders/{id}")
    public String view(@PathVariable Long id, Model model) {
        model.addAttribute("order", orders.require(id));
        return "orders/detail";              // -> templates/orders/detail.html
    }
}


// REST - the object becomes JSON.
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) {
        return OrderResponse.from(orders.require(id));
    }
}
// OUTPUT:
// HTTP/1.1 200 OK
// Content-Type: application/json
// {"id":1,"reference":"A-1","total":"49.99"}`
            ]
        },
        {
            content: `<h3>The Bug Everyone Writes Once</h3>
Use <code>@Controller</code> where you meant <code>@RestController</code>, and a method returning a <code>String</code> compiles, starts, and then fails in a way that mentions nothing about controllers.<br>`,
            codeExamples: [
                `@Controller                                // should be @RestController
@RequestMapping("/api")
public class StatusController {

    @GetMapping("/status")
    public String status() {
        return "OK";                       // meant as the body
    }
}

// OUTPUT:
// HTTP/1.1 500 Internal Server Error
//
// javax.servlet.ServletException: Circular view path [OK]: would
// dispatch back to the current handler URL again.
//
// Spring took "OK" as a VIEW NAME, found no view resolver that could
// render it, and fell back to forwarding to /OK - which mapped back
// here, hence "circular".

// Three ways to fix it, in order of preference:

@RestController                            // 1. the class is a REST class
public class StatusController { ... }

@Controller
public class StatusController {
    @GetMapping("/status")
    @ResponseBody                          // 2. this one method is a body
    public String status() { return "OK"; }
}

@Controller
public class StatusController {
    @GetMapping("/status")
    public ResponseEntity<String> status() {   // 3. ResponseEntity is
        return ResponseEntity.ok("OK");        //    always a body
    }
}

// The symptom to memorise: "Circular view path" almost always means
// a missing @ResponseBody, not a routing problem.`
            ]
        },
        {
            content: `<h3>What Belongs in a Controller</h3>
A controller translates between HTTP and the application. That is the whole job, and it is a narrow one.<br><br>

<table>
<tr><th>Belongs</th><th>Does not</th></tr>
<tr><td>Binding the request - path variables, query parameters, body</td><td>Business rules and validation logic</td></tr>
<tr><td>Triggering validation with <code>@Valid</code></td><td>Repository calls</td></tr>
<tr><td>Calling one service method</td><td><code>@Transactional</code></td></tr>
<tr><td>Mapping the result to a response DTO</td><td>Try/catch for business failures - <code>@ControllerAdvice</code> handles those centrally</td></tr>
<tr><td>Choosing the status code and headers</td><td>Anything you would want to reuse from a scheduled job or a message consumer</td></tr>
</table>
<br>
The last row is the useful test. If logic sits in a controller and tomorrow the same operation must run from a Kafka consumer or a CLI command, that logic has to move. Writing it in the service to begin with saves the move.<br>`,
            codeExamples: [
                `// Thin - and this is the target shape.
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orders;
    public OrderController(OrderService orders) { this.orders = orders; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(@Valid @RequestBody PlaceOrderRequest request) {
        Order order = orders.place(request.toCommand());
        return OrderResponse.from(order);
    }
}

// Bind, validate, delegate, map. Four lines, no decisions.


// Fat - the same endpoint with the application inside it.
@RestController
public class OrderController {

    private final OrderRepository orders;          // repository in a controller
    private final InventoryRepository inventory;

    @PostMapping("/api/orders")
    @Transactional                                 // boundary in the wrong layer
    public Order place(@RequestBody PlaceOrderRequest request) {
        if (request.items().isEmpty()) {           // business rule
            throw new IllegalArgumentException();
        }
        if (!inventory.hasStock(request.items())) {   // business rule
            throw new IllegalStateException();
        }
        Order order = new Order(request);
        return orders.save(order);                 // entity leaked as response
    }
}

// Four separate problems, and the last is the quiet one: returning the
// entity ties the JSON contract to the database schema. Rename a column
// and every client breaks. It also serialises whatever the entity is
// lazily holding - see the Expert section.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Returning an Entity Is a Bug Waiting for Load</h3>
Returning a JPA entity from a controller works in development and fails in production, for two separate reasons.<br>`,
            codeExamples: [
                `@Entity
public class Order {
    @Id private Long id;
    private String reference;
    private String internalNotes;                    // not for customers

    @OneToMany(fetch = FetchType.LAZY)
    private List<OrderLine> lines;

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;                       // -> and Customer has
}                                                    //    its own relations

@GetMapping("/api/orders/{id}")
public Order get(@PathVariable Long id) {            // returning the entity
    return orders.require(id);
}

// PROBLEM 1 - serialisation outside the transaction.
// The transaction closed in the service. Jackson now walks 'lines'
// and touches a lazy proxy with no session behind it:
//
//   HttpMessageNotWritableException:
//     Could not write JSON: could not initialize proxy - no Session
//
// Or, with open-session-in-view left on (Boot's default, and a bad
// one), it silently succeeds - by running one extra query per
// relation, per request, discovered later as an N+1 problem.

// PROBLEM 2 - the contract.
// internalNotes is now in the public API. So is every field anyone
// adds to the entity later. The JSON changes whenever the schema does,
// without anyone deciding that it should.`,
                `// The fix: a response record that states the contract explicitly.

public record OrderResponse(Long id, String reference, Money total,
                            List<LineResponse> lines) {

    public static OrderResponse from(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getReference(),
            order.total(),
            order.getLines().stream().map(LineResponse::from).toList());
    }
}

@GetMapping("/api/orders/{id}")
public OrderResponse get(@PathVariable Long id) {
    return OrderResponse.from(orders.require(id));
}

// Three things this buys:
//   * the JSON is decided by the record, not by the schema
//   * internalNotes cannot leak, because it is not in the record
//   * from() runs inside the service call, while the session is open,
//     so lazy loading is a decision rather than an accident
//
// Also: turn off open-session-in-view, so the failure is loud rather
// than a silent N+1:
//     spring.jpa.open-in-view=false`
            ]
        },
        {
            content: `<h3>How a Handler Is Actually Found</h3>
Knowing the mapping rules removes most "why is this 404" and "ambiguous mapping" confusion.<br><br>

<table>
<tr><th>Rule</th><th>Consequence</th></tr>
<tr><td>The type must carry <code>@Controller</code> <em>or</em> <code>@RequestMapping</code></td><td><code>@Component</code> plus <code>@GetMapping</code> is silently unmapped. A bare <code>@RequestMapping</code> on the class is enough, which is why some legacy controllers work without a stereotype.</td></tr>
<tr><td>Mappings are inherited from interfaces and superclasses</td><td>A shared abstract base controller can declare the mappings. Convenient, and a common source of an unexpected duplicate.</td></tr>
<tr><td>Two methods matching the same request is a startup failure</td><td><code>IllegalStateException: Ambiguous mapping</code>, naming both methods. Fails fast, which is right.</td></tr>
<tr><td>Handler methods are matched by <em>type</em>, not by name</td><td>Parameters and return values can be almost anything Spring knows how to resolve - the method name is documentation only.</td></tr>
</table>`,
            codeExamples: [
                `// Listing every mapping the application registered - the fastest way
// to answer "is my endpoint there at all".

curl localhost:8080/actuator/mappings | jq '..|.predicate? // empty'

# OUTPUT:
# "{GET /api/orders/{id}}"
# "{POST /api/orders}"
# "{GET /actuator/health}"
#
# Enable with:
#   management.endpoints.web.exposure.include=mappings

// Or at startup, without Actuator:
//   logging.level.org.springframework.web.servlet.mvc.method.annotation
//       .RequestMappingHandlerMapping=TRACE
//
// which logs each mapping as it is registered:
//   Mapped "{GET /api/orders/{id}}" onto OrderController#get(Long)`,
                `// Ambiguous mapping - what it looks like and why it is a good failure.

@RestController
public class OrderController {

    @GetMapping("/api/orders/{id}")
    public OrderResponse byId(@PathVariable Long id) { ... }

    @GetMapping("/api/orders/{reference}")           // same pattern
    public OrderResponse byReference(@PathVariable String reference) { ... }
}

// OUTPUT at startup:
// IllegalStateException: Ambiguous mapping. Cannot map
// 'orderController' method
//   OrderController#byReference(String)
// to {GET /api/orders/{reference}}: There is already
//   OrderController#byId(Long)
// mapped.
//
// The path variable NAME is irrelevant to matching - {id} and
// {reference} are the same pattern. The type of the parameter does
// not disambiguate either; routing happens before binding.
//
// Fix by making the paths genuinely different:
//     /api/orders/{id}
//     /api/orders/by-reference/{reference}`
            ]
        },
        {
            content: `<h3>Controller Advice, and Where Errors Belong</h3>
Controllers should not contain try/catch for business failures. <code>@ControllerAdvice</code> handles them for every controller at once, which keeps the mapping consistent across the API.<br>`,
            codeExamples: [
                `// Not this - the same block, repeated in every controller, drifting
// slightly each time.
@GetMapping("/{id}")
public ResponseEntity<?> get(@PathVariable Long id) {
    try {
        return ResponseEntity.ok(orders.require(id));
    } catch (OrderNotFoundException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
}

// This - declared once, applied everywhere.
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ProblemDetail notFound(OrderNotFoundException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                                                e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ProblemDetail invalid(MethodArgumentNotValidException e) {
        ProblemDetail p = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        p.setProperty("errors", e.getBindingResult().getFieldErrors().stream()
            .collect(toMap(FieldError::getField,
                           FieldError::getDefaultMessage)));
        return p;
    }
}

// The controller goes back to one line, and every endpoint reports a
// missing order the same way.
//
// ProblemDetail is the RFC 7807 type built into Spring 6 - a
// standard error shape, so clients need no bespoke parsing.
// Exception handling has its own module later; the point here is
// only that the try/catch does not belong in the controller.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does <code>@Controller</code> add over <code>@Component</code>?</td><td>It marks the class for <code>RequestMappingHandlerMapping</code> to scan for handler methods. Without it the mappings are never registered.</td></tr>
<tr><td><code>@Controller</code> vs <code>@RestController</code>?</td><td><code>@RestController</code> is <code>@Controller</code> + <code>@ResponseBody</code>. Return values become the response body instead of a view name.</td></tr>
<tr><td>What is "Circular view path"?</td><td>A <code>@Controller</code> method returned a <code>String</code> that Spring treated as a view name, found no view, and forwarded back to the same URL. It means a missing <code>@ResponseBody</code>.</td></tr>
<tr><td>Endpoint returns 404 but the method exists - why?</td><td>Usually the class carries <code>@Component</code> instead of <code>@Controller</code>, or its package is not scanned.</td></tr>
<tr><td>Should a controller return an entity?</td><td>No. It couples the JSON contract to the schema, leaks internal fields, and serialises lazy proxies outside the transaction. Use a response DTO or record.</td></tr>
<tr><td>What is <code>spring.jpa.open-in-view</code>?</td><td>Boot's default-on setting that keeps the persistence session open through view rendering. It hides lazy-loading errors by turning them into per-request extra queries; set it to <code>false</code>.</td></tr>
<tr><td>Should <code>@Transactional</code> go on a controller?</td><td>No. The transaction would remain open during response serialisation, holding a connection for the duration of a slow client.</td></tr>
<tr><td>What causes "Ambiguous mapping"?</td><td>Two handler methods matching the same path and method. Path variable names and parameter types do not disambiguate - routing happens before binding.</td></tr>
<tr><td>How do you inspect registered mappings?</td><td><code>/actuator/mappings</code>, or <code>TRACE</code> logging on <code>RequestMappingHandlerMapping</code>.</td></tr>
<tr><td>Where does exception handling belong?</td><td>In <code>@RestControllerAdvice</code> with <code>@ExceptionHandler</code> methods, so every controller maps the same failure the same way. <code>ProblemDetail</code> (RFC 7807) is the built-in response shape.</td></tr>
</table>`
        }
    ]
};
