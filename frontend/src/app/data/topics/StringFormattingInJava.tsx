import { Topic } from '../coreJava';

export const stringFormattingInJava: Topic = {
    id: 'string-formatting',
    name: 'String Formatting in Java',

    beginner: [
        {
            content: `<h4>Three Ways to Build a Display String</h4>
<ul>
<li><b>Concatenation</b> (<code>"x = " + x</code>) - simplest, but awkward once you need padding, decimal precision, or many values.</li>
<li><code>String.valueOf(x)</code> - converts a single value to text; still needs manual concatenation for anything more.</li>
<li><code>String.format(...)</code> / <code>System.out.printf(...)</code> - a <b>format string</b> with placeholders, the most readable option once more than one or two values are involved.</li>
</ul>`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {
        int id = 7;
        double price = 19.5;

        String a = "id=" + id + ", price=" + price;                // concatenation
        String b = String.valueOf(id) + " / " + String.valueOf(price);  // valueOf
        String c = String.format("id=%d, price=%.2f", id, price);  // format

        System.out.println(a);
        System.out.println(b);
        System.out.println(c);
    }
}
// OUTPUT:
// id=7, price=19.5
// 7 / 19.5
// id=7, price=19.50`
            ]
        },
        {
            content: `<h4>Core Format Specifiers</h4>
<ul>
<li><code>%d</code> - integer</li>
<li><code>%f</code> - floating point (default 6 decimal places)</li>
<li><code>%.2f</code> - floating point rounded to 2 decimal places</li>
<li><code>%s</code> - any object (calls its <code>toString()</code>)</li>
<li><code>%x</code> - integer in hexadecimal</li>
<li><code>%n</code> - platform-correct newline (prefer this over a literal <code>\\n</code>)</li>
</ul>`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {
        System.out.printf("Int: %d%n", 42);
        System.out.printf("Float: %f%n", 3.14159);
        System.out.printf("Rounded: %.2f%n", 3.14159);
        System.out.printf("String: %s%n", "Java");
        System.out.printf("Hex: %x%n", 255);
    }
}
// OUTPUT:
// Int: 42
// Float: 3.141590
// Rounded: 3.14
// String: Java
// Hex: ff`
            ]
        },
        {
            content: `<h4>Width, Alignment, and Thousands Separators</h4>
<ul>
<li><code>%10s</code> - right-justify in a 10-character field.</li>
<li><code>%-10s</code> - left-justify in a 10-character field (the <code>-</code> flips the alignment).</li>
<li><code>%,d</code> - insert thousands separators automatically.</li>
</ul>`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {
        System.out.printf("[%10s]%n", "Java");
        System.out.printf("[%-10s]%n", "Java");
        System.out.printf("Amount: %,d%n", 1234567);
    }
}
// OUTPUT:
// [      Java]
// [Java      ]
// Amount: 1,234,567`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Locale-Aware Formatting with DecimalFormat / NumberFormat</h3>
<code>String.format</code> uses the JVM's default locale unless told otherwise, which can silently produce the wrong decimal/grouping symbol for a different region. <code>NumberFormat</code>/<code>DecimalFormat</code> give explicit control over currency and locale-specific formatting.`,
            codeExamples: [
                `import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;

public class Test {
    public static void main(String[] args) {
        DecimalFormat df = new DecimalFormat("#,##0.00");
        System.out.println(df.format(1234567.891));

        NumberFormat currency = NumberFormat.getCurrencyInstance(Locale.US);
        System.out.println(currency.format(1234.5));
    }
}
// OUTPUT:
// 1,234,567.89
// $1,234.50`
            ]
        },
        {
            content: `<h3>Common Formatting Bugs</h3>
<ul>
<li><b>Using <code>\\n</code> instead of <code>%n</code></b> inside <code>String.format</code>/<code>printf</code> - <code>\\n</code> always emits a Unix-style newline, which can look wrong in some Windows tools; <code>%n</code> emits the platform's actual line separator.</li>
<li><b>Too few arguments</b> - passing fewer arguments than placeholders throws <code>MissingFormatArgumentException</code> at run time, not compile time, because the compiler does not check format strings.</li>
<li><b>Forgetting <code>.2f</code>-style precision</b> on money values - a raw <code>%f</code> prints 6 decimal places by default, not 2.</li>
</ul>`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {
        try {
            String s = String.format("id=%d, name=%s", 7); // missing 2nd argument
            System.out.println(s);
        } catch (java.util.MissingFormatArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Caught: Format specifier '%s'`
            ]
        },
        {
            content: `<h3>Positional Arguments - Reusing a Value</h3>
You can reference the same argument more than once using an explicit index (<code>%1$s</code>) instead of repeating it in the argument list.`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {
        String s = String.format("%1$s is %1$s, no matter how many times you say %1$s", "Java");
        System.out.println(s);
    }
}
// OUTPUT:
// Java is Java, no matter how many times you say Java`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Difference between %n and \\n in printf/String.format?</td><td>%n emits the platform-correct line separator; \\n always emits a Unix-style newline regardless of OS</td></tr>
<tr class='text-center'><td>How do you round a double to 2 decimal places in a formatted string?</td><td>Use %.2f as the specifier</td></tr>
<tr class='text-center'><td>What happens if a format string has more placeholders than arguments?</td><td>MissingFormatArgumentException is thrown at runtime - format strings aren't compile-time checked</td></tr>
<tr class='text-center'><td>How do you left-justify a string in a fixed-width field?</td><td>Add a - flag before the width, e.g. %-10s</td></tr>
<tr class='text-center'><td>When would you use DecimalFormat/NumberFormat over String.format?</td><td>When you need explicit locale-aware or currency formatting instead of the JVM's default locale</td></tr>
</table>`
        }
    ]
};
