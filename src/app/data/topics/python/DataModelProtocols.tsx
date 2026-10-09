import type { Topic } from '../../types';

export const dataModelProtocols: Topic = {
    id: 'python-data-model-protocols',
    name: 'Protocols',
    beginner: [
        {
            content: `<h4>What is a Protocol?</h4>
In Java, a class declares <code>implements Iterable</code> to be usable in a for-each loop. In Python there is nothing to declare: an object is "iterable" simply because it has an <code>__iter__</code> method. A <b>protocol</b> is this kind of informal interface - a set of dunder methods that, once implemented, plug your object into Python's syntax and built-ins. This is <b>duck typing</b>: behaviour matters, not ancestry.`
        },
        {
            content: `<h4>The Main Protocols</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Protocol</th><th>Methods</th><th>Used by</th></tr>
<tr class='text-center'><td>Iterable</td><td><code>__iter__</code></td><td><code>for</code>, <code>list()</code>, unpacking, <code>in</code> (fallback)</td></tr>
<tr class='text-center'><td>Iterator</td><td><code>__iter__</code> + <code>__next__</code></td><td><code>next()</code>, for loops</td></tr>
<tr class='text-center'><td>Sized</td><td><code>__len__</code></td><td><code>len()</code>, truthiness (fallback)</td></tr>
<tr class='text-center'><td>Container</td><td><code>__contains__</code></td><td><code>in</code>, <code>not in</code></td></tr>
<tr class='text-center'><td>Sequence</td><td><code>__getitem__</code> + <code>__len__</code></td><td>indexing, slicing, <code>reversed()</code>, iteration</td></tr>
<tr class='text-center'><td>Mapping</td><td><code>__getitem__</code>, <code>__iter__</code>, <code>__len__</code></td><td><code>d[key]</code>, <code>**d</code></td></tr>
<tr class='text-center'><td>Callable</td><td><code>__call__</code></td><td><code>obj()</code></td></tr>
<tr class='text-center'><td>Context manager</td><td><code>__enter__</code> + <code>__exit__</code></td><td><code>with</code></td></tr>
<tr class='text-center'><td>Hashable</td><td><code>__hash__</code> + <code>__eq__</code></td><td>dict keys, set members</td></tr>
<tr class='text-center'><td>Comparable</td><td><code>__lt__</code> (etc.)</td><td><code>sorted()</code>, <code>min()</code>, <code>max()</code></td></tr>
<tr class='text-center'><td>Numeric</td><td><code>__add__</code>, <code>__mul__</code>...</td><td>operators, <code>sum()</code></td></tr>
<tr class='text-center'><td>Truthiness</td><td><code>__bool__</code></td><td><code>if obj:</code>, <code>bool()</code></td></tr>
</table>
The individual methods have their own topics in this module; this one shows how they fit together.`
        },
        {
            content: `<h4>Two Methods, Many Features</h4>
A class with just <code>__len__</code> and <code>__getitem__</code> already supports <code>len()</code>, indexing, slicing, <code>for</code> loops, <code>in</code> and <code>reversed()</code>. Python's fallbacks iterate by calling <code>__getitem__(0)</code>, <code>__getitem__(1)</code>... until <code>IndexError</code>.`,
            codeExamples: [
                `class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, index):
        return self._songs[index]          # ints and slices both work

p = Playlist(["Song A", "Song B", "Song C"])

print(len(p), p[0], p[-1])
print(p[1:])
for song in p:
    print("playing", song)
print("Song B" in p)
print(list(reversed(p)))

# OUTPUT:
# 3 Song A Song C
# ['Song B', 'Song C']
# playing Song A
# playing Song B
# playing Song C
# True
# ['Song C', 'Song B', 'Song A']`
            ]
        },
        {
            content: `<h4>The Context Manager Protocol</h4>
Any object with <code>__enter__</code> and <code>__exit__</code> works in a <code>with</code> statement (the Context Managers module covers this in depth).`,
            codeExamples: [
                `class Tag:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"<{self.name}>")
        return self

    def __exit__(self, exc_type, exc, tb):
        print(f"</{self.name}>")
        return False                       # don't swallow exceptions

with Tag("b"):
    print("bold text")

# OUTPUT:
# <b>
# bold text
# </b>`
            ]
        },
        {
            content: `<h4>Duck Typing in Practice</h4>
A function written against a protocol accepts any object that follows it - lists, tuples, generators, files, or your own classes.`,
            codeExamples: [
                `def total_minutes(durations):              # anything iterable of numbers
    return sum(durations)

class Playlist:
    def __init__(self, minutes):
        self._minutes = list(minutes)

    def __iter__(self):
        return iter(self._minutes)

print(total_minutes([3, 4]))
print(total_minutes((5, 2, 1)))
print(total_minutes(m for m in range(4)))
print(total_minutes(Playlist([3, 5, 4])))

# OUTPUT:
# 7
# 8
# 6
# 12`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>collections.abc Formalises the Protocols</h3>
The abstract base classes in <code>collections.abc</code> name each protocol. For simple "one-method" ABCs (<code>Iterable</code>, <code>Sized</code>, <code>Container</code>, <code>Hashable</code>, <code>Callable</code>), <code>isinstance</code> checks for the method through <code>__subclasshook__</code> - no inheritance needed. Richer ABCs such as <code>Sequence</code> require inheriting or registering. Note the gap: our first <code>Playlist</code> is iterable through the <code>__getitem__</code> fallback, but <code>isinstance(p, Iterable)</code> only checks for <code>__iter__</code>. The reliable test is to call <code>iter(obj)</code>.`,
            codeExamples: [
                `from collections.abc import Hashable, Iterable, Sequence, Sized

class Playlist:
    def __init__(self, songs):
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, index):
        return self._songs[index]

p = Playlist(["Song A", "Song B"])
print(isinstance(p, Sized), isinstance(p, Iterable), isinstance(p, Sequence))

try:
    iter(p)
    print("iterable after all")
except TypeError:
    print("not iterable")

print(isinstance([], Hashable), isinstance((1, [2]), Hashable))   # the tuple still fails hash()

# OUTPUT:
# True False False
# iterable after all
# False True`
            ]
        },
        {
            content: `<h3>Inherit from an ABC to Get Mixin Methods</h3>
Subclassing <code>collections.abc.Sequence</code> and implementing just <code>__getitem__</code> and <code>__len__</code> gives you <code>__contains__</code>, <code>__iter__</code>, <code>__reversed__</code>, <code>index()</code> and <code>count()</code> for free - and passes every <code>isinstance</code> check. Forgetting a required method fails at instantiation, like a Java abstract class.`,
            codeExamples: [
                `from collections.abc import Iterable, Sequence

class Playlist(Sequence):
    def __init__(self, songs):
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, index):
        return self._songs[index]

p = Playlist(["Song A", "Song B", "Song A"])
print(isinstance(p, Iterable), isinstance(p, Sequence))
print(p.index("Song B"), p.count("Song A"))

class Broken(Sequence):
    def __len__(self):
        return 0

Broken()

# OUTPUT:
# True True
# 1 2
# TypeError: Can't instantiate abstract class Broken without an implementation for abstract method '__getitem__'`
            ]
        },
        {
            content: `<h3>typing.Protocol: Structural Types for Static Checking</h3>
<code>typing.Protocol</code> lets you describe a protocol of your own for type checkers such as mypy: any class with matching methods is accepted, <b>without</b> inheriting from it ("structural" typing, versus Java's "nominal" interfaces). <code>@runtime_checkable</code> also enables <code>isinstance</code> checks (which test only that the methods exist). The OOP module covers interfaces with protocols further.`,
            codeExamples: [
                `from typing import Protocol, runtime_checkable

@runtime_checkable
class SupportsArea(Protocol):
    def area(self) -> float: ...

class Square:                       # no inheritance from SupportsArea
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

def total_area(shapes: list[SupportsArea]) -> float:
    return sum(s.area() for s in shapes)

print(total_area([Square(2), Square(3)]))
print(isinstance(Square(1), SupportsArea), isinstance("text", SupportsArea))

# OUTPUT:
# 13
# True False`
            ]
        },
        {
            content: `<h3>Minimum Methods to Plug into Python</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>To support...</th><th>Implement at least</th></tr>
<tr class='text-center'><td><code>for x in obj</code></td><td><code>__iter__</code> (or <code>__getitem__</code> with int indexes)</td></tr>
<tr class='text-center'><td><code>len(obj)</code></td><td><code>__len__</code></td></tr>
<tr class='text-center'><td><code>x in obj</code> efficiently</td><td><code>__contains__</code></td></tr>
<tr class='text-center'><td><code>obj[i]</code>, slicing</td><td><code>__getitem__</code></td></tr>
<tr class='text-center'><td><code>with obj:</code></td><td><code>__enter__</code>, <code>__exit__</code></td></tr>
<tr class='text-center'><td>dict key / set member</td><td><code>__eq__</code> and <code>__hash__</code></td></tr>
<tr class='text-center'><td><code>sorted()</code></td><td><code>__lt__</code></td></tr>
<tr class='text-center'><td>readable printing</td><td><code>__repr__</code> (and optionally <code>__str__</code>)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a protocol in Python?</td><td>An informal interface defined by a set of special methods, such as __iter__ for iterables</td></tr>
<tr class='text-center'><td>How is this different from Java interfaces?</td><td>No declaration is needed - having the methods is enough (duck/structural typing)</td></tr>
<tr class='text-center'><td>What is the minimum for a class to work in a for loop?</td><td><code>__iter__</code>, or <code>__getitem__</code> accepting 0, 1, 2... until IndexError</td></tr>
<tr class='text-center'><td>How do you reliably check if something is iterable?</td><td>Call <code>iter(obj)</code> and catch TypeError - isinstance(obj, Iterable) misses __getitem__-only classes</td></tr>
<tr class='text-center'><td>What does inheriting from collections.abc.Sequence give you?</td><td>Mixin methods (__contains__, __iter__, __reversed__, index, count) and enforcement of the abstract methods</td></tr>
<tr class='text-center'><td>What is typing.Protocol?</td><td>A way to declare structural interfaces for static type checkers; @runtime_checkable adds isinstance support</td></tr>
</table>`
        }
    ]
};
