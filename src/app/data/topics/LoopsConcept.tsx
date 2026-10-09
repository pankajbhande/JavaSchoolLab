import { Topic } from '../coreJava';

export const loopsConcept: Topic = {
    id: 'loops-concept',
    name: 'Loops',
    beginner: [
        {
            content: `<h3>What is Looping?</h3>
Looping means repeating a block of code multiple times, instead of writing the same statement over and over by hand. It exists because many real problems require doing the same action for every item in a collection, or repeating a step until some condition is met.<br><br>
Without loops, printing "Hello" 5 times would need 5 separate print statements. With a loop, one statement does it.<br>`,
            codeExamples: [`public class NoLoopVsLoop {
    public static void main(String[] args) {
        // Without a loop - repetitive and doesn't scale
        System.out.println("Hello");
        System.out.println("Hello");
        System.out.println("Hello");

        // With a loop - same result, scales to any count
        for (int i = 0; i < 3; i++) {
            System.out.println("Hello");
        }
    }
}
// OUTPUT:
// Hello
// Hello
// Hello
// Hello
// Hello
// Hello`]
        },
        {
            content: `<h3>Counting Loops</h3>
The most common kind of loop repeats a known, fixed number of times - counting up from a start value to an end value. Java's <code>for</code> loop is built specifically for this pattern.<br>`,
            codeExamples: [`public class CountingLoop {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
// OUTPUT:
// Count: 1
// Count: 2
// Count: 3
// Count: 4
// Count: 5`]
        },
        {
            content: `<h3>Condition-Based Loops</h3>
Sometimes you don't know in advance how many times to repeat - you just repeat "while some condition holds." Java's <code>while</code> loop handles this: it checks the condition before every repetition.<br>`,
            codeExamples: [`public class ConditionLoop {
    public static void main(String[] args) {
        int fuel = 3;
        while (fuel > 0) {
            System.out.println("Flying... fuel left: " + fuel);
            fuel--;
        }
        System.out.println("Landed - out of fuel");
    }
}
// OUTPUT:
// Flying... fuel left: 3
// Flying... fuel left: 2
// Flying... fuel left: 1
// Landed - out of fuel`]
        },
        {
            content: `<h3>Looping Over a Collection</h3>
A very common looping style is "for each item in this collection, do something with it" - without needing to manage a counter manually. Java's enhanced for loop (for-each) expresses exactly this idea.<br>`,
            codeExamples: [`public class ForEachLoop {
    public static void main(String[] args) {
        String[] fruits = {"Apple", "Banana", "Mango"};
        for (String fruit : fruits) {
            System.out.println("I like " + fruit);
        }
    }
}
// OUTPUT:
// I like Apple
// I like Banana
// I like Mango`]
        },
    ],
    expert: [
        {
            content: `<h3>Why Looping is a Fundamental Concept, Not Just Syntax</h3>
Looping is one of the three foundational control-flow building blocks of programming (alongside sequence and selection/branching). Any repeatable computation - processing every row in a database, retrying a network call, animating a frame every 16ms - is, at its heart, a loop. Different languages express it differently, but the underlying idea is the same: "repeat this action, either a known number of times, or until a condition changes."<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Looping Style</th><th>When You Know</th><th>Java Construct</th></tr>
<tr class='text-center'><td>Count-controlled</td><td>Exact number of repetitions in advance</td><td>for</td></tr>
<tr class='text-center'><td>Condition-controlled (pre-test)</td><td>A condition to check before each repetition</td><td>while</td></tr>
<tr class='text-center'><td>Condition-controlled (post-test)</td><td>Must run at least once, then check a condition</td><td>do-while</td></tr>
<tr class='text-center'><td>Collection-controlled</td><td>Iterating every element of a group</td><td>for-each (enhanced for)</td></tr>
</table>`,
        },
        {
            content: `<h3>Two Looping Styles Compared: Recursion vs Iteration</h3>
Repetition doesn't require a loop keyword at all - recursion (a function calling itself) achieves the same repeated-work effect using the call stack instead of a loop construct. Both compute the same result; they differ in mechanism and cost.<br>`,
            codeExamples: [`public class LoopVsRecursion {
    // Iterative style: uses a loop construct, constant extra memory
    static long sumIterative(int n) {
        long total = 0;
        for (int i = 1; i <= n; i++) total += i;
        return total;
    }

    // Recursive style: no loop keyword, repetition via self-calls, uses stack memory
    static long sumRecursive(int n) {
        if (n == 0) return 0;
        return n + sumRecursive(n - 1);
    }

    public static void main(String[] args) {
        System.out.println(sumIterative(5));
        System.out.println(sumRecursive(5));
    }
}
// OUTPUT:
// 15
// 15`]
        },
        {
            content: `<h3>The Anatomy of a Loop: Init, Condition, Update, Body</h3>
Every counting loop, regardless of language or syntax, has four logical parts. Recognizing them helps you translate between loop styles and spot infinite-loop bugs.<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">for ( INIT ; CONDITION ; UPDATE ) {
        BODY
}

INIT      -&gt; runs once, before the loop starts   (int i = 0)
CONDITION -&gt; checked before every repetition      (i < 5)
BODY      -&gt; the code that actually repeats       (System.out.println(i))
UPDATE    -&gt; runs after each repetition            (i++)</pre>
If UPDATE never makes CONDITION false, you get an infinite loop - one of the most common beginner bugs.<br>`,
            codeExamples: [`public class LoopAnatomy {
    public static void main(String[] args) {
        // Deliberately showing what happens WITHOUT a proper update step,
        // using a bounded safety counter so this example still terminates:
        int i = 0;
        int safety = 0;
        while (i < 5) {
            System.out.println("i = " + i);
            // i++ ; // <- if this were missing, the loop would never end
            i++;
            safety++;
            if (safety > 100) { System.out.println("Safety break!"); break; }
        }
    }
}
// OUTPUT:
// i = 0
// i = 1
// i = 2
// i = 3
// i = 4`]
        },
        {
            content: `<h3>Nested Loops and Early Exit</h3>
Loops can contain other loops (nested loops), useful for processing 2D data like grids or tables. <code>break</code> exits a loop early; <code>continue</code> skips to the next iteration without exiting.<br>`,
            codeExamples: [`public class NestedLoopDemo {
    public static void main(String[] args) {
        for (int row = 1; row <= 3; row++) {
            for (int col = 1; col <= 3; col++) {
                if (col == 2) continue; // skip printing when col is 2
                System.out.print("(" + row + "," + col + ") ");
            }
        }
        System.out.println();
    }
}
// OUTPUT:
// (1,1) (1,3) (2,1) (2,3) (3,1) (3,3)`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is looping, conceptually?</td><td>Repeating a block of logic multiple times, either a known number of times or until a condition changes, instead of duplicating code manually</td></tr>
<tr class='text-center'><td>What's the difference between a pre-test and post-test loop?</td><td>A pre-test loop (while) checks its condition before running the body - it may run zero times; a post-test loop (do-while) runs the body first, then checks - it always runs at least once</td></tr>
<tr class='text-center'><td>Can any counting loop be rewritten as recursion, and vice versa?</td><td>Yes - both are ways to express repetition; loops use a control construct with constant memory, recursion uses self-calls and stack memory</td></tr>
<tr class='text-center'><td>What are the four logical parts of a for loop?</td><td>Initialization, condition, body, and update</td></tr>
<tr class='text-center'><td>What causes an infinite loop?</td><td>A condition that never becomes false, usually because the update step is missing or doesn't move the loop variable toward the exit condition</td></tr>
<tr class='text-center'><td>What is the difference between break and continue?</td><td>break exits the loop entirely; continue skips the rest of the current iteration and moves to the next one</td></tr>
</table>`
        },
    ],
};
