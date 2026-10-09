import type { Topic } from '../../types';

export const numericTypes: Topic = {
    id: 'python-basics-numeric-types-int-float-complex',
    name: 'Numeric Types: int, float & complex',
    beginner: [
        {
            content: `<h4>Three Built-in Number Types</h4>
• <b>int</b> - whole numbers: <code>7</code>, <code>-300</code>, <code>0</code>.<br>
• <b>float</b> - numbers with a decimal point or exponent: <code>3.14</code>, <code>-0.5</code>, <code>2e3</code>.<br>
• <b>complex</b> - numbers with a real and an imaginary part, written with <code>j</code>: <code>3+4j</code>.<br><br>
Python has no separate <code>byte</code>, <code>short</code>, <code>long</code> or <code>double</code> like Java - just these three.`,
            codeExamples: [
                `students = 60
average = 72.5
signal = 3 + 4j

print(type(students), type(average), type(signal))

# OUTPUT:
# <class 'int'> <class 'float'> <class 'complex'>`
            ]
        },
        {
            content: `<h4>Integers Never Overflow</h4>
A Java <code>int</code> overflows past about 2.1 billion. A Python <code>int</code> has <b>arbitrary precision</b> - it grows as large as memory allows. Underscores can be used to make big literals readable.`,
            codeExamples: [
                `population = 1_428_000_000
print(population)
print(2 ** 100)

# OUTPUT:
# 1428000000
# 1267650600228229401496703205376`
            ]
        },
        {
            content: `<h4>Other Integer Bases</h4>
Integers can be written in binary, octal or hexadecimal, and converted back to strings in those bases.`,
            codeExamples: [
                `print(0b1010, 0o17, 0xFF)      # binary, octal, hex literals
print(bin(10), oct(15), hex(255))
print(int("ff", 16), int("1010", 2))

# OUTPUT:
# 10 15 255
# 0b1010 0o17 0xff
# 255 10`
            ]
        },
        {
            content: `<h4>Mixing Types</h4>
When you combine an int and a float the result is a float. Division with <code>/</code> <b>always</b> returns a float, even when it divides evenly.`,
            codeExamples: [
                `print(5 + 2.0)
print(10 / 2)
print(10 // 3)      # floor division keeps an int
print(type(7 / 7))

# OUTPUT:
# 7.0
# 5.0
# 3
# <class 'float'>`
            ]
        },
        {
            content: `<h4>Useful Built-in Functions</h4>`,
            codeExamples: [
                `print(abs(-7))            # absolute value
print(round(3.14159, 2))  # round to 2 decimal places
print(pow(2, 10))         # same as 2 ** 10
print(max(4, 9, 2), min(4, 9, 2))
print(divmod(17, 5))      # (quotient, remainder)

# OUTPUT:
# 7
# 3.14
# 1024
# 9 2
# (3, 2)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Floating-Point Is Approximate</h3>
<code>float</code> is a 64-bit IEEE 754 binary double - exactly Java's <code>double</code>. Many decimal fractions such as 0.1 cannot be represented exactly in binary, so tiny errors appear. Never compare floats with <code>==</code> after arithmetic; use <code>math.isclose()</code>.`,
            codeExamples: [
                `import math

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))

# OUTPUT:
# 0.30000000000000004
# False
# True`
            ]
        },
        {
            content: `<h3>Decimal for Money, Fraction for Exact Ratios</h3>
For currency, use <code>decimal.Decimal</code>, which does exact base-10 arithmetic. Create it from a <b>string</b> - <code>Decimal(0.1)</code> would copy the float's error. <code>fractions.Fraction</code> keeps exact rational numbers.`,
            codeExamples: [
                `from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

print(Decimal("0.1") + Decimal("0.2"))
print(Decimal(0.1))                       # created from a float - error copied

price = Decimal("19.995")
print(price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

print(Fraction(1, 3) + Fraction(1, 6))

# OUTPUT:
# 0.3
# 0.1000000000000000055511151231257827021181583404541015625
# 20.00
# 1/2`
            ]
        },
        {
            content: `<h3>round() Uses Banker's Rounding</h3>
Python's <code>round()</code> rounds exact halves to the nearest <b>even</b> number, which avoids a systematic upward bias when summing many rounded values. This surprises people coming from Java's <code>Math.round()</code>.`,
            codeExamples: [
                `print(round(0.5), round(1.5), round(2.5), round(3.5))
print(round(2.675, 2))   # 2.675 is really 2.67499999... in binary

# OUTPUT:
# 0 2 2 4
# 2.67`
            ]
        },
        {
            content: `<h3>Special Float Values and Limits</h3>`,
            codeExamples: [
                `import sys

inf = float("inf")
nan = float("nan")

print(inf > 10 ** 300, -inf < -10 ** 300)
print(nan == nan)              # NaN is not equal to anything, even itself
print(sys.float_info.max)
print(sys.maxsize)             # largest container index, not an int limit

# OUTPUT:
# True True
# False
# 1.7976931348623157e+308
# 9223372036854775807`
            ]
        },
        {
            content: `<h3>Working with complex Numbers</h3>`,
            codeExamples: [
                `import cmath

z = 3 + 4j
print(z.real, z.imag)
print(abs(z))                 # magnitude
print(z.conjugate())
print(1j * 1j)
print(cmath.sqrt(-1))

# OUTPUT:
# 3.0 4.0
# 5.0
# (3-4j)
# (-1+0j)
# 1j`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can a Python int overflow?</td><td>No - ints have arbitrary precision and grow as needed (floats can overflow to inf)</td></tr>
<tr class='text-center'><td>Why is <code>0.1 + 0.2 != 0.3</code>?</td><td>0.1 and 0.2 have no exact binary representation, so the stored values carry tiny errors</td></tr>
<tr class='text-center'><td>What should you use for money?</td><td><code>decimal.Decimal</code> created from strings (or integer paise/cents)</td></tr>
<tr class='text-center'><td>What does <code>round(2.5)</code> return?</td><td>2 - Python rounds halves to the nearest even number</td></tr>
<tr class='text-center'><td>What is the type of <code>8 / 2</code>?</td><td>float (4.0) - true division always returns a float</td></tr>
<tr class='text-center'><td>Is NaN equal to itself?</td><td>No - <code>nan == nan</code> is False; use <code>math.isnan()</code></td></tr>
</table>`
        }
    ]
};
