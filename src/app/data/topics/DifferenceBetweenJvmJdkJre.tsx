import { Topic } from '../coreJava';

export const differenceBetweenJvmJdkJre: Topic = {
                        id: 'difference between JVM JDK JRE',
                        name: `Difference between JVM, JDK, JRE`,
                        beginner: [
                            {
                                content: `<h3>JVM, JRE, and JDK</h3>

<p>In one line: <strong>JDK</strong> is used to develop Java programs, <strong>JRE</strong> is used to run them, and <strong>JVM</strong> is the engine inside the JRE that actually executes the bytecode.</p>`
                            },
                            {
                                content: `<h3>1. What is JVM (Java Virtual Machine)?</h3>
<ul>
<li>JVM is an <strong>abstract machine</strong>. It is a specification that vendors implement, not a single file.</li>
<li>It provides a runtime environment in which Java <strong>bytecode</strong> can be executed.</li>
<li>It can also run other languages that compile down to Java bytecode.</li>
<li>JVMs exist for many platforms (Windows, Linux, macOS). This is what makes Java portable.</li>
</ul>

<p>There are <strong>3 notions of the JVM</strong>:</p>
<ul>
<li><b>Specification:</b> the document describing how a JVM should behave.</li>
<li><b>Implementation:</b> an actual product, for example HotSpot.</li>
<li><b>Instance:</b> the running process on your machine.</li>
</ul>

<h4>The JVM's main jobs</h4>
<ul>
<li>Loads code (via the Class Loader)</li>
<li>Verifies code (bytecode verification)</li>
<li>Executes code (interpreter + JIT)</li>
<li>Provides the runtime environment (memory areas, garbage collection)</li>
</ul>`
                            },
                            {
                                content: `<h3>2. What is JRE (Java Runtime Environment)?</h3>
<ul>
<li>JRE is used only for <strong>running</strong> Java applications. It cannot compile code.</li>
<li>Unlike the JVM specification, the JRE is a real, installable package.</li>
<li>It holds the JVM plus the <strong>libraries and supporting files</strong> the JVM needs (for example the <code>java.lang</code> and <code>java.util</code> classes).</li>
<li>In short: <strong>JRE = JVM + Libraries</strong>.</li>
</ul>`
                            },
                            {
                                content: `<h3>3. What is JDK (Java Development Kit)?</h3>
<ul>
<li>JDK is the complete kit used to <strong>develop</strong> Java applications. It is a real, installable package.</li>
<li>It contains <strong>JRE + development tools</strong>.</li>
<li>Key tools: launcher (<code>java</code>), compiler (<code>javac</code>), archiver (<code>jar</code>), documentation generator (<code>javadoc</code>).</li>
<li>In short: <strong>JDK = JRE + Development Tools</strong> (compiler, debugger and more).</li>
</ul>`
                            },
                            {
                                content: `<h3>How They Fit Together</h3>
<p>JDK contains JRE, and JRE contains JVM. Each one is a superset of the one inside it:</p>


<div style="position:relative; background:#1e1e2e; border-radius:14px; padding:28px 20px; overflow:hidden; font-family:inherit;">
  <div style="position:relative; border:2px solid #ea580c; border-radius:16px; padding:22px 16px 16px; animation: jvmdiagGlowJdk 2.6s ease-in-out infinite;">
    <div style="position:absolute; top:-11px; left:16px; background:#ea580c; color:#fff; font-size:11px; font-weight:700; padding:2px 10px; border-radius:999px; letter-spacing:0.5px;">JDK</div>
    <div style="text-align:center; color:#fdba74; font-size:11px; margin-bottom:14px;">Development Tools — javac, jar, javadoc</div>
    <div style="position:relative; border:2px solid #f59e0b; border-radius:14px; padding:20px 14px 14px; animation: jvmdiagGlowJre 2.6s ease-in-out infinite 0.4s;">
      <div style="position:absolute; top:-11px; left:14px; background:#f59e0b; color:#1e1e2e; font-size:11px; font-weight:700; padding:2px 10px; border-radius:999px; letter-spacing:0.5px;">JRE</div>
      <div style="text-align:center; color:#fde68a; font-size:11px; margin-bottom:14px;">Libraries needed to run code</div>
      <div style="position:relative; border:2px solid #fbbf24; border-radius:12px; padding:22px 12px; text-align:center; animation: jvmdiagGlowJvm 2.2s ease-in-out infinite 0.8s; overflow:hidden;">
        <div style="position:absolute; top:-11px; left:12px; background:#fbbf24; color:#1e1e2e; font-size:11px; font-weight:700; padding:2px 10px; border-radius:999px; letter-spacing:0.5px;">JVM</div>
        <div style="width:14px; height:14px; margin:0 auto 8px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #fff7ed, #fbbf24 60%, #ea580c); animation: jvmdiagCore 1.4s ease-in-out infinite;"></div>
        <div style="color:#fef3c7; font-size:11px;">Executes bytecode</div>
      </div>
    </div>
  </div>
  <div style="position:absolute; left:50%; top:6px; width:6px; height:6px; margin-left:-3px; border-radius:50%; background:#fb923c; box-shadow:0 0 8px 2px rgba(251,146,60,0.8); animation: jvmdiagPulseDot 2.4s linear infinite;"></div>
  <div style="position:absolute; left:44%; top:6px; width:5px; height:5px; margin-left:-3px; border-radius:50%; background:#fcd34d; box-shadow:0 0 6px 2px rgba(252,211,77,0.7); animation: jvmdiagPulseDot 2.4s linear infinite 0.8s;"></div>
  <div style="position:absolute; left:56%; top:6px; width:5px; height:5px; margin-left:-3px; border-radius:50%; background:#fcd34d; box-shadow:0 0 6px 2px rgba(252,211,77,0.7); animation: jvmdiagPulseDot 2.4s linear infinite 1.6s;"></div>
</div>
<div style="text-align:center; font-size:11px; color:#78716c; margin-top:6px;">.java source flows down through javac → JRE libraries → the JVM core, where bytecode actually executes</div>
<h4>Quick Comparison</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Area</th><th>JVM</th><th>JRE</th><th>JDK</th></tr>
<tr class='text-center'><td>Full Form</td><td>Java Virtual Machine</td><td>Java Runtime Environment</td><td>Java Development Kit</td></tr>
<tr class='text-center'><td>Made up of</td><td>Class loader + memory areas + execution engine</td><td>JVM + Libraries</td><td>JRE + Development Tools</td></tr>
<tr class='text-center'><td>Used for</td><td>Executing bytecode</td><td>Running Java applications</td><td>Developing Java applications</td></tr>
<tr class='text-center'><td>Platform dependent?</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
</table>
<ul>
<li>JVM is <strong>platform-dependent</strong>; the bytecode it runs is <strong>platform-independent</strong>.</li>
<li>Java's <strong>"Write Once, Run Anywhere"</strong> is possible because of the JVM.</li>
</ul>`
                            },
                            {
                                content: `<h3>Compile &amp; Run - What Actually Happens</h3>
<p>Save your source as <code>Hello.java</code>, then run <code>javac Hello.java</code>. The compiler (part of the JDK) produces <code>Hello.class</code> containing <strong>Java Bytecode</strong>. Running <code>java Hello</code> starts the JVM (part of the JRE) and executes that bytecode.</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Hello.java  (source code)
     |
     |  javac Hello.java   &lt;- JDK compiler
     v
Hello.class  (bytecode)
     |
     |  java Hello         &lt;- JRE starts the JVM
     v
   JVM executes the bytecode
     |
     v
Program Output</pre>`,
                                codeExamples: [
                                    `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
// Step 1: javac Hello.java -> Hello.class (bytecode), by the JDK compiler
// Step 2: java Hello       -> the JVM loads and executes Hello.class
// OUTPUT: Hello Java`
                                ]
                            },

                            {
                                content: `<h3>1. Definition</h3>
• <b>JVM</b> (Java Virtual Machine) is the engine that loads, verifies and executes bytecode. <br>
• <b>JRE</b> (Java Runtime Environment) is the JVM plus the core class libraries needed to run a program. <br>
• <b>JDK</b> (Java Development Kit) is the JRE plus the development tools such as javac, javadoc and jdb. <br>
Short form: JDK contains JRE, and JRE contains JVM. <br><br>

<h3>2. Purpose of this topic</h3>
• To know which one to install: developers need the JDK, end users only need the JRE. <br>
• To understand which component throws which error during compile and run. <br>
• To explain the compile then run pipeline clearly in an interview. <br><br>

<h3>3. Need of this topic</h3>
• The error "javac is not recognized" happens because only the JRE was installed. <br>
• A server that only runs a jar does not need the compiler, so a smaller JRE image saves cost. <br>
• Understanding the JVM explains platform independence, which is the core selling point of Java.`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: proving what each part does at run time

public class JvmJreJdkDemo {

    public static void main(String[] args) {

        // The JVM is what is running this code right now
        System.out.println("JVM name    : " + System.getProperty("java.vm.name"));
        System.out.println("JVM version : " + System.getProperty("java.vm.version"));

        // The JRE supplies these core library classes (java.lang, java.util)
        String bank = "State Bank of India";
        java.util.List<String> branches = java.util.Arrays.asList("Pune", "Nagpur", "Nashik");
        System.out.println("Bank     : " + bank);
        System.out.println("Branches : " + branches);

        // The JDK is what compiled this file with javac.
        // WRONG: installing only the JRE and then running
        //   javac JvmJreJdkDemo.java
        //   -> javac is not recognized as an internal or external command
        // RIGHT: install the JDK, which already includes the JRE and the JVM.

        System.out.println("Java home (JRE inside the JDK): "
                + System.getProperty("java.home"));
    }
}
// HOW IT FLOWS:
// JvmJreJdkDemo.java --javac (JDK)--> JvmJreJdkDemo.class --java (JRE starts JVM)--> output
// OUTPUT:
// JVM name    : OpenJDK 64-Bit Server VM
// JVM version : 21.0.2+13
// Bank     : State Bank of India
// Branches : [Pune, Nagpur, Nashik]
// Java home (JRE inside the JDK): C:\\Program Files\\Java\\jdk-21`
                                ]
                            },

                            {
                                content: `<h3>4. Advantages</h3>
• <b>Clear separation:</b> a machine that only runs programs installs the lighter JRE. <br>
• <b>Platform independence:</b> the JVM hides the operating system from your bytecode. <br>
• <b>Automatic memory management:</b> the JVM garbage collector frees unused objects. <br>
• <b>Security:</b> the JVM verifies bytecode before running it. <br>
• <b>One JDK, many tools:</b> javac, javadoc, jar, jdb and jshell all ship together. <br><br>

<h3>5. Disadvantages</h3>
• <b>Extra layer:</b> the JVM makes Java slower than natively compiled C. <br>
• <b>Confusing for beginners:</b> three similar names cause install mistakes. <br>
• <b>Disk and memory cost:</b> a full JDK is large compared to a script runtime. <br>
• <b>Version mismatch:</b> a class compiled on JDK 21 fails on a JDK 17 JVM with UnsupportedClassVersionError. <br>
• <b>Modern JDKs no longer ship a separate JRE download,</b> which surprises people upgrading from Java 8.`,
                                codeExamples: [
                                    `// Points 4 and 5: version mismatch, the most common JVM level error

public class VersionMismatchDemo {

    public static void main(String[] args) {

        int running = Runtime.version().feature();
        System.out.println("This JVM major version: " + running);

        // DISADVANTAGE example:
        // WRONG: compile on a new JDK and run on an old JVM
        //   javac VersionMismatchDemo.java        (JDK 21, class file version 65)
        //   java VersionMismatchDemo              (JVM 17, understands up to 61)
        //   -> java.lang.UnsupportedClassVersionError:
        //      VersionMismatchDemo has been compiled by a more recent version
        //      of the Java Runtime (class file version 65.0), this version of
        //      the Java Runtime only recognizes class file versions up to 61.0

        // RIGHT: compile for the oldest runtime you must support
        //   javac --release 17 VersionMismatchDemo.java

        // ADVANTAGE: the JVM manages memory for you
        Runtime rt = Runtime.getRuntime();
        System.out.println("Free heap MB : " + (rt.freeMemory() / (1024 * 1024)));
        System.out.println("Max heap MB  : " + (rt.maxMemory() / (1024 * 1024)));
        System.out.println("Processors   : " + rt.availableProcessors());
    }
}
// OUTPUT (values vary):
// This JVM major version: 21
// Free heap MB : 243
// Max heap MB  : 4096
// Processors   : 8`
                                ]
                            },

                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>Developer laptop in an Indian IT company:</b> JDK installed, because code is written and compiled there. <br>
• <b>Production application server:</b> only the runtime is needed to run the deployed jar. <br>
• <b>Docker:</b> a build stage uses a JDK image and the final stage uses a smaller JRE image. <br>
• <b>College lab machines:</b> JDK installed so students can compile practical programs. <br>
• <b>Android:</b> uses its own virtual machine (ART) instead of the standard JVM, but the JDK is still used to compile. <br>
• <b>Bank ATM switch:</b> runs on a tuned JVM with a fixed heap size for predictable behaviour.`,
                                codeExamples: [
                                    `// Point 6: a small ATM style program, then a note on JVM tuning flags

public class AtmMachineDemo {

    private static double balance = 32000.0;

    private static void withdraw(int amount) {
        // WRONG: allowing any amount without validating the note multiples
        // balance = balance - amount;

        // RIGHT: ATMs dispense only multiples of 100
        if (amount % 100 != 0) {
            System.out.println("Enter an amount in multiples of Rs 100");
            return;
        }
        if (amount > balance) {
            System.out.println("Insufficient balance");
            return;
        }
        balance = balance - amount;
        System.out.println("Please collect Rs " + amount);
    }

    public static void main(String[] args) {

        withdraw(2500);      // rejected, not a multiple of 100
        withdraw(2000);      // success
        withdraw(90000);     // rejected, more than balance

        System.out.println("Available balance: Rs " + balance);
    }
}
// HOW A BANK RUNS THIS IN PRODUCTION:
// java -Xms512m -Xmx512m -XX:+UseG1GC AtmMachineDemo
// A fixed minimum and maximum heap avoids resize pauses during peak hours.
// OUTPUT:
// Enter an amount in multiples of Rs 100
// Please collect Rs 2000
// Insufficient balance
// Available balance: Rs 30000.0`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Uses of JVM, JRE and JDK</h3>
<ul>
<li><strong>JVM:</strong> runs and manages Java applications on any OS.</li>
<li><strong>JRE:</strong> used by end users to run Java-based software (like desktop apps).</li>
<li><strong>JDK:</strong> used by developers to write, compile and debug Java code.</li>
</ul>
<p>You can query the running JVM at runtime using system properties and the <code>Runtime</code> class:</p>`,
                                codeExamples: [
                                    `// Print JVM Memory Details using Runtime class
public class MemoryInfo {
    public static void main(String[] args) {
        Runtime runtime = Runtime.getRuntime();
        System.out.println("Total Memory: " + runtime.totalMemory());
        System.out.println("Free Memory: " + runtime.freeMemory());
        System.out.println("Max Memory: " + runtime.maxMemory());
    }
}
// OUTPUT (example, bytes, values vary):
// Total Memory: 266338304
// Free Memory: 259072104
// Max Memory: 4252017664`,
                                    `// Get Java Version and JVM Details
public class VersionInfo {
    public static void main(String[] args) {
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("JVM Vendor: " + System.getProperty("java.vendor"));
        System.out.println("JVM Name: " + System.getProperty("java.vm.name"));
        System.out.println("OS Name: " + System.getProperty("os.name"));
        System.out.println("OS Architecture: " + System.getProperty("os.arch"));
    }
}
// OUTPUT (example, values vary by machine):
// Java Version: 1.8.0_441
// JVM Vendor: Oracle Corporation
// JVM Name: Java HotSpot(TM) 64-Bit Server VM
// OS Name: Windows 11
// OS Architecture: amd64`
                                ]
                            },
                            {
                                content: `<h3>The Big Picture - JDK, JRE and JVM Together</h3>
<p>This diagram shows what happens from writing a <code>.java</code> file to running the application.</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                         JDK
                 Java Development Kit

   Development Tools
   |-- javac
   |-- javadoc
   |-- jar
   |-- jdb
   |-- javap
   |-- jlink
   `+"`"+`-- jpackage

   +---------------------------------------------+
   |                  Runtime                    |
   |   Java Runtime Libraries                     |
   |                                               |
   |   +---------------------------------------+   |
   |   |                 JVM                   |   |
   |   |         Java Virtual Machine          |   |
   |   |                                       |   |
   |   |  Class Loader                         |   |
   |   |  Runtime Memory                       |   |
   |   |  Execution Engine                     |   |
   |   |  JIT Compiler                         |   |
   |   |  Garbage Collector                    |   |
   |   +---------------------------------------+   |
   +---------------------------------------------+</pre>

<p><strong>Modern Java:</strong> Java 9 made the platform modular, and since Java 11 Oracle no longer ships a separate JRE. For Java 17/21, the layout is:</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">JDK
|-- JVM
|-- Java Runtime Libraries
`+"`"+`-- Development Tools</pre>

<p>The term <strong>JRE</strong> still describes the runtime part of Java, but you normally install a <strong>JDK</strong> instead of a separate JRE.</p>`
                            },
                            {
                                content: `<h3>JVM Architecture - Class Loader, Runtime Areas &amp; Execution Engine</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                    JVM
                     |
        +------------+------------+
        |            |            |
        v            v            v
 Class Loader   Runtime Data   Execution Engine
                   Areas
        |            |            |
        |            |       +----+----+
        |            |       |         |
        |            |       v         v
        |            | Interpreter    JIT
        |            |
        |            v
        |       Heap / Stack /
        |       Metaspace etc.
        |
        v
 Bytecode Verification</pre>

<h4>Class Loader Subsystem</h4>
<p>Loads <code>.class</code> files into JVM memory before they can be executed. Modern Java uses several class loaders:</p>
<ul>
<li><strong>Bootstrap Class Loader</strong> - loads the core API classes (<code>java.lang.*</code>, <code>java.util.*</code>, <code>java.io.*</code>). It is implemented natively and has no parent.</li>
<li><strong>Platform Class Loader</strong> - loads platform-level classes; it replaced the old "Extension Class Loader" in Java 9.</li>
<li><strong>Application/System Class Loader</strong> - loads classes from the application classpath or module path (for example your <code>com.example.*</code> classes).</li>
<li><strong>Custom Class Loaders</strong> - your own loaders (extend <code>ClassLoader</code> and override <code>findClass()</code>), for example to load from a network or an encrypted source.</li>
</ul>
<p>Class loaders follow the <strong>parent delegation model</strong>: a loader first asks its parent, and loads the class itself only if the parent cannot find it. This stops application code from silently replacing core classes like <code>java.lang.String</code>.</p>

<h4>Bytecode Verification</h4>
<p>Before executing bytecode, the JVM checks its structure, type safety, valid instructions, stack consistency and access rules:</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">.class
  |
  v
Class Loading
  |
  v
Bytecode Verification
  |
  v
Preparation / Linking
  |
  v
Initialization
  |
  v
Execution</pre>`
                            },
                            {
                                content: `<h3>JVM Runtime Data Areas</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">JVM Runtime Data Areas
|
|-- Heap
|-- Java Stack
|-- PC Register
|-- Method Area
`+"`"+`-- Native Method Stack</pre>

<h4>Heap</h4>
Where Java objects are generally allocated. This area is shared across all threads, and the garbage collector manages objects living here.<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Stack
  |
  | emp
  v
Heap
+------------------+
| Employee Object  |
|                  |
| id = 101         |
| name = "Pankaj"  |
+------------------+</pre>

<h4>Java Stack</h4>
Each thread has its own JVM stack; every method call creates a <strong>stack frame</strong> holding local variables and partial results.<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Thread
  |
  v
Java Stack
+------------------+
| calculate()      |
| x = 10           |
| y = 20           |
+------------------+
| main()           |
| args             |
+------------------+</pre>

<h4>PC Register</h4>
Program Counter - each JVM thread has its own, tracking the address of the current bytecode instruction being executed.<br><br>

<h4>Native Method Stack</h4>
Supports execution of native methods, e.g. through <strong>JNI (Java Native Interface)</strong>, used when Java interacts with platform-specific native libraries.<br><br>

<h4>Method Area / Metaspace</h4>
Stores class metadata (class structure, constants, static variables) and related runtime information. In modern HotSpot JVMs, this concept is implemented as <strong>Metaspace</strong>, which uses native memory rather than the traditional Java heap - unlike the old <strong>PermGen</strong> (pre-Java 8), which was a fixed-size heap region prone to <code>OutOfMemoryError</code>, Metaspace grows dynamically.<br>`
                            },
                            {
                                content: `<h3>Execution Engine - Interpreter, JIT &amp; Garbage Collector</h3>
Once classes are loaded and verified, the execution engine runs the bytecode:<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Execution Engine
|
|-- Interpreter
|-- JIT Compiler
`+"`"+`-- Garbage Collection integration/runtime services</pre>

<h4>Interpreter</h4>
Executes bytecode instructions directly, letting code start running without waiting for the whole application to compile into native code.<br><br>

<h4>JIT Compiler (Just-In-Time)</h4>
Improves performance by compiling <strong>frequently executed</strong> ("hot") bytecode into native machine code:<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Method called once
      |
Interpreter may execute it

Method called thousands of times
      |
JIT identifies it as hot
      |
Compiles optimized native code
      |
Future executions become faster</pre>

<h4>Garbage Collector</h4>
Automatically reclaims memory for objects that are no longer reachable:<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Object
  |
No reachable references
  |
Eligible for GC
  |
Garbage Collector
  |
Memory reclaimed</pre>

Modern JVMs provide multiple collectors depending on application needs: <strong>G1</strong>, <strong>ZGC</strong>, <strong>Shenandoah</strong>, <strong>Parallel GC</strong>, <strong>Serial GC</strong>.<br>`,
                                codeExamples: [
                                    `public class GcDemo {
    public static void main(String[] args) {
        Employee emp = new Employee();
        emp = null;     // old object is now eligible for GC (unreachable)
        System.gc();    // only a request; the JVM may run GC later
        System.out.println("GC requested");
    }
}
class Employee {}
// OUTPUT:
// GC requested`
                                ]
                            },
                            {
                                content: `<h3>JDK Development Tools</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Tool</th><th>Purpose</th></tr>
<tr class='text-center'><td>javac</td><td>Compiles .java source into .class bytecode</td></tr>
<tr class='text-center'><td>java</td><td>Starts the JVM and runs a compiled application</td></tr>
<tr class='text-center'><td>jar</td><td>Creates and manages Java Archive (.jar) files</td></tr>
<tr class='text-center'><td>javadoc</td><td>Generates API documentation from source comments</td></tr>
<tr class='text-center'><td>javap</td><td>Inspects/disassembles compiled .class files</td></tr>
<tr class='text-center'><td>jlink</td><td>Builds a custom runtime image with only required modules</td></tr>
<tr class='text-center'><td>jpackage</td><td>Packages an app into a platform installer (.exe/.msi, .deb/.rpm, .pkg/.dmg)</td></tr>
</table>
<br>

<h4>javac and java</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">javac Employee.java     # Employee.java -> Employee.class (bytecode)
java Employee            # JVM starts -> loads class -> finds main() -> executes bytecode</pre>

<h4>jar</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">jar cf application.jar *</pre>
A JAR can contain .class files, resources, configuration and metadata. A Spring Boot application is commonly packaged as a JAR.<br><br>

<h4>javap</h4>
Useful for inspecting compiled class files and learning how source becomes bytecode:<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">javap Employee.class
javap -c Employee.class   # shows bytecode instructions</pre>

<h4>jlink</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Full JDK
   |
Required Modules
   |
Custom Runtime Image</pre>
Useful for creating smaller, purpose-built Java runtime distributions.<br>`
                            },
                            {
                                content: `<h3>Complete Compilation &amp; Execution Lifecycle</h3>
Step by step, from source code to CPU execution:<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Step</th><th>What happens</th></tr>
<tr class='text-center'><td>1. Source Code</td><td>Human-readable Employee.java is written</td></tr>
<tr class='text-center'><td>2. Compilation</td><td>javac compiles it into Employee.class bytecode</td></tr>
<tr class='text-center'><td>3. Bytecode</td><td>.class holds JVM bytecode, not CPU-specific machine code</td></tr>
<tr class='text-center'><td>4. JVM Startup</td><td>java Employee starts the JVM</td></tr>
<tr class='text-center'><td>5. Class Loading</td><td>Employee.class is loaded via the class-loading subsystem</td></tr>
<tr class='text-center'><td>6. Linking</td><td>Verification, preparation, resolution</td></tr>
<tr class='text-center'><td>7. Initialization</td><td>Static initialization runs as required</td></tr>
<tr class='text-center'><td>8. main() Execution</td><td>JVM invokes public static void main(String[] args)</td></tr>
<tr class='text-center'><td>9. Interpreter/JIT</td><td>Bytecode executes; hot code gets JIT-compiled</td></tr>
<tr class='text-center'><td>10. Native Execution</td><td>Optimized native instructions run on the CPU</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Employee.java
     |
    javac
     |
Employee.class
     |
    JVM
     |
Interpreter / JIT
     |
Native Code
     |
CPU</pre>`
                            },
                            {
                                content: `<h3>Platform Independence - The Exact Reason (Top Interview Question)</h3>
<p><strong>Q: Why is Java platform independent?</strong></p>
<p>Because Java source code is compiled into <strong>platform-independent bytecode</strong>, and a JVM built for the target platform executes that bytecode.</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">              Same Bytecode
                   |
        +----------+----------+
        v          v          v
   Windows JVM  Linux JVM  macOS JVM
        v          v          v
     Windows     Linux      macOS</pre>

<p>The bytecode stays the same. Only the JVM differs, because each JVM talks to its own OS, CPU and native libraries.</p>

<h4>Vendors / Distributions</h4>
<p>Different vendors ship JVM/JDK builds that follow the same specification. They differ in support, tuning and extra tools:</p>
<ul>
<li><strong>Oracle JDK:</strong> Oracle official build.</li>
<li><strong>OpenJDK:</strong> the open-source reference implementation that most other builds are based on.</li>
<li><strong>GraalVM:</strong> adds a high-performance JIT and supports ahead-of-time (native image) compilation.</li>
</ul>`
                            },
                            {
                                content: `<h3>JDK vs JRE vs JVM - Full Comparison</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Area</th><th>JVM</th><th>JRE</th><th>JDK</th></tr>
<tr class='text-center'><td>Primary Purpose</td><td>Execute bytecode</td><td>Run Java applications</td><td>Develop Java applications</td></tr>
<tr class='text-center'><td>Executes Bytecode</td><td>Yes</td><td>Through JVM</td><td>Through JVM</td></tr>
<tr class='text-center'><td>Runtime Libraries</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Compiler</td><td>No</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>Debugger</td><td>No</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>JAR Tool</td><td>No</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>Javadoc</td><td>No</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>JVM Included</td><td>-</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Superset / Subset</td><td>Subset of JRE</td><td>Subset of JDK, Superset of JVM</td><td>Superset of JRE</td></tr>
<tr class='text-center'><td>Separate installer today</td><td>No</td><td>No (Java 11+)</td><td>Yes</td></tr>
</table>

<h3>JDK 8 vs Modern JDK (9+)</h3>

<h4>Java 8 model</h4>
<p>A JDK 8 installation contained a separate <code>jre</code> directory:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">jdk1.8.x
|-- bin
|-- lib
`+"`"+`-- jre
    |-- bin
    `+"`"+`-- lib</pre>

<h4>Java 9+ model</h4>
<p>Java 9 made the platform modular and removed the separate <code>jre</code> directory:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">JDK
|-- bin
|-- conf
|-- include
|-- jmods
|-- legal
`+"`"+`-- lib</pre>

<p>So in JDK 17 / 21 / 25 do <strong>not</strong> expect a <code>jre</code> directory.</p>

<h4>Spring Boot on the JVM</h4>
<p>Spring Boot does <strong>not</strong> replace the JVM. It runs on top of it:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Spring Boot Application
        |
application.jar
        |
java -jar application.jar
        |
       JVM
        |
Spring Framework Classes
        |
Your Application Classes
        |
       CPU</pre>`
                            },
                            {
                                content: `<h3>Common Misconceptions (Corrected)</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Incorrect</th><th>Correct</th></tr>
<tr class='text-center'><td>JVM compiles Java source code</td><td>javac compiles source to bytecode; the JVM executes/JIT-compiles bytecode</td></tr>
<tr class='text-center'><td>JRE compiles Java code</td><td>JRE is a runtime environment; compilation is a JDK development function</td></tr>
<tr class='text-center'><td>JVM is platform independent</td><td>Java bytecode is platform independent; the JVM implementation is platform dependent</td></tr>
<tr class='text-center'><td>JRE is a required separate install for Java 21</td><td>The JDK already includes the runtime; Oracle ships no standalone JRE since Java 11</td></tr>
<tr class='text-center'><td>.class contains machine code</td><td>.class contains JVM bytecode; the JVM/JIT may translate it to native code at runtime</td></tr>
</table>

<h3>Easy Memory Trick</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">JVM = Run          JVM -> Engine
JRE = Runtime      JRE -> Environment
JDK = Develop      JDK -> Toolkit</pre>

<h3>Final Concept Diagram</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                 JDK
        Java Development Kit
                 |
        +--------+--------+
        |                 |
 Development Tools      Runtime
        |                 |
   +----+----+            JVM
   |    |    |             |
 javac jar jdb          Class Loader
                          |
                     Runtime Memory
                          |
                     Execution Engine
                       /       \\
              Interpreter       JIT
                                 |
                                 v
                          Native Machine Code
                                 |
                                 v
                                CPU</pre>

<p><strong>Strongest interview definition:</strong> JDK is the complete Java development kit. JRE is the runtime environment containing the JVM and the Java runtime libraries. JVM is the execution engine that loads, verifies and executes Java bytecode, using interpretation and JIT compilation to run code on the underlying platform.</p>`
                            },
                            {
                                content: `<h3>Interview Questions - JVM, JDK, JRE &amp; ClassLoader</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is JVM?</td><td>An abstract machine/specification that provides the runtime environment to execute Java bytecode, making Java platform independent</td></tr>
<tr class='text-center'><td>What is JDK?</td><td>The complete development kit: JRE + compiler (javac) + development tools, used to write and build Java apps</td></tr>
<tr class='text-center'><td>What is JRE?</td><td>The runtime package: JVM + libraries, used only to run already-compiled Java apps</td></tr>
<tr class='text-center'><td>What is a ClassLoader?</td><td>The JVM subsystem that loads .class files into memory before they can be executed</td></tr>
<tr class='text-center'><td>Types of ClassLoader?</td><td>Bootstrap, Platform (formerly Extension), Application/System, and user-defined Custom class loaders</td></tr>
<tr class='text-center'><td>What is the Bootstrap ClassLoader?</td><td>Loads core Java API classes (java.lang.*, java.util.*); implemented natively and has no parent</td></tr>
<tr class='text-center'><td>What is the Application ClassLoader?</td><td>Loads classes from the application's own classpath/module path</td></tr>
<tr class='text-center'><td>What is class loading?</td><td>The process of locating, reading, and bringing a class's bytecode into JVM memory as a Class object</td></tr>
<tr class='text-center'><td>What are the JVM's main components?</td><td>Class Loader Subsystem, Runtime Data Areas, and the Execution Engine (Interpreter + JIT + GC)</td></tr>
<tr class='text-center'><td>What is the Method Area?</td><td>Stores class-level metadata (structure, constants, static variables); implemented as Metaspace in modern HotSpot</td></tr>
<tr class='text-center'><td>What is Heap memory?</td><td>Shared memory area where all Java objects are allocated; managed by the Garbage Collector</td></tr>
<tr class='text-center'><td>What is Stack memory?</td><td>Per-thread memory holding stack frames (local variables, partial results) for each method call</td></tr>
<tr class='text-center'><td>What is the PC Register?</td><td>Per-thread register that tracks the address of the currently executing bytecode instruction</td></tr>
<tr class='text-center'><td>What is the Native Method Stack?</td><td>Supports execution of native (non-Java) methods, e.g. through JNI</td></tr>
<tr class='text-center'><td>What is the class loading lifecycle?</td><td>Loading -> Linking (Verify, Prepare, Resolve) -> Initialization</td></tr>
<tr class='text-center'><td>What is linking (verify/prepare/resolve)?</td><td>Verify checks bytecode correctness; Prepare allocates memory for static fields with default values; Resolve replaces symbolic references with direct references</td></tr>
<tr class='text-center'><td>Metaspace vs PermGen?</td><td>PermGen (pre-Java 8) was a fixed-size heap region prone to OutOfMemoryError; Metaspace (Java 8+) stores class metadata in native memory and grows dynamically</td></tr>
<tr class='text-center'><td>NoClassDefFoundError vs ClassNotFoundException?</td><td>ClassNotFoundException is a checked exception thrown when Class.forName() or loadClass() cannot find a class; NoClassDefFoundError is an Error thrown when a class was present at compile time but is missing at runtime (for example a deleted jar)</td></tr>
<tr class='text-center'><td>What is the parent delegation model?</td><td>A class loader asks its parent to load a class first; it loads it itself only if the parent can't - prevents core classes from being overridden</td></tr>
<tr class='text-center'><td>Why is the Bootstrap ClassLoader native?</td><td>It has to bootstrap the JVM itself before any Java-level class loading machinery exists, so it's implemented in native code, not Java</td></tr>
<tr class='text-center'><td>How do you create a custom ClassLoader?</td><td>Extend java.lang.ClassLoader and override findClass() to implement custom loading logic (e.g. loading from network or an encrypted source)</td></tr>
</table>`
                            },

                            {
                                content: `<h3>1. Definition</h3>
The JVM is a specification (the Java Virtual Machine Specification) with many implementations such as HotSpot, OpenJ9 and GraalVM. It defines the class file format, the bytecode instruction set, the runtime data areas and the memory model. The JRE is a packaged runtime image of that VM plus java.base and friends; the JDK adds javac, jlink, jpackage, jcmd, jfr and the rest of the toolchain. <br><br>

<h3>2. Purpose of this topic</h3>
• To diagnose class loading and linkage failures from the exact error type. <br>
• To size and tune the heap, metaspace and collector for a production service. <br>
• To build minimal runtime images with jlink instead of shipping a full JDK. <br><br>

<h3>3. Need of this topic</h3>
• Production incidents such as OutOfMemoryError Metaspace, NoClassDefFoundError and UnsupportedClassVersionError are all JVM level. <br>
• Container memory limits must account for heap plus metaspace plus thread stacks plus native buffers. <br>
• Interview design rounds ask how you would reduce a 400 MB image to 90 MB.`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level:
// walking the class loader hierarchy and reading real JVM memory areas

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;

public class JvmInternalsProbe {

    public static void main(String[] args) {

        // 1. Class loader delegation chain for an application class
        ClassLoader loader = JvmInternalsProbe.class.getClassLoader();
        while (loader != null) {
            System.out.println("Loader: " + loader.getName());
            loader = loader.getParent();
        }
        System.out.println("Loader: bootstrap (null, implemented in native code)");

        // WRONG assumption: core JDK classes are loaded by the app class loader
        System.out.println("String loader (expect null): "
                + String.class.getClassLoader());

        // 2. Real memory areas, not guesses
        MemoryMXBean mem = ManagementFactory.getMemoryMXBean();
        MemoryUsage heap = mem.getHeapMemoryUsage();
        MemoryUsage nonHeap = mem.getNonHeapMemoryUsage();

        System.out.println("Heap used MB     : " + (heap.getUsed() / (1024 * 1024)));
        System.out.println("Heap max MB      : " + (heap.getMax() / (1024 * 1024)));
        System.out.println("NonHeap used MB  : " + (nonHeap.getUsed() / (1024 * 1024)));
        System.out.println("Class file major : " + (Runtime.version().feature() + 44));
    }
}
// USEFUL COMMANDS:
// jcmd <pid> VM.flags            shows every effective JVM flag
// jcmd <pid> GC.heap_info        shows live heap regions
// OUTPUT (values vary):
// Loader: app
// Loader: platform
// Loader: bootstrap (null, implemented in native code)
// String loader (expect null): null
// Heap used MB     : 9
// Heap max MB      : 4096
// NonHeap used MB  : 12
// Class file major : 65`
                                ]
                            },

                            {
                                content: `<h3>4. Advantages</h3>
• <b>Specification driven:</b> you can swap HotSpot for OpenJ9 or GraalVM without touching the code. <br>
• <b>Pluggable collectors:</b> SerialGC for tiny containers, G1 for general use, ZGC for sub millisecond pauses. <br>
• <b>Container awareness:</b> since JDK 10 the JVM reads cgroup limits and sizes the heap accordingly. <br>
• <b>jlink and jpackage:</b> build a custom runtime image containing only the modules you use. <br>
• <b>Deep observability:</b> JFR, JMC, jcmd, jstack and jmap ship inside the JDK for free. <br><br>

<h3>5. Disadvantages</h3>
• <b>Metaspace is native memory,</b> so a container can be killed by the OS even when the heap looks healthy. <br>
• <b>Thread stacks and direct byte buffers</b> live outside the heap and are easy to forget when sizing pods. <br>
• <b>Class loader leaks</b> in application servers cause slow metaspace exhaustion after repeated redeploys. <br>
• <b>Flag sprawl:</b> hundreds of tuning flags, and copied flags from a blog often hurt. <br>
• <b>No standard JRE download</b> after Java 8, so teams must build runtime images themselves.`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level:
// heap versus native memory, and why a container gets OOM killed

import java.nio.ByteBuffer;

public class NativeVersusHeapMemory {

    public static void main(String[] args) {

        Runtime rt = Runtime.getRuntime();
        System.out.println("Heap max MB (Xmx) : " + (rt.maxMemory() / (1024 * 1024)));

        // WRONG sizing for a container:
        //   docker run -m 512m  java -Xmx512m MyApp
        //   The heap alone is allowed to fill the whole container, leaving nothing
        //   for metaspace, thread stacks, code cache and direct buffers.
        //   Result: the Linux OOM killer stops the process, not a Java exception.

        // RIGHT sizing:
        //   docker run -m 512m  java -XX:MaxRAMPercentage=60 -Xss512k MyApp
        //   or let the JVM read the cgroup limit itself.

        // DIRECT BUFFERS are native memory, they do NOT count against Xmx
        ByteBuffer direct = ByteBuffer.allocateDirect(16 * 1024 * 1024);
        ByteBuffer onHeap = ByteBuffer.allocate(16 * 1024 * 1024);

        System.out.println("Direct buffer is off heap : " + direct.isDirect());
        System.out.println("Heap buffer is off heap   : " + onHeap.isDirect());
        System.out.println("Heap used MB after alloc  : "
                + ((rt.totalMemory() - rt.freeMemory()) / (1024 * 1024)));

        // RIGHT: cap native buffers explicitly with -XX:MaxDirectMemorySize=64m
    }
}
// OUTPUT (values vary):
// Heap max MB (Xmx) : 512
// Direct buffer is off heap : true
// Heap buffer is off heap   : false
// Heap used MB after alloc  : 21`
                                ]
                            },

                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>Payment switch at an Indian bank:</b> HotSpot with G1, fixed Xms equal to Xmx, and JFR always recording so a settlement pause can be replayed. <br>
• <b>Kubernetes microservices:</b> MaxRAMPercentage instead of a hard coded Xmx so the same image works on pods of different sizes. <br>
• <b>Legacy WebLogic or JBoss deployments:</b> repeated hot redeploys leaking class loaders until metaspace fills, fixed by restarting or by fixing static references. <br>
• <b>Serverless functions:</b> GraalVM native image removes JVM startup so a Lambda responds in milliseconds. <br>
• <b>Trading platforms:</b> ZGC chosen so pauses stay under a millisecond during market open. <br><br>

<b>Interview tip:</b> if asked to debug a container that keeps restarting with exit code 137, explain that the OOM killer acted on total process memory, then walk through heap, metaspace, stacks and direct buffers.`,
                                codeExamples: [
                                    `// Point 6 at expert level: detecting a metaspace style class loader leak
// the pattern that kills long lived application servers after many redeploys

import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;

public class ClassLoaderLeakDemo {

    // WRONG: a static collection that keeps references to old class loaders.
    // Every redeploy adds one more, and metaspace never gets reclaimed.
    private static final List<ClassLoader> LEAKED = new ArrayList<>();

    public static void main(String[] args) throws Exception {

        for (int deployment = 1; deployment <= 3; deployment++) {

            URLClassLoader appLoader = new URLClassLoader(new URL[0],
                    ClassLoaderLeakDemo.class.getClassLoader());

            // WRONG: this line is the leak
            LEAKED.add(appLoader);

            // RIGHT: close the loader and drop every reference to it, so its
            // classes become unreachable and metaspace can be reclaimed.
            appLoader.close();

            System.out.println("Deployment " + deployment
                    + " finished, retained loaders = " + LEAKED.size());
        }

        // RIGHT fix: clear the static holder when a deployment is undeployed
        LEAKED.clear();
        System.out.println("Retained loaders after cleanup = " + LEAKED.size());

        // Monitor with: jcmd <pid> VM.metaspace summary
        System.out.println("Check metaspace with: jcmd <pid> VM.metaspace summary");
    }
}
// OUTPUT:
// Deployment 1 finished, retained loaders = 1
// Deployment 2 finished, retained loaders = 2
// Deployment 3 finished, retained loaders = 3
// Retained loaders after cleanup = 0
// Check metaspace with: jcmd <pid> VM.metaspace summary`
                                ]
                            }
                        ]
};
