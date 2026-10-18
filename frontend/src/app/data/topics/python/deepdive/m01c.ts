// Module 1 (Python Fundamentals), part C: mutability, identity, operators, string slicing.
import { dd, r, type DeepDive } from './deepDive';

export const m01c: Record<string, DeepDive> = {
    'Mutable vs Immutable Objects': dd(
        [`A <b>mutable</b> object (list, dict, set) can change in place; an <b>immutable</b> object (int, str, tuple, frozenset) cannot - "changing" it makes a new object.`,
            r`lst = [1, 2]
before = id(lst)
lst.append(3)                       # in-place change
print(lst, id(lst) == before)       # same object

t = (1, 2)
try:
    t[0] = 5                        # tuples refuse modification
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# [1, 2, 3] True
# TypeError: 'tuple' object does not support item assignment`],
        [`You must know which kind you hold, because two names can point at the same mutable object and a change through one name is visible through the other.`,
            r`a = [1, 2]
b = a                  # NOT a copy - same list, two names
b.append(3)
print(a)               # a changed too!

s = "hi"
t = s
t += "!"               # str is immutable: t gets a NEW object
print(s, t)

# OUTPUT:
# [1, 2, 3]
# hi hi!`],
        [`A very common production bug: a function modifies the list the caller passed in. Defensive copies prevent surprises.`,
            r`def add_tag_bad(tags, t):
    tags.append(t)                  # mutates caller's list
    return tags

def add_tag_good(tags, t):
    return tags + [t]               # builds a new list

mine = ["py"]
add_tag_good(mine, "ai"); print(mine)
add_tag_bad(mine, "ai");  print(mine)

# OUTPUT:
# ['py']
# ['py', 'ai']`],
        [`<b>Advantages:</b> immutables are hashable (dict keys, set members) and safe to share between threads; mutables are efficient for building data incrementally.`,
            r`grid = {(0, 0): "start", (1, 2): "goal"}   # tuple keys work
print(grid[(1, 2)])
print(hash("abc") == hash("abc"))               # stable within a run

# OUTPUT:
# goal
# True`],
        [`<b>Disadvantages:</b> mutable default arguments are shared between calls; accidental aliasing causes spooky action at a distance.`,
            r`def collect(x, acc=[]):        # the [] is created ONCE at def time
    acc.append(x)
    return acc

print(collect(1))
print(collect(2))               # remembers the previous call!

# OUTPUT:
# [1]
# [1, 2]`],
        [`<b>Limitations:</b> immutability is shallow. A tuple holding a list can still change inside, and then it is not hashable.`,
            r`t = ([1], 2)
t[0].append(9)                  # allowed: the tuple still holds the same list
print(t)
try:
    hash(t)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# ([1, 9], 2)
# TypeError: unhashable type: 'list'`],
        `
   Mutable (list)                         Immutable (str / tuple)

   a ─┐                                   s ──► "hi"
      ├──► [1, 2, 3]  edit in place       t = s + "!"
   b ─┘                                   s ──► "hi"        unchanged
                                          t ──► "hi!"       new object
`,
        `Prefer immutable data (tuples, frozen dataclasses, frozenset) for values that cross function or thread boundaries; they remove a whole class of aliasing bugs. Use mutable structures locally for performance, and copy (copy.deepcopy or explicit constructors) at API boundaries.`
    ),

    'Object Identity & id()': dd(
        [`Every object has an <b>identity</b> (in CPython, its memory address) returned by <code>id()</code>. <code>is</code> compares identities, while <code>==</code> compares values.`,
            r`a = [1]
b = a              # same object
c = [1]            # equal value, different object
print(a is b, a is c, a == c)
print(id(a) == id(b), id(a) == id(c))

# OUTPUT:
# True False True
# True False`],
        [`You need identity to know whether two names share state (aliasing) and to test singletons such as None correctly.`,
            r`x = None
print(x is None)            # the correct, fast singleton test
print(x == None)            # works but linters flag it (== can be overloaded)

# OUTPUT:
# True
# True`],
        [`A sentinel object lets an API tell "argument not given" from "None was given". Libraries use this everywhere.`,
            r`_MISSING = object()          # unique object nobody else can create

def get(d, key, default=_MISSING):
    value = d.get(key, _MISSING)
    if value is _MISSING:
        if default is _MISSING:
            raise KeyError(key)
        return default
    return value

print(get({"a": None}, "a"))     # None is a real stored value
print(get({}, "x", 0))

# OUTPUT:
# None
# 0`],
        [`<b>Advantages:</b> <code>is</code> is a constant-time pointer comparison, and CPython caches small ints (-5..256) so they share identity.`,
            r`a = int("256"); b = int("256")
print(a is b)                  # True in CPython: small ints are cached
print(a == b)

# OUTPUT (CPython):
# True
# True`],
        [`<b>Disadvantages:</b> identity of equal values is an implementation detail; relying on <code>is</code> for numbers or strings gives results that vary.`,
            r`a = int("1000"); b = int("1000")
print(a == b)                  # True - compare values with ==
print(a is b)                  # usually False: two separate int objects

# OUTPUT (CPython, example):
# True
# False`],
        [`<b>Limitations:</b> an id is only unique among objects alive at the same time; once an object dies its id can be reused. It is also not portable (PyPy ids are not addresses).`,
            r`# Two temporary objects often land at the same address one after another
print(id(object()) == id(object()))

# OUTPUT (CPython, example):
# True`],
        `
   a ──┐
       ├──► ┌───────────────┐ id=0x7f10
   b ──┘    │ list [1]      │
            └───────────────┘
   c ─────► ┌───────────────┐ id=0x7f90
            │ list [1]      │
            └───────────────┘
   a is b -> True    a is c -> False    a == c -> True
`,
        `Use is only for singletons (None, True, False, sentinels, enum members); use == for everything else. Never build logic on id() values or on interning behaviour, because they change across Python versions and implementations.`
    ),

    'Arithmetic, Comparison & Assignment Operators': dd(
        [`Arithmetic operators (<code>+ - * / // % **</code>) compute values, comparison operators (<code>== != &lt; &gt; &lt;= &gt;=</code>) return bool, and assignment operators (<code>= += -= *= ...</code>) store results.`,
            r`print(7 + 2, 7 - 2, 7 * 2, 7 / 2, 7 // 2, 7 % 2, 7 ** 2)
print(7 == 7.0, 7 != 8, 3 < 5, 3 >= 5)

# OUTPUT:
# 9 5 14 3.5 3 1 49
# True True True False`],
        [`Calculations, conditions and updates are in nearly every line of code. Python adds chained comparisons so range checks read like maths.`,
            r`x = 5
print(1 < x < 10)          # chained: (1 < x) and (x < 10)
print(10 <= x <= 20)

# OUTPUT:
# True
# False`],
        [`Augmented assignment is how counters, totals and accumulators are updated in loops.`,
            r`total = 0
total += 10
total += 20
total += 5            # 35
total -= 5            # 30
total //= 4           # 7
total **= 2           # 49
total %= 10           # 9
print(total)

# OUTPUT:
# 9`],
        [`<b>Advantages:</b> chained comparisons, big-int safe arithmetic, divmod, and the walrus <code>:=</code> to assign inside an expression.`,
            r`if (n := len("hello")) > 3:       # assign and test in one step
    print("long word of", n)
q, rem = divmod(47, 5)
print(q, rem)

# OUTPUT:
# long word of 5
# 9 2`],
        [`<b>Disadvantages:</b> <code>/</code> always returns float, and floor division/modulo round toward negative infinity, which surprises people coming from C or Java.`,
            r`print(10 / 2)          # 5.0 - float even if exact
print(-7 // 2)          # -4 (floor), not -3
print(-7 % 2)           # 1  (sign follows the divisor)
print(int(-7 / 2))      # -3 (truncate) if you want C-style

# OUTPUT:
# 5.0
# -4
# 1
# -3`],
        [`<b>Limitations:</b> division by zero raises an exception, and ordering comparisons between unrelated types are not allowed.`,
            r`for expr in ("1 / 0", "3 < 'a'"):
    try:
        eval(expr)
    except (ZeroDivisionError, TypeError) as e:
        print(type(e).__name__ + ":", e)

# OUTPUT:
# ZeroDivisionError: division by zero
# TypeError: '<' not supported between instances of 'int' and 'str'`],
        `
   a  op  b                      Result
   ┌──────────────────────────────────────────────┐
   │ + - * ** // %   numbers  ─►  int / float     │
   │ /               numbers  ─►  float           │
   │ == != < > <= >= any pair ─►  bool            │
   │ += -= *= //=    update name with result      │
   └──────────────────────────────────────────────┘
   1 < x < 10   ==   (1 < x) and (x < 10)
`,
        `Use Decimal or integer cents for money, math.isclose for float comparison, and be explicit about floor vs truncating division in ported code. Overloading operators on your own classes is powerful but should keep their ordinary meaning.`
    ),

    'Logical & Bitwise Operators': dd(
        [`Logical operators <code>and or not</code> work on truth values; bitwise operators <code>&amp; | ^ ~ &lt;&lt; &gt;&gt;</code> work on the binary digits of integers.`,
            r`print(True and False, True or False, not True)
print(5 & 3, 5 | 3, 5 ^ 3)       # 101 & 011, 101 | 011, 101 ^ 011
print(~5, 5 << 1, 5 >> 1)

# OUTPUT:
# False True False
# 1 7 6
# -6 10 2`],
        [`Conditions combine with and/or/not; bitwise operators pack several yes/no options into one integer (permissions, network masks, hardware registers).`,
            r`READ, WRITE, EXEC = 1, 2, 4
perm = READ | WRITE              # combine flags
print(perm, bool(perm & EXEC))   # is EXEC set?

# OUTPUT:
# 3 False`],
        [`Permission and feature-flag handling: set, clear and test individual bits.`,
            r`READ, WRITE, EXEC = 1, 2, 4
perm = READ | WRITE
perm |= EXEC            # grant EXEC
perm &= ~WRITE          # revoke WRITE
print(perm, bin(perm))

# OUTPUT:
# 5 0b101`],
        [`<b>Advantages:</b> <code>and</code>/<code>or</code> short-circuit so the right side runs only when needed, which also guards against errors.`,
            r`def boom():
    print("called")
    return True

print(False and boom())          # boom() is never called
user = None
print(user and user.name)        # safe: no AttributeError

# OUTPUT:
# False
# None`],
        [`<b>Disadvantages:</b> <code>and</code>/<code>or</code> return one of the operands, not necessarily a bool, and <code>and</code> vs <code>&amp;</code> are easy to confuse.`,
            r`print(0 or "x")            # 'x'
print("a" and "b")          # 'b'
print([] and 1)             # []
print(1 and 2, 1 & 2)       # 2 versus 0

# OUTPUT:
# x
# b
# []
# 2 0`],
        [`<b>Limitations:</b> <code>~</code> yields negative numbers because ints have infinite two's complement; bitwise operators reject floats.`,
            r`print(~5)                  # -6
print(~5 & 0xFF)            # 250: mask to 8 bits to emulate a byte
try:
    1.5 & 1
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# -6
# 250
# TypeError: unsupported operand type(s) for &: 'float' and 'int'`],
        `
   5 = 101        and (&)   or (|)   xor (^)
   3 = 011        ───────   ──────   ───────
                  001  = 1  111 = 7  110 = 6

   x and y : y if x truthy else x   (short-circuit)
   x or  y : x if x truthy else y   (short-circuit)
`,
        `Use enum.IntFlag instead of raw bit twiddling in application code for readability and safe printing. Reserve bit operations for protocols, masks and performance-sensitive kernels, and always parenthesise mixed logical/bitwise expressions.`
    ),

    'Membership & Identity Operators': dd(
        [`<code>in</code> / <code>not in</code> test membership in a container or substring; <code>is</code> / <code>is not</code> test whether two names refer to the same object.`,
            r`print("a" in "cat", 3 not in [1, 2])
print("x" in {"x": 1})              # dicts test keys
a = None
print(a is None, a is not None)

# OUTPUT:
# True True
# True
# True False`],
        [`Checking "is this value allowed / present / missing?" is one of the most frequent operations in real code, and these operators read like English.`,
            r`allowed = {"admin", "editor"}
role = "viewer"
if role not in allowed:
    print("access denied for", role)

# OUTPUT:
# access denied for viewer`],
        [`Search filters and validation: substring checks on log lines, ban lists, and range membership.`,
            r`line = "ERROR: Disk full"
print("error" in line.lower())
print(5 in range(1, 10))              # range membership is O(1)
banned = {"spam", "scam"}
words = ["hello", "scam"]
print([w for w in words if w not in banned])

# OUTPUT:
# True
# True
# ['hello']`],
        [`<b>Advantages:</b> <code>in</code> works with every container (str, list, tuple, set, dict, range) and set/dict lookups are O(1).`,
            r`import timeit
big_list = list(range(100_000))
big_set = set(big_list)
print(timeit.timeit(lambda: 99_999 in big_list, number=200) > timeit.timeit(lambda: 99_999 in big_set, number=200))

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> on a list <code>in</code> is a linear scan, and on a dict it checks keys, not values.`,
            r`d = {"a": 1}
print(1 in d)                 # False - keys only
print(1 in d.values())        # True

# OUTPUT:
# False
# True`],
        [`<b>Limitations:</b> the right side must be a container, and membership uses identity first then equality, which makes NaN behave oddly.`,
            r`try:
    3 in 5
except TypeError as e:
    print("TypeError:", e)

n = float("nan")
print(n in [n], n == n, float("nan") in [n])

# OUTPUT:
# TypeError: argument of type 'int' is not iterable
# True False False`],
        `
   x in container ──► search ──► True / False
        list/tuple : scan one by one   O(n)
        set/dict   : hash lookup       O(1)
        str        : substring search

   a is b ──► compare id(a) == id(b) ──► True / False
`,
        `Choose the container for the query: convert repeated list lookups to a set, and use bisect on sorted data. Reserve is for None and sentinels, since identity of numbers and strings is an implementation detail.`
    ),

    'Operator Precedence': dd(
        [`<b>Precedence</b> decides which operator runs first when an expression has several. Highest to lowest: parentheses, <code>**</code>, unary signs, <code>* / // %</code>, <code>+ -</code>, shifts, <code>&amp;</code>, <code>^</code>, <code>|</code>, comparisons, <code>not</code>, <code>and</code>, <code>or</code>.`,
            r`print(2 + 3 * 4)          # * before +
print((2 + 3) * 4)        # parentheses win
print(2 ** 3 ** 2)        # ** is right-associative: 2 ** 9
print(-2 ** 2)            # ** binds tighter than unary minus

# OUTPUT:
# 14
# 20
# 512
# -4`],
        [`Without agreed rules the same line could mean different things. Knowing the order lets you read code correctly and avoid wrong results.`,
            r`print(10 - 3 - 2)         # left to right: (10-3)-2
print(not 1 == 2)         # not (1 == 2)
print(1 + 2 * 3 ** 2 // 4 % 5)

# OUTPUT:
# 5
# True
# 5`],
        [`Price, tax and discount formulas in business code; one missing parenthesis changes money amounts.`,
            r`price, tax, discount = 100, 0.2, 10
print(price + price * tax - discount)      # 110.0
print((price + price) * tax - discount)    # 30.0

# OUTPUT:
# 110.0
# 30.0`],
        [`<b>Advantages:</b> follows maths rules, and Python adds natural chained comparisons; <code>and</code> binds tighter than <code>or</code>.`,
            r`print(True or False and False)       # True or (False and False)
print((True or False) and False)     # parentheses change the answer

# OUTPUT:
# True
# False`],
        [`<b>Disadvantages:</b> readers rarely remember the whole table, so code without parentheses is error-prone.`,
            r`print("a" == "b" or "c")        # ('a'=='b') or 'c' -> 'c', always truthy!
x = 5
print(x == 4 or 6)               # beginners mean x == 4 or x == 6 -> 6 here

# OUTPUT:
# c
# 6`],
        [`<b>Limitations:</b> precedence cannot be changed, and chained comparison rules apply to <code>in</code>/<code>is</code> too, which can produce non-obvious results.`,
            r`print(1 in [1] == True)         # (1 in [1]) and ([1] == True)
print((1 in [1]) == True)        # what was intended

# OUTPUT:
# False
# True`],
        `
   tightest ┌──────────────────────────┐
            │ ( )                      │
            │ **           (right-assoc)│
            │ +x -x ~x                 │
            │ * / // %                 │
            │ + -                      │
            │ << >>   &   ^   |        │
            │ == != < > in is          │
            │ not                      │
            │ and                      │
   loosest  │ or                       │
            └──────────────────────────┘
`,
        `Optimise for the reader: add parentheses whenever more than two precedence levels are mixed, and break long expressions into named intermediate variables. A formatter (black) plus a linter will catch the worst ambiguities.`
    ),

    'String Indexing & Slicing': dd(
        [`Indexing picks one character (<code>s[i]</code>); slicing picks a range (<code>s[start:stop:step]</code>, stop excluded). Negative indexes count from the end.`,
            r`s = "Python"
print(s[0], s[-1])
print(s[1:4], s[:2], s[2:])
print(s[::2], s[::-1])

# OUTPUT:
# P n
# yth Py thon
# Pto nohtyP`],
        [`Text is full of fixed-position fields (dates, codes, prefixes). Slicing extracts them without loops or regular expressions.`,
            r`date = "2024-05-17"
year, month, day = date[:4], date[5:7], date[8:]
print(year, month, day)

# OUTPUT:
# 2024 05 17`],
        [`Masking card numbers for display, and palindrome checks via reversal.`,
            r`card = "1234567812345678"
print("*" * 12 + card[-4:])
w = "level"
print(w == w[::-1])

# OUTPUT:
# ************5678
# True`],
        [`<b>Advantages:</b> slices never raise for out-of-range bounds, and the same syntax works on lists and tuples.`,
            r`s = "Python"
print(repr(s[10:20]), s[-100:3])
print([1, 2, 3, 4][1:3], (1, 2, 3)[::-1])

# OUTPUT:
# '' Pyt
# [2, 3] (3, 2, 1)`],
        [`<b>Disadvantages:</b> a single out-of-range index raises IndexError, and the exclusive stop causes off-by-one mistakes.`,
            r`s = "abc"
print(s[0:2])                 # 'ab' - index 2 is excluded
try:
    s[3]
except IndexError as e:
    print("IndexError:", e)

# OUTPUT:
# ab
# IndexError: string index out of range`],
        [`<b>Limitations:</b> strings can't be assigned through a slice, and each slice copies the data.`,
            r`s = "Python"
try:
    s[0:2] = "Ja"
except TypeError as e:
    print("TypeError:", e)
sub = s[1:4]
print(sub is s, "J" + s[1:])   # new objects each time

# OUTPUT:
# TypeError: 'str' object does not support item assignment
# False Jython`],
        `
     P   y   t   h   o   n
   ┌───┬───┬───┬───┬───┬───┐
   │ P │ y │ t │ h │ o │ n │
   └───┴───┴───┴───┴───┴───┘
   0   1   2   3   4   5   6    slice boundaries
  -6  -5  -4  -3  -2  -1        s[1:4] = "yth"
`,
        `Slicing copies, so avoid slicing huge strings in tight loops; use memoryview/bytes buffers or indexes instead. For structured text prefer parsing (datetime.strptime, regex, csv) over magic slice offsets, which silently break when the format changes.`
    ),
};
