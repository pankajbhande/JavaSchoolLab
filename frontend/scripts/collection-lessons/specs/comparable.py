"""Comparable lesson. Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is Comparable?',
        '<strong>Comparable</strong> gives a class its <strong>natural order</strong>: the one default way two objects of that class are compared. '
        'It has a single method, <code>compareTo</code>. Once a class implements it, <code>Collections.sort</code>, <code>Arrays.sort</code>, <code>TreeSet</code>, <code>TreeMap</code>, <code>PriorityQueue</code> and <code>stream().sorted()</code> all know how to order it.',
        [
            'Package <code>java.lang</code> (no import needed). The interface is <code>Comparable&lt;T&gt;</code>.',
            'One method: <code>int compareTo(T other)</code>, implemented <strong>inside the class</strong> being sorted.',
            'Return <strong>negative</strong> if this object comes first, <strong>zero</strong> if equal in order, <strong>positive</strong> if this comes later.',
            '<code>String</code>, <code>Integer</code>, <code>Long</code>, <code>Double</code>, <code>Character</code>, <code>LocalDate</code>, <code>BigDecimal</code> and enums are already Comparable.',
            'There can be <strong>only one</strong> natural order per class. For other orders use <code>Comparator</code>.',
        ],
    ),
    (
        '<h3>Where Comparable sits</h3>\n'
        + hierarchy([
            ('Comparable&lt;T&gt;', 'I', True, None, G), ('String / Integer / LocalDate ...', 'c', False, 'implements', B), ('Your class (Fort)', 'c', False, 'implements', G),
        ])
        + '\n<p>(I) = interface, (c) = class. It is not part of the Collection hierarchy but sorted collections depend on it.</p>',
        [],
    ),
    (
        '<h3>The contract in one picture</h3>\n'
        + table(['compareTo returns', 'Meaning', 'Example'], [
            ['<strong>Negative</strong>', 'this comes <em>before</em> other', '<code>"Raigad".compareTo("Torna")</code> is negative'],
            ['<strong>Zero</strong>', 'same position in the order', '<code>"Torna".compareTo("Torna")</code> is 0'],
            ['<strong>Positive</strong>', 'this comes <em>after</em> other', '<code>"Torna".compareTo("Raigad")</code> is positive'],
        ]),
        [r'''// Built-in Comparable types: String, Integer, Double, Character
public class ComparableBuiltInDemo {
    public static void main(String[] args) {
        System.out.println("Raigad vs Torna      : " + "Raigad".compareTo("Torna"));       // R before T: negative
        System.out.println("Torna vs Torna       : " + "Torna".compareTo("Torna"));       // equal: 0
        System.out.println("Torna vs Raigad      : " + "Torna".compareTo("Raigad"));       // positive
        System.out.println("Integer 5 vs 9       : " + Integer.valueOf(5).compareTo(9));   // -1
        System.out.println("Double 2.5 vs 2.5    : " + Double.valueOf(2.5).compareTo(2.5));
        System.out.println("Character 'a' vs 'c' : " + Character.valueOf('a').compareTo('c'));
    }
}
''' + OUT],
    ),
]

INTERMEDIATE = [
    section('Making your own class Comparable', 'Implement <code>Comparable&lt;YourClass&gt;</code> and write <code>compareTo</code>.'),
    method(
        'compareTo(T other)', 'int compareTo(T other)', 'negative, zero or positive <code>int</code>', 'depends on your code',
        'Compare the field you want to sort by. Use the helper methods <code>Integer.compare</code>, <code>Double.compare</code>, <code>String.compareTo</code> instead of subtracting.',
        'Never write <code>return this.x - other.x</code>: the subtraction can <strong>overflow</strong> for large or negative values and give the wrong sign. <code>Integer.compare(this.x, other.x)</code> is always correct.',
        r'''// A Fort class with a natural order: by name A to Z
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ComparableFortDemo {
    static class Fort implements Comparable<Fort> {
        final String name;
        final int heightMetres;

        Fort(String name, int heightMetres) {
            this.name = name;
            this.heightMetres = heightMetres;
        }

        @Override
        public int compareTo(Fort other) {
            return this.name.compareTo(other.name);                  // natural order = by name
        }

        @Override
        public String toString() {
            return name + "(" + heightMetres + "m)";
        }
    }

    public static void main(String[] args) {
        List<Fort> forts = new ArrayList<>();
        forts.add(new Fort("Torna", 1403));
        forts.add(new Fort("Raigad", 820));
        forts.add(new Fort("Lohagad", 1033));

        Collections.sort(forts);                                     // uses compareTo
        System.out.println("Sorted by name: " + forts);
    }
}
''' + OUT),
    method(
        'Sorting with the natural order', 'Collections.sort(list);  Arrays.sort(array);  list.sort(null);  stream.sorted()', 'sorted in place / a sorted stream', 'O(n log n)',
        'Every sorting tool uses <code>compareTo</code> when you do not give a Comparator. If the class is not Comparable you get a <code>ClassCastException</code> at run time.',
        '<code>list.sort(null)</code> means "use the natural order". The sort is <strong>stable</strong> for objects: equal elements keep their relative order.',
        r'''// Natural-order sorting tools on Comparable types
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ComparableSortDemo {
    public static void main(String[] args) {
        String[] cities = {"Pune", "Nagpur", "Mumbai", "Delhi"};
        Arrays.sort(cities);                                         // array
        System.out.println("Arrays.sort      : " + Arrays.toString(cities));

        List<Integer> altitudes = new ArrayList<>(List.of(800, 100, 1200, 400));
        Collections.sort(altitudes);                                 // list
        System.out.println("Collections.sort : " + altitudes);

        List<String> forts = new ArrayList<>(List.of("Torna", "Raigad", "Lohagad"));
        forts.sort(null);                                            // null = natural order
        System.out.println("list.sort(null)  : " + forts);

        System.out.println("Max / Min        : " + Collections.max(forts) + " / " + Collections.min(forts));
    }
}
''' + OUT),
    method(
        'Sorted collections: TreeSet, TreeMap, PriorityQueue', 'new TreeSet&lt;&gt;();  new TreeMap&lt;&gt;();  new PriorityQueue&lt;&gt;()', 'sorted containers', 'O(log n) per add',
        'These containers keep elements ordered as you add them, using <code>compareTo</code>. A TreeSet of Comparable forts therefore prints in order and rejects duplicates.',
        'Here <code>compareTo</code> also decides <strong>duplicates</strong>: a TreeSet treats two objects as the same when <code>compareTo</code> returns 0, even if <code>equals</code> says they differ.',
        r'''// TreeSet and TreeMap order a Comparable class automatically
import java.util.TreeMap;
import java.util.TreeSet;

public class ComparableCollectionsDemo {
    static class Fort implements Comparable<Fort> {
        final String name;

        Fort(String name) {
            this.name = name;
        }

        @Override
        public int compareTo(Fort other) {
            return name.compareTo(other.name);
        }

        @Override
        public String toString() {
            return name;
        }
    }

    public static void main(String[] args) {
        TreeSet<Fort> forts = new TreeSet<>();
        forts.add(new Fort("Torna"));
        forts.add(new Fort("Raigad"));
        forts.add(new Fort("Lohagad"));
        forts.add(new Fort("Raigad"));                               // compareTo == 0: treated as a duplicate
        System.out.println("TreeSet : " + forts);

        TreeMap<Fort, Integer> hours = new TreeMap<>();
        hours.put(new Fort("Torna"), 5);
        hours.put(new Fort("Lohagad"), 2);
        System.out.println("TreeMap : " + hours);
    }
}
''' + OUT),

    section('Choosing the field', 'The natural order is your decision: name, number, date. Pick the one that is most obviously "the" order.'),
    method(
        'Comparing by a number: descending and ascending', 'Integer.compare(a, b);  Double.compare(a, b);  Long.compare(a, b)', 'negative, zero or positive', 'O(1)',
        'For ascending order write <code>Integer.compare(this.x, other.x)</code>. For <strong>descending</strong> swap the arguments: <code>Integer.compare(other.x, this.x)</code>.',
        'A natural order should be obvious. If readers could argue about whether "natural" means height or name, keep the natural order simple and use a <code>Comparator</code> for the rest.',
        r'''// compareTo using a number field: highest fort first
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ComparableNumberDemo {
    static class Fort implements Comparable<Fort> {
        final String name;
        final int heightMetres;

        Fort(String name, int heightMetres) {
            this.name = name;
            this.heightMetres = heightMetres;
        }

        @Override
        public int compareTo(Fort other) {
            return Integer.compare(other.heightMetres, this.heightMetres);   // swapped: descending
        }

        @Override
        public String toString() {
            return name + "(" + heightMetres + "m)";
        }
    }

    public static void main(String[] args) {
        List<Fort> forts = new ArrayList<>(List.of(new Fort("Raigad", 820), new Fort("Torna", 1403), new Fort("Lohagad", 1033)));
        Collections.sort(forts);
        System.out.println("Highest first: " + forts);
    }
}
''' + OUT),
    method(
        'Comparing by two fields (tie-breaker)', 'if (first != 0) return first;  return second', 'negative, zero or positive', 'O(1)',
        'When the first field is equal, compare a second one. This keeps the order <strong>total</strong> and avoids accidental duplicates in a TreeSet.',
        'Write the tie-break by hand as below, or build it with <code>Comparator.comparing(...).thenComparing(...)</code> and call it from <code>compareTo</code>.',
        r'''// compareTo with a tie-breaker: district first, then name
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ComparableTieBreakDemo {
    static class Fort implements Comparable<Fort> {
        final String district;
        final String name;

        Fort(String district, String name) {
            this.district = district;
            this.name = name;
        }

        @Override
        public int compareTo(Fort other) {
            int byDistrict = district.compareTo(other.district);
            if (byDistrict != 0) {
                return byDistrict;                                   // districts differ: decided
            }
            return name.compareTo(other.name);                       // same district: compare names
        }

        @Override
        public String toString() {
            return district + "/" + name;
        }
    }

    public static void main(String[] args) {
        List<Fort> forts = new ArrayList<>(List.of(
            new Fort("Pune", "Torna"), new Fort("Raigad", "Raigad"), new Fort("Pune", "Purandar"), new Fort("Pune", "Lohagad")));
        Collections.sort(forts);
        System.out.println(forts);
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'Rules of a correct compareTo',
        'Sorting algorithms assume these rules. Breaking them gives wrong order or <code>IllegalArgumentException: Comparison method violates its general contract</code>.',
        [
            '<strong>Antisymmetry</strong>: <code>sign(a.compareTo(b)) == -sign(b.compareTo(a))</code>.',
            '<strong>Transitivity</strong>: if <code>a &lt; b</code> and <code>b &lt; c</code> then <code>a &lt; c</code>.',
            '<strong>Consistency</strong>: if <code>a.compareTo(b) == 0</code> then <code>a</code> and <code>b</code> compare the same way against every other object.',
            '<strong>Consistent with equals</strong> (strongly recommended): <code>a.compareTo(b) == 0</code> exactly when <code>a.equals(b)</code>. Otherwise TreeSet / TreeMap and HashSet / HashMap disagree about duplicates.',
            '<code>compareTo(null)</code> should throw <code>NullPointerException</code>.',
            'Never compare floating-point with <code>-</code> or by casting; use <code>Double.compare</code> (it also orders NaN and -0.0 correctly).',
        ],
    ),
    (
        '<h3>Trap: inconsistent with equals</h3>\n<p>A class that sorts by one field but defines <code>equals</code> on another behaves differently in a TreeSet and a HashSet.</p>',
        [r'''// compareTo compares height only; equals compares name: TreeSet and HashSet disagree
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

public class ComparableEqualsTrapDemo {
    static class Fort implements Comparable<Fort> {
        final String name;
        final int heightMetres;

        Fort(String name, int heightMetres) {
            this.name = name;
            this.heightMetres = heightMetres;
        }

        @Override
        public int compareTo(Fort other) {
            return Integer.compare(heightMetres, other.heightMetres);   // height only
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof Fort f && f.name.equals(name);          // name only
        }

        @Override
        public int hashCode() {
            return Objects.hash(name);
        }

        @Override
        public String toString() {
            return name;
        }
    }

    public static void main(String[] args) {
        Fort torna = new Fort("Torna", 1403);
        Fort sinhagad = new Fort("Sinhagad", 1403);                    // same height, different name

        Set<Fort> tree = new TreeSet<>(Set.of(torna));
        tree.add(sinhagad);                                            // compareTo == 0: dropped
        Set<Fort> hash = new HashSet<>(Set.of(torna));
        hash.add(sinhagad);                                            // equals false: kept

        System.out.println("TreeSet size : " + tree.size());
        System.out.println("HashSet size : " + hash.size());
    }
}
''' + OUT],
    ),
    (
        '<h3>Trap: subtraction overflows</h3>',
        [r'''// compareTo with subtraction gives the wrong sign for large values
public class ComparableOverflowDemo {
    public static void main(String[] args) {
        int small = Integer.MIN_VALUE;                               // a very negative number
        int big = 1_000_000_000;

        int wrong = big - small;                                     // overflows to a negative number
        int right = Integer.compare(big, small);

        System.out.println("big - small          : " + wrong + "  (says big is smaller: WRONG)");
        System.out.println("Integer.compare(...) : " + right + "  (big is larger: correct)");
    }
}
''' + OUT],
    ),
    (
        '<h3>Real example: a sorted fort register</h3>\n<p>A <code>record</code> can implement <code>Comparable</code> too, so a few lines give a fully ordered value type.</p>',
        [r'''// A record with a natural order, used in sorted collections
import java.util.List;
import java.util.TreeSet;

public class ComparableRecordDemo {
    record Fort(String name, int heightMetres) implements Comparable<Fort> {
        @Override
        public int compareTo(Fort other) {
            return name.compareTo(other.name);
        }
    }

    public static void main(String[] args) {
        TreeSet<Fort> register = new TreeSet<>(List.of(
            new Fort("Torna", 1403), new Fort("Raigad", 820), new Fort("Lohagad", 1033)));

        System.out.println("First : " + register.first());
        System.out.println("Last  : " + register.last());
        System.out.println("All   : " + register);
    }
}
''' + OUT],
    ),
    (
        '<h3>Comparable versus Comparator</h3>\n'
        + table(['', 'Comparable', 'Comparator'], [
            ['Package', 'java.lang', 'java.util'],
            ['Method', '<code>compareTo(T other)</code> (one object)', '<code>compare(T a, T b)</code> (two objects)'],
            ['Where written', '<strong>Inside</strong> the class being sorted', '<strong>Outside</strong>, in its own class / lambda'],
            ['How many orders', 'One (the natural order)', 'As many as you like'],
            ['Can sort classes you cannot edit', 'No', '<strong>Yes</strong>'],
            ['Used by default', 'sort(), TreeSet, TreeMap, PriorityQueue', 'Only when you pass it in'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Keep the natural order simple and correct.',
        [
            'Implement <code>Comparable</code> only when one order is clearly "the" order (name, id, date).',
            'Always use <code>Integer.compare</code> / <code>Double.compare</code>, never subtraction.',
            'Keep <code>compareTo</code> consistent with <code>equals</code> and <code>hashCode</code>.',
            'Compare the same fields in <code>equals</code> and <code>compareTo</code>; add a tie-breaker field if needed.',
            'Use <code>Comparator</code> for any extra orders and for classes you cannot modify.',
            'Do not use mutable fields in <code>compareTo</code> for objects stored in a TreeSet or TreeMap.',
        ],
    ),
]

QA = [
    ('What is the Comparable interface?',
     'A java.lang interface with one method, compareTo, that defines the natural ordering of a class; sorted collections and sort methods use it by default.'),
    ('What does compareTo return?',
     'Negative if this is less than the argument, zero if equal in order, positive if greater.'),
    ('Comparable vs Comparator?',
     'Comparable is implemented inside the class (one natural order, compareTo(T)); Comparator is a separate object (many orders, compare(T, T)) and works on classes you cannot edit.'),
    ('What happens if a class is not Comparable and you put it in a TreeSet?',
     'ClassCastException at run time when the first element is added (unless a Comparator was supplied).'),
    ('Why not use subtraction in compareTo?',
     'It can overflow and return the wrong sign. Use Integer.compare / Double.compare.'),
    ('What does "consistent with equals" mean?',
     'compareTo returns 0 exactly when equals returns true. If not, TreeSet/TreeMap and HashSet/HashMap treat duplicates differently.'),
    ('Which built-in classes are Comparable?',
     'String, the wrapper classes (Integer, Long, Double, Character...), BigInteger, BigDecimal, LocalDate/LocalDateTime, enums (by ordinal) and more.'),
    ('How do you sort in descending order using Comparable?',
     'Swap the operands in compareTo, or leave the natural order and sort with Collections.reverseOrder() / a reversed Comparator.'),
    ('Can a class have more than one natural order?',
     'No: compareTo gives exactly one. Use Comparators for other orders.'),
    ('Is Collections.sort stable?',
     'Yes for objects (it uses TimSort): equal elements keep their original relative order.'),
]

TOPIC = dict(id='comparable', name='Comparable Interface', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
