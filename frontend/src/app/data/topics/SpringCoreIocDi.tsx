import { Topic } from '../coreJava';

export const springCoreIocDi: Topic = {
    id: 'spring-core-ioc-di',
    name: 'Spring Core - IoC & Dependency Injection',
    beginner: [
        {
            content: `<h3>What is Inversion of Control (IoC)?</h3>
Normally, in plain Java, YOU are in control of creating objects - you write <code>new</code> wherever you need something. <br>
With Spring, that control is "inverted" - the <strong>Spring Container (IoC Container)</strong> creates the objects, wires them together,
and hands them to you. You just declare what you need. <br><br>

In short: <strong>"Don't call us, we'll call you."</strong> The framework calls your code and supplies the objects, instead of your code
calling the framework to create objects.<br><br>

<h4>Without Spring (You control everything):</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Engine engine = new PetrolEngine();   // you create it
Car car = new Car(engine);            // you wire it
car.drive();</pre>

<h4>With Spring (Container controls it):</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Car car = context.getBean(Car.class); // Spring already created
car.drive();                          // and wired Engine into Car</pre>

You never wrote <code>new PetrolEngine()</code> or <code>new Car(engine)</code> - Spring did it for you behind the scenes.<br>`
        },

        {
            content: `<h3>What is a Spring Bean?</h3>
A <strong>Bean</strong> is simply a Java object that is created, configured, and managed by the Spring IoC container
(instead of being created manually with <code>new</code>).<br><br>
Any class annotated with <code>@Component</code> (or a stereotype like <code>@Service</code>) becomes eligible to be turned into a bean.<br>`,
            codeExamples: [`import org.springframework.stereotype.Component;
import org.springframework.context.annotation.*;

@Component
class Greeter {
    void greet() {
        System.out.println("Hello from a Spring Bean!");
    }
}

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);

        Greeter greeter = ctx.getBean(Greeter.class); // Spring created this object
        greeter.greet();
    }
}
// OUTPUT:
// Hello from a Spring Bean!`]
        },

        {
            content: `<h3>Dependency Injection (DI) - The Mechanism Behind IoC</h3>
Dependency Injection is HOW Spring achieves Inversion of Control. Instead of a class creating the objects it depends on,
those dependencies are "injected" (supplied) from outside.<br><br>
There are 3 common ways to inject dependencies in Spring: <br>
1. Constructor Injection (preferred) <br>
2. Setter Injection <br>
3. Field Injection <br><br>

<h4>1. Constructor Injection</h4>
Dependencies are passed in through the class constructor. This is the recommended approach.<br>`,
            codeExamples: [`import org.springframework.stereotype.*;
import org.springframework.context.annotation.*;

@Component
class Engine {
    void start() {
        System.out.println("Engine started");
    }
}

@Component
class Car {
    private final Engine engine;

    @Autowired // optional on a single constructor since Spring 4.3
    public Car(Engine engine) {   // dependency injected via constructor
        this.engine = engine;
    }

    void drive() {
        engine.start();
        System.out.println("Car is driving");
    }
}

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);
        ctx.getBean(Car.class).drive();
    }
}
// OUTPUT:
// Engine started
// Car is driving`]
        },

        {
            content: `<h4>2. Setter Injection</h4>
Dependencies are supplied through a public setter method after the object is constructed.<br>`,
            codeExamples: [`import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.*;

@Component
class Engine {
    void start() {
        System.out.println("Engine started (via setter)");
    }
}

@Component
class Car {
    private Engine engine;

    @Autowired
    public void setEngine(Engine engine) { // dependency injected via setter
        this.engine = engine;
    }

    void drive() {
        engine.start();
    }
}

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);
        ctx.getBean(Car.class).drive();
    }
}
// OUTPUT:
// Engine started (via setter)`]
        },

        {
            content: `<h4>3. Field Injection</h4>
Dependencies are injected directly into the field using <code>@Autowired</code>, with no constructor or setter needed.
It's the shortest to write, but generally discouraged in real projects (explained in Expert Level).<br>`,
            codeExamples: [`import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.*;

@Component
class Engine {
    void start() {
        System.out.println("Engine started (via field)");
    }
}

@Component
class Car {
    @Autowired
    private Engine engine; // dependency injected directly into the field

    void drive() {
        engine.start();
    }
}

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);
        ctx.getBean(Car.class).drive();
    }
}
// OUTPUT:
// Engine started (via field)`]
        },

        {
            content: `<h3>Stereotype Annotations: @Component, @Service, @Repository</h3>
These annotations all mark a class as a Spring-managed bean - they are functionally similar, but used to indicate the class's role, which
makes the code more readable and lets Spring add role-specific behavior. <br><br>
• <code>@Component</code> - generic, any Spring-managed class. <br>
• <code>@Service</code> - marks a class holding business logic. <br>
• <code>@Repository</code> - marks a class that talks to the database; Spring also auto-translates database exceptions here. <br>`,
            codeExamples: [`import org.springframework.stereotype.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;

@Repository
class UserRepository {
    String findUser() {
        return "Pankaj";
    }
}

@Service
class UserService {
    @Autowired
    private UserRepository userRepository;

    String getUserName() {
        return userRepository.findUser();
    }
}

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);
        System.out.println("User: " + ctx.getBean(UserService.class).getUserName());
    }
}
// OUTPUT:
// User: Pankaj`]
        }
    ],

    expert: [
        {
            content: `<h3>IoC Container Lifecycle - What Actually Happens Inside</h3>
When <code>ApplicationContext</code> starts up, it goes through a well-defined sequence before your application code ever runs.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1. Load & Parse Configuration
   (@Configuration classes / XML / @ComponentScan packages)
            |
            v
2. Scan for candidate classes
   (@Component, @Service, @Repository, @Controller, @Bean methods)
            |
            v
3. Register BeanDefinitions
   (metadata only: class, scope, dependencies - NOT instantiated yet)
            |
            v
4. Instantiate Beans
   (constructor called - respects dependency order)
            |
            v
5. Populate Dependencies (Dependency Injection)
   (constructor args / setters / fields resolved & injected)
            |
            v
6. Apply BeanPostProcessors (before init)
            |
            v
7. Call Init callbacks
   (@PostConstruct -> InitializingBean.afterPropertiesSet() -> custom init-method)
            |
            v
8. Apply BeanPostProcessors (after init) -> Bean is now PROXIED if needed
   (AOP proxies, @Transactional wrapping etc. happen here)
            |
            v
9. Bean is READY and placed in the Singleton Cache
            |
            v
10. Application runs ... on shutdown -> @PreDestroy / destroy-method called</pre>

This is why a bean's constructor should NEVER assume other beans are fully initialized - dependencies are injected AFTER construction
(for setter/field injection) but the container guarantees full graph resolution before you can call <code>getBean()</code> successfully.<br>`,
            codeExamples: [`import org.springframework.stereotype.Component;
import org.springframework.context.annotation.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
class LifecycleDemoBean {

    public LifecycleDemoBean() {
        System.out.println("1. Constructor called");
    }

    @PostConstruct
    public void init() {
        System.out.println("2. @PostConstruct - dependencies are injected now");
    }

    @PreDestroy
    public void destroy() {
        System.out.println("3. @PreDestroy - container shutting down");
    }
}

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);
        ctx.close(); // triggers destroy phase
    }
}
// OUTPUT:
// 1. Constructor called
// 2. @PostConstruct - dependencies are injected now
// 3. @PreDestroy - container shutting down`]
        },

        {
            content: `<h3>Bean Scopes: singleton vs prototype</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Scope</th><th>Instances Created</th><th>Default?</th><th>Typical Use</th></tr>
<tr class='text-center'><td>singleton</td><td>Exactly ONE per Spring container</td><td>Yes (default)</td><td>Stateless services, repositories, controllers</td></tr>
<tr class='text-center'><td>prototype</td><td>A NEW instance every time it is requested</td><td>No</td><td>Stateful, non-thread-safe objects</td></tr>
<tr class='text-center'><td>request</td><td>One per HTTP request (web apps only)</td><td>No</td><td>Web request-scoped data</td></tr>
<tr class='text-center'><td>session</td><td>One per HTTP session (web apps only)</td><td>No</td><td>User session data</td></tr>
</table>
<br>`,
            codeExamples: [`import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.stereotype.Component;

@Component
@Scope("singleton") // default, explicit here for clarity
class SingletonBean { }

@Component
@Scope("prototype")
class PrototypeBean { }

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);

        SingletonBean s1 = ctx.getBean(SingletonBean.class);
        SingletonBean s2 = ctx.getBean(SingletonBean.class);
        System.out.println("Singleton same instance? " + (s1 == s2));

        PrototypeBean p1 = ctx.getBean(PrototypeBean.class);
        PrototypeBean p2 = ctx.getBean(PrototypeBean.class);
        System.out.println("Prototype same instance? " + (p1 == p2));
    }
}
// OUTPUT:
// Singleton same instance? true
// Prototype same instance? false`]
        },

        {
            content: `<h3>Why Constructor Injection Is Preferred Over Field Injection</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Constructor Injection</th><th>Field Injection</th></tr>
<tr class='text-center'><td>Immutability</td><td>Fields can be declared <code>final</code></td><td>Fields cannot be <code>final</code> (reflection sets them later)</td></tr>
<tr class='text-center'><td>Mandatory dependencies</td><td>Object cannot exist in a half-built state - compiler enforces it</td><td>Object can exist with <code>null</code> dependency until Spring injects it</td></tr>
<tr class='text-center'><td>Testability</td><td>Easy to unit test with plain <code>new Car(mockEngine)</code>, no Spring needed</td><td>Needs reflection or a Spring context to set private fields in tests</td></tr>
<tr class='text-center'><td>Circular dependencies</td><td>Fails FAST at startup (clear error)</td><td>May silently succeed via early-reference proxies, hiding a design smell</td></tr>
<tr class='text-center'><td>Readability</td><td>All required dependencies visible in one constructor signature</td><td>Dependencies scattered as annotated fields, harder to see the full picture</td></tr>
</table>
<br>`,
            codeExamples: [`// GOOD: Constructor injection - easy to unit test without Spring at all
class Engine { void start() { System.out.println("Engine started"); } }

class Car {
    private final Engine engine; // immutable, guaranteed non-null

    public Car(Engine engine) {
        this.engine = engine;
    }

    void drive() {
        engine.start();
    }

    public static void main(String[] args) {
        // No Spring container required for this test!
        Car car = new Car(new Engine());
        car.drive();
    }
}
// OUTPUT:
// Engine started`,
                `// BAD: Field injection - cannot instantiate cleanly outside Spring
import org.springframework.beans.factory.annotation.Autowired;

class Car {
    @Autowired
    private Engine engine; // not final, not settable via constructor

    void drive() {
        engine.start(); // NullPointerException if "new Car()" used directly
                         // outside a Spring container - engine was never set!
    }
}
// OUTPUT (if tested with "new Car().drive()" without Spring):
// Exception in thread "main" java.lang.NullPointerException`]
        },

        {
            content: `<h3>Resolving Ambiguity: @Qualifier and @Primary</h3>
When two or more beans of the SAME type exist, Spring cannot decide which one to inject and throws
<code>NoUniqueBeanDefinitionException</code> - unless you disambiguate with <code>@Qualifier</code> or <code>@Primary</code>.<br><br>
• <code>@Primary</code> - marks ONE bean as the default choice when multiple candidates exist. <br>
• <code>@Qualifier("beanName")</code> - explicitly picks a specific bean by name at the injection point (overrides @Primary if both are used together at the same site). <br>`,
            codeExamples: [`import org.springframework.beans.factory.annotation.*;
import org.springframework.context.annotation.*;
import org.springframework.stereotype.Component;

interface Payment {
    void pay();
}

@Component("creditCard")
@Primary // default choice when ambiguous
class CreditCardPayment implements Payment {
    public void pay() { System.out.println("Paid using Credit Card"); }
}

@Component("upi")
class UpiPayment implements Payment {
    public void pay() { System.out.println("Paid using UPI"); }
}

@Component
class Checkout {
    private final Payment defaultPayment; // resolves via @Primary
    private final Payment upiPayment;     // resolves via @Qualifier

    public Checkout(Payment defaultPayment, @Qualifier("upi") Payment upiPayment) {
        this.defaultPayment = defaultPayment;
        this.upiPayment = upiPayment;
    }

    void run() {
        defaultPayment.pay();
        upiPayment.pay();
    }
}

@Configuration
@ComponentScan
public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(App.class);
        ctx.getBean(Checkout.class).run();
    }
}
// OUTPUT:
// Paid using Credit Card
// Paid using UPI`]
        },

        {
            content: `<h3>@Bean Methods in @Configuration - Wiring Third-Party Classes</h3>
You cannot put <code>@Component</code> on a class you don't own (e.g. a library class like <code>ObjectMapper</code>). For those,
declare a method annotated with <code>@Bean</code> inside an <code>@Configuration</code> class - Spring calls the method once and
registers its return value as a bean.<br>`,
            codeExamples: [`import org.springframework.context.annotation.*;

// Imagine this is a third-party class you cannot annotate:
class MailClient {
    private final String host;
    MailClient(String host) { this.host = host; }
    void send() { System.out.println("Sending mail via " + host); }
}

@Configuration
class AppConfig {

    @Bean // Spring registers the returned object as a managed bean
    public MailClient mailClient() {
        return new MailClient("smtp.example.com");
    }
}

public class App {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx =
            new AnnotationConfigApplicationContext(AppConfig.class);

        MailClient client = ctx.getBean(MailClient.class);
        client.send();
    }
}
// OUTPUT:
// Sending mail via smtp.example.com`]
        },

        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is Inversion of Control?</td><td>A design principle where object creation and wiring is handed over to a framework/container instead of being done manually in application code</td></tr>
<tr class='text-center'><td>What is Dependency Injection?</td><td>The specific technique Spring uses to implement IoC - supplying a class's dependencies from outside rather than the class creating them itself</td></tr>
<tr class='text-center'><td>What is a Spring Bean?</td><td>Any object whose lifecycle (creation, wiring, initialization, destruction) is managed by the Spring IoC container</td></tr>
<tr class='text-center'><td>Why is constructor injection preferred over field injection?</td><td>Enables immutability (final fields), guarantees mandatory dependencies at construction time, is easier to unit test without a container, and surfaces circular dependencies immediately at startup</td></tr>
<tr class='text-center'><td>What is the default bean scope in Spring?</td><td>singleton - one shared instance per Spring container</td></tr>
<tr class='text-center'><td>Difference between @Component, @Service and @Repository?</td><td>All register a class as a bean; @Service/@Repository are specializations of @Component used for semantic clarity, and @Repository additionally enables automatic persistence-exception translation</td></tr>
<tr class='text-center'><td>What happens if two beans of the same type exist and neither is qualified?</td><td>Spring throws NoUniqueBeanDefinitionException at startup - resolve with @Primary or @Qualifier</td></tr>
<tr class='text-center'><td>Difference between @Primary and @Qualifier?</td><td>@Primary sets a default candidate among multiple beans of a type; @Qualifier explicitly names the exact bean to inject at a given point, taking precedence when both are present</td></tr>
<tr class='text-center'><td>When would you use a @Bean method instead of @Component?</td><td>When you need to create a bean from a class you don't own (third-party library) or when construction requires custom logic/parameters not expressible via class-level annotations</td></tr>
<tr class='text-center'><td>What is a circular dependency and how does Spring handle it?</td><td>When Bean A needs Bean B and Bean B needs Bean A; with field/setter injection Spring can resolve it via early bean references, but with constructor injection it fails fast with a BeanCurrentlyInCreationException, forcing a redesign</td></tr>
</table>`
        }
    ]
};
