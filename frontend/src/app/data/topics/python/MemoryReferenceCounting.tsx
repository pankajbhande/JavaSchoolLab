import type { Topic } from '../../types';

export const memoryReferenceCounting: Topic = {
    id: 'python-memory-reference-counting',
    name: 'Reference Counting',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Every CPython object carries a hidden counter: <b>how many references point to it</b>. Creating a reference raises the count; losing one lowers it. The moment the count reaches <b>zero</b>, nobody can reach the object, so CPython frees it <i>immediately</i>. This is CPython's main memory-management method. Java works differently: the JVM garbage collector frees objects at a time it chooses, so Java has no equivalent of Python's predictable cleanup.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 649 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:649px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="118.9" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="69.4" y="30.5">Resource("A")</tspan><tspan x="69.4" y="45.5">count = 1</tspan></text><line x1="128.9" y1="34" x2="158.9" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="162.9" y="10" width="89.7" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="207.7" y="30.5">y = x</tspan><tspan x="207.7" y="45.5">count = 2</tspan></text><line x1="252.6" y1="34" x2="282.6" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="286.6" y="10" width="89.7" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="331.5" y="30.5">del y</tspan><tspan x="331.5" y="45.5">count = 1</tspan></text><line x1="376.3" y1="34" x2="406.3" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="410.3" y="10" width="89.7" height="48" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="455.2" y="30.5">del x</tspan><tspan x="455.2" y="45.5">count = 0</tspan></text><line x1="500" y1="34" x2="530" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="534" y="10" width="104.3" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="586.2" y="30.5">freed</tspan><tspan x="586.2" y="45.5">immediately</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: each reference adds one; at zero the object is freed on the spot</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without automatic counting you would free memory by hand (C's <code>free</code>) and risk leaks, double frees and dangling pointers.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Memory is released <b>instantly</b> when the last reference goes away.</li>
<li>Files, sockets and locks held by an object are released at a <b>predictable</b> moment.</li>
<li>Lets you reason about lifetime without a background collector.</li>
<li>Explains why <code>del</code> only removes a name, not necessarily the object.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Counting references and watching the object die</h4>
To avoid version-specific absolute numbers, the program prints the <i>change</i> in <code>sys.getrefcount()</code>.`,
            codeExamples: [
                `import sys


class Resource:
    def __init__(self, name):
        self.name = name

    def __del__(self):
        print("freeing", self.name)


def main():
    x = Resource("A")
    base = sys.getrefcount(x)
    y = x                                       # one more name
    print("alias adds:", sys.getrefcount(x) - base)

    box = [x]                                   # a container counts too
    print("alias + list adds:", sys.getrefcount(x) - base)

    del y
    del box
    print("after deletes adds:", sys.getrefcount(x) - base)

    del x                                       # the last reference
    print("after del x")

    r = Resource("B")
    r = Resource("C")                           # rebinding frees B
    print("main ends")


if __name__ == "__main__":
    main()

# OUTPUT:
# alias adds: 1
# alias + list adds: 2
# after deletes adds: 0
# freeing A
# after del x
# freeing B
# main ends
# freeing C`
            ],
            codeExplanations: [
                `Each extra name or container adds one to the count, and removing them takes it back to the baseline. del x drops the last reference, so "freeing A" is printed before "after del x". Rebinding r to a new object releases B at once. C is freed when main() returns and its local names disappear. This is CPython behaviour; other implementations may free later.`
            ]
        },
        {
            content: `<h4>How CPython Frees Memory</h4>
Every object carries a hidden counter: <b>how many references point to it</b>. When a reference is created the count goes up; when one disappears it goes down. The instant the count reaches <b>zero</b>, nobody can reach the object any more, so CPython frees it immediately. This is the main memory-management mechanism in CPython (the standard Python interpreter). A separate garbage collector exists only for the cases reference counting cannot handle.`
        },
        {
            content: `<h4>Watching the Count With sys.getrefcount()</h4>
<code>sys.getrefcount(obj)</code> returns the count. It is always <b>one higher than you expect</b> because passing <code>obj</code> as an argument creates a temporary extra reference.`,
            codeExamples: [
                `import sys

x = []
print(sys.getrefcount(x))      # the name x + the function argument

y = x                          # another name
print(sys.getrefcount(x))

container = [x]                # a list holding a reference also counts
print(sys.getrefcount(x))

del y
del container
print(sys.getrefcount(x))

# OUTPUT:
# 2
# 3
# 4
# 2`
            ],
            codeExplanations: [
                `Every extra name, every container that holds the object, adds one. del removes a name (and deleting the container drops its reference to x). The baseline of 2 is the name x plus the temporary reference created by the call to getrefcount itself.`
            ]
        },
        {
            content: `<h4>Immediate, Predictable Cleanup</h4>
A class can define <code>__del__</code>, called just before the object is destroyed. It lets us <b>see</b> exactly when the count hits zero.`,
            codeExamples: [
                `class Resource:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print(f"freeing {self.name}")

a = Resource("A")
b = a                          # two references to one object
del a
print("after del a")           # still alive: b refers to it
del b
print("after del b")           # count reached zero: freed immediately

# OUTPUT:
# after del a
# freeing A
# after del b`
            ]
        },
        {
            content: `<h4>Rebinding Drops a Reference Too</h4>
Pointing a name at something else releases the old object at once - no waiting for a collector. This deterministic cleanup is a big difference from Java's garbage collector, which frees objects at an unpredictable time.`,
            codeExamples: [
                `class Resource:
    def __init__(self, name):
        self.name = name
    def __del__(self):
        print(f"freeing {self.name}")

r = Resource("A")
r = Resource("B")              # the only reference to A is replaced
print("end")
del r

# OUTPUT:
# freeing A
# end
# freeing B`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What Changes a Reference Count?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Increases the count</th><th>Decreases the count</th></tr>
<tr class='text-center'><td>Assigning to a name (<code>y = x</code>)</td><td><code>del y</code>, or the name going out of scope</td></tr>
<tr class='text-center'><td>Passing as an argument</td><td>The function returning (its locals die)</td></tr>
<tr class='text-center'><td>Putting in a list, dict, tuple, set</td><td>Removing from, or destroying, the container</td></tr>
<tr class='text-center'><td>Setting as an attribute</td><td>Overwriting the attribute or deleting the owner</td></tr>
<tr class='text-center'><td>Capturing in a closure cell</td><td>The closure being destroyed</td></tr>
</table>
Destroying an object <b>cascades</b>: when a list is freed, every item it referenced has its count decremented, which can free those in turn.`,
            codeExamples: [
                `import sys

class Item:
    def __del__(self):
        print("Item freed")

item = Item()
bag = [item, item]              # the list holds two references
print(sys.getrefcount(item) - 1)   # subtract the argument's temporary one

del item                        # the name is gone, the list keeps it alive
print("name deleted")
del bag                         # the list dies, which frees the item
print("bag deleted")

# OUTPUT:
# 3
# name deleted
# Item freed
# bag deleted`
            ]
        },
        {
            content: `<h3>Immortal Objects (Python 3.12+)</h3>
Objects that live for the whole program - <code>None</code>, <code>True</code>, <code>False</code>, small integers, interned strings - are <b>immortal</b> from Python 3.12 (PEP 683): their count is a fixed huge value that is never changed. This avoids pointless updates and is a prerequisite for sharing objects between interpreters. As a result <code>sys.getrefcount(None)</code> shows a very large constant that no longer reflects real usage.`,
            codeExamples: [
                `import sys

print(sys.getrefcount(None) > 1_000_000)   # True on 3.12+, small number before

# OUTPUT (Python 3.12 or newer):
# True`
            ]
        },
        {
            content: `<h3>Strengths and Weaknesses</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strengths</th><th>Weaknesses</th></tr>
<tr class='text-center'><td>Memory is reclaimed immediately, so peak usage stays low</td><td><b>Cycles are never freed</b> by counting alone: two objects referring to each other never reach zero</td></tr>
<tr class='text-center'><td>Deterministic: resources (files, locks) can be released at predictable points</td><td>Every reference change costs an increment or decrement - overhead on every assignment</td></tr>
<tr class='text-center'><td>No long "stop-the-world" pauses</td><td>The count updates are why CPython needs the GIL: they are not thread-safe on their own</td></tr>
<tr class='text-center'><td>Simple and local</td><td>Cascading frees of huge structures can cause a short pause</td></tr>
</table>`
        },
        {
            content: `<h3>__del__ Is Not a Safe Place for Cleanup</h3>
<ul>
<li>Do not rely on <code>__del__</code> to release important resources: it may run late (if a reference lingers in a traceback or cycle), may not run at interpreter shutdown, and other CPython-like implementations (PyPy) call it at unpredictable times.</li>
<li>Exceptions raised inside <code>__del__</code> are printed and ignored, never propagated.</li>
<li>Prefer <b>context managers</b> (<code>with</code>) or <code>try/finally</code> for deterministic cleanup, and <code>weakref.finalize</code> for a safe "run this when the object dies" callback.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Memory is reclaimed immediately, with no long pauses</td><td>Cannot free reference cycles on its own</td></tr>
<tr><td>Predictable cleanup of files, locks and connections</td><td>Every assignment updates a counter: small speed cost</td></tr>
<tr><td>Simple idea that is easy to reason about</td><td>Counters make sharing objects between threads harder (the GIL)</td></tr>
<tr><td>Works with <code>__del__</code> and <code>weakref</code> callbacks</td><td>Behaviour is CPython-specific; PyPy and Jython differ</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does CPython manage memory?</td><td>Mainly by reference counting (freed at zero), plus a cyclic garbage collector for reference cycles</td></tr>
<tr class='text-center'><td>Why does <code>sys.getrefcount(x)</code> show one more than expected?</td><td>The argument passed to the function is a temporary extra reference</td></tr>
<tr class='text-center'><td>What is the main weakness of reference counting?</td><td>It cannot free cycles of objects that reference each other</td></tr>
<tr class='text-center'><td>What are immortal objects?</td><td>Python 3.12+ objects such as None and small ints whose refcount is never modified</td></tr>
<tr class='text-center'><td>Why is relying on <code>__del__</code> discouraged?</td><td>Its timing is not guaranteed in cycles or at shutdown, and errors in it are swallowed; use <code>with</code> or <code>weakref.finalize</code></td></tr>
</table>`
        }
    ]
};
