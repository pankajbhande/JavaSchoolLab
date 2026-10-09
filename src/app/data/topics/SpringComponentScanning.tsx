import { Topic } from '../coreJava';

export const springComponentScanning: Topic = {
    id: 'sb-component-scanning',
    name: "Component Scanning",
    beginner: [
        {
            content: `<h3>How Spring Finds Your Classes</h3>
Annotating a class <code>@Component</code> does not register it. Something has to go looking. <strong>Component scanning</strong> is that search: at startup Spring walks a set of packages, reads every class it finds, and registers the ones carrying a stereotype annotation.<br><br>

Two conditions must both hold for a class to become a bean:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   1. the class carries @Component
      (or @Service / @Repository / @Controller / a custom stereotype)

   2. the class sits inside a SCANNED package

   Miss either one and the class is invisible. There is no warning -
   the bean simply does not exist, and the failure appears wherever
   something tried to inject it.</pre>`
        },
        {
            content: `<h3>The Default, and the Bug It Causes</h3>
<code>@SpringBootApplication</code> is itself annotated <code>@ComponentScan</code>, with no packages given. That means: <strong>scan the package this class is in, and everything below it.</strong><br><br>

So the location of your main class silently defines the scanned tree - which is the single most common cause of a missing bean.<br>`,
            codeExamples: [
                `// WORKS - everything is under the main class's package.

com.shop
 |- ShopApplication.java          @SpringBootApplication  <- scan root
 |- order
 |   |- OrderController.java      @RestController   found
 |   |- OrderService.java         @Service          found
 |- payment
     |- StripeGateway.java        @Component        found


// BROKEN - a sibling package, not a child.

com
 |- shop
 |   |- ShopApplication.java      @SpringBootApplication  <- scan root
 |   |- order
 |       |- OrderService.java     @Service          found
 |- billing
     |- InvoiceService.java       @Service          NOT FOUND

// com.billing is not under com.shop, so it is never scanned.
//
// OUTPUT:
// UnsatisfiedDependencyException: Error creating bean with name
// 'orderService': ... No qualifying bean of type
// 'com.billing.InvoiceService' available
//
// The message names the class you wanted, which sends people looking
// for a missing annotation. The annotation is fine - the package is
// wrong.`,
                `// Three fixes, best first.

// 1. Move the main class up so everything is beneath it. This is why
//    the convention is to put it in the ROOT package.
com
 |- ShopApplication.java          <- scan root is now 'com'
 |- shop
 |- billing

// 2. Name the packages explicitly.
@SpringBootApplication(scanBasePackages = { "com.shop", "com.billing" })

// 3. Use classes instead of strings - refactor-safe, because moving
//    or renaming the package updates this automatically.
@SpringBootApplication
@ComponentScan(basePackageClasses = { ShopApplication.class,
                                      InvoiceService.class })

// Prefer (3) over (2): a string package name is not checked by
// anything, so a typo or a later package rename fails silently at
// runtime rather than at compile time.`
            ]
        },
        {
            content: `<h3>Diagnosing a Missing Bean</h3>
Two questions, in this order, settle almost every case.<br><br>

<table>
<tr><th>Message</th><th>Meaning</th><th>Look at</th></tr>
<tr><td>"No qualifying bean of type <em>X</em>"</td><td>X was never registered</td><td>Is X annotated? Is its package scanned?</td></tr>
<tr><td>"Error creating bean with name <em>x</em>"</td><td>X was found; construction failed</td><td>X's own dependencies</td></tr>
</table>
<br>
Those are different problems with different fixes, and telling them apart from the first line of the stack trace saves a lot of time.<br>`,
            codeExamples: [
                `// Confirming what was actually scanned, rather than reasoning about it.

@Component
public class ScanReport implements CommandLineRunner {

    private final ApplicationContext context;
    public ScanReport(ApplicationContext context) { this.context = context; }

    @Override
    public void run(String... args) {
        Arrays.stream(context.getBeanDefinitionNames())
              .filter(n -> !n.startsWith("org.springframework"))
              .sorted()
              .forEach(System.out::println);
    }
}

// Or, without writing code, turn on the scanner's own logging:
//
//   logging.level.org.springframework.context.annotation
//       .ClassPathBeanDefinitionScanner=DEBUG
//
// OUTPUT:
// Identified candidate component class:
//   file [.../com/shop/order/OrderService.class]
// Identified candidate component class:
//   file [.../com/shop/payment/StripeGateway.class]
//
// If your class is not in that list, it was never scanned - stop
// looking at the class and look at the packages.`
            ]
        },
        {
            content: `<h3>Narrowing What Gets Scanned</h3>
Filters let you include classes that carry no stereotype, or exclude ones that do.<br>`,
            codeExamples: [
                `@Configuration
@ComponentScan(
    basePackages = "com.shop",

    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = { LegacyOrderService.class, ExperimentalGateway.class }),

    includeFilters = @ComponentScan.Filter(
        type = FilterType.ANNOTATION,
        classes = Adapter.class)          // a custom stereotype of ours
)
public class AppConfig { }

// The five filter types:
//
//   ANNOTATION       classes carrying an annotation   (most common)
//   ASSIGNABLE_TYPE  classes of / implementing a type (most precise)
//   REGEX            class name matches a pattern
//   ASPECTJ          an AspectJ type pattern
//   CUSTOM           your own TypeFilter implementation

// CAUTION: excludeFilters do NOT apply to beans registered any other
// way. Excluding a class that is also declared by a @Bean method, an
// @Import, or an auto-configuration leaves it registered - the filter
// only controls what SCANNING picks up.`,
                `// A common real use: keep test doubles out of the production context.

@Retention(RetentionPolicy.RUNTIME)
public @interface TestOnly { }

@Component @TestOnly
public class InMemoryPaymentGateway implements PaymentGateway { }

@SpringBootApplication
@ComponentScan(excludeFilters = @ComponentScan.Filter(
    type = FilterType.ANNOTATION, classes = TestOnly.class))
public class ShopApplication { }

// Though @Profile("test") is usually the better tool for this - it
// works the same way for beans declared by @Bean methods, which a
// scan filter does not.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Scanning Reads Bytecode, Not Classes</h3>
The scanner does not load your classes to inspect them. It reads the <code>.class</code> files with ASM and examines the annotation metadata directly.<br><br>

<table>
<tr><th>Consequence</th><th>Why it matters</th></tr>
<tr><td>No static initialisers run</td><td>Scanning a class with an expensive or failing <code>static {}</code> block is safe - the block only runs if the bean is actually created.</td></tr>
<tr><td>Missing dependencies do not break scanning</td><td>A class referencing an absent optional library can be examined without a <code>NoClassDefFoundError</code>. This is what makes Boot's <code>@ConditionalOnClass</code> possible at all.</td></tr>
<tr><td>Cost is I/O, not class loading</td><td>The expense is opening and parsing every <code>.class</code> file under the scanned packages - which is why a broad scan root costs more than a narrow one.</td></tr>
</table>`,
            codeExamples: [
                `// Reducing the cost, in order of effect.

// 1. Narrow the root. The most effective change by far.
@SpringBootApplication(scanBasePackages = "com.shop.orders")

// 2. Restrict which files are even opened.
@ComponentScan(basePackages = "com.shop",
               resourcePattern = "**/*Service.class")
// Rarely worth it, and easy to get wrong - a class that stops matching
// the pattern disappears silently.

// 3. Replace runtime scanning with a compile-time index.
//    spring-context-indexer writes META-INF/spring.components during
//    compilation; Spring reads that file instead of walking the
//    classpath. Adding the dependency is the whole setup.
//
//    Two conditions: every module must be indexed (an un-indexed jar
//    falls back to scanning, silently), and include/exclude filters
//    bypass the index because they need the bytecode anyway.

// Measure first. Scanning is rarely the slow part of startup -
// a DataSource connecting or Hibernate validating a schema usually is:
//     --debug                          the auto-configuration report
//     /actuator/startup                per-step timings`
            ]
        },
        {
            content: `<h3>Scanning Stops at the Jar Boundary - by Design</h3>
A library's beans are not found by your component scan, because your scan root is your own package. Libraries therefore never rely on being scanned.<br><br>

<table>
<tr><th>Mechanism</th><th>Used by</th></tr>
<tr><td><code>@Import</code> on an <code>@EnableXxx</code> annotation</td><td>Opt-in libraries - the consumer writes <code>@EnableAuditing</code></td></tr>
<tr><td>Auto-configuration registered in <code>META-INF/spring/...AutoConfiguration.imports</code></td><td>Spring Boot starters - active with no annotation at all</td></tr>
</table>
<br>
The tempting shortcut - telling consumers to add <code>@ComponentScan("com.mylib")</code> - is a bad interface. It leaks your package structure into every consumer's configuration, and renaming an internal package becomes a breaking change.<br>`,
            codeExamples: [
                `// The auto-configuration form, for a shared library.

// src/main/java/com/mylib/AuditAutoConfiguration.java
@AutoConfiguration
@ConditionalOnClass(DataSource.class)
@ConditionalOnProperty(name = "mylib.audit.enabled", matchIfMissing = true)
public class AuditAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean                 // the app can override
    public AuditService auditService(DataSource ds) {
        return new JdbcAuditService(ds);
    }
}

// src/main/resources/META-INF/spring/
//   org.springframework.boot.autoconfigure.AutoConfiguration.imports
//
//   com.mylib.AuditAutoConfiguration

// Consumers add the dependency and get the bean. No @ComponentScan, no
// @Import, no knowledge of com.mylib's internals.
//
// (On Boot 2.7 and earlier this file was
//  META-INF/spring.factories, keyed by EnableAutoConfiguration. A
//  library supporting both ships both files.)`
            ]
        },
        {
            content: `<h3>Scanning in Tests</h3>
Test annotations control scanning too, and this is where startup time is won or lost.<br><br>

<table>
<tr><th>Annotation</th><th>Scans</th></tr>
<tr><td><code>@SpringBootTest</code></td><td>Everything - the full application context. Slow, and shared between test classes only if the configuration matches exactly.</td></tr>
<tr><td><code>@WebMvcTest(OrderController.class)</code></td><td>Controllers, advice and MVC infrastructure only. No services, no repositories - those are <code>@MockBean</code>s.</td></tr>
<tr><td><code>@DataJpaTest</code></td><td>Entities and repositories only.</td></tr>
<tr><td><code>@SpringBootTest(classes = SomeConfig.class)</code></td><td>Exactly that configuration - no scanning at all.</td></tr>
</table>`,
            codeExamples: [
                `// The context cache is the thing to understand: Spring reuses a
// context across test classes whose configuration is IDENTICAL. Any
// difference - a different @ActiveProfiles, an extra @MockBean, a
// different property - creates a SECOND context, and each one costs a
// full startup.

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceTest { }              // context A

@SpringBootTest
@ActiveProfiles("test")
class PaymentServiceTest { }            // context A - reused, free

@SpringBootTest
@ActiveProfiles("test")
@MockBean(PaymentGateway.class)
class CheckoutTest { }                  // context B - a second startup

// A suite that accumulates slightly-different @SpringBootTest
// annotations ends up starting a dozen contexts. Watch for the
// repeated banner in the test log - each one is another few seconds.
//
// To see the cache decisions:
//   logging.level.org.springframework.test.context.cache=DEBUG
//
// OUTPUT:
//   Spring test ApplicationContext cache statistics:
//     [size = 3, maxSize = 32, hitCount = 14, missCount = 3]
//
// missCount is how many full startups the suite paid for.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is component scanning?</td><td>The startup search through configured packages for classes carrying a stereotype annotation, registering each as a bean definition.</td></tr>
<tr><td>What does <code>@SpringBootApplication</code> scan by default?</td><td>Its own package and everything below it - which is why the main class belongs in the root package.</td></tr>
<tr><td>Why might an annotated class not become a bean?</td><td>Its package is outside the scanned tree. The annotation alone does nothing.</td></tr>
<tr><td>How do you scan extra packages?</td><td><code>scanBasePackages</code>, or <code>@ComponentScan(basePackageClasses = ...)</code> - the class form is refactor-safe where a string is not.</td></tr>
<tr><td>What filter types exist?</td><td><code>ANNOTATION</code>, <code>ASSIGNABLE_TYPE</code>, <code>REGEX</code>, <code>ASPECTJ</code>, <code>CUSTOM</code>. They affect scanning only, not beans registered by <code>@Bean</code> or <code>@Import</code>.</td></tr>
<tr><td>Does scanning load the classes?</td><td>No - it reads bytecode with ASM. Static initialisers do not run, and a class referencing a missing optional library can still be examined, which is what makes <code>@ConditionalOnClass</code> work.</td></tr>
<tr><td>Are beans in a library jar scanned?</td><td>No. Libraries use <code>@Import</code> behind an <code>@EnableXxx</code>, or auto-configuration registered in <code>AutoConfiguration.imports</code>.</td></tr>
<tr><td>How do you reduce scanning cost?</td><td>Narrow the base packages first; <code>spring-context-indexer</code> replaces the classpath walk with a compile-time index. Measure before optimising.</td></tr>
<tr><td>How does scanning differ in tests?</td><td>Slice annotations load only part of the context. <code>@SpringBootTest(classes = ...)</code> skips scanning entirely.</td></tr>
<tr><td>Why do some test suites start many contexts?</td><td>Spring caches a context per unique configuration; any difference in profiles, mocks or properties creates another - each costing a full startup.</td></tr>
</table>`
        }
    ]
};
