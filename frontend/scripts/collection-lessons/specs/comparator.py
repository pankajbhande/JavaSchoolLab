"""Comparator lesson. Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

FORT = r'''    record Fort(String name, String district, int heightMetres, int trekHours) { }

    static List<Fort> sample() {
        return new ArrayList<>(List.of(
            new Fort("Torna", "Pune", 1403, 5),
            new Fort("Raigad", "Raigad", 820, 6),
            new Fort("Lohagad", "Pune", 1033, 2),
            new Fort("Panhala", "Kolhapur", 845, 1),
            new Fort("Purandar", "Pune", 1374, 3)));
    }
'''

BEGINNER = [
    section(
        'What is a Comparator?',
        'A <strong>Comparator</strong> is a small object that says <strong>how to order two objects</strong>, kept outside the class. '
        'Use it when a class has no natural order, when you cannot edit the class, or when you need <strong>several different orders</strong> (by name, by height, by trek time...).',
        [
            'Package <code>java.util</code>. The interface is <code>Comparator&lt;T&gt;</code>.',
            'The one abstract method: <code>int compare(T a, T b)</code> (negative: a first, zero: equal, positive: b first). Because there is only one, a Comparator can be written as a <strong>lambda</strong>.',
            'Many <strong>ready-made helper methods</strong> (<code>comparing</code>, <code>thenComparing</code>, <code>reversed</code>, <code>naturalOrder</code>, <code>nullsFirst</code>...) build comparators in one line.',
            'Pass it to <code>list.sort(c)</code>, <code>Collections.sort(list, c)</code>, <code>Arrays.sort(a, c)</code>, <code>new TreeSet&lt;&gt;(c)</code>, <code>new TreeMap&lt;&gt;(c)</code>, <code>new PriorityQueue&lt;&gt;(c)</code> and <code>stream.sorted(c)</code>.',
        ],
    ),
    (
        '<h3>Where Comparator sits</h3>\n'
        + hierarchy([
            ('Comparator&lt;T&gt;', 'I', True, None, G), ('Lambda / method reference', 'c', False, 'implemented by', B), ('Comparator.comparing(...) results', 'c', False, 'returned by', G),
        ])
        + '\n<p>(I) = interface, (c) = class. Comparator is a <code>@FunctionalInterface</code>.</p>',
        [],
    ),
    (
        '<h3>Your first Comparator: three ways to write the same thing</h3>\n'
        + ul([
            '<strong>Anonymous class</strong>: the long, classic form.',
            '<strong>Lambda</strong>: <code>(a, b) -&gt; a.name().compareTo(b.name())</code>.',
            '<strong>Helper method</strong>: <code>Comparator.comparing(Fort::name)</code>: shortest and clearest.',
        ]),
        [r'''// One order (by name), written three ways
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorFirstDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> a = sample();
        a.sort(new Comparator<Fort>() {                               // 1. anonymous class
            @Override
            public int compare(Fort x, Fort y) {
                return x.name().compareTo(y.name());
            }
        });

        List<Fort> b = sample();
        b.sort((x, y) -> x.name().compareTo(y.name()));              // 2. lambda

        List<Fort> c = sample();
        c.sort(Comparator.comparing(Fort::name));                    // 3. helper method

        System.out.println("Same result: " + (a.equals(b) && b.equals(c)));
        c.forEach(f -> System.out.println(f.name()));
    }
}
''' + OUT],
    ),
    (
        '<h3>All Comparator methods at a glance</h3>\n'
        + table(['Method', 'What it does'], [
            ['<strong>compare(a, b)</strong>', 'The one abstract method: orders two objects'],
            ['<strong>Comparator.comparing(keyExtractor)</strong>', 'Order by a field (any Comparable)'],
            ['<strong>comparing(keyExtractor, keyComparator)</strong>', 'Order by a field with your own comparator for it'],
            ['<strong>comparingInt / comparingLong / comparingDouble</strong>', 'Order by a primitive field, no boxing'],
            ['<strong>thenComparing(...)</strong>', 'Tie-breaker when the first order says equal'],
            ['<strong>thenComparingInt / Long / Double</strong>', 'Tie-breaker on a primitive field'],
            ['<strong>reversed()</strong>', 'The opposite order'],
            ['<strong>Comparator.naturalOrder() / reverseOrder()</strong>', 'compareTo order / its opposite'],
            ['<strong>Comparator.nullsFirst(c) / nullsLast(c)</strong>', 'Handle null elements safely'],
            ['<strong>Collections.reverseOrder()</strong>', 'Reverse of the natural order (older style)'],
            ['<strong>equals(obj)</strong>', 'Inherited; rarely used'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Building comparators with comparing()', 'Name the field and let Java do the comparing.'),
    method(
        'Comparator.comparing(keyExtractor)', 'static &lt;T, U extends Comparable&gt; Comparator&lt;T&gt; comparing(Function&lt;T, U&gt; keyExtractor)', 'a <code>Comparator</code>', 'O(1) to create',
        'Pass a method reference to the field you want to sort by. The result orders objects by that field using its natural order (strings A to Z, numbers small to large).',
        'The key must be <code>Comparable</code>. For an <code>int</code> field prefer <code>comparingInt</code> (no boxing).',
        r'''// Comparator.comparing: sort by name and by district
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorComparingDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();

        forts.sort(Comparator.comparing(Fort::name));
        System.out.print("By name     : ");
        forts.forEach(f -> System.out.print(f.name() + " "));

        forts.sort(Comparator.comparing(Fort::district));
        System.out.print("\nBy district : ");
        forts.forEach(f -> System.out.print(f.name() + "(" + f.district() + ") "));
        System.out.println();
    }
}
''' + OUT),
    method(
        'comparingInt, comparingLong and comparingDouble', 'static Comparator&lt;T&gt; comparingInt(ToIntFunction&lt;T&gt;);  comparingLong(...);  comparingDouble(...)', 'a <code>Comparator</code>', 'O(1) to create',
        'Same as <code>comparing</code> but for <code>int</code>, <code>long</code> and <code>double</code> fields, <strong>without boxing</strong> every value into an object. Use them for numbers.',
        'Numbers sort <strong>ascending</strong> by default: smallest first. Add <code>.reversed()</code> for largest first.',
        r'''// comparingInt: sort forts by height, lowest first
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorComparingIntDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();

        forts.sort(Comparator.comparingInt(Fort::heightMetres));
        for (Fort f : forts) {
            System.out.println(f.name() + " " + f.heightMetres() + "m");
        }
    }
}
''' + OUT),
    method(
        'reversed()', 'default Comparator&lt;T&gt; reversed()', 'the opposite <code>Comparator</code>', 'O(1)',
        'Turns any comparator around: ascending becomes descending. Call it on a ready comparator.',
        'With a lambda comparator, Java may not infer the type, so write <code>Comparator.comparingInt(Fort::heightMetres).reversed()</code> (works) rather than starting from an untyped lambda.',
        r'''// reversed(): tallest fort first
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorReversedDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();

        forts.sort(Comparator.comparingInt(Fort::heightMetres).reversed());
        for (Fort f : forts) {
            System.out.println(f.name() + " " + f.heightMetres() + "m");
        }
    }
}
''' + OUT),
    method(
        'thenComparing(...) and thenComparingInt(...)', 'default Comparator&lt;T&gt; thenComparing(Comparator / Function);  thenComparingInt(ToIntFunction)', 'a <code>Comparator</code> with a tie-breaker', 'O(1) to create',
        'Sort by one field first, then break ties with another: district, <em>then</em> name. Chain as many as you need.',
        'The later comparators are used <strong>only when all earlier ones return 0</strong>. Add <code>.reversed()</code> after a single step to reverse just that step, not the whole chain.',
        r'''// thenComparing: district first, then tallest first inside a district
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorThenDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();

        Comparator<Fort> order = Comparator.comparing(Fort::district)
            .thenComparing(Comparator.comparingInt(Fort::heightMetres).reversed());

        forts.sort(order);
        for (Fort f : forts) {
            System.out.println(f.district() + " / " + f.name() + " " + f.heightMetres() + "m");
        }
    }
}
''' + OUT),
    method(
        'comparing(keyExtractor, keyComparator)', 'static Comparator&lt;T&gt; comparing(Function&lt;T, U&gt; key, Comparator&lt;U&gt; keyComparator)', 'a <code>Comparator</code>', 'O(1) to create',
        'Compare by a field using <strong>your own rule</strong> for that field, for example case-insensitive text or reverse order.',
        '<code>String.CASE_INSENSITIVE_ORDER</code> is a ready comparator for text that ignores upper and lower case.',
        r'''// comparing(key, keyComparator): case-insensitive name order
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorKeyComparatorDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("torna", "Raigad", "lohagad", "Panhala"));

        forts.sort(Comparator.naturalOrder());
        System.out.println("natural (capitals first) : " + forts);

        forts.sort(String.CASE_INSENSITIVE_ORDER);
        System.out.println("ignore case              : " + forts);

        forts.sort(Comparator.comparing(String::length, Comparator.reverseOrder()));
        System.out.println("longest name first       : " + forts);
    }
}
''' + OUT),
    method(
        'naturalOrder(), reverseOrder() and Collections.reverseOrder()', 'static Comparator&lt;T&gt; naturalOrder();  static Comparator&lt;T&gt; reverseOrder();  Collections.reverseOrder()', 'a <code>Comparator</code>', 'O(1)',
        '<code>naturalOrder()</code> uses <code>compareTo</code>; <code>reverseOrder()</code> is its opposite. They are handy for <code>TreeSet</code>, <code>PriorityQueue</code> and sorting lists of strings or numbers.',
        '<code>Collections.reverseOrder()</code> does the same as <code>Comparator.reverseOrder()</code> (the older way). <code>Collections.reverseOrder(c)</code> reverses any comparator.',
        r'''// naturalOrder / reverseOrder with lists, TreeSet and PriorityQueue
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.TreeSet;

public class ComparatorNaturalReverseDemo {
    public static void main(String[] args) {
        List<Integer> altitudes = new ArrayList<>(List.of(800, 100, 1200, 400));
        altitudes.sort(Comparator.reverseOrder());
        System.out.println("List, high to low : " + altitudes);

        TreeSet<String> cities = new TreeSet<>(Collections.reverseOrder());
        cities.addAll(List.of("Pune", "Nagpur", "Mumbai"));
        System.out.println("TreeSet, Z to A   : " + cities);

        PriorityQueue<Integer> queue = new PriorityQueue<>(Comparator.reverseOrder());   // max-heap
        queue.addAll(List.of(5, 9, 2));
        System.out.println("Max-heap poll     : " + queue.poll());
    }
}
''' + OUT),
    method(
        'nullsFirst(c) and nullsLast(c)', 'static Comparator&lt;T&gt; nullsFirst(Comparator&lt;T&gt;);  static Comparator&lt;T&gt; nullsLast(Comparator&lt;T&gt;)', 'a null-safe <code>Comparator</code>', 'O(1)',
        'Normal comparators throw <code>NullPointerException</code> on a null element or key. These wrappers place the nulls at the start or at the end and use your comparator for the rest.',
        'Use them whenever a sort key can be missing (an optional district, an unset date).',
        r'''// nullsFirst / nullsLast: sorting data that has missing values
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorNullsDemo {
    public static void main(String[] args) {
        List<String> districts = new ArrayList<>(List.of("Pune", "Raigad"));
        districts.add(null);
        districts.add("Kolhapur");

        districts.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
        System.out.println("nulls first : " + districts);

        districts.sort(Comparator.nullsLast(Comparator.naturalOrder()));
        System.out.println("nulls last  : " + districts);
    }
}
''' + OUT),

    section('Where comparators are used', 'The same comparator works everywhere ordering is needed.'),
    method(
        'Sorted containers and streams', 'new TreeSet&lt;&gt;(c);  new TreeMap&lt;&gt;(c);  new PriorityQueue&lt;&gt;(c);  stream.sorted(c);  Collections.max(list, c)', 'ordered containers / sorted stream', 'O(log n) per add, O(n log n) to sort',
        'Hand the comparator to the container or to the stream and it orders (and finds the biggest and smallest) by your rule.',
        'In a TreeSet or TreeMap the comparator also decides what counts as a <strong>duplicate</strong>, so include enough fields (a tie-breaker) to keep different objects apart.',
        r'''// One comparator used by TreeSet, PriorityQueue, stream and max/min
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.TreeSet;

public class ComparatorWhereDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        Comparator<Fort> byHeight = Comparator.comparingInt(Fort::heightMetres);

        TreeSet<Fort> tree = new TreeSet<>(byHeight.thenComparing(Fort::name));
        tree.addAll(sample());
        System.out.println("TreeSet first : " + tree.first().name());

        PriorityQueue<Fort> queue = new PriorityQueue<>(byHeight);
        queue.addAll(sample());
        System.out.println("Queue lowest  : " + queue.poll().name());

        List<String> sorted = sample().stream().sorted(byHeight.reversed()).map(Fort::name).toList();
        System.out.println("Stream, tall first : " + sorted);

        System.out.println("max / min     : " + Collections.max(sample(), byHeight).name() + " / " + Collections.min(sample(), byHeight).name());
    }
}
''' + OUT),
    method(
        'A comparator as a reusable class', 'class ByHeight implements Comparator&lt;Fort&gt;', 'a named comparator', 'O(1) per compare',
        'When the same order is used in many places, or has some logic, give it a name: a small class (or a static final constant) that implements <code>Comparator</code>.',
        'A named comparator can be unit-tested and reused. A <code>static final Comparator&lt;Fort&gt;</code> constant inside the class is a neat middle path.',
        r'''// A named, reusable Comparator class
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorClassDemo {
''' + FORT + r'''
    static class ByTrekHours implements Comparator<Fort> {
        @Override
        public int compare(Fort a, Fort b) {
            return Integer.compare(a.trekHours(), b.trekHours());
        }
    }

    public static void main(String[] args) {
        List<Fort> forts = sample();
        forts.sort(new ByTrekHours());                                // quickest trek first
        for (Fort f : forts) {
            System.out.println(f.name() + " " + f.trekHours() + "h");
        }
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'Rules of a correct comparator',
        'The same contract as <code>compareTo</code>, and the sorting algorithm depends on it.',
        [
            '<strong>Antisymmetric</strong>: <code>sign(compare(a, b)) == -sign(compare(b, a))</code>.',
            '<strong>Transitive</strong>: if <code>a &lt; b</code> and <code>b &lt; c</code> then <code>a &lt; c</code>.',
            'A broken comparator can make <code>sort</code> throw <code>IllegalArgumentException: Comparison method violates its general contract</code>, or silently give a wrong order.',
            'Avoid subtraction: <code>a.x - b.x</code> overflows. Use <code>Integer.compare</code>.',
            'It should be <strong>consistent with equals</strong> when used in a TreeSet or TreeMap, or two "different" objects will be merged.',
            'Sorting objects is <strong>stable</strong> (TimSort); sorting primitives is not stable but it does not matter there.',
        ],
    ),
    (
        '<h3>Trap: reversed() applies to the whole chain</h3>',
        [r'''// reversed() reverses everything before it
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorReversedTrapDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        // Wanted: district A to Z, tallest first inside each district
        Comparator<Fort> wrong = Comparator.comparing(Fort::district).thenComparingInt(Fort::heightMetres).reversed();
        Comparator<Fort> right = Comparator.comparing(Fort::district).thenComparing(Comparator.comparingInt(Fort::heightMetres).reversed());

        List<Fort> a = sample();
        a.sort(wrong);
        System.out.print("wrong (districts also reversed): ");
        a.forEach(f -> System.out.print(f.district() + ":" + f.name() + " "));

        List<Fort> b = sample();
        b.sort(right);
        System.out.print("\nright                          : ");
        b.forEach(f -> System.out.print(f.district() + ":" + f.name() + " "));
        System.out.println();
    }
}
''' + OUT],
    ),
    (
        '<h3>Trap: a TreeSet comparator that is too loose</h3>',
        [r'''// A TreeSet comparator on one field silently drops forts that tie
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;

public class ComparatorTreeSetTrapDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        TreeSet<Fort> byDistrict = new TreeSet<>(Comparator.comparing(Fort::district));
        byDistrict.addAll(sample());
        System.out.println("District only  : " + byDistrict.size() + " of 5 forts kept");

        TreeSet<Fort> withTieBreak = new TreeSet<>(Comparator.comparing(Fort::district).thenComparing(Fort::name));
        withTieBreak.addAll(sample());
        System.out.println("With tie-break : " + withTieBreak.size() + " of 5 forts kept");
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example: grouping and ranking</h3>\n<p>Comparators combine with streams to answer "rank the forts" questions in a few lines.</p>',
        [r'''// Rank forts: toughest trek first, then by name; top 3
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorRankDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        Comparator<Fort> toughestFirst = Comparator.comparingInt(Fort::trekHours).reversed().thenComparing(Fort::name);

        List<Fort> top3 = sample().stream().sorted(toughestFirst).limit(3).toList();
        int rank = 1;
        for (Fort f : top3) {
            System.out.println(rank++ + ". " + f.name() + " (" + f.trekHours() + " hours)");
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>Comparator versus Comparable</h3>\n'
        + table(['', 'Comparator', 'Comparable'], [
            ['Method', '<code>compare(a, b)</code>', '<code>compareTo(other)</code>'],
            ['Where', 'Separate object / lambda', 'Inside the class'],
            ['Orders per class', '<strong>Many</strong>', 'One'],
            ['Works on classes you cannot edit', '<strong>Yes</strong>', 'No'],
            ['Helper methods', 'comparing, thenComparing, reversed, nullsFirst...', 'None'],
            ['Package', 'java.util', 'java.lang'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Build comparators from small pieces.',
        [
            'Prefer <code>Comparator.comparing(...).thenComparing(...)</code> over hand-written <code>compare</code> methods.',
            'Use <code>comparingInt / Long / Double</code> for primitive fields; never subtract.',
            'Add a tie-breaker so the order is total, especially for TreeSet and TreeMap.',
            'Use <code>nullsFirst / nullsLast</code> when keys can be null.',
            'Keep reusable comparators as <code>static final</code> constants and give them clear names.',
            'Remember that <code>reversed()</code> reverses the entire chain built so far.',
        ],
    ),
]

QA = [
    ('What is a Comparator?',
     'A functional interface with compare(a, b) that defines an ordering outside the class; it can be passed to sort methods and sorted collections.'),
    ('Comparable vs Comparator?',
     'Comparable: one natural order inside the class (compareTo). Comparator: any number of external orders (compare), usable on classes you cannot modify.'),
    ('Is Comparator a functional interface?',
     'Yes (@FunctionalInterface): it has one abstract method, compare, so lambdas and method references work. equals is inherited from Object and does not count.'),
    ('How do you sort by two fields?',
     'Comparator.comparing(A::x).thenComparing(A::y).'),
    ('How do you sort in descending order?',
     'Add .reversed() to a comparator, or use Comparator.reverseOrder() for natural order. Be careful that reversed() reverses the whole chain built so far.'),
    ('How do you sort a list containing nulls?',
     'Wrap with Comparator.nullsFirst(c) or nullsLast(c).'),
    ('Why use comparingInt instead of comparing?',
     'It avoids boxing each int into an Integer, so it is faster and uses less memory.'),
    ('What exception can a bad comparator cause?',
     'IllegalArgumentException: Comparison method violates its general contract (from TimSort), or a wrong order without any error.'),
    ('How does a Comparator affect a TreeSet?',
     'It decides both the order and equality: elements for which compare returns 0 are duplicates and only one is kept.'),
    ('How do you create a max-heap PriorityQueue?',
     'new PriorityQueue<>(Comparator.reverseOrder()) or Collections.reverseOrder().'),
    ('Is sorting a list of objects stable?',
     'Yes, list.sort and Collections.sort use TimSort, which is stable.'),
]

TOPIC = dict(id='comparator', name='Comparator Interface', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
