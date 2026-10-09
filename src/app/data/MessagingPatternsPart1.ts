// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const messagingPatternsPart1: Course[] = [
  {
    id: 'messaging-patterns-1',
    name: 'Integration & Messaging Patterns',
    icon: 'MessageSquare',
    subTopics: [
      {
        id: 'messaging-patterns-core',
        name: 'Core Messaging Patterns',
        topics: [

          // ----- Message Broker -----
          {
            id: 'message-broker-pattern',
            name: 'Message Broker Pattern',
            beginner: [
              {
                content: `<h3>What is the Message Broker Pattern?</h3>
A <strong>Message Broker</strong> is an intermediary component that sits between producers (senders) and consumers (receivers) of messages. Instead of services calling each other directly, they send messages to the broker, which is responsible for routing, storing, and delivering those messages to the right destination.<br>
<br>
<h4>Why Use a Broker Instead of Direct Calls?</h4>
• <strong>Decoupling</strong> - the producer doesn't need to know who the consumer is, where it runs, or whether it's even online right now.<br>
• <strong>Buffering</strong> - if the consumer is slow or temporarily down, messages just wait in the broker instead of the producer's call failing.<br>
• <strong>Fan-out</strong> - one message can be routed to multiple consumers without the producer doing anything extra.<br>
<br>
<h4>Real-World Brokers</h4>
• <strong>RabbitMQ</strong> - a traditional message broker implementing AMQP, strong routing capabilities.<br>
• <strong>Apache Kafka</strong> - a distributed event-streaming platform, often used as a high-throughput broker/log.<br>
• <strong>ActiveMQ</strong> - a JMS-compliant broker, common in Java EE / Spring environments.<br>`
              },
              {
                content: `<h4>A Simple Mental Model</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Producer ---> [ Message Broker ] ---> Consumer A
                     |
                     +--------------> Consumer B</pre>
The producer publishes a message once; the broker takes care of getting it to one or many consumers, depending on how the destination (queue or topic) is configured.<br>
<br>
Illustrative Spring/JMS-style code showing how an application talks to a broker (conceptual - actual output depends on a running broker instance, not shown here):`,
                codeExamples: [
                  `// Illustrative: sending a message through a broker using Spring's JmsTemplate
@Service
public class OrderNotifier {

    private final JmsTemplate jmsTemplate;

    public OrderNotifier(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public void notifyOrderPlaced(String orderId) {
        // The broker (e.g. ActiveMQ/RabbitMQ) receives this and
        // routes it to whichever consumer(s) are listening on "order.events"
        jmsTemplate.convertAndSend("order.events", "Order placed: " + orderId);
    }
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Broker vs Brokerless (Direct) Messaging</h3>
Not all messaging needs a broker - some systems use "brokerless" messaging (e.g. ZeroMQ) where the endpoints talk more directly. A broker adds an extra hop and potential bottleneck/single-point-of-failure, but in exchange gives you durability, routing logic, monitoring, and easier scaling of consumers. Most enterprise Java systems use a broker because the operational benefits outweigh the added latency.<br>
<br>
<h4>Common Broker Responsibilities</h4>
• <strong>Routing</strong> - deciding which queue/topic a message goes to, sometimes based on message headers/content.<br>
• <strong>Persistence</strong> - optionally writing messages to disk so they survive a broker restart.<br>
• <strong>Acknowledgement tracking</strong> - knowing whether a consumer successfully processed a message before removing it.<br>
• <strong>Dead-lettering</strong> - moving repeatedly-failing messages aside (see the dedicated Dead Letter Channel pattern).<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does a message broker solve?</td><td>It decouples producers and consumers so they don't need to know about each other or be online at the same time</td></tr>
<tr class='text-center'><td>Name two popular message brokers used with Java</td><td>RabbitMQ and Apache Kafka (also ActiveMQ, a JMS-compliant broker)</td></tr>
<tr class='text-center'><td>What is the tradeoff of adding a broker?</td><td>Extra network hop / latency and an additional piece of infrastructure to run and monitor, in exchange for decoupling, buffering, and easier scaling</td></tr>
</table>`
              }
            ]
          },

          // ----- Message Queue -----
          {
            id: 'message-queue-pattern',
            name: 'Message Queue Pattern',
            beginner: [
              {
                content: `<h3>What is the Message Queue Pattern?</h3>
A <strong>Message Queue</strong> is a store-and-forward channel that holds messages in (roughly) the order they arrive, until a consumer is ready to process them. It models a <strong>one-to-one logical relationship</strong>: even if several consumer instances are listening, each individual message is delivered to and processed by exactly one of them.<br>
<br>
<h4>Why It's Useful</h4>
• The producer never blocks waiting for the consumer to be ready.<br>
• Bursts of traffic get smoothed out - the queue simply grows temporarily instead of overwhelming the consumer.<br>
• If the consumer crashes mid-processing, an unacknowledged message can be redelivered.<br>`
              },
              {
                content: `<h4>JMS Queue Example (Illustrative)</h4>
A JMS <code>Queue</code> destination is the classic Java example of this pattern - each message put on the queue is picked up by only one consumer, even if multiple consumers are listening:`,
                codeExamples: [
                  `// Illustrative JMS-style producer and consumer using a Queue destination
// (requires a running broker; shown for structure, not runnable output)

// Producer
MessageProducer producer = session.createProducer(orderQueue);
TextMessage message = session.createTextMessage("Order #1042");
producer.send(message);

// Consumer (only ONE consumer instance gets this specific message,
// even if 3 consumer instances are all listening on orderQueue)
MessageConsumer consumer = session.createConsumer(orderQueue);
consumer.setMessageListener(msg -> {
    TextMessage tm = (TextMessage) msg;
    System.out.println("Processing: " + tm.getText());
});`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Queue vs Topic</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Queue</th><th>Topic</th></tr>
<tr class='text-center'><td>Delivery model</td><td>Point-to-point - one consumer gets each message</td><td>Publish/Subscribe - every subscriber gets a copy</td></tr>
<tr class='text-center'><td>Multiple consumers</td><td>Compete for messages (load balancing)</td><td>Each receives every message independently</td></tr>
<tr class='text-center'><td>Typical use</td><td>Work distribution (task processing)</td><td>Event broadcasting/notifications</td></tr>
</table>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>If 3 consumers listen on the same queue, how many of them process a given message?</td><td>Exactly one - queues implement point-to-point delivery, not broadcast</td></tr>
<tr class='text-center'><td>What happens to a message if no consumer is currently listening?</td><td>It waits in the queue (store-and-forward) until a consumer becomes available, assuming the queue is durable/persistent</td></tr>
</table>`
              }
            ]
          },

          // ----- Publish/Subscribe -----
          {
            id: 'pub-sub-pattern',
            name: 'Publish/Subscribe Pattern',
            beginner: [
              {
                content: `<h3>What is Publish/Subscribe?</h3>
In <strong>Publish/Subscribe (Pub/Sub)</strong>, a publisher sends a message to a named channel (a "topic"), and <strong>every</strong> subscriber currently listening on that topic receives its own copy of the message. This is the direct opposite of a queue's one-consumer-per-message behavior.<br>
<br>
<h4>Where It's Used</h4>
• Broadcasting an event (e.g. "OrderShipped") to multiple independent interested services (billing, notifications, analytics) without the publisher knowing or caring who's listening.<br>
• Kafka topics and JMS <code>Topic</code> destinations are both real implementations of this pattern.<br>`
              },
              {
                content: `<h4>JMS Topic Example (Illustrative)</h4>`,
                codeExamples: [
                  `// Illustrative - one publish, multiple independent subscribers each get a copy
MessageProducer publisher = session.createProducer(orderEventsTopic);
publisher.send(session.createTextMessage("OrderShipped:1042"));

// Subscriber 1 (billing service) - receives its own copy
// Subscriber 2 (notification service) - also receives its own copy
// Subscriber 3 (analytics service) - also receives its own copy
// All three run independently, unaware of each other`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Durable vs Non-Durable Subscriptions</h3>
A key nuance: if a subscriber is offline when a message is published, does it miss the message forever, or get it when it reconnects?<br>
<br>
• <strong>Non-durable subscription</strong> - the subscriber only receives messages published while it's actively connected; anything published while it's offline is lost to that subscriber.<br>
• <strong>Durable subscription</strong> - the broker remembers the subscriber's identity and retains messages for it even while disconnected, delivering them once it reconnects.<br>
Kafka's consumer-group offset tracking achieves a similar durability effect by persisting "how far" each consumer group has read.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many subscribers receive a published message?</td><td>All subscribers currently subscribed to that topic each get their own independent copy</td></tr>
<tr class='text-center'><td>What's the risk of a non-durable subscription?</td><td>Messages published while the subscriber is disconnected are lost to it - it only sees messages published while actively connected</td></tr>
</table>`
              }
            ]
          },

          // ----- Point-to-Point -----
          {
            id: 'point-to-point-pattern',
            name: 'Point-to-Point Pattern',
            beginner: [
              {
                content: `<h3>What is Point-to-Point Messaging?</h3>
<strong>Point-to-Point</strong> describes a channel where, even with many producers and many consumers attached, each individual message is consumed by exactly one recipient. It's the formal name for the delivery semantics that a Message Queue provides - the two terms are closely related, and "point-to-point channel" is often used interchangeably with "queue".<br>
<br>
<h4>Why Call It Out Separately From "Queue"?</h4>
"Queue" refers to the physical/logical destination object; "Point-to-Point" refers to the <strong>delivery guarantee</strong> that destination provides. The distinction matters because some systems (like Kafka) don't have a literal "Queue" object, but you can still achieve point-to-point-style delivery using a single-partition topic with one consumer in a consumer group.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Achieving Point-to-Point Semantics Without a Literal Queue</h3>
Kafka is fundamentally a publish/subscribe log, but you can get point-to-point-style "only one consumer processes this message" behavior by putting all consumer instances into the <strong>same consumer group</strong> - Kafka guarantees each partition is read by only one consumer within a group, effectively load-balancing messages across the group members the way a queue would.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is "Point-to-Point" a different technology than a Queue?</td><td>No - it's the name for the one-consumer-per-message delivery semantic that queues implement; the terms are usually used interchangeably</td></tr>
<tr class='text-center'><td>How can Kafka, which has no literal Queue object, still achieve point-to-point delivery?</td><td>By putting all consumer instances in the same consumer group - Kafka ensures only one consumer in a group reads a given partition's messages</td></tr>
</table>`
              }
            ]
          },

          // ----- Request/Reply -----
          {
            id: 'request-reply-pattern',
            name: 'Request/Reply Pattern',
            beginner: [
              {
                content: `<h3>What is Request/Reply?</h3>
<strong>Request/Reply</strong> (also called Request-Response messaging) is how you get a synchronous-feeling response over an inherently asynchronous messaging channel. The requester sends a message on a "request" channel and also tells the responder where to send the answer; the responder processes the request and publishes a reply message back to that address.<br>
<br>
<h4>The Two Pieces That Make It Work</h4>
• <strong>ReplyTo address</strong> - the requester includes the destination it wants the reply sent to (often a temporary, per-request queue).<br>
• <strong>Correlation ID</strong> - a unique ID attached to the request, echoed back in the reply, so the requester can match a reply to the original request even if multiple requests are in flight at once.<br>`
              },
              {
                content: `<h4>Illustrative JMS-Style Example</h4>`,
                codeExamples: [
                  `// Illustrative - requester side
TextMessage request = session.createTextMessage("GetOrderStatus:1042");
request.setJMSReplyTo(tempReplyQueue);
request.setJMSCorrelationID("req-abc-123");
producer.send(request);

// ... later, listening on tempReplyQueue ...
// a reply arrives whose JMSCorrelationID also equals "req-abc-123",
// letting the requester match it to the original call

// Responder side
Message received = consumer.receive();
String correlationId = received.getJMSCorrelationID();
Destination replyTo = received.getJMSReplyTo();

TextMessage reply = session.createTextMessage("Status: SHIPPED");
reply.setJMSCorrelationID(correlationId);
replyProducer.send(replyTo, reply);`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What two pieces of information make Request/Reply messaging work?</td><td>A ReplyTo address (where to send the answer) and a Correlation ID (to match the reply back to the original request)</td></tr>
<tr class='text-center'><td>Why is a correlation ID needed if there's already a dedicated reply queue?</td><td>Multiple requests can be in flight on the same reply channel at once, so the ID is needed to tell which reply answers which request</td></tr>
</table>`
              }
            ]
          },

          // ----- Competing Consumers -----
          {
            id: 'competing-consumers-pattern',
            name: 'Competing Consumers Pattern',
            beginner: [
              {
                content: `<h3>What is the Competing Consumers Pattern?</h3>
<strong>Competing Consumers</strong> means running multiple instances of the same consumer, all listening on the same queue, so they collectively "compete" for the incoming messages and process them in parallel. It's the standard way to scale message processing throughput horizontally.<br>
<br>
<h4>Why It Works Well</h4>
• Each message goes to only one consumer (point-to-point), so there is no broadcast fan-out. That is NOT the same as no duplicate PROCESSING: under the at-least-once delivery real brokers provide, a consumer crash or ack timeout redelivers an already-processed message, so consumers must still be idempotent.<br>
• Adding more consumer instances directly increases how fast the backlog drains - no code changes needed, just scale out.<br>
• If one consumer instance crashes mid-message, that message can be redelivered to a surviving instance.<br>`
              },
              {
                content: `<h4>Mental Model</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                +----> Consumer Instance 1
                |
Queue  ---------+----> Consumer Instance 2
                |
                +----> Consumer Instance 3</pre>
Each message goes to exactly ONE of the three instances - they compete for work, they don't all process every message.`
              }
            ],
            expert: [
              {
                content: `<h3>Ordering Trade-off</h3>
Competing Consumers trades strict message ordering for throughput: if message A and message B are picked up by two different consumer instances at the same time, there's no guarantee B is fully processed after A, even though A was enqueued first. Systems that need both scaling AND strict per-key ordering (like Kafka) solve this by partitioning - messages for the same key always go to the same partition, which is read by only one consumer, preserving order within that key while still parallelizing across keys.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the simplest way to increase message-processing throughput with Competing Consumers?</td><td>Run more instances of the consumer - they automatically share the incoming workload since each message still goes to only one instance</td></tr>
<tr class='text-center'><td>What ordering guarantee is lost with Competing Consumers?</td><td>Global message order isn't guaranteed across instances - two messages can be processed out of enqueue order by different consumers running in parallel</td></tr>
</table>`
              }
            ]
          },

          // ----- Dead Letter Channel -----
          {
            id: 'dead-letter-channel-pattern',
            name: 'Dead Letter Channel Pattern',
            beginner: [
              {
                content: `<h3>What is a Dead Letter Channel?</h3>
A <strong>Dead Letter Channel (DLC)</strong>, or dead letter queue (DLQ), is a separate destination that a broker routes a message to after it has repeatedly failed to be processed successfully (or expired, or was rejected). Instead of retrying forever or silently dropping the message, it gets "parked" somewhere a human or a separate process can inspect it.<br>
<br>
<h4>Why You Need One</h4>
• Without a DLQ, a "poison message" (one that always causes the consumer to throw) can get redelivered endlessly, wasting resources and possibly blocking the rest of the queue.<br>
• With a DLQ, that message is moved aside after N failed attempts, and the rest of the queue keeps flowing normally.<br>
• It gives you a place to inspect, debug, and potentially replay the failed message later.<br>`
              },
              {
                content: `<h4>Illustrative Configuration Idea</h4>`,
                codeExamples: [
                  `// Illustrative Spring/JMS-style consumer with a retry-then-dead-letter pattern
@JmsListener(destination = "order.events")
public void handleOrderEvent(String message) {
    try {
        processOrder(message);
    } catch (Exception e) {
        // After the broker's configured max-redelivery-attempts is exceeded,
        // the broker automatically routes this message to "order.events.DLQ"
        // instead of redelivering it forever.
        throw e;
    }
}

@JmsListener(destination = "order.events.DLQ")
public void handleDeadLetteredOrder(String message) {
    log.error("Order event moved to DLQ after repeated failures: {}", message);
    // alert an operator, store for manual replay, etc.
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does a Dead Letter Channel solve?</td><td>It prevents a repeatedly-failing "poison message" from being redelivered forever or silently lost, by parking it in a separate queue for inspection after a set number of failed attempts</td></tr>
<tr class='text-center'><td>What typically triggers a message being dead-lettered?</td><td>Exceeding a configured max redelivery/retry count, message expiry (TTL), or explicit consumer rejection</td></tr>
</table>`
              }
            ]
          }
        ]
      }
    ],
    cheatNotes: [
      'Message Broker - intermediary that routes/delivers messages, decoupling producers from consumers',
      'Message Queue - point-to-point: each message goes to exactly one consumer',
      'Publish/Subscribe - broadcast: every subscriber gets its own copy of the message',
      'Point-to-Point - the delivery semantic (one consumer per message) that queues implement',
      'Request/Reply - async request-response using a ReplyTo address + Correlation ID',
      'Competing Consumers - multiple consumer instances on one queue to scale throughput in parallel',
      'Dead Letter Channel - parks repeatedly-failing messages aside instead of retrying forever or dropping them'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What is the difference between a message queue and a message broker?',
          'Explain the difference between Point-to-Point and Publish/Subscribe messaging models.',
          'How does Request/Reply work over an asynchronous messaging channel?',
          'What is a Correlation ID used for in messaging systems?',
          'How does the Competing Consumers pattern help you scale message processing?',
          'What ordering guarantee do you lose when scaling with Competing Consumers, and how does Kafka partitioning address it?',
          'What is a Dead Letter Queue and why is it necessary?',
          'What is a "poison message" and how does a Dead Letter Channel protect the rest of the queue from it?',
          'What is the difference between a durable and a non-durable subscription in Pub/Sub?',
          'Name two real-world message brokers used in Java systems and briefly describe each.'
        ]
      }
    ]
  }
];
