"""HashSet lesson: a set with no duplicates and very fast lookups. Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a HashSet?',
        'A <strong>HashSet</strong> is a collection that <strong>never holds the same element twice</strong>. Add "Raigad" a second time and nothing happens. '
        'It is built for speed: asking "is this fort in the set?" takes roughly the <strong>same tiny time</strong> whether the set holds ten forts or ten million.',
        [
            'Package <code>java.util</code>. Implements the <code>Set</code> interface (a <code>Collection</code> with <strong>no duplicates</strong>).',
            '<strong>No index:</strong> a set has no <code>get(i)</code>. You ask whether something is in it, add it, remove it, or loop over it.',
            '<strong>No guaranteed order:</strong> elements come out in an order decided by their hash codes. It can look random and can change when the set grows. If you need an order use <code>LinkedHashSet</code> (insertion order) or <code>TreeSet</code> (sorted).',
            '<strong>One null</strong> is allowed.',
            '<strong>Fast:</strong> <code>add</code>, <code>remove</code> and <code>contains</code> are O(1) on average.',
            '<strong>Not thread-safe.</strong> Internally a HashSet is a <code>HashMap</code> whose keys are your elements.',
            'Your element class must implement <code>equals()</code> and <code>hashCode()</code> properly (String, Integer and records already do).',
        ],
    ),
    (
        '<h3>Where HashSet sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Iterable', 'I', True, None, G), ('Collection', 'I', True, 'extends', G), ('Set', 'I', True, 'extends', G),
            ('AbstractSet', 'c', False, 'implements', B), ('HashSet', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class. HashSet also implements <code>Cloneable</code> and <code>Serializable</code>. Its subclass <code>LinkedHashSet</code> adds insertion order.</p>',
        [],
    ),
    (
        '<h3>Creating a HashSet: four constructors</h3>\n'
        + ul([
            '<code>new HashSet&lt;&gt;()</code>: empty, capacity 16, load factor 0.75.',
            '<code>new HashSet&lt;&gt;(int initialCapacity)</code>: empty with room for about that many buckets.',
            '<code>new HashSet&lt;&gt;(int initialCapacity, float loadFactor)</code>: control both numbers.',
            '<code>new HashSet&lt;&gt;(Collection c)</code>: a set holding the elements of another collection (<strong>duplicates are dropped</strong>).',
        ]),
        [r'''// HashSet constructors; the copy constructor removes duplicates
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HashSetCreateDemo {
    public static void main(String[] args) {
        Set<String> empty = new HashSet<>();                      // capacity 16, load factor 0.75
        Set<String> sized = new HashSet<>(100);                   // for about 75 elements without resizing
        Set<String> tuned = new HashSet<>(32, 0.5f);              // resize earlier: fewer collisions, more memory

        List<String> visits = new ArrayList<>(List.of("Pune", "Nashik", "Pune", "Nagpur", "Nashik"));
        Set<String> unique = new HashSet<>(visits);               // duplicates disappear

        System.out.println("Visits list : " + visits);
        System.out.println("As a set    : " + unique);
        System.out.println("Sizes       : " + visits.size() + " -> " + unique.size());
        System.out.println("Empty sets  : " + empty.isEmpty() + " " + sized.isEmpty() + " " + tuned.isEmpty());
    }
}
''' + OUT],
    ),
    (
        '<h3>Your first HashSet program</h3>\n'
        + ul([
            '<code>add</code> returns <code>true</code> if the element was new and <code>false</code> if it was already there.',
            'The printed order is decided by the hash codes, not by the order of adding.',
        ]),
        [r'''// First HashSet program: duplicates are ignored
import java.util.HashSet;
import java.util.Set;

public class HashSetFirstDemo {
    public static void main(String[] args) {
        Set<String> forts = new HashSet<>();

        System.out.println("add Raigad    : " + forts.add("Raigad"));
        System.out.println("add Sinhagad  : " + forts.add("Sinhagad"));
        System.out.println("add Raigad    : " + forts.add("Raigad"));    // duplicate: ignored
        System.out.println("add null      : " + forts.add(null));        // one null is allowed

        System.out.println("Set           : " + forts);
        System.out.println("Size          : " + forts.size());
    }
}
''' + OUT],
    ),
    (
        '<h3>All HashSet methods at a glance</h3>\n<p><em>n</em> is the number of elements, <em>m</em> the size of the other collection.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>add(e)</strong>', 'Adds e if not present; returns whether it was added', 'O(1) average'],
            ['<strong>addAll(c)</strong>', 'Adds every element of c (union)', 'O(m)'],
            ['<strong>remove(o)</strong>', 'Removes o if present; returns whether it was', 'O(1) average'],
            ['<strong>removeAll(c)</strong>', 'Removes every element found in c (difference)', 'O(m) to O(n*m)'],
            ['<strong>retainAll(c)</strong>', 'Keeps only elements found in c (intersection)', 'O(n)'],
            ['<strong>removeIf(p)</strong>', 'Removes all elements matching a condition', 'O(n)'],
            ['<strong>contains(o)</strong> / <strong>containsAll(c)</strong>', 'Membership tests', 'O(1) / O(m)'],
            ['<strong>size()</strong> / <strong>isEmpty()</strong> / <strong>clear()</strong>', 'Count, emptiness, remove all', 'O(1) / O(1) / O(capacity)'],
            ['<strong>iterator()</strong> / <strong>forEach(a)</strong>', 'Visit every element', 'O(n + capacity)'],
            ['<strong>stream()</strong> / <strong>toArray()</strong>', 'Stream / array copy', 'O(n)'],
            ['<strong>clone()</strong>', 'Shallow copy', 'O(n)'],
            ['<strong>equals(o)</strong> / <strong>hashCode()</strong> / <strong>toString()</strong>', 'Same elements regardless of order / hash / text', 'O(n)'],
            ['<strong>Set.of(...)</strong> / <strong>Set.copyOf(c)</strong>', 'Immutable sets', 'O(n)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Adding elements', 'A set decides for you whether an element is new. The return value of <code>add</code> tells you what happened.'),
    method(
        'add(E e)', 'boolean add(E e)', '<code>true</code> if the element was new, <code>false</code> if it was already present', 'O(1) average',
        'Puts the element into the set <strong>only if it is not already there</strong>. Use the return value to detect duplicates, for example to find the first repeated value in a list.',
        'It calls <code>map.put(e, PRESENT)</code> on the internal HashMap. A duplicate is detected with <code>hashCode()</code> (to find the bucket) then <code>equals()</code> (to compare inside the bucket). The existing element is <strong>kept</strong>; the new equal one is discarded.',
        r'''// HashSet add(E e): the return value detects duplicates
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HashSetAddDemo {
    public static void main(String[] args) {
        List<String> visits = List.of("Pune", "Nashik", "Nagpur", "Nashik", "Indore", "Pune");
        Set<String> seen = new HashSet<>();

        for (String city : visits) {
            boolean isNew = seen.add(city);          // true only the first time
            if (!isNew) {
                System.out.println("Repeated visit: " + city);
            }
        }
        System.out.println("Distinct cities: " + seen.size() + " -> " + seen);
    }
}
''' + OUT),
    method(
        'addAll(Collection c): union', 'boolean addAll(Collection<? extends E> c)', '<code>true</code> if the set changed', 'O(m)',
        'Adds every element of another collection. Because a set ignores duplicates, <code>addAll</code> performs a <strong>union</strong> of two groups.',
        'It loops over <code>c</code> calling <code>add</code>. Pass a <code>HashSet</code> as the receiver and any collection as the argument; the result never contains duplicates.',
        r'''// HashSet addAll(): union of two groups
import java.util.HashSet;
import java.util.Set;

public class HashSetAddAllDemo {
    public static void main(String[] args) {
        Set<String> northForts = new HashSet<>(Set.of("Raigad", "Torna", "Purandar"));
        Set<String> southForts = Set.of("Torna", "Panhala", "Vijaydurg");        // Torna is in both

        Set<String> all = new HashSet<>(northForts);
        boolean changed = all.addAll(southForts);

        System.out.println("addAll changed it : " + changed);
        System.out.println("Union             : " + all);
        System.out.println("Union size        : " + all.size());
    }
}
''' + OUT),

    section('Looking things up', 'The reason to use a HashSet: very fast membership tests.'),
    method(
        'contains(Object o) and containsAll(Collection c)', 'boolean contains(Object o);  boolean containsAll(Collection<?> c)', '<code>true</code> or <code>false</code>', 'O(1) / O(m)',
        '<code>contains</code> tells whether the element is in the set. It does <strong>not</strong> scan the whole set: it jumps straight to the right bucket. <code>containsAll</code> tests that <em>every</em> element of another collection is present (a "subset" test).',
        'Compare: <code>ArrayList.contains</code> is O(n). Turning a big list into a <code>HashSet</code> before many lookups is one of the most common performance fixes. Lookup cost degrades only when many elements share a bucket (bad <code>hashCode</code>).',
        r'''// HashSet contains / containsAll: fast membership tests
import java.util.HashSet;
import java.util.Set;

public class HashSetContainsDemo {
    public static void main(String[] args) {
        Set<String> opened = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna", "Purandar"));

        System.out.println("contains(Raigad)   : " + opened.contains("Raigad"));
        System.out.println("contains(Lohagad)  : " + opened.contains("Lohagad"));
        System.out.println("contains is case-sensitive: " + opened.contains("raigad"));

        Set<String> wishlist = Set.of("Raigad", "Torna");
        System.out.println("containsAll(wishlist): " + opened.containsAll(wishlist));
        System.out.println("containsAll(with Lohagad): " + opened.containsAll(Set.of("Raigad", "Lohagad")));
    }
}
''' + OUT),
    method(
        'size(), isEmpty() and clear()', 'int size();  boolean isEmpty();  void clear()', 'the count / whether empty / nothing', 'O(1) / O(1) / O(capacity)',
        'Count the elements, test for none, or remove all of them.',
        '<code>clear()</code> empties the table but keeps its capacity, so the set does not shrink. Clearing a set that once held millions of elements leaves a big, empty table behind; create a new set if memory matters.',
        r'''// HashSet size / isEmpty / clear
import java.util.HashSet;
import java.util.Set;

public class HashSetSizeDemo {
    public static void main(String[] args) {
        Set<String> cities = new HashSet<>(Set.of("Pune", "Nashik", "Nagpur"));
        System.out.println("size " + cities.size() + ", empty? " + cities.isEmpty());

        cities.clear();
        System.out.println("size " + cities.size() + ", empty? " + cities.isEmpty());
    }
}
''' + OUT),

    section('Removing elements', 'Remove one element, a group, the elements that match a rule, or everything outside a group.'),
    method(
        'remove(Object o)', 'boolean remove(Object o)', '<code>true</code> if the element was present', 'O(1) average',
        'Removes the element if it is there and tells you whether it was. No shifting, because a set has no positions.',
        'It deletes the entry from the bucket. As with <code>add</code>, the lookup uses <code>hashCode</code> then <code>equals</code>.',
        r'''// HashSet remove(Object): true only if it was present
import java.util.HashSet;
import java.util.Set;

public class HashSetRemoveDemo {
    public static void main(String[] args) {
        Set<String> forts = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna"));

        System.out.println("remove Torna    : " + forts.remove("Torna"));
        System.out.println("remove Lohagad  : " + forts.remove("Lohagad"));   // was never there
        System.out.println("Remaining       : " + forts);
    }
}
''' + OUT),
    method(
        'removeAll, retainAll and removeIf', 'boolean removeAll(Collection<?> c);  boolean retainAll(Collection<?> c);  boolean removeIf(Predicate<? super E> filter)', '<code>true</code> if the set changed', 'O(n) typical',
        '<code>removeAll(c)</code> is <strong>set difference</strong> (A minus B). <code>retainAll(c)</code> is <strong>intersection</strong> (what both sets share). <code>removeIf</code> removes everything that matches a rule written as a lambda.',
        'They are inherited from <code>AbstractSet</code>/<code>Collection</code>. For <code>removeAll</code>, Java chooses to iterate the smaller of the two collections when the argument is a Set, which keeps it fast. The argument\'s <code>contains</code> speed matters: pass a Set, not a List.',
        r'''// HashSet removeAll / retainAll / removeIf: difference, intersection, rule
import java.util.HashSet;
import java.util.Set;

public class HashSetRemoveAllDemo {
    public static void main(String[] args) {
        Set<String> a = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna", "Purandar"));
        Set<String> b = Set.of("Torna", "Purandar", "Lohagad");

        Set<String> difference = new HashSet<>(a);
        difference.removeAll(b);                       // in a but not in b
        System.out.println("a minus b      : " + difference);

        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);                     // in both
        System.out.println("a and b        : " + intersection);

        Set<String> shortNames = new HashSet<>(a);
        shortNames.removeIf(name -> name.length() > 6);    // drop long names
        System.out.println("short names    : " + shortNames);
    }
}
''' + OUT),

    section('Walking and converting', 'A set has no index, so you visit every element with a loop, an iterator or a stream.'),
    method(
        'for-each, iterator() and forEach()', 'for (E e : set) ...;  Iterator<E> iterator();  void forEach(Consumer)', 'each element once, in hash order', 'O(n + capacity)',
        'Visit every element. The order is <strong>not</strong> insertion order and is not guaranteed. Remove while walking only through <code>Iterator.remove()</code> (or <code>removeIf</code>), otherwise you get <code>ConcurrentModificationException</code>.',
        'The iterator walks the bucket array, so its cost is proportional to <strong>capacity + size</strong>; a mostly empty large table is slow to iterate. The iterator is fail-fast.',
        r'''// HashSet iteration: for-each, iterator with remove, forEach
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class HashSetIterationDemo {
    public static void main(String[] args) {
        Set<String> cities = new HashSet<>(Set.of("Pune", "Nashik", "Nagpur", "Indore"));

        for (String city : cities) {                  // order is decided by the hash codes
            System.out.println("for-each: " + city);
        }

        Iterator<String> it = cities.iterator();
        while (it.hasNext()) {
            if (it.next().startsWith("N")) {
                it.remove();                           // the safe way to remove while walking
            }
        }
        System.out.println("After removing N*: " + cities);

        cities.forEach(c -> System.out.println("forEach : " + c));
    }
}
''' + OUT),
    method(
        'stream(), toArray() and clone()', 'Stream<E> stream();  Object[] toArray();  Object clone()', 'a stream / an array / a shallow copy', 'O(n)',
        'Process the elements with a stream pipeline, copy them into an array, or make a shallow copy of the set.',
        'The stream is unordered (the set has no order), so results of <code>findFirst</code> are arbitrary. Prefer the copy constructor <code>new HashSet&lt;&gt;(set)</code> to <code>clone()</code>.',
        r'''// HashSet stream / toArray / clone
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

public class HashSetConvertDemo {
    public static void main(String[] args) {
        Set<String> forts = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna", "Purandar"));

        Set<String> longNames = forts.stream().filter(f -> f.length() > 6).collect(Collectors.toCollection(TreeSet::new));
        System.out.println("long names (sorted): " + longNames);

        String[] array = forts.toArray(new String[0]);
        Arrays.sort(array);
        System.out.println("array (sorted)     : " + Arrays.toString(array));

        @SuppressWarnings("unchecked")
        Set<String> copy = (Set<String>) ((HashSet<String>) forts).clone();
        copy.add("Lohagad");
        System.out.println("original size " + forts.size() + ", copy size " + copy.size());
    }
}
''' + OUT),
    method(
        'equals, hashCode, toString and Set.of', 'boolean equals(Object);  int hashCode();  String toString();  Set.of(...) / Set.copyOf(...)', 'comparison / hash / text / immutable sets', 'O(n)',
        'Two sets are equal when they hold the <strong>same elements</strong>, whatever the order or the Set class. <code>Set.of(...)</code> creates an <strong>immutable</strong> set (add and remove throw <code>UnsupportedOperationException</code>, no nulls, no duplicates allowed at creation).',
        '<code>Set.of</code> rejects duplicate arguments with <code>IllegalArgumentException</code>, and its iteration order is randomised per JVM run (on purpose, to stop code depending on it).',
        r'''// HashSet equals / toString and the immutable Set.of
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class HashSetEqualsDemo {
    public static void main(String[] args) {
        Set<String> a = new HashSet<>(Set.of("Raigad", "Torna"));
        Set<String> b = new TreeSet<>(Set.of("Torna", "Raigad"));      // another Set class, other order

        System.out.println("a.equals(b)   : " + a.equals(b));           // same elements -> equal
        System.out.println("hash equal    : " + (a.hashCode() == b.hashCode()));

        Set<String> immutable = Set.of("Raigad", "Torna");
        try {
            immutable.add("Purandar");
        } catch (UnsupportedOperationException e) {
            System.out.println("Set.of is immutable");
        }
        try {
            Set.of("Raigad", "Raigad");
        } catch (IllegalArgumentException e) {
            System.out.println("Set.of rejects duplicates: " + e.getMessage());
        }
    }
}
''' + OUT),

    section('Common jobs with a HashSet', 'Three everyday uses.'),
    (
        '<h3>Remove duplicates from a list</h3>\n<p>Copy the list into a set. To keep the original order use <code>LinkedHashSet</code> instead of <code>HashSet</code>.</p>',
        [r'''// Removing duplicates from a list: HashSet versus LinkedHashSet
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class HashSetUniqueDemo {
    public static void main(String[] args) {
        List<String> visits = List.of("Pune", "Nashik", "Pune", "Nagpur", "Nashik", "Indore");

        List<String> unique = new ArrayList<>(new LinkedHashSet<>(visits));   // keeps first-seen order
        System.out.println("Visits : " + visits);
        System.out.println("Unique : " + unique);
    }
}
''' + OUT],
    ),
    (
        '<h3>Union, intersection and difference of two groups</h3>',
        [r'''// Set algebra with HashSet
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class HashSetAlgebraDemo {
    public static void main(String[] args) {
        Set<String> visitedBySchool = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna"));
        Set<String> visitedByClub = new HashSet<>(Set.of("Torna", "Purandar", "Raigad"));

        Set<String> union = new TreeSet<>(visitedBySchool);          // TreeSet only to print in sorted order
        union.addAll(visitedByClub);

        Set<String> both = new TreeSet<>(visitedBySchool);
        both.retainAll(visitedByClub);

        Set<String> onlySchool = new TreeSet<>(visitedBySchool);
        onlySchool.removeAll(visitedByClub);

        System.out.println("Union        : " + union);
        System.out.println("Both         : " + both);
        System.out.println("Only school  : " + onlySchool);
    }
}
''' + OUT],
    ),
    (
        '<h3>Fast lookups: a set instead of a list</h3>\n<p>The program counts how many blocked forts appear in a long list of visits, using a list lookup (O(n) each) and a set lookup (O(1) each). The counts are equal; only the work differs.</p>',
        [r'''// Same answer from List.contains and Set.contains; the set does far less work
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HashSetLookupDemo {
    public static void main(String[] args) {
        List<String> blockedList = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            blockedList.add("fort" + i);
        }
        Set<String> blockedSet = new HashSet<>(blockedList);     // same data in a set

        int hitsList = 0;
        int hitsSet = 0;
        for (int i = 500; i < 1500; i++) {                       // 1000 visits, half of them blocked
            String visit = "fort" + i;
            if (blockedList.contains(visit)) {                   // may compare up to 1000 elements
                hitsList++;
            }
            if (blockedSet.contains(visit)) {                    // jumps straight to one bucket
                hitsSet++;
            }
        }
        System.out.println("Blocked visits via list: " + hitsList);
        System.out.println("Blocked visits via set : " + hitsSet);
    }
}
''' + OUT],
    ),
]

EXPERT = [
    section(
        'How HashSet works inside',
        'A HashSet is a thin wrapper over a <code>HashMap&lt;E, Object&gt;</code>; every element is a key and every value is the same dummy object <code>PRESENT</code>.',
        [
            '<strong>Step 1, hash:</strong> <code>h = e.hashCode()</code>, then spread: <code>h ^ (h &gt;&gt;&gt; 16)</code> so the high bits also influence the low bits.',
            '<strong>Step 2, bucket:</strong> the table length is always a power of two, so the index is <code>(n - 1) &amp; hash</code>, a fast "modulo".',
            '<strong>Step 3, compare:</strong> inside the bucket Java compares hash codes first, then <code>==</code> / <code>equals()</code>. A match means "already present".',
            '<strong>Collisions:</strong> elements that land in the same bucket form a linked list; if a bucket reaches <strong>8</strong> entries and the table has at least <strong>64</strong> buckets, the list is converted to a balanced <strong>red-black tree</strong> (O(log n) instead of O(n)).',
            '<strong>Resize:</strong> when <code>size &gt; capacity * loadFactor</code> (default 16 x 0.75 = 12) the table <strong>doubles</strong> and every entry is redistributed.',
            '<strong>Capacity from the copy constructor:</strong> <code>max(size / 0.75 + 1, 16)</code>, so copying avoids early resizes.',
            'Because the order depends on hash codes and table size, iteration order can change after a resize.',
        ],
    ),
    (
        '<h3>Trap: equals() and hashCode() must agree</h3>\n'
        + ul([
            'Rule: <strong>equal objects must have equal hash codes</strong>.',
            'If a class overrides <code>equals</code> but not <code>hashCode</code>, two equal objects usually land in different buckets, so the set keeps both and <code>contains</code> fails.',
            'A <code>record</code> (or an IDE-generated pair) gets both right.',
        ]),
        [r'''// HashSet with your own class: equals() AND hashCode() are required
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class HashSetEqualsHashCodeDemo {
    static class BadFort {                              // equals() but NO hashCode()
        final String name;
        BadFort(String name) { this.name = name; }
        @Override public boolean equals(Object o) { return o instanceof BadFort b && b.name.equals(name); }
    }

    static class GoodFort {                             // both methods
        final String name;
        GoodFort(String name) { this.name = name; }
        @Override public boolean equals(Object o) { return o instanceof GoodFort g && g.name.equals(name); }
        @Override public int hashCode() { return Objects.hash(name); }
    }

    record RecordFort(String name) { }                  // generated equals() and hashCode()

    public static void main(String[] args) {
        Set<BadFort> bad = new HashSet<>();
        bad.add(new BadFort("Raigad"));
        bad.add(new BadFort("Raigad"));
        System.out.println("Missing hashCode -> size " + bad.size() + ", contains? " + bad.contains(new BadFort("Raigad")));

        Set<GoodFort> good = new HashSet<>();
        good.add(new GoodFort("Raigad"));
        good.add(new GoodFort("Raigad"));
        System.out.println("Both methods     -> size " + good.size() + ", contains? " + good.contains(new GoodFort("Raigad")));

        Set<RecordFort> records = new HashSet<>();
        records.add(new RecordFort("Raigad"));
        records.add(new RecordFort("Raigad"));
        System.out.println("Record           -> size " + records.size());
    }
}
''' + OUT],
    ),
    (
        '<h3>Trap: changing an element after adding it</h3>\n'
        + ul([
            'The bucket of an element is chosen from its <code>hashCode</code> <strong>when it is added</strong>.',
            'If you later change a field that <code>hashCode</code> uses, the element sits in the wrong bucket: <code>contains</code> and <code>remove</code> can no longer find it.',
            'Use <strong>immutable</strong> classes (records, Strings, Integers) as set elements.',
        ]),
        [r'''// A mutable element changes its hash code and gets "lost" in the set
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class HashSetMutableTrapDemo {
    static class Fort {
        String name;                                       // NOT final: can change
        Fort(String name) { this.name = name; }
        @Override public boolean equals(Object o) { return o instanceof Fort f && f.name.equals(name); }
        @Override public int hashCode() { return Objects.hash(name); }
        @Override public String toString() { return name; }
    }

    public static void main(String[] args) {
        Set<Fort> forts = new HashSet<>();
        Fort raigad = new Fort("Raigad");
        forts.add(raigad);

        raigad.name = "Rajgad";                            // the hash code changes now

        System.out.println("Set shows it       : " + forts);
        System.out.println("contains(raigad)   : " + forts.contains(raigad));          // looks in the wrong bucket
        System.out.println("remove(raigad)     : " + forts.remove(raigad));            // cannot remove it either
        System.out.println("size afterwards    : " + forts.size());
    }
}
''' + OUT],
    ),
    (
        '<h3>Choosing a Set implementation</h3>\n'
        + table(['', 'HashSet', 'LinkedHashSet', 'TreeSet', 'CopyOnWriteArraySet'], [
            ['Order', 'None', 'Insertion order', 'Sorted (natural or Comparator)', 'Insertion order'],
            ['add / remove / contains', '<strong>O(1)</strong> average', 'O(1) average', 'O(log n)', 'O(n)'],
            ['Inside', 'HashMap', 'HashMap + linked list', 'Red-black tree (TreeMap)', 'Array copied on write'],
            ['null', 'One allowed', 'One allowed', 'Not allowed (natural order)', 'Allowed'],
            ['Thread-safe', 'No', 'No', 'No', 'Yes'],
            ['Use for', '<strong>Default set</strong>', 'Predictable iteration', 'Sorted data, range queries', 'Few writes, many readers'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Habits for fast and correct sets.',
        [
            'Declare with the interface: <code>Set&lt;String&gt; forts = new HashSet&lt;&gt;();</code>.',
            'Give an expected size to avoid resizes: <code>new HashSet&lt;&gt;((int) (expected / 0.75f) + 1)</code> or <code>HashSet.newHashSet(expected)</code> (Java 19+).',
            'Use immutable element types; always override <code>equals</code> and <code>hashCode</code> together (or use a <code>record</code>).',
            'Do not depend on iteration order; use <code>LinkedHashSet</code> or <code>TreeSet</code> when you need one.',
            'Prefer a <code>Set</code> over a <code>List</code> whenever you mostly ask "is it in there?" or must keep values unique.',
            'To share between threads use <code>ConcurrentHashMap.newKeySet()</code> or <code>Collections.synchronizedSet</code>.',
        ],
    ),
    (
        '<h3>Real example: tracking unique visitors of each fort</h3>\n<p>A visitor log with repeated entries. A set per fort counts each visitor once, and the intersection finds visitors who came to both.</p>',
        [r'''// Unique visitors per fort, and visitors who went to both
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class FortVisitorsDemo {
    public static void main(String[] args) {
        String[] raigadLog = {"Pune", "Nashik", "Pune", "Nagpur", "Pune"};      // arrival city per entry
        String[] tornaLog = {"Nagpur", "Indore", "Nagpur", "Pune"};

        Set<String> raigad = new HashSet<>();
        for (String city : raigadLog) {
            raigad.add(city);                          // repeated cities count once
        }
        Set<String> torna = new HashSet<>(Arrays.asList(tornaLog));   // the copy constructor accepts duplicates
        System.out.println("Raigad entries " + raigadLog.length + " -> unique cities " + raigad.size());
        System.out.println("Torna entries  " + tornaLog.length + " -> unique cities " + torna.size());

        Set<String> both = new TreeSet<>(raigad);
        both.retainAll(torna);
        System.out.println("Cities that visited both: " + both);
    }
}
''' + OUT],
    ),
]

QA = [
    ('What is a HashSet and how does it differ from an ArrayList?',
     'HashSet stores unique elements with no order and no index, giving O(1) average add/remove/contains. ArrayList keeps insertion order, allows duplicates and has O(n) contains.'),
    ('How does HashSet detect duplicates?',
     'It computes the element hashCode, finds the bucket, and compares candidates with equals(). A match means the element is already present and add() returns false.'),
    ('Is the iteration order of a HashSet guaranteed?',
     'No. It depends on hash codes and the table size and may change after a resize. Use LinkedHashSet for insertion order or TreeSet for sorted order.'),
    ('How is HashSet implemented internally?',
     'As a HashMap whose keys are the elements and whose values are a shared dummy object (PRESENT).'),
    ('What are load factor and initial capacity?',
     'Capacity is the number of buckets (default 16); the load factor (default 0.75) is how full the table may get before it doubles and rehashes. A lower load factor means fewer collisions but more memory.'),
    ('What happens on a hash collision?',
     'Entries in the same bucket form a linked list; with 8 or more entries in a bucket and a table of at least 64 buckets the list becomes a red-black tree, improving the worst case from O(n) to O(log n).'),
    ('Why must equals() and hashCode() be overridden together?',
     'Equal objects must produce the same hash code, or they land in different buckets and the set treats them as different elements.'),
    ('Why is mutating an element after adding it dangerous?',
     'Its bucket was chosen from the old hash code. After the change contains() and remove() look in the wrong bucket and the element appears lost.'),
    ('Does HashSet allow null?',
     'Yes, one null element. TreeSet with natural ordering does not allow null.'),
    ('How do you perform union, intersection and difference with sets?',
     'Union: addAll; intersection: retainAll; difference: removeAll (on copies, because they modify the receiver).'),
    ('HashSet vs LinkedHashSet vs TreeSet?',
     'HashSet is fastest with no order; LinkedHashSet keeps insertion order at a small cost; TreeSet keeps elements sorted with O(log n) operations and supports range queries.'),
    ('Is HashSet thread-safe?',
     'No. Use ConcurrentHashMap.newKeySet(), Collections.synchronizedSet(...) or CopyOnWriteArraySet depending on the access pattern.'),
    ('How do you remove duplicates from a list while keeping order?',
     'new ArrayList<>(new LinkedHashSet<>(list)).'),
]

TOPIC = dict(id='hashset', name='HashSet', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
