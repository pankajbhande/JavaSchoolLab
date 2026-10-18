import type { Topic } from '../../types';

export const regexProjectLogParser: Topic = {
    id: 'python-regex-project-log-parser',
    name: 'Project: Log Parser',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Application logs are text lines with a regular layout. In this project a regex with <b>named groups</b> turns each line into a record (time, level, module, message). From records you can count levels, find errors and build reports. Lines that do not match are counted and skipped instead of crashing the parser.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 700 83" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="191.9" height="63" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="106" y="38">log line</tspan><tspan x="106" y="53">14:32:15 ERROR [db] ...</tspan></text><line x1="201.9" y1="41.5" x2="231.9" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="235.9" y="10" width="111.6" height="63" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="291.7" y="38">regex with</tspan><tspan x="291.7" y="53">named groups</tspan></text><line x1="347.5" y1="41.5" x2="377.5" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="381.5" y="10" width="133.5" height="63" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="448.3" y="30.5">record (dict)</tspan><tspan x="448.3" y="45.5">time, level,</tspan><tspan x="448.3" y="60.5">module, message</tspan></text><line x1="515" y1="41.5" x2="545" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="549" y="10" width="140.8" height="63" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="619.4" y="38">Counter by level</tspan><tspan x="619.4" y="53">error report</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: from raw text to a summary</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A server writes thousands of log lines a minute. Reading them by eye does not scale; <code>split()</code> breaks when messages contain spaces or brackets.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Convert <b>unstructured text</b> into structured data.</li>
<li>Summarise logs: counts per level, errors per module.</li>
<li>Practise robust parsing: skip bad lines, stay memory-friendly with generators.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Counting levels and reporting errors</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import re
from collections import Counter

LOG = re.compile(
    r"(?P<time>\\d{2}:\\d{2}:\\d{2}) (?P<level>[A-Z]+) \\[(?P<module>\\w+)\\] (?P<message>.*)"
)

LINES = [
    "14:32:10 INFO [auth] User abaji logged in",
    "14:32:15 ERROR [db] Connection timeout",
    "garbage line",
    "14:33:01 WARNING [auth] Login failed for raoji",
    "14:35:42 ERROR [auth] Invalid token",
]


def main():
    levels = Counter()
    skipped = 0

    for line in LINES:
        match = LOG.fullmatch(line)
        if match is None:
            skipped += 1
            continue
        levels[match["level"]] += 1
        if match["level"] == "ERROR":
            print("ERROR in", match["module"], "->", match["message"])

    print(dict(levels))
    print("skipped:", skipped)


if __name__ == "__main__":
    main()

# OUTPUT:
# ERROR in db -> Connection timeout
# ERROR in auth -> Invalid token
# {'INFO': 1, 'ERROR': 2, 'WARNING': 1}
# skipped: 1`
            ],
            codeExplanations: [
                `fullmatch() returns None for the malformed line, which we count and skip. Named groups give readable access (match["level"]). Counter keeps insertion order, so the summary shows INFO first, then ERROR, then WARNING.`
            ]
        },
        {
            content: `<h4>The Goal</h4>
Application logs are lines of text with a regular layout. Using a regex with <b>named groups</b> you can turn each line into a dictionary of fields (timestamp, level, module, message), then count and filter them. Our log format:
<pre>2026-10-05 14:32:10 ERROR [db] Connection timeout after 30s</pre>`
        },
        {
            content: `<h4>Step 1: Parse One Line</h4>`,
            codeExamples: [
                `import re

LOG = re.compile(
    r"(?P<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) "
    r"(?P<level>[A-Z]+) "
    r"\\[(?P<module>\\w+)\\] "
    r"(?P<message>.*)"
)

line = "2026-10-05 14:32:10 ERROR [db] Connection timeout after 30s"
m = LOG.fullmatch(line)

print(m.groupdict())

# OUTPUT:
# {'time': '2026-10-05 14:32:10', 'level': 'ERROR', 'module': 'db', 'message': 'Connection timeout after 30s'}`
            ],
            codeExplanations: [
                `The pattern is split over several adjacent raw strings that Python joins into one. \\[ and \\] match literal square brackets. (?P<message>.*) takes whatever remains of the line. groupdict() returns every named group as a dictionary - one parsed record.`
            ]
        },
        {
            content: `<h4>Step 2: Parse Many Lines and Count Levels</h4>
Loop over the lines, skip any that do not match (<code>match</code> returns <code>None</code>), and count levels with <code>collections.Counter</code>.`,
            codeExamples: [
                `import re
from collections import Counter

LOG = re.compile(
    r"(?P<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) "
    r"(?P<level>[A-Z]+) \\[(?P<module>\\w+)\\] (?P<message>.*)"
)

lines = """2026-10-05 14:32:10 INFO [auth] User abaji logged in
2026-10-05 14:32:15 ERROR [db] Connection timeout after 30s
this line is malformed
2026-10-05 14:33:01 WARNING [auth] Login failed for user=raoji ip=10.0.0.5
2026-10-05 14:35:42 ERROR [auth] Invalid token""".splitlines()

counts = Counter()
skipped = 0
for line in lines:
    m = LOG.fullmatch(line)
    if m:
        counts[m["level"]] += 1
    else:
        skipped += 1

print(dict(counts))
print("skipped:", skipped)

# OUTPUT:
# {'INFO': 1, 'ERROR': 2, 'WARNING': 1}
# skipped: 1`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Extracting key=value Pairs From the Message</h3>
Many log messages carry structured data as <code>key=value</code> pairs. A second, small regex pulls them out of the free-text message into a dictionary.`,
            codeExamples: [
                `import re

message = "Login failed for user=raoji ip=10.0.0.5 attempts=3"

fields = dict(re.findall(r"(\\w+)=(\\S+)", message))
print(fields)

# OUTPUT:
# {'user': 'raoji', 'ip': '10.0.0.5', 'attempts': '3'}`
            ]
        },
        {
            content: `<h3>Streaming a Large File With a Generator</h3>
Log files can be gigabytes. Do <b>not</b> call <code>read()</code> or <code>readlines()</code>. Iterate the file object (one line at a time) inside a generator, so memory use stays constant, and convert the timestamp to a real <code>datetime</code> so you can filter by time.`,
            codeExamples: [
                `import re
from datetime import datetime

LOG = re.compile(
    r"(?P<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) "
    r"(?P<level>[A-Z]+) \\[(?P<module>\\w+)\\] (?P<message>.*)"
)

def parse_log(path):
    with open(path, encoding="utf-8") as f:
        for line in f:                         # lazy: one line at a time
            m = LOG.fullmatch(line.rstrip("\\n"))
            if m:
                record = m.groupdict()
                record["time"] = datetime.strptime(record["time"], "%Y-%m-%d %H:%M:%S")
                yield record

errors = (r for r in parse_log("app.log") if r["level"] == "ERROR")
for record in errors:
    print(record["time"], record["module"], record["message"])`
            ]
        },
        {
            content: `<h3>A Web-Server Access Log</h3>
The same technique parses the <b>Common Log Format</b> used by Apache and Nginx. Note <code>[^\\]]+</code> (anything except a closing bracket) for the timestamp and <code>[^"]*</code> for the rest of the quoted request.`,
            codeExamples: [
                `import re

ACCESS = re.compile(
    r'(?P<ip>\\S+) \\S+ \\S+ \\[(?P<time>[^\\]]+)\\] '
    r'"(?P<method>[A-Z]+) (?P<path>\\S+) [^"]*" '
    r'(?P<status>\\d{3}) (?P<size>\\d+|-)'
)

line = '127.0.0.1 - - [05/Oct/2026:14:32:10 +0530] "GET /index.html HTTP/1.1" 200 1043'
print(ACCESS.match(line).groupdict())

# OUTPUT:
# {'ip': '127.0.0.1', 'time': '05/Oct/2026:14:32:10 +0530', 'method': 'GET', 'path': '/index.html', 'status': '200', 'size': '1043'}`
            ]
        },
        {
            content: `<h3>Design Notes</h3>
<ul>
<li><b>Be strict, but never crash:</b> real logs contain malformed lines and multi-line stack traces. Count or collect lines that do not match instead of raising.</li>
<li><b>Anchor patterns</b> and prefer specific classes (<code>\\d{4}</code>, <code>[A-Z]+</code>) over <code>.*</code> to keep matching fast.</li>
<li><b>Prefer structured logging</b> (JSON lines) for new systems: <code>json.loads</code> is faster and safer than regex. Parse text logs only when you cannot change the producer.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Works on any text logs without changing the application</td><td>Fragile: a change in log format breaks the pattern</td></tr>
<tr><td>Named groups produce readable, self-documenting code</td><td>Multi-line records (stack traces) need extra handling</td></tr>
<tr><td>Generators can stream gigabyte files with constant memory</td><td>Slower than parsing JSON logs</td></tr>
<tr><td>Easy to extend: add fields, filters, time windows</td><td>Structured (JSON) logging avoids parsing altogether</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why named groups for a log parser?</td><td>groupdict() converts a line directly into a record with readable field names</td></tr>
<tr class='text-center'><td>How do you process a multi-GB log file?</td><td>Iterate the file lazily inside a generator; never read the whole file into memory</td></tr>
<tr class='text-center'><td>How do you handle lines that do not match?</td><td>Check for None, then skip or count them - do not let the parser crash</td></tr>
<tr class='text-center'><td>Why <code>[^\\]]+</code> for the timestamp?</td><td>It matches everything up to the closing bracket and cannot run past it, unlike a greedy <code>.*</code></td></tr>
<tr class='text-center'><td>Is regex the best log format solution?</td><td>No - structured (JSON) logging avoids parsing altogether</td></tr>
</table>`
        }
    ]
};
