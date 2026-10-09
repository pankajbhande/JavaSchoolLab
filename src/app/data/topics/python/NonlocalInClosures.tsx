import type { Topic } from '../../types';

export const nonlocalInClosures: Topic = {
    id: 'python-closures-nonlocal-in-closures',
    name: 'nonlocal in Closures',
    beginner: [
        {
            content: `<h4>Closures That Change Their State</h4>
Reading a captured variable needs nothing special. <b>Rebinding</b> it (<code>=</code>, <code>+=</code>, ...) does: without help, Python treats the name as a new local of the inner function. <code>nonlocal name</code> says "this name belongs to the enclosing function - update that one".`,
            codeExamples: [
                `def make_counter():
    count = 0
    def increment():
        count += 1               # rebinding without nonlocal
        return count
    return increment

counter = make_counter()
counter()

# OUTPUT:
# UnboundLocalError: cannot access local variable 'count' where it is not associated with a value`,
                `def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
print(counter(), counter(), counter())

# OUTPUT:
# 1 2 3`
            ]
        },
        {
            content: `<h4>A Running Average</h4>
<code>nonlocal</code> can list several names. Here the closure keeps a running total and count between calls.`,
            codeExamples: [
                `def make_averager():
    total = 0
    count = 0
    def add(value):
        nonlocal total, count
        total += value
        count += 1
        return total / count
    return add

avg = make_averager()
print(avg(10))
print(avg(20))
print(avg(60))

# OUTPUT:
# 10.0
# 15.0
# 30.0`
            ]
        },
        {
            content: `<h4>An Accumulator with a Limit</h4>
State plus a rule: a daily spending tracker that refuses to go over budget.`,
            codeExamples: [
                `def make_budget(limit):
    spent = 0
    def spend(amount):
        nonlocal spent
        if spent + amount > limit:
            return f"Declined - only {limit - spent} left"
        spent += amount
        return f"OK - spent {spent} of {limit}"
    return spend

today = make_budget(1000)
print(today(400))
print(today(500))
print(today(300))

# OUTPUT:
# OK - spent 400 of 1000
# OK - spent 900 of 1000
# Declined - only 100 left`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Closure with State vs Class with __call__</h3>
Both approaches give you a callable that remembers state. The closure is shorter; the class makes the state visible and easy to reset or extend.`,
            codeExamples: [
                `def make_averager():
    total = 0
    count = 0
    def add(value):
        nonlocal total, count
        total += value
        count += 1
        return total / count
    return add

class Averager:
    def __init__(self):
        self.total = 0
        self.count = 0

    def __call__(self, value):
        self.total += value
        self.count += 1
        return self.total / self.count

closure_avg = make_averager()
class_avg = Averager()
for v in (10, 20, 60):
    closure_avg(v)
    class_avg(v)

print(class_avg.count, class_avg.total)    # state is inspectable
print(closure_avg(30), class_avg(30))

# OUTPUT:
# 3 90
# 30.0 30.0`
            ]
        },
        {
            content: `<h3>Mutating Instead of Rebinding</h3>
<code>nonlocal</code> is only needed to <b>rebind</b> a name. If the captured variable refers to a mutable object, calling its methods changes it without any declaration - the name still points at the same object.`,
            codeExamples: [
                `def make_history():
    values = []                  # captured list
    def add(value):
        values.append(value)     # mutation: no nonlocal needed
        return sum(values) / len(values)
    return add

avg = make_history()
avg(10)
avg(20)
print(avg(60))
print(avg.__closure__[0].cell_contents)

# OUTPUT:
# 30.0
# [10, 20, 60, 30]`
            ]
        },
        {
            content: `<h3>Pitfalls of Hidden State</h3>
• <b>Hard to inspect and reset</b> - the state lives inside the closure; there is no <code>counter.count</code>. Provide a companion function (e.g. <code>reset</code>) or use a class.<br>
• <b>Surprising for callers</b> - a function that returns different results for the same input is harder to test. Name it clearly (<code>next_id</code>, <code>record</code>).<br>
• <b>Each factory call is independent</b> - two counters from two calls never share state; functions from the <i>same</i> call do.`,
            codeExamples: [
                `def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    def reset():
        nonlocal count
        count = 0
    return increment, reset

increment, reset = make_counter()
increment()
increment()
reset()
print(increment())

# OUTPUT:
# 1`
            ]
        },
        {
            content: `<h3>Thread Safety</h3>
<code>count += 1</code> on a captured variable is several bytecode steps (load, add, store), so two threads calling the same closure can lose updates. Guard shared closure state with a lock captured alongside it - or keep closures free of mutable state.`,
            codeExamples: [
                `import threading

def make_safe_counter():
    count = 0
    lock = threading.Lock()
    def increment():
        nonlocal count
        with lock:
            count += 1
            return count
    return increment

counter = make_safe_counter()
threads = [threading.Thread(target=lambda: [counter() for _ in range(10_000)]) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(counter() - 1)

# OUTPUT:
# 40000`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does <code>count += 1</code> in an inner function raise UnboundLocalError?</td><td>Assignment makes count local to the inner function, so it is read before it has a value; declare it nonlocal</td></tr>
<tr class='text-center'><td>When is nonlocal not needed?</td><td>When you only read the variable or mutate the object it refers to (e.g. list.append)</td></tr>
<tr class='text-center'><td>Can nonlocal list several names?</td><td>Yes - <code>nonlocal total, count</code></td></tr>
<tr class='text-center'><td>Closure with nonlocal vs class with __call__?</td><td>Closure is shorter; the class exposes state, supports several methods and is easier to reset and test</td></tr>
<tr class='text-center'><td>Is a closure counter thread-safe?</td><td>No - += is not atomic; protect it with a lock</td></tr>
</table>`
        }
    ]
};
