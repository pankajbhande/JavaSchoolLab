// Core Java extras, part 2 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java02Extras: Record<string, Extra> = {
    'Packages': x(
        ['<b>Package</b>: groups related classes and avoids name clashes. <code>package com.acme.orders;</code> must be the first statement.',
            '<b>Import</b>: use <code>import java.util.List;</code> or <code>import java.util.*;</code>. <code>java.lang</code> is imported automatically.',
            '<b>Folders</b>: package names map to folders, such as <code>com/acme/orders</code>.'],
        ['<b>Naming convention</b>: reverse domain name in lowercase (<code>com.company.project.module</code>).',
            '<b>Static import</b>: <code>import static</code> brings in static members such as <code>Math.max</code>.',
            '<b>Same simple name</b>: use the fully qualified name for one of them (<code>java.util.Date</code> vs <code>java.sql.Date</code>).'],
        ['<b>Organize by feature</b> (orders, payments) rather than by layer only, so related code changes together.',
            '<b>Avoid cycles</b>: cyclic dependencies between packages hurt design; tools like ArchUnit and jdeps can enforce rules.',
            '<b>Modules</b>: <code>module-info.java</code> adds strong encapsulation on top of packages.'],
        [['F', 'What is a package?', 'A namespace that groups related classes and interfaces.'],
            ['F', 'Which package is imported by default?', 'java.lang.'],
            ['M', 'What does import java.util.* do?', 'Makes all public classes of java.util usable by simple name; it does not import sub-packages.'],
            ['M', 'How do you resolve two classes with the same name?', 'Import one and use the fully qualified name for the other.'],
            ['S', 'Package naming convention?', 'Reverse domain name in lowercase, such as com.acme.orders.'],
            ['S', 'Why avoid cyclic package dependencies?', 'They make code hard to understand, test and modularize; enforce rules with ArchUnit.']],
        [['Declaring and using a package.',
            r`// src/com/acme/util/MathUtil.java
package com.acme.util;
public class MathUtil {
    public static int twice(int n) { return n * 2; }
}

// src/com/acme/App.java
package com.acme;
import com.acme.util.MathUtil;
public class App {
    public static void main(String[] a) {
        System.out.println(MathUtil.twice(21));
    }
}

// OUTPUT:
// 42`],
            ['Name clash and static import.',
                r`import static java.lang.Math.max;
java.util.Date u = new java.util.Date(0);
java.sql.Date s = new java.sql.Date(0);
System.out.println(max(3, 9) + " " + (u.getTime() == s.getTime()));

// OUTPUT:
// 9 true`]],
        [['Compile with packages.',
            r`// javac -d out src/com/acme/util/MathUtil.java src/com/acme/App.java
// java -cp out com.acme.App

// OUTPUT:
// 42`],
            ['Wildcard imports do not recurse.',
                r`import java.util.*;           // List, Map ...
// import java.util.concurrent.* is needed separately for ExecutorService

// OUTPUT:
// compile error if a concurrent class is used without its own import`]]
    ),

    'Array in java': x(
        ['<b>Fixed size, one type:</b> <code>int[] a = new int[5];</code> or <code>int[] a = {1, 2, 3};</code>.',
            '<b>Index</b> starts at 0; <code>a.length</code> gives the size (a field, not a method).',
            '<b>Bad index</b> (negative or at least length) throws <code>ArrayIndexOutOfBoundsException</code>.'],
        ['<b>Default values:</b> 0, 0.0, false, null. Arrays are objects stored on the heap.',
            '<b>2D arrays</b> are arrays of arrays, and rows can have different lengths (jagged).',
            '<b>Helpers:</b> <code>Arrays.toString</code>, <code>sort</code>, <code>fill</code>, <code>copyOf</code>, <code>equals</code>, <code>binarySearch</code>, <code>asList</code>.'],
        ['<b>Covariance:</b> <code>Object[] o = new String[1]</code> compiles but can throw <code>ArrayStoreException</code> at run time; generics are invariant.',
            '<b>Copies:</b> <code>clone()</code> and <code>Arrays.copyOf</code> are shallow, so object elements are shared.',
            '<b>Choice:</b> prefer collections for changing data; arrays suit fixed-size, performance-critical or primitive data.'],
        [['F', 'How do you find the length of an array?', 'array.length (a field).'],
            ['F', 'What is the default value of an int array element?', 'Zero (0).'],
            ['M', 'Array vs ArrayList?', 'Arrays are fixed size and can hold primitives; ArrayList is resizable, holds objects and offers more methods.'],
            ['M', 'What is a jagged array?', 'A 2D array whose rows have different lengths.'],
            ['S', 'What is ArrayStoreException?', 'Thrown when storing an incompatible type into an array through a covariant reference.'],
            ['S', 'Is array copy deep or shallow?', 'Shallow: object elements are shared between original and copy.']],
        [['Common array operations.',
            r`int[] a = {5, 3, 9, 1};
Arrays.sort(a);
int[] b = Arrays.copyOf(a, 6);
System.out.println(Arrays.toString(a) + " " + Arrays.toString(b));
System.out.println(Arrays.binarySearch(a, 5));
System.out.println(Arrays.stream(a).sum());

// OUTPUT:
// [1, 3, 5, 9] [1, 3, 5, 9, 0, 0]
// 2
// 18`],
            ['Jagged 2D array (Pascal triangle).',
                r`int[][] tri = new int[4][];
for (int i = 0; i < tri.length; i++) {
    tri[i] = new int[i + 1];
    tri[i][0] = tri[i][i] = 1;
    for (int j = 1; j < i; j++) {
        tri[i][j] = tri[i - 1][j - 1] + tri[i - 1][j];
    }
}
System.out.println(Arrays.deepToString(tri));

// OUTPUT:
// [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]]`]],
        [['Shallow copy trap.',
            r`int[][] m = {{1, 2}, {3, 4}};
int[][] c = m.clone();
c[0][0] = 99;
System.out.println(m[0][0] + " " + Arrays.deepToString(c));

// OUTPUT:
// 99 [[99, 2], [3, 4]]`],
            ['ArrayStoreException.',
                r`Object[] o = new String[2];
try {
    o[0] = 1;
} catch (ArrayStoreException e) {
    System.out.println("ArrayStoreException " + e.getMessage());
}

// OUTPUT:
// ArrayStoreException java.lang.Integer`]]
    ),

    'arrayprogram': x(
        ['<b>Typical programs</b>: find max/min, sum and average, reverse, search, sort and remove duplicates.',
            '<b>Loop choice</b>: use an index loop to change elements and <code>for-each</code> to only read them.',
            '<b>Empty array</b>: always check <code>length</code> before taking max or min.'],
        ['<b>Linear search</b> is O(n); <b>binary search</b> needs sorted data and is O(log n).',
            '<b>In-place reverse</b>: swap with two indexes moving in from both ends.',
            '<b>Two pointers</b> and <b>prefix sums</b> solve many problems in O(n).'],
        ['<b>Complexity and memory</b>: in-place algorithms use O(1) extra space.',
            '<b>Streams vs loops</b>: use streams for readability (<code>IntStream.of(a).max()</code>) and loops for hot paths.',
            '<b>Edge cases</b>: empty, single element, duplicates, negative numbers, overflow.'],
        [['F', 'How do you find the largest element?', 'Keep a running max while looping through the array.'],
            ['F', 'How do you reverse an array in place?', 'Swap elements from both ends moving toward the middle.'],
            ['M', 'Binary search requirement?', 'The array must be sorted.'],
            ['M', 'How do you remove duplicates from a sorted array in place?', 'Use two pointers: write index and read index, keeping the first of each value.'],
            ['S', 'How do you find the second largest in one pass?', 'Track largest and second largest while scanning once.'],
            ['S', 'Find a missing number from 1..n in O(n)?', 'Compare the expected sum n(n+1)/2 with the actual sum, or use XOR.']],
        [['Max, reverse and second largest.',
            r`int[] a = {4, 9, 2, 9, 7};
int max = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
for (int v : a) {
    if (v > max) {
        second = max;
        max = v;
    }
    else if (v > second && v < max) second = v;
}
for (int i = 0, j = a.length - 1; i < j; i++, j--) {   // swap the ends
    int t = a[i];
    a[i] = a[j];
    a[j] = t;
}
System.out.println(max + " " + second + " " + Arrays.toString(a));

// OUTPUT:
// 9 7 [7, 9, 2, 9, 4]`],
            ['Remove duplicates in a sorted array.',
                r`int[] s = {1, 1, 2, 2, 2, 3};
int w = 1;
for (int i = 1; i < s.length; i++) {
    if (s[i] != s[w - 1]) s[w++] = s[i];   // keep first of each value
}
System.out.println(w + " " + Arrays.toString(Arrays.copyOf(s, w)));

// OUTPUT:
// 3 [1, 2, 3]`]],
        [['Missing number with sum.',
            r`int[] a = {1, 2, 4, 5};
int n = 5, expected = n * (n + 1) / 2, actual = Arrays.stream(a).sum();
System.out.println(expected - actual);

// OUTPUT:
// 3`],
            ['Rotate right by k.',
                r`int[] a = {1, 2, 3, 4, 5};
int k = 2, n = a.length;
int[] r = new int[n];
for (int i = 0; i < n; i++) r[(i + k) % n] = a[i];
System.out.println(Arrays.toString(r));

// OUTPUT:
// [4, 5, 1, 2, 3]`]]
    ),

    'String in java': x(
        ['<b>Immutable</b>: a <code>String</code> is a sequence of characters that never changes; every change creates a new String.',
            '<b>String pool</b>: literals are stored once, so <code>"hi" == "hi"</code> is true, but <code>new String("hi") == "hi"</code> is false.',
            '<b>Comparing</b>: use <code>equals</code> or <code>equalsIgnoreCase</code> for content, never ==.'],
        ['<b>Common methods</b>: <code>length, charAt, substring, indexOf, contains, replace, split, trim, strip, toUpperCase, isBlank, repeat, join</code>.',
            '<b>Many appends</b>: use <code>StringBuilder</code>; <code>StringBuffer</code> is the synchronized legacy version.',
            '<b>Text blocks</b> (Java 15) hold multi-line text: <code>"""..."""</code>.'],
        ['<b>Thread safety</b>: immutability makes Strings safe to share, cacheable (hash code) and safe as map keys.',
            '<b>Interning</b>: <code>intern()</code> adds a String to the pool; use it sparingly.',
            '<b>Unicode</b>: Strings are UTF-16, so use <code>codePoints()</code> for characters outside the BMP (emoji).',
            '<b>Passwords</b>: sensitive data belongs in <code>char[]</code>, which you can wipe.'],
        [['F', 'Why are Strings immutable?', 'For security, thread safety, caching of hash codes and the string pool.'],
            ['F', '== vs equals for Strings?', '== compares references, equals compares content.'],
            ['M', 'String vs StringBuilder vs StringBuffer?', 'String is immutable; StringBuilder is mutable and fast; StringBuffer is mutable and synchronized.'],
            ['M', 'What is the string pool?', 'A cache of string literals so identical literals share one object.'],
            ['S', 'Why use char[] for passwords?', 'A char[] can be wiped after use, while Strings stay in memory until garbage collected.'],
            ['S', 'How many objects does new String("a") create?', 'One on the heap, plus the literal "a" in the pool if it was not already there.']],
        [['Pool vs heap.',
            r`String a = "java", b = "java", c = new String("java");
System.out.println((a == b) + " " + (a == c) + " " + a.equals(c) + " " + (a == c.intern()));

// OUTPUT:
// true false true true`],
            ['Everyday methods.',
                r`String s = "  Hello, Java World  ";
System.out.println(s.strip().toUpperCase());
System.out.println(s.trim().split(",\\s*").length);
System.out.println("ab".repeat(3) + " " + String.join("-", "a", "b", "c"));
System.out.println("  ".isBlank());

// OUTPUT:
// HELLO, JAVA WORLD
// 2
// ababab a-b-c
// true`]],
        [['Immutability.',
            r`String s = "abc";
s.toUpperCase();                  // result ignored
String t = s.toUpperCase();
System.out.println(s + " " + t);

// OUTPUT:
// abc ABC`],
            ['Palindrome and reverse.',
                r`String w = "level";
System.out.println(new StringBuilder(w).reverse().toString().equals(w));

// OUTPUT:
// true`]]
    ),

    'Contructor in java': x(
        ['<b>Constructor</b>: initializes a new object. It has the class name and no return type: <code>public Student(String name) { this.name = name; }</code>.',
            '<b>Default constructor</b>: if you write none, the compiler adds a no-argument one; once you write one, it does not.',
            '<b>When it runs</b>: every time you use <code>new</code>.'],
        ['<b>Overloading</b>: a class can have many constructors with different parameters, and they can be <code>private</code> (singleton, factory).',
            '<b>Chaining</b>: use <code>this(...)</code> to call another constructor in the same class and <code>super(...)</code> to call the parent one. It must be the first statement.',
            '<b>Not inherited</b>: constructors cannot be <code>abstract</code>, <code>static</code> or <code>final</code>.'],
        ['<b>Validation</b>: check arguments in constructors and keep objects valid from creation; prefer immutable objects with <code>final</code> fields.',
            '<b>Many parameters</b>: use a builder or static factory methods.',
            '<b>Overridable calls</b>: do not call them from constructors, because the subclass fields are not initialized yet.'],
        [['F', 'What is a constructor?', 'A special method that initializes a new object, with the class name and no return type.'],
            ['F', 'Is there a default constructor?', 'Yes, if you declare none; the compiler provides a no-argument one.'],
            ['M', 'Can a constructor be private?', 'Yes, for singletons, factory methods and utility classes.'],
            ['M', 'Constructor vs method?', 'A constructor has no return type, runs on object creation and is not inherited.'],
            ['S', 'Why not call overridable methods in a constructor?', 'The overriding method may run before the subclass fields are initialized, giving wrong values.'],
            ['S', 'When use a builder instead of constructors?', 'When there are many optional parameters, to improve readability and avoid telescoping constructors.']],
        [['Overloaded constructors and validation.',
            r`class Student {
    private final String name;
    private final int age;

    Student(String name) { this(name, 18); }

    Student(String name, int age) {
        if (age < 0) throw new IllegalArgumentException("age");
        this.name = Objects.requireNonNull(name);
        this.age = age;
    }

    public String toString() { return name + "(" + age + ")"; }
}
System.out.println(new Student("Abaji") + " " + new Student("Raoji", 21));

// OUTPUT:
// Abaji(18) Raoji(21)`],
            ['Static factory.',
                r`class Fort {
    private final String name;
    private final String district;

    private Fort(String name, String district) {
        this.name = name;
        this.district = district;
    }

    static Fort of(String name, String district) { return new Fort(name, district); }
    static Fort inPune(String name) { return new Fort(name, "Pune"); }

    public String toString() { return name + " (" + district + ")"; }
}
System.out.println(Fort.inPune("Rajgad") + " " + Fort.of("Pratapgad", "Satara"));

// OUTPUT:
// Rajgad (Pune) Pratapgad (Satara)`]],
        [['Overridable call trap.',
            r`class Base {
    Base() { init(); }
    void init() {}
}
class Child extends Base {
    String s = "ready";
    void init() { System.out.println(s); }
}
new Child();

// OUTPUT:
// null`],
            ['Default constructor disappears.',
                r`class P {
    P(int x) {}
}
// new P();      // error: constructor P in class P cannot be applied to given types

// OUTPUT:
// compile-time error`]]
    ),

    'constructor-chaining': x(
        ['<b>Chaining</b> is one constructor calling another: <code>this(...)</code> in the same class, <code>super(...)</code> in the parent.',
            '<b>First statement:</b> the <code>this(...)</code> or <code>super(...)</code> call must be the first statement of the constructor.',
            '<b>Implicit call:</b> if you do not write <code>super(...)</code>, the compiler inserts <code>super()</code>.'],
        ['<b>Parent first:</b> the parent constructor runs before the child body, so objects are built from the top of the hierarchy down.',
            '<b>Main constructor:</b> chain to one "main" constructor so initialization logic lives in one place.',
            '<b>Recursion:</b> circular <code>this(...)</code> calls cause a compile error.'],
        ['<b>Initialization order:</b> static blocks run once per class. Then, for each object: parent field initializers and instance blocks, parent constructor, child field initializers and instance blocks, child constructor.',
            '<b>No no-arg parent:</b> if the parent has no no-arg constructor, the child must call <code>super(args)</code> explicitly.',
            '<b>Newer Java:</b> Java 22 added statements before <code>super()</code> as a preview feature (they must not use <code>this</code>). It is final in Java 25.'],
        [['F', 'What is constructor chaining?', 'A constructor calling another constructor of the same class (this) or the parent (super).'],
            ['F', 'Where must this() or super() appear?', 'As the first statement in the constructor.'],
            ['M', 'What happens if you do not call super()?', 'The compiler adds an implicit super() call to the no-argument parent constructor.'],
            ['M', 'Can you use both this() and super() in one constructor?', 'No, each constructor can use only one of them as its first statement.'],
            ['S', 'What is the order of initialization?', 'Static initializers, then parent instance initializers and constructor, then child instance initializers and constructor.'],
            ['S', 'What if the parent has only a parameterized constructor?', 'The child must call it explicitly with super(args), otherwise compilation fails.']],
        [['Chaining and order.',
            r`class A {
    A() { System.out.println("A()"); }
}
class B extends A {
    B() {
        this(5);
        System.out.println("B()");
    }
    B(int x) {
        super();
        System.out.println("B(int)");
    }
}
new B();

// OUTPUT:
// A()
// B(int)
// B()`],
            ['Initialization order.',
                r`class P {
    static { System.out.println("P static"); }
    { System.out.println("P block"); }
    P() { System.out.println("P()"); }
}
class C extends P {
    static { System.out.println("C static"); }
    { System.out.println("C block"); }
    C() { System.out.println("C()"); }
}
new C();

// OUTPUT:
// P static
// C static
// P block
// P()
// C block
// C()`]],
        [['Explicit super needed.',
            r`class Vehicle {
    Vehicle(String n) {}
}
class Car extends Vehicle {
    Car() { super("car"); }
}
// class Bike extends Vehicle { }
// error: constructor Vehicle in class Vehicle cannot be applied to given types

// OUTPUT:
// Bike does not compile`],
            ['Central constructor.',
                r`class Pt {
    final int x, y;
    Pt() { this(0, 0); }
    Pt(int x) { this(x, 0); }
    Pt(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
System.out.println(new Pt(3).y);

// OUTPUT:
// 0`]]
    ),

    'static-keyword': x(
        ['<b>Class-level members:</b> <code>static</code> members belong to the class, not to any object. They are shared by all instances and used as <code>ClassName.member</code>.',
            '<b>Uses:</b> static variables (shared counters, constants), static methods (utilities like <code>Math.max</code>) and static blocks (one-time setup).',
            '<b>Static main:</b> <code>main</code> is static so the JVM can call it without creating an object.'],
        ['<b>No this:</b> a static method cannot use <code>this</code> or access instance members directly.',
            '<b>Hiding:</b> static methods are hidden, not overridden, in subclasses.',
            '<b>Constants and nesting:</b> <code>static final</code> creates constants; a static nested class does not need an outer instance.'],
        ['<b>Global state:</b> mutable static state hurts testing and thread safety. Prefer dependency injection.',
            '<b>Initialization:</b> order matters. Class initialization is lazy and thread-safe, which is the basis of the <b>holder idiom</b> for singletons.',
            '<b>Utility classes:</b> static imports and utility classes are fine for pure functions; avoid static for things with state or I/O.'],
        [['F', 'What does static mean?', 'The member belongs to the class and is shared by all objects.'],
            ['F', 'Can a static method use instance variables?', 'Not directly; it needs an object reference.'],
            ['M', 'Why is main static?', 'So the JVM can call it without creating an instance.'],
            ['M', 'Can static methods be overridden?', 'No, they are hidden; the method called depends on the reference type.'],
            ['S', 'Why is static mutable state a problem?', 'It is shared globally, making tests order-dependent and code thread-unsafe.'],
            ['S', 'What is the initialization-on-demand holder idiom?', 'A lazy, thread-safe singleton using a static nested class whose initialization happens on first access.']],
        [['Shared counter and utility.',
            r`class Counter {
    static int created = 0;
    final int id;
    Counter() { id = ++created; }
    static String describe() { return created + " objects"; }
}
new Counter();
new Counter();
System.out.println(Counter.describe() + " last id=" + new Counter().id);

// OUTPUT:
// 2 objects last id=3`],
            ['Holder singleton.',
                r`class Config {
    private Config() {}
    private static class Holder { static final Config INSTANCE = new Config(); }
    static Config get() { return Holder.INSTANCE; }
}
System.out.println(Config.get() == Config.get());

// OUTPUT:
// true`]],
        [['Static method hiding.',
            r`class A {
    static String who() { return "A"; }
}
class B extends A {
    static String who() { return "B"; }
}
A ref = new B();
System.out.println(ref.who() + " " + B.who());

// OUTPUT:
// A B`],
            ['Static block order.',
                r`class S {
    static int x;
    static {
        x = 10;
        System.out.println("static block");
    }
}
System.out.println("before");
System.out.println(S.x);

// OUTPUT:
// before
// static block
// 10`]]
    ),

    'Input and Output Stream in Java': x(
        ['<b>Streams</b> move data: <code>InputStream</code> and <code>OutputStream</code> handle bytes; <code>Reader</code> and <code>Writer</code> handle characters.',
            '<b>Standard streams</b>: <code>System.in</code>, <code>System.out</code> and <code>System.err</code>.',
            '<b>Closing</b>: always close streams, best with try-with-resources.'],
        ['<b>Common classes</b>: <code>FileInputStream</code>, <code>FileOutputStream</code>, <code>BufferedReader</code>, <code>BufferedWriter</code>, <code>PrintWriter</code>.',
            '<b>Buffered wrappers</b> read and write in chunks, which is much faster than byte by byte.',
            '<b>Charset</b>: pass <code>StandardCharsets.UTF_8</code> to avoid platform-dependent text.'],
        ['<b>NIO</b>: prefer <code>java.nio.file.Files</code> and <code>Path</code>, for example <code>Files.readAllLines</code>, <code>Files.lines</code>, <code>Files.writeString</code>, <code>Files.copy</code>.',
            '<b>Large files</b>: read line by line; do not load the whole file into memory.',
            '<b>Decorator pattern</b>: streams wrap other streams, as in <code>new BufferedReader(new InputStreamReader(in))</code>.'],
        [['F', 'Byte stream vs character stream?', 'Byte streams handle raw bytes; character streams handle text with encoding.'],
            ['F', 'Why close streams?', 'To release file handles and flush buffered data.'],
            ['M', 'Why use buffered streams?', 'They reduce expensive I/O calls by reading and writing in blocks.'],
            ['M', 'How do you read a file line by line?', 'BufferedReader.readLine in try-with-resources, or Files.lines.'],
            ['S', 'Why specify a charset?', 'The default charset varies by platform, so text may be decoded incorrectly.'],
            ['S', 'How do you process a 5 GB file?', 'Stream it with Files.lines or a BufferedReader and process each line without loading everything.']],
        [['Copy a file with try-with-resources.',
            r`try (InputStream in = new BufferedInputStream(new FileInputStream("in.bin"));
     OutputStream out = new BufferedOutputStream(new FileOutputStream("out.bin"))) {
    byte[] buf = new byte[8192];
    int n;
    while ((n = in.read(buf)) != -1) {
        out.write(buf, 0, n);              // write only the bytes read
    }
}

// OUTPUT:
// out.bin is an exact copy of in.bin`],
            ['Text with NIO.',
                r`Path p = Path.of("notes.txt");
Files.writeString(p, "line1\nline2\n", StandardCharsets.UTF_8);
try (Stream<String> lines = Files.lines(p)) {
    System.out.println(lines.filter(l -> l.endsWith("2")).toList());
}

// OUTPUT:
// [line2]`]],
        [['Reading console input.',
            r`BufferedReader br = new BufferedReader(
        new InputStreamReader(System.in, StandardCharsets.UTF_8));
String name = br.readLine();
System.out.println("Hi " + name);

// OUTPUT: (input: Abaji)
// Hi Abaji`],
            ['Append to a file.',
                r`try (PrintWriter pw = new PrintWriter(new FileWriter("log.txt", true))) {
    pw.println("started");                 // true = append mode
}

// OUTPUT:
// "started" is appended as a new line`]]
    ),

    'scanner-in-java': x(
        ['<b>Create it:</b> <code>Scanner sc = new Scanner(System.in);</code> reads and parses input from the keyboard, files or strings.',
            '<b>Common methods:</b> <code>nextInt</code>, <code>nextDouble</code>, <code>next</code>, <code>nextLine</code>, <code>hasNext</code>, <code>hasNextInt</code>.',
            '<b>Closing:</b> close it when done, but not if <code>System.in</code> is still needed elsewhere.'],
        ['<b>Newline pitfall:</b> after <code>nextInt()</code> the newline stays in the buffer, so a following <code>nextLine()</code> returns an empty line. Call <code>nextLine()</code> once to consume it.',
            '<b>Word vs line:</b> <code>next()</code> reads a word; <code>nextLine()</code> reads the whole line.',
            '<b>Bad input:</b> avoid <code>InputMismatchException</code> by checking <code>hasNextInt()</code> first.'],
        ['<b>Speed:</b> Scanner is slow for large input (it uses regex); use <code>BufferedReader</code> with <code>StringTokenizer</code> for competitive programming.',
            '<b>Sources and delimiters:</b> it can read a File or String and split on custom delimiters, e.g. <code>useDelimiter(",")</code>.',
            '<b>Locale:</b> it affects number parsing; set <code>Locale.US</code> for consistent decimals.'],
        [['F', 'What is Scanner used for?', 'To read and parse input from console, files or strings.'],
            ['F', 'next() vs nextLine()?', 'next reads a single token (word); nextLine reads the rest of the line.'],
            ['M', 'Why does nextLine() sometimes skip input after nextInt()?', 'nextInt leaves the newline in the buffer, so nextLine reads the empty remainder.'],
            ['M', 'How do you avoid InputMismatchException?', 'Check hasNextInt before reading, or read a line and parse with try-catch.'],
            ['S', 'Why is Scanner slow for big inputs?', 'It uses regular expressions and has overhead per token; BufferedReader is much faster.'],
            ['S', 'How do you read a CSV line with Scanner?', 'Use a Scanner on the line with useDelimiter(",") or split the line.']],
        [['Validated integer input.',
            r`Scanner sc = new Scanner(System.in);
System.out.print("Age: ");
while (!sc.hasNextInt()) {
    System.out.print("Enter a number: ");
    sc.next();                // skip the bad token
}
int age = sc.nextInt();
sc.nextLine();                // consume newline
System.out.print("Name: ");
String name = sc.nextLine();
System.out.println(name + " " + age);

// OUTPUT: (input: abc, 25, Abaji Rao)
// Age: Enter a number: Name: Abaji Rao 25`],
            ['Scan a string with delimiters.',
                r`Scanner s = new Scanner("10,20,30").useDelimiter(",");
int sum = 0;
while (s.hasNextInt()) sum += s.nextInt();
System.out.println(sum);

// OUTPUT:
// 60`]],
        [['The newline trap.',
            r`Scanner sc = new Scanner("5\nhello\n");
int n = sc.nextInt();
String wrong = sc.nextLine();       // empty
String right = sc.nextLine();
System.out.println("[" + wrong + "] [" + right + "]");

// OUTPUT:
// [] [hello]`],
            ['Fast reader.',
                r`BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
StringTokenizer st = new StringTokenizer(br.readLine());
int a = Integer.parseInt(st.nextToken());
int b = Integer.parseInt(st.nextToken());
System.out.println(a + b);

// OUTPUT: (input: 3 4)
// 7`]]
    )
};

export const java02Deep: Record<string, Deep> = {
    'Packages': dv(
        [`At run time a class is identified by its package, its simple name and its class loader. The compiler resolves a simple name in this order: local scope, class members, single-type imports, the same package, on-demand imports, then java.lang. Package-private access depends on the runtime package, so the same package name in two class loaders is two different runtime packages.`,
            r`// Assume Main is declared in package com.acme
System.out.println(String.class.getPackageName());
System.out.println(java.util.List.class.getName());
System.out.println(Main.class.getPackage());

// OUTPUT:
// java.lang
// java.util.List
// package com.acme`],
        [`Layout best practice: one top-level class per file, folders matching packages, a base package per module, sub-packages by feature (<code>orders.api</code>, <code>orders.internal</code>), tests in the same packages under <code>src/test/java</code>. <code>package-info.java</code> holds package docs and annotations. Split packages across modules are not allowed in JPMS.`,
            r`// src/main/java/com/acme/orders/api/OrderService.java
// src/main/java/com/acme/orders/internal/OrderRepository.java
// src/test/java/com/acme/orders/api/OrderServiceTest.java
// package-info.java:   /** Order management API. */ package com.acme.orders.api;

// OUTPUT:
// tests can access package-private members of the classes they test`],
        [`Mistakes: package statement not matching the directory (class not found), unused wildcard imports hiding name clashes, circular dependencies between packages, the default (unnamed) package in real projects, and duplicate classes on the class path (the first one wins).`,
            r`// file is in src/com/acme/App.java but declares: package com.other;
// java -cp out com.acme.App
// Error: Could not find or load main class com.acme.App
// Caused by: java.lang.NoClassDefFoundError:
//     com/other/App (wrong name: com/acme/App)

// OUTPUT:
// the package declaration and the folder must agree`],
        [`Large package graphs slow comprehension more than the JVM. Use jdeps to inspect dependencies and ArchUnit tests to forbid cycles and layer violations.`,
            r`// jdeps -verbose:package -cp out out
// ArchRule rule = slices().matching("com.acme.(*)..")
//         .should().beFreeOfCycles();

// OUTPUT:
// the build fails if two feature packages depend on each other`],
        [`Real-world: a Spring Boot app uses base package scanning. Placing the main class in the root package (com.acme) lets component scanning find everything below it.`,
            r`@SpringBootApplication       // scans com.acme and sub-packages
public class App {
    public static void main(String[] a) {
        SpringApplication.run(App.class, a);
    }
}

// OUTPUT:
// beans in com.acme.orders and com.acme.payments are found automatically`]
    ),

    'Array in java': dv(
        [`An array is an object with a length field and contiguous elements (references for object arrays, values for primitives). Bounds are checked on every access (the JIT removes redundant checks). Multidimensional arrays are arrays of references to arrays, so memory is not one contiguous block. Large arrays can be allocated directly in the old generation.`,
            r`int[][] m = new int[3][4];
System.out.println(m.length + " " + m[0].length);
System.out.println(m.getClass().getSimpleName());
System.out.println(new int[0].getClass().getName());
long[] big = new long[1_000_000];            // about 8 MB of contiguous memory
System.out.println(big.length);

// OUTPUT:
// 3 4
// int[][]
// [I
// 1000000`],
        [`Utilities: <code>Arrays.sort</code> (dual-pivot quicksort for primitives, TimSort for objects), <code>parallelSort</code>, <code>Arrays.fill</code>, <code>setAll</code>, <code>mismatch</code>, <code>compare</code>, <code>asList</code> (fixed-size view), <code>stream</code>, <code>System.arraycopy</code>. Varargs are arrays too.`,
            r`int[] a = new int[5];
Arrays.setAll(a, i -> i * i);
int[] b = new int[5];
System.arraycopy(a, 1, b, 0, 4);
System.out.println(Arrays.toString(a) + " " + Arrays.toString(b));
System.out.println(Arrays.mismatch(a, b) + " " + Arrays.equals(a, a.clone()));
Integer[] boxed = {3, 1, 2};
Arrays.sort(boxed, Collections.reverseOrder());
System.out.println(Arrays.toString(boxed));

// OUTPUT:
// [0, 1, 4, 9, 16] [1, 4, 9, 16, 0]
// 0 true
// [3, 2, 1]`],
        [`Mistakes: off-by-one with length, using == or equals on arrays (use Arrays.equals), printing an array directly (type and hash), Arrays.asList on int[] (list of one array), modifying through Arrays.asList then adding, and shallow clone of 2D arrays.`,
            r`int[] a = {1, 2}, b = {1, 2};
System.out.println((a == b) + " " + a.equals(b) + " " + Arrays.equals(a, b));
System.out.println(Arrays.asList(a).size() + " " + Arrays.asList(1, 2).size());

// OUTPUT:
// false false true
// 1 2`],
        [`Arrays give the best cache locality. Row-major traversal is faster than column-major for 2D arrays; avoid allocating in loops; reuse buffers; use System.arraycopy for bulk copies.`,
            r`int n = 4000;
int[][] g = new int[n][n];
long s = 0;

long t = System.nanoTime();
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) s += g[i][j];      // row by row
long row = System.nanoTime() - t;

t = System.nanoTime();
for (int j = 0; j < n; j++)
    for (int i = 0; i < n; i++) s += g[i][j];      // column by column
long col = System.nanoTime() - t;

System.out.println("row ms=" + row / 1_000_000
        + " col ms=" + col / 1_000_000);

// OUTPUT: (varies)
// row ms=15 col ms=110`],
        [`Real-world: image pixels, sensor buffers, lookup tables, dynamic programming tables, and fixed-size ring buffers.`,
            r`class Ring {
    final int[] buf;
    int head, size;

    Ring(int cap) { buf = new int[cap]; }

    void add(int v) {
        buf[(head + size) % buf.length] = v;
        if (size < buf.length) size++;                 // still filling
        else head = (head + 1) % buf.length;           // overwrite the oldest
    }

    public String toString() {
        return IntStream.range(0, size)
                .mapToObj(i -> "" + buf[(head + i) % buf.length])
                .toList().toString();
    }
}
Ring r = new Ring(3);
for (int i = 1; i <= 5; i++) r.add(i);
System.out.println(r);

// OUTPUT:
// [3, 4, 5]`]
    ),

    'arrayprogram': dv(
        [`Core techniques: single pass accumulation, two pointers (sorted arrays, partitioning), sliding window (subarrays of fixed or variable length), prefix sums (range queries), and Kadane algorithm (maximum subarray). Each turns an O(n^2) brute force into O(n).`,
            r`static int maxSubarray(int[] a) {
    int best = a[0], cur = a[0];
    for (int i = 1; i < a.length; i++) {
        cur = Math.max(a[i], cur + a[i]);   // extend or restart
        best = Math.max(best, cur);
    }
    return best;
}
System.out.println(maxSubarray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}));

// OUTPUT:
// 6`],
        [`Prefix sums answer range sums in O(1) after O(n) setup; sliding window finds the best fixed-size window; two sum on sorted data uses two pointers; hashing finds pairs in unsorted data in O(n). Choose the structure from constraints.`,
            r`int[] a = {2, 1, 5, 1, 3, 2};
int k = 3;
int win = 0, best = 0;
for (int i = 0; i < a.length; i++) {
    win += a[i];
    if (i >= k) win -= a[i - k];                 // drop the oldest element
    if (i >= k - 1) best = Math.max(best, win);
}
int[] pre = new int[a.length + 1];               // prefix sums
for (int i = 0; i < a.length; i++) pre[i + 1] = pre[i] + a[i];
System.out.println(best + " " + (pre[5] - pre[2]));   // sum of a[2..4]

// OUTPUT:
// 9 12`],
        [`Mistakes: initializing max with 0 (wrong for negatives), not handling empty arrays, modifying while iterating indexes, integer overflow in sums (use long), and mid = (lo + hi) / 2 overflow (use <code>lo + (hi - lo) / 2</code>).`,
            r`int[] neg = {-5, -2, -9};
int wrong = 0;                       // bad start value
for (int v : neg) wrong = Math.max(wrong, v);
int right = Integer.MIN_VALUE;       // good start value
for (int v : neg) right = Math.max(right, v);
System.out.println(wrong + " " + right);
int lo = 1_500_000_000, hi = 2_000_000_000;
System.out.println(((lo + hi) / 2) + " " + (lo + (hi - lo) / 2));

// OUTPUT:
// 0 -2
// -397483648 1750000000`],
        [`Big-O summary: scan O(n), binary search O(log n), sort O(n log n), nested loops O(n^2). For n = 10^6 an O(n^2) approach is far too slow; prefer hashing or sorting. Use primitive arrays for speed.`,
            r`static int binarySearch(int[] a, int t) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;   // safe midpoint
        if (a[mid] == t) return mid;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9}, 7));

// OUTPUT:
// 3`],
        [`Real-world: finding the best stock profit in one pass, moving averages on sensor data, and top-k values.`,
            r`int[] prices = {7, 1, 5, 3, 6, 4};
int minP = Integer.MAX_VALUE, profit = 0;
for (int p : prices) {
    minP = Math.min(minP, p);              // cheapest price so far
    profit = Math.max(profit, p - minP);   // best sale today
}
System.out.println(profit);

// OUTPUT:
// 5`]
    ),

    'String in java': dv(
        [`Internals: a String holds a <code>byte[] value</code> and a coder (Latin-1 or UTF-16, compact strings since Java 9), plus a cached <code>hash</code>. Literals are interned in the pool at class load; <code>new String</code> creates a separate heap object. String concatenation with + compiles to <code>invokedynamic</code> (StringConcatFactory) since Java 9.`,
            r`String a = "x" + "y";            // compile-time constant, interned
String b = "xy";
String p = "x";
String c = p + "y";  // runtime concat
System.out.println((a == b) + " " + (b == c) + " " + (b == c.intern())
        + " " + "xy".hashCode());

// OUTPUT:
// true false true 3841`],
        [`Rich API: <code>formatted</code>, <code>chars()</code>, <code>codePoints()</code>, <code>lines()</code>, <code>strip</code>, <code>isBlank</code>, <code>repeat</code>, <code>translateEscapes</code>, <code>indent</code>, <code>transform</code>, regex methods <code>matches</code>, <code>replaceAll</code>, <code>split</code>. Use <code>String.valueOf</code>, <code>StringBuilder.insert/reverse/deleteCharAt</code>, and <code>Collectors.joining</code>.`,
            r`String text = "Java\nis\nfun";
System.out.println(text.lines().map(String::toUpperCase)
        .collect(Collectors.joining(" ")));
System.out.println("a1b22c333".replaceAll("[0-9]+", "#")
        + " " + "2024-05-17".split("-").length
        + " " + "%s has %d".formatted("cart", 3));
System.out.println("hello".chars()
        .filter(ch -> "aeiou".indexOf(ch) >= 0).count());

// OUTPUT:
// JAVA IS FUN
// a#b#c# 3 cart has 3
// 2`],
        [`Mistakes: == for comparison, ignoring the result of immutable methods, concatenating in loops, split with regex special characters (<code>"a.b".split(".")</code> returns an empty array), substring index errors, case-sensitive comparison bugs, and charAt on emoji. Escape regex with <code>Pattern.quote</code>.`,
            r`System.out.println("a.b".split(".").length + " "
        + "a.b".split("\\.").length + " "
        + "a.b".split(Pattern.quote(".")).length);
String s = "😀x";
System.out.println(s.length() + " " + s.codePointCount(0, s.length()));

// OUTPUT:
// 0 2 2
// 3 2`],
        [`Performance: StringBuilder for loops (preallocate capacity), avoid regex in hot paths (precompile Pattern), reuse formatters, and use <code>String.join</code>. Compact strings halve memory for Latin-1 text. Huge strings should be streamed.`,
            r`long t = System.nanoTime();
String s = "";
for (int i = 0; i < 20_000; i++) s += i;
long slow = System.nanoTime() - t;

t = System.nanoTime();
StringBuilder sb = new StringBuilder(110_000);   // preallocated capacity
for (int i = 0; i < 20_000; i++) sb.append(i);
long fast = System.nanoTime() - t;
System.out.println("concat ms=" + slow / 1_000_000
        + " builder ms=" + fast / 1_000_000);

// OUTPUT: (varies)
// concat ms=450 builder ms=1`],
        [`Real-world: building CSV and JSON lines, masking card numbers, validating emails, and normalizing user input safely.`,
            r`static String mask(String card) {
    int n = card.length() - 4;
    return "*".repeat(n) + card.substring(n);
}
System.out.println(mask("4111111111111111"));
Pattern email = Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[\\w.]+$");
System.out.println(email.matcher("abaji@mail.com").matches());

// OUTPUT:
// ************1111
// true`]
    ),

    'Contructor in java': dv(
        [`<code>new C(args)</code> allocates zeroed memory, sets the header, then runs the constructor bytecode <code>&lt;init&gt;</code>: it calls the super constructor first, then field initializers and instance blocks (copied into every constructor that calls super), then the body. Before the body finishes, <code>this</code> is only partly constructed, so publishing it (to another thread or a listener) is unsafe.`,
            r`class Node {
    final int v;
    static Node last;

    Node(int v) {
        last = this;        // leaks this before v is assigned
        this.v = v;
    }
}
System.out.println(new Node(5).v);

// OUTPUT:
// 5`],
        [`Patterns: telescoping constructors, static factories (<code>of</code>, <code>valueOf</code>), builders, copy constructors, private constructors, records (canonical constructor with compact validation), dependency injection via constructor parameters, and enums (private constructors).`,
            r`record Range(int lo, int hi) {
    Range {                                  // compact constructor
        if (lo > hi) throw new IllegalArgumentException("lo > hi");
    }
    static Range of(int a, int b) {
        return new Range(Math.min(a, b), Math.max(a, b));
    }
}

class Pizza {
    final String size;
    final List<String> toppings;

    private Pizza(Builder b) {
        size = b.size;
        toppings = List.copyOf(b.toppings);
    }

    static class Builder {
        String size = "M";
        List<String> toppings = new ArrayList<>();

        Builder size(String s) {
            size = s;
            return this;
        }
        Builder add(String t) {
            toppings.add(t);
            return this;
        }
        Pizza build() { return new Pizza(this); }
    }
}
System.out.println(Range.of(9, 3) + " " + new Pizza.Builder().size("L").add("corn").build().toppings);

// OUTPUT:
// Range[lo=3, hi=9] [corn]`],
        [`Mistakes: forgetting a no-arg constructor required by frameworks (JPA, Jackson), calling overridable methods, doing heavy I/O in constructors, shadowing fields (<code>name = name;</code> assigns the parameter to itself), and swallowing validation. Use <code>this.name = name</code>.`,
            r`class User {
    String name;
    User(String name) { name = name; }       // bug: parameter assigned to itself
}
System.out.println(new User("Abaji").name);

class User2 {
    String name;
    User2(String name) { this.name = name; } // fixed with this.
}
System.out.println(new User2("Abaji").name);

// OUTPUT:
// null
// Abaji`],
        [`Object creation is cheap, but constructors that open connections or build big structures are not. Make them lazy or move work to factories, use object pools only for expensive resources (connections, threads), and rely on escape analysis for short-lived objects.`,
            r`long t = System.nanoTime();
long s = 0;
for (int i = 0; i < 100_000_000; i++) {
    int[] p = new int[]{i, i + 1};   // often removed by the JIT (scalar replacement)
    s += p[0] + p[1];
}
System.out.println(s + " ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// 10000000000000000 ms=60`],
        [`Real-world: Spring prefers constructor injection: dependencies are final and required, and the class is easy to test.`,
            r`@Service
public class OrderService {
    private final OrderRepository repo;
    private final PaymentGateway gateway;

    public OrderService(OrderRepository repo, PaymentGateway gateway) {
        this.repo = repo;
        this.gateway = gateway;
    }
}
// test: new OrderService(mock(OrderRepository.class), mock(PaymentGateway.class))

// OUTPUT:
// no framework is needed to instantiate the class in tests`]
    ),

    'constructor-chaining': dv(
        [`The compiled constructor begins with an <code>invokespecial</code> call to either <code>this.&lt;init&gt;</code> or <code>super.&lt;init&gt;</code>.
<ul>
<li>Field initializers and instance blocks are copied in right after the <code>super</code> call.</li>
<li>They are copied only into constructors that call <code>super</code>, not into those that call <code>this</code>.</li>
<li>Class initialization (<code>&lt;clinit&gt;</code>) runs once, parent class first.</li>
</ul>`,
            r`class A {
    int a = log("A field");
    A() { log("A()"); }
    static int log(String s) {
        System.out.println(s);
        return 1;
    }
}
class B extends A {
    int b = log("B field");
    B() {
        this(1);
        log("B()");
    }
    B(int x) { log("B(int)"); }
}
new B();

// OUTPUT:
// A field
// A()
// B field
// B(int)
// B()`],
        [`Design tips:
<ul>
<li>Put validation and the real initialization in one main constructor. Other constructors supply defaults through <code>this(...)</code>.</li>
<li>Make parent constructors <code>protected</code> when only subclasses use them, and document what they expect.</li>
<li>Records chain through their canonical constructor.</li>
</ul>`,
            r`record Money(long cents, String cur) {
    Money(long cents) { this(cents, "INR"); }
    Money { if (cents < 0) throw new IllegalArgumentException("negative"); }
}
System.out.println(new Money(500));

// OUTPUT:
// Money[cents=500, cur=INR]`],
        [`Common mistakes:
<ul>
<li>Circular <code>this()</code> calls (compile error).</li>
<li>Using child fields inside a parent constructor. They are not set yet.</li>
<li>Long chains that hide behavior. Keep chains short.</li>
<li>Forgetting the implicit <code>super()</code> when the parent has no no-arg constructor.</li>
</ul>`,
            r`// class X { X() { this(1); } X(int a) { this(); } }
// error: recursive constructor invocation

class Parent {
    Parent() { show(); }
    void show() { System.out.println("parent"); }
}
class Kid extends Parent {
    String s = "kid-ready";   // not set yet when Parent() runs
    @Override void show() { System.out.println(s); }
}
new Kid();

// OUTPUT:
// null`],
        [`Deep hierarchies make construction expensive and fragile. Prefer composition and flat hierarchies; measure only if profiling shows allocation hot spots. Static initialization cost is paid once but may delay startup.`,
            r`// -Xlog:class+init=info shows class initialization order and time
// java -Xlog:class+init=info -jar app.jar

// OUTPUT:
// [info][class,init] com.acme.Parent
// [info][class,init] com.acme.Child`],
        [`Real-world: framework base classes. A JPA entity needs a protected no-arg constructor, while the public constructor enforces required fields.`,
            r`@Entity
public class Customer {
    @Id @GeneratedValue Long id;
    private String email;

    protected Customer() {}   // for JPA only
    public Customer(String email) {
        this.email = Objects.requireNonNull(email);
    }
}

// OUTPUT:
// application code must supply an email, JPA can still instantiate the entity`]
    ),

    'static-keyword': dv(
        [`Static fields live in the class mirror (in the heap since Java 8) and are initialized once during class initialization by <code>&lt;clinit&gt;</code>, which the JVM runs under a lock, making it thread-safe. Static methods use <code>invokestatic</code> (no receiver), so they cannot be overridden or use dynamic dispatch.`,
            r`class Lazy {
    static { System.out.println("Lazy loaded"); }
    static final int CONST = 5;
    static int value = 7;
}
System.out.println(Lazy.CONST);   // compile-time constant: no class init
System.out.println(Lazy.value);   // triggers class initialization

// OUTPUT:
// 5
// Lazy loaded
// 7`],
        [`Uses: constants, utility classes (private constructor, final class), factory methods, singletons (enum or holder), static nested classes (builders, entries), static imports, and counters. Static nested classes have no outer reference and avoid leaks, unlike inner classes.`,
            r`public final class Strings {
    private Strings() {}
    public static boolean isBlankOrNull(String s) {
        return s == null || s.isBlank();
    }
}

enum Registry {
    INSTANCE;   // enum singleton
    private final Map<String, String> data = new ConcurrentHashMap<>();
    void put(String k, String v) { data.put(k, v); }
    String get(String k) { return data.get(k); }
}

Registry.INSTANCE.put("a", "1");
System.out.println(Strings.isBlankOrNull(" ") + " " + Registry.INSTANCE.get("a"));

// OUTPUT:
// true 1`],
        [`Common mistakes: static collections that grow forever (memory leak), static <code>SimpleDateFormat</code> (not thread-safe), static state leaking between tests, calling instance code from a static context, and static references to large objects that keep them in memory. Use immutable statics and <code>DateTimeFormatter</code> (thread-safe).`,
            r`// immutable and thread-safe
static final DateTimeFormatter F = DateTimeFormatter.ISO_LOCAL_DATE;

// risky: unbounded and not synchronized
static final Map<String, Object> CACHE = new HashMap<>();

// fix: a bounded cache, for example
// Caffeine.newBuilder().maximumSize(1000).build()

// OUTPUT:
// bounded caches prevent leaks`],
        [`Static final constants are inlined by the compiler, so changing one means recompiling the classes that use it. Static access is fast, but shared state causes contention across threads. Use <code>LongAdder</code> for hot counters.`,
            r`static final LongAdder HITS = new LongAdder();
IntStream.range(0, 1_000_000).parallel().forEach(i -> HITS.increment());
System.out.println(HITS.sum());

// OUTPUT:
// 1000000`],
        [`Real-world: a logger per class, application constants, and validation helpers. Avoid statics for services; inject them so tests can replace them.`,
            r`public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private final Clock clock;   // injected, replaceable in tests
    public PaymentService(Clock clock) { this.clock = clock; }
}

// OUTPUT:
// the logger is a harmless static; the clock is injectable`]
    ),

    'Input and Output Stream in Java': dv(
        [`<p>The I/O classes use the <b>decorator pattern</b>: a base stream does the raw transfer, and wrappers add behavior.</p><ul><li>Wrappers add buffering, decoding, object serialization or compression.</li><li><code>InputStreamReader</code> bridges bytes to chars with a charset.</li><li>NIO adds channels, buffers and non-blocking selectors.</li><li><code>Files</code> offers convenient high-level calls.</li></ul>`,
            r`try (var in = new GZIPInputStream(
             new BufferedInputStream(new FileInputStream("data.gz")));
     var br = new BufferedReader(
             new InputStreamReader(in, StandardCharsets.UTF_8))) {
    System.out.println(br.readLine());
}

// OUTPUT:
// the first decompressed text line`],
        [`<p>NIO.2 is the modern file API. Main pieces:</p><ul><li><code>Path</code> and <code>Files.walk</code>, <code>Files.copy</code>, <code>Files.move</code>, <code>Files.newBufferedReader</code></li><li><code>WatchService</code> to watch folders for changes</li><li>Memory-mapped files via <code>FileChannel.map</code></li></ul><p>Close streams from <code>Files.lines</code> and <code>Files.walk</code>, because they hold file handles.</p>`,
            r`Path dir = Path.of("src");
try (Stream<Path> walk = Files.walk(dir)) {
    System.out.println(walk.filter(p -> p.toString().endsWith(".java")).count());
}
Files.copy(Path.of("a.txt"), Path.of("b.txt"),
        StandardCopyOption.REPLACE_EXISTING);
try (FileChannel ch = FileChannel.open(Path.of("big.bin"))) {
    MappedByteBuffer mb = ch.map(FileChannel.MapMode.READ_ONLY, 0, ch.size());
    System.out.println(mb.get(0));
}

// OUTPUT: (varies)
// 42
// 1`],
        [`<p>Common mistakes:</p><ul><li>Not closing streams (handle leaks, unflushed data).</li><li>Reading with the platform default charset.</li><li>Loading huge files fully (<code>OutOfMemoryError</code>).</li><li>Ignoring the return value of <code>read(byte[])</code>, which can be less than the array size.</li><li>Mixing <code>Scanner</code> and <code>BufferedReader</code> on <code>System.in</code>.</li><li>Forgetting to flush.</li></ul>`,
            r`// wrong: assumes read() fills the buffer
byte[] buf = new byte[1024];
int n = in.read(buf);              // may return less than 1024
String s = new String(buf);        // includes garbage after n bytes
String ok = new String(buf, 0, n, StandardCharsets.UTF_8);

// OUTPUT:
// decode only the bytes actually read`],
        [`<p>For throughput:</p><ul><li>Use 8 KB or larger buffers and buffered wrappers.</li><li>Copy in bulk with <code>in.transferTo(out)</code>.</li><li>Use memory-mapped files for random access.</li><li>Avoid per-byte calls on unbuffered streams.</li></ul><p>Disk and network latency dominate, so batch the work.</p>`,
            r`try (var in = new FileInputStream("in.bin");
     var out = new FileOutputStream("out.bin")) {
    in.transferTo(out);                    // bulk copy
}
long t = System.nanoTime();
try (var in = new BufferedInputStream(new FileInputStream("in.bin"))) {
    while (in.read() != -1) { }            // fine thanks to the buffer
}
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=120`],
        [`<p>Real-world: stream a large CSV line by line with a progress counter. Write results to a temp file, then move it into place so readers never see a half-written file.</p>`,
            r`Path in = Path.of("orders.csv");
Path tmp = Path.of("out.tmp");
Path out = Path.of("out.csv");
try (BufferedReader r = Files.newBufferedReader(in);
     BufferedWriter w = Files.newBufferedWriter(tmp)) {
    String line;
    int n = 0;
    while ((line = r.readLine()) != null) {
        w.write(line.toUpperCase());
        w.newLine();
        n++;
    }
    System.out.println(n + " lines");
}
Files.move(tmp, out, StandardCopyOption.ATOMIC_MOVE,
        StandardCopyOption.REPLACE_EXISTING);

// OUTPUT: (varies)
// 100000 lines`]
    ),

    'scanner-in-java': dv(
        [`Scanner wraps a <code>Readable</code> (stream, file, string), reads into a char buffer and uses a delimiter regex (whitespace by default) to cut tokens, then parses them with the locale's number rules. <code>hasNextX</code> methods peek without consuming. <code>nextLine</code> uses the line separator pattern, which is why it behaves differently from <code>next</code>.`,
            r`Scanner sc = new Scanner("12 3.5 hello\nrest of line");
int i = sc.nextInt();
double d = sc.nextDouble();
String w = sc.next();
String rest1 = sc.nextLine();   // empty: the rest of line 1
String rest2 = sc.nextLine();   // line 2
System.out.println(i + " " + d + " " + w + " [" + rest1 + "] [" + rest2 + "]");
System.out.println(sc.hasNextLine());

// OUTPUT:
// 12 3.5 hello [] [rest of line]
// false`],
        [`Practical usage: menu-driven loops, parsing files with <code>new Scanner(new File(...))</code>, <code>findInLine</code> with regex, <code>useLocale(Locale.US)</code>, and try-with-resources. For batch or large inputs prefer <code>BufferedReader</code>; for typed config files use a real parser.`,
            r`try (Scanner sc = new Scanner(Path.of("scores.txt"))) {
    sc.useLocale(Locale.US);
    double total = 0;
    int n = 0;
    while (sc.hasNextDouble()) {
        total += sc.nextDouble();
        n++;
    }
    System.out.printf("avg=%.2f%n", n == 0 ? 0 : total / n);
}

// OUTPUT: (file: 80 90.5 70)
// avg=80.17`],
        [`Mistakes: nextInt then nextLine, not validating input (InputMismatchException loops forever if the bad token is not consumed), closing Scanner(System.in) too early (closes System.in for the rest of the program), locale decimal commas, and using Scanner for performance critical input.`,
            r`Scanner sc = new Scanner("abc 5");
try {
    sc.nextInt();
} catch (InputMismatchException e) {
    System.out.println("bad token still in buffer: " + sc.next());
}
System.out.println(sc.nextInt());

// OUTPUT:
// bad token still in buffer: abc
// 5`],
        [`Scanner reading 10^6 integers can take several times longer than BufferedReader plus manual parsing because of regex and per-token objects. In contests use DataInputStream custom readers.`,
            r`BufferedReader br = new BufferedReader(new InputStreamReader(System.in), 1 << 16);
StreamTokenizer st = new StreamTokenizer(br);
st.nextToken();
int n = (int) st.nval;
long sum = 0;
for (int i = 0; i < n; i++) {
    st.nextToken();
    sum += (long) st.nval;
}
System.out.println(sum);

// OUTPUT: (input: 3 1 2 3)
// 6`],
        [`Real-world: a small CLI that reads commands in a loop, validates each, and exits on quit. For production CLIs use a library (picocli) for arguments and help text.`,
            r`Scanner sc = new Scanner(System.in);
while (true) {
    System.out.print("> ");
    String cmd = sc.nextLine().trim();
    if (cmd.equals("quit")) break;
    System.out.println(switch (cmd) {
        case "help" -> "commands: help, time, quit";
        case "time" -> LocalTime.now().withNano(0).toString();
        default -> "unknown: " + cmd;
    });
}

// OUTPUT: (input: help, quit)
// > commands: help, time, quit
// > `]
    )
};
