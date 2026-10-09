import type { Topic } from '../../types';

export const memoryWeakref: Topic = {
    id: 'python-memory-weakref',
    name: 'weakref',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A normal reference <i>owns</i> its target: while it exists, the object stays alive. A <b>weak reference</b> lets you observe an object <b>without owning it</b>. When the last normal reference disappears, the object is freed and the weak reference becomes empty (calling it returns <code>None</code>). The <code>weakref</code> module also offers <code>WeakValueDictionary</code> and <code>weakref.finalize</code> for cleanup callbacks. Java provides the same idea through <code>java.lang.ref.WeakReference</code> and <code>WeakHashMap</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 346 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:346px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<line x1="92.4" y1="39.9" x2="220.0" y2="61.2" stroke="#6b7280" marker-end="url(#ar)"/><text x="160.2" y="46.5" font-size="11" fill="#6b7280">owns</text><line x1="143.5" y1="112.0" x2="226.4" y2="86.0" stroke="#6b7280" stroke-dasharray="5 4" marker-end="url(#ar)"/><text x="189.0" y="95.0" font-size="11" fill="#6b7280">watches</text><rect x="10" y="10" width="82.4" height="46" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="51.2" y="29.5">name img</tspan><tspan x="51.2" y="44.5">(strong)</tspan></text><rect x="220" y="55" width="111.6" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="275.8" y="74.5">Image object</tspan></text><rect x="10" y="110" width="133.5" height="46" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="76.8" y="129.5">cache / weakref</tspan><tspan x="76.8" y="144.5">(weak)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: only the strong name keeps the object alive; deleting it empties the weak side</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A cache that stores objects in a normal dictionary keeps every one of them alive forever, so it only grows. A child holding its parent normally creates a cycle.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Build <b>caches</b> that never keep unused objects alive.</li>
<li>Create <b>back-references</b> without reference cycles.</li>
<li>Register <b>observers</b> that do not prevent their own cleanup.</li>
<li>Run a callback when an object dies (<code>weakref.finalize</code>).</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: weakref.ref, WeakValueDictionary and finalize</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import weakref


class Image:
    def __init__(self, name):
        self.name = name


def main():
    cache = weakref.WeakValueDictionary()
    img = Image("logo.png")
    cache["logo"] = img                        # weak: does not own img
    ref = weakref.ref(img)
    weakref.finalize(img, print, "image finalized")

    print("entries in cache:", len(cache))
    print("ref gives object:", ref() is img)

    del img                                    # the last strong reference
    print("after del:", len(cache), ref())


if __name__ == "__main__":
    main()

# OUTPUT:
# entries in cache: 1
# ref gives object: True
# image finalized
# after del: 0 None`
            ],
            codeExplanations: [
                `The cache and the ref both point to the image weakly, so the only owner is the name img. When img is deleted, the object is freed at once: the finalize callback prints its message, the cache entry disappears and ref() returns None. Note that only instances of your own classes can be weakly referenced; plain int, str, list and dict cannot.`
            ]
        },
        {
            content: `<h4>A Reference That Does Not Keep the Object Alive</h4>
A normal reference keeps its target alive. A <b>weak reference</b> lets you <i>look at</i> an object <b>without owning it</b>: if every normal reference disappears, the object is freed and the weak reference simply becomes empty. Calling a <code>weakref.ref</code> object returns the target while it is alive, and <code>None</code> afterwards.`,
            codeExamples: [
                `import weakref

class Data:
    pass

d = Data()
r = weakref.ref(d)

print(r() is d)          # alive: calling r gives the object back
del d                    # last normal reference gone, so the object is freed
print(r())

# OUTPUT:
# True
# None`
            ]
        },
        {
            content: `<h4>Why Would You Want That?</h4>
<ul>
<li><b>Caches</b> that should not prevent unused entries from being freed.</li>
<li><b>Back-references</b> (child to parent) that would otherwise create reference cycles.</li>
<li><b>Observers/listeners</b> that must not keep a dead object alive just because it subscribed.</li>
<li><b>Cleanup callbacks</b> that run when an object disappears.</li>
</ul>
Java has the same idea: <code>WeakReference</code> and <code>WeakHashMap</code>.`
        },
        {
            content: `<h4>WeakValueDictionary: A Self-Cleaning Cache</h4>
It maps keys to objects <b>weakly</b>: when an object is no longer used anywhere else, its entry vanishes automatically.`,
            codeExamples: [
                `import weakref

class Image:
    def __init__(self, name):
        self.name = name

cache = weakref.WeakValueDictionary()

img = Image("logo.png")
cache["logo"] = img
print(len(cache))

del img                  # nothing else holds the image
print(len(cache))

# OUTPUT:
# 1
# 0`
            ],
            codeExplanations: [
                `A normal dict would keep the Image alive forever, so the cache would only ever grow. With WeakValueDictionary the cache holds the image only as long as some other part of the program still uses it - exactly the semantics of a cache of "things that are in use".`
            ]
        },
        {
            content: `<h4>Not Everything Can Be Weakly Referenced</h4>
Instances of your own classes can. Built-in <code>int</code>, <code>str</code>, <code>tuple</code>, <code>list</code> and <code>dict</code> cannot (subclasses of list and dict can).`,
            codeExamples: [
                `import weakref

try:
    weakref.ref([1, 2, 3])
except TypeError as error:
    print("TypeError:", error)

class MyList(list):
    pass

print(weakref.ref(MyList()) is not None)

# OUTPUT:
# TypeError: cannot create weak reference to 'list' object
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>weakref.finalize: Safe Cleanup When an Object Dies</h3>
<code>weakref.finalize(obj, func, *args)</code> registers a function to run once, when <code>obj</code> is garbage-collected (or at interpreter exit). Unlike <code>__del__</code> it works reliably even for objects in cycles, never resurrects the object, and cannot be forgotten by a subclass.`,
            codeExamples: [
                `import weakref

class TempFile:
    def __init__(self, path):
        self.path = path

f = TempFile("/tmp/data.bin")
weakref.finalize(f, print, "cleaning up /tmp/data.bin")

print("using the file")
del f                              # triggers the callback

# OUTPUT:
# using the file
# cleaning up /tmp/data.bin`
            ]
        },
        {
            content: `<h3>proxy and WeakMethod</h3>
<code>weakref.proxy(obj)</code> behaves like the object itself (no need to call it) but raises <code>ReferenceError</code> once the object is gone. Bound methods need <code>WeakMethod</code>: a plain <code>weakref.ref(obj.method)</code> dies immediately because the bound-method object is temporary. This is the foundation of safe <b>observer / event</b> systems.`,
            codeExamples: [
                `import weakref

class Button:
    def __init__(self):
        self._handlers = []
    def connect(self, method):
        self._handlers.append(weakref.WeakMethod(method))
    def click(self):
        for ref in self._handlers:
            fn = ref()
            if fn is not None:
                fn()

class Listener:
    def on_click(self):
        print("clicked")

button = Button()
listener = Listener()
button.connect(listener.on_click)

button.click()
del listener                       # the button does not keep it alive
button.click()                     # nothing happens: handler is gone

class Box:
    value = 7

box = Box()
p = weakref.proxy(box)
print(p.value)
del box
try:
    p.value
except ReferenceError as error:
    print("ReferenceError:", error)

# OUTPUT:
# clicked
# 7
# ReferenceError: weakly-referenced object no longer exists`
            ]
        },
        {
            content: `<h3>__slots__ and __weakref__</h3>
A class that defines <code>__slots__</code> has no per-instance dictionary - and also no <code>__weakref__</code> slot unless you ask for one. Add <code>"__weakref__"</code> to the slots to allow weak references to its instances.`,
            codeExamples: [
                `import weakref

class Plain:
    __slots__ = ("x",)

class Weakable:
    __slots__ = ("x", "__weakref__")

try:
    weakref.ref(Plain())
except TypeError as error:
    print("TypeError:", error)

print(weakref.ref(Weakable()) is not None)

# OUTPUT:
# TypeError: cannot create weak reference to 'Plain' object
# True`
            ]
        },
        {
            content: `<h3>Pitfalls and Related Types</h3>
<ul>
<li><b>Always check the result.</b> <code>r()</code> can be <code>None</code> at any moment; grab it into a local variable and test it before use (<code>obj = r(); if obj is not None: ...</code>) so it cannot vanish between the check and the use.</li>
<li><b>Timing differs between implementations.</b> CPython frees at once when the count hits zero; PyPy collects later, so code must not assume instant disappearance.</li>
<li><b>WeakKeyDictionary</b> keys objects weakly (store extra data about objects you do not own); <b>WeakSet</b> holds a set of objects weakly (e.g., a registry of live instances).</li>
<li><b>Callbacks run at odd times</b> (during garbage collection); keep them short and never raise.</li>
<li><b>Don't weakly reference things nobody else owns</b>: <code>weakref.ref(Data())</code> is dead before the next line.</li>
</ul>`,
            codeExamples: [
                `import weakref

class Data:
    pass

r = weakref.ref(Data())          # the temporary object has no other owner
print(r())

instances = weakref.WeakSet()
a = Data()
instances.add(a)
print(len(instances))
del a
print(len(instances))

# OUTPUT:
# None
# 1
# 0`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Caches clean themselves up automatically</td><td>Target may vanish at any moment, so always check for <code>None</code></td></tr>
<tr><td>Breaks reference cycles without losing the link</td><td>Built-in <code>int</code>, <code>str</code>, <code>list</code>, <code>dict</code> are not supported</td></tr>
<tr><td>Observers cannot keep dead objects alive</td><td>Behaviour depends on CPython's immediate freeing</td></tr>
<tr><td><code>finalize</code> gives a reliable cleanup hook</td><td>Extra complexity compared with a plain reference</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a weak reference?</td><td>A reference that does not increase the refcount; the target can be freed and the reference then returns None</td></tr>
<tr class='text-center'><td>Give two uses.</td><td>Caches that should not retain objects, and back-references that avoid reference cycles</td></tr>
<tr class='text-center'><td>Why can't you weakly reference a list or int?</td><td>Built-in types do not provide the weakref slot; subclasses and user classes can</td></tr>
<tr class='text-center'><td>Why use <code>WeakMethod</code>?</td><td>A bound method object is temporary, so a plain weakref to it would die immediately</td></tr>
<tr class='text-center'><td>weakref.finalize vs __del__?</td><td>finalize is reliable for cycles, runs once, and is registered separately from the class</td></tr>
</table>`
        }
    ]
};
