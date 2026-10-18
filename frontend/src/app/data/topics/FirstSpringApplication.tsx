import { Topic } from '../coreJava';

export const firstSpringApplication: Topic = {
    id: 'first-spring-application',
    name: 'First Simple Spring Application',
    beginner: [
        {
            content: `<h3>What You Need</h3>
Three pieces build the first Spring application, and nothing else:<br><br>

<table>
<tr><th>Piece</th><th>Purpose</th></tr>
<tr><td>Spring bean class (.java)</td><td>A plain POJO with private fields and getters/setters. This is the object the container will create for you.</td></tr>
<tr><td>Spring configuration file (.xml)</td><td>Declares the bean and the values to inject into it.</td></tr>
<tr><td>Main application class (.java)</td><td>Creates the container, asks it for the bean, and uses it.</td></tr>
</table>

<h3>Internal Working of Spring</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">STARTUP
  1.1  BeanFactory object is created
  1.2  The Spring configuration file is injected into the BeanFactory
  1.3  Spring bean (POJO) object is created and stored inside the IoC container

REQUEST
  2.1  getBean() is invoked from your main method
  2.2  The container looks up and returns the Student object
  2.3  The bean object is handed to your program</pre>
<br>
<strong>Two notes:</strong><br>
1. If you use <code>ApplicationContext</code> instead, an ApplicationContext object is created rather than a BeanFactory - the rest of the flow is identical.<br>
2. The configuration file may be named <code>spring.xml</code>, <code>applicationContext.xml</code>, or anything else; you pass whatever name you chose.<br>`
        },
        {
            content: `<h3>Maven - the Build Automation Tool</h3>
Maven is a project management tool based on the <strong>POM</strong> (Project Object Model). It handles the build, the dependencies and the documentation of a project.<br><br>

<h3>Why Maven?</h3>
Adding jars by hand is painful and error-prone. With Spring or Hibernate you must match exact, compatible versions across a dozen jars, and one mismatch produces a runtime failure that is hard to trace. Instead you declare a dependency in <code>pom.xml</code>; Maven downloads the jar from the central repository, stores it in your local repository, and adds it to the project.<br><br>

<h3>What is pom.xml?</h3>
It holds the project information and the configuration Maven needs to build it - dependencies, build directory, source directory, test source directory, plugins and goals.<br><br>

<table>
<tr><th>Element</th><th>Meaning</th></tr>
<tr><td>project</td><td>The root element of the pom.xml file.</td></tr>
<tr><td>modelVersion</td><td>Sub-element of project. Set to 4.0.0.</td></tr>
<tr><td>groupId</td><td>The id of the project group - unique across the organisation.</td></tr>
<tr><td>artifactId</td><td>The project name.</td></tr>
<tr><td>version</td><td>The project version, e.g. 0.0.1-SNAPSHOT.</td></tr>
</table>`
        },
        {
            content: `<h3>Steps to Create the Spring Maven Project</h3>

<div class="border">
1. Create a new project<br>
2. Create the Spring bean class<br>
3. Add the Maven dependencies to pom.xml<br>
4. Create the test class with the main method<br>
5. Create the spring.xml file<br>
6. Run the Spring application<br>
7. Check the output<br>
</div><br>

<h3>Step 1 - Create a New Project</h3>
<code>File -> New -> Other -> </code>type <em>Maven Project</em> in the wizard <code>-> Next</code>. Tick <code>Create a simple project</code>, click <code>Next</code>, then enter <code>spring</code> as the Group Id and <code>SpringDemoExample</code> as the Artifact Id, and click <code>Finish</code>.<br><br>

<table>
<tr><th>Field</th><th>Meaning</th></tr>
<tr><td>Group Id</td><td>The project id, unique throughout the application.</td></tr>
<tr><td>Artifact Id</td><td>The project name.</td></tr>
</table>`
        },
        {
            content: `<h3>Step 2 - Create the Spring Bean Class</h3>
A POJO with private fields and public getters and setters. Nothing in it refers to Spring.<br>`,
            codeExamples: [
                `package com.test;

public class Student {

    private String firstName;
    private String age;
    private String city;

    // Apply Getter & Setter

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getAge() { return age; }
    public void setAge(String age) { this.age = age; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    @Override
    public String toString() {
        return "Student [firstName=" + firstName + ", age=" + age + ", city=" + city + "]";
    }
}`
            ]
        },
        {
            content: `<h3>Step 3 - Add the Maven Dependencies</h3>
<code>spring-core</code> gives you the IoC container itself; <code>spring-context</code> adds ApplicationContext on top of it. The version is declared once as a property so both stay in step.<br>`,
            codeExamples: [
                `<dependencies>
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
    <spring.version>4.2.3.RELEASE</spring.version>
</properties>`
            ]
        },
        {
            content: `<h3>Step 4 - Create the Test Class with the main Method</h3>
This is where the container is created and the bean is fetched. <code>getBean("s")</code> uses the same id that the XML declares.<br>`,
            codeExamples: [
                `package com.test;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.xml.XmlBeanFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

public class Test {

    public static void main(String[] args) {

        Resource resource = new ClassPathResource("spring.xml");
        BeanFactory beanFactory = new XmlBeanFactory(resource);

        Student student = (Student) beanFactory.getBean("s");

        System.out.println("Student data>>" + student);
    }
}`
            ]
        },
        {
            content: `<h3>Step 5 - Create the spring.xml File</h3>
<strong>Always create the XML file in <code>src/main/resources</code>, nowhere else</strong> - that is the folder Maven puts on the classpath, and <code>ClassPathResource</code> looks there.<br><br>

<div class="border">
5.1 Right-click <code>src/main/resources</code> then <code>New -> Other</code><br>
5.2 Type <em>xml</em> in the wizard search box<br>
5.3 Scroll down and select <code>XML File</code><br>
5.4 Click <code>Next</code><br>
5.5 Type <code>spring</code> in place of <em>NewFile</em>, click <code>Next</code><br>
5.6 Click <code>Next</code><br>
5.7 Click <code>Finish</code><br>
</div><br>

Each <code>&lt;property&gt;</code> element names a field and the value to set on it. Spring calls the matching setter for you.<br>`,
            codeExamples: [
                `<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="s" class="com.test.Student">
        <property name="firstName" value="ram"></property>
        <property name="age" value="25"></property>
        <property name="city" value="pune"></property>
    </bean>

</beans>`
            ]
        },
        {
            content: `<h3>Steps 6 and 7 - Run It and Check the Output</h3>
Open the <code>Test</code> class, then <code>Right click -> Run As -> Java Application</code>.<br>`,
            codeExamples: [
                `// Console output:
Student data>>Student [firstName=ram, age=25, city=pune]

// You never wrote "new Student()" and you never called a single setter.
// The container read spring.xml, created the object, and injected all
// three values before handing it to you.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The <code>class</code> Attribute Must Be the Fully Qualified Name</h3>
The most common first-run failure in this example is a mismatch between the package in the Java file and the package written in the XML. The bean class is declared as <code>com.test.Student</code>, so the Java file must begin with <code>package com.test;</code>. Change one and not the other and you get:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">org.springframework.beans.factory.CannotLoadBeanClassException:
  Cannot find class [com.velocity.Student] for bean with name 's'
  defined in class path resource [spring.xml];
  nested exception is java.lang.ClassNotFoundException: com.velocity.Student</pre>
<br>
The second most common is putting <code>spring.xml</code> in <code>src/main/java</code> instead of <code>src/main/resources</code>, which produces:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">java.io.FileNotFoundException: class path resource [spring.xml]
  cannot be opened because it does not exist</pre>
<br>
Both messages name the exact cause. Read the class name and the resource name in the stack trace before changing anything.<br>`
        },
        {
            content: `<h3>getBean() by Name vs by Type</h3>
<code>getBean("s")</code> returns <code>Object</code> and forces a cast, so a typo in the id is only discovered at runtime, and a wrong cast throws <code>ClassCastException</code>. Every modern overload takes the type as well.<br>`,
            codeExamples: [
                `// 1. By name - returns Object, needs a cast (the old style)
Student a = (Student) context.getBean("s");

// 2. By name AND type - no cast, and a type mismatch fails clearly
Student b = context.getBean("s", Student.class);

// 3. By type alone - no string at all, so a typo is a compile error
Student c = context.getBean(Student.class);
// OUTPUT:
// All three return the same singleton instance.
// Form 3 throws NoUniqueBeanDefinitionException if two Student
// beans are declared, which is exactly the error you want.`,
                `// What the exceptions look like when the lookup fails:

context.getBean("student");
// NoSuchBeanDefinitionException: No bean named 'student' available

// bean id="s" declared as class com.test.Teacher
Student s = (Student) context.getBean("s");
// ClassCastException: com.test.Teacher cannot be cast to com.test.Student`
            ]
        },
        {
            content: `<h3>Close the Context - or Lose the Destroy Callbacks</h3>
A container holds singletons and their resources. If the program ends without closing it, <code>@PreDestroy</code> and <code>destroy-method</code> never run: connection pools are not drained, files are not flushed.<br><br>

<code>ClassPathXmlApplicationContext</code> implements <code>AutoCloseable</code>, so try-with-resources is the tidy form.<br>`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {

        try (ClassPathXmlApplicationContext ctx =
                     new ClassPathXmlApplicationContext("spring.xml")) {

            Student student = ctx.getBean("s", Student.class);
            System.out.println("Student data>>" + student);
        }   // ctx.close() runs here -> destroy callbacks fire
    }
}
// OUTPUT:
// Student data>>Student [firstName=ram, age=25, city=pune]
// (and any @PreDestroy method on any singleton now runs)`
            ]
        },
        {
            content: `<h3>The Same Application Without XML</h3>
The XML version is the clearest way to see what the container does. This is the identical application written the way current projects write it - useful to compare side by side, because every XML element has a direct counterpart.<br><br>

<table>
<tr><th>XML form</th><th>Annotation / Java-config form</th></tr>
<tr><td><code>&lt;bean id="s" class="..."&gt;</code></td><td><code>@Component</code> on the class, or a <code>@Bean</code> method</td></tr>
<tr><td><code>&lt;property name="city" value="pune"/&gt;</code></td><td><code>@Value("pune")</code> on the field, or a setter call inside <code>@Bean</code></td></tr>
<tr><td><code>&lt;context:component-scan base-package="com.test"/&gt;</code></td><td><code>@ComponentScan("com.test")</code></td></tr>
<tr><td><code>new ClassPathXmlApplicationContext("spring.xml")</code></td><td><code>new AnnotationConfigApplicationContext(AppConfig.class)</code></td></tr>
</table>`,
            codeExamples: [
                `package com.test;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component("s")
public class Student {

    @Value("ram")   private String firstName;
    @Value("25")    private String age;
    @Value("pune")  private String city;

    @Override
    public String toString() {
        return "Student [firstName=" + firstName + ", age=" + age + ", city=" + city + "]";
    }
}`,
                `package com.test;

import org.springframework.context.annotation.*;

@Configuration
@ComponentScan("com.test")
public class AppConfig { }

public class Test {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext ctx =
                     new AnnotationConfigApplicationContext(AppConfig.class)) {

            Student student = ctx.getBean(Student.class);
            System.out.println("Student data>>" + student);
        }
    }
}
// OUTPUT:
// Student data>>Student [firstName=ram, age=25, city=pune]
// Identical result, zero XML.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What three things does a minimal Spring application need?</td><td>A bean class (POJO), a configuration file declaring the bean, and a main class that creates the container and calls <code>getBean()</code>.</td></tr>
<tr><td>Where must spring.xml be placed and why?</td><td><code>src/main/resources</code>. Maven copies that folder onto the classpath, which is where <code>ClassPathResource</code> looks.</td></tr>
<tr><td>What does the <code>id</code> attribute of a bean do?</td><td>Names the bean so <code>getBean("id")</code> can find it, and so other beans can reference it with <code>ref="id"</code>.</td></tr>
<tr><td>What does <code>&lt;property&gt;</code> do internally?</td><td>Spring calls the matching setter - <code>&lt;property name="city"&gt;</code> calls <code>setCity()</code>. Without that setter, injection fails.</td></tr>
<tr><td>What is Maven and why use it here?</td><td>A POM-based build tool that downloads dependencies from a central repository into your local one, so you never match jar versions by hand.</td></tr>
<tr><td>Difference between groupId and artifactId?</td><td>groupId is the organisation/project group id, unique across the organisation; artifactId is the project name.</td></tr>
<tr><td>Difference between spring-core and spring-context?</td><td>spring-core carries the BeanFactory and the base IoC machinery; spring-context builds ApplicationContext on it, adding events, i18n, scheduling and annotation config.</td></tr>
<tr><td>Why prefer <code>getBean(Student.class)</code> over <code>getBean("s")</code>?</td><td>No cast, and a wrong name becomes a compile error rather than a runtime <code>NoSuchBeanDefinitionException</code>.</td></tr>
<tr><td>What happens if you never close the context?</td><td>Destroy callbacks (<code>@PreDestroy</code>, <code>destroy-method</code>) never run, so pooled resources are not released.</td></tr>
<tr><td>Bean class in XML does not match the package - what error?</td><td><code>CannotLoadBeanClassException</code> wrapping a <code>ClassNotFoundException</code> that names the class it could not find.</td></tr>
</table>`
        }
    ]
};
