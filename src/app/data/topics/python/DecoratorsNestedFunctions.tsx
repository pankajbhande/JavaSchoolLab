import type { Topic } from '../../types';

export const nestedFunctions: Topic = {
    id: 'python-decorators-nested-functions',
    name: 'Nested Functions',
    beginner: [
        {
            content: `<h4>Functions Inside Functions</h4>
A <code>def</code> can appear inside another function's body. The inner function is created each time the outer function runs and is only visible <b>inside</b> it - a private helper. Java has no direct equivalent (the closest are local classes and lambdas).`,
            codeExamples: [
                `def process_order(items):
    def subtotal():
        return sum(price * qty for price, qty in items)

    def tax(amount):
        return round(amount * 0.18, 2)

    base = subtotal()
    return base + tax(base)

print(process_order([(100, 2), (50, 1)]))
subtotal()

# OUTPUT:
# 295.0
# NameError: name 'subtotal' is not defined`
            ]
        },
        {
            content: `<h4>Inner Functions See Outer Variables</h4>
An inner function can <b>read</b> the outer function's parameters and local variables - notice <code>subtotal()</code> above used <code>items</code> without receiving it as an argument.`,
            codeExamples: [
                `def report(student, marks):
    def line(subject):
        return f"{student}: {subject} = {marks[subject]}"

    for subject in marks:
        print(line(subject))

report("Asha", {"Maths": 91, "Physics": 84})

# OUTPUT:
# Asha: Maths = 91
# Asha: Physics = 84`
            ]
        },
        {
            content: `<h4>Returning the Inner Function</h4>
The outer function can return its inner function instead of calling it. The returned function still remembers the outer variables it uses - this is a <b>closure</b>, and it is the mechanism every decorator relies on.`,
            codeExamples: [
                `def make_greeter(greeting):
    def greet(name):
        return f"{greeting}, {name}!"
    return greet                  # return it, don't call it

hello = make_greeter("Hello")
namaste = make_greeter("Namaste")

print(hello("Asha"))
print(namaste("Ravi"))

# OUTPUT:
# Hello, Asha!
# Namaste, Ravi!`
            ]
        },
        {
            content: `<h4>The Shape of Every Decorator</h4>
A decorator is simply this pattern with a <b>function</b> as the outer parameter:`,
            codeExamples: [
                `def outer(func):                 # receives a function
    def inner():
        print("extra behaviour")
        return func()             # uses the outer variable
    return inner                  # returns the new function

def task():
    return "done"

task = outer(task)
print(task())

# OUTPUT:
# extra behaviour
# done`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Where the Remembered Values Live</h3>
A closure stores the outer variables it uses in <b>cells</b>. You can inspect them through <code>__code__.co_freevars</code> (the names) and <code>__closure__</code> (the cells).`,
            codeExamples: [
                `def make_greeter(greeting):
    def greet(name):
        return f"{greeting}, {name}!"
    return greet

hello = make_greeter("Hello")
print(hello.__code__.co_freevars)
print(hello.__closure__[0].cell_contents)
print(hello.__qualname__)

# OUTPUT:
# ('greeting',)
# Hello
# make_greeter.<locals>.greet`
            ]
        },
        {
            content: `<h3>Each Call Creates a New Inner Function</h3>
The inner <code>def</code> runs every time the outer function is called, producing a <b>new function object</b> with its own captured values. The compiled code is shared; only the function object and its closure differ.`,
            codeExamples: [
                `def make_greeter(greeting):
    def greet(name):
        return f"{greeting}, {name}!"
    return greet

a = make_greeter("Hi")
b = make_greeter("Hi")

print(a is b)
print(a.__code__ is b.__code__)
print(a("Ravi") == b("Ravi"))

# OUTPUT:
# False
# True
# True`
            ]
        },
        {
            content: `<h3>Rebinding Needs nonlocal</h3>
Inner functions can read outer variables freely, but <b>assigning</b> to one makes it local to the inner function. Use <code>nonlocal</code> to rebind the outer variable (see <i>global &amp; nonlocal</i> and the Closures module).`,
            codeExamples: [
                `def make_counter():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    return increment

counter = make_counter()
print(counter(), counter(), counter())

# OUTPUT:
# 1 2 3`
            ]
        },
        {
            content: `<h3>When Nesting Helps - and When It Hurts</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Good use</th><th>Better as a module-level function</th></tr>
<tr class='text-center'><td>Decorators and function factories that must capture values</td><td>Helpers you want to unit-test on their own</td></tr>
<tr class='text-center'><td>A tiny helper used only in one place that needs outer variables</td><td>Logic reused by several functions</td></tr>
<tr class='text-center'><td>Hiding implementation details of one function</td><td>Large inner functions that make the outer one long and deeply indented</td></tr>
</table>
A common compromise: move the helper to module level with a leading underscore (<code>_subtotal</code>) - still "private" by convention, but importable by tests.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can you call an inner function from outside?</td><td>Not by name - only if the outer function returns it or stores it somewhere</td></tr>
<tr class='text-center'><td>What is a closure?</td><td>An inner function together with the outer variables it remembers after the outer function has returned</td></tr>
<tr class='text-center'><td>Is a new inner function created on every call?</td><td>Yes - a new function object (sharing the same compiled code) with its own captured values</td></tr>
<tr class='text-center'><td>How does an inner function change an outer variable?</td><td>Declare it <code>nonlocal</code>; otherwise assignment creates a new local</td></tr>
<tr class='text-center'><td>How do nested functions relate to decorators?</td><td>A decorator is an outer function taking a function and returning a nested wrapper that closes over it</td></tr>
</table>`
        }
    ]
};
