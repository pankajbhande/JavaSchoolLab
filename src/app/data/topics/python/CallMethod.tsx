import type { Topic } from '../../types';

export const callMethod: Topic = {
    id: 'python-data-model-call',
    name: '__call__',
    beginner: [
        {
            content: `<h4>Making Objects Callable</h4>
If a class defines <code>__call__</code>, its instances can be called with parentheses like a function: <code>obj(args)</code> runs <code>obj.__call__(args)</code>. Unlike a plain function, the object can <b>remember state</b> in its attributes between calls.`,
            codeExamples: [
                `class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):
        return x * self.factor

double = Multiplier(2)
triple = Multiplier(3)

print(double(21), triple(5))
print(list(map(double, [1, 2, 3])))     # usable anywhere a function is

# OUTPUT:
# 42 15
# [2, 4, 6]`
            ]
        },
        {
            content: `<h4>A Stateful Callable</h4>`,
            codeExamples: [
                `class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count

click = Counter()
click()
click()
print(click(), click.count)

# OUTPUT:
# 3 3`
            ]
        },
        {
            content: `<h4>Limiting How Often Something Runs</h4>
A callable object can wrap a function and add rules - here, an OTP sender that may be used only twice.`,
            codeExamples: [
                `class CallLimiter:
    def __init__(self, func, max_calls):
        self.func = func
        self.max_calls = max_calls
        self.calls = 0

    def __call__(self, *args, **kwargs):
        if self.calls >= self.max_calls:
            raise RuntimeError(f"{self.func.__name__} called more than {self.max_calls} times")
        self.calls += 1
        return self.func(*args, **kwargs)

def send_otp(phone):
    return f"OTP sent to {phone}"

limited = CallLimiter(send_otp, 2)
print(limited("98765 43210"))
print(limited("98765 43210"))
print(limited("98765 43210"))

# OUTPUT:
# OTP sent to 98765 43210
# OTP sent to 98765 43210
# RuntimeError: send_otp called more than 2 times`
            ]
        },
        {
            content: `<h4>callable()</h4>
<code>callable(obj)</code> returns <code>True</code> if <code>obj(...)</code> is allowed: functions, methods, classes, and instances whose class defines <code>__call__</code>.`,
            codeExamples: [
                `class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):
        return x * self.factor

print(callable(Multiplier(2)), callable(Multiplier), callable(print))
print(callable(42), callable("hi"))

# OUTPUT:
# True True True
# False False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Classes Are Callable Too</h3>
<code>Counter()</code> is itself a call: classes are instances of <code>type</code>, and <code>type.__call__</code> creates the object with <code>__new__</code> and then initialises it with <code>__init__</code>. This is why Python needs no <code>new</code> keyword - and why a factory function and a class are interchangeable to the caller.`,
            codeExamples: [
                `class Account:
    def __new__(cls, owner):
        print("1. __new__ creates the object")
        return super().__new__(cls)

    def __init__(self, owner):
        print("2. __init__ initialises it")
        self.owner = owner

acc = Account("Asha")
print(type(Account), acc.owner)

# OUTPUT:
# 1. __new__ creates the object
# 2. __init__ initialises it
# <class 'type'> Asha`
            ]
        },
        {
            content: `<h3>Callable Objects as Decorators</h3>
A class with <code>__init__(self, func)</code> and <code>__call__</code> works as a decorator, and its state (here a call count) is easy to inspect. <code>functools.update_wrapper</code> copies the wrapped function's name and docstring onto the object.`,
            codeExamples: [
                `import functools

class CountCalls:
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.calls = 0

    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.func(*args, **kwargs)

@CountCalls
def greet(name):
    """Return a greeting."""
    return f"Hi {name}"

greet("Asha")
greet("Ravi")
print(greet.calls, greet.__name__, greet.__doc__)

# OUTPUT:
# 2 greet Return a greeting.`
            ]
        },
        {
            content: `<h3>A Rate Limiter with an Injectable Clock</h3>
Callable objects make good strategy objects with configuration. Passing the clock in (instead of calling <code>time.monotonic()</code> directly) makes the behaviour testable with fake times.`,
            codeExamples: [
                `import time
from collections import deque

class RateLimiter:
    """Allow at most max_calls in any period-second window."""

    def __init__(self, max_calls, period, clock=time.monotonic):
        self.max_calls = max_calls
        self.period = period
        self.clock = clock
        self.calls = deque()

    def __call__(self):
        now = self.clock()
        while self.calls and now - self.calls[0] >= self.period:
            self.calls.popleft()               # forget calls outside the window
        if len(self.calls) < self.max_calls:
            self.calls.append(now)
            return True
        return False

fake_times = iter([0, 1, 2, 3, 11])
allow = RateLimiter(3, 10, clock=lambda: next(fake_times))
print([allow() for _ in range(5)])

# OUTPUT:
# [True, True, True, False, True]`
            ]
        },
        {
            content: `<h3>__call__ vs a Closure</h3>
Both can carry state into a function. Choose by how much state and behaviour you need.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Closure</th><th>Callable class</th></tr>
<tr class='text-center'><td>Short and light for one small piece of state</td><td>Clearer when there are several attributes</td></tr>
<tr class='text-center'><td>State is hidden in the closure</td><td>State is visible and inspectable (<code>obj.calls</code>)</td></tr>
<tr class='text-center'><td>One behaviour only</td><td>Can add extra methods (<code>reset()</code>, <code>__repr__</code>)</td></tr>
<tr class='text-center'><td>Rebinding needs <code>nonlocal</code></td><td>Plain attribute assignment</td></tr>
</table>`
        },
        {
            content: `<h3>functools.partial Objects Are Callable Objects</h3>
<code>partial</code> returns an instance of the <code>functools.partial</code> class - an object that stores a function plus pre-filled arguments, and implements <code>__call__</code>.`,
            codeExamples: [
                `from functools import partial

parse_binary = partial(int, base=2)
print(type(parse_binary), callable(parse_binary))
print(parse_binary.func, parse_binary.keywords)
print(parse_binary("101"))

# OUTPUT:
# <class 'functools.partial'> True
# <class 'int'> {'base': 2}
# 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does __call__ do?</td><td>Lets instances be called like functions: <code>obj(x)</code> runs <code>obj.__call__(x)</code></td></tr>
<tr class='text-center'><td>Why use a callable object instead of a function?</td><td>It can keep inspectable state and offer extra methods while still being used wherever a function is expected</td></tr>
<tr class='text-center'><td>What does callable() check?</td><td>Whether the object can be called - functions, classes, and instances with __call__</td></tr>
<tr class='text-center'><td>What happens when you call a class?</td><td><code>type.__call__</code> runs <code>__new__</code> to create the instance and <code>__init__</code> to initialise it</td></tr>
<tr class='text-center'><td>Can a class be a decorator?</td><td>Yes - store the function in __init__ and wrap the call in __call__</td></tr>
</table>`
        }
    ]
};
