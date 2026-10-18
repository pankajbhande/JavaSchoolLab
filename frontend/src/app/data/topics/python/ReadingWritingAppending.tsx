import type { Topic } from '../../types';

export const readingWritingAppending: Topic = {
    id: 'python-file-handling-reading-writing-appending',
    name: 'Reading, Writing & Appending',
    beginner: [
        {
            content: `<h4>Writing Text</h4>
<code>write(text)</code> writes a string and returns the number of characters written. It does <b>not</b> add a newline - include <code>\\n</code> yourself. Opening with <code>"w"</code> creates the file or erases an existing one.`,
            codeExamples: [
                `with open("students.txt", "w", encoding="utf-8") as f:
    count = f.write("Abaji\\n")
    f.write("Raoji\\n")
    f.write("Kanhoji\\n")

print(count)

with open("students.txt", encoding="utf-8") as f:
    print(f.read())

# OUTPUT:
# 6
# Abaji
# Raoji
# Kanhoji
#`
            ]
        },
        {
            content: `<h4>Three Ways to Read</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Returns</th></tr>
<tr class='text-center'><td><code>read()</code></td><td>The whole file as one string</td></tr>
<tr class='text-center'><td><code>readline()</code></td><td>The next line, including its <code>\\n</code>; <code>""</code> at the end of the file</td></tr>
<tr class='text-center'><td><code>readlines()</code></td><td>A list of all lines, each with its <code>\\n</code></td></tr>
</table>`,
            codeExamples: [
                `with open("students.txt", "w", encoding="utf-8") as f:
    f.write("Abaji\\nRaoji\\nKanhoji\\n")

with open("students.txt", encoding="utf-8") as f:
    print(repr(f.read()))

with open("students.txt", encoding="utf-8") as f:
    print(repr(f.readline()))
    print(repr(f.readline()))

with open("students.txt", encoding="utf-8") as f:
    print(f.readlines())

# OUTPUT:
# 'Abaji\\nRaoji\\nKanhoji\\n'
# 'Abaji\\n'
# 'Raoji\\n'
# ['Abaji\\n', 'Raoji\\n', 'Kanhoji\\n']`
            ]
        },
        {
            content: `<h4>Looping Over Lines - the Best Way</h4>
A file object is iterable: <code>for line in f</code> reads <b>one line at a time</b>, so it works even for files larger than your memory. Each line still ends with <code>\\n</code>; remove it with <code>rstrip("\\n")</code> (or <code>strip()</code> to also remove spaces).`,
            codeExamples: [
                `with open("marks.txt", "w", encoding="utf-8") as f:
    f.write("Abaji,91\\nRaoji,78\\nKanhoji,85\\n")

total = 0
with open("marks.txt", encoding="utf-8") as f:
    for line in f:
        name, mark = line.rstrip("\\n").split(",")
        total += int(mark)
        print(f"{name:<8}{mark}")
print("Total:", total)

# OUTPUT:
# Abaji   91
# Raoji   78
# Kanhoji 85
# Total: 254`
            ]
        },
        {
            content: `<h4>Appending</h4>
Mode <code>"a"</code> keeps the existing content and adds new text at the end - ideal for logs. Mode <code>"w"</code> would wipe the file first.`,
            codeExamples: [
                `with open("log.txt", "w", encoding="utf-8") as f:
    f.write("started\\n")

with open("log.txt", "a", encoding="utf-8") as f:
    f.write("user logged in\\n")

with open("log.txt", "a", encoding="utf-8") as f:
    f.write("user logged out\\n")

with open("log.txt", encoding="utf-8") as f:
    print(f.read(), end="")

with open("log.txt", "w", encoding="utf-8") as f:   # "w" truncates
    f.write("fresh start\\n")

with open("log.txt", encoding="utf-8") as f:
    print(f.read(), end="")

# OUTPUT:
# started
# user logged in
# user logged out
# fresh start`
            ]
        },
        {
            content: `<h4>writelines() and print(file=...)</h4>
<code>writelines()</code> writes every string from a list (or any iterable) - again <b>without</b> adding newlines. <code>print(..., file=f)</code> writes like print does, with spaces and a newline.`,
            codeExamples: [
                `items = ["pen", "book", "bag"]

with open("items.txt", "w", encoding="utf-8") as f:
    f.writelines(items)                          # no separators!
    f.write("\\n")
    f.writelines(item + "\\n" for item in items)   # add them yourself
    print("total", len(items), "items", file=f)

with open("items.txt", encoding="utf-8") as f:
    print(f.read(), end="")

# OUTPUT:
# penbookbag
# pen
# book
# bag
# total 3 items`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Reading Huge Files in Chunks</h3>
<code>read()</code> loads the whole file into memory. For very large files (or files without line breaks), read a fixed number of characters (or bytes in binary mode) at a time. <code>read()</code> returns an empty string at the end, which ends the walrus loop.`,
            codeExamples: [
                `with open("big.txt", "w", encoding="utf-8") as f:
    f.write("abcdefghij")

with open("big.txt", encoding="utf-8") as f:
    while chunk := f.read(4):
        print(repr(chunk))

# OUTPUT:
# 'abcd'
# 'efgh'
# 'ij'`
            ]
        },
        {
            content: `<h3>seek() and tell()</h3>
<code>tell()</code> returns the current position and <code>seek(pos)</code> moves to it. In <b>binary</b> mode the position is a byte offset. In <b>text</b> mode it is an opaque number - only seek to 0 or to a value previously returned by <code>tell()</code>, because multi-byte characters and newline translation make "character position" ambiguous.`,
            codeExamples: [
                `with open("letters.txt", "w", encoding="utf-8") as f:
    f.write("ABCDEFGHIJ")

with open("letters.txt", "rb") as f:
    f.seek(3)
    print(f.read(4), f.tell())
    f.seek(0)                  # back to the start
    print(f.read(2))

# OUTPUT:
# b'DEFG' 7
# b'AB'`
            ]
        },
        {
            content: `<h3>Counting Lines, Words and Characters</h3>
A small <code>wc</code> clone that streams the file line by line.`,
            codeExamples: [
                `with open("poem.txt", "w", encoding="utf-8") as f:
    f.write("Twinkle twinkle little star\\nHow I wonder\\nwhat you are\\n")

lines = words = chars = 0
with open("poem.txt", encoding="utf-8") as f:
    for line in f:
        lines += 1
        words += len(line.split())
        chars += len(line)
print(lines, words, chars)

# OUTPUT:
# 3 10 54`
            ]
        },
        {
            content: `<h3>Filtering a Log File</h3>
Reading one file and writing the interesting lines to another - streamed, so the log can be any size.`,
            codeExamples: [
                `with open("app.log", "w", encoding="utf-8") as f:
    f.write("INFO start\\nERROR disk full\\nINFO retry\\nERROR timeout\\n")

with open("app.log", encoding="utf-8") as src, \\
     open("errors.log", "w", encoding="utf-8") as dst:
    for line_no, line in enumerate(src, start=1):
        if "ERROR" in line:
            dst.write(f"{line_no}: {line}")

with open("errors.log", encoding="utf-8") as f:
    print(f.read(), end="")

# OUTPUT:
# 2: ERROR disk full
# 4: ERROR timeout`
            ]
        },
        {
            content: `<h3>Writing Atomically</h3>
If a program crashes halfway through <code>open("data.txt", "w")</code>, the file is left truncated or half-written. The safe pattern: write a temporary file in the same folder, then <code>os.replace()</code> it over the original - a rename that is atomic on the same file system, so readers see either the old file or the new one, never a broken one.`,
            codeExamples: [
                `import os
import tempfile

def write_atomic(path, text):
    folder = os.path.dirname(os.path.abspath(path))
    fd, tmp_path = tempfile.mkstemp(dir=folder)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as tmp:
            tmp.write(text)
        os.replace(tmp_path, path)          # atomic swap
    except BaseException:
        os.remove(tmp_path)
        raise

write_atomic("settings.txt", "theme=dark\\n")
with open("settings.txt", encoding="utf-8") as f:
    print(f.read(), end="")

# OUTPUT:
# theme=dark`
            ]
        },
        {
            content: `<h3>r+ Mode Pitfalls</h3>
<code>"r+"</code> opens for reading and writing <b>without</b> erasing. Writes <b>overwrite</b> characters at the current position rather than inserting, and after a <code>read()</code> the position is at the end, so the next write appends. To change the middle of a text file, it is usually simpler to read it, modify the string, and write it back.`,
            codeExamples: [
                `with open("greet.txt", "w", encoding="utf-8") as f:
    f.write("Hello World")

with open("greet.txt", "r+", encoding="utf-8") as f:
    f.write("Jello")                 # overwrites the first 5 characters
with open("greet.txt", encoding="utf-8") as f:
    print(f.read())

with open("greet.txt", "r+", encoding="utf-8") as f:
    f.read()                         # now at the end
    f.write("!")                     # so this appends
with open("greet.txt", encoding="utf-8") as f:
    print(f.read())

# OUTPUT:
# Jello World
# Jello World!`
            ]
        },
        {
            content: `<h3>Shortcuts and the Java Equivalents</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Task</th><th>Python</th><th>Java</th></tr>
<tr class='text-center'><td>Whole file as text</td><td><code>Path(p).read_text(encoding="utf-8")</code></td><td><code>Files.readString(path)</code></td></tr>
<tr class='text-center'><td>All lines</td><td><code>f.read().splitlines()</code></td><td><code>Files.readAllLines(path)</code></td></tr>
<tr class='text-center'><td>Line by line</td><td><code>for line in f:</code></td><td><code>BufferedReader.readLine()</code> in a loop</td></tr>
<tr class='text-center'><td>Write text</td><td><code>Path(p).write_text(s, encoding="utf-8")</code></td><td><code>Files.writeString(path, s)</code></td></tr>
<tr class='text-center'><td>Append</td><td><code>open(p, "a")</code></td><td><code>StandardOpenOption.APPEND</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>read() vs readline() vs readlines()?</td><td>Whole file as a string; the next line; a list of all lines</td></tr>
<tr class='text-center'><td>How do you read a huge file efficiently?</td><td>Iterate over the file object line by line, or read fixed-size chunks</td></tr>
<tr class='text-center'><td>Does write() add a newline?</td><td>No - and neither does writelines(); print(..., file=f) does</td></tr>
<tr class='text-center'><td>What does readline() return at the end of the file?</td><td>An empty string ""</td></tr>
<tr class='text-center'><td>"w" vs "a"?</td><td>"w" truncates the file first; "a" adds to the end</td></tr>
<tr class='text-center'><td>How do you avoid a half-written file after a crash?</td><td>Write to a temporary file, then os.replace() it over the original</td></tr>
</table>`
        }
    ]
};
