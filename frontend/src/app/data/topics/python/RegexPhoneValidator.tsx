import type { Topic } from '../../types';

export const regexPhoneValidator: Topic = {
    id: 'python-regex-project-phone-validator',
    name: 'Project: Phone Validator',
    beginner: [
        {
            content: `<h4>The Task</h4>
Users type Indian mobile numbers in many ways: <code>9876543210</code>, <code>+91 98765 43210</code>, <code>+91-9876543210</code>, <code>098765 43210</code>. Build a validator that:<br>
1. accepts an optional <code>+91</code> (with an optional space or dash) or a leading <code>0</code>,<br>
2. requires 10 digits starting with 6, 7, 8 or 9,<br>
3. allows one space or dash in the middle (5 + 5 digits),<br>
4. returns every valid number in one <b>canonical</b> form: <code>+919876543210</code>.`
        },
        {
            content: `<h4>Step 1: The Pattern</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Piece</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>(?:\\+91[\\s-]?|0)?</code></td><td>Optional "+91" (plus an optional separator) or a leading 0</td></tr>
<tr class='text-center'><td><code>([6-9]\\d{4})</code></td><td>First 5 digits, starting with 6-9 - captured</td></tr>
<tr class='text-center'><td><code>[\\s-]?</code></td><td>Optional space or dash</td></tr>
<tr class='text-center'><td><code>(\\d{5})</code></td><td>Last 5 digits - captured</td></tr>
</table>`
        },
        {
            content: `<h4>Step 2: Validate and Normalise</h4>
The two captured groups are the 10 real digits, so building the canonical form is just joining them.`,
            codeExamples: [
                `import re

MOBILE = re.compile(r"(?:\\+91[\\s-]?|0)?([6-9]\\d{4})[\\s-]?(\\d{5})")

def normalise(text):
    m = MOBILE.fullmatch(text.strip())
    if m is None:
        return None
    return "+91" + m.group(1) + m.group(2)

tests = [
    "9876543210",
    "+91 98765 43210",
    "+91-9876543210",
    "098765 43210",
    "98765-43210",
    "5876543210",
    "987654321",
    "+91 98765 432100",
]
for t in tests:
    print(f"{t:<18} {normalise(t)}")

# OUTPUT:
# 9876543210         +919876543210
# +91 98765 43210    +919876543210
# +91-9876543210     +919876543210
# 098765 43210       +919876543210
# 98765-43210        +919876543210
# 5876543210         None
# 987654321          None
# +91 98765 432100   None`
            ]
        },
        {
            content: `<h4>Step 3: Extracting Numbers from Text</h4>
Searching free text needs guards so that a 10-digit slice of a longer number (an order ID, a card number) is not mistaken for a phone number. <code>(?&lt;!\\d)</code> and <code>(?!\\d)</code> make sure no digit touches the match on either side.`,
            codeExamples: [
                `import re

FIND = re.compile(r"(?<!\\d)(?:\\+91[\\s-]?|0)?([6-9]\\d{4})[\\s-]?(\\d{5})(?!\\d)")

text = "Call 98765 43210 or +91-91234-56789. Order id 123456789012 is not a phone."
numbers = ["+91" + a + b for a, b in FIND.findall(text)]
print(numbers)

# OUTPUT:
# ['+919876543210', '+919123456789']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Cleaning Before Matching</h3>
Another strategy is to strip everything except digits and <code>+</code> first, then validate a much simpler pattern. It accepts more formats (brackets, dots, several spaces) with less regex.`,
            codeExamples: [
                `import re

def normalise_loose(text):
    digits = re.sub(r"[^\\d+]", "", text)          # keep digits and +
    m = re.fullmatch(r"(?:\\+91|0)?([6-9]\\d{9})", digits)
    return "+91" + m.group(1) if m else None

for t in ["(+91) 98765.43210", "+91  98765  43210", "91-98765-43210"]:
    print(t, "->", normalise_loose(t))

# OUTPUT:
# (+91) 98765.43210 -> +919876543210
# +91  98765  43210 -> +919876543210
# 91-98765-43210 -> None`
            ]
        },
        {
            content: `<h3>Edge Cases to Decide On</h3>
• <b>Country code without +</b>: "91-98765-43210" is rejected above. Accepting it risks misreading other numbers - decide deliberately and add a test.<br>
• <b>Landlines</b> (with STD codes such as 020 for Pune) need a different pattern.<br>
• <b>Store one format</b> (E.164, e.g. <code>+919876543210</code>) and format for display separately.<br>
• A valid <i>format</i> doesn't prove the number exists - send an OTP to verify ownership.`
        },
        {
            content: `<h3>International Numbers: the phonenumbers Library</h3>
Numbering rules differ for every country and change over time. For anything beyond one country, use <b>phonenumbers</b> (<code>pip install phonenumbers</code>), a port of Google's libphonenumber - the library Android itself uses.`,
            codeExamples: [
                `import phonenumbers

n = phonenumbers.parse("+91 98765 43210", None)
print(phonenumbers.format_number(n, phonenumbers.PhoneNumberFormat.E164))

# OUTPUT:
# +919876543210`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why normalise phone numbers?</td><td>So the same number typed in different ways compares equal and is stored once (e.g. E.164 format)</td></tr>
<tr class='text-center'><td>Why add <code>(?&lt;!\\d)</code> and <code>(?!\\d)</code> when searching text?</td><td>To avoid matching 10 digits inside a longer number such as an order ID</td></tr>
<tr class='text-center'><td>Why does fullmatch reject "+91 98765 432100"?</td><td>The extra digit is left over after the pattern, and fullmatch requires the whole string to match</td></tr>
<tr class='text-center'><td>What should you use for international numbers?</td><td>The phonenumbers library (libphonenumber)</td></tr>
</table>`
        }
    ]
};
