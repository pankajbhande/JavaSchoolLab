// Module 15 (Regular Expressions), part B: lookaround and projects.
import { dd, r, type DeepDive } from './deepDive';

export const m15b: Record<string, DeepDive> = {
    'Lookahead & Lookbehind': dd(
        [`<b>Lookarounds</b> assert what comes before or after the current position <i>without consuming it</i>. <code>(?=x)</code> positive lookahead, <code>(?!x)</code> negative lookahead, <code>(?&lt;=x)</code> positive lookbehind, <code>(?&lt;!x)</code> negative lookbehind. They are zero-width: they add nothing to the matched text.`,
            r`import re
print(re.findall(r"\d+(?= USD)", "50 USD, 70 EUR, 30 USD"))     # digits followed by USD
print(re.findall(r"(?<=\$)\d+", "cost $45 and 12"))            # digits preceded by $

# OUTPUT:
# ['50', '30']
# ['45']`],
        [`Some rules depend on context ("a number, but only if followed by %") and you want the number alone in the result. Lookarounds also let one pattern check several conditions at the same position, which is how password rules are combined.`,
            r`import re
# Insert thousands separators: a position followed by groups of 3 digits to the end
print(re.sub(r"(?<=\d)(?=(\d{3})+$)", ",", "1234567"))

# OUTPUT:
# 1,234,567`],
        [`Password strength rules, number formatting, finding words not preceded by a keyword, splitting camelCase, and extracting values after a label without capturing the label.`,
            r`import re
print(re.sub(r"(?<=[a-z])(?=[A-Z])", " ", "parseHttpRequestLine"))   # split camelCase
print(re.findall(r"\b(?!the\b)\w{4}\b", "the best code wins"))        # 4-letter words except 'the'

# OUTPUT:
# parse Http Request Line
# ['best', 'code', 'wins']`],
        [`<b>Advantages:</b> match context without including it, test several conditions at one position, avoid post-processing of groups.`,
            r`import re
pwd = re.compile(r"^(?=.*[A-Z])(?=.*\d).{8,}$")      # needs upper AND digit AND 8+ chars
print(bool(pwd.match("Secret123")), bool(pwd.match("secret123")))

# OUTPUT:
# True False`],
        [`<b>Disadvantages:</b> patterns become cryptic and are hard to debug, and a mistaken lookaround can silently match nothing.`,
            r`import re
print(re.findall(r"(?<=\$)\d+(?= USD)", "$45 USD  45 USD  $45 EUR"))   # context must hold on BOTH sides
print(re.findall(r"(?<=\$ )\d+", "$45"))                                # stray space: never matches

# OUTPUT:
# ['45']
# []`],
        [`<b>Limitations:</b> in Python's <code>re</code>, lookbehind must have a <b>fixed width</b>; variable-length alternatives raise an error (the third-party <code>regex</code> module lifts this).`,
            r`import re
try:
    re.compile(r"(?<=a+)b")           # variable width lookbehind
except re.error as e:
    print("re.error:", e)
print(re.findall(r"(?<=ab|cd)x", "abx cdx"))   # equal-width alternatives are fine

# OUTPUT:
# re.error: look-behind requires fixed-width pattern
# ['x', 'x']`],
        r`
   text:   price: $ 4 5 USD
                   ▲
        (?<=\$)    │look back: is there '$' before me?    no consume
        \d+  ──────┘ consumes digits "45"
        (?= USD)     look ahead: is " USD" after me?      no consume
   result = "45"   (the $ and USD are checked, not matched)
`,
        `Use lookarounds sparingly: one or two per pattern. For multi-rule validation, separate small checks in code are far more readable and give per-rule error messages than one clever pattern. Prefer capture groups over lookbehind when width varies.`
    ),

    'Project: Email Validator': dd(
        [`This project builds a practical <b>email validator</b> with a compiled regex: local part, an <code>@</code>, a domain with at least one dot, and a top-level domain. It validates the <i>shape</i>, not whether the mailbox exists.`,
            r`import re
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")

def is_valid(email):
    return EMAIL.fullmatch(email) is not None

for e in ["ann@example.com", "a.b+tag@mail.co.uk", "no-at.com", "x@y", "bad@@x.com"]:
    print(f"{e:22} {is_valid(e)}")

# OUTPUT:
# ann@example.com        True
# a.b+tag@mail.co.uk     True
# no-at.com              False
# x@y                    False
# bad@@x.com             False`],
        [`Bad addresses cause bounced mail, failed signups and dirty databases. A cheap format check at the form catches typos before any network call.`,
            r`import re
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(\.[\w-]+)+")
users = ["ann@x.com", "ann@x", "@x.com"]
valid = [u for u in users if EMAIL.fullmatch(u)]
print(valid)

# OUTPUT:
# ['ann@x.com']`],
        [`Signup forms, CSV import cleaning, newsletter lists and API request validation. Production systems then send a confirmation email as the real proof.`,
            r`import re
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
text = "Contact sales@acme.io or support@acme.io, not me@localhost."
print(EMAIL.findall(text))             # extract all emails from free text

# OUTPUT:
# ['sales@acme.io', 'support@acme.io']`],
        [`<b>Advantages:</b> fast, no dependencies, runs client or server side, and the same pattern both validates and extracts.`,
            r`import re
EMAIL = re.compile(r"(?P<user>[\w.+-]+)@(?P<domain>[\w-]+(?:\.[\w-]+)+)")
m = EMAIL.fullmatch("Ann.Lee+news@Mail.Example.com")
print(m["user"], "|", m["domain"].lower())      # normalise the domain

# OUTPUT:
# Ann.Lee+news | mail.example.com`],
        [`<b>Disadvantages:</b> the real email grammar (RFC 5322) is far larger than any practical regex, so some valid addresses are rejected and some odd invalid ones accepted.`,
            r`import re
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
print(bool(EMAIL.fullmatch('"john doe"@example.com')))   # valid per RFC, rejected here
print(bool(EMAIL.fullmatch("a..b@x.com")))               # invalid per RFC, accepted here

# OUTPUT:
# False
# True`],
        [`<b>Limitations:</b> it cannot prove the domain exists, the mailbox is reachable, or the user owns it. Internationalised addresses need extra handling.`,
            r`import re
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")
print(bool(EMAIL.fullmatch("nobody@thisdomaindoesnotexist.com")))   # shape is fine
print(bool(EMAIL.fullmatch("usér@example.com")))                    # non-ASCII rejected

# OUTPUT:
# True
# False`],
        `
   input ─► strip/lower ─► regex shape check ─► (reject early)
                                  │ pass
                                  ▼
                       send confirmation link ─► user clicks ─► VERIFIED
   regex = typo filter           only the click proves ownership
`,
        `Keep the regex deliberately permissive (one @, a dot in the domain) and rely on a verification email for truth. Use a library such as <code>email-validator</code> when you need DNS and IDN checks. Never use regex alone as a security control.`
    ),

    'Project: Phone Validator': dd(
        [`This project validates and normalises <b>phone numbers</b>. A pattern accepts optional country code, optional separators (space, dash, dots, parentheses) and a fixed count of digits, then code strips the formatting to a canonical form.`,
            r`import re
PHONE = re.compile(r"^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$")     # Indian mobile example

for p in ["+91 98765-43210", "9876543210", "5876543210", "98765 4321"]:
    print(f"{p:18} {bool(PHONE.match(p))}")

# OUTPUT:
# +91 98765-43210    True
# 9876543210         True
# 5876543210         False
# 98765 4321         False`],
        [`Users type numbers in many styles. Validation rejects obvious mistakes, and normalising to one format lets you de-duplicate contacts and send SMS reliably.`,
            r`import re
def normalise(raw):
    digits = re.sub(r"\D", "", raw)          # keep digits only
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]                  # drop country code
    return digits if re.fullmatch(r"[6-9]\d{9}", digits) else None

print(normalise("+91 (98765) 43210"), normalise("12345"))

# OUTPUT:
# 9876543210 None`],
        [`Registration and checkout forms, CRM imports, OTP delivery, and contact-card parsing. Always store E.164 (<code>+919876543210</code>) in the database.`,
            r`import re
def to_e164(raw, cc="+91"):
    d = re.sub(r"\D", "", raw)[-10:]         # last 10 digits
    return cc + d if re.fullmatch(r"[6-9]\d{9}", d) else None

for n in ["98765-43210", "(+91) 98765 43210", "abc"]:
    print(n, "->", to_e164(n))

# OUTPUT:
# 98765-43210 -> +919876543210
# (+91) 98765 43210 -> +919876543210
# abc -> None`],
        [`<b>Advantages:</b> tolerant of formatting, easy to adapt per country, and a two-step design (clean, then check) keeps the regex simple.`,
            r`import re
found = re.findall(r"\b[6-9]\d{9}\b", "Call 9876543210 or 8123456789; ignore 1234567890")
print(found)

# OUTPUT:
# ['9876543210', '8123456789']`],
        [`<b>Disadvantages:</b> each country has its own rules; a single regex for the world is not realistic, and number ranges change over time.`,
            r`import re
IN = re.compile(r"[6-9]\d{9}")
print(bool(IN.fullmatch("2025550123")))     # a valid US number fails the Indian rule

# OUTPUT:
# False`],
        [`<b>Limitations:</b> a regex checks shape only. It cannot tell if a number is assigned, mobile vs landline, or reachable. Use <code>phonenumbers</code> (libphonenumber) for global correctness.`,
            r`import re
print(bool(re.fullmatch(r"[6-9]\d{9}", "9999999999")))   # well-formed, probably not a real line

# OUTPUT:
# True`],
        r`
   raw input ─► remove non-digits ─► strip country code ─► regex [6-9]\d{9}
   "+91 98765-43210"   "919876543210"     "9876543210"        ✓ ─► store E.164
                                                               ✗ ─► ask user again
`,
        `Separate parsing (normalise) from validation and store a canonical E.164 value. For multi-country products adopt <code>phonenumbers</code> instead of custom regex, and verify ownership with an OTP.`
    ),

    'Project: Password Validator': dd(
        [`This project checks <b>password strength</b> with lookaheads: at least 8 characters, an uppercase letter, a lowercase letter, a digit and a symbol. Each lookahead tests one rule from the start of the string.`,
            r`import re
STRONG = re.compile(r"""
    ^(?=.*[a-z])          # a lowercase letter
     (?=.*[A-Z])          # an uppercase letter
     (?=.*\d)             # a digit
     (?=.*[^\w\s])        # a symbol
     .{8,}$               # length 8+
""", re.VERBOSE)

for p in ["Passw0rd!", "password", "SHORT1!a", "NoDigits!!"]:
    print(f"{p:12} {bool(STRONG.match(p))}")

# OUTPUT:
# Passw0rd!    True
# password     False
# SHORT1!a     True
# NoDigits!!   False`],
        [`Weak passwords are the top cause of account takeover. A policy check at signup blocks the worst choices, and telling the user exactly which rule failed improves the experience.`,
            r`import re
RULES = {
    "8+ characters":  r".{8,}",
    "an uppercase":   r"[A-Z]",
    "a lowercase":    r"[a-z]",
    "a digit":        r"\d",
    "a symbol":       r"[^\w\s]",
}
def check(pw):
    return [name for name, pat in RULES.items() if not re.search(pat, pw)]

print(check("abc"))
print(check("Str0ng!pass"))

# OUTPUT:
# ['8+ characters', 'an uppercase', 'a digit', 'a symbol']
# []`],
        [`Signup and reset-password forms, admin tools and onboarding scripts. Modern guidance (NIST) prefers length and a breached-password check over complex character rules.`,
            r`import re
def strength(pw):
    score = sum(bool(re.search(p, pw)) for p in [r"[a-z]", r"[A-Z]", r"\d", r"[^\w\s]"])
    score += len(pw) >= 12
    return ["weak", "weak", "fair", "good", "strong", "excellent"][score]

print(strength("abc"), strength("Abcdef1!"), strength("Abcdef1!ghijk"))

# OUTPUT:
# weak good excellent`],
        [`<b>Advantages:</b> a declarative policy; each rule is independent; <code>re.VERBOSE</code> with comments documents the policy in the code itself.`,
            r`import re
common = re.compile(r"(password|qwerty|123456)", re.I)
print(bool(common.search("MyPassword9")))        # reject common substrings

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> composition rules push users to predictable choices such as <code>Password1!</code>, which passes the regex yet is trivially guessable.`,
            r`import re
STRONG = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$")
print(bool(STRONG.match("Password1!")))          # passes, but terrible

# OUTPUT:
# True`],
        [`<b>Limitations:</b> regex cannot measure entropy or check breach lists, and the dot does not match newline, so a password containing one is handled differently unless you use <code>re.S</code>.`,
            r`import re
P = re.compile(r"^(?=.*\d).{8,}$")
print(bool(P.match("abc\ndef12345")))        # . stops at the newline: lookahead fails
print(bool(re.compile(r"^(?=.*\d).{8,}$", re.S).match("abc\ndef12345")))

# OUTPUT:
# False
# True`],
        r`
   password ─► ┌ (?=.*[a-z]) ┐
               │ (?=.*[A-Z]) │  all lookaheads start at position 0,
               │ (?=.*\d)    │  none consume text; every one must pass
               │ (?=.*\W)    │
               └ .{8,}       ┘ ─► ALLOW / DENY (+ which rule failed)
`,
        `Follow NIST 800-63B: minimum length, check against breached lists (HIBP k-anonymity API), no forced composition, allow passphrases and password managers. Hash with Argon2 or bcrypt; never log or store the raw password. Regex is a UX hint, not the security.`
    ),

    'Project: Log Parser': dd(
        [`This project parses <b>log lines</b> into structured records using a compiled regex with named groups: timestamp, level, module and message. The result is a list of dicts you can filter and count.`,
            r`import re
LINE = re.compile(r"(?P<ts>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) "
                  r"\[(?P<level>[A-Z]+)\] (?P<module>[\w.]+): (?P<msg>.*)")

line = "2024-03-15 10:21:05 [ERROR] db.conn: timeout after 30s"
print(LINE.match(line).groupdict())

# OUTPUT:
# {'ts': '2024-03-15 10:21:05', 'level': 'ERROR', 'module': 'db.conn', 'msg': 'timeout after 30s'}`],
        [`Raw logs are text; to answer questions (how many errors per module?) you need fields. Regex turns each line into data without a heavy tool.`,
            r`import re
from collections import Counter
LINE = re.compile(r"\[(?P<level>[A-Z]+)\] (?P<module>[\w.]+):")
logs = ["[INFO] app: start", "[ERROR] db: fail", "[ERROR] db: fail again", "[WARN] app: slow"]
levels = Counter(m["level"] for m in map(LINE.search, logs))
print(levels)

# OUTPUT:
# Counter({'ERROR': 2, 'INFO': 1, 'WARN': 1})`],
        [`Incident triage, audit reports, alert rules, access-log analysis (IP, status, bytes) and converting legacy logs to JSON for tools like ELK.`,
            r`import re, json
ACCESS = re.compile(r'(?P<ip>[\d.]+) - - \[(?P<time>[^\]]+)\] "(?P<method>\w+) (?P<path>\S+) [^"]*" (?P<status>\d{3}) (?P<size>\d+)')
line = '10.0.0.5 - - [15/Mar/2024:10:21:05 +0000] "GET /api/users HTTP/1.1" 200 512'
rec = ACCESS.match(line).groupdict()
rec["status"], rec["size"] = int(rec["status"]), int(rec["size"])
print(json.dumps(rec))

# OUTPUT:
# {"ip": "10.0.0.5", "time": "15/Mar/2024:10:21:05 +0000", "method": "GET", "path": "/api/users", "status": 200, "size": 512}`],
        [`<b>Advantages:</b> fast to write, streams line by line with constant memory, and named groups make the schema self-documenting.`,
            r`import re, io
LINE = re.compile(r"\[(?P<level>[A-Z]+)\] (?P<msg>.*)")
stream = io.StringIO("[INFO] a\n[ERROR] b\n[ERROR] c\n")
errors = (m["msg"] for m in map(LINE.match, stream) if m and m["level"] == "ERROR")
print(list(errors))

# OUTPUT:
# ['b', 'c']`],
        [`<b>Disadvantages:</b> any format drift (new field, different timestamp) makes lines stop matching, and those lines vanish silently unless you count the misses.`,
            r`import re
LINE = re.compile(r"\[(?P<level>[A-Z]+)\] (?P<msg>.*)")
lines = ["[INFO] ok", "garbage line", "[ERROR] bad"]
parsed, skipped = [], 0
for l in lines:
    m = LINE.match(l)
    if m: parsed.append(m.groupdict())
    else: skipped += 1
print(len(parsed), "parsed,", skipped, "skipped")

# OUTPUT:
# 2 parsed, 1 skipped`],
        [`<b>Limitations:</b> multi-line entries (stack traces) need extra logic to join continuation lines, and regex is slow on very large volumes compared with structured logging.`,
            r`import re
START = re.compile(r"^\d{4}-\d{2}-\d{2} ")
raw = ["2024-03-15 ERROR boom", "  Traceback ...", "  KeyError: x", "2024-03-15 INFO ok"]
entries = []
for line in raw:
    if START.match(line): entries.append(line)
    else: entries[-1] += " | " + line.strip()      # join continuation lines
print(entries)

# OUTPUT:
# ['2024-03-15 ERROR boom | Traceback ... | KeyError: x', '2024-03-15 INFO ok']`],
        `
   log file ─► line ─► compiled regex (named groups) ─► dict
      │                    │ no match                      │
      │                    └──► count / dead-letter file   ▼
      └─ read lazily ◄──────────────────────── filter ─► aggregate ─► report
`,
        `Prefer structured logging (JSON) at the source so no parsing is needed. When parsing is unavoidable, compile once, stream lazily, count unmatched lines, version your patterns, and use a log pipeline (Logstash grok, Vector) for production volume.`
    ),
};

