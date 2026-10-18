// Module 8 (Modules & Packages), part B: standard library tour.
import { dd, r, type DeepDive } from './deepDive';

export const m08b: Record<string, DeepDive> = {
    'math & random': dd(
        [`<code>math</code> provides fast floating-point and integer maths (sqrt, trig, gcd, factorial). <code>random</code> provides pseudo-random numbers (random, randint, choice, shuffle, sample).`,
            r`import math, random
print(math.sqrt(49), math.ceil(2.1), math.floor(-2.1), math.gcd(12, 18), math.factorial(5))
random.seed(42)                      # fixed seed -> repeatable sequence
print(random.random())

# OUTPUT:
# 7.0 3 -3 6 120
# 0.6394267984578837`],
        [`Floating-point arithmetic is inexact and you often need simulations, sampling, games or test data. These modules give correct, tested tools instead of home-made formulas.`,
            r`import math
print(0.1 + 0.2 == 0.3)              # False: binary rounding
print(math.isclose(0.1 + 0.2, 0.3))  # compare with a tolerance

# OUTPUT:
# False
# True`],
        [`Games and A/B test splits use random; geometry, finance and statistics use math; data-science code seeds random for reproducible experiments.`,
            r`import random, math
random.seed(1)
deck = list(range(1, 11))
random.shuffle(deck)                 # in-place shuffle
hand = random.sample(deck, 3)        # 3 unique picks
print(len(hand), len(set(hand)), math.comb(10, 3))

# OUTPUT:
# 3 3 120`],
        [`<b>Advantages:</b> C-speed functions, seeds for reproducibility, rich helpers (<code>math.comb</code>, <code>random.choices</code> with weights).`,
            r`import random
random.seed(0)
picks = random.choices(["win", "lose"], weights=[1, 99], k=5)
print(set(picks) <= {"win", "lose"}, len(picks))

# OUTPUT:
# True 5`],
        [`<b>Disadvantages:</b> math functions raise on invalid domains and handle only real numbers (use <code>cmath</code> for complex); random is easy to misuse for security.`,
            r`import math
try:
    math.sqrt(-1)
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# ValueError: math domain error`],
        [`<b>Limitations:</b> <code>random</code> is a Mersenne Twister - predictable, so never use it for passwords or tokens (use <code>secrets</code>); floats have limited precision (<code>decimal</code> for money).`,
            r`import secrets, random
token = secrets.token_hex(8)         # cryptographically strong
print(len(token))
random.seed(5); a = random.random()
random.seed(5); b = random.random()
print(a == b)                        # same seed -> same "random" value: predictable

# OUTPUT:
# 16
# True`],
        `
   seed --> Mersenne Twister --> random() in [0,1) --> randint / choice / shuffle
   (same seed => same sequence)         secrets  --> OS entropy (unpredictable)
   math : fast C functions on floats    cmath: complex   decimal: exact money
`,
        `Seed explicitly in tests and simulations for reproducibility, and give each worker its own random.Random instance to avoid shared global state. For vectorised numerics move to NumPy (numpy.random.Generator); for any security purpose use secrets.`
    ),

    'datetime & time': dd(
        [`<code>datetime</code> has <code>date</code>, <code>time</code>, <code>datetime</code> and <code>timedelta</code> for calendar maths; <code>time</code> gives low-level clocks, sleeping and timing.`,
            r`from datetime import date, datetime, timedelta
d = date(2024, 1, 31)
print(d + timedelta(days=30))              # 2024 is a leap year
print(datetime(2024, 5, 17, 14, 30).strftime("%d %b %Y, %H:%M"))
print(timedelta(hours=36))

# OUTPUT:
# 2024-03-01
# 17 May 2024, 14:30
# 1 day, 12:00:00`],
        [`Dates are full of edge cases (leap years, month lengths, time zones). Hand-written arithmetic is almost always wrong.`,
            r`from datetime import date
a, b = date(2024, 3, 1), date(2024, 1, 1)
print((a - b).days, a.weekday(), b.isoformat())    # weekday: Monday == 0

# OUTPUT:
# 60 4
# 2024-01-01`],
        [`Invoices (due dates), logs (timestamps), schedulers, token expiry, and benchmarks with <code>time.perf_counter()</code>.`,
            r`import time
from datetime import datetime
t = time.perf_counter()
time.sleep(0.05)
print(round(time.perf_counter() - t, 1))           # elapsed seconds
print(datetime.strptime("2024-05-17 09:15", "%Y-%m-%d %H:%M").hour)

# OUTPUT (example):
# 0.1
# 9`],
        [`<b>Advantages:</b> parsing/formatting, immutable value objects, comparisons, and timezone-aware datetimes via <code>timezone</code> or <code>zoneinfo</code>.`,
            r`from datetime import datetime, timezone, timedelta
utc = datetime(2024, 1, 1, 12, 0, tzinfo=timezone.utc)
ist = utc.astimezone(timezone(timedelta(hours=5, minutes=30)))
print(ist, utc == ist)                      # same instant

# OUTPUT:
# 2024-01-01 17:30:00+05:30 True`],
        [`<b>Disadvantages:</b> naive vs aware datetimes cannot be compared; there is no "add one month"; <code>strftime</code> codes vary slightly by platform.`,
            r`from datetime import date, datetime, timezone
try:
    date(2024, 1, 31).replace(month=2)
except ValueError as e:
    print("ValueError:", e)
try:
    datetime.now() < datetime.now(timezone.utc)
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# ValueError: day is out of range for month
# TypeError: can't compare offset-naive and offset-aware datetimes`],
        [`<b>Limitations:</b> <code>time.time()</code> follows the system clock and can jump (use <code>monotonic</code> for durations); datetime resolution is microseconds; daylight-saving gaps need <code>zoneinfo</code>.`,
            r`import time
t0 = time.monotonic()                       # never goes backwards
time.sleep(0.01)
print(time.monotonic() > t0)
print(time.time() > 1_600_000_000)          # seconds since 1970-01-01 UTC

# OUTPUT:
# True
# True`],
        `
   instant (epoch seconds) <--> datetime (aware, UTC) <--> local view (tz)
   date + timedelta -> date        datetime - datetime -> timedelta
   strptime: text -> datetime       strftime: datetime -> text
   time.perf_counter / monotonic : durations      time.sleep : pause
`,
        `Store and compute in UTC with aware datetimes, convert to local zones only for display, and use ISO 8601 strings in APIs. Inject a clock into code that depends on "now" so tests are deterministic. For richer calendar logic consider dateutil, pendulum or Arrow.`
    ),

    'json & csv Modules': dd(
        [`The <code>json</code> module converts between Python objects and JSON text; the <code>csv</code> module reads and writes delimited tables. Both work on file objects or in-memory text.`,
            r`import json, csv, io
print(json.dumps({"a": [1, 2], "ok": True}))
rows = list(csv.reader(io.StringIO("id,name\n1,Ann\n2,Baji\n")))
print(rows)

# OUTPUT:
# {"a": [1, 2], "ok": true}
# [['id', 'name'], ['1', 'Ann'], ['2', 'Baji']]`],
        [`Programs exchange data with APIs (JSON) and spreadsheets (CSV). Parsing by hand with split or regex breaks on quotes, nesting and escapes.`,
            r`import json
raw = '{"name": "Lee, \\"Jr\\"", "n": 1}'      # escaped quotes + comma inside a value
print(raw)
print(json.loads(raw)["name"])                # parsed correctly, no manual splitting

# OUTPUT:
# {"name": "Lee, \"Jr\"", "n": 1}
# Lee, "Jr"`],
        [`Convert a CSV report to JSON for an API - a daily ETL chore.`,
            r`import csv, io, json
text = "id,score\n1,90\n2,75\n"
data = [{"id": int(r["id"]), "score": int(r["score"])} for r in csv.DictReader(io.StringIO(text))]
print(json.dumps(data))

# OUTPUT:
# [{"id": 1, "score": 90}, {"id": 2, "score": 75}]`],
        [`<b>Advantages:</b> in the standard library, streaming for CSV, configurable (indent, sort_keys, dialects, quoting).`,
            r`import csv, io
buf = io.StringIO()
csv.writer(buf, quoting=csv.QUOTE_ALL).writerow(["a", 1, "x,y"])
print(buf.getvalue().strip())

# OUTPUT:
# "a","1","x,y"`],
        [`<b>Disadvantages:</b> malformed JSON raises <code>JSONDecodeError</code>; CSV gives only strings so you must convert and validate each value.`,
            r`import json
try:
    json.loads("{bad json}")
except json.JSONDecodeError as e:
    print("JSONDecodeError:", e.msg, "at char", e.pos)

# OUTPUT:
# JSONDecodeError: Expecting property name enclosed in double quotes at char 1`],
        [`<b>Limitations:</b> json loads the whole document into memory (use JSON Lines or ijson for huge data), and neither module understands schemas or enforces types.`,
            r`import json
big = json.loads(json.dumps(list(range(5))))   # whole structure lives in RAM at once
print(big, json.loads("1e400"))                # huge numbers become inf as float

# OUTPUT:
# [0, 1, 2, 3, 4] inf`],
        `
   Python objects <--json.dumps/loads--> text (JSON)
   list of rows   <--csv.writer/reader--> text (CSV, one record per line)
   file object / StringIO is the pipe in both cases
`,
        `For production pipelines validate at the boundary (pydantic or jsonschema), stream big files, and prefer typed columnar formats for analytics. Pin an explicit encoding and newline policy; never hand-roll CSV or JSON parsing.`
    ),

    're Module': dd(
        [`Regular expressions describe text patterns. <code>re</code> offers <code>search</code>, <code>match</code>, <code>fullmatch</code>, <code>findall</code>, <code>sub</code> and <code>split</code>. Use raw strings (r"...") for patterns.`,
            r`import re
text = "Order 66 shipped on 2024-05-17"
print(re.findall(r"\d+", text))
m = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
print(m.group(0), m.groups())

# OUTPUT:
# ['66', '2024', '05', '17']
# 2024-05-17 ('2024', '05', '17')`],
        [`Validating and extracting from messy text (emails, phones, logs) with plain string methods needs many fragile lines; one pattern does it declaratively.`,
            r`import re
print(bool(re.fullmatch(r"[\w.]+@\w+\.\w+", "ann.k@example.com")))
print(re.sub(r"\s+", " ", "too    many\n spaces"))

# OUTPUT:
# True
# too many spaces`],
        [`Log parsing, input validation, scraping, search-and-replace in tools and tokenizers. Named groups make results readable.`,
            r`import re
line = "2024-05-17 ERROR disk full"
m = re.match(r"(?P<date>\S+) (?P<level>[A-Z]+) (?P<msg>.*)", line)
print(m["level"], "|", m["msg"])
pat = re.compile(r"ERROR")                     # compile once, reuse in loops
print(bool(pat.search(line)))

# OUTPUT:
# ERROR | disk full
# True`],
        [`<b>Advantages:</b> very compact, powerful (groups, lookahead, flags), and fast C implementation.`,
            r`import re
print(re.sub(r"(\w+)@(\w+)", r"\2 at \1", "ann@site"))   # back-references in replacement
print(re.split(r"[,;]\s*", "a, b;c"))

# OUTPUT:
# site at ann
# ['a', 'b', 'c']`],
        [`<b>Disadvantages:</b> hard to read and maintain; greedy matching surprises beginners.`,
            r`import re
html = "<b>bold</b><i>it</i>"
print(re.findall(r"<.+>", html))      # greedy: swallows everything
print(re.findall(r"<.+?>", html))     # non-greedy: tag by tag

# OUTPUT:
# ['<b>bold</b><i>it</i>']
# ['<b>', '</b>', '<i>', '</i>']`],
        [`<b>Limitations:</b> cannot parse nested or recursive structures (HTML, balanced brackets); some patterns backtrack catastrophically and can freeze a service (ReDoS).`,
            r`import re
print(re.fullmatch(r"\(\w*\)", "((a))"))       # nesting depth is beyond a regular language

import time
t = time.perf_counter()
re.match(r"(a+)+$", "a" * 22 + "b")            # exponential backtracking
print("slow:", time.perf_counter() - t > 0.01) # grows 2x per extra "a"

# OUTPUT (example):
# None
# slow: True`],
        `
   pattern  r"(\d{4})-(\d{2})"      text "on 2024-05"
        compile --> matcher --scan--> Match object
                                      .group(1) -> '2024'   .span() -> (3, 10)
   no match --> None   (always check before .group)
`,
        `Use regex for flat, well-bounded text patterns; use real parsers (json, html.parser, lark) for structured grammars. Compile patterns once, anchor them, avoid nested quantifiers, set timeouts or use the third-party re2 engine for untrusted input. Add verbose (re.X) comments to complex patterns.`
    ),

    'collections Module': dd(
        [`<code>collections</code> offers specialised containers: <code>Counter</code>, <code>defaultdict</code>, <code>deque</code>, <code>namedtuple</code>, <code>OrderedDict</code>, <code>ChainMap</code>.`,
            r`from collections import Counter, defaultdict, deque, namedtuple
print(Counter("banana").most_common(2))
groups = defaultdict(list)
for w in ["apple", "avocado", "bean"]:
    groups[w[0]].append(w)
print(dict(groups))
P = namedtuple("P", "x y")
print(P(1, 2), deque([1, 2, 3], maxlen=2))

# OUTPUT:
# [('a', 3), ('n', 2)]
# {'a': ['apple', 'avocado'], 'b': ['bean']}
# P(x=1, y=2) deque([2, 3], maxlen=2)`],
        [`Built-in list/dict need extra code for counting, grouping, queues and lightweight records; these types do it right and faster.`,
            r`# Plain dict needs a check on every first insert; defaultdict does not
plain = {}
for ch in "aab":
    if ch not in plain: plain[ch] = 0
    plain[ch] += 1
from collections import Counter
print(plain, Counter("aab"))

# OUTPUT:
# {'a': 2, 'b': 1} Counter({'a': 2, 'b': 1})`],
        [`Word frequencies, sliding windows (deque), BFS queues, grouping DB rows, immutable records, and layered config lookups (<code>ChainMap</code>).`,
            r`from collections import deque, ChainMap
window = deque(maxlen=3)
for x in [1, 2, 3, 4, 5]:
    window.append(x)                  # oldest item drops automatically
print(list(window), sum(window) / len(window))
cfg = ChainMap({"debug": True}, {"debug": False, "port": 80})
print(cfg["debug"], cfg["port"])      # first mapping wins

# OUTPUT:
# [3, 4, 5] 4.0
# True 80`],
        [`<b>Advantages:</b> <code>deque</code> appends/pops at both ends in O(1) (list pop(0) is O(n)), Counter supports arithmetic, namedtuple gives readable fields.`,
            r`from collections import Counter
a, b = Counter("aab"), Counter("abc")
print(a + b)
print(a - b)

# OUTPUT:
# Counter({'a': 3, 'b': 2, 'c': 1})
# Counter({'a': 1})`],
        [`<b>Disadvantages:</b> defaultdict silently creates keys on read; deque has no slicing and slow middle access.`,
            r`from collections import defaultdict, deque
d = defaultdict(int)
_ = d["typo"]                          # a read inserted a key!
print(dict(d))
try:
    deque([1, 2, 3])[0:2]
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# {'typo': 0}
# TypeError: sequence index must be integer, not 'slice'`],
        [`<b>Limitations:</b> namedtuple fields are immutable (use dataclass for mutable records), and none of these containers is thread-safe for compound operations.`,
            r`from collections import namedtuple
P = namedtuple("P", "x y")
p = P(1, 2)
try:
    p.x = 9
except AttributeError as e:
    print("AttributeError: cannot assign to a namedtuple field")
print(p._replace(x=9))                 # make a modified copy instead

# OUTPUT:
# AttributeError: cannot assign to a namedtuple field
# P(x=9, y=2)`],
        `
   Counter      : item -> count        defaultdict : missing key -> factory()
   deque        : [<-O(1)- items -O(1)->]   namedtuple : tuple with names
   ChainMap     : lookup layers  m1 -> m2 -> m3 (first hit wins)
`,
        `Choose the container that states your intent: Counter for tallies, deque for queues/windows, dataclass over namedtuple when you need defaults, methods or mutability. For concurrency use queue.Queue; for large numeric data use NumPy or pandas.`
    ),

    'itertools & functools': dd(
        [`<code>itertools</code> builds fast, memory-friendly iterators (chain, islice, product, permutations, groupby, accumulate). <code>functools</code> has higher-order tools (reduce, partial, lru_cache, wraps).`,
            r`from itertools import chain, islice, count, product, accumulate
from functools import reduce, partial
print(list(chain([1, 2], "ab")), list(islice(count(10), 3)))
print(list(product("ab", [1, 2])))
print(list(accumulate([1, 2, 3, 4])), reduce(lambda a, b: a * b, [1, 2, 3, 4]))
double = partial(pow, 2)               # pow(2, x)
print(double(5))

# OUTPUT:
# [1, 2, 'a', 'b'] [10, 11, 12]
# [('a', 1), ('a', 2), ('b', 1), ('b', 2)]
# [1, 3, 6, 10] 24
# 32`],
        [`Nested loops, manual counters and repeated expensive calls clutter code and waste time. These tools replace them with tested building blocks and caching.`,
            r`from functools import lru_cache
@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))                         # instant; without the cache ~1.6 million calls
print(fib.cache_info())

# OUTPUT:
# 832040
# CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)`],
        [`Batching records, sliding combinations, test-case generation (product), caching API/DB lookups, pre-filled callbacks (partial), and decorators that keep metadata (wraps).`,
            r`from itertools import groupby, islice
from functools import wraps
data = sorted(["ant", "bee", "ape", "bat"])
for k, g in groupby(data, key=lambda w: w[0]):
    print(k, list(g))

def logged(fn):
    @wraps(fn)                         # keep name and docstring
    def inner(*a, **kw):
        return fn(*a, **kw)
    return inner

@logged
def hello(): "say hi"
print(hello.__name__)

# OUTPUT:
# a ['ant', 'ape']
# b ['bat', 'bee']
# hello`],
        [`<b>Advantages:</b> lazy (constant memory), implemented in C, expressive pipelines; infinite streams are fine.`,
            r`from itertools import count, islice
squares = (n * n for n in count(1))    # infinite, lazy
print(list(islice(squares, 5)))

# OUTPUT:
# [1, 4, 9, 16, 25]`],
        [`<b>Disadvantages:</b> <code>groupby</code> only groups adjacent equal keys, <code>permutations</code>/<code>product</code> explode combinatorially, and heavy chaining hurts readability.`,
            r`from itertools import groupby, permutations
print([(k, len(list(g))) for k, g in groupby("aabaa")])    # unsorted input
print(len(list(permutations(range(8)))))                   # 8! results

# OUTPUT:
# [('a', 2), ('b', 1), ('a', 2)]
# 40320`],
        [`<b>Limitations:</b> iterators are single-use; <code>lru_cache</code> needs hashable arguments, keeps references alive (memory), and caches stale results for impure functions.`,
            r`from itertools import chain
from functools import lru_cache
it = chain([1, 2])
print(list(it), list(it))              # second pass is empty

@lru_cache
def total(xs): return sum(xs)
try:
    total([1, 2])
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# [1, 2] []
# TypeError: unhashable type: 'list'`],
        `
   source --> chain --> filter/islice --> accumulate --> consumer
   (each stage lazy: one item flows through at a time, no big lists)
   lru_cache: call(args) --hit--> stored result
                         --miss--> compute, store, return
`,
        `Use itertools for streaming pipelines and functools.cache for pure, hashable-argument functions; bound the cache (maxsize) and never cache functions with side effects. When a chain gets hard to read, a named generator function is clearer than five nested iterator calls.`
    ),

    'pathlib': dd(
        [`<code>pathlib.Path</code> represents file system paths as objects. The <code>/</code> operator joins parts, and methods like <code>read_text</code>, <code>exists</code>, <code>glob</code> replace many os/os.path calls.`,
            r`from pathlib import Path
p = Path("reports") / "2024" / "may.txt"       # join with /
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("sales: 10\n", encoding="utf-8")
print(p.name, p.stem, p.suffix, p.exists())
print(p.read_text(encoding="utf-8").strip())

# OUTPUT:
# may.txt may .txt True
# sales: 10`],
        [`String paths need the right separator, careful splitting and several modules (os, os.path, glob, shutil). pathlib gathers it in one readable, cross-platform API.`,
            r`from pathlib import PurePosixPath
q = PurePosixPath("/data/images/photo.final.png")
print(q.parent, q.with_suffix(".jpg").name, q.parts)

# OUTPUT:
# /data/images photo.final.jpg ('/', 'data', 'images', 'photo.final.png')`],
        [`Finding files, building output paths, batch renaming, locating the script's own folder via <code>Path(__file__).parent</code>.`,
            r`from pathlib import Path
for n in ("a.py", "b.py", "c.txt"):
    Path("proj").mkdir(exist_ok=True)
    (Path("proj") / n).touch()
print(sorted(f.name for f in Path("proj").glob("*.py")))
print(sorted(f.name for f in Path("proj").iterdir()))

# OUTPUT:
# ['a.py', 'b.py']
# ['a.py', 'b.py', 'c.txt']`],
        [`<b>Advantages:</b> readable, object oriented, works on Windows and POSIX, supports <code>rglob</code> recursion, <code>stat</code>, <code>rename</code> and <code>unlink</code>.`,
            r`from pathlib import Path
p = Path("proj/a.py")
p.rename("proj/z.py")
print(Path("proj/z.py").exists(), Path("proj/a.py").exists())
print(sorted(x.name for x in Path("proj").rglob("*.py")))

# OUTPUT:
# True False
# ['b.py', 'z.py']`],
        [`<b>Disadvantages:</b> a Path is not a str, so older APIs may need <code>str(p)</code>; read/write helpers load whole files; there is no built-in recursive copy (use shutil).`,
            r`from pathlib import Path
p = Path("proj/b.py")
print(isinstance(p, str), str(p).replace("\\", "/"))
print("proj/" + p.name)                 # string + Path would be a TypeError

# OUTPUT:
# False proj/b.py
# proj/b.py`],
        [`<b>Limitations:</b> a path object does not check existence by itself; Windows and POSIX paths follow different rules (case, drive letters), so pure-path classes differ.`,
            r`from pathlib import Path, PureWindowsPath, PurePosixPath
print(PureWindowsPath("C:/Data/a.TXT") == PureWindowsPath("c:/data/a.txt"))   # case-insensitive
print(PurePosixPath("/Data/a.TXT") == PurePosixPath("/data/a.txt"))
try:
    Path("missing.txt").read_text()
except FileNotFoundError:
    print("FileNotFoundError: path objects do not guarantee existence")

# OUTPUT:
# True
# False
# FileNotFoundError: path objects do not guarantee existence`],
        `
   Path("proj") / "a.py"  --->  proj/a.py   (object, not string)
        .parent  .name  .stem  .suffix  .parts
        .exists() .is_file() .glob("*.py") .read_text() .write_text()
   Pure* : only string logic     Path : also touches the file system
`,
        `Use pathlib as the default path type in new code and accept os.PathLike in APIs (os.fspath). Do not rely on case sensitivity or separators; for large file I/O stream with open() rather than read_text(), and use shutil for trees and tempfile for scratch space.`
    ),

    'subprocess': dd(
        [`<code>subprocess</code> starts other programs from Python. <code>subprocess.run</code> runs a command, waits, and returns a <code>CompletedProcess</code> with return code and captured output.`,
            r`import subprocess, sys
res = subprocess.run([sys.executable, "-c", "print('hi from child')"],
                     capture_output=True, text=True)
print(res.returncode, repr(res.stdout))

# OUTPUT:
# 0 'hi from child\n'`],
        [`Some jobs are best done by existing tools (git, ffmpeg, compilers, shell scripts). Scripts need to start them, pass input, read results and detect failure reliably.`,
            r`import subprocess, sys
res = subprocess.run([sys.executable, "-c", "import sys; print(sys.stdin.read().upper())"],
                     input="pipe me", capture_output=True, text=True)
print(res.stdout.strip())

# OUTPUT:
# PIPE ME`],
        [`Build and deploy scripts, CI steps, calling git or Docker, media conversion, and running untrusted work in a separate process with a timeout.`,
            r`import subprocess, sys
try:
    subprocess.run([sys.executable, "-c", "import sys; sys.exit(3)"], check=True)
except subprocess.CalledProcessError as e:
    print("failed with code", e.returncode)

# OUTPUT:
# failed with code 3`],
        [`<b>Advantages:</b> full control over args, environment, working directory, pipes and timeouts; a list of arguments avoids shell parsing (and injection).`,
            r`import subprocess, sys
user_input = "x; echo HACKED"                 # hostile text stays ONE argument
res = subprocess.run([sys.executable, "-c", "import sys; print(sys.argv[1])", user_input],
                     capture_output=True, text=True)
print(res.stdout.strip())

# OUTPUT:
# x; echo HACKED`],
        [`<b>Disadvantages:</b> <code>shell=True</code> with user data is a security hole, commands differ per OS, and output capture of very large results uses memory.`,
            r`import subprocess
# shell=True hands the string to the shell, which interprets ; | && and so on
# (shown for a POSIX shell such as bash; Windows cmd.exe behaves differently)
res = subprocess.run("echo one; echo two", shell=True, capture_output=True, text=True)
print(res.stdout.split())                     # the shell ran TWO commands

# OUTPUT:
# ['one', 'two']`],
        [`<b>Limitations:</b> a missing program raises FileNotFoundError, a hanging child blocks forever unless you set <code>timeout</code>, and the child cannot share Python objects (only bytes/text).`,
            r`import subprocess, sys
try:
    subprocess.run(["definitely-not-a-program"])
except FileNotFoundError:
    print("program not found")
try:
    subprocess.run([sys.executable, "-c", "import time; time.sleep(5)"], timeout=0.3)
except subprocess.TimeoutExpired:
    print("timed out and killed")

# OUTPUT:
# program not found
# timed out and killed`],
        `
   Python parent --run([...])--> OS creates child process
        stdin  ---- input= ---->  child
        stdout <--- captured ---  child       returncode: 0 ok / non-zero fail
        timeout / check=True turn hangs and failures into exceptions
`,
        `Always pass an argument list, set timeout and check=True, and use sys.executable for Python children. Prefer a library API over shelling out when one exists (better errors, portability). For many parallel workers use multiprocessing or concurrent.futures, and treat any shell=True as a security review item.`
    )
};
