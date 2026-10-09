import { Topic } from '../coreJava';

export const records: Topic = {
                        id: 'records',
                        name: 'Records',
                        beginner: [
                            {
                                content: `<h3>Records in Java</h3>
<h4>Introduction</h4>
<p><strong>Records</strong> were a preview in Java 14 and final in Java 16 (so they are in the Java 17 LTS). A record is a short way to declare a class that only holds data. The data is shallowly immutable. The compiler writes the constructor, accessors, <code>equals()</code>, <code>hashCode()</code> and <code>toString()</code> for you.</p>

<h4>Key Features</h4>
<ul>
<li>Compact syntax for data carrier classes</li>
<li>Auto-generated: canonical constructor, accessors, <code>equals()</code>, <code>hashCode()</code>, <code>toString()</code></li>
<li>Implicitly <strong>final</strong>, so a record cannot be extended</li>
<li>Implicitly extends <strong>java.lang.Record</strong></li>
<li>Components (fields) are implicitly <strong>private final</strong></li>
<li>Immutable by default, but only shallowly (see the Mid-Level notes)</li>
</ul>

<h4>Basic Syntax</h4>
<p><code>record ClassName(Type field1, Type field2) {}</code></p>
<p>This one line gives you a full class with constructor, accessors, <code>equals</code>, <code>hashCode</code> and <code>toString</code>.</p>`,
                                codeExamples: [
`// Records — Basic Usage
// A record replaces a full POJO class
record Person(String name, int age) {}

// The above is equivalent to writing:
// public final class Person {
//     private final String name;
//     private final int age;
//     public Person(String name, int age) { ... }
//     public String name() { return name; }
//     public int age() { return age; }
//     public boolean equals(Object o) { ... }
//     public int hashCode() { ... }
//     public String toString() { ... }
// }

record Point(double x, double y) {
    // You can add methods
    double distanceTo(Point other) {
        return Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
    }
}

public class RecordBasic {
    public static void main(String[] args) {
        Person p1 = new Person("Alice", 30);
        Person p2 = new Person("Alice", 30);

        // Auto-generated accessor methods (not getXxx!)
        System.out.println(p1.name());  // Alice
        System.out.println(p1.age());   // 30

        // Auto-generated toString()
        System.out.println(p1);  // Person[name=Alice, age=30]

        // Auto-generated equals() — value-based
        System.out.println(p1.equals(p2));  // true

        // Auto-generated hashCode()
        System.out.println(p1.hashCode() == p2.hashCode());  // true

        // Custom method
        Point a = new Point(0, 0);
        Point b = new Point(3, 4);
        System.out.println("Distance: " + a.distanceTo(b));  // 5.0
    }
}

// OUTPUT:
// Alice
// 30
// Person[name=Alice, age=30]
// true
// true
// Distance: 5.0`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Records — Intermediate Usage</h3>
<h4>Compact Constructors</h4>
<p>Records support <strong>compact constructors</strong> for validation. You do not write the parameter list or the field assignments. The fields are assigned automatically after the constructor body.</p>

<h4>Custom Constructors</h4>
<p>You can add other (non-canonical) constructors. Each one must call <code>this(...)</code> to reach the canonical constructor.</p>

<h4>Records with Interfaces</h4>
<p>Records can implement interfaces. This makes them a good fit for sealed hierarchies.</p>

<h4>Local Records</h4>
<p>A record can be declared inside a method to group temporary data.</p>

<h4>Best Practices</h4>
<ul>
<li>Use records for DTOs and value objects</li>
<li>Use compact constructors for validation</li>
<li>Combine records with sealed interfaces</li>
<li>Prefer records over Lombok <code>@Data</code> for simple data classes</li>
</ul>`,
                                codeExamples: [
`// Records — Intermediate Usage
import java.util.List;
import java.util.stream.Collectors;

// Record with compact constructor for validation
record Range(int min, int max) {
    Range {  // Compact constructor — no parameters needed
        if (min > max) {
            throw new IllegalArgumentException("min must be <= max");
        }
    }
}

// Record implementing interface
sealed interface Shape permits CircleR, RectangleR {
    double area();
}

record CircleR(double radius) implements Shape {
    CircleR {
        if (radius < 0) throw new IllegalArgumentException("Negative radius");
    }

    public double area() { return Math.PI * radius * radius; }
}

record RectangleR(double width, double height) implements Shape {
    public double area() { return width * height; }
}

public class RecordIntermediate {
    public static void main(String[] args) {
        // Compact constructor validation
        Range valid = new Range(1, 10);
        System.out.println(valid);  // Range[min=1, max=10]
        // Range invalid = new Range(10, 1); // throws IllegalArgumentException

        // Records with sealed interfaces
        List<Shape> shapes = List.of(
            new CircleR(5),
            new RectangleR(4, 6),
            new CircleR(3)
        );

        double totalArea = shapes.stream()
            .mapToDouble(Shape::area)
            .sum();
        System.out.println("Total area: " + totalArea);

        // Local record inside a method
        record NameAge(String name, int age) {}

        var people = List.of(
            new NameAge("Alice", 30),
            new NameAge("Bob", 25),
            new NameAge("Charlie", 35)
        );

        people.stream()
            .sorted((a, b) -> Integer.compare(a.age(), b.age()))
            .forEach(System.out::println);
    }
}

// OUTPUT:
// Range[min=1, max=10]
// Total area: 130.81415022205297
// NameAge[name=Bob, age=25]
// NameAge[name=Alice, age=30]
// NameAge[name=Charlie, age=35]`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Records — Expert Deep Dive</h3>
<h4>Internal Implementation</h4>
<ul>
<li>Records compile to final classes extending <strong>java.lang.Record</strong></li>
<li>The compiler generates <code>equals()</code>, <code>hashCode()</code> and <code>toString()</code> with <strong>invokedynamic</strong> (the <code>ObjectMethods</code> bootstrap)</li>
<li>Accessors simply return the field</li>
<li>A record is serializable only if it implements <code>Serializable</code>. Deserialization always calls the canonical constructor, so your validation runs again</li>
</ul>

<h4>Limitations of Records</h4>
<ul>
<li>Cannot extend other classes (they already extend <code>Record</code>)</li>
<li>Cannot declare instance fields beyond the components</li>
<li>Components are final, so there are no setters</li>
<li>Cannot be abstract</li>
<li>Cannot declare native methods</li>
</ul>

<h4>Interview Questions</h4>
<ul>
<li><strong>Q: Can records be mutable?</strong> The fields cannot be reassigned, but a mutable component (for example a <code>List</code>) can still change. Use defensive copies.</li>
<li><strong>Q: Can records extend classes?</strong> No. They implicitly extend <code>java.lang.Record</code>.</li>
<li><strong>Q: How is equals() generated?</strong> With invokedynamic and the <code>ObjectMethods</code> bootstrap, comparing all components.</li>
<li><strong>Q: Are records suitable for JPA entities?</strong> No. JPA needs a no-arg constructor and mutable fields. Records are best for DTOs.</li>
</ul>`,
                                codeExamples: [
`// Expert Record patterns
import java.util.List;
import java.util.Collections;

// Defensive copy pattern for mutable components
record Team(String name, List<String> members) {
    // Compact constructor with defensive copy
    Team {
        members = List.copyOf(members); // unmodifiable copy
    }
}

// Record with generic types
record Pair<A, B>(A first, B second) {
    static <A, B> Pair<A, B> of(A first, B second) {
        return new Pair<>(first, second);
    }
}

// Records and serialization
record SerializablePoint(double x, double y) implements java.io.Serializable {
    // Deserialization uses the canonical constructor,
    // so validation in it cannot be bypassed
}

public class RecordExpert {
    public static void main(String[] args) {
        // Defensive copy prevents mutation
        var members = new java.util.ArrayList<>(List.of("Alice", "Bob"));
        Team team = new Team("Dev", members);
        members.add("Charlie"); // original list modified
        System.out.println(team.members()); // [Alice, Bob] — record's copy is safe

        // Generic records
        var pair = Pair.of("Answer", 42);
        System.out.println(pair); // Pair[first=Answer, second=42]

        // Reflection on records
        Class<?> clazz = Team.class;
        System.out.println("Is record: " + clazz.isRecord()); // true

        var components = clazz.getRecordComponents();
        for (var comp : components) {
            System.out.println("Component: " + comp.getName()
                + " Type: " + comp.getType().getSimpleName());
        }

        // Record patterns - final (non-preview) in Java 21 via JEP 440
        // switch (shape) {
        //     case CircleR(var r) -> System.out.println("Radius: " + r);
        //     case RectangleR(var w, var h) -> System.out.println(w + "x" + h);
        // }
    }
}

// OUTPUT:
// [Alice, Bob]
// Pair[first=Answer, second=42]
// Is record: true
// Component: name Type: String
// Component: members Type: List`
                                ]
                            }
                        ]
};
