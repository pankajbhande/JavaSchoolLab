import type { Topic } from '../../types';

export const anyAllSorted: Topic = {
    id: 'python-functions-any-all-sorted',
    name: 'any(), all() & sorted()',
    beginner: [
        {
            content: `<h4>any() and all()</h4>
• <code>any(iterable)</code> - <code>True</code> if <b>at least one</b> item is truthy.<br>
• <code>all(iterable)</code> - <code>True</code> if <b>every</b> item is truthy.<br><br>
They replace loops that set a flag variable, and read almost like English.`,
            codeExamples: [
                `print(any([0, "", None]), any([0, 5]))
print(all([1, "a", [0]]), all([1, 0]))

# OUTPUT:
# False True
# True False`
            ]
        },
        {
            content: `<h4>With Conditions (Generator Expressions)</h4>
Usually you test a condition on each item. Put a generator expression inside the call - no extra brackets needed.`,
            codeExamples: [
                `marks = [72, 35, 88, 19]

print(any(m < 40 for m in marks))       # did anyone fail?
print(all(m >= 40 for m in marks))      # did everyone pass?

password = "Pyth0n!"
checks = [
    len(password) >= 8,
    any(c.isdigit() for c in password),
    any(c.isupper() for c in password),
]
print(checks, all(checks))

# OUTPUT:
# True
# False
# [False, True, True] False`
            ]
        },
        {
            content: `<h4>Empty Iterables</h4>
<code>any([])</code> is <code>False</code> - there is no item that is true. <code>all([])</code> is <code>True</code> - there is no item that is false. This is called <b>vacuous truth</b>: "every student in an empty class passed" is technically true. Guard against it when an empty input should fail.`,
            codeExamples: [
                `print(any([]), all([]))

orders = []
print(all(o["paid"] for o in orders))                 # True - but nothing was paid!
print(bool(orders) and all(o["paid"] for o in orders))

# OUTPUT:
# False True
# True
# False`
            ]
        },
        {
            content: `<h4>sorted() - A New Sorted List from Any Iterable</h4>
<code>sorted()</code> accepts lists, tuples, strings, sets, dictionaries and more, always returns a <b>new list</b>, and leaves the original unchanged. <code>key=</code> and <code>reverse=</code> work as in <code>list.sort()</code>.`,
            codeExamples: [
                `nums = [5, 2, 9]
print(sorted(nums), sorted(nums, reverse=True), nums)
print(sorted("banana"))                 # characters
print(sorted({"b": 2, "a": 1}))         # a dict gives its keys
print(sorted({3, 1, 2}))                # a set
print(sorted(["kiwi", "fig", "banana"], key=len))

# OUTPUT:
# [2, 5, 9] [9, 5, 2] [5, 2, 9]
# ['a', 'a', 'a', 'b', 'n', 'n']
# ['a', 'b']
# [1, 2, 3]
# ['fig', 'kiwi', 'banana']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Short-Circuiting</h3>
<code>any</code> stops at the first truthy item and <code>all</code> at the first falsy one. With a <b>generator expression</b> the remaining items are never even computed. With a <b>list comprehension</b> inside, every item is computed first - so leave out the square brackets.`,
            codeExamples: [
                `def check(n):
    print("checking", n)
    return n > 10

print(any(check(n) for n in [3, 15, 7, 20]))     # stops at 15
print(all(check(n) for n in [20, 5, 30]))        # stops at 5
print(any([check(n) for n in [3, 15]]))          # list: checks everything first

# OUTPUT:
# checking 3
# checking 15
# True
# checking 20
# checking 5
# False
# checking 3
# checking 15
# True`
            ]
        },
        {
            content: `<h3>any/all Return Booleans, or/and Return Operands</h3>
<code>any</code> and <code>all</code> always return <code>True</code> or <code>False</code>. The operators <code>or</code> and <code>and</code> return one of the actual operands.`,
            codeExamples: [
                `print(any([0, "hi", 5]), 0 or "hi" or 5)
print(all([3, 4]), 3 and 4)

# OUTPUT:
# True hi
# True 4`
            ]
        },
        {
            content: `<h3>Need the Item, Not Just True/False? Use next()</h3>
<code>any</code> only tells you <i>whether</i> something matches. To get the first matching item, use <code>next()</code> on a generator, with a default for "not found".`,
            codeExamples: [
                `orders = [
    {"id": 1, "status": "paid"},
    {"id": 2, "status": "pending"},
    {"id": 3, "status": "pending"},
]

print(any(o["status"] == "pending" for o in orders))
print(next((o for o in orders if o["status"] == "pending"), None))
print(next((o for o in orders if o["status"] == "refunded"), None))

# OUTPUT:
# True
# {'id': 2, 'status': 'pending'}
# None`
            ]
        },
        {
            content: `<h3>min() and max() with key and default</h3>
Like <code>sorted</code>, <code>min</code> and <code>max</code> accept <code>key=</code>. On ties they return the <b>first</b> best item. On an empty iterable they raise <code>ValueError</code> unless you pass <code>default=</code>.`,
            codeExamples: [
                `words = ["kiwi", "banana", "fig", "cherry"]
print(max(words, key=len))              # "banana" and "cherry" tie - first wins
print(min(words, key=len))

scores = {"Abaji": 91, "Raoji": 78, "Kanhoji": 85}
print(max(scores, key=scores.get))      # key with the highest value

print(max([], default=0))

# OUTPUT:
# banana
# fig
# Abaji
# 0`
            ]
        },
        {
            content: `<h3>Sorting Dictionaries and Records</h3>
Sorting is covered in depth in <i>List Methods: sort(), reverse() &amp; More</i> (stability, multi-key sorting). The same <code>key</code> functions work with <code>sorted()</code> on any iterable - including dictionary items.`,
            codeExamples: [
                `scores = {"Abaji": 91, "Raoji": 78, "Kanhoji": 85}

print(sorted(scores.items(), key=lambda kv: kv[1], reverse=True))
print(sorted(scores, key=scores.get))

students = [("Raoji", "CSE", 78), ("Abaji", "ECE", 91), ("Kanhoji", "CSE", 85)]
print(sorted(students, key=lambda s: (s[1], -s[2])))   # branch, then marks high-low

# OUTPUT:
# [('Abaji', 91), ('Kanhoji', 85), ('Raoji', 78)]
# ['Raoji', 'Kanhoji', 'Abaji']
# [('Kanhoji', 'CSE', 85), ('Raoji', 'CSE', 78), ('Abaji', 'ECE', 91)]`
            ]
        },
        {
            content: `<h3>Top-k Without Sorting Everything: heapq</h3>
To get only the k largest or smallest items, <code>heapq.nlargest</code> / <code>nsmallest</code> run in O(n log k) instead of sorting all n items in O(n log n).`,
            codeExamples: [
                `import heapq

nums = [5, 1, 8, 3, 9, 2]
print(heapq.nlargest(2, nums))
print(heapq.nsmallest(3, nums))

products = [{"name": "Pen", "price": 10}, {"name": "Bag", "price": 900}, {"name": "Book", "price": 250}]
print([p["name"] for p in heapq.nlargest(2, products, key=lambda p: p["price"])])

# OUTPUT:
# [9, 8]
# [1, 2, 3]
# ['Bag', 'Book']`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What do <code>any([])</code> and <code>all([])</code> return?</td><td>False and True - all() of an empty iterable is vacuously true</td></tr>
<tr class='text-center'><td>Do any/all short-circuit?</td><td>Yes - any stops at the first truthy item, all at the first falsy one (when given a generator)</td></tr>
<tr class='text-center'><td>Why pass a generator rather than a list to any()?</td><td>A list computes every item first; a generator lets any() stop early and uses no extra memory</td></tr>
<tr class='text-center'><td>How do you get the first matching item?</td><td><code>next((x for x in items if cond(x)), default)</code></td></tr>
<tr class='text-center'><td>sorted() vs list.sort()?</td><td>sorted() takes any iterable and returns a new list; sort() sorts a list in place and returns None</td></tr>
<tr class='text-center'><td>How do you find the 3 largest items efficiently?</td><td><code>heapq.nlargest(3, items)</code> - O(n log k)</td></tr>
</table>`
        }
    ]
};
