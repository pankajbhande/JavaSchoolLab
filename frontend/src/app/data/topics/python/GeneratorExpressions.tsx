import type { Topic } from '../../types';

export const generatorExpressions: Topic = {
    id: 'python-iterators-generators-generator-expressions',
    name: 'Generator Expressions',
    beginner: [
        {
            content: `<h4>Comprehension Syntax, Generator Behaviour</h4>
A <b>generator expression</b> looks like a list comprehension with <b>round</b> brackets: <code>(expr for item in iterable if condition)</code>. Instead of building a list, it creates a generator that produces values lazily, one at a time.`,
            codeExamples: [
                `squares_list = [n * n for n in range(5)]
squares_gen = (n * n for n in range(5))

print(squares_list)
print(type(squares_gen).__name__)
print(list(squares_gen))

# OUTPUT:
# [0, 1, 4, 9, 16]
# generator
# [0, 1, 4, 9, 16]`
            ]
        },
        {
            content: `<h4>Feeding Functions Directly</h4>
When a generator expression is the <b>only</b> argument of a call, the extra brackets can be dropped. This is the idiomatic way to sum, count or test values without building a temporary list.`,
            codeExamples: [
                `marks = [72, 35, 88, 19, 64]
words = ["python", "is", "fun"]

print(sum(n * n for n in range(1, 11)))
print(max(len(w) for w in words))
print(any(m < 40 for m in marks))
print(sum(1 for m in marks if m >= 40))        # count passes
print(", ".join(w.upper() for w in words))

# OUTPUT:
# 385
# 6
# True
# 3
# PYTHON, IS, FUN`
            ]
        },
        {
            content: `<h4>Single Use, Like Every Iterator</h4>`,
            codeExamples: [
                `evens = (n for n in range(10) if n % 2 == 0)
print(list(evens))
print(list(evens))                   # exhausted
print(sum(evens))

# OUTPUT:
# [0, 2, 4, 6, 8]
# []
# 0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Memory: Constant vs Proportional</h3>
A list comprehension stores every result; a generator expression stores only its current state, so its size doesn't grow with the input.`,
            codeExamples: [
                `import sys

big_list = [n for n in range(1_000_000)]
big_gen = (n for n in range(1_000_000))

print(sys.getsizeof(big_gen) < sys.getsizeof(big_list))
print(sys.getsizeof((n for n in range(10))) == sys.getsizeof(big_gen))
print(sum(big_gen))

# OUTPUT:
# True
# True
# 499999500000`
            ]
        },
        {
            content: `<h3>Early vs Late Binding: a Classic Gotcha</h3>
The <b>first</b> iterable (after the first <code>in</code>) is evaluated <b>immediately</b> when the generator expression is created. Everything else - the expression, conditions and any further <code>for</code> clauses - is evaluated <b>later</b>, when values are requested, using whatever the variables hold at that moment.`,
            codeExamples: [
                `nums = [1, 2, 3]
gen = (n * 10 for n in nums)
nums = [7, 8, 9]                 # too late: the first iterable was already taken
print(list(gen))

factor = 10
gen = (n * factor for n in [1, 2, 3])
factor = 100                     # used later, when values are produced
print(list(gen))

xs, ys = [1, 2], [10, 20]
gen = (x + y for x in xs for y in ys)
xs, ys = [0], [0]                # xs was bound early, ys is looked up late
print(list(gen))

# OUTPUT:
# [10, 20, 30]
# [100, 200, 300]
# [1, 2]`
            ]
        },
        {
            content: `<h3>Errors in the First Iterable Appear Immediately</h3>
Because the first iterable is evaluated at creation time, a bad source fails right away; errors in the expression only appear when values are pulled.`,
            codeExamples: [
                `gen = (1 / n for n in [1, 0])    # no error yet
print(next(gen))
print(next(gen))

# OUTPUT:
# 1.0
# ZeroDivisionError: division by zero`,
                `gen = (x for x in 5)

# OUTPUT:
# TypeError: 'int' object is not iterable`
            ]
        },
        {
            content: `<h3>Parentheses Rules</h3>
The brackets may only be omitted when the generator expression is the <b>sole</b> argument.`,
            codeExamples: [
                `words = ["kiwi", "fig", "banana"]
print(sorted((w.upper() for w in words), reverse=True))
print(sorted(w.upper() for w in words, reverse=True))

# OUTPUT:
# ['KIWI', 'FIG', 'BANANA']
# SyntaxError: Generator expression must be parenthesized`
            ]
        },
        {
            content: `<h3>When a List Is the Better Choice</h3>
Use a list comprehension when you need <code>len()</code>, indexing, slicing, sorting in place, or several passes over the results - or when the data is small and you want to inspect it while debugging. Use a generator expression when the results are consumed once, especially by <code>sum</code>/<code>any</code>/<code>all</code>/<code>max</code>/<code>"".join</code>, or when the input is large or unbounded.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>List comprehension vs generator expression?</td><td>Square brackets build the whole list now; round brackets create a lazy, single-use generator</td></tr>
<tr class='text-center'><td>When can you omit the parentheses?</td><td>When the generator expression is the only argument of a call, e.g. <code>sum(x for x in xs)</code></td></tr>
<tr class='text-center'><td>Which parts are evaluated immediately?</td><td>Only the first iterable; the rest is evaluated lazily as values are requested</td></tr>
<tr class='text-center'><td>Why prefer <code>sum(x*x for x in data)</code> over <code>sum([x*x for x in data])</code>?</td><td>No temporary list is created, so memory stays constant</td></tr>
<tr class='text-center'><td>Can you call len() on a generator?</td><td>No - generators have no length; convert to a list or count with sum(1 for _ in gen)</td></tr>
</table>`
        }
    ]
};
