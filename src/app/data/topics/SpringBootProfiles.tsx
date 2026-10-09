import { Topic } from '../coreJava';

export const springBootProfiles: Topic = {
    id: 'spring-boot-profiles',
    name: 'Profiles & Externalized Configuration',
    beginner: [
        {
            content: `<h3>Spring Boot Profiles</h3>
Using Spring Boot we can set different profiles for the <strong>dev</strong>, <strong>test</strong> and <strong>prod</strong> environments.<br><br>

<h3>Why do we use them?</h3>
In a company you work across several environments, and each has its own configuration - driver name, URL, username, password. Editing one <code>application.properties</code> file every time you move between them is not workable.<br><br>

The answer is to create <strong>one properties file per environment</strong> and let Spring pick the right one at startup.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot Maven project<br>
2. Add the Maven dependency to pom.xml<br>
3. Write the database connection code in the main properties file<br>
4. Create an application.properties file for each environment<br>
5. Go to the main application.properties and set the active profile<br>
6. Run the Spring Boot application<br>
7. Check the console for the environment
</div>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>`,
                `# Step 3 - application.properties  (the COMMON file)
server.port=8081

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/27augustjavabatch?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`
            ]
        },
        {
            content: `<h3>Step 4 - One File Per Environment</h3>
The naming pattern is fixed: <code>application-{profile}.properties</code>. The part between the hyphen and <code>.properties</code> <strong>is</strong> the profile name.<br><br>

<table>
<tr><th>File</th><th>Profile</th><th>Port</th></tr>
<tr><td>application-dev.properties</td><td>dev</td><td>8082</td></tr>
<tr><td>application-test.properties</td><td>test</td><td>8083</td></tr>
<tr><td>application-prod.properties</td><td>prod</td><td>8084</td></tr>
</table>
<br>
All three live in <code>src/main/resources</code> alongside the common file.<br>`,
            codeExamples: [
                `# application-dev.properties
#For DEV Environment
server.port=8082

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://127.31.16.13:3306/dev?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`,
                `# application-test.properties
#For TEST Environment
server.port=8083

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://127.32.17.14:3306/test?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`,
                `# application-prod.properties
#For PROD Environment
server.port=8084

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://127.33.18.15:3306/prod?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`
            ]
        },
        {
            content: `<h3>Steps 5 to 7 - Activate a Profile and Run</h3>
One line in the main <code>application.properties</code> selects which environment file is loaded on top of it.<br><br>

<strong>The key is lowercase:</strong> <code>spring.profiles.active</code>, not <code>Spring.profiles.active</code>. Property keys are case-sensitive, so the capitalised version is silently ignored and no profile is activated at all.<br>`,
            codeExamples: [
                `# application.properties - add this line
spring.profiles.active=dev`,
                `// Run as -> Spring Boot App
// CONSOLE:
// The following 1 profile is active: "dev"
// Tomcat started on port(s): 8082 (http)
//
// The port came from application-dev.properties, overriding the
// 8081 in the common file. That is the profile working.

// Switch to test:
//   spring.profiles.active=test
// CONSOLE:
// The following 1 profile is active: "test"
// Tomcat started on port(s): 8083 (http)

// Switch to prod:
//   spring.profiles.active=prod
// CONSOLE:
// The following 1 profile is active: "prod"
// Tomcat started on port(s): 8084 (http)

// With NO active profile:
// CONSOLE:
// No active profile set, falling back to 1 default profile: "default"
// Tomcat started on port(s): 8081 (http)`
            ]
        },
        {
            content: `<h3>How to Read Values From application.properties</h3>
Two ways, both useful.<br><br>

<h3>Way 1 - <code>@Value</code></h3>
Inject a single property straight into a field.<br>`,
            codeExamples: [
                `@RestController
public class ConfigController {

    @Value("\${spring.datasource.url}")
    private String url;

    @GetMapping("/getData")
    public String getData() {
        return url;
    }
}
// GET http://localhost:8082/getData
// OUTPUT (dev profile active):
// jdbc:mysql://127.31.16.13:3306/dev?autoReconnect=true&useSSL=false`
            ]
        },
        {
            content: `<h3>Way 2 - the <code>Environment</code> Object</h3>
Inject Spring's <code>Environment</code> and look properties up by name at runtime. Useful when you need several values, or when the key is not known at compile time.<br>`,
            codeExamples: [
                `// Step 1 - the DTO
package com.velocity.dto;

public class DatabaseDetails {

    private String name;
    private String url;
    private String username;
    private String password;

    // getters and setters
}`,
                `// Steps 2 & 3 - inject Environment and read the values
package com.velocity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.dto.DatabaseDetails;

@RestController
public class ConfigController {

    @Autowired
    private Environment environment;

    @GetMapping("/getData")
    public DatabaseDetails getData() {

        DatabaseDetails details = new DatabaseDetails();

        details.setName(environment.getProperty("spring.datasource.driver-class-name"));
        details.setUrl(environment.getProperty("spring.datasource.url"));
        details.setUsername(environment.getProperty("spring.datasource.username"));
        details.setPassword(environment.getProperty("spring.datasource.password"));

        return details;
    }
}`,
                `// GET http://localhost:8082/getData
// RESPONSE (200 OK) with the dev profile active:
{
    "name": "com.mysql.cj.jdbc.Driver",
    "url": "jdbc:mysql://127.31.16.13:3306/dev?autoReconnect=true&useSSL=false",
    "username": "root",
    "password": "root"
}

// Switch to prod, restart, and the SAME endpoint returns:
{
    "name": "com.mysql.cj.jdbc.Driver",
    "url": "jdbc:mysql://127.33.18.15:3306/prod?autoReconnect=true&useSSL=false",
    "username": "root",
    "password": "root"
}
// One codebase, one jar, three environments.
//
// (An endpoint that returns the database password is fine as a
//  teaching example and must never exist in a real application -
//  see the Expert tab.)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Do Not Hard-Code the Active Profile Into the Jar</h3>
Putting <code>spring.profiles.active=dev</code> in <code>application.properties</code> works for a demo and defeats the purpose of profiles: the profile is now <em>baked into the artefact</em>. Deploying to production means editing a file and rebuilding, so the jar you tested is not the jar you ship.<br><br>

The profile should come from <strong>outside</strong> the jar - which is exactly what the property-source ordering allows.<br><br>

<table>
<tr><th>How to set it</th><th>When</th></tr>
<tr><td><code>java -jar app.jar --spring.profiles.active=prod</code></td><td>Command line - the highest priority, and the clearest.</td></tr>
<tr><td><code>SPRING_PROFILES_ACTIVE=prod</code></td><td>Environment variable - the standard for Docker and Kubernetes.</td></tr>
<tr><td><code>-Dspring.profiles.active=prod</code></td><td>A JVM system property.</td></tr>
<tr><td><code>@ActiveProfiles("test")</code></td><td>On a test class.</td></tr>
<tr><td>In <code>application.properties</code></td><td>Only as a safe default - typically <code>dev</code>.</td></tr>
</table>
<br>
Note the environment-variable spelling: Spring maps <code>SPRING_PROFILES_ACTIVE</code> to <code>spring.profiles.active</code> automatically via relaxed binding, so uppercase and underscores are correct there and wrong everywhere else.<br>`,
            codeExamples: [
                `# The same artefact, three deployments
java -jar app.jar --spring.profiles.active=dev
java -jar app.jar --spring.profiles.active=test
java -jar app.jar --spring.profiles.active=prod

# Docker
docker run -e SPRING_PROFILES_ACTIVE=prod myapp:1.0

# Kubernetes
env:
  - name: SPRING_PROFILES_ACTIVE
    value: "prod"`,
                `# Several profiles can be active at once - they layer left to right,
# with later files overriding earlier ones.
java -jar app.jar --spring.profiles.active=prod,metrics,eu-west

# Loading order:
#   application.properties            (always)
#   application-prod.properties
#   application-metrics.properties
#   application-eu-west.properties    (wins on conflicts)

# spring.profiles.group bundles them (Boot 2.4+):
spring.profiles.group.production=prod,metrics,eu-west
# then simply: --spring.profiles.active=production`
            ]
        },
        {
            content: `<h3>Secrets Must Not Live in Properties Files</h3>
Every file above contains <code>spring.datasource.password=root</code>. Those files are committed to git, packaged into the jar, and readable by anyone who can unzip it.<br><br>

<table>
<tr><th>Where the password leaks</th><th>Why</th></tr>
<tr><td>Git history</td><td>Deleting it later does not remove it from earlier commits.</td></tr>
<tr><td>The built jar</td><td><code>unzip -p app.jar BOOT-INF/classes/application-prod.properties</code></td></tr>
<tr><td>CI build logs</td><td>Anything that echoes the config.</td></tr>
<tr><td>Docker image layers</td><td>Present in the image even if a later layer deletes the file.</td></tr>
<tr><td><code>/actuator/env</code></td><td>Exposed over HTTP if the endpoint is open.</td></tr>
</table>
<br>
Keep the <em>shape</em> of the config in the file and inject the <em>value</em> from the environment. Spring Boot's <code>\${VAR:default}</code> syntax makes that a one-line change.<br>`,
            codeExamples: [
                `# application-prod.properties - no secret in the file
spring.datasource.url=\${DB_URL}
spring.datasource.username=\${DB_USER}
spring.datasource.password=\${DB_PASSWORD}

# application-dev.properties - a default is fine for a local database
spring.datasource.url=\${DB_URL:jdbc:mysql://localhost:3306/dev}
spring.datasource.username=\${DB_USER:root}
spring.datasource.password=\${DB_PASSWORD:root}
# The part after the colon is the fallback when the variable is unset.`,
                `// Fail fast when a required secret is missing, rather than
// starting up and failing on the first database call.
@Component
@ConfigurationProperties(prefix = "spring.datasource")
@Validated
public class DataSourceProperties {

    @NotBlank private String url;
    @NotBlank private String username;
    @NotBlank private String password;

    // getters and setters
}
// OUTPUT when DB_PASSWORD is not set:
// APPLICATION FAILED TO START
// Binding to target DataSourceProperties failed:
//     Property: spring.datasource.password
//     Reason: must not be blank
// Better at deploy time than at 3am on the first request.`
            ]
        },
        {
            content: `<h3><code>@Value</code> vs <code>@ConfigurationProperties</code></h3>
Both read configuration. <code>@ConfigurationProperties</code> is what you want once there is more than a handful of keys.<br><br>

<table>
<tr><th>Aspect</th><th>@Value</th><th>@ConfigurationProperties</th></tr>
<tr><td>Scope</td><td>One key per field</td><td>A whole prefix bound to an object</td></tr>
<tr><td>Type safety</td><td>String expression; a typo is a runtime failure</td><td>Real types, bound and validated at startup</td></tr>
<tr><td>Validation</td><td>None</td><td><code>@Validated</code> plus Bean Validation annotations</td></tr>
<tr><td>Nested / list values</td><td>Awkward</td><td>Natural</td></tr>
<tr><td>Relaxed binding</td><td>Exact key only</td><td><code>app.max-size</code>, <code>APP_MAXSIZE</code>, <code>app.maxSize</code> all bind</td></tr>
<tr><td>IDE autocomplete</td><td>No</td><td>Yes, with the configuration-processor</td></tr>
</table>
<br>
A missing key with <code>@Value</code> fails at startup with an unhelpful message; with a default (<code>\${key:fallback}</code>) it silently uses the fallback, which is worse when the key was meant to be set.<br>`,
            codeExamples: [
                `# A group of related settings
app.report.title=Employee Report
app.report.max-rows=5000
app.report.formats=pdf,xlsx,csv
app.report.retention-days=30`,
                `@Component
@ConfigurationProperties(prefix = "app.report")
@Validated
public class ReportProperties {

    @NotBlank
    private String title;

    @Min(1) @Max(100000)
    private int maxRows;

    private List<String> formats;      // bound from the comma-separated list

    private Duration retention;        // "30d" or "PT720H" both work

    // getters and setters
}

@Service
public class ReportService {

    private final ReportProperties props;    // one object, not six @Value fields

    public ReportService(ReportProperties props) {
        this.props = props;
    }
}
// OUTPUT:
// props.getFormats()  -> ["pdf", "xlsx", "csv"]
// props.getMaxRows()  -> 5000
// A value of 999999 fails at STARTUP:
//   Property: app.report.max-rows, Reason: must be less than or equal to 100000`,
                `<!-- Enables IDE autocomplete for your own properties -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>`
            ]
        },
        {
            content: `<h3>Profiles Select Beans, Not Just Properties</h3>
The examples switch database URLs. <code>@Profile</code> goes further: it decides which <strong>beans</strong> exist at all - so an entire implementation can differ per environment.<br>`,
            codeExamples: [
                `public interface NotificationService {
    void send(String to, String message);
}

@Service
@Profile("dev")
class ConsoleNotificationService implements NotificationService {
    public void send(String to, String message) {
        System.out.println("[DEV] would send to " + to + ": " + message);
    }
}

@Service
@Profile({"test", "prod"})
class SmtpNotificationService implements NotificationService {
    public void send(String to, String message) {
        mailSender.send(...);
    }
}
// OUTPUT with dev active:
//   [DEV] would send to ajay@gmail.com: your policy is active
// OUTPUT with prod active:
//   a real email is sent
//
// Exactly ONE bean of the type exists per run, so anything that
// injects NotificationService needs no conditional logic at all.`,
                `// @Profile("!prod") - everything EXCEPT production
@Configuration
@Profile("!prod")
public class DevDataLoader {

    @Bean
    CommandLineRunner seedData(EmployeeRepository repo) {
        return args -> repo.saveAll(List.of(
                new Employee(null, "ajay", "pune"),
                new Employee(null, "sohan", "mumbai")));
    }
}
// Seed data in dev and test; never in production.`,
                `// Profile-specific YAML in ONE file, using document separators
// application.yml
spring:
  application:
    name: employee-service
---
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8082
---
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 8084
// Boot 2.4+ syntax. Older versions used "spring.profiles: dev".`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What problem do profiles solve?</td><td>The same codebase and the same artefact run in dev, test and prod with different configuration, instead of editing files per environment.</td></tr>
<tr><td>What is the file-naming convention?</td><td><code>application-{profile}.properties</code> - the name between the hyphen and the extension is the profile.</td></tr>
<tr><td>How does the profile file relate to the main one?</td><td><code>application.properties</code> always loads; the profile file loads on top and overrides matching keys.</td></tr>
<tr><td>How do you activate a profile?</td><td><code>spring.profiles.active</code> in the properties file, <code>--spring.profiles.active=prod</code> on the command line, or the <code>SPRING_PROFILES_ACTIVE</code> environment variable.</td></tr>
<tr><td>Why is <code>Spring.profiles.active</code> ignored?</td><td>Property keys are case-sensitive; the capitalised form is not the key Spring looks for, so nothing is activated.</td></tr>
<tr><td>Why should the active profile not be hard-coded in the jar?</td><td>It bakes the environment into the artefact, so shipping to production requires a rebuild and the tested jar is not the deployed one.</td></tr>
<tr><td>Can several profiles be active at once?</td><td>Yes - comma-separated. They layer left to right, with later ones winning.</td></tr>
<tr><td>What does @Profile on a bean do?</td><td>Registers that bean only when the named profile is active, so whole implementations can differ per environment.</td></tr>
<tr><td>What does <code>@Profile("!prod")</code> mean?</td><td>Active in every profile except prod.</td></tr>
<tr><td>@Value vs @ConfigurationProperties?</td><td>@Value injects one key per field with no validation; @ConfigurationProperties binds a whole prefix to a typed, validated object and supports relaxed binding.</td></tr>
<tr><td>How do you keep secrets out of properties files?</td><td>Use <code>\${DB_PASSWORD}</code> placeholders and supply the value from an environment variable or a secrets manager - never commit the value.</td></tr>
<tr><td>Two ways to read a property in code?</td><td><code>@Value("\${key}")</code> for a single value, or inject <code>Environment</code> and call <code>getProperty("key")</code> for dynamic lookups.</td></tr>
</table>`
        }
    ]
};
