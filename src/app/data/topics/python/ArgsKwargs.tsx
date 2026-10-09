import type { Topic } from '../../types';

export const argsKwargs: Topic = {
    id: 'python-functions-args-kwargs',
    name: '*args & **kwargs',
    beginner: [
        {
            content: `<h4>Functions That Accept Any Number of Arguments</h4>
Sometimes you don't know in advance how many values a caller will pass - think of <code>print()</code> or <code>max()</code>. Python has two special parameters for this:<br><br>
• <code>*args</code> collects any <b>extra positional</b> arguments into a <b>tuple</b>.<br>
• <code>**kwargs</code> collects any <b>extra keyword</b> arguments into a <b>dict</b>.<br><br>
The names <code>args</code> and <code>kwargs</code> are only a convention - the <code>*</code> and <code>**</code> are what matter.`
        },
        {
            content: `<h4>*args - Extra Positional Arguments</h4>`,
            codeExamples: [
                `def show(*args):
    print(args, type(args))

show(1, 2, 3)
show("a")
show()

def total(*numbers):              # any name works
    return sum(numbers)

print(total(10, 20, 30))

# OUTPUT:
# (1, 2, 3) <class 'tuple'>
# ('a',) <class 'tuple'>
# () <class 'tuple'>
# 60`
            ]
        },
        {
            content: `<h4>**kwargs - Extra Keyword Arguments</h4>
Each <code>name=value</code> pair becomes a key and value in a dictionary, in the order they were passed.`,
            codeExamples: [
                `def profile(**info):
    print(info)
    for key, value in info.items():
        print(f"{key}: {value}")

profile(name="Asha", age=21, city="Pune")

# OUTPUT:
# {'name': 'Asha', 'age': 21, 'city': 'Pune'}
# name: Asha
# age: 21
# city: Pune`
            ]
        },
        {
            content: `<h4>Combining with Normal Parameters</h4>
Regular parameters take their values first; <code>*args</code> gets whatever positional values are left over and <code>**kwargs</code> gets the leftover keyword values.`,
            codeExamples: [
                `def place_order(customer, *items, **options):
    print("Customer:", customer)
    print("Items:   ", items)
    print("Options: ", options)

place_order("Asha", "pen", "book", express=True, gift_wrap=False)

# OUTPUT:
# Customer: Asha
# Items:    ('pen', 'book')
# Options:  {'express': True, 'gift_wrap': False}`
            ]
        },
        {
            content: `<h4>Unpacking at the Call Site</h4>
The same symbols work in the other direction when <b>calling</b> a function: <code>*seq</code> spreads a list or tuple into positional arguments, and <code>**d</code> spreads a dict into keyword arguments.`,
            codeExamples: [
                `def greet(name, greeting):
    print(f"{greeting}, {name}!")

args = ["Ravi", "Hello"]
kwargs = {"name": "Sheru", "greeting": "Hi"}

greet(*args)              # greet("Ravi", "Hello")
greet(**kwargs)           # greet(name="Sheru", greeting="Hi")

def total(*numbers):
    return sum(numbers)

marks = [70, 85, 90]
print(total(*marks))

# OUTPUT:
# Hello, Ravi!
# Hi, Sheru!
# 245`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Full Parameter Order</h3>
Parameters must appear in this order:<br>
<code>def f(positional, with_default=..., *args, keyword_only, keyword_only_with_default=..., **kwargs)</code><br><br>
Any parameter written <b>after</b> <code>*args</code> is <b>keyword-only</b>: it can never be filled positionally, because <code>*args</code> swallows all remaining positional values.`,
            codeExamples: [
                `def f(a, b=2, *args, c, d=4, **kwargs):
    print(a, b, args, c, d, kwargs)

f(1, 3, 5, 6, c=7, e=8)
f(1, c=0)
f(1, 2, 3)

# OUTPUT:
# 1 3 (5, 6) 7 4 {'e': 8}
# 1 2 () 0 4 {}
# TypeError: f() missing 1 required keyword-only argument: 'c'`
            ]
        },
        {
            content: `<h3>Keyword-Only Without *args: the Bare *</h3>
A lone <code>*</code> marks the following parameters as keyword-only without accepting extra positional values. This forces callers to write readable calls like <code>connect("db", timeout=5)</code>.`,
            codeExamples: [
                `def connect(host, *, timeout=10, retries=3):
    print(f"{host} timeout={timeout} retries={retries}")

connect("db.local", timeout=5)
connect("db.local", 5)

# OUTPUT:
# db.local timeout=5 retries=3
# TypeError: connect() takes 1 positional argument but 2 were given`
            ]
        },
        {
            content: `<h3>Forwarding Arguments: the Wrapper Pattern</h3>
<code>def wrapper(*args, **kwargs): return func(*args, **kwargs)</code> accepts <b>any</b> arguments and passes them on unchanged. It is the heart of decorators (covered in the Decorators module): extra behaviour is added around a function without knowing its signature.`,
            codeExamples: [
                `def logged(func):
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__} with {args} {kwargs}")
        return func(*args, **kwargs)
    return wrapper

def add(a, b):
    return a + b

add = logged(add)
print(add(2, b=3))

# OUTPUT:
# calling add with (2,) {'b': 3}
# 5`
            ]
        },
        {
            content: `<h3>Building Flexible APIs</h3>
Combining <code>*args</code> with keyword-only options gives functions that are pleasant to call, like <code>print()</code> itself (<code>print(*objects, sep=" ", end="\\n")</code>).`,
            codeExamples: [
                `def log(*parts, sep=" ", level="INFO"):
    print(f"[{level}]", sep.join(str(p) for p in parts))

log("User", 42, "logged in")
log("Disk", "full", level="WARN", sep="-")

def merge(*dicts, **overrides):
    result = {}
    for d in dicts:
        result.update(d)
    result.update(overrides)
    return result

print(merge({"a": 1}, {"b": 2}, a=10))

# OUTPUT:
# [INFO] User 42 logged in
# [WARN] Disk-full
# {'a': 10, 'b': 2}`
            ]
        },
        {
            content: `<h3>Common Pitfalls</h3>
• Passing a list <b>without</b> <code>*</code> gives the function <b>one</b> argument - the list itself.<br>
• <code>args</code> is a tuple, so it can't be appended to - convert with <code>list(args)</code> first.<br>
• <code>kwargs</code> keys are always strings (they are argument names). To merge two dicts in a literal, use <code>{**a, **b}</code> - see <i>Dictionary Unpacking</i>.`,
            codeExamples: [
                `def show(*args):
    print(len(args), args)

nums = [1, 2, 3]
show(nums)              # one argument: the list
show(*nums)             # three arguments

def add_item(*items):
    items.append("x")

add_item("a")

# OUTPUT:
# 1 ([1, 2, 3],)
# 3 (1, 2, 3)
# AttributeError: 'tuple' object has no attribute 'append'`
            ]
        },
        {
            content: `<h3>Compared with Java Varargs</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Syntax</td><td><code>int... nums</code></td><td><code>*nums</code></td></tr>
<tr class='text-center'><td>Collected as</td><td>An array</td><td>A tuple</td></tr>
<tr class='text-center'><td>Element type</td><td>One declared type</td><td>Any mix of types</td></tr>
<tr class='text-center'><td>Position</td><td>Must be the last parameter</td><td>Can be followed by keyword-only parameters and <code>**kwargs</code></td></tr>
<tr class='text-center'><td>Named extras</td><td>Not available (use a Map parameter)</td><td><code>**kwargs</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are *args and **kwargs?</td><td>*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dict</td></tr>
<tr class='text-center'><td>Are the names args and kwargs required?</td><td>No - only the * and ** matter; the names are a convention</td></tr>
<tr class='text-center'><td>What is the correct parameter order?</td><td>positional, defaults, *args, keyword-only, **kwargs</td></tr>
<tr class='text-center'><td>What is a keyword-only parameter?</td><td>One declared after *args or a bare *, which can only be passed as name=value</td></tr>
<tr class='text-center'><td>What does <code>f(*lst, **d)</code> do at a call site?</td><td>Spreads the list into positional arguments and the dict into keyword arguments</td></tr>
<tr class='text-center'><td>Why do decorators use *args, **kwargs?</td><td>So the wrapper can accept and forward any arguments, whatever the wrapped function's signature</td></tr>
</table>`
        }
    ]
};
