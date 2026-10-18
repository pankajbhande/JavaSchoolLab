import type { Topic } from '../../types';

export const regexProjectEmailValidator: Topic = {
    id: 'python-regex-project-email-validator',
    name: 'Project: Email Validator',
    beginner: [
        {
            content: `<h4>Introduction</h4>
In this mini-project you build <code>is_valid_email(text)</code>, which answers "does this <i>look like</i> an email address?". An address has three parts: a <b>local part</b>, an <code>@</code>, and a <b>domain</b> made of labels separated by dots and ending in a top-level domain (TLD) such as <code>.com</code> or <code>.in</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 478 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:478px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="97" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="58.5" y="30.5">local part</tspan><tspan x="58.5" y="45.5">abaji.k+tag</tspan></text><line x1="107" y1="34" x2="137" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="141" y="10" width="70" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="176" y="38">@</tspan></text><line x1="211" y1="34" x2="241" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="245" y="10" width="118.9" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="304.5" y="30.5">domain labels</tspan><tspan x="304.5" y="45.5">mail.co.</tspan></text><line x1="363.9" y1="34" x2="393.9" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="397.9" y="10" width="70" height="48" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="432.9" y="30.5">TLD</tspan><tspan x="432.9" y="45.5">in</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: anatomy of raoji.k+tag@mail.co.in</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Every sign-up form must reject obvious typos (<code>bad@</code>, <code>name.example.com</code>) before sending data to a server or mail provider.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Practise <b>fullmatch</b>, classes, quantifiers, groups and <code>re.VERBOSE</code> in one realistic task.</li>
<li>Catch typos early and give instant feedback in forms and APIs.</li>
<li>Learn the limits of regex: syntax checking is not proof an address exists.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: is_valid_email() with a documented pattern</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re

EMAIL = re.compile(
    r"[A-Za-z0-9_+-]+(?:\\.[A-Za-z0-9_+-]+)*"           # local part
    r"@"
    r"(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+"  # domain labels
    r"[A-Za-z]{2,}"                                     # top-level domain
)


def is_valid_email(text):
    return EMAIL.fullmatch(text) is not None


def main():
    samples = [
        "abaji@example.com",
        "raoji.k+tag@mail.co.in",
        "a..b@example.com",
        "bad@",
        "no-at.com",
        "a@-bad.com",
    ]
    for sample in samples:
        print(sample, "->", "valid" if is_valid_email(sample) else "INVALID")


if __name__ == "__main__":
    main()

# OUTPUT:
# abaji@example.com -> valid
# raoji.k+tag@mail.co.in -> valid
# a..b@example.com -> INVALID
# bad@ -> INVALID
# no-at.com -> INVALID
# a@-bad.com -> INVALID`
            ],
            codeExplanations: [
                `Adjacent string literals are joined by Python into one pattern, which lets each part carry a comment. The local part forbids leading, trailing and doubled dots; domain labels may not start or end with a hyphen. fullmatch() makes the whole string, not just a prefix, obey the pattern.`
            ]
        },
        {
            content: `<h4>The Goal</h4>
Build a function <code>is_valid_email(text)</code> that answers "does this <i>look like</i> an email address?". An email has three parts: a <b>local part</b>, an <code>@</code>, and a <b>domain</b> that ends in a dot and a top-level domain such as <code>.com</code> or <code>.in</code>.`
        },
        {
            content: `<h4>Step 1: A Simple Pattern</h4>
Break the pattern into the three parts and use <code>fullmatch()</code> so the <i>whole</i> string must fit.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Part</th><th>Pattern</th><th>Meaning</th></tr>
<tr class='text-center'><td>Local part</td><td><code>[\\w.+-]+</code></td><td>letters, digits, underscore, dot, plus, hyphen</td></tr>
<tr class='text-center'><td>At sign</td><td><code>@</code></td><td>literal</td></tr>
<tr class='text-center'><td>Domain labels</td><td><code>[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*</code></td><td>one or more labels joined by dots</td></tr>
<tr class='text-center'><td>TLD</td><td><code>\\.[A-Za-z]{2,}</code></td><td>a dot and at least two letters</td></tr>
</table>`,
            codeExamples: [
                `import re

EMAIL = re.compile(r"[\\w.+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}")

def is_valid_email(text):
    return EMAIL.fullmatch(text) is not None

samples = ["abaji@example.com", "raoji.k+tag@mail.co.in",
           "bad@", "no-at.com", "a@b", "x@@y.com", "a b@c.com"]

for s in samples:
    print(s, "->", is_valid_email(s))

# OUTPUT:
# abaji@example.com -> True
# raoji.k+tag@mail.co.in -> True
# bad@ -> False
# no-at.com -> False
# a@b -> False
# x@@y.com -> False
# a b@c.com -> False`
            ],
            codeExplanations: [
                `The pattern is compiled once. fullmatch() requires the entire string to match, so "a b@c.com" fails on the space and "x@@y.com" fails on the second @. "a@b" is rejected because the domain has no dot plus top-level domain. Returning "is not None" turns the Match object into a clean True/False.`
            ]
        },
        {
            content: `<h4>Step 2: Pull Out the Parts</h4>
Named groups let you validate <b>and</b> extract in one go - handy for grouping users by domain.`,
            codeExamples: [
                `import re

EMAIL = re.compile(r"(?P<user>[\\w.+-]+)@(?P<domain>[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,})")

m = EMAIL.fullmatch("raoji.k+tag@mail.co.in")
if m:
    print("user:  ", m["user"])
    print("domain:", m["domain"].lower())

# OUTPUT:
# user:   raoji.k+tag
# domain: mail.co.in`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>A Stricter, Documented Pattern</h3>
The simple pattern accepts <code>a..b@x.com</code> and <code>.a@x.com</code>, which real mail servers reject. A stricter version forbids leading, trailing and consecutive dots in the local part and forbids domain labels that start or end with a hyphen. <code>re.VERBOSE</code> lets each rule carry a comment.`,
            codeExamples: [
                `import re

STRICT = re.compile(r"""
    [A-Za-z0-9_+-]+(?:\\.[A-Za-z0-9_+-]+)*        # local part: no leading/trailing/double dots
    @
    (?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+   # labels: no leading/trailing hyphen
    [A-Za-z]{2,}                                  # top-level domain
""", re.VERBOSE)

for s in ["abaji@example.com", "a..b@example.com", ".a@example.com",
          "a@-bad.com", "a@exa-mple.co.in"]:
    print(s, "->", bool(STRICT.fullmatch(s)))

# OUTPUT:
# abaji@example.com -> True
# a..b@example.com -> False
# .a@example.com -> False
# a@-bad.com -> False
# a@exa-mple.co.in -> True`
            ]
        },
        {
            content: `<h3>Pitfalls</h3>
<ul>
<li><b>$ and trailing newlines:</b> <code>re.match(r"^...$", "a@b.com\\n")</code> succeeds because <code>$</code> allows a trailing newline. Use <code>fullmatch()</code>.</li>
<li><b>\\w is Unicode-aware:</b> it accepts letters from every script. Use <code>re.ASCII</code> (or explicit classes) if you want ASCII-only addresses.</li>
<li><b>Case:</b> the domain is case-insensitive, so lower-case it before comparing or storing.</li>
</ul>`,
            codeExamples: [
                `import re

print(bool(re.match(r"^[a-z]+@[a-z]+\\.com$", "a@b.com\\n")))       # slips through
print(bool(re.fullmatch(r"[a-z]+@[a-z]+\\.com", "a@b.com\\n")))     # rejected

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h3>A Regex Cannot Prove an Address Exists</h3>
The full email grammar (RFC 5322) allows quoted strings, comments and more, and no practical regex captures it exactly. A regex only filters out obvious typos. To know an address is <b>real and owned by the user</b>, send a <b>confirmation email</b> with a one-time link. For stricter syntax checking in production, use a maintained library such as <code>email-validator</code> rather than your own pattern.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Instant, offline validation with no network call</td><td>Cannot prove the mailbox exists or belongs to the user</td></tr>
<tr><td>Rejects typical typos before they reach your database</td><td>The full RFC 5322 grammar is too complex for one regex</td></tr>
<tr><td>Compiled once, reused for thousands of checks</td><td>Rejects some legal but unusual addresses (quoted local parts)</td></tr>
<tr><td>Easy to extend (blocked domains, length limits)</td><td>Needs a confirmation email for real verification</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why fullmatch() instead of search()?</td><td>search() would accept an address embedded in other text; fullmatch() requires the whole input to be an address</td></tr>
<tr class='text-center'><td>Can a regex fully validate email?</td><td>No - RFC 5322 is too complex, and syntax says nothing about whether the mailbox exists. Confirm by sending a link</td></tr>
<tr class='text-center'><td>Why use re.VERBOSE?</td><td>It allows whitespace and comments inside the pattern, making long patterns readable</td></tr>
<tr class='text-center'><td>What bug does <code>$</code> have?</td><td>It matches before a trailing newline, so "x\\n" can pass <code>^...$</code></td></tr>
<tr class='text-center'><td>Why compile the pattern at module level?</td><td>Compile once and reuse; it also gives the pattern a descriptive name</td></tr>
</table>`
        }
    ]
};
