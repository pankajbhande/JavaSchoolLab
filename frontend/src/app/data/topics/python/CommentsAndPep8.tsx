import type { Topic } from '../../types';

export const commentsAndPep8: Topic = {
    id: 'python-basics-comments-pep-8',
    name: 'Comments & PEP 8',
    beginner: [
        {
            content: `<h4>Single-Line Comments</h4>
A comment starts with <code>#</code> and runs to the end of the line. Python ignores it completely. Use comments to explain <b>why</b> code does something - the code itself already shows <i>what</i> it does.`,
            codeExamples: [
                `# Calculate the final price after GST
price = 1000
gst_rate = 0.18      # 18% GST on electronics
total = price + price * gst_rate
print(total)

# OUTPUT:
# 1180.0`
            ]
        },
        {
            content: `<h4>Multi-Line Comments</h4>
Python has no <code>/* ... */</code> block comment. Put a <code>#</code> at the start of every line instead - every editor can do this for you with <code>Ctrl+/</code>.`,
            codeExamples: [
                `# This function is kept for backward compatibility.
# New code should call calculate_total() instead,
# which also applies discount coupons.
def old_total(price):
    return price * 1.18`
            ]
        },
        {
            content: `<h4>Docstrings</h4>
A <b>docstring</b> is a string literal placed as the <b>first statement</b> of a module, function or class. Unlike a comment, it is kept at runtime: <code>help()</code>, editors and documentation tools read it. Docstrings use triple double quotes.`,
            codeExamples: [
                `def area_of_circle(radius):
    """Return the area of a circle with the given radius."""
    return 3.14159 * radius ** 2

print(area_of_circle.__doc__)
help(area_of_circle)

# OUTPUT:
# Return the area of a circle with the given radius.
# Help on function area_of_circle in module __main__:
#
# area_of_circle(radius)
#     Return the area of a circle with the given radius.`
            ]
        },
        {
            content: `<h4>What is PEP 8?</h4>
<b>PEP 8</b> is Python's official style guide (PEP = Python Enhancement Proposal). Following it makes your code look like everyone else's, so others can read it instantly. The rules you will use every day:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Rule</th><th>Example</th></tr>
<tr class='text-center'><td>4 spaces per indent level, never tabs</td><td><code>&nbsp;&nbsp;&nbsp;&nbsp;return x</code></td></tr>
<tr class='text-center'><td>Variables and functions: snake_case</td><td><code>total_marks</code>, <code>get_user()</code></td></tr>
<tr class='text-center'><td>Classes: CapWords</td><td><code>StudentRecord</code></td></tr>
<tr class='text-center'><td>Constants: UPPER_CASE</td><td><code>MAX_RETRIES = 3</code></td></tr>
<tr class='text-center'><td>Spaces around operators and after commas</td><td><code>x = a + b</code>, <code>f(a, b)</code></td></tr>
<tr class='text-center'><td>Max line length 79 (many teams use 88-100)</td><td>Break long lines inside brackets</td></tr>
<tr class='text-center'><td>Two blank lines around top-level functions and classes</td><td></td></tr>
</table>`
        },
        {
            content: `<h4>Before and After PEP 8</h4>
Both versions run identically - only one is pleasant to read.`,
            codeExamples: [
                `# Not PEP 8
def CalcTotal(Price,Qty):
  Total=Price*Qty
  return Total
class shopping_cart:
  pass`,
                `# PEP 8
def calc_total(price, qty):
    total = price * qty
    return total


class ShoppingCart:
    pass`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Docstring Conventions (PEP 257)</h3>
A one-line docstring is a short imperative sentence. A multi-line docstring has a summary line, a blank line, then details. Teams usually pick one layout - <b>Google style</b> (below) and <b>NumPy style</b> are the most common - so tools like Sphinx can generate documentation from them.`,
            codeExamples: [
                `def transfer(amount, from_account, to_account):
    """Move money between two accounts.

    Args:
        amount: Amount in rupees; must be positive.
        from_account: Account to debit.
        to_account: Account to credit.

    Returns:
        The transaction id as a string.

    Raises:
        ValueError: If amount is not positive.
    """
    if amount <= 0:
        raise ValueError("amount must be positive")
    return "TXN-001"`
            ]
        },
        {
            content: `<h3>Other PEP 8 Rules Interviewers Notice</h3>
• Compare to <code>None</code> with <code>is</code> / <code>is not</code>, never <code>==</code>.<br>
• Test empty sequences by truthiness: <code>if not items:</code> rather than <code>if len(items) == 0:</code>.<br>
• Imports go at the top, one per line, grouped: standard library, then third-party, then your own modules, separated by blank lines.<br>
• Avoid <code>from module import *</code> - it hides where names come from.<br>
• Use <code>isinstance(x, int)</code> rather than <code>type(x) == int</code>.<br>
• A leading underscore (<code>_helper</code>) marks a name as internal.`,
            codeExamples: [
                `import json
import os

import requests

from shop.models import Order


def find_order(orders, order_id):
    if not orders:
        return None
    for order in orders:
        if order.id == order_id:
            return order
    return None


result = find_order([], 7)
if result is None:
    print("not found")`
            ]
        },
        {
            content: `<h3>Let Tools Enforce the Style</h3>
Nobody checks PEP 8 by eye in a real team. Formatters rewrite code automatically, linters report problems:<br>
• <b>Ruff</b> - extremely fast linter <i>and</i> formatter (<code>ruff check .</code>, <code>ruff format .</code>).<br>
• <b>Black</b> - the "uncompromising" formatter that made auto-formatting standard in Python.<br>
• <b>Flake8 / Pylint</b> - older linters, still widely used.<br><br>
Special comments silence a check on one line: <code># noqa: E501</code> for linters, <code># type: ignore</code> for type checkers.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Comment vs docstring?</td><td>Comments (<code>#</code>) are discarded by the compiler; docstrings are string objects stored in <code>__doc__</code> and available at runtime</td></tr>
<tr class='text-center'><td>Does Python have multi-line comments?</td><td>No - use <code>#</code> on each line. A bare triple-quoted string is an unused expression, not a comment, though it is sometimes used that way</td></tr>
<tr class='text-center'><td>What is PEP 8?</td><td>The official Python style guide covering naming, indentation, whitespace, line length and imports</td></tr>
<tr class='text-center'><td>Naming convention for constants and classes?</td><td>Constants UPPER_CASE, classes CapWords, functions and variables snake_case</td></tr>
<tr class='text-center'><td>Why <code>x is None</code> rather than <code>x == None</code>?</td><td>None is a singleton, so identity is exact and fast; <code>==</code> can be overridden by a class's <code>__eq__</code></td></tr>
</table>`
        }
    ]
};
