import type { Topic } from '../../types';

export const pythonObjectModel: Topic = {
    id: 'python-data-model-the-python-object-model',
    name: 'The Python Object Model',
    beginner: [
        {
            content: `<h4>Everything Is an Object</h4>
In Java, <code>int</code> is a primitive and classes are not values you pass around. In Python <b>everything</b> is an object: numbers, strings, functions, classes, even modules. They all have a type and attributes, and can be stored in variables and passed to functions.`,
            codeExamples: [
                `import math

def greet():
    return "hi"

for obj in (42, "text", greet, len, int, math):
    print(type(obj))

print(isinstance(42, object), isinstance(greet, object), isinstance(int, object))
print((42).bit_length(), greet.__name__, math.__name__)

# OUTPUT:
# <class 'int'>
# <class 'str'>
# <class 'function'>
# <class 'builtin_function_or_method'>
# <class 'type'>
# <class 'module'>
# True True True
# 6 greet math`
            ]
        },
        {
            content: `<h4>Identity, Type and Value</h4>
Every object has:<br>
• an <b>identity</b> - which object it is (<code>id()</code>, compared with <code>is</code>), fixed for its lifetime;<br>
• a <b>type</b> - what kind of object it is (<code>type()</code>), which decides its behaviour;<br>
• a <b>value</b> - its data, which may change if the type is mutable.`,
            codeExamples: [
                `scores = [80, 90]
alias = scores

print(type(scores), scores)
print(alias is scores, id(alias) == id(scores))

scores.append(70)            # value changes, identity and type don't
print(alias, type(alias))

# OUTPUT:
# <class 'list'> [80, 90]
# True True
# [80, 90, 70] <class 'list'>`
            ]
        },
        {
            content: `<h4>Classes Are Objects Too</h4>
A class is an object whose type is <code>type</code>. <code>type</code> is its own type, and every class ultimately inherits from <code>object</code>.`,
            codeExamples: [
                `class Dog:
    pass

print(type(Dog), type(int), type(type))
print(type(type) is type)
print(Dog.__bases__, int.__bases__)
print(bool.__mro__)

# OUTPUT:
# <class 'type'> <class 'type'> <class 'type'>
# True
# (<class 'object'>,) (<class 'object'>,)
# (<class 'bool'>, <class 'int'>, <class 'object'>)`
            ]
        },
        {
            content: `<h4>Where Attributes Live: __dict__</h4>
Instance attributes are stored in the instance's <code>__dict__</code>; class attributes and methods in the class's <code>__dict__</code>. Reading <code>obj.name</code> looks in the <b>instance first</b>, then the <b>class</b>, then its base classes in MRO order.`,
            codeExamples: [
                `class Dog:
    species = "canine"               # class attribute

    def __init__(self, name):
        self.name = name             # instance attribute

rex = Dog("Rex")
print(rex.__dict__)
print(rex.species, "species" in rex.__dict__, Dog.__dict__["species"])

rex.species = "wolf"                 # creates an instance attribute that shadows the class one
print(rex.species, Dog.species, rex.__dict__)

# OUTPUT:
# {'name': 'Rex'}
# canine False canine
# wolf canine {'name': 'Rex', 'species': 'wolf'}`
            ]
        },
        {
            content: `<h4>Inheritance and dir()</h4>
The <b>MRO</b> (method resolution order) is the list of classes Python searches for an attribute. <code>dir(obj)</code> lists every attribute name reachable from the object, sorted - including many inherited dunder methods.`,
            codeExamples: [
                `class Animal:
    def speak(self):
        return "..."

class Dog(Animal):
    def __init__(self, name):
        self.name = name

rex = Dog("Rex")
print([c.__name__ for c in Dog.__mro__])
print(rex.speak())                                   # found on Animal
print([n for n in dir(rex) if not n.startswith("_")])

# OUTPUT:
# ['Dog', 'Animal', 'object']
# ...
# ['name', 'speak']`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Special Methods Are Looked Up on the Type</h3>
Built-ins and operators find dunder methods on the object's <b>class</b>, not its instance <code>__dict__</code>. Setting <code>obj.__len__</code> on an instance does not make <code>len(obj)</code> work - this keeps implicit calls fast and predictable.`,
            codeExamples: [
                `class Box:
    pass

b = Box()
b.__len__ = lambda: 5
print(b.__len__())          # an ordinary attribute call works
print(len(b))               # len() looks on type(b), not on b

# OUTPUT:
# 5
# TypeError: object of type 'Box' has no len()`
            ]
        },
        {
            content: `<h3>__getattr__ vs __getattribute__</h3>
• <code>__getattr__(self, name)</code> is called only when <b>normal lookup fails</b> - a safe fallback for dynamic attributes.<br>
• <code>__getattribute__(self, name)</code> is called for <b>every</b> attribute access, including methods. Overriding it is rarely needed; inside it, use <code>super().__getattribute__</code> or you will recurse forever.`,
            codeExamples: [
                `class Config:
    def __init__(self, data):
        self._data = data

    def __getattr__(self, name):            # only for missing attributes
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"no setting {name!r}") from None

cfg = Config({"debug": True, "port": 8000})
print(cfg.debug, cfg.port)
print(cfg.host)

# OUTPUT:
# True 8000
# AttributeError: no setting 'host'`,
                `class Traced:
    def __getattribute__(self, name):       # every access goes through here
        print("get", name)
        return super().__getattribute__(name)

t = Traced()
t.x = 1
print(t.x)

# OUTPUT:
# get x
# 1`
            ]
        },
        {
            content: `<h3>__setattr__: Intercepting Assignment</h3>
<code>obj.attr = value</code> calls <code>type(obj).__setattr__</code>. Override it to validate or log, and delegate the real work to <code>super().__setattr__</code>. (For a single attribute, a <code>property</code> is usually simpler.)`,
            codeExamples: [
                `class Temperature:
    def __setattr__(self, name, value):
        if name == "celsius" and value < -273.15:
            raise ValueError("below absolute zero")
        super().__setattr__(name, value)

t = Temperature()
t.celsius = 25
print(t.celsius)
t.celsius = -300

# OUTPUT:
# 25
# ValueError: below absolute zero`
            ]
        },
        {
            content: `<h3>Methods Are Functions That Bind</h3>
A method is just a function stored on the class. Accessing it through an instance produces a <b>bound method</b> that remembers the instance as <code>self</code>. This binding is done by the <b>descriptor protocol</b> (<code>__get__</code>), which also powers <code>property</code>, <code>classmethod</code> and <code>staticmethod</code> - covered in <i>Advanced Python</i>. How objects are counted and freed is covered in <i>Memory Management</i>.`,
            codeExamples: [
                `class Dog:
    def speak(self):
        return "Woof"

rex = Dog()
print(type(Dog.speak), type(rex.speak))
print(rex.speak.__self__ is rex)
print(Dog.speak(rex) == rex.speak())     # rex.speak() is Dog.speak(rex)

# OUTPUT:
# <class 'function'> <class 'method'>
# True
# True`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What three things does every object have?</td><td>Identity, type and value</td></tr>
<tr class='text-center'><td>What is <code>type(type)</code>?</td><td><code>type</code> - it is its own metaclass; all classes are instances of type</td></tr>
<tr class='text-center'><td>In what order is an attribute looked up?</td><td>Instance __dict__, then the class and its bases in MRO order (data descriptors take priority)</td></tr>
<tr class='text-center'><td>__getattr__ vs __getattribute__?</td><td>__getattr__ runs only when normal lookup fails; __getattribute__ runs on every access</td></tr>
<tr class='text-center'><td>Why doesn't setting <code>obj.__len__</code> make len() work?</td><td>Special methods are looked up on the type, not the instance</td></tr>
<tr class='text-center'><td>What is a bound method?</td><td>A function accessed through an instance, with that instance attached as self</td></tr>
</table>`
        }
    ]
};
