import { Topic } from '../coreJava';

export const springBootFeatures: Topic = {
    id: 'sb-spring-boot-features',
    name: "Spring Boot Features",
    beginner: [
        {
            content: `<h3>Beyond the Big Four</h3>
Starters, auto-configuration, the embedded server and Actuator are the headline features, and the previous topics cover them. Boot also ships a second tier that rarely appears on a feature list but shapes daily work more than any of them.<br><br>

<table>
<tr><th>Feature</th><th>What it is for</th></tr>
<tr><td><strong>DevTools</strong></td><td>Automatic restart on a code change, so you stop stopping and starting the application.</td></tr>
<tr><td><strong>Configuration metadata</strong></td><td>Autocomplete and validation for your own properties in the IDE.</td></tr>
<tr><td><strong>Runners</strong></td><td>Code that runs once, after startup completes.</td></tr>
<tr><td><strong>Graceful shutdown</strong></td><td>Finish in-flight requests before the process exits.</td></tr>
<tr><td><strong>Test support</strong></td><td><code>@SpringBootTest</code>, slice annotations, and auto-configured test utilities.</td></tr>
<tr><td><strong>Image building</strong></td><td>A container image from Maven, with no Dockerfile.</td></tr>
</table>`
        },
        {
            content: `<h3>DevTools</h3>
One dependency. When a class file changes, Boot restarts the application context in about a second rather than the usual several.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>          <!-- keeps it out of consumers -->
    <scope>runtime</scope>
</dependency>

// How it is fast: TWO classloaders. Your classes are loaded by a
// throwaway "restart" loader; the jars, which do not change, stay in
// the base loader. A restart discards only the first, so nothing is
// re-read from disk.
//
// It also switches development-hostile defaults off automatically:
//   template caching       off   (edit a template, refresh)
//   static resource cache  off
//   H2 console             on
//   debug logging for web  on

// Safe by design in production - DevTools disables itself when it
// detects it is running from a fully packaged jar, and <optional>true
// stops it leaking to anything that depends on your artifact.

// The trigger is a change to the CLASSPATH, not to the source file.
// In IntelliJ, enable "Build project automatically" or restarts never
// happen; Eclipse compiles on save already.`,
                `# Restarting on demand rather than on every save - useful when a
# save mid-edit leaves the code uncompilable.
spring.devtools.restart.trigger-file=.reloadtrigger
# then: touch .reloadtrigger

# Exclude paths that should not cause a restart:
spring.devtools.restart.exclude=static/**,public/**,templates/**

# Turn it off entirely for one run:
spring.devtools.restart.enabled=false

# LiveReload is also included - a browser extension refreshes the page
# when a resource changes:
spring.devtools.livereload.enabled=true`
            ]
        },
        {
            content: `<h3>Configuration Metadata</h3>
The annotation processor that makes your own properties behave like Spring's in the IDE.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>

// With a @ConfigurationProperties class:
@ConfigurationProperties(prefix = "shop")
public record ShopProperties(
    /** How long to wait for the payment provider. */
    Duration timeout,
    /** Orders processed per batch. Must be at least 1. */
    int batchSize) { }

// The processor writes META-INF/spring-configuration-metadata.json at
// COMPILE time. The IDE then offers:
//
//   shop.timeout      autocomplete in application.properties
//   shop.batch-size   with the Javadoc as the description
//   shop.btach-size   flagged as an unknown property
//
// That last line is the real value. Without metadata a misspelt
// property binds to nothing and reports nothing - the application
// starts and quietly uses the default. This is the cheapest defence
// against that whole class of bug.
//
// Note the naming: batchSize in Java is batch-size in properties.
// Relaxed binding accepts batchSize, batch_size and BATCH_SIZE too,
// but kebab-case is the documented convention.`
            ]
        },
        {
            content: `<h3>Runners and Graceful Shutdown</h3>
The two ends of the application's life.<br>`,
            codeExamples: [
                `// A runner executes once, AFTER the context is built and the server
// is accepting requests. This is where startup work belongs - not in
// @PostConstruct, where a failure prevents the application starting.

@Component
public class DataSeeder implements ApplicationRunner {

    private final OrderRepository orders;
    public DataSeeder(OrderRepository orders) { this.orders = orders; }

    @Override
    public void run(ApplicationArguments args) {
        if (args.containsOption("seed")) {          // --seed
            orders.saveAll(sampleOrders());
        }
    }
}

// ApplicationRunner gives parsed arguments (options and values);
// CommandLineRunner gives the raw String[]. Prefer ApplicationRunner.
//
// Order several with @Order(1), @Order(2)...
//
// A runner that throws STOPS the application - which is right for a
// required migration and wrong for an optional cache warm-up. Catch
// what should not be fatal.`,
                `# Graceful shutdown - not on by default, and worth turning on.
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

# On SIGTERM the sequence becomes:
#   1. stop accepting new connections
#   2. let in-flight requests finish, up to the timeout
#   3. run @PreDestroy / close the context
#   4. exit
#
# Without it, step 1 and 2 do not happen: the context closes while
# requests are still running, and a connection pool is torn down under
# active threads.

# In Kubernetes, keep this BELOW terminationGracePeriodSeconds
# (default 30) or the pod is SIGKILLed mid-shutdown:
#
#   spring.lifecycle.timeout-per-shutdown-phase=20s
#   terminationGracePeriodSeconds: 30
#
# And pair it with a readiness probe on
#   /actuator/health/readiness
# so traffic stops arriving before the shutdown begins.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Building Images Without a Dockerfile</h3>
Boot builds an OCI image directly from Maven or Gradle using Cloud Native Buildpacks.<br>`,
            codeExamples: [
                `# One command. No Dockerfile.
mvn spring-boot:build-image -Dspring-boot.build-image.imageName=shop:1.0

# It selects a JDK, applies memory settings from the container limits,
# and produces a layered image.

# What it does that a naive Dockerfile does not: LAYERED JARS.
#
# A fat jar is one big file, so changing one class invalidates the
# whole layer. Boot splits the jar into layers ordered by how often
# they change:
#
#   dependencies            changes rarely      <- cached
#   spring-boot-loader      almost never        <- cached
#   snapshot-dependencies   sometimes
#   application             every build         <- only this is re-pushed
#
# A code-only change then pushes a few hundred KB instead of 50MB.`,
                `# The same layering by hand, when you need your own base image
# (a corporate base, or a distroless one):

FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /app
COPY target/shop.jar shop.jar
RUN java -Djarmode=layertools -jar shop.jar extract

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]

# The COPY order matters - least-changing first, so Docker's layer
# cache survives a code change.
#
# Note the launcher class moved in Boot 3.2:
#   Boot 3.2+  org.springframework.boot.loader.launch.JarLauncher
#   earlier    org.springframework.boot.loader.JarLauncher`
            ]
        },
        {
            content: `<h3>Test Support Is a Feature, Not an Afterthought</h3>
<code>spring-boot-starter-test</code> pulls JUnit 5, Mockito, AssertJ, Hamcrest, JSONassert and JsonPath, and Boot adds slice annotations on top.<br><br>

<table>
<tr><th>Annotation</th><th>Loads</th><th>Typical cost</th></tr>
<tr><td><code>@SpringBootTest</code></td><td>The whole context</td><td>Seconds</td></tr>
<tr><td><code>@WebMvcTest</code></td><td>Controllers + MVC only</td><td>Fast</td></tr>
<tr><td><code>@DataJpaTest</code></td><td>Entities + repositories, with a rolled-back transaction per test</td><td>Fast</td></tr>
<tr><td><code>@JsonTest</code></td><td>Jackson configuration only</td><td>Very fast</td></tr>
<tr><td><code>@RestClientTest</code></td><td>A client plus <code>MockRestServiceServer</code></td><td>Very fast</td></tr>
<tr><td>None</td><td>Nothing - plain JUnit</td><td>Milliseconds</td></tr>
</table>
<br>
The last row is the one people forget. A service class with constructor injection needs no Spring at all to test - <code>new OrderService(fake)</code> is a complete unit test, and it runs a thousand times faster than the fastest slice.<br>`,
            codeExamples: [
                `// A slice test - the controller is real, everything below it is not.
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired  private MockMvc mvc;
    @MockitoBean private OrderService orders;      // Boot 3.4+ name

    @Test
    void returnsOrder() throws Exception {
        given(orders.require(1L)).willReturn(new Order("A-1"));

        mvc.perform(get("/api/orders/1"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.reference").value("A-1"));
    }
}

// @MockBean was DEPRECATED in Boot 3.4 in favour of @MockitoBean.
// Same behaviour, new name - and note that every distinct set of mocks
// creates a separate cached context, so scattering them across test
// classes costs a full startup each time.`,
                `// Testcontainers support, for tests that need the real database.
// Boot 3.1 added @ServiceConnection, which removes the usual block of
// property plumbing.

@SpringBootTest
@Testcontainers
class OrderRepositoryIT {

    @Container
    @ServiceConnection                      // <-- wires the DataSource
    static PostgreSQLContainer<?> db =
        new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired OrderRepository orders;

    @Test
    void savesAndReads() { ... }
}

// Before @ServiceConnection this needed:
//   @DynamicPropertySource
//   static void props(DynamicPropertyRegistry r) {
//       r.add("spring.datasource.url", db::getJdbcUrl);
//       r.add("spring.datasource.username", db::getUsername);
//       r.add("spring.datasource.password", db::getPassword);
//   }
//
// Declare the container 'static' so one is shared by every test in the
// class rather than started per test method.`
            ]
        },
        {
            content: `<h3>Smaller Features Worth Knowing</h3>`,
            codeExamples: [
                `// FAIL-FAST ON CONFIGURATION. Validate at startup, not on first use.
@Validated
@ConfigurationProperties(prefix = "shop")
public record ShopProperties(@NotNull Duration timeout,
                             @Min(1) int batchSize,
                             @NotBlank String apiKey) { }

// OUTPUT with shop.batch-size=0:
//
// ***************************
// APPLICATION FAILED TO START
// ***************************
// Binding to target ShopProperties failed:
//     Property: shop.batchSize
//     Value: 0
//     Reason: must be greater than or equal to 1
//
// The property name, the bad value and the rule - all before a single
// request is served.`,
                `# THE FAILURE ANALYZER. Boot translates common startup exceptions
# into an explanation and an action, instead of a stack trace.

***************************
APPLICATION FAILED TO START
***************************

Description:
Web server failed to start. Port 8080 was already in use.

Action:
Identify and stop the process that's listening on port 8080 or
configure this application to listen on another port.

# There are analyzers for port conflicts, missing DataSource URLs,
# bean cycles, duplicate bean names and more. When you see this shape
# of message, the Action line is usually correct - read it before
# reading the stack trace.

# You can add your own for a domain-specific failure:
#   implement AbstractFailureAnalyzer<YourException>
#   register it in META-INF/spring.factories under
#     org.springframework.boot.diagnostics.FailureAnalyzer`,
                `// THE BANNER, and why it is worth configuring rather than deleting.
// src/main/resources/banner.txt

  ____  _
 / ___|| |__   ___  _ __
 \\___ \\| '_ \\ / _ \\| '_ \\
  ___) | | | | (_) | |_) |
 |____/|_| |_|\\___/| .__/    v\${application.version}
                   |_|       \${spring.boot.formatted-version}

// Placeholders available: \${application.version},
// \${application.formatted-version}, \${spring.boot.version},
// \${spring.profiles.active}.
//
// Printing the version and active profile at startup is genuinely
// useful in a log aggregator - it marks every restart with what is
// running. Switch it off with:
//     spring.main.banner-mode=off`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does DevTools do and how is it fast?</td><td>Restarts the context when classes change, using two classloaders - only the throwaway loader holding your classes is discarded. It also disables template and resource caching.</td></tr>
<tr><td>Is DevTools a production risk?</td><td>No - it disables itself when running from a packaged jar, and <code>&lt;optional&gt;true&lt;/optional&gt;</code> keeps it out of dependent artifacts.</td></tr>
<tr><td>What is the configuration processor for?</td><td>It generates property metadata at compile time so the IDE autocompletes your own properties and flags misspelt ones - which otherwise bind silently to nothing.</td></tr>
<tr><td><code>ApplicationRunner</code> vs <code>CommandLineRunner</code>?</td><td>Both run once after startup; <code>ApplicationRunner</code> receives parsed <code>ApplicationArguments</code> rather than a raw <code>String[]</code>.</td></tr>
<tr><td>Why put startup work in a runner rather than <code>@PostConstruct</code>?</td><td><code>@PostConstruct</code> runs during bean creation, so a failure prevents the application starting. A runner executes after the server is up.</td></tr>
<tr><td>What does graceful shutdown do?</td><td>With <code>server.shutdown=graceful</code>, the server stops accepting connections and lets in-flight requests finish before the context closes. Keep the timeout below Kubernetes' grace period.</td></tr>
<tr><td>How do you build a container image?</td><td><code>mvn spring-boot:build-image</code> using buildpacks, or extract a layered jar with <code>-Djarmode=layertools</code> in a multi-stage Dockerfile.</td></tr>
<tr><td>Why do layered jars matter?</td><td>Dependencies and application code become separate image layers, so a code change re-pushes kilobytes instead of the whole fat jar.</td></tr>
<tr><td>What replaced <code>@MockBean</code>?</td><td><code>@MockitoBean</code>, from Boot 3.4. Each distinct mock configuration still creates a separate cached test context.</td></tr>
<tr><td>What is <code>@ServiceConnection</code>?</td><td>Boot 3.1+ - wires a Testcontainers container straight into the matching Spring configuration, replacing manual <code>@DynamicPropertySource</code> plumbing.</td></tr>
<tr><td>What is a failure analyzer?</td><td>A component that turns a known startup exception into a Description and an Action. You can add your own via <code>AbstractFailureAnalyzer</code>.</td></tr>
</table>`
        }
    ]
};
