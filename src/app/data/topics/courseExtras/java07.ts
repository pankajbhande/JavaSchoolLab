// Core Java extras, part 7: advanced language features, first half (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java07Extras: Record<string, Extra> = {
    'enums-in-java': x(
        ['<b>Enum</b>: a fixed set of named constants, such as <code>enum Day { MON, TUE, WED }</code>.',
            '<b>Enums are classes</b>: they can have fields, constructors and methods, and can implement interfaces.',
            '<b>Useful methods</b>: <code>values()</code>, <code>valueOf(String)</code>, <code>name()</code>, <code>ordinal()</code>, <code>compareTo</code>.'],
        ['<b>Private constructor</b>: each constant calls one, for example <code>RED("#f00")</code>.',
            '<b>Constant-specific bodies</b>: constants can override an abstract method for their own behavior.',
            '<b>Comparing</b>: use <code>==</code>. Enums also work in <code>switch</code>, <code>EnumMap</code> and <code>EnumSet</code>.'],
        ['<b>Persistence</b>: do not store <code>ordinal()</code>. Store the name or a stable code (JPA <code>@Enumerated(EnumType.STRING)</code>).',
            '<b>Fast collections</b>: <code>EnumMap</code> and <code>EnumSet</code> use an array and a bit vector.',
            '<b>Singleton</b>: a one-constant enum is the safest singleton and survives serialization.'],
        [['F', 'What is an enum?', 'A special class that defines a fixed set of constants.'],
            ['F', 'Can an enum have methods and fields?', 'Yes, plus constructors and interfaces.'],
            ['M', 'Can you create an enum instance with new?', 'No, the constants are the only instances.'],
            ['M', 'Why avoid ordinal() for storage?', 'Reordering or inserting constants changes ordinals and corrupts stored data.'],
            ['S', 'Why are enums a good singleton?', 'The JVM guarantees one instance, thread-safe creation and serialization safety.'],
            ['S', 'What are EnumMap and EnumSet?', 'Specialized, compact and fast collections keyed by enum constants.']],
        [['Enum with fields and behavior.',
            r`enum Plan {
    FREE(0, 1), PRO(499, 10), TEAM(1999, 100);
    private final int price, seats;
    Plan(int price, int seats) {
        this.price = price;
        this.seats = seats;
    }
    int price() { return price; }
    boolean allows(int users) { return users <= seats; }
}
System.out.println(Plan.valueOf("PRO").price() + " "
    + Plan.TEAM.allows(50) + " "
    + Arrays.toString(Plan.values()) + " "
    + Plan.PRO.ordinal());

// OUTPUT:
// 499 true [FREE, PRO, TEAM] 1`],
            ['Constant-specific methods and EnumMap.',
                r`enum Op {
    ADD { int apply(int a, int b) { return a + b; } },
    MUL { int apply(int a, int b) { return a * b; } };
    abstract int apply(int a, int b);
}
EnumMap<Op, Integer> res = new EnumMap<>(Op.class);
for (Op o : Op.values()) res.put(o, o.apply(3, 4));
System.out.println(res);

// OUTPUT:
// {ADD=7, MUL=12}`]],
        [['valueOf failure.',
            r`try {
    Plan.valueOf("GOLD");
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());
}

// OUTPUT:
// No enum constant Plan.GOLD`],
            ['EnumSet.',
                r`enum Perm { READ, WRITE, EXEC }
Set<Perm> p = EnumSet.of(Perm.READ, Perm.WRITE);
System.out.println(p + " " + EnumSet.complementOf(EnumSet.copyOf(p))
    + " " + EnumSet.allOf(Perm.class).size());

// OUTPUT:
// [READ, WRITE] [EXEC] 3`]]
    ),

    'generics': x(
        ['<b>Type parameter:</b> the caller picks the type, as in <code>List&lt;String&gt;</code> or <code>class Box&lt;T&gt;</code>.',
            '<b>Type safety:</b> the compiler checks types and you need no casts.',
            '<b>Reference types only:</b> use <code>List&lt;Integer&gt;</code>, not <code>List&lt;int&gt;</code>.'],
        ['<b>Generic method:</b> <code>static &lt;T&gt; T first(List&lt;T&gt; l)</code>.',
            '<b>Bounded type:</b> <code>&lt;T extends Comparable&lt;T&gt;&gt;</code> lets you call <code>compareTo</code>.',
            '<b>Wildcards:</b> <code>? extends T</code> (read-only producer), <code>? super T</code> (consumer), <code>?</code> (unknown).',
            '<b>Diamond:</b> <code>new ArrayList&lt;&gt;()</code> infers the type.'],
        ['<b>Type erasure:</b> at run time <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> are both <code>List</code>.',
            '<b>PECS:</b> Producer Extends, Consumer Super.',
            '<b>Erasure limits:</b> no <code>new T()</code>, no generic arrays, no <code>instanceof List&lt;String&gt;</code>.',
            '<b>Invariance:</b> <code>List&lt;Object&gt;</code> is not a supertype of <code>List&lt;String&gt;</code>.'],
        [['F', 'Why use generics?', 'Compile-time type safety and no explicit casts.'],
            ['F', 'Can generics use primitives?', 'No, use wrapper types.'],
            ['M', 'What is type erasure?', 'The compiler removes generic type information and inserts casts; at run time only raw types remain.'],
            ['M', 'What does &lt;? extends Number&gt; mean?', 'A list of some unknown subtype of Number that you can read from as Number but not add to.'],
            ['S', 'Explain PECS.', 'Use extends when a structure produces values you read, and super when it consumes values you write.'],
            ['S', 'Why can you not create new T[]?', 'Because T is erased and arrays need their component type at run time.']],
        [['Generic class and bounded method.',
            r`class Box<T> { private T v; Box(T v) { this.v = v; } T get() { return v; } }
static <T extends Comparable<T>> T max(List<T> l) {
    T m = l.get(0);
    for (T t : l) if (t.compareTo(m) > 0) m = t;
    return m;
}
System.out.println(new Box<>("hi").get() + " " + max(List.of(3, 9, 4))
    + " " + max(List.of("b", "z")));

// OUTPUT:
// hi 9 z`],
            ['Wildcards (PECS).',
                r`static double sum(List<? extends Number> src) {
    double s = 0;
    for (Number n : src) s += n.doubleValue();
    return s;
}
static void fill(List<? super Integer> dst) { dst.add(1); dst.add(2); }
List<Object> objs = new ArrayList<>(); fill(objs);
System.out.println(sum(List.of(1, 2.5)) + " " + objs);

// OUTPUT:
// 3.5 [1, 2]`]],
        [['Invariance.',
            r`List<String> strings = new ArrayList<>();
// List<Object> objs = strings;       // error: incompatible types
List<? extends Object> view = strings; // ok, read-only view
System.out.println(view.size());

// OUTPUT:
// 0`],
            ['Erasure.',
                r`System.out.println(new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass());

// OUTPUT:
// true`]]
    ),

    'annotations': x(
        ['<b>Metadata</b>: annotations add extra information to code, such as <code>@Override</code>, <code>@Deprecated</code>, <code>@FunctionalInterface</code> and <code>@SuppressWarnings</code>.',
            '<b>No logic by themselves</b>: compilers, tools and frameworks read them and act.',
            '<b>Framework driven</b>: Spring, JPA and JUnit use <code>@Service</code>, <code>@Entity</code> and <code>@Test</code>.'],
        ['<b>Custom annotations</b>: define your own with <code>@interface</code>, then add <code>@Retention</code> (SOURCE, CLASS, RUNTIME) and <code>@Target</code> (TYPE, METHOD, FIELD ...).',
            '<b>Elements</b> look like methods and can have defaults: <code>String value() default "";</code>.',
            '<b>Reading at run time</b>: use reflection, for example <code>method.getAnnotation(X.class)</code>.'],
        ['<b>Annotation processors</b> (<code>javax.annotation.processing</code>) generate code at compile time (Lombok, MapStruct, Dagger).',
            '<b>Inheritance and repetition</b> are controlled by <code>@Inherited</code> and <code>@Repeatable</code>.',
            '<b>Do not overuse</b> annotations for logic: explicit code is easier to debug and test.'],
        [['F', 'What are annotations used for?', 'To attach metadata to code that tools and frameworks can read.'],
            ['F', 'Name some built-in annotations.', '@Override, @Deprecated, @SuppressWarnings, @FunctionalInterface, @SafeVarargs.'],
            ['M', 'What does @Retention(RUNTIME) do?', 'It keeps the annotation in the class file and available to reflection at run time.'],
            ['M', 'What does @Target do?', 'It restricts where the annotation can be applied (class, method, field...).'],
            ['S', 'How do frameworks use annotations?', 'They scan classes via reflection or at compile time (processors) and act on the metadata, like creating beans or mapping entities.'],
            ['S', 'What is an annotation processor?', 'A compiler plugin that reads annotations and generates code or reports errors during compilation.']],
        [['Custom runtime annotation and reader.',
            r`@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Audit { String action(); boolean sensitive() default false; }

class Service {
    @Audit(action = "transfer", sensitive = true) void transfer() {}
    void other() {}
}

for (Method m : Service.class.getDeclaredMethods()) {
    Audit a = m.getAnnotation(Audit.class);
    if (a != null) {
        System.out.println(m.getName() + " -> " + a.action()
            + " sensitive=" + a.sensitive());
    }
}

// OUTPUT:
// transfer -> transfer sensitive=true`],
            ['Built-in annotations.',
                r`interface Shape { double area(); }
class Sq implements Shape {
    @Override public double area() { return 4; }
}

@FunctionalInterface interface Op { int apply(int a); }

@Deprecated(since = "2.0", forRemoval = true)
void oldApi() {}

// OUTPUT:
// @Override makes the compiler verify the override.
// Calling oldApi() from another class gives a removal warning.`]],
        [['Retention matters.',
            r`@interface SourceOnly {}   // default retention is CLASS: hidden at run time
@Retention(RetentionPolicy.RUNTIME) @interface Visible {}
@SourceOnly @Visible class T {}
System.out.println(T.class.getAnnotations().length);

// OUTPUT:
// 1`],
            ['Simple validation framework.',
                r`@Retention(RetentionPolicy.RUNTIME) @interface NotBlank {}
class Form { @NotBlank String name = " "; }

Form form = new Form();
for (Field f : Form.class.getDeclaredFields()) {
    if (f.isAnnotationPresent(NotBlank.class)
            && ((String) f.get(form)).isBlank()) {
        System.out.println(f.getName() + " must not be blank");
    }
}

// OUTPUT:
// name must not be blank`]]
    ),

    'reflection-api': x(
        ['<b>Load a class</b> by name: <code>Class&lt;?&gt; c = Class.forName("com.acme.User");</code>.',
            '<b>Get members</b> with <code>getDeclaredFields()</code>, <code>getDeclaredMethods()</code>, <code>getConstructors()</code>; use them with <code>invoke</code>, <code>newInstance</code>, <code>set</code>.',
            '<b>Who uses it</b>: Spring, Hibernate, Jackson and JUnit.'],
        ['<b>Private access</b>: <code>setAccessible(true)</code> bypasses it (blocked across modules unless opened).',
            '<b>Cost</b>: slower than direct calls, and compile-time safety is lost (errors appear at run time).',
            '<b>Checked exceptions</b> to handle: <code>ClassNotFoundException</code>, <code>NoSuchMethodException</code>, <code>IllegalAccessException</code>, <code>InvocationTargetException</code>.'],
        ['<b>Faster calls</b>: prefer <code>MethodHandle</code>/<code>VarHandle</code>, avoid reflection in hot paths, and cache <code>Method</code> objects.',
            '<b>Native image</b>: GraalVM needs reflection configuration (<code>reflect-config</code>) because classes are resolved at build time.',
            '<b>Design</b>: reflection breaks encapsulation; use it sparingly and prefer interfaces, <code>ServiceLoader</code> or annotation processing.'],
        [['F', 'What is reflection?', 'The ability to inspect and use classes, methods and fields at run time.'],
            ['F', 'Give a use of reflection.', 'Frameworks creating objects and calling methods by name, like dependency injection or JSON mapping.'],
            ['M', 'Disadvantages of reflection?', 'Slower, bypasses compile-time checks and encapsulation, and is harder to refactor.'],
            ['M', 'What does setAccessible(true) do?', 'It suppresses Java access checks so private members can be used (subject to module rules).'],
            ['S', 'Why does reflection need configuration in GraalVM native images?', 'Ahead-of-time compilation removes unreachable code, so dynamically accessed members must be declared.'],
            ['S', 'How can you avoid reflection costs?', 'Cache Method/Field objects, use MethodHandles, or generate code at build time.']],
        [['Inspect and call.',
            r`class User { private String name = "Asha"; public String greet(String g) { return g + " " + name; } }
Class<?> c = User.class;
Object u = c.getDeclaredConstructor().newInstance();
Method m = c.getMethod("greet", String.class);
Field f = c.getDeclaredField("name"); f.setAccessible(true);
f.set(u, "Ravi");
System.out.println(m.invoke(u, "Hi") + " "
    + Arrays.stream(c.getDeclaredMethods()).map(Method::getName).toList());

// OUTPUT:
// Hi Ravi [greet]`],
            ['Dynamic proxy.',
                r`interface Greeter { String hi(String n); }
Greeter g = (Greeter) Proxy.newProxyInstance(
    Greeter.class.getClassLoader(),
    new Class<?>[]{Greeter.class},
    (proxy, method, args) -> "proxied " + method.getName() + " " + args[0]);
System.out.println(g.hi("x"));

// OUTPUT:
// proxied hi x`]],
        [['InvocationTargetException wraps the cause.',
            r`Method m = Integer.class.getMethod("parseInt", String.class);
try {
    m.invoke(null, "zz");
} catch (InvocationTargetException e) {
    System.out.println(e.getCause().getClass().getSimpleName());
}

// OUTPUT:
// NumberFormatException`],
            ['Class name lookup.',
                r`try {
    Class.forName("com.acme.Missing");
} catch (ClassNotFoundException e) {
    System.out.println("not found: " + e.getMessage());
}

// OUTPUT:
// not found: com.acme.Missing`]]
    ),

    'nested-inner-classes': x(
        ['<b>Nested class</b>: a class defined inside another class. Kinds: <b>static nested</b>, <b>inner</b> (non-static), <b>local</b> (inside a method) and <b>anonymous</b> (no name).',
            '<b>Inner instance</b>: belongs to an outer instance, created with <code>outer.new Inner()</code>. It can use all outer members, even private ones.',
            '<b>Static nested</b>: does not need an outer instance.'],
        ['<b>Static nested helpers</b>: use them when the outer instance is not needed (<code>Builder</code>, <code>Map.Entry</code>).',
            '<b>Anonymous classes</b>: implement an interface or extend a class inline. A lambda replaces them for functional interfaces.',
            '<b>Capture</b>: local and anonymous classes can use effectively final local variables.'],
        ['<b>Hidden reference</b>: an inner object keeps its outer object alive. Leaks happen when the inner instance outlives the outer one (listeners, threads).',
            '<b>Default choice</b>: prefer <code>static</code> nested classes.',
            '<b>Nestmates</b> (Java 11): nested classes reach each other private members directly, with no synthetic accessor methods.'],
        [['F', 'What are the types of nested classes?', 'Static nested, inner, local and anonymous classes.'],
            ['F', 'How do you create an inner class object?', 'outer.new Inner() (needs an outer instance).'],
            ['M', 'Static nested vs inner?', 'Static nested has no outer instance; inner holds a reference to its enclosing instance and accesses its members.'],
            ['M', 'What can an anonymous class do that a lambda cannot?', 'Implement interfaces with several methods, extend classes, hold state, and use this for itself.'],
            ['S', 'How can inner classes cause memory leaks?', 'The hidden outer reference keeps the outer object alive while the inner object is reachable.'],
            ['S', 'Why prefer static nested classes?', 'They avoid hidden references and make dependencies explicit.']],
        [['Static nested builder and inner class.',
            r`class Pizza {
    private final String size;
    private Pizza(Builder b) { size = b.size; }

    static class Builder {                 // static nested: no Pizza needed
        private String size = "M";
        Builder size(String s) { size = s; return this; }
        Pizza build() { return new Pizza(this); }
    }

    class Slice {                          // inner: tied to one Pizza
        String label() { return size + " slice"; }
    }
}
Pizza p = new Pizza.Builder().size("L").build();
Pizza.Slice s = p.new Slice();
System.out.println(s.label());

// OUTPUT:
// L slice`],
            ['Anonymous class and local class.',
                r`Comparator<String> byLen = new Comparator<>() {   // anonymous class
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};
class Local { String hi() { return "local"; } }          // local class
List<String> l = new ArrayList<>(List.of("ccc", "a", "bb"));
l.sort(byLen);
System.out.println(l + " " + new Local().hi());

// OUTPUT:
// [a, bb, ccc] local`]],
        [['Private access: an inner class reads the private state of its outer object.',
            r`class Account {
    private int balance = 90;
    class Statement {
        String print() { return "Balance: " + balance; }   // private field, no getter
    }
}
Account acc = new Account();
System.out.println(acc.new Statement().print());

// OUTPUT:
// Balance: 90`],
            ['Capture rule.',
                r`int n = 5;
Runnable r = new Runnable() {
    public void run() { System.out.println(n); }
};
// n++;  // error: variable used from an inner class must be effectively final
r.run();

// OUTPUT:
// 5`]]
    ),

    'interfaces-in-java': x(
        ['<b>Contract</b>: an interface lists methods that classes implement with <code>implements</code>. A class can implement many interfaces.',
            '<b>Defaults</b>: interface methods are public and abstract by default; fields are <code>public static final</code> constants.',
            '<b>No objects</b>: you cannot create an object of an interface, but you can use it as a type.'],
        ['<b>Newer methods</b>: since Java 8, <code>default</code> methods (with a body) and <code>static</code> methods; Java 9 added <code>private</code> methods.',
            '<b>Functional interface</b>: exactly one abstract method, so it can be a lambda target (<code>@FunctionalInterface</code>).',
            '<b>Interface inheritance</b>: an interface can <code>extend</code> multiple interfaces.'],
        ['<b>Program to interfaces</b>: this helps dependency injection, testing with fakes and mocks, and swapping implementations.',
            '<b>Interface segregation</b>: many small interfaces beat one large one.',
            '<b>Evolving an API</b>: add <code>default</code> methods instead of breaking implementers; <code>sealed</code> interfaces limit implementations.'],
        [['F', 'What is an interface?', 'A contract of methods that implementing classes must provide.'],
            ['F', 'Can a class implement multiple interfaces?', 'Yes.'],
            ['M', 'What are default methods for?', 'To add behavior to interfaces without breaking existing implementations.'],
            ['M', 'What is a functional interface?', 'An interface with a single abstract method, usable with lambdas.'],
            ['S', 'Interface vs abstract class?', 'Interfaces define capabilities with multiple implementation and no state; abstract classes share state and code with single inheritance.'],
            ['S', 'How do you resolve a default method conflict?', 'Override the method in the class and choose with InterfaceName.super.method().']],
        [['Interface with default and static methods.',
            r`interface Payable {
    double amount();
    default double withTax() { return amount() * 1.18; }
    static Payable of(double a) { return () -> a; }
}
System.out.printf("%.2f%n", Payable.of(100).withTax());

// OUTPUT:
// 118.00`],
            ['Polymorphism through interfaces.',
                r`interface Shape { double area(); }
record Circle(double r) implements Shape {
    public double area() { return Math.PI * r * r; }
}
record Square(double s) implements Shape {
    public double area() { return s * s; }
}
double total = Stream.of(new Circle(1), new Square(2))
    .mapToDouble(Shape::area).sum();
System.out.printf("%.2f%n", total);

// OUTPUT:
// 7.14`]],
        [['Constants in interfaces.',
            r`interface Limits { int MAX = 10; }
// Limits.MAX = 11;      // error: cannot assign a value to final variable MAX
System.out.println(Limits.MAX);

// OUTPUT:
// 10`],
            ['Sealed interface.',
                r`sealed interface Result permits Ok, Fail {}
record Ok(int v) implements Result {}
record Fail(String why) implements Result {}
System.out.println(new Ok(1) instanceof Result);

// OUTPUT:
// true`]]
    ),

    'equals-hashcode': x(
        ['<b>Logical equality:</b> <code>equals(Object)</code> defines it; <code>hashCode()</code> returns an int used by hash-based collections.',
            '<b>Contract:</b> if <code>a.equals(b)</code> then <code>a.hashCode() == b.hashCode()</code>. Override both together.',
            '<b>Default behavior:</b> <code>equals</code> compares references (<code>==</code>).'],
        ['<b>Five rules:</b> <code>equals</code> must be reflexive, symmetric, transitive, consistent and return false for null.',
            '<b>Helpers:</b> use <code>Objects.equals</code> and <code>Objects.hash</code>, a <code>record</code> (generated for you), or IDE generation.',
            '<b>Mutable fields:</b> do not use them in <code>hashCode</code> for objects stored in hash sets or maps.'],
        ['<b>Broken contract:</b> causes duplicates in <code>HashSet</code> and failed lookups in <code>HashMap</code>.',
            '<b>Inheritance:</b> <code>getClass()</code> vs <code>instanceof</code> and the symmetry problem; prefer final classes or composition.',
            '<b>JPA entities:</b> base <code>equals</code> on a business key or id carefully, because ids may be null before persistence.'],
        [['F', 'Why override equals?', 'To compare objects by their content instead of by reference.'],
            ['F', 'What is the equals and hashCode contract?', 'Equal objects must have equal hash codes.'],
            ['M', 'What happens if you override equals but not hashCode?', 'Equal objects may land in different buckets, so HashMap and HashSet treat them as different.'],
            ['M', 'Can unequal objects have the same hash code?', 'Yes (collisions); it only costs performance.'],
            ['S', 'Why is equals tricky with inheritance?', 'A subclass may break symmetry or transitivity when it adds fields; use final classes or composition.'],
            ['S', 'What is the danger of mutable fields in hashCode?', 'Changing them after insertion changes the hash, so the object becomes unreachable in the set or map.']],
        [['Correct override.',
            r`final class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point p)) return false;
        return x == p.x && y == p.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
}
Set<Point> s = new HashSet<>(List.of(new Point(1, 2)));
System.out.println(s.contains(new Point(1, 2)) + " " + new Point(1, 2).equals(null));

// OUTPUT:
// true false`],
            ['Missing hashCode.',
                r`class Bad {
    final int v;
    Bad(int v) { this.v = v; }
    @Override public boolean equals(Object o) { return o instanceof Bad b && b.v == v; }
    // hashCode() not overridden
}
Set<Bad> s = new HashSet<>(); s.add(new Bad(1));
System.out.println(s.contains(new Bad(1)));

// OUTPUT:
// false (most of the time)`]],
        [['Record gives both for free.',
            r`record Pair(String a, int b) {}
Pair p1 = new Pair("x", 1), p2 = new Pair("x", 1);
System.out.println(p1.equals(p2) + " " + (p1.hashCode() == p2.hashCode()));

// OUTPUT:
// true true`],
            ['Symmetry violation.',
                r`class P {
    final int x;
    P(int x) { this.x = x; }
    public boolean equals(Object o) { return o instanceof P p && p.x == x; }
}
class Q extends P {
    final int y;
    Q(int x, int y) { super(x); this.y = y; }
    public boolean equals(Object o) {
        return o instanceof Q q && q.x == x && q.y == y;
    }
}
// P.equals(Q) is true, but Q.equals(P) is false: symmetry broken
System.out.println(new P(1).equals(new Q(1, 2)) + " " + new Q(1, 2).equals(new P(1)));

// OUTPUT:
// true false`]]
    ),

    'comparable-comparator': x(
        ['<b>Natural vs external order:</b> <code>Comparable&lt;T&gt;</code> gives a class one natural order with <code>compareTo</code>; <code>Comparator&lt;T&gt;</code> defines other orders outside the class with <code>compare</code>.',
            '<b>Return value:</b> both return a negative, zero or positive int.',
            '<b>Where used:</b> <code>Collections.sort</code>, <code>list.sort</code>, <code>TreeSet</code>, <code>TreeMap</code>, <code>PriorityQueue</code>.'],
        ['<b>Build comparators:</b> <code>Comparator.comparing(Person::name).thenComparing(Person::age)</code>, <code>.reversed()</code>, <code>nullsFirst</code>.',
            '<b>Avoid subtraction:</b> prefer <code>Integer.compare(a, b)</code> to <code>a - b</code>, which can overflow.',
            '<b>Consistent with equals:</b> keep <code>compareTo</code> returning 0 only when <code>equals</code> is true, when possible.'],
        ['<b>Stability:</b> sorting objects uses TimSort, which is stable, so successive sorts compose.',
            '<b>Broken comparators:</b> a non-transitive one can throw "Comparison method violates its general contract".',
            '<b>Text order:</b> for locale-aware sorting of text use <code>Collator</code>.'],
        [['F', 'Comparable vs Comparator?', 'Comparable is the natural order inside the class; Comparator is an external order.'],
            ['F', 'Which method does Comparable define?', 'compareTo(T other).'],
            ['M', 'How do you sort by multiple fields?', 'Chain comparators with thenComparing.'],
            ['M', 'Why avoid a - b in compare?', 'It can overflow; use Integer.compare.'],
            ['S', 'What is stability in sorting?', 'Equal elements keep their original relative order.'],
            ['S', 'What does consistent with equals mean?', 'compareTo returns 0 exactly when equals returns true.']],
        [['Natural order and custom orders.',
            r`record Emp(String name, String dept, int sal) implements Comparable<Emp> {
    public int compareTo(Emp o) { return name.compareTo(o.name); }
}
List<Emp> l = new ArrayList<>(List.of(
    new Emp("Ravi", "IT", 90), new Emp("Asha", "IT", 95), new Emp("Meena", "HR", 70)));
Collections.sort(l); // natural order: by name
System.out.println(l.stream().map(Emp::name).toList());
l.sort(Comparator.comparing(Emp::dept)
    .thenComparing(Emp::sal, Comparator.reverseOrder())); // dept, then salary desc
System.out.println(l.stream().map(Emp::name).toList());

// OUTPUT:
// [Asha, Meena, Ravi]
// [Meena, Asha, Ravi]`],
            ['Null-safe order.',
                r`List<String> l = Arrays.asList("b", null, "a");
l.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
System.out.println(l);

// OUTPUT:
// [null, a, b]`]],
        [['PriorityQueue by comparator.',
            r`PriorityQueue<String> pq = new PriorityQueue<>(
    Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
pq.addAll(List.of("ccc", "a", "bb", "aa"));
System.out.println(pq.poll() + " " + pq.poll());

// OUTPUT:
// a aa`],
            ['Overflow trap.',
                r`Comparator<Integer> bad = (a, b) -> a - b;
System.out.println(bad.compare(Integer.MAX_VALUE, -1) < 0); // wrong: overflow
System.out.println(Integer.compare(Integer.MAX_VALUE, -1) < 0);

// OUTPUT:
// true
// false`]]
    ),

    'object-cloning': x(
        ['Cloning creates a copy of an object. Implement <code>Cloneable</code> and override <code>clone()</code>; the default <code>Object.clone()</code> makes a <b>shallow copy</b>.',
            '<b>Shallow</b>: copies field values; referenced objects are shared. <b>Deep</b>: copies referenced objects too.',
            '<b>Missing marker</b>: without <code>Cloneable</code>, <code>super.clone()</code> throws <code>CloneNotSupportedException</code>.'],
        ['<b>Pitfalls</b>: <code>clone</code> bypasses constructors and has many traps (final fields, subclassing, checked exception).',
            '<b>Alternatives</b>: copy constructors, static factory methods (<code>copyOf</code>), serialization-based or library copies, or immutable objects that need no copy.',
            '<b>Arrays</b> have a working <code>clone()</code>: <code>int[] b = a.clone();</code> (shallow).'],
        ['<b>Effective Java</b>: avoid <code>Cloneable</code>; provide a copy constructor or factory instead.',
            '<b>Deep copies</b> of object graphs: use a copy constructor chain, records with <code>List.copyOf</code>, or mapping libraries (MapStruct).',
            '<b>Immutable</b> classes never need cloning; <b>defensive copies</b> protect mutable inputs.'],
        [['F', 'What is object cloning?', 'Creating a copy of an object.'],
            ['F', 'Shallow vs deep copy?', 'Shallow copies references to nested objects; deep also copies the nested objects.'],
            ['M', 'What does Cloneable do?', 'It is a marker interface that allows Object.clone() to work; without it CloneNotSupportedException is thrown.'],
            ['M', 'Why is clone() discouraged?', 'It bypasses constructors, relies on a fragile protocol and is hard to get right with mutable fields and inheritance.'],
            ['S', 'What do you use instead of clone?', 'Copy constructors or static copy factories, immutable objects and defensive copies.'],
            ['S', 'How do you deep copy a nested object graph?', 'Write copy constructors recursively, or serialize and deserialize, or use a mapping library.']],
        [['Shallow vs deep clone.',
            r`class Address implements Cloneable {
    String city;
    Address(String c) { city = c; }
    protected Address clone() throws CloneNotSupportedException {
        return (Address) super.clone();
    }
}
class Person implements Cloneable {
    String name; Address addr;
    Person(String n, Address a) { name = n; addr = a; }
    protected Person shallow() throws CloneNotSupportedException {
        return (Person) super.clone();
    }
    protected Person deep() throws CloneNotSupportedException {
        Person p = (Person) super.clone();
        p.addr = addr.clone();
        return p;
    }
}
Person a = new Person("Asha", new Address("Pune"));
Person s = a.shallow(), d = a.deep();
a.addr.city = "Delhi";
System.out.println(s.addr.city + " " + d.addr.city);

// OUTPUT:
// Delhi Pune`],
            ['Copy constructor alternative.',
                r`class Pt {
    final int x, y;
    Pt(int x, int y) { this.x = x; this.y = y; }
    Pt(Pt o) { this(o.x, o.y); }   // copy constructor
}
Pt a = new Pt(1, 2), b = new Pt(a);
System.out.println((a != b) + " " + b.x);

// OUTPUT:
// true 1`]],
        [['CloneNotSupportedException.',
            r`class NoMark {
    Object copy() throws CloneNotSupportedException { return super.clone(); }
}
try {
    new NoMark().copy();
} catch (CloneNotSupportedException e) {
    System.out.println("not Cloneable");
}

// OUTPUT:
// not Cloneable`],
            ['Collections copy.',
                r`List<StringBuilder> src = List.of(new StringBuilder("a"));
List<StringBuilder> shallow = new ArrayList<>(src);
shallow.get(0).append("!");
System.out.println(src.get(0));

// OUTPUT:
// a!`]]
    )
};

export const java07Deep: Record<string, Deep> = {
    'enums-in-java': dv(
        [`The compiler turns an enum into a final class extending <code>java.lang.Enum</code> with a private constructor, <code>public static final</code> fields for each constant and a synthetic <code>$VALUES</code> array. <code>values()</code> clones that array each call. <code>valueOf</code> uses a name-to-constant map. Constants are created during class initialization, so enum initialization is thread-safe.`,
            r`enum Level { LOW, HIGH }
Level[] a = Level.values(), b = Level.values();
System.out.println((a != b) + " " + (a[0] == b[0]));   // new array, same constants
System.out.println(Level.HIGH.getDeclaringClass().getSimpleName() + " "
    + Level.class.getSuperclass().getSimpleName());

// OUTPUT:
// true true
// Level Enum`],
        [`Advanced use: state machines (each state defines transitions), strategy per constant, enums implementing interfaces, lookup maps built in a static block, <code>EnumMap</code> / <code>EnumSet</code> for flags, <code>switch</code> expressions with exhaustiveness, and <code>values()</code> caching to avoid repeated array clones. Use <code>@Enumerated(EnumType.STRING)</code> in JPA.`,
            r`enum State {
    NEW     { State next() { return PAID; } },
    PAID    { State next() { return SHIPPED; } },
    SHIPPED { State next() { return this; } };

    abstract State next();

    private static final Map<String, State> BY_NAME = Arrays.stream(values())
        .collect(Collectors.toMap(s -> s.name().toLowerCase(), s -> s));

    static State parse(String s) {
        State found = BY_NAME.get(s.toLowerCase());
        if (found == null) throw new IllegalArgumentException("unknown " + s);
        return found;
    }
}
System.out.println(State.parse("new").next().next() + " " + State.SHIPPED.next());

// OUTPUT:
// SHIPPED SHIPPED`],
        [`Mistakes: persisting ordinal, adding constants in the middle (breaks ordinal-based data), mutable enum fields (global state), using enums with many fields as a database, valueOf without handling IllegalArgumentException, and switch statements without default that silently miss new constants. Add tests that enumerate values().`,
            r`enum Color { RED, GREEN }
int stored = Color.GREEN.ordinal();       // 1 saved in the database
// later someone inserts BLUE before GREEN: ordinal 1 now means BLUE
enum Color2 { RED, BLUE, GREEN }
System.out.println(Color2.values()[stored]);

// OUTPUT:
// BLUE`],
        [`Enum switch uses an ordinal lookup table; EnumMap is an array indexed by ordinal (O(1), tiny); EnumSet is a long bit mask (for up to 64 constants). Prefer them over HashMap/HashSet keyed by enums.`,
            r`EnumMap<Level, Integer> counts = new EnumMap<>(Level.class);
for (Level l : List.of(Level.LOW, Level.HIGH, Level.LOW)) {
    counts.merge(l, 1, Integer::sum);   // count each level
}
EnumSet<Level> all = EnumSet.allOf(Level.class);
System.out.println(counts + " " + all);

// OUTPUT:
// {LOW=2, HIGH=1} [LOW, HIGH]`],
        [`Real-world: HTTP status mappings, roles and permissions, order states with allowed transitions, and configuration modes. An enum with a code field maps to database codes safely.`,
            r`enum Status { ACTIVE("A"), SUSPENDED("S"), CLOSED("C");
    final String code;
    Status(String c) { code = c; }

    static Status fromCode(String c) {
        for (Status s : values()) {
            if (s.code.equals(c)) return s;
        }
        throw new IllegalArgumentException("bad code " + c);
    }
}
// JPA: a converter can store the stable code, not the name or ordinal
System.out.println(Status.fromCode("S"));

// OUTPUT:
// SUSPENDED`]
    ),

    'generics': dv(
        [`Type erasure replaces type variables with their bound (or Object) and inserts casts and bridge methods. At run time the JVM sees raw types; generic information remains in class metadata (Signature attribute) for reflection. Reifiable types (arrays, raw types, unbounded wildcards) keep type info; <code>List&lt;String&gt;</code> does not.`,
            r`List<String> a = new ArrayList<>(); List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass());
class StrBox implements Comparable<StrBox> {
    public int compareTo(StrBox o) { return 0; }  // compiler adds a bridge method
}
System.out.println(Arrays.stream(StrBox.class.getDeclaredMethods())
    .filter(Method::isBridge).count());
Type t = new ArrayList<String>() {}.getClass().getGenericSuperclass();
System.out.println(t);

// OUTPUT:
// true
// 1
// java.util.ArrayList<java.lang.String>`],
        [`Advanced topics: bounded and recursive bounds (<code>&lt;T extends Comparable&lt;? super T&gt;&gt;</code>), wildcard capture, generic methods with explicit type arguments (<code>Collections.&lt;String&gt;emptyList()</code>), type tokens (<code>Class&lt;T&gt;</code> to create instances), super type tokens (anonymous subclass captures the type), <code>@SafeVarargs</code>, and generic builders with self types.`,
            r`static <T extends Comparable<? super T>> void sortDesc(List<T> l) {
    l.sort(Comparator.reverseOrder());
}
static <T> T create(Class<T> type) throws Exception {
    return type.getDeclaredConstructor().newInstance();  // type token
}
abstract class Builder<B extends Builder<B>> {      // self type
    String name;
    abstract B self();
    B name(String n) { name = n; return self(); }
}
class CarBuilder extends Builder<CarBuilder> {
    int doors;
    CarBuilder self() { return this; }
    CarBuilder doors(int d) { doors = d; return this; }
}
List<Integer> nums = new ArrayList<>(List.of(1, 3, 2));
sortDesc(nums);
System.out.println(nums + " " + create(StringBuilder.class).length()
    + " " + new CarBuilder().name("x").doors(4).doors);

// OUTPUT:
// [3, 2, 1] 0 4`],
        [`Mistakes: raw types (unchecked warnings, ClassCastException later), unchecked casts, heap pollution with varargs, generic arrays, assuming <code>List&lt;Object&gt;</code> accepts <code>List&lt;String&gt;</code>, overloading methods that differ only by type argument (same erasure), and exposing wildcard types in return values. Never ignore unchecked warnings without a reason.`,
            r`List raw = new ArrayList<String>();
raw.add(42);                                       // unchecked warning only
List<String> strings = raw;
try {
    String s = strings.get(0);                     // hidden cast fails here
} catch (ClassCastException e) {
    System.out.println("heap pollution: " + e.getMessage().substring(0, 28));
}
// static void m(List<String> l) {}
// static void m(List<Integer> l) {}   // error: same erasure

// OUTPUT:
// heap pollution: class java.lang.Integer cann`],
        [`Generics have no run-time cost beyond casts and boxing of primitive type arguments; the boxing is the real cost. Project Valhalla (specialized generics over value classes) aims to remove it. Use primitive streams and specialized collections for numeric data.`,
            r`List<Integer> boxed = new ArrayList<>();
for (int i = 0; i < 1000; i++) boxed.add(i);   // 1000 Integer objects
int[] prim = new int[1000];                    // one array, no boxing
System.out.println(boxed.size() + " " + prim.length);

// OUTPUT:
// 1000 1000
// (the int[] needs far less memory and avoids pointer lookups)`],
        [`Real-world: a generic repository and result type reused across the codebase.`,
            r`interface Repository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    T save(T entity);
}
class InMemoryRepo<T, ID> implements Repository<T, ID> {
    private final Map<ID, T> store = new LinkedHashMap<>();
    private final Function<T, ID> idOf;
    InMemoryRepo(Function<T, ID> idOf) { this.idOf = idOf; }
    public Optional<T> findById(ID id) {
        return Optional.ofNullable(store.get(id));
    }
    public List<T> findAll() { return List.copyOf(store.values()); }
    public T save(T e) { store.put(idOf.apply(e), e); return e; }
}
record User(long id, String name) {}
Repository<User, Long> users = new InMemoryRepo<>(User::id);
users.save(new User(1, "Asha"));
System.out.println(users.findById(1L).map(User::name).orElse("?"));

// OUTPUT:
// Asha`]
    ),

    'annotations': dv(
        [`Annotations compile into class file attributes (<code>RuntimeVisibleAnnotations</code>), and an annotation type is an interface extending <code>java.lang.annotation.Annotation</code>. At run time <code>getAnnotation</code> returns a dynamic proxy that implements the annotation interface and serves element values. Elements may be primitives, String, Class, enums, annotations and arrays of those.`,
            r`@Retention(RetentionPolicy.RUNTIME)
@interface Info { String value() default "none"; int[] tags() default {}; }

@Info(value = "svc", tags = {1, 2}) class A {}

Info i = A.class.getAnnotation(Info.class);
System.out.println(i.value() + " " + Arrays.toString(i.tags()));
System.out.println(Proxy.isProxyClass(i.getClass()));
System.out.println(i.annotationType().getSimpleName());

// OUTPUT:
// svc [1, 2]
// true
// Info`],
        [`Further topics: repeatable annotations (<code>@Repeatable</code>), type annotations (<code>@NonNull</code> on types), annotation processing with <code>AbstractProcessor</code> (generate code or validate at compile time), composed annotations (Spring stereotypes combine others) and Bean Validation (<code>@NotNull</code>, <code>@Size</code>). Processors run in rounds and can create new source files.`,
            r`@Retention(RetentionPolicy.RUNTIME) @Repeatable(Roles.class)
@interface Role { String value(); }

@Retention(RetentionPolicy.RUNTIME)
@interface Roles { Role[] value(); }

@Role("admin") @Role("auditor") class Report {}

Role[] roles = Report.class.getAnnotationsByType(Role.class);
System.out.println(Arrays.stream(roles).map(Role::value).toList());

// annotation processor skeleton (not run here)
// @SupportedAnnotationTypes("com.acme.Entity")
// public class EntityProcessor extends AbstractProcessor {
//     public boolean process(Set<? extends TypeElement> annotations,
//                            RoundEnvironment env) {
//         for (Element e : env.getElementsAnnotatedWith(Entity.class)) {
//             // generate source with processingEnv.getFiler()
//         }
//         return true;
//     }
// }

// OUTPUT:
// [admin, auditor]`],
        [`Common mistakes: forgetting RUNTIME retention (the annotation is invisible to reflection), expecting annotations on interfaces or methods to be inherited automatically, putting heavy logic in annotation magic, not noticing that a framework silently ignores a misplaced annotation, and calling reflection on every request instead of caching the result.`,
            r`@interface Marker {}   // default retention is CLASS
@Marker class X {}
System.out.println(X.class.isAnnotationPresent(Marker.class));

// OUTPUT:
// false`],
        [`Annotation scanning at startup (classpath scanning) slows startup in large apps; build-time processing (Spring AOT, Micronaut, Quarkus) moves it to compile time. Cache annotation lookups instead of calling reflection on every request.`,
            r`private static final Map<Method, Audit> AUDIT_CACHE =
    new ConcurrentHashMap<>();

Audit audit(Method m) {
    return AUDIT_CACHE.computeIfAbsent(m, mm -> mm.getAnnotation(Audit.class));
}

// OUTPUT:
// reflection runs once per method, not once per call`],
        [`Real-world: a tiny dependency injector. It creates a <code>Service</code> and fills every field marked with <code>@Inject</code>. A full framework would also scan a package for classes marked with <code>@Component</code>.`,
            r`@Retention(RetentionPolicy.RUNTIME) @interface Inject {}

class Repo {}
class Service { @Inject Repo repo; }

Service s = new Service();
for (Field f : Service.class.getDeclaredFields()) {
    if (f.isAnnotationPresent(Inject.class)) {
        f.setAccessible(true);
        f.set(s, f.getType().getDeclaredConstructor().newInstance());
    }
}
System.out.println(s.repo != null);

// OUTPUT:
// true`]
    ),

    'reflection-api': dv(
        [`Every loaded class has a <code>Class</code> object holding metadata: fields, methods, constructors, annotations, modifiers, generic signatures. <code>Method.invoke</code> checks access and argument types, boxes arguments, and since JDK 18 uses method handles internally (faster than the old native accessors). <code>getDeclaredX</code> returns members of that class only (any visibility); <code>getX</code> returns public members including inherited.`,
            r`class Base { public void a() {} private void b() {} }
class Derived extends Base { public void c() {} }
System.out.println(Arrays.stream(Derived.class.getMethods())
    .map(Method::getName).filter(n -> n.length() == 1).sorted().toList());
System.out.println(Arrays.stream(Derived.class.getDeclaredMethods())
    .map(Method::getName).toList());
System.out.println(Modifier.toString(
    Base.class.getDeclaredMethod("b").getModifiers()));

// OUTPUT:
// [a, c]
// [c]
// private`],
        [`Tools beyond plain reflection:
<ul>
<li><code>MethodHandles.lookup().findVirtual(...)</code> - fast dynamic invocation.</li>
<li><code>VarHandle</code> - field access with memory-ordering control.</li>
<li><code>Proxy</code> - dynamic proxies for interfaces (the basis of Spring AOP and Retrofit).</li>
<li>ByteBuddy and ASM - bytecode generation.</li>
<li><code>ServiceLoader</code> - plugin discovery.</li>
<li><code>getRecordComponents</code> - record introspection.</li>
<li>Module <code>opens</code> directives - allow deep reflection into a package.</li>
</ul>`,
            r`MethodHandle mh = MethodHandles.lookup().findVirtual(
    String.class, "toUpperCase", MethodType.methodType(String.class));
System.out.println((String) mh.invoke("handle"));

record Point(int x, int y) {}
for (RecordComponent rc : Point.class.getRecordComponents()) {
    System.out.print(rc.getName() + ":" + rc.getType().getSimpleName() + " ");
}
System.out.println();

// A timing handler for Proxy.newProxyInstance (real = the wrapped object)
InvocationHandler timing = (proxy, m, args) -> {
    long t = System.nanoTime();
    Object r = m.invoke(real, args);
    System.out.println(m.getName() + " took " + (System.nanoTime() - t) + " ns");
    return r;
};

// OUTPUT:
// HANDLE
// x:int y:int`],
        [`Common mistakes:
<ul>
<li>Using reflection where a plain interface would do.</li>
<li>Swallowing <code>InvocationTargetException</code> (the real error is its cause).</li>
<li>Accessing private members across modules (<code>InaccessibleObjectException</code>).</li>
<li>Relying on member order from <code>getDeclaredMethods</code> (it is unspecified).</li>
<li>Using user-supplied class or method names (an injection risk).</li>
<li>Breaking when an obfuscator renames members.</li>
</ul>`,
            r`// Dangerous: Class.forName(request.getParameter("class")) ...newInstance();
// Attackers can instantiate arbitrary classes. Use an allow-list map instead:
Map<String, Supplier<Handler>> allowed =
    Map.of("csv", CsvHandler::new, "json", JsonHandler::new);
Supplier<Handler> maker = allowed.getOrDefault(type, () -> {
    throw new IllegalArgumentException("unknown type");
});
Handler h = maker.get();

// OUTPUT:
// only known handlers can be created`],
        [`Reflective calls are several times slower than direct calls and block some JIT optimizations; cache lookups (<code>Method</code>, <code>Field</code>, <code>MethodHandle</code> in static final fields) and avoid reflection in loops. Startup scanning of many classes is the usual cost in frameworks.`,
            r`Method m = String.class.getMethod("length");
String s = "abc";
long t = System.nanoTime();
long sum = 0;
for (int i = 0; i < 5_000_000; i++) sum += (Integer) m.invoke(s);
System.out.println("reflect ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// reflect ms=60   (direct call: about 3 ms)`],
        [`Real-world: a mini JSON serializer that writes the fields of any object, and how JUnit finds test methods by annotation.`,
            r`static String toJson(Object o) throws IllegalAccessException {
    StringJoiner sj = new StringJoiner(",", "{", "}");
    for (Field f : o.getClass().getDeclaredFields()) {
        f.setAccessible(true);
        Object v = f.get(o);
        String value = (v instanceof Number) ? String.valueOf(v) : "\"" + v + "\"";
        sj.add("\"" + f.getName() + "\":" + value);
    }
    return sj.toString();
}
class U { String name = "Asha"; int age = 30; }
System.out.println(toJson(new U()));

// OUTPUT:
// {"name":"Asha","age":30}`]
    ),

    'nested-inner-classes': dv(
        [`The compiler turns every nested class into a separate top-level class file (<code>Outer$Inner.class</code>, <code>Outer$1.class</code> for anonymous). An inner class constructor takes the outer instance as a hidden parameter stored in a synthetic field <code>this$0</code>. Local and anonymous classes copy captured effectively final variables into synthetic fields (<code>val$name</code>). Newer compilers (Java 18+) drop <code>this$0</code> when the inner class never uses the outer instance, so the sample below uses it.`,
            r`class Outer {
    int x;
    class Inner { int get() { return x; } }    // uses the outer instance
    static class Nested {}
}
Class<?> in = Outer.Inner.class;
System.out.println(in.getName() + " " + Outer.Nested.class.getName());
System.out.println(Arrays.stream(in.getDeclaredFields())
    .map(Field::getName).toList() + " " + in.getNestHost().getSimpleName());
Runnable anon = new Runnable() { public void run() {} };
System.out.println(anon.getClass().getName().contains("$")
    + " " + anon.getClass().isAnonymousClass());

// OUTPUT:
// Outer$Inner Outer$Nested
// [this$0] Outer
// true true`],
        [`Common uses:
<ul>
<li><b>Static nested</b>: builders and entries.</li>
<li><b>Inner</b>: iterators over the outer collection.</li>
<li><b>Anonymous</b>: callbacks and listeners.</li>
<li><b>Local</b> records and enums, and helper classes private to one top-level class.</li>
</ul>
A lambda is different from an anonymous class: it does not create a new <code>this</code> (it keeps the enclosing one), it compiles with invokedynamic, and it captures variables directly. Use <code>this</code> and <code>Outer.this</code> to tell inner and outer members apart.`,
            r`class Range implements Iterable<Integer> {
    final int n;
    Range(int n) { this.n = n; }

    public Iterator<Integer> iterator() {
        return new Iterator<>() {              // anonymous iterator
            int i = 0;
            public boolean hasNext() { return i < n; }
            public Integer next() { return i++; }
        };
    }
}
for (int v : new Range(3)) System.out.print(v + " ");
System.out.println();
record Pair(int a, int b) {}                   // local record
Object o = new Object() {
    Runnable r = () -> System.out.println(
        getClass().getSimpleName().isEmpty() ? "anon this" : "other");
    { r.run(); }                               // lambda sees the anonymous this
};

// OUTPUT:
// 0 1 2
// anon this`],
        [`Common mistakes:
<ul>
<li>Using a non-static inner class for a helper: it keeps a hidden outer reference, which can leak and also drags the outer object into serialization.</li>
<li>Writing anonymous classes inside loops or hot code: each one is a separate class.</li>
<li>Expecting <code>this</code> in a lambda to be the lambda. It is the enclosing object.</li>
<li>Serializing inner classes.</li>
<li>Double-brace initialization, such as <code>new ArrayList&lt;&gt;() {{ add(1); }}</code>. It creates an anonymous subclass that holds the outer reference.</li>
<li>Calling outer methods from threads that outlive the outer object.</li>
</ul>`,
            r`// anonymous subclass of ArrayList, holds a reference to the outer object
List<String> bad = new ArrayList<>() {{ add("a"); add("b"); }};
List<String> good = List.of("a", "b");
System.out.println(bad.getClass() == ArrayList.class);

// OUTPUT:
// false`],
        [`Memory: an inner object adds only one reference, and a lambda that does not capture is created once and reused. The real risk is the leak, not the overhead. Long-lived callbacks (timers, thread pools, static registries) that hold inner instances keep whole object graphs alive. Use static nested classes and weak references for listeners.`,
            r`class Screen {
    final byte[] big = new byte[50_000_000];
    void start(ScheduledExecutorService ses) {
        ses.scheduleAtFixedRate(new Runnable() {
            public void run() { /* uses no outer fields */ }
        }, 0, 1, TimeUnit.SECONDS);
    }
}
// the anonymous Runnable keeps Screen (and its 50 MB) reachable
// for the life of the executor

// OUTPUT:
// fix: use a static nested Runnable or a non-capturing lambda`],
        [`Real-world: an LRU cache (keeps the most recently used entries) built from <code>LinkedHashMap</code> with an anonymous subclass that overrides <code>removeEldestEntry</code>.`,
            r`Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
    protected boolean removeEldestEntry(Map.Entry<String, Integer> e) {
        return size() > 2;                     // keep at most 2 entries
    }
};
lru.put("a", 1); lru.put("b", 2);
lru.get("a");                                  // "a" is now most recent
lru.put("c", 3);                               // "b" is evicted
System.out.println(lru.keySet());

// OUTPUT:
// [a, c]`]
    ),

    'interfaces-in-java': dv(
        [`Interface methods compile to <code>invokeinterface</code> and are dispatched through the receiver class itable (with inline caches in the JIT). Default methods are inherited into implementing classes at link time; resolution rules: a class method beats any interface default, the most specific interface wins, and conflicts must be resolved explicitly. Private interface methods share code between defaults. Fields are static constants initialized when the interface is first used.`,
            r`interface A { default String m() { return "A"; } }
interface B extends A {
    default String m() { return "B" + helper(); }
    private String helper() { return "!"; }
}
class Base { public String m() { return "Base"; } }
class C implements B {}
class D extends Base implements B {}
System.out.println(new C().m() + " " + new D().m());

// OUTPUT:
// B! Base`],
        [`Design: small role interfaces, functional interfaces (<code>Function</code>, <code>Predicate</code>, <code>Supplier</code>), generic interfaces (<code>Repository&lt;T&gt;</code>), marker interfaces, sealed interfaces for algebraic data types, and interface evolution with default methods. Test doubles and dependency inversion depend on interfaces. Avoid the constant interface anti-pattern; use a final class or enum.`,
            r`@FunctionalInterface
interface Validator<T> {
    boolean validate(T t);

    default Validator<T> and(Validator<T> o) {
        return t -> validate(t) && o.validate(t);
    }
    static <T> Validator<T> not(Validator<T> v) {
        return t -> !v.validate(t);
    }
}
Validator<String> nonEmpty = s -> !s.isEmpty();
Validator<String> shortStr = s -> s.length() < 5;
Validator<String> both = nonEmpty.and(shortStr);
System.out.println(both.validate("abc") + " " + both.validate("abcdef")
    + " " + Validator.not(nonEmpty).validate(""));

// OUTPUT:
// true false true`],
        [`Mistakes: interfaces used as constant holders, one-implementation interfaces for everything, fat interfaces, default methods that depend on mutable state or break implementers, diamond default conflicts (compile error until resolved), and changing a published interface by adding abstract methods (breaks all implementers). Add defaults or a new interface.`,
            r`interface Old { void a(); }
// adding "void b();" breaks every implementer; instead:
interface Old2 extends Old { default void b() { /* sensible default */ } }

// OUTPUT:
// existing implementations keep compiling`],
        [`Interface dispatch has negligible cost after JIT. Many tiny interfaces and lambdas are fine. Megamorphic call sites (many implementations) prevent inlining: watch hot loops over heterogeneous lists.`,
            r`// JMH: interface call monomorphic: 1.2 ns/op, megamorphic: 3.4 ns/op   (typical)
// strategy: keep hot paths monomorphic or switch on a sealed type

// OUTPUT:
// small differences that matter only in very hot code`],
        [`Real-world: the JDK collections (<code>List</code>, <code>Map</code>) and JDBC (<code>Connection</code>) are interfaces with many implementations; Spring injects implementations by interface type.`,
            r`@Service
class OrderService {
    private final PaymentGateway gateway;
    OrderService(PaymentGateway gateway) { this.gateway = gateway; }
}
@Profile("test") @Component
class FakeGateway implements PaymentGateway {
    public Receipt charge(long cents) { return new Receipt("fake-" + cents); }
}

// OUTPUT:
// tests run with the fake, production with the real gateway`]
    ),

    'equals-hashcode': dv(
        [`<code>HashMap.get(key)</code> computes <code>hashCode()</code> to pick a bucket, then calls <code>equals</code> on entries in that bucket (after comparing stored hashes). If hashCode differs for equal objects, the lookup goes to the wrong bucket and fails. The contract: consistent across calls (no state change), equal objects share a hashCode, unequal objects ideally spread. <code>Object.hashCode</code> is typically an identity hash stored in the header.`,
            r`class K {
    final int v;
    K(int v) { this.v = v; }
    public boolean equals(Object o) { return o instanceof K k && k.v == v; }
    public int hashCode() { return 31 * v + 7; }
}
Map<K, String> m = new HashMap<>(); m.put(new K(5), "five");
boolean differ = new Object().hashCode() != new Object().hashCode();
System.out.println(m.get(new K(5)) + " " + new K(5).hashCode() + " " + differ);

// OUTPUT:
// five 162 true`],
        [`Implementation recipe (Effective Java): equals checks <code>this == o</code>, type with <code>instanceof</code> (or getClass for strict), then each significant field (primitives with <code>==</code>, floats with <code>Float.compare</code>, objects with <code>Objects.equals</code>, arrays with <code>Arrays.equals</code>). hashCode combines the same fields (<code>Objects.hash</code>, or <code>31 * result + c</code>). Records and Lombok <code>@EqualsAndHashCode</code> generate both. For entity classes use a business key or the id with careful null handling.`,
            r`final class Money {
    final long cents; final String cur; final double[] rates;
    Money(long cents, String cur, double[] rates) {
        this.cents = cents; this.cur = cur; this.rates = rates;
    }
    @Override public boolean equals(Object o) {
        return this == o || (o instanceof Money m && cents == m.cents
            && Objects.equals(cur, m.cur) && Arrays.equals(rates, m.rates));
    }
    @Override public int hashCode() {
        return 31 * Objects.hash(cents, cur) + Arrays.hashCode(rates);
    }
}
Money a = new Money(1, "INR", new double[]{1});
Money b = new Money(1, "INR", new double[]{1});
System.out.println(a.equals(b));

// OUTPUT:
// true`],
        [`Common mistakes:
<ul>
<li>Overriding only one of the two methods.</li>
<li>Using <b>mutable fields</b> in <code>hashCode</code>.</li>
<li>Writing <code>equals(Foo)</code> (an <b>overload</b>) instead of <code>equals(Object)</code>. Add <code>@Override</code> to catch this.</li>
<li><code>instanceof</code> asymmetry with subclasses.</li>
<li>Comparing floating-point fields with <code>==</code> (use <code>Double.compare</code>).</li>
<li>Calling <code>equals</code> on a null field (NullPointerException).</li>
<li>An expensive <code>hashCode</code> recalculated on every call.</li>
<li>JPA entities hashing a generated id that changes after persist.</li>
<li>Relying on the identity hash across JVM runs (it changes).</li>
</ul>`,
            r`class Wrong {
    int v;
    // overload, not an override
    public boolean equals(Wrong w) { return w.v == v; }
}
Set<Wrong> s = new HashSet<>(); Wrong a = new Wrong(); s.add(a);
Object o = new Wrong();
System.out.println(o.equals(a) + " " + new Wrong().equals(a));

// OUTPUT:
// false true`],
        [`Good hash functions spread values evenly; poor ones (constant, only one field) make buckets long: lookups drop from O(1) to O(n) (or O(log n) with treeified Comparable keys). Cache the hash in immutable classes with expensive hashCode (String does). Check distribution when keys are structured.`,
            r`class Bad {
    final int v;
    Bad(int v) { this.v = v; }
    public int hashCode() { return 1; } // constant: every key in one bucket
    public boolean equals(Object o) { return o instanceof Bad b && b.v == v; }
}
Map<Bad, Integer> m = new HashMap<>(); long t = System.nanoTime();
for (int i = 0; i < 20_000; i++) m.put(new Bad(i), i);
System.out.println("constant hash ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies; far slower than with a spread hash)
// constant hash ms=1500`],
        [`Real-world: deduplicating events or customers by business key, caching with composite keys, and entities in sets.`,
            r`record CacheKey(String tenant, long userId, Locale locale) {}
Map<CacheKey, Profile> cache = new ConcurrentHashMap<>();
cache.put(new CacheKey("acme", 7, Locale.US), new Profile("Asha"));
System.out.println(cache.containsKey(new CacheKey("acme", 7, Locale.US)));

// OUTPUT:
// true`]
    ),

    'comparable-comparator': dv(
        [`<p>Object sorting uses <b>TimSort</b>. It finds sorted runs and merges them. It is stable, takes O(n log n) time, and is close to O(n) on nearly sorted data. Primitive arrays use dual-pivot quicksort.</p>
<ul>
<li>A comparator must be consistent: if a &lt; b and b &lt; c then a &lt; c, and swapping the arguments flips the sign.</li>
<li><code>Comparator.comparing</code> builds a comparator from a key extractor.</li>
<li><code>thenComparing</code> adds a tie-breaker; <code>reversed()</code> flips the order.</li>
<li><code>comparing(f)</code> boxes primitive keys; <code>comparingInt/Long/Double</code> avoid boxing.</li>
</ul>`,
            r`record P(String name, int age) {}
List<P> l = new ArrayList<>(List.of(new P("B", 30), new P("A", 30), new P("C", 25)));
l.sort(Comparator.comparingInt(P::age)
    .thenComparing(P::name, Comparator.reverseOrder()));
System.out.println(l.stream().map(P::name).toList());
String[] words = {"Zebra", "apple", "Mango"};
Arrays.sort(words, String.CASE_INSENSITIVE_ORDER);
System.out.println(Arrays.toString(words));

// OUTPUT:
// [C, B, A]
// [apple, Mango, Zebra]`],
        [`<p>More tools you will meet in real code:</p>
<ul>
<li><code>Collator</code> for locale-aware text order.</li>
<li>Natural comparators, so "file2" comes before "file10".</li>
<li><code>Collections.max/min</code>, <code>stream().sorted(cmp)</code>, <code>TreeMap(cmp)</code> and <code>Comparator.nullsLast</code>.</li>
<li>Top-k with a bounded <code>PriorityQueue</code>.</li>
<li>Multi-key sort using stability: sort by the least important key first.</li>
</ul>`,
            r`// min-heap that keeps the 3 largest values
PriorityQueue<Integer> topK = new PriorityQueue<>();
for (int v : new int[]{5, 1, 9, 3, 7, 8}) {
    topK.add(v);
    if (topK.size() > 3) topK.poll();
}
System.out.println(new TreeSet<>(topK).descendingSet());
// text part first, then the number part
Comparator<String> natural = Comparator
    .comparing((String s) -> s.replaceAll("\\d+", ""))
    .thenComparingInt(s -> Integer.parseInt(s.replaceAll("\\D+", "0")));
List<String> files = new ArrayList<>(List.of("file10", "file2", "file1"));
files.sort(natural);
System.out.println(files);

// OUTPUT:
// [9, 8, 7]
// [file1, file2, file10]`],
        [`<p>Common mistakes:</p>
<ul>
<li>Subtraction comparators (<code>a - b</code>) that overflow.</li>
<li>Comparing doubles by hand instead of <code>Double.compare</code>.</li>
<li>Inconsistent comparators, which can throw <code>IllegalArgumentException</code>.</li>
<li>Changing a sort key while the object is inside a <code>TreeSet</code>.</li>
<li>Ignoring <code>null</code> or mixing types.</li>
<li>A <code>compareTo</code> that disagrees with <code>equals</code>: a <code>TreeSet</code> treats "equal" items as duplicates, so elements vanish.</li>
</ul>`,
            r`// never returns 0, so it breaks the contract for equal values
Comparator<Double> broken = (a, b) -> a > b ? 1 : -1;
List<Double> d = new ArrayList<>();
for (int i = 0; i < 100; i++) d.add(i % 3 == 0 ? 1.0 : 2.0);
try {
    d.sort(broken);
    System.out.println("sorted (lucky)");
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());
}

// OUTPUT: (may vary, depends on the data)
// Comparison method violates its general contract!`],
        [`<p>Sorting n items costs O(n log n) comparisons, so keep <code>compare</code> cheap and free of new objects.</p>
<ul>
<li>For expensive keys, compute each key once (decorate, sort, undecorate).</li>
<li>For large primitive arrays use <code>Arrays.parallelSort</code>.</li>
</ul>`,
            r`record Rec(String raw) { }
List<Rec> data = IntStream.range(0, 100_000)
    .mapToObj(i -> new Rec("k" + (i * 7919 % 100_000)))
    .collect(Collectors.toList());
// compute each key once, then sort by the cached key
Map<Rec, String> keyCache = new IdentityHashMap<>();
data.forEach(r -> keyCache.put(r, r.raw().toUpperCase()));
data.sort(Comparator.comparing(keyCache::get));

// OUTPUT:
// the expensive key is computed once per element instead of O(log n) times`],
        [`<p>Real-world uses: a leaderboard where ties go to the earlier submission, and a table sorted by user-selected columns.</p>`,
            r`record Score(String user, int points, Instant at) {}
Comparator<Score> board = Comparator.comparingInt(Score::points)
    .reversed().thenComparing(Score::at);
List<Score> top = scores.stream().sorted(board).limit(10).toList();

// OUTPUT:
// higher points first; earlier submission wins ties`]
    ),

    'object-cloning': dv(
        [`<code>Object.clone()</code> is a protected native method that allocates a new object of the same class and copies fields bitwise without calling any constructor. It requires <code>Cloneable</code>. Overriding should call <code>super.clone()</code>, widen visibility to public, narrow the return type (covariant) and deep-copy mutable fields. Final fields cannot be reassigned after cloning, a major flaw.`,
            r`class Matrix implements Cloneable {
    int[][] cells;
    Matrix(int[][] c) { cells = c; }
    @Override public Matrix clone() {
        try {
            Matrix m = (Matrix) super.clone();
            m.cells = Arrays.stream(cells).map(int[]::clone).toArray(int[][]::new);
            return m;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
        }
    }
}
Matrix a = new Matrix(new int[][]{{1, 2}, {3, 4}}), b = a.clone();
a.cells[0][0] = 99;
System.out.println(b.cells[0][0]);

// OUTPUT:
// 1`],
        [`Alternatives: copy constructors and copy factories; builders with <code>toBuilder()</code>; immutable value objects (no copy needed); records with wither methods; serialization round trip (slow, requires Serializable); libraries (MapStruct, Jackson convertValue, Apache Commons <code>SerializationUtils.clone</code>); and structural sharing in persistent collections. For arrays, collections and strings use their own copy APIs.`,
            r`record Order(long id, List<String> items) {
    Order { items = List.copyOf(items); }   // defensive copy in the constructor
    Order withItem(String i) {
        List<String> n = new ArrayList<>(items);
        n.add(i);
        return new Order(id, n);
    }
}
Order o1 = new Order(1, List.of("pen")), o2 = o1.withItem("book");
System.out.println(o1.items() + " " + o2.items());
List<int[]> list = List.of(new int[]{1});
List<int[]> shallow = new ArrayList<>(list);   // shares the arrays
// Jackson round trip (needs the library) also gives a deep copy:
ObjectMapper om = new ObjectMapper();
Order copy = om.readValue(om.writeValueAsString(o2), Order.class);

// OUTPUT:
// [pen] [pen, book]`],
        [`Mistakes: forgetting Cloneable, not deep copying mutable fields, clone with final fields, subclass not calling super.clone() (breaks the chain: <code>getClass()</code> of the result is wrong), public clone that throws checked exceptions, assuming collections' clone() deep copies (they are shallow), and cloning objects with identity fields (ids, locks, threads).`,
            r`ArrayList<StringBuilder> a = new ArrayList<>(List.of(new StringBuilder("x")));
@SuppressWarnings("unchecked") ArrayList<StringBuilder> c = (ArrayList<StringBuilder>) a.clone();
c.get(0).append("y");
System.out.println(a.get(0) + " " + (a.get(0) == c.get(0)));

// OUTPUT:
// xy true`],
        [`Clone is fast for flat objects but deep copying graphs costs proportional to size. Immutable sharing avoids copies entirely. Defensive copying on every getter can be a hot spot: return unmodifiable views instead of copies when callers only read.`,
            r`int[] big = new int[10_000_000];
long t = System.nanoTime();
int[] c1 = big.clone();
long t1 = System.nanoTime() - t;
t = System.nanoTime();
int[] c2 = Arrays.copyOf(big, big.length);
long t2 = System.nanoTime() - t;
System.out.println(c1.length == c2.length);

// OUTPUT:
// true`],
        [`Real-world: undo history snapshots using immutable state objects and a copy-on-change approach, instead of cloning large mutable documents.`,
            r`record Doc(List<String> lines) {
    Doc { lines = List.copyOf(lines); }
    Doc edit(int i, String s) {
        List<String> n = new ArrayList<>(lines);
        n.set(i, s);
        return new Doc(n);
    }
}
Deque<Doc> history = new ArrayDeque<>();
Doc cur = new Doc(List.of("a", "b"));
history.push(cur);
cur = cur.edit(0, "A");
cur = history.pop();   // undo: just restore the old immutable snapshot
System.out.println(cur.lines());

// OUTPUT:
// [a, b]`]
    )
};
