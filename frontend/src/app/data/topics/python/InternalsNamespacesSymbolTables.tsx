import type { Topic } from '../../types';

export const internalsNamespacesSymbolTables: Topic = {
    id: 'python-internals-namespaces-symbol-tables',
    name: 'Namespaces & Symbol Tables',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>namespace</b> maps names to objects, usually through a dictionary: built-ins, module globals, a function's locals, a class's attributes. Before generating bytecode, the compiler builds a <b>symbol table</b> that decides for every name whether it is local, global or a free (closure) variable. At run time a lookup follows the <b>LEGB</b> order: Local, Enclosing, Global, Built-in. Java resolves names at compile time with block scopes; Python decides scope at compile time too, but binds names dynamically.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 629 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:629px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="82.4" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="51.2" y="30.5">Local</tspan><tspan x="51.2" y="45.5">function</tspan></text><line x1="92.4" y1="34" x2="122.4" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="126.4" y="10" width="133.5" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="193.2" y="30.5">Enclosing</tspan><tspan x="193.2" y="45.5">outer functions</tspan></text><line x1="259.9" y1="34" x2="289.9" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="293.9" y="10" width="70" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="328.9" y="30.5">Global</tspan><tspan x="328.9" y="45.5">module</tspan></text><line x1="363.9" y1="34" x2="393.9" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="397.9" y="10" width="97" height="48" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="446.4" y="30.5">Built-in</tspan><tspan x="446.4" y="45.5">len, print</tspan></text><line x1="494.9" y1="34" x2="524.9" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="528.9" y="10" width="89.7" height="48" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="573.8" y="38">NameError</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: LEGB lookup: the first scope that has the name wins</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without this model, errors such as <code>UnboundLocalError</code>, shadowed built-ins and "why can't my inner function change this variable?" feel arbitrary.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Predict which variable a name refers to using the <b>LEGB</b> rule.</li>
<li>Understand <code>global</code> and <code>nonlocal</code> and why they are needed.</li>
<li>Use <code>globals()</code>, <code>vars()</code> and <code>symtable</code> to inspect scopes.</li>
<li>Avoid accidentally shadowing built-ins like <code>list</code> or <code>len</code>.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Scopes decided by the symbol table</h4>
The standard symtable module exposes the compiler's scope decisions; the program also checks the runtime namespaces.`,
            codeExamples: [
                `import builtins
import symtable

SOURCE = """
count = 0

def outer():
    total = 1
    def inner():
        return total + count
    return inner
"""


def find_table(table, name):
    for child in table.get_children():
        if child.get_name() == name:
            return child
    return None


def main():
    module = symtable.symtable(SOURCE, "<demo>", "exec")
    outer = find_table(module, "outer")
    inner = find_table(outer, "inner")

    print(sorted(outer.get_identifiers()))
    print("total local in outer:", outer.lookup("total").is_local())
    print("total free in inner: ", inner.lookup("total").is_free())
    print("count global in inner:", inner.lookup("count").is_global())

    print("len in builtins:", "len" in vars(builtins))
    print("len in globals():", "len" in globals())


if __name__ == "__main__":
    main()

# OUTPUT:
# ['inner', 'total']
# total local in outer: True
# total free in inner:  True
# count global in inner: True
# len in builtins: True
# len in globals(): False`
            ],
            codeExplanations: [
                `symtable parses the source and records, per function, how each name is classified. total is assigned in outer, so it is local there, but inner only reads it, making it a free (enclosing) variable; count is never assigned in either function, so it resolves as a global. The last two lines show that len lives in the built-in namespace, not the module namespace.`
            ]
        },
        {
            content: `<h4>What is a Namespace?</h4>
A <b>namespace</b> is a mapping from <b>names to objects</b> - in practice a dictionary. Python has several, living at different times:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Namespace</th><th>Contains</th><th>Lives</th></tr>
<tr class='text-center'><td><b>Built-in</b></td><td><code>len</code>, <code>print</code>, <code>ValueError</code>...</td><td>Whole program</td></tr>
<tr class='text-center'><td><b>Global (module)</b></td><td>Names defined at the top level of a file</td><td>While the module is loaded</td></tr>
<tr class='text-center'><td><b>Enclosing</b></td><td>Names of an outer function, seen by an inner one</td><td>While the closure exists</td></tr>
<tr class='text-center'><td><b>Local</b></td><td>Parameters and variables of one function call</td><td>That call</td></tr>
<tr class='text-center'><td><b>Class / instance</b></td><td>Class attributes; instance attributes in <code>__dict__</code></td><td>The class / the object</td></tr>
</table>
Lookup order is <b>LEGB</b>: Local, Enclosing, Global, Built-in. The first scope that has the name wins.`
        },
        {
            content: `<h4>Looking at Namespaces</h4>
<code>globals()</code> and <code>locals()</code> return the current namespaces; <code>vars(obj)</code> returns an object's attribute dictionary.`,
            codeExamples: [
                `x = "global"

def show():
    y = "local"
    print("y" in locals(), "x" in locals(), "x" in globals())

show()

class Point:
    def __init__(self):
        self.a = 1
        self.b = 2

print(vars(Point()))

# OUTPUT:
# True False True
# {'a': 1, 'b': 2}`
            ]
        },
        {
            content: `<h4>Built-ins Can Be Shadowed</h4>
The built-in namespace is searched <b>last</b>, so assigning to a built-in's name in your module hides it from that point on - a classic beginner bug.`,
            codeExamples: [
                `import builtins

print(builtins.list is list)

list = [1, 2, 3]                    # shadows the built-in "list"
try:
    list("abc")
except TypeError as error:
    print("TypeError:", error)

del list                            # the built-in becomes visible again
print(list("abc"))

# OUTPUT:
# True
# TypeError: 'list' object is not callable
# ['a', 'b', 'c']`
            ]
        },
        {
            content: `<h4>Class Bodies Are Not Enclosing Scopes</h4>
A method cannot see class-level names without qualifying them: the class body's namespace is skipped when searching enclosing scopes.`,
            codeExamples: [
                `class Counter:
    step = 5

    def next_value(self, current):
        return current + step          # looks in local, global, built-in - not the class

try:
    Counter().next_value(1)
except NameError as error:
    print(error)

# Correct:  return current + self.step   (or Counter.step)

# OUTPUT:
# name 'step' is not defined`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Symbol Tables: Scopes Are Decided at Compile Time</h3>
Before generating bytecode the compiler builds a <b>symbol table</b> for each block, classifying every name: local, global, free (from an enclosing function) or cell (shared with an inner function). The classification follows simple rules - a name that is <i>assigned</i> in a block is local unless declared <code>global</code>/<code>nonlocal</code>. The result decides which instruction is emitted: <code>LOAD_FAST</code> for locals, <code>LOAD_GLOBAL</code> for globals, <code>LOAD_DEREF</code> for closure variables, <code>LOAD_NAME</code> in module and class bodies. The <code>symtable</code> module exposes it.`,
            codeExamples: [
                `import symtable

source = """x = 1
def f(a):
    y = a + x
    return y
"""

table = symtable.symtable(source, "<string>", "exec")
f = table.get_children()[0]

print(table.get_type(), f.get_type(), f.get_name())
for symbol in sorted(f.get_symbols(), key=lambda s: s.get_name()):
    print(symbol.get_name(), symbol.is_parameter(), symbol.is_local(), symbol.is_global())

# OUTPUT:
# module function f
# a True True False
# x False False True
# y False True False`
            ],
            codeExplanations: [
                `Each row is name, is_parameter, is_local, is_global. "a" is a parameter and therefore local. "x" is only read in f and assigned nowhere in it, so it is classified as global (found later in the module namespace). "y" is assigned in f, so it is local. Because the classification is made before the program runs, UnboundLocalError exists: a name assigned anywhere in a function is local for the whole function.`
            ]
        },
        {
            content: `<h3>The Dictionaries Behind the Names</h3>
A module's namespace really is a <code>dict</code>: <code>module.__dict__</code>, which is also what <code>globals()</code> returns. <code>sys.modules</code> is the dictionary of all loaded modules. An <b>object's</b> attributes are in <code>obj.__dict__</code> (unless <code>__slots__</code> is used). <b>Function locals</b> are special: for speed they are kept in a fixed array ("fast locals"), not a dictionary, and <code>locals()</code> builds a snapshot on request.`,
            codeExamples: [
                `import math
import sys

print(math.__dict__["pi"] == math.pi)
print(globals() is sys.modules["__main__"].__dict__)

def f():
    x = 1
    snapshot = locals()
    x = 2
    return snapshot["x"]          # a copy taken earlier, not a live view

def g():
    x = 1
    locals()["x"] = 99            # writing to the snapshot changes nothing
    return x

print(f(), g())

# OUTPUT:
# True
# True
# 1 1`
            ]
        },
        {
            content: `<h3>Name Mangling and Declarations</h3>
<ul>
<li><b><code>global</code> and <code>nonlocal</code></b> are compile-time declarations that change how a name is classified in a function - they are not run-time statements.</li>
<li><b>Private names:</b> inside a class, an identifier of the form <code>__name</code> (two leading underscores, not ending in two) is <b>mangled</b> to <code>_ClassName__name</code> by the compiler, to avoid accidental clashes in subclasses.</li>
<li><b>Comprehensions</b> had their own scope (an implicit function) until Python 3.12, which now inlines them (PEP 709); the loop variable still does not leak out.</li>
</ul>`,
            codeExamples: [
                `class Account:
    def __init__(self):
        self.__balance = 100        # stored as _Account__balance

print(Account().__dict__)

total = 0
def add(n):
    global total                    # compile-time: treat "total" as global
    total += n

add(5)
print(total)

squares = [i * i for i in range(3)]
print("i" in globals())             # the comprehension variable did not leak

# OUTPUT:
# {'_Account__balance': 100}
# 5
# False`
            ]
        },
        {
            content: `<h3>exec, eval and Custom Namespaces</h3>
<code>exec</code> and <code>eval</code> run code in the namespaces you give them, which is how you sandbox (weakly!) or isolate code, and how templates and REPLs work. Remember <code>__builtins__</code> is inserted into the globals dictionary if missing.`,
            codeExamples: [
                `namespace = {"price": 100}

exec("tax = price * 0.18\\ntotal = price + tax", namespace)

print(namespace["total"])
print("tax" in globals())              # nothing leaked into our own module
print("__builtins__" in namespace)

# OUTPUT:
# 118.0
# False
# True`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Simple rule (LEGB) decides every name lookup</td><td>Assigning to a name makes it local for the whole function</td></tr>
<tr><td>Scopes are plain dictionaries you can inspect</td><td>UnboundLocalError surprises beginners</td></tr>
<tr><td>Compile-time classification makes local access fast</td><td>Built-ins can be shadowed silently</td></tr>
<tr><td>Closures and modules fall out of the same mechanism</td><td>Changing outer variables needs global or nonlocal</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does LEGB stand for?</td><td>Local, Enclosing, Global, Built-in - the order in which names are looked up</td></tr>
<tr class='text-center'><td>What is a symbol table?</td><td>Compiler data classifying each name in a block as local, global, free or cell, built before bytecode generation</td></tr>
<tr class='text-center'><td>Why can't a method see a class variable without <code>self.</code>?</td><td>A class body is not an enclosing scope for the functions defined inside it</td></tr>
<tr class='text-center'><td>Does modifying <code>locals()</code> change a local variable?</td><td>No - inside a function it returns a snapshot</td></tr>
<tr class='text-center'><td>What is name mangling?</td><td>The compiler renames <code>__x</code> inside class <code>C</code> to <code>_C__x</code> to avoid accidental overrides</td></tr>
</table>`
        }
    ]
};
