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
Collections.sort(nums);
System.out.println(nums);
Collections.reverse(nums);
System.out.println(nums);
System.out.println(Collections.max(nums) + " " + Collections.min(nums));

// OUTPUT:
// [2, 5, 9]
// [9, 5, 2]
// 9 2`]],
        [['Fail-fast demo.',
            r`List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
try {
    for (Integer i : l) if (i == 2) l.remove(i);
} catch (ConcurrentModificationException e) { System.out.println("CME"); }
l.removeIf(i -> i == 2);
System.out.println(l);

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
try {
    List.of(1).add(2);
} catch (UnsupportedOperationException e) { System.out.println("immutable"); }
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
List<Integer> boxed = new ArrayList<>(n);
for (int i = 0; i < n; i++) boxed.add(i);
long t1 = System.nanoTime();
int[] prim = new int[n];
for (int i = 0; i < n; i++) prim[i] = i;
long t2 = System.nanoTime();
System.out.println("boxed ms=" + (t1 - t0) / 1_000_000 + " primitive ms=" + (t2 - t1) / 1_000_000);

// OUTPUT: (varies)
// boxed ms=95 primitive ms=6`],
        [`Real-world: an LRU cache built on LinkedHashMap, a word counter with HashMap.merge, and a unique sorted tag list with TreeSet.`,
            r`class Lru<K, V> extends LinkedHashMap<K, V> {
    private final int cap;
    Lru(int cap) {
        super(16, 0.75f, true);
        this.cap = cap;
    }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) { return size() > cap; }
}
Lru<String, Integer> c = new Lru<>(2);
c.put("a", 1);
c.put("b", 2);
c.get("a");
c.put("c", 3);
System.out.println(c.keySet());

// OUTPUT:
// [a, c]`]
    ),

};
