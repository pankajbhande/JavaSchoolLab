// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const CollectionFramework: Course[] = [
  {
    id: 'collection',
    name: 'Collection Framework',
    icon: 'BookOpen',
    subTopics: [

      // ===== SubTopic 1: Collection Framework Overview =====
      {
        id: 'collection-overview',
        name: 'Collection Framework Overview',
        topics: [
          {
            id: 'collection-framework',
            name: 'Collection Framework',
            beginner: [
{
                content: `<h3>What is Collection Framework?</h3>
A <strong>Collection Framework</strong> is a unified architecture that provides a set of classes and interfaces to store, manipulate, and retrieve groups of objects efficiently. In simple terms: <strong>Framework = Classes + Interfaces</strong>.<br>
<br>
<h4>Why Do We Need Collections?</h4>
In Java, arrays have several limitations:<br>
<br>
<ul>
<li><strong>Fixed Size</strong> - Once an array is created, its size cannot be changed. You must know the size in advance, which can lead to wasted memory or insufficient space.</li>
<li><strong>Homogeneous</strong> - Arrays can only store elements of the same data type. You cannot mix different types in a single array.</li>
<li><strong>No Readymade Methods</strong> - Arrays do not provide built-in methods for common operations like sorting, searching, or removing elements.</li>
</ul>
<br>
<h4>Differences Between Array and Collection</h4>
<br>
<ul>
<li><strong>Size:</strong> Arrays are fixed size; Collections are growable (dynamic size).</li>
<li><strong>Data Types:</strong> Arrays are homogeneous; Collections can hold heterogeneous objects.</li>
<li><strong>Methods:</strong> Arrays have no readymade methods; Collections provide readymade methods (add, remove, contains, sort, etc.).</li>
<li><strong>Primitives:</strong> Arrays can hold primitives; Collections can only hold objects (use wrapper classes for primitives).</li>
<li><strong>Memory:</strong> Arrays may waste memory; Collections manage memory dynamically.</li>
</ul>
<br>
<h4>Collection Hierarchy</h4>
The Collection Framework has a well-defined hierarchy:<br>
<br>
<ul>
<li><strong>Iterable(I)</strong> - Root interface</li>
</ul>
&nbsp;&nbsp;• <strong>Collection(I)</strong> - Extends Iterable<br>
&nbsp;&nbsp;&nbsp;&nbsp;• <strong>List(I)</strong> - Ordered, allows duplicates (ArrayList, LinkedList, Vector, Stack)<br>
&nbsp;&nbsp;&nbsp;&nbsp;• <strong>Set(I)</strong> - Unordered, no duplicates (HashSet, LinkedHashSet, TreeSet)<br>
&nbsp;&nbsp;&nbsp;&nbsp;• <strong>Queue(I)</strong> - FIFO ordering (PriorityQueue, Deque)<br>
<br>
<ul>
<li><strong>Map(I)</strong> - Separate hierarchy, key-value pairs (HashMap, LinkedHashMap, TreeMap, Hashtable)</li>
</ul>`
              },
              {
                content: `<h4>The 9 Key Interfaces of the Collection Framework</h4>
The framework is built around 9 core interfaces: <strong>Collection</strong>, <strong>List</strong>, <strong>Set</strong>, <strong>SortedSet</strong>, <strong>NavigableSet</strong>, <strong>Queue</strong>, <strong>Map</strong>, <strong>SortedMap</strong>, and <strong>NavigableMap</strong>.<br>
<br>
<ul>
<li><strong>Collection</strong> is considered the <strong>root interface</strong> of the framework - it defines the most common methods applicable to any collection object (add, remove, size, etc.).</li>
<li>There is <strong>no concrete class that implements the Collection interface directly</strong> - you always work through one of its child interfaces (List, Set, Queue) and their implementing classes.</li>
</ul>`
              },
              {
                content: `<h4>Collection Framework Hierarchy at a Glance</h4>
A clean side-by-side view of every interface, its key implementing classes, and its defining behavior:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Interface</th><th style="text-align:left;">Extends</th><th style="text-align:left;">Implementing Classes</th><th style="text-align:left;">Order</th><th style="text-align:left;">Duplicates</th></tr>
<tr><td><strong>List</strong></td><td>Collection</td><td>ArrayList, LinkedList, Vector, Stack</td><td>Insertion order</td><td>Allowed</td></tr>
<tr><td><strong>Set</strong></td><td>Collection</td><td>HashSet, LinkedHashSet, TreeSet</td><td>No / insertion / sorted</td><td>Not allowed</td></tr>
<tr><td><strong>Queue</strong></td><td>Collection</td><td>PriorityQueue, ArrayDeque, LinkedList</td><td>FIFO (or priority)</td><td>Allowed</td></tr>
<tr><td><strong>Deque</strong></td><td>Queue</td><td>ArrayDeque, LinkedList</td><td>Both ends</td><td>Allowed</td></tr>
<tr><td><strong>Map</strong></td><td>(none - separate hierarchy)</td><td>HashMap, LinkedHashMap, TreeMap, Hashtable</td><td>Depends on impl.</td><td>Keys unique, values may repeat</td></tr>
</table>
<br>
<strong>Note:</strong> <strong>Map</strong> is deliberately NOT part of the Collection interface hierarchy - it stores key-value pairs rather than single elements, so its method contract (put/get by key) is fundamentally different from add/remove used by List, Set, and Queue.<br>`
              },
{
                content: `<h3>Iterable and Collection Interfaces</h3>
The <strong>Iterable</strong> interface is the root of the collection hierarchy. Any class that implements Iterable can be used with the enhanced for-each loop. It provides the <strong>iterator()</strong> method.<br>
<br>
<h4>Collection Interface Methods</h4>
The <strong>Collection</strong> interface extends Iterable and defines the most common operations for all collections:<br>
<br>
<ul>
<li><strong>add(Object o)</strong> - Adds an element to the collection</li>
<li><strong>addAll(Collection c)</strong> - Adds all elements from another collection</li>
<li><strong>remove(Object o)</strong> - Removes a single instance of the specified element</li>
<li><strong>removeAll(Collection c)</strong> - Removes all elements that are in the specified collection</li>
<li><strong>retainAll(Collection c)</strong> - Retains only elements that are in the specified collection</li>
<li><strong>clear()</strong> - Removes all elements from the collection</li>
<li><strong>contains(Object o)</strong> - Returns true if the collection contains the element</li>
<li><strong>containsAll(Collection c)</strong> - Returns true if the collection contains all elements of the specified collection</li>
<li><strong>isEmpty()</strong> - Returns true if the collection is empty</li>
<li><strong>size()</strong> - Returns the number of elements</li>
<li><strong>toArray()</strong> - Converts the collection to an array</li>
<li><strong>iterator()</strong> - Returns an Iterator over the elements</li>
</ul>
<br>
<h4>List Interface Specifics</h4>
The <strong>List</strong> interface extends Collection and represents an ordered collection (sequence). Key characteristics:<br>
<br>
<ul>
<li><strong>Ordered</strong> - Elements maintain their insertion order</li>
<li><strong>Allows Duplicates</strong> - Same element can appear multiple times</li>
<li><strong>Index-Based Access</strong> - Elements can be accessed by their integer index</li>
</ul>
<br>
<h4>Additional List Methods</h4>
<ul>
<li><strong>get(int index)</strong> - Returns element at specified index</li>
<li><strong>set(int index, Object o)</strong> - Replaces element at specified index</li>
<li><strong>indexOf(Object o)</strong> - Returns first occurrence index, or -1</li>
<li><strong>lastIndexOf(Object o)</strong> - Returns last occurrence index, or -1</li>
<li><strong>listIterator()</strong> - Returns a ListIterator for bidirectional traversal</li>
<li><strong>subList(int from, int to)</strong> - Returns a view of the portion between from (inclusive) and to (exclusive)</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class CollectionMethodsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Collection<String> c = new ArrayList<>();

        // add elements
        c.add("Java");
        c.add("Python");
        c.add("C++");
        System.out.println("Collection: " + c);

        // contains
        System.out.println("Contains Java? " + c.contains("Java"));

        // size and isEmpty
        System.out.println("Size: " + c.size());
        System.out.println("Is Empty? " + c.isEmpty());

        // remove
        c.remove("C++");
        System.out.println("After remove: " + c);

        // toArray
        Object[] arr = c.toArray();
        System.out.println("Array length: " + arr.length);

        // iterator
        Iterator<String> it = c.iterator();
        while (it.hasNext()) {
            System.out.println("Element: " + it.next());
        }

        // clear
        c.clear();
        System.out.println("After clear, isEmpty: " + c.isEmpty());
    }
}`
                ]
              },
              {
                content: `<h3>Queue and Deque Interfaces</h3>
The <strong>Queue</strong> interface extends Collection and represents a collection designed for holding elements prior to processing, typically in <strong>FIFO (First-In-First-Out)</strong> order.<br>
<br>
<h4>Key Queue Methods (Pairs That Behave Differently on Failure)</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Operation</th><th style="text-align:left;">Throws Exception</th><th style="text-align:left;">Returns Special Value</th></tr>
<tr><td>Insert</td><td><strong>add(e)</strong></td><td><strong>offer(e)</strong></td></tr>
<tr><td>Remove</td><td><strong>remove()</strong></td><td><strong>poll()</strong></td></tr>
<tr><td>Examine</td><td><strong>element()</strong></td><td><strong>peek()</strong></td></tr>
</table>
<br>
<h4>Deque (Double-Ended Queue)</h4>
<strong>Deque</strong> extends Queue and allows insertion/removal from <strong>both ends</strong> - front and rear. It can be used as both a <strong>Queue</strong> (FIFO) and a <strong>Stack</strong> (LIFO). <strong>ArrayDeque</strong> is the recommended, faster, non-synchronized replacement for the legacy <strong>Stack</strong> class.<br>
<br>
<ul>
<li><strong>addFirst(e) / addLast(e)</strong> - Insert at front / rear</li>
<li><strong>removeFirst() / removeLast()</strong> - Remove from front / rear</li>
<li><strong>peekFirst() / peekLast()</strong> - Examine front / rear without removing</li>
<li><strong>push(e) / pop()</strong> - Stack-style operations (both act on the front)</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class QueueDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Queue<String> queue = new LinkedList<>();

        // Insert - offer() is preferred (doesn't throw on failure)
        queue.offer("Task1");
        queue.offer("Task2");
        queue.offer("Task3");
        System.out.println("Queue: " + queue);

        // Examine head without removing
        System.out.println("Peek: " + queue.peek());    // Task1

        // Remove and process in FIFO order
        System.out.println("Poll: " + queue.poll());     // Task1
        System.out.println("After poll: " + queue);      // [Task2, Task3]

        // PriorityQueue - orders by natural ordering, not insertion order
        Queue<Integer> pq = new PriorityQueue<>();
        pq.offer(30);
        pq.offer(10);
        pq.offer(20);
        System.out.println("PriorityQueue poll order: " + pq.poll() + ", " + pq.poll() + ", " + pq.poll());
        // 10, 20, 30 - smallest first, regardless of insertion order
    }
}`,
                  `import java.util.*;

public class DequeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Deque<Integer> deque = new ArrayDeque<>();

        // Insert at both ends
        deque.addFirst(10);
        deque.addLast(20);
        deque.addFirst(5);
        deque.addLast(25);
        System.out.println("Deque: " + deque);    // [5, 10, 20, 25]

        // Use as a Stack (LIFO) - push/pop act on the front
        deque.push(1);
        System.out.println("After push(1): " + deque);    // [1, 5, 10, 20, 25]
        System.out.println("pop(): " + deque.pop());        // 1

        // Use as a Queue (FIFO)
        System.out.println("pollFirst(): " + deque.pollFirst());    // 5
        System.out.println("pollLast(): " + deque.pollLast());      // 25
        System.out.println("Final Deque: " + deque);    // [10, 20]
    }
}`
                ]
              },
{
                content: `<h3>Iterator vs ListIterator</h3>
Java provides different cursor types for traversing collections. Understanding their differences is critical for advanced usage.<br>
<br>
<h4>Iterator</h4>
<ul>
<li>Can traverse any Collection (List, Set, Queue)</li>
<li>Supports only <strong>forward direction</strong> traversal</li>
<li>Methods: <strong>hasNext()</strong>, <strong>next()</strong>, <strong>remove()</strong></li>
<li>Obtained via <strong>collection.iterator()</strong></li>
</ul>
<br>
<h4>ListIterator</h4>
<ul>
<li>Can only traverse <strong>List</strong> objects</li>
<li>Supports <strong>bidirectional</strong> traversal (forward and backward)</li>
<li>Methods: <strong>hasNext()</strong>, <strong>next()</strong>, <strong>hasPrevious()</strong>, <strong>previous()</strong>, <strong>nextIndex()</strong>, <strong>previousIndex()</strong>, <strong>remove()</strong>, <strong>set()</strong>, <strong>add()</strong></li>
<li>Obtained via <strong>list.listIterator()</strong></li>
</ul>
<br>
<h4>Cursor Types in Java</h4>
<br>
<ul>
<li><strong>Enumeration</strong> - Legacy cursor for Vector. Methods: hasMoreElements(), nextElement(). Read-only, forward-only.</li>
<li><strong>Iterator</strong> - Universal cursor for any Collection. Forward-only. Supports remove operation.</li>
<li><strong>ListIterator</strong> - Most powerful cursor but only for Lists. Bidirectional. Supports add, set, and remove.</li>
</ul>
<br>
<h4>Fail-Fast vs Fail-Safe Iterators</h4>
<br>
<ul>
<li><strong>Fail-Fast Iterators</strong>: Immediately throw <strong>ConcurrentModificationException</strong> if the collection is structurally modified after the iterator is created (except through the iterator's own methods). Examples: iterators of ArrayList, HashMap, HashSet. They work on the original collection.</li>
<li><strong>Fail-Safe Iterators</strong>: Do NOT throw ConcurrentModificationException. <strong>CopyOnWriteArrayList</strong> iterates a frozen <strong>snapshot</strong> taken when the iterator was created, so later changes are invisible to it. <strong>ConcurrentHashMap</strong> is different: its iterators are <strong>weakly consistent</strong> - they traverse the live table and MAY reflect updates made after creation, they simply never throw.</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class IteratorVsListIterator { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<String> list = new ArrayList<>();
        list.add("A");
        list.add("B");
        list.add("C");
        list.add("D");

        // Iterator - forward only
        System.out.println("--- Iterator (Forward Only) ---");
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }

        // ListIterator - bidirectional
        System.out.println("--- ListIterator (Forward) ---");
        ListIterator<String> lit = list.listIterator();
        while (lit.hasNext()) {
            System.out.println("Index " + lit.nextIndex() + ": " + lit.next());
        }

        System.out.println("--- ListIterator (Backward) ---");
        while (lit.hasPrevious()) {
            System.out.println("Index " + lit.previousIndex() + ": " + lit.previous());
        }

        // ListIterator - add and set
        lit = list.listIterator();
        while (lit.hasNext()) {
            String val = lit.next();
            if (val.equals("B")) {
                lit.set("B-Modified");   // replace current
                lit.add("B2-Inserted");  // insert after current
            }
        }
        System.out.println("After modifications: " + list);

        // Fail-Fast example
        try {
            Iterator<String> it2 = list.iterator();
            list.add("E"); // structural modification
            it2.next();    // throws ConcurrentModificationException
        } catch (ConcurrentModificationException e) {
            System.out.println("Fail-Fast: ConcurrentModificationException caught!");
        }
    }
}`
                ]
              },
              {
                content: `<h3>Collection Interface vs Collections Utility Class</h3>
One of the most common points of confusion for beginners: <strong>Collection</strong> (singular, an interface) and <strong>Collections</strong> (plural, a final utility class) are two completely different things that just happen to share a similar name.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Collection (interface)</th><th style="text-align:left;">Collections (class)</th></tr>
<tr><td>Root <strong>interface</strong> of the framework</td><td><strong>final utility class</strong> in java.util</td></tr>
<tr><td>Defines instance methods like add(), remove()</td><td>Provides only <strong>static</strong> helper methods</td></tr>
<tr><td>Implemented by ArrayList, HashSet, etc.</td><td>Operates ON a collection passed as an argument</td></tr>
<tr><td>Represents an actual group of objects</td><td>Cannot be instantiated (private constructor)</td></tr>
</table>
<br>
<h4>Commonly Used Collections Utility Methods</h4>
<br>
<ul>
<li><strong>Collections.sort(list)</strong> - Sorts in natural order (or with a Comparator)</li>
<li><strong>Collections.reverse(list)</strong> - Reverses the order of elements</li>
<li><strong>Collections.shuffle(list)</strong> - Randomly shuffles elements</li>
<li><strong>Collections.max(coll) / Collections.min(coll)</strong> - Finds the largest/smallest element</li>
<li><strong>Collections.unmodifiableList(list)</strong> - Returns a read-only view of the list</li>
<li><strong>Collections.synchronizedList(list)</strong> - Returns a thread-safe wrapper</li>
<li><strong>Collections.emptyList() / emptySet() / emptyMap()</strong> - Returns an immutable empty collection</li>
<li><strong>Collections.frequency(coll, obj)</strong> - Counts how many times an element occurs</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class CollectionsUtilityDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<Integer> numbers = new ArrayList<>(List.of(5, 3, 8, 1, 9, 3));

        System.out.println("Original: " + numbers);

        Collections.sort(numbers);
        System.out.println("Sorted: " + numbers);

        Collections.reverse(numbers);
        System.out.println("Reversed: " + numbers);

        System.out.println("Max: " + Collections.max(numbers));
        System.out.println("Min: " + Collections.min(numbers));
        System.out.println("Frequency of 3: " + Collections.frequency(numbers, 3));

        // Immutable/read-only view
        List<Integer> readOnly = Collections.unmodifiableList(numbers);
        try {
            readOnly.add(100);    // throws UnsupportedOperationException
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify unmodifiableList!");
        }

        // Thread-safe wrapper
        List<Integer> safeList = Collections.synchronizedList(numbers);
        System.out.println("Synchronized wrapper size: " + safeList.size());
    }
}`
                ]
              },
              {
                content: `<h3>Choosing the Right Collection</h3>
A quick decision guide for picking the correct collection type based on the requirement:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Requirement</th><th style="text-align:left;">Best Choice</th><th style="text-align:left;">Why</th></tr>
<tr><td>Fast random access by index</td><td><strong>ArrayList</strong></td><td>Backed by array, O(1) get()</td></tr>
<tr><td>Frequent insert/delete in the middle</td><td><strong>LinkedList</strong></td><td>O(1) relink once you hold the node - but add(int,E)/remove(int) must traverse first, so the whole operation is O(n)</td></tr>
<tr><td>Thread-safe list</td><td><strong>Vector</strong> or <strong>Collections.synchronizedList()</strong></td><td>Synchronized access</td></tr>
<tr><td>LIFO stack behavior</td><td><strong>ArrayDeque</strong> (preferred over Stack)</td><td>Faster, not synchronized, purpose-built</td></tr>
<tr><td>No duplicates, order doesn't matter</td><td><strong>HashSet</strong></td><td>O(1) add/contains</td></tr>
<tr><td>No duplicates, preserve insertion order</td><td><strong>LinkedHashSet</strong></td><td>Hash table + linked list</td></tr>
<tr><td>No duplicates, need sorted order</td><td><strong>TreeSet</strong></td><td>Red-Black tree, always sorted</td></tr>
<tr><td>Key-value lookup, order doesn't matter</td><td><strong>HashMap</strong></td><td>O(1) average get/put</td></tr>
<tr><td>Key-value lookup, sorted by key</td><td><strong>TreeMap</strong></td><td>Red-Black tree, sorted keys</td></tr>
<tr><td>FIFO processing / task queue</td><td><strong>ArrayDeque</strong> or <strong>LinkedList</strong></td><td>Implements Queue naturally</td></tr>
<tr><td>Process by priority, not insertion order</td><td><strong>PriorityQueue</strong></td><td>Min-heap, orders by natural/Comparator order</td></tr>
<tr><td>Thread-safe Map for concurrent access</td><td><strong>ConcurrentHashMap</strong></td><td>Segment-level locking, high concurrency</td></tr>
</table>`
              }
            ]
          }
        ]
      },

      // ===== SubTopic 2: List Interface =====
      {
        id: 'list',
        name: 'List Interface',
        topics: [

          // ----- ArrayList -----
          {
            id: 'arraylist',
            name: 'ArrayList',
            beginner: [
{
                content: `<h3>ArrayList - Core Points</h3>
<ul>
<li>The <strong>ArrayList (C)</strong> extends the <strong>AbstractList (C)</strong> &amp; implements the <strong>List interface (I)</strong>.</li>
<li>It uses a <strong>Dynamic Array</strong> to store <strong>duplicate elements of different data types</strong>.</li>
<li>It is like an array, but there is <strong>no size limit</strong>. We can add or remove elements anytime. So, it is much more flexible than the traditional array.</li>
<li>It is found in the <strong>java.util</strong> package.</li>
<li><strong>Duplicate Element</strong> =&gt; Allowed.</li>
<li>It maintains the <strong>insertion order</strong>. (Insertion order =&gt; preserved / maintain)</li>
<li>It is <strong>non-synchronized</strong> so no thread safety.</li>
<li><strong>Heterogeneous Objects</strong> =&gt; Allowed.</li>
<li><strong>Null insertion</strong> =&gt; Possible. (we can add n number of null values in arraylist)</li>
<li>The elements stored in the ArrayList (C) can be <strong>randomly accessed</strong>, because array works at the index basis.</li>
</ul>
<h4>ArrayList Class Hierarchy</h4>
<br>
<div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:8px 4px; width:100%; font-size:12px; line-height:1.25;">
<div style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:5px; padding:3px 8px; text-align:center; line-height:1.25;"><strong style="font-size:12px; padding:0 5px;">Iterable</strong><br><span style="font-size:11px;">(I)</span></div>
<div style="display:inline-flex; align-items:center; gap:4px;"><span style="font-size:11px; color:#3b6e3b; white-space:nowrap;">&larr; extends</span><div style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:5px; padding:3px 8px; text-align:center; line-height:1.25;"><strong style="font-size:12px; padding:0 5px;">Collection</strong><br><span style="font-size:11px;">(I)</span></div></div>
<div style="display:inline-flex; align-items:center; gap:4px;"><span style="font-size:11px; color:#3b6e3b; white-space:nowrap;">&larr; extends</span><div style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:5px; padding:3px 8px; text-align:center; line-height:1.25;"><strong style="font-size:12px; padding:0 5px;">List</strong><br><span style="font-size:11px;">(I)</span></div></div>
<div style="display:inline-flex; align-items:center; gap:4px;"><span style="font-size:11px; color:#b5651d; white-space:nowrap;">&larr; implements</span><div style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:5px; padding:3px 8px; text-align:center; line-height:1.25;"><strong style="font-size:12px; padding:0 5px;">AbstractList</strong><br><span style="font-size:11px;">(c)</span></div></div>
<div style="display:inline-flex; align-items:center; gap:4px;"><span style="font-size:11px; color:#3b6e3b; white-space:nowrap;">&larr; extends</span><div style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:5px; padding:3px 8px; text-align:center; line-height:1.25;"><strong style="font-size:12px; padding:0 5px;">ArrayList</strong><br><span style="font-size:11px;">(c)</span></div></div>
</div>
<br>
<h4>ArrayList Cannot Hold Primitive Types</h4>
<br>
<table style="width:100%; border-collapse:collapse;">
<tr><td style="background:#eaf3fb; padding:10px; font-family:monospace;">ArrayList&lt;int&gt; al = new ArrayList&lt;int&gt;();</td><td style="background:#eaf3fb; padding:10px; color:#c0392b;"><strong>// =&gt; Does Not Work</strong></td></tr>
<tr><td style="background:#eaf3fb; padding:10px; font-family:monospace;">ArrayList&lt;Integer&gt; al = new ArrayList&lt;Integer&gt;();</td><td style="background:#eaf3fb; padding:10px; color:#27ae60;"><strong>// =&gt; Works Fine</strong></td></tr>
</table>
<br>
We can't create an ArrayList of the primitive types, such as int, float, char, etc. It is required to use the required wrapper class in such cases.<br>`
              },
              {
                content: `<h3>ArrayList</h3>
<strong>ArrayList</strong> is a class that extends <strong>AbstractList</strong> and implements the <strong>List</strong> interface. It is found in the <strong>java.util</strong> package. Internally, ArrayList uses a <strong>dynamic array</strong> (resizable array) to store elements, so there is no fixed size limit.<br>
<br>
<h4>Key Features of ArrayList</h4>
<br>
<ul>
<li><strong>Duplicates Allowed</strong> - You can add the same element multiple times.</li>
<li><strong>Insertion Order Maintained</strong> - Elements are stored in the order they are inserted.</li>
<li><strong>Non-Synchronized</strong> - ArrayList is not thread-safe by default. Multiple threads can access it simultaneously.</li>
<li><strong>Heterogeneous Objects Allowed</strong> - Without generics, you can store objects of different types.</li>
<li><strong>Null Insertion Possible</strong> - You can add null values to an ArrayList.</li>
<li><strong>Random Access</strong> - ArrayList implements the RandomAccess interface, making get operations very fast (O(1)).</li>
<li><strong>Best for Retrieval</strong> - Due to index-based access, retrieval is very efficient.</li>
</ul>
<br>
<h4>Advantages of ArrayList</h4>
<br>
<ul>
<li><strong>Easy to learn and use</strong></li>
<li><strong>Reduces programming effort</strong></li>
<li><strong>Increases program speed and quality</strong></li>
<li><strong>Faster software reuse</strong></li>
</ul>`,
                codeExamples: [
                  `import java.util.ArrayList;

public class ArrayListBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> list = new ArrayList<>(); // creates an empty ArrayList named list

        // Adding elements
        list.add("Java");
        list.add("Python");
        list.add("C++");
        list.add("Java");  // duplicate allowed
        list.add(null);     // null allowed

        System.out.println("ArrayList: " + list);
        System.out.println("Size: " + list.size());

        // Accessing elements
        System.out.println("Element at index 1: " + list.get(1));

        // Modifying elements
        list.set(2, "JavaScript"); // replaces the third element (index 2)
        System.out.println("After set: " + list);

        // Removing elements
        list.remove("Java");  // removes first occurrence
        list.remove(0);       // removes by index
        System.out.println("After remove: " + list);

        // Checking elements
        System.out.println("Contains Python? " + list.contains("Python"));
    }
}`
                ]
              },
              {
                content: `<h3>Java ArrayList Methods - Quick Reference Table</h3>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Method</th><th style="text-align:left;">Description</th><th style="text-align:left;">Return Type</th></tr>
<tr><td><strong>add()</strong></td><td>Add an item to the list</td><td>boolean | void</td></tr>
<tr><td><strong>addAll()</strong></td><td>Add a collection of items to the list</td><td>boolean</td></tr>
<tr><td><strong>clear()</strong></td><td>Remove all items from the list</td><td>void</td></tr>
<tr><td><strong>clone()</strong></td><td>Create a copy of the ArrayList</td><td>Object</td></tr>
<tr><td><strong>contains()</strong></td><td>Checks whether an item exists in the list</td><td>boolean</td></tr>
<tr><td><strong>ensureCapacity()</strong></td><td>Increase the capacity of the list to be able to fit a specified number of items</td><td>void</td></tr>
<tr><td><strong>forEach()</strong></td><td>Perform an action on every item in the list</td><td>void</td></tr>
<tr><td><strong>get()</strong></td><td>Return the item at a specific position in the list</td><td>T</td></tr>
<tr><td><strong>indexOf()</strong></td><td>Return the position of the first occurrence of an item in the list</td><td>int</td></tr>
<tr><td><strong>isEmpty()</strong></td><td>Checks whether the list is empty</td><td>boolean</td></tr>
<tr><td><strong>iterator()</strong></td><td>Return an Iterator object for the ArrayList</td><td>Iterator</td></tr>
<tr><td><strong>lastIndexOf()</strong></td><td>Return the position of the last occurrence of an item in the list</td><td>int</td></tr>
<tr><td><strong>listIterator()</strong></td><td>Return a ListIterator object for the ArrayList</td><td>ListIterator</td></tr>
<tr><td><strong>remove()</strong></td><td>Remove an item from the list</td><td>boolean | T</td></tr>
<tr><td><strong>removeAll()</strong></td><td>Remove a collection of items from the list</td><td>boolean</td></tr>
<tr><td><strong>removeIf()</strong></td><td>Remove all items from the list which meet a specified condition</td><td>boolean</td></tr>
<tr><td><strong>replaceAll()</strong></td><td>Replace each item in the list with the result of an operation on that item</td><td>void</td></tr>
<tr><td><strong>retainAll()</strong></td><td>Remove all elements from the list which do not belong to a specified collection</td><td>boolean</td></tr>
<tr><td><strong>set()</strong></td><td>Replace an item at a specified position in the list</td><td>T</td></tr>
<tr><td><strong>size()</strong></td><td>Return the number of items in the list</td><td>int</td></tr>
<tr><td><strong>sort()</strong></td><td>Sort the list</td><td>void</td></tr>
<tr><td><strong>spliterator()</strong></td><td>Return a Spliterator object for the ArrayList</td><td>Spliterator</td></tr>
<tr><td><strong>subList()</strong></td><td>Return a sublist which provides access to a range of this list's items</td><td>List</td></tr>
<tr><td><strong>toArray()</strong></td><td>Return an array containing the list's items</td><td>Object[]</td></tr>
<tr><td><strong>trimToSize()</strong></td><td>Reduce the capacity of the list to match the number of items if necessary</td><td>void</td></tr>
</table>`
              },
              {
                content: `<h3>Java ArrayList Methods - One Program Per Method</h3>
A separate, minimal, runnable example for every single method in the reference table above.<br>`,
                codeExamples: [
                  `// Java ArrayList add() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListAddDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> names = new ArrayList<String>(); // creates an empty ArrayList named names
        names.add("Sheru");
        names.add("Pankaj");
        names.add("Dheeraj");
        names.add("Meena");
        System.out.println(names);
    }
}
// OUTPUT: [Sheru, Pankaj, Dheeraj, Meena]`,
                  `// Java ArrayList addAll() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListAddAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        ArrayList<String> brands = new ArrayList<String>(); // creates an empty ArrayList named brands
        brands.add("Microsoft");
        brands.add("W3Schools");
        brands.add("Apple");

        brands.addAll(cars);

        System.out.println(brands);
    }
}
// OUTPUT: [Microsoft, W3Schools, Apple, Volvo, BMW, Ford, Mazda]`,
                  `// Java ArrayList clear() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListClearDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        cars.clear();
        System.out.println(cars);
    }
}
// OUTPUT: []`,
                  `// Java ArrayList clone() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListCloneDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        ArrayList<String> cars2 = (ArrayList<String>) cars.clone();
        cars2.set(0, "Toyota"); // replaces the first element (index 0)

        System.out.println(cars);
        System.out.println(cars2);
    }
}
// OUTPUT:
// [Volvo, BMW, Ford, Mazda]
// [Toyota, BMW, Ford, Mazda]`,
                  `// Java ArrayList contains() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListContainsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        System.out.println(cars.contains("BMW"));
        System.out.println(cars.contains("Toyota"));
    }
}
// OUTPUT:
// true
// false`,
                  `// Java ArrayList ensureCapacity() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListEnsureCapacityDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> list = new ArrayList<Integer>(); // creates an empty ArrayList named list
        list.ensureCapacity(15);
        for (int i = 1; i <= 15; i++) {
            list.add(i);
        }
        System.out.println(list);
    }
}
// OUTPUT: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]`,
                  `// Java ArrayList forEach() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListForEachDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> al = new ArrayList<Integer>(); // creates an empty ArrayList named al
        al.add(5);
        al.add(9);
        al.add(8);
        al.add(1);

        // Using Lambda Expression
        al.forEach((n) -> {
            System.out.println(n);
        });

        // Using Lambda Expression and method reference
        al.forEach(System.out::println);
    }
}
// OUTPUT:
// 5
// 9
// 8
// 1
// 5
// 9
// 8
// 1`,
                  `// Java ArrayList get() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListGetDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        System.out.println(cars.get(0));
    }
}
// OUTPUT: Volvo`,
                  `// Java ArrayList indexOf() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListIndexOfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        System.out.println(cars.indexOf("Ford"));
    }
}
// OUTPUT: 2`,
                  `// Java ArrayList isEmpty() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListIsEmptyDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        System.out.println(cars.isEmpty());

        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        System.out.println(cars.isEmpty());
    }
}
// OUTPUT:
// true
// false`,
                  `// Java ArrayList iterator() Method
package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListIteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Make a collection
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        // Get the iterator
        Iterator<String> it = cars.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }
    }
}
// OUTPUT:
// Volvo
// BMW
// Ford
// Mazda`,
                  `// Java ArrayList lastIndexOf() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListLastIndexOfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("Ford");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        System.out.println(cars.indexOf("Ford"));
        System.out.println(cars.lastIndexOf("Ford"));
    }
}
// OUTPUT:
// 1
// 3`,
                  `// Java ArrayList listIterator() Method
package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.ListIterator;

public class ArrayListListIteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Make a collection
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        // Get the iterator
        ListIterator<String> it = cars.listIterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }
        System.out.println("---");

        // Loop backwards through the list
        while (it.hasPrevious()) {
            System.out.println(it.previous());
        }
    }
}
// OUTPUT:
// Volvo
// BMW
// Ford
// Mazda
// ---
// Mazda
// Ford
// BMW
// Volvo`,
                  `// Java ArrayList remove() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListRemoveDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        cars.remove(0); // removes the first element (index 0)
        System.out.println(cars);
    }
}
// OUTPUT: [BMW, Ford, Mazda]`,
                  `// Java ArrayList removeAll() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListRemoveAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        cars.add("Toyota");
        cars.removeAll(cars);
        System.out.println(cars);
    }
}
// OUTPUT: []`,
                  `// Java ArrayList removeIf() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListRemoveIfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> numbers = new ArrayList<Integer>(); // creates an empty ArrayList named numbers
        numbers.add(5);
        numbers.add(9);
        numbers.add(8);
        numbers.add(6);
        numbers.add(1);
        numbers.removeIf(n -> n % 2 == 0);
        System.out.println(numbers);
    }
}
// OUTPUT: [5, 9, 1]`,
                  `// Java ArrayList replaceAll() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListReplaceAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> numbers = new ArrayList<Integer>(); // creates an empty ArrayList named numbers
        numbers.add(5);
        numbers.add(9);
        numbers.add(8);
        numbers.add(6);
        numbers.add(1);
        numbers.replaceAll(n -> n + 1);
        System.out.println(numbers);
    }
}
// OUTPUT: [6, 10, 9, 7, 2]`,
                  `// Java ArrayList retainAll() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListRetainAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        cars.add("Toyota");

        ArrayList<String> valid = new ArrayList<String>(); // creates an empty ArrayList named valid
        valid.add("Volvo");
        valid.add("Ford");
        valid.add("Mazda");

        cars.retainAll(valid);

        System.out.println(cars);
    }
}
// OUTPUT: [Volvo, Ford, Mazda]`,
                  `// Java ArrayList set() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListSetDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        cars.set(0, "Opel"); // replaces the first element (index 0)
        System.out.println(cars);
    }
}
// OUTPUT: [Opel, BMW, Ford, Mazda]`,
                  `// Java ArrayList size() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListSizeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        System.out.println(cars.size());
    }
}
// OUTPUT: 4`,
                  `// Java ArrayList sort() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListSortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        cars.sort(null);
        System.out.println(cars);
    }
}
// OUTPUT: [BMW, Ford, Mazda, Volvo]`,
                  `// Java ArrayList spliterator() Method
package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Spliterator;

public class ArrayListSpliteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Make a collection
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        // Get the spliterator and split it
        Spliterator<String> it1 = cars.spliterator();
        Spliterator<String> it2 = it1.trySplit();

        // Loop through the first spliterator
        System.out.println("First spliterator");
        while (it1.tryAdvance((n) -> System.out.println(n)));

        // Loop through the second spliterator
        System.out.println("Second spliterator");
        while (it2.tryAdvance((n) -> System.out.println(n)));
    }
}
// OUTPUT:
// First spliterator
// Ford
// Mazda
// Second spliterator
// Volvo
// BMW`,
                  `// Java ArrayList subList() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListSubListDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        System.out.println(cars.subList(1, 3));
    }
}
// OUTPUT: [BMW, Ford]`,
                  `// Java ArrayList toArray() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListToArrayDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        Object[] carsArray = cars.toArray();

        for (Object item : carsArray) {
            System.out.println(item);
        }
    }
}
// OUTPUT:
// Volvo
// BMW
// Ford
// Mazda`,
                  `// Java ArrayList trimToSize() Method
package com.javaschoollab.demo;

import java.util.ArrayList;

public class ArrayListTrimToSizeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<String>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        cars.trimToSize();
        System.out.println(cars);
    }
}
// OUTPUT: [Volvo, BMW, Ford, Mazda]`
                ]
              },
              {
                content: `<h4>More Built-in ArrayList Methods</h4>
Beyond add/get/set/remove, ArrayList provides several other ready-made methods worth knowing:<br>
<br>
<ul>
<li><strong>clone()</strong> - Creates a shallow copy of the ArrayList.</li>
<li><strong>ensureCapacity(int)</strong> - Increases the internal array's capacity ahead of time, to avoid repeated resizing.</li>
<li><strong>trimToSize()</strong> - Shrinks the internal array's capacity down to match the current number of elements.</li>
<li><strong>sort()</strong> / <strong>Collections.sort()</strong> - Sorts the list (natural order, or with a custom Comparator).</li>
<li><strong>subList(from, to)</strong> - Returns a view of a portion of the list between the given indices.</li>
<li><strong>toArray()</strong> - Converts the ArrayList into an array.</li>
<li><strong>addAll()</strong> - Appends all elements from another collection.</li>
<li><strong>Collections.synchronizedList()</strong> - Wraps a (non-thread-safe) ArrayList to get a thread-safe/synchronized view of it.</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class ArrayListMoreMethodsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        // clone()
        ArrayList<String> cars2 = (ArrayList<String>) cars.clone();
        System.out.println("Cloned: " + cars2);

        // ensureCapacity() / trimToSize()
        cars.ensureCapacity(15);
        cars.trimToSize();

        // sort() with natural order
        Collections.sort(cars);
        System.out.println("Sorted: " + cars);

        // sort() with a custom Comparator
        cars.sort(Comparator.reverseOrder());
        System.out.println("Reverse sorted: " + cars);

        // subList()
        System.out.println("Sublist(1,3): " + cars.subList(1, 3));

        // toArray()
        Object[] carsArray = cars.toArray();
        System.out.println("Array length: " + carsArray.length);

        // addAll()
        ArrayList<String> moreCars = new ArrayList<>(List.of("Tesla", "Honda"));
        cars.addAll(moreCars);
        System.out.println("After addAll: " + cars);

        // Collections.synchronizedList()
        List<String> synced = Collections.synchronizedList(cars);
        System.out.println("Synchronized view size: " + synced.size());
    }
}
// OUTPUT:
// Cloned: [Volvo, BMW, Ford, Mazda]
// Sorted: [BMW, Ford, Mazda, Volvo]
// Reverse sorted: [Volvo, Mazda, Ford, BMW]
// Sublist(1,3): [Mazda, Ford]
// Array length: 4
// After addAll: [Volvo, Mazda, Ford, BMW, Tesla, Honda]
// Synchronized view size: 6`
                ]
              },
              {
                content: `<h4>ArrayList Methods: removeIf(), replaceAll(), retainAll(), forEach()</h4>
These functional-style methods (added in Java 8) let you update or filter an ArrayList without writing an explicit loop.<br>
<br>
<ul>
<li><strong>removeIf(Predicate)</strong> - Removes all elements matching the given condition.</li>
<li><strong>replaceAll(UnaryOperator)</strong> - Replaces every element with the result of applying the given operation.</li>
<li><strong>retainAll(Collection)</strong> - Keeps only the elements that are also present in the given collection.</li>
<li><strong>forEach(Consumer)</strong> - Performs the given action for each element (lambda or method reference).</li>
<li><strong>lastIndexOf(Object)</strong> - Returns the index of the last occurrence of the element.</li>
<li><strong>listIterator()</strong> - Like iterator(), but can also move backward using hasPrevious()/previous().</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class ArrayListFunctionalMethods { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> numbers = new ArrayList<>(List.of(5, 9, 8, 6, 1));

        // removeIf() - remove all even numbers
        numbers.removeIf(n -> n % 2 == 0);
        System.out.println("After removeIf (even removed): " + numbers);

        // replaceAll() - add 1 to every element
        numbers.replaceAll(n -> n + 1);
        System.out.println("After replaceAll (+1): " + numbers);

        // retainAll() - keep only elements also present in another list
        ArrayList<String> cars = new ArrayList<>(List.of("Volvo", "BMW", "Ford", "Mazda", "Toyota"));
        ArrayList<String> valid = new ArrayList<>(List.of("Volvo", "Ford", "Mazda"));
        cars.retainAll(valid);
        System.out.println("After retainAll: " + cars);

        // forEach() with a lambda block
        cars.forEach((c) -> {
            System.out.println(c);
        });

        // forEach() with method reference
        cars.forEach(System.out::println);

        // lastIndexOf()
        ArrayList<String> repeated = new ArrayList<>(List.of("Volvo", "Ford", "BMW", "Ford", "Mazda"));
        System.out.println("indexOf Ford: " + repeated.indexOf("Ford"));
        System.out.println("lastIndexOf Ford: " + repeated.lastIndexOf("Ford"));

        // listIterator() - forward then backward
        ListIterator<String> it = repeated.listIterator();
        while (it.hasNext()) System.out.print(it.next() + " ");
        System.out.println();
        while (it.hasPrevious()) System.out.print(it.previous() + " ");
    }
}
// OUTPUT:
// After removeIf (even removed): [5, 9, 1]
// After replaceAll (+1): [6, 10, 2]
// After retainAll: [Volvo, Ford, Mazda]
// Volvo
// Ford
// Mazda
// indexOf Ford: 1
// lastIndexOf Ford: 3
// Volvo Ford BMW Ford Mazda
// Mazda Ford BMW Ford Volvo `
                ]
              },
              {
                content: `<h4>ArrayList: isEmpty(), clear(), removeAll()</h4>
<br>
<ul>
<li><strong>isEmpty()</strong> - Returns true if the ArrayList has no elements.</li>
<li><strong>clear()</strong> - Removes all elements from the ArrayList, leaving it empty.</li>
<li><strong>removeAll(Collection)</strong> - Removes from the ArrayList all elements that are also contained in the given collection (passing itself empties the whole list).</li>
</ul>`,
                codeExamples: [
                  `import java.util.ArrayList;

public class ArrayListEmptyClearDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<>(); // creates an empty ArrayList named cars
        System.out.println("isEmpty (before add): " + cars.isEmpty());    // true

        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");
        System.out.println("isEmpty (after add): " + cars.isEmpty());    // false

        // removeAll() - removes all elements found in the given collection
        cars.add("Toyota");
        cars.removeAll(cars);
        System.out.println("After removeAll(cars): " + cars);    // []

        // clear() - removes everything
        ArrayList<String> more = new ArrayList<>(); // creates an empty ArrayList named more
        more.add("Volvo");
        more.add("BMW");
        more.clear();
        System.out.println("After clear(): " + more);    // []
    }
}`
                ]
              },
{
                content: `<h3>Constructor</h3>
There are <strong>3 types</strong> of constructor as below.<br>
<br>
<strong>1. ArrayList al = new ArrayList();</strong><br>
<strong>ArrayList():</strong> It is used to build an empty array list. Create the empty array list with default initial capacity <strong>10</strong>. Once array list reaches its max capacity then new array list will be created with its new capacity.<br>
New Capacity = <strong>Current Capacity + (Current Capacity &gt;&gt; 1)</strong> - exactly 1.5x, so 10 grows to 15. (The old <em>+ 1</em> form was the Java 6 formula.)<br>
<br>
<strong>2. ArrayList al = new ArrayList(int initial_capacity);</strong><br>
<strong>ArrayList(int capacity):</strong> It is used to build an array list that has the specified initial capacity. Here we are passing the int type value.<br>
<br>
<strong>3. ArrayList al = new ArrayList(Collection c);</strong><br>
<strong>ArrayList(Collection&lt;? extends E&gt; c):</strong> It is used to build an array list that is initialized with the elements of the collection c. Here we are passing the objects.<br>
<br>
<table style="width:100%; border-collapse:collapse; margin-top:8px;">
<tr><td style="background:#eaf3ea; border:1px solid #9dc99d; border-radius:6px; padding:10px 14px;">ArrayList is the <strong style="color:#2e7d32;">Best Choice</strong> if our frequent operation is <strong>Retrieval Operation</strong>: It implements the random access interface.</td></tr>
<tr><td style="height:8px;"></td></tr>
<tr><td style="background:#fbeae5; border:1px solid #e0a898; border-radius:6px; padding:10px 14px;">ArrayList is the <strong style="color:#c0392b;">Worst Choice</strong> if our frequent operation is <strong>Insertion or Deletion</strong> (because several shift operations are required for this).</td></tr>
</table>`,
                codeExamples: [
                  `// Constructor 1: ArrayList al = new ArrayList();
import java.util.ArrayList;

public class DefaultConstructorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList al = new ArrayList();    // Default initial capacity = 10
        al.add(10);
        al.add(20);
        al.add(30);
        System.out.println("Empty ArrayList, then filled: " + al);
    }
}
// OUTPUT: Empty ArrayList, then filled: [10, 20, 30]`,
                  `// Constructor 2: ArrayList al = new ArrayList(int initial_capacity);
import java.util.ArrayList;

public class CapacityConstructorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> al = new ArrayList<>(20);    // Initial capacity = 20 (int passed)
        al.add(1);
        al.add(2);
        al.add(3);
        System.out.println("ArrayList with initial capacity 20: " + al);
    }
}
// OUTPUT: ArrayList with initial capacity 20: [1, 2, 3]`,
                  `// Constructor 3: ArrayList al = new ArrayList(Collection c);
import java.util.ArrayList;
import java.util.List;

public class CollectionConstructorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<String> source = List.of("Pankaj", "Udgir", "Latur");    // Objects passed here

        ArrayList<String> al = new ArrayList<>(source);    // Initialized from the given collection
        System.out.println("ArrayList built from Collection: " + al);
    }
}
// OUTPUT: ArrayList built from Collection: [Pankaj, Udgir, Latur]`
                ]
              },
              {
                content: `<h3>ArrayList Constructors and Internal Working</h3>
<br>
<ul>
<li><strong>ArrayList(C)</strong> extends <strong>AbstractList(C)</strong> &amp; implements <strong>List interface(I)</strong>.</li>
<li>Uses <strong>Dynamic Array</strong> to Store <strong>Duplicate elements</strong> of different data types.</li>
</ul>
<br>
<h4>Constructors</h4>
<br>
<ul>
<li><strong>Constructor 1:</strong> <code>ArrayList list = new ArrayList();</code> - Creates an empty ArrayList object with default initial capacity of <strong>10</strong>. New Capacity = Current Capacity + (Current Capacity &gt;&gt; 1), so 10 grows to 15.</li>
<li><strong>Constructor 2:</strong> <code>ArrayList list = new ArrayList(int initialCapacity);</code> - Creates an empty ArrayList object with the given initial capacity.</li>
<li><strong>Constructor 3:</strong> <code>ArrayList list = new ArrayList(Collection c);</code> - Creates an equivalent ArrayList object for the given collection.</li>
</ul>
<br>
<h4>Important Notes</h4>
<br>
<ul>
<li>We can't create an ArrayList of <strong>primitive types</strong> (int, float, char). We must use <strong>wrapper classes</strong> (Integer, Float, Character).</li>
<li>Manipulation is <strong>slower</strong> than LinkedList because a lot of shifting needs to occur when removing elements from the middle.</li>
</ul>
<br>
<h4>Iteration Methods</h4>
There are 3 ways to iterate over an ArrayList: Using Simple Way, Using Iterator() Method, and Using For Each Loop.<br>`,
                codeExamples: [
                  `package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListIterationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> arrayList = new ArrayList<Integer>(); // creates an empty ArrayList named arrayList
        arrayList.add(10);    // Index: 0
        arrayList.add(40);    // Index: 1
        arrayList.add(30);    // Index: 2
        arrayList.add(20);    // Index: 3
        System.out.println("Output is= " + arrayList);

        // 1st Way: Using Simple Way
        System.out.println("first way>>" + arrayList);

        // 2nd Way: Using Iterator() Method
        Iterator<Integer> itr = arrayList.iterator();
        while (itr.hasNext()) {
            System.out.println("second way-using iterator>>" + itr.next());
        }

        // 3rd Way: Using For Each Loop
        for (Integer xyz : arrayList) {
            System.out.println("third way-using for each loop>>" + xyz);
        }
    }
}
// OUTPUT:
// Output is= [10, 40, 30, 20]
// first way>>[10, 40, 30, 20]
// second way-using iterator>>10, 40, 30, 20   (insertion order - ArrayList never sorts)
// third way-using for each loop>>10, 40, 30, 20`
                ]
              },
              {
                content: `<h3>ArrayList with Heterogeneous Data</h3>
<br>
ArrayList can store <strong>heterogeneous objects</strong> (different data types) when using <code>ArrayList&lt;Object&gt;</code>. It also allows <strong>duplicate elements</strong> and <strong>null values</strong>.<br>
<br>
<h4>Key Operations Demonstrated</h4>
<br>
<ul>
<li>Adding different data types (Integer, String) to the same ArrayList.</li>
<li>Adding <strong>duplicate</strong> elements.</li>
<li>Adding <strong>null</strong> values.</li>
<li>Iterating using three different methods: Simple Object, Iterator, and For Each Loop.</li>
</ul>`,
                codeExamples: [
                  `package com.test;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListHeterogeneousDataDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Object> arrayList = new ArrayList<>(); // creates an empty ArrayList named arrayList
        arrayList.add(50);           // 0th Index
        arrayList.add("India");      // 1st Index
        arrayList.add(10);           // 2nd Index
        arrayList.add(50);           // 3rd Index - Duplicate
        arrayList.add(null);         // 4th Index - Null

        System.out.println("OUTPUT: " + arrayList);
        // OUTPUT: [50, India, 10, 50, null]

        // 1st Way: Using Simply Object
        System.out.println("Using Simply Object: " + arrayList);

        // 2nd Way: Using Iterator
        Iterator itr = arrayList.iterator();
        while (itr.hasNext()) {
            System.out.println("Using Iterator: " + itr.next());
        }

        // 3rd Way: Using For Each Loop
        for (Object obj : arrayList) {
            System.out.println("Using For Each Loop: " + obj);
        }
    }
}`
                ]
              },
              {
                content: `<h3>ArrayList of Integer Type - All 4 Ways to Iterate</h3>
<br>
The 4 standard ways to iterate an ArrayList, demonstrated together: <strong>Simple Way</strong> (print the object directly), <strong>Iterator</strong>, <strong>For-Each Loop</strong>, and <strong>Streams with Lambda Expression</strong> (JDK 8+).<br>`,
                codeExamples: [
                  `// Example: 01 => ( Only Integer )
package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListIntegerIterationDemo {    // Create Class
    public static void main(String[] args) {    // Main Method
        ArrayList<Integer> obj = new ArrayList<Integer>();    // Object Create & <Generic>
        // Adding Element
        obj.add(100);
        obj.add(50);
        obj.add(75);
        obj.add(30);
        obj.add(200);
        obj.add(200);    // Duplicate Elements are Allowed
        //-----------------------------------------------------------------
        // 1st Way: Using Simple Way
        System.out.println(obj);
        //-----------------------------------------------------------------
        // 2nd Way: Iterator & ref obj.iterator
        Iterator<Integer> itr = obj.iterator();
        while (itr.hasNext()) {    // Check: True & False
            System.out.println("Using For Iterator: " + itr.next());
        }
        //-----------------------------------------------------------------
        // 3rd Way: For Each Loop
        // Program for Design generic Arraylist for Integer type only using for each loop or for enhanced loop
        for (Object abc : obj) {
            System.out.println("Using For Each Loop: " + abc);
        }
        //-----------------------------------------------------------------
        // 4th Way: Using Streams and Lambda Expression
        obj.stream().forEach(e -> System.out.println("Using Stream and Lambda: " + e));
        //-----------------------------------------------------------------
    }
}
// OUTPUT:
// [100, 50, 75, 30, 200, 200]
// Using For Iterator: 100
// Using For Iterator: 50
// Using For Iterator: 75
// Using For Iterator: 30
// Using For Iterator: 200
// Using For Iterator: 200
// Using For Each Loop: 100
// Using For Each Loop: 50
// Using For Each Loop: 75
// Using For Each Loop: 30
// Using For Each Loop: 200
// Using For Each Loop: 200
// Using Stream and Lambda: 100
// Using Stream and Lambda: 50
// Using Stream and Lambda: 75
// Using Stream and Lambda: 30
// Using Stream and Lambda: 200
// Using Stream and Lambda: 200`
                ]
              },
              {
                content: `<h3>ArrayList Program for String Values (Colors)</h3>
<br>
Another simple ArrayList&lt;String&gt; example - storing a list of colors and iterating using Iterator.<br>`,
                codeExamples: [
                  `// 13. Arraylist program for String values
package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayList_Example { // class that holds the main method
    public static void main(String args[]) {
        ArrayList<String> al = new ArrayList<String>(); // creates an empty ArrayList named al
        al.add("Red");
        al.add("Green");
        al.add("Blue");
        al.add("Black");
        al.add("Magenta");
        al.add("Yellow");

        // By Using 1st Way: Using iterator Method
        Iterator<String> itr = al.iterator();
        System.out.println("The contents of the arraylist are:");
        while (itr.hasNext()) {
            System.out.println(itr.next());
        }
    }
}
// OUTPUT:
// The contents of the arraylist are:
// Red
// Green
// Blue
// Black
// Magenta
// Yellow`
                ]
              },
              {
                content: `<h3>ArrayList of Character and Boolean Types</h3>
<br>
ArrayList works the same way with any wrapper type. Below are examples using <strong>Character</strong> and <strong>Boolean</strong>, each demonstrated with all <strong>4 ways to iterate</strong>: Simple Way, Iterator, For-Each Loop, and <strong>Streams with Lambda Expression</strong> (JDK 8+).<br>`,
                codeExamples: [
                  `// Example: Only Character
package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListCharacterIterationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Character> obj = new ArrayList<>(); // creates an empty ArrayList named obj
        obj.add('P');
        obj.add('A');
        obj.add('N');
        obj.add('K');
        obj.add('A');    // Duplicate Elements are Allowed
        obj.add('J');

        // 1st Way: Using Simple Way
        System.out.println(obj);

        // 2nd Way: Iterator
        Iterator<Character> itr = obj.iterator();
        while (itr.hasNext()) {
            System.out.println("Using For Iterator: " + itr.next());
        }

        // 3rd Way: For Each Loop
        for (Character xyz : obj) {
            System.out.println("Using For Each Loop: " + xyz);
        }

        // 4th Way: Using Streams and Lambda Expression
        obj.stream().forEach(e -> System.out.println("Using Stream and Lambda: " + e));
    }
}
// OUTPUT:
// [P, A, N, K, A, J]`,
                  `// Example: Only Boolean
package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListBooleanIterationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Boolean> obj = new ArrayList<>(); // creates an empty ArrayList named obj
        obj.add(true);
        obj.add(false);
        obj.add(true);
        obj.add(false);
        obj.add(true);
        obj.add(false);    // Duplicate Elements are Allowed

        // 1st Way: Using Simple Way
        System.out.println(obj);

        // 2nd Way: Iterator
        Iterator<Boolean> itr = obj.iterator();
        while (itr.hasNext()) {
            System.out.println("Using For Iterator: " + itr.next());
        }

        // 3rd Way: For Each Loop
        for (Boolean o : obj) {
            System.out.println("Using For Each Loop: " + o);
        }

        // 4th Way: Using Streams and Lambda Expression
        obj.stream().forEach(e -> System.out.println("Using Stream and Lambda: " + e));
    }
}
// OUTPUT:
// [true, false, true, false, true, false]`
                ]
              },
              {
                content: `<h3>ArrayList of User-Defined Objects</h3>
<br>
Just like built-in types, an ArrayList can store instances of your own custom classes. This is one of the most common real-world uses of ArrayList - for example, storing a list of Employee, Student, or Product objects.<br>`,
                codeExamples: [
                  `import java.util.ArrayList;
import java.util.Iterator;

class Employee {
    int id;
    String name;
    String salary;

    public Employee(int id, String name, String salary) {
        this.id = id;
        this.name = name;
        this.salary = salary;
    }

    @Override
    public String toString() {
        return "Employee [id=" + id + ", name=" + name + ", salary=" + salary + "]";
    }
}

public class EmployeeListDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Employee> employees = new ArrayList<>(); // creates an empty ArrayList named employees
        employees.add(new Employee(20, "Rajaram", "25000"));
        employees.add(new Employee(30, "Sohan", "15000"));

        // Using Iterator
        Iterator<Employee> itr = employees.iterator();
        while (itr.hasNext()) {
            System.out.println("employee list>> " + itr.next());
        }

        // Using for-each loop
        for (Employee e : employees) {
            System.out.println("data is>> " + e);
        }
    }
}
// OUTPUT:
// employee list>> Employee [id=20, name=Rajaram, salary=25000]
// employee list>> Employee [id=30, name=Sohan, salary=15000]
// data is>> Employee [id=20, name=Rajaram, salary=25000]
// data is>> Employee [id=30, name=Sohan, salary=15000]`
                ]
              },
              {
                content: `<h3>Getting a Synchronized (Thread-Safe) ArrayList</h3>
<br>
By default, all ArrayList methods are <strong>non-synchronized</strong>, so it is not thread-safe. To get a synchronized version, wrap it using <code>Collections.synchronizedList()</code>. When iterating a synchronized list, always wrap the iteration in a <code>synchronized</code> block on the same list to avoid <strong>ConcurrentModificationException</strong> from concurrent structural changes.<br>`,
                codeExamples: [
                  `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SynchronizedArrayListExample { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> names = new ArrayList<>(); // creates an empty ArrayList named names
        names.add("Sheru");
        names.add("Dheeraj");
        names.add("Pankaj");

        // Get a synchronized (thread-safe) view of the ArrayList
        List<String> synchronizedList = Collections.synchronizedList(names);

        // Always synchronize manually while iterating
        synchronized (synchronizedList) {
            for (String item : synchronizedList) {
                System.out.println(item);
            }
        }
    }
}
// OUTPUT:
// Sheru
// Dheeraj
// Pankaj`
                ]
              },
              {
                content: `<h3>ArrayList spliterator() Method</h3>
<br>
<strong>spliterator()</strong> (JDK 8+) splits an ArrayList into parts that can be traversed or processed independently - useful for parallel processing. <strong>trySplit()</strong> divides the elements into two halves, and <strong>tryAdvance()</strong> walks through the elements of a spliterator one at a time.<br>`,
                codeExamples: [
                  `import java.util.ArrayList;
import java.util.Spliterator;

public class SpliteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<>(); // creates an empty ArrayList named cars
        cars.add("Volvo");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("Mazda");

        // Get the spliterator and split it
        Spliterator<String> it1 = cars.spliterator();
        Spliterator<String> it2 = it1.trySplit();

        // Loop through the first spliterator
        System.out.println("First spliterator");
        while (it1.tryAdvance((n) -> System.out.println(n)));

        // Loop through the second spliterator
        System.out.println("\\nSecond spliterator");
        while (it2.tryAdvance((n) -> System.out.println(n)));
    }
}
// OUTPUT:
// First spliterator
// Ford
// Mazda
//
// Second spliterator
// Volvo
// BMW`
                ]
              },
              {
                content: `<h3>Sorting an ArrayList with Mixed Numbers and Cases</h3>
<br>
When sorting Strings with <strong>Collections.sort()</strong>, the natural ordering follows ASCII value: <strong>numbers first, then capital letters, then small letters</strong>.<br>`,
                codeExamples: [
                  `package com.arraylist;

import java.util.ArrayList;
import java.util.Collections;

public class ArrayListMixedSortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> al = new ArrayList<>(); // creates an empty ArrayList named al
        al.add("10");
        al.add("A");
        al.add("30");
        al.add("a");
        al.add("50");
        al.add("b");
        al.add("B");

        Collections.sort(al);    // Preference: Number, Capital Letter, Small Letter
        System.out.println(al);
    }
}
// OUTPUT: [10, 30, 50, A, B, a, b]`
                ]
              },
              {
                content: `<h3>ArrayList with Dynamic User Input (Scanner)</h3>
<br>
ArrayList is commonly used to collect a variable number of values entered by the user at runtime, using <strong>Scanner</strong>.<br>`,
                codeExamples: [
                  `package com.arraylist;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.Scanner;

public class ArrayListScannerInputDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> list = new ArrayList<>(); // creates an empty ArrayList named list
        Scanner scanner = new Scanner(System.in);

        for (int i = 1; i <= 5; i++) {
            System.out.println("Enter mobile number " + i + ":");
            String mobileNumber = scanner.next();
            list.add(mobileNumber);
        }

        // Using iterator to print all entered numbers
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
    }
}
// OUTPUT (example input):
// Enter mobile number 1:
// +911111111111
// Enter mobile number 2:
// +912222222222
// ... (5 entries collected and printed back)`
                ]
              },
              {
                content: `<h3>Returning an ArrayList from a Method</h3>
<br>
A common pattern is to build and populate an ArrayList inside a method, then return it to the caller - useful for encapsulating data-fetching logic (e.g., getting a list of employees from a service layer).<br>`,
                codeExamples: [
                  `import java.util.ArrayList;

public class EmployeeTest { // class that holds the main method

    public static ArrayList<Integer> getEmployeeData() {
        ArrayList<Integer> arrayList = new ArrayList<>(); // creates an empty ArrayList named arrayList
        arrayList.add(10);
        arrayList.add(20);
        arrayList.add(30);
        return arrayList;
    }

    public static void main(String[] args) { // program entry point
        ArrayList<Integer> data = getEmployeeData();
        System.out.println(data);
    }
}
// OUTPUT: [10, 20, 30]`
                ]
              },
              {
                content: `<h3>Returning List&lt;Employee&gt; from a Method</h3>
<br>
Besides returning a raw <strong>ArrayList</strong>, a method commonly returns the more general <strong>List</strong> interface type, populated with custom objects.<br>`,
                codeExamples: [
                  `import java.util.ArrayList;
import java.util.List;

public class EmployeeListBuilder { // class that holds the main method

    public List<Employee> getEmployeeList() {
        List<Employee> list = new ArrayList<>();
        list.add(new Employee("ajay", "deshmukh"));
        list.add(new Employee("Rajaram", "Pawar"));
        return list;
    }

    static class Employee {
        String firstName;
        String lastName;
        Employee(String firstName, String lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }
        @Override
        public String toString() {
            return firstName + " " + lastName;
        }
    }

    public static void main(String[] args) { // program entry point
        List<Employee> employees = new EmployeeListBuilder().getEmployeeList();
        System.out.println(employees);
    }
}
// OUTPUT: [ajay deshmukh, Rajaram Pawar]`
                ]
              },
              {
                content: `<h3>Copying One ArrayList into Another Using addAll()</h3>
<br>
<strong>addAll()</strong> can be used to copy/merge all the elements of one ArrayList into another existing ArrayList.<br>`,
                codeExamples: [
                  `package com.arraylist;

import java.util.ArrayList;
import java.util.Iterator;

public class CopyArrayListExample { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> al = new ArrayList<>();     // ArrayList: 01
        al.add(10);
        al.add(20);
        al.add(30);

        ArrayList<Integer> al2 = new ArrayList<>();    // ArrayList: 02
        al2.add(40);
        al2.add(50);
        al2.add(60);

        // Adding 2nd ArrayList into 1st
        al.addAll(al2);

        // 1st Way: Simple Way
        System.out.println("Using Simple Way=" + al);

        // 2nd Way: Iterator
        Iterator<Integer> itr = al.iterator();
        while (itr.hasNext()) {
            System.out.println("Using Iterator=" + itr.next());
        }
    }
}
// OUTPUT:
// Using Simple Way=[10, 20, 30, 40, 50, 60]
// Using Iterator=10
// Using Iterator=20
// Using Iterator=30
// Using Iterator=40
// Using Iterator=50
// Using Iterator=60`
                ]
              },
              {
                content: `<h3>Merging Two ArrayLists into a Third ArrayList</h3>
<br>
Instead of copying into an existing list, you can also merge two ArrayLists into a brand new third one using <strong>addAll()</strong> twice.<br>`,
                codeExamples: [
                  `package com.arraylist;

import java.util.ArrayList;

public class ArrayListDemo7 { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> al01 = new ArrayList<>();    // ArrayList: 01
        al01.add(10);
        al01.add(20);
        al01.add(30);
        System.out.println("1st ArrayList>> " + al01);

        ArrayList<Integer> al02 = new ArrayList<>();    // ArrayList: 02
        al02.add(40);
        al02.add(50);
        al02.add(60);
        System.out.println("2nd ArrayList>> " + al02);

        ArrayList<Integer> al03 = new ArrayList<>();    // ArrayList: 03
        al03.addAll(al01);    // Add 1st ArrayList into 3rd
        al03.addAll(al02);    // Add 2nd ArrayList into 3rd
        System.out.println("Merge list element is>> " + al03);
    }
}
// OUTPUT:
// 1st ArrayList>>  [10, 20, 30]
// 2nd ArrayList>>  [40, 50, 60]
// Merge list element is>> [10, 20, 30, 40, 50, 60]`
                ]
              },
              {
                content: `<h3>get(), remove(Object), contains() Together</h3>
<br>
A quick demonstration combining <strong>get()</strong>, <strong>remove(Object)</strong>, and <strong>contains()</strong> on a mixed-type ArrayList.<br>`,
                codeExamples: [
                  `package com.arraylist;

import java.util.ArrayList;

public class ArrayListDemo4 { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Object> al = new ArrayList<>(); // creates an empty ArrayList named al
        al.add("pune");         // 0th Index
        al.add("mumbai");       // 1st Index
        al.add("bangalore");    // 2nd Index
        al.add(20);              // 3rd Index

        System.out.println(al.get(1));    // Get 1st Element: mumbai
        System.out.println(al);

        al.remove("bangalore");    // Remove bangalore Element only
        System.out.println("after removing element>> " + al);
        System.out.println(al.contains("pune"));    // Check Element: True
    }
}
// OUTPUT:
// mumbai
// [pune, mumbai, bangalore, 20]
// after removing element>> [pune, mumbai, 20]
// true`
                ]
              },
              {
                content: `<h3>Sorting an ArrayList and Then Removing an Element</h3>
<br>
A combination example: sort an ArrayList of Integers with <strong>Collections.sort()</strong>, then remove an element by index.<br>`,
                codeExamples: [
                  `package com.test;

import java.util.ArrayList;
import java.util.Collections;

public class ArrayListDemo2 { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> al = new ArrayList<>(); // creates an empty ArrayList named al
        al.add(10);    // 0th Index
        al.add(20);    // 1st Index
        al.add(15);    // 2nd Index
        al.add(12);    // 3rd Index
        al.add(3);     // 4th Index

        System.out.println("before sorting>> " + al);

        Collections.sort(al);    // Sorting Data
        System.out.println("after sorting>> " + al);

        al.remove(2);    // For Remove Specific Element
        System.out.println("after remove>> " + al);
    }
}
// OUTPUT:
// before sorting>> [10, 20, 15, 12, 3]
// after sorting>> [3, 10, 12, 15, 20]
// after remove>> [3, 10, 15, 20]`
                ]
              },
              {
                content: `<h3>Creating a List with Arrays.asList()</h3>
<br>
<strong>Arrays.asList()</strong> (available since JDK 1.2; only <strong>List.of()</strong> is a Java 9 addition) is a quick way to create a fixed-size <strong>List</strong> directly from given values, without repeated add() calls. It's commonly combined with <strong>subList()</strong> to extract a portion of the list.<br>`,
                codeExamples: [
                  `import java.util.Arrays;
import java.util.List;

public class ArrayListDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);

        for (int i = 0; i < numbers.size(); i++)
            System.out.print(numbers.get(i));
    }
}
// OUTPUT: 12345678`,
                  `import java.util.Arrays;
import java.util.List;

public class ExtractPortionDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<String> listNames = Arrays.asList("Tom", "Jiva", "Mary", "Peter", "David", "Anaji");
        System.out.println("Original list: " + listNames);

        List<String> subList = listNames.subList(2, 5);
        System.out.println("Sub list: " + subList);
    }
}
// OUTPUT:
// Original list: [Tom, Jiva, Mary, Peter, David, Anaji]
// Sub list: [Mary, Peter, David]`
                ]
              },
              {
                content: `<h3>ArrayList vs LinkedList - Detailed Comparison</h3>
<br>
<h4>Comparison Table</h4>
<br>
<table border="1" cellpadding="5" cellspacing="0">
<tr><th>Feature</th><th>ArrayList</th><th>LinkedList</th></tr>
<tr><td><strong>Best Choice For</strong></td><td>Retrieval operations</td><td>Insertion/Deletion in middle</td></tr>
<tr><td><strong>Worst For</strong></td><td>Insertion &amp; Deletion</td><td>Retrieval</td></tr>
<tr><td><strong>Underlying Data Structure</strong></td><td>Resizable / Growable Array</td><td>Double Linked List</td></tr>
<tr><td><strong>Memory Consumption</strong></td><td>Less memory</td><td>More memory (stores next and previous references)</td></tr>
<tr><td><strong>Implements RandomAccess</strong></td><td>Yes</td><td>No</td></tr>
<tr><td><strong>Best Use Case</strong></td><td>Storing and Accessing data</td><td>Manipulating data</td></tr>
</table>
<br>
<h4>Interview Questions on ArrayList</h4>
<ul>
<li><strong>What is an ArrayList in Java?</strong> - ArrayList is a resizable array implementation in the <code>java.util</code> package. It provides dynamic arrays that can grow as needed.</li>
<li><strong>How do you create an ArrayList?</strong> - <code>ArrayList&lt;String&gt; list = new ArrayList&lt;&gt;();</code></li>
<li><strong>What are the main differences between ArrayList and LinkedList?</strong> - ArrayList uses a dynamic array internally and is best for retrieval, while LinkedList uses a doubly linked list and is best for insertion/deletion operations.</li>
<li><strong>How to add elements to an ArrayList?</strong> - Using <code>add()</code> to append at the end, or <code>add(index, element)</code> to insert at a specific position.</li>
<li><strong>How to remove elements from an ArrayList?</strong> - Using <code>remove(index)</code> to remove by position, or <code>remove(Object)</code> to remove by value.</li>
<li><strong>How to iterate over an ArrayList?</strong> - Using for loop, for-each loop, or Iterator.</li>
</ul>
<h4>Time Complexity of ArrayList Operations</h4>
<ul>
<li>Access: <strong>O(1)</strong></li>
<li>Add (at end): <strong>O(1)</strong> amortized</li>
<li>Insert (at index): <strong>O(n)</strong></li>
<li>Remove: <strong>O(n)</strong></li>
<li>Search: <strong>O(n)</strong></li>
</ul>`,
                codeExamples: [
                  `package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.Iterator;

public class ArrayListStringIterationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> address = new ArrayList<String>(); // creates an empty ArrayList named address
        address.add("Pankaj");       // Index: 0
        address.add("Udgir");        // Index: 1
        address.add("Latur");        // Index: 2
        address.add("Maharashtra");  // Index: 3
        address.add("India");        // Index: 4

        // 1st Way: Using Simple Way
        System.out.println("Using Simple Way: " + address);

        // 2nd Way: Iterator
        Iterator<String> itr = address.iterator();
        while (itr.hasNext()) {
            System.out.println("Using Iterator: " + itr.next());
        }

        // 3rd Way: For Each Loop
        for (String part : address) {
            System.out.println("Using For Each Loop: " + part);
        }
    }
}
// OUTPUT:
// Using Simple Way: [Pankaj, Udgir, Latur, Maharashtra, India]
// Using Iterator: Pankaj, Udgir, Latur, Maharashtra, India
// Using For Each Loop: Pankaj, Udgir, Latur, Maharashtra, India`
                ]
              },
              {
                content: `<h3>All ArrayList Methods in One Program</h3>
<br>
Two comprehensive walkthroughs that chain together most of the ArrayList methods covered above - <strong>add(index, elem), get(), set(), remove(), size(), toArray(), clear(), sort(), reverse sort, indexOf(), subList()</strong> - to see how they interact in a single flow.<br>`,
                codeExamples: [
                  `import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;

public class AllArrayListMethodsDemo1 { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> cars = new ArrayList<>(); // creates an empty ArrayList named cars
        cars.add("Mahindra");
        cars.add("BMW");
        cars.add("Ford");
        cars.add("TATA");
        cars.add("Suzuki");
        cars.add("Honda");
        cars.add("Mercedes");
        System.out.println(cars);

        // get()
        System.out.println("Using get() Method:>> " + cars.get(0));    // Mahindra

        // set()
        cars.set(0, "Lamborghini"); // replaces the first element (index 0)
        System.out.println("Using set() Method:>> " + cars);

        // remove(index)
        cars.remove(1); // removes the second element (index 1)
        System.out.println("Using remove() Method:>> " + cars);

        // size()
        System.out.println("Using size() Method:>> " + cars.size());

        // Iterate 3 ways
        for (int i = 0; i < cars.size(); i++) {
            System.out.println("Using For Loop:>> " + cars.get(i));
        }
        for (String s : cars) {
            System.out.println("Using for-each Loop:>> " + s);
        }
        Iterator<String> itr = cars.iterator();
        while (itr.hasNext()) {
            System.out.println("Using iterator:>> " + itr.next());
        }
    }
}`,
                  `import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;

public class AllArrayListMethodsDemo2 { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Integer> al = new ArrayList<>();    // ArrayList: 01
        al.add(10);
        al.add(20);
        al.add(30);
        System.out.println("1st Arraylist: " + al);

        ArrayList<Integer> al2 = new ArrayList<>();    // ArrayList: 02
        al2.add(100);
        al2.add(90);
        al2.add(80);
        System.out.println("2nd Arraylist: " + al2);

        // Copy 2nd ArrayList into 1st
        al.addAll(al2);
        System.out.println("After Adding 2nd ArrayList in 1st:>> " + al);

        Collections.sort(al);
        System.out.println("After Sorting:>> " + al);

        System.out.println("By Using Get Method:>> " + al.get(2));
        System.out.println("By Using Contains Method:>> " + al.contains(80));

        System.out.println("Before Remove:>> " + al);
        al.remove(2); // removes the third element (index 2)
        System.out.println("After Remove:>> " + al);

        // Using Iterator
        Iterator<Integer> itr = al.iterator();
        while (itr.hasNext()) {
            System.out.println("Using Iterator:>> " + itr.next());
        }

        // Using For Each
        for (int i : al) {
            System.out.println("Using For Each Loop:>> " + i);
        }
    }
}
// OUTPUT:
// 1st Arraylist: [10, 20, 30]
// 2nd Arraylist: [100, 90, 80]
// After Adding 2nd ArrayList in 1st:>> [10, 20, 30, 100, 90, 80]
// After Sorting:>> [10, 20, 30, 80, 90, 100]
// By Using Get Method:>> 30
// By Using Contains Method:>> true
// Before Remove:>> [10, 20, 30, 80, 90, 100]
// After Remove:>> [10, 20, 80, 90, 100]`
                ]
              }
            ]
          },

          // ----- LinkedList -----
          {
            id: 'linkedlist',
            name: 'LinkedList',
            beginner: [
{
                content: `<h3>LinkedList</h3>
<strong>LinkedList</strong> is a class that implements the <strong>Collection</strong> and <strong>List</strong> interfaces. It is present in the <strong>java.util</strong> package. Internally, LinkedList uses a <strong>doubly linked list</strong> structure, where each element (node) contains the data, a reference to the next node, and a reference to the previous node.<br>
<br>
<h4>Key Features of LinkedList</h4>
<br>
<ul>
<li><strong>Duplicates Allowed</strong> - Same element can be added multiple times.</li>
<li><strong>Insertion Order Preserved</strong> - Elements maintain the order in which they are inserted.</li>
<li><strong>Non-Synchronized</strong> - Not thread-safe by default.</li>
<li><strong>Heterogeneous Objects Allowed</strong> - Can store different types of objects (without generics).</li>
<li><strong>Null Insertion Possible</strong> - Null values can be added.</li>
<li><strong>Best for Insertion/Deletion</strong> - Adding or removing elements is very efficient as only pointers need to change.</li>
<li><strong>Worst for Retrieval</strong> - Accessing elements by index requires traversing the list from the beginning or end (O(n)).</li>
<li><strong>Implements Serializable &amp; Cloneable</strong> - But does <strong>NOT</strong> implement the RandomAccess interface (unlike ArrayList), which is why index-based access is slow.</li>
</ul>`,
                codeExamples: [
                  `import java.util.LinkedList;

public class LinkedListBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(); // creates an empty LinkedList named ll

        // Add elements
        ll.add("Java");
        ll.add("Python");
        ll.add("C++");
        ll.addFirst("HTML");    // add at beginning
        ll.addLast("CSS");      // add at end
        ll.add(2, "JavaScript"); // add at index

        System.out.println("LinkedList: " + ll);

        // Access elements
        System.out.println("First: " + ll.getFirst());
        System.out.println("Last: " + ll.getLast());
        System.out.println("At index 3: " + ll.get(3));

        // Change elements
        ll.set(1, "Kotlin"); // replaces the second element (index 1)
        System.out.println("After set: " + ll);

        // Remove elements
        ll.remove();           // removes first
        ll.removeFirst();      // removes first
        ll.removeLast();       // removes last
        ll.remove(1);          // removes at index
        ll.remove("Python");   // removes by object

        System.out.println("After removals: " + ll);
        System.out.println("Size: " + ll.size());
    }
}`
                ]
              },
              {
                content: `<h4>LinkedList Implements List, Deque, and Queue</h4>
Unlike ArrayList and Vector (which only implement List), <strong>LinkedList</strong> uniquely implements <strong>three</strong> interfaces at once - this is what lets the same class behave as a list, a queue, or a double-ended queue.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Interface</th><th style="text-align:left;">What It Gives LinkedList</th><th style="text-align:left;">Example Methods</th></tr>
<tr><td><strong>List</strong></td><td>Index-based, ordered access</td><td>get(i), set(i, e), add(i, e)</td></tr>
<tr><td><strong>Deque</strong></td><td>Insert/remove from both ends</td><td>addFirst(), addLast(), pollFirst(), pollLast()</td></tr>
<tr><td><strong>Queue</strong></td><td>FIFO-style processing</td><td>offer(), poll(), peek()</td></tr>
</table>
<br>
Because it implements <strong>Deque</strong>, LinkedList can also be used as a <strong>Stack</strong> (LIFO, via push()/pop()) or a <strong>Queue</strong> (FIFO, via offer()/poll()) - no separate class needed.<br>`
              },
              {
                content: `<h3>LinkedList - Complete Method Reference (~51 Methods)</h3>
LinkedList provides this many methods because it implements <strong>List</strong>, <strong>Deque</strong>, <strong>Queue</strong>, <strong>Cloneable</strong>, and <strong>Serializable</strong> all at once. Grouped by purpose:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Adding Elements</strong></td><td>add(E), add(int,E), addFirst(E), addLast(E), offer(E), offerFirst(E), offerLast(E)</td></tr>
<tr><td><strong>2. Accessing Elements</strong></td><td>get(int), getFirst(), getLast(), peek(), peekFirst(), peekLast(), element()</td></tr>
<tr><td><strong>3. Removing Elements</strong></td><td>remove(), remove(int), remove(Object), removeFirst(), removeLast(), removeFirstOccurrence(Object), removeLastOccurrence(Object), poll(), pollFirst(), pollLast()</td></tr>
<tr><td><strong>4. Searching</strong></td><td>contains(Object), indexOf(Object), lastIndexOf(Object)</td></tr>
<tr><td><strong>5. Updating</strong></td><td>set(int, E)</td></tr>
<tr><td><strong>6. Size / Status</strong></td><td>size(), isEmpty()</td></tr>
<tr><td><strong>7. Collection Operations</strong></td><td>clear(), addAll(Collection), addAll(int, Collection), containsAll(Collection), removeAll(Collection), retainAll(Collection), removeIf(Predicate)</td></tr>
<tr><td><strong>8. Iteration</strong></td><td>iterator(), listIterator(), listIterator(int), descendingIterator(), forEach(Consumer)</td></tr>
<tr><td><strong>9. Array / Stream</strong></td><td>toArray(), toArray(T[]), stream(), parallelStream()</td></tr>
<tr><td><strong>10. Other</strong></td><td>clone(), spliterator(), equals(Object), hashCode(), toString()</td></tr>
</table>
<br>
<strong>For interview prep, the most important group is the Deque operations:</strong> addFirst(), addLast(), getFirst(), getLast(), removeFirst(), removeLast(), peekFirst(), peekLast(), pollFirst(), pollLast(), offerFirst(), offerLast() - these are what make LinkedList genuinely different from ArrayList.<br>`
              },
              {
                content: `<h4>1. Adding Elements - Separate Example for Each Method</h4>`,
                codeExamples: [
                  `// add(E e) - appends to the end
import java.util.LinkedList;
public class AddDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(); // creates an empty LinkedList named ll
        ll.add(10);
        ll.add(20);
        System.out.println(ll);
    }
}
// OUTPUT: [10, 20]`,
                  `// add(int index, E element) - inserts at a specific position
import java.util.LinkedList;
public class AddAtIndexDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(10, 20, 30));
        ll.add(1, 15); // inserts at index 1, shifting later elements right
        System.out.println(ll);
    }
}
// OUTPUT: [10, 15, 20, 30]`,
                  `// addFirst(E e) - inserts at the front
import java.util.LinkedList;
public class AddFirstDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(20, 30));
        ll.addFirst(10);
        System.out.println(ll);
    }
}
// OUTPUT: [10, 20, 30]`,
                  `// addLast(E e) - inserts at the end
import java.util.LinkedList;
public class AddLastDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(10, 20));
        ll.addLast(30);
        System.out.println(ll);
    }
}
// OUTPUT: [10, 20, 30]`,
                  `// offer(E e) - inserts at the end (Queue-style, never throws)
import java.util.LinkedList;
public class OfferDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(); // creates an empty LinkedList named ll
        ll.offer(10);
        ll.offer(20);
        System.out.println(ll);
    }
}
// OUTPUT: [10, 20]`,
                  `// offerFirst(E e) - inserts at the front (Deque-style)
import java.util.LinkedList;
public class OfferFirstDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(20));
        ll.offerFirst(10);
        System.out.println(ll);
    }
}
// OUTPUT: [10, 20]`,
                  `// offerLast(E e) - inserts at the end (Deque-style)
import java.util.LinkedList;
public class OfferLastDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(10));
        ll.offerLast(20);
        System.out.println(ll);
    }
}
// OUTPUT: [10, 20]`
                ]
              },
              {
                content: `<h4>2. Accessing Elements - Separate Example for Each Method</h4>`,
                codeExamples: [
                  `// get(int index) - returns element at index
import java.util.LinkedList;
public class GetDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.get(1));
    }
}
// OUTPUT: B`,
                  `// getFirst() - returns the first element (throws if empty)
import java.util.LinkedList;
public class GetFirstDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.getFirst());
    }
}
// OUTPUT: A`,
                  `// getLast() - returns the last element (throws if empty)
import java.util.LinkedList;
public class GetLastDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.getLast());
    }
}
// OUTPUT: C`,
                  `// peek() - returns the head without removing it (null if empty)
import java.util.LinkedList;
public class PeekDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.peek());
        System.out.println(ll);
    }
}
// OUTPUT:
// A
// [A, B, C]`,
                  `// peekFirst() - returns the first element without removing (null if empty)
import java.util.LinkedList;
public class PeekFirstDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.peekFirst());
    }
}
// OUTPUT: A`,
                  `// peekLast() - returns the last element without removing (null if empty)
import java.util.LinkedList;
public class PeekLastDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.peekLast());
    }
}
// OUTPUT: C`,
                  `// element() - returns the head; throws NoSuchElementException if empty (unlike peek())
import java.util.LinkedList;
public class ElementDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.element());
    }
}
// OUTPUT: A`
                ]
              },
              {
                content: `<h4>3. Removing Elements - Separate Example for Each Method</h4>`,
                codeExamples: [
                  `// remove() - removes and returns the head (same as removeFirst())
import java.util.LinkedList;
public class RemoveDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.remove());
        System.out.println(ll);
    }
}
// OUTPUT:
// A
// [B, C]`,
                  `// remove(int index) - removes element at the given index
import java.util.LinkedList;
public class RemoveIndexDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.remove(1));
        System.out.println(ll);
    }
}
// OUTPUT:
// B
// [A, C]`,
                  `// remove(Object o) - removes first occurrence of the given object
import java.util.LinkedList;
public class RemoveObjectDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.remove("B"));
        System.out.println(ll);
    }
}
// OUTPUT:
// true
// [A, C]`,
                  `// removeFirst() - removes and returns the first element (throws if empty)
import java.util.LinkedList;
public class RemoveFirstDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.removeFirst());
        System.out.println(ll);
    }
}
// OUTPUT:
// A
// [B, C]`,
                  `// removeLast() - removes and returns the last element (throws if empty)
import java.util.LinkedList;
public class RemoveLastDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.removeLast());
        System.out.println(ll);
    }
}
// OUTPUT:
// C
// [A, B]`,
                  `// removeFirstOccurrence(Object o) - removes first match, searching from the head
import java.util.LinkedList;
public class RemoveFirstOccurrenceDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "A", "C"));
        ll.removeFirstOccurrence("A");
        System.out.println(ll);
    }
}
// OUTPUT: [B, A, C]`,
                  `// removeLastOccurrence(Object o) - removes last match, searching from the tail
import java.util.LinkedList;
public class RemoveLastOccurrenceDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "A", "C"));
        ll.removeLastOccurrence("A");
        System.out.println(ll);
    }
}
// OUTPUT: [A, B, C]`,
                  `// poll() - removes and returns the head; returns null (not exception) if empty
import java.util.LinkedList;
public class PollDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.poll());
        System.out.println(ll);
    }
}
// OUTPUT:
// A
// [B, C]`,
                  `// pollFirst() - removes and returns the first element, or null if empty
import java.util.LinkedList;
public class PollFirstDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.pollFirst());
        System.out.println(ll);
    }
}
// OUTPUT:
// A
// [B, C]`,
                  `// pollLast() - removes and returns the last element, or null if empty
import java.util.LinkedList;
public class PollLastDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.pollLast());
        System.out.println(ll);
    }
}
// OUTPUT:
// C
// [A, B]`
                ]
              },
              {
                content: `<h4>4. Searching, 5. Updating, and 6. Size / Status</h4>`,
                codeExamples: [
                  `// contains(Object o) - checks whether the element exists
import java.util.LinkedList;
public class ContainsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.contains("B"));
        System.out.println(ll.contains("Z"));
    }
}
// OUTPUT:
// true
// false`,
                  `// indexOf(Object o) - first occurrence index, or -1
import java.util.LinkedList;
public class IndexOfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "A"));
        System.out.println(ll.indexOf("A"));
    }
}
// OUTPUT: 0`,
                  `// lastIndexOf(Object o) - last occurrence index, or -1
import java.util.LinkedList;
public class LastIndexOfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "A"));
        System.out.println(ll.lastIndexOf("A"));
    }
}
// OUTPUT: 2`,
                  `// set(int index, E element) - replaces the element at the index
import java.util.LinkedList;
public class SetDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        ll.set(1, "Z"); // replaces the second element (index 1)
        System.out.println(ll);
    }
}
// OUTPUT: [A, Z, C]`,
                  `// size() - number of elements currently in the list
import java.util.LinkedList;
public class SizeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.size());
    }
}
// OUTPUT: 3`,
                  `// isEmpty() - true if the list has no elements
import java.util.LinkedList;
public class IsEmptyDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(); // creates an empty LinkedList named ll
        System.out.println(ll.isEmpty());
        ll.add("A");
        System.out.println(ll.isEmpty());
    }
}
// OUTPUT:
// true
// false`
                ]
              },
              {
                content: `<h4>7. Collection Operations - Separate Example for Each Method</h4>`,
                codeExamples: [
                  `// clear() - removes all elements
import java.util.LinkedList;
public class ClearDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        ll.clear();
        System.out.println(ll);
    }
}
// OUTPUT: []`,
                  `// addAll(Collection c) - appends all elements of another collection at the end
import java.util.LinkedList;
public class AddAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 2));
        ll.addAll(java.util.List.of(3, 4));
        System.out.println(ll);
    }
}
// OUTPUT: [1, 2, 3, 4]`,
                  `// addAll(int index, Collection c) - inserts all elements starting at the index
import java.util.LinkedList;
public class AddAllAtIndexDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 4));
        ll.addAll(1, java.util.List.of(2, 3));
        System.out.println(ll);
    }
}
// OUTPUT: [1, 2, 3, 4]`,
                  `// containsAll(Collection c) - true if all given elements are present
import java.util.LinkedList;
public class ContainsAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 2, 3, 4));
        System.out.println(ll.containsAll(java.util.List.of(2, 3)));
        System.out.println(ll.containsAll(java.util.List.of(2, 9)));
    }
}
// OUTPUT:
// true
// false`,
                  `// removeAll(Collection c) - removes every element also present in c
import java.util.LinkedList;
public class RemoveAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 2, 3, 4));
        ll.removeAll(java.util.List.of(2, 4));
        System.out.println(ll);
    }
}
// OUTPUT: [1, 3]`,
                  `// retainAll(Collection c) - keeps only elements also present in c
import java.util.LinkedList;
public class RetainAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 2, 3, 4));
        ll.retainAll(java.util.List.of(2, 4));
        System.out.println(ll);
    }
}
// OUTPUT: [2, 4]`,
                  `// removeIf(Predicate filter) - removes every element matching the condition
import java.util.LinkedList;
public class RemoveIfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 2, 3, 4, 5));
        ll.removeIf(n -> n % 2 == 0);
        System.out.println(ll);
    }
}
// OUTPUT: [1, 3, 5]`
                ]
              },
              {
                content: `<h4>8. Iteration - Separate Example for Each Method</h4>`,
                codeExamples: [
                  `// iterator() - forward-only cursor
import java.util.Iterator;
import java.util.LinkedList;
public class IteratorMethodDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        Iterator<String> it = ll.iterator();
        while (it.hasNext()) System.out.println(it.next());
    }
}
// OUTPUT:
// A
// B
// C`,
                  `// listIterator() - bidirectional cursor, starts at index 0
import java.util.LinkedList;
import java.util.ListIterator;
public class ListIteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        ListIterator<String> lit = ll.listIterator();
        while (lit.hasNext()) System.out.println(lit.next());
    }
}
// OUTPUT:
// A
// B
// C`,
                  `// listIterator(int index) - bidirectional cursor, starts at the given index
import java.util.LinkedList;
import java.util.ListIterator;
public class ListIteratorAtIndexDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        ListIterator<String> lit = ll.listIterator(1);
        System.out.println(lit.next());    // starts from index 1
    }
}
// OUTPUT: B`,
                  `// descendingIterator() - traverses from tail to head
import java.util.Iterator;
import java.util.LinkedList;
public class DescendingIteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        Iterator<String> it = ll.descendingIterator();
        while (it.hasNext()) System.out.println(it.next());
    }
}
// OUTPUT:
// C
// B
// A`,
                  `// forEach(Consumer action) - JDK 8 functional iteration
import java.util.LinkedList;
public class ForEachDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        ll.forEach(e -> System.out.println("Item: " + e));
    }
}
// OUTPUT:
// Item: A
// Item: B
// Item: C`
                ]
              },
              {
                content: `<h4>9. Array / Stream and 10. Other Important Methods</h4>`,
                codeExamples: [
                  `// toArray() - returns an Object[] copy of the list
import java.util.LinkedList;
public class ToArrayDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        Object[] arr = ll.toArray();
        System.out.println(arr.length);
    }
}
// OUTPUT: 3`,
                  `// toArray(T[] a) - returns a typed array copy of the list
import java.util.LinkedList;
public class ToArrayTypedDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        String[] arr = ll.toArray(new String[0]);
        System.out.println(java.util.Arrays.toString(arr));
    }
}
// OUTPUT: [A, B, C]`,
                  `// stream() - sequential Stream over the elements
import java.util.LinkedList;
public class StreamDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 2, 3, 4));
        long count = ll.stream().filter(n -> n % 2 == 0).count();
        System.out.println(count);
    }
}
// OUTPUT: 2`,
                  `// parallelStream() - potentially parallel Stream over the elements
import java.util.LinkedList;
public class ParallelStreamDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll = new LinkedList<>(java.util.List.of(1, 2, 3, 4));
        int sum = ll.parallelStream().mapToInt(Integer::intValue).sum();
        System.out.println(sum);
    }
}
// OUTPUT: 10`,
                  `// clone() - shallow copy of the LinkedList
import java.util.LinkedList;
public class CloneDemo { // class that holds the main method
    @SuppressWarnings("unchecked")
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B"));
        LinkedList<String> copy = (LinkedList<String>) ll.clone();
        copy.add("C");
        System.out.println("Original: " + ll);
        System.out.println("Clone: " + copy);
    }
}
// OUTPUT:
// Original: [A, B]
// Clone: [A, B, C]`,
                  `// spliterator() - splittable iterator, useful for parallel processing
import java.util.LinkedList;
import java.util.Spliterator;
public class SpliteratorMethodDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        Spliterator<String> sp = ll.spliterator();
        sp.forEachRemaining(System.out::println);
    }
}
// OUTPUT:
// A
// B
// C`,
                  `// equals(Object o) - true if both lists have the same elements in the same order
import java.util.LinkedList;
public class EqualsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll1 = new LinkedList<>(java.util.List.of(1, 2, 3));
        LinkedList<Integer> ll2 = new LinkedList<>(java.util.List.of(1, 2, 3));
        System.out.println(ll1.equals(ll2));
    }
}
// OUTPUT: true`,
                  `// hashCode() - consistent with equals(); equal lists share the same hash code
import java.util.LinkedList;
public class HashCodeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> ll1 = new LinkedList<>(java.util.List.of(1, 2, 3));
        LinkedList<Integer> ll2 = new LinkedList<>(java.util.List.of(1, 2, 3));
        System.out.println(ll1.hashCode() == ll2.hashCode());
    }
}
// OUTPUT: true`,
                  `// toString() - returns a bracketed, comma-separated representation
import java.util.LinkedList;
public class ToStringDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<String> ll = new LinkedList<>(java.util.List.of("A", "B", "C"));
        System.out.println(ll.toString());
    }
}
// OUTPUT: [A, B, C]`
                ]
              },
{
                content: `<h3>LinkedList Constructors and Iteration</h3>
<br>
<h4>Constructors</h4>
<br>
1) <strong>LinkedList list = new LinkedList();</strong> - Create empty linkedlist object.<br>
2) <strong>LinkedList list = new LinkedList(Collection c);</strong> - Create object for given collection.<br>
<br>
<h4>Iteration Methods</h4>
<br>
There are multiple ways to iterate a LinkedList:<br>
<br>
<ul>
<li><strong>1st Way: Simple Way</strong> - Directly print the LinkedList object using System.out.println().</li>
<li><strong>2nd Way: Iterator</strong> - Use the iterator() method to get an Iterator and traverse using hasNext() and next().</li>
<li><strong>3rd Way: For Each Loop</strong> - Use the enhanced for-each loop to iterate over elements.</li>
</ul>`,
                codeExamples: [
                  `package com.test;

import java.util.Iterator;
import java.util.LinkedList;

public class LinkedListDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> linkedList = new LinkedList<Integer>(); // creates an empty LinkedList named linkedList
        linkedList.add(10);    // Index: 0
        linkedList.add(40);    // Index: 1
        linkedList.add(30);    // Index: 2
        linkedList.add(20);    // Index: 3
        System.out.println("Output is= " + linkedList);

        linkedList.addFirst(70);    // OUTPUT: 70 10 40 30 20
        linkedList.addLast(80);     // OUTPUT: 70 10 40 30 20 80

        int a = linkedList.get(3); // gets the fourth element (index 3)
        System.out.println("4th index is=" + a);    // 30

        // 1st Way: Using Simple Way
        System.out.println("first way>>" + linkedList);

        // 2nd Way: Using Iterator() Method
        Iterator<Integer> itr = linkedList.iterator();
        while (itr.hasNext()) {
            System.out.println("second way-using iterator>>" + itr.next());
        }

        // 3rd Way: Using For Each Loop
        for (Integer xyz : linkedList) {
            System.out.println("third way-using for each loop>>" + xyz);
        }
    }
}`,
                  `package com.practice;

import java.util.*;

public class LinkedListStringIterationDemo { // class that holds the main method
    public static void main(String args[]) {
        LinkedList<String> obj = new LinkedList<String>(); // creates an empty LinkedList named obj
        obj.add("Pankaj");       // Index: 0
        obj.add("Udgir");        // Index: 1
        obj.add("Latur");        // Index: 2
        obj.add("Maharashtra");  // Index: 3
        obj.add("India");        // Index: 4

        // 1st Way: Using Simple Way
        System.out.println("Using Simple Way: " + obj);

        // 2nd Way: Iterator
        Iterator<String> itr = obj.iterator();
        while (itr.hasNext()) {
            System.out.println("Using For Iterator: " + itr.next());
        }

        // 3rd Way: For Each Loop
        for (Object o : obj) {
            System.out.println("Using For Each Loop: " + o);
        }
    }
}`,
                  `package com.test;

import java.util.LinkedList;
import java.util.Iterator;

public class LinkedListHeterogeneousDataDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Object> linkedList = new LinkedList<>(); // creates an empty LinkedList named linkedList
        linkedList.add(50);           // 0th Index
        linkedList.add("India");      // 1st Index
        linkedList.add(10);           // 2nd Index
        linkedList.add(50);           // 3rd Index
        linkedList.add(null);         // 4th Index

        System.out.println("OUTPUT: " + linkedList);

        linkedList.addFirst("Pankaj");
        linkedList.add(2, "Maharashtra"); // inserts at index 2, shifting later elements right

        // 1st Way: Using Simple Way
        System.out.println("Using Simply Object: " + linkedList);

        // 2nd Way: Iterator
        Iterator xyz = linkedList.iterator();
        while (xyz.hasNext()) {
            System.out.println("Using For Iterator: " + xyz.next());
        }

        // 3rd Way: For Each Loop
        for (Object obj : linkedList) {
            System.out.println("Using For Each Loop: " + obj);
        }
    }
}`
                ]
              },
              {
                content: `<h3>Using LinkedList as a Stack and as a Queue</h3>
Because LinkedList implements <strong>Deque</strong>, the same object can be driven with stack-style methods (push/pop) or queue-style methods (offer/poll) - no need for a separate Stack or Queue class.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Usage</th><th style="text-align:left;">Insert</th><th style="text-align:left;">Remove</th><th style="text-align:left;">Order</th></tr>
<tr><td><strong>As a Stack (LIFO)</strong></td><td>push(e)</td><td>pop()</td><td>Last In, First Out</td></tr>
<tr><td><strong>As a Queue (FIFO)</strong></td><td>offer(e)</td><td>poll()</td><td>First In, First Out</td></tr>
</table>`,
                codeExamples: [
                  `import java.util.LinkedList;

public class LinkedListAsStack { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedList<Integer> stack = new LinkedList<>(); // creates an empty LinkedList named stack

        // push() / pop() - LIFO, both act on the front (head)
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("Stack: " + stack);    // [30, 20, 10]

        System.out.println("pop(): " + stack.pop());    // 30
        System.out.println("peek(): " + stack.peek());   // 20 (top, without removing)
        System.out.println("After pop: " + stack);       // [20, 10]
    }
}`,
                  `import java.util.LinkedList;
import java.util.Queue;

public class LinkedListAsQueue { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Queue<String> queue = new LinkedList<>();

        // offer() / poll() - FIFO
        queue.offer("Task1");
        queue.offer("Task2");
        queue.offer("Task3");
        System.out.println("Queue: " + queue);    // [Task1, Task2, Task3]

        System.out.println("poll(): " + queue.poll());    // Task1 (removed from front)
        System.out.println("peek(): " + queue.peek());     // Task2 (front, without removing)
        System.out.println("After poll: " + queue);        // [Task2, Task3]
    }
}`
                ]
              },
{
                content: `<h3>LinkedList in Production Code - How a Senior Engineer Uses It</h3>
Beginner code writes <code>LinkedList&lt;String&gt; list = new LinkedList&lt;&gt;();</code> everywhere and calls it a day. Production/architecture-grade code follows a few disciplines instead:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Principle</th><th style="text-align:left;">What It Means in Practice</th></tr>
<tr><td><strong>Program to the interface</strong></td><td>Declare fields/params as <code>Deque&lt;T&gt;</code>, <code>Queue&lt;T&gt;</code>, or <code>List&lt;T&gt;</code> - never <code>LinkedList&lt;T&gt;</code> directly. Lets you swap the implementation (e.g., to <code>ArrayDeque</code>) without touching call sites.</td></tr>
<tr><td><strong>Encapsulate, don't expose</strong></td><td>Wrap the LinkedList in a purpose-built class (e.g., <code>BrowserHistory</code>) with a narrow, intention-revealing API - never return the raw LinkedList from a public method.</td></tr>
<tr><td><strong>Fail fast on invalid input</strong></td><td>Use <code>Objects.requireNonNull()</code> and explicit precondition checks instead of letting a NullPointerException surface deep in the call stack.</td></tr>
<tr><td><strong>Prefer immutable return types</strong></td><td>Return <code>List.copyOf(...)</code> or <code>Collections.unmodifiableList(...)</code> from getters so callers can't mutate your internal state.</td></tr>
<tr><td><strong>Know when NOT to use it</strong></td><td>For a pure stack/queue with no need for List/index access, <code>ArrayDeque</code> is faster and more cache-friendly than LinkedList - a senior dev picks LinkedList specifically when index-free, pointer-based O(1) insert/delete at arbitrary known positions is the actual requirement.</td></tr>
<tr><td><strong>Concurrency awareness</strong></td><td>Plain LinkedList is not thread-safe. For concurrent access, reach for <code>ConcurrentLinkedDeque</code> / <code>ConcurrentLinkedQueue</code> rather than externally synchronizing a LinkedList.</td></tr>
</table>`,
                codeExamples: [
                  `/**
 * Encapsulates browser-style back/forward navigation.
 *
 * Architectural notes:
 *  - The LinkedList is a private implementation detail, never exposed.
 *  - Public API is expressed in domain terms (visit/back/forward),
 *    not in collection terms (add/remove) - callers don't need to
 *    know a LinkedList is involved at all.
 *  - Field type is the Deque interface, not LinkedList, so the
 *    implementation can change later without breaking this class's API.
 */
import java.util.Deque;
import java.util.LinkedList;
import java.util.Objects;
import java.util.Optional;

public final class BrowserHistory {

    private final Deque<String> backStack = new LinkedList<>();
    private final Deque<String> forwardStack = new LinkedList<>();
    private String currentPage;

    public BrowserHistory(String homePage) {
        this.currentPage = Objects.requireNonNull(homePage, "homePage must not be null");
    }

    public void visit(String url) {
        Objects.requireNonNull(url, "url must not be null");
        backStack.push(currentPage);
        currentPage = url;
        forwardStack.clear();    // visiting a new page invalidates forward history
    }

    public Optional<String> back() {
        if (backStack.isEmpty()) {
            return Optional.empty();
        }
        forwardStack.push(currentPage);
        currentPage = backStack.pop();
        return Optional.of(currentPage);
    }

    public Optional<String> forward() {
        if (forwardStack.isEmpty()) {
            return Optional.empty();
        }
        backStack.push(currentPage);
        currentPage = forwardStack.pop();
        return Optional.of(currentPage);
    }

    public String currentPage() {
        return currentPage;
    }

    public static void main(String[] args) { // program entry point
        BrowserHistory history = new BrowserHistory("home.com");
        history.visit("news.com");
        history.visit("sports.com");

        System.out.println("Current: " + history.currentPage());
        System.out.println("Back: " + history.back().orElse("no page"));
        System.out.println("Back: " + history.back().orElse("no page"));
        System.out.println("Forward: " + history.forward().orElse("no page"));
    }
}
// OUTPUT:
// Current: sports.com
// Back: news.com
// Back: home.com
// Forward: news.com`,
                  `/**
 * Classic senior-interview pattern: sliding window maximum.
 *
 * Uses a LinkedList as a Deque holding INDEXES (not values) to achieve
 * O(n) total time instead of the naive O(n*k) brute force - the kind of
 * algorithmic reasoning expected at senior/staff level, not just
 * "which method do I call."
 */
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;

public final class SlidingWindowMaximum {

    public static List<Integer> maxOfEachWindow(int[] nums, int windowSize) {
        if (nums == null || windowSize <= 0 || windowSize > nums.length) {
            throw new IllegalArgumentException("Invalid input for sliding window");
        }

        List<Integer> result = new ArrayList<>();
        Deque<Integer> indexWindow = new LinkedList<>();    // stores indexes, front = current max

        for (int i = 0; i < nums.length; i++) {
            // Drop indexes that fall out of the current window
            while (!indexWindow.isEmpty() && indexWindow.peekFirst() <= i - windowSize) {
                indexWindow.pollFirst();
            }
            // Maintain decreasing order of values from front to back
            while (!indexWindow.isEmpty() && nums[indexWindow.peekLast()] < nums[i]) {
                indexWindow.pollLast();
            }
            indexWindow.offerLast(i);

            if (i >= windowSize - 1) {
                result.add(nums[indexWindow.peekFirst()]);
            }
        }
        return result;
    }

    public static void main(String[] args) { // program entry point
        int[] nums = { 1, 3, -1, -3, 5, 3, 6, 7 };
        System.out.println(maxOfEachWindow(nums, 3));
    }
}
// OUTPUT: [3, 3, 5, 5, 6, 7]`,
                  `/**
 * Thread-safety: what a senior dev does instead of a bare LinkedList
 * when multiple threads touch the same queue.
 */
import java.util.concurrent.ConcurrentLinkedDeque;

public final class ConcurrentTaskQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        // Lock-free, thread-safe alternative to synchronizing a LinkedList by hand
        ConcurrentLinkedDeque<String> tasks = new ConcurrentLinkedDeque<>();

        Runnable producer = () -> {
            for (int i = 1; i <= 3; i++) {
                tasks.offerLast("task-" + i);
            }
        };

        Thread producerThread = new Thread(producer, "producer");
        producerThread.start();
        producerThread.join();

        String task;
        while ((task = tasks.pollFirst()) != null) {
            System.out.println("Processing: " + task);
        }
    }
}
// OUTPUT:
// Processing: task-1
// Processing: task-2
// Processing: task-3`
                ]
              },
              {
                content: `<h3>Difference between ArrayList & LinkedList</h3>
<br>
<h4>Comparison Table</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Property</th><th style="text-align:left;">ArrayList</th><th style="text-align:left;">LinkedList</th></tr>
<tr><td><strong>Best Choice For</strong></td><td>Retrieval operations</td><td>Insertion / deletion (esp. at ends)</td></tr>
<tr><td><strong>Worst Choice For</strong></td><td>Insertion &amp; deletion (middle)</td><td>Retrieval by index</td></tr>
<tr><td><strong>Underlying Data Structure</strong></td><td>Resizable / growable array</td><td>Doubly linked list</td></tr>
<tr><td><strong>Memory Consumption</strong></td><td>Less memory</td><td>More memory (stores next &amp; previous refs)</td></tr>
<tr><td><strong>RandomAccess Interface</strong></td><td>Implements it</td><td>Does NOT implement it</td></tr>
<tr><td><strong>Implements Deque / Queue</strong></td><td>No</td><td>Yes</td></tr>
<tr><td><strong>get(index) Time Complexity</strong></td><td>O(1)</td><td>O(n)</td></tr>
<tr><td><strong>addFirst() / addLast() Time Complexity</strong></td><td>O(n) / O(1) amortized</td><td>O(1) / O(1)</td></tr>
<tr><td><strong>Usage</strong></td><td>Storing and accessing data</td><td>Manipulating data, stack/queue behavior</td></tr>
</table>
<br>
<h4>Interview Questions on LinkedList</h4>
<br>
<strong>1. What is a LinkedList in Java?</strong><br>
A LinkedList is a linear data structure where each element is a separate object called a node. Each node contains data and a reference (link) to the next node in the sequence.<br>
<br>
<strong>2. How do you create a LinkedList in Java?</strong><br>
LinkedList&lt;String&gt; list = new LinkedList&lt;&gt;();<br>
<br>
<strong>3. What are the main differences between ArrayList and LinkedList?</strong><br>
ArrayList uses a dynamic array internally and provides fast random access. LinkedList uses a doubly linked list and provides fast insertions and deletions.<br>
<br>
<strong>4. How do you add elements to a LinkedList?</strong><br>
Using add(), addFirst(), and addLast() methods.<br>
<br>
<strong>5. How do you remove elements from a LinkedList?</strong><br>
Using remove(), removeFirst(), and removeLast() methods.<br>
<br>
<strong>6. How do you iterate over a LinkedList?</strong><br>
Using for-each loop, iterator, or for loop.<br>
<br>
<strong>7. What is the time complexity of common LinkedList operations?</strong><br>
<ul>
<li>Access: O(n)</li>
<li>Add at beginning/end: O(1)</li>
<li>Insert at specific position: O(n)</li>
<li>Remove: O(n)</li>
<li>Search: O(n)</li>
</ul>
<br>
<strong>8. What is a doubly linked list?</strong><br>
A doubly linked list is a type of linked list where each node has a reference to both the next and the previous node.<br>
<br>
<strong>9. What are the advantages and disadvantages of LinkedList?</strong><br>
Advantages: Dynamic size, efficient insertions and deletions.<br>
Disadvantages: Higher memory usage due to storage of references, slower access time compared to arrays.<br>`,
                codeExamples: [
                  `// Custom Singly Linked List Implementation
class Node {
    int data;
    Node next;
    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    Node head;
    public void add(int data) {
        Node newNode = new Node(data);
        if (head == null) {
            head = newNode;
        } else {
            Node temp = head;
            while (temp.next != null) {
                temp = temp.next;
            }
            temp.next = newNode;
        }
    }
}`
                ]
              }
            ]
          },

          // ----- Vector -----
          {
            id: 'vector',
            name: 'Vector',
            beginner: [
{
                content: `<h3>Vector</h3>
<strong>Vector</strong> is a part of the Java Collection Framework and provides a <strong>dynamic array</strong> implementation, similar to ArrayList. The key difference is that Vector is <strong>synchronized</strong> (thread-safe). It is present in the <strong>java.util</strong> package.<br>
<br>
<h4>Key Features of Vector</h4>
<br>
<ul>
<li><strong>Underlying Data Structure</strong> - Growable array (resizable array).</li>
<li><strong>Duplicates Allowed</strong> - Same element can appear multiple times.</li>
<li><strong>Insertion Order Preserved</strong> - Elements maintain their insertion order.</li>
<li><strong>Null Insertion Possible</strong> - Null values can be added.</li>
<li><strong>Heterogeneous Objects Allowed</strong> - Can store different types (without generics).</li>
<li><strong>Synchronized (Thread-Safe)</strong> - Every method in Vector is synchronized, making it safe for multi-threaded access.</li>
<li><strong>Implements</strong> Serializable, Cloneable, and RandomAccess interfaces.</li>
<li><strong>Best Choice for Retrieval</strong> - Due to index-based access (O(1)).</li>
<li><strong>Legacy Class</strong> - Vector was present since JDK 1.0, before the Collection Framework was introduced in JDK 1.2.</li>
</ul>`,
                codeExamples: [
                  `import java.util.Vector;
import java.util.Iterator;

public class VectorBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(); // creates an empty Vector named v

        // Adding elements
        v.add("Java");
        v.add("Python");
        v.add("C++");
        v.add("Java");   // duplicate allowed
        v.add(null);      // null allowed

        System.out.println("Vector: " + v);
        System.out.println("Size: " + v.size());
        System.out.println("Capacity: " + v.capacity());

        // Accessing elements
        System.out.println("Element at index 1: " + v.get(1));

        // Removing elements
        v.remove("Java");   // removes first occurrence
        v.remove(0);        // removes by index
        System.out.println("After removal: " + v);

        // Iterating
        System.out.println("--- Iterating ---");
        Iterator<String> it = v.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }
    }
}`
                ]
              },
              {
                content: `<h4>Vector's 4 Constructors and Growth Policy</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Constructor</th><th style="text-align:left;">What It Does</th><th style="text-align:left;">New Capacity When Full</th></tr>
<tr><td><strong>Vector()</strong></td><td>Empty vector, default capacity <strong>10</strong></td><td>2 &times; current capacity</td></tr>
<tr><td><strong>Vector(int initialCapacity)</strong></td><td>Empty vector with given capacity</td><td>2 &times; current capacity</td></tr>
<tr><td><strong>Vector(int initialCapacity, int incrementalCapacity)</strong></td><td>Empty vector, custom growth step</td><td>current capacity + incrementalCapacity</td></tr>
<tr><td><strong>Vector(Collection c)</strong></td><td>Vector pre-filled from an existing collection</td><td>-</td></tr>
</table>
<br>
This is the key difference from ArrayList's growth policy: ArrayList grows by <strong>50%</strong> of its current size, while Vector <strong>doubles</strong> its size by default (or grows by a fixed increment if one is specified in the constructor).<br>`
              },
{
                content: `<h3>Vector Methods and Constructors</h3>
<br>
<h4>Methods</h4>
<br>
<strong>For Adding Objects:</strong><br>
<ul>
<li><strong>add(Object o)</strong> - Adds element to the end.</li>
<li><strong>add(int index, Object o)</strong> - Inserts element at specified index.</li>
<li><strong>addElement(Object o)</strong> - Adds element to the end of the vector.</li>
</ul>
<br>
<strong>For Removing Objects:</strong><br>
<ul>
<li><strong>remove(Object o)</strong> - Removes first occurrence of the element.</li>
<li><strong>remove(int index)</strong> - Removes element at specified index.</li>
<li><strong>removeElement(Object o)</strong> - Removes first occurrence of the element.</li>
</ul>
<br>
<strong>For Accessing Elements:</strong><br>
<ul>
<li><strong>Object get(int index)</strong> - Returns element at the specified index.</li>
<li><strong>Object ElementAt(int index)</strong> - Returns element at the specified index.</li>
<li><strong>Object firstElement()</strong> - Returns the first element.</li>
<li><strong>Object lastElement()</strong> - Returns the last element.</li>
</ul>
<br>
<strong>Other Methods:</strong><br>
<ul>
<li><strong>int size()</strong> - Returns the number of elements in the Vector.</li>
<li><strong>int capacity()</strong> - Returns the current capacity of the Vector.</li>
</ul>
<br>
<h4>Constructors</h4>
<br>
1. <strong>Vector v = new Vector();</strong> - Create empty object with default initial capacity 10, new capacity = 2 * current capacity.<br>
2. <strong>Vector v = new Vector(int initialcapacity);</strong> - Create empty vector with specified initial capacity.<br>
3. <strong>Vector v = new Vector(int initialcapacity, int incrementalcapacity);</strong> - Create vector with specified initial capacity and incremental capacity.<br>
4. <strong>Vector v = new Vector(Collection c);</strong> - Create equivalent vector for given collection.<br>`,
                codeExamples: [
                  `// Example 1 - Capacity demonstration
package com.javaschoollab.demo;

import java.util.Vector;

public class VectorCapacityGrowthDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector vector = new Vector(); // creates an empty Vector named vector
        System.out.println(vector.capacity());    // Default Capacity: 10
        for (int i = 1; i <= 10; i++) {
            vector.addElement(i);
        }
        System.out.println(vector.capacity());    // Check Capacity
        vector.addElement("Bharat");
        System.out.println(vector.capacity());    // Check Updated Capacity
        System.out.println(vector);
    }
}
// OUTPUT:
// 10
// 10
// 20
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, Bharat]`,
                  `// Example 2 - Remove specific elements
package com.javaschoollab.demo;

import java.util.Vector;

public class VectorRemoveAllOccurrencesDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> vector = new Vector<String>(); // creates an empty Vector named vector
        vector.add("Dheeraj");    // Index: 0
        vector.add("Pankaj");     // Index: 1
        vector.add("Pune");       // Index: 2
        vector.add("Pune");       // Index: 3

        while (vector.contains("Pune")) {
            vector.remove("Pune");
        }
        System.out.println("new vector is=" + vector);
    }
}
// OUTPUT: new vector is= [Dheeraj, Pankaj]`,
                  `// Example 3 - Iteration methods
package com.javaschoollab.demo;

import java.util.Iterator;
import java.util.Vector;

public class VectorIterationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> vector = new Vector<>(); // creates an empty Vector named vector
        vector.add("A");
        vector.add("B");
        vector.add("C");
        vector.add("Z");
        vector.add("Y");
        vector.add("X");

        // 1st Way: By Simple Way
        System.out.println("Using Simple Way >> " + vector);

        // 2nd Way: By Iterator
        Iterator<String> itr = vector.iterator();
        while (itr.hasNext()) {
            System.out.println("Using Iterator >> " + itr.next());
        }

        // 3rd Way: By Using For Each
        for (String s : vector) {
            System.out.println("Using For Each Loop >> " + s);
        }
    }
}`
                ]
              },
              {
                content: `<h3>Enumeration - Vector's Legacy Iteration</h3>
Before <strong>Iterator</strong> existed (JDK 1.0), Vector used <strong>Enumeration</strong> to traverse elements. It still works today via the <strong>elements()</strong> method, though Iterator is preferred in modern code.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Enumeration</th><th style="text-align:left;">Iterator</th></tr>
<tr><td>hasMoreElements()</td><td>hasNext()</td></tr>
<tr><td>nextElement()</td><td>next()</td></tr>
<tr><td>No remove() method - <strong>read-only</strong></td><td>Has remove() - can delete during traversal</td></tr>
<tr><td>Not fail-fast</td><td>Fail-fast (throws ConcurrentModificationException)</td></tr>
<tr><td>Legacy - only for Vector / Hashtable</td><td>Works with any Collection</td></tr>
</table>
<br>
<h4>Legacy Methods vs Their Modern Equivalents</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Legacy Method (Vector-specific)</th><th style="text-align:left;">Modern Equivalent (Collection/List)</th></tr>
<tr><td>addElement(Object o)</td><td>add(Object o)</td></tr>
<tr><td>removeElement(Object o)</td><td>remove(Object o)</td></tr>
<tr><td>removeAllElements()</td><td>clear()</td></tr>
<tr><td>elementAt(int index)</td><td>get(int index)</td></tr>
<tr><td>firstElement() / lastElement()</td><td>get(0) / get(size()-1)</td></tr>
<tr><td>elements()</td><td>iterator()</td></tr>
</table>`,
                codeExamples: [
                  `import java.util.Enumeration;
import java.util.Vector;

public class EnumerationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> vector = new Vector<>(); // creates an empty Vector named vector
        vector.add("Pankaj");
        vector.add("Dheeraj");
        vector.add("Sheru");

        // Legacy way to traverse a Vector
        Enumeration<String> en = vector.elements();
        while (en.hasMoreElements()) {
            System.out.println("Using Enumeration: " + en.nextElement());
        }

        // Legacy access methods
        System.out.println("firstElement(): " + vector.firstElement());
        System.out.println("lastElement(): " + vector.lastElement());
        System.out.println("elementAt(1): " + vector.elementAt(1));
    }
}
// OUTPUT:
// Using Enumeration: Pankaj
// Using Enumeration: Dheeraj
// Using Enumeration: Sheru
// firstElement(): Pankaj
// lastElement(): Sheru
// elementAt(1): Dheeraj`
                ]
              },
              {
                content: `<h3>Vector - Complete Method Reference (~48 Methods)</h3>
Vector exposes this many methods because it carries BOTH its original JDK 1.0 legacy API AND the full modern <strong>List</strong> interface (it was retrofitted in JDK 1.2). Grouped by purpose:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Adding (Modern)</strong></td><td>add(E), add(int,E), addAll(Collection), addAll(int,Collection)</td></tr>
<tr><td><strong>2. Adding (Legacy)</strong></td><td>addElement(E), insertElementAt(E,int)</td></tr>
<tr><td><strong>3. Removing (Modern)</strong></td><td>remove(Object), remove(int), removeAll(Collection), removeIf(Predicate), clear()</td></tr>
<tr><td><strong>4. Removing (Legacy)</strong></td><td>removeElement(Object), removeElementAt(int), removeAllElements()</td></tr>
<tr><td><strong>5. Accessing (Modern)</strong></td><td>get(int)</td></tr>
<tr><td><strong>6. Accessing (Legacy)</strong></td><td>elementAt(int), firstElement(), lastElement(), elements()</td></tr>
<tr><td><strong>7. Updating</strong></td><td>set(int,E) (modern), setElementAt(E,int) (legacy)</td></tr>
<tr><td><strong>8. Searching</strong></td><td>contains(Object), containsAll(Collection), indexOf(Object), indexOf(Object,int), lastIndexOf(Object), lastIndexOf(Object,int)</td></tr>
<tr><td><strong>9. Size / Capacity</strong></td><td>size(), isEmpty(), capacity(), ensureCapacity(int), setSize(int), trimToSize()</td></tr>
<tr><td><strong>10. Iteration</strong></td><td>iterator(), listIterator(), listIterator(int), forEach(Consumer)</td></tr>
<tr><td><strong>11. Bulk / Functional Ops</strong></td><td>retainAll(Collection), replaceAll(UnaryOperator), sort(Comparator), copyInto(Object[])</td></tr>
<tr><td><strong>12. Array / Stream / Other</strong></td><td>toArray(), toArray(T[]), subList(int,int), spliterator(), clone(), equals(Object), hashCode(), toString()</td></tr>
</table>
<br>
<strong>Note:</strong> Every one of these is <strong>synchronized</strong> in Vector - that's the one thing every method in this list has in common, and the reason Vector is slower than ArrayList for the exact same operations.<br>`
              },
              {
                content: `<h4>Legacy Insert/Update Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// insertElementAt(E obj, int index) - legacy equivalent of add(int, E)
import java.util.Vector;
public class InsertElementAtDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "C"));
        v.insertElementAt("B", 1);
        System.out.println(v);
    }
}
// OUTPUT: [A, B, C]`,
                  `// setElementAt(E obj, int index) - legacy equivalent of set(int, E)
import java.util.Vector;
public class SetElementAtDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "X", "C"));
        v.setElementAt("B", 1);
        System.out.println(v);
    }
}
// OUTPUT: [A, B, C]`,
                  `// removeElementAt(int index) - legacy equivalent of remove(int)
import java.util.Vector;
public class RemoveElementAtDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        v.removeElementAt(1);
        System.out.println(v);
    }
}
// OUTPUT: [A, C]`,
                  `// removeAllElements() - legacy equivalent of clear()
import java.util.Vector;
public class RemoveAllElementsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        v.removeAllElements();
        System.out.println(v);
    }
}
// OUTPUT: []`,
                  `// copyInto(Object[] array) - legacy way to dump the Vector into a pre-sized array
import java.util.Vector;
public class CopyIntoDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        String[] dest = new String[v.size()];
        v.copyInto(dest);
        System.out.println(java.util.Arrays.toString(dest));
    }
}
// OUTPUT: [A, B, C]`,
                  `// setSize(int newSize) - grows (padding with null) or truncates the Vector
import java.util.Vector;
public class SetSizeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        v.setSize(2);
        System.out.println("Truncated: " + v);

        v.setSize(4);
        System.out.println("Padded: " + v);
    }
}
// OUTPUT:
// Truncated: [A, B]
// Padded: [A, B, null, null]`
                ]
              },
              {
                content: `<h4>Searching, Size/Status, and Removal Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// isEmpty() - true if the Vector has no elements
import java.util.Vector;
public class VectorIsEmptyDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(); // creates an empty Vector named v
        System.out.println(v.isEmpty());
        v.add("A");
        System.out.println(v.isEmpty());
    }
}
// OUTPUT:
// true
// false`,
                  `// clear() - removes all elements (modern equivalent of removeAllElements())
import java.util.Vector;
public class VectorClearDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B"));
        v.clear();
        System.out.println(v);
    }
}
// OUTPUT: []`,
                  `// containsAll(Collection c) - true if every given element is present
import java.util.Vector;
public class VectorContainsAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<Integer> v = new Vector<>(java.util.List.of(1, 2, 3, 4));
        System.out.println(v.containsAll(java.util.List.of(2, 3)));
        System.out.println(v.containsAll(java.util.List.of(2, 9)));
    }
}
// OUTPUT:
// true
// false`,
                  `// indexOf(Object o, int fromIndex) - search starting from a given index
import java.util.Vector;
public class VectorIndexOfFromDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "A", "C"));
        System.out.println(v.indexOf("A"));          // first occurrence overall
        System.out.println(v.indexOf("A", 1));        // first occurrence from index 1
    }
}
// OUTPUT:
// 0
// 2`,
                  `// lastIndexOf(Object o, int fromIndex) - search backwards starting at a given index
import java.util.Vector;
public class VectorLastIndexOfFromDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "A", "C"));
        System.out.println(v.lastIndexOf("A"));       // last occurrence overall
        System.out.println(v.lastIndexOf("A", 1));     // last occurrence at or before index 1
    }
}
// OUTPUT:
// 2
// 0`,
                  `// removeAll(Collection c) / retainAll(Collection c)
import java.util.Vector;
public class VectorRemoveRetainAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<Integer> v1 = new Vector<>(java.util.List.of(1, 2, 3, 4));
        v1.removeAll(java.util.List.of(2, 4));
        System.out.println("After removeAll: " + v1);

        Vector<Integer> v2 = new Vector<>(java.util.List.of(1, 2, 3, 4));
        v2.retainAll(java.util.List.of(2, 4));
        System.out.println("After retainAll: " + v2);
    }
}
// OUTPUT:
// After removeAll: [1, 3]
// After retainAll: [2, 4]`,
                  `// removeIf(Predicate filter) - JDK 8 conditional removal
import java.util.Vector;
public class VectorRemoveIfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<Integer> v = new Vector<>(java.util.List.of(1, 2, 3, 4, 5));
        v.removeIf(n -> n % 2 == 0);
        System.out.println(v);
    }
}
// OUTPUT: [1, 3, 5]`
                ]
              },
              {
                content: `<h4>Bulk, Functional, and Utility Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// addAll(Collection c) / addAll(int index, Collection c)
import java.util.Vector;
public class VectorAddAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<Integer> v = new Vector<>(java.util.List.of(1, 4));
        v.addAll(java.util.List.of(5, 6));           // append at end
        v.addAll(1, java.util.List.of(2, 3));         // insert starting at index 1
        System.out.println(v);
    }
}
// OUTPUT: [1, 2, 3, 4, 5, 6]`,
                  `// forEach(Consumer action) - JDK 8 functional iteration
import java.util.Vector;
public class VectorForEachDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        v.forEach(item -> System.out.println("Item: " + item));
    }
}
// OUTPUT:
// Item: A
// Item: B
// Item: C`,
                  `// replaceAll(UnaryOperator operator) - JDK 8 in-place transform
import java.util.Vector;
public class VectorReplaceAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<Integer> v = new Vector<>(java.util.List.of(1, 2, 3));
        v.replaceAll(n -> n * 10);
        System.out.println(v);
    }
}
// OUTPUT: [10, 20, 30]`,
                  `// sort(Comparator c) - in-place sort
import java.util.Comparator;
import java.util.Vector;
public class VectorSortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("Banana", "Apple", "Cherry"));
        v.sort(Comparator.naturalOrder());
        System.out.println(v);
    }
}
// OUTPUT: [Apple, Banana, Cherry]`,
                  `// listIterator() / listIterator(int index) - bidirectional cursor
import java.util.ListIterator;
import java.util.Vector;
public class VectorListIteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        ListIterator<String> lit = v.listIterator();
        while (lit.hasNext()) System.out.println(lit.next());
    }
}
// OUTPUT:
// A
// B
// C`,
                  `// subList(int fromIndex, int toIndex) - view of a range
import java.util.Vector;
public class VectorSubListDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C", "D"));
        System.out.println(v.subList(1, 3));
    }
}
// OUTPUT: [B, C]`,
                  `// toArray() / toArray(T[] a)
import java.util.Vector;
public class VectorToArrayDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        Object[] generic = v.toArray();
        String[] typed = v.toArray(new String[0]);
        System.out.println(generic.length + " " + java.util.Arrays.toString(typed));
    }
}
// OUTPUT: 3 [A, B, C]`,
                  `// spliterator() - splittable iterator for parallel processing
import java.util.Spliterator;
import java.util.Vector;
public class VectorSpliteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> v = new Vector<>(java.util.List.of("A", "B", "C"));
        Spliterator<String> sp = v.spliterator();
        sp.forEachRemaining(System.out::println);
    }
}
// OUTPUT:
// A
// B
// C`,
                  `// clone() / equals() / hashCode() / toString()
import java.util.Vector;
public class VectorCloneEqualsDemo { // class that holds the main method
    @SuppressWarnings("unchecked")
    public static void main(String[] args) { // program entry point
        Vector<String> v1 = new Vector<>(java.util.List.of("A", "B"));
        Vector<String> v2 = (Vector<String>) v1.clone();
        v2.add("C");

        System.out.println("Original: " + v1.toString());
        System.out.println("Clone: " + v2);
        System.out.println("Equal? " + v1.equals(v2));
        System.out.println("Same hashCode? " + (v1.hashCode() == v2.hashCode()));
    }
}
// OUTPUT:
// Original: [A, B]
// Clone: [A, B, C]
// Equal? false
// Same hashCode? false`
                ]
              },
{
                content: `<h3>ArrayList vs Vector - Detailed Comparison</h3>
<br>
<h4>Key Differences</h4>
<br>
1. Every method in <strong>ArrayList</strong> is <strong>non-synchronized</strong>; Every method in <strong>Vector</strong> is <strong>synchronized</strong>.<br>
2. Multiple threads allowed on ArrayList (<strong>not thread safe</strong>); Only one thread allowed on Vector (<strong>thread safe</strong>).<br>
3. ArrayList is <strong>faster</strong> (non-synchronized); Vector is <strong>slowest</strong> (synchronized/Thread Safe).<br>
4. Threads not required to wait for ArrayList (<strong>performance high</strong>); Threads required to wait for Vector (<strong>performance low</strong>).<br>
5. ArrayList introduced in <strong>1.2 version</strong> (non-legacy); Vector introduced in <strong>1.0 version</strong> (legacy class).<br>
<br>
<h4>Detailed Features Comparison Table</h4>
<br>
<table border="1" cellpadding="6" cellspacing="0">
<tr><th>Feature</th><th>ArrayList</th><th>Vector</th></tr>
<tr><td><strong>Synchronization</strong></td><td>Not Synchronized</td><td>Synchronized</td></tr>
<tr><td><strong>Performance</strong></td><td>Faster</td><td>Slower</td></tr>
<tr><td><strong>Legacy</strong></td><td>Java 1.2</td><td>Java 1.0</td></tr>
<tr><td><strong>Growth Policy</strong></td><td>Increases by 50%</td><td>Doubles its size</td></tr>
<tr><td><strong>Iterator</strong></td><td>Fail-fast</td><td>Fail-fast (only the legacy <code>Enumeration</code> is not)</td></tr>
<tr><td><strong>Usage</strong></td><td>Single-threaded</td><td>Multi-threaded</td></tr>
</table>
<br>
<strong>Note:</strong> Legacy class means which comes from old generation. Ex: Stack & Vector are legacy classes.<br>`,
                codeExamples: [
                  `// Synchronized Vector with threads
package com.javaschoollab.demo;

import java.util.Vector;

public class SynchronizedVectorExample { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<Integer> vector = new Vector<>(); // creates an empty Vector named vector

        Runnable addElements = () -> {
            for (int i = 0; i < 5; i++) {
                vector.add(i);
                System.out.println("Added: " + i + " by " + Thread.currentThread().getName());
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };

        Thread thread1 = new Thread(addElements, "Thread-1");
        Thread thread2 = new Thread(addElements, "Thread-2");

        thread1.start();
        thread2.start();

        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Final Vector: " + vector);
    }
}`,
                  `// Custom objects with Vector
package com.javaschoollab.demo;

import java.util.Vector;

class Student {
    private String name;
    private int id;
    public Student(String name, int id) {
        this.name = name;
        this.id = id;
    }
    @Override
    public String toString() {
        return "Student{name='" + name + "', id=" + id + "}";
    }
}

public class CustomObjectVectorExample { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<Student> students = new Vector<>(); // creates an empty Vector named students
        students.add(new Student("Anaji", 1));
        students.add(new Student("Baji", 2));
        students.add(new Student("Chimnaji", 3));

        System.out.println("Students Vector: " + students);

        Student student = students.get(1); // gets the second element (index 1)
        System.out.println("Student at index 1: " + student);

        students.remove(0); // removes the first element (index 0)
        System.out.println("Students Vector after removal: " + students);

        System.out.println("Iterating over Students Vector:");
        for (Student s : students) {
            System.out.println(s);
        }
    }
}`
                ]
              },
              {
                content: `<h3>Internal Working of Vector</h3>
Vector is the simplest internal structure of any collection covered in this course - there's no hashing, no tree, and no Node objects at all. It's just a plain <strong>Object[] array</strong> with synchronized methods wrapped around it.<br>
<br>
<h4>Key Points</h4>
<br>
<ul>
<li>Vector internally holds: <strong>protected Object[] elementData;</strong> and <strong>protected int elementCount;</strong> (the array's allocated size vs how many slots are actually filled - this is exactly what capacity() vs size() report).</li>
<li><strong>add(e)</strong> internally does: check if <code>elementCount == elementData.length</code> (array full?) &rarr; if so, grow the array first &rarr; then <code>elementData[elementCount++] = e;</code>.</li>
<li><strong>get(index)</strong> internally does: <code>return (E) elementData[index];</code> - a direct array read, which is why it's O(1) exactly like ArrayList.</li>
<li><strong>Growth</strong> - if no <code>capacityIncrement</code> was given in the constructor, the new capacity is <code>2 * elementData.length</code> (doubling); if a capacityIncrement WAS given, it's <code>elementData.length + capacityIncrement</code> instead.</li>
<li>Every one of these operations is wrapped in a <code>synchronized</code> block at the method level - the array logic itself is identical to ArrayList's.</li>
</ul>
<br>
<h3>Class Diagram: Vector's Structure (and How Stack Reuses It)</h3>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">AbstractList&lt;E&gt; &nbsp;<span style="color:#777;">implements List&lt;E&gt;</span></td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<strong>Vector&lt;E&gt;</strong> &nbsp;<span style="font-size:11px; color:#777;">implements List&lt;E&gt;, RandomAccess, Cloneable, Serializable</span><br>
<span style="font-size:12px; font-family:monospace;">- elementData: Object[]<br>- elementCount: int<br>- capacityIncrement: int</span>
</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px;">
<strong>Stack&lt;E&gt;</strong> &nbsp;<span style="color:#777;">adds 5 methods only: push, pop, peek, empty, search</span>
</td>
</tr>
</table>
<br>
<strong>The key contrast with HashSet/TreeSet:</strong> those two composed a completely separate object (a HashMap or TreeMap field). Stack does neither - it's <strong>pure inheritance, no composition at all</strong>. There is no second array anywhere; Stack's push()/pop()/peek() are thin one-line methods that call straight through to the SAME <code>elementData</code> array field it inherited from Vector:<br>
<br>
<code>
public E push(E item) { addElement(item); return item; }<br>
public E pop() { E obj = peek(); removeElementAt(size() - 1); return obj; }<br>
public E peek() { return elementAt(size() - 1); }<br>
</code>
<br>
This is exactly why Stack.get(0) works even though it "shouldn't" for a proper stack (mentioned in the Stack topic's "Stack vs ArrayDeque" comparison) - get(index) is just inherited straight from Vector/AbstractList with zero override, because Stack never restricted access to the underlying array in the first place.<br>`
              }
            ]
          },

          // ----- Stack -----
          {
            id: 'stack',
            name: 'Stack',
            beginner: [
{
                content: `<h3>Stack</h3>
<strong>Stack</strong> is a subclass of <strong>Vector</strong> that implements the <strong>LIFO (Last In First Out)</strong> principle. The element that is pushed last onto the stack is the first one to be popped off. Stack is present in the <strong>java.util</strong> package.<br>
<br>
<h4>Key Features</h4>
<br>
<ul>
<li><strong>LIFO Order</strong> - Last element added is the first to be removed.</li>
<li><strong>Extends Vector</strong> - Inherits all methods from Vector class.</li>
<li><strong>Synchronized</strong> - Since it extends Vector, Stack is also thread-safe.</li>
</ul>
<br>
<h4>Stack-Specific Methods</h4>
<br>
<ul>
<li><strong>push(Object obj)</strong> - Pushes an element onto the top of the stack.</li>
<li><strong>pop()</strong> - Removes and returns the top element of the stack.</li>
<li><strong>peek()</strong> - Returns the top element without removing it.</li>
<li><strong>search(Object obj)</strong> - Returns the 1-based offset from top of the stack, or -1 if not found.</li>
</ul>
<br>
<h4>Constructor</h4>
<ul>
<li><strong>Stack s = new Stack();</strong> - Creates an empty Stack.</li>
</ul>
<br>
<h4>How Many Methods Does Stack Actually Have?</h4>
Stack itself declares only <strong>5 methods</strong> - <code>push()</code>, <code>pop()</code>, <code>peek()</code>, <code>empty()</code>, <code>search()</code>. But because it <strong>extends Vector</strong>, every object of type Stack also carries all <strong>~48 of Vector's methods</strong> (add, get, remove, contains, indexOf, subList, forEach, stream via Collection, etc.) - so in practice a Stack instance exposes <strong>~53 usable public methods</strong> in total. See the <strong>Vector</strong> topic for the full method-by-method breakdown of everything Stack inherits.<br>`,
                codeExamples: [
                  `import java.util.Stack;

public class StackBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Stack<String> stack = new Stack<>(); // creates an empty Stack named stack

        // Push elements
        stack.push("Java");
        stack.push("Python");
        stack.push("C++");
        stack.push("JavaScript");

        System.out.println("Stack: " + stack);
        System.out.println("Top element (peek): " + stack.peek());

        // Pop element
        String popped = stack.pop();
        System.out.println("Popped: " + popped);
        System.out.println("After pop: " + stack);

        // Search element
        int position = stack.search("Java");
        System.out.println("Position of Java from top: " + position);

        int notFound = stack.search("Ruby");
        System.out.println("Search Ruby: " + notFound);  // -1
    }
}`
                ]
              },
              {
                content: `<h4>Stack's Class Hierarchy and empty() vs isEmpty()</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Class / Interface</th><th style="text-align:left;">Relationship</th></tr>
<tr><td>Object</td><td>root class</td></tr>
<tr><td>AbstractCollection</td><td>extended by</td></tr>
<tr><td>AbstractList</td><td>extended by</td></tr>
<tr><td><strong>Vector</strong></td><td>extended by</td></tr>
<tr><td><strong>Stack</strong></td><td>final class - implements List, RandomAccess, Cloneable, Serializable (all inherited via Vector)</td></tr>
</table>
<br>
Since Stack inherits from Vector, it also inherits Vector's legacy <strong>empty()</strong> method - functionally identical to <strong>isEmpty()</strong>, just named differently for stack terminology.<br>`,
                codeExamples: [
                  `import java.util.Stack;

public class StackEmptyDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Stack<Integer> stack = new Stack<>(); // creates an empty Stack named stack

        System.out.println("empty(): " + stack.empty());      // true
        System.out.println("isEmpty(): " + stack.isEmpty());  // true (inherited from Vector)

        stack.push(10);
        stack.push(20);

        System.out.println("empty(): " + stack.empty());      // false
        System.out.println("isEmpty(): " + stack.isEmpty());  // false
    }
}`
                ]
              },
{
                content: `<h3>Stack Methods in Detail</h3>
<br>
<strong>Stack</strong> provides the following key methods:<br>
<br>
<strong>1. Object push(Object obj);</strong> - For inserting an object to stack.<br>
<strong>2. Object pop();</strong> - To remove and return top of stack.<br>
<strong>3. Object peek();</strong> - To return the top of stack without removal of object.<br>
<strong>4. int search(Object obj);</strong> - If specified object is available, returns its offset from top of stack. If not available, returns <strong>-1</strong>.<br>
<br>
In the below example, elements A, B, C, D are pushed onto the stack. The <strong>search()</strong> method returns the LIFO-based offset from the top (D=1, C=2, B=3, A=4). Searching for an element not present ("Z") returns -1. The <strong>pop()</strong> method removes and returns the top element (D).<br>`,
                codeExamples: [
                  `import java.util.Stack;

public class StackDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Stack<String> obj = new Stack<>(); // creates an empty Stack named obj

        // Use Push() Method => For Insert the Data
        obj.push("A");    // 4
        obj.push("B");    // 3
        obj.push("C");    // 2
        obj.push("D");    // 1
        System.out.println(obj);

        // Using Search() Method Here
        System.out.println(obj.search("A"));    // 4 => LIFO
        System.out.println(obj.search("B"));    // 3 => LIFO
        System.out.println(obj.search("C"));    // 2 => LIFO
        System.out.println(obj.search("D"));    // 1 => LIFO

        System.out.println(obj.search("Z"));    // -1 => Not Present

        // Using POP Method Here
        System.out.println(obj.pop());    // D Element (Top Element) Remove here

        // Calling All Data Here
        System.out.println(obj);    // A B C
    }
}
// OUTPUT:
// [A, B, C, D]
// 4
// 3
// 2
// 1
// -1
// D
// [A, B, C]`
                ]
              },
              {
                content: `<h3>Stack vs ArrayDeque - Why Modern Code Avoids Stack</h3>
Java's official documentation itself recommends <strong>ArrayDeque</strong> over <strong>Stack</strong> for stack operations in new code. Stack is a legacy class carrying baggage that ArrayDeque avoids.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Property</th><th style="text-align:left;">Stack</th><th style="text-align:left;">ArrayDeque</th></tr>
<tr><td><strong>Introduced</strong></td><td>JDK 1.0 (legacy)</td><td>JDK 1.6</td></tr>
<tr><td><strong>Underlying Structure</strong></td><td>Extends Vector (array-based)</td><td>Resizable array (Deque)</td></tr>
<tr><td><strong>Synchronized</strong></td><td>Yes (every method - slow)</td><td>No (faster, use manual sync if needed)</td></tr>
<tr><td><strong>Allows Null</strong></td><td>Yes</td><td>No - throws NullPointerException</td></tr>
<tr><td><strong>Push/Pop Methods</strong></td><td>push(e) / pop() / peek()</td><td>push(e) / pop() / peek() (same API!)</td></tr>
<tr><td><strong>Extra Baggage</strong></td><td>Inherits ALL List methods from Vector (get(index), insert in middle, etc.) - breaks stack discipline</td><td>Only Deque methods - enforces proper stack/queue usage</td></tr>
<tr><td><strong>Recommended For New Code</strong></td><td>No</td><td>Yes</td></tr>
</table>`,
                codeExamples: [
                  `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Stack;

public class StackVsArrayDequeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Old way - Stack (legacy, synchronized, allows breaking discipline)
        Stack<Integer> legacyStack = new Stack<>(); // creates an empty Stack named legacyStack
        legacyStack.push(1);
        legacyStack.push(2);
        legacyStack.push(3);
        System.out.println("Stack: " + legacyStack);
        System.out.println("Stack pop(): " + legacyStack.pop());

        // Problem: Stack extends Vector, so this "breaks" stack discipline -
        // you can access ANY element by index, not just the top!
        System.out.println("Stack.get(0) - shouldn't normally be allowed: " + legacyStack.get(0));

        // Modern way - ArrayDeque used as a stack (recommended)
        Deque<Integer> modernStack = new ArrayDeque<>();
        modernStack.push(1);
        modernStack.push(2);
        modernStack.push(3);
        System.out.println("ArrayDeque: " + modernStack);
        System.out.println("ArrayDeque pop(): " + modernStack.pop());
        // No get(index) available - only proper stack operations
    }
}`
                ]
              },
{
                content: `<h3>Stack with Vector Iteration Methods</h3>
Since <strong>Stack</strong> extends <strong>Vector</strong>, all Vector methods (including iteration via <strong>Iterator</strong>, <strong>For-Each loop</strong>) are also available on Stack.<br>
<br>
In the below example, elements are added to a Vector using the <strong>add()</strong> method. Note that <strong>duplicates are allowed</strong> (e.g., "Pankaj" appears twice). The elements can be iterated in three ways:<br>
<br>
<strong>1st Way:</strong> Normal way - Simply print the Vector object directly.<br>
<strong>2nd Way:</strong> By using <strong>Iterator</strong> - Use <code>iterator()</code> method and traverse with <code>hasNext()</code> and <code>next()</code>.<br>
<strong>3rd Way:</strong> By using <strong>For-Each Loop</strong> - Enhanced for loop for cleaner syntax.<br>`,
                codeExamples: [
                  `import java.util.Iterator;
import java.util.Vector;

public class A3 { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Vector<String> obj = new Vector<String>(); // creates an empty Vector named obj

        // Adding Elements = Add() Method
        obj.add("Akash");       // 0th Index
        obj.add("Avinash");     // 1st
        obj.add("Pilaji");
        obj.add("Pratiksha");
        obj.add("Shraddha");
        obj.add("Vaishnavi");
        obj.add("Sambhaji");
        obj.add("Supriya");
        obj.add("Sushmita");
        obj.add("Mayuri");
        obj.add("Yashashri");
        obj.add("Pankaj");
        obj.add("Pankaj");      // Duplicate Allow

        // 1st Way => Normal Way
        System.out.println(obj);

        // 2nd Way => By Using Iterator
        Iterator<String> itr = obj.iterator();
        while (itr.hasNext()) {
            System.out.println("By Using Iterator:>> " + itr.next());
        }

        // 3rd Way => By Using For Each
        for (String s : obj) {
            System.out.println("By Using For Each Loop:>> " + s);
        }
    }
}`
                ]
              },
              {
                content: `<h3>Class Diagram: Stack's 5 Methods, All Delegating to Vector</h3>
The full Vector-to-Stack class diagram (with the array field and growth mechanics) lives in the <strong>Vector</strong> topic's Internal Working section - here's the zoomed-in view of just Stack's own 5 methods and exactly what each one delegates to.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Stack Method</th><th style="text-align:left;">Delegates To (inherited from Vector)</th></tr>
<tr><td><strong>push(item)</strong></td><td><code>addElement(item)</code> - appends to elementData, growing the array if needed</td></tr>
<tr><td><strong>pop()</strong></td><td><code>peek()</code> then <code>removeElementAt(size() - 1)</code> - reads then shrinks elementCount</td></tr>
<tr><td><strong>peek()</strong></td><td><code>elementAt(size() - 1)</code> - a direct array read at the last filled index</td></tr>
<tr><td><strong>empty()</strong></td><td><code>isEmpty()</code> - checks <code>elementCount == 0</code></td></tr>
<tr><td><strong>search(o)</strong></td><td>a manual loop calling <code>lastIndexOf(o)</code> internally, then converts the array index into a 1-based "distance from top"</td></tr>
</table>
<br>
Not one of these 5 methods introduces a new field or a new data structure - Stack is 100% <strong>behavior</strong> added on top of Vector's existing <code>elementData</code> array, with zero new state. That's the whole internal story.<br>`
              }
            ]
          }
        ]
      },

      // ===== SubTopic 3: Set Interface =====
      {
        id: 'set',
        name: 'Set Interface',
        topics: [

          // ----- HashSet -----
          {
            id: 'hashset',
            name: 'HashSet',
            beginner: [
{
                content: `<h3>Set Interface and HashSet</h3>
<strong>Set</strong> is a child interface of <strong>Collection</strong>, found in the <strong>java.util</strong> package. It represents a collection that does <strong>not allow duplicate elements</strong>. The Set interface is implemented by <strong>HashSet</strong>, <strong>LinkedHashSet</strong>, and <strong>TreeSet</strong>.<br>
<br>
<strong>HashSet</strong> stores elements using a <strong>hash table</strong> internally. It is the most commonly used Set implementation.<br>
<br>
<h4>Key Features of HashSet</h4>
<br>
<ul>
<li><strong>No Duplicates Allowed</strong> - If you try to add a duplicate, the add() method returns false and the element is not added.</li>
<li><strong>Insertion Order Not Preserved</strong> - Elements are stored based on their hash code, not insertion order.</li>
<li><strong>Only One Null Allowed</strong> - You can add one null element, but not more than one (since duplicates are not allowed).</li>
<li><strong>Non-Synchronized</strong> - Not thread-safe by default.</li>
<li><strong>Heterogeneous Objects Allowed</strong> - Can store different types without generics.</li>
<li><strong>Backed by HashMap</strong> - Internally, HashSet uses a HashMap to store elements.</li>
</ul>`,
                codeExamples: [
                  `import java.util.HashSet;
import java.util.Iterator;

public class HashSetBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(); // creates an empty HashSet named set

        // Adding elements
        set.add("Java");
        set.add("Python");
        set.add("C++");
        set.add("Java");    // duplicate - won't be added
        set.add(null);       // null allowed

        System.out.println("HashSet: " + set);
        System.out.println("Size: " + set.size());

        // Check if element exists
        System.out.println("Contains Java? " + set.contains("Java"));

        // Remove element
        set.remove("C++");
        System.out.println("After remove: " + set);

        // Iterate
        System.out.println("--- Iterating ---");
        Iterator<String> it = set.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }

        // Note: Output order may differ from insertion order
    }
}`
                ]
              },
{
                content: `<h3>HashSet Constructors</h3>
<br>
<h4>Constructors</h4>
<br>
1. <strong>HashSet h = new HashSet();</strong> - Default initial capacity <strong>16</strong>, load factor/fill ratio <strong>0.75</strong>.<br>
2. <strong>HashSet h = new HashSet(int initialCapacity);</strong> - Creates HashSet with given capacity.<br>
3. <strong>HashSet h = new HashSet(int initialCapacity, float loadFactor);</strong> - Creates HashSet with given capacity and load factor.<br>
4. <strong>HashSet h = new HashSet(Collection c);</strong> - Creates equivalent HashSet for given collection.<br>
<br>
<h4>Load Factor / Fill Ratio</h4>
<br>
After filling 75% ratio, a new HashSet object is created. Load factor = 0.75 means after filling 75% of current capacity, a new larger HashSet is created.<br>`,
                codeExamples: [
                  `package com.pankaj;

import java.util.HashSet;

public class HashSetUniquenessDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet hs = new HashSet(); // creates an empty HashSet named hs
        hs.add(3);
        hs.add("ram");
        hs.add("Udgir");
        hs.add(3);          // Duplicate Not Allowed
        hs.add("Udgir");    // Duplicate Not Allowed

        System.out.println(hs);
    }
}
// OUTPUT: [3, Udgir, ram]`,
                  `package com.arraylist;

import java.util.HashSet;

public class HashSetExample { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(); // creates an empty HashSet named set
        set.add("Hello");
        set.add("Pankaj");
        set.add("Java");
        set.add("Pankaj");     // Duplicate, will not be added

        System.out.println("HashSet: " + set);

        boolean containsJava = set.contains("Java");
        System.out.println("HashSet contains 'Java': " + containsJava);

        set.remove("World");
        System.out.println("HashSet after removing 'World': " + set);
    }
}
// OUTPUT:
// HashSet: [Java, Hello, Pankaj]
// HashSet contains 'Java': true
// HashSet after removing 'World': [Java, Hello, Pankaj]`
                ]
              },
              {
                content: `<h4>HashSet: addAll() and forEach()</h4>
<br>
<ul>
<li><strong>addAll(Collection)</strong> - Merges all elements of another collection into this HashSet (duplicates across the two are automatically dropped).</li>
<li><strong>forEach(Consumer)</strong> - JDK 8 functional-style iteration using a lambda, instead of an explicit loop.</li>
</ul>`,
                codeExamples: [
                  `import java.util.HashSet;

public class HashSetAddAllForEachDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Object> hashSet = new HashSet<>();    // HashSet: 01
        hashSet.add(10);
        hashSet.add(20);
        hashSet.add(30);
        hashSet.add("pankaj");
        hashSet.add("pune");
        System.out.println("1st Set:>> " + hashSet);

        HashSet<Object> hashSet1 = new HashSet<>();    // HashSet: 02
        hashSet1.add(40);
        hashSet1.add(50);
        hashSet1.add(60);
        System.out.println("2nd Set:>> " + hashSet1);

        // Merge 2nd set into 1st
        hashSet.addAll(hashSet1);
        System.out.println("After Adding:>> " + hashSet);
    }
}`,
                  `import java.util.HashSet;

public class HashSetForEachDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> hashSet = new HashSet<>(); // creates an empty HashSet named hashSet
        hashSet.add(10);
        hashSet.add(20);
        hashSet.add(30);

        // Using forEach() from JDK 1.8
        hashSet.forEach(hs -> System.out.println("By Using For Each:>> " + hs));
    }
}`
                ]
              },
              {
                content: `<h3>HashSet - Complete Method Reference (~20 Methods)</h3>
HashSet has a much smaller API than List implementations because <strong>Set</strong> has no index-based methods (no get(int), no subList()). Grouped by purpose:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Adding</strong></td><td>add(E), addAll(Collection)</td></tr>
<tr><td><strong>2. Removing</strong></td><td>remove(Object), removeAll(Collection), removeIf(Predicate), clear()</td></tr>
<tr><td><strong>3. Searching</strong></td><td>contains(Object), containsAll(Collection)</td></tr>
<tr><td><strong>4. Size / Status</strong></td><td>size(), isEmpty()</td></tr>
<tr><td><strong>5. Set Operations</strong></td><td>retainAll(Collection) - keeps intersection</td></tr>
<tr><td><strong>6. Iteration</strong></td><td>iterator(), forEach(Consumer), spliterator()</td></tr>
<tr><td><strong>7. Array / Stream</strong></td><td>toArray(), toArray(T[]), stream(), parallelStream()</td></tr>
<tr><td><strong>8. Other</strong></td><td>clone(), equals(Object), hashCode(), toString()</td></tr>
</table>`
              },
              {
                content: `<h4>HashSet: Remaining Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// isEmpty() and clear()
import java.util.HashSet;
public class HashSetEmptyClearDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(); // creates an empty HashSet named set
        System.out.println("isEmpty (before add): " + set.isEmpty());
        set.add("A");
        set.add("B");
        System.out.println("isEmpty (after add): " + set.isEmpty());
        set.clear();
        System.out.println("After clear(): " + set);
    }
}
// OUTPUT:
// isEmpty (before add): true
// isEmpty (after add): false
// After clear(): []`,
                  `// containsAll(Collection c) - true if every given element is present
import java.util.HashSet;
public class HashSetContainsAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> set = new HashSet<>(java.util.List.of(1, 2, 3, 4));
        System.out.println(set.containsAll(java.util.List.of(2, 3)));
        System.out.println(set.containsAll(java.util.List.of(2, 9)));
    }
}
// OUTPUT:
// true
// false`,
                  `// removeAll(Collection c) - set difference
import java.util.HashSet;
public class HashSetRemoveAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> set = new HashSet<>(java.util.List.of(1, 2, 3, 4));
        set.removeAll(java.util.List.of(2, 4));
        System.out.println(set);
    }
}
// OUTPUT: [1, 3]`,
                  `// retainAll(Collection c) - set intersection
import java.util.HashSet;
public class HashSetRetainAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> set = new HashSet<>(java.util.List.of(1, 2, 3, 4));
        set.retainAll(java.util.List.of(2, 4, 9));
        System.out.println(set);
    }
}
// OUTPUT: [2, 4]`,
                  `// removeIf(Predicate filter) - JDK 8 conditional removal
import java.util.HashSet;
public class HashSetRemoveIfDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> set = new HashSet<>(java.util.List.of(1, 2, 3, 4, 5));
        set.removeIf(n -> n % 2 == 0);
        System.out.println(set);
    }
}
// OUTPUT: [1, 3, 5]`,
                  `// toArray() / toArray(T[] a)
import java.util.HashSet;
public class HashSetToArrayDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(java.util.List.of("A", "B", "C"));
        Object[] generic = set.toArray();
        String[] typed = set.toArray(new String[0]);
        System.out.println(generic.length + " elements, typed length=" + typed.length);
    }
}
// OUTPUT: 3 elements, typed length=3`,
                  `// stream() / parallelStream() - default Collection methods
import java.util.HashSet;
public class HashSetStreamDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> set = new HashSet<>(java.util.List.of(1, 2, 3, 4, 5));
        long evenCount = set.stream().filter(n -> n % 2 == 0).count();
        System.out.println("Even count: " + evenCount);
    }
}
// OUTPUT: Even count: 2`,
                  `// spliterator() - splittable iterator for parallel processing
import java.util.HashSet;
import java.util.Spliterator;
public class HashSetSpliteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(java.util.List.of("A", "B", "C"));
        Spliterator<String> sp = set.spliterator();
        System.out.println("Estimated size: " + sp.estimateSize());
    }
}
// OUTPUT: Estimated size: 3`,
                  `// clone() / equals() / hashCode() / toString()
import java.util.HashSet;
public class HashSetCloneEqualsDemo { // class that holds the main method
    @SuppressWarnings("unchecked")
    public static void main(String[] args) { // program entry point
        HashSet<String> set1 = new HashSet<>(java.util.List.of("A", "B"));
        HashSet<String> set2 = (HashSet<String>) set1.clone();

        System.out.println("Clone equals original? " + set1.equals(set2));
        System.out.println("Same hashCode? " + (set1.hashCode() == set2.hashCode()));
        System.out.println("toString(): " + set2.toString());
    }
}
// OUTPUT:
// Clone equals original? true
// Same hashCode? true
// toString(): [A, B]`
                ]
              },
              {
                content: `<h4>Deep Dive: HashSet's 4 Constructors and Mathematical Set Operations</h4>
Two things worth knowing beyond the individual method list: exactly how each constructor sizes the backing HashMap, and how HashSet's methods map directly onto the mathematical set operations (union, intersection, difference) from set theory.<br>`,
                codeExamples: [
                  `// All 4 HashSet constructors, side by side
import java.util.HashSet;

public class HashSetConstructorsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> h1 = new HashSet<>();                        // 1. default: capacity 16, load factor 0.75
        HashSet<Integer> h2 = new HashSet<>(32);                      // 2. custom initial capacity 32
        HashSet<Integer> h3 = new HashSet<>(32, 0.5f);                // 3. custom capacity + load factor
        HashSet<Integer> h4 = new HashSet<>(java.util.List.of(1, 2, 3, 2, 1));    // 4. from a Collection

        System.out.println("h4 (from Collection, duplicates dropped): " + h4);
    }
}
// OUTPUT: h4 (from Collection, duplicates dropped): [1, 2, 3]`,
                  `// Mathematical set operations: Union, Intersection, Difference
import java.util.HashSet;

public class HashSetOperationsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Integer> setA = new HashSet<>(java.util.List.of(1, 2, 3, 4));
        HashSet<Integer> setB = new HashSet<>(java.util.List.of(3, 4, 5, 6));

        // UNION: all elements from both sets
        HashSet<Integer> union = new HashSet<>(setA);
        union.addAll(setB);
        System.out.println("Union: " + union);

        // INTERSECTION: only elements present in BOTH sets
        HashSet<Integer> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);
        System.out.println("Intersection: " + intersection);

        // DIFFERENCE (A - B): elements in A but NOT in B
        HashSet<Integer> difference = new HashSet<>(setA);
        difference.removeAll(setB);
        System.out.println("Difference (A - B): " + difference);
    }
}
// OUTPUT:
// Union: [1, 2, 3, 4, 5, 6]
// Intersection: [3, 4]
// Difference (A - B): [1, 2]`
                ]
              },
{
                content: `<h3>Internal Working of HashSet</h3>
When you pass a duplicate element, the <strong>add()</strong> method returns <strong>false</strong>. Internally HashSet uses <strong>HashMap</strong>.<br>
<br>
<h4>HashSet Implementation of add() Method</h4>
<br>
When you open HashSet implementation:<br>
<br>
<code>
public class HashSet&lt;E&gt; extends AbstractSet&lt;E&gt; implements Set&lt;E&gt;, Cloneable, java.io.Serializable {<br>
&nbsp;&nbsp;&nbsp;&nbsp;private transient HashMap&lt;E, Object&gt; map;<br>
&nbsp;&nbsp;&nbsp;&nbsp;private static final Object PRESENT = new Object();<br>
<br>
&nbsp;&nbsp;&nbsp;&nbsp;public HashSet() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;map = new HashMap&lt;&gt;();<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
<br>
&nbsp;&nbsp;&nbsp;&nbsp;public boolean add(E e) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return map.put(e, PRESENT) == null;<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
}
</code><br>
<br>
<h4>How Uniqueness is Achieved</h4>
<br>
<ul>
<li>We achieve uniqueness through <strong>HashMap</strong> internally.</li>
<li>Each element is passed as <strong>key</strong> in HashMap with a dummy value <strong>PRESENT</strong>.</li>
<li><strong>map.put(key, value)</strong> returns <strong>null</strong> if key is unique (added), returns <strong>old value</strong> if duplicate.</li>
<li>So if <strong>map.put(e, PRESENT) == null</strong> returns <strong>true</strong> → element added; returns <strong>false</strong> → duplicate.</li>
</ul>`,
                codeExamples: [
                  `import java.util.HashSet;

public class HashSetInternalDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(); // creates an empty HashSet named set

        // add() returns true if element was added
        System.out.println(set.add("Java"));      // true
        System.out.println(set.add("Python"));     // true
        System.out.println(set.add("Java"));       // false - duplicate

        System.out.println("Set: " + set);
        System.out.println("Size: " + set.size());
    }
}`
                ]
              }
            ]
          },

          // ----- LinkedHashSet -----
          {
            id: 'linkedhashset',
            name: 'LinkedHashSet',
            beginner: [
{
                content: `<h3>LinkedHashSet</h3>
<strong>LinkedHashSet</strong> is a child class of <strong>HashSet</strong> that maintains the <strong>insertion order</strong> of elements. Internally, it uses a <strong>hash table + doubly linked list</strong> combination. This linked list defines the iteration ordering, which is the order in which elements were inserted.<br>
<br>
<h4>Key Features of LinkedHashSet</h4>
<br>
<ul>
<li><strong>Maintains Insertion Order</strong> - Unlike HashSet, the order of elements is predictable and matches insertion order.</li>
<li><strong>No Duplicates Allowed</strong> - Just like HashSet, duplicate elements are rejected.</li>
<li><strong>Allows One Null</strong> - Only one null element is permitted.</li>
<li><strong>Non-Synchronized</strong> - Not thread-safe by default.</li>
<li><strong>Child of HashSet</strong> - Inherits all methods from HashSet.</li>
<li><strong>Slightly Slower than HashSet</strong> - Due to the overhead of maintaining the linked list for ordering.</li>
</ul>
<br>
<h4>How Many Methods Does LinkedHashSet Actually Have?</h4>
LinkedHashSet declares <strong>zero new public methods</strong> of its own - it only overrides internal hooks so the hash table's iteration order matches insertion order. Every method you call on it (<code>add, remove, contains, size, iterator, stream, removeIf, ...</code>) is the exact same <strong>~20 methods inherited from HashSet</strong>. See the <strong>HashSet</strong> topic for the full method-by-method breakdown - everything there applies here identically, just with predictable ordering.<br>`,
                codeExamples: [
                  `import java.util.LinkedHashSet;

public class LinkedHashSetBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedHashSet<String> lhs = new LinkedHashSet<>(); // creates an empty LinkedHashSet named lhs

        lhs.add("Banana");
        lhs.add("Apple");
        lhs.add("Cherry");
        lhs.add("Apple");    // duplicate - not added
        lhs.add("Date");

        // Insertion order is preserved
        System.out.println("LinkedHashSet: " + lhs);
        // Output: [Banana, Apple, Cherry, Date]

        System.out.println("Contains Apple? " + lhs.contains("Apple"));
        System.out.println("Size: " + lhs.size());

        lhs.remove("Cherry");
        System.out.println("After removal: " + lhs);
    }
}`
                ]
              },
              {
                content: `<h4>LinkedHashSet: size(), contains(), remove()</h4>
LinkedHashSet is best suited for developing <strong>cache-based applications</strong> where duplicates aren't allowed and insertion order needs to be preserved.<br>`,
                codeExamples: [
                  `import java.util.LinkedHashSet;

public class LinkedHashSetMethodsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedHashSet<Object> linkedHashSet = new LinkedHashSet<>(); // creates an empty LinkedHashSet named linkedHashSet
        linkedHashSet.add("ram");        // Index 0
        linkedHashSet.add("shyam");      // Index 1
        linkedHashSet.add(null);         // Index 2
        linkedHashSet.add("Pune");       // Index 3
        linkedHashSet.add(10);           // Index 4
        linkedHashSet.add(null);         // duplicate - not added again
        linkedHashSet.add("ram");        // duplicate - not added again

        System.out.println("Original Data: " + linkedHashSet);
        System.out.println("Check Size: " + linkedHashSet.size());
        System.out.println("Check Contains 'shyam': " + linkedHashSet.contains("shyam"));

        linkedHashSet.remove(10); // removes the ELEMENT 10 (Set has no index-based API)
        System.out.println("Updated Data: " + linkedHashSet);
    }
}
// OUTPUT:
// Original Data: [ram, shyam, null, Pune, 10]
// Check Size: 5
// Check Contains 'shyam': true
// Updated Data: [ram, shyam, null, Pune]`
                ]
              },
{
                content: `<h3>HashSet vs LinkedHashSet Comparison</h3>
<br>
<table border="1" cellpadding="5" cellspacing="0">
<tr><th>Property</th><th>HashSet</th><th>LinkedHashSet</th></tr>
<tr><td><strong>Underlying DS</strong></td><td>Hashtable</td><td>LinkedList + Hashtable</td></tr>
<tr><td><strong>Insertion Order</strong></td><td>NOT preserved</td><td>IS preserved</td></tr>
<tr><td><strong>Introduced In</strong></td><td>1.2</td><td>1.4</td></tr>
<tr><td><strong>Duplicates</strong></td><td>Not allowed</td><td>Not allowed</td></tr>
<tr><td><strong>Null Elements</strong></td><td>Allows one null</td><td>Allows one null</td></tr>
</table>
<br>
LinkedHashSet is <strong>slightly slower</strong> than HashSet due to maintaining the linked list.<br>`
              }
            ]
          },

          // ----- TreeSet -----
          {
            id: 'treeset',
            name: 'TreeSet',
            beginner: [
{
                content: `<h3>TreeSet</h3>
<strong>TreeSet</strong> stores elements in <strong>sorted (ascending) order</strong> by default. Internally, it uses a <strong>Red-Black tree</strong> data structure, which is a self-balancing binary search tree.<br>
<br>
<h4>Key Features of TreeSet</h4>
<br>
<ul>
<li><strong>Sorted Order</strong> - Elements are automatically sorted in ascending/natural order.</li>
<li><strong>No Duplicates</strong> - Duplicate elements are not allowed.</li>
<li><strong>No Null</strong> - TreeSet does not allow null elements. Adding null throws <strong>NullPointerException</strong> (since Java 7).</li>
<li><strong>Elements Must Be Comparable</strong> - All elements must implement the <strong>Comparable</strong> interface, or a <strong>Comparator</strong> must be provided at construction time.</li>
<li><strong>Non-Synchronized</strong> - Not thread-safe by default.</li>
<li><strong>Implements NavigableSet</strong> - Provides navigation methods like floor(), ceiling(), lower(), higher().</li>
</ul>`,
                codeExamples: [
                  `import java.util.TreeSet;

public class TreeSetBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> numbers = new TreeSet<>(); // creates an empty TreeSet named numbers

        numbers.add(40);
        numbers.add(10);
        numbers.add(30);
        numbers.add(20);
        numbers.add(10);  // duplicate - not added

        // Elements are automatically sorted
        System.out.println("TreeSet: " + numbers);
        // Output: [10, 20, 30, 40]

        System.out.println("First: " + numbers.first());   // 10
        System.out.println("Last: " + numbers.last());     // 40

        TreeSet<String> names = new TreeSet<>(); // creates an empty TreeSet named names
        names.add("Chimnaji");
        names.add("Anaji");
        names.add("Baji");

        // Strings sorted alphabetically
        System.out.println("Names: " + names);
        // Output: [Anaji, Baji, Chimnaji]
    }
}`
                ]
              },
              {
                content: `<h4>Case-Sensitive Sorting: Numbers, Capitals, then Lowercase</h4>
Just like ArrayList sorting, TreeSet's natural ordering for Strings follows <strong>ASCII value</strong> - numbers first, then capital letters, then lowercase letters.<br>`,
                codeExamples: [
                  `import java.util.Iterator;
import java.util.TreeSet;

public class TreeSetCaseSortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<String> treeSet = new TreeSet<>(); // creates an empty TreeSet named treeSet
        treeSet.add("A");
        treeSet.add("a");
        treeSet.add("B");
        treeSet.add("b");
        treeSet.add("C");
        treeSet.add("c");
        treeSet.add("D");
        treeSet.add("d");

        // 1st Way: Normal Way
        System.out.println("Using Normal Way:>> " + treeSet);

        // 2nd Way: Using Iterator() Method
        Iterator<String> itr = treeSet.iterator();
        while (itr.hasNext()) {
            System.out.println("Using Iterator() Method:>> " + itr.next());
        }

        // 3rd Way: Using For Each Loop
        for (String j : treeSet) {
            System.out.println("Using For Each Loop:>> " + j);
        }
    }
}
// OUTPUT:
// Using Normal Way:>> [A, B, C, D, a, b, c, d]`
                ]
              },
{
                content: `<h3>TreeSet Details</h3>
TreeSet stores elements in <strong>sorted ascending order</strong>. Uses <strong>balanced tree (Red-Black tree)</strong> internally.<br>
<br>
<h4>Important Rules</h4>
<br>
<ul>
<li><strong>Heterogeneous objects NOT allowed</strong> - throws <strong>ClassCastException</strong>.</li>
<li><strong>Null not allowed</strong> - throws <strong>NullPointerException</strong> (since Java 7).</li>
<li>All elements must implement <strong>Comparable</strong> interface or provide <strong>Comparator</strong>.</li>
</ul>
<br>
<h4>SortedSet - Parent Interface of TreeSet</h4>
<br>
<strong>SortedSet</strong> is the child interface of Set that TreeSet implements. Use it when you want to represent a group of objects according to some sorting order, with duplicates not allowed. It defines 2 key methods:<br>
<br>
<ul>
<li><strong>Object first()</strong> - Returns the first (smallest) element of the sorted set.</li>
<li><strong>Object last()</strong> - Returns the last (largest) element of the sorted set.</li>
</ul>
<br>
<h4>Constructors</h4>
<br>
1. <strong>TreeSet t = new TreeSet();</strong> - Creates empty TreeSet with natural sorting order.<br>
2. <strong>TreeSet t = new TreeSet(Comparator c);</strong> - Creates empty TreeSet with customized sorting.<br>
3. <strong>TreeSet t = new TreeSet(Collection c);</strong> - Creates TreeSet for given collection.<br>
4. <strong>TreeSet t = new TreeSet(SortedSet s);</strong> - Creates TreeSet for given SortedSet.<br>`,
                codeExamples: [
                  `import java.util.TreeSet;

public class TreeSetDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts = new TreeSet<>(); // creates an empty TreeSet named ts
        ts.add(30);
        ts.add(10);
        ts.add(50);
        ts.add(20);
        ts.add(40);

        System.out.println(ts);    // [10, 20, 30, 40, 50] - sorted

        System.out.println("First: " + ts.first());    // 10
        System.out.println("Last: " + ts.last());      // 50
        System.out.println("Head(30): " + ts.headSet(30));    // [10, 20]
        System.out.println("Tail(30): " + ts.tailSet(30));    // [30, 40, 50]
    }
}`
                ]
              },
              {
                content: `<h4>TreeSet Navigation Methods</h4>
<strong>TreeSet</strong> implements the <strong>NavigableSet</strong> interface, which provides several useful navigation methods:<br>
<br>
<ul>
<li><strong>ceiling(e)</strong> - Smallest element that is <strong>&gt;=</strong> the given element.</li>
<li><strong>floor(e)</strong> - Largest element that is <strong>&lt;=</strong> the given element.</li>
<li><strong>higher(e)</strong> - Smallest element strictly <strong>&gt;</strong> the given element (null if none).</li>
<li><strong>lower(e)</strong> - Largest element strictly <strong>&lt;</strong> the given element (null if none).</li>
<li><strong>pollFirst()</strong> - Removes and returns the smallest element (null if empty).</li>
<li><strong>pollLast()</strong> - Removes and returns the largest element (null if empty).</li>
<li><strong>headSet(e)</strong> - Returns elements strictly less than the given element.</li>
<li><strong>isEmpty()</strong> / <strong>remove(e)</strong> / <strong>clear()</strong> - Standard checks and mutations.</li>
</ul>`,
                codeExamples: [
                  `import java.util.TreeSet;

public class TreeSetNavigationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> abc = new TreeSet<>();    // 1st Set
        abc.add(13);
        abc.add(5);
        abc.add(25);
        abc.add(18);

        TreeSet<Integer> xyz = new TreeSet<>();    // 2nd Set
        xyz.add(25);
        xyz.add(100);
        xyz.add(1);
        xyz.add(2);

        // addAll() - merge xyz into abc
        abc.addAll(xyz);
        System.out.println("After addAll: " + abc);    // [1, 2, 5, 13, 18, 25, 100]

        // ceiling() - smallest element >= 6
        System.out.println("ceiling(6): " + abc.ceiling(6));    // 13

        // floor() - largest element <= 4
        System.out.println("floor(4): " + abc.floor(4));    // 2

        // first() / last()
        System.out.println("first(): " + abc.first());    // 1
        System.out.println("last(): " + abc.last());      // 100

        // higher() / lower()
        System.out.println("higher(10): " + abc.higher(10));    // 13
        System.out.println("lower(18): " + abc.lower(18));      // 13

        System.out.println("isEmpty(): " + abc.isEmpty());    // false

        // pollFirst() / pollLast() - remove smallest / largest
        System.out.println("pollFirst(): " + abc.pollFirst());    // 1
        System.out.println("pollLast(): " + abc.pollLast());      // 100
        System.out.println("After polling: " + abc);    // [2, 5, 13, 18, 25]

        // remove() - delete a specific element
        System.out.println("remove(25): " + abc.remove(25));    // true
        System.out.println("After remove: " + abc);    // [2, 5, 13, 18]

        // headSet() - elements less than 13
        System.out.println("headSet(13): " + abc.headSet(13));    // [2, 5]

        // clear()
        abc.clear();
        System.out.println("After clear: " + abc);    // []
    }
}`
                ]
              },
              {
                content: `<h3>TreeSet - Complete Method Reference (~32 Methods)</h3>
TreeSet has more methods than HashSet/LinkedHashSet because it implements <strong>NavigableSet</strong> and <strong>SortedSet</strong> on top of Set - all the ceiling/floor/subSet-style range methods are unique to TreeSet. Grouped by purpose:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Adding / Removing</strong></td><td>add(E), addAll(Collection), remove(Object), removeAll(Collection), removeIf(Predicate), clear()</td></tr>
<tr><td><strong>2. Navigation (unique to TreeSet)</strong></td><td>first(), last(), ceiling(E), floor(E), higher(E), lower(E), pollFirst(), pollLast()</td></tr>
<tr><td><strong>3. Range Views (unique to TreeSet)</strong></td><td>headSet(E), headSet(E,boolean), tailSet(E), tailSet(E,boolean), subSet(E,E), subSet(E,boolean,E,boolean)</td></tr>
<tr><td><strong>4. Ordering</strong></td><td>comparator(), descendingSet(), descendingIterator()</td></tr>
<tr><td><strong>5. Searching</strong></td><td>contains(Object), containsAll(Collection)</td></tr>
<tr><td><strong>6. Size / Status</strong></td><td>size(), isEmpty(), retainAll(Collection)</td></tr>
<tr><td><strong>7. Iteration</strong></td><td>iterator(), forEach(Consumer), spliterator()</td></tr>
<tr><td><strong>8. Array / Stream / Other</strong></td><td>toArray(), toArray(T[]), stream(), parallelStream(), clone(), equals(Object), hashCode(), toString()</td></tr>
</table>`
              },
              {
                content: `<h4>TreeSet: Range Views and Ordering - Separate Example for Each</h4>`,
                codeExamples: [
                  `// tailSet(E) / tailSet(E, boolean) - elements >= (or >) the given element
import java.util.TreeSet;
public class TreeSetTailSetDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts = new TreeSet<>(java.util.List.of(10, 20, 30, 40, 50));
        System.out.println("tailSet(30): " + ts.tailSet(30));               // inclusive by default
        System.out.println("tailSet(30, false): " + ts.tailSet(30, false));  // exclusive
    }
}
// OUTPUT:
// tailSet(30): [30, 40, 50]
// tailSet(30, false): [40, 50]`,
                  `// subSet(from, to) / subSet(from, fromInclusive, to, toInclusive)
import java.util.TreeSet;
public class TreeSetSubSetDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts = new TreeSet<>(java.util.List.of(10, 20, 30, 40, 50));
        System.out.println("subSet(20, 40): " + ts.subSet(20, 40));                     // [from, to)
        System.out.println("subSet(20, true, 40, true): " + ts.subSet(20, true, 40, true)); // [from, to]
    }
}
// OUTPUT:
// subSet(20, 40): [20, 30]
// subSet(20, true, 40, true): [20, 30, 40]`,
                  `// comparator() - null for natural ordering, else the custom Comparator used
import java.util.Comparator;
import java.util.TreeSet;
public class TreeSetComparatorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> natural = new TreeSet<>(); // creates an empty TreeSet named natural
        System.out.println("Natural order comparator: " + natural.comparator());

        TreeSet<Integer> custom = new TreeSet<>(Comparator.reverseOrder());
        System.out.println("Custom comparator: " + custom.comparator());
    }
}
// OUTPUT:
// Natural order comparator: null
// Custom comparator: java.util.Collections$ReverseComparator@...`,
                  `// descendingSet() / descendingIterator() - reverse view of a TreeSet
import java.util.Iterator;
import java.util.TreeSet;
public class TreeSetDescendingDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts = new TreeSet<>(java.util.List.of(10, 20, 30));

        System.out.println("descendingSet(): " + ts.descendingSet());

        Iterator<Integer> it = ts.descendingIterator();
        while (it.hasNext()) System.out.println(it.next());
    }
}
// OUTPUT:
// descendingSet(): [30, 20, 10]
// 30
// 20
// 10`,
                  `// containsAll(Collection c) / retainAll(Collection c)
import java.util.TreeSet;
public class TreeSetContainsRetainAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts = new TreeSet<>(java.util.List.of(10, 20, 30, 40));
        System.out.println("containsAll([20,30]): " + ts.containsAll(java.util.List.of(20, 30)));

        ts.retainAll(java.util.List.of(20, 40, 99));
        System.out.println("After retainAll: " + ts);
    }
}
// OUTPUT:
// containsAll([20,30]): true
// After retainAll: [20, 40]`,
                  `// removeIf(Predicate filter) / toArray() / stream()
import java.util.TreeSet;
public class TreeSetRemoveIfStreamDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts = new TreeSet<>(java.util.List.of(1, 2, 3, 4, 5));
        ts.removeIf(n -> n % 2 == 0);
        System.out.println("After removeIf: " + ts);

        Object[] arr = ts.toArray();
        System.out.println("toArray() length: " + arr.length);

        long sum = ts.stream().mapToInt(Integer::intValue).sum();
        System.out.println("stream() sum: " + sum);
    }
}
// OUTPUT:
// After removeIf: [1, 3, 5]
// toArray() length: 3
// stream() sum: 9`
                ]
              },
              {
                content: `<h4>Deep Dive: TreeSet's Remaining Methods and All 4 Constructors</h4>
Rounding out the ~32-method reference table with the last few not yet shown individually - <code>forEach()</code>, <code>spliterator()</code>, the typed <code>toArray(T[])</code>, and <code>clone()/equals()/hashCode()/toString()</code> - plus every TreeSet constructor side by side.<br>`,
                codeExamples: [
                  `// forEach(Consumer) / spliterator() / toArray(T[])
import java.util.*;

public class TreeSetForEachSpliteratorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts = new TreeSet<>(List.of(30, 10, 20));

        // forEach() - always visits in SORTED order, unlike HashSet's forEach()
        ts.forEach(n -> System.out.println("forEach: " + n));

        // spliterator() - reports SORTED + ORDERED characteristics (unlike HashSet's)
        Spliterator<Integer> sp = ts.spliterator();
        System.out.println("spliterator().hasCharacteristics(SORTED): " + sp.hasCharacteristics(Spliterator.SORTED));

        // toArray(T[]) - typed array instead of Object[]
        Integer[] typedArray = ts.toArray(new Integer[0]);
        System.out.println("toArray(T[]): " + Arrays.toString(typedArray));
    }
}
// OUTPUT:
// forEach: 10
// forEach: 20
// forEach: 30
// spliterator().hasCharacteristics(SORTED): true
// toArray(T[]): [10, 20, 30]`,
                  `// clone() / equals() / hashCode() / toString()
import java.util.TreeSet;

public class TreeSetCloneEqualsDemo { // class that holds the main method
    @SuppressWarnings("unchecked")
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> ts1 = new TreeSet<>(java.util.List.of(1, 2, 3));
        TreeSet<Integer> ts2 = (TreeSet<Integer>) ts1.clone();

        System.out.println("Clone equals original? " + ts1.equals(ts2));
        System.out.println("Same hashCode? " + (ts1.hashCode() == ts2.hashCode()));
        System.out.println("toString(): " + ts2.toString());
    }
}
// OUTPUT:
// Clone equals original? true
// Same hashCode? true
// toString(): [1, 2, 3]`,
                  `// All 4 TreeSet constructors, side by side
import java.util.*;

public class TreeSetConstructorsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeSet<Integer> t1 = new TreeSet<>();                                  // 1. natural ordering
        TreeSet<Integer> t2 = new TreeSet<>(Comparator.reverseOrder());          // 2. custom Comparator
        TreeSet<Integer> t3 = new TreeSet<>(List.of(5, 1, 3));                   // 3. from a Collection (sorted on insert)
        TreeSet<Integer> t4 = new TreeSet<>((SortedSet<Integer>) t3);            // 4. from an existing SortedSet

        t2.addAll(List.of(10, 30, 20));
        System.out.println("t2 (reverse order): " + t2);
        System.out.println("t3 (from Collection, auto-sorted): " + t3);
        System.out.println("t4 (from SortedSet t3): " + t4);
    }
}
// OUTPUT:
// t2 (reverse order): [30, 20, 10]
// t3 (from Collection, auto-sorted): [1, 3, 5]
// t4 (from SortedSet t3): [1, 3, 5]`
                ]
              },
{
                content: `<h3>Comparison: HashSet vs LinkedHashSet vs TreeSet</h3>
<br>
<table border="1" cellpadding="5" cellspacing="0">
<tr><th>Property</th><th>HashSet</th><th>LinkedHashSet</th><th>TreeSet</th></tr>
<tr><td><strong>Order</strong></td><td>No order</td><td>Insertion order</td><td>Sorted order</td></tr>
<tr><td><strong>Null</strong></td><td>Allows null</td><td>Allows null</td><td>NO null</td></tr>
<tr><td><strong>Performance</strong></td><td>Fastest</td><td>Slightly slower</td><td>Slowest (O(log n))</td></tr>
<tr><td><strong>Backed By</strong></td><td>HashMap</td><td>LinkedHashMap</td><td>TreeMap / Red-Black tree</td></tr>
<tr><td><strong>Duplicates</strong></td><td>No duplicates</td><td>No duplicates</td><td>No duplicates</td></tr>
<tr><td><strong>Synchronized</strong></td><td>Not synchronized</td><td>Not synchronized</td><td>Not synchronized</td></tr>
</table><br>`
              },
              {
                content: `<h3>Internal Working of TreeSet</h3>
Just like HashSet delegates to a HashMap, <strong>TreeSet delegates to a TreeMap</strong> - same composition pattern, different backing structure. Elements you add become <strong>keys</strong> in the hidden map, again paired with the same dummy <strong>PRESENT</strong> value, but this time the map keeps them in a Red-Black tree instead of hash buckets - which is exactly why TreeSet iterates in sorted order for free.<br>
<br>
<h4>Key Points</h4>
<br>
<ul>
<li>TreeSet internally creates: <strong>private transient NavigableMap&lt;E, Object&gt; m;</strong> (typed as the interface, but a <strong>TreeMap</strong> instance underneath).</li>
<li><strong>add(e)</strong> internally calls: <strong>m.put(e, PRESENT)</strong> - same trick as HashSet's add().</li>
<li><strong>first() / last()</strong> internally call: <strong>m.firstKey() / m.lastKey()</strong>.</li>
<li><strong>ceiling(e) / floor(e) / higher(e) / lower(e)</strong> internally call the identically-named key methods on the map (<strong>ceilingKey(), floorKey()</strong>, etc.) - see the TreeMap topic's "Internal Working" for how those actually walk the Red-Black tree.</li>
<li><strong>headSet()/tailSet()/subSet()</strong> internally call <strong>headMap()/tailMap()/subMap()</strong> and wrap the resulting key view back into a Set.</li>
</ul>`
              },
              {
                content: `<h3>Class Diagram: TreeSet's Inheritance vs Composition</h3>
The same is-a vs has-a split as HashSet, but one level up the interface hierarchy - TreeSet implements the richer <strong>NavigableSet</strong> interface, and composes a <strong>NavigableMap</strong> (concretely a TreeMap) instead of a plain HashMap.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">AbstractCollection&lt;E&gt;</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">AbstractSet&lt;E&gt; &nbsp; <span style="color:#777;">implements Set&lt;E&gt;</span></td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<strong>TreeSet&lt;E&gt;</strong> &nbsp;<span style="font-size:11px; color:#777;">implements NavigableSet&lt;E&gt;, Cloneable, Serializable</span><br>
<span style="font-size:12px; font-family:monospace;">- m: NavigableMap&lt;E, Object&gt;</span>
</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#b5651d;">&#9670; composes (has-a, NOT extends)</td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px;">TreeMap&lt;E, Object&gt; &nbsp; <span style="color:#777;">(implements NavigableMap)</span></td>
</tr>
</table>
<br>
<strong>NavigableSet</strong> itself sits in a parallel hierarchy to NavigableMap: <code>Set &larr; SortedSet &larr; NavigableSet</code>, mirroring <code>Map &larr; SortedMap &larr; NavigableMap</code> almost method-for-method (first/last, ceiling/floor/higher/lower, headSet/tailSet/subSet mirroring headMap/tailMap/subMap). That symmetry is not an accident - it's why every navigation method on TreeSet has a one-line delegation to the identically-shaped method on its internal map.<br>`
              },
              {
                content: `<h3>Memory Diagram: What add() Actually Builds on the Heap</h3>
Same exercise as HashSet's memory diagram, but the shape that forms is a <strong>tree</strong>, not a bucket array - and every Entry object carries parent/child pointers instead of a bucket <code>next</code> pointer.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">HEAP</td></tr>
<tr>
<td style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>TreeSet@S</strong><br>
<span style="font-size:12px;">m &rarr; TreeMap@M</span>
</td>
<td style="width:30px;">&rarr;</td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>TreeMap@M</strong><br>
<span style="font-size:12px;">root &rarr; Entry@E1</span>
</td>
</tr>
<tr><td colspan="3" style="height:14px;"></td></tr>
<tr>
<td colspan="3">
<em style="font-size:12px; color:#777;">After: set.add(20); set.add(10); set.add(30);</em>
</td>
</tr>
<tr><td colspan="3" style="height:8px;"></td></tr>
<tr>
<td colspan="3" style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:10px 14px;">
<strong>Entry@E1 (root, BLACK)</strong> {key=20, value=PRESENT, left &rarr; Entry@E2, right &rarr; Entry@E3, parent &rarr; null}
</td>
</tr>
<tr><td colspan="3" style="height:6px;"></td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>Entry@E2 (RED)</strong><br>{key=10, value=PRESENT, left &rarr; null, right &rarr; null, parent &rarr; E1}
</td>
<td></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>Entry@E3 (RED)</strong><br>{key=30, value=PRESENT, left &rarr; null, right &rarr; null, parent &rarr; E1}
</td>
</tr>
</table>
<br>
<strong>What add(15) would do from here:</strong> start at root (E1, key=20) &rarr; 15 &lt; 20, go to <code>left</code> (E2, key=10) &rarr; 15 &gt; 10, go to <code>right</code> (null - found the spot) &rarr; create a new RED Entry there with <code>parent</code> pointing back to E2, then run the fix-up pass checking E2 and E1 for rule violations.<br>
<br>
<strong>The same PRESENT-reuse trick applies here too:</strong> every Entry's <code>value</code> field points to the exact same shared PRESENT object as HashSet uses - TreeSet is built on the identical "elements are keys" idea, just with a tree-shaped map instead of a bucket-array-shaped one.<br>`
              },
              {
                content: `<h3>Interview Questions on Set</h3>
<br>
<strong>1. What is a Set in Java?</strong><br>
A Set is a collection that does not allow duplicate elements. It models the mathematical set abstraction and is part of the Java Collections Framework.<br>
<br>
<strong>2. What are the main implementations of the Set interface?</strong><br>
<ul>
<li><strong>HashSet</strong> - Uses a hash table, constant-time performance for basic operations.</li>
<li><strong>LinkedHashSet</strong> - Maintains a linked list of entries in insertion order.</li>
<li><strong>TreeSet</strong> - Implements NavigableSet, uses a Red-Black tree, orders elements by value.</li>
</ul>
<br>
<strong>3. How do you create a HashSet in Java?</strong><br>
<code>Set&lt;String&gt; set = new HashSet&lt;&gt;();</code><br>
<br>
<strong>4. What is the difference between HashSet and TreeSet?</strong><br>
HashSet does not maintain any order of its elements, while TreeSet maintains elements in sorted order. HashSet provides constant-time performance for basic operations, whereas TreeSet provides log-time performance.<br>
<br>
<strong>5. How do you check if a Set contains a specific element?</strong><br>
Using the <code>contains()</code> method: <code>boolean containsElement = set.contains("element");</code><br>
<br>
<strong>6. How do you remove an element from a Set?</strong><br>
Using the <code>remove()</code> method: <code>set.remove("element");</code><br>
<br>
<strong>7. What is the time complexity of basic operations in a HashSet?</strong><br>
The time complexity for basic operations (add, remove, contains) in a HashSet is O(1) on average.<br>
<br>
<strong>8. What is LinkedHashSet and when would you use it?</strong><br>
LinkedHashSet is an implementation of the Set interface that maintains a doubly-linked list across all elements, preserving insertion order. Use it when you need a set that maintains the order elements were added.<br>
<br>
<strong>9. How do you iterate over a Set?</strong><br>
Using a for-each loop or an Iterator, same as any other Collection.<br>
<br>
<strong>10. What is the difference between Set and List in Java?</strong><br>
Set does not allow duplicate elements and does not maintain any order (except LinkedHashSet and TreeSet), while List allows duplicate elements and maintains insertion order.<br>`
              }
            ]
          }
        ]
      },

      // ===== SubTopic 4: Map Interface =====
      {
        id: 'map',
        name: 'Map Interface',
        topics: [

          // ----- HashMap -----
          {
            id: 'hashmap',
            name: 'HashMap',
            beginner: [
{
                content: `<h3>Map Interface and HashMap</h3>
The <strong>Map</strong> interface represents a collection of <strong>key-value pairs</strong>. Unlike List and Set, Map is <strong>not part of the Collection hierarchy</strong> - it is a separate interface. Each key maps to exactly one value.<br>
<br>
<h4>Key Features of Map</h4>
<br>
<ul>
<li><strong>Key-Value Pairs</strong> - Each entry consists of a key and its associated value.</li>
<li><strong>No Duplicate Keys</strong> - Each key must be unique. If you put a value with an existing key, the old value is replaced.</li>
<li><strong>Values May Be Duplicated</strong> - Multiple keys can map to the same value.</li>
<li><strong>Both Keys and Values Are Objects</strong> - Primitives must be wrapped in their wrapper classes.</li>
</ul>
<br>
<strong>HashMap</strong> is the most commonly used Map implementation. It stores entries in a hash table and provides O(1) average time for get and put operations.<br>
<br>
<h4>Key Features of HashMap</h4>
<br>
<ul>
<li><strong>Allows One Null Key</strong> - HashMap permits one null key and multiple null values.</li>
<li><strong>No Ordering</strong> - Does not guarantee any order of entries.</li>
<li><strong>Non-Synchronized</strong> - Not thread-safe by default.</li>
</ul>`,
                codeExamples: [
                  `import java.util.HashMap;
import java.util.Map;

public class HashMapBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map

        // Adding key-value pairs
        map.put("Java", 90);
        map.put("Python", 85);
        map.put("C++", 78);
        map.put("JavaScript", 82);

        System.out.println("HashMap: " + map);

        // Get value by key
        System.out.println("Java score: " + map.get("Java"));

        // Check if key/value exists
        System.out.println("Contains key 'Python'? " + map.containsKey("Python"));
        System.out.println("Contains value 90? " + map.containsValue(90));

        // Remove entry
        map.remove("C++");
        System.out.println("After remove: " + map);

        // Get all keys, values, entries
        System.out.println("Keys: " + map.keySet());
        System.out.println("Values: " + map.values());
        System.out.println("Size: " + map.size());

        // Iterate using entrySet
        System.out.println("--- Iterating ---");
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }
    }
}`
                ]
              },
{
                content: `<h3>HashMap Constructors and Methods</h3>
<br>
<h4>Constructors</h4>
<br>
1. <strong>HashMap m = new HashMap();</strong> - Default capacity 16, load factor 0.75<br>
2. <strong>HashMap m = new HashMap(int initialCapacity);</strong><br>
3. <strong>HashMap m = new HashMap(int initialCapacity, float loadFactor);</strong><br>
4. <strong>HashMap m = new HashMap(Map m);</strong><br>
<br>
<h4>Methods</h4>
<br>
<ul>
<li><strong>put(Object key, Object value)</strong> - Add key-value pair</li>
<li><strong>get(Object key)</strong> - Returns value for given key</li>
<li><strong>remove(Object key)</strong> - Removes entry for given key</li>
<li><strong>containsKey(Object key)</strong> - Returns true if key exists</li>
<li><strong>containsValue(Object value)</strong> - Returns true if value exists</li>
<li><strong>keySet()</strong> - Returns Set of all keys</li>
<li><strong>values()</strong> - Returns Collection of all values</li>
<li><strong>entrySet()</strong> - Returns Set of Map.Entry objects</li>
<li><strong>size()</strong> - Returns number of entries</li>
<li><strong>isEmpty()</strong> - Returns true if map is empty</li>
<li><strong>clear()</strong> - Removes all entries</li>
<li><strong>putAll(Map m)</strong> - Copies all entries from another map</li>
</ul>
<br>
<h4>Features</h4>
<br>
<ul>
<li>Allows one null key and multiple null values</li>
<li>Non-synchronized (not thread safe)</li>
<li>Insertion order NOT preserved</li>
<li>Duplicate keys not allowed, values may be duplicated</li>
<li>Default capacity 16, load factor 0.75</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class HashMapDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<Integer, String> map = new HashMap<>(); // creates an empty HashMap named map
        map.put(101, "Rajaram");
        map.put(102, "Shahaji");
        map.put(103, "Pankaj");
        map.put(101, "Updated Rajaram");    // Duplicate key - value updated

        System.out.println("HashMap: " + map);

        // Iteration using entrySet
        System.out.println("--- Using entrySet ---");
        for (Map.Entry<Integer, String> entry : map.entrySet()) {
            System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());
        }

        // Iteration using keySet
        System.out.println("--- Using keySet ---");
        for (Integer key : map.keySet()) {
            System.out.println("Key: " + key + ", Value: " + map.get(key));
        }

        System.out.println("Contains key 102? " + map.containsKey(102));
        System.out.println("Contains value 'Pankaj'? " + map.containsValue("Pankaj"));
    }
}`
                ]
              },
              {
                content: `<h4>HashMap: forEach() and compute() - JDK 8 Methods</h4>
<br>
<ul>
<li><strong>forEach(BiConsumer)</strong> - Iterates over key-value pairs using a lambda, instead of an explicit entrySet loop.</li>
<li><strong>compute(key, BiFunction)</strong> - Computes a new value for the given key based on its current value, and updates the map automatically. If the function returns null, the mapping is removed.</li>
</ul>`,
                codeExamples: [
                  `import java.util.HashMap;
import java.util.Map;

public class HashMapForEachDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Map<String, String> map = new HashMap<>();
        map.put("ram", "patil");
        map.put("shyam", "deshmukh");

        // forEach(action) method to iterate map
        map.forEach((k, v) -> System.out.println("Key = " + k + ", Value = " + v));
    }
}`,
                  `import java.util.HashMap;
import java.util.Map;

public class HashMapComputeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Map<String, String> map = new HashMap<>();
        map.put("Name", "Pankaj");
        map.put("Address", "Udgir");

        System.out.println("Map: " + map);

        // compute() - remap the value using the key's current value
        map.compute("Name", (key, val) -> val.concat(" Kumar"));
        map.compute("Address", (key, val) -> val.concat(" Maharashtra"));

        System.out.println("New Map: " + map);
    }
}
// OUTPUT:
// Map: {Address=Udgir, Name=Pankaj}
// New Map: {Address=Udgir Maharashtra, Name=Pankaj Kumar}`
                ]
              },
              {
                content: `<h4>Real-World Example: Nested HashMap</h4>
A very common real-world use of HashMap is grouping data hierarchically - for example, an <strong>e-commerce category structure</strong> where a shop name maps to categories, and each category maps to a list of products.<br>`,
                codeExamples: [
                  `import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

public class NestedHashMapDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<String> computerAccessories = new ArrayList<>(); // creates an empty ArrayList named computerAccessories
        computerAccessories.add("watch");
        computerAccessories.add("speaker");
        computerAccessories.add("laptop");

        ArrayList<String> electronics = new ArrayList<>(); // creates an empty ArrayList named electronics
        electronics.add("printer");
        electronics.add("mouse");
        electronics.add("keyboard");

        ArrayList<String> furniture = new ArrayList<>(); // creates an empty ArrayList named furniture
        furniture.add("bed");
        furniture.add("sofa");
        furniture.add("chair");

        // Map: Category Name -> List of Products
        HashMap<String, ArrayList<String>> categories = new HashMap<>();
        categories.put("Computer", computerAccessories);
        categories.put("Electronics", electronics);
        categories.put("Furniture", furniture);

        // Nested Map: Shop Name -> (Category Name -> List of Products)
        HashMap<String, HashMap<String, ArrayList<String>>> eShop = new HashMap<>();
        eShop.put("E Shop", categories);

        // Iterate and print the nested structure
        Set<String> shops = eShop.keySet();
        for (String shop : shops) {
            System.out.println(shop);
            System.out.println(eShop.get(shop));
        }
    }
}`
                ]
              },
              {
                content: `<h4>AbstractMap: equals(), hashCode(), and SimpleEntry</h4>
<strong>AbstractMap</strong> is the skeletal base class that HashMap, TreeMap, and others extend. It provides default implementations of <strong>equals()</strong>, <strong>hashCode()</strong>, and a handy inner class <strong>AbstractMap.SimpleEntry</strong> for holding a standalone key-value pair.<br>
<br>
<ul>
<li><strong>equals()</strong> - Two maps are equal if they contain the same key-value mappings, regardless of iteration order.</li>
<li><strong>hashCode()</strong> - Computed as the sum of hashCodes of all entries, so it stays consistent with equals().</li>
<li><strong>AbstractMap.SimpleEntry&lt;K,V&gt;</strong> - A standalone, mutable key-value pair object, useful when you need an entry without a full map (e.g., temporary pairs in a List).</li>
</ul>`,
                codeExamples: [
                  `import java.util.AbstractMap;
import java.util.HashMap;

public class MapEqualsHashCodeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<Integer, String> map1 = new HashMap<>(); // creates an empty HashMap named map1
        map1.put(10, "Pankaj");
        map1.put(20, "Udgir");

        HashMap<Integer, String> map2 = new HashMap<>(); // creates an empty HashMap named map2
        map2.put(20, "Udgir");
        map2.put(10, "Pankaj");

        // Order doesn't matter - same key-value pairs make them equal
        System.out.println("map1.equals(map2): " + map1.equals(map2));    // true
        System.out.println("Same hashCode: " + (map1.hashCode() == map2.hashCode()));    // true
    }
}`,
                  `import java.util.AbstractMap;
import java.util.ArrayList;

public class SimpleEntryDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<AbstractMap.SimpleEntry<Integer, String>> list = new ArrayList<>();

        list.add(new AbstractMap.SimpleEntry<>(1, "Pankaj"));
        list.add(new AbstractMap.SimpleEntry<>(2, "Dheeraj"));
        list.add(new AbstractMap.SimpleEntry<>(3, "Sheru"));

        for (AbstractMap.SimpleEntry<Integer, String> entry : list) {
            System.out.println(entry);    // uses toString(): key=value
        }
    }
}
// OUTPUT:
// 1=Pankaj
// 2=Dheeraj
// 3=Sheru`
                ]
              },
              {
                content: `<h3>HashMap - Complete Method Reference (~27 Methods)</h3>
HashMap has its own method shape entirely - since it works on <strong>key-value pairs</strong> instead of single elements, it doesn't share the List/Set method names at all (no add(), no contains() alone - everything is keyed). Grouped by purpose:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Adding / Updating</strong></td><td>put(K,V), putAll(Map), putIfAbsent(K,V), replace(K,V), replace(K,V,V), replaceAll(BiFunction)</td></tr>
<tr><td><strong>2. Accessing</strong></td><td>get(Object), getOrDefault(Object,V)</td></tr>
<tr><td><strong>3. Removing</strong></td><td>remove(Object), remove(Object,Object), clear()</td></tr>
<tr><td><strong>4. Searching</strong></td><td>containsKey(Object), containsValue(Object)</td></tr>
<tr><td><strong>5. Views</strong></td><td>keySet(), values(), entrySet()</td></tr>
<tr><td><strong>6. Size / Status</strong></td><td>size(), isEmpty()</td></tr>
<tr><td><strong>7. Functional (JDK 8)</strong></td><td>compute(K,BiFunction), computeIfAbsent(K,Function), computeIfPresent(K,BiFunction), merge(K,V,BiFunction), forEach(BiConsumer)</td></tr>
<tr><td><strong>8. Other</strong></td><td>clone(), equals(Object), hashCode(), toString()</td></tr>
</table>`
              },
              {
                content: `<h4>HashMap: Remaining Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// putAll(Map) - copies all entries from another map
import java.util.HashMap;
public class HashMapPutAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map1 = new HashMap<>(); // creates an empty HashMap named map1
        map1.put("A", 1);
        HashMap<String, Integer> map2 = new HashMap<>(); // creates an empty HashMap named map2
        map2.put("B", 2);
        map1.putAll(map2);
        System.out.println(map1);
    }
}
// OUTPUT: {A=1, B=2}`,
                  `// putIfAbsent(K, V) - only inserts if the key is not already present
import java.util.HashMap;
public class HashMapPutIfAbsentDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        map.put("A", 1);
        map.putIfAbsent("A", 99);   // key exists - ignored
        map.putIfAbsent("B", 2);    // key absent - inserted
        System.out.println(map);
    }
}
// OUTPUT: {A=1, B=2}`,
                  `// getOrDefault(Object key, V defaultValue) - avoids a manual null check
import java.util.HashMap;
public class HashMapGetOrDefaultDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        map.put("A", 1);
        System.out.println(map.getOrDefault("A", -1));
        System.out.println(map.getOrDefault("Z", -1));
    }
}
// OUTPUT:
// 1
// -1`,
                  `// remove(Object key, Object value) - removes ONLY if key maps to the given value
import java.util.HashMap;
public class HashMapConditionalRemoveDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        map.put("A", 1);
        System.out.println(map.remove("A", 99));   // value doesn't match - not removed
        System.out.println(map.remove("A", 1));    // value matches - removed
        System.out.println(map);
    }
}
// OUTPUT:
// false
// true
// {}`,
                  `// replace(K, V) / replace(K, V, V) - update only if key exists (or matches old value)
import java.util.HashMap;
public class HashMapReplaceDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        map.put("A", 1);
        map.replace("A", 100);          // key exists - updated
        map.replace("Z", 999);          // key absent - no-op
        System.out.println("After replace(K,V): " + map);

        map.replace("A", 999, 200);     // old value doesn't match - no-op
        map.replace("A", 100, 200);     // old value matches - updated
        System.out.println("After replace(K,V,V): " + map);
    }
}
// OUTPUT:
// After replace(K,V): {A=100}
// After replace(K,V,V): {A=200}`,
                  `// isEmpty()
import java.util.HashMap;
public class HashMapIsEmptyDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        System.out.println(map.isEmpty());
        map.put("A", 1);
        System.out.println(map.isEmpty());
    }
}
// OUTPUT:
// true
// false`,
                  `// computeIfAbsent(K, Function) - compute and insert only if key is missing
import java.util.HashMap;
import java.util.ArrayList;
public class HashMapComputeIfAbsentDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, ArrayList<String>> groups = new HashMap<>();
        groups.computeIfAbsent("fruits", k -> new ArrayList<>()).add("Apple");
        groups.computeIfAbsent("fruits", k -> new ArrayList<>()).add("Banana");
        System.out.println(groups);
    }
}
// OUTPUT: {fruits=[Apple, Banana]}`,
                  `// computeIfPresent(K, BiFunction) - update only if key already exists
import java.util.HashMap;
public class HashMapComputeIfPresentDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> scores = new HashMap<>(); // creates an empty HashMap named scores
        scores.put("Pankaj", 80);
        scores.computeIfPresent("Pankaj", (k, v) -> v + 10);
        scores.computeIfPresent("Missing", (k, v) -> v + 10);    // key absent - no-op
        System.out.println(scores);
    }
}
// OUTPUT: {Pankaj=90}`,
                  `// merge(K, V, BiFunction) - combine new value with existing value, or insert if absent
import java.util.HashMap;
public class HashMapMergeDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> wordCount = new HashMap<>(); // creates an empty HashMap named wordCount
        String[] words = { "apple", "banana", "apple", "apple", "banana" };

        for (String w : words) {
            wordCount.merge(w, 1, Integer::sum);
        }
        System.out.println(wordCount);
    }
}
// OUTPUT: {banana=2, apple=3}`,
                  `// replaceAll(BiFunction) - transform every value in place
import java.util.HashMap;
public class HashMapReplaceAllDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        map.put("A", 1);
        map.put("B", 2);
        map.replaceAll((k, v) -> v * 100);
        System.out.println(map);
    }
}
// OUTPUT: {A=100, B=200}`
                ]
              },
              {
                content: `<h4>Deep Dive: HashMap's 4 Constructors, and the Live-View Gotcha</h4>
Rounding out the method reference: all 4 constructors side by side, <code>clone()/equals()/hashCode()/toString()</code> shown directly on HashMap (not just the generic AbstractMap example), and a genuinely easy-to-miss detail - <code>keySet()</code>, <code>values()</code>, and <code>entrySet()</code> return <strong>live views</strong>, not snapshots.<br>`,
                codeExamples: [
                  `// All 4 HashMap constructors, side by side
import java.util.HashMap;

public class HashMapConstructorsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> m1 = new HashMap<>();                          // 1. default: capacity 16, load factor 0.75
        HashMap<String, Integer> m2 = new HashMap<>(64);                        // 2. custom initial capacity
        HashMap<String, Integer> m3 = new HashMap<>(64, 0.5f);                  // 3. custom capacity + load factor
        HashMap<String, Integer> m4 = new HashMap<>(java.util.Map.of("A", 1, "B", 2));    // 4. from another Map

        System.out.println("m4 (copied from another Map): " + m4);
    }
}
// OUTPUT: m4 (copied from another Map): {A=1, B=2}`,
                  `// clone() / equals() / hashCode() / toString() directly on HashMap
import java.util.HashMap;

public class HashMapCloneEqualsDemo { // class that holds the main method
    @SuppressWarnings("unchecked")
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> m1 = new HashMap<>(); // creates an empty HashMap named m1
        m1.put("A", 1);
        m1.put("B", 2);

        HashMap<String, Integer> m2 = (HashMap<String, Integer>) m1.clone();    // shallow copy

        System.out.println("Clone equals original? " + m1.equals(m2));
        System.out.println("Same hashCode? " + (m1.hashCode() == m2.hashCode()));
        System.out.println("toString(): " + m2.toString());

        m2.put("C", 3);    // modifying the clone does NOT affect the original
        System.out.println("Original after modifying clone: " + m1);
    }
}
// OUTPUT:
// Clone equals original? true
// Same hashCode? true
// toString(): {A=1, B=2}
// Original after modifying clone: {A=1, B=2}`,
                  `// keySet()/values()/entrySet() are LIVE VIEWS, not copies - a classic gotcha
import java.util.HashMap;
import java.util.Set;

public class HashMapLiveViewDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        map.put("A", 1);
        map.put("B", 2);
        map.put("C", 3);

        Set<String> keys = map.keySet();
        System.out.println("Keys before: " + keys);

        keys.remove("B");    // removing from the VIEW removes from the MAP too
        System.out.println("Map after keys.remove(B): " + map);

        map.put("D", 4);     // adding to the MAP is reflected in the already-obtained VIEW
        System.out.println("Keys after map.put(D,4): " + keys);
    }
}
// OUTPUT:
// Keys before: [A, B, C]
// Map after keys.remove(B): {A=1, C=3}
// Keys after map.put(D,4): [A, C, D]`
                ]
              },
{
                content: `<h3>Internal Working of HashMap</h3>
<br>
<ul>
<li>HashMap uses <strong>hashing mechanism</strong>. When key-value pair is added, hash code of key is computed.</li>
<li>Hash code determines <strong>bucket index</strong> in internal array.</li>
<li>Each bucket contains linked list of <strong>Node(key, value, hashCode, next)</strong>.</li>
</ul>
<br>
<h4>Put Operation</h4>
<br>
Compute hash -> find bucket -> if empty, add node; if collision, traverse list and compare keys using equals(). If key found, update value; if not, add new node.<br>
<br>
<h4>Get Operation</h4>
<br>
Compute hash -> find bucket -> traverse list comparing keys.<br>
<br>
<h4>Treeification</h4>
<br>
When bucket size >= 8, linked list converts to balanced <strong>Red-Black tree</strong> for O(log n) lookup.<br>
<br>
<h4>Resize</h4>
<br>
When entries > capacity * loadFactor, capacity doubles and all entries rehashed.<br>
<br>
<h4>Key Points</h4>
<br>
<ul>
<li>Initial capacity 16, load factor 0.75</li>
<li>Average time complexity <strong>O(1)</strong>, worst case <strong>O(log n)</strong> with tree</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class HashMapInternalDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map

        // Adding entries
        map.put("Pankaj", 90000);
        map.put("Dheeraj", 95000);
        map.put("Sheru", 85000);

        // Duplicate key - value gets updated
        map.put("Pankaj", 92000);

        System.out.println("Map: " + map);
        System.out.println("Pankaj's salary: " + map.get("Pankaj"));

        // Null key
        map.put(null, 0);
        System.out.println("Null key value: " + map.get(null));

        // entrySet iteration
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + " => " + entry.getValue());
        }
    }
}`
                ]
              }
            ]
          },

          // ----- LinkedHashMap -----
          {
            id: 'linkedhashmap',
            name: 'LinkedHashMap',
            beginner: [
{
                content: `<h3>LinkedHashMap</h3>
<strong>LinkedHashMap</strong> extends <strong>HashMap</strong> and maintains the <strong>insertion order</strong> of its entries. Internally, it uses a <strong>hash table + doubly linked list</strong>. The linked list preserves the order in which entries were inserted.<br>
<br>
<h4>Key Features of LinkedHashMap</h4>
<br>
<ul>
<li><strong>Maintains Insertion Order</strong> - Entries are iterated in the order they were added.</li>
<li><strong>Extends HashMap</strong> - Inherits all HashMap methods and behavior.</li>
<li><strong>Allows One Null Key</strong> - Like HashMap, permits one null key and multiple null values.</li>
<li><strong>Non-Synchronized</strong> - Not thread-safe by default.</li>
<li><strong>Slightly Slower than HashMap</strong> - Due to the linked list maintenance overhead.</li>
</ul>
<br>
<h4>How Many Methods Does LinkedHashMap Actually Have?</h4>
LinkedHashMap declares <strong>zero new public methods</strong> - it only overrides internal hooks (like the protected <code>removeEldestEntry()</code>, useful for building an LRU cache) so entries iterate in insertion order instead of hash-bucket order. Every method you call (<code>put, get, remove, computeIfAbsent, merge, entrySet, ...</code>) is the exact same <strong>~27 methods inherited from HashMap</strong>. See the <strong>HashMap</strong> topic for the full method-by-method breakdown.<br>`,
                codeExamples: [
                  `import java.util.*;

public class LinkedHashMapBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedHashMap<String, Integer> lhm = new LinkedHashMap<>(); // creates an empty LinkedHashMap named lhm

        lhm.put("Banana", 3);
        lhm.put("Apple", 5);
        lhm.put("Cherry", 2);
        lhm.put("Date", 8);

        // Insertion order is preserved
        System.out.println("LinkedHashMap: " + lhm);
        // Output: {Banana=3, Apple=5, Cherry=2, Date=8}

        // Compare with HashMap
        HashMap<String, Integer> hm = new HashMap<>(); // creates an empty HashMap named hm
        hm.put("Banana", 3);
        hm.put("Apple", 5);
        hm.put("Cherry", 2);
        hm.put("Date", 8);

        System.out.println("HashMap: " + hm);
        // Order may vary

        // Get, containsKey work the same
        System.out.println("Apple count: " + lhm.get("Apple"));
        System.out.println("Has Cherry? " + lhm.containsKey("Cherry"));
    }
}`
                ]
              },
{
                content: `<h3>HashMap vs LinkedHashMap</h3>
<br>
<h4>Comparison</h4>
<br>
<ul>
<li><strong>HashMap:</strong> No order guarantee, slightly faster, less memory</li>
<li><strong>LinkedHashMap:</strong> Maintains insertion order, slightly slower due to linked list overhead, more memory</li>
<li>Both allow one null key, duplicate values</li>
<li>Both are non-synchronized</li>
</ul>`
              },
              {
                content: `<h3>Deep Dive: LinkedHashMap's Real Distinguishing Feature</h3>
Since every public method is inherited unchanged from HashMap, LinkedHashMap's actual API surface worth knowing is its <strong>5 constructors</strong> (HashMap only has 4 - the extra one is unique to LinkedHashMap) and one <strong>protected method</strong> you're meant to override.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Constructor</th><th style="text-align:left;">What It Does</th></tr>
<tr><td>LinkedHashMap()</td><td>Default capacity 16, load factor 0.75, insertion-order iteration</td></tr>
<tr><td>LinkedHashMap(int initialCapacity)</td><td>Custom initial capacity</td></tr>
<tr><td>LinkedHashMap(int initialCapacity, float loadFactor)</td><td>Custom capacity and load factor</td></tr>
<tr><td>LinkedHashMap(Map m)</td><td>Pre-filled from an existing Map</td></tr>
<tr><td><strong>LinkedHashMap(int initialCapacity, float loadFactor, boolean accessOrder)</strong></td><td><strong>Unique to LinkedHashMap.</strong> When accessOrder is true, iteration order becomes "least recently accessed first" instead of insertion order - every get()/put() moves that entry to the end of the internal linked list. This one constructor is the entire foundation of building an LRU cache.</td></tr>
</table>
<br>
<strong>removeEldestEntry(Map.Entry eldest)</strong> - a protected method that always returns false by default (never auto-removes anything). Override it to return true once the map exceeds a size limit, and LinkedHashMap will automatically evict the eldest entry on every put() - combined with accessOrder=true, this turns a plain map into a working <strong>LRU (Least Recently Used) cache</strong> in about 10 lines of code.<br>`,
                codeExamples: [
                  `// accessOrder=true - iteration order becomes access order, not insertion order
import java.util.LinkedHashMap;

public class LinkedHashMapAccessOrderDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        LinkedHashMap<Integer, String> map = new LinkedHashMap<>(16, 0.75f, true);
        map.put(1, "A");
        map.put(2, "B");
        map.put(3, "C");
        System.out.println("Initial: " + map);

        map.get(1);    // accessing key 1 moves it to the END (most recently used)
        System.out.println("After get(1): " + map);
    }
}
// OUTPUT:
// Initial: {1=A, 2=B, 3=C}
// After get(1): {2=B, 3=C, 1=A}`,
                  `// Building a real LRU cache by overriding removeEldestEntry()
import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(16, 0.75f, true);    // accessOrder = true is essential
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;    // evict automatically once over capacity
    }

    public static void main(String[] args) { // program entry point
        LRUCache<Integer, String> cache = new LRUCache<>(3);
        cache.put(1, "A");
        cache.put(2, "B");
        cache.put(3, "C");
        cache.get(1);            // touch 1 -> now most recently used
        cache.put(4, "D");        // capacity exceeded -> evicts the least recently used (2)

        System.out.println(cache);
    }
}
// OUTPUT: {3=C, 1=A, 4=D}`
                ]
              }
            ]
          },

          // ----- TreeMap -----
          {
            id: 'treemap',
            name: 'TreeMap',
            beginner: [
{
                content: `<h3>TreeMap</h3>
<strong>TreeMap</strong> stores entries <strong>sorted by keys</strong> in ascending order by default. It implements the <strong>NavigableMap</strong> interface and is backed by a <strong>Red-Black tree</strong> data structure.<br>
<br>
<h4>Key Features of TreeMap</h4>
<br>
<ul>
<li><strong>Sorted by Keys</strong> - Entries are automatically sorted based on the natural ordering of keys or a custom Comparator.</li>
<li><strong>No Null Keys</strong> - TreeMap does not allow null keys (throws NullPointerException). Null values are allowed.</li>
<li><strong>No Duplicate Keys</strong> - Each key must be unique, like all Maps.</li>
<li><strong>Keys Must Be Comparable</strong> - Keys must implement Comparable, or a Comparator must be provided.</li>
<li><strong>Non-Synchronized</strong> - Not thread-safe by default.</li>
<li><strong>O(log n) Operations</strong> - get, put, and remove operations are O(log n) due to tree structure.</li>
</ul>`,
                codeExamples: [
                  `import java.util.TreeMap;
import java.util.Map;

public class TreeMapBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> treeMap = new TreeMap<>(); // creates an empty TreeMap named treeMap

        treeMap.put(3, "Chimnaji");
        treeMap.put(1, "Anaji");
        treeMap.put(4, "David");
        treeMap.put(2, "Baji");

        // Entries are sorted by key
        System.out.println("TreeMap: " + treeMap);
        // Output: {1=Anaji, 2=Baji, 3=Chimnaji, 4=David}

        System.out.println("First Key: " + treeMap.firstKey());  // 1
        System.out.println("Last Key: " + treeMap.lastKey());    // 4

        // Iterate - always in sorted key order
        for (Map.Entry<Integer, String> entry : treeMap.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }

        // TreeMap with String keys (alphabetical order)
        TreeMap<String, Integer> scores = new TreeMap<>(); // creates an empty TreeMap named scores
        scores.put("Zebra", 10);
        scores.put("Apple", 30);
        scores.put("Mango", 20);

        System.out.println("String TreeMap: " + scores);
        // Output: {Apple=30, Mango=20, Zebra=10}
    }
}`
                ]
              },
{
                content: `<h3>TreeMap: headMap() and tailMap() in Action</h3>
<br>
TreeMap stores entries <strong>sorted by keys</strong> (natural ordering or Comparator). Implements <strong>NavigableMap</strong> and <strong>SortedMap</strong>. No null keys allowed (throws NullPointerException). Keys must implement Comparable.<br>
<br>
<h4>Methods</h4>
<br>
<ul>
<li><strong>firstKey()</strong> / <strong>lastKey()</strong></li>
<li><strong>headMap(key)</strong> / <strong>tailMap(key)</strong></li>
<li><strong>subMap(fromKey, toKey)</strong></li>
<li><strong>floorKey()</strong> / <strong>ceilingKey()</strong></li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class TreeMapDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map
        map.put(103, "Pankaj");
        map.put(101, "Rajaram");
        map.put(102, "Shahaji");
        map.put(104, "Dheeraj");

        System.out.println("TreeMap (sorted): " + map);
        System.out.println("First Key: " + map.firstKey());
        System.out.println("Last Key: " + map.lastKey());
        System.out.println("HeadMap(103): " + map.headMap(103));
        System.out.println("TailMap(103): " + map.tailMap(103));

        for (Map.Entry<Integer, String> entry : map.entrySet()) {
            System.out.println(entry.getKey() + " => " + entry.getValue());
        }
    }
}`
                ]
              },
              {
                content: `<h3>TreeMap - Complete Method Reference (~40 Methods)</h3>
TreeMap has the largest method set of the Map family because it implements <strong>NavigableMap</strong> on top of every regular <strong>Map</strong> method (put, get, compute*, merge, forEach, etc. - all covered in the HashMap topic and identical here). The methods unique to TreeMap are the key-based navigation ones:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Shared with Map</strong></td><td>put, get, remove, containsKey, containsValue, size, isEmpty, clear, keySet, values, entrySet, putAll, putIfAbsent, getOrDefault, replace, replaceAll, compute*, merge, forEach - see the HashMap topic</td></tr>
<tr><td><strong>2. First / Last</strong></td><td>firstKey(), lastKey(), firstEntry(), lastEntry(), pollFirstEntry(), pollLastEntry()</td></tr>
<tr><td><strong>3. Ceiling / Floor</strong></td><td>ceilingKey(K), ceilingEntry(K), floorKey(K), floorEntry(K)</td></tr>
<tr><td><strong>4. Higher / Lower</strong></td><td>higherKey(K), higherEntry(K), lowerKey(K), lowerEntry(K)</td></tr>
<tr><td><strong>5. Range Views</strong></td><td>headMap(K), headMap(K,boolean), tailMap(K), tailMap(K,boolean), subMap(K,K), subMap(K,boolean,K,boolean)</td></tr>
<tr><td><strong>6. Ordering / Views</strong></td><td>comparator(), descendingMap(), descendingKeySet(), navigableKeySet()</td></tr>
<tr><td><strong>7. Other</strong></td><td>clone(), equals(Object), hashCode(), toString()</td></tr>
</table>`
              },
              {
                content: `<h4>TreeMap's NavigableMap-Specific Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// firstEntry() / lastEntry() - the full Map.Entry, not just the key
import java.util.TreeMap;
public class TreeMapFirstLastEntryDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map
        map.put(10, "Ten");
        map.put(20, "Twenty");
        map.put(30, "Thirty");
        System.out.println("firstEntry(): " + map.firstEntry());
        System.out.println("lastEntry(): " + map.lastEntry());
    }
}
// OUTPUT:
// firstEntry(): 10=Ten
// lastEntry(): 30=Thirty`,
                  `// pollFirstEntry() / pollLastEntry() - remove and return the first/last entry
import java.util.TreeMap;
public class TreeMapPollEntryDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map
        map.put(10, "Ten");
        map.put(20, "Twenty");
        map.put(30, "Thirty");
        System.out.println("pollFirstEntry(): " + map.pollFirstEntry());
        System.out.println("pollLastEntry(): " + map.pollLastEntry());
        System.out.println("Remaining: " + map);
    }
}
// OUTPUT:
// pollFirstEntry(): 10=Ten
// pollLastEntry(): 30=Thirty
// Remaining: {20=Twenty}`,
                  `// ceilingKey/ceilingEntry, floorKey/floorEntry - closest key >= or <= the given key
import java.util.TreeMap;
public class TreeMapCeilingFloorDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map
        map.put(10, "Ten");
        map.put(20, "Twenty");
        map.put(30, "Thirty");

        System.out.println("ceilingKey(15): " + map.ceilingKey(15));
        System.out.println("ceilingEntry(15): " + map.ceilingEntry(15));
        System.out.println("floorKey(15): " + map.floorKey(15));
        System.out.println("floorEntry(15): " + map.floorEntry(15));
    }
}
// OUTPUT:
// ceilingKey(15): 20
// ceilingEntry(15): 20=Twenty
// floorKey(15): 10
// floorEntry(15): 10=Ten`,
                  `// higherKey/higherEntry, lowerKey/lowerEntry - strictly greater/less than the given key
import java.util.TreeMap;
public class TreeMapHigherLowerDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map
        map.put(10, "Ten");
        map.put(20, "Twenty");
        map.put(30, "Thirty");

        System.out.println("higherKey(20): " + map.higherKey(20));
        System.out.println("higherEntry(20): " + map.higherEntry(20));
        System.out.println("lowerKey(20): " + map.lowerKey(20));
        System.out.println("lowerEntry(20): " + map.lowerEntry(20));
    }
}
// OUTPUT:
// higherKey(20): 30
// higherEntry(20): 30=Thirty
// lowerKey(20): 10
// lowerEntry(20): 10=Ten`,
                  `// subMap(from, to) / subMap(from, fromInclusive, to, toInclusive)
import java.util.TreeMap;
public class TreeMapSubMapDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map
        map.put(10, "Ten");
        map.put(20, "Twenty");
        map.put(30, "Thirty");
        map.put(40, "Forty");

        System.out.println("subMap(20, 40): " + map.subMap(20, 40));
        System.out.println("subMap(20, true, 40, true): " + map.subMap(20, true, 40, true));
    }
}
// OUTPUT:
// subMap(20, 40): {20=Twenty, 30=Thirty}
// subMap(20, true, 40, true): {20=Twenty, 30=Thirty, 40=Forty}`,
                  `// descendingMap() / descendingKeySet() / navigableKeySet() / comparator()
import java.util.TreeMap;
public class TreeMapDescendingDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map
        map.put(10, "Ten");
        map.put(20, "Twenty");
        map.put(30, "Thirty");

        System.out.println("descendingMap(): " + map.descendingMap());
        System.out.println("descendingKeySet(): " + map.descendingKeySet());
        System.out.println("navigableKeySet(): " + map.navigableKeySet());
        System.out.println("comparator() (null = natural order): " + map.comparator());
    }
}
// OUTPUT:
// descendingMap(): {30=Thirty, 20=Twenty, 10=Ten}
// descendingKeySet(): [30, 20, 10]
// navigableKeySet(): [10, 20, 30]
// comparator() (null = natural order): null`
                ]
              },
{
                content: `<h3>HashMap vs LinkedHashMap vs TreeMap</h3>
<br>
<h4>Comparison</h4>
<br>
<ul>
<li><strong>HashMap:</strong> No order, O(1), allows null key</li>
<li><strong>LinkedHashMap:</strong> Insertion order, O(1), allows null key</li>
<li><strong>TreeMap:</strong> Sorted by key, O(log n), NO null key, uses Red-Black tree</li>
</ul>`
              },
              {
                content: `<h3>Internal Working of TreeMap</h3>
TreeMap has a <strong>completely different internal structure</strong> from HashMap - there's no hashing, no buckets, and no array at all. Every entry is a node in a <strong>Red-Black tree</strong> (a self-balancing binary search tree), and every operation is driven entirely by <strong>comparison</strong> (via Comparable or a supplied Comparator), not hash codes.<br>
<br>
<h4>The Red-Black Tree Rules</h4>
A Red-Black tree stays balanced by enforcing 4 simple coloring rules on every insert/delete:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Rule</th><th style="text-align:left;">What It Guarantees</th></tr>
<tr><td>Every node is RED or BLACK</td><td>Just a 1-bit color flag stored per node</td></tr>
<tr><td>The root is always BLACK</td><td>Fixes a reference point for the other rules</td></tr>
<tr><td>Every RED node has two BLACK children (no two REDs in a row)</td><td>Prevents any path from being disproportionately "red-heavy"</td></tr>
<tr><td>Every path from a node to its descendant null leaves has the same number of BLACK nodes</td><td>The actual balance guarantee - the longest possible path is never more than 2&times; the shortest, which is what keeps height at O(log n)</td></tr>
</table>
<br>
<h4>Node Structure (Simplified)</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Field</th><th style="text-align:left;">Purpose</th></tr>
<tr><td>key, value</td><td>The actual entry data</td></tr>
<tr><td>left, right</td><td>References to the left/right child nodes</td></tr>
<tr><td>parent</td><td>Reference back up the tree - needed to fix balance after insert/delete</td></tr>
<tr><td>color</td><td>RED or BLACK - the flag the rebalancing algorithm reads and flips</td></tr>
</table>
<br>
<h4>How put(key, value) Actually Works</h4>
<br>
1. <strong>Traverse from the root</strong> - at each node, call <code>compareTo()</code> (or the supplied <code>Comparator.compare()</code>) between the new key and the current node's key.<br>
2. <strong>Go left</strong> if the new key is smaller, <strong>go right</strong> if larger, until an empty spot is found (or an equal key is found, in which case the value is just replaced).<br>
3. <strong>Insert the new node as RED</strong> at that spot (inserting red first, rather than black, keeps the black-height rule intact immediately).<br>
4. <strong>Fix-up pass</strong> - walk back up from the new node checking for violations (two reds in a row). Violations are resolved with a mix of <strong>recoloring</strong> and <strong>rotations</strong> (single or double, left or right) until all 4 rules hold again.<br>
<br>
<strong>Why this matters:</strong> because every step is a comparison, TreeMap's performance depends entirely on how cheap and correct your <code>compareTo()</code>/Comparator is - unlike HashMap, there's no hashCode() involved anywhere in a TreeMap.<br>
<br>
<h4>TreeMap vs HashMap - Internal Mechanism Side by Side</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Aspect</th><th style="text-align:left;">HashMap</th><th style="text-align:left;">TreeMap</th></tr>
<tr><td><strong>Underlying structure</strong></td><td>Array of buckets (linked lists / trees)</td><td>Single Red-Black tree (no array)</td></tr>
<tr><td><strong>Decides placement using</strong></td><td>hashCode() + bit-spreading</td><td>compareTo() / Comparator.compare()</td></tr>
<tr><td><strong>Resolves collisions with</strong></td><td>equals() within a bucket</td><td>N/A - keys are ordered, not bucketed</td></tr>
<tr><td><strong>Rebalances via</strong></td><td>Resize (doubling capacity) + treeification of individual buckets</td><td>Rotations + recoloring on every insert/delete</td></tr>
<tr><td><strong>get/put time complexity</strong></td><td>O(1) average, O(log n) worst case (post-treeification)</td><td>O(log n) always, guaranteed by the tree balance rules</td></tr>
</table>`,
                codeExamples: [
                  `import java.util.TreeMap;

public class TreeMapTraversalDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> map = new TreeMap<>(); // creates an empty TreeMap named map

        // Every put() call below walks the tree from the root,
        // comparing keys to decide left/right, until it finds its spot.
        map.put(50, "root-ish");    // becomes the first node (root)
        map.put(30, "goes left of 50");
        map.put(70, "goes right of 50");
        map.put(20, "goes left of 30");
        map.put(40, "goes right of 30");

        // In-order traversal of a BST always yields sorted order for free -
        // this is exactly why TreeMap.toString()/keySet()/entrySet() come out sorted.
        System.out.println("Sorted order: " + map);
        System.out.println("firstKey() (leftmost node): " + map.firstKey());
        System.out.println("lastKey() (rightmost node): " + map.lastKey());
    }
}
// OUTPUT:
// Sorted order: {20=goes left of 30, 30=goes left of 50, 40=goes right of 30, 50=root-ish, 70=goes right of 50}
// firstKey() (leftmost node): 20
// lastKey() (rightmost node): 70`,
                  `import java.util.TreeMap;
import java.util.Comparator;

public class TreeMapComparatorDrivenDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // When a Comparator is supplied, EVERY tree comparison uses it instead
        // of the keys' own compareTo() - proving the tree structure is entirely
        // comparison-driven, not hash-driven.
        TreeMap<String, Integer> byLength = new TreeMap<>(Comparator.comparingInt(String::length));

        byLength.put("Java", 1);
        byLength.put("C", 2);
        byLength.put("Python", 3);
        byLength.put("Go", 4);

        System.out.println("Ordered by string length: " + byLength);
        // "compareTo()" on the Strings themselves (alphabetical) is never consulted -
        // the tree only ever asks the Comparator.
    }
}
// OUTPUT: Ordered by string length: {C=2, Go=4, Java=1, Python=3}`
                ]
              },
              {
                content: `<h3>Class Diagram: TreeMap's Structure and Its Entry Node</h3>
TreeMap sits at the bottom of its own delegation chain too (nothing composes it the way HashSet composes HashMap) - but its internal node type is structurally different from HashMap's Node in a way worth diagramming explicitly.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">AbstractMap&lt;K,V&gt; &nbsp;<span style="color:#777;">implements Map&lt;K,V&gt;</span></td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<strong>TreeMap&lt;K,V&gt;</strong> &nbsp;<span style="font-size:11px; color:#777;">implements NavigableMap&lt;K,V&gt;, Cloneable, Serializable</span><br>
<span style="font-size:12px; font-family:monospace;">- root: Entry&lt;K,V&gt;<br>- comparator: Comparator&lt;? super K&gt;</span>
</td>
</tr>
</table>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">TreeMap's node type - a tree node, not a bucket-list node</td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px;">
<strong>TreeMap.Entry&lt;K,V&gt;</strong> &nbsp;<span style="color:#777;">(private static inner class)</span><br>
<span style="font-family:monospace; font-size:11px;">key, value, left, right, parent, color</span>
</td>
</tr>
</table>
<br>
<h4>Side-by-Side: HashMap.Node vs TreeMap.Entry</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Field</th><th style="text-align:left;">HashMap.Node&lt;K,V&gt;</th><th style="text-align:left;">TreeMap.Entry&lt;K,V&gt;</th></tr>
<tr><td>Links to other nodes</td><td><code>next</code> only (1 pointer, singly-linked within a bucket)</td><td><code>left</code>, <code>right</code>, <code>parent</code> (3 pointers, binary tree)</td></tr>
<tr><td>Extra bookkeeping</td><td><code>hash</code> (cached hash code)</td><td><code>color</code> (RED/BLACK flag for rebalancing)</td></tr>
<tr><td>Structure formed</td><td>An array of independent short linked lists (one per bucket)</td><td>One single connected binary search tree for the whole map</td></tr>
<tr><td>Where it lives</td><td>Referenced from <code>table[index]</code></td><td>Referenced from the single <code>root</code> field, everything else reachable by walking left/right</td></tr>
</table>
<br>
This is the structural reason TreeMap doesn't need (or have) an array field at all - HashMap's <code>table</code> array is what a hash structure fundamentally requires, while a tree only ever needs one entry point (<code>root</code>) plus the parent/child pointers threaded through the Entry nodes themselves.<br>`
              },
              {
                content: `<h3>Memory Diagram: What put() Actually Builds on the Heap</h3>
Same exercise as HashMap's diagram, but forming a tree with real key-value pairs instead of a bucket array - directly comparable to TreeSet's memory diagram, just with an actual <code>value</code> field instead of the shared PRESENT dummy.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">HEAP - after treeMap.put(20,"Twenty"); put(10,"Ten"); put(30,"Thirty");</td></tr>
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>TreeMap@M</strong><br>
<span style="font-size:12px;">root &rarr; Entry@E1</span>
</td>
</tr>
<tr><td style="height:12px;"></td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:10px 14px;">
<strong>Entry@E1 (root, BLACK)</strong><br>{key=20, value="Twenty", left &rarr; Entry@E2, right &rarr; Entry@E3, parent &rarr; null}
</td>
</tr>
<tr><td style="height:6px;"></td></tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;">
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>Entry@E2 (RED)</strong><br>{key=10, value="Ten", left&rarr;null, right&rarr;null, parent&rarr;E1}
</td>
<td></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>Entry@E3 (RED)</strong><br>{key=30, value="Thirty", left&rarr;null, right&rarr;null, parent&rarr;E1}
</td>
</tr>
</table>
</td>
</tr>
</table>
<br>
<strong>Tracing get(10):</strong> start at root E1 (key=20) &rarr; <code>compareTo</code> says 10 &lt; 20, follow <code>left</code> to E2 (key=10) &rarr; keys match, return E2's <code>value</code> field ("Ten") directly. Three pointer hops total, matching the O(log n) guarantee - no array indexing, no hash computation, purely following left/right references down from root.<br>
<br>
<strong>Why remove() is more involved than insert():</strong> deleting E1 (the root) isn't as simple as clearing a reference - since E1 has two children, the tree must first find E1's <strong>in-order successor</strong> (the leftmost node of its right subtree) to replace it with, then re-run the same rotation/recolor fix-up logic on whatever node ends up where the deleted one was. This is why TreeMap deletion, while still O(log n), does meaningfully more pointer surgery per call than a HashMap bucket removal (which is just <code>next</code> reassignment).<br>`
              },
              {
                content: `<h4>Deep Dive: TreeMap's 4 Constructors and Its Remaining Methods</h4>
Rounding out the TreeMap reference: all 4 constructors side by side, plus <code>clear()/isEmpty()/clone()/equals()/hashCode()/toString()</code> shown directly on TreeMap (the table noted these are "shared with Map," but they're worth seeing run on a sorted map specifically).<br>`,
                codeExamples: [
                  `// All 4 TreeMap constructors, side by side
import java.util.*;

public class TreeMapConstructorsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> t1 = new TreeMap<>();                                   // 1. natural key ordering
        TreeMap<Integer, String> t2 = new TreeMap<>(Comparator.reverseOrder());           // 2. custom Comparator
        TreeMap<Integer, String> t3 = new TreeMap<>(Map.of(3, "C", 1, "A", 2, "B"));      // 3. from a Map (re-sorted)
        TreeMap<Integer, String> t4 = new TreeMap<>((SortedMap<Integer, String>) t3);     // 4. from an existing SortedMap

        System.out.println("t2 (reverse order): " + (t2.isEmpty() ? "empty (no puts yet)" : t2));
        System.out.println("t3 (from Map, auto-sorted): " + t3);
        System.out.println("t4 (from SortedMap t3): " + t4);
    }
}
// OUTPUT:
// t2 (reverse order): empty (no puts yet)
// t3 (from Map, auto-sorted): {1=A, 2=B, 3=C}
// t4 (from SortedMap t3): {1=A, 2=B, 3=C}`,
                  `// clear() / isEmpty() / clone() / equals() / hashCode() / toString() on TreeMap
import java.util.TreeMap;

public class TreeMapCloneEqualsDemo { // class that holds the main method
    @SuppressWarnings("unchecked")
    public static void main(String[] args) { // program entry point
        TreeMap<Integer, String> t1 = new TreeMap<>(); // creates an empty TreeMap named t1
        t1.put(1, "A");
        t1.put(2, "B");

        System.out.println("isEmpty(): " + t1.isEmpty());

        TreeMap<Integer, String> t2 = (TreeMap<Integer, String>) t1.clone();
        System.out.println("Clone equals original? " + t1.equals(t2));
        System.out.println("Same hashCode? " + (t1.hashCode() == t2.hashCode()));
        System.out.println("toString(): " + t2.toString());

        t1.clear();
        System.out.println("After clear(): " + t1 + ", isEmpty()=" + t1.isEmpty());
        System.out.println("Clone unaffected by clear() on original: " + t2);
    }
}
// OUTPUT:
// isEmpty(): false
// Clone equals original? true
// Same hashCode? true
// toString(): {1=A, 2=B}
// After clear(): {}, isEmpty()=true
// Clone unaffected by clear() on original: {1=A, 2=B}`
                ]
              }
            ]
          },

          // ----- Hashtable -----
          {
            id: 'hashtable',
            name: 'Hashtable',
            beginner: [
{
                content: `<h3>Hashtable</h3>
<strong>Hashtable</strong> is a <strong>synchronized (thread-safe)</strong> implementation of the Map interface. It is a <strong>legacy class</strong> that was part of Java since JDK 1.0, before the Collection Framework was introduced.<br>
<br>
<h4>Key Features of Hashtable</h4>
<br>
<ul>
<li><strong>Synchronized (Thread-Safe)</strong> - Every method is synchronized, making it safe for multi-threaded access.</li>
<li><strong>No Null Keys or Values</strong> - Hashtable does not allow null keys or null values. Attempting to use null throws <strong>NullPointerException</strong>.</li>
<li><strong>Legacy Class</strong> - Present since JDK 1.0. Implements the legacy Dictionary class as well as Map interface.</li>
<li><strong>Similar to HashMap</strong> - Functionally similar but synchronized and no null allowed.</li>
<li><strong>Slower than HashMap</strong> - Due to synchronization overhead on every method call.</li>
<li><strong>Different Default Capacity</strong> - Hashtable starts with an initial default capacity of <strong>11</strong> (and a load factor of 0.75), unlike HashMap's default capacity of 16.</li>
</ul>`,
                codeExamples: [
                  `import java.util.Hashtable;
import java.util.Map;

public class HashtableBasics { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<String, Integer> ht = new Hashtable<>(); // creates an empty Hashtable named ht

        // Adding entries
        ht.put("Java", 90);
        ht.put("Python", 85);
        ht.put("C++", 78);

        System.out.println("Hashtable: " + ht);

        // Get value
        System.out.println("Java: " + ht.get("Java"));

        // Contains
        System.out.println("Contains key Python? " + ht.containsKey("Python"));
        System.out.println("Contains value 78? " + ht.containsValue(78));

        // Remove
        ht.remove("C++");
        System.out.println("After remove: " + ht);

        // Iterate
        for (Map.Entry<String, Integer> entry : ht.entrySet()) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }

        // Null NOT allowed
        // ht.put(null, 100);   // NullPointerException
        // ht.put("Go", null);  // NullPointerException
    }
}`
                ]
              },
{
                content: `<h3>HashMap vs Hashtable</h3>
<br>
<h4>Comparison</h4>
<br>
<ul>
<li><strong>HashMap:</strong> Non-synchronized, allows one null key & multiple null values, introduced in 1.2, faster, Iterator is fail-fast</li>
<li><strong>Hashtable:</strong> Synchronized (thread safe), NO null keys or values, introduced in 1.0 (legacy), slower, Enumerator is not fail-fast</li>
<li><strong>Both:</strong> Store key-value pairs, no duplicate keys</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class HashtableDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<Integer, String> ht = new Hashtable<>(); // creates an empty Hashtable named ht
        ht.put(101, "Pankaj");
        ht.put(102, "Dheeraj");
        ht.put(103, "Sheru");

        System.out.println("Hashtable: " + ht);

        // Iteration using Enumeration
        Enumeration<Integer> keys = ht.keys();
        while (keys.hasMoreElements()) {
            Integer key = keys.nextElement();
            System.out.println("Key: " + key + ", Value: " + ht.get(key));
        }
    }
}`
                ]
              },
              {
                content: `<h3>Hashtable - Complete Method Reference (~29 Methods)</h3>
Hashtable's method set is almost identical to HashMap's, plus two <strong>legacy Enumeration-based methods</strong> left over from JDK 1.0 (predating even the Iterator interface). Grouped by purpose:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Shared with HashMap</strong></td><td>put, get, remove, containsKey, containsValue, size, isEmpty, clear, keySet, values, entrySet, putAll, putIfAbsent, getOrDefault, replace, replaceAll, compute*, merge, forEach - all identical to HashMap</td></tr>
<tr><td><strong>2. Legacy (unique to Hashtable/Dictionary)</strong></td><td>keys() - Enumeration of keys, elements() - Enumeration of values, contains(Object) - legacy alias for containsValue()</td></tr>
<tr><td><strong>3. Other</strong></td><td>clone(), equals(Object), hashCode(), toString()</td></tr>
</table>
<br>
Since all the shared methods behave exactly like HashMap (just synchronized, and rejecting null), see the <strong>HashMap</strong> topic for their individual examples - only the legacy Enumeration methods are shown separately below.<br>`
              },
              {
                content: `<h4>Hashtable's Legacy Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// elements() - legacy Enumeration over the VALUES (keys() covered above iterates keys)
import java.util.Enumeration;
import java.util.Hashtable;
public class HashtableElementsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<Integer, String> ht = new Hashtable<>(); // creates an empty Hashtable named ht
        ht.put(1, "Pankaj");
        ht.put(2, "Dheeraj");

        Enumeration<String> values = ht.elements();
        while (values.hasMoreElements()) {
            System.out.println(values.nextElement());
        }
    }
}
// OUTPUT:
// Pankaj
// Dheeraj`,
                  `// contains(Object value) - legacy alias for containsValue()
import java.util.Hashtable;
public class HashtableContainsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<Integer, String> ht = new Hashtable<>(); // creates an empty Hashtable named ht
        ht.put(1, "Pankaj");
        System.out.println(ht.contains("Pankaj"));    // checks VALUES, not keys
        System.out.println(ht.contains(1));            // false - 1 is a key, not a value
    }
}
// OUTPUT:
// true
// false`,
                  `// size() / isEmpty() / clear()
import java.util.Hashtable;
public class HashtableSizeClearDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<Integer, String> ht = new Hashtable<>(); // creates an empty Hashtable named ht
        System.out.println("isEmpty (before): " + ht.isEmpty());
        ht.put(1, "Pankaj");
        ht.put(2, "Dheeraj");
        System.out.println("size(): " + ht.size());
        ht.clear();
        System.out.println("After clear(): " + ht);
    }
}
// OUTPUT:
// isEmpty (before): true
// size(): 2
// After clear(): {}`
                ]
              },
{
                content: `<h3>Internal Working of Hashtable</h3>
Hashtable looks like "synchronized HashMap" from the outside, but its internals actually predate HashMap by years (JDK 1.0 vs JDK 1.2) and differ in several concrete ways that rarely get mentioned.<br>
<br>
<h4>1. Prime-Number Capacity + Modulo Indexing (Not Power-of-2 + Bitwise AND)</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Aspect</th><th style="text-align:left;">HashMap</th><th style="text-align:left;">Hashtable</th></tr>
<tr><td><strong>Default capacity</strong></td><td>16 (power of 2)</td><td>11 (arbitrary, historically prime-friendly)</td></tr>
<tr><td><strong>Bucket index formula</strong></td><td><code>(n - 1) &amp; hash</code> - bitwise AND, very fast</td><td><code>(hash &amp; 0x7FFFFFFF) % table.length</code> - modulo, slower</td></tr>
<tr><td><strong>Why the difference matters</strong></td><td>Bitwise AND only gives even bucket distribution when capacity is a power of 2</td><td>Modulo works correctly for any capacity, at the cost of a slower operation per put/get</td></tr>
<tr><td><strong>Growth formula</strong></td><td>newCapacity = oldCapacity &times; 2 (clean doubling)</td><td>newCapacity = (oldCapacity &times; 2) + 1 (double, then +1)</td></tr>
</table>
<br>
<h4>2. No Treeification - Ever</h4>
Unlike HashMap (which converts a heavily-collided bucket to a Red-Black tree once it has 8+ nodes AND the table has 64+ buckets), <strong>Hashtable's buckets stay linked lists forever</strong>, no matter how many entries collide. Worst-case lookup in a single bucket is always <strong>O(n)</strong> in Hashtable, while HashMap caps it at <strong>O(log n)</strong> since Java 8.<br>
<br>
<h4>3. Class Hierarchy - Dictionary, Not Just Map</h4>
Hashtable is one of the few classes that implements <strong>both</strong> the legacy abstract class <code>Dictionary&lt;K,V&gt;</code> (JDK 1.0, now obsolete) <strong>and</strong> the modern <code>Map&lt;K,V&gt;</code> interface (added in 1.2 to retrofit it into the Collection Framework) - that dual inheritance is why it has both legacy methods (<code>keys()</code>, <code>elements()</code>, <code>put()</code> returning the old value like Dictionary specified) and modern Map methods (<code>keySet()</code>, <code>entrySet()</code>, <code>computeIfAbsent()</code>, etc.) side by side.<br>
<br>
<h4>4. Coarse-Grained Locking</h4>
Every public method (<code>put</code>, <code>get</code>, <code>remove</code>, <code>size</code>, even <code>isEmpty</code>) is declared <code>synchronized</code>, meaning it acquires the intrinsic lock on the <strong>entire Hashtable object</strong> before doing anything. Two threads calling <code>get()</code> on different, unrelated keys still block each other - there is no concept of partial/segment locking the way ConcurrentHashMap has.<br>
<br>
<h4>5. Null Rejection Happens Immediately, Not Via Bucket Logic</h4>
HashMap has special-cased handling that lets a null key live in bucket 0. Hashtable has no such path - <code>put()</code> explicitly checks <code>if (value == null) throw new NullPointerException()</code> right at the top, before any hashing happens at all (and a null key throws too, since <code>key.hashCode()</code> would NPE regardless).<br>`,
                codeExamples: [
                  `import java.util.Hashtable;

public class HashtableCapacityDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Default capacity is 11, NOT 16 - a genuinely different starting point from HashMap.
        Hashtable<Integer, String> ht = new Hashtable<>(); // creates an empty Hashtable named ht

        // Insert enough entries to trigger a resize (default load factor is also 0.75).
        for (int i = 1; i <= 10; i++) {
            ht.put(i, "Value-" + i);
        }

        System.out.println("Hashtable after 10 puts: " + ht);
        System.out.println("Size: " + ht.size());
        // Internally, capacity growth follows (old * 2) + 1, e.g. 11 -> 23 -> 47 ...
        // instead of HashMap's clean doubling (16 -> 32 -> 64 ...).
    }
}
// OUTPUT:
// Hashtable after 10 puts: {1=Value-1, 2=Value-2, 3=Value-3, 4=Value-4, 5=Value-5, 6=Value-6, 7=Value-7, 8=Value-8, 9=Value-9, 10=Value-10}
// Size: 10`,
                  `import java.util.Hashtable;
import java.util.Dictionary;

public class HashtableIsADictionaryDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Hashtable can be assigned to a Dictionary reference - proof of the
        // legacy dual-inheritance (Dictionary AND Map) that no other common
        // Map implementation has.
        Dictionary<String, Integer> asDictionary = new Hashtable<>();
        asDictionary.put("Java", 1);
        asDictionary.put("Python", 2);

        System.out.println("Via Dictionary API: " + asDictionary.get("Java"));
        System.out.println("size() from Dictionary: " + asDictionary.size());
    }
}
// OUTPUT:
// Via Dictionary API: 1
// size() from Dictionary: 2`
                ]
              },
              {
                content: `<h4>Deep Dive: The JDK 8 Map Default Methods on Hashtable - and Where Null-Handling Differs</h4>
Hashtable inherits <code>putIfAbsent, getOrDefault, computeIfAbsent, computeIfPresent, compute, merge, replaceAll, forEach</code> from the <strong>Map</strong> interface's default methods, exactly like HashMap does. They work the same day-to-day - but Hashtable's blanket "no nulls, ever" rule still applies underneath, which trips people up on a couple of these specifically.<br>`,
                codeExamples: [
                  `// putIfAbsent / getOrDefault / merge - work exactly like HashMap when values are non-null
import java.util.Hashtable;

public class HashtableDefaultMethodsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<String, Integer> ht = new Hashtable<>(); // creates an empty Hashtable named ht
        ht.put("A", 1);

        ht.putIfAbsent("A", 99);    // key exists - ignored
        ht.putIfAbsent("B", 2);     // key absent - inserted
        System.out.println("After putIfAbsent: " + ht);

        System.out.println("getOrDefault(Z, -1): " + ht.getOrDefault("Z", -1));

        ht.merge("A", 10, Integer::sum);    // A: 1 + 10
        System.out.println("After merge: " + ht);
    }
}
// OUTPUT:
// After putIfAbsent: {B=2, A=1}
// getOrDefault(Z, -1): -1
// After merge: {B=2, A=11}`,
                  `// Where null-handling differs from HashMap: getOrDefault's default CAN be null in HashMap,
// but merge()/computeIfAbsent() on Hashtable still reject a null RESULT, same as HashMap's contract -
// the difference is Hashtable also can't hold the null VALUES these methods might try to store.
import java.util.Hashtable;

public class HashtableNullDefaultMethodDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<String, Integer> ht = new Hashtable<>(); // creates an empty Hashtable named ht
        ht.put("A", 1);

        try {
            // computeIfAbsent() with a function returning null -> Hashtable
            // never gets a value to store, so nothing is inserted (same as HashMap)
            Integer result = ht.computeIfAbsent("B", k -> null);
            System.out.println("computeIfAbsent result: " + result);
            System.out.println("Map after: " + ht);
        } catch (NullPointerException e) {
            System.out.println("NPE: " + e.getMessage());
        }

        try {
            ht.merge("A", null, Integer::sum);    // merge() itself rejects a null value argument
        } catch (NullPointerException e) {
            System.out.println("merge(null) throws NPE, just like HashMap's contract requires");
        }
    }
}
// OUTPUT:
// computeIfAbsent result: null
// Map after: {A=1}
// merge(null) throws NPE, just like HashMap's contract requires`
                ]
              },
              {
                content: `<h4>Deep Dive: Hashtable's 4 Constructors, putAll(), and Its Views</h4>
Rounding out the reference: all 4 constructors side by side (note the <strong>default capacity is 11</strong>, not 16 - see Internal Working above for why), plus <code>putAll()</code>, <code>keySet()</code>/<code>values()</code> individually, and <code>clone()/equals()/hashCode()/toString()</code> shown directly on Hashtable.<br>`,
                codeExamples: [
                  `// All 4 Hashtable constructors, side by side
import java.util.Hashtable;

public class HashtableConstructorsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<String, Integer> h1 = new Hashtable<>();                 // 1. default: capacity 11, load factor 0.75
        Hashtable<String, Integer> h2 = new Hashtable<>(50);               // 2. custom initial capacity
        Hashtable<String, Integer> h3 = new Hashtable<>(50, 0.9f);         // 3. custom capacity + load factor
        Hashtable<String, Integer> h4 = new Hashtable<>(java.util.Map.of("A", 1, "B", 2));    // 4. from another Map

        System.out.println("h4 (copied from another Map): " + h4);
    }
}
// OUTPUT: h4 (copied from another Map): {A=1, B=2}`,
                  `// putAll(Map) / keySet() / values()
import java.util.Hashtable;

public class HashtablePutAllViewsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        Hashtable<String, Integer> ht = new Hashtable<>(); // creates an empty Hashtable named ht
        ht.put("A", 1);

        ht.putAll(java.util.Map.of("B", 2, "C", 3));
        System.out.println("After putAll: " + ht);

        System.out.println("keySet(): " + ht.keySet());
        System.out.println("values(): " + ht.values());
    }
}
// OUTPUT:
// After putAll: {A=1, B=2, C=3}
// keySet(): [A, B, C]
// values(): [1, 2, 3]`,
                  `// clone() / equals() / hashCode() / toString() directly on Hashtable
import java.util.Hashtable;

public class HashtableCloneEqualsDemo { // class that holds the main method
    @SuppressWarnings("unchecked")
    public static void main(String[] args) { // program entry point
        Hashtable<String, Integer> h1 = new Hashtable<>(); // creates an empty Hashtable named h1
        h1.put("A", 1);
        h1.put("B", 2);

        Hashtable<String, Integer> h2 = (Hashtable<String, Integer>) h1.clone();

        System.out.println("Clone equals original? " + h1.equals(h2));
        System.out.println("Same hashCode? " + (h1.hashCode() == h2.hashCode()));
        System.out.println("toString(): " + h2.toString());

        h2.put("C", 3);    // modifying the clone does NOT affect the original
        System.out.println("Original after modifying clone: " + h1);
    }
}
// OUTPUT:
// Clone equals original? true
// Same hashCode? true
// toString(): {A=1, B=2}
// Original after modifying clone: {A=1, B=2}`
                ]
              },
              {
                content: `<h3>Class Diagram: Hashtable's Unusual Dual Inheritance</h3>
Every other Map implementation in this course (HashMap, TreeMap, LinkedHashMap) reaches Map&lt;K,V&gt; through a single path: <code>AbstractMap implements Map</code>. Hashtable is the odd one out - it's the only class here that both <strong>extends an abstract class</strong> and <strong>implements an interface</strong> to get there, a leftover from being designed 2 years before the Collection Framework existed.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px;">
Dictionary&lt;K,V&gt;<br><span style="font-size:10px; color:#8a5a00;">(abstract class, JDK 1.0, obsolete)</span>
</td>
<td style="width:40px;"></td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">
&laquo;interface&raquo; Map&lt;K,V&gt;<br><span style="font-size:10px; color:#3b5f8f;">(JDK 1.2, retrofitted)</span>
</td>
</tr>
<tr>
<td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td>
<td></td>
<td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; implements</td>
</tr>
<tr>
<td colspan="3" style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<strong>Hashtable&lt;K,V&gt;</strong> &nbsp;<span style="font-size:11px; color:#777;">implements Map&lt;K,V&gt;, Cloneable, Serializable</span><br>
<span style="font-size:12px; font-family:monospace;">- table: Entry&lt;K,V&gt;[]</span>
</td>
</tr>
</table>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">Hashtable's node type - a bucket-list node, same shape as HashMap's, different class entirely</td></tr>
<tr>
<td style="background:#fbeae5; border:1px solid #e0a898; border-radius:6px; padding:8px 12px; font-size:12px;">
<strong>Hashtable.Entry&lt;K,V&gt;</strong> &nbsp;<span style="color:#777;">implements Map.Entry&lt;K,V&gt;</span><br>
<span style="font-family:monospace; font-size:11px;">hash, key, value, next</span><br>
<span style="font-size:11px; color:#777;">always a linked list - Hashtable has no TreeNode equivalent, ever</span>
</td>
</tr>
</table>
<br>
<strong>Why this matters beyond trivia:</strong> because Hashtable inherits from Dictionary, its <code>put()</code> method's return-value contract and its <code>size()</code>/<code>isEmpty()</code> behavior were fixed by the 1996-era Dictionary spec first, then Map's newer interface was bolted on afterward to make it collection-framework-compatible. That's the direct cause of the legacy/modern method duplication seen in the method reference table earlier (<code>keys()</code> alongside <code>keySet()</code>, <code>elements()</code> alongside <code>values()</code>) - two API generations coexisting in one class, unlike any other Map implementation covered here.<br>`
              },
              {
                content: `<h3>Memory Diagram: Bucket Placement AND the Synchronization Lock</h3>
Two things worth diagramming for Hashtable that don't apply to HashMap at all: the <strong>modulo-based</strong> bucket index (different arithmetic, possibly a different bucket than HashMap would choose for the same key), and the <strong>intrinsic lock</strong> every method acquires.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">HEAP - after ht.put("Pankaj", 90000) on a fresh Hashtable (default capacity 11)</td></tr>
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>Hashtable@H</strong><br>
<span style="font-size:12px;">table[11] &rarr; bucket array</span>
</td>
<td style="width:30px;">&rarr;</td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>index = (hash &amp; 0x7FFFFFFF) % 11</strong><br>
<span style="font-size:12px;">table[index] &rarr; Entry@N1<br>{hash, key&rarr;"Pankaj", value&rarr;90000, next&rarr;null}</span>
</td>
</tr>
</table>
<br>
<strong>Contrast with HashMap's diagram:</strong> HashMap computed its bucket with <code>(n-1) &amp; hash</code> against a capacity-16 table; Hashtable computes it with <code>% 11</code> against a capacity-11 table. Same key, same hashCode() value going in, but a <strong>different index arithmetic</strong> means the two structures don't even necessarily agree on which bucket "Pankaj" belongs in - there's no equivalence between a HashMap bucket number and a Hashtable bucket number for the same key.<br>
<br>
<h4>The Lock: What synchronized Actually Guards</h4>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:6px; padding:10px 14px;">
<strong>Hashtable@H's object header</strong><br>
<span style="font-size:12px;">monitor (intrinsic lock) - currently held by <strong>Thread-1</strong></span>
</td>
</tr>
<tr><td style="height:10px;"></td></tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;">
<tr>
<td style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>Thread-1</strong>: inside <code>ht.put("A", 1)</code><br>holds the lock, executing normally
</td>
<td></td>
<td style="background:#fbeae5; border:1px solid #e0a898; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>Thread-2</strong>: calls <code>ht.get("Z")</code><br><strong>BLOCKED</strong> waiting for the same lock - even though "A" and "Z" are unrelated keys in different buckets
</td>
</tr>
</table>
</td>
</tr>
</table>
<br>
<strong>The key point this diagram makes visible:</strong> the lock lives on the <strong>Hashtable object itself</strong>, not on individual buckets - so Thread-2's <code>get("Z")</code> has to wait even though it will never touch the same Entry that Thread-1 is modifying. This single whole-object lock is exactly what a real ConcurrentHashMap replaces with much finer-grained locking (historically per-segment, now per-bin in modern JDKs), letting Thread-1 and Thread-2 proceed at the same time as long as they land in different buckets.<br>`
              },
              {
                content: `<h3>When to use Hashtable vs ConcurrentHashMap</h3>
<br>
<ul>
<li><strong>Hashtable</strong> synchronizes every method (entire table locked) - poor performance</li>
<li><strong>ConcurrentHashMap</strong> uses per-bin locking (CAS on empty bins plus synchronized on the bin head; the Java 7 Segment array was removed in Java 8) - much better concurrent performance</li>
<li>ConcurrentHashMap allows concurrent reads without locking</li>
<li>ConcurrentHashMap is preferred for multi-threaded applications since Java 5</li>
<li>Hashtable is legacy, ConcurrentHashMap is modern replacement</li>
</ul>`
              }
            ]
          }
        ]
      },

      // ===== SubTopic 5: Comparable & Comparator =====
      {
        id: 'comparable-comparator',
        name: 'Comparable & Comparator',
        topics: [

          // ----- Comparable -----
          {
            id: 'comparable',
            name: 'Comparable Interface',
            beginner: [
{
                content: `<h3>Comparable Interface</h3>
The <strong>Comparable</strong> interface is found in the <strong>java.lang</strong> package. It is used to define the <strong>natural ordering</strong> of objects. A class that implements Comparable can have its objects sorted automatically using <strong>Collections.sort(List)</strong> or <strong>Arrays.sort()</strong>.<br>
<br>
<h4>Key Points</h4>
<br>
<ul>
<li><strong>Package:</strong> java.lang (imported automatically).</li>
<li><strong>Method:</strong> Contains a single method - <strong>compareTo(Object o)</strong>.</li>
<li><strong>Return Value:</strong></li>
</ul>
&nbsp;&nbsp;- Returns <strong>negative integer</strong> if the current object is less than the other object.<br>
&nbsp;&nbsp;- Returns <strong>zero</strong> if the current object is equal to the other object.<br>
&nbsp;&nbsp;- Returns <strong>positive integer</strong> if the current object is greater than the other object.<br>
<ul>
<li><strong>Usage:</strong> Used with Collections.sort(List) for natural ordering.</li>
<li><strong>Modifies the Original Class:</strong> The class itself must implement Comparable and define compareTo().</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

class Person implements Comparable<Person> {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Define natural ordering by age
    @Override
    public int compareTo(Person other) {
        return this.age - other.age;
        // negative if this.age < other.age
        // zero if this.age == other.age
        // positive if this.age > other.age
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class ComparableExample { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<Person> people = new ArrayList<>();
        people.add(new Person("Chimnaji", 30));
        people.add(new Person("Anaji", 25));
        people.add(new Person("Baji", 28));
        people.add(new Person("David", 22));

        System.out.println("Before sorting: " + people);

        Collections.sort(people);  // uses compareTo()

        System.out.println("After sorting by age: " + people);
        // Output: [David(22), Anaji(25), Baji(28), Chimnaji(30)]
    }
}`
                ]
              },
              {
                content: `<h3>Comparable - Complete Method Reference</h3>
The <strong>Comparable</strong> interface itself declares only <strong>1 method</strong> - that's the whole contract. But writing a correct <code>compareTo()</code> body almost always means reaching for one of the JDK's built-in static <code>compare()</code> helpers below, instead of risky manual subtraction (see the "Internal Working" section for why subtraction is a real bug source).<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Method</th><th style="text-align:left;">Description</th><th style="text-align:left;">Return Type</th></tr>
<tr><td><strong>compareTo(T o)</strong></td><td>The single method Comparable declares - compares this object with the specified object for order</td><td>int</td></tr>
<tr><td><strong>Integer.compare(int, int)</strong></td><td>Safe comparison of two int values - use this instead of <code>a - b</code> inside compareTo()</td><td>int</td></tr>
<tr><td><strong>Double.compare(double, double)</strong></td><td>Safe comparison of two double values, correctly handles NaN and -0.0/+0.0</td><td>int</td></tr>
<tr><td><strong>Long.compare(long, long)</strong></td><td>Safe comparison of two long values</td><td>int</td></tr>
<tr><td><strong>Boolean.compare(boolean, boolean)</strong></td><td>Compares two booleans - false is considered less than true</td><td>int</td></tr>
<tr><td><strong>String.compareTo(String)</strong></td><td>Lexicographic (dictionary-order) comparison - String itself implements Comparable&lt;String&gt;</td><td>int</td></tr>
<tr><td><strong>String.compareToIgnoreCase(String)</strong></td><td>Same as compareTo() but case-insensitive</td><td>int</td></tr>
<tr><td><strong>Objects.compare(T, T, Comparator)</strong></td><td>Null-safe comparison of two objects using a supplied Comparator</td><td>int</td></tr>
</table>`,
                codeExamples: [
                  `// Integer.compare() / Double.compare() / Long.compare() / Boolean.compare()
public class WrapperCompareDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        System.out.println("Integer.compare(5, 10): " + Integer.compare(5, 10));
        System.out.println("Integer.compare(10, 5): " + Integer.compare(10, 5));
        System.out.println("Double.compare(1.5, 1.5): " + Double.compare(1.5, 1.5));
        System.out.println("Long.compare(100L, 50L): " + Long.compare(100L, 50L));
        System.out.println("Boolean.compare(false, true): " + Boolean.compare(false, true));
    }
}
// OUTPUT:
// Integer.compare(5, 10): -1
// Integer.compare(10, 5): 1
// Double.compare(1.5, 1.5): 0
// Long.compare(100L, 50L): 1
// Boolean.compare(false, true): -1`,
                  `// String.compareTo() / String.compareToIgnoreCase()
public class StringCompareDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        System.out.println("Apple.compareTo(Banana): " + "Apple".compareTo("Banana"));
        System.out.println("apple.compareTo(Apple): " + "apple".compareTo("Apple"));
        System.out.println("apple.compareToIgnoreCase(Apple): " + "apple".compareToIgnoreCase("Apple"));
    }
}
// OUTPUT:
// Apple.compareTo(Banana): -1
// apple.compareTo(Apple): 32
// apple.compareToIgnoreCase(Apple): 0`,
                  `// Objects.compare(T, T, Comparator) - null-safe comparison using a Comparator
import java.util.Comparator;
import java.util.Objects;
public class ObjectsCompareDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        String a = "Java";
        String b = "Python";
        int result = Objects.compare(a, b, Comparator.naturalOrder());
        System.out.println("Objects.compare: " + result);
    }
}
// OUTPUT: Objects.compare: -1`,
                  `// Using Integer.compare() correctly INSIDE a real compareTo() implementation
public class Employee implements Comparable<Employee> {
    int salary;
    Employee(int salary) { this.salary = salary; }

    @Override
    public int compareTo(Employee other) {
        return Integer.compare(this.salary, other.salary);    // safe - no overflow risk
    }

    public static void main(String[] args) { // program entry point
        Employee e1 = new Employee(50000);
        Employee e2 = new Employee(60000);
        System.out.println(e1.compareTo(e2));
        System.out.println(e2.compareTo(e1));
    }
}
// OUTPUT:
// -1
// 1`
                ]
              },
              {
                content: `<h4>Deep Dive: Multi-Field compareTo() and Enum's Built-in Ordering</h4>
Comparable itself has no chaining helpers like Comparator's thenComparing() - so multi-field natural ordering has to either be written by hand, field by field, or delegate to a Comparator chain internally. Both approaches are shown below, plus a look at how <strong>enum</strong> gets Comparable for free.<br>`,
                codeExamples: [
                  `// Hand-written multi-field compareTo() - the manual way (pre-Comparator-chaining idiom)
public class Student implements Comparable<Student> {
    String grade;
    int rollNo;
    Student(String grade, int rollNo) { this.grade = grade; this.rollNo = rollNo; }

    @Override
    public int compareTo(Student other) {
        int gradeResult = this.grade.compareTo(other.grade);
        if (gradeResult != 0) return gradeResult;             // grades differ - done
        return Integer.compare(this.rollNo, other.rollNo);     // grades tied - break tie by rollNo
    }

    @Override
    public String toString() { return grade + "-" + rollNo; }

    public static void main(String[] args) { // program entry point
        java.util.List<Student> students = new java.util.ArrayList<>(java.util.List.of(
            new Student("B", 5), new Student("A", 10), new Student("A", 3)
        ));
        java.util.Collections.sort(students);
        System.out.println(students);
    }
}
// OUTPUT: [A-3, A-10, B-5]`,
                  `// Delegating to a Comparator chain INSIDE compareTo() - the modern idiom
import java.util.Comparator;

public class Employee implements Comparable<Employee> {
    String department;
    String name;
    Employee(String department, String name) { this.department = department; this.name = name; }

    // Build the chain once - reused on every compareTo() call
    private static final Comparator<Employee> NATURAL_ORDER =
        Comparator.comparing((Employee e) -> e.department).thenComparing(e -> e.name);

    @Override
    public int compareTo(Employee other) {
        return NATURAL_ORDER.compare(this, other);    // gets thenComparing()'s power inside Comparable
    }

    @Override
    public String toString() { return department + ":" + name; }

    public static void main(String[] args) { // program entry point
        java.util.List<Employee> emps = new java.util.ArrayList<>(java.util.List.of(
            new Employee("IT", "Chimnaji"), new Employee("HR", "Baji"), new Employee("IT", "Anaji")
        ));
        java.util.Collections.sort(emps);
        System.out.println(emps);
    }
}
// OUTPUT: [HR:Baji, IT:Anaji, IT:Chimnaji]`,
                  `// Enum implements Comparable automatically - ordering is by declaration order (ordinal)
import java.util.*;

enum Priority { LOW, MEDIUM, HIGH, CRITICAL }    // ordinal: LOW=0, MEDIUM=1, HIGH=2, CRITICAL=3

public class EnumComparableDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<Priority> tasks = new ArrayList<>(List.of(Priority.HIGH, Priority.LOW, Priority.CRITICAL, Priority.MEDIUM));

        Collections.sort(tasks);    // uses Enum's built-in compareTo(), based on declaration order
        System.out.println(tasks);

        System.out.println("LOW.compareTo(HIGH): " + Priority.LOW.compareTo(Priority.HIGH));
    }
}
// OUTPUT:
// [LOW, MEDIUM, HIGH, CRITICAL]
// LOW.compareTo(HIGH): -2`
                ]
              },
              {
                content: `<h4>Deep Dive Part 2: Primitive Arrays Don't Use Comparable At All</h4>
A commonly-missed interview nuance: <code>Arrays.sort()</code> behaves completely differently depending on whether you give it a primitive array or an object array - and only one of the two paths ever touches Comparable.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Call</th><th style="text-align:left;">Algorithm Used</th><th style="text-align:left;">Uses Comparable?</th></tr>
<tr><td><strong>Arrays.sort(int[] a)</strong> (and other primitive array types)</td><td>Dual-Pivot Quicksort</td><td>No - primitives have no compareTo() to call; values are compared directly with <code>&lt;</code>/<code>&gt;</code></td></tr>
<tr><td><strong>Arrays.sort(Object[] a)</strong></td><td>TimSort</td><td>Yes - calls each element's compareTo()</td></tr>
</table>
<br>
This is also why the "Comparison method violates its general contract!" exception from earlier can <strong>only</strong> happen when sorting an object array (or a List) - a primitive int[] array physically cannot trigger it, since there's no compareTo() involved to violate any contract.<br>`,
                codeExamples: [
                  `import java.util.Arrays;

public class PrimitiveVsObjectSortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Primitive array - Dual-Pivot Quicksort, NO Comparable involved
        int[] primitives = { 5, 2, 8, 1, 9 };
        Arrays.sort(primitives);
        System.out.println("Primitive int[] sorted: " + Arrays.toString(primitives));

        // Object array - TimSort, calls compareTo() on each Integer
        Integer[] objects = { 5, 2, 8, 1, 9 };
        Arrays.sort(objects);
        System.out.println("Object Integer[] sorted: " + Arrays.toString(objects));

        // Proof: passing a Comparator only compiles for the OBJECT version -
        // primitive int[] has no overload that accepts a Comparator at all.
        Arrays.sort(objects, (a, b) -> b - a);    // reverse order, only possible on Integer[]
        System.out.println("Object Integer[] reverse-sorted via Comparator: " + Arrays.toString(objects));
    }
}
// OUTPUT:
// Primitive int[] sorted: [1, 2, 5, 8, 9]
// Object Integer[] sorted: [1, 2, 5, 8, 9]
// Object Integer[] reverse-sorted via Comparator: [9, 8, 5, 2, 1]`,
                  `// Raw Comparable (pre-generics, Java 1.4 style) vs generic Comparable<T> - a type-safety gap
import java.util.*;

@SuppressWarnings({"rawtypes", "unchecked"})
class RawBox implements Comparable {    // no <T> - raw type, compiles with a warning
    int value;
    RawBox(int value) { this.value = value; }

    @Override
    public int compareTo(Object other) {    // must accept Object, not RawBox - no compile-time safety
        return Integer.compare(this.value, ((RawBox) other).value);    // unchecked cast, can fail at RUNTIME
    }
}

class SafeBox implements Comparable<SafeBox> {    // generic - modern, type-safe style
    int value;
    SafeBox(int value) { this.value = value; }

    @Override
    public int compareTo(SafeBox other) {    // compiler guarantees 'other' is always a SafeBox
        return Integer.compare(this.value, other.value);
    }
}

public class RawVsGenericComparableDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        RawBox a = new RawBox(10);
        RawBox b = new RawBox(20);
        System.out.println("Raw compareTo, correct usage: " + a.compareTo(b));    // works fine here

        try {
            // This compiles cleanly because compareTo(Object) accepts ANYTHING -
            // the compiler has no generic type to check against on a raw type.
            a.compareTo("this is a String, not a RawBox - but it still compiles!");
        } catch (ClassCastException e) {
            System.out.println("Caught at RUNTIME: " + e.getClass().getSimpleName());
        }
        // SafeBox's compareTo(SafeBox) would have made the equivalent call a
        // COMPILE-TIME error instead of a runtime crash - always prefer Comparable<T>.
    }
}
// OUTPUT:
// Raw compareTo, correct usage: -1
// Caught at RUNTIME: ClassCastException`
                ]
              },
{
                content: `<h3>Implementing Comparable with Employee Class</h3>
The Comparable interface allows us to define the natural ordering for custom objects. Here we implement Comparable with an <strong>Employee</strong> class to sort data by salary.<br>
<br>
<h4>How compareTo() Works</h4>
<br>
\u2022 If <strong>salary == employee.salary</strong> \u2192 return <strong>0</strong> (equal).<br>
\u2022 If <strong>salary &gt; employee.salary</strong> \u2192 return <strong>1</strong> (greater).<br>
\u2022 If <strong>salary &lt; employee.salary</strong> \u2192 return <strong>-1</strong> (lesser).<br>
<br>
After calling <strong>Collections.sort(al)</strong>, the list is sorted in ascending order by salary. The second example demonstrates sorting <strong>Student</strong> objects by age using the same approach.<br>`,
                codeExamples: [
                  `// Class: 01
package com.sort;

public class Employee implements Comparable<Employee> {
    int id;
    String name;
    int salary;

    // Generate Constructor Using Fields
    public Employee(int id, String name, int salary) {
        super();
        this.id = id;
        this.name = name;
        this.salary = salary;
    }

    // Getter and Setter
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getSalary() { return salary; }
    public void setSalary(int salary) { this.salary = salary; }

    // sort data by using salary
    @Override
    public int compareTo(Employee employee) {
        if (salary == employee.salary)
            return 0;
        else if (salary > employee.salary)
            return 1;
        else
            return -1;
    }

    @Override
    public String toString() {
        return "Employee [id=" + id + ", name=" + name + ", salary=" + salary + "]";
    }
}

// Class: 02
package com.sort;

import java.util.ArrayList;
import java.util.Collections;

public class EmployeeSalarySortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Employee> al = new ArrayList<Employee>(); // creates an empty ArrayList named al
        al.add(new Employee(101, "ram", 9000));
        al.add(new Employee(102, "ashok", 3000));
        al.add(new Employee(103, "ajay", 8000));

        Collections.sort(al);

        for (Employee emp : al) {
            System.out.println("id>>" + emp.getId() + " name>>" + emp.getName() + " salary>>" + emp.getSalary());
        }
    }
}
// OUTPUT:
// id>>102 name>>ashok salary>>3000
// id>>103 name>>ajay salary>>8000
// id>>101 name>>ram salary>>9000`,
                  `// Class: 01
package com.javaschoollab.demo;

class Student implements Comparable<Student> {
    int rollno;
    String name;
    int age;

    Student(int rollno, String name, int age) {
        this.rollno = rollno;
        this.name = name;
        this.age = age;
    }

    public int compareTo(Student st) {
        if (age == st.age) return 0;
        else if (age > st.age) return 1;
        else return -1;
    }

    @Override
    public String toString() {
        return "Student [rollno=" + rollno + ", name=" + name + ", age=" + age + "]";
    }
}

// Class: 02
package com.bbbb;

import java.util.ArrayList;
import java.util.Collections;

public class StudentAgeSortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Student> al = new ArrayList<Student>(); // creates an empty ArrayList named al
        al.add(new Student(1, "Sheru", 20));
        al.add(new Student(2, "Pankaj", 21));
        al.add(new Student(3, "Dheeraj", 22));

        System.out.println("Using Simply Object:>> " + al);
        Collections.sort(al);
        System.out.println("Updated Sort Data:>> " + al);

        for (Student obj : al) {
            System.out.println("Roll No.:>> " + obj.rollno + ", Name is:>> " + obj.name + ", Age is:>> " + obj.age);
        }
    }
}
// OUTPUT:
// Roll No.:>> 1, Name is:>> Sheru, Age is:>> 20
// Roll No.:>> 2, Name is:>> Pankaj, Age is:>> 21
// Roll No.:>> 3, Name is:>> Dheeraj, Age is:>> 22`
                ]
              },
{
                content: `<h3>Benefits of Comparable</h3>
<br>
<h4>Key Benefits</h4>
<br>
<ul>
<li><strong>1. Natural Ordering:</strong> Defines a consistent way to compare objects. Once implemented, objects can be sorted anywhere without specifying how to sort them.</li>
</ul>
<br>
<ul>
<li><strong>2. Simplifies Code:</strong> Eliminates the need for custom comparator classes for simple comparisons. Just call Collections.sort(list) without passing any extra argument.</li>
</ul>
<br>
<ul>
<li><strong>3. Integration with Collections:</strong> Works seamlessly with Java's collection framework for sorting lists, sets, and maps. TreeSet and TreeMap automatically use Comparable to maintain sorted order.</li>
</ul>`
              },
              {
                content: `<h3>Internal Working of Comparable</h3>
compareTo() isn't just a method you implement and forget - it's called internally, repeatedly, by several different pieces of JDK machinery, and each one has its own expectations.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Caller</th><th style="text-align:left;">How It Uses compareTo() Internally</th></tr>
<tr><td><strong>Collections.sort(list) / Arrays.sort(objArray)</strong></td><td>Runs <strong>TimSort</strong> (a hybrid merge/insertion sort, since Java 7) - repeatedly calls <code>a.compareTo(b)</code> to decide merge order and to detect already-sorted runs to skip.</td></tr>
<tr><td><strong>TreeSet / TreeMap</strong></td><td>On every <code>add()</code>/<code>put()</code>, walks the Red-Black tree from the root, calling <code>compareTo()</code> at each node to decide whether to go left (negative) or right (positive), until it finds the correct insertion point.</td></tr>
<tr><td><strong>PriorityQueue</strong></td><td>Calls <code>compareTo()</code> while sifting a new element up/down the binary heap to keep the smallest element at the root.</td></tr>
<tr><td><strong>Collections.max() / min()</strong></td><td>Linear scan, calling <code>compareTo()</code> against the current best candidate on each element.</td></tr>
</table>
<br>
<h4>The Contract TimSort Actually Enforces at Runtime</h4>
Since Java 7, <strong>Arrays.sort()</strong> / <strong>Collections.sort()</strong> on objects don't just trust your compareTo() - TimSort actively <strong>detects contract violations</strong> (non-transitive or inconsistent comparisons) on large enough inputs and throws:<br>
<code>java.lang.IllegalArgumentException: Comparison method violates its general contract!</code><br>
This is one of the most common real-world Comparable/Comparator bugs in production Java code - usually caused by a compareTo() that isn't perfectly transitive (e.g., mixing multiple fields with subtraction that can overflow, or comparing floating-point values inconsistently).<br>`,
                codeExamples: [
                  `import java.util.Arrays;

class BrokenScore implements Comparable<BrokenScore> {
    int value;
    BrokenScore(int value) { this.value = value; }

    @Override
    public int compareTo(BrokenScore other) {
        // BUG: subtracting ints can overflow and silently break transitivity,
        // which is exactly the kind of bug TimSort's contract check catches.
        return this.value - other.value;
    }

    @Override
    public String toString() { return String.valueOf(value); }
}

public class ComparableContractViolationDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Values chosen so that (min - max) overflows int range and
        // produces an inconsistent sign, violating transitivity.
        BrokenScore[] scores = {
            new BrokenScore(Integer.MAX_VALUE),
            new BrokenScore(0),
            new BrokenScore(Integer.MIN_VALUE),
            new BrokenScore(50), new BrokenScore(-50), new BrokenScore(100),
            new BrokenScore(-100), new BrokenScore(25), new BrokenScore(-25),
            new BrokenScore(75), new BrokenScore(-75), new BrokenScore(10)
        };

        try {
            Arrays.sort(scores);
            System.out.println("Sorted: " + Arrays.toString(scores));
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
// OUTPUT (typical - depends on array size/JVM, but this is the real, common failure):
// Caught: Comparison method violates its general contract!   // NOTE: needs >= 32 elements. TimSort only runs this check at MIN_MERGE (32); a smaller array takes the binarySort path and silently produces a mis-sorted result instead
//
// THE FIX: never subtract to compare - always use Integer.compare(a, b),
// which is exactly what the built-in Integer.compareTo() does internally.`
                ]
              },
              {
                content: `<h3>Memory Diagram: Where compareTo() Actually Lives</h3>
The key insight a diagram makes obvious: with Comparable, the comparison logic is <strong>baked into the object's own class</strong> in the Metaspace - there is no separate "comparator object" anywhere in memory. Sorting just means asking each object to compare itself to another.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">HEAP</td></tr>
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>List&lt;Person&gt; people</strong><br>
<span style="font-size:12px;">ref[0] &rarr; Person@A</span><br>
<span style="font-size:12px;">ref[1] &rarr; Person@B</span>
</td>
<td style="width:30px;">&rarr;</td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>Person@A</strong> {name="Baji", age=28}<br>
<span style="font-size:12px; color:#8a5a00;">class pointer &darr;</span><br><br>
<strong>Person@B</strong> {name="Ann", age=25}<br>
<span style="font-size:12px; color:#8a5a00;">class pointer &darr;</span>
</td>
</tr>
<tr><td colspan="3" style="height:14px;"></td></tr>
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">METASPACE (shared by ALL Person instances)</td></tr>
<tr>
<td colspan="3" style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:6px; padding:10px 14px;">
<strong>Person.class</strong><br>
<span style="font-size:12px;">bytecode for: <code>int compareTo(Person other) { return Integer.compare(this.age, other.age); }</code></span>
</td>
</tr>
</table>
<br>
<strong>What happens when <code>personA.compareTo(personB)</code> runs:</strong> the JVM reads personA's <strong>class pointer</strong> (a hidden field in every object's header) to find <code>Person.class</code> in Metaspace, locates the compareTo() bytecode there (only ONE copy exists, shared by every Person object), and executes it with <code>this = personA</code> and the argument <code>other = personB</code>. No extra object was created just to do the comparison - the logic was already sitting in the class metadata.<br>`
              },
              {
                content: `<h3>Class Diagram: Comparable and Its Ecosystem</h3>
A UML view of the same idea from a different angle - not memory layout this time, but the <strong>type relationships</strong>. Notice every implementing class points UP to the single interface (realization), while every JDK consumer points DOWN to it as a dependency - Comparable sits at the center of a hub, not a chain.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<span style="font-size:11px; color:#3b6e3b;">&laquo;interface&raquo;</span><br>
<strong>Comparable&lt;T&gt;</strong><br>
<span style="font-size:12px; font-family:monospace;">+ compareTo(T o): int</span>
</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#5c9a4a;">&#9651; realizes (implements)</td></tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;">
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">String</td>
<td style="width:8px;"></td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">Integer, Long, Double...</td>
<td style="width:8px;"></td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">Enum&lt;E&gt;</td>
<td style="width:8px;"></td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">Your class (e.g. Person)</td>
</tr>
</table>
</td>
</tr>
</table>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td style="padding:4px 0; font-size:12px; color:#b5651d;">depends on (calls .compareTo() internally) &#8681;</td></tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;">
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">Collections.sort() / Arrays.sort()</td>
<td style="width:8px;"></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">TreeSet / TreeMap</td>
<td style="width:8px;"></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">PriorityQueue</td>
<td style="width:8px;"></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">Collections.max()/min()</td>
</tr>
</table>
</td>
</tr>
</table>
<br>
<strong>Reading this diagram:</strong> any class in the top row can be dropped straight into any consumer in the bottom row with zero extra code - that's the entire value proposition of Comparable. The trade-off the diagram doesn't show: because the interface is realized by the class itself, a class can only ever have <strong>one</strong> compareTo() implementation active at a time - which is exactly the gap Comparator (next topic) exists to fill.<br>`
              }
            ]
          },

          // ----- Comparator -----
          {
            id: 'comparator',
            name: 'Comparator Interface',
            beginner: [
{
                content: `<h3>Comparator Interface</h3>
The <strong>Comparator</strong> interface is found in the <strong>java.util</strong> package. It is used for <strong>customized sorting</strong> - defining sorting logic externally, without modifying the original class.<br>
<br>
<h4>Key Points</h4>
<br>
<ul>
<li><strong>Package:</strong> java.util (must be imported).</li>
<li><strong>Methods:</strong> Contains <strong>compare(Object o1, Object o2)</strong> and <strong>equals(Object obj)</strong> methods.</li>
<li><strong>Return Value of compare():</strong></li>
</ul>
&nbsp;&nbsp;- Returns <strong>negative integer</strong> if o1 is less than o2.<br>
&nbsp;&nbsp;- Returns <strong>zero</strong> if o1 is equal to o2.<br>
&nbsp;&nbsp;- Returns <strong>positive integer</strong> if o1 is greater than o2.<br>
<ul>
<li><strong>Does Not Modify Original Class:</strong> Sorting logic is defined in a separate class or lambda expression.</li>
<li><strong>Multiple Sort Orders:</strong> You can create multiple Comparators for different sorting criteria.</li>
<li><strong>Usage:</strong> Used with Collections.sort(List, Comparator) or as constructor argument for TreeSet/TreeMap.</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

class StudentInfo {
    String name;
    int age;
    double marks;

    StudentInfo(String name, int age, double marks) {
        this.name = name;
        this.age = age;
        this.marks = marks;
    }

    @Override
    public String toString() {
        return name + "(age:" + age + ", marks:" + marks + ")";
    }
}

// Separate Comparator class for sorting by name
class NameComparator implements Comparator<StudentInfo> {
    @Override
    public int compare(StudentInfo s1, StudentInfo s2) {
        return s1.name.compareTo(s2.name);
    }
}

public class ComparatorExample { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<StudentInfo> students = new ArrayList<>();
        students.add(new StudentInfo("Chimnaji", 22, 85.5));
        students.add(new StudentInfo("Anaji", 20, 92.0));
        students.add(new StudentInfo("Baji", 21, 78.3));

        System.out.println("Original: " + students);

        // Sort by name using Comparator
        Collections.sort(students, new NameComparator());
        System.out.println("Sorted by name: " + students);
    }
}`
                ]
              },
{
                content: `<h3>Comparator with Multiple Sorting Criteria</h3>
We can use <strong>Comparator</strong> to define our own sorting (<strong>customized sorting order</strong>). Unlike Comparable, Comparator does not require modifying the original class.<br>
<br>
<h4>Key Points</h4>
<br>
<ul>
<li>Comparator defines <strong>2 methods</strong>: <strong>public int compare(Object obj1, Object obj2)</strong> and <strong>public boolean equals()</strong>.</li>
<li>Implementing equals() is <strong>optional</strong> since it is already available from the Object class.</li>
<li>We can create <strong>multiple Comparator classes</strong> (e.g., NameComparator, SalaryComparator) to sort by different fields.</li>
</ul>
<br>
The example below shows a <strong>Student</strong> class with separate <strong>NameComparator</strong> and <strong>SalaryComparator</strong> classes to sort by name and salary respectively.<br>`,
                codeExamples: [
                  `// Class: 01 - Student
package com.test;

public class Student { // class that holds the main method
    int id;
    String name;
    int salary;

    public Student(int id, String name, int salary) {
        this.id = id;
        this.name = name;
        this.salary = salary;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public int getSalary() { return salary; }

    @Override
    public String toString() {
        return "Employee [id=" + id + ", name=" + name + ", salary=" + salary + "]";
    }
}

// Class: 02 - NameComparator
package com.test;

import java.util.Comparator;

public class NameComparator implements Comparator<Student> {
    @Override
    public int compare(Student student1, Student student2) {
        return student1.name.compareTo(student2.name);
    }
}

// Class: 03 - SalaryComparator
package com.test;

import java.util.Comparator;

public class SalaryComparator implements Comparator<Student> {
    @Override
    public int compare(Student student1, Student student2) {
        if (student1.salary == student2.salary) return 0;
        else if (student1.salary > student2.salary) return 1;
        else return -1;
    }
}

// Class: 04 - Test
package com.test;

import java.util.ArrayList;
import java.util.Collections;

public class StudentComparatorSortDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        ArrayList<Student> al = new ArrayList<Student>(); // creates an empty ArrayList named al
        al.add(new Student(101, "ram", 9000));
        al.add(new Student(102, "ashok", 3000));
        al.add(new Student(103, "ajay", 8000));

        // Sort by name
        Collections.sort(al, new NameComparator());
        for (Student student : al) {
            System.out.println("id>>" + student.getId() + " name>>" + student.getName() + " salary>>" + student.getSalary());
        }
    }
}`
                ]
              },
              {
                content: `<h3>Comparator - Complete Method Reference (~15 Methods)</h3>
Classic code writes a whole separate class (like NameComparator above) just to implement <strong>compare()</strong>. JDK 8 added default/static methods directly on the Comparator interface that make this dramatically shorter - these are the methods senior Java code actually uses today. Grouped by purpose:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Methods</th></tr>
<tr><td><strong>1. Core (abstract)</strong></td><td>compare(T, T)</td></tr>
<tr><td><strong>2. Static Factories</strong></td><td>naturalOrder(), reverseOrder(), comparing(Function), comparing(Function, Comparator), comparingInt/Long/Double(ToXFunction)</td></tr>
<tr><td><strong>3. Chaining (default methods)</strong></td><td>reversed(), thenComparing(Comparator), thenComparing(Function), thenComparing(Function, Comparator), thenComparingInt/Long/Double(ToXFunction)</td></tr>
<tr><td><strong>4. Null Handling</strong></td><td>nullsFirst(Comparator), nullsLast(Comparator)</td></tr>
</table>`
              },
              {
                content: `<h4>Comparator's JDK 8 Methods - Separate Example for Each</h4>`,
                codeExamples: [
                  `// comparing(Function) - build a Comparator from a key extractor, no separate class needed
import java.util.*;
public class ComparatorComparingDemo { // class that holds the main method
    record Person(String name, int age) {}
    public static void main(String[] args) { // program entry point
        List<Person> people = new ArrayList<>(List.of(
            new Person("Chimnaji", 30), new Person("Anaji", 25), new Person("Baji", 28)
        ));
        people.sort(Comparator.comparing(Person::name));
        System.out.println(people);
    }
}
// OUTPUT: [Person[name=Anaji, age=25], Person[name=Baji, age=28], Person[name=Chimnaji, age=30]]`,
                  `// naturalOrder() / reverseOrder() - ready-made Comparators, no lambda needed
import java.util.*;
public class ComparatorNaturalReverseDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<Integer> nums = new ArrayList<>(List.of(3, 1, 4, 1, 5));
        nums.sort(Comparator.naturalOrder());
        System.out.println("Natural: " + nums);
        nums.sort(Comparator.reverseOrder());
        System.out.println("Reverse: " + nums);
    }
}
// OUTPUT:
// Natural: [1, 1, 3, 4, 5]
// Reverse: [5, 4, 3, 1, 1]`,
                  `// reversed() - flips any existing Comparator
import java.util.*;
public class ComparatorReversedDemo { // class that holds the main method
    record Person(String name, int age) {}
    public static void main(String[] args) { // program entry point
        List<Person> people = new ArrayList<>(List.of(
            new Person("Anaji", 25), new Person("Baji", 28)
        ));
        people.sort(Comparator.comparing(Person::age).reversed());
        System.out.println(people);
    }
}
// OUTPUT: [Person[name=Baji, age=28], Person[name=Anaji, age=25]]`,
                  `// thenComparing(Function) - tie-breaker when the primary key is equal
import java.util.*;
public class ComparatorThenComparingDemo { // class that holds the main method
    record Person(String name, int age) {}
    public static void main(String[] args) { // program entry point
        List<Person> people = new ArrayList<>(List.of(
            new Person("Baji", 25), new Person("Anaji", 25), new Person("Chimnaji", 20)
        ));
        // Sort by age first, then by name for people with the same age
        people.sort(Comparator.comparing(Person::age).thenComparing(Person::name));
        System.out.println(people);
    }
}
// OUTPUT: [Person[name=Chimnaji, age=20], Person[name=Anaji, age=25], Person[name=Baji, age=25]]`,
                  `// comparingInt/Long/Double - primitive-specialized key extractors (avoid autoboxing)
import java.util.*;
public class ComparatorComparingIntDemo { // class that holds the main method
    record Product(String name, int price) {}
    public static void main(String[] args) { // program entry point
        List<Product> products = new ArrayList<>(List.of(
            new Product("Pen", 50), new Product("Book", 20), new Product("Bag", 500)
        ));
        products.sort(Comparator.comparingInt(Product::price));
        System.out.println(products);
    }
}
// OUTPUT: [Book(20), Pen(50), Bag(500)]`,
                  `// nullsFirst(Comparator) / nullsLast(Comparator) - handle null elements safely
import java.util.*;
public class ComparatorNullsFirstLastDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        List<String> names = new ArrayList<>(Arrays.asList("Baji", null, "Anaji"));

        names.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
        System.out.println("nullsFirst: " + names);

        names.sort(Comparator.nullsLast(Comparator.naturalOrder()));
        System.out.println("nullsLast: " + names);
    }
}
// OUTPUT:
// nullsFirst: [null, Anaji, Baji]
// nullsLast: [Anaji, Baji, null]`
                ]
              },
              {
                content: `<h4>Comparator's Remaining Overloads - Deep Dive, Separate Example for Each</h4>
The table above lists 15 methods; the earlier examples covered the ones used 90% of the time. These are the remaining overloads - less common, but each solves a specific real problem.<br>`,
                codeExamples: [
                  `// comparing(Function, Comparator) - 2-arg overload: custom ordering for the extracted key itself
import java.util.*;
public class ComparatorComparingWithKeyComparatorDemo { // class that holds the main method
    record Task(String name, String priority) {}    // priority: "LOW", "MEDIUM", "HIGH"
    public static void main(String[] args) { // program entry point
        List<String> priorityOrder = List.of("HIGH", "MEDIUM", "LOW");    // custom rank, not alphabetical
        List<Task> tasks = new ArrayList<>(List.of(
            new Task("Fix bug", "LOW"), new Task("Deploy", "HIGH"), new Task("Review PR", "MEDIUM")
        ));

        // Extract priority (Function), then order those extracted values using priorityOrder (Comparator)
        tasks.sort(Comparator.comparing(Task::priority, Comparator.comparingInt(priorityOrder::indexOf)));
        System.out.println(tasks);
    }
}
// OUTPUT: [Task[name=Deploy, priority=HIGH], Task[name=Review PR, priority=MEDIUM], Task[name=Fix bug, priority=LOW]]`,
                  `// thenComparing(Comparator) - chain with a whole Comparator, not just a key extractor
import java.util.*;
public class ComparatorThenComparingWithComparatorDemo { // class that holds the main method
    record Employee(String dept, String name) {}
    public static void main(String[] args) { // program entry point
        List<Employee> emps = new ArrayList<>(List.of(
            new Employee("IT", "Chimnaji"), new Employee("IT", "Anaji"), new Employee("HR", "Baji")
        ));

        // Primary: compare by dept. Tie-breaker: a FULL Comparator (reverse-alphabetical by name)
        emps.sort(Comparator.comparing(Employee::dept)
                             .thenComparing(Comparator.comparing(Employee::name).reversed()));
        System.out.println(emps);
    }
}
// OUTPUT: [Employee[dept=HR, name=Baji], Employee[dept=IT, name=Chimnaji], Employee[dept=IT, name=Anaji]]`,
                  `// thenComparing(Function, Comparator) - 3-arg overload: tie-break by a key with custom key-ordering
import java.util.*;
public class ComparatorThenComparingWithKeyComparatorDemo { // class that holds the main method
    record Product(String category, String size) {}    // size: "S", "M", "L"
    public static void main(String[] args) { // program entry point
        List<String> sizeOrder = List.of("S", "M", "L");
        List<Product> products = new ArrayList<>(List.of(
            new Product("Shirt", "L"), new Product("Shirt", "S"), new Product("Shirt", "M")
        ));

        products.sort(Comparator.comparing(Product::category)
                                 .thenComparing(Product::size, Comparator.comparingInt(sizeOrder::indexOf)));
        System.out.println(products);
    }
}
// OUTPUT: [Product[category=Shirt, size=S], Product[category=Shirt, size=M], Product[category=Shirt, size=L]]`,
                  `// comparingLong / comparingDouble - primitive-specialized factories for long/double keys
import java.util.*;
public class ComparatorComparingLongDoubleDemo { // class that holds the main method
    record Transaction(String id, long timestampMillis, double amount) {}
    public static void main(String[] args) { // program entry point
        List<Transaction> txns = new ArrayList<>(List.of(
            new Transaction("T3", 3000L, 99.5), new Transaction("T1", 1000L, 20.0), new Transaction("T2", 2000L, 55.25)
        ));

        txns.sort(Comparator.comparingLong(Transaction::timestampMillis));
        System.out.println("By timestamp: " + txns);

        txns.sort(Comparator.comparingDouble(Transaction::amount));
        System.out.println("By amount: " + txns);
    }
}
// OUTPUT:
// By timestamp: [Transaction[id=T1, ...], Transaction[id=T2, ...], Transaction[id=T3, ...]]
// By amount: [Transaction[id=T1, ...], Transaction[id=T2, ...], Transaction[id=T3, ...]]`,
                  `// thenComparingLong / thenComparingDouble - primitive-specialized tie-breakers
import java.util.*;
public class ComparatorThenComparingLongDoubleDemo { // class that holds the main method
    record Order(String customer, long orderTime, double total) {}
    public static void main(String[] args) { // program entry point
        List<Order> orders = new ArrayList<>(List.of(
            new Order("Anaji", 500L, 30.0), new Order("Anaji", 100L, 10.0), new Order("Baji", 200L, 15.0)
        ));

        // Group by customer first, then break ties by earliest orderTime
        orders.sort(Comparator.comparing(Order::customer).thenComparingLong(Order::orderTime));
        System.out.println(orders);
    }
}
// OUTPUT: [Order[customer=Anaji, orderTime=100, total=10.0], Order[customer=Anaji, orderTime=500, total=30.0], Order[customer=Baji, orderTime=200, total=15.0]]`
                ]
              },
              {
                content: `<h4>Deep Dive Part 2: The Last Overload, and the 4 Ways to Write a Comparator</h4>
Closing out the method reference with <code>thenComparingInt()</code> (the one overload not yet shown), then a side-by-side of every syntax Java offers for implementing the exact same Comparator - useful to recognize all four in the wild, even if you'd only ever write the last one today.<br>`,
                codeExamples: [
                  `// thenComparingInt(ToIntFunction) - the last un-demoed overload
import java.util.*;
public class ComparatorThenComparingIntDemo { // class that holds the main method
    record Player(String team, int score) {}
    public static void main(String[] args) { // program entry point
        List<Player> players = new ArrayList<>(List.of(
            new Player("Red", 10), new Player("Blue", 10), new Player("Red", 5)
        ));

        // Group by team, tie-break by score (int, no boxing needed)
        players.sort(Comparator.comparing(Player::team).thenComparingInt(Player::score));
        System.out.println(players);
    }
}
// OUTPUT: [Player[team=Blue, score=10], Player[team=Red, score=5], Player[team=Red, score=10]]`,
                  `// The SAME "sort Employees by salary" Comparator, written 4 different ways
import java.util.*;

public class ComparatorFourWaysDemo { // class that holds the main method
    record Employee(String name, int salary) {}

    // Way 1: A separate named class (the classic pre-Java-8 style)
    static class SalaryComparator implements Comparator<Employee> {
        @Override
        public int compare(Employee a, Employee b) {
            return Integer.compare(a.salary(), b.salary());
        }
    }

    public static void main(String[] args) { // program entry point
        List<Employee> base = List.of(new Employee("C", 30000), new Employee("A", 50000), new Employee("B", 10000));

        // Way 1: named class instance
        List<Employee> sorted1 = new ArrayList<>(base);
        sorted1.sort(new SalaryComparator());

        // Way 2: anonymous inner class
        List<Employee> sorted2 = new ArrayList<>(base);
        sorted2.sort(new Comparator<Employee>() {
            @Override
            public int compare(Employee a, Employee b) {
                return Integer.compare(a.salary(), b.salary());
            }
        });

        // Way 3: lambda expression
        List<Employee> sorted3 = new ArrayList<>(base);
        sorted3.sort((a, b) -> Integer.compare(a.salary(), b.salary()));

        // Way 4: method reference via Comparator.comparing (the modern idiom)
        List<Employee> sorted4 = new ArrayList<>(base);
        sorted4.sort(Comparator.comparing(Employee::salary));

        System.out.println("All 4 produce the same order: " + sorted4);
        System.out.println("Way1==Way4 order? " + sorted1.equals(sorted4));
    }
}
// OUTPUT:
// All 4 produce the same order: [Employee[name=B, salary=10000], Employee[name=C, salary=30000], Employee[name=A, salary=50000]]
// Way1==Way4 order? true`
                ]
              },
{
                content: `<h3>Comparable vs Comparator - Comparison Table</h3>
<br>
<h4>Key Differences</h4>
<br>
<ul>
<li><strong>1.</strong> Comparable provides <strong>single sorting sequence</strong>; Comparator provides <strong>multiple sorting sequences</strong>.</li>
</ul>
<br>
<ul>
<li><strong>2.</strong> Comparable <strong>affects the original class</strong> (actual class is modified); Comparator <strong>does not affect the original class</strong>.</li>
</ul>
<br>
<ul>
<li><strong>3.</strong> Comparable provides <strong>compareTo()</strong> method; Comparator provides <strong>compare()</strong> method.</li>
</ul>
<br>
<ul>
<li><strong>4.</strong> Comparable is in <strong>java.lang</strong> package; Comparator is in <strong>java.util</strong> package.</li>
</ul>
<br>
<ul>
<li><strong>5.</strong> For Comparable: <strong>Collections.sort(List)</strong>; For Comparator: <strong>Collections.sort(List, Comparator)</strong>.</li>
</ul>
<br>
<ul>
<li><strong>6.</strong> Comparable is for <strong>default natural sorting order</strong>; Comparator is for <strong>customized sorting order</strong>.</li>
</ul>
<br>
<ul>
<li><strong>7.</strong> Comparable defines only <strong>1 method</strong> (compareTo); Comparator defines <strong>2 methods</strong> (compare and equals).</li>
</ul>`
              },
              {
                content: `<h3>Internal Working of Comparator</h3>
Like Comparable, a plain <code>compare()</code> call is only half the story - the interesting internals are in <strong>how JDK collections invoke it</strong> and <strong>how the JDK 8 chaining methods are actually implemented</strong>.<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Caller</th><th style="text-align:left;">How It Uses compare() Internally</th></tr>
<tr><td><strong>Collections.sort(list, cmp) / list.sort(cmp)</strong></td><td>Same <strong>TimSort</strong> algorithm as Comparable-based sorting, except every comparison calls <code>cmp.compare(a, b)</code> instead of <code>a.compareTo(b)</code> - the algorithm itself doesn't change, only where the comparison decision comes from.</td></tr>
<tr><td><strong>new TreeSet&lt;&gt;(comparator) / new TreeMap&lt;&gt;(comparator)</strong></td><td>When a Comparator is supplied to the constructor, the tree stores it internally and uses <code>comparator.compare(a, b)</code> for every Red-Black tree traversal - it <strong>completely ignores</strong> the elements' own compareTo(), even if they implement Comparable.</td></tr>
<tr><td><strong>PriorityQueue(comparator)</strong></td><td>Same idea - the supplied Comparator drives every sift-up/sift-down comparison in the binary heap instead of natural ordering.</td></tr>
</table>
<br>
<h4>How thenComparing() and reversed() Are Actually Implemented</h4>
These aren't magic - they're just <strong>lambdas that wrap the original compare() call</strong>. Conceptually (simplified from the real JDK source):<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Method</th><th style="text-align:left;">Conceptual Implementation</th></tr>
<tr><td><strong>reversed()</strong></td><td><code>return (a, b) -> this.compare(b, a);</code> - simply swaps the argument order</td></tr>
<tr><td><strong>thenComparing(other)</strong></td><td><code>return (a, b) -> { int r = this.compare(a, b); return r != 0 ? r : other.compare(a, b); };</code> - only consults the next comparator if the first result was a tie (0)</td></tr>
<tr><td><strong>naturalOrder()</strong></td><td><code>return (a, b) -> a.compareTo(b);</code> - a static Comparator that just delegates back to Comparable</td></tr>
</table>
<br>
This is why chaining <code>comparing(A).thenComparing(B).thenComparing(C)</code> costs almost nothing extra at runtime for already-decided comparisons - each link in the chain is skipped entirely unless every earlier one returned exactly 0.<br>`,
                codeExamples: [
                  `import java.util.*;

public class ComparatorInternalsDemo { // class that holds the main method
    record Employee(String dept, int salary) {}

    public static void main(String[] args) { // program entry point
        List<Employee> emps = new ArrayList<>(List.of(
            new Employee("IT", 50000),
            new Employee("HR", 50000),
            new Employee("IT", 40000)
        ));

        // Build a chain: compare by dept first, then by salary if dept ties.
        Comparator<Employee> byDeptThenSalary =
            Comparator.comparing(Employee::dept).thenComparing(Employee::salary);

        // Trace exactly how many times the underlying compare() calls happen
        Comparator<Employee> traced = (a, b) -> {
            int result = byDeptThenSalary.compare(a, b);
            System.out.println("Comparing " + a + " vs " + b + " -> " + result);
            return result;
        };

        emps.sort(traced);
        System.out.println("Sorted: " + emps);
    }
}
// OUTPUT (exact comparison count/order depends on TimSort's internal merge steps,
// but demonstrates that each compare() call resolves dept first, salary only on a tie):
// Comparing Employee[dept=HR, salary=50000] vs Employee[dept=IT, salary=50000] -> -1   ("HR".compareTo("IT") is H-I = -1)
// Comparing Employee[dept=IT, salary=50000] vs Employee[dept=IT, salary=40000] -> 1     (thenComparing delegates to Integer.compareTo, which normalises to 1 - NOT the raw 10000 difference)
// Sorted: [Employee[dept=HR, salary=50000], Employee[dept=IT, salary=40000], Employee[dept=IT, salary=50000]]`
                ]
              },
              {
                content: `<h3>Memory Diagram: Where compare() Actually Lives</h3>
The contrast with Comparable's diagram is the whole point: with Comparator, the comparison logic lives in a <strong>completely separate object</strong> that has no relationship to the elements being compared. The elements stay "dumb" - all the intelligence sits in one independent Comparator instance.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">HEAP</td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>Person@A</strong> {name="Baji", age=28}<br><br>
<strong>Person@B</strong> {name="Ann", age=25}<br>
<span style="font-size:11px; color:#8a5a00;">(no comparison logic here at all)</span>
</td>
<td style="width:110px; font-size:12px; color:#555;">compare(A, B) called with BOTH as arguments &rarr;</td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>Comparator@X</strong><br>
<span style="font-size:12px;">(e.g. a lambda / Comparator.comparing(...) result)</span><br>
<span style="font-size:12px;">holds: captured method reference to <code>Person::getAge</code></span>
</td>
</tr>
<tr><td colspan="3" style="height:10px;"></td></tr>
<tr>
<td></td>
<td></td>
<td style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:6px; padding:8px 14px; font-size:12px;">
<strong>thenComparing() chain example:</strong><br>
Comparator@X { delegate = Comparator@Y }<br>
Comparator@Y { delegate = Comparator@Z }
</td>
</tr>
</table>
<br>
<strong>What happens when <code>list.sort(comparatorX)</code> runs:</strong> TimSort calls <code>comparatorX.compare(personA, personB)</code>, passing <strong>both</strong> Person references in as plain arguments - comparatorX doesn't "belong" to either of them, and the same comparatorX instance gets reused for every single pair compared during the sort.<br>
<br>
<strong>Why chaining is cheap:</strong> <code>comparing(A).thenComparing(B)</code> doesn't merge any logic together - it creates a <strong>new wrapper Comparator object</strong> that holds a reference to the first one and calls it first, only reaching into the second (delegate) object if the first returned 0. This is why the diagram shows a chain of small objects, each just forwarding to the next - identical in spirit to a linked list, not a single fused method.<br>`
              },
              {
                content: `<h3>Class Diagram: Comparator and Its Ecosystem</h3>
The mirror image of Comparable's diagram - and the difference is the entire point of the interface's existence. Where Comparable had classes realizing the interface directly, here <strong>your domain class doesn't touch Comparator at all</strong>. Instead, any number of independent Comparator implementations can exist for the exact same class.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<span style="font-size:11px; color:#3b6e3b;">&laquo;interface&raquo;</span><br>
<strong>Comparator&lt;T&gt;</strong><br>
<span style="font-size:12px; font-family:monospace;">+ compare(T o1, T o2): int</span><br>
<span style="font-size:11px; color:#777;">+ reversed(), thenComparing()...</span>
</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#5c9a4a;">&#9651; realizes (implements) - MANY independent implementations allowed</td></tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;">
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">NameComparator</td>
<td style="width:8px;"></td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">SalaryComparator</td>
<td style="width:8px;"></td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">Lambda / method ref</td>
<td style="width:8px;"></td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 10px; font-size:12px;">Comparator.comparing(...) result</td>
</tr>
<tr><td colspan="7" style="font-size:11px; color:#777; padding-top:4px;">&#8593; ALL of these can target the SAME Employee class at once - impossible with Comparable</td></tr>
</table>
</td>
</tr>
</table>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td style="padding:4px 0; font-size:12px; color:#b5651d;">depends on (calls .compare() internally, elements are just PASSED IN) &#8681;</td></tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%;">
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">Collections.sort(list, cmp)</td>
<td style="width:8px;"></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">new TreeSet&lt;&gt;(cmp)</td>
<td style="width:8px;"></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">new TreeMap&lt;&gt;(cmp)</td>
<td style="width:8px;"></td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 10px; font-size:12px;">new PriorityQueue&lt;&gt;(cmp)</td>
</tr>
</table>
</td>
</tr>
</table>
<br>
<strong>Side-by-side with Comparable's diagram, the structural difference is exactly one arrow:</strong> Comparable's implementing classes ARE the domain objects (Person implements Comparable&lt;Person&gt;), while Comparator's implementing classes are separate, disposable helper objects that merely <strong>reference</strong> the domain type as a generic parameter (NameComparator implements Comparator&lt;Employee&gt; without being an Employee at all). That one distinction is why you can have unlimited Comparators per class, but only one Comparable.<br>`
              }
            ]
          }
        ]
      },

      // ===== SubTopic 6: Internal Working =====
      {
        id: 'internal-working',
        name: 'Internal Working',
        topics: [

          // ----- Internal Working of HashSet -----
          {
            id: 'internal-hashset',
            name: 'Internal Working of HashSet',
            beginner: [
{
                content: `<h3>Internal Working of HashSet</h3>
<strong>HashSet</strong> is internally backed by a <strong>HashMap</strong>. When you create a HashSet, it creates a HashMap object behind the scenes. The elements you add to the HashSet are stored as <strong>keys</strong> in the underlying HashMap, and a constant dummy object called <strong>PRESENT</strong> is used as the value for every key.<br>
<br>
<h4>Why No Duplicates?</h4>
Since HashMap does not allow duplicate keys, HashSet automatically prevents duplicate elements. When you try to add a duplicate element, the underlying HashMap's put() method detects that the key already exists and simply replaces the value (which is always PRESENT anyway), effectively doing nothing meaningful.<br>
<br>
<h4>Key Points</h4>
<br>
<ul>
<li>HashSet internally creates: <strong>private transient HashMap&lt;E, Object&gt; map;</strong></li>
<li>The dummy value: <strong>private static final Object PRESENT = new Object();</strong></li>
<li>add(e) internally calls: <strong>map.put(e, PRESENT)</strong></li>
<li>remove(e) internally calls: <strong>map.remove(e)</strong></li>
<li>contains(e) internally calls: <strong>map.containsKey(e)</strong></li>
</ul>`,
                codeExamples: [
                  `import java.util.HashSet;

public class HashSetDuplicateDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(); // creates an empty HashSet named set

        // Adding elements
        System.out.println("Add Java: " + set.add("Java"));       // true
        System.out.println("Add Python: " + set.add("Python"));   // true
        System.out.println("Add Java (dup): " + set.add("Java")); // false!

        System.out.println("Set: " + set);
        System.out.println("Size: " + set.size());  // 2

        // Adding integers
        HashSet<Integer> nums = new HashSet<>(); // creates an empty HashSet named nums
        nums.add(10);
        nums.add(20);
        nums.add(10);  // duplicate rejected
        nums.add(30);
        nums.add(20);  // duplicate rejected

        System.out.println("Numbers: " + nums);
        System.out.println("Size: " + nums.size());  // 3
    }
}`
                ]
              },
              {
                content: `<h4>How Hashing Decides Where an Element Is Stored</h4>
Since HashSet is backed by a HashMap, adding an element isn't just "append it somewhere" - Java uses <strong>hashing</strong> to decide exactly where:<br>
<br>
<ul>
<li><strong>Hash Code</strong> - When an element is added, its <strong>hashCode()</strong> method is called to compute a hash code.</li>
<li><strong>Bucket</strong> - That hash code is used to determine which <strong>bucket</strong> (a slot in the underlying HashMap's internal array) the element belongs to.</li>
<li><strong>Collisions</strong> - Multiple elements can land in the same bucket if their hash codes collide; the bucket then holds multiple entries as a small linked list (or, for a heavily-loaded bucket, a balanced tree since Java 8).</li>
<li><strong>Checking / Removing</strong> - contains() and remove() also compute the element's hash code first, jump straight to that bucket, and only then compare within that small bucket - this is why these operations are close to O(1) instead of scanning every element.</li>
</ul>`
              },
              {
                content: `<h4>Every HashSet Method Is a Thin Wrapper Around a HashMap Method</h4>
Because HashSet has no logic of its own beyond delegation, you can read its entire public API as a one-to-one mapping onto HashMap:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">HashSet Method</th><th style="text-align:left;">What It Actually Calls Internally</th></tr>
<tr><td><strong>add(e)</strong></td><td>map.put(e, PRESENT) == null</td></tr>
<tr><td><strong>remove(e)</strong></td><td>map.remove(e) == PRESENT</td></tr>
<tr><td><strong>contains(e)</strong></td><td>map.containsKey(e)</td></tr>
<tr><td><strong>size()</strong></td><td>map.size()</td></tr>
<tr><td><strong>isEmpty()</strong></td><td>map.isEmpty()</td></tr>
<tr><td><strong>clear()</strong></td><td>map.clear()</td></tr>
<tr><td><strong>iterator()</strong></td><td>map.keySet().iterator()</td></tr>
</table>
<br>
<strong>Memory cost this implies:</strong> every element you add to a HashSet doesn't just cost the element itself - it costs a full HashMap <strong>Node</strong> (key reference + the shared PRESENT value reference + hash int + next pointer). This is why a HashSet always uses noticeably more memory per element than a plain array or ArrayList would.<br>
<br>
<strong>LinkedHashSet variant:</strong> LinkedHashSet follows the exact same delegation pattern, except its internal field is a <strong>LinkedHashMap</strong> instead of a plain HashMap - that's the only difference, and it's why LinkedHashSet preserves insertion order.<br>`
              },
{
                content: `<h3>Internal Working of HashSet - How add() Returns false for Duplicates</h3>
When you pass a duplicate element in Set, the <strong>add()</strong> method returns false. The main question is HOW it returns false.<br>
<br>
When you open the HashSet implementation of the add() method in Java API, you find:<br>
<br>
<pre>
public class HashSet&lt;E&gt; extends AbstractSet&lt;E&gt; implements Set&lt;E&gt;, Cloneable, java.io.Serializable {
    private transient HashMap&lt;E, Object&gt; map;
    /* dummy value associated with object in map */
    private static final Object PRESENT = new Object();

    public HashSet() {
        map = new HashMap&lt;&gt;();
    }

    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
}
</pre>
<br>
<h4>Key Observations:</h4>
<br>
<ul>
<li>We achieve <strong>uniqueness in Set internally through HashMap</strong>.</li>
<li>When you create an object of HashSet, it creates an object of <strong>HashMap internally</strong>.</li>
<li>What we do in Set is pass an argument in <strong>add(Element E)</strong> - that E becomes the <strong>key</strong> in HashMap, and some dummy value (<strong>new Object()</strong>) referred by PRESENT is passed as the value.</li>
<li>When you do <strong>hashset.add(3)</strong>, Java internally does <strong>map.put(3, PRESENT)</strong>.</li>
</ul>
<br>
<h4>The Main Point - map.put(key, value) returns:</h4>
<br>
1. <strong>null</strong> - if the key is unique and added to the map.<br>
2. <strong>Old value of key</strong> - if the key is a duplicate.<br>
<br>
So in HashSet add() method:<br>
<br>
<ul>
<li>If <strong>map.put(e, PRESENT)</strong> returns <strong>null</strong> then <strong>map.put(e, PRESENT) == null</strong> returns <strong>TRUE</strong> - element added.</li>
<li>If <strong>map.put(e, PRESENT)</strong> returns <strong>old value</strong> then <strong>map.put(e, PRESENT) == null</strong> returns <strong>FALSE</strong> - element NOT added (duplicate).</li>
</ul>`,
                codeExamples: [
                  `import java.util.HashSet;

public class HashSetInternalWorkingDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<String> set = new HashSet<>(); // creates an empty HashSet named set

        // Internally: map.put("Java", PRESENT) returns null -> true
        System.out.println("Add Java: " + set.add("Java"));        // true

        // Internally: map.put("Python", PRESENT) returns null -> true
        System.out.println("Add Python: " + set.add("Python"));    // true

        // Internally: map.put("Java", PRESENT) returns PRESENT (old value) -> false
        System.out.println("Add Java again: " + set.add("Java"));  // false - duplicate!

        System.out.println("Final Set: " + set);    // [Java, Python]
    }
}`
                ]
              },
{
                content: `<h3>Hashing Mechanism in HashSet</h3>
Since HashSet is backed by HashMap, the hashing mechanism determines how elements are stored and retrieved.<br>
<br>
<h4>How Elements Are Stored and Retrieved:</h4>
<br>
<ul>
<li>Each element's <strong>hashCode()</strong> is computed.</li>
<li>The hash code determines the <strong>bucket location</strong> in HashMap.</li>
<li>HashMap consists of an <strong>array of buckets</strong>.</li>
<li>Each bucket holds multiple entries with the same hash code (collisions handled using <strong>linked list or balanced tree</strong>).</li>
</ul>
<br>
<h4>Operations:</h4>
<br>
<ul>
<li><strong>Adding:</strong> Compute hash -> check bucket -> if not present, add as key with PRESENT value.</li>
<li><strong>Removing:</strong> Compute hash -> remove corresponding key from HashMap.</li>
<li><strong>Checking containment:</strong> Compute hash -> check bucket for key.</li>
</ul>`
              },
              {
                content: `<h4>Seeing a Real Collision Happen</h4>
To actually witness bucket collisions rather than just read about them, force two different objects to share the same <strong>hashCode()</strong> - HashSet still keeps both, because <strong>equals()</strong> (not hashCode()) is what decides if two elements are "the same."<br>`,
                codeExamples: [
                  `import java.util.HashSet;

class Key {
    final String label;
    Key(String label) { this.label = label; }

    @Override
    public int hashCode() {
        return 1;    // FORCE every Key into the same bucket - hashCode is deliberately bad
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Key)) return false;
        return label.equals(((Key) o).label);    // equality is based on label, not hashCode
    }

    @Override
    public String toString() { return label; }
}

public class HashSetCollisionDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashSet<Key> set = new HashSet<>(); // creates an empty HashSet named set
        set.add(new Key("A"));
        set.add(new Key("B"));
        set.add(new Key("C"));
        set.add(new Key("A"));    // equals("A") is true -> rejected as duplicate

        System.out.println("Set: " + set);
        System.out.println("Size: " + set.size());
        // All 3 unique keys land in the SAME bucket (hashCode always 1),
        // so HashSet falls back to equals() to tell them apart within that bucket -
        // this is exactly what happens internally on every hashCode collision.
    }
}
// OUTPUT:
// Set: [A, B, C]
// Size: 3`
                ]
              },
              {
                content: `<h3>Class Diagram: HashSet's Inheritance vs Composition</h3>
Two different UML relationships are at play here, and mixing them up is a common misconception. HashSet <strong>extends</strong> AbstractSet (inheritance, an "is-a" relationship) but <strong>contains</strong> a HashMap (composition, a "has-a" relationship) - it does NOT extend HashMap.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">AbstractCollection&lt;E&gt;</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">AbstractSet&lt;E&gt; &nbsp; <span style="color:#777;">implements Set&lt;E&gt;</span></td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<strong>HashSet&lt;E&gt;</strong> &nbsp;<span style="font-size:11px; color:#777;">implements Set&lt;E&gt;, Cloneable, Serializable</span><br>
<span style="font-size:12px; font-family:monospace;">- map: HashMap&lt;E, Object&gt;</span>
</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#b5651d;">&#9670; composes (has-a, NOT extends)</td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px;">HashMap&lt;E, Object&gt;</td>
</tr>
</table>
<br>
<strong>LinkedHashSet</strong> slots in as a subclass of HashSet (extends HashSet&lt;E&gt;) that swaps the private <code>map</code> field's runtime type to a <strong>LinkedHashMap</strong> instead of a plain HashMap - same composition pattern, one field-type change, and insertion order comes along for free.<br>
<br>
<strong>Why this distinction matters:</strong> because it's composition, HashSet's own methods are hand-written one-line delegations (<code>add(e) { return map.put(e, PRESENT) == null; }</code>) rather than inherited HashMap behavior - if HashSet extended HashMap directly, it would inherit HashMap's <code>put(K,V)</code>/<code>get(K)</code> two-argument key-value methods too, which makes no sense for a single-element Set API.<br>`
              },
              {
                content: `<h3>Memory Diagram: What add() Actually Builds on the Heap</h3>
The class diagram showed the type relationships; this shows what physically gets allocated when you call <code>set.add("Java")</code> on an empty HashSet.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">HEAP</td></tr>
<tr>
<td style="background:#eef7e9; border:1px solid #8fbf7f; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>HashSet@S</strong><br>
<span style="font-size:12px;">map &rarr; HashMap@M</span>
</td>
<td style="width:30px;">&rarr;</td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>HashMap@M</strong><br>
<span style="font-size:12px;">table[16] &rarr; bucket array</span>
</td>
</tr>
<tr><td colspan="3" style="height:14px;"></td></tr>
<tr>
<td colspan="3" style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:10px 14px;">
<strong>table[index] &rarr; Node@N1</strong><br>
<span style="font-size:12px;">hash = 2314539 (from "Java".hashCode(), bit-spread)<br>key &rarr; String@"Java"<br>value &rarr; <strong>PRESENT@shared</strong><br>next &rarr; null</span>
</td>
</tr>
<tr><td colspan="3" style="height:10px;"></td></tr>
<tr>
<td colspan="3" style="background:#fbeae5; border:1px solid #e0a898; border-radius:6px; padding:8px 14px; font-size:12px;">
Add a second element <code>set.add("Python")</code> that happens to land in the SAME bucket:<br>
<strong>table[index] &rarr; Node@N2</strong> {key&rarr;"Python", value&rarr;<strong>PRESENT@shared</strong>, next &rarr; Node@N1}
</td>
</tr>
</table>
<br>
<strong>Two details this diagram makes concrete:</strong><br>
1. <strong>Only ONE PRESENT object ever exists</strong> for the entire HashSet's lifetime - every single Node's <code>value</code> field points to that same shared instance. Adding a millionth element doesn't allocate a millionth dummy value; it reuses the one from HashSet's construction.<br>
2. When a second element collides into the same bucket, the new Node doesn't replace the old one - since Java 8 it is APPENDED AT THE TAIL of that bucket's list (head insertion was the Java 7 behaviour, changed to avoid the resize infinite-loop bug), with <strong>next</strong> pointing back to the previous occupant, forming the linked list one node at a time as elements arrive.<br>`
              }
            ]
          },

          // ----- Internal Working of HashMap -----
          {
            id: 'internal-hashmap',
            name: 'Internal Working of HashMap',
            beginner: [
{
                content: `<h3>Internal Working of HashMap</h3>
<strong>HashMap</strong> stores key-value pairs and uses <strong>hashing</strong> for efficient retrieval, insertion, and deletion operations.<br>
<br>
<h4>Key Concepts</h4>
<br>
<ul>
<li><strong>Hashing:</strong> The process of converting a key into an integer (hash code) using the key's hashCode() method. This hash code is used to determine where the entry is stored.</li>
</ul>
<br>
<ul>
<li><strong>Buckets:</strong> HashMap internally uses an array called the <strong>bucket array</strong> (or table). Each index in this array is a "bucket" that can hold one or more entries. The default array size is <strong>16</strong>.</li>
</ul>
<br>
<ul>
<li><strong>Node Structure:</strong> Each entry in HashMap is stored as a <strong>Node</strong> (inner class) containing:</li>
</ul>
&nbsp;&nbsp;- <strong>key</strong> - The key of the entry.<br>
&nbsp;&nbsp;- <strong>value</strong> - The value associated with the key.<br>
&nbsp;&nbsp;- <strong>hash</strong> - The computed hash code of the key.<br>
&nbsp;&nbsp;- <strong>next</strong> - A reference (pointer) to the next Node in the same bucket (for handling collisions via linked list).<br>
<br>
<h4>The Node Class (Simplified)</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Field</th><th style="text-align:left;">Type</th><th style="text-align:left;">Purpose</th></tr>
<tr><td>hash</td><td>int</td><td>Pre-computed, bit-spread hash code of the key</td></tr>
<tr><td>key</td><td>K</td><td>The actual key object</td></tr>
<tr><td>value</td><td>V</td><td>The actual value object</td></tr>
<tr><td>next</td><td>Node&lt;K,V&gt;</td><td>Link to the next Node in the same bucket (null if last)</td></tr>
</table>`,
                codeExamples: [
                  `import java.util.HashMap;

public class HashMapBasicOps { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map

        // Put operation:
        // 1. hashCode("Apple") is computed
        // 2. Bucket index is calculated
        // 3. Node(key="Apple", value=1, hash, next=null) is created
        map.put("Apple", 1);
        map.put("Banana", 2);
        map.put("Cherry", 3);

        System.out.println("Map: " + map);

        // Get operation:
        // 1. hashCode("Banana") is computed
        // 2. Bucket index is calculated
        // 3. Traverse bucket to find key "Banana"
        // 4. Return associated value
        int value = map.get("Banana");
        System.out.println("Banana: " + value);

        // Replace operation:
        // Same bucket, same key found -> value updated
        map.put("Apple", 10);
        System.out.println("Apple updated: " + map.get("Apple"));

        System.out.println("Size: " + map.size());
    }
}`
                ]
              },
{
                content: `<h3>HashMap Put, Get, and Remove Operations</h3>
<br>
<h4>1. Put Operation (Insertion):</h4>
<br>
<ul>
<li>The <strong>put</strong> method calculates the hash code of the key and determines the bucket index.</li>
<li>If the bucket is <strong>empty</strong>, the new key-value pair is placed in that bucket.</li>
<li>If the bucket already has nodes, the key is compared with existing keys using the <strong>equals</strong> method.</li>
<li>If a <strong>match is found</strong>, the value is updated.</li>
<li>If <strong>no match is found</strong>, a new node is added (linked list or tree node).</li>
</ul>
<br>
<h4>2. Get Operation (Retrieval):</h4>
<br>
<ul>
<li>The <strong>get</strong> method calculates the hash code of the key to determine the bucket.</li>
<li>Searches the bucket for a matching key using the <strong>equals</strong> method.</li>
<li>If found, returns the associated value.</li>
<li>If not found, returns <strong>null</strong>.</li>
</ul>
<br>
<h4>3. Remove Operation:</h4>
<br>
<ul>
<li>Calculates the hash code to find the bucket.</li>
<li>Searches for the key in the bucket.</li>
<li>If found, removes the node and returns the value.</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class HashMapOperationsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<String, Integer> map = new HashMap<>(); // creates an empty HashMap named map

        // PUT operation - hash("Pankaj") -> bucket index -> store
        map.put("Pankaj", 90000);
        map.put("Dheeraj", 95000);
        map.put("Sheru", 85000);

        // PUT with duplicate key - updates value
        map.put("Pankaj", 92000);    // Value updated from 90000 to 92000

        System.out.println("Map: " + map);

        // GET operation - hash("Pankaj") -> bucket -> find key -> return value
        System.out.println("Pankaj salary: " + map.get("Pankaj"));    // 92000

        // GET with non-existent key
        System.out.println("Unknown: " + map.get("Unknown"));    // null

        // REMOVE operation
        map.remove("Sheru");
        System.out.println("After remove: " + map);

        // Null key
        map.put(null, 0);
        System.out.println("Null key value: " + map.get(null));    // 0
    }
}`
                ]
              },
{
                content: `<h3>Treeification, Resize, and Performance</h3>
<br>
<h4>1. Treeification - the Full Rule (Not Just "8 Nodes"):</h4>
<br>
Most explanations stop at "8 nodes triggers a tree," which is actually incomplete and misleading. The real rule has a second condition:<br>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Constant</th><th style="text-align:left;">Value</th><th style="text-align:left;">Meaning</th></tr>
<tr><td>TREEIFY_THRESHOLD</td><td>8</td><td>A bucket with 8+ nodes is a <em>candidate</em> for treeification</td></tr>
<tr><td>MIN_TREEIFY_CAPACITY</td><td>64</td><td>The tree conversion only actually happens if the WHOLE table has &ge; 64 buckets</td></tr>
<tr><td>UNTREEIFY_THRESHOLD</td><td>6</td><td>A tree shrinks back to a linked list once it drops to 6 or fewer nodes</td></tr>
</table>
<br>
<strong>Why this matters:</strong> if a bucket hits 8 nodes while the table is still small (say, capacity 16), HashMap does NOT build a tree yet - it just <strong>resizes the table</strong> instead (more buckets means the 8 colliding keys likely spread out across different buckets on rehash). Only once the table has grown to at least 64 buckets AND a bucket still has 8+ nodes does the actual Red-Black tree conversion happen. This two-step guard avoids the overhead of building tiny trees on a small, still-growing table.<br>
<br>
<h4>2. Resize/Rehashing:</h4>
<br>
<ul>
<li>When total entries exceed <strong>capacity * loadFactor</strong>, HashMap doubles its capacity.</li>
<li>Default: capacity <strong>16</strong>, loadFactor <strong>0.75</strong>, so resize at <strong>12</strong> entries.</li>
<li>All existing entries are rehashed and redistributed to new buckets.</li>
<li>This is an expensive operation but necessary to maintain <strong>O(1)</strong> average performance.</li>
</ul>
<br>
<h4>Capacity Growth Table (Default Load Factor 0.75)</h4>
<br>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
<tr><th style="text-align:left;">Capacity</th><th style="text-align:left;">Resize Threshold (capacity &times; 0.75)</th></tr>
<tr><td>16 (default)</td><td>12</td></tr>
<tr><td>32</td><td>24</td></tr>
<tr><td>64</td><td>48</td></tr>
<tr><td>128</td><td>96</td></tr>
<tr><td>256</td><td>192</td></tr>
</table>
<br>
<h4>3. Node Structure:</h4>
<br>
<ul>
<li>Each entry is a Node containing: <strong>key</strong>, <strong>value</strong>, <strong>hash code</strong>, <strong>reference to next node</strong>.</li>
</ul>
<br>
<h4>4. Performance:</h4>
<br>
<ul>
<li>Average case: <strong>O(1)</strong> for get, put, remove.</li>
<li>Worst case: <strong>O(log n)</strong> with tree (Java 8+), <strong>O(n)</strong> before Java 8.</li>
<li>Space complexity: <strong>O(n)</strong>.</li>
</ul>`,
                codeExamples: [
                  `import java.util.*;

public class HashMapCapacityDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        // Default capacity = 16, load factor = 0.75
        // Resize triggered when entries > 16 * 0.75 = 12
        HashMap<Integer, String> map = new HashMap<>(); // creates an empty HashMap named map

        for (int i = 1; i <= 15; i++) {
            map.put(i, "Value-" + i);
        }

        System.out.println("Map size: " + map.size());
        System.out.println("Map: " + map);

        // Custom initial capacity and load factor
        HashMap<String, Integer> customMap = new HashMap<>(32, 0.5f);
        // capacity = 32, resize at 32 * 0.5 = 16 entries

        customMap.put("Pankaj", 1);
        customMap.put("Dheeraj", 2);
        customMap.put("Sheru", 3);

        System.out.println("Custom map: " + customMap);
    }
}`
                ]
              },
              {
                content: `<h3>How hashCode() and equals() Actually Compute the Bucket Index</h3>
<br>
HashMap does not use the raw hash code as-is. Internally, it takes 3 steps:<br>
<br>
1. <strong>Compute hash code:</strong> <code>int hashCode = key.hashCode();</code><br>
2. <strong>Spread the bits (Java 8+):</strong> <code>int hash = hashCode ^ (hashCode &gt;&gt;&gt; 16);</code> - XORs the high 16 bits into the low 16 bits, so keys don't collide just because their low bits happen to match. This step alone is why Java 8's HashMap has far fewer collisions than pre-8 versions.<br>
3. <strong>Calculate the bucket index:</strong> <code>int index = (n - 1) &amp; hash;</code> - a fast bitwise AND instead of the slower <code>%</code> modulo, which only works correctly because the bucket array size <code>n</code> is always kept a power of two.<br>
<br>
<strong>Collision resolution</strong> then relies on <code>equals()</code>: if two keys land in the same bucket (same index), HashMap walks the bucket's linked list (or tree) and calls <code>equals()</code> on each existing key to find an exact match. If <code>equals()</code> returns true, the value is replaced; otherwise a new node is appended.<br>
<br>
<strong>Golden rule:</strong> if you override <code>equals()</code> on a class you plan to use as a HashMap key, you MUST also override <code>hashCode()</code> consistently (equal objects must produce equal hash codes) - otherwise two "equal" keys can land in different buckets and both get stored, silently breaking the map.<br>`,
                codeExamples: [
                  `import java.util.HashMap;

class Person {
    private String name;
    private int id;

    public Person(String name, int id) {
        this.name = name;
        this.id = id;
    }

    @Override
    public int hashCode() {
        return id; // simplified hash code based on id
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Person person = (Person) obj;
        return id == person.id && name.equals(person.name);
    }

    @Override
    public String toString() {
        return name + " (ID: " + id + ")";
    }
}

public class HashCodeEqualsDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<Person, String> map = new HashMap<>(); // creates an empty HashMap named map
        Person p1 = new Person("Pankaj", 1);
        Person p4 = new Person("Pankaj", 1); // same name & id as p1, but a DIFFERENT object

        map.put(p1, "Developer");
        map.put(p4, "Architect"); // equals(p1) is true -> REPLACES p1's value, doesn't add a new entry

        System.out.println("Map size: " + map.size());     // 1, not 2
        System.out.println("Value for p1: " + map.get(p1)); // Architect
    }
}
// OUTPUT:
// Map size: 1
// Value for p1: Architect`
                ]
              },
              {
                content: `<h4>Seeing a Real Bucket Collision Happen</h4>
Same idea as the HashSet collision demo, but for HashMap directly: force two different keys to hash into the <strong>same bucket</strong> and watch HashMap fall back to <code>equals()</code> to tell them apart, keeping both as separate entries in that bucket's linked list.<br>`,
                codeExamples: [
                  `import java.util.HashMap;

class BadKey {
    final String label;
    BadKey(String label) { this.label = label; }

    @Override
    public int hashCode() {
        return 42;    // FORCE every BadKey into the same bucket
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BadKey)) return false;
        return label.equals(((BadKey) o).label);
    }

    @Override
    public String toString() { return label; }
}

public class HashMapCollisionDemo { // class that holds the main method
    public static void main(String[] args) { // program entry point
        HashMap<BadKey, Integer> map = new HashMap<>(); // creates an empty HashMap named map
        map.put(new BadKey("A"), 1);
        map.put(new BadKey("B"), 2);
        map.put(new BadKey("C"), 3);
        map.put(new BadKey("A"), 99);    // equals("A") is true -> UPDATES the existing entry

        System.out.println("Map: " + map);
        System.out.println("Size: " + map.size());
        // All 3 keys sit in the same bucket (hashCode always 42) as a linked
        // list of Nodes. get()/put() walk that list comparing with equals()
        // until they find a match - this is the collision path in action.
    }
}
// OUTPUT:
// Map: {A=99, B=2, C=3}
// Size: 3`
                ]
              },
              {
                content: `<h3>Class Diagram: HashMap's Structure and Its Node Hierarchy</h3>
Unlike HashSet (which composes a whole separate HashMap object), HashMap doesn't delegate to anything - it IS the bottom of the delegation chain. What's interesting here instead is the <strong>internal Node class hierarchy</strong> that most explanations skip over.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">AbstractMap&lt;K,V&gt; &nbsp;<span style="color:#777;">implements Map&lt;K,V&gt;</span></td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#eef7e9; border:2px solid #5c9a4a; border-radius:6px; padding:10px 16px;">
<strong>HashMap&lt;K,V&gt;</strong> &nbsp;<span style="font-size:11px; color:#777;">implements Map&lt;K,V&gt;, Cloneable, Serializable</span><br>
<span style="font-size:12px; font-family:monospace;">- table: Node&lt;K,V&gt;[]</span>
</td>
</tr>
<tr><td style="padding:4px 0; font-size:12px; color:#3b6e3b;">&#9651; extends</td></tr>
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px;">LinkedHashMap&lt;K,V&gt; &nbsp; <span style="color:#777;">(only known JDK subclass)</span></td>
</tr>
</table>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">The array elements themselves - a hidden inner-class hierarchy</td></tr>
<tr>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:8px 12px; font-size:12px; vertical-align:top;">
<strong>Node&lt;K,V&gt;</strong><br>
<span style="font-family:monospace; font-size:11px;">hash, key, value, next</span><br>
<span style="font-size:11px; color:#777;">(linked-list bucket entry)</span>
</td>
<td style="width:30px; font-size:12px; color:#3b6e3b;">&larr; extends</td>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:8px 12px; font-size:12px; vertical-align:top;">
<strong>LinkedHashMap.Entry&lt;K,V&gt;</strong><br>
<span style="font-family:monospace; font-size:11px;">+ before, after</span><br>
<span style="font-size:11px; color:#777;">(adds the doubly-linked ordering pointers)</span>
</td>
</tr>
<tr><td colspan="3" style="height:6px;"></td></tr>
<tr>
<td colspan="3" style="font-size:12px; color:#3b6e3b;">&#9651; extends (surprising but true)</td>
</tr>
<tr>
<td colspan="3" style="background:#fbeae5; border:1px solid #e0a898; border-radius:6px; padding:8px 12px; font-size:12px;">
<strong>TreeNode&lt;K,V&gt;</strong> &nbsp;<span style="color:#777;">(HashMap's static inner class)</span><br>
<span style="font-family:monospace; font-size:11px;">+ parent, left, right, prev, red</span><br>
<span style="font-size:11px; color:#777;">used ONLY after treeification (8+ collisions &amp; table &ge; 64)</span>
</td>
</tr>
</table>
<br>
<strong>The surprising part:</strong> HashMap's own <code>TreeNode</code> (used for the treeified Red-Black tree buckets) doesn't extend <code>Node</code> directly - it extends <strong>LinkedHashMap.Entry</strong>, which itself extends Node. HashMap reaches into LinkedHashMap's inner class purely to inherit the <code>before</code>/<code>after</code> pointer fields, even though a plain HashMap never uses them for ordering - it's just convenient field reuse across the two classes, a detail that only shows up by reading the actual JDK source.<br>`
              },
              {
                content: `<h3>Memory Diagram: What put() Actually Builds on the Heap</h3>
Same style as HashSet's diagram, but now the Node holds a <strong>real value</strong> instead of the shared PRESENT dummy - and this time there's a second diagram worth seeing: what a <strong>resize</strong> actually does to existing Nodes.<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">HEAP - after map.put("Pankaj", 90000)</td></tr>
<tr>
<td style="background:#e6eefc; border:1px solid #7fa0d9; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>HashMap@M</strong><br>
<span style="font-size:12px;">table[16] &rarr; bucket array</span>
</td>
<td style="width:30px;">&rarr;</td>
<td style="background:#fdf2e3; border:1px solid #e0b878; border-radius:6px; padding:10px 14px; vertical-align:top;">
<strong>table[9] &rarr; Node@N1</strong><br>
<span style="font-size:12px;">hash = ...(spread hash of "Pankaj")<br>key &rarr; String@"Pankaj"<br>value &rarr; Integer@90000<br>next &rarr; null</span>
</td>
</tr>
</table>
<br>
<h4>What Resize Actually Does to Existing Nodes (Not a Full Rehash!)</h4>
When capacity doubles from 16 to 32, most explanations say "everything gets rehashed" - but Java 8+ HashMap is smarter than that. Since capacity is always a power of 2, doubling it only adds <strong>one new bit</strong> to the index calculation. So instead of recomputing each Node's hash from scratch, resize just checks that <strong>one extra bit</strong> and splits each old bucket's list into exactly two groups: <strong>lo</strong> (bit is 0 - stays at the same index) and <strong>hi</strong> (bit is 1 - moves to <code>oldIndex + oldCapacity</code>).<br>
<br>
<table border="0" cellpadding="0" cellspacing="0" style="width:100%; text-align:center;">
<tr><td colspan="3" style="font-size:12px; font-weight:bold; color:#3b6e3b; padding-bottom:6px;">Resize from capacity 16 to 32 - old bucket table[9] had 2 nodes</td></tr>
<tr>
<td style="background:#fbeae5; border:1px solid #e0a898; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>new table[9]</strong> (lo group - extra bit was 0)<br>Node@N1 {key="Pankaj", ...} - the SAME object, just relinked, not recreated
</td>
<td></td>
<td style="background:#fbeae5; border:1px solid #e0a898; border-radius:6px; padding:8px 12px; font-size:12px; width:48%;">
<strong>new table[25]</strong> (hi group - extra bit was 1, 9+16=25)<br>Node@N2 {key="Dheeraj", ...} - the SAME object, relinked here instead
</td>
</tr>
</table>
<br>
<strong>The key insight:</strong> resize is cheaper than it sounds - it's an array-splitting operation that reuses the exact same Node objects (no new Node allocations, no hashCode() recomputation), just relinking each one's <code>next</code> pointer into one of two new chains. This is specifically a Java 8 optimization; pre-Java-8 HashMap really did recompute everything on resize.<br>`
              }
            ]
          }
        ]
      }
    ],

    cheatNotes: [
      // Collection Hierarchy
      'Collection - Root interface for List, Set, Queue',
      'Map is NOT a Collection - Separate key-value hierarchy',
      'Iterable - Top interface, provides iterator() method',
      // List Interface
      'List<T> list = new ArrayList<>() - Create ArrayList',
      'ArrayList - Backed by dynamic resizable array, fast random access O(1)',
      'ArrayList add/remove at end - O(1) amortized, at middle - O(n)',
      'list.add(item) - Add element to list',
      'list.get(index) - Get element at index',
      'list.set(index, item) - Replace element at index',
      'list.remove(index) - Remove element at index',
      'list.size() - Get list size',
      'list.contains(item) - Check if element exists',
      'list.indexOf(item) - Find first index of element',
      'LinkedList<T> ll = new LinkedList<>() - Create LinkedList',
      'LinkedList - Doubly linked list, O(1) insert/delete at ends, O(n) access',
      'll.addFirst(item) / ll.addLast(item) - Add to start/end',
      'll.getFirst() / ll.getLast() - Get first/last element',
      'LinkedList implements Deque - Can be used as stack or queue',
      'Vector<T> v = new Vector<>() - Create Vector (thread-safe, synchronized)',
      'v.capacity() - Get current capacity',
      'Vector grows by doubling, ArrayList grows by 50%',
      'Stack<T> s = new Stack<>() - Create Stack (LIFO), extends Vector',
      's.push(item) / s.pop() / s.peek() - Stack operations',
      's.search(item) - Returns offset from top or -1',
      'Prefer ArrayDeque over Stack for stack operations (faster, not synchronized)',
      // Set Interface
      'Set<T> set = new HashSet<>() - Create HashSet (no duplicates, unordered)',
      'HashSet - Backed by HashMap internally, O(1) add/remove/contains',
      'Set<T> set = new LinkedHashSet<>() - Maintains insertion order',
      'Set<T> set = new TreeSet<>() - Sorted Set, backed by TreeMap (Red-Black tree)',
      'TreeSet operations are O(log n) due to tree structure',
      // Map Interface
      'Map<K,V> map = new HashMap<>() - Create HashMap (unordered key-value pairs)',
      'HashMap - Array of buckets + linked list/tree, allows one null key',
      'HashMap load factor default 0.75 - Triggers resize when 75% full',
      'HashMap treeification (Java 8+) - Bucket converts to tree when 8+ collisions',
      'LinkedHashMap - HashMap that preserves insertion order',
      'TreeMap - Sorted by keys using Comparable/Comparator, O(log n) operations',
      'Hashtable - Legacy, synchronized, does not allow null key/value',
      'map.put(key, value) - Add/update entry',
      'map.get(key) - Get value by key',
      'map.containsKey(key) - Check key exists',
      'map.getOrDefault(key, default) - Get value or fallback',
      'map.keySet() / map.values() / map.entrySet() - Get collections',
      // Queue & Deque
      'Queue<T> q = new LinkedList<>() - FIFO queue implementation',
      'PriorityQueue<T> pq = new PriorityQueue<>() - Min-heap by default',
      'Deque<T> d = new ArrayDeque<>() - Double-ended queue, faster than Stack',
      'offer()/poll()/peek() - Non-throwing queue operations',
      // Iterators
      'Iterator - forward-only traversal with hasNext()/next()/remove()',
      'ListIterator - Bidirectional traversal, allows add()/set() while iterating',
      'Fail-fast iterator - Throws ConcurrentModificationException on structural change',
      'Fail-safe iterator - Works on a copy (e.g. CopyOnWriteArrayList), no exception',
      // Sorting & Utilities
      'Collections.sort(list) - Sort using Comparable',
      'Collections.sort(list, comparator) - Sort using Comparator',
      'Comparable: compareTo() in java.lang - Natural ordering, implemented by the class',
      'Comparator: compare() in java.util - Custom ordering, external to the class',
      'Collections.unmodifiableList() - Returns read-only view of a list',
      'Collections.synchronizedList() - Returns thread-safe wrapper around a list',
      'Generics <T> - Compile-time type safety for collections, avoids ClassCastException'
    ],

    interviewQuestions: [
      {
        company: 'Collection Framework',
        questions: [
          'What is the Collection Framework in Java?',
          'What is the difference between Collection and Collections?',
          'What is the difference between Array and Collection?',
          'What are the main interfaces in the Collection Framework?',
          'What is the difference between Collection and Map, and why does Map not extend Collection?',
          'What is the difference between Iterable and Iterator?',
          'What is the difference between List, Set, and Queue?',
          'Explain fail-fast vs fail-safe iterators with an example.',
          'What are the methods of the Collection interface?',
          'What is the difference between Iterator and ListIterator?',
          'What is the difference between Comparable and Comparator?',
          'What is the difference between HashSet and TreeSet?'
        ]
      },
      {
        company: 'ArrayList',
        questions: [
          'What is the difference between ArrayList and LinkedList?',
          'What is the difference between ArrayList and Vector?',
          'What is the default capacity of ArrayList and how does it grow?',
          'How does ArrayList achieve dynamic resizing internally?',
          'Is ArrayList thread-safe? How do you make it thread-safe?',
          'What is the difference between size() and capacity() of ArrayList?',
          'What is the time complexity of add, remove, and get operations in ArrayList?',
          'What happens if you modify an ArrayList while iterating over it?',
          'How do you get a synchronized version of ArrayList?',
          'What is the difference between Arrays.asList() and a real ArrayList?'
        ]
      },
      {
        company: 'LinkedList',
        questions: [
          'What is the difference between LinkedList and ArrayList?',
          'How is LinkedList implemented internally in Java?',
          'Does Java\'s LinkedList use a singly or doubly linked list?',
          'What interfaces does LinkedList implement besides List?',
          'Why is LinkedList a good choice for implementing a Deque or Queue?',
          'What is the time complexity of insertion/deletion at the beginning of a LinkedList?',
          'Why is random access slower in LinkedList than in ArrayList?',
          'Is LinkedList thread-safe?',
          'What is the memory overhead of LinkedList compared to ArrayList?'
        ]
      },
      {
        company: 'Vector',
        questions: [
          'What is the difference between Vector and ArrayList?',
          'Is Vector synchronized by default? Why was it designed that way?',
          'What is the default growth strategy of Vector compared to ArrayList?',
          'Why is Vector considered a legacy class?',
          'What is the difference between Vector and Stack?',
          'When would you still choose Vector today over ArrayList?',
          'How do you iterate over a Vector using Enumeration versus Iterator?'
        ]
      },
      {
        company: 'Stack',
        questions: [
          'How does the Stack class implement the LIFO principle in Java?',
          'What is the difference between Stack and Deque as a stack implementation?',
          'Why does Java recommend using Deque/ArrayDeque instead of Stack?',
          'What class does Stack extend, and what problem does that cause?',
          'What are the key methods of the Stack class: push(), pop(), peek(), empty(), search()?',
          'Is Stack thread-safe, and what is the performance cost of that?'
        ]
      },
      {
        company: 'HashSet',
        questions: [
          'How does HashSet ensure uniqueness of elements internally?',
          'What is the internal data structure used by HashSet?',
          'What is the role of hashCode() and equals() in HashSet?',
          'What happens when two objects have the same hashCode but are not equal?',
          'What is the default initial capacity and load factor of HashSet?',
          'Does HashSet maintain insertion order?',
          'Is HashSet thread-safe?',
          'What is the time complexity of add, remove, and contains in HashSet?'
        ]
      },
      {
        company: 'LinkedHashSet',
        questions: [
          'What is the difference between HashSet and LinkedHashSet?',
          'How does LinkedHashSet maintain insertion order internally?',
          'What is the performance trade-off of LinkedHashSet compared to HashSet?',
          'When would you prefer LinkedHashSet over TreeSet?',
          'What is the internal data structure of LinkedHashSet?',
          'How does LinkedHashSet compare to TreeSet in terms of performance and ordering?',
          'Can LinkedHashSet contain null elements?',
          'Is LinkedHashSet thread-safe?',
          'What is the time complexity of add, remove, and contains in LinkedHashSet?'
        ]
      },
      {
        company: 'TreeSet',
        questions: [
          'How does TreeSet maintain sorted order internally?',
          'What is the underlying data structure of TreeSet?',
          'What is the difference between TreeSet and HashSet?',
          'Can TreeSet store null elements? Why or why not?',
          'What is the difference between natural ordering and comparator-based ordering in TreeSet?',
          'What is the time complexity of add, remove, and contains in TreeSet?'
        ]
      },
      {
        company: 'HashMap',
        questions: [
          'How does HashMap work internally in Java?',
          'What happens when two keys have the same hashCode in HashMap?',
          'Explain treeification in HashMap (Java 8+).',
          'What is the default initial capacity and load factor of HashMap?',
          'Why should keys used in a HashMap be immutable?',
          'Can HashMap have a null key and null values?',
          'Is HashMap thread-safe? What are the thread-safe alternatives?',
          'What is the time complexity of HashMap get() and put() operations?',
          'What triggers resizing (rehashing) in a HashMap?',
          'What is the difference between HashMap and Hashtable?'
        ]
      },
      {
        company: 'LinkedHashMap',
        questions: [
          'What is the difference between HashMap and LinkedHashMap?',
          'How does LinkedHashMap maintain insertion order internally?',
          'How can you use LinkedHashMap to build an LRU cache?',
          'What is access-order mode in LinkedHashMap and how do you enable it?',
          'What is the internal data structure of LinkedHashMap and how does it differ from HashMap\'s?',
          'Can LinkedHashMap have null keys and null values?',
          'Is LinkedHashMap thread-safe?',
          'What is the time complexity of get() and put() in LinkedHashMap?',
          'How do you override removeEldestEntry() to auto-evict old entries?'
        ]
      },
      {
        company: 'TreeMap',
        questions: [
          'How does TreeMap maintain sorted order of its keys?',
          'What is the difference between HashMap and TreeMap?',
          'What methods does TreeMap provide for range queries: headMap(), tailMap(), subMap()?',
          'Can TreeMap have a null key?',
          'What is the time complexity of TreeMap operations?',
          'Does TreeMap allow duplicate keys?',
          'What interfaces does TreeMap implement besides Map, such as NavigableMap and SortedMap?',
          'Is TreeMap thread-safe?',
          'How do firstKey(), lastKey(), ceilingKey(), and floorKey() work in TreeMap?'
        ]
      },
      {
        company: 'Hashtable',
        questions: [
          'What is the difference between HashMap and Hashtable?',
          'Why is Hashtable considered a legacy, synchronized-by-default class?',
          'Can Hashtable store null keys or null values?',
          'What is the difference between Hashtable and ConcurrentHashMap?',
          'What is the internal data structure of Hashtable?',
          'What is the default initial capacity and load factor of Hashtable?',
          'Why does Hashtable throw a NullPointerException on null key or value insertion?',
          'What is the time complexity of Hashtable operations?',
          'Is Hashtable considered obsolete? What should be used instead in modern code?'
        ]
      },
      {
        company: 'Comparable Interface',
        questions: [
          'What is the difference between Comparable and Comparator?',
          'Which package does Comparable belong to, and what method must be implemented?',
          'How do you sort a list of custom objects using Comparable?',
          'What does compareTo() need to return, and what do negative, zero, and positive results mean?',
          'What happens if you don\'t override compareTo() consistently with equals()?',
          'Can you use Collections.sort() directly on a class implementing Comparable?',
          'What is natural ordering, and which built-in Java classes implement Comparable?',
          'Can a class implement both Comparable and Comparator?',
          'What exception is thrown if you try to sort a list of objects that don\'t implement Comparable?'
        ]
      },
      {
        company: 'Comparator Interface',
        questions: [
          'What is the difference between Comparable and Comparator?',
          'How do you sort a list using multiple fields with Comparator?',
          'What is the purpose of Comparator.comparing() and thenComparing()?',
          'How do you reverse a natural ordering using Comparator?',
          'Where does the Comparator interface live, and is it a functional interface?',
          'How do you write a Comparator using a lambda expression?',
          'What is the difference between Comparator.naturalOrder() and Comparator.reverseOrder()?',
          'How do you sort a Map by its values using a Comparator?',
          'Can you pass a Comparator to the constructor of TreeSet or TreeMap?'
        ]
      },
      {
        company: 'Internal Working of HashSet',
        questions: [
          'Explain what happens internally when you call add() on a HashSet.',
          'How is HashSet backed by a HashMap internally?',
          'What dummy/placeholder value does HashSet use internally for its backing map?',
          'What is the default capacity and load factor used internally by HashSet\'s backing HashMap?',
          'How does HashSet\'s contains() method work internally?',
          'What happens internally when you remove an element from a HashSet?',
          'Why does HashSet not allow duplicate elements at the hashCode/equals level?',
          'Is the iteration order of HashSet guaranteed? Why not?'
        ]
      },
      {
        company: 'Internal Working of HashMap',
        questions: [
          'Walk through what happens internally when put() is called on a HashMap.',
          'Explain hashing, bucketing, and collision handling in HashMap.',
          'What changed in HashMap\'s internal implementation in Java 8 (treeification)?',
          'How does HashMap compute the bucket index from a key\'s hashCode?',
          'What is the purpose of the extra bit-spreading step in HashMap\'s hash() method?',
          'What happens internally during HashMap resizing (rehashing)?',
          'What is the threshold for converting a bucket\'s linked list into a red-black tree?',
          'How does HashMap handle a get() call when there\'s a hash collision?'
        ]
      }
    ]
  }
];
