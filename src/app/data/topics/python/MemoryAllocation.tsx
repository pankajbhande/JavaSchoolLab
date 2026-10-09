import type { Topic } from '../../types';

export const memoryAllocation: Topic = {
    id: 'python-memory-memory-allocation',
    name: 'Memory Allocation',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Python objects carry overhead: a reference count, a type pointer and the data itself. So an <code>int</code> that needs 4 bytes in C or Java takes about <b>28 bytes</b> in CPython. Small objects are served by a fast internal allocator (<b>pymalloc</b>) that carves memory from larger <i>arenas</i> divided into <i>pools</i> and <i>blocks</i>. Containers such as lists <b>over-allocate</b> spare room so that <code>append</code> is cheap on average. <code>sys.getsizeof()</code> reports an object's own size, but only <b>shallowly</b>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 350 199" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:350px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="329.3" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="174.7" y="29.5">Arena: large block from the OS</tspan></text><rect x="10" y="47" width="329.3" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="174.7" y="66.5">Pool: fixed-size blocks of one size class</tspan></text><rect x="10" y="84" width="329.3" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="174.7" y="103.5">Block: holds one small object</tspan></text><rect x="10" y="121" width="329.3" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="174.7" y="140.5">List object: header + pointer array</tspan></text><rect x="10" y="158" width="329.3" height="31" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="174.7" y="177.5">spare slots: extra room for fast append</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: small objects come from pools; lists keep spare capacity</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Programs that store millions of small values use far more RAM than the raw data suggests, and developers cannot tell where it goes without understanding the per-object cost.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Estimate memory use before building large data structures.</li>
<li>Understand why <code>append</code> is amortized O(1) (over-allocation).</li>
<li>Know that <code>getsizeof</code> excludes the objects a container refers to.</li>
<li>Decide when to switch to compact types (<code>array</code>, NumPy, generators).</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Shallow size, deep size and list growth</h4>
Exact byte counts vary by Python version, so the program compares sizes instead of printing them.`,
            codeExamples: [
                `import sys

ITEMS = 1000
APPENDS = 100


def deep_size(numbers):
    shallow = sys.getsizeof(numbers)
    return shallow + sum(sys.getsizeof(n) for n in numbers)


def count_resizes(appends):
    items = []
    last = sys.getsizeof(items)
    resizes = 0
    for i in range(appends):
        items.append(i)
        size = sys.getsizeof(items)
        if size != last:                 # the list grew its buffer
            resizes += 1
            last = size
    return resizes


def main():
    numbers = list(range(ITEMS))
    print("int bigger than 8 bytes:", sys.getsizeof(1) > 8)
    print("big int bigger than small:", sys.getsizeof(10 ** 100) > sys.getsizeof(1))
    print("empty smaller than full:", sys.getsizeof([]) < sys.getsizeof(numbers))
    print("deep bigger than shallow:", deep_size(numbers) > sys.getsizeof(numbers))
    print("resizes fewer than appends:", count_resizes(APPENDS) < APPENDS)


if __name__ == "__main__":
    main()

# OUTPUT:
# int bigger than 8 bytes: True
# big int bigger than small: True
# empty smaller than full: True
# deep bigger than shallow: True
# resizes fewer than appends: True`
            ],
            codeExplanations: [
                `Every int is an object bigger than a bare 8-byte pointer, and larger numbers need more digits. getsizeof(numbers) counts only the list's pointer array; adding the size of each int shows the real footprint. Over-allocation means the buffer grows only a handful of times during 100 appends.`
            ]
        },
        {
            content: `<h4>Objects Take More Space Than You Think</h4>
In C an <code>int</code> is 4 bytes. In Python an <code>int</code> is a full object with a reference count, a type pointer and its digits, so even <code>1</code> takes roughly <b>28 bytes</b> on a 64-bit build. <code>sys.getsizeof(obj)</code> reports the size of the object itself.`,
            codeExamples: [
                `import sys

print(sys.getsizeof(1))
print(sys.getsizeof(1.0))
print(sys.getsizeof("a"))
print(sys.getsizeof([]))
print(sys.getsizeof({}))

# OUTPUT (typical values for 64-bit Python 3.12; they vary by version):
# 28
# 24
# 42
# 56
# 64`
            ]
        },
        {
            content: `<h4>getsizeof Is Shallow</h4>
It counts only the container itself - <b>not the objects it refers to</b>. A list of a million numbers is much bigger than <code>getsizeof</code> suggests, because each number is its own object.`,
            codeExamples: [
                `import sys

numbers = list(range(1000))
print(sys.getsizeof(numbers))                       # just the list's pointer array
print(sum(sys.getsizeof(n) for n in numbers) > sys.getsizeof(numbers))

# OUTPUT (the first number varies by version):
# 8056
# True`
            ]
        },
        {
            content: `<h4>Lists Over-Allocate</h4>
Growing a list one item at a time would mean copying it on every <code>append</code>. Instead Python reserves <b>extra room</b>, so most appends are free and occasionally the size jumps. That is why <code>append</code> is "amortized O(1)".`,
            codeExamples: [
                `import sys

items = []
last = sys.getsizeof(items)
changes = 0

for i in range(100):
    items.append(i)
    size = sys.getsizeof(items)
    if size != last:
        changes += 1
        last = size

print(changes < 20)           # far fewer resizes than appends

# OUTPUT:
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>pymalloc: Python's Small-Object Allocator</h3>
Calling the operating system's <code>malloc</code> for every tiny object would be slow and fragment memory. CPython therefore layers its own allocator, <b>pymalloc</b>, for objects of <b>512 bytes or less</b>:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>What it is</th></tr>
<tr class='text-center'><td><b>Arena</b></td><td>A large chunk requested from the OS (1 MiB on 3.10+; 256 KiB before)</td></tr>
<tr class='text-center'><td><b>Pool</b></td><td>A slice of an arena (16 KiB on 3.10+) dedicated to one block size class</td></tr>
<tr class='text-center'><td><b>Block</b></td><td>A fixed-size slot in a pool holding one object (size classes in steps of 16 bytes on 64-bit)</td></tr>
</table>
Allocating takes the next free block from a pool of the right size class; freeing puts the block back on that pool's free list - very fast, and no per-object malloc overhead. Anything larger than 512 bytes goes straight to the system <code>malloc</code>.`
        },
        {
            content: `<h3>Why the Process Size Doesn't Always Shrink</h3>
An arena is returned to the OS only when <b>every</b> block in it is free. A few long-lived objects scattered across arenas can pin them all, so after freeing a million objects the process may still hold most of its memory (it is reused by later allocations, but the OS shows it as used). This is <b>fragmentation</b>, and a common cause of "my Python process never gives memory back".

Mitigations: allocate big short-lived data in a <b>separate process</b> (a worker that exits), keep long-lived and short-lived objects apart, use compact structures (<code>array</code>, <code>numpy</code>, <code>__slots__</code>), or process data in chunks and streams.`,
            codeExamples: [
                `import sys

class Plain:
    def __init__(self):
        self.a = 1
        self.b = 2

class Slotted:
    __slots__ = ("a", "b")
    def __init__(self):
        self.a = 1
        self.b = 2

print(hasattr(Plain(), "__dict__"))       # each instance carries a dict
print(hasattr(Slotted(), "__dict__"))     # no per-instance dict

# OUTPUT:
# True
# False`
            ],
            codeExplanations: [
                `A normal instance stores its attributes in a per-instance dictionary, which costs memory. __slots__ replaces it with a small fixed array of attribute slots, which can cut memory per instance substantially when you create millions of small objects. The trade-off: you cannot add arbitrary new attributes.`
            ]
        },
        {
            content: `<h3>Free Lists and Reuse</h3>
CPython keeps small <b>free lists</b> of recently freed objects of hot types (floats, tuples of small sizes, lists, dicts, frames) and reuses them for the next allocation instead of going through the allocator. This is why a newly created list often reuses the address of one that was just freed - the cause of some surprising <code>id()</code> results (see the last topic of this module).`
        },
        {
            content: `<h3>Measuring: tracemalloc and sys._debugmallocstats</h3>
<code>tracemalloc</code> records where memory is allocated, so you can see the current and peak usage and find the lines responsible for growth. <code>sys._debugmallocstats()</code> dumps pymalloc's arenas, pools and size classes to stderr.`,
            codeExamples: [
                `import tracemalloc

tracemalloc.start()

data = [str(i) for i in range(100_000)]

current, peak = tracemalloc.get_traced_memory()
print(current > 1_000_000, peak >= current)

snapshot = tracemalloc.take_snapshot()
top = snapshot.statistics("lineno")[0]
print(top.size > 1_000_000)           # the comprehension line is the top allocator

tracemalloc.stop()

# OUTPUT:
# True True
# True`
            ]
        },
        {
            content: `<h3>Configuring the Allocator</h3>
<ul>
<li><code>PYTHONMALLOC=debug</code> adds guard bytes around blocks to detect buffer overruns in C extensions.</li>
<li><code>PYTHONMALLOC=malloc</code> bypasses pymalloc so tools like <b>Valgrind</b> and <b>AddressSanitizer</b> can see every allocation.</li>
<li>Free-threaded builds of Python 3.13+ use <b>mimalloc</b> instead of pymalloc, because pymalloc relies on the GIL.</li>
<li>Choose compact structures deliberately: <code>array.array('i', ...)</code> stores raw 4-byte ints (about 8x smaller than a list of int objects), <code>bytes</code>/<code>bytearray</code> for binary data, generators instead of lists for streams, and <code>numpy</code> arrays for numeric work.</li>
</ul>`,
            codeExamples: [
                `import sys
from array import array

as_list = list(range(100_000))
as_array = array("i", range(100_000))

list_total = sys.getsizeof(as_list) + sum(sys.getsizeof(n) for n in as_list)
print(sys.getsizeof(as_array) < list_total / 5)

# OUTPUT:
# True`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>pymalloc makes small-object allocation fast</td><td>Each object has header overhead (about 28 bytes for an int)</td></tr>
<tr><td>Over-allocation gives amortized O(1) <code>append</code></td><td>Lists reserve spare capacity that may go unused</td></tr>
<tr><td>Memory is managed automatically: no manual malloc/free</td><td><code>getsizeof</code> is shallow and misleads on containers</td></tr>
<tr><td><code>sys.getsizeof</code> and <code>tracemalloc</code> help measure usage</td><td>Memory is not always returned to the operating system</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does a Python int take about 28 bytes?</td><td>It is a full heap object: reference count, type pointer, size and digit storage</td></tr>
<tr class='text-center'><td>What does <code>sys.getsizeof</code> not include?</td><td>The size of the objects a container refers to (it is shallow)</td></tr>
<tr class='text-center'><td>What is pymalloc?</td><td>CPython's allocator for objects of 512 bytes or less, organised into arenas, pools and blocks</td></tr>
<tr class='text-center'><td>Why might memory not return to the OS after freeing objects?</td><td>Arenas are released only when completely empty; fragmentation keeps them pinned</td></tr>
<tr class='text-center'><td>How do you find what is using memory?</td><td><code>tracemalloc</code> snapshots, or <code>gc.get_objects()</code> counts by type</td></tr>
<tr class='text-center'><td>How does <code>__slots__</code> save memory?</td><td>It removes the per-instance <code>__dict__</code>, storing attributes in fixed slots</td></tr>
</table>`
        }
    ]
};
