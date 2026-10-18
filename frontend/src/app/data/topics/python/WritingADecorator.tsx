import type { Topic } from '../../types';

export const writingADecorator: Topic = {
    id: 'python-decorators-writing-a-decorator',
    name: 'Writing a Decorator',
    beginner: [
        {
            content: `<h4>What is a Decorator?</h4>
A <b>decorator</b> is a function that takes a function and returns a new function - usually a <b>wrapper</b> that runs extra code before and/or after the original. It adds behaviour (logging, timing, access checks, retries) <b>without changing the original function's code</b>. If you know Spring, it plays the role of an <code>@Around</code> advice in AOP.`
        },
        {
            content: `<h4>Step 1: The Simplest Decorator</h4>
The decorator receives <code>func</code>, defines <code>wrapper</code> around it, and returns the wrapper. Reassigning <code>say_hi = announce(say_hi)</code> applies it.`,
            codeExamples: [
                `def announce(func):
    def wrapper():
        print("Before", func.__name__)
        func()
        print("After", func.__name__)
    return wrapper

def say_hi():
    print("Hi!")

say_hi = announce(say_hi)        # apply the decorator
say_hi()

# OUTPUT:
# Before say_hi
# Hi!
# After say_hi`
            ]
        },
        {
            content: `<h4>Step 2: Forward Arguments and Return the Result</h4>
A reusable decorator must work for <b>any</b> function, so the wrapper accepts <code>*args, **kwargs</code>, passes them on, and <b>returns</b> the original result.`,
            codeExamples: [
                `def announce(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with {args} {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result!r}")
        return result
    return wrapper

def add(a, b):
    return a + b

add = announce(add)
total = add(2, b=3)
print(total)

# OUTPUT:
# Calling add with (2,) {'b': 3}
# add returned 5
# 5`
            ]
        },
        {
            content: `<h4>The Classic Bug: Forgetting return</h4>
If the wrapper calls the function but doesn't return its result, every decorated function silently returns <code>None</code>.`,
            codeExamples: [
                `def broken(func):
    def wrapper(*args, **kwargs):
        func(*args, **kwargs)        # result thrown away!
    return wrapper

def square(n):
    return n * n

square = broken(square)
print(square(4))

# OUTPUT:
# None`
            ]
        },
        {
            content: `<h4>A Timing Decorator</h4>
<code>time.perf_counter()</code> measures elapsed time precisely. <code>functools.wraps</code> keeps the original function's name - its own topic explains why.`,
            codeExamples: [
                `import functools
import time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

def slow_sum(n):
    return sum(range(n))

slow_sum = timed(slow_sum)
print(slow_sum(1_000_000))

# OUTPUT (the time varies by machine - e.g.):
# slow_sum took 0.0123s
# 499999500000`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Decorators Run at Definition Time</h3>
The decorator itself runs <b>once</b>, when the <code>def</code> statement executes (usually at import time). Only the wrapper runs on each call. This is why decorators are perfect for <b>registration</b>.`,
            codeExamples: [
                `def register(func):
    print(f"registering {func.__name__}")
    return func

print("start of module")

@register
def first():
    print("first called")

@register
def second():
    print("second called")

print("end of module")
first()

# OUTPUT:
# start of module
# registering first
# registering second
# end of module
# first called`
            ]
        },
        {
            content: `<h3>A Registry Decorator (Plugins and Commands)</h3>
A decorator doesn't have to wrap anything: it can record the function and return it <b>unchanged</b>. Frameworks use this pattern for URL routes, CLI commands, event handlers and pytest fixtures.`,
            codeExamples: [
                `COMMANDS = {}

def command(func):
    COMMANDS[func.__name__] = func
    return func                      # the original, unchanged

@command
def start():
    return "Starting..."

@command
def stop():
    return "Stopping..."

print(sorted(COMMANDS))
print(COMMANDS["start"]())

# OUTPUT:
# ['start', 'stop']
# Starting...`
            ]
        },
        {
            content: `<h3>A Retry Decorator</h3>
Cross-cutting concerns such as retrying flaky network calls belong in a decorator, so the business function stays clean.`,
            codeExamples: [
                `import functools

def retry(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        for attempt in range(1, 4):
            try:
                return func(*args, **kwargs)
            except ConnectionError as error:
                print(f"attempt {attempt} failed: {error}")
        raise ConnectionError("all 3 attempts failed")
    return wrapper

calls = 0

@retry
def fetch():
    global calls
    calls += 1
    if calls < 3:
        raise ConnectionError("timeout")
    return "data"

print(fetch())

# OUTPUT:
# attempt 1 failed: timeout
# attempt 2 failed: timeout
# data`
            ]
        },
        {
            content: `<h3>Decorating Methods</h3>
A method is just a function defined in a class, so the same decorator works: <code>self</code> simply arrives as the first item of <code>args</code>. That is another reason to always use <code>*args, **kwargs</code> in wrappers.`,
            codeExamples: [
                `def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"{func.__qualname__} called")
        return func(*args, **kwargs)
    return wrapper

class Account:
    def __init__(self, balance):
        self.balance = balance

    @log_call
    def deposit(self, amount):
        self.balance += amount
        return self.balance

acc = Account(100)
print(acc.deposit(50))

# OUTPUT:
# Account.deposit called
# 150`
            ]
        },
        {
            content: `<h3>Decorator Checklist</h3>
• Accept and forward <code>*args, **kwargs</code>.<br>
• <b>Return</b> the wrapped function's result.<br>
• Apply <code>@functools.wraps(func)</code> to the wrapper.<br>
• Keep work done at decoration time small - it runs on import.<br>
• Don't swallow exceptions unless that is the decorator's explicit job.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a decorator?</td><td>A callable that takes a function and returns a replacement (usually a wrapper) that adds behaviour</td></tr>
<tr class='text-center'><td>Why do wrappers use <code>*args, **kwargs</code>?</td><td>So they can forward any arguments to any function, including methods (where self is the first arg)</td></tr>
<tr class='text-center'><td>When does decorator code run?</td><td>The decorator runs once at definition time; the wrapper runs on every call</td></tr>
<tr class='text-center'><td>Why might a decorated function return None?</td><td>The wrapper forgot to return the original function's result</td></tr>
<tr class='text-center'><td>Name typical uses of decorators</td><td>Logging, timing, caching, retries, authentication/authorization, registration of routes or plugins</td></tr>
<tr class='text-center'><td>Python decorator vs Spring AOP?</td><td>Both add cross-cutting behaviour around a call; a decorator is plain code applied explicitly to one function, AOP weaves advice via proxies and pointcuts</td></tr>
</table>`
        }
    ]
};
