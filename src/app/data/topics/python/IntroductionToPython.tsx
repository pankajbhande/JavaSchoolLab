import type { Topic } from '../../types';

export const introductionToPython: Topic = {
    id: 'python-intro',
    name: 'Introduction to Python',
    beginner: [
        {
            content: `<h4>What is Python?</h4>
<b>Python</b> is a high-level, general-purpose programming language created by <b>Guido van Rossum</b> and first released in <b>1991</b>. It was designed around one idea: code is read far more often than it is written, so it should read almost like plain English.<br><br>
• <b>High-level</b> - you work with lists, dictionaries and objects, never with memory addresses or registers.<br>
• <b>Interpreted</b> - you run the source file directly; there is no separate compile step you have to perform.<br>
• <b>Dynamically typed</b> - variables don't declare a type; the type belongs to the value.<br>
• <b>Multi-paradigm</b> - procedural, object-oriented and functional styles are all first-class.`
        },
        {
            content: `<h4>Your First Python Program</h4>
In Java, printing one line needs a class, a <code>main</code> method and a compile step. In Python it is a single line - the file itself is the program.`,
            codeExamples: [
                `print("Hello, Python!")

# OUTPUT:
# Hello, Python!`,
                `# The same program in Java, for comparison:
#
# public class Hello {
#     public static void main(String[] args) {
#         System.out.println("Hello, Python!");
#     }
# }`
            ]
        },
        {
            content: `<h4>Indentation Is Syntax</h4>
Python uses <b>indentation</b> instead of curly braces to group statements into blocks. A colon <code>:</code> opens a block, and every line indented under it belongs to that block. The standard is <b>4 spaces</b> per level.<br><br>
Getting the indentation wrong is not a style problem - it is a <code>SyntaxError</code> or <code>IndentationError</code>.`,
            codeExamples: [
                `marks = 72

if marks >= 40:
    print("Passed")          # inside the if-block
    print("Well done!")      # still inside the if-block
print("Result printed")      # outside - runs every time

# OUTPUT:
# Passed
# Well done!
# Result printed`
            ]
        },
        {
            content: `<h4>Where Python Is Used</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Area</th><th>Popular tools</th></tr>
<tr class='text-center'><td>Web backends & APIs</td><td>Django, Flask, FastAPI</td></tr>
<tr class='text-center'><td>Data analysis</td><td>Pandas, NumPy, Jupyter</td></tr>
<tr class='text-center'><td>Machine learning & AI</td><td>scikit-learn, PyTorch, TensorFlow</td></tr>
<tr class='text-center'><td>Automation & scripting</td><td>os, pathlib, subprocess, Selenium</td></tr>
<tr class='text-center'><td>DevOps & cloud</td><td>Ansible, AWS SDK (boto3)</td></tr>
<tr class='text-center'><td>Testing</td><td>pytest, unittest</td></tr>
</table>`
        },
        {
            content: `<h4>A Taste of Python</h4>
A few lines show the style: no type declarations, no semicolons, and powerful built-in collections.`,
            codeExamples: [
                `name = "Pankaj"
age = 28
scores = [90, 85, 78]

print(f"{name} is {age} years old")
print("Average score:", sum(scores) / len(scores))

for score in scores:
    if score >= 80:
        print(score, "is a distinction")

# OUTPUT:
# Pankaj is 28 years old
# Average score: 84.33333333333333
# 90 is a distinction
# 85 is a distinction`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Python vs Java at a Glance</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Python</th><th>Java</th></tr>
<tr class='text-center'><td>Typing</td><td>Dynamic (checked at runtime), strong</td><td>Static (checked at compile time), strong</td></tr>
<tr class='text-center'><td>Blocks</td><td>Indentation</td><td>Curly braces</td></tr>
<tr class='text-center'><td>Execution</td><td>Source compiled to bytecode on the fly, run by the CPython VM</td><td>javac compiles to .class bytecode, run by the JVM</td></tr>
<tr class='text-center'><td>Entry point</td><td>Top of the file (optionally guarded by <code>if __name__ == "__main__"</code>)</td><td><code>public static void main(String[] args)</code></td></tr>
<tr class='text-center'><td>Memory</td><td>Reference counting + cyclic garbage collector</td><td>Tracing garbage collectors (G1, ZGC...)</td></tr>
<tr class='text-center'><td>Verbosity</td><td>Concise</td><td>More ceremony, more explicit</td></tr>
<tr class='text-center'><td>Raw speed</td><td>Slower for CPU-heavy pure-Python loops</td><td>Faster thanks to the JIT compiler</td></tr>
</table>`
        },
        {
            content: `<h3>"Interpreted" Is Only Half the Story</h3>
Python is usually called interpreted, but CPython (the standard implementation) first <b>compiles</b> your source into <b>bytecode</b>, then a virtual machine executes that bytecode - the same two-phase design as Java, just done automatically every time you run the file. Imported modules have their bytecode cached as <code>.pyc</code> files in <code>__pycache__</code> so the compile step is skipped next time.`,
            codeExamples: [
                `import dis

def add(a, b):
    return a + b

dis.dis(add)   # show the bytecode CPython generated for add()

# OUTPUT (Python 3.12; exact opcodes vary by version):
#   RESUME           0
#   LOAD_FAST        0 (a)
#   LOAD_FAST        1 (b)
#   BINARY_OP        0 (+)
#   RETURN_VALUE`
            ]
        },
        {
            content: `<h3>The Zen of Python</h3>
Python's design philosophy is shipped inside the language as an Easter egg. These principles explain many of its choices - for example, why there is usually <i>one obvious way</i> to do something.`,
            codeExamples: [
                `import this

# OUTPUT (first lines):
# The Zen of Python, by Tim Peters
#
# Beautiful is better than ugly.
# Explicit is better than implicit.
# Simple is better than complex.
# Complex is better than complicated.
# Flat is better than nested.
# Sparse is better than dense.
# Readability counts.
# ...`
            ]
        },
        {
            content: `<h3>Python 2 vs Python 3</h3>
Python 3 (2008) deliberately broke compatibility with Python 2 to fix design mistakes. Python 2 reached end of life on <b>1 January 2020</b>, so all new code should be Python 3. You will still see Python 2 syntax in old tutorials:<br><br>
• <code>print "hi"</code> (statement) became <code>print("hi")</code> (function).<br>
• <code>5 / 2</code> was <code>2</code> in Python 2; in Python 3 it is <code>2.5</code> (use <code>//</code> for floor division).<br>
• Strings became Unicode by default; raw bytes got their own <code>bytes</code> type.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is Python compiled or interpreted?</td><td>Both: CPython compiles source to bytecode, then its virtual machine interprets that bytecode</td></tr>
<tr class='text-center'><td>Is Python strongly or weakly typed?</td><td>Strongly typed - <code>"1" + 1</code> raises TypeError instead of silently converting. It is also dynamically typed</td></tr>
<tr class='text-center'><td>Why does Python use indentation?</td><td>To force readable, consistently structured code - the visual layout and the actual block structure can never disagree</td></tr>
<tr class='text-center'><td>What is CPython?</td><td>The reference implementation of Python, written in C - what you get from python.org</td></tr>
<tr class='text-center'><td>Name some other Python implementations</td><td>PyPy (JIT-compiled, often much faster), MicroPython (microcontrollers), Jython (JVM, Python 2 only), IronPython (.NET)</td></tr>
<tr class='text-center'><td>What are .pyc files?</td><td>Cached bytecode for imported modules, stored in __pycache__, so they don't need to be recompiled on every run</td></tr>
</table>`
        }
    ]
};
