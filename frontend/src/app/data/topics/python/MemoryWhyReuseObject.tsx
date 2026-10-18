import type { Topic } from '../../types';

export const memoryWhyReuseObject: Topic = {
    id: 'python-memory-why-does-python-sometimes-reuse-the-same-object',
    name: 'Why Does Python Sometimes Reuse the Same Object?',
    beginner: [
        {
            content: `<h4>Introduction</h4>
"Why does Python sometimes reuse the same object?" The honest answer has several parts. CPython shares <b>immutable</b> values that are used everywhere (small integers, <code>None</code>, interned strings), the compiler merges equal constants, some functions return their argument unchanged when copying is pointless (<code>tuple(t)</code>, <code>str(s)</code>), and freed memory is recycled for new objects. Java learners will recognise the <b>Integer cache</b> and the <b>String pool</b>. Reuse is a performance optimisation, never a promise.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 507 168" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:507px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="228.4" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="124.2" y="27">May be reused</tspan></text><rect x="10" y="44" width="228.4" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="124.2" y="62.5">small ints, None, True</tspan></text><rect x="10" y="79" width="228.4" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="124.2" y="97.5">interned strings, ()</tspan></text><rect x="10" y="114" width="228.4" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="124.2" y="132.5">tuple(t) and str(s)</tspan><tspan x="124.2" y="147.5">return the same object</tspan></text><rect x="268.4" y="10" width="228.4" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="382.6" y="27">Never reused</tspan></text><rect x="268.4" y="44" width="228.4" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="382.6" y="62.5">lists, dicts, sets</tspan><tspan x="382.6" y="77.5">(mutable)</tspan></text><rect x="268.4" y="94" width="228.4" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="382.6" y="112.5">large ints built at run time</tspan></text><rect x="268.4" y="129" width="228.4" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="382.6" y="147.5">list(l) always makes a copy</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: sharing is only safe for immutable values</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> The same-looking code gives <code>True</code> for one pair of values and <code>False</code> for another, which makes <code>is</code> seem random and unreliable.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Give a <b>complete interview answer</b> instead of "small integers are cached".</li>
<li>Know which objects are safe to share (immutable) and which never are (mutable).</li>
<li>Learn why <code>is</code> is for identity (<code>None</code>) and <code>==</code> is for values.</li>
<li>Avoid writing code that depends on CPython implementation details.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Reuse and non-reuse side by side (CPython 3.12)</h4>
Every value is created at run time so the results do not come from compile-time constants. Results are CPython-specific.`,
            codeExamples: [
                `def make_int(text):
    return int(text)


def report(label, value):
    print(label, "->", value)


def main():
    small = make_int("100")
    report("small int cached", small is make_int("100"))

    big = make_int("1000")
    report("big int cached", big is make_int("1000"))

    numbers = tuple([1, 2, 3])
    report("tuple(t) is t", tuple(numbers) is numbers)

    text = "".join(["a", "b", "c"])
    report("str(s) is s", str(text) is text)

    items = [1, 2, 3]
    report("list(l) is l", list(items) is items)
    report("list(l) == l", list(items) == items)


if __name__ == "__main__":
    main()

# OUTPUT:
# small int cached -> True
# big int cached -> False
# tuple(t) is t -> True
# str(s) is s -> True
# list(l) is l -> False
# list(l) == l -> True`
            ],
            codeExplanations: [
                `100 lies in the small-integer cache, 1000 does not. Passing an exact tuple or str to tuple() or str() returns the very same object because copying an immutable value is pointless, but list() must copy since lists are mutable. Every pair is equal in value; only identity differs. The takeaway: use == for values and is only for None.`
            ]
        },
        {
            content: `<h4>The Interview Question</h4>
<blockquote>"Why does Python sometimes reuse the same object?"</blockquote>
This is a classic expert-level question because the honest answer has <b>several parts</b>. Python reuses objects for performance and memory reasons, but <i>only in specific situations</i> and only where it is safe. A complete answer names the situations, explains why it is safe, and warns that you must not depend on it.`
        },
        {
            content: `<h4>The Surprise</h4>
The same-looking code can behave differently depending on the type and on how the values were created:`,
            codeExamples: [
                `a = int("100")
b = int("100")
print(a is b)             # True: 100 is in the small-integer cache

x = int("1000")
y = int("1000")
print(x is y)             # False: created separately

s1 = "hello"
s2 = "hello"
print(s1 is s2)           # True: identifier-like constant, interned

l1 = [1, 2]
l2 = [1, 2]
print(l1 is l2)           # False: mutable objects are never shared

# OUTPUT:
# True
# False
# True
# False`
            ]
        },
        {
            content: `<h4>The Short Answer</h4>
<ol>
<li><b>Immutable values are safe to share</b>, so CPython caches the common ones: small integers (-5 to 256), <code>None</code>/<code>True</code>/<code>False</code>, the empty tuple, single characters.</li>
<li><b>Strings are interned</b>: identifier-like strings in source code (and names) are stored once.</li>
<li><b>The compiler merges equal constants</b> within the same code object.</li>
<li><b>Freed memory is recycled</b>, so a new object can receive the same address (<code>id</code>) as an old, dead one.</li>
<li><b>Some functions return the argument itself</b> when copying would be pointless (<code>tuple(t)</code>, <code>str(s)</code>).</li>
</ol>
Mutable objects (lists, dicts, sets) are <b>never</b> shared automatically, because modifying one would change every user.`
        }
    ],

    expert: [
        {
            content: `<h3>Reason 1: Immutable Singletons and Caches</h3>
Covered in detail in the previous topic: the small-int cache, the singleton constants and interned strings. In Python 3.12+ these are also <b>immortal</b>, so even their reference counts never change.`
        },
        {
            content: `<h3>Reason 2: The Same Address Is Reused After an Object Dies</h3>
<code>id()</code> returns an address, and an address is only unique <b>among objects alive at the same time</b>. Once an object is freed its memory can be handed to the next object of that size - often immediately. This produces the confusing result below: two different lists seem to have the same identity.`,
            codeExamples: [
                `# The first list is freed as soon as id() returns, before the second one is made.
print(id([1, 2]) == id([3, 4]))

# Keep both alive at once and the identities must differ.
first = [1, 2]
second = [3, 4]
print(id(first) == id(second))

# OUTPUT (CPython; the first line is typically True but is not guaranteed):
# True
# False`
            ],
            codeExplanations: [
                `In the first line the temporary list [1, 2] is destroyed right after id() is evaluated, so its memory (via a free list) is the natural place for [3, 4]. In the second case both lists exist together and cannot share an address. Moral: never compare id() values of objects that are not both alive.`
            ]
        },
        {
            content: `<h3>Reason 3: Copy Operations That Return the Original</h3>
For immutable objects a "copy" would be indistinguishable from the original, so CPython returns the original and saves the allocation. Mutable objects always get a real copy.`,
            codeExamples: [
                `t = (1, 2, 3)
print(tuple(t) is t)       # immutable: no copy needed
print(t[:] is t)           # full slice of a tuple returns the same tuple

s = "abc"
print(str(s) is s)

l = [1, 2, 3]
print(list(l) is l)        # mutable: a real copy is required
print(l[:] is l)

# OUTPUT:
# True
# True
# True
# False
# False`
            ]
        },
        {
            content: `<h3>Reason 4: Constant Folding and Merging</h3>
The compiler evaluates constant expressions ahead of time and stores each distinct constant once per code object. You can see them in <code>co_consts</code>.`,
            codeExamples: [
                `def f():
    a = 1000
    b = 1000          # same constant, stored once
    c = 2 * 500       # folded at compile time into 1000
    return a is b, a is c

print(f())
print(f.__code__.co_consts)

# OUTPUT (CPython 3.12; the constants tuple differs a little between versions):
# (True, True)
# (None, 1000)`
            ]
        },
        {
            content: `<h3>How to Write Correct Code Regardless</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Do</th><th>Don't</th></tr>
<tr class='text-center'><td>Compare values with <code>==</code></td><td>Use <code>is</code> on numbers, strings or tuples</td></tr>
<tr class='text-center'><td>Use <code>is None</code> / <code>is not None</code></td><td>Write <code>== None</code></td></tr>
<tr class='text-center'><td>Treat <code>id()</code> as meaningful only while the object lives</td><td>Store ids to "remember" objects (use weak references or the objects)</td></tr>
<tr class='text-center'><td>Copy mutable objects explicitly (<code>list(x)</code>, <code>copy.deepcopy</code>)</td><td>Assume assignment copies</td></tr>
<tr class='text-center'><td>Assume nothing about caching</td><td>Depend on -5..256 or on interning in program logic</td></tr>
</table>
Different implementations make different choices: PyPy compares small ints by value and has no -5..256 rule at all, so code that relies on CPython's caching is not portable.`
        },
        {
            content: `<h3>A Model Interview Answer</h3>
<blockquote>
"Python reuses objects when it is both safe and cheap. Immutable values such as small integers, None, True/False, the empty tuple and identifier-like strings are cached or interned in CPython, so all uses share one object. The compiler also merges equal constants within a code object, and operations like <code>tuple(t)</code> return the original because a copy would be identical. Separately, CPython recycles memory, so a new object can get the address of a freed one, which makes <code>id()</code> look equal for unrelated objects. None of this is guaranteed by the language, so I compare values with <code>==</code> and use <code>is</code> only for singletons like None."
</blockquote>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Less memory used for common immutable values</td><td>Reuse rules vary by type, version and implementation</td></tr>
<tr><td>Fewer allocations make programs faster</td><td>Tempts developers to misuse <code>is</code> for equality</td></tr>
<tr><td>Identity test <code>is None</code> is cheap and reliable</td><td>Results differ between a script, the REPL and PyPy</td></tr>
<tr><td>Immutability makes sharing safe in every thread</td><td>Recycled addresses make <code>id()</code> comparisons confusing</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why do two equal small ints share an object?</td><td>CPython pre-creates -5..256 and reuses them; safe because ints are immutable</td></tr>
<tr class='text-center'><td>Why can <code>id([1]) == id([2])</code> be True?</td><td>The first list is freed before the second is created, so the address is reused</td></tr>
<tr class='text-center'><td>Why does <code>tuple(t) is t</code> hold but <code>list(l) is l</code> not?</td><td>Immutable objects need no copy; mutable ones must be duplicated</td></tr>
<tr class='text-center'><td>Is this behaviour part of the Python language?</td><td>No, it is a CPython implementation detail that may differ or change</td></tr>
<tr class='text-center'><td>When is <code>is</code> the right operator?</td><td>For singletons (<code>None</code>, <code>True</code>, <code>False</code>) and genuine identity tests</td></tr>
</table>`
        }
    ]
};
