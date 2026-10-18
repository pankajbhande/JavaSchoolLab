import { Topic } from '../../coreJava';

export const stableVsUnstableSorting: Topic = {
    id: 'dsa-sorting-stable-vs-unstable-sorting',
    name: 'Stable vs Unstable Sorting',
    beginner: [
        {
            content: `<h4>What Does "Stable" Mean?</h4>
A sort is STABLE if two elements with EQUAL keys keep their original relative order after sorting. It only matters when sorting by one field while other data is attached - sorting by a single field of unique values makes stability invisible.
<ul>
<li><b>Stable:</b> Merge Sort, Insertion Sort, Bubble Sort, Counting Sort.</li>
<li><b>Not stable (by default):</b> Quick Sort, Heap Sort, Selection Sort.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class StabilityDemo {

    static class Student {
        String name;
        int grade;
        Student(String name, int grade) { this.name = name; this.grade = grade; }
        public String toString() { return name + "(" + grade + ")"; }
    }

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>(List.of(
            new Student("Anaji", 90),
            new Student("Baji", 85),
            new Student("Carol", 90),   // same grade as Anaji
            new Student("Dave", 85)     // same grade as Baji
        ));

        // Collections.sort (TimSort) IS stable - equal grades keep input order
        students.sort(Comparator.comparingInt(s -> s.grade));
        System.out.println(students);
    }
}
// OUTPUT:
// [Baji(85), Dave(85), Anaji(90), Carol(90)]
// (Baji stayed before Dave, Anaji stayed before Carol - both had matching input order preserved)`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why Stability Matters for Multi-Key Sorting</h3>
Stability enables a clean trick: to sort by (primary key, secondary key), sort by the SECONDARY key first, then by the PRIMARY key. A stable sort guarantees that ties in the primary key preserve the secondary-key order established in the first pass - producing correct multi-level sorting without a custom comparator combining both fields at once.`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.*;

public class MultiKeySortDemo {

    static class Employee {
        String department;
        String name;
        Employee(String dept, String name) { this.department = dept; this.name = name; }
        public String toString() { return department + "/" + name; }
    }

    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee("Sales", "Zara"),
            new Employee("Eng", "Anandrao"),
            new Employee("Sales", "Anandrao"),
            new Employee("Eng", "Zara")
        ));

        // Sort by SECONDARY key (name) first
        employees.sort(Comparator.comparing(e -> e.name));
        // Then sort by PRIMARY key (department) - stability preserves the name order within each department
        employees.sort(Comparator.comparing(e -> e.department));

        System.out.println(employees);
    }
}
// OUTPUT:
// [Eng/Anandrao, Eng/Zara, Sales/Anandrao, Sales/Zara]
// (within each department, names stayed alphabetically ordered from the first sort)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why doesn't stability matter when sorting a plain array of unique integers?</td><td>There are no equal elements to have a "relative order" between - stability only becomes observable when there's other associated data (or duplicate keys) whose original order might be visible</td></tr>
<tr class='text-center'><td>What sorting algorithm does Java's Collections.sort() / Arrays.sort() (for objects) use, and is it stable?</td><td>TimSort - a stable hybrid of merge sort and insertion sort, specifically chosen because Java's sort contract guarantees stability for object arrays</td></tr>
<tr class='text-center'><td>How can you make an inherently unstable sort (like Quick Sort) behave stably?</td><td>Attach the original index to each element as a tiebreaker in the comparator (sort by (value, originalIndex)) - forces a well-defined total order that preserves input order for equal values</td></tr>
</table>`
        }
    ]
};
