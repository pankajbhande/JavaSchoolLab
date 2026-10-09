import type { Topic } from '../../types';

export const regexLookarounds: Topic = {
    id: 'python-regex-lookahead-lookbehind',
    name: 'Lookahead & Lookbehind',
    beginner: [
        {
            content: `<h4>Checking Context Without Consuming It</h4>
A <b>lookaround</b> checks what comes before or after the current position <b>without including it in the match</b>. Lookarounds are <b>zero-width</b>: they test a condition and move nothing forward.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Syntax</th><th>Name</th><th>Succeeds when...</th></tr>
<tr class='text-center'><td><code>(?=...)</code></td><td>Positive lookahead</td><td>the text <b>after</b> here matches</td></tr>
<tr class='text-center'><td><code>(?!...)</code></td><td>Negative lookahead</td><td>the text after here does <b>not</b> match</td></tr>
<tr class='text-center'><td><code>(?&lt;=...)</code></td><td>Positive lookbehind</td><td>the text <b>before</b> here matches</td></tr>
<tr class='text-center'><td><code>(?&lt;!...)</code></td><td>Negative lookbehind</td><td>the text before here does <b>not</b> match</td></tr>
</table>`
        },
        {
            content: `<h4>Positive Lookahead: (?=...)</h4>
Match a number only if it is followed by " rupees" - but keep the word out of the result.`,
            codeExamples: [
                `import re

text = "Pay 500 rupees and 20 dollars"
print(re.findall(r"\\d+(?= rupees)", text))
print(re.findall(r"\\d+ rupees", text))        # without lookahead the word is included

# OUTPUT:
# ['500']
# ['500 rupees']`
            ]
        },
        {
            content: `<h4>Negative Lookahead: (?!...)</h4>
Match words starting with "java" unless "script" comes next.`,
            codeExamples: [
                `import re

text = "java javascript javafx"
print(re.findall(r"\\bjava(?!script)\\w*", text))

# OUTPUT:
# ['java', 'javafx']`
            ]
        },
        {
            content: `<h4>Lookbehind: (?&lt;=...) and (?&lt;!...)</h4>
Extract amounts written after the rupee sign, and numbers that are not negative.`,
            codeExamples: [
                `import re

bill = "Pen ₹20, Book ₹250, Bag $15"
print(re.findall(r"(?<=₹)\\d+", bill))

readings = "10 -5 20"
print(re.findall(r"(?<!-)\\b\\d+", readings))

# OUTPUT:
# ['20', '250']
# ['10', '20']`
            ]
        },
        {
            content: `<h4>Several Rules at Once</h4>
Lookaheads placed at the start of a pattern all test the <b>same position</b>, so you can require several conditions in any order. This pattern needs an uppercase letter, a digit and at least 8 characters.`,
            codeExamples: [
                `import re

rule = re.compile(r"(?=.*[A-Z])(?=.*\\d).{8,}")

for pw in ["Python123", "python123", "Python"]:
    print(pw, bool(rule.fullmatch(pw)))

# OUTPUT:
# Python123 True
# python123 False
# Python False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Zero Width in Action</h3>
A lookaround can match an <b>empty string</b> at a position. Inside a lookahead you can even capture text, which lets <code>findall</code> return <b>overlapping</b> matches - something an ordinary pattern cannot do, because it consumes characters.`,
            codeExamples: [
                `import re

m = re.search(r"(?=\\d)", "ab3")
print(m.span(), repr(m.group()))

print(re.findall(r"\\w\\w", "abcd"))           # consumes: no overlap
print(re.findall(r"(?=(\\w\\w))", "abcd"))     # overlapping pairs

# OUTPUT:
# (2, 2) ''
# ['ab', 'cd']
# ['ab', 'bc', 'cd']`
            ]
        },
        {
            content: `<h3>Inserting Thousands Separators</h3>
Insert a comma at every position that is followed by a whole number of 3-digit groups up to the end of the number. <code>\\B</code> stops a comma being inserted before the first digit.`,
            codeExamples: [
                `import re

def commas(n):
    return re.sub(r"\\B(?=(?:\\d{3})+(?!\\d))", ",", str(n))

print(commas(1234567), commas(1234), commas(999))
print(f"{1234567:,}")                           # the built-in way

# OUTPUT:
# 1,234,567 1,234 999
# 1,234,567`
            ]
        },
        {
            content: `<h3>Lookbehind Must Have a Fixed Width</h3>
Python's <code>re</code> engine must know exactly how far back to look, so quantifiers like <code>+</code> or alternatives of different lengths are not allowed inside a lookbehind. Workarounds: capture the prefix and use a group instead, or use the third-party <b>regex</b> module, which supports variable-width lookbehind.`,
            codeExamples: [
                `import re

try:
    re.compile(r"(?<=\\$\\d+)x")
except re.error as e:
    print("re.error:", e)

# Workaround: match the prefix and capture only what you want
print(re.findall(r"₹\\s*(\\d+)", "Total ₹ 450 and ₹99"))

# OUTPUT:
# re.error: look-behind requires fixed-width pattern
# ['450', '99']`
            ]
        },
        {
            content: `<h3>Readability and Java Comparison</h3>
Lookarounds are powerful but dense; when a pattern stacks many of them, separate simple checks are usually easier to read and give better error messages (see <i>Project: Password Validator</i>). Java's <code>java.util.regex</code> uses the same syntax for all four lookarounds; Java allows bounded variable-width lookbehind (such as <code>{1,3}</code>), while Python's <code>re</code> requires a fixed width.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a lookaround?</td><td>A zero-width assertion that checks text before or after the current position without consuming it</td></tr>
<tr class='text-center'><td>Lookahead vs lookbehind?</td><td>Lookahead checks what follows (<code>(?=...)</code>, <code>(?!...)</code>); lookbehind checks what precedes (<code>(?&lt;=...)</code>, <code>(?&lt;!...)</code>)</td></tr>
<tr class='text-center'><td>How do you require several conditions in one pattern?</td><td>Stack lookaheads at the start, e.g. <code>(?=.*[A-Z])(?=.*\\d).{8,}</code></td></tr>
<tr class='text-center'><td>Why does <code>(?&lt;=\\d+)</code> fail in Python?</td><td>The re module only supports fixed-width lookbehind</td></tr>
<tr class='text-center'><td>How can findall return overlapping matches?</td><td>Capture inside a lookahead: <code>(?=(pattern))</code></td></tr>
</table>`
        }
    ]
};
