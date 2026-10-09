import type { Topic } from '../../types';

export const functoolsWraps: Topic = {
    id: 'python-decorators-functools-wraps',
    name: 'functools.wraps',
    beginner: [
        {
            content: `<h4>The Problem: Wrappers Hide the Original</h4>
After decoration, the function's name points to the <b>wrapper</b>. Without extra work, the decorated function reports the wrapper's name, loses its docstring, and shows the wrapper's <code>(*args, **kwargs)</code> signature.`,
            codeExamples: [
                `import inspect

def logged(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

print(add.__name__)
print(add.__doc__)
print(inspect.signature(add))

# OUTPUT:
# wrapper
# None
# (*args, **kwargs)`
            ]
        },
        {
            content: `<h4>The Fix: @functools.wraps(func)</h4>
Decorate the <b>wrapper</b> with <code>@functools.wraps(func)</code>. It copies the original's metadata onto the wrapper and stores the original in <code>wrapper.__wrapped__</code>.`,
            codeExamples: [
                `import functools
import inspect

def logged(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

print(add.__name__)
print(add.__doc__)
print(inspect.signature(add))
print(add(2, 3))

# OUTPUT:
# add
# Add two numbers.
# (a: int, b: int) -> int
# calling add
# 5`
            ]
        },
        {
            content: `<h4>What wraps Copies</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Attribute</th><th>Without wraps</th><th>With wraps</th></tr>
<tr class='text-center'><td><code>__name__</code></td><td><code>wrapper</code></td><td>original name</td></tr>
<tr class='text-center'><td><code>__qualname__</code></td><td><code>logged.&lt;locals&gt;.wrapper</code></td><td>original qualified name</td></tr>
<tr class='text-center'><td><code>__doc__</code></td><td>wrapper's (often None)</td><td>original docstring</td></tr>
<tr class='text-center'><td><code>__module__</code>, <code>__annotations__</code></td><td>wrapper's</td><td>original's</td></tr>
<tr class='text-center'><td><code>__dict__</code></td><td>empty</td><td>updated with the original's attributes</td></tr>
<tr class='text-center'><td><code>__wrapped__</code></td><td>not set</td><td>the original function</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Why It Matters in Real Projects</h3>
• <b>Debugging and logging</b>: tracebacks, profilers and log lines show <code>wrapper</code> for every decorated function unless metadata is copied.<br>
• <b>help() and IDEs</b>: they read <code>__doc__</code> and the signature.<br>
• <b>Frameworks</b> identify functions by name or signature. Flask uses the view function's <code>__name__</code> as the endpoint name, so two routes decorated with a wraps-less decorator both become "wrapper" and Flask refuses to register the second. pytest and FastAPI inspect signatures to decide what to inject - <code>inspect.signature</code> follows <code>__wrapped__</code> to find the real parameters.`
        },
        {
            content: `<h3>Reaching the Original: __wrapped__ and inspect.unwrap</h3>
<code>__wrapped__</code> gives direct access to the undecorated function - useful in tests to bypass caching, logging or auth. <code>inspect.unwrap</code> follows the whole chain through stacked decorators.`,
            codeExamples: [
                `import functools
import inspect

def logged(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper

def original_add(a, b):
    return a + b

add = logged(logged(original_add))      # stacked twice

print(add.__wrapped__(2, 3))            # skips the outer logger only
print(inspect.unwrap(add) is original_add)
print(inspect.unwrap(add)(2, 3))        # no logging at all

# OUTPUT:
# calling original_add
# 5
# True
# 5`
            ]
        },
        {
            content: `<h3>functools.update_wrapper</h3>
<code>@wraps(func)</code> is a convenience for <code>functools.update_wrapper(wrapper, func)</code>. Call <code>update_wrapper</code> directly where decorator syntax doesn't fit - for example in a class-based decorator's <code>__init__</code>, or for a wrapper built without <code>def</code>.`,
            codeExamples: [
                `import functools

def shout(text):
    """Return text in upper case."""
    return text.upper()

def make_wrapper(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs) + "!"
    functools.update_wrapper(wrapper, func)
    return wrapper

loud = make_wrapper(shout)
print(loud("hi"), loud.__name__, loud.__doc__)

# OUTPUT:
# HI! shout Return text in upper case.`
            ]
        },
        {
            content: `<h3>A Production-Quality Decorator Template</h3>
Copy this shape: keyword-only options, optional parentheses, <code>wraps</code>, forwarded arguments, returned result, and exceptions left alone.`,
            codeExamples: [
                `import functools
import logging
import time

logger = logging.getLogger(__name__)

def timed(_func=None, *, threshold=0.0):
    """Log calls that take longer than threshold seconds."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                elapsed = time.perf_counter() - start
                if elapsed >= threshold:
                    logger.info("%s took %.3fs", func.__qualname__, elapsed)
        return wrapper

    if _func is None:
        return decorator
    return decorator(_func)

@timed
def build_report():
    return "report"

@timed(threshold=0.5)
def export_pdf():
    return "pdf"

print(build_report(), export_pdf(), build_report.__name__)

# OUTPUT:
# report pdf build_report`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does functools.wraps solve?</td><td>Decorated functions otherwise expose the wrapper's name, docstring and signature instead of the original's</td></tr>
<tr class='text-center'><td>What does wraps copy?</td><td>__module__, __name__, __qualname__, __doc__, __annotations__ (and more), updates __dict__, and sets __wrapped__</td></tr>
<tr class='text-center'><td>How do you call the undecorated function?</td><td><code>func.__wrapped__</code>, or <code>inspect.unwrap(func)</code> through all layers</td></tr>
<tr class='text-center'><td>wraps vs update_wrapper?</td><td>wraps is the decorator form of update_wrapper(wrapper, wrapped)</td></tr>
<tr class='text-center'><td>Why do frameworks care?</td><td>They use names and signatures (Flask endpoints, pytest fixtures, FastAPI parameters); inspect.signature follows __wrapped__</td></tr>
</table>`
        }
    ]
};
