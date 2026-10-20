"""HashMap lesson: key-value pairs with very fast lookup by key. Every method has a runnable sample.
Data uses only fort names and Indian city names (telephone area codes and trek hours are sample numbers).
Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a HashMap?',
        'A <strong>HashMap</strong> stores <strong>pairs</strong>: a <strong>key</strong> and the <strong>value</strong> that belongs to it. You give the map a key and it gives back the value almost instantly, '
        'like looking up a city in a telephone-code table: key <code>"Pune"</code>, value <code>20</code>. Each key appears <strong>once</strong>; each key maps to one value.',
        [
            'Package <code>java.util</code>. Implements <code>Map&lt;K, V&gt;</code>. It is <strong>not</strong> a <code>Collection</code> (it has its own interface).',
            '<strong>Unique keys:</strong> putting an existing key again <strong>replaces the value</strong>. Values may repeat.',
            '<strong>Fast:</strong> <code>get</code>, <code>put</code>, <code>remove</code> and <code>containsKey</code> are O(1) on average.',
            '<strong>No order:</strong> iteration order depends on hash codes and can change when the map grows. Use <code>LinkedHashMap</code> or <code>TreeMap</code> for an order.',
            '<strong>One null key</strong> and any number of <strong>null values</strong> are allowed.',
            '<strong>Not thread-safe.</strong> For threads use <code>ConcurrentHashMap</code>.',
            'Key classes must have correct <code>equals()</code> and <code>hashCode()</code> (String, Integer and records already do).',
        ],
    ),
    (
        '<h3>Where HashMap sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Map', 'I', True, None, G), ('AbstractMap', 'c', False, 'implements', B), ('HashMap', 'c', False, 'extends', G), ('LinkedHashMap', 'c', False, 'extended by', G),
        ])
        + '\n<p>(I) = interface, (c) = class. HashMap also implements <code>Cloneable</code> and <code>Serializable</code>. Its subclass <code>LinkedHashMap</code> adds a predictable order.</p>',
        [],
    ),
    (
        '<h3>Creating a HashMap: four constructors</h3>\n'
        + ul([
            '<code>new HashMap&lt;&gt;()</code>: empty, capacity 16, load factor 0.75.',
            '<code>new HashMap&lt;&gt;(int initialCapacity)</code> and <code>(int, float loadFactor)</code>: tune the table size.',
            '<code>new HashMap&lt;&gt;(Map m)</code>: a copy of another map.',
            'Declare the variable as <code>Map&lt;K, V&gt;</code>, not <code>HashMap</code>.',
        ]),
        [r'''// HashMap constructors and a first look
import java.util.HashMap;
import java.util.Map;

public class HashMapCreateDemo {
    public static void main(String[] args) {
        Map<String, Integer> areaCodes = new HashMap<>();             // empty
        Map<String, Integer> sized = new HashMap<>(100);              // room for about 75 entries without resizing

        areaCodes.put("Pune", 20);
        areaCodes.put("Mumbai", 22);
        areaCodes.put("Nagpur", 712);

        Map<String, Integer> copy = new HashMap<>(areaCodes);         // copy constructor
        copy.put("Delhi", 11);

        System.out.println("Original: " + areaCodes);
        System.out.println("Copy    : " + copy);
        System.out.println("Sized map is empty: " + sized.isEmpty());
    }
}
''' + OUT],
    ),
    (
        '<h3>Your first HashMap program</h3>\n'
        + ul([
            '<code>put(key, value)</code> adds a pair; <code>get(key)</code> returns the value or <code>null</code> if the key is missing.',
            'Printing a map shows <code>{key=value, key=value}</code>.',
            'Putting the same key again <strong>replaces</strong> the value and returns the old one.',
        ]),
        [r'''// First HashMap program: put and get
import java.util.HashMap;
import java.util.Map;

public class HashMapFirstDemo {
    public static void main(String[] args) {
        Map<String, Integer> trekHours = new HashMap<>();

        trekHours.put("Raigad", 6);
        trekHours.put("Sinhagad", 2);
        trekHours.put("Torna", 5);

        System.out.println("Map            : " + trekHours);
        System.out.println("get(Raigad)    : " + trekHours.get("Raigad"));
        System.out.println("get(Panhala)   : " + trekHours.get("Panhala"));     // missing key -> null

        Integer old = trekHours.put("Raigad", 7);                              // same key: value replaced
        System.out.println("old value      : " + old);
        System.out.println("Map now        : " + trekHours);
        System.out.println("Number of pairs: " + trekHours.size());
    }
}
''' + OUT],
    ),
    (
        '<h3>All HashMap methods at a glance</h3>\n<p><em>n</em> is the number of entries.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>put(k, v)</strong> / <strong>putAll(m)</strong> / <strong>putIfAbsent(k, v)</strong>', 'Adds or replaces / adds a whole map / adds only if the key is missing', 'O(1)'],
            ['<strong>get(k)</strong> / <strong>getOrDefault(k, d)</strong>', 'Reads a value (null / default when missing)', 'O(1)'],
            ['<strong>containsKey(k)</strong> / <strong>containsValue(v)</strong>', 'Tests for a key / for a value', 'O(1) / O(n)'],
            ['<strong>remove(k)</strong> / <strong>remove(k, v)</strong>', 'Removes by key / only if it has that value', 'O(1)'],
            ['<strong>replace(k, v)</strong> / <strong>replaceAll(f)</strong>', 'Replaces one value / transforms every value', 'O(1) / O(n)'],
            ['<strong>compute(k, f)</strong> / <strong>computeIfAbsent(k, f)</strong> / <strong>computeIfPresent(k, f)</strong>', 'Calculates the new value for a key', 'O(1)'],
            ['<strong>merge(k, v, f)</strong>', 'Inserts v, or combines the old value and v with f', 'O(1)'],
            ['<strong>keySet()</strong> / <strong>values()</strong> / <strong>entrySet()</strong>', 'Live views of the keys / values / pairs', 'O(1) to create'],
            ['<strong>forEach(f)</strong>', 'Runs an action for every pair', 'O(n + capacity)'],
            ['<strong>size()</strong> / <strong>isEmpty()</strong> / <strong>clear()</strong>', 'Count, emptiness, remove all', 'O(1) / O(1) / O(capacity)'],
            ['<strong>clone()</strong> / <strong>equals</strong> / <strong>hashCode</strong> / <strong>toString</strong>', 'Copy and compare', 'O(n)'],
            ['<strong>Map.of(...)</strong> / <strong>Map.entry(k, v)</strong> / <strong>Map.copyOf(m)</strong>', 'Immutable maps and entries', 'O(n)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Putting pairs in', 'Four ways to add: replace freely, add a whole map, add only when missing, or compute.'),
    method(
        'put(K key, V value)', 'V put(K key, V value)', 'the previous value for the key, or <code>null</code> if there was none', 'O(1) average',
        'Stores the pair. If the key is <strong>new</strong> the pair is added and <code>null</code> is returned. If the key <strong>exists</strong>, its value is replaced and the <strong>old value</strong> is returned.',
        'The key\'s <code>hashCode</code> selects a bucket; the key is then compared with <code>equals</code> inside the bucket. On a replace the <strong>original key object is kept</strong>, only the value changes. A <code>null</code> return is ambiguous when null values are allowed (use <code>containsKey</code> to tell).',
        r'''// HashMap put(K, V): add or replace, and the returned old value
import java.util.HashMap;
import java.util.Map;

public class HashMapPutDemo {
    public static void main(String[] args) {
        Map<String, Integer> areaCodes = new HashMap<>();

        System.out.println("put Pune   : " + areaCodes.put("Pune", 20));      // new key -> null
        System.out.println("put Mumbai : " + areaCodes.put("Mumbai", 22));
        System.out.println("put Pune   : " + areaCodes.put("Pune", 2020));    // existing key -> old value returned
        areaCodes.put(null, 0);                                              // one null key is allowed
        areaCodes.put("Nagpur", null);                                       // null values are allowed

        System.out.println("Map        : " + areaCodes);
        System.out.println("Size       : " + areaCodes.size());
    }
}
''' + OUT),
    method(
        'putAll(Map m)', 'void putAll(Map<? extends K, ? extends V> m)', 'nothing (void)', 'O(m)',
        'Copies <strong>every pair</strong> of another map into this one. Keys that already exist get their value replaced.',
        'It pre-sizes the table for the incoming entries and then does one <code>put</code> per entry. Use it to merge two maps: the argument "wins" on conflicts.',
        r'''// HashMap putAll(): merge another map in (the argument wins on conflicts)
import java.util.HashMap;
import java.util.Map;

public class HashMapPutAllDemo {
    public static void main(String[] args) {
        Map<String, Integer> west = new HashMap<>(Map.of("Pune", 20, "Mumbai", 22));
        Map<String, Integer> other = Map.of("Mumbai", 2222, "Nagpur", 712, "Delhi", 11);

        west.putAll(other);                  // Mumbai is replaced, Nagpur and Delhi are added
        System.out.println(new java.util.TreeMap<>(west));          // sorted copy only for a tidy print
    }
}
''' + OUT),
    method(
        'putIfAbsent(K key, V value)', 'V putIfAbsent(K key, V value)', 'the existing value, or <code>null</code> if the pair was added', 'O(1)',
        'Adds the pair <strong>only if the key has no value yet</strong>. If the key is already there nothing changes and you get the existing value back. It is the safe way to write "set a default".',
        'It is one atomic call instead of <code>if (!map.containsKey(k)) map.put(k, v)</code> (two lookups, and a race in concurrent code). A key mapped to <code>null</code> counts as "no value" and is filled.',
        r'''// HashMap putIfAbsent(): add only when the key has no value
import java.util.HashMap;
import java.util.Map;

public class HashMapPutIfAbsentDemo {
    public static void main(String[] args) {
        Map<String, Integer> trekHours = new HashMap<>();
        trekHours.put("Raigad", 6);

        Integer a = trekHours.putIfAbsent("Raigad", 99);    // exists: nothing changes, old value returned
        Integer b = trekHours.putIfAbsent("Torna", 5);      // missing: added, null returned

        System.out.println("Raigad call returned : " + a);
        System.out.println("Torna call returned  : " + b);
        System.out.println("Map                  : " + new java.util.TreeMap<>(trekHours));
    }
}
''' + OUT),

    section('Reading values', 'Read by key. A missing key gives <code>null</code>, unless you ask for a default.'),
    method(
        'get(Object key) and getOrDefault(Object key, V defaultValue)', 'V get(Object key);  V getOrDefault(Object key, V defaultValue)', 'the value, or <code>null</code> / the default if the key is missing', 'O(1) average',
        '<code>get</code> returns the value stored for the key, or <code>null</code> when the key is absent. <code>getOrDefault</code> lets you give a value to use instead of <code>null</code>, which avoids a <code>NullPointerException</code> when you unbox the result.',
        'A <code>null</code> from <code>get</code> can mean "no key" <em>or</em> "the value is null". Use <code>containsKey</code> to tell them apart. <code>int hours = map.get("x")</code> throws <code>NullPointerException</code> when the key is missing because of the unboxing; <code>getOrDefault("x", 0)</code> does not.',
        r'''// HashMap get() and getOrDefault()
import java.util.HashMap;
import java.util.Map;

public class HashMapGetDemo {
    public static void main(String[] args) {
        Map<String, Integer> trekHours = new HashMap<>(Map.of("Raigad", 6, "Torna", 5));

        System.out.println("get(Raigad)             : " + trekHours.get("Raigad"));
        System.out.println("get(Panhala)            : " + trekHours.get("Panhala"));
        System.out.println("getOrDefault(Panhala, 0): " + trekHours.getOrDefault("Panhala", 0));

        try {
            int hours = trekHours.get("Panhala");          // unboxing null
            System.out.println(hours);
        } catch (NullPointerException e) {
            System.out.println("int hours = get(missing) -> NullPointerException");
        }
    }
}
''' + OUT),
    method(
        'containsKey(Object key) and containsValue(Object value)', 'boolean containsKey(Object key);  boolean containsValue(Object value)', '<code>true</code> or <code>false</code>', 'O(1) / O(n)',
        '<code>containsKey</code> asks "is this key in the map?" and is very fast. <code>containsValue</code> asks "does any key have this value?" and has to <strong>scan every entry</strong>, so it is slow on big maps.',
        'If you need fast "by value" lookups, keep a second map from value to key, or use a bidirectional map from a library. <code>containsKey</code> also tells you whether <code>get</code> returned <code>null</code> because of a missing key or a null value.',
        r'''// HashMap containsKey (fast) and containsValue (scans all entries)
import java.util.HashMap;
import java.util.Map;

public class HashMapContainsDemo {
    public static void main(String[] args) {
        Map<String, Integer> areaCodes = new HashMap<>(Map.of("Pune", 20, "Mumbai", 22, "Delhi", 11));

        System.out.println("containsKey(Pune)    : " + areaCodes.containsKey("Pune"));
        System.out.println("containsKey(Kochi)   : " + areaCodes.containsKey("Kochi"));
        System.out.println("containsValue(22)    : " + areaCodes.containsValue(22));
        System.out.println("containsValue(999)   : " + areaCodes.containsValue(999));

        areaCodes.put("Indore", null);                                  // a key whose value is null
        System.out.println("get(Indore)          : " + areaCodes.get("Indore"));
        System.out.println("containsKey(Indore)  : " + areaCodes.containsKey("Indore"));   // distinguishes it from a missing key
    }
}
''' + OUT),
    method(
        'size(), isEmpty() and clear()', 'int size();  boolean isEmpty();  void clear()', 'the count / emptiness / nothing', 'O(1) / O(1) / O(capacity)',
        'Count the pairs, test for none, or remove every pair.',
        '<code>clear()</code> removes the entries but keeps the table size, so a map that once held millions of entries stays big in memory. Create a new map if you want to release it.',
        r'''// HashMap size / isEmpty / clear
import java.util.HashMap;
import java.util.Map;

public class HashMapSizeDemo {
    public static void main(String[] args) {
        Map<String, Integer> areaCodes = new HashMap<>(Map.of("Pune", 20, "Mumbai", 22));
        System.out.println("size " + areaCodes.size() + ", empty? " + areaCodes.isEmpty());

        areaCodes.clear();
        System.out.println("size " + areaCodes.size() + ", empty? " + areaCodes.isEmpty());
    }
}
''' + OUT),

    section('Removing and replacing', 'Remove by key, remove conditionally, and replace without adding new keys.'),
    method(
        'remove(Object key) and remove(Object key, Object value)', 'V remove(Object key);  boolean remove(Object key, Object value)', 'the removed value (or <code>null</code>) / <code>true</code> if removed', 'O(1)',
        '<code>remove(key)</code> deletes the pair and returns the value that was stored. <code>remove(key, value)</code> deletes it <strong>only if the key currently has exactly that value</strong>.',
        'The two-argument form is a compare-and-remove, useful for "remove this entry only if nobody changed it".',
        r'''// HashMap remove(key) and remove(key, value)
import java.util.HashMap;
import java.util.Map;

public class HashMapRemoveDemo {
    public static void main(String[] args) {
        Map<String, Integer> trekHours = new HashMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3));

        System.out.println("remove(Torna)         : " + trekHours.remove("Torna"));         // returns the value 5
        System.out.println("remove(Panhala)       : " + trekHours.remove("Panhala"));       // no such key -> null
        System.out.println("remove(Raigad, 99)    : " + trekHours.remove("Raigad", 99));    // wrong value -> not removed
        System.out.println("remove(Raigad, 6)     : " + trekHours.remove("Raigad", 6));     // right value -> removed
        System.out.println("Remaining             : " + trekHours);
    }
}
''' + OUT),
    method(
        'replace(K, V) and replaceAll(BiFunction)', 'V replace(K key, V value);  boolean replace(K key, V oldValue, V newValue);  void replaceAll(BiFunction<K, V, V> function)', 'the old value / whether replaced / nothing', 'O(1) / O(n)',
        '<code>replace(key, value)</code> changes the value <strong>only if the key exists</strong> (unlike <code>put</code>, it never adds a new key). <code>replaceAll(function)</code> recalculates <strong>every</strong> value from its key and old value.',
        '<code>replaceAll</code> is a clean way to transform all values in place, for example "add 1 to every count" or "make all values upper case".',
        r'''// HashMap replace() and replaceAll()
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HashMapReplaceDemo {
    public static void main(String[] args) {
        Map<String, Integer> trekHours = new HashMap<>(Map.of("Raigad", 6, "Torna", 5));

        trekHours.replace("Raigad", 7);               // exists: changed
        trekHours.replace("Panhala", 4);              // missing: NOT added
        System.out.println("After replace   : " + new TreeMap<>(trekHours));

        trekHours.replaceAll((fort, hours) -> hours + 1);     // every value gets one more hour
        System.out.println("After replaceAll: " + new TreeMap<>(trekHours));

        trekHours.replaceAll((fort, hours) -> fort.length() > 5 ? hours * 2 : hours);   // uses the key too
        System.out.println("Using the key   : " + new TreeMap<>(trekHours));
    }
}
''' + OUT),

    section('Calculating values: compute, computeIfAbsent, computeIfPresent and merge', 'These four methods (Java 8) replace the old "get, check, put" pattern. They do the lookup <strong>once</strong>.'),
    method(
        'computeIfAbsent(K, Function)', 'V computeIfAbsent(K key, Function<? super K, ? extends V> mappingFunction)', 'the existing or newly computed value', 'O(1) + function',
        'If the key has <strong>no value</strong>, call the function to create one, store it and return it. If the key already has a value, return it and <strong>do not call</strong> the function. The classic use is a map of lists: <code>map.computeIfAbsent(city, k -&gt; new ArrayList&lt;&gt;()).add(fort)</code>.',
        'The function must not modify the map (it can throw <code>ConcurrentModificationException</code>). Returning <code>null</code> from the function means "do not store anything".',
        r'''// HashMap computeIfAbsent(): group values into lists per key
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class HashMapComputeIfAbsentDemo {
    public static void main(String[] args) {
        String[][] forts = {{"Sinhagad", "Pune"}, {"Raigad", "Raigad"}, {"Torna", "Pune"}, {"Lohagad", "Pune"}, {"Panhala", "Kolhapur"}};

        Map<String, List<String>> byDistrict = new HashMap<>();
        for (String[] pair : forts) {
            byDistrict.computeIfAbsent(pair[1], district -> new ArrayList<>())      // create the list on first use
                      .add(pair[0]);                                                // then add to it
        }
        System.out.println(new TreeMap<>(byDistrict));
    }
}
''' + OUT),
    method(
        'computeIfPresent(K, BiFunction)', 'V computeIfPresent(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction)', 'the new value, or <code>null</code> if removed / absent', 'O(1) + function',
        'If the key <strong>exists</strong> (with a non-null value), call the function with the key and the old value and store the result. If the function returns <code>null</code> the entry is <strong>removed</strong>. If the key is missing nothing happens.',
        'Perfect for "update if it exists" and for "decrement, and delete when it reaches zero".',
        r'''// HashMap computeIfPresent(): update only existing keys; null result removes the entry
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HashMapComputeIfPresentDemo {
    public static void main(String[] args) {
        Map<String, Integer> seatsLeft = new HashMap<>(Map.of("Raigad", 2, "Torna", 5));

        seatsLeft.computeIfPresent("Raigad", (fort, seats) -> seats - 1);     // 2 -> 1
        seatsLeft.computeIfPresent("Panhala", (fort, seats) -> seats - 1);    // missing: ignored
        System.out.println("After one booking : " + new TreeMap<>(seatsLeft));

        seatsLeft.computeIfPresent("Raigad", (fort, seats) -> seats == 1 ? null : seats - 1);   // null removes the entry
        System.out.println("Raigad sold out   : " + new TreeMap<>(seatsLeft));
    }
}
''' + OUT),
    method(
        'compute(K, BiFunction)', 'V compute(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction)', 'the new value (or <code>null</code> if the entry was removed)', 'O(1) + function',
        'Calls the function whether or not the key exists. The function receives the key and the <strong>old value (or <code>null</code>)</strong> and returns the new value. A <code>null</code> result removes the entry. Use it for a counter: <code>map.compute(word, (k, v) -&gt; v == null ? 1 : v + 1)</code>.',
        'Compared with <code>merge</code>, <code>compute</code> sees the key and can treat "absent" and "present" differently in one expression.',
        r'''// HashMap compute(): one call for "absent or present"
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HashMapComputeDemo {
    public static void main(String[] args) {
        Map<String, Integer> visits = new HashMap<>();

        for (String city : new String[] {"Pune", "Nashik", "Pune", "Nagpur", "Pune"}) {
            visits.compute(city, (key, count) -> count == null ? 1 : count + 1);     // old value is null the first time
        }
        System.out.println(new TreeMap<>(visits));
    }
}
''' + OUT),
    method(
        'merge(K, V, BiFunction)', 'V merge(K key, V value, BiFunction<? super V, ? super V, ? extends V> remappingFunction)', 'the new value in the map', 'O(1) + function',
        'The shortest way to count or to combine values. If the key is <strong>absent</strong>, it stores the given value. If the key is <strong>present</strong>, it stores <code>function(oldValue, givenValue)</code>. A <code>null</code> result removes the entry. Counting words: <code>map.merge(word, 1, Integer::sum)</code>.',
        'The function takes the two <strong>values</strong> (not the key), so method references such as <code>Integer::sum</code>, <code>String::concat</code> or <code>Math::max</code> fit perfectly. Neither the value nor the function may be <code>null</code>.',
        r'''// HashMap merge(): count and combine with a method reference
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HashMapMergeDemo {
    public static void main(String[] args) {
        Map<String, Integer> counts = new HashMap<>();
        for (String city : new String[] {"Pune", "Nashik", "Pune", "Nagpur", "Pune", "Nashik"}) {
            counts.merge(city, 1, Integer::sum);               // absent: 1; present: old + 1
        }
        System.out.println("Visit counts : " + new TreeMap<>(counts));

        Map<String, Integer> longest = new HashMap<>();
        longest.merge("Raigad", 6, Math::max);                 // keep the maximum of old and new
        longest.merge("Raigad", 4, Math::max);
        longest.merge("Raigad", 9, Math::max);
        System.out.println("Longest trek : " + longest);

        Map<String, String> notes = new HashMap<>();
        notes.merge("Torna", "steep", (oldNote, newNote) -> oldNote + ", " + newNote);
        notes.merge("Torna", "windy", (oldNote, newNote) -> oldNote + ", " + newNote);
        System.out.println("Notes        : " + notes);
    }
}
''' + OUT),

    section('Walking through a map', 'A map offers three <strong>views</strong>: the keys, the values and the pairs. Choose the one that gives you what you need in a single loop.'),
    method(
        'keySet(), values() and entrySet()', 'Set<K> keySet();  Collection<V> values();  Set<Map.Entry<K, V>> entrySet()', 'live views', 'O(1) to create',
        '<code>keySet()</code> is the set of keys, <code>values()</code> the collection of values and <code>entrySet()</code> the set of <strong>key-value pairs</strong> (<code>Map.Entry</code>). They are <strong>views</strong>: removing from a view removes from the map. Loop over <code>entrySet()</code> when you need both key and value; looping over <code>keySet()</code> and calling <code>get</code> does an extra lookup for every key.',
        'Views do not support <code>add</code>. The iteration order is the map\'s order (for HashMap: arbitrary). Removing during iteration must go through the iterator, <code>removeIf</code> on the view, or <code>Map.removeIf</code>-style calls on <code>entrySet()</code>.',
        r'''// HashMap views: keySet(), values(), entrySet()
import java.util.HashMap;
import java.util.Map;

public class HashMapViewsDemo {
    public static void main(String[] args) {
        Map<String, Integer> areaCodes = new HashMap<>(Map.of("Pune", 20, "Mumbai", 22, "Delhi", 11, "Nagpur", 712));

        System.out.println("keys   : " + new java.util.TreeSet<>(areaCodes.keySet()));
        System.out.println("values : " + new java.util.TreeSet<>(areaCodes.values()));

        for (Map.Entry<String, Integer> entry : new java.util.TreeMap<>(areaCodes).entrySet()) {   // pairs
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }

        areaCodes.keySet().remove("Delhi");                         // removing from a view removes from the map
        areaCodes.values().removeIf(code -> code > 500);            // remove every entry whose value matches
        System.out.println("After view removals: " + new java.util.TreeMap<>(areaCodes));
    }
}
''' + OUT),
    method(
        'forEach(BiConsumer)', 'void forEach(BiConsumer<? super K, ? super V> action)', 'nothing (void)', 'O(n + capacity)',
        'Runs an action for every pair, written as a lambda with two parameters: <code>map.forEach((key, value) -&gt; ...)</code>. It is the shortest loop when you only need to read.',
        'Cannot <code>break</code> out of it. It is fail-fast: changing the map inside the lambda throws <code>ConcurrentModificationException</code> at the end of the loop.',
        r'''// HashMap forEach((key, value) -> ...)
import java.util.Map;
import java.util.TreeMap;

public class HashMapForEachDemo {
    public static void main(String[] args) {
        Map<String, Integer> trekHours = new TreeMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3));   // sorted only for a stable print

        trekHours.forEach((fort, hours) -> System.out.println(fort + " takes " + hours + " hours"));

        int[] total = {0};                                      // a one-element array: lambdas need effectively final variables
        trekHours.forEach((fort, hours) -> total[0] += hours);
        System.out.println("Total hours: " + total[0]);
    }
}
''' + OUT),
    method(
        'Iterating safely: removing while looping', 'entrySet().iterator() with remove(), entrySet().removeIf(...), keySet().removeIf(...)', 'removes pairs without an exception', 'O(n)',
        'Removing from a map inside a for-each loop throws <code>ConcurrentModificationException</code>. Use an <strong>Iterator</strong>, or the one-line <code>entrySet().removeIf(...)</code>.',
        'This is the same fail-fast rule as for lists. <code>HashMap</code> checks a modification counter on each step.',
        r'''// Removing entries while iterating a HashMap
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

public class HashMapSafeRemoveDemo {
    public static void main(String[] args) {
        Map<String, Integer> a = new HashMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3, "Lohagad", 2));

        try {
            for (String fort : a.keySet()) {
                if (a.get(fort) < 4) {
                    a.remove(fort);                         // BAD: structure change during iteration
                }
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("BAD way : ConcurrentModificationException");
        }

        Map<String, Integer> b = new HashMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3, "Lohagad", 2));
        Iterator<Map.Entry<String, Integer>> it = b.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue() < 4) {
                it.remove();                                  // fix 1: iterator
            }
        }
        System.out.println("Iterator: " + new TreeMap<>(b));

        Map<String, Integer> c = new HashMap<>(Map.of("Raigad", 6, "Torna", 5, "Purandar", 3, "Lohagad", 2));
        c.entrySet().removeIf(entry -> entry.getValue() < 4);   // fix 2: removeIf
        System.out.println("removeIf: " + new TreeMap<>(c));
    }
}
''' + OUT),

    section('Copies, equality and immutable maps', 'Finish with the helper methods.'),
    method(
        'clone, equals, hashCode and toString', 'Object clone();  boolean equals(Object);  int hashCode();  String toString()', 'a shallow copy / comparison / hash / text', 'O(n)',
        'Two maps are <strong>equal</strong> when they have the same keys with equal values, whatever the Map class and the order. <code>clone()</code> makes a shallow copy (keys and values are shared).',
        'Prefer <code>new HashMap&lt;&gt;(map)</code> to <code>clone()</code>. The map\'s hash code is the sum of the hash codes of its entries, so it is order-independent.',
        r'''// HashMap equals / clone: same pairs means equal
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HashMapEqualsDemo {
    public static void main(String[] args) {
        Map<String, Integer> a = new HashMap<>(Map.of("Pune", 20, "Mumbai", 22));
        Map<String, Integer> b = new TreeMap<>(Map.of("Mumbai", 22, "Pune", 20));    // other class, other order
        Map<String, Integer> c = new HashMap<>(Map.of("Pune", 20, "Mumbai", 99));

        System.out.println("a.equals(b): " + a.equals(b));           // same pairs
        System.out.println("a.equals(c): " + a.equals(c));           // different value for Mumbai

        @SuppressWarnings("unchecked")
        Map<String, Integer> copy = (HashMap<String, Integer>) ((HashMap<String, Integer>) a).clone();
        copy.put("Delhi", 11);
        System.out.println("original: " + new TreeMap<>(a));
        System.out.println("copy    : " + new TreeMap<>(copy));
    }
}
''' + OUT),
    method(
        'Map.of, Map.entry, Map.ofEntries and Map.copyOf', 'Map.of(k1, v1, ...);  Map.entry(k, v);  Map.ofEntries(...);  Map.copyOf(map)', 'an immutable map / entry', 'O(n)',
        'Create small <strong>immutable</strong> maps quickly. <code>Map.of</code> takes up to 10 key-value pairs; <code>Map.ofEntries(Map.entry(...), ...)</code> takes any number; <code>Map.copyOf</code> makes an immutable copy. They reject <code>null</code> and duplicate keys, and any change throws <code>UnsupportedOperationException</code>.',
        'Their iteration order is deliberately randomised per JVM run. Wrap with <code>new HashMap&lt;&gt;(Map.of(...))</code> when you need a modifiable map, as in the other examples of this page.',
        r'''// Map.of / Map.entry / Map.ofEntries / Map.copyOf: immutable maps
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class HashMapImmutableDemo {
    public static void main(String[] args) {
        Map<String, Integer> small = Map.of("Pune", 20, "Mumbai", 22);
        Map<String, Integer> many = Map.ofEntries(
                Map.entry("Delhi", 11), Map.entry("Chennai", 44), Map.entry("Kochi", 484));

        try {
            small.put("Nagpur", 712);
        } catch (UnsupportedOperationException e) {
            System.out.println("Map.of is immutable");
        }
        try {
            Map.of("Pune", 20, "Pune", 2020);
        } catch (IllegalArgumentException e) {
            System.out.println("Duplicate key rejected: " + e.getMessage());
        }

        Map<String, Integer> editable = new HashMap<>(small);       // a modifiable copy
        editable.putAll(many);
        System.out.println(new TreeMap<>(editable));
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'How HashMap works inside',
        'Everything in the tables above follows from a few ideas.',
        [
            '<strong>Storage:</strong> an array of buckets, <code>Node&lt;K,V&gt;[] table</code>, whose length is always a <strong>power of two</strong> (default 16). Each <code>Node</code> holds <code>hash</code>, <code>key</code>, <code>value</code> and <code>next</code>.',
            '<strong>Hash:</strong> <code>h = key.hashCode()</code>, then <code>h ^ (h &gt;&gt;&gt; 16)</code> to mix the high bits into the low bits. A <code>null</code> key always hashes to 0 (bucket 0).',
            '<strong>Index:</strong> <code>index = (n - 1) &amp; hash</code>, which is a fast way of writing <code>hash % n</code> for a power-of-two n.',
            '<strong>put:</strong> if the bucket is empty the node goes in. Otherwise Java compares each node: same hash and (same reference or <code>equals</code>) means "same key, replace value"; if no node matches, the new node is appended to the bucket\'s chain.',
            '<strong>Treeify:</strong> when a chain reaches <strong>8</strong> nodes and the table has at least <strong>64</strong> buckets, the chain becomes a red-black tree (O(log n) lookup in a crowded bucket). With fewer buckets, the table is resized instead. A tree shrinks back to a list at 6 nodes.',
            '<strong>Resize:</strong> when <code>size &gt; threshold</code> (<code>capacity x loadFactor</code> = 12 for the default), the table <strong>doubles</strong> and nodes are redistributed. Because the size doubles, each node either stays at its index or moves by exactly the old capacity.',
            '<strong>Lazy:</strong> the table is created on the first <code>put</code>. <code>new HashMap&lt;&gt;(n)</code> rounds n up to a power of two (<code>tableSizeFor</code>).',
            '<strong>Iteration cost</strong> is O(capacity + size) because it scans all buckets.',
            '<strong>Not thread-safe:</strong> concurrent resizes can lose entries (and in old JDKs loop forever). Use <code>ConcurrentHashMap</code>.',
        ],
    ),
    (
        '<h3>Time complexity summary</h3>\n'
        + table(['Operation', 'Average', 'Worst case', 'Note'], [
            ['get, put, remove, containsKey', 'O(1)', 'O(log n) (O(n) before Java 8)', 'Worst case when many keys share one bucket'],
            ['containsValue', 'O(n)', 'O(n)', 'Scans every entry'],
            ['Iteration over keys / values / entries', 'O(capacity + n)', 'O(capacity + n)', 'Scans all buckets'],
            ['Resize', 'O(n)', 'O(n)', 'Happens rarely; amortised O(1) per put'],
        ]),
        [],
    ),
    (
        '<h3>Trap: keys need equals() and hashCode(); never mutate a key</h3>\n'
        + ul([
            'A key without <code>hashCode</code>/<code>equals</code> is compared by identity, so a "new equal" key does not find the value.',
            'If you change a field used by <code>hashCode</code> after the key is in the map, the entry sits in the wrong bucket and can no longer be found.',
            '<strong>Immutable keys</strong> (String, Integer, enums, records) avoid both problems.',
        ]),
        [r'''// HashMap keys: identity keys, record keys and a mutated key
import java.util.HashMap;
import java.util.Map;

public class HashMapKeyTrapDemo {
    static class PlainKey {                                  // no equals / hashCode: identity only
        final String name;
        PlainKey(String name) { this.name = name; }
    }

    record RecordKey(String name) { }                        // equals / hashCode generated

    static class MutableKey {
        String name;
        MutableKey(String name) { this.name = name; }
        @Override public boolean equals(Object o) { return o instanceof MutableKey k && k.name.equals(name); }
        @Override public int hashCode() { return name.hashCode(); }
    }

    public static void main(String[] args) {
        Map<PlainKey, Integer> plain = new HashMap<>();
        plain.put(new PlainKey("Raigad"), 6);
        System.out.println("Plain key (new equal key)  : " + plain.get(new PlainKey("Raigad")));

        Map<RecordKey, Integer> records = new HashMap<>();
        records.put(new RecordKey("Raigad"), 6);
        System.out.println("Record key (new equal key) : " + records.get(new RecordKey("Raigad")));

        Map<MutableKey, Integer> mutable = new HashMap<>();
        MutableKey key = new MutableKey("Raigad");
        mutable.put(key, 6);
        key.name = "Rajgad";                                  // the hash code changed after insertion
        System.out.println("Mutated key lookup        : " + mutable.get(key));
        System.out.println("Entries still in the map  : " + mutable.size());
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example 1: word frequency</h3>\n<p>The most common HashMap job: count how often each item appears, then show the result sorted.</p>',
        [r'''// Word frequency with merge(), sorted by count
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HashMapFrequencyDemo {
    public static void main(String[] args) {
        String text = "raigad torna raigad purandar torna raigad lohagad";
        Map<String, Integer> counts = new HashMap<>();
        for (String word : text.split(" ")) {
            counts.merge(word, 1, Integer::sum);
        }

        List<Map.Entry<String, Integer>> entries = new ArrayList<>(counts.entrySet());
        entries.sort(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()));

        for (Map.Entry<String, Integer> entry : entries) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example 2: a lookup cache</h3>\n<p>Store the result of a slow calculation so the second request for the same key is instant. <code>computeIfAbsent</code> runs the calculation only once per key.</p>',
        [r'''// A simple cache with computeIfAbsent()
import java.util.HashMap;
import java.util.Map;

public class HashMapCacheDemo {
    static int calculations = 0;

    static int slowTrekHours(String fort) {                  // pretend this is an expensive calculation
        calculations++;
        return fort.length();
    }

    public static void main(String[] args) {
        Map<String, Integer> cache = new HashMap<>();

        for (String fort : new String[] {"Raigad", "Torna", "Raigad", "Raigad", "Torna"}) {
            int hours = cache.computeIfAbsent(fort, HashMapCacheDemo::slowTrekHours);
            System.out.println(fort + " -> " + hours);
        }
        System.out.println("Expensive calculations performed: " + calculations);   // only 2 for 5 requests
    }
}
''' + OUT],
    ),
    (
        '<h3>HashMap versus other Map classes</h3>\n'
        + table(['', 'HashMap', 'LinkedHashMap', 'TreeMap', 'Hashtable', 'ConcurrentHashMap'], [
            ['Order', 'None', 'Insertion (or access)', 'Sorted by key', 'None', 'None'],
            ['get / put', 'O(1)', 'O(1)', 'O(log n)', 'O(1)', 'O(1)'],
            ['null key / value', 'One / many', 'One / many', 'No / yes', 'No / No', 'No / No'],
            ['Thread-safe', 'No', 'No', 'No', 'Yes (whole-table lock)', '<strong>Yes</strong> (fine-grained)'],
            ['Use for', '<strong>Default map</strong>', 'Predictable order, LRU caches', 'Sorted keys, range queries', 'Legacy', 'Shared between threads'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Habits for correct and fast maps.',
        [
            'Declare as <code>Map&lt;K, V&gt;</code>.',
            'Use immutable keys and always override <code>equals</code> and <code>hashCode</code> together (or use a <code>record</code>).',
            'Use <code>getOrDefault</code>, <code>merge</code>, <code>computeIfAbsent</code> and <code>putIfAbsent</code> instead of "get, check, put".',
            'Iterate with <code>entrySet()</code> (or <code>forEach</code>) when you need both key and value.',
            'Pre-size big maps: <code>HashMap.newHashMap(expected)</code> (Java 19+) or <code>new HashMap&lt;&gt;((int) (expected / 0.75f) + 1)</code>.',
            'Do not rely on iteration order; choose <code>LinkedHashMap</code> or <code>TreeMap</code> when you need one.',
            'Use <code>ConcurrentHashMap</code> for shared maps, not <code>HashMap</code> and not <code>Hashtable</code>.',
            'Do not use a mutable collection as a key.',
        ],
    ),
]

QA = [
    ('How does HashMap work internally?',
     'It keeps an array of buckets (power-of-two size). The key hash is spread (h ^ h>>>16), the bucket index is (n-1)&hash, and entries in the same bucket form a linked list that becomes a red-black tree when it reaches 8 nodes (table >= 64). When size exceeds capacity x load factor the table doubles.'),
    ('What is the default capacity and load factor?',
     '16 buckets and 0.75, so the first resize happens when the 13th entry is added.'),
    ('What happens when two keys have the same hash code?',
     'They go to the same bucket; equals() decides whether they are the same key (replace value) or different keys (both stored in the chain/tree).'),
    ('What does put() return?',
     'The previous value for the key, or null if the key was new (or its value was null).'),
    ('Why must equals() and hashCode() be overridden together for keys?',
     'HashMap finds the bucket with hashCode and the entry with equals. If equal keys can have different hash codes, lookups look in the wrong bucket and fail.'),
    ('Can HashMap have null keys or values?',
     'One null key (stored in bucket 0) and any number of null values. Hashtable and ConcurrentHashMap allow neither.'),
    ('HashMap vs Hashtable?',
     'HashMap is unsynchronized, allows one null key and null values, and is faster; Hashtable is a legacy synchronized class that allows no nulls. Use ConcurrentHashMap for thread safety.'),
    ('HashMap vs LinkedHashMap vs TreeMap?',
     'HashMap: no order, O(1). LinkedHashMap: insertion or access order, O(1). TreeMap: sorted by key, O(log n), supports navigation.'),
    ('What is the difference between getOrDefault and putIfAbsent?',
     'getOrDefault only reads and returns the default without storing it; putIfAbsent stores the value when the key has none.'),
    ('How do you count occurrences with a HashMap?',
     'map.merge(item, 1, Integer::sum) (or compute with a null check).'),
    ('How do you iterate a HashMap?',
     'entrySet() with for-each (best when you need keys and values), keySet(), values(), or forEach((k, v) -> ...).'),
    ('Why does HashMap throw ConcurrentModificationException?',
     'Its iterators are fail-fast: they compare modCount with the value seen at creation, so structural changes during iteration (other than through the iterator) are detected.'),
    ('How can HashMap lose data in multi-threaded code?',
     'Concurrent puts and resizes can overwrite each other or corrupt the table. Use ConcurrentHashMap or external synchronization.'),
    ('What is treeification?',
     'When a bucket holds 8 or more nodes and the table has at least 64 buckets, the linked list is replaced by a red-black tree to keep worst-case lookups at O(log n).'),
    ('Which is faster for a mostly-read lookup of a million entries: HashMap or TreeMap?',
     'HashMap (O(1) average versus O(log n)), unless you need sorted order or range queries.'),
]

TOPIC = dict(id='hashmap', name='HashMap', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
