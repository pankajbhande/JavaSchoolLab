import type { Topic } from '../../types';

export const memoryObjectCachingInterning: Topic = {
    id: 'python-memory-object-caching-interning',
    name: 'Object Caching & Interning',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Creating a new object costs time and memory, so CPython <b>creates one and shares it</b> for values used everywhere. Sharing is safe only because these objects are <b>immutable</b>. The main cases are the <b>small-integer cache</b> (-5 to 256), the singletons <code>None</code>, <code>True</code>, <code>False</code> and the empty tuple, and <b>string interning</b> (<code>sys.intern</code>). Java has the same ideas: the <b>Integer cache</b> (-128 to 127) and the <b>String pool</b> with <code>String.intern()</code>. In both languages these are implementation details, so always compare values with <code>==</code>, not <code>is</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 357 199" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:357px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="336.6" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="178.3" y="29.5">Small ints -5..256: one shared object each</tspan></text><rect x="10" y="47" width="336.6" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="178.3" y="66.5">None, True, False, (): single instances</tspan></text><rect x="10" y="84" width="336.6" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="178.3" y="103.5">Interned strings: one copy per text</tspan></text><rect x="10" y="121" width="336.6" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="178.3" y="140.5">Everything else: new object each time</tspan></text><rect x="10" y="158" width="336.6" height="31" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="178.3" y="177.5">Lists, dicts, sets: never shared</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: what CPython shares automatically (an implementation detail)</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Programs that use the same small numbers and names millions of times would waste memory and time allocating identical objects again and again.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Save memory and allocation time for very common immutable values.</li>
<li>Make identity checks cheap: <code>x is None</code> is always correct.</li>
<li>Make dictionary key lookups faster with interned strings.</li>
<li>Avoid the bug of using <code>is</code> where <code>==</code> is meant.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Which values are shared (CPython 3.12)</h4>
Values are built at run time (with <code>int()</code> and <code>join()</code>) so compile-time constant merging does not hide the caches. The results are CPython-specific.`,
            codeExamples: [
                `import sys


def make_int(text):
    return int(text)


def make_text(parts):
    return "".join(parts)


def main():
    print("int 256 shared:", make_int("256") is make_int("256"))
    print("int 257 shared:", make_int("257") is make_int("257"))
    print("int 257 equal:", make_int("257") == make_int("257"))
    print("None shared:", None is None)
    print("empty tuple shared:", tuple() is tuple())
    print("two lists shared:", [] is [])

    first = make_text(["py", "thon"])
    second = make_text(["py", "thon"])
    print("runtime strings shared:", first is second)

    first = sys.intern(first)
    second = sys.intern(second)
    print("after intern shared:", first is second)


if __name__ == "__main__":
    main()

# OUTPUT:
# int 256 shared: True
# int 257 shared: False
# int 257 equal: True
# None shared: True
# empty tuple shared: True
# two lists shared: False
# runtime strings shared: False
# after intern shared: True`
            ],
            codeExplanations: [
                `256 is inside the small-integer cache so both calls return one object; 257 is outside, so two distinct but equal objects are created ("is" False, "==" True). None and the empty tuple are single instances; lists are mutable and never shared. Strings built at run time are separate objects until sys.intern() maps both to one stored copy.`
            ]
        },
        {
            content: `<h4>Sharing Instead of Copying</h4>
Creating a fresh object costs time and memory. For values that are used constantly, CPython <b>creates one object and shares it</b>. Because the shared objects are <b>immutable</b>, sharing is safe: nobody can change the value behind your back. Two mechanisms matter: the <b>small-integer cache</b> and <b>string interning</b>. Both are <b>CPython implementation details</b>, not language guarantees.`
        },
        {
            content: `<h4>The Small-Integer Cache</h4>
CPython pre-creates the integers from <b>-5 to 256</b>. Every use of those values refers to the same object. Larger integers are created fresh each time they are computed.`,
            codeExamples: [
                `a = int("256")
b = int("256")
print(a is b)              # inside the cache: one shared object

c = int("257")
d = int("257")
print(c is d)              # outside the cache: two separate objects
print(c == d)              # but equal in value

# OUTPUT:
# True
# False
# True`
            ],
            codeExplanations: [
                `int("256") is used instead of a plain literal so the numbers are created at run time. (Two literals of the same value in one block of code share a single constant object, which hides the cache.) is compares identity, == compares value, and the output shows they can differ for equal numbers.`
            ]
        },
        {
            content: `<h4>Singletons: None, True and False</h4>
There is exactly one <code>None</code>, one <code>True</code> and one <code>False</code> in a program. That is why <code>x is None</code> is the correct test and always safe. The empty tuple is also a single shared object.`,
            codeExamples: [
                `x = None
y = None
print(x is y)

a = tuple()
b = tuple()
print(a is b)

l1 = []
l2 = []
print(l1 is l2)            # mutable objects are never shared

# OUTPUT:
# True
# True
# False`
            ]
        },
        {
            content: `<h4>String Interning</h4>
<b>Interning</b> stores one copy of a string and reuses it. CPython automatically interns strings that look like identifiers (letters, digits, underscore) when they appear in source code. Strings built at run time are usually <b>not</b> interned, even if equal.`,
            codeExamples: [
                `import sys

a = "".join(["py", "thon"])        # built at run time
b = "".join(["py", "thon"])
print(a == b, a is b)

a = sys.intern(a)                  # explicitly intern both
b = sys.intern(b)
print(a is b)

# OUTPUT:
# True False
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why Interning Exists</h3>
Python looks names up in dictionaries constantly: every attribute access, global, and keyword argument is a string key. If equal keys are the <b>same object</b>, a dictionary can first compare pointers (one machine instruction) before falling back to comparing characters, and the hash is already cached. Interning therefore speeds up attribute lookup and saves memory for the many identical names in a program.`
        },
        {
            content: `<h3>Compile-Time Merging of Constants</h3>
The compiler merges identical constants within one code object, so two equal literals in the same function or module often <b>are</b> the same object - even outside the small-int range. This is why the outcome of <code>is</code> on literals depends on <i>how and where</i> the code was compiled. It is also why Python 3.8+ emits a <code>SyntaxWarning</code> for <code>x is 256</code> or <code>x is "text"</code>.`,
            codeExamples: [
                `def same(a, b):
    return a is b

print(same(int("1000"), int("1000")))   # created at run time: two objects
print(same(1000, 1000))                 # two literals in one code object: merged

# OUTPUT (CPython):
# False
# True`
            ]
        },
        {
            content: `<h3>What Else Is Cached or Reused?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Object</th><th>Behaviour in CPython</th></tr>
<tr class='text-center'><td>Integers -5 to 256</td><td>Pre-created singletons</td></tr>
<tr class='text-center'><td><code>None</code>, <code>True</code>, <code>False</code>, <code>Ellipsis</code>, <code>NotImplemented</code></td><td>Language-level singletons</td></tr>
<tr class='text-center'><td>Empty tuple, empty string, single Latin-1 characters</td><td>Shared singletons</td></tr>
<tr class='text-center'><td>Identifier-like string constants, attribute and variable names</td><td>Interned automatically</td></tr>
<tr class='text-center'><td>Floats, lists, dicts, sets, instances</td><td>Never cached by value (but recycled through internal free lists)</td></tr>
<tr class='text-center'><td>Immortal objects (3.12+)</td><td>The above singletons never change their reference count</td></tr>
</table>`
        },
        {
            content: `<h3>Using sys.intern Deliberately</h3>
When a program holds <b>millions of repeated strings</b> (log levels, country codes, column names parsed from a file) interning them can cut memory and make equality checks cheaper. Interned strings are tracked in an internal table (and, since 3.12, freed when no longer used, unless they are immortal). Only intern values that really repeat - interning unique data wastes time.`,
            codeExamples: [
                `import sys

raw = ["IN", "US", "IN", "UK", "IN", "US"] * 1000
parsed = ["".join(list(code)) for code in raw]       # equal strings, separate objects

print(len({id(s) for s in parsed}) > 3)              # many distinct objects

interned = [sys.intern(s) for s in parsed]
print(len({id(s) for s in interned}))                # one object per distinct value

# OUTPUT:
# True
# 3`
            ]
        },
        {
            content: `<h3>Explicit Caching Is Different</h3>
Interning and the small-int cache are automatic and invisible. For <b>your own</b> expensive results use explicit caching - <code>functools.lru_cache</code> / <code>functools.cache</code> - which returns the same <i>result object</i> for repeated arguments.`,
            codeExamples: [
                `from functools import lru_cache

@lru_cache(maxsize=None)
def build_table(n):
    print("building")
    return tuple(range(n))

a = build_table(5)
b = build_table(5)
print(a is b)
print(build_table.cache_info().hits)

# OUTPUT:
# building
# True
# 1`
            ]
        },
        {
            content: `<h3>Rules to Remember</h3>
<ul>
<li><b>Never use <code>is</code> to compare numbers or strings.</b> Use <code>==</code>. Use <code>is</code> only for singletons: <code>None</code>, <code>True</code>, <code>False</code> and for real identity checks.</li>
<li>The range -5..256 is an <b>implementation detail</b> that has changed before and may change again; PyPy, Jython and others behave differently.</li>
<li>Caching works only for <b>immutable</b> values. Mutable objects are never shared automatically.</li>
<li>Don't use interning for security-sensitive comparisons or to "optimize" without measuring.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Saves memory for frequently used values</td><td>Behaviour is an implementation detail and may change between versions</td></tr>
<tr><td>Avoids repeated allocation: faster programs</td><td>Makes <code>is</code> look like it works for values, causing hidden bugs</td></tr>
<tr><td>Safe because the shared objects are immutable</td><td>Interning costs a dictionary lookup per call</td></tr>
<tr><td><code>sys.intern</code> speeds up comparing many repeated strings</td><td>Interned strings may stay in memory longer than needed</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which integers are cached in CPython?</td><td>-5 to 256 inclusive</td></tr>
<tr class='text-center'><td>What is string interning?</td><td>Keeping a single shared copy of equal strings so they can be compared by identity and take less memory</td></tr>
<tr class='text-center'><td>How do you intern a string manually?</td><td><code>sys.intern(s)</code></td></tr>
<tr class='text-center'><td>Why is <code>x is 1000</code> unreliable?</td><td>Whether two equal numbers are the same object depends on caching and compilation, not on the language rules</td></tr>
<tr class='text-center'><td>Why is it safe to share cached objects?</td><td>They are immutable, so no one can modify them</td></tr>
</table>`
        }
    ]
};
