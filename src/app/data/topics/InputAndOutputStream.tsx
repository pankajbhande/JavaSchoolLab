import { Topic } from '../coreJava';
import io1 from '../../../assets/IO1.png';
import io2 from '../../../assets/IO2.png';
import io3 from '../../../assets/IO3.png';

export const inputAndOutputStream: Topic = {
                        id: `Input and Output Stream in Java`,
                        name: `Input and Output Stream in Java`,

                        beginner: [

                            {
                                content: `<p><b>Input and Output Stream in Java</b></p>
<ul>
<li>Java I/O (Input and Output) is used to read input and produce output.</li>
<li>Java uses the idea of a <b>stream</b> to move data in order, step by step.</li>
<li>The <b>java.io</b> package holds the classes for input and output.</li>
<li>File handling in Java is done with the Java I/O API.</li>
</ul>
<h4>What is a Stream?</h4>
<ul>
<li>A stream is a sequence of data.</li>
<li>In Java, a stream is made of bytes.</li>
<li>There are two kinds: <strong>byte streams</strong> (raw or binary data) and <strong>character streams</strong> (text). The difference is explained in the Expert Level section.</li>
</ul>
<p>Below is one small, runnable code and output for each core building block:</p>`
                            },

                            {
                                content: `<h4>1. Automatically Created Streams</h4>
<p>Java creates three streams automatically and attaches them to the console:</p>
<ol>
<li><b>System.out</b> - Standard Output Stream</li>
<li><b>System.in</b> - Standard Input Stream</li>
<li><b>System.err</b> - Standard Error Stream</li>
</ol>`,
                                codeExamples: [
                                    `public class ConsoleStreamsDemo {
    public static void main(String[] args) {
        System.out.println("simple message");
        System.err.println("error message");
    }
}
// OUTPUT:
// simple message
// error message`
                                ]
                            },

                            {
                                content: `<h4>2. OutputStream - writing data to a destination</h4>
<ul>
<li><code>OutputStream</code> is used to write data to a destination.</li>
<li>The destination may be a file, array, device, or socket.</li>
<li><code>System.out</code> itself is a <code>PrintStream</code>, which is an <code>OutputStream</code>.</li>
</ul>`,
                                codeExamples: [
                                    `public class OutputStreamDemo {
    public static void main(String[] args) {
        System.out.println("Writing data through the standard OutputStream");
    }
}
// OUTPUT:
// Writing data through the standard OutputStream`
                                ]
                            },

                            {
                                content: `<h4>3. InputStream - reading data from a source</h4>
<ul>
<li><code>InputStream</code> is used to read data from a source.</li>
<li>The source may be a file, array, device, or socket.</li>
<li><code>System.in</code> is an <code>InputStream</code> connected to the keyboard.</li>
</ul>`
                            },

                            {
                                content: `<h4>4. Reading Console Input with Scanner</h4>
The simplest way to read user input from the keyboard is <code>Scanner</code> wrapped around <code>System.in</code>. Since we can't take live keyboard input in a demo, this example reads from a fixed string source instead so the output is deterministic.`,
                                codeExamples: [
                                    `import java.util.Scanner;

public class ScannerDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner("Pankaj 25");
        String name = sc.next();
        int age = sc.nextInt();
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        sc.close();
    }
}
// OUTPUT:
// Name: Pankaj
// Age: 25`
                                ]
                            },

                            {
                                content: `<h4>5. Write Data into a File using FileWriter</h4>
In this example, data is written into a file using the <code>FileWriter</code> class.`,
                                codeExamples: [
                                    `import java.io.FileWriter;

public class FileWriterExample {
    public static void main(String[] args) {
        try {
            FileWriter fw = new FileWriter("testout.txt");
            fw.write("Pankaj Dnyanoba Bhande.");
            fw.close();
            System.out.println("Success...");
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
// OUTPUT:
// Success...`
                                ]
                            },

                            {
                                content: `<h4>6. Read a File Line by Line using Scanner</h4>
<code>Scanner</code> can also be wrapped around a <code>FileInputStream</code> to read a file's contents line by line.`,
                                codeExamples: [
                                    `import java.io.*;
import java.util.Scanner;

public class ReadLineByLineExample {
    public static void main(String[] args) {
        try {
            FileInputStream fis = new FileInputStream("Demo.txt");
            Scanner sc = new Scanner(fis);

            while (sc.hasNextLine()) {
                System.out.println(sc.nextLine());
            }

            sc.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`
                                ]
                            },

                            {
                                content: `<div class="bg-secondary p-2 rounded-md">
<h4>Important Interview Questions</h4>
<ol>
<li>What is Java I/O?</li>
<li>What is a stream in Java?</li>
<li>Difference between InputStream and OutputStream</li>
<li>What are System.in, System.out, and System.err?</li>
<li>Difference between FileInputStream and FileReader</li>
</ol></div>`
                            }

                        ],

                        expert: [
                            {
                                content: `<h3>Byte Streams vs Character Streams</h3>
Java I/O splits into two parallel hierarchies:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Byte Streams (raw 8-bit data)                       Character Streams (Unicode text)
InputStream / OutputStream                          Reader / Writer
  |                                                 |
  +-- FileInputStream / FileOutputStream            +-- FileReader / FileWriter
  +-- BufferedInputStream / BufferedOutputStream    +-- BufferedReader / BufferedWriter
  +-- ObjectInputStream / ObjectOutputStream        +-- InputStreamReader / OutputStreamWriter
  +-- DataInputStream / DataOutputStream            +-- PrintWriter</pre>

<strong>Why do character streams exist at all?</strong> Byte streams move raw bytes with no notion of text encoding - reading a multi-byte UTF-8 character one byte at a time can split it incorrectly. Character streams (Reader/Writer) understand the platform/specified charset and decode bytes into proper Unicode <code>char</code>s, which is exactly what you want for text files.<br><br>

<code>InputStreamReader</code> and <code>OutputStreamWriter</code> are the <strong>bridge classes</strong> that wrap a byte stream and expose it as a character stream (with a chosen charset).<br><br>

<img src="${io1}" alt="InputStream class hierarchy" class="d-block mx-auto" /> <br>
<img src="${io2}" alt="OutputStream class hierarchy" class="d-block mx-auto" /> <br>
<img src="${io3}" alt="Reader/Writer class hierarchy" class="d-block mx-auto" /> <br>`
                            },
                            {
                                content: `<h3>Writing and Reading a File with try-with-resources</h3>
Modern Java I/O should always use <strong>try-with-resources</strong> so streams are closed automatically, even if an exception occurs mid-way:<br>`,
                                codeExamples: [
                                    `import java.io.*;

public class FileWriteReadDemo {
    public static void main(String[] args) throws IOException {
        String path = "notes.txt";

        // Write
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(path))) {
            bw.write("Java I/O is powerful");
            bw.newLine();
            bw.write("BufferedWriter reduces disk writes");
        }

        // Read
        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        }
    }
}
// OUTPUT:
// Java I/O is powerful
// BufferedWriter reduces disk writes`
                                ]
                            },
                            {
                                content: `<h3>Why Buffering Matters</h3>
An unbuffered <code>FileReader</code>/<code>FileOutputStream</code> can trigger a system call for <strong>every single byte or character</strong> read/written - each system call has real overhead (context switch into the OS kernel).<br><br>

<code>BufferedReader</code>/<code>BufferedWriter</code> (and their byte-stream equivalents) wrap the underlying stream with an internal <code>char[]</code>/<code>byte[]</code> buffer (default 8KB). Reads/writes go against that in-memory array first, and the real system call only happens when the buffer fills up or is explicitly flushed - turning thousands of tiny I/O calls into a handful of large ones.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Unbuffered:  read() read() read() read() ...  -> many system calls
Buffered:    [fill 8KB buffer in one syscall] -> read() read() read() ... (from memory)</pre>

This is why you almost always wrap a raw <code>FileReader</code>/<code>FileWriter</code> in a <code>Buffered*</code> class in real applications.<br>`
                            },
                            {
                                content: `<h3>try-with-resources &amp; AutoCloseable</h3>
Any class implementing <code>AutoCloseable</code> (which includes every I/O stream) can be declared in a try-with-resources header. Multiple resources close automatically in the <strong>reverse</strong> of their declaration order:<br>`,
                                codeExamples: [
                                    `import java.io.*;

class LoggingResource implements AutoCloseable {
    private final String name;
    LoggingResource(String name) { this.name = name; System.out.println("Opened: " + name); }
    @Override public void close() { System.out.println("Closed: " + name); }
}

public class MultiResourceDemo {
    public static void main(String[] args) {
        try (LoggingResource a = new LoggingResource("A");
             LoggingResource b = new LoggingResource("B")) {
            System.out.println("Using resources...");
        }
    }
}
// OUTPUT:
// Opened: A
// Opened: B
// Using resources...
// Closed: B
// Closed: A`
                                ]
                            },
                            {
                                content: `<h3>Common Interview Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Trap</th><th>Explanation</th></tr>
<tr class='text-center'><td>Forgetting to close streams (pre-Java 7)</td><td>Causes file handle/resource leaks; try-with-resources (Java 7+) solves this automatically</td></tr>
<tr class='text-center'><td>read() returns int, not char</td><td>-1 signals end-of-stream; a char type (0 to 65535) can't represent -1, so int is used</td></tr>
<tr class='text-center'><td>InputStreamReader</td><td>Bridges a byte stream into a character stream using a specified/default charset</td></tr>
<tr class='text-center'><td>FileWriter without append flag</td><td>Overwrites the file by default; use new FileWriter(path, true) to append</td></tr>
<tr class='text-center'><td>Flushing</td><td>Buffered writers may hold data in memory until flush()/close() is called - always close (or use try-with-resources) or data may be lost</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> use character streams (Reader/Writer) for text, byte streams (InputStream/OutputStream) for binary data, always wrap with a Buffered* class for performance, and always use try-with-resources so resources close automatically.<br>`
                            }
                        ]
                    };
