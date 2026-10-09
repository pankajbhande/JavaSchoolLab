import type { Topic } from '../../types';

export const jsonCsvModules: Topic = {
    id: 'python-modules-packages-json-csv-modules',
    name: 'json & csv Modules',
    beginner: [
        {
            content: `<h4>Two Text Formats, Two Modules</h4>
• <b>JSON</b> - nested data (objects and arrays). The format of web APIs and config files.<br>
• <b>CSV</b> - flat tables (rows and columns). The format of spreadsheets and data exports.<br><br>
This topic focuses on the two modules' APIs working with <b>strings</b>. Reading and writing them as files is covered in the <i>File Handling</i> module (<i>CSV Files</i> and <i>JSON Files</i>).`
        },
        {
            content: `<h4>json: Four Functions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Converts</th></tr>
<tr class='text-center'><td><code>json.dumps(obj)</code></td><td>Python object → JSON <b>s</b>tring</td></tr>
<tr class='text-center'><td><code>json.loads(text)</code></td><td>JSON <b>s</b>tring → Python object</td></tr>
<tr class='text-center'><td><code>json.dump(obj, file)</code></td><td>Python object → written to a file</td></tr>
<tr class='text-center'><td><code>json.load(file)</code></td><td>Read from a file → Python object</td></tr>
</table>
The trailing <b>s</b> stands for "string".`
        },
        {
            content: `<h4>Parsing an API Response with json.loads()</h4>
JSON types map onto Python types: object → <code>dict</code>, array → <code>list</code>, string → <code>str</code>, number → <code>int</code>/<code>float</code>, <code>true</code>/<code>false</code> → <code>True</code>/<code>False</code>, <code>null</code> → <code>None</code>.`,
            codeExamples: [
                `import json

response = '{"id": 7, "name": "Asha", "active": true, "tags": ["admin"], "manager": null}'

user = json.loads(response)
print(user)
print(type(user), user["name"], user["active"], user["manager"])

# OUTPUT:
# {'id': 7, 'name': 'Asha', 'active': True, 'tags': ['admin'], 'manager': None}
# <class 'dict'> Asha True None`
            ]
        },
        {
            content: `<h4>Creating JSON with json.dumps()</h4>
<code>indent</code> pretty-prints, <code>sort_keys</code> orders the keys, and <code>separators</code> removes spaces for the most compact output.`,
            codeExamples: [
                `import json

order = {"id": 42, "items": ["pen", "book"], "paid": False, "coupon": None}

print(json.dumps(order))
print(json.dumps(order, separators=(",", ":")))
print(json.dumps(order, indent=2, sort_keys=True))

# OUTPUT:
# {"id": 42, "items": ["pen", "book"], "paid": false, "coupon": null}
# {"id":42,"items":["pen","book"],"paid":false,"coupon":null}
# {
#   "coupon": null,
#   "id": 42,
#   "items": [
#     "pen",
#     "book"
#   ],
#   "paid": false
# }`
            ]
        },
        {
            content: `<h4>Round-Trip Surprises</h4>
JSON has fewer types than Python, so some values change on the way through: tuples become lists, and dictionary keys always become strings.`,
            codeExamples: [
                `import json

print(json.loads(json.dumps((1, 2))))
print(json.loads(json.dumps({1: "one"})))
print(json.dumps({"price": "₹500"}))
print(json.dumps({"price": "₹500"}, ensure_ascii=False))

# OUTPUT:
# [1, 2]
# {'1': 'one'}
# {"price": "\\u20b9500"}
# {"price": "₹500"}`
            ]
        },
        {
            content: `<h4>csv: Parsing Text with csv.reader</h4>
<code>csv.reader</code> accepts any iterable of lines - an open file, a list of strings, or an <code>io.StringIO</code> wrapping some text. Every value comes back as a <b>string</b>.`,
            codeExamples: [
                `import csv
import io

text = "name,city,marks\\nAsha,Pune,91\\nRavi,Latur,78\\n"

for row in csv.reader(io.StringIO(text)):
    print(row)

lines = ["a,b", "c,d"]
print(list(csv.reader(lines)))

# OUTPUT:
# ['name', 'city', 'marks']
# ['Asha', 'Pune', '91']
# ['Ravi', 'Latur', '78']
# [['a', 'b'], ['c', 'd']]`
            ]
        },
        {
            content: `<h4>Why Not Just split(",")?</h4>
Real CSV values can contain commas, quotes and even newlines, protected by double quotes. <code>split</code> breaks them; the <code>csv</code> module handles them correctly.`,
            codeExamples: [
                `import csv

line = 'Asha,"Pune, MH",91'

print(line.split(","))
print(next(csv.reader([line])))

# OUTPUT:
# ['Asha', '"Pune', ' MH"', '91']
# ['Asha', 'Pune, MH', '91']`
            ]
        },
        {
            content: `<h4>DictReader and Writing CSV</h4>
<code>csv.DictReader</code> uses the header row as keys. <code>csv.writer</code> quotes values only where needed. By default it ends each row with <code>\\r\\n</code>, as the CSV standard specifies.`,
            codeExamples: [
                `import csv
import io

text = "name,marks\\nAsha,91\\nRavi,78\\n"
for row in csv.DictReader(io.StringIO(text)):
    print(row["name"], int(row["marks"]) + 5)

out = io.StringIO()
writer = csv.writer(out)
writer.writerow(["name", "city"])
writer.writerow(["Asha", "Pune, MH"])
print(repr(out.getvalue()))

# OUTPUT:
# Asha 96
# Ravi 83
# 'name,city\\r\\nAsha,"Pune, MH"\\r\\n'`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Serialising Custom Types</h3>
<code>json.dumps</code> knows only dicts, lists, strings, numbers, booleans and None. For anything else, pass a <code>default=</code> function that converts unknown objects, or subclass <code>json.JSONEncoder</code>.`,
            codeExamples: [
                `import json
from datetime import date
from decimal import Decimal

order = {"placed": date(2026, 10, 4), "total": Decimal("1499.50")}

try:
    json.dumps(order)
except TypeError as error:
    print("Error:", error)

print(json.dumps(order, default=str))

class ShopEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, date):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

print(json.dumps(order, cls=ShopEncoder))

# OUTPUT:
# Error: Object of type date is not JSON serializable
# {"placed": "2026-10-04", "total": "1499.50"}
# {"placed": "2026-10-04", "total": 1499.5}`
            ]
        },
        {
            content: `<h3>Decoding into Objects and Exact Money</h3>
<code>object_hook</code> is called for every decoded JSON object, so you can turn dicts into objects with attribute access. <code>parse_float=Decimal</code> keeps prices exact instead of converting them to binary floats.`,
            codeExamples: [
                `import json
from decimal import Decimal
from types import SimpleNamespace

text = '{"name": "Asha", "address": {"city": "Pune"}, "balance": 1999.99}'

user = json.loads(text, object_hook=lambda d: SimpleNamespace(**d))
print(user.name, user.address.city)

exact = json.loads(text, parse_float=Decimal)
print(exact["balance"], type(exact["balance"]))

# OUTPUT:
# Asha Pune
# 1999.99 <class 'decimal.Decimal'>`
            ]
        },
        {
            content: `<h3>Handling Invalid JSON</h3>
Bad input raises <code>json.JSONDecodeError</code> (a subclass of <code>ValueError</code>) with the line and column of the problem. A frequent cause is Python-style text: single quotes, <code>True</code>, or a trailing comma.`,
            codeExamples: [
                `import json

bad = "{'name': 'Asha'}"            # single quotes are not valid JSON

try:
    json.loads(bad)
except json.JSONDecodeError as error:
    print("Invalid JSON:", error)

# OUTPUT:
# Invalid JSON: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)`
            ]
        },
        {
            content: `<h3>Command-Line JSON and Large Files</h3>
• <code>python -m json.tool data.json</code> validates and pretty-prints a JSON file - handy for inspecting API responses.<br>
• <code>json.load</code> reads the whole document into memory. For very large data, use <b>JSON Lines</b> (one JSON object per line, <code>.jsonl</code>) and process it line by line, or a streaming parser such as the third-party <code>ijson</code>.`,
            codeExamples: [
                `import io
import json

log = io.StringIO('{"user": "asha", "ms": 120}\\n{"user": "ravi", "ms": 340}\\n')

total = 0
for line in log:                    # one small object at a time
    record = json.loads(line)
    total += record["ms"]
print(total)

# $ python -m json.tool response.json     (pretty-prints, or reports the error)

# OUTPUT:
# 460`
            ]
        },
        {
            content: `<h3>csv Dialects, Delimiters and Quoting</h3>
A <b>dialect</b> bundles formatting rules: <code>"excel"</code> (the default, comma-separated) and <code>"excel-tab"</code> (tab-separated). Individual options such as <code>delimiter</code> and <code>quoting</code> override them. <code>csv.Sniffer</code> can guess the format of unknown text.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Constant</th><th>Quotes</th></tr>
<tr class='text-center'><td><code>csv.QUOTE_MINIMAL</code></td><td>Only fields that need it (default)</td></tr>
<tr class='text-center'><td><code>csv.QUOTE_ALL</code></td><td>Every field</td></tr>
<tr class='text-center'><td><code>csv.QUOTE_NONNUMERIC</code></td><td>All non-numeric fields (readers then convert unquoted fields to float)</td></tr>
<tr class='text-center'><td><code>csv.QUOTE_NONE</code></td><td>Never - needs an <code>escapechar</code> for special characters</td></tr>
</table>`,
            codeExamples: [
                `import csv
import io

row = ["Asha", 91]

for quoting in (csv.QUOTE_MINIMAL, csv.QUOTE_ALL, csv.QUOTE_NONNUMERIC):
    out = io.StringIO()
    csv.writer(out, quoting=quoting).writerow(row)
    print(repr(out.getvalue()))

out = io.StringIO()
csv.writer(out, dialect="excel-tab").writerow(row)
print(repr(out.getvalue()))

print(list(csv.reader(["Asha;91"], delimiter=";")))
print(repr(csv.Sniffer().sniff("a;b;c\\n1;2;3\\n").delimiter))

# OUTPUT:
# 'Asha,91\\r\\n'
# '"Asha","91"\\r\\n'
# '"Asha",91\\r\\n'
# 'Asha\\t91\\r\\n'
# [['Asha', '91']]
# ';'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>dumps vs dump, loads vs load?</td><td>The -s versions work with strings; the others read from or write to file objects</td></tr>
<tr class='text-center'><td>What does JSON null become in Python?</td><td>None (and true/false become True/False)</td></tr>
<tr class='text-center'><td>Why does <code>{1: "a"}</code> come back as <code>{"1": "a"}</code>?</td><td>JSON object keys are always strings</td></tr>
<tr class='text-center'><td>How do you serialise a datetime or Decimal?</td><td>Pass <code>default=</code> (e.g. str) or a custom JSONEncoder subclass via <code>cls=</code></td></tr>
<tr class='text-center'><td>Why use the csv module instead of split(",")?</td><td>It handles quoted fields containing commas, quotes and newlines</td></tr>
<tr class='text-center'><td>What type are values read by csv.reader?</td><td>Always strings - convert them yourself</td></tr>
<tr class='text-center'><td>How do you process a huge JSON data set?</td><td>Use JSON Lines and parse one line at a time, or a streaming parser</td></tr>
</table>`
        }
    ]
};
