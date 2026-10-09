import { Topic } from '../coreJava';

export const springFrameworkIntroduction: Topic = {
    id: 'sb-spring-framework-introduction',
    name: "Spring Framework Introduction",
    beginner: [
        {
            content: `<h3>What Problem Was Spring Written to Solve?</h3>
Spring did not appear because someone wanted another framework. It appeared because the official way of building enterprise Java in 2002 had become unusable.<br><br>

That official way was <strong>EJB 2</strong> (Enterprise JavaBeans). To write one component that saved a customer to a database, you had to write a home interface, a remote interface, a bean class, and an XML deployment descriptor - four files before a single line of business logic. The bean class had to implement a container interface, so it could only run inside a full application server. You could not test it with a plain <code>main</code> method, and you could not test it with JUnit, because outside the server the class had no meaning.<br><br>

In 2002 <strong>Rod Johnson</strong> published a book, <em>Expert One-on-One J2EE Design and Development</em>, arguing that most of this was unnecessary. He shipped 30,000 lines of working code with it to prove the point. Readers wanted the code more than the book. It became an open-source project, and in <strong>2003</strong> it was released as the <strong>Spring Framework</strong> - so named because it was meant to be the spring that followed the winter of J2EE.<br>`
        },
        {
            content: `<h3>The Central Claim: Your Class Should Stay a Plain Java Class</h3>
Spring's founding idea is small enough to state in one sentence: <strong>the framework should adapt to your objects, not force your objects to adapt to it.</strong><br><br>

A class managed by Spring is a <strong>POJO</strong> - a Plain Old Java Object. It extends nothing, it implements no framework interface, and it contains no reference to Spring at all. Spring finds it, builds it, hands it what it needs and manages it - but the class itself does not know that.<br><br>

The practical consequence is the one that matters day to day: because the class is ordinary Java, you can create it with <code>new</code> in a unit test and it works. No server, no container, no deployment.<br>`,
            codeExamples: [
                `// EJB 2 (2002) - the component is welded to the container.
// It cannot be instantiated, so it cannot be unit tested.

public class CustomerBean implements javax.ejb.SessionBean {

    public void setSessionContext(SessionContext ctx) { }
    public void ejbCreate()  { }
    public void ejbRemove()  { }
    public void ejbActivate(){ }
    public void ejbPassivate(){ }

    public void save(Customer c) {
        // the one method that was actually wanted
    }
}
// Plus CustomerHome.java, Customer.java and ejb-jar.xml.
// Four files and five empty lifecycle methods for one line of work.`,
                `// Spring - the same component, as a POJO.

@Service
public class CustomerService {

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public void save(Customer c) {
        repository.save(c);
    }
}

// Nothing is extended. Nothing is implemented. The @Service annotation is
// metadata - remove it and this is still a class that compiles and runs.

// And so this is a legal unit test, with no server involved:
//
//   CustomerService service = new CustomerService(new FakeRepository());
//   service.save(new Customer("Asha"));
//
// OUTPUT:
// (the fake repository records the call; the test asserts on it)`
            ]
        },
        {
            content: `<h3>What Spring Actually Gives You</h3>
Four things, and they build on each other in that order.<br><br>

<table>
<tr><th>What</th><th>What it means in practice</th></tr>
<tr><td><strong>An IoC container</strong></td><td>Spring creates your objects and connects them together, instead of each object creating its own collaborators with <code>new</code>. This is the foundation everything else sits on - covered in the next two topics.</td></tr>
<tr><td><strong>Templates over verbose APIs</strong></td><td><code>JdbcTemplate</code> is the classic example. Raw JDBC makes you open a connection, create a statement, loop a ResultSet, catch SQLException and close three resources in a finally block. <code>JdbcTemplate</code> reduces the same work to the query and the row mapping; Spring does the rest and cannot forget to close anything.</td></tr>
<tr><td><strong>Declarative services</strong></td><td>Transactions, security and caching are applied by <em>declaring</em> them - <code>@Transactional</code> on a method - rather than by writing begin/commit/rollback by hand. Spring wraps the object in a proxy that does the work around your method.</td></tr>
<tr><td><strong>Integration</strong></td><td>Spring does not reimplement Hibernate, Jackson, Kafka or Tomcat. It provides a consistent way to configure and combine them, so the pieces of an application are wired the same way regardless of which library sits underneath.</td></tr>
</table>
<br>
Notice what is <em>not</em> on that list: Spring is not a web server, not an ORM and not a database driver. It is the thing that assembles those into an application.<br>`
        },
        {
            content: `<h3>Spring, Spring Framework, Spring Boot - the Names</h3>
These three names get used interchangeably in conversation and they are not the same thing.<br><br>

<table>
<tr><th>Name</th><th>What it is</th></tr>
<tr><td><strong>Spring Framework</strong></td><td>The core project: the IoC container, Spring MVC, transactions, AOP. This is what was released in 2003 and what this module is about.</td></tr>
<tr><td><strong>Spring (the ecosystem)</strong></td><td>The whole family built on that core - Spring Data, Spring Security, Spring Cloud, Spring Batch and around twenty more. Each is a separate project with its own version.</td></tr>
<tr><td><strong>Spring Boot</strong></td><td>Not a replacement for the framework and not a separate framework. It is a layer <em>on top</em> of it that removes the configuration work: sensible defaults, one dependency per feature, and an embedded server so the application runs as a plain <code>java -jar</code>. Every Spring Boot application is a Spring Framework application.</td></tr>
</table>
<br>
This matters when reading answers online. A 2011 Spring tutorial full of XML is not wrong - it is the same framework, configured the way people configured it before Boot existed. The concepts carry over unchanged; only the configuration style is dated.<br>`
        },
        {
            content: `<h3>The Timeline Worth Knowing</h3>
You will meet all of these in existing codebases, so the rough dates are useful.<br><br>

<table>
<tr><th>Version</th><th>Year</th><th>What changed</th></tr>
<tr><td>Spring 1.0</td><td>2003</td><td>First release. Configuration is XML, and only XML.</td></tr>
<tr><td>Spring 2.5</td><td>2007</td><td>Annotations arrive: <code>@Component</code>, <code>@Autowired</code>, component scanning. XML starts to shrink.</td></tr>
<tr><td>Spring 3.0</td><td>2009</td><td>Java configuration (<code>@Configuration</code>, <code>@Bean</code>) and SpEL. XML becomes optional.</td></tr>
<tr><td>Spring 4.0</td><td>2013</td><td>Java 8, lambdas, REST improvements.</td></tr>
<tr><td><strong>Spring Boot 1.0</strong></td><td>2014</td><td>Auto-configuration and starters. This is the point at which most teams stopped writing configuration by hand.</td></tr>
<tr><td>Spring 5.0</td><td>2017</td><td>Reactive stack (WebFlux) alongside the servlet stack.</td></tr>
<tr><td><strong>Spring 6 / Boot 3</strong></td><td>2022</td><td>Java 17 minimum, and <code>javax.*</code> becomes <code>jakarta.*</code>. This rename breaks old code and is the single most common cause of "it compiled last year" errors.</td></tr>
</table>
<br>
The <code>javax</code> to <code>jakarta</code> change is worth remembering now rather than discovering later. On Boot 3, <code>import javax.persistence.Entity;</code> does not resolve - it is <code>import jakarta.persistence.Entity;</code>. Tutorials written before 2022 all use the old package.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>Why "Inversion of Control" Is the Name</h3>
The term predates Spring and describes control of the <em>flow</em>, not just of object creation.<br><br>

In an ordinary library, your code is in charge: you call <code>list.add(x)</code>, the library returns, you carry on. In a framework, that relationship is inverted - the framework runs, and it calls <em>your</em> code at the points it decides. This is sometimes phrased as the <strong>Hollywood Principle</strong>: don't call us, we'll call you.<br><br>

Spring applies that inversion to object assembly specifically. Without it, an object decides its own collaborators by calling <code>new</code>. With it, the object declares what it needs and something external decides what to supply. The decision moves out of the class - which is exactly what makes the class testable, because a test can supply something different.<br><br>

<strong>Dependency Injection</strong> is not a synonym for IoC. IoC is the principle; DI is the specific technique Spring uses to implement it. Service Locator is a different implementation of the same principle - the object asks a registry for its collaborator instead of being handed it. Spring chose injection because it leaves the class with no reference to the framework at all; a Service Locator would put a lookup call inside your code.<br>`
        },
        {
            content: `<h3>What the Container Costs You</h3>
Every real framework has a bill, and being able to name Spring's is the difference between using it and being used by it.<br><br>

<table>
<tr><th>Cost</th><th>What it looks like</th></tr>
<tr><td>Failures move to startup</td><td>A wiring mistake is not a compile error. It surfaces as a <code>NoSuchBeanDefinitionException</code> or <code>UnsatisfiedDependencyException</code> when the context starts - which is still early, but later than the compiler.</td></tr>
<tr><td>Proxies make stack traces deep</td><td><code>@Transactional</code> and AOP work by wrapping your bean in a generated proxy. A stack trace then runs through a dozen frames of Spring internals before it reaches your method.</td></tr>
<tr><td>Self-invocation silently does nothing</td><td>Because those features live in the proxy, a method calling another method <em>on the same object</em> bypasses the proxy. An inner <code>@Transactional</code> or <code>@Cacheable</code> is simply not applied - no error, no warning.</td></tr>
<tr><td>Magic is hard to trace</td><td>Auto-configuration decides a great deal on your behalf. When it decides wrongly, you need <code>--debug</code> and the auto-configuration report to find out why.</td></tr>
</table>
<br>
None of these are arguments against Spring. They are the specific places where "the container is doing it for you" turns into "the container did something I did not expect", and knowing them in advance saves hours.<br>`
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Who created Spring and when?</td><td>Rod Johnson; released in 2003, out of the code published with his 2002 book on J2EE design.</td></tr>
<tr><td>What problem was it solving?</td><td>EJB 2 forced components to implement container interfaces, which made them impossible to run or test outside an application server, and required several files of boilerplate per component.</td></tr>
<tr><td>What is a POJO and why does Spring insist on it?</td><td>A plain Java object that extends and implements nothing framework-specific. It keeps the class independent of Spring, so it can be instantiated and unit tested without a container.</td></tr>
<tr><td>Is Spring Boot a different framework from Spring?</td><td>No. It is a layer on top of the Spring Framework that supplies auto-configuration, starter dependencies and an embedded server. Every Boot application is a Spring application.</td></tr>
<tr><td>Difference between IoC and DI?</td><td>IoC is the principle - something other than the object decides its collaborators. DI is the technique Spring uses to apply it, by passing dependencies in. Service Locator is a different technique for the same principle.</td></tr>
<tr><td>Why is Spring called "lightweight" when the jars are large?</td><td>Lightweight refers to how invasive it is on your code, not to its size on disk. Your classes carry no framework baggage.</td></tr>
<tr><td>What breaks when moving from Boot 2 to Boot 3?</td><td>Java 17 becomes the minimum and every <code>javax.*</code> enterprise package becomes <code>jakarta.*</code> - persistence, servlet, validation. It is a rename, not a redesign, but nothing compiles until it is done.</td></tr>
</table>`
        }
    ]
};
