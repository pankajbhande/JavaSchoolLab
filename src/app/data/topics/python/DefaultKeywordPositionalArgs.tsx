import type { Topic } from '../../types';

export const defaultKeywordPositionalArgs: Topic = {
    id: 'python-functions-default-keyword-positional-arguments',
    name: 'Default, Keyword & Positional Arguments',
    beginner: [
        {
            content: `<h4>Positional Arguments</h4>
By default, arguments are matched to parameters by <b>position</b>: the first argument goes to the first parameter, and so on. Order matters.`,
            codeExamples: [
                `def book_ticket(name, seat, meal):
    print(f"{name} | seat {seat} | {meal}")

book_ticket("Asha", "12A", "veg")
book_ticket("12A", "Asha", "veg")       # wrong order, wrong result

# OUTPUT:
# Asha | seat 12A | veg
# 12A | seat Asha | veg`
            ]
        },
        {
            content: `<h4>Keyword Arguments</h4>
You can also name the parameter in the call: <code>parameter=value</code>. Keyword arguments can be given in <b>any order</b> and make calls self-explanatory - something Java can't do.`,
            codeExamples: [
                `def book_ticket(name, seat, meal):
    print(f"{name} | seat {seat} | {meal}")

book_ticket(meal="non-veg", name="Ravi", seat="7C")
book_ticket("Kiran", meal="veg", seat="3B")     # positional first, then keywords

# OUTPUT:
# Ravi | seat 7C | non-veg
# Kiran | seat 3B | veg`
            ]
        },
        {
            content: `<h4>Default Values</h4>
A parameter can have a <b>default value</b>, used when the caller doesn't supply that argument. This replaces most uses of method overloading in Java.`,
            codeExamples: [
                `def book_ticket(name, seat="any", meal="veg"):
    print(f"{name} | seat {seat} | {meal}")

book_ticket("Asha")
book_ticket("Ravi", "9F")
book_ticket("Kiran", meal="jain")           # skip seat, set meal

# OUTPUT:
# Asha | seat any | veg
# Ravi | seat 9F | veg
# Kiran | seat any | jain`
            ]
        },
        {
            content: `<h4>The Ordering Rules</h4>
• In a <b>call</b>, positional arguments must come before keyword arguments.<br>
• In a <b>definition</b>, parameters without defaults must come before parameters with defaults.<br>
Breaking either rule is a <code>SyntaxError</code> - the program won't even start.`,
            codeExamples: [
                `book_ticket(name="Asha", "12A")

# OUTPUT:
# SyntaxError: positional argument follows keyword argument`,
                `def book_ticket(name="guest", seat):
    pass

# OUTPUT:
# SyntaxError: parameter without a default follows parameter with a default`
            ]
        },
        {
            content: `<h4>Common Call Errors</h4>`,
            codeExamples: [
                `def book_ticket(name, seat, meal="veg"):
    pass

book_ticket("Asha")

# OUTPUT:
# TypeError: book_ticket() missing 1 required positional argument: 'seat'`,
                `def book_ticket(name, seat, meal="veg"):
    pass

book_ticket("Asha", "12A", colour="red")

# OUTPUT:
# TypeError: book_ticket() got an unexpected keyword argument 'colour'`,
                `def book_ticket(name, seat, meal="veg"):
    pass

book_ticket("Asha", "12A", name="Ravi")

# OUTPUT:
# TypeError: book_ticket() got multiple values for argument 'name'`,
                `def book_ticket(name, seat, meal="veg"):
    pass

book_ticket("Asha", "12A", "veg", "window")

# OUTPUT:
# TypeError: book_ticket() takes from 2 to 3 positional arguments but 4 were given`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Mutable Default Argument Bug</h3>
Default values are evaluated <b>once</b>, when the <code>def</code> statement runs, and stored on the function object in <code>__defaults__</code>. A mutable default (list, dict, set) is therefore shared by every call that doesn't pass that argument.`,
            codeExamples: [
                `def add_item(item, cart=[]):
    cart.append(item)
    return cart

print(add_item("pen"))
print(add_item("book"))            # the same list again!
print(add_item.__defaults__)

# OUTPUT:
# ['pen']
# ['pen', 'book']
# (['pen', 'book'],)`,
                `def add_item(item, cart=None):
    if cart is None:
        cart = []                  # a fresh list on every call
    cart.append(item)
    return cart

print(add_item("pen"))
print(add_item("book"))

# OUTPUT:
# ['pen']
# ['book']`
            ]
        },
        {
            content: `<h3>A Sentinel When None Is a Valid Value</h3>
If callers may legitimately pass <code>None</code>, use a private sentinel object as the default so you can tell "not given" apart from "given as None".`,
            codeExamples: [
                `_MISSING = object()

def get_setting(settings, key, default=_MISSING):
    if key in settings:
        return settings[key]
    if default is _MISSING:
        raise KeyError(key)
    return default

config = {"theme": "dark"}
print(get_setting(config, "theme"))
print(get_setting(config, "proxy", None))     # None explicitly allowed
get_setting(config, "proxy")

# OUTPUT:
# dark
# None
# KeyError: 'proxy'`
            ]
        },
        {
            content: `<h3>Defaults Are Frozen at Definition Time</h3>
Any expression used as a default - not just mutable ones - is evaluated once. A timestamp default records when the function was <b>defined</b>, not when it is called.`,
            codeExamples: [
                `import time
from datetime import datetime

def log(message, when=datetime.now()):      # BUG: evaluated once
    return when

first = log("start")
time.sleep(1)
second = log("later")
print(first == second)

def log_fixed(message, when=None):
    return when if when is not None else datetime.now()

a = log_fixed("start")
time.sleep(1)
b = log_fixed("later")
print(a == b)

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h3>Keyword-Only Parameters (after *)</h3>
Parameters after a bare <code>*</code> can only be passed by keyword. Use them for options and flags, so calls like <code>export(data, True, False)</code> - unreadable booleans - become impossible.`,
            codeExamples: [
                `def export(data, *, fmt="csv", overwrite=False):
    return f"{len(data)} rows -> {fmt} (overwrite={overwrite})"

print(export([1, 2, 3], fmt="json", overwrite=True))
print(export([1, 2, 3], "json"))

# OUTPUT:
# 3 rows -> json (overwrite=True)
# TypeError: export() takes 1 positional argument but 2 were given`
            ]
        },
        {
            content: `<h3>Positional-Only Parameters (before /)</h3>
Since Python 3.8, parameters before a <code>/</code> can only be passed by position. Many built-ins work this way - <code>len(obj=x)</code> is not allowed. It lets a library rename those parameters later without breaking anyone's code, and avoids clashes with <code>**kwargs</code> keys.`,
            codeExamples: [
                `def distance(x1, y1, x2, y2, /):
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5

print(distance(0, 0, 3, 4))
print(len([1, 2, 3]))
distance(x1=0, y1=0, x2=3, y2=4)

# OUTPUT:
# 5.0
# 3
# TypeError: distance() got some positional-only arguments passed as keyword arguments: 'x1, y1, x2, y2'`
            ]
        },
        {
            content: `<h3>The Complete Parameter Order</h3>
<code>def f(pos_only, /, normal, *, kw_only)</code> - and with variable arguments (covered in <i>*args &amp; **kwargs</i>): <code>def f(pos_only, /, normal, *args, kw_only, **kwargs)</code>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Kind</th><th>Where</th><th>Pass by position?</th><th>Pass by keyword?</th></tr>
<tr class='text-center'><td>Positional-only</td><td>before <code>/</code></td><td>Yes</td><td>No</td></tr>
<tr class='text-center'><td>Positional-or-keyword</td><td>between <code>/</code> and <code>*</code></td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Keyword-only</td><td>after <code>*</code> or <code>*args</code></td><td>No</td><td>Yes</td></tr>
</table>`,
            codeExamples: [
                `def create_user(user_id, /, name, *, admin=False):
    return (user_id, name, admin)

print(create_user(7, "Asha"))
print(create_user(8, name="Ravi", admin=True))

# OUTPUT:
# (7, 'Asha', False)
# (8, 'Ravi', True)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Positional vs keyword arguments?</td><td>Positional arguments match parameters by order; keyword arguments match by name and can appear in any order</td></tr>
<tr class='text-center'><td>Why is <code>def f(x=[])</code> dangerous?</td><td>The default list is created once at definition time and shared across calls - use None and create the list inside</td></tr>
<tr class='text-center'><td>Where are default values stored?</td><td>On the function object, in <code>__defaults__</code> (and <code>__kwdefaults__</code> for keyword-only)</td></tr>
<tr class='text-center'><td>What does a bare <code>*</code> in a signature do?</td><td>Makes every following parameter keyword-only</td></tr>
<tr class='text-center'><td>What does <code>/</code> in a signature do?</td><td>Makes every preceding parameter positional-only (Python 3.8+)</td></tr>
<tr class='text-center'><td>Can a parameter without a default follow one with a default?</td><td>No - SyntaxError (unless it is keyword-only, after <code>*</code>)</td></tr>
</table>`
        }
    ]
};
