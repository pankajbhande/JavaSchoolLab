// Spring extras, batch smvc15 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc15Extras: Record<string, Extra> = {
    'mvc-exceptionhandler': x(
        ['<b>@ExceptionHandler</b> marks a controller method that handles exceptions thrown by handler methods, so you can turn an exception into a response.',
            '<b>Scope</b>: declared inside a controller it applies only to that controller; declared in a <code>@ControllerAdvice</code> class it applies to all controllers.',
            '<b>Arguments</b>: the method can take the exception, <code>HttpServletRequest</code>, <code>Model</code> and similar, and can return a view, a body or a <code>ResponseEntity</code>.'],
        ['<b>Most specific wins</b>: if several handlers match, Spring picks the one whose exception type is closest to the thrown type.',
            '<b>Status</b>: add <code>@ResponseStatus</code> or return <code>ResponseEntity</code>, otherwise a handled exception answers with 200.',
            '<b>Several types</b>: <code>@ExceptionHandler({A.class, B.class})</code> maps many exceptions to one method.'],
        ['<b>Resolver</b>: <code>ExceptionHandlerExceptionResolver</code> finds and calls the method through <code>HandlerMethod</code> machinery.',
            '<b>Cause matching</b>: Spring also tries the cause of a wrapped exception when no handler matches the outer one.',
            '<b>Thrown after the response is committed</b>: the handler cannot change the status any more.'],
        [['F', 'What does @ExceptionHandler do?', 'It declares a method that handles a given exception type thrown by controller methods.'],
            ['F', 'Which exception types can it list?', 'One or more, as in @ExceptionHandler({A.class, B.class}); without a value it uses the method parameter type.'],
            ['M', 'Which handler is picked when two match?', 'The one with the closest exception type in the class hierarchy.'],
            ['M', 'Why does my handled error return 200?', 'A handler returning a body does not set an error status; add @ResponseStatus or use ResponseEntity.'],
            ['S', 'Which component invokes the method?', 'ExceptionHandlerExceptionResolver, the first resolver in the DispatcherServlet chain.'],
            ['S', 'Does a controller-local handler see exceptions from other controllers?', 'No; use @ControllerAdvice for that.']],
        [['Local handler in a controller.',
            r`@RestController
class OrderController {
    @GetMapping("/orders/{id}")
    String get(@PathVariable int id) {
        if (id > 100) throw new IllegalArgumentException("bad id " + id);
        return "order " + id;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    String bad(IllegalArgumentException ex) {
        return "Error: " + ex.getMessage();
    }
}

// OUTPUT:
// GET /orders/500  ->  400 Bad Request   body: Error: bad id 500`],
            ['Handle two exceptions with one method.',
                r`@ExceptionHandler({IllegalStateException.class, NullPointerException.class})
ResponseEntity<String> server(Exception ex) {
    return ResponseEntity.status(500).body("Server problem: " + ex.getClass().getSimpleName());
}

// OUTPUT:
// 500 Internal Server Error   body: Server problem: IllegalStateException`]],
        [['Test the handler with MockMvc.',
            r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void badIdGives400() throws Exception {
        mvc.perform(get("/orders/500"))
           .andExpect(status().isBadRequest())
           .andExpect(content().string("Error: bad id 500"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Return a view from a handler (MVC page).',
                r`@Controller
class PageController {
    @ExceptionHandler(MissingResourceException.class)
    String missing(Model model) {
        model.addAttribute("msg", "Resource not found");
        return "error";            // renders error.html
    }
}

// OUTPUT:
// the error view is rendered with msg = Resource not found`]]
    ),
    'mvc-controlleradvice': x(
        ['<b>@ControllerAdvice</b> is a Spring component that shares <code>@ExceptionHandler</code>, <code>@ModelAttribute</code> and <code>@InitBinder</code> methods across many controllers.',
            '<b>Purpose</b>: keep error handling in one class instead of copying it into every controller.',
            '<b>Registration</b>: it is a <code>@Component</code>, so component scanning finds it; no other configuration is needed.'],
        ['<b>Narrowing</b>: use <code>basePackages</code>, <code>assignableTypes</code> or <code>annotations</code> to limit which controllers are advised.',
            '<b>Ordering</b>: several advices are ordered with <code>@Order</code>; the lowest value is asked first.',
            '<b>REST</b>: <code>@RestControllerAdvice</code> is <code>@ControllerAdvice</code> plus <code>@ResponseBody</code>.'],
        ['<b>Discovery</b>: <code>ExceptionHandlerExceptionResolver</code> collects all advice beans through <code>ControllerAdviceBean</code> at startup.',
            '<b>Lookup order</b>: handlers in the controller come first, then the advice beans by order.',
            '<b>Advices for requests</b>: <code>RequestBodyAdvice</code> and <code>ResponseBodyAdvice</code> are separate hooks that also use this annotation.'],
        [['F', 'What is @ControllerAdvice?', 'A class whose handler methods apply to many controllers, mostly used for global exception handling.'],
            ['F', 'Can it do more than exceptions?', 'Yes, it can also hold @ModelAttribute and @InitBinder methods.'],
            ['M', 'How do you limit it to some controllers?', 'Use basePackages, assignableTypes or annotations attributes.'],
            ['M', 'How do you order two advices?', 'Put @Order or implement Ordered; lower values win first.'],
            ['S', 'Controller handler or advice handler first?', 'A matching handler in the controller itself is tried before advice beans.'],
            ['S', 'Difference from a servlet Filter?', 'Advice sees only exceptions from handler methods inside MVC; a filter runs outside it, before the DispatcherServlet.']],
        [['A shared advice class.',
            r`@ControllerAdvice
class WebAdvice {
    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    String notFound(NoSuchElementException ex) {
        return "Not found: " + ex.getMessage();
    }
}

// OUTPUT:
// any controller throwing NoSuchElementException answers 404 with the message`],
            ['Limit the advice to one package.',
                r`@ControllerAdvice(basePackages = "com.shop.admin")
class AdminAdvice {
    @ModelAttribute("appName")
    String appName() { return "Shop Admin"; }
}

// OUTPUT:
// controllers in com.shop.admin get model attribute appName = Shop Admin`]],
        [['Two ordered advices.',
            r`@Order(1)
@ControllerAdvice
class FirstAdvice { /* specific handlers */ }

@Order(2)
@ControllerAdvice
class FallbackAdvice {
    @ExceptionHandler(Exception.class)
    @ResponseBody
    String any(Exception e) { return "fallback"; }
}

// OUTPUT:
// specific handlers in FirstAdvice win; everything else reaches FallbackAdvice`],
            ['Test that advice applies (slice test).',
                r`@WebMvcTest(controllers = ItemController.class)
@Import(WebAdvice.class)
class AdviceTest {
    @Autowired MockMvc mvc;
    @Test void notFound() throws Exception {
        mvc.perform(get("/items/9")).andExpect(status().isNotFound());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-restcontrolleradvice': x(
        ['<b>@RestControllerAdvice</b> is a global advice class whose handler methods write their return value straight to the response body (it equals <code>@ControllerAdvice</code> + <code>@ResponseBody</code>).',
            '<b>Use</b>: build JSON error responses for REST APIs in one place.',
            '<b>Return types</b>: a plain object, a <code>ResponseEntity</code>, or <code>ProblemDetail</code> are all serialized by message converters.'],
        ['<b>Status codes</b>: set them with <code>@ResponseStatus</code> or <code>ResponseEntity</code>, otherwise the status is 200.',
            '<b>ProblemDetail</b>: Spring Framework 6 supports RFC 7807 style bodies through the <code>ProblemDetail</code> class.',
            '<b>ResponseEntityExceptionHandler</b>: extend it to get ready handlers for standard MVC exceptions.'],
        ['<b>Content negotiation</b>: the body is written by an <code>HttpMessageConverter</code>, chosen from the Accept header.',
            '<b>No view resolution</b>: because of <code>@ResponseBody</code>, a returned String is the body, not a view name.',
            '<b>Selectors</b>: the same <code>basePackages</code> and <code>annotations</code> filters as in <code>@ControllerAdvice</code>.'],
        [['F', 'What is @RestControllerAdvice?', 'A global exception-handling class for REST controllers that returns data as the response body.'],
            ['F', 'How does it differ from @ControllerAdvice?', 'It adds @ResponseBody, so returned values are serialized instead of resolved as views.'],
            ['M', 'How do you return a 404 JSON error?', 'Handle the exception and return ResponseEntity.status(404).body(errorObject).'],
            ['M', 'What is ProblemDetail?', 'A Spring 6 class representing the RFC 7807 problem body: type, title, status, detail, instance.'],
            ['S', 'Why extend ResponseEntityExceptionHandler?', 'It already maps standard MVC exceptions to responses and gives one place to customise them.'],
            ['S', 'What if two handlers match the same exception in different advices?', 'The advice with the higher precedence (lower @Order) is used.']],
        [['JSON error with ResponseEntity.',
            r`record ApiError(int status, String message) {}

@RestControllerAdvice
class ApiAdvice {
    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<ApiError> notFound(NoSuchElementException ex) {
        return ResponseEntity.status(404).body(new ApiError(404, ex.getMessage()));
    }
}

// OUTPUT:
// HTTP/1.1 404
// {"status":404,"message":"user 7 not found"}`],
            ['ProblemDetail response.',
                r`@ExceptionHandler(IllegalArgumentException.class)
ProblemDetail bad(IllegalArgumentException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_REQUEST, ex.getMessage());
    pd.setTitle("Invalid request");
    return pd;
}

// OUTPUT:
// HTTP/1.1 400
// {"type":"about:blank","title":"Invalid request","status":400,"detail":"age < 0"}`]],
        [['Test the JSON body.',
            r`@WebMvcTest(UserController.class)
@Import(ApiAdvice.class)
class ApiAdviceTest {
    @Autowired MockMvc mvc;
    @Test void notFoundJson() throws Exception {
        mvc.perform(get("/users/7"))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.status").value(404));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Advice for annotated controllers only.',
                r`@RestControllerAdvice(annotations = RestController.class)
class OnlyRestAdvice {
    @ExceptionHandler(Exception.class)
    Map<String, String> any(Exception e) {
        return Map.of("error", e.getClass().getSimpleName());
    }
}

// OUTPUT:
// {"error":"IllegalStateException"} for @RestController classes only`]]
    ),
    'mvc-global-exception-handling': x(
        ['<b>Global exception handling</b> means one central place that converts every uncaught exception from controllers into a proper HTTP response.',
            '<b>Tools</b>: <code>@ControllerAdvice</code> with <code>@ExceptionHandler</code> methods is the standard way; <code>HandlerExceptionResolver</code> is the low-level mechanism.',
            '<b>Benefit</b>: controllers stay free of try/catch, and all errors share one format and one logging policy.'],
        ['<b>Layers</b>: specific handlers (business, validation) first, then a catch-all <code>Exception</code> handler returning 500.',
            '<b>Do not leak</b>: never return stack traces or internal messages to the client; log them instead.',
            '<b>Errors outside MVC</b>: filter errors and 404 for unknown URLs are handled by the servlet container or Boot error page, not by advice (unless configured).'],
        ['<b>Chain</b>: <code>DispatcherServlet</code> asks <code>ExceptionHandlerExceptionResolver</code>, then <code>ResponseStatusExceptionResolver</code>, then <code>DefaultHandlerExceptionResolver</code>.',
            '<b>Fallback</b>: if nothing resolves the exception it is rethrown and the container forwards to <code>/error</code>.',
            '<b>Boot</b>: <code>BasicErrorController</code> serves that fallback as JSON or HTML.'],
        [['F', 'Why handle exceptions globally?', 'To avoid repeated try/catch code and return consistent error responses.'],
            ['F', 'Which annotation is the usual tool?', '@ControllerAdvice or @RestControllerAdvice with @ExceptionHandler methods.'],
            ['M', 'Should you add a catch-all handler?', 'Yes, for Exception, returning 500 with a safe message and logging the real cause.'],
            ['M', 'Why not return ex.getMessage() always?', 'It may expose internal details such as SQL or file paths.'],
            ['S', 'Which resolvers does Spring MVC try, in order?', 'ExceptionHandlerExceptionResolver, ResponseStatusExceptionResolver, then DefaultHandlerExceptionResolver.'],
            ['S', 'Does advice catch a 404 for an unknown URL?', 'Not by default in the old setup; from Spring 6.1 a NoResourceFoundException is raised and can be handled.']],
        [['A layered global handler.',
            r`@RestControllerAdvice
class GlobalHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalHandler.class);

    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<Map<String, String>> notFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> other(Exception e) {
        log.error("Unhandled", e);
        return ResponseEntity.status(500).body(Map.of("error", "Internal error"));
    }
}

// OUTPUT:
// 404 {"error":"user 7 not found"}
// 500 {"error":"Internal error"}   (stack trace goes to the log only)`],
            ['Controller stays clean.',
                r`@GetMapping("/users/{id}")
User get(@PathVariable long id) {
    return repo.findById(id).orElseThrow();   // no try/catch needed
}

// OUTPUT:
// unknown id -> NoSuchElementException -> handled globally -> 404`]],
        [['Verify the catch-all.',
            r`@Test
void unexpectedErrorGives500() throws Exception {
    when(service.load()).thenThrow(new RuntimeException("db down"));
    mvc.perform(get("/data"))
       .andExpect(status().isInternalServerError())
       .andExpect(jsonPath("$.error").value("Internal error"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Trace id for support.',
                r`@ExceptionHandler(Exception.class)
ResponseEntity<Map<String, String>> other(Exception e) {
    String id = UUID.randomUUID().toString();
    log.error("error id {}", id, e);
    return ResponseEntity.status(500).body(Map.of("traceId", id));
}

// OUTPUT: (varies)
// 500 {"traceId":"3f1c9a52-..."}`]]
    ),
    'mvc-handlerexceptionresolver-exceptions': x(
        ['<b>HandlerExceptionResolver</b> is the Spring MVC interface with one method, <code>resolveException</code>, that turns an exception into a <code>ModelAndView</code> (or an empty one if it wrote the response).',
            '<b>Built-in</b>: <code>ExceptionHandlerExceptionResolver</code>, <code>ResponseStatusExceptionResolver</code>, <code>DefaultHandlerExceptionResolver</code>.',
            '<b>Role</b>: the <code>DispatcherServlet</code> calls the resolvers in order until one returns non-null.'],
        ['<b>Return value</b>: returning <code>null</code> means "not mine, try the next resolver".',
            '<b>Custom resolver</b>: implement the interface and register it as a bean, or add it through <code>WebMvcConfigurer.extendHandlerExceptionResolvers</code>.',
            '<b>SimpleMappingExceptionResolver</b>: maps exception class names to view names, handy for classic pages.'],
        ['<b>Composite</b>: Spring builds a <code>HandlerExceptionResolverComposite</code> holding the list.',
            '<b>Ordering</b>: custom resolvers with <code>Ordered</code> run by their order value.',
            '<b>Prefer annotations</b>: most code needs only <code>@ExceptionHandler</code>, which is built on this interface.'],
        [['F', 'What is HandlerExceptionResolver?', 'An interface that resolves exceptions thrown during handler execution into a response or view.'],
            ['F', 'What does returning null mean?', 'This resolver does not handle it; the next one is tried.'],
            ['M', 'Name the default resolvers.', 'ExceptionHandlerExceptionResolver, ResponseStatusExceptionResolver and DefaultHandlerExceptionResolver.'],
            ['M', 'What does ResponseStatusExceptionResolver do?', 'It handles @ResponseStatus on exceptions and ResponseStatusException.'],
            ['S', 'When write a custom resolver instead of advice?', 'For cross-cutting needs outside annotation style, such as framework code or legacy view mapping.'],
            ['S', 'What happens if no resolver handles the exception?', 'It is rethrown to the container, which dispatches to the error page.']],
        [['Custom resolver writing a response.',
            r`@Component
class LoggingResolver implements HandlerExceptionResolver, Ordered {
    public ModelAndView resolveException(HttpServletRequest req,
            HttpServletResponse res, Object handler, Exception ex) {
        if (!(ex instanceof IllegalStateException)) return null;  // not mine
        res.setStatus(HttpServletResponse.SC_CONFLICT);
        return new ModelAndView();     // empty: response is complete
    }
    public int getOrder() { return Ordered.HIGHEST_PRECEDENCE; }
}

// OUTPUT:
// IllegalStateException from a controller -> HTTP 409, empty body`],
            ['Map exceptions to views.',
                r`@Bean
SimpleMappingExceptionResolver mapping() {
    var r = new SimpleMappingExceptionResolver();
    Properties p = new Properties();
    p.setProperty("java.sql.SQLException", "dbError");
    r.setExceptionMappings(p);
    r.setDefaultErrorView("error");
    return r;
}

// OUTPUT:
// SQLException -> view dbError; any other exception -> view error`]],
        [['List the resolvers at runtime.',
            r`@Autowired HandlerExceptionResolver resolver;   // the composite

@Test void show() {
    System.out.println(resolver.getClass().getSimpleName());
}

// OUTPUT:
// HandlerExceptionResolverComposite`],
            ['Test a custom resolver directly.',
                r`@Test void resolver409() {
    var res = new MockHttpServletResponse();
    new LoggingResolver().resolveException(
        new MockHttpServletRequest(), res, null, new IllegalStateException());
    assertEquals(409, res.getStatus());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-custom-error-pages': x(
        ['<b>Custom error pages</b> are friendly views shown for HTTP errors (404, 500) instead of the default container or whitelabel page.',
            '<b>Spring Boot way</b>: place <code>error/404.html</code>, <code>error/500.html</code> or <code>error/4xx.html</code> under <code>templates</code> or <code>static</code>.',
            '<b>Mechanism</b>: the container forwards the failed request to <code>/error</code>, which Boot serves with <code>BasicErrorController</code>.'],
        ['<b>Lookup order</b>: an exact code file (<code>404.html</code>) beats a series file (<code>4xx.html</code>).',
            '<b>Model attributes</b>: error templates can read <code>status</code>, <code>error</code>, <code>path</code> and <code>timestamp</code>.',
            '<b>Whitelabel</b>: switch it off with <code>server.error.whitelabel.enabled=false</code> only if you supply your own page.'],
        ['<b>ErrorViewResolver</b>: <code>DefaultErrorViewResolver</code> turns the status into a view name like <code>error/404</code>.',
            '<b>ErrorAttributes</b>: <code>DefaultErrorAttributes</code> collects the data; show message and trace with the <code>server.error.include-*</code> properties.',
            '<b>Content type</b>: <code>BasicErrorController</code> returns HTML for browsers and JSON for API clients.'],
        [['F', 'How do you show a custom 404 page in Boot?', 'Add error/404.html to the templates or static folder.'],
            ['F', 'What is the fallback file for all client errors?', 'error/4xx.html, and error/5xx.html for server errors.'],
            ['M', 'Which controller serves /error?', 'BasicErrorController.'],
            ['M', 'How do you hide details in production?', 'Keep server.error.include-stacktrace and include-message at never.'],
            ['S', 'How do you customise the model data?', 'Provide your own ErrorAttributes bean, for example by extending DefaultErrorAttributes.'],
            ['S', 'Why may a 404 page not appear in plain Spring MVC?', 'Without Boot you must register an error-page mapping in web.xml or the container configuration yourself.']],
        [['Template for 404.',
            r`<!-- src/main/resources/templates/error/404.html -->
<html xmlns:th="http://www.thymeleaf.org">
<body>
  <h1>Page not found</h1>
  <p th:text="'Path: ' + #{path}">path</p>
  <a href="/">Back to home</a>
</body>
</html>

// OUTPUT:
// GET /nothing  ->  404 page "Page not found" is shown`],
            ['Properties for errors.',
                r`# application.properties
server.error.whitelabel.enabled=false
server.error.include-message=never
server.error.include-stacktrace=never

# OUTPUT:
# unknown URL shows templates/error/404.html with no internal details`]],
        [['Test the error page.',
            r`@SpringBootTest
@AutoConfigureMockMvc
class ErrorPageTest {
    @Autowired MockMvc mvc;
    @Test void notFound() throws Exception {
        mvc.perform(get("/nothing"))
           .andExpect(status().isNotFound());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Own ErrorViewResolver.',
                r`@Bean
ErrorViewResolver resolver() {
    return (request, status, model) -> status == HttpStatus.FORBIDDEN
        ? new ModelAndView("error/no-access", model, status) : null;
}

// OUTPUT:
// 403 uses view error/no-access; other codes use the defaults`]]
    ),
    'mvc-http-error-responses': x(
        ['<b>HTTP error responses</b> tell the client a request failed: 4xx means the client made a mistake, 5xx means the server failed.',
            '<b>Common codes</b>: 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict, 422 unprocessable, 500 server error.',
            '<b>Ways to set them</b>: <code>@ResponseStatus</code>, <code>ResponseEntity</code>, <code>ResponseStatusException</code> or an exception handler.'],
        ['<b>ResponseStatusException</b>: throw <code>new ResponseStatusException(HttpStatus.NOT_FOUND, "no user")</code> for a quick error without a custom class.',
            '<b>@ResponseStatus</b> on an exception class gives it a fixed status and reason.',
            '<b>Pick the right code</b>: do not answer 200 with an error message in the body.'],
        ['<b>Resolver</b>: <code>ResponseStatusExceptionResolver</code> reads the annotation or exception and calls <code>sendError</code> or sets the status.',
            '<b>sendError</b>: it triggers the container error dispatch to <code>/error</code>, which adds the Boot JSON body.',
            '<b>ResponseEntity</b>: writes status and headers directly with no error dispatch.'],
        [['F', 'What does 4xx mean compared to 5xx?', '4xx means the client request is wrong; 5xx means the server failed.'],
            ['F', 'How do you return 404 from a controller?', 'Return ResponseEntity.notFound().build() or throw ResponseStatusException(NOT_FOUND).'],
            ['M', '401 or 403?', '401 means not authenticated; 403 means authenticated but not allowed.'],
            ['M', 'Which code for a duplicate record?', '409 Conflict.'],
            ['S', 'Difference between @ResponseStatus and ResponseEntity?', 'The annotation is fixed at compile time; ResponseEntity decides status, headers and body at runtime.'],
            ['S', 'Why can @ResponseStatus on an exception show an HTML page?', 'It uses sendError, so the container error dispatch renders the Boot error page.']],
        [['Status with ResponseStatusException.',
            r`@GetMapping("/users/{id}")
User get(@PathVariable long id) {
    return repo.findById(id).orElseThrow(() ->
        new ResponseStatusException(HttpStatus.NOT_FOUND, "user " + id));
}

// OUTPUT:
// HTTP/1.1 404
// {"timestamp":"...","status":404,"error":"Not Found","path":"/users/9"}`],
            ['Status on an exception class.',
                r`@ResponseStatus(value = HttpStatus.CONFLICT, reason = "Duplicate email")
class DuplicateEmailException extends RuntimeException {}

// OUTPUT:
// throwing it -> HTTP/1.1 409 Conflict`]],
        [['ResponseEntity with headers.',
            r`@PostMapping("/users")
ResponseEntity<User> create(@RequestBody User u) {
    User saved = service.save(u);
    return ResponseEntity.created(URI.create("/users/" + saved.id())).body(saved);
}

// OUTPUT:
// HTTP/1.1 201
// Location: /users/12`],
            ['Test the status code.',
                r`@Test void unknownUser() throws Exception {
    mvc.perform(get("/users/999"))
       .andExpect(status().isNotFound());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-custom-error-response': x(
        ['<b>Custom error response</b> is a fixed JSON shape (for example code, message, time, path) that every failure in your API returns.',
            '<b>Why</b>: clients can parse every error the same way instead of guessing between HTML, text and different JSON forms.',
            '<b>How</b>: define a small class or record and return it from <code>@RestControllerAdvice</code> handler methods.'],
        ['<b>Fields</b>: keep status, a machine-readable code, a human message, a timestamp and the path; add field errors for validation.',
            '<b>Standard</b>: <code>ProblemDetail</code> (RFC 7807) is the built-in standard shape; use it unless you have your own contract.',
            '<b>Safe messages</b>: never copy raw exception text from the database or framework.'],
        ['<b>Path</b>: take it from <code>HttpServletRequest.getRequestURI()</code> or <code>WebRequest.getDescription(false)</code>.',
            '<b>Dates</b>: Jackson with the Java time module writes <code>Instant</code> as ISO text when timestamps are disabled.',
            '<b>Boot errors</b>: for errors outside advice, customise <code>ErrorAttributes</code> so the shape matches.'],
        [['F', 'Why use a custom error body?', 'So every error from the API has the same structure that clients can rely on.'],
            ['F', 'Where do you create it?', 'In @RestControllerAdvice handler methods.'],
            ['M', 'What is ProblemDetail?', 'The Spring 6 representation of RFC 7807, with type, title, status, detail and instance.'],
            ['M', 'How do you add custom fields to ProblemDetail?', 'Use setProperty(name, value); they appear in the JSON.'],
            ['S', 'How do you keep Boot built-in errors in the same shape?', 'Provide a custom ErrorAttributes bean.'],
            ['S', 'Should the message come from the exception?', 'Only for exceptions you own; for unknown exceptions use a generic message and log the details.']],
        [['Record and handler.',
            r`record ErrorBody(Instant time, int status, String code,
                 String message, String path) {}

@RestControllerAdvice
class ErrorAdvice {
    @ExceptionHandler(NoSuchElementException.class)
    ResponseEntity<ErrorBody> nf(NoSuchElementException e, HttpServletRequest r) {
        var body = new ErrorBody(Instant.now(), 404, "NOT_FOUND",
                                 e.getMessage(), r.getRequestURI());
        return ResponseEntity.status(404).body(body);
    }
}

// OUTPUT: (varies)
// {"time":"2026-10-08T10:15:30Z","status":404,"code":"NOT_FOUND",
//  "message":"user 7 not found","path":"/users/7"}`],
            ['ProblemDetail with extra property.',
                r`@ExceptionHandler(DuplicateEmailException.class)
ProblemDetail dup(DuplicateEmailException e) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
    pd.setTitle("Duplicate email");
    pd.setProperty("email", e.getEmail());
    return pd;
}

// OUTPUT:
// {"type":"about:blank","title":"Duplicate email","status":409,"email":"a@b.com"}`]],
        [['Test the JSON shape.',
            r`@Test void shape() throws Exception {
    mvc.perform(get("/users/7"))
       .andExpect(status().isNotFound())
       .andExpect(jsonPath("$.code").value("NOT_FOUND"))
       .andExpect(jsonPath("$.path").value("/users/7"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Enable RFC 7807 for built-in MVC errors.',
                r`# application.properties
spring.mvc.problemdetails.enabled=true

# OUTPUT:
# standard MVC exceptions now answer with application/problem+json`]]
    ),
    'mvc-validation-exceptions': x(
        ['<b>Validation exceptions</b> are thrown when request data breaks constraints such as <code>@NotBlank</code> or <code>@Min</code>.',
            '<b>Body validation</b>: <code>@Valid @RequestBody</code> failing throws <code>MethodArgumentNotValidException</code>, which carries a <code>BindingResult</code>.',
            '<b>Parameter validation</b>: constraints on <code>@RequestParam</code> or <code>@PathVariable</code> need <code>@Validated</code> on the class and throw <code>ConstraintViolationException</code>.'],
        ['<b>Form binding</b>: for <code>@ModelAttribute</code> the exception is <code>BindException</code> unless you declare a <code>BindingResult</code> parameter right after.',
            '<b>Default status</b>: these exceptions give 400 Bad Request unless you handle them.',
            '<b>Collect errors</b>: loop over <code>getFieldErrors()</code> to build a field-to-message map.'],
        ['<b>Resolver</b>: <code>DefaultHandlerExceptionResolver</code> maps them to 400 if no handler exists.',
            '<b>Spring 6.1</b>: method validation raises <code>HandlerMethodValidationException</code> for controller parameters in newer setups.',
            '<b>Validator</b>: Hibernate Validator runs through <code>LocalValidatorFactoryBean</code>, and messages come from message bundles.'],
        [['F', 'Which exception does @Valid on a body throw?', 'MethodArgumentNotValidException.'],
            ['F', 'Which dependency is needed in Boot?', 'spring-boot-starter-validation.'],
            ['M', 'Why does @Min on a @RequestParam not work?', 'The controller class needs @Validated; failures then throw ConstraintViolationException.'],
            ['M', 'What does BindingResult hold?', 'The field errors and global errors from binding and validation.'],
            ['S', 'How do you stop the exception and handle errors in the method?', 'Put a BindingResult parameter directly after the @Valid argument.'],
            ['S', 'How do you return all errors at once?', 'Handle the exception in advice and collect getFieldErrors() into a map.']],
        [['Request DTO and controller.',
            r`record SignupRequest(@NotBlank String name,
                      @Email String email,
                      @Min(18) int age) {}

@PostMapping("/signup")
String signup(@Valid @RequestBody SignupRequest req) {
    return "ok";
}

// OUTPUT:
// body {"name":"","email":"x","age":10} -> MethodArgumentNotValidException -> 400`],
            ['Advice that lists field errors.',
                r`@ExceptionHandler(MethodArgumentNotValidException.class)
ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
    Map<String, String> errors = new LinkedHashMap<>();
    e.getBindingResult().getFieldErrors()
        .forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));
    return ResponseEntity.badRequest().body(errors);
}

// OUTPUT:
// 400 {"name":"must not be blank","email":"must be a well-formed email address",
//      "age":"must be greater than or equal to 18"}`]],
        [['Parameter constraints.',
            r`@Validated
@RestController
class ItemController {
    @GetMapping("/items")
    String list(@RequestParam @Min(1) int page) { return "page " + page; }
}

@ExceptionHandler(ConstraintViolationException.class)
ResponseEntity<String> cv(ConstraintViolationException e) {
    return ResponseEntity.badRequest().body(e.getMessage());
}

// OUTPUT:
// GET /items?page=0 -> 400  list.page: must be greater than or equal to 1`],
            ['Test invalid body.',
                r`@Test void invalid() throws Exception {
    mvc.perform(post("/signup").contentType("application/json")
            .content("{\"name\":\"\",\"email\":\"x\",\"age\":10}"))
       .andExpect(status().isBadRequest())
       .andExpect(jsonPath("$.name").exists());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),
    'mvc-business-exceptions': x(
        ['<b>Business exceptions</b> are your own exceptions that express a broken business rule, such as <code>InsufficientFundsException</code> or <code>OrderNotFoundException</code>.',
            '<b>Design</b>: extend <code>RuntimeException</code> so services stay free of <code>throws</code> clauses, and name them after the rule.',
            '<b>Mapping</b>: a global advice turns each business exception into a suitable HTTP status and message.'],
        ['<b>Hierarchy</b>: create a base <code>BusinessException</code> with a code, then subclasses; one handler can cover the whole family.',
            '<b>Transactions</b>: unchecked exceptions roll back a <code>@Transactional</code> method by default; checked ones do not.',
            '<b>Not for flow control</b>: do not use exceptions for ordinary branches that happen often.'],
        ['<b>Layers</b>: services throw domain exceptions, and only the web layer (advice) knows about HTTP statuses.',
            '<b>Cost</b>: creating a stack trace is the expensive part; for very hot paths override <code>fillInStackTrace</code> or use a constructor that disables it.',
            '<b>Message keys</b>: store an error code and look the text up from a message bundle for translation.'],
        [['F', 'What is a business exception?', 'A custom exception that signals a violated business rule.'],
            ['F', 'Checked or unchecked?', 'Usually unchecked, extending RuntimeException.'],
            ['M', 'Where do you convert it to HTTP?', 'In a @RestControllerAdvice, so services do not depend on web classes.'],
            ['M', 'Does it roll back a transaction?', 'Yes if unchecked, by default; checked exceptions need rollbackFor.'],
            ['S', 'How do you share one handler for many?', 'Make them subclasses of a base BusinessException and handle the base class.'],
            ['S', 'Why avoid putting HTTP status in the service?', 'It couples the domain to the web layer and makes the service harder to reuse and test.']],
        [['Exceptions and service.',
            r`class BusinessException extends RuntimeException {
    private final String code;
    BusinessException(String code, String msg) { super(msg); this.code = code; }
    String code() { return code; }
}

class InsufficientFundsException extends BusinessException {
    InsufficientFundsException(BigDecimal need) {
        super("INSUFFICIENT_FUNDS", "Need " + need + " more");
    }
}

// OUTPUT:
// thrown by the service when balance < amount`],
            ['Handler that maps by type.',
                r`@RestControllerAdvice
class BusinessAdvice {
    @ExceptionHandler(InsufficientFundsException.class)
    ResponseEntity<Map<String, String>> funds(InsufficientFundsException e) {
        return ResponseEntity.status(422)
            .body(Map.of("code", e.code(), "message", e.getMessage()));
    }
}

// OUTPUT:
// 422 {"code":"INSUFFICIENT_FUNDS","message":"Need 40.00 more"}`]],
        [['Service throwing the rule.',
            r`@Transactional
public void withdraw(long id, BigDecimal amt) {
    Account a = repo.findById(id).orElseThrow(() -> new AccountNotFoundException(id));
    if (a.balance().compareTo(amt) < 0)
        throw new InsufficientFundsException(amt.subtract(a.balance()));
    a.debit(amt);
}

// OUTPUT:
// rule broken -> exception -> transaction rolled back -> 422 response`],
            ['Test the service rule.',
                r`@Test void rejectsOverdraft() {
    assertThrows(InsufficientFundsException.class,
        () -> service.withdraw(1L, new BigDecimal("500")));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    )
};

export const smvc15Deep: Record<string, Deep> = {
    'mvc-exceptionhandler': dv(
        [`<p>How a handler is found and called:</p><ul><li><b>Catch:</b> <code>DispatcherServlet.processHandlerException</code> loops over its resolver list.</li><li><b>Resolver:</b> <code>ExceptionHandlerExceptionResolver</code> builds an <code>ExceptionHandlerMethodResolver</code> per controller class and caches it.</li><li><b>Matching:</b> it picks the mapped exception type with the shortest depth to the thrown class.</li><li><b>Invoke:</b> the method is run through <code>ServletInvocableHandlerMethod</code>, so argument resolvers and return value handlers work as in normal handlers.</li></ul>`,
            r`@RestController
class DemoController {
    @GetMapping("/boom")
    void boom() { throw new FileNotFoundException("a.txt"); }

    @ExceptionHandler(IOException.class)          // parent type
    String io(IOException e) { return "io"; }

    @ExceptionHandler(FileNotFoundException.class) // closest type wins
    String fnf(FileNotFoundException e) { return "fnf"; }
}

// OUTPUT:
// GET /boom -> fnf`],
        [`<p>Supported method arguments and results:</p><ul><li><b>Arguments:</b> the exception, <code>WebRequest</code>, <code>HttpServletRequest</code>, <code>HandlerMethod</code>, <code>Model</code>, <code>Locale</code>, <code>Principal</code>.</li><li><b>Not allowed:</b> <code>@RequestBody</code> and <code>BindingResult</code> are not available.</li><li><b>Results:</b> <code>String</code> view name, <code>ModelAndView</code>, <code>ResponseEntity</code>, a body object with <code>@ResponseBody</code>, or <code>void</code> when the response is written directly.</li></ul>`,
            r`@ExceptionHandler(IllegalStateException.class)
ResponseEntity<Map<String, Object>> state(IllegalStateException ex,
        HttpServletRequest req, Locale locale) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("path", req.getRequestURI());
    body.put("locale", locale.toString());
    body.put("message", ex.getMessage());
    return ResponseEntity.status(409).body(body);
}

// OUTPUT:
// 409 {"path":"/orders/5","locale":"en_US","message":"already shipped"}`],
        [`<p>Common mistakes:</p><ul><li><b>200 on error:</b> a handler that returns a body but no status answers 200; add <code>@ResponseStatus</code>.</li><li><b>Too broad:</b> a local handler for <code>Exception</code> hides specific advice handlers.</li><li><b>Ambiguous mapping:</b> two methods for the same exception type in one class cause an <code>IllegalStateException</code> at the first error.</li><li><b>Wrong scope:</b> expecting a controller-local handler to catch another controller exceptions.</li><li><b>Swallowed cause:</b> returning a message without logging the exception.</li></ul>`,
            r`// WRONG: two handlers for the same type in one class
@ExceptionHandler(IllegalArgumentException.class) String a(Exception e) { return "a"; }
@ExceptionHandler(IllegalArgumentException.class) String b(Exception e) { return "b"; }

// FIX: one method per exception type, set a status, log the cause
@ExceptionHandler(IllegalArgumentException.class)
@ResponseStatus(HttpStatus.BAD_REQUEST)
String bad(IllegalArgumentException e) {
    log.warn("bad input", e);
    return e.getMessage();
}

// OUTPUT:
// Ambiguous @ExceptionHandler method mapped for [class IllegalArgumentException]`],
        [`<p>Performance notes:</p><ul><li><b>Cheap lookup:</b> mappings are cached per class, so matching costs a map lookup.</li><li><b>Stack traces:</b> the cost of an error path is mostly building the trace; do not use exceptions for routine branches.</li><li><b>Logging:</b> log expected client errors at warn or debug without a trace, and unexpected ones at error with a trace.</li></ul>`,
            r`@ExceptionHandler(NotFoundException.class)
ResponseEntity<String> nf(NotFoundException e) {
    log.debug("not found: {}", e.getMessage());     // no trace for client errors
    return ResponseEntity.status(404).body(e.getMessage());
}

// A cheap exception for hot paths
class NotFoundException extends RuntimeException {
    NotFoundException(String m) { super(m, null, false, false); } // no trace

}

// OUTPUT:
// 404 with the message; no stack trace is built or logged`],
        [`<p>Scenario: an order API throws <code>OrderNotFoundException</code> from the service. The controller owns a handler for it that also records a metric. Other controllers use the global advice.</p>`,
            r`@RestController
@RequestMapping("/orders")
class OrderApi {
    private final MeterRegistry metrics;
    OrderApi(MeterRegistry m) { this.metrics = m; }

    @GetMapping("/{id}")
    Order get(@PathVariable long id) { return service.find(id); }

    @ExceptionHandler(OrderNotFoundException.class)
    ResponseEntity<Map<String, String>> missing(OrderNotFoundException e) {
        metrics.counter("orders.missing").increment();
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
}

// OUTPUT:
// GET /orders/99 -> 404 {"error":"order 99 not found"}; counter orders.missing = 1`]
    ),
    'mvc-controlleradvice': dv(
        [`<p>Startup and request flow:</p><ul><li><b>Scan:</b> <code>ControllerAdviceBean.findAnnotatedBeans</code> finds all beans annotated with <code>@ControllerAdvice</code>.</li><li><b>Sort:</b> they are ordered by <code>@Order</code> or <code>Ordered</code>.</li><li><b>Cache:</b> <code>ExceptionHandlerExceptionResolver</code> keeps an <code>ExceptionHandlerMethodResolver</code> per advice bean.</li><li><b>Request:</b> the controller class is checked first, then each advice whose selector matches the handler.</li></ul>`,
            r`@ControllerAdvice(annotations = RestController.class)
class SelectiveAdvice { }

// A bean method that shows which advices exist
@Autowired ApplicationContext ctx;
void show() {
    ControllerAdviceBean.findAnnotatedBeans(ctx)
        .forEach(b -> System.out.println(b.getBeanType().getSimpleName()
                                         + " order=" + b.getOrder()));
}

// OUTPUT:
// FirstAdvice order=1
// FallbackAdvice order=2
// SelectiveAdvice order=2147483647`],
        [`<p>Selectors and what the class can hold:</p><ul><li><b>basePackages / basePackageClasses:</b> choose by package.</li><li><b>assignableTypes:</b> choose by controller type or interface.</li><li><b>annotations:</b> choose controllers carrying an annotation.</li><li><b>Methods:</b> <code>@ExceptionHandler</code>, <code>@ModelAttribute</code>, <code>@InitBinder</code>.</li></ul>`,
            r`@ControllerAdvice(assignableTypes = {AdminController.class, ReportController.class})
class AdminAdvice {
    @InitBinder
    void trim(WebDataBinder binder) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }

    @ModelAttribute("serverTime")
    Instant now() { return Instant.now(); }
}

// OUTPUT: (varies)
// AdminController and ReportController get trimmed strings and model.serverTime`],
        [`<p>Common mistakes:</p><ul><li><b>Not scanned:</b> advice in a package outside component scanning is ignored.</li><li><b>Missing ResponseBody:</b> with <code>@ControllerAdvice</code> a returned String is a view name; use <code>@RestControllerAdvice</code> for JSON.</li><li><b>Order surprise:</b> a catch-all <code>Exception</code> handler with a high precedence hides specific ones.</li><li><b>Test slice:</b> <code>@WebMvcTest</code> loads advice automatically, but a plain standalone setup needs <code>setControllerAdvice</code>.</li></ul>`,
            r`// WRONG: returns a view name "Not found" -> template error
@ControllerAdvice
class Bad {
    @ExceptionHandler(NoSuchElementException.class)
    String nf() { return "Not found"; }
}

// FIX
@RestControllerAdvice
class Good {
    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    String nf() { return "Not found"; }
}

// OUTPUT:
// Bad  -> Error resolving template [Not found]
// Good -> 404 body: Not found`],
        [`<p>Performance notes:</p><ul><li><b>Singleton:</b> advice beans are created once and method lookup is cached.</li><li><b>Keep it light:</b> <code>@ModelAttribute</code> methods run for every request of the advised controllers, so avoid database calls there.</li><li><b>Selectors:</b> narrow scope so work is not repeated for unrelated controllers.</li></ul>`,
            r`@ControllerAdvice(basePackages = "com.shop.web")
class CommonModel {
    private final Supplier<List<String>> categories =
        Suppliers.memoizeWithExpiration(this::load, 5, TimeUnit.MINUTES);

    @ModelAttribute("categories")
    List<String> categories() { return categories.get(); }   // cached, not per request
    private List<String> load() { return repo.findAllNames(); }
}

// OUTPUT:
// one database call per 5 minutes instead of one per page view`],
        [`<p>Scenario: a company has a public API and an admin site. Two advices keep their error formats separate by package.</p>`,
            r`@RestControllerAdvice(basePackages = "com.acme.api")
class ApiErrors {
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> any(Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Server error"));
    }
}

@ControllerAdvice(basePackages = "com.acme.admin")
class AdminErrors {
    @ExceptionHandler(Exception.class)
    String any(Exception e, Model m) {
        m.addAttribute("msg", e.getMessage());
        return "admin/error";
    }
}

// OUTPUT:
// /api/** errors -> JSON 500; /admin/** errors -> rendered admin/error page`]
    ),
    'mvc-restcontrolleradvice': dv(
        [`<p>How it works:</p><ul><li><b>Meta-annotation:</b> <code>@RestControllerAdvice</code> carries <code>@ControllerAdvice</code> and <code>@ResponseBody</code>.</li><li><b>Handler:</b> the result goes through <code>RequestResponseBodyMethodProcessor</code>.</li><li><b>Converter:</b> the Accept header picks an <code>HttpMessageConverter</code>, usually Jackson.</li><li><b>Not acceptable:</b> if no converter matches, an error response cannot be written and a 406 may result.</li></ul>`,
            r`@RestControllerAdvice
class JsonAdvice {
    @ExceptionHandler(IllegalArgumentException.class)
    Map<String, String> bad(IllegalArgumentException e) {
        return Map.of("error", e.getMessage());
    }
}

// OUTPUT:
// Accept: application/json  -> {"error":"bad input"}
// Accept: text/html         -> 406 Not Acceptable (no converter for a Map)`],
        [`<p>Variants:</p><ul><li><b>ResponseEntity:</b> full control of status and headers.</li><li><b>ProblemDetail:</b> RFC 7807 body, content type <code>application/problem+json</code>.</li><li><b>ErrorResponse:</b> a Spring 6 interface that built-in exceptions implement, giving them a ProblemDetail.</li><li><b>ResponseEntityExceptionHandler:</b> base class with handlers for MVC exceptions.</li></ul>`,
            r`@RestControllerAdvice
class StandardAdvice extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, "Validation failed");
        return ResponseEntity.status(status).body(pd);
    }
}

// OUTPUT:
// 400 {"type":"about:blank","title":"Bad Request","status":400,
//      "detail":"Validation failed","instance":"/signup"}`],
        [`<p>Common mistakes:</p><ul><li><b>Two beans handle the same exception:</b> a class extending <code>ResponseEntityExceptionHandler</code> plus another advice with the same handler gives an ambiguous mapping error.</li><li><b>Returning 200:</b> forgetting the status.</li><li><b>Leaking text:</b> returning <code>e.toString()</code>.</li><li><b>Serialization failure:</b> returning an entity with lazy proxies; return a DTO.</li></ul>`,
            r`// WRONG: exposes internals and answers 200
@ExceptionHandler(Exception.class)
String all(Exception e) { return e.toString(); }

// FIX
@ExceptionHandler(Exception.class)
ResponseEntity<Map<String, String>> all(Exception e) {
    log.error("unhandled", e);
    return ResponseEntity.status(500).body(Map.of("error", "Internal error"));
}

// OUTPUT:
// before: 200 java.sql.SQLException: ... ; after: 500 {"error":"Internal error"}`],
        [`<p>Performance notes:</p><ul><li><b>Small bodies:</b> error records are cheap to serialize.</li><li><b>Reuse:</b> Jackson caches serializers per class, so use stable record types.</li><li><b>Log once:</b> log in the advice only, not again in the service, to avoid duplicate large traces.</li></ul>`,
            r`@ExceptionHandler(Exception.class)
ResponseEntity<ApiError> any(Exception e, HttpServletRequest req) {
    // one log line with the trace; services only wrap, never log
    log.error("{} {} failed", req.getMethod(), req.getRequestURI(), e);
    return ResponseEntity.status(500).body(new ApiError(500, "Internal error"));
}

// OUTPUT:
// ERROR GET /users/7 failed  java.lang.NullPointerException ... (one entry)`],
        [`<p>Scenario: a mobile client needs one error format for every endpoint, including validation errors.</p>`,
            r`record FieldIssue(String field, String message) {}
record ApiError(int status, String code, List<FieldIssue> issues) {}

@RestControllerAdvice
class MobileAdvice {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> invalid(MethodArgumentNotValidException e) {
        List<FieldIssue> list = e.getBindingResult().getFieldErrors().stream()
            .map(f -> new FieldIssue(f.getField(), f.getDefaultMessage())).toList();
        return ResponseEntity.badRequest().body(new ApiError(400, "VALIDATION", list));
    }
}

// OUTPUT:
// 400 {"status":400,"code":"VALIDATION",
//      "issues":[{"field":"email","message":"must be a well-formed email address"}]}`]
    ),
    'mvc-global-exception-handling': dv(
        [`<p>Resolution pipeline:</p><ul><li><b>1:</b> <code>ExceptionHandlerExceptionResolver</code> runs controller and advice <code>@ExceptionHandler</code> methods.</li><li><b>2:</b> <code>ResponseStatusExceptionResolver</code> handles <code>@ResponseStatus</code> and <code>ResponseStatusException</code>.</li><li><b>3:</b> <code>DefaultHandlerExceptionResolver</code> maps Spring exceptions to codes (for example 405, 415, 400).</li><li><b>4:</b> if none resolves, the exception propagates and the container dispatches to <code>/error</code>.</li></ul>`,
            r`// What each resolver does with typical exceptions
// HttpRequestMethodNotSupportedException -> 405   (Default resolver)
// HttpMediaTypeNotSupportedException     -> 415   (Default resolver)
// MissingServletRequestParameterException -> 400  (Default resolver)
// ResponseStatusException(NOT_FOUND)     -> 404   (ResponseStatus resolver)
// your own exception with a handler     -> any    (ExceptionHandler resolver)

// OUTPUT:
// resolvers are tried in this order until one returns a non-null result`],
        [`<p>Design options:</p><ul><li><b>Advice only:</b> simplest for REST.</li><li><b>Extend ResponseEntityExceptionHandler:</b> one hook covering all standard MVC exceptions.</li><li><b>Boot ErrorController:</b> covers errors that never reach MVC (filters, unknown paths).</li><li><b>Filter:</b> an outer filter can catch exceptions thrown by other filters.</li></ul>`,
            r`@RestControllerAdvice
class AllErrors extends ResponseEntityExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail denied(AccessDeniedException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Not allowed");
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail fallback(Exception e) {
        log.error("unhandled", e);
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
    }
}

// OUTPUT:
// standard MVC errors, 403 and 500 all share the ProblemDetail format`],
        [`<p>Common mistakes:</p><ul><li><b>Catch-all swallows security:</b> a handler for <code>Exception</code> also catches <code>AccessDeniedException</code> thrown inside controllers, turning 403 into 500; add a specific handler or rethrow.</li><li><b>Leaking details:</b> returning messages from unknown exceptions.</li><li><b>No logging:</b> handled errors vanish silently.</li><li><b>Different formats:</b> advice JSON but Boot errors HTML.</li></ul>`,
            r`// WRONG: security exceptions become 500
@ExceptionHandler(Exception.class)
ResponseEntity<String> any(Exception e) { return ResponseEntity.status(500).body("x"); }

// FIX: rethrow what other layers handle
@ExceptionHandler(Exception.class)
ResponseEntity<String> any(Exception e) throws Exception {
    if (e instanceof AccessDeniedException) throw e;     // security filter handles
    log.error("unhandled", e);
    return ResponseEntity.status(500).body("Internal error");
}

// OUTPUT:
// before: 500 for forbidden users; after: 403 from Spring Security`],
        [`<p>Performance and operations:</p><ul><li><b>Metrics:</b> count errors by status to alert on spikes.</li><li><b>Log levels:</b> client errors low level, server errors error level.</li><li><b>Rate of logs:</b> a flood of failing requests can fill disks; avoid full traces for expected errors.</li></ul>`,
            r`@ExceptionHandler(Exception.class)
ResponseEntity<Map<String, String>> other(Exception e, HttpServletRequest r) {
    registry.counter("http.errors", "status", "500").increment();
    log.error("{} {}", r.getMethod(), r.getRequestURI(), e);
    return ResponseEntity.status(500).body(Map.of("error", "Internal error"));
}

// OUTPUT:
// metric http.errors{status=500} increments once per failed request`],
        [`<p>Scenario: a team of ten developers adds endpoints daily. One global advice guarantees every error has the same JSON and gets logged.</p>`,
            r`@RestControllerAdvice
class PlatformErrors {
    @ExceptionHandler(BusinessException.class)
    ResponseEntity<Map<String, String>> biz(BusinessException e) {
        return ResponseEntity.unprocessableEntity()
            .body(Map.of("code", e.code(), "message", e.getMessage()));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> other(Exception e) {
        log.error("unhandled", e);
        return ResponseEntity.status(500).body(Map.of("code", "INTERNAL"));
    }
}

// OUTPUT:
// new endpoints need no error code; every failure keeps the same format`]
    ),
    'mvc-handlerexceptionresolver-exceptions': dv(
        [`<p>Inside the DispatcherServlet:</p><ul><li><b>Catch:</b> <code>doDispatch</code> catches the exception and calls <code>processHandlerException</code>.</li><li><b>Loop:</b> it calls each <code>HandlerExceptionResolver</code> in order.</li><li><b>Result:</b> the first non-null <code>ModelAndView</code> wins, even an empty one meaning the response is done.</li><li><b>Nothing:</b> if all return null the exception is rethrown.</li></ul>`,
            r`// Simplified view of DispatcherServlet logic
for (HandlerExceptionResolver resolver : this.handlerExceptionResolvers) {
    ModelAndView mv = resolver.resolveException(request, response, handler, ex);
    if (mv != null) {
        return mv;          // resolved (empty mv = response already written)
    }
}
throw ex;                   // not resolved: container error dispatch

// OUTPUT:
// order: ExceptionHandler -> ResponseStatus -> DefaultHandler -> (your custom by order)`],
        [`<p>Ways to plug in:</p><ul><li><b>Bean:</b> a <code>HandlerExceptionResolver</code> bean is picked up in Spring Boot and added to the list.</li><li><b>extendHandlerExceptionResolvers:</b> add to the list while keeping defaults.</li><li><b>configureHandlerExceptionResolvers:</b> replace the defaults completely (rarely wanted).</li><li><b>AbstractHandlerExceptionResolver:</b> base class with handler matching and <code>setOrder</code>.</li></ul>`,
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> list) {
        list.add(0, new AbstractHandlerExceptionResolver() {
            @Override
            protected ModelAndView doResolveException(HttpServletRequest rq,
                    HttpServletResponse rs, Object h, Exception ex) {
                if (ex instanceof TimeoutException) {
                    rs.setStatus(504);
                    return new ModelAndView();
                }
                return null;
            }
        });
    }
}

// OUTPUT:
// TimeoutException from a handler -> HTTP 504`],
        [`<p>Common mistakes:</p><ul><li><b>Returning an empty ModelAndView by habit:</b> it ends the chain; return null for exceptions you do not handle.</li><li><b>Resolver order:</b> a custom resolver added last never sees what built-in ones handled.</li><li><b>Replacing defaults:</b> <code>configureHandlerExceptionResolvers</code> removes <code>@ExceptionHandler</code> support.</li><li><b>Not seeing filter exceptions:</b> resolvers only see exceptions from the DispatcherServlet.</li></ul>`,
            r`// WRONG: swallows every exception with an empty response
public ModelAndView resolveException(HttpServletRequest rq, HttpServletResponse rs,
        Object h, Exception ex) {
    return new ModelAndView();
}

// FIX: handle only what you own
public ModelAndView resolveException(HttpServletRequest rq, HttpServletResponse rs,
        Object h, Exception ex) {
    if (!(ex instanceof TimeoutException)) return null;
    rs.setStatus(504);
    return new ModelAndView();
}

// OUTPUT:
// before: all errors answer 200 with an empty body; after: only timeouts are changed`],
        [`<p>Performance notes:</p><ul><li><b>Order:</b> put cheap, frequently matching resolvers first.</li><li><b>Exit early:</b> check <code>instanceof</code> before doing work.</li><li><b>Only on errors:</b> resolvers run only on the failure path, so they do not slow normal requests.</li></ul>`,
            r`public ModelAndView resolveException(HttpServletRequest rq, HttpServletResponse rs,
        Object h, Exception ex) {
    if (!(ex instanceof TimeoutException)) return null;   // exit early, cheap
    meter.counter("timeouts").increment();
    rs.setStatus(504);
    return new ModelAndView();
}

// OUTPUT:
// non-timeout exceptions pass through at the cost of one instanceof check`],
        [`<p>Scenario: a legacy module throws its own exceptions in places where annotations cannot be used (a third-party base controller). A resolver bean maps them.</p>`,
            r`@Component
class LegacyResolver implements HandlerExceptionResolver, Ordered {
    public ModelAndView resolveException(HttpServletRequest rq, HttpServletResponse rs,
            Object handler, Exception ex) {
        if (!(ex instanceof LegacyException le)) return null;
        ModelAndView mv = new ModelAndView("legacy-error");
        mv.addObject("code", le.getCode());
        mv.setStatus(HttpStatus.BAD_GATEWAY);
        return mv;
    }
    public int getOrder() { return 0; }
}

// OUTPUT:
// LegacyException -> 502 and view legacy-error with model code = E42`]
    ),
    'mvc-custom-error-pages': dv(
        [`<p>The error dispatch:</p><ul><li><b>1:</b> the controller throws, no resolver handles it, or <code>sendError</code> is called.</li><li><b>2:</b> the container forwards to <code>/error</code> (Boot registers an error page for it).</li><li><b>3:</b> <code>BasicErrorController</code> builds the model with <code>ErrorAttributes</code>.</li><li><b>4:</b> for HTML it asks <code>ErrorViewResolver</code> for a view; for other types it returns JSON.</li></ul>`,
            r`// Boot class names involved
// ErrorMvcAutoConfiguration   registers the beans
// BasicErrorController        handles /error
//   errorHtml()  -> text/html  -> ModelAndView (error/404 ...)
//   error()      -> other      -> ResponseEntity<Map> (JSON)
// DefaultErrorViewResolver     status -> "error/" + code or "error/4xx"

// OUTPUT:
// browser GET /missing -> 404 view; curl GET /missing -> {"status":404,...}`],
        [`<p>Configuration options:</p><ul><li><b>Files:</b> <code>templates/error/404.html</code>, <code>static/error/5xx.html</code>.</li><li><b>Own controller:</b> implement <code>ErrorController</code> and map <code>/error</code>.</li><li><b>Properties:</b> <code>server.error.path</code>, <code>include-message</code>, <code>include-binding-errors</code>, <code>include-stacktrace</code>, <code>include-exception</code>.</li><li><b>Plain Spring MVC:</b> register an error page in the container (<code>web.xml</code> or a Servlet registration).</li></ul>`,
            r`@Controller
class MyErrorController implements ErrorController {
    @RequestMapping("/error")
    String handle(HttpServletRequest request, Model model) {
        Object code = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        model.addAttribute("code", code);
        if (code != null && Integer.parseInt(code.toString()) == 404) return "errors/notfound";
        return "errors/general";
    }
}

// OUTPUT:
// 404 -> errors/notfound view; other codes -> errors/general view`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong folder:</b> <code>templates/404.html</code> is ignored; it must be under <code>error/</code>.</li><li><b>Secured /error:</b> with Spring Security, <code>/error</code> must be permitted or users see 401 instead of 404.</li><li><b>Details shown:</b> turning on trace output for production.</li><li><b>Static page uses model:</b> a static HTML file cannot read the error attributes.</li></ul>`,
            r`// WRONG: ignored
// src/main/resources/templates/404.html

// FIX: place it under error/
// src/main/resources/templates/error/404.html

// Security: allow the error dispatch
http.authorizeHttpRequests(a -> a
    .requestMatchers("/error").permitAll()
    .anyRequest().authenticated());

// OUTPUT:
// before: default whitelabel page; after: the custom 404 page, even for anonymous users`],
        [`<p>Performance notes:</p><ul><li><b>Static error pages</b> are the cheapest; use templates only when you need data.</li><li><b>Caching:</b> static error files can be cached by the browser.</li><li><b>Bots:</b> scanners hit many 404s; keep the error page light and avoid database calls.</li></ul>`,
            r`<!-- src/main/resources/static/error/404.html : no template engine cost -->
<!DOCTYPE html>
<html><body>
  <h1>404 - Page not found</h1>
  <a href="/">Home</a>
</body></html>

// OUTPUT:
// served as a plain file; no model building or template rendering`],
        [`<p>Scenario: an online shop wants a friendly 404 with search, a generic 5xx with a support code, and JSON for API clients.</p>`,
            r`<!-- templates/error/5xx.html -->
<html xmlns:th="http://www.thymeleaf.org"><body>
  <h1>Something went wrong</h1>
  <p>Quote reference: <span th:text="$` + r`{timestamp}">time</span></p>
</body></html>

# application.properties
server.error.include-message=never

// OUTPUT:
// browsers get the pages above; /api/** clients still receive JSON from BasicErrorController`]
    ),
    'mvc-http-error-responses': dv(
        [`<p>Three internal paths produce an error status:</p><ul><li><b>ResponseEntity or setStatus:</b> writes the status directly, the body is yours.</li><li><b>sendError (annotation or ResponseStatusException):</b> marks the response as error and the container dispatches to <code>/error</code>.</li><li><b>Exception resolvers:</b> the three default resolvers choose between these for each exception.</li></ul>`,
            r`// Comparison
// ResponseEntity.status(404).body(x)   -> body is x, no /error dispatch
// throw ResponseStatusException(404)   -> sendError -> /error -> Boot JSON body
// @ResponseStatus(404) on exception     -> sendError -> /error -> Boot JSON body
// RestControllerAdvice returning body   -> body is yours, status from the handler

// OUTPUT:
// pick ResponseEntity or advice when you must control the exact JSON`],
        [`<p>Useful status codes:</p><ul><li><b>400:</b> malformed or invalid request.</li><li><b>401 / 403:</b> not authenticated / not allowed.</li><li><b>404:</b> unknown resource.</li><li><b>405 / 415 / 406:</b> wrong method, content type, accept.</li><li><b>409:</b> state conflict, duplicates.</li><li><b>422:</b> semantically invalid data.</li><li><b>429:</b> too many requests.</li><li><b>500 / 502 / 503:</b> server, upstream, unavailable.</li></ul>`,
            r`@GetMapping("/stock/{id}")
ResponseEntity<Stock> stock(@PathVariable long id) {
    return repo.findById(id)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
}

@PostMapping("/limit")
ResponseEntity<Void> limited() {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header("Retry-After", "30").build();
}

// OUTPUT:
// GET /stock/9   -> 404 (empty body)
// POST /limit    -> 429 with header Retry-After: 30`],
        [`<p>Common mistakes:</p><ul><li><b>200 with error text:</b> clients and monitoring cannot see the failure.</li><li><b>500 for client mistakes:</b> missing parameter handled by a catch-all gives 500 instead of 400.</li><li><b>401 vs 403 mixed up.</b></li><li><b>ResponseStatus with reason:</b> the reason uses sendError and may replace your JSON body.</li></ul>`,
            r`// WRONG
@GetMapping("/u/{id}")
Map<String, String> get(@PathVariable long id) {
    return Map.of("error", "not found");      // status is 200
}

// FIX
@GetMapping("/u/{id}")
ResponseEntity<Map<String, String>> get(@PathVariable long id) {
    return ResponseEntity.status(404).body(Map.of("error", "not found"));
}

// OUTPUT:
// before: HTTP 200 with an error text; after: HTTP 404`],
        [`<p>Performance and caching notes:</p><ul><li><b>Cheap errors:</b> return early with a status and no heavy body.</li><li><b>Retry-After:</b> tell clients when to try again for 429 and 503 to reduce retry storms.</li><li><b>Cache:</b> 404 and 410 responses can carry cache headers when the answer is stable.</li></ul>`,
            r`@GetMapping("/old/{id}")
ResponseEntity<Void> gone(@PathVariable long id) {
    return ResponseEntity.status(HttpStatus.GONE)
        .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS))
        .build();
}

// OUTPUT:
// HTTP/1.1 410
// Cache-Control: max-age=86400`],
        [`<p>Scenario: a payments API must return distinct codes so mobile apps can react.</p>`,
            r`@PostMapping("/pay")
ResponseEntity<?> pay(@Valid @RequestBody PayRequest req) {
    if (service.isDuplicate(req.key()))
        return ResponseEntity.status(409).body(Map.of("code", "DUPLICATE"));
    if (!service.hasFunds(req))
        return ResponseEntity.status(422).body(Map.of("code", "NO_FUNDS"));
    return ResponseEntity.status(201).body(service.pay(req));
}

// OUTPUT:
// duplicate -> 409, no funds -> 422, success -> 201; invalid body -> 400 (from @Valid)`]
    ),
    'mvc-custom-error-response': dv(
        [`<p>Where the body comes from:</p><ul><li><b>Handler return value:</b> your record is serialized by Jackson.</li><li><b>Boot fallback:</b> <code>DefaultErrorAttributes</code> builds a map with timestamp, status, error, path.</li><li><b>ErrorResponse:</b> Spring 6 exceptions like <code>MethodArgumentNotValidException</code> implement it and expose a <code>ProblemDetail</code>.</li><li><b>RFC 7807:</b> the media type is <code>application/problem+json</code>.</li></ul>`,
            r`// Spring 6 built-in: exceptions know their ProblemDetail
// MethodArgumentNotValidException implements ErrorResponse
//   getStatusCode()    -> 400
//   getBody()          -> ProblemDetail (title, detail)

@ExceptionHandler(MethodArgumentNotValidException.class)
ProblemDetail invalid(MethodArgumentNotValidException e) {
    return e.getBody();     // reuse the built-in body
}

// OUTPUT:
// {"type":"about:blank","title":"Bad Request","status":400,
//  "detail":"Invalid request content.","instance":"/signup"}`],
        [`<p>Variants:</p><ul><li><b>Record:</b> a plain record for your own contract.</li><li><b>ProblemDetail:</b> standard, supports extra properties.</li><li><b>Boot ErrorAttributes:</b> change what the default error JSON contains.</li><li><b>Locale text:</b> use <code>MessageSource</code> to translate messages.</li></ul>`,
            r`@Component
class CustomErrorAttributes extends DefaultErrorAttributes {
    @Override
    public Map<String, Object> getErrorAttributes(WebRequest req,
            ErrorAttributeOptions options) {
        Map<String, Object> m = super.getErrorAttributes(req, options);
        m.put("service", "orders-api");
        m.remove("trace");
        return m;
    }
}

// OUTPUT:
// {"timestamp":"...","status":500,"error":"Internal Server Error",
//  "path":"/x","service":"orders-api"}`],
        [`<p>Common mistakes:</p><ul><li><b>Several shapes:</b> advice returns one format, but Boot defaults return another.</li><li><b>Instant as number:</b> without ISO settings the time is a number; set <code>spring.jackson.serialization.write-dates-as-timestamps=false</code>.</li><li><b>Null noise:</b> fields set to null clutter the JSON; use <code>@JsonInclude(NON_NULL)</code>.</li><li><b>Untranslated messages</b> for international users.</li></ul>`,
            r`// WRONG: null fields clutter the JSON, time is a number
record ErrorBody(Instant time, String code, List<String> issues) {}
// {"time":1791454530.123,"code":"X","issues":null}

// FIX
@JsonInclude(JsonInclude.Include.NON_NULL)
record ErrorBody(Instant time, String code, List<String> issues) {}
// application.properties: spring.jackson.serialization.write-dates-as-timestamps=false

// OUTPUT:
// {"time":"2026-10-08T10:15:30.123Z","code":"X"}`],
        [`<p>Performance notes:</p><ul><li><b>Small records</b> serialize quickly.</li><li><b>Avoid heavy fields:</b> never embed entities, collections or stack traces.</li><li><b>Static messages:</b> look up message bundles once per locale, which Spring caches.</li></ul>`,
            r`@ExceptionHandler(BusinessException.class)
ResponseEntity<ErrorBody> biz(BusinessException e, Locale locale) {
    String text = messages.getMessage(e.code(), null, e.getMessage(), locale);
    return ResponseEntity.unprocessableEntity()
        .body(new ErrorBody(Instant.now(), e.code(), text));
}

// OUTPUT:
// Accept-Language: de -> {"code":"NO_FUNDS","message":"Nicht genug Guthaben"}`],
        [`<p>Scenario: front-end developers want one JSON contract documented in the API spec, with a trace id to quote when raising support tickets.</p>`,
            r`@RestControllerAdvice
class ContractAdvice {
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> any(Exception e, HttpServletRequest r) {
        String traceId = MDC.get("traceId");
        log.error("failed {}", traceId, e);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 500);
        body.put("code", "INTERNAL");
        body.put("traceId", traceId);
        body.put("path", r.getRequestURI());
        return ResponseEntity.status(500).body(body);
    }
}

// OUTPUT: (varies)
// {"status":500,"code":"INTERNAL","traceId":"a91c...","path":"/orders"}`]
    ),
    'mvc-validation-exceptions': dv(
        [`<p>Where each exception comes from:</p><ul><li><b>@RequestBody:</b> <code>RequestResponseBodyMethodProcessor</code> validates after reading the body and throws <code>MethodArgumentNotValidException</code>.</li><li><b>@ModelAttribute:</b> <code>ModelAttributeMethodProcessor</code> throws <code>BindException</code> (or <code>MethodArgumentNotValidException</code> in Spring 6) when no BindingResult follows.</li><li><b>@Validated class:</b> an AOP proxy with <code>MethodValidationInterceptor</code> throws <code>ConstraintViolationException</code>.</li><li><b>Bad JSON:</b> <code>HttpMessageNotReadableException</code>, also a 400.</li></ul>`,
            r`// Which exception for which input
// POST {"age":"abc"}            -> HttpMessageNotReadableException (400)
// POST {"age":5} with @Min(18)  -> MethodArgumentNotValidException (400)
// GET /items?page=0 @Min(1)     -> ConstraintViolationException (400 if handled)
//   (without a handler it becomes 500!)

// OUTPUT:
// ConstraintViolationException is not mapped by default and gives 500`],
        [`<p>Useful options:</p><ul><li><b>Groups:</b> validate different rules for create and update with <code>@Validated(OnCreate.class)</code>.</li><li><b>Custom constraint:</b> an annotation plus a <code>ConstraintValidator</code>.</li><li><b>Cascade:</b> put <code>@Valid</code> on nested fields.</li><li><b>Messages:</b> <code>ValidationMessages.properties</code> or a custom <code>MessageSource</code>.</li></ul>`,
            r`@Target(FIELD) @Retention(RUNTIME)
@Constraint(validatedBy = AdultValidator.class)
@interface Adult { String message() default "must be an adult";
    Class<?>[] groups() default {}; Class<? extends Payload>[] payload() default {}; }

class AdultValidator implements ConstraintValidator<Adult, LocalDate> {
    public boolean isValid(LocalDate dob, ConstraintValidatorContext c) {
        return dob == null || dob.plusYears(18).isBefore(LocalDate.now());
    }
}

record Member(@NotBlank String name, @Adult LocalDate dob) {}

// OUTPUT:
// dob in 2015 -> field error dob: must be an adult`],
        [`<p>Common mistakes:</p><ul><li><b>No starter:</b> constraints are silently ignored without <code>spring-boot-starter-validation</code>.</li><li><b>Missing @Valid:</b> the body is never checked.</li><li><b>Missing @Validated</b> for parameter constraints.</li><li><b>ConstraintViolationException unhandled:</b> becomes 500.</li><li><b>BindingResult in wrong place:</b> it must come right after the validated argument.</li><li><b>@NotNull on String:</b> use <code>@NotBlank</code> to reject empty text.</li></ul>`,
            r`// WRONG: BindingResult not directly after the model attribute
@PostMapping("/f")
String save(@Valid Form f, Model m, BindingResult br) { return "x"; }
// -> BindException is thrown

// FIX
@PostMapping("/f")
String save(@Valid Form f, BindingResult br, Model m) {
    return br.hasErrors() ? "form" : "redirect:/ok";
}

// OUTPUT:
// before: 400 error page; after: the form is shown again with field messages`],
        [`<p>Performance notes:</p><ul><li><b>Validator is thread-safe:</b> one shared instance is reused.</li><li><b>Order:</b> cheap checks first; avoid database lookups in constraints on hot endpoints.</li><li><b>Fail fast:</b> Hibernate Validator can stop at the first violation with <code>hibernate.validator.fail_fast</code>.</li></ul>`,
            r`@Bean
LocalValidatorFactoryBean validator() {
    var v = new LocalValidatorFactoryBean();
    v.getValidationPropertyMap().put("hibernate.validator.fail_fast", "true");
    return v;
}

// OUTPUT:
// only the first violation is reported; faster for large invalid payloads`],
        [`<p>Scenario: a signup form API returns all field errors to the front end in one response.</p>`,
            r`@RestControllerAdvice
class ValidationAdvice extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders h,
            HttpStatusCode status, WebRequest req) {
        Map<String, List<String>> errors = new TreeMap<>();
        ex.getBindingResult().getFieldErrors().forEach(f ->
            errors.computeIfAbsent(f.getField(), k -> new ArrayList<>())
                  .add(f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("errors", errors));
    }
}

// OUTPUT:
// 400 {"errors":{"age":["must be greater than or equal to 18"],
//                "email":["must be a well-formed email address"]}}`]
    ),
    'mvc-business-exceptions': dv(
        [`<p>How the flow works:</p><ul><li><b>Service:</b> checks a rule and throws a domain exception.</li><li><b>Transaction:</b> the proxy sees an unchecked exception and rolls back.</li><li><b>Controller:</b> does not catch it, the exception passes through.</li><li><b>Advice:</b> maps the type to an HTTP status and body.</li></ul>`,
            r`// Flow of one failing request
// POST /accounts/1/withdraw
//  -> controller -> AccountService.withdraw()   @Transactional proxy
//       throws InsufficientFundsException (unchecked)
//  <- proxy: rollback
//  <- DispatcherServlet -> ExceptionHandlerExceptionResolver
//  <- BusinessAdvice.funds()  -> 422 JSON

// OUTPUT:
// HTTP/1.1 422  {"code":"INSUFFICIENT_FUNDS","message":"Need 40.00 more"}`],
        [`<p>Design variants:</p><ul><li><b>Base class with code:</b> one handler for all business errors.</li><li><b>Enum of errors:</b> an enum holds code, status and message key.</li><li><b>Checked exceptions:</b> force callers to deal with it, but clutter signatures; add <code>rollbackFor</code> if used with transactions.</li><li><b>Result objects:</b> return a result type for expected failures to avoid exceptions.</li></ul>`,
            r`enum ErrorCode {
    NOT_FOUND(404), DUPLICATE(409), NO_FUNDS(422);
    final int status;
    ErrorCode(int status) { this.status = status; }
}

class AppException extends RuntimeException {
    final ErrorCode code;
    AppException(ErrorCode code, String msg) { super(msg); this.code = code; }
}

@ExceptionHandler(AppException.class)
ResponseEntity<Map<String, String>> app(AppException e) {
    return ResponseEntity.status(e.code.status)
        .body(Map.of("code", e.code.name(), "message", e.getMessage()));
}

// OUTPUT:
// new AppException(DUPLICATE, "email used") -> 409 {"code":"DUPLICATE",...}`],
        [`<p>Common mistakes:</p><ul><li><b>Catch and ignore</b> in the service: the rule failure is lost.</li><li><b>Checked exception without rollbackFor:</b> data is committed despite the error.</li><li><b>HTTP types in the service:</b> <code>ResponseStatusException</code> in domain code couples layers.</li><li><b>Generic RuntimeException:</b> the handler cannot tell rules apart.</li><li><b>Wrapping and losing the cause:</b> always pass the cause to the constructor.</li></ul>`,
            r`// WRONG: checked exception commits the transaction
@Transactional
public void pay() throws PaymentException { /* throws PaymentException */ }

// FIX
@Transactional(rollbackFor = PaymentException.class)
public void pay() throws PaymentException { /* ... */ }

// Keep the cause
catch (SQLException e) { throw new PaymentFailedException("db error", e); }

// OUTPUT:
// before: partial data saved after a failure; after: whole transaction rolled back`],
        [`<p>Performance notes:</p><ul><li><b>Stack trace cost:</b> exceptions used for expected, frequent outcomes can be costly; disable the stack trace for them.</li><li><b>Validate early:</b> cheap checks before database work.</li><li><b>Logging:</b> log business failures at info or warn without a trace.</li></ul>`,
            r`class BusinessException extends RuntimeException {
    BusinessException(String msg) {
        super(msg, null, false, false);   // no suppression, no stack trace
    }
}

// OUTPUT:
// exception creation is much cheaper; use only when the trace is not needed`],
        [`<p>Scenario: a banking service turns three business rules into clear, testable API answers.</p>`,
            r`@Service
class TransferService {
    @Transactional
    public void transfer(long from, long to, BigDecimal amt) {
        if (from == to) throw new AppException(ErrorCode.NOT_FOUND, "same account");
        Account a = repo.findById(from)
            .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "no account " + from));
        if (a.balance().compareTo(amt) < 0)
            throw new AppException(ErrorCode.NO_FUNDS, "balance too low");
        a.debit(amt);
        repo.findById(to).orElseThrow().credit(amt);
    }
}

// OUTPUT:
// unknown account -> 404, low balance -> 422, success -> 200 and both rows updated`]
    )
};
