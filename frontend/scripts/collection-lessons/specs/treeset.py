"""TreeSet lesson: a sorted set (NavigableSet) backed by a red-black tree. Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a TreeSet?',
        'A <strong>TreeSet</strong> is a set that keeps its elements <strong>sorted at all times</strong>. Add forts in any order and they come out alphabetically; add numbers and they come out from small to large. '
        'It also never holds duplicates, and it can answer questions such as "which fort comes right after Raigad?" or "give me all forts between P and S".',
        [
            'Package <code>java.util</code>. Implements <code>NavigableSet</code> (which extends <code>SortedSet</code>, which extends <code>Set</code>).',
            '<strong>Sorted order:</strong> by the elements\' <strong>natural order</strong> (<code>Comparable</code>) or by a <code>Comparator</code> you supply.',
            '<strong>No duplicates:</strong> "duplicate" means <code>compareTo</code> / <code>compare</code> returns 0, <em>not</em> <code>equals()</code>.',
            '<strong>Slower than HashSet:</strong> add, remove and contains are <strong>O(log n)</strong> because it is a balanced tree.',
            '<strong>No null</strong> with natural ordering (it cannot compare null). <strong>Not thread-safe.</strong>',
            'Elements must be mutually comparable, otherwise <code>ClassCastException</code>.',
            'Use it when you need <strong>sorted output</strong> or <strong>range and neighbour queries</strong>.',
        ],
    ),
    (
        '<h3>Where TreeSet sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Collection', 'I', True, None, G), ('Set', 'I', True, 'extends', G), ('SortedSet', 'I', True, 'extends', G), ('NavigableSet', 'I', True, 'extends', G),
            ('TreeSet', 'c', False, 'implements', B),
        ])
        + '\n<p>(I) = interface, (c) = class. TreeSet extends <code>AbstractSet</code> and is built on a <code>TreeMap</code>.</p>',
        [],
    ),
    (
        '<h3>Creating a TreeSet: four constructors</h3>\n'
        + ul([
            '<code>new TreeSet&lt;&gt;()</code>: natural ordering of the elements.',
            '<code>new TreeSet&lt;&gt;(Comparator c)</code>: your own ordering.',
            '<code>new TreeSet&lt;&gt;(Collection c)</code>: copy with natural ordering, duplicates dropped.',
            '<code>new TreeSet&lt;&gt;(SortedSet s)</code>: copy that keeps the ordering of s.',
        ]),
        [r'''// TreeSet constructors: natural order, custom order, copy
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class TreeSetCreateDemo {
    public static void main(String[] args) {
        List<String> forts = List.of("Torna", "Raigad", "Sinhagad", "Purandar", "Raigad");

        Set<String> natural = new TreeSet<>(forts);                         // A to Z, duplicate Raigad dropped
        Set<String> reverse = new TreeSet<>(Comparator.reverseOrder());     // Z to A
        reverse.addAll(forts);
        Set<String> byLength = new TreeSet<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        byLength.addAll(forts);

        System.out.println("Natural  : " + natural);
        System.out.println("Reverse  : " + reverse);
        System.out.println("By length: " + byLength);
    }
}
''' + OUT],
    ),
    (
        '<h3>All TreeSet methods at a glance</h3>\n<p><em>n</em> is the number of elements.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>add(e)</strong> / <strong>addAll(c)</strong>', 'Adds in sorted position', 'O(log n)'],
            ['<strong>remove(o)</strong> / <strong>removeIf(p)</strong> / <strong>clear()</strong>', 'Removes elements', 'O(log n) / O(n)'],
            ['<strong>contains(o)</strong> / <strong>size()</strong> / <strong>isEmpty()</strong>', 'Lookup / count', 'O(log n) / O(1)'],
            ['<strong>first()</strong> / <strong>last()</strong>', 'Smallest / largest element (throws if empty)', 'O(log n)'],
            ['<strong>pollFirst()</strong> / <strong>pollLast()</strong>', 'Remove and return smallest / largest (null if empty)', 'O(log n)'],
            ['<strong>lower(e)</strong> / <strong>floor(e)</strong>', 'Greatest element &lt; e / &le; e', 'O(log n)'],
            ['<strong>higher(e)</strong> / <strong>ceiling(e)</strong>', 'Smallest element &gt; e / &ge; e', 'O(log n)'],
            ['<strong>headSet(to)</strong> / <strong>tailSet(from)</strong> / <strong>subSet(a, b)</strong>', 'Range views', 'O(log n)'],
            ['<strong>descendingSet()</strong> / <strong>descendingIterator()</strong>', 'Reverse order view / iterator', 'O(1)'],
            ['<strong>iterator()</strong> / <strong>forEach(a)</strong> / <strong>stream()</strong>', 'Walk in sorted order', 'O(n)'],
            ['<strong>comparator()</strong>', 'The Comparator in use (null for natural order)', 'O(1)'],
            ['<strong>clone()</strong> / <strong>equals</strong> / <strong>toString</strong>', 'Copy and compare', 'O(n)'],
            ['<strong>reversed()</strong> / <strong>getFirst()</strong> / <strong>getLast()</strong>', 'Java 21 sequenced methods', 'O(1) / O(log n)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Adding and the sorted order', 'Whatever order you add in, the elements are kept sorted.'),
    method(
        'add(E e) and addAll(Collection c)', 'boolean add(E e);  boolean addAll(Collection<? extends E> c)', '<code>true</code> if the element was new', 'O(log n)',
        'Inserts the element at the position that keeps the set sorted. If an element that compares as <strong>equal (compareTo returns 0)</strong> is already present, nothing is added.',
        'The tree walks from the root comparing with <code>compareTo</code> (or the comparator), so the cost is the height of the tree: O(log n). Because uniqueness is decided by the comparison, a comparator that ignores a field also treats elements that differ in that field as duplicates (see the trap below).',
        r'''// TreeSet add(E e): keeps the set sorted, ignores duplicates
import java.util.Set;
import java.util.TreeSet;

public class TreeSetAddDemo {
    public static void main(String[] args) {
        Set<String> cities = new TreeSet<>();

        cities.add("Pune");
        cities.add("Agra");
        cities.add("Pune");   // duplicate, ignored

        System.out.println(cities);   // sorted A to Z
    }
}
''' + OUT, extra_codes=(r'''// TreeSet addAll(Collection c): adds many at once
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class TreeSetAddAllDemo {
    public static void main(String[] args) {
        Set<String> cities = new TreeSet<>();

        cities.addAll(List.of("Pune", "Agra", "Nashik"));

        System.out.println(cities);
    }
}
''' + OUT,)),
    method(
        'remove, contains, size, isEmpty and clear', 'boolean remove(Object o);  boolean contains(Object o);  int size();  boolean isEmpty();  void clear()', '<code>true</code> / <code>false</code> / count', 'O(log n)',
        'Remove and look up by value, count the elements, or remove all. The set stays sorted after every change.',
        'Lookups use the same comparison as <code>add</code>, so they need a comparable argument; <code>contains(null)</code> throws <code>NullPointerException</code> with natural ordering.',
        r'''// TreeSet contains(Object o): is the value present?
import java.util.TreeSet;

public class TreeSetContainsDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.contains(20));   // true
    }
}
''' + OUT, extra_codes=(r'''// TreeSet remove(Object o): removes one element
import java.util.TreeSet;

public class TreeSetRemoveDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        numbers.remove(20);

        System.out.println(numbers);
    }
}
''' + OUT, r'''// TreeSet size() and isEmpty()
import java.util.TreeSet;

public class TreeSetSizeDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.size());       // 4
        System.out.println(numbers.isEmpty());    // false
    }
}
''' + OUT, r'''// TreeSet clear(): removes everything
import java.util.TreeSet;

public class TreeSetClearDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        numbers.clear();

        System.out.println(numbers);
    }
}
''' + OUT,)),

    section('The ends: first, last, pollFirst and pollLast', 'Because the set is sorted, the smallest and the largest elements are always easy to reach.'),
    method(
        'first() and last()', 'E first();  E last()', 'the smallest / the largest element', 'O(log n)',
        'Return the smallest and the largest element <strong>without removing</strong> them. On an empty set they throw <code>NoSuchElementException</code>.',
        'In Java 21, <code>getFirst()</code> and <code>getLast()</code> are the equivalent sequenced-collection names. Both walk down the left-most or right-most branch of the tree.',
        r'''// TreeSet first(): the smallest element
import java.util.TreeSet;

public class TreeSetFirstDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.first());   // 10
    }
}
''' + OUT, extra_codes=(r'''// TreeSet last(): the biggest element
import java.util.TreeSet;

public class TreeSetLastDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.last());   // 40
    }
}
''' + OUT,)),
    method(
        'pollFirst() and pollLast()', 'E pollFirst();  E pollLast()', 'the removed element, or <code>null</code> if empty', 'O(log n)',
        'Remove and return the smallest or the largest element. Use them to treat a TreeSet like a <strong>priority queue</strong> that has no duplicates: repeat <code>pollFirst</code> until it returns <code>null</code>.',
        'Safe for empty sets (they return <code>null</code>), unlike <code>removeFirst</code> in Java 21 which throws. Because a TreeSet cannot contain <code>null</code>, a null result is unambiguous here.',
        r'''// TreeSet pollFirst(): removes and returns the smallest
import java.util.TreeSet;

public class TreeSetPollFirstDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.pollFirst());   // 10
        System.out.println(numbers);
    }
}
''' + OUT, extra_codes=(r'''// TreeSet pollLast(): removes and returns the biggest
import java.util.TreeSet;

public class TreeSetPollLastDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.pollLast());   // 40
        System.out.println(numbers);
    }
}
''' + OUT,)),

    section('Neighbours: lower, floor, ceiling and higher', 'The reason people choose a TreeSet over a HashSet. Given a value, find the closest elements <strong>even if the value itself is not in the set</strong>.'),
    method(
        'lower, floor, ceiling and higher', 'E lower(E e);  E floor(E e);  E ceiling(E e);  E higher(E e)', 'the neighbour, or <code>null</code> if there is none', 'O(log n)',
        'Four "nearest element" questions: <code>lower(e)</code> = the greatest element <strong>strictly below</strong> e; <code>floor(e)</code> = the greatest element <strong>below or equal</strong>; <code>ceiling(e)</code> = the smallest element <strong>above or equal</strong>; <code>higher(e)</code> = the smallest element <strong>strictly above</strong>. Memory trick: <em>floor</em> and <em>lower</em> look down; <em>ceiling</em> and <em>higher</em> look up; <em>floor/ceiling</em> may return e itself.',
        'Each is one root-to-leaf walk. They are what make TreeSet useful for "find the next time slot", "nearest price", "which range does this value fall in". e does not have to be in the set.',
        r'''// TreeSet lower(E e): the element just smaller than e
import java.util.TreeSet;

public class TreeSetLowerDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.lower(20));   // 10
    }
}
''' + OUT, extra_codes=(r'''// TreeSet floor(E e): smaller than or equal to e
import java.util.TreeSet;

public class TreeSetFloorDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.floor(25));   // 20
    }
}
''' + OUT, r'''// TreeSet ceiling(E e): bigger than or equal to e
import java.util.TreeSet;

public class TreeSetCeilingDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.ceiling(25));   // 30
    }
}
''' + OUT, r'''// TreeSet higher(E e): the element just bigger than e
import java.util.TreeSet;

public class TreeSetHigherDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.higher(40));   // null: nothing bigger
    }
}
''' + OUT,)),

    section('Range views: headSet, tailSet and subSet', 'Take a part of the set by value. The result is a <strong>live view</strong> of the same data.'),
    method(
        'headSet, tailSet and subSet', 'SortedSet<E> headSet(E to);  NavigableSet<E> headSet(E to, boolean inclusive);  tailSet(from[, inclusive]);  subSet(from, to) / subSet(from, fromInc, to, toInc)', 'a view of that range', 'O(log n) to create',
        '<code>headSet(to)</code> = everything <strong>before</strong> to; <code>tailSet(from)</code> = everything <strong>from</strong> from onwards; <code>subSet(from, to)</code> = from (included) up to to (<strong>excluded</strong>). The longer forms let you choose whether each end is included.',
        'These are <strong>views</strong>, not copies: changing the view changes the set and vice versa, and adding an element outside the range to the view throws <code>IllegalArgumentException</code>. Wrap in <code>new TreeSet&lt;&gt;(view)</code> for an independent copy.',
        r'''// TreeSet headSet(E to): elements smaller than "to"
import java.util.TreeSet;

public class TreeSetHeadSetDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.headSet(30));   // [10, 20]
    }
}
''' + OUT, extra_codes=(r'''// TreeSet tailSet(E from): elements from "from" and bigger
import java.util.TreeSet;

public class TreeSetTailSetDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.tailSet(30));   // [30, 40]
    }
}
''' + OUT, r'''// TreeSet subSet(E from, E to): from "from" up to (not including) "to"
import java.util.TreeSet;

public class TreeSetSubSetDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.subSet(20, 40));   // [20, 30]
    }
}
''' + OUT,)),

    section('Reverse order and iteration', 'Walk the set from the end, or look at it upside down.'),
    method(
        'descendingSet(), descendingIterator() and reversed()', 'NavigableSet<E> descendingSet();  Iterator<E> descendingIterator();  NavigableSet<E> reversed()', 'a reversed view / iterator', 'O(1)',
        '<code>descendingSet()</code> shows the same elements from largest to smallest, as a live view. <code>descendingIterator()</code> walks them that way. In Java 21 <code>reversed()</code> does the same as <code>descendingSet()</code>.',
        'Views are free (no copying). Because it is a <code>NavigableSet</code> itself, you can chain operations, for example <code>set.descendingSet().headSet(x)</code>.',
        r'''// TreeSet descendingSet(): the set in reverse order
import java.util.TreeSet;

public class TreeSetDescendingSetDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.descendingSet());
    }
}
''' + OUT, extra_codes=(r'''// TreeSet descendingIterator(): loop from big to small
import java.util.Iterator;
import java.util.TreeSet;

public class TreeSetDescendingIteratorDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        Iterator<Integer> it = numbers.descendingIterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }
    }
}
''' + OUT, r'''// TreeSet reversed() (Java 21): the set in reverse order
import java.util.TreeSet;

public class TreeSetReversedDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);
        numbers.add(40);

        System.out.println(numbers.reversed());
    }
}
''' + OUT,)),
    method(
        'iterator, forEach, stream and comparator()', 'Iterator<E> iterator();  void forEach(Consumer);  Stream<E> stream();  Comparator<? super E> comparator()', 'elements in sorted order / the ordering in use', 'O(n)',
        'Iteration, <code>forEach</code> and streams all visit the elements in <strong>sorted order</strong>. <code>comparator()</code> returns the Comparator that defines the order, or <code>null</code> when natural ordering is used.',
        'Streams from a TreeSet are <code>SORTED</code> and <code>DISTINCT</code>, so <code>stream().sorted()</code> is free and <code>distinct()</code> is redundant. The iterator is fail-fast.',
        r'''// TreeSet iteration is sorted; a Comparator changes the order
import java.util.Comparator;
import java.util.TreeSet;

public class TreeSetOrderDemo {
    public static void main(String[] args) {
        TreeSet<String> cities = new TreeSet<>();
        cities.add("Pune");
        cities.add("Agra");
        for (String c : cities) {
            System.out.println(c);                     // Agra, Pune (A to Z)
        }

        TreeSet<String> reverse = new TreeSet<>(Comparator.reverseOrder());   // Z to A
        reverse.add("Pune");
        reverse.add("Agra");
        System.out.println(reverse);
    }
}
''' + OUT),
    (
        '<h3>Master program: every TreeSet method in one place</h3>\n'
        '<p>One single program that uses all the TreeSet methods you learned above, step by step. Read the numbered comments from top to bottom, run it, and match each output line with its step.</p>',
        [r'''// MASTER PROGRAM: all important TreeSet methods in one program
import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;

public class TreeSetMasterDemo {
    public static void main(String[] args) {
        // 1. Create an empty TreeSet (always sorted)
        TreeSet<Integer> numbers = new TreeSet<>();

        // 2. add and addAll: sorted, duplicates ignored
        numbers.add(30);
        numbers.add(10);
        numbers.add(30);                               // ignored
        numbers.addAll(Set.of(20, 40, 50));
        System.out.println("2. After adds    : " + numbers);

        // 3. size, isEmpty, contains
        System.out.println("3. size/contains : " + numbers.size() + " / " + numbers.contains(20));

        // 4. first and last
        System.out.println("4. first / last  : " + numbers.first() + " / " + numbers.last());

        // 5. Nearest values: lower, floor, ceiling, higher
        System.out.println("5. lower(30)     : " + numbers.lower(30));
        System.out.println("   floor(30)     : " + numbers.floor(30));
        System.out.println("   ceiling(35)   : " + numbers.ceiling(35));
        System.out.println("   higher(50)    : " + numbers.higher(50));

        // 6. Range views: headSet, tailSet, subSet
        System.out.println("6. headSet(30)   : " + numbers.headSet(30));
        System.out.println("   tailSet(30)   : " + numbers.tailSet(30));
        System.out.println("   subSet(20, 40): " + numbers.subSet(20, 40));

        // 7. Reverse order: descendingSet, reversed
        System.out.println("7. descending    : " + numbers.descendingSet());
        System.out.println("   reversed      : " + numbers.reversed());

        // 8. Remove: remove, pollFirst, pollLast
        numbers.remove(30);
        System.out.println("8. pollFirst     : " + numbers.pollFirst());
        System.out.println("   pollLast      : " + numbers.pollLast());
        System.out.println("   Left          : " + numbers);

        // 9. A custom order with a Comparator
        TreeSet<String> cities = new TreeSet<>(Comparator.reverseOrder());
        cities.add("Pune");
        cities.add("Agra");
        System.out.println("9. Z to A        : " + cities);

        // 10. clear
        numbers.clear();
        System.out.println("10. After clear  : " + numbers);
    }
}
''' + OUT],
    ),
]

EXPERT = [
    section(
        'How TreeSet works inside',
        'A TreeSet is a thin wrapper over a <code>TreeMap&lt;E, Object&gt;</code> (the values are the shared <code>PRESENT</code> object). The TreeMap is a <strong>red-black tree</strong>.',
        [
            'A <strong>binary search tree</strong> keeps smaller elements in the left subtree and larger ones in the right subtree, so a lookup discards half of the remaining elements at each step.',
            'A plain BST can degrade into a list when you add sorted data. The <strong>red-black rules</strong> (each node red or black, no two red nodes in a row, equal black height on every path) are restored by <strong>rotations and recolouring</strong> after each insert or delete, so the height never exceeds about 2 log2(n+1).',
            'That guarantees O(log n) for add, remove, contains, floor, ceiling, first and last. One million elements need about 20 comparisons.',
            'Every node stores <code>key, value, left, right, parent</code> and a colour flag: roughly 40 bytes per element, more than HashSet.',
            'Order is defined <strong>only</strong> by <code>compareTo</code> / <code>compare</code>. <code>equals()</code> and <code>hashCode()</code> are never used.',
            'Iteration walks the tree in order via successor links: O(1) amortised per step.',
        ],
    ),
    (
        '<h3>Natural ordering: elements must be Comparable</h3>\n'
        + ul([
            'Strings, Integers, Doubles, Dates and enums are already <code>Comparable</code>.',
            'For your own class, implement <code>Comparable&lt;T&gt;</code> (one natural order) or pass a <code>Comparator</code> (any order).',
            'Adding a class that is not comparable throws <code>ClassCastException</code> on the <strong>first add</strong>.',
        ]),
        [r'''// TreeSet with your own class: Comparable, Comparator, and the ClassCastException
import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;

public class TreeSetCustomClassDemo {
    record Fort(String name, int trekHours) implements Comparable<Fort> {
        @Override public int compareTo(Fort other) {
            return name.compareTo(other.name);                    // natural order: by name
        }
    }

    static class PlainFort {                                      // NOT comparable
        final String name;
        PlainFort(String name) { this.name = name; }
    }

    public static void main(String[] args) {
        Set<Fort> byName = new TreeSet<>();
        byName.add(new Fort("Torna", 4));
        byName.add(new Fort("Raigad", 6));
        byName.add(new Fort("Purandar", 3));
        System.out.println("By name (natural)  : " + byName);

        Set<Fort> byHours = new TreeSet<>(Comparator.comparingInt(Fort::trekHours));
        byHours.addAll(byName);
        System.out.println("By trek hours      : " + byHours);

        try {
            new TreeSet<PlainFort>().add(new PlainFort("Raigad"));
        } catch (ClassCastException e) {
            System.out.println("Not Comparable     : ClassCastException");
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>Trap: the comparator decides what a "duplicate" is</h3>\n'
        + ul([
            'A TreeSet treats two elements as the same when the comparison returns <strong>0</strong>.',
            'If your comparator looks only at the <em>length</em> of a name, "Torna" and "Lohag" (both length 5) are "equal", and the second is silently <strong>not added</strong>.',
            'Always add a tie-breaker (<code>thenComparing</code>) so the comparator is <strong>consistent with equals</strong> unless you really want to merge such elements.',
        ]),
        [r'''// A comparator that ignores a field loses elements
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class TreeSetComparatorTrapDemo {
    public static void main(String[] args) {
        List<String> forts = List.of("Torna", "Raigad", "Lohag", "Purandar", "Panhala");

        Set<String> lossy = new TreeSet<>(Comparator.comparing(String::length));     // equal length == "duplicate"
        lossy.addAll(forts);
        System.out.println("Length only      : " + lossy + "  (size " + lossy.size() + " of " + forts.size() + ")");

        Set<String> safe = new TreeSet<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        safe.addAll(forts);
        System.out.println("With tie-breaker : " + safe + "  (size " + safe.size() + ")");
    }
}
''' + OUT],
    ),
    (
        '<h3>Real use: finding the nearest slot with ceiling and floor</h3>\n<p>A tour operator has fixed departure hours. For a requested hour, <code>ceiling</code> gives the next departure and <code>floor</code> the previous one: an O(log n) query a HashSet cannot answer.</p>',
        [r'''// Nearest departure for a requested time, using ceiling() and floor()
import java.util.List;
import java.util.TreeSet;

public class TreeSetNearestSlotDemo {
    public static void main(String[] args) {
        TreeSet<Integer> departures = new TreeSet<>(List.of(6, 9, 12, 15, 18));     // hours of the day

        for (int wanted : new int[] {5, 9, 10, 20}) {
            Integer next = departures.ceiling(wanted);          // first departure at or after the request
            Integer previous = departures.floor(wanted);        // last departure at or before the request
            System.out.println("Wanted " + wanted + ":00 -> next " + next + ", previous " + previous);
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>TreeSet versus HashSet versus LinkedHashSet versus ConcurrentSkipListSet</h3>\n'
        + table(['', 'TreeSet', 'HashSet', 'LinkedHashSet', 'ConcurrentSkipListSet'], [
            ['Order', '<strong>Sorted</strong>', 'None', 'Insertion', 'Sorted'],
            ['add / remove / contains', 'O(log n)', 'O(1)', 'O(1)', 'O(log n)'],
            ['Neighbour / range queries', '<strong>Yes</strong>', 'No', 'No', 'Yes'],
            ['null', 'No', 'One', 'One', 'No'],
            ['Thread-safe', 'No', 'No', 'No', '<strong>Yes</strong> (lock-free)'],
            ['Uniqueness decided by', 'compareTo / Comparator', 'equals / hashCode', 'equals / hashCode', 'compareTo / Comparator'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Use TreeSet when order matters, and use it carefully.',
        [
            'Choose TreeSet only when you need sorted iteration or neighbour/range queries; otherwise HashSet is faster.',
            'Keep the comparator <strong>consistent with equals</strong> and never throw from it; always add a tie-breaker.',
            'Use immutable elements, or at least never change a field that takes part in the comparison after adding (the element would sit in the wrong place in the tree).',
            'Do not add <code>null</code>; guard inputs.',
            'Declare as <code>NavigableSet</code> / <code>SortedSet</code> when you use their methods, or <code>Set</code> when you do not.',
            'For concurrent use choose <code>ConcurrentSkipListSet</code>.',
        ],
    ),
]

QA = [
    ('What is a TreeSet and when would you use it?',
     'A TreeSet is a sorted NavigableSet backed by a red-black tree (a TreeMap). Use it when you need unique elements in sorted order or neighbour/range queries (floor, ceiling, headSet, tailSet).'),
    ('Time complexity of TreeSet operations?',
     'add, remove, contains, first, last, floor, ceiling, higher and lower are O(log n); iteration is O(n) in sorted order.'),
    ('How does TreeSet decide whether two elements are duplicates?',
     'By compareTo (natural ordering) or the Comparator returning 0, not by equals() or hashCode().'),
    ('Can a TreeSet contain null?',
     'Not with natural ordering: comparing null throws NullPointerException. A custom comparator could accept null, but that is rare and discouraged.'),
    ('What happens if the elements are not Comparable?',
     'ClassCastException is thrown on the first add unless you supply a Comparator.'),
    ('Difference between floor, lower, ceiling and higher?',
     'lower: greatest strictly less; floor: greatest less than or equal; ceiling: smallest greater than or equal; higher: smallest strictly greater. Each returns null if no such element exists.'),
    ('What are headSet, tailSet and subSet?',
     'Live range views: headSet(to) is the elements before to, tailSet(from) from from onwards, subSet(from, to) from from (inclusive) to to (exclusive). The long forms allow choosing inclusivity.'),
    ('HashSet vs TreeSet?',
     'HashSet: unordered, O(1), one null, equals/hashCode. TreeSet: sorted, O(log n), no null, compareTo/Comparator, supports navigation and ranges.'),
    ('How is TreeSet implemented?',
     'It wraps a TreeMap, a self-balancing red-black tree where each element is a key and the value is a dummy object.'),
    ('Why is a comparator that is inconsistent with equals dangerous in a TreeSet?',
     'Elements the comparator considers equal are treated as duplicates and the later ones are silently dropped, even if equals() says they differ.'),
    ('Is TreeSet thread-safe?',
     'No. Use ConcurrentSkipListSet or Collections.synchronizedSortedSet.'),
    ('How do you get a descending view?',
     'descendingSet() (or reversed() in Java 21) returns a live reversed view; descendingIterator() returns a reverse iterator.'),
]

TOPIC = dict(id='treeset', name='TreeSet', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
