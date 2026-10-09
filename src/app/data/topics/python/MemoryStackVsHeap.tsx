import type { Topic } from '../../types';

export const memoryStackVsHeap: Topic = {
    id: 'python-memory-stack-vs-heap-in-python',
    name: 'Stack vs Heap in Python',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A running program keeps its data in two places. The <b>call stack</b> holds one <i>frame</i> per active function call (its local names and the return point); frames appear on a call and vanish on return. The <b>heap</b> is a large pool where objects live as long as something refers to them. In Java, primitives such as <code>int</code> sit directly in stack frames and objects sit on the JVM heap. Python has <b>no primitives</b>: every value, even <code>5</code>, is a heap object, and a stack-frame variable is only a <b>reference</b> to it.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 493 148" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:493px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="221.1" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="120.6" y="27">Call stack (frames)</tspan></text><rect x="10" y="44" width="221.1" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="120.6" y="62.5">main()   result -&gt; ref</tspan></text><rect x="10" y="79" width="221.1" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="120.6" y="97.5">build_list()   items -&gt; ref</tspan><tspan x="120.6" y="112.5">(destroyed on return)</tspan></text><rect x="261.1" y="10" width="221.1" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="371.7" y="27">Heap (objects)</tspan></text><rect x="261.1" y="44" width="221.1" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="371.7" y="62.5">list [1, 2, 3]</tspan><tspan x="371.7" y="77.5">survives while referenced</tspan></text><rect x="261.1" y="94" width="221.1" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="371.7" y="112.5">int 5, str, function...</tspan><tspan x="371.7" y="127.5">all objects live here</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: frames hold names; the heap holds every object</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> If you assume Python behaves like Java, you expect <code>int</code> variables to hold raw values and local objects to die with their function. Both assumptions are wrong in Python and lead to confusing bugs.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Know <b>where</b> names and objects live, so you can predict what survives a function return.</li>
<li>Understand why a function can safely <b>return</b> a list it created.</li>
<li>Recognise <b>RecursionError</b> as the Python form of Java's <code>StackOverflowError</code>.</li>
<li>Explain why Python numbers are bigger and slower than Java primitives.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Names in frames, objects on the heap</h4>
The helper <code>build_list()</code> creates a list in its own frame and returns it; <code>overflow()</code> shows the stack limit.`,
            codeExamples: [
                `import sys

DEPTH = 50


def build_list():
    items = [1, 2, 3]         # the name "items" lives in this frame
    return items              # the list itself is on the heap


def depth(n):
    if n == 0:
        return 0
    return 1 + depth(n - 1)   # each call adds one stack frame


def overflow(n):
    return overflow(n + 1)    # never stops: frames pile up


def main():
    result = build_list()
    print("list survived:", result)
    print("type of 5:", type(5).__name__)
    print("frames used:", depth(DEPTH))
    try:
        overflow(0)
    except RecursionError:
        print("RecursionError raised")
    print("limit above 100:", sys.getrecursionlimit() > 100)


if __name__ == "__main__":
    main()

# OUTPUT:
# list survived: [1, 2, 3]
# type of 5: int
# frames used: 50
# RecursionError raised
# limit above 100: True`
            ],
            codeExplanations: [
                `The frame of build_list() is destroyed when it returns, but the list stays alive because result refers to it. depth(50) recurses 50 times and returns the depth. overflow() never returns, so Python stops it at the recursion limit (1000 by default) and raises RecursionError.`
            ]
        },
        {
            content: `<h4>Two Places Your Data Lives</h4>
Every running program uses two areas of memory:
<ul>
<li>The <b>call stack</b> - one entry (a <b>frame</b>) per function call currently running. A frame holds that call's local variables and where to resume when it returns. Frames are created on a call and destroyed on return.</li>
<li>The <b>heap</b> - a large pool where objects are created and live for as long as something refers to them.</li>
</ul>`
        },
        {
            content: `<h4>In Python, Every Object Lives on the Heap</h4>
This is the key difference from Java. In Java, a <code>long</code> or <code>int</code> local variable holds its value directly on the stack, while objects are on the heap. Python has <b>no primitives</b>: the number <code>5</code>, a string, a list, a function and a class are all <b>objects on the heap</b>. A variable is only a <b>name that refers to</b> an object.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Primitive values</td><td>Stored directly in the stack frame</td><td>None - even <code>5</code> is an object</td></tr>
<tr class='text-center'><td>Objects</td><td>Heap</td><td>Heap (all of them)</td></tr>
<tr class='text-center'><td>A local variable holds</td><td>A value or a reference</td><td>Always a reference</td></tr>
<tr class='text-center'><td>Freed by</td><td>Garbage collector</td><td>Reference counting + cycle collector</td></tr>
</table>`,
            codeExamples: [
                `n = 5
print(type(n))
print((5).bit_length())          # numbers have methods: they are objects

def show():
    items = [1, 2, 3]            # the name "items" is in show's frame
    return items                 # the list itself is on the heap

result = show()                  # the frame is gone, the list survives
print(result)

# OUTPUT:
# <class 'int'>
# 3
# [1, 2, 3]`
            ],
            codeExplanations: [
                `The name "items" lived in the frame of show(), which was destroyed when the function returned. The list object it referred to is on the heap, and it stayed alive because "result" now refers to it. Objects live as long as at least one reference exists, not as long as the function that created them.`
            ]
        },
        {
            content: `<h4>The Call Stack Has a Limit</h4>
Each call adds a frame. Infinite or very deep recursion would use unlimited memory, so Python caps the depth (1000 by default) and raises <code>RecursionError</code> - the Python version of Java's <code>StackOverflowError</code>.`,
            codeExamples: [
                `import sys

def depth(n):
    return depth(n + 1)

print(sys.getrecursionlimit())
try:
    depth(0)
except RecursionError as error:
    print(type(error).__name__)

# OUTPUT:
# 1000
# RecursionError`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Names, Frames and Namespaces</h3>
Variables are entries in a <b>namespace</b>, not memory boxes. A function's locals live in its frame (CPython keeps them in a fast array), module-level names live in the module's dictionary, and attributes live in the object's <code>__dict__</code> (or in slots). Each name maps to a reference to a heap object.`,
            codeExamples: [
                `import sys

x = [1, 2, 3]
print(globals()["x"] is x)           # module names are dictionary entries

def inspect_frame():
    local_value = 42
    print(sys._getframe().f_locals)              # this call's local variables
    print(sys._getframe(1).f_code.co_name)       # the caller's frame

inspect_frame()

# OUTPUT:
# True
# {'local_value': 42}
# <module>`
            ]
        },
        {
            content: `<h3>Locals Can Outlive Their Frame: Closure Cells</h3>
Normally a frame's locals are released when it ends. A variable used by an inner function is moved into a <b>cell</b> object on the heap, which the inner function keeps alive. This is how closures work, and why "the stack frame is gone" does not mean "the data is gone".`,
            codeExamples: [
                `def make_counter():
    data = [0, 0, 0]
    def size():
        return len(data)
    return size

fn = make_counter()                  # make_counter's frame has been destroyed
print(fn())
print(fn.__closure__[0].cell_contents)

# OUTPUT:
# 3
# [0, 0, 0]`
            ]
        },
        {
            content: `<h3>CPython Implementation Details</h3>
<ul>
<li><b>One private heap.</b> All Python objects live in a private heap managed by the interpreter, using its own allocator (<code>pymalloc</code>) for small objects (covered in <i>Memory Allocation</i>).</li>
<li><b>Frames are cheap.</b> Since Python 3.11 frames are allocated in a contiguous per-thread data stack, and a full frame <i>object</i> is created only when needed (for example by <code>sys._getframe()</code>, tracebacks or debuggers). Python-to-Python calls no longer consume the C stack.</li>
<li><b>The C stack still matters.</b> Calls that pass through C code (a recursive <code>__repr__</code>, a deep <code>json</code> structure) can still hit the C stack limit, which Python guards with <code>RecursionError</code> too.</li>
<li><b>Raising the limit</b> with <code>sys.setrecursionlimit()</code> only moves the guard; a very high value can crash the interpreter with a real stack overflow. Prefer a loop or an explicit stack for deep recursion.</li>
<li><b>Threads</b> each have their own call stack but all share one heap; that is why shared mutable objects need locks.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Stack frames are created and freed automatically and fast</td><td>Every value is a heap object, so numbers cost more memory than in Java</td></tr>
<tr><td>Heap objects can outlive the function that created them</td><td>Heap allocation is slower than a raw stack slot</td></tr>
<tr><td>Uniform model: every value is an object with methods</td><td>Default recursion limit (1000) blocks deep recursive algorithms</td></tr>
<tr><td>Recursion limit turns runaway recursion into a clear error</td><td>Hidden references can keep large objects alive unexpectedly</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Where are Python objects stored?</td><td>On the heap - all of them, including ints and strings</td></tr>
<tr class='text-center'><td>What does a Python variable actually hold?</td><td>A reference to an object (a name bound in a namespace), never the value itself</td></tr>
<tr class='text-center'><td>What is on the call stack?</td><td>Frames: the locals, current position and bookkeeping of each active function call</td></tr>
<tr class='text-center'><td>Why can a returned list outlive the function that built it?</td><td>The list is a heap object kept alive by references; only the frame's name for it disappeared</td></tr>
<tr class='text-center'><td>What happens on very deep recursion?</td><td><code>RecursionError</code> once the limit (default 1000) is exceeded</td></tr>
</table>`
        }
    ]
};
