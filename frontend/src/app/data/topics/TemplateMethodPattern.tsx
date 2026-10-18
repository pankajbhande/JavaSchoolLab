import { Topic } from '../coreJava';

export const templateMethodPattern: Topic = {
    id: 'template-method-pattern',
    name: 'Template Method Pattern',
    beginner: [
        {
            content: `
Template Method Pattern defines the <b>skeleton of an algorithm</b> in a base class, letting subclasses override specific steps without changing the overall structure.</p>

<h4>Real-Life Example:</h4>
<p>
Think of a recipe for making tea or coffee. The overall steps are fixed:
Boil water → Brew → Pour in cup → Add condiments. But the "Brew" and "Add condiments" steps differ
between tea and coffee. The recipe (algorithm) stays the same; only specific steps vary.
</p>

<h4>Why do we need Template Method Pattern?</h4>
<ul>
<li>To avoid duplicating the common algorithm structure across multiple classes</li>
<li>To let subclasses customize only the parts that vary</li>
<li>To enforce a fixed sequence of steps that subclasses cannot accidentally reorder</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Abstract class defines a <b>final template method</b> that calls the steps in order</li>
<li>Some steps are <code>abstract</code> - must be implemented by subclasses</li>
<li>Some steps can have a default implementation (optional to override - "hooks")</li>
<li>Concrete subclasses implement only the variable steps</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 1: Abstract class with Template Method
abstract class DataProcessor {

    // Template Method - defines the fixed skeleton, marked final so it can't be overridden
    public final void process() {
        readData();
        transformData();
        saveData();
    }

    protected abstract void readData();

    protected abstract void transformData();

    protected void saveData() {
        System.out.println("Saving processed data to database (default step)");
    }
}

// Step 2: Concrete Implementation for CSV
class CsvDataProcessor extends DataProcessor {

    protected void readData() {
        System.out.println("Reading data from CSV file");
    }

    protected void transformData() {
        System.out.println("Transforming CSV data into objects");
    }
}

// Step 3: Concrete Implementation for JSON
class JsonDataProcessor extends DataProcessor {

    protected void readData() {
        System.out.println("Reading data from JSON file");
    }

    protected void transformData() {
        System.out.println("Transforming JSON data into objects");
    }

    @Override
    protected void saveData() {
        System.out.println("Saving JSON processed data to NoSQL store");
    }
}

// Step 4: Client Code
public class Test {
    public static void main(String[] args) {
        DataProcessor csvProcessor = new CsvDataProcessor();
        csvProcessor.process();

        System.out.println("-----");

        DataProcessor jsonProcessor = new JsonDataProcessor();
        jsonProcessor.process();
    }
}`
            ]
        }
    ],

    expert: [
        {
            content: `
<h3>The Hollywood Principle: "Don't call us, we'll call you"</h3>
<p>
Template Method is the classic example of the Hollywood Principle. Instead of subclasses calling
into the parent class to drive the algorithm, the <b>parent class (base class) controls the flow</b>
and calls into the subclass methods at the right time. The subclass never decides when its own
steps run - it just fills in the blanks.
</p>
<p>
This inversion of control keeps the overall algorithm consistent and prevents subclasses from
breaking the intended sequence, which is exactly why the template method itself is usually declared
<code>final</code>.
</p>
`
        },
        {
            content: `
<h3><code>java.io.InputStream</code> - Real JDK Use of Template Method</h3>
<p>
<code>InputStream</code> uses Template Method internally. The method <code>read(byte[] b, int off, int len)</code>
is implemented in the abstract base class in terms of the abstract <code>read()</code> (single byte) method,
which subclasses like <code>FileInputStream</code> or <code>ByteArrayInputStream</code> implement.
</p>
`,
            codeExamples: [
                `// Simplified view of java.io.InputStream internals
public abstract class InputStream {

    // abstract - subclasses must implement how to read a single byte
    public abstract int read() throws IOException;

    // template method built on top of read()
    public int read(byte[] b, int off, int len) throws IOException {
        int c = read();
        if (c == -1) {
            return -1;
        }
        b[off] = (byte) c;
        int i = 1;
        for (; i < len; i++) {
            c = read();
            if (c == -1) {
                break;
            }
            b[off + i] = (byte) c;
        }
        return i;
    }
}`
            ]
        },
        {
            content: `
<h3>Hooks vs Abstract Methods</h3>
<p>
Template Method uses two kinds of extension points:
</p>
<ul>
<li><b>Abstract methods</b> - subclass <b>must</b> implement (e.g. readData(), transformData())</li>
<li><b>Hooks</b> - methods with a default (often empty or no-op) implementation that subclasses
<b>may optionally</b> override to plug into specific points of the algorithm (e.g. saveData()
in the beginner example, or a <code>shouldLog()</code> flag hook)</li>
</ul>
`,
            codeExamples: [
                `abstract class DataProcessor {

    public final void process() {
        readData();
        transformData();
        if (isLoggingEnabled()) { // hook controls optional behavior
            logSummary();
        }
        saveData();
    }

    protected abstract void readData();
    protected abstract void transformData();

    // Hook with default implementation - override only if needed
    protected boolean isLoggingEnabled() {
        return false;
    }

    protected void logSummary() {
        System.out.println("Logging processing summary...");
    }

    protected void saveData() {
        System.out.println("Saving data (default)");
    }
}`
            ]
        },
        {
            content: `
<h3>Template Method vs Strategy</h3>
<p>
Both patterns let you vary part of a behavior, but they use fundamentally different mechanisms -
<b>inheritance</b> vs <b>composition</b>.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Template Method</th>
<th>Strategy</th>
</tr>
<tr>
<td>Mechanism</td>
<td>Inheritance - subclass overrides specific steps</td>
<td>Composition - Context holds a Strategy object</td>
</tr>
<tr>
<td>Flexibility</td>
<td>Fixed algorithm structure, only some steps vary</td>
<td>Entire algorithm can be swapped at runtime</td>
</tr>
<tr>
<td>Coupling</td>
<td>Tighter - subclass is bound to parent class</td>
<td>Looser - strategy implementation is independent</td>
</tr>
<tr>
<td>Runtime change</td>
<td>Not possible - behavior fixed at compile time by subclass</td>
<td>Possible - can call setStrategy() at runtime</td>
</tr>
<tr>
<td>Example</td>
<td>InputStream.read(), DataProcessor.process()</td>
<td>Comparator, PaymentStrategy</td>
</tr>
</table>

<h4>Common Mistakes</h4>
<ul>
<li>Forgetting to make the template method <code>final</code>, letting subclasses override the sequence itself</li>
<li>Putting too many abstract methods, making subclasses do all the work (defeats the purpose of reuse)</li>
<li>Using deep inheritance chains with Template Method instead of favoring composition when flexibility is needed</li>
<li>Mixing hooks and abstract methods inconsistently, confusing which steps are mandatory</li>
</ul>

<h4>When NOT to use Template Method?</h4>
<ul>
<li>When the algorithm needs to change completely at runtime - use Strategy instead</li>
<li>When there is no shared algorithm structure across implementations, just unrelated behavior</li>
<li>When composition is preferred over inheritance to avoid tight coupling to a base class</li>
</ul>
`
        }
    ]
};
