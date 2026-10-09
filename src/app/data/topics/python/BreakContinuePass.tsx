import type { Topic } from '../../types';

export const breakContinuePass: Topic = {
    id: 'python-control-flow-break-continue-pass',
    name: 'break, continue & pass',
    beginner: [
        {
            content: `<h4>Three Small Keywords</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Keyword</th><th>What it does</th></tr>
<tr class='text-center'><td><code>break</code></td><td>Exits the loop immediately - remaining iterations are skipped</td></tr>
<tr class='text-center'><td><code>continue</code></td><td>Skips the rest of the current iteration and jumps to the next one</td></tr>
<tr class='text-center'><td><code>pass</code></td><td>Does nothing at all - a placeholder where Python requires a statement</td></tr>
</table>`
        },
        {
            content: `<h4>break - Stop When You've Found It</h4>`,
            codeExamples: [
                `balances = [1200, 540, -300, 800, -50]

for b in balances:
    if b < 0:
        print("First negative balance:", b)
        break
    print("Checked", b)

# OUTPUT:
# Checked 1200
# Checked 540
# First negative balance: -300`
            ]
        },
        {
            content: `<h4>continue - Skip This One</h4>`,
            codeExamples: [
                `for n in range(1, 11):
    if n % 3 == 0:
        continue            # skip multiples of 3
    print(n, end=" ")
print()

lines = ["apple", "", "  ", "mango"]
for line in lines:
    if not line.strip():
        continue            # skip blank lines
    print("Processing", line)

# OUTPUT:
# 1 2 4 5 7 8 10
# Processing apple
# Processing mango`
            ]
        },
        {
            content: `<h4>pass - "Nothing Here Yet"</h4>
Python does not allow an empty block. <code>pass</code> fills the gap while you are sketching code you will write later.`,
            codeExamples: [
                `def send_email(to, subject):
    pass                    # TODO: implement later

class Invoice:
    pass                    # an empty class is valid with pass

for i in range(3):
    pass                    # loop that does nothing

send_email("a@b.com", "Hi")
print("Program still runs fine")

# OUTPUT:
# Program still runs fine`
            ]
        },
        {
            content: `<h4>pass vs continue</h4>
They are easy to confuse. <code>pass</code> does nothing and execution carries on to the next line; <code>continue</code> jumps straight to the next iteration.`,
            codeExamples: [
                `for n in range(4):
    if n == 2:
        pass
    print("with pass:", n)

for n in range(4):
    if n == 2:
        continue
    print("with continue:", n)

# OUTPUT:
# with pass: 0
# with pass: 1
# with pass: 2
# with pass: 3
# with continue: 0
# with continue: 1
# with continue: 3`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>break Only Leaves the Innermost Loop</h3>
Python has no labelled <code>break outer;</code> like Java. A <code>break</code> inside a nested loop ends only that inner loop. See the Nested Loops topic for the standard ways to exit several loops at once.`,
            codeExamples: [
                `for i in range(3):
    for j in range(3):
        if j == 1:
            break           # leaves the j-loop only
        print(i, j)

# OUTPUT:
# 0 0
# 1 0
# 2 0`
            ]
        },
        {
            content: `<h3>The continue Trap in while Loops</h3>
In a <code>while</code> loop you update the counter yourself. If <code>continue</code> runs before the update, the counter never changes and the loop runs forever.`,
            codeExamples: [
                `# BUG - infinite loop when i reaches 2
# i = 0
# while i < 5:
#     if i == 2:
#         continue
#     print(i)
#     i += 1

# Fix: update first, then decide
i = 0
while i < 5:
    i += 1
    if i == 3:
        continue
    print(i, end=" ")
print()

# OUTPUT:
# 1 2 4 5`
            ]
        },
        {
            content: `<h3>break and the Loop else Clause</h3>
A loop's <code>else</code> block runs only when no <code>break</code> happened. This replaces the "found" flag variable you would need in Java.`,
            codeExamples: [
                `users = ["asha", "ravi", "meena"]
target = "kiran"

# With a flag
found = False
for u in users:
    if u == target:
        found = True
        break
if not found:
    print("Not found (flag version)")

# With for-else
for u in users:
    if u == target:
        print("Found")
        break
else:
    print("Not found (for-else version)")

# OUTPUT:
# Not found (flag version)
# Not found (for-else version)`
            ]
        },
        {
            content: `<h3>Don't Silence Errors with pass</h3>
<code>except: pass</code> hides every error, including bugs and <code>KeyboardInterrupt</code>, making problems impossible to diagnose. Catch the specific exception you expect. When ignoring it really is correct, <code>contextlib.suppress</code> states the intent clearly.`,
            codeExamples: [
                `import os
from contextlib import suppress

# Bad
try:
    os.remove("temp.txt")
except:
    pass

# Good - only the expected error is ignored
with suppress(FileNotFoundError):
    os.remove("temp.txt")`
            ]
        },
        {
            content: `<h3>pass, Ellipsis and Docstrings</h3>
Any statement satisfies Python's "block can't be empty" rule. <code>...</code> (Ellipsis) is common in type stubs and abstract methods, and a docstring alone is a perfectly good body.`,
            codeExamples: [
                `class PaymentGateway:
    """Base class for payment providers."""

    def charge(self, amount):
        ...                       # Ellipsis as a placeholder

    def refund(self, amount):
        raise NotImplementedError  # better when callers must not use it yet

print(PaymentGateway().charge(100))

# OUTPUT:
# None`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>break vs continue?</td><td>break ends the whole loop; continue ends only the current iteration</td></tr>
<tr class='text-center'><td>pass vs continue?</td><td>pass does nothing and execution continues on the next line; continue jumps to the next iteration</td></tr>
<tr class='text-center'><td>Does break exit all nested loops?</td><td>No, only the innermost loop containing it</td></tr>
<tr class='text-center'><td>Why is <code>except: pass</code> bad?</td><td>It swallows every exception, including real bugs and Ctrl+C</td></tr>
<tr class='text-center'><td>Is a loop's else run after break?</td><td>No - only when the loop completes without break</td></tr>
</table>`
        }
    ]
};
