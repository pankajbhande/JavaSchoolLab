"""Internal working of HashSet: it is a HashMap in disguise. Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

BEGINNER = [
    section(
        'The big idea: a HashSet is a HashMap',
        'A <strong>HashSet does not have its own storage</strong>. Inside it holds a <strong>HashMap</strong>; every element you add becomes a <strong>key</strong> of that map, and the value is always the same dummy object. '
        'So "a Set has no duplicates" is really "a Map has no duplicate keys".',
        [
            'Field: <code>private transient HashMap&lt;E, Object&gt; map;</code>',
            'Field: <code>private static final Object PRESENT = new Object();</code> (the shared dummy value)',
            '<code>add(e)</code> is <code>map.put(e, PRESENT) == null</code>: it returns <strong>true</strong> only if the key was new.',
            '<code>contains(e)</code> is <code>map.containsKey(e)</code>; <code>remove(e)</code> is <code>map.remove(e) == PRESENT</code>.',
            'Everything you learnt about HashMap (buckets, collisions, resize, treeification) applies unchanged. See <em>Internal Working of HashMap</em>.',
        ],
    ),
    (
        '<h3>What each HashSet method really calls</h3>\n'
        + table(['HashSet method', 'Does this inside', 'Time'], [
            ['<code>add(e)</code>', '<code>map.put(e, PRESENT) == null</code>', 'O(1) average'],
            ['<code>contains(o)</code>', '<code>map.containsKey(o)</code>', 'O(1) average'],
            ['<code>remove(o)</code>', '<code>map.remove(o) == PRESENT</code>', 'O(1) average'],
            ['<code>size()</code>', '<code>map.size()</code>', 'O(1)'],
            ['<code>isEmpty()</code>', '<code>map.isEmpty()</code>', 'O(1)'],
            ['<code>clear()</code>', '<code>map.clear()</code>', 'O(capacity)'],
            ['<code>iterator()</code>', '<code>map.keySet().iterator()</code>', 'O(1) to start'],
        ]),
        [r'''// A HashSet and a HashMap behave the same way for duplicates
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class SetIsMapDemo {
    public static void main(String[] args) {
        Set<String> set = new HashSet<>();
        System.out.println("set.add(Raigad)  : " + set.add("Raigad"));         // true: new
        System.out.println("set.add(Raigad)  : " + set.add("Raigad"));         // false: duplicate

        Map<String, Object> map = new HashMap<>();
        Object present = new Object();
        System.out.println("map.put(Torna) == null : " + (map.put("Torna", present) == null));
        System.out.println("map.put(Torna) == null : " + (map.put("Torna", present) == null));
    }
}
''' + OUT],
    ),
]

INTERMEDIATE = [
    section('A HashSet built by hand', 'Wrapping a HashMap gives you a complete HashSet in a few lines.'),
    method(
        'MiniHashSet: add, contains, remove', 'class MiniHashSet&lt;E&gt; { private final HashMap&lt;E, Object&gt; map; }', 'a working set', 'O(1) average',
        'This is almost exactly the real source of <code>java.util.HashSet</code>. The three core methods are one-line calls to the map; the shared <code>PRESENT</code> object saves memory because no per-element value is created.',
        'The real class has the same shape. Its constructors only differ in the capacity and load factor they pass to the backing map.',
        r'''// MiniHashSet: the real design of java.util.HashSet in about 20 lines
import java.util.HashMap;

public class MiniHashSetDemo {
    static class MiniHashSet<E> {
        private static final Object PRESENT = new Object();              // shared dummy value
        private final HashMap<E, Object> map = new HashMap<>();

        boolean add(E e) {
            return map.put(e, PRESENT) == null;                         // true if the key was new
        }

        boolean contains(Object o) {
            return map.containsKey(o);
        }

        boolean remove(Object o) {
            return map.remove(o) == PRESENT;
        }

        int size() {
            return map.size();
        }

        @Override
        public String toString() {
            return map.keySet().toString();                              // the elements are the keys
        }
    }

    public static void main(String[] args) {
        MiniHashSet<String> forts = new MiniHashSet<>();
        System.out.println("add Raigad  : " + forts.add("Raigad"));
        System.out.println("add Torna   : " + forts.add("Torna"));
        System.out.println("add Raigad  : " + forts.add("Raigad"));      // duplicate
        System.out.println("contains Torna : " + forts.contains("Torna"));
        System.out.println("remove Torna   : " + forts.remove("Torna"));
        System.out.println("remove Torna   : " + forts.remove("Torna"));
        System.out.println("Set: " + forts + ", size " + forts.size());
    }
}
''' + OUT),
    method(
        'How a duplicate is detected', 'hash(e) -> bucket -> equals()', 'true / false', 'O(1) average',
        'When you <code>add</code> an element, the backing map hashes it, goes to the bucket, and compares with every node there: first by <strong>hash</strong>, then by <code>==</code> or <code>equals</code>. A match means "duplicate": the map keeps the old key and <code>add</code> returns false.',
        'Note: when a duplicate is rejected, the <strong>old object stays in the set</strong>; the new one is thrown away. This matters if the two objects are equal but not identical.',
        r'''// A duplicate needs the same hashCode AND equals(); the old object is kept
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class DuplicateCheckDemo {
    static class Fort {
        final String name;
        final String note;

        Fort(String name, String note) {
            this.name = name;
            this.note = note;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof Fort f && f.name.equals(name);          // identity is the name only
        }

        @Override
        public int hashCode() {
            return Objects.hash(name);
        }

        @Override
        public String toString() {
            return name + "(" + note + ")";
        }
    }

    public static void main(String[] args) {
        Set<Fort> forts = new HashSet<>();
        System.out.println("add first Raigad  : " + forts.add(new Fort("Raigad", "original")));
        System.out.println("add second Raigad : " + forts.add(new Fort("Raigad", "replacement")));
        System.out.println("Set keeps         : " + forts);
    }
}
''' + OUT),
    method(
        'Missing hashCode makes duplicates appear', 'equals() overridden, hashCode() not overridden', 'a set with duplicates', 'wrong',
        'If you override only <code>equals</code>, two "equal" objects usually hash into different buckets, so the set never compares them and keeps <strong>both</strong>.',
        'Fix: always override <code>hashCode</code> with the same fields as <code>equals</code>. A <code>record</code> gets both for free.',
        r'''// equals() without hashCode(): the HashSet shows "duplicates"
import java.util.HashSet;
import java.util.Set;

public class MissingHashCodeDemo {
    static class BadFort {
        final String name;

        BadFort(String name) {
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof BadFort f && f.name.equals(name);
        }
    }

    record GoodFort(String name) { }                                     // equals + hashCode generated

    public static void main(String[] args) {
        Set<BadFort> bad = new HashSet<>();
        bad.add(new BadFort("Raigad"));
        bad.add(new BadFort("Raigad"));
        System.out.println("BadFort size  : " + bad.size() + "  (expected 1)");

        Set<GoodFort> good = new HashSet<>();
        good.add(new GoodFort("Raigad"));
        good.add(new GoodFort("Raigad"));
        System.out.println("GoodFort size : " + good.size());
    }
}
''' + OUT),

    section('Constructors and capacity', 'Each constructor just configures the backing map.'),
    method(
        'Constructors and the 0.75 / 16 defaults', 'new HashSet&lt;&gt;();  new HashSet&lt;&gt;(int cap);  new HashSet&lt;&gt;(int cap, float load);  new HashSet&lt;&gt;(Collection c)', 'a set', 'O(1) / O(n)',
        '<code>new HashSet&lt;&gt;()</code> creates <code>new HashMap&lt;&gt;()</code> (capacity 16, load factor 0.75). The copy constructor sizes the map as <code>max((int)(c.size() / .75f) + 1, 16)</code> so that copying does not trigger a resize.',
        'Because the backing map has lazy allocation, the array of buckets is created only on the first <code>add</code>.',
        r'''// Sizing a HashSet like the copy-constructor does
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HashSetSizingDemo {
    public static void main(String[] args) {
        List<String> forts = List.of("Raigad", "Torna", "Lohagad", "Panhala", "Purandar", "Sinhagad");

        int capacity = Math.max((int) (forts.size() / .75f) + 1, 16);   // formula used by new HashSet<>(collection)
        System.out.println("6 elements -> initial capacity " + capacity);

        Set<String> copy = new HashSet<>(forts);                          // no resize needed
        System.out.println("copy size  : " + copy.size());

        Set<String> presized = new HashSet<>(100);                        // for ~75 elements without a resize
        System.out.println("presized   : " + presized.isEmpty());
    }
}
''' + OUT),

    section('Ordering and iteration', 'The order of a HashSet is the order of the backing map\'s buckets.'),
    method(
        'Why the order looks random', 'iteration = map.keySet(): bucket 0 .. n-1', 'elements in bucket order', 'O(n + capacity)',
        'Elements come out in <strong>bucket order</strong>, which depends on hash codes and the table size, not on the order you added them. After a resize the order can change.',
        'Never depend on this order. If you need one, use <code>LinkedHashSet</code> (insertion order, whose backing map is a <code>LinkedHashMap</code>) or <code>TreeSet</code> (sorted, backed by a <code>TreeMap</code>).',
        r'''// HashSet order = bucket order; LinkedHashSet and TreeSet are backed by other maps
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.TreeSet;

public class SetOrderDemo {
    public static void main(String[] args) {
        String[] forts = {"Torna", "Raigad", "Sinhagad", "Lohagad", "Panhala"};
        Set<String> hash = new HashSet<>();
        Set<String> linked = new LinkedHashSet<>();
        Set<String> tree = new TreeSet<>();
        for (String f : forts) {
            hash.add(f);
            linked.add(f);
            tree.add(f);
        }
        System.out.println("HashSet       (HashMap)       : " + hash);
        System.out.println("LinkedHashSet (LinkedHashMap) : " + linked);
        System.out.println("TreeSet       (TreeMap)       : " + tree);
    }
}
''' + OUT),
    method(
        'null in a HashSet and fail-fast iterators', 'add(null)  and  for-each + add()', 'allowed / ConcurrentModificationException', 'O(1)',
        'A HashSet allows <strong>one null</strong> element (HashMap allows a null key, stored in bucket 0). Its iterator is <strong>fail-fast</strong> through the map\'s <code>modCount</code>: adding or removing during a loop throws <code>ConcurrentModificationException</code>.',
        'Remove during iteration with <code>iterator.remove()</code> or <code>removeIf</code>.',
        r'''// One null is allowed; changing the set inside a for-each is not
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class SetNullFailFastDemo {
    public static void main(String[] args) {
        Set<String> forts = new HashSet<>();
        forts.add("Raigad");
        forts.add(null);
        forts.add(null);                                                 // still one null
        System.out.println("size with null : " + forts.size());
        forts.remove(null);

        forts.addAll(java.util.List.of("Torna", "Lohagad", "Panhala"));
        try {
            for (String f : forts) {
                forts.remove(f);                                         // structural change inside the loop
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("remove in for-each -> ConcurrentModificationException");
        }

        Iterator<String> it = forts.iterator();
        while (it.hasNext()) {
            if (it.next().startsWith("P")) {
                it.remove();                                             // the safe way
            }
        }
        forts.removeIf(f -> f.length() > 6);
        System.out.println("after safe removal: " + new java.util.TreeSet<>(forts));
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'The real source of java.util.HashSet (simplified)',
        'The implementation is so small that its core fits in this list.',
        [
            '<code>public boolean add(E e) { return map.put(e, PRESENT) == null; }</code>',
            '<code>public boolean contains(Object o) { return map.containsKey(o); }</code>',
            '<code>public boolean remove(Object o) { return map.remove(o) == PRESENT; }</code>',
            '<code>public Iterator&lt;E&gt; iterator() { return map.keySet().iterator(); }</code>',
            '<code>public int size() { return map.size(); }</code>',
            '<code>clone()</code> copies the backing map; serialization writes the elements, capacity and load factor (the map field is <code>transient</code>).',
            'A package-private constructor <code>HashSet(int, float, boolean dummy)</code> creates a <code>LinkedHashMap</code>: that is how <code>LinkedHashSet</code> reuses all of HashSet.',
        ],
    ),
    (
        '<h3>Memory: why PRESENT matters</h3>\n'
        + ul([
            'Each HashSet element costs one <code>HashMap.Node</code> (about 32 bytes: header, hash, key, value, next) plus its slot in the table. The value field points to the one shared <code>PRESENT</code> object, so it adds nothing.',
            'A set of 1 million small objects therefore needs tens of megabytes just for the nodes. If memory is tight and keys are small integers, a <code>BitSet</code> or a primitive-collection library is far smaller.',
        ]),
        [r'''// The cost of a HashSet: a node per element; compare with a BitSet for small ints
import java.util.BitSet;
import java.util.HashSet;
import java.util.Set;

public class SetMemoryDemo {
    public static void main(String[] args) {
        int n = 100_000;
        Set<Integer> set = new HashSet<>();
        BitSet bits = new BitSet();
        for (int i = 0; i < n; i += 2) {
            set.add(i);
            bits.set(i);
        }
        System.out.println("HashSet contains 1000 : " + set.contains(1000) + ", 1001 : " + set.contains(1001));
        System.out.println("BitSet  contains 1000 : " + bits.get(1000) + ", 1001 : " + bits.get(1001));
        System.out.println("BitSet size in bytes ~ " + bits.size() / 8 + " for " + bits.cardinality() + " numbers");
        System.out.println("HashSet needs one Node object (about 32 bytes) per number, so ~" + set.size() * 32 / 1024 + " KB before the table");
    }
}
''' + OUT],
    ),
    (
        '<h3>Mutating an element after adding it</h3>\n<p>The bucket is chosen when the element is added. If the fields used by <code>hashCode</code> change afterwards, the element sits in the <strong>wrong bucket</strong> and <code>contains</code> cannot find it any more.</p>',
        [r'''// A mutable element whose hashCode changes becomes unreachable
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class MutableElementDemo {
    static class Fort {
        String name;

        Fort(String name) {
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof Fort f && f.name.equals(name);
        }

        @Override
        public int hashCode() {
            return Objects.hash(name);
        }
    }

    public static void main(String[] args) {
        Set<Fort> set = new HashSet<>();
        Fort fort = new Fort("Raigad");
        set.add(fort);
        System.out.println("contains before change : " + set.contains(fort));

        fort.name = "Rajgad";                                            // hashCode changes while it is in the set
        System.out.println("contains after change  : " + set.contains(fort));
        System.out.println("size                   : " + set.size() + "  (it is still inside, but lost)");
    }
}
''' + OUT],
    ),
    (
        '<h3>HashSet versus LinkedHashSet versus TreeSet: the map behind each</h3>\n'
        + table(['', 'HashSet', 'LinkedHashSet', 'TreeSet'], [
            ['Backing map', '<code>HashMap</code>', '<code>LinkedHashMap</code>', '<code>TreeMap</code> (via NavigableMap)'],
            ['Order', 'None', 'Insertion', 'Sorted'],
            ['add / contains / remove', 'O(1)', 'O(1)', 'O(log n)'],
            ['Duplicate test', 'hashCode + equals', 'hashCode + equals', 'compareTo / Comparator'],
            ['Null element', 'One', 'One', 'No (natural order)'],
            ['Extra memory per element', 'Node', 'Node + 2 links', 'Tree node (larger)'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Everything about HashSet follows from the HashMap inside it.',
        [
            'Elements must implement <code>equals</code> and <code>hashCode</code> consistently (or be <code>record</code>s / strings / numbers / enums).',
            'Use immutable elements, or never change fields used by <code>hashCode</code> while the object is in a set.',
            'Presize a large set: <code>new HashSet&lt;&gt;((int) (n / 0.75f) + 1)</code> (or <code>HashSet.newHashSet(n)</code> in Java 19+).',
            'Do not rely on iteration order; choose LinkedHashSet or TreeSet if order matters.',
            'For thread safety use <code>ConcurrentHashMap.newKeySet()</code> or <code>Collections.synchronizedSet</code>.',
        ],
    ),
]

QA = [
    ('How does HashSet work internally?',
     'It wraps a HashMap: each element is a key and the value is a shared dummy object PRESENT. add is map.put(e, PRESENT) == null.'),
    ('How does HashSet avoid duplicates?',
     'The backing HashMap cannot hold duplicate keys: it compares hashCode and then equals; if a match exists put returns the old value and add returns false.'),
    ('What does HashSet.add() return and why?',
     'true if the element was new (map.put returned null) and false if it already existed.'),
    ('What is PRESENT?',
     'A static final Object used as the value for every key, so no per-element value object is needed.'),
    ('Why does a HashSet show duplicates when only equals is overridden?',
     'Equal objects hash to different buckets, so they are never compared; hashCode must be overridden consistently with equals.'),
    ('Is HashSet ordered?',
     'No: iteration follows bucket order. Use LinkedHashSet for insertion order or TreeSet for sorted order.'),
    ('Which map backs LinkedHashSet and TreeSet?',
     'LinkedHashMap and TreeMap (through NavigableMap).'),
    ('Can HashSet contain null?',
     'Yes, one null (stored in bucket 0 of the backing map).'),
    ('What happens if you modify an element after adding it?',
     'If the change alters hashCode the element becomes unreachable via contains/remove while still taking space.'),
    ('Time complexity of HashSet operations?',
     'add, remove and contains are O(1) average; iteration is O(n + capacity).'),
    ('Is HashSet thread-safe?',
     'No. Use ConcurrentHashMap.newKeySet() or Collections.synchronizedSet.'),
]

TOPIC = dict(id='internal-hashset', name='Internal Working of HashSet', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
