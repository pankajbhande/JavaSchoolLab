// Module 28 (Data Structures & Algorithms), part A: complexity and core containers.
import { dd, r, type DeepDive } from './deepDive';

export const m28a: Record<string, DeepDive> = {
    'Big-O Complexity': dd(
        [`<b>Big-O notation</b> describes how the work an algorithm does grows as the input size <code>n</code> grows. It ignores machine speed and focuses on the shape of the growth curve: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n), O(n^2) quadratic, O(2^n) exponential.`,
            r`# Count the "steps" three functions take as n grows
def steps_constant(n):
    return 1                      # same work for any n          -> O(1)

def steps_linear(n):
    c = 0
    for _ in range(n):            # one pass over the input
        c += 1
    return c                      #                              -> O(n)

def steps_quadratic(n):
    c = 0
    for _ in range(n):            # loop inside a loop
        for _ in range(n):
            c += 1
    return c                      #                              -> O(n^2)

for n in (10, 100):
    print(n, steps_constant(n), steps_linear(n), steps_quadratic(n))

# OUTPUT:
# 10 1 10 100
# 100 1 100 10000`],
        [`Two programs that both give the right answer can differ by a factor of a million on big inputs. Big-O lets you predict that difference before you write or run anything, so you pick the right algorithm on paper.`,
            r`# Finding the LAST item of 1000 sorted numbers: linear scan vs binary search
data = list(range(1000))
target = 999

linear_steps = 0
for x in data:                       # check items one by one
    linear_steps += 1
    if x == target:
        break

lo, hi, binary_steps = 0, len(data) - 1, 0
while lo <= hi:                      # halve the search range each time
    mid = (lo + hi) // 2
    binary_steps += 1
    if data[mid] == target:
        break
    elif data[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1

print("linear steps:", linear_steps)
print("binary steps:", binary_steps)

# OUTPUT:
# linear steps: 1000
# binary steps: 10`],
        [`In production, Big-O decides whether a feature survives real traffic: an O(n^2) duplicate check over a million user records never finishes, while an O(n) set-based check takes a moment. Database indexes, search, and caches are all complexity decisions.`,
            r`# Detect duplicates in 1000 unique IDs: nested loops vs a set
ids = list(range(1000))

pair_checks = 0
for i in range(len(ids)):
    for j in range(i + 1, len(ids)):     # compare every pair  -> O(n^2)
        pair_checks += 1
        if ids[i] == ids[j]:
            break

seen, set_checks = set(), 0
for x in ids:                            # one pass + O(1) lookups -> O(n)
    set_checks += 1
    if x in seen:
        break
    seen.add(x)

print("nested loops:", pair_checks)
print("set approach:", set_checks)

# OUTPUT:
# nested loops: 499500
# set approach: 1000`],
        [`<b>Advantages:</b> a hardware-independent language for comparing algorithms, makes scaling problems visible early, and gives teams a shared vocabulary ("that is O(n log n)").`,
            r`# Growth rates side by side: log n barely moves, n^2 explodes
import math
for n in (1000, 1_000_000):
    print(f"{n:>9}  log2={math.log2(n):5.1f}  n^2={n * n}")

# OUTPUT:
#      1000  log2= 10.0  n^2=1000000
#   1000000  log2= 19.9  n^2=1000000000000`],
        [`<b>Disadvantages:</b> it hides constant factors and lower-order terms, so an "O(n)" algorithm with a huge constant can lose to an "O(n^2)" one on realistic input sizes.`,
            r`# Big-O ignores constants: linear-with-big-constant vs quadratic
for n in (100, 10000):
    linear_big_constant = 1000 * n        # O(n) but each step is expensive
    quadratic = n * n                     # O(n^2)
    winner = "quadratic" if quadratic < linear_big_constant else "linear"
    print(f"n={n}: linear*1000={linear_big_constant} quadratic={quadratic} -> {winner} is cheaper")

# OUTPUT:
# n=100: linear*1000=100000 quadratic=10000 -> quadratic is cheaper
# n=10000: linear*1000=10000000 quadratic=100000000 -> linear is cheaper`],
        [`<b>Limitations:</b> it usually describes the worst case and ignores memory effects, caching and I/O. "Amortized" analysis is needed for structures like dynamic arrays, where one append is occasionally expensive but the average is cheap.`,
            r`# Amortized O(1): a dynamic array doubles its capacity when full
capacity, size, copies = 1, 0, 0
for _ in range(8):                   # 8 appends
    if size == capacity:             # full -> allocate double, copy old items
        copies += size
        capacity *= 2
    size += 1
print(f"appends=8 copies={copies} capacity={capacity}")
print("about one copy per append -> amortized O(1)")

# OUTPUT:
# appends=8 copies=7 capacity=8
# about one copy per append -> amortized O(1)`],
        r`
   work
    ^
    |                                      / O(2^n)
    |                                    /
    |                              . ' /   O(n^2)
    |                         . '   /
    |                  . . '   . '          O(n log n)
    |            . . '  . . '  .  .  .  .  . O(n)
    |  . . . . . . . . . . . . . . . . . . . O(log n)
    |  ----------------------------------------- O(1)
    +-----------------------------------------------> n (input size)
`,
        `Optimize the algorithm before the code: moving from O(n^2) to O(n log n) beats any micro-optimization. But measure real data first, because constants, cache behaviour and small n often dominate; a plain list scan beats a hash set for ten items. Do not obsess over complexity in code that runs once on tiny input.`
    ),

    'Arrays & Strings': dd(
        [`An <b>array</b> is a contiguous, indexed sequence. In Python the closest built-in is the <code>list</code>; a <b>string</b> is an immutable sequence of characters. Both support indexing, negative indexes and slicing.`,
            r`nums = [10, 20, 30, 40, 50]
print(nums[0], nums[-1])        # first and last element
print(nums[1:4])                # slice: index 1 up to (not including) 4

s = "hello"
print(s[::-1], s.upper())       # reversed copy and upper-cased copy

# OUTPUT:
# 10 50
# [20, 30, 40]
# olleh HELLO`],
        [`Almost every problem starts with sequences of data: text, numbers, records. Knowing how to scan, slice and transform them cleanly is the base of every later data structure.`,
            r`# Palindrome check: normalise the text, then compare with its reverse
def is_palindrome(text):
    cleaned = [c.lower() for c in text if c.isalnum()]   # drop spaces/punctuation
    return cleaned == cleaned[::-1]

print(is_palindrome("A man, a plan, a canal: Panama"))
print(is_palindrome("hello"))

# OUTPUT:
# True
# False`],
        [`Text processing, CSV rows, sensor readings, pixels and API payloads are all arrays or strings. A classic real task is grouping anagrams (search suggestions, spell checkers) by using sorted letters as a key.`,
            r`words = ["listen", "silent", "enlist", "google", "gogole"]
groups = {}
for w in words:
    key = "".join(sorted(w))             # anagrams share the same sorted letters
    groups.setdefault(key, []).append(w)
print(groups)

# OUTPUT:
# {'eilnst': ['listen', 'silent', 'enlist'], 'eggloo': ['google', 'gogole']}`],
        [`<b>Advantages:</b> O(1) access by index, compact and cache friendly, simple slicing syntax. A prefix-sum array turns repeated range sums into O(1) lookups.`,
            r`nums = [3, 1, 4, 1, 5]
prefix = [0]
for x in nums:
    prefix.append(prefix[-1] + x)        # running totals
print(prefix)

# sum of nums[1:4] = prefix[4] - prefix[1], no loop needed
print(prefix[4] - prefix[1])

# OUTPUT:
# [0, 3, 4, 8, 9, 14]
# 6`],
        [`<b>Disadvantages:</b> inserting or deleting near the front shifts every later element (O(n)), and strings are immutable, so every "change" builds a new string.`,
            r`s = "abc"
try:
    s[0] = "x"                           # strings cannot be modified in place
except TypeError as e:
    print("TypeError:", e)

a = [1, 2, 3]
a.insert(0, 0)                           # every existing item shifts right
print(a)

# OUTPUT:
# TypeError: 'str' object does not support item assignment
# [0, 1, 2, 3]`],
        [`<b>Limitations:</b> a Python list holds references, not raw values, and nothing enforces a single element type. Copy semantics also surprise people: repeating a nested list repeats the same inner object.`,
            r`grid = [[0] * 2] * 2                    # BUG: both rows are the SAME list
grid[0][0] = 1
print(grid)

grid = [[0] * 2 for _ in range(2)]       # correct: a new row each time
grid[0][0] = 1
print(grid)

# OUTPUT:
# [[1, 0], [1, 0]]
# [[1, 0], [0, 0]]`],
        r`
   index :   0     1     2     3     4
           +-----+-----+-----+-----+-----+
   list    | 10  | 20  | 30  | 40  | 50  |
           +-----+-----+-----+-----+-----+
   neg   :  -5    -4    -3    -2    -1

   nums[1:4]  ->  [ 20, 30, 40 ]
   access O(1) | search O(n) | insert at front O(n) | append O(1) amortized
`,
        `Use lists for general sequences, <code>array</code>/NumPy for large homogeneous numeric data (denser and vectorised), and <code>deque</code> when you add or remove at both ends. Build big strings with <code>"".join(parts)</code> rather than repeated +=. Reach for specialised structures only when profiling shows list operations are the bottleneck.`
    ),

    'Linked Lists': dd(
        [`A <b>linked list</b> is a chain of nodes; each node stores a value and a reference to the next node. Unlike an array there is no contiguous block, so the structure is followed by hopping from node to node starting at the head.`,
            r`class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next             # reference to the following node

head = Node(1, Node(2, Node(3)))     # 1 -> 2 -> 3

cur = head
parts = []
while cur:                           # walk until the end (None)
    parts.append(str(cur.value))
    cur = cur.next
print(" -> ".join(parts) + " -> None")

# OUTPUT:
# 1 -> 2 -> 3 -> None`],
        [`Arrays pay O(n) to insert at the front because everything shifts. A linked list inserts at the head in O(1) by just re-pointing one reference, which matters when data is constantly added and removed.`,
            r`class Node:
    def __init__(self, value, next=None):
        self.value, self.next = value, next

class LinkedList:
    def __init__(self):
        self.head = None
    def prepend(self, value):                 # O(1): no shifting
        self.head = Node(value, self.head)
    def to_list(self):
        out, cur = [], self.head
        while cur:
            out.append(cur.value)
            cur = cur.next
        return out

ll = LinkedList()
for v in (3, 2, 1):
    ll.prepend(v)
print(ll.to_list())

# OUTPUT:
# [1, 2, 3]`],
        [`Linked structures power undo chains, music playlists ("next song"), the free-block lists inside memory allocators and hash-table collision chains. A frequent interview and real task is reversing a list in place.`,
            r`class Node:
    def __init__(self, value, next=None):
        self.value, self.next = value, next

def reverse(head):
    prev = None
    while head:
        nxt = head.next          # remember the rest
        head.next = prev         # flip the arrow
        prev, head = head, nxt   # step forward
    return prev

def show(h):
    out = []
    while h:
        out.append(h.value); h = h.next
    return out

head = Node(1, Node(2, Node(3, Node(4))))
print(show(reverse(head)))

# OUTPUT:
# [4, 3, 2, 1]`],
        [`<b>Advantages:</b> O(1) insert/delete when you already hold the node, no resizing or copying, and size grows one node at a time.`,
            r`class Node:
    def __init__(self, value, next=None):
        self.value, self.next = value, next

head = Node(1, Node(2, Node(3)))
two = head.next
two.next = Node(99, two.next)    # insert 99 after node 2: just two pointer updates

cur, out = head, []
while cur:
    out.append(cur.value); cur = cur.next
print(out)

# OUTPUT:
# [1, 2, 99, 3]`],
        [`<b>Disadvantages:</b> no random access; reaching index k costs k hops (O(n)). Each node also carries a pointer, so memory use is higher, and nodes scattered in memory are cache-unfriendly.`,
            r`class Node:
    def __init__(self, value, next=None):
        self.value, self.next = value, next

head = Node("a", Node("b", Node("c", Node("d"))))
hops, cur = 0, head
while hops < 3:                  # to reach index 3 we must walk 3 links
    cur = cur.next
    hops += 1
print("index 3 =", cur.value, "after", hops, "hops")

# OUTPUT:
# index 3 = d after 3 hops`],
        [`<b>Limitations:</b> a single wrong pointer can create a cycle and make traversal loop forever; you need Floyd's slow/fast pointer technique to detect it. Binary search is impossible without random access.`,
            r`class Node:
    def __init__(self, value, next=None):
        self.value, self.next = value, next

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next               # moves 1 step
        fast = fast.next.next          # moves 2 steps; meets slow if a loop exists
        if slow is fast:
            return True
    return False

a, b, c = Node(1), Node(2), Node(3)
a.next, b.next = b, c
print(has_cycle(a))                    # straight chain
c.next = a                             # corrupt: tail points back to head
print(has_cycle(a))

# OUTPUT:
# False
# True`],
        r`
   head
    |
    v
  +-------+---+     +-------+---+     +-------+------+
  |   1   | o-+---> |   2   | o-+---> |   3   | None |
  +-------+---+     +-------+---+     +-------+------+
   value   next      value   next      value   next

  insert after node : O(1)      access by index : O(n)
`,
        `In CPython, a list (dynamic array) beats a hand-made linked list for nearly everything because of cache locality and C-speed loops. Use a linked list when you need stable node references with O(1) splicing (LRU caches use a doubly linked list plus a dict), otherwise prefer list or deque.`
    ),

    'Stacks': dd(
        [`A <b>stack</b> is a Last-In-First-Out (LIFO) collection: you push on top and pop from the top. A Python list works perfectly: <code>append()</code> pushes and <code>pop()</code> pops, both O(1).`,
            r`stack = []
stack.append(1)          # push
stack.append(2)
stack.append(3)
print(stack.pop())       # pop -> the last item pushed comes out first
print(stack[-1])         # peek at the top without removing
print(stack)

# OUTPUT:
# 3
# 2
# [1, 2]`],
        [`Many problems are naturally "most recent first": matching brackets, undoing actions, and walking nested structures. A stack remembers what is still open or unfinished.`,
            r`def balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)                       # remember the opener
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False                       # wrong or missing opener
    return not stack                               # nothing left open

print(balanced("{[()]}"))
print(balanced("{[(])}"))

# OUTPUT:
# True
# False`],
        [`Editors' undo, browser Back buttons, compilers parsing expressions and the call stack itself are stacks. Calculators evaluate postfix (RPN) expressions with one.`,
            r`def eval_rpn(expr):
    stack = []
    for tok in expr.split():
        if tok in "+-*":
            b, a = stack.pop(), stack.pop()        # right operand is on top
            stack.append(a + b if tok == "+" else a - b if tok == "-" else a * b)
        else:
            stack.append(int(tok))
    return stack[0]

print(eval_rpn("3 4 + 2 *"))      # (3 + 4) * 2

# OUTPUT:
# 14`],
        [`<b>Advantages:</b> push, pop and peek are all O(1); the rule is simple; it converts recursion into an explicit loop you control.`,
            r`# Reverse a string with a stack: last in, first out
stack = list("abc")
reversed_text = ""
while stack:
    reversed_text += stack.pop()
print(reversed_text)

# OUTPUT:
# cba`],
        [`<b>Disadvantages:</b> only the top is accessible; searching or reading the middle means popping items. Popping an empty stack raises an error you must guard against.`,
            r`stack = []
try:
    stack.pop()
except IndexError as e:
    print("IndexError:", e)

# OUTPUT:
# IndexError: pop from empty list`],
        [`<b>Limitations:</b> the interpreter's call stack is limited (about 1000 frames by default), so deep recursion fails. An explicit list-based stack lives on the heap and is bounded only by memory.`,
            r`def depth(n):                                # recursive version
    return 0 if n == 0 else 1 + depth(n - 1)

try:
    depth(100000)
except RecursionError:
    print("RecursionError")

stack, count = list(range(100000)), 0          # same work with an explicit stack
while stack:
    stack.pop()
    count += 1
print(count)

# OUTPUT:
# RecursionError
# 100000`],
        r`
        push(3)        pop()
           |             ^
           v             |
        +-------+     +-------+
  top-> |   3   |     |   3   |  <- top
        +-------+     +-------+
        |   2   |     |   2   |
        +-------+     +-------+
        |   1   |     |   1   |
        +-------+     +-------+
              LIFO: last in, first out
`,
        `Prefer a plain list for a stack (thread-safety aside; use <code>queue.LifoQueue</code> across threads). Converting a recursive algorithm to an explicit stack removes recursion limits and makes state inspectable, at the cost of readability. Do not use a stack if you need access to arbitrary elements or FIFO fairness.`
    ),

    'Queues & Deques': dd(
        [`A <b>queue</b> is First-In-First-Out (FIFO): items leave in the order they arrived. A <b>deque</b> (double-ended queue) allows O(1) add and remove at both ends. Use <code>collections.deque</code>, not a list, for queues.`,
            r`from collections import deque

q = deque()
q.append("a")            # enqueue at the right
q.append("b")
q.append("c")
print(q.popleft())       # dequeue from the left: first in, first out
print(q)

# OUTPUT:
# a
# deque(['b', 'c'])`],
        [`Fair, ordered processing is everywhere: print jobs, customer tickets, network packets. A list's <code>pop(0)</code> shifts every element (O(n)); a deque's <code>popleft()</code> is O(1), so it stays fast at any size.`,
            r`from collections import deque

jobs = deque(["report.pdf", "photo.png", "notes.txt"])
while jobs:
    print("printing", jobs.popleft())      # strictly in arrival order

# OUTPUT:
# printing report.pdf
# printing photo.png
# printing notes.txt`],
        [`Operating systems schedule processes round-robin; message brokers hold work in queues; BFS uses a queue. Here a CPU gives each task a time slice of 2 units and requeues unfinished work.`,
            r`from collections import deque

ready = deque([("A", 3), ("B", 1), ("C", 2)])      # (task, time still needed)
QUANTUM = 2
while ready:
    name, left = ready.popleft()
    run = min(QUANTUM, left)
    left -= run
    print(f"{name} ran {run} ({'done' if left == 0 else 'left ' + str(left)})")
    if left:
        ready.append((name, left))                 # go to the back of the line

# OUTPUT:
# A ran 2 (left 1)
# B ran 1 (done)
# C ran 2 (done)
# A ran 1 (done)`],
        [`<b>Advantages:</b> O(1) at both ends, optional <code>maxlen</code> that automatically discards the oldest items (perfect for "last N events"), plus handy <code>rotate()</code>.`,
            r`from collections import deque

last3 = deque(maxlen=3)          # keeps only the 3 newest items
for n in range(1, 6):
    last3.append(n)
print(last3)

# OUTPUT:
# deque([3, 4, 5], maxlen=3)`],
        [`<b>Disadvantages:</b> reading or changing the middle is O(n), and a deque does not support slicing like a list.`,
            r`from collections import deque

d = deque([1, 2, 3, 4])
try:
    print(d[1:3])                # slicing is not supported
except TypeError as e:
    print("TypeError:", e)
print(d[2])                      # single index works, but is O(n) in the middle

# OUTPUT:
# TypeError: sequence index must be integer, not 'slice'
# 3`],
        [`<b>Limitations:</b> a deque is not a blocking queue: removing from an empty one raises an error instead of waiting. For producer/consumer threads use <code>queue.Queue</code>, for priorities use <code>heapq</code>.`,
            r`from collections import deque
import queue

d = deque()
try:
    d.popleft()
except IndexError as e:
    print("IndexError:", e)

q = queue.Queue()                # thread-safe, can block with get()
q.put("task")
print(q.get())

# OUTPUT:
# IndexError: pop from an empty deque
# task`],
        r`
   enqueue (append)                        dequeue (popleft)
        |                                        |
        v                                        v
     +-----+-----+-----+-----+-----+-----+
 --> |  F  |  E  |  D  |  C  |  B  |  A  | -->
     +-----+-----+-----+-----+-----+-----+
     back                           front
   FIFO: A arrived first, so A leaves first

   deque: append/appendleft/pop/popleft all O(1)
`,
        `Default to <code>collections.deque</code> for in-process queues and sliding windows. When work crosses threads use <code>queue.Queue</code>; across processes or machines use a real broker (RabbitMQ, SQS, Redis) because in-memory queues vanish on crash. Never use <code>list.pop(0)</code> in a hot loop.`
    ),

    'Hash Tables & Sets': dd(
        [`A <b>hash table</b> maps a key through a hash function to a slot, giving average O(1) lookup, insert and delete. Python's <code>dict</code> is a hash table of key/value pairs and a <code>set</code> is a hash table of unique keys.`,
            r`d = {"a": 1}
d["b"] = 2                       # insert
print(d["a"], "b" in d)          # lookup and membership test

s = {1, 2, 2, 3}                 # duplicates vanish
print(s)

# OUTPUT:
# 1 True
# {1, 2, 3}`],
        [`Searching a list for a value costs O(n); hashing turns that into O(1) on average. Many O(n^2) problems collapse to O(n) once you remember what you have already seen in a dict or set.`,
            r`# Two-sum: find indexes of two numbers that add up to the target
def two_sum(nums, target):
    seen = {}                                  # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:                       # O(1) lookup
            return (seen[need], i)
        seen[x] = i
    return None

print(two_sum([2, 7, 11, 15], 9))

# OUTPUT:
# (0, 1)`],
        [`Caches, indexes, symbol tables, counting words, session stores and de-duplication all use hashing. Here we remove duplicates while keeping the original order.`,
            r`items = [3, 1, 3, 2, 1]
unique = list(dict.fromkeys(items))      # dict keeps insertion order, drops repeats
print(unique)

counts = {}
for x in items:
    counts[x] = counts.get(x, 0) + 1     # frequency table
print(counts)

# OUTPUT:
# [3, 1, 2]
# {3: 2, 1: 2, 2: 1}`],
        [`<b>Advantages:</b> average O(1) operations and powerful set algebra (union, intersection, difference) that replaces nested loops.`,
            r`a = {1, 2, 3, 4}
b = {3, 4, 5}
print(sorted(a & b))             # intersection
print(sorted(a | b))             # union
print(sorted(a - b))             # difference

# OUTPUT:
# [3, 4]
# [1, 2, 3, 4, 5]
# [1, 2]`],
        [`<b>Disadvantages:</b> keys must be hashable (immutable), sets have no index or slice, and the table uses extra memory to keep collisions rare.`,
            r`d = {}
try:
    d[[1, 2]] = "list key"       # lists are mutable, so they are unhashable
except TypeError as e:
    print("TypeError:", e)
d[(1, 2)] = "tuple key"          # tuples work
print(d)

# OUTPUT:
# TypeError: unhashable type: 'list'
# {(1, 2): 'tuple key'}`],
        [`<b>Limitations:</b> average O(1) can degrade to O(n) when many keys collide into the same slot. Equal values must hash equally, which is why <code>1</code>, <code>1.0</code> and <code>True</code> are the same key.`,
            r`class Bad:
    def __init__(self, v): self.v = v
    def __hash__(self): return 1                 # every key collides!
    def __eq__(self, o): return self.v == o.v

s = {Bad(1), Bad(2), Bad(3)}
print(len(s), Bad(2) in s)       # still correct, but each lookup now scans a chain

d = {1: "int"}
d[1.0] = "float"                 # 1 == 1.0 and hash(1) == hash(1.0): same key
d[True] = "bool"
print(d)

# OUTPUT:
# 3 True
# {1: 'bool'}`],
        r`
   key "cat" --hash()--> 7 --> slot 7
   key "dog" --hash()--> 2 --> slot 2

   slots:  0     1     2           3     ...   7
         +-----+-----+-----------+-----+     +-------------+
         |     |     | dog -> 3  |     | ... | cat -> 5    |
         +-----+-----+-----------+-----+     +-------------+
   lookup = hash + one probe  : O(1) average, O(n) worst case
`,
        `Reach for dict/set first; they are the most valuable structures in Python. Use immutable, well-distributed keys, and define <code>__hash__</code> and <code>__eq__</code> together on custom classes. For huge key sets consider memory (a Bloom filter or database) and remember dicts are not persisted or shared between processes.`
    ),

    'Trees & Binary Trees': dd(
        [`A <b>tree</b> is a hierarchy of nodes with one root and no cycles; each node has children. A <b>binary tree</b> allows at most two children (left and right). Trees are explored with traversals: in-order, pre-order, post-order and level-order.`,
            r`class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

#        1
#       / \
#      2   3
#     / \
#    4   5
root = Node(1, Node(2, Node(4), Node(5)), Node(3))

def inorder(n):   return inorder(n.left) + [n.val] + inorder(n.right) if n else []
def preorder(n):  return [n.val] + preorder(n.left) + preorder(n.right) if n else []
def postorder(n): return postorder(n.left) + postorder(n.right) + [n.val] if n else []

print("in  :", inorder(root))
print("pre :", preorder(root))
print("post:", postorder(root))

# OUTPUT:
# in  : [4, 2, 5, 1, 3]
# pre : [1, 2, 4, 5, 3]
# post: [4, 5, 2, 3, 1]`],
        [`Real data is hierarchical: folders, organisation charts, HTML, JSON, expression syntax. Lists cannot express "parent and children"; trees can, and recursion maps onto them naturally.`,
            r`# Print a folder hierarchy with indentation
tree = {"name": "root", "children": [
    {"name": "docs", "children": [{"name": "a.txt", "children": []}]},
    {"name": "img",  "children": []},
]}

def show(node, depth=0):
    print("  " * depth + node["name"])
    for child in node["children"]:
        show(child, depth + 1)

show(tree)

# OUTPUT:
# root
#   docs
#     a.txt
#   img`],
        [`File systems, the DOM in browsers, compilers' abstract syntax trees, decision trees in ML and database indexes are trees. Here we total file sizes through a directory tree.`,
            r`def total_size(node):
    return node.get("size", 0) + sum(total_size(c) for c in node.get("children", []))

root = {"children": [
    {"children": [{"size": 10}, {"size": 20}]},    # a "docs" folder with two files
    {"size": 5},                                   # one file in the root
]}
print(total_size(root))

# OUTPUT:
# 35`],
        [`<b>Advantages:</b> naturally models hierarchy, recursive algorithms stay short, and balanced trees give O(log n) search. Level-order traversal reveals structure layer by layer.`,
            r`from collections import deque

class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

root = Node(1, Node(2, Node(4), Node(5)), Node(3))

def height(n):
    return 0 if n is None else 1 + max(height(n.left), height(n.right))

q, order = deque([root]), []
while q:                                  # breadth-first: level by level
    n = q.popleft()
    order.append(n.val)
    for c in (n.left, n.right):
        if c: q.append(c)
print(order, "height =", height(root))

# OUTPUT:
# [1, 2, 3, 4, 5] height = 3`],
        [`<b>Disadvantages:</b> no cheap random access, pointer-heavy memory, and an unbalanced tree degrades into a linked list, destroying the O(log n) benefit.`,
            r`class Node:
    def __init__(self, val, left=None):
        self.val, self.left, self.right = val, left, None

chain = Node(1)
cur = chain
for v in range(2, 6):                 # every node only has a left child
    cur.left = Node(v)
    cur = cur.left

def height(n):
    return 0 if n is None else 1 + max(height(n.left), height(n.right))

print("5 nodes, height", height(chain), "-> a list in disguise")

# OUTPUT:
# 5 nodes, height 5 -> a list in disguise`],
        [`<b>Limitations:</b> recursive traversal is bounded by Python's recursion limit, so a very deep tree raises <code>RecursionError</code>. Convert to an explicit stack for deep or untrusted input.`,
            r`class Node:
    def __init__(self, left=None):
        self.left = left

root = None
for _ in range(5000):                 # build a chain 5000 nodes deep
    root = Node(root)

def height_rec(n):
    return 0 if n is None else 1 + height_rec(n.left)

try:
    height_rec(root)
except RecursionError:
    print("recursive: RecursionError")

stack, best = [(root, 1)], 0          # iterative version has no such limit
while stack:
    n, d = stack.pop()
    best = max(best, d)
    if n.left: stack.append((n.left, d + 1))
print("iterative height:", best)

# OUTPUT:
# recursive: RecursionError
# iterative height: 5000`],
        r`
              +---+
              | 1 |  <- root
              +---+
             /     \
        +---+       +---+
        | 2 |       | 3 |   <- internal / leaf
        +---+       +---+
       /     \
    +---+   +---+
    | 4 |   | 5 |   <- leaves
    +---+   +---+

   in-order: L,root,R   pre-order: root,L,R   post-order: L,R,root
   level-order: use a queue (BFS)
`,
        `Model hierarchy with trees, but keep depth in mind: balanced shapes give logarithmic height, skewed ones give linear. Prefer iterative traversal for untrusted or very deep data. If you only need ordered lookup, a sorted list with <code>bisect</code> or a database index is often simpler than a hand-rolled tree.`
    )
};
