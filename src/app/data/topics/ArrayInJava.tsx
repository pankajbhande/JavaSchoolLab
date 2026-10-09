import { Topic } from '../coreJava';
import Array1 from '../../../assets/Array1.png';

export const arrayInJava: Topic = {
                        id: `Array in java`,
                        name: `Array in Java`,

                        beginner: [

                            {
                                content: `<h3>What is an Array?</h3>
An <b>array</b> is a collection of elements of the <b>same data type</b> stored in contiguous memory locations. <br>
• In Java, an array is itself an <b>object</b>. <br>
• Array size is <b>fixed</b> once created — it cannot grow or shrink at runtime. <br>
• Array elements are accessed using an <b>index</b>, starting from <b>0</b>. <br><br>

<img src="${Array1}" alt="Array memory layout" class="d-block mx-auto"/>`
                            },

                            {
                                content: `<h4>How Indices Map to Memory Slots</h4>
Think of an array as a row of numbered boxes. For <code>int[] a = new int[5]</code>, the 5 boxes are indexed <code>0</code> through <code>4</code> (length - 1). <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Index:   0     1     2     3     4
       +-----+-----+-----+-----+-----+
Value: | 10  | 20  | 30  | 40  | 50  |
       +-----+-----+-----+-----+-----+
a.length = 5   (valid indices: 0 to 4)</pre>`
                            },

                            {
                                content: `<h4>Declaring an Array</h4>
There are three equivalent ways to declare an array reference in Java: <br>
1. <code>dataType[] arr;</code> (preferred style)<br>
2. <code>dataType []arr;</code><br>
3. <code>dataType arr[];</code> (C-style, still valid)<br>
Declaring alone does not create the array — it only creates a reference variable that currently points to nothing.`
                            },

                            {
                                content: `<h4>Creating & Filling an Array Element by Element</h4>
<code>new int[5]</code> allocates space for 5 integers (all default to <code>0</code>), then each index is assigned individually.`,
                                codeExamples: [
                                    `public class ArrayBasicsDemo {
    public static void main(String[] args) {
        int[] a = new int[5];
        a[0] = 10;
        a[1] = 20;
        a[2] = 30;
        a[3] = 40;
        a[4] = 50;

        for (int i = 0; i < a.length; i++) {
            System.out.println(a[i]);
        }
    }
}
// OUTPUT:
// 10
// 20
// 30
// 40
// 50`
                                ]
                            },

                            {
                                content: `<h4>Single-Line Initialization</h4>
Java also lets you declare and fill an array in one statement using an array literal.`,
                                codeExamples: [
                                    `public class ArrayLiteralDemo {
    public static void main(String[] args) {
        int[] a = {10, 20, 30};

        for (int i = 0; i < a.length; i++) {
            System.out.println(a[i]);
        }
    }
}
// OUTPUT:
// 10
// 20
// 30`
                                ]
                            },

                            {
                                content: `<h4>Iterating with a for-each Loop</h4>
The for-each loop reads each element in order without needing an index variable — simpler when you don't need the index itself.`,
                                codeExamples: [
                                    `public class ForEachDemo {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40};

        for (int i : arr) {
            System.out.println(i);
        }
    }
}
// OUTPUT:
// 10
// 20
// 30
// 40`
                                ]
                            },

                            {
                                content: `<h4>Array Length</h4>
<code>arr.length</code> is a <b>field</b> (no parentheses) that tells you how many elements the array holds. It is fixed for the lifetime of that array object.`,
                                codeExamples: [
                                    `public class ArrayLengthDemo {
    public static void main(String[] args) {
        int[] arr = {5, 15, 25, 35, 45};
        System.out.println("Length: " + arr.length);
    }
}
// OUTPUT:
// Length: 5`
                                ]
                            },

                            {
                                content: `<h4>2D Arrays — the Basics</h4>
A 2D array is stored as rows and columns (like a matrix). <code>arr[row][col]</code> accesses a single cell.`,
                                codeExamples: [
                                    `public class TwoDArrayDemo {
    public static void main(String[] args) {
        int[][] arr = {
            {1, 2, 3},
            {2, 4, 5},
            {4, 4, 5}
        };

        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr[i].length; j++) {
                System.out.print(arr[i][j] + " ");
            }
            System.out.println();
        }
    }
}
// OUTPUT:
// 1 2 3
// 2 4 5
// 4 4 5`
                                ]
                            },

                            {
                                content: `<h4>Passing an Array to a Method</h4>
Arrays can be passed to methods so the same logic can be reused on any array of that type.`,
                                codeExamples: [
                                    `public class ArrayMethodDemo {
    static void printMin(int[] arr) {
        int min = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (min > arr[i]) {
                min = arr[i];
            }
        }
        System.out.println(min);
    }

    public static void main(String[] args) {
        int[] a = {33, 3, 4, 5};
        printMin(a);
    }
}
// OUTPUT:
// 3`
                                ]
                            },

                            {
                                content: `<h4>Advantages & Disadvantages</h4>
<b>Advantages</b><br>
• Random access — direct access to any element using its index (O(1))<br>
• Simple and memory-efficient for fixed-size data<br><br>

<b>Disadvantages</b><br>
• Fixed size — cannot grow or shrink dynamically<br>
• Can waste memory if the size is over-estimated<br>
• The Collections Framework (e.g. <code>ArrayList</code>) overcomes this limitation<br>`
                            },
                            {
                                content: `<h3>1. Definition</h3>
• An <b>array</b> is a container object that holds a fixed number of values of the <b>same type</b>, stored one after another in memory. <br>
• Each value is called an <b>element</b> and each element has a position called an <b>index</b>. Java indexes start at <b>0</b>, so an array of five elements uses index 0 to index 4. <br>
• The size is fixed at the moment you create the array with new, and it is available through the <b>length</b> field, not a method. <br>
• Arrays are <b>objects on the heap</b>, so an array variable holds a reference. Elements get default values automatically, 0 for numbers, false for boolean and null for objects. <br><br>

<h3>2. Purpose of This Topic</h3>
• To keep <b>many related values under one name</b> instead of declaring marks1, marks2, marks3 and so on. <br>
• To process a group of values in a <b>loop</b>, which is the natural pair for an array. <br>
• To give <b>constant time access</b> to any position, because the index maps straight to a memory offset. <br>
• To form the base for <b>matrices, strings, collections and almost every data structure</b> you learn later. <br><br>

<h3>3. Need of This Topic</h3>
• Real data comes in groups. Sixty student marks, twelve monthly sales figures, seven days of temperature. <br>
• ArrayList, String, StringBuilder and HashMap are all built on arrays internally. <br>
• Almost every coding interview starts with an array question, such as finding the second largest number. <br>
• Understanding index bounds prevents the ArrayIndexOutOfBoundsException that beginners hit every day. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: declaring, filling, reading and looping over arrays

import java.util.Arrays;

public class ArrayBasicsDemo {

    public static void main(String[] args) {

        // POINT 1: three ways to make an array
        int[] marks = new int[5];                                  // all zeros
        int[] sales = {45000, 52000, 38000, 61000, 49000};         // with values
        String[] cities = new String[]{"Pune", "Nagpur", "Nashik"};

        // POINT 1: default values before you assign anything
        System.out.println("Default int element   : " + marks[0]);
        String[] emptyNames = new String[2];
        System.out.println("Default object element: " + emptyNames[0]);

        // POINT 2: fill one index at a time
        marks[0] = 78;
        marks[1] = 91;
        marks[2] = 65;
        marks[3] = 84;
        marks[4] = 59;

        // POINT 1: length is a field, not a method
        System.out.println("Number of subjects: " + marks.length);

        // POINT 2: read with an index loop
        int total = 0;
        for (int i = 0; i < marks.length; i++) {
            total += marks[i];
        }
        System.out.println("Total marks: " + total);
        System.out.println("Average    : " + ((double) total / marks.length));

        // POINT 2: enhanced for when you do not need the index
        long yearlySales = 0;
        for (int s : sales) {
            yearlySales += s;
        }
        System.out.println("Sales for five months: Rs " + yearlySales);

        // POINT 2: find the maximum
        int highest = marks[0];
        int highestIndex = 0;
        for (int i = 1; i < marks.length; i++) {
            if (marks[i] > highest) {
                highest = marks[i];
                highestIndex = i;
            }
        }
        System.out.println("Highest " + highest
                + " in subject number " + (highestIndex + 1));

        // POINT 3: WRONG, index 5 does not exist in a length 5 array
        try {
            System.out.println(marks[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("WRONG index threw ArrayIndexOutOfBoundsException");
        }

        // POINT 3: RIGHT, the last valid index is length minus one
        System.out.println("RIGHT last element: " + marks[marks.length - 1]);

        // POINT 1: two dimensional array, a class result table
        int[][] classResult = {
            {78, 84, 66},
            {55, 61, 48},
            {90, 88, 95}
        };
        for (int r = 0; r < classResult.length; r++) {
            System.out.println("Student " + (r + 1) + " marks "
                    + Arrays.toString(classResult[r]));
        }

        System.out.println("Cities: " + Arrays.toString(cities));
    }
}
// OUTPUT:
// Default int element   : 0
// Default object element: null
// Number of subjects: 5
// Total marks: 377
// Average    : 75.4
// Sales for five months: Rs 245000
// Highest 91 in subject number 2
// WRONG index threw ArrayIndexOutOfBoundsException
// RIGHT last element: 59
// Student 1 marks [78, 84, 66]
// Student 2 marks [55, 61, 48]
// Student 3 marks [90, 88, 95]
// Cities: [Pune, Nagpur, Nashik]`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Instant access.</b> Reading marks of index 40 takes the same time as index 0, because the address is calculated directly. <br>
• <b>Low memory overhead.</b> A primitive array has no per element object header, so an int array of one million is about four megabytes. <br>
• <b>Cache friendly.</b> Elements sit next to each other, so walking the array in order is very fast on real hardware. <br>
• <b>Type safe.</b> An int array can never accidentally hold a String, the compiler stops it. <br>
• <b>Simple and universal.</b> Every algorithm book and every interview uses arrays, so the skill transfers everywhere. <br><br>

<h3>5. Disadvantages</h3>
• <b>Fixed size.</b> Once created you cannot grow or shrink it, you must make a new array and copy. <br>
• <b>Insert and delete are costly.</b> Removing the first element means shifting everything left. <br>
• <b>No built in methods.</b> There is no add, remove or contains, you must use the Arrays helper class or write loops. <br>
• <b>Index errors at run time.</b> A wrong index compiles fine and crashes only when that line runs. <br>
• <b>Only one type.</b> A single array cannot hold a mix of unrelated types unless you use Object, which loses type safety. <br>
• <b>Copying is shallow.</b> Copying an array of objects copies the references, so both arrays point to the same objects. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5: fixed size, shifting cost, shallow copy and the Arrays helper

import java.util.Arrays;

public class ArrayPitfallDemo {

    static class Student {
        String name;
        Student(String name) { this.name = name; }
    }

    public static void main(String[] args) {

        // DISADVANTAGE 5: fixed size, you must copy to grow
        int[] seats = {101, 102, 103};
        // seats[3] = 104;                     // WRONG, no room

        int[] biggerSeats = Arrays.copyOf(seats, 5);   // RIGHT, new array
        biggerSeats[3] = 104;
        biggerSeats[4] = 105;
        System.out.println("Grown array: " + Arrays.toString(biggerSeats));

        // DISADVANTAGE 5: deleting means shifting every later element
        int[] tokens = {11, 22, 33, 44, 55};
        int removeIndex = 1;
        for (int i = removeIndex; i < tokens.length - 1; i++) {
            tokens[i] = tokens[i + 1];         // shift left
        }
        tokens[tokens.length - 1] = 0;         // last slot cleared
        System.out.println("After removing index 1: " + Arrays.toString(tokens));

        // DISADVANTAGE 5: shallow copy shares the objects
        Student[] original = { new Student("Aarav"), new Student("Isha") };
        Student[] shallow = Arrays.copyOf(original, original.length);
        shallow[0].name = "CHANGED";
        System.out.println("WRONG shallow copy, original[0] is now: " + original[0].name);

        // RIGHT: deep copy, make new objects
        Student[] deep = new Student[original.length];
        for (int i = 0; i < original.length; i++) {
            deep[i] = new Student(original[i].name);
        }
        deep[1].name = "SAFE CHANGE";
        System.out.println("RIGHT deep copy, original[1] stays: " + original[1].name);

        // ADVANTAGE 4 plus DISADVANTAGE 5: use the Arrays helper class
        int[] prices = {480, 120, 250, 99};
        Arrays.sort(prices);
        System.out.println("Sorted prices  : " + Arrays.toString(prices));
        System.out.println("Binary search 250 at index: "
                + Arrays.binarySearch(prices, 250));
        System.out.println("Arrays.equals  : "
                + Arrays.equals(prices, new int[]{99, 120, 250, 480}));

        // DISADVANTAGE 5: WRONG way to compare arrays
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println("WRONG a == b       : " + (a == b));
        System.out.println("RIGHT Arrays.equals: " + Arrays.equals(a, b));

        // DISADVANTAGE 5: WRONG way to print an array
        System.out.println("WRONG print gives type and hash, not values: "
                + a.toString().startsWith("[I@"));
        System.out.println("RIGHT print        : " + Arrays.toString(a));
    }
}
// OUTPUT:
// Grown array: [101, 102, 103, 104, 105]
// After removing index 1: [11, 33, 44, 55, 0]
// WRONG shallow copy, original[0] is now: CHANGED
// RIGHT deep copy, original[1] stays: Isha
// Sorted prices  : [99, 120, 250, 480]
// Binary search 250 at index: 2
// Arrays.equals  : true
// WRONG a == b       : false
// RIGHT Arrays.equals: true
// WRONG print gives type and hash, not values: true
// RIGHT print        : [1, 2, 3]`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>Cinema seat booking:</b> a two dimensional boolean array where row and column say whether a seat is taken. <br>
• <b>College attendance register:</b> a boolean array of sixty entries for one lecture, and a two dimensional one for a whole month. <br>
• <b>Bank monthly statement:</b> an array of transaction amounts used to compute the opening and closing balance. <br>
• <b>Cricket scorecard:</b> an int array of runs per over for the run rate graph. <br>
• <b>ATM note counter:</b> an array of note values and a matching array of counts. <br>
• <b>Global example, image processing:</b> a picture is a two dimensional array of pixel values. <br><br>

<b>Student tip:</b> use an array when the size is known and fixed, and use an ArrayList when items get added and removed. Never forget that the last valid index is length minus one.`,
                                codeExamples: [
                                    `// Point 6: a cinema seat booking chart and a monthly attendance register

import java.util.Arrays;

public class ArrayRealTimeDemo {

    public static void main(String[] args) {

        // Real time: PVR seat map, 4 rows and 6 seats each
        boolean[][] booked = new boolean[4][6];
        String[] rowNames = {"A", "B", "C", "D"};

        // book a few seats
        booked[0][2] = true;
        booked[0][3] = true;
        booked[2][0] = true;
        booked[3][5] = true;

        System.out.println("SEAT CHART, X means booked");
        for (int r = 0; r < booked.length; r++) {
            System.out.print(rowNames[r] + " ");
            for (int c = 0; c < booked[r].length; c++) {
                System.out.print(booked[r][c] ? "X " : "O ");
            }
            System.out.println();
        }

        int freeSeats = 0;
        for (boolean[] row : booked) {
            for (boolean seat : row) {
                if (!seat) freeSeats++;
            }
        }
        System.out.println("Free seats: " + freeSeats + " of " + (4 * 6));

        // Real time: monthly attendance, 3 students across 5 working days
        String[] students = {"Aditi", "Vikram", "Sneha"};
        boolean[][] attendance = {
            {true, true, false, true, true},
            {true, false, false, true, false},
            {true, true, true, true, true}
        };

        System.out.println("ATTENDANCE SUMMARY");
        for (int s = 0; s < students.length; s++) {
            int present = 0;
            for (boolean day : attendance[s]) {
                if (day) present++;
            }
            double percent = (present * 100.0) / attendance[s].length;
            String status = (percent >= 75) ? "ELIGIBLE" : "SHORT OF ATTENDANCE";
            System.out.printf("%-8s present %d of %d  %.1f percent  %s%n",
                    students[s], present, attendance[s].length, percent, status);
        }

        // Real time: ATM note counter using two matching arrays
        int[] noteValues = {2000, 500, 200, 100};
        int[] noteCounts = {3, 8, 5, 12};
        long cashInMachine = 0;
        for (int i = 0; i < noteValues.length; i++) {
            cashInMachine += (long) noteValues[i] * noteCounts[i];
        }
        System.out.println("Notes  : " + Arrays.toString(noteValues));
        System.out.println("Counts : " + Arrays.toString(noteCounts));
        System.out.println("Cash in machine: Rs " + cashInMachine);
    }
}
// OUTPUT:
// SEAT CHART, X means booked
// A O O X X O O
// B O O O O O O
// C X O O O O O
// D O O O O O X
// Free seats: 20 of 24
// ATTENDANCE SUMMARY
// Aditi    present 4 of 5  80.0 percent  ELIGIBLE
// Vikram   present 2 of 5  40.0 percent  SHORT OF ATTENDANCE
// Sneha    present 5 of 5  100.0 percent  ELIGIBLE
// Notes  : [2000, 500, 200, 100]
// Counts : [3, 8, 5, 12]
// Cash in machine: Rs 12200`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Arrays Are Objects on the Heap</h3>
Even an array of primitives (like <code>int[]</code>) is a full-fledged object in Java, allocated on the heap. The array variable itself is just a reference.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Stack                    Heap
+-------+               +---------------------+
| arr   |-------------->| int[] object        |
+-------+               | length = 5           |
                         | [0,0,0,0,0]          |
                         +---------------------+</pre>

Default values on creation depend on the element type:<br>
• <code>new int[5]</code> -&gt; all elements <code>0</code><br>
• <code>new boolean[5]</code> -&gt; all elements <code>false</code><br>
• <code>new String[5]</code> / any object array -&gt; all elements <code>null</code> (an object array is NOT auto-populated with instances)<br>`,
                                codeExamples: [
                                    `public class ArrayDefaultsDemo {
    public static void main(String[] args) {
        int[] nums = new int[3];
        boolean[] flags = new boolean[3];
        String[] names = new String[3];

        System.out.println(java.util.Arrays.toString(nums));
        System.out.println(java.util.Arrays.toString(flags));
        System.out.println(java.util.Arrays.toString(names));

        // names[0].length();  // NullPointerException: elements are null
    }
}
// OUTPUT:
// [0, 0, 0]
// [false, false, false]
// [null, null, null]`
                                ]
                            },
                            {
                                content: `<h3>ArrayIndexOutOfBoundsException — Edge Cases</h3>
The JVM throws <code>ArrayIndexOutOfBoundsException</code> whenever an index is negative, equal to <code>length</code>, or greater than <code>length - 1</code>. A very common bug is using <code>&lt;=</code> instead of <code>&lt;</code> in the loop condition.`,
                                codeExamples: [
                                    `public class ArrayIndexExceptionDemo {
    public static void main(String[] args) {
        int[] arr = {50, 60, 70, 80};
        try {
            for (int i = 0; i <= arr.length; i++) { // BUG: use i < arr.length
                System.out.println(arr[i]);
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        try {
            int x = arr[-1];
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
// OUTPUT:
// 50
// 60
// 70
// 80
// Caught: Index 4 out of bounds for length 4
// Caught: Index -1 out of bounds for length 4`
                                ]
                            },
                            {
                                content: `<h3>Rectangular vs Jagged 2D Arrays</h3>
A rectangular array has every row the same length. A jagged array is an "array of arrays" where each row can have a different length - useful when rows genuinely represent different-sized data.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Rectangular (3x3)          Jagged (rows differ)
[1 2 3]                    [1 2]
[4 5 6]                    [3 4 5]
[7 8 9]                    [6]</pre>`,
                                codeExamples: [
                                    `public class JaggedArrayDemo {
    public static void main(String[] args) {
        int[][] jagged = new int[3][];
        jagged[0] = new int[]{1, 2};
        jagged[1] = new int[]{3, 4, 5};
        jagged[2] = new int[]{6};

        for (int[] row : jagged) {
            System.out.println(java.util.Arrays.toString(row));
        }
    }
}
// OUTPUT:
// [1, 2]
// [3, 4, 5]
// [6]`
                                ]
                            },
                            {
                                content: `<h3>Array Covariance Gotcha — ArrayStoreException</h3>
Java arrays are <strong>covariant</strong>: <code>String[]</code> is assignable to <code>Object[]</code>. This compiles, but lets you write code that fails only at <strong>runtime</strong> when the actual array type doesn't match the stored value.<br>`,
                                codeExamples: [
                                    `public class ArrayCovarianceDemo {
    public static void main(String[] args) {
        Object[] objs = new String[3]; // compiles: String[] IS-A Object[]

        try {
            objs[0] = Integer.valueOf(42); // compiles, fails at run time
        } catch (ArrayStoreException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Caught: java.lang.Integer`
                                ]
                            },
                            {
                                content: `<h3>The Arrays Utility Class</h3>
<code>java.util.Arrays</code> provides most of the operations you'd otherwise hand-write: sorting, searching, comparing, printing, copying and filling.<br>`,
                                codeExamples: [
                                    `import java.util.Arrays;

public class ArraysUtilDemo {
    public static void main(String[] args) {
        int[] a = {5, 2, 4, 1, 3};

        Arrays.sort(a);
        System.out.println(Arrays.toString(a));
        System.out.println(Arrays.binarySearch(a, 4)); // array must be sorted first

        int[] b = {1, 2, 3, 4, 5};
        System.out.println(a == b);            // false: different array objects
        System.out.println(Arrays.equals(a, b)); // true: same elements in order

        int[][] matrix = {{1, 2}, {3, 4}};
        System.out.println(Arrays.deepToString(matrix));

        int[] copy = Arrays.copyOf(a, 7);       // pads with 0
        System.out.println(Arrays.toString(copy));

        int[] filled = new int[4];
        Arrays.fill(filled, 9);
        System.out.println(Arrays.toString(filled));
    }
}
// OUTPUT:
// [1, 2, 3, 4, 5]
// 3
// false
// true
// [[1, 2], [3, 4]]
// [1, 2, 3, 4, 5, 0, 0]
// [9, 9, 9, 9]`
                                ]
                            },
                            {
                                content: `<h3>Copying & Cloning an Array</h3>
<code>System.arraycopy()</code> copies a range from a source array into a destination array. <code>clone()</code> creates a new array object: for a single-dimensional array of primitives it copies the values, but for an array of objects or a multidimensional array it copies only the references (a shallow copy).`,
                                codeExamples: [
                                    `import java.util.Arrays;

public class ArrayCopyCloneDemo {
    public static void main(String[] args) {
        char[] src = {'d','e','c','a','f','f','e','i','n'};
        char[] dest = new char[7];
        System.arraycopy(src, 2, dest, 0, 7);
        System.out.println(String.valueOf(dest));

        int[] arr = {33, 3, 4, 5};
        int[] clone = arr.clone();
        System.out.println(arr == clone);        // false: different objects
        System.out.println(Arrays.equals(arr, clone)); // true: same elements
    }
}
// OUTPUT:
// caffein
// false
// true`
                                ]
                            },
                            {
                                content: `<h3>Anonymous Arrays & Returning Arrays from Methods</h3>
An <b>anonymous array</b> can be created and passed straight into a method call without ever assigning it to a variable — useful for one-off calls. <br><br>
A method can also <b>return</b> an array, just like it returns any other object reference — the caller receives a reference to the array created inside the method.`,
                                codeExamples: [
                                    `public class AnonymousAndReturnArrayDemo {

    static void printArray(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            System.out.println(arr[i]);
        }
    }

    static int[] get() {
        return new int[]{10, 30, 50, 90, 60}; // returning an array
    }

    public static void main(String[] args) {
        printArray(new int[]{10, 22, 44, 66}); // anonymous array passed directly

        int[] arr = get(); // receiving a returned array
        printArray(arr);
    }
}
// OUTPUT:
// 10
// 22
// 44
// 66
// 10
// 30
// 50
// 90
// 60`
                                ]
                            },
                            {
                                content: `<h3>An Array's Class Name at Runtime</h3>
Since an array is an object, calling <code>getClass().getName()</code> on it returns the JVM's internal type descriptor rather than something like <code>"int[]"</code> - <code>[I</code> means "array of int", <code>[Ljava.lang.String;</code> means "array of String", and an extra leading <code>[</code> is added per extra dimension (e.g. <code>[[I</code> for <code>int[][]</code>).`,
                                codeExamples: [
                                    `public class ArrayClassNameDemo {
    public static void main(String[] args) {
        int[] arr = {4, 4, 5};
        System.out.println(arr.getClass().getName());

        String[] names = {"a", "b"};
        System.out.println(names.getClass().getName());

        int[][] matrix = {{1, 2}, {3, 4}};
        System.out.println(matrix.getClass().getName());
    }
}
// OUTPUT:
// [I
// [Ljava.lang.String;
// [[I`
                                ]
                            },
                            {
                                content: `<h3>Matrix Addition & Multiplication</h3>
2D arrays are the natural representation of a matrix. <b>Addition</b> just adds corresponding cells; <b>multiplication</b> takes the dot product of each row of the first matrix with each column of the second.`,
                                codeExamples: [
                                    `public class MatrixOpsDemo {
    public static void main(String[] args) {
        int[][] a = {{1, 1, 1}, {2, 2, 2}, {3, 3, 3}};
        int[][] b = {{1, 1, 1}, {2, 2, 2}, {3, 3, 3}};

        // Addition
        int[][] sum = new int[3][3];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                sum[i][j] = a[i][j] + b[i][j];
            }
        }
        System.out.println("Sum:");
        for (int[] row : sum) System.out.println(java.util.Arrays.toString(row));

        // Multiplication
        int[][] product = new int[3][3];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                for (int k = 0; k < 3; k++) {
                    product[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        System.out.println("Product:");
        for (int[] row : product) System.out.println(java.util.Arrays.toString(row));
    }
}
// OUTPUT:
// Sum:
// [2, 2, 2]
// [4, 4, 4]
// [6, 6, 6]
// Product:
// [6, 6, 6]
// [12, 12, 12]
// [18, 18, 18]`
                                ]
                            },
                            {
                                content: `<h3>Interview Classic: Find the 3rd Largest Element</h3>
A common interview question with two solutions: a hand-written exchange sort and <code>Arrays.sort()</code>. Both sort the array and then read the element at index <code>length - 3</code>. The point of the question is usually "can you avoid writing your own sort?"`,
                                codeExamples: [
                                    `import java.util.Arrays;

public class ThirdLargestDemo {

    // Approach 1: manual exchange sort
    static int getThirdLargestManual(int[] a, int total) {
        for (int i = 0; i < total; i++) {
            for (int j = i + 1; j < total; j++) {
                if (a[i] > a[j]) {
                    int temp = a[i]; a[i] = a[j]; a[j] = temp;
                }
            }
        }
        return a[total - 3];
    }

    // Approach 2: Arrays.sort()
    static int getThirdLargestArrays(int[] a, int total) {
        Arrays.sort(a);
        return a[total - 3];
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 5, 6, 3, 2};
        int[] b = {44, 66, 99, 77, 33, 22, 55};

        System.out.println("Manual: " + getThirdLargestManual(a.clone(), a.length));
        System.out.println("Arrays.sort: " + getThirdLargestArrays(b.clone(), b.length));
    }
}
// OUTPUT:
// Manual: 3
// Arrays.sort: 66`
                                ]
                            },
                            {
                                content: `<h3>Fixed-Size Array vs ArrayList</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Array</th><th>ArrayList</th></tr>
<tr class='text-center'><td>Size</td><td>Fixed at creation</td><td>Grows/shrinks dynamically</td></tr>
<tr class='text-center'><td>Element type</td><td>Primitives or objects</td><td>Objects only (autoboxed for primitives)</td></tr>
<tr class='text-center'><td>Performance</td><td>Faster, less overhead</td><td>Slightly slower due to resizing/boxing</td></tr>
<tr class='text-center'><td>API</td><td>Minimal (length, indexing)</td><td>Rich (add, remove, contains, streams, etc.)</td></tr>
<tr class='text-center'><td>Multi-dimensional</td><td>Native support</td><td>Needs nested collections</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> reach for a plain array when the size is fixed and known upfront (or you need raw primitive performance); reach for <code>ArrayList</code>/Collections when the size changes or you need the Collections Framework's utility methods.<br>`
                            },
                            {
                                content: `<h3>Common Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is an array?</td><td>A fixed-size, index-based object holding elements of the same type, stored contiguously</td></tr>
<tr class='text-center'><td>Why is array size fixed?</td><td>Memory is allocated as one contiguous block at creation time; resizing would require reallocating and copying the whole block</td></tr>
<tr class='text-center'><td>Array vs Collection</td><td>Array holds a fixed number of homogeneous elements (primitives allowed); Collections (List/Set/Map) grow dynamically and hold objects only</td></tr>
<tr class='text-center'><td>What is a jagged array?</td><td>An array of arrays where each row can have a different length</td></tr>
<tr class='text-center'><td>Array vs ArrayList</td><td>Array is fixed size and can store primitives directly; ArrayList is dynamically resizable but stores objects (autoboxed primitives)</td></tr>
<tr class='text-center'><td>What causes ArrayIndexOutOfBoundsException?</td><td>Accessing an index &lt; 0 or &gt;= array.length</td></tr>
<tr class='text-center'><td>What is ArrayStoreException?</td><td>Runtime exception thrown when storing an incompatible type into a covariant array (e.g. an Integer into a String[] referenced as Object[])</td></tr>
<tr class='text-center'><td>arr.length vs str.length()</td><td>Array length is a field (no parentheses); String length is a method call</td></tr>
</table>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• An array is a <b>JVM object with a header, a length field and a contiguous element block</b>. The header is normally twelve or sixteen bytes, so an int array of n costs about sixteen plus four n bytes, rounded up to eight. <br>
• Arrays are <b>covariant</b>. String array is a subtype of Object array, which is unsound and produces ArrayStoreException at run time. Generics chose invariance instead, which is why you cannot create a generic array. <br>
• A <b>two dimensional array is an array of array references</b>, not a rectangular block. Rows can have different lengths, which is called a jagged array, and rows may sit far apart in memory. <br>
• The JVM does a <b>bounds check on every access</b>, though the JIT removes it when the range is provable, which is called range check elimination. <br>
• <b>System.arraycopy and Arrays.copyOf are intrinsics.</b> They compile down to a fast memory move, so a manual copy loop is almost always slower. <br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• To choose the <b>right memory layout</b>, since a struct of arrays beats an array of structs for scanning one field. <br>
• To reason about <b>cache locality</b>, because row major traversal of a matrix can be several times faster than column major. <br>
• To use <b>Arrays.parallelSort, Arrays.fill and Arrays.setAll</b> instead of hand written loops. <br>
• To understand what <b>ArrayList, StringBuilder and HashMap</b> are doing internally when they grow. <br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• Large scale data processing lives or dies on array layout, and heap dumps in banking systems are dominated by arrays. <br>
• Interviewers ask about array covariance, ArrayStoreException and why generic arrays are illegal. <br>
• The difference between clone, System.arraycopy and a deep copy is a very common source of production bugs. <br>
• Understanding the growth factor of ArrayList explains why presizing a list matters in a hot path. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level: covariance, jagged arrays, cache order

import java.util.Arrays;

public class AdvancedArrayDemo {

    public static void main(String[] args) {

        // POINT 1: covariance is unsound and fails at run time, not compile time
        Object[] objects = new String[3];        // legal, arrays are covariant
        objects[0] = "SBI";                      // fine
        try {
            objects[1] = Integer.valueOf(42);    // WRONG, the real type is String[]
        } catch (ArrayStoreException e) {
            System.out.println("Covariance caused ArrayStoreException");
        }

        // RIGHT: generics are invariant, this would not even compile
        // List<Object> list = new ArrayList<String>();

        // POINT 1: jagged array, rows have different lengths
        int[][] semesterMarks = new int[3][];
        semesterMarks[0] = new int[]{78, 84};
        semesterMarks[1] = new int[]{55, 61, 48, 72};
        semesterMarks[2] = new int[]{90};
        for (int[] row : semesterMarks) {
            System.out.println("Row length " + row.length
                    + " values " + Arrays.toString(row));
        }

        // POINT 2: row major beats column major because of cache lines
        int n = 2000;
        int[][] matrix = new int[n][n];

        long start = System.nanoTime();
        long rowSum = 0;
        for (int r = 0; r < n; r++) {
            for (int c = 0; c < n; c++) {
                rowSum += matrix[r][c];          // RIGHT, sequential in memory
            }
        }
        long rowMs = (System.nanoTime() - start) / 1000000;

        start = System.nanoTime();
        long colSum = 0;
        for (int c = 0; c < n; c++) {
            for (int r = 0; r < n; r++) {
                colSum += matrix[r][c];          // WRONG for cache, jumps a row
            }
        }
        long colMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Row major  sum " + rowSum
                + " in about " + rowMs + " ms");
        System.out.println("Col major  sum " + colSum
                + " in about " + colMs + " ms");

        // POINT 3: intrinsics beat hand written copy loops
        int[] source = new int[5000000];
        Arrays.setAll(source, i -> i);

        start = System.nanoTime();
        int[] manual = new int[source.length];
        for (int i = 0; i < source.length; i++) manual[i] = source[i];
        long manualMs = (System.nanoTime() - start) / 1000000;

        start = System.nanoTime();
        int[] fast = new int[source.length];
        System.arraycopy(source, 0, fast, 0, source.length);
        long fastMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Manual copy    about " + manualMs + " ms");
        System.out.println("System.arraycopy about " + fastMs + " ms");
        System.out.println("Copies match: " + Arrays.equals(manual, fast));
    }
}
// OUTPUT (timings vary):
// Covariance caused ArrayStoreException
// Row length 2 values [78, 84]
// Row length 4 values [55, 61, 48, 72]
// Row length 1 values [90]
// Row major  sum 0 in about 6 ms
// Col major  sum 0 in about 35 ms
// Manual copy    about 9 ms
// System.arraycopy about 3 ms
// Copies match: true`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Densest possible layout.</b> A primitive array is the only structure with zero per element overhead, which matters at hundreds of millions of rows. <br>
• <b>Vectorisation.</b> HotSpot can turn a simple loop over an int or double array into SIMD instructions that process several elements per cycle. <br>
• <b>Arrays.parallelSort</b> uses ForkJoin merge sort and beats a single threaded sort on large inputs. <br>
• <b>Predictable GC behaviour.</b> One large array is one object for the collector, unlike a million boxed elements. <br>
• <b>Direct interop.</b> Byte arrays map straight onto network buffers, files and ByteBuffer without conversion. <br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>Covariance breaks type safety</b> and forces a store check on every write into an object array. <br>
• <b>Generic arrays are impossible</b> because of erasure, so libraries fall back on Object arrays and unchecked casts. <br>
• <b>Resizing is O of n</b> and creates garbage, which is why ArrayList growth should be presized. <br>
• <b>A huge array needs contiguous space,</b> so a large allocation can fail or trigger a full GC even when total free memory looks fine. <br>
• <b>Arrays inherit equals and hashCode from Object,</b> so putting an array in a HashSet almost never behaves the way people expect. <br>
• <b>Arrays.asList is fixed size and backed by the array,</b> so add throws and changing one changes the other. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: presizing, asList backing and array identity

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ArrayInternalsDemo {

    public static void main(String[] args) {

        int n = 3000000;

        // DISADVANTAGE 5: default ArrayList grows by copying (about 1.5 times)
        long start = System.nanoTime();
        List<Integer> grows = new ArrayList<>();
        for (int i = 0; i < n; i++) grows.add(i);
        long growMs = (System.nanoTime() - start) / 1000000;

        // RIGHT: presize when the count is known
        start = System.nanoTime();
        List<Integer> presized = new ArrayList<>(n);
        for (int i = 0; i < n; i++) presized.add(i);
        long presizeMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Default growth  about " + growMs + " ms");
        System.out.println("Presized        about " + presizeMs + " ms");

        // DISADVANTAGE 5: Arrays.asList is a fixed size view over the same array
        String[] backing = {"UPI", "IMPS", "NEFT"};
        List<String> view = Arrays.asList(backing);
        backing[0] = "RTGS";
        System.out.println("View reflects the array change: " + view);
        try {
            view.add("CARD");                    // WRONG, fixed size
        } catch (UnsupportedOperationException e) {
            System.out.println("Arrays.asList refused add, it is fixed size");
        }

        // RIGHT: a real independent list
        List<String> real = new ArrayList<>(Arrays.asList(backing));
        real.add("CARD");
        System.out.println("Independent copy: " + real);

        // DISADVANTAGE 5: arrays use identity equals and hashCode
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        Set<int[]> set = new HashSet<>();
        set.add(a);
        System.out.println("WRONG set.contains(b): " + set.contains(b));
        System.out.println("RIGHT Arrays.equals  : " + Arrays.equals(a, b));

        // RIGHT: wrap in a List when you need value semantics
        Set<List<Integer>> valueSet = new HashSet<>();
        valueSet.add(List.of(1, 2, 3));
        System.out.println("List based contains  : "
                + valueSet.contains(List.of(1, 2, 3)));

        // ADVANTAGE 4: parallelSort on a big array
        int[] big = new int[5000000];
        Arrays.setAll(big, i -> (i * 31) % 1000003);
        start = System.nanoTime();
        Arrays.parallelSort(big);
        long sortMs = (System.nanoTime() - start) / 1000000;
        System.out.println("parallelSort of 5 million in about "
                + sortMs + " ms");
        System.out.println("First and last: " + big[0]
                + " and " + big[big.length - 1]);

        // DISADVANTAGE 5: nested array deep comparison needs deepEquals
        int[][] m1 = {{1, 2}, {3, 4}};
        int[][] m2 = {{1, 2}, {3, 4}};
        System.out.println("Arrays.equals on 2D    : " + Arrays.equals(m1, m2));
        System.out.println("Arrays.deepEquals on 2D: " + Arrays.deepEquals(m1, m2));
    }
}
// OUTPUT (timings vary):
// Default growth  about 130 ms
// Presized        about 70 ms
// View reflects the array change: [RTGS, IMPS, NEFT]
// Arrays.asList refused add, it is fixed size
// Independent copy: [RTGS, IMPS, NEFT, CARD]
// WRONG set.contains(b): false
// RIGHT Arrays.equals  : true
// List based contains  : true
// parallelSort of 5 million in about 180 ms
// First and last: 0 and 1000002
// Arrays.equals on 2D    : false
// Arrays.deepEquals on 2D: true`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>Market data tick store:</b> parallel primitive arrays for timestamp, price and volume rather than one array of objects, which cut a heap from thirty gigabytes to four. <br>
• <b>Telecom CDR rating:</b> a long array of call durations processed with a vectorisable loop, giving several million records per second per core. <br>
• <b>Netty and Kafka:</b> byte arrays and direct ByteBuffers reused from a pool so the network path allocates nothing per message. <br>
• <b>Aadhaar biometric matching:</b> fixed size feature arrays compared with a tight loop, where range check elimination is what makes it fast enough. <br>
• <b>Core banking end of day:</b> Arrays.parallelSort on a settlement array, sorted once and then binary searched instead of re scanning. <br>
• <b>Global example, image and video pipelines:</b> pixel data in a flat int array with manual index maths, since a two dimensional array would scatter the rows. <br><br>

<b>Interview answers to keep ready</b><br>
• Why are arrays covariant but generics invariant? Arrays predate generics and needed to work with pre generic APIs. The price is ArrayStoreException. <br>
• Why can you not create a generic array? Erasure means the array cannot perform its store check, so the compiler forbids it. <br>
• Which is faster, a two dimensional array or a flat array? A flat array, because it is one contiguous block with no row pointer chase. <br>
• How does ArrayList grow? A new array is allocated at about 1.5 times the old capacity and the contents are copied with System.arraycopy. <br>`,
                                codeExamples: [
                                    `// Point 6 at expert level: struct of arrays and a flat matrix for a tick store

import java.util.Arrays;

public class TickStoreLayoutDemo {

    // WRONG at scale: array of objects, one header plus one reference per tick
    static class TickObject {
        long timestamp;
        int pricePaise;
        int volume;
        TickObject(long t, int p, int v) { timestamp = t; pricePaise = p; volume = v; }
    }

    // RIGHT at scale: struct of arrays, three flat primitive blocks
    static class TickColumns {
        final long[] timestamps;
        final int[] pricesPaise;
        final int[] volumes;
        int size = 0;

        TickColumns(int capacity) {
            timestamps = new long[capacity];
            pricesPaise = new int[capacity];
            volumes = new int[capacity];
        }

        void add(long t, int p, int v) {
            timestamps[size] = t;
            pricesPaise[size] = p;
            volumes[size] = v;
            size++;
        }

        // scanning one column touches only the memory it needs
        long vwapPaise() {
            long valueSum = 0, volumeSum = 0;
            for (int i = 0; i < size; i++) {
                valueSum += (long) pricesPaise[i] * volumes[i];
                volumeSum += volumes[i];
            }
            return volumeSum == 0 ? 0 : valueSum / volumeSum;
        }
    }

    // RIGHT for matrices: one flat array with manual index maths
    static class FlatMatrix {
        final int rows, cols;
        final double[] cells;

        FlatMatrix(int rows, int cols) {
            this.rows = rows;
            this.cols = cols;
            this.cells = new double[rows * cols];
        }

        double get(int r, int c) { return cells[r * cols + c]; }
        void set(int r, int c, double v) { cells[r * cols + c] = v; }
    }

    public static void main(String[] args) {

        int count = 1000000;

        TickColumns columns = new TickColumns(count);
        long base = 1725500000000L;
        for (int i = 0; i < count; i++) {
            columns.add(base + i, 250000 + (i % 500), 10 + (i % 90));
        }

        long start = System.nanoTime();
        long vwap = columns.vwapPaise();
        long columnMs = (System.nanoTime() - start) / 1000000;
        System.out.println("VWAP paise " + vwap + " computed in about " + columnMs + " ms");
        System.out.println("Approx bytes for 3 columns: "
                + ((8L + 4L + 4L) * count) + " with no per row object header");

        // object layout for comparison, one object per tick
        TickObject[] objects = new TickObject[10];
        for (int i = 0; i < objects.length; i++) {
            objects[i] = new TickObject(base + i, 250000 + i, 10 + i);
        }
        System.out.println("Object layout adds a header and a reference per tick, "
                + objects.length + " objects here");

        FlatMatrix m = new FlatMatrix(3, 4);
        m.set(0, 0, 1.5);
        m.set(2, 3, 9.25);
        System.out.println("Flat matrix cell 0,0 = " + m.get(0, 0));
        System.out.println("Flat matrix cell 2,3 = " + m.get(2, 3));
        System.out.println("Backing block length = " + m.cells.length);
        System.out.println("First row raw = " + Arrays.toString(
                Arrays.copyOfRange(m.cells, 0, m.cols)));
    }
}
// OUTPUT (timing varies):
// VWAP paise 250249 computed in about 4 ms
// Approx bytes for 3 columns: 16000000 with no per row object header
// Object layout adds a header and a reference per tick, 10 objects here
// Flat matrix cell 0,0 = 1.5
// Flat matrix cell 2,3 = 9.25
// Backing block length = 12
// First row raw = [1.5, 0.0, 0.0, 0.0]`
                                ]
                            }
                        ]
};
