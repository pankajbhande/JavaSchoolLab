// Spring extras, batch sboot03 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const sboot03Extras: Record<string, Extra> = {
    'sb-applicationcontext': x(
        ['<b>ApplicationContext</b> is the Spring container: it creates, wires and manages beans, and also publishes events, resolves messages and exposes the <code>Environment</code>.',
            '<b>Getting beans</b>: inject them with constructor injection; call <code>context.getBean(Type.class)</code> only in tests or main methods.',
            '<b>Spring Boot</b> creates the context for you in <code>SpringApplication.run(...)</code> and returns it as a <code>ConfigurableApplicationContext</code>.'],
        ['<b>BeanFactory vs ApplicationContext</b>: BeanFactory is the basic factory; ApplicationContext adds events, i18n, resource loading and eager singleton creation.',
            '<b>Context types</b>: Boot picks <code>AnnotationConfigServletWebServerApplicationContext</code> for servlet web apps and a reactive one for WebFlux.',
            '<b>Events</b>: publish with <code>ApplicationEventPublisher</code> and listen with <code>@EventListener</code>; Boot also fires <code>ApplicationReadyEvent</code>.'],
        ['<b>Refresh lifecycle</b>: <code>refresh()</code> loads bean definitions, runs <code>BeanFactoryPostProcessor</code>s, registers <code>BeanPostProcessor</code>s, creates singletons and finally starts the web server.',
            '<b>Hierarchy</b>: a child context sees beans of its parent but not the reverse; this is how the actuator management context can be separate.',
            '<b>Closing</b>: a shutdown hook calls <code>close()</code>, which runs <code>@PreDestroy</code> and <code>DisposableBean</code> callbacks.'],
        [['F', 'What is the ApplicationContext?', 'It is the Spring IoC container that creates and wires beans and offers extra services such as events and the Environment.'],
            ['F', 'How do you get a bean from it?', 'Prefer injection; otherwise use context.getBean(MyBean.class).'],
            ['M', 'ApplicationContext versus BeanFactory?', 'ApplicationContext extends BeanFactory with events, messages, resource loading and eager singleton initialisation.'],
            ['M', 'How do you react when the application has started?', 'Listen for ApplicationReadyEvent or implement ApplicationRunner or CommandLineRunner.'],
            ['S', 'What happens during refresh()?', 'Bean definitions are loaded, post processors run, singletons are instantiated and then lifecycle beans and the web server start.'],
            ['S', 'Why can a bean in a child context not be seen by the parent?', 'Lookup goes upward only: a child asks its parent, but a parent never knows its children.']],
        [['Start Boot and ask the context.',
            r`@SpringBootApplication
public class DemoApp {
    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(DemoApp.class, args);
        System.out.println(ctx.getClass().getSimpleName());
        System.out.println(ctx.containsBean("demoApp"));
        System.out.println(ctx.getBean(Environment.class).getProperty("java.version") != null);
    }
}

// OUTPUT:
// AnnotationConfigServletWebServerApplicationContext
// true
// true`],
            ['Publish and listen to a custom event.',
                r`record OrderPlaced(long id) {}

@Component
class Audit {
    @EventListener
    void on(OrderPlaced e) { System.out.println("audit order " + e.id()); }
}

@Service
class OrderService {
    private final ApplicationEventPublisher publisher;
    OrderService(ApplicationEventPublisher p) { this.publisher = p; }
    void place() { publisher.publishEvent(new OrderPlaced(7)); }
}

// OUTPUT:
// audit order 7`]],
        [['Count beans by stereotype.',
            r`ConfigurableApplicationContext ctx = SpringApplication.run(DemoApp.class);
String[] names = ctx.getBeanNamesForAnnotation(Service.class);
System.out.println(names.length + " services: " + Arrays.toString(names));

// OUTPUT: (varies)
// 1 services: [orderService]`],
            ['Test with a context slice.',
                r`@SpringBootTest
class ContextTest {
    @Autowired ApplicationContext ctx;

    @Test
    void contextHasService() {
        assertThat(ctx.getBean(OrderService.class)).isNotNull();
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]]
    ),

    'sb-environment-and-profiles': x(
        ['<b>Environment</b> is the abstraction that holds properties from many sources (files, system properties, OS variables, command line) plus the active profiles.',
            '<b>Profiles</b> label groups of beans or config such as <code>dev</code> and <code>prod</code>; activate them with <code>spring.profiles.active</code>.',
            '<b>Profile files</b>: <code>application-dev.properties</code> overrides values from <code>application.properties</code> when dev is active.'],
        ['<b>@Profile</b> on a <code>@Component</code> or <code>@Bean</code> registers it only when the profile is active; <code>@Profile("!prod")</code> negates.',
            '<b>Precedence</b>: command line arguments beat OS environment variables, which beat profile files, which beat the default file.',
            '<b>Relaxed binding</b>: the variable <code>APP_NAME</code> maps to the property <code>app.name</code>.'],
        ['<b>Profile groups</b> (<code>spring.profiles.group.prod=db,mq</code>) activate several profiles with one name.',
            '<b>Secrets</b> belong in environment variables or a vault, not in files committed to git.',
            '<b>Testing</b>: use <code>@ActiveProfiles("test")</code> and <code>@TestPropertySource</code> to control the Environment in tests.'],
        [['F', 'What is a Spring profile?', 'A named group of beans and configuration that is active only for certain environments such as dev or prod.'],
            ['F', 'How do you activate a profile?', 'Set spring.profiles.active in a property file, an environment variable or the command line.'],
            ['M', 'Which wins: a command line argument or application.properties?', 'The command line argument, because it has higher precedence.'],
            ['M', 'How do you register a bean only in production?', 'Annotate it with @Profile("prod").'],
            ['S', 'How do you read a property in code?', 'Inject Environment and call getProperty, or bind with @ConfigurationProperties.'],
            ['S', 'What is a profile group used for?', 'It lets one profile name activate a set of other profiles, keeping deployment settings short.']],
        [['Profile specific bean.',
            r`interface Mailer { void send(String to); }

@Component @Profile("dev")
class ConsoleMailer implements Mailer {
    public void send(String to) { System.out.println("console mail to " + to); }
}

@Component @Profile("prod")
class SmtpMailer implements Mailer {
    public void send(String to) { System.out.println("smtp mail to " + to); }
}

// run with: --spring.profiles.active=dev
// OUTPUT:
// console mail to ann@x.com`],
            ['Read the Environment.',
                r`@Component
class Show implements CommandLineRunner {
    private final Environment env;
    Show(Environment env) { this.env = env; }
    public void run(String... args) {
        System.out.println(Arrays.toString(env.getActiveProfiles()));
        System.out.println(env.getProperty("server.port", "8080"));
    }
}

// OUTPUT: (with profile dev and server.port=9090)
// [dev]
// 9090`]],
        [['Properties per profile.',
            r`# application.properties
server.port=8080
spring.profiles.active=dev

# application-dev.properties
server.port=9090
logging.level.root=DEBUG

# OUTPUT:
# Tomcat started on port 9090 (http)`],
            ['Test with a profile.',
                r`@SpringBootTest
@ActiveProfiles("dev")
class MailerTest {
    @Autowired Mailer mailer;

    @Test
    void usesConsole() {
        assertThat(mailer).isInstanceOf(ConsoleMailer.class);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]]
    ),

    'sb-spring-expression-language-spel': x(
        ['<b>SpEL</b> is a small expression language evaluated at runtime; in annotations it is written inside <code>#{ ... }</code>.',
            '<b>Uses</b>: <code>@Value("#{2 * 3}")</code>, bean references such as <code>#{orderService.count}</code>, and security rules in <code>@PreAuthorize</code>.',
            '<b>Operators</b> include arithmetic, comparison, ternary, Elvis (<code>?:</code>) and safe navigation (<code>?.</code>).'],
        ['<b>Parser API</b>: <code>new SpelExpressionParser().parseExpression("1 + 2").getValue()</code> evaluates a string.',
            '<b>Context</b>: <code>StandardEvaluationContext</code> holds a root object and variables referenced as <code>#name</code>.',
            '<b>Collections</b>: select with <code>.?[age &gt; 18]</code> and project with <code>.![name]</code>.'],
        ['<b>Safety</b>: never evaluate user supplied strings with a full context, because SpEL can call methods and construct objects; use <code>SimpleEvaluationContext</code>.',
            '<b>Performance</b>: a <code>SpelCompilerMode</code> can compile hot expressions to bytecode.',
            '<b>Placeholders vs SpEL</b>: a dollar-brace placeholder reads a property, <code>#{}</code> evaluates an expression; they can be combined.'],
        [['F', 'What is SpEL?', 'The Spring Expression Language, used to query and compute values at runtime.'],
            ['F', 'What is the syntax in @Value?', 'Put the expression between #{ and }, for example #{10 * 2}.'],
            ['M', 'What does the Elvis operator do?', 'It returns the left value unless it is null or empty, then the right value.'],
            ['M', 'How do you filter a list in SpEL?', 'Use selection: list.?[condition], and projection list.![property] to map.'],
            ['S', 'Why is SpEL injection dangerous?', 'A user controlled expression can invoke arbitrary methods; use SimpleEvaluationContext and never evaluate untrusted input with the standard context.'],
            ['S', 'How is SpEL used by Spring Security?', 'Method security annotations such as @PreAuthorize hold SpEL that sees authentication and method arguments.']],
        [['Evaluate expressions.',
            r`ExpressionParser parser = new SpelExpressionParser();
System.out.println(parser.parseExpression("2 + 3 * 4").getValue());
System.out.println(parser.parseExpression("'Boot'.toUpperCase()").getValue());
System.out.println(parser.parseExpression("5 > 3 ? 'yes' : 'no'").getValue());

// OUTPUT:
// 14
// BOOT
// yes`],
            ['Root object and variables.',
                r`record Person(String name, int age) {}
ExpressionParser parser = new SpelExpressionParser();
StandardEvaluationContext ctx = new StandardEvaluationContext(new Person("Ann", 30));
ctx.setVariable("limit", 18);
Boolean adult = parser.parseExpression("age >= #limit").getValue(ctx, Boolean.class);
String name = parser.parseExpression("name").getValue(ctx, String.class);
System.out.println(name + " adult=" + adult);

// OUTPUT:
// Ann adult=true`]],
        [['SpEL in @Value.',
            r`@Component
class Calc {
    @Value("#{20 * 5}")
    int hundred;

    @Value("#{systemProperties['user.language'] ?: 'en'}")
    String lang;
}

// OUTPUT: (varies)
// hundred=100 lang=en`],
            ['Selection and projection.',
                r`List<Person> people = List.of(new Person("Ann", 30), new Person("Baji", 12));
StandardEvaluationContext ctx = new StandardEvaluationContext();
ctx.setVariable("people", people);
Object names = new SpelExpressionParser()
    .parseExpression("#people.?[age > 18].![name]").getValue(ctx);
System.out.println(names);

// OUTPUT:
// [Ann]`]]
    ),

    'introductiontospringboot': x(
        ['<b>Spring Boot</b> is an opinionated layer on Spring that gives you auto-configuration, starters, an embedded server and production tools so an app runs with almost no setup.',
            '<b>Entry point</b>: a class annotated <code>@SpringBootApplication</code> with a <code>main</code> method calling <code>SpringApplication.run</code>.',
            '<b>Result</b>: a runnable jar (<code>java -jar app.jar</code>) with no external application server.'],
        ['<b>@SpringBootApplication</b> combines <code>@Configuration</code>, <code>@EnableAutoConfiguration</code> and <code>@ComponentScan</code>.',
            '<b>Configuration</b> lives in <code>application.properties</code> or <code>application.yml</code>; defaults are sensible and overridable.',
            '<b>Actuator</b> adds health, metrics and info endpoints for operations.'],
        ['<b>Convention over configuration</b>: Boot configures what it finds on the classpath, and backs off when you define your own bean.',
            '<b>Package layout</b>: keep the main class in the root package so component scanning covers all sub packages.',
            '<b>Not a framework replacement</b>: Boot does not add new core features; it wires Spring and third party libraries for you.'],
        [['F', 'What is Spring Boot?', 'A tool on top of Spring that auto-configures the application and lets you run it with an embedded server.'],
            ['F', 'What does @SpringBootApplication do?', 'It enables configuration, auto-configuration and component scanning in one annotation.'],
            ['M', 'How do you run a Boot app?', 'Run the main method, use mvn spring-boot:run, or java -jar on the built jar.'],
            ['M', 'Where do you put settings?', 'In application.properties or application.yml on the classpath.'],
            ['S', 'How does Boot know what to configure?', 'Auto-configuration classes listed in the imports file activate through conditions such as @ConditionalOnClass.'],
            ['S', 'How do you replace a default bean?', 'Declare your own bean of that type; most auto-configured beans use @ConditionalOnMissingBean.']],
        [['The smallest web app.',
            r`@SpringBootApplication
@RestController
public class HelloApp {
    @GetMapping("/hello")
    String hello() { return "Hello Boot"; }

    public static void main(String[] args) {
        SpringApplication.run(HelloApp.class, args);
    }
}

// OUTPUT: (GET /hello)
// Hello Boot`],
            ['Run on another port.',
                r`# application.properties
server.port=9090
spring.application.name=hello

# console on start:
# OUTPUT:
# Tomcat started on port 9090 (http) with context path ''
# Started HelloApp in 1.8 seconds (varies)`]],
        [['Test the endpoint with MockMvc.',
            r`@WebMvcTest(HelloApp.class)
class HelloTest {
    @Autowired MockMvc mvc;

    @Test
    void hello() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(content().string("Hello Boot"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Command line runner at startup.',
                r`@Bean
CommandLineRunner started() {
    return args -> System.out.println("args=" + args.length);
}

// OUTPUT:
// args=0`]]
    ),

    'sb-spring-vs-spring-boot': x(
        ['<b>Spring</b> is the core framework (IoC, AOP, MVC, data access); <b>Spring Boot</b> is a way to set it up quickly with defaults.',
            '<b>Spring needs</b> you to choose and configure versions, a view resolver, a data source and a deployment server yourself.',
            '<b>Boot gives</b> starters, auto-configuration, an embedded server and a single runnable jar.'],
        ['<b>Dependencies</b>: with plain Spring you pick matching versions; Boot starters and the BOM align them for you.',
            '<b>Deployment</b>: classic Spring MVC builds a WAR for an external Tomcat; Boot builds a jar with Tomcat inside.',
            '<b>Configuration style</b>: XML or Java config in Spring, convention plus properties in Boot.'],
        ['<b>Boot is Spring</b>: every Boot app uses the same container, annotations and APIs; you can still write manual configuration.',
            '<b>Opt out</b>: use <code>exclude</code> on <code>@SpringBootApplication</code> to disable an auto-configuration.',
            '<b>Trade-off</b>: Boot hides detail, so debug with <code>--debug</code> or the conditions report to see what it configured.'],
        [['F', 'Is Spring Boot a replacement for Spring?', 'No. It builds on Spring and removes setup work.'],
            ['F', 'Name two things Boot adds.', 'Starters and auto-configuration; also an embedded server and Actuator.'],
            ['M', 'How does deployment differ?', 'Spring apps are often WAR files on an external server; Boot normally produces an executable jar with embedded Tomcat.'],
            ['M', 'What does the BOM do?', 'The spring-boot-dependencies BOM sets tested versions so you omit them in your build.'],
            ['S', 'How do you see what Boot configured?', 'Run with --debug to print the condition evaluation report, or use the Actuator conditions endpoint.'],
            ['S', 'When might you avoid Boot?', 'When you need full control over a unusual container or a very minimal footprint; even then you can mix manual configuration.']],
        [['Plain Spring MVC configuration.',
            r`@Configuration
@EnableWebMvc
@ComponentScan("com.demo")
public class WebConfig implements WebMvcConfigurer {
    @Bean
    ViewResolver viewResolver() {
        InternalResourceViewResolver v = new InternalResourceViewResolver();
        v.setPrefix("/WEB-INF/views/");
        v.setSuffix(".jsp");
        return v;
    }
}
// plus a WebApplicationInitializer and a WAR deployed to Tomcat

// OUTPUT:
// the app only runs when the external server loads it`],
            ['The Boot equivalent.',
                r`@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
// spring-boot-starter-web on the classpath does the rest

// OUTPUT:
// Tomcat started on port 8080 (http)`]],
        [['Override an auto-configured bean.',
            r`@Configuration
class JsonConfig {
    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapper().disable(SerializationFeature.INDENT_OUTPUT);
    }
}

// OUTPUT:
// Boot backs off its own ObjectMapper and uses this one`],
            ['Exclude an auto-configuration.',
                r`@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
public class NoDbApp { }

// OUTPUT:
// no DataSource is created even if a JDBC driver is present`]]
    ),

    'spring-boot-features-architecture': x(
        ['<b>Architecture</b> of a Boot app: the main class bootstraps a context, auto-configuration adds beans, and the embedded server hands requests to Spring.',
            '<b>Typical layers</b>: controller, service, repository, with entities or DTOs passing between them.',
            '<b>Key features</b>: starters, auto-configuration, externalised config, Actuator, embedded servers, DevTools.'],
        ['<b>Startup steps</b>: <code>SpringApplication</code> prepares the Environment, creates the context, refreshes it and runs the runners.',
            '<b>Layer rules</b>: controllers talk to services, services to repositories; do not skip layers or put business logic in controllers.',
            '<b>Packaging</b>: the Boot jar plugin builds a nested jar that the <code>JarLauncher</code> starts.'],
        ['<b>Auto-configuration</b> classes are listed in <code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code> and filtered by conditions.',
            '<b>Extension points</b>: <code>ApplicationRunner</code>, <code>ApplicationListener</code>, <code>EnvironmentPostProcessor</code> and your own starters.',
            '<b>Production</b>: expose health probes, metrics and graceful shutdown (<code>server.shutdown=graceful</code>).'],
        [['F', 'Name the layers of a Boot app.', 'Controller, service and repository, with a database underneath.'],
            ['F', 'What is the embedded server?', 'Tomcat (default), Jetty or Undertow packaged inside the app so no external server is needed.'],
            ['M', 'What does SpringApplication.run do?', 'It builds the Environment, creates and refreshes the ApplicationContext, starts the web server and calls runners.'],
            ['M', 'What is Actuator for?', 'It exposes operational endpoints such as health, metrics and info.'],
            ['S', 'How do auto-configurations load?', 'Their class names are read from the imports file, then each is applied only if its conditions match.'],
            ['S', 'How would you build a custom starter?', 'Create an auto-configuration with conditional beans and a properties class, register it in the imports file, and publish a starter pom that depends on it.']],
        [['Layered example.',
            r`@RestController
@RequestMapping("/books")
class BookController {
    private final BookService service;
    BookController(BookService s) { this.service = s; }
    @GetMapping("/{id}") Book get(@PathVariable long id) { return service.find(id); }
}

@Service
class BookService {
    private final BookRepository repo;
    BookService(BookRepository r) { this.repo = r; }
    Book find(long id) { return repo.findById(id).orElseThrow(); }
}

// OUTPUT: (GET /books/1)
// {"id":1,"title":"Spring in Action"}`],
            ['Hook into startup.',
                r`@Component
class Ready implements ApplicationRunner {
    public void run(ApplicationArguments args) {
        System.out.println("ready, profiles=" + args.getOptionNames());
    }
}

// OUTPUT: (varies)
// ready, profiles=[]`]],
        [['Graceful shutdown settings.',
            r`# application.properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s
management.endpoints.web.exposure.include=health,info

# OUTPUT:
# on SIGTERM: Commencing graceful shutdown. Waiting for active requests to complete`],
            ['Slice test of the web layer.',
                r`@WebMvcTest(BookController.class)
class BookControllerTest {
    @Autowired MockMvc mvc;
    @MockBean BookService service;

    @Test
    void found() throws Exception {
        given(service.find(1)).willReturn(new Book(1, "Spring in Action"));
        mvc.perform(get("/books/1"))
           .andExpect(jsonPath("$.title").value("Spring in Action"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]]
    ),

    'sb-spring-boot-features': x(
        ['<b>Main features</b>: auto-configuration, starters, embedded server, externalised configuration, Actuator and DevTools.',
            '<b>Auto-configuration</b> creates beans based on what is on the classpath and in the properties.',
            '<b>Externalised config</b>: the same jar runs in any environment by changing properties, not code.'],
        ['<b>DevTools</b> restarts the app when classes change and enables live reload; it is disabled in a packaged production jar.',
            '<b>Actuator</b> endpoints include <code>/actuator/health</code>, <code>/actuator/metrics</code> and <code>/actuator/info</code>.',
            '<b>Logging</b> defaults to Logback; levels are set by <code>logging.level.*</code> properties.'],
        ['<b>Type safe config</b>: bind groups of properties to a class with <code>@ConfigurationProperties</code> and validate them.',
            '<b>Build info</b>: the build plugin can write <code>build-info</code> so Actuator shows the version.',
            '<b>Container images</b>: <code>spring-boot:build-image</code> creates an OCI image without a Dockerfile.'],
        [['F', 'List three Boot features.', 'Starters, auto-configuration and an embedded server; also Actuator.'],
            ['F', 'What is DevTools?', 'A development aid that restarts the app automatically when code changes.'],
            ['M', 'How do you change the log level?', 'Set logging.level.com.demo=DEBUG in the properties.'],
            ['M', 'What is @ConfigurationProperties?', 'It binds properties with a prefix to a typed class.'],
            ['S', 'How do you secure Actuator?', 'Expose only needed endpoints and protect them with Spring Security.'],
            ['S', 'How do you build a container image from Boot?', 'Run mvn spring-boot:build-image or the Gradle bootBuildImage task.']],
        [['Type safe properties.',
            r`@ConfigurationProperties(prefix = "app")
public record AppProps(String name, int retries) { }

@SpringBootApplication
@EnableConfigurationProperties(AppProps.class)
class App { }

# app.name=shop  app.retries=3
// OUTPUT:
// AppProps[name=shop, retries=3]`],
            ['Custom health indicator.',
                r`@Component
class DiskHealth implements HealthIndicator {
    public Health health() {
        long free = new File("/").getFreeSpace();
        return free > 1_000_000_000L ? Health.up().build()
                                     : Health.down().withDetail("free", free).build();
    }
}

// OUTPUT: (GET /actuator/health)
// {"status":"UP"}`]],
        [['Enable endpoints.',
            r`# application.properties
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=when-authorized

# OUTPUT:
# Exposing 3 endpoint(s) beneath base path '/actuator'`],
            ['Test the properties binding.',
                r`@SpringBootTest(properties = {"app.name=shop", "app.retries=3"})
class PropsTest {
    @Autowired AppProps props;

    @Test
    void binds() { assertThat(props.retries()).isEqualTo(3); }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]]
    ),

    'sb-spring-initializr': x(
        ['<b>Spring Initializr</b> is a web service (start.spring.io) that generates a project skeleton with your build tool, Java version and dependencies.',
            '<b>Choose</b>: Maven or Gradle, language, Boot version, group and artifact, packaging and starters.',
            '<b>Result</b>: a zip with the build file, the main class, <code>application.properties</code> and a test.'],
        ['<b>IDE support</b>: IntelliJ and VS Code can call the same service, and you can also use <code>curl</code> to download a project.',
            '<b>Dependencies</b> you tick become starters in the build file, for example Web, Data JPA, Validation.',
            '<b>Packaging</b>: pick jar for embedded Tomcat and war only when deploying to an external server.'],
        ['<b>Generated structure</b>: the main class sits in the root package, so scanning covers sub packages.',
            '<b>Wrapper</b>: the project contains <code>mvnw</code> or <code>gradlew</code> so builds do not need a local install.',
            '<b>Own Initializr</b>: companies can host the open source initializr to add their standard dependencies.'],
        [['F', 'What is Spring Initializr?', 'A tool at start.spring.io that generates a ready Spring Boot project.'],
            ['F', 'What do you get in the zip?', 'A pom.xml or build.gradle, the main application class, application.properties and a basic test.'],
            ['M', 'Jar or war?', 'Choose jar unless you must deploy to an external servlet container.'],
            ['M', 'What is the Maven wrapper?', 'A script (mvnw) that downloads the right Maven version so every developer builds the same way.'],
            ['S', 'How do you generate a project from the command line?', 'Call the start.spring.io endpoint with curl and parameters such as dependencies and type, then unzip.'],
            ['S', 'Why keep the main class in the root package?', 'Because component scanning starts from its package; classes outside are not found.']],
        [['Generate with curl.',
            r`curl https://start.spring.io/starter.zip \
  -d type=maven-project -d language=java \
  -d groupId=com.demo -d artifactId=shop \
  -d dependencies=web,validation -o shop.zip
unzip shop.zip -d shop

# OUTPUT:
# Archive:  shop.zip
#   inflating: shop/pom.xml
#   inflating: shop/src/main/java/com/demo/shop/ShopApplication.java`],
            ['Generated main class and test.',
                r`@SpringBootApplication
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}

@SpringBootTest
class ShopApplicationTests {
    @Test
    void contextLoads() { }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]],
        [['Run the generated project.',
            r`cd shop
./mvnw spring-boot:run

# OUTPUT:
# Started ShopApplication in 1.6 seconds (varies)
# Tomcat started on port 8080 (http)`],
            ['Add a dependency later.',
                r`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<!-- no version needed: the parent pom manages it -->

<!-- OUTPUT: Hibernate and a DataSource are now auto-configured -->`]]
    ),

    'sb-maven-gradle-with-spring-boot': x(
        ['<b>Maven and Gradle</b> are the build tools used with Boot; both have a Boot plugin that packages an executable jar.',
            '<b>Maven</b> uses <code>pom.xml</code>; the project inherits from <code>spring-boot-starter-parent</code> for managed versions.',
            '<b>Gradle</b> uses <code>build.gradle</code> with the <code>org.springframework.boot</code> plugin and the dependency management plugin.'],
        ['<b>Run commands</b>: <code>mvn spring-boot:run</code> or <code>gradle bootRun</code> start the app; <code>mvn package</code> or <code>gradle bootJar</code> build the jar.',
            '<b>Starters</b> are added without versions because the parent or BOM manages them.',
            '<b>Java version</b> is set with <code>java.version</code> (Maven property) or the Gradle toolchain.'],
        ['<b>Without the parent</b>: import the BOM in <code>dependencyManagement</code> when your company has its own parent pom.',
            '<b>Repackaging</b>: the plugin turns the plain jar into a fat jar with a <code>BOOT-INF</code> layout.',
            '<b>Layers</b>: layered jars let Docker cache dependencies separately from your code.'],
        [['F', 'Which build tools does Boot support?', 'Maven and Gradle.'],
            ['F', 'How do you start the app from the build tool?', 'mvn spring-boot:run or gradle bootRun.'],
            ['M', 'What does spring-boot-starter-parent give?', 'Managed dependency versions, plugin configuration and sensible defaults such as UTF-8 and the Java level.'],
            ['M', 'Why can you omit versions of starters?', 'The Boot BOM defines compatible versions.'],
            ['S', 'How do you use Boot dependency management with a different parent?', 'Import spring-boot-dependencies as a BOM in dependencyManagement.'],
            ['S', 'What is in a Boot fat jar?', 'BOOT-INF/classes, BOOT-INF/lib with dependency jars, and the launcher classes.']],
        [['Minimal pom.xml.',
            r`<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
</parent>
<properties><java.version>17</java.version></properties>
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
<build><plugins><plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin></plugins></build>

<!-- OUTPUT: mvn package creates target/app-0.0.1-SNAPSHOT.jar -->`],
            ['Minimal build.gradle.',
                r`plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.0'
    id 'io.spring.dependency-management' version '1.1.5'
}
java {
    toolchain { languageVersion = JavaLanguageVersion.of(17) }
}
repositories { mavenCentral() }
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

// OUTPUT:
// gradle bootJar creates build/libs/app-0.0.1-SNAPSHOT.jar`]],
        [['Run the packaged jar.',
            r`./mvnw clean package
java -jar target/app-0.0.1-SNAPSHOT.jar --server.port=9000

# OUTPUT:
# BUILD SUCCESS
# Tomcat started on port 9000 (http)`],
            ['Inspect the dependency tree.',
                r`./mvnw dependency:tree | grep tomcat
./gradlew dependencies --configuration runtimeClasspath

# OUTPUT: (varies)
# org.springframework.boot:spring-boot-starter-tomcat:jar:3.3.0:compile`]]
    ),

    'sb-starter-dependencies': x(
        ['<b>Starter</b> is a single dependency that pulls in a curated set of libraries for a feature, such as <code>spring-boot-starter-web</code>.',
            '<b>Naming</b>: official starters are named <code>spring-boot-starter-*</code>; third party ones use <code>*-spring-boot-starter</code>.',
            '<b>Effect</b>: adding a starter makes auto-configuration create the matching beans.'],
        ['<b>Common starters</b>: web, data-jpa, validation, security, test, actuator, thymeleaf.',
            '<b>Transitive</b>: the web starter brings Spring MVC, Jackson and Tomcat; use <code>exclude</code> to swap Tomcat for Jetty.',
            '<b>Scope</b>: the test starter belongs in test scope, so it is not packaged.'],
        ['<b>Starter content</b>: a starter has no code, only a pom that lists dependencies; the logic lives in auto-configuration modules.',
            '<b>Custom starter</b>: split into an <code>autoconfigure</code> module and a starter module that depends on it.',
            '<b>Hygiene</b>: unused starters enlarge the jar and trigger needless auto-configuration; remove them.'],
        [['F', 'What is a starter?', 'A dependency descriptor that brings all libraries for a feature in one line.'],
            ['F', 'Which starter creates a REST API?', 'spring-boot-starter-web.'],
            ['M', 'How do you use Jetty instead of Tomcat?', 'Exclude spring-boot-starter-tomcat from the web starter and add spring-boot-starter-jetty.'],
            ['M', 'Why is no version given for a starter?', 'The parent pom or BOM manages the version.'],
            ['S', 'Does a starter contain code?', 'Normally no; it is only a pom, and the beans come from auto-configuration classes.'],
            ['S', 'How can you find out why a bean exists after adding a starter?', 'Use the --debug conditions report to see which auto-configuration matched.']],
        [['Add the web and test starters.',
            r`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- OUTPUT: Spring MVC, Jackson, Tomcat, JUnit 5, Mockito, AssertJ on the classpath -->`],
            ['Swap Tomcat for Jetty.',
                r`<dependency>
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

<!-- OUTPUT: Jetty started on port 8080 (http/1.1) -->`]],
        [['See the effect of a starter.',
            r`@Autowired ApplicationContext ctx;

@Test
void jpaStarterCreatesBeans() {
    assertThat(ctx.containsBean("entityManagerFactory")).isTrue();
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`],
            ['Debug report.',
                r`java -jar app.jar --debug

# OUTPUT: (excerpt)
# Positive matches:
#    DataSourceAutoConfiguration matched:
#       - @ConditionalOnClass found required class DataSource
# Negative matches:
#    MongoAutoConfiguration: did not match`]]
    )
};

export const sboot03Deep: Record<string, Deep> = {
    'sb-applicationcontext': dv(
        [`<p>The context is built in a fixed sequence inside <code>AbstractApplicationContext.refresh()</code>.</p><ul><li><b>Definitions:</b> configuration classes and component scans are turned into <code>BeanDefinition</code>s.</li><li><b>Post processors:</b> <code>BeanFactoryPostProcessor</code>s change definitions, then <code>BeanPostProcessor</code>s are registered.</li><li><b>Singletons:</b> non-lazy singleton beans are created, injected and initialised.</li><li><b>Finish:</b> <code>SmartLifecycle</code> beans and the web server start, and a refreshed event is published.</li></ul>`,
            r`ConfigurableApplicationContext ctx = SpringApplication.run(DemoApp.class);
System.out.println(ctx.getBeanDefinitionCount() > 0);
System.out.println(ctx.getParent());
System.out.println(ctx.isActive());
ctx.close();
System.out.println(ctx.isActive());

// OUTPUT:
// true
// null
// true
// false`],
        [`<p>Ways to create and use a context:</p><ul><li><b>SpringApplication:</b> the Boot way, with banner, listeners and runners.</li><li><b>AnnotationConfigApplicationContext:</b> plain Spring, good for unit style demos.</li><li><b>Aware interfaces:</b> <code>ApplicationContextAware</code> gives a bean the context.</li><li><b>Builder:</b> <code>SpringApplicationBuilder</code> sets parent and child contexts.</li><li><b>Lazy:</b> <code>spring.main.lazy-initialization=true</code> delays bean creation.</li></ul>`,
            r`try (AnnotationConfigApplicationContext ctx =
         new AnnotationConfigApplicationContext(AppConfig.class)) {
    Greeter g = ctx.getBean(Greeter.class);
    System.out.println(g.greet("Ann"));
}

new SpringApplicationBuilder(ParentConfig.class)
    .child(WebConfig.class)
    .run(args);

// OUTPUT:
// Hello Ann`],
        [`<p>Typical mistakes:</p><ul><li><b>getBean everywhere:</b> hides dependencies and is the service locator anti-pattern; inject instead.</li><li><b>Creating a second context</b> in a test or helper, which duplicates all beans.</li><li><b>Calling a bean before refresh finished</b> from a constructor, so dependencies may be missing.</li><li><b>Prototype in singleton:</b> the prototype is created once; use <code>ObjectProvider</code>.</li><li><b>Listener on a wrong thread</b> assumption: events are synchronous by default.</li></ul>`,
            r`@Component
class Report {
    private final ObjectProvider<Row> rows;      // new Row on each call
    Report(ObjectProvider<Row> rows) { this.rows = rows; }
    Row fresh() { return rows.getObject(); }
}

// WRONG: @Autowired Row row;  -> same instance forever
// OUTPUT:
// fresh() returns a different Row each time`],
        [`<p>Startup time grows with the number of beans. Options:</p><ul><li><b>Lazy init:</b> create beans on first use, at the cost of slower first requests and late errors.</li><li><b>Fewer auto-configurations:</b> exclude unused ones.</li><li><b>Narrow scanning:</b> scan only your packages.</li><li><b>AOT and native:</b> Spring Boot 3 can pre-compute definitions at build time.</li><li><b>Measure:</b> <code>ApplicationStartup</code> with a buffering implementation records startup steps.</li></ul>`,
            r`SpringApplication app = new SpringApplication(DemoApp.class);
app.setApplicationStartup(new BufferingApplicationStartup(2048));
app.run(args);
// expose /actuator/startup to see the timeline

# application.properties
spring.main.lazy-initialization=true

// OUTPUT: (varies)
// Started DemoApp in 1.2 seconds`],
        [`<p>A real use of events and the context: decouple modules. After an order is saved, the order module publishes an event and the mail and stock modules react, without the order service knowing them. With <code>@TransactionalEventListener</code> the reaction runs only after the commit succeeds.</p><ul><li>Keeps modules independent.</li><li>Use <code>@Async</code> for slow listeners.</li><li>Test listeners with <code>ApplicationEvents</code> in Spring Boot tests.</li></ul>`,
            r`@Component
class StockListener {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void on(OrderPlaced e) { System.out.println("reserve stock for " + e.id()); }
}

@SpringBootTest
@RecordApplicationEvents
class EventTest {
    @Autowired OrderService service;
    @Autowired ApplicationEvents events;
    @Test void published() {
        service.place();
        assertThat(events.stream(OrderPlaced.class)).hasSize(1);
    }
}

// OUTPUT:
// reserve stock for 7`]
    ),

    'sb-environment-and-profiles': dv(
        [`<p>The <code>Environment</code> holds an ordered list of <code>PropertySource</code>s; the first source that has a key wins.</p><ul><li><b>Order (high to low):</b> command line, <code>SPRING_APPLICATION_JSON</code>, system properties, OS variables, profile files, default files, defaults.</li><li><b>Loading:</b> <code>ConfigDataEnvironmentPostProcessor</code> reads the application files and imports.</li><li><b>Profiles:</b> the active set is resolved before profile files are loaded.</li></ul>`,
            r`ConfigurableEnvironment env = ctx.getEnvironment();
for (PropertySource<?> ps : env.getPropertySources()) {
    System.out.println(ps.getName());
}

// OUTPUT: (excerpt, varies)
// commandLineArgs
// systemProperties
// systemEnvironment
// Config resource 'class path resource [application-dev.properties]'
// Config resource 'class path resource [application.properties]'`],
        [`<p>Ways to select and structure profiles:</p><ul><li><b>Property:</b> <code>spring.profiles.active=dev</code> or the variable <code>SPRING_PROFILES_ACTIVE</code>.</li><li><b>Include:</b> <code>spring.profiles.include</code> adds always-on profiles.</li><li><b>Groups:</b> <code>spring.profiles.group.prod=proddb,metrics</code>.</li><li><b>Multi document YAML:</b> sections guarded by <code>spring.config.activate.on-profile</code>.</li><li><b>Expressions:</b> <code>@Profile("dev &amp; !test")</code>.</li></ul>`,
            r`# application.yml
spring:
  profiles:
    group:
      prod: proddb,metrics
server:
  port: 8080
---
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 9090

# OUTPUT: (profile dev)
# server.port = 9090`],
        [`<p>Typical mistakes:</p><ul><li><b>Secrets committed</b> in <code>application-prod.properties</code>; use env variables or a vault.</li><li><b>Profile typo</b> so the dev file silently does not load; log <code>getActiveProfiles()</code>.</li><li><b>No default profile</b> behaviour planned; beans with <code>@Profile("dev")</code> are missing in an unprofiled run.</li><li><b>Hard coded property reads</b> instead of typed binding.</li><li><b>Setting active profile inside a profile file</b>, which Boot rejects.</li></ul>`,
            r`@Component
class Startup implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(Startup.class);
    private final Environment env;
    Startup(Environment env) { this.env = env; }
    public void run(String... a) {
        log.info("profiles={}", Arrays.toString(env.getActiveProfiles()));
    }
}

// OUTPUT:
// profiles=[dev]`],
        [`<p>Profiles are cheap at runtime; the cost is operational.</p><ul><li><b>Keep few profiles</b> and keep them close to production.</li><li><b>Use the same artifact</b> everywhere: one jar, different environment variables.</li><li><b>Tune per profile</b>: pool sizes, log levels, caches.</li><li><b>Avoid test only code</b> in production beans.</li></ul>`,
            r`# application-prod.properties
spring.datasource.hikari.maximum-pool-size=30
logging.level.root=WARN
spring.jpa.show-sql=false

# application-dev.properties
spring.datasource.hikari.maximum-pool-size=5
logging.level.com.demo=DEBUG
spring.jpa.show-sql=true

# OUTPUT:
# prod: quiet logs, bigger pool;
dev: SQL printed, small pool`],
        [`<p>Real scenario: one image deployed to three clusters. Kubernetes sets <code>SPRING_PROFILES_ACTIVE=prod</code> and database settings through a secret; the jar is never rebuilt. Tests use <code>@ActiveProfiles("test")</code> with an in-memory database.</p><ul><li>Same build, different config.</li><li>Secrets stay out of the repository.</li></ul>`,
            r`# Kubernetes container env
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/shop
SPRING_DATASOURCE_USERNAME=shop

@DataJpaTest
@ActiveProfiles("test")
class RepoTest { }

# OUTPUT:
# The following 1 profile is active: "prod"`]
    ),

    'sb-spring-expression-language-spel': dv(
        [`<p>SpEL parsing and evaluation are separate steps.</p><ul><li><b>Parse:</b> <code>SpelExpressionParser</code> builds an AST of nodes (literals, property references, method calls, operators).</li><li><b>Evaluate:</b> each node is evaluated against an <code>EvaluationContext</code> with property accessors and type converters.</li><li><b>In Spring:</b> the bean factory evaluates <code>#{}</code> with a <code>StandardBeanExpressionResolver</code> where beans are visible by name.</li><li><b>Reflection:</b> access is by reflection unless compiled.</li></ul>`,
            r`SpelExpressionParser p = new SpelExpressionParser();
SpelExpression e = p.parseRaw("'abc'.length() + 1");
System.out.println(e.getAST().toStringAST());
System.out.println(e.getValue());

// OUTPUT:
// ('abc'.length() + 1)
// 4`],
        [`<p>Syntax overview:</p><ul><li><b>Literals:</b> numbers, strings in single quotes, <code>true</code>, <code>null</code>.</li><li><b>Types:</b> <code>T(java.lang.Math).max(1, 2)</code>.</li><li><b>Objects:</b> <code>new java.util.Date()</code>, bean reference <code>@beanName</code>.</li><li><b>Safe navigation:</b> <code>user?.address?.city</code>.</li><li><b>Collections:</b> inline lists <code>{1,2,3}</code>, maps <code>{a:1}</code>, index <code>list[0]</code>.</li><li><b>Assignment:</b> <code>name = 'x'</code> on a writable context.</li></ul>`,
            r`ExpressionParser p = new SpelExpressionParser();
System.out.println(p.parseExpression("T(Math).max(3, 9)").getValue());
System.out.println(p.parseExpression("{1,2,3}.size()").getValue());
System.out.println(p.parseExpression("null?.length()").getValue());
System.out.println(p.parseExpression("null ?: 'default'").getValue());

// OUTPUT:
// 9
// 3
// null
// default`],
        [`<p>Typical mistakes:</p><ul><li><b>Double quotes</b> for string literals inside a Java string; use single quotes in SpEL.</li><li><b>Null pointer</b> on a chain; use <code>?.</code>.</li><li><b>Untrusted input</b> evaluated with a standard context (SpEL injection).</li><li><b>Confusing</b> the property placeholder with <code>#{}</code>.</li><li><b>Hidden logic</b> in annotations that is hard to test and refactor.</li></ul>`,
            r`// WRONG: full power on user text
// parser.parseExpression(userInput).getValue(new StandardEvaluationContext());

// RIGHT: restricted, read only context
EvaluationContext safe = SimpleEvaluationContext.forReadOnlyDataBinding().build();
Object v = parser.parseExpression("name").getValue(safe, new Person("Ann", 30));
System.out.println(v);

// OUTPUT:
// Ann`],
        [`<p>Performance notes:</p><ul><li><b>Parse once:</b> cache the <code>Expression</code> object and reuse it.</li><li><b>Compile:</b> <code>SpelParserConfiguration(SpelCompilerMode.IMMEDIATE, ...)</code> compiles to bytecode for hot paths.</li><li><b>Prefer plain Java</b> for logic in code; keep SpEL for configuration and annotations.</li></ul>`,
            r`SpelParserConfiguration cfg =
    new SpelParserConfiguration(SpelCompilerMode.IMMEDIATE, getClass().getClassLoader());
Expression exp = new SpelExpressionParser(cfg).parseExpression("age * 2");
Person p = new Person("Ann", 30);
long sum = 0;
for (int i = 0; i < 100_000; i++) sum += (Integer) exp.getValue(p);
System.out.println(sum);

// OUTPUT:
// 6000000`],
        [`<p>Real scenario: access rules and conditional wiring.</p><ul><li><b>Security:</b> <code>@PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")</code>.</li><li><b>Cache keys:</b> <code>@Cacheable(key = "#user.id")</code>.</li><li><b>Conditions:</b> <code>@ConditionalOnExpression</code> for feature flags.</li></ul>`,
            r`@Service
class AccountService {
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    Account load(long id) { return repo.findById(id).orElseThrow(); }

    @Cacheable(cacheNames = "rates", key = "#currency.code")
    Rate rate(Currency currency) { return fetch(currency); }
}

// OUTPUT:
// another user reading account 5 -> AccessDeniedException (403)`]
    ),

    'introductiontospringboot': dv(
        [`<p>Startup flow of <code>SpringApplication.run</code>:</p><ul><li><b>Listeners:</b> load <code>spring.factories</code> style hooks and fire the starting event.</li><li><b>Environment:</b> prepare property sources and profiles.</li><li><b>Context:</b> choose the context type from the classpath, load bean definitions.</li><li><b>Refresh:</b> create beans, start the embedded server.</li><li><b>Runners:</b> call <code>ApplicationRunner</code> and <code>CommandLineRunner</code> beans.</li></ul>`,
            r`SpringApplication app = new SpringApplication(HelloApp.class);
app.setBannerMode(Banner.Mode.OFF);
app.addListeners((ApplicationListener<ApplicationReadyEvent>)
    e -> System.out.println("ready"));
app.run(args);

// OUTPUT:
// Tomcat started on port 8080 (http)
// ready`],
        [`<p>Ways to launch and tune a Boot app:</p><ul><li><b>IDE:</b> run the main method.</li><li><b>Build tool:</b> <code>mvn spring-boot:run</code>.</li><li><b>Jar:</b> <code>java -jar app.jar --server.port=9000</code>.</li><li><b>Non-web:</b> <code>spring.main.web-application-type=none</code>.</li><li><b>Builder:</b> <code>new SpringApplicationBuilder()</code> for fluent options.</li><li><b>Debug:</b> <code>--debug</code> prints the auto-configuration report.</li></ul>`,
            r`java -jar app.jar --spring.profiles.active=prod --server.port=9000
java -Dspring.main.web-application-type=none -jar batch.jar

# OUTPUT:
# The following 1 profile is active: "prod"
# Tomcat started on port 9000 (http)`],
        [`<p>Beginner mistakes:</p><ul><li><b>Main class in the default package</b> or outside the root, so scanning misses beans.</li><li><b>Two main classes</b> so the plugin cannot decide; set <code>start-class</code>.</li><li><b>Port already in use</b>: change <code>server.port</code>.</li><li><b>Missing starter</b>: no auto-configuration without the dependency.</li><li><b>Old javax imports</b> in Boot 3; use <code>jakarta</code>.</li></ul>`,
            r`// WRONG: controller in com.other, main class in com.demo.app
// RIGHT: keep everything under the main class package
package com.demo.app.web;

@RestController
class PingController {
    @GetMapping("/ping") String ping() { return "pong"; }
}

// OUTPUT: (GET /ping)
// pong`],
        [`<p>Tuning basics:</p><ul><li><b>Server threads:</b> <code>server.tomcat.threads.max</code>.</li><li><b>Compression:</b> <code>server.compression.enabled=true</code>.</li><li><b>Startup:</b> remove unused starters, consider lazy init.</li><li><b>Virtual threads</b> with <code>spring.threads.virtual.enabled=true</code> on Java 21.</li></ul>`,
            r`# application.properties
server.tomcat.threads.max=200
server.compression.enabled=true
spring.main.lazy-initialization=false
spring.threads.virtual.enabled=true

# OUTPUT:
# requests are served by virtual threads (Java 21)`],
        [`<p>Real scenario: a small REST service for a team. Generate from Initializr, add web, validation and data-jpa, write controller, service and repository, test with <code>@WebMvcTest</code> and <code>@DataJpaTest</code>, then build one jar and ship it in a container.</p>`,
            r`@RestController
@RequestMapping("/api/customers")
class CustomerController {
    private final CustomerService service;
    CustomerController(CustomerService s) { this.service = s; }

    @PostMapping
    ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest req) {
        Customer c = service.create(req);
        return ResponseEntity.created(URI.create("/api/customers/" + c.id())).body(c);
    }
}

// OUTPUT: (POST /api/customers)
// HTTP/1.1 201
// Location: /api/customers/1`]
    ),

    'sb-spring-vs-spring-boot': dv(
        [`<p>The difference is in what runs at startup, not in the core.</p><ul><li><b>Spring:</b> you register every bean, view resolver, data source and transaction manager.</li><li><b>Boot:</b> <code>@EnableAutoConfiguration</code> loads candidate classes, and conditions decide.</li><li><b>Conditions:</b> <code>@ConditionalOnClass</code>, <code>@ConditionalOnMissingBean</code> and <code>@ConditionalOnProperty</code> keep Boot from fighting your config.</li></ul>`,
            r`@AutoConfiguration
@ConditionalOnClass(DataSource.class)
public class DataSourceAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    DataSource dataSource(DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }
}

// OUTPUT:
// your own DataSource bean replaces this one automatically`],
        [`<p>Side by side:</p><ul><li><b>Build:</b> hand managed versions vs starters and BOM.</li><li><b>Server:</b> external Tomcat vs embedded.</li><li><b>Config:</b> XML or Java config vs properties and conventions.</li><li><b>Ops:</b> custom monitoring vs Actuator.</li><li><b>Testing:</b> manual context setup vs <code>@SpringBootTest</code> and slices.</li></ul>`,
            r`<!-- classic: web.xml / WebApplicationInitializer + WAR -->
public class Init extends AbstractAnnotationConfigDispatcherServletInitializer {
    protected Class<?>[] getRootConfigClasses() {
        return new Class<?>[] { RootConfig.class };
    }
    protected Class<?>[] getServletConfigClasses() {
        return new Class<?>[] { WebConfig.class };
    }
    protected String[] getServletMappings() {
        return new String[] { "/" };
    }
}

// Boot: nothing of the above is needed
// OUTPUT:
// Boot registers the DispatcherServlet automatically`],
        [`<p>Typical misunderstandings:</p><ul><li><b>"Boot is magic":</b> every bean is traceable with the conditions report.</li><li><b>Mixing versions</b> of Spring and Boot starters; let the BOM decide.</li><li><b>Fighting defaults</b> instead of overriding a single bean.</li><li><b>Packaging war by habit</b> when a jar is enough.</li></ul>`,
            r`# find out why something is (not) configured
java -jar app.jar --debug

# OUTPUT: (excerpt)
# Negative matches:
#    RabbitAutoConfiguration:
#       Did not match: @ConditionalOnClass did not find class RabbitTemplate`],
        [`<p>Operational differences affect performance:</p><ul><li><b>Startup:</b> Boot scans and evaluates conditions, so startup is slower than a hand tuned minimal Spring app.</li><li><b>Mitigation:</b> exclude auto-configurations, use lazy init, or AOT and native image.</li><li><b>Memory:</b> fewer starters mean less on the classpath.</li></ul>`,
            r`@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class })
public class LeanApp { }

// OUTPUT: (varies)
// Started LeanApp in 0.9 seconds`],
        [`<p>Migration scenario: an old Spring MVC WAR is moved to Boot step by step. Introduce the parent pom, replace XML with Java config, keep the existing beans, switch packaging to jar, and then delete the manual config that Boot now provides.</p>`,
            r`@SpringBootApplication
@ImportResource("classpath:legacy-beans.xml")   // keep old XML during migration
public class MigratedApp extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(MigratedApp.class, args);
    }
}

// OUTPUT:
// runs as a jar and still deploys as a WAR if needed`]
    ),

    'spring-boot-features-architecture': dv(
        [`<p>Internals of a Boot application:</p><ul><li><b>Launcher:</b> <code>JarLauncher</code> builds a class loader over <code>BOOT-INF/lib</code> and runs your main class.</li><li><b>Auto-configuration:</b> candidates come from the imports file, are ordered, and are filtered by conditions.</li><li><b>Web:</b> the embedded server hosts the <code>DispatcherServlet</code>, which routes to controllers through handler mappings.</li><li><b>Binding:</b> the <code>Binder</code> maps properties to <code>@ConfigurationProperties</code> classes.</li></ul>`,
            r`jar tf target/app.jar | head -5

# OUTPUT:
# META-INF/MANIFEST.MF
# org/springframework/boot/loader/launch/JarLauncher.class
# BOOT-INF/classes/com/demo/App.class
# BOOT-INF/lib/spring-web-6.1.x.jar
# Main-Class: org.springframework.boot.loader.launch.JarLauncher`],
        [`<p>Architecture options:</p><ul><li><b>Layered:</b> controller, service, repository.</li><li><b>Hexagonal:</b> domain core with ports and adapters.</li><li><b>Package by feature</b> instead of by layer, as in <code>order</code>, <code>customer</code>.</li><li><b>Modular monolith</b> with Spring Modulith.</li><li><b>Microservices</b> using Boot per service with Config, Gateway and Discovery.</li></ul>`,
            r`com.demo.shop
    ShopApplication.java
    order/   OrderController, OrderService, OrderRepository, Order
    customer/ CustomerController, CustomerService, CustomerRepository
    config/  SecurityConfig, WebConfig

// OUTPUT:
// each feature package owns its layers; only the web and config concerns are shared`],
        [`<p>Architecture mistakes:</p><ul><li><b>Fat controllers</b> with business logic and transactions.</li><li><b>Entities in the API</b>, which leaks the schema; use DTOs.</li><li><b>Transactions on controllers</b> instead of services.</li><li><b>Circular dependencies</b> between services; extract a third component or use events.</li><li><b>Field injection</b>, which hides dependencies and hurts tests.</li></ul>`,
            r`// WRONG
@Autowired private OrderRepository repo;

// RIGHT: constructor injection, final field
private final OrderRepository repo;
OrderService(OrderRepository repo) { this.repo = repo; }

// OUTPUT:
// the service can be created in a plain unit test: new OrderService(mockRepo)`],
        [`<p>Production tuning:</p><ul><li><b>Pool sizes</b> for database and HTTP clients.</li><li><b>Caching</b> with <code>@Cacheable</code> and a Caffeine or Redis cache.</li><li><b>Observability:</b> Micrometer metrics and tracing.</li><li><b>Probes:</b> <code>management.endpoint.health.probes.enabled=true</code> for Kubernetes.</li><li><b>Layered jars</b> for fast image builds.</li></ul>`,
            r`# application.properties
management.endpoint.health.probes.enabled=true
spring.datasource.hikari.maximum-pool-size=20
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=500,expireAfterWrite=10m

# OUTPUT:
# /actuator/health/liveness and /actuator/health/readiness available`],
        [`<p>Scenario: an orders service handles a request end to end. The embedded Tomcat accepts it, the DispatcherServlet picks a controller, validation runs, the service opens a transaction, the repository saves, and an exception handler maps errors to JSON.</p>`,
            r`@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> m = new LinkedHashMap<>();
        ex.getFieldErrors().forEach(f -> m.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(m);
    }
}

// OUTPUT: (POST /api/orders with empty body)
// HTTP/1.1 400
// {"quantity":"must be greater than 0"}`]
    ),

    'sb-spring-boot-features': dv(
        [`<p>How the main features work:</p><ul><li><b>Auto-configuration:</b> conditional configuration classes loaded from the imports file.</li><li><b>Externalised config:</b> ordered property sources and relaxed binding.</li><li><b>Actuator:</b> endpoint beans exposed over web or JMX, filtered by exposure settings.</li><li><b>DevTools:</b> two class loaders, a base one for libraries and a restart one for your classes, so restarts are fast.</li></ul>`,
            r`@Endpoint(id = "build")
@Component
class BuildEndpoint {
    @ReadOperation
    Map<String, String> info() { return Map.of("version", "1.4.2"); }
}

// OUTPUT: (GET /actuator/build)
// {"version":"1.4.2"}`],
        [`<p>Feature options:</p><ul><li><b>Banner:</b> custom <code>banner.txt</code> or off.</li><li><b>Logging:</b> file output with <code>logging.file.name</code>, pattern, per-package levels.</li><li><b>Testing:</b> <code>@SpringBootTest</code>, <code>@WebMvcTest</code>, <code>@DataJpaTest</code>, <code>@JsonTest</code>.</li><li><b>Docker Compose</b> support starts dependent containers in development.</li><li><b>Graceful shutdown</b> and <code>spring.lifecycle</code> settings.</li></ul>`,
            r`# application.properties
logging.file.name=logs/app.log
logging.level.org.springframework.web=INFO
logging.pattern.console=%d{HH:mm:ss}
%-5level %logger{20}
- %msg%n
spring.main.banner-mode=off

# OUTPUT:
# 10:15:02 INFO  c.d.Application - Started Application`],
        [`<p>Common feature mistakes:</p><ul><li><b>DevTools in production</b>: it is excluded from repackaged jars by default; do not force it.</li><li><b>All Actuator endpoints exposed</b> to the public.</li><li><b>Sensitive values</b> shown by <code>env</code> and <code>configprops</code>.</li><li><b>Missing validation</b> on <code>@ConfigurationProperties</code>.</li></ul>`,
            r`@Validated
@ConfigurationProperties(prefix = "app")
record AppProps(@NotBlank String name, @Min(1) int retries) { }

# app.retries=0
# OUTPUT:
# Binding to target failed: Field error in object 'app' on field 'retries': must be >= 1`],
        [`<p>Tuning with features:</p><ul><li><b>Metrics</b> from Micrometer show slow endpoints and pool usage.</li><li><b>Conditional features</b> via <code>@ConditionalOnProperty</code> avoid loading unused code.</li><li><b>Compression and HTTP/2</b> reduce network cost.</li></ul>`,
            r`@Configuration
@ConditionalOnProperty(name = "feature.search", havingValue = "true")
class SearchConfig {
    @Bean SearchIndex index() { return new SearchIndex(); }
}

# feature.search=true
// OUTPUT:
// SearchIndex bean created only when the flag is on`],
        [`<p>Scenario: the operations team needs to know if the service is healthy. Actuator health with a database check feeds the Kubernetes readiness probe, and Micrometer metrics are scraped by Prometheus.</p>`,
            r`# application.properties
management.endpoints.web.exposure.include=health,prometheus
management.endpoint.health.probes.enabled=true

# OUTPUT: (GET /actuator/health/readiness)
# {"status":"UP"}`]
    ),

    'sb-spring-initializr': dv(
        [`<p>Initializr is itself a Spring Boot web service.</p><ul><li><b>Metadata:</b> a JSON description of versions, dependencies and options at the root URL.</li><li><b>Generation:</b> templates produce the build file, main class, wrapper and test.</li><li><b>Compatibility:</b> each dependency lists the Boot version range it supports.</li></ul>`,
            r`curl -H "Accept: application/json" https://start.spring.io | head -c 120

# OUTPUT: (varies)
# {"_links":{"gradle-build":{"href":"https://start.spring.io/build.gradle?...`],
        [`<p>Variants of use:</p><ul><li><b>Web:</b> start.spring.io.</li><li><b>IDE:</b> New Project wizards in IntelliJ, Eclipse STS, VS Code.</li><li><b>CLI:</b> curl or the Spring Boot CLI <code>spring init</code>.</li><li><b>Types:</b> <code>maven-project</code>, <code>gradle-project</code>, <code>gradle-project-kotlin</code>.</li><li><b>Self hosted:</b> your own instance with company defaults.</li></ul>`,
            r`spring init --build=maven --java-version=17 \
  --dependencies=web,data-jpa,validation --name=shop shop

# OUTPUT:
# Using service at https://start.spring.io
# Project extracted to '/work/shop'`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong Java version</b> chosen that the machine does not have.</li><li><b>Too many dependencies</b> ticked at start.</li><li><b>Ignoring the group and package</b> naming, which is hard to change later.</li><li><b>Choosing a milestone or snapshot</b> Boot version for a real project.</li><li><b>Unzipping into a folder</b> that is already a project.</li></ul>`,
            r`java -version
./mvnw -v

# OUTPUT: (varies)
# release version 21 not supported   <- compiler setting above installed JDK
# fix: set java.version to the installed JDK (for example 17)`],
        [`<p>Tuning your start:</p><ul><li>Pick only needed starters; add others when the code needs them.</li><li>Prefer the latest stable Boot line.</li><li>Commit the wrapper files so CI uses the same build tool.</li></ul>`,
            r`# check the generated build
./mvnw -q test
./mvnw -q package -DskipTests

# OUTPUT:
# BUILD SUCCESS`],
        [`<p>Scenario: a company standard. A platform team runs its own Initializr that adds the logging library, security baseline and CI files, so each new service starts compliant.</p>`,
            r`# application.yml of a custom initializr
initializr:
  dependencies:
    - name: Company
      content:
        - name: Company Logging
          id: company-logging
          groupId: com.acme
          artifactId: acme-logging-starter

# OUTPUT:
# new projects can select "Company Logging" in the UI`]
    ),

    'sb-maven-gradle-with-spring-boot': dv(
        [`<p>What the Boot build plugin does.</p><ul><li><b>Repackage:</b> takes the normal jar and rewrites it into a nested executable jar.</li><li><b>Main class:</b> detected automatically or set by <code>start-class</code>.</li><li><b>Dependency management:</b> the BOM pins versions for hundreds of libraries.</li><li><b>Tasks:</b> run, build-image, build-info, layered jar.</li></ul>`,
            r`./mvnw package
unzip -l target/app-0.0.1-SNAPSHOT.jar | grep -E "MANIFEST|Launcher"

# OUTPUT:
# META-INF/MANIFEST.MF
# org/springframework/boot/loader/launch/JarLauncher.class`],
        [`<p>Build variants:</p><ul><li><b>Override a managed version:</b> <code>&lt;jackson-bom.version&gt;</code> property in Maven or <code>ext['jackson-bom.version']</code> in Gradle.</li><li><b>Profiles</b> in Maven, source sets in Gradle.</li><li><b>build-info</b> goal adds version data to Actuator.</li><li><b>Kotlin DSL</b> for Gradle.</li></ul>`,
            r`<!-- Maven: override a managed version -->
<properties>
    <jackson-bom.version>2.17.1</jackson-bom.version>
</properties>

// Gradle
ext['jackson-bom.version'] = '2.17.1'

// OUTPUT:
// dependency:tree shows the overridden Jackson version`],
        [`<p>Common mistakes:</p><ul><li><b>Specifying versions</b> for managed dependencies, which can cause mismatches.</li><li><b>Missing plugin</b>, so the jar has no main manifest entry ("no main manifest attribute").</li><li><b>Mixed Java versions</b> between compiler and runtime.</li><li><b>Wrong scope</b> for the servlet API when producing a WAR; use <code>providedRuntime</code>.</li><li><b>Dependency conflicts</b> not checked with the tree.</li></ul>`,
            r`java -jar target/app.jar

# OUTPUT:
# no main manifest attribute, in target/app.jar
# fix: add spring-boot-maven-plugin so the jar is repackaged`],
        [`<p>Build performance and image size:</p><ul><li><b>Gradle build cache</b> and daemon speed repeated builds.</li><li><b>Maven</b>: use <code>-T 1C</code> for modules and <code>-o</code> offline when cached.</li><li><b>Layered jar</b> and <code>build-image</code> reuse dependency layers.</li><li><b>Skip tests</b> only in packaging steps, not in CI.</li></ul>`,
            r`./mvnw -T 1C clean verify
./gradlew build --build-cache --parallel

# OUTPUT: (varies)
# BUILD SUCCESS  Total time: 24 s`],
        [`<p>Scenario: CI pipeline for a service. It runs tests, builds a container image without a Dockerfile, and tags the image with the build version.</p>`,
            r`./mvnw verify
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=acme/shop:1.0.0
docker run -p 8080:8080 acme/shop:1.0.0

# OUTPUT:
# Successfully built image 'docker.io/acme/shop:1.0.0'
# Tomcat started on port 8080 (http)`]
    ),

    'sb-starter-dependencies': dv(
        [`<p>A starter is only a pom; the work happens elsewhere.</p><ul><li><b>Starter:</b> lists libraries (for example Spring MVC, Jackson, Tomcat).</li><li><b>Auto-configure module:</b> contains classes guarded by conditions.</li><li><b>Activation:</b> when the library appears on the classpath, the condition matches and beans are created.</li></ul>`,
            r`mvn dependency:tree -Dincludes=org.springframework.boot

# OUTPUT: (excerpt, varies)
# +- org.springframework.boot:spring-boot-starter-web:jar:3.3.0:compile
#    +- org.springframework.boot:spring-boot-starter-json:jar:3.3.0:compile
#    +- org.springframework.boot:spring-boot-starter-tomcat:jar:3.3.0:compile`],
        [`<p>Common starters and their use:</p><ul><li><b>web:</b> MVC and REST.</li><li><b>webflux:</b> reactive.</li><li><b>data-jpa:</b> JPA with Hibernate.</li><li><b>validation:</b> Jakarta Bean Validation.</li><li><b>security:</b> authentication and authorisation.</li><li><b>actuator:</b> operations endpoints.</li><li><b>test:</b> JUnit 5, Mockito, AssertJ, MockMvc.</li><li><b>thymeleaf:</b> server side templates.</li></ul>`,
            r`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

record SignUp(@NotBlank String name, @Email String email) { }

// OUTPUT:
// invalid email -> 400 with a validation error`],
        [`<p>Common mistakes:</p><ul><li><b>Both web and webflux</b> starters present, so Boot chooses servlet mode.</li><li><b>JPA starter without a database driver</b> or URL: startup fails.</li><li><b>Security starter added</b> and every endpoint suddenly returns 401.</li><li><b>Wrong version</b> forced on a starter.</li><li><b>Test starter in compile scope</b>.</li></ul>`,
            r`# add spring-boot-starter-data-jpa with no datasource configured
# OUTPUT:
# Failed to configure a DataSource: 'url' attribute is not specified
# Action: Consider the following: add a driver, or exclude DataSourceAutoConfiguration`],
        [`<p>Starter hygiene helps startup and size.</p><ul><li>Remove unused starters.</li><li>Check the debug report for unexpected positive matches.</li><li>Replace heavy defaults only when measured, for example Undertow instead of Tomcat.</li></ul>`,
            r`java -jar app.jar --debug | grep -c "matched"
jar tf app.jar | grep -c "BOOT-INF/lib"

# OUTPUT: (varies)
# 42
# 61`],
        [`<p>Scenario: a custom company starter. It brings a logging filter and a typed properties class so every team gets the same behaviour by adding one dependency.</p>`,
            r`@AutoConfiguration
@EnableConfigurationProperties(AcmeProps.class)
public class AcmeAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    RequestLogFilter requestLogFilter(AcmeProps props) {
        return new RequestLogFilter(props.logBody());
    }
}

# META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
# com.acme.AcmeAutoConfiguration
// OUTPUT:
// adding acme-spring-boot-starter registers the filter in any service`]
    )
};
