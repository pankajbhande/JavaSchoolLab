import type { Topic } from '../../types';

export const jsonFiles: Topic = {
    id: 'python-file-handling-json-files',
    name: 'JSON Files',
    beginner: [
        {
            content: `<h4>What is JSON?</h4>
<b>JSON</b> (JavaScript Object Notation) is the standard text format for structured data - web APIs, configuration files, NoSQL databases. It looks almost exactly like Python dicts and lists, and the built-in <code>json</code> module converts between the two.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>JSON</th><th>Python</th></tr>
<tr class='text-center'><td>object <code>{"a": 1}</code></td><td><code>dict</code></td></tr>
<tr class='text-center'><td>array <code>[1, 2]</code></td><td><code>list</code></td></tr>
<tr class='text-center'><td>string <code>"text"</code></td><td><code>str</code></td></tr>
<tr class='text-center'><td>number <code>7</code> / <code>7.5</code></td><td><code>int</code> / <code>float</code></td></tr>
<tr class='text-center'><td><code>true</code> / <code>false</code></td><td><code>True</code> / <code>False</code></td></tr>
<tr class='text-center'><td><code>null</code></td><td><code>None</code></td></tr>
</table>`
        },
        {
            content: `<h4>Saving Data: json.dump</h4>
<code>json.dump(data, file, indent=2)</code> writes the data as nicely indented JSON. Note how <code>True</code> becomes <code>true</code> and <code>None</code> becomes <code>null</code>.`,
            codeExamples: [
                `import json

settings = {
    "theme": "dark",
    "font_size": 14,
    "autosave": True,
    "recent_files": ["notes.txt", "todo.md"],
    "proxy": None,
}

with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2)

with open("settings.json", encoding="utf-8") as f:
    print(f.read())

# OUTPUT:
# {
#   "theme": "dark",
#   "font_size": 14,
#   "autosave": true,
#   "recent_files": [
#     "notes.txt",
#     "todo.md"
#   ],
#   "proxy": null
# }`
            ]
        },
        {
            content: `<h4>Loading Data: json.load</h4>
<code>json.load(file)</code> reads the file back into Python objects - a full round trip.`,
            codeExamples: [
                `import json

settings = {"theme": "dark", "font_size": 14, "autosave": True, "proxy": None}
with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2)

with open("settings.json", encoding="utf-8") as f:
    loaded = json.load(f)

print(loaded)
print(loaded == settings, type(loaded["autosave"]), loaded["proxy"])

# OUTPUT:
# {'theme': 'dark', 'font_size': 14, 'autosave': True, 'proxy': None}
# True <class 'bool'> None`
            ]
        },
        {
            content: `<h4>Updating a JSON File</h4>
JSON files can't be edited in place. The pattern is always: <b>load</b> the whole file, <b>change</b> the Python objects, <b>dump</b> everything back.`,
            codeExamples: [
                `import json

with open("settings.json", "w", encoding="utf-8") as f:
    json.dump({"theme": "light", "font_size": 14}, f)

with open("settings.json", encoding="utf-8") as f:     # 1. load
    settings = json.load(f)

settings["theme"] = "dark"                              # 2. change
settings["font_size"] += 2

with open("settings.json", "w", encoding="utf-8") as f:  # 3. dump
    json.dump(settings, f)

with open("settings.json", encoding="utf-8") as f:
    print(f.read())

# OUTPUT:
# {"theme": "dark", "font_size": 16}`
            ]
        },
        {
            content: `<h4>A Load-or-Create Helper</h4>
The first time an app runs there is no settings file yet. Fall back to defaults when the file is missing.`,
            codeExamples: [
                `import json

DEFAULTS = {"theme": "light", "font_size": 14}

def load_settings(path):
    try:
        with open(path, encoding="utf-8") as f:
            return {**DEFAULTS, **json.load(f)}   # saved values override defaults
    except FileNotFoundError:
        return dict(DEFAULTS)

print(load_settings("does_not_exist.json"))

# OUTPUT:
# {'theme': 'light', 'font_size': 14}`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>A Round Trip Is Not Always Lossless</h3>
JSON has fewer types than Python. <b>Tuples become lists</b>, and because JSON object keys must be strings, <b>non-string keys become strings</b>.`,
            codeExamples: [
                `import json

data = {"point": (3, 4), 1: "one", "ok": True}

text = json.dumps(data)
print(text)

back = json.loads(text)
print(back)
print(back == data)

# OUTPUT:
# {"point": [3, 4], "1": "one", "ok": true}
# {'point': [3, 4], '1': 'one', 'ok': True}
# False`
            ]
        },
        {
            content: `<h3>Objects JSON Can't Represent</h3>
Dates, sets, Decimals and your own classes are not JSON types, so <code>dump</code> raises <code>TypeError</code>. Pass a <code>default=</code> function that converts them into something JSON understands.`,
            codeExamples: [
                `import json
from datetime import datetime

json.dumps({"created": datetime(2026, 10, 4)})

# OUTPUT:
# TypeError: Object of type datetime is not JSON serializable`,
                `import json
from datetime import datetime

def encode_extra(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"Cannot serialise {type(obj).__name__}")

record = {"created": datetime(2026, 10, 4, 18, 30), "tags": {"python", "json"}}
text = json.dumps(record, default=encode_extra)
print(text)

back = json.loads(text)
print(datetime.fromisoformat(back["created"]).year)   # convert back yourself

# OUTPUT:
# {"created": "2026-10-04T18:30:00", "tags": ["json", "python"]}
# 2026`
            ]
        },
        {
            content: `<h3>Non-English Text: ensure_ascii=False</h3>
By default <code>json</code> escapes every non-ASCII character as <code>\\uXXXX</code>. That is valid JSON, but unreadable. <code>ensure_ascii=False</code> keeps the real characters - remember <code>encoding="utf-8"</code> when writing the file.`,
            codeExamples: [
                `import json

data = {"price": "₹500", "greeting": "नमस्ते"}

print(json.dumps(data))
print(json.dumps(data, ensure_ascii=False))

with open("hindi.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

# OUTPUT:
# {"price": "\\u20b9500", "greeting": "\\u0928\\u092e\\u0938\\u094d\\u0924\\u0947"}
# {"price": "₹500", "greeting": "नमस्ते"}`
            ]
        },
        {
            content: `<h3>sort_keys and Compact Output</h3>
<code>sort_keys=True</code> makes output stable (useful for diffs and tests). <code>separators=(",", ":")</code> removes spaces for the smallest possible payload.`,
            codeExamples: [
                `import json

data = {"b": 1, "a": [1, 2]}
print(json.dumps(data, sort_keys=True))
print(json.dumps(data, separators=(",", ":")))

# OUTPUT:
# {"a": [1, 2], "b": 1}
# {"b":1,"a":[1,2]}`
            ]
        },
        {
            content: `<h3>JSON Lines for Logs and Big Data</h3>
A single JSON document must be loaded completely. <b>JSON Lines</b> (<code>.jsonl</code>) stores <b>one JSON object per line</b>: you can append new records cheaply and read them back one at a time.`,
            codeExamples: [
                `import json

events = [
    {"user": "asha", "action": "login"},
    {"user": "ravi", "action": "buy", "amount": 499},
]

with open("events.jsonl", "w", encoding="utf-8") as f:
    for event in events:
        f.write(json.dumps(event) + "\\n")

with open("events.jsonl", encoding="utf-8") as f:
    for line in f:                        # one record at a time
        event = json.loads(line)
        print(event["user"], event["action"], event.get("amount", "-"))

# OUTPUT:
# asha login -
# ravi buy 499`
            ]
        },
        {
            content: `<h3>Handling Corrupt Files</h3>
A half-written or hand-edited file raises <code>json.JSONDecodeError</code> (a subclass of <code>ValueError</code>), which tells you exactly where parsing failed. Note that trailing commas are <b>not</b> allowed in JSON.`,
            codeExamples: [
                `import json

with open("broken.json", "w", encoding="utf-8") as f:
    f.write('{"a": 1,}')                  # trailing comma - invalid JSON

try:
    with open("broken.json", encoding="utf-8") as f:
        data = json.load(f)
except json.JSONDecodeError as e:
    print("Corrupt file:", e.msg, "at line", e.lineno, "column", e.colno)
    data = {}

print(data)

# OUTPUT:
# Corrupt file: Expecting property name enclosed in double quotes at line 1 column 9
# {}`
            ]
        },
        {
            content: `<h3>Compared with Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Task</th><th>Java (Jackson)</th><th>Python</th></tr>
<tr class='text-center'><td>Object to JSON text</td><td><code>mapper.writeValueAsString(obj)</code></td><td><code>json.dumps(obj)</code></td></tr>
<tr class='text-center'><td>Write to a file</td><td><code>mapper.writeValue(file, obj)</code></td><td><code>json.dump(obj, f)</code></td></tr>
<tr class='text-center'><td>Read from a file</td><td><code>mapper.readValue(file, Settings.class)</code></td><td><code>json.load(f)</code> - gives dicts/lists</td></tr>
<tr class='text-center'><td>Library needed</td><td>Jackson or Gson (third-party)</td><td>Built in</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>dump vs dumps, load vs loads?</td><td>dump/load work with files; dumps/loads work with strings ("s" for string)</td></tr>
<tr class='text-center'><td>What happens to a tuple in a JSON round trip?</td><td>It comes back as a list</td></tr>
<tr class='text-center'><td>Why does <code>{1: "a"}</code> come back as <code>{"1": "a"}</code>?</td><td>JSON object keys must be strings</td></tr>
<tr class='text-center'><td>How do you serialise a datetime?</td><td>Pass <code>default=</code> a function that returns e.g. <code>obj.isoformat()</code></td></tr>
<tr class='text-center'><td>How do you keep Hindi or ₹ readable in output?</td><td><code>ensure_ascii=False</code> and write the file with UTF-8 encoding</td></tr>
<tr class='text-center'><td>What is JSON Lines?</td><td>One JSON object per line - appendable and streamable, common for logs</td></tr>
</table>`
        }
    ]
};
