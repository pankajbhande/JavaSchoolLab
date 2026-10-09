import type { Topic } from '../../types';

export const freeVariables: Topic = {
    id: 'python-closures-free-variables',
    name: 'Free Variables',
    beginner: [
        {
            content: `<h4>What is a Free Variable?</h4>
Inside a function, a variable is:<br>
• <b>local</b> if it is assigned in that function (or is a parameter),<br>
• <b>free</b> if it is used there but defined in an <b>enclosing function</b>.<br><br>
Free variables are exactly what a closure captures. Module-level (global) names are <b>not</b> free variables - they are looked up in the module when needed and don't need to be captured.`,
            codeExamples: [
                `def make_discount(percent):
    def apply(price):            # price is local to apply
        return price - price * percent / 100   # percent is FREE in apply
    return apply

ten_off = make_discount(10)
print(ten_off(500))
print(ten_off.__code__.co_varnames)    # local names
print(ten_off.__code__.co_freevars)    # free names

# OUTPUT:
# 450.0
# ('price',)
# ('percent',)`
            ]
        },
        {
            content: `<h4>Free in the Inner Function, "Cell" in the Outer</h4>
The outer function knows that one of its locals will be captured, so it stores that variable in a <b>cell</b> instead of a normal local slot. <code>co_cellvars</code> lists those variables on the outer function; <code>co_freevars</code> lists them on the inner one.`,
            codeExamples: [
                `def make_discount(percent):
    def apply(price):
        return price - price * percent / 100
    return apply

print(make_discount.__code__.co_cellvars)
print(make_discount(10).__code__.co_freevars)

RATE = 0.18
def with_tax(amount):
    return amount * (1 + RATE)       # RATE is global, not free
print(with_tax.__code__.co_freevars)

# OUTPUT:
# ('percent',)
# ('percent',)
# ()`
            ]
        },
        {
            content: `<h4>Reading vs Rebinding</h4>
An inner function can <b>read</b> a free variable freely. Assigning to that name inside the inner function would make it a new <b>local</b> instead - unless you declare it <code>nonlocal</code> (covered in the next topic).`,
            codeExamples: [
                `def outer():
    message = "hello"
    def read_only():
        return message.upper()        # reading: fine
    def shadow():
        message = "bye"               # creates a NEW local; outer's is untouched
        return message
    return read_only(), shadow(), message

print(outer())

# OUTPUT:
# ('HELLO', 'bye', 'hello')`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Cells Capture Variables, Not Values</h3>
A closure does not take a snapshot. It holds a reference to the <b>cell</b>, and the cell holds the variable's <b>current</b> value. If the outer function changes the variable before returning, the closure sees the latest value.`,
            codeExamples: [
                `def outer():
    status = "draft"
    def get_status():
        return status
    status = "published"         # changed after get_status was created
    return get_status

print(outer()())

# OUTPUT:
# published`
            ]
        },
        {
            content: `<h3>Several Closures Can Share One Cell</h3>
Functions defined in the same call of the outer function share the <b>same</b> cell for a captured variable. A change made through one is visible through the others - a tiny object with methods, built from functions.`,
            codeExamples: [
                `def make_account(balance):
    def deposit(amount):
        nonlocal balance
        balance += amount
        return balance

    def get_balance():
        return balance

    return deposit, get_balance

deposit, get_balance = make_account(100)
deposit(50)
print(get_balance())
print(deposit.__closure__[0] is get_balance.__closure__[0])

other_deposit, other_balance = make_account(0)    # a new call -> new cell
print(other_balance())

# OUTPUT:
# 150
# True
# 0`
            ]
        },
        {
            content: `<h3>Closures Keep Objects Alive</h3>
As long as a closure exists, everything it captures stays in memory - even large objects the closure barely uses. Capture only what you need: extract the small piece in the outer function, so the big object can be freed.`,
            codeExamples: [
                `def make_reader_heavy():
    rows = list(range(1_000_000))      # big list captured whole
    def first():
        return rows[0]
    return first

def make_reader_light():
    rows = list(range(1_000_000))
    first_row = rows[0]                # capture just what is needed
    def first():
        return first_row
    return first

heavy = make_reader_heavy()
light = make_reader_light()
print(len(heavy.__closure__[0].cell_contents))
print(light.__code__.co_freevars)

# OUTPUT:
# 1000000
# ('first_row',)`
            ]
        },
        {
            content: `<h3>Name Kinds at a Glance</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Kind</th><th>Where it is defined</th><th>Listed in</th></tr>
<tr class='text-center'><td>Local</td><td>Assigned in this function / a parameter</td><td><code>co_varnames</code></td></tr>
<tr class='text-center'><td>Cell</td><td>A local of this function that an inner function captures</td><td><code>co_cellvars</code></td></tr>
<tr class='text-center'><td>Free</td><td>A local of an enclosing function, used here</td><td><code>co_freevars</code></td></tr>
<tr class='text-center'><td>Global / built-in</td><td>Module level or builtins</td><td><code>co_names</code> (looked up at run time)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a free variable?</td><td>A variable used in a function but defined in an enclosing function's scope</td></tr>
<tr class='text-center'><td>Are global variables free variables?</td><td>No - globals are looked up in the module at run time and are not captured</td></tr>
<tr class='text-center'><td>co_freevars vs co_cellvars?</td><td>co_freevars: names an inner function captures; co_cellvars: names of the outer function that are captured by inner functions</td></tr>
<tr class='text-center'><td>Does a closure capture a value or a variable?</td><td>The variable (via a cell) - later changes are visible</td></tr>
<tr class='text-center'><td>Can two closures share state?</td><td>Yes - functions created in the same outer call share the same cell</td></tr>
<tr class='text-center'><td>Why can closures cause memory to be held longer?</td><td>Captured objects stay alive as long as the closure exists</td></tr>
</table>`
        }
    ]
};
