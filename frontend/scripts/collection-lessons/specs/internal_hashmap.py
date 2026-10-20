"""Internal working of HashMap. Samples build a tiny HashMap by hand to show every step.
Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

BEGINNER = [
    section(
        'The big idea',
        'A HashMap is <strong>an array of buckets</strong>. To store or find a key, Java turns the key into a number (the <strong>hash code</strong>), turns that number into an <strong>array index</strong>, and goes straight to that bucket. '
        'That is why <code>get</code> and <code>put</code> take about the same time whether the map holds 10 entries or 10 million.',
        [
            'The array is called <code>table</code>; each slot is a <strong>bucket</strong> holding a chain of <code>Node</code> objects (key, value, hash, next).',
            'Default <strong>capacity 16</strong> buckets, <strong>load factor 0.75</strong>: when more than 12 entries exist the table <strong>doubles</strong>.',
            'Two different keys can land in the same bucket: a <strong>collision</strong>. They share a linked list there.',
            'Since Java 8, a long chain (8 or more nodes, with capacity at least 64) becomes a <strong>red-black tree</strong>.',
        ],
    ),
    (
        '<h3>The four steps of put(key, value)</h3>\n'
        + table(['Step', 'What happens', 'Code idea'], [
            ['<strong>1. Hash</strong>', 'Call <code>key.hashCode()</code> and mix the high bits into the low bits', '<code>h ^ (h &gt;&gt;&gt; 16)</code>'],
            ['<strong>2. Index</strong>', 'Reduce the hash to a bucket number', '<code>(n - 1) &amp; hash</code>'],
            ['<strong>3. Search the bucket</strong>', 'Walk the chain: same hash and <code>equals(key)</code> means "update this node"', '<code>equals()</code> decides'],
            ['<strong>4. Insert</strong>', 'No match: add a new node at the end of the chain. Resize if size is above the threshold', 'size &gt; 0.75 x capacity'],
        ]),
        [r'''// Step 1 and 2 by hand: from a key to a bucket number (capacity 16)
public class HashStepsDemo {
    static int spread(Object key) {
        int h = key.hashCode();
        return h ^ (h >>> 16);                       // mix high bits into low bits (same as HashMap.hash)
    }

    public static void main(String[] args) {
        int capacity = 16;
        for (String fort : new String[] {"Raigad", "Torna", "Lohagad", "Panhala", "Purandar"}) {
            int hash = spread(fort);
            int index = (capacity - 1) & hash;       // (n - 1) & hash: the bucket number
            System.out.println(fort + "  hashCode=" + fort.hashCode() + "  bucket=" + index);
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>Why a power-of-two capacity?</h3>\n'
        + ul([
            'When n is a power of two, <code>(n - 1) &amp; hash</code> equals <code>hash % n</code> but is <strong>much faster</strong> (one AND instruction).',
            'It also makes resizing cheap: after doubling, each entry either <strong>stays</strong> at its index or moves to <strong>index + oldCapacity</strong>.',
            'That is why <code>new HashMap&lt;&gt;(10)</code> actually creates a table of 16: the capacity is rounded up to the next power of two.',
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('A HashMap built by hand', 'The best way to understand it is to write a small one. Each sample below adds one idea.'),
    method(
        'Node: key, value, hash, next', 'static class Node { final int hash; final K key; V value; Node next; }', 'one entry of a bucket chain', 'O(1)',
        'Every entry is a <code>Node</code>. It stores the <strong>key</strong>, the <strong>value</strong>, the key\'s <strong>hash</strong> (so it need not be recomputed) and a <strong>next</strong> pointer to the following node in the same bucket.',
        'In the real <code>java.util.HashMap</code> the class is <code>HashMap.Node</code>; a bucket that turned into a tree holds <code>TreeNode</code> objects instead.',
        r'''// A bucket is a chain of nodes: the idea behind collisions
public class NodeDemo {
    static class Node {
        final String key;
        int value;
        Node next;                                   // next node in the same bucket

        Node(String key, int value, Node next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    public static void main(String[] args) {
        Node chain = new Node("Raigad", 6, new Node("Torna", 5, new Node("Lohagad", 2, null)));   // three keys in one bucket
        for (Node n = chain; n != null; n = n.next) {
            System.out.println(n.key + "=" + n.value + (n.next != null ? "  -> next" : "  -> end"));
        }
    }
}
''' + OUT),
    method(
        'put(): hash, index, search, insert', 'V put(K key, V value)', 'the old value or null', 'O(1) average',
        'Compute the bucket, walk its chain looking for an equal key. If found, <strong>replace the value</strong>; otherwise <strong>add a node</strong> (this miniature adds it at the front of the chain for brevity; the real HashMap appends at the tail). It uses only 4 buckets so you can see collisions.',
        'The real code first compares <code>hash</code> (cheap int compare) and only then calls <code>equals</code> (possibly expensive). That is why a good <code>hashCode</code> matters.',
        r'''// MiniHashMap: put() and get() with a fixed 4 buckets, to show collisions
public class MiniHashMapDemo {
    static class Node {
        final String key;
        int value;
        Node next;

        Node(String key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    static class MiniHashMap {
        Node[] table = new Node[4];                  // the bucket array

        int indexFor(String key) {
            int h = key.hashCode();
            h = h ^ (h >>> 16);                      // spread
            return (table.length - 1) & h;           // bucket number
        }

        void put(String key, int value) {
            int i = indexFor(key);
            for (Node n = table[i]; n != null; n = n.next) {
                if (n.key.equals(key)) {             // same key: update
                    n.value = value;
                    return;
                }
            }
            Node fresh = new Node(key, value);       // new key: add at the front of the chain
            fresh.next = table[i];
            table[i] = fresh;
        }

        Integer get(String key) {
            for (Node n = table[indexFor(key)]; n != null; n = n.next) {
                if (n.key.equals(key)) {
                    return n.value;
                }
            }
            return null;                             // absent
        }

        void print() {
            for (int i = 0; i < table.length; i++) {
                StringBuilder row = new StringBuilder("bucket " + i + ": ");
                for (Node n = table[i]; n != null; n = n.next) {
                    row.append(n.key).append("=").append(n.value).append(" ");
                }
                System.out.println(row);
            }
        }
    }

    public static void main(String[] args) {
        MiniHashMap map = new MiniHashMap();
        for (String fort : new String[] {"Raigad", "Torna", "Lohagad", "Panhala", "Purandar", "Sinhagad"}) {
            map.put(fort, fort.length());
        }
        map.put("Torna", 99);                        // update, not a new node
        map.print();
        System.out.println("get(Torna)  = " + map.get("Torna"));
        System.out.println("get(Missing)= " + map.get("Missing"));
    }
}
''' + OUT),
    method(
        'Collisions and the role of equals() and hashCode()', 'int hashCode();  boolean equals(Object o)', 'int / boolean', 'O(1) per call',
        'Two keys with the <strong>same hash</strong> end up in the same chain; <code>equals</code> then tells them apart. The <strong>contract</strong>: equal objects must have equal hash codes. If you override <code>equals</code> but not <code>hashCode</code>, equal keys land in different buckets and <code>get</code> fails.',
        'Mutable keys are dangerous: if a field used in <code>hashCode</code> changes after <code>put</code>, the entry sits in the wrong bucket and can never be found again.',
        r'''// Two keys that really collide: "Aa" and "BB" have the same hashCode
import java.util.HashMap;
import java.util.Map;

public class CollisionDemo {
    public static void main(String[] args) {
        System.out.println("\"Aa\".hashCode() = " + "Aa".hashCode());
        System.out.println("\"BB\".hashCode() = " + "BB".hashCode());

        Map<String, String> map = new HashMap<>();
        map.put("Aa", "Pune");
        map.put("BB", "Nagpur");                     // same bucket, different keys
        System.out.println("get(Aa) = " + map.get("Aa"));
        System.out.println("get(BB) = " + map.get("BB"));
        System.out.println("size    = " + map.size() + "  (equals() kept them apart)");
    }
}
''' + OUT),
    method(
        'Broken hashCode: equal objects in different buckets', 'class Fort { equals(...) without hashCode(...) }', 'a map that cannot find its keys', 'O(1) wrong answer',
        'This is the most common HashMap bug. Without <code>hashCode</code>, the default (identity-based) hash is used, so two equal forts get different bucket numbers.',
        'Always override both together, and use the same fields in both. In modern Java a <code>record</code> does it correctly for you.',
        r'''// equals() without hashCode(): the lookup misses; with both it works
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class BrokenHashCodeDemo {
    static class BadFort {
        final String name;

        BadFort(String name) {
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof BadFort f && f.name.equals(name);
        }
        // hashCode() NOT overridden
    }

    static class GoodFort {
        final String name;

        GoodFort(String name) {
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof GoodFort f && f.name.equals(name);
        }

        @Override
        public int hashCode() {
            return Objects.hash(name);
        }
    }

    public static void main(String[] args) {
        Map<BadFort, Integer> bad = new HashMap<>();
        bad.put(new BadFort("Raigad"), 6);
        System.out.println("Bad  get(equal key): " + bad.get(new BadFort("Raigad")));

        Map<GoodFort, Integer> good = new HashMap<>();
        good.put(new GoodFort("Raigad"), 6);
        System.out.println("Good get(equal key): " + good.get(new GoodFort("Raigad")));
    }
}
''' + OUT),

    section('Resizing', 'When the table gets too full, it doubles and every entry is re-bucketed.'),
    method(
        'Load factor, threshold and resize()', 'threshold = capacity x loadFactor;  if (++size > threshold) resize()', 'a table twice as big', 'O(n) once, O(1) amortised',
        'With capacity 16 and load factor 0.75 the threshold is <strong>12</strong>. The 13th entry triggers <code>resize()</code>: a new table of 32 buckets, with the threshold now 24.',
        'Resizing is the most expensive step of a HashMap. If you know the final size, create the map with enough capacity: <code>new HashMap&lt;&gt;((int) (expected / 0.75f) + 1)</code> (or <code>HashMap.newHashMap(expected)</code> in Java 19+).',
        r'''// Watching capacity and threshold double as entries are added
public class ResizeDemo {
    public static void main(String[] args) {
        int capacity = 16;
        float loadFactor = 0.75f;
        int threshold = (int) (capacity * loadFactor);

        System.out.println("start: capacity=" + capacity + " threshold=" + threshold);
        for (int size = 1; size <= 50; size++) {
            if (size > threshold) {                  // the put that crosses the threshold resizes
                capacity = capacity * 2;
                threshold = (int) (capacity * loadFactor);
                System.out.println("entry #" + size + " -> resize: capacity=" + capacity + " threshold=" + threshold);
            }
        }
    }
}
''' + OUT),
    method(
        'The resize split: stay or move by oldCapacity', 'newIndex = oldIndex  OR  oldIndex + oldCapacity', 'each entry\'s new bucket', 'O(n)',
        'When the capacity doubles from 16 to 32, only <strong>one more bit</strong> of the hash is used. That bit is 0 (the entry stays) or 1 (it moves exactly <code>oldCapacity</code> places up). Java 8 uses this to split each chain without recomputing.',
        'The order inside each bucket is preserved by the split, which is also why concurrent resizing no longer makes a cyclic list as in Java 7.',
        r'''// After doubling 16 -> 32, an entry stays or moves by exactly 16
public class ResizeSplitDemo {
    static int spread(String key) {
        int h = key.hashCode();
        return h ^ (h >>> 16);
    }

    public static void main(String[] args) {
        for (String fort : new String[] {"Raigad", "Torna", "Lohagad", "Panhala", "Purandar", "Sinhagad"}) {
            int hash = spread(fort);
            int oldIndex = 15 & hash;                                // capacity 16
            int newIndex = 31 & hash;                                // capacity 32
            String what = (newIndex == oldIndex) ? "stays" : "moves by " + (newIndex - oldIndex);
            System.out.println(fort + ": " + oldIndex + " -> " + newIndex + "  (" + what + ")");
        }
    }
}
''' + OUT),

    section('Java 8: chains become trees', 'Long chains are the only real threat to HashMap speed.'),
    method(
        'Treeification', 'TREEIFY_THRESHOLD = 8;  MIN_TREEIFY_CAPACITY = 64;  UNTREEIFY_THRESHOLD = 6', 'a red-black tree bucket', 'O(log n) worst case',
        'If a bucket reaches <strong>8 nodes</strong> and the table has at least <strong>64 buckets</strong>, the chain becomes a red-black tree, so lookups in that bucket cost O(log n) instead of O(n). With a smaller table, the map resizes instead. When a tree shrinks to <strong>6 or fewer</strong>, it turns back into a list.',
        'Tree nodes are ordered by hash, then by <code>compareTo</code> if the key is <code>Comparable</code>, then by a tie-break. So <strong>Comparable keys</strong> are friendlier under heavy collisions. It also defends against hash-flooding attacks.',
        r'''// Many colliding keys still work: this key class always returns the same hash
import java.util.HashMap;
import java.util.Map;

public class TreeifyDemo {
    static class SameHashKey implements Comparable<SameHashKey> {
        final int id;

        SameHashKey(int id) {
            this.id = id;
        }

        @Override
        public int hashCode() {
            return 42;                               // every key collides
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof SameHashKey k && k.id == id;
        }

        @Override
        public int compareTo(SameHashKey other) {
            return Integer.compare(id, other.id);    // lets the tree order the keys
        }
    }

    public static void main(String[] args) {
        Map<SameHashKey, Integer> map = new HashMap<>();
        for (int i = 0; i < 1000; i++) {
            map.put(new SameHashKey(i), i);          // one bucket, turned into a tree
        }
        System.out.println("size      : " + map.size());
        System.out.println("get(777)  : " + map.get(new SameHashKey(777)));
        System.out.println("get(5000) : " + map.get(new SameHashKey(5000)));
    }
}
''' + OUT),

    section('Null key and iteration', 'Two details that follow from the design.'),
    method(
        'The null key and iteration order', 'hash(null) = 0;  iteration walks table[0..n-1]', 'bucket 0 / array order', 'O(n + capacity) to iterate',
        'A <code>null</code> key has hash 0, so it always lives in <strong>bucket 0</strong>. Iteration visits buckets from 0 to n-1 and each chain in order, so the order depends on hashes and capacity, <strong>not on insertion order</strong>.',
        'Iterating costs O(size + capacity), so a huge capacity with few entries makes loops slow. The order can change after a resize.',
        r'''// Null key lives in bucket 0; iteration order follows the buckets, not insertion
import java.util.HashMap;
import java.util.Map;

public class NullAndOrderDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        map.put("Torna", 5);
        map.put(null, 0);                            // allowed: hash = 0
        map.put("Raigad", 6);
        map.put("Lohagad", 2);

        System.out.println("Inserted : Torna, null, Raigad, Lohagad");
        System.out.println("Iterated : " + map.keySet());
        System.out.println("get(null): " + map.get(null));
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'The exact source, in plain words',
        'What <code>java.util.HashMap</code> does for <code>put(key, value)</code> (<code>putVal</code>):',
        [
            '<strong>hash(key)</strong> = <code>key == null ? 0 : (h = key.hashCode()) ^ (h &gt;&gt;&gt; 16)</code>.',
            'If <code>table</code> is null or empty, <code>resize()</code> creates it (lazy allocation: no array until the first put).',
            'Bucket = <code>table[(n - 1) &amp; hash]</code>. If empty, place a new <code>Node</code> there.',
            'Otherwise: if the first node matches (<code>hash ==</code> and <code>key ==</code> or <code>equals</code>) remember it; else if it is a <code>TreeNode</code> use <code>putTreeVal</code>; else walk the chain and, at the end, append a node and call <code>treeifyBin</code> when the chain length reaches 8.',
            'If an existing node matched: replace its value (and return the old one); do not change <code>modCount</code>.',
            'Else: <code>++modCount</code>, and if <code>++size &gt; threshold</code> then <code>resize()</code>.',
            '<strong>New nodes are appended at the tail</strong> of the chain in Java 8+ (Java 7 inserted at the head).',
        ],
    ),
    (
        '<h3>Why the hash is spread with h ^ (h >>> 16)</h3>\n'
        + ul([
            'The bucket number only uses the <strong>low bits</strong> of the hash (4 bits for 16 buckets). Many hash codes differ only in their high bits.',
            'XOR-ing the top 16 bits into the bottom 16 lets high bits influence the index, spreading keys more evenly at almost no cost.',
        ]),
        [r'''// Without spreading, keys that differ only in high bits collide
public class SpreadDemo {
    public static void main(String[] args) {
        int[] hashes = {0x10000, 0x20000, 0x30000, 0x40000};         // differ only above bit 16
        for (int h : hashes) {
            int plain = 15 & h;
            int spread = 15 & (h ^ (h >>> 16));
            System.out.println("hash=" + Integer.toHexString(h) + "  plain bucket=" + plain + "  spread bucket=" + spread);
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>Fail-fast iterators: modCount</h3>\n<p>Every structural change (add a new key, remove) increments <code>modCount</code>. An iterator remembers the value it started with and throws <code>ConcurrentModificationException</code> if it differs. Updating the value of an existing key is <strong>not</strong> structural.</p>',
        [r'''// modCount in action: changing the map during a loop
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class FailFastDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>(Map.of("Raigad", 6, "Torna", 5, "Lohagad", 2));

        for (String fort : map.keySet()) {
            map.put(fort, map.get(fort) + 1);                        // update existing key: allowed
        }
        System.out.println("After updates: " + new java.util.TreeMap<>(map));

        try {
            for (String fort : map.keySet()) {
                map.put(fort + "-new", 1);                           // new key: structural change (the first put succeeds, the next loop step throws)
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("Adding keys while looping -> ConcurrentModificationException");
        }

        Iterator<Map.Entry<String, Integer>> it = map.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue() > 6) {
                it.remove();                                         // safe removal through the iterator
            }
        }
        System.out.println("After iterator.remove: " + new java.util.TreeMap<>(map));
    }
}
''' + OUT],
    ),
    (
        '<h3>Sizing a HashMap to avoid resizes</h3>',
        [r'''// Capacity needed for N entries without a resize: N / 0.75, rounded up to a power of two
public class SizingDemo {
    static int tableSizeFor(int cap) {                               // same idea as HashMap.tableSizeFor
        int n = 1;
        while (n < cap) {
            n <<= 1;
        }
        return n;
    }

    public static void main(String[] args) {
        for (int expected : new int[] {5, 12, 13, 100, 1000}) {
            int needed = (int) Math.ceil(expected / 0.75);
            System.out.println(expected + " entries -> ask for " + needed + " -> table of " + tableSizeFor(needed) + " buckets");
        }
        System.out.println("new HashMap<>(10) really creates a table of " + tableSizeFor(10));
    }
}
''' + OUT],
    ),
    (
        '<h3>HashMap versus ConcurrentHashMap internals</h3>\n'
        + table(['', 'HashMap', 'ConcurrentHashMap'], [
            ['Table', 'Node[] table', 'Node[] table (volatile reads)'],
            ['Writing a bucket', 'Plain write', '<strong>CAS</strong> into an empty bucket, otherwise <code>synchronized</code> on the bucket\'s first node'],
            ['Reading', 'Plain read', 'Lock-free'],
            ['Size', 'int size', 'Striped counters (CounterCell)'],
            ['Resize', 'One thread', 'Several threads help migrate buckets'],
            ['null key / value', 'Allowed', 'Not allowed'],
            ['Iterators', 'Fail-fast', 'Weakly consistent (never throw CME)'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'What the internals tell you to do.',
        [
            'Override <code>equals</code> and <code>hashCode</code> together, using the same immutable fields (or use a <code>record</code>).',
            'Use immutable keys: <code>String</code>, <code>Integer</code>, enums, records.',
            'Presize the map when the final size is known.',
            'Make keys <code>Comparable</code> if many may collide: the tree bin can use it.',
            'Never share a plain HashMap between threads that write; use <code>ConcurrentHashMap</code>.',
            'Do not rely on iteration order.',
        ],
    ),
]

QA = [
    ('How does HashMap work internally?',
     'An array of buckets. put hashes the key, picks the bucket with (n-1) & hash, searches the chain using hash and equals, then updates or appends a node; the table doubles when size exceeds capacity x 0.75.'),
    ('What is a collision and how is it handled?',
     'Two different keys mapping to the same bucket. They are stored in a linked list in that bucket (a red-black tree when it reaches 8 nodes and the table has 64+ buckets); equals() distinguishes them.'),
    ('Why must you override hashCode when you override equals?',
     'Equal keys must go to the same bucket; with the default identity hashCode they do not, so get() misses.'),
    ('What are the default capacity and load factor?',
     '16 and 0.75. The table is allocated lazily on the first put and the threshold is 12.'),
    ('Why is the capacity always a power of two?',
     'Index = (n - 1) & hash is a fast modulo, and resizing splits each bucket into "stay" and "move by oldCapacity".'),
    ('What changed in HashMap in Java 8?',
     'Treeification of long chains (O(log n) worst case), tail insertion instead of head insertion, an order-preserving resize split, and no more cyclic-list bug.'),
    ('Why h ^ (h >>> 16)?',
     'It mixes the high 16 bits into the low bits that the index uses, reducing collisions for hashes that differ mostly in high bits.'),
    ('Where is the null key stored?',
     'Bucket 0, because hash(null) is 0.'),
    ('What happens if a key is mutated after being put?',
     'Its hash changes, so it is looked up in a different bucket and becomes unreachable: effectively lost.'),
    ('Is HashMap thread-safe? What happens with concurrent writes?',
     'No. Concurrent writes can lose entries or corrupt the table (Java 7 could loop forever when resizing). Use ConcurrentHashMap.'),
    ('What is the time complexity of get / put?',
     'O(1) average, O(log n) worst case with treeification (O(n) before Java 8 or for non-comparable colliding keys in a tree bin).'),
    ('What is modCount?',
     'A counter of structural changes; iterators compare it to the value they saw at creation and throw ConcurrentModificationException if it changed.'),
]

TOPIC = dict(id='internal-hashmap', name='Internal Working of HashMap', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
