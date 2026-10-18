import { Topic } from '../coreJava';

export const springIntroductionAndIoc: Topic = {
    id: 'spring-introduction-ioc',
    name: 'Spring Introduction & IoC',
    beginner: [
        {
            content: `<h3>What is a Framework?</h3>
A framework provides the common, repetitive plumbing that every application needs, so you only write the part that is specific to your business. Spring is such a framework for Java, created by <strong>Rod Johnson</strong> and released in 2003.<br><br>

<h3>Advantages of the Spring Framework</h3>

<table>
<tr><th>Advantage</th><th>Meaning</th></tr>
<tr><td>Predefined templates</td><td>Ready-made templates for JDBC, JPA, Hibernate and more. With JdbcTemplate you do not write code for opening the connection, creating the statement, handling SQLException or closing anything - you write the query and nothing else.</td></tr>
<tr><td>Loose coupling</td><td>Objects receive their collaborators through dependency injection instead of creating them, so a class is never welded to one concrete implementation.</td></tr>
<tr><td>Easy to test</td><td>A plain Spring application needs no server. A JDK and the Spring jars are enough to run and unit-test it.</td></tr>
<tr><td>Lightweight</td><td>Spring beans are POJOs. Your class is not forced to extend a framework base class or implement a framework interface.</td></tr>
<tr><td>Fast development</td><td>Configuration, wiring and boilerplate are handled by the container, so far less code is written per feature.</td></tr>
</table>`
        },
        {
            content: `<h3>Tight Coupling vs Loose Coupling</h3>
This is the single idea the whole framework is built on, so it is worth being precise about it.<br><br>

<strong>Tightly coupled:</strong> class <code>A</code> creates a <code>B</code> with <code>new</code>. <code>A</code> now depends on that exact class. Swapping <code>B</code> for a different implementation means editing and recompiling <code>A</code>.<br><br>

<strong>Loosely coupled:</strong> <code>A</code> holds a reference of the <em>interface</em> type. Any class implementing that interface can be supplied. Swapping the implementation changes only what is handed in, never <code>A</code> itself.<br>`,
            codeExamples: [
                `// TIGHT COUPLING - A is welded to the concrete class B
package com.test;

public class B {
    public void work() { System.out.println("B is working"); }
}

public class A {
    private B b = new B();   // hard-coded dependency

    public void run() { b.work(); }
}
// OUTPUT:
// B is working
//
// To use a different class here you must edit A and recompile it.`,
                `// LOOSE COUPLING - A depends on the interface, not the implementation
package com.test;

public interface Demo {
    void work();
}

public class B implements Demo {
    public void work() { System.out.println("B is working"); }
}

public class C implements Demo {
    public void work() { System.out.println("C is working"); }
}

public class A {
    private Demo demo;               // interface reference

    public A(Demo demo) {            // the collaborator is handed in
        this.demo = demo;
    }

    public void run() { demo.work(); }
}

// new A(new B()).run();  ->  B is working
// new A(new C()).run();  ->  C is working
// OUTPUT:
// B is working
// C is working
//
// A was never edited. That is loose coupling.`
            ]
        },
        {
            content: `<h3>Spring IoC (Spring Core)</h3>
<strong>IoC</strong> stands for <strong>Inversion of Control</strong>, and Spring Core is the base module every other Spring module is built on. The IoC container is responsible for three things: it <strong>instantiates</strong> your objects, <strong>configures</strong> them, and <strong>assembles</strong> them into a working object graph.<br><br>

<h3>Why do we need it?</h3>
Without a container, every time you need a different collaborator you edit Java code:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Today   ->  B b = new B();     // hard-coded in class A
Tomorrow->  C c = new C();     // edit A, recompile, redeploy</pre>
<br>
Every change of collaborator is a change to Java source. <strong>Inversion of Control turns this around:</strong> you hand control of object creation to Spring. Your class declares <em>what</em> it needs; the container decides <em>which</em> object to supply and creates it on your behalf. You stop worrying about object creation entirely.<br><br>

<h3>Why a container?</h3>
To pass any input into your POJO classes from outside the code - values, other beans, environment-specific settings - something has to read that configuration and apply it. That is the container's job.<br><br>

<h3>What the IoC container actually does</h3>

<table>
<tr><th>Step</th><th>What happens</th></tr>
<tr><td>1. Read configuration</td><td>Parses the XML configuration file (or the annotated classes) that declares your beans.</td></tr>
<tr><td>2. Instantiate beans</td><td>Creates the object of every declared bean class.</td></tr>
<tr><td>3. Manage the lifecycle</td><td>Controls creation, initialisation, and destruction of each bean.</td></tr>
<tr><td>4. Inject values</td><td>Passes the configured parameters and collaborating beans into each bean.</td></tr>
</table>`,
            codeExamples: [
                `package com.test;

// A plain Spring bean - notice it extends nothing and implements nothing.
public class Employee {

    private String firstName;
    private String lastName;
    private String emailId;
    private String city;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmailId() { return emailId; }
    public void setEmailId(String emailId) { this.emailId = emailId; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
// This is the "POJO implementation" that makes Spring lightweight:
// the class has no idea Spring exists.`
            ]
        },
        {
            content: `<h3>The Two IoC Containers</h3>
Spring ships two container types. Both hold a collection of beans; they differ in when the beans get created and in what else they can do.<br><br>

<h3>1. BeanFactory - the core container</h3>
Used for standalone applications - the kind you install on each machine, like a calculator, a media player, or an antivirus. <code>XmlBeanFactory</code> is its implementation class, and its constructor takes a <code>Resource</code>, so a resource object must be created first.<br><br>

<h3>2. ApplicationContext - the J2EE container</h3>
Used for web applications - the kind accessed through a browser. <code>ClassPathXmlApplicationContext</code> is its implementation class, and its constructor takes the configuration file name directly as a String.<br>`,
            codeExamples: [
                `// 1. BeanFactory - pass a Resource object
Resource resource = new ClassPathResource("applicationContext.xml");
BeanFactory factory = new XmlBeanFactory(resource);

Employee e = (Employee) factory.getBean("emp");

// 2. ApplicationContext - pass the file name directly
ApplicationContext context =
        new ClassPathXmlApplicationContext("applicationContext.xml");

Employee e2 = (Employee) context.getBean("emp");
// OUTPUT:
// Both return a fully configured Employee bean; only the
// timing of its creation differs (see below).`
            ]
        },
        {
            content: `<h3>Internal Working: BeanFactory vs ApplicationContext</h3>

<strong>BeanFactory - lazy</strong><br>
<div class="border">
• The bean object is created at the moment the user calls <code>getBean()</code>.<br>
• It is called <strong>lazy</strong> because creation waits for the request.<br>
• Nothing is created at loading time.<br>
</div><br>

<strong>ApplicationContext - eager</strong><br>
<div class="border">
• Bean objects are created at class-loading time, before any request arrives.<br>
• It is called <strong>eager</strong> for exactly that reason.<br>
• Declare ten beans and all ten are instantiated up front - provided their scope is <code>singleton</code>.<br>
• If the scope is <code>prototype</code>, nothing is created at loading time.<br>
</div><br>

<table>
<tr><th>Point</th><th>Detail</th></tr>
<tr><td>Prototype scope</td><td>In BOTH containers, a prototype-scoped bean is created fresh per request - never at startup.</td></tr>
<tr><td>Private constructors</td><td>Spring creates the instance whether the constructor is public or private; it uses reflection either way.</td></tr>
<tr><td>Default scope</td><td>singleton - one shared instance per container.</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>IoC and Dependency Injection Are Not the Same Thing</h3>
The two words are used interchangeably in conversation, and interviewers like to separate them.<br><br>

<strong>Inversion of Control</strong> is the broad principle: the framework, not your code, controls the flow and the creation of objects. <strong>Dependency Injection</strong> is one specific technique for achieving it - supplying a collaborator from outside rather than constructing it inside. Service Locator is a different technique for the same principle.<br><br>

So: DI is a way to implement IoC, and it is the way Spring chose.<br><br>

<h3>Where the container actually lives in a modern application</h3>
The XML and <code>XmlBeanFactory</code> above are the historical, teaching form of the container and remain the clearest way to see what it does. In current code the same container is created for you:<br><br>

<table>
<tr><th>Era</th><th>How the container is created</th></tr>
<tr><td>Spring 2.x-3.x (XML)</td><td>You write <code>new ClassPathXmlApplicationContext("spring.xml")</code> and declare every bean in XML.</td></tr>
<tr><td>Spring 3.x+ (Java config)</td><td><code>new AnnotationConfigApplicationContext(AppConfig.class)</code> with <code>@Configuration</code> and <code>@Bean</code> methods - no XML.</td></tr>
<tr><td>Spring Boot</td><td><code>SpringApplication.run(App.class, args)</code> creates and returns the same <code>ApplicationContext</code>; component scanning and auto-configuration fill it.</td></tr>
</table>
<br>
<strong>Note on XmlBeanFactory:</strong> it has been deprecated since Spring 3.1 and removed in Spring 5, in favour of <code>DefaultListableBeanFactory</code> with an <code>XmlBeanDefinitionReader</code>. You will still meet <code>XmlBeanFactory</code> in course material and legacy code, which is why it is shown here - but do not reach for it in new work.<br>`,
            codeExamples: [
                `// The modern equivalent of XmlBeanFactory, if you ever need a raw BeanFactory:
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
new XmlBeanDefinitionReader(factory).loadBeanDefinitions(
        new ClassPathResource("spring.xml"));

Employee e = factory.getBean("emp", Employee.class);
// OUTPUT:
// Same lazy behaviour as XmlBeanFactory, without the deprecated class.`,
                `// Java configuration - the container with no XML at all
@Configuration
public class AppConfig {

    @Bean
    public Employee emp() {
        Employee e = new Employee();
        e.setFirstName("ram");
        e.setCity("pune");
        return e;
    }
}

public class Main {
    public static void main(String[] args) {
        ApplicationContext ctx =
                new AnnotationConfigApplicationContext(AppConfig.class);
        Employee e = ctx.getBean(Employee.class);
        System.out.println(e.getFirstName() + " from " + e.getCity());
    }
}
// OUTPUT:
// ram from pune`
            ]
        },
        {
            content: `<h3>Eager vs Lazy - Why the Default Is Eager</h3>
It looks wasteful to build every singleton at startup, and it is deliberate. If a bean is misconfigured - a missing dependency, a bad property, an unresolvable type - eager creation means the application <strong>fails at startup</strong>, in front of the developer or the deployment pipeline. Lazy creation means it fails on the first user request, in production.<br><br>

Fail-fast at startup is the trade Spring makes: slightly slower boot in exchange for never shipping a container that cannot build its own beans.<br><br>

<table>
<tr><th>Setting</th><th>Effect</th></tr>
<tr><td>default</td><td>Every singleton is instantiated during context refresh.</td></tr>
<tr><td><code>lazy-init="true"</code> on one bean</td><td>That single bean waits until it is first requested.</td></tr>
<tr><td><code>spring.main.lazy-initialization=true</code> (Boot)</td><td>Every bean becomes lazy. Cuts startup time; moves configuration errors to runtime.</td></tr>
<tr><td><code>@Lazy</code></td><td>The annotation form, on a <code>@Bean</code> method, a <code>@Component</code>, or an injection point.</td></tr>
</table>`
        },
        {
            content: `<h3>Bean Scopes</h3>
Scope decides how many instances of a bean the container hands out.<br><br>

<table>
<tr><th>Scope</th><th>Meaning</th></tr>
<tr><td>singleton</td><td>Default. One instance per container, shared by everyone who asks for it. Created eagerly by ApplicationContext.</td></tr>
<tr><td>prototype</td><td>A brand-new instance for every <code>getBean()</code> call and every injection point. Never created at startup.</td></tr>
<tr><td>request</td><td>Web only. One instance per HTTP request.</td></tr>
<tr><td>session</td><td>Web only. One instance per HTTP session.</td></tr>
<tr><td>application</td><td>Web only. One instance per ServletContext.</td></tr>
</table>
<br>
<strong>A trap worth knowing:</strong> "singleton" here means one per Spring container, not the Gang-of-Four Singleton pattern. Two containers in the same JVM each hold their own instance, and the class has no private constructor or <code>getInstance()</code>.<br><br>
<strong>A second trap:</strong> injecting a prototype bean into a singleton gives you <em>one</em> prototype instance, captured when the singleton was built. The singleton is only wired once. To get a fresh instance per call you need <code>ObjectProvider</code>, a lookup method, or <code>@Scope(proxyMode = TARGET_CLASS)</code>.<br>`,
            codeExamples: [
                `<!-- spring.xml -->
<bean id="emp" class="com.test.Employee" scope="prototype">
    <property name="firstName" value="ram"/>
</bean>
<!-- OUTPUT: -->
<!-- Nothing is created at startup. Every getBean("emp") builds a new Employee. -->`,
                `// The prototype-inside-singleton trap, and the fix
@Service
public class ReportService {                 // singleton

    @Autowired
    private ObjectProvider<ReportJob> jobs;   // ReportJob is prototype-scoped

    public void run() {
        ReportJob job = jobs.getObject();     // a NEW ReportJob every call
        job.execute();
    }
}
// OUTPUT:
// A fresh ReportJob per run(). Had the field been a plain
// @Autowired ReportJob, all calls would share the one instance
// that was injected when ReportService was created.`
            ]
        },
        {
            content: `<h3>The Bean Lifecycle</h3>
"The container manages the lifecycle of your bean" means a defined sequence of callbacks runs around every bean. Knowing the order explains why initialisation logic belongs in <code>@PostConstruct</code> and not in the constructor.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Bean definition read from XML / @Configuration / component scan
        |
        v
Constructor called  (constructor injection happens here)
        |
        v
Setter / field injection of the remaining dependencies
        |
        v
Aware callbacks   (BeanNameAware, ApplicationContextAware, ...)
        |
        v
BeanPostProcessor.postProcessBeforeInitialization()
        |
        v
@PostConstruct  ->  InitializingBean.afterPropertiesSet()  ->  init-method
        |
        v
BeanPostProcessor.postProcessAfterInitialization()   <-- AOP proxies created here
        |
        v
        BEAN IS READY AND IN USE
        |
        v
@PreDestroy  ->  DisposableBean.destroy()  ->  destroy-method   (singletons only)</pre>
<br>
The constructor runs <em>before</em> setter-injected dependencies exist, which is precisely why code that touches an injected field must live in <code>@PostConstruct</code>. It is also why AOP proxies - transactions, security, caching - are applied at the post-initialisation step and never inside the bean's own constructor.<br>`,
            codeExamples: [
                `@Component
public class CacheWarmer {

    @Autowired
    private ProductRepository repo;      // field injection - NOT set yet in the constructor

    public CacheWarmer() {
        System.out.println("1. constructor - repo is still null here");
    }

    @PostConstruct
    public void warm() {
        System.out.println("2. @PostConstruct - repo is injected, safe to use");
        repo.count();
    }

    @PreDestroy
    public void flush() {
        System.out.println("3. @PreDestroy - container is shutting down");
    }
}
// OUTPUT:
// 1. constructor - repo is still null here
// 2. @PostConstruct - repo is injected, safe to use
// ... application runs ...
// 3. @PreDestroy - container is shutting down`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Who created Spring and when?</td><td>Rod Johnson, 2003, out of the code in his book <em>Expert One-on-One J2EE Design and Development</em>.</td></tr>
<tr><td>What does IoC stand for and what does the container do?</td><td>Inversion of Control. The container instantiates, configures and assembles your objects, and manages their lifecycle, instead of your code doing it with <code>new</code>.</td></tr>
<tr><td>Difference between IoC and DI?</td><td>IoC is the principle - the framework controls object creation and flow. DI is the technique Spring uses to implement it: dependencies are supplied from outside rather than constructed inside.</td></tr>
<tr><td>Why is Spring called lightweight?</td><td>Beans are POJOs - no framework base class to extend, no framework interface to implement, so the application code stays free of Spring types.</td></tr>
<tr><td>BeanFactory vs ApplicationContext?</td><td>BeanFactory is the bare core container and creates singletons lazily on <code>getBean()</code>. ApplicationContext extends it, creates singletons eagerly at startup, and adds i18n, event publishing, resource loading and AOP support.</td></tr>
<tr><td>Which one would you use today?</td><td>ApplicationContext, effectively always. BeanFactory is an internal detail; Spring Boot gives you an ApplicationContext from <code>SpringApplication.run()</code>.</td></tr>
<tr><td>Why are singletons created eagerly by default?</td><td>Fail-fast. A misconfigured bean breaks startup, where a developer sees it, instead of breaking the first production request.</td></tr>
<tr><td>Is a prototype bean created at startup?</td><td>No. In both containers a prototype instance is created per request, never during context refresh.</td></tr>
<tr><td>Can Spring instantiate a class with a private constructor?</td><td>Yes - it uses reflection, so constructor visibility does not stop it.</td></tr>
<tr><td>Is Spring's singleton scope the same as the Singleton design pattern?</td><td>No. Spring's is one instance per container; the GoF pattern is one instance per class loader enforced by the class itself.</td></tr>
<tr><td>What happens if you inject a prototype bean into a singleton?</td><td>The singleton is wired once, so it keeps one prototype instance forever. Use <code>ObjectProvider</code>, a lookup method, or a scoped proxy to get a fresh one per call.</td></tr>
<tr><td>Is <code>XmlBeanFactory</code> still used?</td><td>No - deprecated in Spring 3.1 and removed in Spring 5. The replacement is <code>DefaultListableBeanFactory</code> loaded by an <code>XmlBeanDefinitionReader</code>.</td></tr>
</table>`
        }
    ]
};
