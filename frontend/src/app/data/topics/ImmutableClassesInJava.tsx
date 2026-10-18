import { Topic } from '../coreJava';

export const immutableClassesInJava: Topic = {
    id: 'immutable-classes',
    name: 'Immutable Classes in Java',

    beginner: [
        {
            content: `<h4>What Does "Immutable" Mean?</h4>
<p>An <b>immutable object</b> is one whose observable state can <b>never change</b> after it is constructed. No method can modify its fields once <code>new</code> has finished running.</p>
<ul>
<li><code>String</code> is the most familiar example. Every "modifying" method like <code>concat()</code> returns a brand-new <code>String</code>.</li>
<li>Immutability is not automatic. A class has to be deliberately <b>designed</b> that way.</li>
</ul>`
        },
        {
            content: `<h4>Why Immutability Matters</h4>
<ul>
<li><b>Thread-safe by construction</b>: state never changes, so many threads can read the same object with no synchronization.</li>
<li><b>Safe as a HashMap/HashSet key</b>: its <code>hashCode()</code> never changes after insertion, so it cannot get lost in the wrong bucket.</li>
<li><b>Safe to share and cache</b>: no code can corrupt state that another part of the program relies on.</li>
<li><b>Easier to reason about</b>: the value is always what it was when constructed.</li>
</ul>`
        },
        {
            content: `<h4>The Recipe for a Truly Immutable Class</h4>
<ol>
<li>Declare the class <code>final</code> (a subclass cannot add mutable behavior or override a getter).</li>
<li>Make every field <code>private final</code>.</li>
<li>Provide no setters at all.</li>
<li>Initialize every field fully inside the constructor.</li>
<li>If a field is a <b>mutable type</b> (like a <code>List</code> or <code>Date</code>), <b>defensively copy it</b> when it comes IN through the constructor and when it goes OUT through a getter.</li>
</ol>`,
            codeExamples: [
                `public final class ImmutablePoint {
    private final int x;
    private final int y;

    public ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() { return x; }
    public int getY() { return y; }

    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}

public class Test {
    public static void main(String[] args) {
        ImmutablePoint p = new ImmutablePoint(3, 4);
        System.out.println(p);
        // p.x = 10;   // COMPILE ERROR: x has private access and is final
    }
}
// OUTPUT:
// (3, 4)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Defensive-Copy Bug - and the Fix</h3>
<p>Marking a field <code>final</code> only stops the <b>reference</b> from being reassigned. It does <b>not</b> stop the object it points to from being mutated. If a constructor just stores the caller's <code>List</code>, the caller can still change it from outside.</p>`,
            codeExamples: [
                `import java.util.*;

// BROKEN: looks immutable, but isn't
final class BrokenImmutablePerson {
    private final String name;
    private final List<String> hobbies;

    public BrokenImmutablePerson(String name, List<String> hobbies) {
        this.name = name;
        this.hobbies = hobbies; // BUG: stores the caller's own list directly
    }

    public List<String> getHobbies() { return hobbies; } // BUG: leaks the internal list

    public String toString() { return name + " likes " + hobbies; }
}

public class Test {
    public static void main(String[] args) {
        List<String> hobbies = new ArrayList<>(List.of("Chess"));
        BrokenImmutablePerson p = new BrokenImmutablePerson("Pankaj", hobbies);

        hobbies.add("Hacking");                 // mutate the ORIGINAL list from outside
        p.getHobbies().add("More Hacking");      // mutate THROUGH the getter too

        System.out.println(p); // "immutable" object changed after construction!
    }
}
// OUTPUT:
// Pankaj likes [Chess, Hacking, More Hacking]`
            ]
        },
        {
            content: `<h3>The Fix - Defensive Copy on the Way In AND Out</h3>
<p>Copy the mutable data in the constructor, so later changes to the caller's list cannot reach it. Copy it again in the getter, so a caller who changes the returned list cannot reach the internal state.</p>`,
            codeExamples: [
                `import java.util.*;

final class ImmutablePerson {
    private final String name;
    private final List<String> hobbies;

    public ImmutablePerson(String name, List<String> hobbies) {
        this.name = name;
        this.hobbies = new ArrayList<>(hobbies); // defensive copy IN
    }

    public List<String> getHobbies() {
        return new ArrayList<>(hobbies);          // defensive copy OUT
        // or: return Collections.unmodifiableList(hobbies);
    }

    public String toString() { return name + " likes " + hobbies; }
}

public class Test {
    public static void main(String[] args) {
        List<String> hobbies = new ArrayList<>(List.of("Chess"));
        ImmutablePerson p = new ImmutablePerson("Pankaj", hobbies);

        hobbies.add("Hacking");             // no longer affects p - it has its own copy
        p.getHobbies().add("More Hacking"); // also has no effect - getter returns a fresh copy

        System.out.println(p);
    }
}
// OUTPUT:
// Pankaj likes [Chess]`
            ]
        },
        {
            content: `<h3>Modern Alternatives That Are Immutable by Default</h3>
<ul>
<li><b><code>java.time</code></b> (<code>LocalDate</code>, <code>LocalDateTime</code>, <code>Duration</code>): every "modifying" method such as <code>plusDays()</code> returns a new instance, like <code>String</code>.</li>
<li><b>Records</b> (Java 16+): <code>record Point(int x, int y) {}</code> generates private final fields, a canonical constructor, accessors, and <code>equals()</code>/<code>hashCode()</code>/<code>toString()</code>. A mutable component (like a <code>List</code>) still needs a defensive copy in a compact constructor.</li>
</ul>`,
            codeExamples: [
                `import java.time.LocalDate;

public class Test {
    public static void main(String[] args) {
        LocalDate today = LocalDate.of(2026, 1, 1);
        LocalDate nextWeek = today.plusDays(7); // returns a NEW LocalDate

        System.out.println("today: " + today);
        System.out.println("nextWeek: " + nextWeek);
    }
}
// OUTPUT:
// today: 2026-01-01
// nextWeek: 2026-01-08`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the 5 steps to make a class truly immutable?</td><td>final class, private final fields, no setters, full initialization in the constructor, defensive copies of mutable fields in and out</td></tr>
<tr class='text-center'><td>Why is thread-safety a benefit of immutability?</td><td>Since state can never change after construction, concurrent reads from multiple threads need no synchronization at all</td></tr>
<tr class='text-center'><td>Does marking a field final make it immutable?</td><td>Only the reference is fixed - if the field points to a mutable object (like a List), that object's contents can still change unless defensively copied</td></tr>
<tr class='text-center'><td>Why declare the class itself final?</td><td>To stop a subclass from overriding a getter/adding mutator methods that would break the immutability guarantee</td></tr>
<tr class='text-center'><td>Are Java records immutable by default?</td><td>Yes for the record's own fields, but a mutable component (like a List) still needs a defensive copy in a compact constructor</td></tr>
</table>`
        }
    ]
};
