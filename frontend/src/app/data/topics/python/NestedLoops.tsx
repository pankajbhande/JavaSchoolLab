import type { Topic } from '../../types';

export const nestedLoops: Topic = {
    id: 'python-control-flow-nested-loops',
    name: 'Nested Loops',
    beginner: [
        {
            content: `<h4>What is a Nested Loop?</h4>
A <b>nested loop</b> is a loop inside another loop. For <b>every</b> iteration of the outer loop, the inner loop runs <b>completely</b>. If the outer loop runs 3 times and the inner loop 4 times, the inner body runs 3 × 4 = 12 times.`,
            codeExamples: [
                `for i in range(1, 4):
    for j in range(1, 3):
        print(f"i={i}, j={j}")
    print("-- end of row", i)

# OUTPUT:
# i=1, j=1
# i=1, j=2
# -- end of row 1
# i=2, j=1
# i=2, j=2
# -- end of row 2
# i=3, j=1
# i=3, j=2
# -- end of row 3`
            ]
        },
        {
            content: `<h4>Multiplication Table</h4>
The outer loop picks the row, the inner loop fills the columns. <code>end=""</code> keeps a row on one line and the empty <code>print()</code> ends it.`,
            codeExamples: [
                `for i in range(1, 6):
    for j in range(1, 6):
        print(f"{i * j:4}", end="")
    print()

# OUTPUT:
#    1   2   3   4   5
#    2   4   6   8  10
#    3   6   9  12  15
#    4   8  12  16  20
#    5  10  15  20  25`
            ]
        },
        {
            content: `<h4>Working with a 2D Grid</h4>
A list of lists represents a grid or matrix. Loop over the rows, then over the values in each row.`,
            codeExamples: [
                `marks = [
    [78, 85, 90],     # Pankaj
    [66, 72, 58],     # Sheru
    [91, 88, 95],     # Dheeraj
]

for row in marks:
    total = 0
    for m in row:
        total += m
    print(row, "total =", total)

# OUTPUT:
# [78, 85, 90] total = 253
# [66, 72, 58] total = 196
# [91, 88, 95] total = 274`
            ]
        },
        {
            content: `<h4>Finding Pairs</h4>
Starting the inner loop at <code>i + 1</code> visits each pair only once and never pairs an element with itself.`,
            codeExamples: [
                `nums = [2, 7, 11, 15, 4, 5]
target = 9

for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            print(nums[i], "+", nums[j], "=", target)

# OUTPUT:
# 2 + 7 = 9
# 4 + 5 = 9`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Breaking Out of Nested Loops</h3>
<code>break</code> leaves only the innermost loop. Four ways to stop everything once you've found what you need - the function version is usually the clearest.`,
            codeExamples: [
                `grid = [[1, 3, 5], [7, 8, 9], [10, 12, 13]]

# 1. A flag
found = None
for r, row in enumerate(grid):
    for c, value in enumerate(row):
        if value % 2 == 0:
            found = (r, c, value)
            break
    if found:
        break
print("flag:", found)

# 2. A function - return exits every loop at once
def first_even(grid):
    for r, row in enumerate(grid):
        for c, value in enumerate(row):
            if value % 2 == 0:
                return (r, c, value)
    return None
print("function:", first_even(grid))

# 3. for-else: break the outer loop only if the inner one broke
for row in grid:
    for value in row:
        if value % 2 == 0:
            break
    else:
        continue
    break
print("for-else:", value)

# 4. Flatten the two loops into one with itertools.product
from itertools import product
for r, c in product(range(3), range(3)):
    if grid[r][c] % 2 == 0:
        print("product:", (r, c, grid[r][c]))
        break

# OUTPUT:
# flag: (1, 1, 8)
# function: (1, 1, 8)
# for-else: 8
# product: (1, 1, 8)`
            ]
        },
        {
            content: `<h3>Complexity: Nested Loops Multiply</h3>
Two nested loops over n items do about n² steps: 1,000 items means about a million iterations, 100,000 items about ten billion. The pair-sum search above is O(n²); a set brings it down to O(n) - a standard interview improvement.`,
            codeExamples: [
                `def pairs_with_sum(nums, target):
    seen = set()
    result = []
    for n in nums:
        if target - n in seen:          # O(1) set lookup replaces the inner loop
            result.append((target - n, n))
        seen.add(n)
    return result

print(pairs_with_sum([2, 7, 11, 15, 4, 5], 9))

# OUTPUT:
# [(2, 7), (4, 5)]`
            ]
        },
        {
            content: `<h3>Nested Comprehensions and zip(*grid)</h3>
Simple nested loops that build lists can be written as comprehensions. The <code>for</code> clauses appear in the <b>same order</b> as in the loop version.`,
            codeExamples: [
                `grid = [[1, 2, 3], [4, 5, 6]]

flat = [value for row in grid for value in row]
print(flat)

transposed = [[row[c] for row in grid] for c in range(3)]
print(transposed)
print([list(col) for col in zip(*grid)])     # same result, idiomatic

board = [["." for _ in range(3)] for _ in range(2)]
board[0][1] = "X"
print(board)

# OUTPUT:
# [1, 2, 3, 4, 5, 6]
# [[1, 4], [2, 5], [3, 6]]
# [[1, 4], [2, 5], [3, 6]]
# [['.', 'X', '.'], ['.', '.', '.']]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many times does the inner body run?</td><td>outer iterations × inner iterations (if the inner range doesn't depend on the outer variable)</td></tr>
<tr class='text-center'><td>How do you exit two loops at once?</td><td>Return from a function, use a flag, the for-else idiom, or flatten with itertools.product</td></tr>
<tr class='text-center'><td>Time complexity of two nested loops over n items?</td><td>O(n²)</td></tr>
<tr class='text-center'><td>How do you transpose a matrix in Python?</td><td><code>[list(col) for col in zip(*matrix)]</code></td></tr>
<tr class='text-center'><td>Why start the inner loop at <code>i + 1</code> when finding pairs?</td><td>To visit each unordered pair once and avoid pairing an element with itself</td></tr>
</table>`
        }
    ]
};
