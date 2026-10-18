import type { Topic } from '../../types';

export const generatorPipelines: Topic = {
    id: 'python-iterators-generators-generator-pipelines',
    name: 'Generator Pipelines',
    beginner: [
        {
            content: `<h4>Generators Connected Like Pipes</h4>
A <b>generator pipeline</b> is a chain of small generators where each stage takes an iterable as input and yields processed items - like Unix pipes (<code>cat log | grep ERROR | wc -l</code>) or Java Stream operations. Each stage does one job, and items flow through the whole chain one at a time.`
        },
        {
            content: `<h4>Building a Pipeline Step by Step</h4>
Process a sales log: read lines, drop blank ones, keep only INFO records, parse them, and add up the amounts. (<code>io.StringIO</code> stands in for a real file.)`,
            codeExamples: [
                `import io

log = io.StringIO("""INFO user=abaji amount=250
ERROR user=raoji amount=0

INFO user=kanhoji amount=1200
INFO user=abaji amount=99
""")

def read_lines(f):
    for line in f:
        yield line.rstrip("\\n")

def non_empty(lines):
    for line in lines:
        if line.strip():
            yield line

def only_info(lines):
    for line in lines:
        if line.startswith("INFO"):
            yield line

def parse(lines):
    for line in lines:
        fields = dict(part.split("=") for part in line.split()[1:])
        yield fields["user"], int(fields["amount"])

records = parse(only_info(non_empty(read_lines(log))))
total = sum(amount for user, amount in records)
print("total sales:", total)

# OUTPUT:
# total sales: 1549`
            ]
        },
        {
            content: `<h4>The Same Pipeline with Generator Expressions</h4>
Short stages can be written inline. Nothing runs until the final <code>sum()</code> pulls values through.`,
            codeExamples: [
                `import io

log = io.StringIO("INFO abaji 250\\nERROR raoji 0\\n\\nINFO kanhoji 1200\\nINFO abaji 99\\n")

lines = (line.strip() for line in log)
non_blank = (line for line in lines if line)
info = (line for line in non_blank if line.startswith("INFO"))
amounts = (int(line.split()[2]) for line in info)

print(sum(amounts))

# OUTPUT:
# 1549`
            ]
        },
        {
            content: `<h4>Why Pipelines?</h4>
• <b>Constant memory</b> - only one record is in flight at a time, so a 10 GB file is fine.<br>
• <b>Small, testable stages</b> - each function can be tested with a short list.<br>
• <b>Reusable</b> - <code>non_empty</code> or <code>parse</code> can be plugged into other pipelines.<br>
• <b>Readable</b> - each stage's name says what it does.`
        }
    ],

    expert: [
        {
            content: `<h3>Stages Run Interleaved, Not One After Another</h3>
A pipeline does not finish stage 1 before starting stage 2. Each item travels all the way through before the next one is produced - which is what keeps memory constant, and what makes print-debugging output look "mixed up".`,
            codeExamples: [
                `def numbers():
    for n in [1, 2, 3]:
        print("produce", n)
        yield n

def doubled(nums):
    for n in nums:
        print("  double", n)
        yield n * 2

for value in doubled(numbers()):
    print("    consume", value)

# OUTPUT:
# produce 1
#   double 1
#     consume 2
# produce 2
#   double 2
#     consume 4
# produce 3
#   double 3
#     consume 6`
            ]
        },
        {
            content: `<h3>Composable Stages</h3>
Stages that all take an iterable and return an iterable can be combined by a tiny helper, so the pipeline reads top to bottom instead of inside out. <code>itertools</code> functions slot in as stages too.`,
            codeExamples: [
                `from collections import defaultdict
from itertools import islice

def pipeline(source, *stages):
    for stage in stages:
        source = stage(source)
    return source

def strip(lines):
    return (line.strip() for line in lines)

def skip_blank(lines):
    return (line for line in lines if line)

def parse(lines):
    for line in lines:
        user, amount = line.split(",")
        yield user, int(amount)

raw = ["abaji,250", "", "kanhoji,1200", "  abaji,99 ", "raoji,40"]

totals = defaultdict(int)
for user, amount in pipeline(raw, strip, skip_blank, parse):
    totals[user] += amount
print(dict(totals))

first_two = pipeline(raw, strip, skip_blank, parse, lambda rows: islice(rows, 2))
print(list(first_two))

# OUTPUT:
# {'abaji': 349, 'kanhoji': 1200, 'raoji': 40}
# [('abaji', 250), ('kanhoji', 1200)]`
            ]
        },
        {
            content: `<h3>Compared with Java Streams</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java Stream</th><th>Python pipeline</th></tr>
<tr class='text-center'><td><code>Files.lines(path)</code></td><td><code>for line in open(path)</code></td></tr>
<tr class='text-center'><td><code>.filter(...)</code></td><td>a generator with an <code>if</code>, or <code>filter()</code></td></tr>
<tr class='text-center'><td><code>.map(...)</code></td><td>a generator that yields transformed items, or <code>map()</code></td></tr>
<tr class='text-center'><td><code>.limit(n)</code></td><td><code>itertools.islice(it, n)</code></td></tr>
<tr class='text-center'><td><code>.flatMap(...)</code></td><td><code>yield from</code> / <code>chain.from_iterable</code></td></tr>
<tr class='text-center'><td>Terminal op (<code>sum</code>, <code>collect</code>)</td><td><code>sum()</code>, <code>list()</code>, a for loop</td></tr>
</table>
Both are lazy and single-use; Python's stages are ordinary functions, so any custom logic (state, try/except, logging) fits naturally.`
        },
        {
            content: `<h3>Errors in a Stage</h3>
An exception in any stage stops the whole pipeline at the moment that item is pulled. Handle bad records <b>inside</b> the stage if the pipeline should keep going.`,
            codeExamples: [
                `def parse_amounts(lines):
    for line in lines:
        try:
            yield int(line)
        except ValueError:
            print("skipping bad record:", repr(line))

print(sum(parse_amounts(["100", "abc", "250"])))

# OUTPUT:
# skipping bad record: 'abc'
# 350`
            ]
        },
        {
            content: `<h3>When to Reach for pandas Instead</h3>
Generator pipelines are ideal for streaming, line-oriented data and for data that doesn't fit in memory. When you need grouping, joins, sorting, statistics or random access on tabular data that fits in memory, a <b>pandas DataFrame</b> (covered in the Data Science module) is usually simpler and much faster, because its operations run in optimised C code on whole columns.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a generator pipeline?</td><td>A chain of generators where each stage consumes an iterable and yields processed items</td></tr>
<tr class='text-center'><td>Why is memory usage constant?</td><td>Items flow through all stages one at a time; no stage builds a full list</td></tr>
<tr class='text-center'><td>In what order do stages execute?</td><td>Interleaved - each item passes through every stage before the next item is produced</td></tr>
<tr class='text-center'><td>How do you take only the first n results?</td><td>Add <code>itertools.islice(stage, n)</code> as a stage - earlier stages stop producing too</td></tr>
<tr class='text-center'><td>When would you use pandas instead?</td><td>For in-memory tabular analysis needing grouping, joins, sorting or statistics</td></tr>
</table>`
        }
    ]
};
