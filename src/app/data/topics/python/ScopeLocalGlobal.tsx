import type { Topic } from '../../types';

export const scopeLocalGlobal: Topic = {
    id: 'python-functions-scope-local-global-variables',
    name: 'Scope: Local & Global Variables',
    beginner: [
        {
            content: `<h4>What is Scope?</h4>
The <b>scope</b> of a variable is the part of the program where its name can be used.<br><br>
• A <b>global</b> variable is created at the top level of a file (module). It can be read anywhere in that file.<br>
• A <b>local</b> variable is created inside a function - by assignment or as a parameter. It exists only while that function runs.`,
            codeExamples: [
                `school = "DHIPAN"                 # global

def show_school():
    print("Inside:", school)      # functions can READ globals

show_school()
print("Outside:", school)

# OUTPUT:
# Inside: DHIPAN
# Outside: DHIPAN`
            ]
        },
        {
            content: `<h4>Assignment Creates a Local Variable</h4>
Assigning to a name inside a function creates a <b>new local</b> variable, even if a global with the same name exists. The global is not touched.`,
            codeExamples: [
                `count = 10

def change():
    count = 99                    # a NEW local variable
    print("inside:", count)

change()
print("outside:", count)

# OUTPUT:
# inside: 99
# outside: 10`
            ]
        },
        {
            content: `<h4>Local Variables Vanish After the Function Returns</h4>`,
            codeExamples: [
                `def calculate():
    temp = 5 * 4
    return temp

result = calculate()
print(result)
print(temp)

# OUTPUT:
# 20
# NameError: name 'temp' is not defined`
            ]
        },
        {
            content: `<h4>Parameters Are Locals Too</h4>
Each function has its own local names, so two functions can use the same name without interfering. Reassigning a parameter changes only the function's local name, not the caller's variable.`,
            codeExamples: [
                `def area(n):
    result = n * n
    return result

def perimeter(n):
    result = 4 * n                # a different "result"
    return result

print(area(5), perimeter(5))

def double(n):
    n = n * 2                     # rebinds the local parameter only
    return n

x = 4
print(double(x), x)

# OUTPUT:
# 25 20
# 8 4`
            ]
        },
        {
            content: `<h4>if and for Blocks Do NOT Create a Scope</h4>
Unlike Java, where a variable declared inside <code>{ }</code> disappears at the closing brace, Python only creates new scopes for <b>functions</b> (and classes, modules and comprehensions). Variables assigned inside <code>if</code>, <code>for</code>, <code>while</code> or <code>with</code> remain available afterwards.`,
            codeExamples: [
                `if True:
    message = "hello"

for i in range(3):
    square = i * i

print(message, i, square)

# OUTPUT:
# hello 2 4`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The LEGB Rule</h3>
When Python looks up a name it searches four scopes, in this order, and uses the first match:<br>
1. <b>L</b>ocal - names assigned in the current function<br>
2. <b>E</b>nclosing - locals of any outer functions (for nested functions)<br>
3. <b>G</b>lobal - names at the top level of the module<br>
4. <b>B</b>uilt-in - names like <code>len</code>, <code>print</code>, <code>list</code><br><br>
If the name is found in none of them: <code>NameError</code>.`,
            codeExamples: [
                `x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print("inner sees:", x)

    inner()
    print("outer sees:", x)

outer()
print("module sees:", x)

def outer2():
    y = "enclosing"

    def inner2():
        print(y, len("abc"))       # y from Enclosing, len from Built-in

    inner2()

outer2()

# OUTPUT:
# inner sees: local
# outer sees: enclosing
# module sees: global
# enclosing 3`
            ]
        },
        {
            content: `<h3>Shadowing Built-ins</h3>
Built-ins are the last scope searched, so a global or local with the same name hides them. Naming a variable <code>list</code>, <code>str</code>, <code>id</code>, <code>sum</code> or <code>input</code> is a common source of confusing errors. <code>del</code> removes your name so the built-in is visible again.`,
            codeExamples: [
                `list = [1, 2, 3]                  # shadows the built-in list
try:
    list("ab")
except TypeError as error:
    print("Error:", error)

del list                          # remove the global name
print(list("ab"))                 # the built-in is back

# OUTPUT:
# Error: 'list' object is not callable
# ['a', 'b']`
            ]
        },
        {
            content: `<h3>UnboundLocalError: Scope Is Decided at Compile Time</h3>
Python decides whether a name is local when it <b>compiles</b> the function, not line by line while running it. If a name is assigned <b>anywhere</b> in the function - even after it is used, or in a branch that never runs - it is local for the <b>whole</b> function. Reading it before the assignment then fails.`,
            codeExamples: [
                `total = 100

def add_bonus():
    print(total)              # total is local here because of the next line
    total = total + 10

add_bonus()

# OUTPUT:
# UnboundLocalError: cannot access local variable 'total' where it is not associated with a value`,
                `x = 1

def f():
    print(x)
    if False:
        x = 2                 # never runs, but still makes x local

f()

# OUTPUT:
# UnboundLocalError: cannot access local variable 'x' where it is not associated with a value`
            ]
        },
        {
            content: `<h3>Fixing It</h3>
The clean fix is to pass the value in and return the result. The <code>global</code> and <code>nonlocal</code> keywords also exist - see <i>global &amp; nonlocal</i>.`,
            codeExamples: [
                `total = 100

def add_bonus(amount):
    return amount + 10

total = add_bonus(total)
print(total)

# OUTPUT:
# 110`
            ]
        },
        {
            content: `<h3>globals() and locals()</h3>
<code>globals()</code> returns the module's namespace dict; <code>locals()</code> returns the current local names. They are useful for inspection and debugging. Writing into <code>locals()</code> inside a function does <b>not</b> change real local variables, and writing into <code>globals()</code> creates variables invisibly - avoid both.`,
            codeExamples: [
                `app_name = "JavaSchoolLab"

def f():
    a = 1
    b = 2
    print(locals())
    locals()["a"] = 99            # has no effect on the real variable
    print(a)

f()
print("app_name" in globals())

# OUTPUT:
# {'a': 1, 'b': 2}
# 1
# True`
            ]
        },
        {
            content: `<h3>Comprehensions Have Their Own Scope</h3>
In Python 3 the loop variable of a list, set or dict comprehension (and a generator expression) does not leak out - unlike a normal <code>for</code> loop.`,
            codeExamples: [
                `x = "outer"
squares = [x * x for x in range(4)]
print(squares, x)

for y in range(4):
    pass
print(y)

# OUTPUT:
# [0, 1, 4, 9] outer
# 3`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the LEGB rule?</td><td>The name lookup order: Local, Enclosing, Global, Built-in</td></tr>
<tr class='text-center'><td>Can a function read a global variable?</td><td>Yes; it needs <code>global</code> only to rebind (assign) it</td></tr>
<tr class='text-center'><td>Do if/for blocks create a new scope?</td><td>No - only functions, classes, modules and comprehensions do</td></tr>
<tr class='text-center'><td>Why does UnboundLocalError happen?</td><td>An assignment anywhere in the function makes the name local, so reading it before the assignment fails</td></tr>
<tr class='text-center'><td>Why is naming a variable <code>list</code> a bad idea?</td><td>It shadows the built-in, so later calls like <code>list(x)</code> fail with "object is not callable"</td></tr>
<tr class='text-center'><td>Does a comprehension variable leak into the surrounding scope?</td><td>Not in Python 3</td></tr>
</table>`
        }
    ]
};
