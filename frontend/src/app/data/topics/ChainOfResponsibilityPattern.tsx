import { Topic } from '../coreJava';

export const chainOfResponsibilityPattern: Topic = {
    id: 'chain-of-responsibility-pattern',
    name: 'Chain of Responsibility Pattern',
    beginner: [
        {
            content: `
Chain of Responsibility lets you pass a request along a <b>chain of handlers</b>. Each handler decides either to process the request or pass it to the next handler.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>ATM cash dispenser — handles request using 2000, 500, 100 notes in a chain</li>
<li>Tech support escalation — L1 support tries first, then L2, then L3</li>
<li>Leave approval — Manager approves small leaves, Director approves longer ones</li>
</ul>

<h4>Why do we need it?</h4>
<ul>
<li>Decouples sender of a request from its receivers</li>
<li>Multiple objects get a chance to handle the request</li>
<li>New handlers can be added without changing existing code</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create abstract <code>Handler</code> with a <code>setNext()</code> method</li>
<li>Step 2: Create concrete handlers that either handle or forward the request</li>
<li>Step 3: Client builds the chain and sends request to the first handler</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 1: Abstract Handler
abstract class LeaveApprover {
    protected LeaveApprover next;

    public void setNext(LeaveApprover next) {
        this.next = next;
    }

    public abstract void processRequest(int days);
}

// Step 2: Concrete Handlers
class Manager extends LeaveApprover {
    public void processRequest(int days) {
        if (days <= 2) {
            System.out.println("Manager approved " + days + " day(s) leave");
        } else if (next != null) {
            next.processRequest(days);
        }
    }
}

class Director extends LeaveApprover {
    public void processRequest(int days) {
        if (days <= 7) {
            System.out.println("Director approved " + days + " day(s) leave");
        } else if (next != null) {
            next.processRequest(days);
        }
    }
}

class VP extends LeaveApprover {
    public void processRequest(int days) {
        System.out.println("VP approved " + days + " day(s) leave");
    }
}

// Step 3: Client
public class Test {
    public static void main(String[] args) {
        LeaveApprover manager = new Manager();
        LeaveApprover director = new Director();
        LeaveApprover vp = new VP();

        manager.setNext(director);
        director.setNext(vp);

        manager.processRequest(1);   // Manager approved
        manager.processRequest(5);   // Director approved
        manager.processRequest(15);  // VP approved
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>ATM Cash Dispenser — Full Chain Example</h3>
<p>
A very common interview example: dispensing cash using the fewest number of currency notes,
where each handler is responsible for one denomination and passes the remainder down the chain.
</p>
`,
            codeExamples: [
                `abstract class CurrencyHandler {
    protected CurrencyHandler next;
    protected int denomination;

    CurrencyHandler(int denomination) {
        this.denomination = denomination;
    }

    public void setNext(CurrencyHandler next) {
        this.next = next;
    }

    public void dispense(int amount) {
        int numNotes = amount / denomination;
        int remainder = amount % denomination;

        if (numNotes > 0) {
            System.out.println(numNotes + " x " + denomination + " note(s) dispensed");
        }
        if (remainder != 0 && next != null) {
            next.dispense(remainder);
        }
    }
}

public class ATMDispenser {
    public static void main(String[] args) {
        CurrencyHandler h2000 = new CurrencyHandler(2000) {};
        CurrencyHandler h500 = new CurrencyHandler(500) {};
        CurrencyHandler h100 = new CurrencyHandler(100) {};

        h2000.setNext(h500);
        h500.setNext(h100);

        h2000.dispense(3700); // 1x2000, 3x500, 2x100
    }
}`
            ]
        },
        {
            content: `
<h3>Servlet Filters — A Real Chain of Responsibility Example</h3>
<p>
The Java Servlet API's <code>Filter</code> mechanism is a textbook production use of Chain
of Responsibility. Each filter processes the request/response and then decides whether to
pass control to the next filter using <code>FilterChain.doFilter()</code>.
</p>
`,
            codeExamples: [
                `public class AuthFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("Checking authentication...");
        // pass control to next filter in the chain
        chain.doFilter(req, res);
    }
}`
            ]
        },
        {
            content: `
<h3>Chain of Responsibility vs Decorator</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Chain of Responsibility</th>
<th>Decorator</th>
</tr>
<tr>
<td>Intent</td>
<td>Pass request until someone handles it</td>
<td>Add extra behavior/wrapping around an object</td>
</tr>
<tr>
<td>Execution</td>
<td>Usually only ONE handler processes it (or a subset), can stop early</td>
<td>Every decorator in the stack always executes</td>
</tr>
<tr>
<td>Structure</td>
<td>Linked list of handlers</td>
<td>Nested wrapper objects</td>
</tr>
<tr>
<td>Example</td>
<td>Servlet Filters, Leave Approval, ATM Dispenser</td>
<td>BufferedReader wrapping Reader, java.io streams</td>
</tr>
</table>

<h4>Common Mistakes</h4>
<ul>
<li>Forgetting to call <code>next</code> handler — request silently gets dropped</li>
<li>Creating a circular chain (A → B → A), leading to infinite loops</li>
<li>Not having a default/terminal handler that guarantees the request is eventually handled</li>
</ul>

<h4>Avoiding Infinite Loops</h4>
<ul>
<li>Ensure the chain is built as a strict linear or acyclic structure (never point back to a previous handler)</li>
<li>Add a maximum hop counter as a safety net in critical systems</li>
<li>Always terminate the chain with a handler that has <code>next = null</code> and handles the default case</li>
</ul>

<h4>When NOT to use Chain of Responsibility?</h4>
<ul>
<li>When exactly one specific object should always handle the request (just call it directly)</li>
<li>When request handling order doesn't matter and simple dispatch (Map/Strategy) is clearer</li>
</ul>
`
        }
    ]
};
