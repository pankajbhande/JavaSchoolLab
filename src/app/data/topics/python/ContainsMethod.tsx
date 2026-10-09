import type { Topic } from '../../types';

export const containsMethod: Topic = {
    id: 'python-data-model-contains',
    name: '__contains__',
    beginner: [
        {
            content: `<h4>in Calls __contains__</h4>
<code>item in container</code> is translated to <code>container.__contains__(item)</code>, and <code>item not in container</code> is simply its negation. It is Python's version of Java's <code>collection.contains(item)</code>, but with operator syntax.`,
            codeExamples: [
                `fruits = ["apple", "mango"]

print("mango" in fruits, fruits.__contains__("mango"))
print("kiwi" not in fruits)

# OUTPUT:
# True True
# True`
            ]
        },
        {
            content: `<h4>Defining Your Own Membership Rule</h4>
Here a guest list ignores capitalisation and surrounding spaces.`,
            codeExamples: [
                `class GuestList:
    def __init__(self, names):
        self._names = [n.strip().lower() for n in names]

    def __contains__(self, name):
        return name.strip().lower() in self._names

guests = GuestList(["Asha", "Ravi Kumar"])
print("asha" in guests)
print("  RAVI KUMAR " in guests)
print("Kiran" in guests, "Kiran" not in guests)

# OUTPUT:
# True
# True
# False True`
            ]
        },
        {
            content: `<h4>What If There Is No __contains__?</h4>
Python falls back in this order:<br>
1. <code>__contains__</code>, if defined;<br>
2. otherwise iterate with <code>__iter__</code>, comparing each item with <code>==</code>;<br>
3. otherwise iterate with the old <code>__getitem__</code> protocol (indexes 0, 1, 2 ... until <code>IndexError</code>);<br>
4. otherwise <code>TypeError</code>.`,
            codeExamples: [
                `class Team:
    def __init__(self, members):
        self.members = members

    def __iter__(self):
        return iter(self.members)

t = Team(["asha", "ravi"])
print("ravi" in t)               # found by iterating

class Nothing:
    pass

print(1 in Nothing())

# OUTPUT:
# True
# TypeError: argument of type 'Nothing' is not iterable`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Make Membership O(1)</h3>
The iteration fallback - and a list inside <code>__contains__</code> - checks items one by one: O(n). Keep a <b>set</b> for lookups and membership becomes O(1) on average, while a list can still keep the order.`,
            codeExamples: [
                `class Whitelist:
    def __init__(self, emails):
        self._ordered = list(emails)
        self._lookup = {e.lower() for e in emails}     # for fast membership

    def __contains__(self, email):
        return email.lower() in self._lookup

    def __iter__(self):
        return iter(self._ordered)

wl = Whitelist(["Asha@x.com", "ravi@x.com"])
print("asha@X.COM" in wl, list(wl))

# OUTPUT:
# True ['Asha@x.com', 'ravi@x.com']`
            ]
        },
        {
            content: `<h3>__contains__ Should Agree with __eq__ and Iteration</h3>
Users expect <code>x in c</code> to be true exactly when iterating <code>c</code> would produce something equal to <code>x</code>. A custom rule (like the case-insensitive guest list) is fine, but document it. The return value is converted to <code>bool</code>, so <code>in</code> always gives <code>True</code> or <code>False</code>.`,
            codeExamples: [
                `class Odd:
    def __contains__(self, item):
        return "yes"            # truthy, not a real bool

print(5 in Odd(), 5 not in Odd())

# OUTPUT:
# True False`
            ]
        },
        {
            content: `<h3>in on Built-in Types</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Container</th><th>What <code>in</code> checks</th><th>Cost</th></tr>
<tr class='text-center'><td>list, tuple</td><td>Any item equal to x</td><td>O(n)</td></tr>
<tr class='text-center'><td>str</td><td>Substring</td><td>O(n) roughly</td></tr>
<tr class='text-center'><td>set, frozenset</td><td>Member</td><td>O(1) average</td></tr>
<tr class='text-center'><td>dict</td><td><b>Keys</b> only</td><td>O(1) average</td></tr>
<tr class='text-center'><td>range</td><td>Arithmetic check for ints</td><td>O(1)</td></tr>
</table>`,
            codeExamples: [
                `stock = {"pen": 10, "book": 0}
print("pen" in stock, 10 in stock, 10 in stock.values())
print("ell" in "hello", 99_999_998 in range(0, 10**8, 2))

# OUTPUT:
# True False True
# True True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Which method does <code>in</code> call?</td><td><code>__contains__</code></td></tr>
<tr class='text-center'><td>What if __contains__ is missing?</td><td>Python iterates with __iter__ (then the __getitem__ protocol) comparing with ==; if neither exists, TypeError</td></tr>
<tr class='text-center'><td>How is <code>not in</code> implemented?</td><td>As the negation of __contains__ - there is no separate method</td></tr>
<tr class='text-center'><td>How do you make a custom container's membership test fast?</td><td>Back it with a set or dict so __contains__ is O(1)</td></tr>
<tr class='text-center'><td>What does <code>in</code> check for a dict?</td><td>Its keys</td></tr>
</table>`
        }
    ]
};
