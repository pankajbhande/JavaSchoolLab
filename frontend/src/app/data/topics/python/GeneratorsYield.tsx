import type { Topic } from '../../types';

export const generatorsYield: Topic = {
    id: 'python-iterators-generators-generators-yield',
    name: 'Generators & yield',
    beginner: [
        {
            content: `<h4>What is a Generator?</h4>
A <b>generator function</b> is a function that contains <code>yield</code>. Calling it does <b>not</b> run its body - it returns a <b>generator object</b>, which is an iterator. Each <code>next()</code> runs the body until the next <code>yield</code>, hands out that value, and <b>pauses</b> right there, keeping all its local variables. The next <code>next()</code> resumes from the same spot.`,
            codeExamples: [
                `def countdown(n):
    print("starting")
    while n > 0:
        yield n
        n -= 1
    print("finished")

gen = countdown(3)            # nothing printed yet
print(type(gen).__name__)
print(next(gen))
print(next(gen))
print(next(gen))
next(gen)

# OUTPUT:
# generator
# starting
# 3
# 2
# 1
# finished
# StopIteration`
            ]
        },
        {
            content: `<h4>Using Generators in Loops</h4>
Because a generator is an iterator, a <code>for</code> loop, <code>list()</code>, <code>sum()</code> and friends all work with it.`,
            codeExamples: [
                `def even_numbers(limit):
    for n in range(0, limit + 1, 2):
        yield n

for n in even_numbers(8):
    print(n, end=" ")
print()
print(list(even_numbers(6)), sum(even_numbers(10)))

# OUTPUT:
# 0 2 4 6 8
# [0, 2, 4, 6] 30`
            ]
        },
        {
            content: `<h4>return vs yield</h4>
<code>return</code> ends a normal function and gives back one value. <code>yield</code> produces a value and keeps going. A function that builds and returns a whole list can often become a generator that yields items one by one.`,
            codeExamples: [
                `def squares_list(n):
    result = []
    for i in range(n):
        result.append(i * i)
    return result                  # all values at once

def squares_gen(n):
    for i in range(n):
        yield i * i                # one value at a time

print(squares_list(5))
print(list(squares_gen(5)))

# OUTPUT:
# [0, 1, 4, 9, 16]
# [0, 1, 4, 9, 16]`
            ]
        },
        {
            content: `<h4>Infinite Generators</h4>
A generator can run forever - it only computes a value when asked. Take as many items as you need with <code>itertools.islice</code> or <code>next()</code>.`,
            codeExamples: [
                `from itertools import islice

def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(islice(fibonacci(), 10)))

def invoice_ids(prefix):
    n = 1
    while True:
        yield f"{prefix}{n:04d}"
        n += 1

ids = invoice_ids("INV-")
print(next(ids), next(ids), next(ids))

# OUTPUT:
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
# INV-0001 INV-0002 INV-0003`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>A Generator's Return Value</h3>
A <code>return value</code> inside a generator ends it; the value travels on the <code>StopIteration</code> exception (<code>e.value</code>). <code>for</code> loops ignore it - <code>yield from</code> (a later topic) captures it.`,
            codeExamples: [
                `def task():
    yield "step 1"
    yield "step 2"
    return "all done"

g = task()
print(next(g), next(g))
try:
    next(g)
except StopIteration as e:
    print("returned:", e.value)

# OUTPUT:
# step 1 step 2
# returned: all done`
            ]
        },
        {
            content: `<h3>Generator States</h3>
<code>inspect.getgeneratorstate()</code> shows where a generator is in its life cycle.`,
            codeExamples: [
                `import inspect

def g():
    yield 1

gen = g()
print(inspect.getgeneratorstate(gen))
next(gen)
print(inspect.getgeneratorstate(gen))
next(gen, None)
print(inspect.getgeneratorstate(gen))

# OUTPUT:
# GEN_CREATED
# GEN_SUSPENDED
# GEN_CLOSED`
            ]
        },
        {
            content: `<h3>send(): Two-Way Communication</h3>
<code>yield</code> is also an expression: <code>gen.send(value)</code> resumes the generator and makes the paused <code>yield</code> evaluate to <code>value</code>. The generator must first be advanced to its first <code>yield</code> ("primed") with <code>next()</code>. This is how coroutines worked before <code>async</code>/<code>await</code>; in everyday code it is rare.`,
            codeExamples: [
                `def running_average():
    total = 0
    count = 0
    average = None
    while True:
        value = yield average      # receive a value, hand back the average
        total += value
        count += 1
        average = total / count

avg = running_average()
next(avg)                          # prime it
print(avg.send(10))
print(avg.send(20))
print(avg.send(60))

# OUTPUT:
# 10.0
# 15.0
# 30.0`
            ]
        },
        {
            content: `<h3>close(), GeneratorExit and Cleanup</h3>
<code>gen.close()</code> raises <code>GeneratorExit</code> at the paused <code>yield</code>, so <code>finally</code> blocks and <code>with</code> statements inside the generator still run. Generators are also closed automatically when garbage-collected.`,
            codeExamples: [
                `def read_records():
    print("open connection")
    try:
        while True:
            yield "record"
    finally:
        print("close connection")

r = read_records()
print(next(r), next(r))
r.close()

# OUTPUT:
# open connection
# record record
# close connection`
            ]
        },
        {
            content: `<h3>StopIteration Inside a Generator Becomes RuntimeError</h3>
Since Python 3.7 (PEP 479), a <code>StopIteration</code> that escapes from inside a generator's body is turned into a <code>RuntimeError</code>, so bugs aren't silently mistaken for "end of data". Use <code>return</code> to finish, or <code>next(it, default)</code> inside generators.`,
            codeExamples: [
                `def first_items(*iterables):
    for it in iterables:
        yield next(iter(it))       # StopIteration if one is empty

print(list(first_items([1, 2], [3])))
print(list(first_items([1], [])))

# OUTPUT:
# [1, 3]
# RuntimeError: generator raised StopIteration`
            ]
        },
        {
            content: `<h3>Generators vs Lists, and Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>List-returning function</th><th>Generator</th></tr>
<tr class='text-center'><td>Memory</td><td>All items at once</td><td>One item at a time (constant)</td></tr>
<tr class='text-center'><td>First result available</td><td>After everything is computed</td><td>Immediately</td></tr>
<tr class='text-center'><td>Reusable / indexable / len()</td><td>Yes</td><td>No - single pass</td></tr>
<tr class='text-center'><td>Infinite sequences</td><td>Impossible</td><td>Natural</td></tr>
</table>
Java has no <code>yield</code> for iterators; you would implement <code>Iterator</code> by hand or use a lazy <code>Stream</code>. A Python generator gives you a full iterator from a plain function.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a generator?</td><td>A function containing yield; calling it returns an iterator that runs the body lazily, pausing at each yield</td></tr>
<tr class='text-center'><td>yield vs return?</td><td>yield produces a value and pauses, keeping local state; return ends the function (in a generator it stops iteration)</td></tr>
<tr class='text-center'><td>Why use generators?</td><td>Constant memory, results available immediately, and the ability to model infinite or streaming data</td></tr>
<tr class='text-center'><td>What does send() do?</td><td>Resumes the generator and makes the paused yield expression evaluate to the sent value</td></tr>
<tr class='text-center'><td>How do you guarantee cleanup in a generator?</td><td>try/finally or with inside it - close() or garbage collection raises GeneratorExit at the yield</td></tr>
<tr class='text-center'><td>What happens if StopIteration escapes a generator body?</td><td>It is converted into RuntimeError (PEP 479)</td></tr>
</table>`
        }
    ]
};
