import type { Topic } from '../../types';

export const importStatements: Topic = {
    id: 'python-modules-packages-import-from-import',
    name: 'import & from ... import',
    beginner: [
        {
            content: `<h4>What is a Module?</h4>
A <b>module</b> is simply a file of Python code - any <code>.py</code> file is a module, and its name is the file name without <code>.py</code>. Python also ships with hundreds of ready-made modules (the <b>standard library</b>: <code>math</code>, <code>random</code>, <code>json</code>, <code>datetime</code>...), and you can install more with pip.<br><br>
<code>import</code> makes another module's functions, classes and variables available in your file - like Java's <code>import java.util.List;</code>, except that Python imports are ordinary statements that run when the line executes.`
        },
        {
            content: `<h4>import module</h4>
<code>import math</code> gives you a single name, <code>math</code>. Everything inside is reached with a dot. This keeps it obvious where each name comes from.`,
            codeExamples: [
                `import math

print(math.sqrt(49))
print(math.pi)
print(math.ceil(4.2), math.floor(4.8))

# OUTPUT:
# 7.0
# 3.141592653589793
# 5 4`
            ]
        },
        {
            content: `<h4>from module import name</h4>
<code>from math import sqrt, pi</code> copies just those names into your file, so you can use them without the <code>math.</code> prefix. Import several names by separating them with commas, or wrap a long list in parentheses.`,
            codeExamples: [
                `from math import sqrt, pi
from datetime import (
    date,
    timedelta,
)

print(sqrt(81), round(pi, 2))
print(date(2026, 10, 4) + timedelta(days=30))

# OUTPUT:
# 9.0 3.14
# 2026-11-03`
            ]
        },
        {
            content: `<h4>Avoid from module import *</h4>
<code>from math import *</code> dumps every public name of the module into your file. It is discouraged because:<br>
• you can no longer see where a name came from;<br>
• it can silently <b>overwrite</b> your own names or names from another module;<br>
• tools and readers can't tell which names exist.<br><br>
A module can limit what <code>*</code> exports with an <code>__all__</code> list (see <i>Creating Modules</i>).`,
            codeExamples: [
                `pow = "my power setting"
from math import *              # math also has a pow()

print(pow)                      # our variable was replaced!

# OUTPUT:
# <built-in function pow>`
            ]
        },
        {
            content: `<h4>When an Import Fails</h4>`,
            codeExamples: [
                `import xyz

# OUTPUT:
# ModuleNotFoundError: No module named 'xyz'`,
                `from math import squareroot

# OUTPUT (the part in brackets shows where math lives and varies):
# ImportError: cannot import name 'squareroot' from 'math' (...)`
            ]
        },
        {
            content: `<h4>Where to Put Imports (PEP 8)</h4>
Imports go at the <b>top of the file</b>, one module per line, in three groups separated by a blank line:<br>
1. standard library<br>
2. third-party packages (installed with pip)<br>
3. your own project's modules`,
            codeExamples: [
                `# standard library
import json
import os
from datetime import date

# third-party
import requests

# this project
from shop.cart import Cart
from shop.utils import format_price`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What import Actually Does</h3>
The first time a module is imported, Python:<br>
1. <b>finds</b> it (searching <code>sys.path</code>),<br>
2. <b>loads</b> it - compiling to bytecode, cached in <code>__pycache__</code>,<br>
3. <b>executes</b> the whole file from top to bottom, creating its functions and variables,<br>
4. <b>caches</b> the module object in <code>sys.modules</code>.<br><br>
Every later import of the same module just returns the cached object - the file is <b>not</b> run again.`,
            codeExamples: [
                `# helper.py
print("helper.py is running")

def greet():
    return "hi"`,
                `# main.py
import sys
import helper
import helper                   # already cached - nothing printed
from helper import greet        # still the same cached module

print(greet())
print("helper" in sys.modules)

# OUTPUT (python main.py):
# helper.py is running
# hi
# True`
            ]
        },
        {
            content: `<h3>from-import Copies the Binding</h3>
<code>from config import debug</code> creates a new name <code>debug</code> in your module that points at the object <code>config.debug</code> pointed at <b>at import time</b>. If <code>config</code> later rebinds its variable, your copy doesn't follow. Use <code>import config</code> and read <code>config.debug</code> when a value can change.`,
            codeExamples: [
                `# config.py
debug = False

def enable_debug():
    global debug
    debug = True`,
                `# main.py
import config
from config import debug, enable_debug

enable_debug()
print(debug)            # the copy made at import time
print(config.debug)     # always looked up on the module

# OUTPUT:
# False
# True`
            ]
        },
        {
            content: `<h3>Circular Imports</h3>
If <code>a.py</code> imports <code>b.py</code> while <code>b.py</code> imports <code>a.py</code>, one of them is used while it is only <b>partially initialised</b> - its later definitions don't exist yet.`,
            codeExamples: [
                `# a.py
from b import helper_b

def helper_a():
    return "A"`,
                `# b.py
from a import helper_a

def helper_b():
    return "B"`,
                `# main.py
import a

# OUTPUT (the path in brackets varies):
# ImportError: cannot import name 'helper_a' from partially initialized module 'a' (most likely due to a circular import) (...)`
            ]
        },
        {
            content: `<h3>Fixing Circular Imports</h3>
• <b>Best:</b> move the shared code into a third module that both import - circular imports usually signal tangled responsibilities.<br>
• Import the <b>module</b>, not the name (<code>import a</code>, then call <code>a.helper_a()</code> inside a function) - the attribute is looked up only when the function runs, after both modules finished loading.<br>
• Move the import <b>inside the function</b> that needs it (a local import).`,
            codeExamples: [
                `# b.py - fixed
import a                     # module object only; nothing looked up yet

def helper_b():
    return "B uses " + a.helper_a()   # resolved at call time`
            ]
        },
        {
            content: `<h3>Local (Lazy) Imports</h3>
An import inside a function runs only when the function is called. This speeds up start-up when a heavy module is rarely needed, and breaks import cycles. After the first call the module comes from <code>sys.modules</code>, so repeated calls are cheap.`,
            codeExamples: [
                `def export_report(rows):
    import csv                  # only loaded if a report is exported
    import io
    buffer = io.StringIO()
    csv.writer(buffer).writerows(rows)
    return buffer.getvalue()

print(export_report([["id", "name"], [1, "Asha"]]), end="")

# OUTPUT:
# id,name
# 1,Asha`
            ]
        },
        {
            content: `<h3>Dynamic Imports with importlib</h3>
When the module name is only known at runtime (plugins, configurable back-ends), <code>importlib.import_module(name)</code> imports it from a string. <code>importlib.reload(module)</code> re-executes a module's code, but objects created earlier - names copied with <code>from ... import</code>, instances of old classes - keep pointing at the <b>old</b> versions, so reload is a REPL convenience, not a deployment tool.`,
            codeExamples: [
                `import importlib

for name in ["math", "statistics"]:
    module = importlib.import_module(name)
    print(module.__name__, "loaded")

stats = importlib.import_module("statistics")
print(stats.mean([2, 4, 9]))

# OUTPUT:
# math loaded
# statistics loaded
# 5`
            ]
        },
        {
            content: `<h3>Python import vs Java import</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>When it happens</td><td>Compile time - only a naming shortcut</td><td>Runtime - executes the module the first time</td></tr>
<tr class='text-center'><td>Needed to use a class?</td><td>No - the fully qualified name always works</td><td>Yes - a module must be imported before use</td></tr>
<tr class='text-center'><td>Unit</td><td>Classes and packages</td><td>Modules (files) and packages (folders)</td></tr>
<tr class='text-center'><td>Wildcard</td><td><code>import java.util.*;</code></td><td><code>from x import *</code> (discouraged)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td><code>import x</code> vs <code>from x import y</code>?</td><td>The first binds the module name and you write x.y; the second binds y directly in your namespace</td></tr>
<tr class='text-center'><td>Is a module's code run every time it is imported?</td><td>No - only on the first import; later imports return the object cached in sys.modules</td></tr>
<tr class='text-center'><td>Why avoid <code>from x import *</code>?</td><td>It hides where names come from and can silently overwrite existing names</td></tr>
<tr class='text-center'><td>ModuleNotFoundError vs ImportError?</td><td>ModuleNotFoundError (a subclass) means the module itself wasn't found; ImportError also covers a missing name inside a module</td></tr>
<tr class='text-center'><td>How do you fix a circular import?</td><td>Move shared code to a third module, import the module instead of names, or import inside a function</td></tr>
<tr class='text-center'><td>How do you import a module whose name is in a string?</td><td><code>importlib.import_module(name)</code></td></tr>
</table>`
        }
    ]
};
