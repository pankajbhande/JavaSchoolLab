import type { Topic } from '../../types';

export const dictionaryMethods: Topic = {
    id: 'python-collections-dictionary-methods',
    name: 'Dictionary Methods',
    beginner: [
        {
            content: `<h4>Method Reference</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>What it does</th></tr>
<tr class='text-center'><td><code>get(k, default=None)</code></td><td>Value for k, or default if missing</td></tr>
<tr class='text-center'><td><code>keys()</code>, <code>values()</code>, <code>items()</code></td><td>Views of the keys, values, and (key, value) pairs</td></tr>
<tr class='text-center'><td><code>update(other)</code></td><td>Add/overwrite pairs from another dict or pairs</td></tr>
<tr class='text-center'><td><code>pop(k, default)</code></td><td>Remove k and return its value</td></tr>
<tr class='text-center'><td><code>popitem()</code></td><td>Remove and return the last inserted pair</td></tr>
<tr class='text-center'><td><code>setdefault(k, default)</code></td><td>Return d[k]; if missing, first insert k with default</td></tr>
<tr class='text-center'><td><code>copy()</code></td><td>Shallow copy</td></tr>
<tr class='text-center'><td><code>clear()</code></td><td>Remove everything</td></tr>
<tr class='text-center'><td><code>dict.fromkeys(keys, value)</code></td><td>New dict with every key set to value</td></tr>
</table>`
        },
        {
            content: `<h4>keys(), values() and items()</h4>`,
            codeExamples: [
                `marks = {"Asha": 91, "Ravi": 78, "Kiran": 85}

print(list(marks.keys()))
print(list(marks.values()))
print(list(marks.items()))
print(max(marks.values()), sum(marks.values()) / len(marks))

# OUTPUT:
# ['Asha', 'Ravi', 'Kiran']
# [91, 78, 85]
# [('Asha', 91), ('Ravi', 78), ('Kiran', 85)]
# 91 84.66666666666667`
            ]
        },
        {
            content: `<h4>update(), pop() and popitem()</h4>`,
            codeExamples: [
                `settings = {"theme": "light", "font": 14}

settings.update({"theme": "dark", "lang": "en"})
print(settings)

font = settings.pop("font")
missing = settings.pop("zoom", 100)      # default avoids KeyError
print(font, missing, settings)

last = settings.popitem()                # last inserted pair
print(last, settings)

# OUTPUT:
# {'theme': 'dark', 'font': 14, 'lang': 'en'}
# 14 100 {'theme': 'dark', 'lang': 'en'}
# ('lang', 'en') {'theme': 'dark'}`
            ]
        },
        {
            content: `<h4>setdefault()</h4>
<code>setdefault</code> returns the existing value, or inserts the default and returns that. It is ideal for building lists of grouped items.`,
            codeExamples: [
                `cart = {"pen": 2}

print(cart.setdefault("pen", 0))     # exists - returns 2, no change
print(cart.setdefault("book", 1))    # missing - inserts 1
print(cart)

orders = [("Asha", "pen"), ("Ravi", "bag"), ("Asha", "book")]
by_customer = {}
for name, item in orders:
    by_customer.setdefault(name, []).append(item)
print(by_customer)

# OUTPUT:
# 2
# 1
# {'pen': 2, 'book': 1}
# {'Asha': ['pen', 'book'], 'Ravi': ['bag']}`
            ]
        },
        {
            content: `<h4>Merging with | (Python 3.9+)</h4>
<code>a | b</code> returns a new merged dict; <code>a |= b</code> updates <code>a</code>. When both have a key, the right-hand value wins.`,
            codeExamples: [
                `defaults = {"theme": "light", "font": 14}
user = {"theme": "dark"}

print(defaults | user)
print(user | defaults)

# OUTPUT:
# {'theme': 'dark', 'font': 14}
# {'theme': 'light', 'font': 14}`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Views Are Live</h3>
<code>keys()</code>, <code>values()</code> and <code>items()</code> return <b>views</b>, not copies. They always reflect the dict's current contents and use no extra memory. Key and item views also support set operations.`,
            codeExamples: [
                `stock = {"pen": 10}
keys = stock.keys()
print(keys)

stock["book"] = 4
print(keys)                  # updated automatically
print(keys & {"book", "bag"})

# OUTPUT:
# dict_keys(['pen'])
# dict_keys(['pen', 'book'])
# {'book'}`
            ]
        },
        {
            content: `<h3>The fromkeys() Shared-Value Trap</h3>
<code>dict.fromkeys(keys, value)</code> uses the <b>same</b> value object for every key. With a mutable value such as a list, all keys share one list. Use a comprehension instead.`,
            codeExamples: [
                `bad = dict.fromkeys(["a", "b"], [])
bad["a"].append(1)
print(bad)

good = {k: [] for k in ["a", "b"]}
good["a"].append(1)
print(good)

# OUTPUT:
# {'a': [1], 'b': [1]}
# {'a': [1], 'b': []}`
            ]
        },
        {
            content: `<h3>Sorting and Inverting Dictionaries</h3>`,
            codeExamples: [
                `marks = {"Asha": 91, "Ravi": 78, "Kiran": 85}

by_score = dict(sorted(marks.items(), key=lambda kv: kv[1], reverse=True))
print(by_score)
print(max(marks, key=marks.get))           # key with the highest value

inverted = {v: k for k, v in marks.items()}
print(inverted[85])

# OUTPUT:
# {'Asha': 91, 'Kiran': 85, 'Ravi': 78}
# Asha
# Kiran`
            ]
        },
        {
            content: `<h3>get() vs setdefault() vs defaultdict</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Tool</th><th>Inserts missing keys?</th><th>Best for</th></tr>
<tr class='text-center'><td><code>d.get(k, default)</code></td><td>No</td><td>Reading with a fallback</td></tr>
<tr class='text-center'><td><code>d.setdefault(k, default)</code></td><td>Yes, on first access</td><td>One-off grouping in a plain dict</td></tr>
<tr class='text-center'><td><code>defaultdict(factory)</code></td><td>Yes, on any <code>d[k]</code> read</td><td>Heavy grouping/counting code</td></tr>
</table>
Note that <code>setdefault(k, [])</code> builds a new empty list on <b>every</b> call, even when the key exists; <code>defaultdict</code> only calls its factory when needed.`
        },
        {
            content: `<h3>popitem() Is LIFO</h3>
Since Python 3.7 <code>popitem()</code> removes the most recently inserted pair, so a dict can act as a simple stack of key-value pairs. It raises <code>KeyError</code> on an empty dict.`,
            codeExamples: [
                `history = {}
history["page1"] = "Home"
history["page2"] = "Cart"
print(history.popitem(), history.popitem())
history.popitem()

# OUTPUT:
# ('page2', 'Cart') ('page1', 'Home')
# KeyError: 'popitem(): dictionary is empty'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What do keys(), values(), items() return?</td><td>Dynamic view objects that reflect later changes to the dict</td></tr>
<tr class='text-center'><td>How do you merge two dicts?</td><td><code>a | b</code> (3.9+), <code>{**a, **b}</code>, or <code>a.update(b)</code> in place - the right side wins</td></tr>
<tr class='text-center'><td>How do you sort a dict by value?</td><td><code>dict(sorted(d.items(), key=lambda kv: kv[1]))</code></td></tr>
<tr class='text-center'><td>What does setdefault do?</td><td>Returns the value for a key, inserting a default first if the key is missing</td></tr>
<tr class='text-center'><td>What's wrong with <code>dict.fromkeys(keys, [])</code>?</td><td>Every key shares the same list object</td></tr>
<tr class='text-center'><td>How do you find the key with the largest value?</td><td><code>max(d, key=d.get)</code></td></tr>
</table>`
        }
    ]
};
