import { Topic } from '../coreJava';

export const comparableVsComparator: Topic = {
    id: 'comparable-comparator',
    name: 'Comparable vs Comparator',

    beginner: [
        {
            content: `<h4>Two Ways to Sort Custom Objects</h4>
<p>Java's <code>Collections.sort()</code> and <code>List.sort()</code> need to know how to order your objects. You use one of two interfaces:</p>
<ul>
<li><code>Comparable&lt;T&gt;</code> - the class defines its own <b>single, natural ordering</b> by implementing <code>compareTo()</code>.</li>
<li><code>Comparator&lt;T&gt;</code> - a <b>separate</b> object defines an ordering by implementing <code>compare()</code>, without touching the original class. You can write as many <code>Comparator</code>s as you need.</li>
</ul>`
        },
        {
            content: `<h4>Comparable — Natural Ordering</h4>
A class implements <code>Comparable&lt;T&gt;</code> and overrides <code>compareTo(T other)</code>, returning negative/zero/positive to mean "less than / equal to / greater than". This becomes the class's <b>one default ordering</b>.`,
            codeExamples: [
                `import java.util.*;

class Employee implements Comparable<Employee> {
    String name;
    int age;

    Employee(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public int compareTo(Employee other) {
        return this.age - other.age; // natural ordering: by age, ascending
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class ComparableDemo {
    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee("Pankaj", 30),
            new Employee("Amit", 25),
            new Employee("Rahul", 35)
        ));

        Collections.sort(employees); // uses compareTo() automatically
        System.out.println(employees);
    }
}
// OUTPUT:
// [Amit(25), Pankaj(30), Rahul(35)]`
            ]
        },
        {
            content: `<h4>Comparator — External, Multiple Orderings</h4>
A <code>Comparator&lt;T&gt;</code> is written <b>separately</b> from the class it sorts, so you can have as many different orderings as you need without modifying the original class at all.`,
            codeExamples: [
                `import java.util.*;

class Employee {
    String name;
    int age;
    Employee(String name, int age) { this.name = name; this.age = age; }
    @Override
    public String toString() { return name + "(" + age + ")"; }
}

class NameComparator implements Comparator<Employee> {
    @Override
    public int compare(Employee a, Employee b) {
        return a.name.compareTo(b.name); // order by name instead
    }
}

public class ComparatorDemo {
    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee("Pankaj", 30),
            new Employee("Amit", 25),
            new Employee("Rahul", 35)
        ));

        employees.sort(new NameComparator()); // pass the Comparator explicitly
        System.out.println(employees);
    }
}
// OUTPUT:
// [Amit(25), Pankaj(30), Rahul(35)]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Java 8+ Comparator: comparing(), reversed(), thenComparing()</h3>
Since Java 8, <code>Comparator</code> has static/default helper methods that let you build orderings from a <b>key extractor</b> lambda instead of writing a full <code>compare()</code> method by hand, chain a tie-breaker with <code>thenComparing()</code>, and flip direction with <code>reversed()</code>.<br>`,
            codeExamples: [
                `import java.util.*;

class Employee {
    String name;
    int age;
    double salary;

    Employee(String name, int age, double salary) {
        this.name = name; this.age = age; this.salary = salary;
    }

    @Override
    public String toString() {
        return name + "(age=" + age + ", salary=" + salary + ")";
    }
}

public class ComparatorChainingDemo {
    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee("Pankaj", 30, 50000),
            new Employee("Amit", 30, 60000),
            new Employee("Rahul", 25, 45000)
        ));

        // Sort by age ascending, then by salary descending for ties
        employees.sort(
            Comparator.comparingInt((Employee e) -> e.age)
                      .thenComparing(Comparator
                          .comparingDouble((Employee e) -> e.salary).reversed())
        );
        System.out.println(employees);
    }
}
// OUTPUT:
// [Rahul(age=25, salary=45000.0), Amit(age=30, salary=60000.0),
//  Pankaj(age=30, salary=50000.0)]`
            ]
        },
        {
            content: `<h3>Sorting the Same List Multiple Different Ways</h3>
Because a <code>Comparator</code> is decoupled from the class, the same <code>Employee</code> list can be re-sorted differently at different call sites, without <code>Employee</code> ever needing to change or implement <code>Comparable</code> at all.<br>`,
            codeExamples: [
                `import java.util.*;

class Employee {
    String name;
    int age;
    Employee(String name, int age) { this.name = name; this.age = age; }
    @Override
    public String toString() { return name + "(" + age + ")"; }
}

public class MultipleOrderingsDemo {
    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee("Pankaj", 30),
            new Employee("Amit", 25),
            new Employee("Rahul", 35)
        ));

        employees.sort(Comparator.comparing(e -> e.name));
        System.out.println("By name: " + employees);

        employees.sort(Comparator.comparingInt((Employee e) -> e.age).reversed());
        System.out.println("By age, descending: " + employees);
    }
}
// OUTPUT:
// By name: [Amit(25), Pankaj(30), Rahul(35)]
// By age, descending: [Rahul(35), Pankaj(30), Amit(25)]`
            ]
        },
        {
            content: `<h3>Comparable vs Comparator — Compared</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Comparable</th><th>Comparator</th></tr>
<tr class='text-center'><td>Package</td><td>java.lang</td><td>java.util</td></tr>
<tr class='text-center'><td>Method</td><td>compareTo(T other)</td><td>compare(T a, T b)</td></tr>
<tr class='text-center'><td>Implemented by</td><td>The class being sorted, itself</td><td>A separate class/lambda</td></tr>
<tr class='text-center'><td>Number of orderings</td><td>Exactly one - the "natural" ordering</td><td>As many as you want</td></tr>
<tr class='text-center'><td>Requires modifying the sorted class?</td><td>Yes - the class must implement Comparable</td><td>No - works even on classes you don't own (e.g. third-party classes)</td></tr>
<tr class='text-center'><td>Used via</td><td>Collections.sort(list) / list.sort(null)</td><td>Collections.sort(list, comparator) / list.sort(comparator)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the core difference between Comparable and Comparator?</td><td>Comparable defines a class's own single natural ordering (compareTo, in java.lang); Comparator defines an external, reusable ordering (compare, in java.util), and you can have many of them</td></tr>
<tr class='text-center'><td>Can you sort a class you don't own (e.g. from a third-party library) by a custom field?</td><td>Yes, using a Comparator - you can't make it implement Comparable since you don't control its source</td></tr>
<tr class='text-center'><td>What should compareTo()/compare() return?</td><td>A negative int if the first is "less than" the second, zero if equal, a positive int if "greater than" - the exact magnitude doesn't matter, only the sign</td></tr>
<tr class='text-center'><td>How do you sort by one field, then break ties with another?</td><td>Comparator.comparing(keyExtractor).thenComparing(secondKeyExtractor)</td></tr>
<tr class='text-center'><td>How do you reverse a Comparator's order?</td><td>Call .reversed() on it, or use Comparator.reverseOrder() / Collections.reverseOrder()</td></tr>
<tr class='text-center'><td>Is Comparable a functional interface?</td><td>Yes - it has exactly one abstract method (compareTo), so it can also be implemented with a lambda, though Comparator is the more common lambda target in practice</td></tr>
</table>`
        }
    ]
};
