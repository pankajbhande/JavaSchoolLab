import type { Topic } from '../../types';

export const regexFindallSub: Topic = {
    id: 'python-regex-re-findall-re-sub',
    name: 're.findall() & re.sub()',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Searching for the <i>first</i> match is often not enough. <code>re.findall()</code> collects <b>every</b> match into a list, <code>re.finditer()</code> yields them lazily with positions, and <code>re.sub()</code> <b>replaces</b> matches with new text. Together they cover extract, count and rewrite - the three most common text-processing jobs.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 489 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:489px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="97" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="58.5" y="38">input text</tspan></text><line x1="107" y1="34" x2="137" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="141" y="10" width="155.4" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="218.7" y="30.5">findall(pattern)</tspan><tspan x="218.7" y="45.5">-&gt; list of matches</tspan></text><line x1="296.4" y1="34" x2="326.4" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="330.4" y="10" width="148.1" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="404.5" y="30.5">sub(pattern, new)</tspan><tspan x="404.5" y="45.5">-&gt; new string</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: findall extracts, sub rewrites; the original string is never modified</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Pulling every email out of a document, or masking every phone number, with <code>split()</code>/<code>replace()</code> needs custom loops and breaks on the first unusual input.
<br><br>
<b>Why we need it:</b>
<ul>
<li><b>Extract</b> all values of a kind (emails, prices, ids) in one call.</li>
<li><b>Rewrite</b> text safely: masking, normalising whitespace, reformatting dates.</li>
<li><b>Count</b> occurrences of a pattern without manual loops.</li>
<li>Keep data-cleaning code short, declarative and testable.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Extract, mask and count</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re


def main():
    text = "Contact asha@example.com or ravi@mail.in. Call 98765 43210 or 91234 56789."

    emails = re.findall(r"[\\w.]+@[\\w.]+\\w", text)
    print("Emails :", emails)

    numbers = re.findall(r"\\d{5} \\d{5}", text)
    print("Numbers:", numbers)

    masked = re.sub(r"\\d{5} (\\d{5})", r"XXXXX \\1", text)
    print("Masked :", masked)

    print("Digits :", len(re.findall(r"\\d", text)))


if __name__ == "__main__":
    main()

# OUTPUT:
# Emails : ['asha@example.com', 'ravi@mail.in']
# Numbers: ['98765 43210', '91234 56789']
# Masked : Contact asha@example.com or ravi@mail.in. Call XXXXX 43210 or XXXXX 56789.
# Digits : 20`
            ],
            codeExplanations: [
                `findall returns plain strings because the pattern has no groups. In sub(), the replacement r"XXXXX \\1" keeps the second block of digits using the backreference \\1. Counting digits is just the length of the findall list.`
            ]
        },
        {
            content: `<h4>re.findall(): Collect Every Match</h4>
<code>re.findall(pattern, text)</code> returns a <b>list of all non-overlapping matches</b>, as strings. If nothing matches you get an empty list (never <code>None</code>), so it is safe to loop over directly.`,
            codeExamples: [
                `import re

text = "Call 98765 or 12345 now"

print(re.findall(r"\\d+", text))
print(re.findall(r"\\d{10}", text))      # no 10-digit number here

# OUTPUT:
# ['98765', '12345']
# []`
            ]
        },
        {
            content: `<h4>re.sub(): Search and Replace</h4>
<code>re.sub(pattern, replacement, text)</code> returns a <b>new string</b> with every match replaced (strings are immutable, so the original is unchanged). Use the optional <code>count</code> to limit the number of replacements.`,
            codeExamples: [
                `import re

print(re.sub(r"\\d", "#", "PIN 4821"))
print(re.sub(r"\\s+", " ", "too    many   spaces"))
print(re.sub(r"\\d", "#", "a1b2c3", count=2))

# OUTPUT:
# PIN ####
# too many spaces
# a#b#c3`
            ]
        },
        {
            content: `<h4>re.finditer(): Matches With Positions</h4>
<code>findall()</code> gives only the text. When you also need <b>where</b> each match is, <code>re.finditer()</code> yields a Match object for each one, lazily.`,
            codeExamples: [
                `import re

for m in re.finditer(r"\\d+", "a12 b345"):
    print(m.group(), m.span())

# OUTPUT:
# 12 (1, 3)
# 345 (5, 8)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>findall() and Groups: The Return Type Changes</h3>
What <code>findall()</code> returns depends on how many <b>capturing groups</b> the pattern has: no groups gives a list of strings, one group gives a list of that group's text, and several groups give a list of <b>tuples</b>. Use non-capturing groups <code>(?:...)</code> when you only need grouping.`,
            codeExamples: [
                `import re

text = "a=1, b=22"

print(re.findall(r"\\w+=\\d+", text))         # no groups -> whole matches
print(re.findall(r"(\\w+)=\\d+", text))       # one group -> that group only
print(re.findall(r"(\\w+)=(\\d+)", text))     # two groups -> tuples
print(dict(re.findall(r"(\\w+)=(\\d+)", text)))

# OUTPUT:
# ['a=1', 'b=22']
# ['a', 'b']
# [('a', '1'), ('b', '22')]
# {'a': '1', 'b': '22'}`
            ]
        },
        {
            content: `<h3>Backreferences in the Replacement</h3>
In the replacement string, <code>\\1</code>, <code>\\2</code> (or <code>\\g&lt;name&gt;</code>) insert text captured by the pattern's groups. This lets you <b>rearrange</b> text rather than just replace it.`,
            codeExamples: [
                `import re

print(re.sub(r"(\\w+)@(\\w+)\\.com", r"\\2: \\1", "asha@example.com"))

print(re.sub(r"(?P<d>\\d{2})/(?P<m>\\d{2})/(?P<y>\\d{4})",
             r"\\g<y>-\\g<m>-\\g<d>", "05/10/2026"))

# OUTPUT:
# example: asha
# 2026-10-05`
            ]
        },
        {
            content: `<h3>A Function as the Replacement</h3>
When the replacement needs <b>logic</b>, pass a function. It receives each Match object and must return the replacement string. <code>re.subn()</code> additionally reports how many substitutions were made, and <code>re.split()</code> splits on a pattern instead of a fixed separator.`,
            codeExamples: [
                `import re

def double(m):
    return str(int(m.group()) * 2)

print(re.sub(r"\\d+", double, "3 apples, 10 pears"))
print(re.subn(r"\\d", "#", "a1b2"))
print(re.split(r"[,;]\\s*", "a, b;c,  d"))

# OUTPUT:
# 6 apples, 20 pears
# ('a#b#', 2)
# ['a', 'b', 'c', 'd']`
            ]
        },
        {
            content: `<h3>Zero-Length Matches and Edge Cases</h3>
A pattern that can match the <b>empty string</b> (like <code>\\d*</code>) matches at every position where nothing else fits. Since Python 3.7 this also affects <code>sub()</code> and <code>split()</code>, so patterns with <code>*</code> deserve a second look.`,
            codeExamples: [
                `import re

print(re.findall(r"\\d*", "a1"))
print(re.sub(r"x*", "-", "abc"))

# OUTPUT:
# ['', '1', '']
# -a-b-c-`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Extract or rewrite every occurrence in a single call</td><td>Return type of <code>findall</code> changes with the number of groups</td></tr>
<tr><td><code>sub</code> accepts a function for computed replacements</td><td>Greedy patterns can swallow more text than intended</td></tr>
<tr><td><code>finditer</code> is lazy and memory-friendly for big text</td><td>Zero-length matches (<code>\\d*</code>) give surprising results</td></tr>
<tr><td>Original string is untouched (strings are immutable)</td><td>Very large inputs may need streaming instead of one big string</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does findall() return when there is no match?</td><td>An empty list, not None</td></tr>
<tr class='text-center'><td>Why does findall() sometimes return tuples?</td><td>When the pattern has two or more capturing groups, each match becomes a tuple of the groups</td></tr>
<tr class='text-center'><td>findall() vs finditer()?</td><td>findall() builds a list of strings; finditer() lazily yields Match objects with positions - better for large inputs</td></tr>
<tr class='text-center'><td>Does re.sub() modify the original string?</td><td>No - strings are immutable; it returns a new string</td></tr>
<tr class='text-center'><td>How do you compute the replacement dynamically?</td><td>Pass a function that takes a Match and returns a string</td></tr>
</table>`
        }
    ]
};
