"""Harder practice questions (second and third per topic). Merged into PRACTICE by _practice.py.
Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, practice  # noqa: E402

MORE = {}

MORE['arraylist'] = [
    practice(
        'Trek seat manager with a waiting list',
        'A trek has only <strong>4 seats</strong>. Booking requests and cancellations arrive as text commands. When a confirmed trekker cancels, the <strong>first person on the waiting list</strong> must get the seat automatically.',
        ['Keep two <code>ArrayList&lt;String&gt;</code>: <code>confirmed</code> and <code>waiting</code>.',
         'Process the commands <code>BOOK name</code> and <code>CANCEL name</code> in order.',
         'A booking goes to <code>confirmed</code> if a seat is free, otherwise to the end of <code>waiting</code>.',
         'A cancellation removes the person from whichever list holds them; if a confirmed seat opened up, promote <code>waiting.remove(0)</code>.',
         'Print a line for every command and the final two lists.'],
        r'''// Practice: seat manager with a waiting list (two ArrayLists)
import java.util.ArrayList;
import java.util.List;

public class SeatManager {
    static final int SEATS = 4;

    public static void main(String[] args) {
        String[] commands = {
            "BOOK Pune", "BOOK Mumbai", "BOOK Nashik", "BOOK Nagpur", "BOOK Kolhapur", "BOOK Satara",
            "CANCEL Mumbai", "CANCEL Satara", "BOOK Thane", "CANCEL Pune", "CANCEL Delhi"};

        List<String> confirmed = new ArrayList<>();
        List<String> waiting = new ArrayList<>();

        for (String command : commands) {
            String[] parts = command.split(" ");
            String name = parts[1];
            if (parts[0].equals("BOOK")) {
                if (confirmed.size() < SEATS) {
                    confirmed.add(name);
                    System.out.println(command + " -> seat confirmed");
                } else {
                    waiting.add(name);
                    System.out.println(command + " -> waiting list position " + waiting.size());
                }
            } else if (confirmed.remove(name)) {                     // remove(Object) returns true if found
                String message = command + " -> seat released";
                if (!waiting.isEmpty()) {
                    String promoted = waiting.remove(0);             // first come, first served
                    confirmed.add(promoted);
                    message += ", " + promoted + " promoted from the waiting list";
                }
                System.out.println(message);
            } else if (waiting.remove(name)) {
                System.out.println(command + " -> removed from the waiting list");
            } else {
                System.out.println(command + " -> nobody with that name");
            }
        }
        System.out.println("Confirmed: " + confirmed);
        System.out.println("Waiting  : " + waiting);
    }
}
''' + OUT,
        level='Hard',
        hints=['<code>List.remove(Object)</code> returns a <code>boolean</code>: use it to test and remove in one step.',
               '<code>waiting.remove(0)</code> removes by <em>index</em> and returns the element.']),
]

MORE['linkedlist'] = [
    practice(
        'Round-robin guide scheduler',
        'Three groups need a guide for different numbers of hours. The guide serves each group <strong>2 hours at a time</strong>, then the group goes to the back of the line if it still needs more time. Find the order in which groups finish.',
        ['Store each group as a small record (name, hours left) in a <code>LinkedList</code> used as a queue.',
         'Repeat: <code>poll()</code> the first group, give it <code>min(2, hoursLeft)</code> hours, and <code>add()</code> it to the back if hours remain.',
         'Print each turn, and the finish order with the clock time at which each group finished.'],
        r'''// Practice: round-robin scheduling with a LinkedList queue
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class GuideScheduler {
    record Group(String name, int hoursLeft) { }

    public static void main(String[] args) {
        LinkedList<Group> queue = new LinkedList<>();
        queue.add(new Group("Pune group", 5));
        queue.add(new Group("Nashik group", 2));
        queue.add(new Group("Nagpur group", 7));

        final int SLICE = 2;
        int clock = 0;
        List<String> finished = new ArrayList<>();

        while (!queue.isEmpty()) {
            Group g = queue.poll();                                  // next group in line
            int used = Math.min(SLICE, g.hoursLeft());
            clock += used;
            int left = g.hoursLeft() - used;
            System.out.println("t=" + clock + "h: " + g.name() + " got " + used + "h, left " + left);
            if (left > 0) {
                queue.add(new Group(g.name(), left));                // back of the line
            } else {
                finished.add(g.name() + " (at " + clock + "h)");
            }
        }
        System.out.println("Finish order: " + finished);
    }
}
''' + OUT,
        level='Hard',
        hints=['<code>poll()</code> takes from the front, <code>add()</code> adds to the back: that is a queue.',
               'A <code>record</code> is immutable: create a new one with the reduced hours.']),
]

MORE['vector'] = [
    practice(
        'Thread-safe leaderboard',
        'Three judges enter scores for the same contest at the same time into <strong>one shared <code>Vector</code></strong>. After all judges finish, print the <strong>top 3 scores</strong>, the total and the average.',
        ['Start 3 threads; each adds 5 scores (use <code>judgeNumber * 10 + i</code> so the result is predictable).',
         'Wait for all threads with <code>join()</code>.',
         'Sort the vector in descending order and print the top 3, the number of scores, the sum and the average.'],
        r'''// Practice: a shared Vector filled by three threads
import java.util.Collections;
import java.util.Vector;

public class SharedLeaderboard {
    public static void main(String[] args) throws InterruptedException {
        Vector<Integer> scores = new Vector<>();

        Thread[] judges = new Thread[3];
        for (int j = 0; j < judges.length; j++) {
            final int judge = j + 1;
            judges[j] = new Thread(() -> {
                for (int i = 1; i <= 5; i++) {
                    scores.add(judge * 10 + i);                      // synchronized add
                }
            });
            judges[j].start();
        }
        for (Thread t : judges) {
            t.join();
        }

        Collections.sort(scores, Collections.reverseOrder());        // highest first
        int sum = 0;
        for (int s : scores) {
            sum += s;
        }
        System.out.println("Scores entered: " + scores.size());
        System.out.println("Top 3         : " + scores.subList(0, 3));
        System.out.println("Sum / average : " + sum + " / " + (double) sum / scores.size());
    }
}
''' + OUT,
        level='Medium',
        hints=['Do the sorting <em>after</em> <code>join()</code>, when no thread is writing any more.']),
]

MORE['stack'] = [
    practice(
        'Infix expression calculator (two stacks)',
        'Evaluate expressions such as <code>2 + 3 * (4 - 1)</code> with <code>+ - * /</code> and brackets, respecting the normal operator priority, using <strong>one stack for numbers and one for operators</strong>.',
        ['Read the expression character by character; build multi-digit numbers.',
         '<code>(</code> goes on the operator stack; <code>)</code> evaluates until the matching <code>(</code>.',
         'Before pushing an operator, evaluate every operator on top that has the <strong>same or higher priority</strong>.',
         'At the end, evaluate what is left. Test with 3 expressions.'],
        r'''// Practice: evaluating infix expressions with two Stacks
import java.util.Stack;

public class InfixCalculator {
    static int priority(char op) {
        return (op == '+' || op == '-') ? 1 : 2;                     // * and / bind tighter
    }

    static void apply(Stack<Integer> numbers, Stack<Character> ops) {
        int b = numbers.pop();                                       // right operand is on top
        int a = numbers.pop();
        char op = ops.pop();
        numbers.push(switch (op) {
            case '+' -> a + b;
            case '-' -> a - b;
            case '*' -> a * b;
            default -> a / b;
        });
    }

    static int evaluate(String text) {
        Stack<Integer> numbers = new Stack<>();
        Stack<Character> ops = new Stack<>();
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch == ' ') {
                continue;
            }
            if (Character.isDigit(ch)) {
                int value = 0;
                while (i < text.length() && Character.isDigit(text.charAt(i))) {
                    value = value * 10 + (text.charAt(i++) - '0');
                }
                i--;
                numbers.push(value);
            } else if (ch == '(') {
                ops.push(ch);
            } else if (ch == ')') {
                while (ops.peek() != '(') {
                    apply(numbers, ops);
                }
                ops.pop();                                           // discard the '('
            } else {
                while (!ops.empty() && ops.peek() != '(' && priority(ops.peek()) >= priority(ch)) {
                    apply(numbers, ops);
                }
                ops.push(ch);
            }
        }
        while (!ops.empty()) {
            apply(numbers, ops);
        }
        return numbers.pop();
    }

    public static void main(String[] args) {
        for (String expression : new String[] {"2 + 3 * 4", "(2 + 3) * 4", "100 / (5 + 5) - 3 * (2 - 1)"}) {
            System.out.println(expression + " = " + evaluate(expression));
        }
    }
}
''' + OUT,
        level='Hard',
        hints=['<code>-</code> and <code>/</code> are not commutative: the first number popped is the <em>right</em> operand.',
               'After reading a number, step the index back one place so the loop does not skip a character.']),
]

MORE['hashset'] = [
    practice(
        'Who visited what: common, unique and first repeat',
        'Three groups recorded the forts they visited. Using only sets, answer: which forts did <strong>every</strong> group visit, which were visited by <strong>exactly one</strong> group, and what is the <strong>first fort repeated</strong> in a single group\'s log?',
        ['Store each group\'s forts in a <code>HashSet</code>.',
         'Intersection of all three with <code>retainAll</code>.',
         'Forts visited by exactly one group: count in a <code>HashMap&lt;String, Integer&gt;</code> or use <code>removeAll</code> cleverly.',
         'First repeated element of the log: stop when <code>add</code> returns <code>false</code>.'],
        r'''// Practice: common, unique and first-repeated elements with sets
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class WhoVisitedWhat {
    public static void main(String[] args) {
        List<Set<String>> groups = List.of(
            new HashSet<>(List.of("Raigad", "Torna", "Lohagad", "Purandar")),
            new HashSet<>(List.of("Raigad", "Torna", "Sinhagad")),
            new HashSet<>(List.of("Raigad", "Torna", "Panhala", "Lohagad")));

        Set<String> everyGroup = new HashSet<>(groups.get(0));
        for (Set<String> g : groups) {
            everyGroup.retainAll(g);                                  // keep only what is in all sets
        }
        System.out.println("Visited by every group: " + new TreeSet<>(everyGroup));

        Map<String, Integer> howMany = new HashMap<>();
        for (Set<String> g : groups) {
            for (String fort : g) {
                howMany.merge(fort, 1, Integer::sum);
            }
        }
        Set<String> onlyOne = new TreeSet<>();
        howMany.forEach((fort, count) -> {
            if (count == 1) {
                onlyOne.add(fort);
            }
        });
        System.out.println("Visited by exactly one group: " + onlyOne);

        String[] log = {"Pune", "Mumbai", "Nashik", "Mumbai", "Pune"};
        Set<String> seen = new HashSet<>();
        for (String city : log) {
            if (!seen.add(city)) {                                    // add() is false for a repeat
                System.out.println("First repeated city in the log: " + city);
                break;
            }
        }
    }
}
''' + OUT,
        level='Hard',
        hints=['Start the intersection from a <strong>copy</strong> of one set so the original is not destroyed.']),
]

MORE['linkedhashset'] = [
    practice(
        'First city that appears only once',
        'A stream of city names arrives. Report the <strong>first city that occurs exactly once</strong>, in the order they first appeared. Use <code>LinkedHashSet</code> to keep the order while you track the repeats.',
        ['Keep one <code>LinkedHashSet</code> of candidates (seen once, in order) and one <code>HashSet</code> of repeated cities.',
         'When a city arrives: if it is new, add it to the candidates; if it was a candidate, remove it and remember it as repeated.',
         'After every city print the current first candidate (or "none").'],
        r'''// Practice: first non-repeating city in a stream, with a LinkedHashSet
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

public class FirstUniqueCity {
    public static void main(String[] args) {
        String[] stream = {"Pune", "Mumbai", "Pune", "Nashik", "Mumbai", "Nagpur", "Nashik", "Nagpur", "Kolhapur"};

        LinkedHashSet<String> candidates = new LinkedHashSet<>();     // seen exactly once, in order
        Set<String> repeated = new HashSet<>();

        for (String city : stream) {
            if (repeated.contains(city)) {
                // already known to repeat: nothing to do
            } else if (candidates.contains(city)) {
                candidates.remove(city);                              // second time: no longer unique
                repeated.add(city);
            } else {
                candidates.add(city);                                 // first time
            }
            String first = candidates.isEmpty() ? "none" : candidates.iterator().next();
            System.out.println("after " + city + ": first unique = " + first);
        }
    }
}
''' + OUT,
        level='Medium',
        hints=['<code>candidates.iterator().next()</code> gives the oldest candidate in O(1).']),
]

MORE['treeset'] = [
    practice(
        'Slot booking that rejects overlaps',
        'A guide accepts trek bookings as time ranges (start hour, end hour). A new booking must be <strong>rejected if it overlaps</strong> an existing one. Ranges that only touch (one ends at 10, the next starts at 10) are allowed.',
        ['Store bookings in a <code>TreeSet</code> ordered by start time.',
         'For a new range, look at <code>floor</code> (the booking starting at or before it) and <code>ceiling</code> (the next one starting at or after it).',
         'Reject if the previous booking ends after the new start, or the next one starts before the new end.',
         'Try 6 requests and print accepted/rejected for each.'],
        r'''// Practice: overlap-free slot booking with a TreeSet
import java.util.Comparator;
import java.util.TreeSet;

public class SlotBooking {
    record Slot(int start, int end) { }

    static boolean book(TreeSet<Slot> booked, Slot wanted) {
        Slot before = booked.floor(wanted);                            // starts at or before the new start
        Slot after = booked.ceiling(wanted);                           // starts at or after the new start
        if (before != null && before.end() > wanted.start()) {
            return false;                                              // the earlier booking runs into it
        }
        if (after != null && after.start() < wanted.end()) {
            return false;                                              // it runs into the next booking
        }
        return booked.add(wanted);
    }

    public static void main(String[] args) {
        TreeSet<Slot> booked = new TreeSet<>(Comparator.comparingInt(Slot::start));
        Slot[] requests = {new Slot(9, 11), new Slot(13, 15), new Slot(11, 13), new Slot(10, 12), new Slot(15, 17), new Slot(8, 10)};
        for (Slot s : requests) {
            System.out.println(s + " -> " + (book(booked, s) ? "accepted" : "rejected"));
        }
        System.out.println("Final timetable: " + booked);
    }
}
''' + OUT,
        level='Hard',
        hints=['The comparator uses only <code>start</code>, so two slots with the same start count as the same: this is what you want here.',
               'Touching slots are fine, so compare with <code>&gt;</code> and <code>&lt;</code>, not <code>&gt;=</code>.']),
]

MORE['hashmap'] = [
    practice(
        'Top cities and the pair of forts that reach a target height',
        'Two classic problems solved with a <code>HashMap</code>. (1) From a visit log, print the <strong>3 most visited cities</strong>, breaking ties alphabetically. (2) Given fort heights, find <strong>two different forts whose heights add up to 2777 m</strong> in a single pass.',
        ['Count visits with <code>merge</code>, then sort the entries by count (descending) then name, and take 3.',
         'For the pair: for each fort, look up <code>target - height</code> in a map of heights seen so far; if present, you found the pair; otherwise store this fort.'],
        r'''// Practice: top-3 frequent cities and "two sum" with HashMap
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TopCitiesAndPairs {
    public static void main(String[] args) {
        String[] log = {"Pune", "Mumbai", "Pune", "Nashik", "Mumbai", "Pune", "Nagpur", "Nashik", "Kolhapur", "Nagpur"};
        Map<String, Integer> visits = new HashMap<>();
        for (String city : log) {
            visits.merge(city, 1, Integer::sum);
        }

        List<Map.Entry<String, Integer>> ranked = new ArrayList<>(visits.entrySet());
        ranked.sort(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()));
        for (int i = 0; i < 3; i++) {
            System.out.println((i + 1) + ". " + ranked.get(i).getKey() + " (" + ranked.get(i).getValue() + " visits)");
        }

        String[] forts = {"Raigad", "Torna", "Lohagad", "Purandar", "Sinhagad"};
        int[] heights = {820, 1403, 1033, 1374, 1312};
        int target = 2777;
        Map<Integer, String> seen = new HashMap<>();                    // height -> fort
        for (int i = 0; i < forts.length; i++) {
            String partner = seen.get(target - heights[i]);
            if (partner != null) {
                System.out.println("Pair for " + target + " m: " + partner + " + " + forts[i]);
                break;
            }
            seen.put(heights[i], forts[i]);
        }
    }
}
''' + OUT,
        level='Hard',
        hints=['Use <code>comparingByValue().reversed().thenComparing(comparingByKey())</code> for count-desc then name.',
               'The "seen so far" map is what makes the pair search O(n) instead of O(n&sup2;).']),
]

MORE['linkedhashmap'] = [
    practice(
        'Bookings grouped by district, in the order they arrived',
        'A report must list districts <strong>in the order they first received a booking</strong>, and inside each district the forts in <strong>booking order</strong>. Print the report and the district with the most bookings.',
        ['Use <code>LinkedHashMap&lt;String, List&lt;String&gt;&gt;</code> and <code>computeIfAbsent</code>.',
         'Print each district with its numbered forts.',
         'Find the district with the most bookings (first one wins a tie).'],
        r'''// Practice: group in first-seen order with LinkedHashMap
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class BookingsByDistrict {
    public static void main(String[] args) {
        String[][] bookings = {
            {"Pune", "Torna"}, {"Raigad", "Raigad"}, {"Pune", "Lohagad"}, {"Kolhapur", "Panhala"},
            {"Raigad", "Pratapgad"}, {"Pune", "Sinhagad"}, {"Kolhapur", "Vishalgad"}};

        Map<String, List<String>> byDistrict = new LinkedHashMap<>();
        for (String[] b : bookings) {
            byDistrict.computeIfAbsent(b[0], k -> new ArrayList<>()).add(b[1]);
        }

        String busiest = null;
        for (Map.Entry<String, List<String>> e : byDistrict.entrySet()) {
            System.out.println(e.getKey() + " (" + e.getValue().size() + ")");
            for (int i = 0; i < e.getValue().size(); i++) {
                System.out.println("   " + (i + 1) + ". " + e.getValue().get(i));
            }
            if (busiest == null || e.getValue().size() > byDistrict.get(busiest).size()) {
                busiest = e.getKey();                                  // strictly greater: the first one wins a tie
            }
        }
        System.out.println("Busiest district: " + busiest);
    }
}
''' + OUT,
        level='Medium',
        hints=['Use <code>&gt;</code> (not <code>&gt;=</code>) when comparing sizes so the earlier district wins a tie.']),
]

MORE['treemap'] = [
    practice(
        'Progressive entry-fee calculator',
        'Group fees per person are charged by <strong>slabs</strong>: the first 10 people pay 100 each, the next 15 (people 11 to 25) pay 80 each, everyone after that pays 60. Compute the total for any group size using a <code>TreeMap</code> of slab starts.',
        ['Store the slab start (1, 11, 26) as key and the fee as value.',
         'For a group of N, walk the slabs in order and charge each slab for the people that fall inside it.',
         'Print the total for groups of 5, 10, 18, 25 and 40, and which slab each ends in (use <code>floorEntry</code>).'],
        r'''// Practice: progressive fee slabs with TreeMap
import java.util.Map;
import java.util.TreeMap;

public class SlabFeeCalculator {
    static int total(TreeMap<Integer, Integer> slabs, int people) {
        int sum = 0;
        for (Map.Entry<Integer, Integer> slab : slabs.entrySet()) {
            int start = slab.getKey();
            Integer next = slabs.higherKey(start);                      // where the next slab begins
            int last = (next == null) ? people : Math.min(people, next - 1);
            if (people >= start) {
                sum += (last - start + 1) * slab.getValue();            // people inside this slab
            }
        }
        return sum;
    }

    public static void main(String[] args) {
        TreeMap<Integer, Integer> slabs = new TreeMap<>();
        slabs.put(1, 100);                                              // people 1 to 10
        slabs.put(11, 80);                                              // people 11 to 25
        slabs.put(26, 60);                                              // people 26 and more

        for (int people : new int[] {5, 10, 18, 25, 40}) {
            Map.Entry<Integer, Integer> last = slabs.floorEntry(people);
            System.out.println(people + " people -> " + total(slabs, people) + " rupees (ends in the slab starting at " + last.getKey() + ")");
        }
    }
}
''' + OUT,
        level='Hard',
        hints=['<code>higherKey(start)</code> tells you where the next slab begins, so the end of this slab is <code>next - 1</code>.',
               'Check by hand: 18 people = 10 x 100 + 8 x 80 = 1640.']),
]

MORE['hashtable'] = [
    practice(
        'Merge and invert legacy inventories',
        'Two old systems each keep a <code>Hashtable</code> of trek-gear stock. Merge them (adding the counts of items that appear in both), then build the <strong>inverse table</strong>: for each count, which items have it.',
        ['Merge with <code>merge(key, count, Integer::sum)</code>.',
         'Invert: a <code>Hashtable&lt;Integer, List&lt;String&gt;&gt;</code>, count to item names (sorted).',
         'Print the merged table and the inverse in key order.'],
        r'''// Practice: merging and inverting Hashtables
import java.util.ArrayList;
import java.util.Collections;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class LegacyInventoryMerge {
    public static void main(String[] args) {
        Hashtable<String, Integer> shopA = new Hashtable<>();
        shopA.put("Rope", 10);
        shopA.put("Torch", 4);
        shopA.put("Boots", 6);

        Hashtable<String, Integer> shopB = new Hashtable<>();
        shopB.put("Torch", 6);
        shopB.put("Boots", 4);
        shopB.put("Raincoat", 10);

        Hashtable<String, Integer> merged = new Hashtable<>(shopA);
        for (Map.Entry<String, Integer> e : shopB.entrySet()) {
            merged.merge(e.getKey(), e.getValue(), Integer::sum);       // add the counts of common items
        }
        System.out.println("Merged : " + new TreeMap<>(merged));

        Hashtable<Integer, List<String>> byCount = new Hashtable<>();
        for (Map.Entry<String, Integer> e : merged.entrySet()) {
            byCount.computeIfAbsent(e.getValue(), k -> new ArrayList<>()).add(e.getKey());
        }
        for (List<String> items : byCount.values()) {
            Collections.sort(items);
        }
        System.out.println("By count: " + new TreeMap<>(byCount));
    }
}
''' + OUT,
        level='Medium',
        hints=['A Hashtable has no order, so copy it into a <code>TreeMap</code> only when you print.']),
]

MORE['comparable'] = [
    practice(
        'Fort ranking with a full natural order',
        'Define the natural order of a <code>Fort</code>: <strong>district A to Z, then height highest first, then name</strong>. Use it for sorting, for removing duplicates with a <code>TreeSet</code> and for finding the top 3 with a <code>PriorityQueue</code>.',
        ['Implement <code>Comparable&lt;Fort&gt;</code> with the three-level rule (use <code>Integer.compare</code>).',
         'Sort a list with <code>Collections.sort</code>.',
         'Put the list in a <code>TreeSet</code>: forts that compare as equal (same district, height and name) must collapse into one.',
         'Use a <code>PriorityQueue</code> (a min-heap on the same order) and print the first 3 polled.'],
        r'''// Practice: a three-level natural order used by sort, TreeSet and PriorityQueue
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;
import java.util.TreeSet;

public class FortRanking {
    record Fort(String district, int heightMetres, String name) implements Comparable<Fort> {
        public int compareTo(Fort o) {
            int c = district.compareTo(o.district);                    // 1. district A to Z
            if (c != 0) {
                return c;
            }
            c = Integer.compare(o.heightMetres, heightMetres);         // 2. higher first (arguments swapped)
            return c != 0 ? c : name.compareTo(o.name);                // 3. name
        }
    }

    public static void main(String[] args) {
        List<Fort> forts = new ArrayList<>(List.of(
            new Fort("Pune", 1033, "Lohagad"), new Fort("Raigad", 820, "Raigad"), new Fort("Pune", 1403, "Torna"),
            new Fort("Kolhapur", 845, "Panhala"), new Fort("Pune", 1374, "Purandar"), new Fort("Pune", 1403, "Torna")));

        Collections.sort(forts);
        System.out.println("Sorted:");
        forts.forEach(f -> System.out.println("  " + f.district() + " | " + f.heightMetres() + " | " + f.name()));

        TreeSet<Fort> unique = new TreeSet<>(forts);
        System.out.println("List size " + forts.size() + ", unique forts " + unique.size());

        PriorityQueue<Fort> queue = new PriorityQueue<>(forts);
        System.out.print("First three polled: ");
        for (int i = 0; i < 3; i++) {
            System.out.print(queue.poll().name() + " ");
        }
        System.out.println();
    }
}
''' + OUT,
        level='Hard',
        hints=['Swap the two arguments of <code>Integer.compare</code> to get "highest first".',
               'A record gives you <code>equals</code> that agrees with <code>compareTo</code> here, because all three fields are compared.']),
]

MORE['comparator'] = [
    practice(
        'Booking report with a custom status order',
        'Sort booking records by <strong>status priority</strong> (CONFIRMED, then WAITING, then CANCELLED: not alphabetical), then by <strong>trek date, newest first</strong>, then by <strong>name with missing names last</strong>.',
        ['Describe the status order with a list and <code>indexOf</code>, or with an <code>enum</code>.',
         'Build one <code>Comparator</code> with <code>comparing</code>, <code>thenComparing</code>, <code>reversed</code> and <code>nullsLast</code>.',
         'Print the sorted table.'],
        r'''// Practice: one Comparator with a custom status order, date descending and null-safe names
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class BookingReport {
    enum Status { CONFIRMED, WAITING, CANCELLED }                      // enum order = our priority order

    record Booking(String name, Status status, int dayOfMonth) { }

    public static void main(String[] args) {
        List<Booking> list = new ArrayList<>(List.of(
            new Booking("Pune group", Status.WAITING, 12), new Booking("Nashik group", Status.CONFIRMED, 5),
            new Booking(null, Status.CONFIRMED, 20), new Booking("Mumbai group", Status.CANCELLED, 18),
            new Booking("Nagpur group", Status.CONFIRMED, 20), new Booking("Kolhapur group", Status.WAITING, 25)));

        Comparator<Booking> order = Comparator
            .comparing(Booking::status)                                           // CONFIRMED first
            .thenComparing(Comparator.comparingInt(Booking::dayOfMonth).reversed())   // latest date first
            .thenComparing(Booking::name, Comparator.nullsLast(Comparator.naturalOrder()));   // no name: last

        list.sort(order);
        for (Booking b : list) {
            System.out.println(b.status() + " | day " + b.dayOfMonth() + " | " + b.name());
        }
    }
}
''' + OUT,
        level='Hard',
        hints=['Enums compare by their declaration order, which is exactly the priority you want.',
               'Put <code>.reversed()</code> on the date comparator itself, not at the end of the whole chain.']),
]

MORE['internal-hashmap'] = [
    practice(
        'Write your own HashMap: remove, resize and bucket report',
        'Extend the mini HashMap from the lesson so it behaves like the real one: it supports <code>put</code>, <code>get</code> and <code>remove</code>, <strong>doubles its table when it is 75 percent full</strong> and can print how the keys are spread over the buckets.',
        ['Chain nodes in each bucket; <code>put</code> updates an existing key instead of adding a duplicate.',
         '<code>remove(key)</code> must unlink the node from its chain (head or middle).',
         'After a <code>put</code> that makes <code>size &gt; capacity * 0.75</code>, create a table twice as big and re-insert every node.',
         'Print capacity, size and the longest chain after adding 10 forts.'],
        r'''// Practice: a HashMap written from scratch (put, get, remove, resize)
public class MyHashMap {
    static class Node {
        final String key;
        int value;
        Node next;

        Node(String key, int value, Node next) {
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    private Node[] table = new Node[4];
    private int size = 0;

    private static int index(String key, int length) {
        int h = key.hashCode();
        return (h ^ (h >>> 16)) & (length - 1);
    }

    void put(String key, int value) {
        int i = index(key, table.length);
        for (Node n = table[i]; n != null; n = n.next) {
            if (n.key.equals(key)) {
                n.value = value;                                       // existing key: update
                return;
            }
        }
        table[i] = new Node(key, value, table[i]);
        if (++size > table.length * 0.75) {
            resize();
        }
    }

    Integer get(String key) {
        for (Node n = table[index(key, table.length)]; n != null; n = n.next) {
            if (n.key.equals(key)) {
                return n.value;
            }
        }
        return null;
    }

    boolean remove(String key) {
        int i = index(key, table.length);
        Node previous = null;
        for (Node n = table[i]; n != null; previous = n, n = n.next) {
            if (n.key.equals(key)) {
                if (previous == null) {
                    table[i] = n.next;                                 // it was the head of the chain
                } else {
                    previous.next = n.next;                            // unlink from the middle
                }
                size--;
                return true;
            }
        }
        return false;
    }

    private void resize() {
        Node[] bigger = new Node[table.length * 2];
        for (Node head : table) {
            for (Node n = head; n != null; n = n.next) {
                int i = index(n.key, bigger.length);
                bigger[i] = new Node(n.key, n.value, bigger[i]);
            }
        }
        table = bigger;
    }

    int longestChain() {
        int longest = 0;
        for (Node head : table) {
            int length = 0;
            for (Node n = head; n != null; n = n.next) {
                length++;
            }
            longest = Math.max(longest, length);
        }
        return longest;
    }

    public static void main(String[] args) {
        MyHashMap map = new MyHashMap();
        String[] forts = {"Raigad", "Torna", "Lohagad", "Panhala", "Purandar", "Sinhagad", "Rajgad", "Pratapgad", "Visapur", "Shivneri"};
        for (int i = 0; i < forts.length; i++) {
            map.put(forts[i], i + 1);
        }
        map.put("Torna", 99);
        System.out.println("size=" + map.size + " capacity=" + map.table.length + " longest chain=" + map.longestChain());
        System.out.println("get(Torna)    = " + map.get("Torna"));
        System.out.println("remove(Torna) = " + map.remove("Torna") + ", again = " + map.remove("Torna"));
        System.out.println("get(Torna)    = " + map.get("Torna") + ", size=" + map.size);
    }
}
''' + OUT,
        level='Hard',
        hints=['While resizing, build new nodes (or relink carefully): do not change the old chains while you walk them.',
               'The table length is always a power of two, so <code>hash &amp; (length - 1)</code> works as the index.']),
]

MORE['internal-hashset'] = [
    practice(
        'Why a bad hashCode makes a HashSet slow',
        'Two key classes are identical except for <code>hashCode</code>: one returns the same number for every object, the other spreads the keys. Add 2000 keys to a <code>HashSet</code> of each and compare <strong>how many buckets are really used</strong> (estimate it from the hashes), then check that both sets still find every key.',
        ['Create <code>BadKey</code> (hashCode always 7) and <code>GoodKey</code> (hashCode from its number), both with correct <code>equals</code>.',
         'Count the distinct bucket indexes <code>(h ^ (h &gt;&gt;&gt; 16)) &amp; 4095</code> that 2000 keys fall into.',
         'Check that <code>contains</code> still returns <code>true</code> for every key in both sets (the bad set is slow, not wrong).'],
        r'''// Practice: the effect of a bad hashCode on a HashSet
import java.util.HashSet;
import java.util.Set;

public class BadHashCodeEffect {
    record BadKey(int id) implements Comparable<BadKey> {
        public int hashCode() {
            return 7;                                                  // every key collides
        }

        public int compareTo(BadKey o) {
            return Integer.compare(id, o.id);
        }
    }

    record GoodKey(int id) { }

    static int distinctBuckets(int[] hashes) {
        Set<Integer> buckets = new HashSet<>();
        for (int h : hashes) {
            buckets.add((h ^ (h >>> 16)) & 4095);                      // the bucket index in a 4096-slot table
        }
        return buckets.size();
    }

    public static void main(String[] args) {
        int n = 2000;
        int[] badHashes = new int[n];
        int[] goodHashes = new int[n];
        Set<BadKey> bad = new HashSet<>();
        Set<GoodKey> good = new HashSet<>();
        for (int i = 0; i < n; i++) {
            BadKey b = new BadKey(i);
            GoodKey g = new GoodKey(i);
            badHashes[i] = b.hashCode();
            goodHashes[i] = g.hashCode();
            bad.add(b);
            good.add(g);
        }
        System.out.println("BadKey  uses " + distinctBuckets(badHashes) + " bucket(s) for " + n + " keys");
        System.out.println("GoodKey uses " + distinctBuckets(goodHashes) + " buckets for " + n + " keys");

        int missing = 0;
        for (int i = 0; i < n; i++) {
            if (!bad.contains(new BadKey(i)) || !good.contains(new GoodKey(i))) {
                missing++;
            }
        }
        System.out.println("Keys not found in either set: " + missing);
    }
}
''' + OUT,
        level='Hard',
        hints=['<code>BadKey</code> is <code>Comparable</code>, so Java 8+ turns the long chain into a tree: the set stays correct, and lookups are O(log n) instead of O(n).',
               'In a real program you would measure the time with a benchmark tool such as JMH; do not trust one stopwatch run.']),
]
