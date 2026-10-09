import type { Topic } from '../../types';

export const matchCase: Topic = {
    id: 'python-control-flow-match-case',
    name: 'match/case',
    beginner: [
        {
            content: `<h4>What is match/case?</h4>
<code>match</code> (Python 3.10+) compares a value against a series of <b>patterns</b> and runs the block of the first <code>case</code> that matches. At its simplest it works like Java's <code>switch</code>, but it can also take apart lists, dictionaries and objects - this is called <b>structural pattern matching</b>.`,
            codeExamples: [
                `day = "Sat"

match day:
    case "Sat" | "Sun":
        print("Weekend")
    case "Mon":
        print("Start of the week")
    case _:
        print("Weekday")

# OUTPUT:
# Weekend`
            ]
        },
        {
            content: `<h4>Key Rules</h4>
• <code>|</code> means "or" - one case can match several values.<br>
• <code>case _:</code> is the wildcard: it matches anything, like <code>default</code> in Java.<br>
• Only <b>one</b> case runs. There is no fall-through, so no <code>break</code> is needed.<br>
• If nothing matches and there is no <code>case _</code>, nothing happens.`
        },
        {
            content: `<h4>Example: HTTP Status Codes</h4>
A <b>guard</b> (<code>if</code> after the pattern) adds an extra condition. Here <code>code</code> captures the value so the guard can test it.`,
            codeExamples: [
                `def describe(status):
    match status:
        case 200:
            return "OK"
        case 301 | 302:
            return "Redirect"
        case 404:
            return "Not Found"
        case code if 500 <= code < 600:
            return f"Server Error ({code})"
        case _:
            return "Unknown"

for s in (200, 302, 404, 503, 999):
    print(s, describe(s))

# OUTPUT:
# 200 OK
# 302 Redirect
# 404 Not Found
# 503 Server Error (503)
# 999 Unknown`
            ]
        },
        {
            content: `<h4>Matching Lists: A Tiny Command Parser</h4>
Sequence patterns check the length and contents of a list and bind parts of it to names. <code>*rest</code> collects any remaining items.`,
            codeExamples: [
                `def run(command):
    match command.split():
        case ["go", direction]:
            return f"Moving {direction}"
        case ["pick", "up", item]:
            return f"Picked up {item}"
        case ["drop", *items]:
            return f"Dropped {', '.join(items)}"
        case ["quit" | "exit"]:
            return "Goodbye"
        case _:
            return "Unknown command"

for cmd in ["go north", "pick up lamp", "drop pen book", "exit", "dance"]:
    print(run(cmd))

# OUTPUT:
# Moving north
# Picked up lamp
# Dropped pen, book
# Goodbye
# Unknown command`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Mapping Patterns</h3>
A dictionary pattern matches if the listed keys exist with matching values - <b>extra keys are ignored</b>. This makes <code>match</code> excellent for handling JSON events and API payloads.`,
            codeExamples: [
                `def handle(event):
    match event:
        case {"type": "payment", "amount": amount, "currency": "INR"}:
            return f"Received ₹{amount}"
        case {"type": "refund", "amount": amount}:
            return f"Refunding {amount}"
        case {"type": other}:
            return f"Unhandled event: {other}"
        case _:
            return "Invalid event"

print(handle({"type": "payment", "amount": 499, "currency": "INR", "user": "sheru"}))
print(handle({"type": "signup", "user": "asha"}))
print(handle(["not", "a", "dict"]))

# OUTPUT:
# Received ₹499
# Unhandled event: signup
# Invalid event`
            ]
        },
        {
            content: `<h3>Class Patterns</h3>
<code>ClassName(attr=pattern)</code> checks the type with <code>isinstance</code> and then matches attributes. Positional patterns like <code>Point(x, 0)</code> use the class's <code>__match_args__</code>, which dataclasses generate automatically.`,
            codeExamples: [
                `from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

def where(p):
    match p:
        case Point(x=0, y=0):
            return "origin"
        case Point(x=0, y=y):
            return f"on the Y axis at {y}"
        case Point(x, 0):
            return f"on the X axis at {x}"
        case Point():
            return "somewhere else"
        case _:
            return "not a point"

for p in (Point(0, 0), Point(0, 5), Point(3, 0), Point(2, 2), (2, 2)):
    print(where(p))

# OUTPUT:
# origin
# on the Y axis at 5
# on the X axis at 3
# somewhere else
# not a point`
            ]
        },
        {
            content: `<h3>Matching Types and Binding with as</h3>
Built-in types can be used as class patterns: <code>int(n)</code> matches any int and binds it to <code>n</code>. <code>as</code> binds the value matched by a sub-pattern.`,
            codeExamples: [
                `def classify(value):
    match value:
        case bool():
            return "boolean"            # must come before int - bool is an int subclass
        case int(n) if n < 0:
            return "negative int"
        case int() | float() as number:
            return f"number {number}"
        case str() as text if text.strip() == "":
            return "blank string"
        case str():
            return "string"
        case [_, _] as pair:
            return f"pair {pair}"
        case _:
            return "something else"

for v in (True, -4, 3.5, "  ", "hi", [1, 2], {1}):
    print(repr(v), "->", classify(v))

# OUTPUT:
# True -> boolean
# -4 -> negative int
# 3.5 -> number 3.5
# '  ' -> blank string
# 'hi' -> string
# [1, 2] -> pair [1, 2]
# {1} -> something else`
            ]
        },
        {
            content: `<h3>The Capture Pattern Trap</h3>
A bare name in a case is a <b>capture pattern</b> - it matches anything and assigns to that name. It does <b>not</b> compare against an existing variable. To match a constant, use a dotted name such as an enum member.`,
            codeExamples: [
                `from enum import Enum

class Color(Enum):
    RED = "red"
    GREEN = "green"

RED = "red"

# match colour:
#     case RED:          # captures anything into RED!
#         ...
#     case _:
#         ...
# SyntaxError: name capture 'RED' makes remaining patterns unreachable

def describe(colour):
    match colour:
        case Color.RED:          # dotted name = value comparison
            return "stop"
        case Color.GREEN:
            return "go"
        case _:
            return "unknown"

print(describe(Color.RED), describe(Color.GREEN))

# OUTPUT:
# stop go`
            ]
        },
        {
            content: `<h3>match vs if/elif vs Dictionary</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Use</th><th>When</th></tr>
<tr class='text-center'><td>Dictionary lookup</td><td>Mapping a key to a value or function - simplest and fastest</td></tr>
<tr class='text-center'><td>if / elif</td><td>Conditions on ranges and unrelated expressions</td></tr>
<tr class='text-center'><td>match / case</td><td>Branching on the <i>shape</i> of data: lists, dicts, objects, command tokens</td></tr>
</table>
Note that strings are <b>not</b> matched by sequence patterns - <code>"ab"</code> does not match <code>[a, b]</code> - which prevents a common class of surprises.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which Python version added match?</td><td>Python 3.10 (PEP 634)</td></tr>
<tr class='text-center'><td>Does match fall through like a C switch?</td><td>No - only the first matching case runs, so break is not needed</td></tr>
<tr class='text-center'><td>What is <code>case _</code>?</td><td>The wildcard pattern - it matches anything without binding a name</td></tr>
<tr class='text-center'><td>Why doesn't <code>case RED:</code> compare with a variable RED?</td><td>A bare name is a capture pattern; use a dotted name like <code>Color.RED</code> for constants</td></tr>
<tr class='text-center'><td>Do mapping patterns require an exact dict?</td><td>No - extra keys are ignored; only the listed keys must be present</td></tr>
<tr class='text-center'><td>What is a guard?</td><td>An <code>if</code> condition after a pattern that must also be true for the case to match</td></tr>
</table>`
        }
    ]
};
