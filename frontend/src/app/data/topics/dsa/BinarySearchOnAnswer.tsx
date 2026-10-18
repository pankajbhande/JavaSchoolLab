import { Topic } from '../../coreJava';

export const binarySearchOnAnswer: Topic = {
    id: 'dsa-searching-binary-search-on-answer',
    name: 'Binary Search on Answer',
    beginner: [
        {
            content: `<h4>Binary Searching Over the ANSWER, Not the Array</h4>
A powerful pattern: instead of searching for a value INSIDE an array, binary search over the RANGE OF POSSIBLE ANSWERS to a question, using a "can this candidate answer work?" check function. It applies whenever the answer space is MONOTONIC - if candidate X works, every candidate &ge; X also works (or vice versa).`,
            codeExamples: [
                `package com.javaschoollab;

public class KokoEatingBananasDemo {

    // Koko can eat at most 'speed' bananas/hour from ANY single pile per hour.
    // Find the MINIMUM integer speed that lets her finish all piles within 'hours'.
    static int minEatingSpeed(int[] piles, int hours) {
        int low = 1, high = maxPile(piles);

        while (low < high) {
            int mid = low + (high - low) / 2;
            if (canFinish(piles, mid, hours)) {
                high = mid;      // mid WORKS - try an even smaller (slower) speed
            } else {
                low = mid + 1;   // mid too slow - need to go faster
            }
        }
        return low;
    }

    static boolean canFinish(int[] piles, int speed, int hours) {
        int totalHours = 0;
        for (int pile : piles) {
            totalHours += (pile + speed - 1) / speed;   // ceiling division
        }
        return totalHours <= hours;
    }

    static int maxPile(int[] piles) {
        int max = 0;
        for (int p : piles) max = Math.max(max, p);
        return max;
    }

    public static void main(String[] args) {
        int[] piles = {3, 6, 7, 11};
        System.out.println(minEatingSpeed(piles, 8));
    }
}
// OUTPUT:
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Works - the Monotonicity Requirement</h3>
Binary search on answer is valid ONLY because "can Koko finish at speed X" is monotonic: if speed X works, every FASTER speed also works (more speed never hurts). This monotonic "yes...yes...yes...no...no" (or the reverse) shape is exactly what lets binary search discard half the candidate range at each step - the same requirement as regular binary search on a sorted array, just applied to a range of possible answers instead of array indices.`,
            codeExamples: [
                `package com.javaschoollab;

public class ShipCapacityDemo {

    // Find the minimum ship capacity to deliver all packages within 'days',
    // shipping them in order without splitting a package - another
    // classic binary-search-on-answer problem.
    static int shipWithinDays(int[] weights, int days) {
        int low = maxWeight(weights);      // capacity must fit the heaviest single package
        int high = sum(weights);           // worst case: ship everything in one day

        while (low < high) {
            int mid = low + (high - low) / 2;
            if (daysNeeded(weights, mid) <= days) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return low;
    }

    static int daysNeeded(int[] weights, int capacity) {
        int days = 1, currentLoad = 0;
        for (int w : weights) {
            if (currentLoad + w > capacity) {
                days++;
                currentLoad = 0;
            }
            currentLoad += w;
        }
        return days;
    }

    static int maxWeight(int[] weights) {
        int max = 0;
        for (int w : weights) max = Math.max(max, w);
        return max;
    }

    static int sum(int[] weights) {
        int total = 0;
        for (int w : weights) total += w;
        return total;
    }

    public static void main(String[] args) {
        int[] weights = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        System.out.println(shipWithinDays(weights, 5));
    }
}
// OUTPUT:
// 15`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you recognize a "binary search on answer" problem?</td><td>Look for phrases like "minimum X such that Y is possible" or "maximum X such that Y is possible" combined with a feasibility check that gets easier as X increases (or harder) - a monotonic yes/no boundary</td></tr>
<tr class='text-center'><td>What are the two pieces every binary-search-on-answer solution needs?</td><td>1) A valid range [low, high] bounding all possible answers, and 2) a canDo(candidate) feasibility function that's monotonic across that range</td></tr>
<tr class='text-center'><td>What's the time complexity, generally?</td><td>O(log(range) &times; cost of the feasibility check) - e.g. Koko's problem is O(log(maxPile) &times; n) since each feasibility check scans all piles once</td></tr>
</table>`
        }
    ]
};
