import type { Topic } from '../../types';

export const memoryCachingInterning: Topic = {
    id: 'python-memory-object-caching-interning',
    name: 'Object Caching & Interning',
    beginner: [
        {
            content: `<h4>Sharing Immutable Objects</h4>
Because immutable objects can never change, CPython can safely hand out the <b>same object</b> to everyone who needs an equal value. It does this for several kinds of objects to save memory and time:<br><br>
• small integers from <b>-5 to 256</b>,<br>
• many strings (<b>interning</b>),<br>
• equal constants inside one compiled code object,<br>
• singletons such as <code>None</code>, <code>True</code>, <code>False</code>, <code>...</code> and the empty tuple.`
        },
        {
            content: `<h4>The Small Integer Cache</h4>
Integers from -5 to 256 are created once when the interpreter starts and reused everywhere. <code>int("...")</code> is used below so the values are created at runtime rather than folded by the compiler.`,
            codeExamples: [
                `a = int("256")
b = int("256")
print(a is b)              # cached

c = int("257")
d = int("257")
print(c is d)              # two separate objects
print(c == d)

print(int("-5") is int("-5"), int("-6") is int("-6"))

# OUTPUT:
# True
# False
# True
# True False`
            ]
        },
        {
            content: `<h4>String Interning</h4>
Interned strings exist only once in memory. CPython automatically interns identifier-like string constants in your code (names of variables, functions and attributes, and literals made of letters, digits and underscores). <code>sys.intern()</code> interns any string explicitly.`,
            codeExamples: [
                `import sys

a = "hello_world"
b = "".join(["hello", "_world"])     # built at runtime
print(a == b, a is b)

b = sys.intern(b)
print(a is b)

# OUTPUT:
# True False
# True`
            ]
        },
        {
            content: `<h4>Singletons</h4>
<code>None</code>, <code>True</code>, <code>False</code> and <code>Ellipsis</code> exist exactly once - this is a language guarantee, which is why <code>x is None</code> is the correct test.`,
            codeExamples: [
                `print(type(None)() is None)
print(bool(1) is True)
print(tuple() is tuple())            # the empty tuple is shared in CPython

# OUTPUT:
# True
# True
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Constant Merging Inside a Code Object</h3>
When Python compiles a module or function, equal immutable constants in the same code object are stored once. Two equal string literals in one script can therefore be the same object even if they aren't identifier-like - but typed on separate lines in the interactive REPL they are compiled separately.`,
            codeExamples: [
                `def f():
    a = "hello world!"
    b = "hello world!"
    return a is b

print(f())
print(f.__code__.co_consts)

# OUTPUT (CPython 3.12):
# True
# (None, 'hello world!')`
            ]
        },
        {
            content: `<h3>Why Interning Helps</h3>
• <b>Memory</b> - one copy of strings that repeat millions of times (e.g. column names or tags read from a file).<br>
• <b>Speed</b> - dictionary lookups on attribute and variable names can compare interned strings by identity first, which is very fast.<br>
• Java does the same with its <b>string pool</b> (<code>String.intern()</code>) and caches <code>Integer</code> values from -128 to 127.`,
            codeExamples: [
                `import sys

rows = ["status_ok", "status_ok", "status_fail"] * 3
tags = [sys.intern("".join(["status_", r.split("_")[1]])) for r in rows]
print(len(tags), len({id(t) for t in tags}))     # 9 strings, only 2 objects

# OUTPUT:
# 9 2`
            ]
        },
        {
            content: `<h3>Why "is" with a Literal Warns</h3>
Because caching is an implementation detail, comparing with <code>is</code> against a literal may work for some values and fail for others. Since Python 3.8 the compiler warns about it.`,
            codeExamples: [
                `x = int("1000")
print(x is 1000)

# OUTPUT:
# SyntaxWarning: "is" with 'int' literal. Did you mean "=="?
# False`
            ]
        },
        {
            content: `<h3>Implementation Detail vs Guarantee</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Behaviour</th><th>Guaranteed by the language?</th></tr>
<tr class='text-center'><td><code>None</code>, <code>True</code>, <code>False</code>, <code>...</code> are singletons</td><td>Yes</td></tr>
<tr class='text-center'><td>Small ints -5..256 are cached</td><td>No - CPython detail</td></tr>
<tr class='text-center'><td>Identifier-like strings are interned</td><td>No - CPython detail</td></tr>
<tr class='text-center'><td>Equal constants share one object</td><td>No - compiler detail</td></tr>
<tr class='text-center'><td>Empty tuple is shared</td><td>No - CPython detail</td></tr>
</table>
Rule: use <code>is</code> only for singletons (and sentinel objects you created); use <code>==</code> for values.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which integers does CPython cache?</td><td>-5 through 256</td></tr>
<tr class='text-center'><td>What is string interning?</td><td>Keeping one shared copy of equal strings; automatic for identifier-like constants, explicit via sys.intern</td></tr>
<tr class='text-center'><td>Why can caching be done safely?</td><td>The cached objects are immutable, so sharing can never cause surprising changes</td></tr>
<tr class='text-center'><td>Why does <code>x is 1000</code> produce a warning?</td><td>Identity of equal values isn't guaranteed; Python 3.8+ warns that you probably meant ==</td></tr>
<tr class='text-center'><td>Java equivalents?</td><td>The String pool / String.intern() and the Integer cache (-128 to 127)</td></tr>
</table>`
        }
    ]
};
