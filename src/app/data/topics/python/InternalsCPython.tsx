import type { Topic } from '../../types';

export const internalsCPython: Topic = {
    id: 'python-internals-cpython-the-interpreter',
    name: 'CPython & the Interpreter',
    beginner: [
        {
            content: `<h4>What is CPython?</h4>
"Python" is a language specification. <b>CPython</b> is its reference implementation - the program written in C that you download from python.org and run as <code>python</code>. When people say "Python does X", they almost always mean "CPython does X".`,
            codeExamples: [
                `import sys
import platform

print(platform.python_implementation())
print(sys.implementation.name)
print(sys.version_info[:2] >= (3, 8))

# OUTPUT:
# CPython
# cpython
# True`
            ]
        },
        {
            content: `<h4>The Pipeline: From Source Text to Running Code</h4>
Every time you run a script, CPython takes it through four stages:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Stage</th><th>Input → Output</th><th>Java equivalent</th></tr>
<tr class='text-center'><td>1. Tokenize</td><td>Source text → tokens (names, operators, numbers)</td><td>javac lexer</td></tr>
<tr class='text-center'><td>2. Parse</td><td>Tokens → Abstract Syntax Tree (AST)</td><td>javac parser</td></tr>
<tr class='text-center'><td>3. Compile</td><td>AST → bytecode in a <b>code object</b></td><td>javac → .class bytecode</td></tr>
<tr class='text-center'><td>4. Evaluate</td><td>The virtual machine's loop executes the bytecode</td><td>The JVM interpreter / JIT</td></tr>
</table>
In Java you run steps 1-3 yourself with <code>javac</code>. CPython does all four automatically each time you run <code>python app.py</code>.`
        },
        {
            content: `<h4>Watching Each Stage</h4>
The standard library exposes every stage, so you can watch the pipeline work on one line of code.`,
            codeExamples: [
                `import io
import ast
import tokenize

source = "x = 1 + 2\\n"

# 1. Tokens
tokens = tokenize.generate_tokens(io.StringIO(source).readline)
print([(tokenize.tok_name[t.type], t.string) for t in tokens])

# 2. AST
tree = ast.parse(source)
print(type(tree.body[0]).__name__)

# 3. Bytecode inside a code object
code = compile(tree, "<demo>", "exec")
print(type(code).__name__)

# 4. Execute it
namespace = {}
exec(code, namespace)
print(namespace["x"])

# OUTPUT:
# [('NAME', 'x'), ('OP', '='), ('NUMBER', '1'), ('OP', '+'), ('NUMBER', '2'), ('NEWLINE', '\\n'), ('ENDMARKER', '')]
# Assign
# code
# 3`
            ]
        },
        {
            content: `<h4>The Evaluation Loop</h4>
At the heart of CPython is a big loop in C (in <code>Python/ceval.c</code>) that repeatedly fetches the next bytecode instruction and runs it - "load this variable", "add the top two values", "call this function". Python's "interpreted" reputation comes from this loop: each instruction is dispatched one at a time instead of being turned into machine code up front.`
        }
    ],

    expert: [
        {
            content: `<h3>Faster CPython: the Specialising Adaptive Interpreter (3.11)</h3>
Python 3.11 (PEP 659) made the interpreter <b>adaptive</b>: after an instruction runs a few times, CPython replaces it with a <b>specialised</b> version for the types it actually sees - for example a generic addition becomes an "add two ints" instruction. If the types change, it falls back to the generic form. This is why 3.11 is typically noticeably faster than 3.10 without any code changes.<br><br>
Unlike the JVM's JIT, this still interprets bytecode - it just picks faster, type-specific instructions.`
        },
        {
            content: `<h3>Experimental JIT and Free-Threading (3.13+)</h3>
• <b>JIT compiler</b> (PEP 744): Python 3.13 added an experimental "copy-and-patch" JIT that can turn hot bytecode into machine code. It must be enabled when CPython is built and is off by default.<br>
• <b>Free-threaded build</b> (PEP 703): an optional build of 3.13 (often installed as <code>python3.13t</code>) can run without the Global Interpreter Lock, so threads can execute Python code in parallel. It is opt-in while the ecosystem catches up - see the <i>GIL</i> module.<br><br>
Both are evolving quickly; check the release notes of your version before relying on them.`,
            codeExamples: [
                `import sys

# Python 3.13+ only - reports whether the GIL is active in this process
if hasattr(sys, "_is_gil_enabled"):
    print("GIL enabled:", sys._is_gil_enabled())
else:
    print("This Python predates free-threading support")

# OUTPUT (varies - e.g. on a regular 3.12 build):
# This Python predates free-threading support`
            ]
        },
        {
            content: `<h3>Other Implementations</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Implementation</th><th>How it runs Python</th><th>Notes</th></tr>
<tr class='text-center'><td>CPython</td><td>Bytecode interpreter written in C</td><td>The reference; best C-extension support</td></tr>
<tr class='text-center'><td>PyPy</td><td>Tracing JIT compiler</td><td>Often much faster for long-running pure-Python code</td></tr>
<tr class='text-center'><td>MicroPython</td><td>Compact interpreter</td><td>Microcontrollers (ESP32, Raspberry Pi Pico)</td></tr>
<tr class='text-center'><td>GraalPy</td><td>Runs on GraalVM (the JVM ecosystem)</td><td>Java interop</td></tr>
<tr class='text-center'><td>Jython / IronPython</td><td>JVM / .NET</td><td>Jython is stuck on Python 2.7</td></tr>
</table>
Bytecode, <code>.pyc</code> files, reference counting and the GIL are all <b>CPython details</b>, not guarantees of the language. Code that depends on them may behave differently on PyPy.`
        },
        {
            content: `<h3>CPython vs the JVM</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>JVM (HotSpot)</th><th>CPython</th></tr>
<tr class='text-center'><td>Compile step</td><td>Explicit (<code>javac</code>)</td><td>Automatic, at run/import time</td></tr>
<tr class='text-center'><td>Bytecode format</td><td>Specified, portable <code>.class</code> files</td><td>Implementation detail, changes every version</td></tr>
<tr class='text-center'><td>Execution</td><td>Interpreter + mature JIT</td><td>Adaptive interpreter (+ experimental JIT)</td></tr>
<tr class='text-center'><td>Memory management</td><td>Tracing garbage collectors</td><td>Reference counting + cycle collector</td></tr>
<tr class='text-center'><td>Threads</td><td>Truly parallel</td><td>One thread runs bytecode at a time (GIL), unless free-threaded</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is CPython?</td><td>The reference implementation of Python, written in C</td></tr>
<tr class='text-center'><td>What stages does source code go through?</td><td>Tokenizing, parsing into an AST, compiling to bytecode, and executing in the evaluation loop</td></tr>
<tr class='text-center'><td>Is Python compiled or interpreted?</td><td>Both - CPython compiles to bytecode automatically, then interprets it</td></tr>
<tr class='text-center'><td>What made Python 3.11 faster?</td><td>The specialising adaptive interpreter (PEP 659), which swaps generic instructions for type-specialised ones</td></tr>
<tr class='text-center'><td>Does CPython have a JIT?</td><td>An experimental, build-time opt-in JIT since 3.13; PyPy has a mature tracing JIT</td></tr>
<tr class='text-center'><td>Is the GIL part of the Python language?</td><td>No - it is a CPython implementation detail; free-threaded builds remove it</td></tr>
</table>`
        }
    ]
};
