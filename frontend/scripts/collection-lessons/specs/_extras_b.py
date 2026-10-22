"""Extra lesson blocks for hashset, linkedhashset, treeset and internal_hashset: benefits, sorting and finding modules,
real-time examples, sample projects and more practice questions. Loaded by build.py (EXTRAS)."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, method, practice, section, table, ul  # noqa: E402


def P(cls, title, imports, body):
    """A complete tiny program: title comment, imports, class, main. `body` is written without the 8-space indent."""
    imp = '\n'.join(f'import {i};' for i in imports)
    lines = body.strip('\n').split('\n')
    b = '\n'.join(('        ' + l if l.strip() else '') for l in lines)
    return (f'// {title}\n{imp}\n\npublic class {cls} {{\n    public static void main(String[] args) {{\n{b}\n    }}\n}}\n') + OUT


def H(html, codes=()):
    return (html, list(codes))


# =====================================================================================================================
# HASHSET
# =====================================================================================================================
HS_BEGINNER = [
    H('<h3>Benefits and advantages</h3>\n<p><strong>For freshers:</strong> a HashSet is the easiest way to say "keep each thing only once" and to ask "do I already have this?" quickly.</p>\n'
      + ul([
          '<strong>No duplicates for free:</strong> you never write an "if already there" check; <code>add</code> does it and tells you the answer.',
          '<strong>Very fast lookups:</strong> <code>contains</code>, <code>add</code> and <code>remove</code> take about the same tiny time for 10 or 10 million elements.',
          '<strong>Set maths in one line:</strong> union (<code>addAll</code>), intersection (<code>retainAll</code>) and difference (<code>removeAll</code>).',
          '<strong>Cleans lists:</strong> <code>new HashSet&lt;&gt;(list)</code> removes duplicates instantly.',
          '<strong>Simple to use:</strong> no comparator and no ordering rules to think about.',
          '<strong>Low overhead:</strong> lighter than a TreeSet, and no linked list like LinkedHashSet.',
      ])
      + '\n<p><strong>For experienced developers:</strong> O(1) average operations come from hashing into a power-of-two table; a poor <code>hashCode</code> is the only thing that turns this into O(log n) (treeified bins) or O(n). It is the default choice when you need only uniqueness and membership.</p>'),
    H('<h3>Disadvantages and when NOT to use it</h3>\n<p><strong>For freshers:</strong> a HashSet is not magic. It gives up some things to be fast.</p>\n'
      + ul([
          '<strong>No order:</strong> elements come out in a hash-decided order that can change after the set grows.',
          '<strong>No index:</strong> there is no <code>get(i)</code>, so "give me the 3rd element" is impossible.',
          '<strong>No sorted view or range queries:</strong> you cannot ask for "the next bigger value" or "everything between A and B".',
          '<strong>Needs good equals() and hashCode():</strong> without them duplicates sneak in or lookups fail.',
          '<strong>Not thread-safe</strong> and elements must not be changed after adding.',
          '<strong>Extra memory:</strong> every element is wrapped in a map entry, and the table keeps empty buckets.',
      ])
      + '\n<p><strong>For experienced developers:</strong> iteration costs O(capacity + size), so a once-huge, now-small set is slow to iterate; <code>clear()</code> does not shrink it. For tiny sets (under about 10 elements) a plain <code>List</code> can be as fast and uses less memory.</p>\n'
      + table(['Use a HashSet when', 'Use something else when'], [
          ['You only need uniqueness and fast "is it in there?"', 'You need sorted output or nearest-value search: <strong>TreeSet</strong>'],
          ['Order does not matter', 'You need insertion order: <strong>LinkedHashSet</strong>'],
          ['Elements are immutable (String, Integer, record)', 'You need positions or duplicates: <strong>ArrayList</strong>'],
          ['One thread uses the set', 'Several threads write: <strong>ConcurrentHashMap.newKeySet()</strong>'],
      ])),
]

HS_INTERMEDIATE = [
    H('<h3>Module: Sorting methods</h3>\n<p><strong>For freshers:</strong> a HashSet never sorts itself. If you want sorted output, you make a <em>sorted copy</em> and leave the HashSet alone. There are four common ways, and each card below shows one tiny program.</p>\n'
      '<p><strong>For experienced developers:</strong> sorting is O(n log n) in every case. Pick by what you need next: a set (keep uniqueness and sorted), a list (index access) or just a one-time stream result.</p>'),
    method('Sorted set: new TreeSet&lt;&gt;(set)', 'Set&lt;E&gt; sorted = new TreeSet&lt;&gt;(set)', 'a new sorted set', 'O(n log n)',
           'Copy the HashSet into a TreeSet. The TreeSet keeps its elements in sorted order by itself, and it is still a set (no duplicates).',
           'The copy constructor adds elements one by one (O(n log n)). If the source is already a <code>SortedSet</code> it is copied in linear time. Later adds also stay sorted.',
           P('HashSetSortTreeSetDemo', 'HashSet sorted copy with TreeSet', ['java.util.HashSet', 'java.util.Set', 'java.util.TreeSet'], r'''
Set<String> forts = new HashSet<>(Set.of("Torna", "Raigad", "Sinhagad", "Purandar"));

Set<String> sorted = new TreeSet<>(forts);   // TreeSet sorts while copying
System.out.println(sorted);                  // alphabetical
''')),
    method('Sorted list: stream().sorted().toList()', 'List&lt;E&gt; list = set.stream().sorted().toList()', 'an unmodifiable sorted list', 'O(n log n)',
           'Turn the set into a stream, sort it, and collect it into a list. Good for printing or looping once.',
           '<code>sorted()</code> needs elements that are <code>Comparable</code>, otherwise <code>ClassCastException</code>. <code>toList()</code> (Java 16+) returns an unmodifiable list; use <code>Collectors.toList()</code> if you must change it.',
           P('HashSetSortStreamDemo', 'HashSet to sorted list with a stream', ['java.util.HashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> forts = new HashSet<>(Set.of("Torna", "Raigad", "Sinhagad", "Purandar"));

List<String> sorted = forts.stream().sorted().toList();   // sort, then collect
System.out.println(sorted);
''')),
    method('Sorted list: new ArrayList + Collections.sort', 'List&lt;E&gt; list = new ArrayList&lt;&gt;(set);  Collections.sort(list)', 'a sorted, changeable list', 'O(n log n)',
           'Copy the set into an ArrayList and sort that list. You can then use <code>get(index)</code>, which a set never allows.',
           'This is the classic pre-stream way and is still the best when you want a <strong>mutable</strong> list with index access. <code>list.sort(null)</code> does the same as <code>Collections.sort(list)</code>.',
           P('HashSetSortListDemo', 'HashSet copied to an ArrayList and sorted', ['java.util.ArrayList', 'java.util.Collections', 'java.util.HashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> forts = new HashSet<>(Set.of("Torna", "Raigad", "Sinhagad", "Purandar"));

List<String> list = new ArrayList<>(forts);   // copy into a list
Collections.sort(list);                       // sort the list, not the set

System.out.println(list);
System.out.println("Second fort: " + list.get(1));   // index access is possible now
''')),
    method('Custom order: sorted(Comparator)', 'set.stream().sorted(Comparator&lt;? super E&gt;)', 'a stream in your own order', 'O(n log n)',
           'Give your own rule when alphabetical is not what you want, for example "shortest name first, then alphabetical".',
           'Build comparators with <code>Comparator.comparing(...).thenComparing(...)</code>. Always add a tie-breaker; otherwise equal-ranked elements come out in the arbitrary hash order of the source set.',
           P('HashSetSortComparatorDemo', 'HashSet sorted with a Comparator', ['java.util.Comparator', 'java.util.HashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> forts = new HashSet<>(Set.of("Torna", "Raigad", "Sinhagad", "Purandar"));

List<String> byLength = forts.stream()
        .sorted(Comparator.comparing(String::length)       // shortest name first
                .thenComparing(Comparator.naturalOrder()))  // tie-breaker: alphabetical
        .toList();

System.out.println(byLength);
''')),
    method('Descending order: Comparator.reverseOrder()', 'set.stream().sorted(Comparator.reverseOrder())', 'a stream, biggest first', 'O(n log n)',
           'Biggest first (a "top list") is just a reversed comparator.',
           'Alternatives: <code>new TreeSet&lt;&gt;(Comparator.reverseOrder())</code> then <code>addAll</code>, or <code>Collections.reverse(list)</code> after sorting.',
           P('HashSetSortDescDemo', 'HashSet heights, tallest first', ['java.util.Comparator', 'java.util.HashSet', 'java.util.List', 'java.util.Set'], r'''
Set<Integer> heights = new HashSet<>(Set.of(1356, 1312, 1403, 1374));   // fort heights in metres

List<Integer> tallestFirst = heights.stream().sorted(Comparator.reverseOrder()).toList();

System.out.println(tallestFirst);
''')),
    H('<h3>Which sorting method to pick?</h3>\n' + table(['You need', 'Pick', 'Result'], [
        ['Sorted AND still a set', '<code>new TreeSet&lt;&gt;(set)</code>', 'Sorted set, stays sorted when you add'],
        ['Print or loop once', '<code>stream().sorted().toList()</code>', 'Unmodifiable list'],
        ['Index access or edits after sorting', '<code>new ArrayList</code> + <code>Collections.sort</code>', 'Mutable list'],
        ['Own order (length, price, ...)', '<code>sorted(Comparator...)</code>', 'Stream or list in your order'],
        ['Biggest first', '<code>Comparator.reverseOrder()</code>', 'Descending'],
    ])),

    H('<h3>Module: Finding (searching) methods</h3>\n<p><strong>For freshers:</strong> "finding" in a HashSet means asking questions: is this in there? are all of these in there? what do two sets share? which elements match a rule? Each card has one tiny program.</p>\n'
      '<p><strong>For experienced developers:</strong> only <code>contains</code> uses the hash and is O(1). Everything that looks at "which elements match" (stream filters, min, max) must scan the whole set: O(n).</p>'),
    method('contains(Object o)', 'boolean contains(Object o)', '<code>true</code> or <code>false</code>', 'O(1) average',
           'The fastest way to find something. It jumps straight to the right bucket instead of looking at every element.',
           'Uses <code>hashCode()</code> then <code>equals()</code>. Searching for a mutated element (changed after adding) fails.',
           P('HashSetFindContainsDemo', 'contains: is the fort in the set?', ['java.util.HashSet', 'java.util.Set'], r'''
Set<String> forts = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna"));

System.out.println(forts.contains("Torna"));    // true
System.out.println(forts.contains("Delhi"));    // false
''')),
    method('containsAll(Collection c)', 'boolean containsAll(Collection&lt;?&gt; c)', '<code>true</code> only if every element is present', 'O(m)',
           'Checks that a whole group is inside the set (is it a "subset"?). One missing element makes the answer <code>false</code>.',
           'Loops over the argument and calls <code>contains</code> on the receiver, so call it on the <strong>HashSet</strong> and pass the smaller collection.',
           P('HashSetFindContainsAllDemo', 'containsAll: are all required forts present?', ['java.util.HashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> visited = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna"));

System.out.println(visited.containsAll(List.of("Raigad", "Torna")));      // true
System.out.println(visited.containsAll(List.of("Raigad", "Purandar")));   // false: Purandar is missing
''')),
    method('retainAll(Collection c): find what two groups share', 'boolean retainAll(Collection&lt;?&gt; c)', '<code>true</code> if the set changed', 'O(n)',
           'Keeps only the elements that are also in the other collection, so what is left is the <strong>common</strong> part. Copy the set first if you still need the original.',
           'It changes the receiver. Wrap in <code>new HashSet&lt;&gt;(original)</code> first. Pass a Set as the argument, since its <code>contains</code> is O(1).',
           P('HashSetFindRetainAllDemo', 'retainAll: forts visited by both groups', ['java.util.HashSet', 'java.util.Set', 'java.util.TreeSet'], r'''
Set<String> school = new HashSet<>(Set.of("Raigad", "Sinhagad", "Torna"));
Set<String> club = Set.of("Torna", "Purandar", "Raigad");

Set<String> common = new HashSet<>(school);   // copy, so school stays unchanged
common.retainAll(club);                       // keep only what the club also visited

System.out.println(new TreeSet<>(common));    // TreeSet only to print in order
''')),
    method('stream().filter(...): find all that match a rule', 'Stream&lt;E&gt; filter(Predicate&lt;? super E&gt;)', 'a stream of the matching elements', 'O(n)',
           'When the rule is not "equal to", for example "name is longer than 6 letters", filter the set and collect the matches.',
           'There is no index to speed this up. If you filter the same big set often by the same rule, keep a second set or a map grouped by that rule.',
           P('HashSetFindFilterDemo', 'filter: forts with a long name', ['java.util.HashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> forts = new HashSet<>(Set.of("Torna", "Raigad", "Sinhagad", "Purandar"));

List<String> longNames = forts.stream()
        .filter(f -> f.length() > 6)   // keep names with more than 6 letters
        .sorted()                      // sort only to get a predictable print
        .toList();

System.out.println(longNames);
''')),
    method('stream().anyMatch / allMatch / noneMatch', 'boolean anyMatch(Predicate);  boolean allMatch(Predicate);  boolean noneMatch(Predicate)', '<code>true</code> or <code>false</code>', 'O(n), stops early',
           'Yes/no questions about a rule: does ANY element match? do ALL? does NONE?',
           'They are short-circuiting: <code>anyMatch</code> stops at the first match, <code>allMatch</code> at the first failure. On an empty set, <code>allMatch</code> is <code>true</code> and <code>anyMatch</code> is <code>false</code>.',
           P('HashSetFindMatchDemo', 'anyMatch / allMatch / noneMatch on a set', ['java.util.HashSet', 'java.util.Set'], r'''
Set<String> forts = new HashSet<>(Set.of("Torna", "Raigad", "Sinhagad"));

System.out.println(forts.stream().anyMatch(f -> f.startsWith("T")));    // true: Torna
System.out.println(forts.stream().allMatch(f -> f.length() > 5));       // false: Torna has 5
System.out.println(forts.stream().noneMatch(f -> f.isEmpty()));         // true
''')),
    method('Collections.min / Collections.max', 'static &lt;T&gt; T min(Collection&lt;? extends T&gt;);  static &lt;T&gt; T max(Collection&lt;? extends T&gt;)', 'the smallest / largest element', 'O(n)',
           'A HashSet cannot give you its smallest element for free, so these helpers scan the whole set and find it.',
           'If you need the min or max <strong>often</strong>, a <code>TreeSet</code> (<code>first()</code>/<code>last()</code> in O(log n)) is the better collection. Both throw <code>NoSuchElementException</code> on an empty set.',
           P('HashSetFindMinMaxDemo', 'Collections.min and max on a HashSet', ['java.util.Collections', 'java.util.HashSet', 'java.util.Set'], r'''
Set<Integer> heights = new HashSet<>(Set.of(1356, 1312, 1403, 1374));

System.out.println("Lowest  : " + Collections.min(heights));   // scans all elements
System.out.println("Highest : " + Collections.max(heights));
''')),
    method('stream().count() with a filter', 'long count()', 'how many elements match', 'O(n)',
           'Counts how many elements follow a rule. Without <code>filter</code> it is just <code>size()</code>, which is much faster.',
           'Do not write <code>stream().count()</code> when you mean <code>size()</code>: size is O(1).',
           P('HashSetFindCountDemo', 'count the forts that start with R or S', ['java.util.HashSet', 'java.util.Set'], r'''
Set<String> forts = new HashSet<>(Set.of("Raigad", "Rajgad", "Sinhagad", "Torna"));

long count = forts.stream()
        .filter(f -> f.startsWith("R") || f.startsWith("S"))
        .count();

System.out.println(count);   // Raigad, Rajgad, Sinhagad
''')),
    H('<h3>Which finding method to pick?</h3>\n' + table(['Question', 'Method', 'Time'], [
        ['Is this one value in the set?', '<code>contains</code>', 'O(1)'],
        ['Are all of these in the set?', '<code>containsAll</code>', 'O(m)'],
        ['What do two sets share?', '<code>retainAll</code> on a copy', 'O(n)'],
        ['Which elements follow a rule?', '<code>stream().filter(...)</code>', 'O(n)'],
        ['Does any / every element follow a rule?', '<code>anyMatch</code> / <code>allMatch</code>', 'O(n), early stop'],
        ['Smallest or largest?', '<code>Collections.min</code> / <code>max</code> (or use a TreeSet)', 'O(n)'],
        ['How many follow a rule?', '<code>filter(...).count()</code>', 'O(n)'],
    ])),
]

HS_EXPERT = [
    H('<h3>Real-time examples</h3>\n<p>Three small scenarios where a HashSet is the natural tool. Each is a complete program.</p>'),
    H('<h3>Example 1: unique visitors per day</h3>\n<p><strong>For freshers:</strong> the gate scanner records a visitor id on every entry, even repeats. A set per day counts each person once.</p>\n'
      '<p><strong>For experienced developers:</strong> this is the in-memory version of a "distinct count". For billions of ids you would switch to a probabilistic structure such as HyperLogLog.</p>',
      [P('UniqueVisitorsPerDay', 'Unique visitors per day with HashSet', ['java.util.HashSet', 'java.util.Set'], r'''
int[] mondayScans = {101, 102, 101, 103, 102, 101};   // visitor ids scanned at the Raigad gate
int[] tuesdayScans = {103, 104, 103, 105};

Set<Integer> monday = new HashSet<>();
for (int id : mondayScans) {
    monday.add(id);                 // a repeated id is ignored
}
Set<Integer> tuesday = new HashSet<>();
for (int id : tuesdayScans) {
    tuesday.add(id);
}

System.out.println("Monday  : " + mondayScans.length + " scans, " + monday.size() + " unique visitors");
System.out.println("Tuesday : " + tuesdayScans.length + " scans, " + tuesday.size() + " unique visitors");

Set<Integer> bothDays = new HashSet<>(monday);
bothDays.retainAll(tuesday);        // came on both days
System.out.println("Came on both days: " + bothDays.size());
''')]),
    H('<h3>Example 2: removing duplicate registrations</h3>\n<p><strong>For freshers:</strong> people sometimes register twice, once with capital letters. Clean the e-mail first (lower case), then let <code>add</code> tell you who is a duplicate.</p>\n'
      '<p><strong>For experienced developers:</strong> normalise the key before hashing (case, trim); the set only knows <code>equals</code>, not your business meaning of "same person".</p>',
      [P('DuplicateRegistrations', 'Detect duplicate registrations with add()', ['java.util.ArrayList', 'java.util.HashSet', 'java.util.List', 'java.util.Set'], r'''
List<String> emails = List.of("asha@mail.com", "Ravi@mail.com", "ASHA@mail.com", "meena@mail.com", "ravi@mail.com");

Set<String> seen = new HashSet<>();
List<String> duplicates = new ArrayList<>();
for (String email : emails) {
    String clean = email.toLowerCase();   // normalise before comparing
    if (!seen.add(clean)) {               // add() returns false for a repeat
        duplicates.add(email);
    }
}

System.out.println("Registered : " + emails.size());
System.out.println("Unique     : " + seen.size());
System.out.println("Duplicates : " + duplicates);
''')]),
    H('<h3>Example 3: new versus returning visitors</h3>\n<p><strong>For freshers:</strong> keep a set of everyone who has ever come. A new arrival is "new" when <code>add</code> returns true, and "returning" when it returns false.</p>\n'
      '<p><strong>For experienced developers:</strong> a single <code>add</code> call both tests and records, so there is no check-then-act race in single-threaded code; use <code>ConcurrentHashMap.newKeySet()</code> across threads.</p>',
      [P('NewVersusReturning', 'New versus returning visitors', ['java.util.HashSet', 'java.util.Set'], r'''
Set<String> everVisited = new HashSet<>(Set.of("Pune", "Nashik"));   // cities seen in earlier weeks
String[] thisWeek = {"Nagpur", "Pune", "Indore", "Nagpur"};

int newCities = 0;
int returning = 0;
for (String city : thisWeek) {
    if (everVisited.add(city)) {   // true = first time we see it
        newCities++;
    } else {
        returning++;
    }
}

System.out.println("New       : " + newCities);
System.out.println("Returning : " + returning);
System.out.println("Total cities known: " + everVisited.size());
''')]),
    H('<h3>Sample project: Trek registration desk</h3>\n<p><strong>What we build:</strong> a console program that checks sign-ups for fort treks.</p>\n'
      + ul([
          'Step 1: a list of sign-ups (name, e-mail, fort), some of them repeated.',
          'Step 2: a <code>HashSet</code> of keys "e-mail|fort" accepts the first sign-up and rejects repeats.',
          'Step 3: a map from fort to a set of attendees gives the head count per fort.',
          'Step 4: set maths finds people going to both Raigad and Torna, and the total number of different people.',
      ]),
      [r'''// SAMPLE PROJECT: Trek registration desk (HashSet in action)
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

public class TrekRegistrationDesk {
    record Registration(String email, String name, String fort) { }

    public static void main(String[] args) {
        // Step 1: raw sign-ups. Some people sign up twice or with different letter case.
        List<Registration> signups = List.of(
                new Registration("asha@mail.com", "Asha", "Raigad"),
                new Registration("ravi@mail.com", "Ravi", "Torna"),
                new Registration("ASHA@mail.com", "Asha K", "Raigad"),
                new Registration("meena@mail.com", "Meena", "Raigad"),
                new Registration("ravi@mail.com", "Ravi", "Raigad"),
                new Registration("kiran@mail.com", "Kiran", "Sinhagad"),
                new Registration("meena@mail.com", "Meena", "Torna"),
                new Registration("ravi@mail.com", "Ravi", "Torna"));

        // Step 2: accept the first sign-up for each (e-mail, fort) pair, reject the rest
        Set<String> seenKeys = new HashSet<>();
        List<Registration> accepted = new ArrayList<>();
        List<String> rejected = new ArrayList<>();
        for (Registration r : signups) {
            String key = r.email().toLowerCase() + "|" + r.fort();   // normalised key
            if (seenKeys.add(key)) {                                 // true = new pair
                accepted.add(r);
            } else {
                rejected.add(r.name() + " for " + r.fort());
            }
        }
        System.out.println("Sign-ups received : " + signups.size());
        System.out.println("Accepted          : " + accepted.size());
        System.out.println("Rejected          : " + rejected);

        // Step 3: attendees per fort (a TreeMap of TreeSets only to print in a fixed order)
        Map<String, Set<String>> byFort = new TreeMap<>();
        for (Registration r : accepted) {
            byFort.computeIfAbsent(r.fort(), f -> new TreeSet<>()).add(r.email().toLowerCase());
        }
        for (Map.Entry<String, Set<String>> e : byFort.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue().size() + " trekkers " + e.getValue());
        }

        // Step 4: set maths
        Set<String> both = new TreeSet<>(byFort.get("Raigad"));
        both.retainAll(byFort.get("Torna"));                         // intersection
        Set<String> everyone = new TreeSet<>();
        for (Set<String> group : byFort.values()) {
            everyone.addAll(group);                                  // union
        }
        System.out.println("Going to Raigad and Torna : " + both);
        System.out.println("Different people overall  : " + everyone.size());
    }
}
''' + OUT]),
    practice('Cities in the same trips, whatever the order',
             'Two coaches kept their own logs of cities picked up. The logs are lists, may repeat a city and are in different orders. Decide whether both coaches served exactly the same cities.',
             ['Make a set from each list.', 'Compare them with <code>equals</code> and print the result.', 'For two logs that differ, print the cities that appear in only one of them (symmetric difference), sorted.'],
             r'''// Practice: same set of cities in two logs
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class SameCitiesCheck {
    static Set<String> onlyInOne(Set<String> a, Set<String> b) {
        Set<String> result = new TreeSet<>(a);
        result.addAll(b);                      // union
        Set<String> both = new HashSet<>(a);
        both.retainAll(b);                     // intersection
        result.removeAll(both);                // union minus intersection
        return result;
    }

    public static void main(String[] args) {
        Set<String> coachA = new HashSet<>(List.of("Pune", "Nashik", "Pune", "Nagpur"));
        Set<String> coachB = new HashSet<>(List.of("Nagpur", "Pune", "Nashik", "Nashik"));
        Set<String> coachC = new HashSet<>(List.of("Pune", "Nagpur", "Indore"));

        System.out.println("A and B same cities? " + coachA.equals(coachB));
        System.out.println("A and C same cities? " + coachA.equals(coachC));
        System.out.println("Only in A or C      : " + onlyInOne(coachA, coachC));
    }
}
''' + OUT, level='Easy',
             hints=['<code>Set.equals</code> ignores order and duplicates.', 'Symmetric difference = union minus intersection.']),
    practice('Two forts that add up to the target height',
             'Given fort heights and a target number, find every pair of different heights that add up to the target, in one pass over the data.',
             ['Walk the array once.', 'For each height <code>x</code> ask a HashSet whether <code>target - x</code> was already seen.', 'Print each pair found, then add <code>x</code> to the set.'],
             r'''// Practice: pair with a given sum using a HashSet (one pass, O(n))
import java.util.HashSet;
import java.util.Set;

public class PairSumFinder {
    public static void main(String[] args) {
        int[] heights = {10, 15, 3, 7, 8, 12};
        int target = 15;

        Set<Integer> seen = new HashSet<>();
        for (int x : heights) {
            int need = target - x;              // the partner we are looking for
            if (seen.contains(need)) {          // O(1) lookup
                System.out.println("Pair found: " + need + " + " + x + " = " + target);
            }
            seen.add(x);                        // remember x for later elements
        }
    }
}
''' + OUT, level='Medium',
             hints=['The naive double loop is O(n squared); the set makes it O(n).', 'Add the current number after checking, not before.']),
    practice('Cities that every trip visited',
             'Several trips each visited a group of cities. Find the cities that were part of every trip, and the cities that appeared in at least one trip.',
             ['Store each trip as a <code>Set&lt;String&gt;</code> in a list.', 'Start the "common" set as a copy of the first trip and call <code>retainAll</code> with each other trip.', 'Build the "any trip" set with <code>addAll</code>. Print both sorted.'],
             r'''// Practice: intersection and union across many sets
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class CommonToAllTrips {
    public static void main(String[] args) {
        List<Set<String>> trips = new ArrayList<>();
        trips.add(Set.of("Pune", "Nashik", "Nagpur", "Indore"));
        trips.add(Set.of("Pune", "Nagpur", "Surat"));
        trips.add(Set.of("Nagpur", "Pune", "Indore", "Surat"));

        Set<String> common = new HashSet<>(trips.get(0));   // start with the first trip
        Set<String> any = new HashSet<>();
        for (Set<String> trip : trips) {
            common.retainAll(trip);     // shrink to what all trips share
            any.addAll(trip);           // grow to everything seen
        }

        System.out.println("In every trip    : " + new TreeSet<>(common));
        System.out.println("In at least one  : " + new TreeSet<>(any));
    }
}
''' + OUT, level='Medium',
             hints=['Never start "common" as an empty set: the intersection with an empty set stays empty.', 'Copy the first trip; do not modify it.']),
    practice('Longest stretch of letters without a repeat',
             'For a word, find the length of the longest part (substring) in which no letter appears twice. Use the sliding-window technique with a HashSet.',
             ['Keep two positions, <code>left</code> and <code>right</code>, and a set of the letters inside the window.', 'If the next letter is already in the set, remove letters from the left until it is not.', 'Add the new letter and record the largest window size. Test with three words.'],
             r'''// Practice: longest substring without repeating characters (sliding window)
import java.util.HashSet;
import java.util.Set;

public class LongestUniqueStretch {
    static int longest(String text) {
        Set<Character> window = new HashSet<>();
        int left = 0;
        int best = 0;
        for (int right = 0; right < text.length(); right++) {
            char c = text.charAt(right);
            while (window.contains(c)) {          // duplicate inside the window: shrink from the left
                window.remove(text.charAt(left));
                left++;
            }
            window.add(c);                        // window now has only distinct letters
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    public static void main(String[] args) {
        for (String word : new String[] {"abcabcbb", "pwwkew", "nashik"}) {
            System.out.println(word + " -> " + longest(word));
        }
    }
}
''' + OUT, level='Hard',
             hints=['Each letter is added once and removed at most once, so the whole job is O(n).', 'Check <code>contains</code> in a <code>while</code> loop, not an <code>if</code>.']),
]

# =====================================================================================================================
# LINKEDHASHSET
# =====================================================================================================================
LHS_BEGINNER = [
    H('<h3>Benefits and advantages</h3>\n<p><strong>For freshers:</strong> a LinkedHashSet is a HashSet that <em>remembers the order you added things in</em>. You get "no duplicates" and a predictable order together.</p>\n'
      + ul([
          '<strong>Predictable order:</strong> loops and <code>toString()</code> always show elements in insertion order.',
          '<strong>Still fast:</strong> <code>add</code>, <code>remove</code> and <code>contains</code> are O(1) on average, like a HashSet.',
          '<strong>Best way to remove duplicates but keep order:</strong> <code>new ArrayList&lt;&gt;(new LinkedHashSet&lt;&gt;(list))</code>.',
          '<strong>Java 21 extras:</strong> <code>getFirst</code>, <code>getLast</code>, <code>removeFirst</code>, <code>addFirst</code> and <code>reversed()</code> make it easy to treat it like a queue or a history list.',
          '<strong>Repeatable output:</strong> tests and printed results look the same on every run.',
      ])
      + '\n<p><strong>For experienced developers:</strong> internally a HashMap whose entries are also chained in a doubly linked list. Iteration is O(size), unlike HashSet, whose iteration is O(capacity + size). Re-adding an existing element does <strong>not</strong> change its position.</p>'),
    H('<h3>Disadvantages and when NOT to use it</h3>\n<p><strong>For freshers:</strong> the order has a price, and it is not sorted order.</p>\n'
      + ul([
          '<strong>More memory than HashSet:</strong> every entry carries two extra links (before and after).',
          '<strong>Slightly slower adds and removes</strong> because the links must be updated.',
          '<strong>Insertion order is not sorted order:</strong> if you want A to Z, use a TreeSet.',
          '<strong>No index:</strong> still no <code>get(i)</code> or <code>indexOf</code>.',
          '<strong>Same rules as HashSet:</strong> good <code>equals</code>/<code>hashCode</code>, no changing elements after adding, not thread-safe.',
      ])
      + '\n<p><strong>For experienced developers:</strong> re-inserting to "refresh" an element needs <code>remove</code> then <code>add</code> (two operations). For a real LRU cache a <code>LinkedHashMap</code> with access order is a better fit.</p>\n'
      + table(['Use a LinkedHashSet when', 'Use something else when'], [
          ['You need uniqueness AND insertion order', 'Order does not matter: <strong>HashSet</strong> (less memory)'],
          ['You show history, steps or a route once each', 'You need sorted order or range search: <strong>TreeSet</strong>'],
          ['You dedupe a list and keep the first-seen order', 'You need duplicates or positions: <strong>ArrayList</strong>'],
          ['You want repeatable output for tests', 'You need an LRU cache: <strong>LinkedHashMap</strong> (access order)'],
      ])),
]

LHS_INTERMEDIATE = [
    H('<h3>Module: Sorting methods</h3>\n<p><strong>For freshers:</strong> a LinkedHashSet keeps <em>insertion</em> order, which is not the same as <em>sorted</em> order. The cards show how to see its order, flip it, change it, and how to get a sorted result when you need one.</p>\n'
      '<p><strong>For experienced developers:</strong> the set has no <code>sort()</code> method. You always build a new collection (sort is O(n log n)); only the order of a <code>LinkedHashSet</code> built from a sorted stream is "frozen" as sorted until you add more.</p>'),
    method('Insertion order is the order', 'for (E e : linkedHashSet)', 'elements in the order they were first added', 'O(n)',
           'The order you add things is the order you get them back. Adding an element that is already there changes nothing, not even its position.',
           'This is called a <em>stable, predictable</em> iteration order. It is the main reason to choose LinkedHashSet over HashSet.',
           P('LinkedHashSetOrderDemo', 'LinkedHashSet keeps insertion order', ['java.util.LinkedHashSet', 'java.util.Set'], r'''
Set<String> forts = new LinkedHashSet<>();
forts.add("Torna");
forts.add("Raigad");
forts.add("Sinhagad");
forts.add("Raigad");   // duplicate: ignored, position unchanged

System.out.println(forts);   // Torna, Raigad, Sinhagad
''')),
    method('Sorted copy: new TreeSet&lt;&gt;(set)', 'Set&lt;E&gt; sorted = new TreeSet&lt;&gt;(set)', 'a new sorted set', 'O(n log n)',
           'Need A to Z for one moment? Copy into a TreeSet. The LinkedHashSet itself is not touched.',
           'The copy loses insertion order (it is sorted now). Keep the original LinkedHashSet if you still need the order of arrival.',
           P('LinkedHashSetSortedCopyDemo', 'sorted copy of a LinkedHashSet', ['java.util.LinkedHashSet', 'java.util.Set', 'java.util.TreeSet'], r'''
Set<String> forts = new LinkedHashSet<>(java.util.List.of("Torna", "Raigad", "Sinhagad"));

Set<String> sorted = new TreeSet<>(forts);

System.out.println("Original : " + forts);    // still insertion order
System.out.println("Sorted   : " + sorted);
''')),
    method('Sorted but still a LinkedHashSet: sorted + toCollection', 'stream().sorted().collect(Collectors.toCollection(LinkedHashSet::new))', 'a LinkedHashSet whose insertion order is sorted order', 'O(n log n)',
           'Sort with a stream, then collect into a new LinkedHashSet. The "insertion order" of the new set is the sorted order.',
           'Useful when later code expects a <code>LinkedHashSet</code> or when you will add more items at the end. Later additions are <strong>not</strong> sorted in; they simply go last.',
           P('LinkedHashSetSortedOrderDemo', 'sort and keep as a LinkedHashSet', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set', 'java.util.stream.Collectors'], r'''
Set<String> forts = new LinkedHashSet<>(List.of("Torna", "Raigad", "Sinhagad"));

Set<String> sortedKeepOrder = forts.stream()
        .sorted()
        .collect(Collectors.toCollection(LinkedHashSet::new));   // remembers the sorted order

System.out.println(sortedKeepOrder);
''')),
    method('Newest first: reversed()  (Java 21)', 'SequencedSet&lt;E&gt; reversed()', 'a reversed <em>view</em> of the set', 'O(1) to create',
           'Shows the elements from last added to first added. Perfect for a "recent history" list.',
           'It is a live view, not a copy: changes to the original show up in the view. Java 21 introduced the sequenced collection interfaces; before that you needed a list and <code>Collections.reverse</code>.',
           P('LinkedHashSetReversedViewDemo', 'newest first with reversed()', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.SequencedSet'], r'''
SequencedSet<String> history = new LinkedHashSet<>(List.of("Torna", "Raigad", "Sinhagad"));

System.out.println("Oldest first : " + history);
System.out.println("Newest first : " + history.reversed());   // view, no copy
''')),
    method('Change the order: remove then add', 'set.remove(e);  set.add(e)', 'the element moves to the end', 'O(1)',
           'Adding an element that is already inside does nothing, so to move it to the end (for example "visited again") you remove it first and add it again.',
           'This is the building block of an LRU cache. In Java 21 you can also move an element to the front with <code>addFirst(e)</code>.',
           P('LinkedHashSetMoveToEndDemo', 'move an element to the end', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> forts = new LinkedHashSet<>(List.of("Torna", "Raigad", "Sinhagad"));

forts.add("Torna");      // already present: nothing changes
System.out.println(forts);

forts.remove("Torna");   // take it out ...
forts.add("Torna");      // ... and add it again: now it is last
System.out.println(forts);
''')),
    method('Sort with your own rule: ArrayList + list.sort(Comparator)', 'new ArrayList&lt;&gt;(set).sort(Comparator)', 'a sorted list', 'O(n log n)',
           'Copy into a list and sort with a Comparator, for example by name length. If two names have the same length they stay in their insertion order.',
           'List sorting in Java is <strong>stable</strong> (it never swaps equal items), so a LinkedHashSet source gives a fully predictable result even without a tie-breaker.',
           P('LinkedHashSetSortRuleDemo', 'sort by length, ties keep insertion order', ['java.util.ArrayList', 'java.util.Comparator', 'java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> forts = new LinkedHashSet<>(List.of("Torna", "Raigad", "Sinhagad", "Purandar"));

List<String> list = new ArrayList<>(forts);
list.sort(Comparator.comparing(String::length));   // stable: Sinhagad stays before Purandar

System.out.println(list);
''')),
    H('<h3>Which sorting or ordering method to pick?</h3>\n' + table(['You need', 'Pick', 'Result'], [
        ['Insertion order (default)', 'just iterate', 'Order of first add'],
        ['Latest first', '<code>reversed()</code>', 'Live reversed view'],
        ['Alphabetical set', '<code>new TreeSet&lt;&gt;(set)</code>', 'Sorted, loses insertion order'],
        ['Sorted but still a LinkedHashSet', '<code>sorted().collect(toCollection(LinkedHashSet::new))</code>', 'Order frozen as sorted'],
        ['Move one element to the end', '<code>remove</code> then <code>add</code>', 'Same set, new position'],
        ['Own rule with index access', '<code>new ArrayList</code> + <code>sort(Comparator)</code>', 'Stable sorted list'],
    ])),

    H('<h3>Module: Finding (searching) methods</h3>\n<p><strong>For freshers:</strong> finding in a LinkedHashSet works like a HashSet, plus extra tricks that use the order: first element, last element, "first one that matches".</p>\n'
      '<p><strong>For experienced developers:</strong> <code>contains</code> is O(1); everything that depends on position (index of an element, previous element) needs a scan or a copy to a list, O(n).</p>'),
    method('contains(Object o)', 'boolean contains(Object o)', '<code>true</code> or <code>false</code>', 'O(1) average',
           'Is it in the set? Answers instantly, no matter how large the set is.',
           'The linked list is not used for lookup; the hash table is.',
           P('LinkedHashSetFindContainsDemo', 'contains on a LinkedHashSet', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> route = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur"));

System.out.println(route.contains("Nashik"));   // true
System.out.println(route.contains("Surat"));    // false
''')),
    method('containsAll(Collection c)', 'boolean containsAll(Collection&lt;?&gt; c)', '<code>true</code> if all are present', 'O(m)',
           'Are all the required stops in the route? One missing stop gives <code>false</code>. Order does not matter for this test.',
           'It only checks membership; if the order of stops must match as well, compare two lists instead.',
           P('LinkedHashSetFindContainsAllDemo', 'containsAll on a route', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> route = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur"));

System.out.println(route.containsAll(List.of("Nagpur", "Pune")));   // true, order ignored
System.out.println(route.containsAll(List.of("Pune", "Surat")));    // false
''')),
    method('getFirst() and getLast()  (Java 21)', 'E getFirst();  E getLast()', 'the oldest / the newest element', 'O(1)',
           'Because the set remembers order, you can ask for the first or the last element directly, which a HashSet can never do.',
           'Before Java 21 you needed an iterator for the first element and a full loop (or <code>new ArrayList</code>) for the last. Both throw <code>NoSuchElementException</code> on an empty set.',
           P('LinkedHashSetFindFirstLastDemo', 'oldest and newest element', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
LinkedHashSet<String> route = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur"));

System.out.println("Start : " + route.getFirst());   // Pune
System.out.println("End   : " + route.getLast());    // Nagpur
''')),
    method('Position of an element: new ArrayList(set).indexOf(e)', 'int indexOf(Object o)  // on a list copy', 'the position (0 based) or -1', 'O(n)',
           'A set has no index, so to find "which stop number is Nagpur?" copy the set into a list and ask the list.',
           'The copy costs O(n) each time. If you need positions often, keep an <code>ArrayList</code> for the order and a <code>HashSet</code> for uniqueness.',
           P('LinkedHashSetFindIndexDemo', 'position of an element', ['java.util.ArrayList', 'java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> route = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur"));

List<String> asList = new ArrayList<>(route);   // order is kept in the copy
System.out.println("Nagpur is stop number " + (asList.indexOf("Nagpur") + 1));
System.out.println("Surat position: " + asList.indexOf("Surat"));   // -1 = not found
''')),
    method('stream().filter(...).findFirst()', 'Optional&lt;E&gt; findFirst()', 'an Optional holding the first match in insertion order', 'O(n), stops early',
           'Finds the <strong>earliest added</strong> element that follows a rule. With a HashSet this answer would be random; here it is dependable.',
           'Use <code>orElse</code> or <code>ifPresent</code> on the result; <code>get()</code> on an empty Optional throws.',
           P('LinkedHashSetFindFirstMatchDemo', 'first city with a long name', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> route = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur", "Aurangabad"));

String firstLong = route.stream()
        .filter(city -> city.length() > 5)   // Nashik and Nagpur have 6, Aurangabad 10
        .findFirst()                         // first in insertion order
        .orElse("none");

System.out.println(firstLong);
''')),
    method('retainAll(Collection c): common stops, order kept', 'boolean retainAll(Collection&lt;?&gt; c)', '<code>true</code> if the set changed', 'O(n)',
           'Keeps only the stops that are also in the other group, <strong>in the order of the original set</strong>.',
           'Run it on a copy. The order of the result follows the receiver, not the argument.',
           P('LinkedHashSetFindRetainAllDemo', 'common stops in route order', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> routeA = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur", "Indore"));
Set<String> routeB = Set.of("Indore", "Pune", "Surat");

Set<String> common = new LinkedHashSet<>(routeA);   // copy first
common.retainAll(routeB);

System.out.println(common);   // Pune, Indore: in routeA order
''')),
    method('Neighbour of an element: loop with a "previous" variable', 'for (E e : set)', 'the element before another one', 'O(n)',
           'To find the stop that comes right before "Nagpur", walk the set and remember the previous element.',
           'There is no <code>lower()</code> as in TreeSet: "before" means insertion order, so a scan is the only way.',
           P('LinkedHashSetFindPreviousDemo', 'stop before a given stop', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
Set<String> route = new LinkedHashSet<>(List.of("Pune", "Nashik", "Nagpur", "Indore"));

String previous = null;
for (String city : route) {
    if (city.equals("Nagpur")) {
        break;                // stop, previous holds the city before
    }
    previous = city;          // remember this city for the next round
}

System.out.println("Before Nagpur: " + previous);
''')),
    H('<h3>Which finding method to pick?</h3>\n' + table(['Question', 'Method', 'Time'], [
        ['Is it in the set?', '<code>contains</code>', 'O(1)'],
        ['Are all of these in it?', '<code>containsAll</code>', 'O(m)'],
        ['First or last added?', '<code>getFirst</code> / <code>getLast</code>', 'O(1)'],
        ['Which stop number?', '<code>new ArrayList(set).indexOf</code>', 'O(n)'],
        ['First that follows a rule?', '<code>stream().filter().findFirst()</code>', 'O(n)'],
        ['What do two groups share (order kept)?', '<code>retainAll</code> on a copy', 'O(n)'],
        ['What came before X?', 'loop with a previous variable', 'O(n)'],
    ])),
]

LHS_EXPERT = [
    H('<h3>Real-time examples</h3>\n<p>Three everyday jobs for a set that remembers order.</p>'),
    H('<h3>Example 1: search history with no repeats</h3>\n<p><strong>For freshers:</strong> a search box shows your last searches, newest first, and a repeated search moves up instead of appearing twice.</p>\n'
      '<p><strong>For experienced developers:</strong> remove-then-add gives "most recently used" order in O(1); trimming with <code>removeFirst</code> bounds the memory.</p>',
      [P('SearchHistoryExample', 'Search history: unique and newest first', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.SequencedSet'], r'''
SequencedSet<String> history = new LinkedHashSet<>();
int limit = 3;                                  // keep only the 3 latest searches

for (String search : List.of("Raigad", "Torna", "Raigad", "Sinhagad", "Purandar")) {
    history.remove(search);                     // if searched before, take it out ...
    history.add(search);                        // ... and add it as the newest
    if (history.size() > limit) {
        history.removeFirst();                  // drop the oldest search
    }
}

System.out.println("Newest first: " + history.reversed());
''')]),
    H('<h3>Example 2: unique tags in the order the user typed them</h3>\n<p><strong>For freshers:</strong> a user types tags with repeats. We keep each tag once, in the typed order, so the page shows exactly what the user expects.</p>\n'
      '<p><strong>For experienced developers:</strong> a HashSet would show tags in a random order, which makes the page jump around between runs and breaks snapshot tests.</p>',
      [P('UniqueTagsExample', 'Unique tags in typed order', ['java.util.Arrays', 'java.util.LinkedHashSet', 'java.util.Set'], r'''
String typed = "fort, trek, Raigad, trek, monsoon, fort, sunrise";

Set<String> tags = new LinkedHashSet<>();
for (String tag : typed.split(",")) {
    tags.add(tag.trim());                       // trim spaces, duplicates ignored
}

System.out.println("Typed  : " + typed.split(",").length + " tags");
System.out.println("Stored : " + tags.size() + " tags -> " + String.join(" | ", tags));
''')]),
    H('<h3>Example 3: an itinerary where every city appears once</h3>\n<p><strong>For freshers:</strong> a travel plan lists cities as they are booked. The final route shows each city once, numbered in order of the first booking.</p>\n'
      '<p><strong>For experienced developers:</strong> the first occurrence wins, which is the usual rule for deduplicating ordered input.</p>',
      [P('ItineraryExample', 'Itinerary with each city once', ['java.util.LinkedHashSet', 'java.util.List', 'java.util.Set'], r'''
List<String> bookings = List.of("Pune", "Nashik", "Pune", "Nagpur", "Nashik", "Indore");

Set<String> route = new LinkedHashSet<>(bookings);   // first booking of each city wins

int stop = 1;
for (String city : route) {
    System.out.println("Stop " + stop + ": " + city);
    stop++;
}
''')]),
    H('<h3>Sample project: Fort visit history</h3>\n<p><strong>What we build:</strong> a small "recently viewed forts" feature like the one in a travel app.</p>\n'
      + ul([
          'Step 1: a <code>History</code> class with a <code>LinkedHashSet</code> and a size limit.',
          'Step 2: <code>visit(fort)</code> moves a fort to the end if it was seen, and drops the oldest when the limit is passed.',
          'Step 3: helper methods show the newest first, the oldest, and the newest.',
          'Step 4: a <code>main</code> method replays a list of visits and prints the history after each one.',
      ]),
      [r'''// SAMPLE PROJECT: Recently viewed forts (LinkedHashSet history)
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

public class FortHistoryApp {
    static class History {
        private final LinkedHashSet<String> items = new LinkedHashSet<>();   // oldest ... newest
        private final int limit;

        History(int limit) {
            this.limit = limit;
        }

        // Step 2: record a visit
        void visit(String fort) {
            items.remove(fort);                    // seen before? take it out so it can move
            items.add(fort);                       // add at the end = newest
            if (items.size() > limit) {
                String dropped = items.removeFirst();   // too many: forget the oldest (Java 21)
                System.out.println("   (forgot " + dropped + ")");
            }
        }

        // Step 3: read the history
        List<String> newestFirst() {
            return new ArrayList<>(items.reversed());
        }

        String oldest() {
            return items.getFirst();
        }

        String newest() {
            return items.getLast();
        }
    }

    public static void main(String[] args) {
        // Step 1: a history that keeps only 4 forts
        History history = new History(4);

        // Step 4: replay some visits
        String[] visits = {"Raigad", "Torna", "Sinhagad", "Raigad", "Purandar", "Lohagad", "Torna"};
        for (String fort : visits) {
            System.out.println("Visited " + fort);
            history.visit(fort);
            System.out.println("   history: " + history.newestFirst());
        }

        System.out.println("Oldest in history : " + history.oldest());
        System.out.println("Newest in history : " + history.newest());
    }
}
''' + OUT]),
    practice('Unique letters in the order they first appear',
             'Given a word, print its different letters in the order of their first appearance, and how many were repeats.',
             ['Loop over the characters and add each to a <code>LinkedHashSet&lt;Character&gt;</code>.', 'Count the repeats as the number of times <code>add</code> returned <code>false</code>.', 'Build the result text from the set.'],
             r'''// Practice: first-appearance order of letters
import java.util.LinkedHashSet;
import java.util.Set;

public class FirstAppearanceLetters {
    public static void main(String[] args) {
        String word = "mahabaleshwar";

        Set<Character> letters = new LinkedHashSet<>();
        int repeats = 0;
        for (char c : word.toCharArray()) {
            if (!letters.add(c)) {      // false means the letter was already there
                repeats++;
            }
        }

        StringBuilder text = new StringBuilder();
        for (char c : letters) {
            text.append(c);
        }
        System.out.println("Word    : " + word);
        System.out.println("Letters : " + text);
        System.out.println("Repeats : " + repeats);
    }
}
''' + OUT, level='Easy',
             hints=['A <code>char</code> is boxed to <code>Character</code> automatically.', 'A HashSet could give the right letters but in an unpredictable order.']),
    practice('Combine two itineraries and keep the order',
             'Plan A and plan B are lists of cities. Print the combined plan (A first, then new cities of B), the cities both plans share in plan A order, and the cities only plan B has.',
             ['Union: copy A into a <code>LinkedHashSet</code> and call <code>addAll(B)</code>.', 'Intersection: copy A and call <code>retainAll(B)</code>.', 'Difference: copy B and call <code>removeAll(A)</code>.'],
             r'''// Practice: union, intersection and difference that keep the order
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class OrderedPlanMerge {
    public static void main(String[] args) {
        List<String> planA = List.of("Pune", "Nashik", "Nagpur", "Indore");
        List<String> planB = List.of("Nagpur", "Surat", "Pune");

        Set<String> union = new LinkedHashSet<>(planA);
        union.addAll(planB);                  // new cities of B go to the end

        Set<String> shared = new LinkedHashSet<>(planA);
        shared.retainAll(planB);              // order of plan A

        Set<String> onlyB = new LinkedHashSet<>(planB);
        onlyB.removeAll(planA);

        System.out.println("Combined plan : " + union);
        System.out.println("In both       : " + shared);
        System.out.println("Only in B     : " + onlyB);
    }
}
''' + OUT, level='Medium',
             hints=['Always copy before calling retainAll or removeAll: they change the receiver.']),
    practice('First repeated city and the loop it closes',
             'A route list visits cities. Find the first city that is visited a second time and print the loop of cities from its first visit back to it.',
             ['Walk the route adding cities to a <code>LinkedHashSet</code>; the first <code>add</code> that returns <code>false</code> finds the repeat.', 'Walk the set again, collect cities starting at the repeated one.', 'Print the loop with an arrow between cities, ending with the repeated city.'],
             r'''// Practice: detect the first repeated city and print the loop
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class RouteLoopFinder {
    public static void main(String[] args) {
        List<String> route = List.of("Pune", "Nashik", "Nagpur", "Indore", "Nashik", "Surat");

        Set<String> visited = new LinkedHashSet<>();
        String repeated = null;
        for (String city : route) {
            if (!visited.add(city)) {       // second visit found
                repeated = city;
                break;
            }
        }

        if (repeated == null) {
            System.out.println("No city repeats");
            return;
        }

        List<String> loop = new ArrayList<>();
        boolean collecting = false;
        for (String city : visited) {       // insertion order = visiting order
            if (city.equals(repeated)) {
                collecting = true;          // start from the first visit of the repeated city
            }
            if (collecting) {
                loop.add(city);
            }
        }
        loop.add(repeated);                 // close the loop
        System.out.println("First repeat: " + repeated);
        System.out.println("Loop        : " + String.join(" -> ", loop));
    }
}
''' + OUT, level='Medium',
             hints=['The set holds cities in the order of their first visit, which is what the loop needs.']),
    practice('A small LRU cache of fort ids with hit and miss counts',
             'Build a cache that keeps at most 3 fort names. A request is a "hit" if the fort is in the cache (and it becomes the most recent), or a "miss" if not (it is added, and the least recently used fort is evicted when full). Replay seven requests and print the result of each.',
             ['Create a class <code>FortCache</code> with a <code>LinkedHashSet</code> and a capacity.', 'In <code>request</code>, use <code>contains</code> to decide hit or miss, refresh by remove-then-add, and evict with an iterator when the set is too big.', 'Print each request, HIT or MISS, and the cache content; end with total hits and misses.'],
             r'''// Practice: LRU cache built on a LinkedHashSet
import java.util.Iterator;
import java.util.LinkedHashSet;

public class FortCacheDemo {
    static class FortCache {
        private final LinkedHashSet<String> cache = new LinkedHashSet<>();   // least recent ... most recent
        private final int capacity;
        int hits;
        int misses;

        FortCache(int capacity) {
            this.capacity = capacity;
        }

        boolean request(String fort) {
            boolean hit = cache.contains(fort);
            if (hit) {
                hits++;
                cache.remove(fort);              // refresh: it becomes the most recent
            } else {
                misses++;
                if (cache.size() == capacity) {
                    Iterator<String> oldest = cache.iterator();
                    oldest.next();               // the first element is the least recently used
                    oldest.remove();             // evict it
                }
            }
            cache.add(fort);
            return hit;
        }

        @Override
        public String toString() {
            return cache.toString();
        }
    }

    public static void main(String[] args) {
        FortCache cache = new FortCache(3);
        String[] requests = {"Raigad", "Torna", "Raigad", "Sinhagad", "Purandar", "Torna", "Raigad"};

        for (String fort : requests) {
            boolean hit = cache.request(fort);
            System.out.println(fort + " -> " + (hit ? "HIT " : "MISS") + " cache " + cache);
        }
        System.out.println("Hits " + cache.hits + ", misses " + cache.misses);
    }
}
''' + OUT, level='Hard',
             hints=['Evict before adding the new fort, otherwise the new one may be the oldest.', 'In real code <code>LinkedHashMap</code> with access order and <code>removeEldestEntry</code> does this for you.']),
]

# =====================================================================================================================
# TREESET
# =====================================================================================================================
TS_BEGINNER = [
    H('<h3>Benefits and advantages</h3>\n<p><strong>For freshers:</strong> a TreeSet is a set that <em>keeps itself sorted</em>. You add in any order, and when you loop you always get smallest to biggest.</p>\n'
      + ul([
          '<strong>Always sorted:</strong> no separate sort step; every <code>add</code> puts the element in the right place.',
          '<strong>No duplicates</strong>, just like every set.',
          '<strong>Smallest and largest instantly:</strong> <code>first()</code> and <code>last()</code>.',
          '<strong>"Nearest value" search:</strong> <code>floor</code>, <code>ceiling</code>, <code>lower</code>, <code>higher</code> find the closest smaller or bigger element.',
          '<strong>Range views:</strong> <code>headSet</code>, <code>tailSet</code>, <code>subSet</code> give everything below, above or between values.',
          '<strong>Your own order:</strong> pass a <code>Comparator</code> (newest first, by score, ignoring case, ...).',
      ])
      + '\n<p><strong>For experienced developers:</strong> backed by a red-black tree (<code>TreeMap</code>); every operation is O(log n) worst case, never degraded by bad hash codes. It implements <code>NavigableSet</code>, so it can replace many "sort then binary search" code paths.</p>'),
    H('<h3>Disadvantages and when NOT to use it</h3>\n<p><strong>For freshers:</strong> being sorted is not free.</p>\n'
      + ul([
          '<strong>Slower than HashSet:</strong> O(log n) instead of O(1) for <code>add</code>, <code>remove</code> and <code>contains</code>.',
          '<strong>Elements must be comparable:</strong> they implement <code>Comparable</code> or you give a <code>Comparator</code>, or you get <code>ClassCastException</code>.',
          '<strong>No null</strong> with natural ordering.',
          '<strong>"Same" means compareTo is 0, not equals:</strong> a Comparator that ignores a field silently treats different objects as duplicates.',
          '<strong>More memory:</strong> each element lives in a tree node with left, right and parent links.',
          '<strong>No index</strong> and not thread-safe (use <code>ConcurrentSkipListSet</code> for threads).',
      ])
      + '\n<p><strong>For experienced developers:</strong> iterating in order is O(n) and cache-unfriendly compared with an array. If data is loaded once and then only read, a sorted <code>ArrayList</code> plus <code>Collections.binarySearch</code> is smaller and faster.</p>\n'
      + table(['Use a TreeSet when', 'Use something else when'], [
          ['You need sorted output at all times', 'You only need uniqueness and speed: <strong>HashSet</strong>'],
          ['You search by nearest value or range', 'You need insertion order: <strong>LinkedHashSet</strong>'],
          ['You often need the smallest or largest', 'Data is loaded once, then only read: sorted <strong>ArrayList</strong> + binary search'],
          ['Elements have a clear ordering rule', 'Elements have no natural order and equals matters'],
      ])),
]

TS_INTERMEDIATE = [
    H('<h3>Module: Sorting methods</h3>\n<p><strong>For freshers:</strong> a TreeSet <em>is</em> the sorting tool. You choose the rule: natural order (A to Z, small to big) or your own <code>Comparator</code>. The cards show each way, with a tiny program.</p>\n'
      '<p><strong>For experienced developers:</strong> the order is decided once, at construction, and cannot be changed later. Inserting is O(log n), so building a TreeSet of n elements is O(n log n), the same as one sort.</p>'),
    method('Natural order: no extra code', 'new TreeSet&lt;&gt;()', 'elements ordered by <code>compareTo</code>', 'O(log n) per add',
           'Numbers sort small to big and Strings sort alphabetically (capital letters before small letters). Just add the elements.',
           'The element type must implement <code>Comparable</code>. Your own class needs a <code>compareTo</code> method.',
           P('TreeSetSortNaturalDemo', 'TreeSet natural order', ['java.util.Set', 'java.util.TreeSet'], r'''
Set<Integer> heights = new TreeSet<>();
heights.add(1403);
heights.add(1312);
heights.add(1374);
heights.add(1356);

System.out.println(heights);   // always small to big
''')),
    method('Reverse order: Comparator.reverseOrder()', 'new TreeSet&lt;&gt;(Comparator.reverseOrder())', 'elements biggest first', 'O(log n) per add',
           'Hand the TreeSet a rule when you create it. <code>reverseOrder()</code> flips the natural order.',
           'The comparator is part of the set for its whole life, and it decides what a duplicate is. Pass it in the constructor, you cannot add it later.',
           P('TreeSetSortReverseDemo', 'TreeSet with a reverse comparator', ['java.util.Comparator', 'java.util.Set', 'java.util.TreeSet'], r'''
Set<Integer> heights = new TreeSet<>(Comparator.reverseOrder());
heights.add(1403);
heights.add(1312);
heights.add(1374);

System.out.println(heights);   // biggest first
''')),
    method('Several rules: Comparator.comparing(...).thenComparing(...)', 'new TreeSet&lt;&gt;(Comparator)', 'objects ordered by more than one field', 'O(log n) per add',
           'Sort forts by height (tallest first) and, when heights are equal, by name. Always finish with a field that makes every element different, otherwise equal-ranked elements are lost as "duplicates".',
           'A <code>record</code> is ideal as the element: immutable, with <code>equals</code> and <code>hashCode</code> for free.',
           P('TreeSetSortMultiFieldDemo', 'TreeSet ordered by height then name', ['java.util.Comparator', 'java.util.TreeSet'], r'''
record Fort(String name, int height) { }

Comparator<Fort> order = Comparator.comparing(Fort::height, Comparator.reverseOrder())   // tallest first
        .thenComparing(Fort::name);                                                       // tie-breaker

TreeSet<Fort> forts = new TreeSet<>(order);
forts.add(new Fort("Torna", 1403));
forts.add(new Fort("Raigad", 1356));
forts.add(new Fort("Rajgad", 1356));   // same height as Raigad: the name keeps it as a separate element

forts.forEach(f -> System.out.println(f.name() + " " + f.height()));
''')),
    method('Ignore letter case: String.CASE_INSENSITIVE_ORDER', 'new TreeSet&lt;&gt;(String.CASE_INSENSITIVE_ORDER)', 'strings sorted ignoring case', 'O(log n) per add',
           '"raigad" and "Raigad" are different Strings, but with this comparator they are the <em>same</em> element, so the second one is ignored.',
           'This shows the rule: a TreeSet decides "duplicate" with the comparator, not with <code>equals</code>. That can be a feature (case-insensitive sets) or a bug (a comparator that ignores a field).',
           P('TreeSetSortCaseDemo', 'TreeSet ignoring case', ['java.util.Set', 'java.util.TreeSet'], r'''
Set<String> forts = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
forts.add("raigad");
forts.add("Raigad");    // same as raigad for this comparator: ignored
forts.add("Torna");
forts.add("sinhagad");

System.out.println(forts);   // the first spelling of each stays
''')),
    method('Reverse view: descendingSet()', 'NavigableSet&lt;E&gt; descendingSet()', 'a live reversed view', 'O(1) to create',
           'Need the same set from biggest to smallest, without building a new one? Ask for the descending view.',
           'It is a view, so changes through either set show in the other. <code>reversed()</code> (Java 21) gives the same thing.',
           P('TreeSetSortDescendingDemo', 'descendingSet view', ['java.util.TreeSet', 'java.util.Set'], r'''
TreeSet<Integer> heights = new TreeSet<>(Set.of(1312, 1356, 1374, 1403));

System.out.println("Ascending  : " + heights);
System.out.println("Descending : " + heights.descendingSet());   // view, no copy
''')),
    method('Sorted list with positions: new ArrayList&lt;&gt;(treeSet)', 'List&lt;E&gt; list = new ArrayList&lt;&gt;(set)', 'a sorted list you can index', 'O(n)',
           'The set has no <code>get(i)</code>. Copy it into a list, which keeps the sorted order, and then ask for the 1st, 2nd or 3rd smallest.',
           'The copy is O(n) and does not need to sort again. Do it once and reuse the list rather than copying inside a loop.',
           P('TreeSetSortToListDemo', 'sorted set copied to a list', ['java.util.ArrayList', 'java.util.List', 'java.util.Set', 'java.util.TreeSet'], r'''
Set<Integer> heights = new TreeSet<>(Set.of(1312, 1356, 1374, 1403));

List<Integer> list = new ArrayList<>(heights);   // already sorted

System.out.println("Second smallest : " + list.get(1));
System.out.println("Third tallest   : " + list.get(list.size() - 3));
''')),
    H('<h3>Which sorting approach to pick?</h3>\n' + table(['You need', 'Pick', 'Note'], [
        ['Small to big or A to Z', '<code>new TreeSet&lt;&gt;()</code>', 'Elements must be Comparable'],
        ['Biggest first', '<code>Comparator.reverseOrder()</code>', 'Set at creation'],
        ['Sort objects by fields', '<code>Comparator.comparing(...).thenComparing(...)</code>', 'End with a unique field'],
        ['Case-insensitive strings', '<code>String.CASE_INSENSITIVE_ORDER</code>', '"Raigad" equals "raigad" here'],
        ['Both directions', '<code>descendingSet()</code>', 'View, no copy'],
        ['Position access', '<code>new ArrayList&lt;&gt;(set)</code>', 'Copy once'],
    ])),

    H('<h3>Module: Finding (searching) methods</h3>\n<p><strong>For freshers:</strong> a TreeSet can find things a HashSet cannot: "the smallest", "the closest smaller one", "everything between 1300 and 1400". Each card has one tiny program.</p>\n'
      '<p><strong>For experienced developers:</strong> the navigation methods are O(log n) walks down the tree. The views from <code>headSet</code>/<code>tailSet</code>/<code>subSet</code> are O(1) to create, but calling <code>size()</code> on them is O(k) for k elements.</p>'),
    method('contains(Object o)', 'boolean contains(Object o)', '<code>true</code> or <code>false</code>', 'O(log n)',
           'Is the value in the set? It walks down the tree, going left or right at each step, so even a million elements need about 20 steps.',
           'Uses the comparator (<code>compareTo</code>), not <code>hashCode</code>. With a case-insensitive comparator, <code>contains("RAIGAD")</code> is true for "raigad".',
           P('TreeSetFindContainsDemo', 'TreeSet contains', ['java.util.Set', 'java.util.TreeSet'], r'''
Set<Integer> heights = new TreeSet<>(Set.of(1312, 1356, 1374, 1403));

System.out.println(heights.contains(1356));   // true
System.out.println(heights.contains(1500));   // false
''')),
    method('first() and last(): the smallest and the biggest', 'E first();  E last()', 'the lowest / the highest element', 'O(log n)',
           'No scanning needed: the smallest is at the far left of the tree and the biggest at the far right.',
           'Both throw <code>NoSuchElementException</code> on an empty set. <code>pollFirst</code>/<code>pollLast</code> also remove and return <code>null</code> when empty.',
           P('TreeSetFindFirstLastDemo', 'smallest and biggest in a TreeSet', ['java.util.Set', 'java.util.TreeSet'], r'''
TreeSet<Integer> heights = new TreeSet<>(Set.of(1312, 1356, 1374, 1403));

System.out.println("Lowest fort  : " + heights.first());
System.out.println("Highest fort : " + heights.last());
''')),
    method('lower(e) and floor(e): the nearest value below', 'E lower(E e);  E floor(E e)', 'the greatest element below (lower) or at-or-below (floor), or <code>null</code>', 'O(log n)',
           '<code>lower</code> means "strictly smaller", <code>floor</code> means "smaller or equal". Handy for "what is the last slot before 10:30?".',
           'Both return <code>null</code> when nothing qualifies, so check before unboxing an <code>Integer</code> to <code>int</code> (a <code>NullPointerException</code> otherwise).',
           P('TreeSetFindFloorDemo', 'lower and floor', ['java.util.Set', 'java.util.TreeSet'], r'''
TreeSet<Integer> heights = new TreeSet<>(Set.of(1312, 1356, 1374, 1403));

System.out.println("lower(1374) : " + heights.lower(1374));   // 1356: strictly below
System.out.println("floor(1374) : " + heights.floor(1374));   // 1374: equal counts
System.out.println("floor(1000) : " + heights.floor(1000));   // null: nothing below
''')),
    method('higher(e) and ceiling(e): the nearest value above', 'E higher(E e);  E ceiling(E e)', 'the least element above (higher) or at-or-above (ceiling), or <code>null</code>', 'O(log n)',
           '<code>higher</code> means "strictly bigger", <code>ceiling</code> means "bigger or equal". Great for "the next free slot at or after 10:30".',
           'Together, <code>floor</code> and <code>ceiling</code> give the two neighbours of any value, which is the basis of "closest element" and "overlap check" algorithms.',
           P('TreeSetFindCeilingDemo', 'higher and ceiling', ['java.util.Set', 'java.util.TreeSet'], r'''
TreeSet<Integer> heights = new TreeSet<>(Set.of(1312, 1356, 1374, 1403));

System.out.println("higher(1374)  : " + heights.higher(1374));    // 1403: strictly above
System.out.println("ceiling(1374) : " + heights.ceiling(1374));   // 1374: equal counts
System.out.println("ceiling(1500) : " + heights.ceiling(1500));   // null: nothing above
''')),
    method('headSet and tailSet: everything below or above', 'SortedSet&lt;E&gt; headSet(E to);  SortedSet&lt;E&gt; tailSet(E from)', 'a live view of the elements below / from a value', 'O(1) to create',
           '<code>headSet(x)</code> is everything before x (x not included). <code>tailSet(x)</code> is x and everything after. Add <code>true</code>/<code>false</code> as a second argument to include or exclude the border.',
           'These are <strong>views</strong> over the same tree. Adding a value outside the range through the view throws <code>IllegalArgumentException</code>.',
           P('TreeSetFindHeadTailDemo', 'headSet and tailSet', ['java.util.Set', 'java.util.TreeSet'], r'''
TreeSet<Integer> heights = new TreeSet<>(Set.of(1312, 1356, 1374, 1403));

System.out.println("Below 1374        : " + heights.headSet(1374));          // 1374 excluded
System.out.println("Up to 1374        : " + heights.headSet(1374, true));    // included
System.out.println("From 1374 upwards : " + heights.tailSet(1374));          // 1374 included
''')),
    method('subSet: a range between two values', 'NavigableSet&lt;E&gt; subSet(E from, boolean fromInc, E to, boolean toInc)', 'a live view of the range', 'O(1) to create',
           'Everything between two values, for example all forts between 1300 and 1400 metres. The two booleans say whether the border values are included.',
           'The short form <code>subSet(from, to)</code> is "from included, to excluded". If <code>from</code> is greater than <code>to</code> you get <code>IllegalArgumentException</code>.',
           P('TreeSetFindSubSetDemo', 'subSet range search', ['java.util.Set', 'java.util.TreeSet'], r'''
TreeSet<Integer> heights = new TreeSet<>(Set.of(1033, 1312, 1356, 1374, 1403, 1424));

Set<Integer> middle = heights.subSet(1300, true, 1400, true);   // 1300 to 1400, both included

System.out.println(middle);
System.out.println("Count in range: " + middle.size());
''')),
    method('stream().filter(...).findFirst()', 'Optional&lt;E&gt; findFirst()', 'the smallest element that follows a rule', 'O(n), stops early',
           'For a rule that is not about the order (for example "an even number"), filter the stream. Because the TreeSet is sorted, <code>findFirst</code> gives the <em>smallest</em> match.',
           'If the rule is about the value itself (at least X), use <code>ceiling(X)</code> instead: it is O(log n), the stream is O(n).',
           P('TreeSetFindFilterDemo', 'smallest match with a stream', ['java.util.Set', 'java.util.TreeSet'], r'''
TreeSet<Integer> heights = new TreeSet<>(Set.of(1033, 1312, 1356, 1374, 1403));

Integer firstEven = heights.stream()
        .filter(h -> h % 2 == 0)   // rule: even height
        .findFirst()               // smallest, because the set is sorted
        .orElse(null);

System.out.println(firstEven);
''')),
    method('retainAll(Collection c): values both groups share', 'boolean retainAll(Collection&lt;?&gt; c)', '<code>true</code> if the set changed', 'O(n log n)',
           'Keep only the values that also appear in the other group. The result stays sorted.',
           'It changes the receiver, so work on a copy: <code>new TreeSet&lt;&gt;(original)</code>.',
           P('TreeSetFindRetainAllDemo', 'common values, still sorted', ['java.util.List', 'java.util.Set', 'java.util.TreeSet'], r'''
Set<String> groupA = new TreeSet<>(List.of("Pune", "Nashik", "Nagpur", "Indore"));
List<String> groupB = List.of("Surat", "Nagpur", "Pune");

Set<String> common = new TreeSet<>(groupA);   // copy first
common.retainAll(groupB);

System.out.println(common);   // sorted
''')),
    H('<h3>Which finding method to pick?</h3>\n' + table(['Question', 'Method', 'Time'], [
        ['Is this value in the set?', '<code>contains</code>', 'O(log n)'],
        ['Smallest or biggest?', '<code>first</code> / <code>last</code>', 'O(log n)'],
        ['Nearest below (strict / or equal)?', '<code>lower</code> / <code>floor</code>', 'O(log n)'],
        ['Nearest above (strict / or equal)?', '<code>higher</code> / <code>ceiling</code>', 'O(log n)'],
        ['Everything below / above a value?', '<code>headSet</code> / <code>tailSet</code>', 'O(1) view'],
        ['Everything between two values?', '<code>subSet</code>', 'O(1) view'],
        ['Smallest that follows a rule?', '<code>stream().filter().findFirst()</code>', 'O(n)'],
        ['What do two groups share?', '<code>retainAll</code> on a copy', 'O(n log n)'],
    ])),
]

TS_EXPERT = [
    H('<h3>Real-time examples</h3>\n<p>Three situations where a sorted set is the right answer.</p>'),
    H('<h3>Example 1: a leaderboard</h3>\n<p><strong>For freshers:</strong> teams score points, and the board must always show the best team first. A TreeSet with a "highest points first" comparator keeps the order for you.</p>\n'
      '<p><strong>For experienced developers:</strong> to change a score, <code>remove</code> the old object and <code>add</code> the new one; changing a field of an element already inside breaks the tree order.</p>',
      [P('LeaderboardExample', 'Leaderboard with TreeSet', ['java.util.Comparator', 'java.util.TreeSet'], r'''
record Team(String city, int points) { }

Comparator<Team> bestFirst = Comparator.comparing(Team::points, Comparator.reverseOrder())   // most points first
        .thenComparing(Team::city);                                                           // tie-breaker

TreeSet<Team> board = new TreeSet<>(bestFirst);
board.add(new Team("Pune", 40));
board.add(new Team("Nashik", 55));
board.add(new Team("Nagpur", 40));

// Pune wins a match: remove the old entry, add the new one
board.remove(new Team("Pune", 40));
board.add(new Team("Pune", 60));

int rank = 1;
for (Team team : board) {
    System.out.println(rank + ". " + team.city() + " " + team.points());
    rank++;
}
''')]),
    H('<h3>Example 2: discount slabs with floor()</h3>\n<p><strong>For freshers:</strong> "Orders from 0 get 0%, from 1000 get 5%, from 5000 get 10%." Find the highest slab that is not above the order amount. That is exactly <code>floor</code>.</p>\n'
      '<p><strong>For experienced developers:</strong> this is a small step function stored as a sorted set of boundaries. With a <code>TreeMap</code> you would use <code>floorEntry</code> to get the value too.</p>',
      [P('DiscountSlabExample', 'Discount slabs using floor()', ['java.util.TreeSet'], r'''
TreeSet<Integer> slabStarts = new TreeSet<>();
slabStarts.add(0);       // 0% from rupees 0
slabStarts.add(1000);    // 5% from rupees 1000
slabStarts.add(5000);    // 10% from rupees 5000

int[] orders = {250, 1000, 4999, 12000};
for (int amount : orders) {
    int slab = slabStarts.floor(amount);       // highest boundary not above the amount
    int percent = slab == 0 ? 0 : slab == 1000 ? 5 : 10;
    System.out.println("Order " + amount + " is in slab " + slab + " -> " + percent + "% discount");
}
''')]),
    H('<h3>Example 3: events inside a time window</h3>\n<p><strong>For freshers:</strong> an event hall stores start times (in hours). Show the events between 10 and 14 without looking at every event.</p>\n'
      '<p><strong>For experienced developers:</strong> <code>subSet</code> locates both ends in O(log n) and then iterates only the matching elements, so the cost depends on the answer size, not on the total.</p>',
      [P('EventWindowExample', 'Events between two times with subSet', ['java.util.Set', 'java.util.TreeSet'], r'''
TreeSet<Integer> startHours = new TreeSet<>(Set.of(8, 9, 11, 13, 14, 16, 18));

Set<Integer> window = startHours.subSet(10, true, 14, true);   // 10:00 to 14:00 inclusive

System.out.println("Events starting between 10 and 14: " + window);
System.out.println("Next event after 14:00 : " + startHours.higher(14));
System.out.println("Last event before 10:00: " + startHours.lower(10));
''')]),
    H('<h3>Sample project: Fort ranking board</h3>\n<p><strong>What we build:</strong> a console program that keeps forts ranked by height and answers questions about the ranking.</p>\n'
      + ul([
          'Step 1: a <code>Fort</code> record and a comparator "tallest first, then name".',
          'Step 2: add forts to a <code>TreeSet</code>; they sort themselves.',
          'Step 3: print the ranking, the top 3, and the rank of one fort (<code>headSet(fort).size() + 1</code>).',
          'Step 4: neighbours of a fort with <code>lower</code> and <code>higher</code>.',
          'Step 5: update a fort height by remove then add, and print the new ranking.',
      ]),
      [r'''// SAMPLE PROJECT: Fort ranking board (TreeSet with a Comparator)
import java.util.Comparator;
import java.util.TreeSet;

public class FortRankingBoard {
    // Step 1: the element and the ordering rule
    record Fort(String name, int height) { }

    static void printRanking(TreeSet<Fort> board) {
        int rank = 1;
        for (Fort fort : board) {
            System.out.println("  " + rank + ". " + fort.name() + " (" + fort.height() + " m)");
            rank++;
        }
    }

    public static void main(String[] args) {
        Comparator<Fort> tallestFirst = Comparator.comparing(Fort::height, Comparator.reverseOrder())
                .thenComparing(Fort::name);
        TreeSet<Fort> board = new TreeSet<>(tallestFirst);

        // Step 2: add in any order
        board.add(new Fort("Raigad", 1356));
        board.add(new Fort("Torna", 1403));
        board.add(new Fort("Sinhagad", 1312));
        board.add(new Fort("Purandar", 1374));
        board.add(new Fort("Lohagad", 1033));
        board.add(new Fort("Harishchandragad", 1424));

        // Step 3: ranking, top 3, rank of one fort
        System.out.println("Ranking:");
        printRanking(board);

        System.out.println("Top 3:");
        board.stream().limit(3).forEach(f -> System.out.println("  " + f.name()));

        Fort raigad = new Fort("Raigad", 1356);
        int rank = board.headSet(raigad).size() + 1;     // forts ranked before it, plus one
        System.out.println("Rank of Raigad: " + rank);

        // Step 4: neighbours (the set is ordered tallest first, so "lower" means taller)
        Fort taller = board.lower(raigad);
        Fort shorter = board.higher(raigad);
        System.out.println("Next taller than Raigad : " + taller.name());
        System.out.println("Next shorter than Raigad: " + shorter.name());

        // Step 5: a new measurement. Remove the old entry first, then add the updated one.
        board.remove(new Fort("Sinhagad", 1312));
        board.add(new Fort("Sinhagad", 1380));
        System.out.println("After re-measuring Sinhagad:");
        printRanking(board);
    }
}
''' + OUT]),
    practice('Highest three and lowest three forts',
             'From a set of fort heights, print the three tallest (tallest first) and the three lowest (lowest first).',
             ['Put the heights into a <code>TreeSet</code>.', 'Lowest three: stream the set and <code>limit(3)</code>.', 'Tallest three: do the same on <code>descendingSet()</code>.'],
             r'''// Practice: top and bottom three from a TreeSet
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

public class TopBottomThree {
    public static void main(String[] args) {
        TreeSet<Integer> heights = new TreeSet<>(Set.of(1033, 1312, 1356, 1374, 1403, 1424, 1080));

        List<Integer> lowest = heights.stream().limit(3).toList();                      // sorted ascending already
        List<Integer> tallest = heights.descendingSet().stream().limit(3).toList();     // reversed view first

        System.out.println("Lowest three  : " + lowest);
        System.out.println("Tallest three : " + tallest);
    }
}
''' + OUT, level='Easy',
             hints=['No sorting code is needed: the TreeSet is already sorted.']),
    practice('The fort closest to a target height',
             'For each target height find the fort height in the set that is closest to it. If two are equally close, choose the lower one.',
             ['Ask <code>floor(target)</code> and <code>ceiling(target)</code>.', 'Handle the case where one of them is <code>null</code>.', 'Otherwise pick the one with the smaller difference.'],
             r'''// Practice: closest value using floor and ceiling
import java.util.Set;
import java.util.TreeSet;

public class ClosestHeight {
    static int closest(TreeSet<Integer> heights, int target) {
        Integer below = heights.floor(target);       // largest value <= target
        Integer above = heights.ceiling(target);     // smallest value >= target
        if (below == null) {
            return above;
        }
        if (above == null) {
            return below;
        }
        return (target - below) <= (above - target) ? below : above;   // tie -> lower
    }

    public static void main(String[] args) {
        TreeSet<Integer> heights = new TreeSet<>(Set.of(1033, 1312, 1356, 1403));

        for (int target : new int[] {1000, 1340, 1334, 1380, 1500}) {
            System.out.println("Target " + target + " -> closest " + closest(heights, target));
        }
    }
}
''' + OUT, level='Medium',
             hints=['<code>floor</code> and <code>ceiling</code> return <code>null</code> at the ends: check before subtracting.']),
    practice('How many forts fall in each height band',
             'Count the forts in the bands "below 1100", "1100 to 1399" and "1400 and above", using range views of one TreeSet.',
             ['Create a sorted set of heights.', 'Use <code>headSet</code>, <code>subSet</code> and <code>tailSet</code> with the right inclusive flags.', 'Print the sizes and check that the three counts add up to the total.'],
             r'''// Practice: counting by range with headSet, subSet and tailSet
import java.util.Set;
import java.util.TreeSet;

public class HeightBands {
    public static void main(String[] args) {
        TreeSet<Integer> heights = new TreeSet<>(Set.of(1033, 1080, 1312, 1356, 1374, 1403, 1424, 1100));

        int low = heights.headSet(1100).size();                        // below 1100 (1100 excluded)
        int middle = heights.subSet(1100, true, 1400, false).size();   // 1100 included, 1400 excluded
        int high = heights.tailSet(1400).size();                       // 1400 and above

        System.out.println("Below 1100    : " + low);
        System.out.println("1100 to 1399  : " + middle);
        System.out.println("1400 and over : " + high);
        System.out.println("Total check   : " + (low + middle + high) + " of " + heights.size());
    }
}
''' + OUT, level='Medium',
             hints=['The boundary 1100 belongs to exactly one band: decide which and use inclusive flags to match.', '<code>size()</code> of a view walks the elements: fine for small sets, avoid in hot loops.']),
    practice('Nearby almost-duplicate numbers',
             'Given an array of numbers and two limits <code>k</code> and <code>t</code>, decide whether there are two different positions <code>i</code> and <code>j</code> with <code>|i - j| &lt;= k</code> and <code>|nums[i] - nums[j]| &lt;= t</code>. Solve it in O(n log k) with a TreeSet.',
             ['Keep a TreeSet of the last <code>k</code> numbers (the sliding window).', 'For each number ask <code>ceiling(num - t)</code>: if it exists and is at most <code>num + t</code>, the answer is true.', 'Add the number, and remove the one that leaves the window. Test three inputs.'],
             r'''// Practice: contains nearby almost duplicate (TreeSet sliding window)
import java.util.TreeSet;

public class NearbyAlmostDuplicate {
    static boolean exists(int[] nums, int k, int t) {
        TreeSet<Long> window = new TreeSet<>();          // long avoids overflow near the int limits
        for (int i = 0; i < nums.length; i++) {
            long value = nums[i];
            Long candidate = window.ceiling(value - t);  // smallest number >= value - t
            if (candidate != null && candidate <= value + t) {
                return true;                             // found one within t of value
            }
            window.add(value);
            if (i >= k) {
                window.remove((long) nums[i - k]);       // number left the window of size k
            }
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(exists(new int[] {1, 2, 3, 1}, 3, 0));
        System.out.println(exists(new int[] {1, 0, 1, 1}, 1, 2));
        System.out.println(exists(new int[] {1, 5, 9, 1, 5, 9}, 2, 3));
    }
}
''' + OUT, level='Hard',
             hints=['A window that holds the last k numbers gives distance in index for free.', 'The check is one O(log k) call per number instead of scanning the window.']),
]

# =====================================================================================================================
# INTERNAL HASHSET
# =====================================================================================================================
IH_BEGINNER = [
    H('<h3>Benefits of understanding how HashSet works inside</h3>\n<p><strong>For freshers:</strong> you do not need this to use a HashSet, but it explains the rules you are told to follow, so they stop feeling like magic.</p>\n'
      + ul([
          '<strong>You will know why <code>equals</code> and <code>hashCode</code> must go together</strong>, instead of just memorising it.',
          '<strong>You can explain the odd behaviour</strong> of order: the output order comes from buckets, not from adding order.',
          '<strong>You will avoid lost elements:</strong> changing an object after adding it moves its "address", and the set cannot find it any more.',
          '<strong>You can pick a good initial capacity</strong> and avoid needless resizing in big programs.',
          '<strong>Interviews:</strong> "How does HashSet work internally?" is one of the most asked Java questions, and the answer is the same as HashMap.',
      ])
      + '\n<p><strong>For experienced developers:</strong> it lets you diagnose real problems: slow lookups from a degenerate <code>hashCode</code>, memory growth from a once-large set, and heisenbugs from mutable keys. The same model carries over to <code>HashMap</code>, <code>HashTable</code> and <code>ConcurrentHashMap</code>.</p>'),
]

IH_EXPERT = [
    H('<h3>Real-time examples</h3>\n<p>Two classic production problems, shown on small data so you can see the cause.</p>'),
    H('<h3>Example 1: a bad hashCode makes every element collide</h3>\n<p><strong>For freshers:</strong> <code>hashCode</code> picks the bucket. If every object returns the same number, all of them go into one bucket, and the set has to compare a new element with each one already there. It still works, but slowly.</p>\n'
      '<p><strong>For experienced developers:</strong> with 6 keys in one bucket the comparisons are 0+1+2+3+4+5 = 15. For n keys it is about n squared / 2 until the bin treeifies (at 8 nodes and 64 buckets), after which Comparable keys search in O(log n). Non-Comparable keys stay slow.</p>',
      [r'''// A constant hashCode: every key lands in one bucket, so equals() runs again and again
import java.util.HashSet;
import java.util.Set;

public class BadHashCodeExample {
    static int badEqualsCalls = 0;
    static int goodEqualsCalls = 0;

    static class BadKey {
        final int id;
        BadKey(int id) { this.id = id; }
        @Override public int hashCode() { return 1; }                    // the same bucket for everyone
        @Override public boolean equals(Object o) {
            badEqualsCalls++;                                            // count the comparisons
            return o instanceof BadKey b && b.id == id;
        }
    }

    static class GoodKey {
        final int id;
        GoodKey(int id) { this.id = id; }
        @Override public int hashCode() { return Integer.hashCode(id); } // different buckets
        @Override public boolean equals(Object o) {
            goodEqualsCalls++;
            return o instanceof GoodKey g && g.id == id;
        }
    }

    public static void main(String[] args) {
        Set<BadKey> bad = new HashSet<>();
        Set<GoodKey> good = new HashSet<>();
        for (int i = 1; i <= 6; i++) {
            bad.add(new BadKey(i));
            good.add(new GoodKey(i));
        }
        System.out.println("Sizes             : " + bad.size() + " and " + good.size());
        System.out.println("equals() calls bad : " + badEqualsCalls);
        System.out.println("equals() calls good: " + goodEqualsCalls);
    }
}
''' + OUT]),
    H('<h3>Example 2: the lost trek group (mutable element)</h3>\n<p><strong>For freshers:</strong> a group object is added to a set. Later someone changes the group\'s city. The set stored the group in the bucket for the <em>old</em> city, so it cannot find it any more, though it is still inside.</p>\n'
      '<p><strong>For experienced developers:</strong> the safe pattern is to remove the element, change it, and add it again, or to use immutable elements. The element is not lost from memory, just unreachable by hash, so it is also a memory leak.</p>',
      [r'''// Changing an element that is inside a HashSet
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class LostGroupExample {
    static class Group {
        String city;                                              // not final: can change
        Group(String city) { this.city = city; }
        @Override public boolean equals(Object o) { return o instanceof Group g && g.city.equals(city); }
        @Override public int hashCode() { return Objects.hash(city); }
    }

    public static void main(String[] args) {
        Set<Group> groups = new HashSet<>();
        Group pune = new Group("Pune");
        groups.add(pune);

        pune.city = "Nashik";                                     // hash code changes, bucket does not
        System.out.println("Wrong way : contains = " + groups.contains(pune) + ", size = " + groups.size());

        pune.city = "Pune";                                       // change back so it can be found again
        groups.remove(pune);                                      // remove while the hash is correct
        pune.city = "Nashik";                                     // now it is safe to change
        groups.add(pune);                                         // add again under the new hash
        System.out.println("Right way : contains = " + groups.contains(pune) + ", size = " + groups.size());
    }
}
''' + OUT]),
    H('<h3>Sample project: a HashSet-like class with buckets</h3>\n<p><strong>What we build:</strong> a tiny set of Strings written by hand, so you can see buckets, collisions and resizing.</p>\n'
      + ul([
          'Step 1: an array of buckets; each bucket is a chain (linked list) of nodes.',
          'Step 2: a simple hash (sum of the characters) and <code>index = hash % buckets.length</code>.',
          'Step 3: <code>add</code> checks <code>contains</code> first, then inserts at the head of the chain.',
          'Step 4: when the set is more than 75% full, <code>resize</code> doubles the array and re-places every node.',
          'Step 5: <code>show</code> prints each bucket so you can see collisions.',
      ]),
      [r'''// SAMPLE PROJECT: MiniHashSet with buckets, collisions and resize
public class HandMadeHashSetDemo {
    static class MiniHashSet {
        static class Node {
            final String value;
            Node next;
            Node(String value, Node next) {
                this.value = value;
                this.next = next;
            }
        }

        private Node[] buckets = new Node[4];      // Step 1: start small to see a resize
        private int size;

        // Step 2: a very simple hash (the real one is String.hashCode plus bit spreading)
        private int indexFor(String value, int length) {
            int hash = 0;
            for (char c : value.toCharArray()) {
                hash += c;
            }
            return hash % length;
        }

        boolean contains(String value) {
            for (Node n = buckets[indexFor(value, buckets.length)]; n != null; n = n.next) {
                if (n.value.equals(value)) {
                    return true;
                }
            }
            return false;
        }

        // Step 3: add, ignoring duplicates
        boolean add(String value) {
            if (contains(value)) {
                return false;
            }
            if (size + 1 > buckets.length * 3 / 4) {   // Step 4: load factor 0.75
                resize();
            }
            int i = indexFor(value, buckets.length);
            buckets[i] = new Node(value, buckets[i]);   // insert at the head of the chain
            size++;
            return true;
        }

        private void resize() {
            Node[] bigger = new Node[buckets.length * 2];
            for (Node head : buckets) {
                for (Node n = head; n != null; n = n.next) {
                    int i = indexFor(n.value, bigger.length);   // new index for the new length
                    bigger[i] = new Node(n.value, bigger[i]);
                }
            }
            buckets = bigger;
            System.out.println("  -> resized to " + bigger.length + " buckets");
        }

        // Step 5: print the buckets
        void show() {
            for (int i = 0; i < buckets.length; i++) {
                StringBuilder chain = new StringBuilder();
                for (Node n = buckets[i]; n != null; n = n.next) {
                    chain.append(chain.length() == 0 ? "" : " -> ").append(n.value);
                }
                System.out.println("  bucket " + i + ": " + (chain.length() == 0 ? "(empty)" : chain));
            }
        }
    }

    public static void main(String[] args) {
        MiniHashSet set = new MiniHashSet();
        String[] cities = {"Pune", "Nashik", "Nagpur", "Pune", "Indore", "Surat", "Thane"};
        for (String city : cities) {
            System.out.println("add " + city + " -> " + set.add(city));
        }
        System.out.println("Final layout (" + set.size + " elements):");
        set.show();
        System.out.println("contains Nagpur: " + set.contains("Nagpur"));
        System.out.println("contains Delhi : " + set.contains("Delhi"));
    }
}
''' + OUT]),
    practice('Two different Strings with the same hash code',
             'The Strings "Aa" and "BB" have the same <code>hashCode()</code>. Add both to a HashSet and show that the set still keeps them apart.',
             ['Print the hash codes of both Strings.', 'Add both to a HashSet and print the size.', 'Check <code>contains</code> for each one, and explain in a comment which method separates them.'],
             r'''// Practice: equal hash codes do not mean equal objects
import java.util.HashSet;
import java.util.Set;

public class SameHashDifferentString {
    public static void main(String[] args) {
        String a = "Aa";
        String b = "BB";
        System.out.println("hashCode Aa : " + a.hashCode());
        System.out.println("hashCode BB : " + b.hashCode());
        System.out.println("equals      : " + a.equals(b));

        Set<String> set = new HashSet<>();
        set.add(a);
        set.add(b);          // same bucket, but equals() says "different", so both stay
        System.out.println("size        : " + set.size());
        System.out.println("contains Aa : " + set.contains("Aa"));
        System.out.println("contains BB : " + set.contains("BB"));
    }
}
''' + OUT, level='Easy',
             hints=['The hash code only picks the bucket; <code>equals</code> decides "same or different" inside it.']),
    practice('Which bucket does each city go to?',
             'For a HashSet with 16 buckets, compute the bucket index of each city the way HashMap does: <code>h = key.hashCode()</code>, <code>h ^ (h &gt;&gt;&gt; 16)</code>, then <code>index = (16 - 1) &amp; h</code>. Group the cities by bucket and report which buckets have a collision.',
             ['Write a method <code>bucketOf(String key, int tableLength)</code>.', 'Fill a <code>TreeMap&lt;Integer, List&lt;String&gt;&gt;</code> from bucket index to cities.', 'Print each bucket and mark buckets that hold more than one city.'],
             r'''// Practice: the bucket index calculation of HashMap / HashSet
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class BucketIndexCalculator {
    static int bucketOf(String key, int tableLength) {
        int h = key.hashCode();
        h = h ^ (h >>> 16);                 // spread the high bits down
        return (tableLength - 1) & h;       // table length is a power of two
    }

    public static void main(String[] args) {
        String[] cities = {"Pune", "Nashik", "Nagpur", "Indore", "Surat", "Thane", "Aurangabad", "Kolhapur"};
        int tableLength = 16;

        Map<Integer, List<String>> buckets = new TreeMap<>();
        for (String city : cities) {
            buckets.computeIfAbsent(bucketOf(city, tableLength), i -> new ArrayList<>()).add(city);
        }

        int collisions = 0;
        for (Map.Entry<Integer, List<String>> e : buckets.entrySet()) {
            boolean shared = e.getValue().size() > 1;
            if (shared) {
                collisions++;
            }
            System.out.println("bucket " + e.getKey() + ": " + e.getValue() + (shared ? "  <- collision" : ""));
        }
        System.out.println("Buckets used: " + buckets.size() + " of " + tableLength + ", collisions: " + collisions);
    }
}
''' + OUT, level='Medium',
             hints=['The table length must be a power of two for the bit mask to work like a modulo.', 'Try changing <code>tableLength</code> to 8 or 64 and watch the collisions change.']),
]

EXTRAS = {
    'hashset': {'beginner': HS_BEGINNER, 'intermediate': HS_INTERMEDIATE, 'expert': HS_EXPERT},
    'linkedhashset': {'beginner': LHS_BEGINNER, 'intermediate': LHS_INTERMEDIATE, 'expert': LHS_EXPERT},
    'treeset': {'beginner': TS_BEGINNER, 'intermediate': TS_INTERMEDIATE, 'expert': TS_EXPERT},
    'internal-hashset': {'beginner': IH_BEGINNER, 'expert': IH_EXPERT},
}
