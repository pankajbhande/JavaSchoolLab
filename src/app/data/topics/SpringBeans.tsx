import { Topic } from '../coreJava';

export const springBeans: Topic = {
    id: 'sb-spring-beans',
    name: "Spring Beans",
    beginner: [
        {
            content: `<h3>A Bean Is Just an Object the Container Owns</h3>
The word sounds like it implies something special about the class. It does not. A Spring bean is an ordinary Java object with one distinguishing property: <strong>Spring created it and Spring is holding on to it.</strong><br><br>

Two objects of the same class can differ on this. Only the first of these is a bean:<br>`,
            codeExamples: [
                `@Service
public class OrderService { ... }

// (a) Spring built this one at startup and keeps it in the context.
//     It is a bean. Its dependencies were injected. @Transactional
//     on its methods works, because Spring wrapped it in a proxy.

// (b) You built this one:
OrderService rogue = new OrderService();

//     Same class, not a bean. Spring has never seen it. No dependencies
//     were injected, no proxy wraps it, no @Transactional applies, and
//     no lifecycle callback will ever run on it.

// "Bean" is a statement about ownership, not about the class.`
            ]
        },
        {
            content: `<h3>Definition First, Object Second</h3>
This is the distinction that makes everything else make sense. Spring works in two phases, and the thing it collects first is not an object at all.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  PHASE 1 - REGISTRATION            PHASE 2 - INSTANTIATION

  Scan classes, read @Bean          Walk the definitions and
  methods, parse XML.               actually build the objects.

  Produces BeanDefinitions:         Produces beans:

    name  : "orderService"            OrderService@4f3a2b
    class : com.shop.OrderService     (dependencies injected,
    scope : singleton                  wrapped in a proxy if
    lazy  : false                      it needs one)
    deps  : [paymentGateway]

  A recipe. No object exists yet.    The cake.</pre>
<br>
The <strong>BeanDefinition</strong> is the recipe: which class, which scope, which dependencies, lazy or eager. Every declaration style - annotations, <code>@Bean</code> methods, XML - is just a different way of producing one, which is why they can be mixed freely in a single application.<br><br>

The gap between the two phases is what makes Spring extensible. Because every definition exists before any object does, code can run in between and change them - which is exactly how <code>@ConditionalOnMissingBean</code>, profiles and property placeholders work.<br>`
        },
        {
            content: `<h3>The Three Ways to Declare One</h3>

<table>
<tr><th>Style</th><th>Use it when</th></tr>
<tr><td><strong>Stereotype annotation</strong> - <code>@Component</code>, <code>@Service</code>, <code>@Repository</code>, <code>@Controller</code></td><td>You own the class and can annotate it. This covers almost all of your own code.</td></tr>
<tr><td><strong><code>@Bean</code> method</strong> in a <code>@Configuration</code> class</td><td>You do not own the class - a library type like <code>ObjectMapper</code> or <code>DataSource</code> - or construction needs logic.</td></tr>
<tr><td><strong>XML</strong> <code>&lt;bean&gt;</code></td><td>Legacy projects. Nothing new is written this way, but plenty of running code is.</td></tr>
</table>`,
            codeExamples: [
                `// 1. STEREOTYPE - Spring finds it by scanning and calls the constructor.
@Service
public class OrderService {
    private final PaymentGateway gateway;
    public OrderService(PaymentGateway gateway) { this.gateway = gateway; }
}
// Bean name: "orderService" (the class name, first letter lowercased)


// 2. @Bean METHOD - you write the construction; Spring calls the method
//    once and keeps what it returns.
@Configuration
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.setSerializationInclusion(Include.NON_NULL);
        return mapper;
    }
}
// Bean name: "objectMapper" (the METHOD name - renaming the method
// renames the bean, which can break an injection point that matched
// by name)


// 3. XML - the same registration, read from a file.
<bean id="orderService" class="com.shop.OrderService">
    <constructor-arg ref="stripeGateway"/>
</bean>`,
                `// When to reach for @Bean instead of @Component:

// (a) The class is not yours - you cannot put @Component on Jackson's
//     ObjectMapper, so a @Bean method is the only option.

// (b) Construction needs a decision:
@Bean
public PaymentGateway paymentGateway(ShopProperties props) {
    return props.isSandbox()
        ? new SandboxGateway()
        : new StripeGateway(props.apiKey());
}
// The parameters of a @Bean method are themselves injected, exactly
// like constructor parameters. This is how one bean is built from
// another.

// (c) You need several beans of the same type, distinguished by name:
@Bean public DataSource primaryDataSource(...)  { ... }
@Bean public DataSource replicaDataSource(...)  { ... }
// Then at the injection point: @Qualifier("replicaDataSource")`
            ]
        },
        {
            content: `<h3>Every Bean Has a Name</h3>
Names matter more than people expect, because they are the tie-breaker when two beans share a type, and they are what <code>@Qualifier</code> refers to.<br><br>

<table>
<tr><th>Declared as</th><th>Default name</th></tr>
<tr><td><code>@Service class OrderService</code></td><td><code>orderService</code> - class name, first letter lowercased</td></tr>
<tr><td><code>@Bean public ObjectMapper objectMapper()</code></td><td><code>objectMapper</code> - the method name</td></tr>
<tr><td><code>@Service("orders") class OrderService</code></td><td><code>orders</code> - explicit wins</td></tr>
<tr><td><code>@Bean(name = "mapper")</code></td><td><code>mapper</code></td></tr>
</table>
<br>
<strong>The exception worth memorising:</strong> if the first two letters of the class name are both uppercase, the name is left alone. <code>URLBuilder</code> becomes the bean <code>URLBuilder</code>, not <code>uRLBuilder</code>. This follows <code>java.beans.Introspector.decapitalize</code>, and it catches people out with classes like <code>JWTService</code> and <code>APIClient</code>.<br>`,
            codeExamples: [
                `@Service class OrderService {}    // -> "orderService"
@Service class JWTService   {}    // -> "JWTService"   (NOT "jWTService")
@Service class APIClient    {}    // -> "APIClient"

// So this fails to resolve:
//     @Qualifier("jwtService")
// and this is correct:
//     @Qualifier("JWTService")
//
// OUTPUT of the first:
// NoSuchBeanDefinitionException: No bean named 'jwtService' available
//
// If you dislike the rule, name the bean explicitly and stop guessing:
//     @Service("jwtService") class JWTService {}`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Inspecting What Is Actually in the Container</h3>
When a bean is missing, or the wrong one was injected, the fastest answer is to ask the context directly rather than reason about what should have happened.<br>`,
            codeExamples: [
                `@Component
public class BeanDump implements CommandLineRunner {

    private final ConfigurableApplicationContext context;

    public BeanDump(ConfigurableApplicationContext context) {
        this.context = context;
    }

    @Override
    public void run(String... args) {
        // Every bean of one type - answers "why did it pick that one?"
        System.out.println(Arrays.toString(
            context.getBeanNamesForType(PaymentGateway.class)));
        // OUTPUT: [stripeGateway, sandboxGateway]
        //   -> two candidates, so the injection point needs @Qualifier

        // The definition behind a name - answers "where did this
        // come from and what scope is it?"
        BeanDefinition d = context.getBeanFactory()
                                  .getBeanDefinition("orderService");
        System.out.println(d.getBeanClassName());  // com.shop.OrderService
        System.out.println(d.getScope());          // "" means singleton
        System.out.println(d.isLazyInit());        // false

        // Everything, when you have no idea what is loaded:
        Arrays.stream(context.getBeanDefinitionNames())
              .sorted()
              .forEach(System.out::println);
    }
}`,
                `# Without writing code, if Actuator is on the classpath:
curl localhost:8080/actuator/beans | jq '.contexts.application.beans
                                          | to_entries[]
                                          | select(.key | test("Gateway"))'

# OUTPUT:
# {
#   "key": "stripeGateway",
#   "value": {
#     "scope": "singleton",
#     "type": "com.shop.StripeGateway",
#     "resource": "class path resource [com/shop/StripeGateway.class]",
#     "dependencies": ["shopProperties"]
#   }
# }
#
# "resource" is the field that answers the hardest version of the
# question: which class, config file or auto-configuration registered
# this. Enable it with:
#     management.endpoints.web.exposure.include=beans`
            ]
        },
        {
            content: `<h3><code>@Bean</code> Methods Are Not Ordinary Methods</h3>
Inside a <code>@Configuration</code> class, a call from one <code>@Bean</code> method to another does not do what the Java says.<br>`,
            codeExamples: [
                `@Configuration
public class AppConfig {

    @Bean
    public DataSource dataSource() {
        System.out.println("creating DataSource");
        return new HikariDataSource(...);
    }

    @Bean
    public OrderRepository orderRepository() {
        return new OrderRepository(dataSource());   // a plain method call?
    }

    @Bean
    public AuditRepository auditRepository() {
        return new AuditRepository(dataSource());   // ...and another?
    }
}

// OUTPUT:
// creating DataSource
//
// ONCE - not twice. Spring subclasses the @Configuration class with
// CGLIB and overrides every @Bean method, so a call to dataSource()
// is intercepted and returns the singleton already in the container.
// This is "full" @Configuration mode.`,
                `// The mode matters, and it is easy to lose by accident.

// @Configuration          -> proxied ("full").  dataSource() returns
//                            the singleton. This is what you want.

// @Component with @Bean   -> NOT proxied ("lite"). dataSource() is a
//                            real method call, creating a SECOND
//                            HikariDataSource that no one manages -
//                            a second connection pool, leaked.

// @Configuration(proxyBeanMethods = false)
//                         -> also lite, but deliberately. Faster
//                            startup, no CGLIB subclass. Safe only
//                            when no @Bean method calls another.

// The safe pattern, which works identically in every mode: take the
// dependency as a parameter instead of calling the method.
@Bean
public OrderRepository orderRepository(DataSource dataSource) {
    return new OrderRepository(dataSource);       // injected, never called
}

// Spring Boot's own auto-configuration classes use proxyBeanMethods
// = false throughout, precisely because they follow this rule.`
            ]
        },
        {
            content: `<h3>Two Beans, One Name</h3>
Registering the same bean name twice used to be a silent override - the last definition won, and which was "last" depended on scanning order.<br>`,
            codeExamples: [
                `@Configuration
public class AppConfig {
    @Bean public PaymentGateway paymentGateway() { return new StripeGateway(); }
}

@Configuration
public class TestConfig {
    @Bean public PaymentGateway paymentGateway() { return new SandboxGateway(); }
}

// OUTPUT at startup (Spring Boot 2.1+):
//
// ***************************
// APPLICATION FAILED TO START
// ***************************
//
// Description:
// The bean 'paymentGateway', defined in class path resource
// [com/shop/TestConfig.class], could not be registered. A bean with
// that name has already been defined in class path resource
// [com/shop/AppConfig.class] and overriding is disabled.
//
// Action:
// Consider renaming one of the beans or enabling overriding by setting
// spring.main.allow-bean-definition-overriding=true

// Do not take the Action. It restores the silent, order-dependent
// behaviour. The real fixes:
//   * @Profile("test") on one of them
//   * @ConditionalOnMissingBean on the default
//   * different names, and @Qualifier at the injection point`,
                `// The legitimate version of "replace a bean": @Primary, which does not
// override anything - it marks a preference among several candidates.

@Bean @Primary
public PaymentGateway stripeGateway() { return new StripeGateway(); }

@Bean
public PaymentGateway sandboxGateway() { return new SandboxGateway(); }

// Both beans exist. An unqualified injection point gets the Stripe one;
// @Qualifier("sandboxGateway") still reaches the other. Nothing is lost
// and nothing depends on scanning order.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a Spring bean?</td><td>An object instantiated, assembled and managed by the Spring IoC container. The same class created with <code>new</code> is not a bean - no injection, no proxy, no lifecycle callbacks.</td></tr>
<tr><td>BeanDefinition vs bean?</td><td>The definition is the recipe - class, scope, dependencies, lazy flag - registered in phase one. The bean is the object built from it in phase two.</td></tr>
<tr><td>Why does that split matter?</td><td>Because code can run between the phases and modify definitions. Conditional configuration, profiles and property resolution all depend on it.</td></tr>
<tr><td>Ways to declare a bean?</td><td>Stereotype annotations plus component scanning, <code>@Bean</code> methods in a <code>@Configuration</code> class, and XML. They produce the same thing and can be mixed.</td></tr>
<tr><td><code>@Component</code> vs <code>@Bean</code>?</td><td><code>@Component</code> goes on a class you own and Spring constructs it. <code>@Bean</code> is a method where you construct it - required for third-party types or conditional construction.</td></tr>
<tr><td>How is the default bean name derived?</td><td>Class name or method name with the first letter lowercased - unless the first two letters are both uppercase, in which case it is left as-is (<code>JWTService</code> stays <code>JWTService</code>).</td></tr>
<tr><td>Why does calling one <code>@Bean</code> method from another return the singleton?</td><td>Spring CGLIB-subclasses the <code>@Configuration</code> class and intercepts those calls - "full" mode. Under <code>@Component</code> or <code>proxyBeanMethods = false</code> it is a plain call that creates a second instance.</td></tr>
<tr><td>What happens on a duplicate bean name?</td><td>Since Boot 2.1, startup fails. Overriding can be re-enabled with a property, but the fix is <code>@Profile</code>, <code>@ConditionalOnMissingBean</code> or distinct names.</td></tr>
<tr><td>How do you list the beans at runtime?</td><td><code>context.getBeanDefinitionNames()</code>, <code>getBeanNamesForType()</code>, or the <code>/actuator/beans</code> endpoint - whose <code>resource</code> field shows what registered each one.</td></tr>
</table>`
        }
    ]
};
