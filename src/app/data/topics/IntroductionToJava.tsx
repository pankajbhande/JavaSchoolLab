import { Topic } from '../coreJava';

export const introductionToJava: Topic = {
                        id: 'introduction',
                        name: 'Introduction to Java',
                        beginner: [
                            {
                                content: `<h3>What is Java?</h3>
Java is a <strong>high-level, class-based, object-oriented</strong> programming language designed to have as few implementation dependencies as possible. <br>
It was developed by <strong>James Gosling</strong> at Sun Microsystems (now owned by Oracle Corporation) and officially released in <strong>1995</strong>. <br><br>
In simple words: you write Java code once, and (thanks to the JVM) it can run on almost any device or operating system - Windows, Linux, macOS, and more - without changing the code.`
                            },

                            {
                                content: `<h3>Why is Java so widely used?</h3>
Because it is beginner-friendly, reliable, and works almost everywhere - from mobile apps and websites to large banking systems and enterprise servers.`
                            },

                            {
                                content: `<h4>Key Features of Java:</h4>
• <strong>Platform Independent:</strong> Write Once, Run Anywhere (WORA) <br>
• <strong>Object-Oriented:</strong> Everything is designed around objects and classes <br>
• <strong>Simple and Easy to Learn:</strong> Clean syntax, no explicit pointers <br>
• <strong>Secure:</strong> No direct memory/pointer access, runs inside the JVM sandbox <br>
• <strong>Robust:</strong> Strong memory management and automatic garbage collection <br>
• <strong>Multi-threaded:</strong> Built-in support for concurrent programming <br>
• <strong>Architecture Neutral:</strong> Compiled bytecode is portable across platforms <br>`
                            },

                            {
                                content: `<h4>Your First Java Program: "Hello, World!"</h4>
Every Java program starts execution from the <code>main</code> method. Below is the traditional first program every learner writes.`,
                                codeExamples: [
                                    `// First Java Program
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
// OUTPUT:
// Hello, World!`
                                ]
                            },

                            {
                                content: `<h4>JDK, JRE, and JVM - the basics</h4>
These three terms are the foundation of how Java code runs, and every beginner should know the difference: <br><br>
• <strong>JDK</strong> (Java Development Kit): The complete toolkit for developers - includes the compiler, debugger, and everything needed to write and build Java programs. <br>
• <strong>JRE</strong> (Java Runtime Environment): The environment needed to run a Java program (it does not include development tools like the compiler). <br>
• <strong>JVM</strong> (Java Virtual Machine): The engine that actually reads and executes the compiled Java bytecode. This is what makes Java "Write Once, Run Anywhere".`
                            },

                            {
                                content: `<h4>How does a Java program actually run?</h4>
Here is the simple flow from writing code to seeing the output on screen: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  You write code          Compiler converts it        JVM executes it
  +----------------+       +------------------+       +------------------+
  |  HelloWorld    |       |  javac compiles  |       |  java command    |
  |  .java file    |  -->  |  .java to        |  -->  |  runs .class on  |  -->  Output on screen
  |  (source code) |       |  .class file     |       |  the JVM         |
  |                |       |  (bytecode)      |       |  (bytecode ->    |
  |                |       |                  |       |   machine code)  |
  +----------------+       +------------------+       +------------------+</pre>
<br>
Because the middle step produces platform-independent <strong>bytecode</strong>, the same <code>.class</code> file can run unchanged on any operating system that has a compatible JVM installed - this is exactly what "Write Once, Run Anywhere" means.`
                            },

                            {
                                content: `<h3>1. Definition</h3>
Java is a high level, object oriented, platform independent programming language. You write the code once in a .java file, the compiler turns it into bytecode, and the JVM runs that bytecode on any machine. <br><br>

<h3>2. Purpose of this topic</h3>
• To understand what Java actually is before writing bigger programs. <br>
• To learn the three steps every Java program follows: write, compile, run. <br>
• To know why one compiled file works on Windows, Linux and Mac. <br><br>

<h3>3. Need of this topic</h3>
• Almost every bank in India (SBI, HDFC, ICICI) runs core banking software written in Java. <br>
• College portals, railway booking systems and UPI payment backends use Java. <br>
• Android apps were built with Java for many years. <br>
• Without knowing the basics, every later topic like OOPs, collections and Spring becomes confusing.`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: Definition, Purpose and Need
// A tiny college portal greeting written in plain Java

public class CollegeWelcome {

    public static void main(String[] args) {

        // WRONG: this is not valid Java, there is no class and no main method
        // print "Welcome"

        // RIGHT: every statement lives inside a method, inside a class
        String collegeName = "Pune Institute of Technology";
        String studentName = "Raoji Kumar";
        int feesInRupees = 45000;

        System.out.println("Welcome to " + collegeName);
        System.out.println("Student: " + studentName);
        System.out.println("Fees due: Rs " + feesInRupees);
    }
}
// OUTPUT:
// Welcome to Pune Institute of Technology
// Student: Raoji Kumar
// Fees due: Rs 45000`
                                ]
                            },

                            {
                                content: `<h3>4. Advantages</h3>
• <b>Platform independent:</b> one .class file runs on any operating system that has a JVM. <br>
• <b>Simple:</b> no pointers, no manual memory free, clean readable syntax. <br>
• <b>Automatic memory management:</b> the garbage collector frees unused objects for you. <br>
• <b>Huge library:</b> ready made classes for strings, dates, files, collections and networking. <br>
• <b>Big job market:</b> most Indian IT service companies hire Java developers. <br><br>

<h3>5. Disadvantages</h3>
• <b>Slower than C or C++</b> for very low level work because of the extra JVM layer. <br>
• <b>Uses more memory</b> since every object carries extra header information. <br>
• <b>Verbose:</b> even a small task needs a class and a main method. <br>
• <b>Garbage collection pauses</b> can hurt very time sensitive systems. <br>
• <b>No low level hardware control</b> like direct memory access.`,
                                codeExamples: [
                                    `// Points 4 and 5: Advantages and Disadvantages shown together

public class AdvantageAndDisadvantage {

    public static void main(String[] args) {

        // ADVANTAGE: automatic memory management
        // We never call free() or delete, the garbage collector handles it
        String message = new String("Balance updated");
        message = null; // the old object is now eligible for garbage collection
        System.out.println("Old object left for the garbage collector");

        // ADVANTAGE: rich built in library, no extra download needed
        StringBuilder receipt = new StringBuilder();
        receipt.append("SBI Savings Account").append("\\n");
        receipt.append("Balance: Rs 25000");
        System.out.println(receipt.toString());

        // DISADVANTAGE: verbose. Printing one line still needs a class and a main method.
        // DISADVANTAGE: no direct memory address access
        // WRONG in Java: int *p = &balance;  // pointers do not exist here
        // RIGHT in Java: use a reference variable instead
        int balance = 25000;
        int copyOfBalance = balance;
        System.out.println("Copy value: Rs " + copyOfBalance);
    }
}
// OUTPUT:
// Old object left for the garbage collector
// SBI Savings Account
// Balance: Rs 25000
// Copy value: Rs 25000`
                                ]
                            },

                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>Banking:</b> core banking systems of SBI, HDFC and ICICI process crores of transactions in Java. <br>
• <b>IRCTC:</b> the railway ticket booking backend handles lakhs of bookings using Java servers. <br>
• <b>UPI and payment apps:</b> settlement services on the server side are commonly Java based. <br>
• <b>Android:</b> apps like early WhatsApp and Flipkart were written in Java. <br>
• <b>College and school portals:</b> attendance, marks and fee systems. <br>
• <b>E commerce:</b> Amazon and Flipkart use Java microservices for orders and payments.`,
                                codeExamples: [
                                    `// Point 6: Real time example - a simple bank transaction

public class BankTransactionDemo {

    public static void main(String[] args) {

        String accountHolder = "Annaji Sharma";
        double balance = 50000.0;
        double withdrawAmount = 8000.0;

        System.out.println("Account holder: " + accountHolder);
        System.out.println("Opening balance: Rs " + balance);

        // WRONG: withdrawing without checking the balance
        // balance = balance - withdrawAmount;   // may make the balance negative

        // RIGHT: always check before you subtract
        if (withdrawAmount <= balance) {
            balance = balance - withdrawAmount;
            System.out.println("Withdrawn: Rs " + withdrawAmount);
        } else {
            System.out.println("Insufficient balance");
        }

        System.out.println("Closing balance: Rs " + balance);
    }
}
// OUTPUT:
// Account holder: Annaji Sharma
// Opening balance: Rs 50000.0
// Withdrawn: Rs 8000.0
// Closing balance: Rs 42000.0`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>History of Java</h3>

<h4>1. Beginning (1991) - The Green Project</h4>
• In 1991, <strong>James Gosling</strong>, Mike Sheridan, and Patrick Naughton at Sun Microsystems started a project called the <strong>Green Project</strong>.<br>
• <strong>Goal:</strong> Develop software for digital devices (TVs, set-top boxes, etc.).<br>
• The language was first called <strong>Oak</strong> (after an oak tree outside Gosling's office).<br><br>

<h4>2. Rename to Java (1995)</h4>
• Oak was already trademarked.<br>
• The team renamed it to <strong>Java</strong>, inspired by Java coffee (Gosling drank a lot of it).<br>
• In 1995, Sun officially released <strong>Java 1.0</strong> with the slogan <strong>"Write Once, Run Anywhere" (WORA)</strong>.<br><br>

<h4>3. Java in the Internet Era (1990s - early 2000s)</h4>
• Java gained popularity quickly because it was perfect for <strong>web applets</strong> and <strong>networked applications</strong>.<br>
• Many companies adopted it for <strong>enterprise-level applications</strong> (banking, telecom, etc.).<br><br>

<h4>4. Ownership Changes</h4>
• <strong>2006</strong> - Sun released Java as open-source under the GNU General Public License (GPL).<br>
• <strong>2010</strong> - Oracle Corporation acquired Sun Microsystems and became the official owner of Java.<br><br>

<h4>5. Modern Java (2011 - Present)</h4>
• Oracle introduced <strong>Java SE</strong> (Standard Edition), <strong>Java EE</strong> (Enterprise Edition), and <strong>Java ME</strong> (Micro Edition).<br>
• <strong>Java 8 (2014)</strong> was a turning point - introduced Lambdas, Streams, and functional programming features.<br>
• Java now follows a <strong>6-month release cycle</strong> (new versions every March and September).<br>
• Latest versions focus on <strong>performance, cloud, modularity, and modern language features</strong>.<br><br>

<h4>Summary</h4>
Java started in 1991 as Oak, was renamed to Java in 1995, and has evolved into one of the most widely used programming languages for <strong>web, enterprise, mobile, and cloud applications</strong>.`
                            },

                            {
                                content: `<h3>Design Goals of Java</h3>
Sun designed Java around a small set of explicit goals - these explain almost every design decision in the language: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Design Goal</th><th>How Java achieves it</th></tr>
<tr class='text-center'><td>Simple</td><td>No pointers, no operator overloading, automatic garbage collection</td></tr>
<tr class='text-center'><td>Object-oriented</td><td>Everything (except primitives) is modeled as a class/object</td></tr>
<tr class='text-center'><td>Portable / Architecture-neutral</td><td>Source compiles to bytecode, not native machine code - runs on any JVM</td></tr>
<tr class='text-center'><td>Robust</td><td>Strong compile-time type checking + runtime checks + automatic memory management</td></tr>
<tr class='text-center'><td>Secure</td><td>No direct memory access, bytecode verifier, classloader sandboxing, security manager</td></tr>
<tr class='text-center'><td>Multithreaded</td><td>Built-in language and library support for concurrent execution</td></tr>
<tr class='text-center'><td>High performance</td><td>Just-In-Time (JIT) compilation converts hot bytecode to native machine code at runtime</td></tr>
</table>`
                            },

                            {
                                content: `<h3>Java vs C/C++ - Why Java Was a Big Shift</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>C / C++</th><th>Java</th></tr>
<tr class='text-center'><td>Compilation target</td><td>Native machine code (platform-specific)</td><td>Bytecode (platform-independent, run by JVM)</td></tr>
<tr class='text-center'><td>Memory management</td><td>Manual (malloc/free, new/delete)</td><td>Automatic (Garbage Collector)</td></tr>
<tr class='text-center'><td>Pointers</td><td>Explicit pointer arithmetic allowed</td><td>No explicit pointers (references only)</td></tr>
<tr class='text-center'><td>Multiple inheritance (classes)</td><td>Supported in C++ (diamond problem possible)</td><td>Not supported for classes; achieved via interfaces</td></tr>
<tr class='text-center'><td>Platform dependency</td><td>Must recompile per platform</td><td>"Write Once, Run Anywhere" via the JVM</td></tr>
</table>`
                            },

                            {
                                content: `<h3>WORA Internals: Source Code to Execution on Any Platform</h3>
"Write Once, Run Anywhere" is not magic - it works because the compiler never targets a specific CPU/OS. It always targets the JVM's bytecode instruction set, and each platform simply needs its own JVM implementation to translate that bytecode into native instructions.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                         HelloWorld.java  (source code - written once)
                                 |
                                 v
                         javac (Java Compiler)
                                 |
                                 v
                       HelloWorld.class  (platform-independent bytecode)
                                 |
              +------------------+------------------+
              |                  |                  |
              v                  v                  v
      JVM on Windows      JVM on Linux        JVM on macOS
              |                  |                  |
              v                  v                  v
      Windows native      Linux native        macOS native
      machine code        machine code        machine code
              |                  |                  |
              v                  v                  v
         Output runs        Output runs        Output runs
        (same result)      (same result)      (same result)</pre>
<br>
The <strong>only</strong> platform-specific piece is the JVM itself - Oracle/OpenJDK ship a separate JVM build for each OS, but the <code>.class</code> bytecode file never changes.`
                            },

                            {
                                content: `<h3>Java Architecture: JDK vs JRE vs JVM</h3>
These three nest inside one another - JDK is the largest, JVM is the innermost engine: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">+------------------------------------------------------+
| JDK (Java Development Kit)                            |
|   compiler (javac), debugger, tools, docs             |
|                                                        |
|   +------------------------------------------------+ |
|   | JRE (Java Runtime Environment)                  | |
|   |   core libraries (java.lang, java.util, ...)    | |
|   |                                                  | |
|   |   +----------------------------------------+    | |
|   |   | JVM (Java Virtual Machine)               |    | |
|   |   |   loads, verifies & executes bytecode    |    | |
|   |   +----------------------------------------+    | |
|   +------------------------------------------------+ |
+------------------------------------------------------+</pre>
<br>
• <strong>JDK</strong> (Java Development Kit): complete environment to develop, compile, and run Java applications.<br>
• <strong>JRE</strong> (Java Runtime Environment): the runtime environment needed to run Java applications (JVM + core libraries), without development tools.<br>
• <strong>JVM</strong> (Java Virtual Machine): the abstract machine that actually loads, verifies, and executes Java bytecode.<br><br>

<h4>Compilation and Execution Process:</h4>
1. Source code (<code>.java</code>) → Java Compiler (<code>javac</code>) → Bytecode (<code>.class</code>) <br>
2. Bytecode → JVM (Class Loader → Bytecode Verifier → Interpreter/JIT) → Machine Code → Execution <br><br>

<h4>JVM Memory Areas:</h4>
• <strong>Heap:</strong> Where all objects are allocated <br>
• <strong>Stack:</strong> Stores method call frames and local variables (one stack per thread) <br>
• <strong>Method Area:</strong> Class structures, method data, and constants <br>
• <strong>PC Register:</strong> Holds the address of the currently executing instruction (per thread) <br>
• <strong>Native Method Stack:</strong> Supports native (non-Java) method execution <br>`
                            },

                            {
                                content: `<h3>Class Loading and Initialization Order in Action</h3>
When the JVM loads and initializes a class, static blocks run once (at class-loading time), then instance blocks and the constructor run every time an object is created - in that fixed order.<br>`,
                                codeExamples: [
                                    `// Understanding Class Loading
public class ClassLoadingExample {
    static {
        System.out.println("Static block executed");
    }

    {
        System.out.println("Instance block executed");
    }

    public ClassLoadingExample() {
        System.out.println("Constructor executed");
    }

    public static void main(String[] args) {
        System.out.println("main() started");
        new ClassLoadingExample();
    }
}
// OUTPUT:
// Static block executed
// main() started
// Instance block executed
// Constructor executed`
                                ]
                            },

                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Who created Java, and when was it released?</td><td>James Gosling at Sun Microsystems; released as Java 1.0 in 1995 (originally started as the "Green Project" in 1991, named Oak)</td></tr>
<tr class='text-center'><td>What does "Write Once, Run Anywhere" mean?</td><td>Java source compiles to platform-independent bytecode (.class), which any JVM - on any OS - can execute, so the same compiled file runs everywhere without recompilation</td></tr>
<tr class='text-center'><td>Difference between JDK, JRE, and JVM?</td><td>JVM executes bytecode; JRE = JVM + core libraries needed to run apps; JDK = JRE + development tools (compiler, debugger) needed to build apps</td></tr>
<tr class='text-center'><td>Is Java purely interpreted?</td><td>No - the JVM interprets bytecode initially, then uses a JIT (Just-In-Time) compiler to convert frequently executed ("hot") bytecode into native machine code for speed</td></tr>
<tr class='text-center'><td>Why is Java considered "secure" compared to C/C++?</td><td>No explicit pointers/pointer arithmetic, bytecode is verified before execution, and code runs inside the JVM's managed, sandboxed environment</td></tr>
<tr class='text-center'><td>Why doesn't Java support multiple inheritance of classes?</td><td>To avoid the "diamond problem" ambiguity that C++ has with multiple class inheritance; Java achieves similar flexibility safely through interfaces</td></tr>
<tr class='text-center'><td>What are the main JVM memory areas?</td><td>Heap (objects), Stack (method frames/local variables, per thread), Method Area (class data/constants), PC Register (per-thread instruction pointer), Native Method Stack</td></tr>
</table>`
                            },

                            {
                                content: `<h3>1. Definition</h3>
Java is a statically typed, class based language whose compiler emits a fixed instruction set called bytecode. The JVM loads that bytecode, verifies it, interprets it, and then a JIT compiler (C1 and C2 in HotSpot) promotes hot methods to native code guided by runtime profiling. <br><br>

<h3>2. Purpose of this topic</h3>
• To reason about the compile time and runtime boundary when you debug a production issue. <br>
• To understand why the same jar behaves differently on two servers (different JVM version or flags). <br>
• To answer interview questions on class loading, JIT and memory areas with confidence. <br><br>

<h3>3. Need of this topic</h3>
• Production incidents such as OutOfMemoryError, long GC pauses and NoClassDefFoundError are all JVM level problems. <br>
• Choosing heap size and garbage collector for a payment gateway needs this knowledge. <br>
• Class loading order decides whether a static configuration block ran before your service used it.`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level:
// proving the compile time versus runtime boundary and class initialization order

public class JvmBoundaryDemo {

    static class ConfigLoader {
        static {
            System.out.println("ConfigLoader static block: reads application config once");
        }
        static final String REGION = new String("IN-Mumbai"); // runtime value
        static final int MAX_TXN = 500;                  // compile time constant, inlined
    }

    public static void main(String[] args) throws Exception {

        // WRONG assumption: touching any static member always initializes the class.
        // MAX_TXN is a compile time constant, so javac inlines the value 500 into this
        // class file. The static block does NOT run here.
        System.out.println("Max txn = " + ConfigLoader.MAX_TXN);

        // RIGHT: reading a non constant static member really triggers initialization,
        // so the static block runs now.
        System.out.println("Region = " + ConfigLoader.REGION);

        // RIGHT: forcing initialization explicitly when order matters
        Class.forName(ConfigLoader.class.getName());

        System.out.println("JVM name: " + System.getProperty("java.vm.name"));
    }
}
// OUTPUT (order is the point):
// Max txn = 500
// ConfigLoader static block: reads application config once
// Region = IN-Mumbai
// JVM name: OpenJDK 64-Bit Server VM`
                                ]
                            },

                            {
                                content: `<h3>4. Advantages</h3>
• <b>Mature JIT:</b> HotSpot inlines, unrolls and escape analyses hot code, so long running servers approach native speed. <br>
• <b>Pluggable garbage collectors:</b> G1 for balanced workloads, ZGC and Shenandoah for sub millisecond pauses. <br>
• <b>Strong tooling:</b> JFR, JMC, jcmd, jstack and async profiler give deep production visibility. <br>
• <b>Backward compatibility:</b> a jar compiled years ago usually still runs on a newer JVM. <br>
• <b>Ecosystem:</b> Spring, Kafka, Hadoop and Elasticsearch all run on the JVM. <br><br>

<h3>5. Disadvantages</h3>
• <b>Slow startup and warm up:</b> bad for short lived serverless functions until the JIT warms up. <br>
• <b>Memory overhead:</b> object headers plus metaspace mean a higher footprint per container. <br>
• <b>GC tuning is a skill:</b> a wrong collector choice causes latency spikes at peak load. <br>
• <b>Type erasure in generics</b> removes generic type information at runtime. <br>
• <b>Verbosity</b> compared with Kotlin or Scala, though records and var have reduced it.`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: JIT warm up and memory overhead measured

public class JitAndMemoryDemo {

    private static long computeInterest(long principal, int years) {
        long total = principal;
        for (int i = 0; i < years; i++) {
            total = total + (total * 7) / 100;   // 7 percent simple style growth
        }
        return total;
    }

    public static void main(String[] args) {

        // DISADVANTAGE: the first calls are interpreted, so they are slow.
        // WRONG benchmarking: timing one single call and calling it the real speed.
        long startCold = System.nanoTime();
        computeInterest(100000L, 10);
        System.out.println("Cold call nanos: " + (System.nanoTime() - startCold));

        // RIGHT: warm the method up so C2 compiles it, then measure.
        for (int i = 0; i < 200000; i++) {
            computeInterest(100000L, 10);
        }
        long startHot = System.nanoTime();
        computeInterest(100000L, 10);
        System.out.println("Hot call nanos: " + (System.nanoTime() - startHot));

        // ADVANTAGE plus DISADVANTAGE: runtime memory is visible and manageable
        Runtime rt = Runtime.getRuntime();
        System.out.println("Max heap MB: " + (rt.maxMemory() / (1024 * 1024)));
        System.out.println("Used heap MB: "
                + ((rt.totalMemory() - rt.freeMemory()) / (1024 * 1024)));
    }
}
// OUTPUT (numbers vary by machine):
// Cold call nanos: 41200
// Hot call nanos: 380
// Max heap MB: 4096
// Used heap MB: 12`
                                ]
                            },

                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>NPCI UPI switch:</b> JVM services tuned with low pause collectors to keep response under 100 ms at crores of transactions a day. <br>
• <b>Zerodha and Upstox order gateways:</b> latency sensitive JVM tuning with pre warmed JIT paths. <br>
• <b>Aadhaar authentication services:</b> horizontally scaled JVM microservices behind load balancers. <br>
• <b>Netflix and Amazon:</b> thousands of JVM microservices with JFR based production profiling. <br>
• <b>Kafka and Elasticsearch:</b> infrastructure written in Java and Scala running on the JVM. <br><br>

<b>Interview tip:</b> when asked why a service is slow only after deployment, mention JIT warm up, cold caches and class loading before blaming the code.`,
                                codeExamples: [
                                    `// Point 6 at expert level: a production style UPI request handler
// showing thread safe counters and graceful shutdown

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

public class UpiSettlementService {

    private static final AtomicLong SETTLED = new AtomicLong();

    private static void settle(String vpa, double amountInRupees) {
        if (amountInRupees <= 0) {
            throw new IllegalArgumentException("Amount must be positive for " + vpa);
        }
        SETTLED.incrementAndGet();
    }

    public static void main(String[] args) throws InterruptedException {

        // WRONG: a plain long counter shared across threads loses updates
        // static long settled; settled++;   // not atomic, read modify write race

        // RIGHT: AtomicLong gives a lock free thread safe increment
        ExecutorService pool = Executors.newFixedThreadPool(4);

        for (int i = 0; i < 1000; i++) {
            final int id = i;
            pool.submit(() -> settle("user" + id + "@okhdfcbank", 250.0));
        }

        // WRONG: calling shutdownNow and losing queued work
        // RIGHT: shutdown then await so in flight settlements finish
        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);

        System.out.println("Settled transactions: " + SETTLED.get());
    }
}
// OUTPUT:
// Settled transactions: 1000`
                                ]
                            }
                        ]
};
