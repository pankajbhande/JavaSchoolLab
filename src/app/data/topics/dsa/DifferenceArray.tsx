import { Topic } from '../../coreJava';

export const differenceArray: Topic = {
    id: 'dsa-arrays-difference-array',
    name: 'Difference Array',
    beginner: [
        {
            content: `<h4>What is a Difference Array?</h4>
A difference array is the inverse trick of a prefix sum: it makes <b>range updates</b> O(1) instead of O(range length). Given <code>diff[i] = arr[i] - arr[i-1]</code>, to add <code>val</code> to every element in <code>[l, r]</code>:
<ul>
<li><code>diff[l] += val</code></li>
<li><code>diff[r + 1] -= val</code> (if <code>r + 1</code> is within bounds)</li>
</ul>
After all updates are applied, take the <b>prefix sum of diff</b> to recover the final array - each range update was O(1), and the one final reconstruction pass is O(n).`,
            codeExamples: [
                `package com.javaschoollab;

public class DifferenceArrayDemo {

    public static void main(String[] args) {
        int n = 6;
        int[] diff = new int[n + 1];   // one extra slot to safely do r+1

        // Apply "add 3 to range [1, 3]"
        applyRangeUpdate(diff, 1, 3, 3);
        // Apply "add 2 to range [2, 5]"
        applyRangeUpdate(diff, 2, 5, 2);

        int[] result = new int[n];
        result[0] = diff[0];
        for (int i = 1; i < n; i++) {
            result[i] = result[i - 1] + diff[i]; // reconstruct via prefix sum
        }

        System.out.println(java.util.Arrays.toString(result));
    }

    static void applyRangeUpdate(int[] diff, int l, int r, int val) {
        diff[l] += val;
        diff[r + 1] -= val;
    }
}
// OUTPUT:
// [0, 3, 5, 5, 2, 2]
// index0=0, index1=3, index2=3+2=5, index3=5, index4=2, index5=2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Difference Array Beats Naive Range Updates</h3>
Naively adding <code>val</code> to every element in <code>[l, r]</code> is O(r - l + 1) per update - with Q updates over a range of size n, worst case O(Q&middot;n). A difference array makes EVERY update O(1), and reconstructs the final array with a single O(n) prefix-sum pass at the end - total O(Q + n) instead of O(Q&middot;n).<br><br>
The trade-off: difference array only helps when you apply ALL updates first and THEN read the final array. If you need to read intermediate states between updates, you need a Segment Tree with lazy propagation instead.`,
            codeExamples: [
                `package com.javaschoollab;

// A common real interview problem: "Corporate Flight Bookings"
// bookings[i] = {first, last, seats} means add 'seats' seats to every
// flight number from first to last (1-indexed), for all bookings.
// Return the total seats booked on each flight.

public class FlightBookingsDemo {

    static int[] corpFlightBookings(int[][] bookings, int n) {
        int[] diff = new int[n + 1];   // 1-indexed flights, so size n+1

        for (int[] b : bookings) {
            int first = b[0], last = b[1], seats = b[2];
            diff[first - 1] += seats;         // convert to 0-indexed
            if (last < n) diff[last] -= seats;
        }

        int[] answer = new int[n];
        answer[0] = diff[0];
        for (int i = 1; i < n; i++) {
            answer[i] = answer[i - 1] + diff[i];
        }
        return answer;
    }

    public static void main(String[] args) {
        int[][] bookings = {{1, 2, 10}, {2, 3, 20}, {2, 5, 25}};
        System.out.println(java.util.Arrays.toString(corpFlightBookings(bookings, 5)));
    }
}
// OUTPUT:
// [10, 55, 45, 25, 25]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does a difference array solve that a plain array doesn't?</td><td>Applying many range-add updates efficiently - each update becomes O(1) instead of O(range size)</td></tr>
<tr class='text-center'><td>How do you get the final array back from a difference array?</td><td>Take its prefix sum - diff[i] accumulated left to right reconstructs the actual values</td></tr>
<tr class='text-center'><td>What if you need to query the array's state BETWEEN updates?</td><td>A plain difference array can't do that - use a Segment Tree with lazy propagation for range updates plus arbitrary-time range queries</td></tr>
</table>`
        }
    ]
};
