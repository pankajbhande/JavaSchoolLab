// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
import { arrayListTopic } from './collection/arraylist';
import { linkedListTopic } from './collection/linkedlist';
import { vectorTopic } from './collection/vector';
import { stackTopic } from './collection/stack';
import { hashSetTopic } from './collection/hashset';
import { linkedHashSetTopic } from './collection/linkedhashset';
import { treeSetTopic } from './collection/treeset';
import { hashMapTopic } from './collection/hashmap';
import { linkedHashMapTopic } from './collection/linkedhashmap';
import { treeMapTopic } from './collection/treemap';
import { hashtableTopic } from './collection/hashtable';
import { comparableInterfaceTopic } from './collection/comparable';
import { comparatorInterfaceTopic } from './collection/comparator';
import { internalWorkingofHashSetTopic } from './collection/internal_hashset';
import { internalWorkingofHashMapTopic } from './collection/internal_hashmap';
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
        c.add("Raigad");
        c.add("Torna");
        c.add("Lohagad");
        System.out.println("Collection: " + c);

        // contains
        System.out.println("Contains Raigad? " + c.contains("Raigad"));

        // size and isEmpty
        System.out.println("Size: " + c.size());
        System.out.println("Is Empty? " + c.isEmpty());

        // remove
        c.remove("Lohagad");
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

          // ----- ArrayList (generated by scripts/collection-lessons: every sample is compiled and run) -----
          arrayListTopic,

          // ----- LinkedList (generated by scripts/collection-lessons) -----
          linkedListTopic,

          // ----- Vector (generated by scripts/collection-lessons) -----
          vectorTopic,

          // ----- Stack (generated by scripts/collection-lessons) -----
          stackTopic,
        ]
      },

      // ===== SubTopic 3: Set Interface =====
      {
        id: 'set',
        name: 'Set Interface',
        topics: [

          // ----- HashSet (generated by scripts/collection-lessons) -----
          hashSetTopic,

          // ----- LinkedHashSet (generated by scripts/collection-lessons) -----
          linkedHashSetTopic,

          // ----- TreeSet (generated by scripts/collection-lessons) -----
          treeSetTopic,
        ]
      },

      // ===== SubTopic 4: Map Interface =====
      {
        id: 'map',
        name: 'Map Interface',
        topics: [

          // ----- HashMap (generated by scripts/collection-lessons) -----
          hashMapTopic,

          // ----- LinkedHashMap (generated by scripts/collection-lessons) -----
          linkedHashMapTopic,

          // ----- TreeMap (generated by scripts/collection-lessons) -----
          treeMapTopic,

          // ----- Hashtable (generated by scripts/collection-lessons) -----
          hashtableTopic,
        ]
      },

      // ===== SubTopic 5: Comparable & Comparator =====
      {
        id: 'comparable-comparator',
        name: 'Comparable & Comparator',
        topics: [

          // ----- Comparable (generated by scripts/collection-lessons) -----
          comparableInterfaceTopic,

          // ----- Comparator (generated by scripts/collection-lessons) -----
          comparatorInterfaceTopic,
        ]
      },

      // ===== SubTopic 6: Internal Working =====
      {
        id: 'internal-working',
        name: 'Internal Working',
        topics: [

          // ----- Internal Working of HashSet (generated by scripts/collection-lessons) -----
          internalWorkingofHashSetTopic,

          // ----- Internal Working of HashMap (generated by scripts/collection-lessons) -----
          internalWorkingofHashMapTopic,
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
