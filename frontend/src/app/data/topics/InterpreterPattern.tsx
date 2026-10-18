import { Topic } from '../coreJava';

export const interpreterPattern: Topic = {
    id: 'interpreter-pattern',
    name: 'Interpreter Pattern',
    beginner: [
        {
            content: `
<h3>What is the Interpreter Pattern?</h3>
<p>
The Interpreter Pattern defines a way to <b>evaluate language grammar or expressions</b>.
It represents each rule of the grammar as a class, and combines these classes to
interpret sentences (expressions) in that language.
</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A <b>calculator</b> that reads <code>"3 + 5 * 2"</code> and evaluates the result.</li>
<li>A traffic signal controller interpreting simple rule sentences like "IF car THEN stop".</li>
<li>A basic search engine interpreting boolean queries like <code>"java AND spring"</code>.</li>
</ul>

<h4>Why do we need Interpreter Pattern?</h4>
<ul>
<li>To evaluate expressions written in a simple custom language or grammar.</li>
<li>To break a complex expression into smaller, manageable expression objects.</li>
<li>To make grammar rules easy to extend by adding new expression classes.</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li><b>Expression (interface)</b> — declares an <code>interpret()</code> method.</li>
<li><b>Terminal Expression</b> — represents the basic elements of grammar (e.g., a number).</li>
<li><b>Non-Terminal Expression</b> — represents rules combining other expressions (e.g., addition, multiplication).</li>
<li><b>Client</b> — builds the expression tree and calls <code>interpret()</code>.</li>
</ul>
`,
            codeExamples: [
                `// Step 1: Create Expression Interface
interface Expression {
    int interpret();
}

// Step 2: Terminal Expression (a plain number)
class NumberExpression implements Expression {
    private int number;

    public NumberExpression(int number) {
        this.number = number;
    }

    @Override
    public int interpret() {
        return number;
    }
}

// Step 3: Non-Terminal Expression for Addition
class AddExpression implements Expression {
    private Expression leftExpression;
    private Expression rightExpression;

    public AddExpression(Expression left, Expression right) {
        this.leftExpression = left;
        this.rightExpression = right;
    }

    @Override
    public int interpret() {
        return leftExpression.interpret() + rightExpression.interpret();
    }
}

// Step 4: Non-Terminal Expression for Multiplication
class MultiplyExpression implements Expression {
    private Expression leftExpression;
    private Expression rightExpression;

    public MultiplyExpression(Expression left, Expression right) {
        this.leftExpression = left;
        this.rightExpression = right;
    }

    @Override
    public int interpret() {
        return leftExpression.interpret() * rightExpression.interpret();
    }
}

// Step 5: Client Code - build the expression tree for "3 + 5 * 2"
public class Test {
    public static void main(String[] args) {

        Expression three = new NumberExpression(3);
        Expression five = new NumberExpression(5);
        Expression two = new NumberExpression(2);

        // 5 * 2
        Expression multiply = new MultiplyExpression(five, two);

        // 3 + (5 * 2)
        Expression add = new AddExpression(three, multiply);

        System.out.println("Result: " + add.interpret()); // Output: Result: 13
    }
}`,
            ],
        },
        {
            content: `
<h4>How It Works — Step by Step</h4>
<ul>
<li>Every number (3, 5, 2) becomes a <b>NumberExpression</b> (Terminal Expression).</li>
<li>The multiplication "5 * 2" becomes a <b>MultiplyExpression</b> wrapping the two numbers.</li>
<li>The addition "3 + (5*2)" becomes an <b>AddExpression</b> wrapping the number and the multiply expression.</li>
<li>Calling <code>interpret()</code> on the outermost expression recursively evaluates the whole tree.</li>
</ul>

<h4>Expression Tree Diagram:</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
              AddExpression
              /           \\
      NumberExpression(3)   MultiplyExpression
                              /           \\
                    NumberExpression(5)  NumberExpression(2)
</pre>

<p>
Each node "interprets itself" and passes the result up to its parent —
this is a classic <b>recursive tree evaluation</b>.
</p>
`,
        },
    ],
    expert: [
        {
            content: `
<h3>Where Interpreter Pattern is Actually Used</h3>
<ul>
<li><b>Regex engines</b> — a regular expression is compiled into a tree of terminal/non-terminal expressions and interpreted against input text.</li>
<li><b>SQL parsers</b> — query language grammar (SELECT, WHERE, JOIN clauses) is parsed into an expression tree and interpreted/executed.</li>
<li><b>Rule engines</b> — business rule engines (like Drools) interpret condition expressions such as <code>"age > 18 AND country == 'IN'"</code>.</li>
<li><b>Spring Expression Language (SpEL)</b> — <code>@Value("#{someBean.someProperty}")</code> is parsed and interpreted internally using this pattern.</li>
<li><b>Template engines</b> — interpreting placeholders like <code>{{ name }}</code> in templates.</li>
</ul>

<h4>Terminal vs Non-Terminal Expressions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Type</th>
<th>Meaning</th>
<th>Example</th>
</tr>
<tr>
<td>Terminal Expression</td>
<td>Leaf node of the grammar tree — cannot be broken down further</td>
<td>NumberExpression, VariableExpression</td>
</tr>
<tr>
<td>Non-Terminal Expression</td>
<td>Combines one or more other expressions to form a grammar rule</td>
<td>AddExpression, MultiplyExpression, AndExpression, OrExpression</td>
</tr>
</table>
`,
            codeExamples: [
                `// Example: Boolean grammar with Terminal and Non-Terminal expressions
interface BooleanExpression {
    boolean interpret(String context);
}

// Terminal Expression
class TerminalExpression implements BooleanExpression {
    private String data;

    public TerminalExpression(String data) {
        this.data = data;
    }

    @Override
    public boolean interpret(String context) {
        return context.contains(data);
    }
}

// Non-Terminal Expression (AND rule)
class AndExpression implements BooleanExpression {
    private BooleanExpression left;
    private BooleanExpression right;

    public AndExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public boolean interpret(String context) {
        return left.interpret(context) && right.interpret(context);
    }
}

// Client
public class RuleEngineTest {
    public static void main(String[] args) {
        BooleanExpression java = new TerminalExpression("java");
        BooleanExpression spring = new TerminalExpression("spring");

        BooleanExpression javaAndSpring = new AndExpression(java, spring);

        System.out.println(javaAndSpring.interpret("java spring developer")); // true
        System.out.println(javaAndSpring.interpret("java developer"));        // false
    }
}`,
            ],
        },
        {
            content: `
<h3>Why Interpreter is Rarely Used in Production</h3>
<ul>
<li><b>Performance:</b> Deeply nested expression trees mean deeply nested recursive calls — this becomes slow for complex grammars.</li>
<li><b>Class explosion:</b> Every grammar rule needs its own class, so a moderately complex language quickly results in dozens of expression classes.</li>
<li><b>Maintainability:</b> Hand-written interpreters are hard to extend and debug compared to using a dedicated parsing tool.</li>
<li><b>Better alternatives exist:</b> Real-world parsing needs (SQL, DSLs, config languages) are almost always solved using mature parser generator libraries like <b>ANTLR</b>, <b>JavaCC</b>, or existing libraries (e.g., <code>javax.script</code>, Spring's SpEL parser) instead of writing a hand-rolled Interpreter pattern.</li>
</ul>

<h4>When Interpreter Pattern IS still a reasonable choice</h4>
<ul>
<li>The grammar is <b>very small and simple</b> (a handful of rules).</li>
<li>The grammar is <b>unlikely to grow</b> significantly.</li>
<li>You need something quick and don't want the overhead of a full parser generator toolchain.</li>
</ul>

<h3>Interpreter vs Visitor Pattern</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Interpreter Pattern</th>
<th>Visitor Pattern</th>
</tr>
<tr>
<td>Purpose</td>
<td>Evaluate/interpret a grammar or language expression</td>
<td>Add new operations to an existing object structure without changing its classes</td>
</tr>
<tr>
<td>Where logic lives</td>
<td>Each expression class implements its own <code>interpret()</code> logic</td>
<td>Logic lives in a separate Visitor class, objects just <code>accept()</code> the visitor</td>
</tr>
<tr>
<td>Category</td>
<td>Behavioral - focused on language/grammar evaluation</td>
<td>Behavioral - focused on separating algorithm from object structure</td>
</tr>
<tr>
<td>Extending with new operations</td>
<td>Hard - requires modifying/adding expression classes</td>
<td>Easy - just add a new Visitor implementation</td>
</tr>
<tr>
<td>Often used together?</td>
<td>Yes - Interpreter builds the tree, Visitor can be used to traverse/evaluate it differently (e.g., pretty-print vs evaluate)</td>
<td>Yes - complements Interpreter's expression tree</td>
</tr>
</table>
`,
        },
        {
            content: `
<h3>Interview Questions — Interpreter Pattern</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>#</th>
<th>Question</th>
<th>Short Answer</th>
</tr>
<tr>
<td>1</td>
<td>What is the Interpreter Pattern?</td>
<td>A behavioral pattern that represents grammar rules as classes and evaluates expressions using an <code>interpret()</code> method.</td>
</tr>
<tr>
<td>2</td>
<td>What is a Terminal Expression?</td>
<td>A leaf-level expression in the grammar that cannot be broken down further (e.g., a number or variable).</td>
</tr>
<tr>
<td>3</td>
<td>What is a Non-Terminal Expression?</td>
<td>An expression that combines other expressions to represent a grammar rule (e.g., addition, AND, OR).</td>
</tr>
<tr>
<td>4</td>
<td>Give a real-world example of Interpreter Pattern usage.</td>
<td>Regex engines, SQL parsers, rule engines, and Spring's SpEL expression evaluation.</td>
</tr>
<tr>
<td>5</td>
<td>Why is Interpreter Pattern rarely used in large production systems?</td>
<td>Performance issues with deep recursion, class explosion for complex grammars, and better alternatives like ANTLR exist.</td>
</tr>
<tr>
<td>6</td>
<td>What is the difference between Interpreter and Visitor pattern?</td>
<td>Interpreter evaluates a grammar/language expression tree; Visitor adds new operations to an existing object structure without modifying it.</td>
</tr>
<tr>
<td>7</td>
<td>When should you avoid using Interpreter Pattern?</td>
<td>When the grammar is complex or likely to grow - use a parser generator tool like ANTLR instead.</td>
</tr>
<tr>
<td>8</td>
<td>Which GoF category does Interpreter belong to?</td>
<td>Behavioral Pattern.</td>
</tr>
</table>
`,
        },
    ],
};
