import type { Topic } from '../../types';

export const logicalAndBitwise: Topic = {
    id: 'python-basics-logical-bitwise-operators',
    name: 'Logical & Bitwise Operators',
    beginner: [
        {
            content: `<h4>Logical Operators</h4>
Python spells its logical operators as words: <code>and</code>, <code>or</code>, <code>not</code> (Java uses <code>&amp;&amp;</code>, <code>||</code>, <code>!</code>).
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operator</th><th>True when</th><th>Example</th></tr>
<tr class='text-center'><td><code>and</code></td><td>both sides are true</td><td><code>age &gt;= 18 and has_id</code></td></tr>
<tr class='text-center'><td><code>or</code></td><td>at least one side is true</td><td><code>is_admin or is_owner</code></td></tr>
<tr class='text-center'><td><code>not</code></td><td>the operand is false</td><td><code>not is_blocked</code></td></tr>
</table>`,
            codeExamples: [
                `age = 20
has_ticket = True
is_banned = False

if age >= 18 and has_ticket and not is_banned:
    print("Entry allowed")

is_weekend = False
is_holiday = True
print("Shop closed:", is_weekend or is_holiday)

# OUTPUT:
# Entry allowed
# Shop closed: True`
            ]
        },
        {
            content: `<h4>Short-Circuit Evaluation</h4>
<code>and</code> stops at the first false value and <code>or</code> stops at the first true value - the right side is not evaluated at all if it isn't needed. This lets you guard against errors.`,
            codeExamples: [
                `items = []

# len(items) is 0, so items[0] is never evaluated - no IndexError
if len(items) > 0 and items[0] == "pen":
    print("First item is a pen")
else:
    print("No pen at the front")

# OUTPUT:
# No pen at the front`
            ]
        },
        {
            content: `<h4>Bitwise Operators</h4>
Bitwise operators work on the individual binary bits of integers.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operator</th><th>Name</th><th><code>5</code> (0101) op <code>3</code> (0011)</th></tr>
<tr class='text-center'><td><code>&amp;</code></td><td>AND</td><td><code>5 &amp; 3 = 1</code> (0001)</td></tr>
<tr class='text-center'><td><code>|</code></td><td>OR</td><td><code>5 | 3 = 7</code> (0111)</td></tr>
<tr class='text-center'><td><code>^</code></td><td>XOR</td><td><code>5 ^ 3 = 6</code> (0110)</td></tr>
<tr class='text-center'><td><code>~</code></td><td>NOT</td><td><code>~5 = -6</code></td></tr>
<tr class='text-center'><td><code>&lt;&lt;</code></td><td>Left shift</td><td><code>5 &lt;&lt; 1 = 10</code></td></tr>
<tr class='text-center'><td><code>&gt;&gt;</code></td><td>Right shift</td><td><code>5 &gt;&gt; 1 = 2</code></td></tr>
</table>`,
            codeExamples: [
                `a, b = 5, 3
print(a & b, a | b, a ^ b)
print(~a)
print(a << 1, a >> 1)
print(bin(a), bin(b), bin(a ^ b))

# OUTPUT:
# 1 7 6
# -6
# 10 2
# 0b101 0b11 0b110`
            ]
        }
    ],

    expert: [
        {
            content: `<h3><code>and</code> / <code>or</code> Return Operands, Not Booleans</h3>
In Python, <code>x or y</code> returns <b>x itself</b> if x is truthy, otherwise <b>y itself</b>. <code>x and y</code> returns x if x is falsy, otherwise y. Only <code>not</code> always returns a real bool. This powers a common "default value" idiom - with one catch.`,
            codeExamples: [
                `print(0 or "default")
print("Sheru" or "default")
print([] and "never reached")
print(3 and 4)
print(not "text")

def greet(name=None):
    name = name or "Guest"        # careful: "" and 0 also become "Guest"
    print("Hello", name)

greet()
greet("Pankaj")

# OUTPUT:
# default
# Sheru
# []
# 4
# False
# Hello Guest
# Hello Pankaj`
            ]
        },
        {
            content: `<h3>Why <code>~5</code> Is <code>-6</code></h3>
Python integers behave as if they had infinitely many sign bits (two's complement of unlimited width), so <code>~x</code> is always <code>-x - 1</code>. Right shift of a negative number keeps the sign (arithmetic shift), and there is no <code>&gt;&gt;&gt;</code> operator as in Java. Mask with <code>&amp; 0xFFFFFFFF</code> to emulate fixed 32-bit behaviour.`,
            codeExamples: [
                `print(~5, ~-1)
print(-8 >> 1)
print(-1 & 0xFFFFFFFF)          # -1 as an unsigned 32-bit value
print((5).bit_length(), (255).bit_count())   # bit_count: Python 3.10+

# OUTPUT:
# -6 0
# -4
# 4294967295
# 3 8`
            ]
        },
        {
            content: `<h3>Practical Bit Tricks</h3>
Bitwise operations show up in permissions, flags, and DSA interview problems.`,
            codeExamples: [
                `READ, WRITE, EXECUTE = 4, 2, 1

perms = READ | WRITE                # combine flags
print(bool(perms & WRITE))          # has WRITE?
perms &= ~WRITE                     # remove WRITE
print(bool(perms & WRITE))

n = 12
print(n & 1 == 0)                   # even? (& binds tighter than ==)
print(n & (n - 1) == 0)             # power of two? (12 is not)

# Find the number that appears once - all others appear twice
nums = [4, 1, 2, 1, 2]
single = 0
for x in nums:
    single ^= x
print(single)

# OUTPUT:
# True
# False
# True
# False
# 4`
            ]
        },
        {
            content: `<h3>Don't Confuse <code>&amp;</code> with <code>and</code></h3>
<code>&amp;</code> and <code>|</code> do <b>not</b> short-circuit, and they bind more tightly than comparisons. On sets they mean intersection and union, and in Pandas/NumPy they combine boolean masks - which is why you must write <code>(df.a &gt; 1) &amp; (df.b &lt; 5)</code> with parentheses there.`,
            codeExamples: [
                `print({1, 2, 3} & {2, 3, 4})       # set intersection
print({1, 2} | {3})                 # set union

x = 5
print(x < 10 & x > 1)               # parsed as x < (10 & x) > 1  ->  5 < 0 > 1
print(x < 10 and x > 1)

# OUTPUT:
# {2, 3}
# {1, 2, 3}
# False
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>0 or "x"</code> return?</td><td><code>"x"</code> - or returns the first truthy operand (or the last one)</td></tr>
<tr class='text-center'><td>What is short-circuit evaluation?</td><td>The right operand of and/or is evaluated only if needed to decide the result</td></tr>
<tr class='text-center'><td><code>and</code> vs <code>&amp;</code>?</td><td>and is logical and short-circuits; &amp; is bitwise / set intersection, always evaluates both sides and has higher precedence</td></tr>
<tr class='text-center'><td>Why is <code>~x == -x - 1</code>?</td><td>Python ints behave like infinite-width two's complement numbers</td></tr>
<tr class='text-center'><td>How do you check if n is a power of two?</td><td><code>n &gt; 0 and n &amp; (n - 1) == 0</code></td></tr>
<tr class='text-center'><td>Does Python have <code>&gt;&gt;&gt;</code>?</td><td>No - ints are unbounded; mask with <code>&amp; 0xFFFFFFFF</code> for unsigned 32-bit results</td></tr>
</table>`
        }
    ]
};
