import { Topic } from '../coreJava';

export const springBootSwagger: Topic = {
    id: 'spring-boot-swagger',
    name: 'API Documentation with Swagger / OpenAPI',
    beginner: [
        {
            content: `<h3>What is Swagger?</h3>
<div class="border">
• Swagger is used for <strong>documenting the API</strong>, and you can write or edit that documentation.<br>
• Swagger 2 is an open-source project used to generate REST API documents for RESTful web services.<br>
• It provides a <strong>user interface</strong> to access your RESTful web services through the web browser.<br>
</div><br>

<h3>Why do we use Swagger?</h3>
Suppose you have an API with several fields - first name, last name, city, mobile number - and in future you want to add more fields and make further changes to the service. Updating a document manually every time is a big and tedious task, and the document drifts out of date the moment someone forgets.<br><br>

Swagger reads the <strong>code itself</strong>, so the documentation cannot fall behind the API.<br><br>

<h3>Steps</h3>
<div class="border">
1-8. Build the usual project: model, service, implementation, repository, REST controller, application.properties<br>
9. Add the Swagger Maven dependencies<br>
10. Add <code>@EnableSwagger2</code> and a <code>Docket</code> bean to the main class<br>
11. Annotate the controller methods with descriptions<br>
12. Run the application<br>
13. Open the browser at the Swagger URL<br>
14. Try the endpoints from the UI
</div>`,
            codeExamples: [
                `// Step 3 - Employee.java
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String city;

    public int getId() { return id; }

    public void setId(int id) {
        this.id = id;        // this line must not be commented out
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    @Override
    public String toString() {
        return "Employee [id=" + id + ", name=" + name + ", city=" + city + "]";
    }
}
// In the original, setId's body is inside a trailing comment:
//     // System.out.println("id>>>>"+id); this.id = id;
// so the id is never assigned. Watch for that pattern - a
// single-line comment swallowing the statement after it.`,
                `// Step 4/5 - service and implementation
public interface EmployeeService {
    Employee saveEmployee(Employee employee);
    Employee updateEmployee(Employee employee);
    Employee getEmployeeById(Integer id);
    Iterable<Employee> getAllEmployee();
}

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Employee getEmployeeById(Integer id) {
        return employeeRepository.findById(id).orElse(null);
    }

    @Override
    public Iterable<Employee> getAllEmployee() {
        return employeeRepository.findAll();
    }
}
// The interface must declare EVERY method the controller calls.
// The original controller calls getAllEmployee() and
// getEmployeeById() without declaring them - that will not compile.`
            ]
        },
        {
            content: `<h3>Step 9 - Add the Swagger Dependencies</h3>
Springfox provides both the generator and the web UI.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>

<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
<!-- springfox-swagger2 scans the controllers and produces the
     OpenAPI JSON; springfox-swagger-ui serves the HTML page
     that renders it. -->`,
                `# Step 8 - application.properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/8julyspringbootbatch
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`
            ]
        },
        {
            content: `<h3>Step 10 - Enable Swagger in the Main Class</h3>
Two things go here: the <code>@EnableSwagger2</code> annotation, and a <code>Docket</code> bean that tells Swagger which endpoints to document.<br><br>

<table>
<tr><th>Piece</th><th>Purpose</th></tr>
<tr><td><code>@EnableSwagger2</code></td><td>Switches on Springfox's auto-configuration.</td></tr>
<tr><td><code>Docket</code></td><td>The configuration object - which paths and which controllers to include.</td></tr>
<tr><td><code>RequestHandlerSelectors.any()</code></td><td>Scan every controller.</td></tr>
<tr><td><code>PathSelectors.any()</code></td><td>Include every path.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
@EnableSwagger2
public class SpringBootEmployeeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootEmployeeApplication.class, args);
    }

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.any())
                .paths(PathSelectors.any())
                .build();
    }
}
// The casts to (Predicate<RequestHandler>) and (Predicate<String>)
// in the original are not needed and pull in Guava's Predicate,
// which conflicts with java.util.function.Predicate on newer
// Springfox versions. Leave them out.`,
                `// A more useful Docket - scan only your own package, and
// add a title and version to the generated page
@Bean
public Docket api() {
    return new Docket(DocumentationType.SWAGGER_2)
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.velocity.restcontroller"))
            .paths(PathSelectors.ant("/api/**"))
            .build()
            .apiInfo(new ApiInfoBuilder()
                    .title("Employee Management API")
                    .description("REST endpoints for employee records")
                    .version("1.0.0")
                    .build());
}
// RequestHandlerSelectors.any() also documents Spring's own
// error-handling endpoints, which is noise on the page.`
            ]
        },
        {
            content: `<h3>Step 11 - Document the Controller Methods</h3>
The annotations turn a bare endpoint list into readable documentation.<br><br>

<table>
<tr><th>Annotation</th><th>Purpose</th></tr>
<tr><td>@ApiOperation</td><td>A one-line description of what the method does.</td></tr>
<tr><td>@ApiResponses / @ApiResponse</td><td>The status codes the endpoint can return, with a message for each.</td></tr>
<tr><td>@Api</td><td>On the class - names and describes the whole controller group.</td></tr>
<tr><td>@ApiParam</td><td>Describes a single parameter.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.velocity.model.Employee;
import com.velocity.service.EmployeeService;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

@RestController
@Api(tags = "Employee", description = "Create, read and update employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/saveEmployee")
    @ApiOperation(value = "This method is used to save the employee details")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "ok"),
            @ApiResponse(code = 404, message = "not found") })
    public Employee saveEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    @PutMapping("/updateEmployee")
    @ApiOperation(value = "This method is used to update employee details")
    public Employee updateEmployee(@RequestBody Employee employee) {
        return employeeService.updateEmployee(employee);
    }

    @GetMapping("/getAll")
    @ApiOperation(value = "This method is used to get all employee details")
    public Iterable<Employee> getAllEmployee() {
        return employeeService.getAllEmployee();
    }

    @GetMapping("/get/{id}")
    @ApiOperation(value = "This method is used to get the employee details by id")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "ok"),
            @ApiResponse(code = 404, message = "not found") })
    public Employee getEmployeeById(@PathVariable("id") Integer id) {
        return employeeService.getEmployeeById(id);
    }
}`
            ]
        },
        {
            content: `<h3>Steps 12 to 14 - Open the UI and Try It</h3>
Run the application, then open the browser at:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">http://localhost:8080/swagger-ui.html</pre>
<br>
The page lists every endpoint with its method, path and description. For each one:<br><br>

<div class="border">
1. Click the endpoint to expand it.<br>
2. Click <strong>Try it out</strong>.<br>
3. Fill in the parameters or the request body.<br>
4. Click <strong>Execute</strong>.<br>
5. The response body, status code and headers appear below - and the console shows the SQL.
</div><br>

<table>
<tr><th>URL</th><th>What it serves</th></tr>
<tr><td>/swagger-ui.html</td><td>The interactive HTML page (Springfox 2.x).</td></tr>
<tr><td>/v2/api-docs</td><td>The raw OpenAPI JSON the page is built from.</td></tr>
</table>`,
            codeExamples: [
                `// The page shows something like:

// Employee : Create, read and update employees
//
//  POST   /saveEmployee     This method is used to save the employee details
//  PUT    /updateEmployee   This method is used to update employee details
//  GET    /getAll           This method is used to get all employee details
//  GET    /get/{id}         This method is used to get the employee details by id`,
                `// Trying GET /get/{id} from the UI:
// enter id = 1, click Execute

// Request URL
// http://localhost:8080/get/1

// Response body (200 OK)
{
    "id": 1,
    "name": "ajay",
    "city": "pune"
}

// CONSOLE:
// Hibernate: select employee0_.id, employee0_.city, employee0_.name
//            from employee employee0_ where employee0_.id=?`,
                `// Trying POST /saveEmployee from the UI - the page pre-fills
// an example body from the Employee model:
{
    "name": "sohan",
    "city": "mumbai"
}
// Click Execute:
// Response body (200 OK)
{
    "id": 2,
    "name": "sohan",
    "city": "mumbai"
}
// CONSOLE:
// Hibernate: insert into employee (city, name) values (?, ?)
// Check the database and the new row is there.`,
                `// The raw document behind the page:
// GET http://localhost:8080/v2/api-docs
{
  "swagger": "2.0",
  "info": { "title": "Employee Management API", "version": "1.0.0" },
  "paths": {
    "/get/{id}": {
      "get": {
        "summary": "This method is used to get the employee details by id",
        "parameters": [ { "name": "id", "in": "path", "type": "integer" } ],
        "responses": { "200": { "description": "ok" },
                       "404": { "description": "not found" } }
      }
    }
  },
  "definitions": { "Employee": { "properties": {
      "id":   { "type": "integer" },
      "name": { "type": "string" },
      "city": { "type": "string" } } } }
}
// This JSON is what makes Swagger more than a web page - see the
// Expert tab.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Springfox Is Dead - Use springdoc-openapi</h3>
This is the most important practical point about the walkthrough. <strong>Springfox 2.9.2 dates from 2018 and the project is abandoned</strong> - its last release was 3.0.0 in 2020.<br><br>

<table>
<tr><th>Springfox on...</th><th>Result</th></tr>
<tr><td>Spring Boot 2.0-2.5</td><td>Works.</td></tr>
<tr><td>Spring Boot 2.6+</td><td>Fails at startup - <code>Failed to start bean 'documentationPluginsBootstrapper'</code>, caused by the change from ant-path-matcher to PathPatternParser.</td></tr>
<tr><td>Spring Boot 3.x</td><td>Does not work at all - Springfox uses <code>javax.*</code>, Boot 3 uses <code>jakarta.*</code>.</td></tr>
</table>
<br>
The replacement is <strong>springdoc-openapi</strong>: actively maintained, supports OpenAPI 3, and needs <em>no</em> <code>@EnableSwagger2</code> and no <code>Docket</code> bean at all.<br>`,
            codeExamples: [
                `# The Springfox failure on Boot 2.6+, in full:
org.springframework.context.ApplicationContextException:
  Failed to start bean 'documentationPluginsBootstrapper';
  nested exception is java.lang.NullPointerException

# The documented workaround is to revert the path matching strategy:
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
# It works, and it means opting out of a Spring improvement to keep
# an unmaintained library alive. Migrate instead.`,
                `<!-- springdoc for Spring Boot 3.x -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>

<!-- springdoc for Spring Boot 2.x -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.7.0</version>
</dependency>`,
                `// The whole configuration - there is none.
@SpringBootApplication
public class SpringBootEmployeeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringBootEmployeeApplication.class, args);
    }
}
// No @EnableSwagger2, no Docket bean.
// OUTPUT:
//   UI   -> http://localhost:8080/swagger-ui.html
//   JSON -> http://localhost:8080/v3/api-docs
//
// Optional metadata, if you want it:
@Bean
OpenAPI apiInfo() {
    return new OpenAPI().info(new Info()
            .title("Employee Management API")
            .version("1.0.0")
            .description("REST endpoints for employee records"));
}`,
                `// The annotations change package and get slightly clearer names
// Springfox (io.swagger.annotations)  ->  springdoc (io.swagger.v3.oas.annotations)

@Tag(name = "Employee", description = "Create, read and update employees")
@RestController
public class EmployeeController {

    @Operation(summary = "Get employee details by id")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "found"),
            @ApiResponse(responseCode = "404", description = "no such employee")
    })
    @GetMapping("/api/employees/{id}")
    public EmployeeResponse get(
            @Parameter(description = "employee id") @PathVariable Integer id) {
        ...
    }
}
// @Api          -> @Tag
// @ApiOperation -> @Operation
// @ApiParam     -> @Parameter
// @ApiResponse(code=200, message="ok")
//               -> @ApiResponse(responseCode="200", description="ok")`
            ]
        },
        {
            content: `<h3>The JSON Document Is the Real Product</h3>
The browser page is the part people notice. The <code>/v3/api-docs</code> JSON is the part that pays for itself, because it is a machine-readable contract other tools consume.<br><br>

<table>
<tr><th>Consumer</th><th>What it does with the spec</th></tr>
<tr><td>openapi-generator</td><td>Generates a typed client in Java, TypeScript, Python, Go...</td></tr>
<tr><td>Postman / Insomnia</td><td>Imports the whole API as a ready-made collection.</td></tr>
<tr><td>API gateways</td><td>Configure routing, rate limits and validation from it.</td></tr>
<tr><td>Contract tests</td><td>Fail the build when a response stops matching the schema.</td></tr>
<tr><td>Spectral / linters</td><td>Enforce naming and versioning rules across teams.</td></tr>
<tr><td>Diff tools</td><td>Detect breaking changes between two versions in CI.</td></tr>
</table>`,
            codeExamples: [
                `# Generate a TypeScript client for the frontend team
npx @openapitools/openapi-generator-cli generate \\
    -i http://localhost:8080/v3/api-docs \\
    -g typescript-axios \\
    -o ./frontend/src/api

# The frontend now calls:
#   const employee = await employeeApi.getEmployeeById(1);
# fully typed, and it stops compiling the moment the API changes
# incompatibly.`,
                `<!-- Catch breaking API changes in CI, before release -->
<plugin>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-maven-plugin</artifactId>
    <executions>
        <execution>
            <phase>integration-test</phase>
            <goals><goal>generate</goal></goals>
        </execution>
    </executions>
    <configuration>
        <apiDocsUrl>http://localhost:8080/v3/api-docs</apiDocsUrl>
        <outputFileName>openapi.json</outputFileName>
    </configuration>
</plugin>

# Commit openapi.json, then in CI:
#   openapi-diff released/openapi.json target/openapi.json --fail-on-incompatible
# OUTPUT:
#   [BREAKING] GET /api/employees/{id}: response property 'city' removed`
            ]
        },
        {
            content: `<h3>Never Expose Swagger UI in Production Unprotected</h3>
The UI publishes every endpoint, every parameter, every model field - and lets anyone who can reach it <strong>execute</strong> those endpoints. On a public server that is a self-service map of your attack surface.<br><br>

<table>
<tr><th>Approach</th><th>Trade-off</th></tr>
<tr><td>Disable it in prod</td><td>Simplest and safest. Docs still available in dev and test.</td></tr>
<tr><td>Serve it on the management port</td><td>Reachable inside the network only.</td></tr>
<tr><td>Require authentication</td><td>Keeps it available to your own team.</td></tr>
<tr><td>Publish the JSON to a portal</td><td>The right answer for a genuinely public API - docs without a live "Execute" button.</td></tr>
</table>`,
            codeExamples: [
                `# application-prod.properties - switch it off entirely
springdoc.api-docs.enabled=false
springdoc.swagger-ui.enabled=false

# application-dev.properties - on, and tidy
springdoc.api-docs.enabled=true
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha
springdoc.packagesToScan=com.velocity.restcontroller`,
                `// Or keep it, behind authentication
@Configuration
public class SwaggerSecurityConfig {

    @Bean
    SecurityFilterChain docsChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**")
            .authorizeHttpRequests(auth -> auth.anyRequest().hasRole("DEVELOPER"))
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
// OUTPUT:
// GET /swagger-ui.html -> 401 Unauthorized without credentials`,
                `// Documenting a secured API so "Try it out" can send the token
@Bean
OpenAPI apiInfo() {
    final String scheme = "bearerAuth";
    return new OpenAPI()
            .info(new Info().title("Employee API").version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList(scheme))
            .components(new Components().addSecuritySchemes(scheme,
                    new SecurityScheme()
                            .name(scheme)
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")));
}
// OUTPUT: an "Authorize" button appears on the page; paste a JWT
// once and every subsequent Try-it-out call carries it.`
            ]
        },
        {
            content: `<h3>Good Documentation Comes From Good DTOs</h3>
Swagger documents whatever types your controller signatures use. Point it at JPA entities and the generated schema inherits every problem the entity has.<br><br>

<table>
<tr><th>Entity in the signature</th><th>What Swagger publishes</th></tr>
<tr><td>Every column, including internal ones</td><td><code>passwordHash</code>, <code>deleted</code>, audit fields - all documented as part of your public contract.</td></tr>
<tr><td>Bidirectional associations</td><td>Recursive schemas that render as an unusable nested blob.</td></tr>
<tr><td>Database naming</td><td>Column names become the documented API field names.</td></tr>
<tr><td>No validation metadata</td><td>Nothing tells the reader which fields are required or what their limits are.</td></tr>
</table>
<br>
DTOs annotated with Bean Validation solve the last row for free: springdoc reads <code>@NotBlank</code>, <code>@Size</code> and <code>@Min</code> and puts the constraints straight into the schema.<br>`,
            codeExamples: [
                `public record EmployeeRequest(

        @Schema(description = "Full name", example = "ajay patil")
        @NotBlank @Size(max = 100)
        String name,

        @Schema(description = "City of posting", example = "pune")
        @NotBlank @Size(max = 60)
        String city) { }

public record EmployeeResponse(
        @Schema(example = "1")    Integer id,
        @Schema(example = "ajay") String name,
        @Schema(example = "pune") String city) { }`,
                `// The generated schema now carries the rules AND the examples:
// "EmployeeRequest": {
//   "required": ["name", "city"],
//   "properties": {
//     "name": { "type": "string", "maxLength": 100,
//               "description": "Full name", "example": "ajay patil" },
//     "city": { "type": "string", "maxLength": 60,
//               "description": "City of posting", "example": "pune" }
//   }
// }
//
// The Try-it-out box is pre-filled with the examples, and a generated
// client validates the length before the request is even sent.`,
                `// Documenting the error shape matters as much as the success shape
@Operation(summary = "Get employee by id")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Employee found",
        content = @Content(schema = @Schema(implementation = EmployeeResponse.class))),
    @ApiResponse(responseCode = "404", description = "No employee with that id",
        content = @Content(schema = @Schema(implementation = ApiError.class))),
    @ApiResponse(responseCode = "400", description = "Malformed id",
        content = @Content(schema = @Schema(implementation = ApiError.class)))
})
@GetMapping("/api/employees/{id}")
public EmployeeResponse get(@PathVariable Integer id) { ... }
// Without the content blocks the page says "404 not found" and
// shows nothing about the body a client should expect to parse.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Swagger used for?</td><td>Generating REST API documentation from the code, plus a browser UI for trying the endpoints live.</td></tr>
<tr><td>Why generate docs instead of writing them?</td><td>Hand-written docs drift out of date the first time someone forgets to update them; generated docs cannot.</td></tr>
<tr><td>Which two Springfox dependencies are needed?</td><td><code>springfox-swagger2</code> generates the spec; <code>springfox-swagger-ui</code> serves the HTML page.</td></tr>
<tr><td>What does the Docket bean do?</td><td>Configures which controllers and paths are documented, and carries the API title, version and description.</td></tr>
<tr><td>What is the difference between the UI page and /v2/api-docs?</td><td>The page is HTML for humans; the JSON is the machine-readable OpenAPI spec that tools consume.</td></tr>
<tr><td>Why should you not use Springfox in a new project?</td><td>It is abandoned - it breaks on Spring Boot 2.6+ and does not work on Boot 3 at all because of the javax-to-jakarta move.</td></tr>
<tr><td>What replaces it?</td><td><code>springdoc-openapi</code>, which needs no <code>@EnableSwagger2</code> and no <code>Docket</code> bean.</td></tr>
<tr><td>What are the springdoc URLs?</td><td><code>/swagger-ui.html</code> for the page and <code>/v3/api-docs</code> for the OpenAPI 3 JSON.</td></tr>
<tr><td>What does @ApiOperation do?</td><td>Adds a description to one endpoint. In springdoc it is <code>@Operation</code>.</td></tr>
<tr><td>What can you do with the OpenAPI JSON?</td><td>Generate typed clients, import into Postman, configure gateways, run contract tests, and diff versions to catch breaking changes in CI.</td></tr>
<tr><td>Why is Swagger UI risky in production?</td><td>It publishes every endpoint and model and lets anyone execute them. Disable it in prod, or put it behind authentication or an internal port.</td></tr>
<tr><td>Why document DTOs rather than entities?</td><td>Entities leak internal columns, produce recursive schemas from bidirectional associations, and tie the documented contract to the database schema.</td></tr>
</table>`
        }
    ]
};
