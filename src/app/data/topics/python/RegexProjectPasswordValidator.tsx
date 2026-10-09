import type { Topic } from '../../types';

export const regexProjectPasswordValidator: Topic = {
    id: 'python-regex-project-password-validator',
    name: 'Project: Password Validator',
    beginner: [
        {
            content: `<h4>Introduction</h4>
This project checks a password against common composition rules: at least 8 characters, a lowercase letter, an uppercase letter, a digit and a special character. Instead of one giant pattern, we keep <b>one small pattern per rule</b> in a dictionary, so the program can tell the user exactly which rules failed.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 335 236" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:335px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="314.7" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="167.4" y="29.5">1. at least 8 characters      .{8,}</tspan></text><rect x="10" y="47" width="314.7" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="167.4" y="66.5">2. a lowercase letter         [a-z]</tspan></text><rect x="10" y="84" width="314.7" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="167.4" y="103.5">3. an uppercase letter        [A-Z]</tspan></text><rect x="10" y="121" width="314.7" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="167.4" y="140.5">4. a digit                    \\d</tspan></text><rect x="10" y="158" width="314.7" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="167.4" y="177.5">5. a special character        [^\\w\\s]</tspan></text><rect x="10" y="195" width="314.7" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="167.4" y="214.5">password accepted only if ALL five pass</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: each rule is checked independently</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A form that only says "invalid password" frustrates users. A single combined regex cannot say <i>which</i> requirement was missed.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Learn the <b>one pattern per rule</b> design: simple patterns, clear messages.</li>
<li>Practise <code>re.search</code> with classes and quantifiers.</li>
<li>Understand why composition rules are not the same as password strength.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: missing_rules() lists what is wrong</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re

RULES = {
    "at least 8 characters": r".{8,}",
    "a lowercase letter":    r"[a-z]",
    "an uppercase letter":   r"[A-Z]",
    "a digit":               r"\\d",
    "a special character":   r"[^\\w\\s]",
}


def missing_rules(password):
    return [rule for rule, pattern in RULES.items() if not re.search(pattern, password)]


def main():
    for password in ["Passw0rd!", "password", "SHORT1!", "Str0ng#Pass"]:
        missing = missing_rules(password)
        message = "OK" if not missing else "needs " + ", ".join(missing)
        print(password, "->", message)


if __name__ == "__main__":
    main()

# OUTPUT:
# Passw0rd! -> OK
# password -> needs an uppercase letter, a digit, a special character
# SHORT1! -> needs at least 8 characters, a lowercase letter
# Str0ng#Pass -> OK`
            ],
            codeExplanations: [
                `The list comprehension keeps only the rules whose pattern is NOT found. An empty list means every rule passed. Because dictionaries keep insertion order, messages always appear in the same order as the rules.`
            ]
        },
        {
            content: `<h4>The Goal</h4>
Check a password against common rules: at least <b>8 characters</b>, one <b>lowercase</b> letter, one <b>uppercase</b> letter, one <b>digit</b> and one <b>special character</b>. A single clear pattern for each rule is easier to write, and easier to explain to the user, than one giant regex.`
        },
        {
            content: `<h4>Step 1: One Pattern per Rule</h4>
Keep the rules in a dictionary of <code>message: pattern</code>. <code>re.search()</code> checks that each pattern appears somewhere in the password, and the function returns the <b>list of rules that failed</b> - perfect for showing helpful error messages.`,
            codeExamples: [
                `import re

RULES = {
    "at least 8 characters": r".{8,}",
    "a lowercase letter":    r"[a-z]",
    "an uppercase letter":   r"[A-Z]",
    "a digit":               r"\\d",
    "a special character":   r"[^\\w\\s]",
}

def check_password(password):
    return [rule for rule, pattern in RULES.items()
            if not re.search(pattern, password)]

print(check_password("Passw0rd!"))
print(check_password("abc"))

# OUTPUT:
# []
# ['at least 8 characters', 'an uppercase letter', 'a digit', 'a special character']`
            ],
            codeExplanations: [
                `The list comprehension keeps only the rules whose pattern is NOT found in the password. An empty list means every rule passed. [^\\w\\s] means "not a letter, digit, underscore or whitespace", which is a practical definition of a special character.`
            ]
        },
        {
            content: `<h4>Step 2: A Friendly Validator</h4>
Wrap the check so it tells the user exactly what to fix.`,
            codeExamples: [
                `import re

RULES = {
    "at least 8 characters": r".{8,}",
    "a lowercase letter":    r"[a-z]",
    "an uppercase letter":   r"[A-Z]",
    "a digit":               r"\\d",
    "a special character":   r"[^\\w\\s]",
}

def validate(password):
    missing = [rule for rule, pattern in RULES.items()
               if not re.search(pattern, password)]
    if missing:
        return "Password needs: " + ", ".join(missing)
    return "Password accepted"

print(validate("password"))
print(validate("Str0ng#Pass"))

# OUTPUT:
# Password needs: an uppercase letter, a digit, a special character
# Password accepted`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Single-Pattern Version With Lookaheads</h3>
All rules can be combined into one pattern by stacking <b>lookaheads</b> at the start (each checks one rule without consuming text), followed by the character set that is actually allowed. It is compact, but when it fails you cannot say <i>which</i> rule failed - the multi-pattern version above is friendlier.`,
            codeExamples: [
                `import re

PASSWORD = re.compile(r"""
    (?=.*[a-z])        # a lowercase letter
    (?=.*[A-Z])        # an uppercase letter
    (?=.*\\d)           # a digit
    (?=.*[^\\w\\s])      # a special character
    \\S{8,}             # 8+ characters, no whitespace at all
""", re.VERBOSE)

for p in ["Passw0rd!", "password1!", "Short1!", "Has Space1!", "Str0ng#Pass"]:
    print(p, "->", bool(PASSWORD.fullmatch(p)))

# OUTPUT:
# Passw0rd! -> True
# password1! -> False
# Short1! -> False
# Has Space1! -> False
# Str0ng#Pass -> True`
            ]
        },
        {
            content: `<h3>Rejecting Repeats With a Backreference</h3>
A backreference can ban weak patterns such as the same character three times in a row. <code>(.)\\1{2,}</code> means "any character, followed by that same character at least two more times".`,
            codeExamples: [
                `import re

def has_repeats(password):
    return re.search(r"(.)\\1{2,}", password) is not None

print(has_repeats("Passsw0rd!"))
print(has_repeats("Passw0rd!"))

# OUTPUT:
# True
# False`
            ]
        },
        {
            content: `<h3>What Regex Cannot Do - and What to Do Instead</h3>
<ul>
<li><b>Strength is not composition:</b> "Password1!" satisfies every rule above and is still a terrible password. Current guidance (NIST SP 800-63B) favours <b>length</b> and blocking known-breached or common passwords over forced character mixes.</li>
<li><b>Never store the password itself.</b> Store a salted, slow hash (bcrypt, scrypt or argon2) - not a plain regex-checked string, and not a fast hash like MD5.</li>
<li><b>Generating</b> passwords: use the <code>secrets</code> module, not <code>random</code>.</li>
</ul>`,
            codeExamples: [
                `import hashlib, os

password = "Str0ng#Pass"
salt = os.urandom(16)

digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
print(len(salt), len(digest))        # store both: salt and digest

# OUTPUT:
# 16 64`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>User sees exactly which rules failed</td><td>"Password1!" passes every rule yet is weak</td></tr>
<tr><td>Adding or changing a rule is one dictionary entry</td><td>Composition rules push users to predictable patterns</td></tr>
<tr><td>Each pattern is trivial and easy to test</td><td>Does not check breached or common-password lists</td></tr>
<tr><td>Can reuse the same rules on server and in documentation</td><td>Never replaces secure hashing (argon2, bcrypt, scrypt)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do lookaheads help with password rules?</td><td>Each lookahead checks one rule at the start position without consuming text, so all rules are ANDed</td></tr>
<tr class='text-center'><td>Why prefer one pattern per rule?</td><td>You can report exactly which rules failed, and each pattern stays simple</td></tr>
<tr class='text-center'><td>Is a password that passes all rules strong?</td><td>Not necessarily - length and unpredictability matter more than composition</td></tr>
<tr class='text-center'><td>How should passwords be stored?</td><td>As a salted hash from a slow algorithm (bcrypt, scrypt, argon2) - never plain text</td></tr>
<tr class='text-center'><td>Which module generates secure random values?</td><td><code>secrets</code>, not <code>random</code></td></tr>
</table>`
        }
    ]
};
