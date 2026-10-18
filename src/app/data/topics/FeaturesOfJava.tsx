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
<li>Java is very easy to learn, and its syntax is <strong>simple, clean and easy to understand</strong>.</li>
<li>Java syntax is based on C++ (so it is easier for programmers to learn it after C++).</li>
<li>Java removed many complicated and rarely-used features, for example, <strong>explicit pointers</strong> and <strong>operator overloading</strong>.</li>
<li>There is no need to remove unreferenced objects manually because Java has <strong>Automatic Garbage Collection</strong>.</li>
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
<li>Almost everything in Java is a <strong>class or an object</strong>. The eight primitive types (<code>int</code>, <code>char</code>, <code>boolean</code> and so on) are the exception, so Java is <strong>not 100% object-oriented</strong>.</li>
<li>Object-oriented means we build software from objects that hold both <strong>data and behaviour</strong>.</li>
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
<li>The Java platform has 2 components: the <strong>Runtime Environment</strong> and the <strong>API (Application Programming Interface)</strong>.</li>
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
<li>There is <strong>no explicit pointer</strong>.</li>
<li>Java programs run inside a <strong>virtual machine sandbox</strong>.</li>
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
<li>It has <strong>strong memory management</strong>.</li>
<li>It has <strong>no pointer arithmetic</strong>, which avoids a whole class of memory bugs.</li>
<li><strong>Automatic garbage collection</strong> removes objects the program no longer uses.</li>
<li>It has <strong>exception handling</strong> and <strong>type checking at compile time</strong>.</li>
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
<li>Java is architecture neutral because it has <strong>no implementation-dependent features</strong>. For example, the size of each primitive type is <strong>fixed</strong>.</li>
<li>C only guarantees that <code>int</code> is at least 16 bits. The real size depends on the compiler and CPU (2 bytes on old 16-bit compilers, 4 bytes on almost all modern ones).</li>
<li>In Java, <code>int</code> is <strong>always 4 bytes</strong>, on both 32-bit and 64-bit systems.</li>
</ul>`
                            },
                            {
                                content: `<h4>7. Portable</h4>
<ul>
<li>Java is portable because you can carry the <strong>same bytecode</strong> to any platform.</li>
<li>It needs no platform-specific changes to run, <strong>only a JVM</strong>.</li>
</ul>`
                            },
                            {
                                content: `<h4>8. High-performance</h4>
<ul>
<li>Java is faster than traditional interpreted languages because bytecode is <strong>close to native code</strong> and the <strong>JIT compiler</strong> turns hot code into machine code.</li>
<li>It can still be a little slower than fully compiled languages such as C or C++, mainly at startup.</li>
</ul>`
                            },
                            {
                                content: `<h4>9. Distributed</h4>
<ul>
<li>Java is distributed because it has built-in support for programs that run on many machines and talk over a network.</li>
<li><strong>RMI (Remote Method Invocation)</strong> and <strong>EJB (Enterprise JavaBeans)</strong> are classic tools for this.</li>
<li>With them, a program can call methods on objects that live on another machine.</li>
</ul>`
                            },
                            {
                                content: `<h4>10. Multi-<strong>thread</strong>ed</h4>
<ul>
<li>A thread is a small unit of work that runs at the same time as other threads. A Java program can do many tasks at once by using several threads.</li>
<li>Threads share one <strong>common memory area</strong>, so they use less memory than separate programs. Threads are important for multimedia, web applications and similar work.</li>
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
<li>Java loads classes <strong>on demand</strong>, when the program first needs them, not all at start.</li>
<li>It can call native C and C++ code through <strong>JNI (Java Native Interface)</strong>.</li>
<li>The <strong>JIT compiler</strong> compiles hot code at run time, and the <strong>garbage collector</strong> manages memory automatically.</li>
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
        SavingsAccount acc = new SavingsAccount("Raghunath Verma", 10000);

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
// Holder  : Raghunath Verma
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

        String[] students = {"Pilaji", "Imran", "Suryaji", "Vyankoji"};

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
// Saving sheet of Pilaji on worker-0
// Saving sheet of Imran on worker-1
// Saving sheet of Suryaji on worker-2
// Saving sheet of Vyankoji on worker-3
// All answer sheets submitted`
                                ]
                            }
                        ]

};
