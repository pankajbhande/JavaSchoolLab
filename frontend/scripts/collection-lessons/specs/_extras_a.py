"""Extra lessons for ArrayList, LinkedList, Vector and Stack: benefits, sorting and finding modules,
real-time examples, a sample project and more practice questions. Merged into each topic by build.py."""
import os
import sys
import textwrap

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, method, practice, section, table, ul  # noqa: E402


def J(cls, title, body, imports=('java.util.*',), outer=''):
    """Builds a complete Java program: title comment, imports, class with optional nested types and a main body."""
    imps = ''.join(f'import {i};\n' for i in imports)
    out = f'    {textwrap.indent(textwrap.dedent(outer).strip(chr(10)), "    ").strip()}\n\n' if outer.strip() else ''
    b = textwrap.indent(textwrap.dedent(body).strip('\n'), '        ')
    return f'// {title}\n{imps}\npublic class {cls} {{\n{out}    public static void main(String[] args) throws Exception {{\n{b}\n    }}\n}}\n' + OUT


def M(title, sig, ret, time, fresher, expert, code, watch=None):
    return method(title, sig, ret, time, fresher, expert, code, watch)


def P(title, intro, steps, code, level, hints=None):
    return practice(title, intro, steps, code, level, hints)


S = ('java.util.*', 'java.util.stream.*')
EXTRAS = {}

# ====================================================================== ARRAYLIST
AL_B = [
    section('Benefits and advantages',
            'Why do so many Java programs reach for <code>ArrayList</code> first? Because it is simple, fast for the most common jobs, and flexible.',
            [
                '<strong>It grows by itself.</strong> You never decide the size in advance, unlike a normal array.',
                '<strong>Reading by index is instant.</strong> <code>get(i)</code> jumps straight to the place, no matter how big the list is.',
                '<strong>Adding at the end is fast.</strong> Most <code>add(x)</code> calls cost almost nothing (amortized O(1)).',
                '<strong>Order is kept and duplicates are allowed.</strong> Good for things like a cart, a log or a list of stops.',
                '<strong>Rich toolbox.</strong> Works with <code>Collections</code> (sort, reverse, shuffle, binarySearch), with streams and with every <code>for</code> loop style.',
                '<strong>Memory friendly.</strong> The elements sit side by side in one array, so the CPU cache loves it. There is no extra node object per element.',
                '<strong>For experienced developers:</strong> because of the contiguous layout, iteration over an <code>ArrayList</code> is usually several times faster than over a <code>LinkedList</code> of the same size, even when the big-O looks similar.',
            ]),
    section('Disadvantages and when NOT to use it',
            'No collection is perfect. Knowing the weak spots saves you from slow or buggy code.',
            [
                '<strong>Inserting or removing in the front or middle is slow.</strong> Every element after that place must shift by one position (O(n)).',
                '<strong>Searching by value is a scan.</strong> <code>contains</code> and <code>indexOf</code> check element after element (O(n)). Use a <code>HashSet</code> if you only ask "is it there?".',
                '<strong>Not thread-safe.</strong> Two threads changing one list can corrupt it. Use <code>CopyOnWriteArrayList</code> or synchronize.',
                '<strong>Resizing costs time and memory.</strong> When the array is full, a bigger one (about 1.5 times) is allocated and everything is copied. Unused spare room is wasted memory.',
                '<strong>Boxing.</strong> A list of numbers stores <code>Integer</code> objects, not plain <code>int</code>, which uses more memory than <code>int[]</code>.',
                '<strong>For experienced developers:</strong> a big list that shrinks never gives its memory back until you call <code>trimToSize()</code>, and removing inside a for-each loop throws <code>ConcurrentModificationException</code>.',
            ]),
    ('<h3>Use ArrayList or something else?</h3>\n' + table(
        ['Use ArrayList when', 'Use something else when'],
        [
            ['You read by index a lot', 'You insert or remove at the front all the time: use <code>ArrayDeque</code> or <code>LinkedList</code>'],
            ['You mostly add at the end and then loop', 'You need "is this present?" checks fast: use <code>HashSet</code>'],
            ['The order of insertion matters', 'You need the data always sorted: use <code>TreeSet</code> or <code>TreeMap</code>'],
            ['Duplicates are fine', 'You must forbid duplicates: use <code>Set</code>'],
            ['One thread uses the list', 'Many threads change it: use <code>CopyOnWriteArrayList</code> or a concurrent queue'],
        ]), []),
]

AL_I = [
    section('Module: Sorting methods',
            'An <code>ArrayList</code> can be put in order in several ways. Some change the list itself (<strong>in place</strong>), others give you a new sorted view and leave the list alone.',
            [
                '<strong>In place:</strong> <code>list.sort(...)</code>, <code>Collections.sort(...)</code>, <code>Collections.reverse(...)</code>, <code>Collections.shuffle(...)</code>.',
                '<strong>New result:</strong> <code>list.stream().sorted(...)</code> returns a fresh list and the original stays unchanged.',
                'For your own classes, either implement <code>Comparable</code> or pass a <code>Comparator</code> (for example built with <code>Comparator.comparing</code>).',
                '<strong>For experienced developers:</strong> all of these use TimSort: stable (equal elements keep their order), O(n log n), and close to O(n) on data that is already nearly sorted.',
            ]),
    M('List.sort(Comparator)', 'void sort(Comparator&lt;? super E&gt; c)', 'nothing (the list itself is sorted)', 'O(n log n)',
      'Sorts the list in place. Pass a rule (a Comparator) that says which element goes first. Pass <code>null</code> to use the natural order, for example A to Z for text.',
      '<code>ArrayList.sort</code> sorts the internal array directly with <code>Arrays.sort</code> (TimSort), so there is no extra copy. It also bumps <code>modCount</code>, so sorting inside a for-each loop over the same list fails fast.',
      J('ALSortMethodDemo', 'ArrayList.sort(Comparator): in place sorting', r'''
        List<String> forts = new ArrayList<>(List.of("Sinhagad", "Raigad", "Torna", "Pratapgad"));
        forts.sort(null);                              // null means natural order (A to Z)
        System.out.println("A to Z   : " + forts);
        forts.sort(Comparator.comparing(String::length)); // shortest name first, equal lengths keep old order
        System.out.println("By length: " + forts);
        forts.sort(Comparator.reverseOrder());         // Z to A
        System.out.println("Z to A   : " + forts);
        '''),
      'Do not sort a list you are looping over with for-each; the loop will throw <code>ConcurrentModificationException</code>. Also <code>List.of(...)</code> lists are fixed and cannot be sorted: copy into an <code>ArrayList</code> first.'),
    M('Collections.sort(List)', 'static &lt;T extends Comparable&lt;? super T&gt;&gt; void sort(List&lt;T&gt; list)', 'nothing (list is sorted in place)', 'O(n log n)',
      'The classic helper. It puts a list of numbers or text in natural order (smallest first, A to Z). The element type must know how to compare itself (String, Integer and so on).',
      'It simply calls <code>list.sort(null)</code>. The version with a Comparator, <code>Collections.sort(list, cmp)</code>, is the same as <code>list.sort(cmp)</code>. Prefer <code>list.sort</code> in new code.',
      J('ALCollectionsSortDemo', 'Collections.sort on numbers and text', r'''
        List<Integer> heights = new ArrayList<>(List.of(1356, 1395, 1126, 1450));  // fort heights in metres
        Collections.sort(heights);                       // smallest first
        System.out.println("Heights ascending : " + heights);
        Collections.sort(heights, Collections.reverseOrder()); // largest first
        System.out.println("Heights descending: " + heights);
        List<String> cities = new ArrayList<>(List.of("Pune", "Nashik", "Satara", "Kolhapur"));
        Collections.sort(cities);                        // text uses alphabetical order
        System.out.println("Cities sorted     : " + cities);
        '''),
      'Sorting a list of your own objects with <code>Collections.sort(list)</code> fails to compile unless the class implements <code>Comparable</code>. Pass a Comparator instead.'),
    M('Comparator.comparing(...).thenComparing(...)', 'static &lt;T,U extends Comparable&lt;? super U&gt;&gt; Comparator&lt;T&gt; comparing(Function&lt;? super T,? extends U&gt; key)', 'a Comparator you give to sort', 'O(1) to build; sorting is O(n log n)',
      'Sorting objects needs a rule. <code>comparing</code> says "compare by this field". <code>thenComparing</code> adds a tie-breaker, and <code>reversed()</code> flips the order.',
      'The key extractor runs on every comparison, so keep it cheap. For primitive fields use <code>comparingInt</code>, <code>comparingDouble</code> or <code>comparingLong</code> to avoid boxing.',
      J('ALComparatorChainDemo', 'Sort objects by one field, then another', r'''
        List<Fort> forts = new ArrayList<>();
        forts.add(new Fort("Raigad", "Raigad", 1356));
        forts.add(new Fort("Torna", "Pune", 1403));
        forts.add(new Fort("Sinhagad", "Pune", 1312));
        forts.add(new Fort("Pratapgad", "Satara", 1076));
        // district A to Z, and inside one district the tallest fort first
        forts.sort(Comparator.comparing(Fort::district)
                .thenComparing(Fort::height, Comparator.reverseOrder()));
        for (Fort f : forts) System.out.println(f);
        ''', outer=r'''
        record Fort(String name, String district, int height) { }
        '''),
      'Writing <code>(a, b) -> a.height() - b.height()</code> can overflow for big numbers. Use <code>Integer.compare</code> or <code>comparingInt</code>.'),
    M('Collections.reverse(List)', 'static void reverse(List&lt;?&gt; list)', 'nothing (list is reversed in place)', 'O(n)',
      'Flips the list: the first element becomes the last and the last becomes the first. It does <em>not</em> sort; it only reverses the current order. To get "largest first", sort and then reverse (or sort with a reversed comparator).',
      'It swaps pairs from both ends, so it needs only O(1) extra memory. In Java 21, <code>list.reversed()</code> gives a reverse-ordered <em>view</em> without changing the list.',
      J('ALReverseDemo', 'Collections.reverse versus reversed()', r'''
        List<String> route = new ArrayList<>(List.of("Pune", "Satara", "Kolhapur", "Belgaum"));
        System.out.println("Outward route : " + route);
        List<String> view = route.reversed();            // Java 21: a view, the list is not changed
        System.out.println("reversed() view: " + view + " | list still " + route);
        Collections.reverse(route);                      // really changes the list
        System.out.println("Return route  : " + route);
        '''),
      None),
    M('Collections.shuffle(List, Random)', 'static void shuffle(List&lt;?&gt; list, Random rnd)', 'nothing (list is mixed in place)', 'O(n)',
      'Mixes the list into a random order, like shuffling cards. Useful for a random fort of the day or a quiz. Giving a <code>Random</code> with a fixed seed makes the shuffle repeatable, which is perfect for tests.',
      'It uses the Fisher-Yates algorithm and is uniformly random if the generator is. Without a Random argument it uses a shared internal generator, so the result differs on every run.',
      J('ALShuffleDemo', 'Shuffle with a fixed seed so the result repeats', r'''
        List<String> forts = new ArrayList<>(List.of("Raigad", "Sinhagad", "Torna", "Pratapgad", "Lohagad"));
        Collections.shuffle(forts, new Random(1));       // seed 1: same mix on every run
        System.out.println("Shuffled once : " + forts);
        Collections.shuffle(forts, new Random(1));       // shuffling the mixed list again with seed 1
        System.out.println("Shuffled again: " + forts);
        Collections.sort(forts);                         // back to a known order
        System.out.println("Sorted        : " + forts);
        '''),
      'A shuffled list is not "sorted by chance". Do not use <code>shuffle</code> to pick one random element; use <code>list.get(random.nextInt(list.size()))</code>, which is O(1).'),
    M('stream().sorted(...)', 'Stream&lt;E&gt; sorted(Comparator&lt;? super E&gt; c)', 'a new sorted stream (usually collected to a new list)', 'O(n log n)',
      'Gives you a sorted <em>copy</em> and leaves the original list untouched. Handy when you must keep the original order for something else, for example to show both "added order" and "A to Z".',
      'The stream buffers all elements, sorts them (stable for ordered streams) and then passes them on. <code>toList()</code> (Java 16+) returns an unmodifiable list; use <code>collect(Collectors.toList())</code> or <code>new ArrayList&lt;&gt;(...)</code> when you need to change it.',
      J('ALStreamSortedDemo', 'stream().sorted keeps the original list unchanged', r'''
        List<String> forts = List.of("Sinhagad", "Raigad", "Torna", "Lohagad");
        List<String> sorted = forts.stream().sorted().toList();           // new list, A to Z
        List<String> longestFirst = forts.stream()
                .sorted(Comparator.comparing(String::length).reversed())  // longest name first
                .toList();
        System.out.println("Original     : " + forts);
        System.out.println("Sorted       : " + sorted);
        System.out.println("Longest first: " + longestFirst);
        ''', imports=S),
      None),
    ('<h3>Which sorting method should I pick?</h3>\n' + table(
        ['I want to...', 'Use', 'Changes the list?'],
        [
            ['Sort my own list, with a rule', '<code>list.sort(comparator)</code>', 'Yes'],
            ['Sort numbers or text, natural order', '<code>Collections.sort(list)</code> or <code>list.sort(null)</code>', 'Yes'],
            ['Sort by several fields', '<code>Comparator.comparing(...).thenComparing(...)</code>', 'Only when passed to sort'],
            ['Turn the order around', '<code>Collections.reverse(list)</code> or <code>list.reversed()</code> (view)', 'reverse: yes, reversed(): no'],
            ['Mix randomly', '<code>Collections.shuffle(list, new Random(seed))</code>', 'Yes'],
            ['Keep the original and get a sorted copy', '<code>list.stream().sorted(...).toList()</code>', 'No'],
        ]), []),

    section('Module: Finding (searching) methods',
            'Finding something in an <code>ArrayList</code> means either checking <strong>whether</strong> it is there, finding <strong>where</strong> it is, or finding the <strong>best</strong> one (largest, smallest, most frequent). Most of these walk the list from the start, so they cost O(n).',
            [
                '<strong>Is it there?</strong> <code>contains</code>, <code>stream().anyMatch</code>.',
                '<strong>Where is it?</strong> <code>indexOf</code>, <code>lastIndexOf</code>, <code>Collections.binarySearch</code> (sorted lists only).',
                '<strong>Which is biggest or smallest?</strong> <code>Collections.max</code>, <code>Collections.min</code>.',
                '<strong>How many?</strong> <code>Collections.frequency</code>, <code>stream().filter(...).count()</code>.',
                '<strong>Find by a condition:</strong> <code>stream().filter(...).findFirst()</code>.',
                '<strong>For experienced developers:</strong> all of them use <code>equals()</code> for matching, so a class used in a list must have a correct <code>equals</code>. If you search the same big list again and again, build a <code>HashSet</code> or <code>HashMap</code> index once.',
            ]),
    M('contains(Object)', 'boolean contains(Object o)', 'true if the list has an equal element', 'O(n)',
      'Answers "is this value in the list?" with true or false. It compares with <code>equals</code>, so two different <code>String</code> objects with the same letters are treated as equal.',
      'Implemented as <code>indexOf(o) &gt;= 0</code>. If you call it inside a loop on a large list the total cost is O(n squared); convert to a <code>HashSet</code> first.',
      J('ALFindContainsDemo', 'contains: is it in the list?', r'''
        List<String> visited = new ArrayList<>(List.of("Raigad", "Torna", "Sinhagad"));
        System.out.println("Visited Torna?     " + visited.contains("Torna"));      // true
        System.out.println("Visited Lohagad?    " + visited.contains("Lohagad"));   // false
        System.out.println("Case matters? raigad " + visited.contains("raigad"));  // false, equals is case sensitive
        '''),
      None),
    M('indexOf(Object) and lastIndexOf(Object)', 'int indexOf(Object o) / int lastIndexOf(Object o)', 'the position, or -1 when not found', 'O(n)',
      '<code>indexOf</code> tells you <em>where</em> the first match is (counting from 0). <code>lastIndexOf</code> finds the last match. Always check for <code>-1</code> before using the result as an index.',
      '<code>indexOf</code> scans from the front, <code>lastIndexOf</code> from the back. Both handle <code>null</code> elements correctly (they use <code>==</code> for null).',
      J('ALFindIndexOfDemo', 'indexOf and lastIndexOf', r'''
        List<String> log = new ArrayList<>(List.of("Pune", "Satara", "Pune", "Nashik", "Pune"));
        System.out.println("First Pune at index: " + log.indexOf("Pune"));       // 0
        System.out.println("Last Pune at index : " + log.lastIndexOf("Pune"));   // 4
        int pos = log.indexOf("Mumbai");                                        // not in the list
        System.out.println("Mumbai result      : " + pos);                       // -1
        if (pos == -1) System.out.println("Mumbai was never visited");
        '''),
      'Using the result without checking: <code>log.get(log.indexOf("Mumbai"))</code> throws <code>IndexOutOfBoundsException</code> because the index is -1.'),
    M('Collections.binarySearch(List, key)', 'static &lt;T&gt; int binarySearch(List&lt;? extends Comparable&lt;? super T&gt;&gt; list, T key)', 'index if found, otherwise -(insertion point) - 1', 'O(log n) on an ArrayList',
      'A very fast search, but <strong>the list must already be sorted</strong> in the same order. It keeps cutting the search area in half. A negative result means "not found"; the value tells you where it could be inserted.',
      'ArrayList implements <code>RandomAccess</code>, so the middle element is reached in O(1) and the whole search is O(log n). On an unsorted list the result is undefined (no error, just a wrong answer). With duplicates it may return any of them.',
      J('ALBinarySearchDemo', 'binarySearch needs a sorted list', r'''
        List<Integer> heights = new ArrayList<>(List.of(1403, 1126, 1356, 1450, 1076));
        Collections.sort(heights);                                        // MUST sort first
        System.out.println("Sorted heights: " + heights);
        int found = Collections.binarySearch(heights, 1356);
        System.out.println("1356 found at index " + found);                 // 2
        int missing = Collections.binarySearch(heights, 1300);
        System.out.println("1300 result " + missing + " -> insert at index " + (-missing - 1)); // -(2)-1 = -3
        '''),
      'Calling it on an unsorted list silently gives wrong answers. Sort first, or use <code>indexOf</code>.'),
    M('Collections.max and Collections.min', 'static &lt;T&gt; T max(Collection&lt;? extends T&gt; c, Comparator&lt;? super T&gt; comp)', 'the largest (or smallest) element', 'O(n)',
      'Finds the biggest or smallest element without sorting. For your own classes pass a Comparator that says what "bigger" means (for example the taller fort).',
      'One pass over the list, no copy, no sorting, so it is better than sorting just to take the first or last. It throws <code>NoSuchElementException</code> on an empty collection.',
      J('ALMaxMinDemo', 'Collections.max and Collections.min', r'''
        List<Fort> forts = List.of(new Fort("Raigad", 1356), new Fort("Torna", 1403), new Fort("Pratapgad", 1076));
        Fort tallest = Collections.max(forts, Comparator.comparingInt(Fort::height)); // biggest height
        Fort shortest = Collections.min(forts, Comparator.comparingInt(Fort::height));
        System.out.println("Tallest : " + tallest);
        System.out.println("Shortest: " + shortest);
        List<String> names = List.of("Raigad", "Torna", "Pratapgad");
        System.out.println("Last in A to Z: " + Collections.max(names)); // natural order for text
        ''', outer=r'''
        record Fort(String name, int height) { }
        '''),
      'On an empty list both methods throw an exception. Check <code>isEmpty()</code> first.'),
    M('Collections.frequency(Collection, Object)', 'static int frequency(Collection&lt;?&gt; c, Object o)', 'how many elements are equal to o', 'O(n)',
      'Counts how many times a value appears. For example, how many visitors came from Pune.',
      'It is a simple loop with <code>equals</code>. If you need the count of <em>every</em> value, build a <code>Map</code> with <code>merge</code> or <code>Collectors.groupingBy</code> in one pass instead of calling frequency per value.',
      J('ALFrequencyDemo', 'Collections.frequency counts equal elements', r'''
        List<String> visitors = List.of("Pune", "Satara", "Pune", "Nashik", "Pune", "Satara");
        System.out.println("Pune    : " + Collections.frequency(visitors, "Pune"));     // 3
        System.out.println("Satara  : " + Collections.frequency(visitors, "Satara"));  // 2
        System.out.println("Mumbai  : " + Collections.frequency(visitors, "Mumbai"));  // 0
        '''),
      None),
    M('stream().filter(...).findFirst()', 'Optional&lt;E&gt; findFirst()', 'an Optional holding the first match, or an empty Optional', 'O(n), stops at the first match',
      'Finds the first element that fits a condition, for example the first fort taller than 1400 m. The answer is an <code>Optional</code>, a box that may be empty, which forces you to think about "not found".',
      'Streams are lazy: <code>filter</code> and <code>findFirst</code> stop as soon as one element matches, so you do not scan the whole list when the match is early. Use <code>orElse</code>, <code>orElseThrow</code> or <code>ifPresent</code> to open the Optional safely.',
      J('ALFindFirstDemo', 'filter + findFirst with Optional', r'''
        List<Fort> forts = List.of(new Fort("Sinhagad", 1312), new Fort("Raigad", 1356), new Fort("Torna", 1403), new Fort("Lohagad", 1033));
        Optional<Fort> tall = forts.stream()
                .filter(f -> f.height() > 1350)      // condition
                .findFirst();                         // first fort that passes
        System.out.println("First fort above 1350 m: " + tall.map(Fort::name).orElse("none"));
        Optional<Fort> huge = forts.stream().filter(f -> f.height() > 5000).findFirst();
        System.out.println("First fort above 5000 m: " + huge.map(Fort::name).orElse("none"));
        ''', imports=S, outer=r'''
        record Fort(String name, int height) { }
        '''),
      None),
    M('stream().anyMatch / allMatch / noneMatch and count()', 'boolean anyMatch(Predicate p) / long count()', 'a boolean, or a number', 'O(n), may stop early',
      '<code>anyMatch</code> asks "does at least one element fit?", <code>allMatch</code> "do all fit?", <code>noneMatch</code> "does none fit?". Put <code>filter(...).count()</code> together to count how many fit.',
      'The three match methods short-circuit: <code>anyMatch</code> stops at the first true, <code>allMatch</code> at the first false. On an empty list <code>allMatch</code> is true and <code>anyMatch</code> is false.',
      J('ALMatchCountDemo', 'anyMatch, allMatch, noneMatch and count', r'''
        List<Integer> heights = List.of(1312, 1356, 1403, 1033);
        System.out.println("Any above 1400?    " + heights.stream().anyMatch(h -> h > 1400));   // true
        System.out.println("All above 1000?    " + heights.stream().allMatch(h -> h > 1000));   // true
        System.out.println("None above 2000?   " + heights.stream().noneMatch(h -> h > 2000));  // true
        long count = heights.stream().filter(h -> h > 1300).count();                           // how many fit
        System.out.println("How many above 1300? " + count);
        ''', imports=S),
      None),
    ('<h3>Which finding method should I pick?</h3>\n' + table(
        ['I want to know...', 'Use', 'Needs sorted list?'],
        [
            ['Is this value present?', '<code>contains(x)</code>', 'No'],
            ['At which position?', '<code>indexOf(x)</code> / <code>lastIndexOf(x)</code>', 'No'],
            ['Position in a big sorted list, fast', '<code>Collections.binarySearch(list, x)</code>', 'Yes'],
            ['The biggest or smallest', '<code>Collections.max / min</code>', 'No'],
            ['How many times does x appear?', '<code>Collections.frequency(list, x)</code>', 'No'],
            ['First element passing a condition', '<code>stream().filter(...).findFirst()</code>', 'No'],
            ['Does any / all / none pass a condition?', '<code>anyMatch / allMatch / noneMatch</code>', 'No'],
            ['How many pass a condition?', '<code>stream().filter(...).count()</code>', 'No'],
        ]), []),
]

AL_E = [
    section('Real-time examples',
            'Here are three small, realistic uses of <code>ArrayList</code>. Each is a complete program: read the comments, run it, then change the data and watch what happens.'),
    ('<h3>Example 1: Shopping cart for trek gear</h3>\n<p><strong>For freshers:</strong> a cart is a list of items you add and remove, and the total is the sum of the prices. <strong>For experienced developers:</strong> a record keeps the items immutable, and <code>removeIf</code> removes in one pass (O(n)) instead of removing in a loop.</p>',
     [J('ALShoppingCartDemo', 'Real-time: shopping cart with ArrayList', r'''
        List<Item> cart = new ArrayList<>();
        cart.add(new Item("Trek shoes", 2, 1800));          // step 1: add items
        cart.add(new Item("Rain jacket", 1, 1200));
        cart.add(new Item("Water bottle", 3, 250));
        cart.add(new Item("Torch", 1, 400));
        System.out.println("Cart has " + cart.size() + " lines, total Rs " + total(cart));

        cart.removeIf(i -> i.name().equals("Torch"));        // step 2: customer removes an item
        cart.set(0, new Item("Trek shoes", 1, 1800));        // step 3: change quantity of the first line
        System.out.println("After changes, total Rs " + total(cart));

        cart.sort(Comparator.comparingInt(Item::lineTotal).reversed()); // step 4: show costliest line first
        for (Item i : cart) System.out.println(i.name() + " x" + i.qty() + " = Rs " + i.lineTotal());
        ''', outer=r'''
        record Item(String name, int qty, int price) {
            int lineTotal() { return qty * price; }
        }

        static int total(List<Item> cart) {
            int sum = 0;
            for (Item i : cart) sum += i.lineTotal();
            return sum;
        }
        ''')]),
    ('<h3>Example 2: City search suggestions (autocomplete)</h3>\n<p><strong>For freshers:</strong> as the user types "S", the app shows all cities that start with "S", sorted. <strong>For experienced developers:</strong> a stream with <code>filter</code>, <code>sorted</code> and <code>limit</code> is readable; for millions of names you would use a trie or a sorted list with <code>binarySearch</code>.</p>',
     [J('ALAutocompleteDemo', 'Real-time: search suggestions from an ArrayList', r'''
        List<String> cities = new ArrayList<>(List.of("Pune", "Satara", "Solapur", "Sangli", "Nashik", "Sindhudurg", "Kolhapur", "Shirdi"));
        System.out.println("Typed 'S'  : " + suggest(cities, "S", 3));
        System.out.println("Typed 'Sa' : " + suggest(cities, "Sa", 3));
        System.out.println("Typed 'K'  : " + suggest(cities, "K", 3));
        System.out.println("Typed 'Z'  : " + suggest(cities, "Z", 3));
        ''', imports=S, outer=r'''
        static List<String> suggest(List<String> cities, String typed, int max) {
            return cities.stream()
                    .filter(c -> c.startsWith(typed))      // keep names that match the typed text
                    .sorted()                               // A to Z
                    .limit(max)                             // show only a few
                    .toList();
        }
        ''')]),
    ('<h3>Example 3: Paging a long list of forts</h3>\n<p><strong>For freshers:</strong> a website never shows 500 rows at once; it shows page 1, page 2 and so on. <code>subList(from, to)</code> cuts out one page. <strong>For experienced developers:</strong> <code>subList</code> is a view, not a copy, so copy it with <code>new ArrayList&lt;&gt;(...)</code> if you keep it after the source list changes.</p>',
     [J('ALPagingDemo', 'Real-time: pagination with subList', r'''
        List<String> forts = new ArrayList<>();
        String[] names = {"Raigad", "Sinhagad", "Torna", "Pratapgad", "Lohagad", "Visapur", "Rajgad", "Purandar", "Shivneri", "Panhala"};
        forts.addAll(Arrays.asList(names));
        int pageSize = 4;
        int pages = (forts.size() + pageSize - 1) / pageSize;      // round up
        for (int page = 1; page <= pages; page++) {
            int from = (page - 1) * pageSize;
            int to = Math.min(from + pageSize, forts.size());      // last page may be shorter
            System.out.println("Page " + page + "/" + pages + ": " + forts.subList(from, to));
        }
        ''')]),

    ('<h3>Sample project: Fort Ticket Counter Report</h3>\n<p><strong>What we build:</strong> a console report for one day of ticket sales at a fort.</p>\n'
     + ul([
         'Step 1: store every sale as a <code>Sale</code> record inside an <code>ArrayList</code>.',
         'Step 2: print all sales sorted by amount (largest first) using a Comparator.',
         'Step 3: <strong>find</strong> the biggest sale, the first sale from Nashik, and how many sales came from Pune.',
         'Step 4: group the revenue by city with a stream and a <code>TreeMap</code> (so the order is stable).',
         'Step 5: remove refunded sales with <code>removeIf</code> and print the final total.',
     ]),
     [J('ALTicketReportProject', 'Sample project: fort ticket counter report (ArrayList)', r'''
        List<Sale> sales = new ArrayList<>();                         // Step 1: record the sales
        sales.add(new Sale("Amit", "Pune", 3, false));
        sales.add(new Sale("Neha", "Nashik", 5, false));
        sales.add(new Sale("Ravi", "Pune", 2, true));                 // refunded later
        sales.add(new Sale("Sita", "Satara", 4, false));
        sales.add(new Sale("Omkar", "Pune", 6, false));
        sales.add(new Sale("Kiran", "Nashik", 1, false));

        System.out.println("== All sales, largest first ==");           // Step 2: sort
        List<Sale> sorted = new ArrayList<>(sales);
        sorted.sort(Comparator.comparingInt(Sale::amount).reversed());
        for (Sale s : sorted) System.out.println(s.visitor() + " (" + s.city() + ") Rs " + s.amount());

        System.out.println("== Finding ==");                            // Step 3: find
        Sale biggest = Collections.max(sales, Comparator.comparingInt(Sale::amount));
        System.out.println("Biggest sale : " + biggest.visitor() + " Rs " + biggest.amount());
        String firstNashik = sales.stream().filter(s -> s.city().equals("Nashik"))
                .map(Sale::visitor).findFirst().orElse("nobody");
        System.out.println("First Nashik : " + firstNashik);
        long puneCount = sales.stream().filter(s -> s.city().equals("Pune")).count();
        System.out.println("Pune sales   : " + puneCount);

        System.out.println("== Revenue by city ==");                    // Step 4: group
        Map<String, Integer> byCity = new TreeMap<>();
        for (Sale s : sales) byCity.merge(s.city(), s.amount(), Integer::sum);
        byCity.forEach((city, sum) -> System.out.println(city + ": Rs " + sum));

        sales.removeIf(Sale::refunded);                                // Step 5: drop refunds
        int total = sales.stream().mapToInt(Sale::amount).sum();
        System.out.println("Final total after refunds: Rs " + total + " from " + sales.size() + " sales");
        ''', imports=S, outer=r'''
        // one ticket sale: tickets cost Rs 100 each
        record Sale(String visitor, String city, int tickets, boolean refunded) {
            int amount() { return tickets * 100; }
        }
        ''')]),
]

AL_E += [
    P('Second tallest fort and a height filter',
      'A guide keeps fort heights in an <code>ArrayList&lt;Integer&gt;</code>. Find the <strong>second tallest</strong> height without sorting the original list, and remove every fort lower than 1100 m.',
      ['Copy the list and sort the copy in descending order; the second element is the answer.',
       'Use <code>Collections.max</code> and <code>indexOf</code> to show where the tallest is in the original list.',
       'Remove all heights below 1100 with <code>removeIf</code> and print the list.'],
      J('SecondTallestFort', 'Practice solution: second tallest fort', r'''
        List<Integer> heights = new ArrayList<>(List.of(1356, 1403, 1076, 1312, 1450, 1033));
        List<Integer> copy = new ArrayList<>(heights);               // work on a copy
        copy.sort(Comparator.reverseOrder());                        // tallest first
        System.out.println("Second tallest: " + copy.get(1));
        int top = Collections.max(heights);
        System.out.println("Tallest " + top + " is at index " + heights.indexOf(top) + " of the original");
        heights.removeIf(h -> h < 1100);                             // drop low forts
        System.out.println("After filter  : " + heights);
        '''), 'Easy', ['A copy keeps the original order untouched.']),
    P('Rotate a trek schedule and remove duplicate stops',
      'A schedule list has repeated stops. Remove the duplicates but keep the <strong>first</strong> time each stop appears, then rotate the list so it starts from "Torna", keeping the circular order.',
      ['Walk the list; add a stop to a new list only if it is not there yet.',
       'Find the index of "Torna" and use <code>Collections.rotate</code> to move it to the front.',
       'Print the list before and after.'],
      J('RotateSchedule', 'Practice solution: remove duplicates and rotate', r'''
        List<String> stops = new ArrayList<>(List.of("Raigad", "Sinhagad", "Raigad", "Torna", "Lohagad", "Sinhagad", "Rajgad"));
        List<String> unique = new ArrayList<>();
        for (String s : stops) {
            if (!unique.contains(s)) unique.add(s);                   // keep only the first appearance
        }
        System.out.println("Unique   : " + unique);
        int pos = unique.indexOf("Torna");
        Collections.rotate(unique, -pos);                            // negative = move left, Torna comes first
        System.out.println("Rotated  : " + unique);
        System.out.println("Same with LinkedHashSet: " + new ArrayList<>(new LinkedHashSet<>(stops)));
        '''), 'Medium', ['<code>Collections.rotate(list, -k)</code> moves the first k elements to the end.']),
    P('Merge two guides sorted lists and find the median',
      'Two guides each hold a sorted list of group sizes. Merge them into one sorted list <strong>without using sort</strong>, using two index pointers, then find the median, and use <code>binarySearch</code> to look for a given size.',
      ['Use two indexes i and j; always take the smaller current element.',
       'Copy what remains of the longer list.',
       'If the size is odd the median is the middle element; if even, the average of the two middle elements.',
       'Search for 9 and for 10 with <code>Collections.binarySearch</code> and explain the result.'],
      J('MergeSortedGuides', 'Practice solution: merge two sorted lists, median, binarySearch', r'''
        List<Integer> a = List.of(2, 5, 9, 14);
        List<Integer> b = List.of(3, 4, 11, 20, 25);
        List<Integer> merged = new ArrayList<>(a.size() + b.size());   // exact capacity, no regrowth
        int i = 0, j = 0;
        while (i < a.size() && j < b.size()) {                         // two pointers
            if (a.get(i) <= b.get(j)) merged.add(a.get(i++));
            else merged.add(b.get(j++));
        }
        while (i < a.size()) merged.add(a.get(i++));                   // leftovers
        while (j < b.size()) merged.add(b.get(j++));
        System.out.println("Merged: " + merged);
        int n = merged.size();
        double median = (n % 2 == 1) ? merged.get(n / 2) : (merged.get(n / 2 - 1) + merged.get(n / 2)) / 2.0;
        System.out.println("Median: " + median);
        System.out.println("binarySearch 9  -> " + Collections.binarySearch(merged, 9));
        int r = Collections.binarySearch(merged, 10);
        System.out.println("binarySearch 10 -> " + r + " (not found, would be inserted at " + (-r - 1) + ")");
        '''), 'Hard', ['Merging two sorted lists is O(n + m), faster than concatenating and sorting.']),
]

EXTRAS['arraylist'] = {'beginner': AL_B, 'intermediate': AL_I, 'expert': AL_E}


# ====================================================================== LINKEDLIST
LL_B = [
    section('Benefits and advantages',
            'A <code>LinkedList</code> is a chain of small boxes (nodes). Each box holds a value and points to the next and the previous box. That design gives it some special strengths.',
            [
                '<strong>Fast at both ends.</strong> <code>addFirst</code>, <code>addLast</code>, <code>removeFirst</code> and <code>removeLast</code> are O(1). No shifting of other elements.',
                '<strong>Fast insert or delete in the middle once you are there.</strong> With an iterator the change is just re-linking two pointers.',
                '<strong>It is a List and a Deque in one.</strong> You can use it as a list, a queue (<code>offer</code>, <code>poll</code>), a stack (<code>push</code>, <code>pop</code>) or a double-ended queue.',
                '<strong>No resizing.</strong> It never copies a big array. It just creates one new node per element.',
                '<strong>Allows null and duplicates</strong> and keeps insertion order.',
                '<strong>For experienced developers:</strong> adding never triggers an O(n) array copy, so the worst-case time of one <code>add</code> is O(1), which matters in latency-sensitive code where an <code>ArrayList</code> resize would cause a small pause.',
            ]),
    section('Disadvantages and when NOT to use it',
            'The same chain design that helps at the ends hurts in other places. In practice <code>LinkedList</code> is needed much less often than beginners think.',
            [
                '<strong>No fast access by index.</strong> <code>get(i)</code> walks node by node from the nearer end (O(n)). A loop with <code>get(i)</code> over a big LinkedList is very slow (O(n squared)).',
                '<strong>More memory.</strong> Every element costs an extra node object with two pointers (about 24 to 32 extra bytes).',
                '<strong>Poor CPU cache use.</strong> The nodes are scattered in memory, so even a plain loop is slower than over an <code>ArrayList</code>.',
                '<strong>Searching is a scan</strong> (O(n)), just like in an ArrayList, and <code>binarySearch</code> gives no benefit.',
                '<strong>Not thread-safe.</strong> Use <code>ConcurrentLinkedDeque</code> or <code>LinkedBlockingDeque</code> for several threads.',
                '<strong>For experienced developers:</strong> for a plain stack or queue, <code>ArrayDeque</code> is almost always faster and uses less memory. Choose <code>LinkedList</code> mainly when you need both List and Deque behaviour, or <code>null</code> elements in a queue.',
            ]),
    ('<h3>Use LinkedList or something else?</h3>\n' + table(
        ['Use LinkedList when', 'Use something else when'],
        [
            ['You add and remove at both ends (queue, deque)', 'You only need a queue or stack: <code>ArrayDeque</code> is faster'],
            ['You insert many times while walking with an iterator', 'You read by index a lot: use <code>ArrayList</code>'],
            ['You need one object that is both a List and a Queue', 'Memory is tight: use <code>ArrayList</code>'],
            ['The list is small and the code stays simple', 'Elements need priority order: use <code>PriorityQueue</code>'],
            ['You must store null in a queue', 'Many threads share the queue: use <code>ConcurrentLinkedDeque</code>'],
        ]), []),
]

LL_I = [
    section('Module: Sorting methods',
            'A <code>LinkedList</code> can be sorted with the same tools as an <code>ArrayList</code>, but the work happens differently inside.',
            [
                '<strong>In place:</strong> <code>list.sort(...)</code>, <code>Collections.sort(...)</code>, <code>Collections.reverse(...)</code>, <code>Collections.shuffle(...)</code>.',
                '<strong>New result:</strong> <code>stream().sorted(...)</code>, or <code>descendingIterator()</code> / <code>reversed()</code> to read backwards.',
                '<strong>For experienced developers:</strong> a linked list cannot be sorted in place by index. The default <code>List.sort</code> copies the nodes into an array, sorts the array with TimSort, and writes the values back. So it is still O(n log n), plus O(n) extra memory. The classic alternative, merge sort on nodes, is not available in the public API.',
            ]),
    M('List.sort(Comparator)', 'void sort(Comparator&lt;? super E&gt; c)', 'nothing (the list is sorted in place)', 'O(n log n) plus an O(n) temporary array',
      'Sorts the list with the rule you give. Pass <code>null</code> for the natural order. It works just like on an ArrayList, so your code looks the same.',
      'The default method copies to an array with <code>toArray()</code>, sorts, and then replaces the values one by one through a <code>ListIterator</code> (using <code>set</code>). The nodes themselves are not moved.',
      J('LLSortMethodDemo', 'LinkedList.sort(Comparator)', r'''
        LinkedList<String> queue = new LinkedList<>(List.of("Torna", "Raigad", "Sinhagad", "Lohagad"));
        queue.sort(null);                                  // natural order: A to Z
        System.out.println("A to Z   : " + queue);
        queue.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder())); // short names first
        System.out.println("By length: " + queue);
        System.out.println("First is " + queue.getFirst() + ", last is " + queue.getLast());
        '''),
      None),
    M('Collections.sort(List)', 'static &lt;T extends Comparable&lt;? super T&gt;&gt; void sort(List&lt;T&gt; list)', 'nothing (list is sorted in place)', 'O(n log n)',
      'Sorts numbers or text in natural order. Because it works on any <code>List</code>, the same call works for ArrayList, LinkedList and Vector.',
      'It delegates to <code>list.sort(null)</code>. Since LinkedList has no fast index access, never write your own bubble sort with <code>get(i)</code> and <code>set(i, x)</code>: that would be O(n cubed) in the worst case.',
      J('LLCollectionsSortDemo', 'Collections.sort on a LinkedList', r'''
        LinkedList<Integer> times = new LinkedList<>(List.of(45, 20, 90, 10, 60));   // trek durations in minutes
        Collections.sort(times);                           // smallest first
        System.out.println("Ascending : " + times);
        Collections.sort(times, Collections.reverseOrder()); // largest first
        System.out.println("Descending: " + times);
        System.out.println("Shortest trek: " + times.getLast() + " minutes");
        '''),
      None),
    M('Comparator.comparing(...) with LinkedList', 'static Comparator&lt;T&gt; comparing(Function&lt;T,U&gt; key)', 'a Comparator', 'O(n log n) when used to sort',
      'To sort a list of objects (such as groups waiting at a gate), say which field to compare. Add <code>thenComparing</code> for ties.',
      'A good use for a LinkedList is a <em>waiting queue</em>. Sorting it once by priority and then taking from the front with <code>poll()</code> works, but if priority changes often a <code>PriorityQueue</code> is a better fit.',
      J('LLComparatorDemo', 'Sort a LinkedList of objects', r'''
        LinkedList<Group> waiting = new LinkedList<>();
        waiting.add(new Group("Pune Trekkers", 12));
        waiting.add(new Group("Nashik Club", 5));
        waiting.add(new Group("Satara Scouts", 12));
        waiting.add(new Group("Kolhapur Family", 3));
        // biggest group first; same size -> name A to Z
        waiting.sort(Comparator.comparingInt(Group::size).reversed().thenComparing(Group::name));
        waiting.forEach(g -> System.out.println(g.name() + " (" + g.size() + ")"));
        ''', outer=r'''
        record Group(String name, int size) { }
        '''),
      None),
    M('Collections.reverse(List) and descendingIterator()', 'Iterator&lt;E&gt; descendingIterator()', 'an iterator that walks from the last element to the first', 'O(n) to walk',
      '<code>Collections.reverse</code> flips the list itself. If you only want to <em>read</em> backwards without changing anything, use <code>descendingIterator()</code> (or <code>reversed()</code> in Java 21).',
      'A doubly linked list can walk backwards just as fast as forwards, which is why <code>descendingIterator</code> is cheap. The reversing is done with a ListIterator from both ends.',
      J('LLReverseDemo', 'reverse and descendingIterator', r'''
        LinkedList<String> route = new LinkedList<>(List.of("Pune", "Satara", "Kolhapur"));
        Iterator<String> back = route.descendingIterator();   // read backwards, list unchanged
        System.out.print("Reading backwards:");
        while (back.hasNext()) System.out.print(" " + back.next());
        System.out.println();
        System.out.println("List still       : " + route);
        Collections.reverse(route);                           // now the list itself changes
        System.out.println("After reverse    : " + route);
        '''),
      None),
    M('Collections.shuffle(List, Random)', 'static void shuffle(List&lt;?&gt; list, Random rnd)', 'nothing (list is mixed in place)', 'O(n)',
      'Mixes the elements randomly, for example to play a playlist in random order. Use a seeded <code>Random</code> when you need the same result every time (for tests).',
      'For a list that is not <code>RandomAccess</code>, shuffle first copies the elements to an array, shuffles the array and writes the values back, so it stays O(n) and never uses slow <code>get(i)</code> calls.',
      J('LLShuffleDemo', 'Shuffle a playlist', r'''
        LinkedList<String> playlist = new LinkedList<>(List.of("Song A", "Song B", "Song C", "Song D", "Song E"));
        Collections.shuffle(playlist, new Random(1));    // seed 1 makes the order repeatable
        System.out.println("Shuffled: " + playlist);
        System.out.println("Now playing: " + playlist.removeFirst());
        System.out.println("Up next    : " + playlist.peekFirst());
        '''),
      None),
    M('stream().sorted(...)', 'Stream&lt;E&gt; sorted(Comparator&lt;? super E&gt; c)', 'a sorted stream (collect it to a list)', 'O(n log n)',
      'Makes a sorted <em>copy</em> and keeps your LinkedList exactly as it was. Good for reports.',
      'The stream copies the elements into its own buffer, so the extra memory is O(n). The original nodes are not touched.',
      J('LLStreamSortedDemo', 'sorted copy with streams', r'''
        LinkedList<String> arrivals = new LinkedList<>(List.of("Satara", "Pune", "Nashik", "Kolhapur"));
        List<String> report = arrivals.stream().sorted().toList();   // sorted copy
        System.out.println("Arrival order: " + arrivals);
        System.out.println("A to Z report: " + report);
        '''.replace("List<String> report", "List<String> report"), imports=S),
      None),
    ('<h3>Which sorting method should I pick?</h3>\n' + table(
        ['I want to...', 'Use', 'Note for LinkedList'],
        [
            ['Sort in place with a rule', '<code>list.sort(comparator)</code>', 'Copies to an array internally, still O(n log n)'],
            ['Sort numbers or text', '<code>Collections.sort(list)</code>', 'Same as sort(null)'],
            ['Read backwards, no change', '<code>descendingIterator()</code> or <code>reversed()</code>', 'Cheap, the list is doubly linked'],
            ['Really flip the list', '<code>Collections.reverse(list)</code>', 'O(n)'],
            ['Random order', '<code>Collections.shuffle(list, new Random(seed))</code>', 'O(n)'],
            ['Keep the original, get a sorted copy', '<code>stream().sorted().toList()</code>', 'O(n) extra memory'],
            ['Always take the smallest next', '<code>PriorityQueue</code> instead of sorting', 'O(log n) per insert'],
        ]), []),

    section('Module: Finding (searching) methods',
            'Finding in a <code>LinkedList</code> always means walking the chain. The special thing is that it also has <strong>cheap peeking at both ends</strong>, which an ArrayList does not offer as a method family.',
            [
                '<strong>Look at the ends (O(1)):</strong> <code>getFirst</code>, <code>getLast</code>, <code>peek</code>, <code>peekFirst</code>, <code>peekLast</code>, <code>element</code>.',
                '<strong>Is it there / where is it:</strong> <code>contains</code>, <code>indexOf</code>, <code>lastIndexOf</code> (all O(n)).',
                '<strong>Best / count:</strong> <code>Collections.max</code>, <code>min</code>, <code>frequency</code>.',
                '<strong>By condition:</strong> <code>stream().filter(...).findFirst()</code>, <code>anyMatch</code>.',
                '<strong>For experienced developers:</strong> <code>Collections.binarySearch</code> works on a LinkedList but uses an iterator-based search with O(n) steps and only O(log n) comparisons, so it is rarely better than <code>indexOf</code>.',
            ]),
    M('peek, peekFirst, peekLast, element, getFirst, getLast', 'E peekFirst() / E peekLast() / E getFirst()', 'the end element (peek returns null when empty; get/element throw)', 'O(1)',
      'These "look but do not remove" methods tell you who is at the front or at the back. The <code>peek</code> family returns <code>null</code> on an empty list; <code>getFirst</code>, <code>getLast</code> and <code>element</code> throw <code>NoSuchElementException</code>.',
      'Because the list keeps direct references to its first and last node, all of them are O(1). That is why a LinkedList is a good queue.',
      J('LLPeekFindDemo', 'Look at the ends without removing', r'''
        LinkedList<String> gate = new LinkedList<>(List.of("Amit", "Neha", "Ravi"));
        System.out.println("Front of queue : " + gate.peekFirst());   // Amit
        System.out.println("Back of queue  : " + gate.peekLast());    // Ravi
        System.out.println("element()      : " + gate.element());     // same as the first
        System.out.println("List unchanged : " + gate);
        LinkedList<String> empty = new LinkedList<>();
        System.out.println("peek on empty  : " + empty.peek());       // null, no exception
        '''),
      'On an empty list <code>getFirst()</code> throws an exception while <code>peekFirst()</code> returns null. Pick the one that fits how you want to handle "empty".'),
    M('contains(Object)', 'boolean contains(Object o)', 'true if an equal element exists', 'O(n)',
      'Asks "is this value somewhere in the list?". It checks one node after the other with <code>equals</code>.',
      'Same as <code>indexOf(o) != -1</code>. Pointer chasing makes it slower in real time than the same call on an ArrayList of equal size.',
      J('LLContainsDemo', 'contains on a LinkedList', r'''
        LinkedList<String> booked = new LinkedList<>(List.of("Raigad", "Torna", "Sinhagad"));
        System.out.println("Torna booked?   " + booked.contains("Torna"));    // true
        System.out.println("Lohagad booked? " + booked.contains("Lohagad"));  // false
        if (!booked.contains("Lohagad")) booked.add("Lohagad");               // add only if missing
        System.out.println("After check: " + booked);
        '''),
      None),
    M('indexOf and lastIndexOf', 'int indexOf(Object o) / int lastIndexOf(Object o)', 'position or -1', 'O(n)',
      '<code>indexOf</code> returns the position of the first match, <code>lastIndexOf</code> of the last. If the value is missing you get <code>-1</code>.',
      '<code>indexOf</code> starts at the first node; <code>lastIndexOf</code> starts at the last node and walks backwards, so it is quick when the match is near the end.',
      J('LLIndexOfDemo', 'indexOf and lastIndexOf on a LinkedList', r'''
        LinkedList<String> stops = new LinkedList<>(List.of("Pune", "Satara", "Pune", "Nashik"));
        System.out.println("First Pune : " + stops.indexOf("Pune"));        // 0
        System.out.println("Last Pune  : " + stops.lastIndexOf("Pune"));    // 2
        System.out.println("Mumbai     : " + stops.indexOf("Mumbai"));      // -1
        '''),
      None),
    M('removeFirstOccurrence and removeLastOccurrence (find and remove)', 'boolean removeFirstOccurrence(Object o)', 'true if something was removed', 'O(n)',
      'These find a value <em>and</em> remove it in one step. The first version removes the first match, the second removes the last match. They are handy when the same value appears more than once.',
      'Both are Deque methods. <code>remove(Object)</code> is the same as <code>removeFirstOccurrence</code>.',
      J('LLOccurrenceDemo', 'find and remove the first or last match', r'''
        LinkedList<String> log = new LinkedList<>(List.of("Pune", "Satara", "Pune", "Nashik", "Pune"));
        boolean a = log.removeFirstOccurrence("Pune");   // removes index 0
        System.out.println("Removed first Pune? " + a + " -> " + log);
        boolean b = log.removeLastOccurrence("Pune");    // removes the last one
        System.out.println("Removed last Pune?  " + b + " -> " + log);
        System.out.println("Removed Mumbai?     " + log.removeFirstOccurrence("Mumbai"));
        '''),
      None),
    M('Collections.max, Collections.min and Collections.frequency', 'static &lt;T&gt; T max(Collection&lt;? extends T&gt; c)', 'the biggest / smallest element, or a count', 'O(n)',
      'Find the biggest or smallest value, or count how often a value appears, without sorting.',
      'They use the collection iterator, which is the efficient way to traverse a LinkedList (never index loops).',
      J('LLMaxMinFreqDemo', 'max, min and frequency', r'''
        LinkedList<Integer> waits = new LinkedList<>(List.of(15, 40, 5, 40, 25, 40));  // waiting minutes
        System.out.println("Longest wait : " + Collections.max(waits));
        System.out.println("Shortest wait: " + Collections.min(waits));
        System.out.println("40 minutes happened " + Collections.frequency(waits, 40) + " times");
        '''),
      None),
    M('Collections.binarySearch(List, key)', 'static &lt;T&gt; int binarySearch(List&lt;? extends Comparable&lt;? super T&gt;&gt; list, T key)', 'index or -(insertion point) - 1', 'O(n) steps, O(log n) comparisons on a LinkedList',
      'Works only on a <strong>sorted</strong> list. On a LinkedList it still returns the right answer, but it gains little, because it must walk the chain to reach the middle.',
      'For lists that do not implement <code>RandomAccess</code> (and have 5000 or more elements), the JDK switches to <code>iteratorBinarySearch</code>. Comparisons are O(log n), but moving the iterator is O(n).',
      J('LLBinarySearchDemo', 'binarySearch on a sorted LinkedList', r'''
        LinkedList<Integer> slots = new LinkedList<>(List.of(30, 10, 50, 20, 40));
        Collections.sort(slots);                            // sort first!
        System.out.println("Sorted slots: " + slots);
        System.out.println("Index of 40  : " + Collections.binarySearch(slots, 40));   // 3
        int r = Collections.binarySearch(slots, 35);
        System.out.println("35 -> " + r + ", insert at " + (-r - 1));                  // -4, insert at 3
        '''),
      'For a big LinkedList that you search often, copy it to an ArrayList (or use a TreeSet) instead.'),
    M('stream().filter(...).findFirst() and anyMatch', 'Optional&lt;E&gt; findFirst() / boolean anyMatch(Predicate p)', 'an Optional or a boolean', 'O(n), stops early',
      'Find the first group that fits a condition, or ask whether any group does. The Optional answer reminds you to handle "nothing found".',
      'Because the stream iterates the list once and stops at the first hit, no extra index access is needed.',
      J('LLStreamFindDemo', 'filter + findFirst on a LinkedList', r'''
        LinkedList<Integer> groupSizes = new LinkedList<>(List.of(4, 9, 15, 7, 22));
        Optional<Integer> firstBig = groupSizes.stream().filter(s -> s > 10).findFirst();
        System.out.println("First group above 10: " + firstBig.orElse(-1));       // 15
        System.out.println("Any group above 50?   " + groupSizes.stream().anyMatch(s -> s > 50));
        System.out.println("Groups of 5 or less   : " + groupSizes.stream().filter(s -> s <= 5).count());
        ''', imports=S),
      None),
    ('<h3>Which finding method should I pick?</h3>\n' + table(
        ['I want to know...', 'Use', 'Cost'],
        [
            ['Who is at the front / back?', '<code>peekFirst() / peekLast()</code>', 'O(1)'],
            ['Is the value there?', '<code>contains(x)</code>', 'O(n)'],
            ['Where is the value?', '<code>indexOf(x) / lastIndexOf(x)</code>', 'O(n)'],
            ['Find it and remove it', '<code>removeFirstOccurrence(x)</code>', 'O(n)'],
            ['Biggest, smallest, how many', '<code>Collections.max / min / frequency</code>', 'O(n)'],
            ['First element passing a condition', '<code>stream().filter(...).findFirst()</code>', 'O(n), early stop'],
            ['Sorted data, many searches', 'Use <code>ArrayList</code> + <code>binarySearch</code>, or a <code>TreeSet</code>', 'O(log n)'],
        ]), []),
]

LL_E = [
    section('Real-time examples',
            'A <code>LinkedList</code> shines when things happen at the front and at the back: playlists, waiting lines and history. Each program below is complete.'),
    ('<h3>Example 1: Music playlist (play next, add to end)</h3>\n<p><strong>For freshers:</strong> "Play next" puts a song at the front, "Add to queue" puts it at the back, and playing takes the first song. <strong>For experienced developers:</strong> all three operations are O(1) on a linked list.</p>',
     [J('LLPlaylistDemo', 'Real-time: music playlist with LinkedList', r'''
        LinkedList<String> queue = new LinkedList<>();
        queue.addLast("Mauli Mauli");                  // add to queue (back)
        queue.addLast("Deva Shree Ganesha");
        queue.addLast("Zingaat");
        queue.addFirst("Jai Jai Maharashtra");         // "play next" (front)
        System.out.println("Queue: " + queue);
        while (queue.size() > 2) {
            System.out.println("Now playing: " + queue.removeFirst());   // play the first song
        }
        queue.addFirst("Tula Japnar Aahe");            // user presses play next again
        System.out.println("Remaining queue: " + queue);
        System.out.println("Last song will be: " + queue.getLast());
        ''')]),
    ('<h3>Example 2: Support desk with VIP lane</h3>\n<p><strong>For freshers:</strong> normal customers join the back of the line, VIP customers jump to the front. <strong>For experienced developers:</strong> this is a deque with two insertion points. If there were many priority levels, a <code>PriorityQueue</code> would be the right tool.</p>',
     [J('LLSupportDeskDemo', 'Real-time: queue with a VIP lane', r'''
        LinkedList<String> line = new LinkedList<>();
        String[][] arrivals = {{"Amit", "normal"}, {"Neha", "VIP"}, {"Ravi", "normal"}, {"Sita", "VIP"}, {"Omkar", "normal"}};
        for (String[] a : arrivals) {
            if (a[1].equals("VIP")) line.addFirst(a[0]);   // VIP goes to the front
            else line.addLast(a[0]);                         // others go to the back
            System.out.println(a[0] + " (" + a[1] + ") joined -> " + line);
        }
        int served = 0;
        while (!line.isEmpty()) {
            served++;
            System.out.println("Counter serves #" + served + ": " + line.pollFirst());
        }
        '''.replace('\n        ', '\n        '))]),
    ('<h3>Example 3: Recent activity list that keeps only the last 3 items</h3>\n<p><strong>For freshers:</strong> a "recently viewed" box shows only the newest three forts. New one goes to the front; if there are more than 3, the oldest at the back is dropped. <strong>For experienced developers:</strong> a bounded history with <code>addFirst</code> and <code>removeLast</code> is O(1) per step.</p>',
     [J('LLRecentActivityDemo', 'Real-time: keep only the last 3 viewed forts', r'''
        LinkedList<String> recent = new LinkedList<>();
        String[] views = {"Raigad", "Torna", "Sinhagad", "Lohagad", "Torna", "Rajgad"};
        for (String fort : views) {
            recent.remove(fort);                           // if viewed before, take the old entry out
            recent.addFirst(fort);                          // newest goes in front
            if (recent.size() > 3) recent.removeLast();     // drop the oldest
            System.out.println("Viewed " + fort + " -> " + recent);
        }
        ''')]),

    ('<h3>Sample project: Fort Gate Queue Simulator</h3>\n<p><strong>What we build:</strong> a console simulation of a fort gate where groups wait in a line.</p>\n'
     + ul([
         'Step 1: create a <code>Group</code> record (name, people, vip).',
         'Step 2: groups arrive; normal groups join the back, VIP groups join the front.',
         'Step 3: the gate lets in at most 20 people per round; a group that is too big for the remaining space waits at the front of the next round.',
         'Step 4: a group waiting more than 2 rounds is moved out ("gave up") using an <code>Iterator</code>.',
         'Step 5: print what happened in each round and a final summary using <code>peekFirst</code>, <code>size</code> and a stream.',
     ]),
     [J('LLGateQueueProject', 'Sample project: fort gate queue simulator (LinkedList)', r'''
        LinkedList<Group> line = new LinkedList<>();                  // Step 2: arrivals
        List<Group> arrivals = List.of(new Group("Pune Trekkers", 12, false), new Group("Nashik Club", 9, false),
                new Group("School Trip", 15, false), new Group("Minister Visit", 6, true), new Group("Satara Scouts", 8, false));
        for (Group g : arrivals) {
            if (g.vip()) line.addFirst(g); else line.addLast(g);
        }
        System.out.println("Line at start: " + names(line));

        int capacity = 20;
        List<String> admitted = new ArrayList<>();
        List<String> gaveUp = new ArrayList<>();
        for (int round = 1; round <= 4 && !line.isEmpty(); round++) {  // Step 3: rounds
            int space = capacity;
            System.out.println("-- Round " + round + " (front: " + line.peekFirst().name() + ")");
            while (!line.isEmpty() && line.peekFirst().people() <= space) {
                Group g = line.pollFirst();
                space -= g.people();
                admitted.add(g.name());
                System.out.println("  admitted " + g.name() + " (" + g.people() + "), space left " + space);
            }
            Iterator<Group> it = line.iterator();                       // Step 4: waiting groups get tired
            while (it.hasNext()) {
                Group g = it.next();
                g.waited()[0]++;
                if (g.waited()[0] > 2) {
                    it.remove();
                    gaveUp.add(g.name());
                    System.out.println("  " + g.name() + " gave up after waiting");
                }
            }
        }
        System.out.println("== Summary ==");                              // Step 5: summary
        System.out.println("Admitted : " + admitted);
        System.out.println("Gave up  : " + gaveUp);
        System.out.println("Still waiting: " + names(line));
        ''', imports=S, outer=r'''
        // waited is a tiny counter held in an array so the record can change it
        record Group(String name, int people, boolean vip, int[] waited) {
            Group(String name, int people, boolean vip) { this(name, people, vip, new int[1]); }
        }

        static String names(List<Group> groups) {
            return groups.stream().map(Group::name).toList().toString();
        }
        ''')]),
]

LL_E += [
    P('Reverse a LinkedList by hand and rotate it',
      'Without using <code>Collections.reverse</code>, reverse a <code>LinkedList</code> of stops using only the deque methods. Then rotate it left by 2 positions (the first two stops go to the back).',
      ['Reverse: take elements with <code>removeFirst()</code> and put each at the front of a new list with <code>addFirst()</code>.',
       'Rotate: repeat 2 times: <code>addLast(removeFirst())</code>.',
       'Print the list at each step.'],
      J('ReverseRotateLinked', 'Practice solution: reverse and rotate a LinkedList', r'''
        LinkedList<String> stops = new LinkedList<>(List.of("Pune", "Satara", "Kolhapur", "Belgaum", "Goa"));
        LinkedList<String> reversed = new LinkedList<>();
        while (!stops.isEmpty()) {
            reversed.addFirst(stops.removeFirst());        // each taken element goes in front
        }
        System.out.println("Reversed: " + reversed);
        for (int i = 0; i < 2; i++) {
            reversed.addLast(reversed.removeFirst());      // move the first element to the back
        }
        System.out.println("Rotated left by 2: " + reversed);
        '''), 'Easy', ['Each move is O(1), so the whole reverse is O(n).']),
    P('Josephus game: who is left?',
      'Nine trekkers stand in a circle. Counting from the first, every <strong>3rd</strong> trekker is sent out, and counting continues from the next person. Print the order in which they leave and the last one standing.',
      ['Put numbers 1 to 9 in a <code>LinkedList</code>.',
       'Keep an index; move it by 2 each time and use <code>% size()</code> to go around the circle.',
       'Remove with <code>remove(index)</code> and print the name.'],
      J('JosephusGame', 'Practice solution: Josephus problem with LinkedList', r'''
        LinkedList<Integer> circle = new LinkedList<>();
        for (int i = 1; i <= 9; i++) circle.add(i);
        int step = 3;
        int index = 0;
        StringBuilder order = new StringBuilder();
        while (circle.size() > 1) {
            index = (index + step - 1) % circle.size();     // move 3 places around the circle
            order.append(circle.remove(index)).append(' '); // person leaves; index now points to the next
        }
        System.out.println("Leaving order: " + order.toString().trim());
        System.out.println("Last one left: " + circle.getFirst());
        '''), 'Medium', ['Because <code>remove(index)</code> shifts the next person into the same index, do not add 1 afterwards.']),
    P('Merge two sorted queues with ListIterator',
      'Two gates each have a sorted LinkedList of arrival times. Produce one merged sorted list by taking the smaller front each time (a merge), and also insert a late arrival (time 25) at the right place in the merged list using a <code>ListIterator</code>.',
      ['Compare <code>peekFirst()</code> of both lists, <code>poll()</code> the smaller one and add it to the result.',
       'When one list is empty, add all of the other with <code>addAll</code>.',
       'Walk the result with a ListIterator; before the first element bigger than 25, call <code>add(25)</code>.'],
      J('MergeSortedQueues', 'Practice solution: merge sorted queues, insert with ListIterator', r'''
        LinkedList<Integer> gateA = new LinkedList<>(List.of(5, 12, 30, 41));
        LinkedList<Integer> gateB = new LinkedList<>(List.of(8, 15, 33));
        LinkedList<Integer> merged = new LinkedList<>();
        while (!gateA.isEmpty() && !gateB.isEmpty()) {
            if (gateA.peekFirst() <= gateB.peekFirst()) merged.add(gateA.pollFirst());
            else merged.add(gateB.pollFirst());
        }
        merged.addAll(gateA);                               // one of them is empty, the other has leftovers
        merged.addAll(gateB);
        System.out.println("Merged : " + merged);
        ListIterator<Integer> it = merged.listIterator();
        while (it.hasNext()) {
            if (it.next() > 25) {                           // first element bigger than 25
                it.previous();                              // step back before it
                it.add(25);                                 // insert here, O(1)
                break;
            }
        }
        System.out.println("With 25: " + merged);
        '''), 'Medium', ['A ListIterator inserts in O(1) once it stands at the right place.']),
    P('Sliding window maximum with a Deque',
      'Heights of forts along a trail are given. For every window of 3 neighbouring forts, print the tallest one. Do it in O(n) with a <code>LinkedList</code> used as a Deque that stores <strong>indexes</strong>.',
      ['Keep indexes in the deque so that the heights are in decreasing order from front to back.',
       'Before adding index i, remove indexes from the back while their height is smaller than height i.',
       'Remove the front if it has left the window; the front is the maximum.'],
      J('SlidingWindowMax', 'Practice solution: sliding window maximum (Deque)', r'''
        int[] h = {1356, 1126, 1403, 1033, 1312, 1450, 1076};
        int k = 3;
        Deque<Integer> dq = new LinkedList<>();               // holds indexes, heights decreasing
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < h.length; i++) {
            while (!dq.isEmpty() && h[dq.peekLast()] <= h[i]) dq.pollLast();  // smaller ones can never be the maximum
            dq.addLast(i);
            if (dq.peekFirst() <= i - k) dq.pollFirst();                      // front left the window
            if (i >= k - 1) result.add(h[dq.peekFirst()]);                    // front is the window maximum
        }
        System.out.println("Heights : " + Arrays.toString(h));
        System.out.println("Max of each window of 3: " + result);
        '''), 'Hard', ['Every index enters and leaves the deque at most once, so the total time is O(n).']),
]

EXTRAS['linkedlist'] = {'beginner': LL_B, 'intermediate': LL_I, 'expert': LL_E}


# ====================================================================== VECTOR
VE_B = [
    section('Benefits and advantages',
            '<code>Vector</code> is the older cousin of <code>ArrayList</code>. It is still found in many old projects and exams, and it has a few real strengths.',
            [
                '<strong>Thread-safe methods.</strong> Every method such as <code>add</code>, <code>get</code> and <code>remove</code> is <code>synchronized</code>, so two threads cannot break the internal array.',
                '<strong>Grows automatically</strong> like an ArrayList, and you can even choose <em>how much</em> it grows with a <code>capacityIncrement</code>.',
                '<strong>Fast index access.</strong> It is an array inside, so <code>get(i)</code> is O(1).',
                '<strong>Works with old code.</strong> Old APIs return a Vector or an <code>Enumeration</code>, and a Vector is a full <code>List</code> today, so it works with every modern collection tool.',
                '<strong>Simple model for beginners:</strong> one object, safe even if you forget about threads for a small program.',
                '<strong>For experienced developers:</strong> its methods are individually atomic, which prevents a corrupted array. That is a weaker promise than it sounds; see the disadvantages.',
            ]),
    section('Disadvantages and when NOT to use it',
            'For new code, <code>Vector</code> is rarely the best choice. Here is why.',
            [
                '<strong>Slower.</strong> Every call takes a lock, even if only one thread is running. A plain <code>ArrayList</code> is faster in that case.',
                '<strong>Doubles in size by default.</strong> When full, a Vector grows to twice its capacity (unless you set an increment), which wastes more memory than ArrayList (1.5 times).',
                '<strong>Old and wordy API.</strong> Methods like <code>addElement</code>, <code>elementAt</code> and <code>removeAllElements</code> duplicate the modern List methods.',
                '<strong>Safe methods, unsafe sequences.</strong> "Check then act" (<code>if (!v.contains(x)) v.add(x)</code>) is two calls, and another thread can sneak in between. You still need your own <code>synchronized</code> block.',
                '<strong>Iterators are still fail-fast.</strong> Looping over a Vector while another thread changes it can throw <code>ConcurrentModificationException</code>.',
                '<strong>For experienced developers:</strong> for shared data use <code>CopyOnWriteArrayList</code> (read-heavy), <code>Collections.synchronizedList</code> (when you control the lock), or a concurrent queue. The class is not deprecated but is considered legacy.',
            ]),
    ('<h3>Use Vector or something else?</h3>\n' + table(
        ['Use Vector when', 'Use something else when'],
        [
            ['You maintain old code that already returns a Vector', 'You write new single-threaded code: use <code>ArrayList</code>'],
            ['An old API needs a Vector or an Enumeration', 'Many reads and few writes by many threads: use <code>CopyOnWriteArrayList</code>'],
            ['You need a simple thread-safe list and speed is not a worry', 'You need atomic multi-step actions: use <code>synchronized</code> blocks or a concurrent collection'],
            ['You want to control the growth step with capacityIncrement', 'You need a queue between threads: use <code>BlockingQueue</code>'],
        ]), []),
]

VE_I = [
    section('Module: Sorting methods',
            'A <code>Vector</code> is a <code>List</code>, so it can use all the normal sorting tools. The difference is that its own <code>sort</code> method is <strong>synchronized</strong>, so the lock is held for the whole sort.',
            [
                '<strong>In place:</strong> <code>v.sort(...)</code>, <code>Collections.sort(v)</code>, <code>Collections.reverse(v)</code>, <code>Collections.shuffle(v, rnd)</code>.',
                '<strong>New result:</strong> <code>v.stream().sorted()</code> gives a sorted copy.',
                '<strong>For experienced developers:</strong> <code>Vector.sort</code> sorts the internal array under the lock, so other threads wait until it finishes. A stream, in contrast, is not synchronized: if other threads write while you stream, you may see a <code>ConcurrentModificationException</code>. To stream safely, copy first under a lock: <code>synchronized (v) { copy = new ArrayList&lt;&gt;(v); }</code>.',
            ]),
    M('Vector.sort(Comparator)', 'synchronized void sort(Comparator&lt;? super E&gt; c)', 'nothing (the vector itself is sorted)', 'O(n log n)',
      'Sorts the vector in place with your rule. Pass <code>null</code> for natural order. While it sorts, other threads that use this Vector must wait.',
      'It is overridden in Vector as <code>synchronized</code> and sorts the elements array directly with <code>Arrays.sort</code>, then bumps <code>modCount</code>.',
      J('VESortMethodDemo', 'Vector.sort(Comparator)', r'''
        Vector<String> forts = new Vector<>(List.of("Sinhagad", "Raigad", "Torna", "Lohagad"));
        forts.sort(null);                                   // natural order: A to Z
        System.out.println("A to Z   : " + forts);
        forts.sort(Comparator.comparing(String::length));  // shortest name first
        System.out.println("By length: " + forts);
        '''),
      None),
    M('Collections.sort(List)', 'static &lt;T extends Comparable&lt;? super T&gt;&gt; void sort(List&lt;T&gt; list)', 'nothing (list is sorted in place)', 'O(n log n)',
      'Sorts numbers or text in natural order. It works on a Vector because a Vector is a List.',
      'It calls <code>v.sort(null)</code>, so you get the synchronized version for free.',
      J('VECollectionsSortDemo', 'Collections.sort on a Vector', r'''
        Vector<Integer> scores = new Vector<>(List.of(78, 91, 65, 88));
        Collections.sort(scores);                           // smallest first
        System.out.println("Ascending : " + scores);
        Collections.sort(scores, Collections.reverseOrder());  // largest first
        System.out.println("Descending: " + scores);
        '''),
      None),
    M('Comparator.comparing(...) with Vector', 'static Comparator&lt;T&gt; comparing(Function&lt;T,U&gt; key)', 'a Comparator', 'O(n log n) when sorting',
      'Sort objects by a field, then by another field if there is a tie.',
      'The Comparator itself has no state, so it can be shared by threads safely. The Vector protects the list, not your comparison logic: do not change an object while it is being compared.',
      J('VEComparatorDemo', 'Sort a Vector of objects', r'''
        Vector<Entry> board = new Vector<>();
        board.add(new Entry("Amit", 88));
        board.add(new Entry("Neha", 95));
        board.add(new Entry("Ravi", 88));
        board.add(new Entry("Sita", 72));
        board.sort(Comparator.comparingInt(Entry::score).reversed().thenComparing(Entry::name)); // high score first
        for (Entry e : board) System.out.println(e.name() + " " + e.score());
        ''', outer=r'''
        record Entry(String name, int score) { }
        '''),
      None),
    M('Collections.reverse and Collections.shuffle', 'static void reverse(List&lt;?&gt; list) / static void shuffle(List&lt;?&gt; list, Random rnd)', 'nothing (changed in place)', 'O(n)',
      '<code>reverse</code> turns the order around; <code>shuffle</code> mixes it randomly. A fixed seed makes the shuffle repeatable.',
      'Each element swap goes through the synchronized <code>get/set</code>, so the lock is taken and released many times. Hold it yourself with <code>synchronized (v) {...}</code> if you want the whole reorder to be one atomic step.',
      J('VEReverseShuffleDemo', 'reverse and shuffle a Vector', r'''
        Vector<String> turns = new Vector<>(List.of("Amit", "Neha", "Ravi", "Sita", "Omkar"));
        Collections.reverse(turns);                           // last becomes first
        System.out.println("Reversed: " + turns);
        Collections.shuffle(turns, new Random(1));            // seeded, so the result repeats
        System.out.println("Shuffled: " + turns);
        '''),
      None),
    M('stream().sorted(...)', 'Stream&lt;E&gt; sorted(Comparator&lt;? super E&gt; c)', 'a sorted stream', 'O(n log n)',
      'Makes a sorted copy and leaves the Vector unchanged.',
      'The stream is not locked. In a multithreaded program, copy the Vector inside a <code>synchronized</code> block first, then stream the copy.',
      J('VEStreamSortedDemo', 'Sorted copy of a Vector, safely', r'''
        Vector<String> cities = new Vector<>(List.of("Satara", "Pune", "Nashik", "Kolhapur"));
        List<String> snapshot;
        synchronized (cities) {                              // freeze the vector while copying
            snapshot = new ArrayList<>(cities);
        }
        System.out.println("Original: " + cities);
        System.out.println("Sorted  : " + snapshot.stream().sorted().toList());
        ''', imports=S),
      None),
    ('<h3>Which sorting method should I pick?</h3>\n' + table(
        ['I want to...', 'Use', 'Thread note'],
        [
            ['Sort in place with a rule', '<code>v.sort(comparator)</code>', 'Whole sort holds the lock'],
            ['Sort numbers or text', '<code>Collections.sort(v)</code>', 'Same as v.sort(null)'],
            ['Reverse or shuffle', '<code>Collections.reverse / shuffle</code>', 'Lock taken per element; wrap in synchronized for one atomic step'],
            ['Sorted copy, keep the original', '<code>stream().sorted()</code> on a snapshot', 'Copy under a lock first'],
        ]), []),

    section('Module: Finding (searching) methods',
            'Searching a <code>Vector</code> is a scan (O(n)), like an ArrayList, but each call is synchronized. A Vector also has its own older names for some jobs.',
            [
                '<strong>Is it there / where:</strong> <code>contains</code>, <code>indexOf(x)</code>, <code>indexOf(x, fromIndex)</code>, <code>lastIndexOf(x)</code>.',
                '<strong>The ends:</strong> <code>firstElement()</code> and <code>lastElement()</code> (old names; <code>getFirst()</code> and <code>getLast()</code> in Java 21).',
                '<strong>Sorted data:</strong> <code>Collections.binarySearch</code> (O(log n) because Vector is RandomAccess).',
                '<strong>Best / count:</strong> <code>Collections.max</code>, <code>min</code>, <code>frequency</code>.',
                '<strong>By condition:</strong> <code>stream().filter(...).findFirst()</code>, <code>anyMatch</code>.',
                '<strong>For experienced developers:</strong> a search followed by a change is not atomic. Wrap "find, then act" in <code>synchronized (v)</code>.',
            ]),
    M('contains(Object)', 'boolean contains(Object o)', 'true if an equal element exists', 'O(n)',
      'Tells you whether a value is in the Vector. It uses <code>equals</code>.',
      'Implemented as <code>indexOf(o, 0) &gt;= 0</code> and synchronized. The answer can be out of date a moment later if other threads are changing the Vector.',
      J('VEContainsDemo', 'contains on a Vector', r'''
        Vector<String> staff = new Vector<>(List.of("Amit", "Neha", "Ravi"));
        System.out.println("Is Neha on duty?  " + staff.contains("Neha"));    // true
        System.out.println("Is Sita on duty?  " + staff.contains("Sita"));    // false
        '''),
      None),
    M('indexOf(Object, int) and lastIndexOf(Object)', 'int indexOf(Object o, int index) / int lastIndexOf(Object o)', 'position or -1', 'O(n)',
      'Vector has an extra form of <code>indexOf</code> that starts searching from a given position. Use it in a loop to find <em>every</em> match, not just the first.',
      'The two-argument versions exist only on Vector (ArrayList has just the one-argument forms).',
      J('VEIndexOfDemo', 'Find every match with indexOf(x, from)', r'''
        Vector<String> log = new Vector<>(List.of("Pune", "Satara", "Pune", "Nashik", "Pune"));
        int pos = log.indexOf("Pune", 0);              // start from index 0
        while (pos != -1) {
            System.out.println("Pune found at index " + pos);
            pos = log.indexOf("Pune", pos + 1);        // continue after the last match
        }
        System.out.println("Last Pune at index " + log.lastIndexOf("Pune"));
        '''),
      None),
    M('firstElement() and lastElement()', 'E firstElement() / E lastElement()', 'the first or last element', 'O(1)',
      'Quickly read the first or last item. On an empty Vector they throw <code>NoSuchElementException</code>.',
      'These are the legacy names. Since Java 21 you can also use <code>getFirst()</code> and <code>getLast()</code> from <code>SequencedCollection</code>; the behaviour is the same.',
      J('VEFirstLastDemo', 'firstElement and lastElement', r'''
        Vector<String> readings = new Vector<>(List.of("08:00", "12:00", "16:00"));
        System.out.println("First reading: " + readings.firstElement());
        System.out.println("Last reading : " + readings.lastElement());
        System.out.println("Java 21 style: " + readings.getFirst() + " / " + readings.getLast());
        '''),
      'Check <code>isEmpty()</code> first when the Vector may be empty.'),
    M('Collections.binarySearch(List, key)', 'static &lt;T&gt; int binarySearch(List&lt;? extends Comparable&lt;? super T&gt;&gt; list, T key)', 'index or -(insertion point) - 1', 'O(log n)',
      'Very fast lookup in a <strong>sorted</strong> Vector. A negative result means "not found".',
      'Each probe calls the synchronized <code>get</code>, so under heavy sharing the lock is taken about log n times. The result is only meaningful if nobody changes the Vector between your sort and your search.',
      J('VEBinarySearchDemo', 'binarySearch on a sorted Vector', r'''
        Vector<Integer> ids = new Vector<>(List.of(40, 10, 30, 20, 50));
        Collections.sort(ids);                          // required: sort first
        System.out.println("Sorted ids: " + ids);
        System.out.println("Index of 30: " + Collections.binarySearch(ids, 30));    // 2
        int r = Collections.binarySearch(ids, 35);
        System.out.println("35 -> " + r + ", would go at index " + (-r - 1));       // -4 -> 3
        '''),
      None),
    M('Collections.max, min and frequency', 'static &lt;T&gt; T max(Collection&lt;? extends T&gt; c)', 'biggest, smallest or a count', 'O(n)',
      'Find the best value or count a value without sorting.',
      'They iterate with the Vector iterator, which is <em>not</em> synchronized as a whole. Hold <code>synchronized (v)</code> around the call when other threads write.',
      J('VEMaxMinFreqDemo', 'max, min and frequency on a Vector', r'''
        Vector<Integer> scores = new Vector<>(List.of(78, 91, 65, 91, 88));
        System.out.println("Highest : " + Collections.max(scores));
        System.out.println("Lowest  : " + Collections.min(scores));
        System.out.println("91 seen : " + Collections.frequency(scores, 91) + " times");
        '''),
      None),
    M('stream().filter(...).findFirst() and anyMatch', 'Optional&lt;E&gt; findFirst()', 'an Optional or a boolean', 'O(n)',
      'Find the first element that fits a condition, or ask if any element does.',
      'Streams do not take the Vector lock. For a stable result in threaded code, stream a snapshot copy.',
      J('VEStreamFindDemo', 'filter + findFirst on a Vector', r'''
        Vector<Integer> scores = new Vector<>(List.of(55, 62, 78, 91, 88));
        Optional<Integer> firstPass = scores.stream().filter(s -> s >= 60).findFirst();
        System.out.println("First score >= 60: " + firstPass.orElse(-1));     // 62
        System.out.println("Any score >= 90?   " + scores.stream().anyMatch(s -> s >= 90));
        System.out.println("Scores below 60    : " + scores.stream().filter(s -> s < 60).count());
        ''', imports=S),
      None),
    M('Enumeration search (legacy)', 'Enumeration&lt;E&gt; elements()', 'an Enumeration that walks the elements once', 'O(n)',
      'The old way to look through a Vector. <code>hasMoreElements()</code> asks if there is more, <code>nextElement()</code> gives the next one. Old code uses it, so you should be able to read it.',
      'Enumeration is not fail-fast and cannot remove. For new code use an <code>Iterator</code> or a for-each loop.',
      J('VEEnumerationFindDemo', 'Find an item with the old Enumeration', r'''
        Vector<String> forts = new Vector<>(List.of("Raigad", "Torna", "Sinhagad", "Lohagad"));
        Enumeration<String> e = forts.elements();
        int position = 0;
        while (e.hasMoreElements()) {                    // legacy loop
            String name = e.nextElement();
            if (name.startsWith("S")) {
                System.out.println("First name starting with S: " + name + " at " + position);
                break;
            }
            position++;
        }
        '''),
      None),
    ('<h3>Which finding method should I pick?</h3>\n' + table(
        ['I want to know...', 'Use', 'Cost'],
        [
            ['Is the value there?', '<code>contains(x)</code>', 'O(n)'],
            ['Where is it (all places)?', '<code>indexOf(x, from)</code> in a loop', 'O(n)'],
            ['First or last element', '<code>firstElement() / lastElement()</code>', 'O(1)'],
            ['Quick lookup in sorted data', '<code>Collections.binarySearch</code>', 'O(log n)'],
            ['Biggest, smallest, how many', '<code>Collections.max / min / frequency</code>', 'O(n)'],
            ['First element passing a test', '<code>stream().filter(...).findFirst()</code>', 'O(n)'],
            ['Old API gives an Enumeration', '<code>hasMoreElements / nextElement</code>', 'O(n)'],
        ]), []),
]

VE_E = [
    section('Real-time examples',
            'Where does a <code>Vector</code> really appear? In old libraries, in simple shared logs, and in code that grows in fixed steps. Three small programs follow.'),
    ('<h3>Example 1: Legacy API that hands you a Vector</h3>\n<p><strong>For freshers:</strong> some old code gives you a Vector and an Enumeration. You read it with the old methods, then copy it into a modern list. <strong>For experienced developers:</strong> <code>Collections.list(enumeration)</code> converts any Enumeration to an ArrayList in one call.</p>',
     [J('VELegacyApiDemo', 'Real-time: reading data from a legacy Vector', r'''
        Vector<String> legacy = LegacyRegister.loadForts();     // an old module returns a Vector
        System.out.println("Legacy size: " + legacy.size());
        Enumeration<String> e = legacy.elements();               // old way to read
        while (e.hasMoreElements()) System.out.println(" - " + e.nextElement());
        List<String> modern = new ArrayList<>(legacy);           // copy to a modern list
        Collections.sort(modern);
        System.out.println("Modern sorted: " + modern);
        System.out.println("Via Collections.list: " + Collections.list(legacy.elements()));
        ''', outer=r'''
        static class LegacyRegister {
            static Vector<String> loadForts() {
                Vector<String> v = new Vector<>();
                v.addElement("Torna");                            // old method names
                v.addElement("Raigad");
                v.addElement("Lohagad");
                return v;
            }
        }
        ''')]),
    ('<h3>Example 2: Shared notice board written by two threads</h3>\n<p><strong>For freshers:</strong> two helpers post notices to the same board at the same time. A Vector keeps the board safe; no notice is lost. <strong>For experienced developers:</strong> only the <em>count</em> is deterministic here; the order of the notices depends on thread timing, so we print the count and sorted content.</p>',
     [J('VENoticeBoardDemo', 'Real-time: two threads post to one Vector', r'''
        Vector<String> board = new Vector<>();
        Runnable postA = () -> { for (int i = 1; i <= 500; i++) board.add("A-" + i); };
        Runnable postB = () -> { for (int i = 1; i <= 500; i++) board.add("B-" + i); };
        Thread t1 = new Thread(postA);
        Thread t2 = new Thread(postB);
        t1.start();
        t2.start();
        t1.join();                                        // wait for both helpers
        t2.join();
        System.out.println("Notices on the board: " + board.size());  // always 1000 with a Vector
        System.out.println("Contains A-500? " + board.contains("A-500") + ", B-1? " + board.contains("B-1"));
        '''.replace('public static void main', 'public static void main'))]),
    ('<h3>Example 3: A buffer that grows in fixed steps</h3>\n<p><strong>For freshers:</strong> you can tell a Vector how much room to add each time it is full. <strong>For experienced developers:</strong> with <code>capacityIncrement</code> 0 the capacity doubles, with a positive value it grows by that amount; a fixed step gives predictable memory but more frequent copying.</p>',
     [J('VECapacityStepDemo', 'Real-time: capacity growth with capacityIncrement', r'''
        Vector<Integer> doubling = new Vector<>(2);            // grows by doubling
        Vector<Integer> stepped = new Vector<>(2, 3);          // grows by 3 each time
        for (int i = 1; i <= 8; i++) {
            doubling.add(i);
            stepped.add(i);
            System.out.println("After " + i + " items: doubling capacity " + doubling.capacity()
                    + ", stepped capacity " + stepped.capacity());
        }
        '''.replace('main', 'main'))]),

    ('<h3>Sample project: Legacy Fort Register Migration</h3>\n<p><strong>What we build:</strong> a console tool that reads an old Vector-based register, safely adds records from two threads, and migrates the data to a modern list with a report.</p>\n'
     + ul([
         'Step 1: a legacy class fills a <code>Vector&lt;String&gt;</code> with text lines such as <code>Raigad,Pune,120</code>.',
         'Step 2: two threads add more lines at the same time (the Vector keeps them safe).',
         'Step 3: read the lines with <code>Enumeration</code>, and parse each into a <code>FortRow</code>.',
         'Step 4: migrate to an <code>ArrayList</code>, sort by visitors (largest first) and find the best fort with <code>Collections.max</code>.',
         'Step 5: print the report with totals per city (a <code>TreeMap</code>) and a check that nothing was lost.',
     ]),
     [J('VELegacyMigrationProject', 'Sample project: legacy Vector register migration', r'''
        Vector<String> legacy = new Vector<>();                          // Step 1: old module data
        legacy.addElement("Raigad,Raigad,120");
        legacy.addElement("Torna,Pune,80");
        legacy.addElement("Sinhagad,Pune,200");

        Thread gateA = new Thread(() -> {                                // Step 2: two threads add records
            for (int i = 0; i < 3; i++) legacy.add("Lohagad,Pune,10");
        });
        Thread gateB = new Thread(() -> {
            for (int i = 0; i < 3; i++) legacy.add("Pratapgad,Satara,25");
        });
        gateA.start();
        gateB.start();
        try {
            gateA.join();
            gateB.join();
        } catch (InterruptedException ex) {
            throw new RuntimeException(ex);
        }
        System.out.println("Legacy records: " + legacy.size());

        List<FortRow> modern = new ArrayList<>();                         // Step 3: read with Enumeration
        Enumeration<String> en = legacy.elements();
        while (en.hasMoreElements()) {
            String[] p = en.nextElement().split(",");
            modern.add(new FortRow(p[0], p[1], Integer.parseInt(p[2])));
        }

        modern.sort(Comparator.comparingInt(FortRow::visitors).reversed()    // Step 4: sort and find
                .thenComparing(FortRow::fort));
        FortRow best = Collections.max(modern, Comparator.comparingInt(FortRow::visitors));
        System.out.println("Best fort: " + best.fort() + " with " + best.visitors());

        System.out.println("== Report ==");                                // Step 5: report
        for (FortRow r : modern) System.out.println(r.fort() + " (" + r.city() + ") " + r.visitors());
        Map<String, Integer> perCity = new TreeMap<>();
        int total = 0;
        for (FortRow r : modern) {
            perCity.merge(r.city(), r.visitors(), Integer::sum);
            total += r.visitors();
        }
        System.out.println("Per city: " + perCity);
        System.out.println("Total visitors " + total + ", migrated " + modern.size() + " of " + legacy.size() + " records");
        ''', outer=r'''
        record FortRow(String fort, String city, int visitors) { }
        ''')]),
]

VE_E += [
    P('Move old Enumeration code to modern List code',
      'An old method returns a <code>Vector</code> of city names. Print them with an <code>Enumeration</code>, then show the same result with a for-each loop, a stream that keeps only names with 5 or more letters, and count them.',
      ['Use <code>elements()</code> with <code>hasMoreElements</code> and <code>nextElement</code>.',
       'Rewrite it with a for-each loop.',
       'Use a stream to filter names whose length is at least 5, sort them and print them.'],
      J('EnumerationToModern', 'Practice solution: Enumeration to modern code', r'''
        Vector<String> cities = new Vector<>(List.of("Pune", "Satara", "Nashik", "Goa", "Kolhapur"));
        System.out.print("Enumeration:");
        Enumeration<String> e = cities.elements();
        while (e.hasMoreElements()) System.out.print(" " + e.nextElement());
        System.out.println();
        System.out.print("For-each   :");
        for (String c : cities) System.out.print(" " + c);
        System.out.println();
        List<String> longNames = cities.stream().filter(c -> c.length() >= 5).sorted().toList();
        System.out.println("Names with 5+ letters: " + longNames + " (" + longNames.size() + ")");
        ''', imports=S), 'Easy', None),
    P('Predict the capacity',
      'A Vector starts with capacity 3 and capacityIncrement 4. Add 12 elements and print the capacity every time it changes. Then do the same with the default doubling Vector starting at capacity 3 and compare the number of growth steps.',
      ['Create <code>new Vector&lt;&gt;(3, 4)</code> and <code>new Vector&lt;&gt;(3)</code>.',
       'After each <code>add</code>, if the capacity changed, print the size and the new capacity.',
       'Count how many times each Vector grew.'],
      J('PredictCapacity', 'Practice solution: capacity growth steps', r'''
        Vector<Integer> stepped = new Vector<>(3, 4);
        Vector<Integer> doubling = new Vector<>(3);
        int lastA = stepped.capacity(), lastB = doubling.capacity();
        int growA = 0, growB = 0;
        for (int i = 1; i <= 12; i++) {
            stepped.add(i);
            doubling.add(i);
            if (stepped.capacity() != lastA) {
                lastA = stepped.capacity();
                growA++;
                System.out.println("Stepped grew at size " + i + " to " + lastA);
            }
            if (doubling.capacity() != lastB) {
                lastB = doubling.capacity();
                growB++;
                System.out.println("Doubling grew at size " + i + " to " + lastB);
            }
        }
        System.out.println("Growth steps: stepped " + growA + ", doubling " + growB);
        '''), 'Medium', ['The default doubling Vector goes 3, 6, 12.']),
    P('Safe unique registration with two threads',
      'Two registration desks try to register the same 100 visitor IDs into one shared <code>Vector</code>. IDs must be unique. First show why "check then add" with only a Vector is not enough, then fix it with one <code>synchronized (vector)</code> block, and print the final size.',
      ['Both threads loop over IDs 1 to 100 and do: if the vector does not contain the ID, add it.',
       'Put the check and the add together inside <code>synchronized (registered)</code>.',
       'After both threads finish, the size must be exactly 100 and there must be no duplicates.'],
      J('SafeUniqueRegistration', 'Practice solution: check-then-add under one lock', r'''
        Vector<Integer> registered = new Vector<>();
        Runnable desk = () -> {
            for (int id = 1; id <= 100; id++) {
                synchronized (registered) {                   // check and add as ONE step
                    if (!registered.contains(id)) registered.add(id);
                }
            }
        };
        Thread a = new Thread(desk);
        Thread b = new Thread(desk);
        a.start();
        b.start();
        a.join();
        b.join();
        Set<Integer> distinct = new HashSet<>(registered);
        System.out.println("Size: " + registered.size() + ", distinct: " + distinct.size());
        System.out.println("No duplicates? " + (registered.size() == distinct.size()));
        '''.replace('Runnable desk', 'Runnable desk')), 'Medium', ['Vector locks on itself, so <code>synchronized (registered)</code> uses the same lock as its methods.']),
    P('Producer and consumer sharing a Vector',
      'A producer thread adds 5 ticket numbers (1 to 5) into a shared <code>Vector</code>, one every few milliseconds. A consumer thread removes them as they appear and sums them. Use <code>wait</code> and <code>notifyAll</code> on the Vector so the consumer sleeps when it is empty. Print the total.',
      ['Producer: in a synchronized block add the number and call <code>notifyAll()</code>.',
       'Consumer: in a synchronized block, while the vector is empty call <code>wait()</code>; then remove index 0 and add it to the sum.',
       'Join both threads and print the total (15).'],
      J('VectorProducerConsumer', 'Practice solution: producer-consumer with a Vector', r'''
        Vector<Integer> buffer = new Vector<>();
        int[] sum = new int[1];
        Thread producer = new Thread(() -> {
            for (int n = 1; n <= 5; n++) {
                synchronized (buffer) {
                    buffer.add(n);
                    buffer.notifyAll();                       // wake the consumer
                }
                try { Thread.sleep(5); } catch (InterruptedException ex) { return; }
            }
        });
        Thread consumer = new Thread(() -> {
            for (int taken = 0; taken < 5; taken++) {
                synchronized (buffer) {
                    while (buffer.isEmpty()) {
                        try { buffer.wait(); } catch (InterruptedException ex) { return; }   // sleep until something is added
                    }
                    sum[0] += buffer.remove(0);               // remove(int) takes the first element
                }
            }
        });
        consumer.start();
        producer.start();
        producer.join();
        consumer.join();
        System.out.println("Total of tickets consumed: " + sum[0]);
        System.out.println("Buffer left: " + buffer);
        '''), 'Hard', ['Always use <code>while</code>, not <code>if</code>, around <code>wait()</code>.']),
]

EXTRAS['vector'] = {'beginner': VE_B, 'intermediate': VE_I, 'expert': VE_E}


# ====================================================================== STACK
ST_B = [
    section('Benefits and advantages',
            'A <code>Stack</code> follows one simple rule: <strong>last in, first out</strong> (LIFO). Think of a pile of plates: you put a plate on top and you take the top plate first.',
            [
                '<strong>Very easy to learn.</strong> Only a few methods matter: <code>push</code>, <code>pop</code>, <code>peek</code>, <code>empty</code>, <code>search</code>.',
                '<strong>Perfect for "undo" thinking.</strong> The most recent thing is always the first to come back: undo, back button, nested brackets, function calls.',
                '<strong>Fast core operations.</strong> <code>push</code>, <code>pop</code> and <code>peek</code> work at the top and cost O(1) (amortized for push).',
                '<strong>It is also a Vector.</strong> So you can still use <code>get(i)</code>, <code>contains</code>, <code>size</code> and loops over it.',
                '<strong>Thread-safe methods</strong> (inherited from Vector, every call is synchronized).',
                '<strong>For experienced developers:</strong> stacks turn recursion into loops (depth-first search, expression evaluation, parsing) and avoid <code>StackOverflowError</code> on deep inputs because the explicit stack lives on the heap.',
            ]),
    section('Disadvantages and when NOT to use it',
            'The <code>Stack</code> class has a good idea but an old design. Java itself recommends something else for new code.',
            [
                '<strong>It is a legacy class.</strong> The Javadoc says to prefer <code>Deque</code> (for example <code>ArrayDeque</code>) for LIFO work.',
                '<strong>It exposes too much.</strong> Because it extends Vector, anyone can call <code>add(0, x)</code> or <code>remove(2)</code> and break the stack idea.',
                '<strong>Slower.</strong> Each call is synchronized even when you use one thread.',
                '<strong>Strange order.</strong> Printing a Stack shows bottom to top, and iteration also goes bottom to top, the opposite of the order <code>pop</code> returns. An <code>ArrayDeque</code> used as a stack iterates top to bottom.',
                '<strong>Pop on empty throws.</strong> <code>pop()</code> and <code>peek()</code> throw <code>EmptyStackException</code> when nothing is there; always check <code>empty()</code> first.',
                '<strong>For experienced developers:</strong> use <code>Deque&lt;E&gt; stack = new ArrayDeque&lt;&gt;()</code> with <code>push/pop/peek</code>. It is faster, has no locks, and its interface only allows stack-like operations when you type the variable as <code>Deque</code>. It does not allow null elements.',
            ]),
    ('<h3>Use Stack or something else?</h3>\n' + table(
        ['Use Stack when', 'Use something else when'],
        [
            ['You learn the idea of LIFO, or maintain old code', 'You write new code: use <code>ArrayDeque</code> as a stack'],
            ['You need the last item first (undo, back, brackets)', 'You need first-in first-out: use a <code>Queue</code>'],
            ['A small program where speed does not matter', 'Speed matters or you need millions of pushes: use <code>ArrayDeque</code>'],
            ['You want a thread-safe stack with minimal effort', 'Real concurrency: use <code>ConcurrentLinkedDeque</code> or <code>LinkedBlockingDeque</code>'],
        ]), []),
]

ST_I = [
    section('Module: Sorting methods',
            'A <code>Stack</code> is a <code>Vector</code>, so it is also a <code>List</code> and can be sorted like one. The important point is <strong>what the order means</strong>: index 0 is the <em>bottom</em> of the stack and the last index is the <em>top</em>.',
            [
                '<strong>Sorting changes the stack.</strong> After <code>Collections.sort(stack)</code> ascending, the <strong>largest</strong> value is on top, so the next <code>pop()</code> gives the largest.',
                '<strong>Reverse flips top and bottom.</strong> The old bottom becomes the new top.',
                '<strong>Real stack-style sorting</strong> uses only <code>push/pop/peek</code> and a second helper stack.',
                '<strong>For experienced developers:</strong> sorting a Stack with list methods is allowed, but it bypasses the LIFO discipline. If your design is strictly a stack, keep the sorted view in a separate list or use <code>stream().sorted()</code> on a copy.',
            ]),
    M('Collections.sort(List) on a Stack', 'static &lt;T extends Comparable&lt;? super T&gt;&gt; void sort(List&lt;T&gt; list)', 'nothing (the stack is reordered in place)', 'O(n log n)',
      'Sorts the stack from bottom to top in ascending order. So the <strong>biggest</strong> number ends up on top. Pop gives the biggest first.',
      'It calls <code>Vector.sort</code> (synchronized) and rewrites the internal array. To have the <em>smallest</em> on top, sort with <code>Collections.reverseOrder()</code>.',
      J('STCollectionsSortDemo', 'Collections.sort on a Stack', r'''
        Stack<Integer> stack = new Stack<>();
        for (int n : new int[]{40, 10, 30, 20}) stack.push(n);   // top is 20
        System.out.println("Before sort: " + stack + " top = " + stack.peek());
        Collections.sort(stack);                                  // ascending bottom -> top
        System.out.println("After sort : " + stack + " top = " + stack.peek());   // biggest on top
        Collections.sort(stack, Collections.reverseOrder());      // descending bottom -> top
        System.out.println("Reverse    : " + stack + " top = " + stack.peek());   // smallest on top
        '''),
      None),
    M('Vector.sort(Comparator) and Comparator.comparing', 'synchronized void sort(Comparator&lt;? super E&gt; c)', 'nothing (the stack is sorted in place)', 'O(n log n)',
      'Use it when the stack holds your own objects, for example tasks. The Comparator says which task should be nearer the top. Remember: the <strong>last</strong> element in the order is the top.',
      'The method is synchronized on the Stack. Equal elements keep their relative order (stable sort).',
      J('STSortMethodDemo', 'Sort a stack of objects with a Comparator', r'''
        Stack<Task> tasks = new Stack<>();
        tasks.push(new Task("Book tickets", 2));
        tasks.push(new Task("Pack bags", 3));
        tasks.push(new Task("Buy torch", 1));
        tasks.push(new Task("Check weather", 3));
        // lowest priority number at the bottom, so the highest number is on top (popped first)
        tasks.sort(Comparator.comparingInt(Task::priority).thenComparing(Task::name));
        System.out.println("Top task: " + tasks.peek());
        while (!tasks.empty()) System.out.println("Pop -> " + tasks.pop());
        ''', outer=r'''
        record Task(String name, int priority) { }
        '''),
      None),
    M('Collections.reverse(List) on a Stack', 'static void reverse(List&lt;?&gt; list)', 'nothing (the stack is reversed in place)', 'O(n)',
      'Turns the stack upside down: the old bottom becomes the new top. A classic way to reverse a stack when you only need the final result.',
      'The "pure" way is to pop everything into a second stack (and again into a third). The list method swaps elements by index and is much shorter, but it is not stack-like.',
      J('STReverseDemo', 'Reverse a stack', r'''
        Stack<String> pile = new Stack<>();
        pile.push("Raigad");
        pile.push("Torna");
        pile.push("Sinhagad");                               // top
        System.out.println("Before: " + pile + " top = " + pile.peek());
        Collections.reverse(pile);                           // bottom becomes top
        System.out.println("After : " + pile + " top = " + pile.peek());
        '''),
      None),
    M('Sorting with a helper stack (only push, pop, peek)', 'Stack&lt;Integer&gt; sortStack(Stack&lt;Integer&gt; in)', 'a new stack with the smallest on top... or biggest, as you choose', 'O(n squared)',
      'Sometimes a question says "sort a stack using only another stack". Take each item out of the input; move bigger items from the helper back to the input until the right place is found; then push the item.',
      'This is an insertion sort using two stacks, O(n squared) time and O(n) extra space. It is a good interview exercise about how stacks behave.',
      J('STHelperStackSortDemo', 'Sort using a second stack only', r'''
        Stack<Integer> input = new Stack<>();
        for (int n : new int[]{34, 3, 31, 98, 92, 23}) input.push(n);
        Stack<Integer> sorted = new Stack<>();                // top will be the biggest
        while (!input.empty()) {
            int current = input.pop();
            while (!sorted.empty() && sorted.peek() > current) {
                input.push(sorted.pop());                      // move bigger ones back
            }
            sorted.push(current);                              // now it fits
        }
        System.out.println("Sorted (bottom to top): " + sorted);
        System.out.println("Top (biggest): " + sorted.peek());
        '''),
      None),
    M('Collections.shuffle and stream().sorted()', 'Stream&lt;E&gt; sorted(Comparator&lt;? super E&gt; c)', 'a sorted stream (copy)', 'O(n log n)',
      '<code>Collections.shuffle(stack, new Random(1))</code> mixes the cards in a deck. <code>stack.stream().sorted()</code> gives a sorted <em>copy</em> and keeps the stack as it was. A stream reads from the bottom to the top.',
      'A stream over a Stack is not locked. Copy first in threaded code. The shuffle with a seeded Random gives the same order on every run.',
      J('STShuffleStreamDemo', 'shuffle and sorted copy', r'''
        Stack<String> deck = new Stack<>();
        for (String s : new String[]{"A", "B", "C", "D", "E"}) deck.push(s);
        List<String> copy = deck.stream().sorted(Comparator.reverseOrder()).toList();  // Z to A copy
        System.out.println("Stack unchanged: " + deck);
        System.out.println("Sorted copy    : " + copy);
        Collections.shuffle(deck, new Random(1));            // seeded: repeatable
        System.out.println("Shuffled stack : " + deck);
        ''', imports=S),
      None),
    ('<h3>Which sorting method should I pick?</h3>\n' + table(
        ['I want to...', 'Use', 'Effect on top of stack'],
        [
            ['Biggest on top', '<code>Collections.sort(stack)</code>', 'Top = biggest'],
            ['Smallest on top', '<code>Collections.sort(stack, Collections.reverseOrder())</code>', 'Top = smallest'],
            ['Sort objects by a rule', '<code>stack.sort(Comparator.comparing(...))</code>', 'Last in order = top'],
            ['Turn the stack upside down', '<code>Collections.reverse(stack)</code>', 'Old bottom = new top'],
            ['Sort with only stack operations', 'Helper-stack insertion sort', 'Top = biggest (as coded)'],
            ['Sorted copy, stack untouched', '<code>stack.stream().sorted().toList()</code>', 'No change'],
        ]), []),

    section('Module: Finding (searching) methods',
            'A <code>Stack</code> has one finder of its own, <code>search</code>, plus everything it inherits from <code>Vector</code> and <code>List</code>.',
            [
                '<strong>Look at the top:</strong> <code>peek()</code> (O(1), does not remove).',
                '<strong>How far from the top?</strong> <code>search(x)</code> counts from the top and starts at <strong>1</strong>; the result is -1 when missing.',
                '<strong>Position from the bottom:</strong> <code>indexOf(x)</code>, <code>lastIndexOf(x)</code> start at <strong>0</strong> at the bottom.',
                '<strong>Is it there:</strong> <code>contains(x)</code>. <strong>Best and count:</strong> <code>Collections.max/min/frequency</code>.',
                '<strong>By condition:</strong> <code>stream().filter(...).findFirst()</code>, <code>anyMatch</code>.',
                '<strong>For experienced developers:</strong> never "search" a stack by popping, unless you also push everything back. That is O(n) and easy to get wrong.',
            ]),
    M('peek()', 'E peek()', 'the top element without removing it', 'O(1)',
      'Look at the top item and leave it there. If the stack is empty you get an <code>EmptyStackException</code>, so check <code>empty()</code> first.',
      'peek is a synchronized read of <code>elementAt(size - 1)</code>. It never changes the stack.',
      J('STPeekFindDemo', 'peek looks at the top', r'''
        Stack<String> history = new Stack<>();
        history.push("home.html");
        history.push("forts.html");
        history.push("raigad.html");
        System.out.println("Current page: " + history.peek());     // top, not removed
        System.out.println("Stack size  : " + history.size());     // still 3
        Stack<String> empty = new Stack<>();
        System.out.println("Safe peek   : " + (empty.empty() ? "nothing to see" : empty.peek()));
        '''),
      '<code>peek()</code> on an empty Stack throws <code>EmptyStackException</code>, not null.'),
    M('search(Object)', 'int search(Object o)', 'distance from the top (top = 1), or -1 if absent', 'O(n)',
      'Tells you how many pops it takes to reach an item. The item on top has the answer <strong>1</strong>, the one below it <strong>2</strong>, and so on.',
      'It uses <code>lastIndexOf</code> and converts: <code>size() - lastIndexOf(o)</code>. If the value is present more than once, the one nearest the top is reported.',
      J('STSearchDemo', 'search counts from the top, starting at 1', r'''
        Stack<String> stack = new Stack<>();
        stack.push("Raigad");                                   // bottom
        stack.push("Torna");
        stack.push("Raigad");
        stack.push("Sinhagad");                                 // top
        System.out.println("search(Sinhagad) = " + stack.search("Sinhagad"));   // 1
        System.out.println("search(Raigad)   = " + stack.search("Raigad"));     // 2, the nearest to the top
        System.out.println("search(Lohagad)  = " + stack.search("Lohagad"));    // -1
        '''),
      'Do not mix this up with <code>indexOf</code>: search is 1-based from the top, indexOf is 0-based from the bottom.'),
    M('indexOf(Object) and lastIndexOf(Object)', 'int indexOf(Object o) / int lastIndexOf(Object o)', 'position from the bottom (0-based), or -1', 'O(n)',
      'Inherited from Vector. They tell you the place counted from the bottom of the stack.',
      'Together with <code>size()</code> you can compute the depth from the top yourself: <code>size() - 1 - index</code>.',
      J('STIndexOfDemo', 'indexOf counts from the bottom', r'''
        Stack<String> stack = new Stack<>();
        stack.push("Pune");
        stack.push("Satara");
        stack.push("Pune");
        stack.push("Nashik");
        System.out.println("indexOf(Pune)     = " + stack.indexOf("Pune"));        // 0, first from the bottom
        System.out.println("lastIndexOf(Pune) = " + stack.lastIndexOf("Pune"));    // 2
        System.out.println("search(Pune)      = " + stack.search("Pune"));         // 2 from the top
        '''),
      None),
    M('contains(Object)', 'boolean contains(Object o)', 'true if the stack holds an equal element', 'O(n)',
      'A yes/no question: is this item anywhere in the stack?',
      'Does not change the stack and does not depend on position. For repeated checks, keep a parallel <code>HashSet</code>.',
      J('STContainsDemo', 'contains on a Stack', r'''
        Stack<String> open = new Stack<>();
        open.push("(");
        open.push("[");
        System.out.println("Has '[' ? " + open.contains("["));   // true
        System.out.println("Has '{' ? " + open.contains("{"));   // false
        '''),
      None),
    M('Collections.max, min, frequency and binarySearch', 'static &lt;T&gt; T max(Collection&lt;? extends T&gt; c)', 'biggest, smallest, a count, or an index', 'O(n); binarySearch O(log n) on a sorted stack',
      'Find the biggest or smallest item, count equal items, or (if the stack is sorted bottom to top) look up a value quickly with <code>binarySearch</code>.',
      '<code>binarySearch</code> uses indexes, which are bottom to top. It only makes sense when you have sorted the stack in ascending order.',
      J('STMaxMinFreqDemo', 'max, min, frequency and binarySearch on a Stack', r'''
        Stack<Integer> stack = new Stack<>();
        for (int n : new int[]{40, 10, 40, 30}) stack.push(n);
        System.out.println("Max " + Collections.max(stack) + ", min " + Collections.min(stack));
        System.out.println("40 appears " + Collections.frequency(stack, 40) + " times");
        Collections.sort(stack);                              // now [10, 30, 40, 40], sorted bottom to top
        System.out.println("binarySearch(30) = " + Collections.binarySearch(stack, 30));
        '''),
      None),
    M('stream().filter(...).findFirst() and anyMatch', 'Optional&lt;E&gt; findFirst()', 'an Optional or a boolean', 'O(n)',
      'Find the first item that fits a rule. Remember that a stream starts from the <strong>bottom</strong> of the stack, so "first" means the oldest matching item. To find the one nearest the top, use <code>reversed()</code> (Java 21).',
      '<code>stack.reversed().stream()</code> reads from the top to the bottom, matching the order of <code>pop</code>.',
      J('STStreamFindDemo', 'filter + findFirst from the bottom and from the top', r'''
        Stack<Integer> prices = new Stack<>();
        for (int p : new int[]{120, 450, 80, 600, 300}) prices.push(p);   // 300 is on top
        Optional<Integer> oldest = prices.stream().filter(p -> p > 400).findFirst();        // from bottom
        Optional<Integer> newest = prices.reversed().stream().filter(p -> p > 400).findFirst(); // from top
        System.out.println("Oldest price above 400: " + oldest.orElse(-1));   // 450
        System.out.println("Newest price above 400: " + newest.orElse(-1));   // 600
        System.out.println("Any price above 1000?   " + prices.stream().anyMatch(p -> p > 1000));
        ''', imports=S),
      None),
    ('<h3>Which finding method should I pick?</h3>\n' + table(
        ['I want to know...', 'Use', 'Counting starts'],
        [
            ['What is on top?', '<code>peek()</code>', 'Top'],
            ['How many pops to reach x?', '<code>search(x)</code>', 'At 1 from the top'],
            ['Where is x from the bottom?', '<code>indexOf(x)</code> / <code>lastIndexOf(x)</code>', 'At 0 from the bottom'],
            ['Is x anywhere?', '<code>contains(x)</code>', '-'],
            ['Biggest, smallest, how many', '<code>Collections.max / min / frequency</code>', '-'],
            ['First match, from bottom', '<code>stream().filter(...).findFirst()</code>', 'Bottom'],
            ['First match, from top', '<code>reversed().stream()...findFirst()</code>', 'Top'],
        ]), []),
]

ST_E = [
    section('Real-time examples',
            'Stacks are hiding in everyday software: back buttons, undo, and path finding. Three small, complete programs follow.'),
    ('<h3>Example 1: Browser back and forward buttons</h3>\n<p><strong>For freshers:</strong> when you open a page it goes on the back stack; pressing Back moves the current page to the forward stack. <strong>For experienced developers:</strong> opening a new page clears the forward stack, exactly like real browsers do.</p>',
     [J('STBrowserHistoryDemo', 'Real-time: browser back and forward with two stacks', r'''
        Stack<String> back = new Stack<>();
        Stack<String> forward = new Stack<>();
        String current = "home";
        String[] visits = {"forts", "raigad", "torna"};
        for (String page : visits) {                      // open new pages
            back.push(current);
            current = page;
            forward.clear();                               // a new page erases the forward history
        }
        System.out.println("On: " + current + ", back stack: " + back);
        for (int i = 0; i < 2; i++) {                      // press Back twice
            forward.push(current);
            current = back.pop();
        }
        System.out.println("After 2 backs, on: " + current + ", forward stack: " + forward);
        current = forward.pop();                           // press Forward once
        System.out.println("After forward, on: " + current + ", back: " + back);
        ''')]),
    ('<h3>Example 2: Text editor undo</h3>\n<p><strong>For freshers:</strong> every edit is pushed on a stack; Undo pops the last edit and removes that word. <strong>For experienced developers:</strong> real editors store small "command" objects (with undo logic) instead of text, but the stack idea is the same.</p>',
     [J('STUndoEditorDemo', 'Real-time: undo with a Stack', r'''
        StringBuilder text = new StringBuilder();
        Stack<String> typed = new Stack<>();
        for (String word : new String[]{"Raigad", " is", " near", " Mahad"}) {
            text.append(word);
            typed.push(word);                                // remember each edit
            System.out.println("Typed  : " + text);
        }
        for (int i = 0; i < 2; i++) {
            String last = typed.pop();                       // undo the latest edit
            text.setLength(text.length() - last.length());
            System.out.println("Undo   : " + text);
        }
        System.out.println("Can still undo " + typed.size() + " steps, next undo removes '" + typed.peek() + "'");
        ''')]),
    ('<h3>Example 3: Depth-first route search between forts</h3>\n<p><strong>For freshers:</strong> go as deep as possible along one road, and when stuck, step back (pop) and try another road. <strong>For experienced developers:</strong> this is iterative DFS; the explicit stack replaces recursion and cannot overflow the call stack. The route is printed in a stable order because roads are stored in lists.</p>',
     [J('STRouteSearchDemo', 'Real-time: stack-based DFS route finder', r'''
        Map<String, List<String>> roads = new LinkedHashMap<>();
        roads.put("Pune", List.of("Sinhagad", "Torna"));
        roads.put("Sinhagad", List.of("Rajgad"));
        roads.put("Torna", List.of("Rajgad", "Raigad"));
        roads.put("Rajgad", List.of());
        roads.put("Raigad", List.of());
        Stack<List<String>> paths = new Stack<>();            // each entry is a whole path
        paths.push(List.of("Pune"));
        while (!paths.empty()) {
            List<String> path = paths.pop();
            String last = path.get(path.size() - 1);
            if (last.equals("Raigad")) {
                System.out.println("Route found: " + String.join(" -> ", path));
                break;
            }
            for (String next : roads.get(last)) {
                List<String> longer = new ArrayList<>(path);
                longer.add(next);
                paths.push(longer);                            // explore later (LIFO)
            }
        }
        ''')]),

    ('<h3>Sample project: Mini Browser Simulator</h3>\n<p><strong>What we build:</strong> a text-command browser with history, using two stacks and a list of bookmarks.</p>\n'
     + ul([
         'Step 1: a <code>Browser</code> class holds the current page, a <code>back</code> stack and a <code>forward</code> stack.',
         'Step 2: commands <code>OPEN</code>, <code>BACK</code>, <code>FORWARD</code> and <code>BOOKMARK</code> are processed from a list of text lines.',
         'Step 3: empty stacks are handled politely (no exception).',
         'Step 4: after every command the state is printed.',
         'Step 5: a final report uses <code>search</code> and <code>contains</code> to show how deep a page is in the history.',
     ]),
     [J('STBrowserProject', 'Sample project: mini browser with Stack history', r'''
        Browser browser = new Browser("home");                              // Step 1
        String[] commands = {                                               // Step 2: commands to run
            "OPEN forts", "OPEN raigad", "BOOKMARK", "BACK", "BACK", "BACK", "BACK",
            "FORWARD", "OPEN torna", "FORWARD", "BOOKMARK"
        };
        for (String line : commands) {
            String[] parts = line.split(" ");
            switch (parts[0]) {
                case "OPEN" -> browser.open(parts[1]);
                case "BACK" -> browser.back();
                case "FORWARD" -> browser.forward();
                case "BOOKMARK" -> browser.bookmark();
                default -> System.out.println("Unknown command " + line);
            }
            System.out.println(String.format("%-12s -> page %-7s back=%s forward=%s", line, browser.current, browser.back, browser.forward)); // Step 4
        }
        System.out.println("== Report ==");                                  // Step 5
        System.out.println("Bookmarks: " + browser.bookmarks);
        System.out.println("Back stack has home? " + browser.back.contains("home"));
        System.out.println("Pages back to reach home: " + browser.back.search("home"));
        ''', outer=r'''
        static class Browser {
            String current;
            final Stack<String> back = new Stack<>();
            final Stack<String> forward = new Stack<>();
            final List<String> bookmarks = new ArrayList<>();

            Browser(String start) { this.current = start; }

            void open(String page) {
                back.push(current);
                current = page;
                forward.clear();                         // new page: forward history is gone
            }

            void back() {
                if (back.empty()) { System.out.println("  (nothing to go back to)"); return; }   // Step 3
                forward.push(current);
                current = back.pop();
            }

            void forward() {
                if (forward.empty()) { System.out.println("  (nothing to go forward to)"); return; }
                back.push(current);
                current = forward.pop();
            }

            void bookmark() {
                if (!bookmarks.contains(current)) bookmarks.add(current);   // no duplicates
            }
        }
        ''')]),
]

ST_E += [
    P('Reverse words and check a palindrome',
      'Using a <code>Stack&lt;Character&gt;</code>, (1) reverse the text "Raigad Fort", and (2) check whether "MADAM" and "TORNA" are palindromes (the same forwards and backwards).',
      ['Push every character, then pop them all into a <code>StringBuilder</code> to get the reversed text.',
       'For the palindrome, compare each character of the word with the popped character.',
       'Print true or false for each word.'],
      J('ReverseAndPalindrome', 'Practice solution: reverse text and palindrome check', r'''
        System.out.println("Reversed: " + reverse("Raigad Fort"));
        for (String w : new String[]{"MADAM", "TORNA"}) {
            System.out.println(w + " palindrome? " + w.equals(reverse(w)));
        }
        ''', outer=r'''
        static String reverse(String text) {
            Stack<Character> stack = new Stack<>();
            for (char c : text.toCharArray()) stack.push(c);     // last character ends up on top
            StringBuilder sb = new StringBuilder();
            while (!stack.empty()) sb.append(stack.pop());       // pops in reverse order
            return sb.toString();
        }
        '''), 'Easy', None),
    P('Next taller fort (monotonic stack)',
      'For every fort in a row, print the height of the <strong>next taller fort to its right</strong>, or -1 if there is none. Solve it in one pass with a stack of indexes, not with two nested loops.',
      ['Walk left to right; while the height at the top index is less than the current height, pop it and set its answer to the current height.',
       'Push the current index.',
       'Whatever is left in the stack has no taller fort on its right: answer -1.'],
      J('NextTallerFort', 'Practice solution: next greater element', r'''
        int[] h = {1033, 1356, 1126, 1403, 1312, 1076, 1450};
        int[] answer = new int[h.length];
        Arrays.fill(answer, -1);                               // default: none
        Stack<Integer> waiting = new Stack<>();                // indexes still waiting for a taller fort
        for (int i = 0; i < h.length; i++) {
            while (!waiting.empty() && h[waiting.peek()] < h[i]) {
                answer[waiting.pop()] = h[i];                  // h[i] is the next taller for that fort
            }
            waiting.push(i);
        }
        System.out.println("Heights : " + Arrays.toString(h));
        System.out.println("Next big: " + Arrays.toString(answer));
        '''), 'Medium', ['Each index is pushed and popped once, so the time is O(n).']),
    P('Min stack: get the minimum in O(1)',
      'Build a small stack of prices that supports <code>push</code>, <code>pop</code> and <code>min()</code>, where <code>min()</code> is O(1). Use a second stack that remembers the minimum so far.',
      ['On push: push the value on the main stack; push on the min stack if it is empty or the value is smaller than or equal to its top.',
       'On pop: if the popped value equals the top of the min stack, pop the min stack as well.',
       'Run a few operations and print min after each.'],
      J('MinStackPractice', 'Practice solution: stack with O(1) minimum', r'''
        MinStack s = new MinStack();
        int[] pushes = {50, 30, 70, 30, 20};
        for (int p : pushes) {
            s.push(p);
            System.out.println("push " + p + " -> min " + s.min());
        }
        for (int i = 0; i < 3; i++) {
            System.out.println("pop " + s.pop() + " -> min " + s.min());
        }
        ''', outer=r'''
        static class MinStack {
            private final Stack<Integer> data = new Stack<>();
            private final Stack<Integer> mins = new Stack<>();

            void push(int v) {
                data.push(v);
                if (mins.empty() || v <= mins.peek()) mins.push(v);   // <= keeps duplicates of the minimum
            }

            int pop() {
                int v = data.pop();
                if (v == mins.peek()) mins.pop();                      // the minimum left the stack
                return v;
            }

            int min() { return mins.peek(); }
        }
        '''), 'Medium', ['Use <code>&lt;=</code> not <code>&lt;</code>, or a duplicated minimum would be lost after one pop.']),
    P('Decode a nested trek code',
      'A code like <code>2[ab3[c]]d</code> means: repeat "ab" followed by 3 times "c", two times, then add "d". The result is <code>abcccabcccd</code>. Decode such codes using two stacks (one for counts, one for the text built so far).',
      ['Read digits into a number; on <code>[</code> push the number and the current text, then start a fresh text.',
       'On a letter, append it to the current text.',
       'On <code>]</code> pop the count and the previous text; the current text becomes previous + current repeated count times.'],
      J('DecodeTrekCode', 'Practice solution: decode nested repeats with stacks', r'''
        for (String code : new String[]{"2[ab3[c]]d", "3[Fort]", "x2[y]z"}) {
            System.out.println(code + " -> " + decode(code));
        }
        ''', outer=r'''
        static String decode(String code) {
            Stack<Integer> counts = new Stack<>();
            Stack<StringBuilder> texts = new Stack<>();
            StringBuilder current = new StringBuilder();
            int number = 0;
            for (char c : code.toCharArray()) {
                if (Character.isDigit(c)) {
                    number = number * 10 + (c - '0');               // can be more than one digit
                } else if (c == '[') {
                    counts.push(number);                            // remember how many times
                    texts.push(current);                            // remember the text so far
                    current = new StringBuilder();
                    number = 0;
                } else if (c == ']') {
                    int times = counts.pop();
                    StringBuilder before = texts.pop();
                    before.append(current.toString().repeat(times)); // repeat the inner text
                    current = before;
                } else {
                    current.append(c);
                }
            }
            return current.toString();
        }
        '''), 'Hard', ['Think of each "[" as opening a new level and each "]" as returning to the level above.']),
]

EXTRAS['stack'] = {'beginner': ST_B, 'intermediate': ST_I, 'expert': ST_E}
