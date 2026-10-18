import { Topic } from '../coreJava';

export const strategyPattern: Topic = {
    id: 'strategy-pattern',
    name: 'Strategy Pattern',
    beginner: [
        {
            content: `
Strategy Pattern defines a <b>family of algorithms</b>, puts each of them in a separate class, and makes them interchangeable at runtime.</p>

<h4>Real-Life Example:</h4>
<p>
Suppose you want to travel from home to office. You can choose to go by
<b>Car</b>, <b>Bus</b>, or <b>Flight</b> depending on the situation (budget, distance, urgency).
The destination stays the same, only the strategy (mode of travel) changes.
</p>

<h4>Why do we need Strategy Pattern?</h4>
<ul>
<li>To avoid long if-else / switch chains for selecting behavior</li>
<li>To make algorithms interchangeable without changing client code</li>
<li>To follow Open/Closed Principle - add a new strategy without touching existing code</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create Strategy interface</li>
<li>Step 2: Create Concrete Strategy classes implementing different algorithms</li>
<li>Step 3: Create Context class that holds a reference to a Strategy</li>
<li>Step 4: Client sets the strategy on the Context and calls it</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 1: Strategy Interface
interface PaymentStrategy {
    void pay(int amount);
}

// Step 2: Concrete Strategies
class CreditCardPayment implements PaymentStrategy {
    public void pay(int amount) {
        System.out.println("Paid Rs." + amount + " using Credit Card");
    }
}

class UpiPayment implements PaymentStrategy {
    public void pay(int amount) {
        System.out.println("Paid Rs." + amount + " using UPI");
    }
}

// Step 3: Context Class
class ShoppingCart {

    private PaymentStrategy paymentStrategy;

    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }

    public void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}

// Step 4: Client Code
public class Test {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();

        cart.setPaymentStrategy(new UpiPayment());
        cart.checkout(1500);

        cart.setPaymentStrategy(new CreditCardPayment());
        cart.checkout(5000);
    }
}`
            ]
        }
    ],

    expert: [
        {
            content: `
<h3><code>java.util.Comparator</code> - A Real-World Strategy Pattern</h3>
<p>
<code>Comparator</code> is one of the most widely used real-world implementations of the Strategy pattern
in the JDK. The sorting algorithm inside <code>Collections.sort()</code> or <code>List.sort()</code>
stays the same - only the comparison <b>strategy</b> changes based on the <code>Comparator</code> you pass in.
</p>
`,
            codeExamples: [
                `import java.util.*;

class Employee {
    String name;
    int salary;

    Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }

    public String toString() {
        return name + ":" + salary;
    }
}

public class Test {
    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>();
        employees.add(new Employee("Raoji", 40000));
        employees.add(new Employee("Prataprao", 60000));
        employees.add(new Employee("Aman", 25000));

        // Strategy 1: Sort by salary
        employees.sort((e1, e2) -> e1.salary - e2.salary);
        System.out.println(employees);

        // Strategy 2: Sort by name
        employees.sort(Comparator.comparing(e -> e.name));
        System.out.println(employees);
    }
}`
            ]
        },
        {
            content: `
<h3>Strategy Pattern With Lambdas (Java 8+)</h3>
<p>
Before Java 8, implementing Strategy required creating a separate concrete class for every algorithm,
which added boilerplate. With functional interfaces and lambdas, strategies can be passed inline
without creating extra classes.
</p>
`,
            codeExamples: [
                `import java.util.function.Function;
import java.util.HashMap;
import java.util.Map;

public class Test {

    public static void main(String[] args) {
        Map<String, Function<Integer, Integer>> strategies = new HashMap<>();

        strategies.put("double", x -> x * 2);
        strategies.put("square", x -> x * x);
        strategies.put("negate", x -> -x);

        int input = 5;

        System.out.println(strategies.get("double").apply(input));
        System.out.println(strategies.get("square").apply(input));
        System.out.println(strategies.get("negate").apply(input));
    }
}`
            ]
        },
        {
            content: `
<h3>Strategy vs State Pattern</h3>
<p>
Strategy and State look structurally identical (both use composition + an interface),
but their <b>intent</b> is different.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Strategy</th>
<th>State</th>
</tr>
<tr>
<td>Intent</td>
<td>Client chooses which algorithm to use</td>
<td>Object changes behavior automatically as its internal state changes</td>
</tr>
<tr>
<td>Who switches it</td>
<td>Client code sets the strategy explicitly</td>
<td>The state itself often transitions to the next state</td>
</tr>
<tr>
<td>Awareness between implementations</td>
<td>Strategies are independent of each other</td>
<td>States often know about other states (transitions)</td>
</tr>
<tr>
<td>Example</td>
<td>PaymentStrategy, Comparator</td>
<td>Order status (Placed → Shipped → Delivered)</td>
</tr>
</table>

<h4>Common Mistakes</h4>
<ul>
<li>Using if-else to pick strategy instead of injecting it (defeats the purpose)</li>
<li>Putting shared/common logic in every Concrete Strategy instead of the Context</li>
<li>Creating a new strategy class for trivial one-line logic instead of using a lambda</li>
<li>Confusing Strategy with State when behavior should change automatically over time</li>
</ul>

<h4>When NOT to use Strategy?</h4>
<ul>
<li>When there is only one algorithm and no variation is expected</li>
<li>When algorithm switching adds indirection without real benefit</li>
<li>When a simple lambda/functional parameter is enough - no need for a full class hierarchy</li>
</ul>

<h4>Real Framework Usage</h4>
<ul>
<li><code>Comparator</code> / <code>Comparable</code> - sorting strategy</li>
<li><code>Runnable</code>, <code>Callable</code> - execution strategy passed to threads/executors</li>
<li>Spring - multiple implementations of an interface injected based on <code>@Qualifier</code> or profile</li>
<li>Validation frameworks - pluggable validation strategies per field type</li>
</ul>
`
        }
    ]
};
