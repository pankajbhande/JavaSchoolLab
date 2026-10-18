import type { Topic } from '../../types';

export const memoryGarbageCollection: Topic = {
    id: 'python-memory-garbage-collection-the-gc-module',
    name: 'Garbage Collection & the gc Module',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Reference counting cannot free <b>reference cycles</b>, so CPython adds a <b>cyclic garbage collector</b> that runs in the background. It examines container objects, finds groups reachable only from each other, and frees them. To keep the cost low, objects are sorted into <b>three generations</b> (0, 1 and 2): new objects start in generation 0, and survivors are promoted to older generations that are examined less often. This is similar to the generational heap of the JVM, but in Python it only supplements reference counting. The <code>gc</code> module lets you inspect and control it.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 445 83" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:445px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="118.9" height="63" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="69.4" y="30.5">Generation 0</tspan><tspan x="69.4" y="45.5">new objects</tspan><tspan x="69.4" y="60.5">checked often</tspan></text><line x1="128.9" y1="41.5" x2="158.9" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="162.9" y="10" width="111.6" height="63" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="218.7" y="30.5">Generation 1</tspan><tspan x="218.7" y="45.5">survivors</tspan><tspan x="218.7" y="60.5">checked less</tspan></text><line x1="274.5" y1="41.5" x2="304.5" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="308.5" y="10" width="126.2" height="63" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="371.6" y="30.5">Generation 2</tspan><tspan x="371.6" y="45.5">long-lived</tspan><tspan x="371.6" y="60.5">checked rarely</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: objects that survive a collection move to an older generation</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without a cycle collector, objects that point to each other would leak memory forever, and long-running servers would slowly run out of RAM.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Reclaim memory that reference counting alone can never free.</li>
<li>Run automatically, so most programs never think about cycles.</li>
<li>Give tools (<code>gc.collect()</code>, thresholds, <code>get_objects()</code>) for tuning and leak hunting.</li>
<li>Understand why generational collection keeps pauses short.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: The collector frees a cycle</h4>
A <code>weakref</code> acts as a probe that tells us whether the object is still alive.`,
            codeExamples: [
                `import gc
import weakref


class Node:
    def __init__(self):
        self.peer = None


def make_cycle():
    a = Node()
    b = Node()
    a.peer = b
    b.peer = a                       # a -> b -> a: a cycle
    return weakref.ref(a)            # a probe, not a real owner


def main():
    gc.disable()                     # make the demo deterministic
    probe = make_cycle()
    print("alive after return:", probe() is not None)

    found = gc.collect()
    print("collector found garbage:", found > 0)
    print("alive after collect:", probe() is not None)

    gc.enable()
    print("generations:", len(gc.get_threshold()))


if __name__ == "__main__":
    main()

# OUTPUT:
# alive after return: True
# collector found garbage: True
# alive after collect: False
# generations: 3`
            ],
            codeExplanations: [
                `When make_cycle() returns, both nodes still refer to each other, so their reference counts stay above zero and the probe still returns the node. gc.collect() proves they are unreachable and frees them, so the probe becomes empty. get_threshold() returns one threshold per generation: three of them. Exact counts returned by collect() vary by version, so only "greater than zero" is printed.`
            ]
        },
        {
            content: `<h4>Why a Garbage Collector at All?</h4>
Reference counting frees most objects the moment they are unused, but it cannot free <b>reference cycles</b> (objects that point to each other). For those, CPython adds a <b>cyclic garbage collector</b>. It runs automatically in the background, finds groups of objects that are only reachable from each other, and frees them. You normally never think about it - but the <code>gc</code> module lets you inspect and control it.`
        },
        {
            content: `<h4>Collecting Garbage Manually</h4>
<code>gc.collect()</code> runs a full collection right now and returns the number of unreachable objects it found.`,
            codeExamples: [
                `import gc

class Node:
    pass

a = Node()
b = Node()
a.other = b
b.other = a              # a cycle: a -> b -> a

del a, b                 # no names left, but the counts are not zero
found = gc.collect()     # the collector finds and frees the cycle
print(found > 0)

# OUTPUT:
# True`
            ],
            codeExplanations: [
                `After del, each Node is still referenced by the other, so reference counting alone cannot free them. gc.collect() traces what is reachable from live variables, discovers these two are not, and frees them. The exact number returned varies between Python versions, so the example only checks that something was found.`
            ]
        },
        {
            content: `<h4>The gc Module at a Glance</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Purpose</th></tr>
<tr class='text-center'><td><code>gc.collect()</code></td><td>Run a full collection now</td></tr>
<tr class='text-center'><td><code>gc.isenabled()</code></td><td>Is automatic collection on?</td></tr>
<tr class='text-center'><td><code>gc.disable()</code> / <code>gc.enable()</code></td><td>Turn automatic collection off / on</td></tr>
<tr class='text-center'><td><code>gc.get_threshold()</code> / <code>gc.set_threshold()</code></td><td>Read or change when automatic collections trigger</td></tr>
<tr class='text-center'><td><code>gc.get_count()</code></td><td>Current allocation counters per generation</td></tr>
<tr class='text-center'><td><code>gc.get_objects()</code></td><td>List every tracked object (useful for leak hunting)</td></tr>
<tr class='text-center'><td><code>gc.get_referrers(obj)</code></td><td>Who refers to this object?</td></tr>
</table>`,
            codeExamples: [
                `import gc

print(gc.isenabled())
print(gc.get_threshold())        # (700, 10, 10) on Python 3.12 and earlier

# OUTPUT:
# True
# (700, 10, 10)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Generational Collection</h3>
Scanning every object constantly would be slow. The collector relies on the <b>generational hypothesis</b>: most objects die young. Objects are split into three <b>generations</b>:
<ul>
<li><b>Generation 0</b> - newly created objects, collected most often.</li>
<li><b>Generation 1</b> - survivors of a gen-0 collection.</li>
<li><b>Generation 2</b> - long-lived survivors, collected rarely (and most expensively).</li>
</ul>
With the classic thresholds <code>(700, 10, 10)</code>: gen 0 is collected when allocations minus deallocations of tracked objects exceed 700; gen 1 after 10 gen-0 collections; gen 2 after 10 gen-1 collections. The details evolve between versions (Python 3.13 and 3.14 have been changing the collector, including incremental collection), so treat thresholds as tunable rather than fixed.`
        },
        {
            content: `<h3>Which Objects Does the Collector Track?</h3>
Only <b>container objects</b> - those that can hold references to other objects (lists, dicts, sets, class instances, tuples). Plain numbers and strings can never take part in a cycle, so they are not tracked, which keeps collection cheap.`,
            codeExamples: [
                `import gc

print(gc.is_tracked(1))             # int: can't contain references
print(gc.is_tracked("text"))        # str: same
print(gc.is_tracked([]))            # list: can hold anything

# OUTPUT:
# False
# False
# True`
            ]
        },
        {
            content: `<h3>Observing and Tuning the Collector</h3>
<code>gc.callbacks</code> lets you hook the start and stop of every collection, which is a precise way to measure GC pauses in a service. If an application allocates lots of long-lived objects at start-up (loading a big dataset), disabling the collector during that phase, or raising the gen-0 threshold, avoids repeated pointless scans.`,
            codeExamples: [
                `import gc

def on_gc(phase, info):
    if phase == "stop":
        print(f"collection of generation {info['generation']} finished")

gc.callbacks.append(on_gc)
gc.collect()                          # a full collection is generation 2
gc.callbacks.remove(on_gc)

# Pausing the collector around a heavy allocation phase:
gc.disable()
try:
    big = [[i] for i in range(1_000_000)]
finally:
    gc.enable()

# OUTPUT:
# collection of generation 2 finished`
            ]
        },
        {
            content: `<h3>Real-World Techniques</h3>
<ul>
<li><b><code>gc.freeze()</code></b> moves all current objects to a permanent generation that is never scanned. Call it just before <code>fork()</code> in pre-fork servers (gunicorn, uWSGI) so child processes do not touch shared pages and break <b>copy-on-write</b> memory sharing.</li>
<li><b>Disabling GC entirely</b> is a known trade-off in some large web services: they avoid cycles by design, disable the collector, and run it at controlled moments (for example between requests).</li>
<li><b>Debugging leaks:</b> count object types over time with <code>collections.Counter(type(o).__name__ for o in gc.get_objects())</code>; a type whose count only grows is the suspect. <code>gc.get_referrers()</code> then shows what keeps one alive. <code>tracemalloc</code> shows where it was allocated.</li>
<li><b><code>gc.set_debug(gc.DEBUG_STATS)</code></b> prints statistics for every collection.</li>
<li><b>Most programs never need to touch GC.</b> If you do, measure first.</li>
</ul>`,
            codeExamples: [
                `import gc
from collections import Counter

class Leaky:
    registry = []                       # grows forever: a typical leak
    def __init__(self):
        Leaky.registry.append(self)

def snapshot():
    return Counter(type(o).__name__ for o in gc.get_objects())

before = snapshot()
for _ in range(1000):
    Leaky()
after = snapshot()

print(after["Leaky"] - before["Leaky"])

# OUTPUT:
# 1000`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Frees cycles that reference counting cannot</td><td>Cycle cleanup happens at an unpredictable moment</td></tr>
<tr><td>Generations keep most collections quick</td><td>Collections cost CPU time and can cause small pauses</td></tr>
<tr><td>Fully automatic; can be tuned or triggered manually</td><td>Objects with <code>__del__</code> in cycles are freed later</td></tr>
<tr><td>Rich introspection through the <code>gc</code> module</td><td>Disabling it carelessly can leak memory</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does Python need a garbage collector if it has reference counting?</td><td>To reclaim reference cycles, which never reach a count of zero</td></tr>
<tr class='text-center'><td>What is generational garbage collection?</td><td>Objects are grouped by age; young objects are scanned often, old ones rarely, because most objects die young</td></tr>
<tr class='text-center'><td>Which objects does the cycle collector track?</td><td>Only container objects that can hold references - not ints or strings</td></tr>
<tr class='text-center'><td>When might you disable the GC?</td><td>During a large allocation burst, or in a service designed without cycles - after measuring</td></tr>
<tr class='text-center'><td>What does <code>gc.freeze()</code> help with?</td><td>Preserving copy-on-write memory sharing in forked worker processes</td></tr>
</table>`
        }
    ]
};
