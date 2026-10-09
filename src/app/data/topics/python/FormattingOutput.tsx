import type { Topic } from '../../types';

export const formattingOutput: Topic = {
    id: 'python-basics-formatting-output',
    name: 'Formatting Output',
    beginner: [
        {
            content: `<h4>Why Format Output?</h4>
Raw <code>print()</code> output is fine for debugging, but reports, receipts and tables need aligned columns, a fixed number of decimal places and separators. f-string format specifiers handle almost all of this.`
        },
        {
            content: `<h4>Aligning Columns</h4>
<code>&lt;</code> aligns left, <code>&gt;</code> aligns right and <code>^</code> centres, inside a given width. Align text to the left and numbers to the right.`,
            codeExamples: [
                `items = [("Notebook", 3, 45.0), ("Pen", 10, 12.5), ("Geometry Box", 1, 150.0)]

print(f"{'Item':<15}{'Qty':>5}{'Price':>10}")
print("-" * 30)
for name, qty, price in items:
    print(f"{name:<15}{qty:>5}{price:>10.2f}")

# OUTPUT:
# Item             Qty     Price
# ------------------------------
# Notebook           3     45.00
# Pen               10     12.50
# Geometry Box       1    150.00`
            ]
        },
        {
            content: `<h4>Numbers: Decimals, Separators and Percentages</h4>`,
            codeExamples: [
                `revenue = 1234567.891
growth = 0.0725

print(f"Revenue: {revenue:,.2f}")
print(f"Growth: {growth:.1%}")
print(f"Rounded: {revenue:.0f}")
print(f"Roll no: {7:03d}")

# OUTPUT:
# Revenue: 1,234,567.89
# Growth: 7.2%
# Rounded: 1234568
# Roll no: 007`
            ]
        },
        {
            content: `<h4>A Complete Receipt</h4>`,
            codeExamples: [
                `cart = {"Python Book": 599.0, "USB Cable": 149.5, "Mouse": 450.0}
gst_rate = 0.18

width = 32
print("JavaSchoolLab Store".center(width))
print("=" * width)
subtotal = 0
for item, price in cart.items():
    print(f"{item:<22}{price:>10.2f}")
    subtotal += price
gst = subtotal * gst_rate
print("-" * width)
print(f"{'Subtotal':<22}{subtotal:>10.2f}")
print(f"{'GST (18%)':<22}{gst:>10.2f}")
print(f"{'TOTAL':<22}{subtotal + gst:>10.2f}")

# OUTPUT:
#       JavaSchoolLab Store
# ================================
# Python Book               599.00
# USB Cable                 149.50
# Mouse                     450.00
# --------------------------------
# Subtotal                 1198.50
# GST (18%)                 215.73
# TOTAL                    1414.23`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Dynamic Column Widths</h3>
Hard-coded widths break when the data changes. Compute the width from the data and pass it into the spec with a nested field.`,
            codeExamples: [
                `students = {"Pankaj": 91.5, "Sheru": 78.25, "Dheeraj Kumar": 88.0}

w = max(len(name) for name in students) + 2
for name, score in students.items():
    print(f"{name:<{w}}{score:>6.1f}")

# OUTPUT:
# Pankaj           91.5
# Sheru            78.2
# Dheeraj Kumar    88.0`
            ]
        },
        {
            content: `<h3>pprint for Nested Data</h3>
<code>print()</code> puts a large dict or list on one long line. <code>pprint</code> wraps and indents nested structures so they are readable.`,
            codeExamples: [
                `from pprint import pprint

config = {
    "database": {"host": "localhost", "port": 3306, "user": "admin"},
    "features": ["login", "quiz", "certificates", "leaderboard"],
    "debug": False,
}
pprint(config, width=50, sort_dicts=False)

# OUTPUT:
# {'database': {'host': 'localhost',
#               'port': 3306,
#               'user': 'admin'},
#  'features': ['login',
#               'quiz',
#               'certificates',
#               'leaderboard'],
#  'debug': False}`
            ]
        },
        {
            content: `<h3>Wrapping Long Text and Pretty JSON</h3>
<code>textwrap</code> wraps paragraphs to a width; <code>json.dumps(indent=...)</code> pretty-prints data for APIs and logs.`,
            codeExamples: [
                `import json
import textwrap

para = "Python is a high-level language that emphasises readability and lets you express ideas in fewer lines of code."
print(textwrap.fill(para, width=40))
print(textwrap.shorten(para, width=40, placeholder="..."))

print(json.dumps({"name": "Sheru", "skills": ["Python", "SQL"]}, indent=2))

# OUTPUT:
# Python is a high-level language that
# emphasises readability and lets you
# express ideas in fewer lines of code.
# Python is a high-level language that...
# {
#   "name": "Sheru",
#   "skills": [
#     "Python",
#     "SQL"
#   ]
# }`
            ]
        },
        {
            content: `<h3>Locale-Aware and Indian Number Formatting</h3>
The <code>,</code> spec always groups digits in thousands (1,234,567). Indian formatting groups lakhs and crores (12,34,567). Python has no built-in spec for that, so either use the <code>locale</code> module with an Indian locale installed, a library such as <b>Babel</b>, or a small helper.`,
            codeExamples: [
                `def indian_format(n):
    s = str(int(n))
    if len(s) <= 3:
        return s
    head, tail = s[:-3], s[-3:]
    groups = []
    while len(head) > 2:
        groups.insert(0, head[-2:])
        head = head[:-2]
    if head:
        groups.insert(0, head)
    return ",".join(groups) + "," + tail

print(f"{1234567:,}")
print(indian_format(1234567))
print(indian_format(150000000))

# OUTPUT:
# 1,234,567
# 12,34,567
# 15,00,00,000`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you right-align a number in 10 characters with 2 decimals?</td><td><code>f"{x:>10.2f}"</code></td></tr>
<tr class='text-center'><td>How do you use a variable width?</td><td>Nest it: <code>f"{text:&lt;{width}}"</code></td></tr>
<tr class='text-center'><td>How do you print nested dicts readably?</td><td><code>pprint.pprint()</code>, or <code>json.dumps(data, indent=2)</code> for JSON-compatible data</td></tr>
<tr class='text-center'><td>How do you wrap long text?</td><td><code>textwrap.fill(text, width)</code></td></tr>
<tr class='text-center'><td>Why does <code>f"{78.25:.1f}"</code> give 78.2?</td><td>Formatting rounds half to even on the exact binary value; 78.25 is exactly representable, so the tie goes to the even digit 2</td></tr>
</table>`
        }
    ]
};
