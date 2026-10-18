// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const messagingPatternsPart2: Course[] = [
  {
    id: 'messaging-patterns-2',
    name: 'Integration & Messaging Patterns (Routing)',
    icon: 'Route',
    subTopics: [
      {
        id: 'messaging-patterns-routing',
        name: 'Message Routing & Transformation Patterns',
        topics: [

          // ----- Message Router -----
          {
            id: 'message-router-pattern',
            name: 'Message Router Pattern',
            beginner: [
              {
                content: `<h3>What is the Message Router Pattern?</h3>
A <strong>Message Router</strong> is a component that sits between a sender and its possible receivers and decides, based on the message's content or metadata (headers), which channel(s) the message should be sent to next. The sender doesn't know or care which receiver will actually process the message.<br>
<br>
<h4>Why Use a Router?</h4>
• Without a router, every producer would need to know every consumer's address and the rules for who handles what - tightly coupling them.<br>
• A router centralizes that routing logic in one place, so producers just send to the router and consumers just listen on their own channel.<br>
• New consumer types can be added by updating the router's rules, without touching the producer at all.<br>`,
                codeExamples: [
                  `import java.util.function.Consumer;
import java.util.HashMap;
import java.util.Map;

// Illustrative in-process router - a real system would route between
// message-broker destinations (JMS/Kafka topics), not method calls.
public class MessageRouterDemo {

    static class Order {
        String type; // "DOMESTIC" or "INTERNATIONAL"
        Order(String type) { this.type = type; }
    }

    public static void main(String[] args) {
        Map<String, Consumer<Order>> routes = new HashMap<>();
        routes.put("DOMESTIC", o -> System.out.println("Routed to Domestic Shipping Queue"));
        routes.put("INTERNATIONAL", o -> System.out.println("Routed to International Customs Queue"));

        Order o1 = new Order("DOMESTIC");
        Order o2 = new Order("INTERNATIONAL");

        routes.get(o1.type).accept(o1);
        routes.get(o2.type).accept(o2);
    }
}
// OUTPUT:
// Routed to Domestic Shipping Queue
// Routed to International Customs Queue`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Content-Based vs Header-Based Routing</h3>
• <strong>Content-Based Router</strong> - inspects the message body/payload to decide the destination (e.g. an order's country field).<br>
• <strong>Header-Based Router</strong> - a Content-Based Router variant that inspects metadata/headers instead of parsing the payload, which is cheaper and keeps routing logic decoupled from the message schema.<br>
• In real systems (Apache Camel, Spring Integration, Kafka Streams branching), routers are typically declared as rules/predicates rather than hand-written if/else chains, so routing logic can be updated without redeploying producers or consumers.<br>
<br>
<h4>Static vs Dynamic Routing</h4>
• <strong>Static routing</strong> - the set of possible destinations is fixed and known upfront.<br>
• <strong>Dynamic routing</strong> - destinations can be looked up at runtime (e.g. from a routing table in a database), letting the system adapt without a redeploy.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does a Message Router solve?</td><td>It decouples producers from consumers by centralizing the decision of which destination a message should go to</td></tr>
<tr class='text-center'><td>Content-based vs header-based routing?</td><td>Content-based inspects the payload; header-based inspects metadata, which is cheaper and doesn't require parsing the message body</td></tr>
<tr class='text-center'><td>Give a real framework that implements this pattern.</td><td>Apache Camel's choice()/when() DSL, Spring Integration routers, and Kafka Streams' branch()</td></tr>
</table>`
              }
            ]
          },

          // ----- Message Filter -----
          {
            id: 'message-filter-pattern',
            name: 'Message Filter Pattern',
            beginner: [
              {
                content: `<h3>What is the Message Filter Pattern?</h3>
A <strong>Message Filter</strong> sits on a channel and discards (or diverts) messages that don't match a given criteria, so that whatever is downstream only ever sees messages it actually cares about.<br>
<br>
<h4>Filter vs Router</h4>
• A <strong>Router</strong> sends every message somewhere (it chooses a destination for all messages).<br>
• A <strong>Filter</strong> may send a message nowhere at all - it simply drops non-matching messages instead of routing them.<br>`,
                codeExamples: [
                  `import java.util.List;
import java.util.function.Predicate;

public class MessageFilterDemo {

    record LogEvent(String level, String message) {}

    public static void main(String[] args) {
        List<LogEvent> events = List.of(
            new LogEvent("INFO", "Server started"),
            new LogEvent("ERROR", "Database connection failed"),
            new LogEvent("DEBUG", "Cache warmed"),
            new LogEvent("ERROR", "Timeout calling payment service")
        );

        Predicate<LogEvent> onlyErrors = e -> e.level().equals("ERROR");

        events.stream()
              .filter(onlyErrors)
              .forEach(e -> System.out.println("Forwarded: " + e.message()));
    }
}
// OUTPUT:
// Forwarded: Database connection failed
// Forwarded: Timeout calling payment service`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Where Filters Fit in a Pipeline</h3>
Filters are commonly chained right after a Splitter or a Router, so a large or noisy stream of messages can be trimmed down to just the events a given consumer actually needs to act on (e.g. an alerting service that only wants ERROR/CRITICAL log events, not every log line).<br>
<br>
Filtering can happen at different layers: a message-broker-level selector (e.g. JMS message selectors using SQL-like syntax on headers) avoids even delivering non-matching messages to the consumer at all, which is more efficient than filtering after delivery.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does a Filter differ from a Router?</td><td>A Router always forwards a message somewhere; a Filter can drop a message entirely if it doesn't match the criteria</td></tr>
<tr class='text-center'><td>Where is it more efficient to filter - at the broker or after delivery?</td><td>At the broker (e.g. JMS message selectors), since non-matching messages are never even delivered to the consumer</td></tr>
</table>`
              }
            ]
          },

          // ----- Message Translator -----
          {
            id: 'message-translator-pattern',
            name: 'Message Translator Pattern',
            beginner: [
              {
                content: `<h3>What is the Message Translator Pattern?</h3>
A <strong>Message Translator</strong> converts a message from the format/schema one system produces into the format another system expects, so two systems with different data contracts can still communicate without either one adapting to the other directly.<br>
<br>
<h4>Common Translation Needs</h4>
• Different field names/casing between systems (<code>customer_id</code> vs <code>customerId</code>).<br>
• Different serialization formats (XML vs JSON vs Avro).<br>
• Different units or value representations (cents vs dollars, ISO date strings vs epoch millis).<br>`,
                codeExamples: [
                  `import java.util.Map;
import java.util.HashMap;

public class MessageTranslatorDemo {

    // Legacy system's message shape
    record LegacyOrder(String cust_id, int amt_cents) {}

    // New system's expected message shape
    record ModernOrder(String customerId, double amount) {}

    static ModernOrder translate(LegacyOrder legacy) {
        return new ModernOrder(legacy.cust_id(), legacy.amt_cents() / 100.0);
    }

    public static void main(String[] args) {
        LegacyOrder legacy = new LegacyOrder("CUST-101", 25000);
        ModernOrder modern = translate(legacy);
        System.out.println(modern);
    }
}
// OUTPUT:
// ModernOrder[customerId=CUST-101, amount=250.0]`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Translator as an Anti-Corruption Layer</h3>
In a microservices/legacy-integration context, a Message Translator often doubles as an <strong>anti-corruption layer</strong> - it insulates a new/clean domain model from a legacy system's messy or outdated data shapes, so the legacy schema's quirks never leak into the new system's code. This is a common companion technique alongside the Strangler Fig migration pattern.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why not just make both systems agree on one schema?</td><td>Systems are often owned by different teams/vendors or built at different times - a translator lets them evolve independently while still communicating</td></tr>
<tr class='text-center'><td>What's an anti-corruption layer?</td><td>A translation boundary that prevents a legacy or external system's data model from leaking into and "corrupting" a clean new domain model</td></tr>
</table>`
              }
            ]
          },

          // ----- Content Enricher -----
          {
            id: 'content-enricher-pattern',
            name: 'Content Enricher Pattern',
            beginner: [
              {
                content: `<h3>What is the Content Enricher Pattern?</h3>
A <strong>Content Enricher</strong> adds missing data to a message before it's passed downstream - typically by looking the extra data up from another service, database, or cache - because the original message doesn't carry everything the eventual consumer needs.<br>
<br>
<h4>Typical Example</h4>
An "OrderPlaced" event might only contain a <code>customerId</code>. If the downstream consumer needs the customer's full name and email to send a confirmation, a Content Enricher fetches those details and adds them to the message before forwarding it.`,
                codeExamples: [
                  `import java.util.Map;

public class ContentEnricherDemo {

    record OrderPlaced(String orderId, String customerId) {}
    record EnrichedOrder(String orderId, String customerId, String customerName, String email) {}

    // Simulated external lookup (in reality: a DB call or another service's API)
    static Map<String, String[]> customerDirectory = Map.of(
        "CUST-1", new String[]{"Pankaj Sharma", "pankaj@example.com"}
    );

    static EnrichedOrder enrich(OrderPlaced order) {
        String[] details = customerDirectory.get(order.customerId());
        return new EnrichedOrder(order.orderId(), order.customerId(), details[0], details[1]);
    }

    public static void main(String[] args) {
        OrderPlaced incoming = new OrderPlaced("ORD-500", "CUST-1");
        EnrichedOrder enriched = enrich(incoming);
        System.out.println(enriched);
    }
}
// OUTPUT:
// EnrichedOrder[orderId=ORD-500, customerId=CUST-1, customerName=Pankaj Sharma, email=pankaj@example.com]`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Trade-off: Enrich at the Producer vs a Dedicated Enricher</h3>
Enrichment could happen at the source (the producer includes everything upfront), but that couples the producer to every possible downstream consumer's needs and bloats every message even for consumers who don't need the extra data. A dedicated Content Enricher step keeps the original message lean and adds data only on the specific path(s) that need it - at the cost of an extra lookup call and its latency/failure modes.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why not have the producer just include all the data upfront?</td><td>That couples the producer to every consumer's data needs and bloats messages for consumers who don't need the extra fields</td></tr>
<tr class='text-center'><td>What's the main cost of using a Content Enricher?</td><td>An extra lookup call per message, adding latency and a new failure mode (what happens if the lookup fails or the data isn't found)</td></tr>
</table>`
              }
            ]
          },

          // ----- Splitter -----
          {
            id: 'splitter-pattern',
            name: 'Splitter Pattern',
            beginner: [
              {
                content: `<h3>What is the Splitter Pattern?</h3>
A <strong>Splitter</strong> breaks one composite message containing multiple items into several individual messages, so each item can be routed, processed, or scaled independently.<br>
<br>
<h4>Typical Example</h4>
An incoming "BulkOrder" message containing 5 line items can be split into 5 separate "OrderItem" messages, each processed independently (possibly by different competing consumers in parallel).`,
                codeExamples: [
                  `import java.util.List;
import java.util.stream.Collectors;

public class SplitterDemo {

    record BulkOrder(String orderId, List<String> items) {}
    record OrderItem(String orderId, String item) {}

    static List<OrderItem> split(BulkOrder bulk) {
        return bulk.items().stream()
            .map(item -> new OrderItem(bulk.orderId(), item))
            .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        BulkOrder bulk = new BulkOrder("ORD-9", List.of("Keyboard", "Mouse", "Monitor"));
        List<OrderItem> items = split(bulk);
        items.forEach(System.out::println);
    }
}
// OUTPUT:
// OrderItem[orderId=ORD-9, item=Keyboard]
// OrderItem[orderId=ORD-9, item=Mouse]
// OrderItem[orderId=ORD-9, item=Monitor]`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Splitter Is Usually Paired with an Aggregator</h3>
A Splitter alone loses the "this was one original request" context. In real systems, each split message typically carries a <strong>correlation ID</strong> (the original order ID here) so an Aggregator downstream can later collect all the resulting responses back into one combined result once all the split items have been processed.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the Splitter pattern's inverse?</td><td>The Aggregator pattern - Splitter breaks one message into many, Aggregator combines many back into one</td></tr>
<tr class='text-center'><td>What do you need to preserve when splitting a message?</td><td>A correlation ID linking each split piece back to the original message, so results can later be reassembled or tracked</td></tr>
</table>`
              }
            ]
          },

          // ----- Aggregator (EIP) -----
          {
            id: 'eip-aggregator-pattern',
            name: 'Aggregator Pattern (Message Aggregation)',
            beginner: [
              {
                content: `<h3>What is the (Message) Aggregator Pattern?</h3>
An <strong>Aggregator</strong> collects a series of related individual messages and combines them into one composite message once some completion condition is met (e.g. all expected pieces have arrived, or a timeout elapses). It is the direct inverse of the Splitter pattern.<br>
<br>
<h4>Completion Strategies</h4>
• <strong>Count-based</strong> - complete once N messages with the same correlation ID have arrived.<br>
• <strong>Timeout-based</strong> - complete after a fixed time window, using whatever arrived so far.<br>
• <strong>Predicate-based</strong> - complete once a custom condition on the collected messages is satisfied.<br>`,
                codeExamples: [
                  `import java.util.*;

public class AggregatorDemo {

    record OrderItem(String orderId, String item) {}

    static Map<String, List<String>> aggregate(List<OrderItem> items, int expectedCount) {
        Map<String, List<String>> byOrder = new HashMap<>();
        for (OrderItem item : items) {
            byOrder.computeIfAbsent(item.orderId(), k -> new ArrayList<>()).add(item.item());
        }
        // Only "complete" orders (count-based completion) are returned
        Map<String, List<String>> complete = new HashMap<>();
        for (var entry : byOrder.entrySet()) {
            if (entry.getValue().size() == expectedCount) {
                complete.put(entry.getKey(), entry.getValue());
            }
        }
        return complete;
    }

    public static void main(String[] args) {
        List<OrderItem> incoming = List.of(
            new OrderItem("ORD-9", "Keyboard"),
            new OrderItem("ORD-9", "Mouse"),
            new OrderItem("ORD-9", "Monitor")
        );

        Map<String, List<String>> result = aggregate(incoming, 3);
        System.out.println("ORD-9 -> " + result.get("ORD-9"));
    }
}
// OUTPUT:
// ORD-9 -> [Keyboard, Mouse, Monitor]`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Risk: Partial or Never-Complete Aggregations</h3>
If one expected piece of a correlated group never arrives (a message lost, a downstream failure), a purely count-based Aggregator will wait forever. Production implementations almost always combine a completion count/predicate WITH a timeout, so a partial (or empty) result is eventually emitted rather than holding state indefinitely - this trade-off between correctness and liveness is central to designing a real Aggregator.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Name the 3 common completion strategies for an Aggregator.</td><td>Count-based (N messages arrived), timeout-based (time window elapsed), and predicate-based (a custom condition is met)</td></tr>
<tr class='text-center'><td>What happens if a correlated message is lost and only a count-based strategy is used?</td><td>The aggregation waits forever - production systems pair a count/predicate strategy with a timeout to guarantee eventual completion</td></tr>
</table>`
              }
            ]
          },

          // ----- Idempotent Consumer -----
          {
            id: 'idempotent-consumer-pattern',
            name: 'Idempotent Consumer Pattern',
            beginner: [
              {
                content: `<h3>What is the Idempotent Consumer Pattern?</h3>
An <strong>Idempotent Consumer</strong> is a message consumer designed so that processing the same message more than once produces the same end result as processing it exactly once - with no duplicated side effects (like charging a customer twice).<br>
<br>
<h4>Why This Matters</h4>
Most message brokers offer <strong>at-least-once delivery</strong>, meaning a message can be redelivered after a crash, network blip, or consumer restart even though it was already successfully processed once. An idempotent consumer makes redelivery harmless instead of dangerous.`,
                codeExamples: [
                  `import java.util.HashSet;
import java.util.Set;

public class IdempotentConsumerDemo {

    static Set<String> processedMessageIds = new HashSet<>();
    static double accountBalance = 1000.0;

    static void processPayment(String messageId, double amount) {
        if (processedMessageIds.contains(messageId)) {
            System.out.println("Duplicate message " + messageId + " ignored - already processed");
            return;
        }
        accountBalance -= amount;
        processedMessageIds.add(messageId);
        System.out.println("Processed " + messageId + " - deducted " + amount + ", balance now " + accountBalance);
    }

    public static void main(String[] args) {
        processPayment("MSG-1", 200.0);
        processPayment("MSG-1", 200.0); // redelivered due to a network glitch
        processPayment("MSG-2", 50.0);
    }
}
// OUTPUT:
// Processed MSG-1 - deducted 200.0, balance now 800.0
// Duplicate message MSG-1 ignored - already processed
// Processed MSG-2 - deducted 50.0, balance now 750.0`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Where to Track Processed IDs</h3>
The set of "already processed" message IDs must itself be durable and consistent WITH the side effect it's guarding - if the ID is recorded in a different transaction/store than the actual business update, a crash between the two steps can still let a duplicate slip through. The reliable approach is recording the processed-ID check and the business state change in the <strong>same database transaction</strong> (or using a natural idempotency key already present in the data, like a unique order ID, instead of a separate tracking table). This ties directly into the Outbox pattern used on the producing side of the same problem.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why would a message ever be delivered twice?</td><td>Most brokers guarantee at-least-once delivery - redelivery can happen after a crash, timeout, or consumer restart even if the message was already processed</td></tr>
<tr class='text-center'><td>What's the risk of tracking processed-message IDs in a separate store from the business data?</td><td>A crash between updating the two stores can leave them inconsistent, letting a duplicate slip through - they should be updated in the same transaction</td></tr>
<tr class='text-center'><td>Give a real-world idempotency key example.</td><td>A unique order ID or a client-generated request ID (idempotency key) sent with a payment request, so retries of the same request are recognized as duplicates</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],

    cheatNotes: [
      'Message Router - decides destination based on content/headers, decoupling sender from receiver',
      'Message Filter - drops non-matching messages instead of routing them',
      'Message Translator - converts between two systems\' message formats/schemas',
      'Content Enricher - adds missing data to a message via an external lookup before forwarding',
      'Splitter - breaks one composite message into many individual messages',
      'Aggregator - the inverse of Splitter, combines related messages into one composite result',
      'Idempotent Consumer - safely handles duplicate/redelivered messages with no duplicated side effects',
      'Idempotency keys should be checked/recorded in the same transaction as the business state change'
    ],

    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What is the difference between a Message Router and a Message Filter?',
          'When would you use a Message Translator instead of having both systems agree on one schema?',
          'What is a Content Enricher and what is its main trade-off?',
          'Explain the Splitter and Aggregator patterns and how they relate to each other.',
          'What completion strategies can an Aggregator use, and what happens if a message never arrives?',
          'Why is at-least-once delivery a problem for consumers, and how does the Idempotent Consumer pattern solve it?',
          'Where should you store the "already processed" tracking data for an idempotent consumer, and why?',
          'What is an anti-corruption layer and how does it relate to the Message Translator pattern?',
          'Give a real framework/tool that implements content-based routing.',
          'How would you correlate split messages back together after processing?'
        ]
      }
    ]
  }
];
