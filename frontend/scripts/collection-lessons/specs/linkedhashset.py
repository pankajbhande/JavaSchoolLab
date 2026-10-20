"""LinkedHashSet lesson: a HashSet that remembers insertion order. Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a LinkedHashSet?',
        'A <strong>LinkedHashSet</strong> is a <code>HashSet</code> that <strong>remembers the order in which you added the elements</strong>. You still get no duplicates and fast lookups, '
        'but when you print or loop, the elements come out exactly in <strong>insertion order</strong>. Think of a visitor register: each fort is written once, in the order of the first visit.',
        [
            'Package <code>java.util</code>. It <strong>extends HashSet</strong> and, since Java 21, also implements <code>SequencedSet</code>.',
            '<strong>No duplicates</strong> (the same rule as HashSet). Adding an element that is already present does <strong>not</strong> change its position.',
            '<strong>Predictable order:</strong> iteration follows insertion order.',
            '<strong>Fast:</strong> add, remove and contains are O(1) on average, with a small extra cost to maintain the order.',
            '<strong>One null</strong> is allowed. <strong>Not thread-safe.</strong>',
            'Use it when you need <strong>uniqueness and a stable order</strong>: removing duplicates from a list while keeping the order, caches, "recently seen" lists, report output.',
        ],
    ),
    (
        '<h3>Where LinkedHashSet sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Collection', 'I', True, None, G), ('Set', 'I', True, 'extends', G), ('HashSet', 'c', False, 'implements', B), ('LinkedHashSet', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class. LinkedHashSet inherits every HashSet method; it only changes <em>how the elements are linked together inside</em>.</p>',
        [],
    ),
    (
        '<h3>Creating a LinkedHashSet</h3>\n'
        + ul([
            '<code>new LinkedHashSet&lt;&gt;()</code>: empty, capacity 16, load factor 0.75.',
            '<code>new LinkedHashSet&lt;&gt;(int initialCapacity)</code> and <code>(int, float loadFactor)</code>: tune the size.',
            '<code>new LinkedHashSet&lt;&gt;(Collection c)</code>: a copy in the iteration order of c, <strong>duplicates dropped</strong>.',
        ]),
        [r'''// LinkedHashSet keeps insertion order; HashSet does not
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

public class LinkedHashSetCreateDemo {
    public static void main(String[] args) {
        Set<String> linked = new LinkedHashSet<>();
        Set<String> plain = new HashSet<>();

        for (String fort : new String[] {"Torna", "Raigad", "Sinhagad", "Purandar", "Lohagad"}) {
            linked.add(fort);
            plain.add(fort);
        }

        System.out.println("LinkedHashSet: " + linked);     // always the order of adding
        System.out.println("HashSet      : " + plain);      // order decided by hash codes
    }
}
''' + OUT],
    ),
    (
        '<h3>All LinkedHashSet methods at a glance</h3>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>add(e)</strong> / <strong>addAll(c)</strong>', 'Adds new elements at the end of the order', 'O(1) / O(m)'],
            ['<strong>remove(o)</strong> / <strong>removeAll(c)</strong> / <strong>retainAll(c)</strong> / <strong>removeIf(p)</strong> / <strong>clear()</strong>', 'Removes elements (the order of the rest stays)', 'O(1) / O(n)'],
            ['<strong>contains(o)</strong> / <strong>containsAll(c)</strong> / <strong>size()</strong> / <strong>isEmpty()</strong>', 'Lookups and counts', 'O(1)'],
            ['<strong>iterator()</strong> / <strong>forEach(a)</strong> / <strong>stream()</strong> / <strong>toArray()</strong>', 'Walk or convert in insertion order', 'O(n)'],
            ['<strong>addFirst(e)</strong> / <strong>addLast(e)</strong>', 'Adds at the front or end, <em>moving</em> an existing element (Java 21)', 'O(1)'],
            ['<strong>getFirst()</strong> / <strong>getLast()</strong>', 'Reads the first / last element (Java 21)', 'O(1)'],
            ['<strong>removeFirst()</strong> / <strong>removeLast()</strong>', 'Removes the first / last element (Java 21)', 'O(1)'],
            ['<strong>reversed()</strong>', 'A reversed view (Java 21)', 'O(1)'],
            ['<strong>clone()</strong> / <strong>equals</strong> / <strong>hashCode</strong> / <strong>toString</strong>', 'Copy and compare (equality ignores order)', 'O(n)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Adding, keeping the order and ignoring duplicates', 'LinkedHashSet behaves like HashSet, plus a stable order.'),
    method(
        'add(E e) and addAll(Collection c)', 'boolean add(E e);  boolean addAll(Collection<? extends E> c)', '<code>true</code> if something was added', 'O(1) / O(m)',
        'Adds an element at the <strong>end</strong> of the order if it is new. If it is already present nothing changes, and it <strong>keeps its old position</strong> (re-adding does not move it).',
        'Internally each entry is a <code>LinkedHashMap.Entry</code> with <code>before</code> and <code>after</code> links in addition to the HashMap bucket link. Insertion order is <strong>not</strong> affected by re-insertion; this is different from <code>addFirst</code>/<code>addLast</code> (Java 21) which do move.',
        r'''// LinkedHashSet add / addAll: order of first insertion, duplicates ignored
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class LinkedHashSetAddDemo {
    public static void main(String[] args) {
        Set<String> cities = new LinkedHashSet<>();

        cities.add("Pune");
        cities.add("Nashik");
        cities.add("Pune");                // duplicate: ignored, Pune keeps its first position
        cities.add("Nagpur");
        System.out.println("After adds : " + cities);

        boolean changed = cities.addAll(List.of("Indore", "Nashik", "Jaipur"));   // Nashik is ignored
        System.out.println("addAll     : " + changed + " -> " + cities);
    }
}
''' + OUT),
    method(
        'contains, remove and the order of the rest', 'boolean contains(Object o);  boolean remove(Object o)', '<code>true</code> / <code>false</code>', 'O(1)',
        'Look up or remove an element by value, like a HashSet. After a removal the <strong>remaining elements keep their relative order</strong>.',
        'Removing unlinks the entry from both the bucket chain and the doubly linked order list, which is O(1) because it already has both neighbours.',
        r'''// LinkedHashSet contains / remove: the rest keeps its order
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class LinkedHashSetRemoveDemo {
    public static void main(String[] args) {
        Set<String> forts = new LinkedHashSet<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar", "Lohagad"));

        System.out.println("contains(Torna)  : " + forts.contains("Torna"));
        System.out.println("remove(Sinhagad) : " + forts.remove("Sinhagad"));
        System.out.println("remove(Panhala)  : " + forts.remove("Panhala"));
        System.out.println("Order kept       : " + forts);

        forts.removeIf(f -> f.startsWith("P"));
        System.out.println("removeIf P*      : " + forts);
    }
}
''' + OUT),
    method(
        'removeAll, retainAll and clear', 'boolean removeAll(Collection<?> c);  boolean retainAll(Collection<?> c);  void clear()', '<code>true</code> if changed / nothing', 'O(n)',
        'Subtract a group, keep only a group, or remove everything. Unlike HashSet, the result keeps the <strong>insertion order</strong> of what is left, so printed results are the same every time.',
        'These are the same inherited methods as HashSet; the benefit of LinkedHashSet is the predictable output, which makes it very good for logs, reports and unit tests.',
        r'''// LinkedHashSet removeAll / retainAll: results stay in insertion order
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class LinkedHashSetBulkDemo {
    public static void main(String[] args) {
        Set<String> forts = new LinkedHashSet<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar", "Lohagad"));
        List<String> closed = List.of("Torna", "Lohagad");

        Set<String> open = new LinkedHashSet<>(forts);
        open.removeAll(closed);
        System.out.println("open   : " + open);

        Set<String> shut = new LinkedHashSet<>(forts);
        shut.retainAll(closed);
        System.out.println("closed : " + shut);

        shut.clear();
        System.out.println("cleared: " + shut);
    }
}
''' + OUT),

    section('Walking and converting', 'Every way of visiting the elements follows the insertion order.'),
    method(
        'iterator, for-each, forEach, stream and toArray', 'Iterator<E> iterator();  void forEach(Consumer);  Stream<E> stream();  Object[] toArray()', 'the elements in insertion order', 'O(n)',
        'All of them visit the elements in the order they were first added. Because the elements are also linked in a chain, iterating costs O(size), not O(capacity + size) as in HashSet.',
        'This makes LinkedHashSet <strong>faster to iterate</strong> than HashSet when the set is large but sparse. Streams over it are <strong>ordered</strong> streams.',
        r'''// LinkedHashSet iteration is in insertion order
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class LinkedHashSetWalkDemo {
    public static void main(String[] args) {
        Set<String> route = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur", "Indore"));

        for (String stop : route) {
            System.out.println("Stop: " + stop);
        }

        Iterator<String> it = route.iterator();
        it.next();
        it.remove();                                          // remove the first stop through the iterator
        System.out.println("After removing first: " + route);

        System.out.println("stream : " + route.stream().map(String::toUpperCase).toList());
        System.out.println("array  : " + Arrays.toString(route.toArray(new String[0])));
    }
}
''' + OUT),

    section('Java 21: the first and the last element', 'Java 21 made <code>LinkedHashSet</code> a <code>SequencedSet</code>, which finally gives direct access to both ends.'),
    method(
        'getFirst, getLast, removeFirst, removeLast and reversed', 'E getFirst();  E getLast();  E removeFirst();  E removeLast();  SequencedSet<E> reversed()', 'the element / a reversed view', 'O(1)',
        'Read or remove the <strong>first</strong> or <strong>last</strong> element without writing a loop. On an empty set they throw <code>NoSuchElementException</code>. <code>reversed()</code> gives a view that walks from the last element to the first.',
        'Before Java 21 you had to iterate to the end to find the last element. <code>reversed()</code> is a live view, not a copy.',
        r'''// LinkedHashSet getFirst / getLast / removeFirst / removeLast / reversed (Java 21)
import java.util.LinkedHashSet;
import java.util.List;

public class LinkedHashSetEndsDemo {
    public static void main(String[] args) {
        LinkedHashSet<String> forts = new LinkedHashSet<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));

        System.out.println("getFirst : " + forts.getFirst());
        System.out.println("getLast  : " + forts.getLast());
        System.out.println("reversed : " + forts.reversed());

        System.out.println("removeFirst : " + forts.removeFirst());
        System.out.println("removeLast  : " + forts.removeLast());
        System.out.println("Remaining   : " + forts);
    }
}
''' + OUT),
    method(
        'addFirst(E) and addLast(E)  (Java 21)', 'void addFirst(E e);  void addLast(E e)', 'nothing (void)', 'O(1)',
        'Add an element at the <strong>front</strong> or the <strong>end</strong>. If the element is <strong>already in the set it is moved</strong> to that position. This is the first way to re-order a LinkedHashSet without rebuilding it.',
        'This is different from <code>add</code>, which never moves an existing element. It makes <code>LinkedHashSet</code> usable as a simple "move to front" structure.',
        r'''// LinkedHashSet addFirst / addLast move existing elements (Java 21)
import java.util.LinkedHashSet;
import java.util.List;

public class LinkedHashSetMoveDemo {
    public static void main(String[] args) {
        LinkedHashSet<String> forts = new LinkedHashSet<>(List.of("Raigad", "Sinhagad", "Torna"));

        forts.add("Raigad");            // plain add: no change, Raigad stays first
        System.out.println("add       : " + forts);

        forts.addLast("Raigad");        // moves Raigad to the end
        System.out.println("addLast   : " + forts);

        forts.addFirst("Torna");        // moves Torna to the front
        forts.addFirst("Purandar");     // a new element goes to the front
        System.out.println("addFirst  : " + forts);
    }
}
''' + OUT),
    method(
        'clone, equals, hashCode and toString', 'Object clone();  boolean equals(Object);  int hashCode();  String toString()', 'copy / comparison / hash / text', 'O(n)',
        '<code>clone</code> makes a shallow copy that keeps the order. <code>equals</code> follows the <code>Set</code> rule: same elements means equal, and <strong>order is ignored</strong>. <code>toString</code> prints the elements in insertion order.',
        'Even though it is ordered, <code>LinkedHashSet.equals</code> does <strong>not</strong> compare the order (a <code>List</code> would). Two sets with the same elements in different order are equal and have the same hash code.',
        r'''// LinkedHashSet clone / equals: order is ignored by equals()
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class LinkedHashSetEqualsDemo {
    public static void main(String[] args) {
        LinkedHashSet<String> a = new LinkedHashSet<>(List.of("Raigad", "Torna", "Purandar"));
        Set<String> b = new LinkedHashSet<>(List.of("Purandar", "Raigad", "Torna"));   // other order

        System.out.println("a          : " + a);
        System.out.println("b          : " + b);
        System.out.println("a.equals(b): " + a.equals(b));                // same elements -> equal

        @SuppressWarnings("unchecked")
        LinkedHashSet<String> copy = (LinkedHashSet<String>) a.clone();
        copy.add("Lohagad");
        System.out.println("clone      : " + copy + " (original " + a + ")");
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'How LinkedHashSet works inside',
        'LinkedHashSet is a HashSet whose internal map is a <code>LinkedHashMap</code>.',
        [
            'The constructor calls <code>super(capacity, loadFactor, true)</code>, a package-private HashSet constructor that creates a <code>LinkedHashMap</code> instead of a plain HashMap.',
            'Each entry carries <code>before</code> and <code>after</code> references. The map keeps <code>head</code> (eldest) and <code>tail</code> (youngest) so iteration just follows <code>after</code> pointers.',
            'Lookups still go through the hash table, so <code>contains</code>/<code>add</code>/<code>remove</code> are O(1) like HashSet.',
            'Memory: two extra references (8 bytes with compressed pointers) per element on top of the HashMap entry.',
            'Iteration is O(size) because it ignores empty buckets (HashSet iteration is O(capacity + size)).',
            'The "access order" mode (for LRU caches) exists only on <code>LinkedHashMap</code>, not on LinkedHashSet.',
        ],
    ),
    (
        '<h3>HashSet, LinkedHashSet and TreeSet side by side</h3>\n'
        + table(['', 'HashSet', 'LinkedHashSet', 'TreeSet'], [
            ['Order', 'None', '<strong>Insertion order</strong>', 'Sorted'],
            ['add / remove / contains', 'O(1)', 'O(1)', 'O(log n)'],
            ['Iteration', 'O(capacity + n)', 'O(n)', 'O(n)'],
            ['Memory', 'Lowest', 'A bit more', 'Most (tree nodes)'],
            ['null', 'One', 'One', 'No'],
            ['Use for', 'Plain uniqueness', 'Uniqueness + stable order', 'Sorted data'],
        ]),
        [],
    ),
    (
        '<h3>Trap: you cannot sort a LinkedHashSet or index into it</h3>\n'
        + ul([
            'A set has no <code>get(i)</code> and no <code>sort</code>. To sort, copy into a <code>TreeSet</code> or a <code>List</code>.',
            'To get an element by position, copy to a list: <code>new ArrayList&lt;&gt;(set).get(i)</code>.',
        ]),
        [r'''// Sorting or indexing a LinkedHashSet means copying it
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class LinkedHashSetSortIndexDemo {
    public static void main(String[] args) {
        Set<String> forts = new LinkedHashSet<>(List.of("Torna", "Raigad", "Sinhagad", "Purandar"));

        Set<String> sorted = new TreeSet<>(forts);                 // sorted copy, set stays unique
        System.out.println("Sorted set : " + sorted);

        List<String> list = new ArrayList<>(forts);                 // a list gives index access ...
        System.out.println("Third fort : " + list.get(2));
        Collections.sort(list, Collections.reverseOrder());        // ... and sorting
        System.out.println("Z to A     : " + list);
        System.out.println("Original   : " + forts);                // unchanged
    }
}
''' + OUT],
    ),
    section(
        'Best practices',
        'When and how to use LinkedHashSet well.',
        [
            'Choose it when you need uniqueness <strong>and</strong> a predictable order, for example to remove duplicates from a list without reordering.',
            'Prefer plain <code>HashSet</code> when order does not matter: it uses less memory.',
            'Use immutable elements and consistent <code>equals</code>/<code>hashCode</code>, as for any hash-based collection.',
            'Use <code>getFirst</code>/<code>getLast</code>/<code>reversed</code> (Java 21) instead of iterating to find the ends.',
            'For an LRU cache use <code>LinkedHashMap</code> with access order, not a set.',
        ],
    ),
    (
        '<h3>Real example: a "recently visited" list without repeats</h3>\n<p>Each visit moves a fort to the end of the list; the set never holds a fort twice, and the oldest visit is easy to drop.</p>',
        [r'''// Recently visited forts: no repeats, newest last, only the latest 3 kept
import java.util.LinkedHashSet;

public class RecentlyVisitedDemo {
    static final int LIMIT = 3;

    static void visit(LinkedHashSet<String> recent, String fort) {
        recent.addLast(fort);                         // new fort goes to the end; a repeat moves to the end
        if (recent.size() > LIMIT) {
            recent.removeFirst();                      // drop the oldest visit
        }
    }

    public static void main(String[] args) {
        LinkedHashSet<String> recent = new LinkedHashSet<>();

        for (String fort : new String[] {"Raigad", "Sinhagad", "Torna", "Raigad", "Purandar", "Lohagad"}) {
            visit(recent, fort);
            System.out.println("Visited " + fort + " -> " + recent);
        }
    }
}
''' + OUT],
    ),
]

QA = [
    ('What is a LinkedHashSet?',
     'A HashSet that also keeps a doubly linked list through its entries, so it stores unique elements and iterates them in insertion order, with O(1) add/remove/contains.'),
    ('Difference between HashSet and LinkedHashSet?',
     'HashSet has no defined order and uses less memory; LinkedHashSet iterates in insertion order and has two extra references per entry. Both are O(1) for add, remove and contains.'),
    ('How is LinkedHashSet implemented?',
     'It extends HashSet and constructs a LinkedHashMap as the backing map; each entry has before/after links, and the map keeps head and tail.'),
    ('What happens if you add an element that already exists?',
     'The set is unchanged and the element keeps its original position (plain add never moves it). With Java 21 addFirst/addLast do move an existing element.'),
    ('Does equals() on a LinkedHashSet consider order?',
     'No. Two sets with the same elements are equal regardless of order.'),
    ('How do you remove duplicates from a list and keep the order?',
     'new ArrayList<>(new LinkedHashSet<>(list)).'),
    ('Why is iteration over LinkedHashSet faster than HashSet for sparse tables?',
     'LinkedHashSet follows the chain of entries (O(size)), while HashSet iterates over all buckets (O(capacity + size)).'),
    ('What did Java 21 add to LinkedHashSet?',
     'The SequencedSet methods: getFirst, getLast, addFirst, addLast, removeFirst, removeLast and reversed.'),
    ('Does LinkedHashSet allow null?',
     'Yes, one null element, like HashSet.'),
    ('Is LinkedHashSet thread-safe?',
     'No. Wrap with Collections.synchronizedSet or use a concurrent structure.'),
]

TOPIC = dict(id='linkedhashset', name='LinkedHashSet', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
