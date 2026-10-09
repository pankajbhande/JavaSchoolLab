import { Topic } from '../coreJava';

export const propertiesFileInJava: Topic = {
    id: 'properties-file',
    name: 'Properties File in Java',

    beginner: [
        {
            content: `<h4>What is a Properties File?</h4>
A <b>properties file</b> is a simple configuration file - a plain text file with a <code>.properties</code> extension that stores data as <b>key=value</b> pairs.<br>
<ul>
<li>It is used to externalize configuration (database URLs, credentials, app settings, language translations) so it can be changed <b>without touching or recompiling the source code</b>.</li>
<li>Values like usernames, passwords, or environment URLs change often. Hardcoding them in Java classes forces a rebuild for every change. A <code>.properties</code> file solves that.</li>
</ul>
<p><b>Example - simple.properties</b></p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">username=pankaj
password=pune</pre>`
        },

        {
            content: `<h4>Format and Key Features</h4>
<ul>
<li>Each line represents one property, in the form <code>key=value</code>.</li>
<li>Comments start with <code>#</code> or <code>!</code>.</li>
<li>Commonly used for application configuration and <b>internationalization (i18n)</b> - storing separate translation files per language.</li>
</ul>
<p><b>Example - config.properties</b></p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6"># Database configuration
db.url = jdbc:mysql://localhost:3306/mydatabase
db.user = root
db.password = secret

# Application settings
app.name = MyApp
app.version = 1.0.0</pre>`
        },

        {
            content: `<h4>Reading a Properties File with java.util.Properties</h4>
The <code>java.util.Properties</code> class loads key-value pairs from a file via <code>load()</code>, and reads them back with <code>getProperty()</code>.`,
            codeExamples: [
                `import java.io.IOException;
import java.io.InputStream;
import java.io.FileInputStream;
import java.util.Properties;

public class ReadConfigDemo {
    public static void main(String[] args) {
        Properties properties = new Properties();

        try (InputStream input = new FileInputStream("config.properties")) {
            properties.load(input);

            String dbUrl = properties.getProperty("db.url");
            String dbUser = properties.getProperty("db.user");
            String appName = properties.getProperty("app.name");
            String appVersion = properties.getProperty("app.version");

            System.out.println("Database URL: " + dbUrl);
            System.out.println("Database User: " + dbUser);
            System.out.println("Application Name: " + appName);
            System.out.println("Application Version: " + appVersion);

        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }
}
// OUTPUT (given the config.properties above):
// Database URL: jdbc:mysql://localhost:3306/mydatabase
// Database User: root
// Application Name: MyApp
// Application Version: 1.0.0`
            ]
        },

        {
            content: `<h4>How It Works</h4>
<ul>
<li><b>Properties class</b> - an instance of <code>java.util.Properties</code> holds the loaded key-value data in memory.</li>
<li><b>FileInputStream</b> - opens the <code>.properties</code> file so it can be read.</li>
<li><b>load() method</b> - reads all key=value lines from the stream into the <code>Properties</code> object.</li>
<li><b>getProperty() method</b> - retrieves the value for a given key, returning <code>null</code> if the key does not exist.</li>
<li><b>try-with-resources</b> - closes the <code>InputStream</code> automatically once reading is done, even if an exception occurs.</li>
</ul>`
        }
    ],

    expert: [
        {
            content: `<h3>getProperty() Overload With a Default Value</h3>
<code>getProperty(String key)</code> returns <code>null</code> if the key is missing, forcing a null check everywhere. <code>getProperty(String key, String defaultValue)</code> avoids that by supplying a fallback directly.<br>`,
            codeExamples: [
                `import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

public class DefaultValueDemo {
    public static void main(String[] args) throws Exception {
        Properties properties = new Properties();
        try (InputStream input = new FileInputStream("config.properties")) {
            properties.load(input);
        }

        // Key exists in the file
        String appName = properties.getProperty("app.name", "DefaultApp");

        // Key does NOT exist in the file -> falls back to the default
        String timeout = properties.getProperty("app.timeout", "30");

        System.out.println("App: " + appName);
        System.out.println("Timeout: " + timeout);
    }
}
// OUTPUT:
// App: MyApp
// Timeout: 30`
            ]
        },
        {
            content: `<h3>Writing / Updating a Properties File with store()</h3>
<code>Properties</code> is a subclass of <code>Hashtable</code>, so values can be set with <code>setProperty()</code> just like a map entry, then persisted back to disk with <code>store()</code>.<br>`,
            codeExamples: [
                `import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Properties;

public class WritePropertiesDemo {
    public static void main(String[] args) throws Exception {
        Properties properties = new Properties();
        properties.setProperty("app.name", "MyApp");
        properties.setProperty("app.version", "2.0.0");

        try (OutputStream output = new FileOutputStream("app.properties")) {
            properties.store(output, "Application Settings");
        }
        System.out.println("Properties file written.");
    }
}
// OUTPUT:
// Properties file written.
//
// app.properties now contains:
// #Application Settings
// #<timestamp comment line>
// app.version=2.0.0   (key order is not guaranteed)
// app.name=MyApp`
            ]
        },
        {
            content: `<h3>Loading Properties From the Classpath</h3>
Reading via a hardcoded <code>FileInputStream</code> path breaks once the app is packaged into a JAR - the file is usually not at that filesystem path anymore. The standard fix is loading it as a <b>classpath resource</b> instead, using the class loader.<br>`,
            codeExamples: [
                `import java.io.InputStream;
import java.util.Properties;

public class ClasspathPropertiesDemo {
    public static void main(String[] args) throws Exception {
        Properties properties = new Properties();

        // Loads config.properties from src/main/resources (or classes root) -
        // works the same way whether run from an IDE or a packaged JAR.
        try (InputStream input =
                 ClasspathPropertiesDemo.class.getClassLoader()
                     .getResourceAsStream("config.properties")) {

            if (input == null) {
                System.out.println("config.properties not found on classpath");
                return;
            }
            properties.load(input);
            System.out.println("App: " + properties.getProperty("app.name"));
        }
    }
}
// OUTPUT (when config.properties is on the classpath):
// App: MyApp`
            ]
        },
        {
            content: `<h3>Common Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a properties file instead of hardcoding values?</td><td>It externalizes configuration so values (DB URLs, credentials, app settings) can change without recompiling the source code</td></tr>
<tr class='text-center'><td>Which class is used to read/write a properties file?</td><td>java.util.Properties</td></tr>
<tr class='text-center'><td>What does getProperty() return if the key does not exist?</td><td>null, unless the overload with a defaultValue is used, in which case it returns that default</td></tr>
<tr class='text-center'><td>What class does Properties extend?</td><td>java.util.Hashtable&lt;Object,Object&gt; - so it can also be used with the general Map/Hashtable API, though the String-based getProperty()/setProperty() methods are preferred</td></tr>
<tr class='text-center'><td>How do you comment a line in a .properties file?</td><td>Start the line with # or !</td></tr>
<tr class='text-center'><td>Why load properties from the classpath instead of a fixed file path?</td><td>A fixed filesystem path breaks once the app is packaged into a JAR; classpath loading (getResourceAsStream) works consistently in both the IDE and the packaged artifact</td></tr>
<tr class='text-center'><td>What is a common real-world use of properties files?</td><td>Internationalization (i18n) - separate .properties files per language/locale - and environment-specific configuration (dev/test/prod)</td></tr>
</table>`
        }
    ]
};
