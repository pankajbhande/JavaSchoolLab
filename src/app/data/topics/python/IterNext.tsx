import type { Topic } from '../../types';

export const iterNext: Topic = {
    id: 'python-data-model-iter-next',
    name: '__iter__ & __next__',
    beginner: [
        {
            content: `<h4>Iterable vs Iterator</h4>
• An <b>iterable</b> is anything you can loop over. It has <code>__iter__()</code>, which returns an iterator.<br>
• An <b>iterator</b> produces the values one at a time. It has <code>__next__()</code>, which returns the next value or raises <code>StopIteration</code> when there are no more - and <code>__iter__()</code> returning itself.<br><br>
This is the same split as Java's <code>Iterable</code> (with <code>iterator()</code>) and <code>Iterator</code> (with <code>hasNext()</code>/<code>next()</code>). Python has no <code>hasNext()</code>: the end is signalled by the exception.`
        },
        {
            content: `<h4>What a for Loop Really Does</h4>`,
            codeExamples: [
                `items = ["a", "b"]

for x in items:
    print(x)

# ...is roughly equivalent to:
it = iter(items)                 # calls items.__iter__()
while True:
    try:
        x = next(it)             # calls it.__next__()
    except StopIteration:
        break
    print(x)

# OUTPUT:
# a
# b
# a
# b`
            ]
        },
        {
            content: `<h4>Writing an Iterator Class</h4>
A <code>Countdown</code> keeps its position in an attribute and moves it forward on every <code>__next__</code> call.`,
            codeExamples: [
                `class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self              # an iterator is its own iterable

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

for n in Countdown(3):
    print(n)

c = Countdown(2)
print(next(c), next(c))
print(next(c, "done"))           # default instead of StopIteration

# OUTPUT:
# 3
# 2
# 1
# 2 1
# done`
            ]
        },
        {
            content: `<h4>Making a Container Iterable</h4>
A container usually doesn't track a position itself. Its <code>__iter__</code> just returns a <b>fresh</b> iterator - often the iterator of an internal list.`,
            codeExamples: [
                `class Classroom:
    def __init__(self, students):
        self._students = list(students)

    def __iter__(self):
        return iter(self._students)

room = Classroom(["Asha", "Ravi", "Kiran"])
for s in room:
    print(s, end=" ")
print()
print(sorted(room), "Ravi" in room)

# OUTPUT:
# Asha Ravi Kiran
# ['Asha', 'Kiran', 'Ravi'] True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why Iterators Return self from __iter__</h3>
<code>for</code>, <code>list()</code>, <code>zip()</code> and friends always call <code>iter()</code> first. Returning <code>self</code> lets an iterator be used anywhere an iterable is expected - e.g. a <code>for</code> loop that continues from wherever the iterator currently is.`,
            codeExamples: [
                `it = iter([1, 2, 3, 4])
print(next(it))              # consume the first item manually
for x in it:                 # for calls iter(it), which returns it itself
    print(x, end=" ")
print()

# OUTPUT:
# 1
# 2 3 4`
            ]
        },
        {
            content: `<h3>The Bug: A Container That Is Its Own Iterator</h3>
If a container stores the position and returns <code>self</code> from <code>__iter__</code>, it can be iterated only <b>once</b> - and two loops over it interfere with each other. Containers should return a new iterator every time.`,
            codeExamples: [
                `class BadBag:
    def __init__(self, items):
        self.items = items
        self.i = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.i >= len(self.items):
            raise StopIteration
        self.i += 1
        return self.items[self.i - 1]

bag = BadBag(["x", "y"])
print(list(bag))
print(list(bag))             # exhausted - the position was never reset

# OUTPUT:
# ['x', 'y']
# []`
            ]
        },
        {
            content: `<h3>The Idiomatic Way: a Generator __iter__</h3>
Writing <code>__iter__</code> as a <b>generator function</b> (using <code>yield</code>) creates a new iterator on each call, keeps the state in local variables, and raises <code>StopIteration</code> automatically. No separate iterator class is needed. Generators are covered fully in the Iterators &amp; Generators module.`,
            codeExamples: [
                `class Countdown:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        n = self.start
        while n > 0:
            yield n
            n -= 1

c = Countdown(3)
print(list(c))
print(list(c))               # re-iterable: a fresh generator each time
print(sum(c), max(c))

# OUTPUT:
# [3, 2, 1]
# [3, 2, 1]
# 6 3`
            ]
        },
        {
            content: `<h3>Python vs Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Concept</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Iterable</td><td><code>Iterable&lt;T&gt;.iterator()</code></td><td><code>__iter__()</code></td></tr>
<tr class='text-center'><td>Get next value</td><td><code>next()</code></td><td><code>__next__()</code> via <code>next(it)</code></td></tr>
<tr class='text-center'><td>End of data</td><td><code>hasNext()</code> returns false</td><td><code>StopIteration</code> is raised</td></tr>
<tr class='text-center'><td>Easy implementation</td><td>Anonymous Iterator class</td><td>A generator with <code>yield</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Iterable vs iterator?</td><td>An iterable's __iter__ returns an iterator; an iterator has __next__ and returns itself from __iter__</td></tr>
<tr class='text-center'><td>How does an iterator signal the end?</td><td>By raising StopIteration from __next__</td></tr>
<tr class='text-center'><td>Why can a list be looped many times but a map object only once?</td><td>A list returns a fresh iterator from each __iter__ call; a map object is itself an iterator</td></tr>
<tr class='text-center'><td>What goes wrong if a container returns self from __iter__?</td><td>It can be iterated only once and nested loops share one position</td></tr>
<tr class='text-center'><td>Simplest way to make a class iterable?</td><td>Write __iter__ as a generator using yield, or return iter(self._items)</td></tr>
</table>`
        }
    ]
};
