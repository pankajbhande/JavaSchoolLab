// Module 12 (Closures): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m12a: Record<string, DeepDive> = {
    'What is a Closure?': dd(
        [`A <b>closure</b> is an inner function that remembers variables from the enclosing function even after that outer function has returned. The function object carries its captured variables with it.`,
            r`def make_multiplier(factor):
    def multiply(x):
        return x * factor      # 'factor' belongs to make_multiplier
    return multiply            # return the function itself, not a call

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))    # each remembers its own factor

# OUTPUT:
# 10 15`],
        [`Closures let you build specialised functions from a general one and keep private state without writing a class. They are the foundation of decorators and callbacks.`,
            r`def counter():
    count = 0
    def tick():
        nonlocal count
        count += 1
        return count
    return tick

a, b = counter(), counter()    # two independent private counters
print(a(), a(), b())

# OUTPUT:
# 1 2 1`],
        [`Used for event handlers with preset arguments, configuration factories, memoisation caches, retry/logging decorators and lightweight "private" state in callbacks.`,
            r`def make_logger(prefix):
    def log(msg):
        print(f"[{prefix}] {msg}")
    return log

db_log = make_logger("DB")
api_log = make_logger("API")
db_log("connected")
api_log("request received")

# OUTPUT:
# [DB] connected
# [API] request received`],
        [`<b>Advantages:</b> real data hiding, no class boilerplate, functions "pre-configured" with data, cheap and fast.`,
            r`def make_account(balance):
    def deposit(n):
        nonlocal balance
        balance += n
        return balance
    return deposit

dep = make_account(100)
print(dep(50))
print(hasattr(dep, "balance"))   # balance cannot be reached from outside

# OUTPUT:
# 150
# False`],
        [`<b>Disadvantages:</b> hidden state is harder to debug and test than an object with attributes, and captured variables keep objects alive (memory retention).`,
            r`import gc, weakref
class Big: pass

def keep():
    big = Big()
    keep.ref = weakref.ref(big)
    return lambda: big        # closure holds a reference to big

fn = keep()                   # keep() has returned, yet big survives
ref = keep.ref
gc.collect()
print("still alive:", ref() is not None)   # the closure keeps it alive

# OUTPUT:
# still alive: True`],
        [`<b>Limitations:</b> a closure can read outer variables freely but cannot rebind them without <code>nonlocal</code>; it is not picklable if it is a nested function.`,
            r`import pickle
def outer():
    def inner(): return 1
    return inner
try:
    pickle.dumps(outer())
except (AttributeError, pickle.PicklingError) as e:
    print("cannot pickle a nested function")

# OUTPUT:
# cannot pickle a nested function`],
        `
   make_multiplier(2)  returns ──►  ┌──────── function 'multiply' ────────┐
                                    │ code:  return x * factor           │
                                    │ __closure__: [ cell(factor = 2) ]  │
                                    └────────────────────────────────────┘
   The cell lives as long as the function object lives.
`,
        `Use a closure for one small piece of state or behaviour; switch to a class when state grows, needs several methods, inspection, pickling or inheritance. Remember that closures can hold large objects alive, a real source of leaks in long-running services.`
    ),

    'Lexical Scope': dd(
        [`<b>Lexical (static) scope</b> means a name is resolved by where the code is written, not where it is called. Python looks up names by the LEGB rule: Local, Enclosing, Global, Built-in.`,
            r`x = "global"
def outer():
    x = "enclosing"
    def inner():
        return x          # found in the enclosing scope (E), before global (G)
    return inner

print(outer()())

# OUTPUT:
# enclosing`],
        [`Predictable name lookup lets you read a function in isolation, and is exactly what makes closures possible: the inner function resolves names in its defining scope.`,
            r`x = "global"
def show():
    return x              # looks where it was DEFINED (module), not the caller

def caller():
    x = "caller-local"
    return show()

print(caller())           # not 'caller-local'

# OUTPUT:
# global`],
        [`Understanding LEGB resolves everyday bugs: shadowed built-ins, "UnboundLocalError", and accidental globals in scripts and notebooks.`,
            r`counter = 0
def bad():
    try:
        counter += 1      # assignment makes 'counter' LOCAL for the whole function
    except UnboundLocalError as e:
        print("UnboundLocalError:", e)
bad()

# OUTPUT:
# UnboundLocalError: cannot access local variable 'counter' where it is not associated with a value`],
        [`<b>Advantages:</b> deterministic, readable by inspection, supports closures, and lets tools (linters, IDEs) analyse code statically.`,
            r`def outer():
    y = 10
    def inner():
        return y + 1
    return inner

print(outer.__code__.co_varnames, outer.__code__.co_cellvars)
print(outer()())

# OUTPUT:
# ('inner',) ('y',)
# 11`],
        [`<b>Disadvantages:</b> shadowing is silent (a local named <code>list</code> hides the built-in), and the local-vs-global decision is per function, which surprises beginners.`,
            r`def broken():
    list = [1, 2]            # shadows the built-in 'list'
    try:
        return list("ab")
    except TypeError as e:
        return "TypeError: " + str(e)

print(broken())

# OUTPUT:
# TypeError: 'list' object is not callable`],
        [`<b>Limitations:</b> no block scope: loops, <code>if</code> and <code>with</code> do not create scopes (only functions, classes and modules do; comprehensions have their own).`,
            r`for i in range(3):
    inside = i * 10
print(i, inside)              # still visible after the loop

[j for j in range(2)]
try:
    print(j)
except NameError:
    print("j is not visible: comprehension has its own scope")

# OUTPUT:
# 2 20
# j is not visible: comprehension has its own scope`],
        `
   ┌────────────── Built-in ─────────────┐   (4) last
   │ ┌─────────── Global (module) ─────┐ │   (3)
   │ │ ┌─────── Enclosing (outer fn) ┐ │ │   (2)
   │ │ │ ┌───── Local (inner fn) ──┐ │ │ │   (1) first
   │ │ │ │  name lookup starts here │ │ │ │
   │ │ │ └─────────────────────────┘ │ │ │
   │ │ └─────────────────────────────┘ │ │
   │ └─────────────────────────────────┘ │
   └─────────────────────────────────────┘
`,
        `Keep functions small so the scope chain stays short, avoid mutable module globals, and never shadow built-ins (linters flag A001/A002). Pass dependencies as parameters; reserve closures for deliberate state capture.`
    ),

    'Free Variables': dd(
        [`A <b>free variable</b> is a name used inside a function that is neither a parameter nor assigned locally; it comes from an enclosing scope. Python stores free variables of a closure in <b>cells</b>, listed in <code>fn.__code__.co_freevars</code> and <code>fn.__closure__</code>.`,
            r`def outer():
    tax = 0.18
    def price(amount):
        return amount * (1 + tax)     # 'tax' is free here
    return price

p = outer()
print(p.__code__.co_freevars)
print(p.__closure__[0].cell_contents)
print(p(100))

# OUTPUT:
# ('tax',)
# 0.18
# 118.0`],
        [`Knowing what a function captures lets you debug unexpected values and reason about lifetime: a free variable is shared with the outer scope, not copied.`,
            r`def make():
    items = []
    def add(x):
        items.append(x)       # mutating a free variable needs no nonlocal
        return items
    return add

add = make()
add(1); print(add(2))

# OUTPUT:
# [1, 2]`],
        [`Configuration baked into handlers (thresholds, API clients, prefixes), memoise caches kept inside decorators, and callbacks that carry context.`,
            r`def threshold_filter(limit):
    return lambda value: value > limit    # 'limit' is a free variable

high = threshold_filter(50)
print([v for v in [10, 60, 99, 5] if high(v)])

# OUTPUT:
# [60, 99]`],
        [`<b>Advantages:</b> inspectable at runtime, cheap (one cell per variable), and shared mutable state is possible when you want it.`,
            r`def make():
    n = 1
    def get(): return n
    def set_(v):
        nonlocal n
        n = v
    return get, set_

get, set_ = make()
set_(42)
print(get())              # two closures share one cell

# OUTPUT:
# 42`],
        [`<b>Disadvantages:</b> the value is looked up when called, not when defined, so later changes to the variable are visible and can surprise you.`,
            r`def build():
    rate = 1
    def show(): return rate
    rate = 2                  # changed AFTER the function was defined
    return show

print(build()())

# OUTPUT:
# 2`],
        [`<b>Limitations:</b> only variables from function scopes become free variables; module-level names are globals, not cells, and a free variable cannot be rebound without <code>nonlocal</code>.`,
            r`g = 5
def f():
    return g
print(f.__code__.co_freevars, f.__closure__)   # globals are not captured in cells

# OUTPUT:
# () None`],
        `
   def outer():
       tax = 0.18 ─────────────┐
       def price(amount):      │ shared CELL
           ... tax ...  ◄──────┘
   price.__closure__ ─► ( cell: tax ─► 0.18 )
   price.__code__.co_freevars ─► ('tax',)
`,
        `Treat free variables as implicit parameters. If a function captures more than two or three of them, make them explicit arguments or use a class or <code>functools.partial</code>; explicit data flow is easier to test and reason about.`
    ),

    'nonlocal in Closures': dd(
        [`<code>nonlocal name</code> lets an inner function <b>rebind</b> a variable of the nearest enclosing function (not global). Without it, an assignment would create a new local variable.`,
            r`def counter():
    n = 0
    def inc():
        nonlocal n        # rebind the outer n
        n += 1
        return n
    return inc

c = counter()
print(c(), c(), c())

# OUTPUT:
# 1 2 3`],
        [`Closures often need to update captured state (counters, running totals, flags). Plain assignment would silently create a local and raise <code>UnboundLocalError</code> on augmented assignment.`,
            r`def broken():
    total = 0
    def add(x):
        total += x         # no nonlocal: treated as local
        return total
    return add

try:
    broken()(5)
except UnboundLocalError as e:
    print("UnboundLocalError:", e)

# OUTPUT:
# UnboundLocalError: cannot access local variable 'total' where it is not associated with a value`],
        [`Running averages, rate limiters, call counters in decorators, toggles and one-shot flags.`,
            r`def running_average():
    count, total = 0, 0.0
    def add(x):
        nonlocal count, total
        count += 1
        total += x
        return total / count
    return add

avg = running_average()
print(avg(10), avg(20), avg(60))

# OUTPUT:
# 10.0 15.0 30.0`],
        [`<b>Advantages:</b> mutable private state without a class; more explicit than hidden globals; works through several nesting levels.`,
            r`def level1():
    x = "L1"
    def level2():
        def level3():
            nonlocal x     # finds x two levels up
            x = "changed"
        level3()
        return x
    return level2()

print(level1())

# OUTPUT:
# changed`],
        [`<b>Disadvantages:</b> state mutated from many places is hard to trace, and closures with nonlocal are not thread-safe.`,
            r`import threading
def make():
    n = 0
    def inc():
        nonlocal n
        for _ in range(100_000):
            n += 1            # read-modify-write is not atomic
        return n
    return inc, lambda: n

inc, get = make()
ts = [threading.Thread(target=inc) for _ in range(4)]
[t.start() for t in ts]; [t.join() for t in ts]
print("expected 400000, got", get())

# OUTPUT (varies; may equal 400000 on some builds):
# expected 400000, got 400000`],
        [`<b>Limitations:</b> the name must already exist in an enclosing <i>function</i> scope (not module level), otherwise it is a SyntaxError; use <code>global</code> for module variables.`,
            r`try:
    compile("def f():\n    nonlocal zzz\n    zzz = 1", "<s>", "exec")
except SyntaxError as e:
    print("SyntaxError:", e.msg)

# OUTPUT:
# SyntaxError: no binding for nonlocal 'zzz' found`],
        `
   def outer():
       n = 0  ◄─────────────┐
       def inc():           │ nonlocal n  (rebinds THIS n)
           nonlocal n ──────┘
           n += 1
   no nonlocal:  n += 1  ──► new LOCAL n ──► UnboundLocalError
`,
        `Prefer a small class (or <code>itertools.count</code>, <code>functools.cache</code>) when state is shared or concurrent; guard shared closure state with a lock. nonlocal is fine for tiny single-owner counters.`
    ),

    'Closure Behavior & Late Binding': dd(
        [`Closures capture <b>variables</b>, not values. A function made in a loop looks up the variable when it is <i>called</i>, so all of them see its final value. This is called <b>late binding</b>.`,
            r`funcs = []
for i in range(3):
    funcs.append(lambda: i)       # all share the SAME variable i

print([f() for f in funcs])       # i ended as 2

# OUTPUT:
# [2, 2, 2]`],
        [`This is the most famous closure trap. You must know how to bind the value at definition time, using a default argument, <code>functools.partial</code> or a factory function.`,
            r`from functools import partial
fixed = [lambda i=i: i for i in range(3)]           # default arg freezes the value
def times(n, x): return n * x
parts = [partial(times, i) for i in range(3)]       # partial freezes it too
print([f() for f in fixed], [p(10) for p in parts])

# OUTPUT:
# [0, 1, 2] [0, 10, 20]`],
        [`Appears in GUI button callbacks created in loops, scheduled jobs, route handlers, and lists of validators built from configuration.`,
            r`def make_handler(name):          # factory: each call has its own 'name'
    return lambda: f"clicked {name}"

handlers = [make_handler(n) for n in ["OK", "Cancel"]]
print([h() for h in handlers])

# OUTPUT:
# ['clicked OK', 'clicked Cancel']`],
        [`<b>Advantages:</b> late binding means closures see updates, handy for live configuration or shared state.`,
            r`def make():
    mode = "dev"
    def current(): return mode
    def switch(m):
        nonlocal mode
        mode = m
    return current, switch

current, switch = make()
print(current()); switch("prod"); print(current())

# OUTPUT:
# dev
# prod`],
        [`<b>Disadvantages:</b> it surprises almost everyone in loops and creates subtle bugs far from the cause; the fix looks like boilerplate.`,
            r`callbacks = {}
for name in ["a", "b", "c"]:
    callbacks[name] = lambda: name.upper()
print({k: f() for k, f in callbacks.items()})   # all say 'C'

# OUTPUT:
# {'a': 'C', 'b': 'C', 'c': 'C'}`],
        [`<b>Limitations:</b> the default-argument trick can be overridden by callers passing an extra argument, and it does not work for keyword-only API contracts.`,
            r`fs = [lambda i=i: i for i in range(2)]
print(fs[0](), fs[0](99))     # a caller can accidentally replace the "frozen" value

# OUTPUT:
# 0 99`],
        `
   loop:  i=0 ─► i=1 ─► i=2   (ONE variable i, one cell)
   f0, f1, f2  ──► all point at the same cell
   call later:  f0() ─► reads cell ─► 2     (late binding)
   fix:  lambda i=i: i   (copies value into each function's own default)
`,
        `Prefer factory functions or <code>functools.partial</code> over default-argument hacks: they are explicit and keep the signature clean. Linters (flake8-bugbear B023) detect loop-variable capture; enable them in CI.`
    ),
};
