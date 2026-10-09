import { Topic } from '../coreJava';

export const springStarterDependencies: Topic = {
    id: 'sb-starter-dependencies',
    name: "Starter Dependencies",
    beginner: [
        {
            content: `<h3>A Starter Contains No Code</h3>
This surprises people the first time they look inside one. <code>spring-boot-starter-web</code> has no classes at all - it is a <code>pom.xml</code> listing other dependencies.<br><br>

That is the entire mechanism. A starter is a <strong>curated list</strong>: one name standing in for the set of libraries a feature needs, at versions that have been tested together.<br>`,
            codeExamples: [
                `<!-- The actual contents of spring-boot-starter-web, trimmed. -->
<project>
    <artifactId>spring-boot-starter-web</artifactId>
    <packaging>pom</packaging>          <!-- pom, not jar - no code -->

    <dependencies>
        <dependency>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <artifactId>spring-boot-starter-json</artifactId>
        </dependency>
        <dependency>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
        </dependency>
    </dependencies>
</project>

<!-- Starters compose: this one pulls three other starters, each of
     which pulls more. One line in your pom becomes ~35 jars. -->`,
                `# Seeing what a starter actually brought in:
./mvnw dependency:tree -Dincludes=org.springframework*

# OUTPUT (trimmed):
# +- org.springframework.boot:spring-boot-starter-web:jar:3.2.3
# |  +- org.springframework.boot:spring-boot-starter:jar:3.2.3
# |  |  +- org.springframework.boot:spring-boot:jar:3.2.3
# |  |  +- org.springframework.boot:spring-boot-autoconfigure:jar:3.2.3
# |  |  +- org.springframework.boot:spring-boot-starter-logging:jar:3.2.3
# |  |  \- org.springframework:spring-core:jar:6.1.4
# |  +- org.springframework.boot:spring-boot-starter-json:jar:3.2.3
# |  |  \- com.fasterxml.jackson.core:jackson-databind:jar:2.15.4
# |  +- org.springframework.boot:spring-boot-starter-tomcat:jar:3.2.3
# |  \- org.springframework:spring-webmvc:jar:6.1.4

# This is the command to reach for whenever you wonder "where did this
# jar come from" or "why is there a second logging binding".`
            ]
        },
        {
            content: `<h3>Starters and Auto-Configuration Are a Pair</h3>
A starter puts jars on the classpath. Auto-configuration reacts to what it finds there. Neither does much alone - together they are why adding one line makes a feature work.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   add spring-boot-starter-data-jpa
             |
             v
   Hibernate, spring-orm, HikariCP land on the classpath
             |
             v
   at startup, auto-configuration asks:
       @ConditionalOnClass(DataSource.class)          -> matches
       @ConditionalOnClass(EntityManagerFactory.class) -> matches
       @ConditionalOnMissingBean(DataSource.class)     -> matches
             |
             v
   registers DataSource, EntityManagerFactory,
   JpaTransactionManager, and enables repositories</pre>
<br>
This explains the behaviour that otherwise looks arbitrary: <strong>removing a starter can silently remove beans and endpoints</strong>, because the conditions stop matching. It also explains why an unused starter is not harmless - it configures things.<br>`
        },
        {
            content: `<h3>The Ones You Will Use</h3>

<table>
<tr><th>Starter</th><th>Brings</th></tr>
<tr><td><code>spring-boot-starter</code></td><td>The core - context, auto-configuration, logging, YAML. Every other starter includes it.</td></tr>
<tr><td><code>spring-boot-starter-web</code></td><td>Spring MVC, Jackson, embedded Tomcat, validation API.</td></tr>
<tr><td><code>spring-boot-starter-webflux</code></td><td>The reactive alternative to <code>-web</code>, with Netty. Not an addition.</td></tr>
<tr><td><code>spring-boot-starter-data-jpa</code></td><td>Spring Data JPA, Hibernate, HikariCP, transactions.</td></tr>
<tr><td><code>spring-boot-starter-data-jdbc</code></td><td>Spring Data JDBC - lighter, no ORM.</td></tr>
<tr><td><code>spring-boot-starter-validation</code></td><td>Hibernate Validator. <strong>Not included in <code>-web</code> since Boot 2.3.</strong></td></tr>
<tr><td><code>spring-boot-starter-security</code></td><td>Spring Security. Locks every endpoint the moment it is added.</td></tr>
<tr><td><code>spring-boot-starter-test</code></td><td>JUnit 5, Mockito, AssertJ, JSONassert, JsonPath, Spring Test.</td></tr>
<tr><td><code>spring-boot-starter-actuator</code></td><td>Health, metrics and management endpoints.</td></tr>
<tr><td><code>spring-boot-starter-data-redis</code></td><td>Lettuce and Redis templates.</td></tr>
<tr><td><code>spring-boot-starter-mail</code></td><td>JavaMail and <code>JavaMailSender</code>.</td></tr>
<tr><td><code>spring-boot-starter-thymeleaf</code></td><td>Server-side templating.</td></tr>
<tr><td><code>spring-boot-starter-aop</code></td><td>Spring AOP and AspectJ weaving support.</td></tr>
</table>
<br>
The validation row catches people regularly. Before Boot 2.3, <code>-web</code> included Hibernate Validator; it was removed to slim the default web application. <code>@Valid</code> then compiles - the annotation is in <code>-web</code> - but silently does nothing, because no validator implementation exists to run it.<br>`
        },
        {
            content: `<h3>The Naming Rule</h3>
There is a convention, and it tells you at a glance who maintains a starter.<br><br>

<table>
<tr><th>Pattern</th><th>Owner</th><th>Example</th></tr>
<tr><td><code>spring-boot-starter-*</code></td><td>The Spring Boot team - <strong>reserved</strong></td><td><code>spring-boot-starter-web</code></td></tr>
<tr><td><code>*-spring-boot-starter</code></td><td>Everyone else</td><td><code>mybatis-spring-boot-starter</code></td></tr>
</table>
<br>
The prefix is reserved deliberately. If you write a starter for your organisation, it is <code>dhipan-security-spring-boot-starter</code>, not <code>spring-boot-starter-dhipan-security</code> - the suffix form makes it immediately clear the artifact is not from the Spring team.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>Writing a Starter: the Two-Module Split</h3>
The convention is two artifacts, and the reason is worth understanding rather than copying.<br><br>

<table>
<tr><th>Module</th><th>Contains</th></tr>
<tr><td><code>xyz-spring-boot-autoconfigure</code></td><td>The auto-configuration classes, properties and conditions. The code.</td></tr>
<tr><td><code>xyz-spring-boot-starter</code></td><td>A pom with no code, depending on the autoconfigure module plus the libraries it needs.</td></tr>
</table>
<br>
The split lets a consumer take the auto-configuration <em>without</em> the opinionated dependency set - useful when they already manage those libraries themselves, or need a different version. For an internal starter used by one organisation, a single module is a reasonable simplification.<br>`,
            codeExamples: [
                `// dhipan-spring-boot-autoconfigure/src/main/java/...

@AutoConfiguration
@ConditionalOnClass(AuditWriter.class)             // only if the lib is present
@EnableConfigurationProperties(AuditProperties.class)
@ConditionalOnProperty(prefix = "dhipan.audit",
                       name = "enabled",
                       matchIfMissing = true)      // on by default, opt-out
public class AuditAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean                      // the app can override
    public AuditWriter auditWriter(AuditProperties props, DataSource ds) {
        return new JdbcAuditWriter(ds, props.tableName());
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(AuditWriter.class)
    public AuditAspect auditAspect(AuditWriter writer) {
        return new AuditAspect(writer);
    }
}

@ConfigurationProperties(prefix = "dhipan.audit")
@Validated
public record AuditProperties(
        /** Table that audit rows are written to. */
        @NotBlank String tableName,
        /** Whether to record the full request body. */
        boolean includeBody) {

    public AuditProperties {
        if (tableName == null) tableName = "audit_log";
    }
}

// Every bean is @ConditionalOnMissingBean. That is the contract of a
// well-behaved starter: supply a default, and get out of the way the
// moment the application defines its own.`,
                `# Registration - and this is the file people get wrong.

# Boot 3.x:
# src/main/resources/META-INF/spring/
#     org.springframework.boot.autoconfigure.AutoConfiguration.imports
com.dhipan.audit.AuditAutoConfiguration

# Boot 2.7 and earlier:
# src/main/resources/META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.dhipan.audit.AuditAutoConfiguration

# A starter supporting both ships both files - they are ignored
# harmlessly by the version that does not use them.
#
# Symptom of a missing/misplaced file: the jar is on the classpath, the
# class is right, and NOTHING happens. No error, no bean. Check the
# path character by character - a typo in that filename is silent.

# Verify it is being picked up:
#   java -jar app.jar --debug | grep AuditAutoConfiguration`
            ]
        },
        {
            content: `<h3>Testing a Starter Without Starting an Application</h3>
<code>ApplicationContextRunner</code> builds a throwaway context in milliseconds, which is how conditions get tested properly.<br>`,
            codeExamples: [
                `class AuditAutoConfigurationTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
        .withConfiguration(AutoConfigurations.of(AuditAutoConfiguration.class));

    @Test
    void registersDefaultWriter() {
        runner.withBean(DataSource.class, () -> mock(DataSource.class))
              .run(context -> {
                  assertThat(context).hasSingleBean(AuditWriter.class);
                  assertThat(context.getBean(AuditProperties.class).tableName())
                      .isEqualTo("audit_log");
              });
    }

    @Test
    void backsOffWhenApplicationDefinesItsOwn() {
        runner.withUserConfiguration(CustomWriterConfig.class)
              .run(context -> assertThat(context)
                  .getBean(AuditWriter.class)
                  .isInstanceOf(CustomAuditWriter.class));
    }

    @Test
    void disabledByProperty() {
        runner.withPropertyValues("dhipan.audit.enabled=false")
              .run(context -> assertThat(context)
                  .doesNotHaveBean(AuditWriter.class));
    }

    @Test
    void absentWhenLibraryMissing() {
        runner.withClassLoader(new FilteredClassLoader(AuditWriter.class))
              .run(context -> assertThat(context)
                  .doesNotHaveBean(AuditAutoConfiguration.class));
    }
}

// FilteredClassLoader is the important one - it simulates the library
// being absent, which is the only way to test @ConditionalOnClass
// without a second project.
//
// Each run() is a fresh context in a few milliseconds. There is no
// @SpringBootTest here and no application at all.`
            ]
        },
        {
            content: `<h3>Starter Hygiene</h3>
Four rules that separate a starter people are glad to depend on from one they work around.<br><br>

<table>
<tr><th>Rule</th><th>Why</th></tr>
<tr><td>Every bean <code>@ConditionalOnMissingBean</code></td><td>An application that wants its own must not have to exclude your auto-configuration to get it.</td></tr>
<tr><td>Ship configuration metadata</td><td>Add <code>spring-boot-configuration-processor</code> so consumers get autocomplete and typo detection on your properties.</td></tr>
<tr><td>Depend narrowly</td><td>Depend on the specific Spring modules you use, not <code>spring-boot-starter-web</code>. Dragging a web server into a consumer that has none is a real and common mistake.</td></tr>
<tr><td>Never inherit <code>spring-boot-starter-parent</code></td><td>Import <code>spring-boot-dependencies</code> as a BOM instead - a library must not force its parent onto consumers.</td></tr>
</table>`,
                        codeExamples: [
                `<!-- A library's pom: BOM import, not parent inheritance. -->
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

<dependencies>
    <!-- narrow: exactly what the code uses -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-autoconfigure</artifactId>
    </dependency>

    <!-- optional: available if the consumer already has it, not forced -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <optional>true</optional>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>

<!-- <optional>true</optional> paired with @ConditionalOnClass is the
     standard pattern: the feature activates if the consumer happens to
     have the library, and stays silent otherwise. -->`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a starter?</td><td>A dependency descriptor - a pom with no code - listing the libraries a feature needs at versions tested together.</td></tr>
<tr><td>Does a starter contain classes?</td><td>No. Its packaging is <code>pom</code>. The behaviour comes from auto-configuration in the jars it pulls.</td></tr>
<tr><td>How do starters and auto-configuration relate?</td><td>The starter puts classes on the classpath; auto-configuration's <code>@ConditionalOnClass</code> conditions then match and register beans.</td></tr>
<tr><td>What is in <code>spring-boot-starter</code>?</td><td>Core context, auto-configuration, logging and YAML support - included by every other starter.</td></tr>
<tr><td>Why does <code>@Valid</code> sometimes do nothing?</td><td><code>spring-boot-starter-validation</code> was removed from <code>-web</code> in Boot 2.3. The annotation compiles but no validator implementation is present.</td></tr>
<tr><td>What is the naming convention?</td><td><code>spring-boot-starter-*</code> is reserved for the Spring team; third parties use <code>*-spring-boot-starter</code>.</td></tr>
<tr><td>Why is a custom starter split into two modules?</td><td>So consumers can take the auto-configuration without the opinionated dependency list, when they manage those libraries themselves.</td></tr>
<tr><td>How is auto-configuration registered?</td><td><code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code> on Boot 3; <code>META-INF/spring.factories</code> on 2.7 and earlier.</td></tr>
<tr><td>How do you test a starter?</td><td><code>ApplicationContextRunner</code> - with <code>withPropertyValues</code>, <code>withUserConfiguration</code> and <code>FilteredClassLoader</code> to exercise each condition in milliseconds.</td></tr>
<tr><td>Why should a starter never inherit the Boot parent?</td><td>A library must not impose a parent pom on consumers. Import <code>spring-boot-dependencies</code> as a BOM instead.</td></tr>
</table>`
        }
    ]
};
