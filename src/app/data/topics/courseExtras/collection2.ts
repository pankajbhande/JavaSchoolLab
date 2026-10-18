// Java Collections course extras, part 2 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const collection2Extras: Record<string, Extra> = {
    'hashmap': x(
        ['<code>HashMap</code> stores key-value pairs with unique keys, allows one null key and many null values, and has no guaranteed order.',
            'Core methods: <code>put</code>, <code>get</code>, <code>containsKey</code>, <code>remove</code>, <code>getOrDefault</code>, <code>keySet</code>, <code>values</code>, <code>entrySet</code>.',
            'Average O(1) for put and get.'],
        ['Use <code>merge</code>, <code>computeIfAbsent</code> and <code>putIfAbsent</code> instead of get-then-put code.',
            'Iterate entries with <code>for (Map.Entry&lt;K,V&gt; e : map.entrySet())</code>.',
            'Keys need correct <code>hashCode</code>/<code>equals</code>; prefer immutable keys such as String, Integer or records.'],
        ['Not thread-safe; use <code>ConcurrentHashMap</code> for concurrent access (HashMap can even loop or lose entries under races).',
            'Resizing doubles the table at 0.75 load; pre-size for large maps.',
            'Java 8 treeifies large buckets, so worst case lookups are O(log n) for comparable keys.'],
        [['F', 'What is a HashMap?', 'A hash table based Map that stores unique keys mapped to values.'],
            ['F', 'Does HashMap allow null?', 'One null key and any number of null values.'],
            ['M', 'How does HashMap work internally?', 'It computes the key hash, picks a bucket, and uses equals to find or add the entry in that bucket.'],
            ['M', 'HashMap vs Hashtable?', 'Hashtable is legacy and synchronized, with no nulls; HashMap is unsynchronized and allows nulls.'],
            ['S', 'What happens on hash collisions?', 'Entries share a bucket as a linked list, converted to a tree when long, so lookups stay fast.'],
            ['S', 'Why use ConcurrentHashMap instead of synchronizing a HashMap?', 'It uses finer-grained locking and CAS so reads and writes scale across threads, and offers atomic compute methods.']],
        [['Counting words.',
            r`Map<String, Integer> counts = new HashMap<>();
for (String w : "to be or not to be".split(" ")) counts.merge(w, 1, Integer::sum);
System.out.println(new TreeMap<>(counts));

// OUTPUT:
// {be=2, not=1, or=1, to=2}`],
            ['Grouping with computeIfAbsent.',
                r`Map<Integer, List<String>> byLen = new HashMap<>();
for (String s : List.of("hi", "go", "java"))
    byLen.computeIfAbsent(s.length(), k -> new ArrayList<>()).add(s);
System.out.println(byLen);

// OUTPUT:
// {2=[hi, go], 4=[java]}`]],
        [['Iterating entries.',
            r`Map<String, Integer> m = Map.of("a", 1);
for (Map.Entry<String, Integer> e : m.entrySet()) System.out.println(e.getKey() + "=" + e.getValue());
m.forEach((k, v) -> System.out.println(k + ":" + v));

// OUTPUT:
// a=1
// a:1`],
            ['Two sum with a map.',
                r`int[] a = {2, 7, 11, 15};
int target = 9;
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < a.length; i++) {
    Integer j = seen.get(target - a[i]);
    if (j != null) {
        System.out.println(j + "," + i);
        break;
    }
    seen.put(a[i], i);
}

// OUTPUT:
// 0,1`]]
    ),

    'linkedhashmap': x(
        ['<code>LinkedHashMap</code> is a HashMap that remembers insertion order (or access order).',
            'Iteration follows the order the keys were added; re-putting an existing key does not change its position.',
            'Same O(1) operations as HashMap.'],
        ['Use <code>new LinkedHashMap&lt;&gt;(16, 0.75f, true)</code> for access order, where get moves an entry to the end.',
            'Override <code>removeEldestEntry</code> to build a simple LRU cache.',
            'Good for predictable output such as JSON field order.'],
        ['Not thread-safe; wrap with <code>Collections.synchronizedMap</code> or use a dedicated cache library (Caffeine) for production.',
            'Java 21 SequencedMap adds <code>firstEntry</code>, <code>lastEntry</code>, <code>putFirst</code>, <code>reversed</code>.',
            'Memory is a little higher than HashMap (links per entry).'],
        [['F', 'What does LinkedHashMap add?', 'Predictable iteration order, insertion order by default.'],
            ['F', 'Is it sorted?', 'No; use TreeMap for sorted keys.'],
            ['M', 'What is access order?', 'A mode where each get or put moves the entry to the end, so the first entry is the least recently used.'],
            ['M', 'How do you build an LRU cache?', 'Extend LinkedHashMap with access order true and override removeEldestEntry to evict when size exceeds capacity.'],
            ['S', 'Is an LRU LinkedHashMap thread-safe?', 'No; even get mutates order. Synchronize externally or use Caffeine.'],
            ['S', 'Cost versus HashMap?', 'Extra memory and slightly slower writes for linking, but faster iteration.']],
        [['Insertion order preserved.',
            r`Map<String, Integer> m = new LinkedHashMap<>();
m.put("z", 1);
m.put("a", 2);
m.put("m", 3);
m.put("z", 9);
System.out.println(m);

// OUTPUT:
// {z=9, a=2, m=3}`],
            ['LRU cache.',
                r`Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
    @Override protected boolean removeEldestEntry(Map.Entry<String, Integer> e) { return size() > 2; }
};
lru.put("a", 1);
lru.put("b", 2);
lru.get("a");
lru.put("c", 3);
System.out.println(lru.keySet());

// OUTPUT:
// [a, c]`]],
        [['Sequenced map (Java 21).',
            r`SequencedMap<String, Integer> m = new LinkedHashMap<>();
m.put("a", 1);
m.put("b", 2);
m.putFirst("z", 0);
System.out.println(m + " " + m.firstEntry() + " " + m.reversed());

// OUTPUT:
// {z=0, a=1, b=2} z=0 {b=2, a=1, z=0}`],
            ['Ordered JSON-like output.',
                r`Map<String, Object> user = new LinkedHashMap<>();
user.put("id", 1);
user.put("name", "Abaji");
user.put("role", "admin");
System.out.println(user);

// OUTPUT:
// {id=1, name=Abaji, role=admin}`]]
    ),

    'treemap': x(
        ['<code>TreeMap</code> keeps keys sorted (natural order or Comparator) using a red-black tree.',
            'Operations are O(log n); null keys are not allowed with natural ordering.',
            'Navigation: <code>firstKey</code>, <code>lastKey</code>, <code>floorKey</code>, <code>ceilingKey</code>, <code>headMap</code>, <code>tailMap</code>, <code>subMap</code>.'],
        ['Keys must be Comparable or you must supply a Comparator; key equality is decided by compare returning 0.',
            '<code>descendingMap()</code> gives reverse order; <code>pollFirstEntry</code> removes the smallest.',
            'Good for range lookups, ordered reports and schedules.'],
        ['Use <code>ConcurrentSkipListMap</code> for a concurrent sorted map.',
            'A comparator inconsistent with equals causes surprising overwrites.',
            'For lookups only, HashMap is faster; use TreeMap only when you need order or range queries.'],
        [['F', 'What is a TreeMap?', 'A sorted map implemented with a red-black tree.'],
            ['F', 'Allowed null key?', 'Not with natural ordering.'],
            ['M', 'What does floorKey return?', 'The greatest key less than or equal to the given key, or null.'],
            ['M', 'TreeMap vs HashMap?', 'TreeMap is sorted with O(log n) operations and range queries; HashMap is O(1) average and unordered.'],
            ['S', 'How would you map score ranges to grades?', 'Put the lower bound of each range in a TreeMap and use floorEntry(score).'],
            ['S', 'Concurrent sorted alternative?', 'ConcurrentSkipListMap.']],
        [['Sorted keys and range views.',
            r`TreeMap<Integer, String> m = new TreeMap<>(Map.of(10, "a", 20, "b", 30, "c", 40, "d"));
System.out.println(m.firstKey() + " " + m.floorKey(25) + " " + m.ceilingKey(25) + " " + m.headMap(30) + " " + m.tailMap(30, true));

// OUTPUT:
// 10 20 30 {10=a, 20=b} {30=c, 40=d}`],
            ['Grade lookup by range.',
                r`TreeMap<Integer, String> grades = new TreeMap<>(Map.of(0, "F", 50, "D", 60, "C", 75, "B", 90, "A"));
for (int s : new int[]{45, 62, 90}) System.out.print(grades.floorEntry(s).getValue() + " ");
System.out.println();

// OUTPUT:
// F C A`]],
        [['Reverse order map.',
            r`TreeMap<String, Integer> m = new TreeMap<>(Comparator.reverseOrder());
m.put("a", 1);
m.put("c", 3);
m.put("b", 2);
System.out.println(m);

// OUTPUT:
// {c=3, b=2, a=1}`],
            ['Poll earliest.',
                r`TreeMap<Long, String> q = new TreeMap<>(Map.of(300L, "C", 100L, "A"));
System.out.println(q.pollFirstEntry() + " " + q);

// OUTPUT:
// 100=A {300=C}`]]
    ),

    'hashtable': x(
        ['<code>Hashtable</code> is a legacy, synchronized key-value collection; it does not allow null keys or values.',
            'It predates the Collections Framework and was retrofitted to implement Map.',
            'Methods are synchronized, so it is slower than HashMap in single-threaded use.'],
        ['Differences from HashMap: synchronized, no nulls, uses Enumeration, and its iteration order is not predictable.',
            'Use <code>ConcurrentHashMap</code> for thread-safe maps instead.',
            '<code>Properties</code> extends Hashtable and loads key-value files.'],
        ['Locking the whole table limits concurrency; ConcurrentHashMap locks per bin and uses CAS.',
            'Compound actions (check then put) are still not atomic on Hashtable.',
            'You mostly meet it in legacy code and via Properties.'],
        [['F', 'What is Hashtable?', 'A legacy synchronized hash table implementing Map.'],
            ['F', 'Does it allow null keys?', 'No, neither null keys nor values.'],
            ['M', 'Hashtable vs HashMap?', 'Hashtable is synchronized and rejects nulls; HashMap is not synchronized and allows nulls.'],
            ['M', 'Hashtable vs ConcurrentHashMap?', 'Hashtable locks the whole table for each call; ConcurrentHashMap uses fine-grained locking and atomic operations for better concurrency.'],
            ['S', 'Why are compound operations unsafe?', 'Separate synchronized calls can interleave, so check-then-put needs external locking or atomic methods like putIfAbsent.'],
            ['S', 'What is Properties?', 'A Hashtable subclass of String keys and values, used to load and store configuration.']],
        [['Hashtable basics.',
            r`Hashtable<String, Integer> t = new Hashtable<>();
t.put("a", 1);
t.put("b", 2);
try { t.put(null, 3); } catch (NullPointerException e) { System.out.println("null not allowed"); }
System.out.println(t.get("a") + " " + t.size());

// OUTPUT:
// null not allowed
// 1 2`],
            ['Properties.',
                r`Properties p = new Properties();
p.setProperty("db.url", "jdbc:mysql://localhost/app");
System.out.println(p.getProperty("db.url") + " " + p.getProperty("db.user", "root"));

// OUTPUT:
// jdbc:mysql://localhost/app root`]],
        [['Atomic update with ConcurrentHashMap.',
            r`ConcurrentHashMap<String, Integer> m = new ConcurrentHashMap<>();
m.merge("hits", 1, Integer::sum);
m.merge("hits", 1, Integer::sum);
System.out.println(m);

// OUTPUT:
// {hits=2}`],
            ['Check-then-act race.',
                r`Hashtable<String, Integer> t = new Hashtable<>();
// not atomic across two calls:
if (!t.containsKey("k")) t.put("k", 1);
// atomic:
((Map<String, Integer>) t).putIfAbsent("k", 1);
System.out.println(t);

// OUTPUT:
// {k=1}`]]
    ),

    'comparable': x(
        ['<code>Comparable&lt;T&gt;</code> defines the natural order of a class through <code>int compareTo(T other)</code>.',
            'Return negative, zero or positive when this is less than, equal to or greater than other.',
            'Sorting methods like <code>Collections.sort</code> and TreeSet use it.'],
        ['Keep compareTo consistent with equals where possible; use <code>Integer.compare</code> instead of subtraction (overflow).',
            'A class has only one natural order; use Comparator for others.',
            'String, Integer, LocalDate and many core classes implement Comparable.'],
        ['The contract: sign symmetry, transitivity and consistency; violating it causes "Comparison method violates its general contract" errors in TimSort.',
            'Inconsistent with equals leads to surprising behavior in TreeSet and TreeMap.',
            'Records and enums: enums are Comparable by ordinal; records need an explicit implementation.'],
        [['F', 'What is Comparable?', 'An interface giving a class its natural ordering through compareTo.'],
            ['F', 'What does compareTo return?', 'Negative, zero or positive for less, equal or greater.'],
            ['M', 'Why not use a - b in compareTo?', 'It can overflow for large values; use Integer.compare.'],
            ['M', 'Comparable vs Comparator?', 'Comparable is one natural order inside the class; Comparator is an external, reusable order.'],
            ['S', 'What is consistent with equals?', 'compareTo returns 0 exactly when equals is true; otherwise sorted sets and maps may drop or mix elements.'],
            ['S', 'What error indicates a broken compareTo?', 'IllegalArgumentException: Comparison method violates its general contract!']],
        [['Natural ordering.',
            r`class Student implements Comparable<Student> {
    final String name;
    final int marks;
    Student(String n, int m) {
        name = n;
        marks = m;
    }
    public int compareTo(Student o) { return Integer.compare(marks, o.marks); }
    public String toString() { return name + ":" + marks; }
}
List<Student> l = new ArrayList<>(List.of(new Student("A", 80), new Student("B", 60), new Student("C", 95)));
Collections.sort(l);
System.out.println(l);

// OUTPUT:
// [B:60, A:80, C:95]`],
            ['Tiebreaker.',
                r`public int compareTo(Student o) {
    int c = Integer.compare(o.marks, marks);          // highest first
    return c != 0 ? c : name.compareTo(o.name);
}

// OUTPUT:
// students with equal marks are ordered by name`]],
        [['Subtraction overflow.',
            r`int a = Integer.MAX_VALUE, b = -1;
System.out.println(a - b);                 // overflows to a negative number
System.out.println(Integer.compare(a, b));

// OUTPUT:
// -2147483648
// 1`],
            ['Not consistent with equals.',
                r`BigDecimal x = new BigDecimal("1.0"), y = new BigDecimal("1.00");
System.out.println(x.equals(y) + " " + x.compareTo(y));
System.out.println(new HashSet<>(List.of(x, y)).size() + " " + new TreeSet<>(List.of(x, y)).size());

// OUTPUT:
// false 0
// 2 1`]]
    ),

    'comparator': x(
        ['<code>Comparator&lt;T&gt;</code> defines an external ordering through <code>compare(a, b)</code>.',
            'Use it to sort by different fields without changing the class: <code>list.sort(Comparator.comparing(Student::getName))</code>.',
            'Chain with <code>thenComparing</code> and flip with <code>reversed()</code>.'],
        ['Factory methods: <code>comparing</code>, <code>comparingInt</code>, <code>naturalOrder</code>, <code>reverseOrder</code>, <code>nullsFirst</code>, <code>nullsLast</code>.',
            'Lambdas make comparators short: <code>(a, b) -&gt; a.age - b.age</code> (prefer comparingInt to avoid overflow).',
            'Comparators work with sort, TreeSet, TreeMap, PriorityQueue and streams.'],
        ['Comparators must be consistent: symmetric, transitive, and stable ordering; otherwise TimSort may throw.',
            'Extract reusable comparators as constants.',
            'For null-safe sorting wrap with nullsFirst or nullsLast.'],
        [['F', 'What is a Comparator?', 'An object that defines an ordering between two objects, separate from the class.'],
            ['F', 'How do you sort descending?', 'Use Comparator.reverseOrder() or comparator.reversed().'],
            ['M', 'Comparable vs Comparator?', 'Comparable is the class natural order (compareTo); Comparator is an external order (compare), allowing many orders.'],
            ['M', 'How do you sort by two fields?', 'comparing(first).thenComparing(second).'],
            ['S', 'How do you handle nulls?', 'Comparator.nullsFirst or nullsLast wrapping another comparator.'],
            ['S', 'Why use comparingInt over a lambda with subtraction?', 'It avoids overflow and boxing and reads clearly.']],
        [['Multi-field sorting.',
            r`record Emp(String dept, String name, int sal) {}
List<Emp> l = new ArrayList<>(List.of(new Emp("IT", "Raoji", 80), new Emp("HR", "Abaji", 70), new Emp("IT", "Anantrao", 80)));
l.sort(Comparator.comparing(Emp::dept).thenComparing(Emp::sal, Comparator.reverseOrder()).thenComparing(Emp::name));
l.forEach(System.out::println);

// OUTPUT:
// Emp[dept=HR, name=Abaji, sal=70]
// Emp[dept=IT, name=Anantrao, sal=80]
// Emp[dept=IT, name=Raoji, sal=80]`],
            ['Null-safe sorting.',
                r`List<String> l = new ArrayList<>(Arrays.asList("b", null, "a"));
l.sort(Comparator.nullsLast(Comparator.naturalOrder()));
System.out.println(l);

// OUTPUT:
// [a, b, null]`]],
        [['PriorityQueue with comparator.',
            r`PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
pq.add(new int[]{1, 30});
pq.add(new int[]{2, 10});
System.out.println(pq.poll()[0]);

// OUTPUT:
// 2`],
            ['Stable sort.',
                r`List<String> w = new ArrayList<>(List.of("bb", "a", "cc", "d"));
w.sort(Comparator.comparingInt(String::length));
System.out.println(w);

// OUTPUT:
// [a, d, bb, cc]      (equal lengths keep their original order)`]]
    ),

    'internal-hashset': x(
        ['A <code>HashSet</code> is implemented with a <code>HashMap</code>: each element is a key and a shared constant <code>PRESENT</code> object is the value.',
            '<code>add(e)</code> is <code>map.put(e, PRESENT) == null</code>, which is why add returns false for duplicates.',
            'So HashSet has the same performance as the HashMap behind it.'],
        ['The hash of the element selects the bucket; equals decides equality within the bucket.',
            'Default capacity 16 and load factor 0.75; the table doubles when size exceeds the threshold.',
            'LinkedHashSet uses a LinkedHashMap; TreeSet uses a TreeMap.'],
        ['Memory per element is that of a HashMap node (hash, key, value, next) plus the table slot.',
            'The extra value reference is shared, so there is no per-element value object.',
            'Iteration walks the whole table (capacity), so a huge empty table makes iteration slow.'],
        [['F', 'How is HashSet implemented?', 'Using a HashMap where the elements are the keys.'],
            ['F', 'What is the value stored?', 'A shared dummy object named PRESENT.'],
            ['M', 'Why does add return false for duplicates?', 'Because map.put returns the previous value (non-null) when the key already exists.'],
            ['M', 'What are the default capacity and load factor?', '16 and 0.75.'],
            ['S', 'Why can iteration be slow after many removals?', 'The table keeps its size, so iteration still scans every bucket.'],
            ['S', 'How do LinkedHashSet and TreeSet differ internally?', 'They use LinkedHashMap and TreeMap respectively.']],
        [['Mimic HashSet with a map.',
            r`class MySet<E> {
    private static final Object PRESENT = new Object();
    private final Map<E, Object> map = new HashMap<>();
    boolean add(E e) { return map.put(e, PRESENT) == null; }
    boolean contains(Object o) { return map.containsKey(o); }
    int size() { return map.size(); }
}
MySet<String> s = new MySet<>();
System.out.println(s.add("a") + " " + s.add("a") + " " + s.size());

// OUTPUT:
// true false 1`],
            ['Capacity and resize.',
                r`Set<Integer> s = new HashSet<>();   // capacity 16, threshold 12
for (int i = 0; i < 13; i++) s.add(i);              // 13th element triggers resize to 32
System.out.println(s.size());

// OUTPUT:
// 13`]],
        [['Equal hash collisions.',
            r`System.out.println("Aa".hashCode() + " " + "BB".hashCode());
Set<String> s = new HashSet<>(List.of("Aa", "BB"));
System.out.println(s.size());

// OUTPUT:
// 2112 2112
// 2`],
            ['Iteration cost after removals.',
                r`Set<Integer> s = new HashSet<>();
for (int i = 0; i < 1_000_000; i++) s.add(i);
s.removeIf(i -> i > 10);
System.out.println(s.size());       // iterating still scans the large table
s = new HashSet<>(s);                // rebuild a compact table

// OUTPUT:
// 11`]]
    ),

    'internal-hashmap': x(
        ['<code>HashMap</code> uses an array of buckets (<code>Node&lt;K,V&gt;[] table</code>); each node holds hash, key, value and next.',
            'put: compute hash, find index <code>(n-1) &amp; hash</code>, then add to the bucket or update the existing key.',
            'get: same index, then compare the hash and equals through the bucket.'],
        ['Collisions form a linked list; since Java 8 a bucket with 8 or more nodes (and table size at least 64) becomes a red-black tree.',
            'The table resizes (doubles) when size exceeds capacity times load factor (0.75), redistributing nodes.',
            'The hash spreads high bits: <code>h ^ (h &gt;&gt;&gt; 16)</code>.'],
        ['Capacity is always a power of two so the index is a cheap bit mask.',
            'Treeified bins use compareTo when keys are Comparable, giving O(log n) worst case.',
            'Concurrent modification (races) can corrupt a HashMap; ConcurrentHashMap uses CAS and per-bin synchronization.'],
        [['F', 'What data structure underlies HashMap?', 'An array of buckets with linked lists or trees.'],
            ['F', 'What is the default load factor?', '0.75.'],
            ['M', 'How does put work?', 'It hashes the key, finds the bucket, replaces the value if the key exists (by equals), otherwise appends a node and may resize.'],
            ['M', 'When does a bucket become a tree?', 'At 8 nodes in a bucket when the table has at least 64 buckets.'],
            ['S', 'Why is capacity a power of two?', 'The index can be computed with a bit mask instead of a modulo, and resizing splits buckets cleanly.'],
            ['S', 'What if two keys have equal hash and equals false?', 'They stay in the same bucket as separate nodes.']],
        [['Simplified HashMap.',
            r`class MiniMap<K, V> {
    static class Node<K, V> {
        K k;
        V v;
        Node<K, V> next;
        Node(K k, V v, Node<K, V> n) {
            this.k = k;
            this.v = v;
            next = n;
        }
    }
    @SuppressWarnings("unchecked") Node<K, V>[] table = new Node[16];
    int idx(Object k) {
        int h = k.hashCode();
        h ^= (h >>> 16);
        return (table.length - 1) & h;
    }
    void put(K k, V v) {
        int i = idx(k);
        for (Node<K, V> n = table[i]; n != null; n = n.next) if (n.k.equals(k)) {
            n.v = v;
            return;
        }
        table[i] = new Node<>(k, v, table[i]);
    }
    V get(K k) {
        for (Node<K, V> n = table[idx(k)]; n != null; n = n.next) if (n.k.equals(k)) return n.v;
        return null;
    }
}
MiniMap<String, Integer> m = new MiniMap<>();
m.put("a", 1);
m.put("a", 2);
System.out.println(m.get("a"));

// OUTPUT:
// 2`],
            ['Index calculation.',
                r`int h = "key".hashCode();
int spread = h ^ (h >>> 16);
System.out.println((16 - 1) & spread);

// OUTPUT:
// (a bucket index between 0 and 15)`]],
        [['Bad hashCode degrades lookups.',
            r`class Bad {
    final int v;
    Bad(int v){this.v=v;}
    public int hashCode(){return 1;}
    public boolean equals(Object o){return o instanceof Bad b && b.v==v;}
}
Map<Bad, Integer> m = new HashMap<>();
for (int i = 0; i < 20_000; i++) m.put(new Bad(i), i);
System.out.println(m.size());     // all in one bucket: O(n) per lookup (not Comparable, so no tree benefit)

// OUTPUT:
// 20000`],
            ['Pre-sizing.',
                r`Map<Integer, String> m = new HashMap<>((int) (1000 / 0.75f) + 1);
for (int i = 0; i < 1000; i++) m.put(i, "v" + i);
System.out.println(m.size());

// OUTPUT:
// 1000`]]
    )
};

export const collection2Deep: Record<string, Deep> = {
    'hashmap': dv(
        [`HashMap resolves a key in four steps: hashCode, spread, bucket index, equals chain. <code>put</code> on an empty table allocates 16 buckets, grows at 12 entries, and treeifies long chains. Views (<code>keySet</code>, <code>values</code>, <code>entrySet</code>) are live: removing from a view removes from the map.`,
            r`Map<String, Integer> m = new HashMap<>(Map.of("a", 1, "b", 2, "c", 3));
m.keySet().remove("a");
m.values().removeIf(v -> v == 2);
System.out.println(m);

// OUTPUT:
// {c=3}`],
        [`Rich API: <code>getOrDefault</code>, <code>putIfAbsent</code>, <code>compute</code>, <code>computeIfPresent</code>, <code>computeIfAbsent</code>, <code>merge</code>, <code>replaceAll</code>, <code>entry</code> streams, <code>Map.entry</code>, <code>Map.ofEntries</code>, and <code>Collectors.toMap</code> (with merge function).`,
            r`Map<String, Integer> stock = new HashMap<>(Map.of("pen", 5));
stock.compute("pen", (k, v) -> v == null ? 1 : v - 1);
stock.computeIfPresent("pen", (k, v) -> v > 0 ? v : null);
stock.merge("book", 10, Integer::sum);
Map<Boolean, List<String>> parts = Stream.of("a", "bb", "ccc").collect(Collectors.partitioningBy(s -> s.length() > 1));
Map<String, Integer> lens = Stream.of("a", "bb", "bb").collect(Collectors.toMap(s -> s, String::length, (x, y) -> x));
System.out.println(new TreeMap<>(stock) + " " + parts + " " + new TreeMap<>(lens));

// OUTPUT:
// {book=10, pen=4} {false=[a], true=[bb, ccc]} {a=1, bb=2}`],
        [`Mistakes: mutating a map during iteration, using mutable keys, assuming ordering, forgetting that <code>Collectors.toMap</code> throws on duplicate keys, null handling confusion between get returning null and containsKey, and sharing a HashMap across threads. Use containsKey or getOrDefault for clarity.`,
            r`Map<String, Integer> m = new HashMap<>();
m.put("x", null);
System.out.println(m.get("x") + " " + m.containsKey("x") + " " + m.get("y"));
try {
    Stream.of("a", "a").collect(Collectors.toMap(s -> s, s -> 1));
} catch (IllegalStateException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// null true null
// Duplicate key a (attempted merging values 1 and 1)`],
        [`Performance: pre-size, use primitive-keyed maps from fastutil or Eclipse Collections for int keys, choose good hash codes, and avoid creating key objects in hot paths. Measure with JMH.`,
            r`Map<Integer, Integer> m = new HashMap<>(1 << 21);
long t = System.nanoTime();
for (int i = 0; i < 1_000_000; i++) m.merge(i & 0xFFFF, 1, Integer::sum);
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000 + " size=" + m.size());

// OUTPUT: (varies)
// ms=30 size=65536`],
        [`Real-world: an in-memory index. Group orders by customer, compute totals, and look up quickly.`,
            r`record Order(String customer, double amount) {}
List<Order> orders = List.of(new Order("A", 100), new Order("B", 50), new Order("A", 25));
Map<String, Double> totals = orders.stream().collect(Collectors.groupingBy(Order::customer, TreeMap::new, Collectors.summingDouble(Order::amount)));
System.out.println(totals);

// OUTPUT:
// {A=125.0, B=50.0}`]
    ),

    'linkedhashmap': dv(
        [`LinkedHashMap extends HashMap; each entry (<code>LinkedHashMap.Entry</code>) has <code>before</code> and <code>after</code> links forming a doubly linked list. The map calls hooks (<code>afterNodeAccess</code>, <code>afterNodeInsertion</code>) which HashMap defines for exactly this subclass. With access order, afterNodeAccess moves the entry to the tail.`,
            r`LinkedHashMap<String, Integer> m = new LinkedHashMap<>(16, 0.75f, true);
m.put("a", 1);
m.put("b", 2);
m.put("c", 3);
m.get("a");
System.out.println(m.keySet());

// OUTPUT:
// [b, c, a]`],
        [`LRU cache template: capacity, access order, eviction hook. Add synchronization via <code>Collections.synchronizedMap</code> for simple sharing, or use Caffeine for time based expiry, statistics and concurrency.`,
            r`class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int max;
    LruCache(int max) {
        super(max + 1, 0.75f, true);
        this.max = max;
    }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) { return size() > max; }
}
Map<String, String> cache = Collections.synchronizedMap(new LruCache<>(2));
cache.put("1", "a");
cache.put("2", "b");
cache.get("1");
cache.put("3", "c");
System.out.println(cache.keySet());

// OUTPUT:
// [1, 3]`],
        [`Mistakes: forgetting access order true (becomes FIFO), reading from multiple threads without sync (get mutates the list), and returning eviction logic that removes in the wrong condition. Test eviction order.`,
            r`Map<Integer, String> fifo = new LinkedHashMap<>(4, 0.75f, false) {
    protected boolean removeEldestEntry(Map.Entry<Integer, String> e) { return size() > 2; }
};
fifo.put(1, "a");
fifo.put(2, "b");
fifo.get(1);
fifo.put(3, "c");
System.out.println(fifo.keySet());

// OUTPUT:
// [2, 3]      (insertion order, so 1 was evicted despite the get)`],
        [`Costs are about the same as HashMap plus two references per entry. For hot caches, a library with better concurrency (Caffeine with W-TinyLFU) beats a synchronized LRU map.`,
            r`Cache<String, String> cache = Caffeine.newBuilder().maximumSize(10_000).expireAfterWrite(Duration.ofMinutes(10)).recordStats().build();
String v = cache.get("key", k -> loadFromDb(k));

// OUTPUT:
// loads once per key and expires after 10 minutes`],
        [`Real-world: preserving the order of request parameters, ordered configuration, and a recent-searches list limited to the latest 5 items.`,
            r`Map<String, Boolean> recent = new LinkedHashMap<>(8, 0.75f, true) {
    protected boolean removeEldestEntry(Map.Entry<String, Boolean> e) { return size() > 5; }
};
for (String q : List.of("a", "b", "c", "d", "e", "f")) recent.put(q, true);
System.out.println(recent.keySet());

// OUTPUT:
// [b, c, d, e, f]`]
    ),

    'treemap': dv(
        [`TreeMap is a red-black tree: every node is red or black, the root is black, red nodes have black children, and every path has the same number of black nodes, which bounds the height to 2 log2(n+1). Insert and delete rebalance with rotations and recoloring.`,
            r`TreeMap<Integer, String> m = new TreeMap<>();
for (int i = 1; i <= 7; i++) m.put(i, "v" + i);        // sorted insertion stays balanced
System.out.println(m.firstEntry() + " " + m.lastEntry() + " " + m.higherKey(4));

// OUTPUT:
// 1=v1 7=v7 5`],
        [`NavigableMap API: <code>floorEntry</code>, <code>ceilingEntry</code>, <code>lowerKey</code>, <code>higherKey</code>, <code>headMap</code>, <code>tailMap</code>, <code>subMap</code>, <code>descendingMap</code>, <code>pollFirstEntry</code>. Range views are live and bounded. Typical uses: time series lookup, interval and tier tables, ordered indexes.`,
            r`TreeMap<LocalDate, Double> rates = new TreeMap<>(Map.of(LocalDate.of(2025, 1, 1), 1.5, LocalDate.of(2025, 6, 1), 1.8));
LocalDate q = LocalDate.of(2025, 3, 15);
System.out.println(rates.floorEntry(q).getValue());          // rate in force on that day

// OUTPUT:
// 1.5`],
        [`Mistakes: a Comparator inconsistent with equals (keys silently collapse), mutating keys after insert, null keys, mixing key types, and using TreeMap when HashMap suffices. A comparator must define a total order.`,
            r`TreeMap<String, Integer> m = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
m.put("Java", 1);
m.put("JAVA", 2);
System.out.println(m + " " + m.size());

// OUTPUT:
// {Java=2} 1`],
        [`Every lookup walks O(log n) nodes with pointer chasing; for read-only data a sorted array with binary search is faster. For concurrent access use ConcurrentSkipListMap (O(log n) expected, lock-free reads).`,
            r`ConcurrentNavigableMap<Integer, String> m = new ConcurrentSkipListMap<>();
IntStream.range(0, 5).parallel().forEach(i -> m.put(i, "v" + i));
System.out.println(m.headMap(3));

// OUTPUT:
// {0=v0, 1=v1, 2=v2}`],
        [`Real-world: shipping charges by weight bracket, order book by price level, and a calendar of events by time.`,
            r`TreeMap<Integer, Integer> charge = new TreeMap<>(Map.of(0, 40, 1000, 70, 5000, 120));
for (int w : new int[]{500, 1000, 7000}) System.out.print(charge.floorEntry(w).getValue() + " ");
System.out.println();

// OUTPUT:
// 40 70 120`]
    ),

    'hashtable': dv(
        [`Hashtable uses an array of Entry chains, indexes with <code>(hash &amp; 0x7FFFFFFF) % table.length</code> (modulo, not a mask), grows to <code>2 * n + 1</code>, and every public method is <code>synchronized</code> on the table. It never treeifies chains. Its Enumerator is not fail-fast while the iterator is.`,
            r`Hashtable<String, Integer> t = new Hashtable<>();
t.put("a", 1);
Enumeration<String> keys = t.keys();
while (keys.hasMoreElements()) System.out.println(keys.nextElement());

// OUTPUT:
// a`],
        [`Modern choices: <code>ConcurrentHashMap</code> (atomic compute, merge, bulk operations), <code>Collections.synchronizedMap</code> (explicit lock for iteration), immutable <code>Map.of</code> for constants. <code>Properties</code> still matters for config files and system properties.`,
            r`ConcurrentHashMap<String, LongAdder> hits = new ConcurrentHashMap<>();
hits.computeIfAbsent("home", k -> new LongAdder()).increment();
System.out.println(hits);
Properties p = new Properties();
try (Reader r = new StringReader("a=1\nb=2")) { p.load(r); } catch (IOException e) {}
System.out.println(p.getProperty("b"));

// OUTPUT:
// {home=1}
// 2`],
        [`Mistakes: expecting nulls to work, thinking compound operations are atomic, holding the table lock for long work, and iterating without locking the table. Prefer atomic methods.`,
            r`Hashtable<String, String> t = new Hashtable<>();
try { t.put("k", null); } catch (NullPointerException e) { System.out.println("NPE"); }
Map<String, String> sm = Collections.synchronizedMap(new HashMap<>());
synchronized (sm) { for (var e : sm.entrySet()) { /* safe iteration */ } }

// OUTPUT:
// NPE`],
        [`One lock for the whole table serializes every operation, limiting throughput as threads grow. ConcurrentHashMap reads without locking and locks per bin on writes, so it scales much better.`,
            r`Map<Integer, Integer> a = new Hashtable<>(), b = new ConcurrentHashMap<>();
Runnable w = () -> { for (int i = 0; i < 200_000; i++) {
    a.put(i, i);
    b.put(i, i);
}
};
ExecutorService ex = Executors.newFixedThreadPool(8);
for (int i = 0; i < 8; i++) ex.submit(w);
ex.shutdown();

// OUTPUT:
// (ConcurrentHashMap completes noticeably faster under contention)`],
        [`Real-world: legacy JNDI environments and JDBC connection properties still use Hashtable and Properties; convert to Map at the edge.`,
            r`Properties props = new Properties();
props.setProperty("user", "app");
props.setProperty("password", "secret");
Map<String, String> asMap = props.stringPropertyNames().stream().collect(Collectors.toMap(k -> k, props::getProperty));
System.out.println(new TreeMap<>(asMap).keySet());

// OUTPUT:
// [password, user]`]
    ),

    'comparable': dv(
        [`Collections.sort and Arrays.sort for objects use TimSort (merge sort plus insertion sort), which is stable and calls compareTo. Sorted structures (TreeMap, TreeSet, PriorityQueue) call compareTo on every insert. Contract: sgn(x.compareTo(y)) == -sgn(y.compareTo(x)), transitive, and x.compareTo(y)==0 implies the same sign against any z.`,
            r`List<String> w = new ArrayList<>(List.of("banana", "Apple", "cherry"));
Collections.sort(w);
System.out.println(w);
w.sort(String.CASE_INSENSITIVE_ORDER);
System.out.println(w);

// OUTPUT:
// [Apple, banana, cherry]
// [Apple, banana, cherry]`],
        [`Implement with Comparator helpers inside compareTo for multi-field order, and keep it consistent with equals and hashCode. For records, declare Comparable explicitly. Enums compare by declaration order. <code>Comparable.compareTo(null)</code> should throw NullPointerException.`,
            r`record Version(int major, int minor) implements Comparable<Version> {
    private static final Comparator<Version> ORDER = Comparator.comparingInt(Version::major).thenComparingInt(Version::minor);
    public int compareTo(Version o) { return ORDER.compare(this, o); }
}
System.out.println(new Version(1, 9).compareTo(new Version(2, 0)) < 0);
System.out.println(Collections.max(List.of(new Version(1, 2), new Version(1, 10))));

// OUTPUT:
// true
// Version[major=1, minor=10]`],
        [`Mistakes: comparing doubles with subtraction, forgetting a tiebreaker (equal elements vanish in sets), comparing only part of the state, and non-transitive logic (rock-paper-scissors). Use Double.compare for floating point.`,
            r`double a = 0.0, b = -0.0;
System.out.println((a == b) + " " + Double.compare(a, b));
System.out.println(Double.compare(Double.NaN, 1.0));

// OUTPUT:
// true 1
// 1`],
        [`compareTo is called O(n log n) times in a sort, so keep it cheap: compare primitive fields first, cache expensive derived keys (Schwartzian transform), and avoid allocations inside compareTo.`,
            r`List<String> files = new ArrayList<>(List.of("b.txt", "a.txt"));
Map<String, Integer> weight = new HashMap<>();
files.sort(Comparator.comparing(f -> weight.computeIfAbsent(f, k -> expensive(k))));

// OUTPUT:
// the expensive key is computed once per element, not once per comparison`],
        [`Real-world: semantic version ordering, money amounts, and priority tasks in a PriorityQueue.`,
            r`record Task(String name, int priority) implements Comparable<Task> {
    public int compareTo(Task o) { return Integer.compare(o.priority, priority); }
}
PriorityQueue<Task> pq = new PriorityQueue<>(List.of(new Task("low", 1), new Task("urgent", 9)));
System.out.println(pq.poll().name());

// OUTPUT:
// urgent`]
    ),

    'comparator': dv(
        [`Comparator is a functional interface with one abstract method <code>compare</code> and many default and static helpers. <code>thenComparing</code> returns a new comparator that tries the next key on ties. <code>reversed()</code> flips the sign. Sorting with a comparator is stable (TimSort), so earlier sorts act as secondary keys.`,
            r`record P(String city, int age) {}
List<P> l = new ArrayList<>(List.of(new P("B", 30), new P("A", 30), new P("A", 20)));
l.sort(Comparator.comparingInt(P::age));
l.sort(Comparator.comparing(P::city));            // stable: age order kept within a city
System.out.println(l);

// OUTPUT:
// [P[city=A, age=20], P[city=A, age=30], P[city=B, age=30]]`],
        [`Advanced use: <code>Comparator.comparing(key, keyComparator)</code>, <code>nullsFirst</code>, collation with <code>java.text.Collator</code> for locale-aware strings, natural ("file2" before "file10") order comparators, and custom comparators in streams (<code>sorted</code>, <code>max</code>, <code>min</code>, <code>toMap</code> into <code>TreeMap</code>).`,
            r`Collator c = Collator.getInstance(Locale.FRANCE);
List<String> w = new ArrayList<>(List.of("zèbre", "zebra", "école", "ecole"));
w.sort(c);
System.out.println(w);
Optional<String> longest = w.stream().max(Comparator.comparingInt(String::length));
System.out.println(longest.get());

// OUTPUT:
// [ecole, école, zebra, zèbre]
// école`],
        [`Mistakes: lambdas that subtract ints (overflow), non-transitive comparisons, comparators that throw on null, rebuilding a comparator in a hot loop, and mutating the data while sorting. Define comparators as static finals.`,
            r`List<Integer> l = new ArrayList<>(List.of(Integer.MAX_VALUE, -1, 0));
try { l.sort((a, b) -> a - b); } catch (Exception e) {}
l.sort(Integer::compare);
System.out.println(l);

// OUTPUT:
// [-1, 0, 2147483647]`],
        [`Performance: comparingInt avoids boxing; cache costly keys; sort primitives with Arrays.sort(int[]) (dual-pivot quicksort), and use parallelSort for very large arrays.`,
            r`int[] a = new Random(1).ints(5_000_000).toArray();
long t = System.nanoTime();
Arrays.parallelSort(a);
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=120`],
        [`Real-world: a table with clickable column headers where each column maps to a comparator and direction.`,
            r`Map<String, Comparator<Emp>> cols = Map.of("name", Comparator.comparing(Emp::name), "salary", Comparator.comparingInt(Emp::sal));
Comparator<Emp> cmp = cols.get(sortParam);
if ("desc".equals(dirParam)) cmp = cmp.reversed();
emps.sort(cmp);

// OUTPUT:
// the list is sorted by the chosen column and direction`]
    ),

    'internal-hashset': dv(
        [`Source level view: <code>HashSet</code> has a field <code>private transient HashMap&lt;E,Object&gt; map</code>. <code>add</code>, <code>remove</code> and <code>contains</code> delegate to map. The no-arg constructor creates a default HashMap; <code>HashSet(int)</code> sets capacity; the Collection constructor sizes at <code>max(c.size()/.75f + 1, 16)</code>. Serialization writes capacity, load factor and elements.`,
            r`Set<String> s = new HashSet<>(List.of("a", "b"));
Set<String> copy = new HashSet<>(s);
System.out.println(copy.equals(s) + " " + (s.hashCode() == copy.hashCode()));

// OUTPUT:
// true true`],
        [`Set equality: two sets are equal if they have the same size and every element of one is contained in the other; set hashCode is the sum of element hash codes (order independent). <code>retainAll</code> and <code>removeAll</code> perform bulk work; choose the smaller set to iterate for speed.`,
            r`Set<Integer> a = new HashSet<>(List.of(1, 2, 3)), b = new HashSet<>(List.of(3, 2, 1));
System.out.println(a.equals(b) + " " + a.hashCode());
Set<Integer> diff = new HashSet<>(a);
diff.removeAll(Set.of(2));
System.out.println(diff);

// OUTPUT:
// true 6
// [1, 3]`],
        [`Pitfalls: relying on internal order, expecting stable iteration across Java versions, overriding equals without hashCode, and wasting memory with many tiny HashSets (each creates a table of 16 on first add). Use Set.of for small constant sets or EnumSet for enums.`,
            r`enum Day { MON, TUE, WED }
Set<Day> days = EnumSet.of(Day.MON, Day.WED);
Set<String> tiny = Set.of("a", "b");
System.out.println(days + " " + tiny.contains("a"));

// OUTPUT:
// [MON, WED] true`],
        [`Memory per element is about 32 bytes for the node plus the table slot (4 to 8 bytes) plus the element object. For millions of ints use primitive sets (fastutil IntOpenHashSet, Eclipse IntHashSet) or a BitSet when values are dense.`,
            r`BitSet seen = new BitSet(1_000_000);
for (int i = 0; i < 1_000_000; i += 3) seen.set(i);
System.out.println(seen.cardinality() + " " + seen.get(9));

// OUTPUT:
// 333334 true`],
        [`Real-world: finding common customers between two lists using the smaller set, and checking membership in constant time.`,
            r`Set<String> a = new HashSet<>(List.of("c1", "c2", "c3"));
Set<String> b = new HashSet<>(List.of("c3", "c4"));
Set<String> common = a.size() <= b.size() ? a.stream().filter(b::contains).collect(Collectors.toSet()) : b.stream().filter(a::contains).collect(Collectors.toSet());
System.out.println(common);

// OUTPUT:
// [c3]`]
    ),

    'internal-hashmap': dv(
        [`HashMap internals (Java 8+): <code>hash(key)</code> is <code>h ^ (h &gt;&gt;&gt; 16)</code>; <code>putVal</code> initializes the table if needed, places in an empty bucket, otherwise compares the first node, then walks the tree or list, appending at the tail; <code>treeifyBin</code> runs at 8 nodes if capacity is at least 64 (else resize). <code>resize</code> doubles the table and splits each bucket into low and high lists without rehashing, using the bit at the old capacity.`,
            r`int oldCap = 16, hash = 0b10101;                // 21
int idxOld = hash & (oldCap - 1);                 // 5
int idxNew = hash & (oldCap * 2 - 1);             // 21 (bit 16 is set: moves by +oldCap)
System.out.println(idxOld + " -> " + idxNew);

// OUTPUT:
// 5 -> 21`],
        [`Node types: <code>Node</code> for lists, <code>TreeNode</code> for bins. Fail-fast is implemented with <code>modCount</code>. <code>HashMap.newHashMap(n)</code> (Java 19) sizes for n entries. Keys with identical hash codes still work: equals disambiguates and, for Comparable keys, a tree orders them.`,
            r`Map<String, Integer> m = HashMap.newHashMap(100);       // Java 19+: capacity for 100 mappings without resize
for (int i = 0; i < 100; i++) m.put("k" + i, i);
System.out.println(m.size());

// OUTPUT:
// 100`],
        [`Pitfalls: concurrent puts during resize may lose data or (older versions) create cycles that loop forever on get; mutable keys; and hash flooding attacks with colliding keys (treeified bins and per-process string hash behavior limit this, but validate untrusted input sizes).`,
            r`// Do NOT do this:
Map<Integer, Integer> shared = new HashMap<>();
ExecutorService ex = Executors.newFixedThreadPool(4);
for (int t = 0; t < 4; t++) ex.submit(() -> { for (int i = 0; i < 100_000; i++) shared.put(i, i); });
ex.shutdown();

// OUTPUT: (undefined behavior)
// lost entries, wrong size, or exceptions; use ConcurrentHashMap`],
        [`Cost model: a lookup is hash computation, one array access, and a short chain compare, so keys with expensive hashCode or equals dominate. Cache a hash (String does), keep keys small and immutable, and avoid resizing by pre-sizing.`,
            r`record Key(String a, int b) {}
Map<Key, String> m = new HashMap<>();
m.put(new Key("x", 1), "v");
System.out.println(m.get(new Key("x", 1)));        // record gives value-based equals and hashCode

// OUTPUT:
// v`],
        [`Real-world: debugging a slow lookup. A bad hashCode (such as returning a constant, or only the first field) causes one huge bucket; fix with a hash over all identity fields.`,
            r`class Sku { final String code; final int rev;
    Sku(String c, int r) {
        code = c;
        rev = r;
    }
    @Override public boolean equals(Object o) {
        return o instanceof Sku s && s.code.equals(code) && s.rev == rev;
    }
    @Override public int hashCode() { return Objects.hash(code, rev); }
}
System.out.println(new Sku("A", 1).hashCode() == new Sku("A", 1).hashCode());

// OUTPUT:
// true`]
    )
};
