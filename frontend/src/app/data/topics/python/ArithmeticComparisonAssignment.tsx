import type { Topic } from '../../types';

export const arithmeticComparisonAssignment: Topic = {
    id: 'python-basics-arithmetic-comparison-assignment-operators',
    name: 'Arithmetic, Comparison & Assignment Operators',
    beginner: [
        {
            content: `<h4>Arithmetic Operators</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operator</th><th>Meaning</th><th>Example</th><th>Result</th></tr>
<tr class='text-center'><td><code>+</code></td><td>Addition</td><td><code>7 + 2</code></td><td><code>9</code></td></tr>
<tr class='text-center'><td><code>-</code></td><td>Subtraction</td><td><code>7 - 2</code></td><td><code>5</code></td></tr>
<tr class='text-center'><td><code>*</code></td><td>Multiplication</td><td><code>7 * 2</code></td><td><code>14</code></td></tr>
<tr class='text-center'><td><code>/</code></td><td>True division (always float)</td><td><code>7 / 2</code></td><td><code>3.5</code></td></tr>
<tr class='text-center'><td><code>//</code></td><td>Floor division</td><td><code>7 // 2</code></td><td><code>3</code></td></tr>
<tr class='text-center'><td><code>%</code></td><td>Modulus (remainder)</td><td><code>7 % 2</code></td><td><code>1</code></td></tr>
<tr class='text-center'><td><code>**</code></td><td>Exponent (power)</td><td><code>7 ** 2</code></td><td><code>49</code></td></tr>
</table>`,
            codeExamples: [
                `total_seconds = 3725

hours = total_seconds // 3600
minutes = (total_seconds % 3600) // 60
seconds = total_seconds % 60
print(hours, "h", minutes, "m", seconds, "s")

print(10 / 5)       # true division -> float
print(2 ** 10)

# OUTPUT:
# 1 h 2 m 5 s
# 2.0
# 1024`
            ]
        },
        {
            content: `<h4>Operators on Strings and Lists</h4>
<code>+</code> joins sequences and <code>*</code> repeats them.`,
            codeExamples: [
                `print("Py" + "thon")
print("ha" * 3)
print([0] * 4)
print([1, 2] + [3])

# OUTPUT:
# Python
# hahaha
# [0, 0, 0, 0]
# [1, 2, 3]`
            ]
        },
        {
            content: `<h4>Comparison Operators</h4>
Comparisons return <code>True</code> or <code>False</code>: <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>.`,
            codeExamples: [
                `marks = 72

print(marks == 72)
print(marks != 100)
print(marks >= 40)
print("apple" < "banana")     # dictionary order
print(1 == 1.0)               # numbers compare by value across types

# OUTPUT:
# True
# True
# True
# True
# True`
            ]
        },
        {
            content: `<h4>Assignment Operators</h4>
Augmented assignment combines an operation with assignment: <code>x += 5</code> means <code>x = x + 5</code>. Every arithmetic operator has one: <code>+=</code>, <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>//=</code>, <code>%=</code>, <code>**=</code>.<br><br>
Python has <b>no</b> <code>++</code> or <code>--</code> operators.`,
            codeExamples: [
                `balance = 1000
balance += 500      # deposit
balance -= 200      # withdraw
balance *= 2
print(balance)

count = 0
count += 1          # instead of count++
print(count)

# OUTPUT:
# 2600
# 1`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Floor Division and Modulo with Negative Numbers</h3>
Python's <code>//</code> rounds toward <b>negative infinity</b>, and <code>%</code> always takes the sign of the <b>divisor</b>. Java's <code>/</code> and <code>%</code> truncate toward zero instead, so results differ for negative numbers. The rule <code>(a // b) * b + a % b == a</code> always holds.`,
            codeExamples: [
                `print(7 // 2, -7 // 2)
print(7 % 3, -7 % 3, 7 % -3)
print(divmod(-7, 2))

# Python's behaviour is handy for wrap-around indexing:
day = (0 - 1) % 7      # one day before Monday (0) -> Sunday (6)
print(day)

# In Java: -7 / 2 == -3 and -7 % 3 == -1
# OUTPUT:
# 3 -4
# 1 2 -2
# (-4, 1)
# 6`
            ]
        },
        {
            content: `<h3>Chained Comparisons</h3>
Python lets you chain comparisons the way you write them in maths. <code>a &lt; b &lt; c</code> means <code>a &lt; b and b &lt; c</code>, with <code>b</code> evaluated only once.`,
            codeExamples: [
                `age = 25
print(18 <= age < 60)

x = 5
print(1 < x > 3)          # legal: (1 < x) and (x > 3)
print(1 == 1 in [1])      # (1 == 1) and (1 in [1])

# OUTPUT:
# True
# True
# True`
            ]
        },
        {
            content: `<h3>The Walrus Operator <code>:=</code></h3>
Introduced in Python 3.8, an <b>assignment expression</b> assigns a value <i>and</i> returns it, so you can use it inside a condition.`,
            codeExamples: [
                `data = [4, 8, 15, 16, 23, 42]

if (n := len(data)) > 5:
    print(f"List is long ({n} items)")

# Reading until an empty line - without the walrus you'd repeat input()
# while (line := input("> ")) != "":
#     print("You typed", line)

# OUTPUT:
# List is long (6 items)`
            ]
        },
        {
            content: `<h3>Operators Are Method Calls</h3>
Every operator maps to a "dunder" method: <code>a + b</code> calls <code>a.__add__(b)</code>, <code>a == b</code> calls <code>a.__eq__(b)</code>, <code>a += b</code> tries <code>a.__iadd__(b)</code> first. That is how <code>+</code> can add numbers, join strings and merge lists - and how your own classes can support operators.`,
            codeExamples: [
                `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __add__(self, other):
        return Money(self.amount + other.amount)

    def __eq__(self, other):
        return self.amount == other.amount

total = Money(100) + Money(250)
print(total.amount)
print(Money(5) == Money(5))
print((3).__add__(4))

# OUTPUT:
# 350
# True
# 7`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td><code>/</code> vs <code>//</code>?</td><td><code>/</code> is true division and always returns a float; <code>//</code> floors the result toward negative infinity</td></tr>
<tr class='text-center'><td>What is <code>-7 // 2</code>?</td><td><code>-4</code> (floored), whereas Java gives -3 (truncated)</td></tr>
<tr class='text-center'><td>What is <code>-7 % 3</code>?</td><td><code>2</code> - the result takes the sign of the divisor</td></tr>
<tr class='text-center'><td>Does Python have <code>++</code>?</td><td>No - use <code>x += 1</code>. <code>++x</code> parses as two unary plus signs and does nothing</td></tr>
<tr class='text-center'><td>What does <code>1 &lt; x &lt; 10</code> mean?</td><td><code>1 &lt; x and x &lt; 10</code>, evaluating x only once</td></tr>
<tr class='text-center'><td>What is the walrus operator?</td><td><code>:=</code>, an assignment expression that assigns and returns a value inside an expression (3.8+)</td></tr>
</table>`
        }
    ]
};
