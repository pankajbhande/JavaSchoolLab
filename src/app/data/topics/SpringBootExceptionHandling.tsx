import { Topic } from '../coreJava';

export const springBootExceptionHandling: Topic = {
    id: 'spring-boot-exception-handling',
    name: 'Exception Handling in Spring Boot REST APIs',
    beginner: [
        {
            content: `When you build a REST API with Spring Boot, clients call your endpoints over HTTP and expect a clean,
predictable JSON response - even when something goes wrong. <br><br>
If you let a normal Java exception (like <code>NullPointerException</code>, <code>ArithmeticException</code>,
or a custom exception) bubble up without handling it, Spring Boot does not crash silently - it falls back to
its default error handling mechanism, called the <strong>Whitelabel Error Page</strong> (for browsers) or a
generic JSON error body (for REST clients / Postman). <br><br>
This default response is <strong>ugly and unsafe</strong> for a real API because: <br>
• It exposes internal details like the exception class name and sometimes stack trace info. <br>
• It does not tell the client anything meaningful about what went wrong or how to fix it. <br>
• The HTTP status code returned is almost always a generic <strong>500 Internal Server Error</strong>, even
for things that are really the client's fault (like passing a bad ID) which should be a 404 or 400. <br><br>
Below is what a typical unhandled exception looks like when hit through a REST client: <br>`,
            codeExamples: [`// Controller - NO exception handling at all
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public String getUser(@PathVariable int id) {
        if (id != 1) {
            throw new RuntimeException("User not found with id: " + id);
        }
        return "John Doe";
    }
}

// Request: GET /api/users/99

// DEFAULT SPRING BOOT JSON RESPONSE (Whitelabel error, ugly + unsafe):
{
    "timestamp": "2026-08-19T10:15:30.123+00:00",
    "status": 500,
    "error": "Internal Server Error",
    "trace": "java.lang.RuntimeException: User not found with id: 99\\n\\tat com.example.demo.UserController.getUser(UserController.java:14)\\n\\t... 42 more",
    "message": "User not found with id: 99",
    "path": "/api/users/99"
}
// PROBLEM: Wrong status code (500 instead of 404), and the "trace" field
// leaks internal package/class names to the outside world.`]
        },

        {
            content: `<h4>Step 1: Catch a specific exception with @ExceptionHandler</h4>
The simplest fix is to add a method annotated with <code>@ExceptionHandler</code> directly inside the same
controller. Spring Boot automatically routes any exception of that type (thrown by any handler method in
that controller) to this method instead of letting it bubble up to the default handler. <br><br>
This gives you full control over the response body - no more leaked stack traces.`,
            codeExamples: [`@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public String getUser(@PathVariable int id) {
        if (id != 1) {
            throw new RuntimeException("User not found with id: " + id);
        }
        return "John Doe";
    }

    // Handles RuntimeException thrown anywhere inside THIS controller
    @ExceptionHandler(RuntimeException.class)
    public String handleRuntimeException(RuntimeException ex) {
        return "Error: " + ex.getMessage();
    }
}

// Request: GET /api/users/99
// OUTPUT (clean, no stack trace):
// Error: User not found with id: 99`]
        },

        {
            content: `<h4>Step 2: Control the HTTP status with ResponseEntity</h4>
Returning a plain String fixed the message, but the HTTP status is still 200 OK by default - which is wrong,
because "user not found" should really be a <strong>404 Not Found</strong>. <br><br>
<code>ResponseEntity&lt;T&gt;</code> lets your exception handler set both the response body AND the exact
HTTP status code to send back, so REST clients can correctly branch on status (404 vs 400 vs 500 etc).`,
            codeExamples: [`import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public String getUser(@PathVariable int id) {
        if (id != 1) {
            throw new RuntimeException("User not found with id: " + id);
        }
        return "John Doe";
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(
                "Error: " + ex.getMessage(),
                HttpStatus.NOT_FOUND   // sends HTTP 404 instead of 200
        );
    }
}

// Request: GET /api/users/99
// HTTP Status: 404 Not Found
// Body:
// Error: User not found with id: 99`]
        },

        {
            content: `<strong>Limitation of this approach:</strong> the <code>@ExceptionHandler</code> method above only protects
<em>this one controller</em>. If you have 10 controllers in your project, you would have to copy-paste the
same handler into every one of them - which does not scale and is easy to forget. <br><br>
The Expert section covers <code>@RestControllerAdvice</code>, which solves this by handling exceptions
<strong>globally</strong>, across every controller in the application, from a single place.`
        }
    ],

    expert: [
        {
            content: `<h3>Global Exception Handling with @ControllerAdvice / @RestControllerAdvice</h3>
Instead of writing an <code>@ExceptionHandler</code> in every single controller, Spring lets you centralize
exception handling in <strong>one</strong> class using <code>@ControllerAdvice</code> (returns views, older
MVC style) or <code>@RestControllerAdvice</code> (combination of <code>@ControllerAdvice</code> +
<code>@ResponseBody</code>, the standard choice for REST APIs - every handler method's return value is
automatically serialized to JSON). <br><br>
Spring scans this class at startup and registers it as a cross-cutting "advice" that intercepts exceptions
thrown from <strong>any</strong> <code>@RestController</code> in the application, not just one. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                     ┌─────────────────────────┐
                     │   UserController        │──┐
                     └─────────────────────────┘  │  throws
                     ┌─────────────────────────┐  │  exception
                     │   OrderController        │──┼──────────►  ┌──────────────────────────────┐
                     └─────────────────────────┘  │              │  @RestControllerAdvice        │
                     ┌─────────────────────────┐  │              │  GlobalExceptionHandler       │
                     │   ProductController      │──┘              │  (single centralized class)   │
                     └─────────────────────────┘                 └──────────────┬───────────────┘
                                                                                  │
                                                                  picks best-matching
                                                                  @ExceptionHandler method
                                                                                  │
                                                                                  ▼
                                                                    Clean JSON error response</pre>

Below is a full working example: a custom <code>ResourceNotFoundException</code> mapped to 404, a validation
failure mapped to 400, and a catch-all fallback mapped to 500.`,
            codeExamples: [`// 1. Custom exception
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}`,
                `// 2. Controller - just throws domain exceptions, no try/catch clutter
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public String getUser(@PathVariable int id) {
        if (id != 1) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        return "John Doe";
    }
}`,
                `// 3. Global handler - applies to ALL controllers in the application
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404 - our own "not found" exception
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // 400 - bean validation failures (see the full demo further below)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(MethodArgumentNotValidException ex) {
        return new ResponseEntity<>("Validation failed", HttpStatus.BAD_REQUEST);
    }

    // 500 - catch-all fallback for anything not handled above
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        return new ResponseEntity<>("Something went wrong: " + ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

// Request: GET /api/users/99  ->  HTTP 404, body: "User not found with id: 99"
// Request: GET /api/orders/1  ->  even though OrderController never mentions
//                                  GlobalExceptionHandler, it is STILL protected.`]
        },

        {
            content: `<h3>Designing a Structured Error Response DTO</h3>
Returning a plain <code>String</code> as the error body (as above) is fine for a demo, but real APIs return a
<strong>consistent JSON shape</strong> for every error, so client applications can parse it reliably instead of
guessing the format each time. A typical structured error DTO includes: <br>
• <code>timestamp</code> - when the error occurred <br>
• <code>status</code> - numeric HTTP status code (e.g. 404) <br>
• <code>error</code> - the HTTP status reason phrase (e.g. "Not Found") <br>
• <code>message</code> - human-readable, safe-to-expose description <br>
• <code>path</code> - the request URI that triggered the error <br>`,
            codeExamples: [`// ErrorResponse.java - the consistent shape every error will use
import java.time.LocalDateTime;

public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    public ErrorResponse(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // getters (needed for Jackson to serialize to JSON) omitted for brevity
    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public String getPath() { return path; }
}`,
                `// GlobalExceptionHandler.java - using ErrorResponse instead of raw String
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ErrorResponse body = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
}

// Request: GET /api/users/99
// HTTP Status: 404
// JSON body:
{
    "timestamp": "2026-08-19T10:22:41.501",
    "status": 404,
    "error": "Not Found",
    "message": "User not found with id: 99",
    "path": "/api/users/99"
}
// Every error in the app now looks like this - predictable and easy to parse.`]
        },

        {
            content: `<h3>@Valid + Bean Validation: Field-Level Validation Errors</h3>
Real APIs receive request bodies (e.g. creating a new user) that must satisfy rules before hitting business
logic - fields must not be null, strings must be within a size range, emails must be well-formed, etc.
Spring integrates with the <strong>Bean Validation</strong> spec (<code>jakarta.validation</code>) so you
annotate the DTO fields directly, add <code>@Valid</code> on the controller parameter, and Spring throws
<code>MethodArgumentNotValidException</code> automatically if any rule fails - <em>before</em> your controller
method body even runs. You then catch that exception globally and return field-level messages.`,
            codeExamples: [`// UserRequest.java - request DTO with Bean Validation annotations
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserRequest {

    @NotNull(message = "Name must not be null")
    @Size(min = 2, max = 30, message = "Name must be between 2 and 30 characters")
    private String name;

    @NotNull(message = "Email must not be null")
    @Email(message = "Email must be a valid email address")
    private String email;

    // getters and setters omitted for brevity
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}`,
                `// UserController.java - @Valid triggers validation before the method body runs
@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public String createUser(@Valid @RequestBody UserRequest request) {
        // this line only runs if validation PASSED
        return "Created user: " + request.getName();
    }
}`,
                `// GlobalExceptionHandler.java - catching validation failures with field detail
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        return new ResponseEntity<>(fieldErrors, HttpStatus.BAD_REQUEST);
    }
}

// Request: POST /api/users
// Body: { "name": "A", "email": "not-an-email" }
//
// HTTP Status: 400 Bad Request
// JSON body:
{
    "name": "Name must be between 2 and 30 characters",
    "email": "Email must be a valid email address"
}
// Each failed field is reported individually - the client knows EXACTLY
// what to fix, without guessing.`]
        },

        {
            content: `<h3>Precedence: Which @ExceptionHandler Wins?</h3>
A single <code>@RestControllerAdvice</code> class often has multiple <code>@ExceptionHandler</code> methods
mapped to different exception types in the same class hierarchy (e.g. <code>ResourceNotFoundException</code>
extends <code>RuntimeException</code> extends <code>Exception</code>). Spring resolves which handler to call
using the same rule as Java's own catch-block matching: <strong>the most specific matching exception type
always wins</strong>, regardless of the order the methods are declared in the class. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Exception Thrown</th>
<th>Handlers Available</th>
<th>Handler That Actually Runs</th>
<th>Why</th>
</tr>
<tr class='text-center'>
<td>ResourceNotFoundException</td>
<td>handles(ResourceNotFoundException), handles(RuntimeException), handles(Exception)</td>
<td>handles(ResourceNotFoundException)</td>
<td>Exact type match - most specific always wins</td>
</tr>
<tr class='text-center'>
<td>IllegalStateException</td>
<td>handles(RuntimeException), handles(Exception)</td>
<td>handles(RuntimeException)</td>
<td>No exact match, so the nearest ancestor in the hierarchy wins</td>
</tr>
<tr class='text-center'>
<td>IOException (checked)</td>
<td>handles(RuntimeException), handles(Exception)</td>
<td>handles(Exception)</td>
<td>IOException is not a RuntimeException, only Exception matches</td>
</tr>
<tr class='text-center'>
<td>Any exception with no dedicated handler at all</td>
<td>handles(Exception) only</td>
<td>handles(Exception)</td>
<td>Acts as the global catch-all / fallback (should always be present)</td>
</tr>
</table>
<br>
<strong>Key rule:</strong> declaration order in the class does NOT matter - Spring always walks up the
exception's class hierarchy and picks the handler whose declared type is the closest ancestor (or exact
match). This is why it is safe (and recommended) to always keep a generic
<code>@ExceptionHandler(Exception.class)</code> as a fallback - it will only be invoked when nothing more
specific matches.<br>`,
            codeExamples: [`@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)               // most generic - declared FIRST
    public ResponseEntity<String> handleGeneric(Exception ex) {
        return ResponseEntity.status(500).body("Generic: " + ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class) // most specific - declared LAST
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body("Not found: " + ex.getMessage());
    }
}

// Even though handleGeneric() is declared FIRST in the class,
// throwing a ResourceNotFoundException still calls handleNotFound()
// because Spring matches by SPECIFICITY, not declaration order.

// Request that throws ResourceNotFoundException:
// OUTPUT: HTTP 404 - "Not found: User not found with id: 99"`]
        },

        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What happens by default if you don't handle an exception in a Spring Boot REST API?</td><td>Spring Boot's default error handler (Whitelabel) returns a generic JSON body with status 500, and it can leak internal details like the exception message/trace.</td></tr>
<tr class='text-center'><td>Difference between @ControllerAdvice and @RestControllerAdvice?</td><td>@RestControllerAdvice = @ControllerAdvice + @ResponseBody; it automatically serializes handler return values to JSON, which is what REST APIs need. @ControllerAdvice alone is meant for MVC apps returning views.</td></tr>
<tr class='text-center'><td>Does @ExceptionHandler inside a controller work only for that controller?</td><td>Yes - a handler defined inside a specific @RestController only catches exceptions thrown within that controller. A handler inside a @RestControllerAdvice class applies globally to all controllers.</td></tr>
<tr class='text-center'><td>How does Spring decide which @ExceptionHandler method to call when several match?</td><td>It picks the handler whose declared exception type is the closest match in the thrown exception's class hierarchy (most specific wins), regardless of method declaration order.</td></tr>
<tr class='text-center'><td>What triggers MethodArgumentNotValidException?</td><td>It's thrown automatically when a @RequestBody parameter annotated with @Valid fails one or more Bean Validation constraints (like @NotNull, @Size, @Email) on its fields.</td></tr>
<tr class='text-center'><td>Why use ResponseEntity in an exception handler instead of just returning an object?</td><td>ResponseEntity lets you explicitly control the HTTP status code returned to the client (404, 400, 500, etc.), not just the response body.</td></tr>
<tr class='text-center'><td>Why is a consistent error response DTO (timestamp/status/error/message/path) considered a best practice?</td><td>It gives every error the same predictable JSON shape so client applications can parse and handle errors uniformly instead of writing custom parsing logic per endpoint.</td></tr>
<tr class='text-center'><td>Should you always include a catch-all @ExceptionHandler(Exception.class)?</td><td>Yes - it acts as a safety net for any exception type without a dedicated handler, ensuring the client never sees the raw Whitelabel error page/stack trace.</td></tr>
<tr class='text-center'><td>Can you have multiple exception types mapped to the same handler method?</td><td>Yes - @ExceptionHandler({TypeA.class, TypeB.class}) lets one method handle multiple unrelated exception types.</td></tr>
<tr class='text-center'><td>Where does @ControllerAdvice / @RestControllerAdvice fit in the request lifecycle?</td><td>It acts as a cross-cutting concern (similar to AOP) - it doesn't run on every request, only when an exception propagates out of a controller method, at which point Spring routes it to the best-matching handler.</td></tr>
</table>`
        }
    ],
};
