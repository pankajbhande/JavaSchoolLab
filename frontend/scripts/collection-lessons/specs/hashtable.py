"""Hashtable lesson: the legacy synchronized map. Every method has a runnable sample.
Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a Hashtable?',
        '<strong>Hashtable</strong> is the <strong>original (Java 1.0) key-value store</strong>. It works like a HashMap but every method is <strong>synchronized</strong>, and it refuses <code>null</code> keys and values. '
        'Today it is a <strong>legacy class</strong>: you will meet it in old code and interviews, but new code should use <code>HashMap</code> (single thread) or <code>ConcurrentHashMap</code> (many threads).',
        [
            'Package <code>java.util</code>. Extends the old <code>Dictionary</code> class and implements <code>Map</code>.',
            '<strong>Thread-safe</strong>: each method locks the whole table, so only one thread works at a time.',
            '<strong>No null key and no null value</strong>: <code>put(null, x)</code> and <code>put(k, null)</code> throw <code>NullPointerException</code>.',
            '<strong>No guaranteed order</strong>, and it iterates in a different order from HashMap.',
            'Default capacity <strong>11</strong>, load factor <strong>0.75</strong>, grows to <code>2 * old + 1</code>.',
            'Index = <code>(hash &amp; 0x7FFFFFFF) % table.length</code>. Buckets are plain linked lists (no tree conversion).',
            'Legacy extras: <code>keys()</code>, <code>elements()</code> (Enumeration) and <code>contains()</code>.',
        ],
    ),
    (
        '<h3>Where Hashtable sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Map', 'I', True, None, G), ('Dictionary', 'c', False, None, B), ('Hashtable', 'c', False, 'extends Dictionary, implements Map', G),
        ])
        + '\n<p>(I) = interface, (c) = class. <code>Properties</code> extends Hashtable and is used for configuration files.</p>',
        [],
    ),
    (
        '<h3>Creating a Hashtable: four constructors</h3>\n'
        + ul([
            '<code>new Hashtable&lt;&gt;()</code>: capacity 11, load factor 0.75.',
            '<code>new Hashtable&lt;&gt;(int capacity)</code>: chosen start size.',
            '<code>new Hashtable&lt;&gt;(int capacity, float loadFactor)</code>: both chosen.',
            '<code>new Hashtable&lt;&gt;(Map m)</code>: copy of another map.',
        ]),
        [r'''// Hashtable constructors and the first put / get
import java.util.Hashtable;
import java.util.Map;

public class HashtableCreateDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> trekHours = new Hashtable<>();             // empty
        trekHours.put("Raigad", 6);
        trekHours.put("Torna", 5);
        trekHours.put("Lohagad", 2);

        Hashtable<String, Integer> sized = new Hashtable<>(50, 0.5f);          // capacity 50, load factor 0.5
        Hashtable<String, Integer> copy = new Hashtable<>(Map.of("Panhala", 4));  // copy of a map

        System.out.println("Size    : " + trekHours.size());
        System.out.println("get     : " + trekHours.get("Torna"));
        System.out.println("sized   : " + sized.isEmpty() + ", copy: " + copy);
    }
}
''' + OUT],
    ),
    (
        '<h3>All Hashtable methods at a glance</h3>\n<p>Every method is <code>synchronized</code>.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>put(k, v)</strong>', 'Add or replace a pair (no nulls)', 'O(1) average'],
            ['<strong>get(k)</strong>', 'Value for a key, or null if absent', 'O(1) average'],
            ['<strong>remove(k)</strong>', 'Delete a key and return its value', 'O(1) average'],
            ['<strong>containsKey(k)</strong>', 'Is the key present?', 'O(1) average'],
            ['<strong>containsValue(v)</strong> / <strong>contains(v)</strong>', 'Is the value present? (the same thing)', 'O(n)'],
            ['<strong>size()</strong> / <strong>isEmpty()</strong> / <strong>clear()</strong>', 'Count, emptiness check, delete all', 'O(1) / O(n)'],
            ['<strong>putIfAbsent, getOrDefault, replace, merge, compute...</strong>', 'Java 8 Map methods (atomic here)', 'O(1) average'],
            ['<strong>keys()</strong> / <strong>elements()</strong>', 'Legacy Enumeration of keys / values', 'O(1) to create'],
            ['<strong>keySet() / values() / entrySet()</strong>', 'Live views for loops', 'O(n)'],
            ['<strong>putAll(map)</strong> / <strong>clone()</strong>', 'Copy pairs / shallow copy', 'O(n)'],
            ['<strong>equals / hashCode / toString</strong>', 'Compare and print', 'O(n)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Adding and reading', 'The basic methods, with the null rules that set Hashtable apart.'),
    method(
        'put(K key, V value)', 'V put(K key, V value)', 'the old value, or <code>null</code> for a new key', 'O(1) average',
        'Stores the pair. Putting an existing key <strong>replaces</strong> its value and returns the old one. <strong>Neither the key nor the value may be null</strong>.',
        'It locks the whole table. The key must implement <code>hashCode</code> and <code>equals</code> correctly. A null key fails at <code>key.hashCode()</code>; a null value is explicitly rejected.',
        r'''// Hashtable put(K, V): adds or replaces a pair
import java.util.Hashtable;

public class HashtablePutDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();

        heights.put("Raigad", 820);
        heights.put("Raigad", 900);   // same key: value replaced

        System.out.println(heights);
    }
}
''' + OUT, extra_codes=(r'''// Hashtable put(): null keys and values are not allowed
import java.util.Hashtable;

public class HashtableNullDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();

        try {
            heights.put("Raigad", null);   // not allowed
        } catch (NullPointerException e) {
            System.out.println("null is not allowed");
        }
    }
}
''' + OUT,)),
    method(
        'get(Object key), getOrDefault and containsKey', 'V get(Object key);  V getOrDefault(Object key, V default);  boolean containsKey(Object key)', 'the value / default / boolean', 'O(1) average',
        '<code>get</code> returns the value for a key or <code>null</code> when it is absent. Because values can never be null, <strong>null always means "no such key"</strong>: a small advantage over HashMap.',
        '<code>getOrDefault</code> avoids the null check. <code>get(null)</code> throws <code>NullPointerException</code>.',
        r'''// Hashtable get(Object key): reads a value by key
import java.util.Hashtable;

public class HashtableGetDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.get("Raigad"));   // 820
        System.out.println(heights.get("Delhi"));    // null: not found
    }
}
''' + OUT, extra_codes=(r'''// Hashtable getOrDefault(key, default): a value, or our own default
import java.util.Hashtable;

public class HashtableGetOrDefaultDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.getOrDefault("Delhi", 0));   // 0
    }
}
''' + OUT, r'''// Hashtable containsKey(Object key): is the key present?
import java.util.Hashtable;

public class HashtableContainsKeyDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.containsKey("Raigad"));   // true
    }
}
''' + OUT,)),
    method(
        'remove(Object key), size(), isEmpty() and clear()', 'V remove(Object key);  boolean remove(Object key, Object value);  int size();  boolean isEmpty();  void clear()', 'old value / boolean / count', 'O(1) average',
        '<code>remove(key)</code> deletes a pair and returns the old value (or null). The two-argument form deletes only when the value also matches. <code>clear()</code> empties the table.',
        'After <code>clear()</code> the internal array keeps its size; only the entries go.',
        r'''// Hashtable remove(Object key): removes a pair
import java.util.Hashtable;

public class HashtableRemoveDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        heights.remove("Raigad");

        System.out.println(heights);
    }
}
''' + OUT, extra_codes=(r'''// Hashtable size() and isEmpty()
import java.util.Hashtable;

public class HashtableSizeDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.size());       // 2
        System.out.println(heights.isEmpty());    // false
    }
}
''' + OUT, r'''// Hashtable clear(): removes everything
import java.util.Hashtable;

public class HashtableClearDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        heights.clear();

        System.out.println(heights);
    }
}
''' + OUT,)),
    method(
        'containsValue(Object) and contains(Object)', 'boolean containsValue(Object value);  boolean contains(Object value)', 'boolean', 'O(n)',
        'Both ask "does any pair have this value?". <code>contains</code> is the legacy name and does <strong>exactly the same</strong> as <code>containsValue</code>.',
        'It scans every bucket, so it is slow on big tables. Beware: <code>contains</code> checks <em>values</em>, not keys, which surprises people used to <code>Collection.contains</code>.',
        r'''// Hashtable containsValue(Object value): is the value present?
import java.util.Hashtable;

public class HashtableContainsValueDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.containsValue(820));   // true
    }
}
''' + OUT, extra_codes=(r'''// Hashtable contains(Object value): the old name for containsValue
import java.util.Hashtable;

public class HashtableContainsDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.contains(820));   // true
    }
}
''' + OUT,)),

    section('Java 8 methods', 'The same atomic helpers as HashMap, and in Hashtable each one is also synchronized.'),
    method(
        'putIfAbsent, replace, merge and computeIfAbsent', 'V putIfAbsent(K, V);  V replace(K, V);  V merge(K, V, BiFunction);  V computeIfAbsent(K, Function)', 'the previous / new value', 'O(1) average',
        '<code>putIfAbsent</code> adds only a missing key; <code>replace</code> changes only an existing key; <code>merge</code> combines the old and new value (word counts, totals); <code>computeIfAbsent</code> builds a value only when the key is absent.',
        'In a Hashtable each of these runs under the table lock, so the check-and-act sequence is atomic. That is a real benefit, but <code>ConcurrentHashMap</code> gives the same safety with far less blocking.',
        r'''// Hashtable putIfAbsent(K, V): adds only if the key is missing
import java.util.Hashtable;

public class HashtablePutIfAbsentDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        heights.putIfAbsent("Raigad", 1);   // key exists: ignored
        heights.putIfAbsent("Sinhagad", 1300);

        System.out.println(heights);
    }
}
''' + OUT, extra_codes=(r'''// Hashtable replace(K, V): changes the value of an existing key
import java.util.Hashtable;

public class HashtableReplaceDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        heights.replace("Raigad", 900);

        System.out.println(heights.get("Raigad"));
    }
}
''' + OUT, r'''// Hashtable merge(K, V, function): combine with the old value
import java.util.Hashtable;

public class HashtableMergeDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        heights.merge("Raigad", 10, Integer::sum);   // 820 + 10

        System.out.println(heights.get("Raigad"));
    }
}
''' + OUT,)),

    section('Looping', 'Three ways: the modern views, forEach, and the legacy Enumeration.'),
    method(
        'keySet(), values(), entrySet() and forEach()', 'Set<K> keySet();  Collection<V> values();  Set<Map.Entry<K, V>> entrySet();  void forEach(BiConsumer)', 'live views', 'O(n)',
        'Loop over the keys, the values, or the pairs. The views are <strong>live</strong>: removing through them removes from the table.',
        'The order is not insertion order and not the same as a HashMap\'s. These iterators are <strong>fail-fast</strong> (as in HashMap), so changing the table inside a for-each throws <code>ConcurrentModificationException</code>.',
        r'''// Hashtable entrySet(): key and value together
import java.util.Hashtable;
import java.util.Map;

public class HashtableEntrySetDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        for (Map.Entry<String, Integer> e : heights.entrySet()) {
            System.out.println(e.getKey() + " = " + e.getValue());
        }
    }
}
''' + OUT, extra_codes=(r'''// Hashtable keySet() and values(): only keys, only values
import java.util.Hashtable;

public class HashtableKeySetDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        System.out.println(heights.keySet());
        System.out.println(heights.values());
    }
}
''' + OUT, r'''// Hashtable forEach(): does something with every pair
import java.util.Hashtable;

public class HashtableForEachDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        heights.forEach((fort, h) -> System.out.println(fort + " = " + h));
    }
}
''' + OUT,)),
    method(
        'keys() and elements() (legacy Enumeration)', 'Enumeration<K> keys();  Enumeration<V> elements()', 'an <code>Enumeration</code>', 'O(1) to create',
        'The Java 1.0 way to loop. An <code>Enumeration</code> has just <code>hasMoreElements()</code> and <code>nextElement()</code>. You will see it in old code.',
        'Unlike an <code>Iterator</code>, an Enumeration has <strong>no remove()</strong> and is <strong>not fail-fast</strong>. Prefer <code>keySet()</code> and <code>entrySet()</code> in new code.',
        r'''// Hashtable keys(): all keys as an Enumeration
import java.util.Enumeration;
import java.util.Hashtable;

public class HashtableKeysDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        Enumeration<String> keys = heights.keys();
        while (keys.hasMoreElements()) {
            System.out.println(keys.nextElement());
        }
    }
}
''' + OUT, extra_codes=(r'''// Hashtable elements(): all values as an Enumeration
import java.util.Enumeration;
import java.util.Hashtable;

public class HashtableElementsDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        Enumeration<Integer> values = heights.elements();
        while (values.hasMoreElements()) {
            System.out.println(values.nextElement());
        }
    }
}
''' + OUT,)),
    method(
        'putAll(Map), clone, equals and toString', 'void putAll(Map);  Object clone();  boolean equals(Object);  String toString()', 'copy / comparison / text', 'O(n)',
        '<code>putAll</code> copies all pairs from another map, <code>clone</code> makes a shallow copy, <code>equals</code> compares the pairs, <code>toString</code> prints <code>{k=v, ...}</code>.',
        'A clone copies the table but <strong>shares the key and value objects</strong>. Two maps are equal when they hold the same pairs, whatever their class.',
        r'''// Hashtable putAll(Map m): adds many pairs at once
import java.util.Hashtable;
import java.util.Map;

public class HashtablePutAllDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();

        heights.putAll(Map.of("Raigad", 820, "Torna", 1400));

        System.out.println(heights.size());   // 2
    }
}
''' + OUT, extra_codes=(r'''// Hashtable clone(): makes a copy
import java.util.Hashtable;

public class HashtableCloneDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        Object copy = heights.clone();

        System.out.println(copy.equals(heights));   // true
    }
}
''' + OUT, r'''// Hashtable equals(): same pairs means equal
import java.util.Hashtable;

public class HashtableEqualsDemo {
    public static void main(String[] args) {
        Hashtable<String, Integer> heights = new Hashtable<>();
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);

        Hashtable<String, Integer> other = new Hashtable<>(heights);

        System.out.println(heights.equals(other));   // true
    }
}
''' + OUT,)),
    (
        '<h3>Master program: every Hashtable method in one place</h3>\n'
        '<p>One single program that uses all the Hashtable methods you learned above, step by step. Read the numbered comments from top to bottom, run it, and match each output line with its step.</p>',
        [r'''// MASTER PROGRAM: all important Hashtable methods in one program
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Map;

public class HashtableMasterDemo {
    public static void main(String[] args) {
        // 1. Create an empty Hashtable
        Hashtable<String, Integer> heights = new Hashtable<>();

        // 2. put, putAll, putIfAbsent
        heights.put("Raigad", 820);
        heights.put("Torna", 1400);
        heights.putAll(Map.of("Sinhagad", 1300));
        heights.putIfAbsent("Purandar", 1200);
        System.out.println("2. size            : " + heights.size());

        // 3. Hashtable does not allow null keys or values
        try {
            heights.put("Lohagad", null);
        } catch (NullPointerException e) {
            System.out.println("3. null is not allowed");
        }

        // 4. get, getOrDefault, containsKey, containsValue, contains
        System.out.println("4. get             : " + heights.get("Raigad"));
        System.out.println("   getOrDefault    : " + heights.getOrDefault("Panhala", 0));
        System.out.println("   containsKey     : " + heights.containsKey("Torna"));
        System.out.println("   containsValue   : " + heights.containsValue(820));
        System.out.println("   contains (old)  : " + heights.contains(820));

        // 5. replace and merge
        heights.replace("Raigad", 900);
        heights.merge("Raigad", 10, Integer::sum);
        System.out.println("5. Raigad          : " + heights.get("Raigad"));

        // 6. Loop: entrySet, keySet, values, forEach
        System.out.println("6. keys count      : " + heights.keySet().size());
        System.out.println("   values count    : " + heights.values().size());
        for (Map.Entry<String, Integer> e : heights.entrySet()) {
            if (e.getValue() > 1300) {
                System.out.println("   tall: " + e.getKey());
            }
        }
        heights.forEach((fort, h) -> { });

        // 7. Old way to loop: keys() and elements() return an Enumeration
        Enumeration<String> keys = heights.keys();
        int count = 0;
        while (keys.hasMoreElements()) {
            keys.nextElement();
            count++;
        }
        System.out.println("7. keys counted    : " + count);

        // 8. clone and equals
        Object copy = heights.clone();
        System.out.println("8. equals clone    : " + heights.equals(copy));

        // 9. remove, isEmpty, clear
        heights.remove("Purandar");
        System.out.println("9. size after remove: " + heights.size());
        heights.clear();
        System.out.println("   isEmpty         : " + heights.isEmpty());
    }
}
''' + OUT],
    ),
]

EXPERT = [
    section(
        'How Hashtable works inside',
        'The structure is the one HashMap started from.',
        [
            'An array of <code>Entry</code> nodes; each bucket is a <strong>singly linked list</strong> (never converted to a tree, unlike HashMap since Java 8).',
            'Bucket index = <code>(key.hashCode() &amp; 0x7FFFFFFF) % table.length</code>. The modulo works on any size, so the default is the prime-ish number <strong>11</strong>, not a power of two.',
            'Rehash when <code>count &gt;= threshold</code> (capacity x 0.75): new length = <code>old * 2 + 1</code>, and every entry is re-linked.',
            'New entries are inserted at the <strong>head</strong> of the bucket list.',
            '<strong>Locking</strong>: every public method is <code>synchronized</code> on the table itself. Reads block writes and other reads, so a busy table becomes a bottleneck.',
            'Because <code>hashCode()</code> is called on the key without a null check, a null key throws NPE.',
        ],
    ),
    (
        '<h3>Trap: a synchronized table is not a synchronized program</h3>\n'
        + ul([
            'Each method is atomic, but a <strong>check-then-act sequence made of two methods is not</strong>: another thread can slip in between <code>containsKey</code> and <code>put</code>.',
            'Use the atomic methods (<code>putIfAbsent</code>, <code>merge</code>, <code>computeIfAbsent</code>) or hold your own lock around the whole sequence.',
        ]),
        [r'''// Two synchronized calls in a row are still a race; one atomic call is safe
import java.util.Hashtable;

public class HashtableRaceDemo {
    public static void main(String[] args) throws InterruptedException {
        Hashtable<String, Integer> racy = new Hashtable<>();
        Hashtable<String, Integer> safe = new Hashtable<>();
        racy.put("Pune", 0);
        safe.put("Pune", 0);

        Runnable unsafeTask = () -> {
            for (int i = 0; i < 20000; i++) {
                racy.put("Pune", racy.get("Pune") + 1);          // get then put: not atomic
            }
        };
        Runnable safeTask = () -> {
            for (int i = 0; i < 20000; i++) {
                safe.merge("Pune", 1, Integer::sum);             // one atomic step
            }
        };
        Thread a = new Thread(unsafeTask), b = new Thread(unsafeTask);
        Thread c = new Thread(safeTask), d = new Thread(safeTask);
        a.start(); b.start(); c.start(); d.start();
        a.join(); b.join(); c.join(); d.join();

        System.out.println("Expected 40000");
        System.out.println("safe (merge) : " + safe.get("Pune"));
        System.out.println("racy lost updates: " + (racy.get("Pune") < 40000));
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example: loading configuration with Properties</h3>\n<p><code>Properties</code> extends Hashtable and holds <strong>String to String</strong> settings, with a default value for missing keys.</p>',
        [r'''// Properties (a Hashtable) used for simple settings
import java.util.Properties;

public class HashtablePropertiesDemo {
    public static void main(String[] args) {
        Properties settings = new Properties();
        settings.setProperty("fort", "Raigad");
        settings.setProperty("trekHours", "6");

        String fort = settings.getProperty("fort");
        int hours = Integer.parseInt(settings.getProperty("trekHours"));
        String city = settings.getProperty("city", "Pune");          // default when the key is missing

        System.out.println("Fort  : " + fort);
        System.out.println("Hours : " + hours);
        System.out.println("City  : " + city);
        System.out.println("Is a Hashtable: " + (settings instanceof java.util.Hashtable));
    }
}
''' + OUT],
    ),
    (
        '<h3>Hashtable versus HashMap versus ConcurrentHashMap versus synchronizedMap</h3>\n'
        + table(['', 'Hashtable', 'HashMap', 'ConcurrentHashMap', 'Collections.synchronizedMap'], [
            ['Thread-safe', '<strong>Yes</strong> (whole-table lock)', 'No', '<strong>Yes</strong> (fine-grained / lock-free reads)', 'Yes (one lock)'],
            ['null key', 'No', 'One', 'No', 'Depends on the wrapped map'],
            ['null value', 'No', 'Yes', 'No', 'Depends on the wrapped map'],
            ['Speed (many threads)', 'Slow', 'Fastest (single thread)', '<strong>Fast</strong>', 'Slow'],
            ['Bucket structure', 'Linked list', 'List then tree', 'List then tree', 'As wrapped'],
            ['Default capacity', '11', '16', '16', 'As wrapped'],
            ['Status', '<strong>Legacy</strong>', 'Current', 'Current', 'Current'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Know Hashtable, but do not choose it for new code.',
        [
            'Single thread: <code>HashMap</code>. Many threads: <code>ConcurrentHashMap</code>.',
            'Keep Hashtable only when an old API forces it (for example <code>Properties</code> or an older library).',
            'Never rely on a particular iteration order.',
            'Do not combine <code>containsKey</code> and <code>put</code> to "add if missing": use <code>putIfAbsent</code>.',
            'Do not modify a table while looping over it (fail-fast).',
        ],
    ),
]

QA = [
    ('What is a Hashtable?',
     'A legacy (Java 1.0) synchronized hash-based Map. It allows no null keys or values and has no guaranteed order.'),
    ('Difference between HashMap and Hashtable?',
     'Hashtable is synchronized (slow), forbids null keys and values, is legacy and extends Dictionary; HashMap is not synchronized, allows one null key and many null values, is faster and uses tree bins for long collision chains.'),
    ('Why does Hashtable not allow null?',
     'A null key fails on key.hashCode(); a null value is rejected so that get() returning null can only mean "key absent", which is safe to use in multi-threaded code.'),
    ('Is Hashtable thread-safe? Is that enough?',
     'Each method is, but compound actions such as containsKey then put are not atomic. Use putIfAbsent / merge / computeIfAbsent or external locking.'),
    ('What is the default capacity and growth of Hashtable?',
     'Capacity 11, load factor 0.75, new capacity = old * 2 + 1.'),
    ('How is the bucket index computed?',
     '(hashCode & 0x7FFFFFFF) % table.length. HashMap instead spreads the hash and uses (n - 1) & hash on a power-of-two table.'),
    ('Hashtable vs ConcurrentHashMap?',
     'ConcurrentHashMap locks only parts of the table (CAS and per-bin locks), reads are non-blocking and it scales; Hashtable locks the whole table for every call.'),
    ('What is the difference between Enumeration and Iterator?',
     'Enumeration is the legacy read-only cursor without remove() and without fail-fast behaviour; Iterator can remove and is fail-fast.'),
    ('What is Properties?',
     'A subclass of Hashtable for String to String settings, with getProperty(key, default), and load/store for .properties files.'),
    ('Is Hashtable ordered?',
     'No. Use LinkedHashMap for insertion order or TreeMap for sorted order.'),
    ('How do you make a HashMap thread-safe?',
     'Use ConcurrentHashMap (preferred) or wrap with Collections.synchronizedMap.'),
]

TOPIC = dict(id='hashtable', name='Hashtable', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
