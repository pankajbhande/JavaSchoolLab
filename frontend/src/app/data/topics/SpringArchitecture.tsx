import { Topic } from '../coreJava';

export const springArchitecture: Topic = {
    id: 'sb-spring-architecture',
    name: "Spring Architecture",
    beginner: [
        {
            content: `<h3>Spring Is Not One Jar</h3>
The Spring Framework is a set of around twenty separate modules, each shipped as its own jar. You add only the ones you need. A batch job that never serves a web request does not carry Spring MVC; a REST service that never touches a database does not carry Spring ORM.<br><br>

The modules are grouped into five areas, and they stack - the ones above depend on the ones below, never the other way round.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   +-------------------------------------------------------------+
   |                        TEST                                 |
   |            spring-test  (mock objects, TestContext)         |
   +-------------------------------------------------------------+

   +----------------------------+  +-----------------------------+
   |   DATA ACCESS / INTEGRATION|  |            WEB              |
   |   spring-jdbc              |  |   spring-web                |
   |   spring-orm               |  |   spring-webmvc             |
   |   spring-oxm               |  |   spring-webflux            |
   |   spring-jms               |  |   spring-websocket          |
   |   spring-tx                |  |                             |
   +----------------------------+  +-----------------------------+

   +-------------------------------------------------------------+
   |            AOP  |  ASPECTS  |  INSTRUMENTATION              |
   |     spring-aop  |  spring-aspects  |  spring-instrument      |
   +-------------------------------------------------------------+

   +-------------------------------------------------------------+
   |                     CORE CONTAINER                          |
   |   spring-core | spring-beans | spring-context | spring-expression
   +-------------------------------------------------------------+</pre>
<br>
Read it bottom-up. Everything rests on the Core Container. Nothing in the Core Container knows that the web or data layers exist.<br>`
        },
        {
            content: `<h3>The Core Container - the Part That Is Always There</h3>
These four jars are Spring. Every other module is an addition to them.<br><br>

<table>
<tr><th>Module</th><th>What it does</th></tr>
<tr><td><code>spring-core</code></td><td>The foundation: utility classes, the resource abstraction (<code>Resource</code>, <code>ClassPathResource</code>), and type conversion. Nothing above it works without it.</td></tr>
<tr><td><code>spring-beans</code></td><td>The bean factory itself - bean definitions, instantiation, and dependency injection. This is where <code>BeanFactory</code> lives.</td></tr>
<tr><td><code>spring-context</code></td><td>Builds <code>ApplicationContext</code> on top of the bean factory and adds the enterprise services: events, internationalisation, resource loading, scheduling, and annotation configuration (<code>@Component</code>, <code>@Configuration</code>).</td></tr>
<tr><td><code>spring-expression</code></td><td>SpEL - the expression language used inside <code>@Value("\${...}")</code>, <code>@PreAuthorize</code> and XML configuration.</td></tr>
</table>
<br>
The split between <code>spring-beans</code> and <code>spring-context</code> is the split between <code>BeanFactory</code> and <code>ApplicationContext</code>: the first is the container, the second is the container plus everything an application actually needs around it. In practice you always use <code>ApplicationContext</code>.<br>`
        },
        {
            content: `<h3>The Layers Above</h3>

<table>
<tr><th>Area</th><th>Module</th><th>Purpose</th></tr>
<tr><td rowspan="3"><strong>AOP</strong></td><td><code>spring-aop</code></td><td>Proxy-based aspect support. This is what makes <code>@Transactional</code>, <code>@Cacheable</code> and <code>@Async</code> work at all.</td></tr>
<tr><td><code>spring-aspects</code></td><td>Integration with AspectJ, for the cases proxies cannot handle.</td></tr>
<tr><td><code>spring-instrument</code></td><td>Class instrumentation via a Java agent. Rare.</td></tr>
<tr><td rowspan="5"><strong>Data Access</strong></td><td><code>spring-jdbc</code></td><td><code>JdbcTemplate</code> and the exception translation that turns vendor <code>SQLException</code> codes into Spring's <code>DataAccessException</code> hierarchy.</td></tr>
<tr><td><code>spring-orm</code></td><td>Integration with JPA and Hibernate.</td></tr>
<tr><td><code>spring-tx</code></td><td>Transaction management - both programmatic and the declarative <code>@Transactional</code>.</td></tr>
<tr><td><code>spring-oxm</code></td><td>Object/XML mapping (JAXB and friends).</td></tr>
<tr><td><code>spring-jms</code></td><td>JMS messaging.</td></tr>
<tr><td rowspan="4"><strong>Web</strong></td><td><code>spring-web</code></td><td>The shared web basics: multipart handling, HTTP clients, and the servlet integration both web stacks build on.</td></tr>
<tr><td><code>spring-webmvc</code></td><td>The servlet stack - <code>DispatcherServlet</code>, <code>@Controller</code>, view resolution. Thread-per-request, blocking.</td></tr>
<tr><td><code>spring-webflux</code></td><td>The reactive stack - non-blocking, event-loop based. An alternative to webmvc, not an addition to it.</td></tr>
<tr><td><code>spring-websocket</code></td><td>WebSocket and STOMP support.</td></tr>
<tr><td><strong>Test</strong></td><td><code>spring-test</code></td><td>Loads an application context inside JUnit, plus <code>MockMvc</code> and the mock servlet objects.</td></tr>
</table>
<br>
<strong>Note on the two web stacks:</strong> <code>spring-webmvc</code> and <code>spring-webflux</code> are alternatives. Putting both on the classpath is legal but Spring Boot will pick MVC and ignore WebFlux, which is a common source of confusion.<br>`
        },
        {
            content: `<h3>Where Spring Boot Fits</h3>
Spring Boot does not replace any of these modules. It sits above them and does two things: it chooses which of them you get, and it configures them.<br><br>

That is what a <strong>starter</strong> is. <code>spring-boot-starter-web</code> contains no code of its own - it is a pom listing the modules a web application needs, so you declare one dependency instead of eight.<br>`,
            codeExamples: [
                `<!-- WITHOUT Spring Boot: you name every module, and every version. -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>6.1.4</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.1.4</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.16.1</version>   <!-- which version pairs with Spring 6.1.4? -->
</dependency>
<!-- ...plus a servlet container, plus validation, plus a logging binding. -->`,
                `<!-- WITH Spring Boot: one line, and no versions anywhere. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- It pulls in, transitively:
       spring-web, spring-webmvc     - the Web layer
       spring-core, spring-beans,
       spring-context, spring-aop    - the Core Container and AOP
       spring-boot-starter-json      - Jackson, at a version known to work
       spring-boot-starter-tomcat    - the embedded server
       spring-boot-starter-logging   - SLF4J + Logback

     The versions come from the parent pom, which pins a set that has been
     tested together. This is the actual value: not fewer lines, but the
     guarantee that the versions are compatible. -->`
            ]
        },
        {
            content: `<h3>Tracing One Request Through the Layers</h3>
The architecture is easier to hold on to when you follow a single HTTP call down and back.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  POST /api/customers
        |
        v
  [ Embedded Tomcat ]                        (spring-boot-starter-tomcat)
        |
        v
  [ DispatcherServlet ]                      (spring-webmvc)
        |  finds the handler, converts JSON to an object
        v
  [ @RestController ]                        (your code)
        |
        v
  [ @Service ]                               (your code)
        |  ...but the call goes through a proxy first:
        v
  [ transaction proxy ]                      (spring-aop + spring-tx)
        |  begin transaction
        v
  [ @Repository ]                            (your code)
        |
        v
  [ JPA / Hibernate ]                        (spring-orm)
        |
        v
  [ DataSource -> database ]                 (spring-jdbc)

  ...and the response returns up the same stack, the proxy committing
  the transaction on the way out.</pre>
<br>
Every box on that path belongs to a module in the diagram at the top, and the whole thing is assembled by the Core Container at startup.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>The Dependency Rule, and Why It Is Worth Knowing</h3>
The stacking is strict: a module may depend downward, never upward. <code>spring-webmvc</code> depends on <code>spring-context</code>; <code>spring-context</code> has no idea whether a web layer exists.<br><br>

Two consequences follow, and both show up in real work.<br><br>

<table>
<tr><th>Consequence</th><th>Why it matters</th></tr>
<tr><td><code>spring-context</code> depends on <code>spring-aop</code></td><td>AOP sits <em>below</em> the context, not beside it. That is why <code>@Transactional</code> and <code>@Async</code> work in a plain non-web application with no extra dependency - the proxying machinery is already there.</td></tr>
<tr><td>The container is testable without a server</td><td>Because nothing in the Core Container reaches up into the web layer, <code>@SpringBootTest</code> can start a full context with no servlet container at all. That is not a testing trick; it falls straight out of the dependency direction.</td></tr>
</table>
<br>
The rule is also why the framework survived the reactive shift in 2017. WebFlux was added as a sibling of WebMVC in the Web layer. Nothing below had to change, so adding an entire second web stack broke no existing application.<br>`
        },
        {
            content: `<h3>Version Alignment: the Problem the Parent Pom Solves</h3>
Spring's modules are released as a set and are only supported in matching versions. Mixing <code>spring-core</code> 6.1.4 with <code>spring-webmvc</code> 6.0.9 will often start, then fail at a random point with <code>NoSuchMethodError</code> or <code>NoClassDefFoundError</code> - the classic symptom of a split framework version.<br><br>

Boot prevents this by managing versions centrally, and there are two ways to attach to that.<br>`,
            codeExamples: [
                `<!-- Option 1: inherit from the Boot parent. Most projects do this. -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.3</version>
</parent>

<!-- Every Spring dependency below now omits <version>, and Boot supplies a
     set that was tested together - Spring, Hibernate, Jackson, SLF4J, Tomcat. -->`,
                `<!-- Option 2: import the BOM. Use this when the project already has a
     corporate parent pom and cannot inherit a second one. -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.2.3</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Same version management, no parent required.

     To override one managed version - say a newer Jackson for a CVE fix -
     set the property rather than pinning the dependency, so every Jackson
     artifact moves together:

         <properties>
             <jackson-bom.version>2.17.0</jackson-bom.version>
         </properties>

     Pinning one artifact's <version> by hand upgrades that jar alone and
     leaves the rest of Jackson behind - which is how a version split gets
     introduced while trying to fix one. -->`
            ]
        },
        {
            content: `<h3>Reading the Dependency Tree</h3>
When something unexpected is on the classpath - two logging bindings, an old Jackson, a servlet API you did not ask for - the tree tells you which starter dragged it in.<br>`,
            codeExamples: [
                `# Which modules am I actually getting, and from where?
mvn dependency:tree

# OUTPUT (trimmed):
# [INFO] com.example:demo:jar:0.0.1-SNAPSHOT
# [INFO] +- org.springframework.boot:spring-boot-starter-web:jar:3.2.3:compile
# [INFO] |  +- org.springframework.boot:spring-boot-starter:jar:3.2.3:compile
# [INFO] |  |  +- org.springframework:spring-core:jar:6.1.4:compile
# [INFO] |  |  \\- org.springframework:spring-context:jar:6.1.4:compile
# [INFO] |  +- org.springframework.boot:spring-boot-starter-tomcat:jar:3.2.3:compile
# [INFO] |  +- org.springframework:spring-web:jar:6.1.4:compile
# [INFO] |  \\- org.springframework:spring-webmvc:jar:6.1.4:compile

# Narrow it to one artifact when hunting a conflict:
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind

# Gradle equivalent:
./gradlew dependencies --configuration runtimeClasspath`,
                `# Why is Spring Boot configuring something I never asked for?
java -jar app.jar --debug

# OUTPUT (the auto-configuration report, trimmed):
#
# Positive matches:
# -----------------
#    DispatcherServletAutoConfiguration matched:
#       - @ConditionalOnClass found required class DispatcherServlet
#       - found 'session' scope
#
# Negative matches:
# -----------------
#    DataSourceAutoConfiguration:
#       Did not match:
#          - @ConditionalOnClass did not find required class DataSource
#
# Every decision Boot made, with the reason. The negative matches are the
# more useful half: they explain what is missing, not just what is present.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the layers of the Spring Framework?</td><td>Core Container at the base; AOP/Aspects/Instrumentation above it; then Data Access-Integration and Web side by side; Test alongside. Dependencies point downward only.</td></tr>
<tr><td>Which modules make up the Core Container?</td><td><code>spring-core</code>, <code>spring-beans</code>, <code>spring-context</code>, <code>spring-expression</code>.</td></tr>
<tr><td>Difference between <code>spring-beans</code> and <code>spring-context</code>?</td><td><code>spring-beans</code> is the bean factory - definitions and injection. <code>spring-context</code> adds <code>ApplicationContext</code> with events, i18n, resource loading and annotation config.</td></tr>
<tr><td>Why does <code>@Transactional</code> work in a non-web application?</td><td>It is implemented by <code>spring-aop</code> plus <code>spring-tx</code>, both below the web layer. <code>spring-context</code> already depends on <code>spring-aop</code>.</td></tr>
<tr><td>Is Spring MVC required to use Spring?</td><td>No. It is one optional module in the Web layer. Batch jobs, CLI tools and message consumers use the container without it.</td></tr>
<tr><td>MVC and WebFlux together?</td><td>They are alternatives. With both on the classpath Boot chooses MVC. Use one per application.</td></tr>
<tr><td>What does a starter contain?</td><td>No code - a pom listing dependencies and their tested versions. <code>spring-boot-starter-web</code> pulls the web modules, Jackson, an embedded Tomcat and the logging binding.</td></tr>
<tr><td>How do you manage Spring versions without the Boot parent?</td><td>Import <code>spring-boot-dependencies</code> as a BOM in <code>dependencyManagement</code> with <code>&lt;scope&gt;import&lt;/scope&gt;</code>.</td></tr>
<tr><td>Symptom of mismatched Spring module versions?</td><td><code>NoSuchMethodError</code> or <code>NoClassDefFoundError</code> at runtime rather than at startup - the jars resolve but the classes disagree.</td></tr>
</table>`
        }
    ]
};
