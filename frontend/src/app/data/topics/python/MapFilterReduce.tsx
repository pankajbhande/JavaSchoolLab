import type { Topic } from '../../types';

export const mapFilterReduce: Topic = {
    id: 'python-functions-map-filter-reduce',
    name: 'map(), filter() & reduce()',
    beginner: [
        {
            content: `<h4>Functional-Style Helpers</h4>
These three functions process a whole sequence by handing each item to <b>another function</b>:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>What it does</th><th>Result</th></tr>
<tr class='text-center'><td><code>map(func, iterable)</code></td><td>Applies func to every item</td><td>One output per input</td></tr>
<tr class='text-center'><td><code>filter(func, iterable)</code></td><td>Keeps items where func returns a truthy value</td><td>Some of the inputs</td></tr>
<tr class='text-center'><td><code>functools.reduce(func, iterable)</code></td><td>Combines all items into one value, two at a time</td><td>A single value</td></tr>
</table>`
        },
        {
            content: `<h4>map() - Transform Every Item</h4>
Pass any function: a built-in, a method like <code>str.upper</code>, or a <code>lambda</code>. Wrap the result in <code>list()</code> to see all values.`,
            codeExamples: [
                `print(list(map(int, ["1", "2", "3"])))
print(list(map(str.upper, ["pune", "delhi"])))
print(list(map(len, ["a", "abc", "ab"])))

prices = [100, 250]
with_gst = list(map(lambda p: round(p * 1.18, 2), prices))
print(with_gst)

# Reading numbers from one line of input
print(list(map(int, "4 9 2".split())))

# OUTPUT:
# [1, 2, 3]
# ['PUNE', 'DELHI']
# [1, 3, 2]
# [118.0, 295.0]
# [4, 9, 2]`
            ]
        },
        {
            content: `<h4>map() with Several Iterables</h4>
Give <code>map</code> two or more iterables and the function receives one item from each. It stops at the shortest iterable.`,
            codeExamples: [
                `print(list(map(lambda a, b: a + b, [1, 2, 3], [10, 20, 30])))
print(list(map(pow, [2, 3, 4], [3, 2, 1])))       # 2**3, 3**2, 4**1

# OUTPUT:
# [11, 22, 33]
# [8, 9, 4]`
            ]
        },
        {
            content: `<h4>filter() - Keep What Matches</h4>
The function is a test; items for which it returns a truthy value are kept. Passing <code>None</code> as the function keeps only truthy items, which is a quick way to drop empty strings, zeros and <code>None</code>.`,
            codeExamples: [
                `marks = [72, 35, 88, 19]
print(list(filter(lambda m: m >= 40, marks)))

print(list(filter(str.isdigit, ["12", "ab", "7"])))

values = [0, 1, "", "a", None, [], [2]]
print(list(filter(None, values)))

# OUTPUT:
# [72, 88]
# ['12', '7']
# [1, 'a', [2]]`
            ]
        },
        {
            content: `<h4>reduce() - Combine Into One Value</h4>
<code>reduce</code> lives in <code>functools</code>. It calls the function with the first two items, then with that result and the third item, and so on: <code>((1 + 2) + 3) + 4</code>. An optional third argument is the starting value.`,
            codeExamples: [
                `from functools import reduce

nums = [1, 2, 3, 4]
print(reduce(lambda a, b: a + b, nums))          # ((1 + 2) + 3) + 4
print(reduce(lambda a, b: a * b, nums))          # product
print(reduce(lambda a, b: a if a > b else b, [3, 9, 4]))   # maximum
print(reduce(lambda acc, x: acc + x, [1, 2, 3], 100))      # start from 100

# OUTPUT:
# 10
# 24
# 9
# 106`
            ]
        },
        {
            content: `<h4>Compared with Java Streams</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java Stream</th><th>Python</th></tr>
<tr class='text-center'><td><code>list.stream().map(x -&gt; x * 2)</code></td><td><code>map(lambda x: x * 2, items)</code></td></tr>
<tr class='text-center'><td><code>.filter(x -&gt; x &gt; 0)</code></td><td><code>filter(lambda x: x &gt; 0, items)</code></td></tr>
<tr class='text-center'><td><code>.reduce(0, Integer::sum)</code></td><td><code>reduce(operator.add, items, 0)</code> - or simply <code>sum(items)</code></td></tr>
<tr class='text-center'><td><code>.collect(Collectors.toList())</code></td><td><code>list(...)</code></td></tr>
</table>
Like Java streams, <code>map</code> and <code>filter</code> are <b>lazy</b>: nothing is computed until you consume the result.`
        }
    ],

    expert: [
        {
            content: `<h3>map and filter Return Lazy Iterators</h3>
They don't build a list. They return an iterator that computes each value only when asked for it - so they work on huge or even infinite inputs with almost no memory.`,
            codeExamples: [
                `def double(n):
    print("doubling", n)
    return n * 2

result = map(double, [1, 2, 3])
print(result)                  # an iterator, not a list
print("nothing computed yet")
print(next(result))            # computes only the first value
print(list(result))            # computes the rest

# OUTPUT:
# <map object at 0x...>        (the address varies)
# nothing computed yet
# doubling 1
# 2
# doubling 2
# doubling 3
# [4, 6]`
            ]
        },
        {
            content: `<h3>Iterators Can Be Used Only Once</h3>
Once consumed, an iterator is empty. If you need the values twice, store them in a list first.`,
            codeExamples: [
                `evens = filter(lambda n: n % 2 == 0, range(6))
print(list(evens))
print(list(evens))             # already exhausted

evens = list(filter(lambda n: n % 2 == 0, range(6)))
print(sum(evens), max(evens))  # a list can be reused

# OUTPUT:
# [0, 2, 4]
# []
# 6 4`
            ]
        },
        {
            content: `<h3>Comprehensions vs map/filter</h3>
Most Python developers prefer comprehensions: they read left to right and need no <code>lambda</code>. <code>map</code> is still neat when the function already exists (<code>map(int, parts)</code>, <code>map(str.strip, lines)</code>).`,
            codeExamples: [
                `nums = [1, 2, 3, 4, 5]

with_functions = list(map(lambda n: n * n, filter(lambda n: n % 2, nums)))
with_comprehension = [n * n for n in nums if n % 2]

print(with_functions)
print(with_comprehension)

# OUTPUT:
# [1, 9, 25]
# [1, 9, 25]`
            ]
        },
        {
            content: `<h3>Prefer Built-ins to reduce()</h3>
<code>reduce</code> was moved out of the built-ins in Python 3 because most uses have a clearer dedicated function. It also fails on an empty sequence unless you give a starting value.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Instead of reduce for...</th><th>Use</th></tr>
<tr class='text-center'><td>Adding numbers</td><td><code>sum(nums)</code></td></tr>
<tr class='text-center'><td>Multiplying numbers</td><td><code>math.prod(nums)</code> (3.8+)</td></tr>
<tr class='text-center'><td>Largest / smallest</td><td><code>max(nums)</code> / <code>min(nums)</code></td></tr>
<tr class='text-center'><td>Joining strings</td><td><code>"".join(words)</code></td></tr>
<tr class='text-center'><td>Any / every condition</td><td><code>any(...)</code> / <code>all(...)</code></td></tr>
</table>`,
            codeExamples: [
                `import math
from functools import reduce

nums = [1, 2, 3, 4]
print(sum(nums), math.prod(nums), max(nums), "".join(["a", "b"]))

print(reduce(lambda a, b: a + b, [], 0))     # a start value makes empty input safe
print(reduce(lambda a, b: a + b, []))

# OUTPUT:
# 10 24 4 ab
# 0
# TypeError: reduce() of empty iterable with no initial value`
            ]
        },
        {
            content: `<h3>Building a Lazy Pipeline</h3>
Because each step is lazy, chaining <code>map</code> and <code>filter</code> processes one item at a time from start to finish - no intermediate lists are created.`,
            codeExamples: [
                `orders = ["  250 ", "abc", "1200", " 99", ""]

cleaned = map(str.strip, orders)        # remove spaces
numeric = filter(str.isdigit, cleaned)  # drop "abc" and ""
amounts = map(int, numeric)             # convert to int
print(sum(amounts))                     # the pipeline runs only here

# OUTPUT:
# 1549`
            ]
        },
        {
            content: `<h3>itertools.starmap and accumulate</h3>
• <code>starmap(func, pairs)</code> - like <code>map</code>, but each item is a tuple that gets unpacked into arguments.<br>
• <code>accumulate(iterable, func)</code> - like <code>reduce</code>, but yields every intermediate result (running totals).`,
            codeExamples: [
                `from itertools import accumulate, starmap

print(list(starmap(pow, [(2, 3), (3, 2)])))
print(list(accumulate([1, 2, 3, 4])))              # running sum
print(list(accumulate([3, 1, 4, 1, 5], max)))      # running maximum

transactions = [1000, -200, 500]
print(list(accumulate(transactions, initial=0)))  # balance after each step

# OUTPUT:
# [8, 9]
# [1, 3, 6, 10]
# [3, 3, 4, 4, 5]
# [0, 1000, 800, 1300]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What do map() and filter() return in Python 3?</td><td>Lazy iterators, not lists - wrap them in list() to get all values</td></tr>
<tr class='text-center'><td>map vs list comprehension?</td><td>Same result; comprehensions are usually more readable, map is concise when the function already exists</td></tr>
<tr class='text-center'><td>What does <code>filter(None, items)</code> do?</td><td>Keeps only the truthy items</td></tr>
<tr class='text-center'><td>Where is reduce in Python 3?</td><td>In the functools module</td></tr>
<tr class='text-center'><td>What happens with reduce on an empty list?</td><td>TypeError unless an initial value is given</td></tr>
<tr class='text-center'><td>Why does a second <code>list(m)</code> on a map object return []?</td><td>Iterators are single-use; the first list() consumed all values</td></tr>
</table>`
        }
    ]
};
