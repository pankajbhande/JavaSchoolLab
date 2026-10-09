// Java Collections course extras, part 1 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const collection1Extras: Record<string, Extra> = {
    'collection-framework': x(
        ['The Collections Framework is a set of interfaces and classes in <code>java.util</code> for storing and processing groups of objects.',
            'Main interfaces: <code>List</code> (ordered, duplicates), <code>Set</code> (unique), <code>Queue</code>/<code>Deque</code>, and <code>Map</code> (key-value, not a Collection).',
            'Code to the interface: <code>List&lt;String&gt; names = new ArrayList&lt;&gt;();</code>.'],
        ['Pick by need: ArrayList for fast index access, LinkedList for queue/deque use, HashSet for uniqueness, TreeSet/TreeMap for sorted data, HashMap for lookups.',
            'The <code>Collections</code> utility class gives sort, reverse, shuffle, unmodifiableList and synchronizedList.',
            'Use <code>List.of</code>, <code>Set.of</code>, <code>Map.of</code> for small immutable collections (Java 9+).'],
        ['Know complexity: ArrayList get O(1), add amortized O(1); HashMap get O(1) average; TreeMap O(log n).',
            'Fail-fast iterators throw ConcurrentModificationException when a collection is changed during iteration; concurrent collections are weakly consistent.',
            'Prefer immutable collections and defensive copies at API boundaries; use concurrent collections (ConcurrentHashMap, CopyOnWriteArrayList) for threads.'],
        [['F', 'What is the Collections Framework?', 'A unified architecture of interfaces and classes for storing and manipulating groups of objects.'],
            ['F', 'Difference between Collection and Collections?', 'Collection is the root interface; Collections is a utility class with static helper methods.'],
            ['M', 'List vs Set vs Map?', 'List is ordered and allows duplicates; Set holds unique elements; Map stores key-value pairs with unique keys.'],
            ['M', 'What is fail-fast?', 'Iterators throw ConcurrentModificationException if the collection is structurally modified during iteration (except via the iterator).'],
            ['S', 'How do you choose between HashMap, LinkedHashMap and TreeMap?', 'HashMap for speed, LinkedHashMap for insertion or access order (LRU), TreeMap for sorted keys and range queries.'],
            ['S', 'Why program to interfaces?', 'It lets you change the implementation without changing callers and makes APIs flexible and testable.']],
        [['Using the main interfaces.',
            r`List<String> list = new ArrayList<>(List.of("b", "a", "b"));
Set<String> set = new TreeSet<>(list);
Map<String, Integer> counts = new HashMap<>();
for (String s : list) counts.merge(s, 1, Integer::sum);
System.out.println(list + " " + set + " " + counts);

// OUTPUT:
// [b, a, b] [a, b] {a=1, b=2}`],
            ['Collections utilities.',
                r`List<Integer> nums = new ArrayList<>(List.of(5, 2, 9));
Collections.sort(nums); System.out.println(nums);
Collections.reverse(nums); System.out.println(nums);
System.out.println(Collections.max(nums) + " " + Collections.min(nums));

// OUTPUT:
// [2, 5, 9]
// [9, 5, 2]
// 9 2`]],
        [['Fail-fast demo.',
            r`List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
try { for (Integer i : l) if (i == 2) l.remove(i); } catch (ConcurrentModificationException e) { System.out.println("CME"); }
l.removeIf(i -> i == 2); System.out.println(l);

// OUTPUT:
// (removing the second to last element ends the loop without error; removing others throws)
// [1, 3]`],
            ['Unmodifiable view vs copy.',
                r`List<String> src = new ArrayList<>(List.of("a"));
List<String> view = Collections.unmodifiableList(src);
List<String> copy = List.copyOf(src);
src.add("b");
System.out.println(view + " " + copy);

// OUTPUT:
// [a, b] [a]`]]
    ),

    'arraylist': x(
        ['<code>ArrayList</code> is a resizable array: ordered, allows duplicates and nulls, and gives fast access by index.',
            'Common methods: <code>add</code>, <code>get</code>, <code>set</code>, <code>remove</code>, <code>size</code>, <code>contains</code>, <code>indexOf</code>.',
            'Create with <code>new ArrayList&lt;&gt;()</code> and use generics for type safety.'],
        ['Inserting or removing in the middle shifts elements, so it is O(n); adding at the end is amortized O(1).',
            'When it is full, it grows by about 50% (new array, copy).',
            '<code>remove(int index)</code> vs <code>remove(Object o)</code> confuses with Integer lists: use <code>remove(Integer.valueOf(5))</code>.'],
        ['Pre-size with <code>new ArrayList&lt;&gt;(n)</code> or <code>ensureCapacity</code> to avoid repeated copying.',
            'Not thread-safe; use <code>CopyOnWriteArrayList</code> or synchronize externally. <code>subList</code> is a view that breaks if the parent is modified structurally.',
            'Iterate with enhanced for or an iterator; remove during iteration with <code>Iterator.remove()</code> or <code>removeIf</code>.'],
        [['F', 'What is an ArrayList?', 'A resizable array implementation of the List interface.'],
            ['F', 'Does ArrayList allow duplicates and null?', 'Yes, both.'],
            ['M', 'ArrayList vs array?', 'Arrays have fixed size and can hold primitives; ArrayList is resizable but holds objects.'],
            ['M', 'ArrayList vs LinkedList?', 'ArrayList is faster for random access and iteration; LinkedList is better for frequent insert or remove at the ends (as a deque).'],
            ['S', 'How does ArrayList grow?', 'When capacity is exceeded it allocates a larger array (about 1.5x) and copies elements.'],
            ['S', 'Is ArrayList thread-safe?', 'No; concurrent modification can corrupt it. Use synchronization or CopyOnWriteArrayList.']],
        [['Basic operations.',
            r`List<String> names = new ArrayList<>();
names.add("Asha"); names.add("Ravi"); names.add(1, "Meena");
names.set(0, "Anita"); names.remove("Ravi");
System.out.println(names + " size=" + names.size() + " idx=" + names.indexOf("Meena"));

// OUTPUT:
// [Anita, Meena] size=2 idx=1`],
            ['Safe removal while iterating.',
                r`List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
nums.removeIf(n -> n % 2 == 0);
Iterator<Integer> it = nums.iterator();
while (it.hasNext()) if (it.next() == 5) it.remove();
System.out.println(nums);

// OUTPUT:
// [1, 3]`]],
        [['The remove overload trap.',
            r`List<Integer> l = new ArrayList<>(List.of(10, 20, 30));
l.remove(1);                     // removes index 1
l.remove(Integer.valueOf(10));   // removes value 10
System.out.println(l);

// OUTPUT:
// [30]`],
            ['Sort and binary search.',
                r`List<Integer> l = new ArrayList<>(List.of(40, 10, 30));
Collections.sort(l);
System.out.println(l + " " + Collections.binarySearch(l, 30));

// OUTPUT:
// [10, 30, 40] 1`]]
    ),

    'linkedlist': x(
        ['<code>LinkedList</code> is a doubly linked list implementing both <code>List</code> and <code>Deque</code>.',
            'Good at adding and removing at the ends: <code>addFirst</code>, <code>addLast</code>, <code>removeFirst</code>, <code>poll</code>.',
            'Access by index is slow because it walks the nodes.'],
        ['Each element is a node with prev and next references, using more memory than an array.',
            'Insert or remove is O(1) only when you already have the position (an iterator); finding the position is O(n).',
            'It can act as a queue (<code>offer</code>/<code>poll</code>) or stack (<code>push</code>/<code>pop</code>).'],
        ['In practice ArrayDeque is faster and uses less memory for stack and queue use; LinkedList is rarely the best choice.',
            'Poor CPU cache locality makes iteration slower than ArrayList despite the same O(n).',
            'ListIterator allows insertion and removal while traversing in O(1) per operation.'],
        [['F', 'What is a LinkedList?', 'A doubly linked list that implements List and Deque.'],
            ['F', 'Which operations are fast?', 'Adding and removing at the ends.'],
            ['M', 'Why is get(i) slow?', 'It must traverse from the head or tail to reach the index: O(n).'],
            ['M', 'LinkedList vs ArrayList?', 'LinkedList is better for frequent end insertions as a queue; ArrayList for random access and iteration.'],
            ['S', 'Why prefer ArrayDeque over LinkedList?', 'ArrayDeque has no node overhead, better cache behavior and is usually faster for queue and stack operations.'],
            ['S', 'Is middle insertion O(1)?', 'Only given an iterator at the position; finding the position is O(n), so overall it is O(n).']],
        [['Queue and deque use.',
            r`LinkedList<String> q = new LinkedList<>();
q.offer("A"); q.offer("B"); q.addFirst("Z");
System.out.println(q + " " + q.poll() + " " + q.peekLast());

// OUTPUT:
// [Z, A, B] Z B`],
            ['Insert while iterating.',
                r`LinkedList<Integer> l = new LinkedList<>(List.of(1, 3, 5));
ListIterator<Integer> it = l.listIterator();
while (it.hasNext()) { int v = it.next(); if (v == 3) it.add(4); }
System.out.println(l);

// OUTPUT:
// [1, 3, 4, 5]`]],
        [['Preferred modern alternative.',
            r`Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2);
System.out.println(stack.pop() + " " + stack.peek());

// OUTPUT:
// 2 1`],
            ['Index access cost.',
                r`LinkedList<Integer> l = new LinkedList<>();
for (int i = 0; i < 5; i++) l.add(i);
System.out.println(l.get(3));    // walks 3 nodes

// OUTPUT:
// 3`]]
    ),

    'vector': x(
        ['<code>Vector</code> is a legacy resizable array whose methods are synchronized.',
            'It works like ArrayList but doubles its capacity by default when full.',
            'Extra legacy methods: <code>addElement</code>, <code>elementAt</code>, <code>removeElement</code>.'],
        ['Synchronization on every method makes it slower than ArrayList when threads are not shared.',
            'Individual methods are safe, but compound actions (check then add) still need external locking.',
            'Prefer ArrayList, or <code>Collections.synchronizedList</code> or <code>CopyOnWriteArrayList</code> for concurrency.'],
        ['Vector exists for backward compatibility; new code should not use it.',
            'Its Enumeration is not fail-fast, but its iterator is.',
            'Its subclass <code>Stack</code> is also legacy; use <code>ArrayDeque</code>.'],
        [['F', 'What is Vector?', 'A legacy, synchronized, resizable array list.'],
            ['F', 'How does it differ from ArrayList?', 'Vector is synchronized and grows by doubling; ArrayList is not synchronized and grows by about 50%.'],
            ['M', 'Is Vector fully thread-safe?', 'Each method is, but compound operations are not atomic without extra locking.'],
            ['M', 'Why avoid Vector?', 'Synchronization overhead and better alternatives exist.'],
            ['S', 'What would you use instead for concurrent reads?', 'CopyOnWriteArrayList for read-mostly lists, or a synchronized wrapper with explicit locking.'],
            ['S', 'Why is check-then-add unsafe?', 'Another thread can change the list between the check and the add, since the two calls are separate lock acquisitions.']],
        [['Vector basics.',
            r`Vector<Integer> v = new Vector<>(2);
v.add(1); v.add(2); v.add(3);
System.out.println(v + " cap=" + v.capacity());

// OUTPUT:
// [1, 2, 3] cap=4`],
            ['Compound action needs a lock.',
                r`Vector<String> v = new Vector<>();
synchronized (v) { if (!v.contains("a")) v.add("a"); }
System.out.println(v);

// OUTPUT:
// [a]`]],
        [['Modern replacement.',
            r`List<String> safe = new CopyOnWriteArrayList<>(List.of("a", "b"));
for (String s : safe) safe.add("c");     // no exception: iterates a snapshot
System.out.println(safe);

// OUTPUT:
// [a, b, c, c]`],
            ['Synchronized wrapper.',
                r`List<Integer> l = Collections.synchronizedList(new ArrayList<>());
l.add(1);
synchronized (l) { for (int i : l) System.out.println(i); }

// OUTPUT:
// 1`]]
    ),

    'stack': x(
        ['A stack is last-in, first-out (LIFO). Java has the legacy <code>Stack</code> class with <code>push</code>, <code>pop</code>, <code>peek</code> and <code>empty</code>.',
            'Use cases: undo, expression evaluation, bracket matching, DFS.',
            '<code>pop</code> on an empty Stack throws <code>EmptyStackException</code>.'],
        ['<code>Stack</code> extends Vector, so it is synchronized and allows index access that breaks the LIFO idea.',
            'Prefer <code>Deque&lt;Integer&gt; stack = new ArrayDeque&lt;&gt;();</code> with push, pop and peek.',
            '<code>peek</code> returns the top without removing it; Deque.pop throws NoSuchElementException when empty.'],
        ['ArrayDeque does not allow nulls and is not thread-safe; use <code>LinkedBlockingDeque</code> or <code>ConcurrentLinkedDeque</code> for concurrent stacks.',
            'The call stack of a program is a stack: deep recursion causes StackOverflowError.',
            'Convert recursive algorithms to explicit stacks to avoid stack overflow.'],
        [['F', 'What is a stack?', 'A LIFO data structure: the last element pushed is the first popped.'],
            ['F', 'Main stack operations?', 'push, pop and peek.'],
            ['M', 'Why is java.util.Stack discouraged?', 'It extends Vector (synchronized, allows index access); ArrayDeque is a better stack.'],
            ['M', 'What happens on pop of an empty Stack?', 'EmptyStackException.'],
            ['S', 'How do you check balanced brackets?', 'Push opening brackets; on a closing bracket pop and compare; the stack must be empty at the end.'],
            ['S', 'How do you avoid StackOverflowError in deep recursion?', 'Use iteration with an explicit stack, or tail transformations and increase the thread stack size only as a last resort.']],
        [['Balanced brackets.',
            r`static boolean balanced(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if ("([{".indexOf(c) >= 0) st.push(c);
        else if (")]}".indexOf(c) >= 0) {
            if (st.isEmpty()) return false;
            char o = st.pop();
            if ("([{".indexOf(o) != ")]}".indexOf(c)) return false;
        }
    }
    return st.isEmpty();
}
System.out.println(balanced("{[()]}") + " " + balanced("{[(])}"));

// OUTPUT:
// true false`],
            ['Reverse a string.',
                r`Deque<Character> st = new ArrayDeque<>();
for (char c : "Java".toCharArray()) st.push(c);
StringBuilder sb = new StringBuilder();
while (!st.isEmpty()) sb.append(st.pop());
System.out.println(sb);

// OUTPUT:
// avaJ`]],
        [['Postfix evaluation.',
            r`Deque<Integer> st = new ArrayDeque<>();
for (String t : "3 4 + 2 *".split(" ")) {
    switch (t) {
        case "+" -> st.push(st.pop() + st.pop());
        case "*" -> st.push(st.pop() * st.pop());
        default -> st.push(Integer.parseInt(t));
    }
}
System.out.println(st.pop());

// OUTPUT:
// 14`],
            ['Legacy Stack.',
                r`Stack<Integer> s = new Stack<>();
s.push(1); s.push(2);
System.out.println(s.peek() + " " + s.pop() + " " + s.empty());

// OUTPUT:
// 2 2 false`]]
    ),

    'hashset': x(
        ['<code>HashSet</code> stores unique elements with no guaranteed order and allows one null.',
            'Backed by a <code>HashMap</code>; <code>add</code> returns false if the element already exists.',
            'Operations (add, remove, contains) are O(1) on average.'],
        ['Uniqueness uses <code>hashCode()</code> then <code>equals()</code>: override both consistently in your classes.',
            'Do not mutate fields used in hashCode while an object is in the set; it can get lost.',
            'Set operations: <code>addAll</code> (union), <code>retainAll</code> (intersection), <code>removeAll</code> (difference).'],
        ['Iteration order can change as the set resizes; use LinkedHashSet for insertion order or TreeSet for sorted order.',
            'Poor hashCode implementations degrade to O(n) (bucket collisions; Java 8 uses trees for large buckets).',
            'Initial capacity and load factor (0.75) tune resizing; pre-size for large sets.'],
        [['F', 'What is a HashSet?', 'A set backed by a hash table that stores unique elements without order.'],
            ['F', 'Does HashSet allow null?', 'Yes, a single null.'],
            ['M', 'How does it detect duplicates?', 'By hashCode to find the bucket and equals to compare elements in it.'],
            ['M', 'What if you change an element after adding it?', 'If hashCode changes, contains and remove may fail to find it.'],
            ['S', 'What is the load factor?', 'The fill ratio (default 0.75) at which the table resizes to keep operations fast.'],
            ['S', 'What happens with all elements having the same hashCode?', 'They go to one bucket; lookup degrades toward O(n), or O(log n) with treeified buckets for comparable keys.']],
        [['Remove duplicates and set math.',
            r`Set<Integer> a = new HashSet<>(List.of(1, 2, 3, 3));
Set<Integer> b = new HashSet<>(List.of(3, 4));
Set<Integer> union = new HashSet<>(a); union.addAll(b);
Set<Integer> inter = new HashSet<>(a); inter.retainAll(b);
System.out.println(a.size() + " " + union + " " + inter);

// OUTPUT:
// 3 [1, 2, 3, 4] [3]`],
            ['equals and hashCode.',
                r`record Point(int x, int y) {}
Set<Point> s = new HashSet<>();
s.add(new Point(1, 2)); s.add(new Point(1, 2));
System.out.println(s.size());

// OUTPUT:
// 1`]],
        [['Mutable key problem.',
            r`class P { int v; P(int v){this.v=v;} public int hashCode(){return v;} public boolean equals(Object o){return o instanceof P p && p.v==v;} }
Set<P> set = new HashSet<>(); P p = new P(1); set.add(p);
p.v = 2;
System.out.println(set.contains(p));

// OUTPUT:
// false`],
            ['Find first duplicate.',
                r`int[] a = {3, 1, 4, 1, 5};
Set<Integer> seen = new HashSet<>();
for (int n : a) if (!seen.add(n)) { System.out.println("dup " + n); break; }

// OUTPUT:
// dup 1`]]
    ),

    'linkedhashset': x(
        ['<code>LinkedHashSet</code> is a HashSet that keeps insertion order using a linked list through its entries.',
            'Still unique elements, one null allowed, O(1) operations.',
            'Re-inserting an existing element does not change its position.'],
        ['Use it to remove duplicates while preserving order: <code>new LinkedHashSet&lt;&gt;(list)</code>.',
            'Slightly more memory and slower than HashSet because of the links.',
            'Iteration is proportional to size (not capacity), faster than HashSet for sparse tables.'],
        ['Java 21 adds SequencedSet methods (<code>getFirst</code>, <code>reversed</code>) to LinkedHashSet.',
            'Order is insertion order only; for sorted order use TreeSet.',
            'Not thread-safe; wrap with <code>Collections.synchronizedSet</code> when needed.'],
        [['F', 'What does LinkedHashSet add over HashSet?', 'Predictable iteration in insertion order.'],
            ['F', 'Does it allow duplicates?', 'No.'],
            ['M', 'When to use it?', 'When you need uniqueness and want to keep the order elements were added.'],
            ['M', 'What happens if you add an existing element?', 'Nothing; add returns false and the original position stays.'],
            ['S', 'Cost versus HashSet?', 'A bit more memory (two links per entry) and slightly slower inserts, but faster iteration.'],
            ['S', 'How do you remove duplicates from a list and keep order?', 'Copy it into a LinkedHashSet and back to a list.']],
        [['Order-preserving dedupe.',
            r`List<String> in = List.of("b", "a", "b", "c", "a");
List<String> out = new ArrayList<>(new LinkedHashSet<>(in));
System.out.println(out);

// OUTPUT:
// [b, a, c]`],
            ['Compare with HashSet.',
                r`Set<String> h = new HashSet<>(List.of("zebra", "apple", "mango"));
Set<String> l = new LinkedHashSet<>(List.of("zebra", "apple", "mango"));
System.out.println(l);

// OUTPUT:
// [zebra, apple, mango]     (HashSet order is not guaranteed)`]],
        [['Sequenced methods (Java 21).',
            r`LinkedHashSet<Integer> s = new LinkedHashSet<>(List.of(1, 2, 3));
System.out.println(s.getFirst() + " " + s.getLast() + " " + s.reversed());

// OUTPUT:
// 1 3 [3, 2, 1]`],
            ['Re-adding keeps position.',
                r`Set<Integer> s = new LinkedHashSet<>(List.of(1, 2, 3));
s.add(1);
System.out.println(s);

// OUTPUT:
// [1, 2, 3]`]]
    ),

    'treeset': x(
        ['<code>TreeSet</code> keeps unique elements sorted (natural order or a Comparator), backed by a red-black tree.',
            'Operations are O(log n); null is not allowed with natural ordering.',
            'Navigation methods: <code>first</code>, <code>last</code>, <code>floor</code>, <code>ceiling</code>, <code>headSet</code>, <code>tailSet</code>.'],
        ['Elements must be Comparable or you must pass a Comparator; uniqueness is decided by compareTo, not equals.',
            '<code>descendingSet()</code> gives reverse order; <code>subSet(from, to)</code> returns a range view.',
            'Useful for leaderboards, range queries and keeping sorted unique data.'],
        ['A comparator inconsistent with equals makes the set behave oddly (elements with compare 0 are treated as duplicates).',
            'Not thread-safe; use <code>ConcurrentSkipListSet</code> for concurrent sorted sets.',
            'Compare with sorting a list once: TreeSet suits frequent inserts with ordered queries.'],
        [['F', 'What is a TreeSet?', 'A sorted set of unique elements based on a red-black tree.'],
            ['F', 'Does TreeSet allow null?', 'Not with natural ordering (NullPointerException).'],
            ['M', 'How is uniqueness decided?', 'By compareTo or the Comparator returning 0, not by equals.'],
            ['M', 'What does ceiling(x) return?', 'The smallest element greater than or equal to x, or null.'],
            ['S', 'TreeSet vs HashSet?', 'TreeSet gives sorted order and range queries at O(log n); HashSet gives O(1) without order.'],
            ['S', 'Concurrent alternative?', 'ConcurrentSkipListSet.']],
        [['Sorted unique values and navigation.',
            r`TreeSet<Integer> t = new TreeSet<>(List.of(50, 10, 40, 10, 30));
System.out.println(t + " " + t.first() + " " + t.floor(35) + " " + t.ceiling(35) + " " + t.headSet(40));

// OUTPUT:
// [10, 30, 40, 50] 10 30 40 [10, 30]`],
            ['Custom comparator.',
                r`TreeSet<String> t = new TreeSet<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
t.addAll(List.of("pear", "fig", "apple", "kiwi"));
System.out.println(t);

// OUTPUT:
// [fig, kiwi, pear, apple]`]],
        [['Comparator treats equal as duplicate.',
            r`TreeSet<String> t = new TreeSet<>(Comparator.comparing(String::length));
t.add("abc"); t.add("xyz");
System.out.println(t.size());

// OUTPUT:
// 1`],
            ['Top 3 scores.',
                r`TreeSet<Integer> scores = new TreeSet<>(Comparator.reverseOrder());
scores.addAll(List.of(70, 95, 88, 60, 99));
System.out.println(scores.stream().limit(3).toList());

// OUTPUT:
// [99, 95, 88]`]]
    )
};

export const collection1Deep: Record<string, Deep> = {
    'collection-framework': dv(
        [`The framework has two roots: <code>Collection</code> (List, Set, Queue) and <code>Map</code>. Abstract skeletons (<code>AbstractList</code>, <code>AbstractMap</code>) provide partial implementations. Iterable lets any collection work in the for-each loop. Since Java 21, SequencedCollection adds first, last and reversed views to ordered types.`,
            r`Collection<String> c = new ArrayList<>(List.of("a", "b"));
Iterable<String> it = c;
for (String s : it) System.out.print(s);
System.out.println();
System.out.println((c instanceof List) + " " + (c instanceof Set));

// OUTPUT:
// ab
// true false`],
        [`Choose by access pattern. Streams give a declarative pipeline over collections: filter, map, collect, groupingBy. Factory methods <code>List.of</code>, <code>Set.of</code> and <code>Map.of</code> return immutable collections that reject nulls. <code>Arrays.asList</code> is a fixed-size view over an array.`,
            r`Map<Integer, List<String>> byLen = Stream.of("hi", "java", "go", "code").collect(Collectors.groupingBy(String::length));
System.out.println(byLen);
try { List.of(1).add(2); } catch (UnsupportedOperationException e) { System.out.println("immutable"); }
List<Integer> view = Arrays.asList(1, 2, 3);
view.set(0, 9);
try { view.add(4); } catch (UnsupportedOperationException e) { System.out.println("fixed size"); }

// OUTPUT:
// {2=[hi, go], 4=[java, code]}
// immutable
// fixed size`],
        [`Mistakes: modifying a collection while iterating, using mutable objects as keys, using raw types, relying on HashSet or HashMap order, using Vector or Hashtable in new code, and returning internal mutable collections from getters (breaks encapsulation). Return copies or unmodifiable views.`,
            r`class Team {
    private final List<String> members = new ArrayList<>();
    public List<String> getMembers() { return members; }                          // leaks internals
    public List<String> getMembersSafe() { return Collections.unmodifiableList(members); }
}
Team t = new Team();
t.getMembers().add("hacker");
System.out.println(t.getMembersSafe());

// OUTPUT:
// [hacker]`],
        [`Performance depends on choice: ArrayList iteration is cache friendly, HashMap with a good hash is O(1), and boxing costs memory (an Integer list uses much more than int[]). For primitives consider arrays, IntStream or libraries like fastutil or Eclipse Collections. Measure with JMH before optimizing.`,
            r`int n = 5_000_000;
long t0 = System.nanoTime();
List<Integer> boxed = new ArrayList<>(n); for (int i = 0; i < n; i++) boxed.add(i);
long t1 = System.nanoTime();
int[] prim = new int[n]; for (int i = 0; i < n; i++) prim[i] = i;
long t2 = System.nanoTime();
System.out.println("boxed ms=" + (t1 - t0) / 1_000_000 + " primitive ms=" + (t2 - t1) / 1_000_000);

// OUTPUT: (varies)
// boxed ms=95 primitive ms=6`],
        [`Real-world: an LRU cache built on LinkedHashMap, a word counter with HashMap.merge, and a unique sorted tag list with TreeSet.`,
            r`class Lru<K, V> extends LinkedHashMap<K, V> {
    private final int cap;
    Lru(int cap) { super(16, 0.75f, true); this.cap = cap; }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) { return size() > cap; }
}
Lru<String, Integer> c = new Lru<>(2);
c.put("a", 1); c.put("b", 2); c.get("a"); c.put("c", 3);
System.out.println(c.keySet());

// OUTPUT:
// [a, c]`]
    ),

    'arraylist': dv(
        [`ArrayList stores elements in an <code>Object[] elementData</code> plus a size. Default capacity is 10 (allocated lazily on first add). When full, <code>grow</code> allocates oldCapacity + oldCapacity/2 and copies with <code>Arrays.copyOf</code>. <code>modCount</code> increments on structural changes, and iterators compare it to detect concurrent modification (fail-fast).`,
            r`List<Integer> l = new ArrayList<>();
for (int i = 0; i < 12; i++) l.add(i);          // capacity grows 10 -> 15
try {
    for (Integer i : l) if (i == 3) l.add(99);   // modCount changed
} catch (ConcurrentModificationException e) { System.out.println("fail-fast"); }

// OUTPUT:
// fail-fast`],
        [`Useful API: <code>addAll</code>, <code>subList</code> (view), <code>toArray</code>, <code>trimToSize</code>, <code>replaceAll</code>, <code>sort(Comparator)</code>, <code>removeIf</code>, <code>List.copyOf</code>, <code>stream()</code>. <code>Arrays.asList</code> is fixed-size; wrap it in new ArrayList to make it resizable.`,
            r`List<Integer> nums = new ArrayList<>(List.of(5, 1, 4, 2, 3));
nums.sort(Comparator.reverseOrder());
nums.replaceAll(n -> n * 10);
List<Integer> top = new ArrayList<>(nums.subList(0, 3));
Integer[] arr = nums.toArray(new Integer[0]);
System.out.println(nums + " " + top + " " + arr.length);

// OUTPUT:
// [50, 40, 30, 20, 10] [50, 40, 30] 5`],
        [`Mistakes: removing by index vs object on Integer lists, modifying inside for-each, holding a subList after changing the parent, memory leaks (a large ArrayList that is cleared keeps its capacity: use trimToSize or new list), and using ArrayList for frequent inserts at the front.`,
            r`List<Integer> parent = new ArrayList<>(List.of(1, 2, 3, 4));
List<Integer> sub = parent.subList(1, 3);
parent.add(5);
try { System.out.println(sub.size()); } catch (ConcurrentModificationException e) { System.out.println("subList invalid"); }

// OUTPUT:
// subList invalid`],
        [`Performance: add at the end is amortized O(1), add(0, x) is O(n) shifting, contains is O(n). Pre-size to avoid regrowth, prefer removeIf (single pass) over repeated remove (O(n) each), and use ArrayDeque for queue behavior.`,
            r`List<Integer> big = new ArrayList<>(1_000_000);   // no regrowth
for (int i = 0; i < 1_000_000; i++) big.add(i);
long t = System.nanoTime();
big.removeIf(n -> n % 2 == 0);                       // one pass O(n)
System.out.println(big.size() + " in " + (System.nanoTime() - t) / 1_000_000 + " ms");

// OUTPUT: (varies)
// 500000 in 8 ms`],
        [`Real-world: paginating results. Keep a list of items from a query, expose copies of subList ranges and never expose the internal list.`,
            r`static <T> List<T> page(List<T> all, int page, int size) {
    int from = Math.min(page * size, all.size());
    int to = Math.min(from + size, all.size());
    return List.copyOf(all.subList(from, to));
}
System.out.println(page(List.of(1,2,3,4,5,6,7), 1, 3));

// OUTPUT:
// [4, 5, 6]`]
    ),

    'linkedlist': dv(
        [`LinkedList holds <code>first</code> and <code>last</code> references to <code>Node</code> objects (item, next, prev). Adding at the ends is O(1) pointer updates; get(i) walks from the nearer end (so up to n/2 steps). Each node costs object header plus three references (about 24-32 bytes) on top of the element.`,
            r`LinkedList<Integer> l = new LinkedList<>();
l.add(1); l.addFirst(0); l.addLast(2);
System.out.println(l.getFirst() + " " + l.getLast() + " " + l.indexOf(1));

// OUTPUT:
// 0 2 1`],
        [`As a Deque it provides <code>offerFirst</code>, <code>pollLast</code>, <code>peekFirst</code>, <code>descendingIterator</code>. As a List it provides index methods. It allows nulls (ArrayDeque does not). It implements Queue so it can be a FIFO or work queue in single-threaded code.`,
            r`Deque<String> d = new LinkedList<>();
d.offerFirst("b"); d.offerFirst("a"); d.offerLast("c");
Iterator<String> it = ((LinkedList<String>) d).descendingIterator();
while (it.hasNext()) System.out.print(it.next());
System.out.println();

// OUTPUT:
// cba`],
        [`Mistakes: using get(i) in a loop (O(n^2)), choosing LinkedList for general lists because insertion sounds cheap, and expecting thread safety. Iterate with for-each or an iterator.`,
            r`LinkedList<Integer> l = new LinkedList<>(); for (int i = 0; i < 50_000; i++) l.add(i);
long t = System.nanoTime(); long sum = 0;
for (int i = 0; i < l.size(); i++) sum += l.get(i);          // quadratic
System.out.println("indexed ms=" + (System.nanoTime() - t) / 1_000_000);
t = System.nanoTime(); sum = 0;
for (int v : l) sum += v;                                     // linear
System.out.println("iterator ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// indexed ms=700
// iterator ms=1`],
        [`Benchmarks usually show ArrayList and ArrayDeque beating LinkedList even for inserts in the middle at moderate sizes because of cache locality and fewer allocations. Choose LinkedList only with clear evidence (very large lists with many positional inserts through iterators).`,
            r`Deque<Integer> q = new ArrayDeque<>();
for (int i = 0; i < 1_000_000; i++) q.addLast(i);
long s = 0; while (!q.isEmpty()) s += q.pollFirst();
System.out.println(s);

// OUTPUT:
// 499999500000`],
        [`Real-world: a browser history with back and forward navigation using two deques, or a task queue for single-threaded processing.`,
            r`Deque<String> back = new ArrayDeque<>(), forward = new ArrayDeque<>();
String current = "home";
back.push(current); current = "docs";
back.push(current); current = "blog";
current = back.pop(); forward.push("blog");
System.out.println(current + " " + forward);

// OUTPUT:
// docs [blog]`]
    ),

    'vector': dv(
        [`Vector stores elements in an array like ArrayList but declares methods <code>synchronized</code>, so each call acquires the object monitor. Capacity grows by capacityIncrement or doubles. It implements the same List interface and also offers legacy methods and Enumeration.`,
            r`Vector<Integer> v = new Vector<>(2, 3);     // initial 2, increment 3
v.add(1); v.add(2); v.add(3);
System.out.println(v.capacity());

// OUTPUT:
// 5`],
        [`Thread-safe options: <code>Collections.synchronizedList</code> (same locking idea), <code>CopyOnWriteArrayList</code> (copy on every write, snapshot iteration), and <code>ConcurrentLinkedQueue</code>. Choose based on read to write ratio.`,
            r`List<String> readMostly = new CopyOnWriteArrayList<>(List.of("a", "b"));
Thread t = new Thread(() -> readMostly.add("c"));
t.start();
for (String s : readMostly) System.out.print(s);
System.out.println();

// OUTPUT: (iterates a stable snapshot)
// ab`],
        [`Mistakes: assuming Vector makes compound operations atomic, iterating without holding the lock while other threads modify, and using it out of habit in new code. Synchronize on the vector for iteration or use a snapshot.`,
            r`Vector<Integer> v = new Vector<>(List.of(1, 2, 3));
synchronized (v) { Iterator<Integer> it = v.iterator(); while (it.hasNext()) System.out.print(it.next()); }
System.out.println();

// OUTPUT:
// 123`],
        [`Uncontended synchronization is cheap on modern JVMs, but contended locks hurt scalability. Benchmarks usually show ArrayList several times faster in single-threaded code. Use fine-grained or lock-free structures for concurrency.`,
            r`List<Integer> a = new ArrayList<>(), v = new Vector<>();
long t = System.nanoTime(); for (int i = 0; i < 5_000_000; i++) a.add(i); long ta = System.nanoTime() - t;
t = System.nanoTime(); for (int i = 0; i < 5_000_000; i++) v.add(i); long tv = System.nanoTime() - t;
System.out.println("ArrayList ms=" + ta / 1_000_000 + " Vector ms=" + tv / 1_000_000);

// OUTPUT: (varies)
// ArrayList ms=60 Vector ms=110`],
        [`Real-world: legacy code (older Swing models, JDBC or JNDI APIs) still returns Vector or Enumeration. Convert at the boundary to modern types.`,
            r`Enumeration<String> en = new Vector<>(List.of("x", "y")).elements();
List<String> modern = Collections.list(en);
System.out.println(modern);

// OUTPUT:
// [x, y]`]
    ),

    'stack': dv(
        [`java.util.Stack extends Vector and adds push (addElement), pop (remove last) and peek, all synchronized. ArrayDeque implements a stack through a circular array with head and tail indexes: push is addFirst, pop is removeFirst, giving O(1) with no node allocation.`,
            r`Deque<Integer> s = new ArrayDeque<>();
s.push(1); s.push(2); s.push(3);
System.out.println(s + " top=" + s.peek());

// OUTPUT:
// [3, 2, 1] top=3`],
        [`Typical algorithms: expression parsing (shunting yard), DFS without recursion, undo and redo, monotonic stack (next greater element), and matching delimiters. The call stack stores frames; recursion depth is limited by thread stack size.`,
            r`int[] a = {2, 1, 5, 3, 6};
int[] next = new int[a.length]; Arrays.fill(next, -1);
Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < a.length; i++) {
    while (!st.isEmpty() && a[st.peek()] < a[i]) next[st.pop()] = a[i];
    st.push(i);
}
System.out.println(Arrays.toString(next));

// OUTPUT:
// [5, 5, 6, 6, -1]`],
        [`Mistakes: using legacy Stack, calling pop on empty (exception), confusing the iteration order (Stack iterates bottom to top, ArrayDeque top to bottom), and unbounded recursion. Check isEmpty before pop or use poll style methods.`,
            r`Stack<Integer> s = new Stack<>(); s.push(1); s.push(2);
Deque<Integer> d = new ArrayDeque<>(); d.push(1); d.push(2);
System.out.println(s + " " + d);
System.out.println(d.pollFirst() + " " + new ArrayDeque<Integer>().pollFirst());

// OUTPUT:
// [1, 2] [2, 1]
// 2 null`],
        [`Deep recursion overflows the thread stack (around 10-20 thousand frames by default). Convert to an explicit ArrayDeque stack for DFS on large graphs.`,
            r`static int depth(Node root) {
    Deque<Node> st = new ArrayDeque<>(); Deque<Integer> d = new ArrayDeque<>();
    st.push(root); d.push(1); int max = 0;
    while (!st.isEmpty()) {
        Node n = st.pop(); int cur = d.pop(); max = Math.max(max, cur);
        if (n.left != null) { st.push(n.left); d.push(cur + 1); }
        if (n.right != null) { st.push(n.right); d.push(cur + 1); }
    }
    return max;
}

// OUTPUT:
// the tree depth is computed without recursion, safe for deep trees`],
        [`Real-world: undo and redo in an editor with two stacks of commands.`,
            r`Deque<String> undo = new ArrayDeque<>(), redo = new ArrayDeque<>();
undo.push("type A"); undo.push("type B");
String last = undo.pop(); redo.push(last);
System.out.println(undo + " " + redo);

// OUTPUT:
// [type A] [type B]`]
    ),

    'hashset': dv(
        [`HashSet wraps a HashMap, storing each element as a key with a shared dummy value. The bucket index is <code>(n - 1) &amp; hash</code> where hash spreads the high bits (<code>h ^ (h &gt;&gt;&gt; 16)</code>). Collisions use a linked list, converted to a red-black tree when a bucket exceeds 8 entries and the table is at least 64. The table doubles at size greater than capacity times 0.75.`,
            r`Set<String> s = new HashSet<>();
System.out.println(s.add("a") + " " + s.add("a") + " " + s.size());

// OUTPUT:
// true false 1`],
        [`A correct key class overrides hashCode and equals together (equal objects must have equal hash codes). Use immutable fields, <code>Objects.hash</code> or records. Set views: <code>Set.copyOf</code> for immutable, <code>Collections.newSetFromMap</code> for concurrent sets, <code>ConcurrentHashMap.newKeySet()</code> for a thread-safe set.`,
            r`final class Id {
    private final String v;
    Id(String v) { this.v = v; }
    @Override public boolean equals(Object o) { return o instanceof Id i && i.v.equals(v); }
    @Override public int hashCode() { return Objects.hash(v); }
}
Set<Id> ids = ConcurrentHashMap.newKeySet();
ids.add(new Id("x")); ids.add(new Id("x"));
System.out.println(ids.size());

// OUTPUT:
// 1`],
        [`Mistakes: overriding equals without hashCode (duplicates appear), mutable keys, expecting order, using HashSet<int[]> (arrays use identity), and heavy hashCode implementations. Wrap arrays in a List or record.`,
            r`Set<int[]> bad = new HashSet<>();
bad.add(new int[]{1, 2}); bad.add(new int[]{1, 2});
Set<List<Integer>> good = new HashSet<>();
good.add(List.of(1, 2)); good.add(List.of(1, 2));
System.out.println(bad.size() + " " + good.size());

// OUTPUT:
// 2 1`],
        [`Pre-size for known counts: capacity = expected / 0.75 + 1 to avoid rehashes. Bad hash functions cause collisions, and tree bins only help when keys are Comparable. Use a profiler or JMH to confirm.`,
            r`int n = 1_000_000;
Set<Integer> s = new HashSet<>((int) (n / 0.75f) + 1);
for (int i = 0; i < n; i++) s.add(i);
System.out.println(s.size());

// OUTPUT:
// 1000000`],
        [`Real-world: deduplicating events by id so each is processed once, and checking membership quickly in access control lists.`,
            r`Set<String> processed = ConcurrentHashMap.newKeySet();
boolean first = processed.add("evt-1001");
boolean again = processed.add("evt-1001");
System.out.println(first + " " + again);

// OUTPUT:
// true false`]
    ),

    'linkedhashset': dv(
        [`LinkedHashSet extends HashSet and is backed by a LinkedHashMap whose entries also form a doubly linked list in insertion order. Iteration follows the list, so it is proportional to the number of elements. Lookup is still by hash.`,
            r`Set<Integer> s = new LinkedHashSet<>();
s.add(3); s.add(1); s.add(2); s.add(1);
System.out.println(s);

// OUTPUT:
// [3, 1, 2]`],
        [`Java 21 SequencedSet API: <code>addFirst</code>, <code>addLast</code> (re-position if present), <code>getFirst</code>, <code>removeLast</code>, <code>reversed</code>. Use it for ordered unique collections such as tags, recently seen ids and ordered configuration keys.`,
            r`SequencedSet<String> tags = new LinkedHashSet<>(List.of("java", "spring"));
tags.addFirst("backend");
tags.addLast("java");           // moves java to the end
System.out.println(tags + " " + tags.reversed());

// OUTPUT:
// [backend, spring, java] [java, spring, backend]`],
        [`Mistakes: expecting sorted order, assuming access-order (that is LinkedHashMap with accessOrder true), and paying overhead when order is not needed. Use TreeSet for sorted data and HashSet when order is irrelevant.`,
            r`Set<String> s = new LinkedHashSet<>(List.of("b", "a", "c"));
System.out.println(s + " vs sorted " + new TreeSet<>(s));

// OUTPUT:
// [b, a, c] vs sorted [a, b, c]`],
        [`Overhead is roughly two more references per entry compared to HashSet. For large, order-free sets prefer HashSet; for small ordered sets the cost is negligible.`,
            r`Set<Integer> h = new HashSet<>(), l = new LinkedHashSet<>();
for (int i = 0; i < 1_000_000; i++) { h.add(i); l.add(i); }
long t = System.nanoTime(); long sh = 0; for (int v : h) sh += v; long th = System.nanoTime() - t;
t = System.nanoTime(); long sl = 0; for (int v : l) sl += v; long tl = System.nanoTime() - t;
System.out.println(sh == sl);

// OUTPUT:
// true`],
        [`Real-world: building a deduplicated, ordered list of search suggestions from multiple sources while keeping the priority order of the sources.`,
            r`Set<String> suggestions = new LinkedHashSet<>();
suggestions.addAll(List.of("java", "jvm"));
suggestions.addAll(List.of("jvm", "jdbc"));
System.out.println(suggestions);

// OUTPUT:
// [java, jvm, jdbc]`]
    ),

    'treeset': dv(
        [`TreeSet wraps a TreeMap, a red-black tree (self-balancing BST) giving O(log n) add, remove and contains with a height of at most 2 log n. In-order traversal yields sorted elements. Comparisons use compareTo or the supplied Comparator.`,
            r`NavigableSet<Integer> t = new TreeSet<>(List.of(10, 20, 30, 40));
System.out.println(t.lower(20) + " " + t.higher(20) + " " + t.subSet(15, true, 35, true) + " " + t.descendingSet());

// OUTPUT:
// 10 30 [20, 30] [40, 30, 20, 10]`],
        [`NavigableSet methods: <code>floor</code>, <code>ceiling</code>, <code>lower</code>, <code>higher</code>, <code>pollFirst</code>, <code>pollLast</code>, <code>headSet</code>, <code>tailSet</code>, <code>subSet</code> (live views). Comparator design: <code>comparing(...).thenComparing(...)</code>, <code>nullsFirst</code>, <code>reversed</code>.`,
            r`record Player(String name, int score) {}
TreeSet<Player> board = new TreeSet<>(Comparator.comparingInt(Player::score).reversed().thenComparing(Player::name));
board.add(new Player("Asha", 90)); board.add(new Player("Ravi", 95)); board.add(new Player("Meena", 90));
board.forEach(p -> System.out.println(p.name() + " " + p.score()));

// OUTPUT:
// Ravi 95
// Asha 90
// Meena 90`],
        [`Mistakes: a Comparator that ignores fields (silently drops elements), mutating sort fields after insertion (breaks the tree), adding non-comparable objects (ClassCastException), and null elements. Include a unique tiebreaker such as id.`,
            r`TreeSet<String> t = new TreeSet<>();
try { t.add(null); } catch (NullPointerException e) { System.out.println("no nulls"); }
TreeSet<Object> mixed = new TreeSet<>();
mixed.add("a");
try { mixed.add(1); } catch (ClassCastException e) { System.out.println("not comparable"); }

// OUTPUT:
// no nulls
// not comparable`],
        [`Every operation costs O(log n) comparisons, and pointer chasing hurts cache use, so for static data sort an array once and use binary search. Use ConcurrentSkipListSet for concurrent access.`,
            r`int[] sorted = {10, 20, 30, 40};
System.out.println(Arrays.binarySearch(sorted, 30));
NavigableSet<Integer> cs = new ConcurrentSkipListSet<>(List.of(3, 1, 2));
System.out.println(cs.first());

// OUTPUT:
// 2
// 1`],
        [`Real-world: a scheduler that keeps events sorted by time and polls the next due event, or a leaderboard returning the top N.`,
            r`record Event(long at, String name) {}
TreeSet<Event> schedule = new TreeSet<>(Comparator.comparingLong(Event::at).thenComparing(Event::name));
schedule.add(new Event(200, "B")); schedule.add(new Event(100, "A"));
System.out.println(schedule.pollFirst());

// OUTPUT:
// Event[at=100, name=A]`]
    )
};
