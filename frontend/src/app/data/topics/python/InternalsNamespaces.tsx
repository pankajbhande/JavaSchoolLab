import type { Topic } from '../../types';

export const internalsNamespaces: Topic = {
    id: 'python-internals-namespaces-symbol-tables',
    name: 'Namespaces & Symbol Tables',
    beginner: [
        {
            content: `<h4>Namespaces Are Mappings of Names to Objects</h4>
A <b>namespace</b> maps names to objects. Python has several, and most are ordinary dictionaries you can inspect:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Namespace</th><th>Lives in</th><th>Created</th></tr>
<tr class='text-center'><td>Built-in</td><td>The <code>builtins</code> module</td><td>At interpreter start-up</td></tr>
<tr class='text-center'><td>Global (module)</td><td>The module's <code>__dict__</code> - <code>globals()</code></td><td>When the module is first imported</td></tr>
<tr class='text-center'><td>Local</td><td>The function's frame - <code>locals()</code></td><td>On each call</td></tr>
<tr class='text-center'><td>Class</td><td>The class's <code>__dict__</code></td><td>When the class statement runs</td></tr>
<tr class='text-center'><td>Instance</td><td>The object's <code>__dict__</code></td><td>When the object is created</td></tr>
</table>`,
            codeExamples: [
                `import sys
import builtins

app_name = "JavaSchoolLab"

module = sys.modules[__name__]
print(globals() is module.__dict__)
print(globals()["app_name"])

print("len" in globals(), "len" in vars(builtins))
print(builtins.len is len)

# OUTPUT:
# True
# JavaSchoolLab
# False True
# True`
            ]
        },
        {
            content: `<h4>LEGB at the Implementation Level</h4>
The LEGB rule (Local, Enclosing, Global, Built-in) maps directly onto these structures:<br>
• <b>Local</b> - a fixed-size array in the frame, read by index (<code>LOAD_FAST</code>).<br>
• <b>Enclosing</b> - <b>cell</b> objects shared with the outer function (<code>LOAD_DEREF</code>).<br>
• <b>Global</b> - the module's dictionary, then<br>
• <b>Built-in</b> - the <code>builtins</code> dictionary (both via <code>LOAD_GLOBAL</code>).<br><br>
The compiler picks the right instruction for each name when it compiles the function.`
        },
        {
            content: `<h4>Each Object Has Its Own Namespace</h4>
Attribute lookups (<code>obj.attr</code>) search the instance's <code>__dict__</code>, then its class's, then the base classes'.`,
            codeExamples: [
                `class Course:
    platform = "JavaSchoolLab"           # class namespace

    def __init__(self, title):
        self.title = title                # instance namespace

c = Course("Python")
print(c.__dict__)
print("platform" in Course.__dict__, "platform" in c.__dict__)
print(c.platform)                         # found in the class

# OUTPUT:
# {'title': 'Python'}
# True False
# JavaSchoolLab`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Symbol Tables: How the Compiler Decides Scope</h3>
Before generating bytecode, the compiler builds a <b>symbol table</b> for each scope, classifying every name as local, global, free (from an enclosing function) or cell. The <code>symtable</code> module exposes this analysis.`,
            codeExamples: [
                `import symtable

source = """
total = 0
def outer():
    factor = 2
    def inner(x):
        return x * factor + total
    return inner
"""

module_table = symtable.symtable(source, "<demo>", "exec")
outer = module_table.get_children()[0]
inner = outer.get_children()[0]

for name in sorted(inner.get_identifiers()):
    sym = inner.lookup(name)
    print(name, "local" if sym.is_local() else "",
          "global" if sym.is_global() else "",
          "free" if sym.is_free() else "")

# OUTPUT:
# factor   free
# total  global
# x local`
            ]
        },
        {
            content: `<h3>Why UnboundLocalError Exists</h3>
Scope is decided per function at <b>compile time</b>, from the symbol table. If a name is assigned anywhere in a function, the symbol table marks it local for the <b>whole</b> function, so reading it before the assignment fails - even if a global of the same name exists. The symbol table shows the decision directly.`,
            codeExamples: [
                `import symtable

source = """
count = 0
def increment():
    print(count)
    count = count + 1
"""

table = symtable.symtable(source, "<demo>", "exec")
func = table.get_children()[0]
sym = func.lookup("count")
print(sym.is_local(), sym.is_global())

# OUTPUT:
# True False
# -> so running increment() raises
# UnboundLocalError: cannot access local variable 'count' where it is not associated with a value`
            ]
        },
        {
            content: `<h3>locals() Is a Snapshot in Functions</h3>
Inside a function, locals are stored in the frame's array, not a dictionary. <code>locals()</code> builds a dictionary view of them; writing to it does not create or change real local variables. At module level <code>locals()</code> and <code>globals()</code> are the same dictionary, so writes there do take effect - but code that relies on it is hard to read and should be avoided. (Python 3.13 formalised these semantics in PEP 667.)`,
            codeExamples: [
                `def f():
    x = 1
    locals()["x"] = 99          # changes the snapshot, not the variable
    return x

print(f())
print(locals() is globals())    # at module level

# OUTPUT:
# 1
# True`
            ]
        },
        {
            content: `<h3>Namespaces in Java Terms</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Python</th><th>Closest Java concept</th></tr>
<tr class='text-center'><td>Module namespace</td><td>Static members of a class / a package's top-level names</td></tr>
<tr class='text-center'><td>Built-in namespace</td><td><code>java.lang</code> (imported automatically)</td></tr>
<tr class='text-center'><td>Local namespace</td><td>Local variables in a stack frame</td></tr>
<tr class='text-center'><td>Instance <code>__dict__</code></td><td>Object fields - but a fixed layout in Java, an open dictionary in Python</td></tr>
</table>
The big difference: Python namespaces are runtime objects you can inspect and even modify, while Java resolves names at compile time.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a namespace?</td><td>A mapping from names to objects - built-in, global (module), local, class and instance namespaces</td></tr>
<tr class='text-center'><td>What does globals() return?</td><td>The current module's __dict__</td></tr>
<tr class='text-center'><td>Where do built-in names like len live?</td><td>In the builtins module, searched last in LEGB</td></tr>
<tr class='text-center'><td>When is a variable's scope decided?</td><td>At compile time, by the symbol table built for each scope</td></tr>
<tr class='text-center'><td>What does the symtable module show?</td><td>How the compiler classified each name in each scope: local, global, free, cell</td></tr>
<tr class='text-center'><td>Does writing to locals() inside a function change variables?</td><td>No - inside functions it is a snapshot; real locals live in the frame's array</td></tr>
</table>`
        }
    ]
};
