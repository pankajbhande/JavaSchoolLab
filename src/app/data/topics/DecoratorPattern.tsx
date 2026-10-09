import { Topic } from '../coreJava';

export const decoratorPattern: Topic = {
    id: 'decorator-pattern',
    name: 'Decorator Pattern',
    beginner: [
        {
            content: `
<h4>Real-Life Example:</h4>
<p>
Think of ordering a <b>pizza</b>. You start with a plain base pizza, and then
add toppings — cheese, olives, mushrooms — one at a time. Each topping wraps
around the previous version and adds its own cost and flavor, without
changing what a "pizza" fundamentally is. Similarly, when it is cold, you
wear a T-shirt, then a sweater over it, then a jacket over that — each layer
<b>adds</b> warmth without changing what's underneath.
</p>
<ul>
<li>Pizza with toppings</li>
<li>Wearing layers of clothing</li>
<li>Coffee with milk, sugar, whipped cream add-ons</li>
</ul>
`
        },
        {
            content: `
<h4>Why do we need Decorator Pattern?</h4>
<p>
If we tried to support every combination of features using subclassing, we
would need a new class for every combination
(<code>CoffeeWithMilk</code>, <code>CoffeeWithMilkAndSugar</code>,
<code>CoffeeWithSugarAndCream</code> ...) — this explodes exponentially. The
Decorator Pattern lets us <b>attach new behavior to an object dynamically</b>
by wrapping it, instead of creating a rigid class hierarchy.
</p>
<ul>
<li>Add responsibilities to objects at runtime</li>
<li>Avoid class explosion from subclassing every combination</li>
<li>Keep the base class simple and open for extension (OCP)</li>
</ul>
`
        },
        {
            content: `
<h4>Basic Structure:</h4>
<ul>
<li><b>Component</b> — common interface for wrapped and wrapper objects</li>
<li><b>ConcreteComponent</b> — the original plain object</li>
<li><b>Decorator</b> — implements Component, holds a reference to a Component</li>
<li><b>ConcreteDecorator</b> — adds extra behavior before/after delegating</li>
</ul>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Component
   |
   +-- ConcreteComponent (SimpleCoffee)
   |
   +-- Decorator (implements Component, wraps a Component)
          |
          +-- MilkDecorator
          +-- SugarDecorator
</pre>
`
        },
        {
            content: `
<h4>Example: Coffee with Milk and Sugar</h4>
`,
            codeExamples: [
                `// Component
interface Coffee {
    String getDescription();
    double getCost();
}

// ConcreteComponent
class SimpleCoffee implements Coffee {
    public String getDescription() {
        return "Coffee";
    }
    public double getCost() {
        return 50.0;
    }
}

// Decorator (abstract, implements same interface, wraps a Coffee)
abstract class CoffeeDecorator implements Coffee {
    protected Coffee wrappedCoffee;

    public CoffeeDecorator(Coffee coffee) {
        this.wrappedCoffee = coffee;
    }
}

// ConcreteDecorator 1
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }
    public String getDescription() {
        return wrappedCoffee.getDescription() + " + Milk";
    }
    public double getCost() {
        return wrappedCoffee.getCost() + 10.0;
    }
}

// ConcreteDecorator 2
class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) {
        super(coffee);
    }
    public String getDescription() {
        return wrappedCoffee.getDescription() + " + Sugar";
    }
    public double getCost() {
        return wrappedCoffee.getCost() + 5.0;
    }
}

// Client
public class Test {
    public static void main(String[] args) {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        coffee = new SugarDecorator(coffee);

        System.out.println(coffee.getDescription() + " => Rs." + coffee.getCost());
        // Output: Coffee + Milk + Sugar => Rs.65.0
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Real World Java Usage: java.io Stream Wrapping</h3>
<p>
The <code>java.io</code> package is the textbook example of Decorator in the
JDK. <code>InputStream</code>, <code>Reader</code> and their wrapper classes
all implement the same base type and can be chained/wrapped freely.
</p>
`,
            codeExamples: [
                `import java.io.*;

public class IoDecoratorDemo {
    public static void main(String[] args) throws IOException {
        // FileReader (ConcreteComponent)
        // wrapped by BufferedReader (Decorator) which adds buffering + readLine()
        Reader fileReader = new FileReader("data.txt");
        BufferedReader bufferedReader = new BufferedReader(fileReader);

        // Similarly for byte streams:
        InputStream fileIn = new FileInputStream("data.bin");
        InputStream bufferedIn = new BufferedInputStream(fileIn);   // adds buffering
        InputStream dataIn = new DataInputStream(bufferedIn);       // adds readInt(), readUTF() etc.

        String line = bufferedReader.readLine();
        System.out.println(line);
        bufferedReader.close();
        dataIn.close();
    }
}`
            ]
        },
        {
            content: `
<h3>Decorator vs Inheritance</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Inheritance</th>
<th>Decorator</th>
</tr>
<tr>
<td>When behavior is added</td>
<td>Compile time (fixed)</td>
<td>Runtime (dynamic)</td>
</tr>
<tr>
<td>Combinations</td>
<td>Needs a new subclass per combination — class explosion</td>
<td>Mix and match wrappers freely at runtime</td>
</tr>
<tr>
<td>Coupling</td>
<td>Tight coupling to parent class</td>
<td>Loose coupling via composition</td>
</tr>
<tr>
<td>Follows</td>
<td>"is-a" relationship</td>
<td>"has-a" / composition — favors composition over inheritance</td>
</tr>
</table>
`
        },
        {
            content: `
<h3>Decorator vs Proxy</h3>
<p>
Both wrap an object and implement the same interface, which makes them look
structurally identical — the difference is <b>intent</b>.
</p>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Decorator</th>
<th>Proxy</th>
</tr>
<tr>
<td>Intent</td>
<td>Add new responsibilities/behavior</td>
<td>Control access to the real object (lazy load, security, remote)</td>
</tr>
<tr>
<td>Typical usage</td>
<td>Stack multiple decorators together</td>
<td>Usually a single proxy in front of the real subject</td>
</tr>
<tr>
<td>Example</td>
<td>BufferedReader wrapping Reader</td>
<td>Hibernate lazy-loading proxy, Spring AOP proxy</td>
</tr>
</table>
`
        },
        {
            content: `
<h3>Decorator with Lambdas / Functional Style</h3>
<p>
In modern Java, simple decorator-like behavior can be expressed with
<code>Function</code> composition instead of a full class hierarchy, when
the "component" is a pure function rather than a stateful object.
</p>
`,
            codeExamples: [
                `import java.util.function.Function;

public class FunctionalDecoratorDemo {
    public static void main(String[] args) {
        Function<String, String> base = s -> s;
        Function<String, String> withUpperCase = base.andThen(String::toUpperCase);
        Function<String, String> withExclaim = withUpperCase.andThen(s -> s + "!");

        System.out.println(withExclaim.apply("hello")); // HELLO!
    }
}`
            ]
        },
        {
            content: `
<h4>Common Mistakes</h4>
<ul>
<li>Making the Decorator depend on concrete classes instead of the common
interface — breaks the ability to stack decorators freely.</li>
<li>Decorators that change the return type/contract of the wrapped method —
violates the Liskov Substitution Principle.</li>
<li>Forgetting to delegate to the wrapped object, accidentally re-implementing
behavior instead of extending it.</li>
<li>Overusing Decorator when a simple flag/parameter would do — adds
unnecessary object wrapping overhead.</li>
</ul>

<h4>When NOT to use Decorator</h4>
<ul>
<li>When the number of independent behaviors is small and fixed — plain
subclassing or a builder may be simpler.</li>
<li>When callers need to inspect the concrete type — decorators hide the
original object behind the common interface, which can break type checks
like <code>instanceof</code>.</li>
</ul>
`
        }
    ]
};
