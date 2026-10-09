// Module 7 (File Handling): all topics.
import { dd, r, type DeepDive } from './deepDive';

export const m07a: Record<string, DeepDive> = {
    'Opening Files': dd(
        [`<code>open(path, mode)</code> asks the operating system for a file handle and returns a file object. Modes: <code>r</code> read, <code>w</code> write (truncates), <code>a</code> append, <code>x</code> create-only, plus <code>b</code> binary and <code>+</code> read/write.`,
            r`f = open("demo.txt", "w", encoding="utf-8")   # create / overwrite
print(f.name, f.mode, f.closed)
f.write("hello\n")
f.close()                                       # always release the handle
print(f.closed)

# OUTPUT:
# demo.txt w False
# True`],
        [`Variables vanish when the program ends. Files let data survive, be shared between programs, and be larger than memory.`,
            r`# Data written now can be read by a completely different run
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("remember me")
with open("notes.txt", encoding="utf-8") as f:     # default mode is "r"
    print(f.read())

# OUTPUT:
# remember me`],
        [`Logs, configuration, exports, uploads, caches and data-science inputs are all files opened every day.`,
            r`# Typical log appender: "a" adds to the end, never erases
import datetime
with open("app.log", "a", encoding="utf-8") as log:
    log.write("started\n")
with open("app.log", encoding="utf-8") as log:
    print(len(log.readlines()) >= 1)

# OUTPUT:
# True`],
        [`<b>Advantages:</b> one simple API for text and binary, buffered for speed, the <code>x</code> mode gives atomic "create only if absent".`,
            r`import os
with open("once.txt", "x") as f:       # fails if the file already exists
    f.write("first")
try:
    open("once.txt", "x")
except FileExistsError:
    print("refused to overwrite")
os.remove("once.txt")

# OUTPUT:
# refused to overwrite`],
        [`<b>Disadvantages:</b> mode <code>w</code> destroys existing content instantly, forgetting <code>close()</code> leaks handles, and the default encoding depends on the OS.`,
            r`with open("keep.txt", "w") as f:
    f.write("important data")
with open("keep.txt", "w") as f:       # opened for write: content erased immediately
    pass
print(repr(open("keep.txt").read()))

# OUTPUT:
# ''`],
        [`<b>Limitations:</b> a missing file or directory raises FileNotFoundError, permissions can raise PermissionError, and OS limits on open handles exist.`,
            r`try:
    open("no_folder/none.txt")
except FileNotFoundError as e:
    print("FileNotFoundError:", e.strerror)

# OUTPUT:
# FileNotFoundError: No such file or directory`],
        `
   your code --open("a.txt","w")--> Python file object --buffer--> OS --> disk
        ^                                |
        +-------- read()/write() --------+      close() flushes buffer, frees handle
`,
        `Always pass encoding explicitly (utf-8) for portable behaviour and prefer pathlib for paths. For crash-safe updates write to a temp file then os.replace() it over the original instead of truncating in place.`
    ),

    'Reading, Writing & Appending': dd(
        [`Reading: <code>read()</code> (whole), <code>readline()</code> (one line), <code>readlines()</code> (list). Writing: <code>write()</code>, <code>writelines()</code>. Appending uses mode <code>a</code>.`,
            r`with open("poem.txt", "w", encoding="utf-8") as f:
    f.write("line one\n")
    f.writelines(["line two\n", "line three\n"])   # no newlines added for you
with open("poem.txt", "a", encoding="utf-8") as f:
    f.write("line four\n")                           # appended at the end

with open("poem.txt", encoding="utf-8") as f:
    print(f.readline().strip())     # first line only
    print(f.read().count("\n"))     # remaining lines

# OUTPUT:
# line one
# 3`],
        [`Different tasks need different read styles: a tiny config can be slurped, a 20 GB log must be streamed line by line.`,
            r`# Iterating a file reads lazily - constant memory
count = 0
with open("poem.txt", encoding="utf-8") as f:
    for line in f:                  # one line at a time
        count += 1
print("lines:", count)

# OUTPUT:
# lines: 4`],
        [`Log scanning, CSV-less data dumps, report generation and appending audit records are classic uses.`,
            r`# Find error lines in a log without loading it all
with open("big.log", "w") as f:
    f.write("INFO a\nERROR b\nINFO c\nERROR d\n")
with open("big.log") as f:
    errors = [ln.rstrip() for ln in f if "ERROR" in ln]
print(errors)

# OUTPUT:
# ['ERROR b', 'ERROR d']`],
        [`<b>Advantages:</b> <code>seek()</code>/<code>tell()</code> allow random access; iteration is memory-friendly.`,
            r`with open("poem.txt", encoding="utf-8") as f:
    f.seek(5)                       # jump to char offset 5
    print(f.read(3))                # 'one'
    print(f.tell())                 # position after reading
    f.seek(0)                       # rewind
    print(f.readline().strip())

# OUTPUT:
# one
# 8
# line one`],
        [`<b>Disadvantages:</b> <code>read()</code> on a huge file can exhaust memory; write does not add newlines; text mode translates line endings.`,
            r`with open("nl.txt", "w") as f:
    f.write("a")
    f.write("b")                    # no newline added
    f.write("c\n")
print(open("nl.txt").read().strip())

# OUTPUT:
# abc`],
        [`<b>Limitations:</b> a file opened with <code>r</code> cannot be written and vice versa; reading text after an exhausted read returns an empty string.`,
            r`with open("poem.txt", encoding="utf-8") as f:
    f.read()
    print(repr(f.read()))           # already at end of file
    try:
        f.write("x")
    except Exception as e:
        print(type(e).__name__, e)

# OUTPUT:
# ''
# UnsupportedOperation not writable`],
        `
   mode  read  write  truncate  create  pointer starts
    r     yes   no     no        no      start
    w     no    yes    YES       yes     start
    a     no    yes    no        yes     END
    r+    yes   yes    no        no      start
`,
        `Stream, never slurp, anything whose size you do not control; for appends from several processes use one writer or OS-level locking, since interleaved writes can corrupt lines. Use logging, not manual files, for application logs.`
    ),

    'The with Statement': dd(
        [`<code>with</code> opens a context manager and guarantees its cleanup. For files that means the file is closed when the block ends, even if an error happens inside.`,
            r`with open("w.txt", "w", encoding="utf-8") as f:
    f.write("data")
    print("inside, closed?", f.closed)
print("after,  closed?", f.closed)

# OUTPUT:
# inside, closed? False
# after,  closed? True`],
        [`Manual open/close forgets the close on an early return or exception, leaking handles and losing unflushed data.`,
            r`def risky():
    with open("w.txt", "w") as f:
        f.write("x")
        raise RuntimeError("boom")      # file still gets closed
try:
    risky()
except RuntimeError:
    print("error handled, file closed:", open("w.txt").read() == "x")

# OUTPUT:
# error handled, file closed: True`],
        [`Used for files, locks, DB transactions, temporary directories and timers. You can open several at once, e.g. copying a file.`,
            r`with open("src.txt", "w") as s:
    s.write("copy me")
with open("src.txt") as s, open("dst.txt", "w") as d:    # two managers, one with
    d.write(s.read())
print(open("dst.txt").read())

# OUTPUT:
# copy me`],
        [`<b>Advantages:</b> short, exception-safe, and you can write your own context manager with a class or <code>contextlib</code>.`,
            r`from contextlib import contextmanager
@contextmanager
def announce(name):
    print("enter", name)
    try:
        yield name
    finally:
        print("exit", name)

with announce("job") as j:
    print("working on", j)

# OUTPUT:
# enter job
# working on job
# exit job`],
        [`<b>Disadvantages:</b> the variable stays alive after the block (just closed), and a context manager that swallows exceptions in <code>__exit__</code> can hide errors.`,
            r`from contextlib import suppress
with suppress(ZeroDivisionError):      # swallows on purpose
    1 / 0
    print("never printed")
print("continued silently")

# OUTPUT:
# continued silently`],
        [`<b>Limitations:</b> using a file after the block raises ValueError, and the protocol only works for objects that implement <code>__enter__</code> and <code>__exit__</code>.`,
            r`with open("w.txt") as f:
    pass
try:
    f.read()
except ValueError as e:
    print("ValueError:", e)
try:
    with 42 as x: pass
except (TypeError, AttributeError) as e:
    print(type(e).__name__)

# OUTPUT:
# ValueError: I/O operation on closed file.
# TypeError`],
        `
   with open(...) as f:
        |
        +--> __enter__()  -> returns f
        |    ... your block ... (error or not)
        +--> __exit__()   -> f.close()   (always)
`,
        `Make every resource with an acquire/release lifecycle a context manager, and use contextlib.ExitStack when the number of resources is dynamic. Keep with blocks short so resources are held for the minimum time.`
    ),

    'Text vs Binary Files': dd(
        [`Text mode (<code>r</code>/<code>w</code>) works with <code>str</code> and decodes/encodes bytes using an encoding. Binary mode (<code>rb</code>/<code>wb</code>) works with raw <code>bytes</code> and no translation.`,
            r`text = "café"                     # 4 characters
with open("t.txt", "w", encoding="utf-8") as f:
    f.write(text)
with open("t.txt", "rb") as f:
    raw = f.read()
print(raw, len(text), len(raw))

# OUTPUT:
# b'caf\xc3\xa9' 4 5`],
        [`Images, PDFs, zips and executables are not text; decoding them as text corrupts or fails. Text files need the right encoding to show international characters.`,
            r`png_header = bytes([0x89, 0x50, 0x4E, 0x47])
with open("img.bin", "wb") as f:
    f.write(png_header)
with open("img.bin", "rb") as f:
    data = f.read()
print(data[1:4].decode("ascii"), list(data))

# OUTPUT:
# PNG [137, 80, 78, 71]`],
        [`File uploads, downloads, image processing, protocol messages and copying any file safely (chunked) all use binary mode.`,
            r`# Chunked binary copy: works for any file type and size
with open("src.bin", "wb") as f:
    f.write(bytes(range(256)) * 4)
with open("src.bin", "rb") as s, open("dst.bin", "wb") as d:
    while chunk := s.read(300):          # 300 bytes at a time
        d.write(chunk)
print(open("src.bin", "rb").read() == open("dst.bin", "rb").read())

# OUTPUT:
# True`],
        [`<b>Advantages:</b> text mode handles encodings and newlines for you; binary mode is exact and fastest, with <code>seek</code> by byte.`,
            r`# Binary mode: byte-exact random access
with open("src.bin", "rb") as f:
    f.seek(250)
    print(list(f.read(4)))

# OUTPUT:
# [250, 251, 252, 253]`],
        [`<b>Disadvantages:</b> text mode on the wrong encoding raises UnicodeDecodeError or shows mojibake; binary needs manual decode.`,
            r`with open("latin.txt", "wb") as f:
    f.write("café".encode("latin-1"))     # byte 0xe9
try:
    open("latin.txt", encoding="utf-8").read()
except UnicodeDecodeError as e:
    print("UnicodeDecodeError:", e.reason)

# OUTPUT:
# UnicodeDecodeError: invalid continuation byte`],
        [`<b>Limitations:</b> binary files cannot be iterated by meaningful "lines", text-mode <code>seek</code> offsets are opaque, and writing str to a binary file is a TypeError.`,
            r`try:
    with open("x.bin", "wb") as f:
        f.write("text")
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: a bytes-like object is required, not 'str'`],
        `
   str  --encode(utf-8)-->  bytes  ---> disk
   str  <--decode(utf-8)--  bytes  <--- disk
   text mode : Python does encode/decode + newline translation
   binary    : you get / give raw bytes, nothing is changed
`,
        `Decide the encoding at the system boundary (UTF-8 everywhere) and keep str internally and bytes only at I/O edges. For large binary data consider memoryview, mmap, or streaming APIs instead of reading whole files.`
    ),

    'CSV Files': dd(
        [`CSV (comma-separated values) stores tables as text lines. The <code>csv</code> module reads and writes them correctly, handling quotes and embedded commas.`,
            r`import csv
with open("people.csv", "w", newline="", encoding="utf-8") as f:   # newline="" is required
    w = csv.writer(f)
    w.writerow(["name", "age"])
    w.writerow(["Asha", 30])
    w.writerow(["Li, Wei", 25])        # comma inside a value is quoted
print(open("people.csv", encoding="utf-8").read())

# OUTPUT:
# name,age
# Asha,30
# "Li, Wei",25`],
        [`Splitting on "," by hand breaks on quoted commas and line breaks inside fields. The module follows the real CSV rules.`,
            r`line = '"Li, Wei",25'
print("naive :", line.split(","))
import csv
print("csv   :", next(csv.reader([line])))

# OUTPUT:
# naive : ['"Li', ' Wei"', '25']
# csv   : ['Li, Wei', '25']`],
        [`Spreadsheet exports, bank statements, data-science inputs and database dumps move as CSV. <code>DictReader</code> gives each row as a dict.`,
            r`import csv
with open("people.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["age"]) + 1)

# OUTPUT:
# Asha 31
# Li, Wei 26`],
        [`<b>Advantages:</b> human readable, universal, streams row by row, works with Excel; <code>DictWriter</code> keeps columns by name.`,
            r`import csv, io
buf = io.StringIO()
w = csv.DictWriter(buf, fieldnames=["id", "city"])
w.writeheader()
w.writerow({"id": 1, "city": "Pune"})
print(buf.getvalue().strip().splitlines())

# OUTPUT:
# ['id,city', '1,Pune']`],
        [`<b>Disadvantages:</b> no types (everything is a string), no schema, and dialect differences (semicolon, tab) cause surprises.`,
            r`import csv, io
rows = list(csv.reader(io.StringIO("a,b\n1,2")))
print(rows, type(rows[1][0]).__name__)       # numbers come back as str
print(list(csv.reader(io.StringIO("a;b"), delimiter=";")))

# OUTPUT:
# [['a', 'b'], ['1', '2']] str
# [['a', 'b']]`],
        [`<b>Limitations:</b> no nesting, no random update (rewrite the file), no concurrency control, and huge files are slow compared with binary columnar formats.`,
            r`import csv, io
buf = io.StringIO()
csv.writer(buf).writerow(["tags", ["a", "b"]])     # nested list is just str()-ed
print(buf.getvalue().strip())

# OUTPUT:
# tags,"['a', 'b']"`],
        `
   header : name , age
   row 1  : Asha , 30          reader --> ['Asha','30']
   row 2  : "Li, Wei" , 25     DictReader --> {'name':'Li, Wei','age':'25'}
   (rows are streamed one at a time from the file)
`,
        `Use CSV for interchange, not as a database. For analytics prefer Parquet/Arrow or pandas with explicit dtypes; for relational updates use SQLite. Always open with newline="" and an explicit encoding, and validate/convert types on load.`
    ),

    'JSON Files': dd(
        [`JSON is a text format for nested data (objects, arrays, strings, numbers, booleans, null). <code>json.dump</code>/<code>load</code> work with files, <code>dumps</code>/<code>loads</code> with strings.`,
            r`import json
data = {"name": "Asha", "skills": ["py", "sql"], "active": True, "boss": None}
with open("p.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
with open("p.json", encoding="utf-8") as f:
    back = json.load(f)
print(back == data, back["skills"][0])

# OUTPUT:
# True py`],
        [`Programs in different languages need a shared, readable way to exchange structured data - REST APIs and config files use JSON.`,
            r`import json
text = json.dumps({"id": 1, "tags": ["a", "b"]})
print(text)                    # a plain string, ready to send over a network
print(json.loads(text)["tags"])

# OUTPUT:
# {"id": 1, "tags": ["a", "b"]}
# ['a', 'b']`],
        [`Settings files (package.json style), API request/response bodies, NoSQL documents and log events (JSON lines).`,
            r`import json
# JSON Lines: one record per line, appendable and streamable
with open("events.jsonl", "w") as f:
    for e in ({"t": 1, "ok": True}, {"t": 2, "ok": False}):
        f.write(json.dumps(e) + "\n")
with open("events.jsonl") as f:
    print([json.loads(line)["ok"] for line in f])

# OUTPUT:
# [True, False]`],
        [`<b>Advantages:</b> readable, language neutral, safe to load (no code execution), pretty-printable and sortable.`,
            r`import json
print(json.dumps({"b": 1, "a": [1, 2]}, indent=2, sort_keys=True))

# OUTPUT:
# {
#   "a": [
#     1,
#     2
#   ],
#   "b": 1
# }`],
        [`<b>Disadvantages:</b> no comments, no date/set/bytes types, and text is larger than binary formats.`,
            r`import json, datetime
try:
    json.dumps({"when": datetime.date(2024, 1, 31)})
except TypeError as e:
    print("TypeError:", e)

# OUTPUT:
# TypeError: Object of type date is not JSON serializable`],
        [`<b>Limitations:</b> dict keys become strings, tuples become lists, NaN is non-standard, and very large numbers or precision may differ between languages. Use <code>default=</code> for custom types.`,
            r`import json, datetime
d = {1: "one", "t": (1, 2)}
print(json.loads(json.dumps(d)))                       # key 1 became "1", tuple became list
print(json.dumps({"d": datetime.date(2024, 1, 31)}, default=str))

# OUTPUT:
# {'1': 'one', 't': [1, 2]}
# {"d": "2024-01-31"}`],
        `
   Python object --json.dump(obj, f)--> text file {"k": ...}
   dict  -> object      list/tuple -> array     str -> string
   int/float -> number  True/False -> true/false   None -> null
   Python object <--json.load(f)-- text file
`,
        `Prefer JSON for interchange and configuration; version your schema and validate input (jsonschema, pydantic). Do not use it for large analytics or when you need exact round-trip of Python types - choose a schema-based binary format (Protobuf, Avro) there.`
    ),

    'Pickle': dd(
        [`<code>pickle</code> serialises almost any Python object (even custom class instances) to bytes and restores it later. Use <code>pickle.dump</code>/<code>load</code> with binary files.`,
            r`import pickle
obj = {"nums": {1, 2, 3}, "t": (1, 2), "name": "x"}      # set and tuple preserved
with open("o.pkl", "wb") as f:
    pickle.dump(obj, f)
with open("o.pkl", "rb") as f:
    back = pickle.load(f)
print(back == obj, type(back["nums"]).__name__)

# OUTPUT:
# True set`],
        [`JSON cannot hold sets, tuples, class instances or cyclic structures. Pickle saves Python-specific state exactly, which is handy for caching and sending objects between processes.`,
            r`import pickle
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
p = pickle.loads(pickle.dumps(Point(3, 4)))
print(type(p).__name__, p.x, p.y)

# OUTPUT:
# Point 3 4`],
        [`Caching expensive results (trained ML models, computed tables), and multiprocessing, which pickles arguments to send them to worker processes.`,
            r`import pickle, os
cache = "result.pkl"
if os.path.exists(cache):
    result = pickle.load(open(cache, "rb"))
else:
    result = sum(i * i for i in range(1000))     # pretend this is slow
    pickle.dump(result, open(cache, "wb"))
print(result)

# OUTPUT:
# 332833500`],
        [`<b>Advantages:</b> handles almost any object, shared references and cycles, fast, and one line to use.`,
            r`import pickle
a = [1, 2]
data = pickle.loads(pickle.dumps([a, a]))
print(data[0] is data[1])       # shared reference preserved

# OUTPUT:
# True`],
        [`<b>Disadvantages:</b> Python-only, not human readable, and version sensitive. Most important: <b>unpickling untrusted data can run arbitrary code</b>.`,
            r`import pickle
class Evil:
    def __reduce__(self):                 # tells pickle how to rebuild: call print(...)
        return (print, ("code ran during load!",))
pickle.loads(pickle.dumps(Evil()))        # never do this with data from strangers

# OUTPUT:
# code ran during load!`],
        [`<b>Limitations:</b> lambdas, open files, sockets and generators cannot be pickled, and the class definition must be importable when loading.`,
            r`import pickle
try:
    pickle.dumps(lambda x: x)
except Exception as e:
    print(type(e).__name__)

# OUTPUT:
# PicklingError`],
        `
   object --pickle.dump--> bytes (.pkl) --pickle.load--> object
   WARNING: load = executes code described by the bytes
   trusted file only  | for strangers use JSON / signed data
`,
        `Use pickle only for trusted, short-lived, same-version Python data (caches, IPC). For storage or network exchange choose JSON, MessagePack or Protobuf; for models use safe formats (safetensors, ONNX) or HMAC-sign the pickle. Never unpickle anything from an untrusted source.`
    )
};
