import { Topic } from '../coreJava';

export const introductionToSpringBoot: Topic = {
                        id: 'introductiontospringboot',
                        name: 'Introduction to Spring Boot',
                        beginner: [
                            {
                                content: `Spring Boot is a framework that simplifies Spring application development with auto-configuration and embedded servers.

 Key Features:
 • Auto-configuration: Automatically configures beans
 • Starter dependencies: Pre-configured dependencies
 • Embedded server: Tomcat, Jetty, or Undertow
 • Production-ready: Actuator for monitoring
 • No XML configuration: Annotation-based

 Advantages:
 • Rapid development
 • Microservices support
 • Easy testing
 • Reduced boilerplate code`,
                                codeExamples: [
                                    `@SpringBootApplication
 public class Application {
     public static void main(String[] args) {
         SpringApplication.run(Application.class, args);
     }
 }

 @RestController
 @RequestMapping("/api")
 public class ApiController {

     @GetMapping("/hello")
     public String hello() {
         return "Hello from Spring Boot!";
     }

     @PostMapping("/user")
     public User createUser(@RequestBody User user) {
         // Save user logic
         return user;
     }
 }`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>What @SpringBootApplication Really Is</h3>
<code>@SpringBootApplication</code> is a convenience meta-annotation that bundles three separate annotations. Understanding what each one does is the single most-asked Spring Boot interview question.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Annotation</th><th>Purpose</th></tr>
<tr class='text-center'><td>@Configuration</td><td>Marks the class as a source of bean definitions (can contain @Bean methods)</td></tr>
<tr class='text-center'><td>@EnableAutoConfiguration</td><td>Tells Spring Boot to auto-configure beans based on classpath jars, other beans, and property values</td></tr>
<tr class='text-center'><td>@ComponentScan</td><td>Scans the current package and sub-packages for @Component, @Service, @Repository, @Controller, etc.</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">SpringApplication.run(Application.class, args)
        |
        v
1. Create ApplicationContext (Servlet/Reactive/Default based on classpath)
        |
        v
2. Load @Configuration classes + run @ComponentScan
        |
        v
3. @EnableAutoConfiguration kicks in:
     - Reads META-INF/spring/...AutoConfiguration.imports (Boot 3+)
       or spring.factories (Boot 2)
     - Each auto-config class is guarded by @Conditional* checks:
         @ConditionalOnClass      -> is the dependency on the classpath?
         @ConditionalOnMissingBean -> did the user NOT already define one?
         @ConditionalOnProperty   -> is a specific property set?
     - Only matching auto-configurations register their beans
        |
        v
4. Embedded server auto-configured (Tomcat/Jetty/Undertow) if
   spring-boot-starter-web is on the classpath
        |
        v
5. ApplicationContext refreshed -> beans instantiated & wired
        |
        v
6. Embedded server started -> application ready to serve requests</pre>
<br>
This is why adding <code>spring-boot-starter-data-jpa</code> to the classpath is enough to get a working <code>DataSource</code> and <code>EntityManager</code> - <code>DataSourceAutoConfiguration</code> and <code>HibernateJpaAutoConfiguration</code> detect the JPA/JDBC classes and a <code>spring.datasource.*</code> property, then wire the beans automatically - no XML, no manual bean definitions.<br>`,
                                codeExamples: [
                                    `@SpringBootApplication
// Equivalent to writing all three below:
// @Configuration
// @EnableAutoConfiguration
// @ComponentScan
public class Application {
    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(Application.class, args);
        System.out.println("Beans loaded: " + ctx.getBeanDefinitionCount());
    }
}
// OUTPUT:
// Beans loaded: <N>   (hundreds of auto-configured beans, exact count varies by starters used)`,
                                    `// Debugging WHY a bean was or wasn't auto-configured:
// run with --debug flag (or debug=true in application.properties)
// java -jar app.jar --debug
//
// Produces a "CONDITIONS EVALUATION REPORT" showing:
// Positive matches:
//    DataSourceAutoConfiguration matched:
//       - @ConditionalOnClass found required class 'javax.sql.DataSource'
// Negative matches:
//    JpaRepositoriesAutoConfiguration did not match:
//       - @ConditionalOnMissingBean did not find beans of type ...
// OUTPUT:
// (console dump of matched/unmatched auto-configuration classes and the reason for each)`
                                ]
                            },
                            {
                                content: `<h3>Embedded Server Model vs Traditional WAR Deployment</h3>
Classic Spring MVC applications are packaged as a <strong>WAR</strong> file and deployed INTO an externally installed servlet container (Tomcat/JBoss/WebLogic). Spring Boot flips this: the servlet container is a library dependency that gets bundled INSIDE an executable <strong>JAR</strong>, so "the server" ships with the app.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Traditional Spring MVC (WAR)</th><th>Spring Boot (embedded, JAR)</th></tr>
<tr class='text-center'><td>Packaging</td><td>.war</td><td>.jar (executable, "fat jar")</td></tr>
<tr class='text-center'><td>Server</td><td>Installed separately (Tomcat, etc.)</td><td>Bundled inside the jar (Tomcat/Jetty/Undertow)</td></tr>
<tr class='text-center'><td>Deployment</td><td>Copy WAR into server's webapps/ folder</td><td>java -jar app.jar - runs anywhere with a JVM</td></tr>
<tr class='text-center'><td>Multiple apps per server</td><td>Common - one Tomcat, many WARs</td><td>Uncommon - one process, one embedded server (microservice style)</td></tr>
<tr class='text-center'><td>Server version control</td><td>Ops team controls Tomcat version</td><td>Dev controls server version via pom.xml/build.gradle</td></tr>
<tr class='text-center'><td>Startup</td><td>Deploy descriptor / web.xml driven</td><td>main() method calls SpringApplication.run()</td></tr>
</table>
<br>
Switching the embedded server is a one-line dependency change - exclude Tomcat and pull in Jetty or Undertow:<br>`,
                                codeExamples: [
                                    `<!-- pom.xml: swap embedded Tomcat for Jetty -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
<!-- OUTPUT: -->
<!-- Application now starts on embedded Jetty instead of Tomcat, -->
<!-- no other code changes required. -->`,
                                    `// Running the packaged app - no separate server install needed
// mvn clean package
// java -jar target/myapp-0.0.1-SNAPSHOT.jar
// OUTPUT:
//   .   ____          _            __ _ _
//  /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
// ( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
//  \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
//   '  |____| .__|_| |_|_| |_\\__, | / / / /
//  =========|_|==============|___/=/_/_/_/
// Tomcat started on port(s): 8080 (http)
// Started Application in 1.923 seconds`
                                ]
                            },
                            {
                                content: `<h3>Spring Boot Starters - What a Starter POM Actually Does</h3>
A "starter" is NOT a magic feature - it is simply a curated dependency descriptor with <strong>no code of its own</strong>, whose <code>pom.xml</code> pulls in a compatible, version-tested set of libraries via transitive dependencies.<br><br>
For example, <code>spring-boot-starter-web</code> transitively brings in: <code>spring-webmvc</code>, <code>spring-boot-starter-tomcat</code> (embedded server), <code>spring-boot-starter-json</code> (Jackson for JSON binding), and <code>spring-boot-starter</code> (core auto-config + logging). You declare ONE dependency and get a whole working stack whose versions are guaranteed compatible with each other - that compatibility matrix is the real value of the "Spring Boot BOM" (Bill of Materials).<br>`,
                                codeExamples: [
                                    `<!-- Without starters: managing every library + version yourself -->
<dependency><groupId>org.springframework</groupId><artifactId>spring-webmvc</artifactId><version>6.1.2</version></dependency>
<dependency><groupId>org.apache.tomcat.embed</groupId><artifactId>tomcat-embed-core</artifactId><version>10.1.17</version></dependency>
<dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.16.0</version></dependency>
<!-- ... and you must manually keep all versions compatible -->

<!-- With a starter: one line, versions managed by Spring Boot's parent BOM -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- OUTPUT: -->
<!-- mvn dependency:tree shows spring-webmvc, embedded Tomcat, Jackson -->
<!-- and spring-boot-starter (logging + core) all pulled in transitively -->`
                                ]
                            },
                            {
                                content: `<h3>Common Starters Reference</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Starter</th><th>Brings In</th></tr>
<tr class='text-center'><td>spring-boot-starter-web</td><td>Spring MVC + embedded Tomcat + Jackson (REST APIs, MVC)</td></tr>
<tr class='text-center'><td>spring-boot-starter-data-jpa</td><td>Hibernate + Spring Data JPA + JDBC (database access)</td></tr>
<tr class='text-center'><td>spring-boot-starter-security</td><td>Spring Security (authentication/authorization)</td></tr>
<tr class='text-center'><td>spring-boot-starter-test</td><td>JUnit, Mockito, AssertJ, Spring Test (testing)</td></tr>
<tr class='text-center'><td>spring-boot-starter-actuator</td><td>Production-ready monitoring endpoints</td></tr>
<tr class='text-center'><td>spring-boot-starter-validation</td><td>Hibernate Validator (Bean Validation / @Valid)</td></tr>
</table>`
                            },
                            {
                                content: `<h3>Externalized Configuration: application.properties / application.yml</h3>
Spring Boot lets you pull hard-coded values OUT of Java code into a config file, so behavior changes per environment without recompiling. Both formats configure the exact same underlying properties - YAML is just a more structured/nested syntax.<br>`,
                                codeExamples: [
                                    `# application.properties
server.port=9090
app.greeting=Hello from properties file
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=secret`,
                                    `# application.yml (equivalent to the properties above)
server:
  port: 9090
app:
  greeting: Hello from properties file
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret`,
                                    `@RestController
public class ConfigDemoController {

    // Injects the value of app.greeting from application.properties/yml
    @Value("\${app.greeting}")
    private String greeting;

    @GetMapping("/greeting")
    public String show() {
        return greeting;
    }
}
// OUTPUT (with app.greeting=Hello from properties file):
// GET /greeting -> "Hello from properties file"`,
                                    `// Type-safe alternative to scattered @Value: @ConfigurationProperties
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String greeting;
    public String getGreeting() { return greeting; }
    public void setGreeting(String greeting) { this.greeting = greeting; }
}
// OUTPUT:
// appProperties.getGreeting() returns "Hello from properties file"
// -- one bean instead of many scattered @Value fields, and it is
// validated/bound as a group at startup.`
                                ]
                            },
                            {
                                content: `<h3>Profiles - Environment-Specific Beans and Configuration</h3>
Profiles let the SAME codebase behave differently in dev, test, and prod by activating different beans and property files. A bean annotated <code>@Profile("dev")</code> is registered ONLY when that profile is active.<br>`,
                                codeExamples: [
                                    `public interface NotificationService {
    void notify(String message);
}

@Service
@Profile("dev")
class ConsoleNotificationService implements NotificationService {
    public void notify(String message) {
        System.out.println("[DEV LOG] " + message);
    }
}

@Service
@Profile("prod")
class EmailNotificationService implements NotificationService {
    public void notify(String message) {
        System.out.println("[EMAIL SENT] " + message);
    }
}
// OUTPUT depends on active profile - only ONE of these beans is
// created per run, never both.`,
                                    `# application-dev.yml   (loaded only when profile "dev" is active)
app:
  mode: development

# application-prod.yml  (loaded only when profile "prod" is active)
app:
  mode: production

# Activating a profile - any ONE of:
# 1) application.properties:      spring.profiles.active=dev
# 2) command line:                java -jar app.jar --spring.profiles.active=prod
# 3) environment variable:        SPRING_PROFILES_ACTIVE=prod
# OUTPUT (spring.profiles.active=dev):
# ConsoleNotificationService bean is injected wherever NotificationService is used
// [DEV LOG] Order placed successfully`
                                ]
                            },
                            {
                                content: `<h3>Spring Boot Actuator - Production Monitoring</h3>
Adding <code>spring-boot-starter-actuator</code> exposes ready-made HTTP endpoints for health checks, metrics, and environment inspection - no custom code needed. Essential for production observability (load balancer health checks, Prometheus scraping, etc.).<br>`,
                                codeExamples: [
                                    `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>`,
                                    `# application.properties - expose the endpoints you need
management.endpoints.web.exposure.include=health,info,metrics

# GET /actuator/health
# OUTPUT:
# { "status": "UP" }

# GET /actuator/metrics/jvm.memory.used
# OUTPUT:
# { "name": "jvm.memory.used", "measurements": [{"statistic":"VALUE","value":5.8E7}] }`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What three annotations does @SpringBootApplication combine?</td><td>@Configuration, @EnableAutoConfiguration, @ComponentScan</td></tr>
<tr class='text-center'><td>How does auto-configuration decide which beans to create?</td><td>Via @Conditional* checks (@ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty) evaluated against the classpath, existing beans, and properties</td></tr>
<tr class='text-center'><td>What is a Spring Boot starter?</td><td>A dependency-only POM with no code that transitively pulls in a version-compatible set of libraries for a feature (e.g. web, JPA)</td></tr>
<tr class='text-center'><td>Difference between WAR deployment and Spring Boot's embedded server model?</td><td>WAR is deployed into an externally installed container; Spring Boot bundles the server (Tomcat/Jetty/Undertow) inside an executable JAR so "java -jar" is enough</td></tr>
<tr class='text-center'><td>How do you override an auto-configured bean?</td><td>Define your own bean of the same type - most auto-configurations are annotated @ConditionalOnMissingBean, so yours wins</td></tr>
<tr class='text-center'><td>properties vs yml - functionally different?</td><td>No, both configure the same underlying property keys; YAML just supports hierarchical nesting more concisely</td></tr>
<tr class='text-center'><td>How do you activate a Spring profile?</td><td>spring.profiles.active property, --spring.profiles.active= CLI arg, or SPRING_PROFILES_ACTIVE env var</td></tr>
<tr class='text-center'><td>What does Spring Boot Actuator provide?</td><td>Production-ready HTTP endpoints (health, metrics, info, env, etc.) for monitoring a running application</td></tr>
<tr class='text-center'><td>Can you switch the embedded server from Tomcat to Jetty?</td><td>Yes - exclude spring-boot-starter-tomcat from spring-boot-starter-web and add spring-boot-starter-jetty (or undertow)</td></tr>
<tr class='text-center'><td>What debug flag reveals why an auto-configuration did or didn't apply?</td><td>Run with --debug (or debug=true) to print the Conditions Evaluation Report</td></tr>
</table>`
                            }
                        ]
                    };
