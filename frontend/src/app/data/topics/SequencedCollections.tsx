import { Topic } from '../coreJava';

export const sequencedCollections: Topic = {
                        id: 'sequenced-collections',
                        name: 'Sequenced Collections',
                        beginner: [
                            {
                                content: `<h3>Sequenced Collections in Java 21</h3>
<h4>Introduction</h4>
<p>Java 21 introduces <strong>Sequenced Collections</strong> (JEP 431). These are new interfaces for collections that have a defined encounter order (the order in which you meet the elements). They add the same methods to get the first and last element and to get a reversed view.</p>

<h4>New Interfaces</h4>
<ul>
<li><strong>SequencedCollection&lt;E&gt;</strong> — extends Collection, adds first/last access and a reversed view</li>
<li><strong>SequencedSet&lt;E&gt;</strong> — extends SequencedCollection and Set</li>
<li><strong>SequencedMap&lt;K,V&gt;</strong> — extends Map, adds first/last entry access and a reversed view</li>
</ul>

<h4>Key Methods on SequencedCollection</h4>
<ul>
<li><strong>getFirst()</strong> — get the first element</li>
<li><strong>getLast()</strong> — get the last element</li>
<li><strong>addFirst(E)</strong> — add an element at the beginning</li>
<li><strong>addLast(E)</strong> — add an element at the end</li>
<li><strong>removeFirst()</strong> — remove and return the first element</li>
<li><strong>removeLast()</strong> — remove and return the last element</li>
<li><strong>reversed()</strong> — return a reversed view of the collection</li>
</ul>`,
                                codeExamples: [
`// Sequenced Collections — Basic Usage
import java.util.*;

public class SequencedCollectionBasic {
    public static void main(String[] args) {
        // SequencedCollection with ArrayList
        SequencedCollection<String> list = new ArrayList<>(
            List.of("Apple", "Banana", "Cherry")
        );

        System.out.println("First: " + list.getFirst());
        System.out.println("Last: " + list.getLast());

        list.addFirst("Avocado");  // add at beginning
        list.addLast("Date");      // add at end
        System.out.println("List: " + list);

        // Reversed view
        SequencedCollection<String> reversed = list.reversed();
        System.out.println("Reversed: " + reversed);

        // SequencedSet with LinkedHashSet
        SequencedSet<String> set = new LinkedHashSet<>(
            List.of("Red", "Green", "Blue")
        );
        System.out.println("\\nSet first: " + set.getFirst());
        System.out.println("Set last: " + set.getLast());
        System.out.println("Reversed set: " + set.reversed());

        // SequencedMap with LinkedHashMap
        SequencedMap<String, Integer> map = new LinkedHashMap<>();
        map.put("one", 1);
        map.put("two", 2);
        map.put("three", 3);

        System.out.println("\\nFirst entry: " + map.firstEntry());
        System.out.println("Last entry: " + map.lastEntry());
        System.out.println("Reversed: " + map.reversed());
    }
}

// OUTPUT:
// First: Apple
// Last: Cherry
// List: [Avocado, Apple, Banana, Cherry, Date]
// Reversed: [Date, Cherry, Banana, Apple, Avocado]
//
// Set first: Red
// Set last: Blue
// Reversed set: [Blue, Green, Red]
//
// First entry: one=1
// Last entry: three=3
// Reversed: {three=3, two=2, one=1}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Sequenced Collections — Intermediate Usage</h3>
<h4>Interface Hierarchy</h4>
<ul>
<li><strong>List</strong> and <strong>Deque</strong> now extend <strong>SequencedCollection</strong></li>
<li><strong>LinkedHashSet</strong> and <strong>SortedSet</strong> now implement <strong>SequencedSet</strong></li>
<li><strong>LinkedHashMap</strong> and <strong>SortedMap</strong> now implement <strong>SequencedMap</strong></li>
</ul>

<h4>The Problem Solved</h4>
<p>Before Java 21 there was no common way to:</p>
<ul>
<li>get the last element of a List, a SortedSet and a LinkedHashSet</li>
<li>get a reversed view of an ordered collection</li>
</ul>
<p>Each collection had different methods or needed workarounds.</p>

<h4>SequencedMap Methods</h4>
<ul>
<li><strong>firstEntry() / lastEntry()</strong> — get the first or last Map.Entry</li>
<li><strong>pollFirstEntry() / pollLastEntry()</strong> — remove and return the first or last entry</li>
<li><strong>putFirst(K, V) / putLast(K, V)</strong> — insert at the beginning or end</li>
<li><strong>reversed()</strong> — reversed view of the map</li>
<li><strong>sequencedKeySet() / sequencedValues() / sequencedEntrySet()</strong> — sequenced views of keys, values and entries</li>
</ul>`,
                                codeExamples: [
`// Sequenced Collections — Intermediate Usage
import java.util.*;

public class SequencedCollectionIntermediate {
    // Works with any SequencedCollection
    static <T> void printFirstAndLast(
            String label, SequencedCollection<T> c) {
        System.out.println(label + ":");
        System.out.println("  First: " + c.getFirst());
        System.out.println("  Last: " + c.getLast());
        System.out.println("  Reversed first 3: " +
            c.reversed().stream().limit(3).toList());
    }

    public static void main(String[] args) {
        // Same code for different collection types
        printFirstAndLast("ArrayList",
            new ArrayList<>(List.of(1, 2, 3, 4, 5)));
        printFirstAndLast("LinkedList",
            new LinkedList<>(List.of("a", "b", "c")));
        printFirstAndLast("TreeSet",
            new TreeSet<>(Set.of(10, 20, 30, 40)));
        printFirstAndLast("LinkedHashSet",
            new LinkedHashSet<>(List.of("X", "Y", "Z")));

        // SequencedMap operations
        SequencedMap<String, Integer> scores = new LinkedHashMap<>();
        scores.put("Anaji", 95);
        scores.put("Baji", 87);
        scores.put("Chimnaji", 92);

        System.out.println("\\nFirst entry: " + scores.firstEntry());
        System.out.println("Last entry: " + scores.lastEntry());

        // Put at beginning
        scores.putFirst("Zara", 99);
        System.out.println("After putFirst: " + scores);

        // Remove last
        var removed = scores.pollLastEntry();
        System.out.println("Removed: " + removed);
        System.out.println("After pollLast: " + scores);

        // Reversed iteration
        System.out.println("\\nReversed map iteration:");
        scores.reversed().forEach((k, v) ->
            System.out.println("  " + k + " -> " + v));

        // Sequenced key set
        SequencedSet<String> keys = scores.sequencedKeySet();
        System.out.println("Keys reversed: " + keys.reversed());
    }
}

// OUTPUT:
// ArrayList:
//   First: 1
//   Last: 5
//   Reversed first 3: [5, 4, 3]
// LinkedList:
//   First: a
//   Last: c
//   Reversed first 3: [c, b, a]
// TreeSet:
//   First: 10
//   Last: 40
//   Reversed first 3: [40, 30, 20]
// LinkedHashSet:
//   First: X
//   Last: Z
//   Reversed first 3: [Z, Y, X]
//
// First entry: Anaji=95
// Last entry: Chimnaji=92
// After putFirst: {Zara=99, Anaji=95, Baji=87, Chimnaji=92}
// Removed: Chimnaji=92
// After pollLast: {Zara=99, Anaji=95, Baji=87}
//
// Reversed map iteration:
//   Baji -> 87
//   Anaji -> 95
//   Zara -> 99
// Keys reversed: [Baji, Anaji, Zara]`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Sequenced Collections — Expert Deep Dive</h3>
<h4>Design Rationale</h4>
<p>Before Java 21, getting the last element needed different code for each type:</p>
<ul>
<li>List: <code>list.get(list.size() - 1)</code></li>
<li>SortedSet: <code>sortedSet.last()</code></li>
<li>Deque: <code>deque.getLast()</code></li>
<li>LinkedHashSet: no direct method (you had to loop or copy)</li>
</ul>
<p>Sequenced Collections unify all of these with a single <strong>getLast()</strong> method.</p>

<h4>Implementation Details</h4>
<ul>
<li><strong>reversed()</strong> returns a <strong>view</strong>, not a copy: changes to the original show in the reversed view</li>
<li>Default implementations exist in the interfaces and use existing methods</li>
<li>Specific classes (for example ArrayList) can override them for better performance</li>
<li>Unmodifiable collections return unmodifiable reversed views</li>
</ul>`,
                                codeExamples: [
`// Expert Sequenced Collections
import java.util.*;

public class SequencedCollectionExpert {
    public static void main(String[] args) {
        // reversed() is a VIEW, not a copy
        var list = new ArrayList<>(List.of("A", "B", "C"));
        var reversed = list.reversed();

        System.out.println("Original: " + list);
        System.out.println("Reversed: " + reversed);

        list.add("D");  // modify original
        System.out.println("After add to original:");
        System.out.println("Original: " + list);
        System.out.println("Reversed: " + reversed);

        // addFirst on reversed = addLast on original
        reversed.addFirst("E");
        System.out.println("After addFirst on reversed:");
        System.out.println("Original: " + list);
        System.out.println("Reversed: " + reversed);

        // Before Java 21: names.get(names.size() - 1)
        List<String> names = List.of("Anaji", "Baji", "Chimnaji");
        System.out.println("\\nLast: " + names.getLast());

        // Before Java 21: sorted.last() (SortedSet only)
        SortedSet<Integer> sorted = new TreeSet<>(Set.of(5, 1, 3, 9, 7));
        System.out.println("Sorted last: " + sorted.getLast());

        // Unmodifiable wrapper keeps the sequenced behavior
        var unmodifiable = Collections.unmodifiableSequencedCollection(
            new ArrayList<>(List.of(1, 2, 3))
        );
        System.out.println("\\nUnmodifiable first: " + unmodifiable.getFirst());
        System.out.println("Unmodifiable reversed: " + unmodifiable.reversed());
        // unmodifiable.addFirst(0); // throws UnsupportedOperationException

        // Streams over a reversed view
        var numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5));
        var lastThree = numbers.reversed().stream()
            .limit(3)
            .toList();
        System.out.println("Last 3 (reversed order): " + lastThree);
    }
}

// OUTPUT:
// Original: [A, B, C]
// Reversed: [C, B, A]
// After add to original:
// Original: [A, B, C, D]
// Reversed: [D, C, B, A]
// After addFirst on reversed:
// Original: [A, B, C, D, E]
// Reversed: [E, D, C, B, A]
//
// Last: Chimnaji
// Sorted last: 9
//
// Unmodifiable first: 1
// Unmodifiable reversed: [3, 2, 1]
// Last 3 (reversed order): [5, 4, 3]`
                                ]
                            }
                        ]
};
