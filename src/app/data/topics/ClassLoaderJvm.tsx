import { Topic } from '../coreJava';

export const classLoaderJvm: Topic = {
    id: 'class-loader-jvm',
    name: 'Class Loader',
    beginner: [
        {
            content: `<h3>What is a Class Loader?</h3>
Before Java code can run, the JVM must load your <code>.class</code> files into memory. The <strong>Class Loader</strong>
is the part of the JVM responsible for finding those <code>.class</code> files, reading their bytecode, and making
them usable by the running program. <br><br>
Without a class loader, the JVM would have no way to turn a compiled <code>.class</code> file sitting on disk into
an actual, usable class inside a running program.`
        },
        {
            content: `<h3>The Three Built-in Class Loaders</h3>
Java ships with three class loaders, arranged in a hierarchy: <br><br>
• <strong>Bootstrap Class Loader</strong> - loads core Java classes like <code>java.lang.String</code> and
<code>java.lang.Object</code> from the JDK's own libraries. Written in native code, not Java. <br>
• <strong>Extension (Platform) Class Loader</strong> - loads classes from Java's extension/platform libraries. <br>
• <strong>Application (System) Class Loader</strong> - loads the classes <em>you</em> write, from your project's
classpath. This is the one that loads your own <code>Main.class</code>, for example.`
        },
        {
            content: `<h3>A Simple Example</h3>
When you run a Java program, the Application Class Loader is the one that loads your class first.`,
            codeExamples: [`public class ClassLoaderDemo {
    public static void main(String[] args) {
        ClassLoader loader = ClassLoaderDemo.class.getClassLoader();
        System.out.println("Loaded by: " + loader);
    }
}
// OUTPUT:
// Loaded by: jdk.internal.loader.ClassLoaders$AppClassLoader@...`]
        },
        {
            content: `<h3>Loading, Linking, and Initialization</h3>
Getting a class ready to use is not a single step - the JVM does three things in order: <br><br>
• <strong>Loading</strong> - the class loader reads the <code>.class</code> file bytes and creates a
<code>Class</code> object in memory. <br>
• <strong>Linking</strong> - the JVM verifies the bytecode is valid, allocates memory for static fields, and
resolves references to other classes. <br>
• <strong>Initialization</strong> - static initializer blocks and static variable assignments actually run.`
        },
        {
            content: `<h3>The Delegation Model (Simple View)</h3>
When a class needs to be loaded, the Application Class Loader does not just load it immediately - it first asks
its parent (Extension Class Loader), which in turn asks its parent (Bootstrap Class Loader). <br><br>
Only if none of the parents can find the class does the child actually load it itself. This is called the
<strong>parent delegation model</strong>, and it stops you from accidentally overriding core classes like
<code>java.lang.String</code> with your own version.`
        },
        {
            content: `<h3>ClassNotFoundException vs NoClassDefFoundError</h3>
These two errors sound similar but happen for different reasons: <br><br>
• <strong>ClassNotFoundException</strong> - thrown when code explicitly asks to load a class by name (e.g.
<code>Class.forName("com.example.Foo")</code>) and it cannot be found on the classpath. <br>
• <strong>NoClassDefFoundError</strong> - thrown when a class was available at compile time, but is missing at
runtime when the JVM tries to use it (for example, a JAR was removed after compiling).`
        }
    ],

    expert: [
        {
            content: `<h3>Custom Class Loaders</h3>
Beyond the three built-in loaders, Java lets you write your own by extending <code>ClassLoader</code> and
overriding <code>findClass()</code>. Custom class loaders are used to: <br>
• Load classes from non-standard sources (a database, a network location, an encrypted JAR). <br>
• Implement plugin systems where each plugin gets its own isolated loader (used by application servers and IDEs
like Eclipse's OSGi). <br>
• Enable hot-reloading of classes without restarting the JVM.`,
            codeExamples: [`public class MyClassLoader extends ClassLoader {

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] classBytes = loadClassBytesSomehow(name); // e.g. read from disk/network
        if (classBytes == null) {
            throw new ClassNotFoundException(name);
        }
        return defineClass(name, classBytes, 0, classBytes.length);
    }

    private byte[] loadClassBytesSomehow(String name) {
        // custom byte-loading logic goes here
        return null;
    }
}`]
        },
        {
            content: `<h3>The Delegation Model, In Detail</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        Bootstrap ClassLoader   (loads java.lang.*, native, no parent)
                 ^
                 | parent
        Extension/Platform ClassLoader   (loads javax.*, JDK extensions)
                 ^
                 | parent
        Application/System ClassLoader   (loads your classpath, e.g. com.myapp.*)
                 ^
                 | parent
        Custom ClassLoader (optional, e.g. a plugin loader)</pre>
Request flow for loading a class: the request always travels <strong>up</strong> to Bootstrap first, and only if
every ancestor fails to find the class does control fall back <strong>down</strong> to the loader that was
originally asked. This is why it's called delegation - each loader delegates upward before trying itself.`
        },
        {
            content: `<h3>Why Delegation Matters: Preventing Class Spoofing</h3>
Imagine an attacker packages their own <code>java.lang.String</code> class inside a malicious JAR, hoping to
replace the trusted one and intercept string operations. Because of parent delegation, when anything asks for
<code>java.lang.String</code>, the request bubbles up to the Bootstrap Class Loader first - which always finds
the genuine JDK version before the Application Class Loader ever gets a chance to load the fake one. <br><br>
This protection is why user code cannot easily shadow <code>java.*</code> packages - it's a core part of the
JVM's security model, not an accident.`
        },
        {
            content: `<h3>Namespace Isolation and "Same Class, Different Loader" Problem</h3>
A class is uniquely identified in the JVM not just by its fully qualified name, but by the combination of
<strong>(class name, class loader)</strong>. This means the exact same <code>.class</code> file, loaded by two
different class loaders, produces two distinct <code>Class</code> objects that are <strong>not</strong> equal and
cannot be cast to each other - even though the source code is identical. <br><br>
This is a common cause of confusing <code>ClassCastException</code> errors in application servers and plugin
systems, where the same library gets loaded twice by different loaders (e.g. once by the app server, once by a
deployed application's own loader).`
        },
        {
            content: `<h3>What Happens When a Class Cannot Be Loaded</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Scenario</th><th>Result</th><th>When it typically happens</th></tr>
<tr><td>Class requested explicitly by name, not found anywhere on classpath</td><td>ClassNotFoundException (checked)</td><td>Class.forName(), reflection, JDBC driver loading</td></tr>
<tr><td>Class was present at compile time but its .class/JAR is missing at runtime</td><td>NoClassDefFoundError (unchecked, extends Error)</td><td>A dependency JAR was removed/misconfigured after build</td></tr>
<tr><td>Static initializer of a class throws an exception during init</td><td>ExceptionInInitializerError, then NoClassDefFoundError on later attempts</td><td>Buggy static block or static field initializer</td></tr>
<tr><td>Custom loader's classpath/source becomes unavailable at load time</td><td>NoClassDefFoundError or LinkageError</td><td>Plugin JAR deleted while the app is running</td></tr>
</table>`
        },
        {
            content: `<h3>Common Misconceptions</h3>
• <strong>"ClassLoader loads the whole application at startup."</strong> Wrong - classes are loaded lazily, on
first use, not all upfront. <br>
• <strong>"There are only 3 class loaders."</strong> Wrong - there are 3 <em>built-in</em> loaders, but frameworks
(Tomcat, Spring Boot's fat-JAR launcher, OSGi) commonly add many more custom loaders for isolation. <br>
• <strong>"NoClassDefFoundError means the class was never compiled."</strong> Wrong - it usually means the class
compiled fine but its JAR/classpath entry is missing or broken at runtime.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the three built-in class loaders in order?</td><td>Bootstrap, Extension/Platform, Application/System</td></tr>
<tr><td>What is the parent delegation model?</td><td>A class loader delegates the load request to its parent first, only loading it itself if no ancestor can find the class</td></tr>
<tr><td>Why does delegation prevent core class spoofing?</td><td>Because the Bootstrap loader is asked first and always resolves java.lang.* classes from the trusted JDK before any user loader gets a chance</td></tr>
<tr><td>What's the difference between ClassNotFoundException and NoClassDefFoundError?</td><td>ClassNotFoundException is a checked exception from explicitly requesting a missing class (e.g. Class.forName); NoClassDefFoundError is an unchecked Error thrown when a class available at compile time is missing at runtime</td></tr>
<tr><td>Can the same class be loaded twice in one JVM?</td><td>Yes, if loaded by two different class loaders - they produce two distinct, incompatible Class objects</td></tr>
<tr><td>What are the three phases a class goes through before use?</td><td>Loading, Linking (verify, prepare, resolve), and Initialization</td></tr>
<tr><td>Why would you write a custom class loader?</td><td>To load classes from non-standard sources, achieve plugin isolation, or support hot-reloading</td></tr>
<tr><td>Is the Bootstrap Class Loader written in Java?</td><td>No, it's implemented natively (in C/C++) as part of the JVM itself</td></tr>
</table>`
        }
    ]
};
