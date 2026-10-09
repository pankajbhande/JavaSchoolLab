import { Topic } from '../coreJava';

export const visitorPattern: Topic = {
    id: 'visitor-pattern',
    name: 'Visitor Pattern',
    beginner: [
        {
            content: `
Visitor Pattern lets you add <b>new operations</b> to a group of classes without modifying the classes themselves.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Tax Auditor — visits different account types (Savings, Current) and applies different rules to each, without the account classes knowing about tax rules</li>
<li>Shopping Cart — a discount calculator "visits" different item types (Book, Electronics) and applies different discount logic</li>
</ul>

<h4>Why do we need it?</h4>
<ul>
<li>Adding a new operation normally means modifying every element class</li>
<li>Visitor moves that operation's logic into a separate Visitor class instead</li>
<li>Keeps element classes stable while operations can grow freely</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create a <code>Visitor</code> interface with <code>visit()</code> methods for each element type</li>
<li>Step 2: Each element class implements <code>accept(Visitor v)</code></li>
<li>Step 3: <code>accept()</code> calls back <code>visitor.visit(this)</code> — this is "double dispatch"</li>
<li>Step 4: Concrete Visitor implements the actual logic per element type</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 2: Element interface
interface Item {
    void accept(Visitor visitor);
}

class Book implements Item {
    private double price;
    public Book(double price) { this.price = price; }
    public double getPrice() { return price; }

    public void accept(Visitor visitor) {
        visitor.visit(this); // Step 3: double dispatch
    }
}

class Electronics implements Item {
    private double price;
    public Electronics(double price) { this.price = price; }
    public double getPrice() { return price; }

    public void accept(Visitor visitor) {
        visitor.visit(this); // Step 3: double dispatch
    }
}

// Step 1: Visitor interface
interface Visitor {
    void visit(Book book);
    void visit(Electronics electronics);
}

// Step 4: Concrete Visitor
class PriceVisitor implements Visitor {
    private double total = 0;

    public void visit(Book book) {
        total += book.getPrice(); // no tax on books
        System.out.println("Book price: " + book.getPrice());
    }

    public void visit(Electronics electronics) {
        double priceWithTax = electronics.getPrice() * 1.18; // 18% tax
        total += priceWithTax;
        System.out.println("Electronics price with tax: " + priceWithTax);
    }

    public double getTotal() {
        return total;
    }
}

public class Test {
    public static void main(String[] args) {
        Item[] items = { new Book(500), new Electronics(1000) };

        PriceVisitor visitor = new PriceVisitor();
        for (Item item : items) {
            item.accept(visitor);
        }

        System.out.println("Total: " + visitor.getTotal());
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Double Dispatch Explained</h3>
<p>
Java method overloading is resolved at compile time based on the <b>static type</b> of the
argument (single dispatch on the object the method is called on). Visitor Pattern achieves
<b>double dispatch</b> — the actual method invoked depends on BOTH the runtime type of the
element AND the runtime type of the visitor.
</p>
<ul>
<li>First dispatch: <code>item.accept(visitor)</code> — resolved by the actual runtime type of <code>item</code> (Book or Electronics)</li>
<li>Second dispatch: inside <code>accept()</code>, <code>visitor.visit(this)</code> — the compiler now knows the exact static type of <code>this</code> (Book or Electronics), so the correct overloaded <code>visit()</code> method is picked</li>
<li>This two-step trick is how Visitor simulates true polymorphic dispatch based on two objects instead of one</li>
</ul>
`
        },
        {
            content: `
<h3>Open/Closed Principle — Adding Operations Without Modifying Classes</h3>
<p>
To add a new operation (e.g., a <code>DiscountVisitor</code>), you simply create a new class
implementing <code>Visitor</code>. The <code>Book</code> and <code>Electronics</code> classes
are never touched again — this satisfies the Open/Closed Principle perfectly for adding
new <b>operations</b>.
</p>
`,
            codeExamples: [
                `class DiscountVisitor implements Visitor {
    public void visit(Book book) {
        System.out.println("10% discount on book");
    }
    public void visit(Electronics electronics) {
        System.out.println("5% discount on electronics");
    }
}
// Book and Electronics classes were NOT modified to add this new operation`
            ]
        },
        {
            content: `
<h3>The Tradeoff — Adding New Element Types Is Expensive</h3>
<p>
Visitor Pattern flips the usual extensibility tradeoff:
</p>
<ul>
<li>Easy: adding new <b>operations</b> (new Visitor implementations)</li>
<li>Hard: adding new <b>element types</b> (e.g., adding <code>Furniture</code>) requires adding a new <code>visit(Furniture)</code> method to the <code>Visitor</code> interface AND every existing concrete visitor</li>
</ul>
<p>
So Visitor is best used when the set of element classes is stable/rarely changes, but the set of
operations performed on them grows frequently.
</p>

<h4>Real Use — Abstract Syntax Trees (AST) / Compiler Design</h4>
<ul>
<li>Compilers represent source code as an AST with node types like <code>BinaryExpr</code>, <code>IfStatement</code>, <code>MethodDecl</code></li>
<li>Different phases (type checking, optimization, code generation, pretty-printing) are implemented as separate Visitors over the same fixed set of AST node types</li>
<li>This keeps each compiler phase in its own class instead of scattering logic across all node classes</li>
</ul>

<h4>Common Mistakes</h4>
<ul>
<li>Using Visitor when element types change frequently (causes cascading interface changes)</li>
<li>Forgetting to implement <code>accept()</code> consistently on every element subclass</li>
<li>Putting mutable state inside the Visitor without resetting it between traversals</li>
</ul>

<h4>Visitor vs Iterator</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Visitor</th>
<th>Iterator</th>
</tr>
<tr>
<td>Purpose</td>
<td>Perform a type-specific operation on each element</td>
<td>Sequentially traverse elements without exposing structure</td>
</tr>
<tr>
<td>Adds new behavior?</td>
<td>Yes, via new visitor classes</td>
<td>No, only traversal</td>
</tr>
<tr>
<td>Element type awareness</td>
<td>Visitor is aware of every concrete element type</td>
<td>Iterator is unaware of element types, just returns items</td>
</tr>
</table>

<h4>When NOT to use Visitor?</h4>
<ul>
<li>When the class hierarchy of elements changes often</li>
<li>When there's only one operation ever needed — a simple method on the class is simpler</li>
<li>When double dispatch complexity isn't worth it for a small, stable set of operations</li>
</ul>
`
        }
    ]
};
