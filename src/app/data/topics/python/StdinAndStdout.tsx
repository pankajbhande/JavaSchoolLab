import type { Topic } from '../../types';

export const stdinAndStdout: Topic = {
    id: 'python-basics-sys-stdin-sys-stdout',
    name: 'sys.stdin & sys.stdout',
    beginner: [
        {
            content: `<h4>The Three Standard Streams</h4>
Every program starts with three open streams, available as file-like objects in the <code>sys</code> module:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Stream</th><th>Purpose</th><th>Used by</th><th>Java equivalent</th></tr>
<tr class='text-center'><td><code>sys.stdin</code></td><td>Standard input</td><td><code>input()</code></td><td><code>System.in</code></td></tr>
<tr class='text-center'><td><code>sys.stdout</code></td><td>Standard output</td><td><code>print()</code></td><td><code>System.out</code></td></tr>
<tr class='text-center'><td><code>sys.stderr</code></td><td>Error / diagnostic output</td><td>Tracebacks, warnings</td><td><code>System.err</code></td></tr>
</table>`
        },
        {
            content: `<h4>Writing with sys.stdout</h4>
<code>sys.stdout.write()</code> writes exactly the string you give it - no automatic spaces and no newline. It accepts only strings.`,
            codeExamples: [
                `import sys

sys.stdout.write("Hello")
sys.stdout.write(" World\\n")
sys.stdout.write(str(42) + "\\n")       # convert numbers yourself

sys.stderr.write("Warning: low disk space\\n")

# OUTPUT:
# Hello World
# 42
# Warning: low disk space`
            ]
        },
        {
            content: `<h4>Reading with sys.stdin</h4>
<code>sys.stdin.readline()</code> reads one line <b>including</b> its trailing newline, so strip it. Unlike <code>input()</code> it shows no prompt.`,
            codeExamples: [
                `import sys

print("Enter your city:")
city = sys.stdin.readline().strip()
print("You live in", city)

# OUTPUT:
# Enter your city:
# Pune
# You live in Pune`
            ]
        },
        {
            content: `<h4>Reading Every Line</h4>
<code>sys.stdin</code> can be looped over like a file. This is how command-line tools process piped data.`,
            codeExamples: [
                `# count_words.py
import sys

total = 0
for line in sys.stdin:
    total += len(line.split())
print("Words:", total)

# $ type notes.txt | python count_words.py      (Windows)
# $ cat notes.txt | python count_words.py       (macOS / Linux)
# OUTPUT:
# Words: 128`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Fast Input for Competitive Programming</h3>
<code>input()</code> carries overhead on every call. When reading hundreds of thousands of lines, bind <code>sys.stdin.readline</code> once, or read everything at once with <code>sys.stdin.buffer.read()</code> and split.`,
            codeExamples: [
                `import sys
input = sys.stdin.readline          # common competitive-programming idiom

n = int(input())
nums = list(map(int, input().split()))
print(sum(nums))

# Even faster: read all tokens at once
# data = sys.stdin.buffer.read().split()
# n, nums = int(data[0]), list(map(int, data[1:]))

# Input:
# 5
# 1 2 3 4 5
# OUTPUT:
# 15`
            ]
        },
        {
            content: `<h3>Why stdout and stderr Are Separate</h3>
Shells can redirect them independently. Normal results go to stdout so they can be piped into another program, while errors go to stderr so they still reach the user (or a log) without corrupting the data stream.`,
            codeExamples: [
                `# report.py
import sys

print("id,name")                     # data -> stdout
print("1,Pankaj")
print("skipped 3 bad rows", file=sys.stderr)   # diagnostics -> stderr

# $ python report.py > out.csv          -> out.csv gets only the CSV,
#                                          the warning still shows on screen
# $ python report.py 2> errors.log      -> warning goes to errors.log
# $ python report.py > out.csv 2>&1     -> both into out.csv`
            ]
        },
        {
            content: `<h3>Redirecting Output Inside Python</h3>
<code>contextlib.redirect_stdout</code> temporarily points <code>sys.stdout</code> at another file-like object - useful for capturing output from code you can't change, or in tests.`,
            codeExamples: [
                `import io
from contextlib import redirect_stdout

def noisy():
    print("lots of output")
    return 7

buffer = io.StringIO()
with redirect_stdout(buffer):
    result = noisy()

print("captured:", repr(buffer.getvalue()))
print("result:", result)

# OUTPUT:
# captured: 'lots of output\\n'
# result: 7`
            ]
        },
        {
            content: `<h3>Text Layer vs Binary Layer, and Encoding</h3>
<code>sys.stdout</code> is a text stream that encodes <code>str</code> to bytes; <code>sys.stdout.buffer</code> is the underlying binary stream. If printing non-ASCII text fails with <code>UnicodeEncodeError</code> on an older Windows console or when output is redirected, reconfigure the encoding or set the environment variable <code>PYTHONIOENCODING=utf-8</code>.`,
            codeExamples: [
                `import sys

print(sys.stdout.encoding)
sys.stdout.reconfigure(encoding="utf-8")      # Python 3.7+
print("₹ नमस्ते")

sys.stdout.buffer.write(b"raw bytes\\n")
sys.stdout.flush()
print(sys.stdin.isatty())      # False when input is piped in

# OUTPUT (typical):
# utf-8
# ₹ नमस्ते
# raw bytes
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>print() vs sys.stdout.write()?</td><td>print converts values to str, adds separators and a newline; write takes one string and outputs it exactly, returning the number of characters written</td></tr>
<tr class='text-center'><td>input() vs sys.stdin.readline()?</td><td>input shows a prompt and strips the newline; readline keeps the newline and is faster for bulk input</td></tr>
<tr class='text-center'><td>Why write errors to stderr?</td><td>So they are not mixed into data that is redirected or piped from stdout</td></tr>
<tr class='text-center'><td>How do you capture printed output in Python?</td><td><code>contextlib.redirect_stdout</code> with an <code>io.StringIO</code>, or the <code>capsys</code> fixture in pytest</td></tr>
<tr class='text-center'><td>How do you detect piped input?</td><td><code>sys.stdin.isatty()</code> is False when input does not come from a terminal</td></tr>
</table>`
        }
    ]
};
