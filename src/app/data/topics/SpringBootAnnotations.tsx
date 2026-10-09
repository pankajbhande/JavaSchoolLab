import { Topic } from '../coreJava';

export const springBootAnnotations: Topic = {
    id: 'spring-boot-annotations',
    name: 'Spring Boot Annotations Explained',
    beginner: [
        {
            content: `Spring Boot uses annotations everywhere - they are just special markers placed above a class,
method, or field that tell Spring "treat this piece of code in a special way". <br><br>
You don't write the plumbing yourself (no XML config, no manual object wiring) - the annotation tells
Spring Boot what to do, and Spring Boot does the rest at startup. <br><br>
In this topic we will look at the most common annotations you will see in almost every Spring Boot
project, one at a time, with a tiny example each. <br>`
        },

        {
            content: `<h3>1. @SpringBootApplication</h3>
This goes on top of your main class - the class that has the <code>main()</code> method. <br>
It simply tells Spring Boot "this is the starting point of my application, start scanning and
configuring everything from here." <br><br>
At the beginner level, just remember: <strong>every Spring Boot app has exactly one class with this
annotation</strong>, and it is the class you run to start the app. We will look at what it actually
does internally later (Expert Level). <br>`,
            codeExamples: [`package com.javaschool.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
// OUTPUT:
// ... Started DemoApplication in 1.234 seconds
// (Embedded Tomcat server starts and app is ready to accept requests)`]
        },

        {
            content: `<h3>2. @RestController and @Controller</h3>
These annotations mark a class as one that handles incoming web requests (like when someone opens
a URL in the browser or calls your API). <br><br>
• <code>@Controller</code> - used for classes that return a webpage (a view, like an HTML page). <br>
• <code>@RestController</code> - used for classes that return data directly (usually JSON) instead
of a webpage. This is the one you will use for almost every REST API you build. <br>`,
            codeExamples: [`package com.javaschool.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello from Spring Boot!";
    }
}
// OUTPUT (when you visit http://localhost:8080/hello in browser):
// Hello from Spring Boot!`]
        },

        {
            content: `<h3>3. @RequestMapping / @GetMapping / @PostMapping</h3>
These annotations connect a URL to a Java method - this is called "mapping" a request. <br><br>
• <code>@RequestMapping("/path")</code> - the general-purpose one, can handle any HTTP method. <br>
• <code>@GetMapping("/path")</code> - shortcut for handling GET requests (reading/fetching data). <br>
• <code>@PostMapping("/path")</code> - shortcut for handling POST requests (creating new data). <br>`,
            codeExamples: [`package com.javaschool.demo;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/students")
public class StudentController {

    @GetMapping
    public String getStudents() {
        return "Returning list of students";
    }

    @PostMapping
    public String addStudent() {
        return "Student added successfully";
    }
}
// OUTPUT:
// GET  /students  -> "Returning list of students"
// POST /students  -> "Student added successfully"`]
        },

        {
            content: `<h3>4. @Autowired</h3>
This annotation tells Spring "please give me an object of this type - I don't want to create it
myself with <code>new</code>." Spring finds (or creates) the right object and injects it for you.
This is called <strong>Dependency Injection</strong>. <br><br>
Below, <code>StudentService</code> is automatically injected into <code>StudentController</code> -
we never wrote <code>new StudentService()</code> anywhere. <br>`,
            codeExamples: [`package com.javaschool.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Service
class StudentService {
    String getMessage() {
        return "Service is working!";
    }
}

@RestController
public class StudentController {

    @Autowired
    private StudentService studentService; // Spring injects this for us

    @GetMapping("/message")
    public String getMessage() {
        return studentService.getMessage();
    }
}
// OUTPUT (GET /message):
// Service is working!`]
        },

        {
            content: `<h3>5. @Component / @Service / @Repository</h3>
These three annotations all do the same basic thing - they tell Spring "create an object (a bean)
of this class and manage it for me, so it can later be @Autowired anywhere." <br><br>
They only differ in the message they give to other developers reading the code: <br>
• <code>@Component</code> - a generic, general-purpose Spring-managed class. <br>
• <code>@Service</code> - a class that holds business logic. <br>
• <code>@Repository</code> - a class that talks to the database. <br>`,
            codeExamples: [`package com.javaschool.demo;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Component
class Utility {
    String upperCase(String s) { return s.toUpperCase(); }
}

@Service
class OrderService {
    String placeOrder() { return "Order placed"; }
}

@Repository
class OrderRepository {
    String findOrder() { return "Order found in DB"; }
}
// OUTPUT:
// All three classes become Spring-managed beans automatically
// (no "new" needed - just @Autowired them wherever required)`]
        }
    ],

    expert: [
        {
            content: `<h3>Annotation Categories - The Big Picture</h3>
Spring Boot has dozens of annotations, but almost all of them fall into one of five categories.
Knowing the category tells you what the annotation is really for: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Category</th>
<th>Annotations</th>
<th>Purpose</th>
</tr>
<tr class='text-center'>
<td>Stereotype</td>
<td>@Component, @Service, @Repository, @Controller</td>
<td>Marks a class to be auto-detected and registered as a bean in the Spring container</td>
</tr>
<tr class='text-center'>
<td>Configuration</td>
<td>@Configuration, @Bean</td>
<td>Manually declares beans, usually for third-party classes you cannot annotate directly</td>
</tr>
<tr class='text-center'>
<td>Web</td>
<td>@RequestMapping family, @PathVariable, @RequestParam, @RequestBody, @ResponseBody</td>
<td>Maps HTTP requests to methods and extracts/returns data</td>
</tr>
<tr class='text-center'>
<td>Data</td>
<td>@Entity, @Id, @Column, @Transactional</td>
<td>Maps Java objects to database tables/rows and manages DB transactions</td>
</tr>
<tr class='text-center'>
<td>Validation</td>
<td>@Valid, @NotNull, @Size</td>
<td>Validates incoming data before it reaches your business logic</td>
</tr>
</table>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">@SpringBootApplication
    +-- @SpringBootConfiguration  (a specialised @Configuration)
    +-- @EnableAutoConfiguration  (auto-configures beans based on classpath jars)
    +-- @ComponentScan           (scans the package + sub-packages for @Component,
                                   @Service, @Repository, @Controller/@RestController
                                   and registers them as beans)</pre>
This is why @SpringBootApplication is really "3 annotations glued into 1" - it starts component
scanning, enables auto-configuration, and marks the class itself as a configuration source.<br>`
        },

        {
            content: `<h3>@Component vs @Service vs @Repository - Functionally Similar, Semantically Different</h3>
All three are meta-annotated with <code>@Component</code>, so Spring's component scan treats them
identically for bean-registration purposes - any of them would technically work anywhere. <br><br>
The real, functional difference is only with <code>@Repository</code>: it additionally enables
<strong>persistence exception translation</strong> - Spring wraps low-level, database-specific
exceptions (like <code>SQLException</code>, driver-specific errors) into Spring's own consistent
unchecked <code>DataAccessException</code> hierarchy, so your service/controller code does not need
to know which database driver is underneath. <br>`,
            codeExamples: [`import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

@Repository
class StudentRepository {

    String findById(int id) {
        // If the JDBC driver throws a raw java.sql.SQLException here,
        // @Repository's PersistenceExceptionTranslationPostProcessor
        // converts it into a Spring DataAccessException automatically.
        if (id < 0) {
            throw new RuntimeException("simulated raw SQL driver exception");
        }
        return "Student-" + id;
    }
}

public class RepositoryDemo {
    public static void main(String[] args) {
        StudentRepository repo = new StudentRepository();
        try {
            System.out.println(repo.findById(1));
            repo.findById(-1);
        } catch (RuntimeException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Student-1
// Caught: simulated raw SQL driver exception
//
// NOTE: Inside a real Spring context, @Repository ensures this kind of
// low-level exception is translated to a uniform DataAccessException,
// which @Component / @Service classes do NOT get for free.`]
        },

        {
            content: `<h3>@RequestBody vs @ResponseBody, and @RestController = @Controller + @ResponseBody</h3>
• <code>@RequestBody</code> - takes the incoming HTTP request's JSON/XML body and converts
("deserializes") it into a Java object as a method parameter. <br>
• <code>@ResponseBody</code> - takes the Java object a method returns and converts
("serializes") it into JSON/XML to send back as the HTTP response body, instead of resolving it
as a view name. <br><br>
<code>@RestController</code> is simply <code>@Controller</code> + <code>@ResponseBody</code> applied
automatically to every method in the class - that is exactly why you never need to write
<code>@ResponseBody</code> yourself when using <code>@RestController</code>. <br>`,
            codeExamples: [`import org.springframework.web.bind.annotation.*;

class StudentDto {
    public String name;
    public int age;
}

// Equivalent to @RestController, written the long way:
@Controller
class StudentControllerLongForm {

    @ResponseBody // needed here because class is plain @Controller, not @RestController
    @PostMapping("/students")
    public StudentDto createStudent(@RequestBody StudentDto incoming) {
        // @RequestBody: JSON request body -> StudentDto object (deserialize)
        System.out.println("Received: " + incoming.name + ", age " + incoming.age);
        return incoming; // @ResponseBody: StudentDto object -> JSON response (serialize)
    }
}

// The short, everyday way:
@RestController // = @Controller + @ResponseBody on every method, no need to repeat it
class StudentControllerShortForm {

    @PostMapping("/students")
    public StudentDto createStudent(@RequestBody StudentDto incoming) {
        return incoming;
    }
}
// OUTPUT (POST /students with body {"name":"Aditi","age":21}):
// Received: Aditi, age 21
// Response body: {"name":"Aditi","age":21}`]
        },

        {
            content: `<h3>@Transactional - Propagation and Rollback Basics</h3>
<code>@Transactional</code> wraps a method in a database transaction - either everything inside it
commits together, or everything rolls back together if something fails. <br><br>
Two things matter most for interviews: <br>
• <strong>Rollback rule:</strong> by default, Spring rolls back only on unchecked exceptions
(<code>RuntimeException</code> and its subclasses), NOT on checked exceptions - unless you tell it
to with <code>rollbackFor</code>. <br>
• <strong>Propagation:</strong> controls how a transactional method behaves when it is called from
another transactional method - the default, <code>REQUIRED</code>, means "join the existing
transaction if one is already running, otherwise start a new one." <br>`,
            codeExamples: [`import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
class AccountService {

    // Default propagation = REQUIRED: joins caller's transaction if one exists
    @Transactional
    public void transferFunds(String from, String to, double amount) {
        withdraw(from, amount);
        deposit(to, amount);
        if (amount > 100000) {
            // Unchecked exception -> triggers automatic ROLLBACK of the whole transaction
            throw new RuntimeException("Amount exceeds allowed transfer limit");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void writeAuditLog(String message) {
        // Always runs in its OWN new transaction, independent of the caller's -
        // useful so an audit log entry survives even if the main transaction rolls back.
        System.out.println("AUDIT (separate transaction): " + message);
    }

    private void withdraw(String acc, double amt) {
        System.out.println("Withdrew " + amt + " from " + acc);
    }

    private void deposit(String acc, double amt) {
        System.out.println("Deposited " + amt + " to " + acc);
    }
}
// OUTPUT (transferFunds("A", "B", 500)):
// Withdrew 500.0 from A
// Deposited 500.0 to B
// (transaction commits - no exception thrown)
//
// OUTPUT (transferFunds("A", "B", 200000)):
// Withdrew 200000.0 from A
// Deposited 200000.0 to B
// RuntimeException thrown -> entire transaction rolled back,
// as if the withdraw/deposit never happened`]
        },

        {
            content: `<h3>Writing a Custom Annotation</h3>
You are not limited to Spring's built-in annotations - you can define your own using
<code>@interface</code>, then control its behaviour with two meta-annotations: <br>
• <code>@Target</code> - where the annotation is allowed to be placed (method, field, type, etc). <br>
• <code>@Retention</code> - how long the annotation is kept: <code>SOURCE</code> (discarded by
compiler), <code>CLASS</code> (kept in .class file, not visible at runtime), or
<code>RUNTIME</code> (kept and readable via reflection at runtime - required if a framework like
Spring AOP needs to detect it while the app is running). <br>`,
            codeExamples: [`import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;

@Target(ElementType.METHOD)              // can only be placed on methods
@Retention(RetentionPolicy.RUNTIME)      // must survive to runtime to be reflectively readable
@interface LogExecutionTime {
}

class ReportService {
    @LogExecutionTime
    public void generateReport() {
        System.out.println("Generating report...");
    }
}

public class CustomAnnotationDemo {
    public static void main(String[] args) throws Exception {
        ReportService service = new ReportService();
        Method method = ReportService.class.getMethod("generateReport");

        if (method.isAnnotationPresent(LogExecutionTime.class)) {
            long start = System.nanoTime();
            method.invoke(service);
            long end = System.nanoTime();
            System.out.println("Execution took " + (end - start) + " ns");
        }
    }
}
// OUTPUT:
// Generating report...
// Execution took <some number> ns
//
// NOTE: This is exactly the mechanism Spring AOP / @Transactional / @Cacheable
// use internally - a RUNTIME-retained annotation is detected via reflection,
// and a proxy wraps the method to add extra behaviour around it.`]
        },

        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does @SpringBootApplication actually combine?</td><td>@SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan</td></tr>
<tr class='text-center'><td>Is @RestController a completely different annotation from @Controller?</td><td>No - @RestController = @Controller + @ResponseBody applied to every method</td></tr>
<tr class='text-center'><td>Functionally, what is the real difference between @Component, @Service, and @Repository?</td><td>They register beans the same way; only @Repository additionally enables persistence exception translation into DataAccessException</td></tr>
<tr class='text-center'><td>Why use @Configuration + @Bean instead of @Component?</td><td>To register beans for classes you don't own/can't annotate (e.g. third-party library classes)</td></tr>
<tr class='text-center'><td>Does @Transactional roll back on checked exceptions by default?</td><td>No - only on unchecked (RuntimeException) exceptions unless rollbackFor is specified</td></tr>
<tr class='text-center'><td>What does propagation = REQUIRES_NEW do?</td><td>Suspends any existing transaction and starts a brand-new independent one</td></tr>
<tr class='text-center'><td>Difference between @RequestParam and @PathVariable?</td><td>@RequestParam reads a query string parameter (?name=x); @PathVariable reads a value embedded in the URL path (/students/{id})</td></tr>
<tr class='text-center'><td>Why must a custom annotation have @Retention(RUNTIME) to be used by Spring AOP?</td><td>Spring reads annotations via reflection at runtime; CLASS/SOURCE retention discards the annotation before the app runs, so it would be invisible to reflection</td></tr>
<tr class='text-center'><td>What does @Autowired actually do under the hood?</td><td>Spring's IoC container looks up (or creates) a matching bean by type from the ApplicationContext and injects the reference - no "new" is written by the developer</td></tr>
<tr class='text-center'><td>Can @Valid be used without any constraint annotations like @NotNull?</td><td>It has no effect alone - @Valid only triggers validation of whatever constraint annotations (@NotNull, @Size, etc.) are present on the target object's fields</td></tr>
</table>`
        }
    ],
};
