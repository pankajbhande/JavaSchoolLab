import { Topic } from '../coreJava';

export const flyweightPattern: Topic = {
    id: 'flyweight-pattern',
    name: 'Flyweight Pattern',
    beginner: [
        {
            content: `
<h4>Real-Life Example:</h4>
<p>
Think of a <b>text editor</b> displaying a document with thousands of
characters. Each character on screen needs a font, size, and style — but
instead of storing a full separate font object for every single character
instance, the editor shares one font object across all characters that use
the same font/style, and only stores the character itself and its position
separately. This drastically saves memory when the same data repeats many
times.
</p>
<ul>
<li>Characters in a text editor sharing font/style data</li>
<li>Trees in a forest simulation sharing the same species/texture data</li>
<li>Billiard balls in a game sharing the same color/texture per type</li>
</ul>
`
        },
        {
            content: `
<h4>Why do we need Flyweight Pattern?</h4>
<p>
When an application needs to create a huge number of similar objects,
creating a full independent object for each one wastes memory. The Flyweight
Pattern splits an object's state into two parts:
</p>
<ul>
<li><b>Intrinsic state</b> — shared, unchanging data (e.g. tree texture,
color, shape) — stored once and reused</li>
<li><b>Extrinsic state</b> — unique, context-specific data (e.g. tree's x/y
position) — passed in from outside and not stored in the shared object</li>
</ul>
<p>
A <b>Flyweight Factory</b> ensures shared objects are created only once and
reused for every request with the same intrinsic state.
</p>
`
        },
        {
            content: `
<h4>Basic Structure:</h4>
<ul>
<li><b>Flyweight</b> — interface/class holding intrinsic (shared) state</li>
<li><b>ConcreteFlyweight</b> — actual shared object (e.g. TreeType)</li>
<li><b>FlyweightFactory</b> — creates and caches flyweights, returns existing ones when available</li>
<li><b>Client/Context</b> — stores extrinsic state and references a shared flyweight (e.g. Tree)</li>
</ul>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Tree (x, y)  ---uses--->  TreeType (name, color, texture)  [SHARED]
Tree (x, y)  ---uses--->  TreeType (name, color, texture)  [same instance]
Tree (x, y)  ---uses--->  TreeType (name, color, texture)  [same instance]

TreeFactory caches one TreeType per unique (name, color, texture) combo
</pre>
`
        },
        {
            content: `
<h4>Example: Forest Simulation with Shared Tree Types</h4>
`,
            codeExamples: [
                `import java.util.HashMap;
import java.util.Map;

// Flyweight: intrinsic (shared) state
class TreeType {
    private final String name;
    private final String color;
    private final String texture;

    public TreeType(String name, String color, String texture) {
        this.name = name;
        this.color = color;
        this.texture = texture;
    }

    public void draw(int x, int y) {
        System.out.println("Drawing " + name + " tree (" + color + ") at (" + x + "," + y + ")");
    }
}

// FlyweightFactory: caches and reuses TreeType objects
class TreeFactory {
    private static final Map<String, TreeType> treeTypes = new HashMap<>();

    public static TreeType getTreeType(String name, String color, String texture) {
        String key = name + "-" + color + "-" + texture;
        TreeType type = treeTypes.get(key);
        if (type == null) {
            type = new TreeType(name, color, texture);
            treeTypes.put(key, type);
            System.out.println("Created new TreeType: " + key);
        }
        return type;
    }
}

// Context: holds extrinsic state (position) + reference to shared flyweight
class Tree {
    private final int x, y;
    private final TreeType type; // shared

    public Tree(int x, int y, TreeType type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public void draw() {
        type.draw(x, y);
    }
}

// Client
public class Test {
    public static void main(String[] args) {
        Tree tree1 = new Tree(10, 20, TreeFactory.getTreeType("Oak", "Green", "OakTexture"));
        Tree tree2 = new Tree(30, 40, TreeFactory.getTreeType("Oak", "Green", "OakTexture"));
        Tree tree3 = new Tree(50, 60, TreeFactory.getTreeType("Pine", "DarkGreen", "PineTexture"));

        tree1.draw();
        tree2.draw(); // reuses the same TreeType object as tree1
        tree3.draw();
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Real World Java Usage: Integer.valueOf() Caching</h3>
<p>
Java's own <code>Integer</code> class implements Flyweight internally.
<code>Integer.valueOf(int)</code> (used by autoboxing) caches and reuses
<code>Integer</code> objects for values from <code>-128</code> to
<code>127</code>, instead of creating a new object every time. This range is
configurable via <code>-XX:AutoBoxCacheMax</code>, but defaults to -128..127
per the JLS.
</p>
`,
            codeExamples: [
                `public class IntegerFlyweightDemo {
    public static void main(String[] args) {
        Integer a = 100;
        Integer b = 100;
        System.out.println(a == b); // true - both point to the SAME cached Integer object

        Integer c = 200;
        Integer d = 200;
        System.out.println(c == d); // false - outside cache range, new objects created

        // Same idea, explicit
        Integer e = Integer.valueOf(50);
        Integer f = Integer.valueOf(50);
        System.out.println(e == f); // true - shared flyweight from IntegerCache
    }
}`
            ]
        },
        {
            content: `
<h3>String Pool as a Flyweight</h3>
<p>
The Java <b>String Constant Pool</b> is another built-in Flyweight
implementation. String literals with the same content are stored once in
the pool and shared across the entire JVM, since Strings are immutable and
therefore safe to share.
</p>
`,
            codeExamples: [
                `public class StringPoolFlyweightDemo {
    public static void main(String[] args) {
        String s1 = "hello";
        String s2 = "hello";
        System.out.println(s1 == s2); // true - both reference the same pooled String

        String s3 = new String("hello"); // forces a new object, bypasses the pool
        System.out.println(s1 == s3); // false

        String s4 = s3.intern(); // explicitly pull into (or fetch from) the pool
        System.out.println(s1 == s4); // true
    }
}`
            ]
        },
        {
            content: `
<h3>Intrinsic vs Extrinsic State - Getting It Right</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>State type</th>
<th>Stored where</th>
<th>Example</th>
</tr>
<tr>
<td>Intrinsic (shared)</td>
<td>Inside the Flyweight object itself</td>
<td>Tree species, texture, base color</td>
</tr>
<tr>
<td>Extrinsic (unique)</td>
<td>Outside the Flyweight, in the Context object, passed in per call</td>
<td>Tree's x/y coordinates, individual growth stage</td>
</tr>
</table>

<h4>Memory Savings vs Complexity Tradeoff</h4>
<ul>
<li>Flyweight pays off when the number of objects is very large and much of
their state is duplicated (thousands/millions of similar objects).</li>
<li>It adds real complexity: state must be split carefully, the factory
needs a thread-safe cache, and objects become effectively immutable (shared
state cannot be mutated by one context without affecting all others).</li>
<li>For a small number of objects, the bookkeeping overhead of Flyweight
outweighs the memory it saves.</li>
</ul>
`
        },
        {
            content: `
<h4>Common Mistakes</h4>
<ul>
<li>Storing extrinsic (context-specific) state inside the shared Flyweight
object — breaks sharing, since one context's data would leak into another's.</li>
<li>Making the Flyweight mutable — since it is shared, any mutation affects
every context using it; Flyweights should be immutable.</li>
<li>Not using a thread-safe cache in the FlyweightFactory in multi-threaded
applications — can create duplicate objects or race conditions.</li>
<li>Applying Flyweight when object count is small — added complexity with no
real memory benefit.</li>
</ul>

<h4>When NOT to use Flyweight</h4>
<ul>
<li>When objects don't share significant state, or each object is already
lightweight.</li>
<li>When object count is small enough that memory isn't a real concern.</li>
<li>When state cannot be cleanly separated into intrinsic vs extrinsic
without excessive complexity.</li>
</ul>
`
        }
    ]
};
