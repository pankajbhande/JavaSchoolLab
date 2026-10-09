import { Topic } from '../coreJava';

export const springBootRestApi: Topic = {
    id: 'spring-boot-rest-api',
    name: 'Building REST APIs with Spring Boot',
    beginner: [
        {
            content: `<h3>What is REST?</h3>
REST (REpresentational State Transfer) is an architectural style for building web APIs. It is built around two simple ideas: <br><br>
• <strong>Resources</strong> - everything is a "thing" identified by a URL, e.g. <code>/employees</code>, <code>/employees/1</code>. <br>
• <strong>HTTP Verbs</strong> - the action you want to perform on that resource is expressed using the HTTP method. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>HTTP Verb</th><th>Meaning</th><th>Example</th></tr>
<tr class='text-center'><td>GET</td><td>Read a resource</td><td>GET /employees/1</td></tr>
<tr class='text-center'><td>POST</td><td>Create a new resource</td><td>POST /employees</td></tr>
<tr class='text-center'><td>PUT</td><td>Update/replace a resource</td><td>PUT /employees/1</td></tr>
<tr class='text-center'><td>DELETE</td><td>Remove a resource</td><td>DELETE /employees/1</td></tr>
</table>
<br>
Spring Boot makes it very easy to expose Java methods as REST endpoints using the <code>@RestController</code> annotation. <br>`
        },

        {
            content: `<h4>A Minimal @RestController</h4>
<code>@RestController</code> is a combination of <code>@Controller</code> + <code>@ResponseBody</code>. It tells Spring that every method's return value should be written directly into the HTTP response body (instead of being resolved to a view/HTML page).<br>`,
            codeExamples: [`import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, Spring Boot!";
    }
}
// OUTPUT (GET http://localhost:8080/hello):
// Hello, Spring Boot!`]
        },

        {
            content: `<h4>Returning JSON Automatically from a POJO</h4>
You don't have to build JSON strings by hand. If a controller method returns a plain Java object (POJO), Spring Boot uses the Jackson library (included by default) to automatically convert it into a JSON response.<br>`,
            codeExamples: [`import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

class Employee {
    private int id;
    private String name;

    public Employee(int id, String name) {
        this.id = id;
        this.name = name;
    }
    public int getId() { return id; }
    public String getName() { return name; }
}

@RestController
public class EmployeeController {

    @GetMapping("/employee")
    public Employee getEmployee() {
        return new Employee(1, "Pankaj");
    }
}
// OUTPUT (GET http://localhost:8080/employee):
// {
//   "id": 1,
//   "name": "Pankaj"
// }`]
        },

        {
            content: `<h4>Path Variables - @PathVariable</h4>
<code>@PathVariable</code> is used to capture a value directly from the URL path, e.g. the "1" in <code>/employees/1</code>.<br>`,
            codeExamples: [`import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmployeeController {

    @GetMapping("/employees/{id}")
    public String getEmployeeById(@PathVariable int id) {
        return "Fetched employee with id = " + id;
    }
}
// OUTPUT (GET http://localhost:8080/employees/5):
// Fetched employee with id = 5`]
        },

        {
            content: `<h4>Query Parameters - @RequestParam</h4>
<code>@RequestParam</code> reads values that appear after the "?" in the URL, e.g. <code>?department=IT</code>.<br>`,
            codeExamples: [`import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmployeeController {

    @GetMapping("/employees")
    public String getEmployeesByDept(@RequestParam String department) {
        return "Fetching employees from department = " + department;
    }
}
// OUTPUT (GET http://localhost:8080/employees?department=IT):
// Fetching employees from department = IT`]
        },

        {
            content: `<h4>Receiving JSON Input - @RequestBody</h4>
<code>@RequestBody</code> tells Spring to take the JSON sent in the request body (e.g. from a POST call) and automatically convert it into a Java object, the exact reverse of what happens on the way out.<br>`,
            codeExamples: [`import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

class Employee {
    private int id;
    private String name;
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

@RestController
public class EmployeeController {

    @PostMapping("/employees")
    public String addEmployee(@RequestBody Employee employee) {
        return "Received employee: " + employee.getId() + " - " + employee.getName();
    }
}
// REQUEST BODY (POST http://localhost:8080/employees):
// { "id": 2, "name": "Neha" }
//
// OUTPUT:
// Received employee: 2 - Neha`]
        }
    ],

    expert: [
        {
            content: `<h3>Full CRUD REST Controller with ResponseEntity</h3>
Real REST APIs don't just return raw objects/strings - they return the correct HTTP status code along with the body, using <code>ResponseEntity&lt;T&gt;</code>. This gives full control over status code, headers, and body in a single response.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>HTTP Verb</th><th>Success Status</th></tr>
<tr class='text-center'><td>Read one / all</td><td>GET</td><td>200 OK</td></tr>
<tr class='text-center'><td>Create</td><td>POST</td><td>201 Created</td></tr>
<tr class='text-center'><td>Update</td><td>PUT</td><td>200 OK</td></tr>
<tr class='text-center'><td>Delete</td><td>DELETE</td><td>204 No Content</td></tr>
</table>
<br>`,
            codeExamples: [`import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

class Employee {
    private int id;
    private String name;

    public Employee(int id, String name) { this.id = id; this.name = name; }
    public int getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final Map<Integer, Employee> db = new HashMap<>();
    private final AtomicInteger idGen = new AtomicInteger(1);

    // GET all -> 200 OK
    @GetMapping
    public ResponseEntity<Collection<Employee>> getAll() {
        return ResponseEntity.ok(db.values());
    }

    // GET one -> 200 OK or 404 Not Found
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getOne(@PathVariable int id) {
        Employee emp = db.get(id);
        if (emp == null) {
            return ResponseEntity.notFound().build(); // 404
        }
        return ResponseEntity.ok(emp); // 200
    }

    // POST -> 201 Created
    @PostMapping
    public ResponseEntity<Employee> create(@RequestBody Employee employee) {
        int id = idGen.getAndIncrement();
        Employee saved = new Employee(id, employee.getName());
        db.put(id, saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved); // 201
    }

    // PUT -> 200 OK or 404 Not Found
    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable int id, @RequestBody Employee employee) {
        Employee existing = db.get(id);
        if (existing == null) {
            return ResponseEntity.notFound().build(); // 404
        }
        existing.setName(employee.getName());
        return ResponseEntity.ok(existing); // 200
    }

    // DELETE -> 204 No Content or 404 Not Found
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if (!db.containsKey(id)) {
            return ResponseEntity.notFound().build(); // 404
        }
        db.remove(id);
        return ResponseEntity.noContent().build(); // 204
    }
}
// OUTPUT (sample flow):
// POST /api/employees {"name":"Pankaj"}   -> 201 Created  {"id":1,"name":"Pankaj"}
// GET  /api/employees/1                   -> 200 OK       {"id":1,"name":"Pankaj"}
// PUT  /api/employees/1 {"name":"Neha"}   -> 200 OK       {"id":1,"name":"Neha"}
// DELETE /api/employees/1                 -> 204 No Content
// GET  /api/employees/1                   -> 404 Not Found`]
        },

        {
            content: `<h3>HTTP Status Codes in a REST API</h3>
Choosing the right status code is what separates a "toy" API from a well-designed one. Consumers of your API rely on the status code, not just the body, to decide how to react.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Code</th><th>Meaning</th><th>When to use in a REST API</th></tr>
<tr class='text-center'><td>200 OK</td><td>Success</td><td>Successful GET, PUT, or PATCH</td></tr>
<tr class='text-center'><td>201 Created</td><td>Resource created</td><td>Successful POST that creates a new resource (include Location header)</td></tr>
<tr class='text-center'><td>204 No Content</td><td>Success, nothing to return</td><td>Successful DELETE, or PUT with no response body</td></tr>
<tr class='text-center'><td>400 Bad Request</td><td>Client sent invalid data</td><td>Validation failure, malformed JSON, missing required field</td></tr>
<tr class='text-center'><td>401 Unauthorized</td><td>Not authenticated</td><td>Missing/invalid credentials or token</td></tr>
<tr class='text-center'><td>403 Forbidden</td><td>Authenticated but not allowed</td><td>User is known but lacks permission for this action</td></tr>
<tr class='text-center'><td>404 Not Found</td><td>Resource does not exist</td><td>GET/PUT/DELETE on an id that isn't in the system</td></tr>
<tr class='text-center'><td>409 Conflict</td><td>State conflict</td><td>Duplicate resource, version/concurrency conflict</td></tr>
<tr class='text-center'><td>500 Internal Server Error</td><td>Unexpected server failure</td><td>Uncaught exception - should be rare and always logged</td></tr>
</table>
<br>`
        },

        {
            content: `<h3>Global Exception Handling with @ControllerAdvice</h3>
Instead of wrapping every controller method in try/catch, Spring lets you centralize error handling in one class annotated with <code>@ControllerAdvice</code> (or <code>@RestControllerAdvice</code>). Each <code>@ExceptionHandler</code> method intercepts a specific exception type thrown from ANY controller and converts it into a clean, structured JSON error response.<br>`,
            codeExamples: [`import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}

class ApiError {
    private int status;
    private String message;
    private LocalDateTime timestamp;

    public ApiError(int status, String message) {
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    public int getStatus() { return status; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
}

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        ApiError error = new ApiError(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        ApiError error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Something went wrong");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

// Usage inside a controller:
// if (employee == null) {
//     throw new ResourceNotFoundException("Employee not found with id: " + id);
// }
//
// OUTPUT (GET /api/employees/99, id 99 doesn't exist):
// HTTP 404 Not Found
// {
//   "status": 404,
//   "message": "Employee not found with id: 99",
//   "timestamp": "2026-08-19T10:15:30"
// }`]
        },

        {
            content: `<h3>API Versioning Strategies</h3>
As an API evolves, you need a way to change it without breaking existing clients. The two most common strategies: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1) URI Versioning (most common, easiest to understand)
   GET /api/v1/employees
   GET /api/v2/employees
   -> version is baked into the path itself

2) Header Versioning (keeps URLs clean)
   GET /api/employees
   Header: X-API-VERSION: 2
   -> same URL, server branches based on the header value</pre>
<br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>Pros</th><th>Cons</th></tr>
<tr class='text-center'><td>URI Versioning</td><td>Simple, visible, easy to test/cache</td><td>"Pollutes" the URL, resource identity changes across versions</td></tr>
<tr class='text-center'><td>Header Versioning</td><td>Clean/stable URLs, resource identity stays the same</td><td>Less discoverable, harder to test directly in a browser</td></tr>
</table>
<br>`,
            codeExamples: [`// URI versioning example
@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeControllerV1 {
    @GetMapping
    public String getAll() {
        return "Employee list (v1 format)";
    }
}

@RestController
@RequestMapping("/api/v2/employees")
public class EmployeeControllerV2 {
    @GetMapping
    public String getAll() {
        return "Employee list (v2 format, includes new fields)";
    }
}

// Header versioning example
@RestController
@RequestMapping("/api/employees")
public class EmployeeControllerHeaderVersioned {

    @GetMapping(headers = "X-API-VERSION=1")
    public String getAllV1() {
        return "Employee list (v1 format)";
    }

    @GetMapping(headers = "X-API-VERSION=2")
    public String getAllV2() {
        return "Employee list (v2 format)";
    }
}`]
        },

        {
            content: `<h3>Content Negotiation - Accept, produces, consumes</h3>
Content negotiation is how a client and server agree on the data format (JSON, XML, etc.) to exchange. The client sends an <code>Accept</code> header saying what it can understand; the server declares what it can output using <code>produces</code>, and what request bodies it accepts using <code>consumes</code>.<br>`,
            codeExamples: [`import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    // Only accepts requests where the body is JSON,
    // and only produces a JSON response
    @PostMapping(consumes = "application/json", produces = "application/json")
    public String create(@RequestBody String employeeJson) {
        return "{\\"status\\":\\"created\\"}";
    }

    // Can produce either JSON or XML depending on the client's Accept header
    @GetMapping(value = "/{id}", produces = { "application/json", "application/xml" })
    public String getOne(@PathVariable int id) {
        return "Employee-" + id;
    }
}
// Client sends: Accept: application/json  -> server responds with JSON
// Client sends: Accept: application/xml   -> server responds with XML
// If the client asks for a format the server can't produce -> 406 Not Acceptable`]
        },

        {
            content: `<h3>A Note on HATEOAS</h3>
HATEOAS (Hypermedia As The Engine Of Application State) is the most advanced level of REST maturity (Level 3 of the Richardson Maturity Model). Instead of the client having to know every URL in advance, each response includes hyperlinks describing what the client can do next - similar to how a website has clickable links.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">// Plain REST response
{
  "id": 1,
  "name": "Pankaj"
}

// HATEOAS-enriched response
{
  "id": 1,
  "name": "Pankaj",
  "_links": {
    "self":   { "href": "/api/employees/1" },
    "update": { "href": "/api/employees/1", "method": "PUT" },
    "delete": { "href": "/api/employees/1", "method": "DELETE" },
    "all":    { "href": "/api/employees" }
  }
}</pre>
<br>
Spring provides the <code>spring-hateoas</code> library (<code>EntityModel</code>, <code>WebMvcLinkBuilder</code>) to add these links without hand-building JSON. Most everyday REST APIs stop at Level 2 (proper verbs + status codes) since HATEOAS adds complexity that is only worth it for large, evolving public APIs.<br>`
        },

        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does @RestController do that @Controller doesn't?</td><td>@RestController = @Controller + @ResponseBody, so every method's return value is written straight into the HTTP response body instead of being resolved as a view name</td></tr>
<tr><td>How does Spring Boot convert a Java object to JSON automatically?</td><td>Via the Jackson library (HttpMessageConverter), included by default in spring-boot-starter-web, using the object's getters</td></tr>
<tr><td>Difference between @PathVariable and @RequestParam?</td><td>@PathVariable extracts a value from the URI path (/employees/{id}); @RequestParam extracts a value from query string parameters (?key=value)</td></tr>
<tr><td>What is ResponseEntity used for?</td><td>To control the full HTTP response - status code, headers, and body - rather than just returning a raw object with an implicit 200 OK</td></tr>
<tr><td>What status code should a successful POST that creates a resource return?</td><td>201 Created, ideally with a Location header pointing to the new resource's URL</td></tr>
<tr><td>How do you centralize exception handling across all controllers?</td><td>@RestControllerAdvice (or @ControllerAdvice) combined with @ExceptionHandler methods for specific exception types</td></tr>
<tr><td>What is the difference between produces and consumes in @RequestMapping?</td><td>consumes restricts the Content-Type of the incoming request body the endpoint accepts; produces restricts the Content-Type/format of the response, matched against the client's Accept header</td></tr>
<tr><td>Name two common API versioning strategies.</td><td>URI versioning (/api/v1/..., /api/v2/...) and header versioning (a custom header like X-API-VERSION)</td></tr>
<tr><td>What is HATEOAS?</td><td>A REST maturity concept where responses include hyperlinks describing available next actions/related resources, so clients don't need to hardcode every URL</td></tr>
<tr><td>What status code means "the resource doesn't exist" vs "you're not allowed to see it"?</td><td>404 Not Found for a missing resource; 403 Forbidden when the resource exists but the caller lacks permission (401 Unauthorized means the caller isn't authenticated at all)</td></tr>
</table>`
        }
    ],
};
