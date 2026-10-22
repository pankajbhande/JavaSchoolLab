"""TreeMap lesson: a map sorted by key (NavigableMap) backed by a red-black tree. Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a TreeMap?',
        'A <strong>TreeMap</strong> is a map whose <strong>keys are always kept sorted</strong>. Put the pairs in any order and they come out ordered by key: forts A to Z, numbers small to large. '
        'On top of the ordinary map methods it can answer <strong>neighbour and range questions</strong>: "which key comes just after 500?" or "give me all entries between P and S".',
        [
            'Package <code>java.util</code>. Implements <code>NavigableMap</code> (which extends <code>SortedMap</code>, which extends <code>Map</code>).',
            '<strong>Sorted by key</strong>: by the keys\' natural order (<code>Comparable</code>) or by a <code>Comparator</code> you supply.',
            '<strong>Unique keys</strong>: two keys are "the same" when <code>compareTo</code> / <code>compare</code> returns 0 (not when <code>equals</code> says so).',
            '<strong>O(log n)</strong> for get, put, remove and containsKey: slower than HashMap but ordered.',
            '<strong>No null key</strong> with natural ordering; null values are allowed.',
            '<strong>Not thread-safe</strong>. Use <code>ConcurrentSkipListMap</code> for concurrent sorted maps.',
            'Use it for: sorted output, range queries, "nearest" lookups, rate tables and time lines.',
        ],
    ),
    (
        '<h3>Where TreeMap sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Map', 'I', True, None, G), ('SortedMap', 'I', True, 'extends', G), ('NavigableMap', 'I', True, 'extends', G),
            ('AbstractMap', 'c', False, 'implements', B), ('TreeMap', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class. TreeMap also implements <code>Cloneable</code> and <code>Serializable</code>. It is the engine behind <code>TreeSet</code>.</p>',
        [],
    ),
    (
        '<h3>Creating a TreeMap: four constructors</h3>\n'
        + ul([
            '<code>new TreeMap&lt;&gt;()</code>: natural ordering of the keys.',
            '<code>new TreeMap&lt;&gt;(Comparator c)</code>: your own key ordering.',
            '<code>new TreeMap&lt;&gt;(Map m)</code>: copy with natural ordering.',
            '<code>new TreeMap&lt;&gt;(SortedMap m)</code>: copy that keeps the ordering of m.',
        ]),
        [r'''// TreeMap constructors: natural order, reverse order, copy
import java.util.Comparator;
import java.util.Map;
import java.util.TreeMap;

public class TreeMapCreateDemo {
    public static void main(String[] args) {
        Map<String, Integer> source = Map.of("Torna", 5, "Raigad", 6, "Purandar", 3, "Sinhagad", 2);

        Map<String, Integer> natural = new TreeMap<>(source);                    // A to Z by key
        Map<String, Integer> reverse = new TreeMap<>(Comparator.reverseOrder());  // Z to A
        reverse.putAll(source);
        Map<String, Integer> byLength = new TreeMap<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        byLength.putAll(source);

        System.out.println("Natural  : " + natural);
        System.out.println("Reverse  : " + reverse);
        System.out.println("By length: " + byLength);
    }
}
''' + OUT],
    ),
    (
        '<h3>All TreeMap methods at a glance</h3>\n<p><em>n</em> is the number of entries.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>put, get, remove, containsKey, getOrDefault, putIfAbsent, replace, merge, compute...</strong>', 'The ordinary Map methods', 'O(log n)'],
            ['<strong>containsValue(v)</strong>', 'Scans all entries', 'O(n)'],
            ['<strong>firstKey()</strong> / <strong>lastKey()</strong>', 'Smallest / largest key (throws if empty)', 'O(log n)'],
            ['<strong>firstEntry()</strong> / <strong>lastEntry()</strong>', 'Smallest / largest entry (null if empty)', 'O(log n)'],
            ['<strong>pollFirstEntry()</strong> / <strong>pollLastEntry()</strong>', 'Remove and return smallest / largest entry', 'O(log n)'],
            ['<strong>lowerKey / floorKey / ceilingKey / higherKey</strong>', 'Neighbour key below or above a value', 'O(log n)'],
            ['<strong>lowerEntry / floorEntry / ceilingEntry / higherEntry</strong>', 'The same, returning the whole entry', 'O(log n)'],
            ['<strong>headMap(to)</strong> / <strong>tailMap(from)</strong> / <strong>subMap(a, b)</strong>', 'Range views', 'O(log n)'],
            ['<strong>descendingMap()</strong> / <strong>descendingKeySet()</strong> / <strong>navigableKeySet()</strong>', 'Reverse / key set views', 'O(1)'],
            ['<strong>keySet() / values() / entrySet() / forEach()</strong>', 'Views and loops in key order', 'O(n)'],
            ['<strong>comparator()</strong>', 'The ordering in use (null = natural)', 'O(1)'],
            ['<strong>clone / equals / toString</strong>', 'Copy and compare', 'O(n)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Putting and reading: the sorted map', 'All the usual Map methods work, and every view is in key order.'),
    method(
        'put, get, remove and containsKey', 'V put(K, V);  V get(Object);  V remove(Object);  boolean containsKey(Object)', 'as Map', 'O(log n)',
        'Same meaning as in HashMap, but the map <strong>keeps itself sorted</strong>. A new key is inserted at its sorted place; an existing key just has its value replaced.',
        'Each call walks from the root comparing the key, so the cost is the tree height. Passing a key that is not comparable throws <code>ClassCastException</code>; passing <code>null</code> throws <code>NullPointerException</code> (natural ordering).',
        r'''// TreeMap put(K, V): adds a pair, keys stay sorted
import java.util.Map;
import java.util.TreeMap;

public class TreeMapPutDemo {
    public static void main(String[] args) {
        Map<String, Integer> heights = new TreeMap<>();

        heights.put("Torna", 1400);
        heights.put("Raigad", 820);

        System.out.println(heights);   // sorted by key
    }
}
''' + OUT, extra_codes=(r'''// TreeMap get(Object key): reads a value by key
import java.util.TreeMap;

public class TreeMapGetDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.get(20));   // Sinhagad
    }
}
''' + OUT, r'''// TreeMap containsKey(Object key): is the key present?
import java.util.TreeMap;

public class TreeMapContainsKeyDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.containsKey(30));   // true
    }
}
''' + OUT, r'''// TreeMap remove(Object key): removes a pair
import java.util.TreeMap;

public class TreeMapRemoveDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        map.remove(30);

        System.out.println(map);
    }
}
''' + OUT,)),
    method(
        'merge, computeIfAbsent and the other compute methods', 'compute / computeIfAbsent / computeIfPresent / merge / putIfAbsent / getOrDefault', 'as HashMap', 'O(log n)',
        'They behave exactly as in HashMap. Combine them with a TreeMap to get <strong>sorted counts and groups</strong>.',
        'A TreeMap is often the finishing step of a data pipeline: collect into a HashMap for speed, then copy into a TreeMap to print in order.',
        r'''// TreeMap with merge(): sorted counts
import java.util.Map;
import java.util.TreeMap;

public class TreeMapMergeDemo {
    public static void main(String[] args) {
        Map<String, Integer> count = new TreeMap<>();

        count.merge("Pune", 1, Integer::sum);
        count.merge("Agra", 1, Integer::sum);
        count.merge("Pune", 1, Integer::sum);   // Pune becomes 2

        System.out.println(count);              // sorted: Agra first
    }
}
''' + OUT),
    method(
        'keySet(), values(), entrySet() and forEach()', 'Set<K> keySet();  Collection<V> values();  Set<Map.Entry<K, V>> entrySet();  void forEach(BiConsumer)', 'views in ascending key order', 'O(n)',
        'Every view and loop is in <strong>ascending key order</strong>. They are live views: removing from a view removes from the map.',
        '<code>navigableKeySet()</code> returns the keys as a <code>NavigableSet</code> and <code>descendingKeySet()</code> in reverse. Entries from <code>entrySet()</code> support <code>setValue</code>, but entries returned by <code>firstEntry()</code> and friends are immutable snapshots.',
        r'''// TreeMap keySet(): keys in ascending order
import java.util.TreeMap;

public class TreeMapKeySetDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.keySet());
    }
}
''' + OUT, extra_codes=(r'''// TreeMap values(): values in key order
import java.util.TreeMap;

public class TreeMapValuesDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.values());
    }
}
''' + OUT, r'''// TreeMap entrySet(): pairs in key order
import java.util.Map;
import java.util.TreeMap;

public class TreeMapEntrySetDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        for (Map.Entry<Integer, String> e : map.entrySet()) {
            System.out.println(e.getKey() + " = " + e.getValue());
        }
    }
}
''' + OUT,)),

    section('The ends of the map', 'Smallest and largest key, with or without removing them.'),
    method(
        'firstKey, lastKey, firstEntry and lastEntry', 'K firstKey();  K lastKey();  Map.Entry<K, V> firstEntry();  Map.Entry<K, V> lastEntry()', 'the key / the entry', 'O(log n)',
        '<code>firstKey()</code> and <code>lastKey()</code> return the smallest and the largest <strong>key</strong> and throw <code>NoSuchElementException</code> when the map is empty. <code>firstEntry()</code> and <code>lastEntry()</code> return the whole <strong>pair</strong> (or <code>null</code> when empty).',
        'The entry versions are safer for possibly-empty maps and give the value in the same call. The returned entries are snapshots: calling <code>setValue</code> on them throws <code>UnsupportedOperationException</code>.',
        r'''// TreeMap firstKey(): the smallest key
import java.util.TreeMap;

public class TreeMapFirstKeyDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.firstKey());   // 10
    }
}
''' + OUT, extra_codes=(r'''// TreeMap lastKey(): the biggest key
import java.util.TreeMap;

public class TreeMapLastKeyDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.lastKey());   // 40
    }
}
''' + OUT, r'''// TreeMap firstEntry(): the pair with the smallest key
import java.util.TreeMap;

public class TreeMapFirstEntryDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.firstEntry());   // 10=Raigad
    }
}
''' + OUT, r'''// TreeMap lastEntry(): the pair with the biggest key
import java.util.TreeMap;

public class TreeMapLastEntryDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.lastEntry());   // 40=Purandar
    }
}
''' + OUT,)),
    method(
        'pollFirstEntry() and pollLastEntry()', 'Map.Entry<K, V> pollFirstEntry();  Map.Entry<K, V> pollLastEntry()', 'the removed entry, or <code>null</code> if empty', 'O(log n)',
        'Remove and return the entry with the smallest or the largest key. Repeat <code>pollFirstEntry</code> until it returns <code>null</code> to process entries in key order while consuming them (a sorted queue with lookups).',
        'Handy for event schedulers: key = time, value = task; <code>pollFirstEntry</code> always gives the next task due.',
        r'''// TreeMap pollFirstEntry(): removes and returns the smallest pair
import java.util.TreeMap;

public class TreeMapPollFirstEntryDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.pollFirstEntry());   // 10=Raigad
        System.out.println(map);
    }
}
''' + OUT, extra_codes=(r'''// TreeMap pollLastEntry(): removes and returns the biggest pair
import java.util.TreeMap;

public class TreeMapPollLastEntryDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.pollLastEntry());   // 40=Purandar
        System.out.println(map);
    }
}
''' + OUT,)),

    section('Neighbours: lowerKey, floorKey, ceilingKey and higherKey', 'Find the closest key to a value, <strong>even if the value is not a key</strong>. Each has an <code>Entry</code> twin: <code>lowerEntry</code>, <code>floorEntry</code>, <code>ceilingEntry</code>, <code>higherEntry</code>.'),
    method(
        'lowerKey, floorKey, ceilingKey, higherKey (and the Entry versions)', 'K lowerKey(K);  K floorKey(K);  K ceilingKey(K);  K higherKey(K);  Map.Entry lowerEntry(K) ...', 'the neighbouring key / entry, or <code>null</code>', 'O(log n)',
        '<code>lowerKey(k)</code> = greatest key <strong>strictly below</strong> k; <code>floorKey(k)</code> = greatest key <strong>below or equal</strong>; <code>ceilingKey(k)</code> = smallest key <strong>above or equal</strong>; <code>higherKey(k)</code> = smallest key <strong>strictly above</strong>. If there is no such key the result is <code>null</code>.',
        'The Entry versions return the key <em>and</em> its value in one call, which is what you usually want. This is the standard way to implement <strong>price slabs, tax brackets, grade boundaries and time-line lookups</strong>.',
        r'''// TreeMap lowerKey(K key): the key just smaller than key
import java.util.TreeMap;

public class TreeMapLowerKeyDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.lowerKey(20));   // 10
    }
}
''' + OUT, extra_codes=(r'''// TreeMap floorKey(K key): smaller than or equal to key
import java.util.TreeMap;

public class TreeMapFloorKeyDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.floorKey(25));   // 20
    }
}
''' + OUT, r'''// TreeMap ceilingKey(K key): bigger than or equal to key
import java.util.TreeMap;

public class TreeMapCeilingKeyDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.ceilingKey(25));   // 30
    }
}
''' + OUT, r'''// TreeMap higherKey(K key): the key just bigger than key
import java.util.TreeMap;

public class TreeMapHigherKeyDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.higherKey(40));   // null: nothing bigger
    }
}
''' + OUT,)),

    section('Range views: headMap, tailMap and subMap', 'Take a part of the map by key. The result is a live view.'),
    method(
        'headMap, tailMap and subMap', 'SortedMap<K, V> headMap(K toKey);  NavigableMap<K, V> headMap(K toKey, boolean inclusive);  tailMap(K fromKey[, boolean]);  subMap(from, to) / subMap(from, fromInc, to, toInc)', 'a view of that key range', 'O(log n) to create',
        '<code>headMap(to)</code> = entries with keys <strong>before</strong> to; <code>tailMap(from)</code> = keys <strong>from</strong> from onwards; <code>subMap(from, to)</code> = from (included) to to (<strong>excluded</strong>). The long forms let you choose whether each end is included.',
        'Views are not copies: changing the view changes the map and the other way round. Putting a key outside the view\'s range throws <code>IllegalArgumentException</code>. Copy with <code>new TreeMap&lt;&gt;(view)</code> for an independent map.',
        r'''// TreeMap headMap(K to): pairs with keys smaller than "to"
import java.util.TreeMap;

public class TreeMapHeadMapDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.headMap(30));   // 10 and 20
    }
}
''' + OUT, extra_codes=(r'''// TreeMap tailMap(K from): pairs with keys from "from" and bigger
import java.util.TreeMap;

public class TreeMapTailMapDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.tailMap(30));   // 30 and 40
    }
}
''' + OUT, r'''// TreeMap subMap(K from, K to): from "from" up to (not including) "to"
import java.util.TreeMap;

public class TreeMapSubMapDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.subMap(20, 40));   // 20 and 30
    }
}
''' + OUT,)),

    section('Reverse order', 'See the map upside down without copying it.'),
    method(
        'descendingMap(), descendingKeySet(), navigableKeySet() and reversed()', 'NavigableMap<K, V> descendingMap();  NavigableSet<K> descendingKeySet();  NavigableSet<K> navigableKeySet();  NavigableMap reversed()', 'live reversed / key-set views', 'O(1)',
        '<code>descendingMap()</code> shows the same entries from the <strong>largest key to the smallest</strong>. <code>descendingKeySet()</code> does the same for the keys only. In Java 21 <code>reversed()</code> is the same as <code>descendingMap()</code>.',
        'All are views: they update when the map changes, and removing through them changes the map. They can be chained: <code>map.descendingMap().headMap(x)</code>.',
        r'''// TreeMap descendingMap(): the map in reverse order
import java.util.TreeMap;

public class TreeMapDescendingMapDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.descendingMap());
    }
}
''' + OUT, extra_codes=(r'''// TreeMap descendingKeySet(): keys from big to small
import java.util.TreeMap;

public class TreeMapDescendingKeySetDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.descendingKeySet());
    }
}
''' + OUT, r'''// TreeMap reversed() (Java 21): the map in reverse order
import java.util.TreeMap;

public class TreeMapReversedDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        System.out.println(map.reversed());
    }
}
''' + OUT,)),
    method(
        'comparator(), clone, equals and toString', 'Comparator<? super K> comparator();  Object clone();  boolean equals(Object);  String toString()', 'the ordering / a shallow copy / comparison / text', 'O(n)',
        '<code>comparator()</code> returns the ordering in use (<code>null</code> for natural ordering). A TreeMap is <code>equal</code> to any Map with the same pairs, whatever the order or class.',
        'A <code>clone</code> copies the structure and keeps the comparator. Because <code>equals</code> on maps uses <code>equals</code> of the keys, a TreeMap with an unusual comparator can be "not equal" to a HashMap that looks identical.',
        r'''// TreeMap comparator(): the custom order, or null for natural order
import java.util.Comparator;
import java.util.TreeMap;

public class TreeMapComparatorDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> natural = new TreeMap<>();
        TreeMap<String, Integer> custom = new TreeMap<>(Comparator.reverseOrder());

        System.out.println(natural.comparator());          // null
        System.out.println(custom.comparator() != null);   // true
    }
}
''' + OUT, extra_codes=(r'''// TreeMap clone(): makes a copy
import java.util.TreeMap;

public class TreeMapCloneDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        Object copy = map.clone();

        System.out.println(copy);
    }
}
''' + OUT, r'''// TreeMap equals(): same pairs means equal
import java.util.TreeMap;

public class TreeMapEqualsDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(10, "Raigad");
        map.put(20, "Sinhagad");
        map.put(30, "Torna");
        map.put(40, "Purandar");

        TreeMap<Integer, String> other = new TreeMap<>(map);

        System.out.println(map.equals(other));   // true
    }
}
''' + OUT,)),
    (
        '<h3>Master program: every TreeMap method in one place</h3>\n'
        '<p>One single program that uses all the TreeMap methods you learned above, step by step. Read the numbered comments from top to bottom, run it, and match each output line with its step.</p>',
        [r'''// MASTER PROGRAM: all important TreeMap methods in one program
import java.util.Comparator;
import java.util.Map;
import java.util.TreeMap;

public class TreeMapMasterDemo {
    public static void main(String[] args) {
        // 1. Create an empty TreeMap (keys always sorted)
        TreeMap<Integer, String> map = new TreeMap<>();

        // 2. put, putAll, putIfAbsent
        map.put(30, "Torna");
        map.put(10, "Raigad");
        map.putAll(Map.of(20, "Sinhagad", 40, "Purandar"));
        map.putIfAbsent(50, "Lohagad");
        System.out.println("2. After puts      : " + map);

        // 3. get, getOrDefault, containsKey, containsValue, size
        System.out.println("3. get(10)         : " + map.get(10));
        System.out.println("   getOrDefault    : " + map.getOrDefault(99, "none"));
        System.out.println("   containsKey     : " + map.containsKey(20));
        System.out.println("   containsValue   : " + map.containsValue("Torna"));
        System.out.println("   size            : " + map.size());

        // 4. firstKey, lastKey, firstEntry, lastEntry
        System.out.println("4. firstKey/lastKey: " + map.firstKey() + " / " + map.lastKey());
        System.out.println("   first / last    : " + map.firstEntry() + " / " + map.lastEntry());

        // 5. Nearest keys: lowerKey, floorKey, ceilingKey, higherKey
        System.out.println("5. lowerKey(30)    : " + map.lowerKey(30));
        System.out.println("   floorKey(30)    : " + map.floorKey(30));
        System.out.println("   ceilingKey(35)  : " + map.ceilingKey(35));
        System.out.println("   higherKey(50)   : " + map.higherKey(50));

        // 6. Range views: headMap, tailMap, subMap
        System.out.println("6. headMap(30)     : " + map.headMap(30));
        System.out.println("   tailMap(30)     : " + map.tailMap(30));
        System.out.println("   subMap(20, 40)  : " + map.subMap(20, 40));

        // 7. Reverse order: descendingMap, descendingKeySet, reversed
        System.out.println("7. descendingMap   : " + map.descendingMap());
        System.out.println("   descendingKeySet: " + map.descendingKeySet());

        // 8. Views: keySet, values, forEach
        System.out.println("8. keys / values   : " + map.keySet() + " / " + map.values());
        map.forEach((k, v) -> System.out.print(k + "=" + v + " "));
        System.out.println();

        // 9. Change values: replace, merge
        map.replace(10, "Raigad Fort");
        map.merge(10, "!", String::concat);
        System.out.println("9. map.get(10)     : " + map.get(10));

        // 10. Remove: remove, pollFirstEntry, pollLastEntry
        map.remove(30);
        System.out.println("10. pollFirstEntry : " + map.pollFirstEntry());
        System.out.println("    pollLastEntry  : " + map.pollLastEntry());
        System.out.println("    Left           : " + map);

        // 11. A custom order, and clear
        TreeMap<String, Integer> zToA = new TreeMap<>(Comparator.reverseOrder());
        zToA.put("Pune", 1);
        zToA.put("Agra", 2);
        System.out.println("11. Z to A         : " + zToA);
        map.clear();
        System.out.println("    After clear    : " + map);
    }
}
''' + OUT],
    ),
]

EXPERT = [
    section(
        'How TreeMap works inside',
        'TreeMap is a <strong>red-black tree</strong>: a binary search tree that rebalances itself.',
        [
            'Every node (<code>TreeMap.Entry</code>) stores <code>key, value, left, right, parent</code> and a colour flag (red or black).',
            'The binary-search-tree rule: all keys in the left subtree are <strong>smaller</strong>, all keys in the right subtree are <strong>larger</strong>. A lookup therefore discards half of the remaining keys at every step.',
            'The red-black rules (root is black; a red node has black children; every path from a node to its leaves has the same number of black nodes) are repaired after each insert/delete by <strong>rotations and recolouring</strong>. The height stays at most about <code>2 log2(n + 1)</code>.',
            'So <code>get</code>, <code>put</code>, <code>remove</code>, <code>floorKey</code>, <code>ceilingKey</code>, <code>firstKey</code> ... are all <strong>O(log n)</strong>: about 20 comparisons for a million entries.',
            'Ordering comes <strong>only</strong> from <code>compareTo</code> or the <code>Comparator</code>. <code>hashCode</code> is never used; <code>equals</code> is not used to find keys.',
            'Iteration walks the tree in order using successor links: O(1) amortised per step, O(n) overall.',
            'Memory: about 40 bytes of overhead per entry (more than HashMap).',
        ],
    ),
    (
        '<h3>Trap: the comparator decides which keys are "the same"</h3>\n'
        + ul([
            'If the comparator returns 0 for two different keys, the second <code>put</code> <strong>replaces the value</strong> of the first key and no new entry is created.',
            'Add tie-breakers with <code>thenComparing</code> so that only truly equal keys compare as 0.',
        ]),
        [r'''// A comparator that ignores part of the key silently merges entries
import java.util.Comparator;
import java.util.TreeMap;

public class TreeMapComparatorTrapDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> lossy = new TreeMap<>(Comparator.comparing(String::length));   // length only
        lossy.put("Torna", 5);
        lossy.put("Lohag", 99);                                  // same length -> "same key": value replaced
        lossy.put("Raigad", 6);
        System.out.println("Length only      : " + lossy + " (3 puts, " + lossy.size() + " entries)");

        TreeMap<String, Integer> safe = new TreeMap<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        safe.put("Torna", 5);
        safe.put("Lohag", 99);
        safe.put("Raigad", 6);
        System.out.println("With tie-breaker : " + safe + " (" + safe.size() + " entries)");
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example 1: tax / price slabs with floorEntry</h3>\n<p>A table of slabs keyed by the <strong>lower bound</strong>. <code>floorEntry(amount)</code> finds the slab that contains any amount in one O(log n) call.</p>',
        [r'''// Entry fee slabs: the slab that contains a group size
import java.util.Map;
import java.util.TreeMap;

public class TreeMapSlabsDemo {
    public static void main(String[] args) {
        TreeMap<Integer, Integer> feePerPerson = new TreeMap<>();   // key = smallest group size of the slab
        feePerPerson.put(1, 100);       // 1 to 9 people pay 100 each
        feePerPerson.put(10, 80);       // 10 to 24 people pay 80 each
        feePerPerson.put(25, 60);       // 25 or more pay 60 each

        for (int group : new int[] {1, 9, 10, 24, 25, 100}) {
            Map.Entry<Integer, Integer> slab = feePerPerson.floorEntry(group);
            System.out.println("Group of " + group + " -> slab starting at " + slab.getKey() + ", fee " + slab.getValue() + " each, total " + group * slab.getValue());
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example 2: an event timeline with subMap</h3>\n<p>Keep events keyed by hour; <code>subMap</code> returns everything in a time window.</p>',
        [r'''// Timeline of events: query a window of hours with subMap()
import java.util.TreeMap;

public class TreeMapTimelineDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> day = new TreeMap<>();
        day.put(6, "Reach Raigad base");
        day.put(8, "Start the climb");
        day.put(11, "Summit and photos");
        day.put(13, "Lunch");
        day.put(16, "Back at the base");

        System.out.println("Morning (before 12)    : " + day.headMap(12));
        System.out.println("Between 8 and 13       : " + day.subMap(8, true, 13, true));
        System.out.println("From 13 onwards        : " + day.tailMap(13));
        System.out.println("Next event after 9:00  : " + day.higherEntry(9));
        System.out.println("Last event before 12   : " + day.lowerEntry(12));
    }
}
''' + OUT],
    ),
    (
        '<h3>TreeMap versus HashMap versus LinkedHashMap versus ConcurrentSkipListMap</h3>\n'
        + table(['', 'TreeMap', 'HashMap', 'LinkedHashMap', 'ConcurrentSkipListMap'], [
            ['Order', '<strong>Sorted by key</strong>', 'None', 'Insertion / access', 'Sorted by key'],
            ['get / put / remove', 'O(log n)', 'O(1)', 'O(1)', 'O(log n)'],
            ['Range / neighbour queries', '<strong>Yes</strong>', 'No', 'No', 'Yes'],
            ['null key', 'No', 'One', 'One', 'No'],
            ['Thread-safe', 'No', 'No', 'No', '<strong>Yes</strong> (lock-free)'],
            ['Key identity decided by', 'compareTo / Comparator', 'equals / hashCode', 'equals / hashCode', 'compareTo / Comparator'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Use TreeMap for what only it can do.',
        [
            'Choose TreeMap when you need sorted keys, "nearest key" lookups or range queries; otherwise HashMap is faster.',
            'Keep the comparator consistent with equals and add tie-breakers (<code>thenComparing</code>).',
            'Never modify a key in a way that changes its ordering after inserting it.',
            'Do not use null keys. Check inputs.',
            'Prefer the <code>*Entry</code> navigation methods to the <code>*Key</code> ones when you also need the value.',
            'For a concurrent sorted map use <code>ConcurrentSkipListMap</code>; for a one-off sorted print, copy a HashMap into a TreeMap.',
        ],
    ),
]

QA = [
    ('What is a TreeMap and how is it implemented?',
     'A sorted NavigableMap implemented as a red-black tree: a self-balancing binary search tree that keeps keys ordered and guarantees O(log n) get, put, remove and navigation.'),
    ('Time complexity of TreeMap operations?',
     'get, put, remove, containsKey, floorKey, ceilingKey, firstKey, lastKey: O(log n). Iteration is O(n) in key order; containsValue is O(n).'),
    ('How does TreeMap decide whether two keys are equal?',
     'With compareTo or the Comparator returning 0; equals() and hashCode() are not used.'),
    ('Can TreeMap have null keys or values?',
     'No null keys with natural ordering (NullPointerException); null values are allowed.'),
    ('What happens when keys are not Comparable?',
     'ClassCastException when you put the first key, unless you pass a Comparator.'),
    ('Explain floorKey, ceilingKey, lowerKey and higherKey.',
     'lowerKey: greatest key strictly less; floorKey: greatest key <=; ceilingKey: smallest key >=; higherKey: smallest key strictly greater. They return null if no such key exists. The *Entry versions return the entry.'),
    ('What do headMap, tailMap and subMap return?',
     'Live range views: headMap(to) keys before to, tailMap(from) keys from from onwards, subMap(from, to) from inclusive to exclusive; overloads allow inclusivity flags.'),
    ('HashMap vs TreeMap?',
     'HashMap: unordered, O(1), one null key, equals/hashCode. TreeMap: sorted by key, O(log n), no null keys, compareTo/Comparator, navigation and range views.'),
    ('How do you sort a HashMap by key and by value?',
     'By key: new TreeMap<>(hashMap). By value: put the entries in a list and sort it with Map.Entry.comparingByValue(), or stream entrySet().sorted(...) into a LinkedHashMap.'),
    ('Is TreeMap thread-safe?',
     'No. Use ConcurrentSkipListMap or Collections.synchronizedSortedMap.'),
    ('What is a consistent-with-equals comparator and why does it matter?',
     'It returns 0 only when equals() is true. Otherwise a TreeMap treats keys that equals() says are different as the same key and replaces values.'),
    ('How do you get entries in descending key order?',
     'descendingMap() (or reversed() in Java 21), or construct the TreeMap with Comparator.reverseOrder().'),
]

TOPIC = dict(id='treemap', name='TreeMap', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
