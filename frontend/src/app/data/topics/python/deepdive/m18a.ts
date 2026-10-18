// Module 18 (Debugging & Logging).
import { dd, r, type DeepDive } from './deepDive';

export const m18a: Record<string, DeepDive> = {
    'print() Debugging': dd(
        [`<b>print debugging</b> means inserting <code>print()</code> calls to see variable values and which branches run. It is the fastest first tool because it needs no setup.`,
            r`def average(nums):
    total = sum(nums)
    print("DEBUG total =", total, "count =", len(nums))   # inspect state
    return total / len(nums)

print(average([4, 6, 8]))

# OUTPUT:
# DEBUG total = 18 count = 3
# 6.0`],
        [`When a result is wrong you must see what the program actually did, not what you believe it did. Printing intermediate values narrows the search to the line where reality and expectation diverge.`,
            r`def discount(price, pct):
    result = price - price * pct       # BUG: pct is 10, not 0.10
    print(f"{price=} {pct=} {result=}")  # f"{x=}" prints name and value
    return result

discount(200, 10)

# OUTPUT:
# price=200 pct=10 result=-1800`],
        [`Quick checks in scripts, notebooks and CI logs. Better habits: <code>repr()</code> via <code>!r</code> to reveal hidden whitespace, <code>file=sys.stderr</code> to keep stdout clean, and <code>pprint</code> for nested data.`,
            r`import sys
from pprint import pprint

name = "Abaji "                       # trailing space is invisible with plain print
print(f"name={name!r}")              # repr shows quotes and spaces
print("diagnostic", file=sys.stderr) # separate stream from real output
pprint({"user": {"id": 1, "tags": ["a", "b"]}}, width=30)

# OUTPUT (stdout):
# name='Abaji '
# {'user': {'id': 1,
#           'tags': ['a', 'b']}}`],
        [`<b>Advantages:</b> zero setup, works everywhere (servers, containers, notebooks), shows the actual runtime flow, and needs no tool knowledge.`,
            r`def collatz(n):
    steps = 0
    while n != 1:
        n = n // 2 if n % 2 == 0 else 3 * n + 1
        steps += 1
        print(f"  step {steps}: n={n}")
    return steps

print("steps:", collatz(6))

# OUTPUT:
#   step 1: n=3
#   step 2: n=10
#   step 3: n=5
#   step 4: n=16
#   step 5: n=8
#   step 6: n=4
#   step 7: n=2
#   step 8: n=1
# steps: 8`],
        [`<b>Disadvantages:</b> you must edit code and re-run, forgotten prints reach production, output floods for loops, and there is no level/timestamp control. Use logging for anything permanent.`,
            r`import io, contextlib

buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    print("debug leftover")           # a stray print corrupts program output
    print('{"ok": true}')             # intended JSON response

print(repr(buf.getvalue()))           # consumer now gets invalid JSON

# OUTPUT:
# 'debug leftover\n{"ok": true}\n'`],
        [`<b>Limitations:</b> printing changes timing (hides race conditions), buffering can reorder output relative to stderr, it cannot pause or change state, and printing big objects can itself be slow or trigger side effects in <code>__repr__</code>.`,
            r`import sys
print("to stdout")                    # buffered when piped
print("to stderr", file=sys.stderr)   # unbuffered
sys.stdout.flush()                    # fix: flush or run python -u

# When piped to a file, stderr text can appear BEFORE earlier stdout text.

# OUTPUT (order may differ when redirected):
# to stdout
# to stderr`],
        `
   suspect code ──► insert print() ──► run ──► read output
        ▲                                         │
        └────── narrow down, move prints ◄────────┘
   finished? remove prints / switch to logging
`,
        `Treat print as a scratchpad, never as a diagnostic strategy for services: use structured logging with levels and correlation ids, and add a linter rule (flake8 T201) to block stray prints. For hard-to-reproduce bugs prefer a debugger, tracing or a failing test.`
    ),

    'Reading Stack Traces': dd(
        [`A <b>traceback</b> lists the chain of calls that led to an exception, oldest call first and the failing line last, followed by the exception type and message. Read it from the bottom up.`,
            r`def c(): return 1 / 0
def b(): return c()
def a(): return b()

try:
    a()
except ZeroDivisionError:
    import traceback
    traceback.print_exc()

# OUTPUT (abridged):
# Traceback (most recent call last):
#   File "x.py", line 6, in <module>
#     a()
#   File "x.py", line 3, in a
#     def a(): return b()
#   File "x.py", line 2, in b
#     def b(): return c()
#   File "x.py", line 1, in c
#     def c(): return 1 / 0
# ZeroDivisionError: division by zero`],
        [`Most debugging time is wasted guessing. The traceback already tells you the exception type, the exact file and line, and the path taken, so reading it well finds many bugs in seconds.`,
            r`data = {"name": "Abaji"}
try:
    print(data["age"])
except KeyError as e:
    print("type   :", type(e).__name__)
    print("missing:", e)          # message names the missing key
    print("line   :", e.__traceback__.tb_lineno)

# OUTPUT:
# type   : KeyError
# missing: 'age'
# line   : 3`],
        [`Production logs contain tracebacks; on-call engineers triage by the last frame in <i>your</i> code, not the library frames. Chained exceptions (<code>raise ... from</code>) show the root cause.`,
            r`import traceback

def load():
    try:
        int("abc")
    except ValueError as e:
        raise RuntimeError("config invalid") from e   # keeps the original cause

try:
    load()
except RuntimeError:
    lines = traceback.format_exc().splitlines()
    print([l for l in lines if "direct cause" in l])

# OUTPUT:
# ['The above exception was the direct cause of the following exception:']`],
        [`<b>Advantages:</b> exact location, full call path, exception type plus message, and since Python 3.11 precise <code>^^^^</code> markers show which sub-expression failed.`,
            r`import traceback, sys

def f(d): return d["a"]["b"]       # which lookup failed?

try:
    f({"a": {}})
except KeyError:
    tb = traceback.extract_tb(sys.exc_info()[2])[-1]
    print(tb.name, tb.lineno, repr(tb.line))

# OUTPUT:
# f 3 'def f(d): return d["a"]["b"]'`],
        [`<b>Disadvantages:</b> long recursive or framework tracebacks are noisy, the failing line may only be a symptom of earlier bad data, and swallowed exceptions leave no trace at all.`,
            r`def run():
    try:
        return 1 / 0
    except Exception:
        pass                     # silent failure: no traceback, no clue

print(run())                     # returns None and nobody knows why

# OUTPUT:
# None`],
        [`<b>Limitations:</b> a traceback shows where the error surfaced, not where wrong data was created; async/thread tracebacks lose the originating caller, and local variable values are not included by default.`,
            r`import traceback

def f():
    x = 41
    raise ValueError("bad")

try:
    f()
except ValueError as e:
    te = traceback.TracebackException.from_exception(e, capture_locals=True)
    print(any("x = 41" in line for line in te.format()))   # locals need opt-in

# OUTPUT:
# True`],
        `
   Traceback (most recent call last):       oldest call (entry point)
     File "app.py", line 20, in main        │
       run()                                ▼
     File "app.py", line 12, in run         calls go down
       parse(x)                             │
     File "app.py", line  5, in parse       ▼
       return int(s)                        failing line  <-- start here
   ValueError: invalid literal for int()    exception type + message (last line)
`,
        `Log tracebacks with logger.exception so they land in your aggregator with context, never swallow broad exceptions, and use raise ... from to preserve causality. Add error-tracking (Sentry) that captures local variables for production-only failures.`
    ),

    'pdb & Breakpoints': dd(
        [`<b>pdb</b> is Python's built-in interactive debugger. Calling <code>breakpoint()</code> (3.7+) pauses the program at that line and gives a prompt where you can inspect and step through code.`,
            r`def total(prices):
    s = 0
    for p in prices:
        breakpoint()          # program stops here; type commands at (Pdb)
        s += p
    return s

# (Pdb) p p        -> print the variable
# (Pdb) n          -> next line
# (Pdb) c          -> continue
# Disable all breakpoints: set PYTHONBREAKPOINT=0
print("function defined, not called")

# OUTPUT:
# function defined, not called`],
        [`Printing guesses is slow. A debugger lets you stop at the exact moment, look at every variable, evaluate expressions and move line by line, without editing code for each question.`,
            r`# Post-mortem: debug AFTER a crash with  python -m pdb script.py
# or from code:
import pdb, sys

def crash():
    return {}["missing"]

try:
    crash()
except KeyError:
    tb = sys.exc_info()[2]
    # pdb.post_mortem(tb)    # would open (Pdb) in the crashed frame
    print("frame variables available at:", tb.tb_next.tb_frame.f_code.co_name)

# OUTPUT:
# frame variables available at: crash`],
        [`Common commands: <code>l</code> list source, <code>n</code> next, <code>s</code> step into, <code>r</code> return, <code>b 42</code> set breakpoint, <code>w</code> where (stack), <code>u/d</code> up/down frames, <code>!expr</code> run code. IDEs (VS Code, PyCharm) wrap the same idea.`,
            r`# Scripted pdb session (stdin simulated) so it runs without a human
import pdb, io, sys

def f(x):
    y = x * 2
    return y

cmds = io.StringIO("p x\nn\np y\nc\n")
dbg = pdb.Pdb(stdin=cmds, stdout=sys.stdout)
dbg.use_rawinput = False
dbg.runcall(f, 21)

# OUTPUT (abridged):
# > <string>(4)f()
# (Pdb) 21
# (Pdb) > ...(5)f()
# (Pdb) 42`],
        [`<b>Advantages:</b> built-in, works over SSH and in containers, inspect and change live state, conditional breakpoints (<code>b 10, x &gt; 5</code>), post-mortem on crashes.`,
            r`import pdb
# Conditional breakpoint logic, shown as the equivalent plain code:
for i in range(5):
    if i == 3:
        # breakpoint()     # would stop only when i == 3
        print("would pause at i =", i)

# OUTPUT:
# would pause at i = 3`],
        [`<b>Disadvantages:</b> command-line UX is terse, awkward for async/multi-thread programs, and a forgotten <code>breakpoint()</code> hangs a server waiting for input.`,
            r`import os
# Safe guard: let operations disable debugger stops in production images
os.environ["PYTHONBREAKPOINT"] = "0"       # breakpoint() becomes a no-op
breakpoint()
print("continued without stopping")

# OUTPUT:
# continued without stopping`],
        [`<b>Limitations:</b> it freezes the process (not suitable for latency-sensitive prod), needs a terminal, cannot step back in time, and optimised or C-extension code cannot be stepped into.`,
            r`import pdb, sys
# pdb cannot step inside C functions:
# (Pdb) s on  sum([1,2,3])   executes sum as ONE step - you never see its inside.
print(sum.__module__ if hasattr(sum, "__module__") else "builtin")

# OUTPUT:
# builtins`],
        `
   program running ──► breakpoint() ──► (Pdb) prompt
                                          │  p var   inspect
                                          │  n / s   step over / into
                                          │  w / u   stack navigation
                                          └─ c ──► program resumes
`,
        `Use pdb (or remote debuggers like debugpy) for local and staging investigation; in production prefer logging, tracing and core-dump style post-mortems that do not stop the process. Remove breakpoints in CI via a pre-commit check and set PYTHONBREAKPOINT=0 in production images.`
    ),

    'logging Basics & Log Levels': dd(
        [`The <b>logging</b> module records events with a severity <b>level</b>: DEBUG (10), INFO (20), WARNING (30), ERROR (40), CRITICAL (50). Only records at or above the logger's level are emitted.`,
            r`import logging
logging.basicConfig(level=logging.DEBUG, format="%(levelname)s:%(name)s:%(message)s")

log = logging.getLogger("app")
log.debug("detail for developers")
log.info("service started")
log.warning("disk 85% full")
log.error("payment failed")

# OUTPUT (stderr):
# DEBUG:app:detail for developers
# INFO:app:service started
# WARNING:app:disk 85% full
# ERROR:app:payment failed`],
        [`print has no severity, timestamp, destination or on/off switch. Logging lets you keep diagnostics in the code permanently and turn verbosity up or down by configuration without editing source.`,
            r`import logging
logging.basicConfig(level=logging.WARNING, format="%(levelname)s %(message)s")
log = logging.getLogger("svc")

log.debug("hidden")             # below WARNING -> dropped
log.info("hidden too")
log.warning("shown")

# OUTPUT:
# WARNING shown`],
        [`Services use INFO for business events, WARNING for recoverable oddities, ERROR for failed operations, and <code>logger.exception</code> inside <code>except</code> to attach the traceback. Use lazy <code>%s</code> arguments.`,
            r`import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("orders")

order_id = 42
log.info("processing order %s", order_id)    # formatted only if emitted (lazy)
try:
    1 / 0
except ZeroDivisionError:
    log.exception("order %s failed", order_id)  # ERROR + traceback

# OUTPUT (abridged):
# INFO processing order 42
# ERROR order 42 failed
# Traceback (most recent call last): ...
# ZeroDivisionError: division by zero`],
        [`<b>Advantages:</b> levels, hierarchical loggers (<code>app.db</code> inherits from <code>app</code>), per-module control, lazy formatting, thread-safe, and the library standard so third-party code logs through it.`,
            r`import logging
logging.basicConfig(level=logging.INFO, format="%(name)s %(message)s")

logging.getLogger("app.db").setLevel(logging.DEBUG)       # noisy only for db
logging.getLogger("app.db").debug("query ran")
logging.getLogger("app.web").debug("request")             # dropped (parent INFO)
logging.getLogger("app.web").info("GET /")

# OUTPUT:
# app.db query ran
# app.web GET /`],
        [`<b>Disadvantages:</b> configuration is verbose and has gotchas (basicConfig only works once, handlers duplicate), and the %-style API feels dated.`,
            r`import logging
logging.basicConfig(level=logging.INFO, format="first %(message)s")
logging.basicConfig(level=logging.DEBUG, format="second %(message)s")  # IGNORED
logging.info("hello")

# OUTPUT:
# first hello`],
        [`<b>Limitations:</b> the stdlib has no built-in JSON/structured output or async-safe shipping (use QueueHandler), and logging inside signal handlers or __del__ can deadlock.`,
            r`import logging
log = logging.getLogger("lib")
print(log.getEffectiveLevel() == logging.WARNING)   # no config -> root default WARNING
log.info("lost")                                    # silently dropped
print(logging.getLevelName(25) )                    # custom numbers have no name

# OUTPUT:
# True
# Level 25`],
        `
   logger.info("msg") ──► logger level check ──► Handler(s) ──► Formatter ──► destination
        │                    (>= INFO ?)        (own level)    (template)    console/file
        └── hierarchy:  root ─► app ─► app.db   (child propagates to parent handlers)
`,
        `Libraries should only create loggers (and add a NullHandler); applications configure handlers once at startup via dictConfig. For services emit structured JSON with request ids, ship asynchronously via QueueHandler, and make levels environment-configurable. Never log secrets or personal data.`
    ),

    'Handlers & Formatters': dd(
        [`A <b>Handler</b> decides where a log record goes (console, file, socket, email); a <b>Formatter</b> decides how it looks. A logger can have many handlers, each with its own level and format.`,
            r`import logging, sys

log = logging.getLogger("demo")
log.setLevel(logging.DEBUG)

h = logging.StreamHandler(sys.stdout)                     # destination
h.setFormatter(logging.Formatter("%(levelname)-7s | %(message)s"))  # layout
log.addHandler(h)

log.info("hello")
log.error("boom")

# OUTPUT:
# INFO    | hello
# ERROR   | boom`],
        [`Different audiences need different views: developers want DEBUG on the console, operators want WARNING+ in a file, on-call wants ERROR by email. Handlers separate those routes.`,
            r`import logging, sys, io

log = logging.getLogger("multi"); log.setLevel(logging.DEBUG)
console = logging.StreamHandler(sys.stdout); console.setLevel(logging.DEBUG)
fbuf = io.StringIO()
filelike = logging.StreamHandler(fbuf);    filelike.setLevel(logging.ERROR)
log.addHandler(console); log.addHandler(filelike)

log.debug("detail"); log.error("bad")
print("file got:", fbuf.getvalue().strip())

# OUTPUT:
# detail
# bad
# file got: bad`],
        [`Real setups: console + <code>FileHandler</code>, <code>SMTPHandler</code>/<code>HTTPHandler</code> for alerts, JSON formatters for log platforms, and <code>logging.config.dictConfig</code> to declare everything in one dict.`,
            r`import logging, logging.config

logging.config.dictConfig({
    "version": 1,
    "formatters": {"std": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
                           "datefmt": "%H:%M:%S"}},
    "handlers": {"console": {"class": "logging.StreamHandler",
                             "formatter": "std", "level": "INFO"}},
    "root": {"level": "INFO", "handlers": ["console"]},
})
logging.getLogger("api").info("ready")

# OUTPUT (example):
# 14:03:07 INFO api: ready`],
        [`<b>Advantages:</b> decoupled destinations, per-handler levels and filters, custom Formatter subclasses (JSON), reusable config, and handlers for many transports.`,
            r`import logging, json, sys

class JsonFormatter(logging.Formatter):
    def format(self, rec):
        return json.dumps({"level": rec.levelname, "msg": rec.getMessage(),
                           "logger": rec.name})

h = logging.StreamHandler(sys.stdout); h.setFormatter(JsonFormatter())
log = logging.getLogger("j"); log.addHandler(h); log.setLevel(logging.INFO)
log.info("user %s logged in", "abaji")

# OUTPUT:
# {"level": "INFO", "msg": "user abaji logged in", "logger": "j"}`],
        [`<b>Disadvantages:</b> adding a handler twice duplicates every line, propagation to the root logger causes double output, and misconfigured handlers fail silently.`,
            r`import logging, sys

def get():
    lg = logging.getLogger("dup"); lg.setLevel(logging.INFO)
    lg.addHandler(logging.StreamHandler(sys.stdout))   # added on EVERY call
    return lg

get(); get().info("once?")          # printed twice!

# OUTPUT:
# once?
# once?`],
        [`<b>Limitations:</b> handlers run synchronously in the calling thread (slow sinks block your request), emit failures are swallowed unless <code>logging.raiseExceptions</code>, and file handlers are not safe across multiple processes.`,
            r`import logging, logging.handlers, queue

q = queue.Queue()
qh = logging.handlers.QueueHandler(q)              # non-blocking hand-off
log = logging.getLogger("async"); log.addHandler(qh); log.setLevel(logging.INFO)
log.info("queued")

listener = logging.handlers.QueueListener(q, logging.StreamHandler())
listener.start(); listener.stop()                  # worker thread does slow I/O

# OUTPUT (stderr):
# queued`],
        `
   LogRecord ──► Logger ──► Handler A ──► Formatter A ──► console
                    │
                    ├────► Handler B ──► Formatter B ──► app.log   (level >= ERROR)
                    └────► Handler C ──► Formatter C ──► SMTP/HTTP (CRITICAL)
`,
        `Configure logging in exactly one place (dictConfig) and keep libraries handler-free. For high throughput move slow handlers behind QueueHandler/QueueListener, emit structured JSON for aggregation, and in containers simply log to stdout and let the platform ship it.`
    ),

    'Rotating Logs': dd(
        [`<b>Rotating log handlers</b> stop log files from growing forever. <code>RotatingFileHandler</code> rolls over by size; <code>TimedRotatingFileHandler</code> by time (midnight, hourly). Old files get suffixes like <code>app.log.1</code>.`,
            r`import logging, logging.handlers, os, tempfile

path = os.path.join(tempfile.mkdtemp(), "app.log")
h = logging.handlers.RotatingFileHandler(path, maxBytes=200, backupCount=2)
log = logging.getLogger("rot"); log.setLevel(logging.INFO); log.addHandler(h)

for i in range(20):
    log.info("message number %d", i)

h.close()
print(sorted(os.listdir(os.path.dirname(path))))

# OUTPUT:
# ['app.log', 'app.log.1', 'app.log.2']`],
        [`A busy service can write gigabytes per day; one unbounded file fills the disk and crashes the host. Rotation caps disk use and keeps recent history easy to find.`,
            r`import logging.handlers, os, tempfile, logging

d = tempfile.mkdtemp(); p = os.path.join(d, "x.log")
h = logging.handlers.RotatingFileHandler(p, maxBytes=100, backupCount=1)
lg = logging.getLogger("cap"); lg.addHandler(h); lg.setLevel(logging.INFO)
for i in range(100): lg.info("line %03d", i)
h.close()
total = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d))
print("bounded:", total < 400)          # about maxBytes * (backupCount + 1)

# OUTPUT:
# bounded: True`],
        [`Servers typically use daily rotation with 7-30 backups (<code>when="midnight", backupCount=14</code>), compress old files via a <code>namer</code>/<code>rotator</code>, or delegate to the OS tool <code>logrotate</code>.`,
            r`import logging.handlers, tempfile, os

p = os.path.join(tempfile.mkdtemp(), "daily.log")
h = logging.handlers.TimedRotatingFileHandler(p, when="midnight",
                                              backupCount=14, encoding="utf-8")
print(h.when, h.backupCount, h.interval)    # rolls at midnight, keeps 14 days
h.close()

# OUTPUT:
# MIDNIGHT 14 86400`],
        [`<b>Advantages:</b> bounded disk use, automatic cleanup, no extra tools, simple configuration, readable recent history.`,
            r`import logging, logging.handlers, tempfile, os

p = os.path.join(tempfile.mkdtemp(), "keep.log")
h = logging.handlers.RotatingFileHandler(p, maxBytes=60, backupCount=3)
lg = logging.getLogger("keep"); lg.setLevel(logging.INFO); lg.addHandler(h)
for i in range(30): lg.info("event %02d", i)
h.close()
print(len(os.listdir(os.path.dirname(p))), "files (current + 3 backups)")

# OUTPUT:
# 4 files (current + 3 backups)`],
        [`<b>Disadvantages:</b> oldest data is silently deleted, a record larger than maxBytes still gets written, and rotation happens inside the logging call (small latency spike).`,
            r`import logging, logging.handlers, tempfile, os

p = os.path.join(tempfile.mkdtemp(), "lost.log")
h = logging.handlers.RotatingFileHandler(p, maxBytes=50, backupCount=1)
lg = logging.getLogger("lost"); lg.setLevel(logging.INFO); lg.addHandler(h)
for i in range(10): lg.info("record %d", i)
h.close()
print(open(p + ".1").read().count("record") < 10)   # early records are gone

# OUTPUT:
# True`],
        [`<b>Limitations:</b> not safe when several processes rotate the same file (on Windows, rename fails with PermissionError); use one writer, SocketHandler/QueueHandler to a single process, or an external logrotate.`,
            r`# Multi-process safe pattern: workers send records to ONE listener process.
import logging, logging.handlers, multiprocessing as mp

def worker(q):
    lg = logging.getLogger("w"); lg.addHandler(logging.handlers.QueueHandler(q))
    lg.setLevel(logging.INFO); lg.info("from worker")

if __name__ == "__main__":
    q = mp.Queue()
    ls = logging.handlers.QueueListener(q, logging.StreamHandler())   # owns the file
    ls.start()
    p = mp.Process(target=worker, args=(q,)); p.start(); p.join()
    ls.stop()

# OUTPUT (stderr):
# from worker`],
        `
   log.info() ─► RotatingFileHandler ──► app.log   (current)
                       │  size > maxBytes ?
                       ▼  rollover
          app.log.2 ◄─ app.log.1 ◄─ app.log      (oldest .N deleted)
`,
        `In containers and Kubernetes skip file rotation: write to stdout and let the platform collect and rotate. On VMs prefer logrotate with copytruncate or a single-writer queue, size retention against disk and compliance needs, and alert on log volume spikes rather than letting rotation hide them.`
    )
};
