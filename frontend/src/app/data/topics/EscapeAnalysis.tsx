import { Topic } from '../coreJava';

export const escapeAnalysis: Topic = {
    id: 'escape-analysis',
    name: 'Escape Analysis',
    beginner: [
        {
            content: `<h3>What is Escape Analysis?</h3>
Escape Analysis is a technique the JVM's JIT compiler (C2) uses to figure out whether an object created inside a
method ever "escapes" - that is, whether it becomes visible or reachable outside that method. <br><br>
If the JVM proves an object never escapes, it can skip some of the normal, more expensive steps of object creation
(like allocating it on the heap), making the code run faster and reducing garbage collection pressure.`
        },
        {
            content: `<h3>What Does "Escaping" Mean?</h3>
An object "escapes" a method if it can be accessed from outside that method after the method returns. Examples: <br>
• It is returned from the method. <br>
• It is stored in a field of another object. <br>
• It is passed to another method that itself lets it escape. <br>
• It is stored in a static variable or shared collection. <br><br>
If none of these happen, the object is said to be <strong>non-escaping</strong> - it only ever lives and dies inside
that one method call.`,
            codeExamples: [`public class EscapeExample {

    // Point never escapes - it is created, used, and discarded within the method
    static int distanceSquared(int x, int y) {
        Point p = new Point(x, y); // candidate for escape analysis
        return p.x * p.x + p.y * p.y;
    }

    static class Point {
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
    }

    public static void main(String[] args) {
        System.out.println(distanceSquared(3, 4));
    }
}
// OUTPUT:
// 25`]
        },
        {
            content: `<h3>Why Should a Beginner Care?</h3>
You don't need to write any special code to benefit from escape analysis - it happens automatically inside the JIT
compiler once a method gets hot enough. But understanding it explains: <br>
• Why creating small, short-lived helper objects (like a <code>Point</code> or a temporary wrapper) is often "free" in
modern Java, contrary to older advice to avoid object creation at all costs. <br>
• Why heavily optimized Java code can sometimes perform close to hand-written low-level code, even though Java is
"object heavy."`
        },
        {
            content: `<h3>Scalar Replacement - A Quick Preview</h3>
When an object doesn't escape, the JIT compiler can go a step further and completely eliminate the object, replacing
its fields with individual local variables (like ints or references) that live only in CPU registers or the stack.
This is called <strong>scalar replacement</strong>, and it is one of the most powerful outcomes of escape analysis -
we go deeper into it in the expert section.`
        }
    ],

    expert: [
        {
            content: `<h3>Categories of Escape</h3>
The JIT compiler's escape analysis classifies every allocation site into one of three categories: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Category</th><th>Meaning</th><th>Optimization Enabled</th></tr>
<tr class='text-center'><td>NoEscape</td><td>Object is only used within the allocating method (and its inlined callees)</td><td>Scalar replacement, stack allocation, lock elision</td></tr>
<tr class='text-center'><td>ArgEscape</td><td>Object is passed as an argument to another method but doesn't escape globally</td><td>Limited - depends on callee's own analysis</td></tr>
<tr class='text-center'><td>GlobalEscape</td><td>Object is returned, stored in a field, or otherwise reachable after the method exits</td><td>None - must be heap-allocated normally</td></tr>
</table>`
        },
        {
            content: `<h3>Scalar Replacement in Depth</h3>
When C2 proves an object is <code>NoEscape</code>, it doesn't just "allocate on the stack" (a common misconception) -
it can go further and eliminate the object entirely. The object's fields are "unpacked" into separate scalar values
(primitives/references) that the compiler tracks independently, often keeping them in CPU registers. No memory
allocation happens at all. <br><br>
This is why the mental model "escape analysis puts objects on the stack instead of the heap" is only partially
correct - the more precise statement is: <strong>the object may never be materialized as a memory block at all.</strong>`,
            codeExamples: [`// Enable/inspect scalar replacement (diagnostic flags, OpenJDK)
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintEscapeAnalysis -XX:+PrintEliminateAllocations MyApp

// Typical output line when scalar replacement succeeds:
// "125   45   4   com.myapp.Vector3::length (32 bytes)  eliminated allocation: Vector3"`]
        },
        {
            content: `<h3>Lock Elision (Biased/Redundant Lock Removal)</h3>
Escape analysis also enables <strong>lock elision</strong>: if a synchronized object is proven to be thread-local
(never escapes the current thread), the JIT can remove the <code>synchronized</code> block's locking overhead
entirely, since no other thread could ever contend for that lock. <br><br>
This commonly happens with local <code>StringBuilder</code> usage - even though <code>StringBuffer</code> and older
synchronized collection wrappers have internal locks, if an instance never escapes a method, those locks are compiled
away.`,
            codeExamples: [`public class LockElisionExample {
    static String buildMessage(String name) {
        // StringBuffer is internally synchronized, but "sb" never escapes this method,
        // so the JIT can elide (skip) the locking entirely once this method is hot.
        StringBuffer sb = new StringBuffer();
        sb.append("Hello, ").append(name).append("!");
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(buildMessage("World"));
    }
}
// OUTPUT:
// Hello, World!`]
        },
        {
            content: `<h3>Escape Analysis and Inlining Work Together</h3>
Escape analysis is far more effective when combined with method inlining. Consider a helper method that wraps an
object creation and passes it to another small method - if C2 inlines both methods into the caller, the object's
full lifecycle becomes visible within a single compiled unit, making it much more likely to be classified as
<code>NoEscape</code>. This is one reason very large methods (that exceed inlining size limits) can miss out on
escape analysis benefits that smaller, decomposed methods get "for free."`
        },
        {
            content: `<h3>Diagnostic Output: JIT Escape Analysis Log</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">------------ EscapeAnalysis ------------
com.myapp.Vector3::length
  Allocation: new Vector3  -> NoEscape
  Eliminated: true (scalar replaced into x, y, z)

com.myapp.OrderService::createOrder
  Allocation: new Order    -> GlobalEscape (returned to caller)
  Eliminated: false (heap allocated normally)</pre>`
        },
        {
            content: `<h3>Production Troubleshooting Scenarios</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A hot method allocates heavily according to a profiler, but GC young-gen pressure is lower than expected</td><td>Escape analysis is successfully scalar-replacing most allocations - profiler "allocation counts" can be misleading vs actual heap pressure</td><td>Cross-check profiler allocation sampling against actual GC logs / allocation rate metrics</td><td>Not a bug - confirm with <code>-XX:+PrintEliminateAllocations</code> that eliminations are happening as expected</td></tr>
<tr><td>Refactoring a large method into smaller ones unexpectedly improves throughput</td><td>Smaller methods enabled inlining, which let escape analysis see full object lifecycles and scalar-replace allocations that previously escaped analysis boundaries</td><td>Compare <code>-XX:+PrintEscapeAnalysis</code> output before/after refactor for the same allocation site</td><td>Keep hot-path methods small and inlinable; avoid unnecessary indirection in performance-critical code</td></tr>
<tr><td>An object expected to be scalar-replaced is not, and GC pressure stays high</td><td>The object escapes via a code path the developer didn't notice - e.g. added to a debug log statement or exception message lazily</td><td>Search for any place the object reference is stored, logged, or passed to an unfamiliar API</td><td>Remove or restructure the escaping reference (e.g. build the log message from primitives instead of passing the object)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is escape analysis?</td><td>A JIT compiler technique that determines whether an object's lifetime is confined to the allocating method, enabling optimizations like scalar replacement and lock elision</td></tr>
<tr><td>What does it mean for an object to "escape"?</td><td>The object becomes reachable outside the method that created it - e.g. returned, stored in a field, or assigned to a static/shared variable</td></tr>
<tr><td>What is scalar replacement?</td><td>Replacing an object's fields with individual scalar values tracked by the compiler (often in registers), avoiding heap allocation of the object entirely</td></tr>
<tr><td>Does escape analysis guarantee stack allocation?</td><td>No - the more accurate outcome is the object may never be materialized in memory at all via scalar replacement, not simply moved from heap to stack</td></tr>
<tr><td>What is lock elision?</td><td>Removing synchronization overhead from a lock proven to only ever be accessed by the current thread (thread-local, non-escaping object)</td></tr>
<tr><td>Why does method inlining improve escape analysis effectiveness?</td><td>Inlining brings an object's full usage into one compiled scope, making it far more likely the compiler can prove NoEscape</td></tr>
<tr><td>Is escape analysis something a developer configures directly?</td><td>No - it happens automatically in C2 once a method is hot enough; developers influence it indirectly via code structure (method size, avoiding unnecessary escapes)</td></tr>
</table>`
        }
    ]
};
