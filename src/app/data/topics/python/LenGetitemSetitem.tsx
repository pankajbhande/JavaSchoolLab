import type { Topic } from '../../types';

export const lenGetitemSetitem: Topic = {
    id: 'python-data-model-len-getitem-setitem',
    name: '__len__, __getitem__ & __setitem__',
    beginner: [
        {
            content: `<h4>The Container Methods</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Syntax</th><th>Method</th><th>Java <code>List</code> analogue</th></tr>
<tr class='text-center'><td><code>len(x)</code></td><td><code>__len__(self)</code></td><td><code>size()</code></td></tr>
<tr class='text-center'><td><code>x[key]</code></td><td><code>__getitem__(self, key)</code></td><td><code>get(i)</code></td></tr>
<tr class='text-center'><td><code>x[key] = value</code></td><td><code>__setitem__(self, key, value)</code></td><td><code>set(i, v)</code></td></tr>
<tr class='text-center'><td><code>del x[key]</code></td><td><code>__delitem__(self, key)</code></td><td><code>remove(i)</code></td></tr>
</table>
Implementing these lets your own class be used with the same square-bracket syntax as a list or dict.`
        },
        {
            content: `<h4>A Playlist That Behaves Like a List</h4>
The simplest approach is to keep the data in a list and <b>delegate</b> to it.`,
            codeExamples: [
                `class Playlist:
    def __init__(self, name, songs):
        self.name = name
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, index):
        return self._songs[index]

    def __setitem__(self, index, song):
        self._songs[index] = song

    def __delitem__(self, index):
        del self._songs[index]

mix = Playlist("Drive", ["Song A", "Song B", "Song C", "Song D"])

print(len(mix))
print(mix[0], mix[-1])          # negative indexes work through the list
mix[1] = "Song X"
del mix[2]
print(mix[:])                   # a slice is passed to the list too
print(len(mix))

# OUTPUT:
# 4
# Song A Song D
# ['Song A', 'Song X', 'Song D']
# 3`
            ]
        },
        {
            content: `<h4>What Does __getitem__ Receive?</h4>
For <code>x[2]</code> it receives the int <code>2</code>. For <code>x[1:3]</code> it receives a <b>slice object</b>, <code>slice(1, 3, None)</code>. For <code>x["a"]</code> it receives the string. Printing the key makes this visible.`,
            codeExamples: [
                `class Spy:
    def __getitem__(self, key):
        return key

s = Spy()
print(s[2])
print(s[1:3])
print(s[::2])
print(s["name"])
print(s[1, 2])                  # several keys arrive as a tuple

# OUTPUT:
# 2
# slice(1, 3, None)
# slice(None, None, 2)
# name
# (1, 2)`
            ]
        },
        {
            content: `<h4>Returning the Same Type from a Slice</h4>
Delegating gives back a plain list for slices. If slices should be <code>Playlist</code> objects too, check for <code>slice</code> and wrap the result.`,
            codeExamples: [
                `class Playlist:
    def __init__(self, name, songs):
        self.name = name
        self._songs = list(songs)

    def __len__(self):
        return len(self._songs)

    def __getitem__(self, index):
        if isinstance(index, slice):
            return Playlist(self.name + " (part)", self._songs[index])
        return self._songs[index]

    def __repr__(self):
        return f"Playlist({self.name!r}, {self._songs!r})"

mix = Playlist("Drive", ["A", "B", "C", "D"])
print(mix[1:3])
print(mix[1])

# OUTPUT:
# Playlist('Drive (part)', ['B', 'C'])
# B`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>__getitem__ Alone Makes a Class Iterable</h3>
If a class has no <code>__iter__</code>, a <code>for</code> loop falls back to the old <b>sequence protocol</b>: it calls <code>__getitem__(0)</code>, <code>__getitem__(1)</code>, ... until <code>IndexError</code> is raised. That is why the Deck in <i>Dunder Methods</i> was iterable. Modern code should still define <code>__iter__</code> explicitly.`,
            codeExamples: [
                `class Squares:
    def __init__(self, n):
        self.n = n

    def __getitem__(self, i):
        if i >= self.n:
            raise IndexError(i)     # signals the end of iteration
        return i * i

for sq in Squares(4):
    print(sq, end=" ")
print()
print(list(Squares(5)), 9 in Squares(5))

# OUTPUT:
# 0 1 4 9
# [0, 1, 4, 9, 16] True`
            ]
        },
        {
            content: `<h3>Mapping-Like Classes and __missing__</h3>
A mapping's <code>__getitem__</code> takes a key and raises <code>KeyError</code> when it is missing. A <b>dict subclass</b> can define <code>__missing__</code>, which <code>dict.__getitem__</code> calls instead of raising - this is how <code>defaultdict</code> works.`,
            codeExamples: [
                `class Config:
    def __init__(self, **settings):
        self._data = {k.lower(): v for k, v in settings.items()}

    def __getitem__(self, key):
        return self._data[key.lower()]       # raises KeyError if missing

cfg = Config(Theme="dark", Font=14)
print(cfg["THEME"], cfg["font"])

class Prices(dict):
    def __missing__(self, key):
        return 0                             # unknown items cost 0

prices = Prices(pen=10)
print(prices["pen"], prices["laptop"])
print(prices.get("laptop"))                  # get() does NOT call __missing__

# OUTPUT:
# dark 14
# 10 0
# None`
            ]
        },
        {
            content: `<h3>Free Methods from collections.abc</h3>
Subclass <code>collections.abc.Sequence</code>, implement just <code>__getitem__</code> and <code>__len__</code>, and you get <code>__contains__</code>, <code>__iter__</code>, <code>__reversed__</code>, <code>index()</code> and <code>count()</code> as mixin methods. <code>MutableSequence</code> additionally needs <code>__setitem__</code>, <code>__delitem__</code> and <code>insert</code>, and then provides <code>append</code>, <code>extend</code>, <code>pop</code>, <code>remove</code> and more. It also makes <code>isinstance(obj, Sequence)</code> true.`,
            codeExamples: [
                `from collections.abc import Sequence

class Weekdays(Sequence):
    _days = ("Mon", "Tue", "Wed", "Thu", "Fri")

    def __getitem__(self, i):
        return self._days[i]

    def __len__(self):
        return len(self._days)

w = Weekdays()
print(w.index("Wed"), w.count("Fri"), "Sun" in w)
print(list(reversed(w)))
print(isinstance(w, Sequence))

# OUTPUT:
# 2 1 False
# ['Fri', 'Thu', 'Wed', 'Tue', 'Mon']
# True`
            ]
        },
        {
            content: `<h3>Rules for __len__</h3>
<code>len()</code> requires <code>__len__</code> to return an <code>int</code> that is <b>0 or more</b>. It is also used for truthiness when a class has no <code>__bool__</code>: an object whose length is 0 is falsy.`,
            codeExamples: [
                `class Bad:
    def __len__(self):
        return -1

class Empty:
    def __len__(self):
        return 0

print(bool(Empty()))
len(Bad())

# OUTPUT:
# False
# ValueError: __len__() should return >= 0`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>x[1:3]</code> pass to __getitem__?</td><td>A slice object, <code>slice(1, 3, None)</code></td></tr>
<tr class='text-center'><td>How can a class without __iter__ be iterable?</td><td>Through __getitem__ with integer indexes from 0 until IndexError is raised</td></tr>
<tr class='text-center'><td>What is __missing__?</td><td>A hook on dict subclasses called by dict.__getitem__ when a key is absent</td></tr>
<tr class='text-center'><td>What must __len__ return?</td><td>A non-negative int</td></tr>
<tr class='text-center'><td>How do you get index(), count() and in for free?</td><td>Subclass collections.abc.Sequence and implement __getitem__ and __len__</td></tr>
<tr class='text-center'><td>Which exception should a sequence's __getitem__ raise for a bad index?</td><td>IndexError (a mapping raises KeyError)</td></tr>
</table>`
        }
    ]
};
