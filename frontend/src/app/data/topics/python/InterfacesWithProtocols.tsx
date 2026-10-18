import type { Topic } from '../../types';

export const interfacesWithProtocols: Topic = {
    id: 'python-oop-interfaces-with-protocols',
    name: 'Interfaces with Protocols',
    beginner: [
        {
            content: `<h4>Interfaces in Python</h4>
In Java, a class satisfies an interface only if it <b>declares</b> <code>implements Drawable</code> - this is <b>nominal</b> typing (based on names). Python traditionally relies on <b>duck typing</b>: any object with a <code>draw()</code> method can be drawn, no declaration needed.<br><br>
<code>typing.Protocol</code> (Python 3.8+) lets you write that duck-typed interface down so editors and type checkers can verify it. This is <b>structural</b> typing, often called "static duck typing": a class matches the protocol because of its <b>structure</b> (its methods), not because it inherits from anything.`
        },
        {
            content: `<h4>Defining and Using a Protocol</h4>
A protocol is a class that inherits from <code>Protocol</code> and lists method signatures, usually with <code>...</code> as the body. Classes that match it never mention it.`,
            codeExamples: [
                `from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> str: ...

class Circle:                          # no inheritance from Drawable
    def draw(self) -> str:
        return "circle"

class Text:
    def draw(self) -> str:
        return "text"

def render(item: Drawable) -> None:
    print("Rendering", item.draw())

render(Circle())
render(Text())

# OUTPUT:
# Rendering circle
# Rendering text`
            ]
        },
        {
            content: `<h4>Who Checks It?</h4>
Protocols are checked by <b>static type checkers</b> such as mypy and Pyright (and by your editor), <b>before</b> the program runs. At runtime, Python itself doesn't check type hints - a wrong argument fails only when the missing method is actually called.`,
            codeExamples: [
                `from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> str: ...

def render(item: Drawable) -> None:
    print("Rendering", item.draw())

render(42)

# OUTPUT (running the program):
# AttributeError: 'int' object has no attribute 'draw'
#
# mypy reports the problem without running anything:
# error: Argument 1 to "render" has incompatible type "int"; expected "Drawable"`
            ]
        },
        {
            content: `<h4>A Practical Example: Anything That Can Send a Message</h4>
The checkout code depends only on the protocol, so new notifiers - or test doubles - can be added without touching it or inheriting from a shared base.`,
            codeExamples: [
                `from typing import Protocol

class Notifier(Protocol):
    def send(self, to: str, message: str) -> bool: ...

class EmailNotifier:
    def send(self, to: str, message: str) -> bool:
        print(f"Email to {to}: {message}")
        return True

class FakeNotifier:                       # for tests
    def __init__(self):
        self.sent = []

    def send(self, to: str, message: str) -> bool:
        self.sent.append((to, message))
        return True

def place_order(customer: str, notifier: Notifier) -> None:
    notifier.send(customer, "Order confirmed")

place_order("abaji@mail.com", EmailNotifier())
fake = FakeNotifier()
place_order("raoji@mail.com", fake)
print(fake.sent)

# OUTPUT:
# Email to abaji@mail.com: Order confirmed
# [('raoji@mail.com', 'Order confirmed')]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Runtime Checks Need @runtime_checkable</h3>
By default a protocol can't be used with <code>isinstance()</code>. Decorating it with <code>@runtime_checkable</code> enables that - but the runtime check only verifies that the <b>methods exist</b>. It does not look at their parameters or return types.`,
            codeExamples: [
                `from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> str: ...

class Circle:
    def draw(self) -> str:
        return "circle"

isinstance(Circle(), Drawable)

# OUTPUT:
# TypeError: Instance and class checks can only be used with @runtime_checkable protocols`,
                `from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> str: ...

class Circle:
    def draw(self) -> str:
        return "circle"

class Wrong:
    def draw(self, x, y, z):              # different signature!
        return 0

print(isinstance(Circle(), Drawable))
print(isinstance(Wrong(), Drawable))      # still True - only the name is checked
print(isinstance("text", Drawable))

# OUTPUT:
# True
# True
# False`
            ]
        },
        {
            content: `<h3>Built-in Protocols You Already Use</h3>
Many standard types work through protocols: a <code>for</code> loop needs <code>__iter__</code>, <code>len()</code> needs <code>__len__</code>, <code>abs()</code> needs <code>__abs__</code>. The <code>collections.abc</code> and <code>typing</code> modules name them, and they recognise matching classes automatically.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Protocol</th><th>Required method</th><th>Used by</th></tr>
<tr class='text-center'><td><code>Iterable</code></td><td><code>__iter__</code></td><td><code>for</code> loops, <code>list()</code></td></tr>
<tr class='text-center'><td><code>Sized</code></td><td><code>__len__</code></td><td><code>len()</code></td></tr>
<tr class='text-center'><td><code>Container</code></td><td><code>__contains__</code></td><td><code>in</code></td></tr>
<tr class='text-center'><td><code>Hashable</code></td><td><code>__hash__</code></td><td>dict keys, sets</td></tr>
<tr class='text-center'><td><code>SupportsAbs</code>, <code>SupportsInt</code>, <code>SupportsFloat</code></td><td><code>__abs__</code>, <code>__int__</code>, <code>__float__</code></td><td><code>abs()</code>, <code>int()</code>, <code>float()</code></td></tr>
</table>`,
            codeExamples: [
                `from collections.abc import Sized, Iterable
from typing import SupportsAbs

class Playlist:
    def __init__(self, songs):
        self.songs = songs

    def __len__(self):
        return len(self.songs)

p = Playlist(["a", "b", "c"])
print(isinstance(p, Sized), isinstance(p, Iterable))
print(isinstance(-3, SupportsAbs), isinstance("x", SupportsAbs))

# OUTPUT:
# True False
# True False`
            ]
        },
        {
            content: `<h3>Generic Protocols</h3>
Protocols can be generic, describing "something that returns a T" without fixing T. Python 3.12 adds the shorter type-parameter syntax (PEP 695).`,
            codeExamples: [
                `from typing import Protocol

class Reader[T](Protocol):          # Python 3.12+ syntax
    def read(self) -> T: ...

class StringSource:
    def read(self) -> str:
        return "hello"

class NumberSource:
    def read(self) -> int:
        return 42

def first_read[T](source: Reader[T]) -> T:
    return source.read()

print(first_read(StringSource()), first_read(NumberSource()))

# OUTPUT:
# hello 42
#
# A type checker infers first_read(StringSource()) as str and
# first_read(NumberSource()) as int.`
            ]
        },
        {
            content: `<h3>Protocol vs ABC vs Java Interface</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Java interface</th><th>Python ABC</th><th>Python Protocol</th></tr>
<tr class='text-center'><td>Typing style</td><td>Nominal</td><td>Nominal</td><td>Structural</td></tr>
<tr class='text-center'><td>Class must declare it</td><td>Yes (<code>implements</code>)</td><td>Yes (inherit or register)</td><td>No</td></tr>
<tr class='text-center'><td>Checked</td><td>By the compiler</td><td>At instantiation (runtime)</td><td>By type checkers; isinstance only with @runtime_checkable</td></tr>
<tr class='text-center'><td>Works with third-party classes you can't edit</td><td>No</td><td>Via register()</td><td>Yes, automatically</td></tr>
<tr class='text-center'><td>Provides shared code</td><td>Default methods</td><td>Yes</td><td>Possible if subclassed explicitly, but rarely used that way</td></tr>
</table>
<b>Rule of thumb:</b> use a Protocol to describe what a function <b>needs</b> from its arguments; use an ABC when you own a class family and want to share code and enforce implementation at runtime.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a Protocol?</td><td>A <code>typing.Protocol</code> subclass describing required methods/attributes; any class with that structure satisfies it without inheriting</td></tr>
<tr class='text-center'><td>Nominal vs structural typing?</td><td>Nominal: compatibility by declared inheritance (Java interfaces, ABCs). Structural: compatibility by the methods an object actually has (Protocols)</td></tr>
<tr class='text-center'><td>Are Protocols enforced at runtime?</td><td>No - static type checkers enforce them; isinstance works only with @runtime_checkable</td></tr>
<tr class='text-center'><td>What does a runtime_checkable isinstance check verify?</td><td>Only that the required methods exist - not their signatures or return types</td></tr>
<tr class='text-center'><td>Protocol or ABC?</td><td>Protocol for describing dependencies and working with code you don't own; ABC for shared code and runtime enforcement in your own hierarchy</td></tr>
<tr class='text-center'><td>What is "static duck typing"?</td><td>Duck typing ("if it has the methods, it fits") verified by a type checker before running, via Protocols</td></tr>
</table>`
        }
    ]
};
