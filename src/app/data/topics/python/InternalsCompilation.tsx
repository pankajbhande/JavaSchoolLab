import type { Topic } from '../../types';

export const internalsCompilation: Topic = {
    id: 'python-internals-compilation-source-to-bytecode',
    name: 'Compilation: Source to Bytecode',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Before running anything, CPython compiles the <b>whole source</b> in stages: <b>tokenizing</b>, <b>parsing</b> into an AST, <b>symbol-table analysis</b> and <b>code generation</b>. The result is a <b>code object</b> holding bytecode. The built-in <code>compile()</code> performs these stages for you. In Java, <code>javac</code> does the same job ahead of time and writes a <code>.class</code> file; Python does it in memory at run or import time.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 506 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:506px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="70" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="45" y="30.5">source</tspan><tspan x="45" y="45.5">text</tspan></text><line x1="80" y1="34" x2="110" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="114" y="10" width="70" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="149" y="38">tokens</tspan></text><line x1="184" y1="34" x2="214" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="218" y="10" width="70" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="253" y="38">AST</tspan></text><line x1="288" y1="34" x2="318" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="322" y="10" width="70" height="48" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="357" y="30.5">symbol</tspan><tspan x="357" y="45.5">table</tspan></text><line x1="392" y1="34" x2="422" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="426" y="10" width="70" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="461" y="30.5">code</tspan><tspan x="461" y="45.5">object</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: compile() runs all stages; syntax errors stop it before anything executes</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> If you think Python runs each line as it reads it, you cannot explain why a syntax error at the bottom of a file stops the program before the first <code>print</code>, or why a <code>NameError</code> only appears when the bad line runs.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Separate <b>compile-time</b> problems (syntax errors) from <b>run-time</b> problems (NameError, TypeError).</li>
<li>Use <code>compile()</code>, <code>exec()</code> and <code>eval()</code> to build tools such as REPLs, calculators and plug-in loaders.</li>
<li>Understand compile-time optimisations such as constant folding.</li>
<li>Know where a code object comes from before studying bytecode and frames.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Compile time versus run time</h4>
This program compiles good and broken source, shows that nothing runs at compile time, and proves a NameError only appears at run time.`,
            codeExamples: [
                `GOOD = "result = 6 * 7"
BAD = "print('hi')\\nx = (1 +"


def describe(label, source):
    try:
        compile(source, "<demo>", "exec")
    except SyntaxError:
        print(label, "-> SyntaxError, nothing ran")
    else:
        print(label, "-> compiled OK")


def run_source(source):
    namespace = {}
    exec(compile(source, "<demo>", "exec"), namespace)
    return namespace


def name_error_is_late():
    code = compile("missing_name + 1", "<demo>", "eval")   # compiles fine
    try:
        eval(code)
    except NameError:
        return True
    return False


def main():
    describe("valid source", GOOD)
    describe("broken source", BAD)

    print("result =", run_source(GOOD)["result"])
    print("NameError only at run time:", name_error_is_late())

    folded = compile("2 * 3", "<demo>", "eval")
    print("6 stored as a constant:", 6 in folded.co_consts)   # constant folding


if __name__ == "__main__":
    main()

# OUTPUT:
# valid source -> compiled OK
# broken source -> SyntaxError, nothing ran
# result = 42
# NameError only at run time: True
# 6 stored as a constant: True`
            ],
            codeExplanations: [
                `The broken source has a valid print() first, yet compile() rejects the whole text, so nothing executes. A reference to an undefined name is perfectly valid syntax, so it compiles and fails only when eval() runs it. The compiler also folds 2 * 3 into the constant 6 before the program runs.`
            ]
        },
        {
            content: `<h4>Python Compiles Before It Runs</h4>
Before a single line of your program executes, CPython reads the <b>whole file</b> and compiles it to bytecode. This is why a <b>syntax error</b> anywhere in a file stops the program immediately - even in code that would never have been reached - while a <b>runtime error</b> (like a <code>NameError</code>) only shows up when that line actually runs.`,
            codeExamples: [
                `print("this never prints")

if False:
    x = (1 +      # incomplete expression, in code that would never run

# OUTPUT:
#   File "app.py", line 4
#     x = (1 +
#         ^
# SyntaxError: '(' was never closed
#
# The first print() did NOT run: the whole file failed to compile.`
            ]
        },
        {
            content: `<h4>The Stages</h4>
<ol>
<li><b>Tokenizing</b> - split the text into tokens: names, numbers, operators, keywords, indentation.</li>
<li><b>Parsing</b> - check the tokens follow the grammar and build an <b>Abstract Syntax Tree (AST)</b>. Since Python 3.9 this uses a PEG parser.</li>
<li><b>Symbol-table analysis</b> - decide for each name whether it is local, global or a closure variable.</li>
<li><b>Code generation</b> - walk the AST and emit <b>bytecode</b>, plus optimisations (constant folding, removing dead code).</li>
<li>The result is a <b>code object</b> that the interpreter can execute.</li>
</ol>`
        },
        {
            content: `<h4>Doing It Yourself With compile()</h4>
The built-in <code>compile(source, filename, mode)</code> runs the stages and returns a <b>code object</b>. You can then run it with <code>exec()</code> (statements) or <code>eval()</code> (an expression). The mode is <code>"exec"</code>, <code>"eval"</code> or <code>"single"</code>.`,
            codeExamples: [
                `code = compile("x = 1 + 2", "<string>", "exec")

print(type(code).__name__)
print(3 in code.co_consts)       # 1 + 2 was folded into 3 at compile time

namespace = {}
exec(code, namespace)            # run the statements
print(namespace["x"])

expr = compile("6 * 7", "<string>", "eval")
print(eval(expr))

# OUTPUT:
# code
# True
# 3
# 42`
            ],
            codeExplanations: [
                `The compiler does not emit an addition for 1 + 2; it computes the constant 3 once, so the running program does no arithmetic at all. exec() runs the compiled statements inside the dictionary we passed, which is how the variable x ends up there. eval() compiles in "eval" mode and returns the expression's value.`
            ]
        },
        {
            content: `<h4>Syntax Errors Come From the Compiler</h4>`,
            codeExamples: [
                `try:
    compile("x = ", "<string>", "exec")
except SyntaxError as error:
    print(type(error).__name__)
    print(error.msg)

# OUTPUT:
# SyntaxError
# invalid syntax`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Seeing the Tokens</h3>
The <code>tokenize</code> module exposes the first stage. Every token has a type, the text, and its position - the raw material for syntax highlighters and code formatters.`,
            codeExamples: [
                `import io
import tokenize

source = "x = 1 + 2"
tokens = tokenize.generate_tokens(io.StringIO(source).readline)

for token in tokens:
    print(tokenize.tok_name[token.type], repr(token.string))

# OUTPUT (Python 3.12):
# NAME 'x'
# OP '='
# NUMBER '1'
# OP '+'
# NUMBER '2'
# NEWLINE ''
# ENDMARKER ''`
            ]
        },
        {
            content: `<h3>Definition Time vs Execution Time</h3>
Compiling a function does <b>not</b> run it, and does not even create the function. The compiler turns the body into a nested code object stored as a <i>constant</i> of the enclosing code. The <code>def</code> statement, executed later at run time, builds the function object from that code object.`,
            codeExamples: [
                `source = "def f():\\n    return 1\\n"

code = compile(source, "<string>", "exec")      # compiles; defines nothing
namespace = {}
print("f" in namespace)

exec(code, namespace)                           # the def statement runs now
print("f" in namespace)
print(namespace["f"]())

# OUTPUT:
# False
# True
# 1`
            ]
        },
        {
            content: `<h3>Compile-Time Optimisations</h3>
CPython's compiler performs only safe, simple optimisations:
<ul>
<li><b>Constant folding:</b> <code>60 * 60 * 24</code> becomes <code>86400</code>; <code>"ab" + "cd"</code> becomes <code>"abcd"</code>.</li>
<li><b>Dead-code removal:</b> the body of <code>if False:</code> or <code>while 0:</code> is dropped.</li>
<li><b>Constant containers:</b> <code>x in [1, 2, 3]</code> is compiled to test against a constant tuple (or frozenset).</li>
<li><b>-O flag:</b> removes <code>assert</code> statements and code guarded by <code>if __debug__:</code>. <b>-OO</b> also strips docstrings.</li>
</ul>
Don't count on any more than this: Python is dynamic, so the compiler cannot assume that <code>len</code> is the built-in or that <code>a + b</code> is addition.`,
            codeExamples: [
                `def seconds_per_day():
    return 60 * 60 * 24

print(seconds_per_day.__code__.co_consts)

def unreachable():
    if False:
        return "never"
    return "always"

print("never" in unreachable.__code__.co_consts)

# OUTPUT (CPython 3.12):
# (None, 86400)
# False`
            ]
        },
        {
            content: `<h3>compile() Flags and Producing an AST Instead</h3>
<code>compile()</code> can stop after parsing and give you the AST (<code>ast.PyCF_ONLY_AST</code>), accept an AST object as input, or turn on <code>__future__</code> features. Tools like pytest use this to <b>rewrite the AST</b> of your test modules (that is how a plain <code>assert</code> can report detailed values).`,
            codeExamples: [
                `import ast

tree = compile("a + b", "<string>", "eval", flags=ast.PyCF_ONLY_AST)
print(type(tree).__name__)

code = compile(tree, "<ast>", "eval")        # AST -> code object
print(eval(code, {"a": 2, "b": 3}))

# OUTPUT:
# Expression
# 5`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Syntax errors are caught for the whole file before it runs</td><td>Name and type errors are still found only at run time</td></tr>
<tr><td>Optimisations like constant folding come for free</td><td>Compilation cost is repeated for every uncached run</td></tr>
<tr><td>compile() lets programs build and run code dynamically</td><td>exec()/eval() on untrusted text is a serious security risk</td></tr>
<tr><td>Same code object can be run many times without re-parsing</td><td>Fewer compile-time guarantees than javac's static type checking</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>When does Python compile your code?</td><td>Every time a module is run or imported (unless a valid cached .pyc exists), before any of it executes</td></tr>
<tr class='text-center'><td>Why does a syntax error stop the whole program?</td><td>The entire file is compiled first; a parse failure prevents any code from running</td></tr>
<tr class='text-center'><td>What are the compilation stages?</td><td>Tokenize, parse to AST, symbol-table analysis, generate and optimise bytecode into a code object</td></tr>
<tr class='text-center'><td>What does <code>compile()</code> return?</td><td>A code object that can be run with <code>exec</code> or <code>eval</code></td></tr>
<tr class='text-center'><td>What does the <code>-O</code> flag do?</td><td>Strips <code>assert</code> statements and <code>__debug__</code> blocks</td></tr>
</table>`
        }
    ]
};
