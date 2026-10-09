import { Topic } from '../coreJava';

export const iteratorPattern: Topic = {
    id: 'iterator-pattern',
    name: 'Iterator Pattern',
    beginner: [
        {
            content: `
Iterator Pattern provides a way to <b>access elements of a collection sequentially</b> without exposing its underlying representation (array, list, tree, etc.).</p>

<h4>Real-Life Example:</h4>
<p>
A TV remote lets you browse channels one by one using the "Next" / "Previous" buttons.
You don't need to know whether the channels are stored as a list, an array, or fetched from a server -
the remote just gives you one channel at a time.
</p>

<h4>Why do we need Iterator Pattern?</h4>
<ul>
<li>To traverse a collection without exposing its internal structure</li>
<li>To provide a uniform way of iterating over different types of collections</li>
<li>To support multiple simultaneous traversals of the same collection</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li><code>Iterator</code> - interface with hasNext() and next() methods</li>
<li>Concrete Iterator - implements traversal logic for a specific collection</li>
<li><code>Aggregate</code> (Collection) - interface with a createIterator() method</li>
<li>Concrete Aggregate - returns a Concrete Iterator for itself</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 1: Custom Iterator Interface
interface MyIterator<T> {
    boolean hasNext();
    T next();
}

// Step 2: Custom Collection Interface
interface Collection<T> {
    MyIterator<T> createIterator();
}

// Step 3: Concrete Collection
class BookCollection implements Collection<String> {

    private String[] books;
    private int count = 0;

    public BookCollection(int size) {
        books = new String[size];
    }

    public void addBook(String title) {
        if (count < books.length) {
            books[count++] = title;
        }
    }

    public MyIterator<String> createIterator() {
        return new BookIterator();
    }

    // Step 4: Concrete Iterator (inner class - has access to books array)
    private class BookIterator implements MyIterator<String> {

        private int index = 0;

        public boolean hasNext() {
            return index < count;
        }

        public String next() {
            return books[index++];
        }
    }
}

// Step 5: Client Code
public class Test {
    public static void main(String[] args) {
        BookCollection collection = new BookCollection(3);
        collection.addBook("Effective Java");
        collection.addBook("Clean Code");
        collection.addBook("Head First Design Patterns");

        MyIterator<String> iterator = collection.createIterator();

        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
    }
}`
            ]
        }
    ],

    expert: [
        {
            content: `
<h3>Java's Built-in <code>Iterator</code> and <code>Iterable</code></h3>
<p>
The JDK already implements the Iterator pattern via <code>java.util.Iterator</code> and
<code>java.lang.Iterable</code>. Implementing <code>Iterable</code> in your own class lets it be
used directly in a for-each loop, integrating naturally with the rest of the Collections framework.
</p>
`,
            codeExamples: [
                `import java.util.Iterator;

class BookCollection implements Iterable<String> {

    private String[] books;
    private int count = 0;

    public BookCollection(int size) {
        books = new String[size];
    }

    public void addBook(String title) {
        if (count < books.length) {
            books[count++] = title;
        }
    }

    @Override
    public Iterator<String> iterator() {
        return new Iterator<String>() {
            private int index = 0;

            public boolean hasNext() {
                return index < count;
            }

            public String next() {
                return books[index++];
            }
        };
    }
}

public class Test {
    public static void main(String[] args) {
        BookCollection collection = new BookCollection(2);
        collection.addBook("Effective Java");
        collection.addBook("Clean Code");

        // for-each works because BookCollection implements Iterable
        for (String book : collection) {
            System.out.println(book);
        }
    }
}`
            ]
        },
        {
            content: `
<h3>Fail-Fast vs Fail-Safe Iterators</h3>
<p>
Java Collections provide two categories of iterators depending on how they behave when the
underlying collection is modified during iteration.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Fail-Fast</th>
<th>Fail-Safe</th>
</tr>
<tr>
<td>Behavior on modification</td>
<td>Throws <code>ConcurrentModificationException</code> immediately</td>
<td>Iterates over a snapshot/copy, no exception</td>
</tr>
<tr>
<td>Underlying mechanism</td>
<td>Uses an internal modCount checked on every next()</td>
<td>Works on a cloned/copy-on-write structure</td>
</tr>
<tr>
<td>Memory overhead</td>
<td>Low</td>
<td>Higher - copy of data may be created</td>
</tr>
<tr>
<td>Examples</td>
<td><code>ArrayList</code>, <code>HashMap</code>, <code>HashSet</code></td>
<td><code>CopyOnWriteArrayList</code> (true snapshot). <code>ConcurrentHashMap</code> is weakly consistent, not snapshot-based</td>
</tr>
</table>
`,
            codeExamples: [
                `import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class Test {
    public static void main(String[] args) {

        // Fail-Fast example
        List<String> list = new ArrayList<>(List.of("A", "B", "C"));
        try {
            for (String s : list) {
                if (s.equals("B")) {
                    list.remove(s); // modifying while iterating
                }
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("Fail-Fast: ConcurrentModificationException thrown");
        }

        // Fail-Safe example
        List<String> safeList = new CopyOnWriteArrayList<>(List.of("A", "B", "C"));
        for (String s : safeList) {
            if (s.equals("B")) {
                safeList.remove(s); // safe, works on a copy internally
            }
        }
        System.out.println("Fail-Safe result: " + safeList);
    }
}`
            ]
        },
        {
            content: `
<h3><code>ConcurrentModificationException</code> - Why It Happens</h3>
<p>
Fail-fast iterators (like those returned by <code>ArrayList</code>) track a <code>modCount</code>
field on the collection. Every structural modification (add/remove) increments it. The iterator
captures the modCount at creation and compares it on every call to <code>next()</code> - if they
differ, it throws <code>ConcurrentModificationException</code> to warn you early rather than let the
program silently misbehave.
</p>

<h4>Common Mistakes</h4>
<ul>
<li>Removing elements from a list directly inside a for-each loop instead of using <code>Iterator.remove()</code></li>
<li>Assuming fail-safe iterators reflect live updates - they usually see a stale snapshot</li>
<li>Sharing a single Iterator instance across multiple threads without synchronization</li>
<li>Forgetting that calling <code>next()</code> after <code>hasNext()</code> returns false throws <code>NoSuchElementException</code></li>
</ul>

<h4>Correct Way to Remove While Iterating</h4>
`,
            codeExamples: [
                `List<String> list = new ArrayList<>(List.of("A", "B", "C"));
Iterator<String> it = list.iterator();

while (it.hasNext()) {
    String value = it.next();
    if (value.equals("B")) {
        it.remove(); // safe removal via Iterator, no exception
    }
}

System.out.println(list); // [A, C]`
            ]
        },
        {
            content: `
<h4>When NOT to use Iterator Pattern?</h4>
<ul>
<li>When the collection is simple and its structure is not meant to be hidden (e.g. a small fixed array used internally)</li>
<li>When index-based random access is more natural and efficient than sequential traversal</li>
<li>When you need parallel/bulk operations - prefer Stream API (<code>Collection.stream()</code>) which is more expressive for map/filter/reduce style processing</li>
</ul>

<h4>Real Framework Usage</h4>
<ul>
<li>Every class in <code>java.util.Collection</code> supports Iterator via <code>iterator()</code></li>
<li>JDBC <code>ResultSet</code> behaves like an iterator (next() to move row by row)</li>
<li>Spring Data - <code>Page</code>/<code>Slice</code> results are often iterated similarly</li>
</ul>
`
        }
    ]
};
