import type { Topic } from '../../types';

export const fStringsAndFormatting: Topic = {
    id: 'python-basics-f-strings-string-formatting',
    name: 'f-strings & String Formatting',
    beginner: [
        {
            content: `<h4>f-strings</h4>
An <b>f-string</b> (formatted string literal, Python 3.6+) starts with <code>f</code> before the quote. Anything inside <code>{ }</code> is evaluated as Python code and inserted into the text. It is the modern, preferred way to build strings.`,
            codeExamples: [
                `name = "Sheru"
marks = 87
total = 100

print(f"{name} scored {marks} out of {total}")
print(f"Percentage: {marks / total * 100}%")
print(f"Uppercase: {name.upper()}")

# OUTPUT:
# Sheru scored 87 out of 100
# Percentage: 87.0%
# Uppercase: SHERU`
            ]
        },
        {
            content: `<h4>Format Specifiers</h4>
After a colon inside the braces you can control how a value is displayed: <code>{value:spec}</code>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Spec</th><th>Example</th><th>Result</th></tr>
<tr class='text-center'><td><code>.2f</code></td><td><code>f"{3.14159:.2f}"</code></td><td><code>3.14</code></td></tr>
<tr class='text-center'><td><code>,</code></td><td><code>f"{1234567:,}"</code></td><td><code>1,234,567</code></td></tr>
<tr class='text-center'><td><code>.1%</code></td><td><code>f"{0.256:.1%}"</code></td><td><code>25.6%</code></td></tr>
<tr class='text-center'><td><code>05d</code></td><td><code>f"{42:05d}"</code></td><td><code>00042</code></td></tr>
<tr class='text-center'><td><code>&gt;8</code></td><td><code>f"{'hi':&gt;8}"</code></td><td><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hi</code></td></tr>
<tr class='text-center'><td><code>b</code>, <code>x</code></td><td><code>f"{10:b}"</code>, <code>f"{255:x}"</code></td><td><code>1010</code>, <code>ff</code></td></tr>
</table>`,
            codeExamples: [
                `price = 1499.5
gst = 0.18

print(f"Price: {price:.2f}")
print(f"GST: {gst:.0%}")
print(f"Total: {price * (1 + gst):,.2f}")
print(f"Invoice #{7:04d}")

# OUTPUT:
# Price: 1499.50
# GST: 18%
# Total: 1,769.41
# Invoice #0007`
            ]
        },
        {
            content: `<h4>Older Styles: format() and %</h4>
You will meet two older styles in existing code. Both still work, but prefer f-strings in new code.`,
            codeExamples: [
                `name, age = "Pankaj", 28

print("{} is {} years old".format(name, age))
print("{0} likes {1}; {0} codes daily".format(name, "Python"))
print("{n} is {a}".format(n=name, a=age))

print("%s is %d years old" % (name, age))     # printf style, like C/Java
print("Pi is about %.2f" % 3.14159)

# OUTPUT:
# Pankaj is 28 years old
# Pankaj likes Python; Pankaj codes daily
# Pankaj is 28
# Pankaj is 28 years old
# Pi is about 3.14`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Full Format Spec Mini-Language</h3>
The general form is <code>{value:[[fill]align][sign][#][0][width][,][.precision][type]}</code>.`,
            codeExamples: [
                `n = 255
print(f"[{n:>10}]")       # right-align in width 10
print(f"[{n:<10}]")       # left-align
print(f"[{n:^10}]")       # centre
print(f"[{n:*^10}]")      # centre, fill with *
print(f"[{n:+}] [{-n:+}]")   # always show the sign
print(f"{n:#x} {n:#o} {n:#b}")   # with base prefixes
print(f"{1234567.891:,.2f}")
print(f"{1234567.891:_.1f}")
print(f"{0.000123:.2e}")

# OUTPUT:
# [       255]
# [255       ]
# [   255    ]
# [***255****]
# [+255] [-255]
# 0xff 0o377 0b11111111
# 1,234,567.89
# 1_234_567.9
# 1.23e-04`
            ]
        },
        {
            content: `<h3>Self-Documenting Expressions and Conversions</h3>
<code>{expr=}</code> (Python 3.8+) prints the expression text and its value - perfect for quick debugging. <code>!r</code>, <code>!s</code> and <code>!a</code> apply <code>repr()</code>, <code>str()</code> or <code>ascii()</code> before formatting.`,
            codeExamples: [
                `user = "sheru"
balance = 2500.756

print(f"{user=}")
print(f"{balance=:.2f}")
print(f"{len(user) * 2 = }")
print(f"Name: {user!r}")

# OUTPUT:
# user='sheru'
# balance=2500.76
# len(user) * 2 = 10
# Name: 'sheru'`
            ]
        },
        {
            content: `<h3>Nested Fields, Dates and Literal Braces</h3>
The spec itself can contain <code>{ }</code> fields for dynamic widths. Objects such as <code>datetime</code> define their own specs. To print a literal brace, double it: <code>{{</code> and <code>}}</code>.`,
            codeExamples: [
                `from datetime import datetime

width, prec = 10, 3
print(f"[{3.14159:{width}.{prec}f}]")

when = datetime(2026, 10, 4, 18, 30)
print(f"{when:%d %b %Y, %I:%M %p}")

key = "id"
print(f"{{ {key}: 7 }}")

# OUTPUT:
# [     3.142]
# 04 Oct 2026, 06:30 PM
# { id: 7 }`
            ]
        },
        {
            content: `<h3>When Not to Use f-strings</h3>
• <b>Logging</b>: pass arguments separately - <code>logger.info("User %s logged in", user)</code>. The message is only formatted if that log level is enabled, and log tools can group messages by template.<br>
• <b>SQL</b>: never build queries with f-strings - that is SQL injection. Use parameterised queries: <code>cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))</code>.<br>
• <b>Templates supplied at runtime</b> (e.g. from a config file): use <code>str.format()</code> or <code>string.Template</code>; f-strings are fixed in source code.`,
            codeExamples: [
                `from string import Template

template = "Dear $name, your order $order has shipped."   # e.g. loaded from a file
print(Template(template).substitute(name="Pankaj", order="#1042"))
print("Hi {name}".format_map({"name": "Sheru"}))

# OUTPUT:
# Dear Pankaj, your order #1042 has shipped.
# Hi Sheru`
            ]
        },
        {
            content: `<h3>The % Tuple Pitfall</h3>
With <code>%</code> formatting, a tuple on the right is always unpacked into the placeholders - so formatting a single tuple value needs wrapping. f-strings don't have this problem.`,
            codeExamples: [
                `point = (3, 4)
print("Point: %s" % (point,))      # wrapped in a 1-tuple
print(f"Point: {point}")
print("Point: %s" % point)

# OUTPUT:
# Point: (3, 4)
# Point: (3, 4)
# TypeError: not all arguments converted during string formatting`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which formatting style should you use?</td><td>f-strings for normal code - fastest and most readable; format() for runtime templates; % mainly for logging calls</td></tr>
<tr class='text-center'><td>How do you print a float with 2 decimals and thousands separators?</td><td><code>f"{x:,.2f}"</code></td></tr>
<tr class='text-center'><td>What does <code>f"{x=}"</code> do?</td><td>Prints the expression and its value, e.g. <code>x=42</code> (Python 3.8+)</td></tr>
<tr class='text-center'><td>How do you include a literal brace in an f-string?</td><td>Double it: <code>{{</code> or <code>}}</code></td></tr>
<tr class='text-center'><td>Why not build SQL with f-strings?</td><td>It allows SQL injection - use parameterised queries instead</td></tr>
<tr class='text-center'><td>When is an f-string evaluated?</td><td>At runtime, each time the line executes - it is an expression, not a constant</td></tr>
</table>`
        }
    ]
};
