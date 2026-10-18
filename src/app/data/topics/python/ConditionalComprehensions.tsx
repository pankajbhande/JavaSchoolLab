import type { Topic } from '../../types';

export const conditionalComprehensions: Topic = {
    id: 'python-comprehensions-conditional-comprehensions',
    name: 'Conditional Comprehensions',
    beginner: [
        {
            content: `<h4>Filtering with a Trailing if</h4>
Add <code>if condition</code> at the <b>end</b> of a comprehension to keep only the items for which the condition is true:<br><br>
<code>[expression for item in iterable if condition]</code>`,
            codeExamples: [
                `nums = [5, -3, 8, 0, -1, 12]

evens = [x for x in nums if x % 2 == 0]
positives = [x for x in nums if x > 0]
print(evens)
print(positives)

# OUTPUT:
# [8, 0, 12]
# [5, 8, 12]`
            ]
        },
        {
            content: `<h4>The Loop It Replaces</h4>`,
            codeExamples: [
                `marks = [72, 35, 88, 19, 40]

# Loop version
passed = []
for m in marks:
    if m >= 40:
        passed.append(m)

# Comprehension version
passed = [m for m in marks if m >= 40]
print(passed)

# OUTPUT:
# [72, 88, 40]`
            ]
        },
        {
            content: `<h4>Several Conditions</h4>
Combine conditions with <code>and</code> / <code>or</code>. Writing several <code>if</code> clauses one after another also works - they all have to be true.`,
            codeExamples: [
                `nums = [5, -3, 8, 0, -1, 12]

print([x for x in nums if x > 0 and x % 2 == 0])
print([x for x in nums if x > 0 if x % 2 == 0])      # same meaning
print([x for x in nums if x < 0 or x > 10])

# OUTPUT:
# [8, 12]
# [8, 12]
# [-3, -1, 12]`
            ]
        },
        {
            content: `<h4>Choosing a Value with if-else at the Front</h4>
To <b>transform every item</b> differently depending on a condition, put a conditional expression (<code>a if condition else b</code>) in the <b>expression</b> part. Nothing is removed - every item produces a value.`,
            codeExamples: [
                `nums = [5, -3, 8, 0, -1, 12]
print([x if x > 0 else 0 for x in nums])        # replace negatives with 0

marks = [72, 35, 88]
print(["pass" if m >= 40 else "fail" for m in marks])

# OUTPUT:
# [5, 0, 8, 0, 0, 12]
# ['pass', 'fail', 'pass']`
            ]
        },
        {
            content: `<h4>Front vs End: Two Different Jobs</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Position</th><th>Form</th><th>Purpose</th><th>Result length</th></tr>
<tr class='text-center'><td>End</td><td><code>[x for x in data if cond]</code></td><td>Filter - drop items</td><td>Can be shorter</td></tr>
<tr class='text-center'><td>Front</td><td><code>[a if cond else b for x in data]</code></td><td>Choose a value for each item</td><td>Always the same</td></tr>
</table>
An <code>if</code> at the front <b>must</b> have an <code>else</code> - it is a conditional expression, and an expression always needs a value. An <code>if</code> at the end must <b>not</b> have an <code>else</code>.`,
            codeExamples: [
                `nums = [5, -3, 8]
print([x if x > 0 for x in nums])

# OUTPUT:
# SyntaxError: expected 'else' after 'if' expression`
            ]
        },
        {
            content: `<h4>Using Both Together</h4>
Filter first (the end), then transform what is left (the front).`,
            codeExamples: [
                `nums = [5, -3, 8, 0, -1, 12]

# keep non-negative numbers; double the ones greater than 5
print([x * 2 if x > 5 else x for x in nums if x >= 0])

# OUTPUT:
# [5, 16, 0, 24]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Readability Limits</h3>
A conditional expression can be chained, but two levels is about the limit before readers have to slow down. Past that, move the decision into a named function - the comprehension then reads like a sentence.`,
            codeExamples: [
                `nums = [-2, 0, 7]

# Hard to scan
labels = ["negative" if x < 0 else "zero" if x == 0 else "positive" for x in nums]
print(labels)

# Clearer
def sign_label(x):
    if x < 0:
        return "negative"
    if x == 0:
        return "zero"
    return "positive"

print([sign_label(x) for x in nums])

# OUTPUT:
# ['negative', 'zero', 'positive']
# ['negative', 'zero', 'positive']`
            ]
        },
        {
            content: `<h3>Named Helpers for Complex Filters</h3>
A filter with several rules is easier to read, test and reuse as a function.`,
            codeExamples: [
                `def is_valid_email(email):
    return "@" in email and "." in email.split("@")[-1] and " " not in email

emails = ["abaji@mail.com", "raoji@mail", "kanhoji mail@x.com", "sheru@x.in"]
print([e for e in emails if is_valid_email(e)])

# OUTPUT:
# ['abaji@mail.com', 'sheru@x.in']`
            ]
        },
        {
            content: `<h3>Removing Falsy Values vs Only None</h3>
<code>if x</code> drops every falsy value - empty strings and <code>0</code> as well as <code>None</code>. When <code>0</code> or <code>""</code> are valid data, test for <code>None</code> explicitly.`,
            codeExamples: [
                `data = ["a", "", None, "b", 0]

print([x for x in data if x])                  # drops "", None and 0
print([x for x in data if x is not None])      # drops only None

# OUTPUT:
# ['a', 'b']
# ['a', '', 'b', 0]`
            ]
        },
        {
            content: `<h3>Filtering on a Computed Value with :=</h3>
When the condition needs the result of an expensive call that you also want to keep, the walrus operator computes it once and reuses it in both places.`,
            codeExamples: [
                `def to_int(text):
    try:
        return int(text)
    except ValueError:
        return None

raw = ["10", "abc", "7", "-3"]

# Without walrus: to_int() would run twice per item
values = [n for s in raw if (n := to_int(s)) is not None and n > 0]
print(values)

# OUTPUT:
# [10, 7]`
            ]
        },
        {
            content: `<h3>Comprehensions vs filter() and map()</h3>
<code>filter</code> and <code>map</code> do the same jobs, but nesting them with lambdas is usually harder to read than one comprehension. They remain a good fit when you already have a named function, such as <code>map(int, parts)</code>. Java Streams express the same pipeline with <code>filter</code> and <code>map</code>.`,
            codeExamples: [
                `nums = [5, -3, 8, 0, -1, 12]

print(list(map(lambda x: x * x, filter(lambda x: x % 2 == 0, nums))))
print([x * x for x in nums if x % 2 == 0])

# Java:
#   nums.stream().filter(x -> x % 2 == 0).map(x -> x * x).collect(Collectors.toList());
#
# OUTPUT:
# [64, 0, 144]
# [64, 0, 144]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Where does a filtering if go?</td><td>At the end: <code>[x for x in data if cond]</code></td></tr>
<tr class='text-center'><td>Where does an if-else go?</td><td>In the expression at the front: <code>[a if cond else b for x in data]</code></td></tr>
<tr class='text-center'><td>Why is <code>[x if x &gt; 0 for x in nums]</code> a SyntaxError?</td><td>A front if is a conditional expression and must have an else</td></tr>
<tr class='text-center'><td>Can a comprehension have several ifs?</td><td>Yes - consecutive if clauses must all be true, like joining them with and</td></tr>
<tr class='text-center'><td>Comprehension vs filter()/map()?</td><td>Same result; comprehensions are usually clearer, map/filter are neat with existing named functions</td></tr>
</table>`
        }
    ]
};
