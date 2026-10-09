// Core Java overviews, part 1: Basics (keyed by topic id).
import { o, type Overview } from './javaLayout';

export const jo1: Record<string, Overview> = {
    'introduction': o(
        'Java is a high-level, object-oriented, platform-independent programming language. You write code once in a .java file, the compiler turns it into bytecode, and the Java Virtual Machine (JVM) runs that bytecode on any operating system. It is statically typed and class based. The JVM checks the bytecode, interprets it, and then JIT-compiles (Just-In-Time compiles) the busy methods to native code.',
        'You need to know what Java really is before writing bigger programs. Learn the write, compile, run cycle and why one compiled file works on Windows, Linux and Mac. Banks, college portals, railway booking, UPI backends and Android apps run on Java. Every later topic, such as OOPs, collections and Spring, depends on these basics. It also helps you understand JVM problems in production, such as OutOfMemoryError, long GC pauses and NoClassDefFoundError.',
        ['Platform independent: one .class file runs anywhere a JVM exists (write once, run anywhere).', 'Simple and safe: no pointers, no manual memory free, and automatic garbage collection.', 'Huge library and ecosystem: Spring, Hibernate, Kafka, Maven, plus strong tooling such as JFR, jcmd and jstack.', 'Mature JIT and pluggable collectors (G1, ZGC, Shenandoah) bring long-running servers close to native speed.', 'Backward compatible, and a big job market for Java developers.'],
        ['More verbose than Python or Kotlin; even a small task needs a class and a main method.', 'Slower startup and warm-up, so less ideal for short-lived serverless functions.', 'Higher memory use because of object headers and metaspace, and GC pauses or tuning can hurt latency.', 'No low-level hardware control, and generics lose type information at runtime (type erasure).', 'Needs a JVM installed or bundled to run.'],
        ['Java is the base for Spring Boot, microservices and Android development.', 'Interviews for backend roles start with core Java, class loading, JIT and memory areas.', 'Understanding the JVM helps you debug performance and memory problems and explain why the same jar behaves differently on two servers.'],
        ['Java compiles to bytecode, the JVM runs it.', 'Entry point: public static void main(String[] args).', 'Statically typed, object-oriented, garbage collected.', 'LTS versions in use: 8, 11, 17, 21.', 'Platform independence comes from bytecode plus a JVM per platform.']),

    'getting-started': o(
        'Getting started means installing a JDK, setting JAVA_HOME and PATH, choosing an IDE, writing a .java file, compiling it with javac and running it with java. At a professional level it means owning a reproducible toolchain: a pinned JDK version, a build tool (Maven or Gradle), locked dependencies and the same setup on your laptop, the CI server and the production container.',
        'You cannot run even one line of Java without a correct setup, and most beginners lose hours on errors such as javac is not recognized, which is only a PATH problem. You also learn the rule that a public class name must match the file name. In real teams, works on my machine bugs are almost always JDK or classpath mismatches, and audited builds must be reproducible.',
        ['Free and open: OpenJDK costs nothing and works on Windows, Linux and Mac; notepad plus a terminal is enough to learn.', 'One-time setup: once PATH and JAVA_HOME are set, every project uses them.', 'IDEs (IntelliJ IDEA, Eclipse, VS Code) give instant feedback and debugging; Maven and Gradle automate compiling and dependencies.', 'Reproducible builds with a pinned JDK, and javac --release lets one modern JDK build for older runtimes.', 'jlink and jpackage can ship a trimmed custom runtime and containers freeze the whole runtime.'],
        ['PATH and JAVA_HOME mistakes confuse beginners, and several JDKs on one machine can run the wrong javac.', 'Version mismatches cause UnsupportedClassVersionError; upgrading from JDK 8 to 17 breaks removed APIs.', 'Large download, and the two-step compile then run cycle feels slow compared to Python.', 'Vendor differences (Temurin, Corretto, Zulu, Oracle) and classpath ordering bugs where the first jar silently wins.'],
        ['A correct environment saves hours of debugging.', 'The same tools are used in real projects and CI pipelines.', 'You learn the compile, package and run cycle from the start and how to control the classpath yourself.'],
        ['Install a JDK, not only a JRE.', 'Check with java -version and javac -version.', 'Set JAVA_HOME and add bin to PATH.', 'Public class name must match the file name.', 'Compile: javac Hello.java, run: java Hello.']),

    'feautures of java': o(
        'The features of Java, also called Java buzzwords, are simplicity, object orientation, platform independence, security, robustness, portability, multithreading, distributed computing, dynamic behavior and high performance through JIT compilation. At an advanced level they are contracts enforced by the compiler and the JVM: static typing, a specified memory model, verified bytecode and a managed heap, with modern additions such as records, sealed types, pattern matching and virtual threads.',
        'Knowing the features explains why Java is chosen over C or C++ for large systems: banks need security and robustness, mixed teams need platform independence and exam portals need multithreading. It answers the most common interview question (name the features of Java) and helps you defend a technology choice, for example picking virtual threads or sealed types for a given requirement.',
        ['Platform independent and portable: write once, run anywhere.', 'Secure: no pointer arithmetic, bytecode verification and a sandboxed runtime.', 'Robust: strong type checking, exception handling and garbage collection.', 'Built-in multithreading, networking and a rich standard library, with a specified memory model (volatile, final, happens-before).', 'Virtual threads (Java 21), records and sealed types give scalable concurrency and compiler-checked designs.'],
        ['Not purely object-oriented: the eight primitive types are not objects.', 'No operator overloading and no direct hardware access.', 'Slower startup and higher memory use than native code; garbage collection cannot be forced.', 'Type erasure, checked exceptions with lambdas, autoboxing traps and the subtle Java Memory Model need care.'],
        ['It is a basic interview question.', 'It helps you choose the right language and the right feature for a project.', 'Each feature maps to a later topic: OOP, threads, exceptions, collections.'],
        ['Simple, object-oriented, platform independent.', 'Secure: bytecode verification, no pointers.', 'Robust: typing, exceptions, GC.', 'Multithreaded and high performance (JIT).', 'No pointer arithmetic; references only.']),

    'difference between JVM JDK JRE': o(
        'The JVM (Java Virtual Machine) loads, verifies and executes bytecode. The JRE (Java Runtime Environment) is the JVM plus the core class libraries needed to run a program, and the JDK (Java Development Kit) is the JRE plus development tools such as javac, javadoc, jar and jdb. In short, JDK contains JRE and JRE contains JVM; the JVM itself is a specification with implementations such as HotSpot, OpenJ9 and GraalVM.',
        'Developers need the JDK while end users and servers that only run a jar need just the runtime, so you must know what to install. The error javac is not recognized appears when only a JRE is present. Knowing the parts explains platform independence, the compile then run pipeline, and class loading and memory problems such as OutOfMemoryError Metaspace or UnsupportedClassVersionError.',
        ['Clear separation of running and building programs; one JDK ships javac, jar, jshell and more.', 'The JVM hides the operating system (portability), verifies bytecode and frees memory with garbage collection.', 'Specification driven: swap HotSpot for OpenJ9 or GraalVM without code changes.', 'Pluggable collectors (Serial, G1, ZGC) and container awareness since JDK 10.', 'jlink and jpackage build minimal runtime images; JFR, jcmd and jstack give free observability.'],
        ['Three similar names confuse beginners about which package to install.', 'The JVM layer makes Java slower than natively compiled C; bytecode is portable but the JVM is platform specific.', 'Version mismatch: a class compiled on JDK 21 fails on a JDK 17 JVM; modern JDKs no longer ship a separate JRE.', 'Metaspace, thread stacks and direct buffers live outside the heap and are easy to forget when sizing containers.', 'Tuning flags are many and class loader leaks can exhaust metaspace.'],
        ['Helps diagnose version, classpath and class loading errors.', 'Needed to understand memory areas, heap sizing and garbage collection later.', 'Common interview topic, including how to shrink a large runtime image.'],
        ['JDK = JRE + tools; JRE = JVM + libraries.', 'JVM: class loader, runtime data areas, execution engine.', 'javac creates .class bytecode.', 'Bytecode is portable, the JVM is not.', 'HotSpot is the most common JVM.']),

    'data-types': o(
        'A data type tells Java what kind of value a variable can hold and how much memory it needs; Java is statically typed, so the type is declared first and checked by the compiler. There are eight primitive types (byte, short, int, long, float, double, char, boolean) that hold the value directly, and reference types such as String, arrays, classes and enums that hold the address of an object. var is only local type inference, the exact static type is still written into the class file.',
        'Every program starts with variables, and the right type lets the compiler reserve memory, catch mistakes at compile time and decide which operations are legal. A wrong type causes real bugs, such as storing an Aadhaar number in an int or handling money in double, and later topics like arrays, collections and generics all sit on top of types. At scale, choosing int over Integer or BigDecimal over double matters for memory and audits.',
        ['Errors are caught early: the compiler refuses wrong assignments before the code runs, and IDEs can refactor safely.', 'Primitives are fast and memory efficient: no object header, flat cache-friendly arrays, and the JIT can keep them in registers.', 'The type documents the code, for example double gstAmount.', 'Wrapper classes let primitives be used as objects and BigDecimal gives auditable money arithmetic.'],
        ['More typing, although var helps for local variables.', 'Integer overflow is silent and float/double are inexact (0.1 + 0.2), so they are wrong for money.', 'Boxed types such as Integer cost memory, autoboxing creates garbage and unboxing null throws NullPointerException.', 'Generics cannot hold primitives, and BigDecimal is slow and allocation heavy.', 'Default values (0, null) can hide bugs and casting can lose data.'],
        ['Every program uses variables.', 'Understanding types prevents subtle numeric bugs and numeric promotion surprises.', 'Basis for operators, collections and generics, and a favorite interview area (overflow, float equality, Integer cache).'],
        ['8 primitives: byte short int long float double char boolean.', 'Default values: 0, 0.0, false, null.', 'Widening is automatic, narrowing needs a cast.', 'Use BigDecimal for money.', 'Integer cache covers -128 to 127.']),

    'access specifiers': o(
        'An access specifier (access modifier) is a keyword that decides who can see and use a class, field, method or constructor: private (same class only), default with no keyword (same package), protected (same package plus subclasses anywhere) and public (everywhere). The compiler checks them, and since Java 9 the module system adds a second gate so a public type in a non-exported package is unreachable from other modules.',
        'They enforce encapsulation: hiding internals, exposing a small stable API and protecting data such as a bank balance that must change only through deposit and withdraw. Without private fields any class could set invalid values, large teams need clear boundaries, and frameworks such as Spring and Hibernate depend on correct access for proxies and reflection.',
        ['Protects data from invalid changes, with validation in one place (setters or business methods).', 'Allows changing internals without breaking callers, and gives a clear contract of what is public and what is internal.', 'Safer inheritance: protected lets a child extend behavior without opening the class to everyone.', 'A small public surface keeps binary compatibility, and private/final methods can be inlined by the JIT.', 'Modules add strong encapsulation of non-exported packages.'],
        ['More boilerplate: private fields usually need getters and setters.', 'Over-using public silently destroys encapsulation, and protected also exposes members to the whole package.', 'Getters returning mutable lists or arrays still leak internal state.', 'Reflection and serialization can bypass private, so access control is not security; Spring proxies silently skip private or final methods.'],
        ['Core of encapsulation and good design.', 'Used in every class you write and needed to design a maintainable public API.', 'Common interview topic, including the protected rule across packages.'],
        ['private: same class only.', 'default: same package.', 'protected: package + subclasses.', 'public: everywhere.', 'Fields should normally be private.']),

    'operators': o(
        'An operator is a symbol that performs an action on one, two or three operands and produces a value whose type is worked out at compile time. Java has arithmetic, relational, logical, assignment, unary, ternary, bitwise and shift operators, and expressions follow precedence and associativity. Operands are evaluated left to right, binary numeric promotion applies (byte plus short gives int) and compound assignment carries an implicit cast.',
        'Operators do the real work of a program, from a simple total or EMI formula to comparisons that drive if statements and loops, and bitwise operators handle flags in low-level code. Knowing precedence, integer division, == versus equals and short-circuit behavior prevents common bugs such as a GST formula that adds before it multiplies or averages that truncate to zero.',
        ['Very short code: one symbol replaces a method call and formulas read like maths.', 'Fast: arithmetic and bitwise operators compile to one or two machine instructions.', 'Short-circuit operators skip unnecessary work and guard against null errors; ternary and compound assignment keep code compact.', 'Math.addExact and multiplyExact turn silent overflow into ArithmeticException.', 'Bitwise operators give fast low-level control.'],
        ['Precedence surprises; use brackets when unsure.', 'Integer division truncates and overflow is silent.', '== on objects compares addresses, and single &amp; or | do not short-circuit.', 'i++ is not atomic under threads, and floating point == is unreliable (NaN is not equal to itself).', 'Nested ternaries, bit tricks and compound assignment hide casts and hurt readability.'],
        ['Foundation for all calculations and conditions.', 'Frequently tested in aptitude and interview questions (i = i++, ternary NPE).', 'Needed for bit manipulation and algorithms.'],
        ['<code>/</code> on ints truncates; <code>%</code> keeps the sign of the dividend.', '<code>&amp;&amp;</code> and <code>||</code> short-circuit.', '<code>i++</code> returns the old value, <code>++i</code> the new value.', '<code>==</code> compares references for objects.', '<code>&gt;&gt;&gt;</code> is the unsigned right shift.']),

    'Control Statements in Java': o(
        'A control statement decides which line of code runs next. Decision statements are if, if-else, the else-if ladder, nested if and switch, and they always test a boolean condition (if with an int is a compile error). switch compares one value against constant labels and, since Java 14, can be an expression with arrow labels that yields a value; Java 21 adds pattern matching in switch.',
        'Programs must react to data: give a discount above a bill amount, validate a withdrawal against the balance, check a login or pick one path out of many cleanly. Real applications are full of rules such as loan eligibility, and a wrong condition order or missing else is one of the most common business logic bugs.',
        ['Programs become intelligent: the same code gives different results for different data.', 'An else-if ladder reads like the policy it implements, and early return keeps code flat.', 'switch on dense values is faster (tableswitch) and clearer than a chain of equality tests.', 'Switch expressions are exhaustive on enums and sealed types, with no fall through, and pattern matching handles types and guards.'],
        ['Deeply nested ifs and long else-if chains are hard to read and maintain.', 'Old switch statements fall through without break.', 'Condition order matters, and a stray semicolon after if still compiles and always runs the body.', 'Too many branches usually means polymorphism or a map is a better design.', 'A default branch can hide missing cases.'],
        ['Every real program branches.', 'Writing clear conditions is a key skill and a favorite interview test (fall through, dangling else).', 'Basis for validation and business rules.'],
        ['Condition must be boolean.', 'switch works on int, char, String, enum.', 'Missing break causes fall-through.', 'Switch expression uses -> and yields a value.', 'Prefer guard clauses to deep nesting.']),

    'Jumping Statement': o(
        'Jumping statements transfer control: break leaves a loop or switch, continue skips to the next iteration, and return exits a method. Labeled break and continue work on outer loops.',
        'They let loops and methods stop early when the answer is found, saving work and simplifying logic.',
        ['Early exit improves performance and readability.', 'Labeled jumps simplify nested searches.', 'return can end a method anywhere.'],
        ['Overuse makes control flow hard to follow.', 'continue can skip a counter update and cause infinite loops.', 'return in finally hides exceptions.'],
        ['Used in nearly every loop.', 'Helps write efficient search code.', 'Common interview questions on break, continue and finally.'],
        ['break exits the nearest loop or switch.', 'continue goes to the next iteration.', 'Labels target outer loops.', 'Java has no goto.', 'Never return from finally.']),

    'Looping Statements': o(
        'A loop repeats a block of code while a condition stays true; one run of the body is an iteration. Java has for (known count), while (condition first), do-while (at least once) and the enhanced for-each over arrays and collections, each built from initialization, condition and update. Enhanced for over an array compiles to an index loop, over an Iterable to an Iterator, and break and continue control the flow.',
        'Programs repeat work over data sets: printing marks of many students, building totals and averages, searching until found, or asking until the input is valid. Without loops you would copy and paste lines, and every report, bill and search screen is built on a loop. Most production slowness also ends up inside one badly written loop, so complexity matters.',
        ['One loop replaces hundreds of repeated lines and handles ten or ten thousand items unchanged.', 'for-each is simple and safe: no index, so no out-of-bounds errors.', 'break stops a search as soon as the item is found.', 'The JIT optimizes simple loops (unrolling, range check elimination, vectorization) and sequential array access is cache friendly.', 'removeIf and streams can replace hand-written loops.'],
        ['Infinite loops when the update is forgotten, and off-by-one errors (ArrayIndexOutOfBoundsException).', 'for-each gives no index and modifying a collection while looping throws ConcurrentModificationException.', 'Nested loops multiply work (O(n^2)); a LinkedList indexed loop is also O(n^2).', 'Heavy work or boxing inside the loop (database calls, string concatenation) kills performance.'],
        ['Core to algorithms and data processing.', 'Interviews test loop patterns, pattern printing and complexity.', 'Understanding loops helps you choose streams or recursion wisely and iterate safely under concurrency.'],
        ['for: known count; while: condition first; do-while: at least once.', 'for-each reads elements without an index.', 'Use Iterator.remove or removeIf to delete safely.', 'Watch the loop bounds: 0 to length - 1.', 'Avoid floating point loop counters.']),

    'Packages': o(
        'A package is a namespace that groups related classes and interfaces, mapped to a folder structure and declared with the package statement.',
        'Large programs have thousands of classes. Packages prevent name clashes, organize code and control access.',
        ['Avoids naming conflicts.', 'Organizes code by feature or layer.', 'Works with access control (package-private).'],
        ['Wrong package or folder names cause class-not-found errors.', 'Cyclic dependencies between packages harm design.', 'Wildcard imports can hide name clashes.'],
        ['Every real project uses packages.', 'Needed to understand imports, classpath and modules.', 'Spring component scanning depends on packages.'],
        ['package must be the first statement.', 'Names use reverse domain: com.acme.app.', 'import brings classes into scope; java.lang is automatic.', 'Folders must match package names.', 'Fully qualified names resolve clashes.']),

    'Array in java': o(
        'An array is a container object that holds a fixed number of values of the same type in contiguous memory. Each element has an index starting at 0, the size is fixed at creation with new and read through the length field, and elements get default values (0, false, null). Arrays are heap objects with a header and a length, so an array variable holds a reference; they are covariant, and a 2D array is an array of arrays that can be jagged.',
        'Real data comes in groups such as marks of sixty students or twelve monthly sales figures, and an array keeps them under one name and lets you process them in a loop with constant-time access by index. Arrays are the base of matrices, strings, ArrayList, StringBuilder and HashMap, and almost every coding interview starts with an array question, so understanding index bounds avoids ArrayIndexOutOfBoundsException.',
        ['Instant O(1) access by index and a cache-friendly contiguous layout.', 'Low memory overhead: a primitive array has no per-element header and can be vectorized by the JIT.', 'Type safe, simple, and supported by Arrays utilities (sort, parallelSort, fill, copyOf) and fast System.arraycopy.', 'Byte arrays map directly onto buffers, files and network I/O.'],
        ['Fixed size: growing needs a new array and a copy; insert and delete shift elements.', 'No add, remove or contains methods, and index errors appear only at run time.', 'Copying is shallow for object arrays; covariance can cause ArrayStoreException and generic arrays are not allowed.', 'Arrays inherit equals and hashCode from Object, and Arrays.asList is fixed size and backed by the array.'],
        ['Foundation for algorithms and collections.', 'Heavily used in interviews (covariance, clone versus deep copy).', 'Understanding arrays explains how ArrayList grows and why presizing helps.'],
        ['Index from 0 to length - 1.', 'length is a field, not a method.', 'Default values: 0, false, null.', 'Arrays.sort, copyOf, toString, equals.', 'Array copy with clone is shallow.']),

    'arrayprogram': o(
        'Array programs are practice problems such as finding maximum, reversing, searching, sorting, removing duplicates and rotating.',
        'Writing programs is how concepts become skills. These problems appear in coding rounds for freshers.',
        ['Builds problem solving and logic.', 'Teaches complexity thinking (O(n) vs O(n^2)).', 'Reusable patterns: two pointers, prefix sums, sliding window.'],
        ['Edge cases (empty, single element, negatives) are easy to forget.', 'Brute force solutions can be too slow.', 'Memorizing without understanding does not transfer.'],
        ['Frequently asked in written tests.', 'Strengthens loops, conditions and indexing.', 'Prepares for data structures and algorithms.'],
        ['Check for empty arrays first.', 'Max: running maximum; reverse: swap ends.', 'Binary search needs a sorted array.', 'Two pointers solve many problems in O(n).', 'Use long for large sums.']),

    'String in java': o(
        'A String is an immutable object of java.lang.String that holds a sequence of characters; every method that seems to change it returns a new String. Literals created with double quotes go into the String pool (in the heap), so the same literal is stored once, while new always creates a fresh object. Since Java 9 strings use compact storage (LATIN1 or UTF16) and the hash code is cached; StringBuilder and StringBuffer are the mutable alternatives.',
        'Almost every input from a user, file, database or API is text, so Strings store and process names, messages and JSON with ready-made methods to compare, search, split and format. Immutability makes String a safe key for HashMap and switch, but it also brings the famous == versus equals bug and slow concatenation in loops. Interviews always include palindrome, reverse, anagram or character count questions.',
        ['Immutability gives safe sharing, thread safety and security (a checked path cannot change afterward).', 'The String pool saves memory and compact strings halve memory for ASCII text.', 'Cached hash code makes String an ideal fast HashMap key.', 'Rich API (substring, split, replace, format, join) and optimized concatenation through invokedynamic.', 'String deduplication in G1 can shrink heaps without code changes.'],
        ['Every change creates a new object; concatenating in a loop creates garbage and is slow.', 'Using == compares references and gives the wrong answer silently.', 'Passwords in a String linger in memory, so char[] is safer.', 'split uses a regex, bad patterns can backtrack badly, and toUpperCase depends on the locale.', 'Strings take a large share of heap dumps, and intern can slow down at scale.'],
        ['Text processing is everywhere.', 'Frequent interview topic (pool, immutability, StringBuilder, intern).', 'Needed for I/O, parsing, formatting and handling Unicode correctly.'],
        ['Strings are immutable.', 'Compare with equals, not ==.', 'StringBuilder for many appends.', 'Literals are interned in the pool.', 'Use char[] for passwords.']),

    'Contructor in java': o(
        'A constructor is a special member with the class name and no return type that initializes a new object when it is created with new.',
        'Objects must start in a valid state. Constructors guarantee required data is supplied and validated at creation.',
        ['Guarantees initialization.', 'Can be overloaded for different ways to create objects.', 'Supports validation and immutable objects.'],
        ['Many parameters become hard to read (use builders).', 'Not inherited.', 'Calling overridable methods inside is risky.'],
        ['Every object creation uses one.', 'Needed for inheritance, DI and immutability.', 'Common interview questions on default constructor and chaining.'],
        ['Same name as class, no return type.', 'Default constructor only if none is written.', 'this(...) and super(...) must be first.', 'Constructors can be private (singleton, factories).', 'Validate arguments early.']),

    'constructor-chaining': o(
        'Constructor chaining is calling one constructor from another: this(...) within the same class or super(...) to the parent class.',
        'It avoids duplicated initialization code and makes sure parent parts of an object are initialized before the child.',
        ['Single place for initialization logic.', 'Parent state is always initialized first.', 'Keeps constructors short.'],
        ['Long chains are hard to trace.', 'Recursive this() calls fail to compile.', 'Order of initialization can surprise beginners.'],
        ['Required to understand inheritance and object creation.', 'Appears in output-prediction questions.', 'Helps design clean constructors.'],
        ['this(...) calls a constructor of the same class.', 'super(...) calls the parent constructor.', 'Must be the first statement.', 'Implicit super() is added if missing.', 'Order: parent first, then child.']),

    'static-keyword': o(
        'The static keyword makes a member belong to the class instead of any object: static variables, methods, blocks and nested classes.',
        'Some data and behavior is shared by all objects (counters, constants, utilities) and needs no object to use.',
        ['Memory shared by all instances.', 'Utility methods callable without objects.', 'Static blocks run one-time setup.'],
        ['Mutable static state is global state and hurts testing.', 'Static methods cannot use this.', 'Cannot be overridden, only hidden.'],
        ['main is static; constants use static final.', 'Needed for singletons and factories.', 'Common interview topic.'],
        ['Static belongs to the class.', 'Static methods cannot access instance members directly.', 'Static block runs once at class load.', 'Hidden, not overridden.', 'Avoid mutable static state.']),

    'Input and Output Stream in Java': o(
        'Streams move data: InputStream and OutputStream handle bytes, Reader and Writer handle characters. NIO adds Path and Files.',
        'Programs read files, networks and keyboard input and write results. Streams give a uniform way to do it.',
        ['Uniform API for files, network and memory.', 'Buffered streams make I/O fast.', 'Decorator design lets you combine features.'],
        ['Forgetting to close streams leaks resources.', 'Checked IOException everywhere.', 'Wrong charset causes garbled text.'],
        ['Needed for file processing and logging.', 'Foundation for serialization and networking.', 'Used in nearly every real application.'],
        ['Bytes: InputStream/OutputStream; text: Reader/Writer.', 'Always close with try-with-resources.', 'Use buffering.', 'Specify UTF-8.', 'Prefer Files and Path in new code.']),

    'scanner-in-java': o(
        'Scanner reads and parses input from the keyboard, files or strings: nextInt, nextDouble, next and nextLine.',
        'Programs need user input. Scanner is the simplest way for beginners to read it.',
        ['Easy to use.', 'Parses numbers and words directly.', 'Works with files and strings too.'],
        ['Slow for large inputs.', 'nextLine after nextInt gives an empty line.', 'InputMismatchException on bad input.'],
        ['First tool for interactive programs and practice problems.', 'Teaches input validation.', 'Common bug area in tests.'],
        ['next reads a word, nextLine a line.', 'Consume the newline after nextInt.', 'Use hasNextInt to validate.', 'BufferedReader is faster for big input.', 'Close the Scanner when done.']),

    'Serialization in Java': o(
        'Serialization converts an object to a byte stream and deserialization rebuilds it, using Serializable, ObjectOutputStream and ObjectInputStream.',
        'Objects often need to be saved to disk, sent over a network or cached. Serialization turns their state into transferable data.',
        ['Easy persistence of object graphs.', 'Supports sessions and caching.', 'transient excludes sensitive fields.'],
        ['Security risk when deserializing untrusted data.', 'Class changes can break compatibility.', 'Slower and larger than JSON or Protobuf.'],
        ['Needed in legacy and framework code.', 'Teaches object lifecycle and security.', 'Common interview topic (transient, serialVersionUID).'],
        ['Implement Serializable.', 'transient and static fields are skipped.', 'Declare serialVersionUID.', 'Never deserialize untrusted data.', 'Prefer JSON or Protobuf for APIs.']),

    'properties-file': o(
        'A properties file stores configuration as key=value pairs and is loaded with java.util.Properties.',
        'Settings such as database URLs and ports change per environment and should not be hard-coded.',
        ['Externalized configuration without recompiling.', 'Simple text format.', 'Supported by Spring Boot and many libraries.'],
        ['Only flat string values.', 'No type safety.', 'Secrets must not be stored in plain files.'],
        ['Real applications are configured, not hard-coded.', 'Prepares for Spring profiles.', 'Teaches resource loading from the classpath.'],
        ['key=value, # for comments.', 'Load with getResourceAsStream.', 'getProperty(key, default).', 'Values are strings; parse them.', 'Keep secrets out of the repository.']),

    'final-keyword': o(
        'final prevents change: a final variable is assigned once, a final method cannot be overridden and a final class cannot be extended.',
        'Constants, safe APIs and immutable objects rely on final to guarantee that something never changes.',
        ['Clear constants.', 'Protects behavior from overriding.', 'Final fields are safely published to other threads.'],
        ['Final reference does not make the object immutable.', 'final classes cannot be mocked or extended easily.', 'Overuse adds noise.'],
        ['Used for constants and immutable classes.', 'Needed for lambdas (effectively final).', 'Common interview topic (final, finally, finalize).'],
        ['final variable: one assignment.', 'final method: no override.', 'final class: no subclass.', 'Final reference, mutable object is possible.', 'final vs finally vs finalize.']),

    'wrapper-class': o(
        'Wrapper classes (Integer, Double, Boolean, Character and others) wrap primitives as objects, with autoboxing and unboxing between them.',
        'Collections and generics work only with objects, so primitives need object versions with useful methods.',
        ['Allow primitives in collections and generics.', 'Provide utility methods like parseInt and compare.', 'Can represent null (absent value).'],
        ['Boxing costs memory and time.', 'Unboxing null throws NullPointerException.', '== on wrappers can mislead (cache).'],
        ['Used daily with collections.', 'Frequent interview topic (cache, autoboxing).', 'Understanding the cost of boxing improves performance.'],
        ['Autoboxing: int to Integer automatically.', 'Integer cache: -128 to 127.', 'Use equals for wrappers.', 'Unboxing null causes NPE.', 'remove(int) vs remove(Object) on lists.']),

    'methods-in-java': o(
        'A method is a named block of code with parameters and an optional return value, defined inside a class and called to perform an action.',
        'Methods remove duplication and break big problems into small, testable steps.',
        ['Reusability.', 'Modularity and readability.', 'Overloading gives flexible APIs.'],
        ['Too many parameters hurt readability.', 'Long methods are hard to test.', 'Overload resolution can be confusing.'],
        ['All behavior in Java lives in methods.', 'Needed to understand OOP and recursion.', 'Pass-by-value is a favorite interview question.'],
        ['Signature: name + parameters.', 'Java is always pass by value.', 'Overloading: same name, different parameters.', 'Varargs accept many arguments.', 'Keep methods small and focused.']),

    'return-object': o(
        'A method can return an object, for example a new instance, an existing reference or this for chaining.',
        'Methods often produce complex results, not just numbers. Returning objects allows factories, builders and fluent APIs.',
        ['Enables factory methods and builders.', 'Method chaining gives readable code.', 'Records can return several values at once.'],
        ['Returning internal mutable objects breaks encapsulation.', 'Returning null causes NullPointerException.', 'Callers may modify shared objects by mistake.'],
        ['Needed for real-world design patterns.', 'Teaches reference semantics.', 'Common in interview code reading.'],
        ['The return type is the class.', 'The caller gets a reference, not a copy.', 'return this enables chaining.', 'Return empty collections, not null.', 'Use Optional for absent values.']),

    'Different way to return to the method in java.': o(
        'A method can end by a return statement, by throwing an exception or by reaching the end of a void method.',
        'Understanding all exit paths helps you write correct control flow, especially with loops and try-finally.',
        ['Guard clauses simplify logic.', 'Early return avoids deep nesting.', 'Exceptions signal failures clearly.'],
        ['Multiple returns can hide logic if overused.', 'return in finally overrides exceptions.', 'Missing return paths fail to compile.'],
        ['Helps predict program output.', 'Important for exception handling topics.', 'Common interview trap questions.'],
        ['return; exits a void method.', 'Non-void methods must return on every path.', 'Code after return is unreachable.', 'finally runs before the method returns.', 'Lambdas return their expression value.']),

    'this-super': o(
        'this refers to the current object and super refers to the parent class part of it, for fields, methods and constructors.',
        'They resolve name conflicts between parameters and fields and let child classes reuse parent behavior.',
        ['Avoids ambiguity between fields and parameters.', 'Reuses parent methods and constructors.', 'Enables method chaining with return this.'],
        ['Cannot be used in static contexts.', 'Leaking this from a constructor is risky.', 'Field hiding with super.field is confusing.'],
        ['Required for constructors and overriding.', 'Common interview topic.', 'Basis for inheritance understanding.'],
        ['this: current object.', 'super: parent members.', 'this(...) and super(...) are constructor calls and must be first.', 'Not allowed in static methods.', 'Interface.super.method() resolves default conflicts.'])
};
