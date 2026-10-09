import type { Topic } from '../../types';

export const ifElifElse: Topic = {
    id: 'python-control-flow-if-elif-else',
    name: 'if, elif & else',
    beginner: [
        {
            content: `<h4>The if Statement</h4>
<code>if</code> runs its block only when the condition is true. Write the condition, then a colon, then the indented block. Parentheses around the condition are not needed.`,
            codeExamples: [
                `temperature = 38

if temperature > 35:
    print("It's a hot day")
    print("Drink plenty of water")

print("Weather check done")

# OUTPUT:
# It's a hot day
# Drink plenty of water
# Weather check done`
            ]
        },
        {
            content: `<h4>if ... else</h4>
<code>else</code> provides the block that runs when the condition is false. Exactly one of the two blocks always runs.`,
            codeExamples: [
                `number = 7

if number % 2 == 0:
    print(number, "is even")
else:
    print(number, "is odd")

# OUTPUT:
# 7 is odd`
            ]
        },
        {
            content: `<h4>if ... elif ... else</h4>
<code>elif</code> ("else if") checks another condition when the previous ones were false. Python tests the conditions <b>top to bottom</b> and runs <b>only the first</b> block whose condition is true; the rest are skipped.`,
            codeExamples: [
                `marks = 76

if marks >= 90:
    grade = "A+"
elif marks >= 75:
    grade = "A"
elif marks >= 60:
    grade = "B"
elif marks >= 40:
    grade = "C"
else:
    grade = "F"

print("Grade:", grade)

# OUTPUT:
# Grade: A`
            ]
        },
        {
            content: `<h4>Combining Conditions</h4>
Use <code>and</code>, <code>or</code> and <code>not</code> to build larger conditions, and chained comparisons for ranges.`,
            codeExamples: [
                `age = 22
has_licence = True

if age >= 18 and has_licence:
    print("You can drive")

hour = 14
if 9 <= hour < 17:
    print("Office is open")

day = "Sunday"
if day == "Saturday" or day == "Sunday":
    print("Weekend!")

# OUTPUT:
# You can drive
# Office is open
# Weekend!`
            ]
        },
        {
            content: `<h4>Truthiness in Conditions</h4>
Any value can be a condition. Empty strings, empty collections, <code>0</code> and <code>None</code> count as false; everything else is true.`,
            codeExamples: [
                `name = input("Your name: ").strip()

if name:
    print("Hello,", name)
else:
    print("You didn't enter a name")

# OUTPUT:
# Your name:
# You didn't enter a name`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Order Matters in elif Chains</h3>
Because only the first true branch runs, put the <b>most specific</b> conditions first. A broad condition placed early "swallows" the cases after it.`,
            codeExamples: [
                `marks = 95

# Wrong order - the A+ branch can never run
if marks >= 40:
    print("Pass")
elif marks >= 90:
    print("A+")

# Right order
if marks >= 90:
    print("A+")
elif marks >= 40:
    print("Pass")

# OUTPUT:
# Pass
# A+`
            ]
        },
        {
            content: `<h3>The Conditional Expression (Ternary)</h3>
<code>value_if_true if condition else value_if_false</code> is an <b>expression</b>, so it can be used inside assignments, function arguments and f-strings. Keep it for simple choices - nested ternaries quickly become unreadable.`,
            codeExamples: [
                `stock = 0
label = "In stock" if stock > 0 else "Out of stock"
print(label)

n = -5
print(f"{n} is {'positive' if n > 0 else 'zero' if n == 0 else 'negative'}")

# OUTPUT:
# Out of stock
# -5 is negative`
            ]
        },
        {
            content: `<h3>Replacing Long if/elif Chains with a Dictionary</h3>
When each branch just maps a key to a value or an action, a dictionary lookup is shorter, faster and easier to extend. For ranges of numbers, the <code>bisect</code> module can replace a ladder of comparisons.`,
            codeExamples: [
                `import bisect

day_type = {"Saturday": "weekend", "Sunday": "weekend"}
print(day_type.get("Monday", "weekday"))

def grade(marks):
    cutoffs = [40, 60, 75, 90]
    grades = ["F", "C", "B", "A", "A+"]
    return grades[bisect.bisect_right(cutoffs, marks)]

print([grade(m) for m in (35, 40, 74, 75, 90, 100)])

# OUTPUT:
# weekday
# ['F', 'C', 'B', 'A', 'A+', 'A+']`
            ]
        },
        {
            content: `<h3>Common Mistakes</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Mistake</th><th>Problem</th><th>Fix</th></tr>
<tr class='text-center'><td><code>if x = 5:</code></td><td>SyntaxError - <code>=</code> is assignment</td><td><code>if x == 5:</code></td></tr>
<tr class='text-center'><td><code>if day == "Sat" or "Sun":</code></td><td>Always true - <code>"Sun"</code> alone is a truthy string</td><td><code>if day in ("Sat", "Sun"):</code></td></tr>
<tr class='text-center'><td><code>if x == True:</code></td><td>Redundant and not PEP 8</td><td><code>if x:</code></td></tr>
<tr class='text-center'><td><code>if len(items) &gt; 0:</code></td><td>Works, but not idiomatic</td><td><code>if items:</code></td></tr>
<tr class='text-center'><td><code>if x == None:</code></td><td>Can be fooled by <code>__eq__</code></td><td><code>if x is None:</code></td></tr>
<tr class='text-center'><td>Missing colon or inconsistent indentation</td><td>SyntaxError / IndentationError</td><td>Colon after the condition; 4 spaces</td></tr>
</table>`,
            codeExamples: [
                `day = "Monday"

if day == "Saturday" or "Sunday":      # bug
    print("Weekend (wrong!)")

if day in ("Saturday", "Sunday"):       # correct
    print("Weekend")
else:
    print("Weekday")

# OUTPUT:
# Weekend (wrong!)
# Weekday`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many elif branches can run?</td><td>At most one - the first whose condition is true</td></tr>
<tr class='text-center'><td>What is Python's ternary operator?</td><td><code>a if condition else b</code></td></tr>
<tr class='text-center'><td>Why is <code>if x == "a" or "b":</code> always true?</td><td>It parses as <code>(x == "a") or "b"</code>, and the non-empty string "b" is truthy</td></tr>
<tr class='text-center'><td>Is <code>else</code> required?</td><td>No - if and elif blocks can stand without it</td></tr>
<tr class='text-center'><td>How can you replace a long if/elif chain?</td><td>With a dictionary lookup, match/case, or bisect for numeric ranges</td></tr>
</table>`
        }
    ]
};
