import { Topic } from '../coreJava';
import loop1 from '../../../assets/loop 1.png';
import loop2 from '../../../assets/loop 2.png';
import loop3 from '../../../assets/loop 3.png';

export const loopingStatements: Topic = {
                        id: 'Looping Statements',
                        name: 'Looping Statements',
                        beginner: [
                            {
                                content: `
      Loops are used to execute a set of instructions repeatedly when some conditions become true.<br><br>
      In Java, looping statements help us avoid writing the same code multiple times and improve code efficiency.<br><br>
      There are 4 commonly used loops in Java:<br>
      1) For Loop<br>
      2) While Loop<br>
      3) Do While Loop<br>
      4) Enhanced For-Each Loop<br><br>
      Below is one small, runnable code + output for each loop type: <br>
      `
                            },
                            {
                                content: `
      <h4>1) For Loop</h4>
      The for loop is used to iterate and evaluate a block of code multiple times.<br><br>

                     <img src="${loop1}" alt="For loop flow diagram" class="d-block mx-auto"/>

      <b>When to use:</b> If the number of iterations is fixed, it is recommended to use a for loop.<br><br>

      <div class="bg-secondary border border-primary p-3">
        Syntax:<br>
        for (initialization; condition; increment/decrement) {<br>
        &nbsp;&nbsp;Statements;<br>
        }
      </div>
      `,
                                codeExamples: [
                                    `public class ForLoopDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("value of i>>" + i);
        }
    }
}
// OUTPUT:
// value of i>>1
// value of i>>2
// value of i>>3
// value of i>>4
// value of i>>5`
                                ]
                            },
                            {
                                content: `
      <h4>2) While Loop</h4>
      The while loop evaluates a condition BEFORE executing the loop body.<br>
      If the condition is true, the loop continues; otherwise, it stops.<br><br>

                      <img src="${loop2}" alt="While loop flow diagram" class="d-block mx-auto"/>

      <b>When to use:</b> If the number of iterations is not fixed, it is recommended to use a while loop.<br><br>

      <div class="bg-secondary border border-primary p-3">
        Syntax:<br>
        Initialization;<br>
        while (condition) {<br>
        &nbsp;&nbsp;Statements;<br>
        &nbsp;&nbsp;Increment / Decrement;<br>
        }
      </div>
      `,
                                codeExamples: [
                                    `public class WhileLoopDemo {
    public static void main(String[] args) {
        int i = 1;
        while (i <= 5) {
            System.out.println("value of i>>" + i);
            i++;
        }
    }
}
// OUTPUT:
// value of i>>1
// value of i>>2
// value of i>>3
// value of i>>4
// value of i>>5`
                                ]
                            },
                            {
                                content: `
      <h4>3) Do While Loop</h4>
      The do-while loop is similar to the while loop, but the condition is checked AFTER executing the loop body.<br>
      This guarantees that the loop body runs at least once, even if the condition is false right from the start.<br><br>

                     <img src="${loop3}" alt="Do while loop flow diagram" class="d-block mx-auto"/>

      <b>When to use:</b> If the number of iterations is not fixed and the loop must execute at least once (e.g. menu prompts).<br><br>

      <div class="bg-secondary border border-primary p-3">
        Syntax:<br>
        Initialization;<br>
        do {<br>
        &nbsp;&nbsp;Statements;<br>
        &nbsp;&nbsp;Increment / Decrement;<br>
        } while (condition);
      </div>
      `,
                                codeExamples: [
                                    `public class DoWhileLoopDemo {
    public static void main(String[] args) {
        int i = 1;
        do {
            System.out.println("value of i>>" + i);
            i++;
        } while (i <= 5);
    }
}
// OUTPUT:
// value of i>>1
// value of i>>2
// value of i>>3
// value of i>>4
// value of i>>5`
                                ]
                            },
                            {
                                content: `
      <h4>Proof: do-while runs its body even when the condition is false from the start</h4>
      This is the single most important difference between while and do-while - it is a very common interview question.<br>
      `,
                                codeExamples: [
                                    `public class DoWhileVsWhile {
    public static void main(String[] args) {
        int a = 5;
        while (a < 5) {          // condition checked FIRST -> body never runs
            System.out.println("while body: " + a);
        }
        System.out.println("while loop finished, a = " + a);

        int b = 5;
        do {                       // body runs ONCE before condition is even checked
            System.out.println("do-while body: " + b);
        } while (b < 5);
        System.out.println("do-while loop finished, b = " + b);
    }
}
// OUTPUT:
// while loop finished, a = 5
// do-while body: 5
// do-while loop finished, b = 5`
                                ]
                            },
                            {
                                content: `
      <h4>4) Enhanced For-Each Loop</h4>
      The for-each loop is a simplified way to iterate over arrays and collections, without needing an index variable or the loop's condition/increment.<br><br>

      <div class="bg-secondary border border-primary p-3">
        Syntax:<br>
        for (Type element : arrayOrCollection) {<br>
        &nbsp;&nbsp;Statements;<br>
        }
      </div>
      `,
                                codeExamples: [
                                    `public class ForEachDemo {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};

        for (int n : numbers) {
            System.out.println("value>>" + n);
        }
    }
}
// OUTPUT:
// value>>10
// value>>20
// value>>30
// value>>40
// value>>50`
                                ]
                            },
                            {
                                content: `
      <h4>All In One Program (For, While, Do While, For-Each)</h4>
      `,
                                codeExamples: [
                                    `public class AllLoopsDemo {
    public static void main(String[] args) {

        // For Loop
        for (int x = 1; x <= 3; x++) {
            System.out.println("By Using For Loop:>>" + x);
        }

        // While Loop
        int i = 1;
        while (i <= 3) {
            System.out.println("By Using While Loop:>> " + i);
            i++;
        }

        // Do While Loop
        int p = 1;
        do {
            System.out.println("By Using Do While Loop:>> " + p);
            p++;
        } while (p <= 3);

        // For-Each Loop
        int[] values = {1, 2, 3};
        for (int v : values) {
            System.out.println("By Using For-Each Loop:>> " + v);
        }
    }
}
// OUTPUT:
// By Using For Loop:>>1
// By Using For Loop:>>2
// By Using For Loop:>>3
// By Using While Loop:>> 1
// By Using While Loop:>> 2
// By Using While Loop:>> 3
// By Using Do While Loop:>> 1
// By Using Do While Loop:>> 2
// By Using Do While Loop:>> 3
// By Using For-Each Loop:>> 1
// By Using For-Each Loop:>> 2
// By Using For-Each Loop:>> 3`
                                ]
                            },
                            {
                                content: `<h3>1. Definition</h3>
• A <b>loop</b> is a statement that repeats a block of code while a condition stays true. The repeated block is called the loop body and one full run of it is called an iteration. <br>
• Java has four looping forms. <b>for</b> when you know the count, <b>while</b> when you only know the condition, <b>do while</b> when the body must run at least once, and the <b>enhanced for</b>, also called for each, to walk through an array or a collection. <br>
• Every loop has three parts, <b>initialisation</b>, <b>condition</b> and <b>update</b>. In a for loop all three sit on one line, in a while loop they are spread out. <br>
• <b>break</b> leaves the loop completely and <b>continue</b> skips to the next iteration. <br><br>

<h3>2. Purpose of This Topic</h3>
• To process <b>many items with one piece of code</b>, such as printing the marks of sixty students. <br>
• To keep asking until the input is valid, which is what a do while loop is made for. <br>
• To build <b>totals, counts and averages</b> over a list of records. <br>
• To search for something and stop as soon as it is found, using break. <br><br>

<h3>3. Need of This Topic</h3>
• Without loops you would copy paste the same line sixty times, which is impossible to maintain. <br>
• Every report, every bill and every search screen in a real application is built on a loop. <br>
• An infinite loop is one of the easiest bugs to write and one of the most damaging in production. <br>
• Interview rounds always contain at least one pattern printing or number series question. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: the four loop forms in one attendance program

public class LoopBasicsDemo {

    public static void main(String[] args) {

        // POINT 1: for loop, the count is known
        System.out.println("Roll numbers of a class:");
        for (int roll = 1; roll <= 5; roll++) {
            System.out.print(roll + " ");
        }
        System.out.println();

        // POINT 1: while loop, the condition drives it
        long balancePaise = 1000000L;         // Rs 10000
        int month = 0;
        while (balancePaise >= 250000L) {     // Rs 2500 SIP every month
            balancePaise -= 250000L;
            month++;
        }
        System.out.println("SIP ran for " + month + " months, left Rs "
                + (balancePaise / 100));

        // POINT 1: do while, the body runs at least once
        int attempt = 0;
        String[] pinsTried = {"1111", "2222", "4321"};
        boolean unlocked;
        do {
            unlocked = pinsTried[attempt].equals("4321");
            attempt++;
        } while (!unlocked && attempt < pinsTried.length);
        System.out.println("Unlocked: " + unlocked + " after " + attempt + " attempts");

        // POINT 1: enhanced for, walk through an array
        String[] subjects = {"Java", "DBMS", "Networks", "Maths"};
        System.out.print("Subjects: ");
        for (String s : subjects) {
            System.out.print(s + ", ");
        }
        System.out.println();

        // POINT 2: build a total and an average
        int[] marks = {78, 91, 65, 84, 59};
        int total = 0;
        for (int m : marks) {
            total += m;
        }
        double average = (double) total / marks.length;
        System.out.println("Total " + total + ", average " + average);

        // POINT 2: break stops as soon as the answer is found
        int[] accountNumbers = {1001, 1002, 1003, 1004};
        int searchFor = 1003;
        int foundAt = -1;
        for (int i = 0; i < accountNumbers.length; i++) {
            if (accountNumbers[i] == searchFor) {
                foundAt = i;
                break;                          // no need to check the rest
            }
        }
        System.out.println("Account " + searchFor + " found at index " + foundAt);

        // POINT 2: continue skips the unwanted ones
        System.out.print("Only present students: ");
        boolean[] present = {true, false, true, true, false};
        for (int i = 0; i < present.length; i++) {
            if (!present[i]) {
                continue;                       // skip the absent ones
            }
            System.out.print("Roll" + (i + 1) + " ");
        }
        System.out.println();

        // POINT 3: WRONG, this never ends because i is never updated
        // for (int i = 0; i < 5; ) { System.out.println(i); }

        // POINT 3: RIGHT, always change the loop variable
        for (int i = 0; i < 3; i++) {
            System.out.println("Safe iteration " + i);
        }
    }
}
// OUTPUT:
// Roll numbers of a class:
// 1 2 3 4 5
// SIP ran for 4 months, left Rs 0
// Unlocked: true after 3 attempts
// Subjects: Java, DBMS, Networks, Maths,
// Total 377, average 75.4
// Account 1003 found at index 2
// Only present students: Roll1 Roll3 Roll4
// Safe iteration 0
// Safe iteration 1
// Safe iteration 2`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Less code, less bugs.</b> One loop replaces hundreds of repeated lines. <br>
• <b>Works with any size.</b> The same loop handles ten students or ten thousand without a change. <br>
• <b>Enhanced for is safe.</b> It removes the index completely, so you cannot go out of bounds. <br>
• <b>break saves time</b> by stopping a search the moment the item is found. <br>
• <b>Easy to change.</b> Adjust one condition and the whole behaviour changes. <br><br>

<h3>5. Disadvantages</h3>
• <b>Infinite loops.</b> Forgetting the update line freezes the program and can crash a server. <br>
• <b>Off by one errors.</b> Using less than or equal to with length gives ArrayIndexOutOfBoundsException. <br>
• <b>Enhanced for gives no index</b> and does not let you replace elements in an array through the variable. <br>
• <b>Modifying a collection while looping</b> over it throws ConcurrentModificationException. <br>
• <b>Nested loops multiply the work.</b> Two loops of one thousand each means one million steps. <br>
• <b>Heavy work inside the loop,</b> such as a database call or string concatenation, kills performance. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5: off by one, concurrent change, nested loop cost

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class LoopPitfallDemo {

    public static void main(String[] args) {

        int[] prices = {120, 250, 99, 480};

        // DISADVANTAGE 5: WRONG, less than or equal to goes one step too far
        try {
            for (int i = 0; i <= prices.length; i++) {
                System.out.print(prices[i] + " ");
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("\\nWRONG loop threw ArrayIndexOutOfBoundsException");
        }

        // RIGHT: use less than
        System.out.print("RIGHT loop: ");
        for (int i = 0; i < prices.length; i++) {
            System.out.print(prices[i] + " ");
        }
        System.out.println();

        // DISADVANTAGE 5: enhanced for cannot change the array
        for (int p : prices) {
            p = p * 2;                 // WRONG, changes only the copy
        }
        System.out.print("After enhanced for: ");
        for (int p : prices) System.out.print(p + " ");
        System.out.println();

        // RIGHT: use an index when you must write back
        for (int i = 0; i < prices.length; i++) {
            prices[i] = prices[i] * 2;
        }
        System.out.print("After index loop  : ");
        for (int p : prices) System.out.print(p + " ");
        System.out.println();

        // DISADVANTAGE 5: removing while looping
        List<String> cities = new ArrayList<>(List.of("Pune", "Delhi", "Surat", "Kochi"));
        List<String> copy = new ArrayList<>(cities);
        try {
            for (String c : copy) {
                if (c.startsWith("P")) {
                    copy.remove(c);            // WRONG
                }
            }
        } catch (Exception e) {
            System.out.println("WRONG removal threw " + e.getClass().getSimpleName());
        }

        // RIGHT: use an Iterator, or removeIf
        Iterator<String> it = cities.iterator();
        while (it.hasNext()) {
            if (it.next().startsWith("S")) {
                it.remove();
            }
        }
        System.out.println("RIGHT removal result: " + cities);

        // DISADVANTAGE 5: nested loops multiply the work
        int steps = 0;
        for (int i = 0; i < 1000; i++) {
            for (int j = 0; j < 1000; j++) {
                steps++;
            }
        }
        System.out.println("Nested loop steps: " + steps);
    }
}
// OUTPUT:
// 120 250 99 480
// WRONG loop threw ArrayIndexOutOfBoundsException
// RIGHT loop: 120 250 99 480
// After enhanced for: 120 250 99 480
// After index loop  : 240 500 198 960
// WRONG removal threw ConcurrentModificationException
// RIGHT removal result: [Pune, Delhi, Kochi]
// Nested loop steps: 1000000`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>College result sheet:</b> one loop over sixty students, an inner loop over six subjects to compute totals. <br>
• <b>Bank passbook printing:</b> a while loop reading transactions until the end of the statement period. <br>
• <b>ATM PIN entry:</b> a do while loop that asks at least once and blocks the card after three wrong tries. <br>
• <b>Swiggy cart total:</b> an enhanced for over the cart items adding price into a running total. <br>
• <b>Railway seat chart:</b> nested loops over coaches and berths to print the layout. <br>
• <b>Global example, a web crawler:</b> a while loop that keeps pulling pages from a queue until the queue is empty. <br><br>

<b>Student tip:</b> pick for when you can count, while when you cannot, do while when the body must run once, and enhanced for whenever you just want each element and no index.`,
                                codeExamples: [
                                    `// Point 6: a result sheet and an ATM PIN retry counter

public class LoopRealTimeDemo {

    public static void main(String[] args) {

        // Real time: college result sheet with nested loops
        String[] students = {"Anjali", "Rohit", "Fatima"};
        int[][] marks = {
            {78, 84, 66, 91},
            {55, 61, 48, 72},
            {90, 88, 95, 84}
        };
        String[] subjects = {"Java", "DBMS", "OS", "Maths"};

        System.out.println("RESULT SHEET");
        for (int s = 0; s < students.length; s++) {
            int total = 0;
            for (int sub = 0; sub < subjects.length; sub++) {
                total += marks[s][sub];
            }
            double percent = (double) total / subjects.length;
            String result = (percent >= 40) ? "PASS" : "FAIL";
            System.out.printf("%-8s total %3d  percent %.2f  %s%n",
                    students[s], total, percent, result);
        }

        // Real time: ATM PIN with three attempts, do while runs at least once
        String correctPin = "8071";
        String[] entered = {"1234", "8070", "8071"};
        int attempts = 0;
        boolean success = false;
        do {
            success = correctPin.equals(entered[attempts]);
            attempts++;
            if (!success) {
                System.out.println("Wrong PIN, attempts left " + (3 - attempts));
            }
        } while (!success && attempts < 3);

        System.out.println(success ? "PIN accepted" : "Card blocked");

        // Real time: Swiggy cart total with an enhanced for
        int[] itemPricePaise = {24900, 15000, 8000, 32500};
        long cartTotal = 0;
        for (int p : itemPricePaise) {
            cartTotal += p;
        }
        long deliveryFee = (cartTotal >= 30000) ? 0 : 4000;
        System.out.println("Cart Rs " + (cartTotal / 100)
                + " delivery Rs " + (deliveryFee / 100)
                + " payable Rs " + ((cartTotal + deliveryFee) / 100));

        // Real time: railway seat chart with labelled break
        outer:
        for (int coach = 1; coach <= 3; coach++) {
            for (int berth = 1; berth <= 4; berth++) {
                if (coach == 2 && berth == 3) {
                    System.out.println("First free berth found: S" + coach + " berth " + berth);
                    break outer;          // leaves both loops at once
                }
            }
        }
    }
}
// OUTPUT:
// RESULT SHEET
// Anjali   total 319  percent 79.75  PASS
// Rohit    total 236  percent 59.00  PASS
// Fatima   total 357  percent 89.25  PASS
// Wrong PIN, attempts left 2
// Wrong PIN, attempts left 1
// PIN accepted
// Cart Rs 804 delivery Rs 0 payable Rs 804
// First free berth found: S2 berth 3`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>for vs while vs do-while</h3>
All three loops repeat a block of code, but they differ in when the condition is checked and the minimum number of executions guaranteed.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Loop</th><th>Condition checked</th><th>Minimum executions</th><th>Typical use case</th></tr>
<tr class='text-center'><td>for</td><td>Before each iteration</td><td>0</td><td>Fixed/known number of iterations</td></tr>
<tr class='text-center'><td>while</td><td>Before each iteration</td><td>0</td><td>Unknown iteration count, condition-driven</td></tr>
<tr class='text-center'><td>do-while</td><td>After each iteration</td><td>1</td><td>Must run at least once (e.g. menu prompts)</td></tr>
</table>
<br>

<h4>do-while's "execute-then-check" flow</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   +-------------------+
   |  Execute body     | <---+
   +-------------------+     |
            |                |
            v                |
     +-------------+         |
     | Check        |  true  |
     | condition?   |--------+
     +-------------+
            | false
            v
          Exit loop</pre>`
                            },
                            {
                                content: `<h3>for Loop Internals - Order of Evaluation</h3>
The for loop's three clauses run in a very specific order. Misunderstanding this order is a classic source of off-by-one bugs.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">for (init; condition; update) { body }

Step 1: init         -> runs ONCE, before anything else
Step 2: condition     -> checked BEFORE every iteration
        |
        +-- false --> exit loop immediately
        |
        true
        v
Step 3: body          -> runs
Step 4: update        -> runs AFTER the body
        |
        +-- go back to Step 2 (condition)</pre>

<code>init</code> executes exactly once. <code>condition</code> is evaluated before every single pass, including the first. <code>update</code> runs only after a completed body execution, never before the very first check.<br>`,
                                codeExamples: [
                                    `public class ForLoopOrder {
    public static void main(String[] args) {
        for (int i = printAndReturn("init", 0); i < 3;
                i = printAndReturn("update", i + 1)) {
            System.out.println("body, i = " + i);
        }
    }

    static int printAndReturn(String stage, int value) {
        System.out.println(stage + " -> " + value);
        return value;
    }
}
// OUTPUT:
// init -> 0
// body, i = 0
// update -> 1
// body, i = 1
// update -> 2
// body, i = 2
// update -> 3`
                                ]
                            },
                            {
                                content: `<h3>Nested Loops - Pattern Printing</h3>
A nested loop is a loop inside another loop. For every single iteration of the outer loop, the ENTIRE inner loop runs to completion. This is the classic mechanism behind pattern printing.<br>`,
                                codeExamples: [
                                    `public class StarTriangle {
    public static void main(String[] args) {
        int rows = 5;
        for (int i = 1; i <= rows; i++) {          // outer loop -> controls the row
            for (int j = 1; j <= i; j++) {          // inner loop -> controls stars in that row
                System.out.print("*");
            }
            System.out.println();                   // move to next line after each row
        }
    }
}
// OUTPUT:
// *
// **
// ***
// ****
// *****`
                                ]
                            },
                            {
                                content: `<h3>Nested Loops with Labeled break/continue</h3>
A plain <code>break</code> only exits the innermost loop. To exit an outer loop early from inside a nested loop, label the outer loop.<br>`,
                                codeExamples: [
                                    `public class LabeledSearch {
    public static void main(String[] args) {
        int[][] grid = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        int target = 5;
        boolean found = false;

        outer:
        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[row].length; col++) {
                if (grid[row][col] == target) {
                    System.out.println("Found " + target
                            + " at [" + row + "][" + col + "]");
                    found = true;
                    break outer;          // exits BOTH loops immediately
                }
            }
        }
        System.out.println("Search finished. Found = " + found);
    }
}
// OUTPUT:
// Found 5 at [1][1]
// Search finished. Found = true`
                                ]
                            },
                            {
                                content: `<h3>Enhanced for-each - Iterator Under the Hood</h3>
<code>for (Type x : collection)</code> is syntactic sugar. The compiler rewrites it to use the collection's <code>Iterator</code> internally.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">for (String s : list) { ... }

   compiles roughly to

Iterator&lt;String&gt; it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    ...
}</pre>

Because it's really an <code>Iterator</code> underneath, modifying the list directly (e.g. <code>list.remove(...)</code>) while a for-each loop is iterating it throws <strong>ConcurrentModificationException</strong>. The safe fix is to remove through the iterator itself.<br>`,
                                codeExamples: [
                                    `import java.util.ArrayList;
import java.util.List;

public class ForEachRemoveBug {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Pankaj", "Raghunath", "Anu"));
        try {
            for (String name : names) {
                // Must not be the second-to-last element ("Raghunath" here): removing that
                // leaves cursor == size, so hasNext() is false and NO exception is thrown.
                if (name.equals("Pankaj")) {
                    names.remove(name);     // structural modification during for-each
                }
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        }
    }
}
// OUTPUT:
// Caught: ConcurrentModificationException`,
                                    `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class SafeIteratorRemove {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Pankaj", "Raghunath", "Anu"));
        Iterator<String> it = names.iterator();
        while (it.hasNext()) {
            String name = it.next();
            if (name.equals("Raghunath")) {
                it.remove();               // safe: removes through the iterator itself
            }
        }
        System.out.println(names);
    }
}
// OUTPUT:
// [Pankaj, Anu]`
                                ]
                            },
                            {
                                content: `<h3>Infinite Loops & Loop-Invariant Code Motion</h3>
<code>for(;;)</code> and <code>while(true)</code> both create intentional infinite loops that rely on an internal <code>break</code> (or <code>return</code>) to exit safely. All three clauses of <code>for(;;)</code> are optional - an empty condition is treated as always true.<br><br>

<strong>Performance note:</strong> if a loop bound is expensive to recompute (like <code>list.size()</code> on certain collections, or any method call), compute it once before the loop instead of on every iteration - this is called loop-invariant code motion. Modern JIT compilers often do this automatically for simple cases, but writing it explicitly keeps intent clear and helps in cases the JIT can't safely optimize.<br>`,
                                codeExamples: [
                                    `import java.util.List;

public class InfiniteLoopAndInvariant {
    public static void main(String[] args) {
        int counter = 0;
        for (;;) {                        // intentional infinite loop
            counter++;
            if (counter == 3) {
                break;                     // safe, controlled exit
            }
        }
        System.out.println("Exited after counter = " + counter);

        List<Integer> nums = List.of(10, 20, 30, 40);

        // Less ideal: nums.size() re-evaluated every iteration
        for (int i = 0; i < nums.size(); i++) { /* ... */ }

        // Better: bound computed once, hoisted out of the loop
        int size = nums.size();
        for (int i = 0; i < size; i++) { /* ... */ }

        System.out.println("List size (computed once): " + size);
    }
}
// OUTPUT:
// Exited after counter = 3
// List size (computed once): 4`
                                ]
                            },
                            {
                                content: `<h3>Off-By-One and Other Loop Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Trap</th><th>What goes wrong</th></tr>
<tr class='text-center'><td>Off-by-one errors</td><td>Using &lt;= instead of &lt; incorrectly, e.g. looping i &lt;= array.length causes ArrayIndexOutOfBoundsException</td></tr>
<tr class='text-center'><td>Modifying the loop variable in the body</td><td>Changing i inside a for loop's body makes iteration count unpredictable</td></tr>
<tr class='text-center'><td>Bad increment direction</td><td>while (i &lt; 10) { i--; } never terminates - i moves away from the exit condition</td></tr>
<tr class='text-center'><td>while vs do-while first check</td><td>If the condition is false initially, while never runs its body; do-while always runs it at least once</td></tr>
</table>
<br>`,
                                codeExamples: [
                                    `public class OffByOneDemo {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30};
        try {
            for (int i = 0; i <= arr.length; i++) {   // BUG: should be i < arr.length
                System.out.println(arr[i]);
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        }
    }
}
// OUTPUT:
// 10
// 20
// 30
// Caught: ArrayIndexOutOfBoundsException`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Difference between while and do-while?</td><td>while checks the condition before the body (0+ runs); do-while checks it after the body (1+ runs guaranteed)</td></tr>
<tr class='text-center'><td>Can a for loop's clauses be omitted?</td><td>Yes - all three (init, condition, update) are optional; for(;;) is an intentional infinite loop</td></tr>
<tr class='text-center'><td>How does for-each work internally?</td><td>It is compiled to use the collection's Iterator (hasNext()/next()) behind the scenes; for arrays it uses a plain index-based loop</td></tr>
<tr class='text-center'><td>Why does removing from a List during for-each throw an exception?</td><td>Structural modification while an Iterator is active throws ConcurrentModificationException; use Iterator.remove() instead</td></tr>
<tr class='text-center'><td>How do you break out of a nested loop entirely?</td><td>Use a labeled break (e.g. break outer;) on the outer loop's label</td></tr>
<tr class='text-center'><td>What is loop-invariant code motion?</td><td>Moving computations that don't change across iterations (like a collection's size) outside the loop, so they run once instead of every pass</td></tr>
<tr class='text-center'><td>When would you prefer for over while?</td><td>When the number of iterations is known/fixed up front; while is preferred when iteration depends purely on a runtime condition</td></tr>
</table>
<br>
<strong>Golden rule:</strong> pick for when the iteration count is known up front, while when it depends on a condition evaluated before each pass, and do-while only when the body must run at least once regardless of the condition.<br>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• A loop compiles to a <b>backward goto with a conditional test</b>. HotSpot detects the back edge, counts iterations and triggers <b>on stack replacement</b> so a long running loop is compiled to machine code while it is still executing. <br>
• The <b>enhanced for over an array</b> compiles to a plain index loop, while over an Iterable it compiles to an Iterator with hasNext and next. The two have different costs and different failure modes. <br>
• <b>Iterators are fail fast.</b> ArrayList keeps a modCount and any structural change outside the iterator makes the next call throw ConcurrentModificationException. This is a bug detector, not a guarantee. <br>
• The JIT performs <b>loop unrolling, range check elimination and vectorisation</b> when the loop bound is a simple invariant and the array access pattern is provable. <br>
• A <b>labelled break</b> is the only clean way out of nested loops and it compiles to a single jump, so it is not slow. <br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• To write loops the JIT can optimise, by <b>hoisting invariants</b> and keeping the bound in a local variable. <br>
• To choose between an <b>index loop, an iterator and a stream</b> based on measured cost, not on style preference. <br>
• To iterate safely under concurrency using <b>CopyOnWriteArrayList or ConcurrentHashMap</b> instead of hoping for the best. <br>
• To control <b>algorithmic complexity</b>, since a nested loop turns an O of n problem into O of n squared. <br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• Most production slowness traced in a profiler ends up inside one badly written loop. <br>
• A nested loop join over two lists of ten thousand rows is one hundred million comparisons, and a HashMap turns it into ten thousand. <br>
• Interviewers ask why an enhanced for cannot remove elements and what modCount does. <br>
• Batch jobs that concatenate Strings or hit the database inside a loop are the classic N plus 1 problem. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level: fail fast, hoisting, safe concurrency

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class AdvancedLoopDemo {

    public static void main(String[] args) {

        // POINT 1: fail fast is a detector, and it can miss
        List<String> accounts = new ArrayList<>(List.of("A1", "A2", "A3", "A4"));
        try {
            for (String a : accounts) {
                if (a.equals("A2")) accounts.remove(a);
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("Fail fast caught the structural change");
        }

        // RIGHT: removeIf does it in one pass with no iterator exposed
        List<String> clean = new ArrayList<>(List.of("A1", "A2", "A3", "A4"));
        clean.removeIf(a -> a.equals("A2"));
        System.out.println("removeIf result: " + clean);

        // POINT 2: hoist the invariant out of the condition
        int[] data = new int[2000000];
        for (int i = 0; i < data.length; i++) data[i] = i % 97;

        long start = System.nanoTime();
        long sumA = 0;
        for (int i = 0; i < data.length; i++) {     // length is already a field read
            sumA += data[i];
        }
        long msA = (System.nanoTime() - start) / 1000000;

        start = System.nanoTime();
        long sumB = 0;
        final int n = data.length;                   // explicit local bound
        for (int i = 0; i < n; i++) {
            sumB += data[i];
        }
        long msB = (System.nanoTime() - start) / 1000000;

        System.out.println("Field bound sum " + sumA + " in about " + msA + " ms");
        System.out.println("Local bound sum " + sumB + " in about " + msB + " ms");

        // POINT 2: WRONG under threads, a plain ArrayList iteration can break
        // RIGHT for read heavy shared lists
        List<String> listeners =
                new CopyOnWriteArrayList<>(List.of("audit", "sms", "email"));
        for (String l : listeners) {
            if (l.equals("sms")) {
                listeners.add("push");     // safe, the iterator sees the old snapshot
            }
        }
        System.out.println("CopyOnWrite listeners: " + listeners);

        // POINT 3: labelled break out of nested loops
        int[][] grid = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        int target = 5;
        int foundRow = -1, foundCol = -1;
        search:
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[r].length; c++) {
                if (grid[r][c] == target) {
                    foundRow = r; foundCol = c;
                    break search;
                }
            }
        }
        System.out.println("Found " + target + " at " + foundRow + "," + foundCol);
    }
}
// OUTPUT (timings vary):
// Fail fast caught the structural change
// removeIf result: [A1, A3, A4]
// Field bound sum 95998839 in about 4 ms
// Local bound sum 95998839 in about 4 ms
// CopyOnWrite listeners: [audit, sms, email, push]
// Found 5 at 1,1`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>On stack replacement</b> means a hot loop gets JIT compiled mid flight, so even a single long loop reaches native speed. <br>
• <b>Range check elimination</b> removes the bounds check when the JIT can prove the index stays inside the array, which makes an index loop as fast as C. <br>
• <b>Sequential access is cache friendly.</b> Walking an int array in order gets a hardware prefetch for free. <br>
• <b>Streams parallelise for free</b> with parallelStream when the work per element is genuinely heavy and the source splits well. <br>
• <b>removeIf and Map.merge</b> replace whole hand written loops with one intent revealing call. <br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>Nested loops hide quadratic cost</b> that only appears when data grows in production. <br>
• <b>Megamorphic call sites inside a loop</b> stop inlining, so a loop calling three different implementations runs far slower than one calling a single implementation. <br>
• <b>Boxing inside a loop</b> allocates per iteration and can dominate GC time. <br>
• <b>Streams are slower than a plain loop for small collections</b> because of lambda and pipeline setup cost. <br>
• <b>parallelStream shares the common ForkJoinPool,</b> so one blocking task in it starves every other parallel stream in the JVM. <br>
• <b>Iterating a LinkedList by index</b> is O of n squared because get walks the chain every time. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: nested join vs hash join, LinkedList trap

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class LoopComplexityDemo {

    record Customer(int id, String name) { }
    record Order(int customerId, long amountPaise) { }

    public static void main(String[] args) {

        int size = 5000;
        List<Customer> customers = new ArrayList<>();
        List<Order> orders = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            customers.add(new Customer(i, "Cust" + i));
            orders.add(new Order(i, (i + 1) * 1000L));
        }

        // WRONG: nested loop join, O of n squared, about 12.5 million comparisons here
        long start = System.nanoTime();
        long matchedNested = 0;
        for (Order o : orders) {
            for (Customer c : customers) {
                if (c.id() == o.customerId()) {
                    matchedNested++;
                    break;
                }
            }
        }
        long nestedMs = (System.nanoTime() - start) / 1000000;

        // RIGHT: build an index once, then one pass, O of n
        start = System.nanoTime();
        Map<Integer, Customer> index = new HashMap<>();
        for (Customer c : customers) {
            index.put(c.id(), c);
        }
        long matchedHash = 0;
        for (Order o : orders) {
            if (index.containsKey(o.customerId())) {
                matchedHash++;
            }
        }
        long hashMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Nested join matched " + matchedNested
                + " in about " + nestedMs + " ms");
        System.out.println("Hash join   matched " + matchedHash
                + " in about " + hashMs + " ms");

        // DISADVANTAGE 5: indexed access on a LinkedList is quadratic
        LinkedList<Integer> linked = new LinkedList<>();
        for (int i = 0; i < 40000; i++) linked.add(i);

        start = System.nanoTime();
        long sumWrong = 0;
        for (int i = 0; i < linked.size(); i++) {
            sumWrong += linked.get(i);          // WRONG, get walks the chain
        }
        long wrongMs = (System.nanoTime() - start) / 1000000;

        start = System.nanoTime();
        long sumRight = 0;
        for (int v : linked) {                   // RIGHT, one iterator pass
            sumRight += v;
        }
        long rightMs = (System.nanoTime() - start) / 1000000;

        System.out.println("LinkedList get loop      " + sumWrong
                + " in about " + wrongMs + " ms");
        System.out.println("LinkedList iterator loop " + sumRight
                + " in about " + rightMs + " ms");
    }
}
// OUTPUT (timings vary):
// Nested join matched 5000 in about 40 ms
// Hash join   matched 5000 in about 3 ms
// LinkedList get loop      799980000 in about 900 ms
// LinkedList iterator loop 799980000 in about 2 ms`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>End of day settlement in a bank:</b> a nested loop over accounts and transactions was replaced with a HashMap index, cutting a four hour batch to eleven minutes. <br>
• <b>N plus 1 in Hibernate:</b> a loop calling a repository per row issued ten thousand queries. A single join fetch fixed it. <br>
• <b>Kafka consumer poll loop:</b> a while true that polls, processes and commits, with a volatile flag for a clean shutdown. <br>
• <b>Telecom rating engine:</b> a primitive long array walked sequentially rather than a List of Long, which removed most GC pressure. <br>
• <b>Global example, log parsing:</b> a stream over Files.lines with a filter, which keeps memory flat over a ten gigabyte file. <br>
• <b>Retry with backoff:</b> a bounded for loop with a growing sleep, never a while true, so a dead dependency cannot hang the thread forever. <br><br>

<b>Interview answers to keep ready</b><br>
• Why does the enhanced for not let you remove elements? Because the underlying iterator sees the modCount change and fails fast. <br>
• When is a stream slower than a loop? For small collections and cheap operations, because of pipeline setup and boxing. <br>
• What is on stack replacement? The JIT compiling a method whose loop is already running, and swapping the frame over to native code. <br>
• How do you break out of two loops? A labelled break, not a flag variable and not an exception. <br>`,
                                codeExamples: [
                                    `// Point 6 at expert level: bounded retry with backoff, and batch processing

import java.util.ArrayList;
import java.util.List;

public class ProductionLoopDemo {

    static int callCount = 0;

    // Simulates a flaky UPI gateway that fails the first two times
    static String callGateway(String utr) {
        callCount++;
        if (callCount < 3) {
            throw new RuntimeException("Gateway timeout for " + utr);
        }
        return "SUCCESS " + utr;
    }

    // RIGHT: bounded retry with exponential backoff, never while true
    static String withRetry(String utr, int maxAttempts) throws InterruptedException {
        long backoffMs = 50;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return callGateway(utr);
            } catch (RuntimeException e) {
                if (attempt == maxAttempts) {
                    return "FAILED after " + attempt + " attempts";
                }
                System.out.println("Attempt " + attempt + " failed, sleeping "
                        + backoffMs + " ms");
                Thread.sleep(backoffMs);
                backoffMs = backoffMs * 2;      // exponential
            }
        }
        return "UNREACHABLE";
    }

    public static void main(String[] args) throws Exception {

        System.out.println(withRetry("UTR-4491", 5));

        // RIGHT: process in batches instead of one database call per row
        List<Long> transactionIds = new ArrayList<>();
        for (long i = 1; i <= 25; i++) transactionIds.add(i);

        int batchSize = 10;
        int batches = 0;
        for (int start = 0; start < transactionIds.size(); start += batchSize) {
            int end = Math.min(start + batchSize, transactionIds.size());
            List<Long> batch = transactionIds.subList(start, end);
            batches++;
            System.out.println("Batch " + batches + " sends " + batch.size()
                    + " ids in ONE call: " + batch);
        }

        // WRONG pattern that causes N plus 1:
        // for (Long id : transactionIds) { repository.findById(id); }
        System.out.println("One call per row would have made "
                + transactionIds.size() + " round trips instead of " + batches);
    }
}
// OUTPUT (sleep timings vary):
// Attempt 1 failed, sleeping 50 ms
// Attempt 2 failed, sleeping 100 ms
// SUCCESS UTR-4491
// Batch 1 sends 10 ids in ONE call: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// Batch 2 sends 10 ids in ONE call: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
// Batch 3 sends 5 ids in ONE call: [21, 22, 23, 24, 25]
// One call per row would have made 25 round trips instead of 3`
                                ]
                            }
                        ]
};
