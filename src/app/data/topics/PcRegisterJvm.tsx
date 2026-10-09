import { Topic } from '../coreJava';

export const pcRegisterJvm: Topic = {
    id: 'pc-register-jvm',
    name: 'PC Register',
    beginner: [
        {
            content: `<h3>What is the PC Register?</h3>
The <strong>PC (Program Counter) Register</strong> is a very small piece of memory that keeps track of exactly
which instruction the JVM is currently executing for a given thread. <br><br>
Think of it like a bookmark - it remembers "where we are" in the bytecode, so after finishing one instruction the
JVM knows exactly which one to execute next.`
        },
        {
            content: `<h3>One PC Register Per Thread</h3>
Every thread running inside the JVM gets its own private PC Register. This makes sense - if two threads are
running different methods at the same time, each one needs its own separate "bookmark" to track its own
progress independently of the other.`
        },
        {
            content: `<h3>A Simple Example</h3>
You never interact with the PC Register directly in Java code, but conceptually, it's what lets execution
resume correctly after a method call returns.`,
            codeExamples: [`public class PcRegisterDemo {

    static void stepTwo() {
        System.out.println("Step Two");
    }

    static void stepOne() {
        System.out.println("Step One");
        stepTwo();
        System.out.println("Back in Step One"); // PC Register knows to resume exactly here
    }

    public static void main(String[] args) {
        stepOne();
    }
}
// OUTPUT:
// Step One
// Step Two
// Back in Step One`]
        },
        {
            content: `<h3>What About Native Methods?</h3>
If the current method being executed is a <strong>native method</strong> (implemented in C/C++, not Java
bytecode), the PC Register's value is <strong>undefined</strong> - because native code isn't made of JVM
bytecode instructions, there's nothing meaningful for the PC Register to point to.`
        }
    ],

    expert: [
        {
            content: `<h3>Why the PC Register Exists</h3>
The JVM is a stack-based, bytecode-interpreting (or JIT-compiling) machine. To execute a method's bytecode
correctly, something must track "which bytecode instruction comes next" for each thread - especially since
threads can be paused and resumed by the OS scheduler at any point. The PC Register is exactly that per-thread
bookkeeping slot, holding the address of the JVM instruction currently being executed.`
        },
        {
            content: `<h3>PC Register vs Other Runtime Data Areas</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>PC Register</th><th>Stack</th></tr>
<tr><td>Size</td><td>Tiny - holds essentially one address/value</td><td>Configurable, can be sizable (KB to MB)</td></tr>
<tr><td>Scope</td><td>Per-thread</td><td>Per-thread</td></tr>
<tr><td>Purpose</td><td>Tracks the current bytecode instruction address</td><td>Tracks method call frames, local variables</td></tr>
<tr><td>Tunable via JVM flags?</td><td>No</td><td>Yes (-Xss)</td></tr>
<tr><td>Can it overflow / cause OutOfMemoryError?</td><td>No - it's a fixed, tiny slot, not a growable region</td><td>Yes - StackOverflowError</td></tr>
</table>`
        },
        {
            content: `<h3>PC Register During Context Switching</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Thread T1:  PC -> instruction #42  (executing, gets paused by OS scheduler)
Thread T2:  PC -> instruction #7   (resumes, continues from its own bookmark)
...later, OS scheduler resumes T1...
Thread T1:  PC -> instruction #42  (still correctly points where T1 left off)</pre>
Because each thread has its own isolated PC Register, the JVM (and underlying OS scheduler) can freely pause and
resume threads without any thread losing track of its execution position - this is fundamental to how
multithreading works correctly at the bytecode-execution level.`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"The PC Register is something developers can read or modify."</strong> Wrong - it's entirely internal
to the JVM's execution engine; there's no Java API to inspect or change it directly. <br>
• <strong>"The PC Register can run out of memory."</strong> Wrong - it's a fixed-size, tiny piece of per-thread
state (conceptually similar to a CPU's own program counter register), not a growable memory region, so it has
no corresponding "out of memory" failure mode. <br>
• <strong>"Every JVM instruction execution updates the PC Register the same way for native and Java methods."</strong>
Wrong - for native methods, the PC Register's value is left undefined, since there's no JVM bytecode instruction
sequence being tracked.`
        },
        {
            content: `<h3>Why This Matters for Interviews (Even Though It's Rarely Discussed)</h3>
The PC Register is one of the smallest and least "interesting" runtime data areas, but it's frequently used as a
quick check of whether a candidate actually understands <em>all five</em> JVM runtime data areas (not just Heap
and Stack), and whether they understand the per-thread vs shared distinction correctly across all of them.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does the PC Register store?</td><td>The address of the JVM instruction currently being executed by that thread</td></tr>
<tr><td>Is the PC Register shared across threads?</td><td>No - each thread has its own private PC Register</td></tr>
<tr><td>What happens to the PC Register value when executing a native method?</td><td>Its value is left undefined, since native methods aren't made of JVM bytecode instructions</td></tr>
<tr><td>Can the PC Register be tuned with a JVM flag like -Xss or -Xmx?</td><td>No - it has a fixed, minimal size that isn't user-configurable</td></tr>
<tr><td>Can the PC Register overflow and throw an error?</td><td>No - unlike the Stack or Heap, it's not a growable memory region, so it has no corresponding OutOfMemoryError</td></tr>
<tr><td>Why does each thread need its own PC Register?</td><td>So the OS scheduler can pause and resume threads independently, with each thread resuming exactly where it left off in its own bytecode execution</td></tr>
<tr><td>Is the PC Register part of the Heap or Method Area?</td><td>No - it's a separate, per-thread runtime data area, distinct from both shared areas</td></tr>
<tr><td>Does application code ever read or write the PC Register directly?</td><td>No - it's managed entirely internally by the JVM's execution engine</td></tr>
</table>`
        }
    ]
};
