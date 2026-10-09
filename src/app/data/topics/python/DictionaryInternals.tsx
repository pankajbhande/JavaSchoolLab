import type { Topic } from '../../types';

export const dictionaryInternals: Topic = {
    id: 'python-collections-dictionary-internals',
    name: 'Dictionary Internals',
    beginner: [
        {
            content: `<h4>A Dictionary Is a Hash Table</h4>
A dict finds a value without searching through every key. It uses a <b>hash table</b>: an array of slots, where the slot for each key is computed from the key's <b>hash</b> - an integer returned by <code>hash(key)</code>.<br><br>
• Equal values always have equal hashes.<br>
• Within one run of a program, an object's hash never changes.<br>
• Integers hash to themselves (except -1). String hashes are randomised per process, so their numbers differ between runs.`,
            codeExamples: [
                `print(hash(42), hash(True), hash(1.0))
print(hash("python") == hash("python"))    # same value within one run
print(hash((1, 2)) == hash((1, 2)))
print(hash(-1), hash(-2))                  # -1 is reserved internally in CPython

# OUTPUT:
# 42 1 1
# True
# True
# -2 -2`
            ]
        },
        {
            content: `<h4>How a Lookup Works</h4>
For <code>d[key]</code> Python:<br>
1. computes <code>h = hash(key)</code>,<br>
2. turns it into a slot number using the low bits: <code>h &amp; (table_size - 1)</code>,<br>
3. checks the entry in that slot: if it is the same object, or has the same hash and compares equal with <code>==</code>, the value is found,<br>
4. otherwise (a <b>collision</b>) it probes another slot, and repeats until it finds the key or an empty slot (then: <code>KeyError</code>).<br><br>
An illustrative table of 8 slots holding the int keys 10, 3 and 18:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Key</th><th>hash</th><th>hash &amp; 7</th><th>Slot used</th></tr>
<tr class='text-center'><td>10</td><td>10</td><td>2</td><td>2</td></tr>
<tr class='text-center'><td>3</td><td>3</td><td>3</td><td>3</td></tr>
<tr class='text-center'><td>18</td><td>18</td><td>2 (taken by 10)</td><td>probes 3 (taken), then 0</td></tr>
</table>`
        },
        {
            content: `<h4>Why Keys Must Be Hashable</h4>
A key's slot depends on its hash. If a key could change after it was stored, its hash would change too and the dict would look in the wrong slot. So Python only accepts <b>hashable</b> keys - in practice, immutable ones.`,
            codeExamples: [
                `d = {}
d[(1, 2)] = "tuple key works"
d["name"] = "string key works"
print(len(d))

d[[1, 2]] = "list key"

# OUTPUT:
# 2
# TypeError: unhashable type: 'list'`
            ]
        },
        {
            content: `<h4>Performance at a Glance</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>Average</th><th>Worst case</th></tr>
<tr class='text-center'><td><code>d[k]</code>, <code>d[k] = v</code>, <code>del d[k]</code></td><td>O(1)</td><td>O(n)</td></tr>
<tr class='text-center'><td><code>k in d</code></td><td>O(1)</td><td>O(n)</td></tr>
<tr class='text-center'><td><code>v in d.values()</code></td><td>O(n)</td><td>O(n)</td></tr>
<tr class='text-center'><td>Iterating, copying</td><td>O(n)</td><td>O(n)</td></tr>
</table>
The worst case only happens when very many keys collide - which good hash functions (and hash randomisation) make practically impossible by accident.`
        }
    ],

    expert: [
        {
            content: `<h3>The Compact Layout (Python 3.6+)</h3>
Modern CPython splits a dict into two arrays:<br>
• a small, <b>sparse indices</b> array - the actual hash table - whose slots hold positions into...<br>
• a <b>dense entries</b> array of <code>(hash, key, value)</code> rows, appended in insertion order.<br><br>
Iteration simply walks the entries array, which is why dicts keep insertion order. The layout also saves memory: the hash table part holds small integers instead of full entries. Illustrative layout for <code>{"name": "Pankaj", "age": 28, "city": "Pune"}</code> (real slot positions depend on the hashes):
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>indices slot</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
<tr class='text-center'><th>points to entry</th><td>-</td><td>2</td><td>-</td><td>0</td><td>-</td><td>-</td><td>1</td><td>-</td></tr>
</table>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>entry</th><th>hash</th><th>key</th><th>value</th></tr>
<tr class='text-center'><td>0</td><td>hash("name")</td><td>"name"</td><td>"Pankaj"</td></tr>
<tr class='text-center'><td>1</td><td>hash("age")</td><td>"age"</td><td>28</td></tr>
<tr class='text-center'><td>2</td><td>hash("city")</td><td>"city"</td><td>"Pune"</td></tr>
</table>`,
            codeExamples: [
                `d = {"a": 1, "b": 2, "c": 3}

d["b"] = 20              # updating keeps the key's position
print(d)

del d["a"]               # deleting leaves a hole...
d["a"] = 1               # ...and re-adding appends at the end
print(list(d))

# OUTPUT:
# {'a': 1, 'b': 20, 'c': 3}
# ['b', 'c', 'a']`
            ]
        },
        {
            content: `<h3>Probing and Resizing</h3>
• <b>Open addressing</b>: on a collision CPython doesn't chain a linked list (as Java's HashMap does); it computes another slot. The next index mixes in higher bits of the hash: <code>perturb &gt;&gt;= 5; i = (5*i + 1 + perturb) &amp; mask</code>, so keys whose low bits collide still spread out.<br>
• <b>Resizing</b>: a table is only allowed to fill to about <b>2/3</b> of its slots. When that limit is reached, CPython allocates a bigger table (a power of two) and re-inserts every entry. A single resize is O(n), but it happens rarely, so insertion stays O(1) amortised.<br>
• <b>Deletion</b> marks the hash slot as a "dummy" so later probes keep walking past it; the freed space is reclaimed at the next resize.`
        },
        {
            content: `<h3>Equal Keys Must Have Equal Hashes</h3>
The rule is: if <code>a == b</code> then <code>hash(a) == hash(b)</code>. Since <code>1 == 1.0 == True</code> and their hashes match, they are the <b>same key</b>. The first key object inserted is kept; the value is the last one assigned. (The reverse is not required - unequal objects may share a hash; that is just a collision.)`,
            codeExamples: [
                `d = {1: "a", True: "b", 1.0: "c"}
print(d)
print(len(d), d[True], d[1.0])

# OUTPUT:
# {1: 'c'}
# 1 c c`
            ]
        },
        {
            content: `<h3>Hash Randomisation and Hash Flooding</h3>
If an attacker can predict string hashes, they can send thousands of keys that all land in the same slot (e.g. as web form fields), turning each O(1) insert into O(n) and the whole request into O(n²) - a <b>hash-flooding</b> denial-of-service attack. Since Python 3.3, <code>str</code> and <code>bytes</code> hashes are salted with a random value per process (and since 3.4 use SipHash, PEP 456). <code>PYTHONHASHSEED</code> fixes the seed for reproducible debugging - never rely on it in production.`,
            codeExamples: [
                `# Run the same command twice in a terminal:
python -c "print(hash('python'))"
python -c "print(hash('python'))"
# -> two different numbers: string hashes are randomised per process

# With a fixed seed (macOS / Linux syntax):
PYTHONHASHSEED=0 python -c "print(hash('python'))"
# -> the same number on every run`
            ]
        },
        {
            content: `<h3>Your Own Classes as Keys</h3>
By default an object hashes and compares by <b>identity</b>, so two "equal-looking" objects are different keys. Defining <code>__eq__</code> without <code>__hash__</code> sets <code>__hash__</code> to <code>None</code>, making the class unhashable. Define both from the same <b>immutable</b> fields - or let a frozen dataclass generate them.`,
            codeExamples: [
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

d = {Point(1, 2): "A"}
print(Point(1, 2) in d)          # identity-based: a different object

# OUTPUT:
# False`,
                `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        return isinstance(other, Point) and (self.x, self.y) == (other.x, other.y)

print(Point(1, 2) == Point(1, 2))
d = {Point(1, 2): "A"}

# OUTPUT:
# True
# TypeError: unhashable type: 'Point'`,
                `from dataclasses import dataclass

@dataclass(frozen=True)          # generates __eq__ and __hash__, blocks mutation
class Point:
    x: int
    y: int

d = {Point(1, 2): "A"}
print(d[Point(1, 2)], hash(Point(1, 2)) == hash(Point(1, 2)))

# OUTPUT:
# A True`
            ]
        },
        {
            content: `<h3>The Mutable-Key Bug</h3>
If a key's hash depends on a field you change after insertion, the entry is stranded: lookups go to the slot for the new hash, and the old slot's key no longer compares equal to the old value. The entry is still in the dict but can't be found.`,
            codeExamples: [
                `class Key:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        return isinstance(other, Key) and self.value == other.value

    def __hash__(self):
        return hash(self.value)

k = Key(1)
d = {k: "data"}
k.value = 2                      # the hash changes after insertion

print(k in d)                    # looks in the slot for hash(2)
print(Key(1) in d)               # right slot, but == now fails
print(len(d), list(d)[0].value)  # the entry is still there

# OUTPUT:
# False
# False
# 1 2`
            ]
        },
        {
            content: `<h3>Key-Sharing Dictionaries for Objects</h3>
Every instance stores its attributes in a dict (<code>obj.__dict__</code>). Since PEP 412 (Python 3.3), instances of the same class can <b>share one keys table</b> and store only their own values, which cuts memory when you create many objects. Sharing works best when every instance sets the same attributes in the same order, typically all in <code>__init__</code>; adding attributes ad hoc later can break it. Newer CPython versions go further and store the values inline in the object. <code>__slots__</code> removes the per-instance dict altogether.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How is a Python dict implemented?</td><td>As an open-addressing hash table: a sparse indices array plus a dense entries array kept in insertion order</td></tr>
<tr class='text-center'><td>Why are dicts ordered since 3.6/3.7?</td><td>Entries are appended to a dense array and iteration walks that array; 3.7 made the order a language guarantee</td></tr>
<tr class='text-center'><td>Time complexity of a lookup?</td><td>O(1) average, O(n) worst case when many keys collide</td></tr>
<tr class='text-center'><td>What is the hash/eq contract?</td><td>If a == b then hash(a) must equal hash(b); unequal objects may still collide</td></tr>
<tr class='text-center'><td>Why is a class with only <code>__eq__</code> unhashable?</td><td>Defining __eq__ sets __hash__ to None, because the inherited identity hash would break the contract</td></tr>
<tr class='text-center'><td>When does a dict resize?</td><td>When it is about 2/3 full; it allocates a larger power-of-two table and re-inserts entries (amortised O(1) inserts)</td></tr>
<tr class='text-center'><td>Why are string hashes randomised?</td><td>To prevent hash-flooding denial-of-service attacks that force many collisions</td></tr>
</table>`
        }
    ]
};
