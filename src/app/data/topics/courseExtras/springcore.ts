// Spring Core course extras (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const springCoreExtras: Record<string, Extra> = {
    'spring-introduction-ioc': x(
        ['Spring is a Java framework that manages objects (beans) and their dependencies so your classes stay simple and loosely coupled.',
            'IoC (Inversion of Control) means the container creates and wires objects instead of your code calling <code>new</code>.',
            'The container is the <code>ApplicationContext</code>; it reads configuration (annotations, Java config or XML) and builds the beans.'],
        ['A bean is any object managed by the container; by default it is a singleton per container.',
            'Configure with <code>@Component</code> and component scanning, <code>@Configuration</code> classes with <code>@Bean</code> methods, or XML.',
            'Benefits: easier testing (swap dependencies), centralized configuration, lifecycle management and AOP support.'],
        ['Understand the bean lifecycle: instantiate, populate dependencies, aware callbacks, post processors, init method, ready, destroy.',
            'Scopes: singleton (default), prototype, request, session, application; choose by statefulness.',
            'Spring Boot builds on Spring Core with auto-configuration; knowing the container explains most Boot behaviour.'],
        [['F', 'What is IoC?', 'Inversion of Control: the framework controls object creation and wiring instead of your code.'],
            ['F', 'What is a Spring bean?', 'An object created, wired and managed by the Spring container.'],
            ['M', 'What is the difference between BeanFactory and ApplicationContext?', 'ApplicationContext extends BeanFactory with events, internationalization, annotation support and eager singleton creation; it is what you normally use.'],
            ['M', 'What is the default bean scope?', 'Singleton: one shared instance per container.'],
            ['S', 'Why is IoC useful for testing?', 'Dependencies are injected, so tests can supply fakes or mocks without changing production code.'],
            ['S', 'What happens when a singleton depends on a prototype bean?', 'The prototype is injected once; to get a new instance each time use ObjectProvider, a lookup method or a scoped proxy.']],
        [['Create a context and get a bean.',
            r`@Configuration
class AppConfig {
    @Bean GreetingService greetingService() { return new GreetingService("Hello"); }
}
public class Main {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            GreetingService s = ctx.getBean(GreetingService.class);
            System.out.println(s.greet("Asha"));
        }
    }
}

// OUTPUT:
// Hello, Asha`],
            ['Component scanning.',
                r`@Component class Mailer { String send(String to) { return "mail to " + to; } }
@Configuration @ComponentScan("com.shop") class Config { }
var ctx = new AnnotationConfigApplicationContext(Config.class);
System.out.println(ctx.getBean(Mailer.class).send("a@x.com"));

// OUTPUT:
// mail to a@x.com`]],
        [['Lifecycle callbacks.',
            r`@Component class Connection {
    @PostConstruct void open() { System.out.println("open"); }
    @PreDestroy void close() { System.out.println("close"); }
}

// OUTPUT:
// open          (after creation)
// close         (when the context closes)`],
            ['Prototype scope.',
                r`@Component @Scope("prototype") class Cart { }
System.out.println(ctx.getBean(Cart.class) == ctx.getBean(Cart.class));

// OUTPUT:
// false`]]
    ),

    'first-spring-application': x(
        ['A first Spring application needs a Maven or Gradle project with <code>spring-context</code>, a bean class, a configuration and a main class that starts the context.',
            'Define beans with <code>@Component</code> or <code>@Bean</code> and fetch them from the <code>ApplicationContext</code>.',
            'Run it with your IDE or <code>mvn exec:java</code>.'],
        ['Use constructor injection to give a bean its collaborators.',
            'Externalize values with <code>@Value("${app.name}")</code> and property sources.',
            'Log with SLF4J instead of System.out in real applications.'],
        ['Prefer Spring Boot for new applications; plain Spring Core is useful to understand the container.',
            'Keep configuration classes small and explicit; avoid broad component scans of third-party packages.',
            'Write a test with <code>@SpringJUnitConfig</code> to verify the context starts and beans wire up.'],
        [['F', 'What dependency gives you the Spring container?', '<code>spring-context</code> (which brings spring-core and spring-beans).'],
            ['F', 'How do you start the container?', 'Create an AnnotationConfigApplicationContext with your configuration class.'],
            ['M', 'How do you read a property in a bean?', 'With <code>@Value</code> and a PropertySource or application.properties.'],
            ['M', 'Why constructor injection?', 'It makes dependencies explicit and final, and allows easy construction in tests without a container.'],
            ['S', 'How do you test the wiring?', 'Use @SpringJUnitConfig with the configuration class and assert beans are present and behave correctly.'],
            ['S', 'Why use Spring Boot instead?', 'It provides auto-configuration, starters, embedded servers and production features, reducing setup.']],
        [['Pom and main class.',
            r`<dependency><groupId>org.springframework</groupId><artifactId>spring-context</artifactId><version>6.1.5</version></dependency>

@Configuration @ComponentScan
public class App {
    public static void main(String[] args) {
        var ctx = new AnnotationConfigApplicationContext(App.class);
        ctx.getBean(OrderService.class).place("A1", 2);
    }
}

// OUTPUT:
// order placed: A1 x2`],
            ['Properties.',
                r`@Configuration @PropertySource("classpath:app.properties") class Config { }
@Component class Banner { private final Environment env; Banner(Environment env) { this.env = env; } void print() { System.out.println("Welcome to " + env.getProperty("app.name", "Shop")); } }

// OUTPUT:
// Welcome to JavaSchoolLab`]],
        [['Context test.',
            r`@SpringJUnitConfig(Config.class)
class WiringTest {
    @Autowired OrderService service;
    @Test void wires() { assertNotNull(service); }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Constructor injected service.',
                r`@Service class OrderService {
    private final InventoryService inventory;
    OrderService(InventoryService inventory) { this.inventory = inventory; }
    void place(String sku, int qty) { inventory.reserve(sku, qty); System.out.println("order placed: " + sku + " x" + qty); }
}

// OUTPUT:
// order placed: A1 x2`]]
    ),

    'spring-dependency-injection': x(
        ['Dependency injection gives a bean its dependencies from outside. The two main styles are constructor injection and setter injection.',
            'Constructor injection is preferred for required dependencies; setter injection for optional ones.',
            'With a single constructor Spring injects it automatically; <code>@Autowired</code> is not needed.'],
        ['Field injection (<code>@Autowired</code> on a field) works but hides dependencies and complicates tests; avoid it.',
            'Use <code>@Qualifier</code> or <code>@Primary</code> when several beans of the same type exist.',
            'Collections and maps of beans can be injected: <code>List&lt;Plugin&gt;</code>.'],
        ['Circular dependencies are a design smell; fix by redesigning, or use setter injection or <code>@Lazy</code> as a last resort.',
            'Inject interfaces, not implementations, to keep coupling low.',
            '<code>ObjectProvider&lt;T&gt;</code> supports optional and lazy lookups.'],
        [['F', 'What is dependency injection?', 'Supplying an object its dependencies from outside instead of creating them inside.'],
            ['F', 'Constructor vs setter injection?', 'Constructor for required dependencies (immutable, explicit); setter for optional or reconfigurable ones.'],
            ['M', 'Why avoid field injection?', 'It hides dependencies, prevents final fields and makes unit tests need reflection or the container.'],
            ['M', 'How do you choose among several implementations?', '@Primary on one, @Qualifier at the injection point, or inject a List/Map of all of them.'],
            ['S', 'How do you resolve a circular dependency?', 'Refactor to remove the cycle (extract a third bean); as a last resort use setter injection or @Lazy.'],
            ['S', 'What does ObjectProvider give you?', 'Lazy, optional and multiple-bean access to a dependency without failing at startup.']],
        [['Constructor and setter injection.',
            r`@Service class OrderService {
    private final PaymentGateway gateway;           // required
    private Notifier notifier;                      // optional
    OrderService(PaymentGateway gateway) { this.gateway = gateway; }
    @Autowired(required = false) void setNotifier(Notifier n) { this.notifier = n; }
}

// OUTPUT:
// the context fails fast if PaymentGateway is missing; Notifier is optional`],
            ['Choosing among implementations.',
                r`interface PaymentGateway { void pay(double amt); }
@Component @Primary class StripeGateway implements PaymentGateway { public void pay(double a) { System.out.println("stripe " + a); } }
@Component("paypal") class PaypalGateway implements PaymentGateway { public void pay(double a) { System.out.println("paypal " + a); } }
@Service class Checkout { Checkout(@Qualifier("paypal") PaymentGateway g, List<PaymentGateway> all) { g.pay(10); System.out.println(all.size()); } }

// OUTPUT:
// paypal 10.0
// 2`]],
        [['Unit test without Spring.',
            r`@Test void placesOrder() {
    var gateway = mock(PaymentGateway.class);
    var service = new OrderService(gateway);
    service.place(10);
    verify(gateway).pay(10);
}

// OUTPUT:
// test passes with plain Java and a mock`],
            ['Lazy optional lookup.',
                r`@Service class Report { Report(ObjectProvider<Exporter> exporters) { exporters.ifAvailable(e -> e.export("startup")); } }

// OUTPUT:
// exporter is used only if such a bean exists`]]
    ),

    'spring-autowiring': x(
        ['Autowiring tells Spring to find and inject matching beans automatically. Use <code>@Autowired</code> on constructors, setters or fields.',
            'Matching is by type first; if several candidates exist, Spring uses <code>@Primary</code>, <code>@Qualifier</code> or the parameter name.',
            'If no bean matches a required dependency, the context fails to start with a clear error.'],
        ['Modes in XML: byType, byName, constructor, no. With annotations, constructor injection with one constructor is automatic.',
            '<code>@Autowired(required = false)</code> or <code>Optional&lt;T&gt;</code> makes a dependency optional.',
            '<code>@Resource</code> and <code>@Inject</code> are standard alternatives.'],
        ['Prefer constructor autowiring; it works with final fields and plain unit tests.',
            'Many candidates: inject <code>Map&lt;String, T&gt;</code> to select by bean name at runtime (strategy pattern).',
            'Be careful with generics: Spring can autowire by generic type (<code>Repository&lt;Order&gt;</code>) when types are resolvable.'],
        [['F', 'What does @Autowired do?', 'It asks Spring to inject a matching bean automatically.'],
            ['F', 'By what does Spring match first?', 'By type.'],
            ['M', 'What if two beans match?', 'Spring throws NoUniqueBeanDefinitionException unless @Primary, @Qualifier or a matching name resolves it.'],
            ['M', 'How do you make an injection optional?', '@Autowired(required = false), Optional, or ObjectProvider.'],
            ['S', 'How do you implement the strategy pattern with Spring?', 'Inject a Map of bean name to implementation (or a List) and pick one at runtime.'],
            ['S', 'Why can autowiring fail with proxies?', 'If a bean is JDK-proxied you must inject its interface type, not the concrete class.']],
        [['Strategy via Map injection.',
            r`interface Discount { double apply(double price); }
@Component("none") class NoDiscount implements Discount { public double apply(double p) { return p; } }
@Component("student") class StudentDiscount implements Discount { public double apply(double p) { return p * 0.9; } }
@Service class Pricing {
    private final Map<String, Discount> strategies;
    Pricing(Map<String, Discount> strategies) { this.strategies = strategies; }
    double price(String type, double base) { return strategies.getOrDefault(type, strategies.get("none")).apply(base); }
}
System.out.println(pricing.price("student", 100));

// OUTPUT:
// 90.0`],
            ['Optional dependency.',
                r`@Service class Audit { private final Optional<MetricsClient> metrics;
    Audit(Optional<MetricsClient> metrics) { this.metrics = metrics; }
    void log(String e) { metrics.ifPresent(m -> m.count(e)); } }

// OUTPUT:
// works with or without a MetricsClient bean`]],
        [['Ambiguity error.',
            r`@Autowired PaymentGateway gateway;      // two implementations, no qualifier

// OUTPUT:
// NoUniqueBeanDefinitionException: expected single matching bean but found 2: stripeGateway,paypal`],
            ['Autowire by generic type.',
                r`@Autowired Repository<Order> orders;      // resolves to the bean whose generic parameter is Order

// OUTPUT:
// injected OrderRepository`]]
    )
};

export const springCoreDeep: Record<string, Deep> = {
    'spring-introduction-ioc': dv(
        [`On startup the container reads bean definitions (from @Configuration/@Bean, scanned @Component classes or XML) into BeanDefinition objects, runs BeanFactoryPostProcessors, then instantiates singletons in dependency order. For each bean it resolves constructor arguments, injects properties, calls aware callbacks, runs BeanPostProcessors (this is where proxies for AOP and @Transactional are created), calls init methods and registers destroy callbacks.`,
            r`@Component class Audit implements InitializingBean, DisposableBean, BeanNameAware {
    public void setBeanName(String name) { System.out.println("1 name = " + name); }
    @PostConstruct void post() { System.out.println("2 @PostConstruct"); }
    public void afterPropertiesSet() { System.out.println("3 afterPropertiesSet"); }
    @PreDestroy void pre() { System.out.println("4 @PreDestroy"); }
    public void destroy() { System.out.println("5 destroy"); }
}

// OUTPUT:
// 1 name = audit
// 2 @PostConstruct
// 3 afterPropertiesSet
// (context closes) 4 @PreDestroy   5 destroy`],
        [`Configuration styles: annotations and component scanning, Java config (explicit and testable), XML (legacy), and imports/profiles to combine them. Scopes: singleton, prototype, request, session, application, websocket. Conditional beans with <code>@Profile</code>, <code>@Conditional</code>, <code>@ConditionalOnProperty</code> (Boot).`,
            r`@Configuration
@Profile("prod")
class ProdConfig { @Bean DataSource dataSource() { return new HikariDataSource(); } }
@Configuration @Profile("test")
class TestConfig { @Bean DataSource dataSource() { return new EmbeddedDatabaseBuilder().setType(H2).build(); } }
// run with -Dspring.profiles.active=prod

// OUTPUT:
// only the beans of the active profile are created`],
        [`Mistakes: new-ing a bean yourself (not managed: no injection, no proxy), singleton beans holding mutable per-request state (thread-safety bugs), injecting a prototype into a singleton and expecting new instances, and expensive work in constructors that slows startup. Keep singletons stateless.`,
            r`@Component class Counter { private int n; int next() { return ++n; } }       // shared singleton: not thread-safe and not per user
@Component @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS) class RequestContext { String user; }

// OUTPUT:
// the first is a bug under concurrency; the second gives each web request its own object behind a proxy`],
        [`Startup time grows with bean count and classpath scanning. Narrow component scans, use lazy initialization for rarely used beans, and measure startup. Singleton access after startup is just a map lookup, so runtime cost is negligible.`,
            r`@Lazy @Component class HeavyReport { HeavyReport() { /* expensive init */ } }
spring.main.lazy-initialization=true
long t = System.nanoTime(); var ctx = new AnnotationConfigApplicationContext(Config.class); System.out.println((System.nanoTime() - t) / 1_000_000 + " ms");

// OUTPUT:
// 412 ms      (HeavyReport is created on first use)`],
        [`Real-world: a layered application. Controllers depend on services, services on repositories and gateways, all as interfaces, wired by the container. Replacing a gateway in tests or per environment needs no changes in the services.`,
            r`@Service class CheckoutService {
    private final OrderRepository orders; private final PaymentGateway payments; private final Clock clock;
    CheckoutService(OrderRepository orders, PaymentGateway payments, Clock clock) { this.orders = orders; this.payments = payments; this.clock = clock; }
}
@TestConfiguration class TestClock { @Bean @Primary Clock fixed() { return Clock.fixed(Instant.parse("2026-05-01T10:00:00Z"), ZoneOffset.UTC); } }

// OUTPUT:
// tests run with a fixed clock and a fake gateway`]
    ),

    'first-spring-application': dv(
        [`Running new AnnotationConfigApplicationContext(App.class) triggers a sequence: register the configuration class, process annotations (<code>@ComponentScan</code>, <code>@Import</code>, <code>@Bean</code>), create bean definitions, instantiate singletons, and publish ContextRefreshedEvent. If a dependency is missing or ambiguous, startup fails with a message that names the bean and the missing type.`,
            r`@Configuration @ComponentScan("com.shop")
public class App {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(App.class)) {
            System.out.println(Arrays.toString(ctx.getBeanDefinitionNames()).contains("orderService"));
            ctx.getBean(OrderService.class).place("A1", 2);
        }
    }
}

// OUTPUT:
// true
// order placed: A1 x2`],
        [`Project options: plain Maven with spring-context, Spring Initializr with Spring Boot starters, Gradle, or an IDE wizard. Configuration options: Java config, component scan, property files (<code>@PropertySource</code>), profiles, environment variables and command-line arguments.`,
            r`<dependencies>
  <dependency><groupId>org.springframework</groupId><artifactId>spring-context</artifactId><version>6.1.5</version></dependency>
  <dependency><groupId>org.slf4j</groupId><artifactId>slf4j-simple</artifactId><version>2.0.12</version></dependency>
</dependencies>
mvn -q compile exec:java -Dexec.mainClass=com.shop.App

// OUTPUT:
// order placed: A1 x2`],
        [`Mistakes: missing the component scan (no beans found: NoSuchBeanDefinitionException), a wrong package in @ComponentScan, forgetting to close the context (destroy callbacks not run), and mixing XML and annotations without reason. Close the context with try-with-resources.`,
            r`ctx.getBean(OrderService.class);

// OUTPUT:
// NoSuchBeanDefinitionException: No qualifying bean of type 'com.shop.OrderService' available
// fix: add @Configuration @ComponentScan("com.shop") to the configuration class and annotate OrderService with @Service`],
        [`Keep startup light: scan only your packages, avoid heavy work in constructors, and use @PostConstruct or lazy beans for expensive initialization. Measure with simple timestamps or Actuator when you move to Boot.`,
            r`long start = System.nanoTime();
var ctx = new AnnotationConfigApplicationContext(App.class);
System.out.printf("started in %d ms with %d beans%n", (System.nanoTime() - start) / 1_000_000, ctx.getBeanDefinitionCount());

// OUTPUT:
// started in 138 ms with 24 beans`],
        [`Real-world: the same code runs in tests, a command-line job and a web app because the wiring lives in configuration, not in the classes. A scheduled batch can reuse the services unchanged.`,
            r`public class BatchMain {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(App.class)) {
            ctx.getBean(ReportService.class).generateDailyReport(LocalDate.now());
        }
    }
}

// OUTPUT:
// report written: daily-2026-05-01.csv`]
    ),

    'spring-dependency-injection': dv(
        [`Constructor injection happens during bean instantiation: Spring resolves each constructor parameter by type (and qualifier), creating those beans first. This makes dependencies part of the object's valid state and lets fields be final. Setter and field injection happen after instantiation by reflection, so the object exists in a partially initialized state in between.`,
            r`@Service class InvoiceService {
    private final TaxCalculator tax;
    private final Clock clock;
    InvoiceService(TaxCalculator tax, Clock clock) { this.tax = tax; this.clock = clock; }   // both required, final
    Invoice create(double net) { return new Invoice(net, tax.of(net), clock.instant()); }
}

// OUTPUT:
// the container creates TaxCalculator and Clock first, then InvoiceService`],
        [`Resolution rules: by type, then <code>@Primary</code>, then <code>@Qualifier</code> or <code>@Resource(name)</code>, then parameter name. Collections inject all matching beans (ordered by <code>@Order</code>). <code>@Lookup</code> methods and <code>ObjectProvider</code> create prototype instances on demand. <code>@DependsOn</code> controls initialization order.`,
            r`interface Validator { boolean ok(Order o); }
@Component @Order(1) class StockValidator implements Validator { public boolean ok(Order o) { return true; } }
@Component @Order(2) class FraudValidator implements Validator { public boolean ok(Order o) { return true; } }
@Service class OrderValidation { private final List<Validator> validators; OrderValidation(List<Validator> v) { this.validators = v; } boolean all(Order o) { return validators.stream().allMatch(x -> x.ok(o)); } }

// OUTPUT:
// both validators injected in @Order sequence`],
        [`Mistakes: field injection with private fields in classes you also construct manually (null fields), circular constructor dependencies (BeanCurrentlyInCreationException), huge constructors (a sign the class has too many responsibilities), and injecting concrete classes. Split the class, depend on interfaces and break cycles.`,
            r`@Service class A { A(B b) { } }
@Service class B { B(A a) { } }

// OUTPUT:
// BeanCurrentlyInCreationException: Error creating bean with name 'a': Requested bean is currently in creation: Is there an unresolvable circular reference?`],
        [`Injection cost is paid once at startup. The practical performance concern is prototype beans created per call and proxies created for AOP and transactions; keep hot paths free of unnecessary proxies and reflection by keeping logic in plain methods.`,
            r`@Autowired ObjectProvider<ReportBuilder> builders;      // prototype scope
ReportBuilder b = builders.getObject();                  // new instance per call, still container-managed

// OUTPUT:
// a fresh ReportBuilder with its dependencies injected`],
        [`Real-world: plugin architecture. New payment methods are added by creating a new bean; the checkout service receives all of them and selects one by key, with no changes to existing code.`,
            r`interface PaymentMethod { String code(); void pay(double amount); }
@Service class Checkout {
    private final Map<String, PaymentMethod> byCode;
    Checkout(List<PaymentMethod> methods) { this.byCode = methods.stream().collect(Collectors.toMap(PaymentMethod::code, m -> m)); }
    void pay(String code, double amt) { Optional.ofNullable(byCode.get(code)).orElseThrow(() -> new IllegalArgumentException("unknown " + code)).pay(amt); }
}

// OUTPUT:
// adding UpiPayment as a @Component makes pay("upi", 100) work with no other change`]
    ),

    'spring-autowiring': dv(
        [`Autowiring is implemented by AutowiredAnnotationBeanPostProcessor. For each bean it finds injection points (constructors, methods, fields), asks the BeanFactory to resolve a dependency descriptor (type, generics, qualifiers, required flag) and injects the result. Candidate selection narrows from all beans of the type to one using primary, qualifier and name rules.`,
            r`@Autowired Repository<Order> orders;
@Autowired @Qualifier("fast") Cache cache;
@Autowired List<Plugin> plugins;
@Autowired Map<String, Discount> strategies;
@Autowired(required = false) Optional<Metrics> metrics;
@Autowired ObjectProvider<Report> reports;

// OUTPUT:
// each injection point resolved by type with the extra rules applied`],
        [`Controls: <code>@Primary</code>, <code>@Qualifier</code> (also custom qualifier annotations), <code>@Resource(name=...)</code>, <code>@Value</code>, <code>@Lazy</code> on an injection point (injects a proxy resolved on first use), generics matching, and <code>@Order</code>/<code>Ordered</code> for lists.`,
            r`@Qualifier @Retention(RUNTIME) @interface Fast { }
@Component @Fast class InMemoryCache implements Cache { }
@Service class Catalog { Catalog(@Fast Cache cache, @Lazy ExpensiveClient client) { } }

// OUTPUT:
// Catalog gets the in-memory cache and a lazy proxy for the expensive client`],
        [`Mistakes: ambiguous candidates, autowiring a concrete class that is wrapped in a JDK proxy (type mismatch), relying on parameter names (not available without -parameters), and overusing @Lazy to hide circular design problems. Inject interfaces and be explicit with qualifiers.`,
            r`@Autowired TransactionalOrderService service;      // class is proxied as an interface: cannot be injected by class
// fix: inject the interface, or enable class proxies
@Autowired OrderService service;
spring.aop.proxy-target-class=true

// OUTPUT:
// BeanNotOfRequiredTypeException: Bean named 'orderService' is expected to be of type 'TransactionalOrderService' but was actually of type 'jdk.proxy2.$Proxy45'`],
        [`Resolution cost is only at startup. Runtime cost appears with lazy proxies and scoped proxies, which add an indirection per call; use them only where needed (request-scoped beans in singletons).`,
            r`@Component @Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS) class CurrentUser { String name; }
@Service class Greeter { private final CurrentUser user; Greeter(CurrentUser user) { this.user = user; } String hi() { return "Hi " + user.name; } }

// OUTPUT:
// each request sees its own CurrentUser through the proxy`],
        [`Real-world: feature toggles and environment-specific beans. A conditional bean chooses the implementation at startup, and services depend only on the interface.`,
            r`@Configuration class Beans {
    @Bean @ConditionalOnProperty(name = "payments.provider", havingValue = "stripe") PaymentGateway stripe() { return new StripeGateway(); }
    @Bean @ConditionalOnProperty(name = "payments.provider", havingValue = "paypal", matchIfMissing = true) PaymentGateway paypal() { return new PaypalGateway(); }
}

// OUTPUT:
// payments.provider=stripe wires StripeGateway everywhere PaymentGateway is injected`]
    )
};
