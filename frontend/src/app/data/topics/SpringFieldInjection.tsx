import { Topic } from '../coreJava';

export const springFieldInjection: Topic = {
    id: 'sb-field-injection',
    name: "Field Injection",
    beginner: [
        {
            content: `<h3>The Shortest Form, and the One to Avoid</h3>
Field injection puts <code>@Autowired</code> directly on the field. There is no constructor and no setter - Spring reaches into the object and sets the field by reflection.<br>`,
            codeExamples: [
                `@Service
public class OrderService {

    @Autowired
    private PaymentGateway gateway;

    @Autowired
    private OrderRepository repository;

    public Receipt checkout(Order order) {
        Receipt receipt = gateway.charge(order.total());
        repository.save(order);
        return receipt;
    }
}

// Three lines instead of eight. This is why it spread, and it is the
// only argument in its favour.`,
                `// What Spring does, which is worth seeing plainly:

//  1. new OrderService()                     - both fields are null
//  2. AutowiredAnnotationBeanPostProcessor scans the class
//  3. for each @Autowired field:
//         Field f = OrderService.class.getDeclaredField("gateway");
//         f.setAccessible(true);             // bypasses 'private'
//         f.set(instance, stripeGateway);
//  4. the bean is handed out

// Step 3 is ordinary Java reflection with the access check switched off.
// Nothing magic is happening - which is exactly why anything else that
// wants to construct this object has to do the same thing.`
            ]
        },
        {
            content: `<h3>The Problem: There Is No Way In</h3>
Every other objection to field injection is a consequence of this one. A field-injected class has no seam. From outside, there is no legal way to supply a dependency.<br>`,
            codeExamples: [
                `// Try to unit test it.

@Test
void chargesAndSaves() {
    OrderService service = new OrderService();     // compiles fine
    service.checkout(new Order("A-1", 500));
}

// OUTPUT:
// java.lang.NullPointerException: Cannot invoke
//   "PaymentGateway.charge(int)" because "this.gateway" is null
//
// The constructor gave you nothing to pass. There is no setter. The
// fields are private. The object is unbuildable by design.`,
                `// The two ways out, both worse than the problem.

// (a) Reflection in the test - the test now knows the field NAME, so
//     renaming a private field breaks a test that never mentioned it.
@Test
void chargesAndSaves() {
    OrderService service = new OrderService();
    ReflectionTestUtils.setField(service, "gateway", fakeGateway);
    ReflectionTestUtils.setField(service, "repository", fakeRepository);
    ...
}

// (b) Start Spring - a unit test that needs a container.
@SpringBootTest
class OrderServiceTest {
    @Autowired OrderService service;
    @MockBean PaymentGateway gateway;
    ...
}
// Correct, but a context start is 2-10 seconds against 3 milliseconds
// for a constructor call. Multiply by a few hundred tests and the suite
// stops being run before every commit - which is the real cost.`
            ]
        },
        {
            content: `<h3>The Full Comparison</h3>

<table>
<tr><th></th><th>Constructor</th><th>Setter</th><th>Field</th></tr>
<tr><td>Field can be <code>final</code></td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Object always fully built</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Testable with plain <code>new</code></td><td>Yes</td><td>Yes</td><td><strong>No</strong></td></tr>
<tr><td>Dependencies visible in the API</td><td>Yes</td><td>Yes</td><td><strong>No</strong></td></tr>
<tr><td>Missing dependency fails at</td><td>Startup</td><td>Startup</td><td>Startup</td></tr>
<tr><td>Needs <code>@Autowired</code></td><td>No (single ctor)</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Usable outside Spring</td><td>Yes</td><td>Yes</td><td><strong>No</strong></td></tr>
</table>
<br>
The last row is the one that decides it. A constructor-injected class is a normal Java class that Spring happens to build. A field-injected class only functions inside a dependency injection container - the framework has stopped being a convenience and become a runtime requirement.<br><br>

This is why IntelliJ flags <code>@Autowired</code> on a field with <em>"Field injection is not recommended"</em>, and why Spring's own reference documentation stopped showing it in examples.<br>`
        },
        {
            content: `<h3>Where It Is Actually Fine</h3>
Two places, and they share a property: the class is never instantiated by hand, so the missing seam costs nothing.<br><br>

<table>
<tr><th>Case</th><th>Why it is acceptable</th></tr>
<tr><td><strong>Test classes</strong></td><td>JUnit constructs the test class, and Spring's test framework injects into it. You are never going to <code>new</code> a test class yourself, so there is nothing to lose. <code>@Autowired</code> fields in a <code>@SpringBootTest</code> are idiomatic, not a compromise.</td></tr>
<tr><td><strong>@Configuration classes</strong></td><td>Configuration classes exist only to be read by Spring. That said, prefer constructor parameters on <code>@Bean</code> methods, which are clearer and testable.</td></tr>
</table>
<br>
And one case that looks like an exception but is not: <code>@Value</code> on a field. It has all the same problems - the value cannot be supplied in a test without reflection - and constructor binding through <code>@ConfigurationProperties</code> is the modern answer.<br>`,
            codeExamples: [
                `// Idiomatic - nobody constructs a test class by hand.
@SpringBootTest
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService service;          // fine

    @MockBean
    private PaymentGateway gateway;        // fine

    @Test
    void checkoutSavesTheOrder() { ... }
}`,
                `// @Value on a field - looks harmless, same trap.

@Service
public class OrderService {
    @Value("\${shop.retry-limit}")
    private int retryLimit;                // untestable without reflection
}

// Constructor form - the value is just a parameter:
@Service
public class OrderService {
    private final int retryLimit;

    public OrderService(@Value("\${shop.retry-limit}") int retryLimit) {
        this.retryLimit = retryLimit;
    }
}
// new OrderService(3) works in a test.

// Better still for a group of related settings - typed, validated,
// bound once, and injected like any other bean:

@ConfigurationProperties(prefix = "shop")
public record ShopProperties(int retryLimit, Duration timeout) { }

@Service
public class OrderService {
    private final ShopProperties props;
    public OrderService(ShopProperties props) { this.props = props; }
}`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Objection That Is Usually Overstated</h3>
Field injection is often criticised for being slow, because it uses reflection. That argument is weak and it is worth knowing why, so you make the case on the grounds that actually hold.<br><br>

<table>
<tr><th>Claim</th><th>Reality</th></tr>
<tr><td>"Reflection makes it slow"</td><td>It happens once per bean at startup. For a singleton that is one <code>Field.set</code> call in the entire life of the application - microseconds, and unmeasurable next to the class loading and proxying happening around it.</td></tr>
<tr><td>"It breaks encapsulation"</td><td>Technically true - <code>setAccessible(true)</code> bypasses <code>private</code>. But Spring does the same for <code>@PostConstruct</code> methods and nobody objects to those. Encapsulation is not the real cost.</td></tr>
<tr><td>"It hides dependencies"</td><td><strong>This is the real argument.</strong> Not from the compiler - from the reader, and from any code that wants to construct the object without Spring.</td></tr>
</table>
<br>
Make the case on testability and on the SRP signal. A constructor that has grown to nine parameters is a class asking to be split; nine <code>@Autowired</code> fields scroll by unnoticed, so the class keeps growing and nobody is ever prompted to look.<br>`
        },
        {
            content: `<h3>The Failure Modes That Only Field Injection Has</h3>
Three bugs that constructor injection makes impossible to write.<br>`,
            codeExamples: [
                `// 1. USING AN INJECTED FIELD IN THE CONSTRUCTOR.
//    The field is set after construction, so it is always null here.

@Service
public class OrderService {

    @Autowired
    private PaymentGateway gateway;

    private final boolean supportsRefunds;

    public OrderService() {
        this.supportsRefunds = gateway.supportsRefunds();   // NPE
    }
}
// OUTPUT:
// BeanCreationException ... Caused by: java.lang.NullPointerException
//
// Fix: take it as a constructor parameter, or move the logic to
// @PostConstruct where every field is guaranteed to be set.`,
                `// 2. A NEW-ED INSTANCE THAT LOOKS LIKE A BEAN.
//    Nothing stops you constructing one - it just does not work.

@Service
public class OrderService {
    @Autowired private OrderRepository repository;
}

// somewhere else, perhaps in a utility method:
OrderService service = new OrderService();      // compiles, no warning
service.checkout(order);                        // NPE at runtime

// Spring never saw this instance, so no field was ever injected.
// With constructor injection the compiler stops this line dead.`,
                `// 3. SILENT CIRCULAR DEPENDENCIES.
//    Field injection resolves cycles the same way setter injection
//    does - and hides the same design problem.

@Service class OrderService   { @Autowired private InvoiceService invoices; }
@Service class InvoiceService { @Autowired private OrderService   orders;   }

// Before Spring Boot 2.6 this started cleanly.
// From 2.6 onwards:
//
// ***************************
// APPLICATION FAILED TO START
// ***************************
// The dependencies of some of the beans in the application context
// form a cycle
//
// spring.main.allow-circular-references=true restores the old
// behaviour. It is a migration aid, not a fix.`
            ]
        },
        {
            content: `<h3>Migrating a Codebase Off It</h3>
The change is mechanical and can be done class by class - no big-bang refactor, and each step leaves the code working.<br>`,
            codeExamples: [
                `// Before.
@Service
public class OrderService {

    @Autowired private PaymentGateway gateway;
    @Autowired private OrderRepository repository;
    @Autowired private NotificationService notifications;
}

// After - add final, delete the annotations, add one constructor.
@Service
@RequiredArgsConstructor
public class OrderService {

    private final PaymentGateway gateway;
    private final OrderRepository repository;
    private final NotificationService notifications;
}

// Both IntelliJ and Eclipse do this as a one-key intention:
//   "Convert field injection to constructor injection" (Alt+Enter).
//
// Two things to watch as you go:
//
//  * A cycle that field injection was hiding will now fail at startup.
//    That is the migration finding a real bug, not causing one - but
//    budget for it, because one will usually turn up.
//
//  * A class with @Autowired on a NON-final field somewhere else in the
//    codebase reassigning it will stop compiling. Also a real bug found.`,
                `# Find every remaining field injection site in the project:
grep -rn --include=*.java -B1 "@Autowired" src/main/java \\
  | grep -A1 "@Autowired" | grep "private "

# OUTPUT:
# src/main/java/com/shop/OrderService.java-15-    private PaymentGateway gateway;
# src/main/java/com/shop/CartService.java-22-     private CartRepository repository;
# ...

# To stop new ones appearing, ArchUnit can fail the build on it:
#
#   @ArchTest
#   static final ArchRule noFieldInjection =
#       noFields().should().beAnnotatedWith(Autowired.class)
#                 .because("use constructor injection");
#
# Run it over main only - test classes are the legitimate exception.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is field injection?</td><td><code>@Autowired</code> directly on a field. Spring sets it by reflection after construction, with no constructor or setter involved.</td></tr>
<tr><td>Why is it discouraged?</td><td>The class cannot be constructed outside Spring, so it cannot be unit tested without reflection or a running context. Dependencies are invisible in the API, fields cannot be final, and an oversized class gives no signal.</td></tr>
<tr><td>Is the reflection a performance problem?</td><td>No - one <code>Field.set</code> per bean at startup. Arguing performance is arguing the weak version of the case.</td></tr>
<tr><td>How does Spring set a private field?</td><td><code>AutowiredAnnotationBeanPostProcessor</code> finds the annotated fields and uses <code>ReflectionUtils.makeAccessible</code> / <code>setAccessible(true)</code> before <code>Field.set</code>.</td></tr>
<tr><td>How would you test a field-injected class?</td><td><code>ReflectionTestUtils.setField</code>, or start a context with <code>@SpringBootTest</code> and <code>@MockBean</code>. Both are heavier than a constructor call - which is the argument for changing the class.</td></tr>
<tr><td>Can an injected field be used in the constructor?</td><td>No - it is still null. Use a constructor parameter, or <code>@PostConstruct</code>.</td></tr>
<tr><td>When is field injection acceptable?</td><td>In test classes, which are constructed by JUnit and never by hand. Arguably in <code>@Configuration</code> classes, though constructor parameters on <code>@Bean</code> methods are better.</td></tr>
<tr><td>What about <code>@Value</code> on a field?</td><td>Same trap - unsettable in a test without reflection. Prefer a <code>@Value</code> constructor parameter, or <code>@ConfigurationProperties</code> binding.</td></tr>
<tr><td>Does it hide circular dependencies?</td><td>It did, until Spring Boot 2.6 made <code>spring.main.allow-circular-references=false</code> the default. Setting it back to <code>true</code> restores the old behaviour and the old bugs.</td></tr>
<tr><td>How do you migrate away from it?</td><td>Make the fields <code>final</code>, drop the annotations and add one constructor - or <code>@RequiredArgsConstructor</code>. The IDE does it per class, and ArchUnit can stop new occurrences.</td></tr>
</table>`
        }
    ]
};
