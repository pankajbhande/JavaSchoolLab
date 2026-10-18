import type { Topic } from '../../types';

export const withStatement: Topic = {
    id: 'python-file-handling-the-with-statement',
    name: 'The with Statement',
    beginner: [
        {
            content: `<h4>The Problem with Manual close()</h4>
Calling <code>close()</code> yourself works only if execution reaches that line. If an exception happens in between, <code>close()</code> is skipped and the file stays open.`,
            codeExamples: [
                `f = open("data.txt", "w", encoding="utf-8")
try:
    f.write("line 1\\n")
    result = 10 / 0                 # something goes wrong
    f.close()                       # never reached
except ZeroDivisionError:
    print("error!")

print("closed?", f.closed)

# OUTPUT:
# error!
# closed? False`
            ]
        },
        {
            content: `<h4>with Closes the File for You</h4>
<code>with open(...) as f:</code> opens the file, runs the indented block, and <b>always</b> closes the file when the block ends - normally, through <code>return</code>, or because of an exception. This is the standard way to work with files in Python.`,
            codeExamples: [
                `with open("data.txt", "w", encoding="utf-8") as f:
    f.write("hello\\n")
    print("inside, closed?", f.closed)

print("after, closed?", f.closed)

# OUTPUT:
# inside, closed? False
# after, closed? True`
            ]
        },
        {
            content: `<h4>Even When an Exception Happens</h4>`,
            codeExamples: [
                `try:
    with open("data.txt", "w", encoding="utf-8") as f:
        f.write("partial\\n")
        raise ValueError("bad data")
except ValueError as error:
    print("caught:", error)

print("closed?", f.closed)

with open("data.txt", encoding="utf-8") as f:
    print(f.read(), end="")             # the write was flushed on close

# OUTPUT:
# caught: bad data
# closed? True
# partial`
            ]
        },
        {
            content: `<h4>Several Files in One with</h4>
Separate the files with commas. A common pattern is reading one file and writing a transformed copy to another.`,
            codeExamples: [
                `with open("names.txt", "w", encoding="utf-8") as f:
    f.write("abaji\\nraoji\\nkanhoji\\n")

with open("names.txt", encoding="utf-8") as src, open("upper.txt", "w", encoding="utf-8") as dst:
    for line in src:
        dst.write(line.upper())

with open("upper.txt", encoding="utf-8") as f:
    print(f.read(), end="")

# OUTPUT:
# ABAJI
# RAOJI
# KANHOJI`
            ]
        },
        {
            content: `<h4>Long with Statements (Python 3.10+)</h4>
Since Python 3.10 you can wrap the context managers in parentheses and put each on its own line.`,
            codeExamples: [
                `with open("names.txt", "w", encoding="utf-8") as f:
    f.write("abaji\\nraoji\\nkanhoji\\n")

with (
    open("names.txt", encoding="utf-8") as src,
    open("copy.txt", "w", encoding="utf-8") as dst,
):
    dst.write(src.read())

with open("copy.txt", encoding="utf-8") as f:
    print(len(f.readlines()), "lines copied")

# OUTPUT:
# 3 lines copied`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What with Does Under the Hood</h3>
The object after <code>with</code> is a <b>context manager</b>. Python calls its <code>__enter__()</code> method at the start (its return value is bound by <code>as</code>) and its <code>__exit__()</code> method at the end, passing details of any exception. A file's <code>__exit__</code> closes it. Writing your own context managers is covered in the <i>Context Managers</i> module.`,
            codeExamples: [
                `f = open("data.txt", "w", encoding="utf-8")
print(f.__enter__() is f)        # files return themselves from __enter__
f.__exit__(None, None, None)     # what with calls when the block ends
print(f.closed)

# OUTPUT:
# True
# True`
            ]
        },
        {
            content: `<h3>The try/finally Equivalent</h3>
A <code>with</code> block over a file behaves like this <code>try/finally</code> - just shorter, and impossible to get wrong.`,
            codeExamples: [
                `# with open("data.txt", encoding="utf-8") as f:
#     content = f.read()

with open("data.txt", "w", encoding="utf-8") as f:
    f.write("hello")

f = open("data.txt", encoding="utf-8")
try:
    content = f.read()
finally:
    f.close()                    # runs whether or not an exception occurred

print(content, f.closed)

# OUTPUT:
# hello True`
            ]
        },
        {
            content: `<h3>Compared with Java try-with-resources</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Syntax</td><td><code>try (var r = new BufferedReader(...)) { ... }</code></td><td><code>with open(...) as f: ...</code></td></tr>
<tr class='text-center'><td>Protocol</td><td>Implements <code>AutoCloseable.close()</code></td><td>Implements <code>__enter__</code> / <code>__exit__</code></td></tr>
<tr class='text-center'><td>Can see the exception?</td><td>No - close() gets no exception details</td><td>Yes - <code>__exit__</code> receives it and may even suppress it</td></tr>
<tr class='text-center'><td>Multiple resources</td><td>Separated by <code>;</code>, closed in reverse order</td><td>Separated by <code>,</code>, closed in reverse order</td></tr>
</table>`
        },
        {
            content: `<h3>Not Just Files</h3>
Many standard-library objects are context managers. Each one defines what "clean up" means for it.`,
            codeExamples: [
                `import threading
import tempfile
import zipfile

lock = threading.Lock()
with lock:                                   # acquired, then always released
    print("locked?", lock.locked())
print("locked?", lock.locked())

with tempfile.TemporaryDirectory() as tmp:   # deleted afterwards
    path = tmp + "/report.zip"
    with zipfile.ZipFile(path, "w") as zf:   # zip archive finalised on exit
        zf.writestr("hello.txt", "hi")
    with zipfile.ZipFile(path) as zf:
        print(zf.namelist())

# OUTPUT:
# locked? True
# locked? False
# ['hello.txt']`
            ]
        },
        {
            content: `<h3>Gotcha: sqlite3 Connections Don't Close</h3>
Using a <code>sqlite3</code> connection in <code>with</code> manages a <b>transaction</b>: it commits if the block succeeds and rolls back if it raises. It does <b>not</b> close the connection. Close it yourself, or wrap it in <code>contextlib.closing()</code>.`,
            codeExamples: [
                `import sqlite3
from contextlib import closing

with closing(sqlite3.connect(":memory:")) as conn:   # closes at the end
    with conn:                                        # commits / rolls back
        conn.execute("CREATE TABLE t (x INTEGER)")
        conn.execute("INSERT INTO t VALUES (42)")
    print(conn.execute("SELECT x FROM t").fetchone())

# OUTPUT:
# (42,)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use with for files?</td><td>The file is closed automatically when the block ends, even if an exception is raised</td></tr>
<tr class='text-center'><td>What methods make an object usable in with?</td><td><code>__enter__</code> and <code>__exit__</code> - the context manager protocol</td></tr>
<tr class='text-center'><td>What is the try/finally equivalent?</td><td>Open, then <code>try:</code> use the file, <code>finally:</code> close it</td></tr>
<tr class='text-center'><td>How do you open two files in one with?</td><td>Separate them with commas; since 3.10 they can be grouped in parentheses over several lines</td></tr>
<tr class='text-center'><td>Is the variable from <code>as</code> usable after the block?</td><td>Yes, the name still exists, but the file is closed - reading it raises ValueError</td></tr>
<tr class='text-center'><td>Does <code>with sqlite3.connect(...)</code> close the connection?</td><td>No - it only commits or rolls back the transaction</td></tr>
</table>`
        }
    ]
};
