import type { Topic } from '../../types';

export const lazyEvaluation: Topic = {
    id: 'python-iterators-generators-lazy-evaluation',
    name: 'Lazy Evaluation',
    beginner: [
        {
            content: `<h4>Eager vs Lazy</h4>
• <b>Eager</b> evaluation computes everything immediately (a list comprehension builds every item right away).<br>
• <b>Lazy</b> evaluation computes a value only <b>when it is actually needed</b>.<br><br>
Lazy code saves time (work that is never needed is never done) and memory (values don't all have to exist at once). Java Streams are lazy in the same way: nothing runs until a terminal operation such as <code>collect()</code>.`
        },
        {
            content: `<h4>Lazy Tools You Already Use</h4>
<code>range</code>, <code>map</code>, <code>filter</code>, <code>zip</code>, <code>enumerate</code>, generator functions and generator expressions are all lazy. <code>range</code> doesn't even store its numbers - it calculates them.`,
            codeExamples: [
                `r = range(10 ** 12)                  # a trillion numbers, no memory used
print(r[-1], 10 ** 11 in r, len(r))

def slow_square(n):
    print("computing", n)
    return n * n

squares = map(slow_square, [1, 2, 3, 4])
print("map created")                 # nothing computed yet
for s in squares:
    if s > 3:
        print("found", s)
        break                        # 3 and 4 are never computed

# OUTPUT:
# 999999999999 True 1000000000000
# map created
# computing 1
# computing 2
# found 4`
            ]
        },
        {
            content: `<h4>Processing Large Files Line by Line</h4>
A file object is a lazy iterator over lines. Looping over it keeps only one line in memory, so the same code works for a 1 KB file and a 10 GB log. (<code>io.StringIO</code> stands in for a real file here.)`,
            codeExamples: [
                `import io

log = io.StringIO("INFO start\\nERROR disk full\\nINFO retry\\nERROR timeout\\n")

errors = 0
for line in log:                     # reads one line at a time
    if line.startswith("ERROR"):
        errors += 1
print("errors:", errors)

# Avoid for big files: log.read() or log.readlines() load everything at once
# OUTPUT:
# errors: 2`
            ]
        },
        {
            content: `<h4>Short-Circuiting Is Laziness Too</h4>
<code>and</code>, <code>or</code>, <code>any()</code> and <code>all()</code> stop as soon as the answer is known. Combined with a generator, the remaining items are never even produced.`,
            codeExamples: [
                `def check(n):
    print("checking", n)
    return n > 10

print(any(check(n) for n in [4, 25, 7, 99]))

# OUTPUT:
# checking 4
# checking 25
# True`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Infinite Sequences</h3>
Laziness makes infinite sequences practical: describe the whole sequence, then take only what you need with <code>islice</code> or <code>takewhile</code>. Never call <code>list()</code>, <code>len()</code> or <code>sorted()</code> on an infinite iterator - it never finishes.`,
            codeExamples: [
                `from itertools import count, islice, takewhile

evens = (n for n in count() if n % 2 == 0)
print(list(islice(evens, 5)))

squares = (n * n for n in count(1))
print(list(takewhile(lambda n: n < 50, squares)))

def primes():
    n = 2
    while True:
        if all(n % d for d in range(2, int(n ** 0.5) + 1)):
            yield n
        n += 1

print(list(islice(primes(), 10)))

# OUTPUT:
# [0, 2, 4, 6, 8]
# [1, 4, 9, 16, 25, 36, 49]
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]`
            ]
        },
        {
            content: `<h3>Side Effects Run Later Than You Think</h3>
In lazy code, the body runs when values are <b>pulled</b>, not where the expression is written. Prints, logging, database calls and exceptions all happen at consumption time - which can be surprising when debugging.`,
            codeExamples: [
                `def log(n):
    print("processing", n)
    return n

gen = (log(n) for n in range(3))
print("generator created")
first = next(gen)
print("got", first)

# OUTPUT:
# generator created
# processing 0
# got 0`
            ]
        },
        {
            content: `<h3>The Closed-File Trap</h3>
Returning a lazy object that depends on a resource is a classic bug: the <code>with</code> block closes the file before anyone reads from the generator. Make the function itself a generator so the file stays open while it is consumed.`,
            codeExamples: [
                `with open("names.txt", "w", encoding="utf-8") as f:
    f.write("asha\\nravi\\n")

def read_names(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.strip()                    # file stays open while iterating

def read_names_bug(path):
    with open(path, encoding="utf-8") as f:
        return (line.strip() for line in f)      # file closes on return

print(list(read_names("names.txt")))
print(list(read_names_bug("names.txt")))

# OUTPUT:
# ['asha', 'ravi']
# ValueError: I/O operation on closed file.`
            ]
        },
        {
            content: `<h3>The Cost of Materialising</h3>
Every <code>list()</code>, <code>sorted()</code>, <code>len()</code> on a list or <code>tuple()</code> forces the whole computation and stores the result. Keep data lazy for as long as possible and materialise once - only if you really need indexing, several passes or a length.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operation</th><th>Lazy?</th></tr>
<tr class='text-center'><td><code>map</code>, <code>filter</code>, <code>zip</code>, <code>enumerate</code>, <code>reversed</code>, generators</td><td>Yes</td></tr>
<tr class='text-center'><td><code>itertools.islice</code>, <code>chain</code>, <code>takewhile</code>, <code>count</code></td><td>Yes</td></tr>
<tr class='text-center'><td><code>sum</code>, <code>max</code>, <code>any</code>, <code>all</code>, <code>"".join</code></td><td>Consume lazily, keep no list</td></tr>
<tr class='text-center'><td><code>list()</code>, <code>sorted()</code>, <code>set()</code>, <code>tuple()</code></td><td>No - materialise everything</td></tr>
</table>`
        },
        {
            content: `<h3>Lazy Attributes: cached_property and lru_cache</h3>
Laziness also applies to expensive values: compute them the first time they are needed, then reuse the result.`,
            codeExamples: [
                `from functools import cached_property

class Report:
    def __init__(self, rows):
        self.rows = rows

    @cached_property
    def total(self):
        print("computing total...")
        return sum(self.rows)

r = Report([10, 20, 30])
print("report created")
print(r.total)
print(r.total)                       # cached - not recomputed

# OUTPUT:
# report created
# computing total...
# 60
# 60`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is lazy evaluation?</td><td>Computing a value only when it is needed, instead of up front</td></tr>
<tr class='text-center'><td>Name lazy objects in Python</td><td>range, map, filter, zip, enumerate, file objects, generators and most of itertools</td></tr>
<tr class='text-center'><td>How do you read a huge file without loading it?</td><td>Iterate over the file object line by line (or read fixed-size chunks)</td></tr>
<tr class='text-center'><td>How do you take items from an infinite generator?</td><td><code>itertools.islice</code>, <code>takewhile</code>, or <code>next()</code> in a loop with a break</td></tr>
<tr class='text-center'><td>What is the risk of returning a generator from inside a with block?</td><td>The resource closes before the generator is consumed - yield inside the with instead</td></tr>
<tr class='text-center'><td>How are Java Streams similar?</td><td>Intermediate operations are lazy; work happens only when a terminal operation runs</td></tr>
</table>`
        }
    ]
};
