import { Topic } from '../coreJava';

export const springConstructorInjection: Topic = {
    id: 'sb-constructor-injection',
    name: "Constructor Injection",
    beginner: [
        {
            content: `<h3>The Form to Use by Default</h3>
Constructor injection means the dependencies arrive as constructor parameters. Spring works out what the constructor needs, finds those beans, and calls it.<br><br>

This is the form the Spring team recommends, and it is the only one of the three that gives you all four of these at once: <strong>final fields</strong>, <strong>an object that is never half-built</strong>, <strong>dependencies visible in the signature</strong>, and <strong>a class you can unit test without Spring</strong>.<br>`,
            codeExamples: [
                `@Service
public class OrderService {

    private final PaymentGateway gateway;
    private final OrderRepository repository;

    public OrderService(PaymentGateway gateway, OrderRepository repository) {
        this.gateway = gateway;
        this.repository = repository;
    }

    public Receipt checkout(Order order) {
        Receipt receipt = gateway.charge(order.total());
        repository.save(order);
        return receipt;
    }
}

// Note what is NOT here: no @Autowired.
// Since Spring 4.3, a class with exactly one constructor is autowired
// through it automatically. Adding @Autowired is legal but redundant,
// and most modern codebases leave it off.`,
                `// The same class in a test - no Spring, no context, no annotations.

@Test
void chargesAndSaves() {
    FakeGateway gateway = new FakeGateway();
    FakeRepository repository = new FakeRepository();

    OrderService service = new OrderService(gateway, repository);
    Receipt receipt = service.checkout(new Order("A-1", 500));

    assertEquals(500, gateway.lastAmount);
    assertTrue(repository.contains("A-1"));
}

// OUTPUT:
// Test passed in 3 ms.
//
// The compiler enforces the setup: forget a dependency and the test
// does not compile. It cannot fail at runtime with a null field.`
            ]
        },
        {
            content: `<h3>Why <code>final</code> Matters More Than It Looks</h3>
Only constructor injection lets a dependency field be <code>final</code>, and that single keyword buys three separate guarantees.<br><br>

<table>
<tr><th>Guarantee</th><th>What it prevents</th></tr>
<tr><td>Assigned exactly once</td><td>Nothing - not a setter, not another method, not a later bug - can replace the gateway after construction.</td></tr>
<tr><td>Assigned before the constructor returns</td><td>The compiler refuses to build the class otherwise. There is no window in which the field is null, so a method on a fully-constructed object can never NPE on a missing dependency.</td></tr>
<tr><td>Safe to publish across threads</td><td>The Java Memory Model guarantees that a <code>final</code> field written in a constructor is visible to every thread that later sees the object. Non-final fields carry no such guarantee. Since Spring singletons are shared by every request thread, this is a real concurrency property, not a style preference.</td></tr>
</table>
<br>
That third point is the one people miss. A singleton service assembled by setter injection is technically publishing non-final state to dozens of threads; it works in practice because the context is fully built before the web server starts accepting requests, but the guarantee comes from that accident of ordering rather than from the language.<br>`
        },
        {
            content: `<h3>Several Constructors: Now You Must Choose</h3>
The "no annotation needed" rule applies to <em>one</em> constructor. With two or more, Spring will not guess.<br>`,
            codeExamples: [
                `// BROKEN - two constructors, neither marked.
@Service
public class ReportService {

    private final Clock clock;
    private final ReportRepository repository;

    public ReportService(ReportRepository repository) {
        this(repository, Clock.systemUTC());
    }

    public ReportService(ReportRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }
}

// OUTPUT at startup:
// BeanInstantiationException: Failed to instantiate [ReportService]:
//   No default constructor found
//
// Spring falls back to looking for a no-arg constructor, finds none,
// and gives up. It will not pick one of the two for you.`,
                `// FIXED - one constructor is marked as the one Spring should call.
@Service
public class ReportService {

    private final Clock clock;
    private final ReportRepository repository;

    public ReportService(ReportRepository repository) {
        this(repository, Clock.systemUTC());
    }

    @Autowired                                  // <-- Spring uses this one
    public ReportService(ReportRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }
}

// Rule of thumb: with one constructor, no annotation.
// With several, exactly one gets @Autowired - annotating two is an error:
//   "Invalid autowire-marked constructor: ... Found constructor with
//    'required' Autowired annotation already"`
            ]
        },
        {
            content: `<h3>Lombok: the Boilerplate Objection, Answered</h3>
The usual complaint about constructor injection is the typing - each dependency is named three times (field, parameter, assignment). Lombok removes that without giving up any of the guarantees.<br>`,
            codeExamples: [
                `// Written out by hand.
@Service
public class OrderService {

    private final PaymentGateway gateway;
    private final OrderRepository repository;
    private final NotificationService notifications;

    public OrderService(PaymentGateway gateway,
                        OrderRepository repository,
                        NotificationService notifications) {
        this.gateway = gateway;
        this.repository = repository;
        this.notifications = notifications;
    }
}`,
                `// The same class with Lombok.
@Service
@RequiredArgsConstructor
public class OrderService {

    private final PaymentGateway gateway;
    private final OrderRepository repository;
    private final NotificationService notifications;
}

// @RequiredArgsConstructor generates a constructor taking every final
// field (and every @NonNull field) - exactly the code above, at compile
// time. The class file is identical, so Spring's single-constructor rule
// applies and no @Autowired is needed.
//
// Two cautions:
//
// 1. Parameter ORDER follows FIELD order. Reordering two fields of the
//    same type silently swaps what gets injected - and it still compiles.
//    Rare, but it has cost people an afternoon.
//
// 2. Use @RequiredArgsConstructor, never @AllArgsConstructor. The latter
//    includes non-final fields too, which pulls configuration values and
//    mutable state into the injection contract.
//
// If a dependency needs a @Qualifier, Lombok cannot express it - write
// that one constructor by hand.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Circular Dependencies Fail Loudly - and That Is the Feature</h3>
If <code>A</code> needs <code>B</code> and <code>B</code> needs <code>A</code>, constructor injection cannot resolve it. Neither object can be built first, because neither can be constructed without the other already existing.<br><br>

Spring detects this at startup and refuses to start.<br>`,
            codeExamples: [
                `@Service
public class OrderService {
    private final InvoiceService invoices;
    public OrderService(InvoiceService invoices) { this.invoices = invoices; }
}

@Service
public class InvoiceService {
    private final OrderService orders;
    public InvoiceService(OrderService orders) { this.orders = orders; }
}

// OUTPUT at startup:
//
// ***************************
// APPLICATION FAILED TO START
// ***************************
//
// Description:
// The dependencies of some of the beans in the application context form
// a cycle:
//
//    orderService
//    |     |
//    |     v
//    |  invoiceService
//    |     |
//    +-----+
//
// The application does not start. Nothing is half-wired, nothing is
// waiting to fail later - the design problem is on screen in seconds.`,
                `// The same cycle with FIELD injection "works", and that is the danger.

@Service
public class OrderService {
    @Autowired private InvoiceService invoices;    // starts fine
}

@Service
public class InvoiceService {
    @Autowired private OrderService orders;        // starts fine
}

// Spring builds both empty objects first, then fills the fields in, so
// the cycle resolves. The application starts and the design flaw is
// never surfaced - until a proxy, a @Transactional boundary or a lazy
// bean gets involved and it fails in a way nobody can explain.
//
// NOTE: since Spring Boot 2.6 even this is rejected by default -
// spring.main.allow-circular-references defaults to false. Setting it
// back to true is available and is almost always the wrong fix.
//
// The right fixes, in order of preference:
//   1. Extract the shared logic into a third bean both depend on.
//      A cycle nearly always means one responsibility living in two
//      classes.
//   2. Invert one direction with an event: OrderService publishes,
//      InvoiceService listens. The compile-time edge disappears.
//   3. @Lazy on one constructor parameter - injects a proxy and defers
//      the real lookup. This breaks the cycle without fixing it; use it
//      to unblock a legacy refactor, not as a design.`
            ]
        },
        {
            content: `<h3>The Long Constructor Is a Message, Not a Nuisance</h3>
The most common complaint about constructor injection is that it produces constructors with eight parameters. That is not a flaw in the technique - it is the technique doing its job.<br><br>

A class with eight collaborators has eight reasons to change, which is a Single Responsibility violation stated in code. Field injection does not remove that problem, it removes the <em>signal</em>: eight <code>@Autowired</code> fields scroll past as easily as two, so nobody notices the class growing.<br><br>

<table>
<tr><th>Dependencies</th><th>What it usually means</th></tr>
<tr><td>1-3</td><td>Healthy.</td></tr>
<tr><td>4-5</td><td>Worth a look. Often a controller doing service work, or a service doing mapping.</td></tr>
<tr><td>6+</td><td>Almost always two or three classes wearing one name. Split along the lines the dependencies suggest - the groups that get used together are the classes trying to emerge.</td></tr>
</table>
<br>
Before splitting, check for the easy wins: a dependency used by exactly one method may belong in a parameter instead of the constructor, and three dependencies always used together are a collaborator waiting to be extracted.<br>`
        },
        {
            content: `<h3>Two Things the Constructor Cannot Do</h3>
Constructor injection has two genuine limits, and both have standard answers.<br>`,
            codeExamples: [
                `// LIMIT 1: self-injection, for when a bean needs its own proxy.
//
// @Transactional and @Cacheable live in the proxy that wraps your bean.
// A call from one method to another on the same object bypasses that
// proxy, so the annotation silently does nothing:

@Service
public class OrderService {

    @Transactional
    public void inner() { ... }

    public void outer() {
        inner();              // NOT transactional - the proxy is skipped
    }
}

// Injecting yourself through the constructor is a cycle and fails.
// The workaround is @Lazy, or ObjectProvider:

@Service
public class OrderService {

    private final ObjectProvider<OrderService> self;

    public OrderService(ObjectProvider<OrderService> self) { this.self = self; }

    public void outer() {
        self.getObject().inner();   // goes through the proxy - IS transactional
    }
}

// This works, but treat it as a smell. inner() usually belongs on a
// separate bean, which makes the proxy boundary real instead of faked.`,
                `// LIMIT 2: a bean that only exists under some conditions.
//
// A constructor parameter is mandatory by definition. When the
// dependency may be absent - an optional integration, a bean behind
// @ConditionalOnProperty - use ObjectProvider rather than moving to
// setter injection:

@Service
public class OrderService {

    private final AuditService audit;

    public OrderService(ObjectProvider<AuditService> auditProvider) {
        this.audit = auditProvider.getIfAvailable(() -> AuditService.NO_OP);
    }
}

// The field stays final, the fallback is explicit, and no caller ever
// has to null-check. This is strictly better than @Autowired(required
// = false) on a field, which leaves a null in place and pushes the
// check to every use site.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why is constructor injection preferred?</td><td>Fields can be <code>final</code>, the object is fully initialised the moment it exists, dependencies are visible in the signature, circular dependencies fail at startup, and the class is unit-testable with plain <code>new</code>.</td></tr>
<tr><td>Is <code>@Autowired</code> needed on the constructor?</td><td>Not since Spring 4.3 when there is exactly one constructor. With several, exactly one must carry it.</td></tr>
<tr><td>What happens with two unannotated constructors?</td><td>Spring looks for a no-arg constructor, does not find one, and fails with <code>BeanInstantiationException: No default constructor found</code>.</td></tr>
<tr><td>Why does <code>final</code> matter beyond immutability?</td><td>The JMM guarantees a <code>final</code> field set in a constructor is visible to all threads that see the object - which matters because singletons are shared across request threads.</td></tr>
<tr><td>What happens on a circular dependency?</td><td>Startup fails with a cycle diagram. Since Boot 2.6, <code>spring.main.allow-circular-references</code> is <code>false</code> by default, so field injection no longer hides it either.</td></tr>
<tr><td>How do you fix a cycle?</td><td>Extract the shared responsibility into a third bean, or invert one direction with an application event. <code>@Lazy</code> breaks the cycle without fixing the design.</td></tr>
<tr><td>Does <code>@RequiredArgsConstructor</code> need <code>@Autowired</code>?</td><td>No. It generates a single constructor at compile time, so the single-constructor rule applies. It cannot express <code>@Qualifier</code> - write that constructor by hand.</td></tr>
<tr><td>Constructor with ten dependencies - what do you do?</td><td>Treat it as the SRP warning it is and split the class. Do not switch to field injection to hide the count.</td></tr>
<tr><td>How do you inject an optional dependency by constructor?</td><td><code>ObjectProvider&lt;T&gt;</code> with <code>getIfAvailable(fallback)</code>. The field stays final and no caller null-checks.</td></tr>
<tr><td>Why can a bean not inject itself by constructor?</td><td>It is a cycle. Use <code>@Lazy</code> or <code>ObjectProvider</code> when a bean genuinely needs its own proxy - though the method usually belongs on another bean.</td></tr>
</table>`
        }
    ]
};
