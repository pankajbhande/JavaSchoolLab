import type { Topic } from '../../types';

export const boolAndNone: Topic = {
    id: 'python-basics-bool-none',
    name: 'bool & None',
    beginner: [
        {
            content: `<h4>The bool Type</h4>
<code>bool</code> has exactly two values: <code>True</code> and <code>False</code> - note the capital letters. Comparisons produce booleans, and <code>if</code> / <code>while</code> use them to make decisions.`,
            codeExamples: [
                `is_logged_in = True
marks = 35

passed = marks >= 40
print(passed, type(passed))

if is_logged_in and not passed:
    print("Please retake the exam")

# OUTPUT:
# False <class 'bool'>
# Please retake the exam`
            ]
        },
        {
            content: `<h4>Truthy and Falsy Values</h4>
Any object can be used where a boolean is expected. These values count as <b>False</b> ("falsy"); <b>everything else is True</b> ("truthy"):<br><br>
• <code>False</code> and <code>None</code><br>
• zero of any number type: <code>0</code>, <code>0.0</code>, <code>0j</code><br>
• empty containers: <code>""</code>, <code>[]</code>, <code>()</code>, <code>{}</code>, <code>set()</code>, <code>range(0)</code>`,
            codeExamples: [
                `print(bool(0), bool(42), bool(-1))
print(bool(""), bool(" "), bool("False"))
print(bool([]), bool([0]))

cart = []
if not cart:                 # Pythonic emptiness check
    print("Your cart is empty")

# OUTPUT:
# False True True
# False True True
# False True
# Your cart is empty`
            ]
        },
        {
            content: `<h4>What is None?</h4>
<code>None</code> represents "no value" or "nothing here yet" - similar to Java's <code>null</code>. It is the only value of type <code>NoneType</code>. A function without a <code>return</code> statement returns <code>None</code>.`,
            codeExamples: [
                `middle_name = None

def greet(name):
    print("Hello", name)      # no return statement

result = greet("Sheru")
print(result)
print(type(None))

# OUTPUT:
# Hello Sheru
# None
# <class 'NoneType'>`
            ]
        },
        {
            content: `<h4>Checking for None</h4>
Always test for <code>None</code> with <code>is</code> / <code>is not</code>. There is only one <code>None</code> object in the whole program, so an identity check is exact.`,
            codeExamples: [
                `discount = None

if discount is None:
    print("No discount applied")

discount = 0
if discount is not None:
    print("Discount is", discount)

# OUTPUT:
# No discount applied
# Discount is 0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>bool Is a Subclass of int</h3>
For historical reasons <code>True</code> and <code>False</code> are the integers 1 and 0 in disguise. This is handy for counting, but it also means a bool passes an <code>isinstance(x, int)</code> check.`,
            codeExamples: [
                `print(issubclass(bool, int))
print(True + True, True * 10)
print(isinstance(True, int))

results = [True, False, True, True]
print(sum(results), "passed")      # counting with sum()

# OUTPUT:
# True
# 2 10
# True
# 3 passed`
            ]
        },
        {
            content: `<h3>The "if not x" Trap with 0 and None</h3>
<code>if not value</code> treats <code>None</code>, <code>0</code> and <code>""</code> the same. When 0 or an empty string is a <b>valid</b> value, test for <code>None</code> explicitly.`,
            codeExamples: [
                `def show_stock(qty):
    if not qty:                    # bug: 0 is treated as "unknown"
        print("Stock unknown")
    else:
        print("In stock:", qty)

def show_stock_fixed(qty):
    if qty is None:
        print("Stock unknown")
    else:
        print("In stock:", qty)

show_stock(0)
show_stock_fixed(0)

# OUTPUT:
# Stock unknown
# In stock: 0`
            ]
        },
        {
            content: `<h3>Customising Truthiness</h3>
<code>bool(obj)</code> calls the object's <code>__bool__()</code> method; if that is missing it falls back to <code>__len__()</code> (zero length = False); if both are missing the object is always True.`,
            codeExamples: [
                `class Wallet:
    def __init__(self, balance):
        self.balance = balance

    def __bool__(self):
        return self.balance > 0

print(bool(Wallet(500)), bool(Wallet(0)))

if not Wallet(0):
    print("Wallet is empty")

# OUTPUT:
# True False
# Wallet is empty`
            ]
        },
        {
            content: `<h3>Why <code>is None</code> and Not <code>== None</code></h3>
<code>==</code> calls <code>__eq__</code>, which any class can override - even to claim it equals None. <code>is</code> compares identity and cannot be fooled. It is also slightly faster and is what PEP 8 requires.`,
            codeExamples: [
                `class Weird:
    def __eq__(self, other):
        return True              # claims to equal everything

w = Weird()
print(w == None)
print(w is None)

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>List the falsy values in Python</td><td>False, None, numeric zeros (0, 0.0, 0j, Decimal(0)...), and empty containers ("", [], (), {}, set(), range(0))</td></tr>
<tr class='text-center'><td>What does <code>bool("False")</code> return?</td><td>True - any non-empty string is truthy</td></tr>
<tr class='text-center'><td>What is <code>True + True</code>?</td><td>2, because bool is a subclass of int</td></tr>
<tr class='text-center'><td>What does a function return without a return statement?</td><td>None</td></tr>
<tr class='text-center'><td>Why use <code>is None</code>?</td><td>None is a singleton; identity is exact and cannot be overridden by <code>__eq__</code></td></tr>
<tr class='text-center'><td>How is truthiness of an object decided?</td><td><code>__bool__()</code> if defined, else <code>__len__() != 0</code>, else True</td></tr>
</table>`
        }
    ]
};
