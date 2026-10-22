"""LinkedHashMap lesson: a HashMap that remembers order (insertion or access). Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a LinkedHashMap?',
        'A <strong>LinkedHashMap</strong> is a <code>HashMap</code> that <strong>remembers the order of its entries</strong>. Everything you know about HashMap still applies (unique keys, O(1) lookups, one null key), '
        'but when you print or loop over it, the pairs come out in a <strong>predictable order</strong>: the order in which the keys were first added.',
        [
            'Package <code>java.util</code>. It <strong>extends HashMap</strong> and (Java 21) implements <code>SequencedMap</code>.',
            '<strong>Insertion order (default):</strong> iteration follows the order of first insertion. Putting an existing key again does <strong>not</strong> move it.',
            '<strong>Access order (optional):</strong> with the constructor flag <code>accessOrder = true</code> the most recently <strong>read or written</strong> entry moves to the end. This is the basis of an <strong>LRU cache</strong>.',
            '<strong>Fast:</strong> get, put and remove are O(1) on average, with a small extra cost to keep the links.',
            'One null key and null values are allowed. <strong>Not thread-safe.</strong>',
            'Use it for: reports and JSON output in a stable order, "last seen" lists, LRU caches.',
        ],
    ),
    (
        '<h3>Where LinkedHashMap sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Map', 'I', True, None, G), ('SequencedMap', 'I', True, 'extends', G), ('HashMap', 'c', False, 'implemented by', B), ('LinkedHashMap', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class. In Java 21 <code>SequencedMap</code> was added between <code>Map</code> and <code>LinkedHashMap</code>/<code>TreeMap</code>.</p>',
        [],
    ),
    (
        '<h3>Creating a LinkedHashMap</h3>\n'
        + ul([
            '<code>new LinkedHashMap&lt;&gt;()</code>: empty, insertion order.',
            '<code>new LinkedHashMap&lt;&gt;(int initialCapacity)</code> and <code>(int, float loadFactor)</code>: tune the table.',
            '<code>new LinkedHashMap&lt;&gt;(int, float, boolean accessOrder)</code>: <code>true</code> means <strong>access order</strong>.',
            '<code>new LinkedHashMap&lt;&gt;(Map m)</code>: a copy in the iteration order of m.',
        ]),
        [r'''// LinkedHashMap keeps insertion order; HashMap does not
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapCreateDemo {
    public static void main(String[] args) {
        Map<String, Integer> linked = new LinkedHashMap<>();
        Map<String, Integer> plain = new HashMap<>();

        String[] forts = {"Torna", "Raigad", "Sinhagad", "Purandar", "Lohagad"};
        int hours = 1;
        for (String fort : forts) {
            linked.put(fort, hours);
            plain.put(fort, hours);
            hours++;
        }
        System.out.println("LinkedHashMap: " + linked);     // the order of adding
        System.out.println("HashMap      : " + plain);      // hash order
    }
}
''' + OUT],
    ),
    (
        '<h3>All LinkedHashMap methods at a glance</h3>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>put, putAll, putIfAbsent, get, getOrDefault, containsKey, containsValue, remove, replace, replaceAll</strong>', 'Exactly as in HashMap', 'O(1) (containsValue O(n))'],
            ['<strong>compute, computeIfAbsent, computeIfPresent, merge</strong>', 'Exactly as in HashMap', 'O(1)'],
            ['<strong>keySet(), values(), entrySet(), forEach()</strong>', 'Views and loops, in <strong>insertion (or access) order</strong>', 'O(n)'],
            ['<strong>removeEldestEntry(e)</strong>', 'Hook called after each insertion; return <code>true</code> to remove the eldest entry', 'O(1)'],
            ['<strong>firstEntry()</strong> / <strong>lastEntry()</strong>', 'The first / last entry (Java 21)', 'O(1)'],
            ['<strong>pollFirstEntry()</strong> / <strong>pollLastEntry()</strong>', 'Remove and return the first / last entry (Java 21)', 'O(1)'],
            ['<strong>putFirst(k, v)</strong> / <strong>putLast(k, v)</strong>', 'Put at the front / back, moving an existing key (Java 21)', 'O(1)'],
            ['<strong>sequencedKeySet()</strong> / <strong>sequencedValues()</strong> / <strong>sequencedEntrySet()</strong> / <strong>reversed()</strong>', 'Ordered views, reversed view (Java 21)', 'O(1)'],
            ['<strong>clone, equals, hashCode, toString</strong>', 'Copy and compare (equals ignores order)', 'O(n)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Insertion order in action', 'All the HashMap methods work; the new thing is the <strong>order</strong> of every view and loop.'),
    method(
        'put, get, remove and the order of pairs', 'V put(K, V);  V get(Object);  V remove(Object)', 'as HashMap', 'O(1)',
        'New keys are added at the <strong>end</strong> of the order. Putting a key that already exists replaces its value but <strong>keeps its position</strong>. Removing a key just closes the gap.',
        'Each entry is a <code>LinkedHashMap.Entry</code> with <code>before</code> and <code>after</code> links in addition to the bucket link, so adding, removing and reordering are all O(1) pointer changes.',
        r'''// LinkedHashMap put(K, V): adds a pair, order is kept
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapPutDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);
        heights.put("Sinhagad", 1300);

        System.out.println(heights);
    }
}
''' + OUT, extra_codes=(r'''// LinkedHashMap get(Object key): reads a value by key
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapGetDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.get("Torna"));   // 1400
    }
}
''' + OUT, r'''// LinkedHashMap remove(Object key): removes a pair, the rest keep their order
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapRemoveDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);
        heights.put("Sinhagad", 1300);

        heights.remove("Torna");

        System.out.println(heights);
    }
}
''' + OUT,)),
    method(
        'keySet(), values(), entrySet() and forEach()', 'Set<K> keySet();  Collection<V> values();  Set<Map.Entry<K, V>> entrySet();  void forEach(BiConsumer)', 'views in insertion order', 'O(n)',
        'Every view and every loop visits the pairs in insertion order, so printed results are the <strong>same on every run</strong>: ideal for reports, logs and tests.',
        'Iteration costs O(size), not O(capacity + size), because it follows the entry chain and skips empty buckets.',
        r'''// LinkedHashMap keySet(): keys in insertion order
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapKeySetDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.keySet());
    }
}
''' + OUT, extra_codes=(r'''// LinkedHashMap values(): values in insertion order
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapValuesDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.values());
    }
}
''' + OUT, r'''// LinkedHashMap entrySet(): pairs in insertion order
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapEntrySetDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        for (Map.Entry<String, Integer> e : heights.entrySet()) {
            System.out.println(e.getKey() + " = " + e.getValue());
        }
    }
}
''' + OUT,)),
    method(
        'computeIfAbsent, merge and the other compute methods', 'compute / computeIfAbsent / computeIfPresent / merge', 'as HashMap', 'O(1)',
        'They behave exactly as in HashMap. A new key created by one of them is added at the end of the order.',
        'When you build a grouped or counted result that you later print, LinkedHashMap gives you the groups in the order they were first seen.',
        r'''// LinkedHashMap with merge(): counts appear in first-seen order
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapMergeDemo {
    public static void main(String[] args) {
        Map<String, Integer> count = new LinkedHashMap<>();

        count.merge("Pune", 1, Integer::sum);
        count.merge("Agra", 1, Integer::sum);
        count.merge("Pune", 1, Integer::sum);   // Pune becomes 2

        System.out.println(count);              // Pune stays first
    }
}
''' + OUT),

    section('Access order and the LRU cache', 'The special power of LinkedHashMap.'),
    method(
        'Access order: new LinkedHashMap(capacity, loadFactor, true)', 'LinkedHashMap(int initialCapacity, float loadFactor, boolean accessOrder)', 'a map ordered by last access', 'O(1)',
        'With <code>accessOrder = true</code>, every <code>get</code> or <code>put</code> of a key <strong>moves that entry to the end</strong>. So the <strong>first</strong> entry is always the <strong>least recently used</strong> one and the last entry is the most recently used.',
        'In access-order mode even <code>get</code> is a <strong>structural modification</strong> (it re-links the entry), so iterating while calling <code>get</code> throws <code>ConcurrentModificationException</code>. <code>containsKey</code>, <code>containsValue</code> and the views do <strong>not</strong> count as access.',
        r'''// LinkedHashMap in access order: reading a key moves it to the end
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapAccessOrderDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new LinkedHashMap<>(16, 0.75f, true);   // true = access order
        map.put("Raigad", 1);
        map.put("Torna", 2);
        map.put("Sinhagad", 3);

        map.get("Raigad");            // reading Raigad moves it to the end

        System.out.println(map);      // {Torna=2, Sinhagad=3, Raigad=1}
    }
}
''' + OUT),
    method(
        'removeEldestEntry(Map.Entry eldest)', 'protected boolean removeEldestEntry(Map.Entry<K, V> eldest)', '<code>true</code> to remove the eldest entry after an insertion', 'O(1)',
        'LinkedHashMap calls this method <strong>after every put</strong>. By default it returns <code>false</code>. Override it to return <code>true</code> when the map is too big and the <strong>oldest entry</strong> is removed automatically. Together with access order this builds an <strong>LRU (least recently used) cache</strong> in a few lines.',
        'The method may also modify the map itself, but the usual pattern is just <code>return size() &gt; MAX</code>. Wrap the class with <code>Collections.synchronizedMap</code> for thread safety (or use Caffeine for a production cache).',
        r'''// LRU cache: LinkedHashMap with access order + removeEldestEntry
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapLruDemo {
    static class LruCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;

        LruCache(int capacity) {
            super(16, 0.75f, true);                 // access order
            this.capacity = capacity;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;               // too many: drop the least recently used
        }
    }

    public static void main(String[] args) {
        LruCache<String, Integer> cache = new LruCache<>(3);
        cache.put("Raigad", 1);
        cache.put("Torna", 2);
        cache.put("Purandar", 3);
        System.out.println("Full cache      : " + cache);

        cache.get("Raigad");                        // Raigad becomes the most recently used
        cache.put("Lohagad", 4);                    // over capacity: Torna (the least recently used) is evicted
        System.out.println("After adding L. : " + cache);

        cache.put("Panhala", 5);                    // evicts Purandar
        System.out.println("After adding P. : " + cache);
    }
}
''' + OUT),

    section('Java 21: first and last entries', 'The new <code>SequencedMap</code> methods.'),
    method(
        'firstEntry, lastEntry, pollFirstEntry and pollLastEntry', 'Map.Entry<K, V> firstEntry();  lastEntry();  pollFirstEntry();  pollLastEntry()', 'the entry, or <code>null</code> if the map is empty', 'O(1)',
        'Read or remove the <strong>first</strong> or <strong>last</strong> pair directly. The <code>poll</code> versions remove and return it. The returned entries are <strong>snapshots</strong> (immutable).',
        'Before Java 21 you had to iterate to the end to find the last entry. With <code>pollFirstEntry</code> in a loop a LinkedHashMap can act as an ordered work queue with key lookups.',
        r'''// LinkedHashMap firstEntry() (Java 21): the first pair
import java.util.LinkedHashMap;

public class LinkedHashMapFirstEntryDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.firstEntry());   // Raigad=820
    }
}
''' + OUT, extra_codes=(r'''// LinkedHashMap lastEntry() (Java 21): the last pair
import java.util.LinkedHashMap;

public class LinkedHashMapLastEntryDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.lastEntry());   // Torna=1400
    }
}
''' + OUT, r'''// LinkedHashMap pollFirstEntry() (Java 21): removes and returns the first pair
import java.util.LinkedHashMap;

public class LinkedHashMapPollFirstEntryDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.pollFirstEntry());   // Raigad=820
        System.out.println(heights);
    }
}
''' + OUT, r'''// LinkedHashMap pollLastEntry() (Java 21): removes and returns the last pair
import java.util.LinkedHashMap;

public class LinkedHashMapPollLastEntryDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.pollLastEntry());   // Torna=1400
        System.out.println(heights);
    }
}
''' + OUT,)),
    method(
        'putFirst, putLast and reversed', 'V putFirst(K, V);  V putLast(K, V);  SequencedMap<K, V> reversed()', 'the previous value / a reversed view', 'O(1)',
        '<code>putFirst</code> and <code>putLast</code> add a pair at the <strong>front</strong> or the <strong>back</strong>; if the key already exists it is <strong>moved</strong> there. <code>reversed()</code> is a live view that walks from the last entry to the first.',
        'This finally allows reordering a LinkedHashMap without removing and re-adding. <code>sequencedKeySet()</code>, <code>sequencedValues()</code> and <code>sequencedEntrySet()</code> give the same ordered views with <code>getFirst</code>, <code>getLast</code> and <code>reversed</code>.',
        r'''// LinkedHashMap putFirst(K, V) (Java 21): puts a pair at the front
import java.util.LinkedHashMap;

public class LinkedHashMapPutFirstDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Torna", 1400);

        heights.putFirst("Raigad", 820);

        System.out.println(heights);
    }
}
''' + OUT, extra_codes=(r'''// LinkedHashMap putLast(K, V) (Java 21): puts a pair at the end
import java.util.LinkedHashMap;

public class LinkedHashMapPutLastDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);

        heights.putLast("Torna", 1400);

        System.out.println(heights);
    }
}
''' + OUT, r'''// LinkedHashMap reversed() (Java 21): the map in reverse order
import java.util.LinkedHashMap;

public class LinkedHashMapReversedDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.reversed());
    }
}
''' + OUT,)),
    method(
        'clone, equals and toString', 'Object clone();  boolean equals(Object);  String toString()', 'a shallow copy / comparison / text', 'O(n)',
        'A LinkedHashMap is <strong>equal</strong> to any other <code>Map</code> with the same pairs; the order is <strong>ignored</strong> by <code>equals</code>. <code>toString</code> prints the pairs in order.',
        'Copy with <code>new LinkedHashMap&lt;&gt;(map)</code> to keep the order of the source map.',
        r'''// LinkedHashMap equals(): same pairs means equal, order is ignored
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapEqualsDemo {
    public static void main(String[] args) {
        Map<String, Integer> a = new LinkedHashMap<>();
        a.put("Raigad", 1);
        a.put("Torna", 2);

        Map<String, Integer> b = new LinkedHashMap<>();
        b.put("Torna", 2);
        b.put("Raigad", 1);

        System.out.println(a.equals(b));   // true
    }
}
''' + OUT, extra_codes=(r'''// LinkedHashMap copy constructor: keeps the order
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapCopyDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new LinkedHashMap<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        Map<String, Integer> copy = new LinkedHashMap<>(heights);

        System.out.println(copy);
    }
}
''' + OUT,)),
    (
        '<h3>Master program: every LinkedHashMap method in one place</h3>\n'
        '<p>One single program that uses all the LinkedHashMap methods you learned above, step by step. Read the numbered comments from top to bottom, run it, and match each output line with its step.</p>',
        [r'''// MASTER PROGRAM: all important LinkedHashMap methods in one program
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapMasterDemo {
    public static void main(String[] args) {
        // 1. Create an empty map (it remembers insertion order)
        LinkedHashMap<String, Integer> heights = new LinkedHashMap<>();

        // 2. put, putIfAbsent, putAll
        heights.put("Torna", 1400);
        heights.put("Raigad", 820);
        heights.putIfAbsent("Sinhagad", 1300);
        heights.putAll(Map.of("Purandar", 1200));
        System.out.println("2. size           : " + heights.size());

        // 3. Java 21: putFirst and putLast
        heights.putFirst("Rajgad", 1300);
        heights.putLast("Lohagad", 1033);
        System.out.println("3. After puts     : " + heights);

        // 4. get, getOrDefault, containsKey, containsValue
        System.out.println("4. get            : " + heights.get("Raigad"));
        System.out.println("   getOrDefault   : " + heights.getOrDefault("Panhala", 0));
        System.out.println("   containsKey    : " + heights.containsKey("Torna"));
        System.out.println("   containsValue  : " + heights.containsValue(820));

        // 5. Change values: replace, merge, compute
        heights.replace("Raigad", 900);
        heights.merge("Raigad", 10, Integer::sum);
        heights.compute("Torna", (k, v) -> v + 3);
        System.out.println("5. Raigad / Torna : " + heights.get("Raigad") + " / " + heights.get("Torna"));

        // 6. Views and loops: always in insertion order
        System.out.println("6. keys           : " + heights.keySet());
        System.out.println("   values         : " + heights.values());
        heights.forEach((fort, h) -> System.out.print(fort + " "));
        System.out.println();

        // 7. Java 21: firstEntry, lastEntry, reversed
        System.out.println("7. first / last   : " + heights.firstEntry() + " / " + heights.lastEntry());
        System.out.println("   reversed       : " + heights.reversed());

        // 8. Remove: remove, pollFirstEntry, pollLastEntry
        heights.remove("Purandar");
        heights.pollFirstEntry();
        heights.pollLastEntry();
        System.out.println("8. After removes  : " + heights);

        // 9. Access order: reading a key moves it to the end
        LinkedHashMap<String, Integer> recent = new LinkedHashMap<>(16, 0.75f, true);
        recent.put("A", 1);
        recent.put("B", 2);
        recent.get("A");
        System.out.println("9. access order   : " + recent);

        // 10. equals ignores order; clear
        LinkedHashMap<String, Integer> x = new LinkedHashMap<>(Map.of("A", 1));
        System.out.println("10. equals        : " + x.equals(Map.of("A", 1)));
        heights.clear();
        System.out.println("    After clear   : " + heights);
    }
}
''' + OUT],
    ),
]

EXPERT = [
    section(
        'How LinkedHashMap works inside',
        'It adds one doubly linked list on top of HashMap\'s buckets.',
        [
            'Entries are <code>LinkedHashMap.Entry&lt;K,V&gt;</code>: a HashMap node plus <code>before</code> and <code>after</code> references. The map keeps <code>head</code> (eldest) and <code>tail</code> (youngest).',
            'HashMap exposes three hooks that LinkedHashMap overrides: <code>afterNodeInsertion</code> (calls <code>removeEldestEntry</code>), <code>afterNodeAccess</code> (moves the entry to the tail in access-order mode) and <code>afterNodeRemoval</code> (unlinks the entry).',
            'Lookups still use the hash table, so <code>get</code>, <code>put</code> and <code>remove</code> stay O(1).',
            'Iteration follows <code>after</code> links: O(size), independent of capacity.',
            'Memory: two extra references (8 bytes with compressed pointers) per entry compared with HashMap.',
            'In access-order mode <code>get</code> relinks the entry, so it changes <code>modCount</code> and is <strong>not safe</strong> for concurrent readers.',
        ],
    ),
    (
        '<h3>HashMap, LinkedHashMap and TreeMap side by side</h3>\n'
        + table(['', 'HashMap', 'LinkedHashMap', 'TreeMap'], [
            ['Order', 'None', '<strong>Insertion or access order</strong>', 'Sorted by key'],
            ['get / put / remove', 'O(1)', 'O(1)', 'O(log n)'],
            ['Iteration', 'O(capacity + n)', 'O(n)', 'O(n)'],
            ['Memory', 'Lowest', 'Slightly more', 'Most'],
            ['null key', 'One', 'One', 'No'],
            ['LRU cache', 'No', '<strong>Yes</strong>', 'No'],
        ]),
        [],
    ),
    (
        '<h3>Trap: get() changes the order in access-order mode</h3>\n'
        + ul([
            'A read relinks the entry, so reading <strong>while iterating</strong> the same map throws <code>ConcurrentModificationException</code>.',
            'Iterate over a copy of the keys (or entries) when you need to read inside the loop.',
        ]),
        [r'''// In access order, get() inside a loop over the same map fails; loop over a copy instead
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapAccessTrapDemo {
    public static void main(String[] args) {
        Map<String, Integer> cache = new LinkedHashMap<>(16, 0.75f, true);
        cache.put("Raigad", 1);
        cache.put("Torna", 2);
        cache.put("Purandar", 3);

        try {
            for (String key : cache.keySet()) {
                cache.get(key);                               // each get() re-links the entry
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("get() inside the loop: ConcurrentModificationException");
        }

        for (String key : new ArrayList<>(cache.keySet())) {  // loop over a copy of the keys
            cache.get(key);
        }
        System.out.println("Looping over a copy works: " + cache);
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example: ordered JSON-style report</h3>\n<p>Fields must appear in the order they were defined, so a <code>LinkedHashMap</code> is the natural container for a record that will be written out.</p>',
        [r'''// A report whose fields keep the order in which they were added
import java.util.LinkedHashMap;
import java.util.Map;

public class LinkedHashMapReportDemo {
    public static void main(String[] args) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("fort", "Sinhagad");
        report.put("city", "Pune");
        report.put("trekHours", 2);
        report.put("openAllYear", true);

        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> field : report.entrySet()) {
            if (!first) {
                json.append(", ");
            }
            first = false;
            Object value = field.getValue();
            json.append('"').append(field.getKey()).append("\": ");
            json.append(value instanceof String ? "\"" + value + "\"" : value);
        }
        json.append("}");
        System.out.println(json);
    }
}
''' + OUT],
    ),
    section(
        'Best practices',
        'When LinkedHashMap is the right tool.',
        [
            'Use it when the <strong>order of iteration matters</strong> (output, serialization, tests) and you still want O(1) lookups.',
            'For caches use access order plus <code>removeEldestEntry</code>, but wrap it for threads (<code>Collections.synchronizedMap</code>) or use a library cache.',
            'Do not read the map inside a loop over the same map in access-order mode.',
            'Use plain <code>HashMap</code> when order does not matter: it needs less memory.',
            'Use immutable keys with consistent <code>equals</code>/<code>hashCode</code>, as for any hash map.',
            'In Java 21 prefer <code>firstEntry</code>, <code>lastEntry</code>, <code>putFirst</code>, <code>putLast</code> and <code>reversed()</code> to hand-written iteration.',
        ],
    ),
]

QA = [
    ('What is a LinkedHashMap and how does it differ from HashMap?',
     'It is a HashMap that also keeps a doubly linked list through its entries, so iteration follows insertion order (or access order) instead of hash order. Operations stay O(1) with slightly more memory per entry.'),
    ('How do you create an LRU cache in Java?',
     'Extend LinkedHashMap, call super(capacity, 0.75f, true) for access order, and override removeEldestEntry to return size() > capacity.'),
    ('What is access order?',
     'A mode enabled by the third constructor argument: each get or put moves the entry to the end, so the first entry is the least recently used.'),
    ('What does removeEldestEntry do?',
     'It is called after each insertion with the eldest entry; returning true removes it. The default returns false.'),
    ('Does re-inserting an existing key change its position?',
     'Not in insertion-order mode. In access-order mode it moves to the end. In Java 21, putFirst/putLast move it explicitly.'),
    ('Is LinkedHashMap thread-safe?',
     'No. In access-order mode even get() modifies the structure. Use Collections.synchronizedMap or a concurrent cache.'),
    ('Why is iteration over LinkedHashMap faster than HashMap for sparse tables?',
     'It follows the entry chain (O(size)) instead of scanning all buckets (O(capacity + size)).'),
    ('What did Java 21 add to LinkedHashMap?',
     'SequencedMap methods: firstEntry, lastEntry, pollFirstEntry, pollLastEntry, putFirst, putLast, reversed and sequenced views of keys, values and entries.'),
    ('Does equals() of a LinkedHashMap consider order?',
     'No. Two maps with the same pairs are equal regardless of order.'),
    ('When would you choose TreeMap over LinkedHashMap?',
     'When you need entries sorted by key or navigation methods (floorKey, headMap, ...). LinkedHashMap orders by insertion/access, not by key.'),
]

TOPIC = dict(id='linkedhashmap', name='LinkedHashMap', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
