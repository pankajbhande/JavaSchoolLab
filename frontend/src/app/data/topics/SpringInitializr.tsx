import { Topic } from '../coreJava';

export const springInitializr: Topic = {
    id: 'sb-spring-initializr',
    name: "Spring Initializr",
    beginner: [
        {
            content: `<h3>The Standard Way to Start a Project</h3>
<strong>start.spring.io</strong> generates a working, correctly-versioned Spring Boot project as a zip. It is the official starting point, and every Spring Boot tutorial that begins "create a new project" means this.<br><br>

It exists because the two things that go wrong at the start of a project are both version problems: picking a Boot version that does not match your Java version, and picking library versions that were never tested together. Initializr cannot get either wrong - it only offers combinations that exist.<br><br>

The same generator is built into IntelliJ IDEA (<em>New Project → Spring Boot</em>), VS Code (<em>Spring Initializr: Create a Project</em>) and Eclipse with STS, so most people never open the website.<br>`
        },
        {
            content: `<h3>The Fields, and What Each One Sets</h3>

<table>
<tr><th>Field</th><th>Sets</th><th>Guidance</th></tr>
<tr><td>Project</td><td>Maven or Gradle</td><td>Maven unless your team already uses Gradle.</td></tr>
<tr><td>Language</td><td>Java / Kotlin / Groovy</td><td>—</td></tr>
<tr><td>Spring Boot</td><td>Parent pom version</td><td>Take the highest plain number. <code>SNAPSHOT</code>, <code>M1</code> and <code>RC1</code> are pre-releases.</td></tr>
<tr><td>Group</td><td><code>&lt;groupId&gt;</code></td><td>Reverse domain - <code>com.dhipan</code>.</td></tr>
<tr><td>Artifact</td><td><code>&lt;artifactId&gt;</code>, and the jar name</td><td>Lowercase with hyphens - <code>order-service</code>.</td></tr>
<tr><td>Name</td><td>The main class name</td><td>Follows Artifact by default.</td></tr>
<tr><td>Package name</td><td>The root package</td><td>Group + artifact. <strong>This decides what gets component-scanned.</strong></td></tr>
<tr><td>Packaging</td><td>Jar or War</td><td>Jar, unless deploying to an external application server.</td></tr>
<tr><td>Java</td><td>Source/target release</td><td>The highest LTS your Boot version supports - 17 or 21 for Boot 3.</td></tr>
<tr><td>Dependencies</td><td>Starters in the pom</td><td>Add only what you need now; adding one later is one line.</td></tr>
</table>
<br>
The field that matters most later is <strong>Package name</strong>. The generated main class goes there, and <code>@SpringBootApplication</code> scans its own package downwards - so that value silently defines the scanned tree for the life of the project.<br>`
        },
        {
            content: `<h3>What You Get</h3>`,
            codeExamples: [
                `order-service/
 |- pom.xml                      parent + your chosen starters, no versions
 |- mvnw, mvnw.cmd               the Maven Wrapper
 |- .mvn/wrapper/                its configuration
 |- .gitignore                   target/, IDE files
 |- HELP.md                      links for the starters you picked
 |- src/
     |- main/
     |   |- java/com/dhipan/orderservice/
     |   |   |- OrderServiceApplication.java
     |   |- resources/
     |       |- application.properties        (empty)
     |       |- static/                       (empty)
     |       |- templates/                    (empty)
     |- test/
         |- java/com/dhipan/orderservice/
             |- OrderServiceApplicationTests.java

// It runs immediately:
//   ./mvnw spring-boot:run
//
// The generated test is not a placeholder - it asserts the whole
// application context starts:
//
//   @SpringBootTest
//   class OrderServiceApplicationTests {
//       @Test void contextLoads() { }
//   }
//
// An empty method that catches every wiring error, missing bean and
// bad property in the project. Keep it.`,
                `// The wrapper - mvnw and mvnw.cmd - is the part people delete and
// should not.
//
// It is a small script that downloads the EXACT Maven version the
// project expects and runs the build with it. Nobody needs Maven
// installed, and nobody builds with a different version:
//
//   ./mvnw clean package          instead of   mvn clean package
//
// COMMIT mvnw, mvnw.cmd and .mvn/ - they are project files, not
// generated output. The .gitignore Initializr writes already keeps
// them, which is why it excludes target/ but not .mvn/.
//
// The version it pins:
//   .mvn/wrapper/maven-wrapper.properties
//   distributionUrl=https://.../apache-maven-3.9.6-bin.zip`
            ]
        },
        {
            content: `<h3>Picking the Versions</h3>
The two version choices are linked, and getting them wrong is the most common first-day failure.<br><br>

<table>
<tr><th>Spring Boot</th><th>Java required</th><th>Namespace</th></tr>
<tr><td>2.x</td><td>8+</td><td><code>javax.*</code></td></tr>
<tr><td>3.0 - 3.1</td><td><strong>17+</strong></td><td><code>jakarta.*</code></td></tr>
<tr><td>3.2+</td><td>17+, 21 supported</td><td><code>jakarta.*</code></td></tr>
</table>
<br>
Two consequences worth knowing before you generate:<br><br>

<strong>Boot 3 requires Java 17.</strong> Choosing Boot 3 with Java 8 selected is not offered, and a project generated for Boot 3 will not build on a JDK 11 machine - the error is a cryptic class-file version message, not a helpful one.<br><br>

<strong>Boot 3 renamed the enterprise packages.</strong> <code>javax.persistence.Entity</code> is now <code>jakarta.persistence.Entity</code>. This is why a pre-2022 tutorial's imports will not resolve in a project you generate today - the code is right, the package moved.<br>`,
            codeExamples: [
                `// The error when the JDK is older than the project expects:
//
//   [ERROR] Failed to execute goal ...maven-compiler-plugin:compile
//   [ERROR] error: invalid target release: 17
//
// or at runtime:
//
//   UnsupportedClassVersionError: com/dhipan/App has been compiled by
//   a more recent version of the Java Runtime (class file version
//   61.0), this version of the Java Runtime only recognizes class
//   file versions up to 55.0
//
//   61.0 = Java 17,  55.0 = Java 11,  65.0 = Java 21
//
// Check what you are actually running - the IDE and the shell often
// differ:
//     java -version
//     ./mvnw -version`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Initializr Is an API</h3>
The website is a front end over a REST service, which means project generation can be scripted - useful for templates, workshops and CI.<br>`,
            codeExamples: [
                `# Generate and unpack in one line.
curl https://start.spring.io/starter.tgz \\
  -d type=maven-project \\
  -d language=java \\
  -d bootVersion=3.2.3 \\
  -d groupId=com.dhipan \\
  -d artifactId=order-service \\
  -d name=OrderService \\
  -d packageName=com.dhipan.orderservice \\
  -d javaVersion=21 \\
  -d dependencies=web,data-jpa,validation,actuator,postgresql \\
  | tar -xzvf -

# starter.zip works the same way for a zip.

# Ask what is available rather than guessing an id:
curl https://start.spring.io/metadata/client | jq '.dependencies.values[]
                                                   | .values[]
                                                   | {id, name}'
# OUTPUT:
# { "id": "web",       "name": "Spring Web" }
# { "id": "data-jpa",  "name": "Spring Data JPA" }
# { "id": "lombok",    "name": "Lombok" }
# ...

# The plain-text help, readable in a terminal:
curl https://start.spring.io`,
                `# The Spring Boot CLI does the same without curl:
#   sdk install springboot
#   spring init --build=maven --java-version=21 \\
#               --dependencies=web,data-jpa \\
#               --package-name=com.dhipan.orderservice \\
#               order-service
#
# and lists what it can offer:
#   spring init --list`
            ]
        },
        {
            content: `<h3>Running Your Own Initializr</h3>
Initializr is open source and designed to be self-hosted, which is how organisations standardise new services.<br>`,
            codeExamples: [
                `// A company instance adds your own conventions to the generated
// project - so every new service starts with the same logging config,
// the same base image, the same internal starters and the same
// pipeline file.

// application.yml of your Initializr instance:
initializr:
  dependencies:
    - name: DHIPAN Internal
      content:
        - name: DHIPAN Security
          id: dhipan-security
          groupId: com.dhipan
          artifactId: dhipan-security-starter
          description: Standard authentication and audit logging
          starter: true
        - name: DHIPAN Observability
          id: dhipan-observability
          groupId: com.dhipan
          artifactId: dhipan-observability-starter

// Teams then generate from initializr.dhipan.internal and get the
// house setup by default.
//
// The value is not saving typing. It is that "how do we start a
// service here" stops being tribal knowledge and becomes a dropdown -
// and a security or logging change can be rolled into the template
// rather than communicated.

// Deeper customisation - adding files, not just dependencies - uses
// initializr-generator: a ProjectContributor can write a Dockerfile,
// a CI config or a starter README into every generated project.`
            ]
        },
        {
            content: `<h3>The First Ten Minutes After Generating</h3>
Initializr gives a project that runs, not a project that is set up. Five things are worth doing immediately.<br>`,
            codeExamples: [
                `// 1. COMMIT BEFORE CHANGING ANYTHING.
git init && git add . && git commit -m "Generated by Spring Initializr"
// The first commit is then a clean baseline, and any later "was that
// generated or did we write it?" is answerable with git log.

// 2. CHECK WHERE THE MAIN CLASS SITS.
//    It defines the component-scan root. If your packages will not all
//    live beneath it, move it up now rather than adding
//    scanBasePackages later.
com.dhipan.orderservice
 |- OrderServiceApplication.java     <- scan root
 |- domain/  web/  infrastructure/   <- all below it: correct

// 3. ADD THE CONFIGURATION PROCESSOR - three lines that pay for
//    themselves the first time someone misspells a property.
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>

// 4. SET THE OBVIOUS PROPERTIES.
//    application.properties arrives empty. At minimum:
spring.application.name=order-service
server.shutdown=graceful
spring.jpa.open-in-view=false

// 5. VERIFY THE GENERATED TEST RUNS.
./mvnw test
//    If contextLoads() fails on day one, it is a configuration problem
//    that will only get harder to find once there is code on top.`,
                `// A note on the dependency list, since it is the one field people
// over-fill.
//
// ADD NOW - they shape the project structure:
//   Spring Web / Spring Reactive Web   (they are alternatives, not both)
//   Spring Data JPA + a database driver
//   Validation
//   Lombok             (a compile-time choice; awkward to retrofit)
//
// ADD LATER, one line each, no restructuring:
//   Actuator, Security, Cache, Mail, Quartz, Kafka, Testcontainers
//
// The cost of an unused starter is not only jar size - it is
// auto-configuration. spring-boot-starter-security added
// "just in case" immediately locks every endpoint behind HTTP Basic
// with a generated password, and the first symptom is a 401 nobody
// asked for:
//
//   Using generated security password: 8e1c...
//
// Pick the dependencies for the application you are writing today.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Spring Initializr?</td><td>The official project generator at start.spring.io, also built into IntelliJ, VS Code and STS. It produces a runnable Boot project with compatible versions.</td></tr>
<tr><td>What problem does it solve?</td><td>Version compatibility - it only offers Boot, Java and starter combinations that are known to work together.</td></tr>
<tr><td>Which field has the longest-lived effect?</td><td>Package name - the main class goes there and <code>@SpringBootApplication</code> scans that package downwards, so it defines the scan root for the project's life.</td></tr>
<tr><td>Jar or War?</td><td>Jar with an embedded server by default; War only for deployment to an external application server.</td></tr>
<tr><td>What is <code>mvnw</code> and should it be committed?</td><td>The Maven Wrapper - it downloads and uses the exact Maven version the project pins. Commit <code>mvnw</code>, <code>mvnw.cmd</code> and <code>.mvn/</code>.</td></tr>
<tr><td>What Java version does Boot 3 need?</td><td>17 minimum, with 21 supported from 3.2. Boot 3 also moved <code>javax.*</code> to <code>jakarta.*</code>.</td></tr>
<tr><td>What does the generated test do?</td><td><code>contextLoads()</code> starts the whole application context - it catches missing beans, wiring errors and bad configuration in one empty method.</td></tr>
<tr><td>Can projects be generated without the website?</td><td>Yes - <code>curl https://start.spring.io/starter.tgz -d ...</code>, or <code>spring init</code> with the Boot CLI.</td></tr>
<tr><td>Why would a company self-host Initializr?</td><td>To offer internal starters and conventions by default, so new services begin identically and template changes propagate through a dropdown rather than word of mouth.</td></tr>
<tr><td>Why not add every dependency you might need?</td><td>Each starter brings auto-configuration. Adding Security "just in case" locks every endpoint behind Basic auth with a generated password.</td></tr>
</table>`
        }
    ]
};
