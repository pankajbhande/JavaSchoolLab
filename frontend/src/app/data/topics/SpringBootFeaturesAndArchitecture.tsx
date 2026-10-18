import { Topic } from '../coreJava';

export const springBootFeaturesAndArchitecture: Topic = {
    id: 'spring-boot-features-architecture',
    name: 'Spring Boot Features & Architecture',
    beginner: [
        {
            content: `<h3>What is Spring Boot?</h3>
Spring Boot is a module of the Spring framework that brings <strong>RAD</strong> - Rapid Application Development - to Spring. It was developed by the <strong>Pivotal team in 2014</strong>.<br><br>

The framework itself did not change: Spring Boot is Spring, plus opinionated defaults, plus an embedded server, minus the XML.<br>`
        },
        {
            content: `<h3>Features of Spring Boot - Part 1</h3>

<table>
<tr><th>Feature</th><th>What it gives you</th></tr>
<tr><td>1. Spring Application</td><td>A class whose <code>run()</code> method starts or launches the Spring Boot application. It creates the ApplicationContext object internally.</td></tr>
<tr><td>2. Lazy Initialization</td><td>Once enabled, beans are created as they are needed rather than during application startup.</td></tr>
<tr><td>3. Admin Features</td><td>Monitor one or many Spring Boot application endpoints through the Actuator - beans, health, dumps, logger, info, metrics, mappings and more.</td></tr>
<tr><td>4. Security</td><td>Several kinds of authentication for endpoint URLs and REST endpoints, including OAuth and JWT, so unauthorised users cannot reach them. Also supports encrypting and decrypting passwords.</td></tr>
<tr><td>5. Logging</td><td>Keeps track of everything the application does. The log file carries exception details with date and time, so you can find where an error occurred.</td></tr>
<tr><td>6. Caching</td><td>Reduces the number of executions by serving results already held in the cache, which makes data access much faster.</td></tr>
<tr><td>7. Validation</td><td>Annotations on the bean class check a field at field level - not null, not empty, minimum and maximum values.</td></tr>
<tr><td>8. JSON</td><td>Read and write data in JSON, the key-and-value format used by web APIs.</td></tr>
<tr><td>9. Testing</td><td>Test the application with JUnit; Spring Boot supplies annotations dedicated to this.</td></tr>
<tr><td>10. Task Scheduling</td><td>Schedule and execute a task on a fixed period, so manual effort is removed and jobs are automated.</td></tr>
<tr><td>11. Email Sending</td><td>Libraries such as SMTP support let the application send mail, with or without attachments.</td></tr>
<tr><td>12. Multiple Database Handling</td><td>Several database configurations in one application.properties file - MySQL, Oracle, MongoDB and others together.</td></tr>
</table>`
        },
        {
            content: `<h3>Features of Spring Boot - Part 2</h3>

<table>
<tr><th>Feature</th><th>What it gives you</th></tr>
<tr><td>13. Profile Support</td><td>Multiple profiles for different environments - dev, test, prod.</td></tr>
<tr><td>14. Properties file</td><td>Settings live in application.properties, e.g. <code>server.port = 8082</code>.</td></tr>
<tr><td>15. Deploy on Cloud</td><td>Deploy the application to AWS, Heroku and other cloud providers.</td></tr>
<tr><td>16. Avoid XML File</td><td>A plain Spring application needs XML configuration to run, which is a difficult process. Spring Boot does not use heavy XML configuration files.</td></tr>
<tr><td>17. Embedded Tomcat Server</td><td>No external server is needed to run the application - Apache Tomcat is built in.</td></tr>
<tr><td>18. Third Party Integration</td><td>Supports payment gateways, Kafka, Docker, Kubernetes, Jenkins and more.</td></tr>
<tr><td>19. Error Handling</td><td>Send a custom error message to the client so the failure is easy to understand.</td></tr>
<tr><td>20. Rest Template</td><td>Consume one RESTful web service from inside another.</td></tr>
<tr><td>21. Metrics and Health Check</td><td>Through the Actuator, inspect application health and many other runtime details.</td></tr>
<tr><td>22. Externalized Configuration</td><td>Move configuration outside the code so the same application runs in different environments. Use properties files, YAML files, environment variables or command-line arguments.</td></tr>
<tr><td>23. Starter Dependencies</td><td>A special dependency for one particular feature. Building a web application? Add spring-boot-starter-web. Need REST endpoints? The same starter covers it.</td></tr>
<tr><td>24. Automatic Configuration</td><td>Creates Spring beans for you and scans the packages and their classes.</td></tr>
<tr><td>25. Rapid Application Development</td><td>The sum of all the above - applications get built fast.</td></tr>
</table>`
        },
        {
            content: `<h3>Spring Boot Dependencies and Their Purpose</h3>

<table>
<tr><th>Starter</th><th>Purpose</th></tr>
<tr><td>spring-boot-starter</td><td>The base starter, used by every Spring-based application.</td></tr>
<tr><td>spring-boot-starter-web</td><td>Used to write REST endpoints.</td></tr>
<tr><td>spring-boot-starter-actuator</td><td>Used to monitor and manage the application.</td></tr>
<tr><td>spring-boot-starter-security</td><td>Used for Spring Security.</td></tr>
<tr><td>spring-boot-starter-test</td><td>Used for writing test cases.</td></tr>
</table>

<h3>Spring Boot Annotations</h3>

<table>
<tr><th>Annotation</th><th>Purpose</th></tr>
<tr><td>@SpringBootApplication</td><td>Marks the class that holds the main method used to run the Spring Boot application.</td></tr>
<tr><td>@ComponentScan</td><td>Scans all the beans - Spring bean classes and model classes - and the package declarations under the base package.</td></tr>
<tr><td>@EnableAutoConfiguration</td><td>Scans the sub-packages and all the classes available in the Spring Boot application, and configures beans to match.</td></tr>
</table>
<br>
<strong>Note:</strong> <code>@SpringBootApplication</code> is equivalent to <code>@Configuration</code> + <code>@ComponentScan</code> + <code>@EnableAutoConfiguration</code> written together.<br>`,
            codeExamples: [
                `package com.velocity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication      // = @Configuration + @ComponentScan + @EnableAutoConfiguration
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
// OUTPUT:
//   .   ____          _            __ _ _
//  /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
// ( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
//  \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
//   '  |____| .__|_| |_|_| |_\\__, | / / / /
//  =========|_|==============|___/=/_/_/_/
// Tomcat started on port(s): 8080 (http)
// Started DemoApplication in 1.9 seconds`
            ]
        },
        {
            content: `<h3>Spring Boot Architecture</h3>
A Spring Boot application is organised into five layers. Each one has a single responsibility, and a request travels down through them and back up.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        +-------------------------------+
        |  1. CLIENT LAYER              |   JSP / HTML / Angular / React
        |     Presentation logic        |
        +-------------------------------+
                    |  HTTP request
                    v
        +-------------------------------+
        |  2. API / CONTROLLER LAYER    |   @RestController
        |     RESTful web services      |
        +-------------------------------+
                    |
                    v
        +-------------------------------+
        |  3. SERVICE LAYER             |   @Service
        |     Business logic            |   interfaces + implementations
        +-------------------------------+
                    |
                    v
        +-------------------------------+
        |  4. DAO / REPOSITORY LAYER    |   @Repository
        |     Persistence logic         |
        +-------------------------------+
                    |
                    v
        +-------------------------------+
        |  5. DATABASE LAYER            |   MySQL / Oracle
        |     insert, update, delete, get|
        +-------------------------------+</pre>

<table>
<tr><th>Layer</th><th>Responsibility</th></tr>
<tr><td>1. Client Layer</td><td>Presentation logic - the UI, built with JSP, HTML or Angular.</td></tr>
<tr><td>2. API Layer</td><td>The RESTful web services that receive requests and return responses.</td></tr>
<tr><td>3. Service Layer</td><td>All the business logic. Contains interfaces and their implementations.</td></tr>
<tr><td>4. DAO Layer</td><td>All the storage logic; translates business objects to and from database rows.</td></tr>
<tr><td>5. Database Layer</td><td>Where insert, update, delete and get operations actually run.</td></tr>
</table>`,
            codeExamples: [
                `// The three middle layers, as they look in code.

// 2. API LAYER
@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) { this.service = service; }

    @GetMapping("/{id}")
    public Student get(@PathVariable int id) {
        return service.findById(id);        // no business logic here
    }
}

// 3. SERVICE LAYER
@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository repository;

    public StudentServiceImpl(StudentRepository repository) { this.repository = repository; }

    @Override
    public Student findById(int id) {
        return repository.findById(id)
                         .orElseThrow(() -> new StudentNotFoundException(id));
    }
}

// 4. DAO LAYER
@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
}
// OUTPUT:
// GET /api/students/10 -> {"id":10,"name":"ajay","city":"pune"}
// Each layer talks only to the one below it. That is the whole point:
// swap the database and only the DAO layer changes.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why the Layers Exist - the Rule That Makes Them Worth It</h3>
Splitting a project into four packages is not architecture on its own. The value comes from one rule: <strong>a layer may call the layer directly below it and nothing else.</strong> Break that rule and you get the two most common failures in Spring Boot codebases.<br><br>

<table>
<tr><th>Anti-pattern</th><th>Why it hurts</th></tr>
<tr><td>Controller calls the repository directly</td><td>Business rules end up in the controller, where they cannot be reused by a scheduled job or a message listener, and cannot be unit-tested without MockMvc.</td></tr>
<tr><td>JPA entity returned straight from the controller</td><td>The database schema becomes your public API contract. Renaming a column breaks every client, and lazy associations blow up during JSON serialisation.</td></tr>
<tr><td>Service layer imports HttpServletRequest</td><td>Business logic is now tied to HTTP and cannot run from a Kafka consumer or a CLI runner.</td></tr>
<tr><td>@Transactional on the controller</td><td>The transaction spans JSON serialisation and view rendering, holding a database connection far longer than needed.</td></tr>
</table>
<br>
The fix for the second row is a <strong>DTO</strong>: a separate class shaped for the API, so the entity never leaves the service layer.<br>`,
            codeExamples: [
                `// The entity - shaped for the database
@Entity
public class Student {
    @Id private Integer id;
    private String name;
    private String city;
    private String passwordHash;                     // must never reach a client
    @OneToMany(fetch = FetchType.LAZY)
    private List<Enrollment> enrollments;            // would blow up in JSON
}

// The DTO - shaped for the API
public record StudentResponse(Integer id, String name, String city) { }

// The service maps between them, so the controller never sees the entity
@Service
public class StudentServiceImpl implements StudentService {

    @Override
    public StudentResponse findById(int id) {
        Student s = repository.findById(id).orElseThrow();
        return new StudentResponse(s.getId(), s.getName(), s.getCity());
    }
}
// OUTPUT:
// {"id":10,"name":"ajay","city":"pune"}
// passwordHash and enrollments cannot leak, because the response type
// has no room for them.`
            ]
        },
        {
            content: `<h3>Lazy Initialization Is a Trade, Not a Free Win</h3>
Feature 2 in the list is easy to switch on and easy to regret. Turning it on globally makes startup measurably faster - useful for a large application in local development - and moves every configuration error from startup to the first request that touches the broken bean.<br><br>

<table>
<tr><th>Setting</th><th>Effect</th></tr>
<tr><td><code>spring.main.lazy-initialization=true</code></td><td>Every bean becomes lazy. Fast boot, late failures.</td></tr>
<tr><td><code>@Lazy</code> on one bean</td><td>Only that bean waits. This is the version worth using in production - typically for an expensive client that most requests never touch.</td></tr>
<tr><td><code>@Lazy(false)</code></td><td>Forces one bean to stay eager even under global lazy init - the escape hatch for a bean whose configuration you want validated at boot.</td></tr>
</table>
<br>
The usual advice: enable it in a dev profile, never in the profile you deploy. A misconfigured datasource should break the deployment, not the first customer.<br>`,
            codeExamples: [
                `# application-dev.properties -- fast local restarts
spring.main.lazy-initialization=true

# application-prod.properties -- fail fast, in front of the pipeline
spring.main.lazy-initialization=false`,
                `@Service
@Lazy                                  // only this bean is deferred
public class PdfRenderingService {

    public PdfRenderingService() {
        System.out.println("Loading fonts and templates...");   // ~2 seconds
    }
}
// OUTPUT:
// Startup completes without printing anything.
// "Loading fonts and templates..." appears on the first request
// that actually needs a PDF.`
            ]
        },
        {
            content: `<h3>What "Avoid XML File" Really Replaced</h3>
Feature 16 undersells itself. Spring Boot did not just delete XML - it replaced three separate things that a classic Spring MVC project had to set up by hand.<br><br>

<table>
<tr><th>Classic Spring MVC</th><th>Spring Boot equivalent</th></tr>
<tr><td><code>web.xml</code> registering DispatcherServlet</td><td>Auto-configured by <code>spring-boot-starter-web</code></td></tr>
<tr><td><code>applicationContext.xml</code> declaring every bean</td><td><code>@ComponentScan</code> from <code>@SpringBootApplication</code></td></tr>
<tr><td><code>dispatcher-servlet.xml</code> for view resolvers, converters, static resources</td><td><code>WebMvcAutoConfiguration</code>, overridable via <code>WebMvcConfigurer</code></td></tr>
<tr><td>A Tomcat install, and a WAR copied into <code>webapps/</code></td><td>Embedded Tomcat inside an executable jar; <code>java -jar app.jar</code></td></tr>
<tr><td>Matching jar versions by hand</td><td>The starter BOM pins a tested, compatible set</td></tr>
</table>
<br>
Auto-configuration is not magic. Each auto-configuration class is guarded by <code>@Conditional*</code> checks - <code>@ConditionalOnClass</code> asks whether a library is on the classpath, <code>@ConditionalOnMissingBean</code> asks whether you already defined one yourself. That second condition is why <strong>defining your own bean of a type always wins</strong> over the auto-configured one. Run with <code>--debug</code> to print the Conditions Evaluation Report and see exactly which auto-configurations matched and why.<br>`
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Spring Boot and who created it?</td><td>A Spring framework module that adds Rapid Application Development to Spring, built by the Pivotal team in 2014.</td></tr>
<tr><td>Spring vs Spring Boot?</td><td>Spring Boot is not a replacement - it is Spring with opinionated auto-configuration, starter dependencies and an embedded server, so no XML and no external Tomcat.</td></tr>
<tr><td>What are the five layers of the architecture?</td><td>Client (presentation), API/Controller (REST), Service (business logic), DAO (persistence), Database.</td></tr>
<tr><td>What three annotations does @SpringBootApplication combine?</td><td>@Configuration, @ComponentScan and @EnableAutoConfiguration.</td></tr>
<tr><td>What is a starter dependency?</td><td>A dependency-only POM with no code of its own that transitively pulls in a version-compatible set of libraries for one feature.</td></tr>
<tr><td>Which starter for REST endpoints, and which for monitoring?</td><td>spring-boot-starter-web for endpoints; spring-boot-starter-actuator for monitoring and management.</td></tr>
<tr><td>What does externalized configuration mean?</td><td>The same code runs in every environment because settings live outside it - properties files, YAML files, environment variables, command-line arguments.</td></tr>
<tr><td>What does lazy initialization change?</td><td>Beans are created on first use rather than at startup. Boot is faster; configuration errors surface on the first request instead of at deployment.</td></tr>
<tr><td>Why should a controller not return a JPA entity?</td><td>It makes the database schema the public API contract, leaks fields such as password hashes, and lazy associations fail during JSON serialisation. Return a DTO instead.</td></tr>
<tr><td>How do you override an auto-configured bean?</td><td>Define your own bean of that type. Most auto-configurations carry @ConditionalOnMissingBean, so yours takes precedence.</td></tr>
<tr><td>How do you find out why an auto-configuration did or did not apply?</td><td>Run with <code>--debug</code> (or <code>debug=true</code>) and read the Conditions Evaluation Report.</td></tr>
<tr><td>What does RestTemplate give you?</td><td>The ability to consume one RESTful web service from inside another. In new code, WebClient or the Spring 6 RestClient is preferred.</td></tr>
</table>`
        }
    ]
};
