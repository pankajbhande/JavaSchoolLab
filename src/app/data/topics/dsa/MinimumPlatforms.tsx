import { Topic } from '../../coreJava';

export const minimumPlatforms: Topic = {
    id: 'dsa-greedy-minimum-platforms',
    name: 'Minimum Platforms',
    beginner: [
        {
            content: `<h4>How Many Platforms Does a Railway Station Need?</h4>
Given trains' arrival and departure times, find the MINIMUM number of platforms needed so no two overlapping trains ever need the same platform. Greedy approach: sort arrivals and departures SEPARATELY, then sweep through in time order - a platform is needed whenever an arrival happens, freed whenever a departure happens (using two pointers).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.Arrays;

public class MinimumPlatformsDemo {

    static int findMinPlatforms(int[] arrivals, int[] departures) {
        Arrays.sort(arrivals);
        Arrays.sort(departures);

        int platformsNeeded = 0, maxPlatforms = 0;
        int i = 0, j = 0;

        while (i < arrivals.length && j < departures.length) {
            if (arrivals[i] <= departures[j]) {
                platformsNeeded++;      // a new train arrives - needs a platform
                maxPlatforms = Math.max(maxPlatforms, platformsNeeded);
                i++;
            } else {
                platformsNeeded--;      // a train departs - frees a platform
                j++;
            }
        }
        return maxPlatforms;
    }

    public static void main(String[] args) {
        int[] arrivals   = {900, 940, 950, 1100, 1500, 1800};
        int[] departures = {910, 1200, 1120, 1130, 1900, 2000};
        System.out.println(findMinPlatforms(arrivals, departures));
    }
}
// OUTPUT:
// 3`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This is Equivalent to "Maximum Overlapping Intervals"</h3>
The minimum platforms needed exactly equals the MAXIMUM number of trains simultaneously present at any single moment - the two-pointer sweep is a clever O(n log n) way to find that peak overlap without checking every possible time instant. This same technique (separately sorted "events" sweep) generalizes to any "max concurrent X" problem: meeting rooms needed, max simultaneous users online, peak concurrent downloads.`,
            codeExamples: [
                `package com.javaschoollab;

public class WhySweepFindsPeakDemo {
    public static void main(String[] args) {
        System.out.println("The sweep processes arrival/departure EVENTS in chronological order.");
        System.out.println("At each arrival event, platformsNeeded increases by 1 (a train is now present).");
        System.out.println("At each departure event, it decreases by 1 (a train has left).");
        System.out.println();
        System.out.println("Tracking the RUNNING MAXIMUM of platformsNeeded across this sweep");
        System.out.println("gives exactly the peak number of trains present at any single moment -");
        System.out.println("which is precisely the minimum platform count required.");
        System.out.println();
        System.out.println("Tie-breaking rule: 'arrivals[i] <= departures[j]' processes an arrival");
        System.out.println("BEFORE a departure at the same timestamp - a train departing exactly when");
        System.out.println("another arrives still needs its OWN platform for that instant, per convention.");
    }
}
// OUTPUT:
// The sweep processes arrival/departure EVENTS in chronological order.
// At each arrival event, platformsNeeded increases by 1 (a train is now present).
// At each departure event, it decreases by 1 (a train has left).
//
// Tracking the RUNNING MAXIMUM of platformsNeeded across this sweep
// gives exactly the peak number of trains present at any single moment -
// which is precisely the minimum platform count required.
//
// Tie-breaking rule: 'arrivals[i] <= departures[j]' processes an arrival
// BEFORE a departure at the same timestamp - a train departing exactly when
// another arrives still needs its OWN platform for that instant, per convention.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the time complexity of the two-pointer sweep approach?</td><td>O(n log n) - dominated by sorting arrivals and departures separately; the sweep itself is O(n)</td></tr>
<tr class='text-center'><td>How would you solve this with a min-heap instead of the two-pointer sweep?</td><td>Sort trains by arrival time; for each new arrival, check if the heap's earliest departure is <= this arrival's time - if so, reuse that platform (pop and push); otherwise allocate a new platform (just push) - the heap's final size is the answer</td></tr>
<tr class='text-center'><td>What's the exact relationship to "Meeting Rooms II" (a common LeetCode framing)?</td><td>They're the identical problem with different vocabulary - trains/platforms map directly to meetings/rooms, and both reduce to "find the maximum number of simultaneously active intervals"</td></tr>
</table>`
        }
    ]
};
