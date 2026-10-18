import { Topic } from '../coreJava';

export const patternMatchingForInstanceof: Topic = {
                        id: 'pattern-matching',
                        name: 'Pattern Matching for instanceof',
                        beginner: [
                            {
                                content: `<h3>Pattern Matching for instanceof</h3>
<h4>Introduction</h4>
<p>Java 16 finalized (JEP 394, after previews in Java 14 and 15) <strong>Pattern Matching for instanceof</strong>. It removes the explicit cast after an <code>instanceof</code> check. The type test and the cast become one expression.</p>

<h4>Key Features</h4>
<ul>
<li>Combines the <code>instanceof</code> check and the cast into one step</li>
<li>Adds a <strong>pattern variable</strong> that is in scope when the pattern matches</li>
<li>Less boilerplate and fewer <code>ClassCastException</code> bugs</li>
<li>The scope of the pattern variable follows the flow of the program</li>
</ul>

<h4>Before vs After</h4>
<ul>
<li><strong>Before:</strong> <code>if (obj instanceof String) { String s = (String) obj; ... }</code></li>
<li><strong>After:</strong> <code>if (obj instanceof String s) { ... }</code> - <code>s</code> is already cast.</li>
</ul>`,
                                codeExamples: [
`// Pattern Matching for instanceof — Basic Usage
public class PatternMatchingBasic {
    // OLD way (before Java 16)
    static void oldApproach(Object obj) {
        if (obj instanceof String) {
            String s = (String) obj;  // explicit cast needed
            System.out.println("String of length: " + s.length());
        } else if (obj instanceof Integer) {
            Integer i = (Integer) obj;  // explicit cast needed
            System.out.println("Integer value: " + i);
        }
    }

    // NEW way (Java 16+)
    static void newApproach(Object obj) {
        if (obj instanceof String s) {  // pattern variable 's'
            System.out.println("String of length: " + s.length());
        } else if (obj instanceof Integer i) {  // pattern variable 'i'
            System.out.println("Integer value: " + i);
        } else if (obj instanceof Double d) {
            System.out.println("Double value: " + d);
        } else {
            System.out.println("Unknown type: " + obj.getClass().getSimpleName());
        }
    }

    public static void main(String[] args) {
        newApproach("Hello Java");   // String of length: 10
        newApproach(42);             // Integer value: 42
        newApproach(3.14);           // Double value: 3.14
    }
}

// OUTPUT:
// String of length: 10
// Integer value: 42
// Double value: 3.14`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Pattern Matching for instanceof — Intermediate Usage</h3>
<h4>Scope of Pattern Variables</h4>
<p>Pattern variables follow <strong>flow scoping</strong>. They are in scope only where the compiler can prove the pattern matched. This includes combined conditions with <strong>&amp;&amp;</strong>.</p>

<h4>Using with Logical Operators</h4>
<ul>
<li><strong>&amp;&amp;</strong> - the variable is in scope in the right operand and in the if body</li>
<li><strong>||</strong> - the variable is NOT in scope on the right side of a positive test (the match is not guaranteed)</li>
<li><strong>!</strong> - the variable is in scope in the else branch (and after an early return)</li>
</ul>

<h4>Simplifying equals() Method</h4>
<p>Pattern matching makes the common <strong>equals()</strong> override much shorter.</p>

<h4>Best Practices</h4>
<ul>
<li>Use pattern matching to simplify type-checking code</li>
<li>Combine with <code>&amp;&amp;</code> for extra conditions</li>
<li>Use it in <code>equals()</code> methods for cleaner code</li>
<li>Avoid deep nesting that hurts readability</li>
</ul>`,
                                codeExamples: [
`// Pattern Matching — Intermediate patterns
public class PatternMatchingIntermediate {

    // Simplified equals() method
    record Point(int x, int y) {
        @Override
        public boolean equals(Object obj) {
            // Old way:
            // if (!(obj instanceof Point)) return false;
            // Point other = (Point) obj;
            // return x == other.x && y == other.y;

            // New way:
            return obj instanceof Point p && x == p.x && y == p.y;
        }
    }

    // Flow scoping with logical operators
    static void flowScoping(Object obj) {
        // Pattern variable in scope with &&
        if (obj instanceof String s && s.length() > 5) {
            System.out.println("Long string: " + s);
        }

        // Negation — variable in scope in else branch
        if (!(obj instanceof String s)) {
            System.out.println("Not a string");
        } else {
            // s is in scope here!
            System.out.println("String: " + s);
        }
    }

    // Guard conditions
    static String categorize(Object obj) {
        if (obj instanceof Integer i && i > 0) return "Positive integer: " + i;
        if (obj instanceof Integer i && i < 0) return "Negative integer: " + i;
        if (obj instanceof Integer i) return "Zero";
        if (obj instanceof String s && !s.isBlank()) return "Non-blank string: " + s;
        if (obj instanceof String s) return "Blank string";
        return "Other: " + obj;
    }

    public static void main(String[] args) {
        System.out.println(categorize(42));        // Positive integer: 42
        System.out.println(categorize(-5));        // Negative integer: -5
        System.out.println(categorize("Hi"));      // Non-blank string: Hi
        System.out.println(categorize("  "));      // Blank string

        flowScoping("Hello World");  // Long string: Hello World
        flowScoping(123);            // Not a string
    }
}

// OUTPUT:
// Positive integer: 42
// Negative integer: -5
// Non-blank string: Hi
// Blank string
// Long string: Hello World
// String: Hello World
// Not a string`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Pattern Matching for instanceof — Expert Deep Dive</h3>
<h4>How It Works Internally</h4>
<ul>
<li>The compiler generates essentially the same bytecode as a manual <code>instanceof</code> plus cast</li>
<li>Pattern variables are ordinary local variables in the bytecode</li>
<li>Flow scoping is a compile-time analysis only; there is no runtime overhead</li>
<li>The pattern variable is an ordinary NON-final local variable. JEP 394 dropped the implicit finality of the earlier previews, so it can be reassigned (this is discouraged)</li>
</ul>

<h4>Evolution of Pattern Matching in Java</h4>
<ul>
<li>Java 16: pattern matching for <code>instanceof</code> (JEP 394)</li>
<li>Java 17: sealed classes (JEP 409), which later allow exhaustive patterns</li>
<li>Java 21: pattern matching for <code>switch</code> (JEP 441) and record patterns (JEP 440)</li>
<li>Future: more kinds of deconstruction patterns</li>
</ul>

<h4>Interview Questions</h4>
<ul>
<li><strong>Q: What is flow scoping?</strong> The compiler works out where a pattern variable is definitely matched, and makes it available only there.</li>
<li><strong>Q: Can pattern variables be reassigned?</strong> Yes. They are not implicitly final.</li>
<li><strong>Q: Is there a performance difference?</strong> No. The generated code is the same as <code>instanceof</code> plus a cast.</li>
<li><strong>Q: How does it work with null?</strong> <code>instanceof</code> is always false for null, so the variable is never bound for null.</li>
</ul>`,
                                codeExamples: [
`// Expert pattern matching scenarios
import java.util.List;

public class PatternMatchingExpert {

    // Complex type hierarchy processing
    sealed interface Vehicle permits Car, Truck, Motorcycle {}
    record Car(String make, int doors) implements Vehicle {}
    record Truck(String make, double payload) implements Vehicle {}
    record Motorcycle(String make, boolean hasSidecar) implements Vehicle {}

    // Pattern matching with sealed types
    static String describeVehicle(Vehicle v) {
        if (v instanceof Car c && c.doors() > 2) {
            return c.make() + " sedan with " + c.doors() + " doors";
        } else if (v instanceof Car c) {
            return c.make() + " coupe";
        } else if (v instanceof Truck t && t.payload() > 5.0) {
            return "Heavy " + t.make() + " truck (" + t.payload() + " tons)";
        } else if (v instanceof Truck t) {
            return "Light " + t.make() + " truck";
        } else if (v instanceof Motorcycle m && m.hasSidecar()) {
            return m.make() + " motorcycle with sidecar";
        } else if (v instanceof Motorcycle m) {
            return m.make() + " motorcycle";
        }
        return "Unknown vehicle";
    }

    // Pattern matching as method dispatch replacement
    static double calculateTax(Object item) {
        if (item instanceof Car c) return c.doors() * 100.0;
        if (item instanceof Truck t) return t.payload() * 200.0;
        if (item instanceof String s) return s.length() * 0.5;
        if (item instanceof Number n) return n.doubleValue() * 0.1;
        throw new IllegalArgumentException("Cannot tax: " + item);
    }

    public static void main(String[] args) {
        var vehicles = List.of(
            new Car("Toyota", 4),
            new Car("Porsche", 2),
            new Truck("Volvo", 8.5),
            new Motorcycle("Harley", true)
        );

        vehicles.forEach(v -> System.out.println(describeVehicle(v)));

        System.out.println("\\nTax calculations:");
        System.out.println("Car tax: $" + calculateTax(new Car("BMW", 4)));
        System.out.println("Truck tax: $" + calculateTax(new Truck("MAN", 10.0)));
    }
}

// OUTPUT:
// Toyota sedan with 4 doors
// Porsche coupe
// Heavy Volvo truck (8.5 tons)
// Harley motorcycle with sidecar
//
// Tax calculations:
// Car tax: $400.0
// Truck tax: $2000.0`
                                ]
                            }
                        ]
};
