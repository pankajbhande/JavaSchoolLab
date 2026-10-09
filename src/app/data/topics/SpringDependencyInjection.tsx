import { Topic } from '../coreJava';

export const springDependencyInjection: Topic = {
    id: 'spring-dependency-injection',
    name: 'Dependency Injection (Setter & Constructor)',
    beginner: [
        {
            content: `<h3>What is Dependency Injection?</h3>
The process of passing the required input from the configuration file into the Spring bean class is called <strong>Dependency Injection</strong>.<br><br>

There are two types:<br><br>

<table>
<tr><th>Type</th><th>How it works</th></tr>
<tr><td>Setter-based injection</td><td>The container calls the bean's setter methods to supply each value. Declared with <code>&lt;property&gt;</code>.</td></tr>
<tr><td>Constructor-based injection</td><td>The container calls a parameterised constructor and supplies the values as arguments. Declared with <code>&lt;constructor-arg&gt;</code>.</td></tr>
</table>
<br>
The Spring container knows which one to perform by reading the configuration file - <code>&lt;property&gt;</code> means setter injection, <code>&lt;constructor-arg&gt;</code> means constructor injection.<br>`
        },
        {
            content: `<h3>1. Setter-Based Injection</h3>
<div class="border">
• Achieved through setter methods.<br>
• The container uses the setter in the dependent class to inject its dependencies - primitive values or any other type.<br>
• The class <strong>must</strong> contain a setter for each injected property. Without it the container cannot inject the dependency.<br>
</div><br>

<h3>Steps</h3>
1. Create the new project &nbsp; 2. Create the Spring bean class &nbsp; 3. Add the Maven dependencies &nbsp; 4. Create the test class &nbsp; 5. Create spring.xml &nbsp; 6. Run &nbsp; 7. Check output<br><br>

<h3>Step 1 - Create the Project</h3>
<code>File -> New -> Other -></code> type <em>Maven Project</em> <code>-> Next -></code> tick <code>Create a simple project</code> <code>-> Next</code>. Enter <code>injection</code> as Group Id and <code>DependancyInjectionSetter</code> as Artifact Id, then <code>Finish</code>.<br>`
        },
        {
            content: `<h3>Step 2 - Create the Spring Bean Class</h3>
Note that <code>Student</code> has a setter for <code>city</code> but no getter. Setter injection needs only the setter.<br>`,
            codeExamples: [
                `package com.velocity;

public class Student {

    private String city;

    public void setCity(String city) {
        this.city = city;
    }

    public void getMessage(String name) {
        System.out.println("Hello," + name + "," + city);
    }
}`,
                `<!-- Step 3 - Maven dependencies in pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>\${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>\${spring.version}</version>
    </dependency>
</dependencies>

<properties>
    <spring.version>3.2.3.RELEASE</spring.version>
</properties>`
            ]
        },
        {
            content: `<h3>Steps 4 and 5 - The Test Class and spring.xml</h3>
<code>&lt;property name="city" value="pune"/&gt;</code> tells the container to call <code>setCity("pune")</code> after creating the object.<br>`,
            codeExamples: [
                `package com.velocity;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Test {

    public static void main(String[] args) {

        ApplicationContext ap = new ClassPathXmlApplicationContext("spring.xml");

        Student student = (Student) ap.getBean("s");
        student.getMessage("Velocity corporate training center");
    }
}`,
                `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="s" class="com.velocity.Student">
        <property name="city" value="pune" />
    </bean>

</beans>`,
                `// Steps 6 and 7 - Run as Java Application, then check the console
// OUTPUT:
Hello,Velocity corporate training center,pune

// "pune" came from spring.xml through setCity().
// "Velocity corporate training center" came from the method call.`
            ]
        },
        {
            content: `<h3>2. Constructor-Based Injection</h3>
<div class="border">
• Achieved through a <strong>parameterised constructor</strong>.<br>
• The container uses that constructor to create the bean and assign its properties in one step.<br>
</div><br>

Here <code>Student</code> has three fields and one constructor taking all three. There are no setters at all - and none are needed.<br>`,
            codeExamples: [
                `package com.velocity;

public class Student {

    private String name;
    private String age;
    private String city;

    public Student(String name, String age, String city) {
        this.name = name;
        this.age = age;
        this.city = city;
    }

    @Override
    public String toString() {
        return "Student [name=" + name + ", age=" + age + ", city=" + city + "]";
    }
}`,
                `package com.velocity;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Test {

    public static void main(String[] args) {

        ApplicationContext ap = new ClassPathXmlApplicationContext("spring.xml");

        Student student = (Student) ap.getBean("s");
        System.out.println(student);
    }
}`,
                `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="s" class="com.velocity.Student">
        <constructor-arg value="ashok"></constructor-arg>
        <constructor-arg value="25"></constructor-arg>
        <constructor-arg value="pune"></constructor-arg>
    </bean>

</beans>`,
                `// OUTPUT:
Student [name=ashok, age=25, city=pune]`
            ]
        },
        {
            content: `<h3>Why does <code>index</code> come into the picture?</h3>
Constructor arguments are matched <strong>by position</strong>. Change the order in the XML and the values land in the wrong fields:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">&lt;constructor-arg value="25"/&gt;      -&gt;  goes into  name
&lt;constructor-arg value="ashok"/&gt;   -&gt;  goes into  age
&lt;constructor-arg value="pune"/&gt;    -&gt;  goes into  city

Result: Student [name=25, age=ashok, city=pune]   -- wrong</pre>
<br>
All three parameters are <code>String</code>, so the container cannot tell them apart by type and simply takes them in order. To remove the ambiguity, add an explicit <code>index</code> to each argument. Then the XML order stops mattering.<br>`,
            codeExamples: [
                `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="s" class="com.velocity.Student">
        <constructor-arg value="25"    index="1"></constructor-arg>
        <constructor-arg value="pune"  index="2"></constructor-arg>
        <constructor-arg value="ashok" index="0"></constructor-arg>
    </bean>

</beans>
<!-- OUTPUT: -->
<!-- Student [name=ashok, age=25, city=pune] -->
<!-- The elements are deliberately out of order, and index puts each -->
<!-- value in the right constructor parameter anyway. -->`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Three Ways to Disambiguate Constructor Arguments</h3>
<code>index</code> is the one the example uses, and it is not the only one. All three exist because positional matching is fragile.<br><br>

<table>
<tr><th>Attribute</th><th>What it matches on</th></tr>
<tr><td><code>index="0"</code></td><td>Parameter position, zero-based. Always works, but a reordered constructor silently breaks it.</td></tr>
<tr><td><code>type="int"</code></td><td>Parameter type. Useless when several parameters share a type - which is exactly the case above.</td></tr>
<tr><td><code>name="city"</code></td><td>Parameter name. The clearest of the three, and survives reordering - but the class must be compiled with debug symbols (<code>-parameters</code> or <code>-g</code>) or carry <code>@ConstructorProperties</code>.</td></tr>
</table>`,
            codeExamples: [
                `<!-- name= is the most readable form, and it does not care about order -->
<bean id="s" class="com.velocity.Student">
    <constructor-arg name="city"  value="pune"/>
    <constructor-arg name="name"  value="ashok"/>
    <constructor-arg name="age"   value="25"/>
</bean>
<!-- OUTPUT: -->
<!-- Student [name=ashok, age=25, city=pune] -->
<!-- Requires javac -parameters (Maven: maven.compiler.parameters=true), -->
<!-- otherwise Spring cannot read the parameter names and falls back to -->
<!-- position, which reintroduces the very bug index was added to fix. -->`
            ]
        },
        {
            content: `<h3>Setter vs Constructor Injection - Which to Use</h3>

<table>
<tr><th>Aspect</th><th>Setter injection</th><th>Constructor injection</th></tr>
<tr><td>XML element</td><td>&lt;property&gt;</td><td>&lt;constructor-arg&gt;</td></tr>
<tr><td>Object validity</td><td>The object exists briefly in a half-built state before the setters run</td><td>The object is fully valid the instant the constructor returns</td></tr>
<tr><td>Immutability</td><td>Fields cannot be final - a setter must be able to write them</td><td>Fields can be final, so the bean is immutable and thread-safe</td></tr>
<tr><td>Optional dependencies</td><td>Natural - just do not declare the property</td><td>Awkward - every argument must be supplied</td></tr>
<tr><td>Circular dependency A -&gt; B -&gt; A</td><td>Resolved by Spring for singletons</td><td>Fails at startup with BeanCurrentlyInCreationException</td></tr>
<tr><td>Partial injection</td><td>Possible, and often accidental</td><td>Impossible by construction</td></tr>
<tr><td>Overriding</td><td>A later setter call can overwrite an injected value</td><td>Cannot be overridden after creation</td></tr>
</table>
<br>
<strong>The Spring team's own recommendation is constructor injection for mandatory dependencies and setter injection for genuinely optional ones.</strong> The reason is not style: a class whose constructor takes eight arguments <em>looks</em> like it does too much, and that pressure is useful design feedback. Field injection hides the same eight dependencies and removes the signal.<br>`,
            codeExamples: [
                `// Constructor injection lets the fields be final - the bean cannot be
// left half-built and cannot be mutated afterwards.
@Service
public class OrderService {

    private final PaymentGateway gateway;      // final
    private final OrderRepository repository;  // final

    // Since Spring 4.3, a single constructor needs no @Autowired at all.
    public OrderService(PaymentGateway gateway, OrderRepository repository) {
        this.gateway = gateway;
        this.repository = repository;
    }
}
// OUTPUT:
// If either bean is missing, startup fails immediately with a message
// naming the unsatisfied parameter - never a NullPointerException on
// the first request.`,
                `// The circular-dependency difference, made concrete:

@Component
class A { A(B b) {} }      // constructor injection

@Component
class B { B(A a) {} }
// OUTPUT at startup:
// BeanCurrentlyInCreationException: Error creating bean with name 'a':
// Requested bean is currently in creation: Is there an unresolvable
// circular reference?

@Component
class C { @Autowired D d; }   // field/setter injection

@Component
class D { @Autowired C c; }
// OUTPUT:
// Starts fine on older Spring versions - the cycle is patched up after
// construction. Spring Boot 2.6+ rejects it by default too; re-enable
// with spring.main.allow-circular-references=true, but the cycle is
// almost always a design problem worth fixing instead.`
            ]
        },
        {
            content: `<h3>Injecting Beans, Not Just Values</h3>
Everything above injects Strings. The same two mechanisms inject other beans: use <code>ref</code> instead of <code>value</code>.<br>`,
            codeExamples: [
                `<!-- Setter injection of a collaborating bean -->
<bean id="address" class="com.velocity.Address">
    <property name="pincode" value="411001"/>
</bean>

<bean id="employee" class="com.velocity.Employee">
    <property name="balance" value="8000"/>
    <property name="address" ref="address"/>   <!-- ref, not value -->
</bean>

<!-- Constructor injection of the same collaborator -->
<bean id="employee2" class="com.velocity.Employee">
    <constructor-arg value="8000"/>
    <constructor-arg ref="address"/>
</bean>
<!-- OUTPUT: -->
<!-- employee.getAddress().getPincode() returns 411001 -->
<!-- value= is for literals; ref= points at another bean's id. -->`,
                `<!-- Collections can be injected too -->
<bean id="course" class="com.velocity.Course">

    <property name="topics">
        <list>
            <value>Spring Core</value>
            <value>Spring MVC</value>
            <value>Spring Boot</value>
        </list>
    </property>

    <property name="fees">
        <map>
            <entry key="regular" value="15000"/>
            <entry key="weekend" value="18000"/>
        </map>
    </property>

    <property name="tutors">
        <list>
            <ref bean="tutorA"/>
            <ref bean="tutorB"/>
        </list>
    </property>
</bean>
<!-- OUTPUT: -->
<!-- topics = [Spring Core, Spring MVC, Spring Boot] -->
<!-- fees   = {regular=15000, weekend=18000} -->`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is dependency injection?</td><td>Passing the required input into a bean from outside - from the configuration file or the container - rather than the bean creating it itself.</td></tr>
<tr><td>Which two types does Spring support?</td><td>Setter-based (<code>&lt;property&gt;</code>) and constructor-based (<code>&lt;constructor-arg&gt;</code>).</td></tr>
<tr><td>How does the container decide which one to use?</td><td>By the configuration: a <code>&lt;property&gt;</code> element triggers the setter, a <code>&lt;constructor-arg&gt;</code> element triggers the constructor.</td></tr>
<tr><td>What must the class provide for setter injection?</td><td>A public setter for every injected property. Without it, the container cannot inject and startup fails.</td></tr>
<tr><td>Why is <code>index</code> needed on constructor-arg?</td><td>Arguments are matched by position, so reordering the XML puts values in the wrong parameters - and when several parameters share a type, Spring cannot detect the mistake. <code>index</code> pins each value to a parameter.</td></tr>
<tr><td>Alternatives to <code>index</code>?</td><td><code>type</code> (useless with duplicate types) and <code>name</code> (clearest, but needs <code>-parameters</code> at compile time).</td></tr>
<tr><td>Difference between <code>value</code> and <code>ref</code>?</td><td><code>value</code> injects a literal converted to the target type; <code>ref</code> injects another bean by its id.</td></tr>
<tr><td>Which injection does Spring recommend, and why?</td><td>Constructor injection for mandatory dependencies: the object is never half-built, fields can be final, and a long parameter list exposes a class that is doing too much.</td></tr>
<tr><td>Which injection tolerates circular dependencies?</td><td>Setter/field injection - Spring can patch the cycle after construction. Constructor injection fails fast with <code>BeanCurrentlyInCreationException</code>.</td></tr>
<tr><td>Do you still need <code>@Autowired</code> on a constructor?</td><td>Not since Spring 4.3, if the class has exactly one constructor. With two or more, one must be annotated.</td></tr>
<tr><td>Can setter injection make a field final?</td><td>No - a setter must be able to assign it. That is a real advantage of constructor injection.</td></tr>
</table>`
        }
    ]
};
