import type { Topic } from '../../types';

export const regexProjectPhoneValidator: Topic = {
    id: 'python-regex-project-phone-validator',
    name: 'Project: Phone Validator',
    beginner: [
        {
            content: `<h4>Introduction</h4>
This project validates <b>Indian mobile numbers</b>: ten digits starting with 6, 7, 8 or 9, optionally preceded by <code>+91</code>, <code>91</code> or <code>0</code>, and typed with any mix of spaces and hyphens. The strategy is <b>normalise first, then match</b>: strip separators with <code>re.sub</code>, then check the cleaned digits with a strict pattern.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 583 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:583px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="133.5" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="76.8" y="30.5">raw input</tspan><tspan x="76.8" y="45.5">+91 98765-43210</tspan></text><line x1="143.5" y1="34" x2="173.5" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="177.5" y="10" width="111.6" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="233.3" y="30.5">strip spaces</tspan><tspan x="233.3" y="45.5">and hyphens</tspan></text><line x1="289.1" y1="34" x2="319.1" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="323.1" y="10" width="97" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="371.6" y="30.5">fullmatch</tspan><tspan x="371.6" y="45.5">[6-9]\\d{9}</tspan></text><line x1="420.1" y1="34" x2="450.1" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="454.1" y="10" width="118.9" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="513.6" y="30.5">canonical</tspan><tspan x="513.6" y="45.5">+919876543210</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: normalise first, validate second, store one format</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> People type the same number as <code>9876543210</code>, <code>+91 98765-43210</code> or <code>098765 43210</code>. Storing them raw means duplicates and failed lookups.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Combine <code>re.sub</code> (clean) and <code>fullmatch</code> (validate) in one pipeline.</li>
<li>Store numbers in <b>one canonical format</b> (+91XXXXXXXXXX).</li>
<li>Extract numbers from free text with lookarounds.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: normalize() returns +91XXXXXXXXXX or None</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re

PHONE = re.compile(r"(?:\\+91|91|0)?([6-9]\\d{9})")


def normalize(text):
    cleaned = re.sub(r"[\\s-]", "", text)
    match = PHONE.fullmatch(cleaned)
    return "+91" + match.group(1) if match else None


def main():
    inputs = ["9876543210", "+91 98765-43210", "09876543210", "12345 67890", "98765"]
    for raw in inputs:
        print(repr(raw), "->", normalize(raw))


if __name__ == "__main__":
    main()

# OUTPUT:
# '9876543210' -> +919876543210
# '+91 98765-43210' -> +919876543210
# '09876543210' -> +919876543210
# '12345 67890' -> None
# '98765' -> None`
            ],
            codeExplanations: [
                `The optional prefix group (?:\\+91|91|0)? is non-capturing; only the ten-digit number is captured as group 1. "12345 67890" fails because the first digit is 1, and "98765" is too short.`
            ]
        },
        {
            content: `<h4>The Goal</h4>
Validate Indian mobile numbers. A valid number has <b>10 digits</b> and starts with <b>6, 7, 8 or 9</b>. People also type it with a country code (<code>+91</code>, <code>91</code>), a leading <code>0</code>, or with spaces and hyphens, so we first <b>normalize</b> the input and then match.`
        },
        {
            content: `<h4>Step 1: Match a 10-Digit Number</h4>`,
            codeExamples: [
                `import re

MOBILE = re.compile(r"[6-9]\\d{9}")

for s in ["9876543210", "5876543210", "98765", "98765abcde"]:
    print(s, "->", bool(MOBILE.fullmatch(s)))

# OUTPUT:
# 9876543210 -> True
# 5876543210 -> False
# 98765 -> False
# 98765abcde -> False`
            ],
            codeExplanations: [
                `[6-9] is the first digit, then \\d{9} gives nine more, 10 in total. "5876543210" fails because it starts with 5, "98765" is too short, and "98765abcde" has letters. fullmatch() makes sure nothing extra is allowed before or after.`
            ]
        },
        {
            content: `<h4>Step 2: Allow an Optional Prefix and Clean the Input</h4>
First strip spaces and hyphens with <code>re.sub</code>, then allow an optional <code>+91</code>, <code>91</code> or <code>0</code> in front. The <code>?</code> after the group makes the prefix optional.`,
            codeExamples: [
                `import re

PHONE = re.compile(r"(?:\\+91|91|0)?[6-9]\\d{9}")

def is_valid_phone(text):
    cleaned = re.sub(r"[\\s-]", "", text)
    return PHONE.fullmatch(cleaned) is not None

for s in ["9876543210", "+91 98765-43210", "09876543210", "12345 67890"]:
    print(s, "->", is_valid_phone(s))

# OUTPUT:
# 9876543210 -> True
# +91 98765-43210 -> True
# 09876543210 -> True
# 12345 67890 -> False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Finding Phone Numbers Inside Text</h3>
To <b>extract</b> numbers from free text you cannot use <code>fullmatch</code>. Instead use <code>findall</code> with lookarounds: <code>(?&lt;!\\d)</code> and <code>(?!\\d)</code> make sure the number is not just a slice of a longer digit string.`,
            codeExamples: [
                `import re

FIND = re.compile(r"(?<!\\d)(?:\\+91[\\s-]?)?[6-9]\\d{4}[\\s-]?\\d{5}(?!\\d)")

text = "Call +91 98765 43210 or 9123456789; ignore 1234567890 and 98765432101."

print(FIND.findall(text))

# OUTPUT:
# ['+91 98765 43210', '9123456789']`
            ],
            codeExplanations: [
                `The pattern allows an optional +91 prefix and an optional space or hyphen in the middle of the number. 1234567890 is skipped because it starts with 1. 98765432101 has 11 digits, so the (?!\\d) lookahead rejects the first 10 digits, and the lookbehind (?<!\\d) stops the engine starting in the middle of it.`
            ]
        },
        {
            content: `<h3>Normalizing to One Storage Format</h3>
Store phone numbers in <b>one canonical form</b> so duplicates and searches work. For an Indian mobile that is the 10 national digits (or the international E.164 form <code>+919876543210</code>). Use named groups to separate the prefix from the number.`,
            codeExamples: [
                `import re

PHONE = re.compile(r"(?P<prefix>\\+91|91|0)?(?P<number>[6-9]\\d{9})")

def normalize(text):
    cleaned = re.sub(r"[\\s-]", "", text)
    m = PHONE.fullmatch(cleaned)
    return "+91" + m["number"] if m else None

print(normalize("98765-43210"))
print(normalize("09876543210"))
print(normalize("+91 98765 43210"))
print(normalize("hello"))

# OUTPUT:
# +919876543210
# +919876543210
# +919876543210
# None`
            ]
        },
        {
            content: `<h3>International Numbers and When to Stop Using Regex</h3>
The international E.164 format is a <code>+</code>, a non-zero digit, then up to 14 more digits. A regex can check that <i>shape</i>, but it cannot know which country codes exist, how long each country's numbers are, or whether a number is actually allocated.`,
            codeExamples: [
                `import re

E164 = re.compile(r"\\+[1-9]\\d{1,14}")

for s in ["+919876543210", "+14155552671", "919876543210", "+0123"]:
    print(s, "->", bool(E164.fullmatch(s)))

# OUTPUT:
# +919876543210 -> True
# +14155552671 -> True
# 919876543210 -> False
# +0123 -> False`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Accepts the many ways users type a number</td><td>Knows only the shape, not whether the number is allocated</td></tr>
<tr><td>One canonical format simplifies storage and search</td><td>Every country has different rules - this handles India only</td></tr>
<tr><td>Fast: no external library needed</td><td>Cannot prove the user owns the number (needs an OTP)</td></tr>
<tr><td>Pattern is short and easy to adjust for other countries</td><td>For production use the <code>phonenumbers</code> library</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why normalize before matching?</td><td>Users type spaces, hyphens and prefixes in many ways; cleaning first keeps the pattern simple</td></tr>
<tr class='text-center'><td>Why <code>(?&lt;!\\d)</code> and <code>(?!\\d)</code> when searching text?</td><td>They stop the pattern matching 10 digits out of the middle of a longer number</td></tr>
<tr class='text-center'><td>What is E.164?</td><td>The international format: + country code and number, at most 15 digits</td></tr>
<tr class='text-center'><td>What should you store?</td><td>One canonical format (e.g. +919876543210), not the raw user input</td></tr>
<tr class='text-center'><td>Is regex enough for production validation?</td><td>No - use the <code>phonenumbers</code> library for country rules, and verify ownership with an OTP</td></tr>
</table>`
        }
    ]
};
