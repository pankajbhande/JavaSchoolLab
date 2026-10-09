// Module 1 (Python Fundamentals), part B: types, variables and conversion.
import { dd, r, type DeepDive } from './deepDive';

export const m01b: Record<string, DeepDive> = {
    'Data Types & Variables': dd(
        [`A <b>variable</b> is a name that points to an object in memory; every object has a <b>type</b> (int, float, str, bool, NoneType ...). You create a variable simply by assigning to it.`,
            r`# Names point at objects; the type lives on the object
count = 42            # int
price = 3.14          # float
name = "Asha"         # str
active = True         # bool
nothing = None        # NoneType

for v in (count, price, name, active, nothing):
    print(f"{v!r:8} -> {type(v).__name__}")

# OUTPUT:
# 42       -> int
# 3.14     -> float
# 'Asha'   -> str
# True     -> bool
# None     -> NoneType`],
        [`Programs must remember values (a price, a user name, a flag) while they run. Variables give those values readable names and types decide which operations are legal.`,
            r`# Without names the logic is unreadable; with names it documents itself
unit_price = 250
quantity = 4
discount = 0.1
total = unit_price * quantity * (1 - discount)
print("Total to pay:", total)

# OUTPUT:
# Total to pay: 900.0`],
        [`Every real program holds state in variables: shopping-cart totals, config values read from files, counters in loops, flags such as <code>is_logged_in</code>.`,
            r`# Invoice line the way a billing script would write it
price = 19.99
qty = 3
total = round(price * qty, 2)      # round to 2 decimals for money display
is_paid = False
print(f"Total: {total}  paid={is_paid}")

# OUTPUT:
# Total: 59.97  paid=False`],
        [`<b>Advantages:</b> no declarations, multiple assignment, easy swapping, and one name can be rebound to any type.`,
            r`# Multiple assignment and tuple-swap with no temp variable
a, b = 1, 2
a, b = b, a                 # swap
x = y = 0                   # chained assignment
print(a, b, x, y)

# OUTPUT:
# 2 1 0 0`],
        [`<b>Disadvantages:</b> a typo silently creates a brand-new variable instead of raising an error at definition time.`,
            r`# Disadvantage: misspelled name = new variable, original stays unchanged
total = 0
for n in [1, 2, 3]:
    totl = total + n        # typo: should be total = total + n
print(total)                # still 0 - silent bug

# OUTPUT:
# 0`],
        [`<b>Limitations:</b> Python has no real constants; UPPER_CASE is only a convention and any code can rebind the name.`,
            r`# Limitation: "constants" are not enforced by the language
MAX_USERS = 10
MAX_USERS = 20              # allowed - no error, no warning
print(MAX_USERS)
# Use typing.Final + a type checker (mypy) to get a static warning.

# OUTPUT:
# 20`],
        `
   variable names (stack of references)       objects (heap)
   ┌──────────┐                              ┌───────────────┐
   │  count   │ ───────────────────────────► │ int   42      │
   ├──────────┤                              ├───────────────┤
   │  name    │ ───────────────────────────► │ str   "Asha"  │
   ├──────────┤                              ├───────────────┤
   │  price   │ ───────────────────────────► │ float 3.14    │
   └──────────┘                              └───────────────┘
   name  = label only              type + value live in the object
`,
        `Treat variables as labels, not boxes: this mental model prevents aliasing bugs later. In larger code bases add type hints and a checker (mypy/pyright), use Final for constants, and prefer small scopes so a typo cannot hide among hundreds of names.`
    ),

    'Dynamic Typing': dd(
        [`<b>Dynamic typing</b> means types are checked at runtime and belong to objects, not names. The same name can point to an int now and a string later.`,
            r`x = 10
print(type(x))      # the object 10 is an int
x = "ten"           # rebind the same name to a str - perfectly legal
print(type(x))

# OUTPUT:
# <class 'int'>
# <class 'str'>`],
        [`It lets one function work on many kinds of data without templates or overloads, which cuts code size and speeds up prototyping.`,
            r`def double(v):
    return v * 2             # works for anything that supports *

print(double(4))
print(double("ab"))
print(double([1, 2]))

# OUTPUT:
# 8
# abab
# [1, 2, 1, 2]`],
        [`Data coming from JSON, CSV or web forms has no fixed schema, so dynamic typing makes it natural to handle mixed values and duck-typed interfaces (anything with <code>.read()</code> is a file).`,
            r`# Mixed values from an API: normalise them to float
values = [1, "2", 3.5]
total = sum(float(v) for v in values)
print(total)

# OUTPUT:
# 6.5`],
        [`<b>Advantages:</b> less boilerplate, heterogeneous containers, duck typing and fast experimentation.`,
            r`items = [1, "a", None, 2.5, [1, 2]]       # one list, many types
print([type(i).__name__ for i in items])

# OUTPUT:
# ['int', 'str', 'NoneType', 'float', 'list']`],
        [`<b>Disadvantages:</b> wrong-type bugs are found only when the line runs, and some wrong types do not fail at all - they silently give a wrong answer.`,
            r`def area(w, h):
    return w * h

print(area(3, 4))          # 12 - intended
print(area("3", 4))        # '3333' - no error, wrong result!

# OUTPUT:
# 12
# 3333`],
        [`<b>Limitations:</b> type hints are documentation only; the interpreter never enforces them. Use mypy/pyright or runtime validators (pydantic) for real checks.`,
            r`def square(n: int) -> int:
    return n * n

print(square(3.0))         # float passes an int hint without complaint
try:
    square("hi")           # hint says int, but Python only fails inside the body
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# 9.0
# TypeError: can't multiply sequence by non-int of type 'str'`],
        `
   Static (Java)                       Dynamic (Python)
   ┌──────────────────────┐            ┌──────────────────────┐
   │ int x  = 10;         │            │ x = 10               │
   │ x = "ten";  ✗ compile│            │ x = "ten"   ✓ ok     │
   └──────────────────────┘            └──────────────────────┘
   type bound to the NAME              type bound to the OBJECT
   checked at compile time             checked when line runs
`,
        `Dynamic typing trades early safety for speed of development. For services and libraries, add gradual typing (hints + mypy in CI) and validate data at system boundaries; keep fully dynamic style for scripts, notebooks and glue code.`
    ),

    'Numeric Types: int, float & complex': dd(
        [`Python has three built-in numbers: <b>int</b> (unlimited size), <b>float</b> (64-bit IEEE 754 double) and <b>complex</b> (real + imaginary parts).`,
            r`big = 2 ** 100              # int never overflows
pi = 3.14159                # float
z = 3 + 4j                  # complex: real=3, imag=4
print(big)
print(type(pi).__name__, type(z).__name__)
print(abs(z))               # magnitude of a complex number

# OUTPUT:
# 1267650600228229401496703205376
# float complex
# 5.0`],
        [`Real programs need whole numbers (counts), decimals (measurements) and sometimes complex numbers (signals, physics), plus operators to split numbers apart.`,
            r`print(17 / 5)             # true division -> float
print(17 // 5)            # floor division
print(17 % 5)             # remainder
print(divmod(17, 5))      # both at once
print(2 ** 10)            # power

# OUTPUT:
# 3.4
# 3
# 2
# (3, 2)
# 1024`],
        [`Money should use <code>Decimal</code>, science uses float, cryptography relies on huge ints (RSA keys are 2048-bit integers), and signal processing uses complex numbers.`,
            r`from decimal import Decimal

print(0.1 + 0.2)                          # float surprise
print(Decimal("0.1") + Decimal("0.2"))    # exact decimal arithmetic for money
print(round(2.675, 2))                    # float storage error: 2.67 not 2.68

# OUTPUT:
# 0.30000000000000004
# 0.3
# 2.67`],
        [`<b>Advantages:</b> arbitrary-precision integers (no overflow bugs), underscores for readability, built-in complex type, rich <code>math</code> module.`,
            r`import math
print(math.factorial(25))      # exact, no overflow
print(1_000_000 + 0b101 + 0xFF)  # binary and hex literals, underscores
print(math.sqrt(16), math.pi)

# OUTPUT:
# 15511210043330985984000000
# 1000260
# 4.0 3.141592653589793`],
        [`<b>Disadvantages:</b> float cannot represent most decimals exactly, so equality tests on floats are fragile.`,
            r`import math
print(0.1 + 0.2 == 0.3)                  # False
print(math.isclose(0.1 + 0.2, 0.3))      # True - compare with tolerance

# OUTPUT:
# False
# True`],
        [`<b>Limitations:</b> floats have a finite range and special values (inf, nan); ints have no limit but huge ints are slow and string conversion is capped at 4300 digits by default.`,
            r`import sys
print(sys.float_info.max)             # largest float
print(1e308 * 10)                     # overflows silently to inf
print(float("inf") - float("inf"))    # nan, and nan != nan
try:
    int("1" * 5000)                   # 3.11+ safety cap on digit strings
except ValueError:
    print("ValueError: too many digits")

# OUTPUT:
# 1.7976931348623157e+308
# inf
# nan
# ValueError: too many digits`],
        `
   numbers.Number
   ├── int      unlimited, exact       2**100
   ├── float    64-bit, approximate    0.1 -> 0.1000000000000000055...
   ├── complex  (float, float)         3+4j
   └── (stdlib) Decimal  exact base-10 | Fraction  exact p/q

   float layout:  [1 sign][11 exponent][52 mantissa]
`,
        `Choose the type by the correctness requirement: int for counting, Decimal for money and anything audited, float for scientific work (NumPy float64/float32 for bulk speed). Never compare floats with ==, and store money as integer cents or Decimal across service boundaries.`
    ),

    'bool & None': dd(
        [`<b>bool</b> has two values, True and False, and is a subclass of int (True == 1). <b>None</b> is the single object of type NoneType and means "no value".`,
            r`print(isinstance(True, int))   # bool is an int subclass
print(True + True)              # 2
print(type(None).__name__)
print(None is None)

# OUTPUT:
# True
# 2
# NoneType
# True`],
        [`Conditions need yes/no answers, and programs need a way to say "nothing here yet" that is different from 0 or an empty string. Python also treats many values as truthy or falsy inside <code>if</code>.`,
            r`for v in [0, "", [], None, "a", 1]:
    print(repr(v), bool(v))

# OUTPUT:
# 0 False
# '' False
# [] False
# None False
# 'a' True
# 1 True`],
        [`<code>None</code> is the standard marker for "not found", "not set" and the safe default for mutable arguments; booleans drive every validation and feature flag.`,
            r`def add_item(item, bag=None):
    if bag is None:            # fresh list each call; avoids shared-default bug
        bag = []
    bag.append(item)
    return bag

print(add_item(1))
print(add_item(2))

# OUTPUT:
# [1]
# [2]`],
        [`<b>Advantages:</b> truthiness removes noisy comparisons, and <code>or</code>/<code>and</code> short-circuit to give compact defaults.`,
            r`name = ""
display = name or "guest"          # empty string is falsy -> default used
items = []
if not items:
    print("cart is empty")
print(display)

# OUTPUT:
# cart is empty
# guest`],
        [`<b>Disadvantages:</b> truthiness can't tell 0 or "" apart from "missing", causing subtle bugs.`,
            r`timeout = 0                    # user really wants 0 (no waiting)
bad = timeout or 30            # bug: 0 is falsy, becomes 30
good = 30 if timeout is None else timeout
print(bad, good)

# OUTPUT:
# 30 0`],
        [`<b>Limitations:</b> None supports no operations, and bool cannot be subclassed (it only ever has two instances).`,
            r`try:
    None + 1
except TypeError as e:
    print("TypeError:", e)

try:
    class MyBool(bool): pass
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
# TypeError: type 'bool' is not an acceptable base type`],
        `
   Falsy values                     Truthy values
   ┌───────────────────────┐        ┌────────────────────────┐
   │ False  None           │        │ True                   │
   │ 0  0.0  0j            │        │ any non-zero number    │
   │ ""  []  ()  {}  set() │        │ any non-empty container│
   └───────────┬───────────┘        └────────────┬───────────┘
               └──────────► if x: ◄──────────────┘
   test "missing" with  x is None   (not  not x)
`,
        `Use <code>is None</code> for absence, plain truthiness for emptiness, and never <code>== True</code>. In APIs prefer Optional[T] hints and avoid returning None for errors that callers must handle; raise or return a result object instead.`
    ),

    'Strings (str) Basics': dd(
        [`A <b>str</b> is an immutable sequence of Unicode characters. Create with single, double or triple quotes.`,
            r`s = "Python"
print(len(s), s[0], s[-1])        # length, first, last
print(s + " rocks", s * 2)        # concatenate, repeat
poem = """line one
line two"""                       # triple quotes keep newlines
print(poem.splitlines())

# OUTPUT:
# 6 P n
# Python rocks PythonPython
# ['line one', 'line two']`],
        [`Almost all data a user sees or types is text: names, messages, file paths, URLs, JSON. Strings are the glue between programs and people.`,
            r`first, last = "Ada", "Lovelace"
full = first + " " + last
print(full)
print(full.upper(), len(full))
print("Love" in full)

# OUTPUT:
# Ada Lovelace
# ADA LOVELACE 12
# True`],
        [`Cleaning user input is the most common job: strip whitespace, normalise case, then compare or store.`,
            r`raw = "  Alice@Example.COM \n"
email = raw.strip().lower()
print(repr(email))
print(email.endswith("@example.com"))

# OUTPUT:
# 'alice@example.com'
# True`],
        [`<b>Advantages:</b> immutable so safe to share and usable as dict keys; full Unicode; rich methods; slicing.`,
            r`d = {"key": 1}                  # strings are hashable dict keys
word = "hello"
print(word[1:4], word[::-1])     # slice and reverse
print("héllo wörld 你好".title())  # Unicode just works

# OUTPUT:
# ell olleh
# Héllo Wörld 你好`],
        [`<b>Disadvantages:</b> immutability means every change builds a new string; repeated <code>+=</code> in a loop is slow for large data.`,
            r`s = "hello"
try:
    s[0] = "J"                   # cannot modify in place
except TypeError as e:
    print("TypeError:", e)

parts = ["a", "b", "c"]
print("".join(parts))            # build once instead of += in a loop

# OUTPUT:
# TypeError: 'str' object does not support item assignment
# abc`],
        [`<b>Limitations:</b> no implicit conversion to/from numbers (unlike JavaScript), and len counts code points, not what a user sees as a character.`,
            r`try:
    "5" + 5
except TypeError as e:
    print("TypeError:", e)

flag = "é"                 # 'e' + combining accent = looks like 1 letter
print(len(flag), len("é"))

# OUTPUT:
# TypeError: can only concatenate str (not "int") to str
# 2 1`],
        `
   "Python"
    ┌───┬───┬───┬───┬───┬───┐
    │ P │ y │ t │ h │ o │ n │   immutable sequence
    └───┴───┴───┴───┴───┴───┘
      0   1   2   3   4   5     forward index
     -6  -5  -4  -3  -2  -1     backward index
`,
        `Because strings are immutable and interned, they are safe keys and cheap to share; build large text with join or io.StringIO. Treat bytes and str as different types and decode at the I/O boundary; do not assume one code point equals one visible character.`
    ),

    'Type Conversion': dd(
        [`<b>Type conversion</b> (casting) turns a value of one type into another using constructors such as <code>int()</code>, <code>float()</code>, <code>str()</code>, <code>list()</code>. Python never converts silently between str and numbers.`,
            r`print(int("42") + 1)        # str -> int
print(float("3.5"))          # str -> float
print(str(10) + "!")         # int -> str
print(int(3.9))              # float -> int truncates toward zero

# OUTPUT:
# 43
# 3.5
# 10!
# 3`],
        [`Input from files, forms and the console is always text, so you must convert before doing math.`,
            r`age = "25"                   # what input() would return
try:
    print(age + 1)
except TypeError as e:
    print("TypeError:", e)
print(int(age) + 1)

# OUTPUT:
# TypeError: can only concatenate str (not "int") to str
# 26`],
        [`Parsing a CSV or log line: split, then convert each field to its real type.`,
            r`row = "Alice,30,55000.5"
name, age, salary = row.split(",")
age = int(age)
salary = float(salary)
print(name, age + 1, salary + 500)

# OUTPUT:
# Alice 31 55500.5`],
        [`<b>Advantages:</b> explicit and predictable; collection constructors convert between lists, tuples, sets and dicts in one call.`,
            r`print(list("abc"))
print(tuple([1, 2]))
print(set([1, 1, 2, 3]))
print(dict(zip("ab", [1, 2])))

# OUTPUT:
# ['a', 'b', 'c']
# (1, 2)
# {1, 2, 3}
# {'a': 1, 'b': 2}`],
        [`<b>Disadvantages:</b> bad input raises ValueError; float to int silently loses the fraction; round() uses banker's rounding.`,
            r`for text in ["12", "3.7", "abc"]:
    try:
        print(int(text))
    except ValueError as e:
        print("ValueError:", e)

print(round(2.5), round(3.5))     # ties go to even

# OUTPUT:
# 12
# ValueError: invalid literal for int() with base 10: '3.7'
# ValueError: invalid literal for int() with base 10: 'abc'
# 2 4`],
        [`<b>Limitations:</b> bool("False") is True (any non-empty string is truthy), and None cannot be converted to a number.`,
            r`print(bool("False"))          # True! non-empty string
print(bool(""))
try:
    int(None)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# True
# False
# TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'`],
        `
   "42" ──int()──► 42 ──float()──► 42.0 ──str()──► "42.0"
                    │
                    └──bool()──► True        int("3.7")  ✗ ValueError
   "abc" ──list()──► ['a','b','c']           int(3.7)    ✓ 3  (truncates)
`,
        `Conversion is where untrusted input enters the program, so wrap it in one parsing layer that returns clean typed data or a clear error (pydantic, dataclasses plus validators). Avoid relying on implicit truthiness of strings for configuration flags; parse "true/false" explicitly.`
    ),

    'type() & isinstance()': dd(
        [`<code>type(x)</code> returns the exact class of an object. <code>isinstance(x, C)</code> asks whether x is an instance of C or any subclass of it.`,
            r`print(type(5))
print(isinstance(5, int))
print(isinstance(5, (int, float)))     # tuple = "any of these"
print(isinstance("5", int))

# OUTPUT:
# <class 'int'>
# True
# True
# False`],
        [`Because Python is dynamic, functions sometimes need to check what they received before using it.`,
            r`def safe_div(a, b):
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        return "numbers only"
    return a / b if b else "cannot divide by zero"

print(safe_div(10, 4))
print(safe_div("10", 4))
print(safe_div(1, 0))

# OUTPUT:
# 2.5
# numbers only
# cannot divide by zero`],
        [`Serializers, validators and JSON handlers branch on the value type. Note: test <code>bool</code> before <code>int</code> since bool is an int.`,
            r`def describe(v):
    if isinstance(v, bool):  return "flag"
    if isinstance(v, int):   return "whole number"
    if isinstance(v, float): return "decimal"
    if isinstance(v, str):   return "text"
    return "other"

print([describe(x) for x in [True, 7, 2.5, "hi", None]])

# OUTPUT:
# ['flag', 'whole number', 'decimal', 'text', 'other']`],
        [`<b>Advantages:</b> isinstance respects inheritance, so subclasses work wherever the parent is accepted.`,
            r`class Animal: pass
class Dog(Animal): pass

d = Dog()
print(type(d) is Animal)         # False - exact match only
print(isinstance(d, Animal))     # True  - subclass counts
print(issubclass(Dog, Animal))

# OUTPUT:
# False
# True
# True`],
        [`<b>Disadvantages:</b> <code>type(x) == int</code> rejects subclasses, and heavy isinstance chains go against duck typing.`,
            r`print(type(True) == int)          # False although True behaves as int
print(isinstance(True, int))       # True - may surprise validation code
age = True
print("valid age?", isinstance(age, int))   # True: bug if you meant numbers only

# OUTPUT:
# False
# True
# valid age? True`],
        [`<b>Limitations:</b> isinstance cannot check parameterised generics such as <code>list[int]</code>; it only checks the container class, not the element types.`,
            r`print(isinstance([1, "a"], list))        # True, contents not examined
try:
    isinstance([1], list[int])
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# True
# TypeError: isinstance() argument 2 cannot be a parameterized generic`],
        `
   isinstance(obj, Animal)
          obj
           │  walks class hierarchy (MRO)
           ▼
     Dog ──► Animal ──► object
      │         │
   type(obj)  isinstance True for both
   is Dog     (type(obj) is Animal -> False)
`,
        `Prefer duck typing or EAFP (try/except) over type checks; when you must dispatch on type use functools.singledispatch, Protocols or match/case class patterns. For deep validation of nested data use a validation library instead of hand-written isinstance trees.`
    ),
};
