import type { Topic } from '../../types';

export const decoratorsWithArguments: Topic = {
    id: 'python-decorators-decorators-with-arguments',
    name: 'Decorators with Arguments',
    beginner: [
        {
            content: `<h4>Why Three Levels?</h4>
<code>@repeat(3)</code> first <b>calls</b> <code>repeat(3)</code>; whatever that returns is then used as the decorator. So a configurable decorator needs one more layer:<br><br>
1. <b>Decorator factory</b> - takes the arguments (<code>times</code>) and returns...<br>
2. the <b>decorator</b> - takes the function and returns...<br>
3. the <b>wrapper</b> - runs on every call.<br><br>
<code>@repeat(3)</code> is therefore <code>func = repeat(3)(func)</code>.`
        },
        {
            content: `<h4>@repeat(times)</h4>`,
            codeExamples: [
                `import functools

def repeat(times):                    # 1. factory
    def decorator(func):              # 2. decorator
        @functools.wraps(func)
        def wrapper(*args, **kwargs): # 3. wrapper
            result = None
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}")

greet("Abaji")

# OUTPUT:
# Hello, Abaji
# Hello, Abaji
# Hello, Abaji`
            ]
        },
        {
            content: `<h4>@require_role("admin") - an Access Check</h4>
The factory argument is remembered by the inner functions (a closure), so each decorated function can require a different role.`,
            codeExamples: [
                `import functools

def require_role(role):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(user, *args, **kwargs):
            if user["role"] != role:
                raise PermissionError(f"{user['name']} is not {role}")
            return func(user, *args, **kwargs)
        return wrapper
    return decorator

@require_role("admin")
def delete_post(user, post_id):
    return f"post {post_id} deleted"

print(delete_post({"name": "Raoji", "role": "admin"}, 7))
print(delete_post({"name": "Abaji", "role": "editor"}, 7))

# OUTPUT:
# post 7 deleted
# PermissionError: Abaji is not admin`
            ]
        },
        {
            content: `<h4>@retry(times=3) with Keyword Arguments</h4>`,
            codeExamples: [
                `import functools

def retry(times=3, exceptions=(ConnectionError,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as error:
                    print(f"attempt {attempt}/{times} failed: {error}")
            raise RuntimeError(f"{func.__name__} failed {times} times")
        return wrapper
    return decorator

@retry(times=2)
def connect():
    raise ConnectionError("server busy")

connect()

# OUTPUT:
# attempt 1/2 failed: server busy
# attempt 2/2 failed: server busy
# RuntimeError: connect failed 2 times`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>@deco vs @deco() - a Silent Bug</h3>
With a factory, forgetting the parentheses passes the <b>function</b> as the factory's argument. No error is raised at definition time; the decorated name now refers to the inner <code>decorator</code>, so calling it just returns another function and the real code never runs.`,
            codeExamples: [
                `import functools

def repeat(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat                        # forgot (3)!  -> greet = repeat(greet)
def greet(name):
    print(f"Hello, {name}")

result = greet("Abaji")         # nothing is printed
print(type(result).__name__)

# OUTPUT:
# function`
            ]
        },
        {
            content: `<h3>A Decorator That Works With and Without Arguments</h3>
Make the function the optional first positional parameter and every option keyword-only. If the function is given, decorate it directly; otherwise return the decorator.`,
            codeExamples: [
                `import functools

def repeat(_func=None, *, times=2):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper

    if _func is None:          # used as @repeat(...)
        return decorator
    return decorator(_func)    # used as @repeat

@repeat
def ping():
    print("ping")

@repeat(times=3)
def pong():
    print("pong")

ping()
pong()

# OUTPUT:
# ping
# ping
# pong
# pong
# pong`
            ]
        },
        {
            content: `<h3>Decorators That Keep State</h3>
State can live in a function attribute on the wrapper, or in a <b>class-based decorator</b>: a class whose <code>__init__</code> receives the function and whose <code>__call__</code> runs on every call.`,
            codeExamples: [
                `import functools

def count_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def ping():
    return "pong"

ping()
ping()
print(ping.calls)

# OUTPUT:
# 2`,
                `import functools

class CountCalls:
    def __init__(self, func):
        functools.update_wrapper(self, func)   # copy __name__, __doc__...
        self.func = func
        self.calls = 0

    def __call__(self, *args, **kwargs):
        self.calls += 1
        return self.func(*args, **kwargs)

@CountCalls                    # ping = CountCalls(ping)
def ping():
    return "pong"

print(ping(), ping(), ping())
print(ping.calls, ping.__name__, type(ping).__name__)

# OUTPUT:
# pong pong pong
# 3 ping CountCalls`
            ]
        },
        {
            content: `<h3>A Class-Based Decorator With Arguments</h3>
Here <code>__init__</code> takes the <b>arguments</b> and <code>__call__</code> receives the <b>function</b> and returns the wrapper - the class instance plays the role of the factory.<br><br>
Note: a class-based decorator <i>instance</i> (like <code>CountCalls</code> above) used on a <b>method</b> doesn't receive <code>self</code> automatically, because plain instances are not descriptors. Function-based decorators don't have this problem - prefer them for methods.`,
            codeExamples: [
                `import functools

class Prefix:
    def __init__(self, text):
        self.text = text

    def __call__(self, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return self.text + func(*args, **kwargs)
        return wrapper

@Prefix(">> ")
def status():
    return "all systems go"

print(status())

# OUTPUT:
# >> all systems go`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does a decorator with arguments need three levels?</td><td><code>@deco(args)</code> calls deco(args) first; it must return the real decorator, which returns the wrapper</td></tr>
<tr class='text-center'><td>What is <code>@repeat(3)</code> equivalent to?</td><td><code>func = repeat(3)(func)</code></td></tr>
<tr class='text-center'><td>What happens if you write <code>@repeat</code> instead of <code>@repeat(3)</code>?</td><td>The function is passed as the argument; the name ends up bound to the inner decorator and the original never runs</td></tr>
<tr class='text-center'><td>How can one decorator support both forms?</td><td>Take an optional first positional <code>_func=None</code> and keyword-only options; decorate directly if _func is given</td></tr>
<tr class='text-center'><td>How do you write a class-based decorator?</td><td>__init__ receives the function (or the arguments), __call__ runs on each call (or receives the function)</td></tr>
<tr class='text-center'><td>Where can a decorator keep state?</td><td>In a closure variable (with nonlocal), a function attribute on the wrapper, or attributes of a class-based decorator</td></tr>
</table>`
        }
    ]
};
