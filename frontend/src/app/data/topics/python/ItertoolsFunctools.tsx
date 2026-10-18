import type { Topic } from '../../types';

export const itertoolsFunctools: Topic = {
    id: 'python-modules-packages-itertools-functools',
    name: 'itertools & functools',
    beginner: [
        {
            content: `<h4>Two Toolboxes</h4>
• <code>itertools</code> - fast, memory-efficient building blocks for <b>looping</b>: infinite counters, combinations, grouping, slicing iterators.<br>
• <code>functools</code> - tools for working with <b>functions</b>: caching, pre-filling arguments, reducing, generating comparison methods.<br><br>
Every <code>itertools</code> function returns a lazy iterator, so the examples wrap results in <code>list()</code> to show them.`
        },
        {
            content: `<h4>Infinite Iterators: count, cycle, repeat</h4>
These never stop on their own. Always limit them - with <code>islice</code>, <code>zip</code> with a finite iterable, or a <code>break</code>.`,
            codeExamples: [
                `from itertools import count, cycle, repeat, islice

print(list(islice(count(10, 5), 4)))       # 10, 15, 20, ...
print(list(islice(cycle("AB"), 5)))        # A, B, A, B, ...
print(list(repeat("x", 3)))                # repeat can also be finite
print(list(zip(["r1", "r2", "r3"], cycle(["odd", "even"]))))

# OUTPUT:
# [10, 15, 20, 25]
# ['A', 'B', 'A', 'B', 'A']
# ['x', 'x', 'x']
# [('r1', 'odd'), ('r2', 'even'), ('r3', 'odd')]`
            ]
        },
        {
            content: `<h4>Slicing and Joining Iterators: islice, chain</h4>
Iterators can't be sliced with <code>[a:b]</code>; <code>islice(it, start, stop, step)</code> does it lazily. <code>chain</code> walks several iterables one after another.`,
            codeExamples: [
                `from itertools import islice, chain

print(list(islice(range(100), 2, 10, 3)))
print(list(chain([1, 2], "ab", (3,))))
print(list(chain.from_iterable([[1, 2], [3], [4, 5]])))   # flatten one level

# OUTPUT:
# [2, 5, 8]
# [1, 2, 'a', 'b', 3]
# [1, 2, 3, 4, 5]`
            ]
        },
        {
            content: `<h4>Combinatorics</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Order matters?</th><th>Repeats allowed?</th></tr>
<tr class='text-center'><td><code>product(it, repeat=n)</code></td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td><code>permutations(it, r)</code></td><td>Yes</td><td>No</td></tr>
<tr class='text-center'><td><code>combinations(it, r)</code></td><td>No</td><td>No</td></tr>
<tr class='text-center'><td><code>combinations_with_replacement(it, r)</code></td><td>No</td><td>Yes</td></tr>
</table>`,
            codeExamples: [
                `from itertools import product, permutations, combinations, combinations_with_replacement

join = lambda tuples: ["".join(t) for t in tuples]

print(join(product("ab", repeat=2)))
print(join(permutations("abc", 2)))
print(join(combinations("abc", 2)))
print(join(combinations_with_replacement("abc", 2)))

# OUTPUT:
# ['aa', 'ab', 'ba', 'bb']
# ['ab', 'ac', 'ba', 'bc', 'ca', 'cb']
# ['ab', 'ac', 'bc']
# ['aa', 'ab', 'ac', 'bb', 'bc', 'cc']`
            ]
        },
        {
            content: `<h4>groupby, accumulate, takewhile, dropwhile, batched</h4>`,
            codeExamples: [
                `import operator
from itertools import groupby, accumulate, takewhile, dropwhile, batched

# groupby groups CONSECUTIVE equal keys - here: run-length encoding
print([(ch, len(list(g))) for ch, g in groupby("aaabccdd")])

print(list(accumulate([1, 2, 3, 4], operator.mul)))      # running product

print(list(takewhile(lambda x: x < 5, [1, 3, 6, 2])))    # stop at the first failure
print(list(dropwhile(lambda x: x < 5, [1, 3, 6, 2])))    # skip until the first failure

print(list(batched("ABCDEFG", 3)))                        # Python 3.12+

# OUTPUT:
# [('a', 3), ('b', 1), ('c', 2), ('d', 2)]
# [1, 2, 6, 24]
# [1, 3]
# [6, 2]
# [('A', 'B', 'C'), ('D', 'E', 'F'), ('G',)]`
            ]
        },
        {
            content: `<h4>functools: reduce, partial, cache</h4>
<code>reduce</code> and <code>partial</code> were covered in the Functions module; <code>lru_cache</code> / <code>cache</code> remember a function's results so repeated calls with the same arguments are instant. (<code>functools.wraps</code> is explained in the Decorators module.)`,
            codeExamples: [
                `from functools import reduce, partial, lru_cache

print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))

round2 = partial(round, ndigits=2)
print(round2(3.14159))

@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))
print(fib.cache_info())

# OUTPUT:
# 24
# 3.14
# 832040
# CacheInfo(hits=28, misses=31, maxsize=128, currsize=31)`
            ]
        },
        {
            content: `<h4>cached_property and total_ordering</h4>
• <code>@cached_property</code> computes an attribute on first access and stores it on the instance.<br>
• <code>@total_ordering</code> fills in <code>&lt;=</code>, <code>&gt;</code> and <code>&gt;=</code> when you define <code>__eq__</code> and one of the ordering methods.`,
            codeExamples: [
                `from functools import cached_property, total_ordering

class Report:
    def __init__(self, rows):
        self.rows = rows

    @cached_property
    def total(self):
        print("computing...")
        return sum(self.rows)

r = Report([10, 20, 30])
print(r.total)
print(r.total)                 # cached - not recomputed

@total_ordering
class Version:
    def __init__(self, major, minor):
        self.major, self.minor = major, minor

    def __eq__(self, other):
        return (self.major, self.minor) == (other.major, other.minor)

    def __lt__(self, other):
        return (self.major, self.minor) < (other.major, other.minor)

print(Version(1, 2) <= Version(1, 3), Version(2, 0) > Version(1, 9))

# OUTPUT:
# computing...
# 60
# 60
# True True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Laziness: Huge or Infinite Inputs, Tiny Memory</h3>
itertools objects produce one item at a time, so their memory use doesn't depend on how many items they <i>could</i> produce. <code>product(range(10_000), repeat=3)</code> describes a trillion tuples, yet it only stores its inputs - the results are generated as you ask for them.`,
            codeExamples: [
                `import sys
from itertools import product, islice

combos = product(range(10_000), repeat=3)          # 10**12 tuples - not built
print(list(islice(combos, 3)))
print(sys.getsizeof(combos) < 1_000)

# OUTPUT:
# [(0, 0, 0), (0, 0, 1), (0, 0, 2)]
# True`
            ]
        },
        {
            content: `<h3>The groupby Pitfall: Sort First</h3>
<code>groupby</code> starts a new group every time the key <b>changes</b>. Unsorted input produces several groups for the same key. Sort by the same key first (or use a <code>defaultdict(list)</code> when order doesn't matter).`,
            codeExamples: [
                `from itertools import groupby

words = ["apple", "avocado", "banana", "apricot"]
first = lambda w: w[0]

for letter, group in groupby(words, key=first):
    print(letter, list(group))

print("--- sorted ---")
for letter, group in groupby(sorted(words, key=first), key=first):
    print(letter, list(group))

# OUTPUT:
# a ['apple', 'avocado']
# b ['banana']
# a ['apricot']
# --- sorted ---
# a ['apple', 'avocado', 'apricot']
# b ['banana']`
            ]
        },
        {
            content: `<h3>lru_cache in Practice</h3>
• <code>maxsize</code> bounds memory: least-recently-used entries are evicted. <code>maxsize=None</code> (or <code>@cache</code>, 3.9+) never evicts.<br>
• <code>cache_info()</code> shows hits and misses; <code>cache_clear()</code> empties it.<br>
• Arguments must be <b>hashable</b> - they become dictionary keys.<br>
• Only cache <b>pure</b> functions: a cached result never notices that the outside world changed.<br>
• On methods, the cache holds a reference to <code>self</code>, keeping instances alive as long as the cache lives.`,
            codeExamples: [
                `from functools import cache

@cache
def total(items):
    return sum(items)

print(total((1, 2, 3)))        # tuples are hashable
total.cache_clear()
print(total.cache_info().currsize)
total([1, 2, 3])

# OUTPUT:
# 6
# 0
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h3>cached_property vs property</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th><code>@property</code></th><th><code>@cached_property</code></th></tr>
<tr class='text-center'><td>Computed</td><td>On every access</td><td>Once, on first access</td></tr>
<tr class='text-center'><td>Reflects later data changes</td><td>Yes</td><td>No - until you <code>del obj.attr</code></td></tr>
<tr class='text-center'><td>Stored where</td><td>Nowhere</td><td>In the instance's <code>__dict__</code></td></tr>
<tr class='text-center'><td>Works with <code>__slots__</code></td><td>Yes</td><td>No - needs an instance <code>__dict__</code></td></tr>
<tr class='text-center'><td>Use for</td><td>Cheap or changing values</td><td>Expensive values of data that doesn't change</td></tr>
</table>`
        },
        {
            content: `<h3>singledispatch: Overloading by Type</h3>
Python has no method overloading, but <code>@singledispatch</code> picks an implementation based on the <b>type of the first argument</b>, registered with type annotations.`,
            codeExamples: [
                `from functools import singledispatch

@singledispatch
def describe(value):
    return f"something: {value!r}"

@describe.register
def _(value: int):
    return f"an int: {value}"

@describe.register
def _(value: list):
    return f"a list of {len(value)} items"

print(describe(5))
print(describe([1, 2]))
print(describe("hi"))

# OUTPUT:
# an int: 5
# a list of 2 items
# something: 'hi'`
            ]
        },
        {
            content: `<h3>Itertools Recipes</h3>
The official <code>itertools</code> documentation ends with a list of "recipes" - small functions built from these tools, such as <code>take</code>, <code>flatten</code> and <code>sliding_window</code>. Several became built-ins (<code>pairwise</code> in 3.10, <code>batched</code> in 3.12), and the third-party <b>more-itertools</b> package ships the rest ready-made.`,
            codeExamples: [
                `from itertools import islice, chain
from collections import deque

def take(n, iterable):
    return list(islice(iterable, n))

def sliding_window(iterable, n):
    it = iter(iterable)
    window = deque(islice(it, n - 1), maxlen=n)
    for x in it:
        window.append(x)
        yield tuple(window)

flatten = chain.from_iterable

print(take(3, "abcdef"))
print(list(sliding_window([1, 2, 3, 4, 5], 3)))
print(list(flatten([[1], [2, 3]])))

# OUTPUT:
# ['a', 'b', 'c']
# [(1, 2, 3), (2, 3, 4), (3, 4, 5)]
# [1, 2, 3]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>permutations vs combinations?</td><td>permutations count different orders as different results; combinations don't</td></tr>
<tr class='text-center'><td>Why does groupby give duplicate groups?</td><td>It only groups consecutive equal keys - sort the input by the key first</td></tr>
<tr class='text-center'><td>How do you take the first n items of an iterator?</td><td><code>list(islice(it, n))</code></td></tr>
<tr class='text-center'><td>What does lru_cache need from arguments?</td><td>They must be hashable; results are cached per unique argument combination</td></tr>
<tr class='text-center'><td>cached_property vs property?</td><td>cached_property computes once and stores the value on the instance; property recomputes on every access</td></tr>
<tr class='text-center'><td>What does total_ordering do?</td><td>Generates the remaining comparison methods from __eq__ and one of __lt__/__le__/__gt__/__ge__</td></tr>
</table>`
        }
    ]
};
