import { Topic } from '../coreJava';

export const springBootExecutableJar: Topic = {
    id: 'spring-boot-executable-jar',
    name: 'Building & Running an Executable JAR',
    beginner: [
        {
            content: `<h3>What is a Spring Boot Executable JAR?</h3>
The Spring Boot executable jar contains the class files together with <strong>all the libraries the application needs to run</strong> and perform the task it was built for.<br><br>

<h3>Why do we use it?</h3>
The user does not have to maintain the dependencies. They just execute it.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">TRADITIONAL WAR                     SPRING BOOT FAT JAR

 install Tomcat                      java -jar app.jar
 configure it                              |
 copy app.war to webapps/                  v
 restart Tomcat                       it just runs
      |
      v
  application runs</pre>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add Maven dependencies &nbsp; 3. Create the REST controller<br>
4. Run the application &nbsp; 5. Open Postman and hit the request &nbsp; 6. Create the executable jar<br>
7. Generate a Build Success &nbsp; 8. Execute the jar at the command prompt<br>
9. See the "started successfully" message &nbsp; 10. Open the browser and hit the URL &nbsp; 11. Check the output
</div>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>`,
                `<!-- The plugin that actually creates the executable jar.
     Without it you get a plain jar with no dependencies and no
     Main-Class, and "java -jar" fails with:
       no main manifest attribute, in target/app.jar -->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>`,
                `// Step 3 - TestController.java
package com.velocity.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/get")
    public String getDemo() {
        return "Spring boot executable jar file.";
    }
}`
            ]
        },
        {
            content: `<h3>Prerequisite - Install Apache Maven</h3>
Running the build from the command line needs Maven on the machine, and on the PATH.<br><br>

<div class="border">
1. Download Maven and extract it, for example to<br>
&nbsp;&nbsp;<code>C:\\Program Files\\apache-maven-3.9.2</code><br><br>
2. Press <strong>Windows + R</strong>, type <code>sysdm.cpl</code>, and open <em>Advanced -> Environment Variables</em>.<br><br>
3. Under <strong>System variables</strong>, select <code>Path</code>, click <em>Edit</em>, then <em>New</em>, and add:<br>
&nbsp;&nbsp;<code>C:\\Program Files\\apache-maven-3.9.2\\bin</code><br><br>
4. Still under System variables, click <em>New</em> and add:<br>
&nbsp;&nbsp;Variable name: <code>MAVEN_HOME</code><br>
&nbsp;&nbsp;Variable value: <code>C:\\Program Files\\apache-maven-3.9.2</code><br><br>
5. Click OK on every dialog, then open a <strong>new</strong> command prompt - an already-open one keeps the old environment.
</div>`,
            codeExamples: [
                `# Verify the installation
C:\\> mvn -version

Apache Maven 3.9.2
Maven home: C:\\Program Files\\apache-maven-3.9.2
Java version: 17.0.7, vendor: Eclipse Adoptium
Default locale: en_IN, platform encoding: UTF-8
OS name: "windows 11", arch: "amd64"

# If instead you see:
# 'mvn' is not recognized as an internal or external command
# then Path is wrong, or the command prompt was opened before
# the variable was added.`
            ]
        },
        {
            content: `<h3>Steps 6 and 7 - Build the JAR</h3>
Right-click the project and choose <strong>Maven Clean</strong>, then run the package build. From the command line both happen in one command.<br><br>

<table>
<tr><th>Goal</th><th>What it does</th></tr>
<tr><td><code>clean</code></td><td>Deletes the <code>target/</code> directory, so nothing stale is reused.</td></tr>
<tr><td><code>package</code></td><td>Compiles, runs the tests, and produces the jar in <code>target/</code>.</td></tr>
</table>`,
            codeExamples: [
                `# Open a command prompt in the project folder (the one with pom.xml)
C:\\> cd C:\\workspace\\SpringBootExecutableJarDemo

C:\\workspace\\SpringBootExecutableJarDemo> mvn clean package

[INFO] Scanning for projects...
[INFO] Building SpringBootExecutableJarDemo 0.0.1-SNAPSHOT
[INFO] --- maven-clean-plugin:3.2.0:clean ---
[INFO] --- maven-compiler-plugin:3.11.0:compile ---
[INFO] Compiling 2 source files
[INFO] --- maven-surefire-plugin:3.0.0:test ---
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] --- maven-jar-plugin:3.3.0:jar ---
[INFO] Building jar: target\\SpringBootExecutableJarDemo-0.0.1-SNAPSHOT.jar
[INFO] --- spring-boot-maven-plugin:3.1.0:repackage ---
[INFO] Replacing main artifact with repackaged archive
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  12.482 s

# The "repackage" line is the important one - that is the Spring Boot
# plugin turning the plain jar into the executable fat jar.`
            ]
        },
        {
            content: `<h3>Steps 8 to 11 - Run It</h3>
Go into the <code>target</code> folder and run <code>java -jar</code> followed by the jar name.<br>`,
            codeExamples: [
                `C:\\workspace\\SpringBootExecutableJarDemo> cd target

C:\\workspace\\SpringBootExecutableJarDemo\\target> java -jar SpringBootExecutableJarDemo-0.0.1-SNAPSHOT.jar

  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.1.0)

Starting SpringBootExecutableJarDemoApplication using Java 17.0.7
Tomcat initialized with port(s): 8080 (http)
Tomcat started on port(s): 8080 (http) with context path ''
Started SpringBootExecutableJarDemoApplication in 1.842 seconds

# No Tomcat was installed. The server is inside the jar.`,
                `// Step 10/11 - open a browser (or Postman) at:
// http://localhost:8080/get

// OUTPUT:
Spring boot executable jar file.

// Stop the application with Ctrl+C in the command prompt.`,
                `# Useful variations, all without rebuilding:
java -jar app.jar --server.port=9090
java -jar app.jar --spring.profiles.active=prod
java -jar app.jar --debug
java -Xmx512m -jar app.jar

# And to see what is actually inside the jar:
jar tf SpringBootExecutableJarDemo-0.0.1-SNAPSHOT.jar | more
# BOOT-INF/classes/com/velocity/controller/TestController.class
# BOOT-INF/lib/spring-web-6.0.9.jar
# BOOT-INF/lib/tomcat-embed-core-10.1.8.jar
# META-INF/MANIFEST.MF
# org/springframework/boot/loader/JarLauncher.class`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What Is Actually Inside the Fat JAR</h3>
A normal jar cannot contain other jars - the standard class loader will not read a jar nested inside a jar. Spring Boot solves this with its own layout and its own loader.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">app.jar
 |
 +-- META-INF/
 |     MANIFEST.MF
 |         Main-Class:       org.springframework.boot.loader.JarLauncher
 |         Start-Class:      com.velocity.DemoApplication
 |
 +-- org/springframework/boot/loader/     <- the launcher, unpacked
 |     JarLauncher.class
 |     LaunchedURLClassLoader.class
 |
 +-- BOOT-INF/
       classes/        <- YOUR compiled code and resources
       lib/            <- every dependency, as nested jars
             spring-web-6.0.9.jar
             tomcat-embed-core-10.1.8.jar
             ...</pre>

<table>
<tr><th>Manifest entry</th><th>Meaning</th></tr>
<tr><td><code>Main-Class</code></td><td><code>JarLauncher</code> - what <code>java -jar</code> actually starts.</td></tr>
<tr><td><code>Start-Class</code></td><td>Your <code>@SpringBootApplication</code> class, which JarLauncher calls once its class loader is ready.</td></tr>
</table>
<br>
So <code>java -jar</code> starts Spring Boot's launcher, which installs a class loader able to read the nested jars in <code>BOOT-INF/lib</code>, and only then hands control to your <code>main</code> method.<br>`,
            codeExamples: [
                `# Read the manifest of a built jar
unzip -p app.jar META-INF/MANIFEST.MF

Manifest-Version: 1.0
Main-Class: org.springframework.boot.loader.JarLauncher
Start-Class: com.velocity.SpringBootExecutableJarDemoApplication
Spring-Boot-Version: 3.1.0
Spring-Boot-Classes: BOOT-INF/classes/
Spring-Boot-Lib: BOOT-INF/lib/`,
                `# The most common failure, and what it means
$ java -jar target/app.jar
no main manifest attribute, in target/app.jar

# Cause: spring-boot-maven-plugin is missing from pom.xml, so the
# repackage step never ran and the jar has no Main-Class.
# Fix: add the plugin and rebuild.

# A second one:
$ java -jar app.jar
Error: Unable to access jarfile app.jar
# Cause: wrong directory, or the version in the filename changed.
# ls target/*.jar to see the real name.`
            ]
        },
        {
            content: `<h3>WAR When You Need It, and How to Build Both</h3>
The fat jar is the default and there are still places that require a WAR - an existing corporate Tomcat, a WebLogic or WebSphere estate, an ops team that owns the container.<br><br>

Two changes are needed, and forgetting the second one is the classic mistake: the WAR deploys, and every URL returns 404, because <code>DispatcherServlet</code> was never registered by the external container.<br>`,
            codeExamples: [
                `<!-- 1. Change the packaging -->
<packaging>war</packaging>

<!-- 2. Mark the embedded Tomcat "provided" so it is NOT bundled -
        the external container supplies its own -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>`,
                `// 3. Extend SpringBootServletInitializer - this is the step
//    people miss, and it is why the deployed WAR 404s everywhere.
package com.velocity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class DemoApplication extends SpringBootServletInitializer {

    // Used when an EXTERNAL container starts the app
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(DemoApplication.class);
    }

    // Still used when you run it locally with java -jar
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
// OUTPUT: target/app.war deploys into Tomcat's webapps/ AND still
// runs standalone. The context path becomes /app rather than /,
// so URLs are http://localhost:8080/app/get.`
            ]
        },
        {
            content: `<h3>Layered JARs Make Docker Builds Fast</h3>
Copying a 50 MB fat jar into a Docker image means every code change - even a one-character fix - invalidates the layer holding all your dependencies. Spring Boot 2.3+ can split the jar into layers that change at different rates.<br><br>

<table>
<tr><th>Layer</th><th>Changes</th></tr>
<tr><td>dependencies</td><td>Rarely - only when pom.xml changes</td></tr>
<tr><td>spring-boot-loader</td><td>Almost never</td></tr>
<tr><td>snapshot-dependencies</td><td>Occasionally</td></tr>
<tr><td>application</td><td><strong>Every build</strong> - and it is the smallest</td></tr>
</table>
<br>
Docker caches unchanged layers, so a code-only change rebuilds and pushes a few hundred kilobytes instead of fifty megabytes.<br>`,
            codeExamples: [
                `<!-- Enable layering (default from Boot 2.4) -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <layers>
            <enabled>true</enabled>
        </layers>
    </configuration>
</plugin>`,
                `# Inspect and extract the layers
java -Djarmode=layertools -jar app.jar list
# dependencies
# spring-boot-loader
# snapshot-dependencies
# application

java -Djarmode=layertools -jar app.jar extract`,
                `# A multi-stage Dockerfile using them
FROM eclipse-temurin:17-jre AS builder
WORKDIR /app
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM eclipse-temurin:17-jre
WORKDIR /app
# Ordered least- to most-frequently changed
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]

# OUTPUT: a code-only change rebuilds the last COPY layer only.
# Push size drops from ~50 MB to ~300 KB.

# Or skip the Dockerfile entirely - the plugin can build the image:
#   mvn spring-boot:build-image`
            ]
        },
        {
            content: `<h3>Running It as a Real Service</h3>
<code>java -jar</code> in a terminal stops when the terminal closes. Production needs the application supervised, restarted on failure, and started at boot. On Linux that is systemd.<br>`,
            codeExamples: [
                `# /etc/systemd/system/employee-app.service
[Unit]
Description=Employee Service
After=network.target

[Service]
User=appuser
WorkingDirectory=/opt/employee-app
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/employee-app/app.jar
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="DB_PASSWORD=..."
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`,
                `# Manage it
sudo systemctl daemon-reload
sudo systemctl enable employee-app     # start on boot
sudo systemctl start employee-app
sudo systemctl status employee-app
sudo journalctl -u employee-app -f     # follow the logs

# SuccessExitStatus=143 matters: 143 is 128+15 (SIGTERM), which is
# a NORMAL shutdown. Without it systemd treats every graceful stop
# as a crash and keeps restarting.`,
                `# Graceful shutdown - let in-flight requests finish
# application.properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s

# OUTPUT on SIGTERM:
# Commencing graceful shutdown. Waiting for active requests to complete
# Graceful shutdown complete
# Without it, active requests are cut off mid-response.

# And never run as root:
#   User=appuser
# A compromised application should not own the machine.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a Spring Boot executable jar?</td><td>A self-contained "fat jar" holding your classes, every dependency, and an embedded servlet container, runnable with <code>java -jar</code>.</td></tr>
<tr><td>Which plugin creates it?</td><td><code>spring-boot-maven-plugin</code>, through its <code>repackage</code> goal.</td></tr>
<tr><td>What does "no main manifest attribute" mean?</td><td>The repackage step never ran - usually the plugin is missing from pom.xml - so the jar has no Main-Class.</td></tr>
<tr><td>What is the Main-Class in a Boot jar?</td><td><code>org.springframework.boot.loader.JarLauncher</code>. Your own class is recorded separately as <code>Start-Class</code>.</td></tr>
<tr><td>Why is a custom launcher needed?</td><td>The standard class loader cannot read a jar nested inside a jar, so Boot ships <code>LaunchedURLClassLoader</code> to load <code>BOOT-INF/lib</code>.</td></tr>
<tr><td>Where does your code live inside the jar?</td><td><code>BOOT-INF/classes/</code>; dependencies are in <code>BOOT-INF/lib/</code>.</td></tr>
<tr><td>Difference between <code>mvn package</code> and <code>mvn install</code>?</td><td><code>package</code> builds the jar into <code>target/</code>; <code>install</code> also copies it into the local <code>~/.m2</code> repository.</td></tr>
<tr><td>How do you change the port without rebuilding?</td><td><code>java -jar app.jar --server.port=9090</code>.</td></tr>
<tr><td>What is needed to build a deployable WAR?</td><td><code>&lt;packaging&gt;war&lt;/packaging&gt;</code>, embedded Tomcat scoped <code>provided</code>, and the main class extending <code>SpringBootServletInitializer</code>.</td></tr>
<tr><td>What happens if you skip SpringBootServletInitializer?</td><td>The WAR deploys but every URL returns 404 - the external container never registers the DispatcherServlet.</td></tr>
<tr><td>What are layered jars for?</td><td>Splitting the jar so Docker caches dependencies separately from application code, cutting rebuild and push size dramatically.</td></tr>
<tr><td>Why does a systemd unit need <code>SuccessExitStatus=143</code>?</td><td>143 is 128+SIGTERM, a normal shutdown. Without it every graceful stop looks like a crash and triggers a restart loop.</td></tr>
</table>`
        }
    ]
};
