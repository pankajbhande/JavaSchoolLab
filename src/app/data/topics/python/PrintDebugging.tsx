import type { Topic } from '../../types';

export const printDebugging: Topic = {
    id: 'python-debugging-print-debugging',
    name: 'print() Debugging',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<b>Print debugging</b> means adding temporary <code>print()</code> calls to see what a program is really doing: which values variables hold, which branch ran, how many times a loop repeated. It needs no tools and works everywhere. Python adds two helpers: the f-string trick <code>f"{x=}"</code> (prints the expression and its value) and <code>repr()</code> (shows hidden detail such as quotes and spaces). In Java the same job is done with <code>System.out.println</code> before you reach for <code>jdb</code> or an IDE debugger.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 678 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:678px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="111.6" height="48" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="65.8" y="30.5">wrong result</tspan><tspan x="65.8" y="45.5">(no error)</tspan></text><line x1="121.6" y1="34" x2="151.6" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="155.6" y="10" width="148.1" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="229.7" y="30.5">add labelled</tspan><tspan x="229.7" y="45.5">print() / f"{x=}"</tspan></text><line x1="303.7" y1="34" x2="333.7" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="337.7" y="10" width="148.1" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="411.8" y="30.5">first wrong value</tspan><tspan x="411.8" y="45.5">found</tspan></text><line x1="485.8" y1="34" x2="515.8" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="519.8" y="10" width="148.1" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="593.8" y="30.5">fix the line</tspan><tspan x="593.8" y="45.5">remove the prints</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: print debugging narrows the bug to the first place where a value goes wrong</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A program gives a wrong answer but no error. Reading the code again and again does not reveal which variable holds an unexpected value at which moment.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Make the program's hidden <b>state visible</b> at chosen points.</li>
<li><b>Narrow down</b> a bug: the last correct print and the first wrong print bracket the faulty line.</li>
<li>Debug quickly with <b>no setup</b> - useful in scripts, servers and notebooks.</li>
<li>Learn the habit that leads to <code>logging</code> and real debuggers later.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: A reusable debug() helper and the f"{x=}" trick</h4>
Debug lines go to <code>stderr</code> so they never mix with real output; here both appear in the terminal in program order.`,
            codeExamples: [
                `import sys

DEBUG = True


def debug(label, value):
    if DEBUG:
        print(f"[DEBUG] {label} = {value!r}", file=sys.stderr)


def parse_prices(text):
    prices = []
    for part in text.split(","):
        debug("part", part)
        prices.append(float(part.strip()))
    return prices


def average(prices):
    debug("count", len(prices))
    return sum(prices) / len(prices)


def main():
    raw = "10, 20.5 ,30"
    prices = parse_prices(raw)
    print(f"{prices=}")
    print(f"{round(average(prices), 2)=}")


if __name__ == "__main__":
    main()

# OUTPUT:
# [DEBUG] part = '10'
# [DEBUG] part = ' 20.5 '
# [DEBUG] part = '30'
# prices=[10.0, 20.5, 30.0]
# [DEBUG] count = 3
# round(average(prices), 2)=20.17`
            ],
            codeExplanations: [
                `The !r in the f-string applies repr(), so the debug lines show quotes and the stray spaces in ' 20.5 '. The f"{prices=}" form prints the source text of the expression, an equals sign and the value. The DEBUG constant lets you switch all debug output off in one place instead of deleting prints. The average is 60.5 / 3 = 20.1666..., rounded to 20.17.`
            ]
        },
        {
            content: `<h4>The Simplest Debugger</h4>
When code does something unexpected, the quickest first step is to <b>look at the values</b>. Adding <code>print()</code> calls to show variables at key points is called <b>print debugging</b>. It needs no tools, works everywhere, and is how most programmers start. The aim is always the same: find the <b>first place where reality differs from what you expected</b>.`
        },
        {
            content: `<h4>Label Your Output: the f"{x=}" Trick</h4>
A bare <code>print(total)</code> prints a number with no clue what it is. Python 3.8+ has a shortcut: <code>f"{x=}"</code> prints the expression <i>and</i> its value.`,
            codeExamples: [
                `x = 42
name = "Asha"
items = [1, 2, 3]

print(f"{x=}, {name=}")
print(f"{len(items)=}, {x * 2=}")

# OUTPUT:
# x=42, name='Asha'
# len(items)=3, x * 2=84`
            ],
            codeExplanations: [
                `The "=" after an expression inside an f-string prints the source text of the expression, an equals sign, and the repr() of its value. Note name='Asha' shows quotes - a string value is easy to tell apart from a number.`
            ]
        },
        {
            content: `<h4>Use repr() to See What Is Really There</h4>
<code>print()</code> shows the friendly <code>str()</code> form, which hides whitespace and type. <code>repr()</code> shows the precise form, exposing the usual culprits: stray spaces, newlines, or a string where you expected a number.`,
            codeExamples: [
                `value = "5"
line = "  hello\\n"

print(value, 5)                 # look the same
print(repr(value), repr(5))     # clearly different types
print(line)
print(repr(line))

# OUTPUT:
# 5 5
# '5' 5
#   hello
#
# '  hello\\n'`
            ]
        },
        {
            content: `<h4>Narrowing Down a Bug</h4>
Print the inputs and the intermediate results of the suspect function. Here the crash is a symptom; the printout reveals the cause: an empty list.`,
            codeExamples: [
                `def average(numbers):
    total = sum(numbers)
    print(f"DEBUG {total=} {len(numbers)=}")
    return total / len(numbers)

print(average([]))

# OUTPUT:
# DEBUG total=0 len(numbers)=0
# Traceback (most recent call last):
#   ...
# ZeroDivisionError: division by zero`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Send Debug Output to stderr and Flush It</h3>
Debug prints mixed into normal output corrupt programs whose stdout is parsed or piped. Print diagnostics to <b>stderr</b> with <code>file=sys.stderr</code>. stdout is buffered when redirected, so output can appear late or be lost in a crash - <code>flush=True</code> forces it out immediately.`,
            codeExamples: [
                `import sys

def debug(*args):
    print("DEBUG:", *args, file=sys.stderr, flush=True)

result = 6 * 7
debug("computed", result)
print(result)                       # real output stays clean

# Run:  python app.py > out.txt
# out.txt contains only:   42
# The terminal still shows: DEBUG: computed 42`
            ]
        },
        {
            content: `<h3>Pretty-Printing and Tracing Calls</h3>
<code>pprint</code> formats nested data readably. A small <b>decorator</b> can print every call's arguments and return value, which is invaluable for recursive functions, without editing the function's body.`,
            codeExamples: [
                `import functools
from pprint import pprint

def trace(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"-> {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"<- {func.__name__} returned {result!r}")
        return result
    return wrapper

@trace
def fact(n):
    return 1 if n <= 1 else n * fact(n - 1)

fact(3)
pprint({"b": [1, 2, 3], "a": {"x": 1}})

# OUTPUT:
# -> fact(3,)
# -> fact(2,)
# -> fact(1,)
# <- fact returned 1
# <- fact returned 2
# <- fact returned 6
# {'a': {'x': 1}, 'b': [1, 2, 3]}`
            ]
        },
        {
            content: `<h3>A Systematic Approach</h3>
Print debugging works best as a method, not a scatter-gun:
<ol>
<li><b>Reproduce</b> the bug reliably, with the smallest input that triggers it.</li>
<li><b>Form a hypothesis</b> ("the list is empty by the time we reach line 12").</li>
<li><b>Print to test the hypothesis</b> - one or two prints, not twenty.</li>
<li><b>Bisect:</b> print halfway through the code path. If the value is already wrong, the bug is in the first half; otherwise the second.</li>
<li><b>Fix, then remove</b> every debug print (search for "DEBUG").</li>
</ol>
<code>traceback.print_stack()</code> prints <i>how the code got to this line</i>, answering "who called this function with that argument?".`
        },
        {
            content: `<h3>When to Stop Using print()</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Situation</th><th>Better tool</th></tr>
<tr class='text-center'><td>You need to inspect many variables or explore interactively</td><td>The debugger: <code>breakpoint()</code> / <code>pdb</code> / IDE</td></tr>
<tr class='text-center'><td>The message should stay in the code and be switchable</td><td><code>logging</code> (levels, handlers, timestamps)</td></tr>
<tr class='text-center'><td>Crash in production</td><td>Logs plus the stack trace (<code>logger.exception</code>)</td></tr>
<tr class='text-center'><td>Expected behaviour you want to keep checking</td><td>An automated test with <code>assert</code></td></tr>
</table>
Leaving stray prints in committed code is a smell: they clutter output, can leak sensitive data, and slow hot loops. Linters such as <code>ruff</code> (rule T20) flag them.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Zero setup: works in any editor, server or script</td><td>Needs code edits and a re-run for every new question</td></tr>
<tr><td><code>f"{x=}"</code> labels the value automatically (3.8+)</td><td>Easy to forget a print and ship it to production</td></tr>
<tr><td>Output survives in logs and CI where no debugger can attach</td><td>Cannot pause, step or change values while running</td></tr>
<tr><td>Easy to show a whole execution history, not just one moment</td><td>Large outputs become noise; no levels or filtering</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>f"{x=}"</code> do?</td><td>Prints the expression text and its repr value, e.g. <code>x=42</code> (Python 3.8+)</td></tr>
<tr class='text-center'><td>Why use repr() when debugging?</td><td>It reveals exact content - quotes, whitespace, escape characters, types - that str() hides</td></tr>
<tr class='text-center'><td>Why print debug output to stderr?</td><td>It keeps stdout clean for real output and piping</td></tr>
<tr class='text-center'><td>Why flush=True?</td><td>Redirected stdout is buffered; flushing ensures the output appears before a crash</td></tr>
<tr class='text-center'><td>Print vs logging vs debugger?</td><td>Print: quick and temporary. Logging: permanent, leveled and configurable. Debugger: interactive inspection and stepping</td></tr>
</table>`
        }
    ]
};
