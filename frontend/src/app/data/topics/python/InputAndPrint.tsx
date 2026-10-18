import type { Topic } from '../../types';

export const inputAndPrint: Topic = {
    id: 'python-basics-input-print',
    name: 'input() & print()',
    beginner: [
        {
            content: `<h4>print() - Showing Output</h4>
<code>print()</code> writes values to the screen. Give it several values separated by commas and it puts a space between them and a newline at the end.`,
            codeExamples: [
                `print("Hello")
print("Marks:", 87, "Grade:", "A")
print()                       # just a blank line
print(10 + 5)

# OUTPUT:
# Hello
# Marks: 87 Grade: A
#
# 15`
            ]
        },
        {
            content: `<h4>sep and end</h4>
• <code>sep</code> - what goes <b>between</b> the values (default: a space).<br>
• <code>end</code> - what goes <b>after</b> the last value (default: a newline <code>"\\n"</code>).`,
            codeExamples: [
                `print("2026", "10", "04", sep="-")
print("a", "b", "c", sep="")

print("Loading", end="")
print("...", end=" ")
print("done")

for i in range(1, 6):
    print(i, end=" ")
print()

# OUTPUT:
# 2026-10-04
# abc
# Loading... done
# 1 2 3 4 5`
            ]
        },
        {
            content: `<h4>input() - Reading from the Keyboard</h4>
<code>input(prompt)</code> shows the prompt, waits for the user to type a line and press Enter, and returns what they typed <b>as a string</b> (without the newline).`,
            codeExamples: [
                `name = input("Enter your name: ")
print("Welcome,", name)

# OUTPUT:
# Enter your name: Dheeraj
# Welcome, Dheeraj`
            ]
        },
        {
            content: `<h4>Reading Numbers</h4>
Because <code>input()</code> always returns a string, convert it with <code>int()</code> or <code>float()</code> before doing maths. Forgetting this is the most common beginner bug.`,
            codeExamples: [
                `a = input("First number: ")
b = input("Second number: ")
print("Wrong:", a + b)                 # string concatenation!

a = int(a)
b = int(b)
print("Right:", a + b)

# OUTPUT:
# First number: 10
# Second number: 20
# Wrong: 1020
# Right: 30`
            ]
        },
        {
            content: `<h4>Reading Several Values on One Line</h4>
Split the line, then convert each part.`,
            codeExamples: [
                `x, y = input("Enter two numbers: ").split()
x, y = int(x), int(y)
print("Sum:", x + y)

marks = list(map(int, input("Enter marks: ").split()))
print("Average:", sum(marks) / len(marks))

# OUTPUT:
# Enter two numbers: 4 9
# Sum: 13
# Enter marks: 70 80 90
# Average: 80.0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Validating Input in a Loop</h3>
Real programs must survive bad input. Keep asking until the value is valid, and strip surrounding whitespace.`,
            codeExamples: [
                `def ask_age():
    while True:
        text = input("Age: ").strip()
        try:
            age = int(text)
        except ValueError:
            print("Please enter a whole number.")
            continue
        if 0 < age < 120:
            return age
        print("Age must be between 1 and 119.")

age = ask_age()
print("Saved age", age)

# OUTPUT:
# Age: twenty
# Please enter a whole number.
# Age: 200
# Age must be between 1 and 119.
# Age: 21
# Saved age 21`
            ]
        },
        {
            content: `<h3>print() Arguments: file and flush</h3>
The full signature is <code>print(*objects, sep=" ", end="\\n", file=sys.stdout, flush=False)</code>.<br>
• <code>file</code> - send output somewhere else, such as <code>sys.stderr</code> or an open file.<br>
• <code>flush=True</code> - push the text out immediately. Output to a terminal is line-buffered, so text without a newline may not appear right away - important for progress indicators.`,
            codeExamples: [
                `import sys
import time

print("Something went wrong", file=sys.stderr)

with open("log.txt", "w", encoding="utf-8") as f:
    print("written to a file", file=f)

for pct in (0, 50, 100):
    print(f"\\rProgress: {pct}%", end="", flush=True)
    time.sleep(0.5)
print()

# OUTPUT (the progress line updates in place):
# Something went wrong
# Progress: 100%`
            ]
        },
        {
            content: `<h3>Unpacking into print()</h3>
<code>print(*items)</code> spreads a list into separate arguments, which is a neat way to print a list without brackets.`,
            codeExamples: [
                `scores = [90, 85, 78]
print(scores)
print(*scores)
print(*scores, sep=", ")
print(*"abc", sep="|")

# OUTPUT:
# [90, 85, 78]
# 90 85 78
# 90, 85, 78
# a|b|c`
            ]
        },
        {
            content: `<h3>Handling End of Input</h3>
If input ends - the user presses <code>Ctrl+D</code> (macOS/Linux) or <code>Ctrl+Z</code> then Enter (Windows), or input is piped from a file that runs out - <code>input()</code> raises <code>EOFError</code>. <code>Ctrl+C</code> raises <code>KeyboardInterrupt</code>. Handle both for a clean exit.`,
            codeExamples: [
                `try:
    while True:
        line = input("> ")
        print("echo:", line)
except (EOFError, KeyboardInterrupt):
    print("\\nGoodbye!")`
            ]
        },
        {
            content: `<h3>Never eval() User Input</h3>
Old tutorials sometimes use <code>eval(input())</code> to read numbers or lists. <code>eval</code> runs <b>any</b> Python expression, so a user could type <code>__import__("os").system("...")</code> and execute commands. Convert explicitly, or use <code>ast.literal_eval()</code> for Python literals.`,
            codeExamples: [
                `import ast

text = "[1, 2, 3]"                    # imagine this came from input()
values = ast.literal_eval(text)        # only literals allowed - safe
print(values, type(values))

# OUTPUT:
# [1, 2, 3] <class 'list'>`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What type does input() return?</td><td>Always str - convert it with int(), float() and so on</td></tr>
<tr class='text-center'><td>How do you print without a newline?</td><td><code>print(x, end="")</code></td></tr>
<tr class='text-center'><td>What do sep and end do?</td><td>sep is placed between values, end is placed after the last one</td></tr>
<tr class='text-center'><td>How do you print to stderr?</td><td><code>print(msg, file=sys.stderr)</code></td></tr>
<tr class='text-center'><td>Why might print output appear late?</td><td>Output is buffered; use <code>flush=True</code> or end with a newline</td></tr>
<tr class='text-center'><td>Why is <code>eval(input())</code> dangerous?</td><td>It executes arbitrary code typed by the user</td></tr>
<tr class='text-center'><td>What does input() raise at end of input?</td><td>EOFError</td></tr>
</table>`
        }
    ]
};
