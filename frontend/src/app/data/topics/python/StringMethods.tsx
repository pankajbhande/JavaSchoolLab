import type { Topic } from '../../types';

export const stringMethods: Topic = {
    id: 'python-basics-string-methods',
    name: 'String Methods',
    beginner: [
        {
            content: `<h4>Changing Case</h4>
String methods never modify the original - strings are immutable - they always <b>return a new string</b>.`,
            codeExamples: [
                `text = "welcome to JavaSchoolLab"

print(text.upper())
print(text.lower())
print(text.title())
print(text.capitalize())
print(text.swapcase())

# OUTPUT:
# WELCOME TO JAVASCHOOLLAB
# welcome to javaschoollab
# Welcome To Javaschoollab
# Welcome to javaschoollab
# WELCOME TO jAVAsCHOOLlAB`
            ]
        },
        {
            content: `<h4>Removing Whitespace</h4>
<code>strip()</code> removes spaces, tabs and newlines from both ends; <code>lstrip()</code> and <code>rstrip()</code> work on one side. Essential for cleaning user input and file lines.`,
            codeExamples: [
                `raw = "   pankaj@dhipan.com   "

print("[" + raw.strip() + "]")
print("[" + raw.lstrip() + "]")
print("[" + raw.rstrip() + "]")

# OUTPUT:
# [pankaj@dhipan.com]
# [pankaj@dhipan.com   ]
# [   pankaj@dhipan.com]`
            ]
        },
        {
            content: `<h4>Searching</h4>`,
            codeExamples: [
                `sentence = "Python is easy and Python is powerful"

print(sentence.find("Python"))          # first index
print(sentence.rfind("Python"))         # last index
print(sentence.find("Java"))            # -1 if not found
print(sentence.count("Python"))
print(sentence.startswith("Python"))
print(sentence.endswith("ful"))

# OUTPUT:
# 0
# 19
# -1
# 2
# True
# True`
            ]
        },
        {
            content: `<h4>Replacing, Splitting and Joining</h4>`,
            codeExamples: [
                `msg = "I like Java"
print(msg.replace("Java", "Python"))

csv_line = "Pankaj,28,Pune"
parts = csv_line.split(",")
print(parts)

words = "  learn   python   daily ".split()   # no argument: split on any whitespace
print(words)

print(" | ".join(["Home", "Courses", "Python"]))

# OUTPUT:
# I like Python
# ['Pankaj', '28', 'Pune']
# ['learn', 'python', 'daily']
# Home | Courses | Python`
            ]
        },
        {
            content: `<h4>Checking Content</h4>
The <code>is...()</code> methods return <code>True</code> or <code>False</code>.`,
            codeExamples: [
                `print("12345".isdigit())
print("Python3".isalnum())
print("Python".isalpha())
print("hello".islower(), "HELLO".isupper())
print("   ".isspace())
print("Hello World".istitle())

# OUTPUT:
# True
# True
# True
# True True
# True
# True`
            ]
        },
        {
            content: `<h4>Padding and Alignment</h4>`,
            codeExamples: [
                `print("42".zfill(5))
print("abc".center(9, "*"))
print("Name".ljust(10) + "|")
print("Total".rjust(10) + "|")

# OUTPUT:
# 00042
# ***abc***
# Name      |
#      Total|`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>find() vs index()</h3>
Both return the position of a substring. <code>find()</code> returns <code>-1</code> when it is missing; <code>index()</code> raises <code>ValueError</code>. Be careful: <code>-1</code> is also a valid index meaning "last character", so an unchecked <code>find()</code> result can cause silent bugs.`,
            codeExamples: [
                `s = "hello"
print(s.find("z"))
pos = s.find("z")
print(s[pos])            # silently returns the last character!
print(s.index("z"))

# OUTPUT:
# -1
# o
# ValueError: substring not found`
            ]
        },
        {
            content: `<h3>split() Subtleties</h3>
<code>split()</code> with no argument splits on runs of whitespace and drops empty strings. <code>split(",")</code> with an explicit separator keeps empty fields. <code>maxsplit</code> limits the number of splits; <code>rsplit</code> splits from the right; <code>partition</code> always returns exactly three parts.`,
            codeExamples: [
                `print("a,b,,c".split(","))
print(" a  b ".split())
print(" a  b ".split(" "))
print("k=v=w".split("=", 1))
print("archive.tar.gz".rsplit(".", 1))
print("user@example.com".partition("@"))
print("line1\\nline2\\r\\nline3".splitlines())

# OUTPUT:
# ['a', 'b', '', 'c']
# ['a', 'b']
# ['', 'a', '', 'b', '']
# ['k', 'v=w']
# ['archive.tar', 'gz']
# ('user', '@', 'example.com')
# ['line1', 'line2', 'line3']`
            ]
        },
        {
            content: `<h3>strip() Removes a Set of Characters, Not a Prefix</h3>
<code>strip("xy")</code> removes <b>any</b> of the characters x and y from the ends, in any order. To remove an exact prefix or suffix, use <code>removeprefix()</code> / <code>removesuffix()</code> (Python 3.9+).`,
            codeExamples: [
                `filename = "data_report.csv"
print(filename.strip(".csv"))           # strips c, s, v and . from both ends
print(filename.removesuffix(".csv"))

url = "https://shop.com"
print(url.removeprefix("https://"))

# OUTPUT:
# data_report
# data_report
# shop.com
#
# Looks right - but try "vacations.csv".strip(".csv") -> "acation"`
            ]
        },
        {
            content: `<h3>Case-Insensitive Comparison: casefold()</h3>
<code>lower()</code> is fine for English, but some languages have case rules it doesn't cover. <code>casefold()</code> is the aggressive version designed for comparisons.`,
            codeExamples: [
                `print("Straße".lower(), "Straße".casefold())
print("STRASSE".lower() == "Straße".lower())
print("STRASSE".casefold() == "Straße".casefold())

# OUTPUT:
# straße strasse
# False
# True`
            ]
        },
        {
            content: `<h3>isdigit() vs isdecimal() vs isnumeric()</h3>
They differ for non-ASCII characters - and none of them accept a minus sign or a decimal point. To validate a number, try converting it instead.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Text</th><th>isdecimal()</th><th>isdigit()</th><th>isnumeric()</th></tr>
<tr class='text-center'><td><code>"123"</code></td><td>True</td><td>True</td><td>True</td></tr>
<tr class='text-center'><td><code>"²"</code> (superscript two)</td><td>False</td><td>True</td><td>True</td></tr>
<tr class='text-center'><td><code>"½"</code></td><td>False</td><td>False</td><td>True</td></tr>
<tr class='text-center'><td><code>"-5"</code> or <code>"3.5"</code></td><td>False</td><td>False</td><td>False</td></tr>
</table>`
        },
        {
            content: `<h3>translate() for Bulk Character Replacement</h3>
<code>str.maketrans()</code> builds a mapping table and <code>translate()</code> applies it in one pass - faster and cleaner than chaining many <code>replace()</code> calls.`,
            codeExamples: [
                `table = str.maketrans({"a": "4", "e": "3", "o": "0"})
print("hello developer".translate(table))

remove_punct = str.maketrans("", "", ",.!?")
print("Hi, there! How are you?".translate(remove_punct))

# OUTPUT:
# h3ll0 d3v3l0p3r
# Hi there How are you`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Do string methods modify the string?</td><td>No - strings are immutable; methods return new strings</td></tr>
<tr class='text-center'><td>find() vs index()?</td><td>find returns -1 when not found, index raises ValueError</td></tr>
<tr class='text-center'><td>split() vs split(" ")?</td><td>No-argument split collapses whitespace runs and drops empty strings; split(" ") splits on every single space and keeps empty fields</td></tr>
<tr class='text-center'><td>How do you remove a file extension safely?</td><td><code>name.removesuffix(".csv")</code> or <code>os.path.splitext(name)[0]</code> - not <code>strip(".csv")</code></td></tr>
<tr class='text-center'><td>lower() vs casefold()?</td><td>casefold is more aggressive and is intended for caseless comparisons across languages</td></tr>
<tr class='text-center'><td>How do you count words in a sentence?</td><td><code>len(sentence.split())</code></td></tr>
</table>`
        }
    ]
};
