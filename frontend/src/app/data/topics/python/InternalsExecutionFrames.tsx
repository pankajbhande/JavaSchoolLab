import type { Topic } from '../../types';

export const internalsExecutionFrames: Topic = {
    id: 'python-internals-execution-model-frames',
    name: 'Execution Model & Frames',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Every time a code block runs (a module, a function call, a class body), CPython creates a <b>frame</b>: the working record of that execution. It points to the code object, the local variables, the globals and the <b>calling frame</b> (<code>f_back</code>). The chain of frames is the <b>call stack</b>, exactly like JVM stack frames, and it is what a traceback prints. The <code>inspect</code> module lets you walk it.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 260 222" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:260px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="240" height="46" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="130" y="29.5">frame: level_two()</tspan><tspan x="130" y="44.5">f_back -&gt; level_one</tspan></text><rect x="10" y="62" width="240" height="46" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="130" y="81.5">frame: level_one()</tspan><tspan x="130" y="96.5">f_back -&gt; main</tspan></text><rect x="10" y="114" width="240" height="46" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="130" y="133.5">frame: main()</tspan><tspan x="130" y="148.5">f_back -&gt; &lt;module&gt;</tspan></text><rect x="10" y="166" width="240" height="46" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="130" y="185.5">frame: &lt;module&gt;</tspan><tspan x="130" y="200.5">f_back -&gt; None</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the call stack: newest frame on top, each linked to its caller</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without the frame model it is hard to explain why recursive calls do not overwrite each other's variables, how tracebacks are produced, or how a logger knows which function called it.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Understand the <b>call stack</b> and why each call has independent local variables.</li>
<li>Read tracebacks and <code>RecursionError</code> messages with confidence.</li>
<li>Build tools that need the caller's context: loggers, debuggers, test helpers.</li>
<li>See how globals, locals and the code object fit together at run time.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Walking the call stack with f_back</h4>
The program lists the active function names, counts the extra frames recursion creates, and checks a frame's globals.`,
            codeExamples: [
                `import inspect


def call_chain():
    frame = inspect.currentframe().f_back
    names = []
    while frame is not None:
        names.append(frame.f_code.co_name)
        frame = frame.f_back
    return names


def frame_count():
    return len(call_chain())


def level_one():
    return level_two()


def level_two():
    return call_chain()


def recurse(n):
    if n == 0:
        return frame_count()
    return recurse(n - 1)


def main():
    # Run with: python demo.py (an IDE or runner may add extra outer frames)
    print(level_one())

    extra = recurse(3) - frame_count()
    print("Extra frames for recurse(3):", extra)

    print(inspect.currentframe().f_globals is globals())


if __name__ == "__main__":
    main()

# OUTPUT (python demo.py):
# ['level_two', 'level_one', 'main', '<module>']
# Extra frames for recurse(3): 4
# True`
            ],
            codeExplanations: [
                `call_chain starts at its caller's frame and follows f_back until None, collecting each frame's function name. The name <module> is the top-level frame. recurse(3) creates four live frames (n = 3, 2, 1, 0) at the deepest point, each with its own n, which is why the count differs by 4. The frame of main shares the module's global namespace.`
            ]
        },
        {
            content: `<h4>Code Blocks</h4>
Python programs are built from <b>code blocks</b> - pieces of code executed as a unit. The block types are: a <b>module</b>, a <b>function body</b>, a <b>class body</b>, and strings run by <code>exec()</code> / <code>eval()</code>. Each time a block runs, CPython creates a <b>frame</b>: the working area for that execution.`
        },
        {
            content: `<h4>What a Frame Holds</h4>
A frame is the runtime record of one running block. It holds:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Part</th><th>Purpose</th><th>Attribute</th></tr>
<tr class='text-center'><td>Code</td><td>The code object being executed</td><td><code>f_code</code></td></tr>
<tr class='text-center'><td>Local variables</td><td>Names local to this call</td><td><code>f_locals</code></td></tr>
<tr class='text-center'><td>Globals / builtins</td><td>The module namespace and built-ins</td><td><code>f_globals</code>, <code>f_builtins</code></td></tr>
<tr class='text-center'><td>Current line</td><td>Where execution is now</td><td><code>f_lineno</code></td></tr>
<tr class='text-center'><td>Caller</td><td>The frame that called this one</td><td><code>f_back</code></td></tr>
<tr class='text-center'><td>Value stack</td><td>Operand stack for bytecode (internal)</td><td>-</td></tr>
</table>
Calling a function creates a new frame <b>on top of</b> the caller's; returning destroys it. Together the chain of frames is the <b>call stack</b> you see in a traceback.`
        },
        {
            content: `<h4>Walking the Call Stack</h4>
Each frame points to its caller through <code>f_back</code>, so you can walk from the current frame to the program's start.`,
            codeExamples: [
                `import inspect

def outer():
    return inner()

def inner():
    frame = inspect.currentframe()
    names = []
    while frame is not None:
        names.append(frame.f_code.co_name)
        frame = frame.f_back
    return names

print(outer())

# OUTPUT (run as a script):
# ['inner', 'outer', '<module>']`
            ],
            codeExplanations: [
                `inspect.currentframe() returns the frame of the function that called it (inner). Following f_back gives the caller (outer) and finally the module-level frame, whose name is <module>. This is exactly the information a traceback prints, reversed.`
            ]
        },
        {
            content: `<h4>A Class Body Runs Immediately</h4>
A function body runs when the function is <i>called</i>, but a <b>class body runs right away, once, when the class is defined</b> - in its own frame.`,
            codeExamples: [
                `class Config:
    print("running the class body")
    debug = True
    level = 3 * 2

print("class defined")
print(Config.level)

# OUTPUT:
# running the class body
# class defined
# 6`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Names Are Resolved by Scope, Decided at Compile Time</h3>
Name lookup follows <b>LEGB</b>: Local, Enclosing function, Global, Built-in. Which scope a name belongs to is decided by the <b>compiler</b> for each function: if the function <i>assigns</i> to a name anywhere, that name is local <b>throughout</b> the function. This explains a classic error.`,
            codeExamples: [
                `x = 10

def f():
    print(x)         # x is assigned below, so x is LOCAL here - and still unset
    x = 5

try:
    f()
except UnboundLocalError as error:
    print(type(error).__name__)

# OUTPUT:
# UnboundLocalError`
            ],
            codeExplanations: [
                `Because of the assignment x = 5, the compiler marks x as a local variable of f for the whole function. The print(x) therefore looks for a local that has no value yet, instead of falling back to the global x. Adding "global x" or removing the assignment fixes it.`
            ]
        },
        {
            content: `<h3>Generators Suspend Their Frames</h3>
A normal call destroys its frame on return. A <b>generator</b> keeps its frame alive between <code>yield</code>s, with all locals and the current position preserved, and resumes it on the next <code>next()</code>. That is what makes generators and <code>async</code> coroutines possible.`,
            codeExamples: [
                `import inspect

def counter():
    n = 0
    while True:
        n += 1
        yield n

g = counter()
print(inspect.getgeneratorstate(g))
next(g)
next(g)
print(inspect.getgeneratorstate(g))
print(g.gi_frame.f_locals)           # the suspended frame's local variables

# OUTPUT:
# GEN_CREATED
# GEN_SUSPENDED
# {'n': 2}`
            ]
        },
        {
            content: `<h3>Hooking Into Execution: sys.settrace</h3>
The interpreter can report events - a function call, a new line, a return, an exception - to a callback. <b>Debuggers, coverage tools and profilers</b> are built on this (<code>sys.settrace</code>, <code>sys.setprofile</code>, and the lower-overhead <code>sys.monitoring</code> in 3.12+).`,
            codeExamples: [
                `import sys

def tracer(frame, event, arg):
    if event == "call":
        print("call", frame.f_code.co_name)
    return None                      # no per-line tracing inside the call

def a():
    b()

def b():
    pass

sys.settrace(tracer)
a()
sys.settrace(None)

# OUTPUT:
# call a
# call b`
            ]
        },
        {
            content: `<h3>How Frames Are Implemented (CPython 3.11+)</h3>
<ul>
<li>Frames used to be heap objects created on every call, which was a major cost. Since <b>3.11</b> they live in a contiguous per-thread <b>data stack</b> and are cheap to push and pop.</li>
<li>A full Python <b>frame object</b> (what <code>sys._getframe()</code> returns) is created <b>lazily</b>, only when something like a traceback or debugger asks for it.</li>
<li>Python-to-Python calls no longer use the C stack, so deep recursion is limited by the recursion limit rather than a C stack overflow.</li>
<li>Exceptions are found through a static <b>exception table</b> in the code object ("zero-cost" <code>try</code>); the interpreter unwinds frames until it finds a handler.</li>
<li>Each <b>thread</b> has its own stack of frames; the GIL decides which thread runs the evaluation loop.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Each call has isolated locals, so recursion just works</td><td>Deep recursion hits the recursion limit (default 1000)</td></tr>
<tr><td>Frames give precise tracebacks for debugging</td><td>Frame objects add memory and call overhead</td></tr>
<tr><td>inspect makes the stack available to tools</td><td>Frame attributes differ between Python versions</td></tr>
<tr><td>Simple linked-list model, easy to reason about</td><td>Inspecting frames at run time is slow and easy to misuse</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a frame?</td><td>The runtime record of one executing code block: its code, local and global namespaces, current position and a link to the caller</td></tr>
<tr class='text-center'><td>What are the kinds of code block?</td><td>Module, function body, class body, and exec/eval strings</td></tr>
<tr class='text-center'><td>When does a class body run?</td><td>Immediately, once, when the class statement executes</td></tr>
<tr class='text-center'><td>Why does <code>print(x); x = 5</code> in a function raise UnboundLocalError?</td><td>Assignment makes x local for the whole function at compile time</td></tr>
<tr class='text-center'><td>How are generators different from normal calls?</td><td>Their frame survives between yields, preserving locals and position</td></tr>
</table>`
        }
    ]
};
