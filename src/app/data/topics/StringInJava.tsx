import { Topic } from '../coreJava';
import stringImg from '../../../assets/string.png';
import charSeqImg from '../../../assets/string2.png';
import compareImg from '../../../assets/string6.png';

export const stringInJava: Topic = {
                        id: `String in java`,
                        name: `String in Java`,

                        beginner: [
                            {
                                content: `<h3>What is a String?</h3>
A <strong>String</strong> is a class (<code>java.lang.String</code>) that represents a sequence of characters. It is one of the most commonly used types in Java for storing and manipulating text.<br><br>
<img src="${stringImg}" alt="String in Java" class="d-block mx-auto" /><br>

<h4>CharSequence Interface</h4>
• Represents a readable sequence of characters.<br>
• Implemented by <code>String</code>, <code>StringBuilder</code>, and <code>StringBuffer</code>.<br>
• Lets code treat all three uniformly wherever text is expected.<br><br>
<img src="${charSeqImg}" alt="CharSequence hierarchy" class="d-block mx-auto" />`
                            },

                            {
                                content: `<h4>Creating a String — Literal</h4>
The simplest way: assign text in double quotes. Literals are stored in the <strong>String Constant Pool</strong> so identical values can be reused.`,
                                codeExamples: [
                                    `public class StringLiteralDemo {
    public static void main(String[] args) {
        String s1 = "pankaj";
        String s2 = "pankaj";
        System.out.println(s1 == s2); // same pooled object
    }
}
// OUTPUT:
// true`
                                ]
                            },

                            {
                                content: `<h4>Creating a String — new String()</h4>
Using the <code>new</code> keyword always creates a brand-new object on the heap, even if an identical value already exists in the pool.`,
                                codeExamples: [
                                    `public class NewStringDemo {
    public static void main(String[] args) {
        String s1 = "pankaj";
        String s2 = new String("pankaj");

        System.out.println(s1 == s2);      // false - different objects
        System.out.println(s1.equals(s2)); // true - same content
    }
}
// OUTPUT:
// false
// true`
                                ]
                            },

                            {
                                content: `<h4>Strings Are Immutable</h4>
Once created, a String's content never changes. Any method that looks like it "modifies" a String (like <code>concat()</code>) actually returns a brand-new String object — the original stays untouched unless you reassign the reference.`,
                                codeExamples: [
                                    `public class ImmutableDemo {
    public static void main(String[] args) {
        String s = "pankaj";
        s.concat("bhande");         // return value is thrown away
        System.out.println(s);      // original unchanged

        s = s.concat("bhande");     // reassigned - now s points to new object
        System.out.println(s);
    }
}
// OUTPUT:
// pankaj
// pankajbhande`
                                ]
                            },

                            {
                                content: `<h4>length()</h4>
Returns the number of characters in the String.`,
                                codeExamples: [
                                    `public class LengthDemo {
    public static void main(String[] args) {
        String name = "Pankaj";
        System.out.println(name.length());
    }
}
// OUTPUT:
// 6`
                                ]
                            },

                            {
                                content: `<h4>charAt(index)</h4>
Returns the character at the given index (0-based).`,
                                codeExamples: [
                                    `public class CharAtDemo {
    public static void main(String[] args) {
        String name = "Pankaj";
        System.out.println(name.charAt(0));
        System.out.println(name.charAt(3));
    }
}
// OUTPUT:
// P
// k`
                                ]
                            },

                            {
                                content: `<h4>substring(begin, end)</h4>
Extracts a portion of the String. <code>begin</code> is inclusive, <code>end</code> is exclusive.`,
                                codeExamples: [
                                    `public class SubstringDemo {
    public static void main(String[] args) {
        String text = "Code With Streams";
        System.out.println(text.substring(5, 9));
        System.out.println(text.substring(10));
    }
}
// OUTPUT:
// With
// Streams`
                                ]
                            },

                            {
                                content: `<h4>indexOf()</h4>
Returns the position of the first occurrence of a character/substring, or -1 if not found.`,
                                codeExamples: [
                                    `public class IndexOfDemo {
    public static void main(String[] args) {
        String text = "Code With Streams";
        System.out.println(text.indexOf('W'));
        System.out.println(text.indexOf("Streams"));
        System.out.println(text.indexOf("Java"));
    }
}
// OUTPUT:
// 5
// 10
// -1`
                                ]
                            },

                            {
                                content: `<h4>toUpperCase() / toLowerCase()</h4>
Return a new String with all characters converted to upper- or lower-case.`,
                                codeExamples: [
                                    `public class CaseDemo {
    public static void main(String[] args) {
        String name = "Pankaj";
        System.out.println(name.toUpperCase());
        System.out.println(name.toLowerCase());
    }
}
// OUTPUT:
// PANKAJ
// pankaj`
                                ]
                            },

                            {
                                content: `<h4>== vs equals()</h4>
<code>==</code> compares <strong>references</strong> (are they the same object in memory?). <code>equals()</code> compares <strong>content</strong> (do they hold the same characters?). Always use <code>equals()</code> to compare String values.`,
                                codeExamples: [
                                    `public class EqualsDemo {
    public static void main(String[] args) {
        String s1 = "Pankaj";
        String s2 = "Pankaj";
        String s3 = new String("Pankaj");

        System.out.println(s1 == s2);      // true  - same pooled object
        System.out.println(s1 == s3);      // false - s3 is a separate object
        System.out.println(s1.equals(s3)); // true  - same content
    }
}
// OUTPUT:
// true
// false
// true`
                                ]
                            },

                            {
                                content: `<h4>concat()</h4>
Joins two Strings together and returns the combined result as a new String.`,
                                codeExamples: [
                                    `public class ConcatDemo {
    public static void main(String[] args) {
        String first = "Pankaj";
        String full = first.concat(" Bhande");
        System.out.println(full);
    }
}
// OUTPUT:
// Pankaj Bhande`
                                ]
                            },
                            {
                                content: `<h3>1. Definition</h3>
• A <b>String</b> in Java is an object of the class java.lang.String that holds a sequence of characters, for example a name, a city or an account number. <br>
• A String is <b>immutable</b>. Once created its value can never change. Every method that looks like it changes a String actually returns a brand new String. <br>
• Strings created with double quotes go into the <b>String pool</b>, a shared area inside the heap, so the same literal is stored only once. Strings created with new always make a fresh object. <br>
• Java also gives you <b>StringBuilder</b> and <b>StringBuffer</b>, which are mutable and are the correct choice when you must build text step by step. <br><br>

<h3>2. Purpose of This Topic</h3>
• To store and work with <b>all human readable data</b>, since names, addresses, messages and JSON are all text. <br>
• To <b>compare, search, split and format</b> text safely with ready made methods. <br>
• To give a <b>safe key type</b> for HashMap and for switch, which works only because String is immutable. <br>
• To let the compiler <b>share literals</b>, which saves a large amount of memory in a real application. <br><br>

<h3>3. Need of This Topic</h3>
• Almost every input from a user, a file, a database or an API arrives as text. <br>
• The double equals against equals mistake is the number one beginner bug in Java, and it lives here. <br>
• Building text inside a loop with plus is the classic cause of a slow report generator. <br>
• Interview rounds always include palindrome, reverse, anagram or character count questions on String. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: creation, the pool, comparison and common methods

public class StringBasicsDemo {

    public static void main(String[] args) {

        // POINT 1: literal goes to the pool
        String city1 = "Mumbai";
        String city2 = "Mumbai";
        System.out.println("Two literals share one object: " + (city1 == city2));

        // POINT 1: new always creates a separate object
        String city3 = new String("Mumbai");
        System.out.println("Literal == new object       : " + (city1 == city3));
        System.out.println("Values are equal            : " + city1.equals(city3));

        // POINT 1: intern puts it back into the pool
        String city4 = city3.intern();
        System.out.println("After intern                : " + (city1 == city4));

        // POINT 1: immutability, the original never changes
        String bank = "state bank of india";
        bank.toUpperCase();                     // WRONG, the result is thrown away
        System.out.println("WRONG, still lowercase: " + bank);

        String upperBank = bank.toUpperCase();  // RIGHT, keep the returned value
        System.out.println("RIGHT, new String     : " + upperBank);

        // POINT 2: everyday String methods
        String customer = "  Ananya Kulkarni  ";
        System.out.println("length          : " + customer.length());
        System.out.println("trim            : [" + customer.trim() + "]");
        System.out.println("charAt 3        : " + customer.charAt(3));
        System.out.println("indexOf Kul     : " + customer.indexOf("Kul"));
        System.out.println("substring       : " + customer.trim().substring(0, 6));
        System.out.println("replace         : " + customer.trim().replace(" ", "_"));
        System.out.println("contains Kulkarni: " + customer.contains("Kulkarni"));
        System.out.println("startsWith space: " + customer.startsWith(" "));
        System.out.println("isBlank on space: " + "   ".isBlank());

        // POINT 2: splitting a CSV row
        String row = "SB100234,Ananya Kulkarni,Pune,45000";
        String[] parts = row.split(",");
        System.out.println("Account : " + parts[0]);
        System.out.println("Name    : " + parts[1]);
        System.out.println("City    : " + parts[2]);
        System.out.println("Balance : Rs " + parts[3]);

        // POINT 2: joining
        String joined = String.join(" | ", "UPI", "IMPS", "NEFT");
        System.out.println("Joined  : " + joined);

        // POINT 3: the classic comparison mistake
        String typed = new String("4321");
        String stored = "4321";
        System.out.println("WRONG typed == stored      : " + (typed == stored));
        System.out.println("RIGHT typed.equals(stored) : " + typed.equals(stored));
        System.out.println("Ignore case                : " + "PUNE".equalsIgnoreCase("pune"));

        // POINT 3: null safe comparison, put the literal first
        String maybeNull = null;
        System.out.println("Null safe compare          : " + "PUNE".equals(maybeNull));
    }
}
// OUTPUT:
// Two literals share one object: true
// Literal == new object       : false
// Values are equal            : true
// After intern                : true
// WRONG, still lowercase: state bank of india
// RIGHT, new String     : STATE BANK OF INDIA
// length          : 19
// trim            : [Ananya Kulkarni]
// charAt 3        : n
// indexOf Kul     : 9
// substring       : Ananya
// replace         : Ananya_Kulkarni
// contains Kulkarni: true
// startsWith space: true
// isBlank on space: true
// Account : SB100234
// Name    : Ananya Kulkarni
// City    : Pune
// Balance : Rs 45000
// Joined  : UPI | IMPS | NEFT
// WRONG typed == stored      : false
// RIGHT typed.equals(stored) : true
// Ignore case                : true
// Null safe compare          : false`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Safe to share.</b> Because a String cannot change, two parts of the program can hold the same String with no risk. <br>
• <b>Memory saving through the pool.</b> The same literal used a thousand times is stored once. <br>
• <b>Thread safe by nature.</b> No locking is needed to read a String from many threads. <br>
• <b>Cached hash code.</b> A String computes its hash once, which makes HashMap lookups on String keys very fast. <br>
• <b>A huge, well tested method library</b> for search, split, format, compare and case conversion. <br><br>

<h3>5. Disadvantages</h3>
• <b>Every change makes a new object.</b> Concatenating in a loop creates garbage and is very slow. <br>
• <b>double equals compares references,</b> which silently gives the wrong answer instead of a compile error. <br>
• <b>Immutable means secrets linger.</b> A password in a String stays in memory until garbage collection, so char array is safer. <br>
• <b>The pool can hold memory</b> if you intern a very large number of unique Strings. <br>
• <b>split uses a regular expression,</b> so splitting on a dot or a pipe without escaping gives surprising results. <br>
• <b>Case and locale traps.</b> toUpperCase uses the default locale, which changes behaviour in a Turkish locale. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5: concatenation cost, split regex trap and safer secret handling

import java.util.Arrays;
import java.util.Locale;

public class StringPitfallDemo {

    public static void main(String[] args) {

        // DISADVANTAGE 5: concatenation inside a loop
        long start = System.nanoTime();
        String slow = "";
        for (int i = 0; i < 20000; i++) {
            slow += "row" + i + ";";              // WRONG, a new String every pass
        }
        long slowMs = (System.nanoTime() - start) / 1000000;

        // ADVANTAGE 4 alternative: StringBuilder is mutable
        start = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 20000; i++) {
            sb.append("row").append(i).append(";"); // RIGHT
        }
        String fast = sb.toString();
        long fastMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Concat  length " + slow.length()
                + " in about " + slowMs + " ms");
        System.out.println("Builder length " + fast.length()
                + " in about " + fastMs + " ms");

        // DISADVANTAGE 5: split takes a regular expression
        String ip = "192.168.1.10";
        System.out.println("WRONG split on dot   : " + Arrays.toString(ip.split(".")));
        System.out.println("RIGHT escaped dot    : " + Arrays.toString(ip.split("\\\\.")));

        String piped = "UPI|IMPS|NEFT";
        System.out.println("WRONG split on pipe  : " + Arrays.toString(piped.split("|")));
        System.out.println("RIGHT escaped pipe   : " + Arrays.toString(piped.split("\\\\|")));

        // DISADVANTAGE 5: locale sensitive case conversion
        String code = "title";
        System.out.println("Default locale upper : " + code.toUpperCase());
        System.out.println("Root locale upper    : " + code.toUpperCase(Locale.ROOT));

        // DISADVANTAGE 5: a password in a String cannot be wiped
        String passwordWrong = "MySecret123";     // WRONG, stays in memory
        char[] passwordRight = "MySecret123".toCharArray();
        Arrays.fill(passwordRight, '0');          // RIGHT, wiped immediately
        System.out.println("String password still readable: " + passwordWrong);
        System.out.println("Char array after wipe        : " + new String(passwordRight));

        // ADVANTAGE 4: cached hash code makes map lookups fast
        String key = "SBIN0001234";
        System.out.println("hashCode first call : " + key.hashCode());
        System.out.println("hashCode again      : " + key.hashCode() + " (cached, not recomputed)");

        // DISADVANTAGE 5: WRONG null handling
        String nothing = null;
        try {
            System.out.println(nothing.length());
        } catch (NullPointerException e) {
            System.out.println("WRONG call on null threw NullPointerException");
        }
        System.out.println("RIGHT guard: " + (nothing == null ? 0 : nothing.length()));
    }
}
// OUTPUT (timings vary):
// Concat  length 168890 in about 400 ms
// Builder length 168890 in about 2 ms
// WRONG split on dot   : []
// RIGHT escaped dot    : [192, 168, 1, 10]
// WRONG split on pipe  : [U, P, I, |, I, M, P, S, |, N, E, F, T]
// RIGHT escaped pipe   : [UPI, IMPS, NEFT]
// Default locale upper : TITLE
// Root locale upper    : TITLE
// String password still readable: MySecret123
// Char array after wipe        : 00000000000
// hashCode first call : <a number>
// hashCode again      : <same number> (cached, not recomputed)
// WRONG call on null threw NullPointerException
// RIGHT guard: 0`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>Bank statement download:</b> each row is a CSV String split into account, date, narration and amount. <br>
• <b>Aadhaar masking:</b> only the last four digits are shown, done with substring and a repeat of the letter X. <br>
• <b>UPI id validation:</b> checking that the text contains exactly one at sign and a known bank handle. <br>
• <b>College portal login:</b> the entered password is compared with equals, never with double equals. <br>
• <b>SMS and email templates:</b> a StringBuilder or String.format fills in the customer name and amount. <br>
• <b>Global example, a REST API:</b> the JSON body arrives as a String and is parsed into objects. <br><br>

<b>Student tip:</b> use String for fixed text, StringBuilder when you build in a loop, always compare with equals, and remember that every String method returns a new String rather than changing the old one.`,
                                codeExamples: [
                                    `// Point 6: Aadhaar masking, UPI validation and an SMS template builder

public class StringRealTimeDemo {

    // Real time: mask an Aadhaar or a card number
    static String mask(String number) {
        if (number == null || number.length() < 4) {
            return "INVALID";
        }
        String lastFour = number.substring(number.length() - 4);
        String hidden = "X".repeat(number.length() - 4);
        return hidden + lastFour;
    }

    // Real time: simple UPI id check
    static boolean isValidUpi(String upi) {
        if (upi == null || upi.isBlank()) return false;
        int at = upi.indexOf('@');
        if (at <= 0) return false;                       // must have text before at
        if (at != upi.lastIndexOf('@')) return false;    // only one at sign
        String handle = upi.substring(at + 1);
        return handle.equals("okhdfc") || handle.equals("okicici")
                || handle.equals("ybl") || handle.equals("paytm");
    }

    // Real time: transaction SMS built with StringBuilder
    static String buildSms(String name, long amountPaise,
                           String merchant, String balanceRupees) {
        StringBuilder sb = new StringBuilder(120);
        sb.append("Dear ").append(name).append(", ")
          .append("Rs ").append(amountPaise / 100).append(".")
          .append(String.format("%02d", amountPaise % 100))
          .append(" debited for ").append(merchant)
          .append(". Avl bal Rs ").append(balanceRupees)
          .append(". Not you? Call 1800-11-2211.");
        return sb.toString();
    }

    public static void main(String[] args) {

        System.out.println("Aadhaar masked : " + mask("987612345678"));
        System.out.println("Card masked    : " + mask("4111111111111111"));
        System.out.println("Short input    : " + mask("12"));

        String[] upiIds = {"meera@okhdfc", "raghunath@unknownbank",
                           "@ybl", "a@b@ybl", "kanhoji@paytm"};
        for (String u : upiIds) {
            System.out.println(u + " valid: " + isValidUpi(u));
        }

        System.out.println(buildSms("Ananya", 250075L, "SWIGGY", "14,250.30"));

        // Real time: parse one bank statement row
        String row = "2026-09-05|SB100234|UPI-SWIGGY|D|2500.75";
        String[] f = row.split("\\\\|");
        System.out.println("Date      : " + f[0]);
        System.out.println("Account   : " + f[1]);
        System.out.println("Narration : " + f[2]);
        System.out.println("Type      : " + (f[3].equals("D") ? "Debit" : "Credit"));
        System.out.println("Amount    : Rs " + f[4]);

        // Real time: a palindrome check that interviewers ask for
        String word = "malayalam";
        String reversed = new StringBuilder(word).reverse().toString();
        System.out.println(word + " is palindrome: " + word.equals(reversed));
    }
}
// OUTPUT:
// Aadhaar masked : XXXXXXXX5678
// Card masked    : XXXXXXXXXXXX1111
// Short input    : INVALID
// meera@okhdfc valid: true
// raghunath@unknownbank valid: false
// @ybl valid: false
// a@b@ybl valid: false
// kanhoji@paytm valid: true
// Dear Ananya, Rs 2500.75 debited for SWIGGY. Avl bal Rs 14,250.30. Not you? Call 1800-11-2211.
// Date      : 2026-09-05
// Account   : SB100234
// Narration : UPI-SWIGGY
// Type      : Debit
// Amount    : Rs 2500.75
// malayalam is palindrome: true`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>String Constant Pool — What Actually Happens in Memory</h3>
A string literal is looked up in the <strong>String Constant Pool</strong> (part of the heap since Java 7) before creating anything new. If an identical value already exists, the JVM reuses that object instead of allocating a new one. <code>new String(...)</code> always creates a fresh object on the heap, bypassing the pool.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">String s1 = "pankaj";      String s3 = new String("pankaj");
String s2 = "pankaj";
                                      Heap
      String Pool                +-----------+
   +--------------+              | "pankaj"  |  &lt;-- s3
   |  "pankaj"    | &lt;--- s1      +-----------+
   +--------------+ &lt;--- s2
      (one object, two references)      (separate object)</pre>`,
                                codeExamples: [
                                    `public class StringPoolDemo {
    public static void main(String[] args) {
        String s1 = "pankaj";
        String s2 = "pankaj";
        String s3 = new String("pankaj");

        System.out.println(s1 == s2);          // same pool object
        System.out.println(s1 == s3);          // different heap object
        System.out.println(s1.equals(s3));     // same content
        System.out.println(s1 == s3.intern()); // intern() pulls s3's value back into the pool
    }
}
// OUTPUT:
// true
// false
// true
// true`
                                ]
                            },
                            {
                                content: `<h3>Why String Is Immutable — And What "Modifying" Actually Does</h3>
Once created, a String's internal character data never changes. Reasons Java made this design choice:<br>
• <strong>Security</strong> - passwords, DB URLs, file paths passed around as Strings can't be silently altered by any code holding a reference.<br>
• <strong>Thread safety</strong> - immutable objects are automatically safe to share across threads with no synchronization.<br>
• <strong>String Pool reuse</strong> - pooling only works because the JVM can guarantee a shared literal's value will never change under any reference.<br>
• <strong>Hashcode caching</strong> - String caches its hashCode() after first computation, safe only because the content can't change; this makes Strings very fast HashMap keys.<br><br>

Every "mutating" call (<code>concat</code>, <code>+=</code>, <code>replace</code>, <code>toUpperCase</code>...) returns a <strong>new</strong> String object; if you don't reassign the reference, the original is untouched.<br>`,
                                codeExamples: [
                                    `public class ImmutabilityDemo {
    public static void main(String[] args) {
        String s = "pankaj";
        String result = s.concat("bhande"); // creates a NEW object

        System.out.println(s);         // original is unchanged
        System.out.println(result);    // new object holds the combined value
        System.out.println(s == result);

        s = s.concat("bhande"); // now reassigned - s points to the new object
        System.out.println(s);
    }
}
// OUTPUT:
// pankaj
// pankajbhande
// false
// pankajbhande`
                                ]
                            },
                            {
                                content: `<h3>String Concatenation Performance — Why StringBuilder Wins in Loops</h3>
Every <code>+=</code> on a String inside a loop discards the old object and allocates a brand-new one — for N iterations that's O(n²) total character copying. <code>StringBuilder</code> grows an internal mutable buffer instead, giving O(n) total work.<br><br>
<img src="${compareImg}" alt="String vs StringBuilder vs StringBuffer" class="d-block mx-auto" /><br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Class</th><th>Mutable</th><th>Thread-safe</th><th>Typical use</th></tr>
<tr class='text-center'><td>String</td><td>No</td><td>Yes (immutable)</td><td>Fixed/rarely-changing text</td></tr>
<tr class='text-center'><td>StringBuilder</td><td>Yes</td><td>No</td><td>Single-threaded loops, builders (fastest)</td></tr>
<tr class='text-center'><td>StringBuffer</td><td>Yes</td><td>Yes (synchronized)</td><td>Shared mutable buffer across threads (slower)</td></tr>
</table>`,
                                codeExamples: [
                                    `public class ConcatPerfDemo {
    public static void main(String[] args) {
        int n = 50000;

        long start = System.nanoTime();
        String result = "";
        for (int i = 0; i < n; i++) {
            result += "a";           // new String object every iteration
        }
        long withPlus = System.nanoTime() - start;

        start = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append("a");          // grows one internal buffer
        }
        String result2 = sb.toString();
        long withBuilder = System.nanoTime() - start;

        System.out.println("String += time:      " + withPlus + " ns");
        System.out.println("StringBuilder time:  " + withBuilder + " ns");
        System.out.println("Same length: " + (result.length() == result2.length()));
    }
}
// OUTPUT (exact ns varies by machine, but relationship always holds):
// String += time:      large number (grows quadratically with n)
// StringBuilder time:  small number (grows linearly with n)
// Same length: true`
                                ]
                            },
                            {
                                content: `<h3>String Concatenation Techniques</h3>
Beyond <code>+</code>, Java offers several ways to build Strings: <code>concat()</code>, <code>StringBuilder</code>, <code>String.format()</code>, <code>String.join()</code>, and <code>StringJoiner</code> (useful for adding a delimiter between multiple pieces without extra bookkeeping).`,
                                codeExamples: [
                                    `public class JoinFormatDemo {
    public static void main(String[] args) {
        String s1 = String.format("%s%s", "Hello", " Pankaj");
        System.out.println(s1);

        String s2 = String.join(", ", "Hello", "Pankaj", "Bhande");
        System.out.println(s2);

        StringJoiner sj = new StringJoiner(", ");
        sj.add("Hello");
        sj.add("Pankaj");
        System.out.println(sj.toString());
    }
}
// OUTPUT:
// Hello Pankaj
// Hello, Pankaj, Bhande
// Hello, Pankaj`
                                ]
                            },
                            {
                                content: `<h3>Essential String Methods for Interviews</h3>
<ul>
<li><code>equals()</code> - case-sensitive content comparison. <code>equalsIgnoreCase()</code> - same, but ignores case.</li>
<li><code>compareTo()</code> - lexicographical comparison; returns 0 if equal, a negative number if this String is smaller than the other, and a positive number if it is larger.</li>
<li><code>substring(begin, end)</code> - since Java 7 it returns a new independent copy of the characters. Before Java 7 it shared the original array, so a tiny substring could keep a huge String alive. That leak no longer exists.</li>
<li><code>split(regex)</code> - splits on a <strong>regular expression</strong>, not a literal string. Characters like <code>.</code>, <code>|</code> and <code>+</code> need escaping (e.g. <code>split("\\\\.")</code> to split on a literal dot).</li>
<li><code>String.format()</code> / <code>printf()</code> - C-style formatted output using <code>%s</code>, <code>%d</code>, <code>%.2f</code> placeholders.</li>
</ul>`,
                                codeExamples: [
                                    `public class StringMethodsDemo {
    public static void main(String[] args) {
        System.out.println("Java".equals("java"));            // false
        System.out.println("Java".equalsIgnoreCase("java"));  // true
        System.out.println("Apple".compareTo("Banana") < 0);  // true (A < B)

        String csv = "a.b.c";
        // csv.split(".") would wrongly split on EVERY character (regex "." = any char)
        String[] wrong = csv.split(".");
        String[] correct = csv.split("\\\\.");
        System.out.println("wrong length: " + wrong.length);
        System.out.println("correct length: " + correct.length);

        String formatted = String.format("Name: %s, Age: %d", "Pankaj", 25);
        System.out.println(formatted);
    }
}
// OUTPUT:
// false
// true
// true
// wrong length: 0
// correct length: 3
// Name: Pankaj, Age: 25`
                                ]
                            },
                            {
                                content: `<h3>Common Interview Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Trap</th><th>What happens</th><th>Fix / takeaway</th></tr>
<tr class='text-center'><td>new String("x") == "x"</td><td>false - different objects</td><td>Always use .equals() for content comparison</td></tr>
<tr class='text-center'><td>Switching on a String</td><td>Works via .equals()/hashCode() internally, but NullPointerException if the switch variable is null</td><td>Null-check before switching, or use a default case carefully</td></tr>
<tr class='text-center'><td>Modifying a String in a loop with +=</td><td>Compiles and "works" but is O(n^2) - a new object every iteration</td><td>Use StringBuilder inside loops</td></tr>
<tr class='text-center'><td>Palindrome check without reversing correctly</td><td>Easy to get off-by-one errors comparing manually</td><td>new StringBuilder(s).reverse().toString().equals(s) is a clean one-liner</td></tr>
<tr class='text-center'><td>split(".") on a literal dot</td><td>The dot is a regex wildcard, so every character is a separator and the result is an empty array</td><td>Escape it: split("\\\\.")</td></tr>
</table>`,
                                codeExamples: [
                                    `public class PalindromeDemo {
    public static void main(String[] args) {
        String word = "madam";
        String reversed = new StringBuilder(word).reverse().toString();
        boolean isPalindrome = word.equals(reversed);
        System.out.println(word + " is palindrome: " + isPalindrome);

        String notPalindrome = "hello";
        System.out.println(notPalindrome + " is palindrome: "
                + notPalindrome.equals(new StringBuilder(notPalindrome).reverse().toString()));
    }
}
// OUTPUT:
// madam is palindrome: true
// hello is palindrome: false`
                                ]
                            },
                            {
                                content: `<h3>Less Common but Real Interview Methods</h3>
Beyond the everyday methods, the <code>String</code> API has a handful of methods that show up specifically in "have you actually read the Javadoc" interview rounds:<br>
• <code>codePointAt(index)</code> / <code>codePointBefore(index)</code> / <code>codePointCount(begin, end)</code> - work with Unicode <strong>code points</strong> instead of raw <code>char</code>s, needed for characters outside the Basic Multilingual Plane (e.g. emoji) that take 2 chars (a surrogate pair) to represent.<br>
• <code>offsetByCodePoints(index, offset)</code> - moves an index forward/back by a number of code points rather than chars - safe for surrogate pairs where <code>index + 1</code> is not.<br>
• <code>regionMatches(toffset, other, ooffset, len)</code> - compares a <em>slice</em> of this string against a slice of another string without allocating a substring first; has a case-insensitive overload too.<br>
• <code>getChars(srcBegin, srcEnd, dst, dstBegin)</code> - copies characters directly into an existing <code>char[]</code>, avoiding the extra array allocation that <code>toCharArray()</code> causes.<br>
• <code>contentEquals(CharSequence)</code> - compares a String's content against <em>any</em> CharSequence (including a live StringBuilder/StringBuffer) without first converting it with <code>toString()</code>.<br>
• <code>subSequence(begin, end)</code> - the CharSequence-interface equivalent of <code>substring(begin, end)</code>; on String they return equal content.<br>
• <code>chars()</code> / <code>codePoints()</code> - return an <code>IntStream</code> of char values / code points, letting you run Stream operations directly over a string's characters.<br>
• <code>indent(n)</code> (Java 12+) - adds (or, for negative n, strips) n spaces at the start of every line.<br>
• <code>transform(Function)</code> (Java 12+) - passes the whole string through a function and returns the function's result, useful for chaining a custom transformation into a fluent call.<br>
• <code>formatted(Object... args)</code> (Java 15+) - instance-method shortcut for <code>String.format(this, args)</code>.`,
                                codeExamples: [
                                    `public class LesserKnownStringMethodsDemo {
    public static void main(String[] args) {
        String text = "Hello Java";

        // codePointAt / codePointCount - Unicode-safe character access
        System.out.println(text.codePointAt(0));
        System.out.println(text.codePointCount(0, text.length()));

        // regionMatches - compare a slice without creating a substring
        System.out.println(text.regionMatches(6, "JavaScript", 0, 4)); // "Java" vs "Java"

        // getChars - copy into an existing char[] (no new array returned)
        char[] buffer = new char[5];
        text.getChars(0, 5, buffer, 0);
        System.out.println(new String(buffer));

        // contentEquals - compares against a live StringBuilder, no toString() needed
        StringBuilder sb = new StringBuilder("Hello Java");
        System.out.println(text.contentEquals(sb));

        // chars() - IntStream over the characters
        long vowelCount = text.chars()
                .filter(c -> "aeiouAEIOU".indexOf(c) != -1)
                .count();
        System.out.println("Vowels: " + vowelCount);

        // transform() - pass the string through a function inline
        String shout = text.transform(s -> s.toUpperCase() + "!");
        System.out.println(shout);

        // formatted() - instance-method shortcut for String.format
        System.out.println("Name: %s".formatted("Pankaj"));
    }
}
// OUTPUT:
// 72
// 10
// true
// Hello
// true
// Vowels: 4
// HELLO JAVA!
// Name: Pankaj`
                                ]
                            },
                            {
                                content: `<h3>String Coding Practice Programs</h3>
<p>Frequently asked hands-on String programs:</p>
<ol>
<li>Count vowels / consonants in a string</li>
<li>Check if a string is numeric</li>
<li>Capitalize the first letter of each word (title case)</li>
<li>Count words in a sentence</li>
<li>Convert camelCase to snake_case, and back</li>
<li>Remove special characters / punctuation from a string</li>
<li>Count frequency of each character</li>
<li>Check if two strings are anagrams</li>
<li>Count uppercase letters, lowercase letters, and digits in one pass</li>
<li>Remove duplicate characters while preserving order</li>
<li>Reverse the words in a sentence (not the whole string)</li>
<li>Extract only the digits / only the letters from a string</li>
<li>Print all substrings of a string</li>
<li>Convert a string to hexadecimal and back</li>
<li>Convert a string to binary and back</li>
<li>Pad a string with leading zeros to a fixed length</li>
<li>Validate an email address / a 10-digit phone number with regex</li>
<li>Find the longest word in a sentence</li>
<li>Mask all digits of a card number except the last 4</li>
<li>Find the first non-repeating character</li>
<li>Find the longest palindromic substring</li>
<li>Find the longest common prefix among an array of strings</li>
<li>Find the longest common substring between two strings</li>
<li>Check if two strings are rotations of each other</li>
<li>Generate all permutations of a string</li>
<li>Remove leading zeros from a numeric string</li>
<li>Rotate a string left/right by N characters</li>
</ol>`,
                                codeExamples: [
                                    `public class VowelConsonantCount {
    public static void main(String[] args) {
        String input = "Hello, World!";
        int vowels = 0, consonants = 0;
        for (char c : input.toLowerCase().toCharArray()) {
            if (!Character.isLetter(c)) continue;
            if ("aeiou".indexOf(c) != -1) vowels++;
            else consonants++;
        }
        System.out.println("Vowels: " + vowels);
        System.out.println("Consonants: " + consonants);
    }
}
// OUTPUT:
// Vowels: 3
// Consonants: 7`,
                                    `public class IsNumericCheck {
    public static void main(String[] args) {
        System.out.println(isNumeric("12345"));
        System.out.println(isNumeric("12a45"));
    }
    private static boolean isNumeric(String s) {
        return s.matches("-?\\\\d+(\\\\.\\\\d+)?");
    }
}
// OUTPUT:
// true
// false`,
                                    `public class TitleCaseDemo {
    public static void main(String[] args) {
        String input = "hello world from java";
        StringBuilder result = new StringBuilder();
        for (String word : input.split("\\\\s+")) {
            result.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1))
                  .append(" ");
        }
        System.out.println(result.toString().trim());
    }
}
// OUTPUT:
// Hello World From Java`,
                                    `public class WordCountDemo {
    public static void main(String[] args) {
        String sentence = "Hello, World! How are you?";
        int wordCount = sentence.split("\\\\s+").length;
        System.out.println("Number of words: " + wordCount);
    }
}
// OUTPUT:
// Number of words: 5`,
                                    `public class CamelSnakeConversion {
    public static void main(String[] args) {
        System.out.println(camelToSnake("firstName"));
        System.out.println(snakeToCamel("first_name"));
    }
    private static String camelToSnake(String s) {
        return s.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
    private static String snakeToCamel(String s) {
        StringBuilder result = new StringBuilder();
        boolean upperNext = false;
        for (char c : s.toCharArray()) {
            if (c == '_') { upperNext = true; continue; }
            result.append(upperNext ? Character.toUpperCase(c) : c);
            upperNext = false;
        }
        return result.toString();
    }
}
// OUTPUT:
// first_name
// firstName`,
                                    `public class RemovePunctuationDemo {
    public static void main(String[] args) {
        String input = "Hello, World! This -- is Java.";
        String result = input.replaceAll("[^a-zA-Z0-9\\\\s]", "");
        System.out.println(result);
    }
}
// OUTPUT:
// Hello World This  is Java`,
                                    `import java.util.LinkedHashMap;
import java.util.Map;

public class CharFrequencyDemo {
    public static void main(String[] args) {
        String input = "programming";
        Map<Character, Integer> freq = new LinkedHashMap<>();
        for (char c : input.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        System.out.println(freq);
    }
}
// OUTPUT:
// {p=1, r=2, o=1, g=2, a=1, m=2, i=1, n=1}`,
                                    `import java.util.Arrays;

public class AnagramCheckDemo {
    public static void main(String[] args) {
        System.out.println(areAnagrams("listen", "silent"));
        System.out.println(areAnagrams("java", "python"));
    }
    private static boolean areAnagrams(String a, String b) {
        if (a.length() != b.length()) return false;
        char[] ca = a.toCharArray();
        char[] cb = b.toCharArray();
        Arrays.sort(ca);
        Arrays.sort(cb);
        return Arrays.equals(ca, cb);
    }
}
// OUTPUT:
// true
// false`,
                                    `public class CaseAndDigitCountDemo {
    public static void main(String[] args) {
        String input = "Hello World 123";
        int upper = 0, lower = 0, digits = 0;
        for (char c : input.toCharArray()) {
            if (Character.isUpperCase(c)) upper++;
            else if (Character.isLowerCase(c)) lower++;
            else if (Character.isDigit(c)) digits++;
        }
        System.out.println("Uppercase: " + upper);
        System.out.println("Lowercase: " + lower);
        System.out.println("Digits: " + digits);
    }
}
// OUTPUT:
// Uppercase: 2
// Lowercase: 8
// Digits: 3`,
                                    `import java.util.LinkedHashSet;
import java.util.Set;

public class RemoveDuplicateCharsDemo {
    public static void main(String[] args) {
        String input = "programming";
        Set<Character> seen = new LinkedHashSet<>();
        for (char c : input.toCharArray()) {
            seen.add(c);
        }
        StringBuilder result = new StringBuilder();
        for (char c : seen) {
            result.append(c);
        }
        System.out.println(result);
    }
}
// OUTPUT:
// progamin`,
                                    `public class ReverseWordsInSentenceDemo {
    public static void main(String[] args) {
        String input = "Hello World from Java";
        String[] words = input.split("\\\\s+");
        StringBuilder result = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            result.append(words[i]);
            if (i != 0) result.append(" ");
        }
        System.out.println(result);
    }
}
// OUTPUT:
// Java from World Hello`,
                                    `public class ExtractDigitsLettersDemo {
    public static void main(String[] args) {
        String input = "abc123xyz456";
        System.out.println("Digits: " + input.replaceAll("[^0-9]", ""));
        System.out.println("Letters: " + input.replaceAll("[^a-zA-Z]", ""));
    }
}
// OUTPUT:
// Digits: 123456
// Letters: abcxyz`,
                                    `public class AllSubstringsDemo {
    public static void main(String[] args) {
        String input = "abc";
        for (int i = 0; i < input.length(); i++) {
            for (int j = i + 1; j <= input.length(); j++) {
                System.out.println(input.substring(i, j));
            }
        }
    }
}
// OUTPUT:
// a
// ab
// abc
// b
// bc
// c`,
                                    `public class HexConversionDemo {
    public static void main(String[] args) {
        String text = "Java";
        StringBuilder hex = new StringBuilder();
        for (char c : text.toCharArray()) {
            hex.append(Integer.toHexString(c));
        }
        System.out.println("Hex: " + hex);

        StringBuilder original = new StringBuilder();
        for (int i = 0; i < hex.length(); i += 2) {
            String pair = hex.substring(i, i + 2);
            original.append((char) Integer.parseInt(pair, 16));
        }
        System.out.println("Back to text: " + original);
    }
}
// OUTPUT:
// Hex: 4a617661
// Back to text: Java`,
                                    `public class BinaryConversionDemo {
    public static void main(String[] args) {
        String text = "AB";
        StringBuilder binary = new StringBuilder();
        for (char c : text.toCharArray()) {
            String bits = String.format("%8s", Integer.toBinaryString(c));
            binary.append(bits.replace(' ', '0'));
        }
        System.out.println("Binary: " + binary);
    }
}
// OUTPUT:
// Binary: 0100000101000010`,
                                    `public class PadWithLeadingZerosDemo {
    public static void main(String[] args) {
        String input = "42";
        String padded = String.format("%05d", Integer.parseInt(input));
        System.out.println(padded);
    }
}
// OUTPUT:
// 00042`,
                                    `import java.util.regex.Pattern;

public class ValidationDemo {
    public static void main(String[] args) {
        System.out.println(isValidEmail("test@example.com"));
        System.out.println(isValidPhone("9876543210"));
    }
    private static boolean isValidEmail(String email) {
        String regex = "^[\\\\w.+-]+@[\\\\w-]+\\\\.[a-zA-Z]{2,}$";
        return Pattern.matches(regex, email);
    }
    private static boolean isValidPhone(String phone) {
        return Pattern.matches("\\\\d{10}", phone);
    }
}
// OUTPUT:
// true
// true`,
                                    `public class LongestWordDemo {
    public static void main(String[] args) {
        String sentence = "This is a test string";
        String longest = "";
        for (String word : sentence.split("\\\\s+")) {
            if (word.length() > longest.length()) longest = word;
        }
        System.out.println("Longest word: " + longest);
    }
}
// OUTPUT:
// Longest word: string`,
                                    `public class MaskCardNumberDemo {
    public static void main(String[] args) {
        String card = "1234567812345678";
        String masked = card.substring(0, card.length() - 4).replaceAll(".", "*")
                + card.substring(card.length() - 4);
        System.out.println(masked);
    }
}
// OUTPUT:
// ************5678`,
                                    `import java.util.LinkedHashMap;
import java.util.Map;

public class FirstNonRepeatingCharDemo {
    public static void main(String[] args) {
        System.out.println(firstNonRepeating("swiss"));
    }
    private static char firstNonRepeating(String input) {
        Map<Character, Integer> counts = new LinkedHashMap<>();
        for (char c : input.toCharArray()) {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        for (Map.Entry<Character, Integer> entry : counts.entrySet()) {
            if (entry.getValue() == 1) return entry.getKey();
        }
        return '_';
    }
}
// OUTPUT:
// w`,
                                    `public class LongestPalindromicSubstringDemo {
    public static void main(String[] args) {
        System.out.println(longestPalindrome("babad"));
    }
    private static String longestPalindrome(String s) {
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            int len1 = expand(s, i, i);
            int len2 = expand(s, i, i + 1);
            int len = Math.max(len1, len2);
            if (len > end - start) {
                start = i - (len - 1) / 2;
                end = i + len / 2;
            }
        }
        return s.substring(start, end + 1);
    }
    private static int expand(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--; right++;
        }
        return right - left - 1;
    }
}
// OUTPUT:
// bab`,
                                    `public class LongestCommonPrefixDemo {
    public static void main(String[] args) {
        String[] words = { "flower", "flow", "flight" };
        String prefix = words[0];
        for (int i = 1; i < words.length; i++) {
            while (words[i].indexOf(prefix) != 0) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) break;
            }
        }
        System.out.println("Longest common prefix: " + prefix);
    }
}
// OUTPUT:
// Longest common prefix: fl`,
                                    `public class LongestCommonSubstringDemo {
    public static void main(String[] args) {
        System.out.println(longestCommonSubstring("abcdef", "abfgh"));
    }
    private static String longestCommonSubstring(String s1, String s2) {
        int maxLen = 0, endIndex = 0;
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    if (dp[i][j] > maxLen) {
                        maxLen = dp[i][j];
                        endIndex = i;
                    }
                }
            }
        }
        return s1.substring(endIndex - maxLen, endIndex);
    }
}
// OUTPUT:
// ab`,
                                    `public class StringRotationCheckDemo {
    public static void main(String[] args) {
        System.out.println(areRotations("waterbottle", "erbottlewat"));
    }
    private static boolean areRotations(String s1, String s2) {
        return s1.length() == s2.length() && (s1 + s1).contains(s2);
    }
}
// OUTPUT:
// true`,
                                    `public class PermutationsDemo {
    public static void main(String[] args) {
        generatePermutations("ABC", "");
    }
    private static void generatePermutations(String input, String prefix) {
        if (input.isEmpty()) {
            System.out.println(prefix);
            return;
        }
        for (int i = 0; i < input.length(); i++) {
            generatePermutations(input.substring(0, i) + input.substring(i + 1),
                    prefix + input.charAt(i));
        }
    }
}
// OUTPUT:
// ABC
// ACB
// BAC
// BCA
// CAB
// CBA`,
                                    `public class RemoveLeadingZerosDemo {
    public static void main(String[] args) {
        String input = "00042";
        String result = input.replaceFirst("^0+(?!$)", "");
        System.out.println(result);
    }
}
// OUTPUT:
// 42`,
                                    `public class RotateStringDemo {
    public static void main(String[] args) {
        String input = "abcdef";
        System.out.println("Left by 2: " + rotateLeft(input, 2));
        System.out.println("Right by 2: " + rotateRight(input, 2));
    }
    private static String rotateLeft(String s, int n) {
        n = n % s.length();
        return s.substring(n) + s.substring(0, n);
    }
    private static String rotateRight(String s, int n) {
        n = n % s.length();
        return s.substring(s.length() - n) + s.substring(0, s.length() - n);
    }
}
// OUTPUT:
// Left by 2: cdefab
// Right by 2: efabcd`
                                ]
                            },
                            {
                                content: `<div class="bg-secondary p-2 rounded-md">
<h4>Interview Questions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is String immutable in Java?</td><td>Security, thread safety, String Pool reuse, and safe hashCode caching for use as HashMap keys</td></tr>
<tr class='text-center'><td>What is the String Constant Pool?</td><td>A special area (part of the heap since Java 7) where literal String values are stored and reused to save memory</td></tr>
<tr class='text-center'><td>== vs equals()</td><td>== compares references (object identity); equals() compares actual character content</td></tr>
<tr class='text-center'><td>StringBuffer vs StringBuilder</td><td>Both mutable; StringBuffer is synchronized (thread-safe, slower), StringBuilder is not (faster, single-threaded use)</td></tr>
<tr class='text-center'><td>How does the JVM handle the + operator on Strings?</td><td>Java 8 and older rewrote one + statement into a StringBuilder; Java 9 and later use invokedynamic. In both cases, += across loop iterations still creates a new String each time</td></tr>
<tr class='text-center'><td>What does intern() do?</td><td>Looks up the String's value in the pool and returns the pooled reference, adding it to the pool if not already present</td></tr>
</table>
</div>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• Since Java 9, String uses <b>compact strings</b>. It stores a byte array plus a one byte coder flag, LATIN1 or UTF16, so pure ASCII text takes half the memory it did in Java 8. <br>
• The <b>String pool lives in the heap</b> since Java 7, not in PermGen, and it is a native hash table whose size can be tuned with the StringTableSize flag. <br>
• <b>Compile time constant expressions are folded</b> by javac, so a plus b where both are final literals becomes a single pooled literal with no run time work. <br>
• Since Java 9 concatenation of non constants compiles to an <b>invokedynamic call into StringConcatFactory</b>, which builds an optimised method handle chain rather than a StringBuilder. <br>
• <b>hashCode is cached in a field</b> and computed lazily. A String whose hash is genuinely zero is recomputed every time, which is a known corner case. <br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• To control <b>heap footprint</b>, since Strings and their byte arrays are typically the largest part of a Java heap dump. <br>
• To avoid the <b>substring and split allocation storm</b> in parsers, using indexOf and offsets instead. <br>
• To understand <b>catastrophic backtracking</b> in regular expressions, which is a real denial of service risk. <br>
• To handle <b>Unicode correctly</b>, since a code point can be two chars and length counts chars, not characters people see. <br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• Deduplicating Strings has cut real production heaps by twenty to thirty percent, which is why the JVM has a string deduplication flag. <br>
• A regular expression written by a developer once took down a payment API because one crafted input caused exponential backtracking. <br>
• Interviewers ask about the pool, intern, compact strings and why String is immutable and final. <br>
• Emoji and Indian language text break naive length and substring code, which shows up as garbled names on receipts. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level: constant folding, the pool, and Unicode length

public class AdvancedStringDemo {

    public static void main(String[] args) {

        // POINT 1: compile time constant folding
        final String a = "SBI";
        final String b = "N0001234";
        String folded = a + b;                // folded by javac into one literal
        String pooled = "SBIN0001234";
        System.out.println("Folded == pooled literal : " + (folded == pooled));

        // POINT 1: a non final variable is not folded, it runs at run time
        String c = "SBI";
        String runtime = c + b;
        System.out.println("Runtime concat == pooled : " + (runtime == pooled));
        System.out.println("After intern             : " + (runtime.intern() == pooled));

        // POINT 1: compact strings, ASCII uses one byte per char
        String ascii = "PUNE";
        String devanagari = "पुणे";
        System.out.println("ASCII length   : " + ascii.length());
        System.out.println("Devanagari len : " + devanagari.length()
                + " (stored as UTF16, two bytes per char)");

        // POINT 3: length counts chars, not what a user sees
        String withEmoji = "Paid \\uD83D\\uDCB0 now";   // a money bag emoji, one code point
        System.out.println("length()          : " + withEmoji.length());
        System.out.println("codePointCount()  : "
                + withEmoji.codePointCount(0, withEmoji.length()));

        // WRONG: charAt on a surrogate pair gives half a character
        System.out.println("WRONG charAt(5) is half a surrogate pair");

        // RIGHT: iterate by code points
        StringBuilder rebuilt = new StringBuilder();
        withEmoji.codePoints().forEach(rebuilt::appendCodePoint);
        System.out.println("Rebuilt by code points equals original: "
                + rebuilt.toString().equals(withEmoji));

        // POINT 2: substring no longer shares the backing array since Java 7
        String big = "X".repeat(100000);
        String small = big.substring(0, 10);
        System.out.println("Substring length " + small.length()
                + " holds its own copy, so the big String can be collected");

        // POINT 2: avoid split when you only need one field
        String row = "2026-09-05|SB100234|UPI-SWIGGY|D|2500.75";

        // WRONG for a hot parser, allocates an array plus five Strings
        String amountWrong = row.split("\\\\|")[4];

        // RIGHT, one indexOf scan and one substring
        int lastPipe = row.lastIndexOf('|');
        String amountRight = row.substring(lastPipe + 1);

        System.out.println("Split amount  : " + amountWrong);
        System.out.println("Offset amount : " + amountRight);
    }
}
// OUTPUT:
// Folded == pooled literal : true
// Runtime concat == pooled : false
// After intern             : true
// ASCII length   : 4
// Devanagari len : 4 (stored as UTF16, two bytes per char)
// length()          : 11
// codePointCount()  : 10
// WRONG charAt(5) is half a surrogate pair
// Rebuilt by code points equals original: true
// Substring length 10 holds its own copy, so the big String can be collected
// Split amount  : 2500.75
// Offset amount : 2500.75`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Safe map keys and cache keys.</b> Immutability plus a cached hash makes String the ideal key, and its hash never goes stale. <br>
• <b>Compact strings halve memory</b> for the ASCII data that dominates most Indian and global business systems. <br>
• <b>String deduplication in G1</b> can collapse identical char data across duplicate Strings with no code change. <br>
• <b>invokedynamic concatenation</b> lets the JVM pick the best strategy at run time, and it improves when you upgrade the JVM. <br>
• <b>Security by immutability.</b> A file path or a class name passed to a security check cannot be changed after the check. <br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>Memory pressure.</b> Strings and their byte arrays are usually the top two entries in a heap histogram of a real service. <br>
• <b>intern is a trap at scale.</b> A native hash table with a fixed bucket count degrades badly and interned Strings are hard to reclaim. <br>
• <b>Catastrophic backtracking.</b> A nested quantifier regex can go exponential on a crafted input and hang a request thread. <br>
• <b>Locale sensitive case conversion</b> silently breaks in Turkish, where an uppercase i is not I. <br>
• <b>Passwords in Strings cannot be wiped</b> and can survive in a heap dump for a long time. <br>
• <b>String concatenation in logging</b> builds the message even when the log level is off, unless you use parameterised logging. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: regex backtracking, locale traps and dedup

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

public class StringRiskDemo {

    // WRONG: nested quantifier, exponential on a near match
    static final Pattern DANGEROUS = Pattern.compile("(a+)+b");

    // RIGHT: a possessive quantifier removes the backtracking
    static final Pattern SAFE = Pattern.compile("(a++)+b");

    public static void main(String[] args) {

        String attack = "a".repeat(24);        // no trailing b, so it must fail

        long start = System.nanoTime();
        boolean safeMatch = SAFE.matcher(attack).matches();
        long safeMs = (System.nanoTime() - start) / 1000000;
        System.out.println("Possessive regex matched " + safeMatch
                + " in about " + safeMs + " ms");

        start = System.nanoTime();
        boolean badMatch = DANGEROUS.matcher(attack).matches();
        long badMs = (System.nanoTime() - start) / 1000000;
        System.out.println("Backtracking regex matched " + badMatch
                + " in about " + badMs + " ms, and it grows exponentially");

        // DISADVANTAGE 5: the Turkish locale case trap
        String flag = "TITLE";
        System.out.println("Default lower  : " + flag.toLowerCase());
        System.out.println("Turkish lower  : " + flag.toLowerCase(new Locale("tr", "TR")));
        System.out.println("RIGHT for code : " + flag.toLowerCase(Locale.ROOT));

        // WRONG protocol comparison, breaks in Turkish
        String header = "CONTENT-TYPE";
        boolean wrongCheck = header.toLowerCase().equals("content-type");
        boolean rightCheck = header.equalsIgnoreCase("content-type");
        System.out.println("Locale dependent check: " + wrongCheck);
        System.out.println("Locale safe check     : " + rightCheck);

        // DISADVANTAGE 5: duplicate Strings waste heap
        Map<String, Long> balances = new HashMap<>();
        for (int i = 0; i < 5; i++) {
            String branch = new String("SBIN0001234");   // a distinct object each time
            balances.put(branch + i, 1000L * i);
        }
        System.out.println("Five distinct branch Strings held the same characters");

        // RIGHT: keep one canonical instance for a bounded set of values
        Map<String, String> canonical = new HashMap<>();
        String shared = canonical.computeIfAbsent("SBIN0001234", k -> k);
        String again = canonical.computeIfAbsent("SBIN0001234", k -> k);
        System.out.println("Canonical map shares one instance: " + (shared == again));

        // DISADVANTAGE 5: eager log message building
        long amount = 250075L;
        boolean debugEnabled = false;
        // WRONG: the String is built even when debug is off
        if (debugEnabled) {
            System.out.println("Debit of " + amount + " at " + System.nanoTime());
        }
        // RIGHT in real logging: log.debug("Debit of {} processed", amount);
        System.out.println("Use parameterised logging so nothing is built when off");
    }
}
// OUTPUT (timings vary, backtracking grows fast with input length):
// Possessive regex matched false in about 0 ms
// Backtracking regex matched false in about 900 ms, and it grows exponentially
// Default lower  : title
// Turkish lower  : tıtle
// RIGHT for code : title
// Locale dependent check: true
// Locale safe check     : true
// Five distinct branch Strings held the same characters
// Canonical map shares one instance: true
// Use parameterised logging so nothing is built when off`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>Core banking heap tuning:</b> a heap dump showed forty percent of the heap in byte arrays behind Strings. Enabling G1 string deduplication and canonicalising branch codes reclaimed several gigabytes. <br>
• <b>High volume file parser:</b> replacing split with indexOf offsets and a reusable StringBuilder cut allocation per row from twelve objects to two. <br>
• <b>Payments API outage:</b> a validation regex with nested quantifiers hung request threads on a crafted VPA. The fix was a possessive quantifier plus an input length cap. <br>
• <b>Customer name printing:</b> names in Devanagari and Tamil broke a fixed width receipt until code point iteration replaced charAt. <br>
• <b>Global example, a search index:</b> tokens canonicalised through a bounded map instead of intern, so the pool never grew without limit. <br>
• <b>Password handling:</b> char arrays wiped after use, because a String password appeared in a support heap dump during an incident. <br><br>

<b>Interview answers to keep ready</b><br>
• Why is String immutable and final? For pool sharing, safe map keys, thread safety and security checks that cannot be defeated by later mutation. <br>
• What changed in Java 9 with compact strings? char array became byte array plus a coder flag, halving memory for LATIN1 text. <br>
• How does concatenation compile today? Constants are folded, and the rest goes through invokedynamic and StringConcatFactory. <br>
• StringBuilder or StringBuffer? StringBuilder unless the same instance is genuinely shared across threads, which it almost never should be. <br>`,
                                codeExamples: [
                                    `// Point 6 at expert level: an allocation light fixed width parser for bank records

public class FixedWidthParserDemo {

    // A fixed width core banking record, exactly what a mainframe feed looks like
    // positions: 0-11 account, 12-41 name, 42-53 amount paise, 54 type
    static final int ACC_START = 0,  ACC_END = 12;
    static final int NAME_START = 12, NAME_END = 42;
    static final int AMT_START = 42,  AMT_END = 54;
    static final int TYPE_POS = 54;

    record Posting(String account, String name, long amountPaise, char type) { }

    // WRONG for a hot loop: substring plus trim plus parseLong allocates
    // three extra Strings per row just to read one number
    static Posting parseWrong(String line) {
        String account = line.substring(ACC_START, ACC_END).trim();
        String name = line.substring(NAME_START, NAME_END).trim();
        String amountText = line.substring(AMT_START, AMT_END).trim();
        long amount = Long.parseLong(amountText);
        return new Posting(account, name, amount, line.charAt(TYPE_POS));
    }

    // RIGHT: parse numbers straight off the char positions, no substring for the amount
    static long parseAmount(String line, int from, int to) {
        long value = 0;
        for (int i = from; i < to; i++) {
            char ch = line.charAt(i);
            if (ch == ' ') continue;
            if (ch < '0' || ch > '9') {
                throw new NumberFormatException("Bad digit at " + i);
            }
            value = value * 10 + (ch - '0');
        }
        return value;
    }

    static Posting parseRight(String line) {
        String account = line.substring(ACC_START, ACC_END).trim();
        String name = line.substring(NAME_START, NAME_END).trim();
        long amount = parseAmount(line, AMT_START, AMT_END);
        char type = line.charAt(TYPE_POS);
        return new Posting(account, name, amount, type);
    }

    static String pad(String s, int width) {
        StringBuilder sb = new StringBuilder(width);
        sb.append(s);
        while (sb.length() < width) sb.append(' ');
        return sb.toString();
    }

    public static void main(String[] args) {

        String line = pad("SB100234", 12)
                + pad("ANANYA KULKARNI", 30)
                + pad("000000250075", 12)
                + "D";

        Posting p = parseRight(line);
        System.out.println("Account : " + p.account());
        System.out.println("Name    : " + p.name());
        System.out.println("Amount  : Rs " + (p.amountPaise() / 100)
                + "." + String.format("%02d", p.amountPaise() % 100));
        System.out.println("Type    : " + (p.type() == 'D' ? "Debit" : "Credit"));

        // measure the two approaches over many rows
        int rows = 300000;

        long start = System.nanoTime();
        long sumRight = 0;
        for (int i = 0; i < rows; i++) {
            sumRight += parseRight(line).amountPaise();
        }
        long rightMs = (System.nanoTime() - start) / 1000000;

        start = System.nanoTime();
        long sumWrong = 0;
        for (int i = 0; i < rows; i++) {
            sumWrong += parseWrong(line).amountPaise();
        }
        long wrongMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Offset parser sum " + sumRight
                + " in about " + rightMs + " ms");
        System.out.println("Substring parser sum " + sumWrong
                + " in about " + wrongMs + " ms");
        System.out.println("Same totals: " + (sumRight == sumWrong));
    }
}
// OUTPUT (timings vary):
// Account : SB100234
// Name    : ANANYA KULKARNI
// Amount  : Rs 2500.75
// Type    : Debit
// Offset parser sum 75022500000 in about 60 ms
// Substring parser sum 75022500000 in about 130 ms
// Same totals: true`
                                ]
                            }
                        ]
                    };
