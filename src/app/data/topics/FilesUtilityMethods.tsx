import { Topic } from '../coreJava';

export const filesUtilityMethods: Topic = {
                        id: 'files-11',
                        name: 'Files Utility Methods',
                        beginner: [
                            {
                                content: `<h3>Files Utility Methods in Java 11</h3>
<h4>Introduction</h4>
<p>Java 11 added convenient methods to the <strong>java.nio.file.Files</strong> class for simple file read and write operations: <strong>readString()</strong> and <strong>writeString()</strong>. These methods eliminate the need for BufferedReader/BufferedWriter boilerplate for simple file I/O.</p>

<h4>New Methods</h4>
<ul>
<li><strong>Files.readString(Path)</strong> — Reads the whole file as a String (UTF-8 default)</li>
<li><strong>Files.readString(Path, Charset)</strong> — Reads with the given charset</li>
<li><strong>Files.writeString(Path, CharSequence, OpenOption...)</strong> — Writes a string to a file</li>
<li><strong>Files.writeString(Path, CharSequence, Charset, OpenOption...)</strong> — Writes with the given charset</li>
</ul>

<h4>Key Features</h4>
<ul>
<li>One-line file read and write</li>
<li>Default UTF-8 encoding</li>
<li>Supports OpenOptions (CREATE, APPEND, TRUNCATE_EXISTING, etc.)</li>
</ul>`,
                                codeExamples: [
`// Files utility methods — Basic Usage
import java.nio.file.Files;
import java.nio.file.Path;

public class FilesBasic {
    public static void main(String[] args) throws Exception {
        Path filePath = Path.of("example.txt");

        // Write a string to a file (creates file if not exists)
        Files.writeString(filePath, "Hello, Java 11!\\nThis is easy file I/O.");

        // Read entire file as a String
        String content = Files.readString(filePath);
        System.out.println("File content:");
        System.out.println(content);

        // Overwrite the file
        Files.writeString(filePath, "New content replacing the old.");
        System.out.println("\\nUpdated content:");
        System.out.println(Files.readString(filePath));

        // Clean up
        Files.deleteIfExists(filePath);
    }
}

// OUTPUT:
// File content:
// Hello, Java 11!
// This is easy file I/O.
//
// Updated content:
// New content replacing the old.`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Files Utility Methods — Intermediate Usage</h3>
<h4>Using OpenOptions</h4>
<p>You can control file writing behavior with <strong>StandardOpenOption</strong> values such as APPEND, CREATE_NEW, etc.</p>

<h4>Working with Charsets</h4>
<p>Both methods accept an explicit charset for non-UTF-8 files.</p>

<h4>Combining with Other Java 11 Features</h4>
<ul>
<li>Use <strong>String.lines()</strong> for line-by-line processing</li>
<li>Use <strong>var</strong> for concise code</li>
<li>Use <strong>strip()</strong> to clean file content</li>
</ul>

<h4>Best Practices</h4>
<ul>
<li>Always handle <strong>IOException</strong></li>
<li>Use <strong>readString()</strong> only for reasonably sized files</li>
<li>Pass the charset explicitly for non-UTF-8 files</li>
</ul>`,
                                codeExamples: [
`// Files utility methods — Intermediate Usage
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.charset.StandardCharsets;

public class FilesIntermediate {
    public static void main(String[] args) throws Exception {
        Path logFile = Path.of("app.log");

        // Write initial content
        Files.writeString(logFile, "Log started\\n",
            StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        // Append to file
        Files.writeString(logFile, "INFO: Application initialized\\n",
            StandardOpenOption.APPEND);
        Files.writeString(logFile, "WARN: Low memory detected\\n",
            StandardOpenOption.APPEND);
        Files.writeString(logFile, "ERROR: Connection timeout\\n",
            StandardOpenOption.APPEND);

        // Read and process with lines()
        var content = Files.readString(logFile);
        System.out.println("All log entries:");
        content.lines()
            .filter(line -> !line.isBlank())
            .forEach(line -> System.out.println("  " + line));

        // Filter errors only
        System.out.println("\\nErrors only:");
        content.lines()
            .filter(line -> line.startsWith("ERROR"))
            .forEach(System.out::println);

        // Write with specific charset
        Path isoFile = Path.of("iso-file.txt");
        Files.writeString(isoFile, "ISO-8859-1 content",
            StandardCharsets.ISO_8859_1);
        String isoContent = Files.readString(isoFile, StandardCharsets.ISO_8859_1);
        System.out.println("\\nISO content: " + isoContent);

        // Clean up
        Files.deleteIfExists(logFile);
        Files.deleteIfExists(isoFile);
    }
}

// OUTPUT:
// All log entries:
//   Log started
//   INFO: Application initialized
//   WARN: Low memory detected
//   ERROR: Connection timeout
//
// Errors only:
// ERROR: Connection timeout
//
// ISO content: ISO-8859-1 content`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Files Utility Methods — Expert Deep Dive</h3>
<h4>Internal Implementation</h4>
<ul>
<li><strong>readString()</strong> reads all bytes (like <strong>Files.readAllBytes()</strong>) and decodes them into a String</li>
<li><strong>writeString()</strong> encodes the CharSequence to bytes and writes them like <strong>Files.write()</strong></li>
<li>The default charset is <strong>UTF-8</strong>, whatever the platform default is</li>
</ul>

<h4>Comparison with Legacy Approaches</h4>
<ul>
<li>Legacy read: BufferedReader + FileReader + StringBuilder loop (5-10 lines)</li>
<li>Java 11 read: <code>Files.readString(path)</code>, one line</li>
<li>Legacy write: BufferedWriter + FileWriter + write + close (5-8 lines)</li>
<li>Java 11 write: <code>Files.writeString(path, content)</code>, one line</li>
</ul>

<h4>Missing Files and Atomic Writes</h4>
<ul>
<li>If the file does not exist, <strong>readString()</strong> throws <strong>NoSuchFileException</strong></li>
<li><strong>writeString()</strong> is not atomic: write a temp file, then move it with <strong>ATOMIC_MOVE</strong></li>
</ul>`,
                                codeExamples: [
`// Expert Files utility methods
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.io.IOException;

public class FilesExpert {
    public static void main(String[] args) throws Exception {
        // Comparison: Legacy vs Java 11 approach
        Path filePath = Path.of("expert-demo.txt");

        // Java 11 way — concise
        Files.writeString(filePath, "Hello from Java 11!");
        String content = Files.readString(filePath);

        // Legacy way (for comparison):
        // try (BufferedWriter w = new BufferedWriter(new FileWriter(file))) {
        //     w.write("Hello from legacy!");
        // }
        // StringBuilder sb = new StringBuilder();
        // try (BufferedReader r = new BufferedReader(new FileReader(file))) {
        //     String line;
        //     while ((line = r.readLine()) != null) sb.append(line);
        // }

        // Safe file write pattern with temp file
        Path tempFile = Files.createTempFile("app-", ".tmp");
        Files.writeString(tempFile, "Critical data");
        // In production: atomically move temp to target
        // Files.move(tempFile, targetPath, StandardCopyOption.ATOMIC_MOVE);

        // Error handling patterns
        try {
            String nonExistent = Files.readString(Path.of("does-not-exist.txt"));
        } catch (IOException e) {
            System.out.println("Expected error: " + e.getClass().getSimpleName());
        }

        // Combining readString with processing
        Files.writeString(filePath, "key1=value1\\nkey2=value2\\nkey3=value3");
        var props = Files.readString(filePath).lines()
            .map(line -> line.split("="))
            .filter(parts -> parts.length == 2)
            .collect(java.util.stream.Collectors.toMap(
                parts -> parts[0].strip(),
                parts -> parts[1].strip()
            ));
        System.out.println("Parsed properties: " + props);

        // Clean up
        Files.deleteIfExists(filePath);
        Files.deleteIfExists(tempFile);
    }
}

// OUTPUT:
// Expected error: NoSuchFileException
// Parsed properties: {key1=value1, key2=value2, key3=value3}`
                                ]
                            }
                        ]
};
