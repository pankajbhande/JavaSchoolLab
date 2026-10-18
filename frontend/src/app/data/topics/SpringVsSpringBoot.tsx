import { Topic } from '../coreJava';

export const springVsSpringBoot: Topic = {
    id: 'sb-spring-vs-spring-boot',
    name: "Spring vs Spring Boot",
    beginner: [
        {
            content: `<h3>Not a Choice Between Two Things</h3>
The question is usually asked as though these were alternatives. They are not. <strong>Spring Boot is a layer on top of the Spring Framework</strong> - every Spring Boot application <em>is</em> a Spring application, using the same container, the same <code>@Component</code>, the same <code>@Transactional</code>.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   +-----------------------------------------------------+
   |  SPRING BOOT                                        |
   |    auto-configuration   starters   embedded server  |
   |    Actuator             sensible defaults           |
   +-----------------------------------------------------+
   |  SPRING FRAMEWORK                                   |
   |    IoC container   Spring MVC   AOP   transactions  |
   +-----------------------------------------------------+</pre>
<br>
Boot writes no new container and replaces no Spring feature. It answers a different question: <em>not</em> "how do I wire objects together" but "why must I configure the same twenty things in every project".<br>`
        },
        {
            content: `<h3>The Same Application, Both Ways</h3>
The clearest way to see what Boot does is to build one web endpoint twice.<br>`,
            codeExamples: [
                `// ============ SPRING FRAMEWORK ALONE ============

// 1. pom.xml - name every dependency AND every version, and hope the
//    combination has been tested together.
   spring-webmvc 6.1.4, spring-context 6.1.4, spring-orm 6.1.4,
   hibernate-core 6.4.4, jackson-databind 2.16.1, HikariCP 5.1.0,
   tomcat-embed-core 10.1.19, slf4j-api 2.0.12, logback 1.4.14 ...

// 2. Register the DispatcherServlet.
public class WebInit implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext container) {
        var context = new AnnotationConfigWebApplicationContext();
        context.register(AppConfig.class);
        var dispatcher = container.addServlet("dispatcher",
                             new DispatcherServlet(context));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}

// 3. Configure MVC - message converters, resource handlers.
@Configuration
@EnableWebMvc
@ComponentScan("com.shop")
public class WebConfig implements WebMvcConfigurer { ... }

// 4. Configure persistence - DataSource, EntityManagerFactory,
//    transaction manager, by hand.
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories("com.shop.repository")
public class PersistenceConfig {
    @Bean public DataSource dataSource() { ... }
    @Bean public LocalContainerEntityManagerFactoryBean entityManagerFactory(
                     DataSource ds) { ... }
    @Bean public PlatformTransactionManager transactionManager(
                     EntityManagerFactory emf) { ... }
}

// 5. Build a WAR, install Tomcat, deploy it there.

// Roughly 150 lines of configuration before the first endpoint.`,
                `// ============ SPRING BOOT ============

// 1. pom.xml
   <parent>spring-boot-starter-parent 3.2.3</parent>
   <dependency>spring-boot-starter-web</dependency>
   <dependency>spring-boot-starter-data-jpa</dependency>
   // no versions anywhere

// 2. application.properties
   spring.datasource.url=jdbc:mysql://localhost/shop
   spring.datasource.username=shop

// 3. The application
@SpringBootApplication
public class ShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}

// 4. java -jar shop.jar

// Every numbered item from the previous listing still happens - the
// DispatcherServlet is registered, the EntityManagerFactory is built,
// the transaction manager exists. Boot does it, conditionally, based
// on what it finds on the classpath.
//
// Nothing was removed. The configuration moved from your code into
// auto-configuration classes you can read, override or switch off.`
            ]
        },
        {
            content: `<h3>The Four Things Boot Adds</h3>

<table>
<tr><th>Feature</th><th>What it replaces</th></tr>
<tr><td><strong>Starters</strong></td><td>Hand-picking compatible dependency versions. <code>spring-boot-starter-web</code> is a pom listing modules and versions known to work together.</td></tr>
<tr><td><strong>Auto-configuration</strong></td><td>The configuration classes above. Boot inspects the classpath and configures what it finds - and backs off wherever you define your own bean.</td></tr>
<tr><td><strong>Embedded server</strong></td><td>Installing and managing Tomcat. The server is a library inside the jar, so the artifact runs itself.</td></tr>
<tr><td><strong>Production features</strong></td><td>Bespoke health and metrics endpoints. Actuator supplies <code>/health</code>, <code>/metrics</code>, <code>/prometheus</code> and more with one dependency.</td></tr>
</table>
<br>
Notice what is <em>not</em> in that list: no new dependency injection, no new web framework, no new persistence API. Boot is entirely about the setup around Spring.<br>`
        },
        {
            content: `<h3>WAR to JAR - the Deployment Change</h3>
The change with the widest practical effect, and the one that made Boot fit modern deployment.<br><br>

<table>
<tr><th></th><th>Traditional Spring</th><th>Spring Boot</th></tr>
<tr><td>Artifact</td><td><code>shop.war</code></td><td><code>shop.jar</code></td></tr>
<tr><td>Needs</td><td>A Tomcat installed on the host</td><td>A JVM</td></tr>
<tr><td>Run with</td><td>Copy to <code>webapps/</code>, start Tomcat</td><td><code>java -jar shop.jar</code></td></tr>
<tr><td>Server config</td><td><code>server.xml</code>, outside the artifact</td><td><code>application.properties</code>, inside it</td></tr>
<tr><td>Server version</td><td>Whatever the host has</td><td>Pinned in <code>pom.xml</code></td></tr>
</table>
<br>
The consequence: the thing you tested is the thing that runs. There is no host-provided container whose version or configuration can differ between staging and production - which is precisely what containers and orchestration need.<br>`,
            codeExamples: [
                `# The Dockerfile this makes possible - no application server to install.
FROM eclipse-temurin:21-jre-alpine
COPY target/shop.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]

# Compare the WAR equivalent: a Tomcat base image, a matching Tomcat
# version, server.xml, context.xml, and a JNDI DataSource defined
# outside the application.

# Boot can still produce a WAR when a platform requires it:
#   <packaging>war</packaging>
#   + extend SpringBootServletInitializer
#   + mark spring-boot-starter-tomcat as <scope>provided</scope>
#
# Needed for legacy application servers - WebSphere, WebLogic, or a
# shared Tomcat estate.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>"Opinionated" Means Defaults, Not Restrictions</h3>
Boot is described as opinionated, which is sometimes read as inflexible. Every opinion is a default that yields to yours.<br><br>

<table>
<tr><th>Boot's default</th><th>Overridden by</th></tr>
<tr><td>Tomcat as the servlet container</td><td>Excluding <code>spring-boot-starter-tomcat</code> and adding <code>-jetty</code> or <code>-undertow</code></td></tr>
<tr><td>HikariCP as the connection pool</td><td>Defining your own <code>DataSource</code> bean</td></tr>
<tr><td>Jackson for JSON</td><td>Defining your own <code>ObjectMapper</code></td></tr>
<tr><td>Logback for logging</td><td>Excluding <code>spring-boot-starter-logging</code>, adding <code>-log4j2</code></td></tr>
<tr><td>Port 8080</td><td><code>server.port</code></td></tr>
</table>
<br>
The mechanism is uniform: nearly every auto-configured bean is declared <code>@ConditionalOnMissingBean</code>, and auto-configuration is processed <em>after</em> all your configuration. So defining a bean is all it takes - no <code>@Primary</code>, no exclusion.<br>`,
            codeExamples: [
                `<!-- Swapping the embedded server - the shape of every such change. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>

<!-- No code changes. Auto-configuration selects the server by what is
     on the classpath - @ConditionalOnClass(Undertow.class) matches
     now, and the Tomcat one no longer does. -->`,
                `// Seeing exactly which opinions were applied, and why:
java -jar shop.jar --debug

// OUTPUT (trimmed):
//
// Positive matches:
// -----------------
//    DataSourceAutoConfiguration matched:
//       - @ConditionalOnClass found required classes 'DataSource',
//         'EmbeddedDatabaseType'
//
//    HikariDataSourceConfiguration matched:
//       - @ConditionalOnClass found required class 'HikariDataSource'
//       - @ConditionalOnMissingBean did not find any beans of type
//         'DataSource'          <-- the back-off condition, unmatched
//
// Negative matches:
// -----------------
//    JndiDataSourceAutoConfiguration:
//       Did not match:
//          - @ConditionalOnProperty spring.datasource.jndi-name
//
// The negative matches are the more useful half: they say what Boot
// decided NOT to do and which condition stopped it. When a bean you
// expected is missing, this report names the reason.`
            ]
        },
        {
            content: `<h3>What Boot Costs</h3>
Being able to state the downsides is the difference between using it and being used by it.<br><br>

<table>
<tr><th>Cost</th><th>Detail</th></tr>
<tr><td>Configuration is implicit</td><td>Nothing in your source says a <code>DataSource</code> exists. Understanding the running system means reading auto-configuration classes or the <code>--debug</code> report.</td></tr>
<tr><td>Surprise beans</td><td>Adding a dependency can register beans and endpoints you did not ask for - a real concern when the endpoint is publicly reachable.</td></tr>
<tr><td>Artifact size</td><td>A fat jar carries its server and every transitive dependency - typically 30-60MB against a few MB of WAR.</td></tr>
<tr><td>Version coupling</td><td>The parent pom pins everything. Upgrading one library often means upgrading Boot, and a Boot major upgrade moves Spring, Hibernate and Jackson at once.</td></tr>
<tr><td>Startup time</td><td>Classpath scanning plus condition evaluation. Fine for a long-running service; a real cost for short-lived functions.</td></tr>
</table>`,
            codeExamples: [
                `// The "surprise beans" cost, made concrete - this has caused real
// incidents.
//
// Adding spring-boot-starter-actuator exposes endpoints. In older Boot
// versions many were web-exposed by default; since 2.0 only /health
// and /info are, but a well-meaning:
//
//   management.endpoints.web.exposure.include=*
//
// publishes /actuator/env (every property, including some secrets),
// /actuator/heapdump (a downloadable heap dump) and /actuator/mappings.
//
// Correct posture:
//   management.endpoints.web.exposure.include=health,info,prometheus
//   management.endpoint.health.show-details=when-authorized
//   management.server.port=9090        # separate port, not public
//
// And verify rather than assume:
//   curl localhost:8080/actuator | jq '._links | keys'`,
                `# Reducing startup time, in order of effect - measure first.

# 1. See where the time actually goes.
management.endpoints.web.exposure.include=startup
# then: curl localhost:8080/actuator/startup | jq '.timeline.events
#         | sort_by(-.duration) | .[0:10]'

# 2. Narrow component scanning to the packages you own.
@SpringBootApplication(scanBasePackages = "com.shop")

# 3. Exclude auto-configurations you provably do not use.
spring.autoconfigure.exclude=\
  org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration

# 4. Only for short-lived workloads, and knowing the trade:
spring.main.lazy-initialization=true
#    Faster start, but wiring errors now surface on the first request
#    instead of at startup - usually the wrong trade for a service.

# 5. For genuinely fast cold starts, a GraalVM native image:
#    mvn -Pnative native:compile   -> ~50ms startup, ~40MB binary
#    Costs: long build times, reflection needs registration, and some
#    libraries do not work.`
            ]
        },
        {
            content: `<h3>When Plain Spring Is Still Right</h3>
Rare, but not never - and knowing the cases is how you avoid arguing the wrong side.<br><br>

<table>
<tr><th>Situation</th><th>Why</th></tr>
<tr><td>Deploying into a shared application server estate</td><td>WebSphere or WebLogic with a governed container version. Boot can build a WAR, but its main advantages go with the embedded server.</td></tr>
<tr><td>Adding Spring to an existing non-Boot application</td><td>Retrofitting Boot to a large legacy WAR is a project in itself; adding <code>spring-context</code> is a dependency.</td></tr>
<tr><td>A library rather than an application</td><td>A library should depend on the Spring modules it needs, not drag a starter and its opinions into every consumer.</td></tr>
<tr><td>Extreme startup or size constraints</td><td>Even here, Boot with a native image usually beats hand-configured Spring.</td></tr>
</table>
<br>
For a new standalone application in 2026, there is effectively no argument for configuring Spring by hand. The reason to understand the manual form is diagnostic: when auto-configuration does something unexpected, knowing what it is doing <em>instead of you</em> is what lets you fix it.<br>`
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Is Spring Boot a replacement for Spring?</td><td>No - it is a layer on top. Every Boot application is a Spring application using the same container and annotations.</td></tr>
<tr><td>What does Boot add?</td><td>Starters, auto-configuration, an embedded server, and production features such as Actuator.</td></tr>
<tr><td>What is a starter?</td><td>A pom with no code that lists a feature's dependencies at versions tested together.</td></tr>
<tr><td>What does "opinionated" mean here?</td><td>Sensible defaults, not restrictions. Nearly every auto-configured bean is <code>@ConditionalOnMissingBean</code>, so defining your own replaces it.</td></tr>
<tr><td>JAR or WAR?</td><td>An executable JAR with an embedded server by default, so the tested artifact is the deployed artifact. A WAR is still possible via <code>SpringBootServletInitializer</code> and a <code>provided</code>-scope server.</td></tr>
<tr><td>How do you change the embedded server?</td><td>Exclude <code>spring-boot-starter-tomcat</code> and add Jetty or Undertow. No code changes - selection is by classpath condition.</td></tr>
<tr><td>How do you find out what Boot configured?</td><td><code>--debug</code> prints the auto-configuration report; the negative matches explain what was skipped and why.</td></tr>
<tr><td>What are Boot's downsides?</td><td>Implicit configuration, beans appearing from added dependencies, large artifacts, tight version coupling through the parent pom, and startup cost.</td></tr>
<tr><td>Name a real risk from a starter.</td><td>Actuator with <code>exposure.include=*</code> publishes <code>/env</code> and <code>/heapdump</code>. Expose a named list and use a separate management port.</td></tr>
<tr><td>When would you not use Boot?</td><td>Deploying into a governed application-server estate, retrofitting a large legacy application, or writing a library that should not impose starters on consumers.</td></tr>
</table>`
        }
    ]
};
