import type { Topic } from '../../types';

export const creatingPackages: Topic = {
    id: 'python-modules-packages-creating-packages-init-py',
    name: 'Creating Packages & __init__.py',
    beginner: [
        {
            content: `<h4>What is a Package?</h4>
A <b>module</b> is one <code>.py</code> file. A <b>package</b> is a <b>folder of modules</b> that contains a special file named <code>__init__.py</code>. Packages let you group related modules and use dotted names like <code>shop.payment.upi</code> - just as Java packages map to folders such as <code>com/shop/payment</code>.<br><br>
Packages can contain other packages (<b>subpackages</b>), so a large project becomes a tree of folders.`,
            codeExamples: [
                `# Project layout
project/
    main.py
    shop/
        __init__.py
        cart.py
        payment/
            __init__.py
            upi.py`
            ]
        },
        {
            content: `<h4>Writing the Modules</h4>
Each file is an ordinary module. <code>__init__.py</code> files can start out completely empty.`,
            codeExamples: [
                `# shop/__init__.py
# (empty for now)

# shop/cart.py
def total(prices):
    return sum(prices)

# shop/payment/__init__.py
# (empty)

# shop/payment/upi.py
def pay(amount):
    return f"Paid Rs.{amount} via UPI"`
            ]
        },
        {
            content: `<h4>Importing from a Package</h4>
Run <code>main.py</code> from the <code>project</code> folder. Python finds <code>shop</code> because the script's folder is on the module search path.`,
            codeExamples: [
                `# main.py
import shop.cart
from shop.payment import upi
from shop.payment.upi import pay

print(shop.cart.total([100, 250]))
print(upi.pay(350))
print(pay(99))

# OUTPUT:
# 350
# Paid Rs.350 via UPI
# Paid Rs.99 via UPI`
            ]
        },
        {
            content: `<h4>What __init__.py Does</h4>
• It <b>marks the folder as a regular package</b>.<br>
• It <b>runs once</b>, the first time the package (or anything inside it) is imported. Importing <code>shop.payment.upi</code> runs <code>shop/__init__.py</code>, then <code>shop/payment/__init__.py</code>, then <code>upi.py</code>.<br>
• Whatever it defines becomes an attribute of the package itself, so <code>import shop</code> gives you access to it.`,
            codeExamples: [
                `# shop/__init__.py
print("initialising shop")
__version__ = "1.2.0"

# main.py
import shop
import shop.cart          # shop is already imported - its __init__ does not run again
print(shop.__version__)

# OUTPUT:
# initialising shop
# 1.2.0`
            ]
        },
        {
            content: `<h4>Re-exporting a Friendly API</h4>
Users shouldn't need to know your internal file layout. <code>__init__.py</code> can import the important names so they are available directly from the package.`,
            codeExamples: [
                `# shop/__init__.py
from shop.cart import total
from shop.payment.upi import pay

__all__ = ["total", "pay"]       # what "from shop import *" exports
__version__ = "1.2.0"

# main.py
from shop import total, pay      # no need to know about cart.py or payment/upi.py
print(total([10, 20]), "|", pay(30))

# OUTPUT:
# 30 | Paid Rs.30 via UPI`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Namespace Packages (No __init__.py)</h3>
Since Python 3.3 (PEP 420), a folder <b>without</b> <code>__init__.py</code> can still be imported - it becomes a <b>namespace package</b>. Its purpose is to let one package name be split across several folders (for example, plugins installed separately under <code>company.plugins</code>).<br><br>
For ordinary projects, still add <code>__init__.py</code>:<br>
• It makes the folder's role explicit to readers and tools.<br>
• Some tools (older test runners, linters, type checkers) treat folders without it differently.<br>
• Namespace packages can't run initialisation code or define a package-level API.`,
            codeExamples: [
                `# plugins/            <- no __init__.py
#     report.py

import plugins.report
import plugins
print(hasattr(plugins, "__file__") and plugins.__file__ is not None)

# OUTPUT:
# False
# A namespace package has no __init__.py file, so it has no file location.`
            ]
        },
        {
            content: `<h3>Keep __init__.py Light</h3>
Everything in <code>__init__.py</code> runs whenever <b>any</b> part of the package is imported. Heavy work there - importing big libraries, opening database connections, reading files - slows down every import and can create <b>circular imports</b> when submodules import the package back.`,
            codeExamples: [
                `# shop/__init__.py  - BAD
from shop.reports import build_pdf     # pulls in a heavy PDF library for everyone
DB = connect_to_database()             # side effect on import

# shop/__init__.py  - GOOD
from shop.cart import total            # small, cheap, public API only
__version__ = "1.2.0"`
            ]
        },
        {
            content: `<h3>Package Attributes: __path__, __name__, __file__</h3>
A package is a module object with an extra <code>__path__</code> attribute - the list of folders Python searches for its submodules. Every module also records its full dotted name.`,
            codeExamples: [
                `import shop
import shop.payment.upi as upi

print(shop.__name__, upi.__name__)
print(shop.__path__)
print(shop.__file__)

# OUTPUT (paths are e.g.):
# shop shop.payment.upi
# ['/home/asha/project/shop']
# /home/asha/project/shop/__init__.py`
            ]
        },
        {
            content: `<h3>The src/ Layout for Real Projects</h3>
Professional projects usually put the package inside a <code>src/</code> folder and install it in development mode (<code>pip install -e .</code>). This guarantees your tests import the <b>installed</b> package, not whatever happens to be in the current folder. The <i>Python Packaging</i> module covers <code>pyproject.toml</code> and installation in detail.`,
            codeExamples: [
                `my-shop/
    pyproject.toml
    README.md
    src/
        shop/
            __init__.py
            cart.py
            payment/
                __init__.py
                upi.py
    tests/
        test_cart.py`
            ]
        },
        {
            content: `<h3>Python Packages vs Java Packages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Declared by</td><td><code>package com.shop;</code> at the top of each file</td><td>The folder structure plus <code>__init__.py</code></td></tr>
<tr class='text-center'><td>Unit of code</td><td>A class (one public class per file)</td><td>A module (any number of classes and functions per file)</td></tr>
<tr class='text-center'><td>Initialisation code</td><td>None at package level</td><td><code>__init__.py</code> runs on first import</td></tr>
<tr class='text-center'><td>Visibility</td><td>package-private by default</td><td>Everything is importable; a leading <code>_</code> signals "internal"</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Module vs package?</td><td>A module is a single .py file; a package is a folder of modules (normally with __init__.py)</td></tr>
<tr class='text-center'><td>What does __init__.py do?</td><td>Marks a regular package and runs once on first import; it can define a package-level API, __all__ and __version__</td></tr>
<tr class='text-center'><td>Is __init__.py required?</td><td>Not since Python 3.3 - without it the folder is a namespace package - but it is still recommended for normal projects</td></tr>
<tr class='text-center'><td>What does __all__ control?</td><td>The names exported by <code>from package import *</code></td></tr>
<tr class='text-center'><td>Why keep __init__.py small?</td><td>It runs on every import of the package; heavy imports or side effects slow everything down and invite circular imports</td></tr>
<tr class='text-center'><td>What is __path__?</td><td>The list of directories searched for a package's submodules</td></tr>
</table>`
        }
    ]
};
