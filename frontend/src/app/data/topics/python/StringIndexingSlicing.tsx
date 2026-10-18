import type { Topic } from '../../types';

export const stringIndexingSlicing: Topic = {
    id: 'python-basics-string-indexing-slicing',
    name: 'String Indexing & Slicing',
    beginner: [
        {
            content: `<h4>Indexing</h4>
Each character in a string has a position number called an <b>index</b>, starting at <b>0</b>. Python also supports <b>negative indexes</b>, which count from the end: <code>-1</code> is the last character.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Character</th><td>P</td><td>Y</td><td>T</td><td>H</td><td>O</td><td>N</td></tr>
<tr class='text-center'><th>Index</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
<tr class='text-center'><th>Negative index</th><td>-6</td><td>-5</td><td>-4</td><td>-3</td><td>-2</td><td>-1</td></tr>
</table>`,
            codeExamples: [
                `word = "PYTHON"

print(word[0])       # first
print(word[3])
print(word[-1])      # last
print(word[-2])      # second last
print(word[6])       # there is no index 6

# OUTPUT:
# P
# H
# N
# O
# IndexError: string index out of range`
            ]
        },
        {
            content: `<h4>Slicing</h4>
A <b>slice</b> <code>s[start:stop]</code> extracts a substring from <code>start</code> up to <b>but not including</b> <code>stop</code>. Leave out <code>start</code> to begin at 0, leave out <code>stop</code> to go to the end.`,
            codeExamples: [
                `word = "PYTHON"

print(word[0:2])     # indexes 0 and 1
print(word[2:5])
print(word[:3])      # from the start
print(word[3:])      # to the end
print(word[-3:])     # last three characters
print(word[:])       # the whole string

# OUTPUT:
# PY
# THO
# PYT
# HON
# HON
# PYTHON`
            ]
        },
        {
            content: `<h4>Slicing with a Step</h4>
A third number, <code>s[start:stop:step]</code>, picks every <i>step</i>-th character. A negative step walks backwards - <code>s[::-1]</code> is the classic way to reverse a string.`,
            codeExamples: [
                `digits = "0123456789"

print(digits[::2])       # every second character
print(digits[1::2])
print(digits[::-1])      # reversed
print(digits[8:2:-2])    # backwards from 8 down to (not including) 2

# OUTPUT:
# 02468
# 13579
# 9876543210
# 864`
            ]
        },
        {
            content: `<h4>Practical Examples</h4>`,
            codeExamples: [
                `email = "pankaj@dhipan.com"
at = email.index("@")
print("User:", email[:at])
print("Domain:", email[at + 1:])

word = "level"
print("Palindrome?", word == word[::-1])

pan = "ABCDE1234F"
print("Masked:", "*" * 6 + pan[-4:])

# OUTPUT:
# User: pankaj
# Domain: dhipan.com
# Palindrome? True
# Masked: ******234F`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Slices Never Raise IndexError</h3>
Indexing past the end raises an error, but slicing silently clamps out-of-range bounds. A slice that selects nothing returns an empty string.`,
            codeExamples: [
                `s = "abc"
print(repr(s[1:100]))
print(repr(s[5:10]))
print(repr(s[2:1]))       # start after stop with a positive step

# OUTPUT:
# 'bc'
# ''
# ''`
            ]
        },
        {
            content: `<h3>Why Is the Stop Index Excluded?</h3>
Half-open ranges make the arithmetic clean:<br>
• <code>len(s[a:b]) == b - a</code><br>
• <code>s[:k] + s[k:] == s</code> for any k - splitting never loses or duplicates a character<br>
• <code>s[:n]</code> is "the first n characters", <code>s[-n:]</code> is "the last n characters"`,
            codeExamples: [
                `s = "programming"
k = 4
print(s[:k], s[k:], s[:k] + s[k:] == s)
print(len(s[2:7]))

# OUTPUT:
# prog ramming True
# 5`
            ]
        },
        {
            content: `<h3>Slice Objects</h3>
<code>s[a:b:c]</code> is shorthand for <code>s[slice(a, b, c)]</code>. Naming a slice makes fixed-width parsing self-documenting. <code>slice.indices(len)</code> shows how Python resolves the bounds for a given length.`,
            codeExamples: [
                `record = "2024-10-04INV00042  5000"

DATE = slice(0, 10)
INVOICE = slice(10, 18)
AMOUNT = slice(18, None)

print(record[DATE], record[INVOICE], int(record[AMOUNT]))
print(slice(None, None, -1).indices(5))

# OUTPUT:
# 2024-10-04 INV00042 5000
# (4, -1, -1)`
            ]
        },
        {
            content: `<h3>Same Syntax for Every Sequence</h3>
Lists, tuples, bytes and ranges slice exactly like strings. For lists - which are mutable - a slice can also appear on the <b>left</b> of an assignment, and slicing makes a shallow copy.`,
            codeExamples: [
                `nums = [10, 20, 30, 40, 50]
print(nums[1:4], nums[::-1])

nums[1:3] = [99]          # replace two items with one
print(nums)

copy = nums[:]            # shallow copy
copy.append(0)
print(nums, copy)

print(range(0, 20)[::5])

# OUTPUT:
# [20, 30, 40] [50, 40, 30, 20, 10]
# [10, 99, 40, 50]
# [10, 99, 40, 50] [10, 99, 40, 50, 0]
# range(0, 20, 5)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you reverse a string?</td><td><code>s[::-1]</code> (or <code>"".join(reversed(s))</code>)</td></tr>
<tr class='text-center'><td>What does <code>s[-1]</code> return?</td><td>The last character</td></tr>
<tr class='text-center'><td>Does <code>s[2:100]</code> raise an error for a short string?</td><td>No - slices clamp out-of-range bounds; only plain indexing raises IndexError</td></tr>
<tr class='text-center'><td>Is the stop index included?</td><td>No - slices are half-open, so <code>len(s[a:b]) == b - a</code></td></tr>
<tr class='text-center'><td>Does slicing a string copy it?</td><td>It creates a new string (except the full slice <code>s[:]</code>, which CPython may return as the same immutable object)</td></tr>
<tr class='text-center'><td>Can you assign to a string slice?</td><td>No - strings are immutable; list slices can be assigned</td></tr>
</table>`
        }
    ]
};
