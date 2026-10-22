"""Extra lesson blocks for HashMap, LinkedHashMap, TreeMap and Hashtable: benefits, disadvantages, sorting and finding
modules, real-time examples, a sample project and more practice questions. Merged into the topics by build.py.
Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, method, practice, section, table, ul  # noqa: E402

EXTRAS = {}


def add_practice(topic_id, blocks):
    """Appends practice questions to the topic's PRACTICE list (so they appear after the existing ones, under the Practice
    questions heading). Guarded so that building several topics in one run never adds a question twice."""
    try:
        from _practice import PRACTICE
    except Exception:
        return list(blocks)                        # fallback: they stay in the expert extras
    have = {b[0] for b in PRACTICE.setdefault(topic_id, [])}
    PRACTICE[topic_id].extend(b for b in blocks if b[0] not in have)
    return []

# ======================================================================================================================
# HASHMAP
# ======================================================================================================================
HM_BEGINNER = [
    section(
        'Benefits and advantages',
        '<strong>For freshers:</strong> a HashMap is the first tool to reach for when you need to "look something up by name". Why it is popular:',
        [
            '<strong>Very fast lookup.</strong> Finding the value for a key takes about the same time whether the map holds 10 or 10 million pairs.',
            '<strong>Natural shape for real data.</strong> City to area code, roll number to marks, word to count: all are key-value pairs.',
            '<strong>No duplicate keys.</strong> You never check "is this key already there?" by hand; <code>merge</code>, <code>putIfAbsent</code> and <code>computeIfAbsent</code> do it for you.',
            '<strong>Great for counting and grouping.</strong> One line, <code>map.merge(word, 1, Integer::sum)</code>, counts anything.',
            '<strong>Flexible.</strong> Any object can be a key or a value; one <code>null</code> key and many <code>null</code> values are allowed.',
            '<strong>One API for all maps.</strong> The same <code>Map</code> methods work for every map class, so what you learn here transfers.',
            '<strong>For experienced developers:</strong> O(1) average <code>get/put/remove</code>; buckets with 8 or more colliding entries become red-black trees (when the table is at least 64 slots), so the worst case is O(log n), not O(n). Resizing doubles the table and is amortised O(1) per insert.',
        ],
    ),
    (
        '<h3>Disadvantages and when NOT to use it</h3>\n'
        '<p><strong>For freshers:</strong> a HashMap is not the answer to everything. Know its weak spots:</p>\n'
        + ul([
            '<strong>No order.</strong> If you print or loop over it, the order looks random and may change after the map grows.',
            '<strong>Cannot be sorted in place.</strong> A map has no <code>sort()</code>; you must copy it into a <code>TreeMap</code> or <code>LinkedHashMap</code>.',
            '<strong>Searching by value is slow.</strong> <code>containsValue</code> checks every entry (O(n)).',
            '<strong>Not thread-safe.</strong> Two threads writing at once can lose data. Use <code>ConcurrentHashMap</code>.',
            '<strong>Needs good keys.</strong> A key class without correct <code>equals</code> and <code>hashCode</code>, or a key you change after inserting it, makes entries unreachable.',
            '<strong>Uses more memory</strong> than an array or list: every pair is a small <code>Node</code> object plus the table.',
            '<strong>For experienced developers:</strong> keys with a poor <code>hashCode</code> collide and degrade lookups; iteration costs O(n + capacity), so a huge, mostly empty map is slow to loop over; autoboxing of <code>int</code> keys and values adds garbage; changing the map while iterating throws <code>ConcurrentModificationException</code>.',
        ])
        + '\n<p>Quick guide:</p>\n'
        + table(['Use a HashMap when', 'Use something else when'], [
            ['You look values up by key and order does not matter', 'You need a <strong>sorted</strong> view: use <code>TreeMap</code>'],
            ['You count, group or cache things', 'You need <strong>insertion order</strong> or an LRU cache: use <code>LinkedHashMap</code>'],
            ['One thread uses the map (or it is read-only after loading)', 'Many threads write: use <code>ConcurrentHashMap</code>'],
            ['Keys are Strings, Integers, enums or records', 'Keys are small enums only: <code>EnumMap</code> is faster and ordered'],
            ['You have a key-value relationship', 'You only need unique items with no value: use <code>HashSet</code>'],
        ]),
        [],
    ),
]

HM_INTERMEDIATE = [
    section(
        'Module: Sorting methods',
        '<strong>For freshers:</strong> a HashMap cannot be sorted itself, because it keeps no order. To "sort a map" you build a <strong>new</strong> map or list that has the order you want. '
        '<strong>For experienced developers:</strong> every approach below is O(n log n); pick by what you need afterwards (a sorted map, a ranked list, or just the top few).'),
    method(
        'Sort by key: copy into a TreeMap', 'new TreeMap<>(Map m)', 'a new <code>TreeMap</code> sorted by key', 'O(n log n)',
        'The simplest way to sort by key. A <code>TreeMap</code> keeps its keys in order (A to Z for Strings, small to large for numbers), so copying the map into one sorts it.',
        'The original HashMap is not changed. Keys must be <code>Comparable</code>, or pass a <code>Comparator</code> to the <code>TreeMap</code> constructor.',
        r'''// Sort a HashMap by key with a TreeMap
import java.util.*;

public class HmSortByKey {
    public static void main(String[] args) {
        Map<String, Integer> heights = new HashMap<>();
        heights.put("Torna", 1403);
        heights.put("Raigad", 1356);
        heights.put("Lohagad", 1033);

        Map<String, Integer> byKey = new TreeMap<>(heights);   // keys now A to Z
        System.out.println(byKey);
    }
}
''' + OUT),
    method(
        'Sort by value: stream + comparingByValue', 'entrySet().stream().sorted(Map.Entry.comparingByValue())', 'a sorted <code>Stream</code> of entries', 'O(n log n)',
        'To sort by <strong>value</strong>, stream the entries, sort them with <code>Map.Entry.comparingByValue()</code> and put them into a <code>LinkedHashMap</code>, which remembers the order you insert.',
        'A plain HashMap would forget the order again, so the target must be a <code>LinkedHashMap</code>. Values must be <code>Comparable</code>.',
        r'''// Sort a HashMap by value (small to large)
import java.util.*;

public class HmSortByValue {
    public static void main(String[] args) {
        Map<String, Integer> heights = new HashMap<>();
        heights.put("Torna", 1403);
        heights.put("Raigad", 1356);
        heights.put("Lohagad", 1033);

        Map<String, Integer> sorted = new LinkedHashMap<>();    // remembers insertion order
        heights.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())           // smallest value first
                .forEach(e -> sorted.put(e.getKey(), e.getValue()));
        System.out.println(sorted);
    }
}
''' + OUT),
    method(
        'Sort by value descending: Collectors.toMap into LinkedHashMap', 'Collectors.toMap(k, v, merge, LinkedHashMap::new)', 'a <code>LinkedHashMap</code> in the sorted order', 'O(n log n)',
        'For "highest first" give <code>comparingByValue</code> a reverse order. The four-argument <code>toMap</code> collects the sorted stream straight into a <code>LinkedHashMap</code>.',
        'The third argument (merge function) is required for the four-argument form; it is never called here because keys are already unique. Without <code>LinkedHashMap::new</code> the result would be a HashMap and the order would be lost.',
        r'''// Sort by value, highest first, collected into a LinkedHashMap
import java.util.*;
import java.util.stream.Collectors;

public class HmSortDescending {
    public static void main(String[] args) {
        Map<String, Integer> visitors = new HashMap<>();
        visitors.put("Raigad", 40);
        visitors.put("Sinhagad", 95);
        visitors.put("Torna", 25);

        Map<String, Integer> ranked = visitors.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))   // biggest first
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));                       // keep this order
        System.out.println(ranked);
    }
}
''' + OUT),
    method(
        'Sort with ties: List of entries + thenComparing', 'list.sort(comparingByValue().reversed().thenComparing(comparingByKey()))', 'nothing; the list is sorted in place', 'O(n log n)',
        'When two values are equal, say which comes first. Copy the entries into a <code>List</code> (lists can be sorted) and chain <code>thenComparing</code> for the tie-break, here "same visitors: A to Z".',
        'A list of entries is the best shape when you only want to <em>read</em> a ranking. Use <code>Map.entry(k, v)</code> if you need entry copies that do not depend on the map.',
        r'''// Sort entries by value (high first), then by key for ties
import java.util.*;

public class HmSortWithTies {
    public static void main(String[] args) {
        Map<String, Integer> visitors = new HashMap<>();
        visitors.put("Raigad", 40);
        visitors.put("Torna", 25);
        visitors.put("Sinhagad", 40);                      // ties with Raigad

        List<Map.Entry<String, Integer>> list = new ArrayList<>(visitors.entrySet());
        list.sort(Map.Entry.<String, Integer>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()));   // tie: A to Z
        for (Map.Entry<String, Integer> e : list) {
            System.out.println(e.getKey() + " = " + e.getValue());
        }
    }
}
''' + OUT),
    method(
        'Top N: sorted + limit', 'stream().sorted(...).limit(n)', 'a <code>Stream</code> with only the first n entries', 'O(n log n)',
        'Often you do not need the whole sorted map, only the "top 3". Sort, then <code>limit(3)</code> keeps just the first three.',
        'For a very large map and a small n, a bounded <code>PriorityQueue</code> of size n does the same in O(m log n) time. For normal sizes the stream is clearer.',
        r'''// Top 2 forts by visitors
import java.util.*;

public class HmTopN {
    public static void main(String[] args) {
        Map<String, Integer> visitors = new HashMap<>();
        visitors.put("Raigad", 40);
        visitors.put("Sinhagad", 95);
        visitors.put("Torna", 25);
        visitors.put("Panhala", 60);

        visitors.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .limit(2)                                   // only the first two
                .forEach(e -> System.out.println(e.getKey() + " " + e.getValue()));
    }
}
''' + OUT),
    (
        '<p><strong>Which sorting approach to pick?</strong></p>\n' + table(['You want', 'Use', 'Result'], [
            ['Keys A to Z, as a map', '<code>new TreeMap&lt;&gt;(map)</code>', 'sorted map (stays sorted as you add)'],
            ['Sorted by value, as a map', '<code>stream().sorted(comparingByValue()).collect(toMap(..., LinkedHashMap::new))</code>', 'ordered <code>LinkedHashMap</code> (fixed snapshot)'],
            ['A ranking with tie-breaks', '<code>List</code> of entries + <code>sort(...thenComparing...)</code>', 'sorted list'],
            ['Only the best few', '<code>sorted(...).limit(n)</code>', 'first n entries'],
        ]),
        [],
    ),
    section(
        'Module: Finding (searching) methods',
        '<strong>For freshers:</strong> a HashMap is built for finding by <strong>key</strong>; that is instant. Finding by <strong>value</strong> or by a condition means looking at the entries one by one. '
        '<strong>For experienced developers:</strong> key lookups are O(1); anything that scans values, finds a maximum or filters is O(n). If you search by value often, keep a second (reverse) map.'),
    method(
        'get and getOrDefault: find a value by key', 'V get(Object key) / V getOrDefault(Object key, V defaultValue)', 'the value, or <code>null</code> / the default if the key is missing', 'O(1)',
        '<code>get</code> returns the value for a key or <code>null</code>. <code>getOrDefault</code> returns a value you choose instead of <code>null</code>, which avoids <code>NullPointerException</code> when you unbox.',
        '<code>get</code> returning <code>null</code> can mean "missing" or "mapped to null"; <code>getOrDefault</code> returns <code>null</code> too when the key is mapped to <code>null</code>.',
        r'''// Find a value by key
import java.util.*;

public class HmFindGet {
    public static void main(String[] args) {
        Map<String, Integer> codes = new HashMap<>();
        codes.put("Pune", 20);
        codes.put("Nagpur", 712);

        System.out.println(codes.get("Pune"));                    // 20
        System.out.println(codes.get("Delhi"));                   // null: not found
        System.out.println(codes.getOrDefault("Delhi", -1));      // -1: our own "not found" value
    }
}
''' + OUT),
    method(
        'containsKey: does this key exist?', 'boolean containsKey(Object key)', '<code>true</code> if the key is present', 'O(1)',
        'Answers yes or no. Use it when you only care <em>whether</em> a key exists, not what its value is.',
        'It is as cheap as <code>get</code>. To "check then use" prefer a single <code>get</code> (and test for <code>null</code>) so the key is hashed once.',
        r'''// Check if a key exists
import java.util.*;

public class HmFindContainsKey {
    public static void main(String[] args) {
        Map<String, Integer> codes = new HashMap<>();
        codes.put("Pune", 20);

        System.out.println(codes.containsKey("Pune"));    // true
        System.out.println(codes.containsKey("Nashik"));  // false
    }
}
''' + OUT),
    method(
        'containsValue: does this value exist?', 'boolean containsValue(Object value)', '<code>true</code> if at least one key has this value', 'O(n)',
        'Checks whether <strong>any</strong> entry has the given value. It has to look at the entries one by one, so it is slower than <code>containsKey</code>.',
        'It walks every bucket using <code>equals</code>. For frequent value lookups, maintain a reverse <code>Map&lt;V, K&gt;</code> or a <code>HashSet</code> of values.',
        r'''// Check if a value exists (slow: scans entries)
import java.util.*;

public class HmFindContainsValue {
    public static void main(String[] args) {
        Map<String, Integer> codes = new HashMap<>();
        codes.put("Pune", 20);
        codes.put("Mumbai", 22);

        System.out.println(codes.containsValue(22));   // true
        System.out.println(codes.containsValue(11));   // false
    }
}
''' + OUT),
    method(
        'Find the key for a value', 'for (Map.Entry e : map.entrySet()) if (value.equals(e.getValue()))', 'the first matching key, or <code>null</code>', 'O(n)',
        'A map goes from key to value, not back. To find the key of a value, loop over the entries and compare. Stop as soon as you find it.',
        'Several keys can share a value; a HashMap gives no guarantee which one you meet first. To get all of them, collect with a stream <code>filter</code> (see the next card).',
        r'''// Find the key that has a given value
import java.util.*;

public class HmFindKeyByValue {
    public static void main(String[] args) {
        Map<String, Integer> codes = new HashMap<>();
        codes.put("Pune", 20);
        codes.put("Mumbai", 22);
        codes.put("Nagpur", 712);

        String found = null;
        for (Map.Entry<String, Integer> e : codes.entrySet()) {
            if (e.getValue() == 712) {          // compare the value
                found = e.getKey();             // remember its key
                break;                          // stop early
            }
        }
        System.out.println("Area code 712 belongs to " + found);
    }
}
''' + OUT),
    method(
        'Stream filter: find all matches', 'entrySet().stream().filter(...).map(...).toList()', 'a <code>List</code> of the matching keys or entries', 'O(n)',
        'To find <strong>every</strong> entry that meets a rule, filter the stream. Here: all forts higher than 1350 m. Sort the result if you print it, because a HashMap order is not fixed.',
        'Use <code>anyMatch</code> / <code>allMatch</code> / <code>noneMatch</code> for yes/no questions (they stop early) and <code>count()</code> for how many.',
        r'''// Find all forts above 1350 m
import java.util.*;

public class HmFindFilter {
    public static void main(String[] args) {
        Map<String, Integer> heights = new HashMap<>();
        heights.put("Torna", 1403);
        heights.put("Raigad", 1356);
        heights.put("Lohagad", 1033);

        List<String> tall = heights.entrySet().stream()
                .filter(e -> e.getValue() > 1350)       // the rule
                .map(Map.Entry::getKey)                 // keep only the name
                .sorted()                               // fixed order for printing
                .toList();
        System.out.println(tall);
        System.out.println("Any above 1400? " + heights.values().stream().anyMatch(h -> h > 1400));
    }
}
''' + OUT),
    method(
        'Max and min entry', 'Collections.max(map.entrySet(), Map.Entry.comparingByValue())', 'the entry with the largest (or smallest) value', 'O(n)',
        'To find the highest or lowest value and <em>who owns it</em>, use <code>Collections.max</code> / <code>Collections.min</code> on the entries, or the stream version <code>stream().min(...)</code> which returns an <code>Optional</code>.',
        'No sorting is needed, so this is O(n), cheaper than sorting. <code>Collections.max</code> throws on an empty map; the stream form returns an empty <code>Optional</code>. On equal values, either entry may win.',
        r'''// Find the tallest and the shortest fort
import java.util.*;

public class HmFindMaxMin {
    public static void main(String[] args) {
        Map<String, Integer> heights = new HashMap<>();
        heights.put("Torna", 1403);
        heights.put("Raigad", 1356);
        heights.put("Lohagad", 1033);

        Map.Entry<String, Integer> tallest = Collections.max(heights.entrySet(), Map.Entry.comparingByValue());
        System.out.println("Tallest : " + tallest.getKey() + " " + tallest.getValue());

        heights.entrySet().stream()
                .min(Map.Entry.comparingByValue())                         // Optional<Entry>
                .ifPresent(e -> System.out.println("Shortest: " + e.getKey() + " " + e.getValue()));
    }
}
''' + OUT),
    (
        '<p><strong>Which finding method to pick?</strong></p>\n' + table(['Question', 'Method', 'Time'], [
            ['What is the value for this key?', '<code>get</code> / <code>getOrDefault</code>', 'O(1)'],
            ['Is this key present?', '<code>containsKey</code>', 'O(1)'],
            ['Is this value present?', '<code>containsValue</code> (or <code>values().stream().anyMatch</code>)', 'O(n)'],
            ['Which key has this value?', 'loop over <code>entrySet()</code>, or keep a reverse map', 'O(n)'],
            ['All entries matching a rule', '<code>stream().filter(...)</code>', 'O(n)'],
            ['Highest or lowest value and its key', '<code>Collections.max/min</code> or <code>stream().max/min</code>', 'O(n)'],
        ]),
        [],
    ),
]


def scen(title, text, code):
    """One real-time scenario: its own heading, a short story, one complete program."""
    return (f'<h4>{title}</h4>\n<p>{text}</p>', [code])


def project(title, goal, steps, code):
    """A sample project: what we build, the steps, and the single-file program."""
    html = (f'<h3>Sample project: {title}</h3>\n<p><strong>What we build:</strong> {goal}</p>\n<p><strong>Steps:</strong></p>\n'
            + ul(steps) + '\n<p>Read the step comments in the program, run it, then extend it with your own idea.</p>')
    return (html, [code])


HM_EXPERT = [
    section(
        'Real-time examples',
        'Three small, realistic jobs where a HashMap is the right tool. Each program is complete: copy it, run it, change the data.'),
    scen(
        'Scenario 1: Vote counter',
        '<strong>For freshers:</strong> every vote is a name; the map keeps one counter per candidate. <code>merge(name, 1, Integer::sum)</code> means "start at 1, or add 1 to what is there". '
        '<strong>For experienced developers:</strong> this is the standard frequency-count idiom, O(1) per vote. We print through a <code>TreeMap</code> so the order is stable.',
        r'''// Real-time example: counting votes
import java.util.*;

public class HmVoteCounter {
    public static void main(String[] args) {
        String[] votes = {"Asha", "Ravi", "Asha", "Meera", "Ravi", "Asha", "Meera", "Asha"};

        Map<String, Integer> tally = new HashMap<>();
        for (String name : votes) {
            tally.merge(name, 1, Integer::sum);          // add 1 to this candidate's counter
        }

        System.out.println("Tally  : " + new TreeMap<>(tally));
        Map.Entry<String, Integer> winner = Collections.max(tally.entrySet(), Map.Entry.comparingByValue());
        System.out.println("Winner : " + winner.getKey() + " with " + winner.getValue() + " votes");
    }
}
''' + OUT),
    scen(
        'Scenario 2: Student marks lookup',
        '<strong>For freshers:</strong> the roll number is the key and the student record is the value, so a result desk can find any student at once. Always handle the "roll number not found" case. '
        '<strong>For experienced developers:</strong> <code>computeIfPresent</code> updates a value only when the key exists and does the lookup once; a record makes a good immutable value.',
        r'''// Real-time example: marks lookup by roll number
import java.util.*;

public class HmMarksLookup {
    record Student(String name, int marks) { }

    public static void main(String[] args) {
        Map<Integer, Student> byRoll = new HashMap<>();
        byRoll.put(101, new Student("Asha", 78));
        byRoll.put(102, new Student("Ravi", 64));
        byRoll.put(103, new Student("Meera", 91));

        for (int roll : new int[]{102, 110}) {
            Student s = byRoll.get(roll);                // O(1) lookup by key
            if (s == null) {
                System.out.println("Roll " + roll + ": not found");
            } else {
                System.out.println("Roll " + roll + ": " + s.name() + " scored " + s.marks());
            }
        }

        // grace marks for roll 102 only, because the key exists
        byRoll.computeIfPresent(102, (roll, s) -> new Student(s.name(), s.marks() + 5));
        System.out.println("After grace: " + byRoll.get(102));
    }
}
''' + OUT),
    scen(
        'Scenario 3: Price cache',
        '<strong>For freshers:</strong> asking a slow database for the same fort fee again and again wastes time. Keep answers in a map: look in the map first, and only call the slow method when the key is missing. '
        '<strong>For experienced developers:</strong> this is a read-through cache. With a HashMap, do not call <code>computeIfAbsent</code> recursively on the same map (it can throw <code>ConcurrentModificationException</code>); a plain get-then-put is safe here. For threads use <code>ConcurrentHashMap</code>.',
        r'''// Real-time example: a small cache in front of a slow lookup
import java.util.*;

public class HmPriceCache {
    static int databaseCalls = 0;

    static int slowFeeLookup(String fort) {              // pretend this talks to a database
        databaseCalls++;
        return fort.length() * 10;
    }

    static final Map<String, Integer> cache = new HashMap<>();

    static int feeOf(String fort) {
        Integer cached = cache.get(fort);                // 1. look in the cache first
        if (cached != null) {
            return cached;
        }
        int fee = slowFeeLookup(fort);                   // 2. miss: do the slow work
        cache.put(fort, fee);                            // 3. remember it
        return fee;
    }

    public static void main(String[] args) {
        String[] requests = {"Raigad", "Torna", "Raigad", "Raigad", "Torna", "Panhala"};
        int total = 0;
        for (String fort : requests) {
            total += feeOf(fort);
        }
        System.out.println("Total fees     : " + total);
        System.out.println("Requests       : " + requests.length);
        System.out.println("Database calls : " + databaseCalls);
    }
}
''' + OUT),
    project(
        'Fort Visitor Register',
        'a console program that reads a visit log and uses three HashMaps (fees, ticket counts, visitor names) to print a report per fort.',
        [
            'Step 1: create the log of visits (fort, visitor, tickets).',
            'Step 2: keep the entry fee of each fort in a <code>Map&lt;String, Integer&gt;</code>.',
            'Step 3: count tickets per fort with <code>merge</code>.',
            'Step 4: group visitor names per fort with <code>computeIfAbsent</code>.',
            'Step 5: compute revenue = tickets x fee, and find the busiest fort.',
            'Step 6: print the report in A to Z order and test a fort that has no fee.',
        ],
        r'''// Sample project: Fort Visitor Register built on HashMap
import java.util.*;

public class HmVisitorRegister {
    record Visit(String fort, String visitor, int tickets) { }

    public static void main(String[] args) {
        // Step 1: the visit log
        List<Visit> log = List.of(
                new Visit("Raigad", "Asha", 2),
                new Visit("Torna", "Ravi", 1),
                new Visit("Raigad", "Meera", 3),
                new Visit("Sinhagad", "Asha", 4),
                new Visit("Torna", "Kiran", 2),
                new Visit("Raigad", "Ravi", 1),
                new Visit("Panhala", "Meera", 1));

        // Step 2: entry fee per ticket
        Map<String, Integer> fee = new HashMap<>();
        fee.put("Raigad", 50);
        fee.put("Torna", 30);
        fee.put("Sinhagad", 20);

        // Step 3: tickets per fort
        Map<String, Integer> tickets = new HashMap<>();
        // Step 4: visitor names per fort
        Map<String, List<String>> visitors = new HashMap<>();
        for (Visit v : log) {
            tickets.merge(v.fort(), v.tickets(), Integer::sum);
            visitors.computeIfAbsent(v.fort(), k -> new ArrayList<>()).add(v.visitor());
        }

        // Step 5: revenue per fort (a fort without a fee is skipped) and the busiest fort
        Map<String, Integer> revenue = new HashMap<>();
        for (Map.Entry<String, Integer> e : tickets.entrySet()) {
            Integer perTicket = fee.get(e.getKey());
            if (perTicket != null) {
                revenue.put(e.getKey(), e.getValue() * perTicket);
            }
        }
        String busiest = Collections.max(tickets.entrySet(), Map.Entry.comparingByValue()).getKey();

        // Step 6: report in A to Z order
        System.out.println("Fort        Tickets  Revenue  Visitors");
        for (String fort : new TreeMap<>(tickets).keySet()) {
            System.out.printf("%-10s  %7d  %7s  %s%n", fort, tickets.get(fort),
                    revenue.containsKey(fort) ? revenue.get(fort) : "no fee", visitors.get(fort));
        }
        System.out.println("Busiest fort : " + busiest);
        System.out.println("Total revenue: " + revenue.values().stream().mapToInt(Integer::intValue).sum());
    }
}
''' + OUT),
]

HM_PRACTICE = [
    practice(
        'Area-code directory (add, update, search, remove)',
        'Build a tiny telephone directory with a <code>HashMap</code> and use the main methods once each.',
        ['Add Pune=20, Mumbai=22, Nagpur=712 with <code>put</code>.',
         'Update Nagpur to 7122 and print the old value that <code>put</code> returns.',
         'Look up Pune and an unknown city using <code>getOrDefault</code>.',
         'Remove Mumbai and print the directory in A to Z order.'],
        r'''// Practice: area-code directory
import java.util.*;

public class HmDirectoryPractice {
    public static void main(String[] args) {
        Map<String, Integer> dir = new HashMap<>();
        dir.put("Pune", 20);
        dir.put("Mumbai", 22);
        dir.put("Nagpur", 712);

        Integer old = dir.put("Nagpur", 7122);                    // update returns the old value
        System.out.println("Old Nagpur code: " + old);
        System.out.println("Pune  : " + dir.getOrDefault("Pune", 0));
        System.out.println("Delhi : " + dir.getOrDefault("Delhi", 0));

        dir.remove("Mumbai");
        System.out.println("Directory: " + new TreeMap<>(dir));
    }
}
''' + OUT,
        level='Easy',
        hints=['<code>put</code> on an existing key returns the previous value.', 'Wrap the map in <code>new TreeMap&lt;&gt;(map)</code> to print it in a fixed order.']),
    practice(
        'Busiest district (group, count, tie-break)',
        'Each fort belongs to a district. Given a visit log of fort names, find the district with the most visits. If two districts tie, the one that comes first alphabetically wins.',
        ['Store fort to district in a <code>HashMap</code>.',
         'For every visit, look up the district and count it with <code>merge</code>.',
         'Choose the winner with a comparator: count descending, then name ascending.'],
        r'''// Practice: busiest district with a tie-break
import java.util.*;

public class HmBusiestDistrict {
    public static void main(String[] args) {
        Map<String, String> districtOf = new HashMap<>();
        districtOf.put("Raigad", "Raigad");
        districtOf.put("Torna", "Pune");
        districtOf.put("Sinhagad", "Pune");
        districtOf.put("Lohagad", "Pune");
        districtOf.put("Panhala", "Kolhapur");
        districtOf.put("Pratapgad", "Satara");

        String[] visits = {"Torna", "Panhala", "Raigad", "Sinhagad", "Panhala", "Raigad", "Pratapgad", "Lohagad", "Panhala", "Raigad"};

        Map<String, Integer> perDistrict = new HashMap<>();
        for (String fort : visits) {
            perDistrict.merge(districtOf.get(fort), 1, Integer::sum);
        }
        System.out.println("Counts: " + new TreeMap<>(perDistrict));

        Map.Entry<String, Integer> best = perDistrict.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .findFirst().get();
        System.out.println("Busiest: " + best.getKey() + " (" + best.getValue() + " visits)");
    }
}
''' + OUT,
        level='Medium',
        hints=['Pune and Kolhapur-style ties are settled by <code>thenComparing(Map.Entry.comparingByKey())</code>.']),
    practice(
        'Counting climbing routes with a memo map',
        'A trekker climbs a fort one or two steps at a time. The number of ways to reach step n is ways(n-1) + ways(n-2). A plain recursion repeats the same work millions of times. Use a <code>HashMap</code> as a memo to make it fast.',
        ['Write a recursive <code>ways(int n, Map&lt;Integer, Long&gt; memo)</code>.',
         'Return 1 for n = 1 and 2 for n = 2.',
         'Before computing, look in the memo; after computing, store the answer.',
         'Print ways(40) and the number of values saved in the memo.'],
        r'''// Practice: memoization with HashMap
import java.util.*;

public class HmMemoRoutes {
    static long ways(int n, Map<Integer, Long> memo) {
        if (n <= 2) {
            return n;                                 // 1 way for 1 step, 2 ways for 2 steps
        }
        Long saved = memo.get(n);
        if (saved != null) {
            return saved;                             // already solved: reuse
        }
        long result = ways(n - 1, memo) + ways(n - 2, memo);
        memo.put(n, result);                          // remember for next time
        return result;
    }

    public static void main(String[] args) {
        Map<Integer, Long> memo = new HashMap<>();
        System.out.println("Ways to climb 40 steps: " + ways(40, memo));
        System.out.println("Values saved in memo  : " + memo.size());
    }
}
''' + OUT,
        level='Medium',
        hints=['Use get-then-put rather than <code>computeIfAbsent</code> in a recursive call on a HashMap.']),
    practice(
        'Day-ranges that add up to a target (prefix sums)',
        'A trek log lists the height gained each day (it can be negative on a descent). Count how many <strong>continuous</strong> day ranges gain exactly 7 m in total, and find the length of the longest such range, in one pass.',
        ['Keep a running sum. For each day, the number of earlier prefix sums equal to <code>sum - target</code> is the number of ranges ending today.',
         'Store prefix sums in a <code>HashMap&lt;Integer, Integer&gt;</code> (sum to how many times seen). Start with {0 = 1}.',
         'For the longest range keep a second map: prefix sum to the <strong>first</strong> index where it appeared.'],
        r'''// Practice: subarray sum with a HashMap of prefix sums
import java.util.*;

public class HmPrefixSums {
    public static void main(String[] args) {
        int[] gain = {3, 4, 7, 2, -3, 1, 4, 2};
        int target = 7;

        Map<Integer, Integer> seenCount = new HashMap<>();   // prefix sum -> how many times
        Map<Integer, Integer> firstIndex = new HashMap<>();  // prefix sum -> first index
        seenCount.put(0, 1);
        firstIndex.put(0, -1);

        int sum = 0, ranges = 0, longest = 0;
        for (int i = 0; i < gain.length; i++) {
            sum += gain[i];
            ranges += seenCount.getOrDefault(sum - target, 0);     // ranges that end at day i
            Integer start = firstIndex.get(sum - target);
            if (start != null) {
                longest = Math.max(longest, i - start);
            }
            seenCount.merge(sum, 1, Integer::sum);
            firstIndex.putIfAbsent(sum, i);                        // keep the earliest index only
        }
        System.out.println("Ranges that add up to " + target + ": " + ranges);
        System.out.println("Longest range (days): " + longest);
    }
}
''' + OUT,
        level='Hard',
        hints=['A range from day a+1 to day b has sum prefix[b] - prefix[a].', '<code>putIfAbsent</code> keeps the first index, which gives the longest range.']),
]


EXTRAS['hashmap'] = {'beginner': HM_BEGINNER, 'intermediate': HM_INTERMEDIATE,
                   'expert': HM_EXPERT + add_practice('hashmap', HM_PRACTICE)}


# ======================================================================================================================
# LINKEDHASHMAP
# ======================================================================================================================
LHM_BEGINNER = [
    section(
        'Benefits and advantages',
        '<strong>For freshers:</strong> a LinkedHashMap is a HashMap that <strong>remembers the order</strong> in which you added things. Why use it:',
        [
            '<strong>Predictable order.</strong> Printing or looping gives the pairs in the order you inserted them, every time.',
            '<strong>Still fast.</strong> <code>get</code>, <code>put</code> and <code>containsKey</code> are O(1), just like HashMap.',
            '<strong>Easy sorted results.</strong> Sort entries with a stream, collect into a LinkedHashMap, and the sorted order sticks.',
            '<strong>Built-in LRU cache.</strong> With access order on, the entry you used last moves to the end, and <code>removeEldestEntry</code> drops the oldest one.',
            '<strong>Stable output.</strong> Reports, JSON-like printing and tests give the same text on every run.',
            '<strong>Java 21 bonus.</strong> It is a <code>SequencedMap</code>: <code>firstEntry()</code>, <code>lastEntry()</code>, <code>putFirst()</code>, <code>reversed()</code> work directly.',
            '<strong>For experienced developers:</strong> it is a HashMap whose entries are also linked in a doubly linked list, so iteration is O(n) (not O(n + capacity)) and often faster than HashMap for sparse tables. Cost: two extra references per entry.',
        ],
    ),
    (
        '<h3>Disadvantages and when NOT to use it</h3>\n'
        '<p><strong>For freshers:</strong> the order is free to read, but it is not free to keep. Know the limits:</p>\n'
        + ul([
            '<strong>Not sorted.</strong> The order is insertion order, not A to Z or small to large. Use <code>TreeMap</code> for a real sort.',
            '<strong>More memory than HashMap.</strong> Every entry carries two extra links (before and after).',
            '<strong>Slightly slower writes</strong> than HashMap, because the links must be updated too.',
            '<strong>Not thread-safe.</strong> Wrap with <code>Collections.synchronizedMap</code> if threads share it.',
            '<strong>Re-putting a key does not move it</strong> in the default mode; the old position stays. Remove it first if you want it at the end.',
            '<strong>For experienced developers:</strong> in access-order mode even <code>get</code> changes the structure, so reading while iterating throws <code>ConcurrentModificationException</code>, and reads are no longer safe to do concurrently without locking.',
        ])
        + '\n<p>Quick guide:</p>\n'
        + table(['Use a LinkedHashMap when', 'Use something else when'], [
            ['You need the pairs in the order they arrived', 'Order does not matter and memory is tight: <code>HashMap</code>'],
            ['You build a report or a sorted snapshot and print it', 'The map must <strong>stay</strong> sorted as you add: <code>TreeMap</code>'],
            ['You want a small LRU cache or bounded history', 'You need a big concurrent cache: a cache library or <code>ConcurrentHashMap</code>'],
            ['You group things and keep first-seen order', 'You need range queries (floor, ceiling): <code>TreeMap</code>'],
        ]),
        [],
    ),
]

LHM_INTERMEDIATE = [
    section(
        'Module: Sorting methods',
        '<strong>For freshers:</strong> a LinkedHashMap cannot sort itself either, but it is the best <em>home</em> for sorted data: whatever order you insert is the order you get back. '
        '<strong>For experienced developers:</strong> sorting is always "produce a sorted sequence, then insert in that order"; the cost is the O(n log n) sort. Access order and <code>reversed()</code> cover the other orderings.'),
    method(
        'Sort by key: TreeMap, then LinkedHashMap', 'new LinkedHashMap<>(new TreeMap<>(map))', 'a <code>LinkedHashMap</code> whose order is the sorted key order', 'O(n log n)',
        'Copy the pairs into a <code>TreeMap</code> (sorts the keys), then copy that into a <code>LinkedHashMap</code>. The result is a fixed, key-sorted snapshot.',
        'If you only need to print, the <code>TreeMap</code> alone is enough. The extra copy is useful when later code must add new keys <em>after</em> the sorted ones without re-sorting.',
        r'''// Sort a LinkedHashMap by key
import java.util.*;

public class LhmSortByKey {
    public static void main(String[] args) {
        Map<String, Integer> stops = new LinkedHashMap<>();
        stops.put("Torna", 5);
        stops.put("Raigad", 6);
        stops.put("Lohagad", 2);
        System.out.println("Insertion order: " + stops);

        Map<String, Integer> byKey = new LinkedHashMap<>(new TreeMap<>(stops));   // TreeMap sorts, LinkedHashMap keeps
        System.out.println("Sorted by key  : " + byKey);
    }
}
''' + OUT),
    method(
        'Sort by value: stream into a new LinkedHashMap', 'entrySet().stream().sorted(comparingByValue()).collect(toMap(..., LinkedHashMap::new))', 'a new <code>LinkedHashMap</code> sorted by value', 'O(n log n)',
        'Stream the entries, sort them by value and collect into a <code>LinkedHashMap</code>. The sorted order is kept because that map remembers insertion order.',
        'The four-argument <code>Collectors.toMap</code> needs a merge function; <code>(a, b) -> a</code> is fine because keys are unique. The original map is untouched.',
        r'''// Sort a LinkedHashMap by value (hours, small to large)
import java.util.*;
import java.util.stream.Collectors;

public class LhmSortByValue {
    public static void main(String[] args) {
        Map<String, Integer> hours = new LinkedHashMap<>();
        hours.put("Torna", 5);
        hours.put("Raigad", 6);
        hours.put("Lohagad", 2);

        Map<String, Integer> sorted = hours.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())                       // by hours
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
        System.out.println(sorted);
    }
}
''' + OUT),
    method(
        'reversed(): the map in the opposite order (Java 21)', 'SequencedMap<K, V> reversed()', 'a live reverse-order <strong>view</strong> of the same map', 'O(1) to create',
        'Want the newest first? <code>reversed()</code> gives the same pairs from last to first. It is a <strong>view</strong>, not a copy, so it costs almost nothing.',
        'Because it is a view, changes show through in both directions. Copy it with <code>new LinkedHashMap&lt;&gt;(map.reversed())</code> if you need a separate map. This replaces the old trick of copying keys into a list and calling <code>Collections.reverse</code>.',
        r'''// Reverse the order of a LinkedHashMap (Java 21)
import java.util.*;

public class LhmReversed {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> route = new LinkedHashMap<>();
        route.put("Pune", 1);
        route.put("Lonavala", 2);
        route.put("Mumbai", 3);

        System.out.println("Forward : " + route);
        System.out.println("Backward: " + route.reversed());       // a view: same data, last first
    }
}
''' + OUT),
    method(
        'Access order: move the used entry to the end', 'new LinkedHashMap<>(16, 0.75f, true)', 'a map ordered by <strong>last use</strong>, not by first insert', 'O(1) per access',
        'Pass <code>true</code> as the third constructor argument and every <code>get</code> or <code>put</code> of a key moves that entry to the <strong>end</strong>. The first entry is then the one used longest ago.',
        'This is the engine of an LRU cache: add <code>removeEldestEntry</code> to drop the first entry when the map is too big. Remember that <code>get</code> now modifies the map.',
        r'''// Access order: most recently used goes to the end
import java.util.*;

public class LhmAccessOrder {
    public static void main(String[] args) {
        Map<String, Integer> recent = new LinkedHashMap<>(16, 0.75f, true);   // true = access order
        recent.put("Raigad", 1);
        recent.put("Torna", 2);
        recent.put("Sinhagad", 3);

        recent.get("Raigad");                          // using Raigad moves it to the end
        System.out.println(recent);
    }
}
''' + OUT),
    method(
        'Move an entry to the front or the end by hand', 'putFirst(k, v) / putLast(k, v)', 'the previous value or <code>null</code>', 'O(1)',
        'In Java 21 you can place a pair exactly where you want: <code>putFirst</code> puts it at the start, <code>putLast</code> at the end. If the key already exists it is <strong>moved</strong> there.',
        'Before Java 21 you had to <code>remove</code> then <code>put</code> to move a key to the end, and there was no way to insert at the front. Both new methods are O(1) because of the linked list.',
        r'''// putFirst and putLast reorder a LinkedHashMap (Java 21)
import java.util.*;

public class LhmPutFirstLast {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> queue = new LinkedHashMap<>();
        queue.put("Torna", 2);
        queue.put("Raigad", 3);
        queue.put("Sinhagad", 1);

        queue.putFirst("Sinhagad", 1);       // existing key: moved to the front
        queue.putLast("Torna", 2);           // existing key: moved to the end
        queue.putFirst("Lohagad", 9);        // new key: inserted at the front
        System.out.println(queue);
    }
}
''' + OUT),
    (
        '<p><strong>Which ordering approach to pick?</strong></p>\n' + table(['You want', 'Use', 'Note'], [
            ['Keys A to Z, kept as a snapshot', '<code>new LinkedHashMap&lt;&gt;(new TreeMap&lt;&gt;(map))</code>', 'new keys are appended, not sorted in'],
            ['Sorted by value', 'stream + <code>sorted</code> + <code>toMap(..., LinkedHashMap::new)</code>', 'copy; original unchanged'],
            ['Newest first', '<code>map.reversed()</code>', 'view, O(1)'],
            ['Order by last use (LRU)', 'constructor with <code>accessOrder = true</code>', '<code>get</code> reorders'],
            ['Put one entry first or last', '<code>putFirst</code> / <code>putLast</code>', 'Java 21'],
        ]),
        [],
    ),
    section(
        'Module: Finding (searching) methods',
        '<strong>For freshers:</strong> everything that finds in a HashMap works here, and because the order is fixed, "find the first" and "find the last" have a clear answer. '
        '<strong>For experienced developers:</strong> key lookups are O(1); first/last are O(1) thanks to the linked list; scans by value or condition are O(n) but deterministic.'),
    method(
        'get, getOrDefault and containsKey', 'V get(Object key) / boolean containsKey(Object key)', 'the value (or <code>null</code>), or <code>true</code>/<code>false</code>', 'O(1)',
        'The same as in HashMap: look up by key. <code>getOrDefault</code> gives your own value when the key is missing.',
        'In an access-order map each of these calls also moves the entry to the end. If you must peek without changing the order, use <code>containsKey</code> first only when order does not matter, or use a normal (insertion-order) map.',
        r'''// Find by key in a LinkedHashMap
import java.util.*;

public class LhmFindByKey {
    public static void main(String[] args) {
        Map<String, Integer> hours = new LinkedHashMap<>();
        hours.put("Torna", 5);
        hours.put("Raigad", 6);

        System.out.println(hours.get("Torna"));                    // 5
        System.out.println(hours.getOrDefault("Panhala", 0));      // 0: not found
        System.out.println(hours.containsKey("Raigad"));           // true
    }
}
''' + OUT),
    method(
        'firstEntry and lastEntry: the oldest and the newest (Java 21)', 'Map.Entry<K, V> firstEntry() / lastEntry()', 'the first / last entry, or <code>null</code> if empty', 'O(1)',
        'Find the entry that was added first or last without looping. Great for "what is the oldest item?" or "what was added most recently?".',
        'The returned entry is a snapshot: it does not change if the map changes later. Before Java 21 you needed <code>map.entrySet().iterator().next()</code> for the first and a full loop for the last.',
        r'''// firstEntry / lastEntry (Java 21)
import java.util.*;

public class LhmFirstLast {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> log = new LinkedHashMap<>();
        log.put("Pune", 10);
        log.put("Nashik", 20);
        log.put("Nagpur", 30);

        System.out.println("Oldest : " + log.firstEntry());
        System.out.println("Newest : " + log.lastEntry());
    }
}
''' + OUT),
    method(
        'pollFirstEntry and pollLastEntry: find and remove', 'Map.Entry<K, V> pollFirstEntry() / pollLastEntry()', 'the removed entry, or <code>null</code> if empty', 'O(1)',
        'Like <code>firstEntry</code>, but it also <strong>removes</strong> the entry. Use it to treat the map as a queue: take the oldest one and process it.',
        'Useful for bounded histories and FIFO caches. Calling it in a loop until the map is empty drains the map in insertion order.',
        r'''// pollFirstEntry takes the oldest entry out (Java 21)
import java.util.*;

public class LhmPollFirst {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> waiting = new LinkedHashMap<>();
        waiting.put("Asha", 1);
        waiting.put("Ravi", 2);
        waiting.put("Meera", 3);

        Map.Entry<String, Integer> next = waiting.pollFirstEntry();    // oldest leaves the map
        System.out.println("Serving: " + next.getKey());
        System.out.println("Still waiting: " + waiting);
    }
}
''' + OUT),
    method(
        'Find the key for a value (first match)', 'for (Map.Entry e : map.entrySet())', 'the first key (in map order) that has the value', 'O(n)',
        'Loop over the entries and stop at the first match. Unlike HashMap, "first" has a clear meaning here: the earliest inserted key that has this value.',
        'If many keys share the value, you get the earliest one every time, so results are repeatable. For many value lookups build a reverse map.',
        r'''// Find the first key that has a value
import java.util.*;

public class LhmFindKeyByValue {
    public static void main(String[] args) {
        Map<String, Integer> hours = new LinkedHashMap<>();
        hours.put("Torna", 5);
        hours.put("Raigad", 6);
        hours.put("Rajgad", 5);              // also 5

        for (Map.Entry<String, Integer> e : hours.entrySet()) {
            if (e.getValue() == 5) {
                System.out.println("First stop with 5 hours: " + e.getKey());   // Torna, not Rajgad
                break;
            }
        }
    }
}
''' + OUT),
    method(
        'Stream filter and findFirst', 'entrySet().stream().filter(...).findFirst()', 'an <code>Optional</code> of the first matching entry', 'O(n), stops early',
        'Describe what you are looking for with a rule and take the first match. Because the order is fixed, <code>findFirst</code> always returns the same entry.',
        'The stream stops as soon as it finds a match. <code>Optional</code> forces you to handle "not found" (<code>orElse</code>, <code>ifPresent</code>).',
        r'''// First stop that takes 6 hours or more
import java.util.*;

public class LhmFindFirst {
    public static void main(String[] args) {
        Map<String, Integer> hours = new LinkedHashMap<>();
        hours.put("Sinhagad", 2);
        hours.put("Torna", 5);
        hours.put("Raigad", 6);
        hours.put("Harishchandragad", 7);

        hours.entrySet().stream()
                .filter(e -> e.getValue() >= 6)                 // the rule
                .findFirst()                                    // first in map order
                .ifPresentOrElse(e -> System.out.println("Found: " + e.getKey()),
                                 () -> System.out.println("None"));
    }
}
''' + OUT),
    method(
        'Find by position (nth entry)', 'new ArrayList<>(map.keySet()).get(index)', 'the key at that position', 'O(n)',
        'A map has no index, but the order is fixed, so "the 2nd stop" has a meaning. Copy the keys into a list and use <code>get(index)</code>.',
        'Copying is O(n); for one-off lookups skip the copy and use <code>stream().skip(i).findFirst()</code>. If you need positions often, a <code>List</code> is the better structure.',
        r'''// Find the key at a position
import java.util.*;

public class LhmFindByPosition {
    public static void main(String[] args) {
        Map<String, Integer> route = new LinkedHashMap<>();
        route.put("Pune", 0);
        route.put("Lonavala", 65);
        route.put("Mumbai", 150);

        List<String> order = new ArrayList<>(route.keySet());     // keys in map order
        System.out.println("Second stop: " + order.get(1));
        System.out.println("Last stop  : " + order.get(order.size() - 1));
    }
}
''' + OUT),
    (
        '<p><strong>Which finding method to pick?</strong></p>\n' + table(['Question', 'Method', 'Time'], [
            ['Value for a key / does a key exist', '<code>get</code>, <code>getOrDefault</code>, <code>containsKey</code>', 'O(1)'],
            ['Oldest / newest entry', '<code>firstEntry</code> / <code>lastEntry</code>', 'O(1)'],
            ['Take the oldest out', '<code>pollFirstEntry</code>', 'O(1)'],
            ['First key with a value', 'loop over <code>entrySet()</code>', 'O(n)'],
            ['First entry matching a rule', '<code>stream().filter(...).findFirst()</code>', 'O(n)'],
            ['The nth entry', 'copy keys to a <code>List</code>, then <code>get(i)</code>', 'O(n)'],
        ]),
        [],
    ),
]


LHM_EXPERT = [
    section(
        'Real-time examples',
        'Three small jobs where the <em>order</em> of the pairs matters, so a LinkedHashMap is the right tool.'),
    scen(
        'Scenario 1: Menu that prints in the order it was defined',
        '<strong>For freshers:</strong> a console menu must show options as 1, 2, 3 in the order you wrote them. A HashMap could shuffle them; a LinkedHashMap cannot. '
        '<strong>For experienced developers:</strong> use it for configuration, column definitions and anything where order is part of the data.',
        r'''// Real-time example: an ordered menu
import java.util.*;

public class LhmMenu {
    public static void main(String[] args) {
        Map<Integer, String> menu = new LinkedHashMap<>();
        menu.put(1, "View forts");
        menu.put(2, "Book a trek");
        menu.put(3, "Cancel booking");
        menu.put(0, "Exit");                         // printed last because it was added last

        for (Map.Entry<Integer, String> item : menu.entrySet()) {
            System.out.println(item.getKey() + ". " + item.getValue());
        }
        int choice = 2;
        System.out.println("You chose: " + menu.get(choice));
    }
}
''' + OUT),
    scen(
        'Scenario 2: City visits in first-seen order',
        '<strong>For freshers:</strong> a trip log lists cities again and again. We want each city once, with its count, in the order the trip first reached it. '
        '<strong>For experienced developers:</strong> <code>merge</code> on a LinkedHashMap keeps the original position of a key when its value is updated, which is exactly "first appearance order".',
        r'''// Real-time example: count visits, keep first-seen order
import java.util.*;

public class LhmFirstSeen {
    public static void main(String[] args) {
        String[] trip = {"Pune", "Nashik", "Pune", "Nagpur", "Nashik", "Pune", "Kolhapur"};

        Map<String, Integer> visits = new LinkedHashMap<>();
        for (String city : trip) {
            visits.merge(city, 1, Integer::sum);      // existing key keeps its place
        }
        System.out.println(visits);
    }
}
''' + OUT),
    scen(
        'Scenario 3: Last 3 searches (bounded history)',
        '<strong>For freshers:</strong> a search box remembers only the last three searches. When a fourth arrives, the oldest is dropped. '
        '<strong>For experienced developers:</strong> overriding <code>removeEldestEntry</code> turns the map into a size-limited FIFO. It is called after every <code>put</code>; return <code>true</code> to remove the eldest entry.',
        r'''// Real-time example: bounded search history
import java.util.*;

public class LhmSearchHistory {
    public static void main(String[] args) {
        Map<String, Integer> history = new LinkedHashMap<>() {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
                return size() > 3;                    // keep at most 3 entries
            }
        };
        String[] searches = {"Raigad", "Torna", "Sinhagad", "Panhala", "Lohagad"};
        int number = 1;
        for (String s : searches) {
            history.put(s, number++);
            System.out.println("After " + s + ": " + history.keySet());
        }
    }
}
''' + OUT),
    project(
        'Fort Tour Itinerary Planner',
        'a console planner that keeps tour stops in order with a <code>LinkedHashMap</code>, lets you insert, move and reverse stops, and prints a timeline.',
        [
            'Step 1: add stops in visiting order (stop name to hours spent).',
            'Step 2: insert an early stop at the front with <code>putFirst</code>.',
            'Step 3: move one stop to the end with <code>putLast</code>.',
            'Step 4: print a timeline with the clock time each stop starts (start at 8:00).',
            'Step 5: find the longest stop and the total hours.',
            'Step 6: print the return journey with <code>reversed()</code>.',
        ],
        r'''// Sample project: Fort Tour Itinerary Planner (LinkedHashMap, Java 21)
import java.util.*;

public class LhmTourPlanner {
    static void printTimeline(String title, Map<String, Integer> stops) {
        System.out.println(title);
        int clock = 8;                                             // the tour starts at 8:00
        for (Map.Entry<String, Integer> stop : stops.entrySet()) {
            System.out.printf("  %02d:00  %-10s (%d h)%n", clock, stop.getKey(), stop.getValue());
            clock += stop.getValue();
        }
        System.out.printf("  %02d:00  tour ends%n", clock);
    }

    public static void main(String[] args) {
        // Step 1: stops in visiting order
        LinkedHashMap<String, Integer> plan = new LinkedHashMap<>();
        plan.put("Sinhagad", 2);
        plan.put("Purandar", 3);
        plan.put("Torna", 4);
        printTimeline("Initial plan", plan);

        // Step 2: a quick breakfast stop is added at the front
        plan.putFirst("Lohagad", 1);

        // Step 3: Sinhagad has the best sunset view, so it moves to the end
        plan.putLast("Sinhagad", 2);
        printTimeline("Updated plan", plan);

        // Step 5: longest stop and total hours
        Map.Entry<String, Integer> longest = Collections.max(plan.entrySet(), Map.Entry.comparingByValue());
        int total = plan.values().stream().mapToInt(Integer::intValue).sum();
        System.out.println("Longest stop : " + longest.getKey() + " (" + longest.getValue() + " h)");
        System.out.println("Total hours  : " + total);
        System.out.println("First / last : " + plan.firstEntry().getKey() + " / " + plan.lastEntry().getKey());

        // Step 6: the way back is the same map, reversed
        System.out.println("Return route : " + String.join(" -> ", plan.reversed().keySet()));
    }
}
''' + OUT),
]

LHM_PRACTICE = [
    practice(
        'Unique cities in arrival order',
        'A booking list contains repeated city names. Print every city <strong>once</strong>, in the order it first appeared, with the number of bookings.',
        ['Create a <code>LinkedHashMap&lt;String, Integer&gt;</code>.', 'Use <code>merge</code> for each city.', 'Print one line per city.'],
        r'''// Practice: first-seen order with counts
import java.util.*;

public class LhmUniqueCities {
    public static void main(String[] args) {
        String[] bookings = {"Nashik", "Pune", "Nashik", "Nagpur", "Pune", "Nashik"};
        Map<String, Integer> count = new LinkedHashMap<>();
        for (String city : bookings) {
            count.merge(city, 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> e : count.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }
    }
}
''' + OUT,
        level='Easy',
        hints=['<code>merge</code> keeps the position of a key that already exists.']),
    practice(
        'Recently viewed forts, newest first',
        'A page shows the last forts a user opened, <strong>newest first</strong>, with no repeats. Opening a fort that is already in the list moves it to the top. Keep at most 4.',
        ['Use a <code>LinkedHashMap</code> and <code>putLast</code> for every view (it moves a repeat to the end).',
         'If the size goes above 4, remove the first entry with <code>pollFirstEntry</code>.',
         'Print the result with <code>reversed()</code> so the newest comes first.'],
        r'''// Practice: recently viewed list (Java 21)
import java.util.*;

public class LhmRecentlyViewed {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> viewed = new LinkedHashMap<>();
        String[] opens = {"Raigad", "Torna", "Sinhagad", "Raigad", "Panhala", "Lohagad", "Torna"};

        for (String fort : opens) {
            viewed.putLast(fort, 1);                 // new fort goes to the end; a repeat is moved there
            if (viewed.size() > 4) {
                viewed.pollFirstEntry();             // drop the oldest
            }
        }
        System.out.println("Newest first: " + viewed.reversed().keySet());
    }
}
''' + OUT,
        level='Medium',
        hints=['A repeated <code>putLast</code> moves the key; it does not add a second entry.']),
    practice(
        'Merge two ordered itineraries',
        'Two guides each keep a LinkedHashMap of stop to hours. Merge them: stops of guide A first (in A order), then the new stops of guide B (in B order). For a stop in both, keep the larger number of hours.',
        ['Copy A into the result.', 'For every entry of B, use <code>merge(stop, hours, Math::max)</code>.', 'Print the result and prove that A\'s order was kept.'],
        r'''// Practice: merge two ordered maps
import java.util.*;

public class LhmMergeItineraries {
    public static void main(String[] args) {
        Map<String, Integer> a = new LinkedHashMap<>();
        a.put("Sinhagad", 2);
        a.put("Torna", 4);
        a.put("Raigad", 5);

        Map<String, Integer> b = new LinkedHashMap<>();
        b.put("Lohagad", 1);
        b.put("Torna", 6);
        b.put("Panhala", 3);

        Map<String, Integer> merged = new LinkedHashMap<>(a);      // A's order first
        for (Map.Entry<String, Integer> e : b.entrySet()) {
            merged.merge(e.getKey(), e.getValue(), Math::max);     // bigger hours win; new keys go to the end
        }
        System.out.println(merged);
    }
}
''' + OUT,
        level='Medium',
        hints=['<code>Math::max</code> works as the merge function for two <code>Integer</code> values.']),
    practice(
        'Leaderboard with ranks and shared places',
        'Given scores per trekker, print a leaderboard sorted by score (high first, then name). Trekkers with the same score share a rank, and the next rank skips (1, 2, 2, 4).',
        ['Sort the entries into a <code>LinkedHashMap</code> (score descending, name ascending).',
         'Walk through it, keep the rank of the previous score, and update it only when the score changes.',
         'Print rank, name and score.'],
        r'''// Practice: leaderboard with shared ranks
import java.util.*;
import java.util.stream.Collectors;

public class LhmLeaderboard {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Asha", 90);
        scores.put("Ravi", 75);
        scores.put("Meera", 90);
        scores.put("Kiran", 60);
        scores.put("Sana", 75);

        Map<String, Integer> board = scores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (x, y) -> x, LinkedHashMap::new));

        int position = 0, rank = 0, lastScore = -1;
        for (Map.Entry<String, Integer> e : board.entrySet()) {
            position++;
            if (e.getValue() != lastScore) {          // a new score gets the rank of its position
                rank = position;
                lastScore = e.getValue();
            }
            System.out.println(rank + ". " + e.getKey() + " " + e.getValue());
        }
    }
}
''' + OUT,
        level='Hard',
        hints=['Rank = position of the first trekker with that score.', '<code>e.getValue() != lastScore</code> compares ints after unboxing, which is fine here.']),
]

EXTRAS['linkedhashmap'] = {'beginner': LHM_BEGINNER, 'intermediate': LHM_INTERMEDIATE,
                           'expert': LHM_EXPERT + add_practice('linkedhashmap', LHM_PRACTICE)}


# ======================================================================================================================
# TREEMAP
# ======================================================================================================================
TM_BEGINNER = [
    section(
        'Benefits and advantages',
        '<strong>For freshers:</strong> a TreeMap is a map that <strong>keeps its keys sorted all the time</strong>, so you never sort it yourself. Why use it:',
        [
            '<strong>Always sorted.</strong> Keys come out A to Z (or small to large) every time you print or loop, with no extra code.',
            '<strong>"Nearest" questions are easy.</strong> <code>floorKey</code>, <code>ceilingKey</code>, <code>lowerKey</code>, <code>higherKey</code> answer "the closest key at or below / above this one".',
            '<strong>Range slices.</strong> <code>headMap</code>, <code>tailMap</code> and <code>subMap</code> give "everything before / after / between" in one call.',
            '<strong>Smallest and biggest at once.</strong> <code>firstKey</code> and <code>lastKey</code> need no loop.',
            '<strong>Custom order.</strong> Give it a <code>Comparator</code> for reverse order, case-insensitive order, or order by length.',
            '<strong>Predictable speed.</strong> Every operation is O(log n), never worse, even for many similar keys.',
            '<strong>For experienced developers:</strong> it is a red-black tree implementing <code>NavigableMap</code>. There is no hashing, so keys need no <code>hashCode</code>; <strong>equality is decided by the comparator</strong> (<code>compare == 0</code>). The sub-maps and descending map are live views, not copies.',
        ],
    ),
    (
        '<h3>Disadvantages and when NOT to use it</h3>\n'
        '<p><strong>For freshers:</strong> sorting has a price. Know when a TreeMap is the wrong choice:</p>\n'
        + ul([
            '<strong>Slower than HashMap.</strong> O(log n) instead of O(1) for <code>get</code> and <code>put</code>. For a million keys that is about 20 steps instead of 1.',
            '<strong>Keys must be comparable.</strong> They need to implement <code>Comparable</code>, or you must supply a <code>Comparator</code>; otherwise you get a <code>ClassCastException</code>.',
            '<strong>No null keys</strong> with natural ordering (a <code>NullPointerException</code>). Null values are allowed.',
            '<strong>Sorted by key only.</strong> It cannot keep the pairs sorted by value.',
            '<strong>Not thread-safe.</strong> Use <code>ConcurrentSkipListMap</code> for a sorted map shared by threads.',
            '<strong>For experienced developers:</strong> an inconsistent comparator (one that does not agree with <code>equals</code>) silently treats different keys as the same key and drops entries; tree nodes use more memory than hash nodes and have poor cache locality; changing a key object after inserting it breaks the ordering.',
        ])
        + '\n<p>Quick guide:</p>\n'
        + table(['Use a TreeMap when', 'Use something else when'], [
            ['You need keys always sorted', 'Order does not matter: <code>HashMap</code> is faster'],
            ['You ask "next / previous / between" questions', 'You only need insertion order: <code>LinkedHashMap</code>'],
            ['You build ranges, slabs, schedules or leaderboards by key', 'Many threads share it: <code>ConcurrentSkipListMap</code>'],
            ['You print a report sorted by name or date', 'You must sort by value: stream + <code>LinkedHashMap</code>'],
        ]),
        [],
    ),
]

TM_INTERMEDIATE = [
    section(
        'Module: Sorting methods',
        '<strong>For freshers:</strong> the TreeMap does the sorting for you, by <strong>key</strong>. Your job is only to choose the order: natural, reversed, or your own rule. '
        '<strong>For experienced developers:</strong> insertion costs O(log n) each, so building a TreeMap of n keys is O(n log n); once built, reading in order is O(n) with no extra sort.'),
    method(
        'Natural order: new TreeMap<>()', 'new TreeMap<>()', 'a map sorted by the keys\' natural order', 'O(log n) per put',
        'Put keys in any order; they come out sorted. Strings go A to Z (capital letters before small ones), numbers go small to large.',
        'Natural order uses <code>compareTo</code> of the key class, so String, Integer, LocalDate and enums work out of the box.',
        r'''// TreeMap sorts keys by natural order
import java.util.*;

public class TmNaturalOrder {
    public static void main(String[] args) {
        Map<String, Integer> heights = new TreeMap<>();
        heights.put("Torna", 1403);          // added in any order ...
        heights.put("Raigad", 1356);
        heights.put("Lohagad", 1033);
        heights.put("Panhala", 845);

        System.out.println(heights);         // ... printed A to Z
    }
}
''' + OUT),
    method(
        'Custom order: pass a Comparator', 'new TreeMap<>(Comparator<? super K> c)', 'a map sorted by your rule', 'O(log n) per put',
        'To change the order, give the constructor a <code>Comparator</code>. <code>Comparator.reverseOrder()</code> flips it; <code>String.CASE_INSENSITIVE_ORDER</code> ignores capital letters.',
        'The comparator also defines which keys are "equal": with case-insensitive order, "raigad" and "Raigad" are the same key, and the second <code>put</code> replaces the value but keeps the first spelling.',
        r'''// TreeMap with a Comparator: reverse and case-insensitive
import java.util.*;

public class TmComparatorOrder {
    public static void main(String[] args) {
        Map<String, Integer> reverse = new TreeMap<>(Comparator.reverseOrder());
        reverse.put("Pune", 20);
        reverse.put("Nagpur", 712);
        reverse.put("Mumbai", 22);
        System.out.println("Reverse        : " + reverse);

        Map<String, Integer> loose = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        loose.put("Raigad", 1);
        loose.put("raigad", 2);              // same key as "Raigad": the value is replaced
        loose.put("Torna", 3);
        System.out.println("Case-insensitive: " + loose);
    }
}
''' + OUT),
    method(
        'descendingMap and descendingKeySet', 'NavigableMap<K, V> descendingMap()', 'a live view of the map in reverse key order', 'O(1) to create',
        'Need the biggest key first? <code>descendingMap()</code> shows the same pairs from last to first, without building a new map.',
        'It is a view: changes to either map show in the other. <code>descendingKeySet()</code> does the same for just the keys. Iterating is still O(n).',
        r'''// descendingMap: the same data, biggest key first
import java.util.*;

public class TmDescending {
    public static void main(String[] args) {
        TreeMap<Integer, String> byHeight = new TreeMap<>();
        byHeight.put(1033, "Lohagad");
        byHeight.put(1403, "Torna");
        byHeight.put(1356, "Raigad");

        System.out.println("Ascending : " + byHeight);
        System.out.println("Descending: " + byHeight.descendingMap());
        System.out.println("Keys down : " + byHeight.descendingKeySet());
    }
}
''' + OUT),
    method(
        'Sort by value: stream into a LinkedHashMap', 'entrySet().stream().sorted(comparingByValue())', 'a <code>LinkedHashMap</code> in value order', 'O(n log n)',
        'A TreeMap sorts <em>only by key</em>. To order the pairs by <strong>value</strong>, stream the entries, sort them, and collect into a <code>LinkedHashMap</code>.',
        'A comparator that looks up the value inside a TreeMap (for example <code>(a, b) -> map.get(a) - map.get(b)</code>) is a classic bug: it breaks <code>get</code> and drops keys with equal values. Use the stream approach.',
        r'''// A TreeMap sorts by key; for value order use a stream
import java.util.*;
import java.util.stream.Collectors;

public class TmSortByValue {
    public static void main(String[] args) {
        Map<String, Integer> hours = new TreeMap<>();
        hours.put("Torna", 5);
        hours.put("Raigad", 6);
        hours.put("Lohagad", 2);

        Map<String, Integer> byHours = hours.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
        System.out.println("By key  : " + hours);
        System.out.println("By value: " + byHours);
    }
}
''' + OUT),
    method(
        'Re-sort with another order: copy with a new Comparator', 'TreeMap<K, V> other = new TreeMap<>(newComparator); other.putAll(map)', 'a new map in the new order', 'O(n log n)',
        'The order of a TreeMap is fixed when it is created. To get another order, make a second TreeMap with a different comparator and copy the pairs in with <code>putAll</code>.',
        'Here the order is "shortest name first, then A to Z". A comparator must be consistent: always return 0 only for keys you consider equal, so use <code>thenComparing</code> as a tie-break or keys will be lost.',
        r'''// Re-sort a TreeMap by name length, then A to Z
import java.util.*;

public class TmResort {
    public static void main(String[] args) {
        Map<String, Integer> codes = new TreeMap<>();
        codes.put("Pune", 20);
        codes.put("Nagpur", 712);
        codes.put("Mumbai", 22);
        codes.put("Agra", 562);

        Comparator<String> byLength = Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder());
        Map<String, Integer> other = new TreeMap<>(byLength);
        other.putAll(codes);                                  // copied in the new order

        System.out.println("A to Z  : " + codes);
        System.out.println("By length: " + other);
    }
}
''' + OUT),
    (
        '<p><strong>Which ordering approach to pick?</strong></p>\n' + table(['You want', 'Use', 'Note'], [
            ['Keys sorted naturally', '<code>new TreeMap&lt;&gt;()</code>', 'always sorted, even after later puts'],
            ['Reverse, case-insensitive or custom key order', '<code>new TreeMap&lt;&gt;(comparator)</code>', 'comparator also decides key equality'],
            ['The same map, biggest first', '<code>descendingMap()</code>', 'live view'],
            ['Pairs ordered by value', 'stream + <code>sorted</code> + <code>LinkedHashMap</code>', 'a snapshot; TreeMap cannot do it'],
        ]),
        [],
    ),
    section(
        'Module: Finding (searching) methods',
        '<strong>For freshers:</strong> a TreeMap can answer questions a HashMap cannot: "what is the next key after this?", "what is the closest key below?", "give me everything between A and B". '
        '<strong>For experienced developers:</strong> all key-based navigation is O(log n); value scans stay O(n). The range methods return views that cost O(log n) to create and let you read or even clear a whole range.'),
    method(
        'get, containsKey and containsValue', 'V get(Object key) / boolean containsKey(Object key) / boolean containsValue(Object value)', 'the value, or <code>true</code>/<code>false</code>', 'O(log n) by key, O(n) by value',
        'Look up by key as usual. Finding by key walks down the tree; finding by value must check the entries one by one.',
        'A TreeMap compares keys with the comparator, not <code>equals</code>, so <code>get</code> finds keys the comparator treats as equal. The key must be comparable with the stored keys or a <code>ClassCastException</code> follows.',
        r'''// Basic finding in a TreeMap
import java.util.*;

public class TmFindBasic {
    public static void main(String[] args) {
        Map<String, Integer> codes = new TreeMap<>();
        codes.put("Pune", 20);
        codes.put("Mumbai", 22);

        System.out.println(codes.get("Pune"));              // 20
        System.out.println(codes.containsKey("Delhi"));     // false
        System.out.println(codes.containsValue(22));        // true (scans the values)
    }
}
''' + OUT),
    method(
        'firstKey, lastKey, firstEntry, lastEntry', 'K firstKey() / K lastKey() / Map.Entry<K, V> firstEntry() / lastEntry()', 'the smallest / biggest key or entry', 'O(log n)',
        'The smallest and the biggest key are always at the ends. These methods return them with no loop.',
        '<code>firstKey</code> and <code>lastKey</code> throw <code>NoSuchElementException</code> on an empty map, while <code>firstEntry</code> and <code>lastEntry</code> return <code>null</code>. The entries are read-only snapshots.',
        r'''// Smallest and biggest key
import java.util.*;

public class TmFirstLast {
    public static void main(String[] args) {
        TreeMap<Integer, String> byHeight = new TreeMap<>();
        byHeight.put(1033, "Lohagad");
        byHeight.put(1403, "Torna");
        byHeight.put(845, "Panhala");

        System.out.println("Lowest key  : " + byHeight.firstKey());
        System.out.println("Tallest fort: " + byHeight.lastEntry().getValue());
        System.out.println("Shortest    : " + byHeight.firstEntry());
    }
}
''' + OUT),
    method(
        'floorKey, ceilingKey, lowerKey, higherKey', 'K floorKey(K k) / ceilingKey(K k) / lowerKey(K k) / higherKey(K k)', 'the closest key, or <code>null</code> if there is none', 'O(log n)',
        'Find the nearest key to a target. <strong>floor</strong> = biggest key at or below it, <strong>ceiling</strong> = smallest key at or above it, <strong>lower</strong> = strictly below, <strong>higher</strong> = strictly above.',
        'Each has an <code>...Entry</code> twin (<code>floorEntry</code>, ...) that returns the pair, saving a second lookup. They are the reason to choose a TreeMap for slabs, grades and schedules.',
        r'''// Nearest keys around 1200
import java.util.*;

public class TmFloorCeiling {
    public static void main(String[] args) {
        TreeMap<Integer, String> byHeight = new TreeMap<>();
        byHeight.put(845, "Panhala");
        byHeight.put(1033, "Lohagad");
        byHeight.put(1356, "Raigad");
        byHeight.put(1403, "Torna");

        System.out.println("floor(1200)   : " + byHeight.floorKey(1200));     // biggest key <= 1200
        System.out.println("ceiling(1200) : " + byHeight.ceilingKey(1200));   // smallest key >= 1200
        System.out.println("lower(1033)   : " + byHeight.lowerKey(1033));     // strictly below 1033
        System.out.println("higher(1403)  : " + byHeight.higherKey(1403));    // nothing above: null
    }
}
''' + OUT),
    method(
        'headMap, tailMap, subMap: find a range', 'SortedMap<K, V> headMap(K to) / tailMap(K from) / NavigableMap subMap(K from, boolean, K to, boolean)', 'a live view of the keys in the range', 'O(log n) to create',
        'Get "everything below", "everything from here up" or "everything between two keys". <code>headMap</code> excludes the end key by default; pass <code>true</code> to include it.',
        'The result is a <strong>view</strong>: clearing it removes those entries from the original, and putting a key outside its range throws <code>IllegalArgumentException</code>.',
        r'''// Range queries
import java.util.*;

public class TmRanges {
    public static void main(String[] args) {
        TreeMap<Integer, String> byHeight = new TreeMap<>();
        byHeight.put(845, "Panhala");
        byHeight.put(1033, "Lohagad");
        byHeight.put(1356, "Raigad");
        byHeight.put(1403, "Torna");

        System.out.println("Below 1356     : " + byHeight.headMap(1356));              // 1356 excluded
        System.out.println("1356 and above : " + byHeight.tailMap(1356));              // 1356 included
        System.out.println("1000 to 1356   : " + byHeight.subMap(1000, true, 1356, true));
    }
}
''' + OUT),
    method(
        'Find all matches by value or rule', 'entrySet().stream().filter(...)', 'the matching entries, in key order', 'O(n)',
        'Searching by value or by a condition scans every entry. In a TreeMap the matches come out already in key order, so no extra sort is needed.',
        '<code>Collections.max(map.entrySet(), comparingByValue())</code> finds the entry with the biggest value in O(n). If you search by value often, build a second TreeMap keyed by that value.',
        r'''// Find forts above 1300 m, and the tallest one
import java.util.*;

public class TmFindByRule {
    public static void main(String[] args) {
        Map<String, Integer> heights = new TreeMap<>();
        heights.put("Torna", 1403);
        heights.put("Raigad", 1356);
        heights.put("Lohagad", 1033);

        heights.entrySet().stream()
                .filter(e -> e.getValue() > 1300)                       // rule on the value
                .forEach(e -> System.out.println(e.getKey() + " " + e.getValue()));   // already A to Z

        Map.Entry<String, Integer> tallest = Collections.max(heights.entrySet(), Map.Entry.comparingByValue());
        System.out.println("Tallest: " + tallest.getKey());
    }
}
''' + OUT),
    (
        '<p><strong>Which finding method to pick?</strong></p>\n' + table(['Question', 'Method', 'Time'], [
            ['Value for a key, does a key exist', '<code>get</code>, <code>containsKey</code>', 'O(log n)'],
            ['Smallest / biggest key', '<code>firstKey</code> / <code>lastKey</code> (or the Entry versions)', 'O(log n)'],
            ['Closest key at or below / above', '<code>floorKey</code> / <code>ceilingKey</code>', 'O(log n)'],
            ['Closest key strictly below / above', '<code>lowerKey</code> / <code>higherKey</code>', 'O(log n)'],
            ['All keys before / after / between', '<code>headMap</code> / <code>tailMap</code> / <code>subMap</code>', 'O(log n) + size of result'],
            ['Entries matching a rule on the value', '<code>stream().filter(...)</code>', 'O(n)'],
        ]),
        [],
    ),
]


TM_EXPERT = [
    section(
        'Real-time examples',
        'Three jobs where sorted keys and "nearest key" questions make a TreeMap the natural choice.'),
    scen(
        'Scenario 1: Phone directory with prefix search',
        '<strong>For freshers:</strong> names are kept A to Z automatically, and a search box can list every name that starts with "Am". '
        '<strong>For experienced developers:</strong> <code>subMap(prefix, prefix + Character.MAX_VALUE)</code> is a prefix search in O(log n + k), where k is the number of matches. A HashMap would need a full scan.',
        r'''// Real-time example: phone directory with prefix search
import java.util.*;

public class TmPhoneDirectory {
    public static void main(String[] args) {
        TreeMap<String, String> phone = new TreeMap<>();
        phone.put("Meera", "98220-11111");
        phone.put("Amit", "98220-22222");
        phone.put("Aman", "98220-33333");
        phone.put("Anil", "98220-44444");
        phone.put("Chetan", "98220-55555");

        System.out.println("Directory: " + phone.keySet());              // already A to Z

        String prefix = "Am";
        // every key from "Am" up to (but not including) "Am" + the biggest character
        Map<String, String> matches = phone.subMap(prefix, prefix + Character.MAX_VALUE);
        System.out.println("Names starting with " + prefix + ": " + matches);
    }
}
''' + OUT),
    scen(
        'Scenario 2: Marks to grade',
        '<strong>For freshers:</strong> a grade does not belong to one mark but to a <em>range</em> of marks. Store only where each grade starts; <code>floorEntry</code> finds the grade whose start is at or below the mark. '
        '<strong>For experienced developers:</strong> this replaces a long chain of <code>if / else if</code> with data, so changing the slabs needs no code change. The same pattern fits tax slabs and shipping charges.',
        r'''// Real-time example: grade slabs with floorEntry
import java.util.*;

public class TmGradeSlabs {
    public static void main(String[] args) {
        TreeMap<Integer, String> grades = new TreeMap<>();
        grades.put(0, "F");          // marks 0 to 39
        grades.put(40, "D");
        grades.put(50, "C");
        grades.put(60, "B");
        grades.put(75, "A");
        grades.put(90, "A+");

        int[] marks = {35, 40, 59, 74, 75, 98};
        for (int m : marks) {
            String grade = grades.floorEntry(m).getValue();   // slab that starts at or below the mark
            System.out.println(m + " -> " + grade);
        }
    }
}
''' + OUT),
    scen(
        'Scenario 3: The fort closest to a height',
        '<strong>For freshers:</strong> a hiker asks "which fort is nearest to 1200 m?". The answer is either the closest fort below or the closest above; compare the two. '
        '<strong>For experienced developers:</strong> two O(log n) lookups (<code>floorEntry</code>, <code>ceilingEntry</code>) beat scanning all forts. Always check for <code>null</code>: one side may not exist.',
        r'''// Real-time example: nearest key
import java.util.*;

public class TmNearestFort {
    public static void main(String[] args) {
        TreeMap<Integer, String> byHeight = new TreeMap<>();
        byHeight.put(845, "Panhala");
        byHeight.put(1033, "Lohagad");
        byHeight.put(1312, "Sinhagad");
        byHeight.put(1403, "Torna");

        for (int target : new int[]{1200, 700, 1500}) {
            Map.Entry<Integer, String> below = byHeight.floorEntry(target);
            Map.Entry<Integer, String> above = byHeight.ceilingEntry(target);

            Map.Entry<Integer, String> nearest;
            if (below == null) {
                nearest = above;                                   // nothing lower
            } else if (above == null) {
                nearest = below;                                   // nothing higher
            } else {
                nearest = (target - below.getKey() <= above.getKey() - target) ? below : above;   // closer wins; tie -> lower
            }
            System.out.println("Nearest to " + target + " m: " + nearest.getValue() + " (" + nearest.getKey() + " m)");
        }
    }
}
''' + OUT),
    project(
        'Fort Height Explorer',
        'a console tool that stores forts in a <code>TreeMap</code> keyed by height and answers sorted, nearest and range questions.',
        [
            'Step 1: load forts into a <code>TreeMap&lt;Integer, String&gt;</code> (height to name).',
            'Step 2: print the list from tallest to shortest with <code>descendingMap</code>.',
            'Step 3: print the shortest and the tallest with <code>firstEntry</code> and <code>lastEntry</code>.',
            'Step 4: list the forts between two heights with <code>subMap</code>.',
            'Step 5: report the next taller and next shorter fort than a chosen one with <code>higherEntry</code> and <code>lowerEntry</code>.',
            'Step 6: remove every fort below 900 m with <code>headMap(900).clear()</code> and print what remains.',
        ],
        r'''// Sample project: Fort Height Explorer (TreeMap)
import java.util.*;

public class TmHeightExplorer {
    public static void main(String[] args) {
        // Step 1: load the forts (height in metres -> name)
        TreeMap<Integer, String> forts = new TreeMap<>();
        forts.put(1403, "Torna");
        forts.put(1356, "Raigad");
        forts.put(1312, "Sinhagad");
        forts.put(1033, "Lohagad");
        forts.put(1080, "Pratapgad");
        forts.put(845, "Panhala");
        forts.put(820, "Shivneri");

        // Step 2: tallest to shortest
        System.out.println("Tallest first:");
        for (Map.Entry<Integer, String> e : forts.descendingMap().entrySet()) {
            System.out.println("  " + e.getValue() + " " + e.getKey() + " m");
        }

        // Step 3: extremes
        System.out.println("Shortest: " + forts.firstEntry().getValue());
        System.out.println("Tallest : " + forts.lastEntry().getValue());

        // Step 4: forts between 1000 and 1350 m (both included)
        System.out.println("Between 1000 and 1350 m: " + forts.subMap(1000, true, 1350, true).values());

        // Step 5: neighbours of Raigad
        int raigad = 1356;
        System.out.println("Next shorter than Raigad: " + forts.lowerEntry(raigad).getValue());
        System.out.println("Next taller than Raigad : " + forts.higherEntry(raigad).getValue());

        // Step 6: remove the low forts through the headMap view
        forts.headMap(900).clear();                         // removes keys below 900 from forts itself
        System.out.println("After removing forts below 900 m: " + forts.values());
        System.out.println("Count now: " + forts.size());
    }
}
''' + OUT),
]

TM_PRACTICE = [
    practice(
        'Sorted word frequency (ignore capital letters)',
        'Count how often each word appears in a sentence, ignoring upper and lower case, and print the words A to Z with their counts.',
        ['Create a <code>TreeMap</code> with <code>String.CASE_INSENSITIVE_ORDER</code>.', 'Split the sentence by spaces and use <code>merge</code>.', 'Print the map.'],
        r'''// Practice: sorted, case-insensitive word count
import java.util.*;

public class TmWordFrequency {
    public static void main(String[] args) {
        String text = "Raigad torna RAIGAD Sinhagad torna raigad";
        Map<String, Integer> freq = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (String word : text.split(" ")) {
            freq.merge(word, 1, Integer::sum);       // "Raigad" and "RAIGAD" are the same key
        }
        System.out.println(freq);
    }
}
''' + OUT,
        level='Easy',
        hints=['The first spelling that is stored stays as the key.']),
    practice(
        'Name autocomplete',
        'Given a sorted contact book, return the names that start with a typed prefix, and the first name that comes alphabetically <strong>after</strong> all of them.',
        ['Store names in a <code>TreeMap&lt;String, String&gt;</code>.',
         'Use <code>subMap(prefix, prefix + Character.MAX_VALUE)</code> for matches.',
         'Use <code>higherKey</code> on the last match to find the next name.'],
        r'''// Practice: autocomplete with subMap
import java.util.*;

public class TmAutocomplete {
    public static void main(String[] args) {
        TreeMap<String, String> book = new TreeMap<>();
        for (String n : new String[]{"Pune", "Pandharpur", "Panvel", "Nashik", "Nagpur", "Satara", "Panhala"}) {
            book.put(n, "city");
        }

        String prefix = "Pan";
        NavigableMap<String, String> hits = book.subMap(prefix, true, prefix + Character.MAX_VALUE, false);
        System.out.println("Starts with " + prefix + ": " + hits.keySet());

        if (!hits.isEmpty()) {
            System.out.println("Next name after them: " + book.higherKey(hits.lastKey()));
        }
    }
}
''' + OUT,
        level='Medium',
        hints=['Keys are compared as Strings, so "Pan..." names sit next to each other.']),
    practice(
        'Fort lookup by height with tie-break',
        'For a list of target heights, print the nearest fort. If a target is exactly in the middle of two forts, choose the <strong>taller</strong> one. A target equal to a fort height returns that fort.',
        ['Use <code>floorEntry</code> and <code>ceilingEntry</code>.', 'Handle a missing neighbour.', 'Compare the two distances.'],
        r'''// Practice: nearest key with a "taller wins" tie-break
import java.util.*;

public class TmNearestTie {
    static String nearest(TreeMap<Integer, String> map, int target) {
        Map.Entry<Integer, String> low = map.floorEntry(target);
        Map.Entry<Integer, String> high = map.ceilingEntry(target);
        if (low == null) return high.getValue();
        if (high == null) return low.getValue();
        int downGap = target - low.getKey();
        int upGap = high.getKey() - target;
        return downGap < upGap ? low.getValue() : high.getValue();     // equal gap -> taller (high)
    }

    public static void main(String[] args) {
        TreeMap<Integer, String> byHeight = new TreeMap<>();
        byHeight.put(1000, "Lohagad");
        byHeight.put(1200, "Sinhagad");
        byHeight.put(1400, "Torna");

        for (int t : new int[]{900, 1100, 1200, 1290, 1300, 1500}) {
            System.out.println(t + " -> " + nearest(byHeight, t));
        }
    }
}
''' + OUT,
        level='Medium',
        hints=['If the gaps are equal, return the upper entry.']),
    practice(
        'How many guides are busy at the same time? (sweep line)',
        'Tour bookings are time ranges [start, end) in hours. Find the largest number of bookings that overlap, and the first hour where that happens.',
        ['Make a <code>TreeMap&lt;Integer, Integer&gt;</code> of time to change: +1 at every start, -1 at every end (use <code>merge</code>).',
         'Walk the map in key order, keep a running total, and track the maximum and the hour it first appears.'],
        r'''// Practice: overlapping bookings with a TreeMap sweep line
import java.util.*;

public class TmBusyGuides {
    public static void main(String[] args) {
        int[][] bookings = {{9, 12}, {10, 11}, {11, 14}, {13, 15}, {10, 13}};

        TreeMap<Integer, Integer> change = new TreeMap<>();
        for (int[] b : bookings) {
            change.merge(b[0], 1, Integer::sum);       // a guide becomes busy
            change.merge(b[1], -1, Integer::sum);      // a guide becomes free
        }

        int busy = 0, maxBusy = 0, firstHour = -1;
        for (Map.Entry<Integer, Integer> e : change.entrySet()) {      // time order
            busy += e.getValue();
            System.out.println("hour " + e.getKey() + ": busy = " + busy);
            if (busy > maxBusy) {
                maxBusy = busy;
                firstHour = e.getKey();
            }
        }
        System.out.println("Most guides busy at once: " + maxBusy + " (from hour " + firstHour + ")");
    }
}
''' + OUT,
        level='Hard',
        hints=['Several events can fall on the same hour; <code>merge</code> adds them into one number, so ends and starts at the same time cancel.']),
]

EXTRAS['treemap'] = {'beginner': TM_BEGINNER, 'intermediate': TM_INTERMEDIATE,
                     'expert': TM_EXPERT + add_practice('treemap', TM_PRACTICE)}


# ======================================================================================================================
# HASHTABLE
# ======================================================================================================================
HT_BEGINNER = [
    section(
        'Benefits and advantages',
        '<strong>For freshers:</strong> a Hashtable is the old, built-in "safe for threads" cousin of HashMap. You will meet it in older code and in <code>Properties</code> files. Why it can still be useful:',
        [
            '<strong>Thread-safe out of the box.</strong> Every method is <code>synchronized</code>, so two threads cannot corrupt the table by writing at the same moment.',
            '<strong>Simple to reason about.</strong> One lock, one rule: only one thread uses the table at a time.',
            '<strong>No hidden nulls.</strong> Null keys and null values are rejected, so <code>get</code> returning <code>null</code> always means "key not found".',
            '<strong>Fast lookup.</strong> Like HashMap, <code>get</code> and <code>put</code> are O(1) on average.',
            '<strong>Base of <code>Properties</code>.</strong> <code>java.util.Properties</code>, used for configuration files, extends Hashtable.',
            '<strong>Works with old APIs.</strong> Code written before Java 2 uses <code>Dictionary</code> and <code>Enumeration</code>; Hashtable fits it.',
            '<strong>For experienced developers:</strong> single-method calls are atomic (<code>put</code>, <code>get</code>, and the Java 8 overrides <code>merge</code>, <code>putIfAbsent</code>, <code>compute</code> are synchronized), and its iterators are fail-fast. It is a perfectly correct choice for a small, low-contention shared table.',
        ],
    ),
    (
        '<h3>Disadvantages and when NOT to use it</h3>\n'
        '<p><strong>For freshers:</strong> Hashtable is mostly kept for old code. For new code there are better tools:</p>\n'
        + ul([
            '<strong>Slow under load.</strong> One lock for the whole table: while one thread works, all other threads wait, even for plain reads.',
            '<strong>No nulls.</strong> <code>put(null, x)</code> or <code>put(x, null)</code> throws <code>NullPointerException</code>.',
            '<strong>Legacy design.</strong> It has old methods (<code>keys()</code>, <code>elements()</code>, <code>contains()</code>) that return <code>Enumeration</code>, and it extends the obsolete <code>Dictionary</code> class.',
            '<strong>Not truly safe for "check then act".</strong> Each call is atomic, but <code>if (!t.containsKey(k)) t.put(k, v)</code> is two calls, and another thread can sneak in between.',
            '<strong>No order</strong> and no sorting; iteration order looks odd (from the end of the table).',
            '<strong>For experienced developers:</strong> prefer <code>ConcurrentHashMap</code> (lock striping, lock-free reads, atomic <code>compute</code> family) for shared maps and <code>HashMap</code> for single-threaded code. Hashtable\'s whole-table lock also makes iteration while writing from another thread throw <code>ConcurrentModificationException</code>.',
        ])
        + '\n<p>Quick guide:</p>\n'
        + table(['Use a Hashtable when', 'Use something else when'], [
            ['You maintain old code or work with <code>Properties</code>', 'You write new code: <code>HashMap</code> or <code>ConcurrentHashMap</code>'],
            ['A small table is shared by a few threads, rarely', 'Many threads read and write often: <code>ConcurrentHashMap</code>'],
            ['You want null keys and values rejected', 'You need null values: <code>HashMap</code>'],
            ['Simple "one lock for everything" safety is enough', 'You need sorted keys: <code>TreeMap</code> (or <code>ConcurrentSkipListMap</code> for threads)'],
        ]),
        [],
    ),
]

HT_INTERMEDIATE = [
    section(
        'Module: Sorting methods',
        '<strong>For freshers:</strong> a Hashtable has no order and no sort method. To see its data sorted, copy it into something that can be sorted. '
        '<strong>For experienced developers:</strong> copying through <code>entrySet()</code> or <code>new TreeMap&lt;&gt;(table)</code> is safe because those methods hold the table lock while they copy; the sorting itself then runs on your private copy with no locking.'),
    method(
        'Sort by key: copy into a TreeMap', 'new TreeMap<>(Map m)', 'a new <code>TreeMap</code> sorted by key', 'O(n log n)',
        'The easiest sort: build a <code>TreeMap</code> from the Hashtable. The TreeMap keeps the keys A to Z.',
        'The Hashtable itself is unchanged. Because the copy is private, other threads can keep using the Hashtable while you print or process the sorted copy.',
        r'''// Sort a Hashtable by key with a TreeMap
import java.util.*;

public class HtSortByKey {
    public static void main(String[] args) {
        Hashtable<String, Integer> codes = new Hashtable<>();
        codes.put("Pune", 20);
        codes.put("Nagpur", 712);
        codes.put("Mumbai", 22);
        codes.put("Agra", 562);

        Map<String, Integer> sorted = new TreeMap<>(codes);     // keys A to Z
        System.out.println(sorted);
    }
}
''' + OUT),
    method(
        'Sorted key list: Collections.list + sort', 'Collections.list(Enumeration<T>) / Collections.sort(List)', 'a sorted <code>List</code> of the keys', 'O(n log n)',
        'The old <code>keys()</code> method gives an <code>Enumeration</code>. <code>Collections.list</code> turns it into a normal list that you can sort. Then look up each value with <code>get</code>.',
        'In modern code you can write <code>new ArrayList&lt;&gt;(table.keySet())</code> instead. Use <code>Collections.list(table.keys())</code> when you are given an Enumeration from a legacy API.',
        r'''// Sort the keys of a Hashtable using its Enumeration
import java.util.*;

public class HtSortedKeyList {
    public static void main(String[] args) {
        Hashtable<String, Integer> codes = new Hashtable<>();
        codes.put("Pune", 20);
        codes.put("Nagpur", 712);
        codes.put("Mumbai", 22);

        List<String> keys = Collections.list(codes.keys());     // Enumeration -> List
        Collections.sort(keys);                                 // A to Z
        for (String k : keys) {
            System.out.println(k + " = " + codes.get(k));
        }
    }
}
''' + OUT),
    method(
        'Sort by value: stream into a LinkedHashMap', 'entrySet().stream().sorted(comparingByValue()).collect(toMap(..., LinkedHashMap::new))', 'a new <code>LinkedHashMap</code> in value order', 'O(n log n)',
        'To order the pairs by value (for example the busiest fort first), stream the entries, sort, and collect into a <code>LinkedHashMap</code>, which remembers the order.',
        'The stream works on a snapshot taken from <code>entrySet()</code>. The result is a plain <code>LinkedHashMap</code>: it is no longer thread-safe, which is fine for printing a report.',
        r'''// Sort a Hashtable by value, biggest first
import java.util.*;
import java.util.stream.Collectors;

public class HtSortByValue {
    public static void main(String[] args) {
        Hashtable<String, Integer> visitors = new Hashtable<>();
        visitors.put("Raigad", 40);
        visitors.put("Sinhagad", 95);
        visitors.put("Torna", 25);

        Map<String, Integer> ranked = visitors.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
        System.out.println(ranked);
    }
}
''' + OUT),
    method(
        'Sorted values: ArrayList of values + sort', 'new ArrayList<>(table.values()); list.sort(...)', 'a sorted <code>List</code> of the values', 'O(n log n)',
        'If you only need the values in order (not the keys), copy <code>values()</code> into a list and sort the list.',
        'Duplicates stay in the list, so the same value can appear many times. Use <code>Comparator.reverseOrder()</code> for biggest first.',
        r'''// Sort only the values
import java.util.*;

public class HtSortedValues {
    public static void main(String[] args) {
        Hashtable<String, Integer> hours = new Hashtable<>();
        hours.put("Torna", 5);
        hours.put("Raigad", 6);
        hours.put("Lohagad", 2);
        hours.put("Rajgad", 5);

        List<Integer> values = new ArrayList<>(hours.values());
        Collections.sort(values);                                // small to large
        System.out.println("Ascending : " + values);
        values.sort(Comparator.reverseOrder());
        System.out.println("Descending: " + values);
    }
}
''' + OUT),
    (
        '<p><strong>Which sorting approach to pick?</strong></p>\n' + table(['You want', 'Use', 'Result'], [
            ['Pairs sorted by key', '<code>new TreeMap&lt;&gt;(table)</code>', 'sorted map copy'],
            ['Only the keys, sorted', '<code>Collections.list(table.keys())</code> + <code>sort</code>', 'sorted list'],
            ['Pairs sorted by value', 'stream + <code>sorted</code> + <code>LinkedHashMap</code>', 'ordered map copy'],
            ['Only the values, sorted', '<code>new ArrayList&lt;&gt;(table.values())</code> + <code>sort</code>', 'sorted list'],
        ]),
        [],
    ),
    section(
        'Module: Finding (searching) methods',
        '<strong>For freshers:</strong> finding by key is instant. Hashtable also has old-style search methods (<code>contains</code>, <code>keys</code>, <code>elements</code>) that you will see in legacy code. '
        '<strong>For experienced developers:</strong> every call takes the table lock, so a long scan blocks other threads; copy to a list first when the scan is heavy.'),
    method(
        'get, getOrDefault and containsKey (no null keys)', 'V get(Object key) / boolean containsKey(Object key)', 'the value (or <code>null</code>), or <code>true</code>/<code>false</code>', 'O(1) average',
        'Look up by key. A missing key gives <code>null</code>. A Hashtable never stores null, so <code>null</code> always means "not found". Asking for a <code>null</code> key itself throws <code>NullPointerException</code>.',
        'Unlike HashMap, even the lookup methods throw on a null key because <code>hashCode()</code> is called on it. Methods are synchronized, so lookups from different threads wait for each other.',
        r'''// Find by key in a Hashtable
import java.util.*;

public class HtFindByKey {
    public static void main(String[] args) {
        Hashtable<String, Integer> codes = new Hashtable<>();
        codes.put("Pune", 20);
        codes.put("Nagpur", 712);

        System.out.println(codes.get("Pune"));                    // 20
        System.out.println(codes.get("Delhi"));                   // null: not found
        System.out.println(codes.getOrDefault("Delhi", -1));      // -1
        System.out.println(codes.containsKey("Nagpur"));          // true
        try {
            codes.get(null);                                      // a null key is not allowed
        } catch (NullPointerException e) {
            System.out.println("get(null) throws NullPointerException");
        }
    }
}
''' + OUT),
    method(
        'contains and containsValue: find a value', 'boolean contains(Object value) / boolean containsValue(Object value)', '<code>true</code> if some key has this value', 'O(n)',
        '<code>contains(value)</code> is the old method that looks for a <strong>value</strong> (not a key!). <code>containsValue</code> does exactly the same and is the name used by every other Map.',
        'The names confuse beginners: <code>contains</code> checks values, <code>containsKey</code> checks keys. In new code always write <code>containsValue</code>. Both scan the whole table.',
        r'''// contains() checks values, not keys
import java.util.*;

public class HtFindContains {
    public static void main(String[] args) {
        Hashtable<String, Integer> codes = new Hashtable<>();
        codes.put("Pune", 20);
        codes.put("Mumbai", 22);

        System.out.println(codes.contains(22));          // true: looks at VALUES
        System.out.println(codes.containsValue(22));     // true: same thing, clearer name
        System.out.println(codes.containsKey("Pune"));   // true: looks at KEYS
    }
}
''' + OUT),
    method(
        'keys() and elements(): search with an Enumeration', 'Enumeration<K> keys() / Enumeration<V> elements()', 'an <code>Enumeration</code> over the keys / values', 'O(n) to walk',
        'The old way to walk a Hashtable. Loop with <code>hasMoreElements()</code> and <code>nextElement()</code> and test each item.',
        'An Enumeration has no <code>remove</code>, and it is not fail-fast the way an <code>Iterator</code> is. Prefer <code>keySet().iterator()</code> or a stream in new code.',
        r'''// Find all keys that start with N using an Enumeration
import java.util.*;

public class HtFindEnumeration {
    public static void main(String[] args) {
        Hashtable<String, Integer> codes = new Hashtable<>();
        codes.put("Nagpur", 712);
        codes.put("Nashik", 253);
        codes.put("Pune", 20);

        List<String> found = new ArrayList<>();
        Enumeration<String> keys = codes.keys();
        while (keys.hasMoreElements()) {
            String key = keys.nextElement();
            if (key.startsWith("N")) {               // the search rule
                found.add(key);
            }
        }
        Collections.sort(found);                     // Hashtable order is not fixed, so sort before printing
        System.out.println(found);
    }
}
''' + OUT),
    method(
        'Find the key for a value', 'for (Map.Entry e : table.entrySet())', 'a matching key, or <code>null</code>', 'O(n)',
        'A Hashtable goes from key to value only. To go backwards, loop over the entries and compare values.',
        'If several keys share the value, the one you reach first depends on the internal table, so do not rely on it. Collect all matches and sort them if you need a stable answer.',
        r'''// Find the keys that have a given value
import java.util.*;

public class HtFindKeyByValue {
    public static void main(String[] args) {
        Hashtable<String, Integer> hours = new Hashtable<>();
        hours.put("Torna", 5);
        hours.put("Raigad", 6);
        hours.put("Rajgad", 5);

        List<String> keys = new ArrayList<>();
        for (Map.Entry<String, Integer> e : hours.entrySet()) {
            if (e.getValue() == 5) {
                keys.add(e.getKey());
            }
        }
        Collections.sort(keys);
        System.out.println("Treks of 5 hours: " + keys);
    }
}
''' + OUT),
    method(
        'Stream filter and max/min entry', 'entrySet().stream().filter(...) / Collections.max(entrySet, comparingByValue())', 'matching entries / the entry with the biggest value', 'O(n)',
        'Describe the search as a rule and let the stream do the loop. <code>Collections.max</code> finds the entry with the largest value.',
        '<code>entrySet()</code> of a Hashtable is a synchronized view; streaming over it while another thread writes can throw <code>ConcurrentModificationException</code>. Copy first (<code>new ArrayList&lt;&gt;(table.entrySet())</code>) if writers are active.',
        r'''// Filter and max on a Hashtable
import java.util.*;

public class HtFindFilterMax {
    public static void main(String[] args) {
        Hashtable<String, Integer> visitors = new Hashtable<>();
        visitors.put("Raigad", 40);
        visitors.put("Sinhagad", 95);
        visitors.put("Torna", 25);

        long busy = visitors.values().stream().filter(v -> v > 30).count();      // how many forts above 30
        System.out.println("Forts with more than 30 visitors: " + busy);

        Map.Entry<String, Integer> top = Collections.max(visitors.entrySet(), Map.Entry.comparingByValue());
        System.out.println("Busiest: " + top.getKey() + " (" + top.getValue() + ")");
    }
}
''' + OUT),
    (
        '<p><strong>Which finding method to pick?</strong></p>\n' + table(['Question', 'Method', 'Time'], [
            ['Value for a key / is the key there', '<code>get</code>, <code>getOrDefault</code>, <code>containsKey</code>', 'O(1)'],
            ['Is a value there', '<code>containsValue</code> (avoid the old <code>contains</code>)', 'O(n)'],
            ['Walk and test every key or value', '<code>keys()</code> / <code>elements()</code> (legacy) or <code>keySet()</code> / <code>values()</code>', 'O(n)'],
            ['Which keys have this value', 'loop over <code>entrySet()</code>', 'O(n)'],
            ['Entries matching a rule, or the biggest', '<code>stream().filter</code>, <code>Collections.max</code>', 'O(n)'],
        ]),
        [],
    ),
]


HT_EXPERT = [
    section(
        'Real-time examples',
        'Three jobs where a small, thread-safe, no-nulls table is a reasonable fit, especially in older code bases.'),
    scen(
        'Scenario 1: Login session store',
        '<strong>For freshers:</strong> after login, the server gives each user a token and keeps token to user name in a table. Each web request looks the token up. A Hashtable is safe if several request threads use it. '
        '<strong>For experienced developers:</strong> because nulls are rejected, <code>get(token) == null</code> reliably means "not logged in". For a busy server use <code>ConcurrentHashMap</code> with expiry.',
        r'''// Real-time example: session store
import java.util.*;

public class HtSessionStore {
    static final Hashtable<String, String> sessions = new Hashtable<>();    // token -> user

    static String login(String user, int number) {
        String token = "TKN-" + number;
        sessions.put(token, user);
        return token;
    }

    static String whoIs(String token) {
        String user = sessions.get(token);
        return user == null ? "not logged in" : user;
    }

    public static void main(String[] args) {
        String a = login("Asha", 101);
        String b = login("Ravi", 102);

        System.out.println(a + " -> " + whoIs(a));
        System.out.println(b + " -> " + whoIs(b));
        sessions.remove(a);                                    // logout
        System.out.println(a + " -> " + whoIs(a));
        System.out.println("Unknown -> " + whoIs("TKN-999"));
    }
}
''' + OUT),
    scen(
        'Scenario 2: Application settings with Properties',
        '<strong>For freshers:</strong> <code>Properties</code> is a Hashtable whose keys and values are Strings. It is the standard way to hold settings such as a title or a port. <code>getProperty</code> lets you give a default. '
        '<strong>For experienced developers:</strong> <code>Properties</code> extends <code>Hashtable&lt;Object, Object&gt;</code>, so you can call <code>put</code> with non-String values by mistake; always use <code>setProperty</code> and <code>getProperty</code>.',
        r'''// Real-time example: settings in a Properties (a Hashtable)
import java.util.*;

public class HtSettings {
    public static void main(String[] args) {
        Properties settings = new Properties();
        settings.setProperty("app.title", "Fort Guide");
        settings.setProperty("app.port", "8080");

        System.out.println("Title   : " + settings.getProperty("app.title"));
        System.out.println("Port    : " + Integer.parseInt(settings.getProperty("app.port")));
        System.out.println("Theme   : " + settings.getProperty("app.theme", "light"));     // default when missing
        System.out.println("Is a Hashtable: " + (settings instanceof Hashtable));
        System.out.println("Keys    : " + new TreeSet<>(settings.stringPropertyNames()));
    }
}
''' + OUT),
    scen(
        'Scenario 3: Thread-safe visit counter',
        '<strong>For freshers:</strong> four counter threads each add 1000 visits to the same table. Because every Hashtable method is synchronized and <code>merge</code> is a single call, no visit is lost. '
        '<strong>For experienced developers:</strong> a plain <code>HashMap</code> in this test can lose updates or even corrupt itself, and the total would change from run to run. Here the total is always 4000 per fort.',
        r'''// Real-time example: several threads, one Hashtable
import java.util.*;

public class HtVisitCounter {
    public static void main(String[] args) throws InterruptedException {
        Hashtable<String, Integer> visits = new Hashtable<>();

        Runnable counter = () -> {
            for (int i = 0; i < 1000; i++) {
                visits.merge("Raigad", 1, Integer::sum);       // one synchronized call: safe
                visits.merge("Torna", 1, Integer::sum);
            }
        };

        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(counter);
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();                                          // wait for all threads
        }
        System.out.println(new TreeMap<>(visits));
    }
}
''' + OUT),
    project(
        'Thread-safe Trek Seat Booking',
        'four booking-desk threads fight for the last seats of three forts. A shared <code>Hashtable</code> holds the seats left, and a lock makes "check the seats, then reduce them" one atomic step.',
        [
            'Step 1: create the seat table (fort to seats left).',
            'Step 2: write a booking method that checks and reduces seats inside <code>synchronized (seats)</code>; this is the "check then act" fix.',
            'Step 3: create four desk threads; each tries 15 bookings for every fort.',
            'Step 4: count booked and rejected requests with <code>AtomicInteger</code>.',
            'Step 5: start the threads, wait with <code>join</code>, and print the totals: no seat is sold twice.',
        ],
        r'''// Sample project: Thread-safe Trek Seat Booking (Hashtable + synchronized check-then-act)
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class HtSeatBooking {
    // Step 1: seats left per fort
    static final Hashtable<String, Integer> seats = new Hashtable<>();
    static final AtomicInteger booked = new AtomicInteger();
    static final AtomicInteger rejected = new AtomicInteger();

    // Step 2: check and reduce must happen together, so we hold the table's own lock
    static void book(String fort) {
        synchronized (seats) {
            int left = seats.get(fort);
            if (left > 0) {
                seats.put(fort, left - 1);
                booked.incrementAndGet();
            } else {
                rejected.incrementAndGet();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        seats.put("Raigad", 20);
        seats.put("Torna", 15);
        seats.put("Sinhagad", 10);

        // Step 3: four desks, each tries 15 bookings per fort
        Runnable desk = () -> {
            for (int i = 0; i < 15; i++) {
                book("Raigad");
                book("Torna");
                book("Sinhagad");
            }
        };
        Thread[] desks = new Thread[4];
        for (int i = 0; i < desks.length; i++) {
            desks[i] = new Thread(desk);
        }

        // Step 5: run and wait
        for (Thread t : desks) {
            t.start();
        }
        for (Thread t : desks) {
            t.join();
        }

        // Step 4/5: totals
        System.out.println("Seats left : " + new TreeMap<>(seats));
        System.out.println("Booked     : " + booked.get());
        System.out.println("Rejected   : " + rejected.get());
        System.out.println("Requests   : " + (booked.get() + rejected.get()));
        System.out.println("No overbooking: " + (booked.get() == 45));
    }
}
''' + OUT),
]

HT_PRACTICE = [
    practice(
        'Safe lookup helper for a table that rejects nulls',
        'A helper must never crash, whatever the caller passes. Write <code>fee(Hashtable, String fort)</code> that returns the fee, or -1 if the fort is missing <strong>or</strong> the name is <code>null</code>.',
        ['Return -1 at once for a null name (a Hashtable throws <code>NullPointerException</code> for it).', 'Otherwise use <code>getOrDefault</code>.', 'Test with a known fort, an unknown fort and null.'],
        r'''// Practice: null-safe lookup on a Hashtable
import java.util.*;

public class HtSafeLookup {
    static int fee(Hashtable<String, Integer> table, String fort) {
        if (fort == null) {
            return -1;                                  // Hashtable.get(null) would throw
        }
        return table.getOrDefault(fort, -1);
    }

    public static void main(String[] args) {
        Hashtable<String, Integer> fees = new Hashtable<>();
        fees.put("Raigad", 50);
        fees.put("Torna", 30);

        System.out.println(fee(fees, "Raigad"));
        System.out.println(fee(fees, "Panhala"));
        System.out.println(fee(fees, null));
        try {
            fees.put("Lohagad", null);                  // null values are rejected too
        } catch (NullPointerException e) {
            System.out.println("null value rejected");
        }
    }
}
''' + OUT,
        level='Easy',
        hints=['Both a null key and a null value throw <code>NullPointerException</code> in a Hashtable.']),
    practice(
        'Hashtable or HashMap? Compare how they behave',
        'Run the same four operations on a <code>Hashtable</code> and a <code>HashMap</code> and print what each does: put a null key, put a null value, call <code>get</code> for a missing key, and remove during a for-each loop.',
        ['Write a small helper that runs an action and prints "ok" or the name of the exception.', 'Call it for each operation and each map.', 'Read the table of results and decide which map you would choose for a shared settings table.'],
        r'''// Practice: Hashtable versus HashMap behaviour
import java.util.*;

public class HtVersusHashMap {
    static void attempt(String label, Runnable action) {
        try {
            action.run();
            System.out.println(label + ": ok");
        } catch (RuntimeException e) {
            System.out.println(label + ": " + e.getClass().getSimpleName());
        }
    }

    public static void main(String[] args) {
        Map<String, Integer> table = new Hashtable<>();
        Map<String, Integer> hash = new HashMap<>();
        for (Map<String, Integer> m : List.of(table, hash)) {
            m.put("Pune", 20);
            m.put("Mumbai", 22);
        }

        attempt("Hashtable null key  ", () -> table.put(null, 1));
        attempt("HashMap   null key  ", () -> hash.put(null, 1));
        attempt("Hashtable null value", () -> table.put("Delhi", null));
        attempt("HashMap   null value", () -> hash.put("Delhi", null));
        attempt("Hashtable remove in loop", () -> {
            for (String k : table.keySet()) {
                table.remove(k);                         // changing the map while looping
            }
        });
        attempt("HashMap   remove in loop", () -> {
            for (String k : hash.keySet()) {
                hash.remove(k);
            }
        });
    }
}
''' + OUT,
        level='Medium',
        hints=['The for-each loop uses an iterator that checks for changes; removing through the map (not the iterator) is detected.']),
    practice(
        'Atomic withdrawal: why check-then-act needs a lock',
        'A fort has 100 tickets in a Hashtable. Ten threads each try to take 20 tickets one at a time. Make sure exactly 100 are sold and the stock never goes below zero.',
        ['Write a <code>sell()</code> method that does get and put inside <code>synchronized (stock)</code>.', 'Start 10 threads, join them, then print sold and left.', 'Explain in a comment why the lock is needed even though each Hashtable call is synchronized.'],
        r'''// Practice: check-then-act on a Hashtable
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class HtAtomicSale {
    static final Hashtable<String, Integer> stock = new Hashtable<>();
    static final AtomicInteger sold = new AtomicInteger();

    static void sell() {
        // get and put are each synchronized, but another thread could run between them.
        // Locking the table for both calls makes the pair atomic.
        synchronized (stock) {
            int left = stock.get("tickets");
            if (left > 0) {
                stock.put("tickets", left - 1);
                sold.incrementAndGet();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        stock.put("tickets", 100);
        Thread[] threads = new Thread[10];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                for (int n = 0; n < 20; n++) {
                    sell();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("Sold: " + sold.get() + ", left: " + stock.get("tickets"));
    }
}
''' + OUT,
        level='Medium',
        hints=['<code>synchronized (stock)</code> uses the same lock that the Hashtable methods use, so no thread can slip in between your get and put.']),
    practice(
        'Predict the enumeration order of a Hashtable',
        'A Hashtable stores a key at index <code>(hashCode &amp; 0x7FFFFFFF) % capacity</code> (default capacity 11), puts a new entry at the <strong>front</strong> of a bucket\'s chain, and <code>keys()</code> walks the buckets from the <strong>last index to the first</strong>. Predict the order for six Integer keys with your own code, then check it against the real table.',
        ['Build the six buckets by hand with a list of <code>LinkedList</code>s, inserting each key at the front of its bucket.',
         'Produce the predicted order by reading buckets 10 down to 0.',
         'Compare it with <code>Collections.list(table.keys())</code> and print whether they match.',
         'Also compute when the table first grows: threshold = capacity x 0.75, and the new capacity is <code>old * 2 + 1</code>.'],
        r'''// Practice: predicting Hashtable enumeration order
import java.util.*;

public class HtPredictOrder {
    public static void main(String[] args) {
        int capacity = 11;
        int[] keys = {3, 14, 25, 5, 16, 7};

        // the real table
        Hashtable<Integer, String> table = new Hashtable<>();
        for (int k : keys) {
            table.put(k, "v" + k);
        }

        // our model: buckets with new entries added at the front
        List<LinkedList<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i < capacity; i++) {
            buckets.add(new LinkedList<>());
        }
        for (int k : keys) {
            int index = (Integer.hashCode(k) & 0x7FFFFFFF) % capacity;
            buckets.get(index).addFirst(k);
            System.out.println("key " + k + " -> bucket " + index);
        }

        List<Integer> predicted = new ArrayList<>();
        for (int i = capacity - 1; i >= 0; i--) {              // last bucket first
            predicted.addAll(buckets.get(i));                   // chain from its head
        }

        List<Integer> real = Collections.list(table.keys());
        System.out.println("Predicted: " + predicted);
        System.out.println("Real     : " + real);
        System.out.println("Match    : " + predicted.equals(real));

        int threshold = (int) (capacity * 0.75f);
        System.out.println("Resize when size reaches " + threshold + "; new capacity = " + (capacity * 2 + 1));
    }
}
''' + OUT,
        level='Hard',
        hints=['An Integer\'s hash code is the number itself.', 'Keys 3, 14 and 25 all land in bucket 3 because 14 % 11 = 3 and 25 % 11 = 3.']),
]

EXTRAS['hashtable'] = {'beginner': HT_BEGINNER, 'intermediate': HT_INTERMEDIATE,
                       'expert': HT_EXPERT + add_practice('hashtable', HT_PRACTICE)}
