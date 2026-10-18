import type { Topic } from '../../types';

export const pythonControlFlow: Topic = {
    id: 'python-control-flow',
    name: 'Control Flow',
    beginner: [
        {
            content: `<h4>What is Control Flow?</h4>
By default Python runs statements <b>top to bottom, one after another</b>. <b>Control flow</b> statements change that order. Every program is built from three basic structures:<br><br>
• <b>Sequence</b> - statements run in order.<br>
• <b>Selection</b> - choose which block runs: <code>if</code>, <code>elif</code>, <code>else</code>, <code>match</code>.<br>
• <b>Iteration</b> - repeat a block: <code>for</code>, <code>while</code>.<br><br>
<code>break</code>, <code>continue</code> and <code>pass</code> fine-tune how loops and blocks behave.`
        },
        {
            content: `<h4>Control Flow Statements at a Glance</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Statement</th><th>Purpose</th><th>Java equivalent</th></tr>
<tr class='text-center'><td><code>if / elif / else</code></td><td>Run a block only when a condition is true</td><td><code>if / else if / else</code></td></tr>
<tr class='text-center'><td><code>match / case</code></td><td>Choose a branch by matching a value's shape (3.10+)</td><td><code>switch</code></td></tr>
<tr class='text-center'><td><code>for</code></td><td>Repeat once per item of a sequence or iterable</td><td>enhanced for (<code>for (T x : items)</code>)</td></tr>
<tr class='text-center'><td><code>while</code></td><td>Repeat while a condition stays true</td><td><code>while</code></td></tr>
<tr class='text-center'><td><code>break</code></td><td>Leave the loop immediately</td><td><code>break</code></td></tr>
<tr class='text-center'><td><code>continue</code></td><td>Skip to the next iteration</td><td><code>continue</code></td></tr>
<tr class='text-center'><td><code>pass</code></td><td>Do nothing (placeholder)</td><td>empty block <code>{}</code></td></tr>
</table>`
        },
        {
            content: `<h4>Selection and Iteration Together</h4>
Python uses a colon <code>:</code> plus indentation for every block - there are no braces and no parentheses are needed around conditions.`,
            codeExamples: [
                `age = 20

if age < 13:
    category = "child"
elif age < 20:
    category = "teenager"
else:
    category = "adult"

print(category)

# Looping over a list directly - no index counter needed
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# OUTPUT:
# adult
# apple
# banana
# cherry`
            ]
        },
        {
            content: `<h4>A Small Complete Program</h4>
Sequence, selection and iteration combined: count how many students passed.`,
            codeExamples: [
                `marks = [72, 35, 88, 40, 19]
passed = 0

for m in marks:
    if m >= 40:
        passed += 1
        print(m, "-> pass")
    else:
        print(m, "-> fail")

print(f"{passed} of {len(marks)} students passed")

# OUTPUT:
# 72 -> pass
# 35 -> fail
# 88 -> pass
# 40 -> pass
# 19 -> fail
# 3 of 5 students passed`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Features Java Doesn't Have</h3>
• <b>Loop <code>else</code></b> - a <code>for</code> or <code>while</code> can have an <code>else</code> block that runs only if the loop finished <i>without</i> <code>break</code>.<br>
• <b>Conditional expression</b> - <code>x if condition else y</code>, Python's version of the ternary operator.<br>
• <b>Comprehensions</b> - build a list from a loop and a condition in one expression.<br>
• <b>Structural pattern matching</b> - <code>match</code> can destructure lists, dicts and objects, far beyond a classic switch.`,
            codeExamples: [
                `numbers = [3, 7, 11, 15]

for n in numbers:
    if n % 2 == 0:
        print("Found an even number:", n)
        break
else:
    print("No even numbers")

status = "adult" if 20 >= 18 else "minor"
evens_squared = [n * n for n in range(10) if n % 2 == 0]
print(status, evens_squared)

# OUTPUT:
# No even numbers
# adult [0, 4, 16, 36, 64]`
            ]
        },
        {
            content: `<h3>Exceptions Are Control Flow Too</h3>
<code>try</code> / <code>except</code> also redirects execution. Idiomatic Python often prefers trying an operation and handling failure (EAFP) over checking every condition in advance with <code>if</code>.`,
            codeExamples: [
                `stock = {"pen": 10}

# Look before you leap
if "pencil" in stock:
    qty = stock["pencil"]
else:
    qty = 0

# Easier to ask forgiveness than permission
try:
    qty = stock["pencil"]
except KeyError:
    qty = 0

print(qty, stock.get("pencil", 0))     # dict.get avoids both

# OUTPUT:
# 0 0`
            ]
        },
        {
            content: `<h3>Prefer Flat Over Nested</h3>
"Flat is better than nested" (the Zen of Python). Deeply indented control flow is hard to read. Guard clauses, <code>continue</code>, helper functions and lookup tables keep code flat - later topics in this module show each technique.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the three basic control structures?</td><td>Sequence, selection (if/match) and iteration (for/while)</td></tr>
<tr class='text-center'><td>Does Python have a switch statement?</td><td>Since 3.10 it has <code>match</code>/<code>case</code>; before that, if/elif chains or dictionary dispatch were used</td></tr>
<tr class='text-center'><td>Does Python have a do-while loop?</td><td>No - use <code>while True:</code> with a <code>break</code> at the end</td></tr>
<tr class='text-center'><td>When does a loop's else block run?</td><td>When the loop ends normally, i.e. without hitting break</td></tr>
<tr class='text-center'><td>How are blocks defined?</td><td>By a colon and consistent indentation, not braces</td></tr>
</table>`
        }
    ]
};
