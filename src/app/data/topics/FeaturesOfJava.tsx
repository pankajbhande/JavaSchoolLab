import { Topic } from '../coreJava';
import featureImg from '../../../assets/feauture.png';
import platformIndependentImg from '../../../assets/platformindependent.png';
import securedImg from '../../../assets/secured.png';

export const featuresOfJava: Topic = {
                        id: 'feautures of java',
                        name: 'Features of Java',
                        beginner: [
                            {
                                content: `<p>Java has traits that make it a strong choice as a programming language. It is widely used in mobile development, chatbots and DevOps. Java was created to be <strong>portable</strong>, <strong>simple</strong> and <strong>secure</strong>. These traits are called <strong>Java Buzzwords</strong>.</p>
<h4>The common features of Java are:</h4>
<ol>
<li>Simple</li>
<li>Object-Oriented</li>
<li>Portable</li>
<li>Platform independent</li>
<li>Secured</li>
<li>Robust</li>
<li>Architecture neutral</li>
<li>Interpreted (compiled, then interpreted)</li>
<li>High Performance</li>
<li>Multithreaded</li>
<li>Distributed</li>
<li>Dynamic</li>
</ol>
<img src="${featureImg}" alt="Features of Java" class="d-block mx-auto" style="height: 350px;"/>
<p>Below is a short, plain-language explanation of every feature, with a small runnable example where code can show it.</p>`
                            },
                            {
                                content: `<h4>A Short History of Java</h4>
<ul>
<li><b>1991 - The Green Project:</b> James Gosling, Mike Sheridan and Patrick Naughton at Sun Microsystems started a project to build software for digital devices (TVs, set-top boxes). The language was first called <b>Oak</b>, after a tree outside Gosling's office.</li>
<li><b>1995 - Renamed to Java:</b> "Oak" was already trademarked, so the team renamed it <b>Java</b> (inspired by Java coffee). Sun released Java 1.0 with the slogan <b>"Write Once, Run Anywhere" (WORA)</b>.</li>
<li><b>1990s-2000s:</b> Java exploded in popularity for web applets and networked/enterprise applications (banking, telecom).</li>
<li><b>2006:</b> Sun open-sourced Java under the GPL.</li>
<li><b>2010:</b> Oracle acquired Sun Microsystems and became Java's official owner.</li>
<li><b>2014 - Java 8:</b> A turning point release - Lambdas, Streams, and functional-programming features.</li>
<li><b>Today:</b> Java follows a strict <b>6-month release cycle</b> (new version every March and September), with recent releases focused on performance, cloud-readiness, modularity, and developer productivity.</li>
</ul>
<b>One-line summary:</b> Java started in 1991 as Oak, was renamed Java in 1995, and has evolved into one of the most widely used languages for web, enterprise, mobile, and cloud applications.`
                            },
                            {
                                content: `<h4>1. Simple</h4>
<ul>
<li>Java is very easy to learn, and its syntax is simple, clean and easy to understand.</li>
<li>Java syntax is based on C++ (so it is easier for programmers to learn it after C++).</li>
<li>Java removed many complicated and rarely-used features, for example, explicit pointers and operator overloading.</li>
<li>There is no need to remove unreferenced objects manually because Java has Automatic Garbage Collection.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab;

public class SimpleSyntaxDemo {
    public static void main(String[] args) {        // Main Method
        // Simple and clean syntax
        System.out.println("Java is Simple!");
    }
}
// OUTPUT:
// Java is Simple!`
                                ]
                            },
                            {
                                content: `<h4>2. Object-Oriented</h4>
<ul>
<li>Almost everything in Java is a class or an object. The eight primitive types (<code>int</code>, <code>char</code>, <code>boolean</code> and so on) are the exception, so Java is not 100% object-oriented.</li>
<li>Object-oriented means we build software from objects that hold both data and behaviour.</li>
<li>Object-oriented programming (OOP) gives simple rules that make software easier to build and maintain.</li>
</ul>
<h4>The basic concepts of OOP are:</h4>
<ol>
<li>Object</li>
<li>Class</li>
<li>Inheritance</li>
<li>Polymorphism</li>
<li>Abstraction</li>
<li>Encapsulation</li>
</ol>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class Test {                    // Class
    void study() {                     // Method
        System.out.println("Student is studying...");
    }
    public static void main(String[] args) {
        Test obj = new Test();         // Object Create
        obj.study();                   // Method Call => ObjectName.MethodName
    }
}
// OUTPUT:
// Student is studying...`
                                ]
                            },
                            {
                                content: `<h4>3. Platform Independent</h4>
<img src="${platformIndependentImg}" alt="Platform Independent" class="d-block mx-auto" style="height: 260px;"/>
<ul>
<li>C and C++ compile to machine code for one platform. Java instead follows <strong>write once, run anywhere</strong>.</li>
<li>A platform is the hardware or software environment in which a program runs. Java provides a software-based platform that runs on top of the hardware platform.</li>
<li>The Java platform has 2 components: the Runtime Environment and the API (Application Programming Interface).</li>
<li>The compiler converts source code into <strong>bytecode</strong>. Bytecode runs on Windows, Linux, macOS and any other system that has a JVM. This is <strong>Write Once, Run Anywhere (WORA)</strong>.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class PlatformIndependentDemo {
    public static void main(String[] args) {
        System.out.println("Java is Platform Independent!");
        System.out.println("Write Once, Run Anywhere (WORA).");
    }
}
// OUTPUT:
// Java is Platform Independent!
// Write Once, Run Anywhere (WORA).`
                                ]
                            },
                            {
                                content: `<h4>4. Secured</h4>
<img src="${securedImg}" alt="Secured" class="d-block mx-auto" style="height: 260px;"/>
<p>Java is well known for security. It makes it much harder to write code that damages memory or the system. Java is secure because of these points:</p>
<ul>
<li>There is no explicit pointer.</li>
<li>Java programs run inside a virtual machine sandbox.</li>
<li><strong>Classloader</strong> - loads Java classes into the JVM and keeps code from the local file system separate from code that came over the network.</li>
<li><strong>Bytecode Verifier</strong> - checks code for illegal operations that could break access rights to objects.</li>
<li><strong>Security Manager</strong> - decides what resources a class may use, such as the local disk. It is deprecated for removal since Java 17, so modern apps rely on containers and OS permissions instead.</li>
</ul>
<p>Java gives these protections by default. Developers can add more with SSL, JAAS, cryptography and similar tools.</p>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class SecureDemo {
    private String password = "1234";         // private data - no explicit pointer access

    public void login(String pass) {
        if (password.equals(pass))
            System.out.println("Login Successful!");
        else
            System.out.println("Access Denied!");
    }

    public static void main(String[] args) {
        SecureDemo obj = new SecureDemo();    // Object Create
        obj.login("1234"); // correct
        obj.login("9999"); // wrong
    }
}
// OUTPUT:
// Login Successful!
// Access Denied!`
                                ]
                            },
                            {
                                content: `<h4>5. Robust</h4>
<p>Robust means strong. Java is robust because of these points:</p>
<ul>
<li>It has strong memory management.</li>
<li>It has no pointer arithmetic, which avoids a whole class of memory bugs.</li>
<li>Automatic garbage collection removes objects the program no longer uses.</li>
<li>It has exception handling and type checking at compile time.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class RobustDemo {
    public static void main(String[] args) {
        try {
            int a = 10;
            int b = 0;
            int result = a / b;             // risky code (divide by zero)
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Error: Cannot divide by zero!");
        }

        System.out.println("Program continues safely...");
    }
}
// OUTPUT:
// Error: Cannot divide by zero!
// Program continues safely...`
                                ]
                            },
                            {
                                content: `<h4>6. Architecture-neutral</h4>
<ul>
<li>Java is architecture neutral because it has no implementation-dependent features. For example, the size of each primitive type is fixed.</li>
<li>C only guarantees that <code>int</code> is at least 16 bits. The real size depends on the compiler and CPU (2 bytes on old 16-bit compilers, 4 bytes on almost all modern ones).</li>
<li>In Java, <code>int</code> is always 4 bytes, on both 32-bit and 64-bit systems.</li>
</ul>`
                            },
                            {
                                content: `<h4>7. Portable</h4>
<ul>
<li>Java is portable because you can carry the same bytecode to any platform.</li>
<li>It needs no platform-specific changes to run, only a JVM.</li>
</ul>`
                            },
                            {
                                content: `<h4>8. High-performance</h4>
<ul>
<li>Java is faster than traditional interpreted languages because bytecode is close to native code and the JIT compiler turns hot code into machine code.</li>
<li>It can still be a little slower than fully compiled languages such as C or C++, mainly at startup.</li>
</ul>`
                            },
                            {
                                content: `<h4>9. Distributed</h4>
<ul>
<li>Java is distributed because it has built-in support for programs that run on many machines and talk over a network.</li>
<li>RMI (Remote Method Invocation) and EJB (Enterprise JavaBeans) are classic tools for this.</li>
<li>With them, a program can call methods on objects that live on another machine.</li>
</ul>`
                            },
                            {
                                content: `<h4>10. Multi-threaded</h4>
<ul>
<li>A thread is a small unit of work that runs at the same time as other threads. A Java program can do many tasks at once by using several threads.</li>
<li>Threads share one common memory area, so they use less memory than separate programs. Threads are important for multimedia, web applications and similar work.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class SimpleThreadDemo extends Thread {
    public void run() {
        System.out.println("Hello from thread: " + Thread.currentThread().getName());
    }

    public static void main(String[] args) {
        SimpleThreadDemo t = new SimpleThreadDemo();
        t.start(); // starts a new thread, runs concurrently with main
        System.out.println("Hello from: " + Thread.currentThread().getName());
    }
}
// OUTPUT (order of the two lines can vary because they run concurrently):
// Hello from: main
// Hello from thread: Thread-0`
                                ]
                            },
                            {
                                content: `<h4>11. Dynamic</h4>
<ul>
<li>Java loads classes on demand, when the program first needs them, not all at start.</li>
<li>It can call native C and C++ code through JNI (Java Native Interface).</li>
<li>The JIT compiler compiles hot code at run time, and the garbage collector manages memory automatically.</li>
</ul>`
                            },

                            {
                                content: `<h3>1. Definition</h3>
The features of Java, also called Java buzzwords, are the built in qualities of the language: simple, object oriented, platform independent, secure, robust, portable, multithreaded, distributed, dynamic and high performance. <br><br>

<h3>2. Purpose of this topic</h3>
<ul>
<li>To explain in one place why Java is chosen over C, C++ or older languages.</li>
<li>To connect each buzzword to a real language feature you can see in code.</li>
<li>To prepare for the most common first interview question: name the features of Java.</li>
</ul>

<h3>3. Need of this topic</h3>
<ul>
<li>A bank needs security and robustness, so it picks Java over C.</li>
<li>A team with Windows, Linux and Mac laptops needs platform independence.</li>
<li>An online exam portal serving many students at once needs multithreading.</li>
<li>Knowing the features helps you defend a technology choice in a design discussion.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: several Java features visible in one program

public class JavaFeaturesDemo {

    // FEATURE: Object Oriented - data and behaviour stay together
    static class SavingsAccount {
        private String holder;
        private double balance;

        SavingsAccount(String holder, double balance) {
            this.holder = holder;
            this.balance = balance;
        }

        void deposit(double amount) {
            this.balance = this.balance + amount;
        }

        double getBalance() {
            return balance;
        }

        String getHolder() {
            return holder;
        }
    }

    public static void main(String[] args) throws InterruptedException {

        // FEATURE: Simple - no pointers, no manual memory release
        SavingsAccount acc = new SavingsAccount("Rahul Verma", 10000);

        // FEATURE: Robust - the compiler stops wrong types before you run
        // WRONG: acc.deposit("five thousand");  // compile error, String is not double
        // RIGHT: acc.deposit(5000);

        // FEATURE: Multithreaded - two tasks run at the same time
        Thread interestThread = new Thread(() -> acc.deposit(400));
        interestThread.start();
        interestThread.join();

        System.out.println("Holder  : " + acc.getHolder());
        System.out.println("Balance : Rs " + acc.getBalance());

        // FEATURE: Platform Independent - this same .class file runs anywhere
        System.out.println("Running on: " + System.getProperty("os.name"));
    }
}
// OUTPUT:
// Holder  : Rahul Verma
// Balance : Rs 15400.0
// Running on: Windows 11`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
<ul>
<li><b>Write Once Run Anywhere:</b> one compiled file works on every operating system with a JVM.</li>
<li><b>Secure:</b> no pointer arithmetic, bytecode verification and a sandboxed runtime.</li>
<li><b>Robust:</b> strong type checking, exception handling and automatic garbage collection.</li>
<li><b>Multithreaded:</b> threads are part of the language, not an add on library.</li>
<li><b>Distributed:</b> built in networking and RMI make client server programs easy.</li>
</ul>

<h3>5. Disadvantages</h3>
<ul>
<li><b>Not fully object oriented:</b> the eight primitive types are not objects.</li>
<li><b>No operator overloading,</b> which makes maths heavy code longer to write.</li>
<li><b>No direct hardware access,</b> so device drivers cannot be written in pure Java.</li>
<li><b>Performance cost</b> of the JVM layer compared with C.</li>
<li><b>Garbage collection is not under your control,</b> you can only request it.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 4 and 5: what Java gives you and what it refuses to give you

public class FeatureLimitsDemo {

    public static void main(String[] args) {

        // ADVANTAGE: robust exception handling stops a crash
        int[] marks = {88, 74, 91};

        // WRONG: reading past the end crashes the program if not handled
        // System.out.println(marks[5]);

        // RIGHT: handle it and keep the portal running
        try {
            System.out.println("Fourth mark: " + marks[3]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Handled safely: no mark at index 3");
        }

        // DISADVANTAGE: not fully object oriented, int is a primitive not an object
        int rollNumber = 42;
        Integer boxedRoll = rollNumber;    // autoboxing gives an object wrapper
        String type = boxedRoll.getClass().getName();
        System.out.println("Primitive: " + rollNumber + ", Object: " + type);

        // DISADVANTAGE: no operator overloading
        // WRONG: Money total = money1 + money2;   // not allowed in Java
        // RIGHT: you must write a method
        double total = addRupees(1500.50, 2499.50);
        System.out.println("Total: Rs " + total);

        // DISADVANTAGE: you can only request garbage collection, not force it
        System.gc();
        System.out.println("Requested GC, the JVM decides when to actually run it");
    }

    static double addRupees(double a, double b) {
        return a + b;
    }
}
// OUTPUT:
// Handled safely: no mark at index 3
// Primitive: 42, Object: java.lang.Integer
// Total: Rs 4000.0
// Requested GC, the JVM decides when to actually run it`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
<ul>
<li><b>Platform independence:</b> a Java billing jar built on a developer Windows laptop runs unchanged on the Linux server of a Mumbai data centre.</li>
<li><b>Security:</b> internet banking servers of Indian banks rely on the JVM sandbox and bytecode verification.</li>
<li><b>Multithreading:</b> the IRCTC tatkal window serves thousands of simultaneous users using thread pools.</li>
<li><b>Robustness:</b> an insurance claim system keeps running because exceptions are caught instead of crashing.</li>
<li><b>Distributed:</b> Flipkart order, payment and inventory services talk to each other over the network.</li>
<li><b>Dynamic:</b> Spring Boot loads classes and creates beans at run time based on configuration.</li>
</ul>`,
                                codeExamples: [
                                    `// Point 6: multithreading feature used in a college exam portal

public class ExamPortalDemo {

    static class StudentSubmission implements Runnable {
        private final String studentName;

        StudentSubmission(String studentName) {
            this.studentName = studentName;
        }

        public void run() {
            String thread = Thread.currentThread().getName();
            System.out.println("Saving sheet of " + studentName + " on " + thread);
        }
    }

    public static void main(String[] args) throws InterruptedException {

        String[] students = {"Pooja", "Imran", "Sneha", "Vikram"};

        // WRONG: saving one after another makes the last student wait
        // for (String s : students) { new StudentSubmission(s).run(); }

        // RIGHT: each submission gets its own thread, all save together
        Thread[] threads = new Thread[students.length];
        for (int i = 0; i < students.length; i++) {
            threads[i] = new Thread(new StudentSubmission(students[i]), "worker-" + i);
            threads[i].start();
        }

        for (Thread t : threads) {
            t.join();
        }

        System.out.println("All answer sheets submitted");
    }
}
// OUTPUT (order of the first four lines can vary, that is normal):
// Saving sheet of Pooja on worker-0
// Saving sheet of Imran on worker-1
// Saving sheet of Sneha on worker-2
// Saving sheet of Vikram on worker-3
// All answer sheets submitted`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Objectives &amp; Features of Java</h3>
<h4>Primary Objectives of Java</h4>
<ul>
<li>A <strong>portable</strong> language (Write Once, Run Anywhere).</li>
<li>A <strong>simple</strong> language (easy to learn and use).</li>
<li>A <strong>secure</strong> language (safe from malicious code).</li>
</ul>
<h4>Additional Features</h4>
<p>Beyond these three objectives, the other buzzwords (architecture neutral, robust, interpreted, high performance, multithreaded, distributed, dynamic) explain why Java became so widely used.</p>`
                            },
                            {
                                content: `<h3>Java's Overall Execution Model - Source to Hardware</h3>
<p>Putting every stage together, from source code to hardware:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">          Java Source Code (.java)
                |
                | javac (compiler)
                v
          Java Bytecode (.class)
                |
                v
             ClassLoader
                |
                v
          Bytecode Verifier
                |
                v
               JVM
          +-----+-----+
          v           v
     Interpreter     JIT Compiler
          |           |
          +-----+-----+
                v
        Native Machine Code
                v
           Operating System
                v
             Hardware</pre>

<h4>Most Important Interview Point</h4>
<p>If asked <strong>"Why is Java platform independent?"</strong>, answer:</p>
<p><em>Java source code is compiled by javac into platform-independent bytecode. This bytecode runs on a platform-specific JVM, which executes it for the underlying operating system and hardware. So the same bytecode can run on different platforms that have a compatible JVM.</em></p>
<p><strong>Core concept to remember:</strong> Java is platform independent because of <strong>Bytecode + JVM</strong>.</p>`
                            },
                            {
                                content: `<h3>Platform Independent vs Architecture Neutral</h3>
<p>These two terms are often confused. They describe two different guarantees.</p>
<h4>Platform Independent</h4>
<p>The same bytecode runs on different operating systems, as long as a compatible JVM exists.</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Windows / Linux / macOS
        |
       JVM
        |
   Same Bytecode</pre>

<h4>Architecture Neutral</h4>
<p>Bytecode is not tied to any one CPU architecture, and primitive type sizes never change between architectures.</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">x86 / ARM / other CPU architectures
        |
       JVM
        |
     Bytecode</pre>

<p><strong>Important distinction:</strong> bytecode is platform independent, but the <strong>JVM itself</strong> is platform dependent. A separate JVM build exists for each OS and CPU.</p>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class ArchNeutralDemo {
    public static void main(String[] args) {
        System.out.println("int size (bytes): " + Integer.BYTES);
        System.out.println("long size (bytes): " + Long.BYTES);
        // These sizes are the same on every OS/CPU that runs this bytecode.
    }
}
// OUTPUT:
// int size (bytes): 4
// long size (bytes): 8`
                                ]
                            },
                            {
                                content: `<h3>High Performance: Interpreter + JIT</h3>
<ul>
<li>The JVM starts by <strong>interpreting</strong> bytecode line by line, which is flexible but relatively slow.</li>
<li>The <strong>JIT (Just-In-Time) Compiler</strong> watches for "hot" code (methods executed frequently) and compiles that bytecode directly into native machine code at runtime, caching the result.</li>
<li>Subsequent calls to hot code run at near-native speed, which is why Java is faster than purely interpreted languages, while still not quite matching a fully compiled language like C/C++.</li>
</ul>`
                            },
                            {
                                content: `<h3>Multithreading Internals</h3>
<ul>
<li>Java runs many tasks at the same time using lightweight units called <strong>threads</strong>.</li>
<li>Threads of one process share the heap, but each thread has its own stack and program counter.</li>
<li>Two common ways to create a thread: extend <code>Thread</code>, or implement <code>Runnable</code>. <code>Runnable</code> is preferred because a class can extend only one class.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

class MyThread extends Thread {
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(Thread.currentThread().getName() + " : " + i);
        }
    }
}

public class MultiThreadDemo {
    public static void main(String[] args) {
        MyThread t1 = new MyThread();
        MyThread t2 = new MyThread();
        t1.start(); // runs concurrently
        t2.start(); // runs concurrently
    }
}
// OUTPUT (the interleaving of Thread-0 and Thread-1 can vary):
// Thread-0 : 1
// Thread-1 : 1
// Thread-0 : 2
// Thread-1 : 2
// Thread-0 : 3
// Thread-1 : 3`,
                                    `package com.javaschoollab.demo;

public class RunnableDemo implements Runnable {
    public void run() {
        System.out.println("Running via Runnable in: " + Thread.currentThread().getName());
    }

    public static void main(String[] args) {
        Thread t = new Thread(new RunnableDemo());
        t.start();
    }
}
// OUTPUT:
// Running via Runnable in: Thread-0`
                                ]
                            },
                            {
                                content: `<h3>Distributed Computing Support</h3>
<ul>
<li>Java has APIs to share data and resources across machines.</li>
<li>Tools include <strong>RMI</strong> (Remote Method Invocation), sockets and web services (CORBA was removed in Java 11).</li>
<li>Example: banking servers that talk to each other in real time.</li>
</ul>`,
                                codeExamples: [
                                    `// Server Side Code
import java.io.*;
import java.net.*;

public class Server {
    public static void main(String[] args) throws IOException {
        ServerSocket ss = new ServerSocket(5000);
        Socket s = ss.accept();
        DataInputStream dis = new DataInputStream(s.getInputStream());
        String msg = dis.readUTF();
        System.out.println("Client says: " + msg);
        ss.close();
    }
}
// OUTPUT (after the client connects):
// Client says: Hello from Client!`,
                                    `// Client Side Code
import java.io.*;
import java.net.*;

public class Client {
    public static void main(String[] args) throws IOException {
        Socket s = new Socket("localhost", 5000);
        DataOutputStream dos = new DataOutputStream(s.getOutputStream());
        dos.writeUTF("Hello from Client!");
        s.close();
    }
}
// OUTPUT (run Server first, then Client; the client prints nothing):
// (no output)`
                                ]
                            },
                            {
                                content: `<h3>Dynamic: Runtime Class Loading & Dynamic Dispatch</h3>
<ul>
<li>Classes are loaded at run time, so not everything is fixed at compile time.</li>
<li><strong>Dynamic method dispatch</strong> (runtime polymorphism): the JVM picks the overridden method from the actual object type, not the reference type.</li>
<li>Libraries (JAR files) can be linked and loaded at run time.</li>
<li>Example: JDBC drivers load at run time for the database you connect to.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

class Animal {
    void sound() { System.out.println("Animal makes sound"); }
}
class Dog extends Animal {
    void sound() { System.out.println("Dog barks"); }
}
class Cat extends Animal {
    void sound() { System.out.println("Cat meows"); }
}

public class DynamicDemo {
    public static void main(String[] args) {
        Animal a;
        a = new Dog();     // object of Dog
        a.sound();         // Dog's version runs - decided at runtime
        a = new Cat();     // object of Cat
        a.sound();         // Cat's version runs - decided at runtime
    }
}
// OUTPUT:
// Dog barks
// Cat meows`
                                ]
                            },
                            {
                                content: `<h3>Robustness in Depth: Strong Typing, No Pointers, Exception Handling, GC</h3>
<p>Java is <strong>statically typed</strong>: every variable has a declared type, and the compiler checks types before the program runs. Section "Type Safety &amp; Generics" below covers generics.</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">int age = 30;
String name = "Pankaj";
double salary = 50000.50;

// int age = "Thirty";   // Compile-time error: type mismatch</pre>

<h4>No Explicit Pointer Arithmetic</h4>
<p>Java has <strong>references</strong>, but you cannot read or change memory addresses as in C/C++:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">C/C++:   Pointer   -&gt; Memory Address
Java:    Reference -&gt; Object

Employee emp = new Employee();   // emp is a reference, not an incrementable pointer</pre>

<p>This removes a whole category of memory-corruption bugs.</p>
<h4>Exception Handling</h4>
<p>Java has a built-in way to handle run-time errors instead of letting the program crash. Keywords: <code>try</code>, <code>catch</code>, <code>finally</code>, <code>throw</code>, <code>throws</code>.</p>
<ul>
<li><strong>Checked exceptions</strong> - checked at compile time, the compiler forces you to handle or declare them (e.g. <code>IOException</code>, <code>SQLException</code>).</li>
<li><strong>Unchecked exceptions</strong> - subclasses of <code>RuntimeException</code>, detected only at runtime (e.g. <code>NullPointerException</code>, <code>ArithmeticException</code>).</li>
</ul>

<h4>Automatic Memory Management</h4>
<p>The JVM manages memory and divides it into separate areas:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">JVM Memory
|
|-- Heap        -&gt; Objects (managed by the Garbage Collector)
|-- Stack       -&gt; Method calls / local variables
|-- Metaspace   -&gt; Class metadata
|-- Other JVM areas</pre>
<p>Java offers several garbage collectors that trade throughput against pause time: <strong>G1</strong> (default), <strong>ZGC</strong>, <strong>Shenandoah</strong>, <strong>Serial</strong> and <strong>Parallel</strong>.</p>`,
                                codeExamples: [
                                    `package com.javaschoollab;

public class ExceptionDemo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Exception occurred: " + e.getMessage());
        } finally {
            System.out.println("Execution completed");
        }
    }
}
// OUTPUT:
// Exception occurred: / by zero
// Execution completed`,
                                    `public class GCDemo {
    public static void main(String[] args) {
        String name = new String("Java");
        name = null;           // the old object is no longer referenced
        // The garbage collector can now remove it automatically
        System.gc();           // only a request, the JVM may delay it
        System.out.println("Requested garbage collection");
    }
}
// OUTPUT:
// Requested garbage collection`
                                ]
                            },
                            {
                                content: `<h3>Rich Standard Library & Modern Concurrency API</h3>
<p>Java ships with a large, well-tested standard library, so common tasks rarely need outside dependencies.</p>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Package</th>
<th>Purpose</th>
</tr>
<tr class='text-center'><td>java.lang</td><td>Core language classes</td></tr>
<tr class='text-center'><td>java.util</td><td>Collections, utilities</td></tr>
<tr class='text-center'><td>java.io</td><td>Input/output</td></tr>
<tr class='text-center'><td>java.nio</td><td>Modern I/O</td></tr>
<tr class='text-center'><td>java.net</td><td>Networking</td></tr>
<tr class='text-center'><td>java.sql</td><td>JDBC/database</td></tr>
<tr class='text-center'><td>java.time</td><td>Date and time</td></tr>
<tr class='text-center'><td>java.math</td><td>Mathematical operations</td></tr>
<tr class='text-center'><td>java.util.concurrent</td><td>Concurrency utilities</td></tr>
</table>
<p>For concurrency, modern Java goes beyond creating <code>Thread</code> objects by hand. It offers <code>ExecutorService</code>, <code>CompletableFuture</code>, <code>Semaphore</code>, <code>CountDownLatch</code>, <code>AtomicInteger</code> and <strong>virtual threads</strong> (Project Loom, Java 21+).</p>`,
                                codeExamples: [
                                    `import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ConcurrencyDemo {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(5);

        executor.submit(() -> {
            System.out.println("Task by: " + Thread.currentThread().getName());
        });

        executor.shutdown();   // stop accepting tasks, finish the queued ones
    }
}
// OUTPUT:
// Task by: pool-1-thread-1`,
                                    `// Java 21+ Virtual Threads
public class VirtualThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        Thread.startVirtualThread(() -> {
            System.out.println("Running task on a lightweight virtual thread");
        }).join();
    }
}
// OUTPUT:
// Running task on a lightweight virtual thread`
                                ]
                            },
                            {
                                content: `<h3>Type Safety & Generics</h3>
<p><strong>Generics</strong> (<code>&lt;T&gt;</code>, <code>&lt;E&gt;</code>, <code>&lt;K, V&gt;</code>) extend static typing to collections and reusable code. A class or method can work with any type while the compiler still checks types. This removes manual casts and most <code>ClassCastException</code> errors.</p>
<ul>
<li><strong>Bounded types</strong> - <code>&lt;T extends Number&gt;</code> restricts <code>T</code> to <code>Number</code> and its subclasses.</li>
<li><strong>Wildcards</strong> - <code>&lt;?&gt;</code>, <code>&lt;? extends T&gt;</code>, <code>&lt;? super T&gt;</code> allow flexible method parameters.</li>
<li><strong>Type erasure</strong> - generic type information exists only at compile time; it is erased at runtime (kept for backward compatibility).</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

class Box<T> {
    private T value;
    Box(T value) { this.value = value; }
    T getValue() { return value; }
}

class Calculator<T extends Number> {          // bounded type
    double add(T a, T b) { return a.doubleValue() + b.doubleValue(); }
}

public class GenericsDemo {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<>("Java");
        Box<Integer> intBox = new Box<>(100);
        System.out.println(stringBox.getValue());
        System.out.println(intBox.getValue());

        Calculator<Double> calc = new Calculator<>();
        System.out.println("Sum: " + calc.add(10.5, 20.3));

        // int result = "Thirty";   // COMPILE ERROR: incompatible types
    }
}
// OUTPUT:
// Java
// 100
// Sum: 30.8`
                                ]
                            },
                            {
                                content: `<h3>Enum Support</h3>
<p>A Java <code>enum</code> is a fixed group of type-safe constants. Unlike enums in many languages, Java enums are <strong>full classes</strong>. They can have fields, constructors and methods, and can implement interfaces.</p>
<ul>
<li>Blocks invalid values at compile time (only the declared constants are legal).</li>
<li>Works cleanly in a <code>switch</code>.</li>
<li>Built-in methods: <code>values()</code>, <code>valueOf()</code>, <code>name()</code>, <code>ordinal()</code>.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

enum Priority {
    HIGH(1, "Critical Task"),
    MEDIUM(2, "Normal Task"),
    LOW(3, "Optional Task");

    private final int level;
    private final String description;

    Priority(int level, String description) {
        this.level = level;
        this.description = description;
    }

    public int getLevel() { return level; }
    public String getDescription() { return description; }
}

public class EnumDemo {
    public static void main(String[] args) {
        Priority task = Priority.HIGH;
        switch (task) {
            case HIGH -> System.out.println("Urgent: " + task.getDescription());
            case MEDIUM -> System.out.println("Normal: " + task.getDescription());
            case LOW -> System.out.println("Low: " + task.getDescription());
        }

        for (Priority p : Priority.values()) {
            System.out.println(p.name() + " [Level: " + p.getLevel() + "]");
        }
    }
}
// OUTPUT:
// Urgent: Critical Task
// HIGH [Level: 1]
// MEDIUM [Level: 2]
// LOW [Level: 3]`
                                ]
                            },
                            {
                                content: `<h3>Annotations & the Reflection API</h3>
<p><strong>Annotations</strong> (<code>@Override</code>, <code>@Deprecated</code>, <code>@FunctionalInterface</code> and custom ones) attach metadata to code. The compiler reads some of them. Frameworks such as Spring (<code>@Autowired</code>) and JPA (<code>@Entity</code>) read others at run time through <strong>reflection</strong>.</p>
<p><strong>Reflection</strong> lets code inspect classes, methods and fields <em>at run time</em>. It can create objects without <code>new</code> and even reach private members. It powers Spring dependency injection, Hibernate mapping and JUnit test discovery.</p>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.lang.annotation.*;
import java.lang.reflect.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Author {
    String name();
}

class MyClass {
    @Author(name = "Pankaj")
    public void newMethod() {
        System.out.println("This is the new method!");
    }
}

public class AnnotationDemo {
    public static void main(String[] args) throws Exception {
        Method method = MyClass.class.getMethod("newMethod");
        if (method.isAnnotationPresent(Author.class)) {
            Author author = method.getAnnotation(Author.class);
            System.out.println("Author: " + author.name());
        }
    }
}
// OUTPUT:
// Author: Pankaj`,
                                    `package com.javaschoollab.demo;

import java.lang.reflect.*;

class Employee {
    private String name = "Pankaj";
    private void secretMethod() {
        System.out.println("This is a private method!");
    }
}

public class ReflectionDemo {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = Employee.class;
        Employee emp = new Employee();

        // Access a private field
        Field nameField = clazz.getDeclaredField("name");
        nameField.setAccessible(true);
        System.out.println("Private name: " + nameField.get(emp));

        // Invoke a private method
        Method secret = clazz.getDeclaredMethod("secretMethod");
        secret.setAccessible(true);
        secret.invoke(emp);
    }
}
// OUTPUT:
// Private name: Pankaj
// This is a private method!`
                                ]
                            },
                            {
                                content: `<h3>Functional Programming (Java 8+)</h3>
<p>Since Java 8, Java supports functional programming alongside OOP, so it is a <strong>multi-paradigm</strong> language.</p>
<ul>
<li><strong>Lambda expressions</strong> - concise anonymous functions: <code>(a, b) -&gt; a + b</code>.</li>
<li><strong>Functional interfaces</strong> - an interface with exactly one abstract method (<code>@FunctionalInterface</code>).</li>
<li><strong>Method references</strong> - a shorthand for a lambda: <code>String::toUpperCase</code>.</li>
<li><strong>Stream API</strong> - declarative data processing: <code>filter</code>, <code>map</code>, <code>reduce</code>, <code>collect</code>.</li>
<li><code>Predicate</code>, <code>Function</code>, <code>Consumer</code>, <code>Supplier</code> - the built-in functional interfaces in <code>java.util.function</code>.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.util.*;
import java.util.function.*;

public class FunctionalDemo {
    public static void main(String[] args) {
        // Lambda + functional interface
        Predicate<Integer> isEven = n -> n % 2 == 0;
        System.out.println("10 is even? " + isEven.test(10));

        // Method reference + Stream pipeline
        List<String> names = Arrays.asList("pankaj", "amit", "rahul");
        names.stream()
             .map(String::toUpperCase)
             .forEach(System.out::println);

        // Stream: filter -> map -> reduce
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);
        int sumOfEvenSquares = numbers.stream()
             .filter(isEven)
             .map(n -> n * n)
             .reduce(0, Integer::sum);
        System.out.println("Sum of even squares: " + sumOfEvenSquares);
    }
}
// OUTPUT:
// 10 is even? true
// PANKAJ
// AMIT
// RAHUL
// Sum of even squares: 56`
                                ]
                            },
                            {
                                content: `<h3>Module System - JPMS (Java 9+)</h3>
<p>Java 9 introduced the <strong>Java Platform Module System (JPMS)</strong>. It organizes code into modules for stronger encapsulation and a smaller runtime.</p>
<ul>
<li><code>module-info.java</code> - a descriptor that names the module and lists what it exports and requires.</li>
<li><strong>Strong encapsulation</strong> - only packages listed in <code>exports</code> are visible to other modules. Everything else is hidden, even from reflection, unless the package is <code>opens</code>-ed.</li>
<li><strong>Reliable configuration</strong> - dependencies are declared up front, not guessed from the classpath.</li>
<li><code>jlink</code> builds a small custom runtime with only the modules the application needs.</li>
</ul>`,
                                codeExamples: [
                                    `// File: module-info.java
module com.code.app {
    requires java.sql;            // for JDBC
    requires java.net.http;       // for HTTP Client
    exports com.code.app.service; // expose this package
    opens com.code.app.model;     // allow reflection (Spring/Hibernate)
}`
                                ]
                            },
                            {
                                content: `<h3>Immutability Support</h3>
<p>An <strong>immutable</strong> object cannot change after it is created. This makes it thread-safe, easy to cache and safe as a <code>Map</code> key. Java gives several ways to build one:</p>
<ul>
<li><code>String</code> is immutable by design. Every "change" creates a new object.</li>
<li><code>final</code> fields plus defensive copies of any mutable input give a hand-written immutable class.</li>
<li><strong>Unmodifiable collections</strong> (Java 9+) - <code>List.of()</code>, <code>Set.of()</code> and <code>Map.of()</code> throw <code>UnsupportedOperationException</code> on any change.</li>
<li><strong>Records</strong> (Java 16+) - a one-line immutable data carrier. The compiler generates the constructor, accessors, <code>equals()</code>, <code>hashCode()</code> and <code>toString()</code>.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.util.List;

record Employee(String name, String department, double salary) {}

public class ImmutabilityDemo {
    public static void main(String[] args) {
        Employee emp = new Employee("Amit", "IT", 75000);
        System.out.println(emp);                   // auto toString()
        System.out.println("Name: " + emp.name()); // auto accessor

        List<String> immutableList = List.of("A", "B", "C");
        System.out.println("Immutable List: " + immutableList);
        // immutableList.add("D"); // throws UnsupportedOperationException
    }
}
// OUTPUT:
// Employee[name=Amit, department=IT, salary=75000.0]
// Name: Amit
// Immutable List: [A, B, C]`
                                ]
                            },
                            {
                                content: `<h3>Concurrency Beyond Basic Threads</h3>
<p>The <code>java.util.concurrent</code> package gives tools beyond plain <code>Thread</code> objects:</p>
<ul>
<li><code>ConcurrentHashMap</code> - a thread-safe <code>Map</code> that locks only small parts of the map, unlike <code>Collections.synchronizedMap()</code>, which locks the whole map.</li>
<li><code>ReentrantLock</code> and <code>ReadWriteLock</code> - more flexible than <code>synchronized</code> (try-lock, timeouts, fairness).</li>
<li><strong>Parallel streams</strong> - calling <code>.parallel()</code> splits the work across the common <code>ForkJoinPool</code>.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.util.concurrent.*;
import java.util.stream.*;

public class ConcurrencyExtrasDemo {
    public static void main(String[] args) {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        map.put("Active", 100);
        map.merge("Active", 50, Integer::sum);   // atomic update
        System.out.println("Active: " + map.get("Active"));

        long sum = LongStream.rangeClosed(1, 1_000_000)
                .parallel()
                .sum();
        System.out.println("Parallel sum (1 to 1M): " + sum);
    }
}
// OUTPUT:
// Active: 150
// Parallel sum (1 to 1M): 500000500000`
                                ]
                            },
                            {
                                content: `<h3>Sealed Classes (Java 17+)</h3>
<p>A <code>sealed</code> class or interface limits which classes may extend or implement it. This gives <strong>controlled inheritance</strong>.</p>
<ul>
<li><code>permits</code> lists exactly which classes may extend the sealed type.</li>
<li>Each permitted subclass must be <code>final</code>, <code>sealed</code> or <code>non-sealed</code>. (Records and enums are implicitly final.)</li>
<li>Common use: domain models and state machines, where the compiler checks that a <code>switch</code> covers every case.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

sealed abstract class Shape permits Circle, Rectangle {
    abstract double area();
}

final class Circle extends Shape {
    private final double radius;
    Circle(double radius) { this.radius = radius; }
    double area() { return Math.PI * radius * radius; }
}

final class Rectangle extends Shape {
    private final double width, height;
    Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    double area() { return width * height; }
}

public class SealedClassDemo {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle(5), new Rectangle(4, 6) };
        for (Shape s : shapes) {
            System.out.printf("Area: %.2f%n", s.area());
        }
    }
}
// OUTPUT:
// Area: 78.54
// Area: 24.00`
                                ]
                            },
                            {
                                content: `<h3>Pattern Matching (Java 16-21+)</h3>
<p>Pattern matching removes the old "check the type, then cast" boilerplate.</p>
<ul>
<li><strong>instanceof pattern matching</strong> (Java 16+) - <code>if (obj instanceof String s)</code> binds <code>s</code> directly, no separate cast needed.</li>
<li><strong>Switch pattern matching</strong> (Java 21+) - <code>case String s -&gt;</code> matches types directly inside a <code>switch</code> expression, with optional <code>when</code> guards.</li>
<li><strong>Record patterns</strong> (Java 21+) - a <code>switch</code>/<code>instanceof</code> can deconstruct a record's components in one step: <code>case Point(int x, int y) -&gt;</code>.</li>
</ul>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

record Point(int x, int y) {}

public class PatternMatchingDemo {
    static String describe(Object obj) {
        return switch (obj) {
            case String s when s.length() > 5 -> "Long string: " + s;
            case String s -> "Short string: " + s;
            case Integer i -> "Integer: " + i;
            case Point(int x, int y) -> "Point(" + x + ", " + y + ")";
            case null -> "null value";
            default -> "Other: " + obj;
        };
    }

    public static void main(String[] args) {
        System.out.println(describe("Hi"));
        System.out.println(describe("Hello World"));
        System.out.println(describe(new Point(10, 20)));
    }
}
// OUTPUT:
// Short string: Hi
// Long string: Hello World
// Point(10, 20)`
                                ]
                            },
                            {
                                content: `<h3>Text Blocks (Java 15+)</h3>
<p>Text blocks use triple double quotes (<code>"""</code>) for clean multi-line strings such as JSON, SQL or HTML, without many <code>\\n</code> and <code>\\"</code> escapes. Common leading indentation is removed automatically, and <code>.formatted(...)</code> can be chained onto a text block.</p>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class TextBlockDemo {
    public static void main(String[] args) {
        String json = """
            {
              "name": "Pankaj",
              "age": 25
            }
            """;
        System.out.println(json);

        String template = """
            Name: %s
            Language: %s
            """.formatted("Pankaj", "Java");
        System.out.println(template);
    }
}
// OUTPUT:
// {
//   "name": "Pankaj",
//   "age": 25
// }
//
// Name: Pankaj
// Language: Java`
                                ]
                            },
                            {
                                content: `<h3>Java, Version by Version</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Version</th><th>Key Additions</th></tr>
<tr class='text-center'><td>Java 5 (2004)</td><td>Generics, Annotations, Enum, Autoboxing, For-each, Varargs</td></tr>
<tr class='text-center'><td>Java 7 (2011)</td><td>try-with-resources, Diamond operator, Multi-catch, Fork/Join</td></tr>
<tr class='text-center'><td>Java 8 (2014)</td><td>Lambdas, Stream API, Functional Interfaces, Optional, Date/Time API</td></tr>
<tr class='text-center'><td>Java 9 (2017)</td><td>Module System (JPMS), JShell, List.of()/Set.of()/Map.of()</td></tr>
<tr class='text-center'><td>Java 10 (2018)</td><td>var - local variable type inference</td></tr>
<tr class='text-center'><td>Java 11 (2018) LTS</td><td>HTTP Client API, new String methods (isBlank, strip, lines, repeat)</td></tr>
<tr class='text-center'><td>Java 16 (2021)</td><td>Records (final), Pattern Matching for instanceof (final)</td></tr>
<tr class='text-center'><td>Java 17 (2021) LTS</td><td>Sealed Classes (final)</td></tr>
<tr class='text-center'><td>Java 21 (2023) LTS</td><td>Virtual Threads, Pattern Matching for switch, Record Patterns, Sequenced Collections</td></tr>
</table>`
                            },
                            {
                                content: `<h3>Java Feature Summary</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Feature</th><th>Meaning</th></tr>
<tr class='text-center'><td>Simple</td><td>Easier syntax and fewer complex language features</td></tr>
<tr class='text-center'><td>Object-Oriented</td><td>Based around classes and objects</td></tr>
<tr class='text-center'><td>Platform Independent</td><td>Same bytecode can run on different platforms</td></tr>
<tr class='text-center'><td>Portable</td><td>Consistent behaviour across platforms</td></tr>
<tr class='text-center'><td>Secure</td><td>JVM, bytecode verification, access control</td></tr>
<tr class='text-center'><td>Robust</td><td>Strong typing, exceptions, GC, runtime checks</td></tr>
<tr class='text-center'><td>Architecture Neutral</td><td>Bytecode isn't CPU-specific, fixed primitive sizes</td></tr>
<tr class='text-center'><td>High Performance</td><td>JIT and JVM optimizations</td></tr>
<tr class='text-center'><td>Multithreaded</td><td>Built-in concurrency support</td></tr>
<tr class='text-center'><td>Distributed</td><td>Networking and distributed application support</td></tr>
<tr class='text-center'><td>Dynamic</td><td>Runtime class loading and reflection</td></tr>
<tr class='text-center'><td>Compiled + Interpreted</td><td>Source -&gt; bytecode -&gt; interpreted/JIT-compiled</td></tr>
<tr class='text-center'><td>Automatic GC</td><td>JVM automatically manages object memory</td></tr>
<tr class='text-center'><td>Rich API</td><td>Extensive standard libraries</td></tr>
</table>
<br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is Java platform independent?</td><td>Source code is compiled to bytecode by javac; a platform-specific JVM executes that same bytecode on any OS/hardware</td></tr>
<tr class='text-center'><td>Is the JVM itself platform independent?</td><td>No - a separate JVM build exists per OS/architecture; only the bytecode it runs is platform independent</td></tr>
<tr class='text-center'><td>How does Java achieve high performance despite being "interpreted"?</td><td>The JIT compiler converts frequently executed ("hot") bytecode into native machine code at runtime</td></tr>
<tr class='text-center'><td>What makes Java secure?</td><td>No explicit pointers, bytecode verification, classloader isolation, and a configurable Security Manager</td></tr>
<tr class='text-center'><td>What makes Java robust?</td><td>Strong static typing, no pointer arithmetic, automatic garbage collection, and mandatory exception handling for checked exceptions</td></tr>
<tr class='text-center'><td>Difference between platform independent and architecture neutral?</td><td>Platform independent = same bytecode runs on any OS via a JVM; architecture neutral = primitive type sizes never change across CPU architectures</td></tr>
<tr class='text-center'><td>How does Java support multithreading?</td><td>Via the Thread class and Runnable interface - threads share heap memory but have independent stacks, scheduled by the JVM and the OS</td></tr>
<tr class='text-center'><td>What are Java Buzzwords?</td><td>The common name for Java's feature list - Simple, Object-Oriented, Portable, Platform Independent, Secure, Robust, Architecture Neutral, Interpreted, High Performance, Multithreaded, Distributed, Dynamic</td></tr>
<tr class='text-center'><td>Is Java 100% object-oriented?</td><td>No - it has 8 primitive types (int, char, boolean, etc.) that are not objects; wrapper classes let them be treated as objects via autoboxing</td></tr>
<tr class='text-center'><td>What is the JPMS / module system?</td><td>Java 9's Java Platform Module System - organizes code into modules declared via module-info.java, giving strong encapsulation (only exported packages are visible) and smaller custom runtimes via jlink</td></tr>
<tr class='text-center'><td>How do generics achieve type safety?</td><td>The compiler checks type parameters (&lt;T&gt;) at compile time, rejecting mismatched types before the program runs; the type info is then erased at runtime (type erasure) for backward compatibility</td></tr>
<tr class='text-center'><td>What are Virtual Threads (Java 21)?</td><td>Lightweight threads managed by the JVM rather than mapped 1:1 to OS threads - millions can run concurrently, ideal for I/O-bound work, created via Thread.startVirtualThread(...)</td></tr>
<tr class='text-center'><td>How do Records achieve immutability?</td><td>A record's fields are implicitly final and the compiler auto-generates the constructor, accessors, equals(), hashCode() and toString() - no field can be reassigned after construction</td></tr>
</table>`
                            },

                            {
                                content: `<h3>1. Definition</h3>
At an advanced level the Java feature set is a set of contracts enforced by the compiler and the JVM: static typing with erasure based generics, a specified memory model for threads, a verified bytecode format, and a managed heap with pluggable collectors. Modern releases add records, sealed types, pattern matching and virtual threads. <br><br>

<h3>2. Purpose of this topic</h3>
<ul>
<li>To move from listing buzzwords to explaining the mechanism behind each one.</li>
<li>To use the right feature for the right non functional requirement: throughput, latency or safety.</li>
<li>To answer design round questions about concurrency and immutability correctly.</li>
</ul>

<h3>3. Need of this topic</h3>
<ul>
<li>A payment service that ignores the Java Memory Model will produce stale reads under load.</li>
<li>Choosing virtual threads over a fixed pool changes the capacity of an IO bound service by orders of magnitude.</li>
<li>Sealed interfaces plus pattern matching let you model a domain so the compiler catches missing cases.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level:
// modern Java features modelling a payment result exhaustively

public class ModernFeatureDemo {

    // FEATURE: sealed interface - only the listed types can implement it
    sealed interface PaymentResult permits Success, Declined, Pending {}

    // FEATURE: records - immutable data carriers, fields are implicitly final
    record Success(String utr, double amountInRupees) implements PaymentResult {}
    record Declined(String reasonCode) implements PaymentResult {}
    record Pending(String bankRef) implements PaymentResult {}

    static String describe(PaymentResult result) {
        // WRONG in old Java: a chain of instanceof plus casts, and nothing
        // tells you when a new result type is added.
        // if (result instanceof Success) { Success s = (Success) result; ... }

        // RIGHT: pattern matching on a sealed type is checked for exhaustiveness
        return switch (result) {
            case Success s   -> "Paid Rs " + s.amountInRupees() + " UTR " + s.utr();
            case Declined d  -> "Declined with code " + d.reasonCode();
            case Pending p   -> "Pending at bank ref " + p.bankRef();
        };
    }

    public static void main(String[] args) {
        System.out.println(describe(new Success("UTR2026090512", 4999.00)));
        System.out.println(describe(new Declined("INSUFFICIENT_FUNDS")));
        System.out.println(describe(new Pending("HDFC-88231")));
    }
}
// OUTPUT:
// Paid Rs 4999.0 UTR UTR2026090512
// Declined with code INSUFFICIENT_FUNDS
// Pending at bank ref HDFC-88231`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
<ul>
<li><b>Specified memory model:</b> volatile, final field semantics and happens before rules make concurrent code reasonable.</li>
<li><b>Virtual threads (Java 21):</b> millions of concurrent IO bound tasks without a thread per request pool.</li>
<li><b>Records and sealed types</b> give compiler checked immutability and exhaustive switches.</li>
<li><b>Escape analysis and inlining</b> let the JIT remove allocations the source code seems to make.</li>
<li><b>JFR and the module system</b> give low overhead observability and strong encapsulation.</li>
</ul>

<h3>5. Disadvantages</h3>
<ul>
<li><b>Type erasure</b> means you cannot create a generic array or check a generic type at run time.</li>
<li><b>Checked exceptions</b> leak implementation details and fight with lambdas and streams.</li>
<li><b>Autoboxing</b> hides allocation and equality traps in hot loops.</li>
<li><b>Virtual threads pin</b> on synchronized blocks and native calls, so old code needs review.</li>
<li><b>The Java Memory Model is subtle,</b> and wrong assumptions cause bugs that only show under load.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: erasure, boxing traps and visibility

import java.util.ArrayList;
import java.util.List;

public class FeaturePitfallsDemo {

    // WRONG: a plain boolean flag may never become visible to the worker
    // private static boolean running = true;
    private static volatile boolean runningSafe = true;   // RIGHT

    public static void main(String[] args) throws Exception {

        // DISADVANTAGE: type erasure. Both lists have the same runtime class.
        List<String> names = new ArrayList<>();
        List<Integer> ids = new ArrayList<>();
        boolean same = names.getClass() == ids.getClass();
        System.out.println("Erasure, same class at runtime: " + same);

        // WRONG: generic arrays are not allowed because of erasure
        // List<String>[] buckets = new List<String>[10];   // compile error
        // RIGHT: use a list of lists
        List<List<String>> buckets = new ArrayList<>();
        buckets.add(names);
        System.out.println("Buckets: " + buckets.size());

        // DISADVANTAGE: autoboxing equality trap with the Integer cache
        Integer smallA = 127, smallB = 127;      // cached, same object
        Integer bigA = 128, bigB = 128;          // outside the cache
        System.out.println("127 == 127 : " + (smallA == smallB));   // true, misleading
        System.out.println("128 == 128 : " + (bigA == bigB));       // false
        // RIGHT: always compare wrappers with equals
        System.out.println("equals     : " + bigA.equals(bigB));

        // ADVANTAGE plus pitfall: visibility between threads
        Thread worker = new Thread(() -> {
            while (runningSafe) {
                // volatile makes the write below visible here
            }
            System.out.println("Worker stopped correctly");
        });
        worker.start();
        Thread.sleep(50);
        runningSafe = false;
        worker.join();
    }
}
// OUTPUT:
// Erasure, same class at runtime: true
// Buckets: 1
// 127 == 127 : true
// 128 == 128 : false
// equals     : true
// Worker stopped correctly`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
<ul>
<li><b>Virtual threads:</b> an Indian fintech gateway replaced a 400 thread pool with virtual threads and handled ten times the concurrent UPI callbacks on the same pod.</li>
<li><b>Records:</b> API response DTOs in Spring Boot services are now records, removing hundreds of lines of boilerplate.</li>
<li><b>Sealed types:</b> order state machines in e commerce modelled so a new state cannot be forgotten.</li>
<li><b>Memory model:</b> a stock trading feed using volatile and atomic classes to publish prices safely.</li>
<li><b>JFR:</b> production profiling of a core banking batch job to find a GC pause during end of day settlement.</li>
</ul>

<b>Interview tip:</b> when asked to name Java features, do not stop at the buzzword list. Give one buzzword and one mechanism, for example "portable because javac targets bytecode, not a CPU".`,
                                codeExamples: [
                                    `// Point 6 at expert level: virtual threads handling bank callbacks

import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class VirtualThreadCallbackService {

    private static final AtomicInteger PROCESSED = new AtomicInteger();

    private static void handleCallback(int txnId) {
        try {
            // simulates a slow call to a bank API, this is IO bound work
            Thread.sleep(Duration.ofMillis(20));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return;
        }
        PROCESSED.incrementAndGet();
    }

    public static void main(String[] args) throws Exception {

        // WRONG for IO bound work: a small fixed pool blocks and queues up
        // ExecutorService pool = Executors.newFixedThreadPool(20);

        // RIGHT: one virtual thread per task, cheap to create, parks on IO
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10000; i++) {
                final int txnId = i;
                pool.submit(() -> handleCallback(txnId));
            }
        } // close() waits for every task to finish

        System.out.println("Callbacks processed: " + PROCESSED.get());
    }
}
// OUTPUT:
// Callbacks processed: 10000`
                                ]
                            }
                        ]

};
