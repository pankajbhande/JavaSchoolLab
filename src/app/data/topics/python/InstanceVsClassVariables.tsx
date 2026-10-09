import type { Topic } from '../../types';

export const instanceVsClassVariables: Topic = {
    id: 'python-oop-instance-vs-class-variables',
    name: 'Instance vs Class Variables',
    beginner: [
        {
            content: `<h4>Two Kinds of Variables in a Class</h4>
• An <b>instance variable</b> belongs to one object. It is usually created in <code>__init__</code> with <code>self.name = ...</code>, and every object has its own copy.<br>
• A <b>class variable</b> is defined directly in the class body. There is <b>one copy, shared by all objects</b> - like a <code>static</code> field in Java.`,
            codeExamples: [
                `class Student:
    school = "DHIPAN Academy"          # class variable - shared

    def __init__(self, name, marks):
        self.name = name                # instance variables - per object
        self.marks = marks

a = Student("Asha", 91)
b = Student("Ravi", 78)

print(a.name, a.marks, a.school)
print(b.name, b.marks, b.school)
print(Student.school)                   # read it through the class too

# OUTPUT:
# Asha 91 DHIPAN Academy
# Ravi 78 DHIPAN Academy
# DHIPAN Academy`
            ]
        },
        {
            content: `<h4>Changing a Class Variable Affects Everyone</h4>
Assign through the <b>class name</b> to change the shared value.`,
            codeExamples: [
                `class Student:
    school = "DHIPAN Academy"

    def __init__(self, name):
        self.name = name

a = Student("Asha")
b = Student("Ravi")

Student.school = "DHIPAN Institute"     # change it once, on the class
print(a.school, "|", b.school)

# OUTPUT:
# DHIPAN Institute | DHIPAN Institute`
            ]
        },
        {
            content: `<h4>Counting Instances</h4>
A class variable is the natural place for data about the class as a whole, such as how many objects have been created.`,
            codeExamples: [
                `class Order:
    count = 0                           # shared counter

    def __init__(self, item):
        Order.count += 1                # update via the class
        self.order_no = Order.count     # each order gets its own number
        self.item = item

o1 = Order("pen")
o2 = Order("book")
o3 = Order("bag")
print(Order.count, o1.order_no, o3.order_no)

# OUTPUT:
# 3 1 3`
            ]
        },
        {
            content: `<h4>Constants on the Class</h4>
Values that are the same for every object and never change - limits, rates, defaults - are written as UPPER_CASE class variables.`,
            codeExamples: [
                `class SavingsAccount:
    INTEREST_RATE = 0.04
    MIN_BALANCE = 1000

    def __init__(self, balance):
        self.balance = balance

    def yearly_interest(self):
        return self.balance * self.INTEREST_RATE

acc = SavingsAccount(50000)
print(acc.yearly_interest(), SavingsAccount.MIN_BALANCE)

# OUTPUT:
# 2000.0 1000`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Shadowing Trap</h3>
Reading <code>self.count</code> finds the class variable if the object has no attribute of that name. But <b>assigning</b> <code>self.count = ...</code> (including <code>self.count += 1</code>) always creates an <b>instance</b> attribute that hides the class one - the class variable is not changed.`,
            codeExamples: [
                `class Visitor:
    count = 0

    def __init__(self):
        self.count += 1                 # BUG: reads 0 from the class, writes to the instance

v1 = Visitor()
v2 = Visitor()
print(Visitor.count, v1.count, v2.count)

# OUTPUT:
# 0 1 1`
            ]
        },
        {
            content: `<h3>The Mutable Class Variable Trap</h3>
A list or dict defined as a class variable is <b>one object shared by every instance</b>. Mutating it through one object changes it for all of them. Create mutable per-object data in <code>__init__</code>.`,
            codeExamples: [
                `class Cart:
    items = []                          # BUG: one list for every cart

    def add(self, item):
        self.items.append(item)         # mutates the shared list

c1 = Cart()
c2 = Cart()
c1.add("pen")
print(c2.items)

class FixedCart:
    def __init__(self):
        self.items = []                 # a new list per cart

    def add(self, item):
        self.items.append(item)

f1 = FixedCart()
f2 = FixedCart()
f1.add("pen")
print(f1.items, f2.items)

# OUTPUT:
# ['pen']
# ['pen'] []`
            ]
        },
        {
            content: `<h3>Attribute Lookup Order and __dict__</h3>
<code>obj.attr</code> is looked up in this order: the object's own <code>__dict__</code>, then its class, then the base classes (following the MRO). Instance variables live in the object's <code>__dict__</code>; class variables live in the class's <code>__dict__</code>.`,
            codeExamples: [
                `class Student:
    school = "DHIPAN"

    def __init__(self, name):
        self.name = name

s = Student("Asha")
print(s.__dict__)                       # only instance data
print("school" in Student.__dict__, "school" in s.__dict__)

s.school = "Other"                      # creates an instance attribute
print(s.__dict__)
print(s.school, Student.school)

del s.school                            # remove it: the class value shows again
print(s.school)

# OUTPUT:
# {'name': 'Asha'}
# True False
# {'name': 'Asha', 'school': 'Other'}
# Other DHIPAN
# DHIPAN`
            ]
        },
        {
            content: `<h3>Java static Fields vs Python Class Variables</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td>Declaration</td><td><code>static int count;</code></td><td><code>count = 0</code> in the class body</td></tr>
<tr class='text-center'><td>Instance fields</td><td>Declared in the class body</td><td>Created by assigning <code>self.x</code> (usually in <code>__init__</code>)</td></tr>
<tr class='text-center'><td>Writing <code>obj.count = 5</code></td><td>Changes the static field (with a warning)</td><td>Creates an instance attribute that shadows it</td></tr>
<tr class='text-center'><td>Constants</td><td><code>static final</code></td><td>UPPER_CASE by convention (not enforced)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Instance vs class variable?</td><td>An instance variable belongs to one object; a class variable is defined in the class body and shared by all objects</td></tr>
<tr class='text-center'><td>Why does <code>self.count += 1</code> not update a class counter?</td><td>Assignment through self creates an instance attribute; update it via <code>ClassName.count</code></td></tr>
<tr class='text-center'><td>Why is <code>items = []</code> as a class variable dangerous?</td><td>The single list is shared by every instance, so one object's changes appear in all</td></tr>
<tr class='text-center'><td>In what order are attributes looked up?</td><td>Instance __dict__, then the class, then base classes in MRO order</td></tr>
<tr class='text-center'><td>What is the Java equivalent of a class variable?</td><td>A static field</td></tr>
</table>`
        }
    ]
};
