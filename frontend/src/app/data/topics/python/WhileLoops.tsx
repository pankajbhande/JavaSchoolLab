import type { Topic } from '../../types';

export const whileLoops: Topic = {
    id: 'python-control-flow-while-loops',
    name: 'while Loops',
    beginner: [
        {
            content: `<h4>The while Loop</h4>
A <code>while</code> loop repeats its block <b>as long as its condition is true</b>. The condition is checked before every iteration. Use <code>while</code> when you don't know in advance how many times to loop; use <code>for</code> when you are going through a known collection or count.`,
            codeExamples: [
                `count = 1

while count <= 5:
    print("Count is", count)
    count += 1              # without this the loop never ends

print("Loop finished")

# OUTPUT:
# Count is 1
# Count is 2
# Count is 3
# Count is 4
# Count is 5
# Loop finished`
            ]
        },
        {
            content: `<h4>Example: Sum of Digits</h4>
A classic case where the number of iterations depends on the data.`,
            codeExamples: [
                `number = 90817
total = 0

while number > 0:
    digit = number % 10      # last digit
    total += digit
    number //= 10            # drop the last digit

print("Sum of digits:", total)

# OUTPUT:
# Sum of digits: 25`
            ]
        },
        {
            content: `<h4>Looping Until the Input Is Valid</h4>`,
            codeExamples: [
                `password = input("Set a password: ")

while len(password) < 8:
    print("Too short - use at least 8 characters.")
    password = input("Set a password: ")

print("Password saved.")

# OUTPUT:
# Set a password: abc
# Too short - use at least 8 characters.
# Set a password: python123
# Password saved.`
            ]
        },
        {
            content: `<h4>while True with break</h4>
Python has no <code>do-while</code> loop. The standard replacement is an infinite <code>while True:</code> loop that exits with <code>break</code> - the body always runs at least once.`,
            codeExamples: [
                `while True:
    command = input("Enter command (help/quit): ").strip().lower()
    if command == "quit":
        print("Bye!")
        break
    elif command == "help":
        print("Available: help, quit")
    else:
        print("Unknown command")

# OUTPUT:
# Enter command (help/quit): list
# Unknown command
# Enter command (help/quit): help
# Available: help, quit
# Enter command (help/quit): quit
# Bye!`
            ]
        },
        {
            content: `<h4>Infinite Loops</h4>
If the condition never becomes false, the loop runs forever. Press <code>Ctrl+C</code> in the terminal to stop it - Python raises <code>KeyboardInterrupt</code>. Always make sure something inside the loop moves it toward ending.`,
            codeExamples: [
                `n = 10
while n > 0:
    print(n)
    # forgot n -= 1  -> prints 10 forever`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>while ... else</h3>
The <code>else</code> block runs when the condition becomes false - but <b>not</b> if the loop exited through <code>break</code>. It answers the question "did the search finish without finding anything?"`,
            codeExamples: [
                `def first_divisor(n):
    d = 2
    while d * d <= n:
        if n % d == 0:
            print(n, "is divisible by", d)
            break
        d += 1
    else:
        print(n, "is prime")

first_divisor(91)
first_divisor(97)

# OUTPUT:
# 91 is divisible by 7
# 97 is prime`
            ]
        },
        {
            content: `<h3>The Walrus Operator in Loop Conditions</h3>
<code>:=</code> lets you read a value and test it in the same condition, removing the duplicated "read before the loop, read again at the end" pattern.`,
            codeExamples: [
                `# Without walrus - input() appears twice
line = input("> ")
while line != "done":
    print("Got", line)
    line = input("> ")

# With walrus
while (line := input("> ")) != "done":
    print("Got", line)

# Reading a file in fixed-size chunks
# with open("big.bin", "rb") as f:
#     while chunk := f.read(4096):
#         process(chunk)`
            ]
        },
        {
            content: `<h3>Prefer for When You Can</h3>
A <code>while</code> loop that manages its own counter is easy to get wrong (off-by-one errors, forgotten increments). If you are counting or walking a collection, <code>for</code> is safer and clearer.`,
            codeExamples: [
                `items = ["a", "b", "c"]

# Error-prone
i = 0
while i < len(items):
    print(items[i])
    i += 1

# Clear and safe
for item in items:
    print(item)`
            ]
        },
        {
            content: `<h3>Retrying with a Limit</h3>
Real systems retry flaky operations - but never forever. Combine a counter with <code>while ... else</code> or a <code>for</code> over <code>range</code>, and wait longer between attempts (exponential backoff).`,
            codeExamples: [
                `import random
import time

def unreliable_call():
    return random.random() > 0.6      # succeeds about 40% of the time

attempt = 0
delay = 0.1
while attempt < 5:
    attempt += 1
    if unreliable_call():
        print(f"Succeeded on attempt {attempt}")
        break
    print(f"Attempt {attempt} failed, retrying in {delay:.1f}s")
    time.sleep(delay)
    delay *= 2
else:
    print("Giving up after 5 attempts")

# OUTPUT (varies - random):
# Attempt 1 failed, retrying in 0.1s
# Succeeded on attempt 2`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>for vs while?</td><td>for iterates over a known iterable; while repeats until a condition becomes false, when the number of iterations isn't known</td></tr>
<tr class='text-center'><td>How do you write a do-while in Python?</td><td><code>while True:</code> with the body first and a <code>break</code> when the exit condition holds</td></tr>
<tr class='text-center'><td>When does while-else run its else block?</td><td>When the condition becomes false; it is skipped if the loop ended with break</td></tr>
<tr class='text-center'><td>How do you stop an infinite loop?</td><td>Ctrl+C raises KeyboardInterrupt</td></tr>
<tr class='text-center'><td>How do you sum the digits of a number?</td><td>Loop while n &gt; 0, adding <code>n % 10</code> and doing <code>n //= 10</code></td></tr>
</table>`
        }
    ]
};
