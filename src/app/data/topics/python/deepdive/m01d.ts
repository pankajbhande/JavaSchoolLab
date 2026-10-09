// Module 1 (Python Fundamentals), part D: string methods, formatting, Unicode and console I/O.
import { dd, r, type DeepDive } from './deepDive';

export const m01d: Record<string, DeepDive> = {
    'String Methods': dd(
        [`Strings come with dozens of built-in methods for cleaning, searching, splitting and joining text. Every method returns a <b>new</b> string (or list) because strings are immutable.`,
            r`s = "  Hello, World  "
print(repr(s.strip()))
print(s.strip().lower())
print(repr(s.replace("World", "Python")))
print("a,b,c".split(","))
print("-".join(["a", "b", "c"]))

# OUTPUT:
# 'Hello, World'
# hello, world
# '  Hello, Python  '
# ['a', 'b', 'c']
# a-b-c`],
        [`Text processing (validation, search, reporting) is mostly these methods; writing them by hand would take loops and indexing.`,
            r`t = "banana"
print(t.count("a"))          # how many 'a'
print(t.find("n"))           # first index, -1 if absent
print(t.find("z"))
print(t.startswith("ba"), t.endswith("na"))

# OUTPUT:
# 3
# 2
# -1
# True True`],
        [`Cleaning a messy header row from a file or spreadsheet export.`,
            r`line = " name ; AGE ; city "
fields = [p.strip().title() for p in line.split(";")]
print(fields)

# OUTPUT:
# ['Name', 'Age', 'City']`],
        [`<b>Advantages:</b> readable one-liners, method chaining, and predicate helpers such as <code>isdigit</code>, <code>isalpha</code>.`,
            r`print("hello world".title())
print("abc".isalpha(), "123".isdigit(), "a1".isalnum())
print("42".zfill(5))
print("  x ".strip().upper())

# OUTPUT:
# Hello World
# True True True
# 00042
# X`],
        [`<b>Disadvantages:</b> forgetting to assign the result is a classic mistake, and <code>strip("abc")</code> removes a set of characters, not a substring.`,
            r`s = "hi"
s.upper()                         # result thrown away
print(s)
print("www.site.com".strip("w."))      # strips any of 'w' and '.' at the ends
print("filename.txt".removesuffix(".txt"))  # 3.9+: remove an exact suffix

# OUTPUT:
# hi
# site.com
# filename`],
        [`<b>Limitations:</b> <code>index</code> raises while <code>find</code> returns -1, and <code>lower()</code> is not enough for caseless comparison in all languages.`,
            r`try:
    "abc".index("z")
except ValueError as e:
    print("ValueError:", e)

word = "Straße"
print(word.lower() == "strasse", word.casefold() == "strasse")

# OUTPUT:
# ValueError: substring not found
# False True`],
        `
   "  Hello, World  "
        │ .strip()
        ▼
   "Hello, World" ──.split(", ")──► ["Hello", "World"]
                                          │ ", ".join(...)
                                          ▼
                                   "Hello, World"
   (each arrow creates a NEW object)
`,
        `For heavy text work choose the right tool: str methods for simple cases, re for patterns, and parsers (csv, json, html.parser) for structured formats. Build big strings with join or io.StringIO to avoid quadratic copying.`
    ),

    'Escape Sequences & Raw Strings': dd(
        [`An <b>escape sequence</b> starts with a backslash and stands for a special character: &#92;n newline, &#92;t tab, &#92;&#92; backslash, &#92;" quote, &#92;uXXXX Unicode. A <b>raw string</b> (prefix <code>r</code>) turns escape processing off.`,
            r`print(len("a\tb"))            # \t is ONE character (tab)
print(repr("a\tb"))
print("Line1\nLine2")
print('It\'s "quoted"')

# OUTPUT:
# 3
# 'a\tb'
# Line1
# Line2
# It's "quoted"`],
        [`Windows paths and regular expressions are full of backslashes that must not be treated as escapes.`,
            r`print(len("C:\new"))           # \n became a newline: 5 chars
print(len(r"C:\new"))          # raw keeps the backslash: 6 chars
print(r"C:\new\table")

# OUTPUT:
# 5
# 6
# C:\new\table`],
        [`Raw strings are the standard way to write regex patterns and file paths.`,
            r`import re
text = "a1 b22 c333"
print(re.findall(r"\d+", text))              # \d means digit to the regex engine
print(re.sub(r"\s+", " ", "too    many   spaces"))

# OUTPUT:
# ['1', '22', '333']
# too many spaces`],
        [`<b>Advantages:</b> readable patterns, plus escapes for any Unicode character.`,
            r`print("\u00e9", "\x41", "\N{GREEK SMALL LETTER ALPHA}")
print(r"\d+\.\d+")                  # appears exactly as typed

# OUTPUT:
# é A α
# \d+\.\d+`],
        [`<b>Disadvantages:</b> a raw string cannot end with a single backslash, so paths ending in a slash need a workaround.`,
            r`# r"C:\Users\" is a SyntaxError (the last \" escapes the quote)
path = r"C:\Users" + "\\"          # concatenate a normal "\\" instead
print(path + "data.txt")

# OUTPUT:
# C:\Users\data.txt`],
        [`<b>Limitations:</b> raw means no escapes at all, so you cannot write a newline or tab in it; r"&#92;n" is two characters.`,
            r`s = r"line1\nline2"
print(len(r"\n"), s)                 # backslash and n, not a newline
print(s.replace("\\n", "\n"))         # convert on purpose when needed

# OUTPUT:
# 2 line1\nline2
# line1
# line2`],
        `
   source text      "a\tb"            r"a\tb"
                       │                 │
   escape processing   ▼ yes             ▼ no
   result            a<TAB>b           a \ t b   (4 chars)
   len               3                 4
`,
        `Prefer pathlib.Path over hand-built Windows path strings, and use raw strings (or re.VERBOSE with triple-quoted raw strings) for every regex. Treat escape handling as a boundary concern: never build strings for SQL or shells by hand, use parameterised APIs.`
    ),

    'f-strings & String Formatting': dd(
        [`An <b>f-string</b> (<code>f"..."</code>) embeds expressions in braces and formats them with a mini-language after a colon. Older styles are <code>str.format()</code> and the <code>%</code> operator.`,
            r`name, age = "Ada", 36
print(f"{name} is {age}, next year {age + 1}")
print(f"{name!r}")                 # repr
print(f"{age=}")                   # self-documenting (3.8+)
print("{} / {}".format(name, age), "%s-%d" % (name, age))

# OUTPUT:
# Ada is 36, next year 37
# 'Ada'
# age=36
# Ada / 36 Ada-36`],
        [`Output must look right: fixed decimals, thousands separators, percentages, zero padding. Doing that by hand is clumsy.`,
            r`pi = 3.14159265
print(f"{pi:.2f}", f"{1234567:,}", f"{0.256:.1%}")
print(f"{255:#x}", f"{255:08b}", f"{5:03d}")

# OUTPUT:
# 3.14 1,234,567 25.6%
# 0xff 11111111 005`],
        [`Report lines with aligned columns.`,
            r`items = [("Pen", 10, 1.5), ("Notebook", 3, 45.25)]
for name, qty, price in items:
    print(f"{name:<10}{qty:>5}{price:>9.2f}")

# OUTPUT:
# Pen          10     1.50
# Notebook      3    45.25`],
        [`<b>Advantages:</b> fastest and most readable form; supports nested specs and date formats.`,
            r`from datetime import date
pi, width = 3.14159, 8
print(f"[{pi:{width}.3f}]")                  # width taken from a variable
print(f"{date(2024, 3, 5):%d/%m/%Y}")

# OUTPUT:
# [   3.142]
# 05/03/2024`],
        [`<b>Disadvantages:</b> an f-string is evaluated on the spot, so it cannot be a reusable template stored in a file or database; use <code>str.format</code> for that.`,
            r`template = "Hi {name}, you owe {amt:.2f}"      # could come from a config file
print(template.format(name="Bo", amt=12.5))

# OUTPUT:
# Hi Bo, you owe 12.50`],
        [`<b>Limitations:</b> f-strings always format eagerly (wasteful in logging), and <code>str.format</code> with untrusted templates can leak object attributes.`,
            r`import logging
class Noisy:
    def __str__(self):
        print("__str__ called")
        return "N"

log = logging.getLogger("demo")        # level WARNING: debug is disabled
n = Noisy()
log.debug(f"{n}")                      # formats BEFORE the logger decides to drop it
log.debug("%s", n)                     # lazy: never formatted
print("{0.__class__.__name__}".format(5))   # templates can reach attributes

# OUTPUT:
# __str__ called
# int`],
        `
   f"{price:>9.2f}"
       │    │││ │└─ type  f = fixed point
       │    │││ └── precision .2
       │    ││└──── width 9
       │    │└───── align  > right
       │    └────── ':' starts the format spec
       └─────────── expression (any Python)
`,
        `Use f-strings everywhere for readability, but pass lazy arguments to logging, use parameterised queries for SQL, and never let users supply format templates. For i18n use gettext with named placeholders so translators can reorder them.`
    ),

    'Unicode, Encoding & Decoding': dd(
        [`<b>Unicode</b> gives every character a number (code point). <b>Encoding</b> (UTF-8 is standard) turns text (str) into bytes; <b>decoding</b> turns bytes back into str.`,
            r`s = "héllo"
b = s.encode("utf-8")
print(len(s), len(b))              # 5 characters, 6 bytes
print(b)
print(b.decode("utf-8") == s)

# OUTPUT:
# 5 6
# b'h\xc3\xa9llo'
# True`],
        [`Files, sockets and databases only store bytes. You must pick an encoding at the boundary or text will be corrupted.`,
            r`print(ord("A"), chr(8364))        # code point <-> character
print("€".encode("utf-8"))

# OUTPUT:
# 65 €
# b'\xe2\x82\xac'`],
        [`Mojibake (garbled text) is what you see when bytes are decoded with the wrong encoding; it is a daily real-world bug.`,
            r`data = "naïve café".encode("utf-8")
print(data.decode("latin-1"))      # wrong codec
print(data.decode("utf-8"))        # right codec

# OUTPUT:
# naÃ¯ve cafÃ©
# naïve café`],
        [`<b>Advantages:</b> one model for every language and emoji; Python 3 strings are Unicode by default.`,
            r`s = "你好"
print(len(s), len(s.encode("utf-8")))
print(s.encode("utf-8"))
print("👍".encode("utf-8"))

# OUTPUT:
# 2 6
# b'\xe4\xbd\xa0\xe5\xa5\xbd'
# b'\xf0\x9f\x91\x8d'`],
        [`<b>Disadvantages:</b> encoding or decoding with an incompatible codec raises errors; you can choose to replace or ignore, but data is lost.`,
            r`try:
    "é".encode("ascii")
except UnicodeEncodeError as e:
    print("UnicodeEncodeError:", e)
print("é".encode("ascii", errors="replace"))
try:
    b"\xff".decode("utf-8")
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e)

# OUTPUT:
# UnicodeEncodeError: 'ascii' codec can't encode character '\xe9' in position 0: ordinal not in range(128)
# b'?'
# UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff in position 0: invalid start byte`],
        [`<b>Limitations:</b> the same visible text can have several code point sequences, so equality and len can disagree with what users see. Normalise first.`,
            r`import unicodedata
a = "\u00e9"            # one code point
b = "e\u0301"           # e + combining acute accent
print(a == b, len(a), len(b))
print(unicodedata.normalize("NFC", b) == a)

# OUTPUT:
# False 1 2
# True`],
        `
   str (code points)           bytes (on disk / network)
   ┌─────────────────┐ encode ┌──────────────────────┐
   │ "héllo"         │ ─────► │ 68 c3 a9 6c 6c       │
   │ 5 characters    │ ◄───── │ 6 bytes (UTF-8)      │
   └─────────────────┘ decode └──────────────────────┘
   rule: decode on input, work in str, encode on output
`,
        `Adopt the Unicode sandwich: decode at the input boundary, keep str inside, encode at the output boundary, always passing encoding="utf-8" explicitly to open(). Normalise (NFC) before comparing or indexing user text, and never silently use errors="ignore" on data you care about.`
    ),

    'input() & print()': dd(
        [`<code>input(prompt)</code> reads one line from the keyboard and returns it as a <b>str</b>; <code>print(...)</code> writes values to the screen, separated by <code>sep</code> and finished with <code>end</code>.`,
            r`name = input("Name: ")          # program pauses until Enter
print("Hi", name)
print("a", "b", "c", sep="-", end="!\n")

# OUTPUT (example, user typed Asha):
# Name: Asha
# Hi Asha
# a-b-c!`],
        [`Programs need to take data from a user and show results. Because input always returns text, convert before calculating.`,
            r`age = int(input("Age: "))       # str -> int
print("Next year you will be", age + 1)

# OUTPUT (example, user typed 25):
# Age: 25
# Next year you will be 26`],
        [`Console tools validate input in a loop until it is usable.`,
            r`while True:
    raw = input("Enter a number: ")
    try:
        n = float(raw)
        break
    except ValueError:
        print("Not a number, try again")
print(f"Square: {n * n}")

# OUTPUT (example, user typed abc then 4):
# Enter a number: abc
# Not a number, try again
# Enter a number: 4
# Square: 16.0`],
        [`<b>Advantages:</b> print accepts many arguments, converts them to text and has <code>sep</code>, <code>end</code>, <code>file</code>, <code>flush</code>.`,
            r`print(1, 2, 3, sep=", ")
for i in range(3):
    print(i, end=" ")              # stay on the same line
print()
print(*["x", "y", "z"])           # unpack a list into arguments

# OUTPUT:
# 1, 2, 3
# 0 1 2
# x y z`],
        [`<b>Disadvantages:</b> input blocks the program, always returns str, and raises EOFError when there is no stdin (cron jobs, pipes, tests).`,
            r`try:
    value = input("Value: ")
except EOFError:
    print("no input available")      # stdin closed / empty

# OUTPUT (when stdin is empty or closed):
# Value: no input available`],
        [`<b>Limitations:</b> it is strictly line-based and echoes what is typed (use <code>getpass</code> for passwords). Tests can feed it a fake stdin.`,
            r`import io, sys
sys.stdin = io.StringIO("alice\nsecret\n")   # fake keyboard
user = input()                               # one line at a time, newline removed
pwd = input()
print(user, pwd)
sys.stdin = sys.__stdin__                    # restore

# OUTPUT:
# alice secret`],
        `
   keyboard ──► stdin ──► input("Q: ") ──► str ──► int()/float() ──► logic
                                                                      │
   screen ◄── stdout ◄── print(a, b, sep=" ", end="\n") ◄─────────────┘
`,
        `Interactive input is for scripts and teaching. Real tools take arguments (argparse/typer), config files or environment variables so they can be automated and tested; wrap any unavoidable input() in a function so tests can inject values.`
    ),

    'Formatting Output': dd(
        [`Formatting output means controlling width, alignment, precision and separators so results are easy to read. Tools: format specs in f-strings, <code>str.ljust/rjust/center</code>, and <code>print</code> arguments.`,
            r`print(f"{'Name':<10}|{'Qty':^5}|{'Price':>8}")
print("-" * 25)
print("abc".ljust(6, "."), "abc".rjust(6, "."), "abc".center(7, "*"))

# OUTPUT:
# Name      | Qty |   Price
# -------------------------
# abc... ...abc **abc**`],
        [`Raw numbers like 1234567.891 or 0.256 are hard to read; users expect separators, fixed decimals and percentages.`,
            r`amount = 1234567.891
print(f"{amount:,.2f}")
print(f"{0.256:.1%}")
print(f"{12345.678:.2e}")

# OUTPUT:
# 1,234,567.89
# 25.6%
# 1.23e+04`],
        [`A receipt or report printer lines up columns and totals.`,
            r`rows = [("Tea", 2, 1.5), ("Cake", 1, 3.25)]
total = 0
for n, q, p in rows:
    print(f"{n:<8}{q:>3} x {p:>6.2f} = {q * p:>7.2f}")
    total += q * p
print(f"TOTAL: {total:.2f}")

# OUTPUT:
# Tea       2 x   1.50 =    3.00
# Cake      1 x   3.25 =    3.25
# TOTAL: 6.25`],
        [`<b>Advantages:</b> a compact mini-language covers number bases, signs, grouping and alignment in one place.`,
            r`n = 255
print(f"{n:b} {n:o} {n:X} {n:+d}")
print(f"{42:*^9}")                # fill character with centering

# OUTPUT:
# 11111111 377 FF +255
# ***42****`],
        [`<b>Disadvantages:</b> width is a minimum, not a maximum, and double-width (CJK) characters break column alignment.`,
            r`print(f"{'abcdefgh':<4}|")       # not truncated
print(f"{'abcdefgh':.3}|")        # precision truncates strings
print(f"{'你好':<6}|")             # padded by characters, drawn wider on screen

# OUTPUT:
# abcdefgh|
# abc|
# 你好    |`],
        [`<b>Limitations:</b> a spec must match the type, and there is no built-in table or wrapping support.`,
            r`try:
    print(f"{'abc':d}")
except ValueError as e:
    print("ValueError:", e)

import textwrap
print(textwrap.fill("Python makes text wrapping easy", width=16))

# OUTPUT:
# ValueError: Unknown format code 'd' for object of type 'str'
# Python makes
# text wrapping
# easy`],
        `
   {value : [fill][align][sign][#][0][width][,][.prec][type]}

   f"{42:*^9}"   fill=*  align=^ (center)  width=9   ->  ***42****
   f"{3.14159:8.2f}"          width=8  .2f             ->  '    3.14'
   align:  <  left    >  right    ^  center    =  after sign
`,
        `Use format specs for logs and quick reports; for real tables use tabulate/rich, for money use Decimal with locale or babel, and for user-facing text use i18n libraries since separators and decimal marks differ per locale. Machine-readable output should be JSON or CSV, never pretty-printed text.`
    ),

    'sys.stdin & sys.stdout': dd(
        [`<code>sys.stdin</code> and <code>sys.stdout</code> are the file-like objects behind <code>input()</code> and <code>print()</code>. You can read from, write to, or replace them.`,
            r`import sys
n = sys.stdout.write("hi\n")      # no automatic newline, returns characters written
print(n)
print(sys.stdout.encoding)

# OUTPUT (encoding varies):
# hi
# 3
# utf-8`],
        [`Command-line programs are chained with pipes (<code>cat data | python tool.py</code>), so they must read stdin and write stdout instead of asking questions.`,
            r`import sys, io
sys.stdin = io.StringIO("3\n10 20 30\n")      # simulate piped input
n = int(sys.stdin.readline())
nums = list(map(int, sys.stdin.readline().split()))
print(n, sum(nums))
sys.stdin = sys.__stdin__

# OUTPUT:
# 3 60`],
        [`Filters (grep-like tools) stream over stdin line by line without loading everything into memory.`,
            r`import sys, io
from collections import Counter
sys.stdin = io.StringIO("to be\nor not to be\n")
counts = Counter(w for line in sys.stdin for w in line.split())
print(counts.most_common(2))
sys.stdin = sys.__stdin__

# OUTPUT:
# [('to', 2), ('be', 2)]`],
        [`<b>Advantages:</b> redirection lets you capture or reroute output without changing the code that prints (great for tests).`,
            r`import io
from contextlib import redirect_stdout

buf = io.StringIO()
with redirect_stdout(buf):
    print("captured")
print(repr(buf.getvalue()))

# OUTPUT:
# 'captured\n'`],
        [`<b>Disadvantages:</b> write only accepts str, and output is buffered when piped, so ordering with stderr or a crash can surprise you; use <code>flush=True</code>.`,
            r`import sys
try:
    sys.stdout.write(42)
except TypeError as e:
    print("TypeError:", e)
print("progress...", end="", flush=True)    # show now, even if piped
print(" done")

# OUTPUT:
# TypeError: write() argument must be str, not int
# progress... done`],
        [`<b>Limitations:</b> reads are blocking with no timeout, and <code>readline</code> keeps the newline and returns an empty string at end of input.`,
            r`import sys, io
sys.stdin = io.StringIO("a\nb\n")
print([sys.stdin.readline() for _ in range(3)])
sys.stdin = sys.__stdin__

# OUTPUT:
# ['a\n', 'b\n', '']`],
        `
   shell:  cat in.txt | python tool.py > out.txt 2> err.txt

   in.txt ──► sys.stdin ──► [ tool.py ] ──► sys.stdout ──► out.txt
                                │
                                └─────────► sys.stderr ──► err.txt
   fd 0 = stdin    fd 1 = stdout    fd 2 = stderr
`,
        `Write tools as pure functions that take and return data, with a thin main() that wires them to stdin/stdout/argv; this keeps them testable and composable in pipelines. Send diagnostics to stderr, data to stdout, and for high-volume reading iterate over the file object or use sys.stdin.buffer for binary data.`
    ),
};
