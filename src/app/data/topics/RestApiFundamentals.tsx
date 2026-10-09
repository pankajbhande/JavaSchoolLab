import { Topic } from '../coreJava';

export const restApiFundamentals: Topic = {
    id: 'rest-api-fundamentals',
    name: 'REST API & RESTful Web Services',
    beginner: [
        {
            content: `<h3>What is REST?</h3>
<div class="border">
• REST is an <strong>architectural style</strong> that defines a set of rules for creating RESTful web services.<br>
• It stands for <strong>REpresentational State Transfer</strong>.<br>
</div><br>

<h3>Why do we need it?</h3>
Suppose you run a job site, <em>freshersworlds.com</em>, and you want to show tour packages from different countries on it. What are your options?<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   www.freshersworlds.com                      www.makemytrip.com
   (Job site)                                  (Tours and travel)

        |                                              |
        |------------  GET /api/tours  --------------->|
        |                                              |
        |<---------  list of tour packages  -----------|
        |                                              |</pre>
<br>
There is exactly one sensible option: <strong>call the tour company's API</strong> from your site. That is why REST APIs exist. Put more generally: if your application needs to work with a third-party application, a REST API is how they talk.<br><br>

In client-server communication, REST says: build an object holding the data the client asked for, and send the <em>values</em> of that object back in the response.<br>`
        },
        {
            content: `<h3>The Four Main HTTP Methods</h3>

<table>
<tr><th>Method</th><th>Purpose</th></tr>
<tr><td>GET</td><td>Read a resource.</td></tr>
<tr><td>POST</td><td>Create a new resource.</td></tr>
<tr><td>PUT</td><td>Update an existing resource.</td></tr>
<tr><td>DELETE</td><td>Delete a resource.</td></tr>
</table>

<h3>REST API Annotations</h3>

<table>
<tr><th>Annotation</th><th>Purpose</th></tr>
<tr><td>@RestController</td><td>Marks the class as a RESTful web service.</td></tr>
<tr><td>@RequestMapping</td><td>A REST controller holds several handler methods for different HTTP requests; this is how Spring maps a particular request to a particular handler method.</td></tr>
<tr><td>@PathVariable</td><td>Retrieves data from the URL and binds it to a method argument.</td></tr>
<tr><td>@RequestBody</td><td>Converts inbound HTTP data into the Java object passed into the handler method.</td></tr>
<tr><td>@ResponseBody</td><td>Binds a method's return value to the web response body.</td></tr>
<tr><td>@ResponseStatus</td><td>Overrides the HTTP response code for a response. Useful for error handling in a web application or RESTful web service.</td></tr>
</table>`
        },
        {
            content: `<h3>Setting Up: STS (Spring Tool Suite)</h3>
Spring Tool Suite is an IDE for developing Spring applications.<br><br>

<div class="border">
1. Download Spring Tool Suite from <code>https://spring.io/tools</code> and click the platform you use.<br>
2. Select the Windows 64-bit option.<br>
3. Go to the download folder, then right-click the file and unzip it.<br>
4. Open the extracted <code>sts-4.x.x.RELEASE</code> folder.<br>
5. Double-click <code>SpringToolSuite4.exe</code>.<br>
6. The launcher box appears on screen.<br>
7. Set the workspace location - keep the default or change it.<br>
8. Click <code>Launch</code>. It takes a moment on first run.<br>
</div><br>

<strong>Note:</strong> create the workspace on any drive except C:. If a system problem or a virus forces you to format C:, your work is somewhere else.<br>`
        },
        {
            content: `<h3>Steps to Create RESTful Web Services</h3>

<div class="border">
1. Create the Spring Boot project<br>
2. Add the Maven dependencies to pom.xml<br>
3. Create the REST controller<br>
4. Run the Spring Boot application<br>
5. Test with the Postman tool (request and response)<br>
</div><br>

<h3>Step 1 - Create the Spring Boot Maven Project</h3>

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Wizard</td><td>File -> New -> Spring Starter Project</td></tr>
<tr><td>Project Name</td><td>SpringBootRestApiDemo</td></tr>
<tr><td>Type</td><td>Maven</td></tr>
<tr><td>Java Version</td><td>8</td></tr>
<tr><td>Packaging</td><td>Jar</td></tr>
<tr><td>Language</td><td>Java</td></tr>
<tr><td>Package</td><td>com.velocity</td></tr>
</table>
<br>
Then click <code>Next</code>.<br><br>

<h3>Step 2 - Add the Maven Dependency</h3>
Either add it to pom.xml directly, or - simpler - search for <code>Spring Web</code> in the dependency screen of the wizard, select it, then Next and Finish.<br>`,
            codeExamples: [
                `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- No <version> is needed - the spring-boot-starter-parent
     supplies a version tested against your Boot release. -->`
            ]
        },
        {
            content: `<h3>Step 3 - Create the REST Controller</h3>
<code>@RestController</code> tells Spring this class serves REST endpoints; <code>@GetMapping("/getTest")</code> maps a GET request for <code>/getTest</code> to the method below it.<br>`,
            codeExamples: [
                `package com.velocity.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {

    @GetMapping("/getTest")
    public String getDemo() {
        return "Spring Boot Rest API Example";
    }
}`,
                `// Step 4 - Run the application
// Right-click the project -> Run As -> Spring Boot App
// OUTPUT (console):
// Tomcat started on port(s): 8080 (http) with context path ''
// Started SpringBootRestApiDemoApplication in 2.1 seconds`
            ]
        },
        {
            content: `<h3>Step 5 - Testing with Postman</h3>

<h3>Download and install Postman</h3>
<div class="border">
1. Go to <code>https://www.postman.com/downloads/</code> and choose your platform - Mac, Windows or Linux. Click Download.<br>
2. Click Windows 32-bit or 64-bit to match your operating system. The download takes a moment.<br>
3. Go to the download folder and double-click the exe file.<br>
4. The Postman window appears.<br>
5. Click the <code>+</code> icon to open a new request tab.<br>
6. Enter the request details.<br>
</div><br>

<h3>The request</h3>

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Method</td><td>GET</td></tr>
<tr><td>URL</td><td>http://localhost:8080/getTest</td></tr>
<tr><td>Action</td><td>Click Send</td></tr>
</table>
<br>
<strong>Response</strong>: <code>Spring Boot Rest API Example</code> with status <code>200 OK</code>.<br><br>
The same endpoint also works straight from a browser, because it is a GET request. Postman becomes necessary once you need POST, PUT, DELETE, headers or a request body.<br>`
        },
        {
            content: `<h3>Example 2 - Return a List</h3>
<strong>Business requirement:</strong> design a RESTful web service that returns a list of students as the response.<br><br>
The method returns <code>List&lt;String&gt;</code> and nothing else changes - Spring Boot converts the list into a JSON array automatically.<br>`,
            codeExamples: [
                `@GetMapping("/getlist")
public List<String> getStudentData() {

    List<String> list = new ArrayList<String>();
    list.add("ram");
    list.add("ajay");
    list.add("vikas");

    return list;
}
// REQUEST:  GET http://localhost:8080/getlist
// RESPONSE (200 OK):
// [
//     "ram",
//     "ajay",
//     "vikas"
// ]`
            ]
        },
        {
            content: `<h3>Example 3 - Return an Object</h3>
<strong>Business requirement:</strong> design a RESTful web service that returns a student object.<br><br>
First create the model class, then return it from the controller. The object becomes a JSON object in the response - each getter supplies one key.<br>`,
            codeExamples: [
                `// Student.java - the model class
package com.velocity.controller;

public class Student {

    private int id;
    private String name;
    private String city;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}`,
                `// SampleController.java
@GetMapping("/getStudent")
public Student getStudentDetails() {

    Student student = new Student();
    student.setId(10);
    student.setName("ajay");
    student.setCity("pune");

    return student;
}
// REQUEST:  GET http://localhost:8080/getStudent
// RESPONSE (200 OK):
// {
//     "id": 10,
//     "name": "ajay",
//     "city": "pune"
// }
//
// You wrote no JSON code. Jackson - already on the classpath via
// spring-boot-starter-web - turned the getters into JSON keys.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Six REST Constraints</h3>
"An architectural style that defines a set of rules" - these are the rules. An API that breaks them is often still called REST, but the properties REST promises come from following them.<br><br>

<table>
<tr><th>Constraint</th><th>What it requires</th></tr>
<tr><td>Client-Server</td><td>The UI and the data store evolve independently, connected only by the API contract.</td></tr>
<tr><td>Stateless</td><td>Every request carries everything needed to serve it. The server holds no client session between requests - which is what lets you run twenty instances behind a load balancer.</td></tr>
<tr><td>Cacheable</td><td>A response says whether it may be cached, so repeat reads need not reach the server.</td></tr>
<tr><td>Uniform Interface</td><td>Resources are identified by URI, manipulated through representations, and responses are self-descriptive.</td></tr>
<tr><td>Layered System</td><td>A client cannot tell whether it is talking to the origin server or to a proxy, gateway or cache in front of it.</td></tr>
<tr><td>Code on Demand (optional)</td><td>The server may ship executable code to the client. Rarely used.</td></tr>
</table>
<br>
<strong>Stateless is the one that gets broken in practice</strong> - typically by storing user state in an <code>HttpSession</code>. The moment you do, a second instance of the application cannot serve that user, and the API stops scaling horizontally. This is exactly why token-based schemes such as JWT are used with REST APIs: the token travels with each request rather than living on the server.<br>`
        },
        {
            content: `<h3>Designing the URL and Choosing the Status Code</h3>
The example endpoints - <code>/getTest</code>, <code>/getlist</code>, <code>/getStudent</code> - are fine for a first run and are not how a real API is shaped. REST puts the <strong>noun in the URL and the verb in the HTTP method</strong>.<br><br>

<table>
<tr><th>Instead of</th><th>Use</th></tr>
<tr><td>GET /getStudent?id=10</td><td>GET /api/students/10</td></tr>
<tr><td>GET /getlist</td><td>GET /api/students</td></tr>
<tr><td>POST /createStudent</td><td>POST /api/students</td></tr>
<tr><td>POST /updateStudent</td><td>PUT /api/students/10</td></tr>
<tr><td>GET /deleteStudent?id=10</td><td>DELETE /api/students/10</td></tr>
</table>
<br>
The status code is half the response, and returning <code>200 OK</code> for everything throws that half away.<br><br>

<table>
<tr><th>Code</th><th>When to return it</th></tr>
<tr><td>200 OK</td><td>Successful GET, PUT or DELETE.</td></tr>
<tr><td>201 Created</td><td>Successful POST. Include a <code>Location</code> header pointing at the new resource.</td></tr>
<tr><td>204 No Content</td><td>Success with nothing to return - typically DELETE.</td></tr>
<tr><td>400 Bad Request</td><td>The payload failed validation.</td></tr>
<tr><td>401 / 403</td><td>Not authenticated / authenticated but not allowed.</td></tr>
<tr><td>404 Not Found</td><td>No resource with that id.</td></tr>
<tr><td>409 Conflict</td><td>Duplicate key, or a version conflict on update.</td></tr>
<tr><td>500 Internal Server Error</td><td>An unhandled failure on the server. Never return this for a client mistake.</td></tr>
</table>`,
            codeExamples: [
                `@RestController
@RequestMapping("/api/students")          // the noun, once, at class level
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) { this.service = service; }

    @GetMapping
    public List<Student> findAll() {
        return service.findAll();                                   // 200
    }

    @GetMapping("/{id}")
    public Student findById(@PathVariable int id) {
        return service.findById(id);                                // 200, or 404
    }

    @PostMapping
    public ResponseEntity<Student> create(@Valid @RequestBody Student student) {
        Student saved = service.save(student);
        URI location = URI.create("/api/students/" + saved.getId());
        return ResponseEntity.created(location).body(saved);        // 201 + Location
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable int id, @Valid @RequestBody Student student) {
        return service.update(id, student);                         // 200
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        service.delete(id);                                         // 204
    }
}
// OUTPUT:
// POST /api/students  ->  201 Created
//                         Location: /api/students/11
//                         {"id":11,"name":"sohan","city":"mumbai"}
// DELETE /api/students/11 -> 204 No Content (empty body)`,
                `// Turning a missing resource into a real 404 instead of a 500
@ResponseStatus(HttpStatus.NOT_FOUND)
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(int id) {
        super("No student with id " + id);
    }
}

// ...or centrally, with the shape of the error body under your control:
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(StudentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 404,
                "message", ex.getMessage()));
    }
}
// OUTPUT:
// GET /api/students/999
// 404 Not Found
// {"timestamp":"2023-07-19T10:22:41Z","status":404,"message":"No student with id 999"}`
            ]
        },
        {
            content: `<h3>Binding Request Data - Which Annotation, and When</h3>
<code>@PathVariable</code>, <code>@RequestParam</code> and <code>@RequestBody</code> read three different parts of the request. Choosing between them is not a style question.<br><br>

<table>
<tr><th>Annotation</th><th>Reads from</th></tr>
<tr><td>@PathVariable</td><td>A segment of the URI path - <code>/students/<strong>10</strong></code>. Use it to identify <em>which</em> resource.</td></tr>
<tr><td>@RequestParam</td><td>The query string - <code>?city=pune&amp;page=2</code>. Use it to filter, sort or paginate.</td></tr>
<tr><td>@RequestBody</td><td>The HTTP body. Use it for the resource itself on POST and PUT.</td></tr>
<tr><td>@RequestHeader</td><td>One HTTP header - <code>Authorization</code>, <code>Accept-Language</code>.</td></tr>
</table>
<br>
<strong>@RestController vs @Controller:</strong> <code>@RestController</code> is <code>@Controller</code> plus <code>@ResponseBody</code> applied to every method. That is why the examples above never write <code>@ResponseBody</code> - it is already there. A plain <code>@Controller</code> returns a view name for a template engine to render.<br>`,
            codeExamples: [
                `@GetMapping("/api/students")
public Page<Student> search(
        @RequestParam(required = false) String city,          // ?city=pune
        @RequestParam(defaultValue = "0")  int page,          // ?page=2
        @RequestParam(defaultValue = "20") int size,
        @RequestHeader("Accept-Language") String lang) {

    return service.search(city, PageRequest.of(page, size));
}
// REQUEST:  GET /api/students?city=pune&page=0&size=2
// RESPONSE:
// {
//   "content": [ {"id":10,"name":"ajay","city":"pune"} ],
//   "totalElements": 1,
//   "totalPages": 1
// }`,
                `// Validation: @Valid turns a bad payload into 400, not 500
public class Student {

    @NotBlank(message = "name is required")
    private String name;

    @Min(value = 1, message = "age must be positive")
    private int age;

    @Email
    private String email;
}

@PostMapping("/api/students")
public Student create(@Valid @RequestBody Student student) { ... }
// Needs spring-boot-starter-validation on the classpath.
// REQUEST body: {"name":"","age":-3,"email":"nope"}
// RESPONSE: 400 Bad Request
// {"status":400,"errors":["name is required","age must be positive",
//                         "email must be a well-formed email address"]}`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does REST stand for, and what kind of thing is it?</td><td>REpresentational State Transfer. It is an architectural style - a set of constraints - not a protocol or a library.</td></tr>
<tr><td>What are the four main HTTP methods and their purposes?</td><td>GET reads, POST creates, PUT updates, DELETE removes.</td></tr>
<tr><td>What does "stateless" mean, and why does it matter?</td><td>The server keeps no client session between requests, so any instance can serve any request. Break it with HttpSession and the API stops scaling horizontally.</td></tr>
<tr><td>@RestController vs @Controller?</td><td>@RestController = @Controller + @ResponseBody on every method, so return values are written to the response body instead of resolved as a view name.</td></tr>
<tr><td>@PathVariable vs @RequestParam?</td><td>@PathVariable reads a URI path segment and identifies which resource; @RequestParam reads the query string and is used for filtering, sorting and paging.</td></tr>
<tr><td>What does @RequestBody do?</td><td>Converts the inbound HTTP body - usually JSON - into the Java object passed to the handler method, via Jackson.</td></tr>
<tr><td>How does a Java object become JSON without any conversion code?</td><td>Jackson arrives with spring-boot-starter-web, and an HttpMessageConverter serialises the return value automatically.</td></tr>
<tr><td>Which status code for a successful POST?</td><td>201 Created, with a Location header naming the new resource.</td></tr>
<tr><td>How do you return 404 instead of 500 for a missing record?</td><td>Annotate the exception with <code>@ResponseStatus(HttpStatus.NOT_FOUND)</code>, or handle it in a <code>@RestControllerAdvice</code>.</td></tr>
<tr><td>PUT vs PATCH?</td><td>PUT replaces the whole resource and is idempotent; PATCH applies a partial update.</td></tr>
<tr><td>Which methods are idempotent?</td><td>GET, PUT and DELETE - repeating them leaves the same end state. POST is not.</td></tr>
<tr><td>Why is <code>GET /deleteStudent?id=10</code> wrong?</td><td>GET must be safe and must not change state. A crawler or a browser prefetch would start deleting records.</td></tr>
<tr><td>REST vs SOAP?</td><td>REST is a style over HTTP, usually with JSON, lightweight and cacheable. SOAP is a protocol with a strict XML envelope, WSDL contracts and built-in WS-* standards.</td></tr>
</table>`
        }
    ]
};
