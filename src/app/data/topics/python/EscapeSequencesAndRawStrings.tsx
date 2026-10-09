import type { Topic } from '../../types';

export const escapeSequencesAndRawStrings: Topic = {
    id: 'python-basics-escape-sequences-raw-strings',
    name: 'Escape Sequences & Raw Strings',
    beginner: [
        {
            content: `<h4>What is an Escape Sequence?</h4>
Some characters can't be typed directly inside a string - a newline, a tab, or a quote that matches the string's own quotes. An <b>escape sequence</b> is a backslash <code>\\</code> followed by a character that stands for one of these special characters.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Escape</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>\\n</code></td><td>Newline</td></tr>
<tr class='text-center'><td><code>\\t</code></td><td>Tab</td></tr>
<tr class='text-center'><td><code>\\\\</code></td><td>A literal backslash</td></tr>
<tr class='text-center'><td><code>\\'</code></td><td>Single quote</td></tr>
<tr class='text-center'><td><code>\\"</code></td><td>Double quote</td></tr>
<tr class='text-center'><td><code>\\r</code></td><td>Carriage return</td></tr>
<tr class='text-center'><td><code>\\uXXXX</code></td><td>Unicode character by hex code, e.g. <code>\\u20B9</code> = ₹</td></tr>
</table>`
        },
        {
            content: `<h4>Using Escapes</h4>`,
            codeExamples: [
                `print("Line 1\\nLine 2")
print("Name:\\tPankaj")
print("He said \\"Hello\\"")
print("Path: C:\\\\Users\\\\Sheru")
print("Price: \\u20B9500")

# OUTPUT:
# Line 1
# Line 2
# Name:	Pankaj
# He said "Hello"
# Path: C:\\Users\\Sheru
# Price: ₹500`
            ]
        },
        {
            content: `<h4>Raw Strings</h4>
Prefix a string with <code>r</code> and backslashes are kept exactly as typed - escape sequences are <b>not</b> processed. Raw strings are ideal for Windows paths and regular expressions, where backslashes are common.`,
            codeExamples: [
                `normal = "C:\\new\\table"
raw = r"C:\\new\\table"

print(normal)        # \\n became a newline, \\t became a tab!
print(raw)

# OUTPUT:
# C:
# ew	able
# C:\\new\\table`
            ]
        },
        {
            content: `<h4>Raw Strings in Regular Expressions</h4>
Regex patterns are full of backslashes (<code>\\d</code> for a digit, <code>\\b</code> for a word boundary). Without <code>r</code>, Python would interpret them first - <code>"\\b"</code> is the backspace character, not a word boundary.`,
            codeExamples: [
                `import re

text = "Order 42 shipped on 2024-10-04"
print(re.findall(r"\\d+", text))
print(re.findall(r"\\bon\\b", text))

# OUTPUT:
# ['42', '2024', '10', '04']
# ['on']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>A Raw String Cannot End with a Single Backslash</h3>
Even in a raw string, a backslash still prevents the following quote from ending the string. So <code>r"C:\\"</code> is a syntax error. Workarounds: double it and accept two backslashes, concatenate a normal string, or - best - use <code>pathlib</code>.`,
            codeExamples: [
                `# folder = r"C:\\Users\\"        # SyntaxError: unterminated string literal

folder = r"C:\\Users" + "\\\\"
print(folder)

from pathlib import Path
print(Path("C:/Users") / "Sheru" / "notes.txt")   # forward slashes work on Windows too

# OUTPUT (on Windows):
# C:\\Users\\
# C:\\Users\\Sheru\\notes.txt`
            ]
        },
        {
            content: `<h3>Invalid Escape Sequences</h3>
A backslash followed by a character that isn't a recognised escape (like <code>\\d</code> or <code>\\p</code>) is kept as-is in a normal string - but this is deprecated. Python 3.12+ emits a <code>SyntaxWarning</code>, and a future version will make it an error. Always use raw strings for regex and paths.`,
            codeExamples: [
                `pattern = "\\d+"         # Python 3.12+: SyntaxWarning: invalid escape sequence '\\d'
pattern = r"\\d+"        # correct

# OUTPUT:
# SyntaxWarning: invalid escape sequence '\\d'`
            ]
        },
        {
            content: `<h3>Numeric and Named Escapes</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Escape</th><th>Meaning</th><th>Example</th></tr>
<tr class='text-center'><td><code>\\xhh</code></td><td>Character with 2-digit hex value</td><td><code>"\\x41"</code> = A</td></tr>
<tr class='text-center'><td><code>\\ooo</code></td><td>Character with octal value</td><td><code>"\\101"</code> = A</td></tr>
<tr class='text-center'><td><code>\\uXXXX</code></td><td>4-hex-digit Unicode code point</td><td><code>"\\u00e9"</code> = é</td></tr>
<tr class='text-center'><td><code>\\UXXXXXXXX</code></td><td>8-hex-digit Unicode code point</td><td><code>"\\U0001F600"</code> = 😀</td></tr>
<tr class='text-center'><td><code>\\N{name}</code></td><td>Unicode character by name</td><td><code>"\\N{RUPEE SIGN}"</code> = ₹</td></tr>
<tr class='text-center'><td><code>\\0</code></td><td>Null character</td><td></td></tr>
</table>`,
            codeExamples: [
                `print("\\x41\\x42\\x43", "\\N{GREEK SMALL LETTER PI}", "\\U0001F600")
print(len("\\n"), len(r"\\n"))

# OUTPUT:
# ABC π 😀
# 1 2`
            ]
        },
        {
            content: `<h3>repr() Shows Escapes, print() Renders Them</h3>
When debugging strings that contain invisible characters (trailing <code>\\r</code>, tabs), print the <code>repr()</code> to see exactly what is there.`,
            codeExamples: [
                `line = "pankaj\\t28\\r\\n"
print(line)
print(repr(line))

# OUTPUT:
# pankaj	28
#
# 'pankaj\\t28\\r\\n'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a raw string?</td><td>A string prefixed with r in which backslashes are not treated as escape characters</td></tr>
<tr class='text-center'><td>Why use raw strings for regex?</td><td>Regex uses many backslashes; without r Python would interpret sequences like \\b (backspace) before the regex engine sees them</td></tr>
<tr class='text-center'><td>Can a raw string end with a backslash?</td><td>Not a single one - <code>r"abc\\"</code> is a SyntaxError</td></tr>
<tr class='text-center'><td>What is <code>len("\\n")</code> vs <code>len(r"\\n")</code>?</td><td>1 vs 2</td></tr>
<tr class='text-center'><td>How do you see hidden characters in a string?</td><td>Print its <code>repr()</code></td></tr>
</table>`
        }
    ]
};
