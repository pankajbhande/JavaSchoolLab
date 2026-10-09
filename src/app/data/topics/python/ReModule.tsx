import type { Topic } from '../../types';

export const reModule: Topic = {
    id: 'python-modules-packages-re-module',
    name: 're Module',
    beginner: [
        {
            content: `<h4>What Is the re Module?</h4>
<code>re</code> provides <b>regular expressions</b> - patterns that describe text, such as "one or more digits" or "a word followed by @". This topic is a tour of the module's functions; the <i>Regular Expressions</i> module later covers pattern syntax in depth.<br><br>
A handful of tokens is enough for the examples here:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Token</th><th>Matches</th></tr>
<tr class='text-center'><td><code>\\d</code> / <code>\\w</code> / <code>\\s</code></td><td>A digit / a word character (letter, digit, _) / whitespace</td></tr>
<tr class='text-center'><td><code>.</code></td><td>Any character except a newline</td></tr>
<tr class='text-center'><td><code>+</code> / <code>*</code> / <code>?</code></td><td>One or more / zero or more / zero or one of the previous item</td></tr>
<tr class='text-center'><td><code>{n}</code></td><td>Exactly n of the previous item</td></tr>
<tr class='text-center'><td><code>[abc]</code> / <code>[0-9]</code></td><td>One character from the set / range</td></tr>
<tr class='text-center'><td><code>^</code> / <code>$</code></td><td>Start / end of the string</td></tr>
</table>`
        },
        {
            content: `<h4>Always Use Raw Strings for Patterns</h4>
Regex patterns are full of backslashes. In a normal string Python processes escapes first - <code>"\\b"</code> becomes a backspace character instead of the regex "word boundary". Prefixing the pattern with <code>r</code> passes the backslashes through untouched.`,
            codeExamples: [
                `import re

text = "cat scat category"

print(re.findall("\\bcat\\b", text))      # "\\b" is a backspace here
print(re.findall(r"\\bcat\\b", text))     # raw string: word boundary

# OUTPUT:
# []
# ['cat']`
            ]
        },
        {
            content: `<h4>search, match and fullmatch</h4>
All three return a <b>match object</b> on success and <code>None</code> otherwise - they differ in <b>where</b> the pattern may match.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Pattern must match...</th></tr>
<tr class='text-center'><td><code>re.search(p, s)</code></td><td>Anywhere in the string (first occurrence)</td></tr>
<tr class='text-center'><td><code>re.match(p, s)</code></td><td>At the <b>start</b> of the string</td></tr>
<tr class='text-center'><td><code>re.fullmatch(p, s)</code></td><td>The <b>whole</b> string - ideal for validation</td></tr>
</table>`,
            codeExamples: [
                `import re

text = "Order 42 shipped"

print(re.search(r"\\d+", text))
print(re.match(r"\\d+", text))            # text doesn't start with a digit
print(re.match(r"\\d+", "42 orders"))

print(re.fullmatch(r"\\d{6}", "411001"))
print(re.fullmatch(r"\\d{6}", "4110011"))  # 7 digits - not a full match

# OUTPUT:
# <re.Match object; span=(6, 8), match='42'>
# None
# <re.Match object; span=(0, 2), match='42'>
# <re.Match object; span=(0, 6), match='411001'>
# None`
            ]
        },
        {
            content: `<h4>Working with a Match Object</h4>
<code>group()</code> returns the matched text; <code>start()</code>, <code>end()</code> and <code>span()</code> give its position. Always check for <code>None</code> before using it.`,
            codeExamples: [
                `import re

m = re.search(r"\\d+", "Order 42 shipped")
if m:
    print(m.group(), m.start(), m.end(), m.span())

m = re.search(r"\\d+", "no numbers here")
print(m)
if m is None:
    print("not found")

# OUTPUT:
# 42 6 8 (6, 8)
# None
# not found`
            ]
        },
        {
            content: `<h4>findall and finditer - Every Match</h4>
<code>findall</code> returns a list of matched strings. <code>finditer</code> yields match objects one at a time, so you also get positions.`,
            codeExamples: [
                `import re

bill = "Rs 250 for 3 pens and 12 pencils"

print(re.findall(r"\\d+", bill))
print(sum(int(n) for n in re.findall(r"\\d+", bill)))

for m in re.finditer(r"\\d+", bill):
    print(m.group(), m.span())

# OUTPUT:
# ['250', '3', '12']
# 265
# 250 (3, 6)
# 3 (11, 12)
# 12 (22, 24)`
            ]
        },
        {
            content: `<h4>sub and split</h4>
<code>re.sub</code> replaces every match; <code>re.split</code> splits wherever the pattern matches - unlike <code>str.split</code>, it can use several different separators at once.`,
            codeExamples: [
                `import re

print(re.sub(r"\\s+", " ", "too    many     spaces"))
print(re.sub(r"\\d", "X", "Card 4321-8765"))

print(re.split(r"[,;\\s]+", "pen, book;bag  ink"))

# OUTPUT:
# too many spaces
# Card XXXX-XXXX
# ['pen', 'book', 'bag', 'ink']`
            ]
        },
        {
            content: `<h4>Validating an Indian PIN Code with re.compile</h4>
A PIN code has 6 digits and does not start with 0. <code>re.compile</code> turns the pattern into a reusable object with the same methods.`,
            codeExamples: [
                `import re

PIN = re.compile(r"[1-9]\\d{5}")

for code in ["411001", "011001", "41100", "4110a1"]:
    print(code, bool(PIN.fullmatch(code)))

# OUTPUT:
# 411001 True
# 011001 False
# 41100 False
# 4110a1 False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Flags</h3>
Flags change how a pattern is interpreted. Combine them with <code>|</code>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Flag</th><th>Effect</th></tr>
<tr class='text-center'><td><code>re.IGNORECASE</code> / <code>re.I</code></td><td>Case-insensitive matching</td></tr>
<tr class='text-center'><td><code>re.MULTILINE</code> / <code>re.M</code></td><td><code>^</code> and <code>$</code> match at every line, not just the whole string</td></tr>
<tr class='text-center'><td><code>re.DOTALL</code> / <code>re.S</code></td><td><code>.</code> also matches newlines</td></tr>
<tr class='text-center'><td><code>re.VERBOSE</code> / <code>re.X</code></td><td>Whitespace is ignored and <code>#</code> starts a comment - for readable patterns</td></tr>
</table>`,
            codeExamples: [
                `import re

print(re.findall(r"python", "Python PYTHON python", re.IGNORECASE))

text = "id: 1\\nname: Asha\\nid: 2"
print(re.findall(r"^id: (\\d+)", text))
print(re.findall(r"^id: (\\d+)", text, re.MULTILINE))

# OUTPUT:
# ['Python', 'PYTHON', 'python']
# ['1']
# ['1', '2']`
            ]
        },
        {
            content: `<h3>Readable Patterns with re.VERBOSE</h3>`,
            codeExamples: [
                `import re

MOBILE = re.compile(r"""
    ^
    (?:\\+91[-\\s]?)?     # optional country code
    [6-9]\\d{9}          # 10 digits, starting with 6-9
    $
""", re.VERBOSE)

for number in ["+91 9876543210", "9876543210", "12345"]:
    print(number, bool(MOBILE.match(number)))

# OUTPUT:
# +91 9876543210 True
# 9876543210 True
# 12345 False`
            ]
        },
        {
            content: `<h3>Groups and Named Groups</h3>
Parentheses <b>capture</b> part of a match. <code>(?P&lt;name&gt;...)</code> gives a group a name. Note that when a pattern contains groups, <code>findall</code> returns the <b>groups</b> rather than the whole match.`,
            codeExamples: [
                `import re

m = re.search(r"(?P<day>\\d{2})-(?P<month>\\d{2})-(?P<year>\\d{4})", "Due on 15-08-2026")
print(m.group(0), m.group(1), m.group("year"))
print(m.groupdict())

emails = "asha@gmail.com, ravi@yahoo.com"
print(re.findall(r"(\\w+)@(\\w+)\\.com", emails))

# OUTPUT:
# 15-08-2026 15 2026
# {'day': '15', 'month': '08', 'year': '2026'}
# [('asha', 'gmail'), ('ravi', 'yahoo')]`
            ]
        },
        {
            content: `<h3>Smarter Replacements</h3>
The replacement can refer to groups (<code>\\1</code>, <code>\\g&lt;name&gt;</code>) or be a <b>function</b> that receives each match object and returns the replacement text.`,
            codeExamples: [
                `import re

print(re.sub(r"(\\d{2})-(\\d{2})-(\\d{4})", r"\\3-\\2-\\1", "Exam on 15-08-2026"))

def double(m):
    return str(int(m.group()) * 2)

print(re.sub(r"\\d+", double, "3 pens, 10 books"))

# OUTPUT:
# Exam on 2026-08-15
# 6 pens, 20 books`
            ]
        },
        {
            content: `<h3>Is re.compile() Faster?</h3>
The module-level functions (<code>re.search(pattern, ...)</code>) compile the pattern and keep it in an internal cache, so calling them in a loop does not recompile every time. The main reasons to <code>compile</code> are <b>readability</b> - a named pattern constant such as <code>PIN</code> or <code>MOBILE</code> - and passing the pattern around as an object.`
        },
        {
            content: `<h3>When NOT to Use Regex</h3>
• <b>Simple text checks</b> - <code>"@" in s</code>, <code>s.startswith("http")</code>, <code>s.split(",")</code>, <code>s.replace("-", "")</code> are clearer and faster.<br>
• <b>Structured formats</b> - parse JSON with <code>json</code>, CSV with <code>csv</code>, HTML with <code>html.parser</code> or BeautifulSoup, URLs with <code>urllib.parse</code>. Regex cannot reliably handle nesting.<br>
• <b>Catastrophic backtracking</b> - nested quantifiers such as <code>(a+)+$</code> can take exponential time on input like <code>"aaaa...aab"</code>, freezing a server (a "ReDoS" attack). Keep patterns simple, anchor them, avoid nested repetition, and limit input length. Python 3.11 added atomic groups <code>(?&gt;...)</code> and possessive quantifiers <code>a++</code> to prevent this.`
        },
        {
            content: `<h3>Java Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>Pattern.compile("\\\\d+")</code></td><td><code>re.compile(r"\\d+")</code> - raw string, no doubled backslashes</td></tr>
<tr class='text-center'><td><code>matcher.find()</code></td><td><code>re.search()</code> / <code>re.finditer()</code></td></tr>
<tr class='text-center'><td><code>matcher.matches()</code></td><td><code>re.fullmatch()</code></td></tr>
<tr class='text-center'><td><code>matcher.lookingAt()</code></td><td><code>re.match()</code></td></tr>
<tr class='text-center'><td><code>str.replaceAll(regex, rep)</code></td><td><code>re.sub(pattern, rep, s)</code></td></tr>
<tr class='text-center'><td><code>str.split(regex)</code></td><td><code>re.split(pattern, s)</code> (<code>str.split</code> in Python is literal)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>re.search vs re.match vs re.fullmatch?</td><td>search finds a match anywhere; match only at the start; fullmatch requires the entire string to match</td></tr>
<tr class='text-center'><td>Why use raw strings for patterns?</td><td>So Python doesn't interpret backslash escapes (like \\b) before the regex engine sees them</td></tr>
<tr class='text-center'><td>findall vs finditer?</td><td>findall returns a list of strings (or group tuples); finditer lazily yields match objects with positions</td></tr>
<tr class='text-center'><td>What does findall return when the pattern has groups?</td><td>The captured groups, not the whole match</td></tr>
<tr class='text-center'><td>Is re.compile required for performance?</td><td>Rarely - the module caches compiled patterns; compile mainly for readability and reuse</td></tr>
<tr class='text-center'><td>What is catastrophic backtracking?</td><td>Exponential matching time caused by nested quantifiers on near-matching input; avoid nested repetition</td></tr>
</table>`
        }
    ]
};
