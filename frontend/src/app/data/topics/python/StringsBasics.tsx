import type { Topic } from '../../types';

export const stringsBasics: Topic = {
    id: 'python-basics-strings-str-basics',
    name: 'Strings (str) Basics',
    beginner: [
        {
            content: `<h4>Creating Strings</h4>
A string is a sequence of Unicode characters. You can use single quotes, double quotes, or triple quotes - there is <b>no separate char type</b>; a single character is just a string of length 1.`,
            codeExamples: [
                `first = 'Python'
second = "Python"
print(first == second)

quote = "It's easy"              # double quotes let you use ' inside
html = '<a href="/home">Home</a>' # single quotes let you use " inside

letter = "A"
print(type(letter), len(letter))

# OUTPUT:
# True
# <class 'str'> 1`
            ]
        },
        {
            content: `<h4>Multi-line Strings</h4>
Triple quotes (<code>"""</code> or <code>'''</code>) let a string span several lines, keeping the line breaks.`,
            codeExamples: [
                `address = """DHIPAN Software Technologies
Udgir, Latur
Maharashtra"""

print(address)

# OUTPUT:
# DHIPAN Software Technologies
# Udgir, Latur
# Maharashtra`
            ]
        },
        {
            content: `<h4>Joining and Repeating</h4>
<code>+</code> concatenates strings and <code>*</code> repeats them. To join a string with a number, convert the number first, or use an f-string.`,
            codeExamples: [
                `first_name = "Sheru"
last_name = "Patil"
full_name = first_name + " " + last_name
print(full_name)

print("-" * 20)

age = 22
print(full_name + " is " + str(age))
print(f"{full_name} is {age}")

# OUTPUT:
# Sheru Patil
# --------------------
# Sheru Patil is 22
# Sheru Patil is 22`
            ]
        },
        {
            content: `<h4>Length, Membership and Looping</h4>`,
            codeExamples: [
                `course = "JavaSchoolLab"

print(len(course))
print("School" in course)
print("python" not in course)

for ch in "abc":
    print(ch)

# OUTPUT:
# 13
# True
# True
# a
# b
# c`
            ]
        },
        {
            content: `<h4>Strings Are Immutable</h4>
You can read individual characters, but you <b>cannot change</b> a string in place. Every "modification" builds a brand-new string.`,
            codeExamples: [
                `word = "java"
# word[0] = "J"       # TypeError: 'str' object does not support item assignment

word = "J" + word[1:]   # build a new string instead
print(word)
print(word.upper())     # methods also return new strings
print(word)             # the original is unchanged

# OUTPUT:
# Java
# JAVA
# Java`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Building Strings Efficiently</h3>
Because strings are immutable, <code>result += piece</code> inside a loop may create a new string on every iteration - quadratic work in the worst case. Collect the pieces in a list and call <code>"".join()</code> once, exactly like using <code>StringBuilder</code> in Java.`,
            codeExamples: [
                `parts = []
for i in range(5):
    parts.append(str(i))

result = ",".join(parts)
print(result)

# Even shorter with a generator expression:
print("-".join(str(i) for i in range(5)))

# OUTPUT:
# 0,1,2,3,4
# 0-1-2-3-4`
            ]
        },
        {
            content: `<h3>Comparing Strings</h3>
<code>==</code> compares content (like Java's <code>equals()</code>, not <code>==</code>). <code>&lt;</code> and <code>&gt;</code> compare lexicographically by Unicode code point, so every uppercase letter sorts before every lowercase one.`,
            codeExamples: [
                `print("apple" == "apple")
print("apple" < "banana")
print("Zebra" < "apple")            # 'Z' (90) < 'a' (97)
print(sorted(["banana", "apple", "Cherry"]))
print(sorted(["banana", "apple", "Cherry"], key=str.lower))   # case-insensitive

# OUTPUT:
# True
# True
# True
# ['Cherry', 'apple', 'banana']
# ['apple', 'banana', 'Cherry']`
            ]
        },
        {
            content: `<h3>Adjacent Literals Are Joined at Compile Time</h3>
String literals written next to each other are merged by the compiler. This is the clean way to split a long string across lines inside parentheses - but it also causes a classic bug when a comma is forgotten in a list.`,
            codeExamples: [
                `message = ("This is a long message "
           "split across two lines.")
print(message)

colors = [
    "red",
    "green"      # missing comma!
    "blue",
]
print(colors, len(colors))

# OUTPUT:
# This is a long message split across two lines.
# ['red', 'greenblue'] 2`
            ]
        },
        {
            content: `<h3>Strings Are Sequences</h3>
<code>str</code> supports every sequence operation: indexing, slicing, <code>len()</code>, <code>in</code>, iteration, <code>min()</code>/<code>max()</code>, <code>.count()</code> and <code>.index()</code>. Converting to a <code>list</code> gives you the individual characters.`,
            codeExamples: [
                `s = "banana"
print(list(s))
print(s.count("a"), s.index("n"))
print(max(s), min(s))

# OUTPUT:
# ['b', 'a', 'n', 'a', 'n', 'a']
# 3 2
# n a`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Single vs double quotes?</td><td>No difference in meaning - pick one consistently and use the other when the text contains a quote</td></tr>
<tr class='text-center'><td>Does Python have a char type?</td><td>No - a character is a string of length 1</td></tr>
<tr class='text-center'><td>Are strings mutable?</td><td>No - every string operation returns a new string</td></tr>
<tr class='text-center'><td>Fastest way to build a large string in a loop?</td><td>Append pieces to a list and call <code>"".join(pieces)</code> once</td></tr>
<tr class='text-center'><td>What does <code>"ab" "cd"</code> produce?</td><td><code>"abcd"</code> - adjacent literals are concatenated at compile time</td></tr>
<tr class='text-center'><td>Is <code>==</code> on strings like Java's <code>==</code>?</td><td>No - Python's <code>==</code> compares content, like Java's <code>equals()</code>; Python's <code>is</code> is the identity check</td></tr>
</table>`
        }
    ]
};
