import { Topic } from '../coreJava';

export const enumsInJava: Topic = {
    id: 'enums-in-java',
    name: 'Enums in Java',

    beginner: [
        {
            content: `<h4>What is an Enum?</h4>
An <b>enum</b> (enumeration) is a special Java type used to define a <b>fixed set of named constants</b>.<br>
• Declared with the <code>enum</code> keyword instead of <code>class</code>.<br>
• Every enum implicitly extends <code>java.lang.Enum</code>, so it cannot extend any other class (Java has no multiple inheritance of classes).<br>
• It exists so a variable can only ever hold <b>one of a known, finite set of values</b> - the compiler enforces this, unlike plain integers or strings.<br>`,
            codeExamples: [
                `public class Test {

    enum Day {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }

    public static void main(String[] args) {
        Day today = Day.MONDAY;
        System.out.println(today);
    }
}
// OUTPUT:
// MONDAY`
            ]
        },
        {
            content: `<h4>Enum vs int Constants - Why Not Just Use int?</h4>
Before enums existed (pre-Java 5), developers used <code>int</code> or <code>String</code> constants to represent a fixed set of values. Enums fix several real problems with that approach:<br><br>
• <b>Type safety</b>: a method that takes a <code>Day</code> cannot accidentally be passed a random int like <code>7</code> or <code>-1</code> - the compiler rejects it.<br>
• <b>No invalid values</b>: with int constants, <code>int day = 999;</code> compiles fine even though it's meaningless; with an enum, only the declared constants exist.<br>
• <b>Readability</b>: <code>Day.MONDAY</code> is self-documenting; <code>1</code> is not.<br>`,
            codeExamples: [
                `public class IntConstantsProblem {
    static final int MONDAY = 0;
    static final int TUESDAY = 1;

    static void printDay(int day) {
        System.out.println("Day code: " + day);
    }

    public static void main(String[] args) {
        printDay(MONDAY);
        printDay(999);   // compiles fine, but 999 is meaningless - no safety at all
    }
}
// OUTPUT:
// Day code: 0
// Day code: 999`
            ]
        },
        {
            content: `<h4>Enums Can Have Fields, Constructors, and Methods</h4>
An enum is not just a list of names - it is a full class. Each constant can carry data with it, set through a <b>private constructor</b> (enum constructors are implicitly private; they cannot be called with <code>new</code> from outside).<br>`,
            codeExamples: [
                `public class Test {

    enum Planet {
        MERCURY(3.3e23, 2.4e6),
        EARTH(5.9e24, 6.4e6);

        private final double mass;   // kg
        private final double radius; // meters

        Planet(double mass, double radius) {
            this.mass = mass;
            this.radius = radius;
        }

        double surfaceGravity() {
            final double G = 6.67300E-11;
            return G * mass / (radius * radius);
        }
    }

    public static void main(String[] args) {
        System.out.printf("Earth gravity: %.2f%n", Planet.EARTH.surfaceGravity());
    }
}
// OUTPUT:
// Earth gravity: 9.61`
            ]
        },
        {
            content: `<h4>Built-in Methods: values(), valueOf(), ordinal(), name()</h4>
Every enum automatically gets these methods for free - you never write them yourself:<br><br>
• <code>values()</code> - returns an array of all constants, in declaration order.<br>
• <code>valueOf(String)</code> - converts an exact-matching String back into the enum constant; throws <code>IllegalArgumentException</code> if there's no match.<br>
• <code>ordinal()</code> - returns the constant's position (0-based) in the declaration order.<br>
• <code>name()</code> - returns the constant's exact declared name as a String.<br>`,
            codeExamples: [
                `public class Test {

    enum Day { MONDAY, TUESDAY, WEDNESDAY }

    public static void main(String[] args) {
        for (Day d : Day.values()) {
            System.out.println(d.name() + " -> ordinal " + d.ordinal());
        }

        Day parsed = Day.valueOf("TUESDAY");
        System.out.println("Parsed: " + parsed);

        try {
            Day.valueOf("FUNDAY");
        } catch (IllegalArgumentException e) {
            System.out.println("No such constant: FUNDAY");
        }
    }
}
// OUTPUT:
// MONDAY -> ordinal 0
// TUESDAY -> ordinal 1
// WEDNESDAY -> ordinal 2
// Parsed: TUESDAY
// No such constant: FUNDAY`
            ]
        },
        {
            content: `<h4>Enums in switch Statements</h4>
Enums work naturally with <code>switch</code> - you use the bare constant name (no <code>Day.</code> prefix) inside each <code>case</code>, since the switch already knows the type from the variable being switched on.<br>`,
            codeExamples: [
                `public class Test {

    enum Day { MONDAY, SATURDAY, SUNDAY }

    static String kind(Day d) {
        switch (d) {
            case SATURDAY:
            case SUNDAY:
                return "Weekend";
            default:
                return "Weekday";
        }
    }

    public static void main(String[] args) {
        System.out.println(kind(Day.MONDAY));
        System.out.println(kind(Day.SUNDAY));
    }
}
// OUTPUT:
// Weekday
// Weekend`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Constant-Specific Class Bodies (Per-Constant Method Overrides)</h3>
An enum can declare an <b>abstract method</b>, and each constant is then required to supply its <b>own implementation</b> in a constant-specific class body. Internally, each such constant becomes an anonymous subclass of the enum.<br>`,
            codeExamples: [
                `public class Test {

    enum Operation {
        ADD {
            public int apply(int a, int b) { return a + b; }
        },
        SUBTRACT {
            public int apply(int a, int b) { return a - b; }
        },
        MULTIPLY {
            public int apply(int a, int b) { return a * b; }
        };

        public abstract int apply(int a, int b);
    }

    public static void main(String[] args) {
        for (Operation op : Operation.values()) {
            System.out.println(op + "(4, 2) = " + op.apply(4, 2));
        }
    }
}
// OUTPUT:
// ADD(4, 2) = 6
// SUBTRACT(4, 2) = 2
// MULTIPLY(4, 2) = 8`
            ]
        },
        {
            content: `<h3>Enums Implementing Interfaces</h3>
An enum <b>cannot extend a class</b> (it already implicitly extends <code>java.lang.Enum</code>), but it <b>can implement one or more interfaces</b> - a common way to give a fixed set of constants a shared, polymorphic contract.<br>`,
            codeExamples: [
                `public class Test {

    interface Greetable {
        String greet();
    }

    enum Language implements Greetable {
        ENGLISH { public String greet() { return "Hello"; } },
        FRENCH  { public String greet() { return "Bonjour"; } };
    }

    public static void main(String[] args) {
        Greetable g = Language.FRENCH;
        System.out.println(g.greet());
    }
}
// OUTPUT:
// Bonjour`
            ]
        },
        {
            content: `<h3>Why Enum Constants Are Inherently Singletons</h3>
Each enum constant is created exactly <b>once</b>, when the enum class is first loaded by the JVM - there is no way to call <code>new Day()</code> from outside (the constructor is implicitly private), and the constants are <code>public static final</code>. This makes every enum constant a guaranteed, thread-safe singleton, which is why <b>Effective Java</b> recommends a single-element enum as the best way to implement the Singleton pattern.<br>`,
            codeExamples: [
                `public class Test {

    enum Singleton {
        INSTANCE;
        int counter = 0;
        void increment() { counter++; }
    }

    public static void main(String[] args) {
        Singleton.INSTANCE.increment();
        Singleton.INSTANCE.increment();
        System.out.println(Singleton.INSTANCE.counter);
        System.out.println(Singleton.INSTANCE == Singleton.INSTANCE); // always the same object
    }
}
// OUTPUT:
// 2
// true`
            ]
        },
        {
            content: `<h3>EnumMap and EnumSet - Purpose-Built Collections</h3>
Because enum constants have a known, fixed <code>ordinal()</code>, the JDK provides specialized collections that are much faster and more memory-efficient than <code>HashMap</code>/<code>HashSet</code> for enum keys - internally backed by an array indexed by ordinal, not hashing.<br>
• <code>EnumMap&lt;K extends Enum&lt;K&gt;, V&gt;</code> - a Map keyed by an enum, iterates in natural (declaration) order.<br>
• <code>EnumSet&lt;E extends Enum&lt;E&gt;&gt;</code> - a Set of enum values, represented internally as a bit vector.<br>`,
            codeExamples: [
                `import java.util.EnumMap;
import java.util.EnumSet;

public class Test {

    enum Day { MONDAY, TUESDAY, WEDNESDAY }

    public static void main(String[] args) {
        EnumMap<Day, String> schedule = new EnumMap<>(Day.class);
        schedule.put(Day.WEDNESDAY, "Team sync");
        schedule.put(Day.MONDAY, "Planning");
        System.out.println(schedule); // prints in enum declaration order, not insertion order

        EnumSet<Day> weekStart = EnumSet.of(Day.MONDAY, Day.TUESDAY);
        System.out.println(weekStart.contains(Day.MONDAY));
    }
}
// OUTPUT:
// {MONDAY=Planning, WEDNESDAY=Team sync}
// true`
            ]
        },
        {
            content: `<h3>Common Traps</h3>
• <b>An enum cannot extend another class</b> - it already extends <code>java.lang.Enum</code> implicitly, and Java has no multiple class inheritance.<br>
• <b>Comparing enum constants with <code>==</code> is safe and preferred</b> over <code>.equals()</code> - since every constant is a singleton, reference equality is always correct and slightly faster; it also avoids a NullPointerException if the left side happens to be null (<code>Day.MONDAY == d</code> is null-safe, <code>d.equals(Day.MONDAY)</code> is not).<br>
• <b>ordinal() is fragile</b> - it reflects declaration order, so inserting a new constant in the middle silently shifts every ordinal after it. Never persist an <code>ordinal()</code> value to a database; store the <code>name()</code> string instead.<br>
• <code>valueOf()</code> is <b>case-sensitive</b> and throws <code>IllegalArgumentException</code> on any mismatch, including whitespace.<br>`,
            codeExamples: [
                `public class OrdinalTrap {

    enum Status { ACTIVE, INACTIVE } // ACTIVE=0, INACTIVE=1

    // Later someone inserts PENDING before INACTIVE:
    // enum Status { ACTIVE, PENDING, INACTIVE } // now INACTIVE=2, not 1 anymore!
    // Any code that stored ordinal() = 1 to mean INACTIVE is now silently wrong.

    public static void main(String[] args) {
        Status s = Status.INACTIVE;
        System.out.println(s.ordinal()); // fragile - avoid persisting this
        System.out.println(s.name());    // safe - persist this instead
    }
}
// OUTPUT:
// 1
// INACTIVE`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can an enum extend a class?</td><td>No - every enum implicitly extends java.lang.Enum, and Java doesn't allow multiple class inheritance</td></tr>
<tr class='text-center'><td>Can an enum implement an interface?</td><td>Yes - one or more interfaces, and constants can even provide per-constant overrides via constant-specific class bodies</td></tr>
<tr class='text-center'><td>Why is == safe for comparing enum constants?</td><td>Each constant is a singleton created once at class-load time, so reference equality is always correct and also null-safe when the constant is on the left side</td></tr>
<tr class='text-center'><td>Why shouldn't you persist ordinal() to a database?</td><td>ordinal() reflects declaration order and silently changes if a new constant is inserted in the middle - use name() instead</td></tr>
<tr class='text-center'><td>How does Effective Java recommend implementing a Singleton?</td><td>As a single-element enum - the JVM guarantees exactly one instance, and it's serialization-safe and reflection-attack-resistant by construction</td></tr>
<tr class='text-center'><td>What's the difference between EnumMap/EnumSet and HashMap/HashSet for enum keys?</td><td>EnumMap/EnumSet are backed by arrays indexed by ordinal() (no hashing needed), making them faster and more memory-efficient, and they iterate in natural declaration order</td></tr>
</table>`
        }
    ]
};
