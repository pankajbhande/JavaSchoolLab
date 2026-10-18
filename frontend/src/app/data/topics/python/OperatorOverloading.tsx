import type { Topic } from '../../types';

export const operatorOverloading: Topic = {
    id: 'python-data-model-operator-overloading-add',
    name: 'Operator Overloading & __add__',
    beginner: [
        {
            content: `<h4>Operators Are Method Calls</h4>
Every operator is a call to a dunder method on the left operand: <code>a + b</code> runs <code>a.__add__(b)</code>. Defining these methods lets your own classes work with <code>+</code>, <code>-</code>, <code>*</code> and the rest - this is <b>operator overloading</b>. Java has no user-defined operator overloading (only String's built-in <code>+</code>), which is why you write <code>a.add(b)</code> for <code>BigDecimal</code>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operator</th><th>Method</th><th>Operator</th><th>Method</th></tr>
<tr class='text-center'><td><code>+</code></td><td><code>__add__</code></td><td>unary <code>-</code></td><td><code>__neg__</code></td></tr>
<tr class='text-center'><td><code>-</code></td><td><code>__sub__</code></td><td>unary <code>+</code></td><td><code>__pos__</code></td></tr>
<tr class='text-center'><td><code>*</code></td><td><code>__mul__</code></td><td><code>abs(x)</code></td><td><code>__abs__</code></td></tr>
<tr class='text-center'><td><code>/</code></td><td><code>__truediv__</code></td><td><code>&amp;</code>, <code>|</code>, <code>^</code></td><td><code>__and__</code>, <code>__or__</code>, <code>__xor__</code></td></tr>
<tr class='text-center'><td><code>//</code></td><td><code>__floordiv__</code></td><td><code>~</code></td><td><code>__invert__</code></td></tr>
<tr class='text-center'><td><code>%</code></td><td><code>__mod__</code></td><td><code>&lt;&lt;</code>, <code>&gt;&gt;</code></td><td><code>__lshift__</code>, <code>__rshift__</code></td></tr>
<tr class='text-center'><td><code>**</code></td><td><code>__pow__</code></td><td><code>@</code></td><td><code>__matmul__</code></td></tr>
</table>`
        },
        {
            content: `<h4>A Vector Class</h4>
Each method returns a <b>new</b> object and leaves the operands unchanged, just like <code>+</code> on numbers.`,
            codeExamples: [
                `import math

class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, k):                  # vector * number
        if not isinstance(k, (int, float)):
            return NotImplemented
        return Vector(self.x * k, self.y * k)

    def __neg__(self):
        return Vector(-self.x, -self.y)

    def __abs__(self):
        return math.hypot(self.x, self.y)  # length of the vector

    def __bool__(self):
        return bool(self.x or self.y)      # the zero vector is falsy

v = Vector(3, 4)
w = Vector(1, 2)

print(v + w, v - w, v * 2)
print(-v, abs(v))
print(bool(Vector(0, 0)), bool(v))

# OUTPUT:
# Vector(4, 6) Vector(2, 2) Vector(6, 8)
# Vector(-3, -4) 5.0
# False True`
            ]
        },
        {
            content: `<h4>Reflected Methods: 3 * v</h4>
<code>v * 3</code> calls <code>v.__mul__(3)</code>. But <code>3 * v</code> calls <code>int.__mul__(3, v)</code> first - and <code>int</code> knows nothing about vectors, so it returns <code>NotImplemented</code>. Python then tries the <b>reflected</b> method on the right operand: <code>v.__rmul__(3)</code>. Without it, you get a <code>TypeError</code>.`,
            codeExamples: [
                `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __mul__(self, k):
        if not isinstance(k, (int, float)):
            return NotImplemented
        return Vector(self.x * k, self.y * k)

v = Vector(3, 4)
print(v * 3)
print(3 * v)

# OUTPUT:
# Vector(9, 12)
# TypeError: unsupported operand type(s) for *: 'int' and 'Vector'`,
                `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __mul__(self, k):
        if not isinstance(k, (int, float)):
            return NotImplemented
        return Vector(self.x * k, self.y * k)

    def __rmul__(self, k):                 # k * vector
        return self * k                    # multiplication is commutative here

v = Vector(3, 4)
print(3 * v)

# OUTPUT:
# Vector(9, 12)`
            ]
        },
        {
            content: `<h4>In-Place Operators: +=</h4>
<code>a += b</code> first tries <code>a.__iadd__(b)</code>. If the class has no <code>__iadd__</code>, Python falls back to <code>a = a + b</code> - a <b>new</b> object. Immutable types (like numbers, strings and our <code>Vector</code>) should leave <code>__iadd__</code> out; mutable containers can define it to modify themselves and must <b>return self</b>.`,
            codeExamples: [
                `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

v = Vector(1, 1)
alias = v
v += Vector(1, 1)              # no __iadd__: v = v + Vector(1, 1)
print(v, alias, v is alias)

class Cart:
    def __init__(self):
        self.items = []

    def __iadd__(self, item):  # mutate in place
        self.items.append(item)
        return self            # forget this and the name becomes None

cart = Cart()
same = cart
cart += "pen"
cart += "book"
print(same.items, cart is same)

# OUTPUT:
# Vector(2, 2) Vector(1, 1) False
# ['pen', 'book'] True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Full Dispatch Rule</h3>
For <code>a + b</code> Python:<br>
1. calls <code>a.__add__(b)</code>; if it returns a value, that's the result;<br>
2. if it is missing or returns <code>NotImplemented</code>, calls <code>b.__radd__(a)</code> (only when the types differ);<br>
3. if that is also missing or <code>NotImplemented</code>, raises <code>TypeError: unsupported operand type(s)</code>.<br><br>
(Exception: if <code>b</code>'s type is a <b>subclass</b> of <code>a</code>'s type and overrides the reflected method, <code>b.__radd__</code> is tried first.) This is why methods should return <code>NotImplemented</code> for unknown types instead of raising - it keeps the door open for the other operand.`,
            codeExamples: [
                `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)

print(Vector(1, 2) + 5)

# OUTPUT:
# TypeError: unsupported operand type(s) for +: 'Vector' and 'int'`
            ]
        },
        {
            content: `<h3>Making sum() Work</h3>
<code>sum(items)</code> starts from <code>0</code>, so the first step is <code>0 + Vector(...)</code> - which needs <code>__radd__</code>. Either pass a starting vector, or let <code>__radd__</code> treat <code>0</code> as the identity.`,
            codeExamples: [
                `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)

    def __radd__(self, other):
        if other == 0:              # sum() starts from 0
            return self
        return self.__add__(other)

moves = [Vector(1, 2), Vector(3, 4), Vector(-2, 0)]
print(sum(moves))
print(sum(moves, start=Vector(10, 10)))

# OUTPUT:
# Vector(2, 6)
# Vector(12, 16)`
            ]
        },
        {
            content: `<h3>Good Overloading in the Standard Library</h3>
The best overloads make code read like the domain's own notation: exact money arithmetic with <code>Decimal</code>, fractions with <code>Fraction</code>, and <code>/</code> to join paths in <code>pathlib</code>.`,
            codeExamples: [
                `from decimal import Decimal
from fractions import Fraction
from pathlib import PurePosixPath

print(Decimal("0.10") + Decimal("0.20"))
print(Fraction(1, 3) + Fraction(1, 6))
print(PurePosixPath("data") / "reports" / "jan.csv")
print([0] * 3, "ab" * 2, {1, 2} | {3})

# OUTPUT:
# 0.30
# 1/2
# data/reports/jan.csv
# [0, 0, 0] abab {1, 2, 3}`
            ]
        },
        {
            content: `<h3>Rules for Sensible Overloading</h3>
• Keep the <b>usual meaning</b>: <code>+</code> combines, <code>*</code> scales or repeats. Don't make <code>+</code> send an email.<br>
• Binary operators should <b>return new objects</b>, not mutate the operands.<br>
• Return <code>NotImplemented</code> for types you don't handle - never silently return a wrong answer.<br>
• Implement the reflected method when the operation should work with the operands swapped.<br>
• If an operator would surprise a reader, a named method (<code>account.transfer(x)</code>) is better.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is operator overloading?</td><td>Defining dunder methods such as __add__ so a class supports operators like +</td></tr>
<tr class='text-center'><td>What is __radd__ for?</td><td>The reflected version, called on the right operand when the left one can't handle the operation (e.g. <code>3 * v</code>, <code>sum()</code>)</td></tr>
<tr class='text-center'><td>What happens if __add__ returns NotImplemented?</td><td>Python tries the other operand's reflected method, then raises TypeError</td></tr>
<tr class='text-center'><td>What if a class has __add__ but no __iadd__?</td><td><code>a += b</code> becomes <code>a = a + b</code>, creating a new object</td></tr>
<tr class='text-center'><td>What must __iadd__ return?</td><td>The result to bind to the name - normally <code>self</code></td></tr>
<tr class='text-center'><td>Does Java support operator overloading?</td><td>No user-defined overloading; only the built-in String +</td></tr>
</table>`
        }
    ]
};
