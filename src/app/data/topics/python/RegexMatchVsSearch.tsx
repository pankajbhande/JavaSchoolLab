import type { Topic } from '../../types';

export const regexMatchVsSearch: Topic = {
    id: 'python-regex-re-match-vs-re-search',
    name: 're.match() vs re.search()',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>regular expression</b> (regex) is a compact pattern that describes a set of strings: "four digits", "a word followed by @", "a capital letter then lowercase letters". Python's <code>re</code> module compiles the pattern and applies it to text. Three functions look similar but differ in <b>where</b> the pattern must fit: <code>re.match()</code> at the <i>start</i> of the string, <code>re.search()</code> <i>anywhere</i>, and <code>re.fullmatch()</code> across the <i>whole</i> string. Java's equivalent is <code>Pattern</code> and <code>Matcher</code> (<code>lookingAt()</code>, <code>find()</code>, <code>matches()</code>).

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 405 133" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:405px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="177.3" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="98.6" y="27">re.match()</tspan></text><rect x="10" y="44" width="177.3" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="98.6" y="62.5">tries only at index 0</tspan></text><rect x="10" y="79" width="177.3" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="98.6" y="97.5">"Order 4521 shipped"</tspan><tspan x="98.6" y="112.5">-&gt; None</tspan></text><rect x="217.3" y="10" width="177.3" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="306" y="27">re.search()</tspan></text><rect x="217.3" y="44" width="177.3" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="306" y="62.5">scans every position</tspan></text><rect x="217.3" y="79" width="177.3" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="306" y="97.5">"Order 4521 shipped"</tspan><tspan x="306" y="112.5">-&gt; "4521" at (6, 10)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the same pattern r"\\d+" on the same text gives different results</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Checking text with plain string methods (<code>startswith</code>, <code>find</code>, slicing, loops) turns long and fragile as soon as the rule is more than a fixed word - for example "three letters, a hyphen, then digits".
<br><br>
<b>Why we need it:</b>
<ul>
<li>Describe a <b>rule</b> once instead of writing loops and index arithmetic.</li>
<li>Choose the right function: <b>search</b> to find data, <b>fullmatch</b> to validate input, <b>match</b> to check a prefix.</li>
<li>Get a <b>Match object</b> with the text, its position and its groups - not just True or False.</li>
<li>Avoid the most common beginner bug: using <code>match()</code> when you meant <code>search()</code>.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: match(), search() and fullmatch() side by side</h4>
The helper <code>describe()</code> prints what each function returns for the same pattern and text.`,
            codeExamples: [
                `import re


def describe(label, match):
    if match:
        print(label, "-> found", repr(match.group()), "at", match.span())
    else:
        print(label, "-> no match")


def main():
    text = "Order 4521 shipped"
    pattern = r"\\d+"

    describe("match()    ", re.match(pattern, text))
    describe("search()   ", re.search(pattern, text))
    describe("fullmatch()", re.fullmatch(pattern, text))
    describe("fullmatch()", re.fullmatch(pattern, "4521"))


if __name__ == "__main__":
    main()

# OUTPUT:
# match()     -> no match
# search()    -> found '4521' at (6, 10)
# fullmatch() -> no match
# fullmatch() -> found '4521' at (0, 4)`
            ],
            codeExplanations: [
                `The text starts with "Order", so match() fails at index 0. search() scans forward and finds "4521" at 6 to 10. fullmatch() succeeds only when the whole string is digits, which is true for the last call.`
            ]
        },
        {
            content: `<h4>What is a Regular Expression?</h4>
A <b>regular expression</b> (regex) is a small pattern language for describing text: "four digits", "a word followed by @", "a capital letter then lowercase letters". Python's <code>re</code> module compiles the pattern and searches strings for it. Java has the same idea in <code>java.util.regex</code> (<code>Pattern</code> and <code>Matcher</code>).

Always write patterns as <b>raw strings</b> (<code>r"..."</code>) so Python does not treat <code>\\d</code> or <code>\\b</code> as string escapes.`,
            codeExamples: [
                `import re

text = "Order 4521 shipped"

print(re.match(r"\\d+", text))     # must match at the very START
print(re.search(r"\\d+", text))    # looks ANYWHERE in the string

# OUTPUT:
# None
# <re.Match object; span=(6, 10), match='4521'>`
            ],
            codeExplanations: [
                `The text starts with "Order", not a digit, so re.match() fails and returns None. re.search() scans along the string until the pattern fits and finds "4521" at index 6 to 10. The result is a Match object, or None when nothing matches.`
            ]
        },
        {
            content: `<h4>The Match Object</h4>
A successful call returns a <b>Match object</b> describing what was found. A failed call returns <code>None</code>, which is falsy - so you can test the result directly with <code>if</code>.`,
            codeExamples: [
                `import re

m = re.search(r"\\d+", "Order 4521 shipped")

if m:
    print(m.group())    # the matched text
    print(m.start())    # index where it begins
    print(m.end())      # index just after it ends
    print(m.span())     # (start, end)
else:
    print("no match")

# OUTPUT:
# 4521
# 6
# 10
# (6, 10)`
            ]
        },
        {
            content: `<h4>re.fullmatch(): The Whole String Must Match</h4>
<code>match()</code> only anchors the <i>start</i>; it does not require the match to reach the end. When validating input (a PIN, a code) use <code>re.fullmatch()</code>.`,
            codeExamples: [
                `import re

print(bool(re.fullmatch(r"\\d{4}", "4521")))     # exactly 4 digits
print(bool(re.fullmatch(r"\\d{4}", "45211")))    # 5 digits - rejected
print(bool(re.match(r"\\d{4}", "45211")))        # match() accepts the first 4

# OUTPUT:
# True
# False
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Compile Once, Reuse Many Times</h3>
<code>re.compile()</code> returns a pattern object with the same <code>match</code>, <code>search</code>, <code>findall</code> and <code>sub</code> methods. The <code>re</code> module caches recently used patterns, so compiling is mostly about <b>readability and reuse</b> - give the pattern a name and define it once at module level.

Pattern objects also accept an optional start position, which the module-level functions do not.`,
            codeExamples: [
                `import re

DATE = re.compile(r"(?P<year>\\d{4})-(?P<month>\\d{2})")

if (m := DATE.search("Date: 2026-10-05")):
    print(m["year"], m["month"])

digits = re.compile(r"\\d+")
text = "ab123"
print(digits.match(text))             # position 0 is 'a'
print(digits.match(text, 2).group())  # start matching at index 2

# OUTPUT:
# 2026 10
# None
# 123`
            ]
        },
        {
            content: `<h3>The Classic Bug: Calling .group() on None</h3>
Because a failed search returns <code>None</code>, chaining <code>.group()</code> straight onto it crashes the first time the input has no match. Check the result first.`,
            codeExamples: [
                `import re

try:
    re.search(r"\\d+", "no digits here").group()
except AttributeError as error:
    print("AttributeError:", error)

# Safe version
m = re.search(r"\\d+", "no digits here")
print(m.group() if m else "not found")

# OUTPUT:
# AttributeError: 'NoneType' object has no attribute 'group'
# not found`
            ]
        },
        {
            content: `<h3>Anchors: ^ and $ and the MULTILINE Flag</h3>
<code>^</code> matches at the start of the string and <code>$</code> at the end (or just before a trailing newline). With <code>re.MULTILINE</code> they match at every line instead. <code>re.match()</code> is effectively <code>re.search()</code> with a <code>^</code> in front - but without MULTILINE.

Beware: <code>$</code> also matches <b>before a trailing newline</b>, so <code>match(r"^\\d+$", "123\\n")</code> succeeds. <code>fullmatch()</code> does not have this problem.`,
            codeExamples: [
                `import re

text = "first\\nsecond"
print(re.search(r"^second", text))
print(re.search(r"^second", text, re.MULTILINE))

print(bool(re.match(r"^\\d+$", "123\\n")))     # newline slips through
print(bool(re.fullmatch(r"\\d+", "123\\n")))   # correctly rejected

# OUTPUT:
# None
# <re.Match object; span=(6, 12), match='second'>
# True
# False`
            ]
        },
        {
            content: `<h3>match vs search vs fullmatch</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Where the pattern must fit</th><th>Typical use</th></tr>
<tr class='text-center'><td><code>re.match()</code></td><td>Starting at the beginning of the string</td><td>Check a prefix, tokenizing</td></tr>
<tr class='text-center'><td><code>re.search()</code></td><td>Anywhere in the string (first occurrence)</td><td>Find one value in free text</td></tr>
<tr class='text-center'><td><code>re.fullmatch()</code></td><td>The entire string</td><td>Validating input</td></tr>
<tr class='text-center'><td><code>re.findall()</code></td><td>Every non-overlapping occurrence</td><td>Collect all values</td></tr>
</table>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>One short pattern replaces many lines of loops and slicing</td><td>Names are misleading: <code>match()</code> only checks the start</td></tr>
<tr><td>Implemented in C: fast for typical text sizes</td><td>Failure returns <code>None</code>; chaining <code>.group()</code> crashes</td></tr>
<tr><td>Match objects give text, span and groups in one result</td><td>Complex patterns become hard to read and maintain</td></tr>
<tr><td>Part of the standard library - no installation</td><td>Patterns are not a substitute for real parsers (HTML, JSON)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>re.match() vs re.search()?</td><td>match() only succeeds if the pattern fits at the start of the string; search() scans the whole string for the first fit</td></tr>
<tr class='text-center'><td>What do they return on failure?</td><td><code>None</code> - so test before calling <code>.group()</code></td></tr>
<tr class='text-center'><td>How do you validate an entire string?</td><td>Use <code>re.fullmatch()</code>, or anchors <code>^...$</code> (mind the trailing-newline quirk of <code>$</code>)</td></tr>
<tr class='text-center'><td>Why use raw strings for patterns?</td><td>So backslash sequences like <code>\\d</code> and <code>\\b</code> reach the regex engine untouched</td></tr>
<tr class='text-center'><td>When to use re.compile()?</td><td>To name and reuse a pattern, and to use the pos/endpos arguments</td></tr>
</table>`
        }
    ]
};
