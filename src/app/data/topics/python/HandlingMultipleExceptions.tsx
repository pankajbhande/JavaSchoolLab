import type { Topic } from '../../types';

export const handlingMultipleExceptions: Topic = {
    id: 'python-exceptions-handling-multiple-exceptions',
    name: 'Handling Multiple Exceptions',
    beginner: [
        {
            content: `<h4>Several except Blocks</h4>
One <code>try</code> can have several <code>except</code> blocks. Python checks them <b>top to bottom</b> and runs only the <b>first</b> one that matches.`,
            codeExamples: [
                `def safe_divide(a, b):
    try:
        return int(a) / int(b)
    except ValueError:
        return "not a number"
    except ZeroDivisionError:
        return "cannot divide by zero"

print(safe_divide("10", "4"))
print(safe_divide("ten", "4"))
print(safe_divide("10", "0"))

# OUTPUT:
# 2.5
# not a number
# cannot divide by zero`
            ]
        },
        {
            content: `<h4>One Block for Several Types</h4>
When several exceptions need the same handling, list them in a <b>tuple</b>.`,
            codeExamples: [
                `def parse_age(value):
    try:
        return int(value)
    except (ValueError, TypeError) as e:
        print(f"invalid age {value!r}: {type(e).__name__}")
        return None

parse_age("21")
parse_age("abc")
parse_age(None)

# OUTPUT:
# invalid age 'abc': ValueError
# invalid age None: TypeError`
            ]
        },
        {
            content: `<h4>Order Matters: Specific Before General</h4>
An <code>except</code> for a class also catches all of its <b>subclasses</b>. If a general handler comes first, a more specific handler below it can never run.`,
            codeExamples: [
                `data = {"pen": 10}

# Wrong order: LookupError also covers KeyError
try:
    data["bag"]
except LookupError:
    print("LookupError handler")
except KeyError:
    print("KeyError handler")       # never reached

# Right order
try:
    data["bag"]
except KeyError:
    print("KeyError handler")
except LookupError:
    print("LookupError handler")

# OUTPUT:
# LookupError handler
# KeyError handler`
            ]
        },
        {
            content: `<h4>Catching a Base Class</h4>
Related exceptions share a parent class, so one handler can cover the whole family:<br>
• <code>LookupError</code> → <code>KeyError</code>, <code>IndexError</code><br>
• <code>ArithmeticError</code> → <code>ZeroDivisionError</code>, <code>OverflowError</code><br>
• <code>OSError</code> → <code>FileNotFoundError</code>, <code>PermissionError</code>, <code>IsADirectoryError</code>...`,
            codeExamples: [
                `def first_score(scores, name):
    try:
        return scores[name][0]
    except LookupError:              # missing key OR empty list
        return None

scores = {"Abaji": [91, 88], "Raoji": []}
print(first_score(scores, "Abaji"))
print(first_score(scores, "Raoji"))   # IndexError
print(first_score(scores, "Kanhoji"))  # KeyError

print(issubclass(FileNotFoundError, OSError), issubclass(KeyError, LookupError))

# OUTPUT:
# 91
# None
# None
# True True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>ExceptionGroup and except* (Python 3.11+)</h3>
Sometimes several independent errors happen at once - validating every field of a form, or running several tasks concurrently. An <code>ExceptionGroup</code> bundles them, and <code>except*</code> handles each matching <b>part</b> of the group. Unlike plain <code>except</code>, <b>several</b> <code>except*</code> clauses can run for one group.`,
            codeExamples: [
                `def validate(user):
    errors = []
    if not user.get("name"):
        errors.append(ValueError("name is required"))
    if not isinstance(user.get("age"), int):
        errors.append(TypeError("age must be an int"))
    if errors:
        raise ExceptionGroup("invalid user", errors)

try:
    validate({"name": "", "age": "20"})
except* ValueError as group:
    for e in group.exceptions:
        print("value problem:", e)
except* TypeError as group:
    for e in group.exceptions:
        print("type problem:", e)

# OUTPUT:
# value problem: name is required
# type problem: age must be an int`
            ]
        },
        {
            content: `<h3>Ignoring an Exception on Purpose: contextlib.suppress</h3>
When doing nothing really is the right response, <code>suppress</code> says so explicitly - clearer than <code>except ...: pass</code>, and limited to the types you name.`,
            codeExamples: [
                `import os
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove("temp_file_that_may_not_exist.txt")

print("continued without error")

# OUTPUT:
# continued without error`
            ]
        },
        {
            content: `<h3>Mapping Exceptions to Friendly Messages</h3>
Users shouldn't see raw exception names. A dictionary from exception type to message keeps the handling in one place; <code>isinstance</code> makes subclasses match too.`,
            codeExamples: [
                `FRIENDLY = {
    FileNotFoundError: "That file does not exist.",
    PermissionError: "You don't have permission to open it.",
    UnicodeDecodeError: "The file isn't valid UTF-8 text.",
}

def friendly_message(error):
    for exc_type, message in FRIENDLY.items():
        if isinstance(error, exc_type):
            return message
    return "Something went wrong."

print(friendly_message(FileNotFoundError()))
print(friendly_message(PermissionError()))
print(friendly_message(ValueError()))

# OUTPUT:
# That file does not exist.
# You don't have permission to open it.
# Something went wrong.`
            ]
        },
        {
            content: `<h3>Compared with Java Multi-Catch</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>catch (IOException | SQLException e)</code></td><td><code>except (OSError, sqlite3.Error) as e:</code></td></tr>
<tr class='text-center'><td>Several <code>catch</code> blocks, most specific first</td><td>Several <code>except</code> blocks, most specific first</td></tr>
<tr class='text-center'><td>Unreachable catch for a subclass is a compile error</td><td>Unreachable except is silently allowed - be careful with order</td></tr>
<tr class='text-center'><td>No direct equivalent</td><td><code>ExceptionGroup</code> + <code>except*</code> for several errors at once</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you catch two exception types in one block?</td><td>With a tuple: <code>except (ValueError, TypeError) as e:</code></td></tr>
<tr class='text-center'><td>How many except blocks run for one exception?</td><td>Only the first matching one, checked top to bottom</td></tr>
<tr class='text-center'><td>Why put specific exceptions first?</td><td>A handler for a parent class also catches its subclasses, so a later subclass handler would never run</td></tr>
<tr class='text-center'><td>Which base class covers KeyError and IndexError?</td><td>LookupError</td></tr>
<tr class='text-center'><td>What is except* for?</td><td>Handling parts of an ExceptionGroup (3.11+); several except* clauses can run for one group</td></tr>
<tr class='text-center'><td>How do you deliberately ignore an exception?</td><td><code>with contextlib.suppress(SomeError):</code></td></tr>
</table>`
        }
    ]
};
