import type { Topic } from '../../types';

export const practicePatternPrograms: Topic = {
    id: 'python-control-flow-practice-pattern-programs',
    name: 'Practice: Pattern Programs',
    beginner: [
        {
            content: `<h4>Why Pattern Programs?</h4>
Printing shapes with loops is a classic exercise (and a common fresher interview question) because it trains you to think in <b>rows and columns</b>:<br><br>
• The <b>outer loop</b> controls the rows.<br>
• For each row, work out <b>how many spaces</b> and <b>how many symbols</b> it needs, as a formula of the row number <code>i</code>.<br><br>
Python's string repetition (<code>"*" * 3</code> gives <code>***</code>) means many patterns need only one loop.`
        },
        {
            content: `<h4>1. Right-Angled Triangle</h4>
Row <code>i</code> has <code>i</code> stars. <code>" ".join("***")</code> puts a space between the stars.`,
            codeExamples: [
                `n = 5
for i in range(1, n + 1):
    print(" ".join("*" * i))

# OUTPUT:
# *
# * *
# * * *
# * * * *
# * * * * *`
            ]
        },
        {
            content: `<h4>2. Inverted Triangle</h4>
Count the rows down instead of up.`,
            codeExamples: [
                `n = 5
for i in range(n, 0, -1):
    print(" ".join("*" * i))

# OUTPUT:
# * * * * *
# * * * *
# * * *
# * *
# *`
            ]
        },
        {
            content: `<h4>3. Number Triangle</h4>`,
            codeExamples: [
                `n = 4
for i in range(1, n + 1):
    print(" ".join(str(j) for j in range(1, i + 1)))

# OUTPUT:
# 1
# 1 2
# 1 2 3
# 1 2 3 4`
            ]
        },
        {
            content: `<h4>4. Floyd's Triangle</h4>
Consecutive numbers keep counting across rows - a variable outside the loops remembers where we are.`,
            codeExamples: [
                `n = 4
num = 1
for i in range(1, n + 1):
    row = []
    for _ in range(i):
        row.append(str(num))
        num += 1
    print(" ".join(row))

# OUTPUT:
# 1
# 2 3
# 4 5 6
# 7 8 9 10`
            ]
        },
        {
            content: `<h4>5. Right-Aligned Triangle</h4>
<code>rjust(n)</code> pads each row on the left to width <code>n</code>.`,
            codeExamples: [
                `n = 5
for i in range(1, n + 1):
    print(("*" * i).rjust(n))

# OUTPUT:
#     *
#    **
#   ***
#  ****
# *****`
            ]
        },
        {
            content: `<h4>6. Pyramid</h4>
Row <code>i</code> (starting at 1) needs <code>n - i</code> spaces and <code>2*i - 1</code> stars.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Row i</th><th>Spaces (n - i)</th><th>Stars (2i - 1)</th></tr>
<tr class='text-center'><td>1</td><td>3</td><td>1</td></tr>
<tr class='text-center'><td>2</td><td>2</td><td>3</td></tr>
<tr class='text-center'><td>3</td><td>1</td><td>5</td></tr>
<tr class='text-center'><td>4</td><td>0</td><td>7</td></tr>
</table>`,
            codeExamples: [
                `n = 4
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))

# OUTPUT:
#    *
#   ***
#  *****
# *******`
            ]
        },
        {
            content: `<h4>7. Alphabet Triangle</h4>
<code>chr(65)</code> is <code>"A"</code>, so <code>chr(65 + j)</code> walks through the alphabet.`,
            codeExamples: [
                `n = 4
for i in range(1, n + 1):
    print(" ".join(chr(65 + j) for j in range(i)))

# OUTPUT:
# A
# A B
# A B C
# A B C D`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>8. Diamond</h3>
A pyramid followed by an inverted pyramid that skips the middle row.`,
            codeExamples: [
                `n = 3
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))
for i in range(n - 1, 0, -1):
    print(" " * (n - i) + "*" * (2 * i - 1))

# OUTPUT:
#   *
#  ***
# *****
#  ***
#   *`
            ]
        },
        {
            content: `<h3>9. Hollow Square</h3>
Here each cell needs a decision, so a nested loop is used: print a star on the border (first/last row or column) and a space inside.`,
            codeExamples: [
                `n = 4
for i in range(n):
    row = ""
    for j in range(n):
        if i in (0, n - 1) or j in (0, n - 1):
            row += "* "
        else:
            row += "  "
    print(row.rstrip())

# OUTPUT:
# * * * *
# *     *
# *     *
# * * * *`
            ]
        },
        {
            content: `<h3>10. Palindromic Number Pyramid</h3>
Build the left half <code>"123"</code>, then mirror it without repeating the middle digit using the slice <code>left[-2::-1]</code>.`,
            codeExamples: [
                `n = 4
for i in range(1, n + 1):
    left = "".join(str(j) for j in range(1, i + 1))
    print(" " * (n - i) + left + left[-2::-1])

# OUTPUT:
#    1
#   121
#  12321
# 1234321`
            ]
        },
        {
            content: `<h3>11. Pascal's Triangle</h3>
Each number is the sum of the two above it. Build each row from the previous one with <code>zip</code>, then centre the rows using the width of the last row.`,
            codeExamples: [
                `n = 5
rows = [[1]]
for _ in range(n - 1):
    prev = rows[-1]
    rows.append([1] + [a + b for a, b in zip(prev, prev[1:])] + [1])

width = len(" ".join(map(str, rows[-1])))
for row in rows:
    print(" ".join(map(str, row)).center(width).rstrip())

# OUTPUT:
#     1
#    1 1
#   1 2 1
#  1 3 3 1
# 1 4 6 4 1`
            ]
        },
        {
            content: `<h3>How to Solve Any Pattern</h3>
1. Draw the pattern for a small n (say 4) on paper and number the rows.<br>
2. For each row write down: leading spaces, number of symbols, and what the symbols are.<br>
3. Turn each column of that table into a formula in <code>i</code> and <code>n</code> (like <code>n - i</code> and <code>2*i - 1</code>).<br>
4. Use string multiplication for runs of the same character; use a nested loop only when each cell depends on its position.<br>
5. Test with n = 1 - the smallest case catches most off-by-one errors.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many stars are in row i of a pyramid?</td><td>2i - 1, with n - i leading spaces</td></tr>
<tr class='text-center'><td>How do you print without a newline inside a loop?</td><td><code>print(x, end="")</code>, then <code>print()</code> to end the row</td></tr>
<tr class='text-center'><td>What does <code>"*" * 0</code> produce?</td><td>An empty string - useful for rows that need no spaces</td></tr>
<tr class='text-center'><td>Time complexity of printing an n-row triangle?</td><td>O(n²) - about n²/2 characters are printed</td></tr>
<tr class='text-center'><td>How do you generate the next row of Pascal's triangle?</td><td><code>[1] + [a + b for a, b in zip(row, row[1:])] + [1]</code></td></tr>
</table>`
        }
    ]
};
