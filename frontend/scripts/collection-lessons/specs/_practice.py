"""Real-time practice programs, one or more per Collection topic id. Build inserts them into the expert tier, just before
"Best practices". Every program is a small, realistic scenario (fort treks, city trips) and is compiled and run by build.py.
Data uses only fort names and Indian city names."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _kit import OUT, practice  # noqa: E402

PRACTICE = {}

PRACTICE['arraylist'] = [
    practice(
        'Trek booking desk (add, search, update, cancel, sort, page)',
        'A trek company keeps today\'s bookings in an <code>ArrayList</code>. This is the everyday life of a list: bookings arrive, a customer changes the fort, somebody cancels, and the desk prints a sorted page of results.',
        ['<strong>add</strong> five bookings and <strong>add(index, e)</strong> a VIP at the top.',
         '<strong>indexOf / get</strong> to find a booking, <strong>set</strong> to move it to another fort.',
         '<strong>removeIf</strong> to cancel every booking for one fort.',
         '<strong>sort</strong> by fort, then print the list in <strong>pages</strong> with <strong>subList</strong>.'],
        r'''// Real-time practice: a trek booking desk built on ArrayList
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class TrekBookingDesk {
    record Booking(String customerCity, String fort, int people) { }

    static void print(String title, List<Booking> list) {
        System.out.println("--- " + title + " (" + list.size() + ") ---");
        for (int i = 0; i < list.size(); i++) {
            Booking b = list.get(i);
            System.out.println((i + 1) + ". " + b.fort() + " | " + b.customerCity() + " | " + b.people() + " people");
        }
    }

    public static void main(String[] args) {
        List<Booking> bookings = new ArrayList<>();

        // 1. New bookings arrive one by one
        bookings.add(new Booking("Pune", "Raigad", 4));
        bookings.add(new Booking("Mumbai", "Torna", 2));
        bookings.add(new Booking("Nashik", "Lohagad", 6));
        bookings.add(new Booking("Nagpur", "Raigad", 3));
        bookings.add(new Booking("Kolhapur", "Panhala", 5));
        bookings.add(0, new Booking("Delhi", "Sinhagad", 8));            // a VIP group goes to the top
        print("After booking", bookings);

        // 2. Find a booking and change its fort
        int position = -1;
        for (int i = 0; i < bookings.size(); i++) {
            if (bookings.get(i).customerCity().equals("Mumbai")) {
                position = i;
            }
        }
        Booking old = bookings.get(position);
        bookings.set(position, new Booking(old.customerCity(), "Purandar", old.people()));     // customer changed the fort
        System.out.println("Mumbai booking moved to " + bookings.get(position).fort());

        // 3. Cancel every Raigad booking
        boolean cancelled = bookings.removeIf(b -> b.fort().equals("Raigad"));
        System.out.println("Raigad cancelled: " + cancelled);

        // 4. Sort by fort name, then by group size (largest first)
        bookings.sort(Comparator.comparing(Booking::fort).thenComparing(Comparator.comparingInt(Booking::people).reversed()));
        print("Sorted", bookings);

        // 5. Show the list two bookings per page
        int pageSize = 2;
        for (int from = 0, page = 1; from < bookings.size(); from += pageSize, page++) {
            int to = Math.min(from + pageSize, bookings.size());
            System.out.println("Page " + page + ": " + bookings.subList(from, to).stream().map(Booking::fort).toList());
        }

        int total = bookings.stream().mapToInt(Booking::people).sum();
        System.out.println("Total trekkers today: " + total);
    }
}
''' + OUT),
    practice(
        'Fort visitor log (filter, group, statistics)',
        'A fort office exports a month of visitor records into an <code>ArrayList</code> and answers management questions: who came from which city, which day was busiest, and what is the average group.',
        ['Build the list from raw data and <strong>copy</strong> it so the original is not changed.',
         'Use <strong>streams on the list</strong> to filter, group and count.',
         'Use <strong>Collections.max</strong> and <strong>frequency</strong> for quick answers.',
         'Remove duplicates while keeping order with a <strong>LinkedHashSet</strong>.'],
        r'''// Real-time practice: analysing a visitor log stored in an ArrayList
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class VisitorLogAnalysis {
    record Visit(String city, int day, int people) { }

    public static void main(String[] args) {
        List<Visit> log = new ArrayList<>(List.of(
            new Visit("Pune", 1, 4), new Visit("Mumbai", 1, 2), new Visit("Pune", 2, 6),
            new Visit("Nashik", 2, 3), new Visit("Pune", 3, 5), new Visit("Nagpur", 3, 1),
            new Visit("Mumbai", 3, 7), new Visit("Pune", 4, 2)));

        // Who came from Pune?
        List<Visit> fromPune = log.stream().filter(v -> v.city().equals("Pune")).toList();
        System.out.println("Visits from Pune : " + fromPune.size());

        // People per day (TreeMap keeps the days in order)
        Map<Integer, Integer> perDay = new TreeMap<>();
        for (Visit v : log) {
            perDay.merge(v.day(), v.people(), Integer::sum);
        }
        System.out.println("People per day   : " + perDay);

        // Cities in the order they first appeared, without repeats
        List<String> cities = new ArrayList<>(new LinkedHashSet<>(log.stream().map(Visit::city).toList()));
        System.out.println("Unique cities    : " + cities);

        // Quick answers with Collections helpers
        List<Integer> groups = log.stream().map(Visit::people).collect(Collectors.toList());
        System.out.println("Biggest group    : " + Collections.max(groups));
        System.out.println("Groups of 2      : " + Collections.frequency(groups, 2));
        System.out.printf("Average group    : %.2f%n", groups.stream().mapToInt(Integer::intValue).average().orElse(0));

        // Busiest city
        Map<String, Integer> perCity = log.stream().collect(Collectors.groupingBy(Visit::city, TreeMap::new, Collectors.summingInt(Visit::people)));
        String busiest = Collections.max(perCity.entrySet(), Map.Entry.comparingByValue()).getKey();
        System.out.println("People per city  : " + perCity);
        System.out.println("Busiest city     : " + busiest);
    }
}
''' + OUT),
]

PRACTICE['linkedlist'] = [
    practice(
        'Tour route planner (insert stops, skip, queue of waiting groups)',
        'A guide plans a day tour as a <code>LinkedList</code> of forts. Stops are added at both ends and <strong>in the middle</strong>, visited stops are dropped from the front, and the same object also acts as a <strong>queue</strong> of groups waiting at the gate.',
        ['<strong>addFirst / addLast / add(index, e)</strong> to build the route.',
         'A <strong>ListIterator</strong> inserts a stop right after a chosen fort while walking.',
         '<strong>removeFirst</strong> as each fort is visited, <strong>peek</strong> to see what is next.',
         '<strong>offer / poll</strong> to serve waiting groups in first-come-first-served order.'],
        r'''// Real-time practice: a day-tour route and a gate queue with LinkedList
import java.util.LinkedList;
import java.util.ListIterator;

public class TourRoutePlanner {
    public static void main(String[] args) {
        LinkedList<String> route = new LinkedList<>();
        route.add("Lohagad");
        route.add("Rajgad");
        route.addFirst("Sinhagad");                          // start the day here
        route.addLast("Raigad");                             // finish here
        System.out.println("Planned route : " + route);

        // Insert a stop right after Lohagad while walking the list
        ListIterator<String> it = route.listIterator();
        while (it.hasNext()) {
            if (it.next().equals("Lohagad")) {
                it.add("Visapur");                           // O(1): no shifting
            }
        }
        System.out.println("With Visapur  : " + route);

        // The tour moves forward: the first stop is visited and removed
        while (route.size() > 2) {
            String visited = route.removeFirst();
            System.out.println("Visited " + visited + ", next is " + route.peekFirst());
        }

        // The same class as a queue: groups waiting at the gate
        LinkedList<String> gate = new LinkedList<>();
        gate.offer("Group from Pune");
        gate.offer("Group from Nashik");
        gate.offer("Group from Mumbai");
        while (!gate.isEmpty()) {
            System.out.println("Now entering: " + gate.poll());
        }
        System.out.println("Remaining route: " + route);
    }
}
''' + OUT),
]

PRACTICE['vector'] = [
    practice(
        'Shared ticket counter log (many threads, one Vector)',
        'Four counters at a fort gate record each ticket they sell into one shared list at the same time. A <code>Vector</code> is synchronized, so no ticket is lost; a plain ArrayList could lose some or even throw an error.',
        ['Start four threads; each adds 1000 tickets to the <strong>same Vector</strong>.',
         'After <strong>join</strong>, the size is exactly 4000.',
         'A check-then-add on a Vector is <strong>not</strong> atomic, so it is wrapped in <strong>synchronized (list)</strong>.'],
        r'''// Real-time practice: four threads writing to one Vector
import java.util.Vector;

public class SharedTicketLog {
    public static void main(String[] args) throws InterruptedException {
        Vector<String> tickets = new Vector<>();

        Thread[] counters = new Thread[4];
        for (int c = 0; c < counters.length; c++) {
            final String counterName = "Counter-" + (c + 1);
            counters[c] = new Thread(() -> {
                for (int i = 0; i < 1000; i++) {
                    tickets.add(counterName);                            // each call is synchronized
                }
            });
            counters[c].start();
        }
        for (Thread t : counters) {
            t.join();
        }
        System.out.println("Tickets recorded : " + tickets.size());

        // A "first time only" rule needs the lock around BOTH steps
        Vector<String> vip = new Vector<>();
        Runnable addVip = () -> {
            synchronized (vip) {
                if (!vip.contains("Raigad pass")) {
                    vip.add("Raigad pass");
                }
            }
        };
        Thread a = new Thread(addVip);
        Thread b = new Thread(addVip);
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println("VIP pass entries : " + vip.size());
    }
}
''' + OUT),
]

PRACTICE['stack'] = [
    practice(
        'Route editor with undo and redo',
        'A route editor lets a trekker add forts to a plan and press <strong>Undo</strong> and <strong>Redo</strong>. Two stacks do the whole job: the last action done is the first one undone (LIFO).',
        ['<strong>push</strong> each action on the undo stack.',
         '<strong>pop</strong> from the undo stack and <strong>push</strong> to the redo stack when the user presses Undo.',
         '<strong>peek</strong> to show the latest step, <strong>empty()</strong> to guard against an empty stack.',
         'A second small program checks that brackets in an expression are <strong>balanced</strong>.'],
        r'''// Real-time practice: undo / redo and bracket checking with Stack
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

public class RouteEditorUndo {
    static final List<String> plan = new ArrayList<>();
    static final Stack<String> undo = new Stack<>();
    static final Stack<String> redo = new Stack<>();

    static void add(String fort) {
        plan.add(fort);
        undo.push(fort);                               // remember the action
        redo.clear();                                  // a new action ends the redo history
        System.out.println("add " + fort + "  -> " + plan);
    }

    static void undoLast() {
        if (undo.empty()) {
            System.out.println("nothing to undo");
            return;
        }
        String fort = undo.pop();                      // most recent action first
        plan.remove(fort);
        redo.push(fort);
        System.out.println("undo " + fort + " -> " + plan);
    }

    static void redoLast() {
        if (redo.empty()) {
            System.out.println("nothing to redo");
            return;
        }
        String fort = redo.pop();
        plan.add(fort);
        undo.push(fort);
        System.out.println("redo " + fort + " -> " + plan);
    }

    static boolean balanced(String text) {
        Stack<Character> open = new Stack<>();
        for (char ch : text.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') {
                open.push(ch);
            } else if (ch == ')' || ch == ']' || ch == '}') {
                if (open.empty()) {
                    return false;
                }
                char top = open.pop();
                if ((ch == ')' && top != '(') || (ch == ']' && top != '[') || (ch == '}' && top != '{')) {
                    return false;
                }
            }
        }
        return open.empty();
    }

    public static void main(String[] args) {
        add("Sinhagad");
        add("Lohagad");
        add("Raigad");
        undoLast();
        undoLast();
        redoLast();
        add("Torna");                                  // clears the redo history
        redoLast();
        System.out.println("Last action: " + undo.peek());

        System.out.println("(a[b]{c})  balanced? " + balanced("(a[b]{c})"));
        System.out.println("(a[b)]     balanced? " + balanced("(a[b)]"));
    }
}
''' + OUT),
]

PRACTICE['hashset'] = [
    practice(
        'Visitor registration: no duplicates, and set arithmetic',
        'Two forts keep a set of registered visitor IDs. The office must reject double registration and answer questions such as "who visited both forts?"',
        ['<strong>add</strong> returns false for a duplicate: use it to detect double registration.',
         '<strong>retainAll</strong> = visited both (intersection), <strong>addAll</strong> = visited either (union), <strong>removeAll</strong> = only one fort (difference).',
         'Always copy first so the original sets stay intact.',
         '<strong>contains</strong> for an O(1) gate check.'],
        r'''// Real-time practice: registrations and set arithmetic with HashSet
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

public class VisitorRegistry {
    public static void main(String[] args) {
        Set<String> raigad = new HashSet<>();
        for (String id : new String[] {"PUN-101", "MUM-202", "PUN-101", "NSK-303", "NGP-404"}) {
            if (!raigad.add(id)) {
                System.out.println("Rejected duplicate registration: " + id);
            }
        }

        Set<String> torna = new HashSet<>(Set.of("MUM-202", "KOP-505", "NGP-404", "SAT-606"));

        Set<String> both = new HashSet<>(raigad);
        both.retainAll(torna);                                   // intersection
        Set<String> either = new HashSet<>(raigad);
        either.addAll(torna);                                    // union
        Set<String> onlyRaigad = new HashSet<>(raigad);
        onlyRaigad.removeAll(torna);                             // difference

        System.out.println("Visited both forts   : " + new TreeSet<>(both));
        System.out.println("Visited either fort  : " + new TreeSet<>(either));
        System.out.println("Visited only Raigad  : " + new TreeSet<>(onlyRaigad));
        System.out.println("Gate check PUN-101   : " + raigad.contains("PUN-101"));
        System.out.println("Raigad is subset of union: " + either.containsAll(raigad));
    }
}
''' + OUT),
]

PRACTICE['linkedhashset'] = [
    practice(
        'Recently visited forts (unique, in the order of visiting)',
        'A travel app shows "Recently viewed forts": no repeats, in the order the user first looked at them, and it keeps only the newest few. <code>LinkedHashSet</code> removes repeats <em>and</em> keeps the order.',
        ['<strong>add</strong> each viewed fort: repeats are ignored.',
         'To move a repeated fort to the end, <strong>remove</strong> it and <strong>add</strong> it again.',
         'Trim to the last three using the <strong>iterator</strong> on the oldest elements.',
         'Remove duplicates from a list while <strong>keeping order</strong>.'],
        r'''// Real-time practice: recently viewed forts with LinkedHashSet
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;

public class RecentlyViewed {
    static final int LIMIT = 3;

    static void view(LinkedHashSet<String> recent, String fort) {
        recent.remove(fort);                                   // if it is there, move it to the end
        recent.add(fort);
        Iterator<String> oldest = recent.iterator();
        while (recent.size() > LIMIT) {
            oldest.next();
            oldest.remove();                                   // drop the oldest
        }
        System.out.println("viewed " + fort + " -> " + recent);
    }

    public static void main(String[] args) {
        LinkedHashSet<String> recent = new LinkedHashSet<>();
        view(recent, "Raigad");
        view(recent, "Torna");
        view(recent, "Raigad");                                // moves Raigad to the end
        view(recent, "Lohagad");
        view(recent, "Panhala");                               // Torna is now the oldest and falls out

        List<String> clicks = new ArrayList<>(List.of("Pune", "Mumbai", "Pune", "Nashik", "Mumbai", "Nagpur"));
        List<String> unique = new ArrayList<>(new LinkedHashSet<>(clicks));
        System.out.println("Clicks            : " + clicks);
        System.out.println("Unique, same order: " + unique);
    }
}
''' + OUT),
]

PRACTICE['treeset'] = [
    practice(
        'Trek slot finder (next free slot, sorted directory, ranges)',
        'A trek company keeps the booked start times (in minutes from midnight) of a fort in a <code>TreeSet</code>, and also a sorted directory of fort names. Sorted sets answer "what is the nearest slot?" in O(log n).',
        ['<strong>ceiling / floor / higher / lower</strong> find the nearest booked time.',
         '<strong>subSet / headSet / tailSet</strong> list the bookings in a time range.',
         '<strong>first / last / pollFirst</strong> process the earliest booking.',
         'A <strong>Comparator</strong> keeps a fort directory in case-insensitive order.'],
        r'''// Real-time practice: booked time slots and a fort directory with TreeSet
import java.util.TreeSet;

public class TrekSlotFinder {
    static String time(int minutes) {
        return String.format("%02d:%02d", minutes / 60, minutes % 60);
    }

    public static void main(String[] args) {
        TreeSet<Integer> booked = new TreeSet<>();
        for (int hour : new int[] {9, 11, 6, 14, 8}) {
            booked.add(hour * 60);                                      // minutes from midnight
        }
        System.out.print("Booked slots : ");
        booked.forEach(m -> System.out.print(time(m) + " "));
        System.out.println();

        int wanted = 10 * 60;                                           // a customer wants 10:00
        System.out.println("Slot before 10:00 : " + time(booked.lower(wanted)));
        System.out.println("Slot after  10:00 : " + time(booked.higher(wanted)));
        System.out.println("Wanted 10:00 free?: " + !booked.contains(wanted));

        System.out.print("Between 08:00 and 12:00 : ");
        booked.subSet(8 * 60, true, 12 * 60, true).forEach(m -> System.out.print(time(m) + " "));
        System.out.println();

        System.out.println("Earliest: " + time(booked.first()) + ", latest: " + time(booked.last()));
        System.out.println("Served and removed: " + time(booked.pollFirst()) + ", left " + booked.size());

        TreeSet<String> directory = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        directory.add("torna");
        directory.add("Raigad");
        directory.add("lohagad");
        directory.add("RAIGAD");                                        // same as Raigad: ignored
        System.out.println("Directory: " + directory);
        System.out.println("First fort starting with R or later: " + directory.ceiling("R"));
    }
}
''' + OUT),
]

PRACTICE['hashmap'] = [
    practice(
        'Trek kit inventory (stock, counting, grouping)',
        'A shop keeps the stock of trek gear in a <code>HashMap</code>. It counts what each customer buys, flags low stock and groups items by category: the three jobs HashMap does best.',
        ['<strong>put / get / getOrDefault</strong> manage the stock.',
         '<strong>merge</strong> counts sales; <strong>computeIfAbsent</strong> groups items by category.',
         '<strong>entrySet</strong> loop to report low stock; <strong>removeIf</strong> to drop sold-out items.',
         '<strong>TreeMap copy</strong> only to print in a stable order.'],
        r'''// Real-time practice: a trek-gear inventory with HashMap
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class TrekKitInventory {
    public static void main(String[] args) {
        Map<String, Integer> stock = new HashMap<>();
        stock.put("Rope", 10);
        stock.put("Torch", 25);
        stock.put("Boots", 6);
        stock.put("Raincoat", 12);

        // Customers buy items
        String[] sales = {"Torch", "Boots", "Torch", "Rope", "Boots", "Boots", "Map"};
        Map<String, Integer> soldCount = new HashMap<>();
        for (String item : sales) {
            int left = stock.getOrDefault(item, 0);
            if (left == 0) {
                System.out.println("Cannot sell " + item + ": out of stock or unknown");
                continue;
            }
            stock.put(item, left - 1);                              // reduce stock
            soldCount.merge(item, 1, Integer::sum);                 // count sales
        }
        System.out.println("Sold   : " + new TreeMap<>(soldCount));
        System.out.println("Stock  : " + new TreeMap<>(stock));

        // Low stock report
        for (Map.Entry<String, Integer> e : new TreeMap<>(stock).entrySet()) {
            if (e.getValue() < 5) {
                System.out.println("LOW STOCK: " + e.getKey() + " (" + e.getValue() + " left)");
            }
        }

        // Group items by category
        Map<String, List<String>> byCategory = new TreeMap<>();
        String[][] items = {{"Rope", "Climbing"}, {"Torch", "Light"}, {"Boots", "Footwear"}, {"Raincoat", "Clothing"}, {"Headlamp", "Light"}};
        for (String[] item : items) {
            byCategory.computeIfAbsent(item[1], k -> new ArrayList<>()).add(item[0]);
        }
        System.out.println("Categories: " + byCategory);

        stock.values().removeIf(count -> count == 0);                // sold-out items disappear
        System.out.println("Still stocked: " + new TreeMap<>(stock).keySet());
    }
}
''' + OUT),
]

PRACTICE['linkedhashmap'] = [
    practice(
        'Fort page cache (LRU: least recently used is thrown out)',
        'A website keeps the last <strong>3</strong> fort pages in memory. When a fourth page is loaded, the page nobody has used for the longest time is removed. An access-ordered <code>LinkedHashMap</code> does this with one overridden method.',
        ['Create the map with <strong>accessOrder = true</strong>, so every <code>get</code> moves the entry to the end.',
         'Override <strong>removeEldestEntry</strong> to remove the oldest when size exceeds 3.',
         'Show hits, misses and the cache contents after each request.'],
        r'''// Real-time practice: an LRU page cache with LinkedHashMap
import java.util.LinkedHashMap;
import java.util.Map;

public class FortPageCache {
    static class LruCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;

        LruCache(int capacity) {
            super(16, 0.75f, true);                          // true = access order
            this.capacity = capacity;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;                        // evict the least recently used
        }
    }

    static int hits = 0;
    static int misses = 0;

    static String load(LruCache<String, String> cache, String fort) {
        String page = cache.get(fort);
        if (page == null) {
            misses++;
            page = "Page of " + fort;                        // pretend this is slow work
            cache.put(fort, page);
        } else {
            hits++;
        }
        return page;
    }

    public static void main(String[] args) {
        LruCache<String, String> cache = new LruCache<>(3);
        for (String fort : new String[] {"Raigad", "Torna", "Lohagad", "Raigad", "Panhala", "Torna", "Raigad"}) {
            load(cache, fort);
            System.out.println("request " + fort + " -> cache " + cache.keySet());
        }
        System.out.println("hits=" + hits + " misses=" + misses);
    }
}
''' + OUT),
]

PRACTICE['treemap'] = [
    practice(
        'Bus timetable (next departure, previous bus, a window of time)',
        'A bus stand keeps departures in a <code>TreeMap</code> keyed by the time of day. Passengers ask "when is the next bus after 10:30?", and the board shows everything leaving in the next two hours.',
        ['<strong>put</strong> departures in any order: the map keeps them sorted.',
         '<strong>ceilingEntry / higherEntry / floorEntry</strong> answer the nearest-time questions.',
         '<strong>subMap</strong> gives the departure board for a time window.',
         '<strong>pollFirstEntry</strong> removes the bus that has just left.'],
        r'''// Real-time practice: a bus timetable with TreeMap
import java.util.Map;
import java.util.TreeMap;

public class BusTimetable {
    static String t(int minutes) {
        return String.format("%02d:%02d", minutes / 60, minutes % 60);
    }

    static int at(int hour, int minute) {
        return hour * 60 + minute;
    }

    public static void main(String[] args) {
        TreeMap<Integer, String> departures = new TreeMap<>();
        departures.put(at(12, 15), "Pune to Kolhapur");
        departures.put(at(6, 30), "Pune to Nashik");
        departures.put(at(9, 0), "Pune to Mumbai");
        departures.put(at(11, 45), "Pune to Nagpur");
        departures.put(at(15, 30), "Pune to Mumbai");

        int now = at(10, 30);
        Map.Entry<Integer, String> next = departures.ceilingEntry(now);           // first bus at or after now
        Map.Entry<Integer, String> previous = departures.lowerEntry(now);         // the one you just missed
        System.out.println("Next bus after " + t(now) + "     : " + t(next.getKey()) + " " + next.getValue());
        System.out.println("Bus you just missed      : " + t(previous.getKey()) + " " + previous.getValue());

        System.out.println("Board for the next 2 hours:");
        for (Map.Entry<Integer, String> e : departures.subMap(now, true, now + 120, true).entrySet()) {
            System.out.println("  " + t(e.getKey()) + "  " + e.getValue());
        }

        Map.Entry<Integer, String> gone = departures.pollFirstEntry();            // earliest bus has left
        System.out.println("Left the stand: " + t(gone.getKey()) + " " + gone.getValue() + "; remaining " + departures.size());
        System.out.println("Is there a bus after 16:00? " + departures.higherEntry(at(16, 0)));
    }
}
''' + OUT),
]

PRACTICE['hashtable'] = [
    practice(
        'Visitor counters shared by threads (atomic merge, legacy Enumeration)',
        'Old code that must be thread-safe still uses <code>Hashtable</code>. Here three threads count visitors per fort in one shared table (using the atomic <code>merge</code>), and the same table is then read with the legacy <code>Enumeration</code> API.',
        ['<strong>merge</strong> is atomic, so three threads never lose a count.',
         '<strong>keys()</strong> and <strong>elements()</strong> read the table the old way.',
         'A null key or value is rejected: the program shows the exception.'],
        r'''// Real-time practice: a thread-safe counter table with Hashtable
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.TreeMap;

public class SharedVisitorCounters {
    public static void main(String[] args) throws InterruptedException {
        Hashtable<String, Integer> counters = new Hashtable<>();
        String[] forts = {"Raigad", "Torna", "Lohagad"};

        Thread[] gates = new Thread[3];
        for (int g = 0; g < gates.length; g++) {
            gates[g] = new Thread(() -> {
                for (int i = 0; i < 3000; i++) {
                    counters.merge(forts[i % forts.length], 1, Integer::sum);     // atomic update
                }
            });
            gates[g].start();
        }
        for (Thread t : gates) {
            t.join();
        }
        System.out.println("Counts: " + new TreeMap<>(counters));

        int total = 0;
        Enumeration<Integer> values = counters.elements();                      // the legacy way
        while (values.hasMoreElements()) {
            total += values.nextElement();
        }
        System.out.println("Total visitors: " + total);

        try {
            counters.put("Panhala", null);
        } catch (NullPointerException e) {
            System.out.println("A Hashtable does not accept null values");
        }
    }
}
''' + OUT),
]

PRACTICE['comparable'] = [
    practice(
        'Fort register: natural order drives sort, TreeSet and binary search',
        'A register class declares one natural order (by fort name). The same <code>compareTo</code> then makes sorting, a sorted set, <code>min / max</code> and <code>binarySearch</code> work with no extra code.',
        ['Implement <strong>Comparable&lt;Fort&gt;</strong> once.',
         '<strong>Collections.sort</strong>, <strong>max / min</strong> and <strong>binarySearch</strong> reuse it.',
         'A <strong>TreeSet</strong> stores the forts sorted and rejects the same name twice.'],
        r'''// Real-time practice: a Comparable Fort used by sort, TreeSet and binarySearch
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;

public class FortRegister {
    static class Fort implements Comparable<Fort> {
        final String name;
        final String district;
        final int heightMetres;

        Fort(String name, String district, int heightMetres) {
            this.name = name;
            this.district = district;
            this.heightMetres = heightMetres;
        }

        @Override
        public int compareTo(Fort other) {
            return name.compareTo(other.name);                       // natural order: by name
        }

        @Override
        public String toString() {
            return name + " (" + district + ", " + heightMetres + " m)";
        }
    }

    public static void main(String[] args) {
        List<Fort> forts = new ArrayList<>(List.of(
            new Fort("Torna", "Pune", 1403), new Fort("Raigad", "Raigad", 820),
            new Fort("Lohagad", "Pune", 1033), new Fort("Panhala", "Kolhapur", 845)));

        Collections.sort(forts);
        forts.forEach(f -> System.out.println(f));

        int index = Collections.binarySearch(forts, new Fort("Raigad", "", 0));    // needs a sorted list
        System.out.println("binarySearch(Raigad) = index " + index);
        System.out.println("First by name : " + Collections.min(forts).name);
        System.out.println("Last by name  : " + Collections.max(forts).name);

        TreeSet<Fort> set = new TreeSet<>(forts);
        boolean added = set.add(new Fort("Torna", "Another district", 1));          // same name: compareTo == 0
        System.out.println("Added a second Torna? " + added + ", set size " + set.size());
    }
}
''' + OUT),
]

PRACTICE['comparator'] = [
    practice(
        'Sort menu for a fort table (name, height, district then trek time)',
        'A web page shows a table of forts with a <strong>"Sort by"</strong> menu. Each menu choice is just a different <code>Comparator</code> held in a <code>Map</code>, so adding a new sort needs one line.',
        ['Keep the sort options in a <strong>LinkedHashMap&lt;String, Comparator&gt;</strong>.',
         'Build them with <strong>comparing / thenComparing / reversed</strong>.',
         'Apply the chosen comparator to the same list with <strong>list.sort</strong>.',
         '<strong>nullsLast</strong> keeps forts without a district at the bottom.'],
        r'''// Real-time practice: a "Sort by" menu made of Comparators
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class FortSortMenu {
    record Fort(String name, String district, int heightMetres, int trekHours) { }

    public static void main(String[] args) {
        List<Fort> forts = new ArrayList<>(List.of(
            new Fort("Torna", "Pune", 1403, 5), new Fort("Raigad", "Raigad", 820, 6),
            new Fort("Lohagad", "Pune", 1033, 2), new Fort("Panhala", "Kolhapur", 845, 1),
            new Fort("Rajgad", null, 1376, 4)));

        Map<String, Comparator<Fort>> menu = new LinkedHashMap<>();
        menu.put("Name (A to Z)", Comparator.comparing(Fort::name));
        menu.put("Height (highest first)", Comparator.comparingInt(Fort::heightMetres).reversed());
        menu.put("District, then quickest trek", Comparator
            .comparing(Fort::district, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparingInt(Fort::trekHours));

        for (Map.Entry<String, Comparator<Fort>> option : menu.entrySet()) {
            forts.sort(option.getValue());
            System.out.println("Sort by " + option.getKey() + ":");
            for (Fort f : forts) {
                System.out.println("   " + f.name() + " | " + f.district() + " | " + f.heightMetres() + " m | " + f.trekHours() + " h");
            }
        }
    }
}
''' + OUT),
]
