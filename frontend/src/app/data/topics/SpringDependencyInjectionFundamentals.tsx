import { Topic } from '../coreJava';

export const springDependencyInjectionFundamentals: Topic = {
    id: 'sb-dependency-injection',
    name: "Dependency Injection",
    beginner: [
        {
            content: `<h3>A Dependency Is Anything a Class Cannot Work Without</h3>
If <code>OrderService</code> cannot do its job without a <code>PaymentGateway</code>, then the gateway is a <strong>dependency</strong> of the service. Every class of any size has some.<br><br>

The only real question is <em>where that object comes from</em>, and there are exactly two answers:<br><br>

<table>
<tr><th>Approach</th><th>What happens</th></tr>
<tr><td>The class creates it</td><td><code>private PaymentGateway gateway = new StripeGateway();</code> - the class chooses its own collaborator and is now welded to that choice.</td></tr>
<tr><td>The class is given it</td><td>The class declares that it needs a <code>PaymentGateway</code> and something outside decides which one to supply. This is <strong>dependency injection</strong>.</td></tr>
</table>
<br>
That is the whole idea. Dependency injection is not a Spring invention and needs no framework - handing an object into a constructor is dependency injection, whether Spring is present or not. What Spring adds is doing it for you, for every object in the application, automatically.<br>`
        },
        {
            content: `<h3>Why the First Approach Hurts</h3>
The problem with <code>new</code> is not that it is ugly. It is that it makes one specific thing impossible: <strong>substitution</strong>.<br>`,
            codeExamples: [
                `// WITHOUT injection - the service builds its own collaborator.

@Service
public class OrderService {

    private final PaymentGateway gateway = new StripeGateway();   // hard-wired

    public Receipt checkout(Order order) {
        return gateway.charge(order.total());
    }
}

// Now try to write a test for checkout().
//
//   new OrderService().checkout(order);
//
// It calls the real Stripe. Over the network. With a real card.
// There is no seam - no way to get a different gateway in there without
// editing OrderService itself.
//
// The same wall appears in production: supporting a second payment
// provider means changing this class, and changing a class that already
// works is how working code stops working.`,
                `// WITH injection - the collaborator is handed in.

@Service
public class OrderService {

    private final PaymentGateway gateway;      // an interface, not a class

    public OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    public Receipt checkout(Order order) {
        return gateway.charge(order.total());
    }
}

// In production Spring supplies the real one.
// In a test you supply whatever you like:
//
//   PaymentGateway fake = order -> new Receipt("TEST-1", order);
//   Receipt r = new OrderService(fake).checkout(order);
//
// OUTPUT:
// Receipt[id=TEST-1] - no network, no card, runs in milliseconds.
//
// OrderService did not change between the two. That is the point:
// the class stopped deciding, so the decision can be made elsewhere.`
            ]
        },
        {
            content: `<h3>How Spring Does It</h3>
Spring's container performs the injection at startup, in three steps.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  1. FIND       Component scanning walks the packages and collects every
                class marked @Component / @Service / @Repository / @Controller,
                plus every @Bean method in a @Configuration class.
                Each becomes a "bean definition" - a recipe, not an object yet.

  2. ORDER      Spring reads what each definition needs. StripeGateway has
                no dependencies, so it can be built first. OrderService needs
                a PaymentGateway, so it must be built after.

  3. BUILD      Objects are created in that order and handed their
                collaborators as they go.

       StripeGateway  ---built first--->  passed into  --->  OrderService</pre>
<br>
The result lives in the <strong>ApplicationContext</strong>. By the time your application is up, every object exists and every reference is already filled in - there is no lazy wiring happening later while requests are being served.<br><br>

<strong>Matching is by type, not by name.</strong> <code>OrderService</code> asks for a <code>PaymentGateway</code>; Spring looks for a bean assignable to that type and finds <code>StripeGateway</code> because it implements the interface. The variable name is irrelevant - until two candidates match, which is where <code>@Qualifier</code> and <code>@Primary</code> come in (topics 18 and 19).<br>`
        },
        {
            content: `<h3>The Three Forms of Injection</h3>
Spring can inject through a constructor, through a setter, or straight into the field. Each has its own topic next - this is the shape of all three side by side so the differences are visible in one place.<br>`,
            codeExamples: [
                `// 1. CONSTRUCTOR INJECTION  (topic 5) - the recommended default
@Service
public class OrderService {

    private final PaymentGateway gateway;    // can be final

    public OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }
}
// Since Spring 4.3, @Autowired is not needed when there is only
// one constructor. The object is never half-built.


// 2. SETTER INJECTION  (topic 6) - for genuinely optional dependencies
@Service
public class OrderService {

    private PaymentGateway gateway;          // cannot be final

    @Autowired
    public void setGateway(PaymentGateway gateway) {
        this.gateway = gateway;
    }
}
// The object exists before the setter runs, so there is a window
// in which the field is still null.


// 3. FIELD INJECTION  (topic 7) - shortest, and the one to avoid
@Service
public class OrderService {

    @Autowired
    private PaymentGateway gateway;          // no constructor, no setter
}
// Spring sets this by reflection. Convenient - and it is the form
// that cannot be constructed in a plain unit test.`,
                `// The practical difference, in one test.

// Constructor injection - the test just calls the constructor:
OrderService s = new OrderService(fakeGateway);          // compiles, works

// Field injection - there is nothing to call:
OrderService s = new OrderService();                      // gateway is null
s.checkout(order);
// OUTPUT:
// Exception in thread "main" java.lang.NullPointerException:
//   Cannot invoke "PaymentGateway.charge(...)" because "this.gateway" is null
//
// To test it you must either start a Spring context or use reflection
// (ReflectionTestUtils.setField) - both far heavier than a constructor call.`
            ]
        },
        {
            content: `<h3>Which One to Use</h3>

<table>
<tr><th>Form</th><th>Field can be final</th><th>Unit-testable with <code>new</code></th><th>Use it when</th></tr>
<tr><td>Constructor</td><td>Yes</td><td>Yes</td><td>Always, unless you have a specific reason not to. This is the form the Spring team recommends.</td></tr>
<tr><td>Setter</td><td>No</td><td>Yes</td><td>The dependency is genuinely optional, or must be swappable after construction.</td></tr>
<tr><td>Field</td><td>No</td><td>No</td><td>Test classes, and legacy code you are not rewriting today.</td></tr>
</table>
<br>
There is one more argument for the constructor that has nothing to do with Spring: <strong>a long parameter list is honest</strong>. When a constructor grows to eight dependencies, the class is visibly doing too much. Field injection hides that - eight <code>@Autowired</code> fields look no worse than two, so the class quietly keeps growing.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>What Happens When the Match Is Not Exactly One</h3>
Injection by type has three outcomes, and only one of them is success.<br><br>

<table>
<tr><th>Candidates found</th><th>Result</th></tr>
<tr><td>Exactly one</td><td>Injected.</td></tr>
<tr><td>None</td><td><code>NoSuchBeanDefinitionException</code> at startup. Usually the class is outside the scanned packages, or the stereotype annotation is missing.</td></tr>
<tr><td>Two or more</td><td><code>NoUniqueBeanDefinitionException</code>, unless one is <code>@Primary</code>, or the injection point carries <code>@Qualifier</code>, or the parameter name happens to match a bean name.</td></tr>
</table>
<br>
That last fallback is worth knowing because it fails silently in the other direction. If two <code>PaymentGateway</code> beans exist named <code>stripeGateway</code> and <code>paypalGateway</code>, then a parameter named <code>stripeGateway</code> resolves - and renaming that parameter during a tidy-up breaks startup. Never rely on it; use <code>@Qualifier</code> when there is a choice to make.<br><br>

The full resolution order Spring applies at an injection point:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  1. Collect every bean assignable to the required type
  2. If a @Qualifier is present, keep only beans matching that qualifier
  3. If more than one remains, keep the one marked @Primary
  4. If still more than one, keep the one whose bean name equals the
     field or parameter name
  5. Exactly one left  -> inject it
     Zero left         -> NoSuchBeanDefinitionException
     More than one     -> NoUniqueBeanDefinitionException</pre>`
        },
        {
            content: `<h3>Injecting More Than One, and Injecting Nothing</h3>
Two cases the by-type rule handles specially, and both are useful.<br>`,
            codeExamples: [
                `// ALL implementations at once - not an error, a feature.
// This is how the Strategy pattern is wired in Spring.

public interface Validator { void check(Order o); }

@Component class AmountValidator  implements Validator { ... }
@Component class AddressValidator implements Validator { ... }
@Component class StockValidator   implements Validator { ... }

@Service
public class OrderValidator {

    private final List<Validator> validators;    // every implementation

    public OrderValidator(List<Validator> validators) {
        this.validators = validators;
    }

    public void validate(Order o) {
        validators.forEach(v -> v.check(o));
    }
}

// Adding a fourth validator is a new @Component class and nothing else.
// No registration, no edit to OrderValidator.
//
// Order is undefined unless the beans implement Ordered or carry @Order:
//     @Component @Order(1) class AmountValidator implements Validator
//
// A Map<String, Validator> injects the same beans keyed by bean name,
// which is how you dispatch on a code: validators.get(request.getType()).`,
                `// OPTIONAL dependency - three ways, in increasing order of preference.

// (a) required = false: the field stays null. Every use site now needs
//     a null check, and forgetting one is an NPE in production.
@Autowired(required = false)
private AuditService audit;

// (b) Optional<T> in the constructor: the absence is in the type, so the
//     compiler makes you deal with it.
public OrderService(Optional<AuditService> audit) {
    this.audit = audit.orElse(AuditService.NO_OP);
}

// (c) ObjectProvider<T>: the most capable form. Lazy, and it also
//     handles the "zero or many" cases without throwing.
public OrderService(ObjectProvider<AuditService> audit) {
    this.audit = audit.getIfAvailable(() -> AuditService.NO_OP);
}

// ObjectProvider is also the standard fix for injecting a prototype bean
// into a singleton: because it looks the bean up on each call rather than
// once at startup, you get a fresh instance every time.
//
//   private final ObjectProvider<Report> reports;
//   Report r = reports.getObject();   // a new Report on every call`
            ]
        },
        {
            content: `<h3>Why Not a Service Locator?</h3>
Both patterns implement Inversion of Control - the class stops calling <code>new</code>. The difference is which direction the knowledge flows.<br>`,
            codeExamples: [
                `// SERVICE LOCATOR - the class reaches out and asks.
@Service
public class OrderService {

    @Autowired
    private ApplicationContext context;       // the framework, in your class

    public Receipt checkout(Order order) {
        PaymentGateway gateway = context.getBean(PaymentGateway.class);
        return gateway.charge(order.total());
    }
}

// Three problems, all of them practical:
//
// 1. The dependency is invisible. Reading the constructor tells you
//    nothing; you must read every method body to learn what this class
//    needs.
// 2. A missing bean is now a runtime failure on the checkout path,
//    not a startup failure.
// 3. The class imports org.springframework - it can no longer be
//    instantiated in a test without a container.`,
                `// DEPENDENCY INJECTION - the class declares and waits.
@Service
public class OrderService {

    private final PaymentGateway gateway;

    public OrderService(PaymentGateway gateway) {   // the whole contract,
        this.gateway = gateway;                     // visible in one line
    }
}

// The dependency is in the signature, a missing bean fails at startup,
// and there is no Spring import anywhere in the file.
//
// This is why Spring made injection the default and why ApplicationContext
// is almost never injected into business classes. If you find yourself
// calling getBean() inside a service, the object you want should have
// been a constructor parameter.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is dependency injection?</td><td>Supplying a class with the collaborators it needs from outside, rather than letting it create them. It is the technique Spring uses to implement Inversion of Control.</td></tr>
<tr><td>Is DI the same as IoC?</td><td>No. IoC is the principle - something else decides. DI is one way to implement it; Service Locator is another.</td></tr>
<tr><td>How does Spring decide which bean to inject?</td><td>By type. If several match, <code>@Qualifier</code> wins, then <code>@Primary</code>, then a bean name equal to the parameter or field name.</td></tr>
<tr><td>Which injection type is recommended and why?</td><td>Constructor: the field can be <code>final</code>, the object is never half-built, dependencies are visible in the signature, and it needs no framework to unit test.</td></tr>
<tr><td>Is <code>@Autowired</code> required on a constructor?</td><td>Not since Spring 4.3, when the class has a single constructor. With several constructors, one must be annotated.</td></tr>
<tr><td>What if no bean of the required type exists?</td><td><code>NoSuchBeanDefinitionException</code> at startup - typically a missing stereotype annotation or a package outside component scanning.</td></tr>
<tr><td>What if two beans match?</td><td><code>NoUniqueBeanDefinitionException</code>, unless disambiguated by <code>@Primary</code>, <code>@Qualifier</code> or a matching bean name.</td></tr>
<tr><td>Can you inject every implementation of an interface?</td><td>Yes - declare <code>List&lt;T&gt;</code> and Spring injects them all; <code>Map&lt;String, T&gt;</code> gives them keyed by bean name. Sequence is controlled with <code>@Order</code>.</td></tr>
<tr><td>How do you inject a prototype bean into a singleton?</td><td><code>ObjectProvider&lt;T&gt;</code> (or a lookup method). A plain field is resolved once at startup, so the singleton would keep the same instance forever.</td></tr>
<tr><td>Why is injecting <code>ApplicationContext</code> discouraged?</td><td>It turns DI back into a Service Locator: dependencies become invisible, failures move from startup to request time, and the class gains a Spring import that stops it being unit-testable.</td></tr>
</table>`
        }
    ]
};
