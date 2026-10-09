import { Topic } from '../coreJava';

export const springConfiguration: Topic = {
    id: 'sb-configuration',
    name: "@Configuration",
    beginner: [
        {
            content: `<h3>A Class That Replaces an XML File</h3>
<code>@Configuration</code> marks a class as a source of bean definitions. It is the Java equivalent of a <code>spring.xml</code> file - same job, checked by the compiler.<br><br>

It arrived in Spring 3.0 (2009) and is now the default way to configure everything. XML still works and you will meet it in older projects, but nothing new is written that way.<br>`,
            codeExamples: [
                `<!-- The XML original -->
<beans>
    <bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource">
        <property name="jdbcUrl" value="jdbc:mysql://localhost/shop"/>
        <property name="maximumPoolSize" value="20"/>
    </bean>

    <bean id="orderRepository" class="com.shop.OrderRepository">
        <constructor-arg ref="dataSource"/>
    </bean>
</beans>`,
                `// The same thing in Java.
@Configuration
public class PersistenceConfig {

    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://localhost/shop");
        ds.setMaximumPoolSize(20);
        return ds;
    }

    @Bean
    public OrderRepository orderRepository(DataSource dataSource) {
        return new OrderRepository(dataSource);
    }
}

// What the compiler now catches that XML could not:
//   * a typo in a class name           - XML failed at startup
//   * setMaximumPoolSize("twenty")     - XML failed at startup
//   * a renamed or deleted class       - XML failed at startup
//   * the wrong argument order         - XML never caught it at all
//
// Refactoring works too: rename OrderRepository in the IDE and this
// file updates. An XML file does not.`
            ]
        },
        {
            content: `<h3>What Goes in a Configuration Class</h3>
Four things, and they are usually the reason the class exists rather than the beans themselves.<br><br>

<table>
<tr><th>Annotation</th><th>Purpose</th></tr>
<tr><td><code>@Bean</code></td><td>Declare a bean by writing its construction. The main content.</td></tr>
<tr><td><code>@ComponentScan</code></td><td>Point scanning at packages. Implied by <code>@SpringBootApplication</code> for its own package downwards.</td></tr>
<tr><td><code>@PropertySource</code></td><td>Load an extra properties file into the <code>Environment</code>. Not needed for <code>application.properties</code>, which Boot loads already.</td></tr>
<tr><td><code>@Import</code></td><td>Pull in another configuration class explicitly, rather than relying on it being scanned.</td></tr>
</table>`,
            codeExamples: [
                `@Configuration
@ComponentScan(basePackages = "com.shop.orders")
@PropertySource("classpath:payment.properties")
@Import({ SecurityConfig.class, MessagingConfig.class })
public class AppConfig {

    @Bean
    public PaymentGateway paymentGateway(
            @Value("\${payment.api-key}") String apiKey) {
        return new StripeGateway(apiKey);
    }
}

// @Import is worth knowing because it does not depend on package
// layout. A configuration class in a shared library jar will never be
// found by your component scan - importing it by type is how you pull
// it in. It is also how @EnableXxx annotations work, below.`,
                `// Splitting configuration by concern, rather than one giant class:

@Configuration
public class PersistenceConfig { /* DataSource, transaction manager */ }

@Configuration
public class WebConfig implements WebMvcConfigurer { /* CORS, converters */ }

@Configuration
public class SecurityConfig { /* SecurityFilterChain, encoder */ }

@Configuration
public class SchedulingConfig { /* thread pools, executors */ }

// Boot finds all four by scanning, so no @Import is needed inside one
// application. The split is for readability, and it makes each one
// independently testable:
//
//   @SpringBootTest(classes = PersistenceConfig.class)
//
// starts a context with just that configuration - much faster than
// booting the whole application to test one bean's wiring.`
            ]
        },
        {
            content: `<h3><code>@Configuration</code> vs <code>@Component</code> for <code>@Bean</code> Methods</h3>
Both will register the beans. They differ in one specific way, and it is the reason to always use <code>@Configuration</code>.<br><br>

<table>
<tr><th></th><th><code>@Configuration</code> ("full")</th><th><code>@Component</code> ("lite")</th></tr>
<tr><td>Class is CGLIB-subclassed</td><td>Yes</td><td>No</td></tr>
<tr><td>One <code>@Bean</code> method calling another</td><td>Returns the singleton</td><td>Runs the method again - a second object</td></tr>
<tr><td>Startup cost</td><td>One proxy class per config</td><td>None</td></tr>
</table>
<br>
The failure mode in the right column is quiet and expensive: a second <code>DataSource</code> means a second connection pool that nothing manages. Use <code>@Configuration</code>, and if you want the startup saving, use <code>@Configuration(proxyBeanMethods = false)</code> deliberately - and then never call one <code>@Bean</code> method from another.<br><br>

The habit that makes the distinction irrelevant: <strong>take dependencies as method parameters instead of calling methods.</strong> That behaves identically in every mode.<br>`
        },
        {
            content: `<h3>Conditional Configuration</h3>
A configuration class does not have to be unconditional, and this is how one codebase serves several environments without <code>if</code> statements.<br>`,
            codeExamples: [
                `// By profile - only one of these exists at a time.
@Configuration
@Profile("dev")
public class DevDataConfig {
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder().setType(H2).build();
    }
}

@Configuration
@Profile("prod")
public class ProdDataConfig {
    @Bean
    public DataSource dataSource(DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }
}

// Injection by type stays unambiguous because only one DataSource bean
// is ever defined. Much safer than one bean with a branch inside it:
// the wrong implementation is not merely unused, it does not exist.


// By property - for a feature that can be switched off entirely.
@Configuration
@ConditionalOnProperty(name = "shop.messaging.enabled",
                       havingValue = "true",
                       matchIfMissing = true)
public class MessagingConfig { }

// The whole class, and every bean in it, disappears when the property
// is false. Cheaper and clearer than guarding each bean.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The Static <code>@Bean</code> Rule</h3>
The sharpest trap in configuration classes, and it produces a bug with no error message.<br><br>

A <code>BeanFactoryPostProcessor</code> or <code>BeanPostProcessor</code> must be created very early - before ordinary beans exist. If it is declared as an instance <code>@Bean</code> method, Spring has to instantiate the configuration class to call it, which happens <strong>before that class can have its own <code>@Value</code> or <code>@Autowired</code> members resolved</strong>.<br>`,
            codeExamples: [
                `// BROKEN - and the only symptom is a null.
@Configuration
public class AppConfig {

    @Value("\${app.placeholder-prefix}")
    private String prefix;                      // never populated

    @Bean                                       // instance method
    public PropertySourcesPlaceholderConfigurer placeholders() {
        var c = new PropertySourcesPlaceholderConfigurer();
        c.setPlaceholderPrefix(prefix);         // prefix is null here
        return c;
    }
}

// Spring must build this configurer before any property placeholder
// can be resolved - including the @Value on this very class. So the
// class is instantiated early, 'prefix' is still null, and the
// configurer is silently misconfigured.
//
// Boot usually also logs a warning that is easy to miss:
//   "@Bean method AppConfig.placeholders is non-static and returns an
//    object assignable to BeanFactoryPostProcessor. This will result
//    in a failure to process annotations such as @Autowired,
//    @Resource and @PostConstruct within the method's declaring
//    @Configuration class."`,
                `// CORRECT - static, so no instance of the config class is needed.
@Configuration
public class AppConfig {

    @Bean
    public static PropertySourcesPlaceholderConfigurer placeholders() {
        return new PropertySourcesPlaceholderConfigurer();
    }
}

// The rule, worth memorising:
//
//   @Bean methods returning BeanFactoryPostProcessor
//                        or BeanPostProcessor        -> must be static
//   every other @Bean method                         -> instance
//
// If such a bean genuinely needs configuration, take it as a method
// PARAMETER rather than a field - a static method can still have
// parameters injected:
//
//   @Bean
//   public static SomeBeanPostProcessor bpp(Environment env) { ... }`
            ]
        },
        {
            content: `<h3>How <code>@EnableXxx</code> Works</h3>
<code>@EnableWebSecurity</code>, <code>@EnableScheduling</code>, <code>@EnableCaching</code>, <code>@EnableJpaRepositories</code> - all the same mechanism, and it is just <code>@Import</code>.<br>`,
            codeExamples: [
                `// From the Spring source:
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(SchedulingConfiguration.class)          // <-- the whole trick
public @interface EnableScheduling { }

// Putting @EnableScheduling on your configuration imports Spring's
// SchedulingConfiguration, which registers the post-processor that
// finds @Scheduled methods. There is no magic - one annotation
// standing in for one @Import.`,
                `// The same pattern for a shared library of your own.

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import(AuditConfiguration.class)
public @interface EnableAuditing {
    String[] packages() default {};
}

@Configuration
public class AuditConfiguration {
    @Bean public AuditAspect auditAspect() { ... }
    @Bean public AuditRepository auditRepository(DataSource ds) { ... }
}

// A consumer writes one line:
//     @SpringBootApplication
//     @EnableAuditing
//     public class ShopApplication { }


// @Import also accepts two interfaces, for decisions the annotation
// itself cannot express:
//
//   ImportSelector             - returns class NAMES to import, chosen
//                                at runtime from the annotation's
//                                attributes or the Environment
//
//   ImportBeanDefinitionRegistrar
//                              - registers BeanDefinitions directly.
//                                This is how @EnableJpaRepositories
//                                turns your repository INTERFACES into
//                                beans - there is no class to import,
//                                so definitions are built by hand.

public class AuditSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata metadata) {
        boolean async = (boolean) metadata
            .getAnnotationAttributes(EnableAuditing.class.getName())
            .get("async");
        return async
            ? new String[] { AsyncAuditConfiguration.class.getName() }
            : new String[] { AuditConfiguration.class.getName() };
    }
}`
            ]
        },
        {
            content: `<h3>Processing Order, and When It Matters</h3>
Configuration classes are read by <code>ConfigurationClassPostProcessor</code> before any ordinary bean is instantiated. Understanding the sequence explains most "why did my bean lose" questions.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  1  Read @Configuration classes found by scanning
  2  Follow their @Import and @ComponentScan, recursively
  3  Register every @Bean method as a BeanDefinition
  4  Evaluate @Conditional / @Profile as each is read
  5  ---- user configuration is now complete ----
  6  Apply auto-configuration  (always LAST, by design)
  7  Instantiate the singletons</pre>
<br>
Step 6 being last is the whole reason <code>@ConditionalOnMissingBean</code> works in auto-configuration: by the time Boot asks "did the user define a <code>DataSource</code>?", every user definition already exists. The same annotation on your own scanned class is unreliable, because within steps 1-4 the answer depends on read order.<br>`,
            codeExamples: [
                `// Making a user bean win over auto-configuration - the correct way.
// You do not need @Primary or an exclusion; just define it.

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {          // wins automatically
        return JsonMapper.builder()
            .addModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .build();
    }
}

// JacksonAutoConfiguration declares its ObjectMapper with
// @ConditionalOnMissingBean, and it is evaluated at step 6 - after
// yours exists. So it backs off.


// When you must remove an auto-configuration entirely:
@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)

// or, in application.properties:
//   spring.autoconfigure.exclude=\\
//     org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
//
// Reach for this only when defining your own bean is not enough -
// usually when the auto-configuration would fail at startup, such as
// a DataSource with no URL configured.`,
                `// Ordering between your own configuration classes.
//
// @Bean methods are wired by DEPENDENCY, not by declaration order, so
// most ordering worries are imaginary - taking a parameter is what
// creates the ordering:

@Bean
public OrderRepository orderRepository(DataSource ds) { ... }
//                                     ^ guarantees the DataSource
//                                       is built first

// @DependsOn is only for ordering that the dependency graph cannot
// see - a bean whose SIDE EFFECT another bean relies on:

@Bean
@DependsOn("flyway")                    // migrations must run first
public CacheWarmer cacheWarmer(DataSource ds) { ... }

// If you find yourself reaching for @DependsOn often, the hidden
// dependency should usually be made explicit as a parameter instead.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is <code>@Configuration</code>?</td><td>A class that is a source of bean definitions - the Java replacement for an XML <code>&lt;beans&gt;</code> file, with compile-time checking and IDE refactoring.</td></tr>
<tr><td><code>@Configuration</code> vs <code>@Component</code> holding <code>@Bean</code> methods?</td><td><code>@Configuration</code> is CGLIB-proxied, so one <code>@Bean</code> method calling another returns the singleton. Under <code>@Component</code> the call runs the method again and creates a second object.</td></tr>
<tr><td>What does <code>proxyBeanMethods = false</code> do?</td><td>Skips the CGLIB subclass for faster startup. Safe only when no <code>@Bean</code> method calls another. Boot's own auto-configurations use it.</td></tr>
<tr><td>Why must some <code>@Bean</code> methods be <code>static</code>?</td><td><code>BeanFactoryPostProcessor</code> and <code>BeanPostProcessor</code> beans are created before the configuration class can be fully initialised. A non-static method forces early instantiation, leaving its own <code>@Value</code> and <code>@Autowired</code> members unresolved.</td></tr>
<tr><td>What does <code>@Import</code> do?</td><td>Registers another configuration class explicitly, independent of component scanning - needed for configuration in a library jar.</td></tr>
<tr><td>How does <code>@EnableScheduling</code> work?</td><td>It is a meta-annotation carrying <code>@Import(SchedulingConfiguration.class)</code>. Every <code>@EnableXxx</code> is the same pattern.</td></tr>
<tr><td><code>ImportSelector</code> vs <code>ImportBeanDefinitionRegistrar</code>?</td><td>The selector returns class names to import based on runtime conditions. The registrar registers <code>BeanDefinition</code>s directly - used by <code>@EnableJpaRepositories</code>, which has interfaces rather than classes to import.</td></tr>
<tr><td>When is auto-configuration processed?</td><td>Last, after all user configuration. That ordering is what makes <code>@ConditionalOnMissingBean</code> reliable there.</td></tr>
<tr><td>How do you override an auto-configured bean?</td><td>Define your own - the auto-configuration backs off. Exclude the auto-configuration only when it would fail at startup regardless.</td></tr>
<tr><td>When do you need <code>@DependsOn</code>?</td><td>Only when one bean relies on another's side effect with no dependency between them - Flyway migrations before a cache warmer, for example. Otherwise a constructor parameter already orders them.</td></tr>
</table>`
        }
    ]
};
