// "Predict the output" challenges for Core Java lessons.
//
// Every challenge here is VERIFIED by really compiling and running it on JDK 21:
//   node scripts/verify-predict-output.mjs
// `answer` is exactly the program's stdout (trimmed), or the text "Compile error" when javac must
// reject the snippet. If you edit a snippet, re-run the script and fix `answer` to match.
//
// Code is written with String.raw so Java escapes such as \n stay as typed.

export interface PredictChallenge {
  id: string;
  /** Real topic id from courseIndex.ts (course "java"). */
  topicId: string;
  title: string;
  /** A complete program: `public class Main` with a main method. */
  code: string;
  /** The real output (the one correct option). */
  answer: string;
  /** Three plausible but wrong options. */
  wrong: [string, string, string];
  /** WHY the output is what it is. */
  explanation: string;
  /** The common wrong assumption behind the tempting answers. */
  trap: string;
}

const java = String.raw;

export const predictChallenges: PredictChallenge[] = [
  // ───────────────────────── operators ─────────────────────────
  {
    id: 'op-incr-mix',
    topicId: 'operators',
    title: 'Pre and post increment together',
    code: java`public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = x++ + ++x;
        System.out.println(x + " " + y);
    }
}`,
    answer: '7 12',
    wrong: ['6 10', '7 11', '6 11'],
    explanation:
      'Operands are evaluated left to right. x++ yields 5 and then x becomes 6. ++x raises x to 7 and yields 7. So y = 5 + 7 = 12 and x ends at 7.',
    trap: 'Assuming x only changes once, or that both increments see the original value of 5.',
  },
  {
    id: 'op-string-concat',
    topicId: 'operators',
    title: 'Plus with numbers and a String',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println(1 + 2 + "3" + 4 + 5);
    }
}`,
    answer: '3345',
    wrong: ['12345', '339', '1239'],
    explanation:
      '+ is evaluated left to right. 1 + 2 is still int addition, giving 3. Once the String "3" appears, every later + is concatenation: "33", then "334", then "3345".',
    trap: 'Thinking the whole expression becomes a String from the start, or that the later numbers are added together.',
  },
  {
    id: 'op-self-assign',
    topicId: 'operators',
    title: 'Assigning i++ back to i',
    code: java`public class Main {
    public static void main(String[] args) {
        int i = 10;
        i = i++;
        System.out.println(i);
    }
}`,
    answer: '10',
    wrong: ['11', '9', '12'],
    explanation:
      'i++ evaluates to the OLD value (10) and schedules i = 11, but then the assignment stores that old value 10 back into i, overwriting the increment.',
    trap: 'Believing the increment survives the assignment. The postfix expression value is the value before the increment.',
  },
  {
    id: 'op-float-equals',
    topicId: 'operators',
    title: 'Comparing floating point sums',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2 == 0.3);
        System.out.println(0.1f + 0.2f == 0.3f);
    }
}`,
    answer: 'false\ntrue',
    wrong: ['true\ntrue', 'false\nfalse', 'true\nfalse'],
    explanation:
      'double 0.1 + 0.2 is 0.30000000000000004, which is not the double nearest 0.3, so the first line is false. With float the rounding error happens to land exactly on the float nearest 0.3, so the second is true. Neither result is something to rely on.',
    trap: 'Assuming decimal arithmetic. Binary floating point cannot store 0.1 exactly, so never compare with ==.',
  },
  {
    id: 'op-neg-division',
    topicId: 'operators',
    title: 'Division and remainder of negatives',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println(-7 / 2 + " " + -7 % 2 + " " + Math.floorMod(-7, 2));
    }
}`,
    answer: '-3 -1 1',
    wrong: ['-4 1 1', '-3 1 1', '-4 -1 -1'],
    explanation:
      'Integer division truncates toward zero, so -7 / 2 is -3. The remainder keeps the sign of the dividend, so -7 % 2 is -1. Math.floorMod returns a result with the sign of the divisor: 1.',
    trap: 'Expecting division to round down (floor) and % to be always non-negative as in some other languages.',
  },
  {
    id: 'op-short-circuit',
    topicId: 'operators',
    title: 'Short-circuit versus non-short-circuit',
    code: java`public class Main {
    public static void main(String[] args) {
        int n = 0;
        boolean a = false && (n++ > 0);
        boolean b = false & (n++ > 0);
        System.out.println(n);
    }
}`,
    answer: '1',
    wrong: ['0', '2', '3'],
    explanation:
      '&& skips its right side when the left is false, so the first n++ never runs. A single & always evaluates both sides, so the second n++ runs and n becomes 1.',
    trap: 'Treating & and && as the same operator for booleans. Only && and || short-circuit.',
  },
  {
    id: 'op-shift',
    topicId: 'operators',
    title: 'Signed and unsigned right shift',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println(-8 >> 1);
        System.out.println(-8 >>> 28);
    }
}`,
    answer: '-4\n15',
    wrong: ['-4\n-1', '4\n15', '-4\n0'],
    explanation:
      '>> keeps the sign bit, so -8 >> 1 is -4. >>> fills with zeros: -8 is 0xFFFFFFF8, and shifting it right by 28 leaves the top four bits 1111, which is 15.',
    trap: 'Thinking >>> only differs for large shifts, or that it also preserves the sign.',
  },

  // ───────────────────────── data types ─────────────────────────
  {
    id: 'dt-cast-round',
    topicId: 'data-types',
    title: 'Casting and rounding',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println((int) 3.99 + " " + (int) -3.99 + " " + Math.round(-3.5));
    }
}`,
    answer: '3 -3 -3',
    wrong: ['4 -4 -4', '3 -3 -4', '3 -4 -3'],
    explanation:
      'A cast to int truncates toward zero, so 3.99 becomes 3 and -3.99 becomes -3. Math.round adds 0.5 and floors, so -3.5 becomes -3 (half values round up toward positive infinity).',
    trap: 'Expecting a cast to round to the nearest value, or Math.round to round halves away from zero.',
  },
  {
    id: 'dt-overflow',
    topicId: 'data-types',
    title: 'Silent integer overflow',
    code: java`public class Main {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(max + 1);
        System.out.println(Math.abs(Integer.MIN_VALUE));
    }
}`,
    answer: '-2147483648\n-2147483648',
    wrong: ['2147483648\n2147483648', '-2147483648\n2147483648', 'Exception in thread "main" ArithmeticException\n2147483648'],
    explanation:
      'int arithmetic wraps around silently in two\'s complement. MAX_VALUE + 1 becomes MIN_VALUE. There is no positive int equal to -MIN_VALUE, so Math.abs(MIN_VALUE) returns MIN_VALUE unchanged.',
    trap: 'Expecting an exception on overflow, or that abs() always returns a non-negative number.',
  },
  {
    id: 'dt-byte-char',
    topicId: 'data-types',
    title: 'Narrowing a byte and printing a char',
    code: java`public class Main {
    public static void main(String[] args) {
        byte b = (byte) 200;
        char c = 65;
        System.out.println(b);
        System.out.println(c);
        System.out.println(c + 0);
    }
}`,
    answer: '-56\nA\n65',
    wrong: ['200\nA\n65', '-56\n65\n65', '-56\nA\nA'],
    explanation:
      'A byte holds -128..127, so 200 wraps to 200 - 256 = -56. println(char) prints the character A. Adding 0 promotes the char to int, so c + 0 is the number 65.',
    trap: 'Forgetting that arithmetic on a char produces an int, and that byte is signed.',
  },
  {
    id: 'dt-int-overflow-long',
    topicId: 'data-types',
    title: 'Assigning to a long is too late',
    code: java`public class Main {
    public static void main(String[] args) {
        long big = 1000 * 1000 * 1000 * 10;
        System.out.println(big);
    }
}`,
    answer: '1410065408',
    wrong: ['10000000000', '0', '-1410065408'],
    explanation:
      'All the operands are int literals, so the multiplication is done in int arithmetic and overflows (10,000,000,000 wraps to 1,410,065,408) BEFORE the result is widened to long. Writing 10L fixes it.',
    trap: 'Assuming the long on the left makes the right-hand side long. Types flow from the operands, not the target.',
  },

  // ───────────────────────── control statements ─────────────────────────
  {
    id: 'cs-dangling-else',
    topicId: 'Control Statements in Java',
    title: 'Which if does the else belong to?',
    code: java`public class Main {
    public static void main(String[] args) {
        int x = 5;
        if (x > 3)
            if (x > 10)
                System.out.println("A");
        else
            System.out.println("B");
        System.out.println("C");
    }
}`,
    answer: 'B\nC',
    wrong: ['C', 'A\nC', 'B'],
    explanation:
      'Indentation means nothing to the compiler. An else always attaches to the nearest unmatched if, here if (x > 10). x > 3 is true, x > 10 is false, so the else runs and prints B, then C always prints.',
    trap: 'Reading the else as belonging to the outer if because of how it is indented.',
  },
  {
    id: 'cs-assign-in-if',
    topicId: 'Control Statements in Java',
    title: 'One equals sign in a condition',
    code: java`public class Main {
    public static void main(String[] args) {
        boolean flag = false;
        if (flag = true) {
            System.out.println("yes");
        } else {
            System.out.println("no");
        }
        System.out.println(flag);
    }
}`,
    answer: 'yes\ntrue',
    wrong: ['no\nfalse', 'Compile error', 'yes\nfalse'],
    explanation:
      '= is assignment and an assignment expression has the value that was assigned. flag = true sets flag to true and the condition is true. It compiles because the type is boolean (with int it would not).',
    trap: 'Believing = in a condition is a compile error, or that it compares like ==.',
  },
  {
    id: 'cs-switch-fallthrough',
    topicId: 'Control Statements in Java',
    title: 'Switch without break',
    code: java`public class Main {
    public static void main(String[] args) {
        int d = 2;
        switch (d) {
            case 1: System.out.println("one");
            case 2: System.out.println("two");
            case 3: System.out.println("three"); break;
            default: System.out.println("other");
        }
    }
}`,
    answer: 'two\nthree',
    wrong: ['two', 'two\nthree\nother', 'one\ntwo\nthree'],
    explanation:
      'Execution jumps to case 2 and then keeps running every following statement until a break. case 3 has one, so "three" prints too, and the default is never reached.',
    trap: 'Thinking each case is isolated. Classic colon-style switch falls through.',
  },
  {
    id: 'cs-default-middle',
    topicId: 'Control Statements in Java',
    title: 'Default in the middle',
    code: java`public class Main {
    public static void main(String[] args) {
        switch (9) {
            default: System.out.println("D");
            case 1: System.out.println("1"); break;
            case 2: System.out.println("2");
        }
    }
}`,
    answer: 'D\n1',
    wrong: ['D', 'D\n1\n2', '1'],
    explanation:
      'No case matches 9, so control jumps to default no matter where it is written. It then falls through into case 1, prints 1, and the break stops it before case 2.',
    trap: 'Assuming default must be last, or that it never falls through into the cases below it.',
  },

  // ───────────────────────── jumping statements ─────────────────────────
  {
    id: 'jump-labeled',
    topicId: 'Jumping Statement',
    title: 'continue outer and break outer',
    code: java`public class Main {
    public static void main(String[] args) {
        outer:
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (j == 2) continue outer;
                if (i == 2) break outer;
                System.out.println(i + "" + j);
            }
        }
    }
}`,
    answer: '00\n01\n10\n11',
    wrong: ['00\n01\n10\n11\n20\n21', '00\n01\n02', '00\n01\n02\n10\n11\n12'],
    explanation:
      'continue outer abandons the inner loop and moves on to the next i, so j never prints 2. When i reaches 2, break outer exits both loops on the very first inner check, before anything prints for i = 2.',
    trap: 'Thinking break or continue only affects the innermost loop even when a label is used.',
  },
  {
    id: 'jump-do-while-continue',
    topicId: 'Jumping Statement',
    title: 'continue inside do-while',
    code: java`public class Main {
    public static void main(String[] args) {
        int i = 0;
        do {
            i++;
            if (i < 3) continue;
            System.out.print(i);
        } while (i < 5);
        System.out.println();
    }
}`,
    answer: '345',
    wrong: ['12345', '34', '3'],
    explanation:
      'continue in a do-while jumps to the loop condition check, not back to the top. i = 1 and 2 skip the print but the condition i < 5 is still true. From i = 3 the print runs, and the loop ends when i reaches 5 after printing it.',
    trap: 'Assuming continue exits the loop or skips the condition test.',
  },
  {
    id: 'jump-switch-in-loop',
    topicId: 'Jumping Statement',
    title: 'break and continue inside a switch in a loop',
    code: java`public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 4; i++) {
            switch (i) {
                case 1: break;
                case 2: continue;
                default: System.out.print("d" + i + " ");
            }
            System.out.print("e" + i + " ");
        }
        System.out.println();
    }
}`,
    answer: 'd0 e0 e1 d3 e3',
    wrong: ['d0 e0 d3 e3', 'd0 e0 e1 e2 d3 e3', 'd0 e0'],
    explanation:
      'break inside a switch only leaves the switch, so e1 still prints. continue, however, belongs to the loop: for i = 2 it skips the rest of the body, so e2 never prints.',
    trap: 'Thinking break inside switch stops the surrounding loop.',
  },

  // ───────────────────────── looping statements ─────────────────────────
  {
    id: 'loop-semicolon',
    topicId: 'Looping Statements',
    title: 'A stray semicolon after for',
    code: java`public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 3; i++);
        {
            System.out.println("hi");
        }
    }
}`,
    answer: 'hi',
    wrong: ['hi\nhi\nhi', 'Compile error', 'Nothing is printed'],
    explanation:
      'The semicolon is an empty statement and it is the loop body. The loop spins three times doing nothing. The braces after it are just a plain block that runs once.',
    trap: 'Reading the indented block as the loop body.',
  },
  {
    id: 'loop-byte-wrap',
    topicId: 'Looping Statements',
    title: 'A byte counter near its limit',
    code: java`public class Main {
    public static void main(String[] args) {
        int count = 0;
        for (byte b = 120; b > 0; b++) {
            count++;
        }
        System.out.println(count);
    }
}`,
    answer: '8',
    wrong: ['7', 'Runs forever', '120'],
    explanation:
      'b takes 120 to 127, which is 8 iterations. Then b++ wraps to -128, the condition b > 0 is false and the loop ends. It does not loop forever and it does not throw.',
    trap: 'Expecting an overflow exception or an infinite loop instead of silent wrap-around.',
  },
  {
    id: 'loop-two-vars',
    topicId: 'Looping Statements',
    title: 'Two variables in a for header',
    code: java`public class Main {
    public static void main(String[] args) {
        for (int i = 0, j = 10; i < j; i += 3, j -= 3) {
            System.out.print(i + ":" + j + " ");
        }
        System.out.println();
    }
}`,
    answer: '0:10 3:7',
    wrong: ['0:10 3:7 6:4', '0:10 3:7 6:4 9:1', '0:10'],
    explanation:
      'After each pass both updates run: (0,10) then (3,7) then (6,4). At (6,4) the test 6 < 4 fails, so only the first two pairs are printed.',
    trap: 'Checking only i or only j rather than the combined condition after both updates.',
  },
  {
    id: 'loop-remove-foreach-skip',
    topicId: 'Looping Statements',
    title: 'Removing inside for-each (silent)',
    code: java`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
        for (Integer x : list) {
            if (x == 3) list.remove(x);
        }
        System.out.println(list);
    }
}`,
    answer: '[1, 2, 4]',
    wrong: ['ConcurrentModificationException', '[1, 2, 3, 4]', '[1, 2]'],
    explanation:
      'Removing the second-to-last element leaves the list size equal to the iterator cursor, so hasNext() returns false and the loop quietly ends before the modification check ever runs. Remove any other element and you would get a ConcurrentModificationException.',
    trap: 'Always expecting ConcurrentModificationException. It depends on where the removed element is. Use Iterator.remove or removeIf.',
  },
  {
    id: 'loop-remove-foreach-cme',
    topicId: 'Looping Statements',
    title: 'Removing inside for-each (loud)',
    code: java`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
        try {
            for (Integer x : list) {
                if (x == 2) list.remove(x);
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("CME");
        }
        System.out.println(list);
    }
}`,
    answer: 'CME\n[1, 3, 4]',
    wrong: ['[1, 3, 4]', 'CME\n[1, 2, 3, 4]', 'CME\n[1, 3]'],
    explanation:
      'The element is removed (so the list is [1, 3, 4]), but the next call to the iterator\'s next() detects the structural change and throws. The catch block runs and the list keeps the removal.',
    trap: 'Thinking the exception rolls back the removal, or that for-each lets you modify the list.',
  },

  // ───────────────────────── arrays ─────────────────────────
  {
    id: 'arr-alias',
    topicId: 'Array in java',
    title: 'Two names for one array',
    code: java`public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = a;
        b[0] = 99;
        System.out.println(a[0] + " " + (a == b) + " " + a.equals(b.clone()));
    }
}`,
    answer: '99 true false',
    wrong: ['1 false false', '99 true true', '1 true true'],
    explanation:
      'b = a copies the reference, not the array, so a[0] is changed too and a == b is true. clone() makes a new array and arrays use Object.equals (identity), so a.equals(clone) is false.',
    trap: 'Thinking assignment copies an array, or that array equals() compares contents.',
  },
  {
    id: 'arr-defaults',
    topicId: 'Array in java',
    title: 'Default values of new arrays',
    code: java`public class Main {
    public static void main(String[] args) {
        int[] a = new int[3];
        String[] s = new String[2];
        boolean[] f = new boolean[1];
        System.out.println(a[0] + " " + s[0] + " " + f[0]);
    }
}`,
    answer: '0 null false',
    wrong: ['0 "" false', 'null null null', 'Exception: uninitialized array'],
    explanation:
      'Array elements are always initialised: numbers to 0, booleans to false, and object references (including String) to null. Printing a null String gives the text null.',
    trap: 'Expecting an empty string for String elements, or an error for unset elements (that rule is only for local variables).',
  },
  {
    id: 'arr-equals',
    topicId: 'Array in java',
    title: 'Comparing arrays',
    code: java`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println(a == b);
        System.out.println(a.equals(b));
        System.out.println(Arrays.equals(a, b));
    }
}`,
    answer: 'false\nfalse\ntrue',
    wrong: ['false\ntrue\ntrue', 'true\ntrue\ntrue', 'false\nfalse\nfalse'],
    explanation:
      '== compares references, and arrays do not override Object.equals, so both of the first two are false. Only Arrays.equals compares element by element.',
    trap: 'Assuming equals() on arrays compares the contents, as it does for String or List.',
  },
  {
    id: 'arr-aslist',
    topicId: 'Array in java',
    title: 'Arrays.asList with a primitive array',
    code: java`import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        Integer[] b = {1, 2, 3};
        System.out.println(Arrays.asList(a).size());
        System.out.println(Arrays.asList(b).size());
    }
}`,
    answer: '1\n3',
    wrong: ['3\n3', '1\n1', '3\n1'],
    explanation:
      'Generics cannot hold primitives, so Arrays.asList(int[]) treats the whole int[] as ONE element of type int[]. An Integer[] is an Object[], so it is spread into three elements.',
    trap: 'Expecting asList to work the same for int[] and Integer[].',
  },

  // ───────────────────────── strings ─────────────────────────
  {
    id: 'str-pool',
    topicId: 'String in java',
    title: 'String pool and ==',
    code: java`public class Main {
    public static void main(String[] args) {
        String a = "hi";
        String b = "hi";
        String c = new String("hi");
        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a.equals(c));
        System.out.println(a == c.intern());
    }
}`,
    answer: 'true\nfalse\ntrue\ntrue',
    wrong: ['true\ntrue\ntrue\ntrue', 'false\nfalse\ntrue\ntrue', 'true\nfalse\ntrue\nfalse'],
    explanation:
      'Identical literals share one pooled object, so a == b. new String always creates a fresh object outside the pool, so a == c is false even though the text is equal. intern() returns the pooled instance, so a == c.intern() is true.',
    trap: 'Thinking == on Strings compares text. It compares object identity.',
  },
  {
    id: 'str-immutable',
    topicId: 'String in java',
    title: 'Ignoring the return value',
    code: java`public class Main {
    public static void main(String[] args) {
        String s = "java";
        s.toUpperCase();
        s.concat("21");
        System.out.println(s);
    }
}`,
    answer: 'java',
    wrong: ['JAVA', 'JAVA21', 'java21'],
    explanation:
      'Strings are immutable. toUpperCase and concat return new String objects and leave s alone. Because the results are discarded, s is still "java".',
    trap: 'Treating String methods as if they modify the string in place.',
  },
  {
    id: 'str-compile-time-const',
    topicId: 'String in java',
    title: 'Concatenation and the pool',
    code: java`public class Main {
    public static void main(String[] args) {
        String a = "ja";
        String b = a + "va";
        System.out.println(b == "java");
        final String c = "ja";
        String d = c + "va";
        System.out.println(d == "java");
    }
}`,
    answer: 'false\ntrue',
    wrong: ['true\ntrue', 'false\nfalse', 'true\nfalse'],
    explanation:
      'a is an ordinary variable, so a + "va" is computed at run time into a new object. c is a final variable with a constant initialiser, so c + "va" is a compile-time constant that the compiler folds into the pooled literal "java".',
    trap: 'Assuming every concatenation of literals ends up in the pool, or that final makes no difference.',
  },
  {
    id: 'str-split',
    topicId: 'String in java',
    title: 'split and trailing empty strings',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println("a,b,,".split(",").length);
        System.out.println("".split(",").length);
        System.out.println(",".split(",").length);
    }
}`,
    answer: '2\n1\n0',
    wrong: ['4\n0\n2', '3\n1\n1', '2\n0\n0'],
    explanation:
      'split drops trailing empty strings, so "a,b,," gives [a, b]. Splitting an empty string gives one element, the empty string itself (no delimiter was found). "," gives two empties which are both trailing, so the array is empty.',
    trap: 'Expecting one array slot per delimiter. Use split(",", -1) to keep trailing empties.',
  },
  {
    id: 'str-builder-vs-string',
    topicId: 'String in java',
    title: 'StringBuilder versus String when aliased',
    code: java`public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("ab");
        StringBuilder sb2 = sb;
        sb2.append("c");
        String s1 = "ab";
        String s2 = s1;
        s2 += "c";
        System.out.println(sb + " " + s1);
    }
}`,
    answer: 'abc ab',
    wrong: ['abc abc', 'ab ab', 'ab abc'],
    explanation:
      'StringBuilder is mutable, so both names see the appended c. s2 += "c" builds a NEW String and rebinds only s2; s1 still points at the unchanged "ab".',
    trap: 'Thinking += on a String modifies the shared object.',
  },
  {
    id: 'str-null-concat',
    topicId: 'String in java',
    title: 'Appending to a null String',
    code: java`public class Main {
    public static void main(String[] args) {
        String s = null;
        s += "x";
        System.out.println(s);
    }
}`,
    answer: 'nullx',
    wrong: ['NullPointerException', 'x', 'null'],
    explanation:
      'The + operator for Strings converts a null operand to the text "null" via String.valueOf, so no NullPointerException occurs. The result is "nullx".',
    trap: 'Expecting a NullPointerException, which happens only when you call a method on the null reference.',
  },

  // ───────────────────────── wrapper classes ─────────────────────────
  {
    id: 'wrap-cache',
    topicId: 'wrapper-class',
    title: 'The Integer cache',
    code: java`public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        System.out.println(a == b);
        System.out.println(c == d);
        System.out.println(c.equals(d));
    }
}`,
    answer: 'true\nfalse\ntrue',
    wrong: ['true\ntrue\ntrue', 'false\nfalse\ntrue', 'true\nfalse\nfalse'],
    explanation:
      'Autoboxing calls Integer.valueOf, which returns cached shared objects for -128..127. So a and b are the same object. 128 is outside the cache, so c and d are two distinct objects and == is false. equals compares values.',
    trap: 'Assuming == on two Integers compares numbers. It works for small values only by accident of the cache.',
  },
  {
    id: 'wrap-long-equals',
    topicId: 'wrapper-class',
    title: 'Long.equals with an int',
    code: java`public class Main {
    public static void main(String[] args) {
        Long l = 127L;
        System.out.println(l.equals(127));
        System.out.println(l.equals(127L));
    }
}`,
    answer: 'false\ntrue',
    wrong: ['true\ntrue', 'true\nfalse', 'false\nfalse'],
    explanation:
      'equals(Object) requires the argument to be a Long. The literal 127 is boxed to an Integer, a different class, so equals returns false without comparing the numbers.',
    trap: 'Expecting numeric widening. It does not happen once boxing to Object is involved.',
  },
  {
    id: 'wrap-list-remove',
    topicId: 'wrapper-class',
    title: 'remove(int) versus remove(Object)',
    code: java`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> l = new ArrayList<>(List.of(10, 20, 30, 1));
        l.remove(1);
        l.remove(Integer.valueOf(1));
        System.out.println(l);
    }
}`,
    answer: '[10, 30]',
    wrong: ['[10, 20, 30]', '[20, 30]', '[10, 20, 30, 1]'],
    explanation:
      'remove(1) with a primitive int picks remove(int index) and deletes the element at index 1 (the 20). remove(Integer.valueOf(1)) picks remove(Object) and deletes the VALUE 1. Result: [10, 30].',
    trap: 'Thinking remove(1) removes the value 1 from a List<Integer>.',
  },
  {
    id: 'wrap-ternary-promotion',
    topicId: 'wrapper-class',
    title: 'Ternary numeric promotion',
    code: java`public class Main {
    public static void main(String[] args) {
        Object o = true ? 1 : 2.0;
        System.out.println(o);
    }
}`,
    answer: '1.0',
    wrong: ['1', '2.0', 'Compile error'],
    explanation:
      'When the two branches of ?: are numeric, binary numeric promotion applies. 1 is promoted to double, so the expression has type double and the value 1.0, even though the int branch was chosen.',
    trap: 'Expecting the ternary to keep the type of the branch it selects.',
  },
  {
    id: 'wrap-nan',
    topicId: 'wrapper-class',
    title: 'NaN and negative zero',
    code: java`public class Main {
    public static void main(String[] args) {
        double n = 0.0 / 0.0;
        System.out.println(n == n);
        System.out.println(Double.valueOf(n).equals(n));
        System.out.println(0.0 == -0.0);
        System.out.println(Double.valueOf(0.0).equals(-0.0));
    }
}`,
    answer: 'false\ntrue\ntrue\nfalse',
    wrong: ['true\ntrue\ntrue\ntrue', 'false\nfalse\ntrue\nfalse', 'false\ntrue\nfalse\nfalse'],
    explanation:
      'With primitives, NaN is not equal to anything (even itself) while 0.0 == -0.0. Double.equals uses the bit pattern, so it reverses both: NaN equals NaN, but 0.0 does not equal -0.0.',
    trap: 'Assuming == and equals agree for doubles.',
  },

  // ───────────────────────── static ─────────────────────────
  {
    id: 'static-class-load',
    topicId: 'static-keyword',
    title: 'When a static block runs',
    code: java`class A {
    static { System.out.println("A static"); }
    A() { System.out.println("A ctor"); }
}

public class Main {
    static { System.out.println("Main static"); }

    public static void main(String[] args) {
        System.out.println("start");
        new A();
        new A();
    }
}`,
    answer: 'Main static\nstart\nA static\nA ctor\nA ctor',
    wrong: ['start\nMain static\nA static\nA ctor\nA ctor', 'Main static\nstart\nA static\nA ctor\nA static\nA ctor', 'Main static\nA static\nstart\nA ctor\nA ctor'],
    explanation:
      'A class is initialised the first time it is actively used. Main\'s static block runs before main, A\'s runs on the first new A() only, and once per class, never per object.',
    trap: 'Thinking static blocks of all classes run at program start, or run again for every new object.',
  },
  {
    id: 'static-shared-field',
    topicId: 'static-keyword',
    title: 'Static counter',
    code: java`class Counter {
    static int n;
    int id;
    Counter() { id = ++n; }
}

public class Main {
    public static void main(String[] args) {
        Counter c1 = new Counter();
        new Counter();
        new Counter();
        System.out.println(c1.id + " " + Counter.n);
    }
}`,
    answer: '1 3',
    wrong: ['3 3', '1 1', '1 0'],
    explanation:
      'n belongs to the class and is shared by all objects, so it counts up to 3. id is an instance field, copied into each object at construction, so c1 keeps the value 1.',
    trap: 'Thinking every object has its own copy of n, or that id follows the latest value.',
  },
  {
    id: 'static-hiding',
    topicId: 'static-keyword',
    title: 'Static methods are hidden, not overridden',
    code: java`class P {
    static String who() { return "P"; }
}

class C extends P {
    static String who() { return "C"; }
}

public class Main {
    public static void main(String[] args) {
        P p = new C();
        System.out.println(p.who());
    }
}`,
    answer: 'P',
    wrong: ['C', 'Compile error', 'null'],
    explanation:
      'Static methods are resolved at compile time using the declared type of the variable (P), not the runtime object. There is no dynamic dispatch for static methods, so P.who() runs.',
    trap: 'Expecting polymorphism to apply to static methods.',
  },
  {
    id: 'static-null-call',
    topicId: 'static-keyword',
    title: 'Calling a static method on null',
    code: java`public class Main {
    static void hello() { System.out.println("hello"); }

    public static void main(String[] args) {
        Main m = null;
        m.hello();
    }
}`,
    answer: 'hello',
    wrong: ['NullPointerException', 'Compile error', 'Nothing is printed'],
    explanation:
      'Because hello is static, the compiler uses only the declared type Main and never dereferences m. It is the same as Main.hello(), so there is no NullPointerException.',
    trap: 'Assuming any call through a null reference throws NullPointerException.',
  },

  // ───────────────────────── initializer blocks ─────────────────────────
  {
    id: 'init-order',
    topicId: 'initializer-blocks',
    title: 'Static block, instance block, constructor',
    code: java`class T {
    static { System.out.println("S"); }
    { System.out.println("I"); }
    T() { System.out.println("C"); }
}

public class Main {
    public static void main(String[] args) {
        new T();
        new T();
    }
}`,
    answer: 'S\nI\nC\nI\nC',
    wrong: ['S\nI\nC\nS\nI\nC', 'I\nC\nS\nI\nC', 'S\nC\nI\nS\nC\nI'],
    explanation:
      'The static block runs once when the class is first used. For every object, instance initialiser blocks run before the constructor body.',
    trap: 'Thinking the constructor runs first, or that static blocks repeat per instance.',
  },
  {
    id: 'init-virtual-in-ctor',
    topicId: 'initializer-blocks',
    title: 'Calling an overridable method from a constructor',
    code: java`class P {
    P() {
        System.out.println("P ctor");
        show();
    }
    void show() { System.out.println("P show"); }
}

class C extends P {
    int v = 5;
    C() { System.out.println("C ctor " + v); }
    void show() { System.out.println("C show " + v); }
}

public class Main {
    public static void main(String[] args) {
        new C();
    }
}`,
    answer: 'P ctor\nC show 0\nC ctor 5',
    wrong: ['P ctor\nP show\nC ctor 5', 'P ctor\nC show 5\nC ctor 5', 'C ctor 5\nP ctor\nC show 5'],
    explanation:
      'The parent constructor runs first, and show() is dispatched to the overriding C.show even though C\'s fields are not initialised yet. v still has its default value 0. Only after P() finishes does v = 5 run.',
    trap: 'Assuming the subclass fields are ready when the parent constructor runs. Never call overridable methods from a constructor.',
  },
  {
    id: 'init-forward-assign',
    topicId: 'initializer-blocks',
    title: 'Block before the field initialiser',
    code: java`public class Main {
    { x = 10; }
    int x = 5;

    public static void main(String[] args) {
        System.out.println(new Main().x);
    }
}`,
    answer: '5',
    wrong: ['10', 'Compile error', '0'],
    explanation:
      'Initialisers run in textual order. The block assigns 10 (legal, since only reading a field before its declaration is banned), and then int x = 5 runs and overwrites it.',
    trap: 'Thinking the block always wins, or that the forward assignment is a compile error.',
  },

  // ───────────────────────── constructors ─────────────────────────
  {
    id: 'ctor-this-chain',
    topicId: 'Contructor in java',
    title: 'this(...) in a constructor',
    code: java`class A {
    A() {
        this(1);
        System.out.println("A()");
    }
    A(int x) {
        System.out.println("A(int)");
    }
}

public class Main {
    public static void main(String[] args) {
        new A();
    }
}`,
    answer: 'A(int)\nA()',
    wrong: ['A()\nA(int)', 'A()', 'A(int)'],
    explanation:
      'this(1) must be the first statement and it runs the other constructor completely before the rest of the body continues. So A(int) prints before A().',
    trap: 'Thinking the calling constructor\'s remaining statements run before the delegated one.',
  },
  {
    id: 'ctor-default-gone',
    topicId: 'Contructor in java',
    title: 'The vanishing default constructor',
    code: java`class A {
    A(int x) { }
}

public class Main {
    public static void main(String[] args) {
        A a = new A();
        System.out.println("ok");
    }
}`,
    answer: 'Compile error',
    wrong: ['ok', 'Runtime exception', 'null'],
    explanation:
      'The compiler only supplies a no-argument constructor when you write no constructor at all. As soon as you declare A(int), the no-arg one disappears and new A() does not compile.',
    trap: 'Thinking every class always has a no-argument constructor.',
  },
  {
    id: 'ctor-super-order',
    topicId: 'constructor-chaining',
    title: 'Parent constructor first',
    code: java`class B {
    B() { System.out.println("B"); }
}

class D extends B {
    D() { System.out.println("D"); }
    D(int x) {
        this();
        System.out.println("D(int)");
    }
}

public class Main {
    public static void main(String[] args) {
        new D(1);
    }
}`,
    answer: 'B\nD\nD(int)',
    wrong: ['D(int)\nD\nB', 'D\nB\nD(int)', 'B\nD(int)\nD'],
    explanation:
      'D(int) delegates to D() via this(), which implicitly calls super() first. The chain runs top-down: B, then D, then the rest of D(int).',
    trap: 'Thinking constructors run child first, like the call stack unwinding.',
  },
  {
    id: 'ctor-super-implicit',
    topicId: 'constructor-chaining',
    title: 'Implicit super() call',
    code: java`class Animal {
    Animal() { System.out.println("Animal"); }
}

class Dog extends Animal {
    Dog() { System.out.println("Dog"); }
}

public class Main {
    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println("done");
    }
}`,
    answer: 'Animal\nDog\ndone',
    wrong: ['Dog\ndone', 'Dog\nAnimal\ndone', 'Animal\ndone'],
    explanation:
      'Every constructor begins with super() unless it calls this(...) or super(...) explicitly. The runtime type is Dog, so both constructors run, parent first. The variable\'s declared type does not matter.',
    trap: 'Thinking the declared type Animal means only the Animal constructor runs.',
  },

  // ───────────────────────── inheritance ─────────────────────────
  {
    id: 'inh-field-hiding',
    topicId: 'inheritance in Java',
    title: 'Fields are not polymorphic',
    code: java`class P { String name = "P"; }
class C extends P { String name = "C"; }

public class Main {
    public static void main(String[] args) {
        P p = new C();
        System.out.println(p.name + " " + ((C) p).name);
    }
}`,
    answer: 'P C',
    wrong: ['C C', 'P P', 'C P'],
    explanation:
      'Fields are bound by the declared type at compile time, not the object type. p.name reads P\'s field, and after the cast to C it reads C\'s hiding field. Only instance methods are overridden polymorphically.',
    trap: 'Assuming field access is dynamic like method calls.',
  },
  {
    id: 'inh-private-method',
    topicId: 'inheritance in Java',
    title: 'Overriding a private method',
    code: java`class P {
    private void m() { System.out.println("P"); }
    void call() { m(); }
}

class C extends P {
    void m() { System.out.println("C"); }
}

public class Main {
    public static void main(String[] args) {
        new C().call();
    }
}`,
    answer: 'P',
    wrong: ['C', 'Compile error', 'P\nC'],
    explanation:
      'A private method is not inherited, so C.m() does not override it; it is a separate unrelated method. Inside P, m() always means P\'s own private m, so P is printed.',
    trap: 'Assuming a same-named method in the subclass always overrides.',
  },
  {
    id: 'inh-super-chain',
    topicId: 'inheritance in Java',
    title: 'super calls up the chain',
    code: java`class A { String hi() { return "A"; } }
class B extends A { String hi() { return super.hi() + "B"; } }
class C extends B { String hi() { return super.hi() + "C"; } }

public class Main {
    public static void main(String[] args) {
        A a = new C();
        System.out.println(a.hi());
    }
}`,
    answer: 'ABC',
    wrong: ['C', 'A', 'CBA'],
    explanation:
      'The runtime type is C, so C.hi runs. super.hi() inside it calls B.hi, which calls A.hi. Strings are built in the order A, then B, then C.',
    trap: 'Reading the result in call order (C first) rather than in return order.',
  },

  // ───────────────────────── polymorphism ─────────────────────────
  {
    id: 'poly-overload-static-type',
    topicId: 'Polymorphism in java',
    title: 'Overloads are chosen at compile time',
    code: java`public class Main {
    static void f(Object o) { System.out.println("Object"); }
    static void f(String s) { System.out.println("String"); }

    public static void main(String[] args) {
        Object o = "hi";
        f(o);
        f("hi");
        f(null);
    }
}`,
    answer: 'Object\nString\nString',
    wrong: ['String\nString\nString', 'Object\nObject\nObject', 'Object\nString\nObject'],
    explanation:
      'Overloads are picked from the compile-time types. o is declared Object so f(Object) runs even though it holds a String. null matches both, and the compiler picks the most specific one, String.',
    trap: 'Expecting the runtime type of the object to select the overload. Only overriding does that.',
  },
  {
    id: 'poly-widening-vs-boxing',
    topicId: 'Polymorphism in java',
    title: 'Widening beats boxing beats varargs',
    code: java`public class Main {
    static void f(long x)    { System.out.println("long"); }
    static void f(Integer x) { System.out.println("Integer"); }
    static void f(int... x)  { System.out.println("varargs"); }

    public static void main(String[] args) {
        f(5);
    }
}`,
    answer: 'long',
    wrong: ['Integer', 'varargs', 'Compile error: ambiguous'],
    explanation:
      'Overload resolution runs in phases: first without boxing or varargs (int widens to long here), then with boxing, and only last with varargs. The first phase already finds f(long).',
    trap: 'Thinking an exact-looking int to Integer match beats widening.',
  },
  {
    id: 'poly-overload-not-override',
    topicId: 'Polymorphism in java',
    title: 'Overload that looks like an override',
    code: java`class A {
    void m(A a) { System.out.println("A.m(A)"); }
}

class B extends A {
    void m(B b) { System.out.println("B.m(B)"); }
}

public class Main {
    public static void main(String[] args) {
        A x = new B();
        x.m(new B());
    }
}`,
    answer: 'A.m(A)',
    wrong: ['B.m(B)', 'Compile error', 'A.m(A)\nB.m(B)'],
    explanation:
      'B.m(B) has a different parameter type, so it overloads rather than overrides. Through an A reference only m(A) is visible, so A.m(A) is called. Adding @Override to B.m would have been a compile error.',
    trap: 'Thinking the same method name in a subclass overrides. Parameter types must match exactly.',
  },
  {
    id: 'poly-primitive-phases',
    topicId: 'Polymorphism in java',
    title: 'Which overload for char, long and Integer?',
    code: java`public class Main {
    static void m(int i)    { System.out.println("int"); }
    static void m(double d) { System.out.println("double"); }
    static void m(Object o) { System.out.println("Object"); }

    public static void main(String[] args) {
        m('a');
        m(5L);
        m(Integer.valueOf(5));
    }
}`,
    answer: 'int\ndouble\nObject',
    wrong: ['int\nint\nint', 'Object\nObject\nObject', 'int\ndouble\nint'],
    explanation:
      'char widens to int, and long widens to double (no m(long) exists). Integer is a subtype of Object, so phase one (no unboxing) already matches m(Object) and the compiler never gets to unboxing to int.',
    trap: 'Assuming an Integer argument unboxes to int. Subtyping is tried before unboxing.',
  },

  // ───────────────────────── equals / hashCode ─────────────────────────
  {
    id: 'eq-set-without-hashcode',
    topicId: 'equals-hashcode',
    title: 'equals without hashCode in a HashSet',
    code: java`import java.util.*;

class P {
    String n;
    P(String n) { this.n = n; }
    @Override public boolean equals(Object o) {
        return o instanceof P p && p.n.equals(n);
    }
}

public class Main {
    public static void main(String[] args) {
        Set<P> s = new HashSet<>();
        s.add(new P("a"));
        s.add(new P("a"));
        System.out.println(s.size());
        System.out.println(new P("a").equals(new P("a")));
    }
}`,
    answer: '2\ntrue',
    wrong: ['1\ntrue', '2\nfalse', '1\nfalse'],
    explanation:
      'HashSet first uses hashCode to find a bucket. P inherits the identity hashCode, so two equal objects have different hashes and land in different buckets; equals is never even asked. Both are kept.',
    trap: 'Thinking overriding equals alone is enough. The contract requires equal objects to have equal hash codes.',
  },
  {
    id: 'eq-mutable-key',
    topicId: 'equals-hashcode',
    title: 'Mutating a HashMap key',
    code: java`import java.util.*;

class K {
    int v;
    K(int v) { this.v = v; }
    @Override public boolean equals(Object o) { return o instanceof K k && k.v == v; }
    @Override public int hashCode() { return v; }
}

public class Main {
    public static void main(String[] args) {
        Map<K, String> m = new HashMap<>();
        K k = new K(1);
        m.put(k, "x");
        k.v = 2;
        System.out.println(m.get(k));
        System.out.println(m.containsKey(new K(1)));
    }
}`,
    answer: 'null\nfalse',
    wrong: ['x\nfalse', 'x\ntrue', 'null\ntrue'],
    explanation:
      'The entry was stored under hash 1. After the change, get(k) looks for hash 2 and finds nothing. Looking up a new K(1) finds the right bucket but equals now compares 1 with 2 and fails. The entry is lost in the map.',
    trap: 'Expecting the map to follow the key as it changes. Keys must be effectively immutable.',
  },
  {
    id: 'eq-overload-trap',
    topicId: 'equals-hashcode',
    title: 'equals(P) is an overload',
    code: java`import java.util.*;

class P {
    int x;
    P(int x) { this.x = x; }
    public boolean equals(P other) { return x == other.x; }
}

public class Main {
    public static void main(String[] args) {
        Object a = new P(1), b = new P(1);
        P c = new P(1), d = new P(1);
        System.out.println(a.equals(b));
        System.out.println(c.equals(d));
        System.out.println(List.of(c).contains(d));
    }
}`,
    answer: 'false\ntrue\nfalse',
    wrong: ['true\ntrue\ntrue', 'false\ntrue\ntrue', 'false\nfalse\nfalse'],
    explanation:
      'equals(P) overloads rather than overrides equals(Object). With Object-typed references the compiler picks Object.equals (identity). With P-typed references it picks equals(P). Collections always call equals(Object), so contains is false. @Override would have caught this.',
    trap: 'Believing any method named equals customises equality everywhere.',
  },
  {
    id: 'eq-string-collision',
    topicId: 'equals-hashcode',
    title: 'Same hash code, different objects',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println("Aa".hashCode() == "BB".hashCode());
        System.out.println("Aa".equals("BB"));
    }
}`,
    answer: 'true\nfalse',
    wrong: ['false\nfalse', 'true\ntrue', 'false\ntrue'],
    explanation:
      'Both hash to 2112 (65*31+97 equals 66*31+66). Equal objects must have equal hashes, but the reverse is not true: unequal objects can collide, which is why hash lookups always call equals as well.',
    trap: 'Assuming equal hash codes mean equal objects.',
  },

  // ───────────────────────── immutable classes ─────────────────────────
  {
    id: 'imm-defensive-copy',
    topicId: 'immutable-classes',
    title: 'Storing a caller\'s array',
    code: java`class Box {
    private final int[] d;
    Box(int[] d) { this.d = d; }
    int first() { return d[0]; }
}

public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 2};
        Box b = new Box(arr);
        arr[0] = 100;
        System.out.println(b.first());
    }
}`,
    answer: '100',
    wrong: ['1', 'Compile error', '0'],
    explanation:
      'final only stops the field being reassigned. The Box still shares the caller\'s array, so changes leak in. A real immutable class would store d.clone() in the constructor.',
    trap: 'Thinking final fields plus no setters make a class immutable.',
  },
  {
    id: 'imm-unmodifiable-view',
    topicId: 'immutable-classes',
    title: 'Unmodifiable view versus List.of',
    code: java`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> src = new ArrayList<>(List.of(1, 2));
        List<Integer> view = Collections.unmodifiableList(src);
        src.add(3);
        System.out.println(view);
        try {
            List.of(1).add(2);
        } catch (UnsupportedOperationException e) {
            System.out.println("UOE");
        }
    }
}`,
    answer: '[1, 2, 3]\nUOE',
    wrong: ['[1, 2]\nUOE', '[1, 2, 3]\nNothing else', '[1, 2]\nNothing else'],
    explanation:
      'unmodifiableList is only a read-only VIEW; changes to the backing list show through. List.of builds a genuinely immutable list, and adding to it throws UnsupportedOperationException.',
    trap: 'Thinking an unmodifiable wrapper makes a snapshot.',
  },
  {
    id: 'imm-bigint',
    topicId: 'immutable-classes',
    title: 'Ignoring a BigInteger result',
    code: java`import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        BigInteger a = BigInteger.ONE;
        a.add(BigInteger.TEN);
        System.out.println(a);
    }
}`,
    answer: '1',
    wrong: ['11', '10', 'Compile error'],
    explanation:
      'BigInteger is immutable: add returns a new object and leaves a untouched. The result was thrown away, so a is still 1. Write a = a.add(...).',
    trap: 'Treating add like +=.',
  },

  // ───────────────────────── final ─────────────────────────
  {
    id: 'final-reference',
    topicId: 'final-keyword',
    title: 'A final reference to a mutable object',
    code: java`public class Main {
    public static void main(String[] args) {
        final StringBuilder sb = new StringBuilder("a");
        sb.append("b");
        System.out.println(sb);
    }
}`,
    answer: 'ab',
    wrong: ['a', 'Compile error', 'b'],
    explanation:
      'final fixes the variable (it can never point to another object) but not the object. Modifying the StringBuilder through it is perfectly legal.',
    trap: 'Thinking final means the object cannot change.',
  },
  {
    id: 'final-case-constant',
    topicId: 'final-keyword',
    title: 'final local as a case label',
    code: java`public class Main {
    public static void main(String[] args) {
        final int one = 1;
        int v = 1;
        switch (v) {
            case one: System.out.println("one"); break;
            default: System.out.println("other");
        }
    }
}`,
    answer: 'one',
    wrong: ['other', 'Compile error', 'one\nother'],
    explanation:
      'A final variable initialised with a constant expression is itself a compile-time constant, so it is allowed as a case label. Without final the same code would not compile.',
    trap: 'Thinking case labels must be literals.',
  },
  {
    id: 'final-array',
    topicId: 'final-keyword',
    title: 'final array elements',
    code: java`public class Main {
    public static void main(String[] args) {
        final int[] a = {1, 2};
        a[0] = 9;
        System.out.println(a[0]);
    }
}`,
    answer: '9',
    wrong: ['1', 'Compile error', 'Runtime exception'],
    explanation:
      'Only the reference a is final. The elements of an array are always mutable, so a[0] = 9 works. a = new int[3] would be the compile error.',
    trap: 'Thinking final arrays are read-only.',
  },

  // ───────────────────────── this / super ─────────────────────────
  {
    id: 'ts-super-call',
    topicId: 'this-super',
    title: 'this inside an inherited method',
    code: java`class A {
    String name() { return "A"; }
    String who() { return this.name(); }
}

class B extends A {
    String name() { return "B"; }
    String test() { return super.who(); }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new B().test());
    }
}`,
    answer: 'B',
    wrong: ['A', 'Compile error', 'AB'],
    explanation:
      'super.who() runs A\'s code, but this still refers to the real B object. this.name() is a normal virtual call, so it reaches B.name(). super only chooses where the lookup starts for that single call.',
    trap: 'Thinking super.who() makes everything inside behave as if the object were an A.',
  },
  {
    id: 'ts-shadowed-param',
    topicId: 'this-super',
    title: 'The missing this',
    code: java`class A {
    int x = 1;
    void set(int x) { x = x; }
}

public class Main {
    public static void main(String[] args) {
        A a = new A();
        a.set(5);
        System.out.println(a.x);
    }
}`,
    answer: '1',
    wrong: ['5', '0', 'Compile error'],
    explanation:
      'The parameter x shadows the field, so x = x assigns the parameter to itself and the field is never touched. It needs this.x = x.',
    trap: 'Thinking the assignment reaches the field because the names match.',
  },

  // ───────────────────────── methods (pass by value) ─────────────────────────
  {
    id: 'meth-swap',
    topicId: 'methods-in-java',
    title: 'A swap method',
    code: java`public class Main {
    static void swap(int a, int b) {
        int t = a; a = b; b = t;
    }

    public static void main(String[] args) {
        int x = 1, y = 2;
        swap(x, y);
        System.out.println(x + " " + y);
    }
}`,
    answer: '1 2',
    wrong: ['2 1', '1 1', '2 2'],
    explanation:
      'Java always passes arguments by value. The method gets copies of the two ints and swaps its own copies, so the caller\'s variables do not change.',
    trap: 'Expecting primitives to be passed by reference.',
  },
  {
    id: 'meth-object-ref',
    topicId: 'methods-in-java',
    title: 'Modify versus reassign a parameter',
    code: java`public class Main {
    static void f(StringBuilder sb) {
        sb.append("!");
        sb = new StringBuilder("new");
        sb.append("?");
    }

    public static void main(String[] args) {
        StringBuilder s = new StringBuilder("hi");
        f(s);
        System.out.println(s);
    }
}`,
    answer: 'hi!',
    wrong: ['hi', 'new?', 'hi!?'],
    explanation:
      'The method receives a copy of the reference. Appending through it mutates the shared object, so "hi!" is visible. Reassigning sb only repoints the local copy, and the later "?" goes to the new object.',
    trap: 'Thinking objects are passed by reference so that reassignment is also seen by the caller.',
  },
  {
    id: 'meth-immutable-param',
    topicId: 'methods-in-java',
    title: 'Passing a String and an Integer',
    code: java`public class Main {
    static void f(String s, Integer n) {
        s += "x";
        n++;
    }

    public static void main(String[] args) {
        String s = "a";
        Integer n = 5;
        f(s, n);
        System.out.println(s + n);
    }
}`,
    answer: 'a5',
    wrong: ['ax6', 'ax5', 'a6'],
    explanation:
      'Both String and Integer are immutable. += and ++ create new objects and rebind the method\'s local parameter variables only, so the caller\'s s and n are unchanged.',
    trap: 'Expecting object arguments to be modifiable in place.',
  },

  // ───────────────────────── varargs ─────────────────────────
  {
    id: 'va-count',
    topicId: 'varargs',
    title: 'How many arguments?',
    code: java`public class Main {
    static int count(int... a) { return a.length; }

    public static void main(String[] args) {
        System.out.println(count());
        System.out.println(count(1, 2));
        System.out.println(count(new int[] {1, 2, 3}));
    }
}`,
    answer: '0\n2\n3',
    wrong: ['Compile error', '1\n2\n1', '0\n2\n1'],
    explanation:
      'With no arguments the compiler creates an empty array (never null). Passing an actual int[] is used directly as the varargs array rather than wrapped.',
    trap: 'Thinking varargs needs at least one argument or that an array is wrapped inside another array.',
  },
  {
    id: 'va-object-array',
    topicId: 'varargs',
    title: 'Object... with arrays',
    code: java`public class Main {
    static void f(Object... o) { System.out.println(o.length); }

    public static void main(String[] args) {
        f(new String[] {"a", "b"});
        f((Object) new String[] {"a", "b"});
        f(new int[] {1, 2});
    }
}`,
    answer: '2\n1\n1',
    wrong: ['2\n2\n2', '1\n1\n1', '2\n1\n2'],
    explanation:
      'A String[] is an Object[], so it becomes the varargs array itself (length 2). The cast to Object hides that, so the array is wrapped as one element. An int[] is not an Object[], so it is also wrapped as a single element.',
    trap: 'Assuming any array passed to varargs is always spread out.',
  },
  {
    id: 'va-overload',
    topicId: 'varargs',
    title: 'Overload: Object versus Object...',
    code: java`public class Main {
    static void p(Object o)      { System.out.println("obj"); }
    static void p(Object... o)   { System.out.println("varargs"); }

    public static void main(String[] args) {
        p("a");
        p("a", "b");
        p(new Object[] {"a"});
    }
}`,
    answer: 'obj\nvarargs\nvarargs',
    wrong: ['obj\nobj\nobj', 'varargs\nvarargs\nvarargs', 'obj\nvarargs\nobj'],
    explanation:
      'A varargs method is only considered as a last resort, so p("a") picks p(Object). Two arguments force varargs. For an Object[] both methods apply by subtyping, and Object[] is the more specific parameter type, so the varargs method is chosen.',
    trap: 'Thinking a method taking an array loses to a method taking Object.',
  },

  // ───────────────────────── switch expressions ─────────────────────────
  {
    id: 'sw-arrow-no-fallthrough',
    topicId: 'switch-expressions',
    title: 'Arrow cases do not fall through',
    code: java`public class Main {
    public static void main(String[] args) {
        int n = 2;
        switch (n) {
            case 2 -> System.out.println("two");
            case 3 -> System.out.println("three");
            default -> System.out.println("d");
        }
    }
}`,
    answer: 'two',
    wrong: ['two\nthree', 'two\nthree\nd', 'two\nd'],
    explanation:
      'The arrow form runs exactly the matched case and then leaves the switch. No break is needed and no fall-through happens.',
    trap: 'Carrying over the fall-through behaviour of the old colon syntax.',
  },
  {
    id: 'sw-colon-yield-fallthrough',
    topicId: 'switch-expressions',
    title: 'Colon labels still fall through',
    code: java`public class Main {
    public static void main(String[] args) {
        int r = switch (2) {
            case 1: yield 10;
            case 2: System.out.print("two ");
            case 3: yield 30;
            default: yield 0;
        };
        System.out.println(r);
    }
}`,
    answer: 'two 30',
    wrong: ['two 0', '30', 'two 10'],
    explanation:
      'This is a switch expression, but it uses the old colon labels, which still fall through. case 2 prints, drops into case 3 and yields 30. Only the arrow form is fall-through free.',
    trap: 'Assuming switch expressions never fall through.',
  },
  {
    id: 'sw-null-selector',
    topicId: 'switch-expressions',
    title: 'Switching on a null String',
    code: java`public class Main {
    public static void main(String[] args) {
        String s = null;
        try {
            switch (s) {
                case "a" -> System.out.println("a");
                default -> System.out.println("default");
            }
        } catch (NullPointerException e) {
            System.out.println("NPE");
        }
    }
}`,
    answer: 'NPE',
    wrong: ['default', 'a', 'Nothing is printed'],
    explanation:
      'A switch on a reference type throws NullPointerException when the selector is null, unless the switch has an explicit case null. default does not catch null.',
    trap: 'Thinking default covers null as well.',
  },

  // ───────────────────────── exceptions and finally ─────────────────────────
  {
    id: 'fin-return-override',
    topicId: 'multicatch-finally-trap',
    title: 'return inside finally',
    code: java`public class Main {
    @SuppressWarnings("finally")
    static int f() {
        try {
            return 1;
        } finally {
            return 2;
        }
    }

    public static void main(String[] args) {
        System.out.println(f());
    }
}`,
    answer: '2',
    wrong: ['1', '3', 'Compile error'],
    explanation:
      'finally always runs on the way out. A return in finally replaces the pending return from try. This also swallows any exception that was in flight, which is why it is considered a bad practice.',
    trap: 'Thinking the first return has already finished the method.',
  },
  {
    id: 'fin-primitive-copy',
    topicId: 'multicatch-finally-trap',
    title: 'Changing the returned variable in finally',
    code: java`public class Main {
    static int f() {
        int x = 1;
        try {
            return x;
        } finally {
            x = 99;
        }
    }

    public static void main(String[] args) {
        System.out.println(f());
    }
}`,
    answer: '1',
    wrong: ['99', '0', 'Compile error'],
    explanation:
      'The value of the return expression (1) is computed and saved before finally runs. Changing the variable afterwards does not alter the saved value. If x were a mutable object, changes made to it would be visible.',
    trap: 'Thinking the return reads the variable after the finally block.',
  },
  {
    id: 'fin-exit',
    topicId: 'multicatch-finally-trap',
    title: 'System.exit and finally',
    code: java`public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("try");
            System.exit(0);
        } finally {
            System.out.println("finally");
        }
    }
}`,
    answer: 'try',
    wrong: ['try\nfinally', 'finally', 'Compile error'],
    explanation:
      'System.exit stops the JVM immediately, so the finally block never gets a chance to run. finally is guaranteed only as long as the JVM keeps running normally.',
    trap: 'Believing finally runs no matter what.',
  },
  {
    id: 'fin-order',
    topicId: 'multicatch-finally-trap',
    title: 'catch with return, then finally',
    code: java`public class Main {
    static int g() {
        try {
            System.out.println("try");
            throw new RuntimeException("x");
        } catch (RuntimeException e) {
            System.out.println("catch");
            return 1;
        } finally {
            System.out.println("finally");
        }
    }

    public static void main(String[] args) {
        System.out.println("result " + g());
    }
}`,
    answer: 'try\ncatch\nfinally\nresult 1',
    wrong: ['try\ncatch\nresult 1\nfinally', 'try\nfinally\nresult 1', 'try\ncatch\nresult 1'],
    explanation:
      'The return in catch only prepares the value 1. Before the method actually leaves, finally runs and prints. Only then does the caller get the value and print the result line.',
    trap: 'Thinking the return leaves immediately so finally runs after the caller continues.',
  },
  {
    id: 'exc-finally-throws',
    topicId: 'exceptions',
    title: 'An exception thrown in finally',
    code: java`public class Main {
    public static void main(String[] args) {
        try {
            try {
                throw new RuntimeException("A");
            } finally {
                throw new IllegalStateException("B");
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}`,
    answer: 'B',
    wrong: ['A', 'A\nB', 'Compile error'],
    explanation:
      'The exception from finally replaces the original one, so A is silently lost. This is exactly why try-with-resources records suppressed exceptions instead.',
    trap: 'Assuming the first exception always wins.',
  },
  {
    id: 'exc-array-eval-order',
    topicId: 'exceptions',
    title: 'Which exception comes first?',
    code: java`public class Main {
    public static void main(String[] args) {
        int[] a = new int[2];
        try {
            a[2] = 1 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Index");
        }
    }
}`,
    answer: 'Arithmetic',
    wrong: ['Index', 'Arithmetic\nIndex', 'Compile error'],
    explanation:
      'For array assignment the right-hand side is evaluated BEFORE the index is checked against the array bounds. 1 / 0 throws first, so the bad index is never even examined.',
    trap: 'Assuming the invalid index fails first because it is written on the left.',
  },
  {
    id: 'twr-close-order',
    topicId: 'try-with-resources',
    title: 'Order of closing resources',
    code: java`class R implements AutoCloseable {
    final String n;
    R(String n) { this.n = n; System.out.println("open " + n); }
    public void close() { System.out.println("close " + n); }
}

public class Main {
    public static void main(String[] args) {
        try (R a = new R("a"); R b = new R("b")) {
            System.out.println("body");
        }
    }
}`,
    answer: 'open a\nopen b\nbody\nclose b\nclose a',
    wrong: ['open a\nopen b\nbody\nclose a\nclose b', 'body\nopen a\nopen b\nclose b\nclose a', 'open a\nbody\nclose a\nopen b\nclose b'],
    explanation:
      'Resources are opened in declaration order and closed in REVERSE order, like a stack, so dependents are closed before the things they rely on.',
    trap: 'Assuming resources close in the order they were opened.',
  },
  {
    id: 'twr-suppressed',
    topicId: 'try-with-resources',
    title: 'Exception in body and in close()',
    code: java`class R implements AutoCloseable {
    public void close() { throw new IllegalStateException("close"); }
}

public class Main {
    public static void main(String[] args) {
        try (R r = new R()) {
            throw new RuntimeException("body");
        } catch (Exception e) {
            System.out.println(e.getMessage() + " " + e.getSuppressed().length);
        }
    }
}`,
    answer: 'body 1',
    wrong: ['close 0', 'body 0', 'close 1'],
    explanation:
      'The exception from the body stays as the main exception. The exception from close() is attached to it as a suppressed exception instead of replacing it, which is the improvement over try/finally.',
    trap: 'Expecting the close() exception to replace the body exception, as happens with finally.',
  },

  // ───────────────────────── strings Java 11 ─────────────────────────
  {
    id: 'sm-repeat-lines',
    topicId: 'string-methods-11',
    title: 'isBlank, lines and strip',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println("ab".repeat(0).isEmpty());
        System.out.println("a\nb\n\nc".lines().count());
        System.out.println("  x ".stripLeading() + "|");
    }
}`,
    answer: 'true\n4\nx |',
    wrong: ['false\n3\nx|', 'true\n3\nx|', 'true\n4\n  x|'],
    explanation:
      'repeat(0) gives an empty string. lines() splits on line terminators and keeps the blank line in the middle, giving a, b, empty and c. stripLeading removes only the leading whitespace, so the trailing space before | remains.',
    trap: 'Expecting lines() to skip blank lines or stripLeading to remove both ends.',
  },
  {
    id: 'sm-split-regex',
    topicId: 'string-methods-11',
    title: 'split with a limit, and with a dot',
    code: java`import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println(Arrays.toString("a-b-c".split("-", 2)));
        System.out.println("a.b".split(".").length);
    }
}`,
    answer: '[a, b-c]\n0',
    wrong: ['[a, b, c]\n2', '[a, b-c]\n2', '[a, b]\n0'],
    explanation:
      'A limit of 2 stops after one split, leaving the rest in the last element. split takes a regular expression, and "." matches ANY character, so every character is a delimiter, producing only empty strings, which are dropped. Use "\\\\." to split on a real dot.',
    trap: 'Treating the split argument as plain text instead of a regex.',
  },

  // ───────────────────────── records ─────────────────────────
  {
    id: 'rec-equals',
    topicId: 'records',
    title: 'Record equality and toString',
    code: java`public class Main {
    record P(int x, int y) { }

    public static void main(String[] args) {
        P a = new P(1, 2), b = new P(1, 2);
        System.out.println(a == b);
        System.out.println(a.equals(b));
        System.out.println(a);
    }
}`,
    answer: 'false\ntrue\nP[x=1, y=2]',
    wrong: ['true\ntrue\nP[x=1, y=2]', 'false\nfalse\nP@1b6d3586', 'false\ntrue\nP(x=1, y=2)'],
    explanation:
      'A record generates equals, hashCode and toString from its components, so two records with the same values are equal, but they are still two separate objects, so == is false. The generated toString format is P[x=1, y=2].',
    trap: 'Thinking == compares record contents, or that toString looks like a normal Object.toString().',
  },
  {
    id: 'rec-compact-ctor',
    topicId: 'records',
    title: 'Compact canonical constructor',
    code: java`public class Main {
    record R(String n) {
        R {
            n = n.trim();
        }
    }

    public static void main(String[] args) {
        System.out.println(new R("  hi ").n() + "|");
    }
}`,
    answer: 'hi|',
    wrong: ['  hi |', 'Compile error', 'hi |'],
    explanation:
      'In a compact constructor the parameters can be reassigned, and the final parameter values are then assigned to the fields automatically. So the stored name is the trimmed text.',
    trap: 'Thinking you need this.n = ... or that the parameter cannot be changed.',
  },

  // ───────────────────────── text blocks ─────────────────────────
  {
    id: 'tb-indent',
    topicId: 'text-blocks',
    title: 'Incidental whitespace',
    code: java`public class Main {
    public static void main(String[] args) {
        String t = """
            Hello
              World
            """;
        System.out.println(t.length());
        System.out.println(t.lines().count());
    }
}`,
    answer: '14\n2',
    wrong: ['26\n2', '13\n2', '14\n3'],
    explanation:
      'The compiler strips the common leading indentation, using the closing delimiter as part of the calculation, so the content is "Hello\\n  World\\n" (5 + 1 + 7 + 1 = 14 characters). Only the relative extra indent of World remains.',
    trap: 'Counting the source indentation as part of the string.',
  },
  {
    id: 'tb-closing-delimiter',
    topicId: 'text-blocks',
    title: 'Where the closing quotes sit',
    code: java`public class Main {
    public static void main(String[] args) {
        String a = """
            x
            """;
        String b = """
            x""";
        System.out.println(a.endsWith("\n"));
        System.out.println(b.endsWith("\n"));
    }
}`,
    answer: 'true\nfalse',
    wrong: ['true\ntrue', 'false\nfalse', 'false\ntrue'],
    explanation:
      'The newline before the closing delimiter belongs to the string. In a the closing quotes are on their own line, so the text ends with a newline. In b they follow x directly, so there is no trailing newline.',
    trap: 'Thinking text blocks always end with, or never end with, a newline.',
  },

  // ───────────────────────── string formatting ─────────────────────────
  {
    id: 'fmt-widths',
    topicId: 'string-formatting',
    title: 'Width and flags',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println(String.format("%5.1f|%-5d|%05d", 3.14159, 42, 42));
    }
}`,
    answer: '  3.1|42   |00042',
    wrong: ['3.1  |   42|42000', '3.14159|42|42', '  3.1|   42|00042'],
    explanation:
      '%5.1f is width 5 with one decimal, right-aligned: "  3.1". %-5d left-aligns in 5 columns: "42   ". %05d pads with zeros on the left: "00042".',
    trap: 'Mixing up which side the - flag pads, or reading 5 as a digit count.',
  },
  {
    id: 'fmt-boolean',
    topicId: 'string-formatting',
    title: '%b with a String',
    code: java`public class Main {
    public static void main(String[] args) {
        System.out.println(String.format("%b", "false"));
        System.out.println(String.format("%b", (Object) null));
        System.out.println("%s!".formatted((Object) null));
    }
}`,
    answer: 'true\nfalse\nnull!',
    wrong: ['false\nfalse\nnull!', 'true\nfalse\n!', 'false\nNullPointerException\nnull!'],
    explanation:
      'For %b, null gives false, a Boolean gives its value, and ANY other object gives true, even the String "false". %s on null prints the text null.',
    trap: 'Expecting %b to parse the String content.',
  },

  // ───────────────────────── comparable / comparator ─────────────────────────
  {
    id: 'cmp-natural-strings',
    topicId: 'comparable-comparator',
    title: 'Sorting number strings',
    code: java`import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>(List.of("10", "9", "2"));
        Collections.sort(l);
        System.out.println(l);
    }
}`,
    answer: '[10, 2, 9]',
    wrong: ['[2, 9, 10]', '[10, 9, 2]', '[9, 2, 10]'],
    explanation:
      'Strings sort lexicographically, character by character. "10" starts with 1, which is less than 2 and 9, so it comes first. Numbers would need Integer values or a numeric comparator.',
    trap: 'Expecting numeric ordering for strings that happen to contain numbers.',
  },
  {
    id: 'cmp-subtraction-overflow',
    topicId: 'comparable-comparator',
    title: 'Comparing by subtraction',
    code: java`public class Main {
    public static void main(String[] args) {
        int a = Integer.MAX_VALUE, b = -1;
        System.out.println(a - b);
        System.out.println(Integer.compare(a, b));
    }
}`,
    answer: '-2147483648\n1',
    wrong: ['2147483648\n1', '-2147483648\n-1', '2147483648\n-1'],
    explanation:
      'MAX_VALUE - (-1) overflows to a negative number, so a comparator written as (a, b) -> a - b would claim that a is smaller than b. Integer.compare never overflows and correctly returns 1.',
    trap: 'Using subtraction as a shortcut comparator. It only works when the values cannot overflow.',
  },

  // ───────────────────────── cloning ─────────────────────────
  {
    id: 'clone-shallow',
    topicId: 'object-cloning',
    title: 'Cloning a 2D array',
    code: java`public class Main {
    public static void main(String[] args) {
        int[][] a = {{1, 2}, {3}};
        int[][] b = a.clone();
        b[0][0] = 9;
        b[1] = new int[] {7};
        System.out.println(a[0][0] + " " + a[1][0]);
    }
}`,
    answer: '9 3',
    wrong: ['1 3', '9 7', '1 7'],
    explanation:
      'clone() is shallow: b is a new outer array holding the SAME inner arrays, so b[0][0] = 9 changes the shared row visible through a. Replacing b[1] changes only b\'s own slot, so a[1][0] stays 3.',
    trap: 'Thinking clone() copies nested objects too.',
  },
  {
    id: 'clone-array-vs-ref',
    topicId: 'object-cloning',
    title: 'Clone of a 1D array versus reference copy',
    code: java`public class Main {
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] ref = a;
        int[] copy = a.clone();
        a[0] = 100;
        System.out.println(ref[0] + " " + copy[0]);
    }
}`,
    answer: '100 1',
    wrong: ['1 1', '100 100', '1 100'],
    explanation:
      'ref is just another name for the same array, so it sees the change. clone() made an independent copy with its own storage, taken before the change, so copy[0] is still 1.',
    trap: 'Mixing up copying a reference with copying the data.',
  },

  // ───────────────────────── streams ─────────────────────────
  {
    id: 'stream-lazy',
    topicId: 'java8-stream-api',
    title: 'Streams are lazy',
    code: java`import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Stream.of(1, 2, 3).peek(x -> System.out.println("peek " + x)).map(x -> x * 2);
        System.out.println("end");
    }
}`,
    answer: 'end',
    wrong: ['peek 1\npeek 2\npeek 3\nend', 'end\npeek 1\npeek 2\npeek 3', 'peek 1\nend'],
    explanation:
      'Intermediate operations such as peek and map only describe the pipeline. Nothing runs until a terminal operation (collect, forEach, count and so on) is called, and there is none here.',
    trap: 'Expecting each step to execute as soon as it is written.',
  },
  {
    id: 'stream-short-circuit',
    topicId: 'java8-stream-api',
    title: 'Elements flow one at a time',
    code: java`import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Stream.of(1, 2, 3)
              .peek(x -> System.out.println("peek " + x))
              .filter(x -> x > 1)
              .findFirst();
    }
}`,
    answer: 'peek 1\npeek 2',
    wrong: ['peek 1\npeek 2\npeek 3', 'peek 2', 'peek 3'],
    explanation:
      'Each element travels through the whole pipeline before the next one starts. findFirst is short-circuiting: it stops as soon as 2 passes the filter, so 3 is never visited.',
    trap: 'Imagining each stage processes the whole collection before the next stage starts.',
  },
];

/** Challenges for one topic, in authoring order. */
export function challengesForTopic(topicId: string): PredictChallenge[] {
  return predictChallenges.filter((c) => c.topicId === topicId);
}
