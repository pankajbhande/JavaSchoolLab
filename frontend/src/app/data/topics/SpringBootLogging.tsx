import { Topic } from '../coreJava';

export const springBootLogging: Topic = {
    id: 'spring-boot-logging',
    name: 'Logging in Spring Boot',
    beginner: [
        {
            content: `<h3>Business Requirement</h3>
An application is deployed to a production server. A user reports that saving an employee failed. You cannot attach a debugger to production, you cannot reproduce the request, and the stack trace scrolled off somebody's terminal three days ago. The application must therefore record what it did, when, and with what data - so a defect can be diagnosed from the evidence it left behind.<br><br>

<h3>What a Logger Is</h3>
A <strong>logger</strong> keeps a durable, timestamped record of what the application is doing. It is the only view you have into a running production system, and it is the difference between "the save failed" and "the save failed at 09:14:22 in <code>EmployeeServiceImpl</code> with a duplicate-key violation on <code>employees.email</code>".<br><br>

<div class="border">
Facilities you will hear named together:<br>
<strong>SLF4J</strong> - the API you write against<br>
<strong>Logback</strong> - the implementation Spring Boot ships with<br>
<strong>Log4j2</strong> - an alternative implementation<br>
<strong>java.util.logging</strong> - the JDK's own, rarely used directly<br>
A log management tool - ELK, Splunk, Loki, CloudWatch - which collects and indexes what the application writes
</div>`
        },
        {
            content: `<h3>Steps</h3>
<div class="border">
1. Create a Spring Boot starter project<br>
2. Add the Maven dependencies to <code>pom.xml</code><br>
3. Write the logging configuration in <code>application.properties</code><br>
4. Create the model<br>
5. Create the service interface<br>
6. Create the service implementation<br>
7. Create the repository<br>
8. Create the REST controller<br>
9. Add logger statements to the controller and the service implementation<br>
10. Run the application<br>
11. Send the request from Postman and read the response<br>
12. Check the row in the database<br>
13. Check the log file
</div><br>

Note that <strong>no logging dependency is added</strong>. <code>spring-boot-starter-web</code> pulls in <code>spring-boot-starter-logging</code> transitively, which brings SLF4J and Logback. That is why the imports in step 9 resolve without touching <code>pom.xml</code>.`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- spring-boot-starter-logging arrives with starter-web. Do NOT also add
     log4j-core or slf4j-log4j12: two bindings on the classpath produce
     "SLF4J: Class path contains multiple SLF4J bindings" and the one that
     wins is whichever the class loader found first. -->`
            ]
        },
        {
            content: `<h3>Step 3 - Configuration in application.properties</h3>
The datasource block is ordinary JPA configuration. The <code>#Log configuration</code> block underneath is what this topic is about.<br><br>

<table>
<tr><th>Property</th><th>Purpose</th></tr>
<tr><td><code>logging.level.root</code></td><td>The level applied to every logger with no more specific rule. <code>WARN</code> means INFO and DEBUG are discarded application-wide.</td></tr>
<tr><td><code>logging.level.&lt;package&gt;</code></td><td>Overrides the level for one package or class. Levels are inherited down the package hierarchy, and the longest matching prefix wins.</td></tr>
<tr><td><code>logging.file.name</code></td><td>Writes to that exact file in addition to the console.</td></tr>
<tr><td><code>logging.file.path</code></td><td>Writes <code>spring.log</code> into that directory. Use one or the other, not both.</td></tr>
<tr><td><code>logging.pattern.file</code></td><td>The Logback layout pattern for the file appender. <code>logging.pattern.console</code> does the same for the console.</td></tr>
</table>
<br>
Two corrections to the PDF's property block are marked in the code.`,
            codeExamples: [
                `# Step 3 - application.properties

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/8julyspringbootbatch
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
# The PDF prints "org.hibernate.dial ect.MySQL8Dialect" - a line-break artefact.
# It must be one unbroken token or Hibernate throws
#   ClassNotFoundException: org.hibernate.dial
# Boot 2.7+ detects the dialect from the JDBC metadata, so this line is optional.

#Log configuration
logging.level.root=WARN
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate=ERROR
logging.level.com.velocity=INFO
# ^ ADDED. With root=WARN and nothing for com.velocity, the log.info(...)
#   calls written in step 9 are silently discarded and the exercise appears
#   to do nothing. This is the single most common mistake with this setup.

logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
# The PDF wraps the pattern in double quotes. Properties files do not strip
# quotes, so the quote characters end up printed in every line of the file.
# It also omits the time from %d{yyyy-MM-dd }, leaving every entry dated but
# not timed - useless for ordering events.

logging.file.name=D:/application.log
# Absolute paths on a developer's D: drive do not exist on a Linux server.
# Prefer a relative path or an externally supplied value:
#   logging.file.name=\${LOG_DIR:logs}/application.log`
            ]
        },
        {
            content: `<h3>Steps 4-7 - Model, Service, Repository</h3>
Ordinary layering: entity, service interface, service implementation, Spring Data repository. Nothing here is logging-specific yet; it is the application the log statements will describe.<br><br>

The entity's id is <code>int</code>, so the repository must be <code>JpaRepository&lt;Employee, Integer&gt;</code> - the second type parameter is the <em>boxed</em> id type. <code>JpaRepository&lt;Employee, Long&gt;</code> compiles but fails at start-up with an identifier-type mismatch.<br><br>

<strong>javax.persistence</strong> is correct for Spring Boot 2.x. On Boot 3.x every one of these imports becomes <strong>jakarta.persistence</strong>; leaving them as <code>javax</code> produces <code>Not a managed type: class com.velocity.model.Employee</code>.`,
            codeExamples: [
                `package com.velocity.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
// Spring Boot 3.x: change every javax.persistence.* to jakarta.persistence.*

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String city;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    @Override
    public String toString() {
        return "Employee [id=" + id + ", name=" + name + ", city=" + city + "]";
    }
}`,
                `package com.velocity.service;

import com.velocity.model.Employee;

public interface EmployeeService {
    Employee saveEmployee(Employee employee);
}`,
                `package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.velocity.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // Integer, because Employee.id is int. Long here gives, at start-up:
    //   The type Employee is not a valid identifier type for ... Long
}`
            ]
        },
        {
            content: `<h3>Step 9 - Adding the Logger</h3>
Three lines are all it takes: import <code>org.slf4j.Logger</code>, import <code>org.slf4j.LoggerFactory</code>, and declare<br>
<code>private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);</code><br><br>

Every class gets its own logger, named after itself. That name is what appears in the <code>%logger{36}</code> position of the output, and it is what <code>logging.level.com.velocity=INFO</code> matches against.<br><br>

The PDF's service implementation imports <code>com.velocity.restcontroller.EmployeeController</code> and never uses it. Remove it - a service must not depend on a controller, and even an unused import in that direction invites someone to add a real one later.`,
            codeExamples: [
                `package com.velocity.restcontroller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.model.Employee;
import com.velocity.service.EmployeeService;

@RestController
public class EmployeeController {

    private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/saveEmployee")
    public Employee saveEmployee(@RequestBody Employee employee) {
        log.info("Inside saveEmployee() method of rest controller");
        Employee emp = employeeService.saveEmployee(employee);
        log.info("After calling service -> saveEmployee() completed, id={}", emp.getId());
        return emp;
    }
}`,
                `package com.velocity.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.velocity.model.Employee;
import com.velocity.repository.EmployeeRepository;
import com.velocity.service.EmployeeService;
// REMOVED: import com.velocity.restcontroller.EmployeeController;
// The PDF imports the controller here and never uses it. A service must not
// know about the web layer.

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeServiceImpl.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public Employee saveEmployee(Employee employee) {
        log.info("Inside EmployeeServiceImpl.saveEmployee()");
        Employee saved = employeeRepository.save(employee);
        log.debug("Employee persisted with id={}", saved.getId());
        return saved;
    }
}`
            ]
        },
        {
            content: `<h3>Steps 10-13 - Run, Post, Verify</h3>
Start the application, send the POST from Postman, confirm the row in MySQL, then open the log file. The same three log lines must be visible in all of the console, the file, and in the order the code executes them.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
 POST /saveEmployee
        |
        v
 EmployeeController.saveEmployee()
   log.info  "Inside saveEmployee() method of rest controller"
        |
        v
 EmployeeServiceImpl.saveEmployee()
   log.info  "Inside EmployeeServiceImpl.saveEmployee()"
        |
        v
 EmployeeRepository.save()  --> Hibernate INSERT --> MySQL employees
        |
        v
   log.info  "After calling service -> saveEmployee() completed, id=1"
        |
        v
 200 OK  { "id": 1, "name": "...", "city": "..." }
        |
        +--> console appender
        +--> file appender  ->  D:/application.log
</pre>`,
            codeExamples: [
                `POST http://localhost:8080/saveEmployee
Content-Type: application/json

{
    "name": "Jeevan",
    "city": "Pune"
}

# RESPONSE - 200 OK, application/json
{
    "id": 1,
    "name": "Jeevan",
    "city": "Pune"
}`,
                `# Console output
2024-07-08 11:42:17.204 [http-nio-8080-exec-1] INFO  c.v.r.EmployeeController - Inside saveEmployee() method of rest controller
2024-07-08 11:42:17.208 [http-nio-8080-exec-1] INFO  c.v.s.i.EmployeeServiceImpl - Inside EmployeeServiceImpl.saveEmployee()
Hibernate: insert into employees (city,name) values (?,?)
2024-07-08 11:42:17.331 [http-nio-8080-exec-1] INFO  c.v.r.EmployeeController - After calling service -> saveEmployee() completed, id=1

# D:/application.log contains exactly the same lines, because
# logging.file.name adds a file appender alongside the console one.`,
                `-- Step 12 - the row in MySQL
mysql> select * from employees;
+----+--------+------+
| id | city   | name |
+----+--------+------+
|  1 | Pune   | Jeevan |
+----+--------+------+
1 row in set (0.00 sec)

-- The table was created by spring.jpa.hibernate.ddl-auto=update.
-- Never use ddl-auto=create or create-drop against a real database:
-- it DROPS every table on each restart and takes your data with it.
-- Production should be "validate" or "none", with Flyway or Liquibase
-- owning the schema.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>SLF4J Is a Facade, Logback Is the Implementation</h3>
<strong>SLF4J</strong> (Simple Logging Facade for Java) is an API and nothing else. <code>slf4j-api.jar</code> contains interfaces - <code>Logger</code>, <code>LoggerFactory</code>, <code>Marker</code> - and no code that writes a byte anywhere. At start-up SLF4J binds to exactly one implementation found on the classpath. Spring Boot puts <strong>Logback</strong> there.<br><br>

The separation exists because a library cannot dictate the logging framework of every application that uses it. Spring, Hibernate and Jackson all call SLF4J; your application decides whether those calls end in Logback, Log4j2 or nothing. Swapping the implementation is a <code>pom.xml</code> exclusion, not a code change.<br><br>

<table>
<tr><th>Layer</th><th>Responsibility</th></tr>
<tr><td><strong>SLF4J API</strong></td><td>What you write against: <code>Logger</code>, <code>LoggerFactory</code>, the level methods, the <code>{}</code> placeholder contract.</td></tr>
<tr><td><strong>Binding</strong></td><td><code>logback-classic</code> (or <code>log4j-slf4j2-impl</code>) - the adapter that connects the facade to a real engine. Exactly one must be present.</td></tr>
<tr><td><strong>Bridges</strong></td><td><code>jul-to-slf4j</code>, <code>log4j-over-slf4j</code>, <code>jcl-over-slf4j</code> - reroute libraries that call an older API so everything lands in one place with one configuration.</td></tr>
<tr><td><strong>Implementation</strong></td><td>Logback: loggers, levels, appenders, encoders, filters, async queues, rolling policies.</td></tr>
</table>
<br>
Do not import <code>ch.qos.logback.classic.Logger</code> in application code. It compiles and works, and it welds your application to Logback for no benefit.`,
            codeExamples: [
                `<!-- Switching Logback for Log4j2: exclusion plus one starter, no code change -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>

<!-- Forget the exclusion and you get, at start-up:
     SLF4J: Class path contains multiple SLF4J providers.
     SLF4J: Found provider [ch.qos.logback.classic.spi.LogbackServiceProvider]
     SLF4J: Found provider [org.apache.logging.slf4j.SLF4JServiceProvider]
     SLF4J: Actually provided by [...]
     Whichever the class loader reaches first wins - so which framework
     reads your configuration is decided by jar ordering. -->`,
                `// Correct - the facade
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Wrong - binds your code to one implementation for no gain
// import ch.qos.logback.classic.Logger;
// import org.apache.log4j.Logger;

// Lombok alternative - generates exactly the static final field below
// @Slf4j
// public class EmployeeServiceImpl { ... log.info("..."); }`
            ]
        },
        {
            content: `<h3>Why <code>private static final</code> and Not an Instance Field</h3>
<code>private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);</code> is not a stylistic convention; each modifier earns its place.<br><br>

<div class="border">
<strong>static</strong> - one logger per class, not one per object. An instance field on an entity created a million times per hour means a million <code>getLogger</code> lookups and a million extra references. The logger holds no per-instance state, so there is nothing to gain from duplicating it.<br>
<strong>final</strong> - the reference cannot be reassigned, so the JIT can treat it as a constant and the level check folds away cheaply.<br>
<strong>private</strong> - loggers are not inherited API. A <code>protected</code> logger in a base class logs under the <em>base</em> class name from every subclass, so all your subclasses appear in the log as the parent and per-class level configuration stops working.<br>
<strong><code>X.class</code>, not <code>getClass()</code></strong> - <code>getClass()</code> on a Spring bean may return the CGLIB proxy, giving a logger named <code>EmployeeServiceImpl$$EnhancerBySpringCGLIB$$9f3c1ab</code>. That name changes between runs, so no configuration can target it.
</div><br>

An instance field is not <em>wrong</em> in the sense of failing; it is wasteful, and the <code>getClass()</code> variant actively breaks configuration. Lombok's <code>@Slf4j</code> generates precisely the static final form.`,
            codeExamples: [
                `// Correct
public class EmployeeServiceImpl implements EmployeeService {
    private static final Logger log = LoggerFactory.getLogger(EmployeeServiceImpl.class);
}
// Logger name: com.velocity.service.impl.EmployeeServiceImpl
// logging.level.com.velocity=DEBUG matches it.

// Wasteful - a new lookup and a new field per instance
public class Employee {
    private final Logger log = LoggerFactory.getLogger(Employee.class);
}

// Broken under proxying
public class EmployeeServiceImpl {
    private final Logger log = LoggerFactory.getLogger(getClass());
}
// On a @Transactional bean the name becomes:
//   com.velocity.service.impl.EmployeeServiceImpl$$EnhancerBySpringCGLIB$$5d31af2c
// which no logging.level.* property will ever match.

// Broken by inheritance
public abstract class BaseService {
    protected static final Logger log = LoggerFactory.getLogger(BaseService.class);
}
// Every subclass logs as "BaseService" - you cannot tell which one spoke.`
            ]
        },
        {
            content: `<h3>Parameterised Logging</h3>
<code>log.debug("Saving employee id={} for city={}", id, city)</code> passes the format string and the arguments separately. Logback checks the level first and only builds the message if the statement will actually be emitted.<br><br>

Concatenation - <code>log.debug("Saving employee id=" + id + " city=" + city)</code> - inverts that. The JVM evaluates the argument <em>before</em> the call, so the <code>StringBuilder</code> runs, <code>toString()</code> is invoked on every operand, and a String is allocated. Then <code>debug()</code> sees the level is INFO and discards it. In a hot path you have paid for every disabled DEBUG statement in the application, in allocation and in garbage-collection pressure.<br><br>

<strong>SLF4J placeholders</strong> use <code>{}</code>, not <code>%s</code> and not <code>printf</code> syntax. Two to three arguments are passed directly; more than that goes through a varargs array, which is why the two-argument overloads exist. A trailing <code>Throwable</code> is special: pass the exception as the <em>last</em> argument with no matching <code>{}</code> and Logback prints the full stack trace.<br><br>

Where an argument is genuinely expensive to compute - serialising an object, a database call - guard it with <code>if (log.isDebugEnabled())</code>, or pass a <code>Supplier</code> via a fluent API. Do not wrap ordinary parameterised calls in a guard; the placeholder form already handles it.`,
            codeExamples: [
                `// GOOD - message built only if DEBUG is enabled
log.debug("Saving employee id={} name={} city={}", id, name, city);

// BAD - StringBuilder, three toString() calls and a String allocation happen
//       even when the level is INFO and the line is thrown away
log.debug("Saving employee id=" + id + " name=" + name + " city=" + city);

// WRONG PLACEHOLDER - SLF4J does not understand %s
log.info("Saved employee %s", name);
// OUTPUT: Saved employee %s      <-- the argument is silently dropped

// Exception: pass it LAST with no {} of its own
try {
    employeeRepository.save(employee);
} catch (DataIntegrityViolationException ex) {
    log.error("Failed to save employee city={}", employee.getCity(), ex);
}
// OUTPUT:
// 2024-07-08 11:44:02.117 [http-nio-8080-exec-2] ERROR c.v.s.i.EmployeeServiceImpl
//     - Failed to save employee city=Pune
// org.springframework.dao.DataIntegrityViolationException: could not execute statement
//     at org.springframework.orm.jpa....
//     ... 47 common frames omitted
// Caused by: java.sql.SQLIntegrityConstraintViolationException:
//     Duplicate entry 'jeevan@example.com' for key 'employees.email_UNIQUE'`,
                `// Guard ONLY genuinely expensive arguments
if (log.isDebugEnabled()) {
    log.debug("Full payload: {}", objectMapper.writeValueAsString(request));
}
// Without the guard, the JSON is serialised on every request even at INFO.

// Fluent API (SLF4J 2.x) - lazy without the if
log.atDebug()
   .addArgument(() -> objectMapper.writeValueAsString(request))
   .log("Full payload: {}");

// A subtle one: log.error("msg " + e) prints only e.toString() -
// the stack trace is LOST. Always pass the Throwable as an argument.`
            ]
        },
        {
            content: `<h3>Levels - and When Each One Is Right</h3>
A level is a filter, and filters are only useful if the boundaries mean something consistent. The ordering is <code>TRACE &lt; DEBUG &lt; INFO &lt; WARN &lt; ERROR &lt; OFF</code>: setting a logger to INFO emits INFO, WARN and ERROR and discards the rest.<br><br>

<table>
<tr><th>Level</th><th>When it is right</th></tr>
<tr><td><strong>ERROR</strong></td><td>The operation failed and a human needs to act. Include the exception. If it does not warrant an alert, it is not an ERROR - a routine 404 or a validation rejection is not one.</td></tr>
<tr><td><strong>WARN</strong></td><td>Something recovered, degraded or is heading for trouble: a retry succeeded on the third attempt, a fallback was used, a deprecated endpoint was called, the connection pool is at 90%.</td></tr>
<tr><td><strong>INFO</strong></td><td>Milestones in normal operation that you would want in production: application started, order 4417 accepted, scheduled job finished in 812 ms. Low volume, one or two per business operation. This is the default and the level production usually runs at.</td></tr>
<tr><td><strong>DEBUG</strong></td><td>Detail for diagnosing a problem: branch taken, parameter values, intermediate results. Off in production by default, switchable at runtime when investigating.</td></tr>
<tr><td><strong>TRACE</strong></td><td>Very fine-grained - loop iterations, wire-level detail. Enabled briefly on one class, never broadly.</td></tr>
</table>
<br>
The material's <code>logging.level.root=WARN</code> with <code>org.springframework.web=DEBUG</code> is a good instinct badly aimed: it silences your own INFO statements while emitting a large volume of Spring's internal DEBUG. Set root to INFO, your own package to INFO or DEBUG, and turn framework packages down rather than up.<br><br>

Levels are also changeable <em>without a restart</em> through the Actuator <code>loggers</code> endpoint - the difference between diagnosing a production incident in two minutes and waiting for a redeploy.`,
            codeExamples: [
                `# A sane production baseline
logging.level.root=INFO
logging.level.com.velocity=INFO
logging.level.org.springframework=WARN
logging.level.org.hibernate=WARN

# Never in production - these two log every bound parameter, and bound
# parameters include passwords, card numbers and personal data:
# logging.level.org.hibernate.SQL=DEBUG
# logging.level.org.hibernate.orm.jdbc.bind=TRACE`,
                `# Change a level at runtime with Actuator - no restart, no redeploy
# management.endpoints.web.exposure.include=health,info,loggers   (and secure it)

curl http://localhost:8080/actuator/loggers/com.velocity
# {"configuredLevel":"INFO","effectiveLevel":"INFO"}

curl -X POST http://localhost:8080/actuator/loggers/com.velocity.service \\
     -H "Content-Type: application/json" \\
     -d '{"configuredLevel":"DEBUG"}'
# HTTP/1.1 204 No Content
# DEBUG output begins immediately for that package only.

# Put it back when you are done:
curl -X POST http://localhost:8080/actuator/loggers/com.velocity.service \\
     -H "Content-Type: application/json" -d '{"configuredLevel":null}'`
            ]
        },
        {
            content: `<h3>logback-spring.xml and Profile-Scoped Appenders</h3>
<code>application.properties</code> covers levels, one file and a pattern. Anything beyond that - several appenders, asynchronous logging, JSON encoding, different behaviour per environment - needs a Logback configuration file.<br><br>

Use <strong>logback-spring.xml</strong>, not <code>logback.xml</code>. Plain <code>logback.xml</code> is read by Logback directly, before Spring exists, so it cannot see profiles or the Spring <code>Environment</code>. The <code>-spring</code> variant is loaded by Boot's initialiser and unlocks <code>&lt;springProfile&gt;</code> and <code>&lt;springProperty&gt;</code>.<br><br>

The practical shape: a readable, coloured console appender for <code>dev</code>; a rolling JSON file appender for <code>prod</code>; nothing but console at WARN for <code>test</code> so the build output stays readable. One file, three environments, no code change.<br><br>

Wrap the production file appender in <strong>AsyncAppender</strong>. File I/O in the request thread is a real latency cost under load - the async appender hands lines to a background thread through a bounded queue. Set <code>discardingThreshold</code> to 0 so it does not silently drop WARN and ERROR when the queue fills.`,
            codeExamples: [
                `<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <!-- springProperty reads from the Spring Environment - profiles,
         env vars, config server - which plain logback.xml cannot do -->
    <springProperty scope="context" name="appName"
                    source="spring.application.name" defaultValue="orders-api"/>
    <springProperty scope="context" name="logDir"
                    source="logging.file.path" defaultValue="logs"/>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %highlight(%-5level) %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>\${logDir}/\${appName}.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>\${logDir}/\${appName}.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
            <cleanHistoryOnStart>true</cleanHistoryOnStart>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId}] %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="FILE"/>
        <queueSize>8192</queueSize>
        <discardingThreshold>0</discardingThreshold>
        <!-- 0 = never discard. The default 20 silently drops everything
             below WARN once the queue is 80% full - exactly when you
             most need the detail. -->
        <neverBlock>false</neverBlock>
    </appender>

    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
        <logger name="com.velocity" level="DEBUG"/>
    </springProfile>

    <springProfile name="test">
        <root level="WARN">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>

    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="ASYNC_FILE"/>
        </root>
        <logger name="org.springframework" level="WARN"/>
        <logger name="org.hibernate" level="WARN"/>
    </springProfile>

</configuration>`,
                `# What the rolling policy produces after a month in production
logs/orders-api.log                    <- today, being written
logs/orders-api.2024-07-07.0.log.gz    <- yesterday, first 100MB
logs/orders-api.2024-07-07.1.log.gz    <- yesterday, second 100MB
logs/orders-api.2024-06-08.0.log.gz    <- 30 days back; deleted tomorrow

# maxHistory=30    keep 30 days
# totalSizeCap=10GB  hard ceiling regardless of maxHistory - this is the
#                    setting that stops logs filling the disk and taking
#                    the application down with "No space left on device"

# Without a rolling policy, logging.file.name grows without bound.
# A single 40GB application.log is unreadable, ungreppable and fatal.`
            ]
        },
        {
            content: `<h3>MDC and Correlation Ids</h3>
Under load, one request's log lines are interleaved with hundreds of others. <code>[http-nio-8080-exec-1]</code> identifies the thread, and threads are reused, so it does not identify a request. Given a user complaint you cannot reconstruct what happened.<br><br>

<strong>MDC</strong> (Mapped Diagnostic Context) is a thread-local map of key-value pairs that Logback merges into every line the thread writes, through the <code>%X{key}</code> conversion word. Put a <strong>correlation id</strong> in it at the edge of the request and every line downstream carries it. Grep for one id and you have the complete story of that request, in order.<br><br>

Two rules make it work in practice. Accept an incoming <code>X-Correlation-Id</code> header if there is one and generate a UUID if not, so the id spans several microservices rather than being reinvented at each hop. And <strong>always clear the MDC in a <code>finally</code> block</strong> - the value is thread-local, the servlet container pools threads, and a value left behind will reappear stamped on an unrelated user's request. That is both a debugging trap and, if you put a user id in there, a data-leak.<br><br>

MDC does not cross thread boundaries by itself: <code>@Async</code>, <code>CompletableFuture</code> and reactive pipelines lose it unless you propagate it explicitly. Spring Boot 3.x with Micrometer Tracing does this for you and supplies <code>traceId</code>/<code>spanId</code> automatically.`,
            codeExamples: [
                `package com.velocity.web;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
// Spring Boot 2.x: javax.servlet.* instead of jakarta.servlet.*

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Correlation-Id";
    private static final String MDC_KEY = "traceId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String correlationId = request.getHeader(HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 8);
        }
        MDC.put(MDC_KEY, correlationId);
        response.setHeader(HEADER, correlationId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();   // MANDATORY. Threads are pooled and reused; a value
                           // left here reappears on a different user's request.
        }
    }
}`,
                `# Pattern picks it up with %X{traceId}
# logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] %-5level [%X{traceId}] %logger{36} - %msg%n

# OUTPUT - two concurrent requests, cleanly separable
11:42:17.204 [http-nio-8080-exec-1] INFO  [a41f9c2e] c.v.r.EmployeeController - Inside saveEmployee()
11:42:17.206 [http-nio-8080-exec-2] INFO  [7d0b13aa] c.v.r.EmployeeController - Inside saveEmployee()
11:42:17.208 [http-nio-8080-exec-1] INFO  [a41f9c2e] c.v.s.i.EmployeeServiceImpl - Inside saveEmployee()
11:42:17.301 [http-nio-8080-exec-2] ERROR [7d0b13aa] c.v.s.i.EmployeeServiceImpl - Failed to save employee city=Pune
11:42:17.331 [http-nio-8080-exec-1] INFO  [a41f9c2e] c.v.r.EmployeeController - completed, id=1

# grep a41f9c2e application.log  -> the whole successful request
# grep 7d0b13aa application.log  -> the whole failed one, including the trace`,
                `// MDC does not follow a task onto another thread
@Async
public void sendConfirmation(int employeeId) {
    log.info("Sending confirmation for {}", employeeId);
    // [%X{traceId}] renders EMPTY here - different thread, different ThreadLocal
}

// Capture and restore explicitly
Map<String, String> context = MDC.getCopyOfContextMap();
CompletableFuture.runAsync(() -> {
    MDC.setContextMap(context == null ? Map.of() : context);
    try {
        log.info("Now the traceId is present");
    } finally {
        MDC.clear();
    }
}, executor);

// Or use Spring Boot 3 + Micrometer Tracing, which propagates traceId/spanId
// across threads, HTTP clients and messaging without this boilerplate.`
            ]
        },
        {
            content: `<h3>Structured JSON Logging</h3>
A pattern-formatted line is written for a human reading a terminal. In production nobody reads the terminal - the lines are shipped to Elasticsearch, Splunk or Loki and queried. Parsing them back out with a regular expression is fragile, and it collapses entirely on multi-line stack traces, where each frame arrives as a separate document.<br><br>

<strong>Structured logging</strong> emits one JSON object per event, with the timestamp, level, logger, thread, message, MDC entries and stack trace as named fields. The aggregator indexes the fields directly, so you can query <code>level:ERROR AND traceId:a41f9c2e</code> instead of matching text, and a stack trace stays one document.<br><br>

Two routes. Spring Boot 3.4+ has it built in: set <code>logging.structured.format.console=ecs</code> - Elastic Common Schema, or <code>logstash</code>, or <code>gelf</code>. Earlier versions add <code>logstash-logback-encoder</code> and swap the encoder in <code>logback-spring.xml</code>. Either way, use JSON in <code>prod</code> and the readable pattern in <code>dev</code>; JSON in a development console is unreadable and slows people down.<br><br>

The complement to structured output is <strong>structured arguments</strong>: <code>kv("employeeId", id)</code> puts the value in its own indexed field rather than embedding it in the message text.`,
            codeExamples: [
                `<!-- Pre-3.4: logstash-logback-encoder -->
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>`,
                `<!-- logback-spring.xml, prod profile -->
<appender name="JSON" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>\${logDir}/\${appName}.json</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <fileNamePattern>\${logDir}/\${appName}.%d{yyyy-MM-dd}.%i.json.gz</fileNamePattern>
        <maxFileSize>100MB</maxFileSize>
        <maxHistory>14</maxHistory>
        <totalSizeCap>10GB</totalSizeCap>
    </rollingPolicy>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeMdcKeyName>traceId</includeMdcKeyName>
        <customFields>{"service":"orders-api","env":"prod"}</customFields>
    </encoder>
</appender>

<!-- Spring Boot 3.4+ needs no encoder at all:
     logging.structured.format.console=ecs
     logging.structured.format.file=ecs
     logging.structured.ecs.service.name=orders-api -->`,
                `// Structured arguments put values in their own indexed fields
import static net.logstash.logback.argument.StructuredArguments.kv;

log.info("Employee saved", kv("employeeId", saved.getId()), kv("city", saved.getCity()));

// OUTPUT - one line, one JSON document:
// {"@timestamp":"2024-07-08T11:42:17.331Z","level":"INFO",
//  "logger_name":"com.velocity.service.impl.EmployeeServiceImpl",
//  "thread_name":"http-nio-8080-exec-1","message":"Employee saved",
//  "traceId":"a41f9c2e","employeeId":1,"city":"Pune",
//  "service":"orders-api","env":"prod"}

// An error, with the whole stack trace inside ONE document:
// {"@timestamp":"2024-07-08T11:44:02.117Z","level":"ERROR",
//  "logger_name":"com.velocity.service.impl.EmployeeServiceImpl",
//  "message":"Failed to save employee city=Pune","traceId":"7d0b13aa",
//  "stack_trace":"org.springframework.dao.DataIntegrityViolationException: ...\\n\\tat ..."}

// Kibana: level:ERROR AND traceId:"7d0b13aa"
// - no regular expression, no multi-line reassembly.`
            ]
        },
        {
            content: `<h3>Never Log Passwords, Tokens or PII</h3>
Logs are the least protected data store in most systems. They are shipped to a third-party aggregator, retained for months, indexed for full-text search, and readable by every engineer, every on-call rota and every support analyst - none of whom would be granted <code>SELECT</code> on the users table. Anything written to a log should be treated as published.<br><br>

<div class="border">
Never log: <strong>passwords</strong> (plain or hashed), <strong>authentication tokens</strong> - JWTs, session ids, API keys, refresh tokens - full card numbers, CVVs, national identifiers, health data, or <code>Authorization</code> and <code>Cookie</code> headers.<br>
Under GDPR, names, email addresses and IP addresses are <strong>personal data</strong>: logging them creates a retention obligation and a subject-access liability. Log an internal id and join to the database when you actually need the person.
</div><br>

The dangerous leaks are rarely deliberate. <code>log.debug("Request: {}", user)</code> calls <code>toString()</code>, and a Lombok <code>@Data</code> or IDE-generated <code>toString()</code> includes every field including <code>password</code>. <code>logging.level.org.hibernate.orm.jdbc.bind=TRACE</code> prints every bound parameter, which is every value your application ever writes. An exception message from a failed authentication can carry the credential. And a JWT is not encrypted - anyone with the logged token can decode the claims and, until it expires, replay it.<br><br>

Defend at three points: annotate sensitive fields so <code>toString()</code> and JSON serialisation exclude them; mask at the log call for anything that must appear at all; and add a Logback replacement filter as a backstop for what slips through the first two.`,
            codeExamples: [
                `// The accidental leak
public class LoginRequest {
    private String username;
    private String password;
    @Override
    public String toString() {   // IDE-generated, includes everything
        return "LoginRequest [username=" + username + ", password=" + password + "]";
    }
}
log.debug("Login attempt: {}", request);
// OUTPUT: Login attempt: LoginRequest [username=jeevan, password=Str0ngP@ss!]
//         ...now in Elasticsearch, retained 90 days, searchable by 200 people.

// Fixed
public class LoginRequest {
    private String username;

    @ToString.Exclude          // Lombok
    @JsonIgnore                // keeps it out of responses too
    private String password;

    @Override
    public String toString() {
        return "LoginRequest [username=" + username + ", password=****]";
    }
}
// OUTPUT: Login attempt: LoginRequest [username=jeevan, password=****]`,
                `// Mask what must be partially visible
private static String maskEmail(String email) {
    if (email == null) return null;
    int at = email.indexOf('@');
    if (at <= 1) return "***";
    return email.charAt(0) + "***" + email.substring(at);
}

log.info("Password reset requested for {}", maskEmail(user.getEmail()));
// OUTPUT: Password reset requested for j***@example.com

// Cards: last four only, never the CVV at all
log.info("Payment authorised card=**** **** **** {} amount={}",
         card.getNumber().substring(12), amount);
// OUTPUT: Payment authorised card=**** **** **** 4417 amount=249.99

// Tokens: log a hash or a prefix, never the token
log.debug("Auth token accepted, fingerprint={}",
          DigestUtils.sha256Hex(token).substring(0, 12));
// OUTPUT: Auth token accepted, fingerprint=9f3c1ab77e2c`,
                `<!-- Backstop: a Logback replacement filter in the pattern.
     Not a substitute for the two measures above - a safety net for
     what a new joiner logs without thinking. -->
<pattern>
  %d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId}] %logger{36} -
  %replace(%msg){'(?i)(password|passwd|secret|token|authorization|api[-_]?key)\\s*[=:]\\s*[^,\\s\\}]+','$1=****'}%n
</pattern>

<!-- INPUT : User login password=Str0ngP@ss! token=eyJhbGciOiJIUzI1NiJ9...
     OUTPUT: User login password=**** token=****

     Also switch these OFF everywhere but a local machine:
       logging.level.org.hibernate.SQL=DEBUG
       logging.level.org.hibernate.orm.jdbc.bind=TRACE
       logging.level.org.springframework.web=DEBUG
     The last one logs full request bodies, headers included. -->`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>SLF4J versus Logback?</td><td>SLF4J is a facade - interfaces only, no output code. Logback is the implementation Spring Boot binds it to. Writing against the facade lets an application swap Logback for Log4j2 through a <code>pom.xml</code> exclusion, with no code change, and lets libraries log without dictating a framework.</td></tr>
<tr><td>What does Spring Boot use by default, and what pulls it in?</td><td>Logback, via <code>spring-boot-starter-logging</code>, which arrives transitively with <code>spring-boot-starter-web</code>. No logging dependency needs to be declared.</td></tr>
<tr><td>Why <code>private static final Logger</code>?</td><td><code>static</code> gives one logger per class rather than one per instance; <code>final</code> lets the JIT treat it as a constant; <code>private</code> stops subclasses inheriting a logger named after the parent, which would break per-class level configuration.</td></tr>
<tr><td>Why <code>X.class</code> rather than <code>getClass()</code>?</td><td>On a proxied Spring bean <code>getClass()</code> returns the CGLIB subclass, so the logger is named <code>EmployeeServiceImpl$$EnhancerBySpringCGLIB$$...</code>. That name varies between runs and no <code>logging.level.*</code> property can match it.</td></tr>
<tr><td>Why is string concatenation in a log call wasteful?</td><td>The argument is evaluated before the call, so the StringBuilder runs and a String is allocated even when the level is disabled and the line is discarded. The <code>{}</code> form checks the level first and formats only if the event will be emitted.</td></tr>
<tr><td>How do you log an exception with its stack trace?</td><td>Pass the <code>Throwable</code> as the last argument with no matching placeholder: <code>log.error("Failed for id={}", id, ex)</code>. <code>log.error("Failed " + ex)</code> prints only <code>toString()</code> and loses the trace.</td></tr>
<tr><td>When is ERROR right rather than WARN?</td><td>ERROR means the operation failed and a human must act - it should be alertable. WARN means something recovered or degraded: a retry succeeded, a fallback was used, a pool is near capacity. A validation rejection or a 404 is neither.</td></tr>
<tr><td>Can you change a log level without restarting?</td><td>Yes - POST to the Actuator <code>/actuator/loggers/{name}</code> endpoint with <code>{"configuredLevel":"DEBUG"}</code>. It takes effect immediately for that logger and its children. Secure the endpoint; it is a live control over production output.</td></tr>
<tr><td><code>logback.xml</code> or <code>logback-spring.xml</code>?</td><td><code>logback-spring.xml</code>. Plain <code>logback.xml</code> is read by Logback before Spring initialises, so it cannot see profiles or the Environment. Only the <code>-spring</code> variant supports <code>&lt;springProfile&gt;</code> and <code>&lt;springProperty&gt;</code>.</td></tr>
<tr><td>How do you stop logs filling the disk?</td><td>A rolling file appender with <code>SizeAndTimeBasedRollingPolicy</code>: <code>maxFileSize</code> for rotation, <code>maxHistory</code> for retention in days, and <code>totalSizeCap</code> as a hard ceiling. Without <code>totalSizeCap</code>, a burst of errors can still fill the volume.</td></tr>
<tr><td>What is MDC and what does it solve?</td><td>A thread-local map merged into every log line via <code>%X{key}</code>. Putting a correlation id in it at the request boundary makes all lines from one request greppable by that id, which thread names cannot do because threads are pooled and reused.</td></tr>
<tr><td>Why must MDC be cleared in a <code>finally</code>?</td><td>The value lives on a pooled container thread. Left behind, it is stamped onto the next unrelated request - producing wrong diagnostics and, if it holds a user identifier, leaking one user's data into another's log lines.</td></tr>
<tr><td>Why log JSON in production?</td><td>Aggregators index named fields rather than parsing text with regular expressions, so queries like <code>level:ERROR AND traceId:x</code> work, and a multi-line stack trace stays a single document instead of fragmenting into one per frame.</td></tr>
<tr><td>What must never be logged?</td><td>Passwords, tokens and API keys, full card numbers and CVVs, national identifiers, health data, and <code>Authorization</code>/<code>Cookie</code> headers. Under GDPR, names, emails and IP addresses are personal data. Logs are retained for months and read by far more people than the database is.</td></tr>
<tr><td>Where do leaks usually come from?</td><td><code>toString()</code> on a request or entity object that includes a password field, <code>org.hibernate.orm.jdbc.bind=TRACE</code> printing every bound parameter, and <code>org.springframework.web=DEBUG</code> printing full request bodies. Exclude fields from <code>toString()</code>, mask at the call site, and add a Logback <code>%replace</code> filter as a backstop.</td></tr>
<tr><td>What does AsyncAppender buy, and what is its trap?</td><td>It moves file I/O off the request thread through a bounded queue. The trap is <code>discardingThreshold</code>, which defaults to 20 and silently drops everything below WARN once the queue is 80% full. Set it to 0 for production.</td></tr>
</table>`
        }
    ]
};
