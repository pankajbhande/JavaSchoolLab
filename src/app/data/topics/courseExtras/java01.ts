// Core Java extras, part 1 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java01Extras: Record<string, Extra> = {
    'introduction': x(
        ['<b>Compile once, run anywhere</b>: javac turns your code into bytecode, and any JVM can run it.',
            '<b>Entry point</b>: every program starts at <code>public static void main(String[] args)</code>.',
            '<b>Strongly typed</b>: every variable has a declared type, checked at compile time.'],
        ['<b>Pipeline</b>: <code>javac</code> makes <code>.class</code> bytecode, then the JVM interprets it and JIT-compiles hot code to machine code.',
            '<b>Garbage collection</b>: the JVM frees unused objects, so there is no manual free.',
            '<b>LTS releases</b> (8, 11, 17, 21) are the ones most companies run in production.'],
        ['<b>One runtime, many languages</b>: Kotlin, Scala and Groovy also run on the JVM and share its libraries.',
            '<b>Backward compatibility</b>: old bytecode keeps running on new JVMs, which slows language change.',
            '<b>When to choose Java</b>: large, long-lived systems that need tooling, speed and an ecosystem (Spring, Hibernate, Kafka).'],
        [['F', 'What is Java?', 'A general-purpose, object-oriented, platform-independent programming language.'],
            ['F', 'What does write once, run anywhere mean?', 'Bytecode compiled once runs on any platform that has a JVM.'],
            ['M', 'How does Java source become a running program?', 'javac compiles it to bytecode; the JVM loads, verifies and executes it, JIT-compiling hot code.'],
            ['M', 'Is Java purely object-oriented?', 'No: it has primitive types that are not objects.'],
            ['S', 'Why is Java considered both compiled and interpreted?', 'It is compiled to bytecode, then interpreted and JIT-compiled by the JVM at run time.'],
            ['S', 'What makes Java suitable for large systems?', 'Static typing, mature tooling, GC, strong concurrency support, backward compatibility and a huge ecosystem.']],
        [['The first program and how to run it.',
            r`// Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java " + Runtime.version().feature());
    }
}
// javac Hello.java   ->  Hello.class
// java Hello

// OUTPUT:
// Hello, Java 21`],
            ['Reading command-line arguments.',
                r`public class Args {
    public static void main(String[] args) {
        System.out.println("count=" + args.length);
        for (String a : args) System.out.println(a);
    }
}
// java Args one two

// OUTPUT:
// count=2
// one
// two`]],
        [['Single-file launch (Java 11+).',
            r`// java Hello.java   compiles in memory and runs, no .class file

// OUTPUT:
// Hello, Java 21`],
            ['Platform independence check.',
                r`String os = System.getProperty("os.name");
String vm = System.getProperty("java.vm.name");
System.out.println(os + " / " + vm);

// OUTPUT: (varies)
// Windows 10 / OpenJDK 64-Bit Server VM`]]
    ),

    'getting-started': x(
        ['<b>Install a JDK</b> (Temurin, Oracle, Corretto), then check with <code>java -version</code> and <code>javac -version</code>.',
            '<b>Set JAVA_HOME</b> to the JDK folder and add its <code>bin</code> to <b>PATH</b>.',
            '<b>Pick an editor:</b> an IDE (IntelliJ IDEA, Eclipse, VS Code) or just a text editor and the terminal.'],
        ['<b>Class and file name:</b> a public class must match its file name (<code>Hello.java</code> contains <code>public class Hello</code>).',
            '<b>Build tools</b> (Maven, Gradle) manage dependencies and builds; the IDE usually creates the project for you.',
            '<b>Common errors:</b> <code>javac is not recognized</code> means a PATH problem; <code>Could not find or load main class</code> means a wrong class name or classpath.'],
        ['<b>Many JDKs:</b> manage them with SDKMAN, jEnv or the Gradle/Maven toolchains feature.',
            '<b>Reproducible builds:</b> CI should pin the JDK version.',
            '<b>Older targets:</b> use <code>--release 17</code> in javac to build for an older API level safely.'],
        [['F', 'What do you need to run Java programs?', 'A JRE or JDK installed (JDK to compile).'],
            ['F', 'How do you check the installed version?', 'java -version and javac -version.'],
            ['M', 'What is JAVA_HOME for?', 'It tells tools such as Maven and Gradle where the JDK is installed.'],
            ['M', 'Error: could not find or load main class. Causes?', 'Wrong class name, wrong directory or classpath, or a package declared but run without the package name.'],
            ['S', 'How do you manage multiple JDK versions?', 'SDKMAN or IDE and build-tool toolchains, choosing a version per project.'],
            ['S', 'javac -source vs --release?', '--release also restricts the API to that version; -source only affects language level.']],
        [['Compile and run with a package.',
            r`// src/com/acme/App.java
package com.acme;
public class App {
    public static void main(String[] a) {
        System.out.println("ok");
    }
}

// javac -d out src/com/acme/App.java
// java -cp out com.acme.App

// OUTPUT:
// ok`],
            ['Check the environment.',
                r`// PowerShell
// java -version
// echo $env:JAVA_HOME

// OUTPUT: (varies)
// openjdk version "21.0.2" ...
// C:\Program Files\Eclipse Adoptium\jdk-21`]],
        [['Target an older Java.',
            r`// javac --release 11 Hello.java      fails if you use APIs newer than 11

// OUTPUT:
// error: cannot find symbol (for a newer API)`],
            ['Maven project skeleton.',
                r`// mvn archetype:generate -DgroupId=com.acme -DartifactId=demo
//     -DarchetypeArtifactId=maven-archetype-quickstart
// cd demo
// mvn -q compile exec:java -Dexec.mainClass=com.acme.App

// OUTPUT:
// Hello World!`]]
    ),

    'feautures of java': x(
        ['<b>Main features:</b> simple, object-oriented, platform independent, secure, robust, multithreaded, portable and high performance.',
            '<b>No pointers</b> in the language; the garbage collector manages memory.',
            '<b>Rich standard library:</b> collections, I/O, networking, concurrency and more.'],
        ['<b>Robustness</b> comes from strong typing, exception handling and garbage collection.',
            '<b>Security:</b> bytecode verification and class loaders. The security manager is deprecated for removal.',
            '<b>Multithreading</b> is built in with <code>Thread</code>, <code>synchronized</code> and <code>java.util.concurrent</code>.'],
        ['<b>Performance:</b> the JIT compiler (C1/C2, Graal) profiles and optimizes hot code, often close to native speed after warm-up.',
            '<b>Modern features:</b> lambdas, streams, records, sealed types, pattern matching, virtual threads.',
            '<b>Trade-offs:</b> more memory and slower startup than native languages (reduced by GraalVM native image and CDS).'],
        [['F', 'Name some features of Java.', 'Platform independence, object orientation, automatic memory management, multithreading, security and a rich library.'],
            ['F', 'Does Java have pointers?', 'Not explicit pointers; it has references.'],
            ['M', 'How is Java secure?', 'Bytecode verification, class loading rules, no pointer arithmetic and runtime checks such as array bounds.'],
            ['M', 'Why is Java called robust?', 'Strong type checking, exception handling and garbage collection reduce many classes of errors.'],
            ['S', 'What does the JIT compiler do?', 'It compiles frequently executed bytecode to optimized machine code at run time using profiling.'],
            ['S', 'What are the downsides of Java?', 'Memory overhead, slower startup and warm-up, and verbosity compared with some languages.']],
        [['Array bounds are checked.',
            r`int[] a = new int[3];
try {
    a[5] = 1;
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println(e.getMessage());
}

// OUTPUT:
// Index 5 out of bounds for length 3`],
            ['Built-in multithreading.',
                r`Thread t = new Thread(
    () -> System.out.println("in " + Thread.currentThread().getName()), "worker");
t.start();
t.join();

// OUTPUT:
// in worker`]],
        [['Strong typing.',
            r`// int x = "text";   // compile error: String cannot be converted to int
long big = 5;
int small = (int) big;
System.out.println(small);

// OUTPUT:
// 5`],
            ['Virtual threads (modern).',
                r`try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    ex.submit(() -> System.out.println("virtual: " + Thread.currentThread().isVirtual()));
}

// OUTPUT:
// virtual: true`]]
    ),

    'difference between JVM JDK JRE': x(
        ['<b>JVM</b> runs bytecode; <b>JRE</b> = JVM + core libraries (run programs); <b>JDK</b> = JRE + tools like <code>javac</code> and <code>jar</code> (build programs).',
            '<b>Nesting:</b> JDK contains JRE, and JRE contains JVM.',
            '<b>Platform:</b> the JVM is platform specific, but bytecode is platform independent.'],
        ['<b>JVM parts:</b> a class loader subsystem, runtime data areas (heap, stack, metaspace) and an execution engine (interpreter, JIT, GC).',
            '<b>No separate JRE:</b> since Java 11 Oracle does not ship one; use a JDK or build a trimmed runtime.',
            '<b>Small runtime:</b> use <code>jdeps</code> to find the modules and <code>jlink</code> to build the image.'],
        ['<b>Different JVMs:</b> HotSpot, OpenJ9 and GraalVM, each with different GC and JIT choices.',
            '<b>Collectors:</b> G1 (default), ZGC and Shenandoah (low pause), Parallel (throughput).',
            '<b>Container tuning:</b> the JVM reads cgroup limits; set <code>-XX:MaxRAMPercentage</code> instead of a fixed <code>-Xmx</code>.'],
        [['F', 'JDK vs JRE vs JVM?', 'JDK is the development kit (tools + JRE), JRE is the runtime environment (JVM + libraries), JVM executes bytecode.'],
            ['F', 'Is the JVM platform independent?', 'No, each platform has its own JVM; bytecode is what is portable.'],
            ['M', 'What are the main JVM components?', 'Class loader, runtime data areas and execution engine (interpreter, JIT, GC).'],
            ['M', 'What does javac produce?', 'Bytecode in .class files.'],
            ['S', 'How do you create a minimal runtime for an app?', 'Use jdeps to find modules and jlink to build a custom runtime image.'],
            ['S', 'Why set MaxRAMPercentage in containers?', 'So the heap scales with the container memory limit instead of a hard-coded size.']],
        [['Inspect the running JVM.',
            r`Runtime rt = Runtime.getRuntime();
System.out.println(System.getProperty("java.version")
        + " cpus=" + rt.availableProcessors());
System.out.println("maxHeapMB=" + rt.maxMemory() / (1024 * 1024));

// OUTPUT: (varies)
// 21.0.2 cpus=8
// maxHeapMB=4096`],
            ['Disassemble bytecode.',
                r`// javap -c Hello
// 0: getstatic  #7   // Field java/lang/System.out
// 3: ldc        #13  // String Hello
// 5: invokevirtual #15 // PrintStream.println

// OUTPUT:
// the bytecode instructions of main`]],
        [['Custom runtime image.',
            r`// jdeps --print-module-deps app.jar
// jlink --add-modules java.base,java.sql --output runtime --strip-debug --compress zip-6
// runtime/bin/java -jar app.jar

// OUTPUT:
// a runtime of about 50 MB instead of a full JDK`],
            ['Choose a GC.',
                r`// java -XX:+UseZGC -Xlog:gc -jar app.jar
// java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar

// OUTPUT:
// gc log lines per collection`]]
    ),

    'data-types': x(
        ['<b>Primitive types</b>: <code>byte, short, int, long, float, double, char, boolean</code>. Everything else is a reference type.',
            '<b>Declaring</b> a variable: <code>int age = 25;</code>. <b>Field defaults</b>: 0, 0.0, false, null.',
            '<b>Literals</b>: <code>100L</code> for long, <code>3.14f</code> for float, <code>\'A\'</code> for char.'],
        ['<b>Sizes</b>: byte 8 bit, short 16, int 32, long 64, float 32, double 64, char 16 (UTF-16).',
            '<b>Widening</b> (int to long) is automatic; <b>narrowing</b> needs a cast and may lose data.',
            '<b>Local variables</b> must be initialized before use; they have no defaults.'],
        ['<b>Floating point</b> is binary: <code>0.1 + 0.2 != 0.3</code>; use <code>BigDecimal</code> for money.',
            '<b>Integer overflow</b> wraps silently; use <code>Math.addExact</code> to detect it.',
            '<b>Integer cache</b>: values -128 to 127 are cached, so <code>==</code> on Integer objects can mislead.'],
        [['F', 'How many primitive types are there?', 'Eight: byte, short, int, long, float, double, char, boolean.'],
            ['F', 'Default value of an int field?', 'Zero (0).'],
            ['M', 'What is the difference between widening and narrowing?', 'Widening goes to a larger type automatically; narrowing needs an explicit cast and can lose information.'],
            ['M', 'Why use BigDecimal for money?', 'double cannot represent many decimals exactly.'],
            ['S', 'What does Integer a = 127, b = 127; a == b give?', 'true because of the Integer cache; for 128 it is false.'],
            ['S', 'What happens on int overflow?', 'It wraps around silently; Math.addExact throws ArithmeticException.']],
        [['Primitive ranges and casting.',
            r`byte b = (byte) 130;
int i = 'A' + 1;
double d = 10 / 4;
double e = 10 / 4.0;
System.out.println(b + " " + i + " " + d + " " + e + " " + Integer.MAX_VALUE);

// OUTPUT:
// -126 66 2.0 2.5 2147483647`],
            ['Floating point trap.',
                r`System.out.println(0.1 + 0.2);
System.out.println(new BigDecimal("0.1").add(new BigDecimal("0.2")));

// OUTPUT:
// 0.30000000000000004
// 0.3`]],
        [['Overflow detection.',
            r`int max = Integer.MAX_VALUE;
System.out.println(max + 1);
try { Math.addExact(max, 1); } catch (ArithmeticException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// -2147483648
// integer overflow`],
            ['Integer cache.',
                r`Integer a = 127, b = 127, c = 128, d = 128;
System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));

// OUTPUT:
// true false true`]]
    ),

    'access specifiers': x(
        ['<b>Four levels:</b> <code>private</code> (same class), default or package-private (same package), <code>protected</code> (package + subclasses), <code>public</code> (everywhere).',
            '<b>Encapsulation:</b> use <code>private</code> for fields and expose behavior through public methods.',
            '<b>Top-level classes</b> can only be <code>public</code> or package-private.'],
        ['<b>Order</b> from most to least restrictive: <code>private</code>, default, <code>protected</code>, <code>public</code>.',
            '<b>Protected across packages:</b> a subclass in another package can use it only through inheritance (via <code>this</code> or a subclass reference).',
            '<b>Interfaces:</b> methods are <code>public</code> by default; fields are <code>public static final</code>.'],
        ['<b>Minimize visibility:</b> it keeps the API small and makes refactoring safe.',
            '<b>Modules:</b> <code>exports</code> controls which packages are visible outside a module even if the classes are public.',
            '<b>Reflection</b> can bypass access (<code>setAccessible</code>) unless the module system blocks it.'],
        [['F', 'List the four access modifiers.', 'private, default (package-private), protected and public.'],
            ['F', 'What is the default access if no modifier is written?', 'Package-private: visible inside the same package.'],
            ['M', 'Where is a protected member visible?', 'In the same package and in subclasses, even in other packages.'],
            ['M', 'Can a top-level class be private?', 'No, only public or package-private.'],
            ['S', 'Why make fields private?', 'To protect invariants and allow changing the internals without breaking callers.'],
            ['S', 'How do modules change access?', 'A public class in a package that is not exported is not accessible to other modules.']],
        [['Access across classes.',
            r`public class Account {
    private double balance;                 // only Account
    int branch;                             // package
    protected String owner;                 // package + subclasses
    public void deposit(double amt) { if (amt > 0) balance += amt; }
    public double getBalance() { return balance; }
}
Account a = new Account();
a.deposit(100);
System.out.println(a.getBalance());

// OUTPUT:
// 100.0`],
            ['Compile error on private.',
                r`// a.balance = 5;    // error: balance has private access in Account

// OUTPUT:
// compile-time error`]],
        [['Protected in a subclass.',
            r`// package a:  public class Base { protected void hook() {} }
// package b:  class Child extends Base { void run() { hook(); } }   // ok
//             new Base().hook();                                      // error outside package

// OUTPUT:
// the call through a Base reference does not compile`],
            ['Narrowing is not allowed when overriding.',
                r`class A {
    public void m() {}
}
// class B extends A { void m() {} }   // error: attempting to assign weaker access privileges

// OUTPUT:
// compile-time error`]]
    ),

    'operators': x(
        ['<b>Operator families:</b> arithmetic (<code>+ - * / %</code>), relational (<code>== != &lt; &gt;</code>), logical (<code>&amp;&amp; || !</code>), assignment (<code>= += -=</code>), unary (<code>++ --</code>), ternary (<code>?:</code>), bitwise and shift.',
            '<b>Integer division:</b> <code>/</code> on two ints drops the decimal part, so <code>7 / 2</code> is <code>3</code>.',
            '<b>Short-circuit:</b> <code>&amp;&amp;</code> and <code>||</code> run the right side only if needed.'],
        ['<b>Pre and post increment:</b> <code>++i</code> returns the new value; <code>i++</code> returns the old value.',
            '<b>Compound assignment:</b> it adds an implicit cast, so <code>b += 1</code> compiles for a <code>byte b</code> but <code>b = b + 1</code> does not.',
            '<b>Precedence:</b> unary, multiplicative, additive, shift, relational, equality, bitwise, logical, ternary, assignment. Use parentheses for clarity.'],
        ['<b>Bitwise tricks:</b> <code>n &amp; (n-1)</code> clears the lowest set bit; <code>&gt;&gt;&gt;</code> is an unsigned shift.',
            '<b>Reference equality:</b> <code>==</code> on objects compares references; use <code>equals</code> for values.',
            '<b>String concatenation:</b> <code>+</code> in a loop creates many objects; use <code>StringBuilder</code>.'],
        [['F', 'What is the difference between = and ==?', '= assigns a value; == compares values (or references for objects).'],
            ['F', 'What does 7 / 2 give?', 'It gives 3, because both are ints and the decimal part is dropped.'],
            ['M', 'Difference between i++ and ++i?', 'The post-increment i++ returns the old value and then increments; the pre-increment ++i increments first and returns the new value.'],
            ['M', 'What is short-circuit evaluation?', 'With && and || the second operand is evaluated only if the first does not decide the result.'],
            ['S', 'Why does byte b = 10; b += 5; compile?', 'Compound assignment casts the result back to the left type implicitly.'],
            ['S', 'What is the difference between >> and >>>?', '>> keeps the sign bit (arithmetic shift); >>> fills with zeros (unsigned shift).']],
        [['Operator behavior.',
            r`int i = 5;
int a = i++ + ++i;            // 5 + 7
System.out.println(a + " " + i + " " + 7 / 2 + " " + 7 % 3 + " " + (-7 % 3) + " " + (7 / 2.0));

// OUTPUT:
// 12 7 3 1 -1 3.5`],
            ['Bitwise and shifts.',
                r`int n = 12;                                   // 1100
System.out.println((n & 4) + " " + (n | 3) + " " + (n ^ 5) + " " + (n << 2) + " " + (n >> 1) + " " + (-16 >>> 28));
System.out.println((n & (n - 1)) + " " + Integer.toBinaryString(n));

// OUTPUT:
// 4 15 9 48 6 15
// 8 1100`]],
        [['Short circuit protects from NPE.',
            r`String s = null;
if (s != null && s.length() > 3) System.out.println("long");
else System.out.println("safe");

// OUTPUT:
// safe`],
            ['Ternary chain.',
                r`int m = 72;
String g = m >= 90 ? "A" : m >= 70 ? "B" : "C";
System.out.println(g);

// OUTPUT:
// B`]]
    ),

    'Control Statements in Java': x(
        ['<b>Decision making:</b> <code>if</code>, <code>if-else</code>, <code>else if</code> ladder, <code>switch</code>.',
            '<b>Boolean condition:</b> <code>if (x = 5)</code> does not compile for an int, because the condition must be boolean.',
            '<b>Braces:</b> use <code>{ }</code> even for one-line bodies.'],
        ['<b>switch types:</b> <code>switch</code> works on int, char, String and enum; without <code>break</code> it falls through to the next case.',
            '<b>Switch expressions</b> (Java 14+) use <code>-&gt;</code>, return a value and need no <code>break</code>.',
            '<b>Early return:</b> prefer it to deep nesting.'],
        ['<b>Pattern matching</b> for switch (Java 21) handles types and guards with <code>when</code>.',
            '<b>Polymorphism or map:</b> replace long if-else chains over a type or code with polymorphism or a lookup <code>Map</code>.',
            '<b>Exhaustive enum switch:</b> leave out <code>default</code> in a switch expression so the compiler flags missing cases.'],
        [['F', 'Name the decision-making statements.', 'if, if-else, else-if ladder and switch.'],
            ['F', 'What does break do in switch?', 'It exits the switch; without it execution falls through to the next case.'],
            ['M', 'Which types can switch use?', 'int-like types, char, String, enums (and patterns in Java 21).'],
            ['M', 'What is a switch expression?', 'A switch that yields a value using -> or yield, with no fall-through.'],
            ['S', 'How can you avoid long if-else chains?', 'Use polymorphism, strategy objects, enums with behavior or a Map of handlers.'],
            ['S', 'What does exhaustiveness mean in switch?', 'Every possible value or subtype is covered, so the compiler requires no default (for sealed types and enums in expressions).']],
        [['Switch expression and fall-through.',
            r`int day = 3;
String name = switch (day) {
    case 1, 7 -> "Weekend";
    case 2, 3, 4, 5, 6 -> "Weekday";
    default -> "Invalid";
};
switch (day) {
    case 3: System.out.print("three ");   // no break: falls into case 4
    case 4: System.out.print("four ");
    break;
    default: System.out.print("other");
}
System.out.println(name);

// OUTPUT:
// three four Weekday`],
            ['Pattern switch.',
                r`static String describe(Object o) {
    return switch (o) {
        case Integer i when i > 10 -> "big int";
        case Integer i -> "int";
        case String s -> "string " + s.length();
        default -> "other";
    };
}
System.out.println(describe(42) + ", " + describe("hey") + ", " + describe(2.5));

// OUTPUT:
// big int, string 3, other`]],
        [['Guard clauses.',
            r`static String grade(int m) {
    if (m < 0 || m > 100) return "invalid";
    if (m >= 90) return "A";
    if (m >= 70) return "B";
    return "C";
}
System.out.println(grade(95) + grade(50) + grade(101));

// OUTPUT:
// ACinvalid`],
            ['Map instead of if-else.',
                r`Map<String, Double> rate = Map.of("GOLD", 0.2, "SILVER", 0.1);
System.out.println(rate.getOrDefault("GOLD", 0.0) + " " + rate.getOrDefault("NONE", 0.0));

// OUTPUT:
// 0.2 0.0`]]
    ),

    'Jumping Statement': x(
        ['<b>Basic jumps:</b> <code>break</code> exits a loop or switch; <code>continue</code> skips to the next iteration; <code>return</code> exits a method.',
            '<b>Labeled jumps</b> work on outer loops: <code>outer: for (...) { ... break outer; }</code>.',
            '<b>No goto:</b> <code>goto</code> is a reserved word only.'],
        ['<b>continue in loops:</b> in a <code>for</code> loop the update expression still runs; in a <code>while</code> loop update the counter before <code>continue</code>.',
            '<b>Labels:</b> use them sparingly; often extracting a method and returning is clearer.',
            '<b>return in finally:</b> <code>return</code> in <code>finally</code> overrides exceptions and other returns, so avoid it.'],
        ['<b>Streams:</b> use <code>anyMatch</code>, <code>findFirst</code> or <code>takeWhile</code> instead of <code>break</code>.',
            '<b>Common bug:</b> <code>continue</code> skipping an increment in a <code>while</code> loop.',
            '<b>Search pattern:</b> prefer a method that <code>return</code>s as soon as it finds the answer.'],
        [['F', 'What does break do?', 'It terminates the nearest loop or switch.'],
            ['F', 'What does continue do?', 'It skips the rest of the current iteration and goes to the next one.'],
            ['M', 'What is a labeled break?', 'A break that exits a specific outer loop identified by a label.'],
            ['M', 'Does Java support goto?', 'No; it is reserved but unused.'],
            ['S', 'What is the continue pitfall in while loops?', 'If the counter update is after continue, it is skipped and the loop may never end.'],
            ['S', 'How do you stop early in a stream?', 'Use short-circuiting operations like findFirst, anyMatch, limit or takeWhile.']],
        [['Labeled break.',
            r`outer:
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (i * j == 4) break outer;
        System.out.print(i * j + " ");
    }
}
System.out.println();

// OUTPUT:
// 1 2 3 2`],
            ['continue to skip evens.',
                r`for (int i = 1; i <= 7; i++) {
    if (i % 2 == 0) continue;
    System.out.print(i + " ");
}
System.out.println();

// OUTPUT:
// 1 3 5 7`]],
        [['Infinite loop trap: update the counter before <code>continue</code> in a while loop.',
            r`int i = 0;
while (i < 5) {
    if (i == 2) {
        i++;
        continue;
    }  // increment before continue
    System.out.print(i + " ");
    i++;
}
System.out.println();

// OUTPUT:
// 0 1 3 4`],
            ['Return early from search.',
                r`static int indexOf(int[] a, int t) {
    for (int i = 0; i < a.length; i++) if (a[i] == t) return i;
    return -1;
}
System.out.println(indexOf(new int[]{4, 8, 15}, 8));

// OUTPUT:
// 1`]]
    )
};

export const java01Deep: Record<string, Deep> = {
    'introduction': dv(
        [`When you run <code>java Hello</code>, these steps happen in order:<ol><li>The launcher creates the JVM.</li><li>The bootstrap class loader loads the core classes.</li><li>The application class loader loads <code>Hello</code>.</li><li>The verifier checks the bytecode.</li><li>The interpreter runs <code>main</code>.</li></ol>Methods that run many times are compiled by the JIT (Just-In-Time compiler). It uses tricks such as inlining (copying a small method into its caller) and escape analysis (finding objects that never leave a method).`,
            r`public class Warm {
    static int f(int x) { return x * 2 + 1; }

    public static void main(String[] a) {
        long t = System.nanoTime();
        long s = 0;
        for (int i = 0; i < 50_000_000; i++) s += f(i);
        long ms = (System.nanoTime() - t) / 1_000_000;
        System.out.println(s + " in " + ms + " ms");
    }
}
// java -XX:+PrintCompilation Warm   shows Warm::f compiled

// OUTPUT: (varies)
// 2500000000000000 in 45 ms`],
        [`Syntax rules:<ul><li>A class holds fields and methods.</li><li>Statements end with a semicolon, and blocks use braces.</li><li>Names are case sensitive.</li><li>Comments are <code>//</code>, <code>/* */</code> and <code>/** */</code> (Javadoc).</li></ul>Naming rules:<ul><li>Classes use PascalCase.</li><li>Methods and variables use camelCase.</li><li>Constants use UPPER_SNAKE_CASE.</li></ul>`,
            r`/** Calculates simple interest. */
public class Interest {
    private static final double RATE = 0.05;   // constant

    static double simple(double principal, int years) {
        return principal * RATE * years;
    }

    public static void main(String[] args) {
        System.out.printf("%.2f%n", simple(1000, 3));
    }
}

// OUTPUT:
// 150.00`],
        [`Common mistakes:<ul><li>The file name does not match the public class.</li><li>The <code>main</code> method is missing <code>static</code>, or its signature is wrong. The code compiles but will not run.</li><li>Writing <code>string</code> instead of <code>String</code>, because Java is case sensitive.</li></ul>Newer Java versions allow an instance <code>main</code>: a preview feature in Java 21, and standard from Java 25.`,
            r`public class Bad {
    public void main(String[] args) {   // missing static
        System.out.println("hi");
    }
}
// java Bad

// OUTPUT (Java 21 without preview):
// Error: Main method is not static in class Bad, please define
// the main method as: public static void main(String[] args)`],
        [`Startup and warm-up matter for short programs, because the JVM interprets first and compiles later. These tools reduce startup time:<ul><li><b>AppCDS</b> (Class Data Sharing): saves loaded classes in an archive.</li><li><b>GraalVM native image</b>: compiles the app ahead of time.</li><li><b>CRaC</b>: restores a saved, already warm process.</li></ul>For benchmarks, warm up first and use JMH. Never trust one cold run.`,
            r`// Create an AppCDS archive when the app exits
// java -XX:ArchiveClassesAtExit=app.jsa -jar app.jar
// Use the archive for faster startup
// java -XX:SharedArchiveFile=app.jsa -jar app.jar

// OUTPUT:
// startup time drops noticeably for class-heavy apps`],
        [`Real-world: Java powers banking back ends, Android apps (via Kotlin/Java), big-data tools (Hadoop, Kafka, Spark), and e-commerce. A typical service is built with Maven or Gradle, packaged as a jar, run in a container, and monitored with JFR and Micrometer.`,
            r`// mvn -q package
// docker build -t orders .
// java -XX:MaxRAMPercentage=75 -jar target/orders.jar

// OUTPUT:
// Started OrdersApplication in 2.3 seconds`]
    ),

    'getting-started': dv(
        [`The launcher resolves the class path in order; <code>-cp</code> lists directories and jars separated by ; (Windows) or : (Unix). Packages map to folders, and <code>-d</code> tells javac where to write class files. Since JDK 9 the module path (<code>-p</code>) is separate from the class path.`,
            r`// layout:  src/com/acme/util/Greeter.java and src/com/acme/App.java
// javac -d out src/com/acme/util/Greeter.java \
//       src/com/acme/App.java
// java -cp out com.acme.App
// jar cfe app.jar com.acme.App -C out .
// java -jar app.jar

// OUTPUT:
// the packaged application runs from app.jar`],
        [`Tooling: <code>javac</code>, <code>java</code>, <code>jar</code>, <code>javadoc</code>, <code>jshell</code> (REPL), <code>jcmd</code>, <code>jstack</code>, <code>jmap</code>, <code>jfr</code>. jshell is ideal for trying snippets. Maven (pom.xml) and Gradle (build.gradle) add dependency management.`,
            r`// jshell
// jshell> int x = 5 * 7
// x ==> 35
// jshell> "abc".repeat(2)
// $2 ==> "abcabc"
// jshell> /exit

// OUTPUT:
// results are printed immediately for each expression`],
        [`Mistakes: installing only a JRE, wrong JAVA_HOME with a trailing bin, mixing JDK versions between compile and run (UnsupportedClassVersionError), spaces in class paths, and committing IDE files. UnsupportedClassVersionError means the class was compiled for a newer Java than the runtime.`,
            r`// Exception in thread "main" java.lang.UnsupportedClassVersionError:
//   Hello has been compiled by a more recent version of the Java Runtime
//   (class file version 65.0), this version of the Java Runtime
//   only recognizes class file versions up to 55.0
// fix: run with a newer JDK or compile with --release 11

// OUTPUT:
// the error names both versions (65 = Java 21, 55 = Java 11)`],
        [`Build speed: use Gradle or Maven daemons, incremental compilation and the build cache; in CI cache the dependency folder. Locally, give the IDE enough memory, and keep tests fast.`,
            r`// mvn -T 1C -DskipTests package          parallel build, one thread per core
// ./gradlew build --build-cache --parallel

// OUTPUT:
// BUILD SUCCESS in 12 s`],
        [`Real-world team setup: pin the JDK version in the build file (toolchain), commit the wrapper (<code>mvnw</code> or <code>gradlew</code>), and document one-command setup.`,
            r`// pom.xml
// <properties><maven.compiler.release>21</maven.compiler.release></properties>
// ./mvnw -q verify

// OUTPUT:
// every developer and the CI build with the same Java level`]
    ),

    'feautures of java': dv(
        [`Platform independence relies on the class file format and a specification-defined JVM. Garbage collection finds unreachable objects from GC roots (thread stacks, statics) and reclaims them, with generational collectors optimizing for the fact that most objects die young. Security relies on verification before execution.`,
            r`Object o = new Object();
WeakReference<Object> ref = new WeakReference<>(o);
o = null;
System.gc();
System.out.println(ref.get() == null ? "collected" : "still alive");

// OUTPUT: (typical)
// collected`],
        [`Feature set by version: 8 (lambdas, streams), 9 (modules), 10-11 (var, HTTP client), 14-17 (switch expressions, text blocks, records, sealed), 21 (virtual threads, pattern switch, sequenced collections). Language stays backward compatible, so adoption is incremental.`,
            r`record Point(int x, int y) {}
sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double s) implements Shape {}
static double area(Shape s) {
    return switch (s) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Square q -> q.s() * q.s();
    };
}
System.out.printf("%.1f %.1f%n", area(new Circle(1)), area(new Square(2)));

// OUTPUT:
// 3.1 4.0`],
        [`<p>Common misconceptions about Java:</p><ul><li>It is not slow by definition, because the JIT compiler optimizes hot code.</li><li>It has no pointer arithmetic, but it does have <code>null</code> references, so <code>NullPointerException</code> exists.</li><li>It is always pass by value. For objects, the reference is copied, not the object.</li><li>Strings are immutable.</li></ul>`,
            r`static void change(StringBuilder sb, String s, int n) {
    sb.append("!");
    s = s + "!";
    n++;
}
StringBuilder sb = new StringBuilder("hi");
String s = "hi";
int n = 1;
change(sb, s, n);
System.out.println(sb + " " + s + " " + n);

// OUTPUT:
// hi! hi 1`],
        [`Performance features: escape analysis can allocate short-lived objects on the stack or scalar-replace them, inlining removes call overhead, and intrinsics replace hot methods with CPU instructions. Write clear code first and measure with JMH or JFR.`,
            r`// java -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining -jar app.jar
// java -XX:StartFlightRecording=duration=60s,filename=rec.jfr -jar app.jar

// OUTPUT:
// profiles show hot methods, allocations and GC pauses`],
        [`Real-world: choosing Java for a payments service: static typing prevents classes of bugs, the JVM gives predictable performance, libraries cover security and databases, and virtual threads handle massive concurrency simply.`,
            r`try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> fs = IntStream.range(0, 1000)
        .mapToObj(i -> ex.submit(() -> "task" + i))
        .toList();
    System.out.println(fs.size());
}

// OUTPUT:
// 1000`]
    ),

    'difference between JVM JDK JRE': dv(
        [`Runtime data areas: <b>heap</b> (objects, shared), <b>metaspace</b> (class metadata, native memory), <b>thread stacks</b> (frames with locals and operand stack), <b>PC registers</b>, and <b>native method stacks</b>. Class loading phases: loading, linking (verify, prepare, resolve), initialization (static blocks run).`,
            r`class Demo {
    static { System.out.println("class initialized"); }
    static void hello() { System.out.println("hello"); }
}
System.out.println("before");
Demo.hello();                         // triggers loading and initialization

// OUTPUT:
// before
// class initialized
// hello`],
        [`Class loader hierarchy: bootstrap, platform, application, plus custom loaders (web containers, plugins). Parent delegation asks the parent first, so core classes cannot be replaced. Inspect with <code>getClassLoader()</code>; tools: <code>jcmd</code>, <code>jstack</code>, <code>jmap</code>, <code>jfr</code>, <code>jconsole</code>.`,
            r`System.out.println(String.class.getClassLoader());
System.out.println(Demo.class.getClassLoader().getClass().getSimpleName());
System.out.println(ClassLoader.getSystemClassLoader().getParent().getName());

// OUTPUT:
// null
// AppClassLoader
// platform`],
        [`Mistakes: tuning flags blindly, setting -Xmx larger than container memory (OOM kill by the OS), ignoring metaspace leaks (many classloaders in redeploys), and confusing OutOfMemoryError kinds (heap space, metaspace, unable to create native thread).`,
            r`// java -Xmx512m -XX:+HeapDumpOnOutOfMemoryError
//      -XX:HeapDumpPath=./dumps -jar app.jar
// Exception in thread "main" java.lang.OutOfMemoryError: Java heap space

// OUTPUT:
// a .hprof heap dump is written for analysis in Eclipse MAT`],
        [`Choosing a collector: G1 balances pause and throughput (default), ZGC gives sub-millisecond pauses on large heaps, Parallel maximizes throughput for batch jobs, Serial suits tiny containers. Check GC logs before changing anything.`,
            r`// java -Xlog:gc*:file=gc.log -XX:+UseG1GC -jar app.jar
// java -XX:+UseZGC -XX:+ZGenerational -jar app.jar

// OUTPUT:
// [2.1s][info][gc] GC(12) Pause Young (Normal) 45M->12M(256M) 3.2ms`],
        [`Real-world: shipping a small container image with a jlink runtime, running with container-aware heap settings, and enabling JFR in production for always-on profiling.`,
            r`// FROM eclipse-temurin:21-jre
// ENTRYPOINT ["java","-XX:MaxRAMPercentage=75",
//   "-XX:+ExitOnOutOfMemoryError","-jar","/app.jar"]

// OUTPUT:
// the process exits on OOM so the orchestrator restarts it`]
    ),

    'data-types': dv(
        [`Primitives live in stack frames (locals) or inside objects (fields) and hold values directly; references hold addresses to heap objects. <code>int</code> is 32-bit two's complement; <code>float</code> and <code>double</code> follow IEEE 754 (sign, exponent, mantissa), which explains NaN, Infinity and rounding error. <code>char</code> is an unsigned 16-bit UTF-16 code unit.`,
            r`System.out.println(Integer.toBinaryString(-1).length()); // 32 bits
System.out.println(0.0 / 0.0);                  // NaN
System.out.println(1 / 0.0);                    // Infinity
System.out.println(Double.NaN == Double.NaN);   // false
System.out.println(Float.floatToIntBits(1.0f) + " " + (char) 97 + " " + (int) 'A');
System.out.println("😀".length() + " " + "😀".codePointCount(0, 2));

// OUTPUT:
// 32
// NaN
// Infinity
// false
// 1065353216 a 65
// 2 1`],
        [`Wrapper classes (Integer, Double...) enable generics and collections; autoboxing converts automatically. Use <code>BigInteger</code> and <code>BigDecimal</code> for arbitrary precision, <code>var</code> for local inference, and <code>Math</code> exact methods. Number formatting: <code>String.format</code>, <code>NumberFormat</code>.`,
            r`BigDecimal price = new BigDecimal("19.99");
BigDecimal total = price.multiply(BigDecimal.valueOf(3))
        .setScale(2, RoundingMode.HALF_UP);
BigInteger fact = IntStream.rangeClosed(1, 25)
        .mapToObj(BigInteger::valueOf)
        .reduce(BigInteger.ONE, BigInteger::multiply);
System.out.println(total + " " + fact);

// OUTPUT:
// 59.97 15511210043330985984000000`],
        [`Mistakes: new BigDecimal(0.1) (inexact; use the String constructor or valueOf), comparing doubles with ==, comparing BigDecimal with equals (scale matters; use compareTo), auto-unboxing null (NullPointerException), and long arithmetic that overflows int before widening.`,
            r`System.out.println(new BigDecimal(0.1));
BigDecimal two1 = new BigDecimal("2.0"), two2 = new BigDecimal("2.00");
System.out.println(two1.equals(two2) + " " + (two1.compareTo(two2) == 0));
long wrong = 1000 * 1000 * 1000 * 10;        // int overflow before widening
long right = 1000L * 1000 * 1000 * 10;
Integer boxed = null;
try {
    int v = boxed;                           // unboxing null
} catch (NullPointerException e) {
    System.out.println("unboxing NPE");
}
System.out.println(wrong + " " + right);

// OUTPUT:
// 0.1000000000000000055511151231257827021181583404541015625
// false true
// unboxing NPE
// 1410065408 10000000000`],
        [`Performance: primitives avoid allocation; boxing in hot loops is costly, and a List&lt;Integer&gt; uses far more memory than int[]. Use primitive streams (IntStream) and specialized collections for large numeric data.`,
            r`long t = System.nanoTime();
Long sum = 0L;
for (long i = 0; i < 20_000_000; i++) sum += i;   // boxing each iteration
long t1 = System.nanoTime() - t;
t = System.nanoTime();
long s2 = 0;
for (long i = 0; i < 20_000_000; i++) s2 += i;
long t2 = System.nanoTime() - t;
System.out.println("boxed ms=" + t1 / 1_000_000
        + " primitive ms=" + t2 / 1_000_000);

// OUTPUT: (varies)
// boxed ms=60 primitive ms=8`],
        [`Real-world: store money as integer minor units (cents) or BigDecimal, timestamps as <code>Instant</code>, ids as long or UUID, flags as boolean, and never use float or double for currency.`,
            r`record Money(long cents, String currency) {
    Money plus(Money o) {
        return new Money(Math.addExact(cents, o.cents), currency);
    }
    public String toString() {
        return String.format("%d.%02d %s", cents / 100, cents % 100, currency);
    }
}
System.out.println(new Money(1999, "INR").plus(new Money(1, "INR")));

// OUTPUT:
// 20.00 INR`]
    ),

    'access specifiers': dv(
        [`Access is checked by the compiler and again by the JVM at link time (and by reflection at run time). Package-private and protected depend on the runtime package, which is the package name plus the class loader. Nested classes can access each other's private members (nestmates since Java 11 without synthetic accessors).`,
            r`public class Outer {
    private int secret = 42;
    class Inner {
        int peek() { return secret; }
    }  // inner reads outer private

    public static void main(String[] args) {
        System.out.println(new Outer().new Inner().peek());
    }
}

// OUTPUT:
// 42`],
        [`Design guidance: public API small and documented, internals package-private, fields private, constants public static final, constructors private for singletons and factories, protected only for designed extension. Modules add <code>exports</code> and <code>opens</code> to control reflection access.`,
            r`// module-info.java
module com.acme.orders {
    exports com.acme.orders.api;           // public API package
    opens com.acme.orders.model
        to com.fasterxml.jackson.databind; // reflection for JSON only
}

// OUTPUT:
// classes in non-exported packages are inaccessible to other modules`],
        [`Mistakes: making everything public, exposing mutable collections, protected fields instead of methods, and using reflection to bypass private (breaks with modules). Return unmodifiable views or copies.`,
            r`import java.util.*;

class Team {
    private final List<String> members = new ArrayList<>();

    public List<String> members() {
        return List.copyOf(members);              // defensive copy
    }

    public void add(String m) {
        members.add(Objects.requireNonNull(m));
    }
}

// OUTPUT:
// callers cannot change internal state without add()`],
        [`Visibility does not change speed by itself, but small private and final methods inline well. Overly wide APIs cost maintainability: every public member is a promise to support. Review public surface in code reviews.`,
            r`// Prefer: small public surface, private helpers
public final class Parser {
    public Result parse(String s) { /* ... */ }
    private Token next() { /* ... */ }
}
// Avoid: every helper public, so callers depend on internals

// OUTPUT:
// refactoring private helpers cannot break clients`],
        [`Real-world: a library exposes interfaces and a factory in the api package and hides implementations in an internal package, so versions can change implementations freely.`,
            r`public interface PaymentGateway {
    Receipt charge(Card c, long cents);
}

public final class Gateways {
    public static PaymentGateway stripe(String key) {
        return new StripeGateway(key);
    }
}

// package-private implementation, hidden from clients
final class StripeGateway implements PaymentGateway { /* ... */ }

// OUTPUT:
// clients depend on PaymentGateway, not StripeGateway`]
    ),

    'operators': dv(
        [`Expression evaluation order in Java is left to right for operands (unlike C), with precedence deciding grouping. Binary numeric promotion converts operands to int at least; <code>byte + byte</code> is int. Integer division truncates toward zero; <code>%</code> takes the sign of the dividend; <code>Math.floorMod</code> gives a non-negative result.`,
            r`byte a = 10, b = 20;
int c = a + b;                                     // promoted to int
System.out.println(c + " " + (-7 / 2) + " " + (-7 % 3) + " "
        + Math.floorMod(-7, 3) + " " + Math.floorDiv(-7, 2));
int i = 1;
i = i++ + i++;                                     // 1 + 2
System.out.println(i);

// OUTPUT:
// 30 -3 -1 2 -4
// 3`],
        [`Bit manipulation: set a bit <code>n | (1 &lt;&lt; k)</code>, clear <code>n &amp; ~(1 &lt;&lt; k)</code>, toggle <code>n ^ (1 &lt;&lt; k)</code>, test <code>(n &gt;&gt; k) &amp; 1</code>. Library helpers: <code>Integer.bitCount</code>, <code>highestOneBit</code>, <code>numberOfTrailingZeros</code>. <code>instanceof</code> with pattern matching combines test and cast.`,
            r`int flags = 0;
flags |= 1 << 2;
flags |= 1 << 0;
boolean has2 = (flags >> 2 & 1) == 1;
System.out.println(Integer.toBinaryString(flags) + " " + has2 + " "
        + Integer.bitCount(flags) + " " + Integer.highestOneBit(37));
Object o = "text";
if (o instanceof String s && s.length() > 2) System.out.println(s.toUpperCase());

// OUTPUT:
// 101 true 2 32
// TEXT`],
        [`Common mistakes: using <code>==</code> for strings and boxed values, assuming <code>==</code> on floats is safe, using <code>&amp;</code> instead of <code>&amp;&amp;</code> (no short circuit, so a possible NPE), integer division when decimals are expected, and relying on side effects inside expressions. Also, <code>+</code> with a String turns later numbers into text.`,
            r`String a = "hi", b = new String("hi");
System.out.println((a == b) + " " + a.equals(b));
System.out.println(1 + 2 + "x" + 1 + 2);
System.out.println(5 / 2 * 2.0 + " " + 5 / 2.0 * 2);

// OUTPUT:
// false true
// 3x12
// 4.0 5.0`],
        [`String concatenation in a loop is quadratic (slow for large counts). The compiler optimizes a single expression with <code>invokedynamic</code>, but not loops. Use shifts instead of multiplying by powers of two only when clearer; the JIT already does that.`,
            r`StringBuilder sb = new StringBuilder();
for (int i = 0; i < 5; i++) sb.append(i).append(',');
sb.setLength(sb.length() - 1);
System.out.println(sb);

// OUTPUT:
// 0,1,2,3,4`],
        [`Real-world uses: permission flags in a bitmask (read, write, execute), checksum and hash calculations, and fast power-of-two checks.`,
            r`static final int READ = 1, WRITE = 2, EXEC = 4;
int perm = READ | WRITE;
System.out.println(((perm & WRITE) != 0) + " " + ((perm & EXEC) != 0));
static boolean isPow2(int n) { return n > 0 && (n & (n - 1)) == 0; }
System.out.println(isPow2(64) + " " + isPow2(66));

// OUTPUT:
// true false
// true false`]
    ),

    'Control Statements in Java': dv(
        [`The compiler turns if statements into conditional jumps and switch into <code>tableswitch</code> (dense cases) or <code>lookupswitch</code> (sparse) bytecode. String switch computes hashCode then compares equals. Enum switch uses ordinal through a synthetic mapping array. Switch expressions must be exhaustive.`,
            r`String cmd = "stop";
switch (cmd) {
    case "go"   -> System.out.println("going");
    case "stop" -> System.out.println("stopping");
    default     -> System.out.println("?");
}
// javap -c shows hashCode() then lookupswitch

// OUTPUT:
// stopping`],
        [`Modern forms: switch expressions with <code>yield</code> for blocks, pattern matching with guards, record deconstruction patterns, sealed hierarchies for exhaustive switches without default, and <code>null</code> case handling in Java 21.`,
            r`sealed interface Expr permits Num, Add, Mul {}
record Num(int v) implements Expr {}
record Add(Expr l, Expr r) implements Expr {}
record Mul(Expr l, Expr r) implements Expr {}
static int eval(Expr e) {
    return switch (e) {
        case Num n -> n.v();
        case Add(Expr l, Expr r) -> eval(l) + eval(r);
        case Mul(Expr l, Expr r) -> eval(l) * eval(r);
    };
}
System.out.println(eval(new Add(new Num(2), new Mul(new Num(3), new Num(4)))));

// OUTPUT:
// 14`],
        [`Mistakes: missing break (fall-through bug), switch on a null String (NullPointerException before Java 21 unless case null), dangling else confusion without braces, comparing strings with == in conditions, and a default branch that hides missing cases.`,
            r`String s = null;
try {
    switch (s) { case "a": break; }      // old switch: NPE on null
} catch (NullPointerException e) {
    System.out.println("NPE");
}
String r = switch (s) {                  // Java 21
    case null -> "null!";
    case "a"  -> "A";
    default   -> "other";
};
System.out.println(r);

// OUTPUT:
// NPE
// null!`],
        [`Branch prediction: predictable branches are cheap; unpredictable branches in hot loops can be slow. Replace branches with lookups or arithmetic only after profiling. Order else-if chains by likelihood only if measured.`,
            r`int[] lookup = {0, 10, 20, 30};
int bonus(int level) {
    return level >= 0 && level < lookup.length ? lookup[level] : 0;
}
System.out.println(bonus(2) + " " + bonus(9));

// OUTPUT:
// 20 0`],
        [`Real-world: routing commands in a CLI, mapping HTTP status codes, and state machines. Enums with abstract methods or a map of handlers keep the switch from growing without bound.`,
            r`enum Op {
    ADD {
        int apply(int a, int b) { return a + b; }
    },
    MUL {
        int apply(int a, int b) { return a * b; }
    };
    abstract int apply(int a, int b);
}
System.out.println(Op.valueOf("MUL").apply(6, 7));

// OUTPUT:
// 42`]
    ),

    'Jumping Statement': dv(
        [`In bytecode, break and continue are <code>goto</code> instructions to the loop exit or the update step. A labeled break jumps past the labeled statement. <code>return</code> unwinds the frame, running finally blocks first. Control flow analysis in javac reports unreachable code after break, continue, return and throw.`,
            r`static int f() {
    try { return 1; }
    finally { System.out.println("finally runs before return completes"); }
}
System.out.println(f());

// OUTPUT:
// finally runs before return completes
// 1`],
        [`Alternatives: extract methods and return, use streams (<code>anyMatch</code>, <code>findFirst</code>, <code>takeWhile</code>, <code>dropWhile</code>), use iterators and exceptions only for truly exceptional flows. Labeled loops remain useful in grid searches and parsers.`,
            r`int[][] grid = {{1, 2}, {3, 4}, {5, 6}};
boolean found = Arrays.stream(grid)
    .flatMapToInt(Arrays::stream).anyMatch(v -> v == 4);
Optional<Integer> first = Stream.of(5, 8, 12).filter(v -> v > 6).findFirst();
List<Integer> head = Stream.of(1, 2, 3, 10, 1).takeWhile(v -> v < 5).toList();
System.out.println(found + " " + first.get() + " " + head);

// OUTPUT:
// true 8 [1, 2, 3]`],
        [`Mistakes: return inside finally swallowing exceptions, break inside switch inside a loop only leaving the switch, continue skipping the counter update, and break out of forEach lambdas (not possible: use a plain loop or stream short-circuit).`,
            r`for (int i = 0; i < 4; i++) {
    switch (i) {
        case 2: break;                       // leaves only the switch
        default: System.out.print(i + " ");
    }
}
System.out.println();
static int g() {
    try { throw new RuntimeException("lost"); } finally { return 7; }
}
System.out.println(g());

// OUTPUT:
// 0 1 3
// 7`],
        [`Early exits reduce work: search loops should stop at the first match and nested checks should fail fast. In hot code avoid exceptions for control flow; they are slow due to stack trace capture.`,
            r`static int firstNegative(int[] a) {
    for (int i = 0; i < a.length; i++) if (a[i] < 0) return i;
    return -1;
}
System.out.println(firstNegative(new int[]{3, 5, -2, 8}));

// OUTPUT:
// 2`],
        [`Real-world: scanning logs for the first error line, validating a batch and stopping at the first invalid record, and retry loops that break on success.`,
            r`int attempt = 0;
while (true) {
    attempt++;
    if (tryCall(attempt)) break;
    if (attempt >= 3) {
        System.out.println("giving up");
        break;
    }
}
static boolean tryCall(int n) { return n == 2; }
System.out.println("attempts=" + attempt);

// OUTPUT:
// attempts=2`]
    )
};
