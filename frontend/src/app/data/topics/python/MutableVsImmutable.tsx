import type { Topic } from '../../types';

export const mutableVsImmutable: Topic = {
    id: 'python-basics-mutable-vs-immutable-objects',
    name: 'Mutable vs Immutable Objects',
    beginner: [
        {
            content: `<h4>What Do Mutable and Immutable Mean?</h4>
• A <b>mutable</b> object can be changed after it is created - you can add, remove or replace its contents.<br>
• An <b>immutable</b> object can never change. Any operation that looks like a change actually produces a <b>new</b> object.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Immutable</th><th>Mutable</th></tr>
<tr class='text-center'><td>int, float, complex, bool</td><td>list</td></tr>
<tr class='text-center'><td>str</td><td>dict</td></tr>
<tr class='text-center'><td>tuple</td><td>set</td></tr>
<tr class='text-center'><td>frozenset, bytes, None</td><td>bytearray, most user-defined objects</td></tr>
</table>`
        },
        {
            content: `<h4>Changing a List vs "Changing" a String</h4>`,
            codeExamples: [
                `subjects = ["Maths", "Physics"]
subjects.append("Chemistry")     # modifies the same list
subjects[0] = "Biology"
print(subjects)

name = "pankaj"
upper_name = name.upper()        # returns a NEW string
print(name, upper_name)

# OUTPUT:
# ['Biology', 'Physics', 'Chemistry']
# pankaj PANKAJ`
            ]
        },
        {
            content: `<h4>Tuples Cannot Be Changed</h4>
A tuple is like a list that has been locked. Use tuples for fixed groups of values such as coordinates or RGB colours.`,
            codeExamples: [
                `point = (10, 20)
print(point[0])
point[0] = 99

# OUTPUT:
# 10
# TypeError: 'tuple' object does not support item assignment`
            ]
        },
        {
            content: `<h4>Why It Matters: Shared References</h4>
When two names refer to the same <b>mutable</b> object, a change through one is visible through the other. With immutable objects this can never happen, because they can't be changed at all.`,
            codeExamples: [
                `a = [1, 2, 3]
b = a
b.append(4)
print(a)            # a sees the change

x = 10
y = x
y = y + 1           # creates a new int; x is untouched
print(x, y)

# OUTPUT:
# [1, 2, 3, 4]
# 10 11`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Mutable Default Argument Bug</h3>
Default argument values are evaluated <b>once</b>, when the <code>def</code> statement runs - not on every call. A mutable default (list, dict, set) is therefore shared by all calls. This is one of the most asked Python interview questions.`,
            codeExamples: [
                `def add_item(item, cart=[]):        # BUG
    cart.append(item)
    return cart

print(add_item("pen"))
print(add_item("book"))             # the old "pen" is still there!

def add_item_fixed(item, cart=None):
    if cart is None:
        cart = []                   # fresh list on every call
    cart.append(item)
    return cart

print(add_item_fixed("pen"))
print(add_item_fixed("book"))

# OUTPUT:
# ['pen']
# ['pen', 'book']
# ['pen']
# ['book']`
            ]
        },
        {
            content: `<h3><code>+=</code> Behaves Differently</h3>
For a list, <code>+=</code> modifies the existing object in place (it calls <code>__iadd__</code>). For immutable types it creates a new object and rebinds the name. The difference shows when another name shares the object.`,
            codeExamples: [
                `a = [1, 2]
b = a
a += [3]            # in place - b sees it
print(b)

a = [1, 2]
b = a
a = a + [3]         # new list - b does not see it
print(b)

s = "hi"
t = s
s += "!"            # strings: always a new object
print(t)

# OUTPUT:
# [1, 2, 3]
# [1, 2]
# hi`
            ]
        },
        {
            content: `<h3>Immutable Containers Can Hold Mutable Objects</h3>
A tuple's immutability is <b>shallow</b>: you can't replace its items, but if an item is a list, the list itself can still change. Such a tuple is also no longer hashable.`,
            codeExamples: [
                `record = ("Sheru", [80, 90])
record[1].append(100)          # allowed - the list is mutable
print(record)

print(hash(("Sheru", 80)))     # fine (value varies by run)
print(hash(record))

# OUTPUT:
# ('Sheru', [80, 90, 100])
# -3189123456789012345
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h3>Hashability: Why Dict Keys Must Be Immutable</h3>
Dictionaries and sets locate items by their <b>hash</b>. If a key could change after insertion, its hash would change and the entry would be lost. So keys and set members must be hashable - in practice, immutable. Use a tuple instead of a list, or a <code>frozenset</code> instead of a set.`,
            codeExamples: [
                `distances = {("Pune", "Mumbai"): 150}
print(distances[("Pune", "Mumbai")])

visited = {frozenset({"a", "b"})}
print(frozenset({"b", "a"}) in visited)

bad = {["Pune", "Mumbai"]: 150}

# OUTPUT:
# 150
# True
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Name mutable and immutable built-in types</td><td>Immutable: int, float, bool, str, tuple, frozenset, bytes. Mutable: list, dict, set, bytearray</td></tr>
<tr class='text-center'><td>Why are mutable default arguments dangerous?</td><td>Defaults are evaluated once at definition time, so every call shares and mutates the same object - use None as the default instead</td></tr>
<tr class='text-center'><td>Can a tuple change?</td><td>Its slots can't be reassigned, but mutable objects inside it can change</td></tr>
<tr class='text-center'><td>Why can't a list be a dict key?</td><td>Lists are mutable and therefore unhashable - a changed key would corrupt the dict's hash table</td></tr>
<tr class='text-center'><td><code>a += [x]</code> vs <code>a = a + [x]</code>?</td><td>For lists, <code>+=</code> mutates in place; <code>a + [x]</code> creates a new list and rebinds a</td></tr>
<tr class='text-center'><td>Why are strings immutable?</td><td>Safety when shared, hashability (usable as dict keys), and enabling optimisations such as interning</td></tr>
</table>`
        }
    ]
};
