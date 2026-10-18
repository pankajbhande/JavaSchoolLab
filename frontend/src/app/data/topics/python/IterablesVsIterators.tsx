import type { Topic } from '../../types';

export const iterablesVsIterators: Topic = {
    id: 'python-iterators-generators-iterables-vs-iterators',
    name: 'Iterables vs Iterators',
    beginner: [
        {
            content: `<h4>Two Related Ideas</h4>
• An <b>iterable</b> is anything you can loop over: a list, string, tuple, dict, set, range, file... It can <b>give you an iterator</b> when asked (via <code>iter()</code>).<br>
• An <b>iterator</b> is the object that actually walks through the items. It remembers its position and hands out the <b>next</b> item each time <code>next()</code> is called. When nothing is left it raises <code>StopIteration</code>.<br><br>
Think of a book (iterable) and a bookmark (iterator): one book, but you can have several bookmarks, each at its own page. Java has the same pair: <code>Iterable</code> and <code>Iterator</code>.`,
            codeExamples: [
                `nums = [10, 20, 30]          # an iterable
it = iter(nums)               # ask it for an iterator

print(type(nums).__name__, type(it).__name__)
print(next(it), next(it), next(it))
next(it)                      # nothing left

# OUTPUT:
# list list_iterator
# 10 20 30
# StopIteration`
            ]
        },
        {
            content: `<h4>What a for Loop Really Does</h4>
A <code>for</code> loop is built on these two functions. It calls <code>iter()</code> once on the iterable, then calls <code>next()</code> repeatedly, and stops quietly when <code>StopIteration</code> is raised.`,
            codeExamples: [
                `fruits = ["apple", "mango"]

# What you write
for fruit in fruits:
    print(fruit)

# What Python does
it = iter(fruits)
while True:
    try:
        fruit = next(it)
    except StopIteration:
        break
    print(fruit)

# OUTPUT:
# apple
# mango
# apple
# mango`
            ]
        },
        {
            content: `<h4>Which Objects Are Which?</h4>
Containers are iterables but <b>not</b> iterators. Objects such as <code>map</code>, <code>zip</code>, <code>enumerate</code>, file objects and generators <b>are</b> iterators - and every iterator is also an iterable.`,
            codeExamples: [
                `from collections.abc import Iterable, Iterator

samples = [[1, 2], "hi", {"a": 1}, range(3), iter([1]), map(str, [1]), zip([1], [2])]
for obj in samples:
    print(type(obj).__name__, isinstance(obj, Iterable), isinstance(obj, Iterator))

# OUTPUT:
# list True False
# str True False
# dict True False
# range True False
# list_iterator True True
# map True True
# zip True True`
            ]
        },
        {
            content: `<h4>Iterators Are Single-Use</h4>
An iterator only moves forward. Once it is exhausted it stays empty - loop over it again and you get nothing. A list, by contrast, can be looped over any number of times because each loop gets a <b>fresh</b> iterator.`,
            codeExamples: [
                `squares = map(lambda n: n * n, [1, 2, 3])     # an iterator
print(list(squares))
print(list(squares))                            # already used up

nums = [1, 2, 3]                                # an iterable
print(list(nums))
print(list(nums))                               # fine every time

# OUTPUT:
# [1, 4, 9]
# []
# [1, 2, 3]
# [1, 2, 3]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>One Iterable, Many Independent Iterators</h3>
Each call to <code>iter()</code> on a container returns a <b>new</b> iterator with its own position. Calling <code>iter()</code> on an iterator returns <b>the same object</b> - that is what makes an iterator usable directly in a <code>for</code> loop.`,
            codeExamples: [
                `nums = [1, 2, 3]
a = iter(nums)
b = iter(nums)
print(next(a), next(a), next(b))     # b has its own position
print(a is b)

gen = (n for n in nums)
print(iter(gen) is gen)              # an iterator returns itself

# OUTPUT:
# 1 2 1
# False
# True`
            ]
        },
        {
            content: `<h3>The Protocol</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Role</th><th>Must provide</th><th>Java equivalent</th></tr>
<tr class='text-center'><td>Iterable</td><td><code>__iter__()</code> returning an iterator</td><td><code>Iterable.iterator()</code></td></tr>
<tr class='text-center'><td>Iterator</td><td><code>__next__()</code> returning the next item or raising <code>StopIteration</code>, and <code>__iter__()</code> returning itself</td><td><code>hasNext()</code> + <code>next()</code></td></tr>
</table>
Python has no <code>hasNext()</code>: you just ask for the next item and handle <code>StopIteration</code>. Writing your own iterable classes with <code>__iter__</code>/<code>__next__</code> is covered in the <i>Python Data Model</i> module; in practice <b>generators</b> (next topics) are the easy way to create iterators.`
        },
        {
            content: `<h3>Shared Iterators Surprise People</h3>
Because an iterator has one position, everyone holding it shares that position. Passing the same iterator to two consumers makes them steal items from each other.`,
            codeExamples: [
                `rows = iter(["header", "row1", "row2", "row3"])

header = next(rows)                  # consume one item
print("header:", header)

for row in rows:                     # continues where next() left off
    print(row)

it = iter(range(6))
print(list(zip(it, it)))             # zip pulls alternately from ONE iterator

# OUTPUT:
# header: header
# row1
# row2
# row3
# [(0, 1), (2, 3), (4, 5)]`
            ]
        },
        {
            content: `<h3>Why Iterators Matter</h3>
Iterators produce items <b>on demand</b>, so they can represent huge or even infinite sequences without storing them: lines of a 10 GB log file, rows streamed from a database, or an endless counter. Most of Python's built-ins (<code>sum</code>, <code>max</code>, <code>sorted</code>, <code>list</code>, <code>zip</code>, unpacking, <code>in</code>) accept any iterable, so code written against "iterable" works with all of them.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Iterable vs iterator?</td><td>An iterable can produce an iterator (has <code>__iter__</code>); an iterator produces items one at a time (has <code>__next__</code>) and remembers its position</td></tr>
<tr class='text-center'><td>Is a list an iterator?</td><td>No - it is an iterable; <code>iter(list)</code> returns a list_iterator</td></tr>
<tr class='text-center'><td>How does a for loop work internally?</td><td>Calls iter() on the object, then next() repeatedly until StopIteration</td></tr>
<tr class='text-center'><td>Why does a second <code>list(m)</code> on a map return []?</td><td>map returns an iterator, which is exhausted after one pass</td></tr>
<tr class='text-center'><td>What does <code>iter(it)</code> return for an iterator?</td><td>The iterator itself</td></tr>
<tr class='text-center'><td>Python equivalent of Java's hasNext()?</td><td>None - call next() and catch StopIteration, or use next(it, default)</td></tr>
</table>`
        }
    ]
};
