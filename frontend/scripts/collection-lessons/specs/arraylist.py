"""ArrayList lesson: what it is, every method with a runnable example, how it works inside, and the traps.
Data in the examples uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

# ------------------------------------------------------------------ beginner
BEGINNER = [
    section(
        'What is an ArrayList?',
        'An <strong>ArrayList</strong> is a <strong>resizable array</strong>. A normal Java array has a fixed size that you choose once; an '
        'ArrayList starts small and <strong>grows by itself</strong> when you add more elements, and shrinks when you remove them. '
        'Think of a list of forts you want to visit: you can add a new fort at the end, insert one in the middle, or cross one off, '
        'without ever deciding the size in advance.',
        [
            'It lives in the <code>java.util</code> package and implements the <code>List</code> interface (so it is an <strong>ordered</strong> collection).',
            '<strong>Order is kept:</strong> elements stay in the order you added them, and every element has an <strong>index</strong> starting at <code>0</code>.',
            '<strong>Duplicates are allowed:</strong> the same value can appear many times.',
            '<strong>null is allowed:</strong> you can store <code>null</code> (but avoid it in real programs).',
            '<strong>Fast reading:</strong> <code>get(index)</code> is instant, because inside it is an array.',
            '<strong>Not thread-safe:</strong> if several threads change one ArrayList at the same time, wrap it or use a concurrent list (see the Expert tab).',
            'It stores <strong>objects only</strong>. For numbers use the wrapper types: <code>ArrayList&lt;Integer&gt;</code>, not <code>ArrayList&lt;int&gt;</code>.',
        ],
    ),
    (
        '<h3>Where ArrayList sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Iterable', 'I', True, None, G), ('Collection', 'I', True, 'extends', G), ('List', 'I', True, 'extends', G),
            ('AbstractList', 'c', False, 'implements', B), ('ArrayList', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class. <code>ArrayList</code> also implements <code>RandomAccess</code> (a marker that says "index access is fast"), '
          '<code>Cloneable</code> and <code>Serializable</code>. In Java 21 <code>List</code> also extends <code>SequencedCollection</code>, which added '
          '<code>getFirst()</code>, <code>getLast()</code>, <code>addFirst()</code>, <code>addLast()</code>, <code>removeFirst()</code>, '
          '<code>removeLast()</code> and <code>reversed()</code>.</p>',
        [],
    ),
    (
        '<h3>Creating an ArrayList: the three constructors</h3>\n'
        + ul([
            '<code>new ArrayList&lt;&gt;()</code>: an empty list. Internally it starts with <strong>no array at all</strong> and allocates room for <strong>10</strong> elements on the first <code>add</code>.',
            '<code>new ArrayList&lt;&gt;(int initialCapacity)</code>: an empty list that already has room for that many elements. Use it when you know roughly how many items are coming; it avoids repeated growing.',
            '<code>new ArrayList&lt;&gt;(Collection c)</code>: a <strong>copy</strong> of another collection, in that collection\'s iteration order.',
        ])
        + '\n<p><strong>Tip:</strong> declare the variable with the <strong>interface</strong> type, <code>List&lt;String&gt; forts = new ArrayList&lt;&gt;();</code>. '
          'Your code then does not care which list class is behind it, and you can switch to another implementation later by changing one word.</p>',
        [r'''// ArrayList constructors: empty, with capacity, and copy of another collection
import java.util.ArrayList;
import java.util.List;

public class ArrayListCreateDemo {
    public static void main(String[] args) {
        // 1) Empty list: the usual way; the type goes on the left, the diamond <> infers it on the right
        List<String> forts = new ArrayList<>();
        forts.add("Raigad");
        forts.add("Sinhagad");
        System.out.println("Empty list then two adds: " + forts);

        // 2) Capacity hint: still empty (size 0), but ready to hold 100 elements without growing
        List<String> manyCities = new ArrayList<>(100);
        System.out.println("With capacity 100, size is: " + manyCities.size());

        // 3) Copy constructor: builds a NEW list holding the same elements
        List<String> copy = new ArrayList<>(forts);
        copy.add("Torna");
        System.out.println("Copy after adding Torna : " + copy);
        System.out.println("Original is unchanged   : " + forts);
    }
}
''' + OUT],
    ),
    (
        '<h3>Your first ArrayList program</h3>\n'
        + ul([
            '<code>add(x)</code> puts x at the <strong>end</strong>; <code>get(i)</code> reads the element at index i; <code>size()</code> tells how many elements there are.',
            'Printing the list shows all elements in <code>[a, b, c]</code> form because <code>ArrayList</code> overrides <code>toString()</code>.',
            'The last valid index is always <code>size() - 1</code>. Reading beyond it throws <code>IndexOutOfBoundsException</code>.',
        ]),
        [r'''// First ArrayList program: add, get, size and print
import java.util.ArrayList;
import java.util.List;

public class ArrayListFirstDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>();

        forts.add("Raigad");       // index 0
        forts.add("Sinhagad");     // index 1
        forts.add("Pratapgad");    // index 2

        System.out.println("List          : " + forts);
        System.out.println("Size          : " + forts.size());
        System.out.println("First (idx 0) : " + forts.get(0));
        System.out.println("Last          : " + forts.get(forts.size() - 1));
    }
}
''' + OUT],
    ),
    (
        '<h3>ArrayList stores objects: using numbers</h3>\n'
        + ul([
            'Generic type arguments must be classes, so use the wrapper classes <code>Integer</code>, <code>Double</code>, <code>Long</code>, <code>Boolean</code>, <code>Character</code>.',
            'Java converts automatically between <code>int</code> and <code>Integer</code> (<strong>autoboxing</strong> when adding, <strong>unboxing</strong> when reading).',
        ]),
        [r'''// ArrayList with numbers: wrapper types and autoboxing
import java.util.ArrayList;
import java.util.List;

public class ArrayListNumbersDemo {
    public static void main(String[] args) {
        // List<int> is NOT allowed. Use List<Integer>.
        List<Integer> trekHours = new ArrayList<>();

        trekHours.add(4);      // the int 4 is autoboxed to an Integer object
        trekHours.add(2);
        trekHours.add(6);

        int first = trekHours.get(0);   // unboxed back to a plain int
        int total = 0;
        for (int hours : trekHours) {   // each Integer is unboxed in the loop
            total += hours;
        }

        System.out.println("Trek hours: " + trekHours);
        System.out.println("First     : " + first);
        System.out.println("Total     : " + total);
    }
}
''' + OUT],
    ),
    (
        '<h3>All ArrayList methods at a glance</h3>\n<p>Each method is explained with its own runnable example in the next tab. '
        '<em>n</em> is the number of elements.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>add(e)</strong>', 'Adds at the end', 'O(1) amortised'],
            ['<strong>add(i, e)</strong>', 'Inserts at index i, shifting the rest right', 'O(n)'],
            ['<strong>addAll(c)</strong> / <strong>addAll(i, c)</strong>', 'Adds every element of another collection', 'O(m) / O(n+m)'],
            ['<strong>addFirst(e)</strong> / <strong>addLast(e)</strong>', 'Adds at the start / end (Java 21)', 'O(n) / O(1)'],
            ['<strong>get(i)</strong>', 'Reads the element at index i', 'O(1)'],
            ['<strong>getFirst()</strong> / <strong>getLast()</strong>', 'Reads the first / last element (Java 21)', 'O(1)'],
            ['<strong>set(i, e)</strong>', 'Replaces the element at index i, returns the old one', 'O(1)'],
            ['<strong>size()</strong> / <strong>isEmpty()</strong>', 'Number of elements / is it empty', 'O(1)'],
            ['<strong>contains(o)</strong> / <strong>containsAll(c)</strong>', 'Is the element (all elements) present', 'O(n)'],
            ['<strong>indexOf(o)</strong> / <strong>lastIndexOf(o)</strong>', 'First / last position of an element, -1 if missing', 'O(n)'],
            ['<strong>remove(i)</strong> / <strong>remove(o)</strong>', 'Removes by index / by value', 'O(n)'],
            ['<strong>removeFirst()</strong> / <strong>removeLast()</strong>', 'Removes the first / last element (Java 21)', 'O(n) / O(1)'],
            ['<strong>removeAll(c)</strong> / <strong>retainAll(c)</strong>', 'Removes / keeps only the elements found in c', 'O(n*m)'],
            ['<strong>removeIf(p)</strong>', 'Removes every element that matches a condition', 'O(n)'],
            ['<strong>replaceAll(op)</strong>', 'Replaces every element with the result of a function', 'O(n)'],
            ['<strong>sort(cmp)</strong>', 'Sorts the list in place', 'O(n log n)'],
            ['<strong>clear()</strong>', 'Removes everything', 'O(n)'],
            ['<strong>subList(a, b)</strong>', 'A live view of a part of the list', 'O(1)'],
            ['<strong>toArray()</strong> / <strong>toArray(T[])</strong>', 'Copies the elements into an array', 'O(n)'],
            ['<strong>stream()</strong>', 'Starts a stream pipeline over the elements', 'O(1) to create'],
            ['<strong>iterator()</strong> / <strong>listIterator()</strong>', 'Walks the elements (and can remove / add / go backwards)', 'O(1) per step'],
            ['<strong>forEach(action)</strong> / <strong>spliterator()</strong>', 'Runs an action for every element / splittable iteration', 'O(n)'],
            ['<strong>clone()</strong>', 'Shallow copy of the list', 'O(n)'],
            ['<strong>equals(o)</strong> / <strong>hashCode()</strong> / <strong>toString()</strong>', 'Compare, hash and print by content', 'O(n)'],
            ['<strong>ensureCapacity(n)</strong> / <strong>trimToSize()</strong>', 'Grow the room ahead / shrink it to fit', 'O(n)'],
            ['<strong>reversed()</strong>', 'A reversed view of the list (Java 21)', 'O(1)'],
        ]),
        [],
    ),
]

# ------------------------------------------------------------------ intermediate: methods
INTERMEDIATE = [
    section('Adding elements', 'Four ways to put elements in: at the end, at a position, a whole collection at the end, and a whole collection at a position.'),
    method(
        'add(E e)', 'boolean add(E e)', '<code>true</code> (always, for ArrayList)', 'O(1) amortised',
        'Puts the element at the <strong>end</strong> of the list. The list grows by one. You do not have to check the size first.',
        'Normally just writes into the next free slot of the internal array. When the array is full it allocates a bigger one (about 1.5 times) and copies, which is why the cost is called <em>amortised</em> O(1): rare expensive growths are spread over many cheap adds. Every structural change also increases <code>modCount</code>, which makes running iterators fail fast.',
        r'''// ArrayList add(E e): adds one element at the end
import java.util.ArrayList;
import java.util.List;

public class ArrayListAddDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>();

        boolean added = forts.add("Raigad");   // add returns true
        forts.add("Sinhagad");
        forts.add("Raigad");                   // duplicates are fine
        forts.add(null);                       // null is allowed too

        System.out.println("add returned : " + added);
        System.out.println("List         : " + forts);
        System.out.println("Size         : " + forts.size());
    }
}
''' + OUT),
    method(
        'add(int index, E e)', 'void add(int index, E element)', 'nothing (void)', 'O(n): later elements shift right',
        'Inserts the element <strong>at the position you choose</strong>. The element that was there, and everything after it, moves one step to the right. Valid indexes are <code>0</code> to <code>size()</code> (adding at <code>size()</code> is the same as adding at the end).',
        'Uses <code>System.arraycopy</code> to shift the tail, so inserting near the front of a big list is expensive. If you insert at the front very often, an <code>ArrayDeque</code> or <code>LinkedList</code> may suit better.',
        r'''// ArrayList add(int index, E e): inserts at a position
import java.util.ArrayList;
import java.util.List;

public class ArrayListAddAtIndexDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Nagpur"));
        System.out.println("Before        : " + cities);

        cities.add(1, "Mumbai");               // goes to index 1; Nashik and Nagpur shift right
        cities.add(0, "Delhi");                // insert at the very front
        cities.add(cities.size(), "Jaipur");   // index == size() means "at the end"
        System.out.println("After inserts : " + cities);

        try {
            cities.add(10, "Kochi");           // 10 is beyond size(): not allowed
        } catch (IndexOutOfBoundsException e) {
            System.out.println("Error         : " + e.getMessage());
        }
    }
}
''' + OUT,
        watch='Index <code>size() + 1</code> or more throws <code>IndexOutOfBoundsException</code>; you cannot leave gaps in a list.'),
    method(
        'addAll(Collection c)', 'boolean addAll(Collection<? extends E> c)', '<code>true</code> if the list changed', 'O(m), m = size of c',
        'Adds <strong>every element</strong> of another collection (a list, a set, even a queue) to the <strong>end</strong>, in that collection\'s order. It returns <code>false</code> only when you add an empty collection.',
        'Converts the argument to an array once and copies it in a single block, so it is much faster than calling <code>add</code> in a loop. The argument may hold subtypes of the element type (<code>? extends E</code>).',
        r'''// ArrayList addAll(Collection c): adds a whole collection at the end
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class ArrayListAddAllDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad"));
        List<String> moreForts = List.of("Torna", "Purandar");
        Set<String> sortedForts = new TreeSet<>(List.of("Rajgad", "Lohagad"));   // a Set works too

        boolean changed = forts.addAll(moreForts);
        System.out.println("addAll returned : " + changed);
        System.out.println("After list      : " + forts);

        forts.addAll(sortedForts);                    // a TreeSet hands over its elements in sorted order
        System.out.println("After set       : " + forts);

        boolean empty = forts.addAll(List.of());      // nothing to add
        System.out.println("Adding empty    : " + empty);
    }
}
''' + OUT),
    method(
        'addAll(int index, Collection c)', 'boolean addAll(int index, Collection<? extends E> c)', '<code>true</code> if the list changed', 'O(n + m)',
        'Inserts a whole collection <strong>in the middle</strong>: the new elements go in at <code>index</code> (in their own order) and the old elements after it shift to the right.',
        'One shift of the tail plus one copy of the new block. Prefer it over a loop of <code>add(i, e)</code> calls, which would shift the tail once per element.',
        r'''// ArrayList addAll(int index, Collection c): inserts a collection at a position
import java.util.ArrayList;
import java.util.List;

public class ArrayListAddAllAtIndexDemo {
    public static void main(String[] args) {
        List<String> route = new ArrayList<>(List.of("Pune", "Nagpur", "Kochi"));
        List<String> detour = List.of("Nashik", "Indore");

        route.addAll(1, detour);       // goes in at index 1, before Nagpur
        System.out.println("Route: " + route);
    }
}
''' + OUT),
    method(
        'addFirst(E) and addLast(E)  (Java 21)', 'void addFirst(E e);  void addLast(E e)', 'nothing (void)', 'addFirst O(n), addLast O(1) amortised',
        'Two readable shortcuts: <code>addFirst(x)</code> means <code>add(0, x)</code> and <code>addLast(x)</code> means <code>add(x)</code>. They arrived in <strong>Java 21</strong> with the new <code>SequencedCollection</code> interface.',
        'They are default methods that every <code>List</code> now has, so code that needs "first/last" semantics can accept any sequenced collection. On an ArrayList, <code>addFirst</code> still shifts every element.',
        r'''// ArrayList addFirst / addLast (Java 21)
import java.util.ArrayList;
import java.util.List;

public class ArrayListAddFirstLastDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Sinhagad", "Pratapgad"));

        forts.addFirst("Raigad");     // same as add(0, "Raigad")
        forts.addLast("Torna");       // same as add("Torna")

        System.out.println(forts);
    }
}
''' + OUT),

    section('Reading elements', 'Reading never changes the list. Use <code>get</code> for a position, <code>indexOf</code> to find a value, and <code>contains</code> to ask "is it there?".'),
    method(
        'get(int index)', 'E get(int index)', 'the element at that index', 'O(1)',
        'Returns the element at the given index. Indexes start at <strong>0</strong>, so the third fort is <code>get(2)</code>. An index below 0 or at/above <code>size()</code> throws <code>IndexOutOfBoundsException</code>.',
        'Direct array access after a bounds check: this is why ArrayList is the default list. It is also why a <code>for (int i...)</code> loop with <code>get(i)</code> is perfectly fine on an ArrayList but slow (O(n&sup2;)) on a <code>LinkedList</code>.',
        r'''// ArrayList get(int index): reads an element by position
import java.util.ArrayList;
import java.util.List;

public class ArrayListGetDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Pratapgad"));

        System.out.println("get(0)            : " + forts.get(0));
        System.out.println("get(2)            : " + forts.get(2));
        System.out.println("Last element      : " + forts.get(forts.size() - 1));

        try {
            forts.get(3);                         // valid indexes are 0, 1 and 2
        } catch (IndexOutOfBoundsException e) {
            System.out.println("get(3) fails      : " + e.getMessage());
        }
    }
}
''' + OUT),
    method(
        'getFirst() and getLast()  (Java 21)', 'E getFirst();  E getLast()', 'the first / last element', 'O(1)',
        'Read the first or the last element without writing <code>get(0)</code> or <code>get(size() - 1)</code>. On an <strong>empty</strong> list they throw <code>NoSuchElementException</code> (unlike <code>get(0)</code>, which throws <code>IndexOutOfBoundsException</code>).',
        'Part of <code>SequencedCollection</code>. They make the intent obvious and avoid the classic off-by-one mistake in <code>size() - 1</code>.',
        r'''// ArrayList getFirst / getLast (Java 21)
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

public class ArrayListGetFirstLastDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Nagpur"));
        System.out.println("First: " + cities.getFirst());
        System.out.println("Last : " + cities.getLast());

        List<String> empty = new ArrayList<>();
        try {
            empty.getFirst();                    // nothing to return
        } catch (NoSuchElementException e) {
            System.out.println("Empty list -> NoSuchElementException");
        }
    }
}
''' + OUT),
    method(
        'size() and isEmpty()', 'int size();  boolean isEmpty()', 'the number of elements / whether it has none', 'O(1)',
        '<code>size()</code> counts the elements that are really stored (not the capacity). <code>isEmpty()</code> is simply <code>size() == 0</code>; prefer it because it reads better.',
        '<code>size</code> is a plain <code>int</code> field, so both calls are free. Remember that <code>size()</code> is the number of elements, <strong>not</strong> the size of the internal array (that is the capacity).',
        r'''// ArrayList size() and isEmpty()
import java.util.ArrayList;
import java.util.List;

public class ArrayListSizeDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>();
        System.out.println("New list    -> size " + forts.size() + ", empty? " + forts.isEmpty());

        forts.add("Raigad");
        forts.add("Torna");
        System.out.println("After adds  -> size " + forts.size() + ", empty? " + forts.isEmpty());

        forts.clear();
        System.out.println("After clear -> size " + forts.size() + ", empty? " + forts.isEmpty());
    }
}
''' + OUT),
    method(
        'contains(Object o)', 'boolean contains(Object o)', '<code>true</code> if an equal element exists', 'O(n)',
        'Answers "is this value in the list?". It checks the elements one by one from the start until it finds a match.',
        'Matching uses <code>equals()</code>, not <code>==</code>, so your own classes must override <code>equals</code> (and <code>hashCode</code>) to be found. If you call <code>contains</code> often on a big list, use a <code>HashSet</code> instead (O(1)).',
        r'''// ArrayList contains(Object o): is the value present?
import java.util.ArrayList;
import java.util.List;

public class ArrayListContainsDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Pratapgad"));

        System.out.println("Contains Raigad?   " + forts.contains("Raigad"));
        System.out.println("Contains Torna?    " + forts.contains("Torna"));
        System.out.println("Case matters:      " + forts.contains("raigad"));   // equals() is case-sensitive

        if (!forts.contains("Torna")) {          // a common guard before adding, to avoid duplicates
            forts.add("Torna");
        }
        System.out.println("After guard add:   " + forts);
    }
}
''' + OUT),
    method(
        'containsAll(Collection c)', 'boolean containsAll(Collection<?> c)', '<code>true</code> if every element of c is present', 'O(n*m)',
        'Checks that <strong>all</strong> of the given elements are in the list. Handy to test "does this route cover all the forts I want?".',
        'Implemented in <code>AbstractCollection</code> as a loop of <code>contains</code> calls, hence O(n*m). For big inputs, copy into a <code>HashSet</code> first.',
        r'''// ArrayList containsAll(Collection c): are all of these present?
import java.util.ArrayList;
import java.util.List;

public class ArrayListContainsAllDemo {
    public static void main(String[] args) {
        List<String> visited = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));

        List<String> wishlist = List.of("Raigad", "Torna");
        List<String> bigWishlist = List.of("Raigad", "Lohagad");

        System.out.println("Visited all of wishlist?     " + visited.containsAll(wishlist));
        System.out.println("Visited all of bigWishlist?  " + visited.containsAll(bigWishlist));
    }
}
''' + OUT),
    method(
        'indexOf(Object o) and lastIndexOf(Object o)', 'int indexOf(Object o);  int lastIndexOf(Object o)', 'the index, or <code>-1</code> if not found', 'O(n)',
        '<code>indexOf</code> gives the position of the <strong>first</strong> match, <code>lastIndexOf</code> the position of the <strong>last</strong> match. Because the list may contain duplicates, these can differ. If the value is missing you get <code>-1</code>.',
        'Both use <code>equals()</code>. A negative result is not an exception, so always test for <code>-1</code> before using it as an index.',
        r'''// ArrayList indexOf / lastIndexOf
import java.util.ArrayList;
import java.util.List;

public class ArrayListIndexOfDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Pune", "Nagpur", "Pune"));

        System.out.println("indexOf(Pune)      : " + cities.indexOf("Pune"));        // first match
        System.out.println("lastIndexOf(Pune)  : " + cities.lastIndexOf("Pune"));    // last match
        System.out.println("indexOf(Nagpur)    : " + cities.indexOf("Nagpur"));
        System.out.println("indexOf(Kochi)     : " + cities.indexOf("Kochi"));      // not present

        int position = cities.indexOf("Nashik");
        if (position != -1) {                        // always check for -1
            System.out.println("Nashik is at index " + position);
        }
    }
}
''' + OUT),

    section('Changing elements', 'Replace one element, transform all elements, or put them in a new order. None of these change the <strong>size</strong> of the list.'),
    method(
        'set(int index, E e)', 'E set(int index, E element)', 'the element that was replaced', 'O(1)',
        'Overwrites the element at <code>index</code> with a new one and gives you the <strong>old</strong> element back. The size does not change (unlike <code>add(i, e)</code>, which inserts).',
        'A plain array store after a bounds check; it does <strong>not</strong> increase <code>modCount</code>, so it is allowed while you iterate (it is not a structural change).',
        r'''// ArrayList set(int index, E e): replaces an element
import java.util.ArrayList;
import java.util.List;

public class ArrayListSetDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Pratapgad"));

        String old = forts.set(1, "Rajgad");    // replaces Sinhagad and returns it
        System.out.println("Replaced   : " + old);
        System.out.println("List now   : " + forts);
        System.out.println("Size       : " + forts.size());   // unchanged
    }
}
''' + OUT),
    method(
        'replaceAll(UnaryOperator op)', 'void replaceAll(UnaryOperator<E> operator)', 'nothing (void)', 'O(n)',
        'Applies a function to <strong>every</strong> element and stores the result back in the same position, for example "make every name upper case". Write the function as a lambda: <code>s -&gt; s.toUpperCase()</code>.',
        'Runs in place and does not create a second list. The operator must return the same type (<code>UnaryOperator&lt;E&gt;</code>). It is a cleaner alternative to a <code>for</code> loop that calls <code>set</code> for each index.',
        r'''// ArrayList replaceAll(UnaryOperator): transforms every element in place
import java.util.ArrayList;
import java.util.List;

public class ArrayListReplaceAllDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna"));

        forts.replaceAll(name -> name.toUpperCase());      // lambda: every element becomes upper case
        System.out.println(forts);

        List<Integer> hours = new ArrayList<>(List.of(2, 4, 6));
        hours.replaceAll(h -> h * 2);                       // works for numbers too
        System.out.println(hours);
    }
}
''' + OUT),
    method(
        'sort(Comparator c)', 'void sort(Comparator<? super E> c)', 'nothing (void)', 'O(n log n)',
        'Sorts the list <strong>in place</strong>. Pass <code>null</code> (or <code>Comparator.naturalOrder()</code>) for natural order: A to Z for text, small to large for numbers. Pass your own comparator for any other order, for example by length.',
        'Uses TimSort, which is <strong>stable</strong> (equal elements keep their relative order) and very fast on partly sorted data. <code>Collections.sort(list)</code> simply calls <code>list.sort(null)</code>. Elements must be mutually comparable or you must supply a comparator, otherwise <code>ClassCastException</code>.',
        r'''// ArrayList sort(Comparator): sorts the list in place
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class ArrayListSortDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Torna", "Raigad", "Sinhagad", "Lohagad"));

        forts.sort(null);                                   // natural order: alphabetical
        System.out.println("Natural        : " + forts);

        forts.sort(Comparator.reverseOrder());              // Z to A
        System.out.println("Reverse        : " + forts);

        forts.sort(Comparator.comparing(String::length));   // shortest name first (stable for equal lengths)
        System.out.println("By length      : " + forts);

        Collections.sort(forts);                            // the older style, same result as sort(null)
        System.out.println("Collections    : " + forts);
    }
}
''' + OUT),
    method(
        'Collections.reverse, swap and shuffle', 'Collections.reverse(List);  Collections.swap(List, int, int);  Collections.shuffle(List)', 'nothing (void)', 'O(n)',
        'The <code>Collections</code> helper class (note the <strong>s</strong>) works on any list: <code>reverse</code> flips the order, <code>swap</code> exchanges two positions, <code>shuffle</code> randomises the order.',
        'They change the list in place. <code>shuffle</code> accepts a <code>Random</code>; passing a seeded <code>new Random(42)</code> makes the shuffle repeatable, which is what you want in tests. In Java 21 <code>list.reversed()</code> gives a reversed <em>view</em> without copying.',
        r'''// Collections.reverse / swap / shuffle on an ArrayList
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class ArrayListReorderDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Nagpur", "Indore"));

        Collections.reverse(cities);
        System.out.println("reverse : " + cities);

        Collections.swap(cities, 0, 3);                    // exchange the first and the last
        System.out.println("swap    : " + cities);

        Collections.shuffle(cities, new Random(7));       // seeded: same order on every run
        System.out.println("shuffle : " + cities);

        System.out.println("reversed view (Java 21): " + cities.reversed());
    }
}
''' + OUT),

    section('Removing elements', 'There are many ways to remove. Pick by what you know: the <strong>position</strong>, the <strong>value</strong>, a <strong>group</strong> of values, or a <strong>rule</strong>.'),
    method(
        'remove(int index) and remove(Object o)', 'E remove(int index);  boolean remove(Object o)', 'the removed element / <code>true</code> if something was removed', 'O(n): later elements shift left',
        '<code>remove(index)</code> removes <strong>by position</strong> and returns the removed element. <code>remove(value)</code> removes the <strong>first element equal to the value</strong> and returns <code>true</code> or <code>false</code>. After a removal the elements after it move one step left, so their indexes change.',
        'With <code>List&lt;Integer&gt;</code> the call <code>list.remove(2)</code> is <strong>remove by index</strong>, because <code>int</code> matches <code>remove(int)</code> exactly. To remove the <em>value</em> 2 you must write <code>list.remove(Integer.valueOf(2))</code>. This trap catches many developers (see the example).',
        r'''// ArrayList remove(int index) and remove(Object o)
import java.util.ArrayList;
import java.util.List;

public class ArrayListRemoveDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Sinhagad"));

        String gone = forts.remove(0);                 // by index: returns the removed element
        System.out.println("remove(0)          : " + gone + " -> " + forts);

        boolean removed = forts.remove("Sinhagad");    // by value: removes only the FIRST match
        System.out.println("remove(\"Sinhagad\") : " + removed + " -> " + forts);

        boolean missing = forts.remove("Panhala");     // not present: false, list unchanged
        System.out.println("remove(\"Panhala\")  : " + missing + " -> " + forts);

        // The Integer trap: an int argument means "index", an Integer object means "value"
        List<Integer> numbers = new ArrayList<>(List.of(10, 20, 30, 2));
        numbers.remove(2);                              // index 2 -> removes 30, NOT the value 2
        System.out.println("remove(2) on ints  : " + numbers);
        numbers.remove(Integer.valueOf(2));             // value 2
        System.out.println("remove(Integer 2)  : " + numbers);
    }
}
''' + OUT,
        watch='Removing inside a plain <code>for</code> or <em>for-each</em> loop skips elements or throws <code>ConcurrentModificationException</code>. Use <code>removeIf</code> or an <code>Iterator</code> (shown below).'),
    method(
        'removeAll(Collection c) and retainAll(Collection c)', 'boolean removeAll(Collection<?> c);  boolean retainAll(Collection<?> c)', '<code>true</code> if the list changed', 'O(n*m)',
        '<code>removeAll(c)</code> deletes every element that <strong>is</strong> in c (a "subtract"). <code>retainAll(c)</code> keeps only the elements that <strong>are</strong> in c and deletes the rest (an "intersection").',
        'Both run a single pass over the list, calling <code>c.contains(...)</code> for each element. Make <code>c</code> a <code>HashSet</code> when it is large, otherwise the cost is O(n*m).',
        r'''// ArrayList removeAll / retainAll: set-like subtract and intersect
import java.util.ArrayList;
import java.util.List;

public class ArrayListRemoveAllRetainAllDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar", "Raigad"));
        List<String> closed = List.of("Torna", "Raigad");

        List<String> open = new ArrayList<>(forts);
        open.removeAll(closed);                      // removes EVERY Torna and Raigad
        System.out.println("removeAll : " + open);

        List<String> closedOnly = new ArrayList<>(forts);
        closedOnly.retainAll(closed);                // keeps only Torna and Raigad
        System.out.println("retainAll : " + closedOnly);
    }
}
''' + OUT),
    method(
        'removeIf(Predicate p)', 'boolean removeIf(Predicate<? super E> filter)', '<code>true</code> if anything was removed', 'O(n)',
        'Removes <strong>every element that matches a rule</strong>. The rule is a lambda that returns <code>true</code> for the elements to delete, e.g. <code>n -&gt; n % 2 == 0</code> for "all even numbers". It is the <strong>safe and short</strong> way to remove while looping.',
        'ArrayList overrides it with a one-pass bit-set algorithm: it first marks the elements to delete, then compacts the array once, so it is O(n) instead of O(n&sup2;) for repeated <code>remove</code> calls. It also checks <code>modCount</code> and throws <code>ConcurrentModificationException</code> if the predicate itself modifies the list.',
        r'''// ArrayList removeIf(Predicate): removes by a rule
import java.util.ArrayList;
import java.util.List;

public class ArrayListRemoveIfDemo {
    public static void main(String[] args) {
        List<Integer> trekHours = new ArrayList<>(List.of(5, 9, 8, 6, 1, 12));
        trekHours.removeIf(h -> h % 2 == 0);             // delete every even number
        System.out.println("Odd hours only : " + trekHours);

        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Nagpur", "Indore"));
        boolean changed = cities.removeIf(c -> c.startsWith("N"));   // delete names starting with N
        System.out.println("Removed N*     : " + cities + " (changed: " + changed + ")");
    }
}
''' + OUT),
    method(
        'removeFirst() and removeLast()  (Java 21)', 'E removeFirst();  E removeLast()', 'the removed element', 'removeFirst O(n), removeLast O(1)',
        'Take the first or last element <strong>out of the list and return it</strong>. On an empty list they throw <code>NoSuchElementException</code>.',
        'Together with <code>addLast</code> they let an ArrayList act as a stack (use the end) efficiently. For a queue (taking from the front) the shifting makes it O(n); use <code>ArrayDeque</code> for that.',
        r'''// ArrayList removeFirst / removeLast (Java 21)
import java.util.ArrayList;
import java.util.List;

public class ArrayListRemoveFirstLastDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Pratapgad", "Torna"));

        String first = forts.removeFirst();
        String last = forts.removeLast();

        System.out.println("Removed first : " + first);
        System.out.println("Removed last  : " + last);
        System.out.println("Remaining     : " + forts);
    }
}
''' + OUT),
    method(
        'clear()', 'void clear()', 'nothing (void)', 'O(n)',
        'Removes <strong>all</strong> elements. The list object is still there and still usable; its size becomes 0.',
        'It sets every slot to <code>null</code> so the removed objects can be garbage collected, but it <strong>keeps</strong> the internal array, so the capacity stays. To release the memory too, call <code>trimToSize()</code> afterwards or drop the list.',
        r'''// ArrayList clear(): removes everything
import java.util.ArrayList;
import java.util.List;

public class ArrayListClearDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Torna", "Purandar"));
        System.out.println("Before clear: " + forts + " size " + forts.size());

        forts.clear();
        System.out.println("After clear : " + forts + " size " + forts.size());

        forts.add("Lohagad");                       // the same list can be reused
        System.out.println("Reused      : " + forts);
    }
}
''' + OUT),

    section('Parts, copies and conversions', 'Sometimes you need a piece of a list, a copy, an array, a stream or a read-only version.'),
    method(
        'subList(int from, int to)', 'List<E> subList(int fromIndex, int toIndex)', 'a <strong>view</strong> of that range', 'O(1)',
        'Gives you the part of the list from <code>from</code> (included) up to <code>to</code> (<strong>excluded</strong>). It is not a copy: it is a <strong>window</strong> onto the original list, so changing the window changes the list and the other way round.',
        'The view keeps a reference to its parent. If you change the <em>parent\'s size</em> (add or remove) after creating the view and then use the view, you get <code>ConcurrentModificationException</code>. Clearing a sub-list is a neat way to delete a range in one call: <code>list.subList(2, 5).clear()</code>. Wrap it in <code>new ArrayList&lt;&gt;(list.subList(...))</code> when you want an independent copy.',
        r'''// ArrayList subList(from, to): a live view of a range
import java.util.ArrayList;
import java.util.List;

public class ArrayListSubListDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Pratapgad", "Torna", "Purandar"));

        List<String> middle = forts.subList(1, 4);          // indexes 1, 2, 3 (4 is excluded)
        System.out.println("subList(1, 4)     : " + middle);

        middle.set(0, "Rajgad");                            // writing through the view changes the parent
        System.out.println("Parent after set  : " + forts);

        forts.subList(0, 2).clear();                        // delete a whole range in one call
        System.out.println("After range clear : " + forts);

        List<String> copy = new ArrayList<>(forts.subList(0, 2));   // an independent copy
        copy.add("Lohagad");
        System.out.println("Copy              : " + copy + "   Parent: " + forts);
    }
}
''' + OUT),
    method(
        'toArray()', 'Object[] toArray();  <T> T[] toArray(T[] a)', 'an array holding the elements', 'O(n)',
        'Copies the list into an array, for old APIs that need an array. <code>toArray()</code> returns an <code>Object[]</code>. To get a <code>String[]</code> pass an empty array of that type: <code>list.toArray(new String[0])</code>.',
        'The copy is independent of the list (changing one does not change the other); the elements themselves are the same objects. Since Java 11 you can also write <code>list.toArray(String[]::new)</code>. Passing a zero-length array is the recommended style: it is as fast as pre-sizing and safer.',
        r'''// ArrayList toArray(): copies the list into an array
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ArrayListToArrayDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna"));

        Object[] objects = forts.toArray();                  // always Object[]
        String[] names = forts.toArray(new String[0]);       // typed array: the usual way
        String[] viaRef = forts.toArray(String[]::new);      // Java 11+ shortcut

        names[0] = "Rajgad";                                 // changing the array does not touch the list
        System.out.println("Array  : " + Arrays.toString(names));
        System.out.println("List   : " + forts);
        System.out.println("Object[] length: " + objects.length + ", String[] length: " + viaRef.length);
    }
}
''' + OUT),
    method(
        'stream()', 'Stream<E> stream()', 'a stream over the elements', 'O(1) to create; O(n) to process',
        'Starts a <strong>pipeline</strong> to filter, change, count or collect the elements without writing loops: <code>list.stream().filter(...).map(...).toList()</code>. The original list is not changed.',
        'The stream is lazy and single-use. Because ArrayList is <code>RandomAccess</code> and sized, its spliterator splits evenly, so <code>parallelStream()</code> can be effective for large, CPU-heavy work (but measure first).',
        r'''// ArrayList stream(): filter, transform and collect without loops
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ArrayListStreamDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Pratapgad", "Torna", "Purandar"));

        List<String> longNames = forts.stream()
                .filter(name -> name.length() > 6)           // keep long names
                .map(String::toUpperCase)                    // transform each one
                .collect(Collectors.toList());               // collect into a new list
        System.out.println("Long names : " + longNames);

        long count = forts.stream().filter(name -> name.startsWith("P")).count();
        System.out.println("Start with P: " + count);

        String joined = forts.stream().collect(Collectors.joining(" | "));
        System.out.println("Joined     : " + joined);
        System.out.println("Original   : " + forts);         // unchanged
    }
}
''' + OUT),
    method(
        'List.of, List.copyOf and Arrays.asList', 'List.of(E...);  List.copyOf(Collection);  Arrays.asList(T...)', 'a read-only or fixed-size list (not an ArrayList)', 'O(n)',
        'Three quick ways to create a list from values. <code>List.of(...)</code> and <code>List.copyOf(...)</code> give an <strong>immutable</strong> list (no add, remove or set at all, and no <code>null</code>). <code>Arrays.asList(...)</code> gives a <strong>fixed-size</strong> list: you may <code>set</code> but not add or remove.',
        'None of them is a <code>java.util.ArrayList</code> (<code>Arrays.asList</code> returns a private inner class that writes through to the array). Wrap in <code>new ArrayList&lt;&gt;(...)</code> when you need a normal mutable list.',
        r'''// List.of / List.copyOf / Arrays.asList versus a real ArrayList
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ArrayListFactoryDemo {
    public static void main(String[] args) {
        List<String> immutable = List.of("Raigad", "Torna");
        List<String> fixedSize = Arrays.asList("Raigad", "Torna");
        List<String> mutable = new ArrayList<>(immutable);     // a real, growable copy

        try {
            immutable.add("Purandar");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of      : add is not supported");
        }

        fixedSize.set(0, "Rajgad");                            // set is allowed on asList
        System.out.println("Arrays.asList: set worked -> " + fixedSize);
        try {
            fixedSize.add("Purandar");                         // but size cannot change
        } catch (UnsupportedOperationException e) {
            System.out.println("Arrays.asList: add is not supported");
        }

        mutable.add("Purandar");
        System.out.println("new ArrayList : " + mutable);
    }
}
''' + OUT,
        watch='A very common bug is <code>Arrays.asList(...).add(...)</code>: it compiles, then fails at run time.'),
    method(
        'Collections.unmodifiableList and synchronizedList', 'Collections.unmodifiableList(List);  Collections.synchronizedList(List)', 'a wrapper view of the same list', 'O(1)',
        '<code>unmodifiableList</code> hands out a <strong>read-only</strong> view (safe to give to other code). <code>synchronizedList</code> wraps the list so that each single method call is thread-safe.',
        'Both are <strong>views</strong>: the unmodifiable view still shows later changes made through the original list, so it is not an immutable snapshot (use <code>List.copyOf</code> for that). A synchronized list still needs a manual <code>synchronized (list) { ... }</code> block while iterating.',
        r'''// Collections.unmodifiableList / synchronizedList: wrapper views
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ArrayListWrappersDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Torna"));

        List<String> readOnly = Collections.unmodifiableList(forts);
        try {
            readOnly.add("Purandar");
        } catch (UnsupportedOperationException e) {
            System.out.println("Read-only view blocks add()");
        }

        forts.add("Lohagad");                                   // change through the ORIGINAL list
        System.out.println("The view sees it : " + readOnly);

        List<String> safe = Collections.synchronizedList(new ArrayList<>(forts));
        synchronized (safe) {                                   // required while iterating a synchronized list
            for (String name : safe) {
                System.out.println("Safe loop        : " + name);
            }
        }
    }
}
''' + OUT),
    method(
        'clone() and the copy constructor', 'Object clone();  new ArrayList<>(Collection)', 'a <strong>shallow</strong> copy of the list', 'O(n)',
        'Both create a <strong>new list with the same elements</strong>. Adding or removing in the copy does not affect the original. But the elements are <strong>shared</strong>: a shallow copy does not duplicate the objects inside.',
        'Prefer the copy constructor: it needs no cast and no <code>@SuppressWarnings</code>. If the elements are mutable objects and you need independent data, you must copy each element yourself (a deep copy).',
        r'''// ArrayList clone() and copy constructor: shallow copies
import java.util.ArrayList;
import java.util.List;

public class ArrayListCloneDemo {
    public static void main(String[] args) {
        ArrayList<StringBuilder> forts = new ArrayList<>();
        forts.add(new StringBuilder("Raigad"));
        forts.add(new StringBuilder("Torna"));

        @SuppressWarnings("unchecked")
        ArrayList<StringBuilder> viaClone = (ArrayList<StringBuilder>) forts.clone();
        List<StringBuilder> viaConstructor = new ArrayList<>(forts);

        forts.add(new StringBuilder("Purandar"));       // structure change: copies are NOT affected
        System.out.println("Original size   : " + forts.size());
        System.out.println("Clone size      : " + viaClone.size());
        System.out.println("Constructor size: " + viaConstructor.size());

        forts.get(0).append(" (fort)");                  // but the element object is SHARED
        System.out.println("Clone element   : " + viaClone.get(0));
        System.out.println("Same object?    : " + (forts.get(0) == viaClone.get(0)));
    }
}
''' + OUT),
    method(
        'equals, hashCode and toString', 'boolean equals(Object o);  int hashCode();  String toString()', 'content-based comparison, hash and text', 'O(n)',
        'Two lists are <strong>equal</strong> when they have the same elements <strong>in the same order</strong>. <code>toString()</code> prints <code>[a, b, c]</code>. <code>hashCode()</code> is computed from the elements, so equal lists have equal hash codes.',
        'Because the hash depends on the contents, <strong>never use a mutable list as a key</strong> in a <code>HashMap</code> or as an element of a <code>HashSet</code> if you will change it afterwards. A list is equal to any other <code>List</code> implementation with the same contents (an <code>ArrayList</code> equals a <code>LinkedList</code> holding the same elements).',
        r'''// ArrayList equals / hashCode / toString
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class ArrayListEqualsDemo {
    public static void main(String[] args) {
        List<String> a = new ArrayList<>(List.of("Raigad", "Torna"));
        List<String> b = new ArrayList<>(List.of("Raigad", "Torna"));
        List<String> c = new ArrayList<>(List.of("Torna", "Raigad"));      // same elements, other order
        List<String> d = new LinkedList<>(List.of("Raigad", "Torna"));    // other List class

        System.out.println("a.equals(b)      : " + a.equals(b));
        System.out.println("a == b           : " + (a == b));              // different objects
        System.out.println("a.equals(c)      : " + a.equals(c));           // order matters
        System.out.println("a.equals(d)      : " + a.equals(d));           // class does not matter
        System.out.println("hash equal       : " + (a.hashCode() == b.hashCode()));
        System.out.println("toString         : " + a);
    }
}
''' + OUT),

    section('Walking through the list (iteration)', 'There are five common ways to visit every element. Each has a best use.'),
    method(
        'for loop and for-each loop', 'for (int i = 0; i < list.size(); i++) ...;  for (E e : list) ...', 'one element per step', 'O(n)',
        'Use the <strong>for-each</strong> loop when you just need to read every element: it is short and cannot go out of range. Use the <strong>index loop</strong> when you need the position, or need to change elements with <code>set</code>.',
        'The for-each loop is compiled to an <code>Iterator</code>, so it is fail-fast. The index loop has no such check, which is why removing inside it silently skips the element after each removed one.',
        r'''// for loop and for-each loop over an ArrayList
import java.util.ArrayList;
import java.util.List;

public class ArrayListLoopDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna"));

        System.out.println("-- for-each (read only) --");
        for (String fort : forts) {
            System.out.println(fort);
        }

        System.out.println("-- index loop (position needed) --");
        for (int i = 0; i < forts.size(); i++) {
            System.out.println(i + " -> " + forts.get(i));
        }

        System.out.println("-- index loop that changes elements --");
        for (int i = 0; i < forts.size(); i++) {
            forts.set(i, forts.get(i).toUpperCase());
        }
        System.out.println(forts);
    }
}
''' + OUT),
    method(
        'iterator()', 'Iterator<E> iterator()', 'an iterator (hasNext, next, remove)', 'O(1) per step',
        'An <strong>Iterator</strong> is a bookmark that walks the list one element at a time. <code>hasNext()</code> asks "is there another element?", <code>next()</code> returns it, and <code>remove()</code> deletes the element that <code>next()</code> just returned. It is the classic way to <strong>remove while looping</strong>.',
        'The ArrayList iterator is fail-fast: it remembers <code>modCount</code> and throws <code>ConcurrentModificationException</code> if the list is changed by anything other than the iterator\'s own <code>remove()</code>. <code>remove()</code> may be called only once per <code>next()</code>.',
        r'''// ArrayList iterator(): walk and remove safely
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ArrayListIteratorDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Nagpur", "Indore", "Jaipur"));

        Iterator<String> it = cities.iterator();
        while (it.hasNext()) {                    // is there another element?
            String city = it.next();              // move forward and read it
            if (city.startsWith("N")) {
                it.remove();                      // the only SAFE way to remove during iteration
            }
        }
        System.out.println(cities);
    }
}
''' + OUT),
    method(
        'listIterator() and listIterator(int index)', 'ListIterator<E> listIterator();  ListIterator<E> listIterator(int index)', 'an iterator that moves both ways', 'O(1) per step',
        'A <strong>ListIterator</strong> is an Iterator that can also go <strong>backwards</strong> (<code>hasPrevious</code>, <code>previous</code>), tell the index (<code>nextIndex</code>, <code>previousIndex</code>), <strong>replace</strong> the last returned element (<code>set</code>) and <strong>insert</strong> a new element at the cursor (<code>add</code>).',
        'It is the only tool that lets you insert or replace safely while walking a list. <code>listIterator(size())</code> starts at the end for a reverse walk.',
        r'''// ArrayList listIterator(): forward, backward, set and add
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

public class ArrayListListIteratorDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna"));

        ListIterator<String> it = forts.listIterator();
        while (it.hasNext()) {
            String name = it.next();
            if (name.equals("Sinhagad")) {
                it.set("Rajgad");              // replace the element just returned
                it.add("Purandar");            // insert right after it
            }
        }
        System.out.println("After set/add : " + forts);

        System.out.print("Backwards     : ");
        ListIterator<String> back = forts.listIterator(forts.size());   // start at the end
        while (back.hasPrevious()) {
            System.out.print(back.previous() + " ");
        }
        System.out.println();
    }
}
''' + OUT),
    method(
        'forEach(Consumer)', 'void forEach(Consumer<? super E> action)', 'nothing (void)', 'O(n)',
        'Runs one action for every element, written as a lambda or a method reference: <code>forts.forEach(System.out::println)</code>. It is short and reads well for simple tasks.',
        'ArrayList\'s version loops over the internal array directly and checks <code>modCount</code> once at the end, so it is slightly faster than an iterator. You cannot use <code>break</code> or <code>continue</code> inside it; use a normal loop when you need them.',
        r'''// ArrayList forEach(Consumer): lambda and method reference
import java.util.ArrayList;
import java.util.List;

public class ArrayListForEachDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Nagpur"));

        cities.forEach(city -> System.out.println("City: " + city));    // lambda
        cities.forEach(System.out::println);                              // method reference

        List<Integer> total = new ArrayList<>(List.of(0));                // a one-element holder (lambdas need effectively final)
        List.of(4, 2, 6).forEach(h -> total.set(0, total.get(0) + h));
        System.out.println("Total hours: " + total.get(0));
    }
}
''' + OUT),
    method(
        'Fail-fast: ConcurrentModificationException', 'modCount check inside Iterator / for-each', 'throws <code>ConcurrentModificationException</code>', '-',
        'If you <strong>add or remove</strong> elements while a for-each loop is running, Java stops with <code>ConcurrentModificationException</code>. It protects you from a half-updated loop. The fix is to remove with an <code>Iterator</code>, with <code>removeIf</code>, or to loop over a <strong>copy</strong>.',
        'Fail-fast is best-effort (a debugging aid), not a guarantee for multi-threaded use. Quirk: removing the <em>second last</em> element in a for-each loop ends the loop without an error because <code>hasNext()</code> becomes false first. Do not rely on that.',
        r'''// ConcurrentModificationException and the three safe fixes
import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.Iterator;
import java.util.List;

public class ArrayListFailFastDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));

        try {
            for (String fort : forts) {
                if (fort.equals("Sinhagad")) {
                    forts.remove(fort);                // BAD: structure changed during iteration
                }
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("BAD way failed: ConcurrentModificationException");
        }

        List<String> a = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));
        a.removeIf(name -> name.equals("Sinhagad"));               // fix 1: removeIf
        System.out.println("removeIf        : " + a);

        List<String> b = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));
        Iterator<String> it = b.iterator();                          // fix 2: Iterator.remove
        while (it.hasNext()) {
            if (it.next().equals("Sinhagad")) {
                it.remove();
            }
        }
        System.out.println("Iterator.remove : " + b);

        List<String> c = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));
        for (String name : new ArrayList<>(c)) {                     // fix 3: loop over a copy, change the original
            if (name.equals("Sinhagad")) {
                c.remove(name);
            }
        }
        System.out.println("loop over copy  : " + c);
    }
}
''' + OUT),

    section('Capacity: ensureCapacity and trimToSize', 'ArrayList has two sizes: <strong>size</strong> (how many elements it holds) and <strong>capacity</strong> (how many fit before it must grow). These two methods manage the second one.'),
    method(
        'ensureCapacity(int) and trimToSize()', 'void ensureCapacity(int minCapacity);  void trimToSize()', 'nothing (void)', 'O(n)',
        '<code>ensureCapacity(n)</code> makes room for at least <code>n</code> elements <strong>in one go</strong>, which is faster if you are about to add many elements. <code>trimToSize()</code> cuts the unused room so the list uses the least memory. Neither changes <code>size()</code> or the elements.',
        'They exist only on <code>ArrayList</code> (not on the <code>List</code> interface). Use <code>ensureCapacity</code> before a big bulk load, and <code>trimToSize</code> after a list has become final and long-lived. The capacity cannot be read through the public API; the program below shows the growth rule with arithmetic.',
        r'''// ArrayList ensureCapacity / trimToSize and how capacity grows
import java.util.ArrayList;

public class ArrayListCapacityDemo {
    public static void main(String[] args) {
        ArrayList<Integer> trekHours = new ArrayList<>();
        trekHours.ensureCapacity(1000);          // room for 1000 elements, but size is still 0
        System.out.println("size after ensureCapacity: " + trekHours.size());

        for (int i = 1; i <= 5; i++) {
            trekHours.add(i);
        }
        trekHours.trimToSize();                   // drop the unused room (capacity becomes 5)
        System.out.println("size after trimToSize   : " + trekHours.size());

        // The growth rule inside ArrayList: newCapacity = oldCapacity + oldCapacity / 2 (about 1.5 times)
        int capacity = 10;                        // the first add allocates 10
        StringBuilder steps = new StringBuilder("capacity growth: " + capacity);
        for (int i = 0; i < 6; i++) {
            capacity = capacity + (capacity >> 1);
            steps.append(" -> ").append(capacity);
        }
        System.out.println(steps);
    }
}
''' + OUT),
]

# ------------------------------------------------------------------ expert
EXPERT = [
    section(
        'How ArrayList works inside',
        'Knowing the internals explains every number in the method tables.',
        [
            'The data lives in <code>transient Object[] elementData</code>. <code>size</code> is a separate <code>int</code>; slots from <code>size</code> to the end of the array are unused (and set to <code>null</code>).',
            '<code>new ArrayList&lt;&gt;()</code> shares a tiny static empty array; the <strong>first</strong> <code>add</code> allocates an array of <strong>10</strong>. With <code>new ArrayList&lt;&gt;(n)</code> it allocates exactly <code>n</code> slots (and <code>n = 0</code> gives the shared empty array).',
            'When the array is full, <code>grow</code> computes <code>newCapacity = oldCapacity + (oldCapacity &gt;&gt; 1)</code> (about <strong>1.5&times;</strong>) and copies with <code>Arrays.copyOf</code>. The growth steps are 10, 15, 22, 33, 49, 73, ...',
            'Inserting or removing in the middle calls <code>System.arraycopy</code> to shift the tail: a fast native block copy, but still O(n).',
            '<code>modCount</code> (inherited from <code>AbstractList</code>) is increased on every structural change; iterators compare it to the value they saw when they started (fail-fast).',
            'The maximum size is about <code>Integer.MAX_VALUE - 8</code>; beyond that you get <code>OutOfMemoryError</code>.',
        ],
    ),
    (
        '<h3>Time complexity summary</h3>\n'
        + table(['Operation', 'Cost', 'Why'], [
            ['get(i), set(i, e), size(), isEmpty()', 'O(1)', 'Direct array access'],
            ['add(e) / addLast(e)', 'O(1) amortised', 'Writes the next slot; sometimes one O(n) growth'],
            ['add(i, e), remove(i), addFirst, removeFirst', 'O(n)', 'Shifts every element after i'],
            ['removeLast()', 'O(1)', 'No shifting needed'],
            ['contains, indexOf, remove(Object)', 'O(n)', 'Linear search with equals()'],
            ['addAll(c)', 'O(m)', 'One bulk copy'],
            ['sort', 'O(n log n)', 'TimSort (stable)'],
            ['iterator step, listIterator step', 'O(1)', 'Index into the array'],
            ['subList(a, b)', 'O(1)', 'Creates a view, no copy'],
            ['clear()', 'O(n)', 'Nulls every slot so the objects can be collected'],
        ]),
        [],
    ),
    section('Traps that surprise even experienced developers', 'Each trap below has a runnable proof.'),
    (
        '<h3>Trap 1: contains, indexOf and remove(Object) depend on equals()</h3>\n'
        + ul([
            'A plain class without <code>equals</code> compares by <strong>identity</strong>, so two objects with the same data are "different".',
            'A <code>record</code> gets a content-based <code>equals</code> for free.',
            'If you override <code>equals</code>, also override <code>hashCode</code> (needed the moment the object goes into a <code>HashSet</code> or <code>HashMap</code>).',
        ]),
        [r'''// Why contains() fails for your own class unless equals() is defined
import java.util.ArrayList;
import java.util.List;

public class ArrayListEqualsTrapDemo {
    static class PlainFort {                       // no equals(): identity comparison
        final String name;
        PlainFort(String name) { this.name = name; }
    }

    record RecordFort(String name) { }             // equals() and hashCode() are generated from the fields

    public static void main(String[] args) {
        List<PlainFort> plain = new ArrayList<>();
        plain.add(new PlainFort("Raigad"));
        System.out.println("Plain class contains new PlainFort(Raigad)? " + plain.contains(new PlainFort("Raigad")));

        List<RecordFort> records = new ArrayList<>();
        records.add(new RecordFort("Raigad"));
        System.out.println("Record contains new RecordFort(Raigad)?     " + records.contains(new RecordFort("Raigad")));
        System.out.println("indexOf works the same way: " + records.indexOf(new RecordFort("Raigad")));
    }
}
''' + OUT]),
    (
        '<h3>Trap 2: Integer objects and ==</h3>\n'
        + ul([
            'Values between <strong>-128 and 127</strong> are cached, so <code>==</code> happens to work for small numbers and fails for bigger ones.',
            'Always compare wrapper objects with <code>equals()</code> (or unbox first).',
        ]),
        [r'''// Comparing elements of a List<Integer>: == versus equals()
import java.util.ArrayList;
import java.util.List;

public class ArrayListIntegerTrapDemo {
    public static void main(String[] args) {
        List<Integer> heights = new ArrayList<>(List.of(100, 100, 1000, 1000));

        System.out.println("100  == 100  : " + (heights.get(0) == heights.get(1)));          // cached objects
        System.out.println("1000 == 1000 : " + (heights.get(2) == heights.get(3)));          // different objects!
        System.out.println("1000 equals  : " + heights.get(2).equals(heights.get(3)));       // the correct comparison
    }
}
''' + OUT]),
    (
        '<h3>Trap 3: subList is a view</h3>\n'
        + ul([
            'Changing the <strong>parent\'s size</strong> after creating a view, then using the view, throws <code>ConcurrentModificationException</code>.',
            'Copy the view into a new list when you need to keep it: <code>new ArrayList&lt;&gt;(list.subList(a, b))</code>.',
        ]),
        [r'''// subList view becomes invalid when the parent list changes size
import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.List;

public class ArrayListSubListTrapDemo {
    public static void main(String[] args) {
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));
        List<String> view = forts.subList(0, 2);

        forts.add("Lohagad");                       // structural change to the PARENT
        try {
            System.out.println(view.size());        // the view notices and refuses
        } catch (ConcurrentModificationException e) {
            System.out.println("Using the view after the parent changed -> ConcurrentModificationException");
        }

        List<String> safeCopy = new ArrayList<>(forts.subList(0, 2));   // a real copy never breaks
        forts.add("Panhala");
        System.out.println("Copy still fine: " + safeCopy);
    }
}
''' + OUT]),
    section('Thread safety', 'ArrayList is <strong>not</strong> thread-safe. Two threads adding at the same time can lose elements, throw exceptions or corrupt the list. Pick one of these:'),
    (
        '<h3>Choosing a thread-safe list</h3>\n'
        + table(['Choice', 'How it works', 'Use when'], [
            ['<code>Collections.synchronizedList(list)</code>', 'One lock around every method', 'Light sharing; you must still lock manually while iterating'],
            ['<code>CopyOnWriteArrayList</code>', 'Every write copies the whole array; readers never block and never see a change in the middle of a loop', 'Many reads, very few writes (listeners, configuration)'],
            ['<code>Vector</code>', 'Old class, synchronized methods', 'Legacy code only; prefer the two above'],
            ['Confine to one thread / immutable <code>List.copyOf</code>', 'No sharing, no problem', 'Best of all when possible'],
        ]),
        [r'''// CopyOnWriteArrayList: loops see a snapshot, so no ConcurrentModificationException
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class ArrayListThreadSafeDemo {
    public static void main(String[] args) {
        List<String> forts = new CopyOnWriteArrayList<>(List.of("Raigad", "Sinhagad", "Torna"));

        for (String fort : forts) {                 // iterates over a SNAPSHOT of the array
            if (fort.equals("Sinhagad")) {
                forts.add("Purandar");              // allowed: writes go to a fresh copy
            }
        }
        System.out.println("CopyOnWrite list : " + forts);

        List<String> normal = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna"));
        try {
            for (String fort : normal) {
                if (fort.equals("Sinhagad")) {
                    normal.add("Purandar");         // same code on an ArrayList
                }
            }
        } catch (RuntimeException e) {
            System.out.println("Plain ArrayList  : " + e.getClass().getSimpleName());
        }
    }
}
''' + OUT],
    ),
    (
        '<h3>ArrayList compared with other lists</h3>\n'
        + table(['', 'ArrayList', 'LinkedList', 'Vector', 'CopyOnWriteArrayList'], [
            ['Inside', 'Resizable array', 'Doubly linked nodes', 'Resizable array', 'Array copied on each write'],
            ['get(i)', 'O(1)', 'O(n)', 'O(1)', 'O(1)'],
            ['add at end', 'O(1) amortised', 'O(1)', 'O(1) amortised', 'O(n)'],
            ['insert / remove in the middle', 'O(n) shift (fast native copy)', 'O(1) once positioned, O(n) to find the position', 'O(n)', 'O(n)'],
            ['Memory', 'Compact', 'About 24 extra bytes per element', 'Compact', 'Compact (+ copies)'],
            ['Thread-safe', 'No', 'No', 'Yes (every method locked)', 'Yes'],
            ['Typical use', '<strong>Default choice</strong>', 'Queue / deque use, rarely a list', 'Legacy', 'Read-mostly shared data'],
        ])
        + '\n<p>In practice <strong>ArrayList wins in almost every benchmark</strong>, even for middle inserts, because arrays are cache-friendly and <code>System.arraycopy</code> is very fast. Choose another list only for a clear reason.</p>',
        [],
    ),
    section(
        'Best practices',
        'Habits that make ArrayList code correct, fast and easy to read.',
        [
            'Declare with the interface: <code>List&lt;String&gt; forts = new ArrayList&lt;&gt;();</code>.',
            'Pass an initial capacity (<code>new ArrayList&lt;&gt;(expectedSize)</code>) when you know the size, to skip repeated growth.',
            'Use <code>removeIf</code>, <code>replaceAll</code> and <code>forEach</code> instead of hand-written loops for simple jobs.',
            'Never remove inside a for-each loop. Use <code>removeIf</code> or an <code>Iterator</code>.',
            'Return a copy or an unmodifiable view from your getters (<code>List.copyOf(list)</code>) so callers cannot change your internal list.',
            'Do not store <code>null</code> unless you have to; many APIs (<code>List.of</code>, streams) reject it.',
            'For millions of numbers prefer a primitive array or a primitive collection library: <code>ArrayList&lt;Integer&gt;</code> boxes every value (about 16 bytes per Integer plus the reference).',
            'Write <code>equals</code> and <code>hashCode</code> for your element classes (or use <code>record</code>) so <code>contains</code>, <code>indexOf</code> and <code>remove(Object)</code> behave.',
            'Prefer <code>list.sort(comparator)</code> to hand-written sorting, and keep comparators consistent with equals when you can.',
        ],
    ),
    (
        '<h3>Real example: a pilgrim route planner</h3>\n<p>One program that uses many of the methods together: build a route, insert and remove stops, sort, search and copy.</p>',
        [r'''// Route planner: add, insert, remove, sort, search and copy on one ArrayList
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class RoutePlannerDemo {
    public static void main(String[] args) {
        List<String> route = new ArrayList<>();                   // empty route
        route.add("Pune");                                         // start
        route.add("Nashik");
        route.add("Indore");
        route.add(1, "Mumbai");                                    // insert a stop after the start
        route.addAll(List.of("Jaipur", "Delhi"));                  // append two stops together
        System.out.println("Route        : " + route);

        route.remove("Indore");                                    // cancel one stop by name
        System.out.println("After cancel : " + route);

        List<String> alphabetical = new ArrayList<>(route);        // copy before sorting
        Collections.sort(alphabetical);
        System.out.println("Alphabetical : " + alphabetical);
        System.out.println("Original kept: " + route);

        String target = "Jaipur";
        int position = route.indexOf(target);
        System.out.println(target + " is stop number " + (position + 1) + " of " + route.size());

        route.removeIf(stop -> stop.length() > 5);                // drop the long names
        System.out.println("Short names  : " + route);
    }
}
''' + OUT],
    ),
]

QA = [
    ('What is an ArrayList and how is it different from an array?',
     'An ArrayList is a resizable-array implementation of the List interface. An array has a fixed length and can hold primitives; an ArrayList grows and shrinks, holds only objects (wrapper types for numbers) and provides methods such as add, remove, contains and sort. Both give O(1) access by index.'),
    ('How does ArrayList grow? What is the default capacity?',
     'It keeps an Object[]. new ArrayList<>() starts with a shared empty array and allocates 10 slots on the first add. When full it grows to oldCapacity + (oldCapacity >> 1), about 1.5 times, using Arrays.copyOf. That is why add is amortised O(1).'),
    ('Time complexity of get, add, add(index), remove(index), contains?',
     'get O(1); add at end O(1) amortised; add(index) and remove(index) O(n) because later elements are shifted; contains and indexOf O(n) because they scan with equals().'),
    ('ArrayList vs LinkedList: which should you choose?',
     'ArrayList by default: O(1) get, compact memory and very fast bulk copies. LinkedList only as a queue/deque (add/remove at both ends); its O(n) get and per-node overhead make it slower as a general list.'),
    ('ArrayList vs Vector?',
     'Both use a growable array. Vector synchronizes every method and doubles its capacity by default; ArrayList is unsynchronized, grows by 1.5x and is faster. For thread safety use Collections.synchronizedList or CopyOnWriteArrayList instead of Vector.'),
    ('Is ArrayList thread-safe? How do you make it safe?',
     'No. Use Collections.synchronizedList (and synchronize manually while iterating), CopyOnWriteArrayList for read-mostly data, or avoid sharing the list between threads.'),
    ('What is fail-fast behaviour?',
     'ArrayList iterators remember modCount. If the list is structurally modified by anything other than the iterator itself, the next iterator call throws ConcurrentModificationException. It is a best-effort bug detector, not a thread-safety guarantee.'),
    ('How do you remove elements safely while iterating?',
     'Use Iterator.remove(), ListIterator, removeIf(predicate), or iterate over a copy. Do not call list.remove inside a for-each loop.'),
    ('What does list.remove(2) do on a List<Integer>?',
     'It calls remove(int index) and removes the element at index 2. To remove the value 2 write list.remove(Integer.valueOf(2)).'),
    ('What is the difference between size and capacity?',
     'size is the number of elements stored; capacity is the length of the internal array. Capacity is always at least size. ensureCapacity and trimToSize manage the capacity.'),
    ('Does ArrayList allow duplicates and null?',
     'Yes to both. It keeps insertion order and allows any number of duplicates and nulls.'),
    ('Why does Arrays.asList(...).add(...) throw an exception?',
     'Arrays.asList returns a fixed-size list backed by the array: set is allowed but add and remove throw UnsupportedOperationException. Wrap it in new ArrayList<>(...) for a growable list.'),
    ('What is the difference between clone() and the copy constructor? Is it a deep copy?',
     'Both create a new list with the same element references (a shallow copy): changing the list structure does not affect the original, but the element objects are shared. For a deep copy you must copy each element yourself.'),
    ('How does contains() find an element?',
     'It scans from index 0 and compares with equals(). Elements of your own classes need a proper equals (and hashCode) or the search will not find equal-looking objects. For frequent lookups use a HashSet.'),
    ('Why is subList called a view and what can go wrong?',
     'It returns a window onto the same backing array, so writes through the view affect the original and vice versa. If you add or remove in the original after creating the view, using the view throws ConcurrentModificationException. Copy it with new ArrayList<>(list.subList(a, b)) if you need a snapshot.'),
    ('How do you sort an ArrayList, and is the sort stable?',
     'list.sort(comparator) or Collections.sort(list). It uses TimSort, which is stable and O(n log n), and fast on partly ordered data.'),
    ('What new List methods does Java 21 add?',
     'getFirst, getLast, addFirst, addLast, removeFirst, removeLast and reversed, from the new SequencedCollection interface that List now extends.'),
]

TOPIC = dict(id='arraylist', name='ArrayList', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
