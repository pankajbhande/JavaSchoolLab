import type { Topic } from '../../types';

export const iteratorsIterNext: Topic = {
    id: 'python-iterators-generators-iter-next',
    name: 'iter() & next()',
    beginner: [
        {
            content: `<h4>Driving an Iterator by Hand</h4>
<code>iter(obj)</code> gets an iterator from any iterable; <code>next(it)</code> returns its next item. You rarely need them in simple loops, but they are essential when you want to take items <b>one at a time</b> on your own terms.`,
            codeExamples: [
                `colours = ["red", "green", "blue"]
it = iter(colours)

print(next(it))
print("do something else...")
print(next(it))
print(next(it))

# OUTPUT:
# red
# do something else...
# green
# blue`
            ]
        },
        {
            content: `<h4>StopIteration and the Default Value</h4>
When the iterator is exhausted, <code>next(it)</code> raises <code>StopIteration</code>. Passing a second argument, <code>next(it, default)</code>, returns that default instead - no try/except needed.`,
            codeExamples: [
                `it = iter(["only item"])

print(next(it))
print(next(it, "done"))
print(next(it, None))
next(it)

# OUTPUT:
# only item
# done
# None
# StopIteration`
            ]
        },
        {
            content: `<h4>next() Needs an Iterator, Not a List</h4>`,
            codeExamples: [
                `items = [1, 2, 3]
print(next(iter(items)))      # first item
next(items)

# OUTPUT:
# 1
# TypeError: 'list' object is not an iterator`
            ]
        },
        {
            content: `<h4>Skipping a Header Line</h4>
A common use: take the first item separately, then loop over the rest. The loop continues from where <code>next()</code> stopped.`,
            codeExamples: [
                `lines = iter(["name,marks", "Asha,91", "Ravi,78"])

header = next(lines)
print("columns:", header.split(","))
for line in lines:
    name, marks = line.split(",")
    print(name, int(marks))

# OUTPUT:
# columns: ['name', 'marks']
# Asha 91
# Ravi 78`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>iter(callable, sentinel)</h3>
The two-argument form calls a function again and again and stops when it returns the <b>sentinel</b> value. It turns "call until X" loops into a clean <code>for</code> loop - classic for reading fixed-size chunks.`,
            codeExamples: [
                `import io
from functools import partial

stream = io.StringIO("abcdefgh")
for chunk in iter(partial(stream.read, 3), ""):    # read 3 chars until ""
    print(chunk)

commands = iter(["start", "load", "quit", "never reached"])
for cmd in iter(lambda: next(commands), "quit"):     # stop at "quit"
    print("run", cmd)

# OUTPUT:
# abc
# def
# gh
# run start
# run load`
            ]
        },
        {
            content: `<h3>Taking n Items with islice</h3>
Iterators can't be sliced with <code>[:n]</code>. <code>itertools.islice</code> takes items lazily and leaves the iterator positioned after them.`,
            codeExamples: [
                `from itertools import islice

nums = iter(range(10))
print(list(islice(nums, 3)))
print(list(islice(nums, 3)))       # continues from 3
print(next(nums))

gen = (n * n for n in range(100))
print(gen[:3])

# OUTPUT:
# [0, 1, 2]
# [3, 4, 5]
# 6
# TypeError: 'generator' object is not subscriptable`
            ]
        },
        {
            content: `<h3>Chunking with zip and batched</h3>
Passing the <b>same</b> iterator several times to <code>zip</code> groups consecutive items - but a short final group is silently dropped. Python 3.12 adds <code>itertools.batched</code>, which keeps it.`,
            codeExamples: [
                `from itertools import batched      # Python 3.12+

data = [1, 2, 3, 4, 5, 6, 7]

it = iter(data)
print(list(zip(it, it)))           # 7 is lost

print(list(batched(data, 3)))

# OUTPUT:
# [(1, 2), (3, 4), (5, 6)]
# [(1, 2, 3), (4, 5, 6), (7,)]`
            ]
        },
        {
            content: `<h3>Peeking Ahead</h3>
Iterators can't look ahead without consuming. The usual trick: take the first item, then glue it back on with <code>itertools.chain</code>.`,
            codeExamples: [
                `from itertools import chain

def peek(iterator):
    first = next(iterator, None)
    if first is None:
        return None, iter([])
    return first, chain([first], iterator)

first, rows = peek(iter(["a", "b", "c"]))
print("first is", first)
print(list(rows))                  # nothing was lost

# OUTPUT:
# first is a
# ['a', 'b', 'c']`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>next(it, default)</code> do?</td><td>Returns the next item, or the default instead of raising StopIteration when the iterator is exhausted</td></tr>
<tr class='text-center'><td>Why does <code>next([1, 2])</code> fail?</td><td>A list is an iterable, not an iterator - call <code>next(iter(lst))</code></td></tr>
<tr class='text-center'><td>What does <code>iter(func, sentinel)</code> do?</td><td>Calls func repeatedly, yielding results until it returns the sentinel</td></tr>
<tr class='text-center'><td>How do you take the first n items of an iterator?</td><td><code>itertools.islice(it, n)</code></td></tr>
<tr class='text-center'><td>How do you split data into chunks of n?</td><td><code>itertools.batched(data, n)</code> (3.12+), or <code>zip(*[iter(data)] * n)</code> which drops a short final chunk</td></tr>
</table>`
        }
    ]
};
