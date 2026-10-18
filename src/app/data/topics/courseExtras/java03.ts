// Core Java extras, part 3 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java03Extras: Record<string, Extra> = {
    'Serialization in Java': x(
        ['<b>Serialization</b> turns an object into a byte stream. <b>Deserialization</b> rebuilds it. The class must implement <code>java.io.Serializable</code>, a marker interface (it has no methods).',
            'Use <code>ObjectOutputStream.writeObject</code> to write and <code>ObjectInputStream.readObject</code> to read.',
            '<b>transient</b> and <b>static</b> fields are not serialized.'],
        ['<b>serialVersionUID</b> identifies the class version. Declare it yourself to avoid <code>InvalidClassException</code> after class changes.',
            '<b>Object graphs</b>: every field must be serializable (or transient), else <code>NotSerializableException</code>.',
            '<b>Constructors</b> of the serializable class do not run on deserialization. The first non-serializable parent needs a no-arg constructor.'],
        ['<b>Security</b>: native serialization allows deserialization attacks. Never read untrusted data. Use <code>ObjectInputFilter</code> or avoid it.',
            '<b>Alternatives</b>: JSON, Protobuf or Avro are language neutral, versionable and safer for data exchange.',
            '<b>Customizing</b>: use <code>writeObject</code> / <code>readObject</code>, <code>writeReplace</code>, <code>readResolve</code> (keeps singletons) or <code>Externalizable</code>.'],
        [['F', 'What is serialization?', 'Converting an object into a byte stream so it can be stored or transferred.'],
            ['F', 'What does transient do?', 'Excludes a field from serialization.'],
            ['M', 'What is serialVersionUID?', 'A version number used to check that the sender and receiver classes are compatible.'],
            ['M', 'Are constructors called during deserialization?', 'Not for the serializable class itself; the first non-serializable superclass no-arg constructor runs.'],
            ['S', 'Why is Java deserialization dangerous?', 'Crafted byte streams can trigger gadget chains that run code during readObject; never deserialize untrusted input.'],
            ['S', 'What do you use instead for APIs?', 'JSON (Jackson), Protobuf or Avro, with explicit schemas.']],
        [['Save and load an object.',
            r`class User implements Serializable {
    private static final long serialVersionUID = 1L;
    String name;
    transient String password;   // not saved
    User(String n, String p) {
        name = n;
        password = p;
    }
}

// Write
try (var out = new ObjectOutputStream(new FileOutputStream("u.ser"))) {
    out.writeObject(new User("Abaji", "secret"));
}
// Read
try (var in = new ObjectInputStream(new FileInputStream("u.ser"))) {
    User u = (User) in.readObject();
    System.out.println(u.name + " " + u.password);
}

// OUTPUT:
// Abaji null`],
            ['Not serializable field.',
                r`class Holder implements Serializable {
    Object lock = new Object();   // Object is not Serializable
}

try (var out = new ObjectOutputStream(new ByteArrayOutputStream())) {
    out.writeObject(new Holder());
} catch (NotSerializableException e) {
    System.out.println("NotSerializable: " + e.getMessage());
}

// OUTPUT:
// NotSerializable: java.lang.Object`]],
        [['Deserialization filter. Allow only your own package and reject the rest.',
            r`ObjectInputFilter f =
    ObjectInputFilter.Config.createFilter("com.acme.*;!*");
try (var in = new ObjectInputStream(new FileInputStream("u.ser"))) {
    in.setObjectInputFilter(f);   // set before readObject
    Object o = in.readObject();   // other classes are rejected
}

// OUTPUT:
// classes outside com.acme throw InvalidClassException (REJECTED)`],
            ['JSON instead.',
                r`ObjectMapper om = new ObjectMapper();
String json = om.writeValueAsString(Map.of("name", "Abaji"));
Object name = om.readValue(json, Map.class).get("name");
System.out.println(json + " " + name);

// OUTPUT:
// {"name":"Abaji"} Abaji`]]
    ),

'properties-file': x(
        ['<b>Format</b>: a <code>.properties</code> file stores configuration as <code>key=value</code> lines, loaded with <code>java.util.Properties</code>.',
            '<b>Reading</b>: use <code>props.load(inputStream)</code> and <code>getProperty("key", "default")</code>.',
            '<b>Comments</b>: lines starting with <code>#</code> or <code>!</code> are ignored.'],
        ['<b>Class path</b>: load with <code>getResourceAsStream("/app.properties")</code> so it works inside a jar.',
            '<b>String values</b>: values are always Strings, so parse numbers and booleans yourself.',
            '<b>Saving and encoding</b>: save with <code>store(out, comments)</code>. <code>load(InputStream)</code> reads ISO-8859-1, so for non-ASCII text pass a UTF-8 <code>InputStreamReader</code> to <code>load(Reader)</code>.'],
        ['<b>Externalize</b> environment-specific settings (URLs, secrets) from code. Spring Boot supports <code>application.properties</code> and profiles.',
            '<b>Secrets</b>: never commit them; read them from environment variables or a vault.',
            '<b>Hierarchy</b>: for nested config prefer YAML or typed config classes (<code>@ConfigurationProperties</code>).'],
        [['F', 'What is a properties file?', 'A text file of key=value pairs used for configuration.'],
            ['F', 'Which class reads it?', 'java.util.Properties.'],
            ['M', 'How do you load a properties file from the class path?', 'Class.getResourceAsStream("/file.properties") then Properties.load.'],
            ['M', 'Why provide a default in getProperty?', 'To avoid null when a key is missing.'],
            ['S', 'How do you manage config per environment?', 'Separate files or profiles (dev, prod) and environment variables, with secrets kept out of the repository.'],
            ['S', 'Why not store passwords in properties files?', 'They end up in source control and artifacts; use environment variables or a secret manager.']],
        [['Load from the class path.',
            r`// src/main/resources/app.properties:
//   db.url=jdbc:mysql://localhost/app
//   pool.size=10
Properties p = new Properties();
try (InputStream in = Main.class.getResourceAsStream("/app.properties")) {
    p.load(in);
}
int size = Integer.parseInt(p.getProperty("pool.size", "5"));
System.out.println(p.getProperty("db.url") + " " + size);

// OUTPUT:
// jdbc:mysql://localhost/app 10`],
            ['Write properties.',
                r`Properties p = new Properties();
p.setProperty("theme", "dark");
try (Writer w = Files.newBufferedWriter(Path.of("user.properties"))) {
    p.store(w, "User settings");
}

// OUTPUT:
// user.properties contains: theme=dark`]],
        [['Environment override.',
            r`String url = Optional.ofNullable(System.getenv("DB_URL"))
    .orElse(p.getProperty("db.url"));
System.out.println(url);

// OUTPUT:
// the environment variable wins when set`],
            ['System properties.',
                r`System.out.println(System.getProperty("user.dir") != null);
// java -Dmode=test -jar app.jar  ->  System.getProperty("mode")

// OUTPUT:
// true`]]
    ),

    'final-keyword': x(
        ['<b>Three uses</b>: a <code>final</code> variable is assigned once, a <code>final</code> method cannot be overridden, a <code>final</code> class cannot be extended (like <code>String</code>).',
            '<b>Constants</b> are written <code>static final int MAX = 10;</code>.',
            '<b>Final reference</b>: it cannot point to another object, but the object itself can change.'],
        ['<b>Blank final fields</b> must be set in the declaration, an initializer block or every constructor.',
            '<b>Final parameters and locals</b> cannot be reassigned; lambdas can capture <b>effectively final</b> variables.',
            '<b>Do not confuse</b> <code>final</code> with <code>finally</code> (try block) and <code>finalize()</code> (deprecated).'],
        ['<b>Immutable classes</b> use a final class, <code>private final</code> fields and no setters; the Java Memory Model (JMM) guarantees <b>safe publication</b> of final fields.',
            '<b>Compile-time constants</b> (<code>static final</code> primitives and strings) are inlined into callers.',
            '<b>Design rule</b>: declare classes final unless designed for extension (Effective Java).'],
        [['F', 'What does final mean on a variable?', 'It can be assigned only once.'],
            ['F', 'Can a final class be extended?', 'No.'],
            ['M', 'Does a final reference make the object immutable?', 'No, only the reference is fixed; the object state can still change.'],
            ['M', 'Final vs finally vs finalize?', 'final is a modifier, finally is a try block clause that always runs, finalize is a deprecated GC hook.'],
            ['S', 'Why is final useful for thread safety?', 'Final fields are safely published after construction, so other threads see their correct values.'],
            ['S', 'What is an effectively final variable?', 'A local variable never reassigned after initialization, which lambdas and inner classes may capture.']],
        [['Final reference vs immutable object.',
            r`final List<String> list = new ArrayList<>();
list.add("ok");                       // allowed
// list = new ArrayList<>();          // error: final variable
final int[] a = {1, 2};
a[0] = 9;
System.out.println(list + " " + Arrays.toString(a));

// OUTPUT:
// [ok] [9, 2]`],
            ['Blank final set in constructor.',
                r`class Invoice {
    private final long id;
    private final double amount;
    Invoice(long id, double amount) {
        this.id = id;
        this.amount = amount;
    }
    long id() { return id; }
}
System.out.println(new Invoice(7, 99.5).id());

// OUTPUT:
// 7`]],
        [['Effectively final in lambdas.',
            r`int base = 10;
Function<Integer, Integer> add = n -> n + base;
// base++;   // error: variable used in a lambda must be (effectively) final
System.out.println(add.apply(5));

// OUTPUT:
// 15`],
            ['Final method.',
                r`class A {
    final void lock() { System.out.println("locked"); }
}
class B extends A { /* void lock() {} -> error: final method */ }
new B().lock();

// OUTPUT:
// locked`]]
    ),

    'wrapper-class': x(
        ['<b>Wrapper classes</b> wrap primitives as objects: <code>Integer, Long, Double, Boolean, Character, Byte, Short, Float</code>.',
            '<b>Autoboxing</b> converts a primitive to its wrapper automatically, <b>unboxing</b> does the reverse: <code>Integer x = 5; int y = x;</code>.',
            '<b>Collections need objects</b>: <code>List&lt;Integer&gt;</code>, not <code>List&lt;int&gt;</code>.'],
        ['<b>Useful methods</b>: <code>Integer.parseInt</code>, <code>valueOf</code>, <code>toString</code>, <code>compare</code>, <code>MAX_VALUE</code>, <code>Character.isDigit</code>.',
            '<b>Compare with equals</b>, not <code>==</code> (the Integer cache covers -128 to 127).',
            '<b>Null unboxing</b>: unboxing a null wrapper throws <code>NullPointerException</code>.'],
        ['<b>Boxing in loops</b> creates garbage and slows hot code; use primitives or primitive streams.',
            '<b>Immutable</b> wrappers can be map keys; <code>Integer.valueOf</code> may reuse cached objects, <code>new Integer</code> is deprecated.',
            '<b>Overloads</b>: be careful with <code>list.remove(int)</code> vs <code>remove(Object)</code>.'],
        [['F', 'What is a wrapper class?', 'An object type that wraps a primitive, e.g. Integer for int.'],
            ['F', 'What is autoboxing?', 'Automatic conversion of a primitive to its wrapper.'],
            ['M', 'Why can Integer == give surprising results?', 'Values from -128 to 127 are cached, so == is true there but false for larger values.'],
            ['M', 'What happens if you unbox null?', 'NullPointerException.'],
            ['S', 'Why avoid boxing in loops?', 'It allocates objects and adds overhead; primitives are faster and use less memory.'],
            ['S', 'What does list.remove(1) do on a List of Integer?', 'It removes the element at index 1; use remove(Integer.valueOf(1)) to remove the value 1.']],
        [['Boxing, parsing and caching.',
            r`Integer a = 100, b = 100, c = 1000, d = 1000;
System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
System.out.println(Integer.parseInt("42") + Integer.valueOf("8")
    + " " + Integer.toBinaryString(10) + " " + Integer.compare(3, 7));
System.out.println(Character.isDigit('7') + " " + Double.parseDouble("2.5")
    + " " + Boolean.parseBoolean("TRUE"));

// OUTPUT:
// true false true
// 50 1010 -1
// true 2.5 true`],
            ['Null unboxing.',
                r`Map<String, Integer> m = new HashMap<>();
try { int v = m.get("missing"); } catch (NullPointerException e) { System.out.println("NPE"); }
int safe = m.getOrDefault("missing", 0);
System.out.println(safe);

// OUTPUT:
// NPE
// 0`]],
        [['Remove overload trap.',
            r`List<Integer> l = new ArrayList<>(List.of(5, 6, 7));
l.remove(1);                       // index
l.remove(Integer.valueOf(7));      // value
System.out.println(l);

// OUTPUT:
// [5]`],
            ['Parsing errors.',
                r`try {
    Integer.parseInt("12a");
} catch (NumberFormatException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// For input string: "12a"`]]
    ),

    'methods-in-java': x(
        ['<b>Syntax</b>: <code>returnType name(parameters) { ... }</code>. Call it by name with arguments.',
            '<b>Return</b>: <code>void</code> methods return nothing; others must <code>return</code> a value of the declared type.',
            '<b>Kinds</b>: instance methods need an object; <code>static</code> methods are called on the class.'],
        ['<b>Overloading</b>: same name, different parameter lists (type, number or order); the return type alone is not enough.',
            '<b>Pass by value</b>: a primitive copies its value; an object variable copies its reference, so the object can change but the caller variable is never repointed.',
            '<b>Varargs</b>: <code>int... nums</code> accepts any number of arguments.'],
        ['<b>Design</b>: keep methods small with one purpose; name them with verbs; limit parameters (3 or fewer, otherwise pass an object).',
            '<b>Validation</b>: check inputs early (<code>Objects.requireNonNull</code>, <code>IllegalArgumentException</code>).',
            '<b>Ambiguity</b>: when two overloads fit equally well, the call fails to compile.'],
        [['F', 'What is a method?', 'A reusable named block of code that can take parameters and return a value.'],
            ['F', 'What is method overloading?', 'Several methods with the same name but different parameters in one class.'],
            ['M', 'Is Java pass by value or by reference?', 'Always pass by value; for objects the value is the reference.'],
            ['M', 'Can overloading depend on return type only?', 'No, the parameter list must differ.'],
            ['S', 'How does the compiler choose between overloads?', 'Exact match first, then widening, then boxing, then varargs; if ambiguous it is an error.'],
            ['S', 'Why keep methods short?', 'Easier to read, test, reuse and name; reduces bugs.']],
        [['Overloading and varargs.',
            r`static int sum(int a, int b) { return a + b; }
static double sum(double a, double b) { return a + b; }
static int sum(int... n) { return Arrays.stream(n).sum(); }
System.out.println(sum(1, 2) + " " + sum(1.5, 2) + " " + sum(1, 2, 3, 4));

// OUTPUT:
// 3 3.5 10`],
            ['Pass by value.',
                r`static void change(int n, int[] arr, StringBuilder sb) {
    n = 99;                        // local copy only
    arr[0] = 99;                   // mutates the shared array
    sb.append("!");                // mutates the shared object
    arr = new int[]{0};            // repoints the local copy only
    sb = new StringBuilder("new"); // repoints the local copy only
}
int n = 1;
int[] a = {1};
StringBuilder sb = new StringBuilder("hi");
change(n, a, sb);
System.out.println(n + " " + a[0] + " " + sb);

// OUTPUT:
// 1 99 hi!`]],
        [['Ambiguity.',
            r`static void f(Integer a, int b) {}
static void f(int a, Integer b) {}
// f(1, 2);   // error: reference to f is ambiguous

// OUTPUT:
// compile-time error`],
            ['Early validation.',
                r`static double divide(int a, int b) {
    if (b == 0) throw new IllegalArgumentException("b must not be zero");
    return (double) a / b;
}
System.out.println(divide(7, 2));

// OUTPUT:
// 3.5`]]
    ),

    'return-object': x(
        ['<b>Return type:</b> a method can return an object: <code>static Student create() { return new Student(); }</code>. The return type is the class.',
            '<b>Reference:</b> the caller gets a reference to the same object that was created or stored.',
            '<b>Chaining:</b> return <code>this</code> to enable method chaining.'],
        ['<b>Encapsulation:</b> returning internal mutable fields exposes your state; return a copy or an unmodifiable view.',
            '<b>No null:</b> return an empty collection instead of <code>null</code>; use <code>Optional</code> for a possibly missing single value.',
            '<b>Factory methods</b> return objects of a class or its subtypes (an interface return type).'],
        ['<b>Interface types:</b> return <code>List</code>, not <code>ArrayList</code>, to keep flexibility.',
            '<b>Multiple values:</b> records and small immutable objects are ideal for returning several values.',
            '<b>Covariant return types</b> let an override return a subtype.'],
        [['F', 'How do you return an object?', 'Declare the class as return type and return a reference to an instance.'],
            ['F', 'What does return this do?', 'It returns the current object, allowing method chaining.'],
            ['M', 'Why not return null for collections?', 'Callers must check for null; an empty collection is safe to iterate.'],
            ['M', 'When use Optional?', 'For a return value that may be absent, to make the absence explicit.'],
            ['S', 'How do you return multiple values?', 'Return a record or small class (or a List/Map), rather than parallel arrays.'],
            ['S', 'What is a covariant return type?', 'An overriding method may return a subtype of the parent method return type.']],
        [['Fluent builder.',
            r`class Query {
    private final StringBuilder sb = new StringBuilder();

    Query select(String c) {
        sb.append("SELECT ").append(c);
        return this;
    }
    Query from(String t) {
        sb.append(" FROM ").append(t);
        return this;
    }
    String build() { return sb.toString(); }
}
System.out.println(new Query().select("*").from("users").build());

// OUTPUT:
// SELECT * FROM users`],
            ['Return a record.',
                r`record MinMax(int min, int max) {}
static MinMax range(int[] a) {
    int min = Arrays.stream(a).min().getAsInt();
    int max = Arrays.stream(a).max().getAsInt();
    return new MinMax(min, max);
}
System.out.println(range(new int[]{4, 1, 9}));

// OUTPUT:
// MinMax[min=1, max=9]`]],
        [['Optional return.',
            r`static Optional<String> find(Map<Integer, String> m, int id) {
    return Optional.ofNullable(m.get(id));
}
System.out.println(find(Map.of(1, "Abaji"), 2).orElse("not found"));

// OUTPUT:
// not found`],
            ['Leaking internal state.',
                r`class Bag {
    private final List<String> items = new ArrayList<>();

    List<String> items() { return items; }               // leaks the live list
    List<String> safe() { return List.copyOf(items); }   // read-only copy
}
Bag b = new Bag();
b.items().add("x");   // caller changed Bag's internal list
System.out.println(b.safe());

// OUTPUT:
// [x]`]]
    ),

    'Different way to return to the method in java.': x(
        ['<b>Ways to end</b>: a method ends by <code>return</code> (with or without a value), by throwing an exception, or by reaching the end of a <code>void</code> method.',
            '<b>Early exit</b>: <code>return;</code> leaves a <code>void</code> method early.',
            '<b>Non-void rule</b>: a method with a return type must return a value on every path.'],
        ['<b>Stop early</b>: return from loops, <code>switch</code> cases and nested conditions.',
            '<b>Return types</b>: primitives, objects, arrays, collections, lambdas or <code>null</code>.',
            '<b>Unreachable code</b>: a statement after <code>return</code> does not compile.'],
        ['<b>Guard clauses</b>: several return points are fine when they avoid deep nesting.',
            '<b>try/finally</b>: the <code>finally</code> block runs before the method really returns; a <code>return</code> inside it overrides the earlier result.',
            '<b>Lambdas</b>: return the value of their expression, or use <code>return</code> in a block body.'],
        [['F', 'How can a method return control?', 'By return, by throwing an exception, or by finishing the method body.'],
            ['F', 'Can a void method use return?', 'Yes, as return; to exit early.'],
            ['M', 'What happens to code after return?', 'It is unreachable and causes a compile error.'],
            ['M', 'Must every path of a non-void method return?', 'Yes, otherwise the compiler reports a missing return statement.'],
            ['S', 'What happens with return in finally?', 'It overrides any value or exception from try or catch, which is usually a bug.'],
            ['S', 'What does a lambda return?', 'The value of its expression body, or the value of return in a block body.']],
        [['Guard clauses.',
            r`static String classify(int age) {
    if (age < 0) return "invalid";
    if (age < 13) return "child";
    if (age < 20) return "teen";
    return "adult";
}
System.out.println(classify(15) + " " + classify(-1));

// OUTPUT:
// teen invalid`],
            ['Return from a lambda and from a loop.',
                r`Function<Integer, String> f = n -> {
    if (n % 2 == 0) return "even";
    return "odd";
};
static int firstEven(int[] a) {
    for (int v : a) {
        if (v % 2 == 0) return v;
    }
    return -1;
}
System.out.println(f.apply(3) + " " + firstEven(new int[]{1, 4, 6}));

// OUTPUT:
// odd 4`]],
        [['finally overrides.',
            r`static int f() {
    try {
        return 1;
    } finally {
        return 2;   // overrides the 1
    }
}
System.out.println(f());

// OUTPUT:
// 2`],
            ['Missing return.',
                r`// static int g(boolean b) { if (b) return 1; }   // error: missing return statement

// OUTPUT:
// compile-time error`]]
    ),

    'this-super': x(
        ['<b>Meaning:</b> <code>this</code> refers to the current object; <code>super</code> refers to the parent class part of the object.',
            '<b>Name clash:</b> use <code>this.name = name</code> to separate a field from a parameter with the same name.',
            '<b>Parent access:</b> use <code>super.method()</code> to call the parent version and <code>super(args)</code> to call the parent constructor.'],
        ['<b>Constructor calls:</b> <code>this(...)</code> calls another constructor of the same class; <code>super(...)</code> calls the parent constructor; both must be the first statement.',
            '<b>Static context:</b> neither <code>this</code> nor <code>super</code> can be used there.',
            '<b>Passing and chaining:</b> <code>this</code> can be passed as an argument or returned (<code>return this</code>) for chaining.'],
        ['<b>Field hiding:</b> <code>super.field</code> reaches a hidden parent field; avoid hiding fields in real designs.',
            '<b>Interfaces:</b> <code>Interface.super.method()</code> picks one default method to resolve a diamond conflict.',
            '<b>Leaking this:</b> registering <code>this</code> (for example as a listener) from a constructor can expose a half-built object.'],
        [['F', 'What does this refer to?', 'The current object.'],
            ['F', 'What does super refer to?', 'The parent class members of the current object.'],
            ['M', 'Can you use this in a static method?', 'No, static methods have no current object.'],
            ['M', 'How do you call the overridden parent method?', 'super.methodName().'],
            ['S', 'How do you resolve conflicting default methods?', 'Override the method and call the chosen one with InterfaceName.super.method().'],
            ['S', 'Why is leaking this from a constructor risky?', 'Other code may use the object before it is fully initialized.']],
        [['this and super in practice.',
            r`class Animal {
    String name = "animal";
    void speak() { System.out.println("..."); }
}

class Dog extends Animal {
    String name = "dog";

    @Override
    void speak() {
        super.speak();
        System.out.println(this.name + " / " + super.name + " barks");
    }
}

// in main:
new Dog().speak();

// OUTPUT:
// ...
// dog / animal barks`],
            ['Resolving default methods.',
                r`interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }

class C implements A, B {
    public String hi() {
        return A.super.hi() + B.super.hi();   // pick both explicitly
    }
}

// in main:
System.out.println(new C().hi());

// OUTPUT:
// AB`]],
        [['Field shadowing.',
            r`class P { int x = 1; }
class Q extends P { int x = 2; }

// in main:
P ref = new Q();
System.out.println(ref.x + " " + ((Q) ref).x);

// OUTPUT:
// 1 2`],
            ['Chaining with this.',
                r`class Pt {
    int x, y;

    Pt x(int v) {
        this.x = v;
        return this;
    }
    Pt y(int v) {
        this.y = v;
        return this;
    }
}

// in main:
Pt p = new Pt().x(3).y(4);
System.out.println(p.x + "," + p.y);

// OUTPUT:
// 3,4`]]
    ),

    'classes-objects': x(
        ['<b>Class</b>: a blueprint with fields (state) and methods (behavior). <b>Object</b>: an instance created with <code>new</code>.',
            '<b>Instance fields</b>: each object has its own copy.',
            '<b>References</b>: objects are accessed through references; <code>null</code> means no object.'],
        ['<b>Stack and heap</b>: a local reference lives on the stack and the object on the heap; several references can point to one object.',
            '<b>Reference copy</b>: <code>b = a</code> copies the reference, not the object.',
            '<b>Garbage collection</b>: an object becomes eligible when no references reach it.'],
        ['<b>Class design</b>: single responsibility, small public API and valid state from construction.',
            '<b>Value classes</b>: override <code>toString</code>, <code>equals</code> and <code>hashCode</code> (or use <code>record</code>).',
            '<b>Composition</b> over inheritance; keep objects <b>immutable</b> when possible.'],
        [['F', 'Difference between class and object?', 'A class is a template; an object is an instance of it.'],
            ['F', 'How do you create an object?', 'With the new keyword and a constructor call.'],
            ['M', 'What happens on Student b = a;?', 'Both references point to the same object; no copy is made.'],
            ['M', 'Where are objects stored?', 'On the heap; references to them live on the stack or inside other objects.'],
            ['S', 'When is an object garbage collected?', 'When it is no longer reachable from any GC root.'],
            ['S', 'Why prefer composition over inheritance?', 'It gives flexibility and avoids tight coupling and fragile base classes.']],
        [['Class with state and behavior.',
            r`class BankAccount {
    private double balance;
    void deposit(double amt) {
        if (amt <= 0) throw new IllegalArgumentException();
        balance += amt;
    }
    boolean withdraw(double amt) {
        if (amt > balance) return false;
        balance -= amt;
        return true;
    }
    double balance() { return balance; }
}
BankAccount a = new BankAccount();
a.deposit(500);
a.withdraw(120);
BankAccount b = a;
b.deposit(100);
System.out.println(a.balance());

// OUTPUT:
// 480.0`],
            ['Equality of objects.',
                r`class P {
    final int x;
    P(int x) { this.x = x; }
}
System.out.println(new P(1).equals(new P(1)));
record R(int x) {}
System.out.println(new R(1).equals(new R(1)));

// OUTPUT:
// false
// true`]],
        [['Reference vs object.',
            r`StringBuilder a = new StringBuilder("x");
StringBuilder b = a;
b.append("y");
StringBuilder c = new StringBuilder("x");
System.out.println(a + " " + (a == b) + " " + (a == c));

// OUTPUT:
// xy true false`],
            ['Garbage eligibility.',
                r`Object o = new Object();
WeakReference<Object> w = new WeakReference<>(o);
o = null;
System.gc();
System.out.println(w.get() == null);

// OUTPUT: (typical)
// true`]]
    )
};

export const java03Deep: Record<string, Deep> = {
    'Serialization in Java': dv(
        [`<code>ObjectOutputStream</code> writes a stream header, class descriptors (name, serialVersionUID, field metadata) and field values. It tracks objects it has already written, so cycles work. Deserialization allocates the object without calling its constructor (it runs the first non-serializable parent constructor), then fills the fields. Static and transient fields are skipped.`,
            r`class Node implements Serializable {
    String name;
    Node next;
    Node(String n) { name = n; }
}

Node a = new Node("a"), b = new Node("b");
a.next = b;
b.next = a;                          // cycle
ByteArrayOutputStream bos = new ByteArrayOutputStream();
try (var out = new ObjectOutputStream(bos)) { out.writeObject(a); }
var in = new ObjectInputStream(new ByteArrayInputStream(bos.toByteArray()));
Node copy = (Node) in.readObject();
System.out.println(copy.next.next == copy);

// OUTPUT:
// true`],
        [`<code>readResolve</code> replaces the object just read, so a singleton stays a singleton. The other hooks are <code>writeObject</code> / <code>readObject</code> (encrypt or validate), <code>writeReplace</code> (serialization proxy, safe for immutable classes) and <code>Externalizable</code> (full control).`,
            r`final class Singleton implements Serializable {
    static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
    private Object readResolve() { return INSTANCE; }   // keep one instance
}

Singleton s = Singleton.INSTANCE;
var bos = new ByteArrayOutputStream();
new ObjectOutputStream(bos).writeObject(s);
var in = new ObjectInputStream(new ByteArrayInputStream(bos.toByteArray()));
Object back = in.readObject();
System.out.println(back == s);

// OUTPUT:
// true`],
        [`Common mistakes: no serialVersionUID (the auto value changes when the class changes), serializing inner classes (they capture the outer object), non-serializable fields, and secrets not marked transient. Records use their canonical constructor; enums are always safe singletons. The fix for the first mistake is below.`,
            r`// Mistake: no serialVersionUID. After adding a field, old bytes fail:
// InvalidClassException: V1; local class incompatible

// Fix: declare it and change it only on purpose
class V1 implements Serializable {
    private static final long serialVersionUID = 1L;
    int a;
}

// OUTPUT:
// old data still loads after you add a field (new field gets its default)`],
        [`Native serialization is slow and verbose compared to Protobuf, Kryo or JSON. For caches and RPC use schema-based formats. For large graphs, avoid serializing whole entity graphs (for example lazy relations).`,
            r`// Protobuf: compact binary, forward compatible
//   Order.newBuilder().setId(7).setTotal(99.5).build().toByteArray()
// Jackson: human readable JSON
//   om.writeValueAsBytes(order)

// OUTPUT:
// usually smaller and faster than Java serialization (measure for your data)`],
        [`HTTP sessions and distributed caches serialize objects, so session classes must be Serializable. In production, set a global deserialization filter.`,
            r`// Option 1: JVM flag
// java -Djdk.serialFilter="maxdepth=10;maxbytes=100000;com.acme.**;!*" -jar app.jar

// Option 2: in code (can be set only once per JVM)
ObjectInputFilter.Config.setSerialFilter(
    ObjectInputFilter.Config.createFilter("com.acme.**;java.base/*;!*"));

// OUTPUT:
// unknown classes are rejected with InvalidClassException: filter status: REJECTED`]
    ),

'properties-file': dv(
        [`<code>Properties</code> extends <code>Hashtable&lt;Object,Object&gt;</code> and parses lines with key separators <code>=</code>, <code>:</code> or whitespace, supports line continuation with a trailing backslash and Unicode escapes <code>\\uXXXX</code>. <code>getProperty</code> checks the defaults chain; <code>stringPropertyNames</code> returns keys of String type. Since Java 9, <code>ResourceBundle</code> reads its properties files as UTF-8, but <code>Properties.load(InputStream)</code> still uses ISO-8859-1.`,
            r`Properties p = new Properties();
p.load(new StringReader(
    "a=1\nb : two\nlong=line1 \\\n    line2\n# comment"));
System.out.println(p.getProperty("a") + " " + p.getProperty("b")
    + " " + p.getProperty("long") + " " + p.size());

// OUTPUT:
// 1 two line1 line2 3`],
        [`Layered configuration: defaults, file, environment, command line. <code>ResourceBundle</code> loads localized properties (<code>messages_hi.properties</code>). Spring Boot binds properties to typed beans with <code>@ConfigurationProperties</code> and supports relaxed names and profiles.`,
            r`ResourceBundle rb = ResourceBundle.getBundle(
    "messages", Locale.forLanguageTag("hi"));
System.out.println(rb.getString("greeting"));
Properties defaults = new Properties();
defaults.setProperty("port", "8080");
Properties cfg = new Properties(defaults);
cfg.setProperty("host", "localhost");
System.out.println(cfg.getProperty("port") + " " + cfg.getProperty("host"));

// OUTPUT:
// (the Hindi greeting)
// 8080 localhost`],
        [`Mistakes: relative file paths that break in jars, ignoring missing files (NPE when getResourceAsStream returns null), storing secrets, forgetting trimming, parsing booleans or numbers without defaults, and editing files at run time without reload logic. Fail fast on missing required keys.`,
            r`static String required(Properties p, String key) {
    String v = p.getProperty(key);
    if (v == null || v.isBlank()) {
        throw new IllegalStateException("Missing required property: " + key);
    }
    return v.trim();
}
InputStream in = Main.class.getResourceAsStream("/missing.properties");
System.out.println(in == null);

// OUTPUT:
// true`],
        [`Loading config once at startup is cheap; reading files on every request is not. Cache parsed values, reload with a WatchService only if needed, and avoid synchronizing on Properties (it is a synchronized Hashtable).`,
            r`record AppConfig(String url, int pool, boolean debug) {
    static AppConfig from(Properties p) {
        return new AppConfig(
            p.getProperty("db.url"),
            Integer.parseInt(p.getProperty("pool.size", "10")),
            Boolean.parseBoolean(p.getProperty("debug", "false")));
    }
}

// OUTPUT:
// a typed immutable config object created once and shared`],
        [`Real-world: Spring Boot externalized configuration with profiles and secrets from environment variables.`,
            r`// application.properties:
//   server.port=8080
//   spring.datasource.url=jdbc:mysql://localhost/app
// application-prod.properties:
//   spring.datasource.url=jdbc:mysql://db.prod:3306/app
// SPRING_DATASOURCE_PASSWORD=*** (environment)
// java -jar app.jar --spring.profiles.active=prod

// OUTPUT:
// the prod profile overrides the URL; the password never touches the repository`]
    ),

    'final-keyword': dv(
        [`The compiler checks that every final variable is assigned exactly once (definite assignment). Reflection can change final instance fields only in special cases, and it is blocked for records and hidden classes. The Java Memory Model adds a freeze at the end of a constructor, so other threads see final fields correctly without synchronization.`,
            r`class Safe {
    final int a;
    final List<Integer> list;
    Safe() {
        a = 5;
        list = List.of(1, 2, 3);
    }
}
// A thread that sees a Safe reference always sees a == 5 and the full list.

class Unsafe {
    int a;
    Unsafe() { a = 5; }
}
// If shared through a data race, a thread may still see a == 0.

// OUTPUT:
// final fields give safe publication; non-final fields do not`],
        [`Use final for: constants (static final), fields set once, parameters you do not reassign, classes not designed for extension, and methods that must keep their behavior (template methods). For an immutable class use: a final class, private final fields, no setters, and defensive copies of mutable inputs and outputs.`,
            r`public final class Order {
    private final long id;
    private final List<String> items;
    public Order(long id, List<String> items) {
        this.id = id;
        this.items = List.copyOf(items);   // defensive copy
    }
    public List<String> items() { return items; }
}
List<String> src = new ArrayList<>(List.of("pen"));
Order o = new Order(1, src);
src.add("hack");                           // does not affect the Order
System.out.println(o.items());

// OUTPUT:
// [pen]`],
        [`Common mistakes: thinking final makes an object immutable, making everything final out of habit (noise), changing a constant in a library without recompiling its clients (constants are inlined), and marking methods final only to speed them up. Use final for intent.`,
            r`static final int LIMIT = 10;       // inlined into callers at compile time
final StringBuilder sb = new StringBuilder("a");
sb.append("b");                       // allowed: the object changes
System.out.println(sb + " " + LIMIT);

// OUTPUT:
// ab 10`],
        [`final has no direct speed effect; its value is correctness and thread safety. A new final local in each loop pass lets every lambda capture its own value.`,
            r`List<Runnable> tasks = new ArrayList<>();
for (int i = 0; i < 3; i++) {
    final int id = i;                 // copy: i itself is not effectively final
    tasks.add(() -> System.out.print(id + " "));
}
tasks.forEach(Runnable::run);
System.out.println();

// OUTPUT:
// 0 1 2`],
        [`Real-world: value objects, configuration holders and DTOs are final and immutable, which makes them safe to share across threads without locks. A record is implicitly final and has final fields.`,
            r`public record Price(BigDecimal amount, String currency) {
    public Price {
        Objects.requireNonNull(amount);
        Objects.requireNonNull(currency);
    }
}

// OUTPUT:
// instances can be cached and shared across threads freely`]
    ),

    'wrapper-class': dv(
        [`Boxing calls <code>Integer.valueOf(int)</code>, which returns cached instances for -128..127 (the upper bound is configurable with <code>-XX:AutoBoxCacheMax</code>), otherwise allocates. Unboxing calls <code>intValue()</code>. Wrappers are immutable final classes extending <code>Number</code> (except Boolean and Character). A boxed Integer is about 16 bytes versus 4 for int.`,
            r`Integer a = Integer.valueOf(127), b = Integer.valueOf(127);
Integer c = Integer.valueOf(128), d = Integer.valueOf(128);
System.out.println((a == b) + " " + (c == d));
Long l = 127L;
System.out.println(l.equals(127) + " " + l.equals(127L));

// OUTPUT:
// true false
// false true`],
        [`Utility methods: <code>Integer.parseInt(s, radix)</code>, <code>toHexString</code>, <code>bitCount</code>, <code>Integer.MAX_VALUE</code>, <code>Character.getNumericValue</code>, <code>Double.isNaN</code>, <code>Boolean.logicalAnd</code>, <code>Long.compareUnsigned</code>, <code>Integer.toUnsignedString</code>. Primitive streams (<code>IntStream</code>) avoid boxing; <code>OptionalInt</code> avoids boxing for optionals.`,
            r`System.out.println(Integer.parseInt("ff", 16) + " "
    + Integer.toHexString(255) + " " + Integer.toUnsignedString(-1)
    + " " + Character.getNumericValue('7'));
int total = IntStream.rangeClosed(1, 5).sum();
OptionalInt max = IntStream.of(3, 9, 2).max();
System.out.println(total + " " + max.getAsInt() + " " + Double.isNaN(0.0 / 0.0));

// OUTPUT:
// 255 ff 4294967295 7
// 15 9 true`],
        [`Mistakes: == on wrappers, NPE on unboxing, mixing types in a ternary (<code>cond ? 1 : null</code> unboxes to int and can NPE), Long vs Integer equals (different types are never equal), and boxing in generic code in hot loops. Use equals or compare.`,
            r`Integer x = null;
boolean flag = false;
try {
    Integer r = flag ? 1 : x;   // mixed int and Integer: x is unboxed
} catch (NullPointerException e) {
    System.out.println("NPE from ternary unboxing");
}
Integer v = flag ? Integer.valueOf(1) : x;   // both Integer: no unboxing
System.out.println(v);

// OUTPUT:
// NPE from ternary unboxing
// null`],
        [`Boxed collections cost memory and cache misses: a List&lt;Integer&gt; of one million items uses about 20 MB versus 4 MB for int[]. Use primitive arrays, IntStream, or libraries like Eclipse Collections and fastutil for numeric workloads.`,
            r`List<Integer> boxed = IntStream.range(0, 1_000_000).boxed().toList();
int[] prim = IntStream.range(0, 1_000_000).toArray();
long a = boxed.stream().mapToLong(Integer::longValue).sum();
long b = Arrays.stream(prim).asLongStream().sum();
System.out.println(a == b);

// OUTPUT:
// true`],
        [`Real-world: JSON and database mapping use wrappers to represent nullable numbers (a missing value is null, a zero is 0). Use <code>Integer</code> fields in entities for nullable columns and primitives for required ones.`,
            r`class Product {
    Integer stock;                       // null means unknown
    boolean inStock() { return stock != null && stock > 0; }
}
System.out.println(new Product().inStock());

// OUTPUT:
// false`]
    ),

    'methods-in-java': dv(
        [`Each call creates a stack frame holding locals, the operand stack and a reference to the constant pool; arguments are copied into it (pass by value). Dispatch: <code>invokestatic</code> (static), <code>invokespecial</code> (constructors, private, super), <code>invokevirtual</code> (class instance methods, dynamic lookup), <code>invokeinterface</code>, and <code>invokedynamic</code> (lambdas). Overloads are chosen at compile time, overrides at run time.`,
            r`class A {
    void f(Object o) { System.out.println("A.Object"); }
    void f(String s) { System.out.println("A.String"); }
}
class B extends A {
    @Override void f(String s) { System.out.println("B.String"); }
}
A a = new B();
Object s = "text";
a.f("x");   // overload chosen by static type String, override at run time
a.f(s);     // static type Object -> A.Object

// OUTPUT:
// B.String
// A.Object`],
        [`Advanced forms: varargs, generic methods (<code>&lt;T&gt; T first(List&lt;T&gt; l)</code>), recursion, method references, default and static interface methods, <code>private</code> helper methods, <code>synchronized</code> methods, and covariant returns. Tail calls are not optimized by the JVM, so deep recursion can overflow the stack.`,
            r`static <T extends Comparable<T>> T max(List<T> l) {
    T best = l.get(0);
    for (T t : l) if (t.compareTo(best) > 0) best = t;
    return best;
}
static long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
Function<String, Integer> len = String::length;   // method reference
System.out.println(max(List.of(3, 8, 5)) + " " + max(List.of("b", "z", "a"))
    + " " + fact(10) + " " + len.apply("java"));

// OUTPUT:
// 8 z 3628800 10`],
        [`Mistakes: believing Java is pass by reference, swapping values with a method (cannot swap primitives), huge methods, unnecessary side effects, too many parameters, boolean flag parameters (split into two methods), ignoring return values, and unbounded recursion (StackOverflowError). Return results instead of mutating parameters.`,
            r`static void swap(int a, int b) {
    int t = a;
    a = b;
    b = t;
}
int x = 1, y = 2;
swap(x, y);                          // swaps only the local copies
System.out.println(x + " " + y);
static int depth(int n) { return depth(n + 1); }   // no base case
try { depth(0); }
catch (StackOverflowError e) { System.out.println("StackOverflowError"); }

// OUTPUT:
// 1 2
// StackOverflowError`],
        [`Small methods are inlined by the JIT (default limit about 35 bytecodes for non-hot methods, 325 for hot), so splitting code for clarity rarely costs speed. Avoid allocation in tight loops and prefer iteration over deep recursion; memoize repeated work.`,
            r`static final Map<Integer, Long> memo = new HashMap<>();
static long fib(int n) {
    if (n < 2) return n;
    Long cached = memo.get(n);
    if (cached != null) return cached;
    long v = fib(n - 1) + fib(n - 2);   // each n is computed only once
    memo.put(n, v);
    return v;
}
System.out.println(fib(40));

// OUTPUT:
// 102334155`],
        [`Real-world: service methods with guard clauses, clear names and small responsibilities; helpers extracted until each method reads like a sentence.`,
            r`public Receipt checkout(Cart cart, PaymentMethod pm) {
    validate(cart);
    Money total = priceOf(cart);
    Payment payment = pm.charge(total);
    return receiptFor(cart, payment);
}

// OUTPUT:
// (no console output) the high-level flow is visible at a glance`]
    ),

    'return-object': dv(
        [`Returning an object returns a copy of the reference; both caller and callee see the same heap object. Escape analysis may avoid allocating objects that never escape the method. Fluent APIs return <code>this</code> (or a new immutable instance in "wither" style); factories return subtypes behind an interface.`,
            r`record Point(int x, int y) {
    Point withX(int nx) { return new Point(nx, y); }   // "wither": returns a new object
}
Point p = new Point(1, 2);
Point q = p.withX(9);
System.out.println(p + " " + q);
interface Shape { double area(); }
static Shape unitCircle() { return () -> Math.PI; }
System.out.printf("%.2f%n", unitCircle().area());

// OUTPUT:
// Point[x=1, y=2] Point[x=9, y=2]
// 3.14`],
        [`Options for results: plain object, record, <code>Optional&lt;T&gt;</code>, a result type (sealed Success/Failure), exceptions for truly exceptional cases, and <code>CompletableFuture&lt;T&gt;</code> for async. Never return null for collections or arrays; return <code>List.of()</code>.`,
            r`sealed interface Result<T> permits Ok, Err {}
record Ok<T>(T value) implements Result<T> {}
record Err<T>(String message) implements Result<T> {}
static Result<Integer> parse(String s) {
    try {
        return new Ok<>(Integer.parseInt(s));
    } catch (NumberFormatException e) {
        return new Err<>("not a number: " + s);
    }
}
for (String s : List.of("42", "x")) {
    System.out.println(switch (parse(s)) {
        case Ok<Integer> ok -> "ok " + ok.value();
        case Err<Integer> er -> er.message();
    });
}

// OUTPUT:
// ok 42
// not a number: x`],
        [`Mistakes: returning null (NullPointerException at the caller), exposing internal mutable state, returning Optional fields or Optional parameters (misuse), returning concrete types unnecessarily, and returning arrays that callers modify. Return copies or immutable views.`,
            r`class Registry {
    private final Map<String, String> data = new HashMap<>();

    Map<String, String> bad() { return data; }   // leaks the live map
    Map<String, String> good() { return Collections.unmodifiableMap(data); }
}
Registry r = new Registry();
r.bad().put("k", "v");   // works, and changes Registry's state
try {
    r.good().put("x", "y");
} catch (UnsupportedOperationException e) {
    System.out.println("read-only view");
}
System.out.println(r.good());

// OUTPUT:
// read-only view
// {k=v}`],
        [`Allocation per call is cheap; the cost is garbage and pointer chasing. Return primitives where a value is enough, and reuse objects only for proven hot spots. Records are compact and JIT friendly.`,
            r`record Stats(double mean, double max) {}
static Stats stats(double[] a) {
    DoubleSummaryStatistics s = Arrays.stream(a).summaryStatistics();
    return new Stats(s.getAverage(), s.getMax());
}
System.out.println(stats(new double[]{1, 2, 6}));

// OUTPUT:
// Stats[mean=3.0, max=6.0]`],
        [`Real-world: a repository returns Optional for lookups, a service returns a DTO record, and a controller maps it to a response.`,
            r`Optional<Customer> find(long id);
CustomerDto dto = repo.find(id)
    .map(c -> new CustomerDto(c.id(), c.name()))
    .orElseThrow(() -> new NotFoundException("customer " + id));

// OUTPUT:
// a missing customer becomes a 404, a found one a DTO`]
    ),

    'Different way to return to the method in java.': dv(
        [`In bytecode a method ends with one of <code>ireturn</code>, <code>areturn</code>, <code>return</code> or by an exception propagating out. <code>finally</code> blocks are copied before every exit path. The JVM unwinds the frame and passes the result to the caller, or searches the exception table for a handler.`,
            r`static int f() {
    int x = 1;
    try {
        return x;   // value 1 is saved here
    } finally {
        x = 2;      // does not change the saved value
        System.out.println("finally x=" + x);
    }
}
System.out.println(f());

// OUTPUT:
// finally x=2
// 1`],
        [`Exits: normal return with value, early void return, exception, <code>System.exit</code> (never returns), infinite loops, and for lambdas the return of the functional method. Use guard clauses, <code>Optional</code> chaining, switch expressions with yield, and streams (<code>findFirst</code>) to express early outcomes.`,
            r`static String label(int n) {
    return switch (n) {
        case 0 -> "zero";
        case 1 -> "one";
        default -> {
            if (n < 0) yield "negative";
            yield "many";
        }
    };
}
System.out.println(label(0) + " " + label(-3) + " " + label(9));

// OUTPUT:
// zero negative many`],
        [`Mistakes: return in finally, System.exit inside libraries, forgetting to return in a branch, and unreachable code after return/throw/break. Also, a catch that returns null hides failures; log or rethrow with context.`,
            r`static int g() {
    try {
        throw new IllegalStateException("boom");
    } finally {
        return 0;   // exception is lost
    }
}
System.out.println(g());

// OUTPUT:
// 0`],
        [`Exceptions are far slower than returns when thrown frequently (stack trace capture). For expected failures such as validation, return a result or boolean instead of throwing in hot paths.`,
            r`static boolean isInt(String s) {
    if (s == null || s.isEmpty()) return false;
    for (char c : s.toCharArray()) {
        if (!Character.isDigit(c)) return false;
    }
    return true;
}
System.out.println(isInt("123") + " " + isInt("12x"));

// OUTPUT:
// true false`],
        [`Real-world: request handlers use guard clauses to return errors early (401, 400) and keep the happy path unindented.`,
            r`ResponseEntity<?> update(UserDto dto, Principal p) {
    if (p == null) return ResponseEntity.status(401).build();
    if (dto.name().isBlank()) return ResponseEntity.badRequest().body("name required");
    service.update(dto);
    return ResponseEntity.ok().build();
}

// OUTPUT:
// each failure returns immediately with the right status`]
    ),

    'this-super': dv(
        [`<code>this</code> is local variable 0 in instance methods and holds the receiver reference; <code>super.m()</code> compiles to <code>invokespecial</code> on the parent method (bypassing dynamic dispatch), and <code>super(...)</code> invokes the parent <code>&lt;init&gt;</code>. Inner classes also hold <code>Outer.this</code>.`,
            r`class Outer {
    String n = "outer";

    class Inner {
        String n = "inner";

        void show() {
            System.out.println(n + " " + this.n + " " + Outer.this.n);
        }
    }
}

// in main:
new Outer().new Inner().show();

// OUTPUT:
// inner inner outer`],
        [`Patterns: fluent setters returning this, copy constructors using this(...), template methods calling super then adding behavior, decorators calling super, interface default conflict resolution, and constructor delegation. <code>super</code> never refers to a separate parent object: there is only one object.`,
            r`class Logger {
    void log(String m) { System.out.println("LOG " + m); }
}

class TimedLogger extends Logger {
    @Override
    void log(String m) {
        String time = java.time.LocalTime.of(10, 0).toString();
        super.log(time + " " + m);   // reuse the parent version
    }
}

// in main:
new TimedLogger().log("started");

// OUTPUT:
// LOG 10:00 started`],
        [`Mistakes: using this or super in static methods (compile error), expecting super.super, shadowing fields so that this.x and super.x differ, calling overridable methods via this in constructors, and passing this to other threads from a constructor.`,
            r`class Reg {
    static final java.util.List<Reg> ALL = new java.util.ArrayList<>();
    final String name;

    // Risky: this is published before name is set
    Reg(String n) {
        ALL.add(this);
        this.name = n;
    }
}

// Safer: build fully, then register through a static factory
class SafeReg {
    static final java.util.List<SafeReg> ALL = new java.util.ArrayList<>();
    final String name;

    private SafeReg(String n) { this.name = n; }

    static SafeReg create(String n) {
        SafeReg r = new SafeReg(n);
        ALL.add(r);
        return r;
    }
}

// OUTPUT:
// code reading ALL during construction could see name == null`],
        [`There is no runtime cost to this or super: they are plain references and invokespecial calls the JIT inlines. Excessive super chains hint at a deep hierarchy that should be replaced by composition.`,
            r`// before: class D extends C extends B extends A (each calls super.process())
// after:  Pipeline.of(new StepA(), new StepB(), new StepC()).run(input)

// OUTPUT:
// the steps are composed explicitly instead of hidden in inheritance`],
        [`Real-world: extending a framework class and calling super so the framework behavior is preserved, for example overriding a Servlet lifecycle method or a Spring callback.`,
            r`@Override
public void init(ServletConfig config) throws ServletException {
    super.init(config);                // keep the framework initialization
    this.pool = createPool();
}

// OUTPUT:
// the container sees the servlet as properly initialized`]
    ),

    'classes-objects': dv(
        [`An object has a header (mark word with hash and lock state, class pointer), then fields, padded to 8 bytes. <code>new</code> allocates in the young generation (a thread-local allocation buffer makes it fast), initializes fields to defaults, then runs the constructor. Each class has a class object and a method table used for virtual dispatch.`,
            r`class Empty {} class Pair {
    int a;
    int b;
}
// with JOL (org.openjdk.jol): ClassLayout.parseClass(Pair.class).toPrintable()
//  OFFSET SIZE TYPE DESCRIPTION
//   0     8         (mark word)
//   8     4         (class pointer)
//  12     4  int    Pair.a
//  16     4  int    Pair.b
//  20     4         (padding)   -> 24 bytes total

// OUTPUT:
// a Pair object occupies 24 bytes`],
        [`Design principles: encapsulation, single responsibility, immutability, tell don't ask, composition over inheritance, equals/hashCode/toString for value types, and records for data carriers. Object identity (<code>==</code>) versus equality (<code>equals</code>); defensive copies at boundaries; clone alternatives (copy constructors).`,
            r`public final class Email {
    private final String value;
    public Email(String v) {
        if (!v.contains("@")) throw new IllegalArgumentException("invalid email");
        this.value = v.toLowerCase();
    }
    @Override public boolean equals(Object o) {
        return o instanceof Email e && e.value.equals(value);
    }
    @Override public int hashCode() { return value.hashCode(); }
    @Override public String toString() { return value; }
}
System.out.println(new Email("A@x.com").equals(new Email("a@X.com")));

// OUTPUT:
// true`],
        [`Mistakes: public mutable fields, god classes, anemic models with logic scattered in services, forgetting equals/hashCode when using objects as keys, null references, and memory leaks from long-lived references (static maps, listeners). Remove listeners and bound caches.`,
            r`class Leaky {
    static final List<byte[]> CACHE = new ArrayList<>();
    void work() { CACHE.add(new byte[1_000_000]); }   // grows forever
}
// fix: bounded cache (Caffeine), weak references, or clearing

// OUTPUT:
// OutOfMemoryError: Java heap space after enough calls`],
        [`Allocation is fast, but millions of short-lived objects increase GC work; keep objects small, avoid unnecessary wrappers, and reuse immutable constants. Use JFR allocation profiling to find hot spots, and values/inline classes (Project Valhalla) are coming for flat data.`,
            r`// java -XX:StartFlightRecording=filename=rec.jfr,settings=profile -jar app.jar
// then open rec.jfr in JDK Mission Control: Memory > Allocation by class

// OUTPUT:
// the top allocating classes and stack traces are listed`],
        [`Real-world domain modelling: an Order aggregate owns its line items, enforces invariants (total, status transitions) in methods, and exposes read-only views.`,
            r`class Order {
    private final List<Line> lines = new ArrayList<>();
    private Status status = Status.NEW;

    void add(Line l) {
        if (status != Status.NEW) throw new IllegalStateException("order closed");
        lines.add(l);
    }
    void pay() {
        if (lines.isEmpty()) throw new IllegalStateException("empty");
        status = Status.PAID;
    }
    List<Line> lines() { return List.copyOf(lines); }   // read-only copy
}

// OUTPUT:
// invalid transitions are impossible from outside the class`]
    )
};