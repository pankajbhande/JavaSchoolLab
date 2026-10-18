import type { Topic } from '../../types';

export const debuggingStackTraces: Topic = {
    id: 'python-debugging-reading-stack-traces',
    name: 'Reading Stack Traces',
    beginner: [
        {
            content: `<h4>A Traceback Is a Map of the Crash</h4>
When an exception is not caught, Python prints a <b>traceback</b>: the chain of function calls that were active when the error happened. It answers three questions:<br><br>
• <b>What</b> went wrong - the last line: exception type and message.<br>
• <b>Where</b> - the last frame: file, line number, function and the source line.<br>
• <b>How we got there</b> - the frames above it, from the outermost call down to the failing one.`
        },
        {
            content: `<h4>Anatomy of a Traceback</h4>
A three-function program that crashes on an empty cart:`,
            codeExamples: [
                `# shop.py
def total(prices):
    return sum(prices)

def average_price(prices):
    return total(prices) / len(prices)

def report(cart):
    avg = average_price(list(cart.values()))
    return f"Average price: {avg:.2f}"

print(report({}))`,
                `# OUTPUT (paths vary; Python 3.11+ also adds ^ / ~ markers under some lines):
# Traceback (most recent call last):
#   File "/home/abaji/shop.py", line 12, in <module>
#     print(report({}))
#   File "/home/abaji/shop.py", line 9, in report
#     avg = average_price(list(cart.values()))
#   File "/home/abaji/shop.py", line 6, in average_price
#     return total(prices) / len(prices)
# ZeroDivisionError: division by zero`
            ]
        },
        {
            content: `<h4>How to Read It</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Part</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>Traceback (most recent call last):</code></td><td>Frames are listed oldest first; the <b>last</b> frame is where the error happened</td></tr>
<tr class='text-center'><td><code>File "...", line 12, in &lt;module&gt;</code></td><td>The top-level script code started the chain</td></tr>
<tr class='text-center'><td>Each following <code>File ... in report</code></td><td>One function call deeper</td></tr>
<tr class='text-center'><td>The indented line under each frame</td><td>The source line that was running in that frame</td></tr>
<tr class='text-center'><td><code>ZeroDivisionError: division by zero</code></td><td>The exception type and its message - <b>read this first</b></td></tr>
</table>
Reading order that works: <b>bottom line first</b> (what), then the <b>last frame</b> (where), then walk <b>upwards</b> until you reach the call that passed in the bad data - here, <code>report({})</code> with an empty cart.<br><br>
Java prints its stack trace the other way round: the newest frame first (<code>at ...</code> lines below the exception). Python puts the newest frame <b>last</b>, right above the error message.`
        },
        {
            content: `<h4>Common Messages and What They Usually Mean</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Last line</th><th>Usual cause</th></tr>
<tr class='text-center'><td><code>NameError: name 'totl' is not defined</code></td><td>Typo, or variable used before assignment</td></tr>
<tr class='text-center'><td><code>TypeError: can only concatenate str (not "int") to str</code></td><td>Mixing types - convert one side</td></tr>
<tr class='text-center'><td><code>AttributeError: 'NoneType' object has no attribute 'strip'</code></td><td>A function returned None where you expected a value</td></tr>
<tr class='text-center'><td><code>KeyError: 'email'</code></td><td>Missing dictionary key - use <code>.get()</code> or check the data</td></tr>
<tr class='text-center'><td><code>IndexError: list index out of range</code></td><td>Off-by-one or empty list</td></tr>
<tr class='text-center'><td><code>ModuleNotFoundError: No module named 'requests'</code></td><td>Package not installed in this interpreter / venv</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Fine-Grained Error Locations (Python 3.11+)</h3>
When a line contains several operations, Python 3.11+ underlines the exact sub-expression that failed: <code>^</code> marks the failing part and <code>~</code> marks the surrounding operands. It removes the guesswork in lines like <code>a / b + c / d</code>. The markers are omitted when the failing expression is the whole line.`,
            codeExamples: [
                `def ratio(a, b):
    return a / b

ratio(1, 0)

# OUTPUT (Python 3.11+, path varies):
# Traceback (most recent call last):
#   File "/home/abaji/calc.py", line 4, in <module>
#     ratio(1, 0)
#   File "/home/abaji/calc.py", line 2, in ratio
#     return a / b
#            ~~^~~
# ZeroDivisionError: division by zero`
            ]
        },
        {
            content: `<h3>Your Code vs Library Code</h3>
Real tracebacks often run through frameworks and libraries (paths containing <code>site-packages</code> or the standard library). The bug is almost always in <b>your</b> code, so look for the <b>last frame that belongs to your project</b> - the point where you handed bad data to the library.`,
            codeExamples: [
                `# OUTPUT (shortened; paths and library line numbers vary by version):
# Traceback (most recent call last):
#   File "/home/abaji/app/report.py", line 7, in <module>
#     data = load_settings("config.json")
#   File "/home/abaji/app/report.py", line 4, in load_settings
#     return json.loads(text)                 <- last frame in YOUR code
#   File "/usr/lib/python3.12/json/__init__.py", line 346, in loads
#     return _default_decoder.decode(s)
#   File "/usr/lib/python3.12/json/decoder.py", line 337, in decode
#     obj, end = self.raw_decode(s, idx=_w(s, 0).end())
#   File "/usr/lib/python3.12/json/decoder.py", line 355, in raw_decode
#     raise JSONDecodeError("Expecting value", s, err.value) from None
# json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
#
# -> the library is fine; the text you passed (an empty file) is not valid JSON`
            ]
        },
        {
            content: `<h3>Chained Exceptions Recap</h3>
A traceback can contain <b>several</b> tracebacks joined by a sentence (see <i>Exception Chaining</i>):<br>
• <code>During handling of the above exception, another exception occurred:</code> - a new error happened inside an <code>except</code> block (often a bug in the error handling itself).<br>
• <code>The above exception was the direct cause of the following exception:</code> - deliberate translation with <code>raise ... from err</code>.<br><br>
Read the <b>last</b> traceback for what finally failed, and the <b>first</b> one for the original cause.`
        },
        {
            content: `<h3>The traceback Module</h3>
When you catch an exception but still want its full traceback - for a log file, an error report or a web page - use the <code>traceback</code> module. <code>print_exc()</code> prints it to stderr; <code>format_exc()</code> returns it as a string. (<code>logger.exception()</code> does the same inside logging.)`,
            codeExamples: [
                `import traceback

def parse(text):
    return int(text)

try:
    parse("12a")
except ValueError:
    details = traceback.format_exc()
    lines = details.strip().splitlines()
    print(lines[0])
    print(lines[-1])
    print(len(lines) > 2)

# OUTPUT:
# Traceback (most recent call last):
# ValueError: invalid literal for int() with base 10: '12a'
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "most recent call last" mean?</td><td>Frames are printed oldest first; the frame where the error occurred is at the bottom, just above the exception line</td></tr>
<tr class='text-center'><td>Where do you start reading a traceback?</td><td>The last line (exception type and message), then the last frame, then upwards to find where bad data came from</td></tr>
<tr class='text-center'><td>How does Python's order differ from Java's?</td><td>Java prints the newest frame first under the exception; Python prints it last, above the exception</td></tr>
<tr class='text-center'><td>What do the ^ and ~ markers show?</td><td>In 3.11+, the exact sub-expression that failed within the line</td></tr>
<tr class='text-center'><td>How do you get a traceback as a string?</td><td><code>traceback.format_exc()</code> inside an except block</td></tr>
<tr class='text-center'><td>The traceback ends inside a library - is the library broken?</td><td>Usually not; find the last frame in your own code and check what you passed in</td></tr>
</table>`
        }
    ]
};
