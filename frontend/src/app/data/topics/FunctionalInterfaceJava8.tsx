import { Topic } from '../coreJava';

export const functionalInterfaceJava8: Topic = {
    id: 'java8-functional-interface',
    name: 'Functional Interface',
    beginner: [
        {
            content: `<h3>Functional Interface</h3>
An Interface that contains exactly one abstract method such types of interface called Functional
Interface & the method is called Functional Method or Single Abstract Method.<br>

Ex:<br>
1) Runnable → It contains only run() method<br>
2) Comparable → It contains only compareTo() method<br>
3) ActionListener → It contains only actionPerformed()<br>
4) Callable → It contains only call() method<br>
It can have any number of default, static methods but can contain only one abstract method.<br><br>

<h4>Key Points about Functional Interfaces:</h4>
1. Single Abstract Method: Functional interfaces have only one abstract method. This is also
known as a Single Abstract Method (SAM) interface.<br>
2. Default and Static Methods: Functional interfaces can have any number of default or static
methods in addition to the single abstract method.<br>
3. @FunctionalInterface Annotation: While not mandatory, it's a good practice to use the
@FunctionalInterface annotation to ensure that the interface conforms to the rules of a functional
interface.<br>
4. Use with Lambda Expressions: Functional interfaces are often used with lambda expressions,
method references, or constructor references to provide clear and concise syntax for implementing
the single abstract method.<br> `,
            codeExamples: [
                `Example 1:

@FunctionalInterface
public interface Test {
void getStudentName(String name);
}

OUTPUT: Pankaj

public class Main implements Test {
@Override
public void getStudentName(String name) {
System.out.println(name);
}
public static void main(String[] args) {
Main main = new Main();
main.getStudentName("Pankaj");
}
}
}

OUTPUT: Pankaj
`,

                `Example: 02

@FunctionalInterface
interface MyFunctionalInterface {
void performTask();

// Default method
default void showDefault() {
    System.out.println("This is a default method");
}
}
public class FunctionalInterfaceExample {
public static void main(String[] args) {

// Using lambda expression to implement the functional interface
MyFunctionalInterface task = () -> System.out.println("Performing a task");

// Calling the abstract method
task.performTask();

// Calling the default method
task.showDefault();
}
}

OUTPUT:
Performing a task
This is a default method`
            ]
        },
        {
            content: `<h4>Explanation:</h4>
• The Test interface is a functional interface with a single abstract method getStudentName.<br>
• The Main class implements the Test interface and provides an implementation for the
getStudentName method.<br>
• In the main method of the Main class, an instance of Main is created, and the getStudentName
method is called with the argument "Pankaj".<br>
• This results in printing the string "ashok" to the console.<br>
By organizing your code into 2 separate classes and ensuring they are both in the same package, you
have a functional implementation of a Java program using a functional interface.<br>`
        }
    ],
    intermediate: [
        {
            content: `<h3>java.util.function - The Full Catalog</h3>
Beyond Function, Predicate, Consumer and Supplier, Java 8 ships primitive-specialized variants (to avoid autoboxing overhead) and two-argument variants. Knowing these saves you from writing custom functional interfaces.<br>`,
            codeExamples: [
                `import java.util.function.*;

public class FunctionalInterfaceCatalogDemo {
    public static void main(String[] args) {
        BiConsumer<String, Integer> biConsumer = (name, age) -> System.out.println(name + " is " + age);
        biConsumer.accept("Pankaj", 28);

        BiPredicate<String, Integer> longEnough = (s, len) -> s.length() >= len;
        System.out.println("BiPredicate: " + longEnough.test("Dheeraj", 5));

        IntFunction<String> intToStr = n -> "Number-" + n;
        System.out.println("IntFunction: " + intToStr.apply(7));

        ToIntFunction<String> strLength = String::length;
        System.out.println("ToIntFunction: " + strLength.applyAsInt("Sheru"));

        IntPredicate isPositive = n -> n > 0;
        System.out.println("IntPredicate: " + isPositive.test(-5));

        BooleanSupplier randomFlag = () -> true;
        System.out.println("BooleanSupplier: " + randomFlag.getAsBoolean());
    }
}
// OUTPUT:
// Pankaj is 28
// BiPredicate: true
// IntFunction: Number-7
// ToIntFunction: 5
// IntPredicate: false
// BooleanSupplier: true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Target Typing - How a Lambda "Becomes" an Interface</h3>
A lambda expression has no type of its own written in the code. The compiler infers its type entirely from the <strong>context</strong> it is assigned to - this is called <strong>target typing</strong>. The target type must always be a functional interface (an interface with exactly one abstract method).<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Runnable r  = () -> System.out.println("run");   // target type: Runnable
Comparator&lt;String&gt; c = (a, b) -> a.compareTo(b); // target type: Comparator&lt;String&gt;
Callable&lt;Integer&gt; k = () -> 42;                   // target type: Callable&lt;Integer&gt;

The SAME lambda body can implement DIFFERENT interfaces
depending only on the variable/parameter type it is assigned to.</pre>

<h4>Java's Built-in Functional Interfaces (java.util.function)</h4>
Instead of writing a new functional interface for every use case, Java 8 ships a standard set - memorize these, they appear constantly in Stream/Optional APIs and interviews:<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Interface</th><th>Abstract Method</th><th>Takes</th><th>Returns</th><th>Typical Use</th></tr>
<tr class='text-center'><td>Function&lt;T,R&gt;</td><td>R apply(T t)</td><td>1 arg</td><td>value</td><td>transform / map</td></tr>
<tr class='text-center'><td>Predicate&lt;T&gt;</td><td>boolean test(T t)</td><td>1 arg</td><td>boolean</td><td>filter / condition</td></tr>
<tr class='text-center'><td>Consumer&lt;T&gt;</td><td>void accept(T t)</td><td>1 arg</td><td>none</td><td>forEach / side effect</td></tr>
<tr class='text-center'><td>Supplier&lt;T&gt;</td><td>T get()</td><td>no args</td><td>value</td><td>lazy value / factory</td></tr>
<tr class='text-center'><td>BiFunction&lt;T,U,R&gt;</td><td>R apply(T t, U u)</td><td>2 args</td><td>value</td><td>combine two values</td></tr>
<tr class='text-center'><td>UnaryOperator&lt;T&gt;</td><td>T apply(T t)</td><td>1 arg (T)</td><td>T (same type)</td><td>same-type transform</td></tr>
<tr class='text-center'><td>BinaryOperator&lt;T&gt;</td><td>T apply(T t1, T t2)</td><td>2 args (T,T)</td><td>T (same type)</td><td>reduce / combine</td></tr>
</table>`,
            codeExamples: [
                `import java.util.function.*;

public class BuiltInFunctionalInterfacesDemo {
    public static void main(String[] args) {
        Function<String, Integer> length = String::length;
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Consumer<String> printer = s -> System.out.println("Consumed: " + s);
        Supplier<String> supplier = () -> "Generated Value";
        BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
        UnaryOperator<Integer> square = n -> n * n;
        BinaryOperator<Integer> max = (a, b) -> a > b ? a : b;

        System.out.println("length.apply: " + length.apply("Pankaj"));
        System.out.println("isEven.test: " + isEven.test(length.apply("Pankaj")));
        printer.accept("Hello Consumer");
        System.out.println("supplier.get: " + supplier.get());
        System.out.println("add.apply: " + add.apply(10, 20));
        System.out.println("square.apply: " + square.apply(5));
        System.out.println("max.apply: " + max.apply(7, 3));
    }
}
// OUTPUT:
// length.apply: 6
// isEven.test: true
// Consumed: Hello Consumer
// supplier.get: Generated Value
// add.apply: 30
// square.apply: 25
// max.apply: 7`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a functional interface?</td><td>An interface with exactly one abstract method (a SAM - Single Abstract Method); it may still have any number of default and static methods</td></tr>
<tr class='text-center'><td>Is @FunctionalInterface mandatory?</td><td>No - it's optional, but recommended, since the compiler then flags an error if a second abstract method is accidentally added</td></tr>
<tr class='text-center'><td>Can a functional interface extend another interface?</td><td>Yes, as long as the total count of abstract methods (after inheriting) stays exactly one</td></tr>
<tr class='text-center'><td>Name Java's 4 core built-in functional interfaces</td><td>Function&lt;T,R&gt; (transform), Predicate&lt;T&gt; (test), Consumer&lt;T&gt; (accept, no return), Supplier&lt;T&gt; (get, no args)</td></tr>
<tr class='text-center'><td>Why do primitive-specialized interfaces like IntPredicate exist?</td><td>To avoid the autoboxing/unboxing overhead of using Predicate&lt;Integer&gt; for primitive values</td></tr>
<tr class='text-center'><td>What is target typing?</td><td>The compiler infers a lambda's actual type purely from the context (variable/parameter/return type) it's assigned to - the lambda itself carries no type</td></tr>
</table>`
        }
    ]
};
