import type { Topic } from '../../types';

export const mathRandom: Topic = {
    id: 'python-modules-packages-math-random',
    name: 'math & random',
    beginner: [
        {
            content: `<h4>The math Module</h4>
<code>math</code> is the standard library's toolbox of mathematical functions and constants - the Python counterpart of Java's <code>Math</code> class. Import it once, then call functions as <code>math.name(...)</code>.`,
            codeExamples: [
                `import math

print(math.sqrt(16))           # square root - always a float
print(math.pow(2, 10), 2 ** 10)  # math.pow returns float, ** keeps int
print(math.pi, math.e)
print(math.factorial(5))
print(math.hypot(3, 4))        # length of the hypotenuse

# OUTPUT:
# 4.0
# 1024.0 1024
# 3.141592653589793 2.718281828459045
# 120
# 5.0`
            ]
        },
        {
            content: `<h4>Rounding Down, Up and Toward Zero</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Rounds</th><th><code>2.5</code></th><th><code>-2.5</code></th></tr>
<tr class='text-center'><td><code>math.floor(x)</code></td><td>Down (toward -∞)</td><td>2</td><td>-3</td></tr>
<tr class='text-center'><td><code>math.ceil(x)</code></td><td>Up (toward +∞)</td><td>3</td><td>-2</td></tr>
<tr class='text-center'><td><code>math.trunc(x)</code> / <code>int(x)</code></td><td>Toward zero</td><td>2</td><td>-2</td></tr>
<tr class='text-center'><td><code>round(x)</code></td><td>To nearest, halves to even</td><td>2</td><td>-2</td></tr>
</table>
Unlike Java's <code>Math.floor</code>, which returns a <code>double</code>, Python's <code>floor</code> and <code>ceil</code> return an <code>int</code>.`,
            codeExamples: [
                `import math

print(math.floor(-2.5), math.ceil(-2.5), math.trunc(-2.5))
print(type(math.floor(7.9)))

pages = math.ceil(53 / 10)      # 53 items, 10 per page
print("pages needed:", pages)

# OUTPUT:
# -3 -2 -2
# <class 'int'>
# pages needed: 6`
            ]
        },
        {
            content: `<h4>Number Theory and Logarithms</h4>`,
            codeExamples: [
                `import math

print(math.gcd(12, 18), math.lcm(4, 6))    # lcm needs Python 3.9+
print(math.comb(5, 2), math.perm(5, 2))    # choose 2 of 5: unordered / ordered
print(math.log10(1000), math.log2(8), math.log(math.e))
print(math.degrees(math.pi), math.radians(180))

# OUTPUT:
# 6 12
# 10 20
# 3.0 3.0 1.0
# 180.0 3.141592653589793`
            ]
        },
        {
            content: `<h4>Comparing Floats and Domain Errors</h4>
Floating-point results are rarely exact, so compare them with <code>math.isclose()</code>. Asking for something mathematically undefined raises <code>ValueError</code>.`,
            codeExamples: [
                `import math

print(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))
print(math.inf > 10 ** 100)
print(math.sqrt(-1))

# OUTPUT:
# False True
# True
# ValueError: math domain error`
            ]
        },
        {
            content: `<h4>The random Module</h4>
<code>random</code> generates <b>pseudo-random</b> values - like Java's <code>Random</code>. Results change on every run, so the examples below print <b>properties</b> of the results rather than the values themselves.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Returns</th></tr>
<tr class='text-center'><td><code>random()</code></td><td>A float in [0.0, 1.0)</td></tr>
<tr class='text-center'><td><code>randint(a, b)</code></td><td>An int from a to b - <b>both included</b></td></tr>
<tr class='text-center'><td><code>randrange(start, stop, step)</code></td><td>An int from the range - stop excluded</td></tr>
<tr class='text-center'><td><code>uniform(a, b)</code></td><td>A float between a and b</td></tr>
<tr class='text-center'><td><code>choice(seq)</code></td><td>One random item</td></tr>
<tr class='text-center'><td><code>choices(seq, weights, k)</code></td><td>k items, <b>with</b> repeats, optionally weighted</td></tr>
<tr class='text-center'><td><code>sample(seq, k)</code></td><td>k <b>distinct</b> items</td></tr>
<tr class='text-center'><td><code>shuffle(list)</code></td><td>None - shuffles the list in place</td></tr>
</table>`,
            codeExamples: [
                `import random

dice = random.randint(1, 6)
print(1 <= dice <= 6)

print(all(1 <= random.randint(1, 6) <= 6 for _ in range(1000)))
print(random.randrange(0, 100, 10) % 10 == 0)    # 0, 10, ..., 90
print(0 <= random.random() < 1)

colours = ["red", "green", "blue"]
print(random.choice(colours) in colours)

# OUTPUT:
# True
# True
# True
# True
# True`
            ]
        },
        {
            content: `<h4>choices, sample and shuffle</h4>`,
            codeExamples: [
                `import random

students = ["Abaji", "Raoji", "Kanhoji", "Moropant", "Sheru"]

winners = random.sample(students, 3)          # 3 different people
print(len(winners), len(set(winners)))

spins = random.choices(["win", "lose"], weights=[1, 9], k=10)  # repeats allowed
print(len(spins), set(spins) <= {"win", "lose"})

deck = list(range(1, 11))
result = random.shuffle(deck)                 # shuffles in place
print(result)
print(sorted(deck) == list(range(1, 11)))     # same cards, new order

# OUTPUT:
# 3 3
# 10 True
# None
# True`
            ]
        },
        {
            content: `<h4>Reproducible Results with seed()</h4>
Seeding the generator with the same value makes it produce the same sequence again - essential for tests, simulations and debugging.`,
            codeExamples: [
                `import random

random.seed(2026)
first = [random.randint(1, 100) for _ in range(5)]

random.seed(2026)
second = [random.randint(1, 100) for _ in range(5)]

print(first == second)

# OUTPUT:
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>random Is Not for Security - Use secrets</h3>
<code>random</code> uses the Mersenne Twister algorithm, which is fast and statistically good but <b>predictable</b>: after observing enough outputs, an attacker can reconstruct its state. Never use it for passwords, OTPs, session tokens or reset links. The <code>secrets</code> module (Java: <code>SecureRandom</code>) draws from the operating system's cryptographically secure source.`,
            codeExamples: [
                `import secrets
import string

otp = "".join(secrets.choice(string.digits) for _ in range(6))
print(len(otp), otp.isdigit())

token = secrets.token_hex(16)          # 16 random bytes -> 32 hex characters
print(len(token))

alphabet = string.ascii_letters + string.digits
password = "".join(secrets.choice(alphabet) for _ in range(12))
print(len(password))

# OUTPUT:
# 6 True
# 32
# 12`
            ]
        },
        {
            content: `<h3>Independent Generators with random.Random</h3>
The module-level functions share one hidden generator. A <code>random.Random(seed)</code> instance has its own state, so a simulation or a test can be reproducible without being affected by other code that also uses <code>random</code>.`,
            codeExamples: [
                `import random

game_a = random.Random(42)
game_b = random.Random(42)

random.random()                       # other code using the shared generator...
a_rolls = [game_a.randint(1, 6) for _ in range(5)]
b_rolls = [game_b.randint(1, 6) for _ in range(5)]
print(a_rolls == b_rolls)             # ...doesn't disturb the instances

# OUTPUT:
# True`
            ]
        },
        {
            content: `<h3>Precise Sums: math.fsum</h3>
Adding many floats with <code>sum()</code> accumulates rounding error. <code>math.fsum()</code> tracks the lost low-order bits and returns the correctly rounded total.`,
            codeExamples: [
                `import math

values = [0.1] * 10
print(sum(values))
print(math.fsum(values))

# OUTPUT:
# 0.9999999999999999
# 1.0`
            ]
        },
        {
            content: `<h3>math vs cmath vs statistics vs NumPy</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Module</th><th>Use it for</th></tr>
<tr class='text-center'><td><code>math</code></td><td>Real numbers, one value at a time</td></tr>
<tr class='text-center'><td><code>cmath</code></td><td>Complex numbers - <code>cmath.sqrt(-1)</code> works where <code>math.sqrt(-1)</code> fails</td></tr>
<tr class='text-center'><td><code>statistics</code></td><td>Mean, median, mode, standard deviation of small data sets</td></tr>
<tr class='text-center'><td>NumPy (third-party)</td><td>Fast maths on whole arrays - data science and ML</td></tr>
</table>`,
            codeExamples: [
                `import cmath
import statistics

print(cmath.sqrt(-1))

marks = [70, 80, 90, 100]
print(statistics.mean(marks), statistics.median(marks))
print(statistics.mode([1, 2, 2, 3]))
print(statistics.pstdev([2, 4, 4, 4, 5, 5, 7, 9]))   # population std dev

# OUTPUT:
# 1j
# 85 85.0
# 2
# 2.0`
            ]
        },
        {
            content: `<h3>Java Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>Math.sqrt(x)</code>, <code>Math.PI</code></td><td><code>math.sqrt(x)</code>, <code>math.pi</code></td></tr>
<tr class='text-center'><td><code>Math.floor(x)</code> (returns double)</td><td><code>math.floor(x)</code> (returns int)</td></tr>
<tr class='text-center'><td><code>Math.random()</code></td><td><code>random.random()</code></td></tr>
<tr class='text-center'><td><code>new Random(seed).nextInt(6) + 1</code></td><td><code>random.Random(seed).randint(1, 6)</code></td></tr>
<tr class='text-center'><td><code>Collections.shuffle(list)</code></td><td><code>random.shuffle(lst)</code></td></tr>
<tr class='text-center'><td><code>SecureRandom</code></td><td><code>secrets</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is <code>randint(1, 6)</code> inclusive?</td><td>Yes, both ends; <code>randrange(1, 6)</code> excludes 6</td></tr>
<tr class='text-center'><td>sample vs choices?</td><td>sample picks k distinct items; choices picks k items with replacement and supports weights</td></tr>
<tr class='text-center'><td>What does <code>random.shuffle(lst)</code> return?</td><td>None - it shuffles the list in place</td></tr>
<tr class='text-center'><td>How do you make random results reproducible?</td><td><code>random.seed(n)</code>, or a separate <code>random.Random(n)</code> instance</td></tr>
<tr class='text-center'><td>How should you generate an OTP or token?</td><td>With the <code>secrets</code> module - random is predictable</td></tr>
<tr class='text-center'><td>floor vs trunc for negative numbers?</td><td><code>floor(-2.5)</code> is -3 (down); <code>trunc(-2.5)</code> is -2 (toward zero)</td></tr>
<tr class='text-center'><td>Why use <code>math.isclose</code>?</td><td>Float arithmetic has rounding error, so exact == comparisons can fail</td></tr>
</table>`
        }
    ]
};
