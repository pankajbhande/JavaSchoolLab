import type { QuizBank } from '../types';

// Course-wide bank: collection (Collection Framework) — covers all six of its modules.
export const collections: QuizBank = {
  key: 'collection',
  label: 'Collection Framework',
  questions: [
    {
      id: 'col-arraylist-vs-linkedlist',
      question: 'Why is ArrayList usually the better default than LinkedList, even for lists you insert into often?',
      options: [
        'ArrayList gives O(1) random access and far better cache locality; LinkedList pays a pointer chase and an object header per element',
        'LinkedList cannot grow beyond its initial capacity',
        'ArrayList inserts in the middle in O(1) while LinkedList needs O(n)',
        'LinkedList is not thread safe but ArrayList is',
      ],
      correctAnswer: 0,
      explanation:
        'LinkedList only wins when you insert or remove at a position you already hold an iterator for. Its nodes are scattered across the heap, so traversal misses cache constantly, and each node carries its own header plus two references.',
      difficulty: 'intermediate',
    },
    {
      id: 'col-equals-hashcode',
      question: 'You use a custom class as a HashMap key and override equals() but not hashCode(). What goes wrong?',
      options: [
        'Two equal keys can land in different buckets, so a lookup with an equal key fails to find the entry',
        'The map throws IllegalStateException on the first put',
        'Nothing, hashCode() is only used by HashSet',
        'The code fails to compile, because equals and hashCode must be overridden together',
      ],
      correctAnswer: 0,
      explanation:
        'HashMap picks a bucket from hashCode() and only then compares with equals(). The inherited identity hashCode differs per object, so an equal-but-distinct key usually probes the wrong bucket and reports a miss. The contract requires equal objects to share a hash code.',
      difficulty: 'intermediate',
    },
    {
      id: 'col-hashmap-treeify',
      question: 'What did Java 8 change about how HashMap handles a bucket with many colliding entries?',
      options: [
        'A long collision chain converts into a balanced tree, improving worst case lookup from O(n) to O(log n)',
        'Colliding entries are rehashed into a second backing array',
        'The map throws an exception once a bucket exceeds eight entries',
        'Collisions were eliminated entirely by a new hash function',
      ],
      correctAnswer: 0,
      explanation:
        'Once a bucket holds enough entries and the table is large enough, the linked chain becomes a red-black tree. This caps the damage from hash-collision attacks and from poor hashCode implementations.',
      difficulty: 'expert',
    },
    {
      id: 'col-hashset-backing',
      question: 'How is HashSet implemented internally?',
      options: [
        'It wraps a HashMap, storing each element as a key mapped to one shared dummy value',
        'It uses a sorted array with binary search',
        'It uses a linked list with a uniqueness check on every add',
        'It is a primitive JVM structure with no Java-level backing collection',
      ],
      correctAnswer: 0,
      explanation:
        'HashSet delegates almost everything to a private HashMap, which is why it inherits the same hashCode and equals requirements and the same average O(1) behaviour. LinkedHashSet and TreeSet wrap LinkedHashMap and TreeMap the same way.',
      difficulty: 'intermediate',
    },
    {
      id: 'col-cme',
      question: 'Removing an element by calling list.remove() inside an enhanced for loop over that list usually throws what?',
      options: [
        'ConcurrentModificationException, because the iterator detects structural modification',
        'IndexOutOfBoundsException, because the list shrank',
        'UnsupportedOperationException, because lists are immutable while iterating',
        'Nothing, this is the standard way to remove elements',
      ],
      correctAnswer: 0,
      explanation:
        'The iterator records a modification count and checks it on each step; changing the list behind its back trips the fail-fast guard. Use iterator.remove(), removeIf(), or collect the survivors into a new list.',
      difficulty: 'intermediate',
    },
    {
      id: 'col-comparable-vs-comparator',
      question: 'When should you reach for Comparator rather than Comparable?',
      options: [
        'When you need several orderings, or cannot modify the class being sorted',
        'When the collection holds primitives rather than objects',
        'When sorting must be stable',
        'When the list has more than a thousand elements',
      ],
      correctAnswer: 0,
      explanation:
        'Comparable bakes one natural ordering into the class itself, so a type can have only one. Comparator lives outside the class, letting you sort the same type by name, then by date, and letting you order classes you do not own.',
      difficulty: 'beginner',
    },
    {
      id: 'col-vector-arraylist',
      question: 'What is the practical difference between Vector and ArrayList?',
      options: [
        'Vector synchronizes every method, which makes it slower and still does not make compound operations safe',
        'Vector cannot be resized after construction',
        'ArrayList is a legacy class that Vector replaced',
        'Vector stores primitives while ArrayList stores objects',
      ],
      correctAnswer: 0,
      explanation:
        'Vector locks on each individual call, so check-then-act sequences still race, and the locking costs you throughput even in single-threaded code. For genuinely concurrent use, prefer CopyOnWriteArrayList or an explicit lock.',
      difficulty: 'intermediate',
    },
    {
      id: 'col-listof-immutable',
      question: 'What happens when you call add() on a list created by List.of()?',
      options: [
        'It throws UnsupportedOperationException, because the list is immutable',
        'The element is appended normally',
        'It returns false and leaves the list unchanged',
        'It fails to compile, because List.of() returns a different interface',
      ],
      correctAnswer: 0,
      explanation:
        'The factory methods added in Java 9 return genuinely immutable lists that reject every mutating operation, and they also reject null elements. Arrays.asList() is different again: fixed size, but set() still works.',
      difficulty: 'intermediate',
    },
  ],
};
