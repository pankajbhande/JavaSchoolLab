import { Topic } from '../coreJava';

export const springBootStarter: Topic = {
    id: 'sb-spring-boot-starter',
    name: "spring-boot-starter",
    beginner: [
        {
            content: `<h3>The One Every Other Starter Contains</h3>
<code>spring-boot-starter</code> is the core. You rarely declare it yourself, because every other starter depends on it - adding <code>spring-boot-starter-web</code> brings it along.<br><br>

It contains six things, and knowing what each is for explains a lot of behaviour that otherwise looks like magic.<br><br>

<table>
<tr><th>Dependency</th><th>Provides</th></tr>
<tr><td><code>spring-boot</code></td><td><code>SpringApplication</code>, the runners, the embedded-server abstraction, <code>@ConfigurationProperties</code> binding.</td></tr>
<tr><td><code>spring-boot-autoconfigure</code></td><td>Every <code>@AutoConfiguration</code> class Boot ships - around 150 of them.</td></tr>
<tr><td><code>spring-boot-starter-logging</code></td><td>SLF4J, Logback, and the bridges from other logging APIs.</td></tr>
<tr><td><code>spring-core</code></td><td>The container foundation, pulled transitively with <code>spring-context</code>.</td></tr>
<tr><td><code>jakarta.annotation-api</code></td><td><code>@PostConstruct</code>, <code>@PreDestroy</code>, <code>@Resource</code>.</td></tr>
<tr><td><code>snakeyaml</code></td><td>YAML parsing, so <code>application.yml</code> works.</td></tr>
</table>
<br>
Note what is <em>not</em> here: no web server, no JSON library, no database support. This starter gives you a Spring application that starts, configures itself and logs - nothing more.<br>`,
            codeExamples: [
                `<!-- Declaring it directly is right for a non-web application:
     a batch job, a CLI tool, a message consumer. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>

// A complete application with just this:
@SpringBootApplication
public class ImportJob implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ImportJob.class);

    public static void main(String[] args) {
        SpringApplication.run(ImportJob.class, args);
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Importing {}", args.getOptionValues("file"));
    }
}

// OUTPUT:
//   ... : Starting ImportJob using Java 21
//   ... : No active profile set, falling back to 1 default profile
//   ... : Started ImportJob in 0.84 seconds
//   ... : Importing [orders.csv]
//
// Note "Started ... in 0.84 seconds" and then EXIT. With no web server
// on the classpath there is no non-daemon thread keeping the JVM
// alive, so the process ends when the runners finish. That is correct
// behaviour for a job, and a surprise if you expected a server.`
            ]
        },
        {
            content: `<h3>The Logging Bridges</h3>
The most useful thing in this starter, and the least understood. <code>spring-boot-starter-logging</code> contains five artifacts, and three of them exist purely to redirect other logging frameworks.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   Your code            log.info(...)         SLF4J API
   An old library       Log4j 1.x calls   --\\
   Another library      java.util.logging --+--> BRIDGES
   Apache Commons       JCL calls         --/       |
                                                    v
                                              SLF4J API
                                                    |
                                                    v
                                              Logback  ->  console / file

   log4j-to-slf4j       reroutes Log4j 2 API calls
   jul-to-slf4j         reroutes java.util.logging
   jcl-over-slf4j       reroutes Commons Logging
        (via spring-jcl, which Spring uses internally)</pre>
<br>
Without these, a dependency logging through Log4j would write to its own destination with its own format, ignoring your configuration entirely. The bridges mean <strong>one configuration controls every log line in the process</strong>, whatever API produced it.<br>`,
            codeExamples: [
                `# Because everything funnels into Logback, one file configures all of
# it - and application.properties is enough for most needs:

logging.level.root=INFO
logging.level.com.dhipan=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.springframework.web=DEBUG

logging.file.name=logs/order-service.log
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=30

logging.pattern.console=%d{HH:mm:ss} %-5level %logger{36} - %msg%n

# That third line works even though Hibernate does not use SLF4J
# directly - the bridge puts it under the same control.`
            ]
        },
        {
            content: `<h3>Switching to Log4j2</h3>
The one common reason to touch this starter. The exclusion must be complete or you get two competing implementations.<br>`,
            codeExamples: [
                `<dependency>
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

<!-- The exclusion must go on EVERY starter that pulls
     spring-boot-starter-logging, which is all of them. Missing one
     leaves Logback on the classpath and produces:

  SLF4J: Class path contains multiple SLF4J bindings.
  SLF4J: Found binding in [.../logback-classic-1.4.14.jar!/org/slf4j/...]
  SLF4J: Found binding in [.../log4j-slf4j2-impl-2.21.1.jar!/org/slf4j/...]
  SLF4J: Actual binding is of type [ch.qos.logback.classic.util...]

     One is picked non-deterministically, so log configuration may work
     on one machine and not another.

     The global alternative, cleaner in a multi-module build: -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
            <version>3.2.3</version>
            <scope>provided</scope>          <!-- never packaged -->
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Verify afterwards, do not assume:
       ./mvnw dependency:tree | grep -i logback     -> should be empty -->`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why <code>spring-jcl</code> Exists</h3>
A piece of history that explains an artifact you will see in every dependency tree and may be tempted to exclude.<br><br>

Spring's own internals log through <strong>Jakarta Commons Logging</strong> - a decision made in 2003, long before SLF4J existed. JCL had a genuine problem: its runtime discovery mechanism broke in containers with complex classloader hierarchies, producing the well-known "commons-logging classloader hell".<br><br>

Rather than rewrite every logging call across the framework, Spring 5 shipped <code>spring-jcl</code>: a drop-in replacement exposing the JCL API but delegating to SLF4J, Log4j2 or <code>java.util.logging</code> - whichever it finds - with no runtime discovery.<br><br>

<table>
<tr><th>Consequence</th><th>Detail</th></tr>
<tr><td><code>commons-logging</code> must not be on the classpath</td><td>Both provide <code>org.apache.commons.logging.Log</code>. Two copies of one class is undefined behaviour. Boot's starters exclude it, but a third-party library can drag it back in.</td></tr>
<tr><td>Do not exclude <code>spring-jcl</code></td><td>It is how Spring itself logs. Removing it silences the framework's own output, including startup diagnostics.</td></tr>
</table>`,
            codeExamples: [
                `# Finding a rogue commons-logging - worth checking when framework
# log lines vanish or appear in the wrong format.
./mvnw dependency:tree -Dincludes=commons-logging:commons-logging

# OUTPUT:
# [INFO] com.dhipan:order-service:jar:0.0.1-SNAPSHOT
# [INFO] \- com.example:legacy-soap-client:jar:2.1.0:compile
# [INFO]    \- commons-logging:commons-logging:jar:1.2:compile   <-- here

# Exclude it at the source:
<dependency>
    <groupId>com.example</groupId>
    <artifactId>legacy-soap-client</artifactId>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>

# The symptom this fixes: Spring's own INFO lines stop appearing, or
# appear with a different format than your application's, because two
# implementations of the same API are on the classpath and the one
# picked depends on jar order.`
            ]
        },
        {
            content: `<h3>SnakeYAML, and Why the Version Matters</h3>
<code>snakeyaml</code> is here so <code>application.yml</code> parses. It has a security history worth knowing, because it is one of the more common CVE flags on a Spring Boot dependency scan.<br><br>

The issue is that YAML supports type tags - <code>!!com.example.SomeClass</code> - which instruct the parser to instantiate a class. A parser reading <strong>untrusted</strong> YAML with unrestricted type resolution can therefore be driven to construct arbitrary objects, which has produced remote code execution (CVE-2022-1471 being the widely-cited one).<br><br>

<table>
<tr><th>Situation</th><th>Risk</th></tr>
<tr><td>Boot parsing your own <code>application.yml</code></td><td>None in practice - Boot uses a restricted constructor, and the file is part of your artifact, not user input.</td></tr>
<tr><td>Your code calling <code>new Yaml().load(userInput)</code></td><td><strong>Serious.</strong> This is the vulnerable pattern.</td></tr>
</table>
<br>
So the practical advice is not "remove snakeyaml" - it is: keep Boot current so the managed version is patched, and never hand user-supplied YAML to a default <code>Yaml</code> instance.<br>`,
            codeExamples: [
                `// UNSAFE - do not parse untrusted YAML this way.
Yaml yaml = new Yaml();
Config config = yaml.load(request.getInputStream());   // arbitrary types

// SAFE - restrict what may be constructed.
LoaderOptions options = new LoaderOptions();
options.setAllowDuplicateKeys(false);
Yaml yaml = new Yaml(new SafeConstructor(options));    // no arbitrary types
Map<String, Object> data = yaml.load(request.getInputStream());

// Or, if the shape is known, bind to one class only:
Yaml yaml = new Yaml(new Constructor(Config.class, new LoaderOptions()));

// If YAML support is not needed at all, the dependency can go:
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.yaml</groupId>
            <artifactId>snakeyaml</artifactId>
        </exclusion>
    </exclusions>
</dependency>
// application.yml then stops working SILENTLY - the file is ignored,
// not reported as an error. Only do this if the project uses
// .properties exclusively, and say so in a comment.`
            ]
        },
        {
            content: `<h3>What You Get Without a Web Server</h3>
Declaring only <code>spring-boot-starter</code> produces a specific and useful application shape.<br>`,
            codeExamples: [
                `// The full container is present: scanning, injection, @Transactional,
// @Scheduled, @Async, events, @ConfigurationProperties, profiles.
// Only the web layer is absent.

@SpringBootApplication
@EnableScheduling
public class ReconciliationJob {

    public static void main(String[] args) {
        SpringApplication.run(ReconciliationJob.class, args);
    }
}

@Service
public class Reconciler {

    @Scheduled(cron = "0 0 2 * * *")        // works: no web layer needed
    @Transactional                          // works: proxying is in the core
    public void nightly() { ... }
}

// One catch: @Scheduled needs the JVM to stay alive, but a non-web
// application exits when its runners finish. The scheduler's thread is
// a daemon by default, so it does not hold the process open.
//
// Force a non-web application to keep running:
//   SpringApplication app = new SpringApplication(ReconciliationJob.class);
//   app.setWebApplicationType(WebApplicationType.NONE);
//   app.setRegisterShutdownHook(true);
//   app.run(args);
//   // then block - a CountDownLatch, or Thread.currentThread().join()
//
// In practice a scheduled job usually belongs in a web application
// with an Actuator health endpoint, so the platform can tell whether
// it is alive.`,
                `// Being explicit about the application type - worth doing when a
// dependency might drag in a servlet API and accidentally start a
// server:

SpringApplication app = new SpringApplication(ImportJob.class);
app.setWebApplicationType(WebApplicationType.NONE);
app.run(args);

// or in application.properties:
spring.main.web-application-type=none

// The values:
//   NONE      no server, exits when runners finish
//   SERVLET   Spring MVC + embedded servlet container
//   REACTIVE  WebFlux + Netty
//
// Boot infers this from the classpath. The inference is usually right,
// and stating it explicitly turns "why is this listening on 8080"
// into a compile-time-visible decision.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is in <code>spring-boot-starter</code>?</td><td><code>spring-boot</code>, <code>spring-boot-autoconfigure</code>, <code>spring-boot-starter-logging</code>, <code>spring-core</code>, <code>jakarta.annotation-api</code> and <code>snakeyaml</code>.</td></tr>
<tr><td>Do you usually declare it?</td><td>No - every other starter includes it. Declare it directly only for a non-web application such as a batch job or CLI tool.</td></tr>
<tr><td>What does the logging starter contain?</td><td>SLF4J and Logback plus bridges - <code>log4j-to-slf4j</code> and <code>jul-to-slf4j</code> - so libraries using other logging APIs are routed through one configuration.</td></tr>
<tr><td>Why do the bridges matter?</td><td>Without them a dependency's log output ignores your configuration and format entirely.</td></tr>
<tr><td>How do you switch to Log4j2?</td><td>Exclude <code>spring-boot-starter-logging</code> from every starter that pulls it and add <code>spring-boot-starter-log4j2</code>. Missing one exclusion gives multiple SLF4J bindings and non-deterministic behaviour.</td></tr>
<tr><td>What is <code>spring-jcl</code>?</td><td>Spring's drop-in replacement for Commons Logging that delegates to SLF4J without JCL's runtime discovery. Do not exclude it; do ensure real <code>commons-logging</code> is absent.</td></tr>
<tr><td>Why is SnakeYAML flagged by scanners?</td><td>YAML type tags can instantiate arbitrary classes, so parsing untrusted YAML with a default <code>Yaml</code> is an RCE risk. Boot's own use is restricted and safe; keep the version current and use <code>SafeConstructor</code> for user input.</td></tr>
<tr><td>What happens if you exclude SnakeYAML?</td><td><code>application.yml</code> is ignored silently - no error, just unapplied configuration.</td></tr>
<tr><td>Why does a non-web Boot application exit immediately?</td><td>Nothing holds a non-daemon thread once the runners finish. Set the application type explicitly and block if it must stay alive.</td></tr>
<tr><td>Does <code>@Transactional</code> work without a web starter?</td><td>Yes - AOP and transaction support live in the core, below the web layer.</td></tr>
</table>`
        }
    ]
};
