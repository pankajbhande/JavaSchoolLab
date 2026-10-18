import { Topic } from '../coreJava';

export const springSetterInjection: Topic = {
    id: 'sb-setter-injection',
    name: "Setter Injection",
    beginner: [
        {
            content: `<h3>The Dependency Arrives After the Object Exists</h3>
Setter injection means Spring calls a normal JavaBean setter and passes the dependency in. The object is created first with its no-arg constructor, and the setters run afterwards.<br><br>

That ordering is the entire difference from constructor injection, and everything else about setter injection - good and bad - follows from it.<br>`,
            codeExamples: [
                `@Service
public class OrderService {

    private PaymentGateway gateway;        // cannot be final

    @Autowired
    public void setGateway(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    public Receipt checkout(Order order) {
        return gateway.charge(order.total());
    }
}

// Unlike the constructor, @Autowired here is NOT optional.
// Without it Spring never calls the setter, the field stays null,
// and the failure is an NPE on the first checkout - at runtime,
// in production, not at startup.`,
                `// What Spring actually does, in order:

//  1. OrderService service = new OrderService();   <-- gateway is null here
//  2. service.setGateway(stripeGateway);           <-- now it is set
//  3. @PostConstruct methods run
//  4. the bean is handed out

// Step 1 is the window. Between the constructor returning and step 2,
// the object exists in an unusable state. Nothing in your code can
// observe that window in a simple case - but a constructor that tries
// to USE a dependency can:

@Service
public class OrderService {

    private PaymentGateway gateway;

    public OrderService() {
        gateway.warmUp();      // NullPointerException - the setter
    }                          // has not run yet and cannot have run

    @Autowired
    public void setGateway(PaymentGateway gateway) { this.gateway = gateway; }
}
// OUTPUT:
// BeanCreationException ... Caused by: java.lang.NullPointerException
//
// With constructor injection this class would not compile in the first
// place, which is the better outcome.`
            ]
        },
        {
            content: `<h3>What You Give Up</h3>

<table>
<tr><th>Lost</th><th>Consequence</th></tr>
<tr><td><code>final</code> fields</td><td>The field is assigned after construction, so it cannot be final. Any code can reassign it later, and you lose the JMM safe-publication guarantee that makes a shared singleton's fields reliably visible to every request thread.</td></tr>
<tr><td>The guarantee of completeness</td><td>An object can exist with some dependencies set and others not. "Constructed" and "usable" become two different states.</td></tr>
<tr><td>A compile-checked test setup</td><td><code>new OrderService()</code> compiles happily and produces a broken object. The test author must remember every setter; forgetting one is an NPE, not a compile error.</td></tr>
<tr><td>Startup-time cycle detection</td><td>A circular dependency resolves silently instead of failing. That is usually described as an advantage - see the Expert section for why it is not.</td></tr>
</table>
<br>
This is why the Spring reference documentation recommends constructors for mandatory dependencies and setters only for optional ones.<br>`
        },
        {
            content: `<h3>When Setter Injection Is the Right Answer</h3>
It is not obsolete - there are three cases where it is genuinely the better tool.<br><br>

<table>
<tr><th>Case</th><th>Why the setter fits</th></tr>
<tr><td><strong>A dependency that must change at runtime</strong></td><td>A JMX-exposed setter, or a component reconfigured by an admin endpoint. Constructor injection deliberately makes this impossible; if you need it, that is a reason to use a setter rather than to fight it.</td></tr>
<tr><td><strong>Framework and base classes</strong></td><td>A subclass of a framework class you do not control cannot always dictate its own constructor signature. Spring's own <code>JdbcDaoSupport</code> works this way - <code>setDataSource()</code> exists precisely so subclasses need not redeclare it.</td></tr>
<tr><td><strong>Legacy code you are not rewriting today</strong></td><td>XML-configured Spring is built on setters, and a class already wired that way works. Migrating it is a choice, not a requirement.</td></tr>
</table>
<br>
Notice that "the dependency is optional" is <em>not</em> on this list. An optional dependency is better expressed as <code>ObjectProvider&lt;T&gt;</code> in the constructor with an explicit fallback, which keeps the field final and spares every caller a null check.<br>`,
            codeExamples: [
                `// The XML form, for reading older projects. This is the same thing -
// <property> IS setter injection, and it is why the setter convention
// exists at all.

<bean id="orderService" class="com.shop.OrderService">
    <property name="gateway" ref="stripeGateway"/>
    <property name="retryLimit" value="3"/>
</bean>

<!-- Spring reads name="gateway" and calls setGateway(...).
     The name maps to the SETTER, not to the field: name="gateway"
     requires a method called setGateway. A field renamed without its
     setter still works; a setter renamed without the XML does not. -->

<!-- The constructor equivalent, for contrast: -->
<bean id="orderService" class="com.shop.OrderService">
    <constructor-arg ref="stripeGateway"/>
    <constructor-arg value="3"/>
</bean>`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Setters Tolerate Circular Dependencies - Which Hides the Problem</h3>
Setter injection resolves a cycle that constructor injection rejects, because the objects can be created empty first and wired afterwards. This is frequently listed as an advantage of setter injection. It is better understood as a deferred failure.<br>`,
            codeExamples: [
                `// A cycle Spring can resolve with setters:

@Service
public class OrderService {
    private InvoiceService invoices;
    @Autowired public void setInvoices(InvoiceService i) { this.invoices = i; }
}

@Service
public class InvoiceService {
    private OrderService orders;
    @Autowired public void setOrders(OrderService o) { this.orders = o; }
}

// Spring's three-level cache makes this work:
//   1. construct OrderService          (empty)
//   2. expose it as an "early reference"
//   3. construct InvoiceService, set the early OrderService into it
//   4. set the finished InvoiceService into OrderService
//
// The application starts. The design flaw is still there.`,
                `// Where the deferred failure lands.
//
// Add @Transactional to OrderService. Spring must now wrap it in a
// proxy - but InvoiceService was handed the RAW object at step 3,
// before the proxy existed:

@Service
@Transactional                       // <-- newly added
public class OrderService { ... }

// OUTPUT at startup (Spring 5.3+ detects the mismatch):
//
// BeanCurrentlyInCreationException: Error creating bean with name
// 'orderService': Bean with name 'orderService' has been injected into
// other beans [invoiceService] in its raw version as part of a circular
// reference, but has eventually been wrapped. This means that said other
// beans do not use the final version of the bean.
//
// Older Spring versions did NOT detect this. They started cleanly and
// InvoiceService simply called an unproxied OrderService - so
// @Transactional silently did nothing on that path. That bug is
// invisible until data goes missing.
//
// Since Spring Boot 2.6 the cycle is rejected outright by default:
//   spring.main.allow-circular-references=false
//
// Setting it back to true restores the old behaviour and the old class
// of bug. Fix the cycle instead.`
            ]
        },
        {
            content: `<h3>Ordering, and What Is Not Guaranteed</h3>
Two rules are worth knowing precisely, because code sometimes leans on assumptions that are not true.<br><br>

<table>
<tr><th>Guaranteed</th><th>Not guaranteed</th></tr>
<tr><td>All <code>@Autowired</code> setters run before any <code>@PostConstruct</code> method.</td><td>The order in which the setters themselves run. Spring uses reflection order, which is not the source order and can differ between JVMs.</td></tr>
<tr><td>Constructor injection completes before any setter runs.</td><td>That a setter runs at all if <code>@Autowired</code> is missing - the field silently stays null.</td></tr>
</table>
<br>
The practical rule: <strong>never let one setter depend on another having already run.</strong> If two dependencies must be combined into derived state, do that in <code>@PostConstruct</code>, which is the first point at which everything is guaranteed to be in place.<br>`,
            codeExamples: [
                `// WRONG - assumes setDataSource() runs before setSchema().
@Service
public class ReportService {

    private DataSource dataSource;
    private String schema;
    private JdbcTemplate template;

    @Autowired
    public void setDataSource(DataSource ds) {
        this.dataSource = ds;
        this.template = new JdbcTemplate(ds);
        this.template.setSchema(schema);     // schema may still be null
    }

    @Value("\${app.schema}")
    public void setSchema(String schema) { this.schema = schema; }
}
// Works or breaks depending on reflection order. It will pass on your
// machine and fail on the build server, or after a JDK upgrade.`,
                `// RIGHT - the setters only assign; the combining happens once,
// at a point where everything is guaranteed to be set.

@Service
public class ReportService {

    private DataSource dataSource;
    private String schema;
    private JdbcTemplate template;

    @Autowired
    public void setDataSource(DataSource ds) { this.dataSource = ds; }

    @Value("\${app.schema}")
    public void setSchema(String schema) { this.schema = schema; }

    @PostConstruct
    void init() {                      // every setter has run by now
        this.template = new JdbcTemplate(dataSource);
        this.template.setSchema(schema);
    }
}

// A setter should assign a field and nothing else. Any logic in it is
// running at a moment whose ordering you do not control.`
            ]
        },
        {
            content: `<h3><code>@Required</code>, and How This Was Handled Historically</h3>
The obvious hole in setter injection - forgetting to wire something - had a dedicated annotation for it.<br><br>

<code>@Required</code> on a setter made Spring fail at startup if that property was never set, converting a runtime NPE into a startup error. It was deprecated in Spring 5.1 and <strong>removed in Spring 6</strong>. You will meet it in older code; it has no replacement, because the replacement is constructor injection - a constructor parameter is required by construction, with no annotation and no framework involvement.<br><br>

Two related notes for reading older or mixed codebases:<br><br>

<table>
<tr><th>Form</th><th>Behaviour</th></tr>
<tr><td><code>@Autowired</code> on a setter</td><td>Required by default. No matching bean means <code>NoSuchBeanDefinitionException</code> at startup.</td></tr>
<tr><td><code>@Autowired(required = false)</code></td><td>The setter is skipped entirely when no bean matches. The field keeps whatever the constructor left it as - which is how you give a setter-injected optional dependency a real default.</td></tr>
<tr><td><code>@Resource</code> on a setter</td><td>JSR-250. Matches <strong>by name first</strong>, then by type - the opposite of <code>@Autowired</code>. Mixing the two in one class is a common source of "why did it inject that one".</td></tr>
</table>`,
            codeExamples: [
                `// A defaulted optional dependency - the one pattern where setter
// injection reads better than the alternatives.

@Service
public class OrderService {

    private AuditService audit = AuditService.NO_OP;   // sensible default

    @Autowired(required = false)                       // overridden if a bean exists
    public void setAudit(AuditService audit) { this.audit = audit; }

    public Receipt checkout(Order order) {
        audit.record(order);        // never null, so no null check anywhere
        return ...;
    }
}

// The field is initialised at construction, so there is no null window,
// and the setter only ever replaces a working default with a better one.
//
// Compare with the constructor form, which is still preferable because
// the field can be final:
//
//   public OrderService(ObjectProvider<AuditService> audit) {
//       this.audit = audit.getIfAvailable(() -> AuditService.NO_OP);
//   }`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is setter injection?</td><td>Spring instantiates the bean with its no-arg constructor, then calls <code>@Autowired</code> setters to supply dependencies.</td></tr>
<tr><td>Is <code>@Autowired</code> optional on a setter?</td><td>No. Without it the setter is never called and the field stays null - unlike the single-constructor rule, which needs no annotation.</td></tr>
<tr><td>Why can the field not be <code>final</code>?</td><td>It is assigned after the constructor has returned, and <code>final</code> requires assignment during construction.</td></tr>
<tr><td>Setter vs constructor - when is each right?</td><td>Constructor for mandatory dependencies; setter when the dependency must be replaceable at runtime, when a framework base class dictates it, or in legacy XML-wired code.</td></tr>
<tr><td>Why do setters tolerate circular dependencies?</td><td>Spring can construct both beans empty and wire them afterwards using its early-reference cache. It resolves the cycle without fixing the design.</td></tr>
<tr><td>What breaks in a setter-resolved cycle?</td><td>If one bean is later proxied (<code>@Transactional</code>, <code>@Async</code>), the other may hold the raw object. Spring 5.3+ throws <code>BeanCurrentlyInCreationException</code>; older versions silently skipped the proxy.</td></tr>
<tr><td>Are setters called in a defined order?</td><td>No. Only the guarantee that all of them run before <code>@PostConstruct</code>. Combine dependencies there, never inside a setter.</td></tr>
<tr><td>What was <code>@Required</code>?</td><td>An annotation failing startup if a setter was never called. Deprecated in 5.1, removed in Spring 6 - constructor injection gives the same guarantee for free.</td></tr>
<tr><td><code>@Autowired</code> vs <code>@Resource</code> on a setter?</td><td><code>@Autowired</code> matches by type then name; <code>@Resource</code> (JSR-250) matches by name then type.</td></tr>
<tr><td>Best way to give an optional dependency a default?</td><td>Initialise the field to a no-op and mark the setter <code>@Autowired(required = false)</code>; better still, take <code>ObjectProvider&lt;T&gt;</code> in the constructor and keep the field final.</td></tr>
</table>`
        }
    ]
};
