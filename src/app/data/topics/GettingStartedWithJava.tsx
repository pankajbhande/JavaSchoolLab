import { Topic } from '../coreJava';

export const gettingStartedWithJava: Topic = {
    id: 'getting-started',
    name: 'Getting Started with Java (Installation & Setup)',

    beginner: [
        {
            content: `<h4>What You Need Before Writing Any Java Code</h4>
To write, compile, and run Java programs on your own machine, you need three things:
<ul>
<li><b>JDK (Java Development Kit)</b> - includes the compiler (<code>javac</code>) and everything needed to build Java programs.</li>
<li>A place to configure the <b>PATH</b> environment variable, so your terminal can find <code>java</code>/<code>javac</code> from anywhere.</li>
<li>An <b>IDE</b> (Eclipse, IntelliJ IDEA, or VS Code) - optional for tiny programs, but the normal way real projects are built.</li>
</ul>
This topic walks through installing the JDK, verifying it, setting up an IDE, and running your first program.`
        },
        {
            content: `<h4>1. Downloading and Installing the JDK</h4>
<ul>
<li>Download a JDK build from Oracle (oracle.com/java) or a free OpenJDK distribution (Eclipse Temurin, Amazon Corretto) - any recent LTS version (17 or 21) is a safe default.</li>
<li>Run the installer for your OS (Windows <code>.exe</code>/<code>.msi</code>, macOS <code>.dmg</code>/<code>.pkg</code>, Linux via package manager e.g. <code>apt install openjdk-21-jdk</code>).</li>
<li>The installer places the JDK in a folder such as <code>C:\\Program Files\\Java\\jdk-21</code> (Windows) or <code>/usr/lib/jvm/java-21-openjdk</code> (Linux).</li>
</ul>`
        },
        {
            content: `<h4>2. Setting the PATH Environment Variable</h4>
The <b>PATH</b> variable tells your operating system where to look for executable commands. Adding the JDK's <code>bin</code> folder to PATH lets you type <code>java</code>/<code>javac</code> from any terminal location, not just from inside the JDK folder.<br><br>

<b>Windows:</b>
<ul>
<li>Search "Environment Variables" in the Start menu -> Edit the system environment variables.</li>
<li>Under "System variables", edit <code>Path</code>, add a new entry pointing to the JDK's <code>bin</code> folder (e.g. <code>C:\\Program Files\\Java\\jdk-21\\bin</code>).</li>
<li>Optionally set a <code>JAVA_HOME</code> variable pointing to the JDK root folder (many build tools like Maven/Gradle expect this).</li>
</ul>

<b>macOS / Linux (bash/zsh):</b><br>
Add these lines to <code>~/.bashrc</code>, <code>~/.zshrc</code>, or <code>/etc/profile</code>:`,
            codeExamples: [
                `export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$PATH`
            ]
        },
        {
            content: `<h4>3. Verifying the Installation</h4>
Open a fresh terminal/command prompt (PATH changes only apply to newly opened terminals) and check both tools:`,
            codeExamples: [
                `java -version
javac -version

// Sample output:
// java version "21.0.2" 2024-01-16 LTS
// Java(TM) SE Runtime Environment (build 21.0.2+13-LTS-58)
// Java HotSpot(TM) 64-Bit Server VM (build 21.0.2+13-LTS-58,
//   mixed mode, sharing)
//
// javac 21.0.2`
            ]
        },
        {
            content: `<h4>4. Installing an IDE</h4>
While you can write Java in any text editor, an IDE gives you auto-complete, error highlighting, debugging, and project/build management:
<ul>
<li><b>Eclipse</b> - download the installer from eclipse.org, choose "Eclipse IDE for Java Developers", and it auto-detects any JDK already on your PATH.</li>
<li><b>IntelliJ IDEA</b> - Community Edition is free; widely used in industry.</li>
<li><b>VS Code</b> - lightweight, needs the "Extension Pack for Java" installed from the Extensions marketplace.</li>
</ul>
None of these IDEs replace the JDK - they all still need a JDK installed to compile/run your code; the IDE just wraps <code>javac</code>/<code>java</code> with a friendlier interface.`
        },
        {
            content: `<h4>5. Your First Program — Command Line</h4>
No IDE is required to compile and run Java - the two commands you'll use constantly are <code>javac</code> (compile) and <code>java</code> (run):`,
            codeExamples: [
                `// File: HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
                `javac HelloWorld.java   // compiles to HelloWorld.class (bytecode)
java HelloWorld         // runs the class (no ".class" extension here)

// OUTPUT:
// Hello, World!`
            ]
        },
        {
            content: `<h4>6. Your First Program — Inside Eclipse</h4>
<ul>
<li>File -> New -> Java Project -> give it a name -> Finish.</li>
<li>Right-click <code>src</code> -> New -> Class -> name it <code>HelloWorld</code>, check "public static void main" to auto-generate the method stub.</li>
<li>Write the <code>System.out.println("Hello, World!");</code> line inside <code>main</code>.</li>
<li>Click the green Run button (or Run -> Run As -> Java Application) - Eclipse compiles and runs it automatically, showing output in the Console panel at the bottom.</li>
</ul>`
        },

        {
            content: `<h3>1. Definition</h3>
Getting started with Java means installing the JDK, setting the PATH, writing a .java file, compiling it with javac and running it with the java command. <br><br>

<h3>2. Purpose of this topic</h3>
<ul>
<li>To set up a working Java environment on your own laptop.</li>
<li>To learn the exact two commands every Java program needs: javac and java.</li>
<li>To understand the rule that a public class name must match the file name.</li>
</ul>

<h3>3. Need of this topic</h3>
<ul>
<li>Without a correct setup you cannot run even one line of Java.</li>
<li>Most beginners lose hours on the error "javac is not recognized", which is only a PATH problem.</li>
<li>In a college lab or a company machine you will often install and configure the JDK yourself.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: your very first compiled and executed program
// FILE NAME MUST BE: FirstProgram.java

public class FirstProgram {

    public static void main(String[] args) {

        // WRONG file name: firstprogram.java for a public class FirstProgram
        // javac error: class FirstProgram is public, should be declared in a file
        //              named FirstProgram.java

        // RIGHT: file name FirstProgram.java matches the public class name
        System.out.println("Java setup is working");
        System.out.println("Compiled with javac, run with java");
    }
}
// HOW TO RUN:
// javac FirstProgram.java     creates FirstProgram.class
// java FirstProgram           note: no .class extension here
// OUTPUT:
// Java setup is working
// Compiled with javac, run with java`
                                ]
        },

        {
            content: `<h3>4. Advantages</h3>
<ul>
<li><b>Free and open:</b> OpenJDK costs nothing and works on Windows, Linux and Mac.</li>
<li><b>One time setup:</b> once PATH and JAVA_HOME are set, every project uses them.</li>
<li><b>Works without an IDE:</b> notepad plus a terminal is enough to learn.</li>
<li><b>IDE support:</b> Eclipse, IntelliJ and VS Code auto compile and show errors as you type.</li>
<li><b>Build tools:</b> Maven and Gradle read JAVA_HOME and handle everything after that.</li>
</ul>

<h3>5. Disadvantages</h3>
<ul>
<li><b>PATH problems</b> confuse beginners, especially on Windows.</li>
<li><b>Multiple JDK versions</b> on one machine can make the wrong javac run.</li>
<li><b>Large download:</b> a JDK is a few hundred MB, painful on slow internet.</li>
<li><b>Strict file naming</b> rules cause compile errors that look mysterious at first.</li>
<li><b>Two step run cycle</b> (compile then run) feels slow compared to Python.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 4 and 5: setup checks written in Java itself

public class EnvironmentCheck {

    public static void main(String[] args) {

        // ADVANTAGE: the JVM tells you exactly which JDK runs your code.
        // This helps with the "multiple JDK versions installed" problem.
        System.out.println("Java version : " + System.getProperty("java.version"));
        System.out.println("Java home    : " + System.getProperty("java.home"));
        System.out.println("OS name      : " + System.getProperty("os.name"));

        // DISADVANTAGE example: a class with no main method compiles fine
        // but fails at run time.
        // WRONG:
        // public class NoMain { void start() { } }
        // java NoMain  ->  Error: Main method not found in class NoMain

        // RIGHT: the signature must be exactly
        // public static void main(String[] args)
        System.out.println("Main method signature is correct");
    }
}
// OUTPUT (values vary by machine):
// Java version : 21.0.2
// Java home    : C:\\Program Files\\Java\\jdk-21
// OS name      : Windows 11
// Main method signature is correct`
                                ]
        },

        {
            content: `<h3>6. Real Time Examples</h3>
<ul>
<li><b>College lab:</b> students install the JDK and set PATH before the first practical.</li>
<li><b>Fresher onboarding in Indian IT companies:</b> day one is JDK, Maven and IDE setup.</li>
<li><b>Build servers:</b> Jenkins pipelines set JAVA_HOME before running a Maven build.</li>
<li><b>Docker images:</b> an eclipse-temurin base image already ships the JDK, so the setup is baked in.</li>
<li><b>Bank projects:</b> teams often pin one exact JDK version so every developer builds the same bytecode.</li>
</ul>`,
                                codeExamples: [
                                    `// Point 6: a small college fee calculator you can compile and run
// FILE NAME: FeeCalculator.java

import java.util.Scanner;

public class FeeCalculator {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter student name: ");
        String name = sc.nextLine();

        System.out.print("Enter tuition fee in rupees: ");
        double tuition = sc.nextDouble();

        // WRONG: hard coding the total and ignoring the input
        // double total = 50000;

        // RIGHT: compute from the entered value
        double examFee = 2000;
        double libraryFee = 1500;
        double total = tuition + examFee + libraryFee;

        System.out.println("Student : " + name);
        System.out.println("Total fee: Rs " + total);

        sc.close();
    }
}
// SAMPLE RUN:
// Enter student name: Meera Nair
// Enter tuition fee in rupees: 48000
// Student : Meera Nair
// Total fee: Rs 51500.0`
                                ]
        }
    ],

    expert: [
        {
            content: `<h3>The Filename-Must-Match-Class-Name Rule</h3>
For a <b>public</b> top-level class, the <code>.java</code> file name must exactly match the class name (case-sensitive) - this is enforced by <code>javac</code>, not a mere convention.`,
            codeExamples: [
                `// File name: HelloWorld.java
public class HelloWorld {   // OK - matches file name exactly
    public static void main(String[] args) {
        System.out.println("Compiles fine");
    }
}

// File name: HelloWorld.java, but class named differently:
// public class Hello { ... }
// ERROR: class Hello is public, should be declared in a file named Hello.java`
            ]
        },
        {
            content: `<h3>What javac and java Actually Do</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">HelloWorld.java  --javac-->  HelloWorld.class (bytecode)
                                    |
                                  java
                                    |
                              JVM loads + runs it
                                    |
                            Native machine code (via JIT)</pre>
<code>javac</code> only <b>compiles</b> - it never executes anything, and it produces a <code>.class</code> file containing JVM bytecode, not native machine code. <code>java</code> starts a JVM instance, loads that <code>.class</code> file, and executes its <code>main</code> method - it does NOT need or accept a <code>.class</code> extension in the command (<code>java HelloWorld</code>, not <code>java HelloWorld.class</code>).`
        },
        {
            content: `<h3>Common Setup Errors and Fixes</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Error</th><th>Cause</th><th>Fix</th></tr>
<tr class='text-center'><td>'java' is not recognized as an internal or external command</td><td>PATH doesn't include the JDK's bin folder, or terminal opened before PATH was updated</td><td>Add JDK's bin to PATH, then open a brand-new terminal window</td></tr>
<tr class='text-center'><td>Error: Could not find or load main class HelloWorld</td><td>Running java from a different folder than the .class file, or a package mismatch</td><td>cd into the folder containing the .class file, or use the classpath (-cp) flag</td></tr>
<tr class='text-center'><td>class X is public, should be declared in a file named X.java</td><td>File name doesn't exactly match the public class name</td><td>Rename the file (or the class) so they match exactly, including case</td></tr>
<tr class='text-center'><td>javac: command not found (but java works)</td><td>A JRE-only install was used instead of a full JDK (JRE has no compiler)</td><td>Install the JDK, not just the JRE</td></tr>
</table>`
        },
        {
            content: `<h3>Multiple JDK Versions on One Machine</h3>
Professional setups often need several JDK versions side by side (e.g. Java 8 for a legacy project, Java 21 for a new one). Tools like <b>SDKMAN!</b> (macOS/Linux) or manually swapping <code>JAVA_HOME</code>/PATH entries (Windows) let you switch the active version per terminal session without reinstalling anything - IDEs also let you configure a different JDK per-project independent of the system default.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the difference between installing the JDK vs just the JRE?</td><td>The JRE can only run compiled Java programs; the JDK additionally includes javac and other tools needed to develop and compile Java code</td></tr>
<tr class='text-center'><td>Why doesn't "java is not recognized" go away right after editing PATH?</td><td>Already-open terminal windows keep their old environment snapshot - PATH changes only take effect in newly opened terminals/processes</td></tr>
<tr class='text-center'><td>Do you write the .class extension when running "java"?</td><td>No - java takes the class name only (java HelloWorld), never java HelloWorld.class</td></tr>
<tr class='text-center'><td>Why must the file name match the public class name?</td><td>It's enforced by the Java compiler itself so the class-loading mechanism can reliably locate a public class's bytecode by file name</td></tr>
<tr class='text-center'><td>What does JAVA_HOME point to?</td><td>The root installation folder of a specific JDK - many build tools (Maven, Gradle) and IDEs read it to know which JDK to use</td></tr>
</table>`
        },

        {
            content: `<h3>1. Definition</h3>
At a professional level, getting started means owning a reproducible toolchain: a pinned JDK vendor and version, a build tool (Maven or Gradle), a dependency lock, and an identical setup on the developer machine, the CI server and the production container. <br><br>

<h3>2. Purpose of this topic</h3>
<ul>
<li>To make sure the code that compiles on your laptop compiles the same way on Jenkins.</li>
<li>To control the classpath explicitly instead of relying on the IDE.</li>
<li>To use release targeting so a build on JDK 21 still runs on a JDK 17 server.</li>
</ul>

<h3>3. Need of this topic</h3>
<ul>
<li>The classic production bug "works on my machine" is almost always a JDK or classpath mismatch.</li>
<li>Regulated systems such as banking builds must be byte for byte reproducible for audit.</li>
<li>Container images must ship the exact runtime the code was compiled against.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level:
// a program that prints the toolchain facts a build pipeline should assert

public class ToolchainAudit {

    public static void main(String[] args) {

        // WRONG in a pipeline: assuming the java on PATH is the right one.
        // A machine with two JDKs may silently compile with the older javac.

        // RIGHT: assert the runtime at startup and fail fast if it is wrong.
        int major = Runtime.version().feature();
        System.out.println("Runtime feature version : " + major);
        System.out.println("Vendor                  : "
                + System.getProperty("java.vendor"));
        System.out.println("Class path              : "
                + System.getProperty("java.class.path"));

        if (major < 17) {
            throw new IllegalStateException(
                    "This service needs JDK 17 or newer but found " + major);
        }

        System.out.println("Toolchain check passed");
    }
}
// BUILD NOTES:
// javac --release 17 ToolchainAudit.java   uses the JDK 17 API only
// java -cp . ToolchainAudit                explicit classpath
// OUTPUT:
// Runtime feature version : 21
// Vendor                  : Eclipse Adoptium
// Class path              : .
// Toolchain check passed`
                                ]
        },

        {
            content: `<h3>4. Advantages</h3>
<ul>
<li><b>Reproducible builds:</b> a pinned JDK plus a locked dependency set gives the same artifact every time.</li>
<li><b>Cross version targeting:</b> javac --release lets one modern JDK build for older runtimes safely.</li>
<li><b>Toolchain support in Maven and Gradle</b> removes the need for every developer to edit PATH.</li>
<li><b>Containers</b> freeze the whole runtime, so the classpath and JDK travel with the code.</li>
<li><b>jlink and jpackage</b> can ship a trimmed custom runtime, cutting image size a lot.</li>
</ul>

<h3>5. Disadvantages</h3>
<ul>
<li><b>Vendor differences:</b> Temurin, Corretto, Zulu and Oracle JDK differ in support and licensing.</li>
<li><b>Split package and module path issues</b> appear when mixing old jars with JPMS.</li>
<li><b>Classpath ordering bugs:</b> two jars with the same class, and the first one silently wins.</li>
<li><b>--release is not a runtime guarantee:</b> a reflective call to a newer API still fails at run time.</li>
<li><b>Upgrade cost:</b> moving from JDK 8 to 17 breaks removed APIs and internal access.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level:
// classpath shadowing and how to detect which jar a class really came from

import java.net.URL;

public class ClasspathForensics {

    public static void main(String[] args) throws Exception {

        // DISADVANTAGE: if two jars on the classpath both contain
        // com.acme.util.Money, the FIRST one on the classpath wins silently.
        // WRONG diagnosis: "the code is wrong".
        // RIGHT diagnosis: find out which jar actually supplied the class.

        Class<?> target = String.class;   // replace with your own duplicated class
        URL source = target.getProtectionDomain().getCodeSource() == null
                ? null
                : target.getProtectionDomain().getCodeSource().getLocation();

        System.out.println("Class  : " + target.getName());
        System.out.println("Loaded from : "
                + (source == null ? "bootstrap class loader (JDK core)" : source));
        System.out.println("Loader : " + target.getClassLoader());

        // ADVANTAGE: the module system tells you the owning module too
        System.out.println("Module : " + target.getModule().getName());
    }
}
// OUTPUT:
// Class  : java.lang.String
// Loaded from : bootstrap class loader (JDK core)
// Loader : null
// Module : java.base`
                                ]
        },

        {
            content: `<h3>6. Real Time Examples</h3>
<ul>
<li><b>Infosys and TCS delivery teams:</b> a shared settings.xml and a pinned JDK so every developer and the CI agent build identically.</li>
<li><b>Bank release pipelines:</b> the artifact is built once on a controlled JDK and the same jar moves through SIT, UAT and production.</li>
<li><b>Docker:</b> a multi stage build compiles with a JDK image and runs on a smaller JRE image.</li>
<li><b>Migration projects:</b> a JDK 8 to JDK 17 upgrade for a legacy insurance system, fixing removed APIs.</li>
</ul>

<b>Interview tip:</b> if asked how you would debug NoSuchMethodError in production, answer classpath shadowing first, then version mismatch between compile time and run time.`,
                                codeExamples: [
                                    `// Point 6 at expert level: a startup self check a real service would run
// before it accepts traffic

import java.time.Duration;
import java.time.Instant;

public class ServiceStartupCheck {

    private static void require(boolean ok, String message) {
        if (!ok) {
            throw new IllegalStateException("Startup check failed: " + message);
        }
    }

    public static void main(String[] args) {

        Instant started = Instant.now();

        // WRONG: register with the load balancer first and find a bad
        // environment only when real UPI traffic arrives.

        // RIGHT: validate everything, then report ready.
        require(Runtime.version().feature() >= 17, "JDK 17 or newer required");
        Runtime rt = Runtime.getRuntime();
        require(rt.availableProcessors() >= 2, "need at least 2 CPUs");
        require(rt.maxMemory() > 256L * 1024 * 1024, "heap too small");

        String env = System.getenv("APP_ENV");
        require(env != null, "APP_ENV must be set (dev, uat or prod)");

        System.out.println("Environment  : " + env);
        System.out.println("Startup time : "
                + Duration.between(started, Instant.now()).toMillis() + " ms");
        System.out.println("Service is READY to accept traffic");
    }
}
// OUTPUT (with APP_ENV=prod):
// Environment  : prod
// Startup time : 3 ms
// Service is READY to accept traffic`
                                ]
        }
    ]
};
