import type { Topic } from '../../types';

export const contextmanagerDecorator: Topic = {
    id: 'python-context-managers-contextmanager',
    name: '@contextmanager',
    beginner: [
        {
            content: `<h4>Context Managers from a Generator</h4>
Writing a class with two methods is sometimes more ceremony than the job needs. <code>contextlib.contextmanager</code> turns a generator function with a single <code>yield</code> into a context manager:<br><br>
• code <b>before</b> <code>yield</code> = <code>__enter__</code> (setup),<br>
• the <b>yielded value</b> = what <code>as</code> binds,<br>
• code <b>after</b> <code>yield</code> = <code>__exit__</code> (cleanup).`,
            codeExamples: [
                `from contextlib import contextmanager

@contextmanager
def tag(name):
    print(f"<{name}>")          # setup
    yield                       # the with block runs here
    print(f"</{name}>")         # cleanup

with tag("p"):
    print("hello")

# OUTPUT:
# <p>
# hello
# </p>`
            ]
        },
        {
            content: `<h4>Yielding a Value</h4>`,
            codeExamples: [
                `from contextlib import contextmanager

@contextmanager
def shopping_cart(owner):
    cart = []
    print("cart created for", owner)
    yield cart                       # bound by "as"
    print(owner, "checked out", cart)

with shopping_cart("Abaji") as items:
    items.append("pen")
    items.append("book")

# OUTPUT:
# cart created for Abaji
# Abaji checked out ['pen', 'book']`
            ]
        },
        {
            content: `<h4>The Bug: Cleanup Skipped on Error</h4>
If the <code>with</code> block raises, the exception is thrown into the generator <b>at the yield</b>. Without <code>try/finally</code>, everything after <code>yield</code> is skipped - the resource is never released.`,
            codeExamples: [
                `from contextlib import contextmanager

@contextmanager
def opened(name):
    print("open", name)
    yield name
    print("close", name)             # skipped when the block raises!

try:
    with opened("data.txt"):
        raise ValueError("bad data")
except ValueError:
    print("error handled")

# OUTPUT:
# open data.txt
# error handled`
            ]
        },
        {
            content: `<h4>The Fix: Always Use try/finally</h4>`,
            codeExamples: [
                `from contextlib import contextmanager

@contextmanager
def opened(name):
    print("open", name)
    try:
        yield name
    finally:
        print("close", name)         # always runs

try:
    with opened("data.txt"):
        raise ValueError("bad data")
except ValueError:
    print("error handled")

# OUTPUT:
# open data.txt
# close data.txt
# error handled`
            ]
        },
        {
            content: `<h4>Practical Examples: Timer and Temporary Settings</h4>`,
            codeExamples: [
                `import time
from contextlib import contextmanager

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - start:.3f}s")

with timer("build list"):
    squares = [n * n for n in range(100_000)]

# OUTPUT (the time varies by machine - e.g.):
# build list: 0.004s`,
                `from contextlib import contextmanager

settings = {"debug": False, "theme": "light"}

@contextmanager
def temporary(config, key, value):
    old = config[key]
    config[key] = value
    try:
        yield config
    finally:
        config[key] = old            # always restored

with temporary(settings, "debug", True):
    print("inside:", settings["debug"])
print("after:", settings["debug"])

# OUTPUT:
# inside: True
# after: False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Handling Exceptions Inside the Generator</h3>
Wrap the <code>yield</code> in <code>try/except</code> to react to errors from the block. Re-raise to let them propagate; don't re-raise to suppress them (like returning True from <code>__exit__</code>).`,
            codeExamples: [
                `from contextlib import contextmanager

@contextmanager
def log_errors(swallow=False):
    try:
        yield
    except Exception as error:
        print("logged:", type(error).__name__, error)
        if not swallow:
            raise                    # propagate

with log_errors(swallow=True):
    1 / 0
print("continued")

with log_errors():
    int("x")

# OUTPUT:
# logged: ZeroDivisionError division by zero
# continued
# logged: ValueError invalid literal for int() with base 10: 'x'
# ValueError: invalid literal for int() with base 10: 'x'`
            ]
        },
        {
            content: `<h3>Exactly One yield</h3>
The generator must yield exactly once. Yielding twice is an error raised when the block ends.`,
            codeExamples: [
                `from contextlib import contextmanager

@contextmanager
def twice():
    yield
    yield

with twice():
    pass

# OUTPUT:
# RuntimeError: generator didn't stop`
            ]
        },
        {
            content: `<h3>Using It as a Decorator</h3>
Context managers made with <code>@contextmanager</code> are also <b>decorators</b> (they inherit from <code>contextlib.ContextDecorator</code>): decorating a function wraps every call in the managed block. A fresh manager is created for each call.`,
            codeExamples: [
                `from contextlib import contextmanager

@contextmanager
def announce(task):
    print("start", task)
    try:
        yield
    finally:
        print("end", task)

@announce("report")
def build_report():
    print("building...")

build_report()
build_report()

# OUTPUT:
# start report
# building...
# end report
# start report
# building...
# end report`
            ]
        },
        {
            content: `<h3>nullcontext: An Optional Context Manager</h3>
<code>contextlib.nullcontext()</code> does nothing. It lets one code path use a real manager when needed and a no-op otherwise, without duplicating the block.`,
            codeExamples: [
                `import threading
from contextlib import nullcontext

def add(items, value, lock=None):
    with lock if lock is not None else nullcontext():
        items.append(value)

items = []
add(items, 1)                        # no locking needed
add(items, 2, threading.Lock())      # thread-safe call
print(items)

# OUTPUT:
# [1, 2]`
            ]
        },
        {
            content: `<h3>Class or @contextmanager?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Use @contextmanager when...</th><th>Use a class when...</th></tr>
<tr class='text-center'><td>Setup and cleanup are a few lines</td><td>The object has its own state and methods used inside the block</td></tr>
<tr class='text-center'><td>It is used once per call</td><td>It must be reusable or reentrant</td></tr>
<tr class='text-center'><td>Linear "before / after" logic reads naturally</td><td>Exception handling logic is complex</td></tr>
<tr class='text-center'><td>You want a decorator too, for free</td><td>You need async support with extra methods, or subclassing</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does @contextmanager map to __enter__/__exit__?</td><td>Code before yield is the setup, the yielded value is bound by as, code after yield is the cleanup</td></tr>
<tr class='text-center'><td>Why wrap yield in try/finally?</td><td>An exception from the block is raised at the yield; without finally the cleanup code is skipped</td></tr>
<tr class='text-center'><td>How do you suppress an exception in a generator-based manager?</td><td>Catch it around the yield and don't re-raise</td></tr>
<tr class='text-center'><td>Can a @contextmanager be used as a decorator?</td><td>Yes - it is a ContextDecorator, so each call of the decorated function runs inside the manager</td></tr>
<tr class='text-center'><td>What is nullcontext for?</td><td>A do-nothing context manager for code paths where no real manager is needed</td></tr>
<tr class='text-center'><td>How many times may the generator yield?</td><td>Exactly once - otherwise RuntimeError</td></tr>
</table>`
        }
    ]
};
