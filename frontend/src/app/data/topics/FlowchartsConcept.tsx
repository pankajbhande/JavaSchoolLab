import { Topic } from '../coreJava';

export const flowchartsConcept: Topic = {
    id: 'flowcharts',
    name: 'Flowcharts',
    beginner: [
        {
            content: `<h3>What is a Flowchart?</h3>
A flowchart is a diagram that shows the step-by-step flow of an algorithm using standard shapes connected by arrows. Before writing code, drawing a flowchart helps you visualize the logic and catch mistakes early.<br><br>
Common shapes: <br>
• <strong>Oval</strong> - Start / End <br>
• <strong>Rectangle</strong> - Process / action step <br>
• <strong>Diamond</strong> - Decision (yes/no branch) <br>
• <strong>Parallelogram</strong> - Input / Output <br>
• <strong>Arrow</strong> - Flow of control from one step to the next<br>`,
        },
        {
            content: `<h3>A Simple Flowchart: Check Even or Odd</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">      ( Start )
          |
   [ Read number n ]
          |
     &lt; n % 2 == 0? &gt;
       /        \\
    Yes          No
     |            |
[ Print "Even" ] [ Print "Odd" ]
     \\            /
      \\          /
        ( End )</pre>
This maps directly onto Java code with an if-else statement.<br>`,
            codeExamples: [`import java.util.Scanner;

public class EvenOddFlowchart {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = 7; // simulate "reading" input
        if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
    }
}
// OUTPUT:
// Odd`]
        },
        {
            content: `<h3>Flowcharting a Loop</h3>
A loop in a flowchart is drawn as an arrow that goes back to an earlier decision point, forming a cycle that repeats until a condition becomes false.<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   ( Start )
      |
 [ i = 1 ]
      |&lt;------------+
 &lt; i &lt;= 5? &gt;         |
   / \\               |
 Yes  No              |
  |    |               |
[Print i] ( End )      |
  |                    |
[ i = i + 1 ]----------+</pre>`,
            codeExamples: [`public class LoopFlowchart {
    public static void main(String[] args) {
        int i = 1;
        while (i <= 5) {
            System.out.print(i + " ");
            i = i + 1;
        }
    }
}
// OUTPUT:
// 1 2 3 4 5`]
        },
        {
            content: `<h3>Why Flowcharts Help Beginners</h3>
Flowcharts force you to think through every branch and every repeat before typing a single line of code. They are especially useful for spotting missing cases - for example, forgetting what happens when a loop condition is never true.<br>`,
            codeExamples: [`public class MissingCaseDemo {
    public static void main(String[] args) {
        int marks = 45;
        // A flowchart with only two branches (Pass/Fail at 40) would have
        // caught that we also need a "Distinction" branch for marks >= 90
        if (marks >= 90) {
            System.out.println("Distinction");
        } else if (marks >= 40) {
            System.out.println("Pass");
        } else {
            System.out.println("Fail");
        }
    }
}
// OUTPUT:
// Pass`]
        },
    ],
    expert: [
        {
            content: `<h3>Standard Flowchart Symbols (ANSI/ISO)</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Shape</th><th>Meaning</th><th>Java Equivalent</th></tr>
<tr class='text-center'><td>Oval / Terminator</td><td>Start or End of the program</td><td>Beginning/end of main()</td></tr>
<tr class='text-center'><td>Rectangle / Process</td><td>An action or computation</td><td>An assignment statement or method call</td></tr>
<tr class='text-center'><td>Diamond / Decision</td><td>A yes/no or true/false branch</td><td>if / else / switch</td></tr>
<tr class='text-center'><td>Parallelogram / I-O</td><td>Reading input or printing output</td><td>Scanner.nextInt(), System.out.println()</td></tr>
<tr class='text-center'><td>Circle / Connector</td><td>Links flowchart parts across a page</td><td>N/A - a documentation aid only</td></tr>
<tr class='text-center'><td>Arrow</td><td>Direction of control flow</td><td>Sequential execution / jump on branch or loop</td></tr>
</table>`,
        },
        {
            content: `<h3>Flowchart of a Nested Decision (Grading System)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        ( Start )
            |
     [ Read marks ]
            |
      &lt; marks &gt;= 90? &gt;-- Yes --&gt; [ Print "A" ] --+
            | No                                  |
      &lt; marks &gt;= 75? &gt;-- Yes --&gt; [ Print "B" ] --+
            | No                                  |
      &lt; marks &gt;= 50? &gt;-- Yes --&gt; [ Print "C" ] --+
            | No                                  |
      [ Print "F" ] --------------------------------+
                                                    |
                                                ( End )</pre>
This chain of diamonds is a direct visual model of an if / else-if / else-if / else ladder.<br>`,
            codeExamples: [`public class GradingFlowchart {
    public static void main(String[] args) {
        int marks = 82;
        String grade;
        if (marks >= 90) grade = "A";
        else if (marks >= 75) grade = "B";
        else if (marks >= 50) grade = "C";
        else grade = "F";
        System.out.println("Grade: " + grade);
    }
}
// OUTPUT:
// Grade: B`]
        },
        {
            content: `<h3>Flowchart to Pseudocode to Code: The Translation Pipeline</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Flowchart Element</th><th>Pseudocode</th><th>Java</th></tr>
<tr class='text-center'><td>Diamond with two exits</td><td>IF condition THEN ... ELSE ...</td><td>if (condition) { ... } else { ... }</td></tr>
<tr class='text-center'><td>Loop-back arrow to a decision</td><td>WHILE condition DO ... END WHILE</td><td>while (condition) { ... }</td></tr>
<tr class='text-center'><td>Sequence of rectangles</td><td>Step 1; Step 2; Step 3</td><td>stmt1; stmt2; stmt3;</td></tr>
<tr class='text-center'><td>Parallelogram (input)</td><td>READ n</td><td>int n = scanner.nextInt();</td></tr>
</table>
This pipeline - flowchart to pseudocode to code - is exactly how algorithms taught conceptually get turned into real, compilable Java.<br>`,
        },
        {
            content: `<h3>When Flowcharts Break Down</h3>
Flowcharts are great for small, linear algorithms, but they scale poorly for large real-world systems: they become unreadable spaghetti diagrams for deeply nested logic, and they don't capture concepts like object relationships, concurrency, or exceptions well. For those, professionals use other notations - UML class/sequence diagrams, pseudocode, or just well-structured code with comments.<br>`,
            codeExamples: [`public class WhenFlowchartsAreEnough {
    public static void main(String[] args) {
        // Simple, linear logic - a flowchart models this well
        int a = 10, b = 20;
        int max = (a > b) ? a : b;
        System.out.println("Max: " + max);

        // Exception handling, threads, and generics are hard to express
        // cleanly as a flowchart - code (with comments) communicates
        // this kind of logic better than boxes and arrows.
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Handled: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Max: 20
// Handled: / by zero`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What shape represents a decision in a flowchart?</td><td>A diamond, with typically two outgoing arrows labeled Yes/No or True/False</td></tr>
<tr class='text-center'><td>How is a loop represented in a flowchart?</td><td>An arrow that loops back from a later step to an earlier decision point, repeating until the condition is false</td></tr>
<tr class='text-center'><td>What is the difference between a flowchart and pseudocode?</td><td>A flowchart is a visual/graphical representation of logic; pseudocode is a text-based, language-agnostic description of the same logic</td></tr>
<tr class='text-center'><td>Why draw a flowchart before coding?</td><td>It helps clarify logic, catch missing branches/edge cases, and communicate an algorithm to others before implementation</td></tr>
<tr class='text-center'><td>What symbol denotes Start/End in a flowchart?</td><td>An oval (terminator symbol)</td></tr>
<tr class='text-center'><td>When do flowcharts become impractical?</td><td>For large, deeply nested, or highly concurrent logic - they become unreadable and other notations (UML, structured code) communicate better</td></tr>
</table>`
        },
    ],
};
