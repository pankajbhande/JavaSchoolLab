import type { Topic } from '../../types';

export const regexEmailValidator: Topic = {
    id: 'python-regex-project-email-validator',
    name: 'Project: Email Validator',
    beginner: [
        {
            content: `<h4>The Task</h4>
Write a function <code>is_valid_email(text)</code> that accepts sensible addresses like <code>abaji@gmail.com</code> and rejects obvious mistakes: a missing <code>@</code>, two <code>@</code> signs, spaces, or a domain without an extension.<br><br>
<b>Concepts practised:</b> character classes, quantifiers, non-capturing groups, <code>re.compile</code> and <code>fullmatch</code>.`
        },
        {
            content: `<h4>Step 1: Break an Address into Parts</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Part</th><th>Example</th><th>Pattern</th></tr>
<tr class='text-center'><td>Local part</td><td><code>raoji.kumar+news</code></td><td><code>[A-Za-z0-9._%+-]+</code></td></tr>
<tr class='text-center'><td>The @ sign</td><td><code>@</code></td><td><code>@</code></td></tr>
<tr class='text-center'><td>Domain labels</td><td><code>mail.co</code></td><td><code>[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*</code></td></tr>
<tr class='text-center'><td>Top-level domain</td><td><code>.in</code></td><td><code>\\.[A-Za-z]{2,}</code></td></tr>
</table>
<code>fullmatch</code> makes sure the <b>whole</b> string is an address, not just part of it.`
        },
        {
            content: `<h4>Step 2: The Complete Validator</h4>`,
            codeExamples: [
                `import re

EMAIL = re.compile(
    r"[A-Za-z0-9._%+-]+"                   # local part
    r"@"
    r"[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*"   # domain labels
    r"\\.[A-Za-z]{2,}"                      # top-level domain
)

def is_valid_email(text):
    return EMAIL.fullmatch(text.strip()) is not None

tests = [
    "abaji@gmail.com",
    "raoji.kumar+news@mail.co.in",
    "user@localhost",
    "no-at-sign.com",
    "two@@mail.com",
    "spaces in@mail.com",
    "a@b.c",
    "user@mail.123",
]
for t in tests:
    print(f"{t:<28} {is_valid_email(t)}")

# OUTPUT:
# abaji@gmail.com              True
# raoji.kumar+news@mail.co.in  True
# user@localhost               False
# no-at-sign.com               False
# two@@mail.com                False
# spaces in@mail.com           False
# a@b.c                        False
# user@mail.123                False`
            ]
        },
        {
            content: `<h4>Step 3: Finding Emails in Text</h4>
Without <code>fullmatch</code>, the same pattern can <b>extract</b> addresses from a paragraph. Because the pattern only uses non-capturing groups <code>(?:...)</code>, <code>findall</code> returns whole matches.`,
            codeExamples: [
                `import re

EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}")

text = "Contact abaji@gmail.com or raoji@yahoo.co.in."
print(EMAIL.findall(text))

# OUTPUT:
# ['abaji@gmail.com', 'raoji@yahoo.co.in']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Edge Cases the Simple Pattern Misses</h3>
The local part above accepts any mix of dots, so <code>dot..dot@mail.com</code> and <code>.start@mail.com</code> pass even though mail servers reject them. Requiring dots to sit <b>between</b> other characters fixes this.`,
            codeExamples: [
                `import re

SIMPLE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}")
STRICT = re.compile(
    r"[A-Za-z0-9_%+-]+(?:\\.[A-Za-z0-9_%+-]+)*"    # no leading, trailing or double dots
    r"@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}"
)

for t in ["dot..dot@mail.com", ".start@mail.com", "ok.name@mail.com"]:
    print(t, bool(SIMPLE.fullmatch(t)), bool(STRICT.fullmatch(t)))

# OUTPUT:
# dot..dot@mail.com True False
# .start@mail.com True False
# ok.name@mail.com True True`
            ]
        },
        {
            content: `<h3>Testing the Validator</h3>
Validation rules change over time - a parametrised test keeps every known case pinned down.`,
            codeExamples: [
                `# test_email.py   (run with: pytest)
import pytest
from validators import is_valid_email

@pytest.mark.parametrize("email, expected", [
    ("abaji@gmail.com", True),
    ("raoji.kumar+news@mail.co.in", True),
    ("two@@mail.com", False),
    ("user@localhost", False),
    ("  abaji@gmail.com  ", True),          # surrounding spaces are stripped
])
def test_is_valid_email(email, expected):
    assert is_valid_email(email) == expected`
            ]
        },
        {
            content: `<h3>Why a "Perfect" Email Regex Is Impractical</h3>
The official grammar (RFC 5322) allows quoted local parts (<code>"john doe"@example.com</code>), comments, IP-address domains and internationalised names such as <code>उपयोगकर्ता@उदाहरण.भारत</code>. A regex that covers all of it is thousands of characters long and still cannot tell you whether the mailbox <b>exists</b>.<br><br>
Practical approach:<br>
• Use a <b>simple</b> pattern (or a library such as <b>email-validator</b>, <code>pip install email-validator</code>, which also normalises the address and can check the domain's DNS).<br>
• Lower-case the domain part before storing.<br>
• Confirm ownership by <b>sending a verification email</b> - the only real proof.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use fullmatch for validation?</td><td>search or match would accept a valid address hidden inside longer invalid text</td></tr>
<tr class='text-center'><td>Why <code>(?:...)</code> instead of <code>(...)</code>?</td><td>Non-capturing groups group without capturing, so findall returns whole matches instead of group tuples</td></tr>
<tr class='text-center'><td>Can a regex fully validate email addresses?</td><td>Not practically - RFC 5322 is too complex, and no regex can prove a mailbox exists; send a confirmation email</td></tr>
<tr class='text-center'><td>Which library helps?</td><td>email-validator - syntax checks, normalisation and optional DNS checks</td></tr>
</table>`
        }
    ]
};
