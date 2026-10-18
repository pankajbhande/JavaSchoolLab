import { Topic } from '../coreJava';

export const proxyPattern: Topic = {
    id: 'proxy-pattern',
    name: 'Proxy Pattern',
    beginner: [
        {
            content: `
<h4>Real-Life Example:</h4>
<p>
Think of a <b>credit card</b> as a proxy for your bank account. When you pay
with a credit card, you are not handing over your actual bank account — the
card acts as a stand-in that controls and validates access to the real
account (checking limits, authorizing the transaction) before forwarding the
request to the bank.
</p>
<ul>
<li>Credit card as proxy for a bank account</li>
<li>A receptionist controlling access to a company's employees</li>
<li>A cheque acting as a proxy for cash in your account</li>
</ul>
`
        },
        {
            content: `
<h4>Why do we need Proxy Pattern?</h4>
<p>
Sometimes we want to control access to an object — because creating the real
object is expensive (large image, remote resource), or because we need extra
checks (security, logging) before allowing access. The Proxy Pattern
provides a <b>surrogate/placeholder</b> object that implements the same
interface as the real object, and controls access to it.
</p>
<ul>
<li>Delay expensive object creation until actually needed (lazy loading)</li>
<li>Add access control / security checks</li>
<li>Add logging, caching, or other cross-cutting behavior transparently</li>
</ul>
`
        },
        {
            content: `
<h4>Basic Structure:</h4>
<ul>
<li><b>Subject</b> — common interface for RealSubject and Proxy</li>
<li><b>RealSubject</b> — the actual object doing the real work</li>
<li><b>Proxy</b> — implements Subject, holds a reference to RealSubject, controls access to it</li>
</ul>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Client --> Image (interface)
                ^
                |
          ProxyImage -----> RealImage (created only when needed)
</pre>
`
        },
        {
            content: `
<h4>Example: Lazy-loading Image Proxy</h4>
`,
            codeExamples: [
                `// Subject
interface Image {
    void display();
}

// RealSubject - expensive to create
class RealImage implements Image {
    private final String fileName;

    public RealImage(String fileName) {
        this.fileName = fileName;
        loadFromDisk(); // expensive operation
    }

    private void loadFromDisk() {
        System.out.println("Loading image from disk: " + fileName);
    }

    public void display() {
        System.out.println("Displaying: " + fileName);
    }
}

// Proxy - controls creation of RealImage
class ProxyImage implements Image {
    private RealImage realImage;
    private final String fileName;

    public ProxyImage(String fileName) {
        this.fileName = fileName;
    }

    public void display() {
        if (realImage == null) {
            realImage = new RealImage(fileName); // created only when first needed
        }
        realImage.display();
    }
}

// Client
public class Test {
    public static void main(String[] args) {
        Image image = new ProxyImage("photo.jpg");

        System.out.println("Image object created, but not loaded yet.");
        image.display(); // loads and displays now
        image.display(); // already loaded, displays directly
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Types of Proxy</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Type</th>
<th>Purpose</th>
<th>Example</th>
</tr>
<tr>
<td>Virtual Proxy</td>
<td>Delays creation of an expensive object until needed</td>
<td>ProxyImage lazy loading</td>
</tr>
<tr>
<td>Protection Proxy</td>
<td>Controls access based on permissions</td>
<td>Admin-only document editor proxy</td>
</tr>
<tr>
<td>Remote Proxy</td>
<td>Represents an object that lives in a different address space/server</td>
<td>Java RMI stubs</td>
</tr>
<tr>
<td>Caching Proxy</td>
<td>Caches results of expensive operations</td>
<td>Proxy in front of a slow web service call</td>
</tr>
</table>
`,
            codeExamples: [
                `// Protection Proxy example
interface Document {
    void edit();
}

class RealDocument implements Document {
    public void edit() {
        System.out.println("Document edited");
    }
}

class ProtectedDocumentProxy implements Document {
    private final RealDocument realDocument = new RealDocument();
    private final String userRole;

    public ProtectedDocumentProxy(String userRole) {
        this.userRole = userRole;
    }

    public void edit() {
        if (!"ADMIN".equals(userRole)) {
            throw new SecurityException("Access Denied: only ADMIN can edit");
        }
        realDocument.edit();
    }
}`
            ]
        },
        {
            content: `
<h3>java.lang.reflect.Proxy - Dynamic Proxies</h3>
<p>
Java provides built-in support for creating proxy objects at runtime using
<code>java.lang.reflect.Proxy</code>. Instead of writing a proxy class by
hand for every interface, we implement an <code>InvocationHandler</code> and
let the JDK generate the proxy class dynamically. This is exactly how many
frameworks (Spring AOP, Hibernate lazy loading, mocking libraries) implement
their proxy behavior.
</p>
`,
            codeExamples: [
                `import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

interface Greeting {
    void sayHello(String name);
}

class GreetingImpl implements Greeting {
    public void sayHello(String name) {
        System.out.println("Hello, " + name);
    }
}

class LoggingInvocationHandler implements InvocationHandler {
    private final Object target;

    public LoggingInvocationHandler(Object target) {
        this.target = target;
    }

    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("Before calling: " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("After calling: " + method.getName());
        return result;
    }
}

public class DynamicProxyDemo {
    public static void main(String[] args) {
        Greeting realGreeting = new GreetingImpl();

        Greeting proxy = (Greeting) Proxy.newProxyInstance(
            Greeting.class.getClassLoader(),
            new Class[] { Greeting.class },
            new LoggingInvocationHandler(realGreeting)
        );

        proxy.sayHello("Pankaj");
    }
}`
            ]
        },
        {
            content: `
<h3>Spring AOP Proxies</h3>
<p>
Spring's AOP module (<code>@Transactional</code>, <code>@Cacheable</code>,
custom <code>@Aspect</code> advice) works by wrapping your bean in a proxy at
runtime — either a JDK dynamic proxy (if your bean implements an interface)
or a CGLIB subclass proxy (if it doesn't). When you call a method on the
bean, you are actually calling the proxy first, which runs the advice
(start transaction, check cache, log) and then delegates to the real method.
This is the same Virtual/Protection proxy idea applied as a cross-cutting
framework feature.
</p>

<h4>Common Mistakes</h4>
<ul>
<li>Calling a <code>@Transactional</code>/<code>@Cacheable</code> method from
<b>within the same class</b> — the call bypasses the Spring proxy entirely,
so the advice never runs (a classic Spring AOP proxy pitfall).</li>
<li>Making the Proxy do too much business logic — it should only control
access/add cross-cutting behavior, and delegate the real work to the
RealSubject.</li>
<li>Forgetting to keep the Proxy and RealSubject implementing the exact same
interface — breaks substitutability for the client.</li>
</ul>
`
        },
        {
            content: `
<h3>Proxy vs Decorator</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Proxy</th>
<th>Decorator</th>
</tr>
<tr>
<td>Intent</td>
<td>Control access to an object (security, lazy load, remote)</td>
<td>Add new behavior/responsibility to an object</td>
</tr>
<tr>
<td>Who creates the wrapped object</td>
<td>Often the Proxy itself decides when/if to create the RealSubject</td>
<td>Client explicitly constructs and passes in the wrapped object</td>
</tr>
<tr>
<td>Stacking</td>
<td>Usually a single proxy layer</td>
<td>Multiple decorators commonly stacked together</td>
</tr>
</table>

<h4>When NOT to use Proxy</h4>
<ul>
<li>When direct access to the real object is cheap and there is no need for
access control, laziness, or cross-cutting behavior.</li>
<li>When it only adds an extra layer of indirection with no real benefit —
increases debugging complexity (stack traces go through the proxy).</li>
</ul>
`
        }
    ]
};
