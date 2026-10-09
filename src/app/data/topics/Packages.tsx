import { Topic } from '../coreJava';
import package1 from '../../../assets/package 1.png';
import package2 from '../../../assets/package 2.png';

export const packages: Topic = {
                        id: 'Packages',
                        name: 'Packages',
                        beginner: [
                            {
                                content: `<h3>What is a Package?</h3>
A <b>package</b> is simply a folder that groups related classes and interfaces together - it's Java's way of organizing code.<br><br>

<b>Why do we need packages?</b><br>
• <b>Organization</b> - Imagine a project with thousands of classes all dumped in one place; finding and maintaining anything would be a nightmare. Packages group related classes into folders, just like folders on your computer.<br>
• <b>Avoiding name collisions</b> - Two different teams could each write a class called <code>Employee</code>. As long as they live in different packages (e.g. <code>hr.Employee</code> and <code>payroll.Employee</code>), there's no conflict.<br>
• <b>Reusability</b> - Common code can be packaged once and reused across many projects.<br>
• <b>Access control</b> - Packages work together with access specifiers to control which classes can see which other classes.<br><br>

<b>Types of packages:</b><br>
1) <b>Built-in (predefined) packages</b> - shipped with Java itself, e.g. <code>java.lang</code>, <code>java.util</code>, <code>java.io</code>.<br>
2) <b>User-defined packages</b> - packages we create ourselves for our own project.<br>`
                            },
                            {
                                content: `<h3>Declaring a Package</h3>
To put a class inside a package, the <code>package</code> statement must be the very first line of the <code>.java</code> file (only comments may come before it).<br><br>

<div class="bg-secondary border border-primary p-3">
Syntax:<br>
package package_name;
</div><br>

<b>Naming convention:</b> package names are always written in lowercase, and by convention companies use their <b>reversed domain name</b> as the root.<br>
Example: domain <code>www.google.com</code> ➝ package <code>com.google</code><br><br>

A deeper, real-world example: <code>com.dell.smartwatch.android</code><br>
• <code>com</code> ➝ generic root, reversed from the company's domain<br>
• <code>dell</code> ➝ the company/client name<br>
• <code>smartwatch</code> ➝ the project name<br>
• <code>android</code> ➝ a module within that project (there could also be a "mobile" or "tab" module)<br>`
                            },
                            {
                                content: `<h3>How Package Names Map to Folders</h3>
The package name is not just a label - it must exactly match the directory structure on disk. Dots in the package name become nested folders.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">package com.company.project;

     maps to directory
            |
            v

src/
`+"`"+`-- com/
    `+"`"+`-- company/
        `+"`"+`-- project/
            `+"`"+`-- MyClass.java   (package com.company.project;)</pre>`
                            },
                            {
                                content: `<h3>The import Statement</h3>
When you want to use a class that lives in a <b>different</b> package, you must either import it or refer to it by its fully-qualified name. The <code>import</code> statement just saves you from typing the full package path every time.<br><br>

<b>Different ways to import:</b><br>
<code>import com.p1.Test;</code> &nbsp;// correct - imports one specific class<br>
<code>import com.p1.*;</code> &nbsp;&nbsp;&nbsp;// correct - imports every class in that package<br>
<code>import com.p1;</code> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// wrong - you cannot import a package itself, only its classes<br><br>

<b>Note:</b> This example needs two separate files placed in matching folders (<code>com/p1/Test.java</code> and <code>com/p2/Pankaj.java</code>) to actually compile and run - it will not run as a single file.<br>`,
                                codeExamples: [
                                    `// File: com/p1/Test.java
package com.p1;

public class Test {
    public void m1() {
        System.out.println("This is m1 method");
    }
}`,
                                    `// File: com/p2/Pankaj.java
package com.p2;
import com.p1.Test;

public class Pankaj {
    public static void main(String[] args) {
        Test test = new Test();
        test.m1();
    }
}
// OUTPUT:
// This is m1 method`
                                ]
                            },
                            {
                                content: `<h3>A Built-in Package Example: java.util.Scanner</h3>
<b>Scanner</b> lives in the built-in <code>java.util</code> package and is the easiest way to read user input (integers, doubles, strings, etc.) from the keyboard via <code>System.in</code>.<br><br>

<img src="${package1}" alt="Package import example" class="d-block mx-auto"/><br>

<b>Common Scanner methods:</b><br>
• <code>nextInt()</code> - reads an int<br>
• <code>nextDouble()</code> - reads a double<br>
• <code>next()</code> - reads a single word (String)<br>
• <code>nextLine()</code> - reads an entire line (String)<br><br>

<img src="${package2}" alt="Scanner methods" class="d-block mx-auto"/>`,
                                codeExamples: [
                                    `package com.test;
import java.util.Scanner;

public class ScannerDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter Your Name:");
        String name = sc.nextLine();

        System.out.println("Enter Your Age:");
        int age = sc.nextInt();

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
    }
}
// Sample input:
// Pankaj
// 25
// OUTPUT:
// Enter Your Name:
// Enter Your Age:
// Name: Pankaj
// Age: 25`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Package Declaration & Directory Structure (Deep Dive)</h3>
A package's name must exactly mirror the directory path the <code>.java</code> file lives in - the compiler and classloader rely on this mapping to find classes.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">package com.javaschoollab.service;

         maps to directory
                |
                v

src/
`+"`"+`-- com/
    `+"`"+`-- javaschoollab/
        `+"`"+`-- service/
            `+"`"+`-- Employee.java   (package com.javaschoollab.service;)</pre>

The compiled <code>.class</code> file must live in the matching folder under the classpath root as well, or the classloader cannot find it.<br>`
                            },
                            {
                                content: `<h3>Single-Type vs On-Demand Import & Naming Ambiguity</h3>
<code>import com.p1.Test;</code> imports exactly one type. <code>import com.p1.*;</code> is an <strong>on-demand import</strong> - it imports every visible top-level type in that package, but does <strong>not</strong> affect runtime performance (it's purely a compile-time convenience for the compiler to resolve names).<br><br>

The real danger of wildcard imports is <strong>naming ambiguity</strong>: if two packages you import both contain a class with the same simple name, the compiler cannot pick one for you - you must use the fully-qualified name.<br>`,
                                codeExamples: [
                                    `// File: com/p1/Date.java
package com.p1;
public class Date {
    public String toString() { return "p1.Date"; }
}`,
                                    `// File: com/p2/Date.java
package com.p2;
public class Date {
    public String toString() { return "p2.Date"; }
}`,
                                    `import com.p1.*;
import com.p2.*;

public class AmbiguityDemo {
    public static void main(String[] args) {
        // Date d = new Date();       // Compile-time error: reference to Date is ambiguous

        com.p1.Date d1 = new com.p1.Date();   // must fully qualify
        com.p2.Date d2 = new com.p2.Date();   // must fully qualify

        System.out.println(d1);
        System.out.println(d2);
    }
}
// OUTPUT:
// p1.Date
// p2.Date`
                                ]
                            },
                            {
                                content: `<h3>Access Control Across Packages</h3>
<strong>Default (package-private)</strong> access is invisible outside the declaring package - even to an unrelated class in a completely different package. <strong>protected</strong> access IS visible to subclasses even in other packages (through inheritance), though not to unrelated classes there. A <strong>private</strong> top-level class is not even legal Java - private is only allowed on nested/inner classes.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Modifier</th><th>Same Package</th><th>Different Package (subclass)</th><th>Different Package (unrelated)</th></tr>
<tr class='text-center'><td>default</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr class='text-center'><td>protected</td><td>Yes</td><td>Yes (via inheritance)</td><td>No</td></tr>
<tr class='text-center'><td>public</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
</table>
<br>

<h4>CLASSPATH and Class Lookup</h4>
The <strong>classpath</strong> is the set of root directories/JARs the JVM and compiler search when resolving package-qualified class names. To find a class in package <code>com.p1</code>, the classloader looks for <code>com/p1/ClassName.class</code> under each classpath root/JAR in turn, in order, and uses the first match it finds.<br>`,
                                codeExamples: [
                                    `// File: com/p1/Helper.java
package com.p1;
class Helper {                       // default (package-private) access
    void greet() { System.out.println("Hello from Helper"); }
}`,
                                    `// File: com/p2/Main.java
package com.p2;
// import com.p1.Helper;             // Not possible: Helper is not public

public class Main {
    public static void main(String[] args) {
        // Helper h = new Helper();  // Compile-time error: Helper is not visible here
        System.out.println("Helper is package-private to com.p1, invisible in com.p2");
    }
}
// OUTPUT:
// Helper is package-private to com.p1, invisible in com.p2`
                                ]
                            },
                            {
                                content: `<h3>Sub-packages Are NOT Hierarchical for Access (Classic Interview Trap)</h3>
This is one of the most commonly misunderstood facts about Java packages: <code>com.company.util</code> and <code>com.company.util.internal</code> are treated as <strong>completely unrelated, independent packages</strong> by the compiler - even though the folder names look nested. Package-private members of one are NOT visible to the other just because the name looks like a "sub-package".<br>`,
                                codeExamples: [
                                    `// File: com/company/util/Tool.java
package com.company.util;
class Tool {                         // default access
    void run() { System.out.println("Tool running"); }
}`,
                                    `// File: com/company/util/internal/Runner.java
package com.company.util.internal;
// import com.company.util.Tool;     // Not possible: Tool is not public

public class Runner {
    public static void main(String[] args) {
        // Tool t = new Tool();
        // Compile-time error: even though "internal" looks like a
        // sub-package of "util", Java treats them as totally separate
        // packages. Package names are just strings to the compiler -
        // there is no folder-based inheritance of access rights.
        System.out.println("com.company.util.internal cannot see package-private members of com.company.util");
    }
}
// OUTPUT:
// com.company.util.internal cannot see package-private members of com.company.util`
                                ]
                            },
                            {
                                content: `<h3>Static Imports</h3>
<code>import static</code> lets you reference a class's static members without prefixing the class name - handy for constants and utility methods, but overusing it can hurt readability.<br>`,
                                codeExamples: [
                                    `import static java.lang.Math.PI;
import static java.lang.Math.sqrt;

public class StaticImportDemo {
    public static void main(String[] args) {
        double area = PI * sqrt(4) * sqrt(4);   // no Math. prefix needed
        System.out.println(area);
    }
}
// OUTPUT:
// 12.566370614359172`
                                ]
                            },
                            {
                                content: `<h3>Package-Private Top-Level Classes</h3>
A top-level class declared without <code>public</code> is package-private: it can only be used by other classes in the same package. This is a legitimate design choice - it lets you hide implementation-detail classes from consumers of your package while still exposing a public API class.<br>`,
                                codeExamples: [
                                    `// File: com/p1/PublicApi.java
package com.p1;

public class PublicApi {              // public - the intended entry point
    public String process() {
        InternalWorker worker = new InternalWorker();
        return worker.doWork();
    }
}

class InternalWorker {                // package-private - hidden from outside com.p1
    String doWork() {
        return "work done internally";
    }
}`,
                                    `// File: com/p2/Client.java
package com.p2;
import com.p1.PublicApi;
// import com.p1.InternalWorker;      // Not possible: InternalWorker is package-private

public class Client {
    public static void main(String[] args) {
        PublicApi api = new PublicApi();
        System.out.println(api.process());
    }
}
// OUTPUT:
// work done internally`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can a .java file have multiple public classes?</td><td>No - at most one public top-level class per file</td></tr>
<tr class='text-center'><td>Must the file name match the public class name?</td><td>Yes - e.g. public class Employee must live in Employee.java</td></tr>
<tr class='text-center'><td>What if there's no explicit package declaration?</td><td>The class belongs to the default/unnamed package (not recommended for real projects)</td></tr>
<tr class='text-center'><td>Do you need to import java.lang.*?</td><td>No - java.lang (String, Object, Math, etc.) is auto-imported into every file</td></tr>
<tr class='text-center'><td>Does import com.p1.*; slow down the program?</td><td>No - imports are resolved at compile time only, zero runtime cost</td></tr>
<tr class='text-center'><td>Is com.a.b a sub-package of com.a?</td><td>No - Java has no true package hierarchy for access purposes; each package name is independent, they just happen to nest as folders</td></tr>
<tr class='text-center'><td>Can two classes with the same simple name coexist in a project?</td><td>Yes, as long as they are in different packages - packages exist precisely to avoid this kind of name collision</td></tr>
<tr class='text-center'><td>Can a top-level class be private?</td><td>No - only public or default (package-private); private/protected are only legal on nested classes</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> prefer explicit single-type imports for clarity in production code; reserve wildcard imports for quick scripts or when a class uses many types from the same package.<br>`
                            }
                        ]
};
