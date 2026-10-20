// Spring Core roadmap, part 3: sections 11-15 (proxies, resources and utilities, profiles and properties, validation, transactions).
// Examples use Spring Framework 6 / Spring Boot 3 and Java 21. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const sc = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('sc', n, title, priority, topics);

export const springCoreRoadmap3: SubTopic[] = [
  sc(11, 'Spring Proxies', 'Essential', [
    topic(
      'sc-proxy-jdk-cglib',
      'Proxy Pattern, JDK Dynamic Proxy vs CGLIB Proxy, and How Spring Chooses',
      [
        blk(`<h3>The proxy pattern in Spring</h3>
• A <b>proxy</b> is a stand-in object with the same type as the target that <b>intercepts calls</b>, adds behaviour (transaction, security, cache, async, lazy loading) and delegates to the real <b>target</b>. Spring creates proxies during bean post-processing (<code>postProcessAfterInitialization</code> of <code>AbstractAutoProxyCreator</code>) and puts the <b>proxy</b> in the container, so every injection point receives the proxy.<br>
• Two mechanisms: <b>JDK dynamic proxy</b> (<code>java.lang.reflect.Proxy</code>, implements the target's <b>interfaces</b>) and <b>CGLIB</b> (generates a <b>subclass</b> of the target class at runtime; Spring repackages it as <code>org.springframework.cglib</code> and since Spring 4 uses Objenesis so no default constructor is needed).`,
          `// JDK dynamic proxy by hand: what Spring does for interface-based beans
interface CourseService { Course find(UUID id); }
CourseService target = new CourseServiceImpl();
CourseService proxy = (CourseService) Proxy.newProxyInstance(
    CourseService.class.getClassLoader(),
    new Class<?>[]{ CourseService.class },
    (p, method, args) -> {
        long t = System.nanoTime();
        try { return method.invoke(target, args); }
        finally { System.out.println(method.getName() + " took " + (System.nanoTime() - t) + " ns"); }
    });
proxy.find(UUID.randomUUID());
System.out.println(proxy.getClass());              // jdk.proxy2.$Proxy5 : NOT CourseServiceImpl`,
        ),
      ],
      [
        blk(`<h3>JDK proxy vs CGLIB proxy</h3>
<table ${TABLE}>
<tr><th></th><th>JDK dynamic proxy</th><th>CGLIB proxy</th></tr>
<tr><td>Requires</td><td>The target implements <b>at least one interface</b></td><td>A non-final class (works without interfaces)</td></tr>
<tr><td>Mechanism</td><td><code>java.lang.reflect.Proxy</code> implementing interfaces</td><td>Generated <b>subclass</b> overriding methods</td></tr>
<tr><td>Proxy type</td><td>Only the interface types (cannot inject the concrete class)</td><td>Subclass of target: injectable by class or interface</td></tr>
<tr><td>Limitations</td><td>Only interface methods are advised</td><td><b>Final</b> classes/methods and <b>private</b> methods cannot be overridden</td></tr>
<tr><td>Constructor</td><td>Not involved</td><td>Target constructor not called for proxy (Objenesis); target is a separate instance</td></tr>
<tr><td>Performance</td><td>Reflection; fine in modern JVMs</td><td>Similar; faster dispatch historically</td></tr>
<tr><td>Spring Boot default</td><td colspan="2"><b>CGLIB</b> for AOP and <code>@Transactional</code> (<code>spring.aop.proxy-target-class=true</code>)</td></tr>
</table>
• <b>Decision in Spring</b>: if <code>proxyTargetClass=false</code> (plain Spring default) and the target implements an interface → JDK proxy; otherwise CGLIB. Boot, and <code>@EnableAspectJAutoProxy(proxyTargetClass = true)</code>, force CGLIB. Configuration classes are always CGLIB-enhanced.`,
          `@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)          // always CGLIB (Boot's default); false => JDK proxy when interfaces exist
class AopCfg {}

@Service class ReportService implements Reporter { ... }   // has an interface
@Service class AuditService { ... }                        // no interface

// With proxyTargetClass=false:  ReportService -> JDK proxy (inject Reporter ONLY), AuditService -> CGLIB
// With proxyTargetClass=true:   both -> CGLIB subclass (inject by class or interface)

@Autowired ReportService concrete;     // BeanNotOfRequiredTypeException if the bean is a JDK proxy
@Autowired Reporter byInterface;       // always works`,
        ),
      ],
      [
        blk(`<h3>Proxy utilities and how to see what you have</h3>
• <code>AopUtils.isAopProxy(o)</code>, <code>isJdkDynamicProxy</code>, <code>isCglibProxy</code>, <code>AopUtils.getTargetClass(o)</code>, <code>AopProxyUtils.ultimateTargetClass</code>, <code>((Advised) proxy).getTargetSource().getTarget()</code>. <code>ProxyFactory</code> builds proxies programmatically (<code>addAdvice</code>, <code>setProxyTargetClass</code>, <code>setTarget</code>). <code>ProxyFactoryBean</code> is the XML-era equivalent. In a CGLIB proxy the <b>class name</b> shows <code>$$SpringCGLIB$$</code>.`,
          `ProxyFactory pf = new ProxyFactory(new CourseServiceImpl());
pf.setProxyTargetClass(false);                                  // JDK proxy because an interface exists
pf.addAdvice((MethodInterceptor) inv -> { System.out.println("before " + inv.getMethod().getName()); return inv.proceed(); });
CourseService proxy = (CourseService) pf.getProxy();

System.out.println(AopUtils.isJdkDynamicProxy(proxy));          // true
System.out.println(AopUtils.getTargetClass(proxy));              // CourseServiceImpl
Object real = ((Advised) proxy).getTargetSource().getTarget();   // unwrap the proxy`,
        ),
      ],
      [
        ['JDK dynamic proxy vs CGLIB?', 'JDK proxies implement the target\'s interfaces via java.lang.reflect.Proxy; CGLIB generates a subclass of the target class so it works without interfaces but cannot override final classes or methods. Spring Boot uses CGLIB by default.'],
        ['Why does injecting the concrete class fail with a JDK proxy?', 'The proxy implements only the interfaces and is not an instance of the implementation class, so injection by the class type fails with BeanNotOfRequiredTypeException; inject the interface or use CGLIB.'],
        ['How does Spring decide the proxy type?', 'JDK proxy when the target implements an interface and proxyTargetClass is false; otherwise CGLIB; Boot sets proxyTargetClass=true by default.'],
      ],
    ),
    topic(
      'sc-proxy-limitations-selfinvocation-internals',
      'Proxy Limitations, Self-Invocation, Final Methods, Proxy Chaining and Debugging',
      [
        blk(`<h3>Why self-invocation bypasses the proxy</h3>
• The proxy wraps the target: <code>client → proxy → interceptors → target.method()</code>. Inside the target, <code>this</code> is the <b>raw target</b>, so <code>this.other()</code> calls the other method <b>directly</b>; no interceptor runs. This is the cause of "@Transactional / @Async / @Cacheable does nothing" bugs.<br>
• Solutions ranked: (1) restructure: move the advised method to <b>another bean</b>; (2) inject the proxy of yourself (<code>@Autowired @Lazy MyService self</code>); (3) <code>AopContext.currentProxy()</code> with <code>@EnableAspectJAutoProxy(exposeProxy = true)</code>; (4) AspectJ weaving (<code>mode = AdviceMode.ASPECTJ</code>); (5) <code>TransactionTemplate</code> for programmatic control.`,
          `@Service
class InvoiceService {
    @Lazy @Autowired private InvoiceService self;                              // proxy of this bean

    void processAll(List<Long> ids) { ids.forEach(id -> self.process(id)); }    // goes through the proxy -> transaction per invoice
    @Transactional(propagation = Propagation.REQUIRES_NEW) void process(Long id) { ... }
}

// Or programmatic
@Service class InvoiceBatch {
    private final TransactionTemplate tx;
    InvoiceBatch(PlatformTransactionManager tm) { this.tx = new TransactionTemplate(tm); tx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW); }
    void processAll(List<Long> ids) { ids.forEach(id -> tx.executeWithoutResult(s -> process(id))); }
}`,
        ),
      ],
      [
        blk(`<h3>Other proxy limitations</h3>
• <b>final class</b> → CGLIB cannot subclass (Spring fails at startup or skips). <b>final/private/static methods</b> → not intercepted (CGLIB can't override). <b>Package-private/protected</b>: supported by CGLIB when the proxy is in the same package/classloader; <code>@Transactional</code> on non-public methods works only for class-based proxies from Spring 6.0 but is bad practice. <b>Field access</b> on a CGLIB proxy reads the <b>proxy's</b> (uninitialised) fields, not the target's: always use getters. <b><code>equals</code>/<code>hashCode</code>/<code>toString</code></b> behave on the proxy; compare via the target if needed. <b>Constructor side effects</b> are not repeated for the proxy. <b>Kotlin</b> classes are final by default: use the <code>kotlin-spring</code> (all-open) plugin.<br>
• <b>Serialization</b> of proxies and <b>reflection</b> that inspects <code>getClass()</code> / annotations on the proxy class: use <code>AopUtils.getTargetClass</code> or <code>AnnotationUtils.findAnnotation</code>.`,
          `@Service
class Pricing {
    public final BigDecimal rate = BigDecimal.TEN;        // field on a CGLIB proxy is NOT initialised -> use a getter
    @Transactional public BigDecimal price() { ... }       // intercepted
    @Transactional public final void audit() { ... }       // final: silently NOT intercepted -> the real bug source
    @Transactional private void helper() { ... }           // private: never intercepted
}

// Kotlin: make Spring beans open automatically
// plugins { kotlin("plugin.spring") }`,
        ),
      ],
      [
        blk(`<h3>Proxy chaining, ordering and debugging</h3>
• A bean can be wrapped by <b>several advisors</b> in <b>one proxy</b> (Spring builds a single proxy with an advisor chain: transaction, security, cache, custom aspect, ordered by <code>@Order</code> / <code>Ordered</code>); it does not stack proxies. Typical practical order: <b>Retry → Security → Transaction → Cache → target</b> (retry must be outside the transaction; <code>@EnableTransactionManagement(order=...)</code>, <code>@EnableCaching(order=...)</code>, <code>@EnableRetry(order=...)</code>).<br>
• <b>Debug</b>: <code>logging.level.org.springframework.aop=DEBUG</code>, <code>Advised.getAdvisors()</code>, set a breakpoint in <code>CglibAopProxy.DynamicAdvisedInterceptor.intercept</code> / <code>JdkDynamicAopProxy.invoke</code>, look at the stack trace: it shows <code>ReflectiveMethodInvocation.proceed</code> frames for each interceptor, and use <code>-Dcglib.debugLocation</code> to dump generated classes.`,
          `Advised advised = (Advised) applicationContext.getBean(InvoiceService.class);
for (Advisor a : advised.getAdvisors()) System.out.println(a.getAdvice().getClass().getSimpleName());
// TransactionInterceptor, AnnotationAsyncExecutionInterceptor, MyAuditAdvice ...

@EnableTransactionManagement(order = Ordered.LOWEST_PRECEDENCE)       // transaction advice inside...
@EnableRetry(order = Ordered.LOWEST_PRECEDENCE - 10)                    // ...retry advice outside
class OrderingConfig {}`,
        ),
      ],
      [
        ['Why does this.method() not trigger advice?', 'Inside the target the reference is the raw object, not the proxy, so the call skips the interceptor chain; call through another bean, an injected self reference or AopContext.currentProxy().'],
        ['What happens when you put @Transactional on a final method?', 'CGLIB cannot override it, so the call is not intercepted and runs without a transaction (no error), a common silent bug; avoid final on proxied classes.'],
        ['Does Spring stack a proxy per aspect?', 'No: one proxy per bean with a chain of advisors ordered by precedence.'],
      ],
    ),
    topic(
      'sc-proxy-scoped-lazy-aot',
      'Scoped Proxies, Lazy Resolution Proxies, Transaction/Security Proxies and Proxies vs Native Images',
      [
        blk(`<h3>Other proxies the container creates</h3>
• <b>Scoped proxy</b> (<code>ScopedProxyMode.TARGET_CLASS</code>/<code>INTERFACES</code>): a singleton proxy that looks up the target from the current scope on every call (request/session beans). <b>Lazy-resolution proxy</b> (<code>@Lazy</code> injection point): resolves the real bean on first use. <b>Configuration class proxy</b> (CGLIB subclass for <code>@Bean</code> method interception). <b>Repository proxies</b> (Spring Data creates a JDK proxy implementing your interface backed by <code>SimpleJpaRepository</code>). <b>Feign/HTTP interface proxies</b>. <b>Transaction proxy</b> (<code>TransactionInterceptor</code>) and <b>security proxy</b> (<code>AuthorizationManagerBeforeMethodInterceptor</code>) are advisors in the AOP proxy.`,
          `@Component @RequestScope                                  // injects a scoped proxy into singletons
class CurrentUser { String name; }

@Service
class AuditService {
    private final CurrentUser user;                              // proxy: delegates to the instance of the CURRENT request
    AuditService(CurrentUser user) { this.user = user; }
    void log(String what) { System.out.println(user.name + " " + what); }
}

public interface CourseRepository extends JpaRepository<Course, UUID> { Optional<Course> findBySlug(String slug); }
// at runtime: jdk.proxy2.$Proxy87 implementing CourseRepository, intercepted by QueryExecutorMethodInterceptor`,
        ),
      ],
      [
        blk(`<h3>Proxies and Ahead-of-Time (native image) processing</h3>
• GraalVM native images cannot generate classes at runtime. Spring 6's <b>AOT engine</b> pre-computes bean definitions and <b>registers runtime hints</b>; CGLIB proxies for <code>@Configuration</code> are generated at build time, JDK proxy interface sets must be declared (<code>RuntimeHints.proxies().registerJdkProxy(...)</code>). Dynamic behaviour such as conditions on property values at runtime, <code>@Profile</code> changes, <code>ImportSelector</code> logic must be fixed at build time.<br>
• Practical advice: prefer <b>interfaces</b> and constructor injection, avoid reflection-heavy tricks, provide <code>RuntimeHintsRegistrar</code> for custom proxies/resources.`,
          `@Configuration
@ImportRuntimeHints(MyHints.class)
class NativeSupport {}
class MyHints implements RuntimeHintsRegistrar {
    public void registerHints(RuntimeHints hints, ClassLoader cl) {
        hints.proxies().registerJdkProxy(CourseGateway.class);
        hints.reflection().registerType(CourseDto.class, MemberCategory.INVOKE_PUBLIC_METHODS, MemberCategory.DECLARED_FIELDS);
        hints.resources().registerPattern("templates/*.html");
    }
}`,
        ),
      ],
      [
        blk(`<h3>Choosing a proxy strategy</h3>
• Prefer <b>constructor injection of interfaces</b> and let Boot use CGLIB; keep proxied classes <b>non-final with public methods</b>; do not store state in fields of proxied beans that other beans read directly; use <code>ObjectProvider</code> instead of scoped proxies when you want the lookup to be <b>explicit</b>; check with <code>AopUtils</code> if something is not intercepted; and remember proxies add a small cost per call, so keep very hot inner-loop methods outside advised beans.`,
          `@Service
class PricingEngine {                                  // hot path: keep it a plain object, not advised
    BigDecimal price(Order o) { return o.total(); }
}
@Service
class PricingFacade {                                  // advised boundary (transactions, caching, security)
    private final PricingEngine engine;
    PricingFacade(PricingEngine engine) { this.engine = engine; }
    @Transactional(readOnly = true) @Cacheable("prices") public BigDecimal quote(Order o) { return engine.price(o); }
}`,
        ),
      ],
      [
        ['What is a scoped proxy?', 'A singleton stand-in injected into longer-lived beans that resolves the actual target (request/session scoped instance) on every call.'],
        ['How do proxies affect GraalVM native images?', 'Classes cannot be generated at runtime, so Spring AOT pre-generates CGLIB proxies and you must register JDK proxy interfaces and reflection via runtime hints.'],
        ['How does Spring Data create a repository implementation?', 'At startup it creates a JDK dynamic proxy implementing your repository interface that delegates to a generic implementation (e.g. SimpleJpaRepository) and query interceptors.'],
      ],
    ),
  ]),

  sc(12, 'Spring Resources and Utilities', 'Core', [
    topic(
      'sc-resources-abstraction',
      'Resource Abstraction: Resource, ResourceLoader, ResourcePatternResolver and Resource Injection',
      [
        blk(`<h3>The Resource abstraction</h3>
• <code>org.springframework.core.io.Resource</code> abstracts access to files, classpath entries, URLs, servlet context paths, byte arrays and input streams: <code>exists()</code>, <code>isReadable()</code>, <code>getInputStream()</code>, <code>getFile()</code>, <code>getURL()</code>, <code>contentLength()</code>. Implementations: <code>ClassPathResource</code>, <code>FileSystemResource</code>, <code>UrlResource</code>, <code>ServletContextResource</code>, <code>ByteArrayResource</code>, <code>InputStreamResource</code>, <code>PathResource</code>.<br>
• <b>Location prefixes</b>: <code>classpath:</code>, <code>classpath*:</code> (all matching entries on the classpath, including jars), <code>file:</code>, <code>http:</code>/<code>https:</code>; no prefix → depends on the context.`,
          `Resource r1 = new ClassPathResource("templates/welcome.html");
Resource r2 = new FileSystemResource("/var/data/export.csv");
Resource r3 = new UrlResource("https://example.com/data.json");
try (InputStream in = r1.getInputStream()) { String html = new String(in.readAllBytes(), StandardCharsets.UTF_8); }
System.out.println(r1.exists() + " " + r1.getFilename());

// Reading a resource inside a jar: use getInputStream(), NOT getFile() (no file on disk)
String text = new String(new ClassPathResource("banner.txt").getInputStream().readAllBytes());
// or: StreamUtils.copyToString(r1.getInputStream(), StandardCharsets.UTF_8);  FileCopyUtils.copyToString(new InputStreamReader(...))`,
        ),
      ],
      [
        blk(`<h3>ResourceLoader and ResourcePatternResolver</h3>
• <b><code>ResourceLoader.getResource("classpath:...")</code></b>: every <code>ApplicationContext</code> is a <code>ResourceLoader</code>. <b><code>ResourcePatternResolver.getResources("classpath*:/config/*.xml")</code></b> supports Ant-style wildcards (<code>*</code>, <code>**</code>, <code>?</code>). <code>PathMatchingResourcePatternResolver</code> is the standard implementation. <b>Inject</b> resources directly with <code>@Value("classpath:data/courses.json") Resource courses</code> or <code>@Value("classpath*:schemas/*.json") Resource[] schemas</code>.<br>
• <b><code>ResourceLoaderAware</code></b> or constructor-injected <code>ResourceLoader</code> to load dynamically. Spring Boot's <code>spring.config.location</code> uses the same mechanism.`,
          `@Component
class SeedLoader {
    private final Resource seed; private final ResourcePatternResolver resolver; private final ObjectMapper mapper;
    SeedLoader(@Value("classpath:seed/courses.json") Resource seed, ResourcePatternResolver resolver, ObjectMapper mapper) {
        this.seed = seed; this.resolver = resolver; this.mapper = mapper;
    }
    List<Course> load() throws IOException { return mapper.readValue(seed.getInputStream(), new TypeReference<>() {}); }
    List<String> migrations() throws IOException {
        return Arrays.stream(resolver.getResources("classpath*:db/migration/V*.sql")).map(Resource::getFilename).sorted().toList();
    }
}`,
        ),
      ],
      [
        blk(`<h3>Resource best practices</h3>
• Never assume a resource is a <b>file</b> (it is inside a jar in production); use streams. Close streams (try-with-resources). Use <code>classpath*:</code> to gather resources from multiple jars. Use <code>Resource</code> parameters in your APIs instead of <code>String</code> paths so callers can pass any source. <b>Security</b>: never build resource locations from user input (path traversal: <code>../../etc/passwd</code>); validate and normalise (<code>StringUtils.cleanPath</code>, <code>Path.normalize()</code> and a base-directory check).`,
          `Resource safeResolve(Path baseDir, String userPath) {
    Path resolved = baseDir.resolve(StringUtils.cleanPath(userPath)).normalize();
    if (!resolved.startsWith(baseDir)) throw new IllegalArgumentException("outside base directory");      // block ../ traversal
    return new FileSystemResource(resolved);
}`,
        ),
      ],
      [
        ['What is the Spring Resource abstraction?', 'A uniform interface to read resources from classpath, files, URLs or streams, with ResourceLoader resolving location strings by prefix and ResourcePatternResolver supporting wildcards.'],
        ['classpath: vs classpath*:?', 'classpath: returns the first match on the classpath; classpath*: returns all matching resources from every classpath root (all jars).'],
        ['Why use getInputStream() rather than getFile()?', 'Resources inside a packaged jar are not files on disk, so getFile() fails; streams work everywhere.'],
      ],
    ),
    topic(
      'sc-messagesource-i18n-conversion',
      'i18n with MessageSource, Type Conversion, Formatting and Data Binding',
      [
        blk(`<h3>MessageSource (internationalisation)</h3>
• <code>MessageSource</code> resolves messages by code and <code>Locale</code>: <code>getMessage(code, args, defaultMessage, locale)</code>. <code>ResourceBundleMessageSource</code> / <code>ReloadableResourceBundleMessageSource</code> read <code>messages.properties</code>, <code>messages_hi.properties</code> ... with <code>{0}</code> placeholders (<code>MessageFormat</code>). Boot configures it from <code>spring.messages.basename=messages</code>. The <code>ApplicationContext</code> is itself a <code>MessageSource</code> (bean named <code>messageSource</code>). In MVC the <code>LocaleResolver</code> (<code>Accept-Language</code>, cookie, session) picks the locale.`,
          `# messages.properties / messages_hi.properties
greeting=Hello, {0}!
course.notfound=Course {0} was not found

@Bean MessageSource messageSource() {
    var ms = new ReloadableResourceBundleMessageSource();
    ms.setBasenames("classpath:messages");
    ms.setDefaultEncoding("UTF-8");
    ms.setCacheSeconds(60);
    ms.setFallbackToSystemLocale(false);
    return ms;
}
String text = messageSource.getMessage("greeting", new Object[]{"Asha"}, LocaleContextHolder.getLocale());       // "Hello, Asha!"
// Validation messages: @NotBlank(message = "{course.title.required}") resolved through the same source`,
        ),
      ],
      [
        blk(`<h3>Type conversion and formatting</h3>
• <b>ConversionService</b> (<code>core.convert</code>): the modern, thread-safe type conversion SPI: <code>Converter&lt;S,T&gt;</code>, <code>ConverterFactory</code>, <code>GenericConverter</code>; register in <code>DefaultConversionService</code>/<code>FormattingConversionService</code> (<code>WebMvcConfigurer.addFormatters</code>). Used for <code>@Value</code>, request parameters, <code>@ConfigurationProperties</code> (<code>"5s"</code> → <code>Duration</code>, <code>"10MB"</code> → <code>DataSize</code>). <b>Formatter&lt;T&gt;</b> (<code>format</code>/<code>parse</code> with locale) and <code>@DateTimeFormat</code>/<code>@NumberFormat</code>. Legacy <b>PropertyEditor</b> (<code>CustomEditorConfigurer</code>) is stateful and not thread-safe: avoid in new code.`,
          `class StringToCourseIdConverter implements Converter<String, CourseId> {
    public CourseId convert(String source) { return new CourseId(UUID.fromString(source.trim())); }
}
@Configuration class WebFormats implements WebMvcConfigurer {
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToCourseIdConverter());
        registry.addFormatter(new Formatter<Money>() {
            public Money parse(String text, Locale l) throws ParseException { return Money.parse(text, l); }
            public String print(Money m, Locale l) { return m.format(l); }
        });
    }
}
@GetMapping("/courses/{id}") Course get(@PathVariable CourseId id) { ... }          // String path variable converted automatically
@DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate;`,
        ),
      ],
      [
        blk(`<h3>Data binding</h3>
• <b><code>DataBinder</code></b> binds property values (a <code>Map</code>/request params) onto an object using <code>BeanWrapper</code> (nested paths <code>address.city</code>, indexed <code>items[0].name</code>), converts types and collects <b><code>BindingResult</code></b> errors; used by MVC form binding, <code>@ModelAttribute</code> and Boot's <code>Binder</code> for <code>@ConfigurationProperties</code>. Protect against <b>mass assignment</b>: restrict bindable fields (<code>setAllowedFields</code>, DTOs).`,
          `var form = new CourseForm();
var binder = new DataBinder(form, "courseForm");
binder.setAllowedFields("title", "level", "price");                                // whitelist (mass-assignment protection)
binder.setConversionService(DefaultConversionService.getSharedInstance());
binder.bind(new MutablePropertyValues(Map.of("title", "Spring Core", "price", "499.00", "role", "ADMIN")));     // "role" ignored
BindingResult result = binder.getBindingResult();
System.out.println(form.getTitle() + " " + form.getPrice() + " errors=" + result.getErrorCount());`,
        ),
      ],
      [
        ['How does Spring support internationalisation?', 'Through MessageSource (resource bundles with locale-specific property files) plus a LocaleResolver in web apps; messages are resolved by code with arguments for the current Locale.'],
        ['Converter vs Formatter vs PropertyEditor?', 'Converter is a general, thread-safe S→T conversion; Formatter adds locale-aware parse/print for text; PropertyEditor is the older stateful, non-thread-safe mechanism that should be avoided.'],
        ['What is mass assignment and how does binding mitigate it?', 'Attackers set fields you did not intend to expose; restrict bindable fields with DataBinder allowed fields or bind to dedicated DTOs.'],
      ],
    ),
    topic(
      'sc-utilities-task-scheduling-cache',
      'Spring Utilities, Task Execution and Scheduling, and Caching Abstraction',
      [
        blk(`<h3>Everyday utility classes</h3>
• <code>Assert</code> (<code>notNull</code>, <code>hasText</code>, <code>isTrue</code> with messages), <code>StringUtils</code> (<code>hasText</code>, <code>cleanPath</code>, <code>commaDelimitedListToSet</code>), <code>CollectionUtils</code>, <code>ObjectUtils</code>, <code>ClassUtils</code>, <code>ReflectionUtils</code>, <code>BeanUtils</code> (<code>copyProperties</code>, <code>instantiateClass</code>), <code>AnnotationUtils</code>/<code>AnnotatedElementUtils</code>, <code>StopWatch</code>, <code>FileCopyUtils</code>/<code>StreamUtils</code>, <code>UriComponentsBuilder</code>, <code>HtmlUtils.htmlEscape</code>, <code>Base64Utils</code> (use <code>java.util.Base64</code>), <code>DigestUtils</code>, <code>PropertiesLoaderUtils</code>. They are static helpers: prefer JDK equivalents when they exist.`,
          `Assert.hasText(title, "title must not be blank");
Assert.state(started, "service not started");
StopWatch sw = new StopWatch("import"); sw.start("parse"); parse(); sw.stop(); sw.start("save"); save(); sw.stop();
log.info(sw.prettyPrint());
BeanUtils.copyProperties(entity, dto);                                           // shallow copy by property name (prefer MapStruct for real mappings)
URI uri = UriComponentsBuilder.fromUriString("https://api.jsl.com").path("/courses/{id}").queryParam("lang", "en").build(42).toUri();
Method m = ReflectionUtils.findMethod(Course.class, "getTitle");`,
        ),
      ],
      [
        blk(`<h3>Task execution and scheduling</h3>
• <b><code>TaskExecutor</code></b> (<code>ThreadPoolTaskExecutor</code>, <code>SimpleAsyncTaskExecutor</code> with virtual threads: <code>spring.threads.virtual.enabled=true</code>), <b><code>@EnableAsync</code> + <code>@Async</code></b> (return <code>void</code>/<code>CompletableFuture</code>; needs the proxy: self-invocation caveat; define your own executor, the default unbounded <code>SimpleAsyncTaskExecutor</code> is risky), <b><code>@EnableScheduling</code> + <code>@Scheduled</code></b> (<code>fixedRate</code>, <code>fixedDelay</code>, <code>initialDelay</code>, <code>cron</code> with zone). Default scheduler has <b>one thread</b>: long jobs delay others: configure a <code>TaskScheduler</code> pool. In clusters every instance runs the job: use <b>ShedLock</b> or Quartz.`,
          `@Configuration @EnableAsync @EnableScheduling
class TaskConfig {
    @Bean ThreadPoolTaskScheduler taskScheduler() { var s = new ThreadPoolTaskScheduler(); s.setPoolSize(4); s.setThreadNamePrefix("sched-"); return s; }
}
@Component
class Jobs {
    @Scheduled(cron = "0 0 2 * * *", zone = "Asia/Kolkata") void nightlyReport() { ... }
    @Scheduled(fixedDelayString = "PT30S", initialDelay = 10_000) void poll() { ... }              // 30 s AFTER the previous run ends
    @Async("taskExecutor") CompletableFuture<Report> build(UUID id) { return CompletableFuture.completedFuture(reports.build(id)); }
}`,
        ),
      ],
      [
        blk(`<h3>Caching abstraction</h3>
• <code>@EnableCaching</code> adds proxy-based caching: <code>@Cacheable</code> (look up; run method on miss and store), <code>@CachePut</code> (always run and update), <code>@CacheEvict</code> (remove; <code>allEntries</code>, <code>beforeInvocation</code>), <code>@Caching</code>, <code>@CacheConfig</code>. Keys by SpEL (<code>key</code>), <code>condition</code>, <code>unless</code>. Providers via <code>CacheManager</code>: <code>ConcurrentMapCacheManager</code> (dev), <b>Caffeine</b> (local, TTL/size), <b>Redis</b> (distributed), Ehcache, Hazelcast. Same proxy rules apply (public method, external call). Cache <b>immutable</b>, small objects; define TTL; beware stale data and cache stampede.`,
          `@Configuration @EnableCaching
class CacheConfig {
    @Bean CacheManager cacheManager() {
        var m = new CaffeineCacheManager("courses", "prices");
        m.setCaffeine(Caffeine.newBuilder().maximumSize(10_000).expireAfterWrite(Duration.ofMinutes(10)).recordStats());
        return m;
    }
}
@Service
class CatalogueService {
    @Cacheable(cacheNames = "courses", key = "#slug", unless = "#result == null")
    Course bySlug(String slug) { return repo.findBySlug(slug).orElse(null); }

    @CachePut(cacheNames = "courses", key = "#result.slug")
    Course update(CourseUpdate u) { return repo.save(u.apply()); }

    @CacheEvict(cacheNames = "courses", allEntries = true)
    void reindex() { }
}`,
        ),
      ],
      [
        ['Why configure your own executor for @Async?', 'The default executor creates unbounded threads (SimpleAsyncTaskExecutor); a bounded ThreadPoolTaskExecutor (or virtual threads) protects the application and lets you set names and rejection policy.'],
        ['What are the pitfalls of @Scheduled in a cluster?', 'Each instance runs the job; use a distributed lock (ShedLock) or Quartz clustering. The default scheduler has a single thread, so configure a pool for several jobs.'],
        ['@Cacheable vs @CachePut?', '@Cacheable skips the method when a cached value exists; @CachePut always runs the method and stores the result, used for updates.'],
      ],
    ),
  ]),

  sc(13, 'Spring Profiles and Properties', 'Core', [
    topic(
      'sc-profiles-deep',
      'Profiles: @Profile, Activation, Groups, Expressions and Environment-Specific Beans',
      [
        blk(`<h3>Profiles</h3>
• A <b>profile</b> is a named set of beans/configuration active only in some environments. <code>@Profile("dev")</code> on a <code>@Component</code>/<code>@Configuration</code>/<code>@Bean</code>; expressions <code>@Profile("!prod")</code>, <code>@Profile("dev | local")</code>, <code>@Profile("cloud & !k8s")</code> (use parentheses to mix operators). Beans with no profile are always created. <b>Default profile</b>: <code>default</code> (active when none set; change with <code>spring.profiles.default</code>).<br>
• <b>Activation</b>: <code>spring.profiles.active=dev,metrics</code> (property/env <code>SPRING_PROFILES_ACTIVE</code>/CLI <code>--spring.profiles.active</code>/JVM <code>-D</code>), <code>SpringApplication.setAdditionalProfiles</code>, <code>environment.setActiveProfiles</code>, <code>@ActiveProfiles</code> in tests, <code>spring.profiles.include</code> (Boot 2.4+: use <b>profile groups</b>).`,
          `# application.yml
spring:
  profiles:
    group:
      production: proddb, prodmq, metrics            # activating "production" activates these three
      local: h2, mockmail

@Configuration
class InfraConfig {
    @Bean @Profile("local | test")
    DataSource h2() { return new EmbeddedDatabaseBuilder().setType(EmbeddedDatabaseType.H2).addScript("schema.sql").build(); }

    @Bean @Profile("prod")
    DataSource postgres(@Value("\${db.url}") String url) { var ds = new HikariDataSource(); ds.setJdbcUrl(url); return ds; }

    @Bean @Profile("!prod")
    MailSender logMailSender() { return msg -> log.info("MAIL (not sent): {}", msg); }
}
@Service @Profile("payments-sandbox") class SandboxGateway implements PaymentGateway { }
@Service @Profile("payments-live")    class LiveGateway    implements PaymentGateway { }`,
        ),
      ],
      [
        blk(`<h3>Profile-specific properties and best practices</h3>
• Boot loads <code>application.yml</code>, then <code>application-{profile}.yml</code> (profile values override); multi-document YAML with <code>spring.config.activate.on-profile</code>. Tests: <code>@ActiveProfiles("test")</code>; also <code>@Profile</code> on <code>@TestConfiguration</code>.<br>
• <b>Best practices</b>: profiles select <b>environment/behaviour variants</b>, not every property (use externalised config for values); avoid too many profiles and <b>do not store secrets in profile files</b>; keep <b>prod-like behaviour in default</b> and put dev conveniences in a <code>local</code> profile (safer if the profile is forgotten); never use a <code>prod</code> profile to <i>enable</i> safety checks.<br>
• Check: <code>Environment.getActiveProfiles()</code>, <code>environment.acceptsProfiles(Profiles.of("prod"))</code>, Actuator <code>/actuator/env</code>.`,
          `# application.yml
spring.application.name: catalogue
server.port: 8080
---
spring:
  config.activate.on-profile: local
  datasource.url: jdbc:h2:mem:jsl
logging.level.com.javaschoollab: DEBUG
---
spring:
  config.activate.on-profile: prod
  datasource.url: \${DB_URL}
logging.level.root: WARN

@SpringBootTest @ActiveProfiles("test") class CatalogueIT { }`,
        ),
      ],
      [
        blk(`<h3>Testing and verifying profile configurations</h3>
• Test each profile combination you ship: a <code>@SpringBootTest</code> with <code>@ActiveProfiles</code> proves the context starts and the expected beans exist; <code>ApplicationContextRunner</code> verifies conditional configuration quickly. In CI also start the app with the <b>production profile and fake infrastructure</b> to catch missing properties early. Log the active profiles at startup so deployments are traceable.`,
          `@SpringBootTest @ActiveProfiles("prod")
class ProdProfileSmokeTest {
    @Autowired ApplicationContext ctx;
    @Test void prodUsesRealMailAndNoH2() {
        assertThat(ctx.getBeanNamesForType(MailSender.class)).doesNotContain("logMailSender");
        assertThat(ctx.getEnvironment().acceptsProfiles(Profiles.of("local"))).isFalse();
    }
}
@Component class ProfileLogger { ProfileLogger(Environment env) { LoggerFactory.getLogger(getClass()).info("active profiles: {}", Arrays.toString(env.getActiveProfiles())); } }`,
        ),
      ],
      [
        ['How do profiles work?', 'Beans or configuration annotated with @Profile are registered only if the profile expression matches the active profiles set via spring.profiles.active, environment APIs or @ActiveProfiles in tests.'],
        ['What is a profile group?', 'A Boot 2.4+ feature letting one profile name activate several others (spring.profiles.group.prod=db,mq,metrics).'],
        ['Why avoid a prod-only safety configuration?', 'If someone forgets to activate the profile the application starts without safeguards; make the safe behaviour default and relax it in local/dev.'],
      ],
    ),
    topic(
      'sc-external-configuration-properties',
      'Externalized Configuration: Property Sources, Precedence, @ConfigurationProperties and Type-Safe Binding',
      [
        blk(`<h3>Property sources and precedence (Spring Boot)</h3>
• Boot reads configuration from many sources into the <code>Environment</code>. <b>Highest to lowest (simplified)</b>: command-line args (<code>--server.port=9000</code>) → <code>SPRING_APPLICATION_JSON</code> → JVM system properties (<code>-D</code>) → OS <b>environment variables</b> (<code>SERVER_PORT</code>, relaxed binding) → <code>application-{profile}</code> files outside the jar → files inside the jar → <code>application.yml/.properties</code> → <code>@PropertySource</code> → defaults. Also <code>spring.config.import</code> (config server, <code>configtree:/run/secrets/</code>, Vault). <b>Relaxed binding</b>: <code>my.main-color</code>, <code>my.mainColor</code>, <code>MY_MAINCOLOR</code> all bind to <code>mainColor</code>.<br>
• 12-factor: <b>config in the environment</b>; one artifact, many environments; <b>secrets from the platform</b> (Kubernetes Secrets, Vault), never in git.`,
          `# precedence demo: later sources override earlier ones
# application.yml                  app.timeout: 5s
# application-prod.yml             app.timeout: 10s
# env var                          APP_TIMEOUT=15s
# java -jar app.jar --app.timeout=30s     <- wins

# import more config
spring.config.import: optional:file:./local.yml, optional:configserver:http://config:8888, configtree:/run/secrets/

@Value("\${app.timeout}") Duration timeout;          // 30s`,
        ),
      ],
      [
        blk(`<h3>@ConfigurationProperties</h3>
• <b><code>@ConfigurationProperties(prefix = "app.mail")</code></b> binds a whole property subtree to a <b>typed object</b> (records and constructor binding in Boot 3: <b>no @ConstructorBinding needed</b> for a single constructor), with nested objects, lists, maps, <code>Duration</code>/<code>DataSize</code> conversion, <code>@DefaultValue</code> and <b>validation</b> (<code>@Validated</code> + Jakarta constraints) so bad config fails at startup. Enable with <code>@EnableConfigurationProperties(X.class)</code> or <code>@ConfigurationPropertiesScan</code>. Benefits over <code>@Value</code>: structure, validation, IDE metadata (<code>spring-boot-configuration-processor</code>), relaxed binding, refactor-friendly.`,
          `@ConfigurationProperties(prefix = "app.mail")
@Validated
public record MailProperties(
        @NotBlank String host,
        @DefaultValue("587") @Min(1) @Max(65535) int port,
        @DefaultValue("5s") Duration timeout,
        @NotEmpty List<@Email String> admins,
        Map<String, String> headers,
        @Valid Retry retry) {
    public record Retry(@DefaultValue("3") int attempts, @DefaultValue("1s") Duration backoff) {}
}

@SpringBootApplication @ConfigurationPropertiesScan class Application {}

# application.yml
app:
  mail:
    host: smtp.javaschoollab.com
    admins: [ops@javaschoollab.com, dev@javaschoollab.com]
    headers: { X-App: jsl }
    retry: { attempts: 5, backoff: 2s }

@Service class MailService { MailService(MailProperties props) { ... } }                 // injected like any bean`,
        ),
      ],
      [
        blk(`<h3>Property sources in plain Spring and refreshing configuration</h3>
• Plain Spring: <code>@PropertySource</code>, <code>PropertySourcesPlaceholderConfigurer</code>, <code>Environment</code>, <code>MutablePropertySources</code> ordering (<code>addFirst/addLast</code>). <b>Refresh at runtime</b>: Spring Cloud <code>@RefreshScope</code> + <code>/actuator/refresh</code> or Spring Cloud Bus; plain Boot needs a restart. Values bound with <code>@ConfigurationProperties</code> are rebound on <code>EnvironmentChangeEvent</code>. <b>Secrets</b>: prefer mounted files / Vault; mask them in <code>/actuator/env</code> (<code>management.endpoint.env.show-values=never</code>).`,
          `@Component @RefreshScope                                      // Spring Cloud: re-created when /actuator/refresh is called
class FeatureFlags { @Value("\${feature.newCheckout:false}") boolean newCheckout; }

ConfigurableEnvironment env = ctx.getEnvironment();
env.getPropertySources().addFirst(new MapPropertySource("overrides", Map.of("app.timeout", "1s")));
env.getPropertySources().forEach(ps -> System.out.println(ps.getName()));        // order = precedence`,
        ),
      ],
      [
        ['@Value vs @ConfigurationProperties?', '@Value injects single values (with SpEL) and is untyped for groups; @ConfigurationProperties binds a prefix to a typed, validated object with nested structures, relaxed binding and metadata, and is preferred for structured settings.'],
        ['What is the precedence of Boot configuration sources?', 'Command-line args, system properties, environment variables, profile-specific files, application files, @PropertySource and defaults, in that decreasing order (simplified), so deployment config overrides packaged defaults.'],
        ['What is relaxed binding?', 'Boot maps property names written in kebab-case, camelCase, underscore or upper-case env style (MY_APP_PORT) to the same property, easing use of environment variables.'],
      ],
    ),
  ]),

  sc(14, 'Spring Validation', 'Core', [
    topic(
      'sc-validation-bean',
      'Bean Validation (Jakarta Validation), Constraint Annotations and Spring Validator',
      [
        blk(`<h3>Bean Validation basics</h3>
• <b>Jakarta Bean Validation</b> (JSR 380; reference implementation <b>Hibernate Validator</b>, in <code>spring-boot-starter-validation</code>) declares constraints on fields/getters/parameters/records: <code>@NotNull</code>, <code>@NotBlank</code> (strings), <code>@NotEmpty</code> (collections/strings), <code>@Size</code>, <code>@Min</code>/<code>@Max</code>, <code>@Positive</code>/<code>@PositiveOrZero</code>, <code>@DecimalMin</code>, <code>@Digits</code>, <code>@Email</code>, <code>@Pattern</code>, <code>@Past</code>/<code>@Future</code>/<code>@PastOrPresent</code>, <code>@AssertTrue</code>, container-element constraints <code>List&lt;@NotBlank String&gt;</code>. Spring wires a <code>LocalValidatorFactoryBean</code> (<code>Validator</code> + <code>MessageSource</code> integration).`,
          `public record CreateCourseRequest(
        @NotBlank @Size(max = 120) String title,
        @NotNull @DecimalMin("0.00") @Digits(integer = 6, fraction = 2) BigDecimal price,
        @NotEmpty List<@NotBlank @Size(max = 30) String> tags,
        @Email String contactEmail,
        @Pattern(regexp = "BEGINNER|INTERMEDIATE|EXPERT") String level,
        @Future LocalDate launchDate,
        @Valid InstructorDto instructor) {}                              // @Valid cascades into nested objects

@Autowired jakarta.validation.Validator validator;
Set<ConstraintViolation<CreateCourseRequest>> violations = validator.validate(request);
violations.forEach(v -> System.out.println(v.getPropertyPath() + ": " + v.getMessage()));`,
        ),
      ],
      [
        blk(`<h3>Custom constraints and cross-field validation</h3>
• Create an annotation with <code>@Constraint(validatedBy = ...)</code> and implement <code>ConstraintValidator&lt;A, T&gt;</code> (the validator can be a <b>Spring bean with injection</b>: Spring's <code>SpringConstraintValidatorFactory</code>). <b>Class-level constraints</b> validate relations between fields (<code>endDate &gt; startDate</code>, password confirmation). <b>Groups</b> (<code>@Validated(OnCreate.class)</code>) apply different rules per use case. Avoid database lookups in validators on hot paths (race conditions): enforce uniqueness with a DB constraint too.`,
          `@Target({FIELD, PARAMETER}) @Retention(RUNTIME) @Constraint(validatedBy = UniqueSlugValidator.class)
public @interface UniqueSlug { String message() default "slug already exists"; Class<?>[] groups() default {}; Class<? extends Payload>[] payload() default {}; }

class UniqueSlugValidator implements ConstraintValidator<UniqueSlug, String> {
    private final CourseRepository repo;                                   // injected: validators are beans-aware
    UniqueSlugValidator(CourseRepository repo) { this.repo = repo; }
    public boolean isValid(String slug, ConstraintValidatorContext ctx) { return slug == null || !repo.existsBySlug(slug); }
}

@Target(TYPE) @Retention(RUNTIME) @Constraint(validatedBy = DateRangeValidator.class) @interface ValidDateRange { String message() default "end must be after start"; Class<?>[] groups() default {}; Class<? extends Payload>[] payload() default {}; }
class DateRangeValidator implements ConstraintValidator<ValidDateRange, Schedule> {
    public boolean isValid(Schedule s, ConstraintValidatorContext c) { return s.start() == null || s.end() == null || s.end().isAfter(s.start()); }
}

interface OnCreate {} interface OnUpdate {}
record CourseDto(@Null(groups = OnCreate.class) @NotNull(groups = OnUpdate.class) UUID id, @NotBlank String title) {}`,
        ),
      ],
      [
        blk(`<h3>Spring's Validator interface</h3>
• The older Spring-specific <code>org.springframework.validation.Validator</code> (<code>supports(Class)</code> + <code>validate(Object, Errors)</code>) works with <code>DataBinder</code>, <code>Errors</code>/<code>BindingResult</code> and <code>ValidationUtils.rejectIfEmptyOrWhitespace</code>. Use for validation that is awkward with annotations; register via <code>@InitBinder</code> in MVC. <code>SpringValidatorAdapter</code> bridges Bean Validation to it.`,
          `class CourseValidator implements Validator {
    public boolean supports(Class<?> c) { return CourseForm.class.isAssignableFrom(c); }
    public void validate(Object target, Errors errors) {
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "title", "title.required", "Title is required");
        CourseForm f = (CourseForm) target;
        if (f.getPrice() != null && f.getPrice().signum() < 0) errors.rejectValue("price", "price.negative", "Price must not be negative");
    }
}
@InitBinder void init(WebDataBinder binder) { binder.addValidators(new CourseValidator()); }`,
        ),
      ],
      [
        ['@NotNull vs @NotEmpty vs @NotBlank?', '@NotNull rejects null; @NotEmpty rejects null and empty strings/collections; @NotBlank applies to strings and also rejects whitespace-only values.'],
        ['How do you write a custom validation annotation?', 'Define an annotation meta-annotated with @Constraint and implement ConstraintValidator; the validator can use Spring injection, and class-level constraints cover cross-field rules.'],
        ['Bean Validation vs Spring Validator?', 'Bean Validation is the standard annotation-driven approach (Hibernate Validator); Spring\'s Validator interface is programmatic and works with Errors/BindingResult; Spring integrates both.'],
      ],
    ),
    topic(
      'sc-validation-valid-validated-errors',
      '@Valid vs @Validated, Method Validation, Groups and Validation Error Handling',
      [
        blk(`<h3>@Valid vs @Validated</h3>
<table ${TABLE}>
<tr><th></th><th><code>@Valid</code> (jakarta.validation)</th><th><code>@Validated</code> (Spring)</th></tr>
<tr><td>Source</td><td>Jakarta standard</td><td>Spring</td></tr>
<tr><td>Validation groups</td><td>No</td><td><b>Yes</b></td></tr>
<tr><td>Cascading to nested objects</td><td><b>Yes</b> (on the field)</td><td>No (use @Valid on the field)</td></tr>
<tr><td>On a class (method validation)</td><td>No</td><td><b>Yes</b>: enables validation of method parameters/returns of that bean via a proxy</td></tr>
<tr><td>Typical use</td><td><code>@RequestBody @Valid</code>, nested fields</td><td>Groups, class-level method validation, <code>@ConfigurationProperties</code></td></tr>
</table>`),
      ],
      [
        blk(`<h3>Method validation and controller validation</h3>
• Put <code>@Validated</code> on a bean class and constraints on method parameters/return values: Spring's <code>MethodValidationPostProcessor</code> (AOP proxy) throws <code>ConstraintViolationException</code> on violation (proxy rules apply: external calls only). Spring 6.1 adds built-in method validation for controllers (<code>HandlerMethodValidationException</code>). For request bodies, <code>@Valid @RequestBody</code> throws <code>MethodArgumentNotValidException</code>; for <code>@RequestParam</code>/<code>@PathVariable</code> constraints use <code>@Validated</code> on the controller (<code>ConstraintViolationException</code>).`,
          `@Service
@Validated                                                                      // enable method-level validation on this bean
class EnrollmentService {
    @NotNull Enrollment enroll(@NotNull UUID studentId, @Min(1) @Max(5) int priority, @Valid EnrollRequest request) { ... }
}

@RestController @Validated
class CourseController {
    @PostMapping("/courses")
    ResponseEntity<Void> create(@Valid @RequestBody CreateCourseRequest body) { ... }           // MethodArgumentNotValidException
    @GetMapping("/courses")
    List<CourseDto> list(@RequestParam @Min(0) int page, @RequestParam @Max(100) int size) { ... }   // ConstraintViolationException
    @PostMapping("/courses/draft")
    void draft(@Validated(OnCreate.class) @RequestBody CourseDto dto) { ... }                   // groups`,
        ),
      ],
      [
        blk(`<h3>Validation error handling</h3>
• Convert violations to a consistent API error: <code>@RestControllerAdvice</code> handling <code>MethodArgumentNotValidException</code> (field errors from <code>BindingResult</code>), <code>ConstraintViolationException</code>, <code>HandlerMethodValidationException</code>; return <b>RFC 9457 <code>ProblemDetail</code></b> with a field → message map and HTTP <b>400</b> (or 422). Never leak internals; localise messages (<code>MessageSource</code> + <code>{key}</code> in annotations). Validate at the <b>edge (DTOs)</b> and enforce invariants again in the domain/database (constraints). Don't validate entities with request-level groups scattered everywhere: use DTOs per use case.`,
          `@RestControllerAdvice
class ValidationErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail body(MethodArgumentNotValidException e) {
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        pd.setProperty("errors", e.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField, fe -> Objects.requireNonNullElse(fe.getDefaultMessage(), "invalid"), (a, b) -> a)));
        return pd;
    }
    @ExceptionHandler(ConstraintViolationException.class)
    ProblemDetail params(ConstraintViolationException e) {
        var pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid parameters");
        pd.setProperty("errors", e.getConstraintViolations().stream().collect(Collectors.toMap(v -> v.getPropertyPath().toString(), ConstraintViolation::getMessage, (a, b) -> a)));
        return pd;
    }
}`,
        ),
      ],
      [
        ['@Valid vs @Validated?', '@Valid is the Jakarta standard that triggers validation and cascades to nested objects; @Validated is Spring\'s variant that supports validation groups and enables method-level validation when placed on a class.'],
        ['How do you handle validation errors in a REST API?', 'Handle MethodArgumentNotValidException and ConstraintViolationException in a @RestControllerAdvice and return a 400 ProblemDetail with field-level messages.'],
        ['Why is @Validated on a service class sometimes ignored?', 'Method validation is proxy-based, so internal self-calls, non-public methods, or classes that are not Spring beans are not validated.'],
      ],
    ),
  ]),

  sc(15, 'Spring Transactions', 'Essential', [
    topic(
      'sc-tx-fundamentals-acid-management',
      'Transaction Fundamentals, ACID, Transaction Managers and Declarative vs Programmatic',
      [
        blk(`<h3>Transaction fundamentals</h3>
• A <b>transaction</b> groups operations into one unit that either completely succeeds or has no effect. <b>ACID</b>: <b>Atomicity</b> (all or nothing), <b>Consistency</b> (valid state to valid state), <b>Isolation</b> (concurrent transactions do not see each other's partial work, with levels), <b>Durability</b> (committed data survives crashes).<br>
• Spring's <b>transaction abstraction</b> offers one consistent programming model across JDBC, JPA/Hibernate, JMS, JTA: <b><code>PlatformTransactionManager</code></b> (<code>getTransaction</code>, <code>commit</code>, <code>rollback</code>) implementations: <code>DataSourceTransactionManager</code> (JDBC/JdbcTemplate/MyBatis), <code>JpaTransactionManager</code> (JPA/Hibernate: Boot picks it), <code>JtaTransactionManager</code> (distributed XA), <code>R2dbcTransactionManager</code>/<code>ReactiveTransactionManager</code>. A transaction is bound to the <b>current thread</b> (<code>TransactionSynchronizationManager</code>, holding the connection/EntityManager in thread-locals).`,
          `// What the container hides: manual JDBC transaction
Connection con = dataSource.getConnection();
try {
    con.setAutoCommit(false);
    debit(con, from, amount); credit(con, to, amount);
    con.commit();
} catch (Exception e) { con.rollback(); throw e; }
finally { con.close(); }

// Spring: declarative
@Service class TransferService {
    @Transactional
    public void transfer(long from, long to, BigDecimal amount) { accounts.debit(from, amount); accounts.credit(to, amount); }   // commit or rollback automatically
}`,
        ),
      ],
      [
        blk(`<h3>Declarative (@Transactional) vs programmatic (TransactionTemplate)</h3>
<table ${TABLE}>
<tr><th></th><th>Declarative <code>@Transactional</code></th><th>Programmatic <code>TransactionTemplate</code> / <code>PlatformTransactionManager</code></th></tr>
<tr><td>Style</td><td>Annotation + AOP proxy</td><td>Code (lambda callback)</td></tr>
<tr><td>Boundaries</td><td>Whole method</td><td><b>Precise</b> sub-method scope</td></tr>
<tr><td>Self-invocation</td><td>Bypasses the proxy</td><td>Works anywhere</td></tr>
<tr><td>Dynamic settings</td><td>Fixed per method</td><td>Choose propagation/isolation at runtime</td></tr>
<tr><td>Use</td><td>Default for services</td><td>Batches, self-calls, fine-grained scope, non-proxied code</td></tr>
</table>
• Enable with <code>@EnableTransactionManagement</code> (Boot auto-configures it with <code>spring-boot-starter-data-jpa/jdbc</code>). Apply <code>@Transactional</code> on the <b>service layer</b> (use-case boundary), not on controllers or repositories.`,
          `@Service
class BatchService {
    private final TransactionTemplate tx;
    BatchService(PlatformTransactionManager tm) { this.tx = new TransactionTemplate(tm); }

    void importAll(List<Row> rows) {
        for (List<Row> chunk : Lists.partition(rows, 500)) {
            tx.executeWithoutResult(status -> {                          // each chunk is its own transaction
                chunk.forEach(repo::save);
                if (chunk.stream().anyMatch(Row::isCorrupt)) status.setRollbackOnly();
            });
        }
    }
    Report report() { return tx.execute(s -> reports.build()); }          // returns a value
}`,
        ),
      ],
      [
        blk(`<h3>How @Transactional works (proxy) and enabling it</h3>
• <code>@Transactional</code> methods are intercepted by <code>TransactionInterceptor</code>: get connection/EntityManager → begin → <b>invoke method</b> → on success <b>commit</b>, on exception <b>rollback per rules</b> → release resources. It needs <b>public methods called through the proxy</b>; self-invocation, <code>final</code>/<code>private</code> methods and non-bean objects are not transactional. Put the annotation on the <b>implementation class</b> (or its methods). Class-level applies to all public methods; method-level overrides. <code>@Transactional(readOnly = true)</code> at class level with writes overridden is a common pattern.`,
          `@Service
@Transactional(readOnly = true)                              // default for all public methods: read-only
class CourseService {
    public CourseDto find(UUID id) { ... }                    // read-only transaction
    @Transactional                                            // overrides: read-write
    public CourseDto create(CreateCourse cmd) { ... }
}
@Configuration @EnableTransactionManagement class TxConfig { @Bean PlatformTransactionManager tm(EntityManagerFactory emf) { return new JpaTransactionManager(emf); } }`,
        ),
      ],
      [
        ['What are the ACID properties?', 'Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions do not interfere according to the isolation level) and Durability (committed data survives failures).'],
        ['Declarative vs programmatic transactions?', 'Declarative uses @Transactional via an AOP proxy and is the default; programmatic uses TransactionTemplate/PlatformTransactionManager for fine-grained scope, runtime-chosen settings and self-invocation cases.'],
        ['Where should @Transactional be placed?', 'On service-layer methods or classes representing a use case, on public methods called from outside through the proxy; not on controllers or repositories.'],
      ],
    ),
    topic(
      'sc-tx-propagation-isolation',
      'Transaction Propagation Levels and Isolation Levels',
      [
        blk(`<h3>Propagation: what happens when a transactional method calls another</h3>
<table ${TABLE}>
<tr><th>Propagation</th><th>If a transaction exists</th><th>If none exists</th></tr>
<tr><td><code>REQUIRED</code> (default)</td><td>Join it</td><td>Create new</td></tr>
<tr><td><code>REQUIRES_NEW</code></td><td><b>Suspend</b> it, run in a new independent one</td><td>Create new</td></tr>
<tr><td><code>SUPPORTS</code></td><td>Join it</td><td>Run non-transactionally</td></tr>
<tr><td><code>NOT_SUPPORTED</code></td><td>Suspend it, run non-transactionally</td><td>Run non-transactionally</td></tr>
<tr><td><code>MANDATORY</code></td><td>Join it</td><td><b>Throw</b> <code>IllegalTransactionStateException</code></td></tr>
<tr><td><code>NEVER</code></td><td><b>Throw</b></td><td>Run non-transactionally</td></tr>
<tr><td><code>NESTED</code></td><td>Run in a <b>savepoint</b> (inner rollback does not roll back the outer; JDBC only, not JPA by default)</td><td>Create new</td></tr>
</table>
• <b>REQUIRED</b>: inner and outer share <b>one</b> physical transaction: if the inner method throws and marks it rollback-only, the outer cannot commit (<code>UnexpectedRollbackException</code>, "Transaction silently rolled back because it has been marked as rollback-only"). <b>REQUIRES_NEW</b>: independent commit/rollback: use for audit logging that must persist even when the main transaction fails.`,
          `@Service
class OrderService {
    private final AuditService audit; private final PaymentService payments;
    @Transactional                                                      // REQUIRED
    public void placeOrder(Order o) {
        orders.save(o);
        try { audit.record("order placed " + o.id()); } catch (Exception ignored) {}     // audit failure should not break the order
        payments.charge(o);                                              // joins this transaction
    }
}
@Service class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)                // own transaction: survives a later rollback of placeOrder
    public void record(String msg) { auditRepo.save(new AuditEntry(msg)); }
}
@Service class PaymentService {
    @Transactional(propagation = Propagation.MANDATORY)                   // must be called inside an existing transaction
    public void charge(Order o) { ... }
}`,
        ),
      ],
      [
        blk(`<h3>Isolation levels and concurrency anomalies</h3>
<table ${TABLE}>
<tr><th>Level</th><th>Dirty read</th><th>Non-repeatable read</th><th>Phantom read</th></tr>
<tr><td><code>READ_UNCOMMITTED</code></td><td>Possible</td><td>Possible</td><td>Possible</td></tr>
<tr><td><code>READ_COMMITTED</code> (PostgreSQL, Oracle, SQL Server default)</td><td>No</td><td>Possible</td><td>Possible</td></tr>
<tr><td><code>REPEATABLE_READ</code> (MySQL InnoDB default)</td><td>No</td><td>No</td><td>Possible (prevented in InnoDB/PostgreSQL)</td></tr>
<tr><td><code>SERIALIZABLE</code></td><td>No</td><td>No</td><td>No (slowest; retries on conflict)</td></tr>
<tr><td><code>DEFAULT</code></td><td colspan="3">Use the database's default level</td></tr>
</table>
• <b>Dirty read</b>: reading another transaction's uncommitted data. <b>Non-repeatable read</b>: same row read twice gives different values. <b>Phantom</b>: a repeated query returns new rows. Higher isolation = fewer anomalies, lower concurrency. Isolation applies when a <b>new transaction starts</b> (ignored by an inner REQUIRED that joins). For concurrent updates also use <b>optimistic locking</b> (<code>@Version</code>) or <b>pessimistic locks</b> (<code>SELECT ... FOR UPDATE</code>).`,
          `@Transactional(isolation = Isolation.REPEATABLE_READ)
public Money statementTotal(UUID account) { ... }                              // consistent snapshot for repeated reads

@Transactional(isolation = Isolation.SERIALIZABLE)
public void reserveLastSeat(UUID flight) { ... }                               // handle serialization failures with retry

// Optimistic locking: avoids lost updates without holding DB locks
@Entity class Course { @Id UUID id; @Version long version; String title; }       // OptimisticLockingFailureException on conflict -> retry`,
        ),
      ],
      [
        blk(`<h3>Timeout and read-only</h3>
• <code>timeout</code> (seconds) aborts long transactions (applied by the driver/connection). <code>readOnly = true</code> is a <b>hint</b>: Hibernate skips dirty checking (flush mode MANUAL) and some drivers/routers send the query to a read replica; it does <b>not</b> prevent writes in every database. Use it for query-only service methods to save memory and CPU.`,
          `@Transactional(readOnly = true, timeout = 5)
public Page<CourseDto> search(CourseQuery q, Pageable p) { ... }`,
        ),
      ],
      [
        ['Explain transaction propagation.', 'It defines what a transactional method does when called inside or outside an existing transaction: REQUIRED joins or creates (default), REQUIRES_NEW suspends and starts an independent one, NESTED uses a savepoint, MANDATORY/NEVER enforce presence/absence, SUPPORTS and NOT_SUPPORTED are lenient.'],
        ['REQUIRED vs REQUIRES_NEW?', 'REQUIRED shares one transaction so a rollback in either rolls back both; REQUIRES_NEW suspends the outer and commits or rolls back independently, e.g. for audit records.'],
        ['What are isolation levels and the anomalies they prevent?', 'READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ and SERIALIZABLE progressively prevent dirty reads, non-repeatable reads and phantom reads at the cost of concurrency.'],
      ],
    ),
    topic(
      'sc-tx-rollback-pitfalls-sync',
      'Rollback Rules, Common @Transactional Pitfalls, Transaction Synchronization and Distributed Transactions',
      [
        blk(`<h3>Rollback rules</h3>
• By default Spring rolls back on <b>unchecked exceptions</b> (<code>RuntimeException</code>) and <code>Error</code>; <b>checked exceptions commit</b> the transaction! Customise: <code>rollbackFor = Exception.class</code>, <code>noRollbackFor = BusinessWarning.class</code> (also <code>rollbackForClassName</code>). Programmatic: <code>TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()</code>.<br>
• <b>Catching and swallowing</b> an exception inside the method prevents rollback (the interceptor never sees it). If an inner <code>REQUIRED</code> call throws and you catch it outside, the shared transaction is already <b>rollback-only</b>: the outer commit throws <code>UnexpectedRollbackException</code>.`,
          `@Transactional                                                   // BUG: IOException (checked) does NOT roll back
public void importFile(Path p) throws IOException { repo.saveAll(parse(p)); Files.delete(p); }

@Transactional(rollbackFor = Exception.class)                    // FIX: roll back on checked exceptions too
public void importFile2(Path p) throws IOException { ... }

@Transactional
public void process() {
    try { inner.mightFail(); }                                    // inner (REQUIRED) marks the TX rollback-only when it throws
    catch (RuntimeException e) { log.warn("ignored", e); }
}   // commit -> UnexpectedRollbackException: marked as rollback-only`,
        ),
      ],
      [
        blk(`<h3>Common @Transactional pitfalls checklist</h3>
<table ${TABLE}>
<tr><th>Pitfall</th><th>Fix</th></tr>
<tr><td>Self-invocation / calling from the same class</td><td>Move to another bean or use <code>TransactionTemplate</code></td></tr>
<tr><td>Non-public, <code>final</code> or <code>private</code> method</td><td>Make public, non-final</td></tr>
<tr><td>Checked exception does not roll back</td><td><code>rollbackFor = Exception.class</code></td></tr>
<tr><td>Exception swallowed in the method</td><td>Rethrow or <code>setRollbackOnly()</code></td></tr>
<tr><td>Wrong <code>@Transactional</code> (<code>javax</code>/<code>jakarta.transaction</code> vs Spring)</td><td>Use <code>org.springframework.transaction.annotation.Transactional</code> for full features</td></tr>
<tr><td>Transaction on a new thread (<code>@Async</code>, parallel streams)</td><td>Transactions are thread-bound: start a transaction inside the async method</td></tr>
<tr><td>Long transactions (remote calls, user waits inside)</td><td>Keep transactions short, do I/O outside</td></tr>
<tr><td>Lazy loading outside the transaction (<code>LazyInitializationException</code>)</td><td>Fetch needed data inside (join fetch, DTO projection), avoid open-session-in-view</td></tr>
<tr><td>Multiple data sources, wrong manager</td><td><code>@Transactional("ordersTm")</code></td></tr>
<tr><td>Calling REQUIRES_NEW expecting an outer read to see its rows</td><td>Understand isolation (outer cannot see uncommitted/new snapshot)</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Transaction synchronization and distributed transactions</h3>
• <code>TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() { afterCommit() ... })</code> runs code at transaction phases (what <code>@TransactionalEventListener</code> uses): send messages only after a successful commit. <b>Distributed transactions</b>: XA/JTA (Atomikos, Narayana; 2PC: slow, rarely used in microservices). Preferred: <b>local transactions + the Saga pattern</b> (orchestrated or choreographed) with <b>transactional outbox</b> (write the event in the same local transaction, publish asynchronously) and idempotent consumers. <b>ChainedTransactionManager</b> was removed (best-effort, unsafe).`,
          `@Transactional
public void placeOrder(Order o) {
    orders.save(o);
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override public void afterCommit() { broker.publish(new OrderPlaced(o.id())); }        // only if the DB commit succeeded
    });
}

// Outbox: event row written atomically with the business data; a relay publishes it
@Transactional
public void placeOrderWithOutbox(Order o) {
    orders.save(o);
    outbox.save(new OutboxEvent("OrderPlaced", json(o)));        // same transaction: either both or neither
}`,
        ),
      ],
      [
        ['Does a checked exception roll back a Spring transaction?', 'Not by default: only RuntimeException and Error trigger rollback; use rollbackFor = Exception.class to include checked exceptions.'],
        ['Why does @Transactional on a private method not work?', 'Transactions are applied by proxies that intercept public method calls from outside; private methods are never intercepted, so no transaction starts.'],
        ['How do you handle transactions across microservices?', 'Avoid 2PC; use local transactions with the Saga pattern, a transactional outbox and idempotent consumers for eventual consistency.'],
      ],
    ),
  ]),
];
