import type { Topic } from '../../types';

export const whatIsAClosure: Topic = {
    id: 'python-closures-what-is-a-closure',
    name: 'What is a Closure?',
    beginner: [
        {
            content: `<h4>A Function That Remembers</h4>
A <b>closure</b> is a function together with the variables it remembers from the scope where it was <b>defined</b>. Even after the outer function has finished running, the inner function can still use those variables.<br><br>
Three things make a closure:<br>
1. a <b>nested function</b> (a function defined inside another function),<br>
2. the inner function <b>uses a variable of the outer function</b>,<br>
3. the outer function <b>returns</b> (or otherwise hands out) the inner function.`,
            codeExamples: [
                `def make_greeting(greeting):
    def greet(name):                     # nested function
        return f"{greeting}, {name}!"    # uses the outer variable
    return greet                         # outer hands it out

hello = make_greeting("Hello")
namaste = make_greeting("Namaste")

print(hello("Abaji"))
print(namaste("Raoji"))

# OUTPUT:
# Hello, Abaji!
# Namaste, Raoji!`
            ]
        },
        {
            content: `<h4>The Outer Function Is Gone - the Variable Is Not</h4>
When <code>make_greeting("Hello")</code> returns, its local variable <code>greeting</code> would normally disappear. Because <code>greet</code> still needs it, Python keeps it alive and attaches it to the returned function. Each call to the outer function creates a <b>separate</b> closure with its own remembered values.`,
            codeExamples: [
                `def make_multiplier(factor):
    def multiply(n):
        return n * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(10), triple(10))
print([double(n) for n in range(4)])

# OUTPUT:
# 20 30
# [0, 2, 4, 6]`
            ]
        },
        {
            content: `<h4>A Practical Example: Pre-Configured Calculators</h4>
Closures are a neat way to "bake in" settings once and reuse them many times.`,
            codeExamples: [
                `def make_price_calculator(tax_rate, discount):
    def final_price(amount):
        return round(amount * (1 - discount) * (1 + tax_rate), 2)
    return final_price

retail = make_price_calculator(tax_rate=0.18, discount=0.0)
member = make_price_calculator(tax_rate=0.18, discount=0.10)

print(retail(1000))
print(member(1000))

# OUTPUT:
# 1180.0
# 1062.0`
            ]
        },
        {
            content: `<h4>Not Every Nested Function Is a Closure</h4>
If the inner function doesn't use any variable from the outer function, nothing needs to be remembered. Python shows this through the function's <code>__closure__</code> attribute: <code>None</code> means "no captured variables".`,
            codeExamples: [
                `def outer():
    def inner(x):
        return x + 1           # uses only its own parameter
    return inner

def make_adder(n):
    def add(x):
        return x + n           # uses n from the outer function
    return add

print(outer().__closure__)
print(make_adder(5).__closure__ is None)

# OUTPUT:
# None
# False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Looking Inside a Closure</h3>
The names a function captures are listed in <code>__code__.co_freevars</code>, and the values live in <b>cell</b> objects in <code>__closure__</code> (same order). <code>cell.cell_contents</code> reads a captured value. CPython lists free variables in alphabetical order.`,
            codeExamples: [
                `def make_price_calculator(tax_rate, discount):
    def final_price(amount):
        return round(amount * (1 - discount) * (1 + tax_rate), 2)
    return final_price

member = make_price_calculator(0.18, 0.10)

print(member.__code__.co_freevars)
print([cell.cell_contents for cell in member.__closure__])
print(len(member.__closure__))

# OUTPUT:
# ('discount', 'tax_rate')
# [0.1, 0.18]
# 2`
            ]
        },
        {
            content: `<h3>Closures vs Small Classes</h3>
A closure is a lightweight object: data (the captured variables) plus one behaviour (the function). For a single operation it is shorter than a class; once you need several methods or want callers to inspect the state, a class is clearer.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Closure</th><th>Class</th></tr>
<tr class='text-center'><td>Best for</td><td>One behaviour with a little configuration</td><td>Several related methods, richer state</td></tr>
<tr class='text-center'><td>State visibility</td><td>Hidden (only via __closure__)</td><td>Explicit attributes</td></tr>
<tr class='text-center'><td>Code size</td><td>Very small</td><td>More boilerplate</td></tr>
<tr class='text-center'><td>Typical uses</td><td>Callbacks, key functions, decorators, factories</td><td>Domain objects, services</td></tr>
</table>`,
            codeExamples: [
                `# Closure version
def make_multiplier(factor):
    def multiply(n):
        return n * factor
    return multiply

# Class version - same behaviour
class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, n):
        return n * self.factor

print(make_multiplier(4)(5), Multiplier(4)(5))

# OUTPUT:
# 20 20`
            ]
        },
        {
            content: `<h3>Compared with Java Lambdas</h3>
Java lambdas and anonymous classes can also capture local variables, but only <b>effectively final</b> ones - the compiler rejects code that changes a captured local. Python closures capture the <b>variable itself</b>, so a closure can even rebind it with <code>nonlocal</code> (see <i>nonlocal in Closures</i>).`,
            codeExamples: [
                `# Java:
#   int factor = 3;
#   Function<Integer, Integer> times = n -> n * factor;   // OK
#   factor = 4;     // compile error: factor must be effectively final
#
# Python happily allows the outer variable to change:
def make_times():
    factor = 3
    def times(n):
        return n * factor
    factor = 4              # the closure sees the new value
    return times

print(make_times()(10))

# OUTPUT:
# 40`
            ]
        },
        {
            content: `<h3>Where Closures Show Up</h3>
• <b>Decorators</b> - the wrapper function is a closure over the decorated function (next module).<br>
• <b>Callbacks</b> - GUI handlers and event listeners that need extra context.<br>
• <b>Function factories</b> - <code>make_validator(min_len)</code>, <code>make_formatter(currency)</code>.<br>
• <b>Memoisation</b> - a cache dictionary captured by a helper function.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a closure?</td><td>A function that remembers variables from the enclosing scope where it was defined, even after that scope has finished</td></tr>
<tr class='text-center'><td>What three conditions create a closure?</td><td>A nested function, which references a variable of the enclosing function, and is returned or passed out of it</td></tr>
<tr class='text-center'><td>Where are captured values stored?</td><td>In cell objects in <code>func.__closure__</code>; the names are in <code>func.__code__.co_freevars</code></td></tr>
<tr class='text-center'><td>What is <code>__closure__</code> for a function that captures nothing?</td><td>None</td></tr>
<tr class='text-center'><td>Closure vs class?</td><td>A closure suits one behaviour with small hidden state; a class suits several methods or state callers need to see</td></tr>
<tr class='text-center'><td>How does this differ from Java lambdas?</td><td>Java captures only effectively final locals; Python captures the variable, which may change or be rebound with nonlocal</td></tr>
</table>`
        }
    ]
};
