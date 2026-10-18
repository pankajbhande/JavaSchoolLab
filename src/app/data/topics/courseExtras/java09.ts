// Core Java extras, part 9: Java 8 features (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java09Extras: Record<string, Extra> = {
    'java8-functional-interface': x(
        ['<b>Functional interface</b>: exactly one abstract method; a lambda or method reference can implement it.',
            '<b>Annotation</b>: mark it with <code>@FunctionalInterface</code> so the compiler checks the rule.',
            '<b>Built-ins</b> in <code>java.util.function</code>: <code>Function&lt;T,R&gt;</code>, <code>Predicate&lt;T&gt;</code>, <code>Consumer&lt;T&gt;</code>, <code>Supplier&lt;T&gt;</code>, <code>BiFunction</code>, <code>UnaryOperator</code>, <code>BinaryOperator</code>.'],
        ['<b>What does not count</b>: default and static methods are not abstract, and methods of <code>Object</code> (like <code>equals</code>) are ignored.',
            '<b>Compose behavior</b>: <code>f.andThen(g)</code>, <code>f.compose(g)</code>, <code>p.and(q)</code>, <code>p.negate()</code>, <code>Comparator.thenComparing</code>.',
            '<b>Primitive specializations</b> avoid boxing: <code>IntPredicate</code>, <code>ToIntFunction</code>, <code>IntBinaryOperator</code>.'],
        ['<b>Existing ones</b> in the JDK: <code>Runnable</code>, <code>Callable</code>, <code>Comparator</code>, <code>ActionListener</code>.',
            '<b>API design</b>: build around small, focused functional interfaces (strategy, callbacks).',
            '<b>Checked exceptions</b> need your own functional interface that declares <code>throws</code>.'],
        [['F', 'What is a functional interface?', 'An interface with exactly one abstract method, usable as a lambda target.'],
            ['F', 'Name some built-in functional interfaces.', 'Function, Predicate, Consumer, Supplier, UnaryOperator, BinaryOperator.'],
            ['M', 'What does @FunctionalInterface do?', 'It makes the compiler verify that the interface has a single abstract method.'],
            ['M', 'Predicate vs Function?', 'Predicate returns boolean from one argument; Function maps one argument to any result.'],
            ['S', 'How do you compose functions?', 'Use andThen and compose on Function, and and, or, negate on Predicate.'],
            ['S', 'How do you use a lambda with a checked exception?', 'Define a functional interface whose method declares throws, or wrap the call in an unchecked exception.']],
        [['The core interfaces.',
            r`Function<String, Integer> len = String::length;
Predicate<String> empty = String::isEmpty;
Consumer<String> print = System.out::println;
Supplier<List<String>> make = ArrayList::new;
BinaryOperator<Integer> add = Integer::sum;
print.accept(len.apply("java") + " " + empty.negate().test("x")
    + " " + make.get() + " " + add.apply(2, 3));

// OUTPUT:
// 4 true [] 5`],
            ['Custom functional interface and composition.',
                r`@FunctionalInterface interface Discount {
    double apply(double price);
    default Discount then(Discount d) { return p -> d.apply(apply(p)); }
}
Discount tenOff = p -> p * 0.9, flat50 = p -> p - 50;
System.out.println(tenOff.then(flat50).apply(1000));
Function<Integer, Integer> inc = x -> x + 1, dbl = x -> x * 2;
System.out.println(inc.andThen(dbl).apply(5) + " " + inc.compose(dbl).apply(5));

// OUTPUT:
// 850.0
// 12 11`]],
        [['Two abstract methods fail.',
            r`// @FunctionalInterface interface Bad { void a(); void b(); }
// error: Unexpected @FunctionalInterface annotation
// Bad is not a functional interface (multiple abstract methods)

// OUTPUT:
// compile-time error`],
            ['Throwing functional interface.',
                r`@FunctionalInterface interface IOFunction<T, R> { R apply(T t) throws IOException; }
static <T, R> Function<T, R> wrap(IOFunction<T, R> f) {
    return t -> {
        try { return f.apply(t); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    };
}
System.out.println(wrap((String s) -> s.trim()).apply("  ok "));

// OUTPUT:
// ok`]]
    ),

    'java8-lambda-expression': x(
        ['<b>Anonymous function:</b> <code>(parameters) -&gt; expression</code> or <code>(parameters) -&gt; { statements; }</code>.',
            '<b>Functional interface:</b> a lambda implements one, for example <code>Runnable r = () -&gt; System.out.println("hi");</code>.',
            '<b>Type inference:</b> parameter types can be left out, as in <code>(a, b) -&gt; a + b</code>.'],
        ['<b>Capturing:</b> a lambda can use a local variable of the enclosing method only if it is <b>effectively final</b> (never changed after it is set).',
            '<b><code>this</code></b> inside a lambda means the enclosing object, unlike in an anonymous class.',
            '<b>Method references</b> are shorthand for a lambda that only calls one method: <code>String::length</code>, <code>System.out::println</code>, <code>Person::new</code>.'],
        ['<b>Implementation:</b> lambdas compile to <code>invokedynamic</code> and are created on first use through <code>LambdaMetafactory</code>; a non-capturing lambda is usually one shared instance.',
            '<b>Style:</b> keep lambdas short and move longer logic into named methods.',
            '<b>Side effects:</b> avoid shared mutable state inside lambdas used in streams.'],
        [['F', 'What is a lambda expression?', 'A concise anonymous function that implements a functional interface.'],
            ['F', 'What is the syntax?', '(parameters) -> expression or { statements }.'],
            ['M', 'Why must captured local variables be effectively final?', 'Lambdas copy captured values, so changing the variable afterwards would be inconsistent.'],
            ['M', 'How does this differ in a lambda and an anonymous class?', 'In a lambda this is the enclosing object; in an anonymous class it is the anonymous instance.'],
            ['S', 'How are lambdas implemented?', 'With invokedynamic and LambdaMetafactory at run time, not as inner classes.'],
            ['S', 'Name the four kinds of method references.', 'Static method, instance method of a particular object, instance method of an arbitrary object of a type, and constructor.']],
        [['Lambdas and method references.',
            r`List<String> names = new ArrayList<>(List.of("Raoji", "abaji", "Moropant"));
names.sort((a, b) -> a.compareToIgnoreCase(b));
names.forEach(n -> System.out.print(n.toUpperCase() + " "));
System.out.println();
Function<String, Integer> parse = Integer::parseInt;       // static
Supplier<ArrayList<String>> ctor = ArrayList::new;        // constructor
BiFunction<String, String, Boolean> eq = String::equalsIgnoreCase;   // arbitrary object
System.out.println(parse.apply("42") + " " + ctor.get() + " " + eq.apply("A", "a"));

// OUTPUT:
// ABAJI MOROPANT RAOJI
// 42 [] true`],
            ['Capturing and this.',
                r`class Greeter {
    String name = "outer";

    Runnable lambda() {
        return () -> System.out.println(this.name);   // Greeter.this
    }

    Runnable anon() {
        return new Runnable() {
            String name = "anon";
            public void run() { System.out.println(this.name); }
        };
    }
}
Greeter g = new Greeter();
g.lambda().run();
g.anon().run();

// OUTPUT:
// outer
// anon`]],
        [['Effectively final.',
            r`int count = 0;
// count++ inside the lambda would not compile:
// "variable used in lambda should be final or effectively final"
List.of(1, 2, 3).forEach(n -> { /* count++; */ });

int[] box = {0};
// Works, but is a smell. Prefer a reduction.
List.of(1, 2, 3).forEach(n -> box[0] += n);
int sum = List.of(1, 2, 3).stream().mapToInt(Integer::intValue).sum();
System.out.println(box[0] + " " + sum);

// OUTPUT:
// 6 6`],
            ['Recursive lambda needs a field or holder.',
                r`static Function<Integer, Integer> fact;
static { fact = n -> n <= 1 ? 1 : n * fact.apply(n - 1); }
System.out.println(fact.apply(5));

// OUTPUT:
// 120`]]
    ),

    'java8-default-method': x(
        ['<b>Default method:</b> a method with a body inside an interface, for example <code>default void log(String m) { System.out.println(m); }</code>.',
            '<b>Safe change:</b> you can add methods to an interface without breaking existing implementing classes.',
            '<b>Inherit or override:</b> implementing classes get it for free and may override it.'],
        ['<b>JDK upgrade:</b> defaults added <code>Collection.stream()</code>, <code>List.sort()</code> and <code>Map.forEach()</code> to old interfaces.',
            '<b>Conflict:</b> if two interfaces give the same default method, the class must override it and may call <code>A.super.method()</code>.',
            '<b>Functional interfaces:</b> defaults do not count as abstract methods, so a lambda can still target the interface.'],
        ['<b>No state:</b> defaults cannot touch instance fields (interfaces have none); they call the abstract methods of the interface.',
            '<b>Best use:</b> convenience and composition, such as <code>Comparator.reversed</code>, not shared state.',
            '<b>API evolution:</b> add a default method instead of an abstract one to stay source- and binary-compatible.'],
        [['F', 'What is a default method?', 'An interface method with an implementation, introduced in Java 8.'],
            ['F', 'Why were default methods added?', 'To evolve interfaces (like Collection) without breaking existing implementations.'],
            ['M', 'What if two interfaces have the same default method?', 'The class must override it and can choose with InterfaceName.super.method().'],
            ['M', 'Class method vs interface default with the same signature?', 'The class method wins.'],
            ['S', 'Can a default method use fields?', 'No, interfaces have no instance state; it can call the interface abstract methods.'],
            ['S', 'Can you override Object methods in a default method?', 'No, interfaces cannot provide default implementations for equals, hashCode or toString.']],
        [['Default for API evolution.',
            r`interface Shape {
    double area();
    default String describe() {
        return getClass().getSimpleName() + " area=" + String.format("%.1f", area());
    }
}
record Circle(double r) implements Shape {
    public double area() { return Math.PI * r * r; }
}
System.out.println(new Circle(1).describe());

// OUTPUT:
// Circle area=3.1`],
            ['Resolving a conflict.',
                r`interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }
class C implements A, B {
    public String hi() { return A.super.hi() + B.super.hi(); }
}
System.out.println(new C().hi());

// OUTPUT:
// AB`]],
        [['Class wins.',
            r`interface I { default String who() { return "interface"; } }
class Base {
    public String who() { return "class"; }
}
class D extends Base implements I {}
System.out.println(new D().who());

// OUTPUT:
// class`],
            ['JDK defaults.',
                r`List<Integer> l = new ArrayList<>(List.of(3, 1, 2));
l.sort(null);
l.removeIf(x -> x == 2);
Map<String, Integer> m = new HashMap<>();
m.computeIfAbsent("a", k -> 1);
System.out.println(l + " " + m);

// OUTPUT:
// [1, 3] {a=1}`]]
    ),

    'java8-static-method': x(
        ['<b>Static methods with a body:</b> an interface can have <code>static</code> methods, such as <code>static Shape unit() { ... }</code>.',
            '<b>Call on the interface name:</b> <code>Comparator.naturalOrder()</code>, <code>List.of()</code>, not on an instance.',
            '<b>Not inherited:</b> implementing classes do not get them.'],
        ['<b>Factory methods and helpers:</b> use them for code related to the interface (<code>Stream.of</code>, <code>Predicate.not</code>, <code>Map.entry</code>).',
            '<b>No overriding:</b> a static method is not part of the object contract.',
            '<b>Java 9:</b> private static helper methods can share code between static and default methods.'],
        ['<b>Utility classes:</b> <code>Collections</code> and <code>Arrays</code> existed because interfaces could not hold statics; related helpers can now live with the interface.',
            '<b>Focused API:</b> do not turn the interface into a dumping ground for utilities.',
            '<b>Static factories:</b> they give readable construction and hide implementations.'],
        [['F', 'Can interfaces have static methods?', 'Yes, since Java 8.'],
            ['F', 'How do you call an interface static method?', 'With the interface name: InterfaceName.method().'],
            ['M', 'Are interface static methods inherited?', 'No, they must be called through the interface name.'],
            ['M', 'Why add static methods to interfaces?', 'So factory and helper methods can live with the interface instead of in separate utility classes.'],
            ['S', 'Can implementing classes override a static interface method?', 'No, they are not inherited, so a class method with the same name is unrelated.'],
            ['S', 'What did Java 9 add?', 'Private interface methods (static or instance) to share code among default and static methods.']],
        [['Factory and helper.',
            r`interface Validator {
    boolean ok(String s);
    static Validator notBlank() { return s -> s != null && !s.isBlank(); }
    static Validator maxLen(int n) { return s -> s.length() <= n; }
    default Validator and(Validator o) { return s -> ok(s) && o.ok(s); }
}
Validator v = Validator.notBlank().and(Validator.maxLen(5));
System.out.println(v.ok("hello") + " " + v.ok("too long text") + " " + v.ok(" "));

// OUTPUT:
// true false false`],
            ['JDK interface statics.',
                r`System.out.println(List.of(1, 2));
System.out.println(Comparator.<Integer>naturalOrder().compare(1, 2));
System.out.println(Stream.of("a", "b").count());
System.out.println(Map.entry("k", 1));
System.out.println(Stream.of("a", "", "b")
    .filter(Predicate.not(String::isEmpty)).toList());

// OUTPUT:
// [1, 2]
// -1
// 2
// k=1
// [a, b]`]],
        [['Not inherited.',
            r`interface Util {
    static String hi() { return "hi"; }
}
class Impl implements Util {}
// new Impl().hi();      // error: cannot find symbol
// Impl.hi();            // error
System.out.println(Util.hi());

// OUTPUT:
// hi`],
            ['Private helper (Java 9).',
                r`interface Fmt {
    default String a() { return wrap("a"); }
    default String b() { return wrap("b"); }
    private String wrap(String s) { return "[" + s + "]"; }
}
System.out.println(new Fmt() {}.a() + new Fmt() {}.b());

// OUTPUT:
// [a][b]`]]
    ),

    'java8-foreach-method': x(
        ['<b>Action per element:</b> <code>forEach</code> runs an action for each element, for example <code>list.forEach(x -&gt; System.out.println(x));</code>.',
            '<b>Where it exists:</b> on <code>Iterable</code> (lists, sets), on <code>Map</code> (<code>map.forEach((k, v) -&gt; ...)</code>) and on streams.',
            '<b>Argument:</b> a <code>Consumer</code>, which takes one value and returns nothing.'],
        ['<b>No break or continue:</b> use a normal loop, or a stream with <code>takeWhile</code> or <code>filter</code>.',
            '<b>Do not change the source:</b> adding or removing inside <code>forEach</code> can throw <code>ConcurrentModificationException</code>.',
            '<b>Order:</b> <code>forEachOrdered</code> keeps encounter order in parallel streams.'],
        ['<b>Parallel streams:</b> <code>parallelStream().forEach</code> has no ordering guarantee, and shared mutable state is a bug.',
            '<b>Side effects vs results:</b> forEach is fine for side effects. To build results use <code>map</code> and <code>collect</code>, not an external list.',
            '<b>Checked exceptions:</b> inside forEach they need try/catch or a wrapper.'],
        [['F', 'What does forEach do?', 'It performs an action on each element of a collection or stream.'],
            ['F', 'What type of argument does forEach take?', 'A Consumer (lambda or method reference).'],
            ['M', 'Can you break out of forEach?', 'No; use a regular loop or a short-circuiting stream operation.'],
            ['M', 'forEach vs for-each loop?', 'The loop supports break, continue, return and checked exceptions; forEach is concise but more limited.'],
            ['S', 'Why avoid parallel forEach with shared state?', 'Threads race on the shared structure; use collect or thread-safe accumulators.'],
            ['S', 'What does forEachOrdered do?', 'It processes elements in the encounter order even in parallel streams.']],
        [['forEach on collections and maps.',
            r`List<String> names = List.of("Abaji", "Raoji");
names.forEach(System.out::println);
Map<String, Integer> marks = new TreeMap<>(Map.of("math", 90, "sci", 85));
marks.forEach((subject, m) -> System.out.println(subject + "=" + m));

// OUTPUT:
// Abaji
// Raoji
// math=90
// sci=85`],
            ['Prefer collect to side effects.',
                r`List<Integer> bad = new ArrayList<>();
Stream.of(1, 2, 3).forEach(n -> bad.add(n * 2));               // works only sequentially
List<Integer> good = Stream.of(1, 2, 3).map(n -> n * 2).toList();
System.out.println(bad + " " + good);

// OUTPUT:
// [2, 4, 6] [2, 4, 6]`]],
        [['Modification during iteration.',
            r`List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
try {
    l.forEach(x -> { if (x == 1) l.add(9); });
} catch (ConcurrentModificationException e) {
    System.out.println("CME");
}

// OUTPUT:
// CME`],
            ['Ordered parallel.',
                r`IntStream.range(0, 5).parallel().forEachOrdered(i -> System.out.print(i + " "));
System.out.println();

// OUTPUT:
// 0 1 2 3 4`]]
    ),

    'java8-optional-class': x(
        ['<b>Container:</b> <code>Optional&lt;T&gt;</code> may or may not hold a non-null value, making "no value" explicit.',
            '<b>Create</b> with <code>Optional.of(v)</code> (non-null), <code>Optional.ofNullable(v)</code>, <code>Optional.empty()</code>.',
            '<b>Read</b> with <code>isPresent()</code>, <code>get()</code> (only after checking), <code>orElse</code>, <code>orElseGet</code>, <code>orElseThrow</code>, <code>ifPresent</code>.'],
        ['<b>Transform</b> with <code>map</code>, <code>flatMap</code>, <code>filter</code> instead of manual null checks.',
            '<b>Eager vs lazy:</b> <code>orElse(x)</code> always evaluates x; <code>orElseGet(supplier)</code> evaluates lazily.',
            '<b>Newer versions:</b> Java 9+ adds <code>ifPresentOrElse</code>, <code>or</code>, <code>stream()</code>; Java 10+ adds <code>orElseThrow()</code> without arguments.'],
        ['<b>Return values only:</b> not fields, method parameters or collections; <code>Optional</code> is not serializable and adds allocation.',
            '<b>Avoid get():</b> never call <code>get()</code> without a check; prefer <code>orElseThrow</code>.',
            '<b>Monad-like:</b> a type whose chains (<code>map</code>, <code>flatMap</code>) replace nested null checks.'],
        [['F', 'What is Optional?', 'A container for a value that may be absent, used to avoid null checks.'],
            ['F', 'How do you create an Optional from a possibly null value?', 'Optional.ofNullable(value).'],
            ['M', 'orElse vs orElseGet?', 'orElse always evaluates its argument; orElseGet runs the supplier only when the Optional is empty.'],
            ['M', 'map vs flatMap on Optional?', 'map wraps the function result in an Optional; flatMap expects the function to already return an Optional and flattens it.'],
            ['S', 'Where should Optional not be used?', 'On fields, method parameters and in collections; it is intended for return types.'],
            ['S', 'Why is Optional.get() discouraged?', 'It throws NoSuchElementException if empty; use orElseThrow with a meaningful exception or functional style.']],
        [['Chaining instead of null checks.',
            r`record Address(String city) {}
record User(String name, Address addr) {}
static Optional<User> find(int id) {
    return id == 1 ? Optional.of(new User("Abaji", new Address("Pune")))
                   : Optional.empty();
}
String city = find(1).map(User::addr).map(Address::city)
    .map(String::toUpperCase).orElse("UNKNOWN");
String none = find(2).map(User::addr).map(Address::city).orElse("UNKNOWN");
System.out.println(city + " " + none);

// OUTPUT:
// PUNE UNKNOWN`],
            ['orElse vs orElseGet and orElseThrow.',
                r`static String expensive() {
    System.out.println("computing default");
    return "dflt";
}
Optional<String> present = Optional.of("value");
System.out.println(present.orElse(expensive()));
System.out.println(present.orElseGet(() -> expensive()));
try {
    Optional.empty().orElseThrow(() -> new NoSuchElementException("order not found"));
} catch (NoSuchElementException e) {
    System.out.println(e.getMessage());
}

// OUTPUT:
// computing default
// value
// value
// order not found`]],
        [['Optional misuse.',
            r`Optional<String> o = Optional.empty();
// o.get();                              // NoSuchElementException: No value present
// Optional.of(null);                    // NullPointerException (use ofNullable)
o.ifPresentOrElse(v -> System.out.println(v), () -> System.out.println("empty"));

// OUTPUT:
// empty`],
            ['Stream interplay.',
                r`List<Optional<String>> l = List.of(Optional.of("a"), Optional.empty(), Optional.of("b"));
System.out.println(l.stream().flatMap(Optional::stream).toList());

// OUTPUT:
// [a, b]`]]
    ),

    'java8-string-joiner': x(
        ['<b>Joining:</b> <code>StringJoiner</code> joins strings with a delimiter, optional prefix and suffix: <code>new StringJoiner(", ", "[", "]")</code>.',
            '<b>Use:</b> add parts with <code>add("x")</code> and read the result with <code>toString()</code>.',
            '<b>Alternatives:</b> <code>String.join(", ", list)</code> and <code>Collectors.joining(", ")</code>.'],
        ['<b>Empty joiner:</b> <code>setEmptyValue("none")</code> controls the output when nothing was added.',
            '<b>Merging:</b> <code>merge</code> combines two joiners.',
            '<b>Choosing:</b> <code>String.join</code> is best for simple joins of an Iterable or varargs; <code>Collectors.joining</code> for streams.'],
        ['<b>Mutable:</b> <code>StringJoiner</code> changes in place and is not thread-safe.',
            '<b>Speed:</b> for many free-form appends in loops <code>StringBuilder</code> may be faster; <code>StringJoiner</code> shines for delimiter handling without trailing separator code.',
            '<b>Safety:</b> build CSV and SQL lists carefully: escape values and prefer parameter binding to avoid injection.'],
        [['F', 'What is StringJoiner?', 'A class that joins strings with a delimiter and optional prefix and suffix.'],
            ['F', 'Other ways to join strings in Java 8?', 'String.join and Collectors.joining.'],
            ['M', 'How do you control output for no elements?', 'setEmptyValue.'],
            ['M', 'String.join vs Collectors.joining?', 'String.join works on Iterables and varargs; Collectors.joining is used at the end of a stream pipeline.'],
            ['S', 'Is StringJoiner thread-safe?', 'No.'],
            ['S', 'Why not build comma separated values with a loop and trim?', 'Joiners avoid off-by-one separator bugs and are clearer.']],
        [['StringJoiner basics.',
            r`StringJoiner sj = new StringJoiner(", ", "[", "]");
sj.setEmptyValue("[none]");
System.out.println(sj);
sj.add("Abaji").add("Raoji").add("Moropant");
System.out.println(sj + " length=" + sj.length());

// OUTPUT:
// [none]
// [Abaji, Raoji, Moropant] length=24`],
            ['Joining in other ways.',
                r`List<String> l = List.of("a", "b", "c");
String upper = l.stream().map(String::toUpperCase)
        .collect(Collectors.joining(",", "<", ">"));
System.out.println(String.join("-", l) + " " + upper);

// OUTPUT:
// a-b-c <A,B,C>`]],
        [['Null elements.',
            r`System.out.println(String.join("-", Arrays.asList("a", null, "b")));

// OUTPUT:
// a-null-b`],
            ['Merge.',
                r`StringJoiner a = new StringJoiner("/"), b = new StringJoiner(":");
a.add("x").add("y");
b.add("1").add("2");
System.out.println(a.merge(b));

// OUTPUT:
// x/y/1:2`]]
    ),

    'java8-stream-api': x(
        ['A <b>stream</b> is a pipeline: a source, then <b>intermediate operations</b> (<code>filter</code>, <code>map</code>, <code>sorted</code>), then one <b>terminal operation</b> (<code>collect</code>, <code>forEach</code>, <code>count</code>, <code>reduce</code>).',
            '<b>No storage:</b> streams do not store data and do not change the source. A stream can be used only once.',
            '<b>Lazy:</b> intermediate operations do nothing until a terminal operation runs.'],
        ['<b>Collectors:</b> <code>Collectors.toList()</code> (or <code>Stream.toList()</code> in Java 16+), <code>toSet</code>, <code>toMap</code>, <code>groupingBy</code>, <code>partitioningBy</code>, <code>joining</code>, <code>counting</code>, <code>summingInt</code>, <code>averagingDouble</code>.',
            '<b>Primitive streams:</b> <code>IntStream</code>, <code>LongStream</code> and <code>DoubleStream</code> avoid boxing and add <code>sum</code>, <code>average</code>, <code>range</code>.',
            '<b>Shaping:</b> <code>flatMap</code> flattens nested collections. <code>distinct</code>, <code>limit</code> and <code>skip</code> trim the data. <code>peek</code> is for debugging only.'],
        ['<b>Parallel streams:</b> <code>parallelStream()</code> uses the common <code>ForkJoinPool</code>. It helps only for CPU-heavy work on large, easily split data with no shared state.',
            '<b>Short-circuit operations:</b> <code>findFirst</code>, <code>anyMatch</code> and <code>limit</code> stop early. Keep lambdas pure and stateless.',
            '<b>Order matters:</b> <code>filter</code> before <code>map</code> and <code>sorted</code> to reduce work. Avoid streams for tiny loops where they hurt clarity.'],
        [['F', 'What is the Stream API?', 'A way to process collections declaratively with a pipeline of operations.'],
            ['F', 'Intermediate vs terminal operations?', 'Intermediate operations return a stream and are lazy; terminal operations produce a result or side effect and start the pipeline.'],
            ['M', 'Can a stream be reused?', 'No, it throws IllegalStateException after a terminal operation.'],
            ['M', 'map vs flatMap?', 'map transforms each element to one element; flatMap transforms each to a stream and flattens them.'],
            ['S', 'When is parallelStream a bad idea?', 'For small data, I/O or blocking work, ordered or stateful operations, and with shared mutable state.'],
            ['S', 'How does groupingBy work?', 'It classifies elements by a key function into a Map, with a downstream collector for each group.']],
        [['A typical pipeline.',
            r`record Emp(String name, String dept, double sal) {}
List<Emp> emps = List.of(
    new Emp("Abaji", "IT", 90), new Emp("Raoji", "IT", 70),
    new Emp("Moropant", "HR", 60), new Emp("Anantrao", "HR", 80));
// average salary per department (TreeMap keeps keys sorted)
Map<String, Double> avg = emps.stream().collect(Collectors.groupingBy(
    Emp::dept, TreeMap::new, Collectors.averagingDouble(Emp::sal)));
// top 2 names with salary above 65
List<String> top = emps.stream()
    .filter(e -> e.sal() > 65)
    .sorted(Comparator.comparingDouble(Emp::sal).reversed())
    .map(Emp::name).limit(2).toList();
System.out.println(avg + " " + top);

// OUTPUT:
// {HR=70.0, IT=80.0} [Abaji, Anantrao]`],
            ['flatMap, distinct and reduce.',
                r`List<List<Integer>> nested = List.of(List.of(1, 2), List.of(2, 3), List.of(4));
System.out.println(nested.stream().flatMap(List::stream).distinct().toList());
System.out.println(nested.stream().flatMap(List::stream).reduce(0, Integer::sum));
System.out.println(IntStream.rangeClosed(1, 5).average().getAsDouble());

// OUTPUT:
// [1, 2, 3, 4]
// 12
// 3.0`]],
        [['Streams are single use and lazy.',
            r`Stream<Integer> s = Stream.of(1, 2, 3).peek(x -> System.out.println("seen " + x));
System.out.println("nothing yet");
System.out.println(s.collect(Collectors.toList()));
try { s.count(); } catch (IllegalStateException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// nothing yet
// seen 1
// seen 2
// seen 3
// [1, 2, 3]
// stream has already been operated upon or closed`],
            ['toMap duplicate key.',
                r`try {
    Stream.of("a", "b", "a").collect(Collectors.toMap(s -> s, s -> 1));
} catch (IllegalStateException e) {
    System.out.println("duplicate key");
}
// merge function Integer::sum adds the values of equal keys
System.out.println(Stream.of("a", "b", "a")
    .collect(Collectors.toMap(s -> s, s -> 1, Integer::sum)));

// OUTPUT:
// duplicate key
// {a=2, b=1}`]]
    ),

    'java8-platform-enhancements': x(
        ['Besides lambdas and streams, Java 8 added the <b>java.time</b> API (<code>LocalDate</code>, <code>LocalDateTime</code>, <code>Instant</code>, <code>Duration</code>, <code>Period</code>, <code>ZonedDateTime</code>).',
            '<b>CompletableFuture</b> for async code, <b>Base64</b> (<code>java.util.Base64</code>) encoder and decoder, <b>parallel array operations</b> (<code>Arrays.parallelSort</code>), and <b>repeating annotations</b>.',
            'The <b>Nashorn</b> JavaScript engine was added (and later removed in Java 15).'],
        ['<b>Immutable types</b>: <code>java.time</code> types are immutable and thread-safe; <code>DateTimeFormatter</code> replaces <code>SimpleDateFormat</code>.',
            '<b>Base64 output</b>: <code>Base64.getEncoder().encodeToString(bytes)</code>, and <code>getUrlEncoder</code> for URL-safe output.',
            '<b>Map additions</b>: <code>Map</code> gained <code>getOrDefault</code>, <code>putIfAbsent</code>, <code>computeIfAbsent</code>, <code>merge</code> and <code>forEach</code>.'],
        ['<b>Timestamps</b>: use <code>Instant</code> for machine timestamps and store UTC; convert to <code>ZonedDateTime</code> for display.',
            '<b>Metaspace</b> replaced PermGen (class metadata in native memory).',
            '<b>Parameter names</b>: compile with <code>-parameters</code> and use type annotations to help frameworks.'],
        [['F', 'Name some Java 8 features.', 'Lambdas, streams, default methods, Optional, java.time, CompletableFuture, Base64.'],
            ['F', 'Why was java.time introduced?', 'The old Date and Calendar were mutable, confusing and not thread-safe.'],
            ['M', 'LocalDate vs LocalDateTime vs ZonedDateTime?', 'LocalDate has no time, LocalDateTime has date and time without a zone, ZonedDateTime includes a time zone.'],
            ['M', 'What replaced PermGen?', 'Metaspace in native memory, which grows dynamically.'],
            ['S', 'How should timestamps be stored?', 'As UTC (Instant or TIMESTAMP in UTC), converting to the user zone for display.'],
            ['S', 'What does Period vs Duration measure?', 'Period measures date-based amounts (years, months, days); Duration measures time-based amounts (seconds, nanos).']],
        [['java.time.',
            r`LocalDate d = LocalDate.of(2025, 1, 31);
LocalDate mar1 = LocalDate.of(2025, 3, 1);
System.out.println(d.plusMonths(1) + " " + d.getDayOfWeek()
    + " " + ChronoUnit.DAYS.between(d, mar1)
    + " " + Period.between(d, LocalDate.of(2026, 3, 2)));
ZonedDateTime utc = ZonedDateTime.of(2025, 6, 1, 12, 0, 0, 0, ZoneId.of("UTC"));
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm z");
System.out.println(utc.withZoneSameInstant(ZoneId.of("Asia/Kolkata")).format(fmt));
System.out.println(Duration.ofMinutes(135));

// OUTPUT:
// 2025-02-28 FRIDAY 29 P1Y30D
// 01 Jun 2025 17:30 IST
// PT2H15M`],
            ['Base64 and Map additions.',
                r`String enc = Base64.getEncoder().encodeToString("hello".getBytes(StandardCharsets.UTF_8));
byte[] raw = Base64.getDecoder().decode(enc);
System.out.println(enc + " " + new String(raw, StandardCharsets.UTF_8));
Map<String, List<String>> m = new HashMap<>();
m.computeIfAbsent("k", x -> new ArrayList<>()).add("v");
m.merge("n", List.of("x"), (a, b) -> a);
System.out.println(m.getOrDefault("z", List.of()) + " " + m.get("k"));

// OUTPUT:
// aGVsbG8= hello
// [] [v]`]],
        [['Old Date vs new API.',
            r`SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd");     // not thread-safe
DateTimeFormatter g = DateTimeFormatter.ISO_LOCAL_DATE;      // thread-safe, immutable
System.out.println(LocalDate.parse("2025-03-07", g).getMonth());

// OUTPUT:
// MARCH`],
            ['Parallel sort.',
                r`int[] a = new Random(1).ints(1_000_000, 0, 1000).toArray();
Arrays.parallelSort(a);
System.out.println(a[0] <= a[a.length - 1]);

// OUTPUT:
// true`]]
    )
};

export const java09Deep: Record<string, Deep> = {
    'java8-functional-interface': dv(
        [`The compiler identifies a functional interface by counting abstract methods excluding those that override <code>public</code> methods of <code>Object</code>. A lambda expression targets it: type inference gives parameter and return types from the interface method (target typing). Primitive specializations exist because generics cannot use primitives: <code>IntFunction</code>, <code>ToLongFunction</code>, <code>IntUnaryOperator</code>, <code>BooleanSupplier</code>.`,
            r`@FunctionalInterface interface Both {
    boolean equals(Object o);          // equals does not count
    void run();
    default void twice() {
        run();
        run();
    }
}
Both b = () -> System.out.print("go ");
b.twice();
System.out.println();
IntBinaryOperator gcd = new IntBinaryOperator() {
    public int applyAsInt(int a, int c) { return c == 0 ? a : applyAsInt(c, a % c); }
};
System.out.println(gcd.applyAsInt(48, 18));

// OUTPUT:
// go go
// 6`],
        [`Composition builds behavior from small functions: <code>Function.identity()</code>, <code>andThen</code>/<code>compose</code>, <code>Predicate.and/or/negate/not/isEqual</code>, <code>BinaryOperator.minBy/maxBy</code>, <code>Comparator</code> chains. Currying and partial application with nested lambdas (<code>Function&lt;Integer, Function&lt;Integer, Integer&gt;&gt;</code>), memoization with a <code>Map.computeIfAbsent</code> wrapper, and strategies stored in maps replace if-else trees.`,
            r`Function<Integer, Function<Integer, Integer>> add = a -> b -> a + b;
Function<Integer, Integer> add5 = add.apply(5);
static <T, R> Function<T, R> memo(Function<T, R> f) {
    Map<T, R> cache = new ConcurrentHashMap<>();
    return t -> cache.computeIfAbsent(t, f);
}
Function<Integer, Integer> slowSquare = n -> {
    System.out.println("computing " + n);
    return n * n;
};
Function<Integer, Integer> fast = memo(slowSquare);
Map<String, BinaryOperator<Integer>> ops = Map.of("+", Integer::sum, "*", (a, b) -> a * b);
System.out.println(add5.apply(3) + " " + fast.apply(4) + " " + fast.apply(4)
    + " " + ops.get("*").apply(6, 7));

// OUTPUT:
// computing 4
// 8 16 16 42`],
        [`Mistakes: functional interfaces with several abstract methods, throwing checked exceptions inside standard interfaces, stateful lambdas in parallel streams, boxing in hot paths with <code>Function&lt;Integer,Integer&gt;</code> (use <code>IntUnaryOperator</code>), overloaded methods taking different functional interfaces with the same shape (ambiguity: <code>submit(Runnable)</code> vs <code>submit(Callable)</code> with a lambda), and over-nested lambdas that are unreadable.`,
            r`ExecutorService ex = Executors.newSingleThreadExecutor();
Future<?> f1 = ex.submit(() -> System.out.println("runnable"));  // Runnable
Future<String> f2 = ex.submit(() -> "callable");                 // Callable
System.out.println(f2.get());
ex.shutdown();

// OUTPUT:
// runnable
// callable`],
        [`Lambdas that capture nothing are created once and reused; capturing lambdas allocate an object per evaluation. Primitive specializations avoid boxing. Passing method references versus lambdas has the same cost. Avoid creating lambdas inside tight loops when a constant would do.`,
            r`static final IntUnaryOperator SQUARE = x -> x * x;   // created once
long t = System.nanoTime();
long s = 0;
for (int i = 0; i < 100_000_000; i++) s += SQUARE.applyAsInt(i & 1023);
System.out.println(s + " ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// 51149901696 ms=70`],
        [`Real-world: strategy and callback APIs. A retry helper, a validation chain, and event handlers are all functional interfaces.`,
            r`@FunctionalInterface interface Retry<T> { T call() throws Exception; }
static <T> T withRetry(Retry<T> action, int times) throws Exception {
    Exception last = null;
    for (int i = 0; i < times; i++) {
        try { return action.call(); }
        catch (Exception e) { last = e; }
    }
    throw last;
}
AtomicInteger n = new AtomicInteger();
System.out.println(withRetry(() -> {
    if (n.incrementAndGet() < 3) throw new IOException("flaky");
    return "ok after " + n.get();
}, 5));

// OUTPUT:
// ok after 3`]
    ),

    'java8-lambda-expression': dv(
        [`<ul>
<li>The compiler moves the lambda body into a private synthetic method (<code>lambda$main$0</code>) and emits an <code>invokedynamic</code> instruction.</li>
<li>On first execution, <code>LambdaMetafactory.metafactory</code> creates a hidden class that implements the interface and returns a call site. Later executions reuse it.</li>
<li>A non-capturing lambda is one shared instance. A capturing lambda allocates an instance that holds the captured values.</li>
<li>Unlike anonymous classes, no <code>Outer$1.class</code> file exists.</li>
</ul>`,
            r`Runnable r1 = () -> {};
int base = 5;
Supplier<Integer> cap1 = () -> base, cap2 = () -> base;
boolean synth = r1.getClass().isSynthetic();
boolean named = r1.getClass().getName().contains("$$Lambda");
System.out.println(synth + " " + named + " " + (cap1 != cap2));
// javap -p -c Main shows an invokedynamic instruction
// and a private static method lambda$main$0()

// OUTPUT:
// true true true`],
        [`<ul>
<li><b>Typing:</b> a lambda has no type of its own. The target type decides (assignment, method argument, cast or return).</li>
<li><b>Overloads:</b> resolution looks at the shape of the lambda (number of parameters, void or value).</li>
<li><b>Method reference kinds:</b> <code>Class::staticMethod</code>, <code>obj::instanceMethod</code>, <code>Class::instanceMethod</code> (first parameter is the receiver), <code>Class::new</code> and <code>int[]::new</code>.</li>
<li><b>Ambiguity:</b> explicit parameter types or a cast resolve it when generics or wildcards confuse inference.</li>
<li><b><code>var</code></b> in lambda parameters (Java 11) lets you add annotations.</li>
</ul>`,
            r`Object o = (Runnable & Serializable)
    () -> System.out.println("serializable lambda");
Function<Integer, int[]> newArr = int[]::new;
// first parameter is the receiver
BiFunction<String, Integer, Character> charAt = String::charAt;
BiConsumer<List<String>, String> adder = List::add;
List<String> l = new ArrayList<>();
adder.accept(l, "x");
System.out.println(newArr.apply(3).length + " " + charAt.apply("java", 2)
    + " " + l + " " + (o instanceof Serializable));

// OUTPUT:
// 3 v [x] true`],
        [`Common mistakes:<ul>
<li>Capturing and changing a loop variable (copy it first).</li>
<li>Expecting a new instance each time a lambda is evaluated.</li>
<li>Writing large multi-line lambdas.</li>
<li>Swallowing exceptions inside a lambda.</li>
<li>Recursing through a local variable (use a field).</li>
<li>Using a lambda where state is needed (use a class).</li>
<li>Leaking memory through a captured <code>this</code> in a long-lived callback.</li>
<li>Serializing lambdas, which is fragile across recompiles.</li>
</ul>`,
            r`List<Runnable> rs = new ArrayList<>();
for (int i = 0; i < 3; i++) {
    int copy = i;   // 'i' itself is not effectively final
    rs.add(() -> System.out.print(copy + " "));
}
rs.forEach(Runnable::run);
System.out.println();

class Screen {
    final byte[] data = new byte[1 << 20];
    // captures this: keeps data alive as long as the Runnable lives
    Runnable leaky() { return () -> System.out.println(data.length); }
}

// OUTPUT:
// 0 1 2`],
        [`First use of a lambda pays bootstrap cost (class spinning, tens of microseconds), which matters in tiny CLIs and startup time; AppCDS archives lambda forms. After that, calls are inlined like normal methods. Prefer non-capturing lambdas in hot loops and avoid boxing with primitive specializations.`,
            r`// Dynamic CDS archive (also stores lambda proxy classes):
// java -XX:ArchiveClassesAtExit=app.jsa -jar app.jar
// java -XX:SharedArchiveFile=app.jsa -jar app.jar
//
// Inspect generated lambda classes (older JDKs):
// -Djdk.internal.lambda.dumpProxyClasses=./dump

// OUTPUT:
// faster startup for apps with thousands of lambdas`],
        [`Real-world: event handling, sorting, DAO callbacks, and functional pipelines. Keep lambdas tiny and delegate to well-named methods.`,
            r`button.onClick(e -> handler.save(form.read()));

orders.sort(Comparator.comparing(Order::customer)
    .thenComparing(Order::total, Comparator.reverseOrder()));

jdbc.query("SELECT id, name FROM users",
    (rs, row) -> new User(rs.getLong("id"), rs.getString("name")));

// OUTPUT:
// the intent of each line is visible without ceremony`]
    ),

    'java8-default-method': dv(
        [`Default methods are stored in the interface class file as normal, non-abstract methods. Implementing classes inherit them, and the JVM picks the method using the three rules shown earlier. A call such as <code>Iface.super.m()</code> is compiled to an <code>invokespecial</code> instruction on the interface.`,
            r`interface Animal { default String sound() { return "..."; } }
interface Dog extends Animal { default String sound() { return "woof"; } }
class Puppy implements Animal, Dog {}   // Dog is more specific: no conflict
class Robot implements Animal {
    public String sound() { return "beep"; }
}
System.out.println(new Puppy().sound() + " " + new Robot().sound());
abstract class Base { public abstract String sound(); }
class Cat extends Base implements Animal {
    public String sound() { return "meow " + Animal.super.sound(); }
}
System.out.println(new Cat().sound());

// OUTPUT:
// woof beep
// meow ...`],
        [`Common patterns for defaults:
<ul>
<li><b>Mixins:</b> behavior from several interfaces, as in the code below.</li>
<li><b>Decorators:</b> <code>Comparator.reversed()</code> and <code>Predicate.negate()</code> wrap an existing object.</li>
<li><b>Optional methods:</b> a sensible fallback that classes may override.</li>
</ul>
Keep defaults small and built on the abstract methods of the same interface.`,
            r`import java.time.Instant;

interface Auditable {
    String id();
    default String auditLine() { return "[" + Instant.EPOCH + "] " + describe(); }
    default String describe() { return getClass().getSimpleName() + "#" + id(); }
}
interface Named {
    String name();
    default String label() { return name().toUpperCase(); }
}
record Customer(String id, String name) implements Auditable, Named {}
Customer c = new Customer("c1", "abaji");
System.out.println(c.auditLine() + " " + c.label());

// OUTPUT:
// [1970-01-01T00:00:00Z] Customer#c1 ABAJI`],
        [`Common mistakes:
<ul>
<li>Defaults that rely on hidden state or call order.</li>
<li>Unresolved diamond conflicts (compile error).</li>
<li>Adding a default whose signature matches an existing class method: the class method wins silently.</li>
<li>Expecting a default to be final. Classes can always override it.</li>
<li>Using defaults instead of an abstract class that needs state.</li>
<li>Removing a default later, which breaks binary compatibility.</li>
</ul>
Document defaults like a public contract with <code>@implSpec</code>.`,
            r`interface Logger {
    default void log(String m) { System.out.println("DEFAULT " + m); }
}
class Svc implements Logger {
    // silently replaces the default
    public void log(String m) { System.out.println("SVC " + m); }
}
new Svc().log("x");

// OUTPUT:
// SVC x`],
        [`Dispatch cost of default methods equals normal interface calls; the JIT inlines monomorphic sites. Large default hierarchies complicate method resolution and class loading slightly but are rarely a measurable problem.`,
            r`// JMH: default call vs abstract class call differ by < 1 ns after inlining

// OUTPUT:
// choose based on design, not speed`],
        [`Real-world: a plugin interface gets a new optional capability without breaking existing plugins.`,
            r`public interface Plugin {
    String name();
    void start();
    // added in v2: old plugins still compile and run
    default void stop() { }
    // added in v3
    default boolean supports(String feature) { return false; }
}

// OUTPUT:
// third-party plugins written for v1 keep working`]
    ),

    'java8-static-method': dv(
        [`Interface static methods are compiled as <code>invokestatic</code> on the interface. They are never inherited by implementing classes or sub-interfaces, and they cannot be reached through an instance. They do not use virtual dispatch, so they cannot be overridden. A class method with the same name is a separate, unrelated method. Java 9 added private interface methods (static and instance) for sharing code.`,
            r`interface Money {
    long cents();
    static Money of(long c) { return () -> c; }
    static Money zero() { return of(0); }
    default Money plus(Money o) { return of(cents() + o.cents()); }
    private static void log(String m) { }
}
System.out.println(Money.of(250).plus(Money.zero()).cents());
interface Sub extends Money { }
// Sub.of(1);   // error: static method of Money is not inherited by Sub

// OUTPUT:
// 250`],
        [`Common patterns:<ul><li><b>Factory methods:</b> <code>List.of</code>, <code>Path.of</code>.</li><li><b>Builders:</b> <code>Stream.builder()</code>.</li><li><b>Combinators:</b> <code>Comparator.comparing</code>, <code>Predicate.isEqual</code>, <code>Function.identity</code>.</li><li><b>Named constructors:</b> readable names such as <code>Shape.circle(1)</code>.</li></ul>Combine with a sealed interface so it exposes the factories while the implementations stay hidden in the same package.`,
            r`sealed interface Shape permits Circle, Rect {
    double area();
    static Shape circle(double r) {
        if (r <= 0) throw new IllegalArgumentException("radius");
        return new Circle(r);
    }
    static Shape rect(double w, double h) { return new Rect(w, h); }
}
record Circle(double r) implements Shape {
    public double area() { return Math.PI * r * r; }
}
record Rect(double w, double h) implements Shape {
    public double area() { return w * h; }
}
System.out.printf("%.1f %.1f%n", Shape.circle(1).area(), Shape.rect(2, 3).area());

// OUTPUT:
// 3.1 6.0`],
        [`Common mistakes:<ul><li>Calling the method through an instance or an implementing class.</li><li>Expecting a class static method to override it.</li><li>Stuffing unrelated utilities into an interface.</li><li>Making the interface depend on concrete implementations, which hurts decoupling.</li></ul>Keep statics related to the purpose of the interface.`,
            r`interface A {
    static String id() { return "A"; }
}
class B implements A {
    static String id() { return "B"; }   // unrelated static: not an override
}
System.out.println(A.id() + " " + B.id());

// OUTPUT:
// A B`],
        [`Static interface methods need no virtual lookup, so the JIT compiler can inline them easily. Prefer them to instance factories when no state is needed. Interface fields are already <code>static final</code>, so constants can be cached there.`,
            r`interface Codes {
    Map<String, Integer> TABLE = Map.of("A", 1, "B", 2);
    static int code(String k) { return TABLE.getOrDefault(k, -1); }
}
System.out.println(Codes.code("B") + " " + Codes.code("Z"));

// OUTPUT:
// 2 -1`],
        [`Real-world: <code>Comparator</code>, <code>Stream</code> and JDBC-style <code>RowMapper</code> helpers expose static factories on interfaces so call sites read naturally.`,
            r`interface RowMapper<T> {
    T map(ResultSet rs) throws SQLException;
    static <T> RowMapper<T> of(Function<ResultSet, T> f) { return f::apply; }
    static RowMapper<Long> longColumn(String name) {
        return rs -> rs.getLong(name);
    }
}
RowMapper<Long> id = RowMapper.longColumn("id");
System.out.println("mapper created");

// OUTPUT:
// mapper created`]
    ),

    'java8-foreach-method': dv(
        [`<code>Iterable.forEach(Consumer)</code> is a default method that loops with an iterator; <code>ArrayList.forEach</code> overrides it with an indexed loop and a modCount check at the end; <code>Map.forEach(BiConsumer)</code> iterates entries; <code>Stream.forEach</code> is a terminal operation. For parallel streams the action may run on many threads and in any order.`,
            r`List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
l.forEach(x -> System.out.print(x + " "));
System.out.println();
Map<String, Integer> m = new LinkedHashMap<>();
m.put("a", 1);
m.put("b", 2);
m.forEach((k, v) -> System.out.print(k + v + " "));
System.out.println();
System.out.println(Stream.of(1, 2, 3).parallel()
    .map(x -> x * 2).collect(Collectors.toList()));

// OUTPUT:
// 1 2 3
// a1 b2
// [2, 4, 6]`],
        [`Alternatives to forEach with side effects: <code>collect</code>, <code>reduce</code>, <code>mapToInt(...).sum()</code>, <code>Collectors.groupingBy</code>, <code>toMap</code>. For index-based work use <code>IntStream.range</code>. For exceptions use a helper that wraps checked exceptions. For early exit use a loop, <code>anyMatch</code>, <code>takeWhile</code> or <code>findFirst</code>. For concurrent mutation use concurrent collections.`,
            r`List<String> names = List.of("a", "bb", "ccc");
IntStream.range(0, names.size())
    .forEach(i -> System.out.print(i + ":" + names.get(i) + " "));
System.out.println();
Map<Integer, List<String>> byLen =
    names.stream().collect(Collectors.groupingBy(String::length));
int total = names.stream().mapToInt(String::length).sum();
System.out.println(byLen + " " + total);
boolean found = names.stream().anyMatch(s -> s.startsWith("bb"));
System.out.println(found);

// OUTPUT:
// 0:a 1:bb 2:ccc
// {1=[a], 2=[bb], 3=[ccc]} 6
// true`],
        [`Mistakes: modifying the source during iteration (<code>ConcurrentModificationException</code>), forEach with shared non-thread-safe collections in parallel streams (lost updates), expecting ordering from parallel forEach, trying to break or return from the lambda (return only exits the lambda), and using forEach where a simple loop is clearer. Remember <code>return</code> in a lambda behaves like <code>continue</code>.`,
            r`List<Integer> out = new ArrayList<>();
// data race: lost elements or exceptions
IntStream.range(0, 1000).parallel().forEach(out::add);
System.out.println(out.size() == 1000 ? "lucky" : "lost elements: " + out.size());
// return acts like continue
List.of(1, 2, 3).forEach(x -> {
    if (x == 2) return;
    System.out.print(x + " ");
});
System.out.println();

// OUTPUT: (typical)
// lost elements: 987
// 1 3`],
        [`The overhead of forEach versus a for loop is negligible after JIT. For parallel work, splitting cost and synchronization dominate: only use parallel streams for large CPU-bound workloads, with associative non-interfering operations, and measure.`,
            r`long t = System.nanoTime();
long seq = LongStream.rangeClosed(1, 50_000_000)
    .filter(n -> Long.toString(n).hashCode() % 7 == 0).count();
long t1 = System.nanoTime() - t;
t = System.nanoTime();
long par = LongStream.rangeClosed(1, 50_000_000).parallel()
    .filter(n -> Long.toString(n).hashCode() % 7 == 0).count();
long t2 = System.nanoTime() - t;
System.out.println((seq == par) + " seq ms=" + t1 / 1_000_000
    + " par ms=" + t2 / 1_000_000);

// OUTPUT: (varies)
// true seq ms=1900 par ms=420`],
        [`Real-world: logging all items, sending notifications and registering handlers are legitimate forEach uses (side effects); computing results should use map/collect.`,
            r`users.stream().filter(User::isActive)
    .forEach(u -> mailer.send(u.email(), "Your report is ready"));
Map<String, Long> counts = orders.stream().collect(
    Collectors.groupingBy(Order::status, Collectors.counting()));
counts.forEach((status, n) -> log.info("{}: {}", status, n));

// OUTPUT:
// side effects in forEach, results through collectors`]
    ),

    'java8-optional-class': dv(
        [`<code>Optional</code> is a value-based final class holding a nullable reference; it is immutable and intended as a return type. <code>empty()</code> is a singleton. Operations map to a small monad: <code>map</code> (functor), <code>flatMap</code> (bind), <code>filter</code>, <code>or</code>, <code>stream</code>. Primitive versions (<code>OptionalInt</code>, <code>OptionalLong</code>, <code>OptionalDouble</code>) avoid boxing. Value-based classes should not be synchronized on or compared by identity.`,
            r`Optional<String> a = Optional.of("java");
System.out.println(a.map(String::length) + " "
    + a.filter(s -> s.startsWith("x")) + " "
    + Optional.empty().or(() -> Optional.of("fallback")) + " "
    + OptionalInt.of(5).getAsInt());
System.out.println(Optional.empty() == Optional.empty());
System.out.println(Optional.ofNullable(null).isEmpty() + " "
    + Optional.of("x").equals(Optional.of("x")));

// OUTPUT:
// Optional[4] Optional.empty Optional[fallback] 5
// true
// true true`],
        [`Idioms: return <code>Optional</code> from lookups (<code>findById</code>), chain <code>map/flatMap/filter/orElseThrow</code>, convert to streams with <code>flatMap(Optional::stream)</code>, <code>ifPresentOrElse</code>, and use <code>Objects.requireNonNullElse</code> for plain defaults. In Spring Data, repository methods return Optional. Avoid Optional chains for collection results (return empty collections) and for boolean logic.`,
            r`record Order(long id, Optional<String> coupon) {}
static Optional<Order> findOrder(long id) {
    return id == 7 ? Optional.of(new Order(7, Optional.of("SAVE10")))
                   : Optional.empty();
}
static double price(long id, double base) {
    return findOrder(id).flatMap(Order::coupon)
        .filter(c -> c.startsWith("SAVE"))
        .map(c -> base * (1 - Integer.parseInt(c.substring(4)) / 100.0))
        .orElse(base);
}
System.out.println(price(7, 200) + " " + price(8, 200));
List<String> emails = Stream.of(Optional.of("a@x.com"), Optional.<String>empty())
    .flatMap(Optional::stream).toList();
System.out.println(emails);

// OUTPUT:
// 180.0 200.0
// [a@x.com]`],
        [`Anti-patterns: <code>Optional.get()</code> without checking, <code>if (opt.isPresent()) return opt.get()</code> (use map/orElse), Optional as a field, parameter or collection element, <code>Optional.of(nullableValue)</code>, returning null from a method that returns Optional, wrapping in Optional only to unwrap immediately, and overusing it so code becomes noise. Optional does not remove the need for design clarity.`,
            r`Optional<String> o = Optional.ofNullable(System.getenv("NOT_SET"));
String bad = o.isPresent() ? o.get() : "default";   // verbose
String good = o.orElse("default");
class Person { Optional<String> nick; }             // do not: not serializable
static Optional<String> wrong() { return null; }    // never return null here
System.out.println(bad.equals(good));

// OUTPUT:
// true`],
        [`Optional allocates a wrapper (escape analysis often removes it when the chain inlines). In very hot paths prefer null checks or primitive Optionals. Use <code>orElseGet</code> for expensive defaults.`,
            r`long t = System.nanoTime();
long s = 0;
for (int i = 0; i < 20_000_000; i++) s += Optional.of(i).map(x -> x + 1).orElse(0);
System.out.println(s > 0 ? "ms=" + (System.nanoTime() - t) / 1_000_000 : "");

// OUTPUT: (varies; often optimized away)
// ms=25`],
        [`Real-world: repositories and services return Optional, controllers convert to 404, and configuration lookups provide defaults.`,
            r`@GetMapping("/orders/{id}")
ResponseEntity<OrderDto> get(@PathVariable long id) {
    return orders.findById(id)
        .map(OrderDto::from)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
}
int port = Optional.ofNullable(System.getenv("PORT"))
    .map(Integer::parseInt).orElse(8080);

// OUTPUT:
// 404 for unknown ids, 200 with a body otherwise`]
    ),

    'java8-string-joiner': dv(
        [`<code>StringJoiner</code> keeps a <code>String[]</code> of parts and joins lazily on <code>toString</code>. <code>String.join</code> used it in Java 8 (newer JDKs use an optimized internal path). It tracks the delimiter, prefix, suffix and the optional empty value; <code>length()</code> computes the final size without building a new string. It is not synchronized.`,
            r`StringJoiner sj = new StringJoiner(",", "{", "}");
sj.add("a").add("b");
System.out.println(sj + " " + sj.length());
String csv = Stream.of(1, 2, 3).map(String::valueOf).collect(Collectors.joining(","));
String marks = String.join(",", Collections.nCopies(3, "?"));
String sql = "SELECT * FROM t WHERE id IN (" + marks + ")";
System.out.println(csv + " " + sql);

// OUTPUT:
// {a,b} 5
// 1,2,3 SELECT * FROM t WHERE id IN (?,?,?)`],
        [`Choices: <code>StringBuilder</code> for loops with arbitrary appends, <code>StringJoiner</code>/<code>String.join</code> for delimited lists, <code>Collectors.joining</code> in stream pipelines (with prefix and suffix), <code>String.format</code> for templates, text blocks for multi-line SQL/JSON. For CSV with commas or quotes inside values, escape or use a CSV library; for SQL, bind parameters.`,
            r`record Row(String name, String note) {}
static String csvEscape(String s) {
    boolean quote = s.contains(",") || s.contains("\"");
    return quote ? "\"" + s.replace("\"", "\"\"") + "\"" : s;
}
List<Row> rows = List.of(new Row("Abaji", "likes, commas"),
                         new Row("Raoji", "say \"hi\""));
String csv = rows.stream()
    .map(r -> csvEscape(r.name()) + "," + csvEscape(r.note()))
    .collect(Collectors.joining("\n", "name,note\n", "\n"));
System.out.print(csv);

// OUTPUT:
// name,note
// Abaji,"likes, commas"
// Raoji,"say ""hi"""`],
        [`Mistakes: joining values that contain the delimiter without escaping, building SQL by concatenating user data (injection), assuming null is skipped (it prints "null"), using one joiner from several threads, and calling <code>toString</code> repeatedly in a loop. Filter nulls explicitly with <code>Objects::nonNull</code>.`,
            r`List<String> parts = Arrays.asList("a", null, "c");
String plain = String.join("|", parts);
String clean = parts.stream().filter(Objects::nonNull)
        .collect(Collectors.joining("|"));
System.out.println(plain + " " + clean);

// OUTPUT:
// a|null|c a|c`],
        [`Joining n strings is O(total length); avoid repeated joins in loops (use one builder). Presize <code>StringBuilder</code> when the final size is known. For huge outputs stream to a Writer instead of building a giant string.`,
            r`try (BufferedWriter w = Files.newBufferedWriter(Path.of("out.csv"))) {
    for (Row r : rows) {
        w.write(r.name() + "," + r.note());   // no giant in-memory string
        w.newLine();
    }
}

// OUTPUT:
// constant memory regardless of row count`],
        [`Real-world: building a readable log line, a comma separated list for a report, and a dynamic IN clause with the right number of placeholders.`,
            r`String placeholders = ids.stream().map(i -> "?")
        .collect(Collectors.joining(",", "(", ")"));
String query = "SELECT * FROM orders WHERE id IN " + placeholders;
PreparedStatement ps = conn.prepareStatement(query);
for (int i = 0; i < ids.size(); i++) ps.setLong(i + 1, ids.get(i));

// OUTPUT:
// safe parameterized query with a dynamic number of parameters`]
    ),

    'java8-stream-api': dv(
        [`A pipeline is a chain of stages. The terminal operation pulls elements through the stages one at a time (loop fusion), so <code>filter</code> and <code>map</code> do not create intermediate collections.<ul><li><b>Stateless stages:</b> <code>map</code>, <code>filter</code>.</li><li><b>Stateful stages:</b> <code>sorted</code>, <code>distinct</code>. They must buffer elements.</li><li><b>Short-circuit operations:</b> <code>limit</code>, <code>findFirst</code>, <code>anyMatch</code>. They can finish early.</li><li><b>Source:</b> a <code>Spliterator</code>. It also splits the data for parallel runs.</li></ul>`,
            r`Stream.of("a", "bb", "ccc", "dddd")
    .peek(s -> System.out.println("filter sees " + s))
    .filter(s -> s.length() > 1)
    .peek(s -> System.out.println("map sees " + s))
    .map(String::toUpperCase)
    .findFirst().ifPresent(System.out::println);

// OUTPUT:
// filter sees a
// filter sees bb
// map sees bb
// BB`],
        [`Useful collectors and stream features:<ul><li><b>groupingBy</b> with a downstream collector: <code>counting</code>, <code>mapping</code>, <code>summingInt</code>, <code>averagingDouble</code>, <code>maxBy</code>, <code>collectingAndThen</code>.</li><li><b>Other collectors:</b> <code>partitioningBy</code>, <code>toMap</code> (with merge function and map supplier), <code>flatMapping</code>, <code>filtering</code>, <code>summarizingInt</code>.</li><li><b>teeing</b> (Java 12) runs two collectors and combines their results.</li><li><b>Java 16:</b> <code>Stream.toList()</code> (unmodifiable) and <code>mapMulti</code>.</li><li><b>Infinite streams:</b> <code>iterate</code> and <code>generate</code>, bounded by <code>limit</code> or <code>takeWhile</code>.</li></ul>`,
            r`record Sale(String region, String product, int qty, double amount) {}
List<Sale> sales = List.of(new Sale("N", "pen", 10, 100),
    new Sale("N", "book", 2, 300), new Sale("S", "pen", 5, 50));
// statistics per region
Map<String, DoubleSummaryStatistics> stats = sales.stream()
    .collect(Collectors.groupingBy(Sale::region, TreeMap::new,
        Collectors.summarizingDouble(Sale::amount)));
// sorted product names per region
Map<String, Set<String>> productsByRegion = sales.stream()
    .collect(Collectors.groupingBy(Sale::region, TreeMap::new,
        Collectors.mapping(Sale::product, Collectors.toCollection(TreeSet::new))));
// teeing: min and max in one pass
Comparator<Sale> byAmount = Comparator.comparingDouble(Sale::amount);
var minMax = sales.stream().collect(Collectors.teeing(
    Collectors.minBy(byAmount), Collectors.maxBy(byAmount),
    (mn, mx) -> mn.get().amount() + ".." + mx.get().amount()));
System.out.println(stats.get("N").getSum() + " " + productsByRegion + " " + minMax);
System.out.println(Stream.iterate(1, n -> n * 2).limit(6).toList());
System.out.println(Stream.iterate(1, n -> n < 50, n -> n * 3).toList());

// OUTPUT:
// 400.0 {N=[book, pen], S=[pen]} 50.0..300.0
// [1, 2, 4, 8, 16, 32]
// [1, 3, 9, 27]`],
        [`Common mistakes:<ul><li>Reusing a stream, or forgetting the terminal operation (nothing runs).</li><li>Side effects and shared mutable state inside lambdas.</li><li>Using <code>peek</code> for real logic. It is for debugging.</li><li>Calling <code>sorted</code> before <code>filter</code> (wasted work).</li><li>Using <code>parallel()</code> on small or blocking pipelines.</li><li><code>toMap</code> without a merge function when keys can repeat.</li><li>Changing the source while the pipeline runs.</li><li>Calling <code>Optional.get</code> on <code>findFirst</code> without checking.</li><li>Using <code>Stream&lt;Integer&gt;</code> for number work. Use <code>IntStream</code>.</li></ul>`,
            r`// no terminal operation: nothing runs
Stream<String> s = Stream.of("a", "b").map(String::toUpperCase);
List<Integer> src = new ArrayList<>(List.of(1, 2, 3));
try {
    src.stream().forEach(x -> src.add(x));   // changes the source
} catch (ConcurrentModificationException e) {
    System.out.println("do not modify the source");
}
// filter first, so sorted() has less to sort
long cheap = Stream.of(5, 3, 8, 1).filter(x -> x > 2).sorted().count();
System.out.println(cheap);

// OUTPUT:
// do not modify the source
// 3`],
        [`Performance tips:<ul><li>Streams add a small cost per element. For tiny loops or hot numeric code, a plain loop or a primitive stream is faster.</li><li>Parallel streams help when the data is large (roughly 10,000 or more elements, times the work per element), CPU-bound, stateless and easy to split (<code>ArrayList</code>, arrays, ranges).</li><li>Avoid <code>LinkedList</code> and <code>Stream.iterate</code> sources in parallel.</li><li>To isolate the work, submit it to your own <code>ForkJoinPool</code>.</li><li>Measure with JMH, not with <code>System.nanoTime</code> alone.</li></ul>`,
            r`int[] data = IntStream.range(0, 20_000_000).toArray();
long t = System.nanoTime();
long loop = 0;
for (int v : data) if (v % 3 == 0) loop += v;
long t1 = System.nanoTime() - t;

t = System.nanoTime();
long seq = Arrays.stream(data).filter(v -> v % 3 == 0).asLongStream().sum();
long t2 = System.nanoTime() - t;

t = System.nanoTime();
long par = Arrays.stream(data).parallel()
    .filter(v -> v % 3 == 0).asLongStream().sum();
long t3 = System.nanoTime() - t;

ForkJoinPool pool = new ForkJoinPool(4);   // own pool; get() throws checked exceptions
long custom = pool.submit(() -> Arrays.stream(data).parallel()
    .filter(v -> v % 3 == 0).asLongStream().sum()).get();
System.out.println((loop == seq && seq == par && par == custom)
    + " loop=" + t1 / 1_000_000 + " seq=" + t2 / 1_000_000
    + " par=" + t3 / 1_000_000);

// OUTPUT: (varies)
// true loop=25 seq=30 par=9`],
        [`Real-world uses:<ul><li><b>Reports:</b> group, sum, sort, top N.</li><li><b>Data cleaning:</b> filter nulls, trim, remove duplicates.</li><li><b>Mapping:</b> convert between DTOs and entities.</li></ul>The sample below assumes <code>orders</code>, <code>Line</code> and <code>ProductDto</code> exist.`,
            r`// total quantity per SKU, then the five biggest
List<ProductDto> top5 = orders.stream()
    .flatMap(o -> o.lines().stream())
    .collect(Collectors.groupingBy(Line::sku, Collectors.summingInt(Line::qty)))
    .entrySet().stream()
    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
    .limit(5)
    .map(e -> new ProductDto(e.getKey(), e.getValue()))
    .toList();

// OUTPUT:
// the five best selling SKUs with quantities`]
    ),

    'java8-platform-enhancements': dv(
        [`The <code>java.time</code> model separates machine time (<code>Instant</code>, nanoseconds since epoch UTC) from human time (<code>LocalDate</code>, <code>LocalTime</code>, <code>LocalDateTime</code>, <code>ZonedDateTime</code>, <code>OffsetDateTime</code>) and amounts (<code>Duration</code>, <code>Period</code>). All are immutable; arithmetic returns new instances; the zone rules database (tzdata) handles daylight saving time. Parsing and formatting use <code>DateTimeFormatter</code> (thread-safe).`,
            r`ZoneId ny = ZoneId.of("America/New_York");
// DST starts at 02:00 that day
ZonedDateTime before = ZonedDateTime.of(2025, 3, 9, 1, 30, 0, 0, ny);
ZonedDateTime after = before.plusHours(1);
System.out.println(before.toLocalTime() + " -> " + after.toLocalTime()
    + " " + after.getOffset());
Instant i = Instant.parse("2025-06-01T12:00:00Z");
LocalDateTime inIndia = i.atZone(ZoneId.of("Asia/Kolkata")).toLocalDateTime();
System.out.println(inIndia + " " + Duration.between(i, i.plusSeconds(3725)));

// OUTPUT:
// 01:30 -> 03:30 -04:00
// 2025-06-01T17:30 PT1H2M5S`],
        [`Other additions in Java 8:<ul><li><b>Concurrency</b>: <code>CompletableFuture</code>, <code>StampedLock</code>, <code>LongAdder</code>.</li><li><b>Collections and utilities</b>: <code>Collectors</code>, <code>Map.merge</code>, <code>Objects</code> helpers, <code>String.join</code>, <code>Arrays.parallelPrefix</code> and <code>parallelSetAll</code>, <code>Files.lines</code>.</li><li><b>Encoding</b>: <code>Base64</code>, and unsigned integer methods such as <code>Integer.toUnsignedString</code>.</li><li><b>Annotations and reflection</b>: <code>@Repeatable</code>, type annotations, and <code>-parameters</code> (keeps parameter names for reflection).</li><li><b>JVM</b>: <code>Metaspace</code> replaced PermGen (cap it with <code>-XX:MaxMetaspaceSize</code>), and <code>HashMap</code> handles collisions better.</li></ul>`,
            r`int[] a = {1, 2, 3, 4};
Arrays.parallelPrefix(a, Integer::sum);
LongAdder hits = new LongAdder();
IntStream.range(0, 100).parallel().forEach(n -> hits.increment());
System.out.println(Arrays.toString(a) + " " + hits.sum() + " "
    + Integer.toUnsignedString(-1) + " " + Integer.divideUnsigned(-1, 2));
LocalDateTime dt = LocalDateTime.of(2025, 3, 7, 14, 5);
DateTimeFormatter pat =
    DateTimeFormatter.ofPattern("EEEE, d MMMM uuuu h:mm a", Locale.ENGLISH);
System.out.println(dt.format(pat));

// OUTPUT:
// [1, 3, 6, 10] 100 4294967295 2147483647
// Friday, 7 March 2025 2:05 PM`],
        [`Common mistakes:<ul><li>Storing local date-times without a zone for events that happen at an instant (use <code>Instant</code>/UTC).</li><li>Formatting with <code>YYYY</code> instead of <code>yyyy</code> (week-based year bug).</li><li>Parsing without the right pattern.</li><li>Using <code>ZonedDateTime.equals</code> (zone sensitive) instead of <code>isEqual</code>.</li><li>Using <code>Date</code>/<code>Calendar</code> in new code.</li><li>Treating <code>Period</code> and <code>Duration</code> as interchangeable.</li><li>Forgetting DST: adding days is not the same as adding 24 hours.</li></ul>`,
            r`LocalDate d = LocalDate.of(2024, 12, 30);
// YYYY is the week-based year: prints 2025!
System.out.println(d.format(DateTimeFormatter.ofPattern("YYYY-MM-dd")));
System.out.println(d.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
ZoneId ny = ZoneId.of("America/New_York");
ZonedDateTime z = ZonedDateTime.of(2025, 3, 8, 12, 0, 0, 0, ny);
System.out.println(z.plusDays(1).toLocalTime() + " "
    + z.plus(Duration.ofHours(24)).toLocalTime());

// OUTPUT:
// 2025-12-30
// 2024-12-30
// 12:00 13:00`],
        [`Performance and tuning:<ul><li><b>Metaspace</b> removed the fixed PermGen limit. Class metadata uses native memory, so cap it with <code>-XX:MaxMetaspaceSize</code>.</li><li><b>HashMap treeification</b> (long collision chains become trees) and parallel streams also changed performance.</li><li><b>java.time objects</b> are cheap but numerous: reuse formatters and avoid parsing the same text repeatedly.</li></ul>`,
            r`private static final DateTimeFormatter F =
    DateTimeFormatter.ofPattern("dd/MM/yyyy");   // reuse; thread-safe
static LocalDate parse(String s) { return LocalDate.parse(s, F); }

// OUTPUT:
// no per-call formatter allocation or pattern parsing`],
        [`Real-world habits:<ul><li>Store timestamps in UTC (<code>Instant</code> / <code>TIMESTAMP WITH TIME ZONE</code>) and show them in the user zone.</li><li>Compute business days with <code>TemporalAdjusters</code>.</li><li>Measure elapsed time with <code>Duration</code> and <code>System.nanoTime</code>.</li></ul>`,
            r`Instant created = Instant.now();
ZonedDateTime shown = created.atZone(ZoneId.of("Asia/Kolkata"));
LocalDate nextMonday = LocalDate.of(2025, 3, 7)
    .with(TemporalAdjusters.next(DayOfWeek.MONDAY));
Instant deadline = created.plus(48, ChronoUnit.HOURS);
long sla = Duration.between(created, deadline).toHours();
System.out.println(nextMonday + " " + sla);

// OUTPUT:
// 2025-03-10 48`]
    )
};
