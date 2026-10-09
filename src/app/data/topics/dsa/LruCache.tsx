import { Topic } from '../../coreJava';

export const lruCache: Topic = {
    id: 'dsa-linked-list-lru-cache',
    name: 'LRU Cache',
    beginner: [
        {
            content: `<h4>What is an LRU Cache?</h4>
A Least-Recently-Used cache holds a fixed number of items; when full, adding a new item EVICTS the item that hasn't been accessed in the longest time. Both <code>get</code> and <code>put</code> must run in O(1) - which needs a HashMap (O(1) lookup) PLUS a doubly linked list (O(1) reordering) working together:
<ul>
<li><b>HashMap</b> maps key &rarr; node, for instant lookup.</li>
<li><b>Doubly linked list</b> keeps items ordered by recency - most-recently-used at the front, least-recently-used at the back, ready for O(1) eviction.</li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab;

// The simplest CORRECT (if not the fastest) LRU Cache: LinkedHashMap already
// tracks access order internally and supports O(1) eviction via removeEldestEntry.
import java.util.LinkedHashMap;
import java.util.Map;

public class SimpleLruCacheDemo {

    static class LRUCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;

        LRUCache(int capacity) {
            super(capacity, 0.75f, true);   // 'true' = order by ACCESS, not insertion
            this.capacity = capacity;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;   // auto-evict once over capacity
        }
    }

    public static void main(String[] args) {
        LRUCache<Integer, String> cache = new LRUCache<>(2);
        cache.put(1, "A");
        cache.put(2, "B");
        cache.get(1);            // touches 1 -> now most recently used
        cache.put(3, "C");       // evicts 2 (least recently used)

        System.out.println(cache.containsKey(1));
        System.out.println(cache.containsKey(2));   // evicted
        System.out.println(cache.containsKey(3));
    }
}
// OUTPUT:
// true
// false
// true`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Building LRU Cache From Scratch - HashMap + Doubly Linked List</h3>
The from-scratch version (what interviews actually want) makes the O(1) behavior explicit: every <code>get</code> or <code>put</code> moves the touched node to the FRONT of the list; when over capacity, the node at the BACK (tail) is evicted - both are O(1) because it's a doubly linked list with direct node references from the HashMap.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 420 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:monospace">
  <text x="10" y="16" font-size="11" fill="#374151">HashMap: {1:node1, 2:node2, 3:node3}</text>
  <text x="10" y="34" font-size="11" fill="#6b7280">MRU (head)</text>
  <rect x="90" y="24" width="50" height="26" fill="#ecfdf5" stroke="#059669"/><text x="115" y="42" text-anchor="middle" font-size="11" fill="#065f46">1</text>
  <rect x="160" y="24" width="50" height="26" fill="#fff7ed" stroke="#ea580c"/><text x="185" y="42" text-anchor="middle" font-size="11" fill="#9a3412">2</text>
  <rect x="230" y="24" width="50" height="26" fill="#fef2f2" stroke="#dc2626"/><text x="255" y="42" text-anchor="middle" font-size="11" fill="#991b1b">3</text>
  <text x="300" y="42" font-size="11" fill="#6b7280">LRU (tail, evicted first)</text>
</svg>
</div>`,
            codeExamples: [
                `package com.javaschoollab;

import java.util.HashMap;
import java.util.Map;

public class LRUCacheFromScratchDemo {

    static class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) { this.key = key; this.value = value; }
    }

    static class LRUCache {
        private final int capacity;
        private final Map<Integer, Node> map = new HashMap<>();
        private final Node head = new Node(-1, -1);   // dummy head (MRU side)
        private final Node tail = new Node(-1, -1);   // dummy tail (LRU side)

        LRUCache(int capacity) {
            this.capacity = capacity;
            head.next = tail;
            tail.prev = head;
        }

        int get(int key) {
            if (!map.containsKey(key)) return -1;
            Node node = map.get(key);
            moveToFront(node);
            return node.value;
        }

        void put(int key, int value) {
            if (map.containsKey(key)) {
                Node node = map.get(key);
                node.value = value;
                moveToFront(node);
                return;
            }
            if (map.size() == capacity) {
                Node lru = tail.prev;
                remove(lru);
                map.remove(lru.key);
            }
            Node newNode = new Node(key, value);
            map.put(key, newNode);
            addToFront(newNode);
        }

        private void remove(Node node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }

        private void addToFront(Node node) {
            node.next = head.next;
            node.prev = head;
            head.next.prev = node;
            head.next = node;
        }

        private void moveToFront(Node node) {
            remove(node);
            addToFront(node);
        }
    }

    public static void main(String[] args) {
        LRUCache cache = new LRUCache(2);
        cache.put(1, 10);
        cache.put(2, 20);
        System.out.println(cache.get(1));   // touches 1 -> most recently used
        cache.put(3, 30);                    // evicts 2 (least recently used)
        System.out.println(cache.get(2));    // -1, evicted
        System.out.println(cache.get(3));
    }
}
// OUTPUT:
// 10
// -1
// 30`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does LRU Cache need BOTH a HashMap and a doubly linked list?</td><td>The HashMap alone can't maintain recency order; the linked list alone can't do O(1) lookup by key - together, the map gives instant node access and the list gives O(1) reordering/eviction</td></tr>
<tr class='text-center'><td>Why specifically a DOUBLY linked list, not singly linked?</td><td>Moving a node to the front requires removing it from its CURRENT position first, which needs its predecessor - only O(1) reachable via a prev pointer, avoiding an O(n) search</td></tr>
<tr class='text-center'><td>Why use dummy head/tail nodes instead of tracking real head/tail references?</td><td>They eliminate null-checking edge cases (empty list, removing the only node) - every real node always has a valid prev and next to work with, even at the boundaries</td></tr>
</table>`
        }
    ]
};
