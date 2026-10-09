import type { Topic } from '../../types';

export const elseFinally: Topic = {
    id: 'python-exceptions-else-finally',
    name: 'else & finally',
    beginner: [
        {
            content: `<h4>The Full try Statement</h4>
A <code>try</code> statement can have four kinds of blocks:<br><br>
• <code>try</code> - the code that might fail;<br>
• <code>except</code> - runs if a matching exception happened;<br>
• <code>else</code> - runs only if <b>no</b> exception happened;<br>
• <code>finally</code> - runs <b>always</b>, whatever happened.<br><br>
Java has <code>finally</code> but no <code>else</code> on <code>try</code>.`,
            codeExamples: [
                `def divide(a, b):
    try:
        print("try")
        result = a / b
    except ZeroDivisionError:
        print("except")
    else:
        print("else:", result)
    finally:
        print("finally")

divide(10, 2)
print("---")
divide(10, 0)

# OUTPUT:
# try
# else: 5.0
# finally
# ---
# try
# except
# finally`
            ]
        },
        {
            content: `<h4>Execution Order</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Situation</th><th>try</th><th>except</th><th>else</th><th>finally</th><th>Afterwards</th></tr>
<tr class='text-center'><td>No exception</td><td>runs fully</td><td>skipped</td><td>runs</td><td>runs</td><td>continues normally</td></tr>
<tr class='text-center'><td>Handled exception</td><td>stops at the error</td><td>runs</td><td>skipped</td><td>runs</td><td>continues normally</td></tr>
<tr class='text-center'><td>Unhandled exception</td><td>stops at the error</td><td>no match</td><td>skipped</td><td>runs</td><td>exception propagates</td></tr>
</table>`,
            codeExamples: [
                `def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("except")
    else:
        print("else:", result)
    finally:
        print("finally")

divide(10, "2")             # TypeError is not handled here

# OUTPUT:
# finally
# TypeError: unsupported operand type(s) for /: 'int' and 'str'`
            ]
        },
        {
            content: `<h4>Why Use else?</h4>
Code in <code>else</code> runs only on success, but it is <b>outside</b> the <code>try</code>, so exceptions it raises are not accidentally caught by your <code>except</code>. It keeps the <code>try</code> block focused on the one risky line.`,
            codeExamples: [
                `stock = {"pen": 10}

def sell(item):
    try:
        qty = stock[item]               # the only risky line
    except KeyError:
        print(f"{item}: not stocked")
    else:
        stock[item] = qty - 1           # runs only when the lookup worked
        print(f"{item}: sold, {stock[item]} left")

sell("pen")
sell("bag")

# OUTPUT:
# pen: sold, 9 left
# bag: not stocked`
            ]
        },
        {
            content: `<h4>finally for Cleanup</h4>
<code>finally</code> is the place for cleanup that must happen no matter what: closing a file or database connection, releasing a lock, stopping a timer.`,
            codeExamples: [
                `def process(data):
    print("open connection")
    try:
        return 100 / data
    finally:
        print("close connection")       # runs on success AND on error

print(process(4))
print(process(0))

# OUTPUT:
# open connection
# close connection
# 25.0
# open connection
# close connection
# ZeroDivisionError: division by zero`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>finally Runs Even with return, break and continue</h3>
Leaving the <code>try</code> block by any route - <code>return</code>, <code>break</code>, <code>continue</code> or an exception - still runs <code>finally</code> first.`,
            codeExamples: [
                `def f():
    try:
        return "from try"
    finally:
        print("finally runs before the function returns")

print(f())

for i in range(3):
    try:
        if i == 1:
            break
        print("body", i)
    finally:
        print("cleanup", i)

# OUTPUT:
# finally runs before the function returns
# from try
# body 0
# cleanup 0
# cleanup 1`
            ]
        },
        {
            content: `<h3>Never return from finally</h3>
A <code>return</code> (or <code>break</code>/<code>continue</code>) inside <code>finally</code> <b>replaces</b> the value returned by <code>try</code> - and silently <b>discards</b> any exception that was propagating. Newer Python versions emit a warning for it. Keep <code>finally</code> for cleanup only.`,
            codeExamples: [
                `def g():
    try:
        return 1
    finally:
        return 2              # overrides the try's return

def h():
    try:
        1 / 0
    finally:
        return "swallowed"    # the ZeroDivisionError disappears!

print(g())
print(h())

# OUTPUT:
# 2
# swallowed`
            ]
        },
        {
            content: `<h3>try/finally Without except</h3>
You don't have to catch anything. <code>try</code>/<code>finally</code> guarantees cleanup and lets the exception continue up to a caller that knows how to handle it.`,
            codeExamples: [
                `import threading

lock = threading.Lock()
balance = 100

def withdraw(amount):
    global balance
    lock.acquire()
    try:
        if amount > balance:
            raise ValueError("insufficient funds")
        balance -= amount
    finally:
        lock.release()        # never left locked, even on error

withdraw(30)
try:
    withdraw(500)
except ValueError as e:
    print("Error:", e)
print(balance, lock.locked())

# OUTPUT:
# Error: insufficient funds
# 70 False`
            ]
        },
        {
            content: `<h3>Prefer with for Resources</h3>
Most cleanup is better written with a <code>with</code> statement: the object itself knows how to clean up, and you can't forget the <code>finally</code>. Files, locks, sockets and database connections all support it. The <i>Context Managers</i> module shows how to write your own.`,
            codeExamples: [
                `import threading

lock = threading.Lock()

# try/finally version
lock.acquire()
try:
    print("working")
finally:
    lock.release()

# Equivalent with statement
with lock:
    print("working")

with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("closed automatically")
print(f.closed)

# OUTPUT:
# working
# working
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>When does the else block of a try run?</td><td>Only if the try block finished without raising an exception</td></tr>
<tr class='text-center'><td>When does finally run?</td><td>Always - after success, after a handled exception, and before an unhandled one propagates</td></tr>
<tr class='text-center'><td>Why put code in else instead of try?</td><td>So exceptions from that code aren't accidentally caught by the except blocks</td></tr>
<tr class='text-center'><td>Does finally run if try contains return?</td><td>Yes - finally runs before the function actually returns</td></tr>
<tr class='text-center'><td>What happens if finally contains return?</td><td>It overrides the try's return value and swallows any propagating exception - avoid it</td></tr>
<tr class='text-center'><td>finally vs with?</td><td>Both guarantee cleanup; with is preferred for resources that support it</td></tr>
</table>`
        }
    ]
};
