import { Topic } from '../coreJava';

export const springBootDocker: Topic = {
    id: 'spring-boot-docker',
    name: 'Containerising with Docker',
    beginner: [
        {
            content: `<h3>Business Requirement</h3>
An application that runs correctly on the developer's machine must run identically on a tester's machine, on UAT, on production, and on the client's laptop - without anyone installing Java, MySQL, Tomcat or Kafka by hand.<br><br>

<h3>Problem Statement</h3>
Consider an application whose environment is Java 1.8, MySQL 5.6, Tomcat 9.0 and Kafka 3.1. A new developer joins with Java 11, MySQL 6.1, Tomcat 8.5 and no Kafka at all. The same source code will not start on that machine. The setup, not the code, is the obstacle.<br><br>

The classroom material lists four scenarios that all reduce to the same complaint:<br>
<div class="border">
<strong>Scenario 1</strong> - Team member 1 is on Windows with Oracle 7 and Java 8; team member 2 is on Mac with Oracle 8 and Java 11. "It works on my machine" is true and useless.<br>
<strong>Scenario 2</strong> - Test, UAT and Production are three separate servers. Each one has to be provisioned manually with the right Java version, the right database, the right message broker.<br>
<strong>Scenario 3</strong> - The client wants to run the application. The client is not technical. Java, Angular and the database still have to be installed before anything happens.<br>
<strong>Scenario 4</strong> - The client has many machines. Six months later they ask for three or four more. Every one of them is a fresh manual install, and there is no guarantee the result behaves the same.
</div><br>

Handing over a URL does not help either. Without the runtime installed underneath it, there is nothing for the URL to reach.`
        },
        {
            content: `<h3>First Attempt - Virtualisation</h3>
The older answer was to run several operating systems on one physical machine through a <strong>hypervisor</strong>. Each guest OS carries its own kernel, its own Java, its own MySQL.<br><br>

That solves portability but costs dearly: every virtual machine boots a complete operating system, so memory and CPU are consumed by four copies of an OS before any application code runs. Start-up is measured in minutes.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  VIRTUAL MACHINES                      CONTAINERS
  +---------+---------+                 +---------+---------+
  |  App A  |  App B  |                 |  App A  |  App B  |
  +---------+---------+                 +---------+---------+
  | Bins/Libs|Bins/Libs|                | Bins/Libs|Bins/Libs|
  +---------+---------+                 +---------+---------+
  | Guest OS| Guest OS|  <-- heavy      |   Container Engine |
  +---------+---------+                 +-------------------+
  |     Hypervisor    |                 |    Host OS Kernel |
  +-------------------+                 +-------------------+
  |     Host OS       |                 |     Hardware      |
  +-------------------+                 +-------------------+
  |     Hardware      |
  +-------------------+
  Boots in minutes, GBs           Starts in ms/seconds, MBs
</pre>`
        },
        {
            content: `<h3>Containerisation</h3>
A <strong>container</strong> is a package that holds the application together with the libraries, dependencies and runtime it needs, and runs as an isolated process on the host operating system. There is no guest OS inside it - it shares the host kernel.<br><br>

<table>
<tr><th>Term</th><th>Meaning</th></tr>
<tr><td><strong>Dockerfile</strong></td><td>A text file of instructions describing how to assemble the image - the infrastructure recipe.</td></tr>
<tr><td><strong>Docker image</strong></td><td>The immutable, read-only artefact produced by <code>docker build</code>. It contains the runtime, the libraries and your jar.</td></tr>
<tr><td><strong>Docker container</strong></td><td>A running instance of an image, with a thin writable layer on top. Many containers can run from one image.</td></tr>
<tr><td><strong>Docker Hub / registry</strong></td><td>The remote store images are pushed to and pulled from.</td></tr>
<tr><td><strong>Docker Engine / daemon</strong></td><td>The background service that actually builds images and runs containers.</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Dockerfile  --docker build-->  Image  --docker run-->  Container
       ^                           |                          |
       |                    docker push                docker logs / exec
   you write it                    v
                              Docker Hub  --docker pull--> any machine
</pre>

The payoff is the point of the whole exercise: setting up an environment drops from about a week of manual installation to five or ten minutes of <code>docker pull</code> and <code>docker run</code>.`
        },
        {
            content: `<h3>Installing Docker Desktop on Windows</h3>
<div class="border">
1. Go to <code>https://hub.docker.com/</code> and register an account.<br>
2. Fill in the details, click <code>Sign Up</code>, then verify the email address that arrives in your mailbox.<br>
3. Download <code>Docker Desktop Installer.exe</code> for Windows and run it, allowing it to make changes to the device.<br>
4. Accept the licence terms, then let the installer finish and restart the machine.<br>
5. Docker needs a Linux kernel. In Windows search, open <code>Turn Windows features on or off</code> and tick <code>Windows Hypervisor Platform</code> and <code>Windows Subsystem for Linux</code>.<br>
6. Restart, then confirm WSL from a command prompt.
</div><br>

On Windows, containers do not run on the Windows kernel. <strong>WSL 2</strong> supplies a real Linux kernel, and Docker Desktop runs the engine inside it. That is why the WSL feature is not optional.`,
            codeExamples: [
                `REM Verify WSL is present and up to date
wsl --status
REM OUTPUT:
REM Default Distribution: docker-desktop
REM Default Version: 2
REM Kernel version: 5.15.90.1
REM A newer version of Windows Subsystem for Linux is available.
REM Run 'wsl --update' ...

wsl --update
REM OUTPUT: Installing: Windows Subsystem for Linux
REM         Windows Subsystem for Linux has been installed.

wsl --set-default-version 2
REM OUTPUT: For information on key differences with WSL 2 please visit ...
REM         The operation completed successfully.`,
                `REM Manual route, if the checkbox route fails.
REM Run Windows PowerShell AS ADMINISTRATOR, then:

dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
REM OUTPUT:
REM Deployment Image Servicing and Management tool
REM Version: 10.0.22621.1
REM Enabling feature(s)
REM The operation completed successfully.

dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
REM OUTPUT: The operation completed successfully.

REM Check the Windows build - WSL 2 needs 1903 / build 18362 or later
winver`
            ]
        },
        {
            content: `<h3>The Commands You Will Actually Use</h3>
Start Docker Desktop first - if the engine is not running, every command below fails with <code>error during connect ... The system cannot find the file specified</code>.<br><br>

<table>
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td><code>docker --version</code></td><td>Confirms the client is installed and on the PATH.</td></tr>
<tr><td><code>docker info</code></td><td>Full engine report - container counts, storage driver, OS, memory. Also proves the daemon is reachable.</td></tr>
<tr><td><code>docker login</code></td><td>Authenticates against Docker Hub before a push.</td></tr>
<tr><td><code>docker images</code></td><td>Lists local images with repository, tag, image id and size.</td></tr>
<tr><td><code>docker ps</code></td><td>Lists running containers. <code>docker ps -a</code> includes stopped ones.</td></tr>
<tr><td><code>docker pull &lt;image&gt;</code></td><td>Downloads an image from the registry.</td></tr>
<tr><td><code>docker run -p 8080:8080 &lt;image&gt;</code></td><td>Creates and starts a container, mapping host port to container port.</td></tr>
<tr><td><code>docker build -t &lt;name&gt; .</code></td><td>Builds an image from the Dockerfile in the current directory.</td></tr>
<tr><td><code>docker tag</code> / <code>docker push</code></td><td>Renames an image for a registry and uploads it.</td></tr>
<tr><td><code>docker rmi &lt;image id&gt;</code></td><td>Removes a local image. <code>docker rm</code> removes a container.</td></tr>
</table>
<br>
The PDF writes <code>docker-run</code> with a hyphen. That is a typo - the command is <code>docker run</code>. <code>docker-compose</code> is the only hyphenated form, and modern Docker prefers <code>docker compose</code>.`,
            codeExamples: [
                `C:\\\\Users\\\\dev> docker --version
Docker version 24.0.6, build ed223bc

C:\\\\Users\\\\dev> docker login
Login with your Docker ID ...
Username: jeevansir
Password:
Login Succeeded

C:\\\\Users\\\\dev> docker images
REPOSITORY             TAG       IMAGE ID       CREATED          SIZE
springbootwithdocker   latest    9c1f2ad3e77b   2 minutes ago    542MB
openjdk                8         b273004037cc   14 months ago    526MB

C:\\\\Users\\\\dev> docker ps
CONTAINER ID   IMAGE                  COMMAND                  STATUS         PORTS                    NAMES
4f2b9c0a11de   springbootwithdocker   "java -jar springbo..."  Up 30 seconds  0.0.0.0:8080->8080/tcp   eager_bose`
            ]
        },
        {
            content: `<h3>Dockerising a Spring Boot Application - Steps</h3>
<div class="border">
1. Create a Spring Starter Project, packaging <code>Jar</code>, type <code>Maven</code>.<br>
2. Add the <code>Spring Web</code> dependency.<br>
3. Write a REST controller with one endpoint.<br>
4. Set <code>&lt;finalName&gt;</code> in <code>pom.xml</code> so the jar has a predictable name.<br>
5. Run <code>mvn clean package</code> from the project folder to produce the jar in <code>target/</code>.<br>
6. Create a <code>Dockerfile</code> at the project root.<br>
7. <code>docker build -t springbootwithdocker .</code><br>
8. <code>docker run -p 8080:8080 springbootwithdocker</code><br>
9. Hit the endpoint in the browser.
</div><br>

<strong>finalName</strong> matters more than it looks. Without it Maven produces <code>my-app-0.0.1-SNAPSHOT.jar</code>, and the version number changes with every release - which would mean editing the Dockerfile on every release. Fixing the name keeps the Dockerfile stable.`,
            codeExamples: [
                `package com.velocity.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DockerController {

    @GetMapping("/welcome")
    public String getDemo() {
        return "Welcome to Spring Boot Developer Batch";
    }
}`,
                `<!-- pom.xml -->
<build>
    <finalName>springbootwithdocker</finalName>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>

<!-- NOTE: the PDF sets <finalName>my_first_docker_app</finalName> in one step
     and then the Dockerfile copies target/springbootwithdocker.jar.
     Those two names MUST match, otherwise the build fails with:
       ERROR: "/target/springbootwithdocker.jar": not found
     Pick one name and use it in both places. -->`,
                `# Step 5 - build the jar first. Docker does NOT compile your code.
D:\\\\workspace\\\\springbootwithdocker> mvn clean package

# OUTPUT (tail):
# [INFO] --- spring-boot-maven-plugin:3.2.0:repackage (repackage) @ springbootwithdocker ---
# [INFO] Replacing main artifact with repackaged archive
# [INFO] ------------------------------------------------------------------------
# [INFO] BUILD SUCCESS
# [INFO] Total time:  18.442 s
#
# target/springbootwithdocker.jar   (about 19 MB, fat jar)`
            ]
        },
        {
            content: `<h3>The Dockerfile</h3>
Create a file named exactly <code>Dockerfile</code> - no extension, capital D - at the project root, beside <code>pom.xml</code>.<br><br>

<table>
<tr><th>Instruction</th><th>What it does</th></tr>
<tr><td><strong>FROM</strong></td><td>Names the base image the build starts from. Every image begins with a FROM.</td></tr>
<tr><td><strong>EXPOSE</strong></td><td>Documents the port the application listens on. It does <em>not</em> publish it - <code>-p</code> on <code>docker run</code> does that.</td></tr>
<tr><td><strong>COPY</strong></td><td>Copies a file from the build context into the image.</td></tr>
<tr><td><strong>ADD</strong></td><td>Like COPY but also unpacks local archives and fetches URLs. Prefer COPY unless you need those.</td></tr>
<tr><td><strong>ENTRYPOINT</strong></td><td>The executable the container runs. In exec form (a JSON array) it becomes PID 1 directly, with no shell in between.</td></tr>
</table>
<br>
The PDF uses <code>ADD</code>. Use <strong>COPY</strong> instead: ADD's extra behaviour - silently extracting a tar, downloading a URL - is a surprise you do not want in a build.`,
            codeExamples: [
                `# Dockerfile - as printed in the PDF
FROM openjdk:8
EXPOSE 8080
ADD target/springbootwithdocker.jar springbootwithdocker.jar
ENTRYPOINT ["java","-jar","springbootwithdocker.jar"]`,
                `# Dockerfile - the same thing written the way you would ship it
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# COPY, not ADD - no hidden archive extraction or URL fetching
COPY target/springbootwithdocker.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# Why the change from openjdk:8?
#  - The "openjdk" image is deprecated and no longer updated on Docker Hub.
#  - A JRE image is roughly half the size of a JDK image; nothing at runtime compiles.
#  - Exec form ["java","-jar",...] makes the JVM PID 1, so "docker stop" delivers
#    SIGTERM to the JVM and Spring's shutdown hooks actually run.
#    Shell form (ENTRYPOINT java -jar app.jar) puts /bin/sh at PID 1, the signal
#    never reaches Java, and the container is killed after a 10 second timeout.`
            ]
        },
        {
            content: `<h3>Build, Run, Verify</h3>
Open a command prompt in the folder that holds the <code>Dockerfile</code>. The trailing dot in the build command is the <strong>build context</strong> - the directory tree sent to the daemon - not a typo.<br><br>

If port 8080 is already taken on the host, change only the left-hand side: <code>docker run -p 9090:8080 springbootwithdocker</code> then browse to <code>http://localhost:9090/welcome</code>. The container still believes it is on 8080.<br><br>

Docker Desktop can do the same thing from the UI: <code>Images</code>, click the image, <code>Run</code>, set the host port in the optional settings, <code>Run</code>.`,
            codeExamples: [
                `D:\\\\workspace\\\\springbootwithdocker> docker build -t springbootwithdocker .

# OUTPUT:
# [+] Building 24.6s (9/9) FINISHED
#  => [internal] load build definition from Dockerfile          0.0s
#  => [internal] load metadata for docker.io/library/openjdk:8  2.1s
#  => [1/2] FROM docker.io/library/openjdk:8                   18.3s
#  => [internal] load build context                             0.4s
#  => [2/2] ADD target/springbootwithdocker.jar ...             0.6s
#  => exporting to image                                        1.2s
#  => => naming to docker.io/library/springbootwithdocker:latest
#
# Writing to file - "docker build" ran with no -t? Then the image has
# no name and shows up as <none>:<none> in "docker images".`,
                `D:\\\\workspace\\\\springbootwithdocker> docker run -p 8080:8080 springbootwithdocker

# OUTPUT:
#  (Spring Boot banner)
#  :: Spring Boot ::                (v3.2.0)
#
# 2024-05-14T09:12:04.771Z  INFO 1 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer
#     : Tomcat initialized with port 8080 (http)
# 2024-05-14T09:12:06.118Z  INFO 1 --- [main] c.v.SpringbootwithdockerApplication
#     : Started SpringbootwithdockerApplication in 2.41 seconds
#
# Note the PID is 1 - the JVM is the only process in the container.`,
                `# Browser: http://localhost:8080/welcome
# RESPONSE (200 OK, text/plain):
Welcome to Spring Boot Developer Batch

# Same thing from the command line:
curl -i http://localhost:8080/welcome
# HTTP/1.1 200
# Content-Type: text/plain;charset=UTF-8
# Content-Length: 38
#
# Welcome to Spring Boot Developer Batch`
            ]
        },
        {
            content: `<h3>Application Flow</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
 mvn clean package
        |
        v
 target/springbootwithdocker.jar
        |
        |  docker build -t springbootwithdocker .
        v
 +----------------------------------+
 | IMAGE  springbootwithdocker      |
 |  layer 3: your jar               |
 |  layer 2: JRE 17                 |
 |  layer 1: alpine base filesystem |
 +----------------------------------+
        |
        |  docker run -p 8080:8080 springbootwithdocker
        v
 +----------------------------------+
 | CONTAINER (writable layer)       |
 |  PID 1 = java -jar app.jar       |
 |  listening on :8080 inside       |
 +----------------------------------+
        |
   host :8080  <-- port mapping -->  container :8080
        |
        v
 GET http://localhost:8080/welcome
 200 "Welcome to Spring Boot Developer Batch"
</pre>`
        },
        {
            content: `<h3>Common First-Attempt Failures</h3>
<table>
<tr><th>Symptom</th><th>Cause and fix</th></tr>
<tr><td><code>error during connect: ... docker_engine: The system cannot find the file specified</code></td><td>Docker Desktop is not running. Start it and wait for the whale icon to stop animating.</td></tr>
<tr><td><code>"/target/app.jar": not found</code></td><td><code>mvn clean package</code> was not run, or <code>finalName</code> and the Dockerfile disagree.</td></tr>
<tr><td><code>no such file or directory: Dockerfile</code></td><td>The file was saved as <code>Dockerfile.txt</code> by Notepad, or the prompt is in the wrong folder.</td></tr>
<tr><td><code>bind: address already in use</code></td><td>Host port 8080 is taken. Use <code>-p 9090:8080</code>.</td></tr>
<tr><td>Container starts then exits immediately</td><td>Read <code>docker logs &lt;id&gt;</code>. Usually the application failed to connect to a database that is not in the container.</td></tr>
<tr><td><code>Communications link failure</code> to MySQL</td><td><code>localhost</code> inside a container is the container itself, not your machine. See the compose section.</td></tr>
</table>`
        }
    ],
    expert: [
        {
            content: `<h3>Layers, the Build Cache, and Why COPY Order Decides Your Build Time</h3>
Every instruction in a Dockerfile produces a <strong>layer</strong> - a read-only filesystem diff, content-addressed by a hash of the instruction plus the files it touched. On a rebuild, Docker walks the instructions in order and reuses a cached layer as long as the instruction and its inputs are unchanged. The moment one layer misses, <strong>every layer after it is rebuilt</strong>, regardless of whether its own inputs changed.<br><br>

That single rule drives the whole design. Order instructions from <em>least likely to change</em> to <em>most likely to change</em>. Dependencies change monthly; your source changes every few minutes. Copying <code>pom.xml</code> and resolving dependencies before copying <code>src/</code> means a code-only edit reuses the dependency layer and skips a full Maven download.<br><br>

<h3>Layered Jars</h3>
A Spring Boot fat jar is a single 40 MB file, so a one-line code change rewrites all 40 MB as a new layer and pushes all 40 MB to the registry. Since Boot 2.3 the jar can be <strong>layered</strong>: <code>java -Djarmode=layertools -jar app.jar extract</code> splits it into <code>dependencies</code>, <code>spring-boot-loader</code>, <code>snapshot-dependencies</code> and <code>application</code>. Copy each into its own layer and only the last one - a few hundred kilobytes of your own classes - changes between builds.<br><br>

Boot 3.x replaces the jarmode name: use <code>-Djarmode=tools extract --layers --destination extracted</code>. Both forms are shown below.`,
            codeExamples: [
                `# WRONG ORDER - every source edit re-downloads the internet
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY . .                      # <-- any file change busts this layer
RUN mvn -q clean package      # <-- so this always re-resolves dependencies
# Rebuild after changing one .java file: ~3 minutes

# RIGHT ORDER - dependencies cached separately from source
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline    # cached until pom.xml changes
COPY src ./src                      # only this layer busts on a code edit
RUN mvn -B -DskipTests clean package
# Rebuild after changing one .java file: ~15 seconds`,
                `# Layered jar - inspect what Boot produced
java -Djarmode=layertools -jar target/app.jar list
# OUTPUT:
# dependencies
# spring-boot-loader
# snapshot-dependencies
# application

java -Djarmode=layertools -jar target/app.jar extract --destination extracted
# creates extracted/dependencies/, extracted/spring-boot-loader/,
#         extracted/snapshot-dependencies/, extracted/application/

# Spring Boot 3.3+ syntax (layertools is deprecated there):
# java -Djarmode=tools -jar target/app.jar extract --layers --destination extracted`,
                `# pom.xml - layers are on by default in Boot 2.4+, but be explicit
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <layers>
            <enabled>true</enabled>
        </layers>
    </configuration>
</plugin>`
            ]
        },
        {
            content: `<h3>Multi-Stage Builds</h3>
A build needs Maven, a JDK, a <code>.m2</code> cache and your sources. A running container needs a JRE and one jar. Shipping the first set as the runtime image gives you an 800 MB image containing a compiler, a build tool and your complete source code - all of it attack surface and all of it pointless in production.<br><br>

A <strong>multi-stage build</strong> uses one <code>FROM</code> per stage and copies only the finished artefacts forward with <code>COPY --from</code>. Everything left behind in the builder stage is discarded. The result is typically 180-250 MB instead of 800 MB, with no build tooling and no source inside it.<br><br>

Combine multi-stage with layered jars and you get both: a small final image <em>and</em> fast incremental pushes.`,
            codeExamples: [
                `# ---------- Stage 1: build ----------
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests clean package
RUN java -Djarmode=layertools -jar target/app.jar extract --destination extracted

# ---------- Stage 2: runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

# Layers copied most-stable first, so a code change only invalidates the last COPY
COPY --from=builder --chown=spring:spring /build/extracted/dependencies/          ./
COPY --from=builder --chown=spring:spring /build/extracted/spring-boot-loader/    ./
COPY --from=builder --chown=spring:spring /build/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=spring:spring /build/extracted/application/           ./

USER spring:spring
EXPOSE 8080

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
# Boot 2.x uses org.springframework.boot.loader.JarLauncher (no ".launch")

# OUTPUT of docker images after this build:
# REPOSITORY   TAG       IMAGE ID       SIZE
# orders-api   1.4.0     3a91c8de2f10   198MB     <-- vs 812MB single-stage`
            ]
        },
        {
            content: `<h3>Never Run as Root</h3>
By default a container process runs as <strong>uid 0</strong>. Container isolation is namespaces and cgroups, not a virtual machine boundary; root inside the container is the same uid 0 the host kernel sees. A container escape - or simply a bind-mounted host directory - then gives an attacker root-level reach outside the container.<br><br>

Create an unprivileged user in the Dockerfile and switch to it with <code>USER</code> before <code>ENTRYPOINT</code>. Put the <code>USER</code> instruction last, after every <code>RUN</code> that needs to install packages, and make sure the files the application reads are <code>--chown</code>ed to that user.<br><br>

Two consequences to plan for: a non-root process cannot bind ports below 1024 - which is fine, because Spring Boot's default 8080 is above that and the host mapping <code>-p 80:8080</code> handles the rest - and it cannot write to <code>/</code>. Run with <code>--read-only</code> plus a <code>tmpfs</code> for <code>/tmp</code> where you can, and pass <code>--cap-drop ALL</code> to strip Linux capabilities the JVM never uses.`,
            codeExamples: [
                `# Alpine base
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Debian/Ubuntu base
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Verify it took effect:
docker run --rm orders-api:1.4.0 id
# OUTPUT: uid=100(spring) gid=101(spring) groups=101(spring)

# If it did NOT:
# OUTPUT: uid=0(root) gid=0(root) groups=0(root)   <-- fix the Dockerfile`,
                `# Runtime hardening on the run command
docker run -d \\
  --name orders-api \\
  --user 1000:1000 \\
  --read-only \\
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \\
  --cap-drop ALL \\
  --security-opt no-new-privileges:true \\
  --memory 1g --cpus 2 \\
  -p 8080:8080 \\
  orders-api:1.4.0

# Common failure if you forget the tmpfs:
# java.io.IOException: No space left on device
#   at java.base/java.io.UnixFileSystem.createFileExclusively
# Tomcat needs a writable /tmp for its work directory.`
            ]
        },
        {
            content: `<h3>The JVM Inside a Container</h3>
Before Java 10, the JVM read <code>/proc/meminfo</code> and <code>/proc/cpuinfo</code> - which report the <em>host</em>, not the cgroup limit. A container capped at 512 MB on a 64 GB host would see 64 GB, set a default max heap of 16 GB, allocate freely, and be killed by the kernel OOM killer with exit code 137 and no Java stack trace at all. Modern JVMs (8u191+, 10+) are <strong>container-aware</strong>: <code>UseContainerSupport</code> is on by default and the JVM reads the cgroup limits instead.<br><br>

Given that, do not set <code>-Xmx</code>. A fixed number is a guess against an unknown container size: too high and the kernel kills you, too low and you waste the memory the orchestrator reserved. Set <strong>MaxRAMPercentage</strong> instead and the heap scales with whatever limit the container is given - 75% is a reasonable figure, leaving headroom for metaspace, thread stacks, code cache and direct buffers, all of which live outside the heap and all of which count towards the cgroup limit.<br><br>

Note the trap in the defaults: for containers under about 256 MB the JVM applies <code>MinRAMPercentage</code> (50%), not MaxRAMPercentage. And exit code <strong>137</strong> means SIGKILL from the OOM killer - a Java <code>OutOfMemoryError</code> would have produced a stack trace and a different exit code.`,
            codeExamples: [
                `# Prove the JVM sees the cgroup limit, not the host
docker run --rm -m 512m eclipse-temurin:17-jre \\
  java -XX:+PrintFlagsFinal -version | grep -E "MaxHeapSize|UseContainerSupport"
# OUTPUT:
#   size_t MaxHeapSize = 134217728    {product} {ergonomic}   <-- 128MB = 25% of 512MB
#   bool UseContainerSupport = true   {product} {default}

# Now with MaxRAMPercentage
docker run --rm -m 512m eclipse-temurin:17-jre \\
  java -XX:MaxRAMPercentage=75.0 -XX:+PrintFlagsFinal -version | grep MaxHeapSize
# OUTPUT:
#   size_t MaxHeapSize = 402653184    {product} {ergonomic}   <-- 384MB = 75% of 512MB`,
                `# Dockerfile - let the flag come from the environment so ops can tune it
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError \\
               -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
# "exec" matters: without it, sh stays PID 1 and swallows SIGTERM.
# If you need no shell expansion at all, prefer the pure exec form:
# ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]`,
                `# The failure mode this prevents
docker run -m 512m -e JAVA_TOOL_OPTIONS="-Xmx2g" orders-api:1.4.0
# ... application starts, serves traffic, then:
docker ps -a
# CONTAINER ID   IMAGE              STATUS
# 7d3e1a90bb52   orders-api:1.4.0   Exited (137) 4 minutes ago
#
# 137 = 128 + 9 = SIGKILL. The kernel OOM killer, not the JVM.
# There is NO OutOfMemoryError in the logs - the process was shot, not unwound.
docker inspect 7d3e1a90bb52 --format '{{.State.OOMKilled}}'
# OUTPUT: true`
            ]
        },
        {
            content: `<h3>.dockerignore</h3>
<code>docker build .</code> tars the entire context directory and sends it to the daemon before the first instruction runs. A Maven project with <code>target/</code>, <code>.git/</code> and an IDE folder can be hundreds of megabytes, and you will see the build sit on <code>transferring context</code> for seconds before doing anything.<br><br>

Size is the smaller problem. The real one is <strong>secrets and cache invalidation</strong>. A <code>COPY . .</code> with no ignore file copies <code>.git</code> (your full history, including any credential ever committed), <code>.env</code> files, and local <code>application-local.properties</code> straight into the image where <code>docker history</code> will happily show them. It also means a change to <code>README.md</code> or a Git operation invalidates the COPY layer and rebuilds everything below it.<br><br>

The file lives beside the Dockerfile, uses the same syntax as <code>.gitignore</code>, and <code>!</code> re-includes.`,
            codeExamples: [
                `# .dockerignore  (project root, next to Dockerfile)
.git
.gitignore
.github
target/
!target/*.jar          # keep the built jar if the Dockerfile copies it directly
build/
.idea/
*.iml
.vscode/
.mvn/wrapper/maven-wrapper.jar
**/*.log
**/.env
**/application-local.properties
**/application-secrets.yml
Dockerfile
docker-compose*.yml
README.md
*.md

# Effect on a typical project:
# without .dockerignore:  => transferring context: 264.71MB   6.2s
# with    .dockerignore:  => transferring context:  19.34MB   0.3s`
            ]
        },
        {
            content: `<h3>Tagging - Why <code>:latest</code> Is Not a Version</h3>
<code>latest</code> is not a special tag. It is the default string Docker fills in when you omit one, and it points at whatever was pushed last. It carries no ordering, no guarantee, and no meaning.<br><br>

Deploying <code>myapp:latest</code> means a rollback is impossible - there is no earlier tag to go back to - and two nodes pulling the same "version" minutes apart can end up running different code. The image also gets cached: a node that already has <code>latest</code> locally may never pull the new one unless the pull policy forces it.<br><br>

Tag with something immutable. The strongest form is the <strong>digest</strong>, <code>myapp@sha256:...</code>, which addresses exact content and cannot be moved. Practically, tag with the semantic version plus the git commit SHA, and push <code>latest</code> as an <em>additional</em> convenience tag for developers only.<br><br>

Pin your base images too. <code>FROM eclipse-temurin:17-jre</code> silently changes underneath you; <code>FROM eclipse-temurin:17.0.9_9-jre-alpine</code> does not.`,
            codeExamples: [
                `# In CI - one build, several names, all pointing at the same image id
VERSION=1.4.0
SHA=$(git rev-parse --short HEAD)      # e.g. 9f3c1ab

docker build -t orders-api:\${VERSION} .
docker tag orders-api:\${VERSION} registry.example.com/orders-api:\${VERSION}
docker tag orders-api:\${VERSION} registry.example.com/orders-api:\${VERSION}-\${SHA}
docker tag orders-api:\${VERSION} registry.example.com/orders-api:latest

docker push --all-tags registry.example.com/orders-api

# Production deploys the immutable one:
#   registry.example.com/orders-api:1.4.0-9f3c1ab
# or, strongest, by digest:
#   registry.example.com/orders-api@sha256:6c1f...e42b`,
                `# Find the digest after a push
docker inspect --format='{{index .RepoDigests 0}}' orders-api:1.4.0
# OUTPUT:
# registry.example.com/orders-api@sha256:6c1f9a0d3b77e2c5a1f8b0c4d9e7a2b31c5f8e42b...

# Compare pull policies:
docker run myapp:latest          # uses the local copy if one exists - may be stale
docker run --pull=always myapp:latest
# Kubernetes: imagePullPolicy defaults to Always for :latest and
# IfNotPresent for any other tag - another reason not to deploy :latest.`
            ]
        },
        {
            content: `<h3>docker compose - App plus MySQL</h3>
Two facts break every first attempt at this. First, <code>localhost</code> inside a container is <em>that container</em>. The application cannot reach MySQL at <code>jdbc:mysql://localhost:3306/...</code>; on a compose network it reaches it at the <strong>service name</strong>, <code>jdbc:mysql://mysql-db:3306/...</code>. Second, <code>depends_on</code> is not what most people think it is.<br><br>

<h3>Why depends_on Is Not Enough</h3>
Plain <code>depends_on</code> only orders <em>container start</em>. Compose starts the MySQL container, sees it running, and immediately starts the application - while <code>mysqld</code> is still initialising its data directory, which on a first run takes 20-40 seconds. Spring Boot's HikariCP tries to open a pool, fails, and the application exits before MySQL is ready to accept a single connection.<br><br>

The fix is a <strong>healthcheck</strong> on the database plus <code>depends_on: condition: service_healthy</code>. Compose then waits for the healthcheck to pass, not merely for the process to exist. This is a container-level analogue of the same lesson everywhere in distributed systems: "started" and "ready" are different states.<br><br>

Even with that, keep the application resilient - <code>restart: on-failure</code> and a sensible Hikari <code>initialization-fail-timeout</code>, because a database can also go away <em>after</em> start-up.`,
            codeExamples: [
                `# docker-compose.yml
services:

  mysql-db:
    image: mysql:8.0.35
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: employeedb
    volumes:
      - mysql-data:/var/lib/mysql        # named volume - data survives "down"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-p\${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 40s                  # grace window for first-run initialisation
    networks: [appnet]

  orders-api:
    image: registry.example.com/orders-api:1.4.0-9f3c1ab
    depends_on:
      mysql-db:
        condition: service_healthy       # <-- the part that actually waits
    environment:
      SPRING_PROFILES_ACTIVE: docker
      # "mysql-db" is the SERVICE NAME, resolved by Docker's embedded DNS.
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql-db:3306/employeedb?useSSL=false&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: \${MYSQL_ROOT_PASSWORD}
    ports:
      - "8080:8080"
    restart: on-failure
    networks: [appnet]

volumes:
  mysql-data:

networks:
  appnet:`,
                `# The failure you get WITHOUT a healthcheck
docker compose up
# orders-api  | com.mysql.cj.jdbc.exceptions.CommunicationsException:
# orders-api  |   Communications link failure
# orders-api  | Caused by: java.net.ConnectException: Connection refused
# orders-api  | HikariPool-1 - Exception during pool initialization.
# orders-api  | APPLICATION FAILED TO START
# orders-api exited with code 1
#
# WITH the healthcheck:
docker compose up
# [+] Running 3/3
#  Network app_appnet     Created
#  Container mysql-db     Healthy      <-- compose waited here, ~34s
#  Container orders-api   Started
# orders-api | HikariPool-1 - Start completed.
# orders-api | Started OrdersApiApplication in 3.109 seconds

docker compose ps
# NAME         IMAGE                 STATUS                   PORTS
# mysql-db     mysql:8.0.35          Up 2 minutes (healthy)   3306/tcp
# orders-api   orders-api:1.4.0      Up 1 minute              0.0.0.0:8080->8080/tcp`,
                `# The credentials come from a .env file beside the compose file,
# which is in .gitignore and .dockerignore. NEVER hardcode them here.
# .env
MYSQL_ROOT_PASSWORD=change-me-in-a-secrets-manager

# Note MySQL is deliberately NOT published with "ports:" - it is reachable
# on the appnet network by the application and by nothing else on the host.
# Add "ports: [3306:3306]" only for local debugging, never in production.

docker compose down       # stops and removes containers, KEEPS the volume
docker compose down -v    # also deletes the volume - your data is gone`
            ]
        },
        {
            content: `<h3>Buildpacks - No Dockerfile at All</h3>
Spring Boot ships <code>spring-boot:build-image</code>, which uses <strong>Cloud Native Buildpacks</strong> (Paketo by default) to produce an OCI image straight from the Maven or Gradle build. There is no Dockerfile to write, review or keep current.<br><br>

The buildpack detects the Java version from your <code>pom.xml</code>, picks a maintained base image, applies the layered-jar split automatically, sets a non-root user, and installs a memory calculator that sizes the heap, metaspace and thread stacks from the container's memory limit at start-up rather than at build time. Everything the previous sections told you to do by hand, done as a policy you inherit.<br><br>

<table>
<tr><th>Approach</th><th>When it suits</th></tr>
<tr><td><strong>Buildpacks</strong></td><td>Standard Spring Boot services, many of them, where consistency and free security patching of the base image matter more than control. Rebuild to pick up a patched base with no code change.</td></tr>
<tr><td><strong>Dockerfile</strong></td><td>You need native OS packages, a specific hardened or distroless base, an unusual entrypoint, or your platform team mandates an approved base image.</td></tr>
</table>
<br>
Note the daemon requirement: <code>build-image</code> talks to the local Docker daemon by default, which is awkward in some CI runners. Paketo also builds native GraalVM images through the same goal when <code>spring-boot-starter-parent</code>'s <code>native</code> profile is active.`,
            codeExamples: [
                `# No Dockerfile anywhere in the project
mvn spring-boot:build-image -Dspring-boot.build-image.imageName=orders-api:1.4.0

# OUTPUT (abridged):
# [INFO] Building image 'docker.io/library/orders-api:1.4.0'
# [INFO]  > Pulling builder image 'paketobuildpacks/builder-jammy-base:latest'
# [INFO]  > Executing lifecycle version v0.17.0
# [INFO]  > Running detector
# [INFO]     paketo-buildpacks/ca-certificates
# [INFO]     paketo-buildpacks/bellsoft-liberica
# [INFO]     paketo-buildpacks/executable-jar
# [INFO]     paketo-buildpacks/spring-boot
# [INFO]  > Running builder
# [INFO]     Adding layer 'paketo-buildpacks/bellsoft-liberica:jre'
# [INFO]     Spring Boot Layers: dependencies, spring-boot-loader,
# [INFO]                         snapshot-dependencies, application
# [INFO]  > Saving docker.io/library/orders-api:1.4.0
# [INFO] Successfully built image 'docker.io/library/orders-api:1.4.0'
# [INFO] BUILD SUCCESS  Total time: 01:12 min`,
                `<!-- pom.xml - pin the image name and push straight to a registry -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <image>
            <name>registry.example.com/orders-api:\${project.version}</name>
            <publish>true</publish>
            <env>
                <BP_JVM_VERSION>17</BP_JVM_VERSION>
            </env>
        </image>
        <docker>
            <publishRegistry>
                <username>\${env.REGISTRY_USER}</username>
                <password>\${env.REGISTRY_TOKEN}</password>
            </publishRegistry>
        </docker>
    </configuration>
</plugin>`,
                `# What the buildpack gives you for free - inspect the running container
docker run --rm -m 1g orders-api:1.4.0
# OUTPUT:
# Setting Active Processor Count to 8
# Calculated JVM Memory Configuration: -XX:MaxDirectMemorySize=10M
#   -Xmx636003K -XX:MaxMetaspaceSize=88652K -XX:ReservedCodeCacheSize=240M -Xss1M
#   (Total Memory: 1G, Thread Count: 250, Loaded Class Count: 12983)
# ... the memory calculator sized the heap AT START-UP from the cgroup limit.

docker inspect orders-api:1.4.0 --format '{{.Config.User}}'
# OUTPUT: 1000:1000        <-- non-root, without you writing a USER line`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Container versus virtual machine?</td><td>A VM virtualises hardware and runs a full guest OS with its own kernel. A container is an isolated process on the host kernel using namespaces and cgroups. Containers start in milliseconds and cost megabytes; VMs take minutes and gigabytes, but give a stronger isolation boundary.</td></tr>
<tr><td>Image versus container?</td><td>The image is the immutable, read-only stack of layers produced by <code>docker build</code>. A container is a running instance of it with a thin writable layer on top. One image, many containers.</td></tr>
<tr><td>Why does COPY order change build time?</td><td>Each instruction is a cached layer keyed on its inputs. A cache miss invalidates that layer and every layer below it. Copying <code>pom.xml</code> and resolving dependencies before copying <code>src</code> keeps the dependency layer cached across code edits.</td></tr>
<tr><td>What is a layered jar and why use it?</td><td>Boot 2.3+ splits the fat jar into dependencies, loader, snapshot-dependencies and application. Copied as separate image layers, a code change rewrites only the small application layer instead of the whole 40 MB jar, so pushes and pulls are far cheaper.</td></tr>
<tr><td>What does a multi-stage build achieve?</td><td>The builder stage holds Maven, the JDK and your source; only the finished artefacts are copied forward with <code>COPY --from</code>. The final image has no compiler, no build tool and no source code - typically 200 MB instead of 800 MB, with much less attack surface.</td></tr>
<tr><td>Why not run the container as root?</td><td>Root in the container is uid 0 on the host kernel; the boundary is namespaces, not a hypervisor. Any escape or bind-mount then has host-level privilege. Create a user, <code>USER</code> before <code>ENTRYPOINT</code>, and drop capabilities at run time.</td></tr>
<tr><td>Why avoid <code>-Xmx</code> in a container?</td><td>It is a fixed guess against a limit set elsewhere. Too high and the kernel OOM-kills the container (exit 137, no Java stack trace); too low and reserved memory is wasted. <code>-XX:MaxRAMPercentage=75</code> scales with whatever limit the container gets.</td></tr>
<tr><td>What is JVM container awareness?</td><td>From 8u191/Java 10, <code>UseContainerSupport</code> makes the JVM read cgroup memory and CPU limits instead of <code>/proc/meminfo</code>. Older JVMs saw the whole host and sized the heap catastrophically wrong.</td></tr>
<tr><td>What does exit code 137 mean?</td><td>128 + 9 = SIGKILL, almost always the kernel OOM killer. Check <code>docker inspect --format '{{.State.OOMKilled}}'</code>. It is not a Java <code>OutOfMemoryError</code> - that unwinds and logs a stack trace.</td></tr>
<tr><td>What does <code>.dockerignore</code> do?</td><td>Excludes paths from the build context. It cuts transfer time, stops <code>.git</code>, <code>.env</code> and local property files being baked into the image, and prevents unrelated file changes from invalidating a <code>COPY</code> layer.</td></tr>
<tr><td>Why not deploy <code>:latest</code>?</td><td>It is a mutable pointer to the most recent push, with no ordering guarantee. Rollback is impossible, two nodes can run different code under the same name, and caching makes it unpredictable. Tag with version plus commit SHA, or pin by digest.</td></tr>
<tr><td>ADD versus COPY?</td><td>Both copy files in. ADD additionally extracts local tar archives and fetches remote URLs - implicit behaviour that surprises readers of the Dockerfile. Use COPY unless you specifically need the extraction.</td></tr>
<tr><td>ENTRYPOINT exec form versus shell form?</td><td>Exec form (a JSON array) runs the binary as PID 1, so <code>docker stop</code> delivers SIGTERM to the JVM and Spring's shutdown hooks run. Shell form puts <code>/bin/sh</code> at PID 1, the signal never reaches Java, and the container is killed after the timeout.</td></tr>
<tr><td>Why is <code>depends_on</code> not enough?</td><td>It only orders container start-up. MySQL's first-run initialisation takes tens of seconds after the container is "running", so the application starts, fails to open its pool and exits. Add a healthcheck to the database and <code>condition: service_healthy</code> to the dependant.</td></tr>
<tr><td>Why can't the app reach MySQL on <code>localhost</code>?</td><td>Inside a container <code>localhost</code> is that container's own network namespace. On a compose network, reach the database by service name - <code>jdbc:mysql://mysql-db:3306/...</code> - which Docker's embedded DNS resolves.</td></tr>
<tr><td>When would you use buildpacks over a Dockerfile?</td><td><code>mvn spring-boot:build-image</code> gives a maintained base, automatic layering, a non-root user and a start-up memory calculator with no Dockerfile to maintain - ideal for many similar services. Write a Dockerfile when you need OS packages, a specific hardened or distroless base, or an approved corporate base image.</td></tr>
</table>`
        }
    ]
};
