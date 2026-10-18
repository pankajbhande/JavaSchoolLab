import { Topic } from '../coreJava';

export const springBeanLifecycle: Topic = {
    id: 'sb-bean-lifecycle',
    name: "Bean Lifecycle",
    beginner: [
        {
            content: `<h3>Between <code>new</code> and Ready</h3>
Creating a bean is not one step. Between calling the constructor and handing the object out, Spring runs a fixed sequence - and the object is not usable until that sequence finishes.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  STARTUP
  =======

   1  Instantiate            the constructor runs
                             (constructor-injected deps arrive here)

   2  Populate properties    @Autowired fields and setters are filled

   3  Aware callbacks        setBeanName, setBeanFactory,
                             setApplicationContext

   4  BeanPostProcessor      postProcessBeforeInitialization(...)
         BEFORE

   5  Initialisation         @PostConstruct
                             then InitializingBean.afterPropertiesSet()
                             then @Bean(initMethod = "...")

   6  BeanPostProcessor      postProcessAfterInitialization(...)
         AFTER               <-- PROXIES ARE CREATED HERE

   7  READY                  the bean is in the container and injectable


  SHUTDOWN
  ========

   8  @PreDestroy
   9  DisposableBean.destroy()
  10  @Bean(destroyMethod = "...")</pre>
<br>
Two things in that list explain most of the surprising behaviour you will meet later: <strong>step 2 happens after step 1</strong> (so an injected field is null inside the constructor), and <strong>step 6 is where proxies are made</strong> (so what gets injected elsewhere is not the object your constructor built).<br>`
        },
        {
            content: `<h3>Seeing It Run</h3>
One class that implements every hook, so the order is not a claim but an output.<br>`,
            codeExamples: [
                `@Component
public class LifecycleDemo implements BeanNameAware, InitializingBean, DisposableBean {

    private final PaymentGateway gateway;

    public LifecycleDemo(PaymentGateway gateway) {
        this.gateway = gateway;
        System.out.println("1. constructor");
    }

    @Autowired
    public void setRepository(OrderRepository repo) {
        System.out.println("2. setter injection");
    }

    @Override
    public void setBeanName(String name) {
        System.out.println("3. BeanNameAware -> " + name);
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("5a. @PostConstruct");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("5b. InitializingBean");
    }

    @PreDestroy
    public void preDestroy() {
        System.out.println("8. @PreDestroy");
    }

    @Override
    public void destroy() {
        System.out.println("9. DisposableBean");
    }
}`,
                `// OUTPUT (startup):
// 1. constructor
// 2. setter injection
// 3. BeanNameAware -> lifecycleDemo
// 5a. @PostConstruct
// 5b. InitializingBean
//
// ... application runs ...
//
// OUTPUT (shutdown, on Ctrl+C or context.close()):
// 8. @PreDestroy
// 9. DisposableBean

// The three initialisation hooks always run in this order:
//     @PostConstruct  ->  afterPropertiesSet()  ->  initMethod
// and the three destruction hooks mirror it:
//     @PreDestroy     ->  destroy()             ->  destroyMethod
//
// You would never use all three. The point of knowing the order is
// reading code that inherits one from a base class and adds another.`
            ]
        },
        {
            content: `<h3>Which Initialisation Hook to Use</h3>

<table>
<tr><th>Hook</th><th>Verdict</th></tr>
<tr><td><code>@PostConstruct</code></td><td><strong>Use this.</strong> A plain annotation - the class stays a POJO with no Spring import, and the method can be private. On Spring Boot 3 it is <code>jakarta.annotation.PostConstruct</code>; on Boot 2 it is <code>javax.annotation.PostConstruct</code>.</td></tr>
<tr><td><code>InitializingBean</code></td><td>Avoid. It forces your class to implement a Spring interface, which is the coupling the framework exists to prevent. Common in older code.</td></tr>
<tr><td><code>@Bean(initMethod = "...")</code></td><td>For third-party classes you cannot annotate. The equivalent of <code>@PostConstruct</code> when you do not own the source.</td></tr>
</table>
<br>
<strong>What belongs in <code>@PostConstruct</code>:</strong> validation of injected configuration, building derived state from several dependencies, warming a cache, registering with something external. It is the first point at which every dependency is guaranteed to be set.<br><br>

<strong>What does not:</strong> anything slow or unreliable. A <code>@PostConstruct</code> that calls a remote service means the application will not start when that service is down - and a startup failure is far harder to diagnose than a failed request. Use <code>ApplicationRunner</code> for work that should happen after the application is up.<br>`,
            codeExamples: [
                `@Service
public class OrderService {

    private final ShopProperties props;
    private final List<Validator> validators;
    private Map<String, Validator> byType;

    public OrderService(ShopProperties props, List<Validator> validators) {
        this.props = props;
        this.validators = validators;
        // byType cannot be built here if it needed a @Value or a setter
        // dependency - not everything is guaranteed to be set yet.
    }

    @PostConstruct
    void init() {
        if (props.retryLimit() < 1) {
            throw new IllegalStateException(
                "shop.retry-limit must be >= 1, was " + props.retryLimit());
        }
        this.byType = validators.stream()
            .collect(toMap(Validator::type, identity()));
    }
}

// The exception in @PostConstruct is deliberate: a misconfigured
// application should fail at startup, not on the first request.
//
// OUTPUT with shop.retry-limit=0:
// APPLICATION FAILED TO START
// ... IllegalStateException: shop.retry-limit must be >= 1, was 0`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Step 6 Is Where <code>@Transactional</code> Comes From</h3>
This is the single most useful thing in the lifecycle, because it explains a family of bugs that otherwise look like magic failing at random.<br><br>

A <code>BeanPostProcessor</code> runs around initialisation and may return a <em>different object</em> than the one it was given. That is how proxies are made: <code>AbstractAutoProxyCreator</code> takes your bean at step 6 and returns a proxy wrapping it. Everything downstream - every injection point, every <code>getBean()</code> - receives the proxy.<br>`,
            codeExamples: [
                `// What is actually in the container:
//
//    +------------------------+
//    |  proxy (CGLIB)         |   <-- this is what gets injected
//    |    begins transaction  |
//    |    +-----------------+ |
//    |    | your OrderService | |   <-- 'this' inside your methods
//    |    +-----------------+ |
//    |    commits / rolls back |
//    +------------------------+

@Service
public class OrderService {

    @Transactional
    public void inner() { repository.save(...); }

    public void outer() {
        inner();          // 'this.inner()' - the RAW object, not the proxy
    }                     // NO TRANSACTION. Silent. No warning.
}

// Call outer() from a controller and the save is not transactional.
// Call inner() directly and it is. Same method, different behaviour,
// depending entirely on who called it.
//
// This is self-invocation, and it follows directly from step 6: the
// proxy wraps the object, so a call that never leaves the object never
// passes through the proxy.`,
                `// Confirming it, rather than guessing:

@Service
public class OrderService {

    @PostConstruct
    void whoAmI() {
        System.out.println("at init:  " + this.getClass().getName());
    }
}

@Component
class Check implements CommandLineRunner {
    private final OrderService injected;
    Check(OrderService injected) { this.injected = injected; }

    public void run(String... args) {
        System.out.println("injected: " + injected.getClass().getName());
    }
}

// OUTPUT:
// at init:  com.shop.OrderService
// injected: com.shop.OrderService$$SpringCGLIB$$0
//
// Two different objects. @PostConstruct ran on the raw one (step 5),
// before the proxy existed (step 6).
//
// The consequence: @Transactional inside a @PostConstruct method does
// nothing either - for exactly the same reason.`
            ]
        },
        {
            content: `<h3>Shutdown: What Runs, and What Does Not</h3>
Destruction callbacks are less reliable than initialisation ones, in three specific ways.<br><br>

<table>
<tr><th>Situation</th><th>Do destroy callbacks run?</th></tr>
<tr><td>Normal shutdown - <code>SIGTERM</code>, <code>context.close()</code>, JVM exit</td><td>Yes. Spring Boot registers a shutdown hook automatically.</td></tr>
<tr><td><code>kill -9</code>, power loss, OOM kill</td><td>No. Nothing runs. Never depend on <code>@PreDestroy</code> for correctness - it is for tidiness, not for data integrity.</td></tr>
<tr><td><strong>Prototype-scoped beans</strong></td><td><strong>No.</strong> Spring does not track prototype instances after handing them out, so their destroy callbacks are never called at all - even on a clean shutdown.</td></tr>
</table>
<br>
That prototype rule is a classic interview question and a real leak: a prototype bean holding a file handle or a connection has no framework-managed way to release it. The caller must do it, or the bean should not be a prototype.<br>`,
            codeExamples: [
                `// Graceful shutdown - the setting that makes @PreDestroy useful.
//
// application.properties:
//     server.shutdown=graceful
//     spring.lifecycle.timeout-per-shutdown-phase=30s
//
// On SIGTERM the server stops accepting new requests, waits up to 30s
// for in-flight ones to finish, and only then runs the destroy
// callbacks. Without it, the context closes while requests are still
// being served, and @PreDestroy tears down a connection pool that
// active threads are still using.
//
// This matters most in Kubernetes, which sends SIGTERM and then
// SIGKILL after terminationGracePeriodSeconds (default 30). Keep the
// Spring timeout below the Kubernetes one, or the pod is killed
// mid-shutdown.

@Component
public class ReportWriter {

    private final ExecutorService pool = Executors.newFixedThreadPool(4);

    @PreDestroy
    void shutdown() throws InterruptedException {
        pool.shutdown();                                  // no new tasks
        if (!pool.awaitTermination(10, TimeUnit.SECONDS)) {
            pool.shutdownNow();                           // give up waiting
        }
    }
}
// Without this, non-daemon pool threads keep the JVM alive after the
// context closes - the process that "will not stop".`
            ]
        },
        {
            content: `<h3><code>@PostConstruct</code> vs the Runners</h3>
Four hooks fire around startup and they are not interchangeable. The distinction is <em>how much of the application exists</em> when each one runs.<br><br>

<table>
<tr><th>Hook</th><th>Fires when</th><th>Use for</th></tr>
<tr><td><code>@PostConstruct</code></td><td>That one bean is initialised. Other beans may not exist yet. No proxy on itself yet.</td><td>Validating and preparing that bean's own state.</td></tr>
<tr><td><code>SmartInitializingSingleton</code></td><td>Every singleton is constructed - but the context is not refreshed.</td><td>Work needing all beans of a type, without needing the web server.</td></tr>
<tr><td><code>ContextRefreshedEvent</code></td><td>The context is fully refreshed. Fires again on a refresh.</td><td>Whole-context work. Guard against running twice.</td></tr>
<tr><td><code>ApplicationRunner</code> / <code>CommandLineRunner</code></td><td>Last. The application is fully started and the web server is accepting requests.</td><td>Seeding data, warm-up calls, one-off jobs, anything slow or remote.</td></tr>
</table>`,
            codeExamples: [
                `// The mistake this table prevents:

@Service
public class CatalogService {

    private final RestClient client;

    @PostConstruct
    void warmUp() {
        catalog = client.get().uri("/catalog").retrieve().body(Catalog.class);
    }
}

// The remote service is down. OUTPUT:
//
// APPLICATION FAILED TO START
// ... BeanCreationException: Invocation of init method failed
// ... ResourceAccessException: Connection refused
//
// The application will not start at all because a cache could not be
// warmed. In Kubernetes the pod crash-loops, and the outage of a
// non-critical dependency has become an outage of yours.


// The same work, after the application is up and serving:

@Component
public class CatalogWarmUp implements ApplicationRunner {

    private final CatalogService catalog;
    CatalogWarmUp(CatalogService catalog) { this.catalog = catalog; }

    @Override
    public void run(ApplicationArguments args) {
        try {
            catalog.refresh();
        } catch (Exception e) {
            log.warn("Catalog warm-up failed; serving cold", e);
        }
    }
}
// Health checks pass, requests are served, and the failure is a log
// line instead of a dead pod.
//
// Rule of thumb: @PostConstruct for state you own and can compute
// locally; a runner for anything that touches the network.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Walk through the bean lifecycle.</td><td>Instantiate, populate properties, <code>Aware</code> callbacks, <code>BeanPostProcessor</code> before, initialisation (<code>@PostConstruct</code> → <code>afterPropertiesSet</code> → init-method), <code>BeanPostProcessor</code> after, ready. On shutdown: <code>@PreDestroy</code> → <code>destroy()</code> → destroy-method.</td></tr>
<tr><td>Order of the three init callbacks?</td><td><code>@PostConstruct</code>, then <code>InitializingBean.afterPropertiesSet()</code>, then <code>@Bean(initMethod)</code>.</td></tr>
<tr><td>Why prefer <code>@PostConstruct</code> over <code>InitializingBean</code>?</td><td>It keeps the class a POJO with no Spring interface, and the method can be private.</td></tr>
<tr><td>Why is an injected field null in the constructor?</td><td>Field and setter injection happen at step 2, after the constructor has returned. Only constructor-injected dependencies are available at step 1.</td></tr>
<tr><td>Where are proxies created?</td><td>In <code>postProcessAfterInitialization</code> - step 6, after <code>@PostConstruct</code>. This is why <code>@Transactional</code> does nothing inside <code>@PostConstruct</code> and nothing on a self-invoked method.</td></tr>
<tr><td>What is a <code>BeanPostProcessor</code>?</td><td>An extension point running around every bean's initialisation, allowed to return a replacement object. AOP, <code>@Autowired</code> and <code>@PostConstruct</code> processing are all implemented as ones.</td></tr>
<tr><td>Do destroy callbacks run for prototype beans?</td><td>No. Spring stops tracking a prototype once it hands it out, so cleanup is the caller's responsibility.</td></tr>
<tr><td>When do destroy callbacks not run at all?</td><td>On <code>kill -9</code>, an OOM kill, or a JVM crash. Never rely on <code>@PreDestroy</code> for data integrity.</td></tr>
<tr><td><code>@PostConstruct</code> vs <code>CommandLineRunner</code>?</td><td><code>@PostConstruct</code> runs when that bean is initialised; a runner runs after the whole application has started. Remote or slow work belongs in the runner, so a failure does not prevent startup.</td></tr>
<tr><td>Which package on Boot 3?</td><td><code>jakarta.annotation.PostConstruct</code>. It was <code>javax.annotation</code> on Boot 2.</td></tr>
</table>`
        }
    ]
};
