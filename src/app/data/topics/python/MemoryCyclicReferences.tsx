import type { Topic } from '../../types';

export const memoryCyclicReferences: Topic = {
    id: 'python-memory-cyclic-references',
    name: 'Cyclic References',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>reference cycle</b> exists when objects refer to each other in a loop: A refers to B and B refers back to A, or an object refers to itself. After you delete every outside name, each member of the cycle is still referenced by another member, so its count never reaches zero. Such objects stay in memory until the cyclic collector finds them. A typical source is a <b>parent-child</b> structure where the child stores a link back to its parent. In Java the JVM garbage collector traces reachability and handles cycles natively, so this problem is specific to reference-counting runtimes like CPython.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 374 155" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:374px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<line x1="80.0" y1="25.5" x2="150.0" y2="25.5" stroke="#6b7280" stroke-dasharray="5 4" marker-end="url(#ar)"/><text x="119.0" y="21.5" font-size="11" fill="#6b7280">del</text><line x1="220.0" y1="25.5" x2="290.0" y2="25.5" stroke="#6b7280" marker-end="url(#ar)"/><line x1="314.1" y1="41.0" x2="265.9" y2="110.0" stroke="#6b7280" marker-end="url(#ar)"/><line x1="244.2" y1="110.0" x2="195.8" y2="41.0" stroke="#6b7280" stroke-dasharray="5 4" marker-end="url(#ar)"/><text x="224.0" y="71.5" font-size="11" fill="#6b7280">cycle</text><rect x="10" y="10" width="70" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="45" y="29.5">name</tspan></text><rect x="150" y="10" width="70" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="185" y="29.5">A</tspan></text><rect x="290" y="10" width="70" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="325" y="29.5">B</tspan></text><rect x="220" y="110" width="70" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="255" y="129.5">C</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: after the outside name is deleted, A, B and C still keep each other alive</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Trees, graphs, doubly linked lists and GUI widgets naturally store links in both directions. Each such link silently creates a cycle that delays freeing memory and releasing resources.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Spot the places in your design where cycles appear.</li>
<li>Break a cycle with a <b>weak reference</b> for the back-link.</li>
<li>Understand why memory use can be higher than expected.</li>
<li>Avoid relying on <code>__del__</code> for objects that sit in cycles.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: A strong back-link leaks until collected; a weak one does not</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import gc
import weakref


class Node:
    def __init__(self, name):
        self.name = name
        self.child = None
        self.parent = None


def build_strong():
    parent = Node("parent")
    child = Node("child")
    parent.child = child
    child.parent = parent                    # strong back-link: a cycle
    return weakref.ref(parent)


def build_weak():
    parent = Node("parent")
    child = Node("child")
    parent.child = child
    child.parent = weakref.ref(parent)       # weak back-link: no cycle
    return weakref.ref(parent)


def main():
    gc.disable()

    strong = build_strong()
    print("strong, after return:", strong() is not None)
    gc.collect()
    print("strong, after collect:", strong() is not None)

    weak = build_weak()
    print("weak, after return:", weak() is not None)

    gc.enable()


if __name__ == "__main__":
    main()

# OUTPUT:
# strong, after return: True
# strong, after collect: False
# weak, after return: False`
            ],
            codeExplanations: [
                `With the strong back-link the parent and child keep each other alive after the function returns; only gc.collect() frees them. With a weak back-link there is no cycle, so reference counting frees the parent the moment build_weak() returns, without any help from the collector.`
            ]
        },
        {
            content: `<h4>What is a Reference Cycle?</h4>
A <b>reference cycle</b> exists when objects refer to each other in a loop: A refers to B and B refers back to A (or an object refers to itself). Even after you delete every outside name, each object still has a reference from the other, so reference counting never reaches zero and cannot free them. They stay in memory until the cyclic garbage collector finds them.`,
            codeExamples: [
                `lst = []
lst.append(lst)           # a list that contains itself

print(lst)
print(lst[0] is lst)

# OUTPUT:
# [[...]]
# True`
            ]
        },
        {
            content: `<h4>A Cycle That Reference Counting Cannot Free</h4>
We disable the automatic collector to see the problem clearly. The objects survive <code>del</code>, and only an explicit collection frees them.`,
            codeExamples: [
                `import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.peer = None
    def __del__(self):
        print("freeing", self.name)

gc.disable()                      # stop automatic collection for the demo

a = Node("A")
b = Node("B")
a.peer = b
b.peer = a                        # the cycle

del a, b
print("names deleted, nothing freed yet")

gc.collect()                      # the cycle collector frees both
print("after gc.collect()")

gc.enable()

# OUTPUT (the order of the two "freeing" lines may vary):
# names deleted, nothing freed yet
# freeing A
# freeing B
# after gc.collect()`
            ]
        },
        {
            content: `<h4>Where Cycles Come From in Real Code</h4>
<ul>
<li><b>Parent and child</b> objects where each stores the other (tree nodes with a <code>parent</code> link, GUI widgets with a <code>master</code>).</li>
<li><b>Doubly linked lists</b> and graphs.</li>
<li><b>Callbacks and observers:</b> an object stores a bound method or lambda that refers back to the object itself.</li>
<li><b>Caches</b> that hold objects which in turn hold the cache.</li>
</ul>
Cycles are usually harmless - the collector cleans them up - but they delay freeing (so memory use is higher) and any <code>__del__</code> or resource release is also delayed.`
        }
    ],

    expert: [
        {
            content: `<h3>Breaking Cycles With Weak References</h3>
The cleanest fix is to make one direction of the relationship <b>weak</b>: a <code>weakref</code> refers to an object without keeping it alive. The child can look up its parent, but the parent no longer depends on the child's reference to stay alive.`,
            codeExamples: [
                `import weakref

class Parent:
    def __init__(self):
        self.children = []
    def __del__(self):
        print("Parent freed")

class Child:
    def __init__(self, parent):
        self.parent = weakref.ref(parent)      # weak: no cycle

parent = Parent()
child = Child(parent)
parent.children.append(child)

print(child.parent() is parent)
del parent                                     # freed at once, without the GC
print(child.parent())

# OUTPUT:
# True
# Parent freed
# None`
            ]
        },
        {
            content: `<h3>Hidden Cycles</h3>
Some cycles are not obvious:
<ul>
<li><b>Bound methods and lambdas stored on self:</b> <code>self.cb = self.on_event</code> or <code>self.cb = lambda: self.x</code> make <code>self</code> refer to itself through the callback.</li>
<li><b>Exceptions:</b> an exception holds its traceback, the traceback holds each frame, and a frame's locals may hold the exception. This is why Python <b>deletes the name</b> in <code>except ... as e</code> at the end of the block. Storing <code>e</code> in a longer-lived variable recreates the cycle and keeps every local in the failing frames alive.</li>
<li><b>Closures:</b> a function that refers to itself through a free variable (a recursive inner function).</li>
</ul>`,
            codeExamples: [
                `import gc

class Widget:
    def __init__(self):
        self.callback = self.on_click      # self -> bound method -> self

    def on_click(self):
        pass

w = Widget()
print(w.callback.__self__ is w)           # the cycle: w -> callback -> w

del w
print(gc.collect() > 0)                    # only the cycle collector frees it

# OUTPUT:
# True
# True`
            ]
        },
        {
            content: `<h3>Finding Cycles</h3>
<code>gc.set_debug(gc.DEBUG_SAVEALL)</code> makes the collector keep every object it finds unreachable in the list <code>gc.garbage</code> instead of freeing it, so you can inspect what was in a cycle.`,
            codeExamples: [
                `import gc

class Node:
    pass

gc.collect()
gc.set_debug(gc.DEBUG_SAVEALL)

a = Node()
a.me = a                      # an object referring to itself
del a
gc.collect()

found = [o for o in gc.garbage if isinstance(o, Node)]
print(len(found))

gc.set_debug(0)               # restore normal behaviour
gc.garbage.clear()

# OUTPUT:
# 1`
            ]
        },
        {
            content: `<h3>Cycles and __del__</h3>
Before Python 3.4, an object with a <code>__del__</code> method that was part of a cycle could <b>never</b> be collected and ended up in <code>gc.garbage</code> forever (a real leak). <b>PEP 442</b> fixed this: the collector now safely finalizes such objects. <code>gc.garbage</code> is nowadays only for rare uncollectable objects (typically from C extensions).

Design guidance:
<ul>
<li>Prefer <b>ownership trees</b>: parents own children, children hold weak references upward.</li>
<li>Don't rely on prompt cleanup of objects in cycles - use <code>with</code> blocks for resources.</li>
<li>Don't call <code>gc.collect()</code> habitually to "fix" memory: if memory keeps growing, find what still holds references (<code>gc.get_referrers</code>, <code>tracemalloc</code>).</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Cycles let you model real structures: trees, graphs, parent links</td><td>Memory is held longer than needed</td></tr>
<tr><td>The collector eventually reclaims them automatically</td><td><code>__del__</code> and resource release are delayed</td></tr>
<tr><td>Weak back-links remove the cycle but keep navigation</td><td>Cycles are invisible in the code until you look for them</td></tr>
<tr><td>Detectable with <code>gc.collect()</code> and <code>gc.get_referrers()</code></td><td>Weak links add code and may return <code>None</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a reference cycle?</td><td>Objects that reference each other (or themselves), so their counts never reach zero</td></tr>
<tr class='text-center'><td>Who frees a cycle?</td><td>The cyclic garbage collector (<code>gc</code> module), not reference counting</td></tr>
<tr class='text-center'><td>How can you avoid cycles in a parent/child design?</td><td>Make the back-reference (child to parent) a <code>weakref</code></td></tr>
<tr class='text-center'><td>Why does Python delete <code>e</code> after an except block?</td><td>To avoid the cycle exception -> traceback -> frame -> e</td></tr>
<tr class='text-center'><td>Can objects with <code>__del__</code> in a cycle be collected?</td><td>Yes since Python 3.4 (PEP 442); before that they leaked into <code>gc.garbage</code></td></tr>
</table>`
        }
    ]
};
