import { Topic } from '../../coreJava';

export const queueTopic: Topic = {
    id: 'dsa-queue-deque-queue',
    name: 'Queue',
    beginner: [
        {
            content: `<h4>What is a Queue?</h4>
A queue is FIFO (First In, First Out) - the first element added is the first one removed, like a real-world line. Three core operations, all O(1) with the right backing structure:
<ul>
<li><code>offer(x)</code> / <code>enqueue</code> - add to the BACK</li>
<li><code>poll()</code> / <code>dequeue</code> - remove and return the FRONT</li>
<li><code>peek()</code> - look at the front without removing it</li>
</ul>
In Java, <code>Queue</code> is an interface; <code>LinkedList</code> and <code>ArrayDeque</code> both implement it (ArrayDeque is generally faster).`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.LinkedList;
import java.util.Queue;

public class QueueBasicsDemo {
    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedList<>();

        queue.offer(1);
        queue.offer(2);
        queue.offer(3);

        System.out.println("Front (peek): " + queue.peek());
        System.out.println("Dequeue     : " + queue.poll());
        System.out.println("Front now   : " + queue.peek());
        System.out.println("Size        : " + queue.size());
    }
}
// OUTPUT:
// Front (peek): 1
// Dequeue     : 1
// Front now   : 2
// Size        : 2`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why a Naive Array-Based Queue is O(n) per Dequeue</h3>
Removing from the FRONT of a plain array means every remaining element must shift left by one - O(n). Two fixes exist: a LINKED structure (removing the head is O(1), no shifting), or a CIRCULAR array that tracks front/back indices and wraps around instead of shifting. This is exactly why <code>ArrayDeque</code> uses a circular buffer internally rather than a plain array.`,
            codeExamples: [
                `package com.javaschoollab;

public class NaiveArrayQueueDemo {

    static class SlowQueue {
        private final int[] data;
        private int size = 0;

        SlowQueue(int capacity) { data = new int[capacity]; }

        void enqueue(int val) {
            data[size++] = val;
        }

        // O(n) - every remaining element must shift down by one
        int dequeue() {
            int front = data[0];
            for (int i = 1; i < size; i++) {
                data[i - 1] = data[i];
            }
            size--;
            return front;
        }
    }

    public static void main(String[] args) {
        SlowQueue q = new SlowQueue(5);
        q.enqueue(1);
        q.enqueue(2);
        q.enqueue(3);

        System.out.println("Dequeued: " + q.dequeue());
        // Notice dequeue() had to shift elements 2 and 3 down - O(n) work
        // for what should be an O(1) operation. This is exactly what
        // ArrayDeque's circular buffer avoids.
    }
}
// OUTPUT:
// Dequeued: 1`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is LinkedList's dequeue O(1) but a plain array's is O(n)?</td><td>LinkedList removes the head node directly, just repointing the head reference; a plain array has no way to "shrink from the front" without physically shifting every remaining element</td></tr>
<tr class='text-center'><td>How does a circular buffer avoid the O(n) shift problem?</td><td>It tracks separate front and back indices that wrap around using modulo arithmetic - dequeuing just advances the front index, no data movement needed</td></tr>
<tr class='text-center'><td>What's the classic application of a queue in graph algorithms?</td><td>BFS (Breadth-First Search) - nodes are processed in the order they're discovered, level by level, which is exactly what a FIFO queue naturally provides</td></tr>
</table>`
        }
    ]
};
