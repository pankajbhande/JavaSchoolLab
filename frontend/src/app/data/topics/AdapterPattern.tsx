import { Topic } from '../coreJava';

export const adapterPattern: Topic = {
    id: 'adapter-pattern',
    name: 'Adapter Pattern',
    beginner: [
        {
            content: `
<h4>Real-Life Example:</h4>
<p>
Think of a <b>travel power plug adapter</b>. Your laptop charger has a US-style
plug, but the socket in India is a different shape. You do not redesign your
charger — you plug it into an <b>adapter</b> that converts the US plug shape
into an Indian socket shape. The charger and the socket were never designed
to work together, and the adapter bridges the gap.
</p>
<ul>
<li>Mobile charger + travel adapter</li>
<li>Memory card + card reader (USB adapter)</li>
<li>Translator between two people who speak different languages</li>
</ul>
`
        },
        {
            content: `
<h4>Why do we need Adapter Pattern?</h4>
<p>
In software, we often have an <b>existing class</b> (legacy code, a third-party
library) whose interface does not match what our client code expects.
Rewriting the existing class is risky or impossible (we may not even own the
source code). The Adapter Pattern lets us <b>convert one interface into
another</b> that the client expects, without touching the original class.
</p>
<ul>
<li>Reuse existing/legacy classes without modifying them</li>
<li>Make incompatible interfaces work together</li>
<li>Integrate third-party libraries with your own code</li>
</ul>
`
        },
        {
            content: `
<h4>Basic Structure:</h4>
<ul>
<li><b>Target</b> — the interface the client expects</li>
<li><b>Adaptee</b> — the existing incompatible class</li>
<li><b>Adapter</b> — implements Target, internally calls Adaptee</li>
<li><b>Client</b> — uses Target interface only</li>
</ul>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Client --> Target (interface)
                 ^
                 |
             Adapter -----> Adaptee (existing class)
</pre>
`
        },
        {
            content: `
<h4>Example: Adapting a legacy XML provider to a new JSON interface</h4>
<p>
Suppose your application has a legacy class <code>XmlDataProvider</code> that
only returns XML. Your new code base is written against a
<code>JsonDataProvider</code> interface. Instead of rewriting the legacy
class, we write an <code>XmlToJsonAdapter</code> that implements
<code>JsonDataProvider</code> and internally delegates to
<code>XmlDataProvider</code>.
</p>
`,
            codeExamples: [
                `// Existing legacy class (Adaptee) - we cannot/should not modify it
class XmlDataProvider {
    public String getXmlData() {
        return "<data><name>Pankaj</name><age>28</age></data>";
    }
}

// Target interface expected by new client code
interface JsonDataProvider {
    String getJsonData();
}

// Adapter: implements Target, wraps Adaptee
class XmlToJsonAdapter implements JsonDataProvider {

    private final XmlDataProvider xmlDataProvider;

    public XmlToJsonAdapter(XmlDataProvider xmlDataProvider) {
        this.xmlDataProvider = xmlDataProvider;
    }

    @Override
    public String getJsonData() {
        String xml = xmlDataProvider.getXmlData();
        // In real code use a proper XML->JSON converter library
        return "{ \\"convertedFrom\\": \\"xml\\", \\"raw\\": \\"" + xml + "\\" }";
    }
}

// Client only knows about JsonDataProvider
public class Test {
    public static void main(String[] args) {
        JsonDataProvider provider = new XmlToJsonAdapter(new XmlDataProvider());
        System.out.println(provider.getJsonData());
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Class Adapter vs Object Adapter</h3>
<p>
There are two ways to implement Adapter in Java.
</p>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Type</th>
<th>How it works</th>
<th>Java support</th>
</tr>
<tr>
<td>Class Adapter</td>
<td>Adapter extends Adaptee and implements Target (uses inheritance)</td>
<td>Extends the Adaptee CLASS while implementing the Target INTERFACE. The real limitation is that it binds to one concrete Adaptee, since Java has no multiple class inheritance</td>
</tr>
<tr>
<td>Object Adapter</td>
<td>Adapter holds a reference (composition) to Adaptee and implements Target</td>
<td>Most common approach in Java, more flexible</td>
</tr>
</table>
`,
            codeExamples: [
                `// Class Adapter style (only works because Adaptee is an interface here,
// Java does not allow extending two classes)
interface LegacyPrinter {
    void printOld(String text);
}

interface ModernPrinter {
    void print(String text);
}

class LegacyPrinterImpl implements LegacyPrinter {
    public void printOld(String text) {
        System.out.println("Legacy print: " + text);
    }
}

// Class Adapter: extends the concrete legacy class, implements the target interface
class ClassAdapter extends LegacyPrinterImpl implements ModernPrinter {
    public void print(String text) {
        printOld(text); // inherited method
    }
}`
            ]
        },
        {
            content: `
<h3>Real World Java Usage</h3>
<ul>
<li><code>java.util.Arrays.asList()</code> — adapts an array into a
<code>List</code> interface, so array code can be used wherever a List is
expected.</li>
<li><code>InputStreamReader</code> — adapts a byte-oriented
<code>InputStream</code> into a character-oriented <code>Reader</code>.</li>
<li><code>OutputStreamWriter</code> — adapts an <code>OutputStream</code>
into a <code>Writer</code>.</li>
<li><code>Collections.list()</code> / <code>Collections.enumeration()</code>
— adapt between <code>Enumeration</code> (legacy) and <code>List</code>.</li>
</ul>
`,
            codeExamples: [
                `import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;

public class RealWorldAdapterDemo {
    public static void main(String[] args) throws IOException {
        // InputStream (byte stream) adapted to Reader (character stream)
        InputStreamReader reader = new InputStreamReader(new FileInputStream("data.txt"));
        BufferedReader bufferedReader = new BufferedReader(reader);
        String line;
        while ((line = bufferedReader.readLine()) != null) {
            System.out.println(line);
        }
        bufferedReader.close();
    }
}`
            ]
        },
        {
            content: `
<h3>Two-Way Adapter and Pluggable Adapters</h3>
<p>
A <b>two-way adapter</b> implements both interfaces so it can be used
wherever either the Target or the Adaptee is expected — useful during a
gradual migration from an old interface to a new one. A
<b>pluggable adapter</b> supports multiple, unrelated Adaptee classes by
using composition + configuration (e.g. Function references) instead of a
fixed Adaptee type.
</p>

<h4>Common Mistakes</h4>
<ul>
<li>Putting business logic inside the Adapter — it should only translate
calls, not add behavior.</li>
<li>Creating an Adapter when you could simply modify the Adaptee (only use
Adapter when you cannot or should not change the existing class).</li>
<li>Overusing Adapter chains — too many adapters wrapping adapters hurts
readability and debuggability.</li>
</ul>

<h4>When NOT to use Adapter</h4>
<ul>
<li>When you own both the client and the existing class — just change the
existing class's interface directly.</li>
<li>When interfaces are already compatible — Adapter adds needless
indirection.</li>
</ul>
`
        },
        {
            content: `
<h3>Adapter vs Facade vs Decorator</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Pattern</th>
<th>Purpose</th>
<th>Interface Change?</th>
</tr>
<tr>
<td>Adapter</td>
<td>Converts one existing interface into another expected interface</td>
<td>Yes — changes the interface</td>
</tr>
<tr>
<td>Facade</td>
<td>Provides a new, simpler interface over a complex subsystem</td>
<td>Yes, but simplifies rather than converts</td>
</tr>
<tr>
<td>Decorator</td>
<td>Adds new behavior while keeping the same interface</td>
<td>No — interface stays the same</td>
</tr>
</table>
`
        }
    ]
};
