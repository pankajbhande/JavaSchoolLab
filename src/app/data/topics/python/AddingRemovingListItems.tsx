import type { Topic } from '../../types';

export const addingRemovingListItems: Topic = {
    id: 'python-collections-adding-removing-list-items',
    name: 'Adding & Removing List Items',
    beginner: [
        {
            content: `<h4>Adding Items</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>What it does</th></tr>
<tr class='text-center'><td><code>append(x)</code></td><td>Adds one item at the end</td></tr>
<tr class='text-center'><td><code>extend(iterable)</code></td><td>Adds every item of another iterable at the end</td></tr>
<tr class='text-center'><td><code>insert(i, x)</code></td><td>Inserts x before position i</td></tr>
</table>
All three change the list <b>in place</b> and return <code>None</code>.`,
            codeExamples: [
                `cart = ["pen"]

cart.append("notebook")
print(cart)

cart.extend(["eraser", "ruler"])
print(cart)

cart.insert(0, "bag")           # at the front
cart.insert(2, "pencil")
print(cart)

# OUTPUT:
# ['pen', 'notebook']
# ['pen', 'notebook', 'eraser', 'ruler']
# ['bag', 'pen', 'pencil', 'notebook', 'eraser', 'ruler']`
            ]
        },
        {
            content: `<h4>append() vs extend()</h4>
<code>append</code> adds its argument as <b>one</b> item, even if it is a list. <code>extend</code> loops over its argument and adds each element.`,
            codeExamples: [
                `a = [1, 2]
a.append([3, 4])
print(a, len(a))

b = [1, 2]
b.extend([3, 4])
print(b, len(b))

c = ["x"]
c.extend("hi")                  # a string is iterable too!
print(c)

# OUTPUT:
# [1, 2, [3, 4]] 3
# [1, 2, 3, 4] 4
# ['x', 'h', 'i']`
            ]
        },
        {
            content: `<h4>Removing Items</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Way</th><th>Removes</th><th>Returns</th></tr>
<tr class='text-center'><td><code>remove(x)</code></td><td>The first item equal to x</td><td>None</td></tr>
<tr class='text-center'><td><code>pop()</code></td><td>The last item</td><td>The removed item</td></tr>
<tr class='text-center'><td><code>pop(i)</code></td><td>The item at index i</td><td>The removed item</td></tr>
<tr class='text-center'><td><code>del a[i]</code> / <code>del a[i:j]</code></td><td>Item or slice by position</td><td>-</td></tr>
<tr class='text-center'><td><code>clear()</code></td><td>Everything</td><td>None</td></tr>
</table>`,
            codeExamples: [
                `items = ["pen", "ink", "pen", "pad", "clip", "tape"]

items.remove("pen")             # only the FIRST "pen"
print(items)

last = items.pop()
print(last, items)

second = items.pop(1)
print(second, items)

del items[0]
print(items)

items.clear()
print(items)

# OUTPUT:
# ['ink', 'pen', 'pad', 'clip', 'tape']
# tape ['ink', 'pen', 'pad', 'clip']
# pen ['ink', 'pad', 'clip']
# ['pad', 'clip']
# []`
            ]
        },
        {
            content: `<h4>Errors to Expect</h4>`,
            codeExamples: [
                `nums = [1, 2, 3]
nums.remove(10)

# OUTPUT:
# ValueError: list.remove(x): x not in list`,
                `empty = []
empty.pop()

# OUTPUT:
# IndexError: pop from empty list`,
                `nums = [1, 2, 3]
if 10 in nums:                  # check first to avoid the ValueError
    nums.remove(10)
print(nums)

# OUTPUT:
# [1, 2, 3]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Cost of Each Operation</h3>
Lists are arrays, so working at the <b>end</b> is cheap and working at the <b>front</b> is expensive.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>Complexity</th></tr>
<tr class='text-center'><td><code>append(x)</code>, <code>pop()</code></td><td>O(1) amortised</td></tr>
<tr class='text-center'><td><code>extend(k items)</code></td><td>O(k)</td></tr>
<tr class='text-center'><td><code>insert(0, x)</code>, <code>pop(0)</code></td><td>O(n) - everything shifts</td></tr>
<tr class='text-center'><td><code>remove(x)</code>, <code>x in list</code></td><td>O(n) - linear search</td></tr>
<tr class='text-center'><td><code>del a[i]</code></td><td>O(n - i)</td></tr>
</table>
For a queue (add at one end, remove from the other) use <code>collections.deque</code>, which is O(1) at both ends.`,
            codeExamples: [
                `from collections import deque

queue = deque(["A", "B"])
queue.append("C")               # join at the back
queue.appendleft("VIP")         # O(1) at the front too
print(queue.popleft(), queue.popleft())
print(queue)

# OUTPUT:
# VIP A
# deque(['B', 'C'])`
            ]
        },
        {
            content: `<h3>Removing All Occurrences</h3>
<code>remove()</code> deletes only the first match. Calling it in a <code>while</code> loop works but is O(n²). A comprehension builds the filtered list in one O(n) pass; slice assignment keeps the same list object if other code holds a reference to it.`,
            codeExamples: [
                `data = [3, 1, 3, 2, 3, 4]

slow = data.copy()
while 3 in slow:
    slow.remove(3)
print(slow)

data[:] = [x for x in data if x != 3]   # in place, O(n)
print(data)

# OUTPUT:
# [1, 2, 4]
# [1, 2, 4]`
            ]
        },
        {
            content: `<h3><code>+</code> vs <code>+=</code> vs <code>extend</code></h3>
<code>a + b</code> builds a <b>new</b> list and requires both sides to be lists. <code>a += b</code> and <code>a.extend(b)</code> modify <code>a</code> in place and accept any iterable.`,
            codeExamples: [
                `a = [1, 2]
b = a
a += (3, 4)                    # in place, tuple accepted
print(a, b is a)

c = [1, 2]
c = c + [3]                    # new list
print(c)

print([1, 2] + (3, 4))

# OUTPUT:
# [1, 2, 3, 4] True
# [1, 2, 3]
# TypeError: can only concatenate list (not "tuple") to list`
            ]
        },
        {
            content: `<h3>insert() Never Fails on Index</h3>
Out-of-range indexes are clamped: a large index appends, a very negative one inserts at the front. Negative indexes insert <b>before</b> that position.`,
            codeExamples: [
                `a = [1, 2, 3]
a.insert(100, "end")
a.insert(-100, "start")
a.insert(-1, "before last")
print(a)

# OUTPUT:
# ['start', 1, 2, 3, 'before last', 'end']`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>append vs extend?</td><td>append adds one object; extend adds each element of an iterable</td></tr>
<tr class='text-center'><td>remove vs pop vs del?</td><td>remove deletes by value (first match); pop deletes by index and returns the item; del deletes by index or slice</td></tr>
<tr class='text-center'><td>Why is <code>pop(0)</code> slow?</td><td>Every remaining element shifts left - O(n); use deque.popleft()</td></tr>
<tr class='text-center'><td>What does <code>append()</code> return?</td><td>None - so <code>a = a.append(x)</code> loses the list</td></tr>
<tr class='text-center'><td>How do you remove all occurrences of a value?</td><td><code>a[:] = [x for x in a if x != value]</code></td></tr>
</table>`
        }
    ]
};
