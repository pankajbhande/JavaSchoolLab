import type { Topic } from '../../types';

export const lexicalScope: Topic = {
    id: 'python-closures-lexical-scope',
    name: 'Lexical Scope',
    beginner: [
        {
            content: `<h4>Scope Comes from Where Code Is Written</h4>
Python uses <b>lexical</b> (also called <b>static</b>) scoping: the variables a function can see are decided by <b>where the function is written</b> in the source code - not by where or by whom it is called. A function looks for names in its own body, then in the functions it is written inside, then in the module, then in the built-ins.`,
            codeExamples: [
                `x = "global x"

def show():
    print(x)                  # written at module level -> sees the global x

def caller():
    x = "caller's x"          # a local of caller - invisible to show()
    show()

caller()

# OUTPUT:
# global x`
            ]
        },
        {
            content: `<h4>Closures Keep Their Defining Scope</h4>
A closure carries its defining scope with it. Wherever it is later called - from another function, another module, a callback system - it still sees the variables from the place it was written.`,
            codeExamples: [
                `def make_reporter():
    label = "defined in make_reporter"
    def report():
        print(label)
    return report

def run(task):
    label = "defined in run"      # same name, different scope
    task()

run(make_reporter())

# OUTPUT:
# defined in make_reporter`
            ]
        },
        {
            content: `<h4>LEGB with Nested Functions</h4>
For nested functions the <b>E</b> in LEGB (Local, Enclosing, Global, Built-in) can be several layers deep. Python searches outward one enclosing function at a time and uses the <b>nearest</b> match.`,
            codeExamples: [
                `level = "global"

def outer():
    level = "outer"
    def middle():
        def inner():
            print(level)          # not in inner or middle -> found in outer
        inner()
    middle()

outer()

def outer2():
    level = "outer2"
    def middle2():
        level = "middle2"         # nearer enclosing scope wins
        def inner2():
            print(level)
        inner2()
    middle2()

outer2()

# OUTPUT:
# outer
# middle2`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Lexical vs Dynamic Scoping</h3>
In <b>dynamic</b> scoping (used by some shells and old Lisps), a free name is looked up in the <b>caller's</b> scope at run time. Python, Java, JavaScript and most modern languages use <b>lexical</b> scoping, so you can understand a function by reading the code around it - you never need to know who calls it.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Lexical (Python)</th><th>Dynamic</th></tr>
<tr class='text-center'><td>Free names resolved in</td><td>The scope where the function is written</td><td>The scope of whoever calls it</td></tr>
<tr class='text-center'><td>Known when?</td><td>From the source text</td><td>Only at run time</td></tr>
<tr class='text-center'><td>In the first example</td><td>Prints "global x"</td><td>Would print "caller's x"</td></tr>
</table>`
        },
        {
            content: `<h3>Scope Is Fixed at Compile Time, Values at Call Time</h3>
When Python compiles a function it decides <b>which scope</b> every name belongs to. The <b>value</b> is looked up only when the code runs. So an inner function may use an outer variable that is assigned <i>after</i> the inner function is defined - as long as it exists by the time the inner function is called.`,
            codeExamples: [
                `def outer():
    def inner():
        return total              # total belongs to outer's scope
    total = 42                    # assigned after inner was defined
    return inner

print(outer()())

# OUTPUT:
# 42`
            ]
        },
        {
            content: `<h3>Class Bodies Are Not Enclosing Scopes</h3>
Methods are written inside a class, but the class body is <b>not</b> part of their lexical chain. Class attributes must be reached through <code>self</code> or the class name. (The same rule affects comprehensions inside class bodies - see <i>Nested Comprehensions</i>.)`,
            codeExamples: [
                `class Config:
    level = 3

    def broken(self):
        return level              # not visible: class body is skipped

    def works(self):
        return self.level

cfg = Config()
print(cfg.works())
try:
    cfg.broken()
except NameError as error:
    print(type(error).__name__)

# OUTPUT:
# 3
# NameError`
            ]
        },
        {
            content: `<h3>Why Lexical Scope Makes Closures Possible</h3>
Because a function's free variables are tied to the place it was written, Python can package those variables with the function object when it is created. That package is the closure. With dynamic scoping there would be nothing to package - the values would come from whoever called the function.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does Python use lexical or dynamic scoping?</td><td>Lexical - names are resolved by where the code is written</td></tr>
<tr class='text-center'><td>If f() uses x and g() defines a local x before calling f(), which x does f see?</td><td>Not g's - f sees the x from its own defining scope (e.g. the global)</td></tr>
<tr class='text-center'><td>With several enclosing functions, which variable is used?</td><td>The nearest enclosing definition</td></tr>
<tr class='text-center'><td>Can a method see class attributes by bare name?</td><td>No - the class body is not an enclosing scope; use self.attr or ClassName.attr</td></tr>
<tr class='text-center'><td>When is a name's scope decided, and when its value?</td><td>Scope at compile time; value when the line executes</td></tr>
</table>`
        }
    ]
};
