// Module 2 (Control Flow), part A: conditions and loops.
import { dd, r, type DeepDive } from './deepDive';

export const m02a: Record<string, DeepDive> = {
    'Control Flow': dd(
        [`<b>Control flow</b> decides which statements run, in what order, and how many times. Python gives you three tools: <b>branching</b> (<code>if/elif/else</code>, <code>match</code>), <b>looping</b> (<code>for</code>, <code>while</code>) and <b>jumping</b> (<code>break</code>, <code>continue</code>, <code>return</code>). Blocks are marked by indentation.`,
            r`# Sequence -> branch -> loop: the three shapes of every program
temperature = 31                      # 1. sequence: runs top to bottom
if temperature > 30:                  # 2. branch: choose ONE path
    print("hot day")
else:
    print("pleasant day")
for hour in range(3):                 # 3. loop: repeat a block
    print("hour", hour)

# OUTPUT:
# hot day
# hour 0
# hour 1
# hour 2`],
        [`Without control flow a program is a fixed list of steps that can never react to data. Decisions and repetition let one program handle any input, any number of records, and any error situation.`,
            r`# Same code, different data => different behaviour
def classify(marks):
    if marks >= 90:
        return "A"
    elif marks >= 60:
        return "B"
    return "C"

for m in (95, 72, 40):
    print(m, "->", classify(m))

# OUTPUT:
# 95 -> A
# 72 -> B
# 40 -> C`],
        [`Every real system uses it: web servers route by URL, payment code branches on status, ETL jobs loop over millions of rows, retry logic loops until success or a limit.`,
            r`# Real-time style: retry an unreliable call at most 3 times
attempts = 0
responses = ["timeout", "timeout", "ok"]     # simulated server replies
while attempts < 3:
    reply = responses[attempts]
    attempts += 1
    if reply == "ok":
        print(f"success after {attempts} attempts")
        break
    print("retrying...", reply)
else:
    print("gave up")                         # runs only if no break happened

# OUTPUT:
# retrying... timeout
# retrying... timeout
# success after 3 attempts`],
        [`<b>Advantages:</b> readable (indentation = structure), <code>for</code> iterates over any iterable directly, loop <code>else</code> and chained comparisons remove helper flags, and there are very few keywords to learn.`,
            r`# Advantage: chained comparison and direct iteration read like English
age = 25
if 18 <= age < 60:                    # no "age >= 18 and age < 60" needed
    print("working age")
for name in ["Abaji", "Raoji"]:         # no index variable needed
    print("hello", name)

# OUTPUT:
# working age
# hello Abaji
# hello Raoji`],
        [`<b>Disadvantages:</b> indentation errors change meaning silently, there is no <code>do-while</code> or classic C-style <code>for(;;)</code>, and deep nesting becomes hard to read.`,
            r`# Disadvantage: one wrongly indented line changes the logic, with no error
total = 0
for n in range(1, 4):
    total += n
print("inside-loop print?", total)      # at loop level: prints once, after the loop

total = 0
for n in range(1, 4):
    total += n
    print("running total", total)       # indented: prints every pass

# OUTPUT:
# inside-loop print? 6
# running total 1
# running total 3
# running total 6`],
        [`<b>Limitations:</b> Python has no <code>goto</code> and no labelled <code>break</code>, so leaving two nested loops at once needs a function, flag or exception; loops are also slower than vectorised or built-in alternatives.`,
            r`# Limitation: break only exits the INNERMOST loop
for i in range(3):
    for j in range(3):
        if j == 1:
            break                  # leaves the j-loop only
        print(i, j)

# OUTPUT:
# 0 0
# 1 0
# 2 0`],
        `
            ┌───────────┐
            │  start    │
            └─────┬─────┘
                  ▼
            ┌───────────┐  False   ┌───────────┐
        ┌──►│ condition ├─────────►│  skip /   │
        │   └─────┬─────┘          │  else     │
        │         │ True           └─────┬─────┘
        │         ▼                      │
        │   ┌───────────┐                │
        │   │  body     │                │
        │   └─────┬─────┘                │
        └─────────┘ (loops only)         ▼
                                    next statement
`,
        `Keep functions flat: prefer guard clauses (early <code>return</code>) over deep nesting, and replace long if-chains with dict dispatch or <code>match</code>. When logic must exit several loops, extract it into a function and <code>return</code>. Do not hand-write loops where a built-in (<code>sum</code>, <code>any</code>, comprehension) states the intent directly.`
    ),

    'if, elif & else': dd(
        [`<code>if</code> runs a block when its condition is truthy; <code>elif</code> tests further conditions in order; <code>else</code> is the fallback. Only the <b>first</b> matching branch runs. Python also has a one-line conditional expression: <code>a if cond else b</code>.`,
            r`score = 72
if score >= 90:
    grade = "A"
elif score >= 75:
    grade = "B"
elif score >= 60:
    grade = "C"                    # first True branch wins
else:
    grade = "F"
print(grade)
print("pass" if score >= 40 else "fail")   # conditional expression

# OUTPUT:
# C
# pass`],
        [`Programs must react to data: valid or invalid input, logged in or not, stock available or not. <code>if</code> is the basic decision tool, and truthiness (empty = False) keeps checks short.`,
            r`# Truthiness: empty containers, 0, None and "" are False
items = []
if not items:                      # shorter than len(items) == 0
    print("cart is empty")
name = ""
print("name given" if name else "name missing")

# OUTPUT:
# cart is empty
# name missing`],
        [`Used for input validation, permission checks, feature flags, pricing rules and status handling in APIs.`,
            r`# Real-time: shipping fee rules for an order
def shipping(total, country):
    if country != "IN":
        return 25.0
    elif total >= 500:
        return 0.0                 # free shipping
    else:
        return 40.0

print(shipping(700, "IN"), shipping(200, "IN"), shipping(50, "US"))

# OUTPUT:
# 0.0 40.0 25.0`],
        [`<b>Advantages:</b> evaluates lazily with <code>and</code>/<code>or</code> short-circuiting, accepts any object via truthiness, and chained comparisons keep range tests readable.`,
            r`# Advantage: short-circuit protects against errors
user = None
if user and user["active"]:        # user["active"] never evaluated when user is None
    print("active user")
else:
    print("no active user")

# OUTPUT:
# no active user`],
        [`<b>Disadvantages:</b> long elif ladders are hard to maintain; truthiness hides intent (0 and None both fail); a single <code>=</code> instead of <code>==</code> is a SyntaxError (good) but <code>is</code> vs <code>==</code> confusion is not.`,
            r`# Disadvantage: truthiness treats 0 like "missing"
discount = 0                       # a valid value: zero percent
if discount:
    print("has discount")
else:
    print("treated as no discount (0 is falsy)")
if discount is not None:           # explicit check expresses the real intent
    print("discount provided:", discount)

# OUTPUT:
# treated as no discount (0 is falsy)
# discount provided: 0`],
        [`<b>Limitations:</b> the condition is evaluated every time (no compiled jump table); a conditional expression cannot hold statements; there is no assignment inside a condition except the walrus operator <code>:=</code>.`,
            r`# Limitation: conditional expressions hold values only, not statements
n = 7
label = "odd" if n % 2 else "even"
print(label)
# "print('x') if n else pass" is a SyntaxError - use a normal if block

# Walrus assigns inside the condition (3.8+)
if (size := len("python")) > 5:
    print("long word of", size)

# OUTPUT:
# odd
# long word of 6`],
        `
   value ──► if A? ──True──► block A ──┐
               │False                  │
               ▼                       │
            elif B? ──True──► block B ─┤
               │False                  │
               ▼                       │
             else ──────────► block C ─┤
                                       ▼
                               continue after
`,
        `Order conditions from most specific or most common to least, and keep each branch short. If a ladder maps a value to an action, use a dict of functions or <code>match</code>; if branches multiply with each new feature, the design usually wants polymorphism or a strategy table instead.`
    ),

    'Nested Conditions': dd(
        [`A <b>nested condition</b> is an <code>if</code> inside another <code>if</code>. The inner test is only reached when the outer test passed. Equivalent flat forms use <code>and</code> or early returns.`,
            r`age, has_id = 20, True
if age >= 18:
    if has_id:                     # only checked when age >= 18
        print("entry allowed")
    else:
        print("show ID")
else:
    print("too young")

# OUTPUT:
# entry allowed`],
        [`Real rules depend on several factors in layers (is the user logged in, then is the role admin, then is the resource owned). Nesting expresses dependent checks.`,
            r`def can_delete(user, post):
    if user["logged_in"]:
        if user["role"] == "admin":
            return True
        if post["owner"] == user["name"]:
            return True
    return False

u = {"logged_in": True, "role": "user", "name": "abaji"}
print(can_delete(u, {"owner": "abaji"}), can_delete(u, {"owner": "raoji"}))

# OUTPUT:
# True False`],
        [`Authorization, form validation, order workflows and game rules all layer conditions. Developers flatten them with guard clauses for readability.`,
            r`# Flattened with guard clauses (same logic, no pyramid)
def checkout(cart, paid, address):
    if not cart:
        return "empty cart"
    if not paid:
        return "payment pending"
    if not address:
        return "address missing"
    return "order placed"

print(checkout(["pen"], True, ""))
print(checkout(["pen"], True, "Pune"))

# OUTPUT:
# address missing
# order placed`],
        [`<b>Advantages:</b> mirrors dependent rules directly, avoids repeating the outer test, and lets the inner check use values proven valid by the outer one.`,
            r`# Advantage: inner check is safe because the outer one passed
data = {"items": [3, 4]}
if "items" in data:
    if data["items"]:              # safe: key is known to exist
        print("first:", data["items"][0])

# OUTPUT:
# first: 3`],
        [`<b>Disadvantages:</b> deep nesting (the "arrow anti-pattern") hurts readability, is harder to test, and the else of an inner if is easy to attach to the wrong level.`,
            r`# Disadvantage: which 'if' does this else belong to? Indentation decides.
x, y = 5, -1
if x > 0:
    if y > 0:
        print("both positive")
    else:
        print("x positive, y not")     # belongs to the INNER if
# no output from the outer else because x > 0 was True

# OUTPUT:
# x positive, y not`],
        [`<b>Limitations:</b> Python has no hard nesting limit for ifs, but the parser caps indentation depth (about 100 levels) and readers cap far sooner; there is no <code>switch</code> fall-through to flatten the structure.`,
            r`# Limitation: combining with 'and' is flat but loses separate messages
age, has_id = 17, True
if age >= 18 and has_id:
    print("allowed")
else:
    print("denied")       # cannot tell WHICH rule failed without extra tests

# OUTPUT:
# denied`],
        `
   if logged_in? ──No──────────────► deny
        │Yes
        ▼
   if is_admin? ──Yes──────────────► allow
        │No
        ▼
   if is_owner? ──Yes──► allow
        │No
        ▼
       deny
`,
        `Prefer guard clauses and small predicate functions (<code>is_owner(user, post)</code>) so each rule has a name and a unit test. More than about three levels of nesting is a design smell: extract functions, or model the rules as a data-driven table.`
    ),

    'for Loops & range()': dd(
        [`<code>for</code> walks over any <b>iterable</b> (list, string, dict, file, generator). <code>range(start, stop, step)</code> produces integers lazily: <code>stop</code> is excluded.`,
            r`for ch in "abc":                 # strings are iterable
    print(ch, end=" ")
print()
print(list(range(5)))              # 0..4
print(list(range(2, 10, 3)))       # start, stop, step
print(list(range(5, 0, -2)))       # counting down

# OUTPUT:
# a b c
# [0, 1, 2, 3, 4]
# [2, 5, 8]
# [5, 3, 1]`],
        [`Repeating work over a collection or a fixed count is the most common task in programming. Python's <code>for</code> avoids manual counters and index errors.`,
            r`prices = [120, 80, 45]
total = 0
for p in prices:                   # no index, no length arithmetic
    total += p
print("total:", total)
for i, p in enumerate(prices, start=1):   # when you also need a position
    print(i, p)

# OUTPUT:
# total: 245
# 1 120
# 2 80
# 3 45`],
        [`Processing files line by line, rows from a database, items in a shopping cart, pages of an API, and batches of a dataset all use <code>for</code>.`,
            r`# Real-time: process records in batches of 3
records = list(range(1, 9))
BATCH = 3
for start in range(0, len(records), BATCH):
    batch = records[start:start + BATCH]
    print("processing", batch)

# OUTPUT:
# processing [1, 2, 3]
# processing [4, 5, 6]
# processing [7, 8]`],
        [`<b>Advantages:</b> <code>range</code> uses constant memory (it is lazy), supports <code>len()</code>, indexing and <code>in</code>; loops work with any iterable; <code>for...else</code> detects "no break".`,
            r`# Advantage: range is lazy - a billion numbers cost almost nothing
big = range(1_000_000_000)
print(len(big), big[10], 999_999_999 in big)   # O(1) operations
import sys
print(sys.getsizeof(big))                      # small, fixed size

# OUTPUT:
# 1000000000 10 True
# 48`],
        [`<b>Disadvantages:</b> modifying a list while looping over it skips items; Python loops are slower than C; a loop variable leaks outside the loop.`,
            r`# Disadvantage: removing while iterating skips elements
nums = [1, 2, 2, 3]
for n in nums:
    if n == 2:
        nums.remove(n)
print(nums)                        # one 2 survived!
for i in range(2):
    pass
print("leaked loop variable:", i)

# OUTPUT:
# [1, 2, 3]
# leaked loop variable: 1`],
        [`<b>Limitations:</b> <code>range</code> accepts integers only (use <code>numpy.arange</code> or a generator for floats), step cannot be 0, and a one-shot iterator (generator) can be looped only once.`,
            r`# Limitation: range rejects floats and step 0
try:
    range(0, 1, 0.1)
except TypeError as e:
    print("TypeError:", e)
try:
    range(0, 5, 0)
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# TypeError: 'float' object cannot be interpreted as an integer
# ValueError: range() arg 3 must not be zero`],
        `
   iterable ──► iter() ──► iterator
                              │
              ┌───────────────┘
              ▼
        ┌─► next() ──► value ──► loop body ─┐
        │      │                            │
        └──────┼────────────────────────────┘
               ▼ StopIteration
            loop ends (else block runs)
`,
        `Iterate over items, not indexes; reach for <code>enumerate</code>, <code>zip</code> and comprehensions. For million-row or CPU-bound work move the loop into NumPy/pandas or a compiled library, and for huge streams use generators to keep memory flat.`
    ),

    'while Loops': dd(
        [`<code>while</code> repeats a block as long as its condition stays true. Use it when the number of repetitions is not known in advance. An optional <code>else</code> runs when the condition becomes false without a <code>break</code>.`,
            r`count = 3
while count > 0:
    print("countdown", count)
    count -= 1                     # must change state or the loop never ends
else:
    print("liftoff")

# OUTPUT:
# countdown 3
# countdown 2
# countdown 1
# liftoff`],
        [`Some repetition depends on a runtime event (user types a valid value, server answers, queue empties), not on a count. <code>for</code> cannot express that cleanly; <code>while</code> can.`,
            r`# Collatz sequence: length is unknown up front
n, steps = 6, 0
while n != 1:
    n = n // 2 if n % 2 == 0 else 3 * n + 1
    steps += 1
print("steps to reach 1:", steps)

# OUTPUT:
# steps to reach 1: 8`],
        [`Event loops, menu programs, polling a job until it is finished, reading from sockets, and game main loops are all <code>while</code> loops.`,
            r`# Real-time: poll a job until done (simulated)
statuses = iter(["queued", "running", "running", "done"])
status = next(statuses)
while status != "done":
    print("status:", status)
    status = next(statuses)        # in real code: call API, then sleep
print("job finished")

# OUTPUT:
# status: queued
# status: running
# status: running
# job finished`],
        [`<b>Advantages:</b> expresses condition-driven repetition directly; <code>while True</code> plus <code>break</code> gives a clean "loop and a half" (replacement for do-while).`,
            r`# Advantage: do-while pattern with while True + break
values = iter([-7, -2, 5])
while True:
    v = next(values)
    if v > 0:
        print("accepted", v)
        break                      # exit when valid
    print("rejected", v)

# OUTPUT:
# rejected -7
# rejected -2
# accepted 5`],
        [`<b>Disadvantages:</b> easy to write an infinite loop by forgetting to update the condition; state bookkeeping is manual; harder to read than a <code>for</code> when a collection exists.`,
            r`# Disadvantage: forgot to update i => infinite loop. Guard with a limit.
i, guard = 0, 0
while i < 3:
    guard += 1
    if guard > 5:                  # safety net for demonstration
        print("would loop forever: i never changes, i =", i)
        break

# OUTPUT:
# would loop forever: i never changes, i = 0`],
        [`<b>Limitations:</b> floating-point conditions may never become exactly equal, and a blocking <code>while</code> freezes the program (use threads, asyncio or sleeps with timeouts).`,
            r`# Limitation: float accumulation never hits exactly 1.0
x, loops = 0.0, 0
while loops < 10:                  # a "while x != 1.0" test would never be reliable
    x += 0.1
    loops += 1
print(loops, x)
print("exactly 1.0?", x == 1.0)
print("close enough?", abs(x - 1.0) < 1e-9)   # use a tolerance instead

# OUTPUT:
# 10 0.9999999999999999
# exactly 1.0? False
# close enough? True`],
        `
         ┌──────────────────┐
   ┌────►│ condition true?  │
   │     └───┬──────────┬───┘
   │     Yes │          │ No
   │         ▼          ▼
   │   ┌───────────┐  else block
   │   │ body      │      │
   │   │ (update!) │      ▼
   │   └─────┬─────┘   after loop
   └─────────┘
`,
        `Every <code>while</code> needs a clear termination argument: a changing variable, a timeout, or a max-attempts cap. In services prefer bounded loops with backoff and deadlines; for concurrency-heavy waits use <code>asyncio</code> or event callbacks rather than busy polling.`
    ),

    'break, continue & pass': dd(
        [`<code>break</code> leaves the nearest loop immediately; <code>continue</code> skips to the next iteration; <code>pass</code> does nothing and is a placeholder where a statement is required.`,
            r`for n in range(1, 8):
    if n == 3:
        continue                   # skip 3
    if n == 6:
        break                      # stop at 6
    print(n, end=" ")
print()

def todo():
    pass                           # empty body is legal

# OUTPUT:
# 1 2 4 5`],
        [`Loops often need exceptions to the normal path: stop when found, skip invalid items, or reserve space for code written later. These keywords avoid deep nesting and extra flags.`,
            r`# Search: stop as soon as the answer is found
names = ["abaji", "raoji", "moropant", "kanhoji"]
for i, name in enumerate(names):
    if name == "moropant":
        print("found at", i)
        break
else:
    print("not found")            # only when the loop was never broken

# OUTPUT:
# found at 2`],
        [`Parsers skip comment lines with <code>continue</code>, search routines break on first match, and class skeletons or abstract stubs use <code>pass</code> in early design.`,
            r`# Real-time: skip blank and comment lines of a config file
lines = ["# settings", "port=8080", "", "debug=true"]
config = {}
for line in lines:
    if not line or line.startswith("#"):
        continue
    key, value = line.split("=")
    config[key] = value
print(config)

# OUTPUT:
# {'port': '8080', 'debug': 'true'}`],
        [`<b>Advantages:</b> flatten logic (guard-style <code>continue</code>), save work by exiting early, and let you stub code that is not ready yet.`,
            r`# Advantage: early exit saves work
def first_negative(nums):
    for n in nums:
        if n < 0:
            return n               # return also leaves every loop
    return None

print(first_negative([4, 9, -3, 7, 1_000_000]))

# OUTPUT:
# -3`],
        [`<b>Disadvantages:</b> overuse creates "jumpy" logic that is hard to follow; <code>continue</code> in a <code>while</code> before the update statement causes infinite loops.`,
            r`# Disadvantage: continue skipped the increment => never ends (capped here)
i, guard = 0, 0
while i < 5 and guard < 4:
    guard += 1
    if i == 2:
        continue                   # i is never incremented again
    i += 1
print("stuck at i =", i)

# OUTPUT:
# stuck at i = 2`],
        [`<b>Limitations:</b> <code>break</code>/<code>continue</code> affect only the innermost loop and are not allowed outside loops; <code>pass</code> is a no-op that silently hides unfinished work.`,
            r`# Limitation: break outside a loop is a SyntaxError (caught here via compile)
try:
    compile("if True:\n    break", "demo", "exec")
except SyntaxError as e:
    print("SyntaxError:", e.msg)

# OUTPUT:
# SyntaxError: 'break' outside loop`],
        `
   for item in data:
        │
        ├── bad item?  ──► continue ──┐ (next item)
        │                             │
        ├── found?     ──► break ──────────► after loop
        │                             │
        └── process(item)             │
              └─────────◄─────────────┘
`,
        `Use <code>continue</code> as a guard to cut nesting and <code>break</code> with loop-<code>else</code> for searches, but prefer a function with <code>return</code> when logic grows. Never leave bare <code>pass</code> in production error handlers: it swallows failures; log or raise instead.`
    ),

    'match/case': dd(
        [`<code>match</code> (Python 3.10+) is <b>structural pattern matching</b>: it compares a value against patterns (literals, sequences, mappings, class shapes), can bind variables from the pattern, and supports guards with <code>if</code>. <code>_</code> is the wildcard.`,
            r`def http(status):
    match status:
        case 200:
            return "OK"
        case 301 | 302:            # OR pattern
            return "Redirect"
        case 404:
            return "Not Found"
        case _:                    # wildcard default
            return "Other"

print(http(200), http(302), http(999))

# OUTPUT:
# OK Redirect Other`],
        [`Long if/elif chains that test one value, or that pull data out of tuples and dicts, get noisy. <code>match</code> states "what shape is this?" and extracts the parts in the same step.`,
            r`# Destructuring a command in one step
def run(cmd):
    match cmd.split():
        case ["go", direction]:
            return f"moving {direction}"
        case ["pick", item, "from", place]:
            return f"taking {item} from {place}"
        case ["quit"]:
            return "bye"
        case _:
            return "unknown command"

print(run("go north"))
print(run("pick key from table"))

# OUTPUT:
# moving north
# taking key from table`],
        [`Used for command parsers, protocol and message handlers, interpreters and compilers (AST nodes), and routing JSON events by their shape.`,
            r`# Real-time: route JSON-like events by shape
def handle(event):
    match event:
        case {"type": "click", "x": x, "y": y}:
            return f"click at {x},{y}"
        case {"type": "key", "key": k} if k.isalpha():   # guard
            return f"letter {k}"
        case {"type": "key"}:
            return "other key"
        case _:
            return "ignored"

print(handle({"type": "click", "x": 3, "y": 9}))
print(handle({"type": "key", "key": "a"}))
print(handle({"type": "key", "key": "5"}))

# OUTPUT:
# click at 3,9
# letter a
# other key`],
        [`<b>Advantages:</b> readable dispatch, destructuring of sequences, mappings and dataclasses, guards, and mappings that ignore extra keys.`,
            r`from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

def where(p):
    match p:
        case Point(x=0, y=0):
            return "origin"
        case Point(x=0, y=y):
            return f"on y-axis at {y}"
        case Point():
            return "somewhere else"

print(where(Point(0, 0)), "|", where(Point(0, 5)), "|", where(Point(2, 2)))

# OUTPUT:
# origin | on y-axis at 5 | somewhere else`],
        [`<b>Disadvantages:</b> needs Python 3.10+; a bare name in a pattern is a <b>capture</b>, not a comparison, which surprises newcomers; no fall-through like C switch.`,
            r`# Disadvantage: a bare name CAPTURES, it does not compare
RED = "red"
def check(colour):
    match colour:
        case RED:                  # captures anything and rebinds RED!
            return "matched RED"
    return "no match"

print(check("blue"))               # surprising: matches

class Colour:                      # fix: use a dotted name (value pattern)
    RED = "red"
def check2(colour):
    match colour:
        case Colour.RED:
            return "red"
        case _:
            return "other"
print(check2("blue"))

# OUTPUT:
# matched RED
# other`],
        [`<b>Limitations:</b> patterns are checked top to bottom (no jump table, so not O(1)); irrefutable patterns must be last (SyntaxError otherwise); not available on Python 3.9 or older.`,
            r`# Limitation: an irrefutable case before others is rejected at compile time
try:
    compile("match x:\n    case y:\n        pass\n    case 1:\n        pass", "d", "exec")
except SyntaxError as e:
    print("SyntaxError:", e.msg)

# OUTPUT:
# SyntaxError: name capture 'y' makes remaining patterns unreachable`],
        `
   subject ──► case pattern 1 ── match? ─Yes─► bind names ─► guard? ─► run
                     │No
                     ▼
               case pattern 2 ── match? ─Yes─► ...
                     │No
                     ▼
               case _  (wildcard) ───────────► default
`,
        `Use <code>match</code> for shape-driven dispatch (messages, ASTs, state machines); keep simple value lookups as a dict. Libraries supporting older Pythons cannot use it. Because order matters and captures are subtle, cover each match with tests and finish with an explicit <code>case _</code>.`
    ),
};
