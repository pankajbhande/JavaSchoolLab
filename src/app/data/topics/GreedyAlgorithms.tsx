import { Topic } from '../coreJava';

export const greedyAlgorithms: Topic = {
    id: 'greedy-algorithms',
    name: 'Greedy Algorithms',
    beginner: [
        {
            content: `A Greedy Algorithm builds up a solution piece by piece, always choosing the option that looks
<strong>best right now</strong> (locally optimal), hoping this leads to the overall best (globally
optimal) solution. <br><br>
Greedy algorithms are simple and fast, but they do <strong>not always</strong> produce the correct/optimal
answer - that only happens when the problem has a special structure ("greedy choice property"). <br><br>
Classic examples: Coin Change (with standard currency), Activity Selection, and Minimum Spanning Tree
algorithms like Prim's/Kruskal's.`
        },
        {
            content: `<h3>1. Coin Change (Greedy Version)</h3>
Given coin denominations, find the minimum number of coins to make a target amount by always picking the
largest coin that fits.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class GreedyCoinChange {

    static List<Integer> makeChange(int[] coins, int amount) {
        List<Integer> result = new ArrayList<>();

        for (int i = coins.length - 1; i >= 0; i--) { // coins sorted ascending, go largest first
            while (amount >= coins[i]) {
                amount -= coins[i];
                result.add(coins[i]); // greedy pick: largest coin that fits
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] coins = {1, 5, 10, 25}; // standard US-style coin denominations
        int amount = 63;

        List<Integer> change = makeChange(coins, amount);
        System.out.println("Coins used: " + change);
        System.out.println("Total coins: " + change.size());
    }
}
// OUTPUT:
// Coins used: [25, 25, 10, 1, 1, 1]
// Total coins: 6`]
        },
        {
            content: `<h3>2. Activity Selection Problem</h3>
Given start/end times of activities, select the maximum number of non-overlapping activities. The greedy
strategy: always pick the activity that finishes earliest among the remaining valid options.`,
            codeExamples: [`import java.util.Arrays;
import java.util.Comparator;

public class ActivitySelectionDemo {

    static class Activity {
        int start, end;
        Activity(int s, int e) { start = s; end = e; }
    }

    static int selectActivities(Activity[] activities) {
        Arrays.sort(activities, Comparator.comparingInt(a -> a.end)); // sort by finish time

        int count = 1;
        int lastEnd = activities[0].end;
        System.out.println("Selected: (" + activities[0].start + "," + activities[0].end + ")");

        for (int i = 1; i < activities.length; i++) {
            if (activities[i].start >= lastEnd) { // no overlap with last selected
                count++;
                lastEnd = activities[i].end;
                System.out.println("Selected: (" + activities[i].start + "," + activities[i].end + ")");
            }
        }
        return count;
    }

    public static void main(String[] args) {
        Activity[] activities = {
            new Activity(1, 4), new Activity(3, 5), new Activity(0, 6),
            new Activity(5, 7), new Activity(8, 9)
        };

        int total = selectActivities(activities);
        System.out.println("Max activities: " + total);
    }
}
// OUTPUT:
// Selected: (1,4)
// Selected: (5,7)
// Selected: (8,9)
// Max activities: 3`]
        }
    ],

    expert: [
        {
            content: `<h3>When Greedy Fails: Coin Change With a Non-Standard Set</h3>
The greedy "pick largest coin first" strategy only works for well-behaved (canonical) coin systems like
{1, 5, 10, 25}. With arbitrary denominations, greedy can give a <strong>wrong (non-optimal)</strong>
answer.`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class GreedyFailsDemo {

    static List<Integer> greedyChange(int[] coins, int amount) {
        List<Integer> result = new ArrayList<>();
        for (int i = coins.length - 1; i >= 0; i--) {
            while (amount >= coins[i]) {
                amount -= coins[i];
                result.add(coins[i]);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] coins = {1, 3, 4}; // non-canonical denominations
        int amount = 6;

        List<Integer> greedyResult = greedyChange(coins, amount);
        System.out.println("Greedy picks: " + greedyResult + " (" + greedyResult.size() + " coins)");
        System.out.println("Optimal would be: [3, 3] (2 coins) - greedy picks 4 first and gets stuck with 1+1");
    }
}
// OUTPUT:
// Greedy picks: [4, 1, 1] (3 coins)
// Optimal would be: [3, 3] (2 coins) - greedy picks 4 first and gets stuck with 1+1`]
        },
        {
            content: `<h3>Fractional Knapsack (Greedy Works Here)</h3>
Unlike 0/1 Knapsack (which needs Dynamic Programming), the Fractional Knapsack allows taking a fraction
of an item, and here the greedy strategy - always take the item with highest value/weight ratio first -
is provably optimal.`,
            codeExamples: [`import java.util.Arrays;
import java.util.Comparator;

public class FractionalKnapsackDemo {

    static class Item {
        int value, weight;
        Item(int v, int w) { value = v; weight = w; }
    }

    static double maxValue(Item[] items, int capacity) {
        Arrays.sort(items, Comparator.comparingDouble((Item i) -> (double) i.value / i.weight).reversed());

        double totalValue = 0;
        int remaining = capacity;

        for (Item item : items) {
            if (remaining <= 0) break;

            if (item.weight <= remaining) {
                totalValue += item.value;      // take whole item
                remaining -= item.weight;
            } else {
                double fraction = (double) remaining / item.weight;
                totalValue += item.value * fraction; // take a fraction
                remaining = 0;
            }
        }
        return totalValue;
    }

    public static void main(String[] args) {
        Item[] items = { new Item(60, 10), new Item(100, 20), new Item(120, 30) };
        int capacity = 50;

        System.out.println("Max value: " + maxValue(items, capacity));
    }
}
// OUTPUT:
// Max value: 240.0`]
        },
        {
            content: `<h3>Greedy vs Dynamic Programming</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Greedy</th><th>Dynamic Programming</th></tr>
<tr class='text-center'><td>Decision making</td><td>Locally optimal choice, never revisited</td><td>Explores/combines all sub-problem results</td></tr>
<tr class='text-center'><td>Guarantees global optimum?</td><td>Only for problems with the greedy-choice property</td><td>Yes, if the recurrence and base cases are correct</td></tr>
<tr class='text-center'><td>Speed</td><td>Usually faster, O(n log n) or O(n)</td><td>Usually slower, O(n²) or more</td></tr>
<tr class='text-center'><td>Example where each wins</td><td>Activity Selection, Fractional Knapsack</td><td>0/1 Knapsack, Coin Change (general denominations)</td></tr>
</table>`
        },
        {
            content: `<h3>How to Recognize a Greedy-Friendly Problem</h3>
A problem is safe for a greedy approach only if it has both: <br>
• <strong>Greedy choice property</strong> - a locally optimal choice leads toward a globally optimal
solution. <br>
• <strong>Optimal substructure</strong> - an optimal solution to the problem contains optimal solutions
to its sub-problems. <br><br>
If you cannot prove the greedy choice property holds, do not trust a greedy solution - verify it against
brute force on small inputs, or use Dynamic Programming instead.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a Greedy Algorithm?</td><td>An algorithm that makes the locally optimal choice at each step, hoping it leads to a global optimum</td></tr>
<tr><td>Does greedy always give the optimal solution?</td><td>No - only for problems having the greedy-choice property and optimal substructure</td></tr>
<tr><td>Give an example where greedy Coin Change fails.</td><td>Denominations {1, 3, 4} for amount 6 - greedy gives [4,1,1] (3 coins) instead of the optimal [3,3] (2 coins)</td></tr>
<tr><td>Is Fractional Knapsack solvable by greedy?</td><td>Yes - sorting by value/weight ratio and taking greedily is provably optimal</td></tr>
<tr><td>Is 0/1 Knapsack solvable by greedy?</td><td>No - it requires Dynamic Programming since items cannot be split</td></tr>
<tr><td>What is the time complexity of the Activity Selection greedy algorithm?</td><td>O(n log n), dominated by sorting activities by finish time</td></tr>
<tr><td>Name two more classic greedy algorithms.</td><td>Kruskal's/Prim's Minimum Spanning Tree, Dijkstra's Shortest Path, Huffman Coding</td></tr>
</table>`
        }
    ]
};
