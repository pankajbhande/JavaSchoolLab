// Spring extras, batch sboot01 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const sboot01Extras: Record<string, Extra> = {
    'sb-spring-framework-introduction': x(
        ['<b>Spring Framework</b> is a Java framework whose core is an <code>ApplicationContext</code> container that creates objects (beans), wires their dependencies and manages their life.',
            '<b>Inversion of Control</b>: you declare what you need and Spring builds and connects the objects, instead of you calling <code>new</code>.',
            '<b>Modules</b> are optional: core container, AOP, data access (JDBC, transactions), web (MVC, WebFlux) and test support.'],
        ['<b>Spring vs Spring Boot</b>: Spring is the framework; Boot adds auto-configuration, starters and an embedded server so you can run an app with little setup.',
            '<b>Configuration styles</b>: annotations (<code>@Component</code>, <code>@Configuration</code>) are the modern default; XML still works for legacy code.',
            '<b>Non-invasive</b>: your classes are plain Java objects and do not need to extend Spring classes.'],
        ['<b>Cross-cutting concerns</b> such as transactions, security and caching are applied through proxies (AOP) instead of code in each method.',
            '<b>Testability</b>: constructor-injected beans can be unit tested with plain <code>new</code> and mocks, no container needed.',
            '<b>Baseline</b>: Spring Framework 6 and Boot 3 need Java 17+ and use the <code>jakarta.*</code> namespace.'],
        [['F', 'What is Spring?', 'A Java framework that provides a container for creating and wiring objects, plus modules for web, data, security and more.'],
            ['F', 'What is a bean?', 'An object created and managed by the Spring container.'],
            ['M', 'Why use Spring instead of plain Java?', 'It removes manual wiring, gives declarative transactions and security, and makes code easier to test.'],
            ['M', 'Spring versus Spring Boot?', 'Boot is a layer on Spring that adds auto-configuration, starter dependencies and an embedded server.'],
            ['S', 'How does Spring add behavior like transactions without changing your code?', 'It wraps beans in proxies that run extra logic around the method call.'],
            ['S', 'What changed in Spring 6 and Boot 3?', 'Java 17 baseline and the move from javax.* to jakarta.* packages.']],
        [['Start a container and fetch a bean.',
            r`@Configuration
class AppConfig {
    @Bean String greeting() { return "Hello Spring"; }
}

var ctx = new AnnotationConfigApplicationContext(AppConfig.class);
System.out.println(ctx.getBean("greeting"));
ctx.close();

// OUTPUT:
// Hello Spring`],
            ['Component scanning.',
                r`@Component
class Clock { String now() { return "12:00"; } }

@Configuration @ComponentScan
class Cfg { }

var ctx = new AnnotationConfigApplicationContext(Cfg.class);
System.out.println(ctx.getBean(Clock.class).now());

// OUTPUT:
// 12:00`]],
        [['Minimal Spring Boot app.',
            r`@SpringBootApplication
public class DemoApp {
    public static void main(String[] args) {
        SpringApplication.run(DemoApp.class, args);
    }
}

// OUTPUT:
// Started DemoApp in 1.9 seconds (process running for 2.3) (varies)
// Tomcat started on port 8080 (http)`],
            ['Context smoke test.',
                r`@SpringBootTest
class DemoAppTests {
    @Autowired ApplicationContext ctx;

    @Test
    void contextLoads() {
        assertThat(ctx.getBeanDefinitionCount()).isGreaterThan(0);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`]]
    ),

    'sb-spring-architecture': x(
        ['<b>Layered architecture</b>: controller (web) calls service (business logic) calls repository (data access), each as a Spring bean.',
            '<b>Core container</b> (<code>BeanFactory</code>, <code>ApplicationContext</code>) is the base; all other modules build on it.',
            '<b>Stereotypes</b> label the layers: <code>@Controller</code>, <code>@Service</code>, <code>@Repository</code>.'],
        ['<b>Dependency direction</b>: upper layers depend on lower ones, never the reverse, so the controller never touches SQL.',
            '<b>DTOs</b> keep web models separate from entities, so a database change does not break the API.',
            '<b>Modules</b>: spring-core, beans, context, aop, tx, jdbc, orm, web, webmvc and test are separate jars.'],
        ['<b>Transaction boundary</b> belongs on the service layer (<code>@Transactional</code>), not in controllers.',
            '<b>Exception translation</b>: <code>@Repository</code> converts vendor errors to <code>DataAccessException</code>.',
            '<b>Context hierarchy</b>: a parent root context and a child web context can both exist in classic setups; Boot normally uses one.'],
        [['F', 'Name the layers of a Spring app.', 'Presentation (controller), service, and repository or persistence.'],
            ['F', 'What does @Repository do?', 'Marks a data access bean and enables exception translation.'],
            ['M', 'Why keep logic out of controllers?', 'Controllers should only handle HTTP; logic in services is reusable and testable.'],
            ['M', 'BeanFactory versus ApplicationContext?', 'ApplicationContext extends BeanFactory with events, i18n, resource loading and eager singleton creation.'],
            ['S', 'Where should transactions start?', 'On service methods that represent a business operation, so several repository calls share one transaction.'],
            ['S', 'How do you enforce layering in a large project?', 'Package rules, ArchUnit tests, or Spring Modulith.']],
        [['Three layers wired together.',
            r`@RestController
class OrderController {
    private final OrderService service;
    OrderController(OrderService service) { this.service = service; }
    @GetMapping("/orders/{id}")
    String get(@PathVariable long id) { return service.describe(id); }
}

@Service
class OrderService {
    String describe(long id) { return "Order #" + id; }
}

// OUTPUT:
// GET /orders/7 -> Order #7`],
            ['List beans per layer.',
                r`String[] names = ctx.getBeanNamesForAnnotation(Service.class);
System.out.println(Arrays.toString(names));

// OUTPUT:
// [orderService]`]],
        [['Repository layer.',
            r`public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);
}

// OUTPUT:
// Spring Data generates the implementation at startup; no class is written`],
            ['Slice test of the web layer.',
                r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService service;

    @Test
    void returnsOrder() throws Exception {
        when(service.describe(7)).thenReturn("Order #7");
        mvc.perform(get("/orders/7"))
           .andExpect(status().isOk())
           .andExpect(content().string("Order #7"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'spring-core-ioc-di': x(
        ['<b>IoC</b> means the container controls object creation and wiring; <b>DI</b> is the way it hands dependencies to your class.',
            '<b>Container</b>: <code>ApplicationContext</code> reads bean definitions, creates beans and injects collaborators.',
            '<b>Benefit</b>: classes depend on interfaces, so implementations can be swapped without editing the caller.'],
        ['<b>Bean definition</b> comes from <code>@Component</code> scanning, <code>@Bean</code> methods or XML.',
            '<b>Injection by type</b> first; if several candidates exist use <code>@Primary</code> or <code>@Qualifier</code>.',
            '<b>Singleton</b> is the default scope, so one shared instance per container.'],
        ['<b>Startup order</b>: definitions are registered, post-processors run, then singletons are created and wired.',
            '<b>Circular dependencies</b> fail by default in Boot 2.6+ unless allowed explicitly; better to redesign.',
            '<b>Lazy</b> beans (<code>@Lazy</code>) are created on first use to save startup time.'],
        [['F', 'What is IoC?', 'Control of object creation and wiring is handed from your code to the container.'],
            ['F', 'What is DI?', 'The container supplies the objects a class needs, usually through its constructor.'],
            ['M', 'How does Spring pick which bean to inject?', 'By type, then by @Qualifier or parameter name; @Primary marks a default.'],
            ['M', 'What error appears when two beans match?', 'NoUniqueBeanDefinitionException.'],
            ['S', 'How does the container resolve dependencies internally?', 'The bean factory reads definitions, resolves constructor arguments recursively and caches singletons.'],
            ['S', 'Why are circular dependencies discouraged?', 'They hide design problems and need early references that break constructor injection.']],
        [['IoC in action.',
            r`interface Notifier { String send(String m); }

@Component
class EmailNotifier implements Notifier {
    public String send(String m) { return "email: " + m; }
}

@Service
class AlertService {
    private final Notifier notifier;
    AlertService(Notifier notifier) { this.notifier = notifier; }
    String alert() { return notifier.send("disk full"); }
}

// OUTPUT:
// email: disk full`],
            ['Choosing between two beans.',
                r`@Component @Primary class SmsNotifier implements Notifier {
    public String send(String m) { return "sms: " + m; }
}

// AlertService now receives SmsNotifier because it is @Primary
// OUTPUT:
// sms: disk full`]],
        [['Qualifier.',
            r`@Service
class Alerts {
    private final Notifier notifier;
    Alerts(@Qualifier("emailNotifier") Notifier notifier) {
        this.notifier = notifier;
    }
}

// OUTPUT:
// emailNotifier is injected even though another bean is @Primary`],
            ['Unit test without a container.',
                r`@Test
void alertUsesNotifier() {
    Notifier fake = m -> "fake: " + m;
    assertEquals("fake: disk full",
        new AlertService(fake).alert());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'sb-dependency-injection': x(
        ['<b>Dependency injection</b> gives an object its collaborators from outside instead of letting it build them.',
            '<b>Three styles</b>: constructor, setter and field injection; constructor is recommended.',
            '<b>Trigger</b>: Spring injects when a constructor, setter or field is marked <code>@Autowired</code>, or when a class has a single constructor.'],
        ['<b>Single constructor</b>: since Spring 4.3 <code>@Autowired</code> is optional on it.',
            '<b>Collections</b>: injecting <code>List&lt;Plugin&gt;</code> collects every bean of that type.',
            '<b>Optional</b> dependencies: use <code>ObjectProvider</code>, <code>Optional</code> or <code>@Autowired(required = false)</code>.'],
        ['<b>Resolution</b> is done by <code>AutowiredAnnotationBeanPostProcessor</code> and <code>DefaultListableBeanFactory</code>.',
            '<b>Immutability</b>: constructor injection allows <code>final</code> fields and thread-safe objects.',
            '<b>Many dependencies</b> (over 5 or so) signal a class doing too much.'],
        [['F', 'What is dependency injection?', 'Providing the objects a class needs from outside rather than creating them inside.'],
            ['F', 'Which annotation requests injection?', '@Autowired (optional on a single constructor).'],
            ['M', 'Why prefer constructor injection?', 'Dependencies are required, fields can be final, and the class is easy to test.'],
            ['M', 'How inject all beans of an interface?', 'Declare a List or Map of that type as the parameter.'],
            ['S', 'Which class processes @Autowired?', 'AutowiredAnnotationBeanPostProcessor.'],
            ['S', 'How do you make a dependency optional?', 'Use ObjectProvider, Optional, or required = false.']],
        [['Injecting a list of strategies.',
            r`interface Discount { double apply(double p); }
@Component class Tenth implements Discount {
    public double apply(double p) { return p * 0.9; }
}
@Component class Flat implements Discount {
    public double apply(double p) { return p - 5; }
}

@Service
class Pricing {
    private final List<Discount> all;
    Pricing(List<Discount> all) { this.all = all; }
    int count() { return all.size(); }
}

// OUTPUT:
// count() -> 2`],
            ['Optional dependency.',
                r`@Service
class Report {
    private final ObjectProvider<Mailer> mailer;
    Report(ObjectProvider<Mailer> mailer) { this.mailer = mailer; }
    void run() {
        mailer.ifAvailable(m -> m.send("done"));
        System.out.println("report finished");
    }
}

// OUTPUT:
// report finished   (no Mailer bean, no error)`]],
        [['Map of beans by name.',
            r`@Service
class Router {
    private final Map<String, Discount> byName;
    Router(Map<String, Discount> byName) { this.byName = byName; }
    Set<String> keys() { return new TreeSet<>(byName.keySet()); }
}

// OUTPUT:
// [flat, tenth]`],
            ['Failure when a bean is missing.',
                r`@Service
class Broken {
    Broken(UnknownService s) { }
}

// OUTPUT:
// UnsatisfiedDependencyException: Error creating bean with name 'broken':
// No qualifying bean of type 'UnknownService' available`]]
    ),

    'sb-constructor-injection': x(
        ['<b>Constructor injection</b> passes dependencies as constructor parameters, so the object is fully built when created.',
            '<b>No annotation needed</b> when the class has exactly one constructor.',
            '<b>final fields</b> are possible, which makes the bean immutable.'],
        ['<b>Lombok</b>: <code>@RequiredArgsConstructor</code> generates the constructor for all final fields.',
            '<b>Multiple constructors</b>: mark the one Spring should use with <code>@Autowired</code>.',
            '<b>Records</b> can be used for configuration properties, and a bean class may be a plain class with one constructor.'],
        ['<b>Circular dependency</b> between two constructor-injected beans fails at startup, which exposes bad design early.',
            '<b>Breaking a cycle</b>: extract a third bean, use events, or inject <code>@Lazy</code> on one parameter.',
            '<b>Testing</b>: call the constructor with mocks; no reflection or Spring context needed.'],
        [['F', 'What is constructor injection?', 'Dependencies are given through the constructor parameters.'],
            ['F', 'Is @Autowired needed on a single constructor?', 'No, Spring uses it automatically.'],
            ['M', 'Why is constructor injection recommended?', 'It makes dependencies explicit and required, supports final fields and eases testing.'],
            ['M', 'What happens with two constructors and no annotation?', 'Spring looks for a default constructor; otherwise it fails.'],
            ['S', 'How can a constructor cycle be broken?', 'Redesign, or add @Lazy to one parameter so a proxy is injected.'],
            ['S', 'What does BeanCurrentlyInCreationException mean?', 'A circular reference between beans created through constructors.']],
        [['Immutable service.',
            r`@Service
public class InvoiceService {
    private final TaxCalculator tax;
    private final InvoiceRepository repo;

    public InvoiceService(TaxCalculator tax, InvoiceRepository repo) {
        this.tax = tax;
        this.repo = repo;
    }
}

// OUTPUT:
// bean 'invoiceService' created with both collaborators`],
            ['Lombok version.',
                r`@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final TaxCalculator tax;
    private final InvoiceRepository repo;
}

// OUTPUT:
// same constructor generated at compile time`]],
        [['Pure unit test.',
            r`@Test
void total() {
    TaxCalculator tax = mock(TaxCalculator.class);
    when(tax.of(100)).thenReturn(18.0);
    var service = new InvoiceService(tax, mock(InvoiceRepository.class));
    assertEquals(118.0, service.total(100));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Circular failure.',
                r`@Service class A { A(B b) { } }
@Service class B { B(A a) { } }

// OUTPUT:
// APPLICATION FAILED TO START
// The dependencies of some of the beans in the application context
// form a cycle: a -> b -> a`]]
    ),

    'sb-setter-injection': x(
        ['<b>Setter injection</b> calls a setter method after the object is created to supply a dependency.',
            '<b>Use it for optional</b> or changeable dependencies that have a sensible default.',
            '<b>Annotation</b>: put <code>@Autowired</code> on the setter (it is required for setter injection).'],
        ['<b>Not final</b>: fields set by setters cannot be final, so the object can be changed after creation.',
            '<b>Partial state</b>: the bean can exist briefly without its dependency; guard against <code>null</code>.',
            '<b>XML</b> style used <code>&lt;property&gt;</code>; the annotation style replaces it.'],
        ['<b>Order</b>: the container instantiates through the constructor first, then populates properties by setters.',
            '<b>Cycles</b>: singleton setter injection can resolve circular references through early references, but Boot disables this by default.',
            '<b>Reconfigure</b>: setters allow tests or JMX to replace a collaborator at runtime, at the cost of thread safety.'],
        [['F', 'What is setter injection?', 'The container calls a setter to provide the dependency after construction.'],
            ['F', 'Which annotation is used?', '@Autowired on the setter method.'],
            ['M', 'When choose setter over constructor injection?', 'For optional dependencies with defaults.'],
            ['M', 'Drawback of setter injection?', 'Fields are not final and the object may be used before it is fully configured.'],
            ['S', 'Can setter injection solve circular dependencies?', 'Technically yes for singletons using early references, but Boot 2.6+ forbids it by default.'],
            ['S', 'In what order does Spring build a setter-injected bean?', 'Instantiate with the constructor, populate properties, run aware callbacks and init methods.']],
        [['Optional dependency with default.',
            r`@Service
public class Greeter {
    private Formatter formatter = new PlainFormatter();

    @Autowired(required = false)
    public void setFormatter(Formatter formatter) {
        this.formatter = formatter;
    }
    public String greet(String n) { return formatter.format("Hi " + n); }
}

// OUTPUT:
// greet("Ann") -> Hi Ann   (default formatter used when no bean exists)`],
            ['Setter with @Qualifier.',
                r`@Autowired
public void setNotifier(@Qualifier("smsNotifier") Notifier notifier) {
    this.notifier = notifier;
}

// OUTPUT:
// smsNotifier injected via setter`]],
        [['Test replacing a dependency.',
            r`@Test
void usesCustomFormatter() {
    var g = new Greeter();
    g.setFormatter(s -> s.toUpperCase());
    assertEquals("HI ANN", g.greet("Ann"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Null pitfall.',
                r`@Service
class Mailer {
    private Sender sender;                 // never set if bean is missing
    @Autowired(required = false)
    void setSender(Sender s) { this.sender = s; }
    void send() { sender.go(); }           // NullPointerException risk
}

// OUTPUT:
// java.lang.NullPointerException when no Sender bean is defined`]]
    ),

    'sb-field-injection': x(
        ['<b>Field injection</b> puts <code>@Autowired</code> directly on a private field; Spring sets it with reflection.',
            '<b>Short but risky</b>: little code, but dependencies are hidden and the class cannot be built without Spring.',
            '<b>Not recommended</b> for production code; prefer constructor injection.'],
        ['<b>No final</b>: field-injected fields cannot be final.',
            '<b>Testing</b> needs reflection (<code>ReflectionTestUtils</code>) or <code>@InjectMocks</code> instead of plain <code>new</code>.',
            '<b>Acceptable uses</b>: test classes and quick demos, such as <code>@Autowired MockMvc</code>.'],
        ['<b>Hidden coupling</b>: ten fields can be added without any visible growth in the signature.',
            '<b>Reflection</b>: the post-processor calls <code>Field.setAccessible(true)</code> then sets the value, so it bypasses constructors.',
            '<b>Migration</b>: replace with a constructor and make fields final, often with <code>@RequiredArgsConstructor</code>.'],
        [['F', 'What is field injection?', 'Using @Autowired on a field so Spring sets it by reflection.'],
            ['F', 'Where is field injection acceptable?', 'In test classes and small demos.'],
            ['M', 'Why do many teams avoid it?', 'It hides dependencies, prevents final fields and makes plain unit tests hard.'],
            ['M', 'How do you test a field-injected class?', 'With @InjectMocks or ReflectionTestUtils.setField.'],
            ['S', 'How does Spring set a private field?', 'Through reflection after making the field accessible, in a BeanPostProcessor.'],
            ['S', 'How do you refactor away from field injection?', 'Add a constructor taking the dependencies, mark fields final and remove @Autowired from them.']],
        [['Field injection example.',
            r`@Service
public class ReportService {
    @Autowired
    private ReportRepository repo;        // set by reflection

    public int count() { return repo.findAll().size(); }
}

// OUTPUT:
// works inside the Spring container; new ReportService() has repo == null`],
            ['Refactored.',
                r`@Service
public class ReportService {
    private final ReportRepository repo;
    public ReportService(ReportRepository repo) { this.repo = repo; }
    public int count() { return repo.findAll().size(); }
}

// OUTPUT:
// new ReportService(mockRepo).count() works in a plain unit test`]],
        [['Mockito with field injection.',
            r`@ExtendWith(MockitoExtension.class)
class ReportServiceTest {
    @Mock ReportRepository repo;
    @InjectMocks ReportService service;

    @Test
    void counts() {
        when(repo.findAll()).thenReturn(List.of(new Report()));
        assertEquals(1, service.count());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['NPE without Spring.',
                r`var s = new ReportService();
s.count();

// OUTPUT:
// java.lang.NullPointerException: Cannot invoke
// "ReportRepository.findAll()" because "this.repo" is null`]]
    ),

    'sb-spring-beans': x(
        ['<b>Bean</b> is an object whose creation, wiring and lifecycle are managed by the Spring container.',
            '<b>Declaring beans</b>: annotate a class with <code>@Component</code> (or <code>@Service</code>, <code>@Repository</code>, <code>@Controller</code>) or write a <code>@Bean</code> method in a <code>@Configuration</code> class.',
            '<b>Bean name</b> defaults to the class name with a lowercase first letter, or the method name for <code>@Bean</code>.'],
        ['<b>@Bean vs @Component</b>: use <code>@Bean</code> for third-party classes you cannot annotate, <code>@Component</code> for your own.',
            '<b>Lookup</b>: <code>getBean(name)</code>, <code>getBean(Type.class)</code>; in app code prefer injection.',
            '<b>Bean definition</b> (<code>BeanDefinition</code>) is the recipe: class, scope, constructor args, init and destroy methods.'],
        ['<b>@Configuration proxy</b>: calls between <code>@Bean</code> methods return the same singleton because the class is CGLIB-proxied.',
            '<b>proxyBeanMethods = false</b> skips that proxy for faster startup when beans do not call each other.',
            '<b>Conditional beans</b>: <code>@ConditionalOnProperty</code>, <code>@Profile</code> and <code>@ConditionalOnMissingBean</code> decide if a bean exists.'],
        [['F', 'What is a Spring bean?', 'An object managed by the Spring container.'],
            ['F', 'How is a bean declared?', 'With a stereotype annotation or an @Bean method.'],
            ['M', 'When use @Bean instead of @Component?', 'For library classes or when construction needs custom code.'],
            ['M', 'What is the default bean name?', 'The decapitalized class name, or the method name for @Bean.'],
            ['S', 'What is a BeanDefinition?', 'Metadata describing how to create a bean: class, scope, dependencies and callbacks.'],
            ['S', 'What does proxyBeanMethods do?', 'When true the configuration class is proxied so inter-bean method calls return the shared singleton.']],
        [['Both ways to declare beans.',
            r`@Component
class Counter { }

@Configuration
class Cfg {
    @Bean
    ObjectMapper mapper() { return new ObjectMapper(); }
}

System.out.println(ctx.containsBean("counter") + " " + ctx.containsBean("mapper"));

// OUTPUT:
// true true`],
            ['Custom name.',
                r`@Bean("mainDs")
DataSource dataSource() { return new HikariDataSource(); }

System.out.println(ctx.containsBean("dataSource") + " " + ctx.containsBean("mainDs"));

// OUTPUT:
// false true`]],
        [['Conditional bean.',
            r`@Bean
@ConditionalOnProperty(name = "feature.mail", havingValue = "true")
Mailer mailer() { return new SmtpMailer(); }

# OUTPUT:
# feature.mail=true  -> Mailer bean exists
# feature.mail absent -> bean skipped`],
            ['Listing beans.',
                r`Arrays.stream(ctx.getBeanDefinitionNames())
      .filter(n -> n.endsWith("Service"))
      .sorted().forEach(System.out::println);

// OUTPUT:
// invoiceService
// orderService`]]
    ),

    'sb-bean-lifecycle': x(
        ['<b>Lifecycle</b>: instantiate, inject dependencies, run initialization callbacks, bean is ready, then destruction callbacks when the context closes.',
            '<b>Callbacks</b>: <code>@PostConstruct</code> after injection and <code>@PreDestroy</code> before shutdown.',
            '<b>Jakarta</b>: these annotations are in <code>jakarta.annotation</code> in Boot 3.'],
        ['<b>Alternatives</b>: <code>InitializingBean.afterPropertiesSet()</code>, <code>DisposableBean.destroy()</code>, or <code>@Bean(initMethod, destroyMethod)</code>.',
            '<b>Aware interfaces</b> such as <code>BeanNameAware</code> and <code>ApplicationContextAware</code> give the bean framework objects.',
            '<b>Prototype beans</b> are not destroyed by Spring; you must clean them up yourself.'],
        ['<b>BeanPostProcessor</b> runs before and after init for every bean and is how proxies and <code>@Autowired</code> work.',
            '<b>Order</b>: constructor, setters/fields, Aware callbacks, postProcessBeforeInit, @PostConstruct, afterPropertiesSet, init-method, postProcessAfterInit.',
            '<b>Shutdown</b>: a JVM shutdown hook closes the context in Boot, which triggers destroy callbacks.'],
        [['F', 'Which annotation runs code after injection?', '@PostConstruct.'],
            ['F', 'Which runs before the bean is removed?', '@PreDestroy.'],
            ['M', 'Name three ways to define init logic.', '@PostConstruct, InitializingBean, and the initMethod attribute of @Bean.'],
            ['M', 'Does Spring call destroy for prototype beans?', 'No, the container does not manage their destruction.'],
            ['S', 'What is a BeanPostProcessor?', 'A hook that can modify or wrap every bean before and after initialization.'],
            ['S', 'Why not use constructor for heavy startup work?', 'Dependencies may not be ready for field or setter injection, and proxies are not applied yet.']],
        [['Callbacks in order.',
            r`@Component
class Cache {
    Cache() { System.out.println("1 constructor"); }
    @PostConstruct void init() { System.out.println("2 @PostConstruct"); }
    @PreDestroy void close() { System.out.println("3 @PreDestroy"); }
}

// OUTPUT:
// 1 constructor
// 2 @PostConstruct
// (context closes)
// 3 @PreDestroy`],
            ['@Bean init and destroy methods.',
                r`@Bean(initMethod = "start", destroyMethod = "stop")
Worker worker() { return new Worker(); }

// OUTPUT:
// Worker.start() called after creation
// Worker.stop() called on shutdown`]],
        [['Custom BeanPostProcessor.',
            r`@Component
class LogPostProcessor implements BeanPostProcessor {
    public Object postProcessAfterInitialization(Object bean, String name) {
        if (name.endsWith("Service")) System.out.println("ready: " + name);
        return bean;
    }
}

// OUTPUT:
// ready: orderService`],
            ['Test the callback.',
                r`@Test
void postConstructRuns() {
    try (var ctx = new AnnotationConfigApplicationContext(Cache.class)) {
        assertNotNull(ctx.getBean(Cache.class));
    }
}

// OUTPUT:
// 1 constructor
// 2 @PostConstruct
// 3 @PreDestroy`]]
    ),

    'sb-bean-scopes': x(
        ['<b>Scope</b> decides how many instances Spring creates and how long they live.',
            '<b>singleton</b> (default): one instance per container. <b>prototype</b>: a new instance on every request for the bean.',
            '<b>Web scopes</b>: <code>request</code>, <code>session</code>, <code>application</code> and <code>websocket</code>.'],
        ['<b>Set scope</b> with <code>@Scope(&quot;prototype&quot;)</code> or the constants in <code>ConfigurableBeanFactory</code>.',
            '<b>Singleton is not thread-safe by itself</b>: keep singleton beans stateless or synchronize shared state.',
            '<b>Spring singleton</b> means one per container, not one per JVM like the GoF pattern.'],
        ['<b>Prototype into singleton</b> problem: the prototype is injected once; use <code>ObjectProvider</code>, <code>@Lookup</code> or a scoped proxy to get fresh ones.',
            '<b>Scoped proxy</b>: <code>proxyMode = ScopedProxyMode.TARGET_CLASS</code> injects a proxy that resolves the real request or session bean per call.',
            '<b>Lifecycle</b>: destroy callbacks do not run for prototypes.'],
        [['F', 'What is the default scope?', 'Singleton.'],
            ['F', 'What does prototype scope do?', 'Creates a new bean instance each time it is requested.'],
            ['M', 'List the web scopes.', 'request, session, application and websocket.'],
            ['M', 'Is a Spring singleton the same as the singleton pattern?', 'No, it is one instance per ApplicationContext, not per class loader.'],
            ['S', 'How get a new prototype inside a singleton?', 'Inject ObjectProvider or use @Lookup or a scoped proxy.'],
            ['S', 'Why use a scoped proxy for a session bean?', 'The singleton gets a proxy that finds the correct session bean at call time.']],
        [['Singleton versus prototype.',
            r`@Component class Shared { }
@Component @Scope("prototype") class Fresh { }

System.out.println(ctx.getBean(Shared.class) == ctx.getBean(Shared.class));
System.out.println(ctx.getBean(Fresh.class) == ctx.getBean(Fresh.class));

// OUTPUT:
// true
// false`],
            ['Fresh prototype in a singleton.',
                r`@Service
class Worker {
    private final ObjectProvider<Fresh> provider;
    Worker(ObjectProvider<Fresh> provider) { this.provider = provider; }
    boolean different() { return provider.getObject() != provider.getObject(); }
}

// OUTPUT:
// different() -> true`]],
        [['Session scope with proxy.',
            r`@Component
@Scope(value = WebApplicationContext.SCOPE_SESSION,
       proxyMode = ScopedProxyMode.TARGET_CLASS)
class Cart {
    private final List<String> items = new ArrayList<>();
    void add(String i) { items.add(i); }
}

// OUTPUT:
// each HTTP session sees its own Cart; the singleton controller holds a proxy`],
            ['Test the scope.',
                r`@Test
void prototypeIsNew() {
    try (var ctx = new AnnotationConfigApplicationContext(Fresh.class)) {
        assertNotSame(ctx.getBean(Fresh.class), ctx.getBean(Fresh.class));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    )
};

export const sboot01Deep: Record<string, Deep> = {
    'sb-spring-framework-introduction': dv(
        [`<p>Spring is built around one container.</p><ul><li><b>Startup:</b> <code>refresh()</code> loads bean definitions, runs <code>BeanFactoryPostProcessor</code>s, registers <code>BeanPostProcessor</code>s, then creates singletons.</li><li><b>Registry:</b> <code>DefaultListableBeanFactory</code> keeps the map of names to definitions and singleton instances.</li><li><b>Events:</b> the context publishes events such as <code>ContextRefreshedEvent</code>.</li><li><b>Proxies:</b> AOP wraps beans using JDK or CGLIB proxies.</li></ul>`,
            r`var ctx = new AnnotationConfigApplicationContext(AppConfig.class);
System.out.println(ctx.getBeanFactory().getClass().getSimpleName());
System.out.println(ctx.getBeanDefinitionCount() > 0);
ctx.close();

// OUTPUT:
// DefaultListableBeanFactory
// true`],
        [`<p>Ways to configure and bootstrap:</p><ul><li><b>Annotation config:</b> <code>@Configuration</code>, <code>@ComponentScan</code>, <code>@Import</code>.</li><li><b>XML:</b> <code>ClassPathXmlApplicationContext</code> for legacy projects.</li><li><b>Boot:</b> <code>@SpringBootApplication</code> combines configuration, auto-configuration and scanning.</li><li><b>Profiles:</b> <code>@Profile</code> turns beans on per environment.</li></ul>`,
            r`@SpringBootApplication   // = @Configuration + @EnableAutoConfiguration
public class App {                  //   + @ComponentScan
    public static void main(String[] a) {
        new SpringApplicationBuilder(App.class)
            .profiles("dev")
            .run(a);
    }
}

# OUTPUT:
# The following 1 profile is active: "dev"`],
        [`<p>Common mistakes:</p><ul><li><b>new on a bean:</b> <code>new Service()</code> skips injection and proxies, so fields stay null.</li><li><b>Scan miss:</b> classes outside the main package are not scanned; move them or add <code>scanBasePackages</code>.</li><li><b>javax imports:</b> Boot 3 needs <code>jakarta.*</code>.</li><li><b>Everything in one class:</b> split by layer.</li></ul>`,
            r`@RestController
class BadController {
    // WRONG: bypasses the container, so repo is never injected
    private final Repo repo = new Repo();
}
// RIGHT: constructor-inject Repo as a bean

// OUTPUT:
// No qualifying bean / NullPointerException at runtime for the wrong version`],
        [`<p>Startup time and memory:</p><ul><li><b>Lazy init:</b> <code>spring.main.lazy-initialization=true</code> delays bean creation.</li><li><b>Fewer starters:</b> each adds auto-configuration to evaluate.</li><li><b>proxyBeanMethods = false</b> on configuration classes.</li><li><b>AOT and native images:</b> Spring 6 supports ahead-of-time processing with GraalVM.</li></ul>`,
            r`# application.properties
spring.main.lazy-initialization=true
spring.jmx.enabled=false

# OUTPUT:
# Started App in 1.1 seconds (was 2.0 seconds without lazy init) (varies)`],
        [`<p>A typical company app: a Boot service exposes REST endpoints, uses Spring Data for MySQL, Spring Security for login and Actuator for health checks. Every part is a bean wired by the container.</p>`,
            r`@RestController
@RequestMapping("/api/products")
class ProductController {
    private final ProductService service;
    ProductController(ProductService service) { this.service = service; }

    @GetMapping("/{id}")
    ProductDto one(@PathVariable long id) { return service.find(id); }
}

// OUTPUT:
// GET /api/products/3
// 200 {"id":3,"name":"Pen","price":1.5}`]
    ),

    'sb-spring-architecture': dv(
        [`<p>How a request moves through the layers:</p><ul><li><b>Servlet container</b> (Tomcat) receives the request.</li><li><b>DispatcherServlet</b> finds the handler and calls the controller.</li><li><b>Controller</b> calls a service bean through a proxy that may open a transaction.</li><li><b>Repository</b> runs SQL through the <code>EntityManager</code> or JDBC.</li><li><b>Response</b> is written by an <code>HttpMessageConverter</code>.</li></ul>`,
            r`@Service
class OrderService {
    @Transactional                 // proxy opens and commits the transaction
    public void place(Order o) {
        repo.save(o);
        stock.reduce(o);
    }
}

// OUTPUT:
// BEGIN; insert order; update stock; COMMIT   (one transaction)`],
        [`<p>Architecture variants:</p><ul><li><b>Layered:</b> technical packages (controller, service, repository).</li><li><b>Feature packages:</b> package per feature (order, customer) keeps related code together.</li><li><b>Hexagonal:</b> domain core with ports and adapters.</li><li><b>Modular monolith:</b> Spring Modulith verifies module boundaries.</li></ul>`,
            r`com.shop
  order
    OrderController
    OrderService
    OrderRepository
  customer
    CustomerController
    CustomerService

# OUTPUT:
# package-by-feature layout: each feature owns its three layers`],
        [`<p>Mistakes:</p><ul><li><b>Fat controllers:</b> business rules in the web layer.</li><li><b>Entities in the API:</b> lazy loading errors and leaked fields; use DTOs.</li><li><b>Transactional on controller:</b> keeps the connection open during view rendering.</li><li><b>Self-invocation:</b> a service calling its own <code>@Transactional</code> method bypasses the proxy.</li></ul>`,
            r`@Service
class PaymentService {
    public void pay() { audit(); }           // direct call, no proxy
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void audit() { }                  // annotation ignored here
}

// OUTPUT:
// audit() runs inside no new transaction; move it to another bean`],
        [`<p>Tuning layers:</p><ul><li><b>N+1 queries:</b> fetch associations with <code>join fetch</code> or entity graphs.</li><li><b>Pagination:</b> return <code>Page</code> rather than full lists.</li><li><b>Caching:</b> <code>@Cacheable</code> on service reads.</li><li><b>Read-only transactions:</b> <code>@Transactional(readOnly = true)</code>.</li></ul>`,
            r`@Transactional(readOnly = true)
@Cacheable("products")
public ProductDto find(long id) {
    return mapper.toDto(repo.findById(id).orElseThrow());
}

// OUTPUT:
// first call: SQL select; second call: served from cache`],
        [`<p>A bank service splits into account, payment and notification modules. The payment service publishes an event, and the notification module listens, so the modules stay decoupled.</p>`,
            r`@Service
class PaymentService {
    private final ApplicationEventPublisher events;
    PaymentService(ApplicationEventPublisher events) { this.events = events; }
    void pay(long id) { events.publishEvent(new PaymentDone(id)); }
}

@Component
class Notifier {
    @EventListener
    void on(PaymentDone e) { System.out.println("notify payment " + e.id()); }
}

// OUTPUT:
// notify payment 42`]
    ),

    'spring-core-ioc-di': dv(
        [`<p>Inside the container:</p><ul><li><b>Definitions:</b> scanning creates <code>BeanDefinition</code>s.</li><li><b>getBean:</b> checks the singleton cache, else creates the bean.</li><li><b>Create:</b> picks a constructor, resolves each argument by type recursively, then populates and initializes.</li><li><b>Three-level cache:</b> singletonObjects, earlySingletonObjects, singletonFactories help with early references.</li></ul>`,
            r`DefaultListableBeanFactory bf = new DefaultListableBeanFactory();
bf.registerBeanDefinition("clock",
    BeanDefinitionBuilder.genericBeanDefinition(Clock.class).getBeanDefinition());
System.out.println(bf.getBean("clock") == bf.getBean("clock"));

// OUTPUT:
// true`],
        [`<p>Options for resolving candidates:</p><ul><li><b>@Primary:</b> default among many.</li><li><b>@Qualifier:</b> pick by name or custom qualifier.</li><li><b>Parameter name:</b> matches bean name as fallback (needs <code>-parameters</code>).</li><li><b>@Order:</b> sorts injected lists.</li><li><b>@Resource:</b> by name first (Jakarta annotation).</li></ul>`,
            r`@Component @Order(2) class B implements Step { }
@Component @Order(1) class A implements Step { }

@Service
class Pipeline {
    Pipeline(List<Step> steps) {
        steps.forEach(s -> System.out.println(s.getClass().getSimpleName()));
    }
}

// OUTPUT:
// A
// B`],
        [`<p>Mistakes:</p><ul><li><b>Ambiguity:</b> two beans of one type without qualifier.</li><li><b>Missing scan:</b> class has no stereotype or is outside the base package.</li><li><b>Static fields:</b> cannot be injected.</li><li><b>Mixing new and DI:</b> objects made with new are invisible to Spring.</li></ul>`,
            r`@Component class Impl1 implements Svc { }
@Component class Impl2 implements Svc { }
@Component class User { User(Svc s) { } }

// OUTPUT:
// NoUniqueBeanDefinitionException: expected single matching bean
// but found 2: impl1,impl2
// FIX: add @Primary to one or @Qualifier("impl1") at the parameter`],
        [`<p>Tuning the container:</p><ul><li>Keep scanning narrow with <code>scanBasePackages</code>.</li><li>Use <code>@Lazy</code> for rarely used heavy beans.</li><li>Avoid expensive work in constructors.</li><li>Use <code>--debug</code> to see the auto-configuration report.</li></ul>`,
            r`@Service
@Lazy
class PdfEngine {
    PdfEngine() { System.out.println("PdfEngine created"); }
}

// OUTPUT:
// (nothing at startup)
// PdfEngine created   <- printed on first use only`],
        [`<p>An e-commerce app has several payment providers behind one interface. A map of beans lets the service choose the provider by name at runtime without if-else chains.</p>`,
            r`@Service
class Checkout {
    private final Map<String, PaymentProvider> providers;
    Checkout(Map<String, PaymentProvider> providers) { this.providers = providers; }
    String pay(String type, double amt) {
        return providers.get(type + "Provider").charge(amt);
    }
}

// OUTPUT:
// pay("card", 50) -> charged 50.0 by card`]
    ),

    'sb-dependency-injection': dv(
        [`<p>Processing steps for an injected bean:</p><ul><li><b>Constructor resolution:</b> <code>ConstructorResolver</code> picks the constructor and resolves arguments with <code>DependencyDescriptor</code>.</li><li><b>Field and setter:</b> <code>AutowiredAnnotationBeanPostProcessor</code> builds an <code>InjectionMetadata</code> and injects.</li><li><b>Candidate search:</b> by type, then primary, priority, qualifier and name.</li></ul>`,
            r`ObjectProvider<Mailer> p = ctx.getBeanProvider(Mailer.class);
System.out.println(p.getIfAvailable() == null ? "none" : "present");

// OUTPUT:
// none`],
        [`<p>Variants:</p><ul><li><b>Constructor, setter, field.</b></li><li><b>Method injection:</b> any <code>@Autowired</code> method with parameters.</li><li><b>@Value:</b> injects property values.</li><li><b>@Lookup:</b> container-implemented method returning a fresh bean.</li><li><b>Generics:</b> <code>Repo&lt;User&gt;</code> and <code>Repo&lt;Order&gt;</code> are different injection types.</li></ul>`,
            r`@Service
class Audit {
    private final int retries;
    Audit(@Value("$" + "{audit.retries:3}") int retries) {
        this.retries = retries;
    }
}

# OUTPUT:
# retries = 3 unless audit.retries is set`],
        [`<p>Mistakes:</p><ul><li><b>Injecting into static fields</b> does nothing.</li><li><b>Using injected fields in a constructor</b> when field injection is used: they are still null.</li><li><b>Wrong type:</b> inject the interface, not the implementation, so proxies work.</li></ul>`,
            r`@Service
class Bad {
    @Autowired private Repo repo;
    Bad() { repo.load(); }       // NullPointerException: repo not yet injected
}
// FIX: take Repo as a constructor parameter

// OUTPUT:
// BeanInstantiationException caused by NullPointerException`],
        [`<p>Performance:</p><ul><li>Injection metadata is cached per class, so cost is mostly at startup.</li><li>Avoid large collections of heavy beans injected everywhere.</li><li>Use <code>ObjectProvider</code> to delay lookup.</li></ul>`,
            r`@Service
class Heavy {
    private final ObjectProvider<Engine> engine;
    Heavy(ObjectProvider<Engine> engine) { this.engine = engine; }
    void run() { engine.getObject().start(); }   // created only when needed
}

// OUTPUT:
// Engine created on first run(), not at startup`],
        [`<p>A notification system injects all channel beans (email, SMS, push) as a list and sends to each. Adding a new channel needs only a new component class.</p>`,
            r`@Service
class Broadcaster {
    private final List<Channel> channels;
    Broadcaster(List<Channel> channels) { this.channels = channels; }
    void all(String msg) { channels.forEach(c -> c.send(msg)); }
}

// OUTPUT:
// email: Maintenance at 10pm
// sms: Maintenance at 10pm`]
    ),

    'sb-constructor-injection': dv(
        [`<p>Spring chooses the constructor like this:</p><ul><li>One constructor: used.</li><li>Several: the one with <code>@Autowired</code>; else the no-arg one.</li><li>Arguments are resolved recursively, so dependencies are built first.</li><li>Kotlin and Java records with one constructor work the same way.</li></ul>`,
            r`@Component
class Multi {
    Multi() { System.out.println("default"); }
    @Autowired
    Multi(Clock c) { System.out.println("with clock"); }
}

// OUTPUT:
// with clock`],
        [`<p>Variants:</p><ul><li><b>Plain constructor</b> with final fields.</li><li><b>Lombok</b> <code>@RequiredArgsConstructor</code>.</li><li><b>@Qualifier on parameter</b> to select a bean.</li><li><b>Optional</b> parameter via <code>Optional&lt;T&gt;</code> or <code>@Nullable</code>.</li></ul>`,
            r`@Service
class Shipper {
    private final Optional<Tracker> tracker;
    Shipper(Optional<Tracker> tracker) { this.tracker = tracker; }
    String ship() { return tracker.map(Tracker::id).orElse("untracked"); }
}

// OUTPUT:
// ship() -> untracked   (when no Tracker bean exists)`],
        [`<p>Mistakes:</p><ul><li><b>Too many parameters:</b> split the class.</li><li><b>Circular reference:</b> A needs B and B needs A.</li><li><b>Logic in constructor:</b> keep it to assignments.</li></ul>`,
            r`@Service class A { A(B b) { } }
@Service class B { B(A a) { } }
// FIX: move shared code to C, or inject B with @Lazy in A

@Service class A2 { A2(@Lazy B2 b) { } }

// OUTPUT:
// Application starts: A2 receives a lazy proxy of B2`],
        [`<p>Cost is negligible: constructor calls are resolved once at startup. Benefit comes from clear structure and immutable, thread-safe beans.</p>`,
            r`@Service
public final class RateService {
    private final Map<String, Double> rates;
    public RateService(RateRepository repo) {
        this.rates = Map.copyOf(repo.loadAll());   // immutable snapshot
    }
}

// OUTPUT:
// rates loaded once; safe to read from many threads`],
        [`<p>A payroll service needs a repository, a tax calculator and a clock. Using constructor injection with a fixed <code>Clock</code> makes tests deterministic.</p>`,
            r`@Service
class PayrollService {
    private final Clock clock;
    PayrollService(Clock clock) { this.clock = clock; }
    LocalDate payDay() { return LocalDate.now(clock).withDayOfMonth(28); }
}

var fixed = Clock.fixed(Instant.parse("2025-03-10T00:00:00Z"), ZoneOffset.UTC);
System.out.println(new PayrollService(fixed).payDay());

// OUTPUT:
// 2025-03-28`]
    ),

    'sb-setter-injection': dv(
        [`<p>Steps for a setter-injected bean:</p><ul><li>Instantiate through the default constructor.</li><li><code>populateBean</code> finds <code>@Autowired</code> methods in <code>InjectionMetadata</code>.</li><li>Each setter is invoked by reflection with the resolved bean.</li><li>Then Aware callbacks and init methods run.</li></ul>`,
            r`@Component
class Demo {
    Demo() { System.out.println("1 constructed"); }
    @Autowired void setDep(Dep d) { System.out.println("2 setter"); }
    @PostConstruct void init() { System.out.println("3 init"); }
}

// OUTPUT:
// 1 constructed
// 2 setter
// 3 init`],
        [`<p>Variants:</p><ul><li><b>@Autowired(required=false)</b> for optional.</li><li><b>@Autowired on any method</b> with several parameters.</li><li><b>@Required</b> was removed in Spring 6.</li><li><b>@Resource</b> on setter injects by name.</li></ul>`,
            r`@Autowired
public void configure(Clock clock, Validator validator) {
    this.clock = clock;
    this.validator = validator;
}

// OUTPUT:
// both parameters resolved and passed in one call`],
        [`<p>Mistakes:</p><ul><li>Forgetting <code>@Autowired</code>: setter is never called, field stays null.</li><li>Calling the dependency in the constructor.</li><li>Making setters public so other code can swap dependencies.</li></ul>`,
            r`@Service
class Quote {
    private Source source;
    public void setSource(Source s) { this.source = s; }   // no @Autowired
    String get() { return source.read(); }
}

// OUTPUT:
// NullPointerException: because "this.source" is null
// FIX: add @Autowired or use a constructor`],
        [`<p>Setter injection costs the same as other styles. Objects are mutable, so share them across threads only if the setters are never called after startup.</p>`,
            r`@Service
class Settings {
    private volatile Formatter formatter = new PlainFormatter();
    @Autowired(required = false)
    void setFormatter(Formatter f) { this.formatter = f; }
}

// OUTPUT:
// volatile makes later replacement visible to other threads`],
        [`<p>A legacy library bean needs optional plug-ins (logger, metrics). Setters with defaults let the application add them only when present.</p>`,
            r`@Component
class Exporter {
    private Metrics metrics = Metrics.NOOP;
    @Autowired(required = false)
    void setMetrics(Metrics m) { this.metrics = m; }
    void export() { metrics.count("export"); }
}

// OUTPUT:
// export() works with or without a Metrics bean`]
    ),

    'sb-field-injection': dv(
        [`<p>How it works:</p><ul><li><code>AutowiredAnnotationBeanPostProcessor</code> scans fields for <code>@Autowired</code>, <code>@Value</code> and <code>@Inject</code>.</li><li>It resolves the dependency, calls <code>field.setAccessible(true)</code> and <code>field.set(bean, value)</code>.</li><li>This happens after the constructor, in <code>postProcessProperties</code>.</li></ul>`,
            r`Field f = ReportService.class.getDeclaredField("repo");
f.setAccessible(true);
f.set(service, mockRepo);                 // what Spring does internally
System.out.println(f.get(service) == mockRepo);

// OUTPUT:
// true`],
        [`<p>Variants and annotations:</p><ul><li><b>@Autowired</b> (Spring), <b>@Inject</b> (JSR-330), <b>@Resource</b> (by name).</li><li><b>@Value</b> on a field for properties.</li><li><b>Test classes</b> use it freely: <code>@Autowired MockMvc mvc</code>.</li></ul>`,
            r`@SpringBootTest
class ReportIT {
    @Autowired ReportService service;       // fine in tests

    @Test
    void works() { assertNotNull(service); }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
        [`<p>Mistakes:</p><ul><li>Using the field in the constructor or a field initializer.</li><li>Creating the class with <code>new</code>.</li><li>Many fields, hiding a class that does too much.</li><li>Cycles are not detected until runtime.</li></ul>`,
            r`@Service
class Cache {
    @Autowired private Store store;
    private final int size = store.size();     // store is null here

}

// OUTPUT:
// NullPointerException during bean creation
// FIX: use a constructor or @PostConstruct`],
        [`<p>No speed difference after startup. The real cost is maintenance: harder tests and hidden coupling. Static analysis tools and SonarQube warn about field injection.</p>`,
            r`// Sonar rule: "Dependencies should be injected through constructors"
// Fix once per class:
@Service
@RequiredArgsConstructor
class OrderService {
    private final OrderRepository repo;
}

// OUTPUT:
// warning removed; class can be tested with new OrderService(mock)`],
        [`<p>A large old codebase uses field injection everywhere. A safe migration is class by class: add a constructor, make fields final, run tests, and repeat.</p>`,
            r`// before
@Autowired private A a;
@Autowired private B b;

// after
private final A a;
private final B b;
OrderService(A a, B b) { this.a = a; this.b = b; }

// OUTPUT:
// behavior unchanged; tests no longer need @InjectMocks`]
    ),

    'sb-spring-beans': dv(
        [`<p>Where beans come from:</p><ul><li><b>Scanning:</b> <code>ClassPathBeanDefinitionScanner</code> finds stereotype classes.</li><li><b>@Configuration:</b> <code>ConfigurationClassPostProcessor</code> parses <code>@Bean</code> methods and <code>@Import</code>.</li><li><b>Auto-configuration:</b> Boot lists candidates in <code>AutoConfiguration.imports</code>, filtered by conditions.</li><li>Each becomes a <code>BeanDefinition</code> in the registry.</li></ul>`,
            r`BeanDefinition bd = ctx.getBeanFactory().getBeanDefinition("counter");
System.out.println(bd.getBeanClassName() + " scope=" + bd.getScope());

// OUTPUT:
// com.example.Counter scope=singleton   (empty scope means singleton)`],
        [`<p>Options:</p><ul><li><b>@Bean(name, initMethod, destroyMethod)</b>, and several names via an array.</li><li><b>@Import</b> and <code>ImportSelector</code> to add configuration classes.</li><li><b>FactoryBean</b> for complex creation logic.</li><li><b>@DependsOn</b> to force creation order.</li><li><b>Programmatic:</b> <code>registerBean</code> on a <code>GenericApplicationContext</code>.</li></ul>`,
            r`var ctx = new GenericApplicationContext();
ctx.registerBean("clock", Clock.class, Clock::systemUTC);
ctx.refresh();
System.out.println(ctx.getBean("clock").getClass().getSimpleName());

// OUTPUT:
// SystemClock`],
        [`<p>Mistakes:</p><ul><li>Calling a <code>@Bean</code> method from a non-configuration class creates a new object each time.</li><li>Two beans with the same name override each other (Boot 2.1+ forbids it by default).</li><li>Stateful singleton beans shared by many requests.</li></ul>`,
            r`@Service
class Wrong {
    private User current;                  // shared by all requests!
    void login(User u) { this.current = u; }
}
// FIX: keep state in method parameters, the session or a database

// OUTPUT:
// users see each other data under concurrent load`],
        [`<p>Tuning:</p><ul><li><code>@Configuration(proxyBeanMethods = false)</code> for faster startup.</li><li>Conditional beans to skip unused infrastructure.</li><li>Exclude unwanted auto-configurations.</li></ul>`,
            r`@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
public class ToolApp { }

@Configuration(proxyBeanMethods = false)
class FastCfg {
    @Bean Parser parser() { return new Parser(); }
}

// OUTPUT:
// fewer beans created; startup is shorter (varies)`],
        [`<p>A payment gateway client from a vendor library cannot be annotated, so an <code>@Bean</code> method builds it from properties.</p>`,
            r`@Configuration
class GatewayConfig {
    @Bean
    GatewayClient gatewayClient(GatewayProps props) {
        return GatewayClient.builder()
            .url(props.url()).timeout(props.timeout()).build();
    }
}

// OUTPUT:
// bean 'gatewayClient' available for injection anywhere`]
    ),

    'sb-bean-lifecycle': dv(
        [`<p>Full order in <code>AbstractAutowireCapableBeanFactory</code>:</p><ul><li>createBeanInstance (constructor)</li><li>populateBean (fields and setters)</li><li>BeanNameAware, BeanFactoryAware, ApplicationContextAware</li><li>postProcessBeforeInitialization (this runs <code>@PostConstruct</code>)</li><li>afterPropertiesSet, custom init-method</li><li>postProcessAfterInitialization (AOP proxy is created here)</li><li>on close: @PreDestroy, destroy(), destroy-method</li></ul>`,
            r`@Component
class Full implements BeanNameAware, InitializingBean, DisposableBean {
    public void setBeanName(String n) { System.out.println("aware " + n); }
    @PostConstruct void pc() { System.out.println("postConstruct"); }
    public void afterPropertiesSet() { System.out.println("afterProps"); }
    @PreDestroy void pd() { System.out.println("preDestroy"); }
    public void destroy() { System.out.println("destroy"); }
}

// OUTPUT:
// aware full
// postConstruct
// afterProps
// preDestroy
// destroy`],
        [`<p>Other lifecycle hooks:</p><ul><li><b>SmartLifecycle:</b> start and stop with phases, used by servers and consumers.</li><li><b>ApplicationRunner and CommandLineRunner:</b> run after startup.</li><li><b>Events:</b> <code>ContextRefreshedEvent</code>, <code>ApplicationReadyEvent</code>, <code>ContextClosedEvent</code>.</li></ul>`,
            r`@Component
class Warmup {
    @EventListener(ApplicationReadyEvent.class)
    void warm() { System.out.println("cache warmed"); }
}

@Bean
CommandLineRunner seed(UserRepository repo) {
    return args -> repo.save(new User("admin"));
}

// OUTPUT:
// cache warmed`],
        [`<p>Mistakes:</p><ul><li><b>@PostConstruct on a prototype</b> expecting a @PreDestroy later: never called.</li><li><b>Exception in init</b> aborts the whole application.</li><li><b>Static or parameterized @PostConstruct:</b> must be a no-argument instance method.</li><li><b>Long blocking init</b> delays readiness.</li></ul>`,
            r`@Component
class Loader {
    @PostConstruct
    void load() { throw new IllegalStateException("file missing"); }
}

// OUTPUT:
// BeanCreationException: Error creating bean with name 'loader':
// Invocation of init method failed; nested exception is IllegalStateException`],
        [`<p>Move slow work off the startup path:</p><ul><li>Use <code>@Async</code> or run after <code>ApplicationReadyEvent</code>.</li><li>Close resources in <code>@PreDestroy</code> so threads stop cleanly.</li><li>Set <code>server.shutdown=graceful</code>.</li></ul>`,
            r`# application.properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s

# OUTPUT:
# Commencing graceful shutdown. Waiting for active requests to complete`],
        [`<p>A bean opens a thread pool at startup and must stop it on shutdown to avoid a hang or lost tasks.</p>`,
            r`@Component
class TaskRunner {
    private ExecutorService pool;
    @PostConstruct void start() { pool = Executors.newFixedThreadPool(4); }
    @PreDestroy void stop() throws InterruptedException {
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);
    }
}

// OUTPUT:
// pool started with 4 threads; on shutdown tasks finish within 10 seconds`]
    ),

    'sb-bean-scopes': dv(
        [`<p>Scope internals:</p><ul><li><b>Singleton:</b> stored in the <code>singletonObjects</code> map.</li><li><b>Prototype:</b> <code>createBean</code> runs on every <code>getBean</code>; the container then forgets it.</li><li><b>Request and session:</b> stored as attributes of the request or <code>HttpSession</code> by <code>RequestScope</code> and <code>SessionScope</code>.</li><li><b>Custom scope:</b> implement <code>Scope</code> and register it.</li></ul>`,
            r`@Component @Scope("prototype")
class Ticket {
    private static final AtomicInteger N = new AtomicInteger();
    final int no = N.incrementAndGet();
}

System.out.println(ctx.getBean(Ticket.class).no);
System.out.println(ctx.getBean(Ticket.class).no);

// OUTPUT:
// 1
// 2`],
        [`<p>Scope options:</p><ul><li><b>Shortcuts:</b> <code>@RequestScope</code>, <code>@SessionScope</code>, <code>@ApplicationScope</code>.</li><li><b>proxyMode:</b> <code>TARGET_CLASS</code> or <code>INTERFACES</code>.</li><li><b>@Lookup</b> method returns a fresh bean from a singleton.</li><li><b>Thread scope</b> exists via <code>SimpleThreadScope</code> but is not registered by default.</li></ul>`,
            r`@Component
@RequestScope
class RequestInfo {
    final String id = UUID.randomUUID().toString();
}

@RestController
class InfoController {
    private final RequestInfo info;      // proxy, resolved per request
    InfoController(RequestInfo info) { this.info = info; }
    @GetMapping("/id") String id() { return info.id; }
}

// OUTPUT: (varies)
// GET /id -> 7c1b0e3a-...   (different on each request)`],
        [`<p>Mistakes:</p><ul><li><b>Request-scoped bean injected without a proxy</b> into a singleton: fails outside a request.</li><li><b>Mutable state in singletons</b> causes race conditions.</li><li><b>Prototype injected into a singleton</b> gives the same instance forever.</li></ul>`,
            r`@Service
class Bad {
    private final Fresh fresh;               // prototype injected once
    Bad(Fresh fresh) { this.fresh = fresh; }
}

// OUTPUT:
// the same Fresh object is used for every call
// FIX: inject ObjectProvider<Fresh> and call getObject()
// Request scope without proxy outside a request:
// IllegalStateException: No thread-bound request found`],
        [`<p>Scope and performance:</p><ul><li>Singletons are cheapest: created once.</li><li>Prototypes cost an allocation and initialization on every use.</li><li>Scoped proxies add one small indirection.</li><li>Prefer stateless singletons plus method parameters.</li></ul>`,
            r`@Service
class StatelessPricing {                  // safe: no mutable fields
    double price(double base, double rate) { return base * (1 + rate); }
}

// OUTPUT:
// one shared instance serves all threads without locks`],
        [`<p>A shopping site keeps the cart in session scope so each visitor has an independent cart, while services stay singletons.</p>`,
            r`@Component
@SessionScope
class ShoppingCart {
    private final List<String> items = new ArrayList<>();
    void add(String item) { items.add(item); }
    List<String> items() { return items; }
}

@RestController
class CartController {
    private final ShoppingCart cart;
    CartController(ShoppingCart cart) { this.cart = cart; }
    @PostMapping("/cart/{item}")
    List<String> add(@PathVariable String item) {
        cart.add(item);
        return cart.items();
    }
}

// OUTPUT:
// POST /cart/pen  (session A) -> ["pen"]
// POST /cart/ink  (session B) -> ["ink"]`]
    )
};
