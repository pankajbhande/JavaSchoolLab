import { Topic } from '../coreJava';

export const springMavenGradleWithSpringBoot: Topic = {
    id: 'sb-maven-gradle-with-spring-boot',
    name: "Maven/Gradle with Spring Boot",
    beginner: [
        {
            content: `<h3>Two Jobs the Build Tool Does for Boot</h3>
Spring Boot needs its build tool for two things beyond compiling, and both are provided by a plugin you get from Initializr.<br><br>

<table>
<tr><th>Job</th><th>Provided by</th></tr>
<tr><td><strong>Dependency management</strong> - so you never write a version number</td><td>The parent pom (Maven) or the dependency-management plugin (Gradle)</td></tr>
<tr><td><strong>Packaging</strong> - turning a normal jar into one that runs with <code>java -jar</code></td><td><code>spring-boot-maven-plugin</code> / the <code>org.springframework.boot</code> Gradle plugin</td></tr>
</table>
<br>
Neither is optional. Without the first you are back to matching Spring, Hibernate and Jackson versions by hand; without the second, <code>java -jar</code> fails with <code>no main manifest attribute</code>.<br>`
        },
        {
            content: `<h3>The Maven Setup</h3>`,
            codeExamples: [
                `<project>
    <!-- 1. The parent supplies versions for ~350 libraries and sets
            sensible compiler and resource defaults. -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>            <!-- look it up in the repository -->
    </parent>

    <groupId>com.dhipan</groupId>
    <artifactId>order-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>21</java.version>
    </properties>

    <!-- 2. Dependencies with NO version - the parent decides. -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <!-- 3. The plugin that makes the jar executable. -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`,
                `# The commands you will actually use.

./mvnw spring-boot:run             # run without packaging
./mvnw clean package               # build target/order-service-0.0.1-SNAPSHOT.jar
./mvnw test                        # tests only
./mvnw clean package -DskipTests   # skip them (CI already ran them)
./mvnw dependency:tree             # what is really on the classpath
./mvnw spring-boot:build-image     # an OCI image, no Dockerfile

# Passing arguments and profiles to a run:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=9090"

# Note -DskipTests vs -Dmaven.test.skip=true:
#   -DskipTests             compiles tests, does not run them
#   -Dmaven.test.skip=true  does not even compile them - so a broken
#                           test compiles nowhere and is found later`
            ]
        },
        {
            content: `<h3>The Gradle Setup</h3>
The same two jobs, split across two plugins.<br>`,
            codeExamples: [
                `plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.3'          // packaging
    id 'io.spring.dependency-management' version '1.1.4'   // versions
}

group = 'com.dhipan'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories { mavenCentral() }

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    // no versions - the dependency-management plugin supplies them
}

tasks.named('test') { useJUnitPlatform() }`,
                `# The command equivalents:

./gradlew bootRun                  # spring-boot:run
./gradlew build                    # clean package (runs tests)
./gradlew bootJar                  # the executable jar only
./gradlew test
./gradlew build -x test            # skip tests
./gradlew dependencies --configuration runtimeClasspath
./gradlew bootBuildImage

./gradlew bootRun --args='--spring.profiles.active=dev --server.port=9090'

# Maven vs Gradle, honestly:
#
#   Maven   XML, rigid, predictable. Everyone can read it. The default
#           choice, and what most Spring documentation assumes.
#   Gradle  Groovy/Kotlin DSL, flexible, incremental builds with a
#           daemon - noticeably faster on large multi-module projects.
#
# For a single Spring Boot service the difference is small. Pick what
# your team already uses; do not mix within one organisation.`
            ]
        },
        {
            content: `<h3>Overriding a Managed Version</h3>
The parent pins everything, so upgrading one library is not done by adding a <code>&lt;version&gt;</code>.<br>`,
            codeExamples: [
                `<!-- CORRECT - set the property the parent uses. Every artifact in
     that family moves together. -->
<properties>
    <java.version>21</java.version>
    <jackson-bom.version>2.17.0</jackson-bom.version>
    <postgresql.version>42.7.2</postgresql.version>
    <testcontainers.version>1.19.7</testcontainers.version>
</properties>

<!-- WRONG - pinning one artifact by hand. -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>          <!-- moves ONLY this one -->
</dependency>

<!-- jackson-databind is now 2.17.0 while jackson-core and
     jackson-annotations remain at the managed 2.16.1. Mixed Jackson
     versions produce NoSuchMethodError at runtime, not at build time -
     which is how a CVE fix introduces a worse bug than the CVE.

     Find the right property name in the parent:
       ./mvnw help:effective-pom | grep -i jackson  -->`,
                `// The Gradle equivalents:

ext['jackson-bom.version'] = '2.17.0'
ext['postgresql.version'] = '42.7.2'

// Excluding a transitive dependency - the usual case being a logging
// binding that conflicts with Logback:

// Maven
<dependency>
    <groupId>com.example</groupId>
    <artifactId>legacy-client</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </exclusion>
    </exclusions>
</dependency>

// Gradle
implementation('com.example:legacy-client') {
    exclude group: 'org.slf4j', module: 'slf4j-log4j12'
}

// The symptom that sends you here:
//   SLF4J: Class path contains multiple SLF4J bindings.
//   SLF4J: Found binding in [.../logback-classic.jar!/...]
//   SLF4J: Found binding in [.../slf4j-log4j12.jar!/...]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>What <code>repackage</code> Actually Produces</h3>
The plugin's main goal runs in the <code>package</code> phase. It takes the ordinary jar Maven just built, renames it <code>.jar.original</code>, and writes a new one with a different internal layout.<br>`,
            codeExamples: [
                `order-service.jar
 |- META-INF/
 |   |- MANIFEST.MF
 |       Main-Class:       org.springframework.boot.loader.launch.JarLauncher
 |       Start-Class:      com.dhipan.orderservice.OrderServiceApplication
 |       Spring-Boot-Classes: BOOT-INF/classes/
 |       Spring-Boot-Lib:     BOOT-INF/lib/
 |
 |- org/springframework/boot/loader/     <- the loader, unpacked
 |       JarLauncher.class ...              (this is why it can start)
 |
 |- BOOT-INF/
     |- classes/                         <- YOUR compiled code
     |   |- com/dhipan/orderservice/...
     |   |- application.properties
     |- lib/                             <- every dependency, as JARS
     |   |- spring-web-6.1.4.jar
     |   |- tomcat-embed-core-10.1.19.jar
     |   |- ... 60 more
     |- classpath.idx                    <- the order to load them in

// The key detail: dependencies stay as NESTED JAR FILES. Standard Java
// cannot load a jar inside a jar, which is why Boot ships its own
// classloader. Main-Class is the LAUNCHER, not your class - the
// launcher builds a classloader over BOOT-INF/lib and then calls
// Start-Class.
//
// Consequences:
//   * java -jar works anywhere with a JVM
//   * unzipping and running your class directly does NOT work
//   * java -cp order-service.jar com.dhipan...Application does NOT work
//     (the dependencies are invisible to the normal classloader)
//
// To run the exploded form, extract it properly:
//     java -Djarmode=tools -jar order-service.jar extract
//     java -cp 'order-service/lib/*:order-service/order-service.jar' \\
//          com.dhipan.orderservice.OrderServiceApplication
//
// (Boot 3.3+ uses -Djarmode=tools; earlier versions used
//  -Djarmode=layertools with the 'extract' command.)`,
                `<!-- Why the .jar.original file exists, and when it matters. -->

target/
 |- order-service-0.0.1-SNAPSHOT.jar            executable, ~45MB
 |- order-service-0.0.1-SNAPSHOT.jar.original   the plain jar, ~80KB

<!-- If this module is a LIBRARY that other modules depend on, the
     executable jar is the wrong artifact - a nested-jar layout cannot
     be a dependency. Turn repackaging into a classifier so both are
     published: -->

<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <classifier>exec</classifier>
    </configuration>
</plugin>

<!-- Now you get order-service.jar (a normal, dependable jar) and
     order-service-exec.jar (the runnable one).

     The symptom of getting this wrong in a multi-module build:
       package com.dhipan.common does not exist
     when a sibling module depends on a Boot-repackaged jar. -->`
            ]
        },
        {
            content: `<h3>Multi-Module Projects</h3>
The rule is simple once stated: <strong>only the deployable module is repackaged.</strong><br>`,
            codeExamples: [
                `order-platform/
 |- pom.xml                    <parent>, <modules>, dependencyManagement
 |- common/pom.xml             library  - plugin NOT applied
 |- domain/pom.xml             library  - plugin NOT applied
 |- api/pom.xml                the app  - plugin applied

<!-- order-platform/pom.xml -->
<packaging>pom</packaging>
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.3</version>
</parent>
<modules>
    <module>common</module>
    <module>domain</module>
    <module>api</module>
</modules>

<!-- common/pom.xml - a plain library. No build plugin section at all. -->
<parent>
    <groupId>com.dhipan</groupId>
    <artifactId>order-platform</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</parent>
<artifactId>common</artifactId>

<!-- api/pom.xml - the only module that produces a runnable artifact. -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>

<!-- Because the parent pom inherits from spring-boot-starter-parent,
     every module gets version management without applying the
     packaging plugin. That separation is the whole trick. -->`,
                `// The scanning consequence people hit next.
//
// The main class lives in api, so @SpringBootApplication scans
// com.dhipan.api and below. Beans in the 'common' or 'domain' modules
// are NOT scanned - different package trees, and jar boundaries do not
// matter, package names do.
//
// Two correct answers:

// (a) Share a root package across modules, so one scan covers them:
//     common  -> com.dhipan.order.common
//     domain  -> com.dhipan.order.domain
//     api     -> com.dhipan.order.api
//     main class in com.dhipan.order
//
// (b) Have each library expose an auto-configuration, which is the
//     right approach when the module is genuinely reusable:
//     common/src/main/resources/META-INF/spring/
//       org.springframework.boot.autoconfigure.AutoConfiguration.imports
//
// Do NOT use @ComponentScan("com.dhipan.common") in the application -
// it makes the library's internal package layout part of its public
// contract.`
            ]
        },
        {
            content: `<h3>Build Reproducibility and CI</h3>
Three settings that prevent the "works on my machine" class of build failure.<br>`,
            codeExamples: [
                `# 1. THE WRAPPER pins the build tool version. Always invoke it.
./mvnw clean verify          # not: mvn clean verify

# In CI, the same:
- run: ./mvnw --batch-mode --no-transfer-progress clean verify
#   --batch-mode           no interactive prompts, cleaner logs
#   --no-transfer-progress hides the download spam

# 2. THE TOOLCHAIN pins the JDK, so the build does not silently use
#    whatever the agent has installed.
<properties>
    <java.version>21</java.version>
</properties>
# Gradle's toolchain block goes further and DOWNLOADS the JDK:
#   java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }

# 3. NO SNAPSHOT DEPENDENCIES in a released build. A SNAPSHOT is
#    re-resolved and can change between two builds of the same commit,
#    which makes the build non-reproducible.
#    Enforce it rather than trusting review:
<plugin>
    <artifactId>maven-enforcer-plugin</artifactId>
    <executions><execution>
        <goals><goal>enforce</goal></goals>
        <configuration><rules>
            <requireReleaseDeps/>
            <requireMavenVersion><version>[3.9,)</version></requireMavenVersion>
        </rules></configuration>
    </execution></executions>
</plugin>`,
                `# Which phase runs what - the distinction that matters in CI.
#
#   ./mvnw test       unit tests        (*Test.java)      surefire
#   ./mvnw verify     unit + INTEGRATION (*IT.java)       + failsafe
#   ./mvnw package    builds the jar; runs test, not verify
#
# 'mvn verify' is the correct CI command. 'mvn package' silently skips
# integration tests, so a pipeline using it reports green while never
# running them.

# Failsafe is not configured by the Boot parent - add it if you use
# the *IT.java convention:
<plugin>
    <artifactId>maven-failsafe-plugin</artifactId>
    <executions><execution>
        <goals><goal>integration-test</goal><goal>verify</goal></goals>
    </execution></executions>
</plugin>`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does <code>spring-boot-starter-parent</code> provide?</td><td>Managed versions for hundreds of libraries, plus compiler, resource-filtering and plugin defaults - so dependencies need no <code>&lt;version&gt;</code>.</td></tr>
<tr><td>What if you cannot use the parent?</td><td>Import <code>spring-boot-dependencies</code> as a BOM in <code>dependencyManagement</code> with <code>&lt;scope&gt;import&lt;/scope&gt;</code>.</td></tr>
<tr><td>What does <code>spring-boot-maven-plugin</code> do?</td><td>Its <code>repackage</code> goal rewrites the jar into the Boot layout with a launcher, and it provides the <code>run</code> and <code>build-image</code> goals.</td></tr>
<tr><td>Describe the executable jar layout.</td><td><code>BOOT-INF/classes</code> for your code, <code>BOOT-INF/lib</code> for dependencies as nested jars, the loader classes at the root, and a manifest whose <code>Main-Class</code> is <code>JarLauncher</code> with your class as <code>Start-Class</code>.</td></tr>
<tr><td>Why is a custom classloader needed?</td><td>Standard Java cannot load a jar nested inside a jar, so Boot's launcher builds a classloader over <code>BOOT-INF/lib</code> before invoking your main class.</td></tr>
<tr><td>How do you upgrade one managed library?</td><td>Override the parent's version property - not by adding a <code>&lt;version&gt;</code> to one artifact, which splits a library family and causes <code>NoSuchMethodError</code> at runtime.</td></tr>
<tr><td>Which module gets the plugin in a multi-module build?</td><td>Only the deployable one. Library modules must stay plain jars, or use <code>&lt;classifier&gt;</code> so both artifacts are produced.</td></tr>
<tr><td>Why are library-module beans not found?</td><td>Component scanning follows packages, not jars. Share a root package, or have the library ship an auto-configuration.</td></tr>
<tr><td><code>-DskipTests</code> vs <code>-Dmaven.test.skip=true</code>?</td><td>The first compiles tests but does not run them; the second does not compile them, so breakage is hidden until later.</td></tr>
<tr><td><code>mvn package</code> or <code>mvn verify</code> in CI?</td><td><code>verify</code> - <code>package</code> runs unit tests only and silently skips Failsafe integration tests.</td></tr>
</table>`
        }
    ]
};
