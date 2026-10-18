import type { Topic } from '../../types';

export const contextUsingWith: Topic = {
    id: 'python-context-managers-using-the-with-statement',
    name: 'Using the with Statement',
    beginner: [
        {
            content: `<h4>The Setup / Teardown Pattern</h4>
Many resources follow the same shape: <b>acquire</b> something, <b>use</b> it, then <b>release</b> it - open and close a file, lock and unlock a lock, begin and commit a transaction. Forgetting the release step, or skipping it because an error happened, causes leaked files, deadlocks and half-finished updates.<br><br>
A <b>context manager</b> packages the setup and the teardown together. The <code>with</code> statement runs the setup, runs your block, and then <b>always</b> runs the teardown - even if the block raises an exception. It is Python's equivalent of Java's try-with-resources.`,
            codeExamples: [
                `import threading

lock = threading.Lock()

with lock:                          # acquire
    print("inside:", lock.locked())
                                    # release happens automatically here
print("after:", lock.locked())

# OUTPUT:
# inside: True
# after: False`
            ]
        },
        {
            content: `<h4>Context Managers Beyond Files</h4>
<code>with open(...)</code> is the famous example, but the standard library has many more.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Context manager</th><th>Setup</th><th>Teardown</th></tr>
<tr class='text-center'><td><code>open(path)</code></td><td>Open the file</td><td>Close it</td></tr>
<tr class='text-center'><td><code>threading.Lock()</code></td><td>Acquire the lock</td><td>Release it</td></tr>
<tr class='text-center'><td><code>decimal.localcontext()</code></td><td>Copy the decimal settings</td><td>Restore the old settings</td></tr>
<tr class='text-center'><td><code>tempfile.TemporaryDirectory()</code></td><td>Create a temp folder</td><td>Delete it and its contents</td></tr>
<tr class='text-center'><td><code>contextlib.suppress(Error)</code></td><td>-</td><td>Swallow that exception type</td></tr>
<tr class='text-center'><td><code>contextlib.redirect_stdout(f)</code></td><td>Send print() output to f</td><td>Restore sys.stdout</td></tr>
<tr class='text-center'><td><code>zipfile.ZipFile(...)</code></td><td>Open the archive</td><td>Write the index and close it</td></tr>
<tr class='text-center'><td><code>sqlite3</code> connection</td><td>-</td><td>Commit, or roll back on error</td></tr>
</table>`
        },
        {
            content: `<h4>Temporary Settings and Temporary Folders</h4>`,
            codeExamples: [
                `from decimal import Decimal, localcontext

with localcontext() as ctx:
    ctx.prec = 5                    # only inside this block
    print(Decimal(1) / Decimal(7))
print(Decimal(1) / Decimal(7))      # default precision (28 digits) is back

# OUTPUT:
# 0.14286
# 0.1428571428571428571428571429`,
                `import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as folder:
    note = Path(folder) / "notes.txt"
    note.write_text("hello", encoding="utf-8")
    print(note.exists())
print(note.exists())                # the whole folder was deleted

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h4>suppress and redirect_stdout</h4>`,
            codeExamples: [
                `import io
from contextlib import suppress, redirect_stdout

with suppress(KeyError):
    {}["missing"]                   # KeyError is swallowed
print("still running")

buffer = io.StringIO()
with redirect_stdout(buffer):
    print("captured text")          # goes into buffer, not the screen
print(repr(buffer.getvalue()))

# OUTPUT:
# still running
# 'captured text\\n'`
            ]
        },
        {
            content: `<h4>Zip Archives and Database Transactions</h4>
A <code>sqlite3</code> connection used in <code>with</code> commits when the block succeeds and <b>rolls back</b> when it raises - but it does <b>not</b> close the connection.`,
            codeExamples: [
                `import io
import zipfile

buffer = io.BytesIO()
with zipfile.ZipFile(buffer, "w") as zf:
    zf.writestr("a.txt", "hello")
    zf.writestr("b.txt", "world")

with zipfile.ZipFile(buffer) as zf:
    print(zf.namelist())
    print(zf.read("a.txt"))

# OUTPUT:
# ['a.txt', 'b.txt']
# b'hello'`,
                `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (name TEXT, balance INTEGER)")
conn.execute("INSERT INTO accounts VALUES ('Abaji', 1000)")
conn.commit()

try:
    with conn:                      # commit on success, rollback on error
        conn.execute("UPDATE accounts SET balance = balance - 300 WHERE name = 'Abaji'")
        raise ValueError("payment gateway failed")
except ValueError as error:
    print("Error:", error)

print(conn.execute("SELECT balance FROM accounts").fetchone())
conn.close()                        # with conn does not close it

# OUTPUT:
# Error: payment gateway failed
# (1000,)`
            ]
        },
        {
            content: `<h4>Several Managers in One with</h4>
Separate them with commas. They are entered left to right and exited in the <b>reverse</b> order, exactly like nested <code>with</code> blocks. Since Python 3.10 you can also wrap them in parentheses across several lines.`,
            codeExamples: [
                `import io
from contextlib import redirect_stdout, suppress

buffer = io.StringIO()
with redirect_stdout(buffer), suppress(ZeroDivisionError):
    print("before")
    1 / 0
    print("never printed")

print(repr(buffer.getvalue()))

# OUTPUT:
# 'before\\n'`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What with Really Does</h3>
A <code>with</code> statement is roughly this <code>try</code> block. The manager's <code>__enter__</code> runs first and its result is bound by <code>as</code>; <code>__exit__</code> always runs, receiving the exception details if the block failed, and may decide to suppress the exception.`,
            codeExamples: [
                `# with EXPR as TARGET:
#     BODY
# is roughly equivalent to:

manager = EXPR
value = type(manager).__enter__(manager)
try:
    TARGET = value
    BODY
except BaseException as e:
    if not type(manager).__exit__(manager, type(e), e, e.__traceback__):
        raise                       # re-raise unless __exit__ returned True
else:
    type(manager).__exit__(manager, None, None, None)`
            ]
        },
        {
            content: `<h3>Cleanup Happens Even When the Block Fails</h3>
This is the whole point: an exception inside the block still releases the resource, and then continues to propagate.`,
            codeExamples: [
                `import threading

lock = threading.Lock()

try:
    with lock:
        raise RuntimeError("boom")
except RuntimeError as error:
    print("caught:", error)

print("lock still held?", lock.locked())

# OUTPUT:
# caught: boom
# lock still held? False`
            ]
        },
        {
            content: `<h3>ExitStack: A Dynamic Number of Resources</h3>
When you don't know until runtime how many resources you need, <code>contextlib.ExitStack</code> collects them. Everything entered through it is closed in reverse order when the stack's own <code>with</code> block ends - even if opening a later one fails.`,
            codeExamples: [
                `import tempfile
from contextlib import ExitStack
from pathlib import Path

with tempfile.TemporaryDirectory() as folder:
    names = ["a.txt", "b.txt", "c.txt"]

    with ExitStack() as stack:
        files = [stack.enter_context(open(Path(folder) / n, "w", encoding="utf-8"))
                 for n in names]
        for f, n in zip(files, names):
            f.write(n.upper())
        print(all(not f.closed for f in files))
        stack.callback(print, "stack closing")   # any cleanup function

    print(all(f.closed for f in files))
    print(sorted(p.name for p in Path(folder).iterdir()))

# OUTPUT:
# True
# stack closing
# True
# ['a.txt', 'b.txt', 'c.txt']`
            ]
        },
        {
            content: `<h3>Compared with Java try-with-resources</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Syntax</td><td><code>try (var r = open()) { ... }</code></td><td><code>with open() as r: ...</code></td></tr>
<tr class='text-center'><td>Protocol</td><td><code>AutoCloseable.close()</code></td><td><code>__enter__</code> and <code>__exit__</code></td></tr>
<tr class='text-center'><td>Setup hook</td><td>The constructor / factory call</td><td><code>__enter__</code>, whose return value is bound by <code>as</code></td></tr>
<tr class='text-center'><td>Sees the exception?</td><td>No - close() gets no exception info</td><td>Yes - <code>__exit__</code> receives type, value and traceback</td></tr>
<tr class='text-center'><td>Can swallow the exception?</td><td>No</td><td>Yes - by returning True from <code>__exit__</code></td></tr>
<tr class='text-center'><td>Dynamic number of resources</td><td>Manual nesting</td><td><code>contextlib.ExitStack</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a context manager?</td><td>An object that defines setup and teardown around a block of code, used with the <code>with</code> statement</td></tr>
<tr class='text-center'><td>Does cleanup run if the block raises?</td><td>Yes - __exit__ always runs, then the exception propagates unless __exit__ suppresses it</td></tr>
<tr class='text-center'><td>In what order are multiple managers exited?</td><td>Reverse order of entry - last entered, first exited</td></tr>
<tr class='text-center'><td>Name context managers other than open()</td><td>threading.Lock, decimal.localcontext, tempfile.TemporaryDirectory, contextlib.suppress, redirect_stdout, zipfile.ZipFile, sqlite3 connections</td></tr>
<tr class='text-center'><td>Does <code>with sqlite3_connection:</code> close the connection?</td><td>No - it commits or rolls back the transaction; call close() separately</td></tr>
<tr class='text-center'><td>What is ExitStack for?</td><td>Managing a variable number of context managers and cleanup callbacks in one block</td></tr>
</table>`
        }
    ]
};
