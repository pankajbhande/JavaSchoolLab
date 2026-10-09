import type { Topic } from '../../types';

export const internalsCodeObjects: Topic = {
    id: 'python-internals-code-objects',
    name: 'Code Objects',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>code object</b> is the immutable result of compiling a function body: bytecode, constants, variable names and more. A <b>function object</b> is created when <code>def</code> runs and wraps a code object together with defaults, globals and closure cells. Many function objects can share one code object. If you know Java, think of the code object as the compiled method body and the function object as a reference to it bound to its environment.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 478 168" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:478px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="213.8" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="116.9" y="27">code object</tspan></text><rect x="10" y="44" width="213.8" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="116.9" y="62.5">immutable, compiled once</tspan></text><rect x="10" y="79" width="213.8" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="116.9" y="97.5">co_name, co_varnames</tspan><tspan x="116.9" y="112.5">co_freevars, bytecode</tspan></text><rect x="10" y="129" width="213.8" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="116.9" y="147.5">shared by many functions</tspan></text><rect x="253.8" y="10" width="213.8" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="360.7" y="27">function object</tspan></text><rect x="253.8" y="44" width="213.8" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="360.7" y="62.5">created each time def runs</tspan></text><rect x="253.8" y="79" width="213.8" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="360.7" y="97.5">__code__, __defaults__</tspan><tspan x="360.7" y="112.5">__closure__, globals</tspan></text><rect x="253.8" y="129" width="213.8" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="360.7" y="147.5">the callable you use</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: one code object can back many function objects</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Treating "function" as one single thing hides how closures, default values and dynamic function creation work, and why two functions made by a factory can share the same compiled code.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Separate <b>what to run</b> (code object) from <b>what it runs with</b> (function object).</li>
<li>Inspect a function's parameters, local names and free variables via <code>co_*</code> attributes.</li>
<li>Understand closures: shared code, separate captured values.</li>
<li>Build or modify functions dynamically with <code>code.replace()</code>.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: One code object, many functions</h4>
A closure factory creates two functions. The program shows they share code but not captured values, and inspects the code object.`,
            codeExamples: [
                `def make_adder(n):
    def add(x):
        return x + n
    return add


def describe(code):
    print(code.co_name, code.co_argcount, code.co_varnames, code.co_freevars)


def is_immutable(code):
    try:
        code.co_name = "other"
    except AttributeError:
        return True
    return False


def main():
    add_two = make_adder(2)
    add_ten = make_adder(10)

    print("same code object:", add_two.__code__ is add_ten.__code__)
    print("same function:   ", add_two is add_ten)
    print(add_two(5), add_ten(5))
    print("captured:", add_two.__closure__[0].cell_contents)

    describe(add_two.__code__)
    print("immutable:", is_immutable(add_two.__code__))
    print(add_two.__code__.replace(co_name="renamed").co_name)


if __name__ == "__main__":
    main()

# OUTPUT:
# same code object: True
# same function:    False
# 7 15
# captured: 2
# add 1 ('x',) ('n',)
# immutable: True
# renamed`
            ],
            codeExplanations: [
                `The inner def add is compiled once, so both functions point at the same code object, yet each call to make_adder builds a new function object with its own closure cell (n = 2 or n = 10). co_freevars lists the captured name n, separate from the local names in co_varnames. The code object is read-only, but replace() returns a modified copy.`
            ]
        },
        {
            content: `<h4>Function = Code + Context</h4>
When Python compiles a function body it produces a <b>code object</b>: an <b>immutable</b> bundle holding the bytecode and the information needed to run it. A <b>function object</b> is created later, when the <code>def</code> statement runs, and wraps a code object together with its runtime context (the module's globals, default values, closure cells, name, docstring). One code object can back many function objects - for example every function a factory returns.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Code object (<code>__code__</code>)</th><th>Function object</th></tr>
<tr class='text-center'><td>Compiled once, immutable</td><td>Created each time <code>def</code> executes</td></tr>
<tr class='text-center'><td>Bytecode, constants, variable names</td><td>Code + globals + defaults + closure</td></tr>
<tr class='text-center'><td>Knows nothing about defaults or the module</td><td>Callable</td></tr>
</table>`
        },
        {
            content: `<h4>Inspecting a Code Object</h4>
Every function exposes its code object as <code>__code__</code>, with attributes starting <code>co_</code>.`,
            codeExamples: [
                `def greet(name, greeting="Hello"):
    message = greeting + ", " + name
    return message

code = greet.__code__

print(code.co_name)
print(code.co_argcount)
print(code.co_varnames)
print(code.co_filename.endswith(".py"))

# OUTPUT:
# greet
# 2
# ('name', 'greeting', 'message')
# True`
            ],
            codeExplanations: [
                `co_argcount is the number of positional parameters; co_varnames lists the local variable names, parameters first, then other locals in order of first assignment. The default value "Hello" is not in the code object - it belongs to the function object (greet.__defaults__).`
            ]
        },
        {
            content: `<h4>The Most Useful Attributes</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Attribute</th><th>Holds</th></tr>
<tr class='text-center'><td><code>co_name</code></td><td>The function name</td></tr>
<tr class='text-center'><td><code>co_argcount</code>, <code>co_kwonlyargcount</code></td><td>Number of positional and keyword-only parameters</td></tr>
<tr class='text-center'><td><code>co_varnames</code></td><td>Names of local variables (including parameters)</td></tr>
<tr class='text-center'><td><code>co_names</code></td><td>Global names and attribute names the code refers to</td></tr>
<tr class='text-center'><td><code>co_consts</code></td><td>Constants used by the code (and nested code objects)</td></tr>
<tr class='text-center'><td><code>co_code</code></td><td>The raw bytecode, as <code>bytes</code></td></tr>
<tr class='text-center'><td><code>co_freevars</code>, <code>co_cellvars</code></td><td>Closure variables used from / provided to other functions</td></tr>
<tr class='text-center'><td><code>co_firstlineno</code>, <code>co_filename</code></td><td>Where the function was defined</td></tr>
<tr class='text-center'><td><code>co_flags</code></td><td>Bit flags: generator? uses *args? ...</td></tr>
</table>`,
            codeExamples: [
                `def show(items):
    print(len(items))

print(show.__code__.co_names)       # the global names it looks up
print(show.__code__.co_varnames)    # its locals

# OUTPUT:
# ('print', 'len')
# ('items',)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Swapping the Code Inside a Live Function</h3>
Because a function merely <i>references</i> its code object, you can change <code>__code__</code> at run time - the function keeps its name, defaults and globals but runs different instructions. (This is how some live-reload and monkey-patching tools work. Use it in tests and tools, rarely in production code.)`,
            codeExamples: [
                `def hello():
    return "hello"

def goodbye():
    return "goodbye"

print(hello())
hello.__code__ = goodbye.__code__
print(hello())
print(hello.__name__)                # the function object kept its own name

# OUTPUT:
# hello
# goodbye
# hello`
            ]
        },
        {
            content: `<h3>Closures: co_freevars and co_cellvars</h3>
A variable shared between an outer and an inner function is stored in a <b>cell</b>. The outer code object lists it in <code>co_cellvars</code>; the inner one lists it in <code>co_freevars</code>. The function object's <code>__closure__</code> holds the actual cells.`,
            codeExamples: [
                `def outer():
    x = 10
    def inner():
        return x
    return inner

inner = outer()

print(outer.__code__.co_cellvars)
print(inner.__code__.co_freevars)
print(inner.__closure__[0].cell_contents)
print(inner.__code__.co_varnames)       # x is NOT a local of inner

# OUTPUT:
# ('x',)
# ('x',)
# 10
# ()`
            ]
        },
        {
            content: `<h3>Flags and Nested Code Objects</h3>
<code>co_flags</code> records properties of the function. And a function body is itself a <b>constant</b> of the code that defines it, so code objects nest.`,
            codeExamples: [
                `import inspect

def gen():
    yield 1

def varargs(*args, **kwargs):
    pass

print(bool(gen.__code__.co_flags & inspect.CO_GENERATOR))
print(bool(varargs.__code__.co_flags & inspect.CO_VARARGS))
print(bool(varargs.__code__.co_flags & inspect.CO_VARKEYWORDS))

module_code = compile("def f():\\n    return 1\\nx = f()\\n", "<string>", "exec")
nested = [c.co_name for c in module_code.co_consts if hasattr(c, "co_code")]
print(nested)

# OUTPUT:
# True
# True
# True
# ['f']`
            ]
        },
        {
            content: `<h3>Building and Modifying Code Objects</h3>
Code objects are immutable, but <code>code.replace(**changes)</code> (3.8+) returns a modified copy, and <code>types.FunctionType</code> turns a code object into a callable. This is the lowest-level way to generate functions dynamically.`,
            codeExamples: [
                `import types

def add(a, b):
    return a + b

new_code = add.__code__.replace(co_name="plus")
plus = types.FunctionType(new_code, globals())

print(plus(2, 3))
print(plus.__name__)

# OUTPUT:
# 5
# plus`
            ]
        },
        {
            content: `<h3>Debugging and Tooling Uses</h3>
<ul>
<li><b>Tracebacks and debuggers</b> use <code>co_filename</code>, <code>co_name</code> and the line table to show where an error happened. In 3.11+, <code>co_positions()</code> gives line <i>and column</i> ranges per instruction, which powers the <code>^^^^</code> markers in modern tracebacks.</li>
<li><b>Coverage tools</b> read <code>co_lines()</code> to learn which lines can execute.</li>
<li><b>Frameworks</b> inspect <code>co_varnames[:co_argcount]</code> (or the nicer <code>inspect.signature</code>) to discover parameter names, as dependency-injection and test frameworks do.</li>
<li><b>Exception handling</b> (3.11+) is stored in <code>co_exceptiontable</code>; the line table in <code>co_linetable</code>.</li>
<li><b>Code objects are hashable and comparable</b>, and <code>marshal</code> can serialize them - exactly what a .pyc file contains.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Compiled once and shared: saves memory and time</td><td>Attribute set differs between Python versions</td></tr>
<tr><td>Immutability makes code objects safe to share and cache</td><td>Editing code objects is advanced and easy to get wrong</td></tr>
<tr><td>Clear separation of code from runtime environment</td><td>Two-level model (code vs function) confuses beginners</td></tr>
<tr><td>Rich co_* metadata supports debuggers and tools</td><td>Not a portable, documented format like Java class files</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Code object vs function object?</td><td>A code object is immutable compiled code; a function object adds globals, defaults, closure and name around it</td></tr>
<tr class='text-center'><td>Where do default argument values live?</td><td>On the function object (<code>__defaults__</code>), not in the code object</td></tr>
<tr class='text-center'><td>What is in <code>co_consts</code>?</td><td>Literal constants and nested code objects (for inner functions and classes)</td></tr>
<tr class='text-center'><td>What are cell variables?</td><td>Variables shared between a function and its inner functions; stored in cells referenced by <code>__closure__</code></td></tr>
<tr class='text-center'><td>How do you change a code object?</td><td>You can't mutate it; use <code>code.replace(...)</code> to get a modified copy</td></tr>
</table>`
        }
    ]
};
