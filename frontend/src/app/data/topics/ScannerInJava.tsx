import { Topic } from '../coreJava';

export const scannerInJava: Topic = {
    id: 'scanner-in-java',
    name: 'Scanner in Java',

    beginner: [
        {
            content: `<h4>What is Scanner?</h4>
<b>Scanner</b> is a class in <code>java.util</code> used to read input - most commonly from the keyboard (<code>System.in</code>), but also from a <code>String</code> or a <code>File</code>.
<ul>
<li>It breaks input into <b>tokens</b> using whitespace as the default delimiter and lets you read each token as a specific type (<code>int</code>, <code>double</code>, a whole line, etc.).</li>
<li>It saves you from parsing raw bytes or characters yourself.</li>
</ul>
<b>Basic usage:</b>`,
            codeExamples: [
                `import java.util.Scanner;

public class ScannerBasicDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = sc.nextLine();
        System.out.println("Hello, " + name + "!");
        sc.close();
    }
}
// Sample run (user types "Pankaj"):
// Enter your name: Pankaj
// Hello, Pankaj!`
            ]
        },
        {
            content: `<h4>Reading Different Types</h4>
Scanner has a matching <code>next...()</code> method for each primitive type, plus <code>next()</code> for a single whitespace-delimited word and <code>nextLine()</code> for an entire line.`,
            codeExamples: [
                `import java.util.Scanner;

public class ScannerTypesDemo {
    public static void main(String[] args) {
        // Read from a fixed String so the output is predictable
        Scanner sc = new Scanner("Pankaj 25 50000.75 true");

        String name = sc.next();
        int age = sc.nextInt();
        double salary = sc.nextDouble();
        boolean active = sc.nextBoolean();

        System.out.println("name: " + name);
        System.out.println("age: " + age);
        System.out.println("salary: " + salary);
        System.out.println("active: " + active);

        sc.close();
    }
}
// OUTPUT:
// name: Pankaj
// age: 25
// salary: 50000.75
// active: true`
            ]
        },
        {
            content: `<h4>hasNext...() — Checking Before You Read</h4>
Calling <code>nextInt()</code> (or any <code>next...()</code>) when there's no more matching input throws <code>NoSuchElementException</code>. The <code>hasNext...()</code> family lets you check first - this is the standard pattern for reading an unknown number of values, e.g. in a loop.`,
            codeExamples: [
                `import java.util.Scanner;

public class ScannerLoopDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner("10 20 30 40");

        int sum = 0;
        while (sc.hasNextInt()) {
            sum += sc.nextInt();
        }

        System.out.println("Sum: " + sum);
        sc.close();
    }
}
// OUTPUT:
// Sum: 100`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Classic Trap: nextInt() Followed by nextLine()</h3>
<code>nextInt()</code>, <code>nextDouble()</code>, etc. read only the <b>token itself</b> - they do NOT consume the trailing newline character left in the input buffer. A following <code>nextLine()</code> then immediately reads that leftover empty remainder instead of waiting for new input.
<p>This is one of the most common beginner bugs with Scanner:</p>`,
            codeExamples: [
                `import java.util.Scanner;

public class ScannerBufferBugDemo {
    public static void main(String[] args) {
        // Simulates a user typing "25" then pressing Enter, then typing "Pankaj"
        Scanner sc = new Scanner("25\\nPankaj");

        int age = sc.nextInt();       // reads "25", leaves "\\n" in the buffer
        String name = sc.nextLine();  // BUG: reads the leftover empty ""

        System.out.println("age: " + age);
        System.out.println("name: [" + name + "]");   // unexpectedly empty!

        sc.close();
    }
}
// OUTPUT:
// age: 25
// name: []`,
                `import java.util.Scanner;

public class ScannerBufferFixDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner("25\\nPankaj");

        int age = sc.nextInt();
        sc.nextLine();               // FIX: consume the leftover newline first
        String name = sc.nextLine(); // now reads the actual next line correctly

        System.out.println("age: " + age);
        System.out.println("name: [" + name + "]");

        sc.close();
    }
}
// OUTPUT:
// age: 25
// name: [Pankaj]`
            ]
        },
        {
            content: `<h3>InputMismatchException</h3>
If the next token doesn't match the type you asked for, Scanner throws <code>InputMismatchException</code> - and critically, the <b>bad token is NOT consumed</b>, so it's still sitting there for the next read (which will fail again unless you skip it).`,
            codeExamples: [
                `import java.util.Scanner;

public class ScannerMismatchDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner("abc");

        try {
            int value = sc.nextInt();
            System.out.println(value);
        } catch (java.util.InputMismatchException e) {
            System.out.println("Caught: not a valid integer");
            System.out.println("Still there: " + sc.next()); // the bad token is unconsumed
        }

        sc.close();
    }
}
// OUTPUT:
// Caught: not a valid integer
// Still there: abc`
            ]
        },
        {
            content: `<h3>Custom Delimiters</h3>
By default Scanner splits on whitespace, but <code>useDelimiter(regex)</code> lets it tokenize on anything - useful for CSV-style input.`,
            codeExamples: [
                `import java.util.Scanner;

public class ScannerDelimiterDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner("Pankaj,25,Pune");
        sc.useDelimiter(",");

        while (sc.hasNext()) {
            System.out.println(sc.next());
        }

        sc.close();
    }
}
// OUTPUT:
// Pankaj
// 25
// Pune`
            ]
        },
        {
            content: `<h3>Scanner Sources: String, File, and try-with-resources</h3>
Scanner can wrap a <code>String</code>, a <code>File</code>/<code>InputStream</code>, or <code>System.in</code> - the same API works regardless of source. Since Scanner implements <code>Closeable</code>, wrapping it in <b>try-with-resources</b> guarantees it's closed even if reading throws.
<p><b>Important:</b> closing a Scanner wrapped around <code>System.in</code> also closes the underlying <code>System.in</code> stream - so if your program needs to read from the console again later, don't close a <code>System.in</code>-backed Scanner prematurely (typically you only close it once, right before the program ends).</p>`,
            codeExamples: [
                `import java.util.Scanner;

public class ScannerTryWithResourcesDemo {
    public static void main(String[] args) {
        try (Scanner sc = new Scanner("line one\\nline two\\nline three")) {
            while (sc.hasNextLine()) {
                System.out.println(sc.nextLine());
            }
        } // sc.close() called automatically here
    }
}
// OUTPUT:
// line one
// line two
// line three`
            ]
        },
        {
            content: `<h3>Full Scanner Method Reference</h3>
Beyond <code>nextInt()</code>/<code>nextDouble()</code>/<code>next()</code>/<code>nextLine()</code>, Scanner has a matching read method for every other primitive type, plus support for arbitrary-precision numbers:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Reads</th></tr>
<tr class='text-center'><td>nextByte()</td><td>a byte value</td></tr>
<tr class='text-center'><td>nextShort()</td><td>a short value</td></tr>
<tr class='text-center'><td>nextInt()</td><td>an int value</td></tr>
<tr class='text-center'><td>nextLong()</td><td>a long value</td></tr>
<tr class='text-center'><td>nextFloat()</td><td>a float value</td></tr>
<tr class='text-center'><td>nextDouble()</td><td>a double value</td></tr>
<tr class='text-center'><td>nextBoolean()</td><td>a boolean value</td></tr>
<tr class='text-center'><td>next()</td><td>a single whitespace-delimited word</td></tr>
<tr class='text-center'><td>nextLine()</td><td>an entire line of text</td></tr>
<tr class='text-center'><td>nextBigInteger()</td><td>a java.math.BigInteger (arbitrary-precision whole number)</td></tr>
<tr class='text-center'><td>nextBigDecimal()</td><td>a java.math.BigDecimal (arbitrary-precision decimal)</td></tr>
</table>
<p><code>nextBigInteger()</code>/<code>nextBigDecimal()</code> matter when a value is too large for <code>long</code>/<code>double</code>, or when you need exact decimal precision (e.g. financial calculations) instead of binary floating-point.</p>
<p>There's also no <code>nextChar()</code> - to read a single character, read a word with <code>next()</code> and take its first character with <code>charAt(0)</code>.</p>`,
            codeExamples: [
                `import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Scanner;

public class ScannerBigNumberDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner("111111111111 222222222222.55");

        BigInteger hugeWhole = sc.nextBigInteger();
        BigDecimal hugeDecimal = sc.nextBigDecimal();

        System.out.println("BigInteger: " + hugeWhole);
        System.out.println("BigDecimal: " + hugeDecimal);

        sc.close();
    }
}
// OUTPUT:
// BigInteger: 111111111111
// BigDecimal: 222222222222.55`,
                `import java.util.Scanner;

public class ScannerCharDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner("M");

        // no nextChar() exists: read a word, take its first char
        char gender = sc.next().charAt(0);
        System.out.println("gender: " + gender);

        sc.close();
    }
}
// OUTPUT:
// gender: M`
            ]
        },
        {
            content: `<h3>Scanner vs BufferedReader</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Scanner</th><th>BufferedReader</th></tr>
<tr class='text-center'><td>Parsing</td><td>Built-in per-type parsing (nextInt, nextDouble, ...)</td><td>Reads raw text only - you parse it yourself (e.g. Integer.parseInt)</td></tr>
<tr class='text-center'><td>Performance</td><td>Slower - regex-based tokenizing overhead</td><td>Faster - simple buffered character reads</td></tr>
<tr class='text-center'><td>Ease of use</td><td>Simpler for typed, tokenized input</td><td>Simpler for fast line-by-line raw text</td></tr>
<tr class='text-center'><td>Typical use case</td><td>Small console programs, quick input parsing</td><td>Large files, performance-sensitive reading</td></tr>
</table>
<p>For everyday console input and small programs, Scanner's convenience wins. For reading large files quickly, BufferedReader is the better choice.</p>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does nextLine() after nextInt() return an empty string?</td><td>nextInt() consumes only the number token, leaving the trailing newline in the buffer; the following nextLine() immediately reads that leftover empty remainder</td></tr>
<tr class='text-center'><td>How do you fix the nextInt()/nextLine() bug?</td><td>Call an extra sc.nextLine() right after nextInt() to consume the leftover newline before reading the next real line</td></tr>
<tr class='text-center'><td>What happens if the input doesn't match the requested type?</td><td>Scanner throws InputMismatchException, and the invalid token is NOT consumed - it stays for the next read</td></tr>
<tr class='text-center'><td>What is Scanner's default delimiter?</td><td>Whitespace (spaces, tabs, newlines) - changeable via useDelimiter(regex)</td></tr>
<tr class='text-center'><td>Is it safe to close a Scanner wrapped around System.in and then read again later?</td><td>No - closing it also closes System.in itself, so any later read attempt will fail</td></tr>
<tr class='text-center'><td>Scanner vs BufferedReader - which is faster?</td><td>BufferedReader, since Scanner's type parsing uses regex-based tokenizing that adds overhead</td></tr>
</table>`
        }
    ]
};
