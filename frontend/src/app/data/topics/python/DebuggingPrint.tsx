import type { Topic } from '../../types';

export const debuggingPrint: Topic = {
    id: 'python-debugging-print-debugging',
    name: 'print() Debugging',
    beginner: [
        {
            content: `<h4>Why Print Debugging Still Works</h4>
The quickest way to understand a misbehaving program is to <b>look at the values</b> while it runs. Adding a few <code>print()</code> calls at the right places shows which branch ran, what a variable held, and where things went wrong - no tools to set up. Every developer does it; the skill is printing the <b>right</b> things.`
        },
        {
            content: `<h4>Strategic Prints</h4>
Print at decision points: function inputs, loop progress, and the values that feed a condition. Label every print so the output can be read without the source code next to it.`,
            codeExamples: [
                `def apply_discount(price, percent):
    print("apply_discount called with", price, percent)    # inputs
    discount = price * percent / 100
    final = price - discount
    print("discount =", discount, "final =", final)        # intermediate values
    return final

total = 0
for p in [500, 1200, 300]:
    total += apply_discount(p, 10)
print("total =", total)

# OUTPUT:
# apply_discount called with 500 10
# discount = 50.0 final = 450.0
# apply_discount called with 1200 10
# discount = 120.0 final = 1080.0
# apply_discount called with 300 10
# discount = 30.0 final = 270.0
# total = 1800.0`
            ]
        },
        {
            content: `<h4>The f"{var=}" Shortcut</h4>
Since Python 3.8, an <code>=</code> after an expression in an f-string prints the expression <b>and</b> its value. It saves typing labels and keeps them correct when you rename variables.`,
            codeExamples: [
                `price = 1200
qty = 3
items = ["pen", "book"]

print(f"{price=}, {qty=}")
print(f"{price * qty=}")
print(f"{len(items)=}")
print(f"{price / 7=:.2f}")        # format specs still work

# OUTPUT:
# price=1200, qty=3
# price * qty=3600
# len(items)=2
# price / 7=171.43`
            ]
        },
        {
            content: `<h4>Use repr() to See Hidden Characters</h4>
Strings with trailing spaces, tabs or newlines look identical when printed normally. <code>repr()</code> (or <code>!r</code> in an f-string) shows the quotes and escape codes, revealing the problem instantly - a classic cause of "these two strings look equal but aren't".`,
            codeExamples: [
                `name = "Abaji \\n"            # e.g. read from a file or input

print(f"[{name}]")
print(repr(name))
print(f"{name!r}")
print(name == "Abaji", name.strip() == "Abaji")

# OUTPUT:
# [Abaji
# ]
# 'Abaji \\n'
# 'Abaji \\n'
# False True`
            ]
        },
        {
            content: `<h4>Print the Type Too</h4>
Many bugs are a value of the <b>wrong type</b>: the string <code>"5"</code> instead of the number <code>5</code>, <code>None</code> instead of a list. Print <code>type()</code> next to the value when something "should work but doesn't".`,
            codeExamples: [
                `qty = "5"                        # came from input() - a string!
print(qty, type(qty))
print(f"{qty=!r}")                # the quotes give it away
print(qty * 2)                    # repeats the string instead of doubling

# OUTPUT:
# 5 <class 'str'>
# qty='5'
# 55`
            ]
        },
        {
            content: `<h4>pprint for Nested Data</h4>
A large nested dict printed on one line is unreadable. <code>pprint</code> spreads it over several indented lines.`,
            codeExamples: [
                `from pprint import pprint

order = {"id": 42, "customer": {"name": "Abaji", "city": "Pune"},
         "items": [{"sku": "PEN", "qty": 3}, {"sku": "BOOK", "qty": 1}]}

pprint(order, width=50, sort_dicts=False)

# OUTPUT:
# {'id': 42,
#  'customer': {'name': 'Abaji', 'city': 'Pune'},
#  'items': [{'sku': 'PEN', 'qty': 3},
#            {'sku': 'BOOK', 'qty': 1}]}`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Debug Output Belongs on stderr</h3>
Normal program output goes to <b>stdout</b>; diagnostics should go to <b>stderr</b>. Then <code>python report.py &gt; out.csv</code> still writes clean data to the file while your debug lines appear on the screen - Java's <code>System.err.println</code> serves the same purpose.`,
            codeExamples: [
                `import sys

rows = [("Abaji", 91), ("Raoji", 78)]
print("rows loaded:", len(rows), file=sys.stderr)     # diagnostic
for name, marks in rows:
    print(f"{name},{marks}")                           # real output

# OUTPUT (both streams shown in the terminal):
# rows loaded: 2
# Abaji,91
# Raoji,78`
            ]
        },
        {
            content: `<h3>Keep Debug Prints Easy to Remove</h3>
Forgotten debug prints in production code are noisy and can leak data (passwords, tokens, personal details). Some habits:<br>
• Mark them with a searchable tag such as <code># DEBUG</code> and remove them before committing.<br>
• Put a guard flag around temporary diagnostics.<br>
• Let a linter flag them: Ruff's <code>T201</code> rule reports every <code>print</code> call.<br>
• Better still, use <code>logging</code> from the start - you can switch it off without touching the code.`,
            codeExamples: [
                `DEBUG = False

def debug(*args):
    if DEBUG:
        print("[debug]", *args)

def checkout(cart):
    debug("cart =", cart)                   # silent unless DEBUG is True
    return sum(cart.values())

print(checkout({"pen": 30, "book": 250}))
DEBUG = True
print(checkout({"pen": 30}))

# OUTPUT:
# 280
# [debug] cart = {'pen': 30}
# 30`
            ]
        },
        {
            content: `<h3>Why Logging Wins in the Long Run</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Need</th><th>print()</th><th>logging</th></tr>
<tr class='text-center'><td>Turn messages off without editing code</td><td>No</td><td>Yes - change the level</td></tr>
<tr class='text-center'><td>Severity (debug / warning / error)</td><td>No</td><td>Built in</td></tr>
<tr class='text-center'><td>Timestamps, module name, line number</td><td>Manual</td><td>One format string</td></tr>
<tr class='text-center'><td>Write to a file, rotate, send to a server</td><td>Manual</td><td>Handlers</td></tr>
<tr class='text-center'><td>Full traceback of an exception</td><td>Manual</td><td><code>logger.exception()</code></td></tr>
</table>
Use <code>print</code> for a quick investigation you will delete in five minutes; use <code>logging</code> for anything that stays in the code - the next topics cover it.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>f"{x=}"</code> print?</td><td>The expression text, an equals sign and its value, e.g. <code>x=42</code> (Python 3.8+)</td></tr>
<tr class='text-center'><td>Why print repr() of a string while debugging?</td><td>It shows quotes and escapes, revealing hidden whitespace like trailing spaces or <code>\\n</code></td></tr>
<tr class='text-center'><td>Where should debug output go?</td><td>To stderr (<code>print(..., file=sys.stderr)</code>), so it doesn't mix with real output on stdout</td></tr>
<tr class='text-center'><td>How do you print nested data readably?</td><td><code>pprint.pprint()</code></td></tr>
<tr class='text-center'><td>When should you switch from print to logging?</td><td>As soon as the messages need to stay in the code, have levels, timestamps or go to files</td></tr>
</table>`
        }
    ]
};
