import { Topic } from '../coreJava';

export const checkedAndUncheckedExceptions: Topic = {
                        id: 'exceptions',
                        name: 'Difference between Checked and Unchecked Exceptions',
                        beginner: [
                            {
                                content: `<h3>1. Checked Exception (Compile-Time Exception)</h3>
<ul>
<li>Any subclass of <code>Exception</code>, at any depth, that is not also a subclass of <code>RuntimeException</code> is a checked exception. For example <code>IOException</code> extends <code>Exception</code>, and <code>FileNotFoundException</code> extends <code>IOException</code>.</li>
<li>The compiler checks them at <strong>compile-time</strong>. You must either catch them or declare them with <code>throws</code>.</li>
<li>Examples: <code>IOException</code>, <code>SQLException</code>, <code>ClassNotFoundException</code>.</li>
</ul>

<h3>2. Unchecked Exception (Runtime Exception)</h3>
<ul>
<li>Classes that inherit from <code>RuntimeException</code> are unchecked exceptions.</li>
<li>The compiler does <strong>not</strong> check them. They show up only at runtime, and you are never forced to handle them.</li>
<li>Examples: <code>ArithmeticException</code>, <code>NullPointerException</code>, <code>ArrayIndexOutOfBoundsException</code>, <code>NumberFormatException</code>.</li>
</ul>

<p>Below is one small, runnable proof for each:</p>`
                            },

                            {
                                content: `<h4>Proof: a checked exception must be handled or declared - the code won't even compile otherwise</h4>`,
                                codeExamples: [
                                    `import java.io.FileReader;
import java.io.IOException;

public class CheckedExceptionDemo {
    public static void main(String[] args) {
        // FileReader's constructor throws IOException, a CHECKED exception
        // try { new FileReader("data.txt"); }
        // COMPILE ERROR without a try-catch or "throws IOException" on main():
        // unreported exception IOException; must be caught or declared to be thrown

        try {
            FileReader reader = new FileReader("data.txt");
        } catch (IOException e) {
            System.out.println("Handled checked exception: " + e.getMessage());
        }
    }
}
// OUTPUT (file doesn't exist):
// Handled checked exception: data.txt (No such file or directory)`
                                ]
                            },

                            {
                                content: `<h4>Proof: an unchecked exception compiles fine, but can still crash at runtime</h4>`,
                                codeExamples: [
                                    `public class UncheckedExceptionDemo {
    public static void main(String[] args) {
        // No try-catch required to compile - ArithmeticException is unchecked
        int a = 10 / 0;
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.ArithmeticException: / by zero
//     at UncheckedExceptionDemo.main(UncheckedExceptionDemo.java:4)`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Checked vs Unchecked — Quick Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Checked</th><th>Unchecked</th></tr>
<tr class='text-center'><td>Checked by</td><td>Compiler, at compile-time</td><td>JVM, at runtime</td></tr>
<tr class='text-center'><td>Parent class</td><td>Exception (excluding RuntimeException)</td><td>RuntimeException</td></tr>
<tr class='text-center'><td>Must handle?</td><td>Yes - catch or declare with throws</td><td>No - handling is optional</td></tr>
<tr class='text-center'><td>Typical cause</td><td>External conditions (file missing, DB down, class not found)</td><td>Programming mistakes (bad logic, null access, bad index)</td></tr>
<tr class='text-center'><td>Examples</td><td>IOException, SQLException, ClassNotFoundException</td><td>ArithmeticException, NullPointerException, ArrayIndexOutOfBoundsException</td></tr>
</table>`
                            },

                            {
                                content: `<h4>NullPointerException — calling a method on a null reference</h4>`,
                                codeExamples: [
                                    `public class Test {
    public static void main(String[] args) {
        String str = null;
        System.out.println(str.length()); // exception occurs here
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.NullPointerException:
//     Cannot invoke "String.length()" because "str" is null
//     at Test.main(Test.java:4)`
                                ]
                            },

                            {
                                content: `<h4>ArrayIndexOutOfBoundsException — accessing an index that doesn't exist</h4>`,
                                codeExamples: [
                                    `public class Test {
    public static void main(String[] args) {
        int[] a = new int[5];   // valid indices: 0 to 4
        a[10] = 50;              // index 10 doesn't exist
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException:
//     Index 10 out of bounds for length 5
//     at Test.main(Test.java:4)`
                                ]
                            },

                            {
                                content: `<h4>NumberFormatException — trying to parse text that isn't a valid number</h4>`,
                                codeExamples: [
                                    `public class Test {
    public static void main(String[] args) {
        int a = Integer.parseInt("25+"); // "25+" is not a valid integer
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.NumberFormatException:
//     For input string: "25+"
//     at java.base/java.lang.NumberFormatException.forInputString(...)
//     at java.base/java.lang.Integer.parseInt(Integer.java:668)
//     at Test.main(Test.java:3)`
                                ]
                            },

                            {
                                content: `<h4>InputMismatchException — Scanner reads a type that doesn't match what was asked for</h4>`,
                                codeExamples: [
                                    `import java.util.InputMismatchException;
import java.util.Scanner;

public class InputMismatchExample {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try {
            System.out.println("Enter a whole number:");
            int a = sc.nextInt(); // user types "2.5" instead of a whole number
            System.out.println(a * a);
        } catch (InputMismatchException ex) {
            System.out.println("Caught: " + ex);
        }
    }
}
// OUTPUT (when the user enters "2.5"):
// Enter a whole number:
// Caught: java.util.InputMismatchException`
                                ]
                            },

                            {
                                content: `<h4>IllegalStateException — calling a method at the wrong point in an object's lifecycle</h4>
<p>Calling <code>Iterator.remove()</code> before ever calling <code>next()</code> is a classic example. There is nothing to remove yet.</p>`,
                                codeExamples: [
                                    `import java.util.ArrayList;
import java.util.Iterator;

public class IllegalStateExceptionExample {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("a");
        list.add("b");
        list.add("c");

        Iterator<String> itr = list.iterator();
        itr.remove(); // COMPILE OK, but no next() was called yet
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.IllegalStateException
//     at java.base/java.util.ArrayList$Itr.remove(ArrayList.java:980)
//     at IllegalStateExceptionExample.main(IllegalStateExceptionExample.java:11)`
                                ]
                            }
                        ]
};
