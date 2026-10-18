import type { Topic } from '../../types';

export const dynamicTyping: Topic = {
    id: 'python-basics-dynamic-typing',
    name: 'Dynamic Typing',
    beginner: [
        {
            content: `<h4>What is Dynamic Typing?</h4>
In a <b>statically typed</b> language like Java, a variable's type is fixed when you declare it and checked by the compiler. In Python, which is <b>dynamically typed</b>, the <b>value</b> has a type but the <b>variable</b> does not - the same name can refer to an int now and a string later. Types are checked while the program runs.`,
            codeExamples: [
                `value = 10
print(value, type(value))

value = "ten"
print(value, type(value))

value = [1, 0]
print(value, type(value))

# OUTPUT:
# 10 <class 'int'>
# ten <class 'str'>
# [1, 0] <class 'list'>`
            ]
        },
        {
            content: `<h4>Java vs Python</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java (static)</th><th>Python (dynamic)</th></tr>
<tr class='text-center'><td><code>int count = 5;</code></td><td><code>count = 5</code></td></tr>
<tr class='text-center'><td><code>count = "five";</code> → compile error</td><td><code>count = "five"</code> → allowed</td></tr>
<tr class='text-center'><td>Type errors found before running</td><td>Type errors found when that line runs</td></tr>
</table>`
        },
        {
            content: `<h4>Dynamic but Strong</h4>
Dynamic does <b>not</b> mean Python mixes types carelessly. Python is <b>strongly typed</b>: it refuses operations that don't make sense for the types involved, instead of silently converting (as JavaScript does with <code>"1" + 1 = "11"</code>).`,
            codeExamples: [
                `age = 25
message = "Age: " + str(age)    # convert explicitly
print(message)

print("Age: " + age)            # mixing str and int

# OUTPUT:
# Age: 25
# TypeError: can only concatenate str (not "int") to str`
            ]
        },
        {
            content: `<h4>Duck Typing</h4>
"If it walks like a duck and quacks like a duck, it's a duck." Python code usually doesn't care what <b>type</b> an object is - only whether it has the method or behaviour needed. Any object with a matching method works.`,
            codeExamples: [
                `class Dog:
    def speak(self):
        return "Woof"

class Robot:
    def speak(self):
        return "Beep"

def make_it_speak(thing):       # no type check at all
    print(thing.speak())

make_it_speak(Dog())
make_it_speak(Robot())

# OUTPUT:
# Woof
# Beep`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Cost: Errors Surface Late</h3>
Because nothing is checked ahead of time, a type mistake in a rarely executed branch can sit in production for months and crash only when that branch finally runs. This is the main trade-off of dynamic typing - and the reason for type hints and tests.`,
            codeExamples: [
                `def apply_discount(price, is_member):
    if is_member:
        return price * 0.9
    return price - "10"        # bug - but only fails when is_member is False

print(apply_discount(100, True))   # works fine
print(apply_discount(100, False))  # crashes only now

# OUTPUT:
# 90.0
# TypeError: unsupported operand type(s) for -: 'int' and 'str'`
            ]
        },
        {
            content: `<h3>Type Hints: Static Checking, Optionally</h3>
Since Python 3.5 you can annotate types. The interpreter <b>does not enforce them</b> at runtime - they are read by tools such as <b>mypy</b>, <b>Pyright</b> and your editor, which then catch type bugs before the code runs. You get dynamic flexibility with static safety where you want it.`,
            codeExamples: [
                `def apply_discount(price: float, percent: float) -> float:
    return price * (1 - percent / 100)

print(apply_discount(500, 10))
print(apply_discount("500", 10))   # Python itself still runs this line...

# OUTPUT:
# 450.0
# TypeError: can't multiply sequence by non-int of type 'float'
#
# ...but mypy reports it without running the program:
# error: Argument 1 to "apply_discount" has incompatible type "str"; expected "float"`
            ]
        },
        {
            content: `<h3>EAFP vs LBYL</h3>
Dynamic typing shapes Python's error-handling style. Instead of <b>L</b>ook <b>B</b>efore <b>Y</b>ou <b>L</b>eap (checking types up front), idiomatic Python is <b>E</b>asier to <b>A</b>sk <b>F</b>orgiveness than <b>P</b>ermission: just try the operation and handle the exception.`,
            codeExamples: [
                `# LBYL - check first
def to_number_lbyl(text):
    if text.isdigit():
        return int(text)
    return None

# EAFP - the Pythonic way
def to_number_eafp(text):
    try:
        return int(text)
    except ValueError:
        return None

print(to_number_lbyl("-5"), to_number_eafp("-5"))

# OUTPUT:
# None -5        # isdigit() misses negative numbers; EAFP handles them`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Static vs dynamic typing?</td><td>Static: types belong to variables and are checked at compile time. Dynamic: types belong to values and are checked at runtime</td></tr>
<tr class='text-center'><td>Strong vs weak typing?</td><td>Strong languages refuse implicit conversions between unrelated types (Python, Java); weak ones coerce silently (JavaScript, C in places)</td></tr>
<tr class='text-center'><td>Are type hints enforced?</td><td>No - CPython ignores them at runtime; static checkers like mypy and Pyright use them</td></tr>
<tr class='text-center'><td>What is duck typing?</td><td>Accepting any object that supports the required behaviour, regardless of its class</td></tr>
<tr class='text-center'><td>What is EAFP?</td><td>Try the operation and catch the exception, rather than checking conditions first - the preferred Python style</td></tr>
</table>`
        }
    ]
};
