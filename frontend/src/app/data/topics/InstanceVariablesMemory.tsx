import { Topic } from '../coreJava';

export const instanceVariablesMemory: Topic = {
    id: 'instance-variables-memory',
    name: 'Instance Variables',
    beginner: [
        {
            content: `<h3>What Is an Instance Variable?</h3>
An <strong>instance variable</strong> is a field declared inside a class (without the <code>static</code>
keyword) that belongs to each individual object. Every time you create a new object with <code>new</code>,
that object gets its own separate copy of every instance variable.`
        },
        {
            content: `<h3>Each Object Gets Its Own Copy</h3>
Unlike static variables, instance variables are NOT shared. Two objects of the same class have completely
independent values for their instance variables.`,
            codeExamples: [`public class Car {
    String color; // instance variable - one copy PER object
    int speed;

    Car(String color, int speed) {
        this.color = color;
        this.speed = speed;
    }

    public static void main(String[] args) {
        Car car1 = new Car("Red", 60);
        Car car2 = new Car("Blue", 80);

        System.out.println("car1: " + car1.color + ", " + car1.speed);
        System.out.println("car2: " + car2.color + ", " + car2.speed);
    }
}
// OUTPUT:
// car1: Red, 60
// car2: Blue, 80`]
        },
        {
            content: `<h3>Instance Variables Live on the Heap, Inside Their Object</h3>
Because instance variables belong to an object, and every object lives on the Heap, instance variables live
on the Heap too - as part of the object's memory block.`,
            codeExamples: [`public class HeapFieldDemo {
    int score; // stored inside the object on the Heap

    public static void main(String[] args) {
        HeapFieldDemo obj = new HeapFieldDemo(); // object (with its 'score' field) -> Heap
        obj.score = 100;                          // 'obj' reference itself -> Stack
        System.out.println("score = " + obj.score);
    }
}
// OUTPUT:
// score = 100`]
        },
        {
            content: `<h3>Instance Variables Get Default Values Automatically</h3>
If you don't explicitly assign a value, an instance variable is automatically set to a default (0, false,
null, etc.) - never left undefined.`,
            codeExamples: [`public class DefaultInstanceDemo {
    int quantity;      // defaults to 0
    boolean inStock;   // defaults to false
    String category;   // defaults to null

    public static void main(String[] args) {
        DefaultInstanceDemo item = new DefaultInstanceDemo();
        System.out.println("quantity=" + item.quantity + " inStock=" + item.inStock + " category=" + item.category);
    }
}
// OUTPUT:
// quantity=0 inStock=false category=null`]
        },
        {
            content: `<h3>Instance Variables Disappear With Their Object</h3>
An instance variable's lifetime is tied entirely to its object. Once nothing refers to the object anymore,
the object (and every instance variable inside it) becomes eligible for garbage collection.`,
            codeExamples: [`public class LifecycleDemo {
    int id;

    LifecycleDemo(int id) { this.id = id; }

    public static void main(String[] args) {
        LifecycleDemo obj = new LifecycleDemo(1);
        System.out.println("Before: " + obj.id);

        obj = null; // no reference left to the original object
        // the original object (and its 'id' field) is now eligible for GC
        System.out.println("Reference cleared");
    }
}
// OUTPUT:
// Before: 1
// Reference cleared`]
        }
    ],

    expert: [
        {
            content: `<h3>Memory Layout of Instance Variables Within an Object</h3>
Instance variables are laid out inside the object's memory block on the Heap, right after the object header
(mark word + klass pointer). The JVM (HotSpot) doesn't necessarily preserve declaration order - it commonly
reorders and groups fields by size (longs/doubles, then ints/floats, then shorts/chars, then
booleans/bytes, then references) to minimize padding and improve memory alignment, a technique called
<strong>field packing</strong>.`
        },
        {
            content: `<h3>Instance Variable Layout Diagram</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Heap: one Car object

+--------------------------------+
| Object Header (12-16 bytes)     |
|  Mark Word | Klass Pointer      |
+--------------------------------+
| Instance Fields (per-object)    |
|  int speed      = 60            |
|  String color -----------------> "Red" (separate object, own header)
+--------------------------------+
| Padding (align to 8 bytes)      |
+--------------------------------+

Another 'new Car(...)' produces an ENTIRELY separate block like this one,
with its own header and its own copy of speed/color.</pre>`
        },
        {
            content: `<h3>Instance vs Static: Where and How Long They Live</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Instance Variable</th><th>Static Variable</th></tr>
<tr class='text-center'><td>Memory area</td><td>Heap (inside the object)</td><td>Heap, attached to the Class object / Metaspace metadata</td></tr>
<tr class='text-center'><td>Copies</td><td>One per object</td><td>One per class</td></tr>
<tr class='text-center'><td>Created</td><td>On every <code>new</code> call</td><td>Once, at class loading</td></tr>
<tr class='text-center'><td>Reclaimed</td><td>When the object becomes unreachable (GC'd)</td><td>Only when the class is unloaded (rare)</td></tr>
<tr class='text-center'><td>Thread sharing</td><td>Shared only if the object itself is shared</td><td>Always shared across all threads</td></tr>
</table>`
        },
        {
            content: `<h3>Instance Fields and Garbage Collection Reachability</h3>
An instance variable's storage is only reclaimable once its owning object is unreachable - but a subtlety
often missed: if an instance variable itself references ANOTHER object, that inner object is kept alive too
(transitively), for as long as the outer object is reachable. This is why a single long-lived object with a
large collection as an instance variable can pin down a huge object graph in memory, even though most of
that graph "looks unrelated" to the leak at first glance.`
        },
        {
            content: `<h3>Common Bugs and Misconceptions</h3>
• <strong>Assuming instance variables are zeroed AFTER the constructor.</strong> They're zeroed BEFORE the
constructor body runs, as part of allocation - the constructor only overwrites the defaults you explicitly
set. <br>
• <strong>Believing field declaration order controls memory layout.</strong> The JVM is free to reorder
fields internally for alignment/packing; only the logical (source-code) view guarantees order, not the
physical memory layout. <br>
• <strong>Storing large objects as instance fields of a singleton/long-lived object</strong> and forgetting
they now live "forever" alongside it - a common accidental memory-leak pattern distinct from static leaks,
but with a similar root cause: an unexpectedly long-lived reference chain. <br>
• <strong>Confusing shadowing:</strong> a local variable or parameter with the same name as an instance
variable "hides" it inside a method unless accessed via <code>this.fieldName</code> - a frequent source of
subtle bugs in constructors.`,
            codeExamples: [`public class ShadowingBugDemo {
    int value;

    // BUG: parameter 'value' shadows the instance variable
    void setValueBuggy(int value) {
        value = value; // does nothing useful - assigns parameter to itself
    }

    void setValueFixed(int value) {
        this.value = value; // correctly assigns to the instance variable
    }

    public static void main(String[] args) {
        ShadowingBugDemo obj = new ShadowingBugDemo();
        obj.setValueBuggy(42);
        System.out.println("After buggy set: " + obj.value);

        obj.setValueFixed(42);
        System.out.println("After fixed set: " + obj.value);
    }
}
// OUTPUT:
// After buggy set: 0
// After fixed set: 42`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is an instance variable?</td><td>A non-static field declared in a class; each object created from that class gets its own independent copy</td></tr>
<tr><td>Where do instance variables live in memory?</td><td>On the Heap, stored inside the memory block of the object that owns them</td></tr>
<tr><td>When are instance variables created and destroyed?</td><td>Created each time <code>new</code> runs; destroyed (reclaimed) when the owning object becomes unreachable and is garbage collected</td></tr>
<tr><td>Do instance variables get default values automatically?</td><td>Yes - the JVM zeroes them during allocation, before the constructor body executes</td></tr>
<tr><td>Does the JVM preserve field declaration order in memory?</td><td>Not necessarily - HotSpot commonly reorders/packs fields by size to minimize padding, though the source-level view still shows declaration order</td></tr>
<tr><td>How do instance variables differ from static variables in lifetime?</td><td>Instance variables live and die with their specific object; static variables live for the lifetime of the class, independent of any single object</td></tr>
<tr><td>Can an instance variable cause a memory leak?</td><td>Yes, if it references a large object graph and the owning object itself is unexpectedly long-lived (e.g. held by a singleton or cache)</td></tr>
</table>`
        }
    ]
};
