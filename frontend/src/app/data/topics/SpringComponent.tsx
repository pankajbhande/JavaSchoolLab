import { Topic } from '../coreJava';

export const springComponent: Topic = {
    id: 'sb-component',
    name: "@Component",
    beginner: [
        {
            content: `<h3>One Annotation, One Job</h3>
<code>@Component</code> marks a class as a candidate for the container. It means: <em>when you scan, register this class as a bean.</em><br><br>

That is the whole contract. It takes no dependencies, changes no behaviour and adds no capability - it is a marker that component scanning looks for.<br>`,
            codeExamples: [
                `package com.shop.service;

@Component
public class PricingEngine {

    private final TaxTable taxes;

    public PricingEngine(TaxTable taxes) {      // injected, because it is a bean
        this.taxes = taxes;
    }

    public Money price(Order order) { ... }
}

// Registered as bean "pricingEngine" - class name, first letter lowercased.
// Override it when the default reads badly:
//     @Component("pricing")

// Two conditions, both required:
//   1. the annotation is present
//   2. the class sits in a package that is scanned
//
// Miss either and the class is invisible. The failure is always the
// same message, at startup:
//
//   NoSuchBeanDefinitionException: No qualifying bean of type
//   'com.shop.service.PricingEngine' available`
            ]
        },
        {
            content: `<h3>The Four Stereotypes Are the Same Annotation</h3>
<code>@Service</code>, <code>@Repository</code> and <code>@Controller</code> are not alternatives to <code>@Component</code>. Each one <em>is</em> a <code>@Component</code> - the annotation is stamped on their own declarations.<br>`,
            codeExamples: [
                `// Straight from the Spring source:

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component                                   // <-- here
public @interface Service {
    @AliasFor(annotation = Component.class)
    String value() default "";
}

// Same for @Repository and @Controller. Component scanning does not
// look for four annotations - it looks for @Component, and finds these
// because they carry it.
//
// This is Spring's "meta-annotation" mechanism: an annotation that is
// itself annotated is treated as though it carried the inner one.`,
                `// So all four of these register a bean, identically:

@Component  public class PricingEngine  { }
@Service    public class OrderService   { }
@Repository public class OrderRepository{ }
@Controller public class OrderController{ }

// The differences are not in registration:
//
//   @Service     - no extra behaviour at all. Pure documentation.
//   @Repository  - adds exception translation: vendor SQLExceptions
//                  become Spring's DataAccessException hierarchy.
//   @Controller  - Spring MVC scans for these to find request handlers.
//                  A @Component with @GetMapping is NOT mapped.
//   @Component   - the generic case, when none of the three fit.
//
// @Repository and @Controller therefore DO something. @Service does
// not - but using it anyway keeps the layer readable at a glance, and
// tooling and architecture tests depend on the convention.`
            ]
        },
        {
            content: `<h3>Which One to Put on a Class</h3>

<table>
<tr><th>Annotation</th><th>Use for</th></tr>
<tr><td><code>@Controller</code> / <code>@RestController</code></td><td>Classes handling HTTP requests. Required - MVC will not map a plain <code>@Component</code>.</td></tr>
<tr><td><code>@Service</code></td><td>Business logic. The layer that orchestrates repositories and enforces rules.</td></tr>
<tr><td><code>@Repository</code></td><td>Data access. Worth using for the exception translation, not only the label.</td></tr>
<tr><td><code>@Component</code></td><td>Everything else: mappers, validators, event listeners, scheduled jobs, adapters, utility beans with dependencies.</td></tr>
</table>
<br>
The honest summary: reach for the specific one when it fits a layer, and <code>@Component</code> when it does not. Do not agonise - a mapper annotated <code>@Service</code> works exactly the same. The value of the convention is that a reader can tell what a class is for without opening it.<br>`
        },
        {
            content: `<h3>Where <code>@Component</code> Does Not Work</h3>
It only applies to a concrete class that Spring can construct. Four cases where it silently does nothing or fails.<br>`,
            codeExamples: [
                `// 1. ON AN INTERFACE - ignored. Nothing to instantiate.
@Component
public interface PaymentGateway { }        // no bean is created


// 2. ON AN ABSTRACT CLASS - ignored, same reason.
@Component
public abstract class BaseService { }      // no bean


// 3. ON A CLASS YOU DO NOT OWN - impossible; you cannot edit the source.
//    Use a @Bean method instead:
@Bean
public ObjectMapper objectMapper() { return new ObjectMapper(); }


// 4. WITH NO USABLE CONSTRUCTOR - registered, then fails on creation.
@Component
public class ReportService {

    public ReportService(String templateName) { ... }   // String is not a bean
}

// OUTPUT:
// UnsatisfiedDependencyException: Error creating bean with name
// 'reportService': No qualifying bean of type 'java.lang.String'
//
// The class WAS found - scanning worked. It could not be built. Those
// are different failures with different fixes, and the message tells
// you which one you have:
//   "No qualifying bean of type <YourClass>"  -> not found (scanning)
//   "Error creating bean with name ..."       -> found, construction failed`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Writing Your Own Stereotype</h3>
Because <code>@Component</code> works as a meta-annotation, you can define project-specific stereotypes that behave as beans while carrying extra meaning - and extra configuration.<br>`,
            codeExamples: [
                `// A stereotype for the outbound adapters in a hexagonal architecture.

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component                                  // makes it a bean
public @interface Adapter {

    @AliasFor(annotation = Component.class)
    String value() default "";              // forwards the bean name
}

// Usage - registers a bean exactly like @Component:
@Adapter
public class StripeGateway implements PaymentGateway { }

// @AliasFor is what makes @Adapter("stripe") work. Without it the
// value() is a separate, ignored attribute and the bean keeps its
// default name.`,
                `// More useful: bundle the configuration that always goes together.

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
@Transactional(readOnly = true)             // every query bean is read-only
@Validated                                  // method parameters are validated
public @interface QueryService { }

@QueryService
public class OrderQueryService {
    public List<Order> findRecent(@Min(1) int limit) { ... }
}

// One annotation instead of three, and impossible to apply
// inconsistently across the codebase.

// The payoff is enforcement. ArchUnit can now state the rule:
//
//   @ArchTest
//   static final ArchRule adaptersImplementPorts =
//       classes().that().areAnnotatedWith(Adapter.class)
//                .should().implement(resideInAPackage("..domain.port.."));
//
// A plain @Component cannot express that, because every bean has one.`
            ]
        },
        {
            content: `<h3>Registering Conditionally</h3>
A <code>@Component</code> is unconditional - if it is scanned, it is registered. Two annotations change that, and they are the mechanism behind most of Spring Boot's behaviour.<br>`,
            codeExamples: [
                `// @Profile - registered only under the named profile.
@Component
@Profile("!prod")
public class SandboxGateway implements PaymentGateway { }

@Component
@Profile("prod")
public class StripeGateway implements PaymentGateway { }

// Exactly one exists at a time, so injection by type stays unambiguous.
// This is much safer than an if/else inside a single bean: the wrong
// implementation is not merely unused, it does not exist.


// @ConditionalOnProperty - registered based on configuration.
@Component
@ConditionalOnProperty(name = "shop.audit.enabled", havingValue = "true")
public class AuditListener { }

// Absent by default. matchIfMissing = true flips that to opt-out.


// @ConditionalOnMissingBean - "unless the application supplied one".
@Component
@ConditionalOnMissingBean(PaymentGateway.class)
public class NoOpGateway implements PaymentGateway { }

// ORDERING WARNING: on a scanned @Component this is fragile, because
// it evaluates in scan order - the "missing" answer depends on which
// class was read first. It is designed for auto-configuration, which
// Spring deliberately processes AFTER all user beans. Inside your own
// application, prefer @Profile or @ConditionalOnProperty, whose
// outcome does not depend on ordering.`
            ]
        },
        {
            content: `<h3>The Cost of Scanning, and How to Remove It</h3>
Component scanning reads the bytecode of every class under the scanned packages at startup. On a small service this is milliseconds; on a large one, or in a serverless function where every cold start pays it, it is measurable.<br>`,
            codeExamples: [
                `<!-- The index: a build-time replacement for runtime scanning. -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context-indexer</artifactId>
    <optional>true</optional>
</dependency>

<!-- It is an annotation processor. At COMPILE time it writes
     META-INF/spring.components listing every stereotype-annotated
     class. At RUNTIME Spring reads that file instead of walking
     the classpath.

     No code change is needed - adding the dependency is the whole
     setup, and the index is used automatically when present.

     Two conditions:
       * every module must be indexed; a jar without the file falls
         back to scanning, silently
       * @ComponentScan with include/exclude filters bypasses the
         index, because the filters need the bytecode anyway -->`,
                `// Cheaper measures that usually matter more than the index:

// 1. Scan a narrow root. @SpringBootApplication scans its own package
//    downwards, so putting the main class at the top of a broad
//    package tree scans everything under it.
@SpringBootApplication(scanBasePackages = "com.shop.orders")

// 2. Mark beans lazy so they are built on first use rather than at
//    startup. Global switch:
//        spring.main.lazy-initialization=true
//    Beware: it trades startup time for later failure. A misconfigured
//    bean now blows up on the first request instead of at startup,
//    which is usually the worse trade in production.

// 3. Measure before optimising. Startup timing per bean:
//        --debug        -> the auto-configuration report
//        ApplicationStartup / spring.startup actuator endpoint
//    Scanning is rarely the slow part; a DataSource connecting or a
//    Hibernate schema validation usually is.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does <code>@Component</code> do?</td><td>Marks a class for registration as a bean during component scanning. Nothing else - no behaviour, no dependencies.</td></tr>
<tr><td>Difference between <code>@Component</code>, <code>@Service</code>, <code>@Repository</code>, <code>@Controller</code>?</td><td>Registration is identical - the last three are meta-annotated with <code>@Component</code>. <code>@Repository</code> adds exception translation, <code>@Controller</code> is required for MVC handler mapping, <code>@Service</code> adds nothing but intent.</td></tr>
<tr><td>Does <code>@Service</code> behave differently at runtime?</td><td>No. It is documentation the container treats exactly like <code>@Component</code>.</td></tr>
<tr><td>Can <code>@Component</code> go on an interface or abstract class?</td><td>No - it is ignored, because there is nothing to instantiate.</td></tr>
<tr><td><code>@Component</code> vs <code>@Bean</code>?</td><td><code>@Component</code> is on a class you own and Spring constructs it by scanning. <code>@Bean</code> is a method where you construct it - needed for third-party types or conditional construction.</td></tr>
<tr><td>Class has <code>@Component</code> but the bean is missing - why?</td><td>Its package is not scanned. <code>@SpringBootApplication</code> scans its own package and below, so a class outside that tree needs <code>scanBasePackages</code> or a relocated main class.</td></tr>
<tr><td>How do you create a custom stereotype?</td><td>Annotate your own annotation with <code>@Component</code>, and use <code>@AliasFor</code> to forward the bean name. Other annotations added to it apply to every class that uses it.</td></tr>
<tr><td>How do you register a component conditionally?</td><td><code>@Profile</code>, <code>@ConditionalOnProperty</code>, or a custom <code>@Conditional</code>. <code>@ConditionalOnMissingBean</code> is scan-order dependent on user components and belongs in auto-configuration.</td></tr>
<tr><td>How do you avoid the cost of scanning?</td><td><code>spring-context-indexer</code> generates <code>META-INF/spring.components</code> at compile time. Narrowing <code>scanBasePackages</code> usually helps more.</td></tr>
<tr><td>"No qualifying bean" vs "Error creating bean" - what is the difference?</td><td>The first means the class was never found (a scanning problem). The second means it was found but could not be constructed (a dependency problem).</td></tr>
</table>`
        }
    ]
};
