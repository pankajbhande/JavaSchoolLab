import { Topic } from '../coreJava';

export const statePattern: Topic = {
    id: 'state-pattern',
    name: 'State Pattern',
    beginner: [
        {
            content: `
State Pattern allows an object to <b>change its behavior</b> when its internal state changes. It looks like the object changed its class.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Traffic Light — behaves differently in Red, Yellow, Green states</li>
<li>ATM Machine — behaves differently when card is inserted vs no card</li>
<li>Media Player — Play, Pause, Stop states behave differently</li>
</ul>

<h4>Why do we need State Pattern?</h4>
<ul>
<li>Avoids huge if-else / switch blocks based on state</li>
<li>Each state's behavior lives in its own class</li>
<li>New states can be added without touching existing state classes</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create a <code>State</code> interface</li>
<li>Step 2: Create concrete state classes implementing it</li>
<li>Step 3: Create a <code>Context</code> class holding current state</li>
<li>Step 4: Context delegates behavior to current state object</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 1: State Interface
interface ATMState {
    void insertCard(ATMMachine atm);
    void ejectCard(ATMMachine atm);
    void requestCash(ATMMachine atm, int amount);
}

// Step 2: Concrete States
class NoCardState implements ATMState {
    public void insertCard(ATMMachine atm) {
        System.out.println("Card Inserted");
        atm.setState(atm.getHasCardState());
    }
    public void ejectCard(ATMMachine atm) {
        System.out.println("No card to eject");
    }
    public void requestCash(ATMMachine atm, int amount) {
        System.out.println("Insert card first");
    }
}

class HasCardState implements ATMState {
    public void insertCard(ATMMachine atm) {
        System.out.println("Card already inserted");
    }
    public void ejectCard(ATMMachine atm) {
        System.out.println("Card Ejected");
        atm.setState(atm.getNoCardState());
    }
    public void requestCash(ATMMachine atm, int amount) {
        System.out.println("Dispensing Rs." + amount);
        atm.setState(atm.getNoCardState());
    }
}

// Step 3: Context class
class ATMMachine {
    private final ATMState hasCardState = new HasCardState();
    private final ATMState noCardState = new NoCardState();

    private ATMState currentState = noCardState;

    public void setState(ATMState state) {
        this.currentState = state;
    }
    public ATMState getHasCardState() {
        return hasCardState;
    }
    public ATMState getNoCardState() {
        return noCardState;
    }

    // Step 4: Delegate to current state
    public void insertCard() {
        currentState.insertCard(this);
    }
    public void ejectCard() {
        currentState.ejectCard(this);
    }
    public void requestCash(int amount) {
        currentState.requestCash(this, amount);
    }
}

public class Test {
    public static void main(String[] args) {
        ATMMachine atm = new ATMMachine();
        atm.requestCash(500);   // Insert card first
        atm.insertCard();       // Card Inserted
        atm.requestCash(500);   // Dispensing Rs.500
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>State vs Strategy Pattern</h3>
<p>
State and Strategy look structurally identical (both use an interface with multiple implementations
plugged into a context), but their <b>intent</b> is different.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>State</th>
<th>Strategy</th>
</tr>
<tr>
<td>Intent</td>
<td>Object changes behavior as internal state changes</td>
<td>Client chooses an algorithm to use</td>
</tr>
<tr>
<td>Who switches implementation</td>
<td>The state objects themselves (self-transition)</td>
<td>The client, from outside</td>
</tr>
<tr>
<td>Awareness</td>
<td>States know about each other / next state</td>
<td>Strategies are independent, unaware of each other</td>
</tr>
<tr>
<td>Example</td>
<td>ATM, Traffic Light, Order status</td>
<td>Comparator, Sorting algorithm, Payment method</td>
</tr>
</table>
`
        },
        {
            content: `
<h3>Thread Lifecycle — A Real JDK Example of State</h3>
<p>
Java's <code>Thread</code> class is a great real-world analogy for the State pattern.
A thread moves through states — <code>NEW</code>, <code>RUNNABLE</code>, <code>BLOCKED</code>,
<code>WAITING</code>, <code>TIMED_WAITING</code>, <code>TERMINATED</code> — and its allowed
operations change depending on which state it is in, exactly like our ATM example.
</p>
<ul>
<li><code>Thread.State</code> enum represents the current state</li>
<li>JVM internally manages transitions (you can't call <code>start()</code> twice, etc.)</li>
<li>Behavior of <code>join()</code>, <code>interrupt()</code> differs based on state</li>
</ul>
`,
            codeExamples: [
                `Thread t = new Thread(() -> {
    try { Thread.sleep(1000); } catch (InterruptedException e) {}
});
System.out.println(t.getState()); // NEW
t.start();
System.out.println(t.getState()); // RUNNABLE or TIMED_WAITING`
            ]
        },
        {
            content: `
<h3>State Machine Libraries</h3>
<p>
For complex workflows (order processing, approval flows), hand-rolled State pattern classes
can get unwieldy. Real projects often use dedicated state machine libraries instead:
</p>
<ul>
<li>Spring Statemachine — declarative state/transition configuration for Spring apps</li>
<li>Squirrel State Machine — lightweight Java state machine library</li>
<li>Enum-based state machines — using <code>EnumMap</code> of allowed transitions</li>
</ul>

<h4>Common Mistakes</h4>
<ul>
<li>Putting transition logic in the Context instead of the State classes</li>
<li>Creating a new state object every call instead of reusing singletons (like enum states)</li>
<li>Forgetting to guard illegal transitions (e.g., requesting cash with no card)</li>
</ul>

<h4>When NOT to use State Pattern?</h4>
<ul>
<li>When there are only 2-3 simple states with trivial behavior — a simple flag/if-else may be enough</li>
<li>When states never change behavior, only data</li>
</ul>
`
        }
    ]
};
