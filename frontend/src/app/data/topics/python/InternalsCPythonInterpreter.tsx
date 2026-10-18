import type { Topic } from '../../types';

export const internalsCPythonInterpreter: Topic = {
    id: 'python-internals-cpython-the-interpreter',
    name: 'CPython & the Interpreter',
    beginner: [
        {
            content: `<h4>Introduction</h4>
"Python" is a language; <b>CPython</b> is the C program that actually runs it - the <code>python</code> you download from python.org. It first <b>compiles</b> your source to bytecode, then a virtual machine (the PVM) <b>interprets</b> that bytecode instruction by instruction. This is the same two-step idea as Java, where <code>javac</code> produces <code>.class</code> bytecode and the <b>JVM</b> runs it - except CPython performs the compile step automatically on every run.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 644 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:644px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="82.4" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="51.2" y="30.5">source</tspan><tspan x="51.2" y="45.5">.py text</tspan></text><line x1="92.4" y1="34" x2="122.4" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="126.4" y="10" width="89.7" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="171.3" y="30.5">tokenizer</tspan><tspan x="171.3" y="45.5">+ parser</tspan></text><line x1="216.1" y1="34" x2="246.1" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="250.1" y="10" width="70" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="285.1" y="38">AST</tspan></text><line x1="320.1" y1="34" x2="350.1" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="354.1" y="10" width="126.2" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="417.2" y="30.5">compiler</tspan><tspan x="417.2" y="45.5">-&gt; code object</tspan></text><line x1="480.3" y1="34" x2="510.3" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="514.3" y="10" width="118.9" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="573.8" y="30.5">PVM loop</tspan><tspan x="573.8" y="45.5">runs bytecode</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: CPython pipeline: javac-like front end, JVM-like evaluation loop</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without knowing what the interpreter does, behaviour such as "syntax errors appear before any output", "imports create __pycache__" or "Python is slow in tight loops" looks like random magic.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Understand that Python is <b>compiled to bytecode and then interpreted</b>, not "just interpreted".</li>
<li>Know which parts are the <b>language</b> and which are <b>CPython implementation details</b> (bytecode, GIL, reference counting).</li>
<li>Reason about performance, start-up time and error timing from the pipeline stages.</li>
<li>Map familiar Java ideas (javac, bytecode, JVM) onto their Python counterparts.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Walking one line through the CPython pipeline</h4>
The standard library exposes each stage. This program takes one statement from source text to a running result.`,
            codeExamples: [
                `import ast
import io
import platform
import tokenize

SOURCE = "total = 2 + 3"
WANTED = (tokenize.NAME, tokenize.NUMBER, tokenize.OP)


def list_tokens(source):
    reader = io.StringIO(source).readline
    return [tok.string for tok in tokenize.generate_tokens(reader)
            if tok.type in WANTED]


def build_tree(source):
    return ast.parse(source)


def build_code(tree):
    return compile(tree, "<demo>", "exec")


def run(code):
    namespace = {}
    exec(code, namespace)
    return namespace


def main():
    print("Implementation:", platform.python_implementation())
    print("Tokens:", list_tokens(SOURCE))

    tree = build_tree(SOURCE)
    print("First node:", type(tree.body[0]).__name__)

    code = build_code(tree)
    print("Compiled to:", type(code).__name__)

    namespace = run(code)
    print("total =", namespace["total"])


if __name__ == "__main__":
    main()

# OUTPUT (on CPython):
# Implementation: CPython
# Tokens: ['total', '=', '2', '+', '3']
# First node: Assign
# Compiled to: code
# total = 5`
            ],
            codeExplanations: [
                `tokenize splits the text into names, numbers and operators (we filter out NEWLINE and ENDMARKER tokens). ast.parse builds the tree whose first statement is an Assign node. compile() turns the tree into a code object, and exec() hands it to the evaluation loop, which creates the name total in the namespace dictionary.`
            ]
        },
        {
            content: `<h4>Python the Language vs Python the Program</h4>
"Python" is a <b>language specification</b>. To run Python code you need an <b>implementation</b> - a program that reads your code and executes it. The reference implementation, and the one you almost certainly use, is <b>CPython</b>: written in <b>C</b>, maintained by the Python core developers, and what you download from python.org. When you type <code>python app.py</code>, the <code>python</code> executable <i>is</i> the CPython interpreter.`
        },
        {
            content: `<h4>Is Python Interpreted or Compiled?</h4>
Both. CPython first <b>compiles</b> your source code into a compact, low-level form called <b>bytecode</b>, then a <b>virtual machine</b> (the Python Virtual Machine, PVM) <b>interprets</b> that bytecode one instruction at a time.
<pre>source code (.py)
      |  tokenizer + parser
      v
syntax tree (AST)
      |  compiler
      v
bytecode (code objects)    &lt;-- cached in __pycache__/*.pyc
      |  evaluation loop (the PVM)
      v
program runs</pre>
Java follows a similar plan: <code>javac</code> produces <code>.class</code> bytecode, and the JVM runs it. The difference is that Python does the compile step <b>automatically and invisibly</b> every time you run or import code, and CPython has no JIT compiler in normal builds.`
        },
        {
            content: `<h4>Which Python Am I Running?</h4>`,
            codeExamples: [
                `import platform
import sys

print(platform.python_implementation())
print(sys.implementation.name)
print(sys.version_info >= (3, 8))
print(sys.executable.endswith(("python", "python.exe", "python3")))

# OUTPUT (on CPython):
# CPython
# cpython
# True
# True`
            ],
            codeExplanations: [
                `platform.python_implementation() and sys.implementation.name tell you which implementation is running. sys.version_info is a tuple that can be compared with another tuple to test for a minimum version. sys.executable is the path of the interpreter program itself.`
            ]
        },
        {
            content: `<h4>Other Implementations</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Implementation</th><th>Written in / runs on</th><th>Notable for</th></tr>
<tr class='text-center'><td><b>CPython</b></td><td>C</td><td>The reference; best library compatibility</td></tr>
<tr class='text-center'><td><b>PyPy</b></td><td>RPython (Python subset)</td><td>A JIT compiler; often several times faster on pure-Python code</td></tr>
<tr class='text-center'><td><b>Jython</b></td><td>Java / JVM</td><td>Use Java classes from Python (lags behind current Python versions)</td></tr>
<tr class='text-center'><td><b>IronPython</b></td><td>.NET</td><td>Integration with .NET libraries</td></tr>
<tr class='text-center'><td><b>MicroPython</b></td><td>C</td><td>Tiny; runs on microcontrollers</td></tr>
<tr class='text-center'><td><b>GraalPy</b></td><td>GraalVM</td><td>Python on the JVM with GraalVM's JIT</td></tr>
</table>
Behaviour that is not part of the language rules (object identity quirks, memory management) can differ between them.`
        }
    ],

    expert: [
        {
            content: `<h3>What Is Inside the CPython Source</h3>
Knowing the layout of the source repository makes the rest of this module concrete:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Directory / file</th><th>Contents</th></tr>
<tr class='text-center'><td><code>Parser/</code></td><td>Tokenizer and the PEG parser (since 3.9; the grammar is in <code>Grammar/python.gram</code>)</td></tr>
<tr class='text-center'><td><code>Python/compile.c</code>, <code>symtable.c</code></td><td>Symbol-table analysis and bytecode generation</td></tr>
<tr class='text-center'><td><code>Python/bytecodes.c</code>, <code>ceval.c</code></td><td>The bytecode definitions and the <b>evaluation loop</b></td></tr>
<tr class='text-center'><td><code>Objects/</code></td><td>Built-in types: <code>listobject.c</code>, <code>dictobject.c</code>, <code>longobject.c</code>...</td></tr>
<tr class='text-center'><td><code>Modules/</code>, <code>Lib/</code></td><td>C-accelerated modules and the pure-Python standard library</td></tr>
<tr class='text-center'><td><code>Include/</code></td><td>The C API used by extension modules (NumPy, etc.)</td></tr>
</table>`
        },
        {
            content: `<h3>Everything Is a PyObject</h3>
At the C level every Python value begins with the same header: a <b>reference count</b> and a <b>pointer to its type</b> (<code>PyObject</code>). A type object contains function pointers for behaviour (<code>tp_repr</code>, <code>tp_hash</code>, <code>tp_call</code>...). That uniform layout is what lets the evaluation loop treat an integer, a list and a function identically, and what dunder methods like <code>__add__</code> plug into.`,
            codeExamples: [
                `import sys

x = 42
print(type(x), type(type(x)))        # a type is also an object
print(sys.getsizeof(x))              # header + the integer's digits
print(isinstance(int, object))       # even classes are PyObjects

# OUTPUT (64-bit CPython 3.12):
# <class 'int'> <class 'type'>
# 28
# True`
            ]
        },
        {
            content: `<h3>The Evaluation Loop and Modern Speed-ups</h3>
<code>ceval.c</code> contains a big loop that fetches the next bytecode instruction and runs the matching C code, using a <b>stack</b> for operands (the PVM is a <i>stack machine</i>). Recent releases made it much faster:
<ul>
<li><b>3.11 - the specializing adaptive interpreter (PEP 659):</b> hot instructions rewrite themselves for the types they actually see (for example <code>BINARY_OP</code> becomes <code>BINARY_OP_ADD_INT</code>), and cheaper "zero-cost" exception handling. Often 10-60% faster.</li>
<li><b>3.12:</b> immortal objects (PEP 683), per-interpreter GIL groundwork, inlined comprehensions (PEP 709).</li>
<li><b>3.13:</b> an <b>experimental JIT</b> (copy-and-patch, off by default) and an experimental <b>free-threaded</b> build without the GIL (PEP 703).</li>
<li><b>Later releases</b> continue this direction; check the "What's New" page of your version.</li>
</ul>`
        },
        {
            content: `<h3>Useful Interpreter Flags</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Flag / variable</th><th>Effect</th></tr>
<tr class='text-center'><td><code>python -m dis file.py</code></td><td>Disassemble a script's bytecode</td></tr>
<tr class='text-center'><td><code>python -X importtime -c "import json"</code></td><td>Print the time each import took (startup profiling)</td></tr>
<tr class='text-center'><td><code>python -X dev</code></td><td>Development mode: extra runtime checks and warnings</td></tr>
<tr class='text-center'><td><code>python -O</code> / <code>-OO</code></td><td>Remove <code>assert</code> statements (and docstrings with -OO)</td></tr>
<tr class='text-center'><td><code>python -B</code> or <code>PYTHONDONTWRITEBYTECODE=1</code></td><td>Do not write .pyc files</td></tr>
<tr class='text-center'><td><code>python -I</code></td><td>Isolated mode: ignore environment variables and the user site-packages</td></tr>
<tr class='text-center'><td><code>python -c "code"</code> / <code>-m module</code></td><td>Run a one-liner / a module as a script</td></tr>
</table>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Reference implementation: every library and tutorial targets it</td><td>No JIT in standard builds: slower than the JVM on hot loops</td></tr>
<tr><td>Compile step is automatic - no separate build tool</td><td>Global Interpreter Lock limits CPU-bound threads (changing in free-threaded builds)</td></tr>
<tr><td>Simple C core: easy to embed and extend with C modules</td><td>Bytecode is an implementation detail and changes between versions</td></tr>
<tr><td>Bytecode is portable across operating systems</td><td>Compile cost is paid on every run unless .pyc caching applies</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is CPython?</td><td>The reference implementation of Python, written in C</td></tr>
<tr class='text-center'><td>Is Python interpreted or compiled?</td><td>Both: source is compiled to bytecode, which the virtual machine interprets</td></tr>
<tr class='text-center'><td>What is the PVM?</td><td>The Python Virtual Machine - the stack-based evaluation loop that executes bytecode</td></tr>
<tr class='text-center'><td>CPython vs PyPy?</td><td>PyPy is another implementation with a JIT, usually faster for pure-Python code but less compatible with C extensions</td></tr>
<tr class='text-center'><td>What is the specializing adaptive interpreter?</td><td>A 3.11+ optimisation where bytecode instructions specialise themselves to the observed operand types</td></tr>
</table>`
        }
    ]
};
