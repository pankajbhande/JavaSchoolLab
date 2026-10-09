// Core Java extras, part 4: OOP pillars (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java04Extras: Record<string, Extra> = {
    'Encapsulation in Java': x(
        ['<b>Encapsulation</b> bundles data and the methods that work on it, and hides the data: make fields <code>private</code> and expose <code>public</code> getters and setters.',
            '<b>Validation</b>: a setter can reject bad values before assigning, so the object stays valid.',
            '<b>Read-only class</b>: has getters but no setters.'],
        ['<b>Invariants</b>: getters and setters are not the goal; the goal is to protect the rules of the object and hide the implementation.',
            '<b>Behavior over setters</b>: expose <code>account.deposit(100)</code> instead of <code>setBalance</code>.',
            '<b>Mutable fields</b>: return copies or unmodifiable views.'],
        ['<b>Changing internals</b>: a field can become computed, or a list a set, without breaking callers.',
            '<b>Immutable objects</b> are the strongest form: no setters, <code>final</code> fields, defensive copies.',
            '<b>JavaBeans</b> naming (<code>getX</code>/<code>setX</code>) matters to frameworks such as JPA and Jackson; <b>records</b> give accessors without boilerplate.'],
        [['F', 'What is encapsulation?', 'Hiding data inside a class and exposing it only through methods.'],
            ['F', 'How do you achieve it in Java?', 'Private fields with public getters and setters (or behavior methods).'],
            ['M', 'Why use setters with validation?', 'To prevent invalid state, such as a negative age.'],
            ['M', 'Is a class with private fields and public getters/setters fully encapsulated?', 'Not necessarily: if setters allow any change, internals are still exposed; design meaningful operations.'],
            ['S', 'How do you encapsulate a mutable collection field?', 'Return an unmodifiable view or a copy, and provide add/remove methods that validate.'],
            ['S', 'How do records relate to encapsulation?', 'Records are transparent immutable data carriers; they hide mutability but expose components by design.']],
        [['Validated setter and behavior method.',
            r`class Account {
    private double balance;
    public double getBalance() { return balance; }
    public void deposit(double amt) {
        if (amt <= 0) throw new IllegalArgumentException("amount must be positive");
        balance += amt;
    }
    public void withdraw(double amt) {
        if (amt > balance) throw new IllegalStateException("insufficient funds");
        balance -= amt;
    }
}
Account a = new Account();
a.deposit(500);
a.withdraw(200);
System.out.println(a.getBalance());

// OUTPUT:
// 300.0`],
            ['Defensive copy.',
                r`class Course {
    private final List<String> topics = new ArrayList<>();
    void add(String t) { topics.add(t); }
    List<String> topics() { return Collections.unmodifiableList(topics); }
}
Course c = new Course();
c.add("OOP");
try {
    c.topics().add("hack");
} catch (UnsupportedOperationException e) {
    System.out.println("blocked");
}

// OUTPUT:
// blocked`]],
        [['Leaky encapsulation.',
            r`class Bad { public List<String> items = new ArrayList<>(); }
Bad b = new Bad();
b.items.clear();       // anyone can break the rules

// OUTPUT:
// the class cannot protect its own state`],
            ['Record as immutable carrier.',
                r`record Student(String name, int marks) {
    Student {   // compact constructor validates
        if (marks < 0 || marks > 100) throw new IllegalArgumentException("marks");
    }
}
System.out.println(new Student("Asha", 88));

// OUTPUT:
// Student[name=Asha, marks=88]`]]
    ),

    'inheritance in Java': x(
        ['<b>Inheritance</b> lets a class (child, subclass) reuse the fields and methods of another (parent, superclass) using <code>extends</code>.',
            '<b>Is-a relationship</b>: a <code>Dog</code> is an <code>Animal</code>.',
            '<b>Extend and override</b>: a child can add new members and replace parent methods.'],
        ['<b>Single class inheritance</b>: a class has one parent class but can implement many interfaces.',
            '<b>Private members</b> exist in the child object but cannot be accessed directly. <b>Constructors</b> are not inherited; call the parent one with <code>super(...)</code>.',
            '<b>@Override</b>: use <code>@Override</code> so the compiler checks that you really override.'],
        ['<b>Composition over inheritance</b>: inheritance couples child to parent and can break when the parent changes (fragile base class).',
            '<b>Design for inheritance or prohibit it</b> with <code>final</code>; document which methods subclasses may override.',
            '<b>Liskov substitution</b>: a subclass must work wherever the parent is expected, with no surprises.'],
        [['F', 'What is inheritance?', 'A class acquiring the members of another class with extends, modelling is-a.'],
            ['F', 'Does Java support multiple inheritance of classes?', 'No, only single class inheritance; multiple interfaces are allowed.'],
            ['M', 'Are constructors inherited?', 'No; a child calls the parent constructor with super(...).'],
            ['M', 'What is the purpose of @Override?', 'It makes the compiler verify that the method really overrides a parent method.'],
            ['S', 'Composition vs inheritance?', 'Composition (has-a) is more flexible and less coupled; use inheritance only for true is-a with substitutability.'],
            ['S', 'What is the Liskov substitution principle?', 'Objects of a subclass should be replaceable for the parent type without breaking correctness.']],
        [['Extending and overriding.',
            r`class Employee {
    String name;
    double salary;
    Employee(String n, double s) { name = n; salary = s; }
    double bonus() { return salary * 0.1; }
}
class Manager extends Employee {
    Manager(String n, double s) { super(n, s); }
    @Override double bonus() { return super.bonus() + 5000; }
}
Employee e = new Manager("Asha", 100000);
System.out.println(e.bonus());

// OUTPUT:
// 15000.0`],
            ['Composition instead.',
                r`class Engine {
    void start() { System.out.println("engine on"); }
}
class Car {
    private final Engine engine = new Engine();   // has-a
    void start() { engine.start(); }
}
new Car().start();

// OUTPUT:
// engine on`]],
        [['Square extends Rectangle problem.',
            r`class Rect {
    int w, h;
    void setW(int w) { this.w = w; }
    void setH(int h) { this.h = h; }
    int area() { return w * h; }
}
class Square extends Rect {
    @Override void setW(int w) { this.w = this.h = w; }
    @Override void setH(int h) { this.w = this.h = h; }
}
Rect r = new Square();
r.setW(4);
r.setH(5);
// Rect callers expect 20 (independent w and h); here it is 25
System.out.println(r.area());

// OUTPUT:
// 25`],
            ['Final prevents extension.',
                r`final class Money {}
// class Euro extends Money {}      // error: cannot inherit from final Money

// OUTPUT:
// compile-time error`]]
    ),

    'Inheritance Types': x(
        ['Types: <b>single</b> (B extends A), <b>multilevel</b> (C extends B extends A), <b>hierarchical</b> (B and C extend A).',
            '<b>Multiple</b> inheritance of classes is not allowed in Java; it is achieved with interfaces.',
            '<b>Hybrid</b> is a mix and is also done with interfaces.'],
        ['<b>Diamond problem</b>: this is why Java has no multiple class inheritance. Two parents may define the same member, so the choice is ambiguous.',
            '<b>Default conflicts</b>: a class can use <code>implements A, B</code>. If both have the same default method, the class must override it and choose.',
            '<b>Root class</b>: every class implicitly extends <code>Object</code>.'],
        ['<b>Shallow hierarchies</b>: deep ones are hard to maintain. Prefer interfaces plus composition.',
            '<b>Sealed classes</b> (Java 17) restrict which classes may extend a type.',
            '<b>Abstract base classes</b> share code; <b>interfaces</b> define capabilities.'],
        [['F', 'List the types of inheritance.', 'Single, multilevel, hierarchical, and (through interfaces) multiple and hybrid.'],
            ['F', 'Does Java support multiple inheritance?', 'Not with classes; yes through interfaces.'],
            ['M', 'What is the diamond problem?', 'Ambiguity when a class inherits the same member from two parents that share a grandparent.'],
            ['M', 'How does Java handle default method conflicts?', 'The class must override the method and may call A.super.method() to choose.'],
            ['S', 'What does sealed do?', 'It restricts which classes can extend or implement a type, enabling exhaustive pattern matching.'],
            ['S', 'Why keep hierarchies shallow?', 'Deep hierarchies are rigid and hard to understand and change.']],
        [['Multilevel and hierarchical.',
            r`class Animal { void eat() { System.out.println("eats"); } }
class Mammal extends Animal { void feed() { System.out.println("milk"); } }
class Dog extends Mammal { void bark() { System.out.println("woof"); } }  // multilevel
class Cat extends Mammal { void meow() { System.out.println("meow"); } }  // hierarchical
Dog d = new Dog();
d.eat();
d.feed();
d.bark();

// OUTPUT:
// eats
// milk
// woof`],
            ['Multiple through interfaces.',
                r`interface Flyer { default String move() { return "fly"; } }
interface Swimmer { default String move() { return "swim"; } }
class Duck implements Flyer, Swimmer {
    public String move() {
        return Flyer.super.move() + "+" + Swimmer.super.move();
    }
}
System.out.println(new Duck().move());

// OUTPUT:
// fly+swim`]],
        [['Sealed hierarchy.',
            r`sealed interface Vehicle permits Car, Truck {}
record Car(int seats) implements Vehicle {}
record Truck(double load) implements Vehicle {}
static String info(Vehicle v) {
    return switch (v) {
        case Car c -> "car " + c.seats();
        case Truck t -> "truck " + t.load();
    };
}
System.out.println(info(new Car(4)));

// OUTPUT:
// car 4`],
            ['Object is the root.',
                r`class A {}
System.out.println(new A().getClass().getSuperclass().getName());

// OUTPUT:
// java.lang.Object`]]
    ),

    'Abstraction in Java': x(
        ['Abstraction hides implementation details and shows only essential features. In Java it is done with <b>abstract classes</b> and <b>interfaces</b>.',
            'An abstract class (<code>abstract class Shape</code>) cannot be instantiated and may have abstract methods (no body) and concrete methods.',
            'A <b>subclass</b> must implement all abstract methods or itself be <code>abstract</code>.'],
        ['<b>Abstract class</b>: state, constructors, partial implementation, single inheritance. <b>Interface</b>: contract, multiple implementation, <code>default</code> and <code>static</code> methods.',
            'Use an <b>interface</b> for capability (<code>Comparable</code>, <code>Runnable</code>) and an <b>abstract class</b> for shared base code.',
            '<b>Abstract methods</b> cannot be <code>private</code>, <code>static</code> or <code>final</code>.'],
        ['<b>Program to abstractions</b> (dependency inversion): depend on interfaces, inject implementations.',
            '<b>Template Method pattern</b>: an abstract class defines the algorithm skeleton, subclasses fill in the steps.',
            '<b>Keep abstractions small</b> and stable (interface segregation); avoid leaking implementation details through them.'],
        [['F', 'What is abstraction?', 'Hiding implementation details and exposing only what the user needs.'],
            ['F', 'Can you create an object of an abstract class?', 'No, only of a concrete subclass.'],
            ['M', 'Abstract class vs interface?', 'An abstract class can hold state and constructors with single inheritance; an interface defines a contract, allows multiple implementation and has no instance state.'],
            ['M', 'Can an abstract class have a constructor?', 'Yes; it runs when a concrete subclass is created.'],
            ['S', 'What is the Template Method pattern?', 'A base class defines the algorithm steps in a final method and subclasses implement the varying steps.'],
            ['S', 'Why program to interfaces?', 'It decouples callers from implementations, enabling substitution and easier testing.']],
        [['Abstract class with template method.',
            r`abstract class Report {
    final String generate() { return header() + body() + footer(); }
    abstract String body();
    String header() { return "== "; }
    String footer() { return " =="; }
}
class SalesReport extends Report { String body() { return "sales 100"; } }
System.out.println(new SalesReport().generate());

// OUTPUT:
// == sales 100 ==`],
            ['Interface abstraction.',
                r`interface Notifier { void send(String to, String msg); }
class EmailNotifier implements Notifier {
    public void send(String to, String msg) {
        System.out.println("mail to " + to + ": " + msg);
    }
}
class SmsNotifier implements Notifier {
    public void send(String to, String msg) {
        System.out.println("sms to " + to + ": " + msg);
    }
}
for (Notifier n : List.of(new EmailNotifier(), new SmsNotifier()))
    n.send("asha", "hi");

// OUTPUT:
// mail to asha: hi
// sms to asha: hi`]],
        [['Cannot instantiate.',
            r`abstract class Shape { abstract double area(); }
// new Shape();   // error: Shape is abstract
Shape s = new Shape() { double area() { return 1.0; } };   // anonymous subclass
System.out.println(s.area());

// OUTPUT:
// 1.0`],
            ['Lambda for a single abstract method.',
                r`// Notifier has one abstract method, so a lambda can implement it
Notifier n = (to, msg) -> System.out.println(to + ":" + msg);
n.send("ravi", "ok");

// OUTPUT:
// ravi:ok`]]
    ),

    'Polymorphism in java': x(
        ['Polymorphism means one interface, many forms. <b>Compile-time</b> (overloading) and <b>run-time</b> (overriding).',
            '<b>Overloading</b>: same method name, different parameters, resolved by the compiler.',
            '<b>Overriding</b>: a subclass redefines a parent method; the JVM picks the version from the actual object type at run time.'],
        ['<b>Parent reference</b> can hold a child object: <code>Animal a = new Dog();</code>; <code>a.speak()</code> runs <code>Dog.speak</code>.',
            '<b>Fields and static methods</b> are not polymorphic (resolved by reference type).',
            '<b>Overriding rules</b>: same signature, return type same or covariant, not less accessible, no broader checked exceptions.'],
        ['<b>Run-time dispatch</b> uses the virtual method table (vtable); the JIT can inline monomorphic calls and guard with a class check.',
            '<b>Open/Closed principle</b>: polymorphism removes if-else on type; add a new subclass instead of editing a switch.',
            '<b>Sealed types</b> with pattern matching offer a closed-world alternative (exhaustive <code>switch</code>).'],
        [['F', 'What is polymorphism?', 'The ability of one interface or method to take many forms.'],
            ['F', 'Overloading vs overriding?', 'Overloading is same name with different parameters (compile time); overriding redefines a parent method (run time).'],
            ['M', 'Is method overriding resolved at compile time or run time?', 'Run time, based on the actual object type.'],
            ['M', 'Are fields polymorphic?', 'No, field access depends on the reference type.'],
            ['S', 'Rules for covariant return types?', 'An overriding method may return a subtype of the parent method return type.'],
            ['S', 'How does polymorphism support the Open/Closed principle?', 'New behavior is added by new subclasses or implementations, without modifying existing code.']],
        [['Runtime polymorphism.',
            r`abstract class Shape { abstract double area(); }

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    double area() { return Math.PI * r * r; }
}

class Rect extends Shape {
    double w, h;
    Rect(double w, double h) { this.w = w; this.h = h; }
    double area() { return w * h; }
}

List<Shape> shapes = List.of(new Circle(1), new Rect(2, 3));
for (Shape s : shapes) System.out.printf("%.2f ", s.area());
System.out.println();

// OUTPUT:
// 3.14 6.00`],
            ['Overload vs override.',
                r`class A {
    void p(Object o) { System.out.println("A.obj"); }
    void p(String s) { System.out.println("A.str"); }
}
class B extends A {
    @Override void p(String s) { System.out.println("B.str"); }
}

A a = new B();
Object o = "x";
a.p("x");   // overload chosen by compiler (String), override by object (B)
a.p(o);     // static type Object: only p(Object) matches

// OUTPUT:
// B.str
// A.obj`]],
        [['Fields are not polymorphic.',
            r`class P {
    String name = "parent";
    String who() { return "P"; }
}
class C extends P {
    String name = "child";
    String who() { return "C"; }
}

P p = new C();
System.out.println(p.name + " " + p.who());

// OUTPUT:
// parent C`],
            ['Replace if-else with polymorphism.',
                r`interface Discount { double apply(double p); }
Map<String, Discount> d = Map.of(
    "GOLD", p -> p * 0.8,
    "SILVER", p -> p * 0.9);
System.out.println(d.getOrDefault("GOLD", p -> p).apply(100));

// OUTPUT:
// 80.0`]]
    )
};

export const java04Deep: Record<string, Deep> = {
    'Encapsulation in Java': dv(
        [`Access modifiers are checked by the compiler and again by the JVM at run time, but its real purpose is protecting invariants: rules that must always hold for an object (balance is not negative, start is before end). All state changes go through methods that preserve the invariants, so the object is valid from construction until it is collected.`,
            r`final class DateRange {
    private final LocalDate start, end;

    DateRange(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) throw new IllegalArgumentException("end before start");
        this.start = start;
        this.end = end;
    }

    DateRange extendTo(LocalDate newEnd) {  // returns a new valid object
        return new DateRange(start, newEnd);
    }

    long days() { return ChronoUnit.DAYS.between(start, end); }
}
DateRange r = new DateRange(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 31));
System.out.println(r.days());

// OUTPUT:
// 30`],
        [`Techniques: private final fields, validation in constructors, defensive copies on input and output (mutable types like Date, arrays, collections), package-private and nested classes for internals, the module system, immutable value objects, and the builder pattern. Frameworks need accessors or reflection: JPA can use field access, Jackson uses getters or record components.`,
            r`final class Schedule {
    private final Date[] slots;
    Schedule(Date[] slots) { this.slots = copy(slots); }  // copy in
    Date[] slots() { return copy(slots); }                // copy out
    private static Date[] copy(Date[] a) {
        return Arrays.stream(a).map(d -> new Date(d.getTime())).toArray(Date[]::new);
    }
}
Date[] in = { new Date(0) };
Schedule s = new Schedule(in); in[0].setTime(999);
System.out.println(s.slots()[0].getTime());

// OUTPUT:
// 0`],
        [`Mistakes: generating getters and setters for every field (anemic model), returning mutable internals, setters that accept anything, public static mutable fields, and exposing entity objects directly from REST APIs (use DTOs). Also, reflection <code>setAccessible(true)</code> can break encapsulation unless modules restrict it.`,
            r`class Cart {
    private final List<String> items = new ArrayList<>();
    public List<String> getItems() { return items; }   // leaks the internal list
}
Cart c = new Cart();
c.getItems().add("pen");
c.getItems().add(null);        // the rule "no nulls" cannot be enforced
System.out.println(c.getItems());

// OUTPUT:
// [pen, null]`],
        [`Encapsulation lets you optimize internals without API changes: switch from a list to an array, add caching or lazy loading, or compute values on demand. Immutability enables sharing and safe caching and avoids defensive copying.`,
            r`final class Circle {
    private final double r;
    private double area = -1;       // cache, hidden from callers
    Circle(double r) { this.r = r; }
    double area() {
        if (area < 0) area = Math.PI * r * r;   // computed once, on first use
        return area;
    }
}
Circle c = new Circle(2);
System.out.println(c.area() + " " + c.area());

// OUTPUT:
// 12.566370614359172 12.566370614359172`],
        [`Real-world: a banking Account class never exposes balance setters; transfers are methods that lock, check and update atomically.`,
            r`public synchronized void transferTo(Account to, long cents) {
    if (cents <= 0) throw new IllegalArgumentException();
    if (balance < cents) throw new InsufficientFundsException(id, balance, cents);
    this.balance -= cents;
    to.credit(cents);
    history.add(new Txn(id, to.id, cents, Instant.now()));
}

// OUTPUT:
// no external code can put the account into an inconsistent state`]
    ),

    'inheritance in Java': dv(
        [`An object of a child class contains parent fields followed by child fields in one block of memory. Method calls use the virtual method table: each class has a vtable, a subclass overrides entries, and <code>invokevirtual</code> picks the entry for the actual class. Constructors run from the top class down; static members are inherited but hidden, not overridden.`,
            r`class A {
    A() { System.out.println("A ctor " + describe()); }
    String describe() { return "A"; }
}
class B extends A {
    String tag = "tag";
    B() { System.out.println("B ctor " + describe()); }
    @Override String describe() { return "B(" + tag + ")"; }
}
new B();

// OUTPUT:
// A ctor B(null)
// B ctor B(tag)`],
        [`Guidelines (Effective Java): design and document for inheritance or forbid it; do not call overridable methods in constructors; prefer composition and forwarding (decorator); use interfaces plus default methods; make classes final by default; use <code>protected</code> sparingly; and prefer abstract skeleton classes for APIs. Inheritance of implementation breaks encapsulation.`,
            r`class CountingSet<E> extends HashSet<E> {
    int added;
    @Override public boolean add(E e) {
        added++;
        return super.add(e);
    }
    @Override public boolean addAll(Collection<? extends E> c) {
        added += c.size();
        return super.addAll(c);   // addAll calls add: double count
    }
}
CountingSet<String> s = new CountingSet<>();
s.addAll(List.of("a", "b"));
System.out.println(s.added);

// OUTPUT:
// 4`],
        [`Mistakes: inheriting for code reuse when not is-a, fragile base classes, overriding equals asymmetrically, changing behavior that callers rely on (violating Liskov), forgetting @Override (accidental overload), and calling overridable methods from constructors. The fix for the counting set is composition with a forwarding wrapper.`,
            r`class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;
    ForwardingSet(Set<E> s) { this.s = s; }
    public boolean add(E e) { return s.add(e); }
    /* other methods forward the same way */
}
// class A { void run(int x) {} }
// class B extends A { void run(Integer x) {} }
// overload, not override: @Override would flag it

// OUTPUT:
// the wrapper counts only what it sees, with no hidden self-calls`],
        [`Virtual calls cost a small indirection, but the JIT uses class hierarchy analysis and inline caches: a call site that sees one or two receiver types is inlined. Megamorphic call sites (many types) are slower, which can matter in hot loops.`,
            r`// java -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining -jar app.jar
//   Shape::area (12 bytes)   inline (hot)         monomorphic
//   Visitor::visit            virtual call        megamorphic

// OUTPUT:
// inlining decisions are visible in the log`],
        [`Real-world: frameworks use abstract base classes (HttpServlet, JpaRepository adapters) with documented extension points, while your business logic uses composition and interfaces.`,
            r`public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req,
                         HttpServletResponse resp) throws IOException {
        resp.getWriter().println("hello");
    }
}

// OUTPUT:
// the container calls doGet; only the extension point is overridden`]
    ),

    'Inheritance Types': dv(
        [`The JVM allows single class inheritance only, which keeps the object layout and method resolution simple and avoids ambiguity. Interfaces add multiple inheritance of type, and since Java 8 of behavior through default methods. Resolution rules: class wins over interface, more specific interface wins, otherwise the class must override explicitly.`,
            r`interface A { default String who() { return "A"; } }
interface B extends A { default String who() { return "B"; } }
class C implements A, B {}                    // B is more specific than A
class P { public String who() { return "P"; } }
class D extends P implements A {}             // class wins over interface
System.out.println(new C().who() + " " + new D().who());

// OUTPUT:
// B P`],
        [`Tools for hierarchy design: sealed classes and interfaces (closed set of subtypes), records implementing interfaces, mixin style default methods, abstract skeletal implementations (<code>AbstractList</code>), marker interfaces, and generics bounds. Hierarchy shape: wide and shallow beats deep.`,
            r`sealed abstract class Payment permits Card, Upi {}
final class Card extends Payment {
    final String last4;
    Card(String l) { last4 = l; }
}
final class Upi extends Payment {
    final String vpa;
    Upi(String v) { vpa = v; }
}
static String show(Payment p) {
    return switch (p) {
        case Card c -> "card ****" + c.last4;
        case Upi u -> "upi " + u.vpa;
    };
}
System.out.println(show(new Upi("a@bank")));

// OUTPUT:
// upi a@bank`],
        [`Mistakes: forcing an is-a relation (Stack extends Vector), diamond default conflicts without override (compile error), deep multilevel chains, using inheritance only to share utility code, and exposing protected fields. Prefer delegation.`,
            r`interface X { default void hi() { System.out.println("X"); } }
interface Y { default void hi() { System.out.println("Y"); } }
// class Z implements X, Y {}   // compile error: Z inherits unrelated defaults
class Z implements X, Y {
    public void hi() { X.super.hi(); } // pick X's version
}
new Z().hi();

// OUTPUT:
// X`],
        [`Deep hierarchies increase class loading and initialization chains and slow comprehension. Keep depth under about three levels, and prefer interfaces so implementations can vary without extending a base class.`,
            r`// IntelliJ: Diagrams > Show Diagram (Ctrl+Alt+U) shows a hierarchy
// jdeps -verbose:class app.jar   lists dependencies between classes

// OUTPUT:
// a visual of the inheritance tree`],
        [`Real-world: the collections framework uses interface hierarchy (Collection, List, Set), abstract skeletons (AbstractList) and concrete classes (ArrayList); you can add your own implementation by extending the skeleton.`,
            r`class Range extends AbstractList<Integer> {
    private final int n;
    Range(int n) { this.n = n; }
    public Integer get(int i) { return i; }
    public int size() { return n; }
}
System.out.println(new Range(5) + " " + new Range(5).contains(3));

// OUTPUT:
// [0, 1, 2, 3, 4] true`]
    ),

    'Abstraction in Java': dv(
        [`An abstract class compiles to a normal class with the <code>ACC_ABSTRACT</code> flag; abstract methods have no code attribute. Interfaces compile to class files with <code>ACC_INTERFACE</code>; methods are public abstract unless default, static or private. The JVM resolves interface calls through <code>invokeinterface</code> (itable lookup, optimized by inline caches).`,
            r`abstract class Base {
    abstract void run();                       // no code attribute
    void common() { System.out.println("common"); }
}
interface Job {
    void run();                                // public abstract
    default void twice() { run(); run(); }
    static Job of(Runnable r) { return r::run; }
    private void helper() { }                  // Java 9+
}
Job j = Job.of(() -> System.out.print("x "));
j.twice();
System.out.println();

// OUTPUT:
// x x`],
        [`Design: interface for roles and ports (<code>Repository</code>, <code>PaymentGateway</code>), abstract class for shared implementation with template methods, functional interfaces for single behaviors, sealed interfaces for closed hierarchies. Dependency inversion: high-level code owns the interface; low-level code implements it. Hexagonal architecture is built on this.`,
            r`public interface OrderRepository {
    Optional<Order> find(long id);
    void save(Order o);
}
class JdbcOrderRepository implements OrderRepository {
    public Optional<Order> find(long id) { return Optional.empty(); }  // SQL here
    public void save(Order o) { }
}
class InMemoryOrderRepository implements OrderRepository {
    private final Map<Long, Order> m = new HashMap<>();
    public Optional<Order> find(long id) {
        return Optional.ofNullable(m.get(id));
    }
    public void save(Order o) { m.put(o.id(), o); }
}
// OrderService depends only on OrderRepository, so tests use the in-memory one

// OUTPUT:
// the service works with either implementation`],
        [`Mistakes: interfaces with one implementation created out of habit, huge fat interfaces (violating interface segregation), leaky abstractions that expose SQL or HTTP details, abstract classes used when an interface suffices, and default methods that hold state-dependent logic. Keep abstractions small and honest.`,
            r`// fat interface: every client must know all five methods
interface Everything { void save(); void load(); void render(); void email(); void print(); }

// segregated: small interfaces
interface Saver { void save(); }
interface Renderer { void render(); }

// OUTPUT:
// clients depend only on the methods they use`],
        [`Interface calls through a polymorphic site cost a lookup that the JIT often removes. Abstraction is not a performance problem in practice; excessive layers are a maintenance problem. Measure before removing abstractions.`,
            r`// JMH benchmark: interface call vs direct call
// usually differs by less than 1 ns once inlined
@Benchmark
public double viaInterface(State s) { return s.shape.area(); }

// OUTPUT:
// both variants report about the same ns/op`],
        [`Real-world: JDBC is abstraction at work: your code uses Connection and PreparedStatement while drivers (MySQL, PostgreSQL) implement them.`,
            r`try (Connection c = DriverManager.getConnection(url, user, pass);
     PreparedStatement ps = c.prepareStatement(
         "SELECT name FROM users WHERE id = ?")) {
    ps.setLong(1, 7);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) System.out.println(rs.getString(1));
    }
}

// OUTPUT: (varies by data)
// Asha`]
    ),

    'Polymorphism in java': dv(
        [`Overloads are resolved by the compiler from the static types of the arguments (phases: exact/widening, boxing, varargs). Overrides use <code>invokevirtual</code>: the JVM looks up the method in the vtable of the receiver's actual class. Interface calls use itables. <code>invokedynamic</code> backs lambdas and string concatenation. Pattern matching on sealed types gives type-safe branching.`,
            r`static String f(long x)    { return "long"; }
static String f(Integer x) { return "Integer"; }
static String f(Object x)  { return "Object"; }
static String f(int... x)  { return "varargs"; }

System.out.println(f(5) + " " + f((short) 5) + " " + f("s") + " " + f());

// OUTPUT:
// long long Object varargs`],
        [`Forms: subtype polymorphism (overriding), parametric polymorphism (generics), ad hoc polymorphism (overloading), and coercion (widening). Design patterns built on it: Strategy, State, Visitor, Command, Template Method. Double dispatch (Visitor) emulates multimethods.`,
            r`interface Visitor<R> {
    R visitNum(int n);
    R visitAdd(Expr a, Expr b);
}
interface Expr { <R> R accept(Visitor<R> v); }

record Num(int n) implements Expr {
    public <R> R accept(Visitor<R> v) { return v.visitNum(n); }
}
record Add(Expr a, Expr b) implements Expr {
    public <R> R accept(Visitor<R> v) { return v.visitAdd(a, b); }
}

Visitor<Integer> eval = new Visitor<>() {
    public Integer visitNum(int n) { return n; }
    public Integer visitAdd(Expr a, Expr b) {
        return a.accept(this) + b.accept(this);
    }
};
Expr e = new Add(new Num(2), new Add(new Num(3), new Num(4)));
System.out.println(e.accept(eval));

// OUTPUT:
// 9`],
        [`Mistakes: expecting overload resolution at run time (it uses the static type), overriding with a different parameter type (becomes an overload), narrowing access, hiding static methods, and relying on field polymorphism. Always use @Override.`,
            r`class Animal { void speak(Animal a) { System.out.println("animal"); } }
class Dog extends Animal {
    void speak(Dog d) { System.out.println("dog"); }  // overload, not override
}
Animal a = new Dog();
a.speak(new Dog());

// OUTPUT:
// animal`],
        [`Monomorphic and bimorphic call sites are inlined with a type guard; megamorphic ones fall back to vtable calls. In hot paths with many types, consider a switch on a type tag or sealed pattern matching.`,
            r`// -XX:+PrintCompilation -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining
//   @ 8 Shape::area (bimorphic)   inline
//   @ 8 Shape::area (megamorphic) virtual call

// OUTPUT:
// the JIT log shows how many receiver types were observed`],
        [`Real-world: a payment service chooses a gateway implementation at run time (strategy), and a plugin system loads implementations with <code>ServiceLoader</code>.`,
            r`interface PaymentGateway { String name(); void pay(long cents); }
ServiceLoader<PaymentGateway> loader = ServiceLoader.load(PaymentGateway.class);
for (PaymentGateway g : loader) System.out.println("found " + g.name());

// OUTPUT: (depends on META-INF/services)
// found stripe`]
    )
};
