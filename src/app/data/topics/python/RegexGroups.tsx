import type { Topic } from '../../types';

export const regexGroups: Topic = {
    id: 'python-regex-groups-named-groups',
    name: 'Groups & Named Groups',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Parentheses <code>( )</code> do two jobs: they <b>group</b> part of a pattern so a quantifier or <code>|</code> applies to all of it, and they <b>capture</b> the matched text so you can read it afterwards. Groups are numbered from 1 by their opening bracket; group 0 is the whole match. <b>Named groups</b> <code>(?P&lt;name&gt;...)</code> make this readable, and <b>non-capturing groups</b> <code>(?:...)</code> group without capturing.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 460 83" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="111.6" height="63" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="65.8" y="45.5">"05/10/2026"</tspan></text><line x1="121.6" y1="41.5" x2="151.6" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="155.6" y="10" width="148.1" height="63" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="229.7" y="30.5">(?P&lt;day&gt;\\d{2})/</tspan><tspan x="229.7" y="45.5">(?P&lt;month&gt;\\d{2})/</tspan><tspan x="229.7" y="60.5">(?P&lt;year&gt;\\d{4})</tspan></text><line x1="303.7" y1="41.5" x2="333.7" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="337.7" y="10" width="111.6" height="63" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="393.5" y="30.5">day   = 05</tspan><tspan x="393.5" y="45.5">month = 10</tspan><tspan x="393.5" y="60.5">year  = 2026</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: each named group captures one slice of the matched text</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Matching a date is easy; <i>using</i> its day, month and year separately is not - slicing the matched string by index breaks when the format changes.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Extract <b>parts</b> of a match (day, month, year) without slicing.</li>
<li>Apply a quantifier or alternation to <b>several characters</b> at once.</li>
<li>Rearrange text in <code>re.sub</code> using backreferences (<code>\\1</code>, <code>\\g&lt;name&gt;</code>).</li>
<li>Find <b>repeated</b> text such as doubled words with <code>\\1</code>.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Parsing and reformatting dates with named groups</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re

DATE = re.compile(r"(?P<day>\\d{2})/(?P<month>\\d{2})/(?P<year>\\d{4})")


def main():
    text = "Joined on 05/10/2026, left on 17/03/2027."

    first = DATE.search(text)
    print("whole match :", first.group())
    print("day, month  :", first.group("day"), first.group("month"))
    print("as dict     :", first.groupdict())

    print("ISO dates   :", DATE.sub(r"\\g<year>-\\g<month>-\\g<day>", text))
    print("all years   :", [m["year"] for m in DATE.finditer(text)])


if __name__ == "__main__":
    main()

# OUTPUT:
# whole match : 05/10/2026
# day, month  : 05 10
# as dict     : {'day': '05', 'month': '10', 'year': '2026'}
# ISO dates   : Joined on 2026-10-05, left on 2027-03-17.
# all years   : ['2026', '2027']`
            ],
            codeExplanations: [
                `The pattern is compiled once at module level and reused. search() finds the first date; group("day") reads one slice and groupdict() returns all of them. sub() rebuilds every date as year-month-day using \\g<name> references, and finditer() lets us collect one group from every match.`
            ]
        },
        {
            content: `<h4>Capturing Groups</h4>
Parentheses <code>( )</code> do two jobs: they <b>group</b> part of a pattern (so a quantifier can apply to all of it) and they <b>capture</b> the text matched inside, so you can pull it out afterwards. Groups are numbered from 1 by the position of their opening bracket; group 0 is always the whole match.`,
            codeExamples: [
                `import re

m = re.search(r"(\\d{4})-(\\d{2})-(\\d{2})", "Date: 2026-10-05")

print(m.group(0))
print(m.group(1), m.group(2), m.group(3))
print(m.groups())

year, month, day = m.groups()
print(day, month, year)

# OUTPUT:
# 2026-10-05
# 2026 10 05
# ('2026', '10', '05')
# 05 10 2026`
            ]
        },
        {
            content: `<h4>Named Groups</h4>
Numbers get confusing as a pattern grows. <code>(?P&lt;name&gt;...)</code> gives a group a <b>name</b>, and you read it back with <code>m.group("name")</code> or <code>m["name"]</code>. <code>m.groupdict()</code> returns them all as a dictionary.`,
            codeExamples: [
                `import re

pattern = r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})"
m = re.search(pattern, "Date: 2026-10-05")

print(m.group("year"))
print(m["month"])
print(m.groupdict())

# OUTPUT:
# 2026
# 10
# {'year': '2026', 'month': '10', 'day': '05'}`
            ]
        },
        {
            content: `<h4>Alternation and Non-Capturing Groups</h4>
The pipe <code>|</code> means "or". To group without capturing - for example to apply <code>|</code> to just part of a pattern - use <code>(?:...)</code>. This keeps <code>findall()</code> and <code>groups()</code> free of unwanted extras.`,
            codeExamples: [
                `import re

text = "Mr. Rao met Ms. Iyer"

print(re.findall(r"(Mr|Ms)\\. (\\w+)", text))     # both groups captured
print(re.findall(r"(?:Mr|Ms)\\. (\\w+)", text))   # title grouped, not captured

# OUTPUT:
# [('Mr', 'Rao'), ('Ms', 'Iyer')]
# ['Rao', 'Iyer']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Backreferences: Match the Same Text Again</h3>
Inside a pattern, <code>\\1</code> (or <code>(?P=name)</code>) means "the exact text group 1 matched". It is how you find repeated characters or repeated words.`,
            codeExamples: [
                `import re

print(re.search(r"(\\w)\\1", "hello").group())
print(re.findall(r"\\b(\\w+) \\1\\b", "this is is a test test"))
print(re.search(r"(?P<w>\\w+) (?P=w)", "go go now").group("w"))

# OUTPUT:
# ll
# ['is', 'test']
# go`
            ]
        },
        {
            content: `<h3>Optional Groups and Repeated Groups</h3>
A group that did not take part in the match returns <code>None</code>, not an empty string. And when a group is repeated by a quantifier, it remembers only its <b>last</b> iteration.`,
            codeExamples: [
                `import re

m = re.search(r"(\\d+)(?:\\.(\\d+))?", "v12")
print(m.groups())
print(m.group(2) or "0")

m = re.search(r"(\\d)+", "123")
print(m.group(), m.group(1))       # whole match vs last repetition

print(re.search(r"(a)|(b)", "b").lastindex)

# OUTPUT:
# ('12', None)
# 0
# 123 3
# 2`
            ]
        },
        {
            content: `<h3>Using Groups in sub(), Flags and Verbose Patterns</h3>
Named groups make replacements self-documenting (<code>\\g&lt;name&gt;</code>). For long patterns, <code>re.VERBOSE</code> lets you spread the pattern over lines and add comments, which is the best way to keep a multi-group regex maintainable.`,
            codeExamples: [
                `import re

PHONE = re.compile(r"""
    (?P<country>\\+\\d{1,3})   # country code
    [\\s-]?
    (?P<number>\\d{10})        # 10-digit number
""", re.VERBOSE)

m = PHONE.search("Call +91 9876543210 today")
print(m.group("country"), m.group("number"))

print(PHONE.sub(r"\\g<number> (\\g<country>)", "Call +91 9876543210 today"))

# OUTPUT:
# +91 9876543210
# Call 9876543210 (+91) today`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Turn a match into structured data (<code>groupdict()</code>)</td><td>Numbered groups break when a group is added or removed</td></tr>
<tr><td>Named groups document the pattern and survive edits</td><td>An unmatched optional group returns <code>None</code>, not <code>""</code></td></tr>
<tr><td>Backreferences enable rearranging and "same text again" rules</td><td>A repeated group remembers only its last repetition</td></tr>
<tr><td>Non-capturing groups keep <code>findall</code> output clean</td><td>Many groups make patterns long; use <code>re.VERBOSE</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does group(0) return?</td><td>The entire matched text</td></tr>
<tr class='text-center'><td>How do you name a group?</td><td><code>(?P&lt;name&gt;...)</code>, read back with <code>m.group("name")</code> or <code>m.groupdict()</code></td></tr>
<tr class='text-center'><td>Capturing vs non-capturing group?</td><td><code>(...)</code> stores the text; <code>(?:...)</code> only groups</td></tr>
<tr class='text-center'><td>What is a backreference?</td><td><code>\\1</code> or <code>(?P=name)</code> - match the same text a group captured earlier</td></tr>
<tr class='text-center'><td>What does an unmatched optional group return?</td><td><code>None</code></td></tr>
</table>`
        }
    ]
};
