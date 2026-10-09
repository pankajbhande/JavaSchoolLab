import { Topic } from '../coreJava';

export const springBeanScopes: Topic = {
    id: 'sb-bean-scopes',
    name: "Bean Scopes",
    beginner: [
        {
            content: `<h3>Scope Answers One Question: How Many?</h3>
A bean definition is a recipe. Scope decides how many objects Spring makes from it, and how long each one lives.<br><br>

<table>
<tr><th>Scope</th><th>One instance per</th><th>Available in</th></tr>
<tr><td><strong><code>singleton</code></strong></td><td>Container. <strong>This is the default.</strong></td><td>Everywhere</td></tr>
<tr><td><code>prototype</code></td><td>Request for the bean - a new object every time</td><td>Everywhere</td></tr>
<tr><td><code>request</code></td><td>HTTP request</td><td>Web applications only</td></tr>
<tr><td><code>session</code></td><td>HTTP session</td><td>Web applications only</td></tr>
<tr><td><code>application</code></td><td><code>ServletContext</code></td><td>Web applications only</td></tr>
<tr><td><code>websocket</code></td><td>WebSocket session</td><td>WebSocket applications only</td></tr>
</table>
<br>
In practice you will use <code>singleton</code> for almost everything, <code>prototype</code> occasionally, and <code>request</code>/<code>session</code> rarely - and mostly in server-rendered applications rather than REST services.<br>`,
            codeExamples: [
                `// Default - no annotation needed.
@Service
public class OrderService { }                     // singleton

// Explicit, for readability:
@Service
@Scope("singleton")
public class OrderService { }

// A new instance on every injection and every getBean() call:
@Component
@Scope("prototype")
public class ReportBuilder { }

// Constants instead of strings - the compiler catches typos:
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Scope(WebApplicationContext.SCOPE_REQUEST)

// @Scope("singelton") is not an error. It is treated as an unknown
// scope name and fails at startup with:
//   IllegalStateException: No Scope registered for scope name 'singelton'`
            ]
        },
        {
            content: `<h3>"Singleton" Does Not Mean the Singleton Pattern</h3>
The name is borrowed and it misleads. A Spring singleton is <strong>one instance per container</strong>, not one per JVM.<br><br>

<table>
<tr><th>GoF Singleton</th><th>Spring singleton</th></tr>
<tr><td>One instance per class loader, enforced by a private constructor and a static field.</td><td>One instance per <code>ApplicationContext</code>. The class has a public constructor and nothing stops you making more.</td></tr>
<tr><td>The class enforces it.</td><td>The container manages it. The class does not know.</td></tr>
</table>
<br>
This has a practical consequence people meet in tests: two application contexts mean two instances of every singleton. A test suite that starts several differently-configured contexts is holding several copies of each service - which is fine, and is why static mutable state in a bean causes tests to interfere with one another.<br>`,
            codeExamples: [
                `// Two contexts, two "singletons" - same class, different objects.

var a = new AnnotationConfigApplicationContext(AppConfig.class);
var b = new AnnotationConfigApplicationContext(AppConfig.class);

System.out.println(a.getBean(OrderService.class)
                == b.getBean(OrderService.class));
// OUTPUT: false

// Within one context, always the same object:
System.out.println(a.getBean(OrderService.class)
                == a.getBean(OrderService.class));
// OUTPUT: true`
            ]
        },
        {
            content: `<h3>The Consequence Nobody Mentions Until It Breaks</h3>
Singleton is the default, so <strong>one instance of every service is shared by every request thread at the same time</strong>. That makes instance fields shared mutable state.<br>`,
            codeExamples: [
                `// BROKEN - and it will pass every test you write for it.

@Service
public class InvoiceService {

    private Order current;                 // shared by ALL threads

    public Invoice generate(Order order) {
        this.current = order;              // thread A writes
        applyDiscounts();                  // thread B overwrites here
        return new Invoice(this.current);  // thread A reads B's order
    }

    private void applyDiscounts() { ... }
}

// Under load this issues invoices for the wrong customer. It is not
// reproducible on a developer machine, it does not show up in a unit
// test, and it looks like a database problem.
//
// The bug is the field. Everything a request needs must live on the
// stack, not on the bean.`,
                `// CORRECT - state travels through parameters and return values.

@Service
public class InvoiceService {

    private final DiscountPolicy policy;      // final, immutable, shared safely

    public InvoiceService(DiscountPolicy policy) { this.policy = policy; }

    public Invoice generate(Order order) {    // 'order' is per-thread
        Order discounted = policy.apply(order);
        return new Invoice(discounted);
    }
}

// The rule for singleton beans:
//   final dependencies and immutable configuration  -> fields
//   anything belonging to one request               -> parameters
//
// Note that switching to @Scope("prototype") does NOT fix the broken
// version: a prototype injected into a singleton controller is still
// resolved once, so one instance still serves every thread. See the
// Expert section.`
            ]
        },
        {
            content: `<h3>Prototype: a New Object Every Time</h3>
A prototype bean is created fresh on every request for it, gets its dependencies injected, and is then <strong>forgotten</strong> - Spring does not keep a reference.<br><br>

Two consequences follow from being forgotten, and the second is a real leak:<br><br>

<table>
<tr><th>Consequence</th><th>Detail</th></tr>
<tr><td>Created lazily, always</td><td>Prototypes are never instantiated at startup, even in an eager context - there is nothing to instantiate until someone asks.</td></tr>
<tr><td><strong>Destroy callbacks never run</strong></td><td><code>@PreDestroy</code> and <code>DisposableBean</code> are not called on a prototype, ever. Spring is not tracking it, so it cannot clean it up. If the bean holds a file handle, a socket or a thread, the caller must release it.</td></tr>
</table>
<br>
Use prototype for objects that carry per-use state - a builder, a parser, a report accumulator. Do not use it as a way to make a service thread-safe; that is the mistake the next section is about.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>The Prototype-in-Singleton Trap</h3>
The most common scope bug. Injecting a prototype into a singleton does not give you a new instance per call - it gives you <em>one</em> instance, injected once, for the life of the singleton.<br>`,
            codeExamples: [
                `@Component
@Scope("prototype")
public class ReportBuilder {
    private final List<Row> rows = new ArrayList<>();
    public void add(Row r) { rows.add(r); }
    public Report build() { return new Report(rows); }
}

@Service                                   // singleton
public class ReportService {

    private final ReportBuilder builder;    // injected ONCE at startup

    public ReportService(ReportBuilder builder) { this.builder = builder; }

    public Report generate(Data data) {
        data.rows().forEach(builder::add);   // appends to the SAME builder
        return builder.build();              // grows on every call
    }
}

// OUTPUT:
// first call  -> 10 rows
// second call -> 20 rows
// third call  -> 30 rows
//
// The scope is honoured exactly as specified: ONE ReportBuilder was
// requested - at injection time - so one was created. Nothing asks
// for another.`,
                `// FIX 1: ObjectProvider - ask for a new one at the moment you need it.
//         Clearest, and the one to reach for by default.

@Service
public class ReportService {

    private final ObjectProvider<ReportBuilder> builders;

    public ReportService(ObjectProvider<ReportBuilder> builders) {
        this.builders = builders;
    }

    public Report generate(Data data) {
        ReportBuilder builder = builders.getObject();   // new one, per call
        data.rows().forEach(builder::add);
        return builder.build();
    }
}
// OUTPUT: 10 rows, 10 rows, 10 rows.


// FIX 2: @Lookup - Spring overrides the method to return a fresh bean.
@Service
public abstract class ReportService {

    @Lookup
    protected abstract ReportBuilder newBuilder();

    public Report generate(Data data) {
        ReportBuilder builder = newBuilder();
        ...
    }
}
// Works, but requires the class to be non-final and CGLIB-proxied,
// and an abstract service class surprises readers.


// FIX 3: a scoped proxy on the prototype itself.
@Component
@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ReportBuilder { }
// Now the injected field is a proxy that resolves a new target on
// every method call - which means builder.add() and builder.build()
// hit DIFFERENT instances. Almost never what you want for a stateful
// builder. Correct for request/session scope; wrong here.


// FIX 4 - usually the best answer: it did not need to be a bean.
//         'new ReportBuilder()' is a normal object with no dependencies.
//         Scope problems disappear when the object is just an object.`
            ]
        },
        {
            content: `<h3>Request and Session Scope Need a Proxy</h3>
The same "injected once" problem applies to web scopes, but here it fails loudly, and the fix is standard.<br>`,
            codeExamples: [
                `// BROKEN - a singleton cannot hold a request-scoped bean.
@Component
@Scope("request")
public class RequestContext {
    private String correlationId;
    ...
}

@Service                                   // singleton
public class AuditService {
    private final RequestContext context;   // when would this be resolved?
    public AuditService(RequestContext context) { this.context = context; }
}

// OUTPUT at startup:
// BeanCreationException: Scope 'request' is not active for the current
// thread; consider defining a scoped proxy for this bean if you intend
// to refer to it from a singleton
//
// Spring is right: at startup there is no HTTP request, so there is no
// instance to inject.`,
                `// FIXED - inject a proxy that resolves the real bean per request.
@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext {
    private String correlationId;
    public String getCorrelationId() { return correlationId; }
}

// Or, more compactly - these annotations bundle the proxyMode already:
@RequestScope      // = @Scope("request", proxyMode = TARGET_CLASS)
@SessionScope
@ApplicationScope

// What is injected is a stub. Every method call on it looks up the
// instance bound to the CURRENT thread's request and forwards:
//
//   singleton AuditService
//        |
//        v
//   RequestContext$$SpringCGLIB   <-- injected once, lives forever
//        |
//        +--> thread A: request-1's RequestContext
//        +--> thread B: request-2's RequestContext
//
// Two cautions:
//
// 1. TARGET_CLASS uses CGLIB, so the class must not be final and needs
//    a no-arg constructor. INTERFACES is the JDK-proxy alternative when
//    the bean implements one.
//
// 2. Calling a method on that proxy outside a request - from a
//    @Scheduled job, an @Async thread, or a CommandLineRunner - throws
//    the same "Scope 'request' is not active" error, now at runtime
//    instead of startup. @Async is the usual culprit: the request
//    context does not follow the thread.`
            ]
        },
        {
            content: `<h3>Scope on a <code>@Bean</code> Method, and Custom Scopes</h3>
Two smaller points that come up in real configuration.<br>`,
            codeExamples: [
                `// Scope goes next to @Bean, and the proxy mode is set the same way.
@Configuration
public class AppConfig {

    @Bean
    @Scope(value = "prototype")
    public ReportBuilder reportBuilder() {
        return new ReportBuilder();
    }

    @Bean
    @RequestScope
    public RequestContext requestContext() {
        return new RequestContext();
    }
}

// Careful: proxyMode on a @Bean method proxies the RETURN TYPE.
// If the method returns an interface, use ScopedProxyMode.INTERFACES;
// TARGET_CLASS on an interface-typed @Bean method silently proxies the
// interface and can lose methods the implementation added.`,
                `// A custom scope - rarer, but the mechanism is small enough to know.
// Here: one instance per thread.

public class ThreadScope implements Scope {

    private final ThreadLocal<Map<String, Object>> beans =
        ThreadLocal.withInitial(HashMap::new);

    @Override
    public Object get(String name, ObjectFactory<?> factory) {
        return beans.get().computeIfAbsent(name, k -> factory.getObject());
    }

    @Override
    public Object remove(String name) { return beans.get().remove(name); }

    @Override public void registerDestructionCallback(String n, Runnable c) { }
    @Override public Object resolveContextualObject(String key) { return null; }
    @Override public String getConversationId() {
        return Thread.currentThread().getName();
    }
}

@Configuration
public class ScopeConfig implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory bf) {
        bf.registerScope("thread", new ThreadScope());
    }
}

// Then: @Scope(value = "thread", proxyMode = ScopedProxyMode.TARGET_CLASS)
//
// Note the empty registerDestructionCallback: this implementation
// leaks, because a ThreadLocal on a pooled request thread is never
// cleared. Custom scopes are easy to write and easy to get wrong -
// which is the real reason they are rare.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Name the scopes and the default.</td><td><code>singleton</code> (default), <code>prototype</code>, and the web scopes <code>request</code>, <code>session</code>, <code>application</code>, <code>websocket</code>.</td></tr>
<tr><td>Is a Spring singleton the Singleton pattern?</td><td>No. One instance per <code>ApplicationContext</code>, not per JVM. The class has a public constructor and two contexts hold two instances.</td></tr>
<tr><td>Are singleton beans thread-safe?</td><td>Spring makes no such guarantee. One instance serves all request threads, so any mutable instance field is shared state. Keep dependencies final and per-request data in parameters.</td></tr>
<tr><td>When is a prototype created?</td><td>On every request for it - never at startup, even in an eager context.</td></tr>
<tr><td>Do prototypes get destroy callbacks?</td><td>No. Spring does not retain a reference, so <code>@PreDestroy</code> never runs and cleanup is the caller's job.</td></tr>
<tr><td>Prototype injected into a singleton - what happens?</td><td>It is resolved once at injection and the same instance is reused forever. Use <code>ObjectProvider</code>, <code>@Lookup</code>, or make it a plain object.</td></tr>
<tr><td>Why does a request-scoped bean need a scoped proxy?</td><td>At startup no request exists, so there is nothing to inject. The proxy is injected once and resolves the current thread's instance on each call.</td></tr>
<tr><td><code>TARGET_CLASS</code> vs <code>INTERFACES</code>?</td><td>CGLIB subclass (class must not be final, needs a no-arg constructor) versus a JDK dynamic proxy over an implemented interface.</td></tr>
<tr><td>What breaks a request-scoped bean at runtime?</td><td>Using it off the request thread - <code>@Async</code>, <code>@Scheduled</code>, a runner - throws "Scope 'request' is not active for the current thread".</td></tr>
<tr><td>How do you register a custom scope?</td><td>Implement <code>org.springframework.beans.factory.config.Scope</code> and call <code>registerScope</code> from a <code>BeanFactoryPostProcessor</code>.</td></tr>
</table>`
        }
    ]
};
