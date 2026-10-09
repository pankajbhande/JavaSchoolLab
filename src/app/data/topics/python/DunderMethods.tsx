import type { Topic } from '../../types';

export const dunderMethods: Topic = {
    id: 'python-data-model-dunder-methods',
    name: 'Dunder Methods',
    beginner: [
        {
            content: `<h4>What Are Dunder Methods?</h4>
<b>Dunder</b> ("double underscore") methods - also called <b>magic</b> or <b>special</b> methods - are methods whose names start and end with two underscores, like <code>__init__</code> and <code>__len__</code>. You rarely call them yourself. <b>Python calls them for you</b> when you use built-in syntax:<br><br>
• <code>len(x)</code> calls <code>x.__len__()</code><br>
• <code>x[0]</code> calls <code>x.__getitem__(0)</code><br>
• <code>a + b</code> calls <code>a.__add__(b)</code><br>
• <code>print(x)</code> calls <code>x.__str__()</code><br><br>
They are Python's equivalent of implementing Java interfaces like <code>Comparable</code> or <code>Iterable</code>, or overriding <code>toString()</code> and <code>equals()</code> - except that they plug your class into the <b>language syntax itself</b>.`,
            codeExamples: [
                `nums = [10, 20, 30]

print(len(nums), nums.__len__())          # the same call
print(nums[1], nums.__getitem__(1))
print(nums + [40], nums.__add__([40]))

# OUTPUT:
# 3 3
# 20 20
# [10, 20, 30, 40] [10, 20, 30, 40]`
            ]
        },
        {
            content: `<h4>Syntax to Dunder Method</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>You write</th><th>Python calls</th><th>Java analogue</th></tr>
<tr class='text-center'><td><code>MyClass(a, b)</code></td><td><code>__new__</code>, then <code>__init__</code></td><td>Constructor</td></tr>
<tr class='text-center'><td><code>str(x)</code>, <code>print(x)</code></td><td><code>__str__</code></td><td><code>toString()</code></td></tr>
<tr class='text-center'><td><code>repr(x)</code></td><td><code>__repr__</code></td><td>-</td></tr>
<tr class='text-center'><td><code>len(x)</code></td><td><code>__len__</code></td><td><code>size()</code></td></tr>
<tr class='text-center'><td><code>x[i]</code>, <code>x[i] = v</code></td><td><code>__getitem__</code>, <code>__setitem__</code></td><td><code>get(i)</code>, <code>set(i, v)</code></td></tr>
<tr class='text-center'><td><code>v in x</code></td><td><code>__contains__</code></td><td><code>contains(v)</code></td></tr>
<tr class='text-center'><td><code>for v in x</code></td><td><code>__iter__</code>, <code>__next__</code></td><td><code>Iterable</code> / <code>Iterator</code></td></tr>
<tr class='text-center'><td><code>a == b</code></td><td><code>__eq__</code></td><td><code>equals()</code></td></tr>
<tr class='text-center'><td><code>a &lt; b</code></td><td><code>__lt__</code></td><td><code>compareTo()</code></td></tr>
<tr class='text-center'><td><code>hash(x)</code></td><td><code>__hash__</code></td><td><code>hashCode()</code></td></tr>
<tr class='text-center'><td><code>a + b</code></td><td><code>__add__</code></td><td>(no operator overloading)</td></tr>
<tr class='text-center'><td><code>bool(x)</code>, <code>if x:</code></td><td><code>__bool__</code> (or <code>__len__</code>)</td><td>-</td></tr>
<tr class='text-center'><td><code>x(args)</code></td><td><code>__call__</code></td><td>Functional interface</td></tr>
<tr class='text-center'><td><code>with x:</code></td><td><code>__enter__</code>, <code>__exit__</code></td><td><code>AutoCloseable</code></td></tr>
</table>`
        },
        {
            content: `<h4>Example: A Deck of Cards</h4>
Implement just <b>two</b> dunder methods - <code>__len__</code> and <code>__getitem__</code> - and the class suddenly works with <code>len()</code>, indexing, slicing, <code>for</code> loops, <code>in</code>, <code>reversed()</code> and <code>random.choice()</code>. None of those features were written by hand.`,
            codeExamples: [
                `import random

class Deck:
    ranks = [str(n) for n in range(2, 11)] + list("JQKA")
    suits = ["♠", "♥", "♦", "♣"]

    def __init__(self):
        self._cards = [rank + suit for suit in self.suits for rank in self.ranks]

    def __len__(self):
        return len(self._cards)

    def __getitem__(self, position):
        return self._cards[position]

deck = Deck()
print(len(deck))
print(deck[0], deck[-1])
print(deck[:3])
print(deck[12::13])              # every ace
print("Q♥" in deck)
print(next(iter(reversed(deck))))
print(random.choice(deck))       # a random card - varies

# OUTPUT:
# 52
# 2♠ A♣
# ['2♠', '3♠', '4♠']
# ['A♠', 'A♥', 'A♦', 'A♣']
# True
# A♣
# 7♦  (e.g. - varies each run)`
            ]
        },
        {
            content: `<h4>Call the Built-in, Not the Dunder</h4>
Write <code>len(deck)</code>, not <code>deck.__len__()</code>. The built-ins are the public interface; dunder methods are the hooks behind them. The only common exception is calling a parent's method, such as <code>super().__init__(...)</code>.`
        }
    ],

    expert: [
        {
            content: `<h3>Why Is len() a Function, Not a Method?</h3>
Java has <code>list.size()</code>, <code>str.length()</code> and <code>array.length</code> - three different spellings. Python has one: <code>len(x)</code> works on every sized object. It is also faster for built-ins: for a <code>list</code> or <code>str</code>, CPython reads the stored length directly from the C struct instead of doing a normal method lookup and call. Your own classes join this uniform interface by defining <code>__len__</code>.`
        },
        {
            content: `<h3>Special Methods Are Looked Up on the Type</h3>
When Python runs <code>len(x)</code>, it looks for <code>__len__</code> on <code>type(x)</code>, <b>not</b> in the instance's own attributes. Assigning a dunder to an instance therefore has no effect on the syntax - only on explicit calls.`,
            codeExamples: [
                `class Box:
    def __len__(self):
        return 3

b = Box()
b.__len__ = lambda: 99           # stored on the instance only

print(len(b))                    # uses type(b).__len__
print(b.__len__())               # explicit attribute lookup finds the instance one

# OUTPUT:
# 3
# 99`
            ]
        },
        {
            content: `<h3>Don't Invent Your Own Dunder Names</h3>
Names of the form <code>__name__</code> are reserved for the language. A future Python version may give <code>__total__</code> or <code>__validate__</code> a special meaning and break your code. Use a single leading underscore (<code>_validate</code>) for internal helpers.<br><br>
(Two leading underscores <b>without</b> trailing ones, like <code>__secret</code>, are something else: name mangling, covered in the OOP module.)`
        },
        {
            content: `<h3>Rest of This Module</h3>
This topic and the next four cover object construction and representation, the container methods and iteration. <code>__eq__</code> &amp; <code>__lt__</code>, operator overloading, <code>__call__</code>, the object model and protocols each have their own topic.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are dunder methods?</td><td>Special methods named <code>__name__</code> that Python calls to implement built-in syntax and functions</td></tr>
<tr class='text-center'><td>Should you call <code>x.__len__()</code> directly?</td><td>No - call <code>len(x)</code>; the built-in may add checks and fast paths</td></tr>
<tr class='text-center'><td>Which two methods make a class behave like a sequence?</td><td><code>__len__</code> and <code>__getitem__</code> - indexing, slicing, iteration, <code>in</code> and <code>reversed()</code> follow</td></tr>
<tr class='text-center'><td>Where does Python look up special methods?</td><td>On the object's type, not on the instance</td></tr>
<tr class='text-center'><td>Why is <code>len</code> a function?</td><td>One uniform interface for all sized objects, with a fast path for built-in types</td></tr>
<tr class='text-center'><td>Can you create your own <code>__xyz__</code> names?</td><td>You can, but shouldn't - they are reserved for the language</td></tr>
</table>`
        }
    ]
};
