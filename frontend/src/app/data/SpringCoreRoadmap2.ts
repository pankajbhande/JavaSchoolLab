// Spring Core roadmap, part 2: sections 6-10 (container, bean lifecycle, SpEL, events, AOP).
// Examples use Spring Framework 6 / Spring Boot 3 and Java 21. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const sc = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('sc', n, title, priority, topics);

export const springCoreRoadmap2: SubTopic[] = [
  sc(6, 'Spring Container', 'Essential', [
    topic(
      'sc-container-implementations-refresh',
      'Container Implementations, the refresh() Process and Startup Sequence',
      [
        blk(`<h3>Container implementations</h3>
• The container is a family of classes: <code>DefaultListableBeanFactory</code> is the real engine (bean definition registry + singleton registry + autowiring); every <code>ApplicationContext</code> <b>delegates</b> to one. <code>AbstractApplicationContext</code> implements the template method <code>refresh()</code>.<br>
• <b>Common contexts</b>: <code>AnnotationConfigApplicationContext</code> (Java config, plain apps and tests), <code>ClassPathXmlApplicationContext</code>/<code>FileSystemXmlApplicationContext</code> (XML), <code>GenericApplicationContext</code> (programmatic, used by Boot and native/AOT), <code>AnnotationConfigServletWebServerApplicationContext</code> and <code>AnnotationConfigReactiveWebServerApplicationContext</code> (Boot web apps with embedded server).<br>
• A context is <b>refreshable</b> (<code>refresh()</code> can be called again on XML/Annotation contexts that support it) or <b>generic</b> (refresh exactly once).`,
          `// Create, use and close a context explicitly
try (var ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
    System.out.println(ctx.getBeanFactory().getClass().getSimpleName());           // DefaultListableBeanFactory
    System.out.println(ctx.isActive() + " " + ctx.isRunning());
}

// Equivalent in steps
var ctx = new AnnotationConfigApplicationContext();
ctx.register(AppConfig.class);
ctx.refresh();                                          // build the container now
ctx.start();                                            // optional: start Lifecycle beans
ctx.stop(); ctx.close();`,
        ),
      ],
      [
        blk(`<h3>What refresh() does, step by step</h3>
<table ${TABLE}>
<tr><th>#</th><th>Step</th><th>Detail</th></tr>
<tr><td>1</td><td><code>prepareRefresh</code></td><td>Mark active, init property sources, validate required properties</td></tr>
<tr><td>2</td><td><code>obtainFreshBeanFactory</code></td><td>Create the bean factory and <b>load bean definitions</b> (scan, @Bean, XML)</td></tr>
<tr><td>3</td><td><code>prepareBeanFactory</code></td><td>Class loader, SpEL resolver, <code>ApplicationContextAwareProcessor</code>, register <code>Environment</code>, resolvable dependencies (<code>BeanFactory</code>, <code>ApplicationContext</code>)</td></tr>
<tr><td>4</td><td><code>postProcessBeanFactory</code></td><td>Subclass hooks (web scopes)</td></tr>
<tr><td>5</td><td><code>invokeBeanFactoryPostProcessors</code></td><td>Run <code>BeanDefinitionRegistryPostProcessor</code>s (<code>ConfigurationClassPostProcessor</code> parses @Configuration, @ComponentScan, @Import) then <code>BeanFactoryPostProcessor</code>s (property placeholders)</td></tr>
<tr><td>6</td><td><code>registerBeanPostProcessors</code></td><td>Instantiate and register BPPs (<code>@Autowired</code>, <code>@PostConstruct</code>, AOP auto-proxy)</td></tr>
<tr><td>7</td><td><code>initMessageSource</code>, <code>initApplicationEventMulticaster</code></td><td>i18n and event infrastructure</td></tr>
<tr><td>8</td><td><code>onRefresh</code></td><td>Subclass hook (Boot creates the <b>embedded web server</b> here)</td></tr>
<tr><td>9</td><td><code>registerListeners</code></td><td>Register <code>ApplicationListener</code> beans</td></tr>
<tr><td>10</td><td><code>finishBeanFactoryInitialization</code></td><td><b>Instantiate all remaining non-lazy singletons</b></td></tr>
<tr><td>11</td><td><code>finishRefresh</code></td><td>Start <code>Lifecycle</code> beans, publish <code>ContextRefreshedEvent</code></td></tr>
</table>
• Read this table when debugging startup problems: a bean that needs a post-processor to be already registered but is created in step 5 gets <b>no proxy/no injection</b> ("not eligible for getting processed by all BeanPostProcessors" warning).`,
          `// Observe the process
@Component
class StartupLogger implements ApplicationListener<ContextRefreshedEvent> {
    public void onApplicationEvent(ContextRefreshedEvent e) { log.info("refresh finished: {} beans", e.getApplicationContext().getBeanDefinitionCount()); }
}
// logging.level.org.springframework.context.support=DEBUG  shows each refresh phase and bean creation`,
        ),
      ],
      [
        blk(`<h3>Startup sequence in Spring Boot</h3>
• <code>SpringApplication.run</code>: create listeners and <code>Environment</code> (EnvironmentPostProcessors, banner) → create the <code>ApplicationContext</code> → apply <code>ApplicationContextInitializer</code>s → load sources → <code>refresh()</code> (auto-configuration imported in step 5, web server started in step 8) → <code>afterRefresh</code> → <code>ApplicationStartedEvent</code> → run <code>ApplicationRunner</code>/<code>CommandLineRunner</code> → <code>ApplicationReadyEvent</code>. Failures publish <code>ApplicationFailedEvent</code> and <code>FailureAnalyzer</code>s print the friendly error report.<br>
• Measure startup with <code>ApplicationStartup</code> (<code>BufferingApplicationStartup</code> + Actuator <code>/actuator/startup</code>) to find slow beans.`,
          `public static void main(String[] args) {
    var app = new SpringApplication(Application.class);
    app.setApplicationStartup(new BufferingApplicationStartup(4096));      // record startup steps for /actuator/startup
    app.addInitializers(ctx -> ctx.getEnvironment().setDefaultProfiles("local"));
    app.addListeners((ApplicationListener<ApplicationReadyEvent>) e -> log.info("ready"));
    app.run(args);
}`,
        ),
      ],
      [
        ['What happens when an ApplicationContext starts?', 'refresh() loads bean definitions, runs BeanFactoryPostProcessors, registers BeanPostProcessors, initialises i18n/events, instantiates non-lazy singletons and finally starts Lifecycle beans and publishes ContextRefreshedEvent.'],
        ['What is DefaultListableBeanFactory?', 'The core implementation of the bean factory and registry that stores bean definitions and singletons and performs autowiring; application contexts delegate to it.'],
        ['When does Spring Boot start the embedded web server?', 'During refresh() in the onRefresh() step of a web application context, before the remaining singletons are finished, then the ready event is published after startup completes.'],
      ],
    ),
    topic(
      'sc-container-aware-factorybean-lookup',
      'Aware Interfaces, FactoryBean, Method Injection and Programmatic Bean Access',
      [
        blk(`<h3>Aware interfaces</h3>
• <b>Aware</b> callbacks give a bean access to container infrastructure: <code>BeanNameAware</code>, <code>BeanFactoryAware</code>, <code>BeanClassLoaderAware</code>, <code>ApplicationContextAware</code>, <code>EnvironmentAware</code>, <code>ResourceLoaderAware</code>, <code>ApplicationEventPublisherAware</code>, <code>MessageSourceAware</code>, <code>EmbeddedValueResolverAware</code>. They run after dependency injection and before <code>@PostConstruct</code> (<code>ApplicationContextAwareProcessor</code> handles most).<br>
• They couple code to Spring, so use them in <b>infrastructure/framework code</b>; in application beans inject the needed type directly (<code>Environment</code>, <code>ApplicationEventPublisher</code> and <code>ApplicationContext</code> are injectable via constructor).`,
          `@Component
class InfraAwareBean implements BeanNameAware, ApplicationContextAware, EnvironmentAware {
    private String name; private ApplicationContext ctx; private Environment env;
    public void setBeanName(String name) { this.name = name; }
    public void setApplicationContext(ApplicationContext ctx) { this.ctx = ctx; }
    public void setEnvironment(Environment env) { this.env = env; }
}

// Simpler: no Aware interface needed
@Component class Publisher { Publisher(ApplicationEventPublisher publisher, Environment env, ResourceLoader loader) { } }`,
        ),
      ],
      [
        blk(`<h3>FactoryBean</h3>
• <b><code>FactoryBean&lt;T&gt;</code></b> is a bean that <b>produces another object</b> (<code>getObject()</code>, <code>getObjectType()</code>, <code>isSingleton()</code>). The bean named <code>x</code> yields the <b>product</b>; <code>&amp;x</code> returns the factory itself. Used for complex construction (proxies: <code>ProxyFactoryBean</code>, <code>LocalContainerEntityManagerFactoryBean</code>, <code>JndiObjectFactoryBean</code>). Distinguish: <b>BeanFactory</b> = the container; <b>FactoryBean</b> = a bean that is a factory.`,
          `class HttpClientFactoryBean implements FactoryBean<HttpClient> {
    @Value("\${http.timeout:5s}") private Duration timeout;
    public HttpClient getObject()     { return HttpClient.newBuilder().connectTimeout(timeout).version(HttpClient.Version.HTTP_2).build(); }
    public Class<?> getObjectType()   { return HttpClient.class; }
    public boolean isSingleton()      { return true; }
}
@Configuration class C { @Bean HttpClientFactoryBean httpClient() { return new HttpClientFactoryBean(); } }

HttpClient client = ctx.getBean("httpClient", HttpClient.class);                 // the product
HttpClientFactoryBean factory = (HttpClientFactoryBean) ctx.getBean("&httpClient");   // the factory itself`,
        ),
      ],
      [
        blk(`<h3>Method injection (@Lookup) and programmatic access</h3>
• <b>Method injection</b> solves singleton → prototype: <code>@Lookup</code> on an abstract/overridable method makes Spring generate a CGLIB subclass that returns a fresh bean on each call (<code>lookup-method</code> in XML); <code>replaced-method</code> / <code>MethodReplacer</code> overrides arbitrary methods.<br>
• <b>Programmatic access</b>: <code>ctx.getBean(name | Class | name+Class)</code>, <code>getBeansOfType</code>, <code>getBeansWithAnnotation</code>, <code>getBeanNamesForType</code>, <code>ListableBeanFactory</code>, <code>BeanFactoryUtils</code>, <code>ObjectProvider</code>. Use only in infrastructure (plugins, dispatchers, tests), never as a replacement for injection.`,
          `@Component
abstract class ReportService {
    @Lookup protected abstract ReportBuilder newBuilder();                    // Spring implements this: a fresh prototype per call
    Report generate() { return newBuilder().build(); }
}

Map<String, PaymentProcessor> processors = ctx.getBeansOfType(PaymentProcessor.class);
Map<String, Object> controllers = ctx.getBeansWithAnnotation(RestController.class);
Optional<Cache> cache = ctx.getBeanProvider(Cache.class).stream().findFirst();`,
        ),
      ],
      [
        ['FactoryBean vs BeanFactory?', 'BeanFactory is the IoC container interface; FactoryBean is a special bean that acts as a factory for another object, so getBean("x") returns its product and getBean("&x") returns the factory.'],
        ['When would you implement ApplicationContextAware?', 'Rarely: in framework/infrastructure code needing dynamic bean lookup; application beans should receive their collaborators through injection.'],
        ['How do you get a new prototype each call inside a singleton?', 'Use ObjectProvider/Provider, a @Lookup method or a scoped proxy instead of injecting the prototype directly.'],
      ],
    ),
    topic(
      'sc-container-hierarchy-resolution-lifecycle',
      'Parent/Child Contexts, Dependency Resolution Internals, Bean Registry and Lifecycle Management',
      [
        blk(`<h3>Context hierarchy</h3>
• A context can have a <b>parent</b> (<code>setParent</code>). Lookups go <b>child → parent</b> (never parent → child): children see the parent's beans, and can override by name. Classic <b>Spring MVC</b>: a root context (services, repositories) with a child <code>DispatcherServlet</code> context (controllers, view resolvers). Spring Cloud bootstrap and Actuator management contexts use the same mechanism. Boot normally uses a single context; use hierarchies via <code>SpringApplicationBuilder.parent(...).child(...)</code>.`,
          `var parent = new AnnotationConfigApplicationContext(ServicesConfig.class);
var child  = new AnnotationConfigApplicationContext();
child.setParent(parent);
child.register(WebConfig.class);
child.refresh();
child.getBean(CourseService.class);                 // found in the parent
// parent.getBean(CourseController.class)           // fails: parents cannot see children

new SpringApplicationBuilder(RootConfig.class).child(WebConfig.class).run(args);`,
        ),
      ],
      [
        blk(`<h3>Dependency resolution internals and the bean registry</h3>
• <b>Creating a bean</b> (<code>AbstractAutowireCapableBeanFactory.doCreateBean</code>): <code>createBeanInstance</code> (constructor resolution + autowiring by <code>ConstructorResolver</code>), <code>populateBean</code> (property/field injection through <code>InstantiationAwareBeanPostProcessor</code>s), <code>initializeBean</code> (aware callbacks, BPP before/after, init methods). <b>Singletons</b> are cached in <code>singletonObjects</code> (three-level caches handle early references).<br>
• <b>Registry types</b>: <code>BeanDefinitionRegistry</code> (register/remove/lookup definitions), <code>SingletonBeanRegistry</code> (register existing singleton objects: <code>registerSingleton</code>), <code>AliasRegistry</code>. <code>DependencyDescriptor</code> describes an injection point (type, generics, annotations) and <code>ContextAnnotationAutowireCandidateResolver</code> decides candidates, handling <code>@Qualifier</code>, <code>@Lazy</code>.<br>
• <b><code>depends-on</code> (<code>@DependsOn</code>)</b> forces ordering when there is no direct dependency (a cache must initialise before a listener); destruction happens in reverse order.`,
          `@Component @DependsOn("schemaMigrator")                    // make sure migrations ran before this bean is created
class CatalogueWarmup { }

ConfigurableListableBeanFactory bf = ctx.getBeanFactory();
bf.registerSingleton("clock", Clock.systemUTC());               // register an existing object (not managed: no init/AOP)
BeanDefinition bd = bf.getBeanDefinition("courseService");
System.out.println(Arrays.toString(bd.getDependsOn()));
System.out.println(Arrays.toString(bf.getDependenciesForBean("courseService")));`,
        ),
      ],
      [
        blk(`<h3>Lifecycle management: Lifecycle and SmartLifecycle</h3>
• <b><code>Lifecycle</code></b> (<code>start()</code>, <code>stop()</code>, <code>isRunning()</code>) models beans with start/stop semantics (message listeners, schedulers, embedded servers). <code>context.start()</code>/<code>stop()</code> propagate to all <code>Lifecycle</code> beans. <b><code>SmartLifecycle</code></b> is started automatically at the end of refresh in <b>phase order</b> (lowest first at startup; highest first at shutdown), supports <code>isAutoStartup()</code> and an <b>asynchronous stop</b> with a callback: ideal for graceful shutdown (stop accepting work, drain queues).<br>
• <b>Graceful shutdown</b>: Boot registers a JVM shutdown hook; the web server stops accepting requests (<code>server.shutdown=graceful</code>), in-flight work finishes within <code>spring.lifecycle.timeout-per-shutdown-phase</code>, then beans are destroyed.`,
          `@Component
class QueueConsumer implements SmartLifecycle {
    private volatile boolean running;
    private Thread worker;
    public void start() { running = true; worker = Thread.ofVirtual().start(this::poll); }
    public void stop()  { running = false; worker.interrupt(); }
    public boolean isRunning() { return running; }
    public int getPhase() { return Integer.MAX_VALUE - 100; }          // start late, stop early (before DB pool closes)
    private void poll() { while (running) { /* take and process message */ } }
}`,
        ),
      ],
      [
        ['How does a child context find beans?', 'It looks in itself first and then in its parent contexts; parents cannot see child beans. This is how Spring MVC separates root (services) and servlet (controllers) contexts.'],
        ['What is SmartLifecycle used for?', 'Beans that should start automatically after the context is ready and stop in a defined phase order with optional async stop, e.g. message listeners or schedulers needing graceful shutdown.'],
        ['What does @DependsOn do?', 'It forces other named beans to be created first (and destroyed last) even when there is no direct dependency between the classes.'],
      ],
    ),
  ]),

  sc(7, 'Bean Lifecycle', 'Essential', [
    topic(
      'sc-lifecycle-full-order',
      'The Complete Bean Lifecycle Order',
      [
        blk(`<h3>From definition to destruction</h3>
<table ${TABLE}>
<tr><th>#</th><th>Phase</th><th>Mechanism</th></tr>
<tr><td>1</td><td>Bean definition loaded</td><td>Scanning, @Bean, XML</td></tr>
<tr><td>2</td><td><code>BeanFactoryPostProcessor</code> modifies definitions</td><td>Placeholders, overrides</td></tr>
<tr><td>3</td><td>Instantiation</td><td>Constructor / factory method</td></tr>
<tr><td>4</td><td>Populate properties (dependency injection)</td><td>Autowiring, <code>@Value</code>, setters</td></tr>
<tr><td>5</td><td><code>BeanNameAware</code>, <code>BeanFactoryAware</code>, <code>ApplicationContextAware</code> ...</td><td>Aware callbacks</td></tr>
<tr><td>6</td><td><code>BeanPostProcessor.postProcessBeforeInitialization</code></td><td>Includes <code>@PostConstruct</code> (via a BPP)</td></tr>
<tr><td>7</td><td><code>@PostConstruct</code></td><td>Jakarta annotation</td></tr>
<tr><td>8</td><td><code>InitializingBean.afterPropertiesSet()</code></td><td>Spring interface</td></tr>
<tr><td>9</td><td>Custom <code>init-method</code></td><td><code>@Bean(initMethod)</code></td></tr>
<tr><td>10</td><td><code>BeanPostProcessor.postProcessAfterInitialization</code></td><td><b>AOP proxies created here</b></td></tr>
<tr><td>11</td><td>Bean ready for use</td><td>Singletons live until close</td></tr>
<tr><td>12</td><td><code>@PreDestroy</code></td><td>On context close</td></tr>
<tr><td>13</td><td><code>DisposableBean.destroy()</code></td><td>Spring interface</td></tr>
<tr><td>14</td><td>Custom <code>destroy-method</code></td><td>Inferred <code>close()</code>/<code>shutdown()</code> for @Bean</td></tr>
</table>`,
          `@Component
class LifecycleDemo implements BeanNameAware, ApplicationContextAware, InitializingBean, DisposableBean {
    LifecycleDemo() { log.info("3. constructor"); }
    @Autowired void setClock(Clock c) { log.info("4. dependency injected"); }
    public void setBeanName(String n) { log.info("5. BeanNameAware {}", n); }
    public void setApplicationContext(ApplicationContext c) { log.info("5. ApplicationContextAware"); }
    @PostConstruct void post() { log.info("7. @PostConstruct"); }
    public void afterPropertiesSet() { log.info("8. afterPropertiesSet"); }
    @PreDestroy void pre() { log.info("12. @PreDestroy"); }
    public void destroy() { log.info("13. DisposableBean.destroy"); }
}`,
        ),
      ],
      [
        blk(`<h3>Notes on the lifecycle</h3>
• Steps 6 and 10 run for <b>every</b> bean: that is the extension point of the container. Steps 12-14 run only for <b>singleton and custom-scoped</b> beans when the context closes; <b>prototype</b> beans are handed to the caller and forgotten.<br>
• If <code>InitializingBean</code>'s <code>afterPropertiesSet</code> and a custom init method name the <b>same method</b>, it runs once. <b>Constructor</b> exceptions or init failures abort startup with <code>BeanCreationException</code> showing the chain of beans being created.<br>
• <b>Lazy</b> singletons follow the same steps on first use; <b>scoped</b> beans per scope instance.`,
          `// Quick way to log the order of every bean
@Component
class LoggingBpp implements BeanPostProcessor {
    public Object postProcessBeforeInitialization(Object bean, String name) { log.info("before init {}", name); return bean; }
    public Object postProcessAfterInitialization(Object bean, String name)  { log.info("after init {}", name); return bean; }
}`,
        ),
      ],
      [
        blk(`<h3>Lifecycle in practice: what to put where</h3>
• <b>Constructor</b>: assign injected fields only (no I/O, no calls to injected beans that may be proxies not yet ready). <b><code>@PostConstruct</code></b>: validate configuration, open resources, pre-compute lookup tables. <b>BeanPostProcessor</b>: framework-style cross-cutting logic for <i>all</i> beans. <b><code>SmartLifecycle</code></b>: start background work after the context is ready. <b><code>ApplicationReadyEvent</code></b>: tasks needing a fully started application. <b><code>@PreDestroy</code></b>: release resources quickly (the JVM may be about to exit; use a timeout).`,
          `@Component
class ReferenceDataCache {
    private final ReferenceRepository repo;
    private volatile Map<String, Country> countries = Map.of();
    ReferenceDataCache(ReferenceRepository repo) { this.repo = repo; }                  // constructor: only assign

    @PostConstruct void load() { countries = repo.findAll().stream().collect(Collectors.toUnmodifiableMap(Country::code, c -> c)); }
    @PreDestroy void clear()   { countries = Map.of(); }
    Optional<Country> byCode(String code) { return Optional.ofNullable(countries.get(code)); }
}`,
        ),
      ],
      [
        ['Explain the Spring bean lifecycle.', 'Definitions are loaded and post-processed, the bean is instantiated, dependencies are injected, Aware callbacks run, BeanPostProcessor before-init, @PostConstruct, afterPropertiesSet, custom init, BeanPostProcessor after-init (proxies), the bean is used, then on close @PreDestroy, destroy() and custom destroy methods.'],
        ['At which step are AOP proxies created?', 'In postProcessAfterInitialization by an auto-proxy creator BeanPostProcessor, so the object in the container (and injected elsewhere) is the proxy.'],
        ['Which beans get destroy callbacks?', 'Singletons and custom-scoped beans managed by the container; prototype beans do not.'],
      ],
    ),
    topic(
      'sc-bean-post-processors',
      'BeanPostProcessor, BeanFactoryPostProcessor and BeanDefinitionRegistryPostProcessor',
      [
        blk(`<h3>BeanPostProcessor (BPP)</h3>
• <b><code>BeanPostProcessor</code></b> intercepts <b>bean instances</b> around initialisation: <code>postProcessBeforeInitialization</code> and <code>postProcessAfterInitialization</code> (may return a <b>replacement/wrapper</b>). Built-ins: <code>AutowiredAnnotationBeanPostProcessor</code> (@Autowired/@Value), <code>CommonAnnotationBeanPostProcessor</code> (@PostConstruct/@Resource), <code>ApplicationContextAwareProcessor</code>, <code>AnnotationAwareAspectJAutoProxyCreator</code> (AOP), <code>ScheduledAnnotationBeanPostProcessor</code> (@Scheduled), <code>AsyncAnnotationBeanPostProcessor</code>.<br>
• Sub-interfaces: <code>InstantiationAwareBeanPostProcessor</code> (before instantiation/property population), <code>SmartInstantiationAwareBeanPostProcessor</code> (early references, predict type), <code>MergedBeanDefinitionPostProcessor</code>, <code>DestructionAwareBeanPostProcessor</code>. Order with <code>PriorityOrdered</code>/<code>Ordered</code>.<br>
• <b>Declare BPP @Bean methods as <code>static</code></b> so the configuration class is not instantiated early; BPPs and the beans they depend on are created <b>before regular beans</b> so are not post-processed themselves ("not eligible for auto-proxying").`,
          `// A custom annotation processed by a BPP: @Timed logs execution time without AOP
@Retention(RUNTIME) @Target(METHOD) @interface Timed {}

@Component
class TimedBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        boolean hasTimed = Arrays.stream(bean.getClass().getDeclaredMethods()).anyMatch(m -> m.isAnnotationPresent(Timed.class));
        if (!hasTimed) return bean;
        ProxyFactory pf = new ProxyFactory(bean);
        pf.addAdvice((MethodInterceptor) inv -> {
            if (!inv.getMethod().isAnnotationPresent(Timed.class)) return inv.proceed();
            long t = System.nanoTime();
            try { return inv.proceed(); } finally { log.info("{} took {} ms", inv.getMethod().getName(), (System.nanoTime() - t) / 1_000_000); }
        });
        return pf.getProxy();                                                       // return a wrapper instead of the original
    }
}`,
        ),
      ],
      [
        blk(`<h3>BeanFactoryPostProcessor (BFPP)</h3>
• <b><code>BeanFactoryPostProcessor.postProcessBeanFactory(ConfigurableListableBeanFactory)</code></b> works on <b>bean definitions</b> (metadata) <b>before any bean is instantiated</b>: change property values, scope, lazy flag, register aliases. Built-ins: <code>PropertySourcesPlaceholderConfigurer</code> (resolves <code>\${...}</code>), <code>PropertyOverrideConfigurer</code>, <code>CustomScopeConfigurer</code>, <code>CustomEditorConfigurer</code>, <code>EventListenerMethodProcessor</code>.<br>
• <b><code>BeanDefinitionRegistryPostProcessor</code></b> (extends BFPP) runs <b>first</b> and can <b>add or remove bean definitions</b>: <code>ConfigurationClassPostProcessor</code> is one: it parses <code>@Configuration</code>, <code>@ComponentScan</code>, <code>@Import</code> and registers every @Bean.<br>
• Do not obtain beans in a BFPP (it forces early instantiation, skipping other post-processors).`,
          `@Component
class DefaultLazyBfpp implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory bf) {
        for (String name : bf.getBeanDefinitionNames()) {
            BeanDefinition bd = bf.getBeanDefinition(name);
            if (bd.getBeanClassName() != null && bd.getBeanClassName().contains(".reporting.")) bd.setLazyInit(true);       // metadata change before creation
        }
    }
}

class ExtraBeansRegistrar implements BeanDefinitionRegistryPostProcessor {
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        registry.registerBeanDefinition("auditClock", BeanDefinitionBuilder.genericBeanDefinition(Clock.class, Clock::systemUTC).getBeanDefinition());
    }
    public void postProcessBeanFactory(ConfigurableListableBeanFactory bf) { }
}
@Configuration class C { @Bean static BeanDefinitionRegistryPostProcessor extraBeans() { return new ExtraBeansRegistrar(); } }   // static!`,
        ),
      ],
      [
        blk(`<h3>BPP vs BFPP</h3>
<table ${TABLE}>
<tr><th></th><th>BeanFactoryPostProcessor</th><th>BeanPostProcessor</th></tr>
<tr><td>Operates on</td><td><b>Bean definitions</b> (metadata)</td><td><b>Bean instances</b></td></tr>
<tr><td>When</td><td>Before any regular bean is instantiated</td><td>For each bean around initialisation</td></tr>
<tr><td>Typical use</td><td>Placeholders, register definitions, change scope</td><td>Annotation processing, proxies, validation</td></tr>
<tr><td>Examples</td><td><code>ConfigurationClassPostProcessor</code>, <code>PropertySourcesPlaceholderConfigurer</code></td><td><code>AutowiredAnnotationBeanPostProcessor</code>, auto-proxy creator</td></tr>
<tr><td>Return value</td><td>void</td><td>The (possibly replaced) bean</td></tr>
</table>`),
      ],
      [
        ['BeanPostProcessor vs BeanFactoryPostProcessor?', 'BFPP modifies bean definitions before beans exist (e.g. resolves placeholders, registers definitions); BPP intercepts bean instances before/after initialisation and can wrap them (e.g. autowiring, AOP proxies).'],
        ['Why make BeanPostProcessor @Bean methods static?', 'Post-processors are created very early; a non-static method would force the enclosing configuration class to be instantiated too early, so it and its beans miss other post-processing.'],
        ['How do @Autowired and @PostConstruct work?', 'AutowiredAnnotationBeanPostProcessor and CommonAnnotationBeanPostProcessor are BPPs that inject dependencies and invoke @PostConstruct methods during bean creation.'],
      ],
    ),
    topic(
      'sc-lifecycle-callbacks-events-order',
      'Lifecycle Callbacks, Lifecycle Events, Ordering and Debugging Lifecycle Issues',
      [
        blk(`<h3>Context lifecycle events and graceful stop</h3>
• The context publishes: <code>ContextRefreshedEvent</code> (all singletons ready), <code>ContextStartedEvent</code>/<code>ContextStoppedEvent</code> (<code>start()</code>/<code>stop()</code>), <code>ContextClosedEvent</code> (closing). Boot adds <code>ApplicationStartingEvent</code>, <code>ApplicationEnvironmentPreparedEvent</code>, <code>ApplicationPreparedEvent</code>, <code>ApplicationStartedEvent</code>, <code>ApplicationReadyEvent</code> (ready for requests), <code>AvailabilityChangeEvent</code> (liveness/readiness), <code>ApplicationFailedEvent</code>.<br>
• Use <code>ApplicationReadyEvent</code> or an <code>ApplicationRunner</code> for startup work that needs the full app (data loading, warming, registering with service discovery), not <code>@PostConstruct</code>.`,
          `@Component
class StartupTasks {
    @EventListener(ApplicationReadyEvent.class) void ready()    { log.info("ready: warm caches, register with discovery"); }
    @EventListener(ContextClosedEvent.class)    void closing()  { log.info("closing: deregister"); }
    @EventListener void readiness(AvailabilityChangeEvent<ReadinessState> e) { log.info("readiness {}", e.getState()); }
}

@Component @Order(1) class SeedData implements ApplicationRunner { public void run(ApplicationArguments a) { /* insert reference data */ } }`,
        ),
      ],
      [
        blk(`<h3>Ordering of beans and callbacks</h3>
• <b>Creation order</b> follows dependencies; unrelated singletons are created in <b>definition registration order</b> (scanning order is not guaranteed: do not rely on it; use <code>@DependsOn</code>). <b>Ordering of collections</b> (<code>List&lt;X&gt;</code>) and of <b>post-processors/listeners/aspects</b> uses <code>@Order</code>, <code>Ordered</code>, <code>@Priority</code> (lower value = higher priority; <code>PriorityOrdered</code> beats <code>Ordered</code>). <code>@Order</code> on a bean does <b>not</b> control instantiation order, only position in injected lists and execution order of ordered contracts.`,
          `@Component @Order(10) class AuthFilter implements RequestFilter { }
@Component @Order(20) class AuditFilter implements RequestFilter { }
@Service class Chain { Chain(List<RequestFilter> filters) { /* sorted: Auth (10), Audit (20) */ } }

@Aspect @Order(Ordered.HIGHEST_PRECEDENCE) class SecurityAspect { }        // runs before lower-priority aspects
@Aspect @Order(Ordered.LOWEST_PRECEDENCE) class LoggingAspect { }`,
        ),
      ],
      [
        blk(`<h3>Debugging lifecycle issues</h3>
• <b>Symptoms and causes</b>: (1) <code>@Autowired</code> field is <code>null</code> → the object was created with <code>new</code> or the class is not a bean / not scanned; (2) <code>@Transactional</code> or <code>@Async</code> ignored → self-invocation, non-public method, final class/method, bean created too early by a BPP/BFPP ("not eligible for getting processed by all BeanPostProcessors"); (3) <code>@PostConstruct</code> not called → missing <code>jakarta.annotation</code> processing (not an ApplicationContext) or wrong signature; (4) <code>@PreDestroy</code> not called on a prototype or killed JVM; (5) <code>UnsatisfiedDependencyException</code> with long chain → read the <b>root cause</b> at the bottom.<br>
• <b>Tools</b>: <code>logging.level.org.springframework.beans.factory=DEBUG</code>, Actuator <code>/actuator/beans</code>, <code>/actuator/conditions</code>, <code>/actuator/startup</code>, IDE breakpoints in <code>AbstractAutowireCapableBeanFactory.doCreateBean</code>, <code>AopUtils.isAopProxy(bean)</code> and <code>bean.getClass()</code> to see whether you hold a proxy.`,
          `@Component
class Probe implements ApplicationRunner {
    private final CourseService service;
    Probe(CourseService service) { this.service = service; }
    public void run(ApplicationArguments args) {
        System.out.println(service.getClass());                                      // CourseService$$SpringCGLIB$$0  -> a proxy
        System.out.println(AopUtils.isAopProxy(service) + " " + AopUtils.isCglibProxy(service));
        System.out.println(AopUtils.getTargetClass(service));                       // the real class
    }
}`,
        ),
      ],
      [
        ['Which events does the application context publish?', 'ContextRefreshedEvent, ContextStartedEvent, ContextStoppedEvent and ContextClosedEvent; Spring Boot adds Application Starting/EnvironmentPrepared/Prepared/Started/Ready/Failed events.'],
        ['Does @Order control the order beans are created?', 'No. It orders items within injected collections and ordered contracts (aspects, filters, listeners); creation order follows dependencies and @DependsOn.'],
        ['Why is my @PostConstruct or @Transactional not working?', 'Usually the object is not a container-managed bean (created with new), is invoked through self-invocation bypassing the proxy, or the bean was created before the relevant post-processor existed.'],
      ],
    ),
  ]),

  sc(8, 'Spring Expression Language (SpEL)', 'Core', [
    topic(
      'sc-spel-basics-operators',
      'SpEL Basics: Expressions, Literals, Properties, Methods, Operators',
      [
        blk(`<h3>What is SpEL?</h3>
• <b>SpEL</b> is a powerful expression language that can <b>query and manipulate an object graph at runtime</b>, used in <code>@Value("#{...}")</code>, XML, <code>@ConditionalOnExpression</code>, <code>@Cacheable(condition=...)</code>, <code>@PreAuthorize</code>, Spring Data <code>@Query</code>, Spring Integration. The API: <code>ExpressionParser</code> (<code>SpelExpressionParser</code>), <code>Expression</code>, <code>EvaluationContext</code> (<code>StandardEvaluationContext</code> or the safer <code>SimpleEvaluationContext</code>). Expressions are written <code>#{...}</code> in annotations (placeholders use <code>\${...}</code>).`,
          `ExpressionParser parser = new SpelExpressionParser();
parser.parseExpression("'Hello ' + 'World'").getValue(String.class);              // Hello World
parser.parseExpression("100 * 1.5 + 10").getValue(Double.class);                    // 160.0
parser.parseExpression("'abc'.length()").getValue(Integer.class);                  // 3
parser.parseExpression("new java.util.Date().getTime() > 0").getValue(Boolean.class);
parser.parseExpression("T(java.lang.Math).max(3, 9)").getValue(Integer.class);      // static method via T(...)
parser.parseExpression("T(java.time.Year).now().value").getValue(Integer.class);`,
        ),
      ],
      [
        blk(`<h3>Property and method access, operators</h3>
• <b>Property navigation</b> uses getters: <code>user.address.city</code>; <b>safe navigation</b> <code>user?.address?.city</code> avoids NPE; <b>collection selection</b> <code>list.?[age &gt; 18]</code> (filter), <code>list.^[...]</code> first, <code>list.$[...]</code> last; <b>projection</b> <code>list.![name]</code> maps. <b>Operators</b>: arithmetic (<code>+ - * / % ^</code>), relational (<code>== != &lt; &gt; &lt;= &gt;= between instanceof matches</code> or textual <code>eq ne lt gt le ge</code>), logical (<code>and or not</code>), <b>ternary</b> <code>cond ? a : b</code>, <b>Elvis</b> <code>name ?: 'default'</code>, assignment, regex <code>matches</code>, inline lists <code>{1,2,3}</code> and maps <code>{name:'A', age:3}</code>, array construction, type operator <code>T()</code>, constructor <code>new ...()</code>, variables <code>#var</code>, <code>#this</code>, <code>#root</code>, bean reference <code>@beanName</code>.`,
          `record Address(String city) {}
record Student(String name, int age, Address address, List<String> skills) {}
var ctx = new StandardEvaluationContext(new Student("Asha", 21, new Address("Pune"), List.of("Java", "Spring")));

parser.parseExpression("name").getValue(ctx, String.class);                        // Asha
parser.parseExpression("address.city").getValue(ctx, String.class);                // Pune
parser.parseExpression("address?.city").getValue(ctx, String.class);
parser.parseExpression("age >= 18 and skills.size() > 1 ? 'eligible' : 'no'").getValue(ctx, String.class);
parser.parseExpression("skills[0]").getValue(ctx, String.class);                    // Java
parser.parseExpression("skills.![toUpperCase()]").getValue(ctx, List.class);        // [JAVA, SPRING]
parser.parseExpression("skills.?[length() > 4]").getValue(ctx, List.class);         // [Spring]
parser.parseExpression("name matches '[A-Z][a-z]+'").getValue(ctx, Boolean.class);`,
        ),
      ],
      [
        blk(`<h3>Variables, functions and context</h3>
• <code>EvaluationContext.setVariable("name", value)</code> → <code>#name</code>; <code>registerFunction("fn", Method)</code> → <code>#fn(...)</code>; <code>setRootObject</code>; <code>BeanResolver</code> enables <code>@beanName</code> references (done in the container). Use <b><code>SimpleEvaluationContext</code></b> (read-only data binding, no type references or constructors) when evaluating <b>untrusted</b> expressions: a full <code>StandardEvaluationContext</code> can call arbitrary methods (<code>T(Runtime).getRuntime().exec(...)</code>), a remote-code-execution risk (SpEL injection).<br>
• Expressions can be <b>compiled</b> for speed (<code>SpelCompilerMode.IMMEDIATE</code>).`,
          `var ctx = SimpleEvaluationContext.forReadOnlyDataBinding().build();           // safe for user-provided expressions
ctx.setVariable("limit", 5);                                                          // not available on SimpleEvaluationContext? use StandardEvaluationContext for variables
var std = new StandardEvaluationContext();
std.setVariable("limit", 5);
std.registerFunction("double", Utils.class.getDeclaredMethod("doubleIt", int.class));
parser.parseExpression("#double(#limit)").getValue(std, Integer.class);            // 10

// NEVER evaluate untrusted input with a StandardEvaluationContext:
// "T(java.lang.Runtime).getRuntime().exec('...')"  -> remote code execution`,
        ),
      ],
      [
        ['What is SpEL used for?', 'Runtime expression evaluation on object graphs: @Value("#{...}"), conditions in @Cacheable/@Conditional/@PreAuthorize, XML configuration and Spring Data queries.'],
        ['Difference between ${...} and #{...}?', '${...} is a property placeholder resolved from the Environment; #{...} is a SpEL expression evaluated against beans and objects; they can be combined: #{\'${list}\'.split(\',\')}.'],
        ['Why is SpEL a security concern?', 'With StandardEvaluationContext an expression can invoke arbitrary types and methods, so evaluating user input leads to remote code execution; use SimpleEvaluationContext or avoid evaluating untrusted input.'],
      ],
    ),
    topic(
      'sc-spel-usage-in-spring',
      'SpEL in @Value, Bean References, Conditions and Practical Usage',
      [
        blk(`<h3>SpEL in annotations and configuration</h3>
• In <code>@Value</code> you can reference <b>other beans</b> (<code>#{courseService.defaultLevel}</code>), <b>system properties/environment</b> (<code>#{systemProperties['user.home']}</code>, <code>#{systemEnvironment['HOME']}</code>), call static methods (<code>#{T(java.lang.Math).random() * 100}</code>), compute values and select collections. Combine with placeholders: <code>#{'\${app.tags}'.split(',')}</code> or <code>#{\${app.base} * 2}</code>.`,
          `@Component
class Defaults {
    @Value("#{systemProperties['user.home']}")                 String home;
    @Value("#{T(java.lang.Math).random() * 100}")              double random;
    @Value("#{courseService.defaultLevel ?: 'BEGINNER'}")      String level;                 // property of another bean + Elvis
    @Value("#{'\${app.tags:java,spring}'.split(',')}")          List<String> tags;
    @Value("#{\${app.base:10} * 2}")                             int doubled;
    @Value("#{catalogue.courses.?[published].size()}")          int publishedCount;          // filter a collection from a bean
    @Value("#{environment['spring.profiles.active']}")          String profile;
}`,
        ),
      ],
      [
        blk(`<h3>SpEL in conditions, caching, security and queries</h3>
• <code>@ConditionalOnExpression("\${feature.x:false} and '\${env}' == 'prod'")</code>; <code>@Cacheable(key = "#course.id", condition = "#course.published", unless = "#result == null")</code>; <code>@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")</code>; <code>@EventListener(condition = "#event.amount > 1000")</code>; <code>@Scheduled(cron = "#{@config.cron}")</code>; Spring Data JPA <code>@Query("select c from Course c where c.owner = ?#{principal.username}")</code>.<br>
• Method-argument names are exposed as <code>#name</code> (compile with <code>-parameters</code>) or <code>#p0</code>/<code>#a0</code>; the result as <code>#result</code> and the root <code>#root.methodName</code>/<code>#root.target</code>.`,
          `@Service
class CourseService {
    @Cacheable(cacheNames = "courses", key = "#id", condition = "#id != null", unless = "#result == null")
    Course find(UUID id) { ... }

    @PreAuthorize("hasRole('ADMIN') or #ownerId == authentication.name")
    void delete(UUID id, String ownerId) { ... }

    @EventListener(condition = "#event.amount > 1000")
    void bigPayment(PaymentEvent event) { ... }
}

@Bean @ConditionalOnExpression("\${feature.reports.enabled:false} and !'\${spring.profiles.active:}'.contains('test')")
ReportScheduler reportScheduler() { return new ReportScheduler(); }`,
        ),
      ],
      [
        blk(`<h3>Best practices and limitations</h3>
• Keep expressions <b>short and declarative</b>; they are strings, so errors appear only at runtime and refactoring tools do not track them. Move logic into a bean method and call it (<code>#{@pricing.discount(#root)}</code> or a real method). Prefer <code>@ConfigurationProperties</code> over many <code>@Value</code> SpEL expressions for structured configuration. Cache parsed <code>Expression</code> objects (they are thread-safe) if evaluating repeatedly. In native images SpEL needs reflection hints.`,
          `// Parse once, evaluate many times
private static final Expression DISCOUNT = new SpelExpressionParser().parseExpression("price * (1 - rate)");
double apply(Order o) { return DISCOUNT.getValue(new StandardEvaluationContext(o), Double.class); }

// Better: plain Java unless the expression must be configurable
double apply(Order o) { return o.price() * (1 - o.rate()); }`,
        ),
      ],
      [
        ['How can SpEL reference another bean?', 'Inside Spring-managed expressions with #{beanName.property} or @beanName in contexts with a BeanResolver (e.g. #{@pricing.rate()}).'],
        ['How do you use SpEL in @Cacheable?', 'With key, condition and unless attributes, referencing method arguments (#id), the result (#result) and root metadata, e.g. key="#course.id", unless="#result == null".'],
        ['When should you avoid SpEL?', 'For complex logic or untrusted input; use plain Java methods and @ConfigurationProperties for maintainability and safety.'],
      ],
    ),
  ]),

  sc(9, 'Spring Events', 'Core', [
    topic(
      'sc-events-basics',
      'Application Events: Publishing and Listening',
      [
        blk(`<h3>The event model</h3>
• Spring's <b>event mechanism</b> is an in-process <b>publish/subscribe</b> (Observer pattern) built on <code>ApplicationEventPublisher</code> and <code>ApplicationEventMulticaster</code>. Publishers do not know listeners: loose coupling between modules (order → notification, audit, search indexing). Events can be <b>any object</b> since Spring 4.2 (no need to extend <code>ApplicationEvent</code>); using <b>records</b> is idiomatic.<br>
• <b>Publish</b>: inject <code>ApplicationEventPublisher</code> and call <code>publishEvent(event)</code>. <b>Listen</b>: <code>@EventListener</code> method (parameter type selects the event; supports polymorphism and generics) or <code>ApplicationListener&lt;E&gt;</code>. By default delivery is <b>synchronous</b> in the publisher's thread and transaction: a listener exception propagates to the publisher.`,
          `record CourseEnrolled(UUID studentId, UUID courseId, Instant at) {}                    // plain record as an event

@Service
class EnrollmentService {
    private final ApplicationEventPublisher events;
    EnrollmentService(ApplicationEventPublisher events) { this.events = events; }
    @Transactional
    void enroll(UUID student, UUID course) {
        // ... save enrollment ...
        events.publishEvent(new CourseEnrolled(student, course, Instant.now()));                // publisher knows nothing about listeners
    }
}

@Component
class WelcomeEmailListener { @EventListener void on(CourseEnrolled e) { mail.send(e.studentId(), "Welcome to the course"); } }
@Component
class AnalyticsListener   { @EventListener void on(CourseEnrolled e) { analytics.track("enrolled", e.courseId()); } }`,
        ),
      ],
      [
        blk(`<h3>Listener features</h3>
• <b>Filtering</b> with SpEL <code>condition</code>; <b>ordering</b> with <code>@Order</code>; <b>generics</b>: <code>@EventListener</code> on <code>EntityCreated&lt;Course&gt;</code> works with <code>ResolvableTypeProvider</code>; <b>return value publishes a follow-up event</b> (a returned object or collection is published); <b>listening to several event types</b> with <code>@EventListener({A.class, B.class})</code> (no parameter or a common supertype); <code>SmartApplicationListener</code> for programmatic filtering.`,
          `@Component
class Listeners {
    @EventListener(condition = "#e.amount.compareTo(T(java.math.BigDecimal).valueOf(1000)) > 0")
    @Order(1)
    FraudCheckRequested onLargePayment(PaymentMade e) { return new FraudCheckRequested(e.id()); }       // the return value is published as a new event

    @EventListener({ContextRefreshedEvent.class, ContextStartedEvent.class})
    void onStart() { log.info("started"); }

    @EventListener void onFraud(FraudCheckRequested e) { ... }
}`,
        ),
      ],
      [
        blk(`<h3>Built-in events and the ApplicationEvent class</h3>
• Framework events: <code>ContextRefreshedEvent</code>, <code>ContextStartedEvent</code>, <code>ContextStoppedEvent</code>, <code>ContextClosedEvent</code>, <code>RequestHandledEvent</code> (web), Boot's <code>ApplicationReadyEvent</code> etc. Extending <code>ApplicationEvent</code> (with <code>source</code>, <code>timestamp</code>) is optional; use it when you want a source object or legacy compatibility.<br>
• <b>Class-based style</b>: <code>class OrderPlaced extends ApplicationEvent</code> + <code>implements ApplicationListener&lt;OrderPlaced&gt;</code>: verbose, but explicit.`,
          `class LegacyOrderPlaced extends ApplicationEvent {
    private final Order order;
    LegacyOrderPlaced(Object source, Order order) { super(source); this.order = order; }
    Order order() { return order; }
}
@Component class LegacyListener implements ApplicationListener<LegacyOrderPlaced> {
    public void onApplicationEvent(LegacyOrderPlaced e) { log.info("order {}", e.order().id()); }
}`,
        ),
      ],
      [
        ['How do Spring events work?', 'A publisher calls ApplicationEventPublisher.publishEvent; the multicaster delivers the event to all matching listeners (@EventListener or ApplicationListener), synchronously in the caller\'s thread by default.'],
        ['Does the event have to extend ApplicationEvent?', 'No. Since Spring 4.2 any object can be an event; it is wrapped in a PayloadApplicationEvent internally.'],
        ['What happens if a listener throws an exception?', 'With synchronous delivery the exception propagates to the publisher and can roll back its transaction; async listeners need their own error handling.'],
      ],
    ),
    topic(
      'sc-events-async-transactional-custom',
      'Async Events, Transactional Events, Custom Multicaster and Best Practices',
      [
        blk(`<h3>Asynchronous events</h3>
• Add <b><code>@Async</code></b> to a listener (with <code>@EnableAsync</code>) to run it on a <code>TaskExecutor</code>; or configure the multicaster with an executor to make <b>all</b> listeners async. Trade-offs: the publisher no longer waits, <b>exceptions are not propagated</b> (use <code>AsyncUncaughtExceptionHandler</code>), the listener runs <b>outside the publisher's transaction and security context</b>, and ordering is lost. Use a bounded <code>ThreadPoolTaskExecutor</code> (or virtual threads) so a burst of events cannot exhaust resources.`,
          `@Configuration @EnableAsync
class AsyncConfig {
    @Bean ThreadPoolTaskExecutor taskExecutor() {
        var ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(4); ex.setMaxPoolSize(16); ex.setQueueCapacity(500); ex.setThreadNamePrefix("events-");
        ex.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return ex;
    }
    @Bean AsyncUncaughtExceptionHandler asyncErrors() { return (ex, m, params) -> log.error("async listener {} failed", m.getName(), ex); }
}

@Component
class SearchIndexer {
    @Async @EventListener
    void index(CourseEnrolled e) { search.reindex(e.courseId()); }                     // does not block the enrolling request
}

// Alternative: make ALL listeners async (bean name must be "applicationEventMulticaster")
@Bean(name = "applicationEventMulticaster")
ApplicationEventMulticaster multicaster(TaskExecutor executor) { var m = new SimpleApplicationEventMulticaster(); m.setTaskExecutor(executor); return m; }`,
        ),
      ],
      [
        blk(`<h3>Transactional events (@TransactionalEventListener)</h3>
• Problem: a normal listener runs <b>inside</b> the publisher's transaction, so it can send an email for data that then <b>rolls back</b>, or read rows not yet committed from another thread. <b><code>@TransactionalEventListener(phase = ...)</code></b> binds delivery to a transaction phase: <code>AFTER_COMMIT</code> (default: only if it committed), <code>AFTER_ROLLBACK</code>, <code>AFTER_COMPLETION</code>, <code>BEFORE_COMMIT</code>. If no transaction is active the event is dropped unless <code>fallbackExecution = true</code>.<br>
• In <code>AFTER_COMMIT</code> the transaction is already over; if the listener needs to write to the database use <code>@Transactional(propagation = REQUIRES_NEW)</code>. For guaranteed delivery across crashes use the <b>transactional outbox</b> pattern or Spring Modulith's event publication registry instead of in-memory events.`,
          `@Component
class NotificationListener {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)                // only fires if the enrolment really committed
    void sendEmail(CourseEnrolled e) { mail.send(e.studentId(), "Enrolled"); }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_ROLLBACK)
    void rolledBack(CourseEnrolled e) { log.warn("enrolment rolled back for {}", e.studentId()); }

    @Async @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)                              // new tx to write audit rows after commit
    void audit(CourseEnrolled e) { auditRepo.save(new AuditRow(e)); }
}`,
        ),
      ],
      [
        blk(`<h3>Custom events and multicaster, best practices</h3>
• A custom <code>ApplicationEventMulticaster</code> bean (name <code>applicationEventMulticaster</code>) can add error handling (<code>setErrorHandler</code>), async execution or filtering. <b>Best practices</b>: events are <b>facts in the past tense</b> (<code>CourseEnrolled</code>), immutable and small (ids, not entities); use them to decouple <b>modules</b>, not as a general method-call replacement; avoid deep event chains (hard to debug); remember events are <b>in-process only</b> (use a broker for cross-service); do not rely on listener order; make listeners <b>idempotent</b>; test with <code>@RecordApplicationEvents</code>.`,
          `@Bean(name = "applicationEventMulticaster")
SimpleApplicationEventMulticaster multicaster() {
    var m = new SimpleApplicationEventMulticaster();
    m.setErrorHandler(t -> log.error("listener failed (swallowed)", t));              // one failing listener does not stop the others
    return m;
}

@SpringBootTest @RecordApplicationEvents
class EnrollmentEventsTest {
    @Autowired ApplicationEvents events;                                              // assert what was published
    @Test void publishesEnrolled() {
        service.enroll(student, course);
        assertThat(events.stream(CourseEnrolled.class)).hasSize(1);
    }
}`,
        ),
      ],
      [
        ['How do you make an event listener asynchronous?', 'Annotate the listener with @Async (and @EnableAsync) or give the application event multicaster a TaskExecutor; exceptions then do not reach the publisher and the transaction is not shared.'],
        ['What is @TransactionalEventListener?', 'A listener bound to a transaction phase (AFTER_COMMIT by default, also BEFORE_COMMIT, AFTER_ROLLBACK, AFTER_COMPLETION) so side effects such as emails happen only after the data is committed.'],
        ['Are Spring events suitable for communication between microservices?', 'No. They are in-process; use a message broker (Kafka, RabbitMQ) with an outbox for reliable cross-service events.'],
      ],
    ),
  ]),

  sc(10, 'AOP (Aspect-Oriented Programming)', 'Essential', [
    topic(
      'sc-aop-concepts',
      'AOP Concepts: Cross-Cutting Concerns, Aspect, Join Point, Pointcut, Advice, Weaving',
      [
        blk(`<h3>Why AOP?</h3>
• <b>Cross-cutting concerns</b> (logging, transactions, security, caching, metrics, retries, auditing) cut across many classes. Without AOP the code is <b>scattered</b> (same lines everywhere) and <b>tangled</b> (business logic mixed with infrastructure). AOP <b>modularises</b> them into <b>aspects</b> applied declaratively. Spring's own <code>@Transactional</code>, <code>@Cacheable</code>, <code>@Async</code>, <code>@Retryable</code>, <code>@PreAuthorize</code> are all AOP.<br>
• <b>OOP vs AOP</b>: OOP modularises by <i>class</i> (vertical); AOP modularises concerns that cross classes (horizontal).`,
          `// WITHOUT AOP: tangled and duplicated in every method
public void transfer(Money amt) {
    log.info("transfer start");
    securityCheck();
    Transaction tx = begin();
    try { /* business logic */ tx.commit(); }
    catch (Exception e) { tx.rollback(); throw e; }
    finally { log.info("transfer end"); }
}

// WITH AOP: business code only; the rest is applied by aspects/annotations
@Transactional @PreAuthorize("hasRole('TELLER')") @Logged
public void transfer(Money amt) { /* business logic */ }`,
        ),
      ],
      [
        blk(`<h3>AOP terminology</h3>
<table ${TABLE}>
<tr><th>Term</th><th>Meaning</th><th>Example</th></tr>
<tr><td><b>Aspect</b></td><td>A module that encapsulates a cross-cutting concern (pointcuts + advice)</td><td><code>@Aspect class LoggingAspect</code></td></tr>
<tr><td><b>Join point</b></td><td>A point in program execution where advice can apply; in Spring AOP always a <b>method execution</b></td><td>Calling <code>OrderService.place()</code></td></tr>
<tr><td><b>Pointcut</b></td><td>A predicate selecting join points</td><td><code>execution(* com.jsl.service.*.*(..))</code></td></tr>
<tr><td><b>Advice</b></td><td>Code to run at a join point (before, after, around ...)</td><td><code>@Before</code>, <code>@Around</code></td></tr>
<tr><td><b>Target object</b></td><td>The bean being advised</td><td><code>OrderService</code></td></tr>
<tr><td><b>Proxy</b></td><td>The object created by AOP wrapping the target</td><td>JDK/CGLIB proxy</td></tr>
<tr><td><b>Weaving</b></td><td>Linking aspects with targets: compile-time, load-time or <b>runtime (Spring proxies)</b></td><td>AspectJ vs Spring AOP</td></tr>
<tr><td><b>Introduction</b></td><td>Adding interfaces/members to a target</td><td><code>@DeclareParents</code></td></tr>
</table>`),
      ],
      [
        blk(`<h3>Spring AOP vs AspectJ</h3>
<table ${TABLE}>
<tr><th></th><th>Spring AOP</th><th>AspectJ</th></tr>
<tr><td>Weaving</td><td>Runtime, <b>proxy-based</b></td><td>Compile-time, post-compile or load-time bytecode weaving</td></tr>
<tr><td>Join points</td><td><b>Public method execution on Spring beans</b></td><td>Methods, constructors, field access, static init, any object</td></tr>
<tr><td>Self-invocation</td><td><b>Not advised</b> (call bypasses proxy)</td><td>Advised</td></tr>
<tr><td>Performance</td><td>Slight proxy overhead</td><td>Faster (no proxy)</td></tr>
<tr><td>Setup</td><td>Easy: <code>@EnableAspectJAutoProxy</code> (auto in Boot)</td><td>Needs weaver/agent or compiler plugin</td></tr>
<tr><td>Use</td><td>90% of enterprise needs</td><td>Advanced needs: advise non-bean objects, self-invocation, field access</td></tr>
</table>
• Spring AOP uses AspectJ's <b>annotations and pointcut language</b> but not its weaver (unless you enable it with <code>@EnableLoadTimeWeaving</code>/<code>mode=ASPECTJ</code> for <code>@Transactional</code>).`,
          `<!-- Boot: spring-boot-starter-aop -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-aop</artifactId></dependency>

@Configuration @EnableAspectJAutoProxy          // plain Spring (Boot auto-configures it)
class AopConfig {}`,
        ),
      ],
      [
        ['What is AOP?', 'A programming approach that modularises cross-cutting concerns such as logging, security and transactions into aspects applied to methods declaratively, so business code stays clean.'],
        ['Spring AOP vs AspectJ?', 'Spring AOP is runtime proxy-based and only advises public method executions of Spring beans; AspectJ weaves bytecode at compile/load time and supports all join points including constructors, fields and self-invocation.'],
        ['What is a join point in Spring AOP?', 'Always a method execution on a Spring-managed bean (proxy-based AOP does not support field or constructor join points).'],
      ],
    ),
    topic(
      'sc-aop-aspects-advice-pointcuts',
      'Writing Aspects: Advice Types, Pointcut Expressions, JoinPoint and Ordering',
      [
        blk(`<h3>Advice types</h3>
<table ${TABLE}>
<tr><th>Advice</th><th>Runs</th><th>Can change result?</th></tr>
<tr><td><code>@Before</code></td><td>Before the method; cannot stop it (except by throwing)</td><td>No</td></tr>
<tr><td><code>@AfterReturning</code></td><td>After normal return; access <code>returning</code> value</td><td>Inspect only</td></tr>
<tr><td><code>@AfterThrowing</code></td><td>After an exception; access <code>throwing</code></td><td>No (rethrown)</td></tr>
<tr><td><code>@After</code> (finally)</td><td>Always, after return or exception</td><td>No</td></tr>
<tr><td><code>@Around</code></td><td>Wraps the call; you decide whether to call <code>proceed()</code>, with what args, and what to return</td><td><b>Yes</b></td></tr>
</table>
• Order for one aspect around a normal call: <code>@Around</code> (before proceed) → <code>@Before</code> → method → <code>@AfterReturning</code>/<code>@AfterThrowing</code> → <code>@After</code> → <code>@Around</code> (after proceed). <b>Prefer the least powerful advice</b> that does the job (<code>@Around</code> is easy to misuse: forgetting <code>proceed()</code> skips the method, swallowing exceptions hides failures).`,
          `@Aspect
@Component
class AuditAspect {
    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    @Pointcut("execution(public * com.javaschoollab.service..*(..))")                // reusable named pointcut
    void serviceMethods() {}

    @Before("serviceMethods()")
    void before(JoinPoint jp) { log.info("-> {}.{}({})", jp.getTarget().getClass().getSimpleName(), jp.getSignature().getName(), Arrays.toString(jp.getArgs())); }

    @AfterReturning(pointcut = "serviceMethods()", returning = "result")
    void ok(JoinPoint jp, Object result) { log.info("<- {} returned {}", jp.getSignature().getName(), result); }

    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    void failed(JoinPoint jp, Exception ex) { log.warn("!! {} threw {}", jp.getSignature().getName(), ex.toString()); }

    @After("serviceMethods()")
    void always(JoinPoint jp) { log.debug("finally {}", jp.getSignature().toShortString()); }

    @Around("serviceMethods()")
    Object time(ProceedingJoinPoint pjp) throws Throwable {
        long t = System.nanoTime();
        try { return pjp.proceed(); }                                                // MUST call proceed() (and return its result)
        finally { log.info("{} took {} ms", pjp.getSignature().getName(), (System.nanoTime() - t) / 1_000_000); }
    }
}`,
        ),
      ],
      [
        blk(`<h3>Pointcut expressions</h3>
• <b>Designators</b>: <code>execution(modifiers? return declaring-type? name(params) throws?)</code> (the main one), <code>within(type pattern)</code>, <code>this</code> (proxy type) / <code>target</code> (target type), <code>args(...)</code> (argument types, binds arguments), <code>@annotation(Ann)</code> (method has annotation; binds it), <code>@within(Ann)</code> (class has annotation), <code>@target</code>, <code>@args</code>, <code>bean(name*)</code> (Spring-specific). Combine with <code>&amp;&amp;</code>, <code>||</code>, <code>!</code>.<br>
• Wildcards: <code>*</code> any single element, <code>..</code> any subpackages or any parameters, <code>+</code> subtypes.`,
          `execution(* com.jsl.service.*.*(..))                          // any method of any class in package service
execution(* com.jsl.service..*.*(..))                         // ...and subpackages
execution(public String com.jsl..*Service.find*(Long, ..))   // public, returns String, name starts with find, first arg Long
within(com.jsl.service..*)                                    // any method in types of that package
@within(org.springframework.stereotype.Service)               // any method of a @Service class
@annotation(com.jsl.Audited)                                  // methods annotated with @Audited
args(String, ..) && target(com.jsl.Repo+)                     // first arg String on Repo implementations
bean(*Service) && !bean(legacyService)                        // by bean name
execution(* *(..)) && @annotation(audited)                    // bind the annotation to a parameter

@Around("@annotation(audited)")
Object audit(ProceedingJoinPoint pjp, Audited audited) throws Throwable { log.info("action={}", audited.action()); return pjp.proceed(); }`,
        ),
      ],
      [
        blk(`<h3>JoinPoint API, argument binding, ordering and a real aspect</h3>
• <code>JoinPoint</code>: <code>getSignature()</code> (<code>MethodSignature</code> → method, return type, parameter names), <code>getArgs()</code>, <code>getTarget()</code>, <code>getThis()</code> (the proxy), <code>toShortString()</code>. <code>ProceedingJoinPoint</code> adds <code>proceed()</code> and <code>proceed(Object[] newArgs)</code>. <b>Ordering of aspects</b>: <code>@Order(n)</code> (lower = outermost/runs first before, last after) or <code>Ordered</code>; unordered aspects have no defined order. Put <b>security before transaction before logging</b> intentionally.`,
          `@Aspect @Component @Order(1)
class RetryAspect {
    @Around("@annotation(retry)")
    Object retry(ProceedingJoinPoint pjp, Retry retry) throws Throwable {
        Throwable last = null;
        for (int attempt = 1; attempt <= retry.times(); attempt++) {
            try { return pjp.proceed(); }
            catch (TransientDataAccessException e) { last = e; Thread.sleep(retry.delayMillis() * attempt); }
        }
        throw last;
    }
}
@Retention(RUNTIME) @Target(METHOD) @interface Retry { int times() default 3; long delayMillis() default 200; }

@Service class PaymentClient { @Retry(times = 5) PaymentResult charge(Card c, Money m) { ... } }

// Modify arguments
@Around("execution(* com.jsl.service.UserService.create(..)) && args(name, ..)")
Object normalise(ProceedingJoinPoint pjp, String name) throws Throwable { return pjp.proceed(new Object[]{ name.trim().toLowerCase() }); }`,
        ),
      ],
      [
        ['Explain the types of advice.', '@Before, @AfterReturning, @AfterThrowing, @After (finally) and @Around; around advice wraps the call, controls proceed(), arguments and return value, and is the most powerful but easiest to misuse.'],
        ['Difference between execution and within pointcuts?', 'execution matches method signatures (return type, name, params); within matches all join points inside types in a package or class.'],
        ['How do you order multiple aspects?', 'Use @Order or implement Ordered: lower values have higher precedence, running first on the way in and last on the way out.'],
      ],
    ),
    topic(
      'sc-aop-real-world-pitfalls',
      'Real-World AOP: Transactions, Logging, Caching, Security, Exception Handling and Pitfalls',
      [
        blk(`<h3>AOP in practice</h3>
• <b>Declarative transactions</b> (<code>TransactionInterceptor</code> via <code>@Transactional</code>), <b>caching</b> (<code>CacheInterceptor</code>), <b>security</b> (<code>MethodSecurityInterceptor</code>/<code>@PreAuthorize</code>), <b>async</b> (<code>AnnotationAsyncExecutionInterceptor</code>), <b>validation</b> (<code>@Validated</code> method validation), <b>metrics</b> (<code>@Timed</code>/<code>@Observed</code>), <b>retry</b> (Spring Retry), <b>audit</b>, <b>request logging with correlation id</b>, <b>exception translation</b> (repositories). For your own: logging, auditing, rate limiting, feature flags, tenant routing.`,
          `@Aspect @Component
class ControllerLoggingAspect {
    @Around("within(@org.springframework.web.bind.annotation.RestController *)")
    Object log(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        MDC.put("traceId", UUID.randomUUID().toString());
        try { return pjp.proceed(); }
        catch (Exception e) { log.error("{} failed: {}", pjp.getSignature().toShortString(), e.getMessage()); throw e; }          // rethrow: do not swallow
        finally { log.info("{} {} ms", pjp.getSignature().toShortString(), System.currentTimeMillis() - start); MDC.clear(); }
    }
}

@Aspect @Component
class ExceptionTranslationAspect {
    @AfterThrowing(pointcut = "within(com.jsl.integration..*)", throwing = "e")
    void translate(RestClientException e) { throw new CatalogueUnavailableException("catalogue down", e); }
}`,
        ),
      ],
      [
        blk(`<h3>Common AOP pitfalls</h3>
• <b>Self-invocation</b>: <code>this.method()</code> inside the same class bypasses the proxy, so the advice (and <code>@Transactional</code>/<code>@Async</code>/<code>@Cacheable</code>) is skipped. Fix: move the method to another bean, inject the proxy of yourself (<code>@Lazy</code> self), use <code>AopContext.currentProxy()</code> (<code>exposeProxy=true</code>), or AspectJ mode.<br>
• <b>Only public methods</b> (CGLIB can advise protected/package-private in some cases since 6.0, but do not rely on it); <b><code>final</code> classes/methods</b> cannot be CGLIB-proxied; <b>private</b> methods never advised; <b>non-bean objects</b> (<code>new</code>) never advised; <b>constructors/fields</b> not supported.<br>
• <b>Proxy type surprises</b>: injecting the concrete class when the bean is a JDK proxy fails (<code>BeanNotOfRequiredTypeException</code>); Boot defaults to CGLIB (<code>spring.aop.proxy-target-class=true</code>). <b>Performance</b>: broad pointcuts (<code>execution(* *(..))</code>) slow startup and calls. <b>Swallowing exceptions</b> in <code>@Around</code> changes behaviour and breaks rollbacks. <b>Aspect order</b> matters (retry outside transaction, not inside).`,
          `@Service
class CertificateService {
    @Transactional void issue(UUID id) { ... }
    void issueAll(List<UUID> ids) { for (var id : ids) issue(id); }      // BUG: self-invocation -> no transaction per issue()
}

// Fix: call through another bean (or inject the proxy)
@Service class CertificateBatch {
    private final CertificateService certificates;
    CertificateBatch(CertificateService certificates) { this.certificates = certificates; }
    void issueAll(List<UUID> ids) { ids.forEach(certificates::issue); }  // goes through the proxy: each issue() is transactional
}`,
        ),
      ],
      [
        blk(`<h3>Testing aspects and the AOP checklist</h3>
• Test an aspect with a small <code>AspectJProxyFactory</code> (unit) or <code>@SpringBootTest(classes = {AuditAspect.class, Target.class})</code> with <code>@EnableAspectJAutoProxy</code> (integration). <b>Checklist</b>: narrow pointcuts; named pointcuts for reuse; <code>@Around</code> only when needed; always rethrow exceptions; never do slow work in advice on hot paths; keep aspects <b>stateless</b>; document order; verify the bean is a proxy (<code>AopUtils</code>).`,
          `@Test
void aspectLogsAndProceeds() {
    CourseService target = new CourseService();
    var factory = new AspectJProxyFactory(target);
    factory.addAspect(new AuditAspect());
    CourseService proxy = factory.getProxy();
    assertThat(proxy.find(UUID.randomUUID())).isNotNull();                     // advice runs around the call
}`,
        ),
      ],
      [
        ['Why does @Transactional not work on a method called from within the same class?', 'Self-invocation calls the target directly, not the proxy, so the interceptor never runs; call through another bean or the proxy.'],
        ['What cannot Spring AOP advise?', 'Private/final methods, final classes (CGLIB), objects not managed by Spring, constructors and field access; use AspectJ for those.'],
        ['Name real Spring features built on AOP.', '@Transactional, @Cacheable, @Async, @PreAuthorize/@Secured, @Validated method validation, @Retryable, @Observed metrics and repository exception translation.'],
      ],
    ),
  ]),
];
