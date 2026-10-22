"""Extra blocks for: comparable, comparator, internal-hashmap (merged by build.py)."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, method, practice, section, table, ul  # noqa: E402

# ---------------------------------------------------------------------------------------------------------------------
# COMPARABLE
# ---------------------------------------------------------------------------------------------------------------------

CMP_BEGINNER = [
    ('<h3>Benefits and advantages</h3>\n<p><strong>For freshers:</strong> Comparable teaches Java how to put your own objects in order, once, so you never repeat it.</p>\n' + ul([
        '<strong>Write once, sort everywhere</strong>: after <code>compareTo</code> exists, <code>Collections.sort</code>, <code>Arrays.sort</code>, <code>TreeSet</code>, <code>TreeMap</code>, <code>PriorityQueue</code> and <code>stream().sorted()</code> all work with no extra argument.',
        '<strong>Short calls</strong>: <code>Collections.sort(list)</code> reads better than passing a comparator each time.',
        '<strong>Natural meaning</strong>: the order lives next to the data, so any reader finds "what is the default order of a Fort?" in one place.',
        '<strong>Binary search and range queries</strong> (<code>binarySearch</code>, <code>floor</code>, <code>ceiling</code>) just work on sorted data.',
        '<strong>Built into the JDK</strong>: String, Integer, LocalDate and enums already have it.',
    ]) + '\n<p><strong>For experienced developers:</strong> the natural order is part of the type contract. TreeMap, PriorityQueue and the sort algorithms (TimSort, dual-pivot quicksort) call <code>compareTo</code> directly with no lambda indirection, and a consistent order lets you rely on set semantics.</p>', []),
    ('<h3>Disadvantages and when NOT to use it</h3>\n' + ul([
        '<strong>Only one order</strong> per class. Need name today and salary tomorrow? Comparable cannot do both.',
        '<strong>You must edit the class</strong>. You cannot add it to <code>String</code>, to a library class or to a record from another team.',
        '<strong>Hidden coupling</strong>: if someone changes <code>compareTo</code>, every TreeSet, sorted list and binary search that relied on it changes silently.',
        '<strong>Easy to get wrong</strong>: subtraction overflow, ignoring tie-breakers, or being inconsistent with <code>equals</code>.',
        'It is a poor fit when the "right" order depends on the screen, the user or the report. Use a <code>Comparator</code> there.',
    ]) + '\n<p><strong>For experienced developers:</strong> a wrong or mutable-field <code>compareTo</code> is worse than none, because a TreeSet silently loses elements and sort can throw "Comparison method violates its general contract".</p>', []),
    ('<h3>When to use which: Comparable or Comparator</h3>\n' + table(['Situation', 'Pick', 'Why'], [
        ['One obvious default order (id, name, date)', '<strong>Comparable</strong>', 'Zero extra arguments at every call site'],
        ['Several orders (name, salary, city)', '<strong>Comparator</strong>', 'Any number of orders, kept outside the class'],
        ['Class belongs to a library', '<strong>Comparator</strong>', 'You cannot edit the source'],
        ['Used as a TreeMap / TreeSet key', 'Either', 'Comparable is shorter; Comparator allows a different order per collection'],
        ['Order depends on user choice at run time', '<strong>Comparator</strong>', 'Choose or build it on demand'],
    ]), []),
]

CMP_SORTING_INTRO = section(
    'Module: Sorting methods',
    '<strong>For freshers:</strong> "sorting" means putting items in order. Because your class is <code>Comparable</code>, each tool below knows how to do it without being told. '
    '<strong>For experienced developers:</strong> all of them end in <code>compareTo</code>; object sorts use stable TimSort (O(n log n)), tree containers cost O(log n) per insert, and a heap gives O(log n) offer / poll.')
CMP_SORTING_INTRO = (CMP_SORTING_INTRO[0].replace('<h3>Module: Sorting methods</h3>', '<h3>Module: Sorting methods</h3>'), [])

CMP_FINDING_INTRO = section(
    'Module: Finding (searching) methods',
    '<strong>For freshers:</strong> once objects have an order, you can find the biggest, the smallest, or one exact item quickly. '
    '<strong>For experienced developers:</strong> binary search needs a list already sorted by the same order (O(log n) on an ArrayList, O(n) walking on a LinkedList); max/min are a single O(n) pass; tree containers answer nearest-neighbour questions in O(log n).')

CMP_INTERMEDIATE = [
    CMP_SORTING_INTRO,
    method(
        'compareTo(T other): the engine behind every sort', 'int compareTo(T other)', 'negative, zero or positive', 'O(1)',
        'It answers one question: "should I come before, with, or after the other object?" Everything else is built on that answer.',
        'Use <code>Integer.compare</code> for numbers. For descending order swap the two operands.',
        r'''// compareTo: students ranked by marks (high first), then name
public class CmpToMethodDemo {
    record Student(String name, int marks) implements Comparable<Student> {
        public int compareTo(Student other) {
            int byMarks = Integer.compare(other.marks, marks);       // swapped: higher marks first
            return byMarks != 0 ? byMarks : name.compareTo(other.name);   // tie: name A to Z
        }
    }

    public static void main(String[] args) {
        Student a = new Student("Aarav", 90);
        Student b = new Student("Diya", 85);
        Student c = new Student("Bhavna", 90);
        System.out.println("a vs b : " + Integer.signum(a.compareTo(b)));    // -1: a ranks before b
        System.out.println("a vs c : " + Integer.signum(a.compareTo(c)));    // -1: same marks, Aarav < Bhavna
        System.out.println("b vs a : " + Integer.signum(b.compareTo(a)));    // 1
    }
}
''' + OUT),
    method(
        'Collections.sort(List&lt;T&gt;)', 'static &lt;T extends Comparable&lt;? super T&gt;&gt; void sort(List&lt;T&gt; list)', 'void (list sorted in place)', 'O(n log n)',
        'The classic way to sort a list of Comparable objects. The list itself is changed.',
        'It copies to an array, runs TimSort and writes back. The element type must be Comparable or the call does not compile.',
        r'''// Collections.sort on a list of Comparable Strings
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CmpCollectionsSortDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Torna", "Raigad", "Lohagad", "Panhala"));
        Collections.sort(forts);                                  // uses String.compareTo
        System.out.println(forts);
    }
}
''' + OUT),
    method(
        'List.sort(null)', 'default void sort(Comparator&lt;? super E&gt; c)', 'void (list sorted in place)', 'O(n log n)',
        'The instance version of the same sort. Passing <code>null</code> means "use the natural order".',
        'ArrayList overrides it to sort its internal array directly (no copy). Prefer it over <code>Collections.sort</code> in new code.',
        r'''// list.sort(null) = natural order
import java.util.ArrayList;
import java.util.List;

public class CmpListSortDemo {
    public static void main(String[] args) {
        List<Integer> altitudes = new ArrayList<>(List.of(800, 100, 1200, 400));
        altitudes.sort(null);                                     // null: natural order
        System.out.println(altitudes);
    }
}
''' + OUT),
    method(
        'Arrays.sort(T[])', 'static void sort(Object[] a);  static void sort(Object[] a, int from, int to)', 'void (array sorted in place)', 'O(n log n)',
        'Sorts an array of objects by <code>compareTo</code>. You can sort only a range with the from / to version.',
        'For object arrays it is stable TimSort. For primitive arrays (<code>int[]</code>) it is dual-pivot quicksort and the question of stability does not arise.',
        r'''// Arrays.sort on an object array and on a range
import java.util.Arrays;

public class CmpArraysSortDemo {
    public static void main(String[] args) {
        String[] cities = {"Pune", "Nagpur", "Mumbai", "Delhi", "Agra"};
        Arrays.sort(cities, 0, 3);                                // only indexes 0, 1, 2
        System.out.println("range : " + Arrays.toString(cities));
        Arrays.sort(cities);                                      // whole array
        System.out.println("whole : " + Arrays.toString(cities));
    }
}
''' + OUT),
    method(
        'stream().sorted()', 'Stream&lt;T&gt; sorted()', 'a new sorted stream', 'O(n log n)',
        'Sorts without changing the original list: you get a new sorted result. Add <code>.toList()</code> to collect it.',
        'It is a stateful intermediate operation: it must see all elements before emitting the first. Elements must be Comparable, otherwise a ClassCastException is thrown at run time.',
        r'''// stream().sorted() keeps the original list untouched
import java.util.List;

public class CmpStreamSortedDemo {
    public static void main(String[] args) {
        List<String> forts = List.of("Torna", "Raigad", "Lohagad");
        List<String> sorted = forts.stream().sorted().toList();   // natural order
        System.out.println("original : " + forts);
        System.out.println("sorted   : " + sorted);
    }
}
''' + OUT),
    method(
        'TreeSet and TreeMap (always sorted)', 'new TreeSet&lt;&gt;();  new TreeMap&lt;&gt;()', 'a container kept sorted', 'O(log n) per add / put',
        'You do not call sort at all: every element goes into its correct place when added, and printing shows the order.',
        'Backed by a red-black tree. <code>compareTo == 0</code> means "same element", so equal-ordered objects are merged.',
        r'''// TreeMap keeps its keys in compareTo order
import java.util.TreeMap;

public class CmpTreeMapDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> trekHours = new TreeMap<>();
        trekHours.put("Torna", 5);
        trekHours.put("Raigad", 6);
        trekHours.put("Lohagad", 2);
        System.out.println(trekHours);                            // sorted by key
    }
}
''' + OUT),
    method(
        'PriorityQueue (sorted by removal)', 'new PriorityQueue&lt;&gt;();  poll();  peek()', 'smallest element first', 'O(log n) offer / poll',
        'A queue that always hands out the <strong>smallest</strong> element first. Great for "next task" and "top N".',
        'It is a binary heap in an array. Printing the queue is <em>not</em> in sorted order; only <code>poll()</code> is. It is a min-heap by <code>compareTo</code>.',
        r'''// PriorityQueue: poll() gives the smallest each time
import java.util.PriorityQueue;

public class CmpPriorityQueueDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> queue = new PriorityQueue<>();
        queue.add(40);
        queue.add(10);
        queue.add(30);
        while (!queue.isEmpty()) {
            System.out.print(queue.poll() + " ");                 // 10 30 40
        }
        System.out.println();
    }
}
''' + OUT),
    ('<h3>Sorting methods: which one to pick</h3>\n' + table(['Need', 'Use', 'Changes original?', 'Cost'], [
        ['Sort a list once', '<code>list.sort(null)</code> / <code>Collections.sort</code>', 'Yes', 'O(n log n)'],
        ['Sort an array', '<code>Arrays.sort(array)</code>', 'Yes', 'O(n log n)'],
        ['Sorted copy, keep original', '<code>stream().sorted().toList()</code>', 'No', 'O(n log n)'],
        ['Always sorted, many inserts', '<code>TreeSet</code> / <code>TreeMap</code>', 'n/a', 'O(log n) per add'],
        ['Only the next smallest, repeatedly', '<code>PriorityQueue</code>', 'n/a', 'O(log n) per poll'],
    ]), []),

    CMP_FINDING_INTRO,
    method(
        'Collections.binarySearch(list, key)', 'static int binarySearch(List&lt;? extends Comparable&lt;? super T&gt;&gt; list, T key)', 'index if found; otherwise -(insertion point) - 1', 'O(log n) on ArrayList',
        'Finds an item by halving the search area each step. The list <strong>must already be sorted</strong>. A negative result means "not found".',
        'On a sorted list with duplicates, which index you get is unspecified. The negative result tells you where to insert: <code>-(result) - 1</code>.',
        r'''// binarySearch on a sorted list
import java.util.Collections;
import java.util.List;

public class CmpBinarySearchDemo {
    public static void main(String[] args) {
        List<String> forts = List.of("Lohagad", "Panhala", "Raigad", "Torna");   // already sorted
        System.out.println("Raigad  : " + Collections.binarySearch(forts, "Raigad"));   // 2
        int missing = Collections.binarySearch(forts, "Purandar");
        System.out.println("Purandar: " + missing + " -> insert at " + (-missing - 1));
    }
}
''' + OUT),
    method(
        'Arrays.binarySearch(array, key)', 'static int binarySearch(Object[] a, Object key)', 'index if found; otherwise -(insertion point) - 1', 'O(log n)',
        'The same idea for arrays. Sort the array first with <code>Arrays.sort</code>.',
        'Searching an unsorted array gives undefined results, not an exception, so always sort first or keep the array sorted.',
        r'''// Arrays.binarySearch on a sorted int array
import java.util.Arrays;

public class CmpArraysBinaryDemo {
    public static void main(String[] args) {
        int[] heights = {820, 1033, 1374, 1403};
        Arrays.sort(heights);                                     // required before searching
        System.out.println("found 1374 at index " + Arrays.binarySearch(heights, 1374));
        System.out.println("search 900 gives   " + Arrays.binarySearch(heights, 900));   // -2: would go at index 1
    }
}
''' + OUT),
    method(
        'Collections.max(c) and Collections.min(c)', 'static T max(Collection&lt;? extends T&gt; c);  static T min(Collection&lt;? extends T&gt; c)', 'the largest / smallest element', 'O(n)',
        'Walk the whole collection once and return the biggest (or smallest) by <code>compareTo</code>. No sorting needed.',
        'Throws <code>NoSuchElementException</code> on an empty collection. For a single pass it is cheaper than sorting.',
        r'''// Collections.max / min use compareTo
import java.util.Collections;
import java.util.List;

public class CmpMaxMinDemo {
    public static void main(String[] args) {
        List<String> cities = List.of("Pune", "Nagpur", "Mumbai", "Delhi");
        System.out.println("max : " + Collections.max(cities));   // last alphabetically
        System.out.println("min : " + Collections.min(cities));   // first alphabetically
    }
}
''' + OUT),
    method(
        'stream().max(...) and min(...)', 'Optional&lt;T&gt; max(Comparator&lt;? super T&gt; c);  min(...)', 'an <code>Optional</code> (empty if no elements)', 'O(n)',
        'Streams need to be told the order, so pass <code>Comparator.naturalOrder()</code> (which uses <code>compareTo</code>). The answer arrives inside an <code>Optional</code>.',
        'The Optional avoids the exception of <code>Collections.max</code> on empty input. Use <code>orElse</code> or <code>ifPresent</code>.',
        r'''// stream max with the natural order
import java.util.Comparator;
import java.util.List;

public class CmpStreamMaxDemo {
    public static void main(String[] args) {
        List<Integer> altitudes = List.of(800, 1200, 400);
        System.out.println("max   : " + altitudes.stream().max(Comparator.naturalOrder()).get());
        System.out.println("empty : " + List.<Integer>of().stream().min(Comparator.naturalOrder()).isPresent());
    }
}
''' + OUT),
    method(
        'sorted().findFirst()', 'Optional&lt;T&gt; findFirst()', 'first element of the sorted stream', 'O(n log n)',
        'Sort, then take the first one: a way to find "the smallest that matches a rule". Add a <code>filter</code> before it.',
        'For just one smallest element <code>min</code> is O(n) and better; use sorted + findFirst only when you also need more of the order.',
        r'''// first fort (alphabetically) whose name starts with P
import java.util.List;

public class CmpFindFirstDemo {
    public static void main(String[] args) {
        List<String> forts = List.of("Torna", "Purandar", "Panhala", "Raigad");
        String first = forts.stream()
            .filter(n -> n.startsWith("P"))                       // keep P forts
            .sorted()                                             // natural order
            .findFirst()
            .orElse("none");
        System.out.println(first);
    }
}
''' + OUT),
    method(
        'TreeSet: first, last, floor, ceiling', 'first();  last();  floor(e);  ceiling(e);  lower(e);  higher(e)', 'an element or <code>null</code>', 'O(log n)',
        '<code>floor</code> = biggest element at or below the value, <code>ceiling</code> = smallest at or above it. Handy for "nearest" questions.',
        '<code>lower</code> / <code>higher</code> are the strict versions. They return null (not an exception) when nothing qualifies, unlike <code>first()</code> on an empty set.',
        r'''// nearest altitudes in a TreeSet
import java.util.TreeSet;

public class CmpTreeSetNearestDemo {
    public static void main(String[] args) {
        TreeSet<Integer> altitudes = new TreeSet<>(java.util.List.of(820, 1033, 1374, 1403));
        System.out.println("floor(1000)   : " + altitudes.floor(1000));     // 820: at or below
        System.out.println("ceiling(1000) : " + altitudes.ceiling(1000));   // 1033: at or above
        System.out.println("higher(1033)  : " + altitudes.higher(1033));    // 1374: strictly above
        System.out.println("lower(500)    : " + altitudes.lower(500));      // null: nothing smaller
    }
}
''' + OUT),
    method(
        'TreeMap: floorKey, ceilingEntry, firstEntry', 'floorKey(k);  ceilingEntry(k);  firstEntry();  lastEntry()', 'a key / entry or <code>null</code>', 'O(log n)',
        'Same nearest-key idea for maps. Useful for slabs and ranges such as "which tax band does this salary fall in?".',
        'Combine with <code>headMap</code> / <code>tailMap</code> / <code>subMap</code> for range views that need no copying.',
        r'''// floorEntry: find the band a value falls in
import java.util.TreeMap;

public class CmpTreeMapFloorDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> bands = new TreeMap<>();
        bands.put(0, "Easy");
        bands.put(3, "Moderate");
        bands.put(6, "Hard");
        System.out.println("2 hours -> " + bands.floorEntry(2).getValue());
        System.out.println("5 hours -> " + bands.floorEntry(5).getValue());
        System.out.println("9 hours -> " + bands.floorEntry(9).getValue());
    }
}
''' + OUT),
    ('<h3>Finding methods: which one to pick</h3>\n' + table(['Question', 'Use', 'Needs sorted input?', 'Cost'], [
        ['Biggest or smallest', '<code>Collections.max / min</code>, <code>stream.max / min</code>', 'No', 'O(n)'],
        ['Is X present, and where?', '<code>binarySearch</code>', 'Yes', 'O(log n)'],
        ['Nearest value at or below / above', '<code>TreeSet.floor / ceiling</code>', 'Kept sorted', 'O(log n)'],
        ['Band or range lookup', '<code>TreeMap.floorEntry</code>', 'Kept sorted', 'O(log n)'],
        ['Smallest that passes a rule', '<code>filter + min</code>', 'No', 'O(n)'],
    ]), []),
]

CMP_EXPERT_BEFORE = [
    ('<h3>Real-time examples</h3>\n<p>Three small, realistic programs. Each class is Comparable, so every tool in the lesson works on it without extra arguments.</p>', []),
    ('<h3>Example 1: Employees by salary, then name</h3>\n<p><strong>For freshers:</strong> the highest salary comes first; when two salaries are equal, the name decides. '
     '<strong>For experienced developers:</strong> the tie-breaker keeps the order total, so a TreeSet will not drop two employees with the same salary.</p>',
     [r'''// Employee payroll order: salary high to low, then name
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;

public class CmpEmployeePayrollDemo {
    record Employee(String name, String city, int salary) implements Comparable<Employee> {
        public int compareTo(Employee other) {
            int bySalary = Integer.compare(other.salary, salary);           // high first
            return bySalary != 0 ? bySalary : name.compareTo(other.name);   // tie-breaker
        }
    }

    public static void main(String[] args) {
        List<Employee> staff = new ArrayList<>(List.of(
            new Employee("Meera", "Pune", 70000), new Employee("Arjun", "Nagpur", 90000),
            new Employee("Kabir", "Mumbai", 70000), new Employee("Sana", "Delhi", 55000)));
        Collections.sort(staff);
        staff.forEach(e -> System.out.println(e.name() + " " + e.salary()));
        System.out.println("Unique in TreeSet: " + new TreeSet<>(staff).size());   // 4: nobody lost
    }
}
''' + OUT]),
    ('<h3>Example 2: Product catalogue by price</h3>\n<p>A shop lists products cheapest first. We find the cheapest, the dearest, and the best product that fits a budget with <code>floor</code>.</p>',
     [r'''// Product catalogue: natural order is price (cheap first), then product name
import java.util.TreeSet;

public class CmpProductCatalogueDemo {
    record Product(String name, int price) implements Comparable<Product> {
        public int compareTo(Product other) {
            int byPrice = Integer.compare(price, other.price);
            return byPrice != 0 ? byPrice : name.compareTo(other.name);
        }
    }

    public static void main(String[] args) {
        TreeSet<Product> catalogue = new TreeSet<>();
        catalogue.add(new Product("Trek shoes", 2400));
        catalogue.add(new Product("Rain jacket", 1800));
        catalogue.add(new Product("Water bottle", 350));
        catalogue.add(new Product("Backpack", 2400));
        System.out.println("Cheapest : " + catalogue.first());
        System.out.println("Dearest  : " + catalogue.last());
        // best product within a budget of 2000: highest price not above 2000
        Product probe = new Product("￿", 2000);                  // sorts after any name at price 2000
        System.out.println("Budget 2000 -> " + catalogue.floor(probe));
    }
}
''' + OUT]),
    ('<h3>Example 3: Student rank list</h3>\n<p>Rank 1 is the highest marks. Students with equal marks share a rank, so we compare marks only when giving a rank but use name to keep the order stable.</p>',
     [r'''// Student rank list: marks high first, equal marks share the same rank
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CmpStudentRankDemo {
    record Student(String name, int marks) implements Comparable<Student> {
        public int compareTo(Student other) {
            int byMarks = Integer.compare(other.marks, marks);
            return byMarks != 0 ? byMarks : name.compareTo(other.name);
        }
    }

    public static void main(String[] args) {
        List<Student> list = new ArrayList<>(List.of(new Student("Diya", 88), new Student("Aarav", 95),
            new Student("Isha", 88), new Student("Rohan", 72)));
        Collections.sort(list);
        int rank = 0;
        int position = 0;
        int previousMarks = -1;
        for (Student s : list) {
            position++;
            if (s.marks() != previousMarks) {
                rank = position;                                  // new marks value: rank jumps to position
                previousMarks = s.marks();
            }
            System.out.println("Rank " + rank + ": " + s.name() + " (" + s.marks() + ")");
        }
    }
}
''' + OUT]),
    ('<h3>Sample project: Fort Register</h3>\n<p><strong>What we build:</strong> a console register of forts whose natural order is <em>district A to Z, tallest first, then name</em>.</p>\n' + ul([
        'Step 1: define a <code>Fort</code> record that implements <code>Comparable</code>.',
        'Step 2: load the data and sort it with <code>Collections.sort</code>.',
        'Step 3: keep it in a <code>TreeSet</code> and ask for neighbours with <code>floor</code> / <code>ceiling</code>.',
        'Step 4: find the exact fort with <code>binarySearch</code> on the sorted list.',
        'Step 5: use a <code>PriorityQueue</code> to print the first three forts in order, and <code>Collections.max</code> for the last.',
    ]), [r'''// Sample project: Fort Register driven entirely by Comparable
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;
import java.util.TreeSet;

public class CmpFortRegisterProject {
    // Step 1: the natural order lives inside the class
    record Fort(String district, int heightMetres, String name) implements Comparable<Fort> {
        @Override
        public int compareTo(Fort other) {
            int byDistrict = district.compareTo(other.district);            // district A to Z
            if (byDistrict != 0) {
                return byDistrict;
            }
            int byHeight = Integer.compare(other.heightMetres, heightMetres);   // tallest first
            return byHeight != 0 ? byHeight : name.compareTo(other.name);  // tie-breaker
        }

        @Override
        public String toString() {
            return district + "/" + name + "/" + heightMetres + "m";
        }
    }

    public static void main(String[] args) {
        // Step 2: load and sort
        List<Fort> register = new ArrayList<>(List.of(
            new Fort("Pune", 1403, "Torna"), new Fort("Raigad", 820, "Raigad"), new Fort("Pune", 1033, "Lohagad"),
            new Fort("Kolhapur", 845, "Panhala"), new Fort("Pune", 1374, "Purandar"), new Fort("Satara", 1000, "Ajinkyatara")));
        Collections.sort(register);
        System.out.println("Sorted register:");
        register.forEach(f -> System.out.println("  " + f));

        // Step 3: neighbours in a TreeSet
        TreeSet<Fort> tree = new TreeSet<>(register);
        Fort probe = new Fort("Pune", 1200, "");                            // a spot between Torna-ish heights
        System.out.println("Before the probe : " + tree.lower(probe));
        System.out.println("After the probe  : " + tree.ceiling(probe));

        // Step 4: exact search on the sorted list
        int index = Collections.binarySearch(register, new Fort("Raigad", 820, "Raigad"));
        System.out.println("Raigad is at position " + index);

        // Step 5: next three with a heap, and the last with max
        PriorityQueue<Fort> queue = new PriorityQueue<>(register);
        System.out.print("First three      : ");
        for (int i = 0; i < 3; i++) {
            System.out.print(queue.poll().name() + " ");
        }
        System.out.println();
        System.out.println("Last in the order: " + Collections.max(register));
    }
}
''' + OUT]),
]

CMP_PRACTICE = [
    practice(
        'City distance list with binary search',
        'A trip planner stores cities with their distance from Pune. The natural order is <strong>distance, nearest first</strong>.',
        ['Create <code>record City(String name, int km) implements Comparable&lt;City&gt;</code> using <code>Integer.compare</code>.',
         'Sort a list of five cities with <code>list.sort(null)</code> and print it.',
         'Use <code>Collections.binarySearch</code> with a probe <code>new City("?", 450)</code> to find the city that is 450 km away.',
         'Print the farthest city with <code>Collections.max</code>.'],
        r'''// Practice: Comparable record, sort, binarySearch and max
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CmpPracticeCityDistance {
    record City(String name, int km) implements Comparable<City> {
        public int compareTo(City other) {
            return Integer.compare(km, other.km);                    // nearest first
        }
    }

    public static void main(String[] args) {
        List<City> cities = new ArrayList<>(List.of(new City("Nagpur", 710), new City("Mumbai", 150),
            new City("Nashik", 210), new City("Kolhapur", 230), new City("Hyderabad", 560)));
        cities.sort(null);
        System.out.println(cities);
        int at = Collections.binarySearch(cities, new City("?", 560));   // only km matters to compareTo
        System.out.println("560 km is " + (at >= 0 ? cities.get(at).name() : "missing"));
        System.out.println("Farthest: " + Collections.max(cities).name());
    }
}
''' + OUT, level='Easy',
        hints=['The probe only needs the field that <code>compareTo</code> uses.', 'A negative <code>binarySearch</code> result means "not found".']),
    practice(
        'Version numbers: 1.10 is bigger than 1.9',
        'Plain string comparison says "1.9" is bigger than "1.10". Build a <code>Version</code> class that compares numerically part by part.',
        ['Create <code>class Version implements Comparable&lt;Version&gt;</code> that parses a text such as "1.10.2" into an <code>int[]</code>.',
         'In <code>compareTo</code> compare part by part; a missing part counts as 0 (so 1.2 equals 1.2.0).',
         'Sort five versions and print them. Also show that "1.9" sorts after "1.10" as plain strings.',
         'Print the newest version using <code>Collections.max</code>.'],
        r'''// Practice: numeric part-by-part compareTo
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CmpPracticeVersion {
    static class Version implements Comparable<Version> {
        final String text;
        final int[] parts;

        Version(String text) {
            this.text = text;
            String[] pieces = text.split("\\.");
            parts = new int[pieces.length];
            for (int i = 0; i < pieces.length; i++) {
                parts[i] = Integer.parseInt(pieces[i]);
            }
        }

        @Override
        public int compareTo(Version other) {
            int longest = Math.max(parts.length, other.parts.length);
            for (int i = 0; i < longest; i++) {
                int mine = i < parts.length ? parts[i] : 0;          // missing part = 0
                int theirs = i < other.parts.length ? other.parts[i] : 0;
                if (mine != theirs) {
                    return Integer.compare(mine, theirs);
                }
            }
            return 0;
        }

        @Override
        public String toString() {
            return text;
        }
    }

    public static void main(String[] args) {
        List<Version> versions = new ArrayList<>();
        for (String v : new String[] {"1.9", "1.10", "1.2.1", "1.2", "2.0"}) {
            versions.add(new Version(v));
        }
        Collections.sort(versions);
        System.out.println("Numeric order : " + versions);
        System.out.println("String compare 1.9 vs 1.10 : " + Integer.signum("1.9".compareTo("1.10")) + " (wrongly says 1.9 is bigger)");
        System.out.println("1.2 vs 1.2.0  : " + new Version("1.2").compareTo(new Version("1.2.0")));
        System.out.println("Newest        : " + Collections.max(versions));
    }
}
''' + OUT, level='Medium',
        hints=['Loop to the longer length and treat a missing index as 0.']),
    practice(
        'compareTo consistent with equals',
        'Two products are "the same" when their code is the same. Make <code>compareTo</code>, <code>equals</code> and <code>hashCode</code> agree, then prove it with a TreeSet and a HashSet.',
        ['Create a <code>Product</code> class with <code>code</code> and <code>name</code>; compareTo, equals and hashCode must all use only <code>code</code>.',
         'Add three products, two of them with the same code, to both a <code>TreeSet</code> and a <code>HashSet</code>.',
         'Print both sizes (they must match).',
         'Call <code>compareTo(null)</code> inside try/catch and print which exception is thrown.'],
        r'''// Practice: compareTo, equals and hashCode use the same field
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class CmpPracticeConsistent {
    static class Product implements Comparable<Product> {
        final String code;
        final String name;

        Product(String code, String name) {
            this.code = code;
            this.name = name;
        }

        @Override
        public int compareTo(Product other) {
            return code.compareTo(other.code);                       // only code
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof Product p && p.code.equals(code);    // only code
        }

        @Override
        public int hashCode() {
            return code.hashCode();                                  // only code
        }
    }

    public static void main(String[] args) {
        Product[] items = {new Product("P-1", "Torch"), new Product("P-2", "Rope"), new Product("P-1", "Torch XL")};
        Set<Product> tree = new TreeSet<>();
        Set<Product> hash = new HashSet<>();
        for (Product p : items) {
            tree.add(p);
            hash.add(p);
        }
        System.out.println("TreeSet size: " + tree.size() + ", HashSet size: " + hash.size());
        try {
            items[0].compareTo(null);
        } catch (NullPointerException e) {
            System.out.println("compareTo(null) -> NullPointerException");
        }
    }
}
''' + OUT, level='Medium',
        hints=['If the three methods disagree, the two sets show different sizes.']),
    practice(
        'Task scheduler with deadlines',
        'A tiny scheduler runs the most urgent task first: <strong>lower priority number first, then earlier deadline day, then name</strong>. It also answers "which task is due on or after day 5?".',
        ['Create <code>record Task(int priority, int dueDay, String name) implements Comparable&lt;Task&gt;</code> with the three-level rule.',
         'Add six tasks to a <code>PriorityQueue</code> and poll them all, printing the run order.',
         'Put the same tasks in a <code>TreeSet</code> and print the first task whose order is at or after the probe <code>new Task(2, 5, "")</code> using <code>ceiling</code>.',
         'Print how many tasks have priority 1 using <code>headSet</code> with a probe <code>new Task(2, 0, "")</code> (exclusive).'],
        r'''// Practice: PriorityQueue and TreeSet driven by one three-level compareTo
import java.util.List;
import java.util.PriorityQueue;
import java.util.TreeSet;

public class CmpPracticeScheduler {
    record Task(int priority, int dueDay, String name) implements Comparable<Task> {
        public int compareTo(Task other) {
            int byPriority = Integer.compare(priority, other.priority);
            if (byPriority != 0) {
                return byPriority;
            }
            int byDue = Integer.compare(dueDay, other.dueDay);
            return byDue != 0 ? byDue : name.compareTo(other.name);
        }
    }

    public static void main(String[] args) {
        List<Task> tasks = List.of(new Task(2, 7, "Book Raigad trek"), new Task(1, 3, "Pay Torna fees"),
            new Task(3, 1, "Wash gear"), new Task(2, 4, "Pack bags"), new Task(1, 3, "Call Nashik guide"), new Task(2, 9, "Plan Pune stay"));

        PriorityQueue<Task> queue = new PriorityQueue<>(tasks);
        int step = 1;
        while (!queue.isEmpty()) {
            Task t = queue.poll();
            System.out.println(step++ + ". p" + t.priority() + " day " + t.dueDay() + " " + t.name());
        }

        TreeSet<Task> tree = new TreeSet<>(tasks);
        System.out.println("ceiling(p2, day 5) : " + tree.ceiling(new Task(2, 5, "")).name());
        System.out.println("priority-1 tasks   : " + tree.headSet(new Task(2, 0, ""), false).size());
    }
}
''' + OUT, level='Hard',
        hints=['An empty name sorts before every real name, which makes it a good lower-bound probe.']),
]

# ---------------------------------------------------------------------------------------------------------------------
# COMPARATOR
# ---------------------------------------------------------------------------------------------------------------------

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

CP_BEGINNER = [
    ('<h3>Benefits and advantages</h3>\n<p><strong>For freshers:</strong> a Comparator lets you decide the order at the moment you sort, without touching the class.</p>\n' + ul([
        '<strong>Many orders for one class</strong>: name, height, trek time, each as its own comparator.',
        '<strong>Works on classes you cannot edit</strong>, including String, library classes and records from other modules.',
        '<strong>Short and readable</strong>: <code>Comparator.comparing(Fort::name).thenComparing(Fort::district)</code> reads almost like English.',
        '<strong>Choose the order at run time</strong>: let the user pick "sort by price" or "sort by rating" from a menu.',
        '<strong>Different order per collection</strong>: one TreeSet by name, another by height, same objects.',
    ]) + '\n<p><strong>For experienced developers:</strong> comparators are values. You can store them in constants or a Map, compose them, pass them across layers, and unit-test each one. Being functional, they plug straight into streams, TreeMap and PriorityQueue constructors.</p>', []),
    ('<h3>Disadvantages and when NOT to use it</h3>\n' + ul([
        '<strong>You must remember to pass it</strong>. Forget it and Java uses the natural order, or throws <code>ClassCastException</code> when none exists.',
        '<strong>Easy to build a wrong one</strong>: subtraction overflow, missing tie-breakers, a <code>reversed()</code> that flips more than you meant.',
        '<strong>Scattered rules</strong>: if the same comparator is copied in ten places, they drift apart.',
        '<strong>A TreeSet comparator decides duplicates</strong>, which surprises people who only wanted a display order.',
        'If a class really has one obvious default order that everybody expects, implement <code>Comparable</code> as well and keep comparators for the extra orders.',
    ]) + '\n<p><strong>For experienced developers:</strong> a comparator that reads mutable state or is inconsistent breaks TimSort ("Comparison method violates its general contract") or silently corrupts a TreeMap. Keep them pure and total.</p>', []),
    ('<h3>When to use which: Comparator or Comparable</h3>\n' + table(['Situation', 'Pick', 'Why'], [
        ['Sort by name now, by height later', '<strong>Comparator</strong>', 'One class, several orders'],
        ['The class is from a library', '<strong>Comparator</strong>', 'You cannot add compareTo'],
        ['Order is obvious and permanent', '<strong>Comparable</strong>', 'Shorter calls, default for TreeSet'],
        ['Sort a Map by its values', '<strong>Comparator</strong>', '<code>Map.Entry.comparingByValue()</code>'],
        ['Case-insensitive, null-safe or custom text order', '<strong>Comparator</strong>', 'Wrap or replace the natural order'],
    ]), []),
]

CP_INTERMEDIATE = [
    section(
        'Module: Sorting methods',
        '<strong>For freshers:</strong> a Comparator is a ruler you hand to a sorting tool. Below is every method that builds or uses a comparator for sorting, each with one small program. '
        '<strong>For experienced developers:</strong> the builders (<code>comparing</code>, <code>thenComparing</code>, <code>reversed</code>) return new comparators and cost O(1) to create; the consumers (<code>sort</code>, <code>sorted</code>, TreeMap, PriorityQueue) invoke <code>compare</code> O(n log n) times in total.'),
    method(
        'compare(a, b): the one abstract method', 'int compare(T a, T b)', 'negative, zero or positive', 'O(1)',
        'You give it two objects and it tells which should come first. A lambda can supply it directly.',
        'Prefer <code>Integer.compare(a, b)</code> over <code>a - b</code>: subtraction can overflow and give the wrong sign.',
        r'''// A hand-written compare(): shortest name first
import java.util.Comparator;

public class CpCompareDemo {
    public static void main(String[] args) {
        Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());
        System.out.println("Torna vs Raigad : " + byLength.compare("Torna", "Raigad"));    // -1: Torna is shorter
        System.out.println("Torna vs Pune   : " + byLength.compare("Torna", "Pune"));      // 1
        System.out.println("Torna vs Delhi  : " + byLength.compare("Torna", "Delhi"));     // 0: same length
    }
}
''' + OUT),
    method(
        'Comparator.comparing(keyExtractor)', 'static Comparator&lt;T&gt; comparing(Function&lt;T, U&gt; keyExtractor)', 'a <code>Comparator</code>', 'O(1) to create',
        'Say which field to sort by with a method reference. Java compares that field in its natural order.',
        'The field must be Comparable; for primitives use the Int / Long / Double versions to avoid boxing.',
        r'''// comparing(): sort cities by their name
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpComparingDemo {
    record City(String name, int km) { }

    public static void main(String[] args) {
        List<City> cities = new ArrayList<>(List.of(new City("Nagpur", 710), new City("Mumbai", 150), new City("Nashik", 210)));
        cities.sort(Comparator.comparing(City::name));            // by name A to Z
        System.out.println(cities);
    }
}
''' + OUT),
    method(
        'comparingInt / comparingLong / comparingDouble', 'static Comparator&lt;T&gt; comparingInt(ToIntFunction&lt;T&gt;)', 'a <code>Comparator</code>', 'O(1) to create',
        'The number-friendly version of <code>comparing</code>. It reads an <code>int</code>, <code>long</code> or <code>double</code> straight from the object.',
        'No boxing means fewer allocations in a hot sort. <code>comparingDouble</code> uses <code>Double.compare</code>, so NaN and -0.0 are ordered consistently.',
        r'''// comparingInt and comparingDouble
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpComparingNumbersDemo {
    record Trek(String name, int hours, double rating) { }

    public static void main(String[] args) {
        List<Trek> treks = new ArrayList<>(List.of(new Trek("Torna", 5, 4.6), new Trek("Lohagad", 2, 4.1), new Trek("Raigad", 6, 4.8)));
        treks.sort(Comparator.comparingInt(Trek::hours));         // shortest trek first
        System.out.println("By hours  : " + treks.stream().map(Trek::name).toList());
        treks.sort(Comparator.comparingDouble(Trek::rating));     // lowest rating first
        System.out.println("By rating : " + treks.stream().map(Trek::name).toList());
    }
}
''' + OUT),
    method(
        'thenComparing(...)', 'default Comparator&lt;T&gt; thenComparing(Comparator&lt;T&gt; other)  /  thenComparing(Function key)', 'a <code>Comparator</code> with a tie-breaker', 'O(1) to create',
        'When two objects tie on the first rule, the next rule decides. You can chain as many as you like.',
        'The second comparator runs only when the first returns 0, so cheap and selective rules should come first.',
        r'''// thenComparing: district, then name
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpThenComparingDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();
        forts.sort(Comparator.comparing(Fort::district).thenComparing(Fort::name));   // tie on district: name decides
        forts.forEach(f -> System.out.println(f.district() + " " + f.name()));
    }
}
''' + OUT),
    method(
        'reversed()', 'default Comparator&lt;T&gt; reversed()', 'the opposite <code>Comparator</code>', 'O(1)',
        'Flips ascending into descending. Call it on a finished comparator.',
        'It reverses the whole chain it is called on. To reverse only one step, wrap that step: <code>thenComparing(Comparator.comparingInt(...).reversed())</code>.',
        r'''// reversed(): longest trek first
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpReversedDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();
        forts.sort(Comparator.comparingInt(Fort::trekHours).reversed());
        forts.forEach(f -> System.out.println(f.name() + " " + f.trekHours() + "h"));
    }
}
''' + OUT),
    method(
        'naturalOrder() and reverseOrder()', 'static Comparator&lt;T&gt; naturalOrder();  static Comparator&lt;T&gt; reverseOrder()', 'a <code>Comparator</code>', 'O(1)',
        'Ready-made comparators for objects that are already Comparable: A to Z / small to large, and the opposite.',
        'Handy as the "key comparator" in <code>comparing(key, keyComparator)</code> and in <code>nullsFirst</code>.',
        r'''// naturalOrder and reverseOrder on a list of strings
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpNaturalReverseDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Agra", "Nagpur"));
        cities.sort(Comparator.naturalOrder());
        System.out.println("natural : " + cities);
        cities.sort(Comparator.reverseOrder());
        System.out.println("reverse : " + cities);
    }
}
''' + OUT),
    method(
        'nullsFirst(c) and nullsLast(c)', 'static Comparator&lt;T&gt; nullsFirst(Comparator&lt;? super T&gt; c);  nullsLast(...)', 'a null-safe <code>Comparator</code>', 'O(1)',
        'Normal comparators crash on <code>null</code>. These wrappers put missing values at the start or end of the order.',
        'Combine with a key extractor: <code>comparing(Fort::district, nullsLast(naturalOrder()))</code> handles a null <em>field</em>, not just a null element.',
        r'''// nullsLast on a field that may be missing
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpNullsLastDemo {
    record Visitor(String name, String city) { }

    public static void main(String[] args) {
        List<Visitor> list = new ArrayList<>(List.of(new Visitor("Asha", "Pune"), new Visitor("Ravi", null), new Visitor("Kiran", "Agra")));
        list.sort(Comparator.comparing(Visitor::city, Comparator.nullsLast(Comparator.naturalOrder())));
        list.forEach(v -> System.out.println(v.name() + " " + v.city()));      // Ravi (null city) is last
    }
}
''' + OUT),
    method(
        'Map.Entry.comparingByKey() and comparingByValue()', 'static Comparator&lt;Map.Entry&lt;K,V&gt;&gt; comparingByValue()', 'a <code>Comparator</code> for map entries', 'O(1)',
        'A Map cannot be sorted itself, but its entries can. Sort the entries by value to build a "top list".',
        'Pass a comparator for the value: <code>comparingByValue(Comparator.reverseOrder())</code> gives highest first.',
        r'''// Sort map entries by value, highest first
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class CpEntryComparatorDemo {
    public static void main(String[] args) {
        Map<String, Integer> hours = Map.of("Torna", 5, "Raigad", 6, "Lohagad", 2);
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(hours.entrySet());
        entries.sort(Map.Entry.comparingByValue(Comparator.reverseOrder()));
        entries.forEach(e -> System.out.println(e.getKey() + " = " + e.getValue()));
    }
}
''' + OUT),
    method(
        'list.sort(c) and Collections.sort(list, c)', 'void sort(Comparator&lt;? super E&gt; c);  static void sort(List&lt;T&gt; list, Comparator&lt;? super T&gt; c)', 'void (list sorted in place)', 'O(n log n)',
        'Two ways to say the same thing: sort this list using this comparator. <code>list.sort</code> is the modern one.',
        '<code>Collections.sort(list, c)</code> simply calls <code>list.sort(c)</code>. Both are stable.',
        r'''// the two list sorts give the same result
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CpListSortDemo {
    public static void main(String[] args) {
        List<String> a = new ArrayList<>(List.of("Torna", "Pune", "Raigad"));
        List<String> b = new ArrayList<>(a);
        a.sort(Comparator.comparingInt(String::length));
        Collections.sort(b, Comparator.comparingInt(String::length));
        System.out.println(a + " " + b);
    }
}
''' + OUT),
    method(
        'Arrays.sort(T[], c)', 'static &lt;T&gt; void sort(T[] a, Comparator&lt;? super T&gt; c)', 'void (array sorted in place)', 'O(n log n)',
        'Sort an array of objects by your rule. It does not work on <code>int[]</code>: use <code>Integer[]</code> if you need a comparator.',
        'A comparator is not accepted for primitive arrays on purpose. Box the array or sort and then reverse.',
        r'''// Arrays.sort with a comparator needs object arrays
import java.util.Arrays;
import java.util.Comparator;

public class CpArraysSortDemo {
    public static void main(String[] args) {
        Integer[] heights = {820, 1403, 1033};
        Arrays.sort(heights, Comparator.reverseOrder());          // tallest first
        System.out.println(Arrays.toString(heights));
    }
}
''' + OUT),
    method(
        'stream().sorted(c)', 'Stream&lt;T&gt; sorted(Comparator&lt;? super T&gt; c)', 'a new sorted stream', 'O(n log n)',
        'Gives you a sorted copy and leaves the source list alone. Chain <code>limit</code> for "top N".',
        'It is stateful and not lazy: it buffers everything. For only the top N of a huge stream consider a bounded PriorityQueue.',
        r'''// top 2 highest forts without changing the list
import java.util.Comparator;
import java.util.List;

public class CpStreamSortedDemo {
    record Fort(String name, int heightMetres) { }

    public static void main(String[] args) {
        List<Fort> forts = List.of(new Fort("Torna", 1403), new Fort("Raigad", 820), new Fort("Purandar", 1374));
        forts.stream()
            .sorted(Comparator.comparingInt(Fort::heightMetres).reversed())
            .limit(2)
            .forEach(f -> System.out.println(f.name() + " " + f.heightMetres()));
    }
}
''' + OUT),
    method(
        'TreeSet / TreeMap with a Comparator', 'new TreeSet&lt;&gt;(c);  new TreeMap&lt;&gt;(c)', 'a container sorted by your rule', 'O(log n) per add',
        'Give the comparator to the constructor and the container keeps that order forever.',
        'The comparator also defines equality: compare == 0 means the same key. Include a tie-breaker or distinct items disappear.',
        r'''// TreeSet sorted by length, with a tie-breaker so no city is lost
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;

public class CpTreeSetDemo {
    public static void main(String[] args) {
        Comparator<String> order = Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder());
        TreeSet<String> cities = new TreeSet<>(order);
        cities.addAll(List.of("Pune", "Agra", "Delhi", "Surat"));    // Pune and Agra tie on length
        System.out.println(cities);
    }
}
''' + OUT),
    method(
        'PriorityQueue with a Comparator', 'new PriorityQueue&lt;&gt;(c)', 'a heap ordered by your rule', 'O(log n) per offer / poll',
        'The element that comes <em>first</em> by the comparator leaves first. Use <code>reverseOrder()</code> for a max-heap.',
        'Only <code>poll()</code> and <code>peek()</code> follow the order; iteration and <code>toString</code> show the raw heap array.',
        r'''// largest-first queue: the max-heap idiom
import java.util.Comparator;
import java.util.PriorityQueue;

public class CpPriorityQueueDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> queue = new PriorityQueue<>(Comparator.reverseOrder());
        queue.add(820);
        queue.add(1403);
        queue.add(1033);
        System.out.println("tallest first: " + queue.poll() + ", " + queue.poll() + ", " + queue.poll());
    }
}
''' + OUT),
    ('<h3>Sorting with a Comparator: which one to pick</h3>\n' + table(['Need', 'Use', 'Notes'], [
        ['Sort a list in place', '<code>list.sort(c)</code>', 'Stable; modern form'],
        ['Sort an object array', '<code>Arrays.sort(array, c)</code>', 'Object arrays only'],
        ['Sorted copy, keep source', '<code>stream().sorted(c)</code>', 'Add <code>limit(n)</code> for top N'],
        ['Always-sorted collection', '<code>new TreeSet&lt;&gt;(c)</code> / <code>TreeMap</code>', 'Comparator also defines duplicates'],
        ['Repeatedly take the next one', '<code>new PriorityQueue&lt;&gt;(c)</code>', 'Heap: only poll is ordered'],
        ['Sort a map by value', '<code>Map.Entry.comparingByValue()</code>', 'Sort the entry list, not the map'],
        ['Build the comparator', '<code>comparing</code>, <code>thenComparing</code>, <code>reversed</code>', 'Compose small pieces'],
    ]), []),

    section(
        'Module: Finding (searching) methods',
        '<strong>For freshers:</strong> the same comparator that sorts can also find the biggest, the smallest, or one exact item. '
        '<strong>For experienced developers:</strong> binary search must use the <em>same</em> comparator the list was sorted with; max / min are single passes; tree containers answer nearest-neighbour queries in O(log n).'),
    method(
        'Collections.max(c, comparator) and min', 'static T max(Collection&lt;? extends T&gt; c, Comparator&lt;? super T&gt; comp)', 'the largest / smallest by your rule', 'O(n)',
        'Gives the biggest or smallest object by any rule, with no sorting.',
        'Throws <code>NoSuchElementException</code> on an empty collection. The smallest by a reversed comparator is the largest by the original.',
        r'''// tallest and quickest-to-climb fort
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CpMaxMinDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();
        System.out.println("Tallest : " + Collections.max(forts, Comparator.comparingInt(Fort::heightMetres)).name());
        System.out.println("Quickest: " + Collections.min(forts, Comparator.comparingInt(Fort::trekHours)).name());
    }
}
''' + OUT),
    method(
        'stream().max(c) and min(c)', 'Optional&lt;T&gt; max(Comparator&lt;? super T&gt; c)', 'an <code>Optional</code>', 'O(n)',
        'The streams version. The answer comes in an Optional, so an empty list is handled without an exception.',
        'Use <code>orElse</code>, <code>orElseThrow</code> or <code>ifPresent</code> to unwrap it.',
        r'''// Optional-based max
import java.util.Comparator;
import java.util.List;

public class CpStreamMaxDemo {
    public static void main(String[] args) {
        List<String> cities = List.of("Pune", "Nagpur", "Kolhapur");
        cities.stream().max(Comparator.comparingInt(String::length))
            .ifPresent(c -> System.out.println("Longest name: " + c));
        System.out.println("Empty list -> " + List.<String>of().stream().max(Comparator.naturalOrder()).isPresent());
    }
}
''' + OUT),
    method(
        'filter + findFirst after sorted(c)', 'Stream.filter(p).sorted(c).findFirst()', 'an <code>Optional</code>', 'O(n log n)',
        'Narrow the data, order it, take the first: "the quickest trek in Pune".',
        'For a single best element <code>filter(p).min(c)</code> is O(n) and does the same job cheaper.',
        r'''// quickest Pune fort, two ways
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpFindFirstDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        List<Fort> forts = sample();
        Comparator<Fort> quickest = Comparator.comparingInt(Fort::trekHours);
        Fort viaSort = forts.stream().filter(f -> f.district().equals("Pune")).sorted(quickest).findFirst().get();
        Fort viaMin = forts.stream().filter(f -> f.district().equals("Pune")).min(quickest).get();   // cheaper
        System.out.println(viaSort.name() + " " + viaMin.name());
    }
}
''' + OUT),
    method(
        'Collections.binarySearch(list, key, c)', 'static int binarySearch(List&lt;? extends T&gt; list, T key, Comparator&lt;? super T&gt; c)', 'index, or -(insertion point) - 1', 'O(log n) on ArrayList',
        'Fast exact search. The list must be sorted <strong>with the same comparator</strong> you pass here.',
        'Mismatched order gives silent wrong answers, not errors. The key only has to carry the fields the comparator looks at.',
        r'''// binary search by height in a list sorted by height
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CpBinarySearchDemo {
''' + FORT + r'''
    public static void main(String[] args) {
        Comparator<Fort> byHeight = Comparator.comparingInt(Fort::heightMetres);
        List<Fort> forts = sample();
        forts.sort(byHeight);                                     // sort with the SAME comparator
        int at = Collections.binarySearch(forts, new Fort("?", "?", 1374, 0), byHeight);
        System.out.println("height 1374 -> " + (at >= 0 ? forts.get(at).name() : "not found"));
    }
}
''' + OUT),
    method(
        'Arrays.binarySearch(T[], key, c)', 'static &lt;T&gt; int binarySearch(T[] a, T key, Comparator&lt;? super T&gt; c)', 'index, or -(insertion point) - 1', 'O(log n)',
        'The array version. The array must be sorted by the same comparator.',
        'For a descending array pass a descending comparator, otherwise the search goes the wrong way.',
        r'''// binary search in a descending array
import java.util.Arrays;
import java.util.Comparator;

public class CpArrayBinaryDemo {
    public static void main(String[] args) {
        Integer[] heights = {1403, 1374, 1033, 820};              // descending
        int at = Arrays.binarySearch(heights, 1033, Comparator.reverseOrder());
        System.out.println("1033 is at index " + at);
    }
}
''' + OUT),
    method(
        'TreeSet floor / ceiling with a Comparator', 'floor(e);  ceiling(e);  lower(e);  higher(e)', 'an element or <code>null</code>', 'O(log n)',
        '"Nearest" questions, in the order of the comparator you gave the TreeSet.',
        'The probe object only needs the fields the comparator reads.',
        r'''// the shortest city name that is at least 5 letters
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;

public class CpTreeSetCeilingDemo {
    public static void main(String[] args) {
        TreeSet<String> cities = new TreeSet<>(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
        cities.addAll(List.of("Pune", "Agra", "Delhi", "Nagpur"));
        System.out.println("ceiling: " + cities.ceiling("aaaaa"));     // first by (length, name) at or after 5 letters
    }
}
''' + OUT),
    ('<h3>Finding with a Comparator: which one to pick</h3>\n' + table(['Question', 'Use', 'Sorted first?'], [
        ['Biggest / smallest by a rule', '<code>Collections.max / min(c)</code> or <code>stream.max / min(c)</code>', 'No'],
        ['Smallest that passes a test', '<code>filter(p).min(c)</code>', 'No'],
        ['Is this value present?', '<code>binarySearch(list, key, c)</code>', 'Yes, same comparator'],
        ['Nearest above / below', '<code>TreeSet(c).floor / ceiling</code>', 'Kept sorted'],
        ['Many lookups by one key', 'A <code>HashMap</code> indexed by that key', 'Not needed'],
    ]), []),
]

CP_EXPERT_BEFORE = [
    ('<h3>Real-time examples</h3>\n<p>Three small, realistic programs where one class needs several orders. A Comparator makes each order a single line.</p>', []),
    ('<h3>Example 1: Employees by department, salary and name</h3>\n<p><strong>For freshers:</strong> the report groups by department, shows the highest paid first inside each, and uses the name when salaries are equal. '
     '<strong>For experienced developers:</strong> only the salary step is reversed, thanks to the nested <code>reversed()</code>.</p>',
     [r'''// Payroll report: department A-Z, salary high first, then name
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpEmployeeReportDemo {
    record Employee(String name, String dept, int salary) { }

    public static void main(String[] args) {
        List<Employee> staff = new ArrayList<>(List.of(
            new Employee("Meera", "Sales", 70000), new Employee("Arjun", "Tech", 90000), new Employee("Kabir", "Sales", 70000),
            new Employee("Sana", "Tech", 55000), new Employee("Vikram", "Sales", 82000)));
        Comparator<Employee> report = Comparator.comparing(Employee::dept)
            .thenComparing(Comparator.comparingInt(Employee::salary).reversed())   // reverse ONLY this step
            .thenComparing(Employee::name);
        staff.sort(report);
        staff.forEach(e -> System.out.println(e.dept() + "  " + e.salary() + "  " + e.name()));
    }
}
''' + OUT]),
    ('<h3>Example 2: Product catalogue with a sort menu</h3>\n<p>Each menu choice is just a different comparator stored in a map. The page picks one at run time.</p>',
     [r'''// Product catalogue: the user picks the sort from a menu of comparators
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class CpProductMenuDemo {
    record Product(String name, int price, double rating) { }

    public static void main(String[] args) {
        List<Product> products = List.of(new Product("Trek shoes", 2400, 4.5), new Product("Rain jacket", 1800, 4.7),
            new Product("Water bottle", 350, 4.2), new Product("Backpack", 2400, 4.7));
        Map<String, Comparator<Product>> menu = new LinkedHashMap<>();
        menu.put("Price low to high", Comparator.comparingInt(Product::price).thenComparing(Product::name));
        menu.put("Rating high to low", Comparator.comparingDouble(Product::rating).reversed().thenComparing(Product::name));
        for (Map.Entry<String, Comparator<Product>> option : menu.entrySet()) {
            List<Product> view = new ArrayList<>(products);        // copy: the catalogue stays untouched
            view.sort(option.getValue());
            System.out.println(option.getKey() + ": " + view.stream().map(Product::name).toList());
        }
    }
}
''' + OUT]),
    ('<h3>Example 3: Student rank list with missing marks</h3>\n<p>Some students were absent, so their marks are <code>null</code>. They must appear at the bottom, not crash the sort.</p>',
     [r'''// Rank list: marks high first, absent (null) students last, then by name
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpStudentRankDemo {
    record Student(String name, Integer marks) { }

    public static void main(String[] args) {
        List<Student> list = new ArrayList<>(List.of(new Student("Diya", 88), new Student("Aarav", null),
            new Student("Isha", 88), new Student("Rohan", 72), new Student("Bhavna", null)));
        Comparator<Student> rank = Comparator
            .comparing(Student::marks, Comparator.nullsLast(Comparator.<Integer>reverseOrder()))   // null marks go last
            .thenComparing(Student::name);
        list.sort(rank);
        for (Student s : list) {
            System.out.println(s.name() + " " + (s.marks() == null ? "absent" : s.marks()));
        }
    }
}
''' + OUT]),
    ('<h3>Sample project: Employee Report Builder</h3>\n<p><strong>What we build:</strong> a console report tool where every report is a named Comparator.</p>\n' + ul([
        'Step 1: define the <code>Employee</code> record (with a nullable bonus).',
        'Step 2: build reusable comparators as constants and register them by name in a <code>LinkedHashMap</code>.',
        'Step 3: run each report on a copy of the data using <code>list.sort</code>.',
        'Step 4: answer questions with <code>max</code> / <code>min</code> and a top-N stream.',
        'Step 5: sort by id and look an employee up with <code>binarySearch</code>; use a TreeSet to find the next salary band.',
    ]), [r'''// Sample project: Employee Report Builder built on named Comparators
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

public class CpEmployeeReportProject {
    // Step 1: the data
    record Employee(int id, String name, String city, int salary, Double bonus) { }

    // Step 2: reusable comparators as named constants
    static final Comparator<Employee> BY_NAME = Comparator.comparing(Employee::name);
    static final Comparator<Employee> BY_SALARY_DESC = Comparator.comparingInt(Employee::salary).reversed().thenComparing(BY_NAME);
    static final Comparator<Employee> BY_CITY_THEN_NAME = Comparator.comparing(Employee::city).thenComparing(BY_NAME);
    static final Comparator<Employee> BY_BONUS_NULLS_LAST =
        Comparator.comparing(Employee::bonus, Comparator.nullsLast(Comparator.<Double>reverseOrder())).thenComparing(BY_NAME);
    static final Comparator<Employee> BY_ID = Comparator.comparingInt(Employee::id);

    static String names(List<Employee> list) {
        return list.stream().map(Employee::name).toList().toString();
    }

    public static void main(String[] args) {
        List<Employee> staff = List.of(
            new Employee(104, "Meera", "Pune", 70000, 5000.0), new Employee(101, "Arjun", "Nagpur", 90000, null),
            new Employee(103, "Kabir", "Mumbai", 70000, 8000.0), new Employee(105, "Sana", "Pune", 55000, null),
            new Employee(102, "Vikram", "Delhi", 82000, 2000.0));

        Map<String, Comparator<Employee>> reports = new LinkedHashMap<>();
        reports.put("By name", BY_NAME);
        reports.put("By salary (high first)", BY_SALARY_DESC);
        reports.put("By city, then name", BY_CITY_THEN_NAME);
        reports.put("By bonus (none last)", BY_BONUS_NULLS_LAST);

        // Step 3: run every report on its own copy
        for (Map.Entry<String, Comparator<Employee>> r : reports.entrySet()) {
            List<Employee> copy = new ArrayList<>(staff);
            copy.sort(r.getValue());
            System.out.println(r.getKey() + ": " + names(copy));
        }

        // Step 4: questions answered with the comparators
        System.out.println("Top 2 paid : " + names(staff.stream().sorted(BY_SALARY_DESC).limit(2).toList()));
        System.out.println("Lowest paid: " + Collections.min(staff, Comparator.comparingInt(Employee::salary)).name());

        // Step 5: lookups
        List<Employee> byId = new ArrayList<>(staff);
        byId.sort(BY_ID);
        int at = Collections.binarySearch(byId, new Employee(103, "", "", 0, null), BY_ID);
        System.out.println("Employee 103 is " + byId.get(at).name());
        TreeSet<Integer> bands = new TreeSet<>(List.of(50000, 75000, 100000));
        System.out.println("Next band above 82000 is " + bands.higher(82000));
    }
}
''' + OUT]),
]

CP_PRACTICE = [
    practice(
        'Sort city names by length and then alphabet',
        'A signboard painter wants city names ordered <strong>shortest first</strong>, and alphabetical when the length is equal.',
        ['Create a list of six Indian cities.',
         'Sort it with <code>Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder())</code>.',
         'Print the list, then print it again in the exact opposite order using <code>reversed()</code>.',
         'Print the longest city with <code>Collections.max</code> and the same comparator.'],
        r'''// Practice: comparingInt + thenComparing + reversed + max
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CpPracticeCityLength {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nagpur", "Agra", "Delhi", "Mumbai", "Surat"));
        Comparator<String> order = Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder());
        cities.sort(order);
        System.out.println("Short first : " + cities);
        cities.sort(order.reversed());
        System.out.println("Long first  : " + cities);
        System.out.println("Longest     : " + Collections.max(cities, order));
    }
}
''' + OUT, level='Easy',
        hints=['The longest name that is alphabetically last wins under this order.']),
    practice(
        'Employees with an optional bonus',
        'Some employees have no bonus (<code>null</code>). Show the best bonuses first, people without a bonus last, and use salary then name for ties.',
        ['Create <code>record Employee(String name, int salary, Double bonus)</code>.',
         'Build the comparator with <code>comparing(Employee::bonus, nullsLast(reverseOrder()))</code> followed by salary (high first) and name.',
         'Sort and print each employee with the bonus or "no bonus".',
         'Also print the employee with the highest salary using a stream <code>max</code>.'],
        r'''// Practice: nullsLast key comparator with tie-breakers
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class CpPracticeBonus {
    record Employee(String name, int salary, Double bonus) { }

    public static void main(String[] args) {
        List<Employee> staff = new ArrayList<>(List.of(new Employee("Meera", 70000, 5000.0), new Employee("Arjun", 90000, null),
            new Employee("Kabir", 70000, 5000.0), new Employee("Sana", 55000, 9000.0), new Employee("Vikram", 82000, null)));
        Comparator<Employee> order = Comparator
            .comparing(Employee::bonus, Comparator.nullsLast(Comparator.<Double>reverseOrder()))
            .thenComparing(Comparator.comparingInt(Employee::salary).reversed())
            .thenComparing(Employee::name);
        staff.sort(order);
        for (Employee e : staff) {
            System.out.println(e.name() + " " + (e.bonus() == null ? "no bonus" : e.bonus()) + " / salary " + e.salary());
        }
        System.out.println("Highest salary: " + staff.stream().max(Comparator.comparingInt(Employee::salary)).get().name());
    }
}
''' + OUT, level='Medium',
        hints=['<code>Comparator.&lt;Double&gt;reverseOrder()</code> gives the compiler the type it needs.']),
    practice(
        'Top 3 most frequent words',
        'Count how often each fort name appears in a list, then print the three most frequent. Ties are broken alphabetically.',
        ['Count the words into a <code>HashMap&lt;String, Integer&gt;</code> using <code>merge</code>.',
         'Copy the entries into a list.',
         'Sort the entries by value (high first) then by key, using <code>Map.Entry.comparingByValue(Comparator.reverseOrder()).thenComparing(Map.Entry.comparingByKey())</code>.',
         'Print the first three.'],
        r'''// Practice: sorting map entries with comparingByValue + comparingByKey
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CpPracticeTopWords {
    public static void main(String[] args) {
        String[] visits = {"Torna", "Raigad", "Torna", "Lohagad", "Raigad", "Torna", "Panhala", "Lohagad", "Purandar"};
        Map<String, Integer> counts = new HashMap<>();
        for (String fort : visits) {
            counts.merge(fort, 1, Integer::sum);                  // count
        }
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(counts.entrySet());
        Comparator<Map.Entry<String, Integer>> order =
            Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder()).thenComparing(Map.Entry.comparingByKey());
        entries.sort(order);
        for (int i = 0; i < 3; i++) {
            System.out.println((i + 1) + ". " + entries.get(i).getKey() + " x" + entries.get(i).getValue());
        }
    }
}
''' + OUT, level='Medium',
        hints=['HashMap order is not sorted, so the explicit tie-breaker is what makes the output stable.']),
    practice(
        'Natural file-name order: Fort2 before Fort10',
        'Plain text sorting puts "Fort10" before "Fort2". Write a <code>Comparator&lt;String&gt;</code> that splits a name into a text part and a number part, and compares the number numerically.',
        ['Write a static method that splits "Fort10" into the letters ("Fort") and the number (10).',
         'Compare the letters first; if equal, compare the numbers with <code>Integer.compare</code>.',
         'Sort a shuffled list (use <code>new Random(7)</code>) and print the result, next to the plain text sort.',
         'Check the contract: sort the same data from two different shuffles and show both results are identical.'],
        r'''// Practice: a hand-written natural-order comparator
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

public class CpPracticeNaturalOrder {
    static String letters(String s) {
        return s.replaceAll("[0-9]+$", "");                      // text before the trailing digits
    }

    static int number(String s) {
        String digits = s.substring(letters(s).length());
        return digits.isEmpty() ? 0 : Integer.parseInt(digits);
    }

    public static void main(String[] args) {
        Comparator<String> natural = Comparator.comparing(CpPracticeNaturalOrder::letters)
            .thenComparingInt(CpPracticeNaturalOrder::number);
        List<String> names = new ArrayList<>(List.of("Fort10", "Fort2", "Fort1", "Gad3", "Fort21", "Gad10", "Fort3"));

        List<String> first = new ArrayList<>(names);
        Collections.shuffle(first, new Random(7));
        first.sort(natural);
        List<String> second = new ArrayList<>(names);
        Collections.shuffle(second, new Random(99));
        second.sort(natural);

        List<String> plain = new ArrayList<>(names);
        Collections.sort(plain);
        System.out.println("Plain text sort : " + plain);
        System.out.println("Natural order   : " + first);
        System.out.println("Same result from another shuffle: " + first.equals(second));
    }
}
''' + OUT, level='Hard',
        hints=['<code>replaceAll("[0-9]+$", "")</code> removes the trailing digits.', 'A correct comparator gives the same sorted result from any starting order.']),
]

# ---------------------------------------------------------------------------------------------------------------------
# INTERNAL HASHMAP
# ---------------------------------------------------------------------------------------------------------------------

IH_BEGINNER = [
    ('<h3>Benefits and advantages</h3>\n<p><strong>For freshers:</strong> knowing how a HashMap works makes you faster at spotting bugs and at answering interview questions.</p>\n' + ul([
        '<strong>Why it is fast</strong>: hash, index, then a short search. Lookups stay near O(1) even for millions of entries.',
        '<strong>Flexible keys</strong>: any object with proper <code>equals</code> and <code>hashCode</code> can be a key.',
        '<strong>One structure, many uses</strong>: caches, counters, indexes, grouping, de-duplication.',
        '<strong>Self-tuning</strong>: the table doubles automatically, so you rarely manage the size yourself.',
        '<strong>Tree buckets</strong> (Java 8+) protect against badly spread keys.',
    ]) + '\n<p><strong>For experienced developers:</strong> amortised O(1) put / get, cache-friendly array of buckets, lazy allocation, and an order-preserving split on resize make HashMap the default map. The design explains the performance numbers you see in profiles.</p>', []),
    ('<h3>Disadvantages and when NOT to use it</h3>\n' + ul([
        '<strong>No order</strong>: iteration depends on hashes and capacity, not on insertion. Use <code>LinkedHashMap</code> or <code>TreeMap</code> if order matters.',
        '<strong>Memory overhead</strong>: a Node object per entry plus the table array; costly for millions of small primitives (consider specialised maps).',
        '<strong>Resizing pauses</strong>: one put can suddenly cost O(n).',
        '<strong>Bad keys break it</strong>: missing <code>hashCode</code>, or a key changed after insertion, makes entries unfindable.',
        '<strong>Not thread-safe</strong>: use <code>ConcurrentHashMap</code> for concurrent writes.',
        '<strong>No range queries</strong>: for "all keys between A and B" a <code>TreeMap</code> is the right tool.',
    ]) + '\n<p><strong>For experienced developers:</strong> iteration cost is O(size + capacity), and hash flooding can degrade buckets to O(log n) (tree) or O(n) (non-comparable keys).</p>', []),
    ('<h3>Why learn the internals</h3>\n' + table(['Skill', 'What the internals teach', 'Where it pays off'], [
        ['Correct keys', 'equals and hashCode must agree; keys must not change', 'Fixing "my map cannot find the key" bugs'],
        ['Performance', 'Load factor, resize cost, presizing', 'Tuning large maps and caches'],
        ['Collisions', 'Chains, trees, hash spreading', 'Explaining O(1) vs worst cases'],
        ['Choosing a map', 'Why order is lost, why null is allowed', 'Picking HashMap, LinkedHashMap, TreeMap, ConcurrentHashMap'],
        ['Interviews', 'put / get walk-through, Java 8 changes', 'Answering the classic "how does HashMap work" question'],
    ]), []),
]

IH_FINDING = [
    section(
        'Module: Finding and storing steps',
        '<strong>For freshers:</strong> every HashMap method follows the same road: <em>key, hash code, spread, bucket number, search the bucket with equals</em>. Below each stop on that road is shown by itself, in a tiny program. '
        '<strong>For experienced developers:</strong> the samples mirror <code>HashMap.hash</code>, <code>(n - 1) &amp; hash</code>, <code>getNode</code> and <code>putVal</code>; the real code compares the stored <code>hash</code> before calling <code>equals</code>.'),
    method(
        'Step 1: hashCode() turns a key into an int', 'int hashCode()', 'any <code>int</code> (can be negative)', 'O(1) for most keys; O(length) for a String first time',
        'Every object can say a number for itself. Equal objects must give equal numbers.',
        'String caches its hash after the first call. The number alone is not a bucket yet; it can be negative or huge.',
        r'''// Step 1: the hash code of a key
public class IhStepHashCodeDemo {
    public static void main(String[] args) {
        System.out.println("Torna   : " + "Torna".hashCode());
        System.out.println("Torna   : " + "Torna".hashCode() + "  (always the same for equal keys)");
        System.out.println("Raigad  : " + "Raigad".hashCode());
        System.out.println("Integer : " + Integer.valueOf(42).hashCode() + "  (an Integer hashes to its own value)");
    }
}
''' + OUT),
    method(
        'Step 2: spread the hash', 'h ^ (h &gt;&gt;&gt; 16)', 'a mixed <code>int</code>', 'O(1)',
        'HashMap mixes the top bits of the number into the bottom bits, because only the bottom bits will choose the bucket.',
        'It costs one shift and one XOR, and rescues keys whose hashes differ only in high bits.',
        r'''// Step 2: spread = hash XOR (hash shifted right by 16)
public class IhStepSpreadDemo {
    static int spread(Object key) {
        int h = key.hashCode();
        return h ^ (h >>> 16);                                    // same formula as HashMap.hash
    }

    public static void main(String[] args) {
        String key = "Lohagad";
        System.out.println("hashCode : " + key.hashCode());
        System.out.println("spread   : " + spread(key));
    }
}
''' + OUT),
    method(
        'Step 3: pick the bucket', 'index = (n - 1) & hash', 'a number from 0 to n - 1', 'O(1)',
        'The table has n buckets (a power of two). A single AND keeps just the bottom bits, so the answer is always a valid bucket number.',
        'Same as <code>hash mod n</code> for a power of two, but without the slow division, and never negative.',
        r'''// Step 3: from the spread hash to a bucket number
public class IhStepIndexDemo {
    public static void main(String[] args) {
        int n = 16;                                               // table size
        for (String fort : new String[] {"Torna", "Raigad", "Panhala"}) {
            int h = fort.hashCode();
            int hash = h ^ (h >>> 16);
            System.out.println(fort + " -> bucket " + ((n - 1) & hash));   // 0 to 15
        }
    }
}
''' + OUT),
    method(
        'Step 4: walk the bucket and use equals() (get)', 'V get(Object key)', 'the value or <code>null</code>', 'O(1) average',
        'The bucket may hold several keys. HashMap goes through the chain and returns the entry whose key is <code>equals</code> to yours.',
        'getNode checks <code>hash ==</code> first (cheap) and then <code>==</code> or <code>equals</code>. A tree bucket is searched as a red-black tree.',
        r'''// Step 4: get() = bucket, then equals along the chain (a tiny hand-made table)
public class IhStepGetDemo {
    static class Node {
        final String key;
        final int value;
        final Node next;

        Node(String key, int value, Node next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    public static void main(String[] args) {
        Node bucket = new Node("Aa", 1, new Node("BB", 2, null));   // "Aa" and "BB" share a hash code
        String wanted = "BB";
        for (Node n = bucket; n != null; n = n.next) {
            boolean same = n.key.equals(wanted);                  // equals picks the right node
            System.out.println("checking " + n.key + " -> " + same);
            if (same) {
                System.out.println("found value " + n.value);
                break;
            }
        }
    }
}
''' + OUT),
    method(
        'Step 5: put() decides between update and insert', 'V put(K key, V value)', 'the old value, or <code>null</code> if the key was new', 'O(1) average',
        'Same road as get. If an equal key is found its value is replaced; if the chain ends, a new node is added.',
        'The return value tells you which case happened, so <code>put</code> can double as a "was it new?" check.',
        r'''// Step 5: put returns the old value (update) or null (new key)
import java.util.HashMap;
import java.util.Map;

public class IhStepPutDemo {
    public static void main(String[] args) {
        Map<String, Integer> hours = new HashMap<>();
        System.out.println("first put  : " + hours.put("Torna", 5));    // null: inserted a new node
        System.out.println("second put : " + hours.put("Torna", 6));    // 5: found an equal key, replaced
        System.out.println("size       : " + hours.size());            // still 1
    }
}
''' + OUT),
    method(
        'containsKey(): the same search without returning the value', 'boolean containsKey(Object key)', '<code>true</code> or <code>false</code>', 'O(1) average',
        'Does the bucket chain hold an equal key? Unlike <code>get</code>, it can tell "missing" from "present with a null value".',
        'It calls the same <code>getNode</code> as <code>get</code>. Do not call <code>containsKey</code> then <code>get</code> in a loop: it hashes twice.',
        r'''// containsKey vs get when the value is null
import java.util.HashMap;
import java.util.Map;

public class IhStepContainsKeyDemo {
    public static void main(String[] args) {
        Map<String, String> guide = new HashMap<>();
        guide.put("Torna", null);                                 // key present, value null
        System.out.println("get(Torna)         : " + guide.get("Torna"));
        System.out.println("get(Missing)       : " + guide.get("Missing"));
        System.out.println("containsKey(Torna) : " + guide.containsKey("Torna"));
        System.out.println("containsKey(Missing): " + guide.containsKey("Missing"));
    }
}
''' + OUT),
    method(
        'Step 6: the table doubles when it gets full (resize)', 'if (++size &gt; threshold) resize()', 'a table of twice the size', 'O(n) once',
        'After the 12th entry in a 16-bucket table, the 13th makes the table 32 buckets wide, so chains stay short.',
        'Each old chain is split in two: nodes either stay at the same index or move to <code>index + oldCapacity</code>.',
        r'''// Step 6: when does a default HashMap grow?
public class IhStepResizeDemo {
    public static void main(String[] args) {
        int capacity = 16;
        double loadFactor = 0.75;
        int size = 0;
        for (int i = 1; i <= 30; i++) {
            size++;
            if (size > capacity * loadFactor) {                   // threshold crossed
                capacity *= 2;
                System.out.println("after entry " + i + " the table grew to " + capacity);
            }
        }
    }
}
''' + OUT),
    method(
        'remove(): find the node, then unlink it', 'V remove(Object key)', 'the removed value or <code>null</code>', 'O(1) average',
        'Same search as get; once the node is found, the link from the previous node is changed to skip it.',
        'Removal increments <code>modCount</code> and never shrinks the table.',
        r'''// Unlinking a node from a bucket chain
public class IhStepRemoveDemo {
    static class Node {
        final String key;
        Node next;

        Node(String key, Node next) {
            this.key = key;
            this.next = next;
        }
    }

    public static void main(String[] args) {
        Node head = new Node("Torna", new Node("Raigad", new Node("Lohagad", null)));
        Node previous = null;
        for (Node n = head; n != null; previous = n, n = n.next) {
            if (n.key.equals("Raigad")) {
                previous.next = n.next;                           // skip the removed node
                break;
            }
        }
        for (Node n = head; n != null; n = n.next) {
            System.out.print(n.key + " ");
        }
        System.out.println();
    }
}
''' + OUT),
    ('<h3>Which lookup method to pick</h3>\n' + table(['Goal', 'Use', 'Why'], [
        ['Read a value, null is fine if missing', '<code>get(key)</code>', 'One search'],
        ['Read with a default', '<code>getOrDefault(key, d)</code>', 'One search, no null check'],
        ['Does the key exist (values may be null)', '<code>containsKey(key)</code>', 'Tells missing from null value'],
        ['Add only if absent', '<code>putIfAbsent(key, v)</code> / <code>computeIfAbsent</code>', 'One search instead of get then put'],
        ['Update or count', '<code>merge(key, 1, Integer::sum)</code>', 'One search, no boxing dance'],
        ['Is a value present', '<code>containsValue(v)</code>', 'Scans every bucket: O(n)'],
    ]), []),
]

IH_EXPERT_BEFORE = [
    ('<h3>Real-time examples</h3>\n<p>Three problems that every Java team meets sooner or later. Each program is small and prints what really happens.</p>', []),
    ('<h3>Example 1: A bad hashCode piles everything into one bucket</h3>\n<p><strong>For freshers:</strong> if every key gives the same number, all of them land in one bucket and the map behaves like a slow list. '
     '<strong>For experienced developers:</strong> the sample counts bucket sizes with the same index formula HashMap uses, so the damage is visible without any timing.</p>',
     [r'''// Chain lengths with a good hash and with a hash that always returns 1
public class IhBadHashCodeDemo {
    static int bucketOf(int hashCode, int tableSize) {
        int hash = hashCode ^ (hashCode >>> 16);
        return (tableSize - 1) & hash;
    }

    static int longestChain(boolean badHash, int tableSize) {
        int[] counts = new int[tableSize];
        for (int i = 0; i < 100; i++) {
            String key = "Fort-" + i;
            int hashCode = badHash ? 1 : key.hashCode();          // bad: constant
            counts[bucketOf(hashCode, tableSize)]++;
        }
        int longest = 0;
        for (int c : counts) {
            longest = Math.max(longest, c);
        }
        return longest;
    }

    public static void main(String[] args) {
        System.out.println("100 keys, 256 buckets, good hashCode: longest chain = " + longestChain(false, 256));
        System.out.println("100 keys, 256 buckets, constant hash: longest chain = " + longestChain(true, 256));
    }
}
''' + OUT]),
    ('<h3>Example 2: A mutable key gets lost</h3>\n<p>A key is stored in the bucket for its hash <em>at that moment</em>. If a field used in <code>hashCode</code> changes later, the lookup goes to a different bucket and the entry is stranded.</p>',
     [r'''// Mutating a key after put makes the entry unreachable
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class IhMutableKeyDemo {
    static class Trek {
        String fort;                                              // not final: this is the problem

        Trek(String fort) {
            this.fort = fort;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof Trek t && t.fort.equals(fort);
        }

        @Override
        public int hashCode() {
            return Objects.hash(fort);
        }
    }

    public static void main(String[] args) {
        Map<Trek, Integer> hours = new HashMap<>();
        Trek key = new Trek("Torna");
        hours.put(key, 5);
        System.out.println("before change: " + hours.get(key));
        key.fort = "Raigad";                                      // hash changes, bucket does not
        System.out.println("after change : " + hours.get(key));    // looks in the wrong bucket
        System.out.println("containsKey  : " + hours.containsKey(key));
        System.out.println("size         : " + hours.size() + " (the entry is still there, just unreachable)");
    }
}
''' + OUT]),
    ('<h3>Example 3: Resizing and presizing</h3>\n<p>Every time the table doubles, all entries are moved. When you know the final size, ask for enough room once.</p>',
     [r'''// How many resizes for 10 000 entries: default start vs presized
public class IhResizeCountDemo {
    static int resizesFor(int entries, int startCapacity) {
        int capacity = startCapacity;
        int resizes = 0;
        for (int size = 1; size <= entries; size++) {
            if (size > capacity * 0.75) {                         // threshold crossed
                capacity *= 2;
                resizes++;
            }
        }
        return resizes;
    }

    public static void main(String[] args) {
        int entries = 10_000;
        int needed = (int) (entries / 0.75f) + 1;                 // capacity that avoids resizing
        int presized = Integer.highestOneBit(needed - 1) << 1;    // next power of two
        System.out.println("default start (16)  : " + resizesFor(entries, 16) + " resizes");
        System.out.println("presized to " + presized + " : " + resizesFor(entries, presized) + " resizes");
    }
}
''' + OUT]),
    ('<h3>Sample project: SimpleHashMap with buckets</h3>\n<p><strong>What we build:</strong> a small generic hash map written by hand, following the real HashMap steps.</p>\n' + ul([
        'Step 1: a <code>Node</code> class with key, value, hash and next.',
        'Step 2: an array of buckets, starting with 4 slots, and a load factor of 0.75.',
        'Step 3: <code>put</code> hashes the key, finds the bucket, updates an equal key or appends a node, then resizes if needed.',
        'Step 4: <code>get</code> and <code>remove</code> use the same search.',
        'Step 5: <code>resize</code> doubles the table and re-buckets every node. A demo run prints the table after each phase.',
    ]), [r'''// Sample project: a hand-written HashMap with buckets, resizing and remove
public class IhSimpleHashMapProject {
    static class SimpleHashMap<K, V> {
        // Step 1: one entry of a bucket chain
        static class Node<K, V> {
            final int hash;
            final K key;
            V value;
            Node<K, V> next;

            Node(int hash, K key, V value) {
                this.hash = hash;
                this.key = key;
                this.value = value;
            }
        }

        // Step 2: the bucket array and bookkeeping
        private Node<K, V>[] table = newTable(4);
        private int size = 0;

        @SuppressWarnings("unchecked")
        private static <K, V> Node<K, V>[] newTable(int n) {
            return (Node<K, V>[]) new Node[n];
        }

        private static int hash(Object key) {
            int h = key == null ? 0 : key.hashCode();
            return h ^ (h >>> 16);
        }

        // Step 3: put = hash, index, search, update or append, maybe resize
        V put(K key, V value) {
            int hash = hash(key);
            int index = (table.length - 1) & hash;
            Node<K, V> last = null;
            for (Node<K, V> n = table[index]; n != null; last = n, n = n.next) {
                if (n.hash == hash && java.util.Objects.equals(n.key, key)) {
                    V old = n.value;
                    n.value = value;                              // equal key: update
                    return old;
                }
            }
            Node<K, V> fresh = new Node<>(hash, key, value);
            if (last == null) {
                table[index] = fresh;                             // empty bucket
            } else {
                last.next = fresh;                                // append at the tail
            }
            if (++size > table.length * 0.75) {
                resize();
            }
            return null;
        }

        // Step 4: get and remove share the search
        V get(K key) {
            int hash = hash(key);
            for (Node<K, V> n = table[(table.length - 1) & hash]; n != null; n = n.next) {
                if (n.hash == hash && java.util.Objects.equals(n.key, key)) {
                    return n.value;
                }
            }
            return null;
        }

        boolean remove(K key) {
            int hash = hash(key);
            int index = (table.length - 1) & hash;
            Node<K, V> previous = null;
            for (Node<K, V> n = table[index]; n != null; previous = n, n = n.next) {
                if (n.hash == hash && java.util.Objects.equals(n.key, key)) {
                    if (previous == null) {
                        table[index] = n.next;
                    } else {
                        previous.next = n.next;
                    }
                    size--;
                    return true;
                }
            }
            return false;
        }

        // Step 5: double the table and put every node in its new bucket
        private void resize() {
            Node<K, V>[] old = table;
            table = newTable(old.length * 2);
            for (Node<K, V> head : old) {
                for (Node<K, V> n = head; n != null; ) {
                    Node<K, V> next = n.next;
                    int index = (table.length - 1) & n.hash;
                    n.next = table[index];                        // push onto the new bucket
                    table[index] = n;
                    n = next;
                }
            }
        }

        void print() {
            System.out.println("size=" + size + " buckets=" + table.length);
            for (int i = 0; i < table.length; i++) {
                if (table[i] != null) {
                    StringBuilder row = new StringBuilder("  [" + i + "]");
                    for (Node<K, V> n = table[i]; n != null; n = n.next) {
                        row.append(" ").append(n.key).append("=").append(n.value);
                    }
                    System.out.println(row);
                }
            }
        }
    }

    public static void main(String[] args) {
        SimpleHashMap<String, Integer> map = new SimpleHashMap<>();
        String[] forts = {"Torna", "Raigad", "Lohagad"};
        int[] hours = {5, 6, 2};
        for (int i = 0; i < forts.length; i++) {
            map.put(forts[i], hours[i]);
        }
        map.print();
        System.out.println("put(Torna, 9) returns old value " + map.put("Torna", 9));
        for (String more : new String[] {"Panhala", "Purandar", "Sinhagad"}) {
            map.put(more, more.length());                         // crosses 0.75 x 4 and 0.75 x 8
        }
        map.print();
        System.out.println("get(Raigad)  = " + map.get("Raigad"));
        System.out.println("remove(Raigad) = " + map.remove("Raigad") + ", get now = " + map.get("Raigad"));
        System.out.println("get(null) = " + map.get(null));
    }
}
''' + OUT]),
]

IH_PRACTICE = [
    practice(
        'Which bucket does each key land in?',
        'A trainee asks: "For a table of 8, 16 and 32 buckets, where do these forts go?" Answer with code.',
        ['Write <code>spread(Object key)</code> as <code>h ^ (h &gt;&gt;&gt; 16)</code>.',
         'For capacities 8, 16 and 32 print the bucket of "Torna", "Raigad", "Lohagad" and "Panhala".',
         'Mark with a star each key whose bucket stays the same when going from 8 to 16.'],
        r'''// Practice: bucket index = (n - 1) & spread(hash) for three capacities
public class IhPracticeBuckets {
    static int spread(Object key) {
        int h = key.hashCode();
        return h ^ (h >>> 16);
    }

    public static void main(String[] args) {
        String[] forts = {"Torna", "Raigad", "Lohagad", "Panhala"};
        for (String fort : forts) {
            int b8 = 7 & spread(fort);
            int b16 = 15 & spread(fort);
            int b32 = 31 & spread(fort);
            System.out.println(fort + "  8->" + b8 + "  16->" + b16 + "  32->" + b32 + (b8 == b16 ? "  *" : ""));
        }
    }
}
''' + OUT, level='Easy',
        hints=['The mask for n buckets is n - 1: 7, 15 and 31.']),
    practice(
        'Find the collisions',
        'Group ten fort names by their bucket in a 16-bucket table and report which buckets are shared.',
        ['Use a <code>TreeMap&lt;Integer, List&lt;String&gt;&gt;</code> from bucket number to the names in it.',
         'Print every bucket with its names.',
         'Print how many buckets hold more than one name, and the longest chain.'],
        r'''// Practice: counting collisions in a 16-bucket table
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class IhPracticeCollisions {
    public static void main(String[] args) {
        String[] forts = {"Torna", "Raigad", "Lohagad", "Panhala", "Purandar", "Sinhagad", "Rajgad", "Pratapgad", "Shivneri", "Visapur"};
        Map<Integer, List<String>> buckets = new TreeMap<>();
        for (String fort : forts) {
            int h = fort.hashCode();
            int index = 15 & (h ^ (h >>> 16));
            buckets.computeIfAbsent(index, k -> new ArrayList<>()).add(fort);
        }
        int shared = 0;
        int longest = 0;
        for (Map.Entry<Integer, List<String>> e : buckets.entrySet()) {
            System.out.println("bucket " + e.getKey() + ": " + e.getValue());
            if (e.getValue().size() > 1) {
                shared++;
            }
            longest = Math.max(longest, e.getValue().size());
        }
        System.out.println("buckets used: " + buckets.size() + ", shared: " + shared + ", longest chain: " + longest);
    }
}
''' + OUT, level='Easy',
        hints=['<code>computeIfAbsent</code> creates the list the first time a bucket number is seen.']),
    practice(
        'Fix the lost key: immutable keys',
        'A cache stores treks by a mutable key class and loses an entry. Show the bug, then fix it with an immutable <code>record</code> key.',
        ['Create a mutable key class with a non-final field used in <code>hashCode</code>. Put it, change the field, and print <code>get</code>.',
         'Create <code>record TrekKey(String fort, String city)</code> and show that the same lookup works.',
         'With the record, create a new equal key object and show that <code>get</code> finds the value.'],
        r'''// Practice: a mutable key is lost, a record key is safe
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class IhPracticeImmutableKey {
    static class MutableKey {
        String fort;

        MutableKey(String fort) {
            this.fort = fort;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof MutableKey k && k.fort.equals(fort);
        }

        @Override
        public int hashCode() {
            return Objects.hash(fort);
        }
    }

    record TrekKey(String fort, String city) { }                  // equals + hashCode generated, fields final

    public static void main(String[] args) {
        Map<MutableKey, String> bad = new HashMap<>();
        MutableKey k = new MutableKey("Torna");
        bad.put(k, "5 hours");
        k.fort = "Raigad";
        System.out.println("mutable key lookup : " + bad.get(k));

        Map<TrekKey, String> good = new HashMap<>();
        good.put(new TrekKey("Torna", "Pune"), "5 hours");
        System.out.println("record key lookup  : " + good.get(new TrekKey("Torna", "Pune")));
        System.out.println("different city     : " + good.get(new TrekKey("Torna", "Nagpur")));
    }
}
''' + OUT, level='Medium',
        hints=['A record cannot change after construction, so its hash never changes.']),
    practice(
        'null values and the null key',
        'A booking map allows both a null value and a null key. Show how to tell "absent" from "present with null", and where the null key lives.',
        ['Put "Torna" with a null value and put the key <code>null</code> with the value "walk-in".',
         'Print <code>get</code> and <code>containsKey</code> for "Torna" and "Missing".',
         'Print the bucket number the null key uses (its hash is 0).',
         'Use <code>getOrDefault</code> and explain why it still returns null for "Torna".'],
        r'''// Practice: null value vs missing key; the null key sits in bucket 0
import java.util.HashMap;
import java.util.Map;

public class IhPracticeNulls {
    public static void main(String[] args) {
        Map<String, String> bookings = new HashMap<>();
        bookings.put("Torna", null);
        bookings.put(null, "walk-in");
        System.out.println("get(Torna)         : " + bookings.get("Torna"));
        System.out.println("get(Missing)       : " + bookings.get("Missing"));
        System.out.println("containsKey(Torna) : " + bookings.containsKey("Torna"));
        System.out.println("containsKey(Missing): " + bookings.containsKey("Missing"));
        System.out.println("null key bucket    : " + (15 & 0));
        System.out.println("get(null)          : " + bookings.get(null));
        System.out.println("getOrDefault(Torna): " + bookings.getOrDefault("Torna", "default") + "  (key exists, so the stored null wins)");
        System.out.println("getOrDefault(Missing): " + bookings.getOrDefault("Missing", "default"));
    }
}
''' + OUT, level='Medium',
        hints=['<code>getOrDefault</code> only uses the default when the key is absent.']),
    practice(
        'Resize split: stay or move, in order',
        'When a table of 8 buckets doubles to 16, each chain is split into a "low" chain (stays at index i) and a "high" chain (moves to i + 8), keeping the order. Prove it matches re-hashing from scratch.',
        ['Create a table of 8 buckets, each an <code>ArrayList&lt;String&gt;</code>, and add twelve fort names in order.',
         'Build the 16-bucket table by <strong>splitting</strong>: for each node check the new bit <code>(hash &amp; 8)</code>; zero means low, non-zero means high.',
         'Build another 16-bucket table by adding the twelve names again to an empty table of 16.',
         'Print whether both tables are identical, and show the non-empty buckets of the split table.'],
        r'''// Practice: the Java 8 resize split keeps order and equals a fresh rehash
import java.util.ArrayList;
import java.util.List;

public class IhPracticeResizeSplit {
    static int spread(String key) {
        int h = key.hashCode();
        return h ^ (h >>> 16);
    }

    static List<List<String>> emptyTable(int n) {
        List<List<String>> table = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            table.add(new ArrayList<>());
        }
        return table;
    }

    public static void main(String[] args) {
        String[] forts = {"Torna", "Raigad", "Lohagad", "Panhala", "Purandar", "Sinhagad", "Rajgad", "Pratapgad",
            "Shivneri", "Visapur", "Sudhagad", "Tikona"};

        List<List<String>> small = emptyTable(8);
        for (String f : forts) {
            small.get(7 & spread(f)).add(f);                      // tail insertion keeps insertion order
        }

        List<List<String>> split = emptyTable(16);
        for (int i = 0; i < 8; i++) {
            for (String f : small.get(i)) {
                if ((spread(f) & 8) == 0) {
                    split.get(i).add(f);                          // low chain: stays
                } else {
                    split.get(i + 8).add(f);                      // high chain: moves by oldCapacity
                }
            }
        }

        List<List<String>> fresh = emptyTable(16);
        for (String f : forts) {
            fresh.get(15 & spread(f)).add(f);
        }

        System.out.println("split table equals fresh rehash: " + split.equals(fresh));
        for (int i = 0; i < 16; i++) {
            if (!split.get(i).isEmpty()) {
                System.out.println("bucket " + i + ": " + split.get(i));
            }
        }
    }
}
''' + OUT, level='Hard',
        hints=['Only one extra hash bit matters when the capacity doubles: <code>hash &amp; oldCapacity</code>.']),
]

EXTRAS = {
    'comparable': {
        'beginner': CMP_BEGINNER,
        'intermediate': CMP_INTERMEDIATE,
        'expert': CMP_EXPERT_BEFORE + CMP_PRACTICE,
    },
    'comparator': {
        'beginner': CP_BEGINNER,
        'intermediate': CP_INTERMEDIATE,
        'expert': CP_EXPERT_BEFORE + CP_PRACTICE,
    },
}
_IH = {
    'beginner': IH_BEGINNER,
    'intermediate': IH_FINDING,
    'expert': IH_EXPERT_BEFORE + IH_PRACTICE,
}
EXTRAS['internal-hashmap'] = _IH       # the spec id is 'internal-hashmap'
EXTRAS['internal_hashmap'] = _IH       # alias (spec file name); ignored by build.py unless it matches an id
