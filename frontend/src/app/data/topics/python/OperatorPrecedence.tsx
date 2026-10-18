import type { Topic } from '../../types';

export const operatorPrecedence: Topic = {
    id: 'python-basics-operator-precedence',
    name: 'Operator Precedence',
    beginner: [
        {
            content: `<h4>What is Precedence?</h4>
When an expression has several operators, <b>precedence</b> decides which is applied first - just like BODMAS in maths: multiplication before addition. Operators with the same precedence are evaluated left to right (except <code>**</code>, which goes right to left).`,
            codeExamples: [
                `print(2 + 3 * 4)       # * before +
print((2 + 3) * 4)     # parentheses first
print(10 - 4 - 3)      # left to right: (10 - 4) - 3
print(100 / 10 * 2)    # left to right: (100 / 10) * 2

# OUTPUT:
# 14
# 20
# 3
# 20.0`
            ]
        },
        {
            content: `<h4>Precedence Table (Highest to Lowest)</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>Operators</th><th>Description</th></tr>
<tr class='text-center'><td>1</td><td><code>( )</code></td><td>Parentheses / grouping</td></tr>
<tr class='text-center'><td>2</td><td><code>x[i]</code>, <code>f(x)</code>, <code>x.attr</code></td><td>Subscription, call, attribute</td></tr>
<tr class='text-center'><td>3</td><td><code>await</code></td><td>Await expression</td></tr>
<tr class='text-center'><td>4</td><td><code>**</code></td><td>Exponent (right to left)</td></tr>
<tr class='text-center'><td>5</td><td><code>+x</code>, <code>-x</code>, <code>~x</code></td><td>Unary plus, minus, bitwise NOT</td></tr>
<tr class='text-center'><td>6</td><td><code>*</code>, <code>/</code>, <code>//</code>, <code>%</code>, <code>@</code></td><td>Multiplicative</td></tr>
<tr class='text-center'><td>7</td><td><code>+</code>, <code>-</code></td><td>Additive</td></tr>
<tr class='text-center'><td>8</td><td><code>&lt;&lt;</code>, <code>&gt;&gt;</code></td><td>Shifts</td></tr>
<tr class='text-center'><td>9</td><td><code>&amp;</code></td><td>Bitwise AND</td></tr>
<tr class='text-center'><td>10</td><td><code>^</code></td><td>Bitwise XOR</td></tr>
<tr class='text-center'><td>11</td><td><code>|</code></td><td>Bitwise OR</td></tr>
<tr class='text-center'><td>12</td><td><code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>, <code>in</code>, <code>not in</code>, <code>is</code>, <code>is not</code></td><td>Comparisons (all equal, chainable)</td></tr>
<tr class='text-center'><td>13</td><td><code>not</code></td><td>Logical NOT</td></tr>
<tr class='text-center'><td>14</td><td><code>and</code></td><td>Logical AND</td></tr>
<tr class='text-center'><td>15</td><td><code>or</code></td><td>Logical OR</td></tr>
<tr class='text-center'><td>16</td><td><code>x if c else y</code></td><td>Conditional expression</td></tr>
<tr class='text-center'><td>17</td><td><code>lambda</code></td><td>Lambda</td></tr>
<tr class='text-center'><td>18</td><td><code>:=</code></td><td>Assignment expression (walrus)</td></tr>
</table>`
        },
        {
            content: `<h4>Logical Operators: not, then and, then or</h4>`,
            codeExamples: [
                `print(True or False and False)      # and first: True or (False and False)
print((True or False) and False)

age = 15
has_permission = True
print(age >= 18 or has_permission and age > 12)

# OUTPUT:
# True
# False
# True`
            ]
        },
        {
            content: `<h4>When in Doubt, Use Parentheses</h4>
You don't need to memorise the whole table. Parentheses make the order explicit and the code easier to read, even when they aren't strictly required.`,
            codeExamples: [
                `price, qty, discount = 250, 4, 100

total = price * qty - discount          # correct, but makes the reader think
total = (price * qty) - discount        # same result, clearer intent
print(total)

# OUTPUT:
# 900`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Exponentiation Is Right-Associative and Beats Unary Minus</h3>
<code>**</code> groups from the right, and it binds more tightly than a unary minus on its <b>left</b> - but less tightly than a unary operator on its <b>right</b>.`,
            codeExamples: [
                `print(2 ** 3 ** 2)       # 2 ** (3 ** 2) = 2 ** 9
print((2 ** 3) ** 2)
print(-2 ** 2)           # -(2 ** 2)
print((-2) ** 2)
print(2 ** -1)           # unary minus on the right applies first

# OUTPUT:
# 512
# 64
# -4
# 4
# 0.5`
            ]
        },
        {
            content: `<h3><code>not</code> Is Lower Than Comparisons</h3>
<code>not a == b</code> means <code>not (a == b)</code>. That is usually what you want, but it surprises people coming from languages where <code>!</code> binds tightly.`,
            codeExamples: [
                `print(not 1 == 2)            # not (1 == 2)
print(not 1 in [2, 3])       # same as 1 not in [2, 3]

# In Java, !1 == 2 would not even compile.
# OUTPUT:
# True
# True`
            ]
        },
        {
            content: `<h3>Bitwise vs Comparison Trap</h3>
In Python, bitwise operators bind <b>more tightly</b> than comparisons - the opposite of C and Java. So a flag test like <code>flags &amp; 4 == 4</code> works as intended, but code written as if <code>&amp;</code> were <code>and</code> silently computes something else.`,
            codeExamples: [
                `flags = 6
print(flags & 4 == 4)          # (flags & 4) == 4 - fine in Python

x = 5
print(x < 10 & x > 1)          # x < (10 & x) > 1  ->  5 < 0 > 1
print(x < 10 and x > 1)        # what was meant

# OUTPUT:
# True
# False
# True`
            ]
        },
        {
            content: `<h3>Precedence vs Evaluation Order</h3>
Precedence decides how an expression is <b>grouped</b>; it does not change the <b>order</b> in which operands are evaluated. Python evaluates operands left to right - even in <code>a + b * c</code>, the value of <code>a</code> is computed before <code>b * c</code>. This matters when operands have side effects such as function calls.`,
            codeExamples: [
                `def val(name, n):
    print("evaluating", name)
    return n

result = val("a", 1) + val("b", 2) * val("c", 3)
print(result)

# OUTPUT:
# evaluating a
# evaluating b
# evaluating c
# 7`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is <code>2 ** 3 ** 2</code>?</td><td>512 - exponentiation is right-associative</td></tr>
<tr class='text-center'><td>What is <code>-3 ** 2</code>?</td><td>-9, because <code>**</code> binds tighter than the unary minus on its left</td></tr>
<tr class='text-center'><td>Order of logical operators?</td><td><code>not</code>, then <code>and</code>, then <code>or</code></td></tr>
<tr class='text-center'><td>What is <code>True or False and False</code>?</td><td>True - <code>and</code> is applied first</td></tr>
<tr class='text-center'><td>Does precedence decide evaluation order?</td><td>No - it decides grouping; operands are still evaluated left to right</td></tr>
<tr class='text-center'><td>Which has higher precedence, <code>&amp;</code> or <code>==</code>?</td><td><code>&amp;</code> - so <code>x &amp; 4 == 4</code> means <code>(x &amp; 4) == 4</code> (in C and Java it is the reverse)</td></tr>
</table>`
        }
    ]
};
