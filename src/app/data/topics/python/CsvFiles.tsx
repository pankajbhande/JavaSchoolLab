import type { Topic } from '../../types';

export const csvFiles: Topic = {
    id: 'python-file-handling-csv-files',
    name: 'CSV Files',
    beginner: [
        {
            content: `<h4>What is a CSV File?</h4>
<b>CSV</b> (Comma-Separated Values) is a plain-text table: one line per row, values separated by commas, usually with a header row first. Excel, Google Sheets, databases and almost every tool can import and export it.<br><br>
Python's built-in <code>csv</code> module reads and writes CSV correctly - including the tricky cases such as values that themselves contain commas or quotes.<br><br>
<b>Rule:</b> always open CSV files with <code>newline=""</code> (the csv module handles line endings itself) and <code>encoding="utf-8"</code>.`
        },
        {
            content: `<h4>Writing with csv.writer</h4>
<code>writerow()</code> writes one row (a list of values); <code>writerows()</code> writes many. Numbers are converted to text automatically.`,
            codeExamples: [
                `import csv

rows = [
    ["name", "city", "marks"],
    ["Abaji", "Pune", 91],
    ["Raoji", "Latur", 78],
]

with open("students.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

with open("students.csv", encoding="utf-8") as f:
    print(f.read(), end="")

# OUTPUT:
# name,city,marks
# Abaji,Pune,91
# Raoji,Latur,78`
            ]
        },
        {
            content: `<h4>Reading with csv.reader</h4>
Each row comes back as a <b>list of strings</b> - even numbers. Convert them yourself before doing arithmetic.`,
            codeExamples: [
                `import csv

with open("students.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows([["name", "city", "marks"], ["Abaji", "Pune", 91], ["Raoji", "Latur", 78]])

with open("students.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)                # first row = column names
    print(header)
    for row in reader:
        print(row, "-> marks + 5 =", int(row[2]) + 5)

# OUTPUT:
# ['name', 'city', 'marks']
# ['Abaji', 'Pune', '91'] -> marks + 5 = 96
# ['Raoji', 'Latur', '78'] -> marks + 5 = 83`
            ]
        },
        {
            content: `<h4>DictWriter and DictReader</h4>
Working with column <b>names</b> instead of positions is clearer and survives column reordering. <code>DictReader</code> uses the header row as keys automatically.`,
            codeExamples: [
                `import csv

students = [
    {"name": "Abaji", "marks": 91},
    {"name": "Raoji", "marks": 78},
]

with open("marks.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "marks"])
    writer.writeheader()
    writer.writerows(students)

with open("marks.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["marks"]), row)

# OUTPUT:
# Abaji 91 {'name': 'Abaji', 'marks': '91'}
# Raoji 78 {'name': 'Raoji', 'marks': '78'}`
            ]
        },
        {
            content: `<h4>Why Not Just split(",")?</h4>
A value containing a comma is wrapped in quotes in a real CSV file. <code>split(",")</code> breaks it apart; the <code>csv</code> module understands the quoting.`,
            codeExamples: [
                `import csv

with open("address.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerow(["Abaji", "Pune, MH", 91])

with open("address.csv", encoding="utf-8") as f:
    line = f.read().strip()
print(line)
print(line.split(","))                   # wrong: 4 pieces

with open("address.csv", newline="", encoding="utf-8") as f:
    print(next(csv.reader(f)))           # right: 3 values

# OUTPUT:
# Abaji,"Pune, MH",91
# ['Abaji', '"Pune', ' MH"', '91']
# ['Abaji', 'Pune, MH', '91']`
            ]
        },
        {
            content: `<h4>A Small Report: Total Marks per Student</h4>`,
            codeExamples: [
                `import csv

data = """name,subject,marks
Abaji,Maths,91
Raoji,Maths,78
Abaji,Physics,85
Raoji,Physics,66
"""
with open("results.csv", "w", newline="", encoding="utf-8") as f:
    f.write(data)

totals = {}
with open("results.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        totals[row["name"]] = totals.get(row["name"], 0) + int(row["marks"])

for name, total in totals.items():
    print(f"{name:<6}{total:>4}")

# OUTPUT:
# Abaji  176
# Raoji  144`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Delimiters and Quoting Options</h3>
• <code>delimiter="\\t"</code> reads and writes tab-separated files (TSV); <code>";"</code> is common in European Excel exports.<br>
• <code>quoting=csv.QUOTE_ALL</code> quotes every field; <code>csv.QUOTE_NONNUMERIC</code> quotes text fields only - and when used for <b>reading</b>, converts every unquoted field to <code>float</code>.`,
            codeExamples: [
                `import csv

with open("data.tsv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, delimiter="\\t")
    writer.writerow(["name", "city"])
    writer.writerow(["Abaji", "Pune, MH"])     # comma is not special in a TSV

with open("data.tsv", newline="", encoding="utf-8") as f:
    for row in csv.reader(f, delimiter="\\t"):
        print(row)

# OUTPUT:
# ['name', 'city']
# ['Abaji', 'Pune, MH']`,
                `import csv

with open("q.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f, quoting=csv.QUOTE_NONNUMERIC).writerow(["Abaji", 91, 8.5])

with open("q.csv", encoding="utf-8") as f:
    print(f.read(), end="")

with open("q.csv", newline="", encoding="utf-8") as f:
    print(next(csv.reader(f, quoting=csv.QUOTE_NONNUMERIC)))

# OUTPUT:
# "Abaji",91,8.5
# ['Abaji', 91.0, 8.5]`
            ]
        },
        {
            content: `<h3>Surviving Bad Rows</h3>
Real files contain blanks and typos. Convert each row inside <code>try/except</code>, report the problem with a line number, and keep going instead of crashing on row 40,000.`,
            codeExamples: [
                `import csv

data = """name,marks
Abaji,91
Raoji,
Kanhoji,abc
Moropant,85
"""
with open("raw.csv", "w", newline="", encoding="utf-8") as f:
    f.write(data)

total = 0
with open("raw.csv", newline="", encoding="utf-8") as f:
    for line_no, row in enumerate(csv.DictReader(f), start=2):   # line 1 is the header
        try:
            total += int(row["marks"])
        except ValueError:
            print(f"line {line_no}: skipping bad marks {row['marks']!r}")

print("total:", total)

# OUTPUT:
# line 3: skipping bad marks ''
# line 4: skipping bad marks 'abc'
# total: 176`
            ]
        },
        {
            content: `<h3>Excel and the BOM: utf-8-sig</h3>
Excel saves "CSV UTF-8" files with an invisible <b>byte order mark</b> (BOM) at the start. Read with plain <code>utf-8</code> and the BOM sticks to the first header, so <code>row["name"]</code> mysteriously fails. The <code>utf-8-sig</code> encoding strips it when reading - and adds it when writing, so Excel shows non-English text correctly.`,
            codeExamples: [
                `import csv

with open("excel.csv", "w", newline="", encoding="utf-8-sig") as f:
    csv.writer(f).writerow(["name", "marks"])

with open("excel.csv", newline="", encoding="utf-8") as f:
    print(next(csv.reader(f)))

with open("excel.csv", newline="", encoding="utf-8-sig") as f:
    print(next(csv.reader(f)))

# OUTPUT:
# ['\\ufeffname', 'marks']
# ['name', 'marks']`
            ]
        },
        {
            content: `<h3>Large Files and Appending</h3>
<code>csv.reader</code> reads <b>one row at a time</b>, so a multi-gigabyte file is processed with constant memory - as long as you don't call <code>list()</code> on the reader. To add rows to an existing file, open it in append mode <code>"a"</code>.`,
            codeExamples: [
                `import csv

with open("log.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerow(["time", "event"])

for time, event in [("10:00", "login"), ("10:05", "logout")]:
    with open("log.csv", "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([time, event])

with open("log.csv", newline="", encoding="utf-8") as f:
    row_count = sum(1 for _ in csv.reader(f))   # streams - never loads the whole file
print(row_count)

# OUTPUT:
# 3`
            ]
        },
        {
            content: `<h3>For Analysis, Reach for pandas</h3>
The <code>csv</code> module is ideal for streaming and simple transformations. For grouping, filtering and statistics, the third-party <b>pandas</b> library loads a CSV into a DataFrame in one line (covered in the Data Science module).`,
            codeExamples: [
                `import pandas as pd

df = pd.read_csv("results.csv")          # the file from the report example
print(df.groupby("name")["marks"].sum())

# OUTPUT:
# name
# Abaji    176
# Raoji    144
# Name: marks, dtype: int64`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why open CSV files with <code>newline=""</code>?</td><td>The csv module handles line endings itself; without it, extra blank lines appear on Windows and quoted newlines can be misread</td></tr>
<tr class='text-center'><td>What type are values from csv.reader?</td><td>Always strings - convert numbers with int() or float()</td></tr>
<tr class='text-center'><td>reader vs DictReader?</td><td>reader gives each row as a list; DictReader gives a dict keyed by the header row</td></tr>
<tr class='text-center'><td>Why not parse CSV with split(",")?</td><td>Quoted fields can contain commas, quotes and newlines; the csv module handles the quoting rules</td></tr>
<tr class='text-center'><td>How do you read a CSV saved by Excel?</td><td>Use <code>encoding="utf-8-sig"</code> to strip the byte order mark</td></tr>
<tr class='text-center'><td>How do you process a huge CSV?</td><td>Iterate the reader row by row (streaming) instead of loading everything into a list</td></tr>
</table>`
        }
    ]
};
