import { Topic } from '../coreJava';

export const abstractFactoryPattern: Topic = {
    id: 'abstract-factory-pattern',
    name: 'Abstract Factory Pattern',

    beginner: [
        {
            content: `<h4>Real-Life Example:</h4>
<ul>
<li>A furniture shop that sells matching sets - Modern Chair + Modern Table, or Victorian Chair + Victorian Table. You never mix a Modern Chair with a Victorian Table.</li>
<li>An Operating System's UI toolkit - Windows widgets (Button, Checkbox) vs Mac widgets (Button, Checkbox), each family styled consistently.</li>
<li>A car manufacturing plant that produces either all Petrol parts or all Electric parts for a single vehicle - never mixed.</li>
</ul>

<h4>What is Abstract Factory Pattern?</h4>
<p>
The <b>Abstract Factory Pattern</b> is a Creational Pattern that provides
an interface to create <b>families of related objects</b> without
specifying their concrete classes. It is often described as a
<b>"factory of factories"</b>.
</p>

<h4>Why do we need it?</h4>
<ul>
<li>To ensure that related objects are always created together and stay consistent (e.g. never mix a Light theme Button with a Dark theme Checkbox)</li>
<li>To make it easy to switch an entire family of objects (theme, platform, database) in one place</li>
<li>To keep client code independent of concrete product classes</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create product interfaces (e.g. <code>Button</code>, <code>Checkbox</code>)</li>
<li>Step 2: Create concrete product classes for each family (e.g. <code>LightButton</code>, <code>DarkButton</code>)</li>
<li>Step 3: Create an Abstract Factory interface with a create-method per product</li>
<li>Step 4: Create concrete factories, one per family (e.g. <code>LightThemeFactory</code>, <code>DarkThemeFactory</code>)</li>
<li>Step 5: Client uses only the Abstract Factory and product interfaces</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab.demo;

// Step 1: Product Interfaces
interface Button {
    void render();
}

interface Checkbox {
    void render();
}

// Step 2: Concrete Products - Light Theme family
class LightButton implements Button {
    public void render() {
        System.out.println("Rendering Light Button");
    }
}

class LightCheckbox implements Checkbox {
    public void render() {
        System.out.println("Rendering Light Checkbox");
    }
}

// Step 2: Concrete Products - Dark Theme family
class DarkButton implements Button {
    public void render() {
        System.out.println("Rendering Dark Button");
    }
}

class DarkCheckbox implements Checkbox {
    public void render() {
        System.out.println("Rendering Dark Checkbox");
    }
}

// Step 3: Abstract Factory
interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

// Step 4: Concrete Factories
class LightThemeFactory implements UIFactory {
    public Button createButton() { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}

class DarkThemeFactory implements UIFactory {
    public Button createButton() { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}

// Step 5: Client
public class Test {
    public static void main(String[] args) {
        UIFactory factory = new DarkThemeFactory();

        Button button = factory.createButton();
        Checkbox checkbox = factory.createCheckbox();

        button.render();
        checkbox.render();

        // OUTPUT:
        // Rendering Dark Button
        // Rendering Dark Checkbox
    }
}`
            ]
        },
        {
            content: `<h4>Difference from Plain Factory Method</h4>
<p>
A plain Factory (or Factory Method) creates <b>one</b> type of product.
Abstract Factory creates a <b>whole family</b> of related products
(multiple factory methods bundled inside one factory interface), and
guarantees the created products are compatible with each other.
</p>`
        }
    ],

    expert: [
        {
            content: `<h4>Real-World Use: <code>javax.xml.parsers.DocumentBuilderFactory</code></h4>
<p>
The JDK's XML parsing API is a textbook Abstract Factory. <code>DocumentBuilderFactory</code>
is an abstract factory that returns a <code>DocumentBuilder</code>, whose
concrete implementation depends on which XML parser is configured on the classpath.
</p>`,
            codeExamples: [
                `import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

public class XmlFactoryDemo {
    public static void main(String[] args) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();

        System.out.println(builder.getClass().getName());
        // OUTPUT (implementation-dependent):
        // com.sun.org.apache.xerces.internal.jaxp.DocumentBuilderImpl
    }
}`
            ]
        },
        {
            content: `<h4>Real-World Use: <code>javax.xml.transform.TransformerFactory</code></h4>
<p>
Similarly, <code>TransformerFactory</code> is an abstract factory that
produces a family of related XSLT transformation objects, hiding which
concrete transformer engine is actually used underneath.
</p>`,
            codeExamples: [
                `import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;

public class TransformerFactoryDemo {
    public static void main(String[] args) throws Exception {
        TransformerFactory factory = TransformerFactory.newInstance();
        Transformer transformer = factory.newTransformer();

        System.out.println(transformer.getClass().getName());
    }
}`
            ]
        },
        {
            content: `<h4>Abstract Factory + Dependency Injection</h4>
<p>
In modern Spring applications, we rarely write Abstract Factory classes
by hand. Instead, we define multiple <code>@Bean</code> or
<code>@Component</code> implementations, group them logically by
<code>@Profile</code> or <code>@Qualifier</code>, and let Spring's
<code>ApplicationContext</code> act as the Abstract Factory that wires
compatible families of beans together based on configuration.
</p>`,
            codeExamples: [
                `public interface Button { void render(); }
public interface Checkbox { void render(); }

@Configuration
@Profile("dark")
public class DarkThemeConfig {
    @Bean
    public Button darkButton() { return () -> System.out.println("Dark Button"); }

    @Bean
    public Checkbox darkCheckbox() { return () -> System.out.println("Dark Checkbox"); }
}

@Configuration
@Profile("light")
public class LightThemeConfig {
    @Bean
    public Button lightButton() { return () -> System.out.println("Light Button"); }

    @Bean
    public Checkbox lightCheckbox() { return () -> System.out.println("Light Checkbox"); }
}

// Spring's ApplicationContext selects the whole family
// of beans (Button + Checkbox) based on the active profile,
// exactly like an Abstract Factory selecting a concrete factory.`
            ]
        },
        {
            content: `<h4>Abstract Factory Pattern + SOLID Principles</h4>
<ul>
<li><b>S - Single Responsibility</b> → Each concrete factory is responsible only for creating one consistent family of products</li>
<li><b>O - Open Closed</b> → New product families (e.g. a new theme) can be added by creating a new concrete factory, without modifying client code</li>
<li><b>D - Dependency Inversion</b> → Client depends only on the Abstract Factory and product interfaces, never on concrete classes</li>
</ul>

<h4>Common Mistakes</h4>
<ul>
<li>Mixing products from different families (e.g. accidentally new-ing a <code>LightButton</code> alongside a <code>DarkCheckbox</code>)</li>
<li>Adding a new product type (not just a new family) requires modifying the Abstract Factory interface and every concrete factory - a known limitation of this pattern</li>
<li>Overusing Abstract Factory when there is really only one product family - a plain Factory Method is enough</li>
<li>Not centralizing factory selection logic, leading to scattered <code>if-else</code> checks throughout the codebase</li>
</ul>`
        },
        {
            content: `<h3>Factory Method vs Abstract Factory vs Builder</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Pattern</th>
<th>Creates</th>
<th>Number of Products</th>
<th>Typical Use Case</th>
</tr>
<tr>
<td>Factory Method</td>
<td>One product, decided by subclass</td>
<td>Single product</td>
<td>Choosing one implementation of an interface at runtime</td>
</tr>
<tr>
<td>Abstract Factory</td>
<td>Family of related products</td>
<td>Multiple related products</td>
<td>Ensuring compatible objects are created together (themes, platforms)</td>
</tr>
<tr>
<td>Builder</td>
<td>One complex object, built step-by-step</td>
<td>Single product, many optional parts</td>
<td>Constructing an object with many optional fields</td>
</tr>
</table>

<h4>When NOT to Use Abstract Factory?</h4>
<ul>
<li>When there is only one product to create (use plain Factory Method instead)</li>
<li>When product families rarely change or new families are almost never added</li>
<li>When it adds unnecessary layers of abstraction for a small application</li>
</ul>`
        }
    ]
};
