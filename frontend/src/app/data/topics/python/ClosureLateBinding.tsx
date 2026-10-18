import type { Topic } from '../../types';

export const closureLateBinding: Topic = {
    id: 'python-closures-closure-behavior-late-binding',
    name: 'Closure Behavior & Late Binding',
    beginner: [
        {
            content: `<h4>Closures Look Up Values When Called</h4>
A closure does not freeze the value a variable had when the inner function was created. It looks the variable up <b>each time it is called</b>. This is called <b>late binding</b>. Usually that is what you want - but it surprises people when closures are created in a loop.`,
            codeExamples: [
                `def outer():
    greeting = "Hi"
    def greet():
        return greeting
    greeting = "Hello"           # changed before greet is called
    return greet

print(outer()())

# OUTPUT:
# Hello`
            ]
        },
        {
            content: `<h4>The Classic Loop Bug</h4>
Every function created in the loop below refers to the <b>same</b> loop variable <code>name</code>. By the time any of them runs, the loop has finished and <code>name</code> holds its last value.`,
            codeExamples: [
                `callbacks = []
for name in ["Save", "Open", "Exit"]:
    def on_click():
        return f"{name} clicked"
    callbacks.append(on_click)

print([cb() for cb in callbacks])

# OUTPUT:
# ['Exit clicked', 'Exit clicked', 'Exit clicked']`
            ]
        },
        {
            content: `<h4>Fix 1: A Default Argument</h4>
Default values are evaluated <b>once, when the function is defined</b>. Copying the loop variable into a default parameter freezes the current value for each function.`,
            codeExamples: [
                `callbacks = []
for name in ["Save", "Open", "Exit"]:
    def on_click(name=name):
        return f"{name} clicked"
    callbacks.append(on_click)

print([cb() for cb in callbacks])

# OUTPUT:
# ['Save clicked', 'Open clicked', 'Exit clicked']`
            ]
        },
        {
            content: `<h4>Fix 2: A Factory Function</h4>
Calling a separate function on each iteration creates a <b>new scope</b> with its own variable, so each closure captures a different cell. This is the most explicit fix.`,
            codeExamples: [
                `def make_handler(name):
    def on_click():
        return f"{name} clicked"
    return on_click

callbacks = [make_handler(name) for name in ["Save", "Open", "Exit"]]
print([cb() for cb in callbacks])

# OUTPUT:
# ['Save clicked', 'Open clicked', 'Exit clicked']`
            ]
        },
        {
            content: `<h4>Fix 3: functools.partial</h4>
<code>partial</code> stores the argument value inside the partial object right away, so there is no late lookup at all.`,
            codeExamples: [
                `from functools import partial

def handle(name):
    return f"{name} clicked"

callbacks = [partial(handle, name) for name in ["Save", "Open", "Exit"]]
print([cb() for cb in callbacks])

# OUTPUT:
# ['Save clicked', 'Open clicked', 'Exit clicked']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why the Default-Argument Fix Works</h3>
A default is an expression evaluated by the <code>def</code> statement and stored on the function object in <code>__defaults__</code>. Each loop iteration runs <code>def</code> again, so each function gets its own stored value. The downside: callers can override it by passing an argument - make it keyword-only (<code>def on_click(*, name=name)</code>) to discourage that.`,
            codeExamples: [
                `handlers = []
for name in ["Save", "Open"]:
    def on_click(*, name=name):
        return f"{name} clicked"
    handlers.append(on_click)

print([h.__defaults__ for h in handlers])
print([h.__kwdefaults__ for h in handlers])

# OUTPUT:
# [None, None]
# [{'name': 'Save'}, {'name': 'Open'}]`
            ]
        },
        {
            content: `<h3>Comprehensions Don't Save You</h3>
A comprehension has its own scope, but it is <b>one</b> scope for the whole comprehension, with one loop variable that is updated on each pass. Lambdas or functions created inside it still share that single variable.`,
            codeExamples: [
                `funcs = [lambda: n * 10 for n in range(3)]
print([f() for f in funcs])

funcs = [lambda n=n: n * 10 for n in range(3)]
print([f() for f in funcs])

# OUTPUT:
# [20, 20, 20]
# [0, 10, 20]`
            ]
        },
        {
            content: `<h3>Proof: They Share One Cell</h3>
Inspecting the closures from the buggy loop (wrapped in a function so the loop variable is a captured local) shows every function holds the <b>same</b> cell object.`,
            codeExamples: [
                `def build():
    funcs = []
    for i in range(3):
        def show():
            return i
        funcs.append(show)
    return funcs

funcs = build()
cells = [f.__closure__[0] for f in funcs]
print(cells[0] is cells[1] is cells[2])
print(cells[0].cell_contents)

# OUTPUT:
# True
# 2`
            ]
        },
        {
            content: `<h3>Compared with Java</h3>
Java avoids this particular bug by rule: a lambda may capture only <b>effectively final</b> locals. In an enhanced <code>for</code> loop each iteration declares a fresh variable, so capturing it is allowed and each lambda gets its own value; capturing the counter of a classic <code>for (int i = 0; ...)</code> loop is a compile error. Python allows the capture and resolves the value late, so you must choose one of the fixes above.`,
            codeExamples: [
                `# Java:
#   for (String name : names) {
#       callbacks.add(() -> name + " clicked");     // OK: a new name each iteration
#   }
#   for (int i = 0; i < 3; i++) {
#       tasks.add(() -> System.out.println(i));     // compile error: i is not effectively final
#   }`
            ]
        },
        {
            content: `<h3>When Late Binding Is Useful</h3>
Late binding is the reason closures can see configuration that is finished <i>after</i> they are created, and why helper functions defined early can use values computed later in the same outer function. The rule of thumb: if a closure must remember the value <b>at creation time</b>, bind it explicitly (default, factory or partial).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is late binding in closures?</td><td>Captured variables are looked up when the closure is called, not when it is created</td></tr>
<tr class='text-center'><td>What does <code>[lambda: i for i in range(3)]</code> produce when each is called?</td><td>2, 2, 2 - all share the one loop variable, which ends at 2</td></tr>
<tr class='text-center'><td>Three ways to fix it?</td><td>A default argument (<code>lambda i=i: i</code>), a factory function that creates a new scope, or functools.partial</td></tr>
<tr class='text-center'><td>Why does a default argument fix it?</td><td>Defaults are evaluated once when def/lambda runs, storing each iteration's current value</td></tr>
<tr class='text-center'><td>Why doesn't Java have this bug?</td><td>Java lambdas can capture only effectively final variables, and enhanced-for creates a new variable per iteration</td></tr>
</table>`
        }
    ]
};
