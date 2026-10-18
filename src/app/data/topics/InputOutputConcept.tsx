import { Topic } from '../coreJava';

export const inputOutputConcept: Topic = {
    id: 'input-output-concept',
    name: 'Input/Output',
    beginner: [
        {
            content: `<h3>What is Input/Output (I/O)?</h3>
Input is data flowing <strong>into</strong> a program (from the keyboard, a file, a network, etc.), and output is data flowing <strong>out</strong> of a program (to the screen, a file, a database, etc.). Almost every useful program needs to interact with the outside world this way, rather than working on hard-coded data alone.<br>`,
            codeExamples: [`public class WhatIsIO {
    public static void main(String[] args) {
        // Output: sending data OUT of the program to the console
        System.out.println("This is output");
    }
}
// OUTPUT:
// This is output`]
        },
        {
            content: `<h3>Output with System.out</h3>
The simplest form of output in Java is printing to the console using <code>System.out.println()</code> (prints with a newline) or <code>System.out.print()</code> (prints without one).<br>`,
            codeExamples: [`public class OutputDemo {
    public static void main(String[] args) {
        System.out.print("No newline here... ");
        System.out.println("this continues the same line.");
        System.out.println("This line is separate.");
    }
}
// OUTPUT:
// No newline here... this continues the same line.
// This line is separate.`]
        },
        {
            content: `<h3>Input with Scanner</h3>
To read input typed by the user, Java provides the <code>Scanner</code> class, which reads from <code>System.in</code> (the keyboard, by default).<br>`,
            codeExamples: [`import java.util.Scanner;

public class InputDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter your name: ");
        // Simulating what would happen if the user typed "Prataprao" and pressed Enter:
        String name = "Prataprao"; // in a real program: scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}
// OUTPUT:
// Enter your name:
// Hello, Prataprao!`]
        },
        {
            content: `<h3>Reading Different Types of Input</h3>
Scanner has different methods for different data types - <code>nextInt()</code> for whole numbers, <code>nextDouble()</code> for decimals, <code>nextLine()</code> for a full line of text, and more.<br>`,
            codeExamples: [`import java.util.Scanner;

public class TypedInputDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Simulating: user enters 25 for age
        int age = 25; // in a real program: scanner.nextInt();
        System.out.println("You are " + age + " years old.");
        scanner.close();
    }
}
// OUTPUT:
// You are 25 years old.`]
        },
    ],
    expert: [
        {
            content: `<h3>Streams: The Underlying I/O Model</h3>
Java models all I/O as <strong>streams</strong> - a sequence of data flowing from a source to a destination, one piece at a time. There are two families: <strong>byte streams</strong> (raw binary data, classes ending in Stream, e.g. FileInputStream) and <strong>character streams</strong> (text data with encoding handling, classes ending in Reader/Writer, e.g. FileReader).<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Stream Family</th><th>Handles</th><th>Base Classes</th><th>Example</th></tr>
<tr class='text-center'><td>Byte streams</td><td>Raw binary data (images, any file)</td><td>InputStream / OutputStream</td><td>FileInputStream, FileOutputStream</td></tr>
<tr class='text-center'><td>Character streams</td><td>Text, with character-encoding awareness</td><td>Reader / Writer</td><td>FileReader, FileWriter, BufferedReader</td></tr>
</table>`,
            codeExamples: [`import java.io.*;

public class StreamsDemo {
    public static void main(String[] args) throws IOException {
        // Character stream: write text to a file
        try (FileWriter writer = new FileWriter("demo.txt")) {
            writer.write("Hello, streams!");
        }
        // Character stream: read it back
        try (BufferedReader reader = new BufferedReader(new FileReader("demo.txt"))) {
            System.out.println(reader.readLine());
        }
        new File("demo.txt").delete(); // cleanup
    }
}
// OUTPUT:
// Hello, streams!`]
        },
        {
            content: `<h3>Buffered I/O: Reducing Costly Round-Trips</h3>
Reading or writing one byte/character at a time is slow, because each raw operation may involve a costly system call. <strong>Buffered</strong> streams (BufferedReader, BufferedWriter, BufferedInputStream) collect data in an in-memory buffer and only perform the underlying I/O operation in larger chunks, dramatically improving performance.<br>`,
            codeExamples: [`import java.io.*;

public class BufferedIODemo {
    public static void main(String[] args) throws IOException {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter("buffered.txt"))) {
            for (int i = 1; i <= 3; i++) {
                bw.write("Line " + i);
                bw.newLine(); // buffered internally, flushed together for efficiency
            }
        }
        try (BufferedReader br = new BufferedReader(new FileReader("buffered.txt"))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        }
        new File("buffered.txt").delete();
    }
}
// OUTPUT:
// Line 1
// Line 2
// Line 3`]
        },
        {
            content: `<h3>try-with-resources: Guaranteeing Streams Get Closed</h3>
Every open stream holds an operating-system resource (a file handle, a socket). Forgetting to close it leaks resources. Java's <strong>try-with-resources</strong> statement automatically closes any resource implementing <code>AutoCloseable</code> when the block exits - even if an exception is thrown - so you never need a manual <code>finally { close(); }</code>.<br>`,
            codeExamples: [`import java.util.Scanner;

public class TryWithResourcesDemo {
    public static void main(String[] args) {
        // The Scanner is automatically closed when this block ends,
        // even if an exception occurs while reading.
        try (Scanner sc = new Scanner(System.in)) {
            System.out.println("Scanner opened and will auto-close");
        }
        System.out.println("Scanner is now closed - no manual close() needed");
    }
}
// OUTPUT:
// Scanner opened and will auto-close
// Scanner is now closed - no manual close() needed`]
        },
        {
            content: `<h3>Standard I/O Streams: System.in, System.out, System.err</h3>
Every Java program is handed three pre-connected streams by the JVM at startup: <code>System.in</code> (standard input, usually the keyboard), <code>System.out</code> (standard output, usually the console), and <code>System.err</code> (standard error, also usually the console, but kept separate so errors can be redirected independently from normal output).<br>`,
            codeExamples: [`public class StandardStreamsDemo {
    public static void main(String[] args) {
        System.out.println("Normal output goes to System.out");
        System.err.println("Error messages go to System.err");
        // In a terminal, these can be redirected separately:
        // java StandardStreamsDemo > output.log 2> errors.log
    }
}
// OUTPUT:
// Normal output goes to System.out
// Error messages go to System.err`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between byte streams and character streams in Java?</td><td>Byte streams (InputStream/OutputStream) handle raw binary data; character streams (Reader/Writer) handle text and account for character encoding</td></tr>
<tr class='text-center'><td>Why use buffered streams instead of raw streams?</td><td>They reduce the number of expensive low-level I/O operations by batching reads/writes through an in-memory buffer, improving performance significantly</td></tr>
<tr class='text-center'><td>What problem does try-with-resources solve?</td><td>It guarantees that any AutoCloseable resource (streams, Scanner, etc.) is closed automatically when the block exits, even on an exception - preventing resource leaks</td></tr>
<tr class='text-center'><td>What are the three standard streams every Java program has access to?</td><td>System.in (input), System.out (output), System.err (error output)</td></tr>
<tr class='text-center'><td>Why is System.err kept separate from System.out?</td><td>So error output and normal output can be redirected/logged independently, e.g. in shell scripting</td></tr>
<tr class='text-center'><td>What class is commonly used to read user input from the console in Java?</td><td>java.util.Scanner, wrapping System.in</td></tr>
<tr class='text-center'><td>What happens if you don't close an open file stream?</td><td>The underlying OS resource (file handle) stays allocated until the JVM eventually reclaims it (or not at all), which can exhaust available file handles over time</td></tr>
</table>`
        },
    ],
};
