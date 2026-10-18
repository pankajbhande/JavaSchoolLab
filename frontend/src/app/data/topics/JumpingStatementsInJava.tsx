import { Topic } from '../coreJava';
import jumpstatementImg from '../../../assets/jumpstatement.png';
import breakstatementImg from '../../../assets/breakstatement.png';
import continuestatementImg from '../../../assets/jcontinuestatement.jpg';
import returnstatementImg from '../../../assets/returnstatement.png';

export const jumpingStatementsInJava: Topic = {
                        id: 'Jumping Statement',
                        name: 'Jumping Statements in Java',
                        beginner: [
                            {
                                content: `
              In Java, jump statements are used to alter the normal flow of program execution when certain conditions are met. <br>
              They can be used to terminate a loop, skip an iteration, or exit from a method or block of code.<br><br>

              This particular statement works by jumping from one specific line of code to another, thus altering the flow of the execution of the program. "Jump Statements" are also called "Branching Statements in Java" as they evaluate different branches to enhance the flow of the execution.<br><br>

              There are 3 types of jumping statements in Java -<br>
              1) break<br>
              2) continue<br>
              3) return<br>
              <br>
              <img src="${jumpstatementImg}" alt="Types of Jumping Statements in Java" class="d-block mx-auto" />
              `,
                            },
                            {
                                content: `<h2>1) break Statement</h2>
              The <code>break</code> statement is used to terminate a loop early and jump straight to the statement right after the loop.
              <br><br>
              <img src="${breakstatementImg}" alt="break statement flow" class="d-block mx-auto" /><br>
              <div class="bg-secondary border border-primary p-3">
<pre>Syntax-
    loop-statement;
    break;</pre></div>`,
                                codeExamples: [
                                    `public class BreakDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {   // i = 1,2,3,4,5
            if (i == 3) {
                break;      // loop stops completely as soon as i == 3
            }
            System.out.println(i);
        }
        System.out.println("after break....");
    }
}
// OUTPUT:
// 1
// 2
// after break....`
                                ]
                            },
                            {
                                content: `<h2>2) continue Statement</h2>
              The <code>continue</code> statement skips the rest of the current iteration and jumps straight to the loop's next iteration — it does NOT stop the loop, unlike <code>break</code>.
              <br><br>
              <img src="${continuestatementImg}" alt="continue statement flow" class="d-block mx-auto" /><br>
              <div class="bg-secondary border border-primary p-3">
<pre>Syntax-
    loop-statement;
    continue;</pre></div>`,
                                codeExamples: [
                                    `public class ContinueDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 6; i++) {   // 1 to 6
            if (i == 3) {
                continue;   // only iteration 3 is skipped, loop keeps going
            }
            System.out.println(i);
        }
    }
}
// OUTPUT:
// 1
// 2
// 4
// 5
// 6`
                                ]
                            },
                            {
                                content: `<h2>3) return Statement</h2>
              The <code>return</code> statement is used to exit a method immediately and, optionally, send a value back to the caller. It transfers control back to the place where the method was invoked.
              <br><br>
              <img src="${returnstatementImg}" alt="return statement flow" class="d-block mx-auto" style="height: 350px;" />`,
                                codeExamples: [
                                    `public class Calculator {
    public int add(int a, int b) {
        int sum = a + b;
        return sum;      // exits add() and sends 'sum' back to the caller
    }

    public static void main(String[] args) {
        Calculator calc = new Calculator();
        int result = calc.add(10, 5);
        System.out.println("Sum: " + result);
    }
}
// OUTPUT:
// Sum: 15`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>break — In Loops vs In switch</h3>
<code>break</code> terminates the nearest enclosing loop or <code>switch</code> block and hands control to the statement right after it.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">for (...) {              switch (x) {
    if (cond) {              case 1:
        break;   ----+           break;   ----+
    }             |           case 2:      |
}                 |               ...       |
                  v           }             v
next statement <---------- next statement <--</pre>

In a loop, <code>break</code> exits the loop entirely (not just the current iteration). In a <code>switch</code>, it prevents fall-through into the next case.<br>`
                            },
                            {
                                content: `<h3>break and continue Work With ANY Loop Type</h3>
Both statements are not limited to simple <code>int</code>-indexed <code>for</code> loops — they work identically inside <code>while</code>, <code>do-while</code>, for-each loops, and loops indexed by other types such as <code>char</code>.<br>`,
                                codeExamples: [
                                    `public class BreakOnCharLoop {
    public static void main(String[] args) {
        for (char i = 'a'; i <= 'f'; i++) {   // a b c d e f
            if (i == 'c') {
                break;
            }
            System.out.println(i);
        }
    }
}
// OUTPUT:
// a
// b`,
                                    `public class ContinueOnCharLoop {
    public static void main(String[] args) {
        for (char i = 'a'; i <= 'f'; i++) {   // a b c d e f
            if (i == 'c') {
                continue;   // skip only 'c'
            }
            System.out.println(i);
        }
    }
}
// OUTPUT:
// a
// b
// d
// e
// f`
                                ]
                            },
                            {
                                content: `<h3>continue vs break — Side by Side</h3>
<code>continue</code> skips the rest of the current iteration and jumps to the loop's next condition check. <code>break</code> exits the loop completely.<br>`,
                                codeExamples: [
                                    `public class BreakVsContinue {
    public static void main(String[] args) {
        System.out.print("break:    ");
        for (int i = 1; i <= 5; i++) {
            if (i == 3) break;
            System.out.print(i + " ");
        }
        System.out.println();

        System.out.print("continue: ");
        for (int i = 1; i <= 5; i++) {
            if (i == 3) continue;
            System.out.print(i + " ");
        }
        System.out.println();
    }
}
// OUTPUT:
// break:    1 2
// continue: 1 2 4 5`
                                ]
                            },
                            {
                                content: `<h3>Labeled break and continue — Escaping Nested Loops</h3>
A plain <code>break</code>/<code>continue</code> only affects the innermost loop. A <strong>label</strong> lets you target an outer loop directly — Java's structured replacement for <code>goto</code> (the <code>goto</code> keyword is reserved but never usable in Java).<br>`,
                                codeExamples: [
                                    `public class LabeledSearch {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        int target = 5;

        // Without a label: inner break only stops the inner loop
        System.out.println("Without label:");
        outerNoLabel:
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] == target) {
                    System.out.println("Found at [" + r + "][" + c + "]");
                    break; // only exits the inner (column) loop
                }
                System.out.println("checked [" + r + "][" + c + "]");
            }
        }

        System.out.println("With labeled break:");
        search:
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] == target) {
                    System.out.println("Found at [" + r + "][" + c + "]");
                    break search; // exits BOTH loops immediately
                }
                System.out.println("checked [" + r + "][" + c + "]");
            }
        }
    }
}
// OUTPUT:
// Without label:
// checked [0][0]
// checked [0][1]
// checked [0][2]
// checked [1][0]
// Found at [1][1]
// checked [2][0]
// checked [2][1]
// checked [2][2]
// With labeled break:
// checked [0][0]
// checked [0][1]
// checked [0][2]
// checked [1][0]
// Found at [1][1]`,
                                    `public class LabeledContinueDemo {
    public static void main(String[] args) {
        outer:
        for (int r = 1; r <= 3; r++) {
            for (int c = 1; c <= 3; c++) {
                if (c == 2) {
                    continue outer; // ends inner loop, advances outer loop
                }
                System.out.println("r=" + r + " c=" + c);
            }
        }
    }
}
// OUTPUT:
// r=1 c=1
// r=2 c=1
// r=3 c=1`
                                ]
                            },
                            {
                                content: `<h3>return — Early Exit, Values, Guard Clauses, and the try-finally Trap</h3>
<code>return</code> immediately exits the current method, optionally sending a value back to the caller. It works inside loops too, ending the whole method (not just the loop). A very common real-world use is the "guard clause" pattern — return early instead of nesting deep if-else blocks.<br><br>

<strong>The surprising part:</strong> if a <code>finally</code> block also contains a <code>return</code>, it silently overrides the value returned from the <code>try</code> block — the <code>try</code>'s return is computed but then discarded.<br>`,
                                codeExamples: [
                                    `public class EligibilityGuardClause {
    static boolean isEligible(int age) {
        return age >= 18;   // early return, no nested if-else needed
    }

    public static void main(String[] args) {
        System.out.println("Eligible: " + isEligible(20));
        System.out.println("Eligible: " + isEligible(16));
    }
}
// OUTPUT:
// Eligible: true
// Eligible: false`,
                                    `public class ReturnInFinally {
    static int test() {
        try {
            return 1;
        } finally {
            return 2; // overrides the try's return value!
        }
    }

    public static void main(String[] args) {
        System.out.println(test());
    }
}
// OUTPUT:
// 2`,
                                    `public class FinallyAlwaysRuns {
    static int test() {
        try {
            return 10;
        } finally {
            System.out.println("finally executes even though try already returned");
        }
    }

    public static void main(String[] args) {
        System.out.println("Result: " + test());
    }
}
// OUTPUT:
// finally executes even though try already returned
// Result: 10`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions / Common Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question / Scenario</th><th>Answer</th></tr>
<tr class='text-center'><td>Code placed right after return/break in the same block</td><td>Compile error: unreachable code — the compiler proves that line can never execute</td></tr>
<tr class='text-center'><td>Loop exited via a boolean flag vs break</td><td>Both work, but break is direct and immediate; a flag still needs the loop's own condition check to fire, so it exits one iteration later</td></tr>
<tr class='text-center'><td>Can I use goto to jump around in Java?</td><td>No. goto is a reserved keyword but has no implementation. Labeled break/continue is Java's structured replacement</td></tr>
<tr class='text-center'><td>Does return inside finally override return in try?</td><td>Yes — finally always runs last, and if it also returns, that value wins and the try's return is discarded</td></tr>
<tr class='text-center'><td>Does continue stop the loop?</td><td>No — it only skips the remaining code in the current iteration; the loop keeps running</td></tr>
<tr class='text-center'><td>Can break exit an outer loop directly from an inner loop?</td><td>Only with a label (e.g. break outerLabel;) — an unlabeled break only exits the innermost loop or switch</td></tr>
</table>
<br>

<h3>Quick Summary — break vs continue vs return vs labeled versions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Statement</th><th>Effect</th><th>Valid inside</th></tr>
<tr class='text-center'><td>break</td><td>Exits nearest loop or switch entirely</td><td>loop, switch</td></tr>
<tr class='text-center'><td>continue</td><td>Skips to next iteration of nearest loop</td><td>loop</td></tr>
<tr class='text-center'><td>return</td><td>Exits the current method, optionally with a value</td><td>any method body</td></tr>
<tr class='text-center'><td>labeled break</td><td>Exits the labeled (often outer) loop</td><td>nested loops with a label</td></tr>
<tr class='text-center'><td>labeled continue</td><td>Skips to next iteration of the labeled (outer) loop</td><td>nested loops with a label</td></tr>
</table>`
                            }
                        ]
};
