import { Topic } from '../coreJava';

export const compositePattern: Topic = {
    id: 'composite-pattern',
    name: 'Composite Pattern',
    beginner: [
        {
            content: `
<h4>Real-Life Example:</h4>
<p>
Think of your computer's <b>file system</b>. A folder can contain files, and
it can also contain other folders (which in turn contain more files and
folders). Whether you are looking at a single file or an entire folder tree,
you can perform the same operations on it — open, delete, get size, copy.
Similarly, a <b>company org chart</b> has individual employees and managers
who themselves manage a group of employees, but both are treated uniformly
as "an employee" for payroll purposes.
</p>
<ul>
<li>File system: files and folders</li>
<li>Company org chart: employee and manager (who is also an employee)</li>
<li>A drawing app: a shape can be a single circle, or a group of shapes</li>
</ul>
`
        },
        {
            content: `
<h4>Why do we need Composite Pattern?</h4>
<p>
Without Composite, client code would need to constantly check "is this a
single item, or a collection of items?" and write separate handling for
each case. The Composite Pattern lets clients treat <b>individual objects
and compositions of objects uniformly</b>, by making both implement the same
component interface — recursion does the rest.
</p>
<ul>
<li>Treat individual objects and groups of objects the same way</li>
<li>Represent part-whole hierarchies (tree structures) naturally</li>
<li>Client code becomes simpler — no need for type checks/instanceof</li>
</ul>
`
        },
        {
            content: `
<h4>Basic Structure:</h4>
<ul>
<li><b>Component</b> — common interface for leaf and composite (e.g. <code>getSize()</code>)</li>
<li><b>Leaf</b> — a simple object with no children (e.g. File)</li>
<li><b>Composite</b> — an object that can hold children, which can themselves be Leaf or Composite (e.g. Folder)</li>
</ul>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
FileSystemComponent (interface)
      |
      +-- File (Leaf)
      |
      +-- Folder (Composite) --> contains list of FileSystemComponent
                                  (Files and/or other Folders)
</pre>
`
        },
        {
            content: `
<h4>Example: File System Tree</h4>
`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

// Component
interface FileSystemComponent {
    void showDetails(String indent);
    long getSize();
}

// Leaf
class File implements FileSystemComponent {
    private final String name;
    private final long size;

    public File(String name, long size) {
        this.name = name;
        this.size = size;
    }

    public void showDetails(String indent) {
        System.out.println(indent + "File: " + name + " (" + size + " KB)");
    }

    public long getSize() {
        return size;
    }
}

// Composite
class Folder implements FileSystemComponent {
    private final String name;
    private final List<FileSystemComponent> children = new ArrayList<>();

    public Folder(String name) {
        this.name = name;
    }

    public void add(FileSystemComponent component) {
        children.add(component);
    }

    public void showDetails(String indent) {
        System.out.println(indent + "Folder: " + name);
        for (FileSystemComponent child : children) {
            child.showDetails(indent + "  "); // recursion
        }
    }

    public long getSize() {
        long total = 0;
        for (FileSystemComponent child : children) {
            total += child.getSize(); // recursion
        }
        return total;
    }
}

// Client
public class Test {
    public static void main(String[] args) {
        Folder root = new Folder("root");
        File resume = new File("resume.pdf", 200);
        Folder photos = new Folder("photos");
        photos.add(new File("photo1.jpg", 1500));
        photos.add(new File("photo2.jpg", 1800));

        root.add(resume);
        root.add(photos);

        root.showDetails("");
        System.out.println("Total size: " + root.getSize() + " KB");
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Real World Java Usage: javax.swing.JComponent</h3>
<p>
Swing's GUI hierarchy is a classic Composite. A <code>JPanel</code> (which
is itself a <code>JComponent</code>) can contain other <code>JComponent</code>
objects — buttons, labels, or more panels — and operations like
<code>paint()</code>, <code>setEnabled()</code>, and <code>revalidate()</code>
are applied recursively down the tree, exactly like the file system example.
</p>
`,
            codeExamples: [
                `import javax.swing.*;
import java.awt.*;

public class SwingCompositeDemo {
    public static void main(String[] args) {
        JFrame frame = new JFrame("Composite Demo");

        // JPanel (Composite) containing JButton and JLabel (Leaves)
        JPanel panel = new JPanel();
        panel.add(new JButton("Click Me"));
        panel.add(new JLabel("Hello"));

        // Nested composite: a panel inside a panel
        JPanel innerPanel = new JPanel();
        innerPanel.add(new JButton("Inner Button"));
        panel.add(innerPanel);

        frame.add(panel);
        frame.setSize(300, 200);
        frame.setVisible(true);
        // frame.setEnabled(false) would disable this component and,
        // depending on implementation, cascade to children too.
    }
}`
            ]
        },
        {
            content: `
<h3>Recursion in Composite Operations</h3>
<p>
Every meaningful operation on a Composite (size, count, render, validate)
is naturally implemented using <b>recursion</b>: the Composite delegates the
operation to each child, and if that child is itself a Composite, it repeats
the same delegation. This is what allows uniform treatment of Leaf and
Composite — the client calls one method, and the tree does the rest.
</p>

<h4>Safe Composite vs Transparent Composite</h4>
<ul>
<li><b>Transparent Composite</b> — child-management methods
(<code>add()</code>, <code>remove()</code>) are declared on the Component
interface itself, so Leaf must also implement them (often throwing
<code>UnsupportedOperationException</code>). Simpler for the client, but
less type-safe.</li>
<li><b>Safe Composite</b> — child-management methods are declared only on
the Composite class, not on Component. Type-safe (Leaf can't be misused),
but the client must check the type before calling <code>add()</code>.</li>
</ul>
`
        },
        {
            content: `
<h3>Performance Considerations with Deep Trees</h3>
<p>
Composite makes recursive traversal elegant, but deep or very large trees
can cause real problems:
</p>
<ul>
<li><b>Stack overflow</b> — extremely deep hierarchies (e.g. thousands of
nested folders) can blow the call stack during recursive traversal; an
iterative traversal with an explicit stack/queue may be needed.</li>
<li><b>Repeated computation</b> — operations like <code>getSize()</code>
recompute the whole subtree every call; for frequently-read aggregates,
cache the result and invalidate on structural changes.</li>
<li><b>Memory overhead</b> — every node stores a list of children plus
object overhead; for millions of leaf nodes this can be significant compared
to a flat data structure.</li>
</ul>

<h4>Common Mistakes</h4>
<ul>
<li>Adding a Composite as its own (direct or indirect) child, creating a
cycle — recursive operations then loop forever.</li>
<li>Putting too much unrelated behavior into the Component interface,
forcing Leaf classes to implement irrelevant methods.</li>
<li>Not documenting whether <code>add()</code>/<code>remove()</code> are
supported on Leaf — leads to runtime surprises.</li>
</ul>

<h4>When NOT to use Composite</h4>
<ul>
<li>When the structure is genuinely flat (no nesting) — a simple List is
enough, Composite adds needless abstraction.</li>
<li>When leaf and composite nodes need very different operations that
cannot be meaningfully unified behind one interface.</li>
</ul>
`
        }
    ]
};
