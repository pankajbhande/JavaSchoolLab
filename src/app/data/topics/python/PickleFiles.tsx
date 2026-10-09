import type { Topic } from '../../types';

export const pickleFiles: Topic = {
    id: 'python-file-handling-pickle',
    name: 'Pickle',
    beginner: [
        {
            content: `<h4>What is Pickle?</h4>
<b>Pickling</b> converts (almost) any Python object - dicts, lists, sets, tuples, your own class instances - into a stream of <b>bytes</b> that can be saved to a file and turned back into an equal object later (<b>unpickling</b>). It is Python's equivalent of Java's <code>Serializable</code> + <code>ObjectOutputStream</code>.<br><br>
Unlike JSON, pickle keeps Python types exactly: a set stays a set, a tuple stays a tuple. Pickle files are binary, so open them with <code>"wb"</code> and <code>"rb"</code>.`
        },
        {
            content: `<h4>Saving and Loading</h4>`,
            codeExamples: [
                `import pickle

data = {
    "name": "Asha",
    "marks": [91, 85],
    "skills": {"python", "sql"},
    "point": (3, 4),
}

with open("data.pkl", "wb") as f:        # binary write
    pickle.dump(data, f)

with open("data.pkl", "rb") as f:        # binary read
    loaded = pickle.load(f)

print(loaded == data, type(loaded["skills"]), loaded["point"])
print(sorted(loaded["skills"]))

# OUTPUT:
# True <class 'set'> (3, 4)
# ['python', 'sql']`
            ]
        },
        {
            content: `<h4>Pickling Your Own Objects</h4>
Instances of your classes work too - attributes are saved and restored, and methods are available again after loading.`,
            codeExamples: [
                `import pickle

class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def average(self):
        return sum(self.marks) / len(self.marks)

s = Student("Ravi", [78, 66, 90])

with open("student.pkl", "wb") as f:
    pickle.dump(s, f)

with open("student.pkl", "rb") as f:
    restored = pickle.load(f)

print(restored.name, restored.average())
print(restored is s)                     # an equal copy, not the same object

# OUTPUT:
# Ravi 78.0
# False`
            ]
        },
        {
            content: `<h4>dumps and loads: Bytes in Memory</h4>
<code>pickle.dumps()</code> returns the bytes instead of writing a file, and <code>pickle.loads()</code> turns bytes back into an object - handy for caches and for sending objects between processes.`,
            codeExamples: [
                `import pickle

blob = pickle.dumps(["pen", "book", 3])
print(type(blob))
print(pickle.loads(blob))

# Several objects can be stored in one file, one after another
with open("many.pkl", "wb") as f:
    pickle.dump("first", f)
    pickle.dump({"second": 2}, f)

with open("many.pkl", "rb") as f:
    print(pickle.load(f), pickle.load(f))

# OUTPUT:
# <class 'bytes'>
# ['pen', 'book', 3]
# first {'second': 2}`
            ]
        },
        {
            content: `<h4>The Class Must Exist When Loading</h4>
A pickle stores the <b>name</b> of the class (module + class name) and the attribute values - not the class's code. The program that unpickles must be able to import the same class; otherwise loading fails.`,
            codeExamples: [
                `# save.py defined class Student and pickled an instance into student.pkl.
# load.py (no Student class defined or imported):
import pickle

with open("student.pkl", "rb") as f:
    s = pickle.load(f)

# OUTPUT:
# AttributeError: Can't get attribute 'Student' on <module '__main__' ...>
#
# Fix: put Student in its own module (e.g. models.py) and import it in both programs.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Security: Never Unpickle Untrusted Data</h3>
Unpickling is not just reading data - a pickle can instruct Python to <b>call functions</b> while it rebuilds objects (this is how the <code>__reduce__</code> protocol works). A maliciously crafted pickle can therefore run <b>arbitrary code</b> on your machine the moment you call <code>pickle.load</code>.<br><br>
• Only unpickle data <b>you created</b> and stored somewhere attackers cannot modify.<br>
• Never accept pickles from users, uploads, network requests or downloaded files.<br>
• For data exchange, use JSON (or another data-only format). If you must verify stored pickles, sign them with <code>hmac</code> and check the signature before loading.`
        },
        {
            content: `<h3>Pickle vs JSON</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>pickle</th><th>JSON</th></tr>
<tr class='text-center'><td>Format</td><td>Binary</td><td>Human-readable text</td></tr>
<tr class='text-center'><td>Languages</td><td>Python only</td><td>Every language</td></tr>
<tr class='text-center'><td>Types</td><td>Almost any Python object: sets, tuples, class instances, nested references</td><td>dict, list, str, number, bool, null</td></tr>
<tr class='text-center'><td>Safe with untrusted input?</td><td><b>No</b> - can execute code</td><td>Yes - only data</td></tr>
<tr class='text-center'><td>Long-term storage</td><td>Fragile - breaks if classes are renamed or moved</td><td>Stable</td></tr>
<tr class='text-center'><td>Typical use</td><td>Caches, saving intermediate Python results, multiprocessing</td><td>APIs, config files, data exchange</td></tr>
</table>`
        },
        {
            content: `<h3>Protocols</h3>
The pickle format has versions called <b>protocols</b>. Newer protocols are faster and more compact; older ones can be read by older Pythons. <code>pickle.dump(obj, f, protocol=pickle.HIGHEST_PROTOCOL)</code> picks the newest the running Python supports.`,
            codeExamples: [
                `import pickle

print(pickle.HIGHEST_PROTOCOL, pickle.DEFAULT_PROTOCOL)

data = list(range(1000))
small = pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL)
print(pickle.loads(small) == data)

# OUTPUT (Python 3.12):
# 5 4
# True`
            ]
        },
        {
            content: `<h3>What Can't Be Pickled</h3>
Objects tied to the running process or to code that can't be found by name: <b>lambdas</b> and nested functions, <b>open files</b>, sockets, database connections, <b>locks</b> and threads. Pickling them raises an error (a <code>PicklingError</code>, <code>AttributeError</code> or <code>TypeError</code>, depending on the object).`,
            codeExamples: [
                `import pickle
import threading

f = open("temp.bin", "wb")
candidates = [lambda x: x * 2, f, threading.Lock()]

for obj in candidates:
    try:
        pickle.dumps(obj)
    except Exception as error:
        print(type(obj).__name__, "-> cannot pickle:", type(error).__name__)

f.close()

# OUTPUT (Python 3.12):
# function -> cannot pickle: PicklingError
# BufferedWriter -> cannot pickle: TypeError
# lock -> cannot pickle: TypeError`
            ]
        },
        {
            content: `<h3>Customising with __getstate__ and __setstate__</h3>
When an object holds something unpicklable (a lock, a connection), leave it out of the saved state with <code>__getstate__</code> and recreate it after loading with <code>__setstate__</code>.`,
            codeExamples: [
                `import pickle
import threading

class Cache:
    def __init__(self):
        self.data = {}
        self.lock = threading.Lock()          # cannot be pickled

    def __getstate__(self):
        state = self.__dict__.copy()
        del state["lock"]                     # save everything except the lock
        return state

    def __setstate__(self, state):
        self.__dict__.update(state)
        self.lock = threading.Lock()          # recreate it after loading

cache = Cache()
cache.data["pi"] = 3.14

copy = pickle.loads(pickle.dumps(cache))
print(copy.data, type(copy.lock).__name__)

# OUTPUT:
# {'pi': 3.14} lock`
            ]
        },
        {
            content: `<h3>Alternatives Built on Pickle</h3>
• <b>shelve</b> (standard library) - a persistent, dict-like store on disk; values are pickled for you.<br>
• <b>joblib</b> (third-party) - efficient for large NumPy arrays; the usual way to save scikit-learn models.<br>
• <b>json</b> - when the data must be readable, portable or received from others.`,
            codeExamples: [
                `import shelve

with shelve.open("store") as db:
    db["asha"] = {"marks": [91, 85], "skills": {"python"}}

with shelve.open("store") as db:          # later, even in another run
    print(db["asha"]["marks"], "asha" in db)

# OUTPUT:
# [91, 85] True`
            ]
        },
        {
            content: `<h3>Compared with Java Serialization</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python pickle</th></tr>
<tr class='text-center'><td>Opt-in</td><td>Class must implement <code>Serializable</code></td><td>Most objects work automatically</td></tr>
<tr class='text-center'><td>Skip a field</td><td><code>transient</code></td><td><code>__getstate__</code> / <code>__setstate__</code></td></tr>
<tr class='text-center'><td>Write / read</td><td><code>ObjectOutputStream</code> / <code>ObjectInputStream</code></td><td><code>pickle.dump</code> / <code>pickle.load</code></td></tr>
<tr class='text-center'><td>Security</td><td>Deserialization of untrusted data is dangerous</td><td>Same - never unpickle untrusted data</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is pickling?</td><td>Serialising a Python object into bytes (unpickling rebuilds it)</td></tr>
<tr class='text-center'><td>Why open pickle files with "wb"/"rb"?</td><td>Pickle data is binary, not text</td></tr>
<tr class='text-center'><td>Is it safe to unpickle data from a user?</td><td>No - a crafted pickle can execute arbitrary code during loading</td></tr>
<tr class='text-center'><td>Pickle vs JSON?</td><td>Pickle supports almost any Python object but is Python-only and unsafe for untrusted input; JSON is text, portable and safe but supports only basic types</td></tr>
<tr class='text-center'><td>Why can't a lambda be pickled?</td><td>Functions are pickled by importable name, and a lambda has no name to look up</td></tr>
<tr class='text-center'><td>How do you exclude an attribute from pickling?</td><td>Implement <code>__getstate__</code> (and <code>__setstate__</code> to restore it)</td></tr>
</table>`
        }
    ]
};
