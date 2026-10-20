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
        r'''// TreeMap put / get / remove / containsKey: the keys stay sorted
import java.util.TreeMap;

public class TreeMapPutGetDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> areaCodes = new TreeMap<>();

        areaCodes.put("Pune", 20);
        areaCodes.put("Delhi", 11);
        areaCodes.put("Nagpur", 712);
        areaCodes.put("Mumbai", 22);
        System.out.println("Sorted by key : " + areaCodes);

        System.out.println("get(Nagpur)   : " + areaCodes.get("Nagpur"));
        System.out.println("get(Kochi)    : " + areaCodes.get("Kochi"));
        areaCodes.put("Pune", 2020);                                    // replace
        areaCodes.remove("Delhi");
        System.out.println("containsKey(Delhi): " + areaCodes.containsKey("Delhi"));
        System.out.println("Now           : " + areaCodes);

        try {
            areaCodes.put(null, 0);
        } catch (NullPointerException e) {
            System.out.println("null key      : NullPointerException");
        }
    }
}
''' + OUT),
    method(
        'merge, computeIfAbsent and the other compute methods', 'compute / computeIfAbsent / computeIfPresent / merge / putIfAbsent / getOrDefault', 'as HashMap', 'O(log n)',
        'They behave exactly as in HashMap. Combine them with a TreeMap to get <strong>sorted counts and groups</strong>.',
        'A TreeMap is often the finishing step of a data pipeline: collect into a HashMap for speed, then copy into a TreeMap to print in order.',
        r'''// TreeMap with merge / computeIfAbsent gives sorted counts and groups
import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;

public class TreeMapMergeDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> visits = new TreeMap<>();
        for (String city : new String[] {"Pune", "Nashik", "Pune", "Nagpur", "Pune", "Nashik"}) {
            visits.merge(city, 1, Integer::sum);
        }
        System.out.println("Visits by city : " + visits);

        TreeMap<Integer, List<String>> byLength = new TreeMap<>();
        for (String fort : new String[] {"Torna", "Raigad", "Lohagad", "Rajgad", "Panhala"}) {
            byLength.computeIfAbsent(fort.length(), k -> new ArrayList<>()).add(fort);
        }
        System.out.println("Forts by length: " + byLength);
    }
}
''' + OUT),
    method(
        'keySet(), values(), entrySet() and forEach()', 'Set<K> keySet();  Collection<V> values();  Set<Map.Entry<K, V>> entrySet();  void forEach(BiConsumer)', 'views in ascending key order', 'O(n)',
        'Every view and loop is in <strong>ascending key order</strong>. They are live views: removing from a view removes from the map.',
        '<code>navigableKeySet()</code> returns the keys as a <code>NavigableSet</code> and <code>descendingKeySet()</code> in reverse. Entries from <code>entrySet()</code> support <code>setValue</code>, but entries returned by <code>firstEntry()</code> and friends are immutable snapshots.',
        r'''// TreeMap views are in ascending key order
import java.util.Map;
import java.util.TreeMap;

public class TreeMapViewsDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> trekHours = new TreeMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3, "Lohagad", 2));

        System.out.println("keys   : " + trekHours.keySet());
        System.out.println("values : " + trekHours.values());            // in key order, not value order

        for (Map.Entry<String, Integer> e : trekHours.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        trekHours.keySet().remove("Torna");                              // views are live
        trekHours.values().removeIf(h -> h > 5);
        System.out.println("After removals: " + trekHours);
    }
}
''' + OUT),

    section('The ends of the map', 'Smallest and largest key, with or without removing them.'),
    method(
        'firstKey, lastKey, firstEntry and lastEntry', 'K firstKey();  K lastKey();  Map.Entry<K, V> firstEntry();  Map.Entry<K, V> lastEntry()', 'the key / the entry', 'O(log n)',
        '<code>firstKey()</code> and <code>lastKey()</code> return the smallest and the largest <strong>key</strong> and throw <code>NoSuchElementException</code> when the map is empty. <code>firstEntry()</code> and <code>lastEntry()</code> return the whole <strong>pair</strong> (or <code>null</code> when empty).',
        'The entry versions are safer for possibly-empty maps and give the value in the same call. The returned entries are snapshots: calling <code>setValue</code> on them throws <code>UnsupportedOperationException</code>.',
        r'''// TreeMap firstKey / lastKey / firstEntry / lastEntry
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.TreeMap;

public class TreeMapEndsDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> trekHours = new TreeMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3));

        System.out.println("firstKey   : " + trekHours.firstKey());
        System.out.println("lastKey    : " + trekHours.lastKey());
        System.out.println("firstEntry : " + trekHours.firstEntry());
        System.out.println("lastEntry  : " + trekHours.lastEntry());

        TreeMap<String, Integer> empty = new TreeMap<>();
        System.out.println("empty.firstEntry() : " + empty.firstEntry());     // null, no exception
        try {
            empty.firstKey();
        } catch (NoSuchElementException e) {
            System.out.println("empty.firstKey()  : NoSuchElementException");
        }
    }
}
''' + OUT),
    method(
        'pollFirstEntry() and pollLastEntry()', 'Map.Entry<K, V> pollFirstEntry();  Map.Entry<K, V> pollLastEntry()', 'the removed entry, or <code>null</code> if empty', 'O(log n)',
        'Remove and return the entry with the smallest or the largest key. Repeat <code>pollFirstEntry</code> until it returns <code>null</code> to process entries in key order while consuming them (a sorted queue with lookups).',
        'Handy for event schedulers: key = time, value = task; <code>pollFirstEntry</code> always gives the next task due.',
        r'''// TreeMap pollFirstEntry / pollLastEntry: a tiny scheduler keyed by hour
import java.util.Map;
import java.util.TreeMap;

public class TreeMapPollDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> schedule = new TreeMap<>();
        schedule.put(15, "Visit Purandar");
        schedule.put(6, "Start at Raigad");
        schedule.put(11, "Lunch at Torna");

        Map.Entry<Integer, String> next;
        while ((next = schedule.pollFirstEntry()) != null) {          // earliest first
            System.out.println(next.getKey() + ":00  " + next.getValue());
        }
        System.out.println("Left: " + schedule + ", pollLastEntry on empty = " + schedule.pollLastEntry());
    }
}
''' + OUT),

    section('Neighbours: lowerKey, floorKey, ceilingKey and higherKey', 'Find the closest key to a value, <strong>even if the value is not a key</strong>. Each has an <code>Entry</code> twin: <code>lowerEntry</code>, <code>floorEntry</code>, <code>ceilingEntry</code>, <code>higherEntry</code>.'),
    method(
        'lowerKey, floorKey, ceilingKey, higherKey (and the Entry versions)', 'K lowerKey(K);  K floorKey(K);  K ceilingKey(K);  K higherKey(K);  Map.Entry lowerEntry(K) ...', 'the neighbouring key / entry, or <code>null</code>', 'O(log n)',
        '<code>lowerKey(k)</code> = greatest key <strong>strictly below</strong> k; <code>floorKey(k)</code> = greatest key <strong>below or equal</strong>; <code>ceilingKey(k)</code> = smallest key <strong>above or equal</strong>; <code>higherKey(k)</code> = smallest key <strong>strictly above</strong>. If there is no such key the result is <code>null</code>.',
        'The Entry versions return the key <em>and</em> its value in one call, which is what you usually want. This is the standard way to implement <strong>price slabs, tax brackets, grade boundaries and time-line lookups</strong>.',
        r'''// TreeMap lowerKey / floorKey / ceilingKey / higherKey
import java.util.Map;
import java.util.TreeMap;

public class TreeMapNeighboursDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> altitudeLevels = new TreeMap<>();
        altitudeLevels.put(100, "Base");
        altitudeLevels.put(400, "Plateau");
        altitudeLevels.put(800, "Ridge");
        altitudeLevels.put(1200, "Summit");

        int probe = 500;                                          // not a key
        System.out.println("lowerKey(500)   : " + altitudeLevels.lowerKey(probe));
        System.out.println("floorKey(500)   : " + altitudeLevels.floorKey(probe));
        System.out.println("ceilingKey(500) : " + altitudeLevels.ceilingKey(probe));
        System.out.println("higherKey(500)  : " + altitudeLevels.higherKey(probe));

        Map.Entry<Integer, String> band = altitudeLevels.floorEntry(probe);     // the band that contains 500
        System.out.println("Band for 500    : " + band.getValue() + " (starts at " + band.getKey() + ")");
        System.out.println("floorEntry(50)  : " + altitudeLevels.floorEntry(50));     // below the smallest key
        System.out.println("higherKey(1200) : " + altitudeLevels.higherKey(1200));   // above the largest key
    }
}
''' + OUT),

    section('Range views: headMap, tailMap and subMap', 'Take a part of the map by key. The result is a live view.'),
    method(
        'headMap, tailMap and subMap', 'SortedMap<K, V> headMap(K toKey);  NavigableMap<K, V> headMap(K toKey, boolean inclusive);  tailMap(K fromKey[, boolean]);  subMap(from, to) / subMap(from, fromInc, to, toInc)', 'a view of that key range', 'O(log n) to create',
        '<code>headMap(to)</code> = entries with keys <strong>before</strong> to; <code>tailMap(from)</code> = keys <strong>from</strong> from onwards; <code>subMap(from, to)</code> = from (included) to to (<strong>excluded</strong>). The long forms let you choose whether each end is included.',
        'Views are not copies: changing the view changes the map and the other way round. Putting a key outside the view\'s range throws <code>IllegalArgumentException</code>. Copy with <code>new TreeMap&lt;&gt;(view)</code> for an independent map.',
        r'''// TreeMap headMap / tailMap / subMap: range views by key
import java.util.NavigableMap;
import java.util.TreeMap;

public class TreeMapRangeDemo {
    public static void main(String[] args) {
        NavigableMap<String, Integer> trekHours = new TreeMap<>();
        trekHours.put("Lohagad", 2);
        trekHours.put("Panhala", 4);
        trekHours.put("Purandar", 3);
        trekHours.put("Raigad", 6);
        trekHours.put("Sinhagad", 2);
        trekHours.put("Torna", 5);

        System.out.println("headMap(Raigad)           : " + trekHours.headMap("Raigad"));          // before Raigad
        System.out.println("headMap(Raigad, true)     : " + trekHours.headMap("Raigad", true));
        System.out.println("tailMap(Raigad)           : " + trekHours.tailMap("Raigad"));          // Raigad and after
        System.out.println("subMap(Panhala, Sinhagad) : " + trekHours.subMap("Panhala", "Sinhagad"));

        trekHours.subMap("Panhala", "Raigad").clear();                 // remove a key range through the view
        System.out.println("After clearing the range  : " + trekHours);
    }
}
''' + OUT),

    section('Reverse order', 'See the map upside down without copying it.'),
    method(
        'descendingMap(), descendingKeySet(), navigableKeySet() and reversed()', 'NavigableMap<K, V> descendingMap();  NavigableSet<K> descendingKeySet();  NavigableSet<K> navigableKeySet();  NavigableMap reversed()', 'live reversed / key-set views', 'O(1)',
        '<code>descendingMap()</code> shows the same entries from the <strong>largest key to the smallest</strong>. <code>descendingKeySet()</code> does the same for the keys only. In Java 21 <code>reversed()</code> is the same as <code>descendingMap()</code>.',
        'All are views: they update when the map changes, and removing through them changes the map. They can be chained: <code>map.descendingMap().headMap(x)</code>.',
        r'''// TreeMap descendingMap / descendingKeySet / reversed
import java.util.Map;
import java.util.TreeMap;

public class TreeMapDescendingDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> trekHours = new TreeMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3));

        System.out.println("ascending      : " + trekHours);
        System.out.println("descendingMap  : " + trekHours.descendingMap());
        System.out.println("descendingKeys : " + trekHours.descendingKeySet());
        System.out.println("reversed (21)  : " + trekHours.reversed());

        trekHours.put("Lohagad", 2);                                      // views are live
        System.out.println("view updated   : " + trekHours.descendingMap());
    }
}
''' + OUT),
    method(
        'comparator(), clone, equals and toString', 'Comparator<? super K> comparator();  Object clone();  boolean equals(Object);  String toString()', 'the ordering / a shallow copy / comparison / text', 'O(n)',
        '<code>comparator()</code> returns the ordering in use (<code>null</code> for natural ordering). A TreeMap is <code>equal</code> to any Map with the same pairs, whatever the order or class.',
        'A <code>clone</code> copies the structure and keeps the comparator. Because <code>equals</code> on maps uses <code>equals</code> of the keys, a TreeMap with an unusual comparator can be "not equal" to a HashMap that looks identical.',
        r'''// TreeMap comparator() / clone / equals
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class TreeMapComparatorDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> natural = new TreeMap<>(Map.of("Raigad", 6, "Torna", 5));
        TreeMap<String, Integer> reverse = new TreeMap<>(Comparator.reverseOrder());
        reverse.putAll(natural);

        System.out.println("natural.comparator() : " + natural.comparator());
        System.out.println("reverse.comparator() is set: " + (reverse.comparator() != null));
        System.out.println("natural : " + natural + "   reverse : " + reverse);
        System.out.println("equal?  : " + natural.equals(reverse));            // same pairs, so equal

        Map<String, Integer> hash = new HashMap<>(natural);
        System.out.println("equals a HashMap with the same pairs: " + natural.equals(hash));

        @SuppressWarnings("unchecked")
        TreeMap<String, Integer> copy = (TreeMap<String, Integer>) reverse.clone();
        copy.put("Lohagad", 2);
        System.out.println("clone keeps the comparator: " + copy);
    }
}
''' + OUT),
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
