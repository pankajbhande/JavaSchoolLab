import { Topic } from '../../coreJava';

export const array1D: Topic = {
    id: 'dsa-arrays-1d-arrays',
    name: '1D Arrays',
    beginner: [
        {
            content: `<h4>What is a 1D Array?</h4>
A 1D array is a fixed-size, contiguous block of memory holding elements of the same type, accessed by an integer <b>index</b> starting at 0.
<ul>
<li><b>Contiguous memory</b> is what makes <code>arr[i]</code> an O(1) operation - the address is computed directly as <code>base + i * elementSize</code>.</li>
<li><b>Fixed size</b> - once created, a Java array cannot grow or shrink; use <code>ArrayList</code> when the size is unknown up front.</li>
<li>Default values: <code>0</code> for numeric types, <code>false</code> for boolean, <code>null</code> for objects.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class ArrayBasicsDemo {
    public static void main(String[] args) {
        int[] marks = new int[5];      // all zeros by default
        marks[0] = 88;
        marks[1] = 74;
        marks[4] = 95;

        int[] scores = {88, 74, 0, 0, 95};   // array literal, same values

        System.out.println("Length     : " + marks.length);   // NOT a method call
        System.out.println("First      : " + marks[0]);
        System.out.println("Last       : " + marks[marks.length - 1]);

        for (int i = 0; i < marks.length; i++) {
            System.out.print(marks[i] + " ");
        }
        System.out.println();

        for (int m : marks) {   // enhanced for-loop, read-only
            System.out.print(m + " ");
        }
    }
}
// OUTPUT:
// Length     : 5
// First      : 88
// Last       : 95
// 88 74 0 0 95
// 88 74 0 0 95`
            ]
        },
        {
            content: `<h4>Common Pitfalls</h4>
<ul>
<li><b>ArrayIndexOutOfBoundsException</b> - accessing <code>arr[arr.length]</code> or a negative index throws at runtime; Java never silently clamps or wraps.</li>
<li><code>length</code> is a <b>field</b>, not a method - no parentheses, unlike <code>String.length()</code> or <code>List.size()</code>.</li>
<li>Arrays of objects hold <b>references</b>: <code>int[][] grid = new int[3][]</code> creates 3 null rows, not usable 2D storage, until each row is assigned.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

public class ArrayPitfallsDemo {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3};

        // WRONG: reading one past the end
        // System.out.println(arr[3]);
        // Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3

        // RIGHT: the last valid index is length - 1
        System.out.println("Last valid index: " + (arr.length - 1));

        String[] names = new String[3];
        System.out.println("Unset slot: " + names[0]);   // null, not ""
    }
}
// OUTPUT:
// Last valid index: 2
// Unset slot: null`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Arrays in Memory - Stack, Heap and Reference Semantics</h3>
The array <b>reference</b> lives on the stack (or inside an enclosing object); the array's actual elements live on the heap as one contiguous block. Assigning <code>b = a</code> copies the reference, not the data - both variables then point at the same backing array.<br><br>
Passing an array to a method passes that reference by value: the method cannot reassign the caller's variable, but it CAN mutate the elements the reference points to.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class ArrayReferenceDemo {

    static void reassign(int[] arr) {
        arr = new int[]{9, 9, 9};   // only rebinds the LOCAL parameter
    }

    static void mutate(int[] arr) {
        arr[0] = 100;                // mutates the SHARED backing array
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        int[] b = a;                 // b and a reference the SAME array

        b[1] = 20;
        System.out.println("a after b[1]=20 : " + Arrays.toString(a));

        reassign(a);
        System.out.println("a after reassign : " + Arrays.toString(a)); // unchanged

        mutate(a);
        System.out.println("a after mutate   : " + Arrays.toString(a)); // changed

        int[] copy = Arrays.copyOf(a, a.length);  // a REAL independent copy
        copy[0] = -1;
        System.out.println("a after copy edit: " + Arrays.toString(a)); // unaffected
    }
}
// OUTPUT:
// a after b[1]=20 : [1, 20, 3]
// a after reassign : [1, 20, 3]
// a after mutate   : [100, 20, 3]
// a after copy edit: [100, 20, 3]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is array access O(1) but insertion at the front O(n)?</td><td>Access computes a direct memory offset; inserting at the front must shift every following element one slot over</td></tr>
<tr class='text-center'><td>Can a Java array change size after creation?</td><td>No - the length is fixed at allocation. "Growing" an array (as ArrayList does internally) means allocating a new, bigger array and copying elements over</td></tr>
<tr class='text-center'><td>Is passing an array to a method pass-by-value or pass-by-reference?</td><td>Pass-by-value of the reference itself - the method gets its own copy of the pointer, so it can mutate elements but cannot make the caller's variable point elsewhere</td></tr>
<tr class='text-center'><td>What's the default value of an uninitialized int[] element?</td><td>0 - Java always zero-initializes primitive array slots, unlike C which leaves them as garbage</td></tr>
</table>`
        }
    ]
};
