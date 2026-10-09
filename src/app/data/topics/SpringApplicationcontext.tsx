import { Topic } from '../coreJava';

export const springApplicationcontext: Topic = {
    id: 'sb-applicationcontext',
    name: "ApplicationContext",
    beginner: [
        {
            content: `<h3>The Container Itself</h3>
Everything so far - scanning, bean definitions, injection, scopes, lifecycle - happens inside one object. The <code>ApplicationContext</code> <em>is</em> the Spring container. When people say "Spring starts", they mean this object is being built.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   ApplicationContext
   +-------------------------------------------------------+
   |  bean definitions   the recipes, from scanning,        |
   |                     @Bean methods and XML              |
   |                                                        |
   |  singleton beans    the objects, built at startup      |
   |                                                        |
   |  Environment        profiles + property sources        |
   |  MessageSource      i18n lookups                       |
   |  event publisher    ApplicationEvent delivery          |
   |  resource loader    classpath: / file: / http: access  |
   +-------------------------------------------------------+</pre>
<br>
In Spring Boot you rarely name it - <code>SpringApplication.run()</code> creates it, and returns it.<br>`,
            codeExamples: [
                `@SpringBootApplication
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}

// run() returns the context. Occasionally useful in main():
public static void main(String[] args) {
    ConfigurableApplicationContext context =
        SpringApplication.run(ShopApplication.class, args);

    System.out.println(context.getBeanDefinitionCount() + " beans");
    System.out.println(Arrays.toString(context.getEnvironment()
                                              .getActiveProfiles()));
}
// OUTPUT:
// 214 beans
// [dev]`
            ]
        },
        {
            content: `<h3><code>BeanFactory</code> vs <code>ApplicationContext</code></h3>
<code>ApplicationContext</code> extends <code>BeanFactory</code>. The factory is the bare container; the context is the factory plus everything a real application needs around it.<br><br>

<table>
<tr><th></th><th><code>BeanFactory</code></th><th><code>ApplicationContext</code></th></tr>
<tr><td>Bean creation</td><td><strong>Lazy</strong> - on <code>getBean()</code></td><td><strong>Eager</strong> - singletons at startup</td></tr>
<tr><td>Annotation config</td><td>Manual setup</td><td>Built in</td></tr>
<tr><td><code>BeanPostProcessor</code>s</td><td>Registered by hand</td><td>Detected automatically</td></tr>
<tr><td>Events</td><td>No</td><td>Yes</td></tr>
<tr><td>i18n (<code>MessageSource</code>)</td><td>No</td><td>Yes</td></tr>
<tr><td><code>Environment</code> / profiles</td><td>No</td><td>Yes</td></tr>
</table>
<br>
The eager/lazy difference is the one that matters in practice. Eager creation means a <strong>wiring mistake fails at startup</strong> rather than on the first request that needs the bean - a missing bean, a circular dependency or a bad property is on screen in seconds instead of surfacing in production at 2am.<br><br>

You will never instantiate a <code>BeanFactory</code> yourself. It is worth knowing only because the distinction explains why <code>spring.main.lazy-initialization=true</code> is a worse trade than it looks: it buys startup time by giving up exactly that fail-fast property.<br>`
        },
        {
            content: `<h3>The Implementations</h3>
You choose one only outside Spring Boot; Boot picks based on the classpath.<br><br>

<table>
<tr><th>Class</th><th>Used for</th></tr>
<tr><td><code>AnnotationConfigApplicationContext</code></td><td>Plain Java config, no web layer. Batch jobs, CLI tools, tests.</td></tr>
<tr><td><code>ClassPathXmlApplicationContext</code></td><td>Legacy XML configuration.</td></tr>
<tr><td><code>AnnotationConfigServletWebServerApplicationContext</code></td><td>What Boot creates for a servlet web application.</td></tr>
<tr><td><code>AnnotationConfigReactiveWebServerApplicationContext</code></td><td>The WebFlux equivalent.</td></tr>
</table>`,
            codeExamples: [
                `// Without Boot - creating a context by hand.
public static void main(String[] args) {
    try (var context = new AnnotationConfigApplicationContext(AppConfig.class)) {
        OrderService service = context.getBean(OrderService.class);
        service.place(command);
    }   // close() runs @PreDestroy on the way out
}

// try-with-resources matters: ApplicationContext extends Closeable, and
// without close() the destroy callbacks never run and non-daemon
// threads keep the JVM alive.

// Boot registers a shutdown hook for you, which is why you never write
// this in a Boot application.`,
                `// Reading beans out of the context - and when it is legitimate.

context.getBean(OrderService.class);          // by type
context.getBean("orderService");              // by name (returns Object)
context.getBean("orderService", OrderService.class);   // both
context.getBeansOfType(Validator.class);      // Map<name, bean> - ALL of them
context.getBeanNamesForType(DataSource.class);// names only, nothing created

// In application code, calling getBean() is a smell - it is the
// Service Locator pattern, and the dependency should have been a
// constructor parameter.
//
// It is legitimate in exactly three places:
//   * main(), before the application is really running
//   * framework or infrastructure code deciding beans at runtime
//   * tests and diagnostics`
            ]
        },
        {
            content: `<h3>Two Things It Gives You Beyond Beans</h3>
<code>Environment</code> and events are used constantly, and both come from the context rather than from any bean you wrote.<br>`,
            codeExamples: [
                `// 1. Environment - profiles and properties.

@Service
public class ReportService {

    private final Environment env;
    public ReportService(Environment env) { this.env = env; }

    public void run() {
        String url = env.getProperty("app.report.url");
        int size   = env.getProperty("app.batch-size", Integer.class, 100);

        if (env.matchesProfiles("prod")) { ... }
    }
}

// Injecting Environment is fine for genuinely dynamic lookups. For
// fixed configuration prefer @Value, or better @ConfigurationProperties,
// which is typed and validated at startup rather than read as a String
// on every call.`,
                `// 2. Events - decoupling one bean from another.

public record OrderPlaced(Order order) { }

@Service
public class OrderService {

    private final ApplicationEventPublisher events;
    public OrderService(ApplicationEventPublisher events) { this.events = events; }

    @Transactional
    public Order place(Command c) {
        Order order = orders.save(Order.from(c));
        events.publishEvent(new OrderPlaced(order));
        return order;
    }
}

@Component
public class InvoiceListener {

    @TransactionalEventListener            // fires AFTER commit
    public void on(OrderPlaced event) {
        invoices.raise(event.order());
    }
}

// OrderService has no reference to InvoiceListener - adding a second
// listener requires no change to the publisher.
//
// Two cautions:
//   * @EventListener runs SYNCHRONOUSLY, on the publishing thread and
//     inside its transaction. It is decoupling, not async - add @Async
//     for that.
//   * Prefer @TransactionalEventListener when the work must not happen
//     if the transaction rolls back.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>What <code>refresh()</code> Does</h3>
Starting a context is one method - <code>AbstractApplicationContext.refresh()</code> - and its steps are the phases described across the previous topics, in order.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  refresh()
   1  prepareRefresh                 timestamp, validate required properties
   2  obtainFreshBeanFactory         create the BeanFactory
   3  prepareBeanFactory             register Environment, Aware processors
   4  postProcessBeanFactory         subclass hook (web contexts use it)

   5  invokeBeanFactoryPostProcessors
        ConfigurationClassPostProcessor runs HERE - scanning, @Bean
        methods, @Import, auto-configuration. All definitions exist
        after this step, and definitions may still be MODIFIED.

   6  registerBeanPostProcessors     collect BPPs - not yet applied

   7  initMessageSource              i18n
   8  initApplicationEventMulticaster
   9  onRefresh                      START THE WEB SERVER (Boot)
  10  registerListeners

  11  finishBeanFactoryInitialization
        instantiate every non-lazy singleton: constructor, inject,
        @PostConstruct, then BPPs wrap it in proxies

  12  finishRefresh                  publish ContextRefreshedEvent
                                     then ApplicationReadyEvent (Boot)</pre>
<br>
Two things worth carrying away. <strong>Step 5 is why <code>BeanFactoryPostProcessor</code> beans must be static <code>@Bean</code> methods</strong> - they run before ordinary beans can exist. And <strong>step 9 comes before step 11</strong>, so the web server binds its port before your singletons are built; a failure at step 11 still fails startup, but the port was briefly open.<br>`
        },
        {
            content: `<h3>The Startup Events, and Which to Use</h3>
Boot publishes several events around <code>refresh()</code>, and picking the wrong one is a common cause of "it ran too early".<br><br>

<table>
<tr><th>Event</th><th>When</th><th>Use for</th></tr>
<tr><td><code>ApplicationStartingEvent</code></td><td>Before anything. No context, no environment.</td><td>Logging system setup.</td></tr>
<tr><td><code>ApplicationEnvironmentPreparedEvent</code></td><td>Environment ready, context not created.</td><td>Adding property sources.</td></tr>
<tr><td><code>ContextRefreshedEvent</code></td><td>All beans built. <strong>Fires again on a refresh.</strong></td><td>Whole-context work - guard against running twice.</td></tr>
<tr><td><code>ApplicationReadyEvent</code></td><td>Last. Server accepting requests.</td><td>Warm-up, seeding, one-off jobs. <strong>The usual right answer.</strong></td></tr>
<tr><td><code>ApplicationFailedEvent</code></td><td>Startup threw.</td><td>Alerting on a failed boot.</td></tr>
</table>`,
            codeExamples: [
                `// The double-fire problem with ContextRefreshedEvent.

@Component
public class Seeder {

    @EventListener(ContextRefreshedEvent.class)
    public void seed() {
        repository.saveAll(defaultRows());     // may run twice
    }
}

// A parent/child context, an actuator restart or a @RefreshScope
// refresh all publish it again - and in Spring MVC applications with a
// separate root and servlet context, it fires once per context.
//
// Duplicate rows in production, none in a test that starts one context.

// Fixes, best first:

@Component
public class Seeder implements ApplicationRunner {          // fires once
    public void run(ApplicationArguments args) { ... }
}

// or listen for the Boot event that only fires once:
@EventListener(ApplicationReadyEvent.class)
public void seed() { ... }

// or, if you must use ContextRefreshedEvent, check the source:
@EventListener
public void onRefresh(ContextRefreshedEvent event) {
    if (event.getApplicationContext().getParent() != null) return;
    ...
}`
            ]
        },
        {
            content: `<h3>Getting Hold of the Context - and Why to Avoid It</h3>
Three ways, in decreasing order of acceptability.<br>`,
            codeExamples: [
                `// (a) Inject it. Legitimate in infrastructure code.
@Component
public class BeanInspector {
    private final ApplicationContext context;
    public BeanInspector(ApplicationContext context) { this.context = context; }
}

// (b) ApplicationContextAware - the older callback form. Same effect,
//     and it couples the class to a Spring interface, so prefer (a).
@Component
public class Legacy implements ApplicationContextAware {
    private ApplicationContext context;
    public void setApplicationContext(ApplicationContext ctx) { context = ctx; }
}

// (c) A static holder, so non-bean code can reach beans. This is the
//     one to push back on.
@Component
public class ContextHolder implements ApplicationContextAware {
    private static ApplicationContext CONTEXT;
    public void setApplicationContext(ApplicationContext ctx) { CONTEXT = ctx; }
    public static <T> T bean(Class<T> type) { return CONTEXT.getBean(type); }
}

// It works, and it is how legacy code reaches Spring beans from static
// methods or from objects Spring did not create. The costs:
//   * dependencies become invisible - nothing in a signature says what
//     a class needs
//   * failures move from startup to the moment the code path runs
//   * tests must populate the static field, and it leaks between tests
//   * CONTEXT is null in any unit test that does not start Spring
//
// Treat it as a bridge out of legacy code, never as a design.`,
                `// The version of this that is genuinely useful: choosing an
// implementation at runtime by name.

@Service
public class PaymentRouter {

    private final Map<String, PaymentGateway> gateways;   // by BEAN NAME

    public PaymentRouter(Map<String, PaymentGateway> gateways) {
        this.gateways = gateways;
    }

    public Receipt charge(String provider, Money amount) {
        PaymentGateway gateway = gateways.get(provider);
        if (gateway == null) throw new UnknownProviderException(provider);
        return gateway.charge(amount);
    }
}

// Same dynamic behaviour as context.getBean(name), but the dependency
// is declared, the map is injected once, and the class is unit
// testable with a plain HashMap. Prefer this whenever the runtime
// choice is among beans of one type.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the <code>ApplicationContext</code>?</td><td>The Spring IoC container - it holds bean definitions and singleton instances and provides the <code>Environment</code>, events, i18n and resource loading.</td></tr>
<tr><td><code>BeanFactory</code> vs <code>ApplicationContext</code>?</td><td><code>ApplicationContext</code> extends it and adds eager singleton creation, automatic post-processor detection, events, <code>MessageSource</code> and <code>Environment</code>.</td></tr>
<tr><td>Why does eager instantiation matter?</td><td>Wiring errors fail at startup rather than on the first request. That is the property <code>spring.main.lazy-initialization=true</code> gives away.</td></tr>
<tr><td>Name some implementations.</td><td><code>AnnotationConfigApplicationContext</code>, <code>ClassPathXmlApplicationContext</code>, and Boot's servlet and reactive web variants.</td></tr>
<tr><td>What happens during <code>refresh()</code>?</td><td>Prepare the bean factory, run <code>BeanFactoryPostProcessor</code>s (which perform scanning and read <code>@Bean</code> methods), register post-processors, start the web server, instantiate non-lazy singletons, publish <code>ContextRefreshedEvent</code>.</td></tr>
<tr><td>Why must <code>BeanFactoryPostProcessor</code> <code>@Bean</code> methods be static?</td><td>They run in an early refresh step, before the declaring configuration class can be fully initialised.</td></tr>
<tr><td>How do you publish an event?</td><td>Inject <code>ApplicationEventPublisher</code> and call <code>publishEvent</code>. Listeners use <code>@EventListener</code>, or <code>@TransactionalEventListener</code> to run after commit.</td></tr>
<tr><td>Are events asynchronous?</td><td>No - synchronous on the publishing thread by default. Add <code>@Async</code> if needed.</td></tr>
<tr><td><code>ContextRefreshedEvent</code> vs <code>ApplicationReadyEvent</code>?</td><td>The first can fire more than once and does not mean the server is up. <code>ApplicationReadyEvent</code> or <code>ApplicationRunner</code> fires once, after startup completes.</td></tr>
<tr><td>Why avoid injecting the context to call <code>getBean()</code>?</td><td>It is Service Locator - dependencies become invisible, failures move from startup to request time, and the class needs a container to test. Inject a <code>Map&lt;String, T&gt;</code> when the choice is genuinely dynamic.</td></tr>
</table>`
        }
    ]
};
