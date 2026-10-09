import type { Topic } from '../../types';

export const regexQuantifiers: Topic = {
    id: 'python-regex-quantifiers',
    name: 'Quantifiers',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>quantifier</b> says how many times the thing before it may repeat: <code>?</code> (0 or 1), <code>*</code> (0 or more), <code>+</code> (1 or more), <code>{n}</code> (exactly n) and <code>{n,m}</code> (between n and m). By default they are <b>greedy</b> - they take as much text as possible; adding <code>?</code> makes them <b>lazy</b> - as little as possible.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 522 133" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:522px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="235.7" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="127.9" y="27">greedy  &lt;.+&gt;</tspan></text><rect x="10" y="44" width="235.7" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="127.9" y="62.5">takes as much as possible</tspan></text><rect x="10" y="79" width="235.7" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="127.9" y="97.5">&lt;b&gt;bold&lt;/b&gt; and &lt;i&gt;italic&lt;/i&gt;</tspan><tspan x="127.9" y="112.5">(one giant match)</tspan></text><rect x="275.7" y="10" width="235.7" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="393.5" y="27">lazy  &lt;.+?&gt;</tspan></text><rect x="275.7" y="44" width="235.7" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="393.5" y="62.5">takes as little as possible</tspan></text><rect x="275.7" y="79" width="235.7" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="393.5" y="97.5">&lt;b&gt;  &lt;/b&gt;  &lt;i&gt;  &lt;/i&gt;</tspan><tspan x="393.5" y="112.5">(four small matches)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: greedy runs to the last "&gt;", lazy stops at the first one</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A pattern that can match only one fixed length of text is useless on real data: phone numbers, names and tags all vary in length.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Match <b>variable-length</b> text such as "one or more digits".</li>
<li>Make parts <b>optional</b> (<code>colou?r</code>).</li>
<li>Control <b>how much</b> is captured between delimiters (greedy vs lazy).</li>
<li>Recognise <b>catastrophic backtracking</b> before it freezes a server.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Every quantifier on real text</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re


def main():
    html = "<b>bold</b> and <i>italic</i>"

    print("optional  :", re.findall(r"colou?r", "color colour"))
    print("exactly 3 :", re.findall(r"\\d{3}", "12 123 12345"))
    print("2 to 4    :", re.findall(r"\\d{2,4}", "1 12 12345"))
    print("greedy    :", re.findall(r"<.+>", html))
    print("lazy      :", re.findall(r"<.+?>", html))
    print("negated   :", re.findall(r"<[^>]+>", html))


if __name__ == "__main__":
    main()

# OUTPUT:
# optional  : ['color', 'colour']
# exactly 3 : ['123', '123']
# 2 to 4    : ['12', '1234']
# greedy    : ['<b>bold</b> and <i>italic</i>']
# lazy      : ['<b>', '</b>', '<i>', '</i>']
# negated   : ['<b>', '</b>', '<i>', '</i>']`
            ],
            codeExplanations: [
                `"12345" gives only "123" for {3} because the engine takes three digits at a time and the leftover "45" is too short. For {2,4} it takes "1234" and the leftover "5" is too short. The negated class <[^>]+> reaches the same result as the lazy version but without backtracking - usually the better choice.`
            ]
        },
        {
            content: `<h4>How Many Times?</h4>
A <b>quantifier</b> goes right after a character, class or group and says how many times it may repeat.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Quantifier</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>?</code></td><td>0 or 1 (optional)</td></tr>
<tr class='text-center'><td><code>*</code></td><td>0 or more</td></tr>
<tr class='text-center'><td><code>+</code></td><td>1 or more</td></tr>
<tr class='text-center'><td><code>{n}</code></td><td>exactly n</td></tr>
<tr class='text-center'><td><code>{n,m}</code></td><td>between n and m</td></tr>
<tr class='text-center'><td><code>{n,}</code></td><td>n or more</td></tr>
</table>`,
            codeExamples: [
                `import re

print(re.findall(r"colou?r", "color colour colouur"))
print(re.findall(r"\\d{3}", "12 123 12345"))
print(re.findall(r"\\d{2,4}", "1 12 12345 123456"))

# OUTPUT:
# ['color', 'colour']
# ['123', '123']
# ['12', '1234', '1234', '56']`
            ],
            codeExplanations: [
                `colou?r makes the "u" optional, so color and colour match, but "colouur" does not. \\d{3} grabs exactly three digits at a time, so "12345" yields only "123". \\d{2,4} takes up to four digits per match: "12345" becomes "1234" (the leftover "5" is too short) and "123456" becomes "1234" and "56".`
            ]
        },
        {
            content: `<h4>Greedy vs Lazy</h4>
By default quantifiers are <b>greedy</b>: they take as much text as possible. Add a <code>?</code> after the quantifier to make it <b>lazy</b> - it takes as little as possible. The difference is most visible when grabbing text between delimiters.`,
            codeExamples: [
                `import re

html = "<b>bold</b> and <i>italic</i>"

print(re.findall(r"<.+>", html))      # greedy: one giant match
print(re.findall(r"<.+?>", html))     # lazy: each tag separately

# OUTPUT:
# ['<b>bold</b> and <i>italic</i>']
# ['<b>', '</b>', '<i>', '</i>']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Backtracking: How the Engine Decides</h3>
Python's regex engine is a <b>backtracking</b> matcher. A greedy quantifier first grabs the maximum, then <b>gives characters back</b> one at a time if the rest of the pattern fails. That is why <code>a*a</code> still matches "aaa": <code>a*</code> takes all three, the final <code>a</code> fails, so it backs off one.`,
            codeExamples: [
                `import re

print(bool(re.fullmatch(r"a*a", "aaa")))

m = re.match(r"(.*)(\\d+)", "abc123")
print(m.groups())             # greedy .* steals digits first

m = re.match(r"(.*?)(\\d+)", "abc123")
print(m.groups())             # lazy .*? stops as early as it can

# OUTPUT:
# True
# ('abc12', '3')
# ('abc', '123')`
            ]
        },
        {
            content: `<h3>Catastrophic Backtracking (ReDoS)</h3>
Nested quantifiers over overlapping text, such as <code>(a+)+$</code>, can force the engine to try an <b>exponential</b> number of ways to split the input before it fails. A short crafted string can then freeze a server - a real attack class called <b>ReDoS</b> (regular-expression denial of service).

Defences: avoid nested quantifiers on the same characters, anchor patterns, limit input length before matching, and treat user-supplied patterns as untrusted.`,
            codeExamples: [
                `import re, time

evil = re.compile(r"(a+)+$")

for n in (16, 20, 24):
    text = "a" * n + "b"          # almost matches, then fails on 'b'
    start = time.perf_counter()
    evil.match(text)
    print(n, round(time.perf_counter() - start, 3), "seconds")

# OUTPUT: exact times depend on your machine, but each extra 'a'
# roughly doubles the time. Try n = 28 only if you are prepared to wait.`
            ]
        },
        {
            content: `<h3>Possessive Quantifiers and Atomic Groups (3.11+)</h3>
Since Python 3.11 you can write <b>possessive</b> quantifiers (<code>*+</code>, <code>++</code>, <code>?+</code>) and <b>atomic groups</b> <code>(?>...)</code>. They never give characters back, which removes whole classes of backtracking blow-ups - at the price that the pattern may then fail where a greedy one would succeed.`,
            codeExamples: [
                `import re

print(bool(re.fullmatch(r"a*a", "aaa")))     # greedy backs off: matches
print(bool(re.fullmatch(r"a*+a", "aaa")))    # possessive keeps all a's: fails
print(bool(re.fullmatch(r"(?>a+)b", "aaab")))

# OUTPUT (Python 3.11+):
# True
# False
# True`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Express "optional", "repeated" and "bounded" in one symbol</td><td>Greedy default surprises beginners (<code>&lt;.+&gt;</code>)</td></tr>
<tr><td>Lazy quantifiers solve "text between delimiters" problems</td><td>Nested quantifiers like <code>(a+)+</code> can cause ReDoS</td></tr>
<tr><td>Possessive quantifiers (3.11+) prevent needless backtracking</td><td>Zero-length matches from <code>*</code> confuse <code>findall</code>/<code>sub</code></td></tr>
<tr><td>Short patterns stay readable when quantifiers are used well</td><td>Hard to debug without a visualiser or tests</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Greedy vs lazy quantifier?</td><td>Greedy matches as much as possible and backs off; lazy (<code>*?</code>, <code>+?</code>) matches as little as possible and expands</td></tr>
<tr class='text-center'><td>Why does <code>&lt;.+&gt;</code> match too much on HTML?</td><td>The greedy <code>.+</code> runs to the last <code>&gt;</code>; use <code>&lt;.+?&gt;</code> or <code>&lt;[^&gt;]+&gt;</code></td></tr>
<tr class='text-center'><td>What is catastrophic backtracking?</td><td>Exponential matching time caused by nested/overlapping quantifiers on failing input (ReDoS)</td></tr>
<tr class='text-center'><td>What is a possessive quantifier?</td><td>A quantifier that never gives back characters (<code>a*+</code>); available from Python 3.11</td></tr>
<tr class='text-center'><td>What does <code>\\d*</code> match in "a"?</td><td>The empty string at each position - zero-length matches are legal</td></tr>
</table>`
        }
    ]
};
