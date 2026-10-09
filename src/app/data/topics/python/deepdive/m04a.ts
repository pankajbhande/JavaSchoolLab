// Module 4 (Functions), part A: defining functions, arguments, scope.
import { dd, r, type DeepDive } from './deepDive';

export const m04a: Record<string, DeepDive> = {
    'Functions': dd(
        [`A <b>function</b> is a named, reusable block of code created with <code>def</code>. It may take inputs (parameters), do work, and give back a result with <code>return</code> (otherwise it returns <code>None</code>). In Python functions are <b>objects</b>: you can store and pass them around.`,
            r`def square(n):
    """Return n squared."""          # docstring = documentation
    return n * n

print(square(5))
print(type(square).__name__, square.__name__)
alias = square                       # functions are first-class objects
print(alias(6))

# OUTPUT:
# 25
# function square
# 36`],
        [`Without functions the same code is copy-pasted, bugs get fixed in some places and not others, and programs become unreadable. Functions give reuse, naming, testing and abstraction.`,
            r`# Same logic, three call sites, one definition
def to_celsius(f):
    return round((f - 32) * 5 / 9, 1)

for temp in (32, 98.6, 212):
    print(temp, "F =", to_celsius(temp), "C")

# OUTPUT:
# 32 F = 0.0 C
# 98.6 F = 37.0 C
# 212 F = 100.0 C`],
        [`Every library and API is functions: request handlers, validators, calculators, data cleaners, callbacks. Large programs are small functions composed together.`,
            r`# Real-time: small functions composed into a pipeline
def clean(text):    return text.strip().lower()
def tokenize(text): return text.split()
def count(words):   return len(words)

raw = "  Python Makes Functions Easy  "
print(count(tokenize(clean(raw))))

# OUTPUT:
# 4`],
        [`<b>Advantages:</b> reusability, easier testing, readable names for ideas, local scope isolates variables, and first-class status enables callbacks and decorators.`,
            r`# Advantage: functions can be stored in data structures
ops = {"double": lambda x: x * 2, "negate": lambda x: -x}
def apply(name, value):
    return ops[name](value)
print(apply("double", 21), apply("negate", 5))

# OUTPUT:
# 42 -5`],
        [`<b>Disadvantages:</b> each call has overhead (frame creation); too many tiny functions can obscure flow; forgetting <code>return</code> silently yields None.`,
            r`# Disadvantage: missing return gives None, not an error
def add(a, b):
    total = a + b            # computed but never returned

result = add(2, 3)
print(result)

# OUTPUT:
# None`],
        [`<b>Limitations:</b> Python has no function overloading by signature (the last definition wins), and recursion depth is limited.`,
            r`# Limitation: redefining a name replaces the old function
def area(r):
    return 3.14 * r * r
def area(w, h):              # replaces the first definition
    return w * h

print(area(3, 4))
try:
    area(2)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# 12
# TypeError: area() missing 1 required positional argument: 'h'`],
        `
   call: square(5)
           │ 5
           ▼
   ┌──────────────────────┐
   │ def square(n):       │   new local scope per call
   │     return n * n     │
   └──────────┬───────────┘
              │ 25
              ▼
        result at call site
`,
        `Design functions to do one thing, take explicit inputs and return outputs (pure when possible): they are then trivial to test and reuse. Add type hints and docstrings as the contract; avoid hidden dependencies on globals; and split a function when its name needs "and".`
    ),

    'Parameters, Arguments & Return Values': dd(
        [`<b>Parameters</b> are the names in the definition; <b>arguments</b> are the actual values passed in a call. A function can <code>return</code> one value or several (as a tuple), and returns <code>None</code> if no return runs.`,
            r`def divide(a, b):                  # a, b are PARAMETERS
    quotient = a // b
    remainder = a % b
    return quotient, remainder      # returns ONE tuple of two values

q, r = divide(17, 5)                # 17, 5 are ARGUMENTS
print(q, r)
print(divide(17, 5))

# OUTPUT:
# 3 2
# (3, 2)`],
        [`Functions need to receive data and hand results back; otherwise they could only print or change globals. Multiple return values avoid awkward output parameters.`,
            r`def stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

low, high, avg = stats([4, 8, 6])
print(low, high, avg)

# OUTPUT:
# 4 8 6.0`],
        [`Validators return a bool, parsers return structured data, queries return rows, and functions that only act (send email) return None or a status.`,
            r`# Real-time: return a status AND the data, never print inside logic
def parse_age(text):
    if not text.isdigit():
        return False, "age must be digits"
    return True, int(text)

for t in ("42", "x7"):
    ok, value = parse_age(t)
    print(ok, value)

# OUTPUT:
# True 42
# False age must be digits`],
        [`<b>Advantages:</b> arguments are passed by object reference (cheap, no big copies), many values can be returned at once, and the call site stays readable.`,
            r`# Advantage: passing a large list does not copy it
def first(items):
    return items[0]
big = list(range(5_000_000))
print(first(big))                   # instant: only a reference moves

# OUTPUT:
# 0`],
        [`<b>Disadvantages:</b> a function that mutates a mutable argument changes the caller's object (surprising side effect); rebinding a parameter does not affect the caller.`,
            r`def add_item(lst):
    lst.append("new")               # mutates the caller's list

def rebind(lst):
    lst = ["other"]                 # rebinds the LOCAL name only

data = ["a"]
add_item(data)
rebind(data)
print(data)

# OUTPUT:
# ['a', 'new']`],
        [`<b>Limitations:</b> Python has no output parameters or pass-by-value; callers must supply required arguments exactly or get TypeError; type hints are not enforced at runtime.`,
            r`def greet(name: str) -> str:
    return "Hi " + str(name)

print(greet(42))                    # hints are ignored at runtime
try:
    greet()
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# Hi 42
# TypeError: greet() missing 1 required positional argument: 'name'`],
        `
   caller                         function
   total = f(10, 20) ───────────► def f(a, b):    <- parameters
              arguments  10,20 ──►     a=10, b=20
                                       ...
   total  ◄──────────────────────  return a + b   <- return value
`,
        `Prefer returning values over mutating arguments; if mutation is intended, name it clearly (<code>sort_in_place</code>) and document it. Return a dataclass or NamedTuple instead of long tuples, and use type hints plus mypy/pyright since runtime does not check them.`
    ),

    'Default, Keyword & Positional Arguments': dd(
        [`<b>Positional</b> arguments are matched by order, <b>keyword</b> arguments by name, and <b>default</b> values fill in omitted parameters. The <code>/</code> marker makes earlier parameters positional-only; <code>*</code> makes later ones keyword-only.`,
            r`def order(item, qty=1, *, express=False):
    return f"{qty} x {item} express={express}"

print(order("pen"))                       # default qty
print(order("pen", 3))                    # positional
print(order(qty=2, item="book"))          # keyword, any order
print(order("book", 1, express=True))     # keyword-only after *

# OUTPUT:
# 1 x pen express=False
# 3 x pen express=False
# 2 x book express=False
# 1 x book express=True`],
        [`Defaults make common calls short while keeping power available; keywords make calls self-documenting (<code>connect(timeout=5)</code> beats <code>connect(5)</code>) and let APIs grow without breaking callers.`,
            r`def connect(host, port=5432, timeout=10, ssl=True):
    return f"{host}:{port} t={timeout} ssl={ssl}"

print(connect("db1"))
print(connect("db1", timeout=3))          # change only what you need

# OUTPUT:
# db1:5432 t=10 ssl=True
# db1:5432 t=3 ssl=True`],
        [`Library APIs (<code>open</code>, <code>print(sep=, end=)</code>, <code>requests.get(url, timeout=)</code>) are built this way. Keyword-only flags prevent mistakes like <code>f(True, False)</code>.`,
            r`# Real-time: print uses keyword-only options
print("a", "b", "c", sep="-", end="!\n")
help_text = sorted([3, 1, 2], reverse=True)    # reverse is keyword-only
print(help_text)

# OUTPUT:
# a-b-c!
# [3, 2, 1]`],
        [`<b>Advantages:</b> backward-compatible API growth (add a new defaulted parameter), clear calls, fewer overloads needed.`,
            r`# Advantage: v2 adds a parameter; old calls still work
def send(msg, retries=0):        # retries added later with a default
    return f"{msg} (retries={retries})"
print(send("hello"))
print(send("hello", retries=3))

# OUTPUT:
# hello (retries=0)
# hello (retries=3)`],
        [`<b>Disadvantages:</b> the notorious <b>mutable default</b> trap: the default object is created once and shared by every call.`,
            r`def add(item, bucket=[]):          # BUG: one shared list
    bucket.append(item)
    return bucket

print(add(1))
print(add(2))                       # remembers the previous call!

def add_ok(item, bucket=None):      # fix: use None as the sentinel
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
print(add_ok(1), add_ok(2))

# OUTPUT:
# [1]
# [1, 2]
# [1] [2]`],
        [`<b>Limitations:</b> positional arguments cannot follow keyword arguments in a call; non-default parameters cannot follow default ones in a definition; each parameter may be given only once.`,
            r`def f(a, b=2):
    return a + b

try:
    f(1, a=5)                       # 'a' already given positionally
except TypeError as e:
    print("TypeError:", e)
try:
    compile("def g(a=1, b): pass", "d", "exec")
except SyntaxError as e:
    print("SyntaxError:", e.msg)

# OUTPUT:
# TypeError: f() got multiple values for argument 'a'
# SyntaxError: non-default argument follows default argument`],
        `
   def f(a, b, /, c, d=4, *, e=5):
          │  │   │  │     │
   positional  positional   keyword
   only        or keyword   only

   f(1, 2, 3, e=9) ──► a=1 b=2 c=3 d=4(default) e=9
`,
        `Treat parameter lists as public API: add new options as keyword-only with defaults so callers never break. Use <code>None</code> (or <code>dataclasses.field(default_factory=...)</code>) for mutable defaults, and avoid more than about five parameters: group them into a config object.`
    ),

    '*args & **kwargs': dd(
        [`<code>*args</code> collects extra <b>positional</b> arguments into a tuple; <code>**kwargs</code> collects extra <b>keyword</b> arguments into a dict. At call sites, <code>*</code> and <code>**</code> unpack sequences and dicts into arguments.`,
            r`def show(*args, **kwargs):
    print("args  :", args)
    print("kwargs:", kwargs)

show(1, 2, 3, name="Asha", age=30)
nums = [10, 20]
opts = {"sep": " | "}
print(*nums, **opts)                # unpack at the call site

# OUTPUT:
# args  : (1, 2, 3)
# kwargs: {'name': 'Asha', 'age': 30}
# 10 | 20`],
        [`Sometimes a function must accept any number of inputs (<code>sum</code>-like, <code>print</code>-like) or forward whatever it receives to another function without knowing the details.`,
            r`def total(*numbers):
    return sum(numbers)

print(total(1, 2), total(1, 2, 3, 4), total())

# OUTPUT:
# 3 10 0`],
        [`Decorators, wrappers, logging helpers, subclass constructors (<code>super().__init__(*args, **kwargs)</code>) and plugin APIs all forward arguments transparently.`,
            r`# Real-time: a timing/logging wrapper that works for ANY function
def logged(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__, args, kwargs)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b=0):
    return a + b

print(add(2, b=5))

# OUTPUT:
# calling add (2,) {'b': 5}
# 7`],
        [`<b>Advantages:</b> flexible APIs, transparent forwarding, and backward compatibility when wrapping other functions.`,
            r`# Advantage: merge options in one call
def make_tag(name, **attrs):
    parts = " ".join(f'{k}="{v}"' for k, v in attrs.items())
    return f"<{name} {parts}>"

print(make_tag("a", href="/home", cls="nav"))

# OUTPUT:
# <a href="/home" cls="nav">`],
        [`<b>Disadvantages:</b> the signature no longer documents the real parameters, typos in keyword names go unnoticed, and IDE help is poorer.`,
            r`# Disadvantage: a typo is silently accepted into kwargs
def connect(**options):
    return options.get("timeout", 10)

print(connect(timeot=1))             # typo ignored => default used

# OUTPUT:
# 10`],
        [`<b>Limitations:</b> order rules are strict (positional, <code>*args</code>, keyword-only, <code>**kwargs</code>); <code>**kwargs</code> keys must be strings; <code>*args</code> is a tuple, so it cannot be changed.`,
            r`def f(*args):
    return args

a = f(1, 2)
try:
    a.append(3)                      # args is an immutable tuple
except AttributeError as e:
    print("AttributeError:", e)
try:
    compile("def g(**kw, *a): pass", "d", "exec")
except SyntaxError:
    print("SyntaxError: *args must come before **kwargs")

# OUTPUT:
# AttributeError: 'tuple' object has no attribute 'append'
# SyntaxError: *args must come before **kwargs`],
        `
   show(1, 2, 3, a=9, b=8)
        │  │  │   └────┴──► **kwargs = {'a': 9, 'b': 8}   (dict)
        └──┴──┴──────────► *args   = (1, 2, 3)             (tuple)

   caller side:  f(*[1, 2], **{'a': 9})   unpack back out
`,
        `*args/**kwargs are essential for decorators and adapters but are a maintainability cost in business logic. Prefer explicit parameters (checked by tools and readable), keep <code>**kwargs</code> for pass-through, and use <code>functools.wraps</code> plus <code>ParamSpec</code> typing in wrappers.`
    ),

    'Scope: Local & Global Variables': dd(
        [`<b>Scope</b> decides where a name is visible. Python looks up names using <b>LEGB</b>: Local, Enclosing (outer function), Global (module), Built-in. Assigning inside a function creates a <b>local</b> variable by default.`,
            r`x = "global"
def show():
    x = "local"                  # new local; does NOT change the global
    print("inside :", x)

show()
print("outside:", x)

# OUTPUT:
# inside : local
# outside: global`],
        [`Scope keeps functions independent: a variable named <code>i</code> or <code>total</code> in one function cannot clobber another's. Understanding LEGB prevents shadowing bugs and UnboundLocalError.`,
            r`# Reading a global works; assigning needs a declaration
count = 0
def read():
    return count + 1             # reading: fine
def broken():
    try:
        count = count + 1        # assignment makes count LOCAL, read fails
    except UnboundLocalError as e:
        return "UnboundLocalError"
print(read(), broken())

# OUTPUT:
# 1 UnboundLocalError`],
        [`Module-level constants (<code>TAX = 0.18</code>) are read everywhere; function locals hold temporary results; closures capture enclosing variables for callbacks and factories.`,
            r`# Real-time: closure captures the enclosing variable
def make_multiplier(factor):
    def multiply(n):
        return n * factor        # 'factor' found in the Enclosing scope
    return multiply

triple = make_multiplier(3)
print(triple(7), triple(10))

# OUTPUT:
# 21 30`],
        [`<b>Advantages:</b> locals are fast (array slots, no dict lookup), isolated, garbage-collected on return; LEGB is simple and predictable.`,
            r`# Advantage: each call gets fresh locals (safe for recursion/threads)
def counter_demo():
    n = 0
    n += 1
    return n
print(counter_demo(), counter_demo())     # no leftover state

# OUTPUT:
# 1 1`],
        [`<b>Disadvantages:</b> shadowing a built-in name (<code>list</code>, <code>sum</code>, <code>id</code>) breaks later code; loop variables leak out of loops; globals make code hard to test.`,
            r`# Disadvantage: shadowing a built-in
numbers = [1, 2, 3]
list = [9, 9]                    # oops: hides the built-in list()
try:
    list("abc")
except TypeError as e:
    print("TypeError:", e)
del list                         # remove the shadow, built-in is visible again
print(list("abc"))

# OUTPUT:
# TypeError: 'list' object is not callable
# ['a', 'b', 'c']`],
        [`<b>Limitations:</b> no block scope: variables created inside <code>if</code>/<code>for</code>/<code>while</code> are visible after them; only functions, classes and modules (and comprehensions) create scopes.`,
            r`if True:
    inner = "visible after the if"
for k in range(3):
    pass
print(inner, k)
print([j for j in range(3)])
try:
    print(j)                     # comprehension variable does NOT leak
except NameError as e:
    print("NameError:", e)

# OUTPUT:
# visible after the if 2
# [0, 1, 2]
# NameError: name 'j' is not defined`],
        `
   name lookup order (LEGB):

   ┌─────────────────────────────┐
   │ 1. Local      (current def) │  n
   └──────────────┬──────────────┘
                  ▼ not found
   ┌─────────────────────────────┐
   │ 2. Enclosing  (outer def)   │  factor
   └──────────────┬──────────────┘
                  ▼ not found
   ┌─────────────────────────────┐
   │ 3. Global     (module)      │  TAX = 0.18
   └──────────────┬──────────────┘
                  ▼ not found
   ┌─────────────────────────────┐
   │ 4. Built-in                 │  len, print, list
   └─────────────────────────────┘  else NameError
`,
        `Prefer parameters and return values to shared state. Keep module globals to constants, configuration objects and singletons, and never to mutable state that functions silently rewrite. Linters (ruff, pylint) flag shadowed built-ins and unused globals.`
    ),

    'global & nonlocal': dd(
        [`<code>global name</code> lets a function <b>rebind</b> a module-level variable. <code>nonlocal name</code> lets a nested function rebind a variable of the nearest enclosing function (not module level).`,
            r`counter = 0
def bump():
    global counter               # without this, counter += 1 would be an error
    counter += 1

bump(); bump()
print(counter)

def outer():
    n = 0
    def inner():
        nonlocal n               # rebind outer's n
        n += 1
    inner(); inner()
    return n
print(outer())

# OUTPUT:
# 2
# 2`],
        [`Assignment inside a function normally creates a local, so without these keywords you cannot update outer state. They are the escape hatch for counters, caches and closures that remember state.`,
            r`# Closure with state: a counter factory
def make_counter():
    count = 0
    def next_value():
        nonlocal count
        count += 1
        return count
    return next_value

a, b = make_counter(), make_counter()
print(a(), a(), a(), b())          # each counter has its own state

# OUTPUT:
# 1 2 3 1`],
        [`Loggers and caches use module globals; decorators like "count calls" or "remember last result" use nonlocal for per-function state.`,
            r`# Real-time: decorator that counts calls using nonlocal
def count_calls(func):
    calls = 0
    def wrapper(*a, **kw):
        nonlocal calls
        calls += 1
        print(f"{func.__name__} call #{calls}")
        return func(*a, **kw)
    return wrapper

@count_calls
def ping(): return "pong"
ping(); ping()

# OUTPUT:
# ping call #1
# ping call #2`],
        [`<b>Advantages:</b> explicit and visible: one line says "this function modifies outer state"; <code>nonlocal</code> gives lightweight private state without a class.`,
            r`# Advantage: private state, impossible to touch from outside
def make_account(balance):
    def deposit(x):
        nonlocal balance
        balance += x
        return balance
    return deposit

dep = make_account(100)
print(dep(50), dep(25))

# OUTPUT:
# 150 175`],
        [`<b>Disadvantages:</b> <code>global</code> creates hidden coupling and makes testing and threading hard; overuse signals a design that should be a class.`,
            r`# Disadvantage: hidden coupling - result depends on call history
total = 0
def add(n):
    global total
    total += n
    return total

print(add(5))
print(add(5))                      # same call, different answer

# OUTPUT:
# 5
# 10`],
        [`<b>Limitations:</b> <code>nonlocal</code> needs an existing enclosing variable (SyntaxError otherwise); neither keyword is needed for mutating (not rebinding) a list or dict; the name cannot be a parameter of the same function.`,
            r`# Limitation: nonlocal needs an enclosing function variable
try:
    compile("def f():\n    nonlocal x\n    x = 1", "d", "exec")
except SyntaxError as e:
    print("SyntaxError:", e.msg)

items = []
def add_item():
    items.append(1)                # mutation: no global needed
add_item()
print(items)

# OUTPUT:
# SyntaxError: no binding for nonlocal 'x' found
# [1]`],
        `
   x = 0   (module)
   def outer():
       y = 0          (enclosing)
       def inner():
           global x   ──────► rebinds module x
           nonlocal y ──────► rebinds outer's y
           z = 1      ──────► new local
`,
        `Reach for a class or a dataclass when state is shared, and for dependency injection when a function needs configuration. Use <code>nonlocal</code> only for small closures (decorators, counters); module-level <code>global</code> mutation is a thread-safety and testing hazard.`
    ),
};
