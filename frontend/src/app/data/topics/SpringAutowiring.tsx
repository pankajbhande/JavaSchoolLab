import { Topic } from '../coreJava';

export const springAutowiring: Topic = {
    id: 'spring-autowiring',
    name: 'Autowiring',
    beginner: [
        {
            content: `<h3>What is Autowiring?</h3>
Autowiring is the Spring feature that lets the container <strong>inject object dependencies automatically</strong>, without you naming them in the configuration file.<br><br>

<h3>Why?</h3>
Suppose <code>Employee</code> depends on <code>Address</code>. Without autowiring you wire the reference by hand:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">&lt;bean id="a" class="com.velocity.Address"&gt;
    &lt;property name="pincode" value="123456"/&gt;
&lt;/bean&gt;

&lt;bean id="e" class="com.velocity.Employee"&gt;
    &lt;property name="balance" value="8000"/&gt;
    &lt;property name="address" ref="a"/&gt;      &lt;-- written by hand
&lt;/bean&gt;</pre>
<br>
That <code>ref="a"</code> is the line autowiring removes. The container works out for itself which bean fits, creates it, and injects it - so the same work gets done with no XML for it.<br><br>

<table>
<tr><th>Point</th><th>Detail</th></tr>
<tr><td>Advantage</td><td>Less code - the wiring lines disappear from the configuration file.</td></tr>
<tr><td>Disadvantage</td><td>Autowiring cannot be applied to primitive data types. Only secondary (reference) types can be injected.</td></tr>
<tr><td>Injection style</td><td>You can autowire through either the setter method or the constructor.</td></tr>
</table>`
        },
        {
            content: `<h3>The Two Ways to Autowire</h3>

<table>
<tr><th>Approach</th><th>Meaning</th></tr>
<tr><td>XML based</td><td>The <code>autowire</code> attribute on a <code>&lt;bean&gt;</code> element. Four modes: byType, byName, constructor, autodetect.</td></tr>
<tr><td>Annotation based</td><td><code>@Autowired</code> on a field, setter or constructor. No XML wiring at all.</td></tr>
</table>

<h3>The four XML modes</h3>

<table>
<tr><th>Mode</th><th>How the match is made</th></tr>
<tr><td>byType</td><td>The data type of the property must match the class of a bean declared in the configuration file. Uses setter injection internally.</td></tr>
<tr><td>byName</td><td>The name of the property must match the id/name of a bean in the configuration file. Uses setter injection internally.</td></tr>
<tr><td>constructor</td><td>Matches constructor parameters by type. Uses constructor injection.</td></tr>
<tr><td>autodetect</td><td>Tries constructor first, and falls back to byType. Uses both styles.</td></tr>
</table>`
        },
        {
            content: `<h3>1. byType</h3>
<div class="border">
• The data type of the attribute must be the same as the data type of a bean defined in the configuration file.<br>
• It uses setter-based injection internally, so the setter must exist.<br>
</div><br>

<h3>Steps</h3>
1. Create the Maven project &nbsp; 2. Add the Spring dependencies &nbsp; 3. Create the bean classes &nbsp; 4. Create spring.xml &nbsp; 5. Create the test class &nbsp; 6. Run the application<br><br>

The two bean classes are the same in every example below: <code>Policy</code> holds the plan details, and <code>Categories</code> holds a <code>Policy</code>.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
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
    <spring.version>4.2.3.RELEASE</spring.version>
</properties>`,
                `// Step 3 - Policy.java
package com.spring.auto;

public class Policy {

    private String planName;
    private int planAmount;

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public int getPlanAmount() { return planAmount; }
    public void setPlanAmount(int planAmount) { this.planAmount = planAmount; }
}`,
                `// Step 3 - Categories.java
package com.spring.auto;

// NOTE: do NOT let the IDE import java.security.Policy here.
// Policy is our own class in this same package, so no import is needed at all.

public class Categories {

    private String name;
    private Policy policy;          // the dependency Spring will autowire

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Policy getPolicy() { return policy; }
    public void setPolicy(Policy policy) { this.policy = policy; }

    public void show() {
        System.out.println("Categories name>>" + name);
        System.out.println("Policy Name>>" + policy.getPlanName());
        System.out.println("Policy Amount>>" + policy.getPlanAmount());
    }
}`,
                `<!-- Step 4 - spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="categories" class="com.spring.auto.Categories" autowire="byType">
        <property name="name" value="Life Insurance" />
        <!-- no <property name="policy" ref="..."/> -- autowiring supplies it -->
    </bean>

    <bean id="policy" class="com.spring.auto.Policy">
        <property name="planName" value="Term Plan" />
        <property name="planAmount" value="8500" />
    </bean>

</beans>`,
                `// Step 5 - Test.java
package com.spring.auto;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.xml.XmlBeanFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

public class Test {

    public static void main(String[] args) {

        Resource res = new ClassPathResource("spring.xml");
        BeanFactory factory = new XmlBeanFactory(res);

        Categories categories = (Categories) factory.getBean("categories");
        categories.show();
    }
}
// OUTPUT:
// Categories name>>Life Insurance
// Policy Name>>Term Plan
// Policy Amount>>8500`
            ]
        },
        {
            content: `<h3>byType - Program Explanation</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1. The BeanFactory object is created
       BeanFactory factory = new XmlBeanFactory(resource);
       |
       v
2. The container reads the next line of Test.java
       Categories categories = (Categories) factory.getBean("categories");
       |
       v
3. It goes to spring.xml, finds bean id="categories", and reads autowire="byType"
       &lt;bean id="categories" class="com.spring.auto.Categories" autowire="byType"&gt;
       |
       v
4. It scans Categories.java for properties that need injecting and finds
       private Policy policy;
       |
       v
5. It looks through spring.xml for a bean whose CLASS is com.spring.auto.Policy
       &lt;bean id="policy" class="com.spring.auto.Policy"&gt;      -- type matches
       |
       v
6. The Policy object is injected into Categories via setPolicy()
       |
       v
7. Control returns to Test.java and categories.show() runs</pre>
<br>
<strong>Note:</strong> rename the bean to <code>id="p"</code> and the program still works. byType never looks at the id - only at the class.<br>`
        },
        {
            content: `<h3>2. byName</h3>
<div class="border">
• The <strong>name of the attribute</strong> must be the same as the bean id/name in the configuration file.<br>
• It uses setter-based injection internally.<br>
</div><br>

The Java classes are unchanged. Only the <code>autowire</code> value differs.<br>`,
            codeExamples: [
                `<!-- spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="policy" class="com.spring.auto.Policy">
        <property name="planName" value="Term Plan" />
        <property name="planAmount" value="8500" />
    </bean>

    <bean id="categories" class="com.spring.auto.Categories" autowire="byName">
        <property name="name" value="Life Insurance" />
    </bean>

</beans>
<!-- OUTPUT: -->
<!-- Categories name>>Life Insurance -->
<!-- Policy Name>>Term Plan -->
<!-- Policy Amount>>8500 -->`
            ]
        },
        {
            content: `<h3>byName - Program Explanation</h3>
The flow is the same as byType up to step 4. The matching step is what changes:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">4. Container finds the property in Categories.java
       private Policy policy;          -- property NAME is "policy"
       |
       v
5. It looks for a bean whose ID is exactly "policy"
       &lt;bean id="policy" class="com.spring.auto.Policy"&gt;   -- name matches
       |
       v
6. setPolicy() is called with that bean</pre>
<br>
<strong>Note:</strong> with byName the bean id in spring.xml and the field name in <code>Categories.java</code> <strong>must be identical</strong>. Rename the bean to <code>id="p"</code> and the field is silently left <code>null</code> - <code>show()</code> then throws a <code>NullPointerException</code> on <code>policy.getPlanName()</code>. This is the opposite of byType, where the id is irrelevant.<br>`
        },
        {
            content: `<h3>3. constructor</h3>
This mode uses constructor-based injection: the container matches the constructor parameters by type. Both classes now have parameterised constructors instead of setters.<br>`,
            codeExamples: [
                `// Policy.java
package com.spring.auto;

public class Policy {

    private String planName;
    private String planAmount;

    public Policy(String planName, String planAmount) {
        this.planName = planName;
        this.planAmount = planAmount;
    }

    public String getPlanName() { return planName; }
    public String getPlanAmount() { return planAmount; }
}`,
                `// Categories.java
package com.spring.auto;

public class Categories {

    private String name;
    private Policy policy;

    public Categories(String name, Policy policy) {
        this.name = name;
        this.policy = policy;
    }

    public void show() {
        System.out.println("Categories name>>" + name);
        System.out.println("Policy Name>>" + policy.getPlanName());
        System.out.println("Policy Amount>>" + policy.getPlanAmount());
    }
}`,
                `<!-- spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="categories" class="com.spring.auto.Categories" autowire="constructor">
        <constructor-arg value="Life Insurance"></constructor-arg>
        <!-- the Policy argument is supplied by autowiring, by type -->
    </bean>

    <bean id="policy" class="com.spring.auto.Policy">
        <constructor-arg value="Term Plan"></constructor-arg>
        <constructor-arg value="8500"></constructor-arg>
    </bean>

</beans>
<!-- OUTPUT: -->
<!-- Categories name>>Life Insurance -->
<!-- Policy Name>>Term Plan -->
<!-- Policy Amount>>8500 -->`
            ]
        },
        {
            content: `<h3>4. autodetect</h3>
It uses <strong>both</strong> styles: the container looks for a suitable parameterised constructor first, and if the bean has none it falls back to byType with setters. The classes here are the setter-based versions from the byType example.<br><br>

<strong>Note:</strong> with the constructor mode and with autodetect, the bean id and the field name do <em>not</em> have to match - matching is by type. Only byName requires them to be the same.<br>`,
            codeExamples: [
                `<!-- spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="categories" class="com.spring.auto.Categories" autowire="autodetect">
        <property name="name" value="Life Insurance" />
    </bean>

    <bean id="policy" class="com.spring.auto.Policy">
        <property name="planName" value="Term Plan" />
        <property name="planAmount" value="8500" />
    </bean>

</beans>
<!-- OUTPUT: -->
<!-- Categories name>>Life Insurance -->
<!-- Policy Name>>Term Plan -->
<!-- Policy Amount>>8500 -->
<!-- Categories has no parameterised constructor, so autodetect -->
<!-- fell back to byType and used setPolicy(). -->`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Four Modes Side by Side</h3>

<table>
<tr><th>Aspect</th><th>byType</th><th>byName</th><th>constructor</th></tr>
<tr><td>Matches on</td><td>Property type vs bean class</td><td>Property name vs bean id</td><td>Constructor parameter type</td></tr>
<tr><td>Injection used</td><td>Setter</td><td>Setter</td><td>Constructor</td></tr>
<tr><td>Setter required?</td><td>Yes</td><td>Yes</td><td>No</td></tr>
<tr><td>Bean id must match field name?</td><td>No</td><td>Yes</td><td>No</td></tr>
<tr><td>Two candidate beans of the type</td><td>Startup fails - ambiguous</td><td>Fine - the id decides</td><td>Startup fails - ambiguous</td></tr>
<tr><td>No candidate found</td><td>Field left null, silently</td><td>Field left null, silently</td><td>Startup fails</td></tr>
</table>
<br>
That last row is the one that bites. XML autowiring by type or name is <strong>silent on failure</strong>: no matching bean simply means the property is never set, and you find out with a <code>NullPointerException</code> the first time the field is used. Set <code>dependency-check</code> (Spring 2.x) or, far better, use <code>@Autowired</code>, which is required by default and fails at startup with a message naming the missing bean.<br>`,
            codeExamples: [
                `<!-- byType with two Policy beans -->
<bean id="term"     class="com.spring.auto.Policy"/>
<bean id="endowment" class="com.spring.auto.Policy"/>

<bean id="categories" class="com.spring.auto.Categories" autowire="byType"/>
<!-- OUTPUT at startup: -->
<!-- UnsatisfiedDependencyException: -->
<!--   expected single matching bean but found 2: term,endowment -->

<!-- byName has no such problem - the field name "policy" picks exactly one -->
<bean id="policy" class="com.spring.auto.Policy"/>`
            ]
        },
        {
            content: `<h3>autowire="autodetect" Is Gone</h3>
<code>autodetect</code> was deprecated in Spring 3.0 and <strong>removed in Spring 4.0</strong>, along with <code>dependency-check</code>. It is shown above because it appears in course material and in pre-4.0 projects, but a Spring 4+ container rejects it:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">org.xml.sax.SAXParseException: cvc-enumeration-valid: Value 'autodetect'
  is not facet-valid with respect to enumeration
  '[default, no, byName, byType, constructor]'</pre>
<br>
The reason it was dropped is the reason it was always risky: "constructor if there is one, otherwise byType" means <em>adding a constructor to a class silently changes how it is wired</em>. Explicit is better. In new code, use <code>@Autowired</code> on a constructor and be done.<br>`
        },
        {
            content: `<h3>Annotation-Based Autowiring - What You Will Actually Write</h3>
XML autowiring is worth understanding because it names the matching rules precisely. Real projects use annotations, and the rules carry straight over: <code>@Autowired</code> matches <strong>by type</strong>, exactly like <code>byType</code>, and falls back to the field or parameter <strong>name</strong> when two candidates tie - which is <code>byName</code> acting as the tie-breaker.<br><br>

<table>
<tr><th>Annotation</th><th>Purpose</th></tr>
<tr><td>@Autowired</td><td>Spring's own. Injects by type; <code>required = false</code> makes the dependency optional.</td></tr>
<tr><td>@Qualifier("name")</td><td>Names the bean to use when several match by type. This is the fix for the ambiguity error.</td></tr>
<tr><td>@Primary</td><td>On the bean class. Marks one candidate as the default, so injection points need no @Qualifier.</td></tr>
<tr><td>@Resource(name="...")</td><td>JSR-250. Matches by name first, then by type - effectively byName.</td></tr>
<tr><td>@Inject</td><td>JSR-330. Behaves like @Autowired but has no <code>required</code> attribute.</td></tr>
</table>
<br>
To make annotations work in an XML project, add <code>&lt;context:annotation-config/&gt;</code> or <code>&lt;context:component-scan base-package="com.spring.auto"/&gt;</code>. Spring Boot does this for you.<br>`,
            codeExamples: [
                `// Resolving the "expected single matching bean but found 2" error
@Component("term")      class TermPolicy      implements Policy { }
@Component("endowment") class EndowmentPolicy implements Policy { }

@Component
public class Categories {

    private final Policy policy;

    // @Qualifier picks the one we want; without it, startup fails.
    public Categories(@Qualifier("term") Policy policy) {
        this.policy = policy;
    }
}
// OUTPUT:
// TermPolicy is injected. Marking TermPolicy @Primary instead would
// achieve the same thing without touching the injection point.`,
                `// Injecting EVERY implementation - not an error, a feature
@Component
public class PolicyReport {

    private final List<Policy> allPolicies;      // both beans, in order
    private final Map<String, Policy> byName;    // keyed by bean name

    public PolicyReport(List<Policy> allPolicies, Map<String, Policy> byName) {
        this.allPolicies = allPolicies;
        this.byName = byName;
    }
}
// OUTPUT:
// allPolicies = [TermPolicy, EndowmentPolicy]
// byName      = {term=TermPolicy, endowment=EndowmentPolicy}
// Add a third implementation and it appears here with no config change.`,
                `// Optional dependencies - three equivalent spellings
@Autowired(required = false)
private AuditService audit;              // null when no bean exists

@Autowired
private Optional<AuditService> audit2;   // empty Optional

@Autowired
private ObjectProvider<AuditService> audit3;   // lazy lookup, best of the three
// OUTPUT:
// None of these fail at startup when AuditService is absent.
// A plain @Autowired field WOULD fail - which is usually what you want.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is autowiring?</td><td>Letting the container inject object dependencies automatically instead of naming them with <code>ref</code> in the configuration file.</td></tr>
<tr><td>What are the XML autowire modes?</td><td>no (default), byName, byType, constructor - plus autodetect, which existed until Spring 4.0.</td></tr>
<tr><td>Can autowiring inject primitives?</td><td>No. Only secondary/reference types. Primitives and Strings must be set with <code>value</code>.</td></tr>
<tr><td>Difference between byType and byName?</td><td>byType matches the property's type against a bean's class and ignores ids; byName matches the property's name against a bean id and ignores types.</td></tr>
<tr><td>With byName, must the bean id equal the field name?</td><td>Yes. If it does not, the property is silently left null and you get a NullPointerException on first use.</td></tr>
<tr><td>What happens with byType if two beans of the type exist?</td><td>Startup fails with "expected single matching bean but found 2". Fix it with @Qualifier, @Primary, or by switching to byName.</td></tr>
<tr><td>What does autowire="constructor" do?</td><td>Matches constructor parameters by type and uses constructor injection, so no setters are needed.</td></tr>
<tr><td>Is autodetect still available?</td><td>No - deprecated in Spring 3.0, removed in 4.0, because adding a constructor to a class silently changed how it was wired.</td></tr>
<tr><td>Does @Autowired match by type or by name?</td><td>By type first; the field or parameter name is used only to break a tie between equally valid candidates.</td></tr>
<tr><td>@Autowired vs @Resource?</td><td>@Autowired (Spring) is by type with name as tie-breaker; @Resource (JSR-250) is by name first, then by type.</td></tr>
<tr><td>How do you make an autowired dependency optional?</td><td><code>@Autowired(required = false)</code>, or declare the field as <code>Optional&lt;T&gt;</code> or <code>ObjectProvider&lt;T&gt;</code>.</td></tr>
<tr><td>What is the main risk of XML autowiring?</td><td>It fails silently: no matching bean means the property is simply never set, and the error surfaces much later as a NullPointerException.</td></tr>
</table>`
        }
    ]
};
