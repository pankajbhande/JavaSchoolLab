import type { Topic } from '../../types';

export const contextManagerClass: Topic = {
    id: 'python-context-managers-writing-a-context-manager-class',
    name: 'Writing a Context Manager Class',
    beginner: [
        {
            content: `<h4>The Recipe</h4>
1. Do the setup in <code>__enter__</code> and return the object the caller should use (usually <code>self</code>).<br>
2. Do the cleanup in <code>__exit__</code>, using the exception arguments if the behaviour should differ on failure.<br>
3. Return <code>False</code> from <code>__exit__</code> unless you deliberately want to swallow an exception.<br><br>
The examples below are small but realistic patterns you will meet in real projects.`
        },
        {
            content: `<h4>A Timer</h4>
Measure how long a block takes. The elapsed time is stored on the object so code after the block can use it.`,
            codeExamples: [
                `import time

class Timer:
    def __init__(self, label):
        self.label = label

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.elapsed = time.perf_counter() - self.start
        print(f"{self.label}: {self.elapsed:.3f}s")
        return False

with Timer("sum of a million") as t:
    total = sum(range(1_000_000))

print(total, t.elapsed > 0)

# OUTPUT (the time varies by machine - e.g.):
# sum of a million: 0.012s
# 499999500000 True`
            ]
        },
        {
            content: `<h4>Temporarily Changing the Working Directory</h4>
Save the old state in <code>__enter__</code>, restore it in <code>__exit__</code> - the "change it, then put it back" pattern.`,
            codeExamples: [
                `import os
import tempfile

class ChangeDirectory:
    def __init__(self, path):
        self.path = path

    def __enter__(self):
        self.old = os.getcwd()
        os.chdir(self.path)
        return self.path

    def __exit__(self, exc_type, exc_value, traceback):
        os.chdir(self.old)              # restored even if the block fails
        return False

before = os.getcwd()
with tempfile.TemporaryDirectory() as folder:
    with ChangeDirectory(folder):
        print("moved:", os.getcwd() != before)
    print("restored:", os.getcwd() == before)

# OUTPUT:
# moved: True
# restored: True`
            ]
        },
        {
            content: `<h4>A Database Transaction</h4>
Commit when the block succeeds; roll back when it raises - then let the error propagate so the caller knows. A fake connection with prints shows what happens.`,
            codeExamples: [
                `class FakeConnection:
    def begin(self):
        print("BEGIN")

    def commit(self):
        print("COMMIT")

    def rollback(self):
        print("ROLLBACK")


class Transaction:
    def __init__(self, conn):
        self.conn = conn

    def __enter__(self):
        self.conn.begin()
        return self.conn

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        return False                    # don't hide the error


conn = FakeConnection()

with Transaction(conn):
    print("transfer 500")

try:
    with Transaction(conn):
        print("transfer 9999")
        raise ValueError("insufficient funds")
except ValueError as error:
    print("Error:", error)

# OUTPUT:
# BEGIN
# transfer 500
# COMMIT
# BEGIN
# transfer 9999
# ROLLBACK
# Error: insufficient funds`
            ]
        },
        {
            content: `<h4>An Indentation Printer</h4>
Each nested <code>with</code> increases the indentation level, and leaving the block decreases it again.`,
            codeExamples: [
                `class Indenter:
    def __init__(self):
        self.level = 0

    def __enter__(self):
        self.level += 1
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.level -= 1
        return False

    def write(self, text):
        print("    " * self.level + text)

with Indenter() as out:
    out.write("level 1")
    with out:
        out.write("level 2")
        with out:
            out.write("level 3")
    out.write("back to level 1")

# OUTPUT:
#     level 1
#         level 2
#             level 3
#     back to level 1`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Single-Use, Reusable and Reentrant</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Kind</th><th>Meaning</th><th>Examples</th></tr>
<tr class='text-center'><td>Single-use</td><td>Can be used in one <code>with</code> only</td><td>File objects, <code>@contextmanager</code> objects</td></tr>
<tr class='text-center'><td>Reusable</td><td>Can be used in many <code>with</code> statements, one after another</td><td><code>threading.Lock</code>, the Timer above</td></tr>
<tr class='text-center'><td>Reentrant</td><td>Can also be entered again while already inside itself</td><td><code>threading.RLock</code>, <code>redirect_stdout</code>, the Indenter above</td></tr>
</table>
A plain <code>Lock</code> is reusable but not reentrant: acquiring it a second time from inside its own block would wait forever.`,
            codeExamples: [
                `import io

f = io.StringIO("data")
with f:
    print(f.read())

with f:                          # the file was closed by the first with
    pass

# OUTPUT:
# data
# ValueError: I/O operation on closed file.`
            ]
        },
        {
            content: `<h3>Making an Existing Class Work with with</h3>
If a class already has a <code>close()</code> method - like Java's <code>AutoCloseable</code> - two small methods make it a context manager.`,
            codeExamples: [
                `class ReportWriter:
    def __init__(self, title):
        self.lines = [title]
        self.closed = False

    def add(self, line):
        self.lines.append(line)

    def close(self):
        self.closed = True
        print("\\n".join(self.lines))

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.close()
        return False

with ReportWriter("Monthly Report") as report:
    report.add("Sales: 120")
    report.add("Returns: 4")
print(report.closed)

# OUTPUT:
# Monthly Report
# Sales: 120
# Returns: 4
# True`
            ]
        },
        {
            content: `<h3>contextlib.closing() for Classes You Can't Change</h3>
When a third-party object has <code>close()</code> but no <code>__enter__</code>/<code>__exit__</code>, wrap it in <code>contextlib.closing</code>.`,
            codeExamples: [
                `from contextlib import closing

class LegacyConnection:
    def query(self):
        return "42 rows"

    def close(self):
        print("connection closed")

with closing(LegacyConnection()) as conn:
    print(conn.query())

# OUTPUT:
# 42 rows
# connection closed`
            ]
        },
        {
            content: `<h3>contextlib.AbstractContextManager</h3>
Subclassing <code>AbstractContextManager</code> documents the intent and supplies a default <code>__enter__</code> that returns <code>self</code>, so you only write <code>__exit__</code>. It also makes <code>isinstance(obj, AbstractContextManager)</code> work for any class with both methods.`,
            codeExamples: [
                `from contextlib import AbstractContextManager

class Resource(AbstractContextManager):
    def __exit__(self, exc_type, exc_value, traceback):
        print("released")
        return None

with Resource() as r:
    print(type(r).__name__)

print(isinstance(open, AbstractContextManager))
print(isinstance(Resource(), AbstractContextManager))

# OUTPUT:
# Resource
# released
# False
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you write a context manager class?</td><td>Define __enter__ (setup, return the usable object) and __exit__ (cleanup, return False unless suppressing)</td></tr>
<tr class='text-center'><td>How should a transaction manager behave on error?</td><td>Roll back in __exit__ and return False so the exception still reaches the caller</td></tr>
<tr class='text-center'><td>Reusable vs reentrant?</td><td>Reusable: usable in several with statements one after another. Reentrant: can also be entered again while already active</td></tr>
<tr class='text-center'><td>How do you use a close()-only object with with?</td><td>Add __enter__/__exit__, or wrap it in contextlib.closing()</td></tr>
<tr class='text-center'><td>What does AbstractContextManager provide?</td><td>A default __enter__ returning self, an abstract __exit__, and isinstance support</td></tr>
</table>`
        }
    ]
};
