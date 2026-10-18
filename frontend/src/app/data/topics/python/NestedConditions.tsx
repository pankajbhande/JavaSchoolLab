import type { Topic } from '../../types';

export const nestedConditions: Topic = {
    id: 'python-control-flow-nested-conditions',
    name: 'Nested Conditions',
    beginner: [
        {
            content: `<h4>What is a Nested Condition?</h4>
A <b>nested condition</b> is an <code>if</code> statement inside another <code>if</code> (or <code>elif</code> / <code>else</code>) block. The inner condition is only checked when the outer one is true. Each level is indented 4 more spaces.`,
            codeExamples: [
                `age = 25
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Welcome to the concert")
    else:
        print("Please buy a ticket")
else:
    print("Sorry, adults only")

# OUTPUT:
# Welcome to the concert`
            ]
        },
        {
            content: `<h4>Example: Largest of Three Numbers</h4>`,
            codeExamples: [
                `a, b, c = 14, 29, 8

if a >= b:
    if a >= c:
        largest = a
    else:
        largest = c
else:
    if b >= c:
        largest = b
    else:
        largest = c

print("Largest:", largest)
print("Using max():", max(a, b, c))

# OUTPUT:
# Largest: 29
# Using max(): 29`
            ]
        },
        {
            content: `<h4>Example: Leap Year</h4>
A year is a leap year if it is divisible by 4, except century years, which must also be divisible by 400.`,
            codeExamples: [
                `year = 1900

if year % 4 == 0:
    if year % 100 == 0:
        if year % 400 == 0:
            print(year, "is a leap year")
        else:
            print(year, "is not a leap year")
    else:
        print(year, "is a leap year")
else:
    print(year, "is not a leap year")

# OUTPUT:
# 1900 is not a leap year`
            ]
        },
        {
            content: `<h4>Flattening with and / or</h4>
Many nested conditions can be written as a single condition. The leap-year rule becomes one line.`,
            codeExamples: [
                `def is_leap(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

for y in (1900, 2000, 2024, 2026):
    print(y, is_leap(y))

# OUTPUT:
# 1900 False
# 2000 True
# 2024 True
# 2026 False`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Arrow Anti-Pattern</h3>
Deep nesting pushes the important code far to the right ("arrow code") and makes it hard to see which <code>else</code> belongs to which <code>if</code>. A good rule: if you are more than two or three levels deep, restructure.`,
            codeExamples: [
                `def withdraw(account, amount):
    if account is not None:
        if account["active"]:
            if amount > 0:
                if amount <= account["balance"]:
                    account["balance"] -= amount
                    return "Success"
                else:
                    return "Insufficient funds"
            else:
                return "Invalid amount"
        else:
            return "Account inactive"
    else:
        return "No account"`
            ]
        },
        {
            content: `<h3>Guard Clauses: Fail Fast, Return Early</h3>
Check each failure case first and <code>return</code> immediately. The "happy path" then sits at the lowest indentation level, and every rule reads as one line.`,
            codeExamples: [
                `def withdraw(account, amount):
    if account is None:
        return "No account"
    if not account["active"]:
        return "Account inactive"
    if amount <= 0:
        return "Invalid amount"
    if amount > account["balance"]:
        return "Insufficient funds"

    account["balance"] -= amount
    return "Success"

acc = {"active": True, "balance": 1000}
print(withdraw(acc, 300), acc["balance"])
print(withdraw(acc, 5000))

# OUTPUT:
# Success 700
# Insufficient funds`
            ]
        },
        {
            content: `<h3>continue as a Guard Inside Loops</h3>
The same idea works in loops: skip the items you don't want with <code>continue</code> instead of wrapping the real work in another <code>if</code>.`,
            codeExamples: [
                `orders = [
    {"id": 1, "paid": True, "items": 3},
    {"id": 2, "paid": False, "items": 1},
    {"id": 3, "paid": True, "items": 0},
]

for order in orders:
    if not order["paid"]:
        continue
    if order["items"] == 0:
        continue
    print("Shipping order", order["id"])

# OUTPUT:
# Shipping order 1`
            ]
        },
        {
            content: `<h3>Decision Tables</h3>
When the outcome depends on a combination of several conditions, a lookup table keyed by a tuple of conditions can replace a whole tree of nested ifs.`,
            codeExamples: [
                `# (is_member, order_over_1000) -> discount
DISCOUNTS = {
    (True, True): 0.20,
    (True, False): 0.10,
    (False, True): 0.05,
    (False, False): 0.0,
}

def discount(is_member, total):
    return DISCOUNTS[(is_member, total > 1000)]

print(discount(True, 1500), discount(False, 500))

# OUTPUT:
# 0.2 0.0`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a guard clause?</td><td>An early return (or continue) that handles an invalid case first, so the main logic isn't nested</td></tr>
<tr class='text-center'><td>How do you reduce nesting?</td><td>Combine conditions with and/or, use guard clauses, extract functions, or use lookup tables</td></tr>
<tr class='text-center'><td>Write the leap-year condition in one line</td><td><code>y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)</code></td></tr>
<tr class='text-center'><td>Which if does an else belong to?</td><td>The if at the same indentation level - Python has no "dangling else" ambiguity</td></tr>
</table>`
        }
    ]
};
