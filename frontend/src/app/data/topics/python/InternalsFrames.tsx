import type { Topic } from '../../types';

export const internalsFrames: Topic = {
    id: 'python-internals-execution-model-frames',
    name: 'Execution Model & Frames',
    beginner: [
        {
            content: `<h4>Every Call Gets a Frame</h4>
When a function is called, CPython creates a <b>frame</b>: the record of that one execution. A frame holds:<br>
• the <b>code object</b> being run,<br>
• the function's <b>local variables</b>,<br>
• a reference to the <b>global</b> namespace,<br>
• the current instruction position,<br>
• a pointer to the <b>calling</b> frame (<code>f_back</code>).<br><br>
The chain of frames is the <b>call stack</b> - the same idea as JVM stack frames.`
        },
        {
            content: `<h4>Seeing the Call Stack</h4>
<code>inspect.stack()</code> lists the frames from the current one outwards to the module level.`,
            codeExamples: [
                `import inspect

def checkout():
    apply_discount()

def apply_discount():
    calculate_tax()

def calculate_tax():
    print([info.function for info in inspect.stack()])

checkout()

# OUTPUT:
# ['calculate_tax', 'apply_discount', 'checkout', '<module>']`
            ]
        },
        {
            content: `<h4>Frames Hold the Local Variables</h4>
Each call has its own frame, so recursive calls don't overwrite each other's variables.`,
            codeExamples: [
                `import inspect

def show(n):
    frame = inspect.currentframe()
    print(frame.f_code.co_name, frame.f_locals)
    if n > 0:
        show(n - 1)

show(2)

# OUTPUT:
# show {'n': 2, 'frame': <frame ...>}
# show {'n': 1, 'frame': <frame ...>}
# show {'n': 0, 'frame': <frame ...>}
# (the frame repr includes an address that varies)`
            ]
        },
        {
            content: `<h4>Tracebacks Are Built from Frames</h4>
When an exception escapes, Python records each frame it passes through. That chain is what a traceback prints - most recent call last.`,
            codeExamples: [
                `import traceback

def level1():
    level2()

def level2():
    raise ValueError("bad input")

try:
    level1()
except ValueError as e:
    names = [f.name for f in traceback.extract_tb(e.__traceback__)]
    print(names)

# OUTPUT:
# ['<module>', 'level1', 'level2']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Walking Frames by Hand</h3>
<code>sys._getframe()</code> (CPython-specific) returns the current frame; follow <code>f_back</code> to reach the callers. Logging libraries do this to report which function and line produced a message.`,
            codeExamples: [
                `import sys

def who_called_me():
    caller = sys._getframe(1)            # one frame up
    return caller.f_code.co_name

def report():
    return who_called_me()

print(report())

def depth():
    frame, count = sys._getframe(), 0
    while frame is not None:
        count += 1
        frame = frame.f_back
    return count

print(depth())                            # depth() + <module>

# OUTPUT:
# report
# 2`
            ]
        },
        {
            content: `<h3>Frames and the Recursion Limit</h3>
Every nested call adds a frame. <code>sys.getrecursionlimit()</code> (1000 by default) caps how deep the stack may grow, raising <code>RecursionError</code> instead of crashing the C stack. Since 3.11, pure-Python calls no longer consume the C stack for each frame, which made calls cheaper - but the Python-level limit remains.`
        },
        {
            content: `<h3>Generators Keep Their Frame Alive</h3>
A normal function's frame is discarded when it returns. A generator's frame is <b>suspended</b> at each <code>yield</code> and kept on the heap - that is how local variables survive between <code>next()</code> calls. The frame is released when the generator finishes.`,
            codeExamples: [
                `def counter():
    count = 0
    while count < 2:
        count += 1
        yield count

gen = counter()
next(gen)
print(gen.gi_frame.f_locals)        # suspended frame, locals intact
next(gen)
print(gen.gi_frame.f_locals)
print(list(gen), gen.gi_frame)      # finished: frame released

# OUTPUT:
# {'count': 1}
# {'count': 2}
# [] None`
            ]
        },
        {
            content: `<h3>Careful with Frame References</h3>
Holding on to a frame object (or a traceback, which references frames) keeps <b>all</b> its local variables alive, which can leak memory or create reference cycles. Use frame inspection for debugging and tooling, delete references when done (<code>del frame</code>), and prefer <code>inspect</code>'s higher-level functions over the CPython-only <code>sys._getframe</code>.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a frame?</td><td>The runtime record of one function call: its code object, locals, globals, instruction position and caller</td></tr>
<tr class='text-center'><td>What is the call stack?</td><td>The chain of active frames linked by f_back, from the current call to the module level</td></tr>
<tr class='text-center'><td>How are tracebacks produced?</td><td>From the frames an exception passed through while propagating</td></tr>
<tr class='text-center'><td>How do generators remember local variables?</td><td>Their frame is suspended and kept alive between yields</td></tr>
<tr class='text-center'><td>How do you list the current call stack?</td><td><code>inspect.stack()</code> or <code>traceback.extract_stack()</code></td></tr>
<tr class='text-center'><td>Why avoid storing frame objects?</td><td>They keep every local variable alive and can create reference cycles</td></tr>
</table>`
        }
    ]
};
