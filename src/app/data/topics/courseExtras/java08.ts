// Core Java extras, part 8: advanced language features, second half (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java08Extras: Record<string, Extra> = {
    'try-with-resources': x(
        ['<b>Automatic closing</b>: <code>try (var in = new FileInputStream("a.txt")) { ... }</code> closes <code>in</code> for you.',
            '<b>Required type</b>: resources must implement <code>AutoCloseable</code> (or <code>Closeable</code>).',
            '<b>No finally needed</b> for closing; it works even if an exception is thrown.'],
        ['<b>Several resources</b> are separated by semicolons and closed in reverse order of creation.',
            '<b>Java 9</b>: you can use an existing effectively final variable: <code>try (res) { ... }</code>.',
            '<b>Suppressed exceptions</b>: an exception from <code>close()</code> is added to the primary exception.'],
        ['<b>Custom resources</b>: implement <code>AutoCloseable</code> and make <code>close()</code> idempotent (safe to call twice).',
            '<b>Good uses</b>: streams, connections, statements, lock wrappers and temporary state.',
            '<b>Null resource</b>: it is skipped, so there is no <code>NullPointerException</code> on close.'],
        [['F', 'What is try-with-resources?', 'A try statement that automatically closes resources declared in its header.'],
            ['F', 'Which interface must resources implement?', 'AutoCloseable (Closeable extends it).'],
            ['M', 'In which order are resources closed?', 'In reverse order of declaration.'],
            ['M', 'What are suppressed exceptions?', 'Exceptions from close() that are attached to the primary exception so none is lost.'],
            ['S', 'Why is it better than try-finally?', 'It is shorter, never forgets to close, and preserves the original exception when close also fails.'],
            ['S', 'Why should close() be idempotent?', 'It may be called more than once (explicitly and by the try statement); a second call must be harmless.']],
        [['Files and JDBC.',
            r`try (var conn = DriverManager.getConnection(url, user, pass);
     var ps = conn.prepareStatement("SELECT name FROM users WHERE id = ?")) {
    ps.setLong(1, 7);
    try (var rs = ps.executeQuery()) { if (rs.next()) System.out.println(rs.getString(1)); }
}   // rs, ps and conn are closed in reverse order

// OUTPUT: (depends on data)
// Abaji`],
            ['Custom resource and order.',
                r`class Res implements AutoCloseable {
    final String n;
    Res(String n) {
        this.n = n;
        System.out.println("open " + n);
    }
    public void close() { System.out.println("close " + n); }
}
try (Res a = new Res("A"); Res b = new Res("B")) {
    System.out.println("work");
}

// OUTPUT:
// open A
// open B
// work
// close B
// close A`]],
        [['Suppressed exceptions.',
            r`class Bad implements AutoCloseable {
    public void close() throws Exception { throw new Exception("close failed"); }
}
try (Bad b = new Bad()) {
    throw new RuntimeException("body failed");
} catch (Exception e) {
    System.out.println(e.getMessage() + " | " + e.getSuppressed()[0].getMessage());
}

// OUTPUT:
// body failed | close failed`],
            ['Existing variable (Java 9).',
                r`StringReader sr = new StringReader("hello");
try (sr) { System.out.println((char) sr.read()); }

// OUTPUT:
// h`]]
    ),

    'varargs': x(
        ['<b>Varargs</b> let a method accept zero or more arguments of one type: <code>static int sum(int... nums)</code>.',
            '<b>Array inside</b>: the parameter is an array, so use <code>nums.length</code> and <code>nums[0]</code>.',
            '<b>Position</b>: it must be the last parameter, and a method can have only one.'],
        ['<b>Ways to call</b>: pass separate values, an array, or nothing: <code>sum()</code>, <code>sum(1, 2, 3)</code>, <code>sum(arr)</code>.',
            '<b>Overloading</b>: varargs is tried last. Exact and boxed matches win first.',
            '<b>JDK APIs</b>: <code>String.format</code>, <code>Arrays.asList</code>, <code>List.of</code> and <code>printf</code> use varargs.'],
        ['<b>Cost</b>: each call allocates an array, so avoid varargs in hot paths. The JDK adds fixed-arity overloads such as <code>List.of(e1, e2)</code>.',
            '<b>Heap pollution</b>: generic varargs give compiler warnings. <code>@SafeVarargs</code> on final, static or private methods says the method is safe.',
            '<b>null</b>: <code>f(null)</code> passes a null array, while <code>f((Object) null)</code> passes one null element. This surprises many people.'],
        [['F', 'What are varargs?', 'A parameter that accepts a variable number of arguments of the same type.'],
            ['F', 'Where must the varargs parameter be?', 'Last in the parameter list.'],
            ['M', 'What type is a varargs parameter inside the method?', 'An array of that type.'],
            ['M', 'Can a method have two varargs parameters?', 'No, only one and it must be last.'],
            ['S', 'Why is @SafeVarargs needed for generic varargs?', 'A generic array can cause heap pollution; the annotation asserts the method does not misuse the array.'],
            ['S', 'Why do JDK collections factories have fixed-arity overloads?', 'To avoid allocating an array for common small arities.']],
        [['Varargs in use.',
            r`static int sum(int... n) {
    int s = 0;
    for (int v : n) s += v;
    return s;
}
static String describe(String label, Object... parts) {
    return label + ":" + parts.length;
}
System.out.println(sum() + " " + sum(5) + " " + sum(1, 2, 3) + " "
    + sum(new int[]{4, 5}) + " " + describe("x", 1, "a", 2.5));

// OUTPUT:
// 0 5 6 9 x:3`],
            ['Overload priority.',
                r`static String f(int a, int b) { return "fixed"; }
static String f(int... a) { return "varargs"; }
System.out.println(f(1, 2) + " " + f(1, 2, 3) + " " + f());

// OUTPUT:
// fixed varargs varargs`]],
        [['Passing null.',
            r`static int count(Object... o) { return o == null ? -1 : o.length; }
System.out.println(count() + " " + count((Object[]) null) + " " + count((Object) null));

// OUTPUT:
// 0 -1 1`],
            ['Generic varargs.',
                r`@SafeVarargs static <T> List<T> listOf(T... items) { return new ArrayList<>(Arrays.asList(items)); }
System.out.println(listOf("a", "b"));

// OUTPUT:
// [a, b]`]]
    ),

    'initializer-blocks': x(
        ['An <b>instance initializer block</b> <code>{ ... }</code> runs every time an object is created, before the constructor body.',
            'A <b>static initializer block</b> <code>static { ... }</code> runs once when the class is first loaded and initialized.',
            'Use them for setup that does not fit a single field initializer.'],
        ['<b>Order for one class</b>: static blocks and static fields (top to bottom, once), then per object: instance fields and blocks (top to bottom), then the constructor body.',
            '<b>With inheritance</b>: parent static, child static, parent instance + constructor, child instance + constructor.',
            '<b>Constructor copy</b>: the compiler copies instance blocks into each constructor that calls <code>super(...)</code> (not into one that calls <code>this(...)</code>).'],
        ['<b>Prefer constructors</b> and static factory methods; initializer blocks are rare (anonymous classes, shared setup).',
            '<b>Failures</b>: an exception in a static block becomes <code>ExceptionInInitializerError</code>, and later uses give <code>NoClassDefFoundError</code>.',
            '<b>Class initialization lock</b>: avoid heavy work and circular dependencies in static init (deadlock risk).'],
        [['F', 'When does a static block run?', 'Once, when the class is loaded and initialized.'],
            ['F', 'When does an instance block run?', 'Every time an object is created, before the constructor body.'],
            ['M', 'What is the order of initialization with inheritance?', 'Parent static, child static, parent instance and constructor, then child instance and constructor.'],
            ['M', 'Can a static block throw an exception?', 'Not checked ones; a runtime exception becomes ExceptionInInitializerError.'],
            ['S', 'Why can static initializers cause deadlocks?', 'Class initialization holds a lock; two classes initializing each other from different threads can wait on each other.'],
            ['S', 'Why prefer constructors over instance blocks?', 'They are clearer and can take parameters; blocks hide order dependencies.']],
        [['Execution order.',
            r`class P {
    static { System.out.println("P static"); }
    { System.out.println("P instance"); }
    P() { System.out.println("P ctor"); }
}
class C extends P {
    static { System.out.println("C static"); }
    { System.out.println("C instance"); }
    C() { System.out.println("C ctor"); }
}
new C();
new C();

// OUTPUT:
// P static
// C static
// P instance
// P ctor
// C instance
// C ctor
// P instance
// P ctor
// C instance
// C ctor`],
            ['Static block loading a table.',
                r`class Codes {
    static final Map<String, Integer> M = new HashMap<>();
    static {
        M.put("IN", 91);
        M.put("US", 1);
    }
}
System.out.println(Codes.M.get("IN"));

// OUTPUT:
// 91`]],
        [['Failing static block.',
            r`class Boom { static int x = Integer.parseInt("zz"); }
try { new Boom(); }
catch (ExceptionInInitializerError e) {
    System.out.println("EIIE: " + e.getCause().getClass().getSimpleName());
}
try { new Boom(); }
catch (NoClassDefFoundError e) { System.out.println("NCDFE on second use"); }

// OUTPUT:
// EIIE: NumberFormatException
// NCDFE on second use`],
            ['Double-brace smell.',
                r`// anonymous subclass with an instance block
List<String> l = new ArrayList<>() {
    { add("a"); }
};
System.out.println(l);

// OUTPUT:
// [a]`]]
    ),

    'custom-exceptions': x(
        ['<b>Custom exception</b>: your own class, such as <code>class InsufficientFundsException extends Exception</code> (checked) or <code>extends RuntimeException</code> (unchecked).',
            '<b>Constructors</b>: message, message + cause, and optionally fields (error code, data).',
            '<b>Throwing</b>: <code>throw new InsufficientFundsException("...")</code>.'],
        ['<b>Naming</b>: name it for the problem and end with <code>Exception</code>, for example <code>OrderNotFoundException</code>.',
            '<b>Context</b>: add fields (ids, amounts) with getters, and put the key facts in the message.',
            '<b>Base exception</b>: use one per module so callers can catch the whole family.'],
        ['<b>Checked vs unchecked</b>: choose deliberately; most application errors are unchecked.',
            '<b>Sensitive data</b>: keep it out of messages that reach clients or logs.',
            '<b>Central mapping</b>: turn exceptions into HTTP status codes and error bodies in one place (<code>@ControllerAdvice</code>).'],
        [['F', 'Why create custom exceptions?', 'To represent domain-specific errors clearly and let callers handle them specifically.'],
            ['F', 'Which class do you extend?', 'Exception for checked, RuntimeException for unchecked.'],
            ['M', 'Which constructors should a custom exception have?', 'At least message and message with cause, to support chaining.'],
            ['M', 'Checked or unchecked for a custom exception?', 'Unchecked for programming errors and most application errors; checked only when callers can reasonably recover.'],
            ['S', 'How do you add context to an exception?', 'Fields with the relevant data and a clear message, plus the cause.'],
            ['S', 'How should custom exceptions reach API clients?', 'Mapped centrally to status codes and a structured error body without stack traces or secrets.']],
        [['Domain exception with context.',
            r`class InsufficientFundsException extends RuntimeException {
    private final long needed;
    InsufficientFundsException(String account, long needed) {
        super("Account " + account + " needs " + needed + " more");
        this.needed = needed;
    }
    long needed() { return needed; }
}
try {
    throw new InsufficientFundsException("ACC-1", 250);
} catch (InsufficientFundsException e) {
    System.out.println(e.getMessage() + " (" + e.needed() + ")");
}

// OUTPUT:
// Account ACC-1 needs 250 more (250)`],
            ['Hierarchy and cause.',
                r`class AppException extends RuntimeException {
    AppException(String m, Throwable c) { super(m, c); }
    AppException(String m) { super(m); }
}
class ConfigException extends AppException {
    ConfigException(String m, Throwable c) { super(m, c); }
}
try {
    try { Integer.parseInt("x"); }
    catch (NumberFormatException e) { throw new ConfigException("bad port", e); }
} catch (AppException e) {
    System.out.println(e.getMessage() + " <- "
        + e.getCause().getClass().getSimpleName());
}

// OUTPUT:
// bad port <- NumberFormatException`]],
        [['Mapping to HTTP.',
            r`@ExceptionHandler(InsufficientFundsException.class)
ResponseEntity<Map<String, Object>> handle(InsufficientFundsException e) {
    return ResponseEntity.status(409).body(
        Map.of("code", "INSUFFICIENT_FUNDS", "needed", e.needed()));
}

// OUTPUT:
// HTTP 409 {"code":"INSUFFICIENT_FUNDS","needed":250}`],
            ['Serialization warning.',
                r`// Exceptions are Serializable: mark non-serializable fields transient
class WithData extends RuntimeException {
    final transient Object payload;
    WithData(Object p) { payload = p; }
}

// OUTPUT:
// safe to send across RMI or caches`]]
    ),

    'marker-interfaces': x(
        ['<b>No methods</b>: a marker interface only tags a class with a capability, such as <code>Serializable</code>, <code>Cloneable</code> or <code>RandomAccess</code>.',
            '<b>Checking the tag</b>: code uses <code>instanceof</code>, for example <code>if (obj instanceof Serializable)</code>.',
            '<b>Effect</b>: the JVM or a library enables special behavior for tagged classes.'],
        ['<b>Built-in meanings</b>: <code>Serializable</code> allows object serialization; <code>Cloneable</code> allows <code>Object.clone()</code>; <code>RandomAccess</code> tells algorithms that indexed access is fast.',
            '<b>Custom markers</b>: you can write your own, e.g. <code>interface Auditable {}</code>.',
            '<b>Annotations</b> are the modern alternative to marker interfaces.'],
        ['<b>Type advantage</b>: a marker interface defines a type, so it works in method signatures and compile-time checks; annotations carry data and apply to methods and fields.',
            '<b>Sealed interfaces</b> with a <code>permits</code> clause now express closed families better than markers.',
            '<b>Choosing</b>: use annotations for framework metadata; use a marker interface when a method should accept only tagged classes.'],
        [['F', 'What is a marker interface?', 'An interface with no methods used to mark a class with a capability.'],
            ['F', 'Give examples.', 'Serializable, Cloneable and RandomAccess.'],
            ['M', 'How is a marker interface detected?', 'With instanceof or reflection (isAssignableFrom).'],
            ['M', 'Marker interface vs annotation?', 'A marker interface defines a type usable at compile time; an annotation carries metadata and can target methods and fields.'],
            ['S', 'When prefer a marker interface?', 'When you want a method to accept only tagged types, giving compile-time safety.'],
            ['S', 'What replaces markers in modern Java?', 'Annotations for metadata and sealed interfaces for closed type families.']],
        [['Custom marker and check.',
            r`interface Auditable {}
class Payment implements Auditable {}
class Note {}
static void save(Object o) {
    String tag = (o instanceof Auditable) ? " audited" : " plain";
    System.out.println(o.getClass().getSimpleName() + tag);
}
save(new Payment());
save(new Note());

// OUTPUT:
// Payment audited
// Note plain`],
            ['Compile-time safety.',
                r`interface Sensitive {}
static void mask(List<? extends Sensitive> items) {
    items.forEach(i -> System.out.println("masking " + i.getClass().getSimpleName()));
}
record Card() implements Sensitive {}
mask(List.of(new Card()));
// mask(List.of("text"));   // does not compile

// OUTPUT:
// masking Card`]],
        [['RandomAccess.',
            r`List<Integer> al = new ArrayList<>(), ll = new LinkedList<>();
System.out.println((al instanceof RandomAccess) + " " + (ll instanceof RandomAccess));

// OUTPUT:
// true false`],
            ['Annotation alternative.',
                r`@Retention(RetentionPolicy.RUNTIME) @interface Audited { String by() default "system"; }
@Audited(by = "ops") class Transfer {}
System.out.println(Transfer.class.getAnnotation(Audited.class).by());

// OUTPUT:
// ops`]]
    ),

    'object-class': x(
        ['<b>Root class:</b> <code>java.lang.Object</code> is the root of every class. Key methods: <code>toString()</code>, <code>equals(Object)</code>, <code>hashCode()</code>, <code>getClass()</code>, <code>clone()</code>, <code>wait/notify/notifyAll</code>.',
            '<b>Default toString:</b> <code>toString</code> prints class name and hash (<code>Student@1b6d3586</code>); override it for readable output.',
            '<b>Default equals:</b> <code>equals</code> compares references.'],
        ['<b>Override for value behavior:</b> override <code>toString</code> for logging and debugging, and <code>equals</code> with <code>hashCode</code> for value equality.',
            '<b>Runtime class:</b> <code>getClass()</code> returns the run-time class (<code>obj.getClass().getName()</code>).',
            '<b>Cleanup:</b> <code>finalize()</code> is deprecated for removal; use <code>try-with-resources</code> or <code>Cleaner</code>.'],
        ['<b>Monitor methods:</b> <code>wait</code>, <code>notify</code> and <code>notifyAll</code> work on an object monitor and must be called while holding its lock.',
            '<b>getClass vs instanceof:</b> in <code>equals</code>, <code>getClass()</code> requires the exact class, while <code>instanceof</code> accepts subclasses.',
            '<b>Arrays and lambdas:</b> <code>Object</code> methods are available on them too; <code>Objects</code> (plural) is the utility class.'],
        [['F', 'What is the Object class?', 'The root class from which all Java classes inherit.'],
            ['F', 'Name some methods of Object.', 'toString, equals, hashCode, getClass, clone, wait, notify, notifyAll.'],
            ['M', 'What does the default toString return?', 'The class name, an @ sign and the hexadecimal hash code.'],
            ['M', 'Why override toString?', 'For useful logs and debugging output.'],
            ['S', 'Why is finalize() deprecated?', 'It is unpredictable, slow and can resurrect objects; use try-with-resources or Cleaner instead.'],
            ['S', 'getClass() vs instanceof in equals?', 'getClass requires exactly the same class (symmetric but less flexible); instanceof allows subclasses and can break symmetry.']],
        [['toString, equals and getClass.',
            r`class Student { final String name; Student(String n) { name = n; }
    @Override public String toString() { return "Student{name=" + name + "}"; }
    @Override public boolean equals(Object o) {
        return o != null && getClass() == o.getClass()
            && name.equals(((Student) o).name);
    }
    @Override public int hashCode() { return name.hashCode(); }
    }
Student s = new Student("Abaji");
System.out.println(s + " " + s.equals(new Student("Abaji"))
    + " " + s.getClass().getSimpleName());

// OUTPUT:
// Student{name=Abaji} true Student`],
            ['Default toString.',
                r`class Plain {}
String s = new Plain().toString();
System.out.println(s.startsWith("Plain@"));

// OUTPUT:
// true`]],
        [['Objects utility.',
            r`System.out.println(Objects.equals(null, null)
    + " " + Objects.hash(1, "a")
    + " " + Objects.toString(null, "none")
    + " " + Objects.requireNonNullElse(null, "dflt"));

// OUTPUT:
// true 1089 none dflt`],
            ['wait needs the lock.',
                r`Object o = new Object();
try { o.wait(); }
catch (IllegalMonitorStateException | InterruptedException e) {
    System.out.println(e.getClass().getSimpleName());
}

// OUTPUT:
// IllegalMonitorStateException`]]
    ),

    'string-formatting': x(
        ['<b>Template</b>: <code>String.format</code> and <code>printf</code> build text from a template: <code>String.format("%s is %d years", name, age)</code>.',
            '<b>Specifiers</b>: <code>%s</code> string, <code>%d</code> integer, <code>%f</code> float, <code>%n</code> newline, <code>%x</code> hex, <code>%b</code> boolean, <code>%%</code> percent sign.',
            '<b>Width and precision</b>: <code>%8.2f</code>, <code>%-10s</code>, <code>%05d</code>, <code>%,d</code>.'],
        ['<b>formatted()</b>: Java 15+ lets you write <code>"%s is %d".formatted(name, age)</code>.',
            '<b>Argument index</b>: <code>%2$s %1$s</code> reorders arguments.',
            '<b>Locale</b>: pass a <code>Locale</code> for locale-sensitive output: <code>String.format(Locale.US, "%,.2f", 1234.5)</code>.'],
        ['<b>Locale-aware tools</b>: use <code>NumberFormat</code>, <code>DecimalFormat</code> and <code>DateTimeFormatter</code> for numbers, currency and dates.',
            '<b>Injection</b>: do not build SQL or HTML with <code>String.format</code>; use prepared statements and escaping.',
            '<b>Type mismatch</b>: a wrong type throws <code>IllegalFormatException</code> at run time (<code>%d</code> with a string).'],
        [['F', 'How do you format a string in Java?', 'With String.format, printf or formatted() using format specifiers.'],
            ['F', 'What does %n do?', 'It inserts the platform-specific line separator.'],
            ['M', 'How do you print a number with two decimals?', 'Use %.2f.'],
            ['M', 'What happens with %d and a String argument?', 'IllegalFormatConversionException at run time.'],
            ['S', 'Why use a Locale?', 'Number and date formats differ by locale (decimal comma vs point); pass a Locale for predictable output.'],
            ['S', 'Why not use String.format to build SQL?', 'It risks SQL injection; use PreparedStatement parameters.']],
        [['Formatting numbers and text.',
            r`System.out.println(String.format("%-8s|%8.2f|%05d|%,d|%x|%b", "Item", 3.14159, 42, 1234567, 255, true));
System.out.println("%s scored %d%%".formatted("Abaji", 95));
System.out.println(String.format("%2$s %1$s", "World", "Hello"));

// OUTPUT:
// Item    |    3.14|00042|1,234,567|ff|true
// Abaji scored 95%
// Hello World`],
            ['Locale-aware money and dates.',
                r`Locale in = new Locale("en", "IN");
System.out.println(NumberFormat.getCurrencyInstance(in).format(1234567.5));
System.out.println(NumberFormat.getInstance(Locale.GERMANY).format(1234.56));
DateTimeFormatter f = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);
System.out.println(LocalDate.of(2025, 3, 7).format(f));

// OUTPUT:
// ₹12,34,567.50
// 1.234,56
// 07 Mar 2025`]],
        [['Type mismatch.',
            r`try {
    String.format("%d", "text");
} catch (IllegalFormatConversionException e) {
    System.out.println(e.getMessage());
}

// OUTPUT:
// d != java.lang.String`],
            ['Table output.',
                r`String[] names = {"Pen", "Notebook"};
double[] price = {10, 125.5};
for (int i = 0; i < names.length; i++) {
    System.out.printf("%-10s %8.2f%n", names[i], price[i]);
}

// OUTPUT:
// Pen           10.00
// Notebook     125.50`]]
    ),

    'immutable-classes': x(
        ['<b>Immutable object</b>: cannot change after creation (<code>String</code>, <code>Integer</code>, <code>LocalDate</code>).',
            '<b>Recipe</b>: declare the class <code>final</code>, make all fields <code>private final</code>, no setters, set everything in the constructor.',
            '<b>Records</b> give immutable data carriers with little code.'],
        ['<b>Defensive copies</b>: copy mutable inputs in the constructor and mutable outputs in getters (or return unmodifiable views).',
            '<b>Thread-safe</b>: immutable objects can be shared and cached, and make good map keys.',
            '<b>Withers</b>: changes create new objects, for example <code>date.plusDays(1)</code>.'],
        ['<b>Cost</b>: more allocations for frequent changes. Reduce it with builders or persistent data structures.',
            '<b>Shallow immutability</b> is not enough: all reachable state must be immutable, or hidden behind copies.',
            '<b>Collections</b>: <code>List.of</code>, <code>List.copyOf</code>, and <code>Collections.unmodifiableList</code> (a view, not a copy).'],
        [['F', 'What is an immutable class?', 'A class whose instances cannot be modified after creation.'],
            ['F', 'Name an immutable class in Java.', 'String (also Integer, LocalDate and records).'],
            ['M', 'What are the steps to create an immutable class?', 'Make it final, fields private final, no setters, initialize in the constructor and copy mutable arguments.'],
            ['M', 'Why are immutable objects thread-safe?', 'Their state never changes, so no synchronization is needed and sharing is safe.'],
            ['S', 'unmodifiableList vs List.copyOf?', 'unmodifiableList is a read-only view of the original (changes show through); copyOf makes an independent immutable copy.'],
            ['S', 'What is the downside of immutability?', 'Changes require new objects, which can cost allocation; builders and structural sharing reduce it.']],
        [['Immutable class with defensive copies.',
            r`public final class Order {
    private final long id;
    private final List<String> items;
    private final Date created;

    public Order(long id, List<String> items, Date created) {
        this.id = id;
        this.items = List.copyOf(items);              // copy IN
        this.created = new Date(created.getTime());   // Date is mutable
    }

    public List<String> items() { return items; }     // already immutable
    public Date created() { return new Date(created.getTime()); } // copy OUT

    public Order withItem(String i) {
        List<String> n = new ArrayList<>(items);
        n.add(i);
        return new Order(id, n, created);
    }
}
List<String> src = new ArrayList<>(List.of("pen"));
Order o = new Order(1, src, new Date(0));
src.add("hack");                                      // does not affect o
System.out.println(o.items() + " " + o.withItem("book").items());

// OUTPUT:
// [pen] [pen, book]`],
            ['Record version.',
                r`record Money(long cents, String currency) {
    Money {                                    // compact constructor: validate
        if (cents < 0) throw new IllegalArgumentException();
    }
    Money plus(Money o) { return new Money(cents + o.cents, currency); }
}
Money a = new Money(500, "INR");
System.out.println(a.plus(new Money(250, "INR")) + " " + a);

// OUTPUT:
// Money[cents=750, currency=INR] Money[cents=500, currency=INR]`]],
        [['View vs copy.',
            r`List<String> src = new ArrayList<>(List.of("a"));
List<String> view = Collections.unmodifiableList(src), copy = List.copyOf(src);
src.add("b");
System.out.println(view + " " + copy);

// OUTPUT:
// [a, b] [a]`],
            ['Shallow immutability trap.',
                r`record Team(List<String> members) {}
List<String> m = new ArrayList<>(List.of("a"));
Team t = new Team(m);
m.add("b");                          // the record sees this change
System.out.println(t.members());

// OUTPUT:
// [a, b]
// Fix: add compact constructor Team { members = List.copyOf(members); }`]]
    ),

    'multicatch-finally-trap': x(
        ['<b>Multi-catch</b> handles several exception types in one block: <code>catch (IOException | SQLException e)</code>.',
            'The types must <b>not be related</b> by inheritance (no subclass and superclass in the same multi-catch).',
            'In a multi-catch the variable <code>e</code> is <b>implicitly final</b>.'],
        ['<code>finally</code> <b>runs after</b> try/catch, even when try or catch return or throw.',
            'A <code>return</code> inside <code>finally</code> <b>overrides</b> a return value or a thrown exception: this is the <b>try-finally return trap</b>.',
            'The <b>return value is evaluated</b> before <code>finally</code> runs; changing a primitive in <code>finally</code> does not change it.'],
        ['<b>Never</b> <code>return</code>, <code>break</code> or <code>throw</code> from <code>finally</code>: it swallows exceptions and hides bugs.',
            'Prefer <b>try-with-resources</b> to <code>finally</code> for cleanup.',
            'If <code>finally</code> itself throws, the <b>new exception replaces</b> the original one.'],
        [['F', 'What is a multi-catch?', 'A catch block handling multiple exception types separated by |.'],
            ['F', 'Does finally always run?', 'Yes, except if the JVM exits (System.exit) or crashes.'],
            ['M', 'What does return in finally do?', 'It overrides the return value or the exception from try or catch.'],
            ['M', 'Can multi-catch types be related?', 'No, a subclass and its superclass cannot appear together.'],
            ['S', 'What does this return: try { return 1; } finally { x = 2; }?', 'The value 1 (already evaluated); finally cannot change a returned primitive.'],
            ['S', 'Why is throwing from finally dangerous?', 'It replaces the original exception, losing the root cause.']],
        [['The try-finally return trap.',
            r`static int a() {
    try { return 1; } finally { return 2; }
}
static int b() {
    int x = 1;
    try { return x; } finally { x = 2; }
}
static int c() {
    try { throw new RuntimeException("lost"); } finally { return 3; }
}
System.out.println(a() + " " + b() + " " + c());

// OUTPUT:
// 2 1 3`],
            ['Multi-catch.',
                r`try {
    Object o = List.of();
    ((List<Object>) o).add(1);
}
catch (UnsupportedOperationException | ClassCastException e) {
    System.out.println(e.getClass().getSimpleName());
}
// catch (RuntimeException | UnsupportedOperationException e)
//   -> compile error: alternatives cannot be related by subclassing

// OUTPUT:
// UnsupportedOperationException`]],
        [['Exception replaced by finally.',
            r`try {
    try { throw new IllegalStateException("original"); }
    finally { throw new RuntimeException("from finally"); }
} catch (RuntimeException e) { System.out.println(e.getMessage());
}

// OUTPUT:
// from finally`],
            ['Order of output.',
                r`static String order() {
    StringBuilder sb = new StringBuilder();
    try {
        sb.append("T");
        return sb.append("R").toString();   // "TR" is already a String
    } finally {
        sb.append("F");
        System.out.println("finally " + sb);
    }
}
System.out.println(order());

// OUTPUT:
// finally TRF
// TR`]]
    )
};

export const java08Deep: Record<string, Deep> = {
    'try-with-resources': dv(
        [`The compiler expands <code>try (R r = init) { body }</code> into plain try/catch code.
<ul>
<li>An exception from the body is saved as the <b>primary</b> exception.</li>
<li><code>r.close()</code> then runs in a nested try. A close failure is added with <code>addSuppressed</code> and does not replace the primary.</li>
<li>If a later resource fails to open, the ones already opened are closed in reverse order.</li>
<li>The resource variable is implicitly <code>final</code>.</li>
</ul>`,
            r`class R implements AutoCloseable {
    final String n;
    R(String n, boolean failOpen) {
        this.n = n;
        if (failOpen) throw new IllegalStateException("cannot open " + n);
        System.out.println("open " + n);
    }
    public void close() { System.out.println("close " + n); }
}
try (R a = new R("A", false); R b = new R("B", true)) {
    System.out.println("never runs");
} catch (IllegalStateException e) {
    System.out.println(e.getMessage());
}

// OUTPUT:
// open A
// close A
// cannot open B`],
        [`Design tips for your own resources:
<ul>
<li>Implement <code>AutoCloseable</code> and document whether <code>close()</code> can throw.</li>
<li>Make <code>close()</code> idempotent and release in reverse order of acquisition.</li>
<li>Use <code>Cleaner</code> only as a safety net, never as the main way to release.</li>
</ul>
Common patterns: scoped transactions (commit on success, rollback on failure), lock wrappers, temporary directories, tracing spans and test fixtures. <code>Scanner</code> and <code>ExecutorService</code> (Java 19+) are also AutoCloseable.`,
            r`class Tx implements AutoCloseable {
    private boolean committed;
    private final String name;
    Tx(String n) {
        name = n;
        System.out.println("begin " + n);
    }
    void commit() { committed = true; }
    @Override public void close() {
        System.out.println(committed ? "commit " + name : "rollback " + name);
    }
}
try (Tx t = new Tx("T1")) { t.commit(); }
try (Tx t = new Tx("T2")) {
    throw new RuntimeException("fail");
} catch (RuntimeException e) { }
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    ex.submit(() -> System.out.println("task"));   // close() waits for tasks
}

// OUTPUT:
// begin T1
// commit T1
// begin T2
// rollback T2
// task`],
        [`Common mistakes:
<ul>
<li>Closing manually inside the try, which causes a double close.</li>
<li>Swallowing exceptions inside <code>close()</code>.</li>
<li>Returning a resource from the try block. It is already closed on exit.</li>
<li>Forgetting that <code>Files.lines</code> and <code>Files.walk</code> must be closed.</li>
<li>Using the resource after the block.</li>
</ul>
Closing a wrapper also closes the stream inside it. A leak shows up as "too many open files".`,
            r`Stream<String> leak = Files.lines(Path.of("a.txt"));   // never closed: handle leak
try (Stream<String> ok = Files.lines(Path.of("a.txt"))) {
    ok.count();                                          // closed automatically
}
BufferedReader br = new BufferedReader(new FileReader("a.txt"));
try (br) { }
br.readLine();                          // IOException: Stream closed

// OUTPUT:
// (no console output) the last line throws IOException: Stream closed
// tip: watch open handles with lsof or Process Explorer`],
        [`try-with-resources costs no more than a correct try-finally.
<ul>
<li>Close (or flush) a wrapper before the stream it wraps. Closing the wrapper does this for you.</li>
<li>Create the wrapper in the try header so one close handles the whole chain.</li>
<li>A pooled connection is returned to the pool on <code>close()</code>. The socket stays open.</li>
</ul>`,
            r`try (var out = new BufferedWriter(new FileWriter("out.txt"))) {
    out.write("data");    // closing the wrapper flushes and closes the writer
}
try (HikariDataSource ds = new HikariDataSource(cfg);
     Connection c = ds.getConnection()) {
    // close() returns the connection to the pool
}

// OUTPUT:
// (no console output) "data" is flushed to out.txt before the file closes`],
        [`Real-world uses: JDBC code, file processing, HTTP responses, and test resources (temporary files and servers).`,
            r`String sql = "UPDATE accounts SET balance = balance - ? WHERE id = ?";
try (var conn = ds.getConnection(); var ps = conn.prepareStatement(sql)) {
    conn.setAutoCommit(false);
    ps.setLong(1, 500);
    ps.setLong(2, 7);
    ps.executeUpdate();
    conn.commit();
} catch (SQLException e) {
    throw new DataAccessException("transfer failed", e);
}

// OUTPUT:
// the statement and connection are always released`]
    ),

    'varargs': dv(
        [`Varargs is compile-time sugar: <code>m(String... a)</code> compiles to <code>m(String[] a)</code> with the ACC_VARARGS flag, and calls <code>m("x", "y")</code> become <code>m(new String[]{"x", "y"})</code>. Overload resolution runs in three phases: strict (no boxing, no varargs), loose (boxing), then varargs. A call that matches in an earlier phase never considers varargs methods.`,
            r`static String m(Object o) { return "Object"; }
static String m(Object... o) { return "varargs"; }
static String n(int... a) { return "int..."; }
static String n(Integer... a) { return "Integer..."; }
System.out.println(m("x") + " " + m("x", "y") + " " + m());
// n(1);   // error: reference to n is ambiguous

// OUTPUT:
// Object varargs varargs`],
        [`Generic varargs create a generic array (<code>T[]</code>), which is unsafe; the compiler warns about possible heap pollution. <code>@SafeVarargs</code> (on static, final, private methods and constructors) suppresses it when the method only reads the array. JDK examples: <code>Arrays.asList</code>, <code>List.of</code> (fixed-arity overloads up to 10 then varargs), <code>EnumSet.of</code>, <code>Stream.of</code>.`,
            r`static <T> T[] unsafe(T... a) { return a; }   // leaks the generic array
Object[] o = unsafe(1, "x");        // T is inferred as a common supertype
System.out.println(o.getClass().getSimpleName());

@SafeVarargs
static <T> Set<T> setOf(T... items) {
    return new LinkedHashSet<>(Arrays.asList(items));
}
System.out.println(setOf(1, 2, 2, 3));

// OUTPUT:
// Serializable[]
// [1, 2, 3]`],
        [`Mistakes: passing a primitive array to Object... (becomes one element), ambiguous overloads, mutating the varargs array that the caller passed (it is the caller's array), forgetting the null case, using varargs where a List parameter is clearer, and boxing surprises with <code>Arrays.asList(int[])</code>.`,
            r`int[] nums = {1, 2, 3};
System.out.println(Arrays.asList(nums).size() + " "      // int[] is ONE element
    + Arrays.asList(1, 2, 3).size() + " "
    + Stream.of(nums).count() + " "
    + IntStream.of(nums).count());
static void clear(String... a) { Arrays.fill(a, null); }
String[] mine = {"a", "b"};
clear(mine);                    // the caller array is changed
System.out.println(Arrays.toString(mine));

// OUTPUT:
// 1 3 1 3
// [null, null]`],
        [`Every varargs call allocates an array and the JIT may not remove it if it escapes. In hot code add fixed-arity overloads for common counts (as the JDK does) or pass a pre-built array.`,
            r`static int sum(int... a) {
    int s = 0;
    for (int v : a) s += v;
    return s;
}
static int sum(int a, int b) { return a + b; }   // fixed-arity fast path
long t = System.nanoTime();
long s = 0;
for (int i = 0; i < 50_000_000; i++) s += sum(i, 1);
System.out.println(s > 0 ? "ms=" + (System.nanoTime() - t) / 1_000_000 : "");

// OUTPUT: (varies)
// ms=20`],
        [`Real-world: logging (<code>log.info("user {} did {}", user, action)</code>) uses varargs and defers formatting until the level is enabled; builder helpers and test utilities accept varargs for readability.`,
            r`static void audit(String template, Object... args) {
    if (log.isInfoEnabled()) {
        log.info(String.format(template, args));
    }
}
audit("user=%s action=%s", "abaji", "login");

// OUTPUT:
// user=abaji action=login`]
    ),

    'initializer-blocks': dv(
        [`Class initialization (<code>&lt;clinit&gt;</code>) is triggered on first use: <code>new</code>, static method call, static field access (except compile-time constants), subclass initialization, or <code>Class.forName</code>. The JVM guarantees it runs once, under a per-class lock, with other threads waiting. Instance blocks are copied by the compiler into each constructor that starts with <code>super(...)</code>, after the super call and before the rest of the body, in textual order with field initializers.`,
            r`class Lazy {
    static { System.out.println("Lazy init"); }
    static final int CONST = 42;
    static int value = 1;
}
System.out.println("start");
int c = Lazy.CONST;      // compile-time constant: no initialization
System.out.println("after const");
int v = Lazy.value;      // triggers it

// OUTPUT:
// start
// after const
// Lazy init`],
        [`Uses: loading lookup tables, registering drivers (<code>Class.forName("com.mysql.cj.jdbc.Driver")</code> used to rely on this), singletons via the holder idiom, enum constants, static final map setup, and shared instance setup in anonymous classes. Alternatives: static factory methods that build the map, <code>Map.of</code>, constructors, or <code>Supplier</code> based lazy values.`,
            r`class Holder {
    private Holder() {}
    private static class L { static final Holder I = new Holder(); }
    static Holder get() { return L.I; }
}
class Cfg {   // no static block needed
    static final Map<String, String> DEFAULTS = Map.of("mode", "prod", "port", "8080");
}
System.out.println(Holder.get() == Holder.get() ? Cfg.DEFAULTS.get("port") : "?");

// OUTPUT:
// 8080`],
        [`Mistakes: heavy or failing work in static blocks (the class becomes unusable: <code>NoClassDefFoundError</code>), static initialization cycles (A needs B while B needs A: one sees default values or deadlocks across threads), reading a static field before it is initialized due to textual order, and relying on initialization order in tests.`,
            r`class A { static int x = B.y + 1; }
class B { static int y = A.x + 1; }
System.out.println(A.x + " " + B.y);

// OUTPUT:
// 2 1     (cyclic initialization: B sees A.x as 0)`],
        [`Class initialization is serialized, so slow static blocks delay every thread that needs the class (startup stalls). Keep them light, defer expensive work to lazy holders, and avoid I/O. GraalVM native image can run initializers at build time (<code>--initialize-at-build-time</code>).`,
            r`// java -Xlog:class+init=info -jar app.jar
//   shows which classes initialize and when
// [info][class,init] 1234 Initializing 'com.acme.HeavyConfig' (0x...)

// OUTPUT:
// find slow initializers at startup`],
        [`Real-world: JDBC drivers used to register themselves in a static block, and logging frameworks initialize in static fields. A common production bug is a failing static initializer hiding behind later NoClassDefFoundError messages: look for the first ExceptionInInitializerError in the logs.`,
            r`// first failure:
//   java.lang.ExceptionInInitializerError
//   Caused by: java.io.FileNotFoundException: config.yml
// later failures:
//   java.lang.NoClassDefFoundError: Could not initialize class com.acme.Settings

// OUTPUT:
// fix the first cause; the later errors are only a symptom`]
    ),

    'custom-exceptions': dv(
        [`<p>A custom exception inherits everything from <code>Throwable</code>:</p>
<ul>
<li>The constructor captures the stack trace (<code>fillInStackTrace</code>).</li>
<li>Causes are chained with <code>getCause</code>, and suppressed exceptions are supported.</li>
<li>Overload the constructors (message, cause, message + cause) and consider a <code>serialVersionUID</code>.</li>
<li>Fields should be serializable or <code>transient</code>, because exceptions may be serialized (RMI, distributed caches).</li>
</ul>`,
            r`class ValidationException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final String field;
    ValidationException(String field, String message) {
        super(field + ": " + message);
        this.field = field;
    }
    String field() { return field; }
}
try {
    throw new ValidationException("email", "must contain @");
} catch (ValidationException e) {
    System.out.println(e.field() + " -> " + e.getMessage());
}

// OUTPUT:
// email -> email: must contain @`],
        [`<p>Design an error model with these parts:</p>
<ul>
<li>A small, documented hierarchy: <code>AppException</code> with <code>NotFound</code>, <code>Conflict</code> and <code>Validation</code> children.</li>
<li>Stable error codes (strings or enums) for clients, and one HTTP status per type.</li>
<li>Structured details (problem+json) and correlation ids in logs.</li>
<li>Message text kept separate from codes, so it can be localized.</li>
<li>Tests that assert on type and code, not on message text.</li>
</ul>`,
            r`enum ErrorCode {
    NOT_FOUND(404), CONFLICT(409), INVALID(400);
    final int http;
    ErrorCode(int h) { http = h; }
}
class ApiException extends RuntimeException {
    final ErrorCode code;
    ApiException(ErrorCode c, String m) {
        super(m);
        code = c;
    }
}
record Problem(String code, String detail, String traceId) {}

@ExceptionHandler(ApiException.class)
ResponseEntity<Problem> on(ApiException e) {
    Problem p = new Problem(e.code.name(), e.getMessage(), MDC.get("traceId"));
    return ResponseEntity.status(e.code.http).body(p);
}

// OUTPUT:
// HTTP 404 {"code":"NOT_FOUND","detail":"order 42 not found","traceId":"ab12"}`],
        [`<p>Common mistakes:</p>
<ul>
<li>One giant generic exception for everything, or exceptions used as return codes.</li>
<li>Leaking internal details (SQL, file paths) to clients.</li>
<li>Forgetting the cause when wrapping.</li>
<li>Deep hierarchies that nobody catches by type, or checked exceptions that force every caller to wrap.</li>
<li>Messages with no ids, which are hard to search in logs. Include identifiers and keep user-facing text separate.</li>
</ul>`,
            r`// Bad: says nothing
throw new RuntimeException("Error");

// Good: the class carries the meaning
throw new OrderNotFoundException(orderId);

class OrderNotFoundException extends ApiException {
    OrderNotFoundException(long id) {
        super(ErrorCode.NOT_FOUND, "order " + id + " not found");
    }
}

// OUTPUT:
// searchable, typed, mappable errors`],
        [`<p>Capturing the stack trace is the main cost of creating an exception. In performance-critical parsers that use exceptions for rare, expected control flow, you can create stackless exceptions with <code>super(msg, null, false, false)</code>. Everywhere else, keep the trace. Avoid very deep cause chains in logs.</p>`,
            r`class Stackless extends RuntimeException {
    Stackless(String m) { super(m, null, false, false); }
}
System.out.println(new Stackless("x").getStackTrace().length);

// OUTPUT:
// 0`],
        [`<p>Real-world: payment exceptions carry a <code>retryable</code> flag, so the retry policy knows what to retry.</p>`,
            r`class PaymentException extends RuntimeException {
    final boolean retryable;
    PaymentException(String m, boolean retryable, Throwable cause) {
        super(m, cause);
        this.retryable = retryable;
    }
}
for (int attempt = 1; ; attempt++) {
    try {
        gateway.charge(order);
        break;
    } catch (PaymentException e) {
        if (!e.retryable || attempt == 3) throw e;  // give up
        Thread.sleep(200L * attempt);               // back off, then retry
    }
}

// OUTPUT:
// transient gateway errors are retried up to 3 times; declines fail immediately`]
    ),

    'marker-interfaces': dv(
        [`A marker interface works through type checks: <code>instanceof</code>, <code>Class.isAssignableFrom</code> or generic bounds. The JDK uses them inside the runtime: <code>ObjectOutputStream</code> checks <code>Serializable</code>, <code>Object.clone</code> checks <code>Cloneable</code> (an instance check performed natively), <code>Collections.shuffle</code> uses <code>RandomAccess</code> to choose an algorithm, and <code>EventListener</code> tags listener types.`,
            r`static <T> void shuffleLike(List<T> l) {
    boolean fast = l instanceof RandomAccess;
    System.out.println(fast ? "index-based algorithm" : "iterator-based algorithm");
}
shuffleLike(new ArrayList<>());
shuffleLike(new LinkedList<>());
boolean isMarked = Serializable.class.isAssignableFrom(String.class);
System.out.println(isMarked + " " + Serializable.class.getMethods().length);

// OUTPUT:
// index-based algorithm
// iterator-based algorithm
// true 0`],
        [`Alternatives: annotations (data and tooling, but not types), sealed interfaces (closed families with exhaustive switches), capability interfaces with methods, and generic bounds (<code>&lt;T extends Auditable&gt;</code>). A marker works well with generics to restrict APIs at compile time; an annotation is better for framework scanning and for tagging methods and fields.`,
            r`sealed interface Event permits UserEvent, SystemEvent {}
record UserEvent(String user) implements Event {}
record SystemEvent(String name) implements Event {}
static <E extends Event> void publish(E e) { System.out.println("publishing " + e); }
interface Cacheable {}
static <T extends Cacheable> T cached(Supplier<T> s) { return s.get(); }
publish(new UserEvent("abaji"));    // publish("text") would not compile

// OUTPUT:
// publishing UserEvent[user=abaji]`],
        [`Mistakes: marker interfaces on classes where an annotation fits better, inherited markers that tag subclasses unintentionally (a subclass of a Serializable class is Serializable), expecting markers to enforce behavior, and creating empty interfaces instead of real abstractions. The marker gives a promise, not a check of the implementation.`,
            r`class Base implements Serializable {}
class Child extends Base {
    Thread t = new Thread();    // inherits the tag but has a non-serializable field
}
ByteArrayOutputStream bytes = new ByteArrayOutputStream();
try {
    new ObjectOutputStream(bytes).writeObject(new Child());
} catch (NotSerializableException e) {
    System.out.println("promise broken: " + e.getMessage());
}

// OUTPUT:
// promise broken: java.lang.Thread`],
        [`Marker checks are cheap instanceof tests. Reflection scans for annotations cost startup time; precompute type sets at startup or at build time (annotation processors, Spring AOT).`,
            r`interface Auditable {}
class Order implements Auditable {}
static final Set<Class<?>> AUDITABLE = ConcurrentHashMap.newKeySet();
static boolean auditable(Object o) {
    Class<?> c = o.getClass();
    return AUDITABLE.contains(c) || (o instanceof Auditable && AUDITABLE.add(c));
}
System.out.println(auditable(new Order()) + " " + auditable(new Order()));
System.out.println(auditable("text"));

// OUTPUT:
// true true
// false`],
        [`Real-world: <code>Serializable</code> marks session and cache classes, a custom <code>@Transactional</code> annotation tags methods, and a <code>PersonalData</code> marker interface lets a logging utility mask any tagged type.`,
            r`interface PersonalData {}
record Customer(String name, String phone) implements PersonalData {}
static String safeLog(Object o) {
    if (o instanceof PersonalData) return o.getClass().getSimpleName() + "[REDACTED]";
    return String.valueOf(o);
}
System.out.println(safeLog(new Customer("Abaji", "999")) + " " + safeLog(42));

// OUTPUT:
// Customer[REDACTED] 42`]
    ),

    'object-class': dv(
        [`Every object has a header (mark word: identity hash, GC age, lock state; class pointer), so every class inherits <code>Object</code> methods. <code>hashCode</code> default is an identity hash generated lazily and stored in the header. <code>toString</code> default uses <code>getClass().getName() + "@" + Integer.toHexString(hashCode())</code>. <code>wait/notify</code> use the object monitor; calling them without owning it throws <code>IllegalMonitorStateException</code>. <code>finalize</code> is deprecated for removal.`,
            r`Object a = new Object();
System.out.println(a.hashCode() == System.identityHashCode(a));
String s = new String("x");
System.out.println(s.hashCode() == System.identityHashCode(s));  // String overrides it
Object lambda = (Runnable) () -> {};
System.out.println(int[].class.getSuperclass().getSimpleName()
    + " " + lambda.getClass().isSynthetic());

// OUTPUT:
// true
// false
// Object true`],
        [`Best practice implementations: <code>toString</code> includes the identity-defining fields (never secrets), <code>equals</code>/<code>hashCode</code> use the same fields, no <code>clone</code> (use copy constructors), no <code>finalize</code> (use <code>AutoCloseable</code> and <code>Cleaner</code>). Records and Lombok generate the trio. <code>getClass()</code> is final and returns the runtime class; <code>Class</code> objects support reflection and generics via <code>Class&lt;? extends X&gt;</code>.`,
            r`record User(long id, String email, String password) {
    @Override public String toString() {
        return "User[id=" + id + ", email=" + email + "]";  // password omitted
    }
}
final class Res implements AutoCloseable {
    private static final Cleaner CLEANER = Cleaner.create();
    private final Cleaner.Cleanable cleanable = CLEANER.register(
        this, () -> System.out.println("native memory released"));
    public void close() { cleanable.clean(); }
}
try (Res r = new Res()) { }
System.out.println(new User(1, "a@x.com", "secret"));

// OUTPUT:
// native memory released
// User[id=1, email=a@x.com]`],
        [`Mistakes: toString that exposes secrets or triggers lazy loading and recursion (parent and child toString calling each other), equals using getClass in frameworks with proxies (Hibernate proxies are subclasses), hashCode based on mutable state, calling wait outside synchronized, using finalize, and relying on identity hash codes for ordering.`,
            r`class Parent {
    List<Child> kids = new ArrayList<>();
    public String toString() { return "Parent" + kids; }
}
class Child {
    Parent p;
    public String toString() { return "Child of " + p; }
}
Parent p = new Parent();
Child c = new Child();
c.p = p;
p.kids.add(c);
try { p.toString(); }
catch (StackOverflowError e) { System.out.println("toString recursion"); }

// OUTPUT:
// toString recursion`],
        [`Identity hash codes and monitors are stored in the header and cost memory only when used. Avoid synchronizing on objects you do not own. <code>Object</code> methods are intrinsics the JIT optimizes; the cost of <code>equals</code>/<code>hashCode</code> is the cost of your fields.`,
            r`Object lock = new Object();
long t = System.nanoTime();
for (int i = 0; i < 100_000_000; i++) {
    synchronized (lock) { }  // uncontended: optimized away or very cheap
}
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=5`],
        [`Real-world: debugging with a useful toString, and using <code>Objects</code> helpers to write short null-safe methods.`,
            r`// Inside class Order (fields: id, status, total)
@Override public String toString() {
    return new StringJoiner(", ", "Order[", "]")
        .add("id=" + id).add("status=" + status).add("total=" + total)
        .toString();
}
@Override public boolean equals(Object o) {
    return this == o || (o instanceof Order other && id == other.id);
}
@Override public int hashCode() { return Long.hashCode(id); }

// OUTPUT:
// Order[id=42, status=PAID, total=99.5]`]
    ),

    'string-formatting': dv(
        [`<code>Formatter</code> parses <code>%[argument_index$][flags][width][.precision]conversion</code>. Flags: <code>-</code> left align, <code>0</code> zero pad, <code>,</code> grouping, <code>+</code> sign, <code>(</code> negatives in parentheses, <code>#</code> alternate. Conversions: <code>s S d f e g x o c b n %</code>, and date/time <code>t</code>. Formatting uses the default locale unless a Locale is passed. <code>%f</code> rounds HALF_UP.`,
            r`String p = "%08.3f|%+d|%(d|%#x|%e|%10.4s|%S";
System.out.println(String.format(p, 3.14159, 5, -7, 255, 12345.678, "truncate", "shout"));
String de = String.format(Locale.GERMANY, "%,.2f", 1234567.891);
String us = String.format(Locale.US, "%,.2f", 1234567.891);
System.out.println(de + " " + us);
System.out.println(String.format("%.0f %.0f %.1f", 0.5, 1.5, 0.25));

// OUTPUT:
// 0003.142|+5|(7)|0xff|1.234568e+04|      trun|SHOUT
// 1.234.567,89 1,234,567.89
// 1 2 0.3`],
        [`Tools you can pick from:
<ul>
<li><code>NumberFormat</code>: currency, percent and compact numbers (<code>getCompactNumberInstance</code>).</li>
<li><code>DecimalFormat</code>: custom patterns such as <code>#,##0.00</code>.</li>
<li><code>DateTimeFormatter</code>: thread-safe, with <code>ofPattern</code> and <code>ofLocalizedDate</code>.</li>
<li><code>MessageFormat</code> and <code>ChoiceFormat</code>: messages and plurals.</li>
<li>Text blocks with <code>formatted</code>, and <code>String.join</code> / <code>StringJoiner</code> for lists.</li>
<li>Logging frameworks use <code>{}</code> placeholders.</li>
</ul>`,
            r`System.out.println(new DecimalFormat("#,##0.00").format(1234567.5));
NumberFormat.Style s = NumberFormat.Style.SHORT;
System.out.println(NumberFormat.getCompactNumberInstance(Locale.US, s).format(1_250_000));
String m = "{0} has {1,number,integer} items costing {2,number,currency}";
System.out.println(MessageFormat.format(m, "Cart", 3, 99.5));
String report = """
    Name: %s
    Total: %,.2f
    """.formatted("Abaji", 12345.5);
System.out.print(report);

// OUTPUT:
// 1,234,567.50
// 1M
// Cart has 3 items costing $99.50
// Name: Abaji
// Total: 12,345.50`],
        [`Common mistakes:
<ul>
<li>Forgetting the <code>Locale</code> (you may get decimal commas on some machines).</li>
<li>Sharing <code>SimpleDateFormat</code> across threads (not thread-safe; use <code>DateTimeFormatter</code>).</li>
<li>Using <code>%.2f</code> on a double for money (it hides rounding errors; use <code>BigDecimal</code>).</li>
<li>Specifiers that do not match the arguments, or <code>%d</code> with a double (run-time exceptions).</li>
<li>Concatenating user input into the format string (format string injection).</li>
</ul>`,
            r`String userInput = "%s %s %s";
try {
    String.format(userInput, "only one");
} catch (MissingFormatArgumentException e) {
    System.out.println("format string injection: " + e.getMessage());
}
System.out.println(String.format("%s", userInput));  // safe: user text is an argument
BigDecimal bd = new BigDecimal("2.675").setScale(2, RoundingMode.HALF_UP);
System.out.println(bd + " vs " + String.format("%.2f", 2.675));

// OUTPUT:
// format string injection: Format specifier '%s'
// %s %s %s
// 2.68 vs 2.68`],
        [`<code>String.format</code> parses the pattern on every call, so it is slower than <code>StringBuilder</code> or concatenation. In hot paths, build the text with <code>StringBuilder.append</code>. Keep thread-safe formatters (such as <code>DateTimeFormatter</code>) in constants. In logs, use placeholders so nothing is formatted when the level is off.`,
            r`static final DateTimeFormatter F = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
long t = System.nanoTime();
for (int i = 0; i < 200_000; i++) {
    String s = String.format("%d:%s", i, "x");
}
long fmt = System.nanoTime() - t;
t = System.nanoTime();
for (int i = 0; i < 200_000; i++) {
    String s = i + ":" + "x";
}
System.out.println(fmt > (System.nanoTime() - t));  // timing varies; usually true

// OUTPUT:
// true`],
        [`Receipts, reports and CSV exports use explicit locales, widths and rounding rules. Invoices use <code>BigDecimal</code> with <code>NumberFormat.getCurrencyInstance</code>.`,
            r`BigDecimal total = new BigDecimal("1234.5");
NumberFormat inr = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
System.out.printf("%-12s %12s%n", "Total", inr.format(total));
BigDecimal gst = total.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
System.out.printf("%-12s %12s%n", "GST 18%", inr.format(gst));

// OUTPUT:
// Total           ₹1,234.50
// GST 18%           ₹222.21`]
    ),

    'immutable-classes': dv(
        [`Immutability is safe publication by construction: the Java Memory Model guarantees that final fields assigned in the constructor are visible to every thread that obtains the reference (the freeze action), even through a data race, provided <code>this</code> does not escape the constructor. All fields must be final (or effectively never changed), the class must not be extendable (or all methods final), and no mutable state may be exposed.`,
            r`public final class Range {
    private final int lo, hi;
    public Range(int lo, int hi) {
        if (lo > hi) throw new IllegalArgumentException(lo + " > " + hi);
        this.lo = lo;
        this.hi = hi;
    }
    public Range shift(int d) { return new Range(lo + d, hi + d); } // new object
    public boolean contains(int v) { return v >= lo && v <= hi; }
    @Override public boolean equals(Object o) {
        return o instanceof Range r && r.lo == lo && r.hi == hi;
    }
    @Override public int hashCode() { return Objects.hash(lo, hi); }
}
Range r = new Range(1, 5);
System.out.println(r.shift(10).contains(12) + " " + r.contains(12));

// OUTPUT:
// true false`],
        [`Techniques: records, builders for many fields (<code>toBuilder</code>), withers, <code>List.copyOf</code>/<code>Map.copyOf</code>, persistent collections (Vavr, Eclipse), <code>Collections.unmodifiable*</code> views over private copies, immutable <code>java.time</code> types, <code>BigDecimal</code>, <code>Optional</code>, and enums. Lazily computed fields (the hash code in <code>String</code>) are allowed when every thread computes the same value. Records are shallowly immutable: copy collection components in the compact constructor.`,
            r`record Cart(List<String> items, Map<String, Integer> qty) {
    Cart {
        items = List.copyOf(items);
        qty = Map.copyOf(qty);
    }
    Cart add(String item) {
        List<String> n = new ArrayList<>(items);
        n.add(item);
        Map<String, Integer> q = new HashMap<>(qty);
        q.merge(item, 1, Integer::sum);
        return new Cart(n, q);                  // wither: returns a new Cart
    }
}
Cart c0 = new Cart(List.of(), Map.of());
Cart c1 = c0.add("pen").add("pen");
System.out.println(c0.items().size() + " " + c1.items() + " " + c1.qty());

// A lazy hash is a benign race: every thread computes the same value
final class Lazy {
    private final String raw;
    private int hash;
    Lazy(String r) { raw = r; }
    @Override public int hashCode() {
        int h = hash;
        if (h == 0) hash = h = raw.hashCode();
        return h;
    }
}

// OUTPUT:
// 0 [pen, pen] {pen=2}`],
        [`Mistakes: non-final class with final fields (a subclass can add mutable state), returning internal arrays or collections, storing caller-supplied mutable objects without copying, letting <code>this</code> escape in the constructor, <code>Date</code> or arrays as fields, setters added later for convenience, and assuming <code>Collections.unmodifiableList</code> is a copy. Review every getter and constructor argument.`,
            r`final class Bad {
    private final int[] data;
    Bad(int[] d) { data = d; }              // stores the caller's array
    int[] data() { return data; }           // leaks the internal array
}
final class Good {
    private final int[] data;
    Good(int[] d) { data = d.clone(); }     // copy IN
    int[] data() { return data.clone(); }   // copy OUT
}
int[] src = {1, 2, 3};
Bad b = new Bad(src);
src[0] = 99;
b.data()[1] = 88;
System.out.println(Arrays.toString(b.data()));

// OUTPUT:
// [99, 88, 3]`],
        [`Trade-offs: immutability trades allocation for safety; the young-generation GC makes short-lived small objects cheap. For large structures use structural sharing (persistent trees) so updates copy only the path. Immutable keys can cache hash codes. Avoid defensive copies on every call by returning unmodifiable views over private immutable data.`,
            r`// Immutable list: safe to share, no copies needed
List<Integer> base = IntStream.range(0, 100_000).boxed().toList();
// 1,000 parallel tasks read base at once, with no locks
long evens = IntStream.range(0, 1000).parallel()
    .mapToLong(i -> base.stream().filter(v -> v % 2 == 0).count())
    .sum();
System.out.println(evens);

// OUTPUT:
// 50000000`],
        [`Real-world: value objects (Money, Email, Address), configuration snapshots (swap a new immutable config atomically with <code>AtomicReference</code>), cache keys, events, DTOs and messages passed between threads or services.`,
            r`record Settings(String url, int pool, boolean debug) {}
AtomicReference<Settings> current = new AtomicReference<>(new Settings("db1", 10, false));
Settings s1 = current.get();                    // readers see a consistent snapshot
current.set(new Settings("db2", 20, false));    // reload swaps the whole object
System.out.println(s1.url() + " -> " + current.get().url());

// OUTPUT:
// db1 -> db2`]
    ),

    'multicatch-finally-trap': dv(
        [`The compiler inlines the finally block's code at every exit point of try and catch (normal end, return, break, continue) and adds a catch-all handler that runs finally then rethrows. For <code>return expr</code> it evaluates expr, stores it in a temporary, runs finally, then returns the temporary — unless finally itself returns or throws. A multi-catch parameter is final and its static type is the closest common supertype of the alternatives, so you can call only common members.`,
            r`static int calc() {
    int x = 10;
    try {
        x += 5;
        return x;
    }  // 15 stored in a temp
    finally {
        x += 100;
        System.out.println("finally x=" + x);
    }
}
static int[] arr() {
    int[] a = {1};
    try { return a; } finally { a[0] = 2; }   // same reference: change is visible
}
System.out.println(calc() + " " + arr()[0]);

// OUTPUT:
// finally x=115
// 15 2`],
        [`Rules:<ul><li>Multi-catch alternatives cannot be related by subclassing.</li><li>Rethrowing the multi-catch variable keeps <b>precise types</b>, so the method can declare just those exceptions.</li><li>A catch can also throw a different exception with the original as its cause.</li><li><code>finally</code> is skipped by <code>System.exit</code>, <code>Runtime.halt</code>, an infinite loop or a JVM crash.</li><li>Daemon threads may be stopped before <code>finally</code> runs when the JVM exits.</li></ul>`,
            r`static void run() throws IOException, SQLException {
    try {
        if (Math.random() > 2) throw new IOException();  // never true
        throw new SQLException("db");
    } catch (IOException | SQLException e) {
        System.out.println("handling " + e.getClass().getSimpleName());
        throw e;   // precise rethrow keeps both types
    }
}
try { run(); }
catch (IOException | SQLException e) { System.out.println("outer " + e.getMessage()); }

// OUTPUT:
// handling SQLException
// outer db`],
        [`Traps:<ul><li><code>return</code>, <code>break</code>, <code>continue</code> or <code>throw</code> inside <code>finally</code> swallow earlier exceptions, even <code>OutOfMemoryError</code>.</li><li>A <code>finally</code> that throws replaces the original (try-with-resources keeps it as suppressed).</li><li>Catching <code>Exception</code> and rethrowing it wrapped loses the precise type.</li><li>Assuming <code>finally</code> changes an already returned primitive.</li></ul>Static analyzers flag these (javac <code>-Xlint:finally</code>).`,
            r`static String trap() {
    for (int i = 0; i < 3; i++) {
        try {
            if (i == 1) throw new RuntimeException("boom at " + i);
        } finally {
            if (i == 1) continue;   // swallows the exception, loop goes on
        }
    }
    return "completed without error";
}
System.out.println(trap());

// OUTPUT:
// completed without error`],
        [`Exception tables make try blocks free on the normal path. Duplicated finally code slightly enlarges bytecode but costs nothing at run time. The expensive part is creating exceptions (stack trace). Keep finally blocks short and non-throwing; put resource cleanup in try-with-resources.`,
            r`// javap -c -p Main shows the exception table (from/to/target/type)
// and the finally code duplicated before each return

// OUTPUT:
// Exception table:
//    from  to  target  type
//       0   8      14  Class java/lang/RuntimeException
//       0   8      25  any`],
        [`Real-world: cleanup must not hide the real failure. Log or add suppressed exceptions in finally, and never let cleanup failures mask the business exception.`,
            r`Exception primary = null;
try { process(); }
catch (Exception e) {
    primary = e;
    throw e;
}
finally {
    try { connection.close(); }
    catch (SQLException closeFailure) {
        if (primary != null) primary.addSuppressed(closeFailure);
        else throw new UncheckedSQLException(closeFailure);
    }
}

// OUTPUT:
// the original exception is thrown with close() failures attached as suppressed`]
    )
};
