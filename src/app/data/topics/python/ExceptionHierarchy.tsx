import type { Topic } from '../../types';

export const exceptionHierarchy: Topic = {
    id: 'python-exceptions-exception-hierarchy',
    name: 'Exception Hierarchy',
    beginner: [
        {
            content: `<h4>Exceptions Are Classes in a Tree</h4>
Every exception is a class, and all of them inherit from <code>BaseException</code>. Directly under it sit a few special exceptions that are <b>not errors in your code</b> - <code>SystemExit</code>, <code>KeyboardInterrupt</code> and <code>GeneratorExit</code> - and <code>Exception</code>, the parent of everything else. Here is the part of the tree you will meet most often (Python 3.12):`,
            codeExamples: [
                `BaseException
 ├── SystemExit                 raised by sys.exit()
 ├── KeyboardInterrupt          Ctrl+C
 ├── GeneratorExit
 └── Exception                  parent of all "normal" errors
      ├── ArithmeticError
      │    ├── OverflowError
      │    └── ZeroDivisionError
      ├── AssertionError
      ├── AttributeError
      ├── EOFError
      ├── ImportError
      │    └── ModuleNotFoundError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── NameError
      │    └── UnboundLocalError
      ├── OSError
      │    ├── FileExistsError
      │    ├── FileNotFoundError
      │    ├── PermissionError
      │    └── TimeoutError
      ├── RuntimeError
      │    ├── NotImplementedError
      │    └── RecursionError
      ├── StopIteration
      ├── TypeError
      ├── ValueError
      │    └── UnicodeError
      │         ├── UnicodeDecodeError
      │         └── UnicodeEncodeError
      └── Warning
           ├── DeprecationWarning
           └── UserWarning`
            ]
        },
        {
            content: `<h4>Catching a Parent Catches Its Children</h4>
<code>except LookupError</code> handles both <code>KeyError</code> and <code>IndexError</code>, because they are subclasses of it. This lets you handle a whole family of related errors in one place.`,
            codeExamples: [
                `data = {"a": 1}
items = [10, 20]

for action in (lambda: data["z"], lambda: items[5], lambda: 1 / 0):
    try:
        action()
    except LookupError as e:
        print("lookup problem:", type(e).__name__, e)
    except ArithmeticError as e:
        print("math problem:", type(e).__name__, e)

# OUTPUT:
# lookup problem: KeyError 'z'
# lookup problem: IndexError list index out of range
# math problem: ZeroDivisionError division by zero`
            ]
        },
        {
            content: `<h4>Order Matters: Specific Before General</h4>
Python checks <code>except</code> clauses top to bottom and runs the first one that matches. If a parent class comes first, the more specific clause below it can never run.`,
            codeExamples: [
                `try:
    open("missing.txt")
except OSError:
    print("some OS error")           # catches FileNotFoundError too
except FileNotFoundError:
    print("never reached")

try:
    open("missing.txt")
except FileNotFoundError:
    print("file not found")          # specific first
except OSError:
    print("other OS error")

# OUTPUT:
# some OS error
# file not found`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Inspecting the Hierarchy</h3>
<code>__mro__</code> (method resolution order) lists a class and all its ancestors; <code>issubclass()</code> tests one relationship.`,
            codeExamples: [
                `print(FileNotFoundError.__mro__)
print(issubclass(KeyError, LookupError))
print(issubclass(KeyboardInterrupt, Exception))
print(IOError is OSError)

# OUTPUT:
# (<class 'FileNotFoundError'>, <class 'OSError'>, <class 'Exception'>, <class 'BaseException'>, <class 'object'>)
# True
# False
# True`
            ]
        },
        {
            content: `<h3>Why except Exception Doesn't Catch Ctrl+C</h3>
<code>KeyboardInterrupt</code> and <code>SystemExit</code> inherit from <code>BaseException</code> directly, <b>not</b> from <code>Exception</code>. So a broad <code>except Exception</code> still lets the user stop the program and lets <code>sys.exit()</code> work. A bare <code>except:</code> (or <code>except BaseException</code>) catches them too - which is why it is discouraged.`,
            codeExamples: [
                `import sys

try:
    sys.exit(1)
except Exception:
    print("not reached")
except SystemExit as e:
    print("SystemExit with code", e.code)

# OUTPUT:
# SystemExit with code 1`
            ]
        },
        {
            content: `<h3>OSError and errno</h3>
Operating-system errors carry an <code>errno</code> code. Since Python 3.3 the common codes map to subclasses - <code>FileNotFoundError</code> is an <code>OSError</code> with <code>errno.ENOENT</code>. Creating an <code>OSError</code> with a known errno even returns the matching subclass. <code>IOError</code> and <code>EnvironmentError</code> are now just aliases of <code>OSError</code>.`,
            codeExamples: [
                `import errno

try:
    open("no_such_file.txt")
except OSError as e:
    print(type(e).__name__, e.errno == errno.ENOENT, e.filename)

err = OSError(errno.ENOENT, "missing")
print(type(err).__name__)

# OUTPUT:
# FileNotFoundError True no_such_file.txt
# FileNotFoundError`
            ]
        },
        {
            content: `<h3>Warnings Are Exceptions Too</h3>
<code>Warning</code> and its subclasses live under <code>Exception</code>. Normally the <code>warnings</code> module just <b>prints</b> them instead of raising, so the program continues. Libraries use <code>DeprecationWarning</code> to announce features that will be removed; filters can turn warnings into errors during testing.`,
            codeExamples: [
                `import warnings

def old_api():
    warnings.warn("old_api() is deprecated; use new_api()", DeprecationWarning, stacklevel=2)
    return 42

with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    old_api()

print(caught[0].category.__name__, "-", caught[0].message)
print(issubclass(DeprecationWarning, Exception))

# OUTPUT:
# DeprecationWarning - old_api() is deprecated; use new_api()
# True`
            ]
        },
        {
            content: `<h3>Compared with Java's Hierarchy</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>Throwable</code> (root)</td><td><code>BaseException</code></td></tr>
<tr class='text-center'><td><code>Error</code> (OutOfMemoryError...) - don't catch</td><td>Roughly <code>SystemExit</code>, <code>KeyboardInterrupt</code> under BaseException; <code>MemoryError</code> sits under Exception</td></tr>
<tr class='text-center'><td><code>Exception</code> - checked, must be declared or caught</td><td><code>Exception</code> - nothing is checked</td></tr>
<tr class='text-center'><td><code>RuntimeException</code> - unchecked</td><td>All Python exceptions behave like unchecked exceptions</td></tr>
<tr class='text-center'><td><code>IOException</code></td><td><code>OSError</code></td></tr>
<tr class='text-center'><td><code>ArrayIndexOutOfBoundsException</code></td><td><code>IndexError</code></td></tr>
<tr class='text-center'><td><code>NullPointerException</code></td><td>Usually <code>AttributeError</code> / <code>TypeError</code> on <code>None</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the root of all exceptions?</td><td><code>BaseException</code>; normal errors derive from its subclass <code>Exception</code></td></tr>
<tr class='text-center'><td>Why doesn't <code>except Exception</code> catch Ctrl+C?</td><td>KeyboardInterrupt (and SystemExit) inherit directly from BaseException</td></tr>
<tr class='text-center'><td>What is the parent of KeyError and IndexError?</td><td><code>LookupError</code></td></tr>
<tr class='text-center'><td>Why must specific except clauses come first?</td><td>The first matching clause wins; a parent class listed earlier would catch the child</td></tr>
<tr class='text-center'><td>Is IOError still a separate class?</td><td>No - it is an alias of OSError since Python 3.3</td></tr>
<tr class='text-center'><td>Does Python have checked exceptions?</td><td>No - all exceptions are effectively unchecked</td></tr>
</table>`
        }
    ]
};
