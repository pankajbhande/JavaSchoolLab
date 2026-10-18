import type { Topic } from '../../types';

export const multipleInheritanceMro: Topic = {
    id: 'python-oop-multiple-inheritance-mro',
    name: 'Multiple Inheritance & MRO',
    beginner: [
        {
            content: `<h4>Inheriting from Several Classes</h4>
Java allows a class to extend only <b>one</b> class (plus any number of interfaces). Python allows a class to inherit from <b>several</b> classes at once - list them in the parentheses. The child gets the attributes and methods of all of them.`,
            codeExamples: [
                `class Camera:
    def take_photo(self):
        return "click"

class Phone:
    def call(self, number):
        return f"calling {number}"

class SmartPhone(Camera, Phone):
    pass

s = SmartPhone()
print(s.take_photo())
print(s.call("98765"))
print(isinstance(s, Camera), isinstance(s, Phone))

# OUTPUT:
# click
# calling 98765
# True True`
            ]
        },
        {
            content: `<h4>Mixins: Small Reusable Pieces of Behaviour</h4>
The most common, safest use of multiple inheritance is the <b>mixin</b>: a small class that adds one capability and isn't meant to be used on its own. A main class "mixes in" the abilities it needs. By convention mixin names end in <code>Mixin</code>.`,
            codeExamples: [
                `import json

class JsonMixin:
    def to_json(self):
        return json.dumps(self.__dict__)

class LoggingMixin:
    def log(self, message):
        print(f"[{type(self).__name__}] {message}")

class Product(JsonMixin, LoggingMixin):
    def __init__(self, name, price):
        self.name = name
        self.price = price

p = Product("Pen", 10)
p.log("created")
print(p.to_json())

# OUTPUT:
# [Product] created
# {"name": "Pen", "price": 10}`
            ]
        },
        {
            content: `<h4>The Diamond Problem</h4>
When two parents share a grandparent and both define the same method, which version does the child get? This shape is called the <b>diamond</b>:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr class='text-center'><td></td><td>A</td><td></td></tr>
<tr class='text-center'><td>B(A)</td><td></td><td>C(A)</td></tr>
<tr class='text-center'><td></td><td>D(B, C)</td><td></td></tr>
</table>
Python answers it with the <b>Method Resolution Order (MRO)</b>: a single, fixed list of classes that Python searches, left to right, to find an attribute.`,
            codeExamples: [
                `class A:
    def hello(self):
        return "A"

class B(A):
    def hello(self):
        return "B"

class C(A):
    def hello(self):
        return "C"

class D(B, C):
    pass

print(D().hello())
print([cls.__name__ for cls in D.__mro__])

# OUTPUT:
# B
# ['D', 'B', 'C', 'A', 'object']`
            ],
            codeExplanations: [
                `D has no hello() of its own, so Python walks the MRO: D, then B - which has hello(), so B's version is used. The MRO lists B before C because D was declared as D(B, C): parents are searched in the order you write them. A, the shared grandparent, appears only once and only after both B and C, and object, the root of every class, is always last.`
            ]
        },
        {
            content: `<h4>Seeing the MRO</h4>
<code>ClassName.__mro__</code> (a tuple) and <code>ClassName.mro()</code> (a list) both show the order. <code>help(ClassName)</code> prints it as well, under "Method resolution order".`,
            codeExamples: [
                `class Camera:
    pass

class Phone:
    pass

class SmartPhone(Camera, Phone):
    pass

print(SmartPhone.mro())

# OUTPUT:
# [<class '__main__.SmartPhone'>, <class '__main__.Camera'>, <class '__main__.Phone'>, <class 'object'>]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How the MRO Is Computed: C3 Linearisation</h3>
Python (since 2.3) builds the MRO with the <b>C3 algorithm</b>, which guarantees three properties:<br>
• a class always comes <b>before its parents</b>;<br>
• parents keep the <b>left-to-right order</b> in which they were listed;<br>
• the order is <b>monotonic</b> - a class's MRO is consistent with the MROs of its parents.<br><br>
The rule: <code>L[C] = C + merge(L[P1], ..., L[Pn], [P1, ..., Pn])</code>. "merge" repeatedly takes the first head of a list that does <b>not</b> appear in the tail (any position except the first) of another list. For the diamond above:<br>
<code>L[D] = D + merge([B, A, object], [C, A, object], [B, C])</code><br>
• take <b>B</b> (not in any tail) → <code>merge([A, object], [C, A, object], [C])</code><br>
• A is in the tail of <code>[C, A, object]</code>, so skip it; take <b>C</b> → <code>merge([A, object], [A, object])</code><br>
• take <b>A</b>, then <b>object</b> → <code>D, B, C, A, object</code>`,
            codeExamples: [
                `class A: pass
class B: pass
class C: pass
class D: pass
class E: pass
class K1(A, B, C): pass
class K2(D, B, E): pass
class K3(D, A): pass
class Z(K1, K2, K3): pass

print([cls.__name__ for cls in Z.mro()])

# OUTPUT:
# ['Z', 'K1', 'K2', 'K3', 'D', 'A', 'B', 'C', 'E', 'object']`
            ]
        },
        {
            content: `<h3>Inconsistent Hierarchies Are Rejected</h3>
If no order can satisfy the C3 rules, Python refuses to create the class. Here <code>Z(X, Y)</code> asks for X before Y, but Y is a subclass of X and must come before it.`,
            codeExamples: [
                `class X:
    pass

class Y(X):
    pass

class Z(X, Y):
    pass

# OUTPUT:
# TypeError: Cannot create a consistent method resolution order (MRO) for bases X, Y`
            ]
        },
        {
            content: `<h3>Cooperative Multiple Inheritance Needs super() Everywhere</h3>
With multiple inheritance, "the next class" after a given class depends on the <b>object's</b> MRO, not on that class's own parent. If every class calls <code>super()</code>, each method in the chain runs exactly once, in MRO order. If one class calls its parent directly, the chain breaks or a shared base runs twice. The <i>super()</i> topic traces this step by step.`,
            codeExamples: [
                `class Base:
    def setup(self):
        print("Base")

class Cache(Base):
    def setup(self):
        print("Cache")
        super().setup()

class Database(Base):
    def setup(self):
        print("Database")
        super().setup()

class App(Cache, Database):
    def setup(self):
        print("App")
        super().setup()

App().setup()

# OUTPUT:
# App
# Cache
# Database
# Base`
            ],
            codeExplanations: [
                `App's MRO is App, Cache, Database, Base, object. Inside Cache.setup, super() means "the class after Cache in the MRO of this object", which is Database - not Base, even though Cache's only parent is Base. That is why every setup runs once and Base, shared by both branches, runs only at the end.`
            ]
        },
        {
            content: `<h3>Python vs Java</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Inherit implementation from</td><td>One class only</td><td>Any number of classes</td></tr>
<tr class='text-center'><td>Multiple "types"</td><td>Many interfaces</td><td>Many base classes, ABCs or Protocols</td></tr>
<tr class='text-center'><td>Diamond conflicts</td><td>Default methods from two interfaces must be resolved explicitly by overriding</td><td>Resolved automatically by the MRO</td></tr>
<tr class='text-center'><td>Typical reuse tool</td><td>Interfaces with default methods, composition</td><td>Mixins, composition</td></tr>
</table>
<b>Guidance:</b> keep multiple inheritance to mixins that add independent behaviour. For anything more complex, <b>composition</b> (holding an object instead of inheriting from it) is usually clearer.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does Python support multiple inheritance?</td><td>Yes - a class can list several base classes</td></tr>
<tr class='text-center'><td>What is the MRO?</td><td>The Method Resolution Order: the ordered list of classes Python searches for an attribute, available as <code>__mro__</code> or <code>mro()</code></td></tr>
<tr class='text-center'><td>Which algorithm computes it?</td><td>C3 linearisation: children before parents, parents in declaration order, consistent with the parents' MROs</td></tr>
<tr class='text-center'><td>How does Python solve the diamond problem?</td><td>The shared base appears once in the MRO, after all its subclasses; with super() each method runs once</td></tr>
<tr class='text-center'><td>What is a mixin?</td><td>A small class that adds one reusable capability to other classes through multiple inheritance</td></tr>
<tr class='text-center'><td>When does class creation fail because of the MRO?</td><td>When the requested base order contradicts the hierarchy, e.g. <code>class Z(X, Y)</code> where Y subclasses X</td></tr>
</table>`
        }
    ]
};
