import type { Topic } from '../../types';

export const regexCharacterClasses: Topic = {
    id: 'python-regex-character-classes',
    name: 'Character Classes',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>character class</b> matches exactly <b>one character</b> chosen from a set. Square brackets list the allowed characters (<code>[aeiou]</code>), hyphens give ranges (<code>[a-z]</code>), a leading <code>^</code> negates (<code>[^0-9]</code>), and shorthands such as <code>\\d</code>, <code>\\w</code> and <code>\\s</code> cover the usual sets. The dot <code>.</code> matches any character except a newline.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 372 199" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:372px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="351.2" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="185.6" y="29.5">[abc]   one of: a, b or c</tspan></text><rect x="10" y="47" width="351.2" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="185.6" y="66.5">[a-z0-9]   a range: a to z or 0 to 9</tspan></text><rect x="10" y="84" width="351.2" height="31" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="185.6" y="103.5">[^0-9]   NOT a digit</tspan></text><rect x="10" y="121" width="351.2" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="185.6" y="140.5">\\d  digit    \\w  word char    \\s  whitespace</tspan></text><rect x="10" y="158" width="351.2" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="185.6" y="177.5">.   any character except newline</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: each class consumes exactly one character of input</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Without classes you would write <code>a|b|c|d|...</code> for every allowed character, or loop over characters and test each one by hand.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Say "any digit", "any letter", "any whitespace" in two characters.</li>
<li>Build <b>building blocks</b> that quantifiers and groups repeat.</li>
<li>Exclude characters with negation (<code>[^,]</code> = anything but a comma).</li>
<li>Understand Unicode behaviour: <code>\\d</code> and <code>\\w</code> match more than ASCII unless told otherwise.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Classifying the characters of a string</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re


def main():
    text = "Order #A-12: 3 items @ Rs.450!"

    print("digits    :", re.findall(r"\\d+", text))
    print("words     :", re.findall(r"\\w+", text))
    print("uppercase :", re.findall(r"[A-Z]", text))
    print("symbols   :", sorted(set(re.findall(r"[^\\w\\s]", text))))
    print("vowels    :", len(re.findall(r"[aeiou]", text, re.IGNORECASE)))


if __name__ == "__main__":
    main()

# OUTPUT:
# digits    : ['12', '3', '450']
# words     : ['Order', 'A', '12', '3', 'items', 'Rs', '450']
# uppercase : ['O', 'A', 'R']
# symbols   : ['!', '#', '-', '.', ':', '@']
# vowels    : 5`
            ],
            codeExplanations: [
                `[^\\w\\s] means "not a word character and not whitespace", i.e. punctuation and symbols. re.IGNORECASE makes [aeiou] also match capital vowels, so "O" in "Order" and "A" are counted.`
            ]
        },
        {
            content: `<h4>Matching One Character From a Set</h4>
A <b>character class</b> in square brackets matches <b>exactly one</b> character out of those listed. Use a hyphen for a range, and <code>^</code> as the first character to <b>negate</b> the class.`,
            codeExamples: [
                `import re

print(re.findall(r"[aeiou]", "education"))        # vowels
print(re.findall(r"[A-Z][a-z]+", "Asha met Ravi in Pune"))
print(re.findall(r"[^0-9]+", "ab12cd3"))           # anything except digits

# OUTPUT:
# ['e', 'u', 'a', 'i', 'o']
# ['Asha', 'Ravi', 'Pune']
# ['ab', 'cd']`
            ]
        },
        {
            content: `<h4>Shorthand Classes</h4>
Common classes have short names. The upper-case version is always the <b>opposite</b>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Shorthand</th><th>Matches</th><th>Equivalent</th></tr>
<tr class='text-center'><td><code>\\d</code> / <code>\\D</code></td><td>digit / non-digit</td><td><code>[0-9]</code> / <code>[^0-9]</code></td></tr>
<tr class='text-center'><td><code>\\w</code> / <code>\\W</code></td><td>word character / non-word</td><td><code>[A-Za-z0-9_]</code> (plus Unicode letters)</td></tr>
<tr class='text-center'><td><code>\\s</code> / <code>\\S</code></td><td>whitespace / non-whitespace</td><td>space, tab, newline...</td></tr>
<tr class='text-center'><td><code>.</code></td><td>any character except newline</td><td><code>[^\\n]</code></td></tr>
</table>`,
            codeExamples: [
                `import re

s = "Id: A_12 - $5"

print(re.findall(r"\\d", s))
print(re.findall(r"\\w+", s))
print(len(re.findall(r"\\s", s)))

# OUTPUT:
# ['1', '2', '5']
# ['Id', 'A_12', '5']
# 3`
            ]
        },
        {
            content: `<h4>The Dot and Escaping</h4>
The dot <code>.</code> matches <b>any</b> character, so to match a literal dot you must escape it as <code>\\.</code>. The same goes for the other special characters: <code>. ^ $ * + ? { } [ ] \\ | ( )</code>.`,
            codeExamples: [
                `import re

print(re.findall(r"a.c", "abc a-c a.c ac"))     # dot = any one character
print(re.findall(r"a\\.c", "abc a.c"))           # escaped dot = literal dot

# OUTPUT:
# ['abc', 'a-c', 'a.c']
# ['a.c']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Inside a Class, Most Special Characters Are Literal</h3>
Within <code>[...]</code> the characters <code>. * + ?</code> lose their special meaning, so they need no escape. Only <code>]</code>, <code>\\</code>, <code>^</code> (first position) and <code>-</code> (between characters) stay special. Put a hyphen <b>first, last, or escaped</b> to match it literally.`,
            codeExamples: [
                `import re

print(re.findall(r"[.*+?]", "a.b*c+d?e"))
print(re.findall(r"[a\\-z]", "a-z b"))        # escaped hyphen: only a, - and z
print(re.findall(r"[\\w.-]+", "ravi.k-1 @x"))  # hyphen last is literal

# OUTPUT:
# ['.', '*', '+', '?']
# ['a', '-', 'z']
# ['ravi.k-1', 'x']`
            ]
        },
        {
            content: `<h3>\\d and \\w Are Unicode-Aware</h3>
For <code>str</code> patterns, <code>\\d</code> matches <b>any Unicode digit</b> (Devanagari, Arabic-Indic, ...) and <code>\\w</code> matches letters of every script. That is usually what you want for text, but a surprise when validating ASCII-only input. Add <code>re.ASCII</code> to restrict them, or use an explicit <code>[0-9]</code>.`,
            codeExamples: [
                `import re

text = "\\u0969" + "4"        # Devanagari digit three, then ASCII 4

print(re.findall(r"\\d", text))
print(re.findall(r"\\d", text, re.ASCII))
print(re.findall(r"[0-9]", text))
print(int("\\u0969"))          # Python can even convert it

# OUTPUT:
# ['३', '4']
# ['4']
# ['4']
# 3`
            ]
        },
        {
            content: `<h3>Word Boundaries: \\b</h3>
<code>\\b</code> is not a character class but a <b>zero-width assertion</b>: it matches the position between a word character and a non-word character (or a string edge). It lets you match whole words only.`,
            codeExamples: [
                `import re

text = "cat concatenate cat."

print(re.findall(r"cat", text))
print(re.findall(r"\\bcat\\b", text))

# OUTPUT:
# ['cat', 'cat', 'cat']
# ['cat', 'cat']`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Replace long alternations with one short set</td><td><code>\\d</code>, <code>\\w</code> are Unicode-aware: more than ASCII matches</td></tr>
<tr><td>Shorthands (<code>\\d \\w \\s</code>) are portable and readable</td><td>Inside <code>[...]</code> the hyphen and caret have special rules</td></tr>
<tr><td>Negation makes "everything except" rules easy</td><td>The dot does not match newlines unless <code>re.DOTALL</code> is set</td></tr>
<tr><td>Same syntax in most languages (Java, JavaScript, Perl)</td><td>No POSIX classes like <code>[[:alpha:]]</code> in <code>re</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>[^abc]</code> match?</td><td>Any single character that is not a, b or c (including newline)</td></tr>
<tr class='text-center'><td>Difference between <code>.</code> and <code>\\.</code>?</td><td>The dot matches any character except newline; the escaped dot matches a literal period</td></tr>
<tr class='text-center'><td>Does <code>\\w</code> include underscore?</td><td>Yes - letters, digits and underscore</td></tr>
<tr class='text-center'><td>How do you make \\d match only 0-9?</td><td>Use <code>[0-9]</code> or the <code>re.ASCII</code> flag</td></tr>
<tr class='text-center'><td>What is <code>\\b</code>?</td><td>A zero-width word boundary - it consumes no characters</td></tr>
</table>`
        }
    ]
};
