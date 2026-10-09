import type { Topic } from '../../types';

export const globalNonlocal: Topic = {
    id: 'python-functions-global-nonlocal',
    name: 'global & nonlocal',
    beginner: [
        {
            content: `<h4>The Problem</h4>
Inside a function, assigning to a name creates a <b>local</b> variable. So a function can't simply update a module-level counter - Python treats <code>count</code> as local and fails when it tries to read it first.`,
            codeExamples: [
                `count = 0

def increment():
    count += 1          # reads AND assigns count -> count is local

increment()

# OUTPUT:
# UnboundLocalError: cannot access local variable 'count' where it is not associated with a value`
            ]
        },
        {
            content: `<h4>The global Keyword</h4>
<code>global name</code> tells Python that assignments to <code>name</code> in this function should change the <b>module-level</b> variable instead of creating a local one.`,
            codeExamples: [
                `count = 0

def increment():
    global count
    count += 1

increment()
increment()
increment()
print(count)

# OUTPUT:
# 3`
            ]
        },
        {
            content: `<h4>Mutating vs Rebinding</h4>
<code>global</code> is only needed to <b>rebind</b> a name (make it refer to a new object with <code>=</code>, <code>+=</code> and so on). Calling a method that <b>changes</b> a global object, like <code>list.append()</code> or <code>dict[key] = value</code>, needs no keyword - the name still refers to the same object.`,
            codeExamples: [
                `cart = []
settings = {"theme": "light"}

def add(item):
    cart.append(item)             # mutation: no global needed

def set_theme(theme):
    settings["theme"] = theme     # mutation: no global needed

def reset():
    global cart
    cart = []                     # rebinding: global needed

add("pen")
add("book")
set_theme("dark")
print(cart, settings)

reset()
print(cart)

# OUTPUT:
# ['pen', 'book'] {'theme': 'dark'}
# []`
            ]
        },
        {
            content: `<h4>The nonlocal Keyword</h4>
<code>nonlocal name</code> does the same job one level in: it lets a <b>nested</b> function rebind a variable belonging to its <b>enclosing</b> function. A classic use is a counter factory, where each counter remembers its own count.`,
            codeExamples: [
                `def make_counter():
    count = 0

    def increment():
        nonlocal count            # the count of make_counter
        count += 1
        return count

    return increment

counter_a = make_counter()
counter_b = make_counter()

print(counter_a(), counter_a(), counter_a())
print(counter_b())                # independent count

# OUTPUT:
# 1 2 3
# 1`
            ]
        },
        {
            content: `<h4>global vs nonlocal</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Keyword</th><th>Rebinds a variable in</th><th>Variable must already exist?</th></tr>
<tr class='text-center'><td><code>global</code></td><td>The module (top level)</td><td>No - it is created on first assignment</td></tr>
<tr class='text-center'><td><code>nonlocal</code></td><td>The nearest enclosing function</td><td>Yes - checked at compile time</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Why Globals Are Discouraged</h3>
Functions that change global state are hard to test (results depend on hidden state), hard to reuse, and hard to reason about, because any function might change the value. Prefer:<br>
• <b>Parameters and return values</b> - data flows visibly in and out.<br>
• <b>A class</b> - state lives in an object you can create several of.<br>
• <b>A configuration object</b> passed to the code that needs it.<br><br>
Module-level <b>constants</b> (<code>MAX_RETRIES = 3</code>) are fine - they are never rebound.`,
            codeExamples: [
                `# Instead of a global counter...
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1
        return self.count

visits = Counter()
downloads = Counter()
visits.increment()
visits.increment()
downloads.increment()
print(visits.count, downloads.count)

# ...or pass state in and return the new value
def increment(count):
    return count + 1

total = increment(increment(0))
print(total)

# OUTPUT:
# 2 1
# 2`
            ]
        },
        {
            content: `<h3>nonlocal Needs an Existing Enclosing Binding</h3>
<code>nonlocal</code> is resolved when the code is <b>compiled</b>. The name must already be a local variable of an enclosing function - module-level globals don't count, and it can't be used at module level at all.`,
            codeExamples: [
                `def outer():
    def inner():
        nonlocal x          # outer has no variable x
        x = 1
    inner()

# OUTPUT:
# SyntaxError: no binding for nonlocal 'x' found`,
                `x = 10              # a global, not an enclosing local

def outer():
    def inner():
        nonlocal x
        x = 1
    inner()

# OUTPUT:
# SyntaxError: no binding for nonlocal 'x' found`
            ]
        },
        {
            content: `<h3>global Can Create a Variable</h3>
A function can declare <code>global</code> for a name that doesn't exist yet; the assignment creates it at module level. Writing <code>global name</code> at module level itself is allowed but does nothing. Both are signs of code that should probably be restructured.`,
            codeExamples: [
                `def setup():
    global config
    config = {"debug": True}

setup()
print(config)

# OUTPUT:
# {'debug': True}`
            ]
        },
        {
            content: `<h3>The Pre-Python-3 Workaround</h3>
<code>nonlocal</code> was added in Python 3. Older code (and some code today) avoids rebinding by storing the value inside a <b>mutable container</b> and mutating it - mutation needs no keyword. You will still recognise this pattern in legacy code.`,
            codeExamples: [
                `def make_counter():
    count = [0]                   # a one-item list as a mutable box

    def increment():
        count[0] += 1             # mutates the list - no nonlocal needed
        return count[0]

    return increment

c = make_counter()
print(c(), c())

# OUTPUT:
# 1 2`
            ]
        },
        {
            content: `<h3>Shared Globals and Threads</h3>
<code>count += 1</code> is several bytecode steps (read, add, write). When several threads update the same global, updates can be lost. Protect shared state with a lock - or better, avoid sharing it.`,
            codeExamples: [
                `import threading

count = 0
lock = threading.Lock()

def work():
    global count
    for _ in range(100_000):
        with lock:                # only one thread updates at a time
            count += 1

threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(count)

# OUTPUT:
# 400000`
            ]
        },
        {
            content: `<h3>Preview: Closures</h3>
The <code>make_counter</code> examples work because the inner function keeps access to the enclosing function's variables even after the outer function has returned. That combination - a function plus the variables it remembers - is called a <b>closure</b>, and it has its own module later in the course.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>When do you need the global keyword?</td><td>Only to rebind a module-level name inside a function - not to read it or mutate the object it refers to</td></tr>
<tr class='text-center'><td>global vs nonlocal?</td><td>global targets the module scope; nonlocal targets the nearest enclosing function's scope</td></tr>
<tr class='text-center'><td>Can nonlocal refer to a global variable?</td><td>No - it needs a binding in an enclosing function, otherwise SyntaxError</td></tr>
<tr class='text-center'><td>Does <code>cart.append(x)</code> inside a function need global?</td><td>No - it mutates the existing object rather than rebinding the name</td></tr>
<tr class='text-center'><td>Why avoid global variables?</td><td>Hidden shared state makes code hard to test, reuse and reason about, and is unsafe across threads</td></tr>
<tr class='text-center'><td>How did code rebind enclosing variables before nonlocal existed?</td><td>By storing the value in a mutable container (e.g. a one-item list) and mutating it</td></tr>
</table>`
        }
    ]
};
