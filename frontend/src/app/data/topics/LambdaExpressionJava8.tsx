import { Topic } from '../coreJava';

export const lambdaExpressionJava8: Topic = {
    id: 'java8-lambda-expression',
    name: 'Lambda Expression',
    beginner: [
        {
            content: `<h3>Lambda Expression</h3>
<p>A lambda expression, added in Java 8, is a short way to write a small piece of behavior. It brings functional programming to Java and replaces most anonymous inner classes.</p>

<h4>Key Features</h4>
<ul>
<li><b>Simple syntax:</b> less code than an anonymous class.</li>
<li><b>Functional interface:</b> a lambda implements an interface that has exactly one abstract method.</li>
<li><b>Two forms:</b> <code>(parameters) -&gt; expression</code> or <code>(parameters) -&gt; { statements; }</code>.</li>
</ul>

<h4>1. Using a Functional Interface</h4>
<p>First define a functional interface:</p>
<pre><code>@FunctionalInterface
interface MyFunctionalInterface {
    void sayHello();
}</code></pre>
<p>Now implement it with a lambda:</p>
<pre><code>public class LambdaExample {
    public static void main(String[] args) {
        MyFunctionalInterface greeting =
            () -&gt; System.out.println("Hello, World!");
        greeting.sayHello();   // prints Hello, World!
    }
}</code></pre>

<h4>2. Parameters and Return Value</h4>
<pre><code>@FunctionalInterface
interface Addable {
    int add(int a, int b);
}

public class LambdaWithParameters {
    public static void main(String[] args) {
        Addable adder = (a, b) -&gt; a + b;
        System.out.println("Sum: " + adder.add(10, 20));
    }
}
// OUTPUT: Sum: 30</code></pre>

<h4>Benefits</h4>
<ul>
<li><b>Conciseness:</b> less boilerplate code.</li>
<li><b>Readability:</b> it is clear what action is performed.</li>
<li><b>Functional style:</b> code becomes modular, flexible and easier to reason about.</li>
<li>A lambda can be passed as an argument, or used wherever an object of a functional interface is expected.</li>
</ul>

<h4>Common Use Cases</h4>
<p><b>Collections and Streams:</b> filtering, mapping and reducing.</p>
<pre><code>import java.util.Arrays;
import java.util.List;

public class StreamExample {
    public static void main(String[] args) {
        List&lt;String&gt; names =
            Arrays.asList("Sheru", "Pankaj", "Dheeraj", "Udgir");
        names.stream()
             .filter(name -&gt; name.startsWith("S"))
             .forEach(System.out::println);
    }
}
// OUTPUT: Sheru</code></pre>

<p><b>Event handling:</b> short handlers in GUI programs.</p>
<pre><code>import javax.swing.JButton;
import javax.swing.JFrame;

public class LambdaEventHandling {
    public static void main(String[] args) {
        JFrame frame = new JFrame("Lambda Example");
        JButton button = new JButton("Click Me");
        button.addActionListener(
            e -&gt; System.out.println("Button clicked!"));
        frame.add(button);
        frame.setSize(200, 200);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setVisible(true);
    }
}
// OUTPUT (after each click): Button clicked!</code></pre>

<h4>Lambda vs Anonymous Inner Class</h4>
<ul>
<li>An anonymous class can extend a concrete or abstract class, or implement an interface with any number of methods.</li>
<li>A lambda can implement only a <b>functional interface</b> (one abstract method).</li>
<li>So a lambda can replace an anonymous class only when that class implements a functional interface.</li>
<li>An anonymous class can declare instance variables. A lambda cannot: variables inside it are plain <b>local variables</b>.</li>
<li>In an anonymous class, <code>this</code> is the anonymous object itself.</li>
<li>In a lambda, <code>this</code> is the <b>enclosing class</b> object in which the lambda is written.</li>
</ul>

<h4>Syntax Parts</h4>
<p>General form: <code>(argument-list) -&gt; { body }</code></p>
<ul>
<li><b>Argument list:</b> can be empty or have one or more parameters.</li>
<li><b>Arrow token:</b> <code>-&gt;</code> links the argument list to the body.</li>
<li><b>Body:</b> an expression or a block of statements.</li>
</ul>
<pre><code>() -&gt; { /* no parameter */ }
(p1) -&gt; { /* one parameter */ }
(p1, p2) -&gt; { /* two parameters */ }</code></pre>
`,
            codeExamples: [
                `Example: 01
public interface Addition {
    int add(int a, int b);
}

public class Main {
    public static void main(String[] args) {
        // Two parameters, types inferred
        Addition addition = (a, b) -> (a + b);
        System.out.println(addition.add(10, 20));
        // Two parameters with explicit types
        Addition addition2 = (int a, int b) -> (a + b);
        System.out.println(addition2.add(100, 200));
    }
}
// OUTPUT:
// 30
// 300
`,
                `Example: 02
@FunctionalInterface
interface GreetingService {
    void sayMessage(String message);
}

public class LambdaExample {
    public static void main(String[] args) {
        // One parameter: parentheses are optional
        GreetingService greetService =
            message -> System.out.println("Hello, " + message);
        greetService.sayMessage("Sheru");
        greetService.sayMessage("Pankaj");
        greetService.sayMessage("Dheeraj");
    }
}
// OUTPUT:
// Hello, Sheru
// Hello, Pankaj
// Hello, Dheeraj`
            ]
        }
    ],
    intermediate: [
        {
            content: `<h3>Comparator.comparing() - Sorting Objects the Java 8 Way</h3>
Before Java 8, sorting a list of objects meant writing a full anonymous Comparator with an overridden compare() method. Java 8 added static/default methods on the Comparator interface - comparing(), thenComparing(), reversed() - so sorting logic can be built with method references and lambdas in a single line.<br>`,
            codeExamples: [
                `import java.util.*;

public class ComparatorComparingDemo {
    static class Employee {
        String name; int age; double salary;
        Employee(String name, int age, double salary) {
            this.name = name;
            this.age = age;
            this.salary = salary;
        }
        public String toString() {
            return name + "(" + age + ", " + salary + ")";
        }
    }

    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee("Pankaj", 28, 55000),
            new Employee("Sheru", 32, 48000),
            new Employee("Dheeraj", 25, 62000)
        ));

        // Sort by salary ascending using a lambda key
        employees.sort(Comparator.comparing(e -> e.salary));
        System.out.println("By salary: " + employees);

        // Sort by age descending
        employees.sort(
            Comparator.comparingInt((Employee e) -> e.age).reversed());
        System.out.println("By age desc: " + employees);
    }
}
// OUTPUT:
// By salary: [Sheru(32, 48000.0), Pankaj(28, 55000.0),
//   Dheeraj(25, 62000.0)]
// By age desc: [Sheru(32, 48000.0), Pankaj(28, 55000.0),
//   Dheeraj(25, 62000.0)]`
            ]
        },
        {
            content: `<h3>Comparator.thenComparing() - Multi-Level Sorting</h3>
thenComparing() lets you chain a secondary (and tertiary...) sort key that only kicks in when the primary key produces a tie - replacing the old nested if/else comparator logic.<br>`,
            codeExamples: [
                `import java.util.*;

public class ThenComparingDemo {
    static class Student {
        String name; int marks;
        Student(String name, int marks) { this.name = name; this.marks = marks; }
        public String toString() { return name + "=" + marks; }
    }

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>(List.of(
            new Student("Udgir", 90),
            new Student("Pune", 90),
            new Student("Latur", 85)
        ));

        // Primary: marks descending, Secondary: name ascending (tie-breaker)
        students.sort(
            Comparator.comparingInt((Student s) -> s.marks).reversed()
                      .thenComparing(s -> s.name)
        );
        System.out.println(students);
    }
}
// OUTPUT: [Pune=90, Udgir=90, Latur=85]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Method References - The 4 Forms</h3>
A method reference (<code>ClassOrInstance::methodName</code>) is shorthand for a lambda that does nothing but call an existing method. It only works where a lambda would already be legal (i.e. the target type is a functional interface), and the referenced method's signature must be compatible with the interface's abstract method.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Form</th><th>Syntax</th><th>Equivalent Lambda</th></tr>
<tr class='text-center'><td>1. Static method</td><td>ClassName::staticMethod</td><td>(args) -> ClassName.staticMethod(args)</td></tr>
<tr class='text-center'><td>2. Instance method of a particular object</td><td>instance::instanceMethod</td><td>(args) -> instance.instanceMethod(args)</td></tr>
<tr class='text-center'><td>3. Instance method of an arbitrary object of a type</td><td>ClassName::instanceMethod</td><td>(obj, args) -> obj.instanceMethod(args)</td></tr>
<tr class='text-center'><td>4. Constructor reference</td><td>ClassName::new</td><td>(args) -> new ClassName(args)</td></tr>
</table>`,
            codeExamples: [
                `import java.util.*;
import java.util.function.*;

public class MethodReferenceDemo {

    static class Person {
        String name;
        Person(String name) { this.name = name; }
        boolean isShortName() { return name.length() <= 5; }
        @Override public String toString() { return "Person(" + name + ")"; }
    }

    public static void main(String[] args) {
        // Form 1: Static method reference
        Function<String, Integer> parse = Integer::parseInt;
        System.out.println("Form1 static -> " + parse.apply("123"));

        // Form 2: Instance method of a particular object
        String greeting = "Hello Method Reference";
        Supplier<Integer> lenOfInstance = greeting::length;
        System.out.println("Form2 particular instance -> " + lenOfInstance.get());

        // Form 3: Instance method of an arbitrary object of a type
        Predicate<Person> shortName = Person::isShortName;
        System.out.println("Form3 arbitrary object -> " + shortName.test(new Person("Sam")));

        // Form 4: Constructor reference
        Function<String, Person> personFactory = Person::new;
        List<String> names = Arrays.asList("Sheru", "Dheeraj");
        names.stream().map(personFactory).forEach(System.out::println);
    }
}
// OUTPUT:
// Form1 static -> 123
// Form2 particular instance -> 22
// Form3 arbitrary object -> true
// Person(Sheru)
// Person(Dheeraj)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can a lambda implement any interface?</td><td>No - only a functional interface (exactly one abstract method); more methods and the compiler rejects it</td></tr>
<tr class='text-center'><td>Can a lambda declare instance variables?</td><td>No - variables inside a lambda body are always local variables; a lambda has no state of its own the way an anonymous class does</td></tr>
<tr class='text-center'><td>What does 'this' refer to inside a lambda?</td><td>The enclosing class instance - unlike an anonymous inner class, where 'this' refers to the anonymous class object itself</td></tr>
<tr class='text-center'><td>Can local variables used inside a lambda be reassigned afterward?</td><td>No - a lambda can only capture effectively final local variables (never reassigned after initialization), or it's a compile-time error</td></tr>
<tr class='text-center'><td>What is a method reference, and when can you use one?</td><td>Shorthand (Class::method) for a lambda that does nothing but call an existing method; usable anywhere a lambda with a matching signature would be legal</td></tr>
<tr class='text-center'><td>Name the 4 forms of method references</td><td>Static (Class::staticMethod), bound instance (instance::method), unbound instance (Class::instanceMethod), and constructor reference (Class::new)</td></tr>
</table>`
        }
    ]
};
