// Module 13 (Decorators): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m13a: Record<string, DeepDive> = {
    'Functions as Objects': dd(
        [`In Python a function is a <b>first-class object</b>: it can be assigned to a variable, stored in a list or dict, passed as an argument and returned from another function. The name is just a reference to a function object.`,
            r`def greet(name):
    return f"Hello, {name}"

hello = greet                  # a second name for the SAME object
print(hello("Ann"), hello is greet)
print(type(greet).__name__, greet.__name__)

# OUTPUT:
# Hello, Ann True
# function greet`],
        [`Treating behaviour as data is what makes callbacks, strategies, dispatch tables and decorators possible. Without it you would need long if/elif chains and classes for every variation.`,
            r`def add(a, b): return a + b
def sub(a, b): return a - b

ops = {"+": add, "-": sub}      # dispatch table instead of if/elif
print(ops["+"](5, 3), ops["-"](5, 3))

# OUTPUT:
# 8 2`],
        [`Sorting with a key function, event handlers, plugin registries, command routers in web frameworks, and higher-order helpers like <code>map</code> and <code>filter</code>.`,
            r`people = [("Zed", 30), ("Amy", 25), ("Baji", 35)]
print(sorted(people, key=lambda p: p[1]))     # function passed as an argument

def apply(fn, value):                         # higher-order function
    return fn(value)
print(apply(str.upper, "abc"))

# OUTPUT:
# [('Amy', 25), ('Zed', 30), ('Baji', 35)]
# ABC`],
        [`<b>Advantages:</b> flexible, composable code; behaviour can be chosen at runtime; functions carry useful metadata and can even hold attributes.`,
            r`def work(): pass
work.calls = 0                 # functions are objects: attach attributes
work.calls += 1
print(work.calls, work.__name__, work.__doc__)

# OUTPUT:
# 1 work None`],
        [`<b>Disadvantages:</b> indirection makes control flow harder to follow; anonymous lambdas give poor tracebacks; typing callables correctly takes extra effort.`,
            r`def named(x): return x
handlers = [lambda x: x, named]
print([h.__name__ for h in handlers])      # tracebacks show <lambda>: hard to identify

# OUTPUT:
# ['<lambda>', 'named']`],
        [`<b>Limitations:</b> lambdas are a single expression (no statements); functions cannot be compared for behavioural equality, only identity.`,
            r`f = lambda x: x + 1
g = lambda x: x + 1
print(f == g, f is f)          # same behaviour, still not equal

# OUTPUT:
# False True`],
        `
   name 'greet' ──► ┌──────── function object ────────┐
   name 'hello' ──► │ __name__  = 'greet'             │
                    │ __code__  = bytecode            │
                    │ __doc__, __dict__, __closure__  │
                    └─────────────────────────────────┘
   can be: stored in list/dict | passed in | returned | called with ()
`,
        `First-class functions are the cheapest strategy pattern. Keep dispatch tables explicit and typed (<code>Callable[[int, int], int]</code>). If a callback needs state and several operations, use a class or Protocol instead of loose lambdas.`
    ),

    'Nested Functions': dd(
        [`A <b>nested (inner) function</b> is defined inside another function. It is created each time the outer function runs and can read the outer function's variables. Returning it produces a closure.`,
            r`def outer(msg):
    def inner():
        print("inner says:", msg)    # reads outer's variable
    inner()                          # callable only inside outer

outer("hi")

# OUTPUT:
# inner says: hi`],
        [`Nested functions hide helpers that only make sense inside one function, avoid polluting the module namespace, and are the building block of function factories and decorators.`,
            r`def validate(email):
    def has_at():       return "@" in email
    def has_dot():      return "." in email.split("@")[-1]
    return has_at() and has_dot()

print(validate("a@b.com"), validate("nope"))

# OUTPUT:
# True False`],
        [`Wrapper functions inside decorators, recursive helpers that carry extra parameters, and factories that create configured functions.`,
            r`def power_factory(exp):
    def power(base):
        return base ** exp
    return power

square, cube = power_factory(2), power_factory(3)
print(square(4), cube(2))

# OUTPUT:
# 16 8`],
        [`<b>Advantages:</b> encapsulation, tiny scope, access to outer state without passing it around.`,
            r`def count_words(text):
    def clean(w):
        return w.strip(".,!?").lower()    # helper used only here
    return len({clean(w) for w in text.split()})

print(count_words("Hi, hi! Hello."))

# OUTPUT:
# 2`],
        [`<b>Disadvantages:</b> the inner function is rebuilt on every outer call (small cost), and it cannot be unit-tested directly because it is not importable.`,
            r`def outer():
    def inner(): pass
    return inner

print(outer() is outer())     # a new function object each call

# OUTPUT:
# False`],
        [`<b>Limitations:</b> inner functions cannot assign to outer variables without <code>nonlocal</code>, and they are not picklable, which blocks use with multiprocessing.`,
            r`def outer():
    x = 1
    def inner():
        x = 2          # creates a NEW local x; outer's x unchanged
    inner()
    return x
print(outer())

# OUTPUT:
# 1`],
        `
   def outer(arg):
   ┌────────────────────────────┐
   │ local vars, arg            │
   │  def inner():              │
   │  ┌──────────────────────┐  │
   │  │ sees outer's names   │  │
   │  └──────────────────────┘  │
   │  return inner  ──► closure │
   └────────────────────────────┘
`,
        `Use nested functions for small private helpers and factories. Extract to module level (or a class) when the helper needs tests, is reused, or must be pickled (multiprocessing, task queues).`
    ),

    'Writing a Decorator': dd(
        [`A <b>decorator</b> is a function that takes a function and returns a new function that wraps it, adding behaviour before or after the call without changing the original code.`,
            r`def shout(func):
    def wrapper(*args, **kwargs):          # accept any arguments
        result = func(*args, **kwargs)     # call the original
        return result.upper()              # add behaviour
    return wrapper

def greet(name): return f"hello {name}"
greet = shout(greet)                       # manual decoration
print(greet("ann"))

# OUTPUT:
# HELLO ANN`],
        [`Cross-cutting concerns (logging, timing, caching, auth, retries) would otherwise be copy-pasted into every function. A decorator writes the logic once and applies it everywhere.`,
            r`import time
def timed(func):
    def wrapper(*args, **kwargs):
        t = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - t:.3f}s")
        return result
    return wrapper

def work(): time.sleep(0.1); return "done"
work = timed(work)
print(work())

# OUTPUT (time varies):
# work took 0.100s
# done`],
        [`Web frameworks (Flask routes, login_required), caching (<code>lru_cache</code>), retry/backoff for network calls, permission checks, metrics and tracing.`,
            r`def retry(func):
    def wrapper(*args, **kwargs):
        for attempt in (1, 2, 3):
            try:
                return func(*args, **kwargs)
            except ConnectionError:
                print("retry", attempt)
        raise ConnectionError("gave up")
    return wrapper

calls = {"n": 0}
def flaky():
    calls["n"] += 1
    if calls["n"] < 3: raise ConnectionError
    return "ok"
print(retry(flaky)())

# OUTPUT:
# retry 1
# retry 2
# ok`],
        [`<b>Advantages:</b> DRY, separates concerns, reusable on any function, and the original function stays unchanged and focused.`,
            r`def log_call(func):
    def wrapper(*a, **k):
        print("calling", func.__name__, a)
        return func(*a, **k)
    return wrapper

def add(x, y): return x + y
add = log_call(add)
print(add(2, 3))

# OUTPUT:
# calling add (2, 3)
# 5`],
        [`<b>Disadvantages:</b> the wrapper replaces the original: name, docstring and signature are lost unless you use <code>functools.wraps</code>, and stacked decorators make tracebacks deeper.`,
            r`def deco(func):
    def wrapper(*a, **k): return func(*a, **k)
    return wrapper

@deco
def add(x, y):
    """Add two numbers."""
    return x + y

print(add.__name__, add.__doc__)     # metadata of wrapper, not add

# OUTPUT:
# wrapper None`],
        [`<b>Limitations:</b> a plain decorator cannot take its own arguments (needs one more nesting level), and it cannot easily change how the function is <i>defined</i> (only how it is called).`,
            r`def deco(func):
    return func

try:
    @deco(3)            # deco(3) calls deco with 3, then tries to decorate with the result
    def f(): pass
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: 'int' object is not callable`],
        `
   caller ──► name 'work' ──► ┌─────────── wrapper ───────────┐
                              │ before ...                    │
                              │   ┌──► original work() ──┐    │
                              │   │                      ▼    │
                              │ after ... ◄──── result ───┘   │
                              └───────────────────────────────┘
`,
        `Decorators are great for orthogonal concerns, poor for core business logic that readers must see. Keep them thin, side-effect free at import time, and always preserve metadata. Prefer explicit middleware or context managers when behaviour needs ordering control.`
    ),

    'The @decorator Syntax': dd(
        [`<code>@decorator</code> placed above a <code>def</code> is shorthand for <code>func = decorator(func)</code>. Multiple decorators stack and apply from the bottom (closest to the function) upward.`,
            r`def bold(f):
    return lambda *a: "<b>" + f(*a) + "</b>"

@bold                          # same as: hello = bold(hello)
def hello(n): return "hi " + n

print(hello("Ann"))

# OUTPUT:
# <b>hi Ann</b>`],
        [`The manual form is easy to forget or misplace. The @ line sits right next to the definition, so a reader sees the extra behaviour immediately.`,
            r`def tag(name):
    def deco(f):
        return lambda *a: f"<{name}>" + f(*a) + f"</{name}>"
    return deco

@tag("i")
@tag("b")                       # applied first (closest), then i
def word(w): return w

print(word("x"))

# OUTPUT:
# <i><b>x</b></i>`],
        [`Flask <code>@app.route("/")</code>, pytest <code>@pytest.fixture</code>, <code>@staticmethod</code>, <code>@property</code>, <code>@dataclass</code>, <code>@functools.lru_cache</code>.`,
            r`from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
print(fib.cache_info().hits > 0)

# OUTPUT:
# 23416728348467685
# True`],
        [`<b>Advantages:</b> declarative and readable; decorators can register functions (plugins, routes) at definition time.`,
            r`REGISTRY = {}
def register(f):
    REGISTRY[f.__name__] = f      # side effect at definition time
    return f                      # return the original untouched

@register
def start(): return "starting"
@register
def stop(): return "stopping"

print(sorted(REGISTRY), REGISTRY["stop"]())

# OUTPUT:
# ['start', 'stop'] stopping`],
        [`<b>Disadvantages:</b> order matters and is easy to get wrong; decorators run at import time, so heavy work or errors there break the whole module load.`,
            r`def noisy(f):
    print("decorating", f.__name__)   # runs when the module is imported!
    return f

@noisy
def task(): pass
print("module loaded")

# OUTPUT:
# decorating task
# module loaded`],
        [`<b>Limitations:</b> before Python 3.9 the decorator had to be a simple dotted name or call; in 3.9+ (PEP 614) any expression is allowed. Decorators apply to functions and classes, not to single statements.`,
            r`buttons = {"ok": lambda f: f}

@buttons["ok"]               # arbitrary expression: needs Python 3.9+
def click(): return "clicked"
print(click())

# OUTPUT:
# clicked`],
        `
   @a
   @b          is the same as        f = a(b(c(f)))
   @c                                 apply order: c, then b, then a
   def f(): ...                       call order at runtime: a ► b ► c ► f
`,
        `Keep the stack short (2-3) and document ordering. Put registration decorators outermost and behaviour decorators (cache, retry) in a deliberate order: caching a retried call is not the same as retrying a cached call.`
    ),

    'Decorators with Arguments': dd(
        [`A decorator that takes arguments needs <b>three levels</b>: an outer function receiving the arguments, which returns the real decorator, which returns the wrapper. <code>@repeat(3)</code> means <code>repeat(3)(func)</code>.`,
            r`def repeat(times):                 # level 1: arguments
    def decorator(func):            # level 2: the function
        def wrapper(*a, **k):       # level 3: the call
            for _ in range(times):
                result = func(*a, **k)
            return result
        return wrapper
    return decorator

@repeat(3)
def hi(): print("hi")
hi()

# OUTPUT:
# hi
# hi
# hi`],
        [`Real behaviour is configurable: retry count, cache size, required role, log level. One parameterised decorator replaces many near-identical copies.`,
            r`def require_role(role):
    def decorator(func):
        def wrapper(user, *a, **k):
            if role not in user["roles"]:
                raise PermissionError(f"{role} required")
            return func(user, *a, **k)
        return wrapper
    return decorator

@require_role("admin")
def delete_all(user): return "deleted"

print(delete_all({"roles": ["admin"]}))
try:
    delete_all({"roles": ["guest"]})
except PermissionError as e:
    print("PermissionError:", e)

# OUTPUT:
# deleted
# PermissionError: admin required`],
        [`Retry with backoff, rate limiting, cache TTL, role/permission checks, HTTP route declarations such as <code>@app.get("/users")</code>.`,
            r`import functools
def retry(times, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*a, **k):
            for n in range(1, times + 1):
                try:
                    return func(*a, **k)
                except exceptions as e:
                    print(f"attempt {n} failed: {e}")
                    if n == times: raise
        return wrapper
    return decorator

state = {"n": 0}
@retry(3, (ValueError,))
def parse():
    state["n"] += 1
    if state["n"] < 3: raise ValueError("bad")
    return "parsed"
print(parse())

# OUTPUT:
# attempt 1 failed: bad
# attempt 2 failed: bad
# parsed`],
        [`<b>Advantages:</b> highly configurable and reusable; arguments are fixed once at decoration time, with no per-call cost.`,
            r`def tag(label):
    def deco(f):
        f.label = label            # store config on the function
        return f
    return deco

@tag("slow")
def job(): pass
print(job.label)

# OUTPUT:
# slow`],
        [`<b>Disadvantages:</b> three nested levels are hard to read, and forgetting the parentheses (<code>@repeat</code> instead of <code>@repeat(3)</code>) causes confusing errors.`,
            r`def repeat(times):
    def decorator(func):
        return func
    return decorator

@repeat                  # missing (): 'times' receives the function
def f(): return 1

print(f)                 # f is now the inner 'decorator' function, not our function
print(f.__name__)

# OUTPUT (address varies):
# <function repeat.<locals>.decorator at 0x000001F2A3B4C5D0>
# decorator`],
        [`<b>Limitations:</b> supporting both <code>@deco</code> and <code>@deco(arg)</code> needs extra code; and arguments are evaluated once at import, so they cannot depend on runtime state of each call.`,
            r`import functools
def deco(_func=None, *, level="info"):    # works with or without parentheses
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*a, **k):
            print(level, func.__name__)
            return func(*a, **k)
        return wrapper
    return decorator(_func) if _func else decorator

@deco
def a(): pass
@deco(level="warn")
def b(): pass
a(); b()

# OUTPUT:
# info a
# warn b`],
        `
   @repeat(3)  ──►  repeat(3)  ──►  decorator  ──(func)──►  wrapper
                    level 1        level 2                 level 3
                    keeps 3        keeps func              runs on each call
`,
        `For configurable decorators consider a class with <code>__call__</code> (clear state, easier typing) or <code>functools.partial</code>. Type them with <code>ParamSpec</code> so the wrapped signature survives for IDEs and mypy.`
    ),

    'functools.wraps': dd(
        [`<code>functools.wraps(func)</code> is a decorator for your wrapper that copies the original function's <code>__name__</code>, <code>__doc__</code>, <code>__module__</code>, annotations and <code>__dict__</code>, and sets <code>__wrapped__</code> so the original can be reached.`,
            r`import functools
def deco(func):
    @functools.wraps(func)          # copy metadata onto wrapper
    def wrapper(*a, **k):
        return func(*a, **k)
    return wrapper

@deco
def add(x, y):
    """Add two numbers."""
    return x + y

print(add.__name__, "|", add.__doc__)
print(add.__wrapped__ is not None)

# OUTPUT:
# add | Add two numbers.
# True`],
        [`Without it, every decorated function is called "wrapper": help(), logging, debuggers, documentation tools, pytest and Flask (which uses names for routes) all misbehave.`,
            r`# Frameworks (e.g. Flask) key routes on function names
def bad(f):
    def wrapper(*a, **k): return f(*a, **k)
    return wrapper

@bad
def index(): pass
@bad
def about(): pass
print(index.__name__ == about.__name__)    # both are "wrapper": name clash

# OUTPUT:
# True`],
        [`Every serious decorator uses it: <code>lru_cache</code>, Flask's <code>login_required</code>, Django's <code>@login_required</code>, and timing/logging utilities.`,
            r`import functools, inspect
def logged(f):
    @functools.wraps(f)
    def w(*a, **k): return f(*a, **k)
    return w

@logged
def area(w: int, h: int = 2) -> int: return w * h

print(inspect.signature(area))        # follows __wrapped__ to the real signature

# OUTPUT:
# (w: int, h: int = 2) -> int`],
        [`<b>Advantages:</b> one line preserves identity, docs and signatures; <code>__wrapped__</code> lets tools and tests unwrap to the raw function.`,
            r`import functools
def deco(f):
    @functools.wraps(f)
    def w(*a, **k): return f(*a, **k)
    return w

@deco
def secret(): return "raw"
print(secret.__wrapped__())         # bypass the decorator in tests

# OUTPUT:
# raw`],
        [`<b>Disadvantages:</b> it is easy to forget, and nothing fails visibly when you do. Copying <code>__dict__</code> can also leak attributes between layers.`,
            r`def nowraps(f):
    def w(*a, **k): return f(*a, **k)
    return w

@nowraps
def compute():
    """Important docs."""
print(compute.__doc__)       # silently lost

# OUTPUT:
# None`],
        [`<b>Limitations:</b> it copies metadata but not behaviour: the wrapper's real signature is still <code>(*args, **kwargs)</code> at runtime, and <code>isinstance</code> or identity checks against the original function fail.`,
            r`import functools
def deco(f):
    @functools.wraps(f)
    def w(*a, **k): return f(*a, **k)
    return w

def plain(): pass
wrapped = deco(plain)
print(wrapped is plain, wrapped.__code__ is plain.__code__)

# OUTPUT:
# False False`],
        `
   original f ──► ┌ wrapper ┐   @wraps copies:  __name__  __doc__
                  │ (*a,**k)│                   __module__ __annotations__
                  └─────────┘   and sets:       __wrapped__ ─► original f
   help(wrapper) / inspect.signature(wrapper)  now describe f
`,
        `Make <code>@wraps</code> part of your decorator template and enforce it by code review or a lint rule. For precise typing use <code>ParamSpec</code> and <code>TypeVar</code>, or the <code>wrapt</code> library for decorators that behave correctly on methods and classes.`
    ),
};
