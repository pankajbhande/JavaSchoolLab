import type { Topic } from '../../types';

export const typeConversion: Topic = {
    id: 'python-basics-type-conversion',
    name: 'Type Conversion',
    beginner: [
        {
            content: `<h4>Implicit Conversion</h4>
Python converts automatically only when no information can be lost - mainly when mixing numbers. An <code>int</code> combined with a <code>float</code> becomes a <code>float</code>; a <code>bool</code> acts as 0 or 1. It will <b>never</b> silently turn a string into a number or vice versa.`,
            codeExamples: [
                `print(3 + 2.5)          # int + float -> float
print(True + 4)         # bool + int -> int

# OUTPUT:
# 5.5
# 5`
            ]
        },
        {
            content: `<h4>Explicit Conversion (Type Casting)</h4>
To convert yourself, call the type like a function: <code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code>, <code>list()</code>, <code>tuple()</code>, <code>set()</code>.`,
            codeExamples: [
                `print(int("25") + 5)
print(float("3.75"))
print(str(100) + " marks")
print(int(9.99))          # truncates toward zero - does NOT round
print(int(-9.99))

# OUTPUT:
# 30
# 3.75
# 100 marks
# 9
# -9`
            ]
        },
        {
            content: `<h4>Converting User Input</h4>
<code>input()</code> always returns a string, so numeric input must be converted before doing arithmetic.`,
            codeExamples: [
                `age_text = input("Enter your age: ")
age = int(age_text)
print("Next year you will be", age + 1)

# OUTPUT:
# Enter your age: 20
# Next year you will be 21`
            ]
        },
        {
            content: `<h4>Collection Conversions</h4>`,
            codeExamples: [
                `print(list("abc"))
print(tuple([1, 2, 3]))
print(set([1, 1, 2, 3, 3]))
print(list(range(5)))
print(dict([("a", 1), ("b", 2)]))

# OUTPUT:
# ['a', 'b', 'c']
# (1, 2, 3)
# {1, 2, 3}
# [0, 1, 2, 3, 4]
# {'a': 1, 'b': 2}`
            ]
        },
        {
            content: `<h4>When Conversion Fails</h4>
If the text doesn't look like a number of the requested type, Python raises <code>ValueError</code>.`,
            codeExamples: [
                `print(int(" 42 "))       # surrounding whitespace is allowed
print(float("1e3"))      # scientific notation is allowed
print(int("3.5"))        # int() won't parse a decimal string

# OUTPUT:
# 42
# 1000.0
# ValueError: invalid literal for int() with base 10: '3.5'`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Safe Conversion with try/except</h3>
Never trust that external text is numeric. Wrap the conversion and decide what to do with bad input.`,
            codeExamples: [
                `def to_int(text, default=0):
    try:
        return int(text)
    except (ValueError, TypeError):
        return default

print(to_int("15"), to_int("abc"), to_int(None), to_int("3.5"))
print(int(float("3.5")))      # parse as float first if decimals are allowed

# OUTPUT:
# 15 0 0 0
# 3`
            ]
        },
        {
            content: `<h3>int() with a Base</h3>
<code>int(text, base)</code> parses any base from 2 to 36. With <code>base=0</code> Python reads the prefix (<code>0x</code>, <code>0o</code>, <code>0b</code>) itself.`,
            codeExamples: [
                `print(int("ff", 16), int("777", 8), int("1101", 2))
print(int("0x1F", 0), int("0b11", 0))
print(int("z", 36))

# OUTPUT:
# 255 511 13
# 31 3
# 35`
            ]
        },
        {
            content: `<h3>bool() of a String Is a Trap</h3>
<code>bool()</code> tests emptiness, not meaning. To read "true"/"false" from configuration files or forms you must compare the text yourself.`,
            codeExamples: [
                `print(bool("False"), bool("0"), bool(""))

def parse_bool(text):
    return text.strip().lower() in {"true", "yes", "1", "on"}

print(parse_bool("False"), parse_bool(" YES "))

# OUTPUT:
# True True False
# False True`
            ]
        },
        {
            content: `<h3>str() vs repr()</h3>
<code>str()</code> gives a readable form for end users; <code>repr()</code> gives an unambiguous form for developers - for strings it includes the quotes. <code>ast.literal_eval()</code> safely turns a <code>repr</code> of basic literals back into objects (never use <code>eval()</code> on untrusted input).`,
            codeExamples: [
                `import ast

text = "42"
print(str(text), repr(text))
print(str(3.0), repr([1, "a"]))

data = ast.literal_eval("[1, 2, {'x': 3}]")
print(data, type(data))

# OUTPUT:
# 42 '42'
# 3.0 [1, 'a']
# [1, 2, {'x': 3}] <class 'list'>`
            ]
        },
        {
            content: `<h3>Conversion Cheat Sheet</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Expression</th><th>Result</th><th>Note</th></tr>
<tr class='text-center'><td><code>int(7.9)</code></td><td><code>7</code></td><td>Truncates toward zero</td></tr>
<tr class='text-center'><td><code>round(7.9)</code></td><td><code>8</code></td><td>Rounds (halves to even)</td></tr>
<tr class='text-center'><td><code>int("7.9")</code></td><td>ValueError</td><td>Use <code>int(float("7.9"))</code></td></tr>
<tr class='text-center'><td><code>float("nan")</code></td><td><code>nan</code></td><td>"inf" and "nan" are accepted</td></tr>
<tr class='text-center'><td><code>str(None)</code></td><td><code>"None"</code></td><td>Never fails</td></tr>
<tr class='text-center'><td><code>list({"a": 1, "b": 2})</code></td><td><code>["a", "b"]</code></td><td>Iterating a dict yields its keys</td></tr>
<tr class='text-center'><td><code>int(True)</code></td><td><code>1</code></td><td>bool is an int subclass</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Implicit vs explicit conversion?</td><td>Implicit happens automatically between compatible numeric types; explicit means calling int(), float(), str() and so on yourself</td></tr>
<tr class='text-center'><td>Does <code>int(2.9)</code> round?</td><td>No - it truncates toward zero, giving 2</td></tr>
<tr class='text-center'><td>What exception does a bad conversion raise?</td><td>ValueError for bad content (<code>int("abc")</code>), TypeError for an unsupported type (<code>int(None)</code>)</td></tr>
<tr class='text-center'><td>Why is <code>eval(input())</code> dangerous?</td><td>It executes arbitrary code typed by the user; use <code>ast.literal_eval</code> or explicit parsing</td></tr>
<tr class='text-center'><td>str() vs repr()?</td><td>str is for readable display, repr is an unambiguous developer representation</td></tr>
</table>`
        }
    ]
};
