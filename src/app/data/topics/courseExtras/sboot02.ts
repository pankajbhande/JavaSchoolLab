// Spring extras, batch sboot02 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const sboot02Extras: Record<string, Extra> = {
    'sb-component': x(
        ['<b>@Component</b> marks a class as a Spring-managed bean; component scanning finds it and registers it in the container.',
            '<b>Stereotypes</b>: <code>@Service</code>, <code>@Repository</code> and <code>@Controller</code> are specializations of <code>@Component</code> with extra meaning.',
            '<b>Bean name</b> defaults to the class name with a lowercase first letter, so <code>PriceCalculator</code> becomes <code>priceCalculator</code>.'],
        ['<b>Scope</b> is singleton by default; add <code>@Scope(&quot;prototype&quot;)</code> for a new instance per injection.',
            '<b>Constructor injection</b> is preferred: a component with one constructor needs no <code>@Autowired</code>.',
            '<b>Custom name</b>: <code>@Component(&quot;calc&quot;)</code> sets the bean name explicitly.'],
        ['<b>Meta-annotation</b>: create your own stereotype by annotating an annotation with <code>@Component</code>.',
            '<b>Lifecycle</b>: use <code>@PostConstruct</code> and <code>@PreDestroy</code> (Jakarta) for init and cleanup hooks.',
            '<b>Use @Bean instead</b> for third-party classes you cannot annotate.'],
        [['F', 'What does @Component do?', 'It tells Spring to create and manage an instance of the class as a bean when it is found by component scanning.'],
            ['F', 'What is the default bean name?', 'The simple class name with the first letter in lowercase.'],
            ['M', 'How is @Service different from @Component?', 'Technically nothing; it only documents the role. @Repository additionally enables exception translation.'],
            ['M', 'Why is my @Component not found?', 'It is usually outside the package of the @SpringBootApplication class, so it is not scanned.'],
            ['S', 'How do you build a custom stereotype?', 'Create an annotation meta-annotated with @Component; scanning detects it through the meta-annotation.'],
            ['S', 'Is a @Component singleton thread safe?', 'No. The container shares one instance, so it must be stateless or protect its mutable state.']],
        [['A greeting component.',
            r`@Component
public class Greeter {
    public String greet(String name) {
        return "Hello, " + name;
    }
}

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        var ctx = SpringApplication.run(App.class, args);
        System.out.println(ctx.getBean(Greeter.class).greet("Asha"));
    }
}

// OUTPUT:
// Hello, Asha`],
            ['Custom bean name and scope.',
                r`@Component("clock")
@Scope("prototype")
public class Stamp {
    private final long created = System.nanoTime();
    public long created() { return created; }
}

// ctx.getBean("clock") != ctx.getBean("clock")
System.out.println(ctx.getBean("clock") == ctx.getBean("clock"));

// OUTPUT:
// false`]],
        [['Constructor injection between components.',
            r`@Component
class TaxRule { double rate() { return 0.18; } }

@Component
class Billing {
    private final TaxRule rule;
    Billing(TaxRule rule) { this.rule = rule; }   // no @Autowired needed
    double total(double net) { return net * (1 + rule.rate()); }
}

System.out.println(ctx.getBean(Billing.class).total(100));

// OUTPUT:
// 118.0`],
            ['A custom stereotype annotation.',
                r`@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
public @interface Handler { }

@Handler
class EmailHandler { }

System.out.println(ctx.containsBean("emailHandler"));

// OUTPUT:
// true`]]
    ),
    'sb-service': x(
        ['<b>@Service</b> marks a class as the business logic layer; it is a <code>@Component</code> specialization found by scanning.',
            '<b>Layering</b>: controller calls service, service calls repository; keep rules out of controllers.',
            '<b>Transactions</b> usually start here: put <code>@Transactional</code> on service methods that change data.'],
        ['<b>No extra behavior</b>: unlike <code>@Repository</code>, <code>@Service</code> adds no processing, it only states intent.',
            '<b>Interfaces</b>: a service interface plus an implementation makes testing with mocks easy.',
            '<b>Statelessness</b>: services are singletons, so avoid mutable instance fields.'],
        ['<b>Proxy limits</b>: self-invocation inside a service bypasses <code>@Transactional</code> because the proxy is skipped.',
            '<b>Unit tests</b> of a service need no Spring: create it with mocked collaborators using Mockito.',
            '<b>Boundaries</b>: return DTOs or domain objects from services, not HTTP types such as <code>ResponseEntity</code>.'],
        [['F', 'What is @Service for?', 'It marks the business logic layer class so Spring registers it as a bean.'],
            ['F', 'Which layer calls the service?', 'The controller calls the service, and the service calls repositories.'],
            ['M', 'Does @Service change runtime behavior?', 'No, it is a semantic stereotype over @Component.'],
            ['M', 'Where do you put @Transactional?', 'On service methods, so one business operation runs in one transaction.'],
            ['S', 'Why does a @Transactional method called from the same class not start a transaction?', 'The call does not pass through the Spring proxy, so the interceptor never runs.'],
            ['S', 'How do you test a service in isolation?', 'Plain JUnit with Mockito mocks for repositories; use @SpringBootTest only for integration tests.']],
        [['A service with a repository.',
            r`@Service
public class OrderService {
    private final OrderRepository repo;
    public OrderService(OrderRepository repo) { this.repo = repo; }

    public Order find(long id) {
        return repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("No order " + id));
    }
}

// OUTPUT:
// find(7) returns the Order, find(99) throws IllegalArgumentException: No order 99`],
            ['Transactional service method.',
                r`@Service
public class TransferService {
    private final AccountRepository accounts;
    public TransferService(AccountRepository a) { this.accounts = a; }

    @Transactional
    public void transfer(long from, long to, BigDecimal amt) {
        accounts.debit(from, amt);
        accounts.credit(to, amt);   // both succeed or both roll back
    }
}

// OUTPUT:
// an exception in credit() rolls back the debit as well`]],
        [['Unit test with Mockito.',
            r`class OrderServiceTest {
    @Test
    void findsOrder() {
        OrderRepository repo = mock(OrderRepository.class);
        when(repo.findById(1L)).thenReturn(Optional.of(new Order(1L)));
        var service = new OrderService(repo);
        System.out.println(service.find(1L).id());
    }
}

// OUTPUT:
// 1`],
            ['Self-invocation pitfall.',
                r`@Service
public class ReportService {
    public void run() {
        save();                 // direct call: proxy bypassed, no transaction
    }
    @Transactional
    public void save() { /* ... */ }
}
// Fix: move save() to another bean, or call it through an injected bean.

// OUTPUT:
// save() runs without a transaction when called from run()`]]
    ),
    'sb-repository': x(
        ['<b>@Repository</b> marks the data access layer; it is a <code>@Component</code> specialization.',
            '<b>Exception translation</b>: persistence exceptions are converted into Spring <code>DataAccessException</code> subclasses.',
            '<b>Spring Data</b> interfaces extending <code>JpaRepository</code> are detected automatically, so they need no annotation.'],
        ['<b>Translation mechanism</b>: a <code>PersistenceExceptionTranslationPostProcessor</code> wraps annotated beans in a proxy.',
            '<b>Derived queries</b>: a method like <code>findByEmail</code> becomes a query from its name.',
            '<b>Custom queries</b>: use <code>@Query</code> with JPQL or a native query.'],
        ['<b>Test slice</b>: <code>@DataJpaTest</code> loads only JPA components with an embedded database.',
            '<b>Projections</b> return only needed columns, with interfaces or records.',
            '<b>Transactions</b>: Spring Data repository methods are transactional; read methods are read-only by default.'],
        [['F', 'What is a repository in Spring?', 'A bean that handles data access, usually marked with @Repository or extending a Spring Data interface.'],
            ['F', 'Which interface gives you CRUD methods?', 'CrudRepository or JpaRepository from Spring Data.'],
            ['M', 'What does exception translation give you?', 'Vendor specific exceptions become the uniform DataAccessException hierarchy.'],
            ['M', 'How does findByEmail work without code?', 'Spring Data parses the method name and generates the query at startup.'],
            ['S', 'Do you need @Repository on a Spring Data interface?', 'No, it is detected by the repository infrastructure; the annotation only adds clarity.'],
            ['S', 'How do you test a repository?', 'Use @DataJpaTest with an embedded database, or Testcontainers for a real database.']],
        [['A Spring Data repository.',
            r`public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByActiveTrueOrderByNameAsc();
}

// usage
repo.save(new User("asha@x.com", "Asha"));
System.out.println(repo.findByEmail("asha@x.com").get().getName());

// OUTPUT:
// Asha`],
            ['A hand written @Repository.',
                r`@Repository
public class JdbcUserDao {
    private final JdbcTemplate jdbc;
    public JdbcUserDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public int count() {
        return jdbc.queryForObject("select count(*) from users", Integer.class);
    }
}

// OUTPUT:
// count() returns 3 for a table with three rows`]],
        [['@DataJpaTest.',
            r`@DataJpaTest
class UserRepositoryTest {
    @Autowired UserRepository repo;

    @Test
    void findsByEmail() {
        repo.save(new User("a@x.com", "A"));
        System.out.println(repo.findByEmail("a@x.com").isPresent());
    }
}

// OUTPUT:
// true`],
            ['Exception translation visible.',
                r`try {
    repo.save(new User("dup@x.com", "B"));   // unique constraint violated
} catch (DataIntegrityViolationException e) {
    System.out.println(e.getClass().getSimpleName());
}

// OUTPUT:
// DataIntegrityViolationException`]]
    ),
    'sb-controller': x(
        ['<b>@Controller</b> marks a web layer class whose handler methods process HTTP requests; it is a <code>@Component</code> specialization.',
            '<b>View return</b>: a handler returning a <code>String</code> is treated as a view name, for example for Thymeleaf.',
            '<b>@RestController</b> equals <code>@Controller</code> plus <code>@ResponseBody</code>, so return values become the response body.'],
        ['<b>Mappings</b>: <code>@GetMapping</code>, <code>@PostMapping</code> and friends bind methods to URLs and HTTP methods.',
            '<b>Model</b>: add data to a <code>Model</code> argument for the view to render.',
            '<b>Binding</b>: <code>@PathVariable</code>, <code>@RequestParam</code> and <code>@RequestBody</code> read request data.'],
        ['<b>Dispatch</b>: the <code>DispatcherServlet</code> finds the handler through <code>HandlerMapping</code> and calls it through a <code>HandlerAdapter</code>.',
            '<b>Slice test</b>: <code>@WebMvcTest</code> with <code>MockMvc</code> loads only the web layer.',
            '<b>Thin controllers</b>: delegate logic to services and keep controllers about HTTP only.'],
        [['F', 'What does @Controller do?', 'It marks a class as a web controller whose methods handle requests.'],
            ['F', 'Difference between @Controller and @RestController?', '@RestController adds @ResponseBody so return values are written to the body, usually as JSON.'],
            ['M', 'What happens when a @Controller method returns a String?', 'The string is resolved to a view name by a ViewResolver.'],
            ['M', 'How do you return JSON from a @Controller method?', 'Add @ResponseBody to the method or use @RestController.'],
            ['S', 'Which component calls your handler method?', 'DispatcherServlet picks it via HandlerMapping and invokes it through RequestMappingHandlerAdapter.'],
            ['S', 'How do you test a controller without a server?', '@WebMvcTest plus MockMvc, with services replaced by @MockBean or @MockitoBean.']],
        [['A view returning controller.',
            r`@Controller
public class HomeController {
    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("title", "Welcome");
        return "home";          // resolved to templates/home.html
    }
}

// OUTPUT:
// GET /home renders templates/home.html with title = Welcome`],
            ['JSON from a @Controller.',
                r`@Controller
public class InfoController {
    @GetMapping("/info")
    @ResponseBody
    public Map<String, String> info() {
        return Map.of("app", "demo");
    }
}

// OUTPUT:
// HTTP/1.1 200
// {"app":"demo"}`]],
        [['MockMvc slice test.',
            r`@WebMvcTest(HomeController.class)
class HomeControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void homeView() throws Exception {
        mvc.perform(get("/home"))
           .andExpect(status().isOk())
           .andExpect(view().name("home"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Path variable and request param.',
                r`@RestController
class UserController {
    @GetMapping("/users/{id}")
    String user(@PathVariable long id, @RequestParam(defaultValue = "en") String lang) {
        return "user " + id + " lang " + lang;
    }
}

// OUTPUT:
// GET /users/5?lang=hi  ->  user 5 lang hi`]]
    ),
    'sb-configuration': x(
        ['<b>@Configuration</b> marks a class that declares beans through <code>@Bean</code> methods; it replaces XML configuration.',
            '<b>Source of beans</b>: use it for wiring third-party classes and for infrastructure such as clocks and clients.',
            '<b>@SpringBootApplication</b> already includes <code>@Configuration</code>, so the main class can declare beans too.'],
        ['<b>CGLIB proxy</b>: a full @Configuration class is subclassed so that calls between <code>@Bean</code> methods return the same singleton.',
            '<b>proxyBeanMethods = false</b> skips that proxy for faster startup when beans do not call each other.',
            '<b>Properties</b>: combine with <code>@ConfigurationProperties</code> for typed settings.'],
        ['<b>Conditionals</b>: <code>@ConditionalOnProperty</code> and <code>@Profile</code> switch beans on and off.',
            '<b>Import</b>: <code>@Import</code> pulls in other configuration classes.',
            '<b>Testing</b>: <code>@TestConfiguration</code> adds or overrides beans for a single test.'],
        [['F', 'What is @Configuration?', 'A class-level annotation for a class that defines beans with @Bean methods.'],
            ['F', 'What does @Bean on a method do?', 'It registers the returned object as a bean in the container.'],
            ['M', 'Why is a @Configuration class proxied?', 'So that inter-bean method calls return the container singleton instead of creating a new object.'],
            ['M', 'What does proxyBeanMethods = false mean?', 'No CGLIB subclass is created, so bean methods called directly create new instances; startup is lighter.'],
            ['S', 'Difference between @Configuration and @Component with @Bean methods?', 'A @Component runs in lite mode without inter-bean call interception; @Configuration guarantees singleton semantics.'],
            ['S', 'How do you make a bean conditional?', 'Use @Profile, @ConditionalOnProperty or @ConditionalOnMissingBean on the class or method.']],
        [['A configuration class.',
            r`@Configuration
public class AppConfig {
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public Stamper stamper() {
        return new Stamper(clock());     // same Clock singleton
    }
}

// OUTPUT:
// ctx.getBean(Clock.class) == ctx.getBean(Stamper.class).clock() -> true`],
            ['Conditional bean.',
                r`@Configuration
public class CacheConfig {
    @Bean
    @ConditionalOnProperty(name = "app.cache", havingValue = "on")
    public CacheService cacheService() {
        return new CacheService();
    }
}

# OUTPUT:
# with app.cache=on the bean exists, otherwise it is not created`]],
        [['Test configuration override.',
            r`@SpringBootTest
class ClockTest {
    @TestConfiguration
    static class Fixed {
        @Bean @Primary
        Clock clock() {
            return Clock.fixed(Instant.parse("2025-01-01T00:00:00Z"), ZoneOffset.UTC);
        }
    }

    @Autowired Clock clock;

    @Test
    void usesFixedClock() {
        System.out.println(clock.instant());
    }
}

// OUTPUT:
// 2025-01-01T00:00:00Z`],
            ['Lite mode pitfall.',
                r`@Configuration(proxyBeanMethods = false)
class Lite {
    @Bean Engine engine() { return new Engine(); }
    @Bean Car car() { return new Car(engine()); }  // new Engine each time!
}
// Fix: take Engine as a parameter: Car car(Engine engine)

// OUTPUT:
// the Car gets a different Engine instance than the engine bean`]]
    ),
    'sb-bean': x(
        ['<b>@Bean</b> on a method registers its return value as a bean; the method name becomes the bean name.',
            '<b>Third-party classes</b> that you cannot annotate with <code>@Component</code> are registered with <code>@Bean</code>.',
            '<b>Placement</b>: put <code>@Bean</code> methods in a <code>@Configuration</code> class.'],
        ['<b>Dependencies</b> arrive as method parameters and Spring injects them.',
            '<b>Custom name</b>: <code>@Bean(&quot;mainDs&quot;)</code> or the <code>name</code> attribute sets one or several names.',
            '<b>Lifecycle</b>: <code>initMethod</code> and <code>destroyMethod</code> attributes name callbacks of the object.'],
        ['<b>Scope</b>: add <code>@Scope</code> to a @Bean method for prototype or request beans.',
            '<b>Static @Bean</b> methods are created early; use them for <code>BeanPostProcessor</code> beans.',
            '<b>Conditions</b>: <code>@ConditionalOnMissingBean</code> lets users override auto-configured beans.'],
        [['F', 'When do you use @Bean instead of @Component?', 'For classes you do not own or when creation needs custom code.'],
            ['F', 'What is the default bean name?', 'The name of the annotated method.'],
            ['M', 'How do you inject a dependency into a @Bean method?', 'Declare it as a method parameter; Spring resolves it.'],
            ['M', 'Is a @Bean singleton?', 'Yes by default, one instance per container.'],
            ['S', 'How can a bean be overridden by users in a library?', 'Annotate it with @ConditionalOnMissingBean so a user defined bean wins.'],
            ['S', 'What is the destroyMethod inference?', 'Spring calls a public close() or shutdown() method on bean destruction automatically for @Bean objects.']],
        [['Registering a library class.',
            r`@Configuration
public class HttpConfig {
    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder.baseUrl("https://api.example.com").build();
    }
}

// OUTPUT:
// RestClient bean is available for injection with the base URL set`],
            ['Named beans.',
                r`@Configuration
class Fmt {
    @Bean("shortDate")
    DateTimeFormatter shortDate() { return DateTimeFormatter.ofPattern("dd/MM/yy"); }
}

System.out.println(ctx.getBean("shortDate", DateTimeFormatter.class)
    .format(LocalDate.of(2025, 3, 9)));

// OUTPUT:
// 09/03/25`]],
        [['Init and destroy methods.',
            r`@Bean(initMethod = "open", destroyMethod = "close")
Connection connection() { return new Connection(); }

// OUTPUT:
// open() runs after construction, close() runs on context shutdown`],
            ['Back-off bean for users.',
                r`@Bean
@ConditionalOnMissingBean
public Notifier notifier() {
    return new LogNotifier();
}

// OUTPUT:
// LogNotifier is used unless the application defines its own Notifier bean`]]
    ),
    'sb-autowired': x(
        ['<b>@Autowired</b> asks Spring to inject a matching bean by type into a constructor, setter or field.',
            '<b>Constructor injection</b> is the recommended style; with one constructor the annotation is optional.',
            '<b>Required</b>: if no bean matches, startup fails with <code>NoSuchBeanDefinitionException</code>.'],
        ['<b>Field injection</b> works but hides dependencies and blocks easy unit testing.',
            '<b>Optional</b>: <code>@Autowired(required = false)</code> or <code>Optional&lt;T&gt;</code> allows a missing bean.',
            '<b>Collections</b>: injecting <code>List&lt;T&gt;</code> collects all beans of that type.'],
        ['<b>Resolution order</b>: by type, then <code>@Primary</code>, then <code>@Qualifier</code>, then parameter name.',
            '<b>Processor</b>: <code>AutowiredAnnotationBeanPostProcessor</code> performs the injection.',
            '<b>Circular dependencies</b> fail by default in Boot 2.6 and later; redesign instead of enabling them.'],
        [['F', 'What does @Autowired do?', 'It injects a dependency bean by type.'],
            ['F', 'Which injection style is preferred?', 'Constructor injection, because dependencies are explicit and can be final.'],
            ['M', 'What if two beans match the type?', 'Spring throws NoUniqueBeanDefinitionException unless @Primary, @Qualifier or the parameter name disambiguates.'],
            ['M', 'How to inject all implementations?', 'Declare a List or Map of the interface type.'],
            ['S', 'Which class processes @Autowired?', 'AutowiredAnnotationBeanPostProcessor.'],
            ['S', 'Why avoid field injection?', 'It needs reflection or Spring to set fields, hides dependencies and makes plain unit tests harder.']],
        [['Constructor injection.',
            r`@Service
public class ShippingService {
    private final RateClient client;

    public ShippingService(RateClient client) {   // implicit @Autowired
        this.client = client;
    }
}

// OUTPUT:
// RateClient bean is injected when the context starts`],
            ['Inject all implementations.',
                r`public interface Validator { boolean ok(String s); }

@Service
class Pipeline {
    private final List<Validator> validators;
    Pipeline(List<Validator> validators) { this.validators = validators; }
    long count() { return validators.size(); }
}

// OUTPUT:
// count() returns the number of Validator beans, for example 3`]],
        [['Test with a mock injected.',
            r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;       // replaces the real bean

    @Test
    void ok() throws Exception {
        when(service.name(1L)).thenReturn("Asha");
        mvc.perform(get("/users/1")).andExpect(content().string("Asha"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Ambiguity error.',
                r`@Component class SmsSender implements Sender { }
@Component class MailSender implements Sender { }

@Service
class Alerts {
    Alerts(Sender sender) { }     // two candidates
}

// OUTPUT:
// NoUniqueBeanDefinitionException: expected single matching bean
// but found 2: mailSender,smsSender`]]
    ),
    'sb-qualifier': x(
        ['<b>@Qualifier</b> chooses one bean by name when several beans of the same type exist.',
            '<b>Placement</b>: put it on the injection point, next to <code>@Autowired</code> or on a constructor parameter.',
            '<b>Without it</b>, two candidates cause <code>NoUniqueBeanDefinitionException</code>.'],
        ['<b>Bean name match</b>: the qualifier value matches the bean name or a qualifier on the bean definition.',
            '<b>On the bean</b>: annotate a component with <code>@Qualifier(&quot;fast&quot;)</code> to give it a label.',
            '<b>Versus @Primary</b>: <code>@Primary</code> sets a default, <code>@Qualifier</code> picks explicitly and wins.'],
        ['<b>Custom qualifier</b>: a meta-annotated annotation avoids string typos.',
            '<b>Parameter name fallback</b>: with compiler <code>-parameters</code> a parameter named like the bean also matches.',
            '<b>Lombok</b>: constructor parameter annotations need copyable annotations configured in <code>lombok.config</code>.'],
        [['F', 'Why is @Qualifier needed?', 'To choose between multiple beans of the same type.'],
            ['F', 'What does it match?', 'The bean name, or a qualifier value declared on the bean.'],
            ['M', 'Which wins, @Primary or @Qualifier?', '@Qualifier wins because it is the more specific choice.'],
            ['M', 'Can @Qualifier be used on a @Bean method?', 'Yes, it labels that bean so injection points can request it.'],
            ['S', 'How do you avoid string qualifiers?', 'Create a custom annotation meta-annotated with @Qualifier.'],
            ['S', 'How is the decision made internally?', 'ContextAnnotationAutowireCandidateResolver filters candidates by qualifier before @Primary and name fallback.']],
        [['Picking an implementation.',
            r`public interface Sender { String send(String msg); }

@Component("sms")
class SmsSender implements Sender {
    public String send(String m) { return "SMS:" + m; }
}

@Component("mail")
class MailSender implements Sender {
    public String send(String m) { return "MAIL:" + m; }
}

@Service
class Alerts {
    private final Sender sender;
    Alerts(@Qualifier("mail") Sender sender) { this.sender = sender; }
    String fire() { return sender.send("hi"); }
}

// OUTPUT:
// MAIL:hi`],
            ['Custom qualifier annotation.',
                r`@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Fast { }

@Fast @Component class FastSender implements Sender { /* ... */ }

Alerts(@Fast Sender sender) { this.sender = sender; }

// OUTPUT:
// FastSender is injected, and a typo is a compile error instead of a runtime error`]],
        [['Test selecting a bean.',
            r`@SpringBootTest
class QualifierTest {
    @Autowired @Qualifier("sms") Sender sender;

    @Test
    void usesSms() {
        System.out.println(sender.send("x"));
    }
}

// OUTPUT:
// SMS:x`],
            ['Qualifier on @Bean methods.',
                r`@Configuration
class DsConfig {
    @Bean @Qualifier("reporting")
    DataSource reportingDs() { return new HikariDataSource(); }

    @Bean @Qualifier("main")
    DataSource mainDs() { return new HikariDataSource(); }
}

// OUTPUT:
// @Qualifier("reporting") DataSource ds injects reportingDs`]]
    ),
    'sb-primary': x(
        ['<b>@Primary</b> marks one bean as the default choice when several beans of the same type exist.',
            '<b>Placement</b>: on a component class or a <code>@Bean</code> method.',
            '<b>Effect</b>: injection points without a qualifier receive the primary bean instead of failing.'],
        ['<b>Only one primary</b> per type is allowed; two primaries cause <code>NoUniqueBeanDefinitionException</code>.',
            '<b>Override</b>: an explicit <code>@Qualifier</code> still selects a non-primary bean.',
            '<b>Typical use</b>: the main <code>DataSource</code> or a production implementation next to a fallback.'],
        ['<b>Tests</b>: a <code>@TestConfiguration</code> bean marked <code>@Primary</code> replaces the real bean in a test.',
            '<b>Collections</b>: <code>@Primary</code> does not affect injection of <code>List&lt;T&gt;</code>, which gets all beans.',
            '<b>Alternative</b>: <code>@Order</code> and <code>@Priority</code> sort lists but do not choose a single bean.'],
        [['F', 'What is @Primary?', 'It marks the preferred bean when multiple candidates of a type exist.'],
            ['F', 'Where can it be placed?', 'On a class annotated as a component, or on a @Bean method.'],
            ['M', 'What if two beans are @Primary?', 'Spring throws NoUniqueBeanDefinitionException.'],
            ['M', 'How do you get the non-primary bean?', 'Use @Qualifier with its name at the injection point.'],
            ['S', 'Does @Primary affect List injection?', 'No, a List receives all matching beans.'],
            ['S', 'How does it help tests?', 'A test bean marked @Primary overrides the production one without touching production code.']],
        [['A primary default.',
            r`@Component @Primary
class StripePayment implements Payment {
    public String pay() { return "stripe"; }
}

@Component
class PaypalPayment implements Payment {
    public String pay() { return "paypal"; }
}

@Service
class Checkout {
    Checkout(Payment payment) { System.out.println(payment.pay()); }
}

// OUTPUT:
// stripe`],
            ['Primary on @Bean and qualifier override.',
                r`@Configuration
class Ds {
    @Bean @Primary DataSource main() { return new HikariDataSource(); }
    @Bean DataSource audit() { return new HikariDataSource(); }
}

class Repo {
    Repo(DataSource ds, @Qualifier("audit") DataSource auditDs) { }
}

// OUTPUT:
// ds is main (primary), auditDs is audit (explicit qualifier)`]],
        [['Test override.',
            r`@SpringBootTest
class PaymentTest {
    @TestConfiguration
    static class Fake {
        @Bean @Primary Payment fake() { return () -> "fake"; }
    }

    @Autowired Payment payment;

    @Test
    void usesFake() {
        System.out.println(payment.pay());
    }
}

// OUTPUT:
// fake`],
            ['Two primaries error.',
                r`@Component @Primary class A implements Payment { /* ... */ }
@Component @Primary class B implements Payment { /* ... */ }

// OUTPUT:
// NoUniqueBeanDefinitionException: more than one 'primary' bean found
// among candidates: [a, b]`]]
    ),
    'sb-component-scanning': x(
        ['<b>Component scanning</b> is how Spring finds classes annotated with <code>@Component</code> and its stereotypes and registers them as beans.',
            '<b>Default scope</b>: <code>@SpringBootApplication</code> scans the package of the main class and all sub-packages.',
            '<b>Placement rule</b>: keep the main class in the root package so every feature package is covered.'],
        ['<b>Custom packages</b>: <code>@ComponentScan(basePackages = ...)</code> sets other scan roots.',
            '<b>Filters</b>: include or exclude classes by annotation, type or regex.',
            '<b>Missing bean symptom</b>: a class in a sibling package is not scanned and injection fails.'],
        ['<b>Mechanism</b>: <code>ClassPathBeanDefinitionScanner</code> reads class metadata from the classpath without loading the classes.',
            '<b>Startup cost</b>: scanning a large package tree adds startup time, so narrow the roots in big apps.',
            '<b>Slices</b>: <code>@WebMvcTest</code> uses filters to scan only web components.'],
        [['F', 'What is component scanning?', 'Spring searches packages for annotated classes and registers them as beans.'],
            ['F', 'Which packages does Spring Boot scan?', 'The main class package and its sub-packages.'],
            ['M', 'Why is my bean not found?', 'Its package is outside the scanned tree, so move it or add basePackages.'],
            ['M', 'How do you exclude a class?', 'Use excludeFilters in @ComponentScan or the exclude attribute of @SpringBootApplication.'],
            ['S', 'How does scanning avoid loading every class?', 'ASM based metadata readers inspect the bytecode for annotations without class loading.'],
            ['S', 'How do you reduce scan time in a large app?', 'Limit basePackages, or declare beans with @Bean and @Import for explicit wiring.']],
        [['Default layout.',
            r`com.shop
  ShopApplication.java        // @SpringBootApplication
com.shop.order
  OrderService.java           // scanned
com.shop.user
  UserService.java            // scanned

// OUTPUT:
// both services are registered because they are below com.shop`],
            ['Custom base packages.',
                r`@SpringBootApplication
@ComponentScan(basePackages = {"com.shop", "com.shared.util"})
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}

// OUTPUT:
// beans from com.shop and com.shared.util are registered`]],
        [['Exclude by filter.',
            r`@ComponentScan(
    basePackages = "com.shop",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE, classes = LegacyService.class))
class Scan { }

// OUTPUT:
// LegacyService is not registered as a bean`],
            ['Verify scanned beans.',
                r`@SpringBootTest
class ScanTest {
    @Autowired ApplicationContext ctx;

    @Test
    void servicesRegistered() {
        System.out.println(ctx.containsBean("orderService"));
    }
}

// OUTPUT:
// true`]]
    )
};

export const sboot02Deep: Record<string, Deep> = {
    'sb-component': dv(
        [`<p>How a @Component becomes a bean:</p><ul><li><b>Scan:</b> the scanner finds candidate classes under the base packages.</li><li><b>Definition:</b> each one becomes a <code>BeanDefinition</code> with a name, scope and constructor.</li><li><b>Creation:</b> the container instantiates, injects dependencies and runs post processors.</li><li><b>Init:</b> <code>@PostConstruct</code> callbacks run, then the bean is ready.</li></ul>`,
            r`@Component
public class Cache {
    @PostConstruct void init() { System.out.println("init"); }
    @PreDestroy void stop() { System.out.println("stop"); }
}

// on startup and shutdown of the context

// OUTPUT:
// init
// stop`],
        [`<p>Variants of declaring a component:</p><ul><li><b>Stereotypes:</b> <code>@Service</code>, <code>@Repository</code>, <code>@Controller</code>.</li><li><b>Scope:</b> <code>@Scope</code> singleton, prototype, request, session.</li><li><b>Lazy:</b> <code>@Lazy</code> delays creation to first use.</li><li><b>Profile:</b> <code>@Profile(&quot;dev&quot;)</code> limits it to a profile.</li></ul>`,
            r`@Component
@Lazy
@Profile("dev")
public class DevSeeder {
    public DevSeeder() { System.out.println("seeder created"); }
}

// OUTPUT:
// (nothing printed until the first injection, and only when profile dev is active)`],
        [`<p>Common mistakes:</p><ul><li><b>Not scanned:</b> class outside the main package; move it or use <code>@ComponentScan</code>.</li><li><b>new instead of injection:</b> an object created with <code>new</code> is not a bean, so its dependencies stay null.</li><li><b>Mutable state:</b> shared fields in a singleton cause races.</li><li><b>Two same names:</b> two components with the same simple name clash; give an explicit name.</li></ul>`,
            r`@Service
class Report {
    @Autowired Printer printer;
}

Report r = new Report();      // WRONG: not managed
r.printer.print();            // NullPointerException

// FIX: inject Report where it is needed.

// OUTPUT:
// java.lang.NullPointerException: Cannot invoke "Printer.print()" because "r.printer" is null`],
        [`<p>Performance notes:</p><ul><li><b>Startup:</b> thousands of components add scan and creation time.</li><li><b>Lazy init:</b> <code>spring.main.lazy-initialization=true</code> defers creation, trading startup for first-request latency.</li><li><b>Prototype:</b> creates objects on every lookup; use only when state per use is needed.</li></ul>`,
            r`# application.properties
spring.main.lazy-initialization=true

# OUTPUT:
# context starts faster; beans are created on first use (varies by app)`],
        [`<p>Scenario: a notification feature with several channel components that a service collects and calls.</p><ul><li>Each channel is a <code>@Component</code> implementing one interface.</li><li>The service receives a <code>List</code> of channels.</li><li>Adding a channel needs no change to the service.</li></ul>`,
            r`public interface Channel { void send(String msg); }

@Component class EmailChannel implements Channel {
    public void send(String m) { System.out.println("email " + m); }
}
@Component class PushChannel implements Channel {
    public void send(String m) { System.out.println("push " + m); }
}

@Service
class Notifier {
    private final List<Channel> channels;
    Notifier(List<Channel> channels) { this.channels = channels; }
    void all(String m) { channels.forEach(c -> c.send(m)); }
}

// OUTPUT: (order varies)
// email hello
// push hello`]
    ),
    'sb-service': dv(
        [`<p>Internals of a service bean:</p><ul><li>Registered through scanning like any <code>@Component</code>.</li><li>When it has <code>@Transactional</code>, a proxy (CGLIB, subclass based) wraps it.</li><li>The proxy opens a transaction through <code>TransactionInterceptor</code>, calls the target, then commits or rolls back.</li></ul>`,
            r`@Service
public class PaymentService {
    @Transactional
    public void pay() { /* ... */ }
}

System.out.println(ctx.getBean(PaymentService.class).getClass().getSimpleName());

// OUTPUT:
// PaymentService$$SpringCGLIB$$0`],
        [`<p>Design variants:</p><ul><li><b>Class only:</b> simplest, enough for most apps.</li><li><b>Interface plus impl:</b> useful with several implementations.</li><li><b>Read/write split:</b> <code>@Transactional(readOnly = true)</code> on query methods.</li><li><b>Propagation:</b> <code>REQUIRES_NEW</code> for an independent transaction such as audit logs.</li></ul>`,
            r`@Service
@Transactional(readOnly = true)
public class CatalogService {
    @Transactional                       // overrides read-only for writes
    public void rename(long id, String name) { /* ... */ }

    public List<Item> all() { return List.of(); }
}

// OUTPUT:
// all() runs read-only; rename() runs in a read-write transaction`],
        [`<p>Mistakes:</p><ul><li><b>Fat controller, thin service:</b> move rules into the service.</li><li><b>Private @Transactional method:</b> proxies cannot intercept it.</li><li><b>Catching exceptions:</b> swallowing an exception prevents rollback.</li><li><b>Checked exceptions:</b> by default they do not roll back; use <code>rollbackFor</code>.</li></ul>`,
            r`@Transactional
public void import() throws IOException {
    repo.save(a);
    throw new IOException("bad file");     // checked: commits anyway!
}

@Transactional(rollbackFor = IOException.class)
public void importSafe() throws IOException { /* rolls back now */ }

// OUTPUT:
// import() commits the save; importSafe() rolls it back`],
        [`<p>Performance notes:</p><ul><li><b>Transaction length:</b> keep it short; do not call remote services inside.</li><li><b>Read only:</b> lets Hibernate skip dirty checking.</li><li><b>N+1 queries:</b> fetch associations deliberately with joins.</li></ul>`,
            r`@Transactional(readOnly = true)
public List<OrderDto> recent() {
    return repo.findRecentWithItems()     // join fetch, one query
               .stream().map(OrderDto::from).toList();
}

// OUTPUT:
// one SQL statement instead of 1 + N (varies)`],
        [`<p>Scenario: checkout service coordinating stock, payment and an order record.</p><ul><li>The service owns the transaction boundary.</li><li>Failure at any step rolls back the local database work.</li><li>The controller only maps HTTP to this call.</li></ul>`,
            r`@Service
public class CheckoutService {
    private final StockRepository stock;
    private final OrderRepository orders;
    public CheckoutService(StockRepository s, OrderRepository o) {
        this.stock = s; this.orders = o;
    }

    @Transactional
    public Order checkout(long itemId, int qty) {
        if (stock.reserve(itemId, qty) == 0) {
            throw new IllegalStateException("Out of stock");
        }
        return orders.save(new Order(itemId, qty));
    }
}

// OUTPUT:
// success: Order saved; out of stock: exception and no order row`]
    ),
    'sb-repository': dv(
        [`<p>What happens for a repository:</p><ul><li>Spring Data scans interfaces extending <code>Repository</code>.</li><li>For each one it builds a JDK proxy backed by <code>SimpleJpaRepository</code>.</li><li>Derived method names are parsed into queries at startup, so typos fail fast.</li><li>For a hand written <code>@Repository</code> class, the exception translation post processor adds an advice.</li></ul>`,
            r`System.out.println(repo.getClass().getSimpleName());
System.out.println(AopUtils.isJdkDynamicProxy(repo));

// OUTPUT:
// $Proxy105 (varies)
// true`],
        [`<p>Query options:</p><ul><li><b>Derived:</b> <code>findByLastNameAndActive</code>.</li><li><b>@Query:</b> JPQL or native SQL.</li><li><b>Paging:</b> <code>Pageable</code> and <code>Page</code>.</li><li><b>Projection:</b> interface or record.</li><li><b>Modifying:</b> <code>@Modifying</code> for update or delete queries.</li></ul>`,
            r`public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("select p from Product p where p.price < :max")
    Page<Product> cheaper(@Param("max") BigDecimal max, Pageable page);

    record NameOnly(String name) { }
    List<NameOnly> findByCategory(String category);

    @Modifying
    @Query("update Product p set p.price = p.price * 1.1 where p.category = :c")
    int raise(@Param("c") String c);
}

// OUTPUT:
// cheaper(50, PageRequest.of(0, 10)) returns the first page of at most 10 products`],
        [`<p>Mistakes:</p><ul><li><b>Wrong property name:</b> startup fails with <code>PropertyReferenceException</code>.</li><li><b>Returning an entity from a view:</b> lazy loading outside a transaction throws <code>LazyInitializationException</code>.</li><li><b>Loading everything:</b> <code>findAll()</code> on a large table; page it.</li></ul>`,
            r`public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByEmial(String email);     // typo
}

// OUTPUT:
// PropertyReferenceException: No property 'emial' found for type 'User'`],
        [`<p>Performance notes:</p><ul><li><b>Paging:</b> always use <code>Pageable</code> for big results.</li><li><b>Projections:</b> read only needed columns.</li><li><b>Batching:</b> <code>saveAll</code> with JDBC batch settings.</li><li><b>Indexes:</b> back every frequent derived query column.</li></ul>`,
            r`# application.properties
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true

# OUTPUT:
# saveAll of 1000 rows sends batches of 50 inserts (varies)`],
        [`<p>Scenario: admin screen listing customers with search and paging.</p><ul><li>A derived query with a case-insensitive contains match.</li><li>The controller accepts <code>Pageable</code> directly.</li></ul>`,
            r`public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findByNameContainingIgnoreCase(String q, Pageable p);
}

@GetMapping("/customers")
Page<Customer> search(@RequestParam String q, Pageable pageable) {
    return repo.findByNameContainingIgnoreCase(q, pageable);
}

// OUTPUT: GET /customers?q=ash&page=0&size=2
// {"content":[{"id":1,"name":"Asha"}],"totalElements":1,"size":2}`]
    ),
    'sb-controller': dv(
        [`<p>Request flow:</p><ul><li><code>DispatcherServlet</code> receives the request.</li><li><code>RequestMappingHandlerMapping</code> finds the method.</li><li><code>RequestMappingHandlerAdapter</code> resolves arguments and invokes it.</li><li>Return values go to a <code>ViewResolver</code> or to <code>HttpMessageConverter</code> instances for @ResponseBody.</li></ul>`,
            r`@Controller
class Demo {
    @GetMapping("/a") String view() { return "page"; }                 // view name
    @GetMapping("/b") @ResponseBody String text() { return "page"; }   // body text
}

// OUTPUT:
// GET /a -> renders template page
// GET /b -> 200 with body: page`],
        [`<p>Variants:</p><ul><li><b>@RestController:</b> JSON APIs.</li><li><b>ResponseEntity:</b> control status and headers.</li><li><b>@ControllerAdvice:</b> shared exception handling.</li><li><b>Validation:</b> <code>@Valid</code> on a request body.</li></ul>`,
            r`@RestController
@RequestMapping("/api/items")
class ItemController {
    @PostMapping
    ResponseEntity<Item> create(@Valid @RequestBody ItemRequest req) {
        Item saved = new Item(1L, req.name());
        return ResponseEntity.status(HttpStatus.CREATED)
            .header("Location", "/api/items/1").body(saved);
    }
}

// OUTPUT:
// HTTP/1.1 201
// Location: /api/items/1
// {"id":1,"name":"pen"}`],
        [`<p>Mistakes:</p><ul><li><b>Missing @ResponseBody:</b> a returned string is looked up as a view and gives a 404 or template error.</li><li><b>Business logic in controllers:</b> hard to reuse and test.</li><li><b>Exposing entities:</b> use DTOs.</li><li><b>Ambiguous mapping:</b> two methods with the same path and verb fail at startup.</li></ul>`,
            r`@Controller
class Wrong {
    @GetMapping("/hello")
    String hello() { return "Hello"; }     // looks for a view named Hello
}

// FIX: use @RestController or add @ResponseBody

// OUTPUT:
// TemplateInputException: Error resolving template [Hello]`],
        [`<p>Performance notes:</p><ul><li><b>Keep handlers short</b> and non-blocking where possible.</li><li><b>Paging</b> large results.</li><li><b>Caching headers:</b> <code>ETag</code> or <code>Cache-Control</code> to save repeated work.</li></ul>`,
            r`@GetMapping("/logo")
ResponseEntity<byte[]> logo() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(Duration.ofHours(1)))
        .body(logoBytes);
}

// OUTPUT:
// HTTP/1.1 200
// Cache-Control: max-age=3600`],
        [`<p>Scenario: a thin REST controller with error handling in an advice.</p><ul><li>The controller delegates to a service.</li><li>A <code>@RestControllerAdvice</code> maps exceptions to HTTP status.</li></ul>`,
            r`@RestController
class AccountController {
    private final AccountService service;
    AccountController(AccountService service) { this.service = service; }

    @GetMapping("/accounts/{id}")
    Account get(@PathVariable long id) { return service.find(id); }
}

@RestControllerAdvice
class Errors {
    @ExceptionHandler(AccountNotFound.class)
    ResponseEntity<Map<String, String>> notFound(AccountNotFound e) {
        return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
    }
}

// OUTPUT: GET /accounts/99
// HTTP/1.1 404
// {"error":"Account 99 not found"}`]
    ),
    'sb-configuration': dv(
        [`<p>How the container handles it:</p><ul><li><code>ConfigurationClassPostProcessor</code> parses configuration classes early.</li><li>In full mode the class is enhanced with CGLIB.</li><li>Calls to a <code>@Bean</code> method are intercepted and answered from the container.</li><li>Lite mode (no proxy) just calls the method as plain Java.</li></ul>`,
            r`@Configuration
class Cfg { }

System.out.println(ctx.getBean(Cfg.class).getClass().getSimpleName());

// OUTPUT:
// Cfg$$SpringCGLIB$$0`],
        [`<p>Options:</p><ul><li><b>proxyBeanMethods:</b> true (default) or false.</li><li><b>@Import:</b> compose configuration classes.</li><li><b>@ImportResource:</b> bring in legacy XML.</li><li><b>@ConfigurationProperties:</b> bind typed properties.</li><li><b>@EnableConfigurationProperties:</b> register the property class.</li></ul>`,
            r`@ConfigurationProperties(prefix = "mail")
public record MailProps(String host, int port) { }

@Configuration
@EnableConfigurationProperties(MailProps.class)
class MailConfig {
    @Bean JavaMailSenderImpl sender(MailProps p) {
        var s = new JavaMailSenderImpl();
        s.setHost(p.host());
        s.setPort(p.port());
        return s;
    }
}

# application.properties: mail.host=smtp.example.com  mail.port=587

# OUTPUT:
# sender bean has host smtp.example.com and port 587`],
        [`<p>Mistakes:</p><ul><li><b>Final class:</b> a full configuration class cannot be final because CGLIB subclasses it.</li><li><b>Component scanning a configuration</b> twice with @Import: harmless but confusing.</li><li><b>Heavy work in bean methods:</b> slows startup; keep creation light.</li><li><b>Hard coded values:</b> use properties.</li></ul>`,
            r`@Configuration
public final class Bad {          // WRONG: CGLIB cannot subclass a final class
    @Bean String name() { return "x"; }
}

// OUTPUT:
// BeanDefinitionParsingException: @Configuration class 'bad' may not be final`],
        [`<p>Performance notes:</p><ul><li><b>proxyBeanMethods = false</b> avoids CGLIB per class, which Boot starters themselves use.</li><li><b>Native image:</b> lite configurations suit ahead of time processing.</li></ul>`,
            r`@Configuration(proxyBeanMethods = false)
class Fast {
    @Bean Engine engine() { return new Engine(); }
    @Bean Car car(Engine engine) { return new Car(engine); }  // parameter injection
}

// OUTPUT:
// same singleton Engine, no CGLIB subclass, quicker startup`],
        [`<p>Scenario: environment specific beans: an in-memory mail sender for dev and the real one in production.</p><ul><li><code>@Profile</code> chooses the configuration.</li></ul>`,
            r`@Configuration
@Profile("dev")
class DevMail {
    @Bean MailSender mailSender() { return new LoggingMailSender(); }
}

@Configuration
@Profile("prod")
class ProdMail {
    @Bean MailSender mailSender() { return new SmtpMailSender(); }
}

# run: java -jar app.jar --spring.profiles.active=prod

# OUTPUT:
# SmtpMailSender is registered; LoggingMailSender is not`]
    ),
    'sb-bean': dv(
        [`<p>Internals:</p><ul><li>Each @Bean method becomes a <code>BeanDefinition</code> with a factory method.</li><li>Container calls the factory method (on the configuration bean) to create the instance.</li><li>Parameters are resolved like constructor arguments.</li><li>Post processors and lifecycle callbacks then apply.</li></ul>`,
            r`@Configuration
class Cfg {
    @Bean
    ObjectMapper mapper() {
        System.out.println("creating mapper");
        return new ObjectMapper();
    }
}

// OUTPUT:
// creating mapper   (once at startup, singleton)`],
        [`<p>Variants:</p><ul><li><b>Name and aliases:</b> <code>@Bean({&quot;a&quot;, &quot;b&quot;})</code>.</li><li><b>@Scope:</b> prototype or proxied scopes.</li><li><b>@Lazy:</b> create on first use.</li><li><b>@DependsOn:</b> force ordering.</li><li><b>ObjectProvider:</b> lazily get optional or multiple beans.</li></ul>`,
            r`@Bean
@Scope("prototype")
@Lazy
Token token() { return new Token(UUID.randomUUID().toString()); }

@Service
class Users {
    private final ObjectProvider<Token> tokens;
    Users(ObjectProvider<Token> tokens) { this.tokens = tokens; }
    String newToken() { return tokens.getObject().value(); }
}

// OUTPUT: (varies)
// each call to newToken() returns a different value`],
        [`<p>Mistakes:</p><ul><li><b>Calling a bean method directly in lite mode:</b> creates a second instance.</li><li><b>Returning an interface with the wrong type:</b> the declared return type decides type matching, so be specific.</li><li><b>Two methods with same name</b> in different configs overwrite beans.</li><li><b>Missing close:</b> inferred destroy method may surprise you; set <code>destroyMethod = &quot;&quot;</code> to disable.</li></ul>`,
            r`@Bean
Object cache() { return new CaffeineCache(); }     // too general

@Service
class S { S(CaffeineCache c) { } }                   // type match may fail early

// FIX: declare the real return type: CaffeineCache cache()

// OUTPUT:
// NoSuchBeanDefinitionException: No qualifying bean of type CaffeineCache (sometimes)`],
        [`<p>Performance notes:</p><ul><li>Expensive beans: use <code>@Lazy</code> when they are rarely needed.</li><li>Do not do network calls in bean creation; use a readiness check instead.</li></ul>`,
            r`@Bean
@Lazy
SearchClient searchClient() {
    return SearchClient.connect("http://search:9200");   // only when first injected
}

// OUTPUT:
// startup does not wait for the search cluster (varies)`],
        [`<p>Scenario: configuring a shared HTTP client and exposing a typed API client built on top of it.</p>`,
            r`@Configuration
class ClientConfig {
    @Bean
    RestClient restClient(RestClient.Builder b) {
        return b.baseUrl("https://rates.example.com").build();
    }

    @Bean
    RateApi rateApi(RestClient client) {
        return new RateApi(client);
    }
}

// OUTPUT:
// RateApi uses the shared RestClient with the configured base URL`]
    ),
    'sb-autowired': dv(
        [`<p>How injection runs:</p><ul><li><code>AutowiredAnnotationBeanPostProcessor</code> inspects constructors, fields and setters.</li><li><code>DefaultListableBeanFactory.resolveDependency</code> finds candidates by type.</li><li>It then narrows by <code>@Primary</code>, <code>@Qualifier</code> and the parameter name.</li><li>Constructor arguments are resolved before the object exists, so dependencies must be ready first.</li></ul>`,
            r`@Service
class A {
    A(B b) { System.out.println("A needs B"); }
}
@Service
class B {
    B() { System.out.println("B created"); }
}

// OUTPUT:
// B created
// A needs B`],
        [`<p>Injection forms:</p><ul><li><b>Constructor:</b> best, supports final fields.</li><li><b>Setter:</b> for optional or changeable dependencies.</li><li><b>Field:</b> short but discouraged.</li><li><b>ObjectProvider:</b> lazy and optional.</li><li><b>@Value:</b> injects property values, not beans.</li></ul>`,
            r`@Service
class Mixed {
    private final Repo repo;                  // constructor
    private Optional<Cache> cache = Optional.empty();

    Mixed(Repo repo) { this.repo = repo; }

    @Autowired(required = false)
    void setCache(Cache cache) { this.cache = Optional.of(cache); }
}

// OUTPUT:
// works with or without a Cache bean`],
        [`<p>Mistakes:</p><ul><li><b>Circular dependency:</b> A needs B and B needs A; extract a third bean or use events.</li><li><b>Autowiring a static field:</b> ignored.</li><li><b>Autowiring in a class not managed by Spring:</b> stays null.</li><li><b>Field injection with final:</b> impossible.</li></ul>`,
            r`@Service class A { A(B b) { } }
@Service class B { B(A a) { } }

// OUTPUT:
// BeanCurrentlyInCreationException: Error creating bean with name 'a':
// Requested bean is currently in creation: Is there an unresolvable circular reference?`],
        [`<p>Performance notes:</p><ul><li>Injection cost is paid at startup, not per call.</li><li>Prototype beans injected into singletons are created once; use <code>ObjectProvider</code> to get fresh ones.</li></ul>`,
            r`@Service
class Reports {
    private final ObjectProvider<ReportBuilder> builders;   // prototype bean
    Reports(ObjectProvider<ReportBuilder> builders) { this.builders = builders; }

    String build() { return builders.getObject().build(); }  // new builder per call
}

// OUTPUT:
// every build() call uses a new ReportBuilder`],
        [`<p>Scenario: a strategy lookup where all handlers are injected as a map keyed by bean name.</p>`,
            r`public interface Discount { double apply(double price); }

@Component("none")   class NoDiscount implements Discount {
    public double apply(double p) { return p; }
}
@Component("festive") class Festive implements Discount {
    public double apply(double p) { return p * 0.9; }
}

@Service
class PriceService {
    private final Map<String, Discount> discounts;
    PriceService(Map<String, Discount> discounts) { this.discounts = discounts; }
    double price(String type, double base) { return discounts.get(type).apply(base); }
}

// OUTPUT: price("festive", 200)
// 180.0`]
    ),
    'sb-qualifier': dv(
        [`<p>How selection works:</p><ul><li>The resolver collects all beans of the required type.</li><li><code>QualifierAnnotationAutowireCandidateResolver</code> keeps those whose qualifier matches.</li><li>A bean name counts as a fallback qualifier value.</li><li>If still more than one remains, the process stops with an error.</li></ul>`,
            r`@Bean @Qualifier("eu") Tax euTax() { return new Tax(0.2); }
@Bean @Qualifier("us") Tax usTax() { return new Tax(0.07); }

@Service
class Invoice {
    Invoice(@Qualifier("eu") Tax tax) { System.out.println(tax.rate()); }
}

// OUTPUT:
// 0.2`],
        [`<p>Variants:</p><ul><li><b>Name based:</b> <code>@Qualifier(&quot;mail&quot;)</code> matches bean name.</li><li><b>Label based:</b> same annotation on the bean definition.</li><li><b>Custom annotation:</b> type safe alternative.</li><li><b>Map injection:</b> get all and choose at runtime.</li><li><b>@Resource:</b> JSR-250 injection by name.</li></ul>`,
            r`@Service
class ByName {
    @Resource(name = "sms")             // jakarta.annotation.Resource
    private Sender sender;
}

@Service
class Dynamic {
    private final Map<String, Sender> senders;
    Dynamic(Map<String, Sender> senders) { this.senders = senders; }
    void send(String channel, String m) { senders.get(channel).send(m); }
}

// OUTPUT:
// sms bean is injected; Dynamic can pick any channel at runtime`],
        [`<p>Mistakes:</p><ul><li><b>Typo in the string:</b> fails at startup with <code>NoSuchBeanDefinitionException</code>.</li><li><b>Qualifier on class but name differs:</b> bean name wins confusion.</li><li><b>Combining @Primary and a wrong qualifier</b> expecting the primary.</li><li><b>Lombok constructor:</b> the annotation is not copied without config.</li></ul>`,
            r`@Service
class Alerts {
    Alerts(@Qualifier("mial") Sender sender) { }     // typo
}

# lombok.config fix: lombok.copyableAnnotations += org.springframework.beans.factory.annotation.Qualifier

# OUTPUT:
# NoSuchBeanDefinitionException: No qualifying bean of type Sender available:
# expected at least 1 bean which qualifies as autowire candidate`],
        [`<p>Performance notes:</p><ul><li>Qualifier resolution happens at startup; there is no runtime cost.</li><li>A runtime map lookup by key costs one hash lookup.</li></ul>`,
            r`Sender s = senders.get("mail");      // O(1) lookup at runtime

// OUTPUT:
// MailSender chosen without any reflection per call`],
        [`<p>Scenario: two data sources, one for the main database and one for reporting, each with its own JdbcTemplate.</p>`,
            r`@Configuration
class JdbcConfig {
    @Bean @Qualifier("main")
    JdbcTemplate mainJdbc(@Qualifier("main") DataSource ds) {
        return new JdbcTemplate(ds);
    }
    @Bean @Qualifier("reporting")
    JdbcTemplate reportJdbc(@Qualifier("reporting") DataSource ds) {
        return new JdbcTemplate(ds);
    }
}

@Repository
class SalesReport {
    private final JdbcTemplate jdbc;
    SalesReport(@Qualifier("reporting") JdbcTemplate jdbc) { this.jdbc = jdbc; }
}

// OUTPUT:
// report queries run against the reporting database only`]
    ),
    'sb-primary': dv(
        [`<p>Internals:</p><ul><li>After type matching and qualifier filtering, <code>determineAutowireCandidate</code> runs.</li><li>It first looks for one bean marked primary in the candidates.</li><li>Then for the highest priority (<code>@Priority</code>).</li><li>Finally a match on the dependency name.</li></ul>`,
            r`@Bean @Primary Cache redis() { return new RedisCache(); }
@Bean Cache local() { return new LocalCache(); }

@Service
class Users {
    Users(Cache cache) { System.out.println(cache.getClass().getSimpleName()); }
}

// OUTPUT:
// RedisCache`],
        [`<p>Related choices:</p><ul><li><b>@Primary:</b> one default.</li><li><b>@Qualifier:</b> explicit pick.</li><li><b>@Priority:</b> jakarta priority for ordering.</li><li><b>@ConditionalOnMissingBean:</b> back off when a user defines one.</li><li><b>@Profile:</b> only one bean exists per environment.</li></ul>`,
            r`@Bean
@Profile("test")
@Primary
Clock testClock() { return Clock.fixed(Instant.EPOCH, ZoneOffset.UTC); }

@Bean
Clock systemClock() { return Clock.systemUTC(); }

// OUTPUT:
// in profile test the fixed clock is injected, otherwise the system clock`],
        [`<p>Mistakes:</p><ul><li><b>Primary everywhere:</b> if all beans are primary, nothing is.</li><li><b>Expecting List to be filtered:</b> lists contain all beans.</li><li><b>Hidden default:</b> a reader may not know why a bean is chosen; document it.</li></ul>`,
            r`@Service
class Fanout {
    Fanout(List<Cache> caches) { System.out.println(caches.size()); }
}

// OUTPUT:
// 2   (primary does not filter collections)`],
        [`<p>Performance notes:</p><ul><li>Resolved once at startup, no runtime cost.</li><li>Prefer a single implementation per environment when possible, which is simpler than juggling primaries.</li></ul>`,
            r`# application.properties
spring.profiles.active=prod

# OUTPUT:
# only the beans of the active profile are created, so fewer beans to start (varies)`],
        [`<p>Scenario: a library starter provides a default bean as primary-like fallback; the application can override it.</p>`,
            r`@Configuration
class StarterAutoConfig {
    @Bean
    @ConditionalOnMissingBean(Notifier.class)
    Notifier defaultNotifier() { return new LogNotifier(); }
}

@Component @Primary
class SlackNotifier implements Notifier { /* app defined */ }

// OUTPUT:
// the application SlackNotifier is used; LogNotifier is not even created`]
    ),
    'sb-component-scanning': dv(
        [`<p>Scanning steps:</p><ul><li><code>@SpringBootApplication</code> includes <code>@ComponentScan</code> with the main package as default root.</li><li><code>ClassPathBeanDefinitionScanner</code> lists <code>.class</code> files under the root.</li><li>A <code>MetadataReader</code> reads annotations from bytecode without loading the class.</li><li>Matching classes become bean definitions.</li></ul>`,
            r`@SpringBootApplication      // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class ShopApplication { }

String[] names = ctx.getBeanDefinitionNames();
System.out.println(Arrays.stream(names).filter(n -> n.endsWith("Service")).toList());

// OUTPUT: (varies)
// [orderService, userService]`],
        [`<p>Options:</p><ul><li><b>basePackages / basePackageClasses:</b> choose roots, the class form is refactoring safe.</li><li><b>includeFilters / excludeFilters:</b> by annotation, assignable type, regex, aspectj or custom.</li><li><b>useDefaultFilters:</b> turn off the stereotype default.</li><li><b>@SpringBootApplication(scanBasePackages)</b> shortcut.</li></ul>`,
            r`@SpringBootApplication(scanBasePackageClasses = {ShopApplication.class, SharedMarker.class})
public class ShopApplication { }

@ComponentScan(
    basePackages = "com.shop.plugins",
    useDefaultFilters = false,
    includeFilters = @ComponentScan.Filter(Plugin.class))   // only @Plugin classes
class PluginScan { }

// OUTPUT:
// only classes annotated with @Plugin in com.shop.plugins are registered`],
        [`<p>Mistakes:</p><ul><li><b>Main class in the default package:</b> scans the whole classpath, which is slow and warns.</li><li><b>Beans in a sibling package:</b> not found.</li><li><b>Scanning the same classes twice</b> with overlapping roots: duplicate bean definition names.</li><li><b>Test config picked up by accident</b> in a production scan.</li></ul>`,
            r`// Main class in com.shop.app, service in com.shop.service
package com.shop.app;
@SpringBootApplication
public class ShopApplication { }

package com.shop.service;
@Service
class OrderService { }          // NOT scanned: sibling, not sub-package

// OUTPUT:
// NoSuchBeanDefinitionException: No qualifying bean of type OrderService`],
        [`<p>Performance notes:</p><ul><li>Scan time grows with the number of classes under the roots, including jars if a root is very broad like <code>com</code>.</li><li>Narrow roots to your own packages.</li><li>Spring AOT can precompute bean definitions for native images and faster startup.</li></ul>`,
            r`@ComponentScan(basePackages = "com.shop")        // good: specific
// @ComponentScan(basePackages = "com")              // slow: scans many libraries

# application.properties
logging.level.org.springframework.context.annotation=DEBUG   # shows scanned candidates

# OUTPUT: (varies)
# Identified candidate component class: file [.../OrderService.class]`],
        [`<p>Scenario: modular monolith where each module has its own package and optional modules are loaded by a property.</p><ul><li>The shared root keeps everything scanned.</li><li>An optional module is enabled by a conditional configuration.</li></ul>`,
            r`@Configuration
@ConditionalOnProperty(name = "module.reports", havingValue = "true")
@ComponentScan(basePackages = "com.shop.reports")
class ReportsModule { }

# application.properties: module.reports=true

# OUTPUT:
# reports module beans are registered only when module.reports=true`]
    )
};
