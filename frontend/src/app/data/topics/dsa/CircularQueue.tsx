import { Topic } from '../../coreJava';

export const circularQueue: Topic = {
    id: 'dsa-queue-deque-circular-queue',
    name: 'Circular Queue',
    beginner: [
        {
            content: `<h4>What is a Circular Queue?</h4>
A fixed-size array queue where the "back" wraps around to index 0 once it reaches the end, REUSING freed-up slots at the front instead of leaving them permanently wasted. Two indices, <code>front</code> and <code>rear</code>, both advance with modulo arithmetic.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:200px;height:auto;font-family:monospace">
  <circle cx="100" cy="100" r="70" fill="none" stroke="#e5e7eb"/>
  <circle cx="100" cy="30" r="16" fill="#ecfdf5" stroke="#059669"/><text x="100" y="34" text-anchor="middle" font-size="10" fill="#065f46">0</text>
  <circle cx="160" cy="70" r="16" fill="#fff7ed" stroke="#ea580c"/><text x="160" y="74" text-anchor="middle" font-size="10" fill="#9a3412">1</text>
  <circle cx="140" cy="150" r="16" fill="#fff7ed" stroke="#ea580c"/><text x="140" y="154" text-anchor="middle" font-size="10" fill="#9a3412">2</text>
  <circle cx="60" cy="150" r="16" fill="#f3f4f6" stroke="#9ca3af"/><text x="60" y="154" text-anchor="middle" font-size="10" fill="#6b7280">3</text>
  <circle cx="40" cy="70" r="16" fill="#f3f4f6" stroke="#9ca3af"/><text x="40" y="74" text-anchor="middle" font-size="10" fill="#6b7280">4</text>
  <text x="100" y="100" text-anchor="middle" font-size="10" fill="#6b7280">front=0, rear=2</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

public class CircularQueueDemo {

    static class CircularQueue {
        private final int[] data;
        private int front = 0, size = 0;
        private final int capacity;

        CircularQueue(int capacity) {
            this.capacity = capacity;
            data = new int[capacity];
        }

        boolean enqueue(int val) {
            if (size == capacity) return false;   // full
            int rear = (front + size) % capacity;   // wraps around automatically
            data[rear] = val;
            size++;
            return true;
        }

        int dequeue() {
            if (size == 0) throw new RuntimeException("Queue is empty");
            int val = data[front];
            front = (front + 1) % capacity;   // wraps around too
            size--;
            return val;
        }
    }

    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(3);
        q.enqueue(1);
        q.enqueue(2);
        q.enqueue(3);

        System.out.println(q.dequeue());   // frees up slot 0
        q.enqueue(4);                       // reuses slot 0 - wraps around

        System.out.println(q.dequeue());
        System.out.println(q.dequeue());
        System.out.println(q.dequeue());
    }
}
// OUTPUT:
// 1
// 2
// 3
// 4`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Distinguishing "Full" from "Empty" - the Classic Off-By-One Trap</h3>
With just front and rear indices, <code>front == rear</code> is ambiguous: it could mean the queue is EMPTY or completely FULL. Two standard fixes: track <code>size</code> explicitly (as above, simplest), or reserve one array slot permanently unused so "full" and "empty" produce genuinely different index states.`,
            codeExamples: [
                `package com.javaschoollab;

public class CircularQueueOneSlotWastedDemo {

    // Alternative design: no 'size' field, distinguishes full/empty by
    // always leaving ONE slot unused - a classic embedded-systems technique.
    static class CircularQueue {
        private final int[] data;
        private int front = 0, rear = 0;
        private final int capacity;   // real usable capacity is capacity - 1

        CircularQueue(int capacity) {
            this.capacity = capacity + 1;   // reserve one extra slot
            data = new int[this.capacity];
        }

        boolean isFull() {
            return (rear + 1) % capacity == front;
        }

        boolean isEmpty() {
            return front == rear;
        }

        boolean enqueue(int val) {
            if (isFull()) return false;
            data[rear] = val;
            rear = (rear + 1) % capacity;
            return true;
        }

        int dequeue() {
            if (isEmpty()) throw new RuntimeException("Queue is empty");
            int val = data[front];
            front = (front + 1) % capacity;
            return val;
        }
    }

    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(3);   // usable capacity: 3
        q.enqueue(1); q.enqueue(2); q.enqueue(3);
        System.out.println("Full? " + q.isFull());
        System.out.println(q.dequeue());
        System.out.println("Full after dequeue? " + q.isFull());
    }
}
// OUTPUT:
// Full? true
// 1
// Full after dequeue? false`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does front == rear alone not tell you if a circular queue is full or empty?</td><td>Both states produce the identical index configuration - additional information (a size counter, or a reserved unused slot) is required to disambiguate them</td></tr>
<tr class='text-center'><td>What's the benefit of a circular queue over a regular array-based queue?</td><td>O(1) enqueue AND dequeue with a fixed memory footprint - no shifting elements and no unbounded growth, useful in memory-constrained or real-time systems (e.g. embedded ring buffers, producer-consumer buffers)</td></tr>
<tr class='text-center'><td>What real-world systems use circular queues?</td><td>CPU task scheduling ring buffers, network packet buffers, audio/video streaming buffers - anywhere a fixed-size buffer needs to continuously recycle space</td></tr>
</table>`
        }
    ]
};
