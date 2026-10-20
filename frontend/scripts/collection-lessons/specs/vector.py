"""Vector lesson: the legacy synchronized growable array. Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a Vector?',
        'A <strong>Vector</strong> is a resizable array, just like <code>ArrayList</code>, with one big difference: <strong>every method is synchronized</strong>, so only one thread at a time can use it. '
        'It is one of the <strong>oldest</strong> classes of Java (from version 1.0, before the Collection Framework existed) and was later retrofitted to implement <code>List</code>.',
        [
            'Package <code>java.util</code>. Implements <code>List</code>, <code>RandomAccess</code>, <code>Cloneable</code>, <code>Serializable</code>.',
            'Keeps <strong>insertion order</strong>, allows <strong>duplicates</strong> and <strong>null</strong>, and reads by index in O(1).',
            '<strong>Thread-safe</strong> because each method locks the vector. This makes it slower than ArrayList when only one thread is used.',
            'Default capacity is <strong>10</strong>. When full it <strong>doubles</strong> its capacity (or grows by a fixed <code>capacityIncrement</code> if you set one).',
            'Has many <strong>old-style methods</strong> (<code>addElement</code>, <code>elementAt</code>, <code>removeElement</code>, <code>elements()</code>) next to the modern List methods.',
            '<strong>Modern advice:</strong> use <code>ArrayList</code> for single-threaded code, and <code>CopyOnWriteArrayList</code> or <code>Collections.synchronizedList</code> when you need thread safety. Learn Vector mainly to read old code and for interviews.',
        ],
    ),
    (
        '<h3>Where Vector sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Iterable', 'I', True, None, G), ('Collection', 'I', True, 'extends', G), ('List', 'I', True, 'extends', G),
            ('AbstractList', 'c', False, 'implements', B), ('Vector', 'c', False, 'extends', G), ('Stack', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class. <code>Stack</code> is a subclass of Vector, so it inherits all the Vector methods and the synchronization.</p>',
        [],
    ),
    (
        '<h3>Creating a Vector: four constructors</h3>\n'
        + ul([
            '<code>new Vector&lt;&gt;()</code>: empty, capacity 10, doubles when full.',
            '<code>new Vector&lt;&gt;(int initialCapacity)</code>: empty with the given capacity, doubles when full.',
            '<code>new Vector&lt;&gt;(int initialCapacity, int capacityIncrement)</code>: grows by <strong>that fixed amount</strong> instead of doubling.',
            '<code>new Vector&lt;&gt;(Collection c)</code>: a copy of another collection.',
        ]),
        [r'''// Vector constructors and capacity()
import java.util.List;
import java.util.Vector;

public class VectorCreateDemo {
    public static void main(String[] args) {
        Vector<String> a = new Vector<>();                         // capacity 10, doubles
        Vector<String> b = new Vector<>(4);                        // capacity 4, doubles
        Vector<String> c = new Vector<>(4, 3);                     // capacity 4, grows by 3
        Vector<String> d = new Vector<>(List.of("Raigad", "Torna"));   // copy of a collection

        System.out.println("capacity a: " + a.capacity() + ", size " + a.size());
        System.out.println("capacity b: " + b.capacity());
        System.out.println("capacity d: " + d.capacity() + " " + d);

        for (int i = 1; i <= 5; i++) {                            // 5 adds into capacity 4
            b.add("fort" + i);
            c.add("fort" + i);
        }
        System.out.println("b grew by doubling: capacity " + b.capacity());
        System.out.println("c grew by 3       : capacity " + c.capacity());
    }
}
''' + OUT],
    ),
    (
        '<h3>All Vector methods at a glance</h3>\n<p><em>n</em> is the number of elements. The first group is the classic Vector API; the second is the List API that Vector shares with ArrayList.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>addElement(e)</strong>', 'Adds at the end (old name of add)', 'O(1) amortised'],
            ['<strong>insertElementAt(e, i)</strong>', 'Inserts at index i', 'O(n)'],
            ['<strong>elementAt(i)</strong> / <strong>firstElement()</strong> / <strong>lastElement()</strong>', 'Reads by index / first / last', 'O(1)'],
            ['<strong>setElementAt(e, i)</strong>', 'Replaces the element at i', 'O(1)'],
            ['<strong>removeElement(o)</strong> / <strong>removeElementAt(i)</strong> / <strong>removeAllElements()</strong>', 'Removes by value / index / everything', 'O(n)'],
            ['<strong>capacity()</strong> / <strong>ensureCapacity(n)</strong> / <strong>trimToSize()</strong> / <strong>setSize(n)</strong>', 'Capacity management (setSize pads with null or truncates)', 'O(1) / O(n)'],
            ['<strong>elements()</strong>', 'An old-style Enumeration (not fail-fast)', 'O(1)'],
            ['<strong>copyInto(Object[])</strong>', 'Copies the elements into an array', 'O(n)'],
            ['<strong>indexOf(o, from)</strong> / <strong>lastIndexOf(o, from)</strong>', 'Search starting at a given index', 'O(n)'],
            ['<strong>add, get, set, remove, contains, size, clear, addAll, removeAll, retainAll ...</strong>', 'The ordinary List methods, all synchronized', 'as ArrayList'],
            ['<strong>sort, forEach, removeIf, replaceAll, stream, subList, iterator, listIterator</strong>', 'Inherited List helpers', 'as ArrayList'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Adding and reading with the classic Vector methods', 'These names come from before Java 1.2. They still work and you will meet them in older code.'),
    method(
        'addElement, insertElementAt and add', 'void addElement(E obj);  void insertElementAt(E obj, int index);  boolean add(E e)', 'nothing / nothing / <code>true</code>', 'O(1) amortised / O(n)',
        '<code>addElement(x)</code> and <code>add(x)</code> both append at the end. <code>insertElementAt(x, i)</code> puts x at index i and shifts the rest right. Note the <strong>argument order</strong>: element first, then index (the opposite of <code>add(int, E)</code>).',
        '<code>addElement</code> is the original method; <code>add</code> was added for the List interface and simply calls the same code. Each call takes the vector\'s lock, so a loop of a million adds pays for a million lock operations (the JVM can often optimise this away, but the lock is still part of the contract).',
        r'''// Vector addElement / insertElementAt / add
import java.util.Vector;

public class VectorAddDemo {
    public static void main(String[] args) {
        Vector<String> forts = new Vector<>();

        forts.addElement("Raigad");              // classic name
        forts.add("Sinhagad");                   // List name, same effect
        forts.insertElementAt("Torna", 1);       // (element, index): note the order
        forts.add(0, "Purandar");                // List style insert: (index, element)

        System.out.println(forts);
    }
}
''' + OUT),
    method(
        'elementAt, firstElement, lastElement and get', 'E elementAt(int index);  E firstElement();  E lastElement();  E get(int index)', 'the element', 'O(1)',
        'Read an element by position (<code>elementAt</code> = <code>get</code>) or read the first or last. <code>firstElement()</code> and <code>lastElement()</code> throw <code>NoSuchElementException</code> on an empty vector; a bad index throws <code>ArrayIndexOutOfBoundsException</code>.',
        'Note the exception type: Vector throws <code>ArrayIndexOutOfBoundsException</code> (a subclass of <code>IndexOutOfBoundsException</code>), while ArrayList throws a plain <code>IndexOutOfBoundsException</code>.',
        r'''// Vector elementAt / firstElement / lastElement / get
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Vector;

public class VectorReadDemo {
    public static void main(String[] args) {
        Vector<String> cities = new Vector<>(List.of("Pune", "Nashik", "Nagpur"));

        System.out.println("elementAt(1)  : " + cities.elementAt(1));
        System.out.println("get(1)        : " + cities.get(1));
        System.out.println("firstElement  : " + cities.firstElement());
        System.out.println("lastElement   : " + cities.lastElement());

        try {
            cities.elementAt(5);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("elementAt(5)  : " + e.getMessage());
        }
        try {
            new Vector<String>().firstElement();
        } catch (NoSuchElementException e) {
            System.out.println("Empty vector  : NoSuchElementException");
        }
    }
}
''' + OUT),
    method(
        'setElementAt and set', 'void setElementAt(E obj, int index);  E set(int index, E element)', 'nothing / the old element', 'O(1)',
        'Replace the element at an index. <code>setElementAt(element, index)</code> returns nothing; <code>set(index, element)</code> returns the element it replaced.',
        'Again the classic method has the argument order <em>(element, index)</em>, while the List method has <em>(index, element)</em>. Mixing them up compiles when both are <code>int</code> and <code>Integer</code>-compatible types are used: be careful with <code>Vector&lt;Integer&gt;</code>.',
        r'''// Vector setElementAt / set
import java.util.List;
import java.util.Vector;

public class VectorSetDemo {
    public static void main(String[] args) {
        Vector<String> forts = new Vector<>(List.of("Raigad", "Sinhagad", "Torna"));

        forts.setElementAt("Rajgad", 0);          // (element, index)
        String old = forts.set(2, "Purandar");     // (index, element) returns the old value

        System.out.println("Replaced by set: " + old);
        System.out.println("Vector now     : " + forts);
    }
}
''' + OUT),

    section('Removing elements', 'Remove by value, by index, or everything.'),
    method(
        'removeElement, removeElementAt and removeAllElements', 'boolean removeElement(Object obj);  void removeElementAt(int index);  void removeAllElements()', '<code>true</code> if found / nothing / nothing', 'O(n)',
        '<code>removeElement(x)</code> removes the <strong>first</strong> element equal to x and says whether it found one. <code>removeElementAt(i)</code> removes by index. <code>removeAllElements()</code> empties the vector (same as <code>clear()</code>).',
        '<code>removeElement</code> is the same as <code>remove(Object)</code>. Later elements shift left. An invalid index throws <code>ArrayIndexOutOfBoundsException</code>.',
        r'''// Vector removeElement / removeElementAt / removeAllElements
import java.util.List;
import java.util.Vector;

public class VectorRemoveDemo {
    public static void main(String[] args) {
        Vector<String> forts = new Vector<>(List.of("Raigad", "Sinhagad", "Torna", "Sinhagad", "Purandar"));

        boolean found = forts.removeElement("Sinhagad");     // first match only
        System.out.println("removeElement      : " + found + " -> " + forts);

        forts.removeElementAt(0);                              // by index
        System.out.println("removeElementAt(0) : " + forts);

        forts.removeAllElements();                             // everything
        System.out.println("removeAllElements  : " + forts + " size " + forts.size());
    }
}
''' + OUT),

    section('Capacity', 'A Vector has a <strong>size</strong> (elements stored) and a <strong>capacity</strong> (room available). Unlike ArrayList, Vector lets you <strong>read</strong> the capacity.'),
    method(
        'capacity, ensureCapacity, trimToSize and setSize', 'int capacity();  void ensureCapacity(int);  void trimToSize();  void setSize(int)', 'the capacity / nothing', 'O(1) / O(n)',
        '<code>capacity()</code> tells how many elements fit before growing. <code>ensureCapacity(n)</code> makes room for n. <code>trimToSize()</code> shrinks the room to the size. <code>setSize(n)</code> changes the <strong>size</strong> itself: extra slots are filled with <code>null</code>, or elements beyond n are dropped.',
        'The growth rule is <strong>double</strong> the capacity (when no increment was given), not 1.5x as in ArrayList. <code>setSize</code> is a rare tool; it can create a vector full of <code>null</code>s.',
        r'''// Vector capacity management
import java.util.Vector;

public class VectorCapacityDemo {
    public static void main(String[] args) {
        Vector<String> forts = new Vector<>();                 // capacity 10
        System.out.println("start            : size " + forts.size() + ", capacity " + forts.capacity());

        for (int i = 1; i <= 11; i++) {
            forts.add("fort" + i);                              // the 11th add makes it grow
        }
        System.out.println("after 11 adds    : size " + forts.size() + ", capacity " + forts.capacity());   // doubled to 20

        forts.trimToSize();
        System.out.println("after trimToSize : size " + forts.size() + ", capacity " + forts.capacity());

        forts.ensureCapacity(50);
        System.out.println("ensureCapacity(50): capacity " + forts.capacity());

        forts.setSize(13);                                      // pads with null
        System.out.println("setSize(13)      : " + forts.subList(10, 13));
        forts.setSize(3);                                       // truncates
        System.out.println("setSize(3)       : " + forts);
    }
}
''' + OUT),

    section('Searching', 'Besides the List search methods, Vector can start the search from a chosen index.'),
    method(
        'indexOf(o, from), lastIndexOf(o, from) and contains', 'int indexOf(Object o, int index);  int lastIndexOf(Object o, int index);  boolean contains(Object o)', 'the index (or <code>-1</code>) / <code>true</code> or <code>false</code>', 'O(n)',
        'Search for a value starting at a position you choose: <code>indexOf("Pune", 2)</code> looks for Pune from index 2 onwards; <code>lastIndexOf("Pune", 3)</code> looks backwards from index 3.',
        'These two-argument searches exist only on Vector (not on ArrayList). Matching uses <code>equals()</code>.',
        r'''// Vector indexOf(o, from) / lastIndexOf(o, from) / contains
import java.util.List;
import java.util.Vector;

public class VectorSearchDemo {
    public static void main(String[] args) {
        Vector<String> cities = new Vector<>(List.of("Pune", "Nashik", "Pune", "Nagpur", "Pune"));

        System.out.println("indexOf(Pune)       : " + cities.indexOf("Pune"));
        System.out.println("indexOf(Pune, 1)    : " + cities.indexOf("Pune", 1));       // search from index 1
        System.out.println("lastIndexOf(Pune)   : " + cities.lastIndexOf("Pune"));
        System.out.println("lastIndexOf(Pune, 3): " + cities.lastIndexOf("Pune", 3));   // search backwards from index 3
        System.out.println("contains(Nagpur)    : " + cities.contains("Nagpur"));
    }
}
''' + OUT),

    section('Walking through a Vector', 'Vector has two ways to walk that ArrayList does not mix: the old <strong>Enumeration</strong> and the modern <strong>Iterator</strong>.'),
    method(
        'elements() (Enumeration) versus iterator()', 'Enumeration<E> elements();  Iterator<E> iterator()', 'an Enumeration / an Iterator', 'O(1) per step',
        'An <strong>Enumeration</strong> is the old way: <code>hasMoreElements()</code> and <code>nextElement()</code>. An <strong>Iterator</strong> is the new way: <code>hasNext()</code>, <code>next()</code> and <code>remove()</code>. Prefer Iterator (or for-each).',
        'The Vector <code>Iterator</code> is <strong>fail-fast</strong> (throws <code>ConcurrentModificationException</code> if the vector changes), but the <code>Enumeration</code> is <strong>not</strong> fail-fast and cannot remove. Both individual calls are synchronized, but a whole loop is not atomic: to iterate safely across threads you must synchronize on the vector yourself.',
        r'''// Vector: Enumeration (old) and Iterator (new)
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

public class VectorWalkDemo {
    public static void main(String[] args) {
        Vector<String> forts = new Vector<>(List.of("Raigad", "Sinhagad", "Torna"));

        Enumeration<String> e = forts.elements();               // old style
        System.out.print("Enumeration: ");
        while (e.hasMoreElements()) {
            System.out.print(e.nextElement() + " ");
        }
        System.out.println();

        Iterator<String> it = forts.iterator();                 // new style, can remove
        while (it.hasNext()) {
            if (it.next().startsWith("S")) {
                it.remove();
            }
        }
        System.out.println("Iterator remove S*: " + forts);

        synchronized (forts) {                                   // lock for a whole loop across threads
            for (String fort : forts) {
                System.out.println("Locked loop: " + fort);
            }
        }
    }
}
''' + OUT),
    method(
        'copyInto, toArray and clone', 'void copyInto(Object[] anArray);  Object[] toArray();  Object clone()', 'nothing / an array / a shallow copy', 'O(n)',
        '<code>copyInto(array)</code> copies the elements into an array you provide (it must be big enough). <code>toArray()</code> creates a new array. <code>clone()</code> makes a shallow copy of the vector.',
        '<code>copyInto</code> is the classic method; <code>toArray(new String[0])</code> is the modern equivalent that allocates the right array for you.',
        r'''// Vector copyInto / toArray / clone
import java.util.Arrays;
import java.util.List;
import java.util.Vector;

public class VectorCopyDemo {
    public static void main(String[] args) {
        Vector<String> forts = new Vector<>(List.of("Raigad", "Sinhagad", "Torna"));

        String[] target = new String[3];
        forts.copyInto(target);                                  // fills the array you give
        System.out.println("copyInto : " + Arrays.toString(target));

        String[] fresh = forts.toArray(new String[0]);           // modern, allocates the array
        System.out.println("toArray  : " + Arrays.toString(fresh));

        @SuppressWarnings("unchecked")
        Vector<String> copy = (Vector<String>) forts.clone();    // shallow copy
        copy.add("Purandar");
        System.out.println("original : " + forts);
        System.out.println("clone    : " + copy);
    }
}
''' + OUT),
    method(
        'The inherited List methods', 'add, get, remove, contains, addAll, removeAll, retainAll, removeIf, replaceAll, sort, forEach, stream, subList, listIterator', 'as ArrayList', 'as ArrayList',
        'Everything you learned for ArrayList also works on Vector: the same names, the same results. The only difference is that each call is synchronized.',
        'Because <code>Vector</code> implements <code>List</code>, you can swap <code>new Vector&lt;&gt;()</code> for <code>new ArrayList&lt;&gt;()</code> in most code by changing one word, provided you only used List methods (declare the variable as <code>List</code> to make that easy).',
        r'''// The ordinary List methods work the same on Vector
import java.util.Comparator;
import java.util.List;
import java.util.Vector;

public class VectorListApiDemo {
    public static void main(String[] args) {
        List<String> forts = new Vector<>(List.of("Torna", "Raigad", "Sinhagad", "Lohagad"));

        forts.sort(Comparator.naturalOrder());
        System.out.println("sorted      : " + forts);

        forts.removeIf(f -> f.length() > 6);
        System.out.println("removeIf    : " + forts);

        forts.replaceAll(String::toUpperCase);
        System.out.println("replaceAll  : " + forts);

        System.out.println("subList     : " + forts.subList(0, 2));
        System.out.println("contains    : " + forts.contains("TORNA"));
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'How Vector works inside',
        'Vector and ArrayList are close relatives; the differences explain the behaviour.',
        [
            'Data lives in <code>protected Object[] elementData</code> with <code>elementCount</code> as the size. Both are protected, so subclasses (like <code>Stack</code>) can touch them.',
            'Growth: <code>newCapacity = oldCapacity + (capacityIncrement &gt; 0 ? capacityIncrement : oldCapacity)</code>: it <strong>doubles</strong> unless you set an increment. ArrayList grows by half instead, so Vector may waste more memory.',
            'Thread safety: methods are <code>synchronized</code> on the vector object. Single calls are atomic; <strong>compound actions are not</strong>: "if not contains then add" can still race between two threads.',
            'Iterators are <strong>fail-fast</strong> via <code>modCount</code>; the old <code>Enumeration</code> is not.',
            'Vector is never <code>null</code>-hostile: <code>null</code> elements are allowed.',
        ],
    ),
    (
        '<h3>Vector versus ArrayList</h3>\n'
        + table(['', 'Vector', 'ArrayList'], [
            ['Thread safety', 'Yes: every method is synchronized', 'No'],
            ['Speed (single thread)', 'Slower (lock on each call)', 'Faster'],
            ['Growth when full', 'Doubles (or fixed increment)', 'Grows by 50%'],
            ['Since', 'Java 1.0 (retrofitted to List in 1.2)', 'Java 1.2'],
            ['Old methods', 'addElement, elementAt, elements() ...', 'None'],
            ['Iterators', 'Iterator (fail-fast) and Enumeration (not fail-fast)', 'Iterator (fail-fast)'],
            ['Read capacity', '<code>capacity()</code>', 'Not possible'],
            ['Today', 'Legacy', '<strong>Default list</strong>'],
        ]),
        [],
    ),
    (
        '<h3>The compound-action trap</h3>\n'
        + ul([
            'Each Vector method is atomic, but a <strong>sequence</strong> of calls is not.',
            'Checking <code>contains</code> and then calling <code>add</code> leaves a gap in which another thread can add the same value.',
            'Lock around the whole sequence: <code>synchronized (vector) { if (!vector.contains(x)) vector.add(x); }</code>.',
            'The sample shows the safe version (single-threaded, so it only proves the code runs; the point is the locking pattern).',
        ]),
        [r'''// Safe "add if absent" on a shared Vector: lock around the whole check-then-act
import java.util.Vector;

public class VectorCheckThenActDemo {
    static void addIfAbsent(Vector<String> shared, String fort) {
        synchronized (shared) {                    // the same lock the Vector uses internally
            if (!shared.contains(fort)) {          // check ...
                shared.add(fort);                  // ... then act, with no other thread in between
            }
        }
    }

    public static void main(String[] args) {
        Vector<String> forts = new Vector<>();
        addIfAbsent(forts, "Raigad");
        addIfAbsent(forts, "Torna");
        addIfAbsent(forts, "Raigad");              // ignored: already there
        System.out.println(forts);
    }
}
''' + OUT],
    ),
    (
        '<h3>Which list should you choose today?</h3>\n'
        + table(['Situation', 'Use', 'Why'], [
            ['One thread (almost always)', '<strong>ArrayList</strong>', 'No locking cost'],
            ['Read often, write rarely, shared by threads', '<code>CopyOnWriteArrayList</code>', 'Readers never block; no ConcurrentModificationException'],
            ['Shared by threads with ordinary writes', '<code>Collections.synchronizedList(new ArrayList&lt;&gt;())</code>', 'Same locking as Vector, but a modern API'],
            ['Old code that already uses Vector', 'Keep it, or migrate carefully', 'Check for <code>elements()</code> and the Stack class'],
        ]),
        [],
    ),
    section(
        'Best practices',
        'Practical advice for the Vector you meet in real projects.',
        [
            'In new code avoid Vector and Stack; use ArrayList, ArrayDeque or a concurrent collection.',
            'Declare variables as <code>List</code> so you can switch the implementation later.',
            'Lock the vector (<code>synchronized (v) {...}</code>) around loops and check-then-act sequences that other threads can interleave.',
            'Prefer <code>iterator()</code> or for-each to <code>elements()</code>; the Enumeration cannot remove and is not fail-fast.',
            'Set the initial capacity if you know the size, to avoid repeated doubling.',
        ],
    ),
    (
        '<h3>Real example: a shared list of visited forts</h3>\n<p>Two worker threads add fort names to one Vector; the final size is always correct because each <code>add</code> is synchronized.</p>',
        [r'''// Two threads add to one Vector: no lost updates because every add is synchronized
import java.util.Vector;

public class VectorThreadsDemo {
    public static void main(String[] args) throws InterruptedException {
        Vector<String> visited = new Vector<>();

        Runnable lowerForts = () -> {
            for (int i = 1; i <= 500; i++) {
                visited.add("Raigad-" + i);
            }
        };
        Runnable upperForts = () -> {
            for (int i = 1; i <= 500; i++) {
                visited.add("Torna-" + i);
            }
        };

        Thread a = new Thread(lowerForts);
        Thread b = new Thread(upperForts);
        a.start();
        b.start();
        a.join();                                      // wait for both threads to finish
        b.join();

        System.out.println("Total visited: " + visited.size());   // always 1000 with a Vector
    }
}
''' + OUT],
    ),
]

QA = [
    ('What is a Vector? Why is it called a legacy class?',
     'Vector is a growable array from Java 1.0 whose methods are all synchronized. It was retrofitted to implement List in Java 1.2 but keeps old methods like addElement and elements(). It is called legacy because ArrayList and the concurrent collections replaced it.'),
    ('Difference between Vector and ArrayList?',
     'Vector is synchronized (thread-safe, slower), doubles its capacity when full and has the old Enumeration API; ArrayList is unsynchronized, grows by 50% and is the default choice for single-threaded code.'),
    ('What is the default capacity of a Vector and how does it grow?',
     'Capacity 10. When full it doubles, or grows by capacityIncrement if you passed one to the constructor.'),
    ('Is Vector fully thread-safe?',
     'Individual methods are atomic, but compound operations (check-then-act, iteration) are not, so you must lock the vector yourself around such sequences.'),
    ('Enumeration versus Iterator on a Vector?',
     'Enumeration (elements()) is the old read-only cursor and is not fail-fast; Iterator is the modern one, supports remove() and is fail-fast.'),
    ('How do you make an ArrayList thread-safe instead of using Vector?',
     'Collections.synchronizedList(new ArrayList<>()), or CopyOnWriteArrayList for read-mostly workloads.'),
    ('What does setSize(n) do?',
     'It changes the size of the vector: if n is larger the new slots are filled with null, if smaller the extra elements are discarded.'),
    ('How does Vector relate to Stack?',
     'Stack extends Vector, so a Stack is also synchronized and inherits every Vector method. Use ArrayDeque for a modern stack.'),
    ('Does Vector allow null and duplicates?',
     'Yes to both, and it keeps insertion order.'),
    ('Which exception does elementAt(i) throw for a bad index?',
     'ArrayIndexOutOfBoundsException, a subclass of IndexOutOfBoundsException.'),
]

TOPIC = dict(id='vector', name='Vector', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
