import type { Topic } from '../../types';

export const regexLookaround: Topic = {
    id: 'python-regex-lookahead-lookbehind',
    name: 'Lookahead & Lookbehind',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<b>Lookarounds</b> test what comes <i>before</i> or <i>after</i> the current position <b>without consuming it</b> - they are zero-width, like <code>^</code> and <code>\\b</code>. <code>(?=...)</code> is a positive lookahead, <code>(?!...)</code> a negative lookahead, <code>(?&lt;=...)</code> a positive lookbehind and <code>(?&lt;!...)</code> a negative lookbehind.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 420 133" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="184.6" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="102.3" y="27">Lookahead (?=...)</tspan></text><rect x="10" y="44" width="184.6" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="102.3" y="62.5">checks the text AFTER</tspan></text><rect x="10" y="79" width="184.6" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="102.3" y="97.5">\\w+(?=@) on asha@x.com</tspan><tspan x="102.3" y="112.5">-&gt; "asha"</tspan></text><rect x="224.6" y="10" width="184.6" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="316.9" y="27">Lookbehind (?&lt;=...)</tspan></text><rect x="224.6" y="44" width="184.6" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="316.9" y="62.5">checks the text BEFORE</tspan></text><rect x="224.6" y="79" width="184.6" height="44" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="316.9" y="97.5">(?&lt;=\\$)\\d+ on $120</tspan><tspan x="316.9" y="112.5">-&gt; "120"</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the checked text is not part of the match</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Sometimes you need only the digits <i>after</i> a "$", or a word <i>only if</i> it is followed by "@". Capturing the surrounding text and then trimming it away is clumsy and error-prone.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Match a value <b>only in context</b> (after a currency symbol, before an @).</li>
<li><b>Exclude</b> unwanted contexts with negative lookarounds.</li>
<li>Combine several independent conditions at one position (password rules).</li>
<li>Insert text at a <b>position</b> without replacing characters (thousands separators).</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Matching in context</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re


def main():
    prices = "Items: pen $5, book $120, bag (no price) 30 units"

    print("after $      :", re.findall(r"(?<=\\$)\\d+", prices))
    print("not after $  :", re.findall(r"(?<!\\$)\\b\\d+\\b", prices))
    print("name before @:", re.findall(r"\\w+(?=@)", "asha@x.com ravi@y.in"))
    print("commas       :", re.sub(r"\\B(?=(?:\\d{3})+(?!\\d))", ",", "1234567"))


if __name__ == "__main__":
    main()

# OUTPUT:
# after $      : ['5', '120']
# not after $  : ['30']
# name before @: ['asha', 'ravi']
# commas       : 1,234,567`
            ],
            codeExplanations: [
                `(?<=\\$) requires a dollar sign before the digits but does not include it in the result. (?<!\\$) is the opposite: digits NOT preceded by a dollar. For the comma recipe, \\B(?=(?:\\d{3})+(?!\\d)) matches a position (no characters) that is followed by groups of three digits up to the end, and sub() inserts a comma at each such position.`
            ]
        },
        {
            content: `<h4>Look Without Consuming</h4>
<b>Lookarounds</b> check what comes <i>before</i> or <i>after</i> the current position <b>without including it in the match</b>. They are zero-width, like <code>^</code> and <code>\\b</code>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Syntax</th><th>Name</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>(?=...)</code></td><td>Positive lookahead</td><td>followed by ...</td></tr>
<tr class='text-center'><td><code>(?!...)</code></td><td>Negative lookahead</td><td>NOT followed by ...</td></tr>
<tr class='text-center'><td><code>(?&lt;=...)</code></td><td>Positive lookbehind</td><td>preceded by ...</td></tr>
<tr class='text-center'><td><code>(?&lt;!...)</code></td><td>Negative lookbehind</td><td>NOT preceded by ...</td></tr>
</table>`,
            codeExamples: [
                `import re

emails = "asha@x.com ravi@y.com"
print(re.findall(r"\\w+(?=@)", emails))      # names that are followed by @

# OUTPUT:
# ['asha', 'ravi']`
            ],
            codeExplanations: [
                `\\w+ matches the word, and (?=@) only checks that an @ comes next - but the @ is not part of the result. Without the lookahead you would have to capture the name in a group and drop the @ yourself.`
            ]
        },
        {
            content: `<h4>Lookbehind: Match After Something</h4>
Use a lookbehind to match a value only when it follows a given prefix, such as a currency symbol, without capturing the prefix.`,
            codeExamples: [
                `import re

text = "cost $50 and $120, not 30"

print(re.findall(r"(?<=\\$)\\d+", text))       # numbers after a $
print(re.findall(r"(?<!\\$)\\b\\d+", text))     # numbers NOT after a $

# OUTPUT:
# ['50', '120']
# ['30']`
            ]
        },
        {
            content: `<h4>Negative Lookahead: Exclude Something</h4>
<code>(?!...)</code> rejects a match when a given text follows. Here we want file names whose extension is <b>not</b> .txt.`,
            codeExamples: [
                `import re

files = "a.txt b.py c.md"

print(re.findall(r"\\b\\w+\\.(?!txt\\b)\\w+\\b", files))

# OUTPUT:
# ['b.py', 'c.md']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Lookbehind Must Have a Fixed Width</h3>
Python's <code>re</code> needs to know how many characters to step back, so a lookbehind cannot contain variable-length quantifiers like <code>+</code> or <code>*</code>. Rewrite it with a fixed-length pattern, capture the prefix in a group, or use the third-party <code>regex</code> package, which allows variable-width lookbehind.`,
            codeExamples: [
                `import re

try:
    re.compile(r"(?<=a+)b")
except re.error as error:
    print("re.error:", error)

print(re.findall(r"(?<=\\$)\\d+", "$5"))       # fixed width: fine
print(re.findall(r"\\$(\\d+)", "$5 $15"))      # alternative: capture a group

# OUTPUT:
# re.error: look-behind requires fixed-width pattern
# ['5']
# ['5', '15']`
            ]
        },
        {
            content: `<h3>Several Lookaheads at One Position: AND Logic</h3>
Because lookaheads consume nothing, you can stack several at the <b>same position</b>. Each must succeed, giving you an "AND" of independent conditions. This is the standard trick for password rules (you will build that in the project topic).`,
            codeExamples: [
                `import re

STRONG = re.compile(r"(?=.*\\d)(?=.*[A-Z]).{8,}")

print(bool(STRONG.fullmatch("Passw0rdX")))   # digit + capital + length
print(bool(STRONG.fullmatch("password")))    # no digit, no capital

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h3>Practical Recipe: Thousands Separators</h3>
<code>\\B</code> (not a word boundary) combined with a lookahead inserts commas between digit groups without consuming any digits: insert a comma at each position that is followed by a multiple of three digits up to the end.`,
            codeExamples: [
                `import re

def with_commas(number_text):
    return re.sub(r"\\B(?=(?:\\d{3})+(?!\\d))", ",", number_text)

print(with_commas("1234567"))
print(with_commas("999"))
print(with_commas("1000"))

# OUTPUT:
# 1,234,567
# 999
# 1,000`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Match in context while keeping the result clean</td><td>Lookbehind must be fixed-width in <code>re</code></td></tr>
<tr><td>Several lookaheads at one position give "AND" logic</td><td>Hard to read; easy to get wrong without tests</td></tr>
<tr><td>Can insert text at positions (zero-width substitution)</td><td>Overuse hurts performance on long text</td></tr>
<tr><td>Avoids post-processing code to trim captured context</td><td>Not available in every regex flavour (older engines)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "zero-width" mean?</td><td>The lookaround checks the text but consumes no characters, so it is not part of the match</td></tr>
<tr class='text-center'><td>Lookahead vs lookbehind?</td><td>Lookahead checks text after the position <code>(?=...)</code>; lookbehind checks text before it <code>(?&lt;=...)</code></td></tr>
<tr class='text-center'><td>Why does <code>(?&lt;=a+)b</code> fail in re?</td><td>Lookbehind needs a fixed width; the <code>regex</code> package lifts that limit</td></tr>
<tr class='text-center'><td>How do you require several conditions at once?</td><td>Stack lookaheads at the start: <code>(?=.*\\d)(?=.*[A-Z])...</code></td></tr>
<tr class='text-center'><td>Lookaround vs capturing group?</td><td>A lookaround leaves the checked text out of the match; a group captures it as part of the match</td></tr>
</table>`
        }
    ]
};
