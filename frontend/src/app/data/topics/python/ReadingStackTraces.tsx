import type { Topic } from '../../types';

export const readingStackTraces: Topic = {
    id: 'python-debugging-reading-stack-traces',
    name: 'Reading Stack Traces',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>traceback</b> (stack trace) is the list of function calls that were active when an exception was raised. Python prints it oldest call first and the <b>exception type and message last</b>, so you read it <i>from the bottom up</i>. Each frame shows the file, the line number, the function name and the source line. Java prints the same idea as <code>Exception in thread "main" ...</code> followed by <code>at</code> lines, but with the newest call first. The <code>traceback</code> module lets a program inspect the same frames.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 321 199" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:321px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="300.1" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="160" y="29.5">main (line 14)  - oldest call</tspan></text><rect x="10" y="47" width="300.1" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="160" y="66.5">read_user (line 9)  - called by main</tspan></text><rect x="10" y="84" width="300.1" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="160" y="103.5">parse_age (line 5)  - raised here</tspan></text><rect x="10" y="121" width="300.1" height="31" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="160" y="140.5">ValueError: invalid literal  - WHAT</tspan></text><rect x="10" y="158" width="300.1" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="160" y="177.5">read the traceback from the bottom up</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: frames run oldest to newest; the last line names the exception</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Beginners see ten lines of red text, panic, and copy the whole thing into a search engine. They miss that the answer is in the last line and the failing line number.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Find <b>what</b> failed (last line), <b>where</b> (last frame) and <b>how we got there</b> (frames above).</li>
<li>Fix errors in minutes instead of guessing.</li>
<li>Understand that the reported line is where the error was <i>detected</i>, not always where the mistake is.</li>
<li>Log or report tracebacks from your own code with the <code>traceback</code> module.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Walking the frames of a traceback</h4>
Instead of letting the program crash, we catch the error and print the same information a traceback contains.`,
            codeExamples: [
                `import traceback


def parse_age(text):
    return int(text)


def read_user(record):
    return parse_age(record["age"])


def main():
    try:
        read_user({"age": "abc"})
    except ValueError as error:
        frames = traceback.extract_tb(error.__traceback__)
        print("Error  :", type(error).__name__, "-", error)
        print("Raised :", frames[-1].name, "->", frames[-1].line)
        print("Call path (oldest first):")
        for frame in frames:
            print(f"  {frame.name} (line {frame.lineno})")


if __name__ == "__main__":
    main()

# OUTPUT:
# Error  : ValueError - invalid literal for int() with base 10: 'abc'
# Raised : parse_age -> return int(text)
# Call path (oldest first):
#   main (line 14)
#   read_user (line 9)
#   parse_age (line 5)`
            ],
            codeExplanations: [
                `traceback.extract_tb() turns the traceback object into a list of frame summaries, oldest first, just like the printed traceback. The last frame is where the exception was raised, so its name and source line answer "where". The list starts at main because that is the function whose try block caught the error.`
            ]
        },
        {
            content: `<h4>What is a Traceback?</h4>
When an exception is not handled, Python stops and prints a <b>traceback</b> (also called a stack trace): the chain of function calls that led to the error. It looks intimidating, but it is the most useful debugging information you will get - it tells you <b>what</b> went wrong, <b>where</b>, and <b>how the program got there</b>.`
        },
        {
            content: `<h4>Read It From the Bottom Up</h4>
Save this as <code>app.py</code> and run it:`,
            codeExamples: [
                `def parse_age(text):
    return int(text)

def read_user(record):
    return parse_age(record["age"])

def main():
    print(read_user({"age": "abc"}))

main()

# OUTPUT (Python 3.11+ also underlines the failing part with ^^^^ markers):
# Traceback (most recent call last):
#   File "app.py", line 10, in <module>
#     main()
#   File "app.py", line 8, in main
#     print(read_user({"age": "abc"}))
#   File "app.py", line 5, in read_user
#     return parse_age(record["age"])
#   File "app.py", line 2, in parse_age
#     return int(text)
# ValueError: invalid literal for int() with base 10: 'abc'`
            ],
            codeExplanations: [
                `The last line is the answer to "what": the exception type (ValueError) and its message. The frame just above it is where the exception was raised: line 2 in parse_age. Frames above that show who called whom, oldest first - the program started at line 10, called main, which called read_user, which called parse_age.`
            ]
        },
        {
            content: `<h4>A Three-Step Reading Routine</h4>
<ol>
<li><b>Last line:</b> the exception type and message. Often this alone explains the bug.</li>
<li><b>The last frame(s) in <i>your</i> code:</b> the file, line number and the source line that failed.</li>
<li><b>Work upward</b> only if you need to know how bad data got there: who passed <code>"abc"</code> to <code>parse_age</code>?</li>
</ol>
The bug is not always on the line the traceback points to: the line shows where the error was <i>detected</i>. Here the real mistake is that bad input reached <code>parse_age</code>.`
        },
        {
            content: `<h4>Common Exceptions and Their Usual Causes</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Exception</th><th>Typical cause</th></tr>
<tr class='text-center'><td><code>NameError</code></td><td>Variable used before assignment, or a typo in a name</td></tr>
<tr class='text-center'><td><code>TypeError</code></td><td>Wrong type: <code>"5" + 5</code>, calling None, wrong number of arguments</td></tr>
<tr class='text-center'><td><code>ValueError</code></td><td>Right type, bad value: <code>int("abc")</code></td></tr>
<tr class='text-center'><td><code>KeyError</code></td><td>Missing dictionary key (the key is in the message)</td></tr>
<tr class='text-center'><td><code>IndexError</code></td><td>List index out of range</td></tr>
<tr class='text-center'><td><code>AttributeError</code></td><td>Object has no such attribute - often a value that is <code>None</code></td></tr>
<tr class='text-center'><td><code>ImportError</code> / <code>ModuleNotFoundError</code></td><td>Package not installed in this virtual environment, or wrong module name</td></tr>
<tr class='text-center'><td><code>ZeroDivisionError</code></td><td>Division or modulo by zero</td></tr>
<tr class='text-center'><td><code>FileNotFoundError</code></td><td>Wrong path or wrong working directory</td></tr>
<tr class='text-center'><td><code>IndentationError</code> / <code>SyntaxError</code></td><td>Code could not be parsed - fix before it can run</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Chained Exceptions</h3>
Sometimes you see <i>two</i> tracebacks joined by a sentence. That means one exception happened while another was being handled (or was raised deliberately <code>from</code> it). Read the <b>first</b> block as the root cause and the last as the consequence.
<ul>
<li><code>"During handling of the above exception, another exception occurred"</code> - an accident: a new error inside an <code>except</code> block.</li>
<li><code>"The above exception was the direct cause of the following exception"</code> - deliberate: <code>raise NewError(...) from original</code>.</li>
</ul>`,
            codeExamples: [
                `def load_config(text):
    try:
        return int(text)
    except ValueError as error:
        raise RuntimeError("config is invalid") from error

try:
    load_config("x")
except RuntimeError as error:
    print(repr(error))
    print(repr(error.__cause__))

# OUTPUT:
# RuntimeError('config is invalid')
# ValueError("invalid literal for int() with base 10: 'x'")`
            ]
        },
        {
            content: `<h3>The traceback Module: Capture and Inspect Traces</h3>
You can use tracebacks from code, not only read them on screen. <code>traceback.format_exc()</code> returns the text of the exception currently being handled (ideal for logs), and <code>traceback.extract_tb()</code> turns it into structured frames.`,
            codeExamples: [
                `import traceback

def a():
    b()

def b():
    return 1 / 0

try:
    a()
except ZeroDivisionError as error:
    text = traceback.format_exc()
    print(text.splitlines()[-1])

    for frame in traceback.extract_tb(error.__traceback__):
        print(frame.name)

# OUTPUT:
# ZeroDivisionError: division by zero
# <module>
# a
# b`
            ]
        },
        {
            content: `<h3>Never Throw the Trace Away</h3>
The worst debugging experience is a program that hides its errors. Avoid:
<ul>
<li><code>except: pass</code> or <code>except Exception: pass</code> - silently swallows every bug, including ones you did not anticipate.</li>
<li><code>raise NewError("failed")</code> inside <code>except</code> without <code>from</code> - loses the clear cause link.</li>
<li><code>print(error)</code> alone - gives the message but no location. Use <code>logging.exception("...")</code> inside an <code>except</code> block to log message <i>and</i> traceback.</li>
</ul>
Use a bare <code>raise</code> to re-raise the current exception unchanged after logging or cleanup: the original traceback is preserved.`,
            codeExamples: [
                `import logging

logging.basicConfig(format="%(levelname)s: %(message)s")

def risky():
    return {}["missing"]

try:
    risky()
except KeyError:
    logging.exception("risky() failed")     # message + full traceback

# OUTPUT (shortened):
# ERROR: risky() failed
# Traceback (most recent call last):
#   ...
# KeyError: 'missing'`
            ]
        },
        {
            content: `<h3>Tracebacks in Unusual Places</h3>
<ul>
<li><b>Threads:</b> an unhandled exception in a thread prints its traceback but does <b>not</b> stop the main program. Install <code>threading.excepthook</code> to log such failures.</li>
<li><b>Whole program:</b> <code>sys.excepthook</code> is called for any uncaught exception - the place to log a crash before exit.</li>
<li><b>asyncio:</b> an exception inside a task that is never awaited is reported only when the task is garbage-collected ("Task exception was never retrieved"). Always await or gather your tasks.</li>
<li><b>Python 3.11+:</b> tracebacks include <code>^^^^</code> markers pointing at the exact sub-expression, and <code>ExceptionGroup</code> shows several errors at once with nested traces.</li>
<li><b>Run with <code>python -X dev</code></b> to enable extra runtime checks and warnings while debugging.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Shows the exact file, line and call path of a failure</td><td>Shows where the error was detected, not always its cause</td></tr>
<tr><td>The last line alone often explains the bug</td><td>Long chains (frameworks, chained exceptions) are noisy</td></tr>
<tr><td>Available for free on every unhandled exception</td><td>Order differs from Java (oldest first, not newest first)</td></tr>
<tr><td><code>traceback</code> module lets you log or format it yourself</td><td>Says nothing about variable values at the time</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>In which order do you read a traceback?</td><td>Last line first (type and message), then the last frames in your own code; work upward to see the call chain</td></tr>
<tr class='text-center'><td>Which end of the trace is the most recent call?</td><td>The bottom - "most recent call last"</td></tr>
<tr class='text-center'><td>What does "The above exception was the direct cause..." mean?</td><td>The new exception was raised with <code>raise ... from</code>; the first one is the root cause</td></tr>
<tr class='text-center'><td>How do you log a traceback?</td><td><code>logging.exception(...)</code> inside the except block, or <code>logger.error(..., exc_info=True)</code></td></tr>
<tr class='text-center'><td>Is the bug always on the line shown?</td><td>No - that is where it was detected; the cause may be earlier, such as bad data passed in</td></tr>
</table>`
        }
    ]
};
