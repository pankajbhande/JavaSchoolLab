import { Topic } from '../coreJava';

export const springBean: Topic = {
    id: 'sb-bean',
    name: "@Bean",
    beginner: [
        {
            content: `<h3>A Method Whose Return Value Becomes a Bean</h3>
<code>@Bean</code> goes on a method inside a <code>@Configuration</code> class. Spring calls the method once, takes what it returns, and puts that object in the container.<br><br>

The distinction from <code>@Component</code> is who writes the construction. With <code>@Component</code>, Spring calls the constructor. With <code>@Bean</code>, <strong>you</strong> call it - which is what makes it work for classes you do not own and for construction that needs decisions.<br>`,
            codeExamples: [
                `@Configuration
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}

// Jackson's ObjectMapper is not your class - you cannot put
// @Component on it. This is the only way to make it a bean, and it
// lets you configure it while you are there.`
            ]
        },
        {
            content: `<h3>Parameters Are Injection Points</h3>
A <code>@Bean</code> method's parameters are resolved from the container exactly like constructor parameters. This is how one bean is built from another, and it is the pattern to reach for by default.<br>`,
            codeExamples: [
                `@Configuration
public class PersistenceConfig {

    @Bean
    public DataSource dataSource(ShopProperties props) {          // injected
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(props.jdbcUrl());
        ds.setMaximumPoolSize(props.poolSize());
        return ds;
    }

    @Bean
    public OrderRepository orderRepository(DataSource dataSource) { // injected
        return new OrderRepository(dataSource);
    }

    @Bean
    public AuditRepository auditRepository(DataSource dataSource,  // several
                                           Clock clock) {
        return new AuditRepository(dataSource, clock);
    }
}

// Taking the parameter also creates the ORDERING: Spring must build
// the DataSource before it can call orderRepository(). No @DependsOn
// and no declaration-order rules are involved.

// Every injection annotation works on a parameter:
@Bean
public PaymentGateway gateway(@Qualifier("live") HttpClient client,
                              @Value("\${payment.timeout:5s}") Duration timeout,
                              ObjectProvider<AuditService> audit) {
    return new StripeGateway(client, timeout,
                             audit.getIfAvailable(() -> AuditService.NO_OP));
}`
            ]
        },
        {
            content: `<h3>The Attributes</h3>

<table>
<tr><th>Attribute</th><th>Effect</th></tr>
<tr><td><code>name</code> / <code>value</code></td><td>Overrides the bean name, which defaults to the method name. Accepts several - the first is the name, the rest are aliases.</td></tr>
<tr><td><code>initMethod</code></td><td>A method to call after construction. The <code>@PostConstruct</code> equivalent for a class you cannot annotate.</td></tr>
<tr><td><code>destroyMethod</code></td><td>A method to call on shutdown. <strong>Inferred by default</strong> - see the Expert section.</td></tr>
<tr><td><code>autowireCandidate</code></td><td><code>false</code> keeps the bean out of by-type injection. It can still be reached by name.</td></tr>
</table>`,
            codeExamples: [
                `@Configuration
public class AppConfig {

    // The method name is the bean name, so renaming the method renames
    // the bean - and breaks any @Qualifier that referred to it.
    @Bean
    public ObjectMapper objectMapper() { ... }          // "objectMapper"

    @Bean("mapper")
    public ObjectMapper configuredMapper() { ... }      // "mapper"

    @Bean({ "cache", "l1Cache", "primaryCache" })       // name + 2 aliases
    public Cache cache() { ... }

    @Bean(initMethod = "start", destroyMethod = "stop")
    public MetricsReporter reporter() {
        return new MetricsReporter();                   // third-party class
    }
}`,
                `// Several beans of one type - the normal case, and how to resolve it.

@Configuration
public class DataConfig {

    @Bean
    @Primary                                     // the default choice
    public DataSource primaryDataSource(ShopProperties p) { ... }

    @Bean
    public DataSource replicaDataSource(ShopProperties p) { ... }
}

// At the injection points:
public OrderRepository(DataSource ds) { }                 // gets primary
public ReportRepository(@Qualifier("replicaDataSource") DataSource ds) { }

// Without @Primary, the unqualified constructor fails at startup:
//   NoUniqueBeanDefinitionException: expected single matching bean
//   but found 2: primaryDataSource, replicaDataSource
//
// Note the fallback that can mask this: a PARAMETER NAME matching a
// bean name also resolves. So 'DataSource replicaDataSource' works by
// accident, and renaming the parameter breaks startup. Use @Qualifier.`
            ]
        },
        {
            content: `<h3>Scope, and Conditional Beans</h3>
Everything that applies to a <code>@Component</code> class applies to a <code>@Bean</code> method - the annotation just moves onto the method.<br>`,
            codeExamples: [
                `@Configuration
public class AppConfig {

    @Bean
    @Scope("prototype")                     // new instance per request
    public ReportBuilder reportBuilder() { return new ReportBuilder(); }

    @Bean
    @RequestScope                           // includes the scoped proxy
    public RequestContext requestContext() { return new RequestContext(); }

    @Bean
    @Profile("prod")
    public PaymentGateway stripeGateway(...) { ... }

    @Bean
    @Profile("!prod")
    public PaymentGateway sandboxGateway() { ... }

    @Bean
    @ConditionalOnProperty(name = "shop.cache.enabled", havingValue = "true")
    public CacheManager cacheManager() { ... }

    @Bean
    @Lazy                                   // built on first use, not startup
    public ExpensiveClient client() { ... }
}

// One @Bean method, several beans - legal and occasionally useful:
@Bean
public List<Validator> validators() { ... }     // ONE bean, of type List

// That is a single bean whose type is List<Validator> - NOT three
// separate Validator beans. To register several, write several
// methods.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Return Type Is the Contract</h3>
Spring resolves injection by type, and the type it records is the method's <strong>declared return type</strong> - not the class of the object you actually returned. Declaring it too narrowly hides capability; too widely, and nothing can find it.<br>`,
            codeExamples: [
                `// The problem, in one pair.

@Bean
public PaymentGateway gateway() {              // declared: the interface
    return new StripeGateway();                // actual: the class
}

// Elsewhere:
@Autowired StripeGateway stripe;               // FAILS

// OUTPUT:
// NoSuchBeanDefinitionException: No qualifying bean of type
// 'com.shop.StripeGateway' available
//
// The container knows this bean as a PaymentGateway. That StripeGateway
// has extra methods is invisible - the definition's type came from the
// signature.

// Declaring the concrete type instead:
@Bean
public StripeGateway gateway() { return new StripeGateway(); }
// Now BOTH work - injection by interface still matches, because
// StripeGateway is assignable to PaymentGateway.`,
                `// So which should you declare?
//
//   Concrete type  - the safe default. It satisfies both the interface
//                    and the class, and it is what Spring Boot's own
//                    auto-configurations do.
//
//   Interface      - only when you deliberately want to prevent code
//                    depending on the implementation.
//
// The rule matters more than it looks, because @ConditionalOnMissingBean
// also matches on the declared type:

@Bean
@ConditionalOnMissingBean(PaymentGateway.class)
public PaymentGateway defaultGateway() { ... }

// A user bean declared as 'StripeGateway gateway()' DOES satisfy this
// (it is assignable), so the default backs off correctly.
//
// But the reverse fails:
//
//   @ConditionalOnMissingBean(StripeGateway.class)
//
// A user bean declared as 'PaymentGateway gateway()' does NOT match,
// so BOTH beans get registered and the injection point that wanted
// one PaymentGateway now fails with NoUniqueBeanDefinitionException.

// Generics are respected too - this is genuinely useful:
@Bean public Converter<String, Money> moneyConverter()  { ... }
@Bean public Converter<String, Instant> timeConverter() { ... }

// and the injection point picks the right one:
public Pricing(Converter<String, Money> converter) { }   // unambiguous`
            ]
        },
        {
            content: `<h3><code>destroyMethod</code> Is Inferred, Which Surprises People</h3>
If you do not set <code>destroyMethod</code>, Spring does not do nothing - it looks for a public no-arg <code>close()</code> or <code>shutdown()</code> method and calls that on shutdown.<br>`,
            codeExamples: [
                `@Bean
public HikariDataSource dataSource() {
    return new HikariDataSource(config);
}

// HikariDataSource has close(), so Spring registers it as the destroy
// method automatically. This is usually exactly what you want - the
// connection pool is shut down cleanly.

// It is NOT what you want when the object is not yours to close:

@Bean
public ExecutorService sharedPool() {
    return SomeLibrary.getSharedExecutor();     // owned by the library
}

// Spring will call shutdown() on that shared executor when the context
// closes - stopping a pool other code may still be using. The symptom
// is a RejectedExecutionException somewhere unrelated during shutdown.

// Turn the inference off explicitly:
@Bean(destroyMethod = "")                       // empty string = none
public ExecutorService sharedPool() {
    return SomeLibrary.getSharedExecutor();
}

// The three states, worth being precise about:
//   destroyMethod omitted        -> infer close() or shutdown()
//   destroyMethod = "shutdownNow" -> call that method
//   destroyMethod = ""            -> call nothing
//
// A bean implementing AutoCloseable or DisposableBean is closed
// regardless of inference.`
            ]
        },
        {
            content: `<h3>Three Mistakes Worth Recognising</h3>`,
            codeExamples: [
                `// 1. OVERLOADED @Bean METHODS.
//    Spring matches @Bean methods by NAME, so two overloads are one
//    bean name - and which overload runs is not defined.

@Configuration
public class AppConfig {
    @Bean public Cache cache()                  { return new Cache(100); }
    @Bean public Cache cache(CacheProperties p) { return new Cache(p.size()); }
}

// Both declare the bean "cache". Spring picks one - in practice the
// one with the most satisfiable parameters - and silently ignores the
// other. Give them different names:
//     @Bean public Cache defaultCache()    { ... }
//     @Bean public Cache configuredCache(CacheProperties p) { ... }`,
                `// 2. RETURNING null.
//    A @Bean method returning null registers a null bean. Injection
//    then fails with a message that points nowhere useful.

@Bean
public PaymentGateway gateway(ShopProperties p) {
    if (!p.paymentsEnabled()) {
        return null;                            // do not do this
    }
    return new StripeGateway(p.apiKey());
}

// OUTPUT at the injection point:
//   NoSuchBeanDefinitionException / a null injected field, depending
//   on Spring version - and nothing mentions this method.
//
// Express the condition where Spring can see it:
@Bean
@ConditionalOnProperty(name = "shop.payments.enabled", havingValue = "true")
public PaymentGateway gateway(ShopProperties p) {
    return new StripeGateway(p.apiKey());
}
// Now the bean either exists or does not, and "does not" is a clear
// startup failure at the point that needed it.`,
                `// 3. SIDE EFFECTS IN A @Bean METHOD.
//    The method runs during context startup, before the application
//    is up. Anything slow or remote in here delays or prevents start.

@Bean
public CatalogCache catalogCache(RestClient client) {
    CatalogCache cache = new CatalogCache();
    cache.loadAll(client.get()...);             // network call at startup
    return cache;
}

// The remote service is down -> the application does not start at all.
//
// Build the object here, fill it later:
@Bean
public CatalogCache catalogCache() { return new CatalogCache(); }

@Component
class CatalogWarmUp implements ApplicationRunner {
    public void run(ApplicationArguments args) {
        try { cache.loadAll(...); }
        catch (Exception e) { log.warn("warm-up failed; serving cold", e); }
    }
}
// A @Bean method should construct and configure. It should not do work.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is <code>@Bean</code>?</td><td>A method-level annotation in a <code>@Configuration</code> class whose return value Spring registers as a bean. You write the construction rather than Spring calling a constructor.</td></tr>
<tr><td>When do you need it over <code>@Component</code>?</td><td>For third-party classes you cannot annotate, and when construction requires logic or configuration.</td></tr>
<tr><td>How are <code>@Bean</code> method parameters resolved?</td><td>From the container, exactly like constructor parameters - including <code>@Qualifier</code>, <code>@Value</code> and <code>ObjectProvider</code>. Taking a parameter also fixes the creation order.</td></tr>
<tr><td>What is the bean's name?</td><td>The method name by default. <code>@Bean("x")</code> overrides it; several values make the rest aliases. Renaming the method renames the bean.</td></tr>
<tr><td>Why does the declared return type matter?</td><td>It is the type the container indexes the bean by. Declaring the interface makes injection by the concrete class fail, and it changes what <code>@ConditionalOnMissingBean</code> matches.</td></tr>
<tr><td>Interface or concrete return type?</td><td>Concrete by default - it satisfies both. Use the interface only to deliberately hide the implementation.</td></tr>
<tr><td>What happens if you omit <code>destroyMethod</code>?</td><td>Spring infers a public no-arg <code>close()</code> or <code>shutdown()</code> and calls it. Set <code>destroyMethod = ""</code> to disable that for objects you do not own.</td></tr>
<tr><td>Can you overload a <code>@Bean</code> method?</td><td>You should not - matching is by method name, so both overloads claim one bean name and Spring silently uses one.</td></tr>
<tr><td>What if a <code>@Bean</code> method returns <code>null</code>?</td><td>A null bean is registered and the failure surfaces far from the cause. Use <code>@Conditional</code>/<code>@Profile</code> so the bean either exists or does not.</td></tr>
<tr><td>Should a <code>@Bean</code> method do work?</td><td>No - it runs during startup. Construct and configure only; move network calls and warm-up into an <code>ApplicationRunner</code>.</td></tr>
</table>`
        }
    ]
};
