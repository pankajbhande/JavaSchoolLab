import { Topic } from '../../coreJava';

export const comparatorCustomSorting: Topic = {
    id: 'dsa-sorting-comparator-custom-sorting',
    name: 'Comparator / Custom Sorting',
    beginner: [
        {
            content: `<h4>Sorting with a Custom Comparator</h4>
Java's built-in sorts accept a <code>Comparator</code> to define custom ordering instead of natural (ascending) order. A <code>Comparator&lt;T&gt;</code> returns negative/zero/positive to mean "a before b" / "equal" / "a after b".`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class ComparatorBasicsDemo {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1, 9));

        // Descending order via a lambda Comparator
        nums.sort((a, b) -> b - a);
        System.out.println(nums);

        // Same thing, more readable with Comparator.reverseOrder()
        nums.sort(Comparator.reverseOrder());
        System.out.println(nums);

        // Sorting Strings by LENGTH instead of natural alphabetical order
        List<String> words = new ArrayList<>(List.of("banana", "fig", "apple", "kiwi"));
        words.sort(Comparator.comparingInt(String::length));
        System.out.println(words);
    }
}
// OUTPUT:
// [9, 8, 5, 2, 1]
// [9, 8, 5, 2, 1]
// [fig, kiwi, apple, banana]`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Multi-Level Comparators - thenComparing()</h3>
Real sorting often needs a PRIMARY key with a SECONDARY tiebreaker: sort employees by department, and within each department, by salary descending. <code>Comparator.thenComparing()</code> chains comparators cleanly without manual tie-handling logic.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class MultiLevelComparatorDemo {

    static class Employee {
        String department;
        int salary;
        String name;
        Employee(String department, int salary, String name) {
            this.department = department; this.salary = salary; this.name = name;
        }
        public String toString() { return department + " | " + name + " | " + salary; }
    }

    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee("Eng", 90000, "Zara"),
            new Employee("Sales", 70000, "Amit"),
            new Employee("Eng", 95000, "Amit"),
            new Employee("Sales", 70000, "Zara")
        ));

        employees.sort(
            Comparator.comparing((Employee e) -> e.department)
                      .thenComparing((Employee e) -> e.salary, Comparator.reverseOrder())
                      .thenComparing(e -> e.name)
        );

        employees.forEach(System.out::println);
    }
}
// OUTPUT:
// Eng | Amit | 95000
// Eng | Zara | 90000
// Sales | Amit | 70000
// Sales | Zara | 70000`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the difference between Comparable and Comparator?</td><td>Comparable defines a class's own NATURAL ordering (one compareTo method built into the class); Comparator defines an EXTERNAL, swappable ordering, letting the same objects be sorted multiple different ways without modifying the class</td></tr>
<tr class='text-center'><td>What must a well-formed Comparator satisfy?</td><td>Consistency (if compare(a,b) < 0, then compare(b,a) > 0), transitivity (a<b and b<c implies a<c), and reflexivity (compare(a,a) == 0) - violating these can throw IllegalArgumentException("Comparison method violates its general contract") in some JDK sort implementations</td></tr>
<tr class='text-center'><td>Why prefer Integer subtraction (b - a) with caution for descending sort?</td><td>It can silently overflow for values near Integer.MIN_VALUE/MAX_VALUE, flipping the comparison result incorrectly - Integer.compare(b, a) or Comparator.reverseOrder() are the safe alternatives</td></tr>
</table>`
        }
    ]
};
