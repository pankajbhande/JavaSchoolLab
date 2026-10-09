import type { Topic } from '../../types';

export const creatingModules: Topic = {
    id: 'python-modules-packages-creating-modules',
    name: 'Creating Modules',
    beginner: [
        {
            content: `<h4>Your First Module</h4>
Any <code>.py</code> file you write is a module. Put reusable functions and constants in one file, then import it from another file in the <b>same folder</b>.`,
            codeExamples: [
                `# mathutils.py
"""Small helpers for billing calculations."""

TAX_RATE = 0.18

def add_tax(amount):
    return round(amount * (1 + TAX_RATE), 2)

def average(numbers):
    return sum(numbers) / len(numbers)`,
                `# main.py  (same folder as mathutils.py)
import mathutils
from mathutils import average

print(mathutils.add_tax(1000))
print(average([70, 80, 90]))
print(mathutils.TAX_RATE)

# OUTPUT (python main.py):
# 1180.0
# 80.0
# 0.18`
            ]
        },
        {
            content: `<h4>Module-Level Code Runs on Import</h4>
Importing a module executes every top-level statement in it - that is how its functions get defined. Any <code>print()</code> or other work at the top level runs too (once, on the first import).`,
            codeExamples: [
                `# loud.py
print("loud.py: loading...")
VERSION = "1.0"`,
                `# main.py
import loud
print("main.py: version", loud.VERSION)

# OUTPUT:
# loud.py: loading...
# main.py: version 1.0`
            ]
        },
        {
            content: `<h4>Exploring a Module</h4>
A module is an object. <code>dir()</code> lists its names, and the module docstring (the first string in the file) is available as <code>__doc__</code>.`,
            codeExamples: [
                `import mathutils

print([name for name in dir(mathutils) if not name.startswith("_")])
print(mathutils.__doc__)
print(type(mathutils))

# OUTPUT:
# ['TAX_RATE', 'add_tax', 'average']
# Small helpers for billing calculations.
# <class 'module'>`
            ]
        },
        {
            content: `<h4>Naming Rules</h4>
• Use short, lowercase <code>snake_case</code> names: <code>price_utils.py</code>, not <code>PriceUtils.py</code> or <code>price-utils.py</code> (a hyphen can't be imported).<br>
• <b>Never name a file after a standard-library module</b> such as <code>random.py</code>, <code>math.py</code>, <code>email.py</code>, <code>json.py</code> or <code>test.py</code>. Your folder is searched first, so your file <b>shadows</b> the real module.`,
            codeExamples: [
                `# random.py   (a student's practice file - bad name!)
import random                  # imports THIS file, not the standard library

print(random.randint(1, 6))

# OUTPUT (python random.py):
# AttributeError: partially initialized module 'random' has no attribute 'randint' (most likely due to a circular import)
#
# Fix: rename the file (e.g. dice.py) and delete any __pycache__ folder next to it.`
            ]
        },
        {
            content: `<h4>The __pycache__ Folder</h4>
After the first import, Python saves the compiled bytecode in a <code>__pycache__</code> folder (e.g. <code>mathutils.cpython-312.pyc</code>) so the next import skips compiling. It is safe to delete, is recreated automatically, and belongs in <code>.gitignore</code>. The file you run directly is not cached this way - only imported modules are.`
        }
    ],

    expert: [
        {
            content: `<h3>__all__: Declaring the Public API</h3>
<code>__all__</code> is a list of the names a module considers public. It controls what <code>from module import *</code> exports and documents the API for readers and tools. Names starting with an underscore are treated as private by convention and are skipped by <code>*</code> anyway.`,
            codeExamples: [
                `# pricing.py
__all__ = ["final_price"]

DISCOUNT = 0.1

def _apply_discount(amount):          # private helper
    return amount * (1 - DISCOUNT)

def final_price(amount):
    return round(_apply_discount(amount) * 1.18, 2)`,
                `# main.py
from pricing import *

print(final_price(1000))
print("DISCOUNT" in dir(), "_apply_discount" in dir())

import pricing
print(pricing._apply_discount(100))   # still reachable - privacy is a convention

# OUTPUT:
# 1062.0
# False False
# 90.0`
            ]
        },
        {
            content: `<h3>Keep Imports Free of Side Effects</h3>
A module should <b>define</b> things on import, not <b>do</b> things: no database connections, file writes, network calls or long computations at the top level. Side effects make imports slow, make tests unpredictable, and fire even when someone only wanted one helper function. Put work inside functions and start it from <code>main()</code>.`,
            codeExamples: [
                `# Bad: connects to the database as soon as anyone imports this module
# db = connect("prod-server")

# Good: connect only when asked
_connection = None

def get_connection():
    global _connection
    if _connection is None:
        _connection = "connected"     # stand-in for a real connect() call
    return _connection

print(get_connection())

# OUTPUT:
# connected`
            ]
        },
        {
            content: `<h3>A Module Is a Natural Singleton</h3>
Because a module is executed once and then cached, every importer shares the <b>same</b> module object. A small <code>settings.py</code> module is therefore a simple way to share configuration across a program.`,
            codeExamples: [
                `# settings.py
DEBUG = False
CURRENCY = "INR"`,
                `# app.py
import settings
import report

settings.DEBUG = True        # change it once...
report.show()`,
                `# report.py
import settings

def show():
    print("debug mode:", settings.DEBUG)   # ...every module sees it

# OUTPUT (python app.py):
# debug mode: True`
            ]
        },
        {
            content: `<h3>Splitting a Growing Script</h3>
When one file passes a few hundred lines, split it by responsibility:<br>
1. Group related functions (e.g. pricing, file loading, reporting).<br>
2. Move each group into its own module with a clear name.<br>
3. Keep <code>main.py</code> thin - it imports the modules and wires them together.<br>
4. Avoid modules importing each other in a circle; shared helpers go into a lower-level module (e.g. <code>utils.py</code>).<br>
5. Once you have several related modules, group them into a <b>package</b> (next topic).`
        },
        {
            content: `<h3>Inspecting a Module: __file__ and help()</h3>
<code>module.__file__</code> shows which file was actually imported - the quickest way to diagnose shadowing. <code>help(module)</code> prints the docstrings of the module and everything in it.`,
            codeExamples: [
                `import json
import mathutils

print(json.__file__)
print(mathutils.__file__)
help(mathutils)

# OUTPUT (paths vary - e.g.):
# C:\\Python312\\Lib\\json\\__init__.py
# D:\\projects\\billing\\mathutils.py
# Help on module mathutils:
#
# NAME
#     mathutils - Small helpers for billing calculations.
# ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you create a module?</td><td>Write a .py file; import it by its file name without .py</td></tr>
<tr class='text-center'><td>What runs when a module is imported?</td><td>All of its top-level code, once, on the first import</td></tr>
<tr class='text-center'><td>What is <code>__all__</code> for?</td><td>It lists the public names exported by <code>from module import *</code> and documents the API</td></tr>
<tr class='text-center'><td>Why not name a file random.py?</td><td>It shadows the standard-library module, so <code>import random</code> loads your file instead</td></tr>
<tr class='text-center'><td>What is <code>__pycache__</code>?</td><td>A folder of cached compiled bytecode (.pyc) for imported modules - safe to delete</td></tr>
<tr class='text-center'><td>How do you mark a name as private?</td><td>Prefix it with an underscore - a convention, not enforced</td></tr>
</table>`
        }
    ]
};
