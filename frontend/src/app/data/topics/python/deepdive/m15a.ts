// Module 15 (Regular Expressions), part A: core regex topics.
import { dd, r, type DeepDive } from './deepDive';

export const m15a: Record<string, DeepDive> = {
    're.match() vs re.search()': dd(
        [`<code>re.match(pattern, s)</code> tries to match only at the <b>start</b> of the string. <code>re.search(pattern, s)</code> scans the whole string and returns the <b>first</b> match anywhere. Both return a Match object or <code>None</code>. <code>re.fullmatch</code> requires the whole string to match.`,
            r`import re
s = "order 4521 shipped"
print(re.match(r"\d+", s))               # None - string does not START with digits
m = re.search(r"\d+", s)                 # found in the middle
print(m.group(), m.start(), m.end())

# OUTPUT:
# None
# 4521 6 10`],
        [`Choosing wrongly gives bugs in both directions: <code>match</code> misses valid text that appears later, while <code>search</code> accepts input that merely <i>contains</i> a valid piece, which is dangerous for validation.`,
            r`import re
print(bool(re.search(r"\d{3}", "ab123cd")))      # True: contains 3 digits
print(bool(re.fullmatch(r"\d{3}", "ab123cd")))   # False: whole string must match
print(bool(re.fullmatch(r"\d{3}", "123")))       # True

# OUTPUT:
# True
# False
# True`],
        [`Validating input (fullmatch), checking a prefix such as a URL scheme (match), and finding a token or ID inside text (search).`,
            r`import re
for url in ["https://a.com", "ftp://b.org", "a.com/https://"]:
    ok = re.match(r"https?://", url) is not None   # prefix check
    print(f"{url:16} secure-web={ok}")

# OUTPUT:
# https://a.com    secure-web=True
# ftp://b.org      secure-web=False
# a.com/https://   secure-web=False`],
        [`<b>Advantages:</b> a Match object gives the text, positions and groups; None makes "did it match?" a simple truthiness test.`,
            r`import re
m = re.search(r"(\w+)@(\w+)\.com", "mail ann@site.com now")
if m:                                   # None is falsy
    print(m.group(0), "|", m.group(1), "|", m.group(2), "|", m.span())

# OUTPUT:
# ann@site.com | ann | site | (5, 17)`],
        [`<b>Disadvantages:</b> the name <code>match</code> misleads many people (it is anchored at the start only), and forgetting to check for <code>None</code> gives <code>AttributeError</code>.`,
            r`import re
m = re.search(r"\d+", "no digits here")
try:
    print(m.group())
except AttributeError as e:
    print("AttributeError:", e)

# OUTPUT:
# AttributeError: 'NoneType' object has no attribute 'group'`],
        [`<b>Limitations:</b> both return only the <b>first</b> match (use <code>finditer</code> for all), and <code>match</code> with <code>$</code> still allows a trailing newline.`,
            r`import re
print(bool(re.match(r"abc$", "abc\n")))        # True! $ matches before a final newline
print(bool(re.fullmatch(r"abc", "abc\n")))     # False - strict
print(re.search(r"\d", "a1b2").group())        # only the first digit

# OUTPUT:
# True
# False
# 1`],
        `
   string:   o r d e r   4 5 2 1   s h i p p e d
   index:    0 1 2 3 4 5 6 7 8 9 ...
   match  ─► must hit at index 0  ──► None  (starts with 'o')
   search ─► slides along the text ──► first hit at 6..10 = "4521"
   fullmatch ─► pattern must consume the ENTIRE string
`,
        `Use <code>fullmatch</code> for validation, <code>search</code> for extraction, and <code>match</code> only for explicit prefix parsing. For anything structured (HTML, JSON, emails per RFC) use a real parser; regex is for flat text patterns.`
    ),

    're.findall() & re.sub()': dd(
        [`<code>re.findall(p, s)</code> returns a list of all non-overlapping matches. <code>re.sub(p, repl, s)</code> replaces each match, where <code>repl</code> may be a string with backreferences or a function. <code>re.finditer</code> yields Match objects lazily and <code>re.split</code> splits on a pattern.`,
            r`import re
text = "Call 555-1234 or 555-9876 today"
print(re.findall(r"\d{3}-\d{4}", text))
print(re.sub(r"\d{3}-\d{4}", "XXX-XXXX", text))

# OUTPUT:
# ['555-1234', '555-9876']
# Call XXX-XXXX or XXX-XXXX today`],
        [`Extracting every item, masking sensitive data and normalising messy text are everyday jobs. String methods cannot express "all numbers" or "any run of whitespace" in one call.`,
            r`import re
messy = "too    many\t\tspaces\nhere"
print(re.sub(r"\s+", " ", messy))             # collapse any whitespace
print(re.split(r"[,;]\s*", "a, b;c,   d"))    # split on several separators

# OUTPUT:
# too many spaces here
# ['a', 'b', 'c', 'd']`],
        [`Scraping prices, redacting emails and card numbers from logs, cleaning user input, reformatting dates, and generating slugs for URLs.`,
            r`import re
def slugify(title):
    s = re.sub(r"[^a-z0-9]+", "-", title.lower())   # non-alphanumerics -> dash
    return s.strip("-")

print(slugify("  Hello, World! Python 3.12  "))
print(re.sub(r"(\d{4})-(\d{2})-(\d{2})", r"\3/\2/\1", "2024-03-15"))   # reorder

# OUTPUT:
# hello-world-python-3-12
# 15/03/2024`],
        [`<b>Advantages:</b> one line replaces loops; the replacement can be a function for computed values; <code>count</code> limits replacements.`,
            r`import re
prices = "item $5 and $12"
doubled = re.sub(r"\$(\d+)", lambda m: "$" + str(int(m.group(1)) * 2), prices)
print(doubled)
print(re.sub(r"o", "0", "foo boo", count=2))

# OUTPUT:
# item $10 and $24
# f00 boo`],
        [`<b>Disadvantages:</b> with groups, <code>findall</code> returns the group contents (or tuples), not the whole match, which surprises people.`,
            r`import re
s = "a1 b2"
print(re.findall(r"[a-z]\d", s))        # whole matches
print(re.findall(r"([a-z])\d", s))      # ONE group -> only the group
print(re.findall(r"([a-z])(\d)", s))    # several groups -> tuples

# OUTPUT:
# ['a1', 'b2']
# ['a', 'b']
# [('a', '1'), ('b', '2')]`],
        [`<b>Limitations:</b> matches cannot overlap by default, <code>findall</code> builds the whole list in memory, and regex cannot count or match nested structures.`,
            r`import re
print(re.findall(r"aa", "aaaa"))               # 2 matches, not 3: no overlap
print(re.findall(r"(?=(aa))", "aaaa"))         # lookahead trick finds overlaps

# OUTPUT:
# ['aa', 'aa']
# ['aa', 'aa', 'aa']`],
        `
   text ─► [ regex engine ] ─► findall  → list of matches
                  │         ─► finditer → lazy Match objects
                  │         ─► sub      → NEW string (strings are immutable)
                  └─────────► split     → list of pieces between matches
`,
        `Prefer <code>finditer</code> for big inputs and <code>re.compile</code> for patterns used repeatedly. Never build patterns from user input without <code>re.escape</code>, and keep substitutions simple: complex rewriting belongs in a real parser.`
    ),

    'Character Classes': dd(
        [`A <b>character class</b> matches one character from a set. <code>[abc]</code> is any of a, b, c; <code>[a-z]</code> is a range; <code>[^0-9]</code> is negation. Shorthands: <code>&#92;d</code> digit, <code>&#92;w</code> word character, <code>&#92;s</code> whitespace (capitals negate), and <code>.</code> any character except newline.`,
            r`import re
print(re.findall(r"[aeiou]", "regular expression"))   # vowels
print(re.findall(r"[^a-z ]", "abc 123 x!"))           # anything but a-z/space
print(re.findall(r"\d", "a1b22"))

# OUTPUT:
# ['e', 'u', 'a', 'e', 'e', 'i', 'o']
# ['1', '2', '3', '!']
# ['1', '2', '2']`],
        [`Real text mixes letters, digits and symbols. Classes let a pattern say "a digit here, a letter there" instead of enumerating every value.`,
            r`import re
# A tiny car-plate pattern: 2 letters, 2 digits, 4 digits
plate = re.compile(r"[A-Z]{2}\d{2}\d{4}")
for p in ["KA011234", "ka011234", "K1011234"]:
    print(p, bool(plate.fullmatch(p)))

# OUTPUT:
# KA011234 True
# ka011234 False
# K1011234 False`],
        [`Tokenising code, validating IDs and postcodes, stripping non-alphanumerics, finding hex colours, and counting vowels or digits.`,
            r`import re
print(re.findall(r"#[0-9a-fA-F]{6}\b", "bg #FF8800 fg #00ff00 bad #12345"))
print(re.sub(r"[^\w\s]", "", "Hi, there! (ok)"))     # drop punctuation

# OUTPUT:
# ['#FF8800', '#00ff00']
# Hi there ok`],
        [`<b>Advantages:</b> compact, readable sets and ranges; shorthands are Unicode-aware for str patterns; case can be folded with <code>re.I</code>.`,
            r`import re
print(re.findall(r"\w+", "naïve café 42"))              # Unicode letters are \w
print(re.findall(r"[a-z]+", "Hello World", re.I))       # ignore case

# OUTPUT:
# ['naïve', 'café', '42']
# ['Hello', 'World']`],
        [`<b>Disadvantages:</b> inside a class, special characters change meaning (only <code>^ - ] &#92;</code> matter), and <code>&#92;d</code> also matches non-ASCII digits, which can surprise validators.`,
            r`import re
print(bool(re.fullmatch(r"\d+", "١٢٣")))                # Arabic-Indic digits match!
print(bool(re.fullmatch(r"[0-9]+", "١٢٣")))              # explicit range does not
print(bool(re.fullmatch(r"\d+", "١٢٣", re.ASCII)))      # ASCII flag fixes it

# OUTPUT:
# True
# False
# False`],
        [`<b>Limitations:</b> a class matches exactly one character; it cannot express "letters but not these three" without lookarounds, and <code>.</code> does not match newline unless <code>re.S</code> is given.`,
            r`import re
print(re.findall(r"a.b", "a\nb a-b"))                  # newline not matched by .
print(re.findall(r"a.b", "a\nb a-b", re.S))            # DOTALL makes . match it

# OUTPUT:
# ['a-b']
# ['a\nb', 'a-b']`],
        r`
   [aeiou]   one of a e i o u            \d  = [0-9]  (Unicode digits too)
   [a-z]     range                       \w  = [a-zA-Z0-9_] + Unicode letters
   [^0-9]    NOT a digit                 \s  = space, tab, newline ...
   .         any char except \n          \D \W \S = the opposites
`,
        `For input validation, prefer explicit ranges (<code>[0-9]</code>, <code>[A-Za-z]</code>) or the <code>re.ASCII</code> flag so behaviour does not depend on Unicode. Document intent with <code>re.VERBOSE</code> for long classes.`
    ),

    'Quantifiers': dd(
        [`<b>Quantifiers</b> say how many times the previous item repeats: <code>*</code> 0 or more, <code>+</code> 1 or more, <code>?</code> 0 or 1, <code>{n}</code> exactly n, <code>{n,m}</code> between n and m. By default they are <b>greedy</b> (take as much as possible); add <code>?</code> for <b>lazy</b> (as little as possible).`,
            r`import re
print(re.findall(r"ab*", "a ab abbb"))        # b zero or more
print(re.findall(r"\d{2,3}", "1 22 333 4444"))  # 2 to 3 digits

# OUTPUT:
# ['a', 'ab', 'abbb']
# ['22', '333', '444']`],
        [`Real values vary in length. Quantifiers describe optional parts and repeats compactly, and greedy vs lazy decides whether a match swallows too much.`,
            r`import re
html = "<b>bold</b> and <i>italic</i>"
print(re.findall(r"<.+>", html))     # greedy: one giant match
print(re.findall(r"<.+?>", html))    # lazy: each tag separately

# OUTPUT:
# ['<b>bold</b> and <i>italic</i>']
# ['<b>', '</b>', '<i>', '</i>']`],
        [`Optional country codes in phone numbers, variable-length IDs, whitespace runs, repeated fields in logs, and extracting quoted strings.`,
            r`import re
phones = ["+91 98765-43210", "98765-43210"]
p = re.compile(r"(\+\d{1,3} )?\d{5}-\d{5}")      # optional country code
print([bool(p.fullmatch(x)) for x in phones])
print(re.findall(r'"(.*?)"', 'say "hi" and "bye"'))   # lazy quoted text

# OUTPUT:
# [True, True]
# ['hi', 'bye']`],
        [`<b>Advantages:</b> express any repetition in a few characters; lazy mode gives precise extraction; possessive and atomic forms exist in Python 3.11+.`,
            r`import re
print(re.fullmatch(r"\d{3}-\d{4}", "555-1234") is not None)
print(re.match(r"a{2,}", "aaaa").group())     # 2 or more, greedy

# OUTPUT:
# True
# aaaa`],
        [`<b>Disadvantages:</b> nested quantifiers can cause <b>catastrophic backtracking</b>: the engine tries exponentially many paths and the program appears to hang (ReDoS).`,
            r`import re, time
pattern = re.compile(r"(a+)+$")          # nested quantifiers: dangerous
s = "a" * 22 + "b"                       # near-miss forces massive backtracking
t = time.perf_counter()
print(pattern.match(s))
print("took > 0.1s:", time.perf_counter() - t > 0.1)

# OUTPUT (time varies by machine):
# None
# took > 0.1s: True`],
        [`<b>Limitations:</b> quantifiers apply only to the single preceding item or group, cannot count a number that depends on data (such as "n opens then n closes"), and the <code>{}</code> syntax is a literal if it is not a valid quantifier.`,
            r`import re
print(re.findall(r"ab{2}", "ab abb"))          # {2} applies to b only, not "ab"
print(re.findall(r"(ab){2}", "abab"))          # group needed to repeat "ab"
print(re.findall(r"a{x}", "a{x}"))             # not a quantifier: literal text

# OUTPUT:
# ['abb']
# ['ab']
# ['a{x}']`],
        `
   *  {0,}      +  {1,}      ?  {0,1}      {n,m}
   greedy:   <.+>   ──► grabs to the LAST '>'      <b>bold</b> and <i>x</i>
   lazy:     <.+?>  ──► stops at the FIRST '>'     <b>
   engine:  try ─► fail ─► backtrack ─► try ... (cost can explode)
`,
        `Bound your repeats (<code>{1,64}</code>) and avoid nested quantifiers on user-controlled input; use timeouts, the <code>regex</code> library with timeout, or linear-time engines (RE2) for untrusted data. Anchor patterns and prefer specific classes over <code>.*</code>.`
    ),

    'Groups & Named Groups': dd(
        [`Parentheses create a <b>group</b> that captures the matched text and can be repeated as a unit. Access them with <code>m.group(n)</code> or <code>m.groups()</code>. <code>(?P&lt;name&gt;...)</code> gives a <b>named group</b> read by <code>m.group("name")</code> or <code>m.groupdict()</code>. <code>(?:...)</code> groups without capturing.`,
            r`import re
m = re.search(r"(\d{4})-(\d{2})-(\d{2})", "Date: 2024-03-15")
print(m.group(0), m.groups())
print(m.group(1), m.group(3))

# OUTPUT:
# 2024-03-15 ('2024', '03', '15')
# 2024 15`],
        [`Without groups you would have to slice the match by position. Groups pull out fields directly, and names make patterns self-documenting and robust against reordering.`,
            r`import re
pat = re.compile(r"(?P<user>\w+)@(?P<domain>[\w.]+)")
m = pat.search("write to ann@example.com please")
print(m.group("user"), m.group("domain"))
print(m.groupdict())

# OUTPUT:
# ann example.com
# {'user': 'ann', 'domain': 'example.com'}`],
        [`Parsing log lines, dates, URLs and CSV-like text into dictionaries; reformatting with backreferences; detecting repeated words.`,
            r`import re
line = '127.0.0.1 - GET /index.html 200'
m = re.match(r"(?P<ip>\S+) - (?P<method>[A-Z]+) (?P<path>\S+) (?P<status>\d{3})", line)
print(m.groupdict())
print(re.findall(r"\b(\w+) \1\b", "this is is a test test"))   # repeated words

# OUTPUT:
# {'ip': '127.0.0.1', 'method': 'GET', 'path': '/index.html', 'status': '200'}
# ['is', 'test']`],
        [`<b>Advantages:</b> structured extraction, reuse of captured text (<code>&#92;1</code> or <code>(?P=name)</code>), non-capturing groups for grouping without cost, and <code>sub</code> can reorder fields.`,
            r`import re
print(re.sub(r"(?P<first>\w+) (?P<last>\w+)", r"\g<last>, \g<first>", "Ada Lovelace"))
print(re.findall(r"(?:ab)+", "ababab ab"))     # non-capturing: whole matches

# OUTPUT:
# Lovelace, Ada
# ['ababab', 'ab']`],
        [`<b>Disadvantages:</b> numbered groups break when you add a group earlier in the pattern, and a group inside a repeat remembers only its <i>last</i> iteration.`,
            r`import re
m = re.match(r"(\d)+", "123")
print(m.group(), m.group(1))     # group 1 holds only the last repeat

# OUTPUT:
# 123 3`],
        [`<b>Limitations:</b> an optional group that did not participate returns <code>None</code>, group names must be unique and valid identifiers, and Python's <code>re</code> has no recursion for nested groups.`,
            r`import re
m = re.match(r"(\w+)(-(\d+))?", "item")
print(m.groups())                       # unmatched optional parts are None
print(m.group(3) or "n/a")

# OUTPUT:
# ('item', None, None)
# n/a`],
        r`
   "2024-03-15"  matched by  (?P<y>\d{4})-(?P<m>\d{2})-(?P<d>\d{2})
        │
        ├─ group 0 : whole match       "2024-03-15"
        ├─ group 1 / y : "2024"
        ├─ group 2 / m : "03"
        └─ group 3 / d : "15"        ──► m.groupdict() = {'y':..., 'm':..., 'd':...}
`,
        `Always use named groups for patterns with more than two fields, and keep the pattern in a compiled, commented (<code>re.VERBOSE</code>) constant. Parse into dataclasses right after matching so loose strings do not leak into the codebase.`
    ),
};

