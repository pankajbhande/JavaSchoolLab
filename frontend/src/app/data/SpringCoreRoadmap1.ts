// Spring Core roadmap, part 1: the roadmap overview and sections 1-5 (fundamentals, dependency injection, beans, configuration, stereotypes).
// Examples use Spring Framework 6 / Spring Boot 3 and Java 21. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const sc = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('sc', n, title, priority, topics);

export const springCoreRoadmap1: SubTopic[] = [
  {
    id: 'sc-roadmap',
    name: 'Spring Core Roadmap (20 Sections, 285 Topics)',
    topics: [
      topic(
        'sc-roadmap-overview',
        'Spring Core Complete Topics Checklist (285 Topics)',
        [
          blk(`<h3>How the roadmap is organised</h3>
• The 285 Spring Core topics, from beginner to advanced, are grouped into <b>20 sections</b>, each a module of this course with worked Java examples and interview questions. Starred sections (dependency injection, beans, container, bean lifecycle, AOP, proxies, transactions) are the ones that appear in every Spring interview and explain most of what Spring Boot does for you.<br>
• Some sections cover neighbouring projects that every Spring developer uses together with the core container: <b>Spring Data access (JDBC)</b>, <b>Spring Security</b> and <b>Spring Test</b>. They are marked as such, because they are not strictly part of the Spring Core container.<br>
<table ${TABLE}>
<tr><th>Section</th><th>Topics</th><th>Items</th></tr>
<tr><td>1</td><td>Spring Framework Fundamentals</td><td>1-10</td></tr>
<tr><td>2</td><td>Dependency Injection (DI) ⭐</td><td>11-25</td></tr>
<tr><td>3</td><td>Spring Beans ⭐</td><td>26-40</td></tr>
<tr><td>4</td><td>Spring Configuration</td><td>41-55</td></tr>
<tr><td>5</td><td>Stereotype Annotations</td><td>56-65</td></tr>
<tr><td>6</td><td>Spring Container ⭐</td><td>66-80</td></tr>
<tr><td>7</td><td>Bean Lifecycle ⭐</td><td>81-95</td></tr>
<tr><td>8</td><td>Spring Expression Language (SpEL)</td><td>96-107</td></tr>
<tr><td>9</td><td>Spring Events</td><td>108-119</td></tr>
<tr><td>10</td><td>AOP (Aspect-Oriented Programming) ⭐</td><td>120-140</td></tr>
<tr><td>11</td><td>Spring Proxies ⭐</td><td>141-150</td></tr>
<tr><td>12</td><td>Spring Resources and Utilities</td><td>151-165</td></tr>
<tr><td>13</td><td>Spring Profiles and Properties</td><td>166-178</td></tr>
<tr><td>14</td><td>Spring Validation</td><td>179-188</td></tr>
<tr><td>15</td><td>Spring Transactions ⭐</td><td>189-205</td></tr>
<tr><td>16</td><td>Spring JDBC and Data Access</td><td>206-218</td></tr>
<tr><td>17</td><td>Spring Security Fundamentals (separate project)</td><td>219-234</td></tr>
<tr><td>18</td><td>Spring Testing</td><td>235-245</td></tr>
<tr><td>19</td><td>Advanced Spring Core</td><td>246-260</td></tr>
<tr><td>20</td><td>Spring Core Interview Questions</td><td>261-285</td></tr>
</table>`),
        ],
        [
          blk(`<h3>Top 20 topics to master first (Spring Boot and microservices developer)</h3>
1. IoC and Dependency Injection<br>
2. <code>BeanFactory</code> vs <code>ApplicationContext</code><br>
3. Constructor injection<br>
4. <code>@Component</code>, <code>@Service</code>, <code>@Repository</code><br>
5. <code>@Configuration</code> and <code>@Bean</code><br>
6. <code>@Autowired</code>, <code>@Qualifier</code>, <code>@Primary</code><br>
7. Bean scopes<br>
8. Bean lifecycle<br>
9. <code>BeanPostProcessor</code><br>
10. <code>BeanFactoryPostProcessor</code><br>
11. AOP and advice types<br>
12. JDK proxy vs CGLIB<br>
13. <code>@Transactional</code><br>
14. Transaction propagation and isolation<br>
15. Profiles and external configuration<br>
16. Spring events<br>
17. SpEL<br>
18. Circular dependencies<br>
19. Exception translation<br>
20. Spring testing<br>
<br>
Official documentation: docs.spring.io/spring-framework/reference.`),
        ],
        [
          blk(`<h3>How to study Spring Core</h3>
• Spring looks like magic until you know its three mechanisms: the <b>container</b> (creates and wires objects), <b>post-processors</b> (modify definitions and instances) and <b>proxies</b> (add behaviour like transactions, security, async around your beans). Almost every annotation you use (<code>@Autowired</code>, <code>@Transactional</code>, <code>@Async</code>, <code>@Cacheable</code>, <code>@Value</code>) is implemented by one of them.<br>
• Study by <b>experiment</b>: run small <code>AnnotationConfigApplicationContext</code> programs, print bean names, add logging <code>BeanPostProcessor</code>s, turn on <code>logging.level.org.springframework=DEBUG</code>, and inspect proxies with <code>AopUtils</code>. Seeing the container do its work removes the mystery.`),
        ],
        [
          ['Which Spring Core topics matter most for interviews?', 'IoC and dependency injection (constructor injection), BeanFactory vs ApplicationContext, bean scopes and lifecycle, @Configuration/@Bean and stereotypes, @Autowired/@Qualifier/@Primary, BeanPostProcessor and BeanFactoryPostProcessor, AOP with JDK vs CGLIB proxies, @Transactional (propagation, isolation, self-invocation), profiles, events, SpEL and circular dependencies.'],
          ['What mechanisms explain most of Spring\'s "magic"?', 'The IoC container that creates and wires beans, post-processors that customise bean definitions and instances, and proxies that wrap beans to add cross-cutting behaviour such as transactions and security.'],
        ],
      ),
    ],
  },

  sc(1, 'Spring Framework Fundamentals', 'Core', [
    topic(
      'sc-intro-architecture-modules',
      'Introduction, Architecture, Modules and Spring Framework vs Spring Boot',
      [
        blk(`<h3>What is the Spring Framework?</h3>
• <b>Spring</b> is the most widely used Java application framework. Its core idea is <b>Inversion of Control</b>: instead of your code creating and connecting its dependencies, the <b>Spring container</b> creates the objects (<b>beans</b>), wires them together (<b>dependency injection</b>) and manages their lifecycle. On top of the container Spring provides infrastructure: AOP, transactions, data access, web MVC/WebFlux, security, messaging, testing, caching, scheduling.<br>
• Why it exists: plain Java EE (J2EE) was heavyweight; Spring offered <b>POJO-based</b> programming, loose coupling, easy testing and consistent abstractions (transactions, data access exceptions) over many technologies.<br>
• Today you start with <b>Spring Boot</b>, which auto-configures Spring Framework; but Boot is "Spring with defaults": every Boot behaviour is Spring Core underneath.`,
          `// The simplest Spring program: the container creates and wires the objects
@Configuration
@ComponentScan("com.javaschoollab")
class AppConfig {}

@Service
class GreetingService { String greet(String n) { return "Hello, " + n; } }

@Component
class Greeter {
    private final GreetingService service;
    Greeter(GreetingService service) { this.service = service; }              // injected by Spring
    void run() { System.out.println(service.greet("Spring")); }
}

public class Main {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            ctx.getBean(Greeter.class).run();                                  // Hello, Spring
        }
    }
}`,
        ),
      ],
      [
        blk(`<h3>Spring architecture and modules</h3>
<table ${TABLE}>
<tr><th>Layer</th><th>Modules</th><th>Purpose</th></tr>
<tr><td>Core Container</td><td><code>spring-core</code>, <code>spring-beans</code>, <code>spring-context</code>, <code>spring-expression</code> (SpEL)</td><td>IoC/DI container, resources, events, i18n, SpEL</td></tr>
<tr><td>AOP and instrumentation</td><td><code>spring-aop</code>, <code>spring-aspects</code> (AspectJ)</td><td>Proxies, aspects, cross-cutting concerns</td></tr>
<tr><td>Data access / integration</td><td><code>spring-jdbc</code>, <code>spring-tx</code>, <code>spring-orm</code>, <code>spring-jms</code>, <code>spring-oxm</code></td><td>JDBC templates, transactions, ORM integration, messaging</td></tr>
<tr><td>Web</td><td><code>spring-web</code>, <code>spring-webmvc</code>, <code>spring-webflux</code>, <code>spring-websocket</code></td><td>MVC, REST, reactive web, WebSocket</td></tr>
<tr><td>Test</td><td><code>spring-test</code></td><td>TestContext framework, MockMvc, JUnit 5 integration</td></tr>
</table>
• Related <b>projects</b>: Spring Boot, Spring Data, Spring Security, Spring Cloud, Spring Batch, Spring Integration. Each depends on Spring Framework's core container.<br>
• <b>Spring Core (the container)</b> = <code>spring-core</code> + <code>spring-beans</code> + <code>spring-context</code> (+ <code>spring-expression</code> and <code>spring-aop</code>). In this course "Spring Core" also covers transactions, JDBC, validation, events, AOP and testing.`),
      ],
      [
        blk(`<h3>Spring Framework vs Spring Boot</h3>
<table ${TABLE}>
<tr><th></th><th>Spring Framework</th><th>Spring Boot</th></tr>
<tr><td>Purpose</td><td>The foundation: container, AOP, transactions, MVC, data access</td><td>Opinionated layer that makes Spring applications easy to create and run</td></tr>
<tr><td>Configuration</td><td>You declare beans (XML/annotations/Java) and infrastructure (view resolvers, transaction manager, data source)</td><td><b>Auto-configuration</b> creates sensible beans from the classpath and properties</td></tr>
<tr><td>Dependencies</td><td>You choose and align versions</td><td><b>Starters</b> and a managed BOM</td></tr>
<tr><td>Server</td><td>Deploy a WAR to an external servlet container</td><td><b>Embedded</b> Tomcat/Jetty/Undertow/Netty; runnable jar</td></tr>
<tr><td>Production features</td><td>Build yourself</td><td>Actuator: health, metrics, info</td></tr>
<tr><td>Entry point</td><td>Create <code>ApplicationContext</code> yourself</td><td><code>SpringApplication.run(...)</code></td></tr>
</table>
• Boot adds <b>no new container</b>: <code>@SpringBootApplication</code> = <code>@Configuration</code> + <code>@EnableAutoConfiguration</code> + <code>@ComponentScan</code>. Auto-configuration classes are ordinary <code>@Configuration</code> classes guarded by <code>@Conditional...</code> annotations. Understanding Spring Core means you can read and override anything Boot does.`,
          `@SpringBootApplication                         // = @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan
public class Application {
    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(Application.class, args);   // creates the ApplicationContext for you
        System.out.println(ctx.getBeanDefinitionCount() + " beans");
        // the same container classes you use in plain Spring: AnnotationConfigServletWebServerApplicationContext
        System.out.println(ctx.getClass().getSimpleName());
    }
}

// override a Boot default with a plain @Bean (auto-config backs off because of @ConditionalOnMissingBean)
@Bean ObjectMapper objectMapper() { return new ObjectMapper().findAndRegisterModules(); }`,
        ),
      ],
      [
        ['What is the Spring Framework?', 'A Java application framework built around an IoC container that creates and wires beans (dependency injection) and provides infrastructure such as AOP, transactions, data access, web MVC, security integration and testing support.'],
        ['What is the difference between Spring Framework and Spring Boot?', 'Spring Framework is the foundation (container, AOP, tx, MVC); Spring Boot adds auto-configuration, starters, embedded servers and production features on top of it, so applications need little setup. Boot does not replace the container.'],
        ['What are the main Spring modules?', 'Core Container (core, beans, context, expression), AOP, data access/integration (jdbc, tx, orm, jms), web (web, webmvc, webflux) and test.'],
      ],
    ),
    topic(
      'sc-ioc-di-concepts',
      'IoC, Dependency Injection and Why They Matter',
      [
        blk(`<h3>Inversion of Control</h3>
• Normally your object <b>controls</b> how it gets its collaborators: <code>this.repo = new JdbcCourseRepository(dataSource)</code>. With <b>IoC</b> the control is inverted: a framework (the container) decides <b>which</b> implementation is used and <b>when</b> it is created, and hands it in. <b>Hollywood principle</b>: "don't call us, we'll call you".<br>
• <b>Dependency Injection (DI)</b> is the main IoC technique: a class declares its dependencies (constructor parameters, setters, fields) and the container <b>injects</b> them. Alternatives: Service Locator (the class asks a registry), factories.<br>
• Benefits: <b>loose coupling</b> (depend on interfaces), <b>testability</b> (inject fakes), <b>configurability</b> (swap implementations by config), <b>lifecycle management</b> by the container, and cross-cutting features through proxies.`,
          `// Tight coupling: the class creates its own dependency
class EnrollmentService {
    private final CourseRepository repo = new JdbcCourseRepository(new HikariDataSource(...));   // hard to test, hard to change
}

// Inversion of control + DI: the dependency is provided from outside
class EnrollmentService {
    private final CourseRepository repo;                       // depends on an abstraction
    EnrollmentService(CourseRepository repo) { this.repo = repo; }
}
// production: new EnrollmentService(new JdbcCourseRepository(ds))      container: Spring does this wiring
// test:       new EnrollmentService(new InMemoryCourseRepository())    no database needed`,
        ),
      ],
      [
        blk(`<h3>IoC vs DI vs Service Locator</h3>
<table ${TABLE}>
<tr><th></th><th>Dependency Injection</th><th>Service Locator</th></tr>
<tr><td>Who provides dependencies?</td><td>The container pushes them in</td><td>The class pulls them (<code>ctx.getBean(...)</code>)</td></tr>
<tr><td>Dependencies visible?</td><td>Yes, in the constructor signature</td><td>Hidden inside method bodies</td></tr>
<tr><td>Testing</td><td>Easy: pass fakes</td><td>Needs a configured locator</td></tr>
<tr><td>Coupling to the framework</td><td>None (POJOs)</td><td>The class depends on the locator</td></tr>
</table>
• In Spring, avoid <code>ApplicationContext.getBean()</code> in application code (it is the Service Locator anti-pattern); use it only at the entry point or in infrastructure code. Prefer <code>ObjectProvider</code> when you need lazy/optional lookups.<br>
• <b>DI makes the object graph an explicit design</b>: the container assembles it from configuration (<b>composition root</b>); business classes only <b>use</b> their collaborators.`,
          `// Service Locator (avoid)
@Service
class BadService {
    @Autowired ApplicationContext ctx;
    void run() { ctx.getBean(MailSender.class).send(...); }          // hidden dependency, hard to test
}

// DI (prefer)
@Service
class GoodService {
    private final MailSender mail;
    GoodService(MailSender mail) { this.mail = mail; }                // explicit, immutable, testable
    void run() { mail.send(...); }
}`,
        ),
      ],
      [
        blk(`<h3>What the container does for you</h3>
• <b>Reads configuration</b> (annotations, Java config, XML) into <b>bean definitions</b>; <b>instantiates</b> beans in dependency order; <b>resolves and injects</b> dependencies by type/name/qualifier; <b>applies post-processors</b> (property placeholders, <code>@Autowired</code>, validation, AOP proxies); <b>invokes lifecycle callbacks</b> (init/destroy); <b>publishes events</b>; <b>destroys</b> beans on shutdown.<br>
• You design with <b>small cohesive classes</b> and <b>interfaces</b>; the container is the glue. This is why a Spring application can switch a data source, a clock or a payment gateway by changing a bean definition, not business code.`,
          `ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
System.out.println(Arrays.toString(ctx.getBeanDefinitionNames()));      // what the container has registered
EnrollmentService service = ctx.getBean(EnrollmentService.class);        // an instance with all dependencies injected`,
        ),
      ],
      [
        ['What is Inversion of Control?', 'A design principle where the framework controls object creation and wiring instead of the application code; the class receives its collaborators rather than creating them.'],
        ['What is Dependency Injection?', 'A form of IoC in which an object declares its dependencies and the container injects them through constructors, setters or fields, giving loose coupling and easy testing.'],
        ['Why is calling getBean() in application code discouraged?', 'It is the Service Locator anti-pattern: dependencies become hidden, the class depends on the container and testing gets harder. Use constructor injection or ObjectProvider.'],
      ],
    ),
    topic(
      'sc-beanfactory-applicationcontext',
      'Core Container: BeanFactory, ApplicationContext and Configuration Metadata',
      [
        blk(`<h3>BeanFactory</h3>
• <code>BeanFactory</code> is the <b>root interface of the IoC container</b>: <code>getBean(name|type)</code>, <code>containsBean</code>, <code>isSingleton</code>, <code>getType</code>. The main implementation is <code>DefaultListableBeanFactory</code>. It provides <b>dependency injection and bean lifecycle</b> and <b>lazily instantiates</b> beans (on first <code>getBean</code>), but offers no enterprise features by itself.<br>
• Use directly only in constrained environments; applications use <code>ApplicationContext</code>.`,
          `DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
new XmlBeanDefinitionReader(factory).loadBeanDefinitions(new ClassPathResource("beans.xml"));
CourseService s = factory.getBean(CourseService.class);        // created lazily on first request
System.out.println(factory.isSingleton("courseService"));`,
        ),
      ],
      [
        blk(`<h3>ApplicationContext</h3>
• <code>ApplicationContext</code> extends <code>BeanFactory</code> and adds <b>enterprise features</b>: <b>eager singleton instantiation</b> at startup (errors fail fast), <b>automatic registration of post-processors</b> (BPP/BFPP), <b>event publication</b> (<code>ApplicationEventPublisher</code>), <b>message source</b> / i18n (<code>MessageSource</code>), <b>resource loading</b> (<code>ResourcePatternResolver</code>), <b>Environment</b> (profiles/properties), annotation processing, AOP integration, parent/child contexts, lifecycle (<code>refresh</code>, <code>close</code>).<br>
• Implementations: <code>ClassPathXmlApplicationContext</code>, <code>FileSystemXmlApplicationContext</code>, <code>AnnotationConfigApplicationContext</code> (plain Java apps), <code>AnnotationConfigServletWebServerApplicationContext</code> (Boot servlet apps), <code>GenericApplicationContext</code>, <code>AnnotationConfigWebApplicationContext</code>/<code>XmlWebApplicationContext</code> (legacy web).`,
          `try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()) {
    ctx.register(AppConfig.class);                         // or scan("com.javaschoollab")
    ctx.getEnvironment().setActiveProfiles("dev");
    ctx.refresh();                                          // start the container: instantiate singletons, run post-processors
    ctx.publishEvent(new CourseCreatedEvent("Spring"));
    String msg = ctx.getMessage("greeting", new Object[]{"Asha"}, Locale.ENGLISH);     // i18n
    Resource banner = ctx.getResource("classpath:banner.txt");
}                                                           // close(): destroy singletons, publish ContextClosedEvent`,
        ),
      ],
      [
        blk(`<h3>BeanFactory vs ApplicationContext, and configuration metadata</h3>
<table ${TABLE}>
<tr><th></th><th>BeanFactory</th><th>ApplicationContext</th></tr>
<tr><td>Bean instantiation</td><td>Lazy (on demand)</td><td>Eager for singletons (default)</td></tr>
<tr><td>Post-processors</td><td>Must be registered manually</td><td>Detected and applied automatically</td></tr>
<tr><td>Events, i18n, resources</td><td>No</td><td>Yes</td></tr>
<tr><td>Annotation support (<code>@Autowired</code>, <code>@PostConstruct</code>)</td><td>Only if you register the processors</td><td>Yes (via <code>AnnotationConfigUtils</code>)</td></tr>
<tr><td>Use</td><td>Embedded/low-level</td><td>Applications</td></tr>
</table>
• <b>Configuration metadata</b> tells the container <b>what beans to create and how to wire them</b>: (1) <b>XML</b> (<code>&lt;bean&gt;</code>), (2) <b>annotation-based</b> (<code>@Component</code> + <code>@ComponentScan</code>, <code>@Autowired</code>), (3) <b>Java-based</b> (<code>@Configuration</code> + <code>@Bean</code>), and programmatic registration. All end up as <b><code>BeanDefinition</code></b> objects in the registry. They can be mixed; Java/annotation configuration is the modern default.`,
          `// The same bean in three metadata styles
// 1. XML
// <bean id="courseService" class="com.jsl.CourseService"><constructor-arg ref="courseRepository"/></bean>

// 2. Annotation-based
@Service class CourseService { CourseService(CourseRepository repo) {} }            // found by @ComponentScan

// 3. Java-based
@Configuration class AppConfig { @Bean CourseService courseService(CourseRepository repo) { return new CourseService(repo); } }

BeanDefinition def = ctx.getBeanFactory().getBeanDefinition("courseService");
System.out.println(def.getBeanClassName() + " scope=" + def.getScope() + " lazy=" + def.isLazyInit());`,
        ),
      ],
      [
        ['BeanFactory vs ApplicationContext?', 'ApplicationContext extends BeanFactory with eager singleton creation, automatic post-processor registration, events, i18n, resource loading and Environment support; BeanFactory is the minimal lazy container. Applications should use ApplicationContext.'],
        ['What is configuration metadata?', 'The instructions (XML, annotations, Java @Configuration) that describe beans and wiring; the container turns them into BeanDefinition objects and creates beans from them.'],
        ['Which ApplicationContext implementation is used in a Spring Boot web app?', 'AnnotationConfigServletWebServerApplicationContext (or the reactive/ non-web variants for other application types), created by SpringApplication.'],
      ],
    ),
  ]),

  sc(2, 'Dependency Injection (DI)', 'Essential', [
    topic(
      'sc-di-types',
      'Constructor, Setter and Field Injection: Comparison and Best Practices',
      [
        blk(`<h3>The three injection styles</h3>
• <b>Constructor injection</b>: dependencies are constructor parameters. Since Spring 4.3 a class with <b>one constructor</b> needs no <code>@Autowired</code>. <b>Setter injection</b>: <code>@Autowired</code> on a setter, for optional/changeable dependencies. <b>Field injection</b>: <code>@Autowired</code> directly on a private field (reflection).`,
          `@Service
class EnrollmentService {
    private final CourseRepository courses;                  // 1. constructor injection: final fields
    private NotificationSender sender;
    @Autowired private AuditLog audit;                       // 3. field injection (discouraged)

    EnrollmentService(CourseRepository courses) { this.courses = courses; }       // @Autowired optional for a single constructor

    @Autowired(required = false)                              // 2. setter injection: optional collaborator
    void setSender(NotificationSender sender) { this.sender = sender; }
}`,
        ),
      ],
      [
        blk(`<h3>Constructor vs setter vs field injection</h3>
<table ${TABLE}>
<tr><th></th><th>Constructor</th><th>Setter</th><th>Field</th></tr>
<tr><td>Immutability (<code>final</code>)</td><td><b>Yes</b></td><td>No</td><td>No</td></tr>
<tr><td>Required dependencies</td><td><b>Guaranteed</b> (object never half-built)</td><td>Can be missing</td><td>Can be missing</td></tr>
<tr><td>Testing without Spring</td><td>Easy: <code>new X(fake)</code></td><td>Easy with setters</td><td><b>Hard</b>: needs reflection/<code>@InjectMocks</code></td></tr>
<tr><td>Dependencies visible</td><td>Yes (signature)</td><td>Yes</td><td>Hidden</td></tr>
<tr><td>Circular dependencies</td><td>Detected at startup (fails)</td><td>Allowed (hides design problem)</td><td>Allowed</td></tr>
<tr><td>Too many dependencies</td><td>Obvious: signals a class doing too much</td><td>Hidden</td><td>Hidden</td></tr>
<tr><td>Recommended use</td><td><b>Default for mandatory dependencies</b></td><td>Optional/re-configurable dependencies</td><td>Avoid (tests, framework internals)</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Best practices for DI</h3>
• <b>Prefer constructor injection with <code>final</code> fields</b> (Lombok <code>@RequiredArgsConstructor</code> reduces noise). Keep constructors with <b>few parameters</b> (more than 4-5 means the class has too many responsibilities: split it).<br>
• <b>Program to interfaces</b>; inject the interface, not the implementation. Avoid injecting the <code>ApplicationContext</code>. Do not use static access to beans. Never use <code>new</code> for collaborators that should be beans (it bypasses the container, so no AOP/transactions).<br>
• Avoid <b>circular dependencies</b> by redesign (extract a third bean, use events). Keep <b>business logic out of configuration classes</b>. Use <code>@Qualifier</code>/<code>@Primary</code> deliberately when several candidates exist. <b>Inject values</b> through <code>@Value</code>/<code>@ConfigurationProperties</code>, not by reading system properties in code. Prefer <b>small, stateless singleton beans</b>.`,
          `// Lombok keeps constructor injection concise
@Service
@RequiredArgsConstructor                                         // generates the constructor for all final fields
class CertificateService {
    private final EnrollmentRepository enrollments;
    private final PdfRenderer renderer;
    private final Clock clock;                                    // inject the Clock: testable time

    byte[] generate(UUID enrollmentId) { ... }
}

// Plain unit test: no Spring needed
@Test void generatesPdf() {
    var service = new CertificateService(fakeRepo, fakeRenderer, Clock.fixed(Instant.parse("2026-10-20T00:00:00Z"), ZoneOffset.UTC));
    assertThat(service.generate(id)).isNotEmpty();
}`,
        ),
      ],
      [
        ['Constructor vs setter vs field injection?', 'Constructor injection guarantees required dependencies, allows final fields and easy unit tests and exposes class bloat; setter injection suits optional dependencies; field injection is concise but hides dependencies, prevents immutability and complicates testing, so it is discouraged.'],
        ['Do you need @Autowired on a constructor?', 'Not when the class has a single constructor (Spring 4.3+); with several constructors mark the one to use with @Autowired.'],
        ['Why is field injection discouraged?', 'You cannot create the object correctly without reflection or Spring, dependencies are hidden and mutable, and circular dependencies go undetected.'],
      ],
    ),
    topic(
      'sc-autowiring-qualifiers',
      'Autowiring, @Autowired, @Qualifier, @Primary, @Resource, @Inject and Dependency Resolution',
      [
        blk(`<h3>Autowiring and @Autowired</h3>
• <b>Autowiring</b> lets Spring resolve dependencies automatically. With annotations (<code>@Autowired</code>) the default mode is <b>by type</b>: Spring finds the bean assignable to the parameter type. If exactly one candidate exists it is injected; none → <code>NoSuchBeanDefinitionException</code> (unless optional); several → <code>NoUniqueBeanDefinitionException</code> unless disambiguated.<br>
• <code>@Autowired</code> works on constructors, setters, fields and methods; collections/maps inject <b>all</b> beans of a type (<code>List&lt;PaymentProcessor&gt;</code>, <code>Map&lt;String, PaymentProcessor&gt;</code> keyed by bean name); processed by <code>AutowiredAnnotationBeanPostProcessor</code>. XML modes: <code>no</code>, <code>byName</code>, <code>byType</code>, <code>constructor</code>.`,
          `interface PaymentProcessor { String type(); void pay(Money m); }
@Component class UpiProcessor implements PaymentProcessor { public String type() { return "UPI"; } public void pay(Money m) {} }
@Component class CardProcessor implements PaymentProcessor { public String type() { return "CARD"; } public void pay(Money m) {} }

@Service
class CheckoutService {
    private final List<PaymentProcessor> all;                       // ALL implementations
    private final Map<String, PaymentProcessor> byBeanName;         // key = bean name (upiProcessor, cardProcessor)

    CheckoutService(List<PaymentProcessor> all, Map<String, PaymentProcessor> byBeanName) {
        this.all = all; this.byBeanName = byBeanName;
    }
    void pay(String type, Money m) { all.stream().filter(p -> p.type().equals(type)).findFirst().orElseThrow().pay(m); }
}
// A single PaymentProcessor parameter would now FAIL: NoUniqueBeanDefinitionException (two candidates)`,
        ),
      ],
      [
        blk(`<h3>@Qualifier, @Primary and name-based resolution</h3>
• Several candidates of one type need disambiguation. <b><code>@Primary</code></b> marks the <b>default</b> candidate (on the bean class or <code>@Bean</code> method). <b><code>@Qualifier("name")</code></b> at the <b>injection point</b> chooses a specific bean (by bean name or by qualifier label on the bean). <code>@Qualifier</code> <b>wins over</b> <code>@Primary</code>.<br>
• Resolution order for an injection point: (1) candidates by <b>type</b> (including generics); (2) if several: <code>@Qualifier</code>; (3) <code>@Primary</code>; (4) highest <code>@Priority</code> (<code>jakarta.annotation.Priority</code>); (5) fall back to matching the <b>parameter/field name</b> to a bean name (works if compiled with <code>-parameters</code>, default in Boot/Maven plugin). Otherwise an exception.<br>
• <b>Custom qualifier annotations</b> (meta-annotated with <code>@Qualifier</code>) give typed, refactoring-safe labels.`,
          `@Component @Primary class UpiProcessor implements PaymentProcessor { ... }             // default choice
@Component @Qualifier("card") class CardProcessor implements PaymentProcessor { ... }

@Service
class RefundService {
    private final PaymentProcessor defaultProcessor;
    private final PaymentProcessor cardProcessor;
    RefundService(PaymentProcessor defaultProcessor,                           // gets UpiProcessor (@Primary)
                  @Qualifier("card") PaymentProcessor cardProcessor) {         // @Qualifier overrides the default
        this.defaultProcessor = defaultProcessor; this.cardProcessor = cardProcessor;
    }
}

// Custom qualifier annotation
@Target({FIELD, PARAMETER, TYPE, METHOD}) @Retention(RUNTIME) @Qualifier
@interface Fast {}
@Component @Fast class InMemoryCache implements Cache { }
@Service class Lookup { Lookup(@Fast Cache cache) { } }`,
        ),
      ],
      [
        blk(`<h3>@Resource, @Inject and dependency resolution</h3>
<table ${TABLE}>
<tr><th></th><th><code>@Autowired</code> (Spring)</th><th><code>@Inject</code> (JSR-330 / Jakarta)</th><th><code>@Resource</code> (JSR-250 / Jakarta)</th></tr>
<tr><td>Resolution</td><td>By <b>type</b>, then qualifier/primary/name</td><td>By <b>type</b>, then <code>@Named</code></td><td>By <b>name</b> first (field/setter name or <code>name=</code>), then type</td></tr>
<tr><td>Optional</td><td><code>required=false</code></td><td>Use <code>Optional</code>/<code>Provider</code></td><td>—</td></tr>
<tr><td>Targets</td><td>constructor, method, field, parameter</td><td>constructor, method, field</td><td>field, setter (not constructors)</td></tr>
<tr><td>Qualifier</td><td><code>@Qualifier</code></td><td><code>@Named</code>/<code>@Qualifier</code></td><td><code>name</code></td></tr>
</table>
• Prefer <code>@Autowired</code> (or implicit constructor injection) in Spring code; <code>@Inject</code> keeps code container-neutral (<code>jakarta.inject</code> dependency); <code>@Resource</code> is handy for name-based lookup of a specific bean. Processed by <code>AutowiredAnnotationBeanPostProcessor</code> and <code>CommonAnnotationBeanPostProcessor</code>.<br>
• <b>Debugging dependency resolution</b>: read the exception (it lists candidates), enable <code>logging.level.org.springframework.beans=DEBUG</code>, inspect <code>ctx.getBeanNamesForType(X.class)</code>, check scanning packages and profiles/conditions.`,
          `@Component
class Reports {
    @Resource(name = "cardProcessor")  private PaymentProcessor viaName;           // by bean name
    @Inject @Named("upiProcessor")     private PaymentProcessor viaInject;         // JSR-330
    @Autowired                         private PaymentProcessor viaType;           // by type (@Primary decides)
}

// Which beans match a type?
String[] names = ctx.getBeanNamesForType(PaymentProcessor.class);                   // [upiProcessor, cardProcessor]
ResolvableType t = ResolvableType.forClassWithGenerics(Repository.class, Course.class);
String[] generic = ctx.getBeanNamesForType(t);                                       // matches Repository<Course> only`,
        ),
      ],
      [
        ['@Autowired vs @Qualifier vs @Primary?', '@Autowired injects by type; when several beans match, @Primary marks the default candidate and @Qualifier at the injection point selects a specific one, overriding @Primary.'],
        ['How does Spring resolve a dependency?', 'It finds candidates by type, then narrows using @Qualifier, @Primary, @Priority and finally the injection point name matching a bean name; zero or ambiguous matches cause an exception unless optional.'],
        ['@Autowired vs @Resource vs @Inject?', '@Autowired is Spring\'s by-type injection with required/qualifier support; @Inject is the JSR-330 equivalent; @Resource resolves by name first and works on fields and setters but not constructors.'],
      ],
    ),
    topic(
      'sc-optional-circular-lazy',
      'Optional Dependencies, Circular Dependencies and Lazy Dependency Resolution',
      [
        blk(`<h3>Optional dependencies</h3>
• A mandatory dependency that is missing fails at startup (good: fail fast). For truly optional ones: <code>@Autowired(required = false)</code>, a parameter of type <code>Optional&lt;T&gt;</code>, <code>@Nullable</code>, <code>ObjectProvider&lt;T&gt;</code> (<code>getIfAvailable()</code>, <code>getIfUnique()</code>, <code>ifAvailable(...)</code>, <code>stream()</code>), or an empty collection injected when no beans exist.`,
          `@Service
class AuditService {
    private final Optional<MetricsRecorder> metrics;                  // optional collaborator
    private final ObjectProvider<AlertSender> alerts;                 // resolved lazily, may be absent
    AuditService(Optional<MetricsRecorder> metrics, ObjectProvider<AlertSender> alerts) { this.metrics = metrics; this.alerts = alerts; }

    void record(String event) {
        metrics.ifPresent(m -> m.count(event));
        alerts.ifAvailable(a -> a.send(event));                       // no error if no AlertSender bean exists
    }
}`,
        ),
      ],
      [
        blk(`<h3>Circular dependencies</h3>
• A <b>circular dependency</b>: <code>A</code> needs <code>B</code> and <code>B</code> needs <code>A</code>. <b>Constructor injection fails fast</b>: <code>BeanCurrentlyInCreationException</code> (the object cannot be built because each needs the other first). Setter/field injection of singletons used to work through <b>early references</b> (a three-level cache: singleton objects, early singleton objects, singleton factories), hiding the design smell; <b>Spring Boot 2.6+ prohibits circular references by default</b> (<code>spring.main.allow-circular-references=false</code>).<br>
• <b>Fix by design</b>: extract the shared logic into a third bean both depend on, invert one dependency using an <b>interface/event</b> (<code>ApplicationEventPublisher</code>), move behaviour so the dependency flows one way (layers), or merge classes that are really one.<br>
• <b>Workarounds</b> (last resort): <code>@Lazy</code> on one injection point (injects a lazy-resolution proxy), setter injection, <code>ObjectProvider</code>/<code>Provider</code> resolved at call time, <code>@PostConstruct</code> lookups.`,
          `@Service class OrderService { OrderService(InventoryService inventory) {} }
@Service class InventoryService { InventoryService(OrderService orders) {} }
// BeanCurrentlyInCreationException: Requested bean is currently in creation: Is there an unresolvable circular reference?

// Fix 1 (design): break the cycle with a third bean / event
@Service class StockLevels { /* the shared logic both need */ }
@Service class OrderService { OrderService(StockLevels stock) {} }
@Service class InventoryService { InventoryService(StockLevels stock) {} }

// Fix 2 (workaround): lazy proxy at one injection point
@Service class OrderService { OrderService(@Lazy InventoryService inventory) {} }      // resolved on first use

// Fix 3: invert with an event
@Service class OrderService { void place(Order o) { publisher.publishEvent(new OrderPlaced(o)); } }
@Service class InventoryService { @EventListener void on(OrderPlaced e) { reserve(e.order()); } }`,
        ),
      ],
      [
        blk(`<h3>Lazy dependency resolution</h3>
• <b><code>@Lazy</code></b> on a bean definition delays <b>creation</b> until first use (faster startup, but errors appear later); on an <b>injection point</b> it injects a <b>proxy</b> that resolves the real bean on the first method call: useful for breaking cycles, expensive beans, optional features.<br>
• <b><code>ObjectProvider&lt;T&gt;</code></b> / <code>jakarta.inject.Provider</code> / <code>ObjectFactory</code> give explicit control: each <code>getObject()</code> call can return a <b>new prototype</b> instance or the current scoped bean, which solves the <b>scoped bean in singleton</b> problem (injecting a prototype or request-scoped bean into a singleton otherwise freezes one instance).<br>
• Global lazy initialisation: <code>spring.main.lazy-initialization=true</code> (Boot) trades startup time for first-request latency and late failures: be careful in production.`,
          `@Component @Scope("prototype") class ReportBuilder { /* stateful: a fresh instance per report */ }

@Service
class ReportService {
    private final ObjectProvider<ReportBuilder> builders;            // not the builder itself
    ReportService(ObjectProvider<ReportBuilder> builders) { this.builders = builders; }
    Report build() { return builders.getObject().withTitle("Monthly").build(); }      // a NEW prototype every call
}

@Configuration
class ExpensiveConfig {
    @Bean @Lazy ModelClient modelClient() { return new ModelClient(); }               // created only if actually used
}
@Service class Lookup { Lookup(@Lazy ModelClient client) { } }                          // proxy until first call`,
        ),
      ],
      [
        ['What is a circular dependency and how does Spring handle it?', 'Two or more beans depend on each other. Constructor injection fails with BeanCurrentlyInCreationException; setter/field cycles were once resolved via early references, but Boot 2.6+ forbids them by default. Fix by redesigning (third bean, events) or as a last resort use @Lazy.'],
        ['What does @Lazy do?', 'On a bean definition it defers instantiation until first use; on an injection point it injects a lazy-resolution proxy. It is used to speed startup, delay expensive beans and break cycles.'],
        ['How do you inject a prototype bean into a singleton correctly?', 'Inject an ObjectProvider/Provider (or use a scoped proxy or lookup method) and call getObject() each time, instead of injecting the prototype directly, which would be created only once.'],
      ],
    ),
  ]),

  sc(3, 'Spring Beans', 'Essential', [
    topic(
      'sc-bean-definition-registration',
      'What Is a Bean: Definition, Registration, Instantiation and Naming',
      [
        blk(`<h3>What is a Spring bean?</h3>
• A <b>bean</b> is an object that is <b>instantiated, assembled and managed by the Spring IoC container</b>. Any class can be a bean (a POJO); what makes it a bean is that the container created it from a <b>bean definition</b>. Objects you create with <code>new</code> yourself are <b>not</b> beans (no injection, no AOP).<br>
• A <b><code>BeanDefinition</code></b> is the recipe: class name, scope, constructor arguments and property values, dependencies (<code>depends-on</code>), lazy flag, init/destroy method names, primary/autowire candidate flags, factory method. The <b>registry</b> (<code>BeanDefinitionRegistry</code>, i.e. the bean factory) stores definitions by <b>bean name</b>.`,
          `// Registering beans programmatically (what @Component scanning and @Bean do for you)
GenericApplicationContext ctx = new GenericApplicationContext();
ctx.registerBean("clock", Clock.class, Clock::systemUTC);
ctx.registerBean(CourseService.class, bd -> { bd.setLazyInit(true); bd.setScope("singleton"); });
ctx.registerBeanDefinition("mailer", BeanDefinitionBuilder.genericBeanDefinition(SmtpMailer.class)
        .addConstructorArgValue("smtp.javaschoollab.com").setInitMethodName("connect").getBeanDefinition());
ctx.refresh();
System.out.println(ctx.getBean("mailer"));`,
        ),
      ],
      [
        blk(`<h3>Bean registration, instantiation and naming</h3>
• <b>Registration</b> happens through: <code>@Component</code> scanning, <code>@Bean</code> methods in <code>@Configuration</code> classes, <code>@Import</code> (classes, <code>ImportSelector</code>, <code>ImportBeanDefinitionRegistrar</code>), XML <code>&lt;bean&gt;</code>, and programmatic <code>registerBean</code>. <b>Instantiation</b> ways: <b>constructor</b> (default), <b>static factory method</b>, <b>instance factory method</b> (<code>@Bean</code> methods are factory methods), and <code>FactoryBean</code>.<br>
• <b>Naming</b>: scanned components get a default name = decapitalised class name (<code>CourseService</code> → <code>courseService</code>; <code>URLService</code> → <code>URLService</code>); <code>@Bean</code> method name is the bean name; explicit names via <code>@Component("name")</code>, <code>@Bean("name")</code>/<code>name={...}</code> (aliases), or a custom <code>BeanNameGenerator</code>. Names must be unique in a context (overriding is disabled by default in Boot).`,
          `@Component class CourseService { }                       // bean name: courseService
@Service("billing") class BillingService { }              // bean name: billing
@Configuration class AppConfig {
    @Bean                       Clock clock() { return Clock.systemUTC(); }                            // name: clock
    @Bean("mailer")             Mailer smtp() { return new SmtpMailer(); }                            // name: mailer
    @Bean(name = {"cache", "primaryCache"}) Cache cache() { return new CaffeineCache(); }              // name + alias
    @Bean static BeanFactoryPostProcessor bfpp() { return bf -> {}; }                                  // static: created early, before the config class
}

ctx.getBean("billing");  ctx.getBean("primaryCache");  ctx.getAliases("cache");
// Factory method instantiation
class ClockFactory { static Clock create() { return Clock.systemUTC(); } }
// <bean id="clock" class="ClockFactory" factory-method="create"/>`,
        ),
      ],
      [
        blk(`<h3>Initialisation and destruction at a glance</h3>
• After instantiation and dependency injection a bean is <b>initialised</b> (init callbacks, then post-processors such as AOP proxy creation) and is ready for use; at shutdown it is <b>destroyed</b> (destroy callbacks) in reverse dependency order. The full ordered lifecycle is covered in the Bean Lifecycle section.<br>
• Quick summary: <b>constructor → dependencies injected → aware callbacks → BeanPostProcessor.before → <code>@PostConstruct</code> → <code>afterPropertiesSet</code> → custom init → BeanPostProcessor.after (proxies) → ready → <code>@PreDestroy</code> → <code>destroy</code> → custom destroy</b>.<br>
• Singleton beans are created at startup; prototype beans are created on each request and <b>Spring does not call their destroy callbacks</b> (the caller owns them).`,
          `@Component
class ConnectionPool {
    ConnectionPool() { log.info("1. constructor"); }
    @PostConstruct void start() { log.info("2. @PostConstruct: open connections"); }
    @PreDestroy void stop() { log.info("3. @PreDestroy: close connections"); }
}
// @Bean(initMethod = "connect", destroyMethod = "disconnect") for third-party classes you cannot annotate`,
        ),
      ],
      [
        ['What is a Spring bean?', 'An object instantiated, wired and managed by the Spring IoC container from a bean definition; objects created with new outside the container are not beans.'],
        ['What is a BeanDefinition?', 'The metadata describing how to create a bean: class, scope, constructor args/properties, dependencies, lazy flag, init/destroy methods and factory details, stored in the container\'s registry.'],
        ['How are default bean names generated?', 'For scanned stereotypes the simple class name with a lowercase first letter (courseService); for @Bean methods the method name; explicit names can be set in the annotation or via a BeanNameGenerator.'],
      ],
    ),
    topic(
      'sc-bean-scopes',
      'Bean Scopes: Singleton, Prototype, Request, Session, Application and Custom',
      [
        blk(`<h3>Singleton and prototype</h3>
• <b>singleton</b> (default): <b>one shared instance per container</b> (not per JVM and not the GoF singleton: per bean definition per context). Created eagerly at startup, cached, destroyed on shutdown. Must be <b>thread-safe and stateless</b> (or carefully synchronised): most services, repositories and controllers.<br>
• <b>prototype</b>: a <b>new instance on every request</b> to the container (<code>getBean</code> or injection). Spring creates and wires it but does <b>not manage its destruction</b> (no <code>@PreDestroy</code>). Use for stateful, short-lived objects (builders, command objects).`,
          `@Component                                        // default scope: singleton
class CourseCatalogue { }

@Component @Scope("prototype")                    // or @Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
class ImportJob { private int processed; }        // per-use state

ApplicationContext ctx = ...;
System.out.println(ctx.getBean(CourseCatalogue.class) == ctx.getBean(CourseCatalogue.class));   // true
System.out.println(ctx.getBean(ImportJob.class) == ctx.getBean(ImportJob.class));               // false`,
        ),
      ],
      [
        blk(`<h3>Web scopes: request, session, application (and websocket)</h3>
• Available only in a <b>web-aware</b> <code>ApplicationContext</code>: <b>request</b> (one instance per HTTP request), <b>session</b> (per HTTP session: e.g. a shopping cart, user preferences; remember it must be <code>Serializable</code> for clustering), <b>application</b> (per <code>ServletContext</code>, shared by the whole web app: like a singleton but bound to the servlet context), <b>websocket</b> (per WebSocket session). Shortcuts: <code>@RequestScope</code>, <code>@SessionScope</code>, <code>@ApplicationScope</code>.<br>
• <b>Scoped proxies</b>: injecting a request/session bean into a singleton needs a proxy (<code>proxyMode = ScopedProxyMode.TARGET_CLASS</code>, which the shortcut annotations set) so each call is delegated to the instance of the <b>current</b> request/session. Without it injection fails (no scope active at startup) or freezes one instance.`,
          `@Component @RequestScope                                  // proxyMode = TARGET_CLASS by default
class RequestContext {
    private final String requestId = UUID.randomUUID().toString();  // unique per HTTP request
    String requestId() { return requestId; }
}

@Component @SessionScope
class ShoppingCart implements Serializable {
    private final List<CartItem> items = new ArrayList<>();
    void add(CartItem i) { items.add(i); }
}

@RestController
class CartController {                                             // singleton controller...
    private final ShoppingCart cart;                                // ...holds a CLIENT PROXY: each call hits the current session's cart
    CartController(ShoppingCart cart) { this.cart = cart; }
    @PostMapping("/cart") void add(@RequestBody CartItem i) { cart.add(i); }
}

@Component @ApplicationScope class VisitorCounter { final AtomicLong count = new AtomicLong(); }`,
        ),
      ],
      [
        blk(`<h3>Custom bean scopes and the scoped-bean problem</h3>
• Implement <b><code>Scope</code></b> (<code>get(name, ObjectFactory)</code>, <code>remove</code>, <code>registerDestructionCallback</code>, <code>getConversationId</code>) and register with <code>ConfigurableBeanFactory.registerScope("tenant", scope)</code> (or a <code>CustomScopeConfigurer</code> bean). Spring ships <code>SimpleThreadScope</code> (a bean per thread; not registered by default), and Spring Cloud adds <code>refresh</code>. Typical custom scopes: per-tenant, per-thread, per-conversation, per-workflow.<br>
<table ${TABLE}>
<tr><th>Scope</th><th>Instances</th><th>Destroy callbacks</th><th>Thread-safety needed?</th></tr>
<tr><td>singleton</td><td>1 per container</td><td>Yes</td><td><b>Yes</b></td></tr>
<tr><td>prototype</td><td>1 per request to the container</td><td><b>No</b></td><td>Not shared</td></tr>
<tr><td>request / session / application</td><td>per request / session / servlet context</td><td>Yes (request, session)</td><td>session and application: yes</td></tr>
<tr><td>custom (tenant, thread)</td><td>as you define</td><td>If you register callbacks</td><td>Depends</td></tr>
</table>
• <b>Singleton depending on a shorter scope</b>: use <code>ObjectProvider</code>, a scoped proxy, or a <code>@Lookup</code> method; never inject the short-lived bean directly without a proxy.`,
          `// Thread-per-bean scope
class TenantScope implements Scope {
    private final ThreadLocal<Map<String, Object>> beans = ThreadLocal.withInitial(HashMap::new);
    public Object get(String name, ObjectFactory<?> factory) { return beans.get().computeIfAbsent(name, k -> factory.getObject()); }
    public Object remove(String name) { return beans.get().remove(name); }
    public void registerDestructionCallback(String name, Runnable cb) { /* run cb when the tenant context ends */ }
    public Object resolveContextualObject(String key) { return null; }
    public String getConversationId() { return TenantContext.current(); }
}

@Configuration
class ScopeConfig {
    @Bean static CustomScopeConfigurer scopes() { var c = new CustomScopeConfigurer(); c.addScope("tenant", new TenantScope()); return c; }
}
@Component @Scope(value = "tenant", proxyMode = ScopedProxyMode.TARGET_CLASS) class TenantSettings { }

// @Lookup alternative: Spring generates the method body to fetch a fresh prototype
@Component abstract class JobRunner { @Lookup abstract ImportJob newJob(); void run() { newJob().execute(); } }`,
        ),
      ],
      [
        ['What are the bean scopes in Spring?', 'singleton (default, one per container), prototype (new per request), and in web contexts request, session, application and websocket; custom scopes can be registered by implementing Scope.'],
        ['Singleton scope vs the Singleton design pattern?', 'Spring\'s singleton means one instance per bean definition per ApplicationContext, not one per JVM or classloader, and it is not enforced by a private constructor; two contexts can each have their own instance.'],
        ['How do you use a request-scoped bean inside a singleton?', 'Inject it through a scoped proxy (the @RequestScope annotation does this) or an ObjectProvider, so each call resolves the instance for the current request rather than a single frozen one.'],
      ],
    ),
    topic(
      'sc-bean-init-destroy-overview',
      'Bean Initialisation and Destruction: Hooks and Choosing One',
      [
        blk(`<h3>Initialisation hooks</h3>
• Three standard ways to run code after dependency injection: <b><code>@PostConstruct</code></b> (Jakarta annotation: preferred, no Spring dependency), <b><code>InitializingBean.afterPropertiesSet()</code></b> (Spring interface), and a <b>custom init method</b> (<code>@Bean(initMethod = "...")</code> / XML <code>init-method</code>; for third-party classes). They run in that order for the same bean. Use init for validation of required state, opening resources, warming caches, registering with other components.<br>
• Do <b>not</b> use the constructor for work that needs injected collaborators (fields are not yet set unless constructor-injected) or that can fail; keep <code>@PostConstruct</code> <b>fast</b> (it delays startup) and avoid calling transactional/proxied methods of the same bean there (the proxy does not exist yet).`,
          `@Component
class SearchIndex implements InitializingBean, DisposableBean {
    private final CourseRepository repo; private Index index;
    SearchIndex(CourseRepository repo) { this.repo = repo; }

    @PostConstruct void warmUp()          { log.info("1. @PostConstruct"); }
    @Override public void afterPropertiesSet() { log.info("2. afterPropertiesSet: validate"); index = Index.open(); }
    void customInit()                     { log.info("3. custom init-method"); }

    @PreDestroy void flush()              { log.info("A. @PreDestroy"); }
    @Override public void destroy()       { log.info("B. DisposableBean.destroy"); index.close(); }
    void customDestroy()                  { log.info("C. custom destroy-method"); }
}
@Configuration class C { @Bean(initMethod = "customInit", destroyMethod = "customDestroy") SearchIndex searchIndex(CourseRepository r) { return new SearchIndex(r); } }`,
        ),
      ],
      [
        blk(`<h3>Destruction hooks and the shutdown order</h3>
• On context close (<code>ctx.close()</code>, a JVM shutdown hook registered by Boot, or <code>SIGTERM</code>): beans are destroyed in <b>reverse dependency order</b> (a bean is destroyed before the beans it depends on). Hooks: <code>@PreDestroy</code> → <code>DisposableBean.destroy()</code> → custom destroy method. <b>Inferred destroy methods</b>: for <code>@Bean</code> methods Spring automatically calls a public no-arg <code>close()</code> or <code>shutdown()</code> if present (disable with <code>destroyMethod = ""</code> when the container must not close a shared resource).<br>
• <b>Prototype beans are never destroyed by Spring</b>; the caller must release resources. Beans may not get destroy callbacks if the JVM is killed (<code>kill -9</code>) or the context is never closed (<code>registerShutdownHook()</code> in plain Java apps).`,
          `public static void main(String[] args) {
    var ctx = new AnnotationConfigApplicationContext(AppConfig.class);
    ctx.registerShutdownHook();                      // plain Java: close the context on JVM exit (Boot does this for you)
    // ... application runs ...
}

@Bean(destroyMethod = "")                              // the DataSource is shared and closed elsewhere: tell Spring not to infer close()
DataSource sharedDs() { return jndiLookup(); }

// Graceful shutdown in Boot: server.shutdown=graceful, spring.lifecycle.timeout-per-shutdown-phase=30s`,
        ),
      ],
      [
        blk(`<h3>Choosing between @PostConstruct, InitializingBean and init-method</h3>
<table ${TABLE}>
<tr><th>Option</th><th>When</th><th>Notes</th></tr>
<tr><td><code>@PostConstruct</code> / <code>@PreDestroy</code></td><td>Your own classes (default choice)</td><td>No Spring coupling; needs <code>jakarta.annotation</code>; processed by <code>CommonAnnotationBeanPostProcessor</code></td></tr>
<tr><td><code>InitializingBean</code> / <code>DisposableBean</code></td><td>Framework-style code</td><td>Couples the class to Spring</td></tr>
<tr><td><code>@Bean(initMethod/destroyMethod)</code></td><td>Third-party classes you cannot modify</td><td>Explicit and visible in config</td></tr>
<tr><td><code>SmartLifecycle</code></td><td>Start/stop ordering, background workers, after all beans are ready</td><td>Phases and async stop (see lifecycle section)</td></tr>
<tr><td><code>ApplicationRunner</code> / <code>CommandLineRunner</code> / <code>ApplicationReadyEvent</code></td><td>Work after the application is fully started (Boot)</td><td>Run data loaders here, not in @PostConstruct</td></tr>
</table>`),
      ],
      [
        ['In what order do initialisation callbacks run?', '@PostConstruct, then InitializingBean.afterPropertiesSet, then the custom init-method; BeanPostProcessor before/after hooks surround them. Destruction: @PreDestroy, DisposableBean.destroy, custom destroy-method.'],
        ['Does Spring call @PreDestroy on prototype beans?', 'No. Spring creates and wires prototype beans but does not manage their destruction; the client code must clean them up.'],
        ['Why avoid heavy work in @PostConstruct?', 'It runs during context startup and delays or fails the whole application; for non-essential work use ApplicationReadyEvent, a runner or SmartLifecycle after the context is ready.'],
      ],
    ),
  ]),

  sc(4, 'Spring Configuration', 'Core', [
    topic(
      'sc-config-styles',
      'XML, Annotation-Based and Java-Based Configuration',
      [
        blk(`<h3>The three configuration styles</h3>
• <b>XML-based</b> (original): <code>&lt;beans&gt;</code> with <code>&lt;bean id class&gt;</code>, <code>&lt;constructor-arg&gt;</code>, <code>&lt;property&gt;</code>, <code>&lt;import resource&gt;</code>, <code>&lt;context:component-scan&gt;</code>, <code>&lt;context:property-placeholder&gt;</code>. Externalises wiring from code; verbose; still found in legacy systems; loaded with <code>ClassPathXmlApplicationContext</code>.<br>
• <b>Annotation-based</b>: stereotypes (<code>@Component</code> ...) discovered by <b>component scanning</b>, wired with <code>@Autowired</code>/<code>@Value</code>; concise; configuration lives next to the code.<br>
• <b>Java-based</b> (modern, recommended for infrastructure): <code>@Configuration</code> classes with <code>@Bean</code> factory methods; type-safe, refactorable, debuggable, with full Java logic and conditions. Most real apps combine annotation scanning for your classes and Java config for third-party/infrastructure beans.`,
          `<!-- 1. XML: beans.xml -->
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context" ...>
  <context:property-placeholder location="classpath:app.properties"/>
  <bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
      <property name="jdbcUrl" value="\${db.url}"/>
      <property name="username" value="\${db.user}"/>
  </bean>
  <bean id="courseRepository" class="com.jsl.JdbcCourseRepository"><constructor-arg ref="dataSource"/></bean>
  <bean id="courseService" class="com.jsl.CourseService" scope="singleton" init-method="init">
      <constructor-arg ref="courseRepository"/>
  </bean>
</beans>
// new ClassPathXmlApplicationContext("beans.xml");

// 2. Annotation-based
@Repository class JdbcCourseRepository { JdbcCourseRepository(DataSource ds) {} }
@Service class CourseService { CourseService(CourseRepository repo) {} }
// <context:component-scan base-package="com.jsl"/>   or   @ComponentScan("com.jsl")

// 3. Java-based
@Configuration
class InfraConfig {
    @Bean HikariDataSource dataSource(@Value("\${db.url}") String url) { var ds = new HikariDataSource(); ds.setJdbcUrl(url); return ds; }
}`,
        ),
      ],
      [
        blk(`<h3>Comparing the styles</h3>
<table ${TABLE}>
<tr><th></th><th>XML</th><th>Annotations (scanning)</th><th>Java config</th></tr>
<tr><td>Type safety / refactoring</td><td>No (strings)</td><td>Yes</td><td><b>Yes</b></td></tr>
<tr><td>Separation from code</td><td><b>Complete</b> (change without recompiling)</td><td>Configuration is in the classes</td><td>Separate classes, compiled</td></tr>
<tr><td>Third-party classes</td><td>Yes</td><td>No (cannot annotate)</td><td><b>Yes</b></td></tr>
<tr><td>Conditional logic</td><td>Limited (profiles)</td><td><code>@Conditional</code>, <code>@Profile</code></td><td>Full Java + conditions</td></tr>
<tr><td>Verbosity</td><td>High</td><td><b>Low</b></td><td>Medium</td></tr>
<tr><td>Typical use today</td><td>Legacy systems</td><td>Application classes</td><td>Infrastructure, library config</td></tr>
</table>
• Mix them: <code>@ImportResource("classpath:legacy-beans.xml")</code> in a Java config pulls XML beans in; <code>&lt;context:annotation-config/&gt;</code> enables annotations in XML.`,
          `@Configuration
@ComponentScan(basePackages = "com.javaschoollab")              // annotation-based discovery
@ImportResource("classpath:legacy-beans.xml")                    // reuse existing XML definitions
@PropertySource("classpath:app.properties")
class RootConfig { }`,
        ),
      ],
      [
        blk(`<h3>Choosing and migrating configuration styles</h3>
• <b>Recommendation</b>: scan your own application classes (<code>@Service</code>, <code>@Repository</code>), use <code>@Configuration</code> for infrastructure and third-party beans, keep XML only for legacy modules and import it with <code>@ImportResource</code>. <b>Migration path</b>: wrap XML in an <code>@ImportResource</code>, replace beans one by one with annotations or <code>@Bean</code>, then delete the XML. Keep configuration <b>declarative</b> (no business logic in <code>@Configuration</code> classes) and split large configs by concern (<code>WebConfig</code>, <code>DataConfig</code>, <code>SecurityConfig</code>).`,
          `// Step 1: legacy XML still works
@Configuration @ImportResource("classpath:legacy-beans.xml") class LegacyBridge {}
// Step 2: replace one XML bean with Java config, delete it from the XML
@Configuration class MigratedConfig { @Bean PdfRenderer pdfRenderer() { return new ITextPdfRenderer(); } }
// Step 3: finally remove the XML and @ImportResource`,
        ),
      ],
      [
        ['XML vs annotation vs Java configuration?', 'XML is external and verbose (legacy); annotations with component scanning are concise for your own classes; Java @Configuration/@Bean is type-safe and ideal for third-party and infrastructure beans. They can be mixed in one context.'],
        ['How do you use legacy XML beans in a Java-config application?', 'Add @ImportResource("classpath:beans.xml") to a @Configuration class so the XML definitions are loaded into the same context.'],
        ['Which configuration style does Spring Boot prefer?', 'Java-based @Configuration with annotation scanning and auto-configuration; XML is supported but rarely needed.'],
      ],
    ),
    topic(
      'sc-config-annotations',
      '@Configuration, @Bean, @Component, @ComponentScan, @Import and @ImportResource',
      [
        blk(`<h3>@Configuration and @Bean</h3>
• <b><code>@Configuration</code></b> marks a class as a source of bean definitions; <b><code>@Bean</code></b> methods are <b>factory methods</b>: the return value is registered as a bean named after the method. Parameters are injected by type (so <code>@Bean</code> methods can depend on each other through parameters).<br>
• <b>Full vs lite mode</b>: in a <code>@Configuration</code> class (CGLIB-<b>enhanced</b>) calls between <code>@Bean</code> methods are <b>intercepted</b> so they return the <b>same singleton</b> ("inter-bean references"). In a plain <code>@Component</code> class (lite mode) or with <code>@Configuration(proxyBeanMethods = false)</code> the calls are ordinary Java calls and create new objects: prefer <b>parameter injection</b> (works in both and is faster at startup).<br>
• <code>@Bean</code> attributes: <code>name</code>, <code>initMethod</code>, <code>destroyMethod</code>; companions <code>@Scope</code>, <code>@Lazy</code>, <code>@Primary</code>, <code>@Qualifier</code>, <code>@Profile</code>, <code>@Conditional</code>, <code>@DependsOn</code>.`,
          `@Configuration
class WebConfig {
    @Bean
    ObjectMapper objectMapper() { return new ObjectMapper().registerModule(new JavaTimeModule()); }

    @Bean
    CourseClient courseClient(ObjectMapper mapper, @Value("\${catalogue.url}") String url) {        // dependencies as parameters
        return new CourseClient(url, mapper);
    }

    @Bean @Scope("prototype") @Lazy
    ReportBuilder reportBuilder() { return new ReportBuilder(); }

    @Bean
    Clock clock() { return Clock.systemUTC(); }

    @Bean
    TimeService timeService() { return new TimeService(clock()); }          // inter-bean call: returns the SAME Clock singleton (full mode)
}

@Configuration(proxyBeanMethods = false)                                      // lite mode: no CGLIB subclass, faster; use parameter injection
class FastConfig { @Bean TimeService t(Clock clock) { return new TimeService(clock); } }`,
        ),
      ],
      [
        blk(`<h3>@Component, @ComponentScan and @Import</h3>
• <b><code>@Component</code></b> (and stereotypes) marks a class for <b>auto-detection</b>; <b><code>@ComponentScan(basePackages | basePackageClasses | includeFilters | excludeFilters)</code></b> tells the container where to scan (in Boot, <code>@SpringBootApplication</code> scans its own package and subpackages: keep the main class in the root package). Prefer <code>basePackageClasses</code> (type-safe).<br>
• <b><code>@Import</code></b> registers other configuration: <code>@Configuration</code> classes, plain component classes, <b><code>ImportSelector</code></b> (returns class names to import: used by <code>@EnableXxx</code> and Boot's auto-configuration) and <b><code>ImportBeanDefinitionRegistrar</code></b> (registers bean definitions programmatically). Custom <code>@EnableXxx</code> annotations are <code>@Import</code> meta-annotations.<br>
• <b><code>@ImportResource</code></b> loads XML (or Groovy) bean definitions.`,
          `@Configuration
@ComponentScan(basePackageClasses = {CatalogueModule.class, LearningModule.class},
               excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = LegacyService.class))
@Import({SecurityConfig.class, MetricsConfig.class})
@ImportResource("classpath:legacy-beans.xml")
class AppConfig { }

// ImportSelector: choose configurations dynamically (how @EnableXxx works)
class CacheSelector implements ImportSelector {
    @Override public String[] selectImports(AnnotationMetadata meta) {
        boolean redis = (boolean) meta.getAnnotationAttributes(EnableAppCache.class.getName()).get("redis");
        return new String[] { redis ? RedisCacheConfig.class.getName() : CaffeineCacheConfig.class.getName() };
    }
}
@Retention(RUNTIME) @Import(CacheSelector.class) @interface EnableAppCache { boolean redis() default false; }

@Configuration @EnableAppCache(redis = true) class Cfg { }`,
        ),
      ],
      [
        blk(`<h3>ImportBeanDefinitionRegistrar and meta-annotations</h3>
• <code>ImportBeanDefinitionRegistrar.registerBeanDefinitions(metadata, registry)</code> registers definitions imperatively; this is how <code>@EnableJpaRepositories</code>, <code>@MapperScan</code> (MyBatis) and Feign's <code>@EnableFeignClients</code> create beans for every annotated interface. Combine with <code>ClassPathScanningCandidateComponentProvider</code> to scan.<br>
• <b>Meta-annotations</b>: build your own composed annotations (<code>@Service</code> is meta-annotated with <code>@Component</code>); Spring's <code>AnnotatedElementUtils</code>/<code>MergedAnnotations</code> look through meta-annotation layers, so a custom <code>@UseCase</code> annotation can carry <code>@Service</code> + <code>@Transactional</code>.`,
          `class HandlerRegistrar implements ImportBeanDefinitionRegistrar {
    @Override
    public void registerBeanDefinitions(AnnotationMetadata meta, BeanDefinitionRegistry registry) {
        var scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(CommandHandler.class));
        for (BeanDefinition candidate : scanner.findCandidateComponents("com.javaschoollab.handlers")) {
            registry.registerBeanDefinition(StringUtils.uncapitalize(ClassUtils.getShortName(candidate.getBeanClassName())), candidate);
        }
    }
}
@Target(TYPE) @Retention(RUNTIME) @Import(HandlerRegistrar.class) @interface EnableCommandHandlers {}

// composed annotation
@Target(TYPE) @Retention(RUNTIME) @Service @Transactional
@interface UseCase {}
@UseCase class EnrollStudent { }                                    // a transactional service bean`,
        ),
      ],
      [
        ['What is the difference between @Component and @Bean?', '@Component marks your own class for auto-detection by scanning (class-level, container instantiates it); @Bean is a method-level factory in a @Configuration class, used for third-party classes or when you need custom construction logic.'],
        ['What does @Configuration do beyond @Component?', 'The class is enhanced with CGLIB so calls between @Bean methods are intercepted and return the managed singleton (inter-bean references); with proxyBeanMethods=false this is disabled for speed.'],
        ['How do @EnableXxx annotations work?', 'They are meta-annotated with @Import pointing to a configuration class, ImportSelector or ImportBeanDefinitionRegistrar that registers the infrastructure beans.'],
      ],
    ),
    topic(
      'sc-properties-environment',
      '@PropertySource, @Value, Environment, EnvironmentPostProcessor, Externalized and Profile-Based Configuration',
      [
        blk(`<h3>@PropertySource, @Value and Environment</h3>
• <b><code>@PropertySource("classpath:app.properties")</code></b> adds a properties file to the <code>Environment</code> (repeatable; <code>ignoreResourceNotFound</code>; YAML needs a custom factory in plain Spring: Boot loads YAML natively). <b><code>@Value("\${key:default}")</code></b> injects a property (resolved by a <code>PropertySourcesPlaceholderConfigurer</code>; <b>declare it as a static @Bean</b> in plain Spring; Boot does it for you) and supports <b>SpEL</b> (<code>#{...}</code>). <b><code>Environment</code></b> gives programmatic access: <code>getProperty(key, type, default)</code>, <code>getRequiredProperty</code>, <code>containsProperty</code>, <code>getActiveProfiles</code>, <code>acceptsProfiles(Profiles.of("dev"))</code>.`,
          `@Configuration
@PropertySource("classpath:app.properties")
@PropertySource(value = "file:/etc/jsl/override.properties", ignoreResourceNotFound = true)
class PropsConfig {
    @Bean static PropertySourcesPlaceholderConfigurer placeholders() { return new PropertySourcesPlaceholderConfigurer(); }
}

@Service
class MailService {
    private final String host; private final int port; private final List<String> admins; private final Duration timeout;
    MailService(@Value("\${mail.host:localhost}") String host,                       // default after ':'
                @Value("\${mail.port:25}") int port,                                  // type conversion
                @Value("#{'\${mail.admins}'.split(',')}") List<String> admins,        // SpEL on a placeholder
                @Value("\${mail.timeout:5s}") Duration timeout) { ... }
}

@Component class Diagnostics {
    Diagnostics(Environment env) {
        String url = env.getRequiredProperty("db.url");
        int retries = env.getProperty("db.retries", Integer.class, 3);
        boolean dev = env.acceptsProfiles(Profiles.of("dev | local"));
    }
}`,
        ),
      ],
      [
        blk(`<h3>EnvironmentPostProcessor and externalized configuration</h3>
• <b>Externalized configuration</b>: the same artifact runs everywhere; environment-specific values come from outside the code: property files, <b>environment variables</b>, <b>system properties</b> (<code>-Dkey=value</code>), command-line args, config servers, Kubernetes ConfigMaps/Secrets. Spring's <code>Environment</code> resolves them through ordered <b>property sources</b>.<br>
• <b><code>EnvironmentPostProcessor</code></b> (Spring Boot; registered in <code>META-INF/spring.factories</code>/<code>spring/...imports</code>) runs <b>before the context is refreshed</b> to customise the <code>Environment</code>: add property sources (a database/Vault source), compute derived properties, decrypt values, set default profiles. In plain Spring use an <code>ApplicationContextInitializer</code> or <code>context.getEnvironment().getPropertySources().addFirst(...)</code>.`,
          `public class VaultEnvironmentPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        String token = env.getProperty("vault.token");
        Map<String, Object> secrets = VaultClient.read(env.getProperty("vault.url"), token, "secret/catalogue");
        env.getPropertySources().addFirst(new MapPropertySource("vault", secrets));          // highest precedence
    }
}
// META-INF/spring.factories:
// org.springframework.boot.env.EnvironmentPostProcessor=com.javaschoollab.config.VaultEnvironmentPostProcessor

// Plain Spring equivalent
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
ctx.getEnvironment().getPropertySources().addFirst(new MapPropertySource("computed", Map.of("app.region", detectRegion())));
ctx.register(AppConfig.class); ctx.refresh();`,
        ),
      ],
      [
        blk(`<h3>Profile-based configuration (introduction)</h3>
• <b>Profiles</b> activate different beans/properties per environment: <b><code>@Profile("dev")</code></b> on classes or <code>@Bean</code> methods (expressions: <code>"!prod"</code>, <code>"dev | test"</code>, <code>"cloud & !local"</code>), activated by <code>spring.profiles.active</code> (<code>SPRING_PROFILES_ACTIVE</code>), <code>-Dspring.profiles.active=...</code>, <code>environment.setActiveProfiles(...)</code> or <code>@ActiveProfiles</code> in tests; <b>default profile</b> <code>default</code> applies when none is active. Boot adds <code>application-{profile}.properties|yml</code> and profile groups. Covered in depth in the Profiles and Properties section.`,
          `@Configuration
class DataConfig {
    @Bean @Profile("dev")  DataSource h2()       { return new EmbeddedDatabaseBuilder().setType(EmbeddedDatabaseType.H2).build(); }
    @Bean @Profile("prod") DataSource postgres(@Value("\${db.url}") String url) { var ds = new HikariDataSource(); ds.setJdbcUrl(url); return ds; }
    @Bean @Profile("!prod") MailSender logMailSender() { return m -> log.info("would send {}", m); }       // everything except prod
}`,
        ),
      ],
      [
        ['How does @Value work?', 'A BeanPostProcessor resolves placeholders (${key:default}) and SpEL (#{...}) against the Environment property sources and converts the result to the target type before injecting it.'],
        ['What is an EnvironmentPostProcessor?', 'A Spring Boot hook that runs before the application context is refreshed and can modify the Environment, for example adding a property source from Vault or computing defaults.'],
        ['@PropertySource vs Environment?', '@PropertySource adds a file to the Environment; the Environment is the abstraction through which all property sources and profiles are accessed (via @Value or programmatically).'],
      ],
    ),
  ]),

  sc(5, 'Stereotype Annotations', 'Core', [
    topic(
      'sc-stereotypes',
      '@Component, @Service, @Repository, @Controller, @RestController, @ControllerAdvice and Custom Stereotypes',
      [
        blk(`<h3>The stereotype annotations</h3>
<table ${TABLE}>
<tr><th>Annotation</th><th>Layer</th><th>Extra behaviour</th></tr>
<tr><td><code>@Component</code></td><td>Generic</td><td>Marks any managed bean (the base stereotype)</td></tr>
<tr><td><code>@Service</code></td><td>Business/service layer</td><td>No extra behaviour: a semantic marker (documentation, AOP pointcuts)</td></tr>
<tr><td><code>@Repository</code></td><td>Persistence layer</td><td>Enables <b>exception translation</b>: native persistence exceptions (<code>SQLException</code>, Hibernate/JPA) become Spring's <code>DataAccessException</code> hierarchy via <code>PersistenceExceptionTranslationPostProcessor</code></td></tr>
<tr><td><code>@Controller</code></td><td>Web layer (MVC)</td><td>Request handler detected by <code>RequestMappingHandlerMapping</code>; methods return view names</td></tr>
<tr><td><code>@RestController</code></td><td>Web layer (REST)</td><td><code>@Controller</code> + <code>@ResponseBody</code>: return values are written as JSON/XML</td></tr>
<tr><td><code>@ControllerAdvice</code> / <code>@RestControllerAdvice</code></td><td>Cross-cutting web</td><td>Global <code>@ExceptionHandler</code>, <code>@InitBinder</code>, <code>@ModelAttribute</code> for all (or selected) controllers</td></tr>
<tr><td><code>@Configuration</code></td><td>Configuration</td><td>Source of <code>@Bean</code> definitions (CGLIB-enhanced)</td></tr>
</table>
• All are meta-annotated with <code>@Component</code>, so scanning detects them. Use the most specific one: it documents intent, enables layer-specific processing and helps pointcuts (<code>within(@Service *)</code>).`),
      ],
      [
        blk(`<h3>Examples in a layered application</h3>
• Typical flow: <b>@RestController</b> (HTTP, validation) → <b>@Service</b> (business rules, transactions) → <b>@Repository</b> (data access). A <code>@RestControllerAdvice</code> converts exceptions to HTTP responses once for the whole application.`,
          `@RestController
@RequestMapping("/api/v1/courses")
class CourseController {
    private final CourseService service;
    CourseController(CourseService service) { this.service = service; }
    @GetMapping("/{id}") CourseDto get(@PathVariable UUID id) { return service.get(id); }
}

@Service
@Transactional(readOnly = true)
class CourseService {
    private final CourseRepository repo;
    CourseService(CourseRepository repo) { this.repo = repo; }
    CourseDto get(UUID id) { return repo.findById(id).map(CourseDto::from).orElseThrow(() -> new CourseNotFoundException(id)); }
}

@Repository
class JdbcCourseRepository implements CourseRepository {                  // SQLException -> DataAccessException automatically
    private final JdbcClient jdbc;
    JdbcCourseRepository(JdbcClient jdbc) { this.jdbc = jdbc; }
    public Optional<Course> findById(UUID id) { return jdbc.sql("select * from course where id = :id").param("id", id).query(Course.class).optional(); }
}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(CourseNotFoundException.class)
    ProblemDetail notFound(CourseNotFoundException e) { return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage()); }
}`,
        ),
      ],
      [
        blk(`<h3>@Component vs @Service vs @Repository, and custom stereotypes</h3>
• Functionally <code>@Component</code> and <code>@Service</code> are identical; <code>@Repository</code> adds <b>exception translation</b>; <code>@Controller</code>/<code>@RestController</code> are detected as web handlers. Choose by <b>layer</b>. Putting <code>@Component</code> everywhere works but loses intent and layer-specific behaviour.<br>
• <b>Custom stereotypes</b>: compose your own annotation from existing ones to encode architecture rules: <code>@UseCase</code> (= <code>@Service</code> + <code>@Transactional</code>), <code>@DomainService</code>, <code>@Adapter</code> (hexagonal), <code>@ReadModel</code>. Combine with <b>ArchUnit</b> tests to enforce layering (controllers must not use repositories).`,
          `@Target(ElementType.TYPE) @Retention(RetentionPolicy.RUNTIME) @Documented
@Service
@Transactional
public @interface UseCase {
    @AliasFor(annotation = Service.class, attribute = "value") String value() default "";    // allow @UseCase("name")
}

@UseCase class EnrollStudent { void handle(EnrollCommand c) { ... } }                         // bean + transactional proxy

@Target(TYPE) @Retention(RUNTIME) @Component @Profile("integration-test")
@interface FakeAdapter {}

// ArchUnit: enforce the layering
@ArchTest static final ArchRule layers = layeredArchitecture().consideringOnlyDependenciesInLayers()
    .layer("Web").definedBy("..web..").layer("Service").definedBy("..service..").layer("Persistence").definedBy("..persistence..")
    .whereLayer("Web").mayNotBeAccessedByAnyLayer().whereLayer("Persistence").mayOnlyBeAccessedByLayers("Service");`,
        ),
      ],
      [
        ['@Component vs @Service vs @Repository?', 'All are stereotypes detected by scanning; @Component is generic, @Service marks business logic (semantic), @Repository marks persistence classes and adds automatic exception translation to DataAccessException.'],
        ['What does @RestController add over @Controller?', 'It combines @Controller and @ResponseBody, so handler return values are serialised into the HTTP response body (JSON/XML) instead of resolving a view name.'],
        ['What is @ControllerAdvice used for?', 'Global cross-cutting behaviour for controllers: @ExceptionHandler methods converting exceptions to responses, @InitBinder and @ModelAttribute shared by many controllers.'],
      ],
    ),
    topic(
      'sc-scanning-conditional',
      'Component Scanning Filters, Conditional Bean Registration and Bean Naming Strategies',
      [
        blk(`<h3>Component scanning and filters</h3>
• <code>@ComponentScan</code> scans the classpath under the given packages for classes with stereotype annotations. <b>Filters</b> refine it: <code>includeFilters</code>/<code>excludeFilters</code> with <code>FilterType</code> <code>ANNOTATION</code>, <code>ASSIGNABLE_TYPE</code>, <code>ASPECTJ</code>, <code>REGEX</code>, <code>CUSTOM</code> (<code>TypeFilter</code>); <code>useDefaultFilters = false</code> to start from nothing. Use to exclude test configs/legacy classes or to include classes without annotations (all implementors of an interface).<br>
• Boot's <code>@SpringBootApplication</code> includes <code>TypeExcludeFilter</code> and <code>AutoConfigurationExcludeFilter</code> so slice tests and auto-configurations are not scanned accidentally. Scanning cost grows with package size: scope packages narrowly.`,
          `@Configuration
@ComponentScan(
    basePackages = "com.javaschoollab",
    useDefaultFilters = true,
    includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = EventHandler.class),        // register all handlers even without annotations
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Deprecated.class),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*Test.*Config"),
        @ComponentScan.Filter(type = FilterType.CUSTOM, classes = ExperimentalFilter.class)
    })
class ScanConfig { }

class ExperimentalFilter implements TypeFilter {
    public boolean match(MetadataReader reader, MetadataReaderFactory f) {
        return reader.getClassMetadata().getClassName().contains(".experimental.");
    }
}`,
        ),
      ],
      [
        blk(`<h3>Conditional bean registration</h3>
• <b><code>@Conditional(Condition.class)</code></b> registers a bean only if a <code>Condition.matches(context, metadata)</code> returns true (checked at registration time). Built on it: <code>@Profile</code>, and Spring Boot's family: <code>@ConditionalOnClass</code>/<code>OnMissingClass</code>, <code>@ConditionalOnBean</code>/<code>OnMissingBean</code> (<b>back off</b> when the user defines their own bean), <code>@ConditionalOnProperty</code>, <code>@ConditionalOnExpression</code>, <code>@ConditionalOnWebApplication</code>, <code>@ConditionalOnResource</code>, <code>@ConditionalOnCloudPlatform</code>, <code>@ConditionalOnJava</code>. This is exactly how <b>auto-configuration</b> works.<br>
• Order matters for <code>OnBean</code> conditions: they depend on registration order, so use them in <b>auto-configuration</b> classes (processed last) rather than in user config.`,
          `@Configuration
class CacheConfig {
    @Bean
    @ConditionalOnProperty(name = "jsl.cache.type", havingValue = "redis")
    CacheManager redisCacheManager(RedisConnectionFactory f) { return RedisCacheManager.create(f); }

    @Bean
    @ConditionalOnMissingBean(CacheManager.class)                              // back off if the user (or another config) defined one
    CacheManager simpleCacheManager() { return new ConcurrentMapCacheManager(); }

    @Bean
    @ConditionalOnClass(name = "io.micrometer.core.instrument.MeterRegistry")
    CacheMetrics cacheMetrics() { return new CacheMetrics(); }
}

// Custom condition
class OnLinuxCondition implements Condition {
    public boolean matches(ConditionContext ctx, AnnotatedTypeMetadata md) { return ctx.getEnvironment().getProperty("os.name", "").toLowerCase().contains("linux"); }
}
@Bean @Conditional(OnLinuxCondition.class) NativeWatcher nativeWatcher() { return new NativeWatcher(); }

// Debug what Boot decided: java -jar app.jar --debug   (conditions evaluation report)`,
        ),
      ],
      [
        blk(`<h3>Bean naming strategies</h3>
• Default scanning names: <code>AnnotationBeanNameGenerator</code> (decapitalised simple class name; explicit <code>value</code> of the stereotype or <code>@Named</code>). Duplicate simple names in different packages <b>conflict</b> (<code>ConflictingBeanDefinitionException</code>): give explicit names, or use a <b><code>FullyQualifiedAnnotationBeanNameGenerator</code></b> (<code>@ComponentScan(nameGenerator = ...)</code>). <code>@Bean</code> methods use the method name; use <code>name</code> for aliases.<br>
• Tips: prefer <b>injecting by type</b> and avoid relying on names; when you must refer to names (qualifiers, <code>@DependsOn</code>), use constants; <b>bean overriding</b> (same name registered twice) is disabled by default in Spring Boot 2.1+ (<code>spring.main.allow-bean-definition-overriding</code>).`,
          `@ComponentScan(basePackages = "com.javaschoollab", nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class)
class ScanConfig {}
// com.javaschoollab.catalogue.CourseService  -> bean name "com.javaschoollab.catalogue.CourseService"
// com.javaschoollab.legacy.CourseService     -> "com.javaschoollab.legacy.CourseService"   (no clash)

public static final String BILLING = "billingService";
@Service(BILLING) class BillingService {}
@Qualifier(BILLING) BillingService billing;`,
        ),
      ],
      [
        ['How does conditional bean registration work?', '@Conditional (and @Profile, @ConditionalOnProperty, @ConditionalOnMissingBean ...) attach Condition checks evaluated while bean definitions are registered, so a bean is only created when its condition holds; Boot auto-configuration relies on this.'],
        ['What happens when two scanned beans have the same simple class name?', 'They get the same default bean name and cause a ConflictingBeanDefinitionException; give explicit names or use a fully qualified bean name generator.'],
        ['How can you see why an auto-configuration did or did not apply?', 'Run with --debug (or enable the conditions report via Actuator /actuator/conditions) to see positive and negative condition matches.'],
      ],
    ),
  ]),
];
