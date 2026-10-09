import type { Topic } from '../../types';

export const openingFiles: Topic = {
    id: 'python-file-handling-opening-files',
    name: 'Opening Files',
    beginner: [
        {
            content: `<h4>The open() Function</h4>
Every file operation starts with <code>open()</code>, which returns a <b>file object</b> you read from or write to:<br><br>
<code>open(path, mode="r", encoding=None)</code><br><br>
• <code>path</code> - the file name or path.<br>
• <code>mode</code> - what you want to do (read, write, append...).<br>
• <code>encoding</code> - how text is turned into bytes. <b>Always pass <code>encoding="utf-8"</code> for text files</b>; otherwise Python uses the operating system's default, which differs between Windows and Linux.<br><br>
In Java this is roughly <code>new FileReader(...)</code> / <code>Files.newBufferedReader(...)</code>.`,
            codeExamples: [
                `f = open("notes.txt", "w", encoding="utf-8")   # create / overwrite
f.write("Hello, files!")
f.close()                                        # always close when done

f = open("notes.txt", "r", encoding="utf-8")   # "r" is the default mode
print(f.read())
f.close()

# OUTPUT:
# Hello, files!`
            ]
        },
        {
            content: `<h4>File Modes</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Mode</th><th>Meaning</th><th>If the file exists</th><th>If it doesn't exist</th></tr>
<tr class='text-center'><td><code>"r"</code></td><td>Read (default)</td><td>Opens it</td><td>FileNotFoundError</td></tr>
<tr class='text-center'><td><code>"w"</code></td><td>Write</td><td><b>Erases</b> its contents</td><td>Creates it</td></tr>
<tr class='text-center'><td><code>"a"</code></td><td>Append - writes go to the end</td><td>Keeps contents</td><td>Creates it</td></tr>
<tr class='text-center'><td><code>"x"</code></td><td>Exclusive create</td><td>FileExistsError</td><td>Creates it</td></tr>
<tr class='text-center'><td><code>"r+"</code></td><td>Read and write</td><td>Opens it, no erase</td><td>FileNotFoundError</td></tr>
<tr class='text-center'><td><code>"w+"</code></td><td>Write and read</td><td><b>Erases</b> it</td><td>Creates it</td></tr>
<tr class='text-center'><td><code>"a+"</code></td><td>Append and read</td><td>Keeps contents</td><td>Creates it</td></tr>
</table>
Add <code>b</code> for <b>binary</b> mode (<code>"rb"</code>, <code>"wb"</code>) to work with raw bytes, or <code>t</code> for text mode, which is the default (<code>"r"</code> is the same as <code>"rt"</code>).`
        },
        {
            content: `<h4>Relative and Absolute Paths</h4>
A <b>relative</b> path like <code>"notes.txt"</code> is looked up in the <b>current working directory</b> - the folder you ran Python from, which is not necessarily the folder your script is in. An <b>absolute</b> path starts from the drive or root.`,
            codeExamples: [
                `import os

print(os.getcwd())                         # where relative paths start
print(os.path.abspath("notes.txt"))        # the full path Python will use

# OUTPUT (e.g. - depends on your machine):
# D:\\projects\\python-course
# D:\\projects\\python-course\\notes.txt`
            ]
        },
        {
            content: `<h4>Windows Paths</h4>
Backslashes in normal strings start escape sequences: <code>"\\n"</code> is a newline and <code>"\\t"</code> a tab. Use a <b>raw string</b>, double the backslashes, or simply use forward slashes, which Windows also accepts.`,
            codeExamples: [
                `bad = "C:\\new\\table.txt"         # \\n and \\t are escapes!
print(len(bad))

good1 = r"C:\\new\\table.txt"        # raw string
good2 = "C:\\\\new\\\\table.txt"      # escaped backslashes
good3 = "C:/new/table.txt"         # forward slashes work on Windows too
print(good1 == good2, len(good1))

# OUTPUT:
# 14
# True 16`
            ]
        },
        {
            content: `<h4>Errors When Opening</h4>`,
            codeExamples: [
                `open("missing.txt", encoding="utf-8")

# OUTPUT:
# FileNotFoundError: [Errno 2] No such file or directory: 'missing.txt'`,
                `with open("report.txt", "w", encoding="utf-8") as f:
    f.write("v1")

open("report.txt", "x", encoding="utf-8")      # "x" refuses to overwrite

# OUTPUT:
# FileExistsError: [Errno 17] File exists: 'report.txt'`,
                `open(".")                 # a folder, not a file

# OUTPUT:
# Linux / macOS: IsADirectoryError: [Errno 21] Is a directory: '.'
# Windows:       PermissionError: [Errno 13] Permission denied: '.'`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What a File Object Really Is</h3>
In text mode, <code>open()</code> returns an <code>io.TextIOWrapper</code>: a layer that decodes bytes to <code>str</code>, sitting on top of a <b>buffered binary stream</b>, which sits on top of the raw operating-system file. Binary mode skips the text layer.`,
            codeExamples: [
                `f = open("notes.txt", "w", encoding="utf-8")
print(type(f))
print(f.name, f.mode, f.encoding, f.closed)
print(type(f.buffer))              # the binary layer underneath
f.close()
print(f.closed)

g = open("notes.txt", "rb")
print(type(g))
g.close()

# OUTPUT:
# <class '_io.TextIOWrapper'>
# notes.txt w utf-8 False
# <class '_io.BufferedWriter'>
# True
# <class '_io.BufferedReader'>`
            ]
        },
        {
            content: `<h3>Buffering and flush()</h3>
Writes go into an in-memory buffer first and reach the disk in larger blocks, which is much faster. Until the buffer is flushed (by <code>flush()</code>, <code>close()</code> or the buffer filling up), other readers may not see the data - and if the program crashes, it is lost.`,
            codeExamples: [
                `f = open("buf.txt", "w", encoding="utf-8")
f.write("data")

with open("buf.txt", encoding="utf-8") as reader:
    print(repr(reader.read()))      # still in f's buffer

f.flush()                            # push it to the OS
with open("buf.txt", encoding="utf-8") as reader:
    print(repr(reader.read()))
f.close()

# OUTPUT:
# ''
# 'data'`
            ]
        },
        {
            content: `<h3>The newline Parameter</h3>
In text mode Python uses <b>universal newlines</b>: when reading, <code>\\r\\n</code> (Windows) and <code>\\r</code> are converted to <code>\\n</code>; when writing, <code>\\n</code> is converted to the platform's line ending. <code>newline=""</code> turns translation off - required by the <code>csv</code> module - and <code>newline="\\n"</code> forces Unix endings on every platform.`,
            codeExamples: [
                `with open("unix.txt", "w", encoding="utf-8", newline="\\n") as f:
    f.write("a\\nb\\n")

with open("unix.txt", "rb") as f:
    print(f.read())                  # exactly what is on disk

# OUTPUT:
# b'a\\nb\\n'`
            ]
        },
        {
            content: `<h3>Opening Files Next to Your Script</h3>
Relative paths depend on where Python was started, so a script that works from its own folder can fail when run from elsewhere (an IDE, a scheduler, another directory). Build paths from the script's location instead.`,
            codeExamples: [
                `from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent     # folder containing this script
config_path = BASE_DIR / "config.txt"

config_path.write_text("debug=true", encoding="utf-8")
print(config_path.name, config_path.read_text(encoding="utf-8"))

# OUTPUT:
# config.txt debug=true`
            ]
        },
        {
            content: `<h3>Why Closing Matters</h3>
• Each open file uses an operating-system <b>file handle</b>, and processes have a limit (often 1024 on Linux). Leaking handles in a loop eventually raises <code>OSError: [Errno 24] Too many open files</code>.<br>
• Unflushed writes may be lost.<br>
• On Windows, an open file usually can't be deleted or renamed by other programs.<br><br>
CPython often closes files when the object is garbage-collected, but that is an implementation detail - always close explicitly, ideally with the <code>with</code> statement (next topics).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>"w" vs "a" vs "x"?</td><td>"w" erases or creates; "a" keeps content and writes at the end; "x" creates only if the file doesn't exist</td></tr>
<tr class='text-center'><td>Why pass encoding="utf-8"?</td><td>The default encoding depends on the platform (e.g. cp1252 on many Windows systems), so files may be read differently elsewhere</td></tr>
<tr class='text-center'><td>What does open() return in text mode?</td><td>An io.TextIOWrapper wrapping a buffered binary stream</td></tr>
<tr class='text-center'><td>What is a relative path relative to?</td><td>The current working directory (<code>os.getcwd()</code>), not the script's folder</td></tr>
<tr class='text-center'><td>How do you write a Windows path safely?</td><td>A raw string <code>r"C:\\data\\f.txt"</code>, doubled backslashes, forward slashes, or pathlib</td></tr>
<tr class='text-center'><td>Why must files be closed?</td><td>To flush buffered data and free the OS file handle</td></tr>
</table>`
        }
    ]
};
