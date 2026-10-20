"""LinkedList lesson: a doubly linked list that is also a Queue and a Deque. Every method has a runnable sample.
Data uses only fort names and Indian city names. Run build.py to compile and run every sample."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, hierarchy, method, section, table, ul  # noqa: E402

G, B = '#3b6e3b', '#b5651d'

BEGINNER = [
    section(
        'What is a LinkedList?',
        'A <strong>LinkedList</strong> stores its elements in separate little objects called <strong>nodes</strong>. Every node holds one element and two links: one to the '
        '<strong>previous</strong> node and one to the <strong>next</strong> node. Picture a chain of forts connected by roads in both directions: to go from the first fort to the fourth you '
        'must walk through the second and the third. There is no numbered shelf like in an array.',
        [
            'It lives in <code>java.util</code>. It implements <strong>List</strong> (indexes, order), <strong>Deque</strong> and <strong>Queue</strong> (work at both ends).',
            '<strong>Fast at the two ends:</strong> adding or removing the first or last element changes only a couple of links: O(1).',
            '<strong>Slow in the middle:</strong> <code>get(i)</code> has to walk from the nearest end to position i: O(n).',
            'No capacity and no resizing: the list simply gets one more node when you add.',
            'Keeps insertion order, allows duplicates and <code>null</code>, and is <strong>not thread-safe</strong>.',
            'Each element costs extra memory for its node (about 24 bytes on a typical JVM) compared with an ArrayList.',
        ],
    ),
    (
        '<h3>Where LinkedList sits in the Collection Framework</h3>\n'
        + hierarchy([
            ('Iterable', 'I', True, None, G), ('Collection', 'I', True, 'extends', G), ('List', 'I', True, 'extends', G),
            ('AbstractSequentialList', 'c', False, 'implements', B), ('LinkedList', 'c', False, 'extends', G),
        ])
        + '\n<p>(I) = interface, (c) = class. LinkedList also implements <code>Deque</code> (which extends <code>Queue</code>), <code>Cloneable</code> and <code>Serializable</code>. '
          'It does <strong>not</strong> implement <code>RandomAccess</code>, because index access is not fast.</p>',
        [],
    ),
    (
        '<h3>How the nodes are linked</h3>\n'
        '<p>Inside, a LinkedList keeps only three fields: <code>first</code> (the first node), <code>last</code> (the last node) and <code>size</code>.</p>\n'
        + table(['Node', 'item', 'prev', 'next'], [
            ['Node 1 (first)', 'Raigad', 'null', 'Node 2'],
            ['Node 2', 'Sinhagad', 'Node 1', 'Node 3'],
            ['Node 3 (last)', 'Torna', 'Node 2', 'null'],
        ])
        + '\n<p>To insert a new fort after Node 1, Java creates one new node and re-points two links on each side. Nothing else moves. That is why inserting is cheap <em>once you are at the right place</em>, and finding that place is the expensive part.</p>',
        [],
    ),
    (
        '<h3>Creating a LinkedList</h3>\n'
        + ul([
            '<code>new LinkedList&lt;&gt;()</code>: an empty list.',
            '<code>new LinkedList&lt;&gt;(Collection c)</code>: a list holding the elements of another collection, in its iteration order.',
            'There is <strong>no</strong> capacity constructor, because a linked list has no capacity.',
            'Declare the variable as <code>List</code>, <code>Queue</code> or <code>Deque</code> depending on how you will use it.',
        ]),
        [r'''// LinkedList constructors and the three ways to see it: List, Queue, Deque
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class LinkedListCreateDemo {
    public static void main(String[] args) {
        List<String> forts = new LinkedList<>();           // used like a list
        forts.add("Raigad");
        forts.add("Sinhagad");
        System.out.println("As List : " + forts);

        Queue<String> waiting = new LinkedList<>(forts);   // copy constructor, used like a queue (first in, first out)
        System.out.println("As Queue: " + waiting + " head=" + waiting.peek());

        Deque<String> stack = new LinkedList<>(List.of("Pune", "Nashik", "Nagpur"));   // used like a deque
        stack.push("Mumbai");                              // push puts the element at the FRONT
        System.out.println("As Deque: " + stack);
    }
}
''' + OUT],
    ),
    (
        '<h3>All LinkedList methods at a glance</h3>\n<p><em>n</em> is the number of elements. "end" means the first or last element.</p>\n'
        + table(['Method', 'What it does', 'Time'], [
            ['<strong>add(e)</strong> / <strong>addLast(e)</strong> / <strong>offer(e)</strong> / <strong>offerLast(e)</strong>', 'Adds at the end', 'O(1)'],
            ['<strong>addFirst(e)</strong> / <strong>push(e)</strong> / <strong>offerFirst(e)</strong>', 'Adds at the front', 'O(1)'],
            ['<strong>add(i, e)</strong>', 'Inserts at index i', 'O(n) to find i'],
            ['<strong>addAll(c)</strong> / <strong>addAll(i, c)</strong>', 'Adds a whole collection', 'O(m) / O(n + m)'],
            ['<strong>get(i)</strong> / <strong>set(i, e)</strong>', 'Reads / replaces by index', 'O(n)'],
            ['<strong>getFirst()</strong> / <strong>getLast()</strong> / <strong>element()</strong>', 'Reads an end (throws if empty)', 'O(1)'],
            ['<strong>peek()</strong> / <strong>peekFirst()</strong> / <strong>peekLast()</strong>', 'Reads an end (null if empty)', 'O(1)'],
            ['<strong>remove()</strong> / <strong>removeFirst()</strong> / <strong>pop()</strong> / <strong>removeLast()</strong>', 'Removes an end (throws if empty)', 'O(1)'],
            ['<strong>poll()</strong> / <strong>pollFirst()</strong> / <strong>pollLast()</strong>', 'Removes an end (null if empty)', 'O(1)'],
            ['<strong>remove(i)</strong> / <strong>remove(o)</strong>', 'Removes by index / by value', 'O(n)'],
            ['<strong>removeFirstOccurrence(o)</strong> / <strong>removeLastOccurrence(o)</strong>', 'Removes the first / last equal element', 'O(n)'],
            ['<strong>removeIf(p)</strong> / <strong>removeAll(c)</strong> / <strong>retainAll(c)</strong>', 'Removes by rule / by collection', 'O(n)'],
            ['<strong>contains(o)</strong> / <strong>indexOf(o)</strong> / <strong>lastIndexOf(o)</strong>', 'Searches by value', 'O(n)'],
            ['<strong>size()</strong> / <strong>isEmpty()</strong> / <strong>clear()</strong>', 'Size, emptiness, remove all', 'O(1) / O(1) / O(n)'],
            ['<strong>iterator()</strong> / <strong>listIterator()</strong> / <strong>descendingIterator()</strong>', 'Walk forward / both ways / backwards', 'O(1) per step'],
            ['<strong>sort(c)</strong> / <strong>replaceAll(op)</strong> / <strong>forEach(a)</strong>', 'Inherited List helpers', 'O(n log n) / O(n) / O(n)'],
            ['<strong>stream()</strong> / <strong>toArray()</strong> / <strong>clone()</strong>', 'Stream, array copy, shallow copy', 'O(n)'],
            ['<strong>reversed()</strong>', 'A reversed view (Java 21)', 'O(1)'],
        ]),
        [],
    ),
]

INTERMEDIATE = [
    section('Adding elements', 'LinkedList gives you many names for "add at an end". The names come from the three roles the class plays: List, Queue and Deque.'),
    method(
        'add, addLast and offer', 'boolean add(E e);  void addLast(E e);  boolean offer(E e)', '<code>add</code> and <code>offer</code> return <code>true</code>; <code>addLast</code> returns nothing', 'O(1)',
        'All three put the element at the <strong>end</strong> of the list. Use <code>add</code> when you think "list", <code>offer</code> when you think "queue", and <code>addLast</code> when you think "deque".',
        'They all call the same internal <code>linkLast</code>: create a node, point the old last node\'s <code>next</code> at it, and update <code>last</code>. A LinkedList has no capacity limit, so <code>offer</code> never returns <code>false</code> here (it can for bounded queues).',
        r'''// LinkedList add / addLast / offer: three names for "append"
import java.util.LinkedList;

public class LinkedListAddDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>();

        forts.add("Raigad");           // list style
        forts.addLast("Sinhagad");     // deque style
        boolean accepted = forts.offer("Torna");   // queue style, returns true when accepted

        System.out.println("offer returned : " + accepted);
        System.out.println("List           : " + forts);
    }
}
''' + OUT),
    method(
        'addFirst, push and offerFirst', 'void addFirst(E e);  void push(E e);  boolean offerFirst(E e)', 'nothing / nothing / <code>true</code>', 'O(1)',
        'These put the element at the <strong>front</strong>. Adding at the front is where LinkedList beats ArrayList: no shifting. <code>push</code> is the name used when the list acts like a <strong>stack</strong> (last in, first out).',
        '<code>push(e)</code> is just <code>addFirst(e)</code>. Together with <code>pop()</code> (which removes the first element) you get a stack that is consistent with the <code>Deque</code> contract. Note: the legacy <code>Stack</code> class works at the other end and is synchronized.',
        r'''// LinkedList addFirst / push / offerFirst: add at the front
import java.util.LinkedList;

public class LinkedListAddFirstDemo {
    public static void main(String[] args) {
        LinkedList<String> cities = new LinkedList<>();
        cities.add("Nagpur");

        cities.addFirst("Nashik");          // front
        cities.push("Pune");                // push == addFirst
        cities.offerFirst("Mumbai");        // returns true

        System.out.println(cities);         // the last one added is first
    }
}
''' + OUT),
    method(
        'add(int index, E e)', 'void add(int index, E element)', 'nothing (void)', 'O(n) to reach the index',
        'Inserts the element at a position. Linking the new node is instant, but Java must first <strong>walk</strong> to that position, one node at a time.',
        'The walk starts from whichever end is closer (<code>index &lt; size/2</code> goes from the front, otherwise from the back), so the average cost is about n/4 steps. For an insertion that is far from both ends an ArrayList is usually still faster because its shifting is a native block copy.',
        r'''// LinkedList add(int index, E e): insert in the middle
import java.util.LinkedList;
import java.util.List;

public class LinkedListAddAtIndexDemo {
    public static void main(String[] args) {
        LinkedList<String> route = new LinkedList<>(List.of("Pune", "Nagpur", "Kochi"));

        route.add(1, "Nashik");            // goes between Pune and Nagpur
        route.add(route.size(), "Delhi");  // index == size() adds at the end
        System.out.println(route);
    }
}
''' + OUT),
    method(
        'addAll(Collection c) and addAll(int index, Collection c)', 'boolean addAll(Collection<? extends E> c);  boolean addAll(int index, Collection<? extends E> c)', '<code>true</code> if the list changed', 'O(m) / O(index + m)',
        'Adds all elements of another collection, at the end or starting at an index, keeping their order.',
        'It converts the argument to an array, then links the new nodes in one pass, so it is efficient even for the indexed version (only one walk to the index).',
        r'''// LinkedList addAll: add a whole collection
import java.util.LinkedList;
import java.util.List;

public class LinkedListAddAllDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>(List.of("Raigad", "Torna"));

        forts.addAll(List.of("Purandar", "Lohagad"));        // at the end
        System.out.println("At end    : " + forts);

        forts.addAll(1, List.of("Sinhagad", "Rajgad"));      // starting at index 1
        System.out.println("At index 1: " + forts);
    }
}
''' + OUT),

    section('Reading elements', 'Reading the ends is O(1). Reading in the middle walks the chain. Pick the variant by what you want when the list is empty: an <strong>exception</strong> or <strong>null</strong>.'),
    method(
        'getFirst, getLast and element', 'E getFirst();  E getLast();  E element()', 'the element at that end', 'O(1)',
        'Read the first or last element <strong>without removing</strong> it. On an empty list they throw <code>NoSuchElementException</code>. <code>element()</code> is the queue name for <code>getFirst()</code>.',
        'They read the <code>first</code> / <code>last</code> pointers directly. If an empty list is normal in your program, use the <code>peek</code> family (next card), which returns <code>null</code> instead of throwing.',
        r'''// LinkedList getFirst / getLast / element
import java.util.LinkedList;
import java.util.List;
import java.util.NoSuchElementException;

public class LinkedListGetEndsDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>(List.of("Raigad", "Sinhagad", "Torna"));

        System.out.println("getFirst : " + forts.getFirst());
        System.out.println("getLast  : " + forts.getLast());
        System.out.println("element  : " + forts.element());      // same as getFirst

        try {
            new LinkedList<String>().getFirst();                  // empty list
        } catch (NoSuchElementException e) {
            System.out.println("Empty list throws NoSuchElementException");
        }
    }
}
''' + OUT),
    method(
        'peek, peekFirst and peekLast', 'E peek();  E peekFirst();  E peekLast()', 'the element, or <code>null</code> if the list is empty', 'O(1)',
        'Look at an end <strong>without removing it</strong>; if the list is empty you get <code>null</code>, not an exception. <code>peek()</code> and <code>peekFirst()</code> look at the front, <code>peekLast()</code> at the back.',
        'These are the "safe" counterparts of <code>getFirst</code>/<code>getLast</code>. Because LinkedList allows <code>null</code> elements, a <code>null</code> result is ambiguous: it could be "empty" or "the element is null". Check <code>isEmpty()</code> if you store nulls.',
        r'''// LinkedList peek / peekFirst / peekLast: look without removing
import java.util.LinkedList;
import java.util.List;

public class LinkedListPeekDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>(List.of("Raigad", "Sinhagad", "Torna"));

        System.out.println("peek      : " + forts.peek());
        System.out.println("peekFirst : " + forts.peekFirst());
        System.out.println("peekLast  : " + forts.peekLast());
        System.out.println("Still     : " + forts);               // nothing was removed

        System.out.println("Empty peek: " + new LinkedList<String>().peek());   // null, no exception
    }
}
''' + OUT),
    method(
        'get(int index) and set(int index, E e)', 'E get(int index);  E set(int index, E element)', 'the element / the replaced element', 'O(n)',
        'Read or replace by position. It works, but remember the list has to <strong>walk</strong> to the index: reading the 500th element touches up to 250 nodes.',
        'The cost is why a <code>for (int i...) list.get(i)</code> loop over a LinkedList is O(n&sup2;). Use a for-each loop or an iterator instead: they move from one node to the next in O(1) per step.',
        r'''// LinkedList get(index) and set(index): works, but walks the chain
import java.util.LinkedList;
import java.util.List;

public class LinkedListGetSetDemo {
    public static void main(String[] args) {
        LinkedList<String> cities = new LinkedList<>(List.of("Pune", "Nashik", "Nagpur", "Indore"));

        System.out.println("get(2)        : " + cities.get(2));
        String old = cities.set(1, "Mumbai");
        System.out.println("set(1) old    : " + old);
        System.out.println("List now      : " + cities);

        // For visiting every element prefer for-each: it follows the links without searching
        for (String city : cities) {
            System.out.print(city + " ");
        }
        System.out.println();
    }
}
''' + OUT),
    method(
        'contains, indexOf and lastIndexOf', 'boolean contains(Object o);  int indexOf(Object o);  int lastIndexOf(Object o)', '<code>true</code> / the index / the index (or <code>-1</code>)', 'O(n)',
        'Search by value from the front (<code>indexOf</code>, <code>contains</code>) or from the back (<code>lastIndexOf</code>). Matching uses <code>equals()</code>.',
        'Linear scans, identical in behaviour to ArrayList. Override <code>equals</code> in your element class (or use a <code>record</code>) so the search works for your objects.',
        r'''// LinkedList contains / indexOf / lastIndexOf
import java.util.LinkedList;
import java.util.List;

public class LinkedListSearchDemo {
    public static void main(String[] args) {
        LinkedList<String> cities = new LinkedList<>(List.of("Pune", "Nashik", "Pune", "Nagpur"));

        System.out.println("contains(Nashik)   : " + cities.contains("Nashik"));
        System.out.println("indexOf(Pune)      : " + cities.indexOf("Pune"));
        System.out.println("lastIndexOf(Pune)  : " + cities.lastIndexOf("Pune"));
        System.out.println("indexOf(Kochi)     : " + cities.indexOf("Kochi"));
    }
}
''' + OUT),

    section('Removing elements', 'Removing an end is O(1). The names differ again by what happens on an empty list.'),
    method(
        'remove(), removeFirst, pop and removeLast', 'E remove();  E removeFirst();  E pop();  E removeLast()', 'the removed element (throws on an empty list)', 'O(1)',
        '<code>remove()</code>, <code>removeFirst()</code> and <code>pop()</code> all take the <strong>first</strong> element out and return it; <code>removeLast()</code> takes the last. If the list is empty they throw <code>NoSuchElementException</code>.',
        'The no-argument <code>remove()</code> is the <code>Queue</code> method and must not be confused with <code>remove(int)</code> / <code>remove(Object)</code>. Removing an end only updates one or two links, with no shifting.',
        r'''// LinkedList remove() / removeFirst / pop / removeLast
import java.util.LinkedList;
import java.util.List;

public class LinkedListRemoveEndsDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar", "Lohagad"));

        System.out.println("remove()      : " + forts.remove());        // front
        System.out.println("removeFirst() : " + forts.removeFirst());   // front
        System.out.println("pop()         : " + forts.pop());          // front (stack name)
        System.out.println("removeLast()  : " + forts.removeLast());    // back
        System.out.println("Remaining     : " + forts);
    }
}
''' + OUT),
    method(
        'poll, pollFirst and pollLast', 'E poll();  E pollFirst();  E pollLast()', 'the removed element, or <code>null</code> if empty', 'O(1)',
        'Like <code>remove</code>, but safe: when the list is empty you get <code>null</code> instead of an exception. <code>poll()</code> is the standard way to take the next item from a queue in a loop: <code>while ((x = queue.poll()) != null)</code>.',
        'Prefer <code>poll</code> in queue-style code and <code>removeFirst</code> when an empty list would be a bug that you want to see as an exception.',
        r'''// LinkedList poll / pollFirst / pollLast: remove or get null
import java.util.LinkedList;
import java.util.List;

public class LinkedListPollDemo {
    public static void main(String[] args) {
        LinkedList<String> queue = new LinkedList<>(List.of("Pune", "Nashik", "Nagpur"));

        String next;
        while ((next = queue.poll()) != null) {          // keep going until the queue is empty
            System.out.println("Serving " + next);
        }
        System.out.println("poll on empty : " + queue.poll());
        System.out.println("pollLast empty: " + queue.pollLast());
    }
}
''' + OUT),
    method(
        'remove(int index) and remove(Object o)', 'E remove(int index);  boolean remove(Object o)', 'the removed element / <code>true</code> if found', 'O(n)',
        'Remove by position or by value (the first equal element). Both have to walk the chain to find the node, then unlink it.',
        'The same overload trap exists as in ArrayList: on a <code>LinkedList&lt;Integer&gt;</code>, <code>remove(2)</code> removes <strong>index</strong> 2; use <code>remove(Integer.valueOf(2))</code> for the value. <code>removeFirstOccurrence</code> and <code>removeLastOccurrence</code> (next card) make the direction explicit.',
        r'''// LinkedList remove(int index) and remove(Object o)
import java.util.LinkedList;
import java.util.List;

public class LinkedListRemoveDemo {
    public static void main(String[] args) {
        LinkedList<String> cities = new LinkedList<>(List.of("Pune", "Nashik", "Nagpur", "Nashik"));

        System.out.println("remove(1)         : " + cities.remove(1) + " -> " + cities);
        System.out.println("remove(\"Nashik\")  : " + cities.remove("Nashik") + " -> " + cities);
        System.out.println("remove(\"Kochi\")   : " + cities.remove("Kochi") + " -> " + cities);

        LinkedList<Integer> hours = new LinkedList<>(List.of(10, 20, 30, 2));
        hours.remove(2);                                    // index 2 -> the value 30
        hours.remove(Integer.valueOf(2));                   // the VALUE 2
        System.out.println("numbers           : " + hours);
    }
}
''' + OUT),
    method(
        'removeFirstOccurrence and removeLastOccurrence', 'boolean removeFirstOccurrence(Object o);  boolean removeLastOccurrence(Object o)', '<code>true</code> if an element was removed', 'O(n)',
        'Remove the <strong>first</strong> or the <strong>last</strong> element equal to the value, when the list holds duplicates.',
        '<code>removeFirstOccurrence</code> is the same as <code>remove(Object)</code>. <code>removeLastOccurrence</code> scans from the back, which is the only direct way to remove the last match in a list.',
        r'''// LinkedList removeFirstOccurrence / removeLastOccurrence
import java.util.LinkedList;
import java.util.List;

public class LinkedListOccurrenceDemo {
    public static void main(String[] args) {
        LinkedList<String> cities = new LinkedList<>(List.of("Pune", "Nashik", "Pune", "Nagpur", "Pune"));

        cities.removeFirstOccurrence("Pune");
        System.out.println("After first : " + cities);

        cities.removeLastOccurrence("Pune");
        System.out.println("After last  : " + cities);
    }
}
''' + OUT),
    method(
        'removeIf, removeAll, retainAll and clear', 'boolean removeIf(Predicate);  boolean removeAll(Collection);  boolean retainAll(Collection);  void clear()', '<code>true</code> if changed / nothing', 'O(n)',
        'Remove by a <strong>rule</strong>, remove everything found in another collection, keep only what is found in another collection, or remove everything.',
        'These are inherited from <code>Collection</code>; they work with an iterator, unlinking nodes as they go. <code>clear()</code> unlinks every node (setting their fields to <code>null</code> to help the garbage collector).',
        r'''// LinkedList removeIf / removeAll / retainAll / clear
import java.util.LinkedList;
import java.util.List;

public class LinkedListBulkRemoveDemo {
    public static void main(String[] args) {
        LinkedList<String> cities = new LinkedList<>(List.of("Pune", "Nashik", "Nagpur", "Indore", "Jaipur"));

        cities.removeIf(c -> c.startsWith("N"));
        System.out.println("removeIf N* : " + cities);

        cities.removeAll(List.of("Jaipur"));
        System.out.println("removeAll   : " + cities);

        cities.add("Kochi");
        cities.retainAll(List.of("Kochi", "Delhi"));
        System.out.println("retainAll   : " + cities);

        cities.clear();
        System.out.println("clear       : " + cities + " size " + cities.size());
    }
}
''' + OUT),

    section('Using LinkedList as a Queue, a Stack and a Deque', 'Because LinkedList is also a <code>Deque</code>, the same object can be used three ways. Choose the interface type that matches your use so the code says what you mean.'),
    (
        '<h3>The same LinkedList as Queue, Stack and Deque</h3>\n'
        + table(['Role', 'Add', 'Remove', 'Look', 'Order'], [
            ['<strong>Queue</strong> (line at a ticket window)', '<code>offer(e)</code> at the back', '<code>poll()</code> from the front', '<code>peek()</code>', 'First in, first out (FIFO)'],
            ['<strong>Stack</strong> (pile of plates)', '<code>push(e)</code> on top (front)', '<code>pop()</code> from the top (front)', '<code>peek()</code>', 'Last in, first out (LIFO)'],
            ['<strong>Deque</strong> (both ends)', '<code>offerFirst</code> / <code>offerLast</code>', '<code>pollFirst</code> / <code>pollLast</code>', '<code>peekFirst</code> / <code>peekLast</code>', 'Both ends'],
        ])
        + '\n<p>For pure queue or stack work, <code>ArrayDeque</code> is usually even faster (no node objects), but it does not allow <code>null</code> and has no index methods.</p>',
        [r'''// LinkedList used as a Queue (FIFO), a Stack (LIFO) and a Deque
import java.util.Deque;
import java.util.LinkedList;
import java.util.Queue;

public class LinkedListRolesDemo {
    public static void main(String[] args) {
        // Queue: first in, first out
        Queue<String> ticketLine = new LinkedList<>();
        ticketLine.offer("Pune");
        ticketLine.offer("Nashik");
        ticketLine.offer("Nagpur");
        System.out.println("Queue serves : " + ticketLine.poll() + ", then " + ticketLine.poll());

        // Stack: last in, first out
        Deque<String> plates = new LinkedList<>();
        plates.push("Raigad");
        plates.push("Sinhagad");
        plates.push("Torna");
        System.out.println("Stack pops   : " + plates.pop() + ", then " + plates.pop());

        // Deque: work at both ends
        Deque<String> both = new LinkedList<>();
        both.offerFirst("Mumbai");
        both.offerLast("Delhi");
        both.offerFirst("Kochi");
        System.out.println("Deque        : " + both + " first=" + both.peekFirst() + " last=" + both.peekLast());
    }
}
''' + OUT],
    ),

    section('Changing, converting and walking', 'The rest of the List API works exactly as in ArrayList, so only the LinkedList-specific points are shown here.'),
    method(
        'iterator, listIterator and descendingIterator', 'Iterator<E> iterator();  ListIterator<E> listIterator();  Iterator<E> descendingIterator()', 'an iterator', 'O(1) per step',
        'Walk the list element by element. <code>iterator()</code> goes forward, <code>listIterator()</code> also goes backward and can add or replace, and <code>descendingIterator()</code> walks from the <strong>last</strong> element to the first. Iterators are the right way to loop a LinkedList because each step is O(1).',
        'The iterators are fail-fast (they check <code>modCount</code>). A <code>ListIterator</code> can insert in the middle in <strong>O(1)</strong> at the cursor: this is the one case where LinkedList truly beats ArrayList for middle insertion, because you are already standing on the node.',
        r'''// LinkedList iterator / listIterator / descendingIterator
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;

public class LinkedListIteratorDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>(List.of("Raigad", "Sinhagad", "Torna", "Purandar"));

        Iterator<String> back = forts.descendingIterator();      // last to first
        System.out.print("Backwards : ");
        while (back.hasNext()) {
            System.out.print(back.next() + " ");
        }
        System.out.println();

        ListIterator<String> it = forts.listIterator();
        while (it.hasNext()) {
            String name = it.next();
            if (name.equals("Torna")) {
                it.add("Lohagad");                // O(1) insert right at the cursor
            }
            if (name.equals("Raigad")) {
                it.remove();                       // O(1) remove at the cursor
            }
        }
        System.out.println("After edits: " + forts);
    }
}
''' + OUT),
    method(
        'sort, replaceAll, forEach, stream, toArray, subList', 'inherited from List and Collection', 'as for ArrayList', 'O(n) or O(n log n)',
        'These work just like on an ArrayList: <code>sort</code> orders the list, <code>replaceAll</code> changes every element, <code>forEach</code> runs an action, <code>stream</code> starts a pipeline, <code>toArray</code> copies into an array and <code>subList</code> gives a range view.',
        '<code>sort</code> copies the nodes into an array, sorts it with TimSort and writes the values back, so there is no benefit from being a linked list. If you sort a lot, you probably wanted an ArrayList.',
        r'''// Inherited List methods on a LinkedList
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;

public class LinkedListInheritedDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>(List.of("Torna", "Raigad", "Sinhagad", "Lohagad"));

        forts.sort(Comparator.naturalOrder());                    // sort
        System.out.println("sorted       : " + forts);

        forts.replaceAll(String::toUpperCase);                    // replaceAll
        System.out.println("upper case   : " + forts);

        forts.forEach(f -> System.out.print(f.charAt(0)));        // forEach: first letters
        System.out.println();

        String[] array = forts.toArray(new String[0]);            // toArray
        System.out.println("array        : " + Arrays.toString(array));

        List<String> middle = forts.subList(1, 3);                 // subList (a view)
        System.out.println("subList(1,3) : " + middle);
        System.out.println("long names   : " + forts.stream().filter(f -> f.length() > 5).count());
    }
}
''' + OUT),
    method(
        'clone, equals, hashCode, toString and reversed', 'Object clone();  boolean equals(Object);  String toString();  LinkedList reversed()', 'a shallow copy / comparisons / text / a reversed view', 'O(n) / O(1)',
        '<code>clone()</code> makes a shallow copy (the new list has its own nodes but shares the elements). Two lists are <code>equals</code> when they have the same elements in the same order, whatever the list class. In Java 21 <code>reversed()</code> gives a view that walks from the back.',
        'Prefer the copy constructor over <code>clone()</code>. A reversed view is not a copy: changes through it change the original.',
        r'''// LinkedList clone / equals / reversed
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class LinkedListCopyDemo {
    public static void main(String[] args) {
        LinkedList<String> forts = new LinkedList<>(List.of("Raigad", "Sinhagad", "Torna"));

        @SuppressWarnings("unchecked")
        LinkedList<String> copy = (LinkedList<String>) forts.clone();
        copy.addFirst("Purandar");
        System.out.println("Original : " + forts);
        System.out.println("Copy     : " + copy);

        List<String> asArrayList = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna"));
        System.out.println("Equals an ArrayList with the same elements? " + forts.equals(asArrayList));

        System.out.println("Reversed view (Java 21): " + forts.reversed());
    }
}
''' + OUT),
]

EXPERT = [
    section(
        'How LinkedList works inside',
        'A short tour of the source code explains every cost in the tables.',
        [
            'The class keeps <code>transient int size</code>, <code>Node&lt;E&gt; first</code> and <code>Node&lt;E&gt; last</code>. Each <code>Node</code> has <code>item</code>, <code>next</code> and <code>prev</code>.',
            '<code>linkLast(e)</code>: create a node whose <code>prev</code> is the old <code>last</code>; set <code>last</code> to it; link the old last\'s <code>next</code>; <code>size++</code>; <code>modCount++</code>. No arrays, no copying, so no "amortised" caveat.',
            '<code>node(index)</code> picks the nearest end: if <code>index &lt; (size &gt;&gt; 1)</code> it walks from <code>first</code> via <code>next</code>, otherwise from <code>last</code> via <code>prev</code>. That is why access in the <strong>middle</strong> is the slowest.',
            '<code>unlink(node)</code> reconnects the neighbours and clears the node\'s fields so the garbage collector can reclaim it.',
            'Memory: on a 64-bit JVM with compressed pointers a node is 24 bytes (12 header + 3 references x 4). A million elements cost 24 MB of nodes on top of the elements themselves, versus 4 MB of references in an ArrayList.',
            'Cache behaviour: nodes are scattered in memory, so walking a LinkedList causes many CPU cache misses, while an ArrayList reads contiguous memory. This is why ArrayList often wins even where Big-O suggests otherwise.',
        ],
    ),
    (
        '<h3>Time complexity summary</h3>\n'
        + table(['Operation', 'LinkedList', 'ArrayList (for comparison)'], [
            ['get(i), set(i, e)', 'O(n), up to n/2 steps', 'O(1)'],
            ['add at the end', 'O(1)', 'O(1) amortised'],
            ['add / remove at the front', '<strong>O(1)</strong>', 'O(n)'],
            ['add(i, e), remove(i) in the middle', 'O(n) to reach i, then O(1) to link', 'O(n) shift (fast block copy)'],
            ['Insert / remove through a ListIterator at the cursor', '<strong>O(1)</strong>', 'O(n)'],
            ['contains, indexOf', 'O(n)', 'O(n)'],
            ['Memory per element', '~24 bytes node + element', '~4 bytes reference + element'],
            ['Iteration speed', 'Slower (cache misses)', 'Faster'],
        ]),
        [],
    ),
    (
        '<h3>Trap: indexed loops are quadratic</h3>\n'
        + ul([
            'A <code>for (int i = 0; i &lt; list.size(); i++) list.get(i)</code> loop calls <code>get</code> n times, each costing up to n/2 steps: O(n&sup2;).',
            'Use a for-each loop, an <code>Iterator</code>, or <code>forEach</code>: O(n) in total.',
            'The program below counts node visits to make the difference visible without timing.',
        ]),
        [r'''// Why get(i) in a loop is slow on a LinkedList: counting node visits
public class LinkedListQuadraticDemo {
    // A tiny stand-in that counts how many nodes would be walked, using the same "nearest end" rule as LinkedList.node(index)
    static long stepsForGet(int index, int size) {
        return index < (size >> 1) ? index : (size - 1 - index);
    }

    public static void main(String[] args) {
        int size = 10_000;

        long indexedLoopSteps = 0;                       // for (i) list.get(i)
        for (int i = 0; i < size; i++) {
            indexedLoopSteps += stepsForGet(i, size);
        }
        long iteratorSteps = size;                       // for-each: one step per element

        System.out.println("Elements                  : " + size);
        System.out.println("Node visits, index loop   : " + indexedLoopSteps);
        System.out.println("Node visits, for-each loop: " + iteratorSteps);
        System.out.println("Index loop does about " + (indexedLoopSteps / iteratorSteps) + " times more work");
    }
}
''' + OUT],
    ),
    (
        '<h3>LinkedList vs ArrayList vs ArrayDeque: which one?</h3>\n'
        + table(['Need', 'Best choice', 'Why'], [
            ['A general list you read by index', '<strong>ArrayList</strong>', 'O(1) get, compact, cache-friendly'],
            ['A queue or a stack', '<strong>ArrayDeque</strong>', 'No node objects, faster than LinkedList; no nulls'],
            ['A queue that must hold <code>null</code>, or needs both the List and Deque APIs', 'LinkedList', 'The only class that is both a List and a Deque'],
            ['Many inserts/removals through an iterator in the middle of a big list', 'LinkedList', 'O(1) at the cursor'],
            ['Thread-safe queue', '<code>ConcurrentLinkedDeque</code> / <code>LinkedBlockingDeque</code>', 'LinkedList is not synchronized'],
        ])
        + '\n<p>Rule of thumb: <strong>start with ArrayList</strong>, and move to ArrayDeque for queues and stacks. LinkedList is a niche choice.</p>',
        [],
    ),
    section(
        'Best practices',
        'Habits that keep LinkedList code correct and fast.',
        [
            'Declare the variable as the interface you use: <code>Queue&lt;T&gt;</code>, <code>Deque&lt;T&gt;</code> or <code>List&lt;T&gt;</code>.',
            'Never loop with <code>get(i)</code>; use for-each, an iterator or a stream.',
            'Use the <code>poll</code>/<code>peek</code>/<code>offer</code> family when "empty" is a normal state, and <code>remove</code>/<code>get</code>/<code>add</code> when it would be a bug.',
            'Avoid <code>null</code> elements, because <code>peek()</code>/<code>poll()</code> use <code>null</code> to mean "empty".',
            'For thread safety use <code>ConcurrentLinkedDeque</code> or wrap with <code>Collections.synchronizedList</code>; remember to lock while iterating.',
            'Do not use LinkedList only because "insertion is O(1)": measure first; ArrayList is faster for most sizes.',
        ],
    ),
    (
        '<h3>Real example: a ticket counter with undo</h3>\n<p>A queue of travellers and a stack of cancelled tickets, both built on LinkedList.</p>',
        [r'''// Ticket counter: a Queue for the waiting line and a Deque used as a Stack for undo
import java.util.Deque;
import java.util.LinkedList;
import java.util.Queue;

public class TicketCounterDemo {
    public static void main(String[] args) {
        Queue<String> line = new LinkedList<>();             // first come, first served
        line.offer("Pune");
        line.offer("Nashik");
        line.offer("Nagpur");
        line.offer("Indore");

        Deque<String> served = new LinkedList<>();           // history, most recent on top
        while (line.size() > 1) {
            String city = line.poll();                       // next traveller
            served.push(city);                               // remember who was served
            System.out.println("Served   : " + city);
        }

        System.out.println("Waiting  : " + line);
        String undone = served.pop();                        // undo the most recent service
        line.offer(undone);                                  // that traveller goes back to the line
        System.out.println("Undo     : " + undone + " goes back");
        System.out.println("Waiting  : " + line);
        System.out.println("History  : " + served);
    }
}
''' + OUT],
    ),
]

QA = [
    ('What is a LinkedList and how is it different from an ArrayList?',
     'LinkedList is a doubly linked list: each element sits in a node with prev and next references. It gives O(1) insertion and removal at both ends and via an iterator, but O(n) index access. ArrayList uses an array: O(1) index access, O(n) insert/remove in the middle and at the front.'),
    ('Which interfaces does LinkedList implement?',
     'List, Deque (and so Queue), Cloneable and Serializable. It does not implement RandomAccess.'),
    ('Time complexity of get(i), add at the end, add at the front, remove in the middle?',
     'get(i) O(n) (walks from the nearer end); add at end O(1); add/remove at the front O(1); remove(index) O(n) to find the node, then O(1) to unlink.'),
    ('When would you actually choose LinkedList?',
     'When you need both List and Deque behaviour in one object, need to store nulls in a queue, or do many insertions/removals through a ListIterator in a large list. For plain queues and stacks ArrayDeque is better; for general lists ArrayList is better.'),
    ('Why is a for loop with get(i) slow on a LinkedList?',
     'Each get(i) walks the chain, so n calls cost O(n^2). Use for-each, an Iterator or streams, which move node to node in O(1).'),
    ('Difference between remove(), poll() and pop()?',
     'remove() and pop() take the first element and throw NoSuchElementException when empty; poll() takes the first element and returns null when empty. pop() is the stack name for removeFirst().'),
    ('What is the difference between peek() and element()?',
     'Both read the head without removing it; peek() returns null for an empty list, element() throws NoSuchElementException.'),
    ('How do you use LinkedList as a stack?',
     'Declare Deque<T> stack = new LinkedList<>(); use push(e) to add on top, pop() to remove from the top and peek() to look. They all work at the front of the list.'),
    ('Does LinkedList allow duplicates and null?',
     'Yes. Be careful with null because peek() and poll() return null to signal an empty list.'),
    ('Is LinkedList thread-safe?',
     'No. Use ConcurrentLinkedDeque or LinkedBlockingDeque for concurrent use, or wrap with Collections.synchronizedList and synchronise manually while iterating.'),
    ('What is the memory overhead of LinkedList?',
     'Each element needs a Node object: about 24 bytes (object header plus three references) on a 64-bit JVM with compressed pointers, compared with a 4-byte reference slot in an ArrayList.'),
    ('How does node(index) decide where to start walking?',
     'If index is less than size/2 it walks forward from first, otherwise it walks backward from last, so it needs at most about n/2 steps.'),
    ('What does descendingIterator() do?',
     'It returns an iterator that visits the elements from last to first, without creating a reversed copy.'),
    ('Why can ListIterator.add() be O(1) on a LinkedList?',
     'The iterator already holds a reference to the neighbouring nodes, so inserting a new node only changes the links around the cursor; no search is needed.'),
]

TOPIC = dict(id='linkedlist', name='LinkedList', beginner=BEGINNER, intermediate=INTERMEDIATE, expert=EXPERT, qa=QA)
