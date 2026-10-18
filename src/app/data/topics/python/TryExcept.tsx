import type { Topic } from '../../types';

export const tryExcept: Topic = {
    id: 'python-exceptions-try-except',
    name: 'try & except',
    beginner: [
        {
            content: `<h4>The Basic Form</h4>
Put the code that might fail in a <code>try</code> block. If an exception of the named type happens, Python jumps to the matching <code>except</code> block instead of stopping the program. If nothing goes wrong, the <code>except</code> block is skipped.`,
            codeExamples: [
                `try:
    result = 10 / 0
    print("this line is skipped")
except ZeroDivisionError:
    print("Cannot divide by zero")

print("program continues")

# OUTPUT:
# Cannot divide by zero
# program continues`
            ]
        },
        {
            content: `<h4>Catch a Specific Exception</h4>
Name the exception you expect. Any other exception is <b>not</b> caught and still stops the program - which is what you want for real bugs.`,
            codeExamples: [
                `def to_number(text):
    try:
        return int(text)
    except ValueError:
        return None

print(to_number("42"))
print(to_number("forty-two"))
print(to_number(None))

# OUTPUT:
# 42
# None
# TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'`
            ]
        },
        {
            content: `<h4>Getting the Exception Object with as</h4>
<code>except SomeError as e</code> binds the exception object to <code>e</code>, so you can show or log its message.`,
            codeExamples: [
                `prices = {"pen": 10, "book": 250}

try:
    print(prices["bag"])
except KeyError as e:
    print("Missing item:", e)

try:
    int("12a")
except ValueError as e:
    print("Bad number ->", e)

# OUTPUT:
# Missing item: 'bag'
# Bad number -> invalid literal for int() with base 10: '12a'`
            ]
        },
        {
            content: `<h4>Validating User Input in a Loop</h4>
A classic pattern: keep asking until the conversion succeeds.`,
            codeExamples: [
                `while True:
    text = input("Enter your age: ")
    try:
        age = int(text)
        break                        # success - leave the loop
    except ValueError:
        print(f"{text!r} is not a whole number, try again.")

print("Age saved:", age)

# SAMPLE RUN:
# Enter your age: twenty
# 'twenty' is not a whole number, try again.
# Enter your age: 21
# Age saved: 21`
            ]
        },
        {
            content: `<h4>Catch at the Right Level</h4>
Low-level functions should usually let exceptions propagate; the code that knows what to <b>do</b> about the problem - show a message, retry, use a default - is the place to catch it.`,
            codeExamples: [
                `def parse_marks(line):
    name, marks = line.split(",")
    return name, int(marks)             # no try here - let errors propagate

lines = ["Abaji,91", "Raoji,abc", "Kanhoji,85"]
for line in lines:
    try:
        name, marks = parse_marks(line)
        print(name, marks)
    except ValueError as e:             # the caller decides: skip bad rows
        print(f"Skipping {line!r}: {e}")

# OUTPUT:
# Abaji 91
# Skipping 'Raoji,abc': invalid literal for int() with base 10: 'abc'
# Kanhoji 85`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why Bare except: Is Dangerous</h3>
A bare <code>except:</code> catches <b>everything</b> - including <code>KeyboardInterrupt</code> (Ctrl+C) and <code>SystemExit</code> (<code>sys.exit()</code>), which are meant to stop the program. Those two inherit from <code>BaseException</code>, not <code>Exception</code>, precisely so that <code>except Exception</code> doesn't swallow them.`,
            codeExamples: [
                `import sys

try:
    sys.exit(1)
except:
    print("caught SystemExit - the program refused to exit!")

print(issubclass(SystemExit, Exception), issubclass(KeyboardInterrupt, Exception))

# OUTPUT:
# caught SystemExit - the program refused to exit!
# False False`
            ]
        },
        {
            content: `<h3>Broad Handlers Hide Bugs</h3>
Even <code>except Exception</code> is usually too broad: a simple typo becomes a silent wrong answer instead of a clear error.`,
            codeExamples: [
                `price, qty = 100, 3

try:
    total = price * qtty             # typo: NameError
except Exception:
    total = 0                        # bug hidden - total is silently 0

print(total)

# OUTPUT:
# 0`
            ]
        },
        {
            content: `<h3>Keep the try Block Small</h3>
Only wrap the line that can raise the exception you are handling. A big <code>try</code> block can catch the same exception type from a <b>different</b> line and handle it wrongly.`,
            codeExamples: [
                `config = {"port": "80a", "timeout": "30"}

# Too broad: which int() failed?
try:
    port = int(config["port"])
    timeout = int(config["timeout"])
except ValueError:
    print("bad config")

# Focused: each failure gets the right message
try:
    port = int(config["port"])
except ValueError:
    port = 8080
    print("bad port, using", port)
timeout = int(config["timeout"])
print(port, timeout)

# OUTPUT:
# bad config
# bad port, using 8080
# 8080 30`
            ]
        },
        {
            content: `<h3>The as Name Is Deleted After the Block</h3>
To avoid keeping large tracebacks alive, Python deletes the <code>as</code> variable when the <code>except</code> block ends. Copy it to another name if you need it later.`,
            codeExamples: [
                `try:
    1 / 0
except ZeroDivisionError as err:
    saved = err
    print("caught:", err)

print("saved:", saved)
print(err)

# OUTPUT:
# caught: division by zero
# saved: division by zero
# NameError: name 'err' is not defined`
            ]
        },
        {
            content: `<h3>Logging the Full Traceback</h3>
In real applications, don't just print the message - log the traceback so the problem can be diagnosed later. Inside an <code>except</code> block, <code>logging.exception()</code> logs a message plus the traceback; <code>traceback.format_exc()</code> returns it as a string.`,
            codeExamples: [
                `import logging
import traceback

def parse(text):
    return int(text)

try:
    parse("12a")
except ValueError:
    logging.exception("Could not parse input")    # message + traceback to the log
    details = traceback.format_exc()
    print(details.splitlines()[0])
    print(details.splitlines()[-1])

# OUTPUT (the logging lines go to stderr; printed lines shown):
# Traceback (most recent call last):
# ValueError: invalid literal for int() with base 10: '12a'`
            ]
        },
        {
            content: `<h3>Return a Default or Re-raise?</h3>
Catch an exception only if you can handle it properly. If a missing value has a sensible default, return it. If the error means the input is genuinely broken, let it propagate - a bare <code>raise</code> inside <code>except</code> re-raises the current exception unchanged.`,
            codeExamples: [
                `def load_port(config):
    try:
        return int(config["port"])
    except KeyError:
        return 8080          # missing is fine - use the default
    except ValueError:
        print("invalid port in config")
        raise                # malformed is a real error - pass it on

print(load_port({}))
print(load_port({"port": "9000"}))
print(load_port({"port": "abc"}))

# OUTPUT:
# 8080
# 9000
# invalid port in config
# ValueError: invalid literal for int() with base 10: 'abc'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why avoid a bare <code>except:</code>?</td><td>It also catches KeyboardInterrupt and SystemExit and hides every bug; catch specific exceptions</td></tr>
<tr class='text-center'><td>Does <code>except Exception</code> catch Ctrl+C?</td><td>No - KeyboardInterrupt derives from BaseException, not Exception</td></tr>
<tr class='text-center'><td>What does <code>except ValueError as e</code> give you?</td><td>The exception object; <code>str(e)</code> is its message and <code>e.args</code> its arguments</td></tr>
<tr class='text-center'><td>Why keep try blocks small?</td><td>So you only handle the exception from the line you expect, not the same type from another line</td></tr>
<tr class='text-center'><td>Is the <code>as</code> variable available after the except block?</td><td>No - Python deletes it at the end of the block</td></tr>
<tr class='text-center'><td>What does a bare <code>raise</code> do?</td><td>Inside an except block, re-raises the exception currently being handled</td></tr>
</table>`
        }
    ]
};
