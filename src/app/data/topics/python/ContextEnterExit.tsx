import type { Topic } from '../../types';

export const contextEnterExit: Topic = {
    id: 'python-context-managers-enter-exit',
    name: '__enter__ & __exit__',
    beginner: [
        {
            content: `<h4>The Context Manager Protocol</h4>
Any object whose class defines these two methods can be used in a <code>with</code> statement:<br><br>
• <code>__enter__(self)</code> - runs when the block starts. Its <b>return value</b> is what <code>as</code> binds.<br>
• <code>__exit__(self, exc_type, exc_value, traceback)</code> - runs when the block ends, whether it finished normally or raised. If there was no exception, all three arguments are <code>None</code>.`
        },
        {
            content: `<h4>Tracing the Call Order</h4>`,
            codeExamples: [
                `class Tracer:
    def __enter__(self):
        print("__enter__ called")
        return "resource"

    def __exit__(self, exc_type, exc_value, traceback):
        print("__exit__ called with", exc_type)
        return False

with Tracer() as r:
    print("inside the block, r =", r)
print("after the block")

# OUTPUT:
# __enter__ called
# inside the block, r = resource
# __exit__ called with None
# after the block`
            ]
        },
        {
            content: `<h4>as Binds __enter__'s Return Value</h4>
<code>as</code> does <b>not</b> bind the context manager object itself - it binds whatever <code>__enter__</code> returns. Most classes simply <code>return self</code>, which is why <code>with open(...) as f</code> gives you the file. Leave out <code>as</code> when you don't need the value.`,
            codeExamples: [
                `class Account:
    def __init__(self, owner):
        self.owner = owner

    def __enter__(self):
        print("session opened for", self.owner)
        return self                  # the usual choice

    def __exit__(self, exc_type, exc_value, traceback):
        print("session closed for", self.owner)
        return False

with Account("Abaji") as acc:
    print("working with", acc.owner)

# OUTPUT:
# session opened for Abaji
# working with Abaji
# session closed for Abaji`
            ]
        },
        {
            content: `<h4>When the Block Raises</h4>
<code>__exit__</code> receives the exception's class, the exception object and its traceback. Returning <code>False</code> (or <code>None</code>) lets the exception continue after cleanup.`,
            codeExamples: [
                `class Tracer:
    def __enter__(self):
        print("__enter__ called")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is None:
            print("__exit__: finished normally")
        else:
            print("__exit__ got", exc_type.__name__ + ":", exc_value)
        return False                 # don't suppress

with Tracer():
    raise ValueError("bad input")

# OUTPUT:
# __enter__ called
# __exit__ got ValueError: bad input
# ValueError: bad input`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Returning True Suppresses the Exception</h3>
If <code>__exit__</code> returns a truthy value, Python treats the exception as handled and continues after the <code>with</code> block. Use this deliberately and narrowly - <code>contextlib.suppress</code> is built exactly this way.`,
            codeExamples: [
                `class Ignore:
    def __init__(self, *exception_types):
        self.exception_types = exception_types

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None and issubclass(exc_type, self.exception_types):
            print("suppressed:", exc_value)
            return True              # handled - don't propagate
        return False                 # anything else propagates

with Ignore(ZeroDivisionError):
    1 / 0
print("program continues")

with Ignore(ZeroDivisionError):
    int("x")                         # a different error - not suppressed

# OUTPUT:
# suppressed: division by zero
# program continues
# ValueError: invalid literal for int() with base 10: 'x'`
            ]
        },
        {
            content: `<h3>An Exception in __enter__ Skips __exit__</h3>
<code>__exit__</code> only runs if <code>__enter__</code> completed. If setup fails half-way, <code>__enter__</code> must clean up whatever it already acquired itself.`,
            codeExamples: [
                `class Broken:
    def __enter__(self):
        print("entering")
        raise ConnectionError("cannot connect")

    def __exit__(self, exc_type, exc_value, traceback):
        print("exiting")             # never runs
        return False

try:
    with Broken():
        print("body")                # never runs
except ConnectionError as error:
    print("caught:", error)

# OUTPUT:
# entering
# caught: cannot connect`
            ]
        },
        {
            content: `<h3>The Methods Are Looked Up on the Class</h3>
<code>with</code> looks for <code>__enter__</code> and <code>__exit__</code> on the object's <b>type</b>, not the instance. An object without them can't be used in a <code>with</code> statement.`,
            codeExamples: [
                `class Plain:
    pass

with Plain():
    pass

# OUTPUT:
# TypeError: 'Plain' object does not support the context manager protocol`
            ]
        },
        {
            content: `<h3>Async Context Managers</h3>
Asynchronous code uses <code>async with</code>, which calls <code>__aenter__</code> and <code>__aexit__</code> - the same protocol, but both methods are coroutines (<code>async def</code>), so setup and teardown can <code>await</code> network or database operations. They are covered in the Async Python module.`,
            codeExamples: [
                `class AsyncSession:
    async def __aenter__(self):
        print("connecting...")       # e.g. await client.connect()
        return self

    async def __aexit__(self, exc_type, exc_value, traceback):
        print("disconnecting...")    # e.g. await client.close()
        return False

# Used inside an async function:
# async def main():
#     async with AsyncSession() as session:
#         ...`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which methods make an object a context manager?</td><td><code>__enter__</code> and <code>__exit__</code> (or <code>__aenter__</code>/<code>__aexit__</code> for async with)</td></tr>
<tr class='text-center'><td>What does <code>as</code> bind?</td><td>The return value of <code>__enter__</code> - usually self, but it can be anything</td></tr>
<tr class='text-center'><td>What arguments does __exit__ receive?</td><td>exc_type, exc_value, traceback - all None when no exception occurred</td></tr>
<tr class='text-center'><td>How can __exit__ suppress an exception?</td><td>By returning a truthy value</td></tr>
<tr class='text-center'><td>Does __exit__ run if __enter__ raises?</td><td>No - only after __enter__ completes successfully</td></tr>
<tr class='text-center'><td>What happens if __exit__ returns None?</td><td>None is falsy, so the exception (if any) propagates</td></tr>
</table>`
        }
    ]
};
