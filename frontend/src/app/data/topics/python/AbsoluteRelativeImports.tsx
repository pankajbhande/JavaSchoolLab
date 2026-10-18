import type { Topic } from '../../types';

export const absoluteRelativeImports: Topic = {
    id: 'python-modules-packages-absolute-vs-relative-imports',
    name: 'Absolute vs Relative Imports',
    beginner: [
        {
            content: `<h4>Two Ways to Name What You Import</h4>
• An <b>absolute import</b> spells out the full path from the top-level package: <code>from shop.payment import upi</code>.<br>
• A <b>relative import</b> starts with dots and is resolved from the <b>current package</b>: <code>from . import cart</code>.<br><br>
All examples below use this layout:`,
            codeExamples: [
                `project/
    main.py
    shop/
        __init__.py
        config.py
        cart.py
        payment/
            __init__.py
            upi.py
            receipt.py`
            ]
        },
        {
            content: `<h4>Absolute Imports</h4>
Absolute imports work the same from any file and make it obvious where a name comes from. <b>PEP 8 recommends them</b> for most code.`,
            codeExamples: [
                `# shop/payment/upi.py
from shop.config import CURRENCY
from shop.payment.receipt import make_receipt

def pay(amount):
    return make_receipt(f"{CURRENCY}{amount} via UPI")`
            ]
        },
        {
            content: `<h4>Relative Imports</h4>
One dot means "the package this module is in", two dots mean "its parent package", and so on.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Written in shop/payment/upi.py</th><th>Resolves to</th></tr>
<tr class='text-center'><td><code>from . import receipt</code></td><td><code>shop.payment.receipt</code></td></tr>
<tr class='text-center'><td><code>from .receipt import make_receipt</code></td><td><code>shop.payment.receipt.make_receipt</code></td></tr>
<tr class='text-center'><td><code>from .. import config</code></td><td><code>shop.config</code></td></tr>
<tr class='text-center'><td><code>from ..cart import total</code></td><td><code>shop.cart.total</code></td></tr>
</table>`,
            codeExamples: [
                `# shop/payment/upi.py  - the same imports written relatively
from ..config import CURRENCY
from .receipt import make_receipt

def pay(amount):
    return make_receipt(f"{CURRENCY}{amount} via UPI")`
            ]
        },
        {
            content: `<h4>Using the Package</h4>
Both versions behave identically when the package is imported normally.`,
            codeExamples: [
                `# shop/config.py
CURRENCY = "Rs."

# shop/payment/receipt.py
def make_receipt(text):
    return f"[RECEIPT] {text}"

# main.py   (run from the project folder: python main.py)
from shop.payment.upi import pay
print(pay(499))

# OUTPUT:
# [RECEIPT] Rs.499 via UPI`
            ]
        },
        {
            content: `<h4>Relative Imports Only Work Inside Packages</h4>
Dots are resolved relative to the package a module belongs to. A file that isn't imported as part of a package - such as the main script - has no package, so it can't use relative imports. Only the <code>from ... import ...</code> form can be relative; <code>import .cart</code> is a <code>SyntaxError</code>.`
        }
    ],

    expert: [
        {
            content: `<h3>The Classic Error: Running a Package Module as a Script</h3>
If you run a file inside a package directly with its path, Python loads it as <code>__main__</code> with <b>no parent package</b>, so every relative import inside it fails.`,
            codeExamples: [
                `# shop/payment/upi.py contains: from .receipt import make_receipt

# Run from the project folder:
#   python shop/payment/upi.py

# OUTPUT:
# ImportError: attempted relative import with no known parent package`,
                `# Fix: run it as a module, using its dotted name, from the project folder
#   python -m shop.payment.upi

# Now Python imports it as part of the shop.payment package,
# so ".receipt" resolves to shop.payment.receipt.`
            ]
        },
        {
            content: `<h3>How Python Resolves the Dots</h3>
A relative import is resolved using the module's <code>__package__</code> attribute (derived from its <code>__name__</code>). Inside <code>shop.payment.upi</code>, <code>__package__</code> is <code>"shop.payment"</code>, so one dot means <code>shop.payment</code> and two dots mean <code>shop</code>. When a file runs as a script, <code>__name__</code> is <code>"__main__"</code> and there is no package to start from.`,
            codeExamples: [
                `# shop/payment/upi.py
print(__name__, "|", __package__)

# main.py:  import shop.payment.upi
# OUTPUT:
# shop.payment.upi | shop.payment

# python -m shop.payment.upi
# OUTPUT:
# __main__ | shop.payment`
            ]
        },
        {
            content: `<h3>Going Above the Top-Level Package</h3>
Each extra dot climbs one package level. Climbing past the top-level package (here <code>shop</code>) is an error - <code>project/</code> itself is not a package.`,
            codeExamples: [
                `# shop/payment/upi.py
from ... import main          # three dots: above shop

# OUTPUT:
# ImportError: attempted relative import beyond top-level package`
            ]
        },
        {
            content: `<h3>Which Should You Use?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Absolute</th><th>Relative</th></tr>
<tr class='text-center'><td>Readability</td><td>Full location visible</td><td>Shorter; location implied</td></tr>
<tr class='text-center'><td>Works in scripts</td><td>Yes</td><td>No - only inside packages</td></tr>
<tr class='text-center'><td>Renaming the top-level package</td><td>Every import must change</td><td>Internal imports keep working</td></tr>
<tr class='text-center'><td>PEP 8</td><td>Recommended</td><td>Acceptable for intra-package imports</td></tr>
</table>
A good rule: use <b>absolute</b> imports everywhere by default, and <b>relative</b> imports only between tightly coupled modules inside the same package (for example, a package's <code>__init__.py</code> re-exporting its own submodules with <code>from .cart import total</code>).`
        },
        {
            content: `<h3>Comparison with Java</h3>
Java has only absolute imports (<code>import com.shop.payment.Upi;</code>), and classes in the <b>same</b> package need no import at all. Python has no "same package is automatically visible" rule: even a sibling module must be imported, either absolutely (<code>from shop.payment import receipt</code>) or relatively (<code>from . import receipt</code>).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Absolute vs relative import?</td><td>Absolute names the full path from the top-level package; relative uses dots to start from the current package</td></tr>
<tr class='text-center'><td>Which does PEP 8 recommend?</td><td>Absolute imports; explicit relative imports are acceptable inside packages</td></tr>
<tr class='text-center'><td>Why "attempted relative import with no known parent package"?</td><td>The module was run as a script, so it has no package; run it with <code>python -m package.module</code> instead</td></tr>
<tr class='text-center'><td>What does <code>from .. import x</code> mean?</td><td>Import x from the parent of the current package</td></tr>
<tr class='text-center'><td>Can you write <code>import .module</code>?</td><td>No - relative imports must use the <code>from . import ...</code> form</td></tr>
<tr class='text-center'><td>What attribute is used to resolve relative imports?</td><td><code>__package__</code> (derived from <code>__name__</code>)</td></tr>
</table>`
        }
    ]
};
