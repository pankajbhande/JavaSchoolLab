// Module 28 (Data Structures & Algorithms), part C: algorithm paradigms and graph algorithms.
import { dd, r, type DeepDive } from './deepDive';

export const m28c: Record<string, DeepDive> = {
    'Sliding Window': dd(
        [`The <b>sliding window</b> technique keeps a moving range over a sequence. Instead of recomputing everything for each range, you add the element that enters the window and remove the one that leaves, so each element is handled a constant number of times.`,
            r`# Maximum sum of any 3 consecutive numbers
nums = [2, 1, 5, 1, 3, 2]
k = 3
window = sum(nums[:k])              # first window
best = window
for i in range(k, len(nums)):
    window += nums[i] - nums[i - k]   # add the new element, drop the old one
    best = max(best, window)
print(best)

# OUTPUT:
# 9`],
        [`Recomputing every window from scratch repeats the same additions again and again (O(n*k)). Sliding keeps one running value and does O(n) work in total.`,
            r`nums = [2, 1, 5, 1, 3, 2, 4, 6]
k = 3
n = len(nums)

brute_ops, brute_best = 0, 0
for i in range(n - k + 1):
    s = 0
    for j in range(i, i + k):         # re-add k numbers every time
        s += nums[j]
        brute_ops += 1
    brute_best = max(brute_best, s)

slide_ops = k
w = sum(nums[:k])
slide_best = w
for i in range(k, n):
    w += nums[i] - nums[i - k]        # one add, one subtract
    slide_ops += 1
    slide_best = max(slide_best, w)

print("brute ops:", brute_ops, " sliding ops:", slide_ops, " same answer:", brute_best == slide_best, slide_best)

# OUTPUT:
# brute ops: 18  sliding ops: 8  same answer: True 12`],
        [`Rate limiters ("max 100 requests in any 60 seconds"), moving averages in dashboards, network packet windows (TCP) and "longest substring without repeats" all use a window. The variable-size version grows on the right and shrinks on the left.`,
            r`def longest_unique(text):
    last = {}                          # char -> last index where seen
    start = best = 0
    for i, ch in enumerate(text):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1       # shrink the window past the repeat
        last[ch] = i
        best = max(best, i - start + 1)
    return best

print(longest_unique("abcabcbb"))
print(longest_unique("pwwkew"))

# OUTPUT:
# 3
# 3`],
        [`<b>Advantages:</b> turns O(n*k) into O(n), uses O(1) or O(window) memory, and works on streams where the data cannot be stored.`,
            r`# Moving average over a stream: only the running sum is kept
data = [1, 2, 3, 4, 5, 6]
k = 3
total = sum(data[:k])
averages = [total / k]
for i in range(k, len(data)):
    total += data[i] - data[i - k]
    averages.append(total / k)
print(averages)

# OUTPUT:
# [2.0, 3.0, 4.0, 5.0]`],
        [`<b>Disadvantages:</b> it only considers <i>contiguous</i> ranges. If the best answer uses elements that are not adjacent, the window cannot find it.`,
            r`nums = [9, 1, 9]
k = 2
best_window = max(nums[i] + nums[i + 1] for i in range(len(nums) - 1))
best_pair = sorted(nums)[-1] + sorted(nums)[-2]      # any two numbers
print("best window of 2:", best_window)
print("best pair overall:", best_pair)

# OUTPUT:
# best window of 2: 10
# best pair overall: 18`],
        [`<b>Limitations:</b> the "shrink when invalid" logic assumes the condition changes monotonically as the window grows. Edge cases such as a window larger than the data must be handled explicitly.`,
            r`def max_window_sum(nums, k):
    if k <= 0 or k > len(nums):
        return None                    # no valid window exists
    w = sum(nums[:k])
    best = w
    for i in range(k, len(nums)):
        w += nums[i] - nums[i - k]
        best = max(best, w)
    return best

print(max_window_sum([1, 2, 3], 5))
print(max_window_sum([1, 2, 3], 2))

# OUTPUT:
# None
# 5`],
        r`
   data:  [ 2  1  5  1  3  2 ]      k = 3

   step 1 [ 2  1  5 ] 1  3  2       sum = 8
   step 2   2 [ 1  5  1 ] 3  2      sum = 8 - 2 + 1 = 7
   step 3   2  1 [ 5  1  3 ] 2      sum = 7 - 1 + 3 = 9   <- best
   step 4   2  1  5 [ 1  3  2 ]     sum = 9 - 5 + 2 = 6

   add the entering element, remove the leaving one: O(1) per step
`,
        `Use windows for any "best contiguous range" or "last N events" problem. For time-based windows in services (rate limits, metrics), prefer proven constructs (Redis sorted sets, token buckets, a metrics library) over hand-rolled in-memory code, because per-process windows break across multiple instances.`
    ),

    'Recursion & Backtracking': dd(
        [`<b>Recursion</b> solves a problem by calling the same function on a smaller piece until a simple <b>base case</b> stops it. <b>Backtracking</b> is recursion that tries a choice, explores further, and undoes the choice if it leads nowhere.`,
            r`def factorial(n):
    if n <= 1:                    # base case: stops the recursion
        return 1
    return n * factorial(n - 1)   # recursive case: smaller problem

print(factorial(5))               # 5 * 4 * 3 * 2 * 1

# OUTPUT:
# 120`],
        [`Self-similar data (nested lists, folders, trees) is awkward to loop over but trivial to describe recursively: "handle one item, then handle the rest the same way".`,
            r`def flatten(items):
    out = []
    for x in items:
        if isinstance(x, list):
            out += flatten(x)      # nested list: same job, smaller input
        else:
            out.append(x)
    return out

print(flatten([1, [2, [3, 4]], 5]))

# OUTPUT:
# [1, 2, 3, 4, 5]`],
        [`Backtracking solves puzzles and search problems: Sudoku, N-Queens, route and schedule planning, regular-expression matching. Here we place 4 queens on a 4x4 board so none attack each other.`,
            r`def solve(n):
    sols, cols = [], []              # cols[row] = column of the queen in that row
    def place(row):
        if row == n:
            sols.append(cols[:])     # all rows filled: record a solution
            return
        for c in range(n):
            safe = all(c != cc and abs(c - cc) != row - rr for rr, cc in enumerate(cols))
            if safe:
                cols.append(c)       # choose
                place(row + 1)       # explore
                cols.pop()           # un-choose (backtrack)
    place(0)
    return sols

print(len(solve(4)), "solutions:", solve(4))

# OUTPUT:
# 2 solutions: [[1, 3, 0, 2], [2, 0, 3, 1]]`],
        [`<b>Advantages:</b> short, readable code that mirrors the problem; the choose / explore / un-choose pattern generates every combination systematically.`,
            r`def subsets(a):
    out, cur = [], []
    def go(i):
        if i == len(a):
            out.append(cur[:])
            return
        cur.append(a[i]); go(i + 1)      # include a[i]
        cur.pop();        go(i + 1)      # exclude a[i]
    go(0)
    return out

print(subsets([1, 2, 3]))

# OUTPUT:
# [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]`],
        [`<b>Disadvantages:</b> naive recursion can repeat work exponentially. Computing Fibonacci recursively recomputes the same values millions of times.`,
            r`calls = 0
def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("fib(20) =", fib(20), "using", calls, "calls")

# OUTPUT:
# fib(20) = 6765 using 21891 calls`],
        [`<b>Limitations:</b> every call uses a stack frame and CPython limits depth (default about 1000). Python does not optimise tail calls, so deep recursion must be rewritten as a loop. Backtracking itself is exponential in the worst case.`,
            r`import sys

def sum_to(n):
    return 0 if n == 0 else n + sum_to(n - 1)

print("limit:", sys.getrecursionlimit())
try:
    sum_to(10000)
except RecursionError:
    print("RecursionError")
print(sum(range(10001)))          # the loop/formula version has no limit

# OUTPUT (limit usually 1000):
# limit: 1000
# RecursionError
# 50005000`],
        r`
   subsets([1,2])                  decision tree (include / exclude)

                           start []
                          /          \
                  take 1 [1]        skip 1 []
                  /      \          /       \
          take 2 [1,2] [1]     [2]          []
                  |      |       |           |
               record  record  record     record

   choose -> explore -> un-choose (backtrack)
`,
        `Recursion is ideal for trees and divide-and-conquer, but in Python prefer iteration or an explicit stack when depth is unbounded. Add pruning to backtracking (reject partial solutions early) and memoisation when subproblems repeat; if the state space is huge, consider constraint solvers (OR-Tools) rather than raw search.`
    ),

    'Greedy Algorithms': dd(
        [`A <b>greedy algorithm</b> builds a solution step by step, always taking the locally best choice and never reconsidering it. When the problem has the "greedy-choice property" this gives the optimal answer very cheaply.`,
            r`# Make change using the largest coin that fits, each time
coins = [25, 10, 5, 1]
amount = 41
used = []
for c in coins:                  # coins sorted from largest to smallest
    while amount >= c:
        amount -= c
        used.append(c)
print(used, "->", len(used), "coins")

# OUTPUT:
# [25, 10, 5, 1] -> 4 coins`],
        [`Exhaustive search for the best schedule or selection can be exponential. Greedy rules, such as "always pick the interval that ends first", reach the best answer after one sort.`,
            r`# Activity selection: attend the maximum number of non-overlapping events
events = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
chosen, last_end = [], 0
for start, end in sorted(events, key=lambda e: e[1]):   # earliest finish first
    if start >= last_end:
        chosen.append((start, end))
        last_end = end
print(chosen)

# OUTPUT:
# [(1, 4), (5, 7), (8, 9)]`],
        [`Huffman compression, Dijkstra's shortest path, minimum spanning trees (Kruskal, Prim), CPU/job scheduling and loading cargo by value-per-weight are greedy. Fractional knapsack: take the best value-per-kilo first.`,
            r`items = [(60, 10), (100, 20), (120, 30)]     # (value, weight)
capacity = 50
total = 0.0
for value, weight in sorted(items, key=lambda it: it[0] / it[1], reverse=True):
    take = min(weight, capacity)                 # whole item, or the fraction that fits
    total += value * take / weight
    capacity -= take
    if capacity == 0:
        break
print(total)

# OUTPUT:
# 240.0`],
        [`<b>Advantages:</b> usually simple, fast (often just a sort, O(n log n)) and uses little memory. Jump Game shows a one-pass greedy check.`,
            r`def can_reach_end(jumps):
    farthest = 0
    for i, j in enumerate(jumps):
        if i > farthest:
            return False          # we are stuck before reaching index i
        farthest = max(farthest, i + j)
    return True

print(can_reach_end([2, 3, 1, 1, 4]))
print(can_reach_end([3, 2, 1, 0, 4]))

# OUTPUT:
# True
# False`],
        [`<b>Disadvantages:</b> greedy is not always optimal. With coin values 1, 3, 4 and amount 6, greedy picks 4+1+1 (3 coins) but 3+3 (2 coins) is better.`,
            r`coins = [4, 3, 1]
amount = 6
used = []
for c in coins:
    while amount >= c:
        amount -= c
        used.append(c)
print("greedy:", used, "(optimal is [3, 3])")

# OUTPUT:
# greedy: [4, 1, 1] (optimal is [3, 3])`],
        [`<b>Limitations:</b> it can never undo a choice, so it fails on problems that need global planning, like 0/1 knapsack. You must prove (or test) that the greedy rule is correct.`,
            r`from itertools import combinations

items = [(60, 10), (100, 20), (120, 30)]       # (value, weight), capacity 50, no splitting
cap = 50

greedy_value, room = 0, cap
for v, w in sorted(items, key=lambda it: it[0] / it[1], reverse=True):
    if w <= room:
        greedy_value += v
        room -= w

best = max(sum(v for v, _ in c)
           for n in range(len(items) + 1)
           for c in combinations(items, n)
           if sum(w for _, w in c) <= cap)
print("greedy:", greedy_value, "optimal:", best)

# OUTPUT:
# greedy: 160 optimal: 220`],
        r`
   amount 41, coins 25 10 5 1

   41 --take 25--> 16 --take 10--> 6 --take 5--> 1 --take 1--> 0
   best-looking choice at every step, never reconsidered

   works for: activity selection, Huffman, MST, Dijkstra
   fails for: 0/1 knapsack, coin sets like {1, 3, 4}
`,
        `Use greedy when a proof (exchange argument) or a well-known theorem backs it; otherwise treat it as a heuristic and compare against an exact method on test data. When a greedy rule fails, dynamic programming or search is the next step. Greedy heuristics are still useful in production for "good enough, fast" decisions such as load balancing.`
    ),

    'Dynamic Programming': dd(
        [`<b>Dynamic programming (DP)</b> solves a problem by breaking it into overlapping subproblems and storing each answer so it is computed only once. Top-down uses recursion plus a cache (memoization); bottom-up fills a table.`,
            r`from functools import lru_cache

@lru_cache(maxsize=None)          # remembers every result
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(50))                    # instant; the plain version would take hours

# OUTPUT:
# 12586269025`],
        [`Many problems recompute the same subproblem exponentially often. Storing answers turns exponential time into polynomial time: fib(20) needs 21891 calls without a cache but only 21 real computations with one.`,
            r`memo, computed = {}, 0
def fib(n):
    global computed
    if n in memo:
        return memo[n]            # cache hit: no work
    computed += 1
    memo[n] = n if n < 2 else fib(n - 1) + fib(n - 2)
    return memo[n]

print(fib(20), "computed", computed, "times")

# OUTPUT:
# 6765 computed 21 times`],
        [`DP powers spell correction (edit distance), diff tools (longest common subsequence), route and resource planning, text justification and change-making. Minimum coins for an amount, bottom-up:`,
            r`def min_coins(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount            # dp[a] = fewest coins to make amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else -1

print(min_coins([1, 3, 4], 6))           # greedy would give 3; DP finds the optimum
print(min_coins([5], 3))                 # impossible

# OUTPUT:
# 2
# -1`],
        [`<b>Advantages:</b> always finds the optimum for problems with optimal substructure, and often lets you shrink memory by keeping only the last few table entries.`,
            r`# Climbing stairs (1 or 2 steps at a time): ways(n) = ways(n-1) + ways(n-2)
def ways(n):
    prev, cur = 1, 1                # ways(0), ways(1)
    for _ in range(n - 1):
        prev, cur = cur, prev + cur  # O(1) memory instead of a full table
    return cur

print(ways(5))

# OUTPUT:
# 8`],
        [`<b>Disadvantages:</b> tables can be large. Longest common subsequence of two strings of length m and n needs about m*n cells.`,
            r`def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[-1][-1], len(dp) * len(dp[0])

length, cells = lcs("ABCBDAB", "BDCABA")
print("LCS length", length, "table cells", cells)

# OUTPUT:
# LCS length 4 table cells 56`],
        [`<b>Limitations:</b> it needs overlapping subproblems and optimal substructure, and top-down memoization still recurses, so very deep inputs hit the recursion limit. Bottom-up avoids that.`,
            r`from functools import lru_cache

@lru_cache(maxsize=None)
def fib_top_down(n):
    return n if n < 2 else fib_top_down(n - 1) + fib_top_down(n - 2)

try:
    fib_top_down(5000)
except RecursionError:
    print("top-down: RecursionError")

def fib_bottom_up(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
print("bottom-up digits:", len(str(fib_bottom_up(5000))))

# OUTPUT:
# top-down: RecursionError
# bottom-up digits: 1045`],
        r`
   fib(5) without cache            with cache (each computed once)

            fib5                         fib5
          /      \                     /      \
       fib4      fib3               fib4      fib3  <- reused!
       /  \      /  \               /  \
    fib3 fib2  fib2 fib1         fib3  fib2
    ...repeated work...           table: [0,1,1,2,3,5]

   exponential O(2^n)  ->  linear O(n) time, O(n) memory
`,
        `Before coding DP, define the state, the transition and the base case on paper. Choose top-down for clarity and sparse state spaces, bottom-up for speed and to avoid recursion limits. For huge state tables look for rolling arrays or different algorithms; and remember that business problems with fuzzy constraints often fit an optimizer or solver better than hand-written DP.`
    ),

    'BFS & DFS': dd(
        [`<b>Breadth-first search (BFS)</b> explores a graph level by level using a queue; <b>depth-first search (DFS)</b> follows one path as deep as possible before backing up, using a stack or recursion. Both visit every reachable node in O(V + E).`,
            r`from collections import deque

graph = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": ["F"], "F": []}

def bfs(start):
    seen, order, q = {start}, [], deque([start])
    while q:
        n = q.popleft()                  # oldest first (queue)
        order.append(n)
        for nb in graph[n]:
            if nb not in seen:
                seen.add(nb); q.append(nb)
    return order

def dfs(n, seen=None, order=None):
    seen = set() if seen is None else seen
    order = [] if order is None else order
    seen.add(n); order.append(n)
    for nb in graph[n]:
        if nb not in seen:
            dfs(nb, seen, order)         # go deep first
    return order

print("BFS:", bfs("A"))
print("DFS:", dfs("A"))

# OUTPUT:
# BFS: ['A', 'B', 'C', 'D', 'E', 'F']
# DFS: ['A', 'B', 'D', 'E', 'F', 'C']`],
        [`BFS visits nodes in order of distance, so the first time it reaches a node is along a shortest path (fewest edges). DFS is memory-light and natural for exploring everything, detecting cycles and backtracking.`,
            r`from collections import deque

graph = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": ["F"], "F": []}

def shortest_path(start, goal):
    parent, q = {start: None}, deque([start])
    while q:
        n = q.popleft()
        if n == goal:
            path = []
            while n is not None:         # walk parents back to the start
                path.append(n); n = parent[n]
            return path[::-1]
        for nb in graph[n]:
            if nb not in parent:
                parent[nb] = n; q.append(nb)

print(shortest_path("A", "F"))

# OUTPUT:
# ['A', 'C', 'F']`],
        [`BFS: shortest route in a maze or on a map without weights, "degrees of separation", web crawlers. DFS: solving puzzles, finding connected regions (flood fill), dependency resolution. Maze example: S start, E exit, # wall.`,
            r`from collections import deque

grid = ["S.#",
        "..#",
        "#.E"]
rows, cols = len(grid), len(grid[0])
q, dist = deque([(0, 0)]), {(0, 0): 0}
while q:
    r_, c_ = q.popleft()
    if grid[r_][c_] == "E":
        print("shortest path:", dist[(r_, c_)], "steps")
        break
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r_ + dr, c_ + dc
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in dist:
            dist[(nr, nc)] = dist[(r_, c_)] + 1
            q.append((nr, nc))

# OUTPUT:
# shortest path: 4 steps`],
        [`<b>Advantages:</b> both are linear in the size of the graph and easy to write. An iterative DFS with an explicit stack counts connected regions ("islands") in a grid.`,
            r`grid = ["11000",
        "11000",
        "00100",
        "00011"]
seen, islands = set(), 0
for r0 in range(len(grid)):
    for c0 in range(len(grid[0])):
        if grid[r0][c0] == "1" and (r0, c0) not in seen:
            islands += 1                         # a new island starts here
            stack = [(r0, c0)]
            while stack:
                r1, c1 = stack.pop()
                if (r1, c1) in seen or not (0 <= r1 < 4 and 0 <= c1 < 5) or grid[r1][c1] == "0":
                    continue
                seen.add((r1, c1))
                stack += [(r1 + 1, c1), (r1 - 1, c1), (r1, c1 + 1), (r1, c1 - 1)]
print("islands:", islands)

# OUTPUT:
# islands: 3`],
        [`<b>Disadvantages:</b> DFS does not find shortest paths; the first path it finds can be much longer than the best one.`,
            r`graph = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": ["F"], "F": []}

def dfs_path(n, goal, seen=()):
    if n == goal:
        return [n]
    for nb in graph[n]:
        if nb not in seen:
            p = dfs_path(nb, goal, seen + (n,))
            if p:
                return [n] + p
    return None

print("DFS path:", dfs_path("A", "F"))
print("BFS path: ['A', 'C', 'F']  (shorter)")

# OUTPUT:
# DFS path: ['A', 'B', 'E', 'F']
# BFS path: ['A', 'C', 'F']  (shorter)`],
        [`<b>Limitations:</b> BFS must hold a whole frontier in memory (huge for wide graphs), and recursive DFS is bounded by the recursion limit. Both need a visited set to survive cycles.`,
            r`from collections import deque

graph = {0: list(range(1, 10001))}          # a "star": one hub with 10000 neighbours
for leaf in range(1, 10001):
    graph[leaf] = []

q, seen, peak = deque([0]), {0}, 1
while q:
    n = q.popleft()
    for nb in graph[n]:
        if nb not in seen:
            seen.add(nb); q.append(nb)
    peak = max(peak, len(q))
print("peak queue size:", peak)

# OUTPUT:
# peak queue size: 10000`],
        r`
        A                BFS (queue):  A | B C | D E F      level by level
       / \               DFS (stack):  A B D E F C          deep first
      B   C
     / \   \
    D   E---F

   BFS: shortest path in unweighted graphs, memory = widest level
   DFS: memory = deepest path, good for exhaustive search
`,
        `Choose BFS for "fewest hops" and level-based problems, DFS for exhaustive exploration, cycle detection and topological work. Always keep a visited structure and prefer iterative versions for large graphs. For weighted edges use Dijkstra, and for graphs too large for memory use database or distributed graph engines.`
    ),

    'Shortest Path': dd(
        [`The <b>shortest path</b> problem finds the cheapest route between nodes in a weighted graph. <b>Dijkstra's algorithm</b> repeatedly settles the closest unsettled node using a min-heap, and works when no edge weight is negative.`,
            r`import heapq

graph = {"A": [("B", 1), ("C", 4)], "B": [("C", 2), ("D", 5)], "C": [("D", 1)], "D": []}

def dijkstra(src):
    dist = {n: float("inf") for n in graph}
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, n = heapq.heappop(heap)
        if d > dist[n]:
            continue                       # stale entry: a better route was found
        for nb, w in graph[n]:
            if d + w < dist[nb]:
                dist[nb] = d + w
                heapq.heappush(heap, (dist[nb], nb))
    return dist

print(dijkstra("A"))

# OUTPUT:
# {'A': 0, 'B': 1, 'C': 3, 'D': 4}`],
        [`BFS counts edges, but real routes have costs: distance, time, price. A path with fewer edges can be far more expensive than a longer one with cheap edges.`,
            r`import heapq

graph = {"A": [("D", 10), ("B", 1)], "B": [("C", 1)], "C": [("D", 1)], "D": []}

dist, heap = {"A": 0}, [(0, "A")]
while heap:
    d, n = heapq.heappop(heap)
    if d > dist.get(n, float("inf")):
        continue
    for nb, w in graph[n]:
        if d + w < dist.get(nb, float("inf")):
            dist[nb] = d + w
            heapq.heappush(heap, (d + w, nb))

print("A->D direct edge costs 10 (1 hop), cheapest route costs", dist["D"], "(3 hops)")

# OUTPUT:
# A->D direct edge costs 10 (1 hop), cheapest route costs 3 (3 hops)`],
        [`GPS navigation, network routing (OSPF), flight and logistics planning and game pathfinding (A* is Dijkstra plus a heuristic). To report the route itself, remember each node's predecessor.`,
            r`import heapq

roads = {"Home": [("Mall", 4), ("Park", 2)], "Park": [("Mall", 1), ("Office", 8)],
         "Mall": [("Office", 5)], "Office": []}

dist, prev, heap = {"Home": 0}, {}, [(0, "Home")]
while heap:
    d, n = heapq.heappop(heap)
    if d > dist.get(n, float("inf")):
        continue
    for nb, w in roads[n]:
        if d + w < dist.get(nb, float("inf")):
            dist[nb], prev[nb] = d + w, n          # remember how we got here
            heapq.heappush(heap, (d + w, nb))

path, n = [], "Office"
while n != "Home":
    path.append(n); n = prev[n]
print(" -> ".join(["Home"] + path[::-1]), "cost", dist["Office"])

# OUTPUT:
# Home -> Park -> Mall -> Office cost 8`],
        [`<b>Advantages:</b> O((V + E) log V) with a heap, correct for non-negative weights, and it can stop early once the target is settled.`,
            r`import heapq

graph = {"S": [("T", 1), ("X", 50)], "X": [("Y", 50)], "T": [], "Y": []}
heap, dist, popped = [(0, "S")], {"S": 0}, 0
while heap:
    d, n = heapq.heappop(heap)
    if d > dist[n]:
        continue
    popped += 1
    if n == "T":
        break                              # target settled: no need to explore further
    for nb, w in graph[n]:
        if d + w < dist.get(nb, float("inf")):
            dist[nb] = d + w
            heapq.heappush(heap, (d + w, nb))
print("settled", popped, "of 4 nodes before reaching T")

# OUTPUT:
# settled 2 of 4 nodes before reaching T`],
        [`<b>Disadvantages:</b> negative edge weights break it, because a node is assumed final once settled. Bellman-Ford handles negatives at higher cost.`,
            r`import heapq

graph = {"A": [("B", 1), ("C", 2)], "B": [("D", 1)], "C": [("B", -5)], "D": []}
dist = {n: float("inf") for n in graph}
dist["A"] = 0
heap, done = [(0, "A")], set()
while heap:
    d, n = heapq.heappop(heap)
    if n in done:
        continue
    done.add(n)                            # "final" - the flawed assumption
    for nb, w in graph[n]:
        if d + w < dist[nb]:
            dist[nb] = d + w
            heapq.heappush(heap, (dist[nb], nb))
print(dist, "but true D = -2")

# OUTPUT:
# {'A': 0, 'B': -3, 'C': 2, 'D': 2} but true D = -2`],
        [`<b>Limitations:</b> it needs the whole graph in memory and recomputes from the source for every query; unreachable nodes keep an infinite distance. Large road networks need A*, bidirectional search or precomputed hierarchies.`,
            r`import heapq

graph = {"A": [("B", 1)], "B": [], "Z": []}       # Z is not reachable from A
dist = {n: float("inf") for n in graph}
dist["A"] = 0
heap = [(0, "A")]
while heap:
    d, n = heapq.heappop(heap)
    if d > dist[n]:
        continue
    for nb, w in graph[n]:
        if d + w < dist[nb]:
            dist[nb] = d + w
            heapq.heappush(heap, (dist[nb], nb))
print("distance to Z:", dist["Z"])

# OUTPUT:
# distance to Z: inf`],
        r`
          2         1
   Home ----> Park ----> Mall
     \                   |  \
      \_______ 4 ________/   5
                              \
   Park ----------- 8 ------> Office

   heap pops closest first:  Home(0) Park(2) Mall(3) Office(8)
   best route: Home -> Park -> Mall -> Office = 2 + 1 + 5 = 8
`,
        `Pick the algorithm by weights and scale: BFS for unweighted, Dijkstra for non-negative, Bellman-Ford for negatives, A* when you have a good heuristic. In production, routing is usually delegated to a specialised engine (OSRM, pgRouting, a graph DB) and results are cached, because recomputing per request does not scale.`
    ),

    'Topological Sorting': dd(
        [`A <b>topological sort</b> orders the nodes of a directed acyclic graph (DAG) so every dependency comes before the things that depend on it. Kahn's algorithm repeatedly removes nodes that have no remaining prerequisites.`,
            r`from collections import deque

# edge u -> v means "u must happen before v"
graph = {"math": ["physics", "stats"], "physics": ["ml"], "stats": ["ml"], "ml": []}

indegree = {n: 0 for n in graph}
for u in graph:
    for v in graph[u]:
        indegree[v] += 1                       # count prerequisites of each node

q = deque(n for n in graph if indegree[n] == 0)
order = []
while q:
    n = q.popleft()
    order.append(n)
    for v in graph[n]:
        indegree[v] -= 1
        if indegree[v] == 0:                   # all prerequisites done
            q.append(v)
print(order)

# OUTPUT:
# ['math', 'physics', 'stats', 'ml']`],
        [`Whenever tasks depend on each other (install packages, compile files, run jobs) you must run them in a valid order. Python's standard library offers <code>graphlib.TopologicalSorter</code>; the map below says "app needs web and db, web needs http".`,
            r`from graphlib import TopologicalSorter

needs = {"app": ["web", "db"], "web": ["http"]}   # node -> things it depends on
print(list(TopologicalSorter(needs).static_order()))

# OUTPUT:
# ['db', 'http', 'web', 'app']`],
        [`Build tools (make, Bazel), package managers (pip, npm), workflow engines (Airflow), spreadsheet recalculation and course planning all use it. <code>graphlib</code> also reveals which tasks can run in parallel.`,
            r`from graphlib import TopologicalSorter

pipeline = {"test": {"compile"}, "lint": {"compile"}, "deploy": {"test", "lint"}}
ts = TopologicalSorter(pipeline)
ts.prepare()
while ts.is_active():
    ready = sorted(ts.get_ready())          # these can all run at the same time
    print("run in parallel:", ready)
    ts.done(*ready)

# OUTPUT:
# run in parallel: ['compile']
# run in parallel: ['lint', 'test']
# run in parallel: ['deploy']`],
        [`<b>Advantages:</b> O(V + E), and the result is easy to verify: every edge must point forward in the order.`,
            r`graph = {"math": ["physics", "stats"], "physics": ["ml"], "stats": ["ml"], "ml": []}
order = ["math", "physics", "stats", "ml"]
pos = {n: i for i, n in enumerate(order)}
valid = all(pos[u] < pos[v] for u in graph for v in graph[u])
print("valid ordering:", valid)

# OUTPUT:
# valid ordering: True`],
        [`<b>Disadvantages:</b> it only exists for acyclic graphs. A circular dependency makes ordering impossible and must be reported as an error.`,
            r`from graphlib import TopologicalSorter, CycleError

deps = {"a": ["b"], "b": ["c"], "c": ["a"]}      # a needs b needs c needs a
try:
    list(TopologicalSorter(deps).static_order())
except CycleError:
    print("CycleError: circular dependency")

# OUTPUT:
# CycleError: circular dependency`],
        [`<b>Limitations:</b> the answer is usually not unique, and which valid order you get depends on tie-breaking. If you need a deterministic order (reproducible builds) you must choose a rule, such as using a heap for alphabetical order.`,
            r`graph = {"a": ["c"], "b": ["c"], "c": []}
def is_valid(order):
    pos = {n: i for i, n in enumerate(order)}
    return all(pos[u] < pos[v] for u in graph for v in graph[u])

print(is_valid(["a", "b", "c"]), is_valid(["b", "a", "c"]))   # two different valid orders

# OUTPUT:
# True True`],
        r`
   math --> physics --\
     \                  >--> ml
      \---> stats ----/

   in-degree:  math 0 | physics 1 | stats 1 | ml 2
   remove math -> physics 0, stats 0 -> remove both -> ml 0 -> remove

   order: math, physics, stats, ml
`,
        `Model dependencies explicitly as a DAG and fail the build on cycles with a clear message. Use <code>graphlib</code> for in-process ordering; for distributed jobs use a workflow engine (Airflow, Prefect, Dagster) that adds retries, scheduling and state. Make tie-breaking deterministic when reproducibility matters.`
    )
};
