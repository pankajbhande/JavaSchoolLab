import { Topic } from '../coreJava';

export const springBootKafka: Topic = {
    id: 'spring-boot-kafka',
    name: 'Messaging with Apache Kafka',
    beginner: [
        {
            content: `<h3>What is Kafka?</h3>
<div class="border">
• Apache Kafka is a <strong>distributed messaging system</strong>: one application sends updates, another application receives them, and neither has to know the other exists.<br>
• The two sides never talk to each other directly. Everything goes through the <strong>Kafka broker</strong>, which stores the messages.<br>
• Because the broker stores messages, the receiver may be down when the message is sent and still read it later. That is the whole point.<br>
</div><br>

<h3>Business requirement</h3>
On an online shopping site a user buys a product. The order details must reach a second system - billing, warehouse, notifications - without the shopping site waiting for it, and without losing the order if that second system is restarting.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   User            System 1                  Kafka                 System 2
                  (Producer)                (Broker)              (Consumer)
    |                  |                        |                      |
    |---- buys ------->|                        |                      |
    |                  |---- send(order) ------>|                      |
    |&lt;--- "ordered" ---|                        |  (message stored)    |
    |                  |                        |                      |
    |                  |                        |&lt;---- read(order) -----|
    |                  |                        |                      |

System 1 replies to the user immediately. It never waits for System 2.</pre>
<br>

<h3>The vocabulary</h3>
<table>
<tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Kafka Broker</td><td>The Kafka server itself. It receives messages from producers, stores them on disk, and serves them to consumers. Producers and consumers only ever speak to a broker.</td></tr>
<tr><td>Kafka Cluster</td><td>A set of brokers working together. Data is spread across them so that one machine failing does not lose the data.</td></tr>
<tr><td>Producer</td><td>The application that sends data. A producer cannot send data directly to a consumer.</td></tr>
<tr><td>Consumer</td><td>The application that reads messages from the broker. A consumer cannot read directly from a producer.</td></tr>
<tr><td>Topic</td><td>The named category the data belongs to - roughly what a table is in a database or a folder is on disk. Producers write to a topic, consumers subscribe to a topic.</td></tr>
<tr><td>Partition</td><td>A topic is split into partitions. Each partition is an ordered, append-only sequence of records that never changes once written.</td></tr>
<tr><td>Offset</td><td>The sequence number given to a message as it lands in a partition. Offsets start at zero and only ever go up within that partition.</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                       Kafka Broker
                 +--------------------------------+
                 |  Topic: "customer"             |
   Producer      |                                |     Consumer
      |          |  Partition 0 [0][1][2][3][4]   |         |
      |--send--->|  Partition 1 [0][1][2]         |--read-->|
                 |  Partition 2 [0][1][2][3]      |
                 +--------------------------------+
                                ^
                                |
                   offsets: 0,1,2,... per partition,
                   NOT one number across the whole topic</pre>
<br>
<strong>Note:</strong> the broker stores the messages for the topic. Reading a message does not delete it - it stays until the retention period expires. That is what separates Kafka from a traditional queue.<br>`
        },
        {
            content: `<h3>Installing and starting Kafka on Windows</h3>
The walkthrough uses a local install so you can see the servers running. If you would rather not install anything, Docker or Testcontainers will give you the same broker in one command.<br><br>

<div class="border">
1. Download the binary <code>.tgz</code> from <code>https://kafka.apache.org/</code> (QuickStart &rarr; Download).<br>
2. Extract it, move the <code>kafka_2.13-3.4.0</code> folder to <code>C:\\kafka</code>.<br>
3. In <code>config/server.properties</code> set <code>log.dirs</code> to a real path, for example <code>c:/kafka/kafka-logs</code>.<br>
4. In <code>config/zookeeper.properties</code> set <code>dataDir</code> to <code>c:/kafka/zookeeper-data</code>.<br>
5. Start ZooKeeper first, then the broker - in two separate command windows, and leave both open.<br>
</div><br>

<strong>Important:</strong> two servers must be running before either Spring Boot application starts. Start ZooKeeper, wait for it to bind, then start the broker. If you start the broker first it exits with <code>ConnectException: Connection refused</code> while trying to reach ZooKeeper on port 2181.<br><br>

<strong>ZooKeeper is on the way out.</strong> From Kafka 3.3 the <strong>KRaft mode</strong> (Kafka Raft metadata) is production-ready and Kafka 4.0 removes ZooKeeper entirely. On a modern install you format a storage directory once and start a single process. The ZooKeeper steps below are what the classroom material uses and what you will still meet on older clusters.<br>`,
            codeExamples: [
                `REM ---- window 1 : start ZooKeeper (older, ZooKeeper-based Kafka) ----
cd C:\\kafka\\kafka_2.13-3.4.0
.\\bin\\windows\\zookeeper-server-start.bat .\\config\\zookeeper.properties

REM OUTPUT (tail):
REM [2024-05-11 10:02:14,884] INFO Reading configuration from: .\\config\\zookeeper.properties
REM [2024-05-11 10:02:15,102] INFO binding to port 0.0.0.0/0.0.0.0:2181
REM ZooKeeper is now listening. Leave this window open.`,
                `REM ---- window 2 : start the Kafka broker ----
cd C:\\kafka\\kafka_2.13-3.4.0
.\\bin\\windows\\kafka-server-start.bat .\\config\\server.properties

REM OUTPUT (tail):
REM [2024-05-11 10:03:41,556] INFO Awaiting socket connections on 0.0.0.0:9092
REM [2024-05-11 10:03:42,118] INFO [KafkaServer id=0] started (kafka.server.KafkaServer)
REM The broker is up on localhost:9092.

REM COMMON MISTAKE: starting this window first.
REM   ERROR Fatal error during KafkaServer startup ... Timed out waiting
REM   for connection while in state: CONNECTING (org.apache.zookeeper...)
REM ZooKeeper must be running before the broker.`,
                `REM ---- useful broker commands (run from the same folder) ----

REM create the topic explicitly instead of relying on auto-creation
.\\bin\\windows\\kafka-topics.bat --create --topic customer ^
    --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
REM OUTPUT: Created topic customer.

REM list topics
.\\bin\\windows\\kafka-topics.bat --list --bootstrap-server localhost:9092
REM OUTPUT:
REM __consumer_offsets
REM customer

REM read a topic from the beginning without writing any Java
.\\bin\\windows\\kafka-console-consumer.bat --topic customer ^
    --from-beginning --bootstrap-server localhost:9092
REM OUTPUT:
REM {"customerId":101,"customerName":"ram","customerEmail":"ram@gmail.com"}
REM {"customerId":102,"customerName":"ajay","customerEmail":"ajay@gmail.com"}

REM how far behind is the consumer group?
.\\bin\\windows\\kafka-consumer-groups.bat --bootstrap-server localhost:9092 ^
    --describe --group group_customer
REM OUTPUT:
REM GROUP           TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
REM group_customer  customer  0          3               3               0
REM group_customer  customer  1          1               1               0
REM group_customer  customer  2          2               2               0`,
                `REM ---- modern equivalent, KRaft mode, no ZooKeeper (Kafka 3.3+) ----
.\\bin\\windows\\kafka-storage.bat random-uuid
REM OUTPUT: 9v1sYt9lQ2mBk0oCk-Cw2A

.\\bin\\windows\\kafka-storage.bat format -t 9v1sYt9lQ2mBk0oCk-Cw2A ^
    -c .\\config\\kraft\\server.properties
.\\bin\\windows\\kafka-server-start.bat .\\config\\kraft\\server.properties
REM One process instead of two. Kafka 4.0 removed ZooKeeper support entirely.`
            ]
        },
        {
            content: `<h3>Problem statement</h3>
Build two Spring Boot applications. The <strong>producer</strong> exposes a REST endpoint that accepts a list of customers and publishes each one to a Kafka topic. The <strong>consumer</strong> is a separate application that listens on the same topic and prints every customer it receives.<br><br>

<h3>Steps</h3>
<div class="border">
<strong>Producer project</strong><br>
1. Create the Spring Boot Maven project &nbsp; 2. Add the dependencies &nbsp; 3. Model class <code>Customer</code><br>
4. <code>CustomerService</code> &nbsp; 5. <code>KafkaProducerController</code> &nbsp; 6. <code>KafkaProducerConfig</code><br>
7. <code>KafkaConstants</code> &nbsp; 8. application.properties &nbsp; 9. Run &nbsp; 10. Postman<br><br>
<strong>Consumer project</strong><br>
11-13. New project and dependencies &nbsp; 14. Model class &nbsp; 15. <code>CustomerService</code> with <code>@KafkaListener</code><br>
16. <code>KafkaListenerConfig</code> &nbsp; 17. <code>KafkaConstants</code> &nbsp; 18. application.properties &nbsp; 19. Run
</div><br>

Both projects need <code>spring-kafka</code>. It is managed by the Spring Boot BOM, so do not put a <code>&lt;version&gt;</code> on it - the version that matches your Boot release is chosen for you.<br>`,
            codeExamples: [
                `<!-- Step 2 / Step 13 - pom.xml, identical in both projects -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- The PDF also adds org.apache.kafka:kafka-streams here.
     Nothing in this project uses the Streams API - it only pulls in
     RocksDB and about 20 MB of jars. Leave it out unless you are
     actually writing a KStream topology. -->`,
                `// Step 3 / Step 14 - Customer.java (SAME class in both projects)
package com.velocity.model;

public class Customer {

    private int customerId;
    private String customerName;
    private String customerEmail;

    // The PDF declares ONLY the three-argument constructor.
    // Jackson needs a no-argument constructor to rebuild the object on the
    // consumer side. Without it the listener never fires and the log shows:
    //   com.fasterxml.jackson.databind.exc.MismatchedInputException:
    //   Cannot construct instance of 'com.velocity.model.Customer'
    //   (no Creators, like default constructor, exist)
    public Customer() {
    }

    public Customer(int customerId, String customerName, String customerEmail) {
        super();
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
    }

    public int getCustomerId() { return customerId; }
    public void setCustomerId(int customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    // The PDF prints a Customer with System.out.println("data>>>" + c) but
    // never overrides toString(), so the console shows
    //   data>>>com.velocity.model.Customer@1b6d3586
    // Add toString() and the log becomes readable.
    @Override
    public String toString() {
        return "Customer [customerId=" + customerId
             + ", customerName=" + customerName
             + ", customerEmail=" + customerEmail + "]";
    }
}`,
                `// Step 7 / Step 17 - KafkaConstants.java (same in both projects)
package com.velocity.util;

public class KafkaConstants {

    public static final String TOPIC    = "customer";
    public static final String GROUP_ID = "group_customer";
    public static final String HOST     = "localhost:9092";

    private KafkaConstants() {
        // constants holder - never instantiated
    }
}
// These must be compile-time constants (static final String) because
// @KafkaListener(topics = ..., groupId = ...) is an annotation attribute.
// A non-constant expression there is a compile error:
//   "element value must be a constant expression".`
            ]
        },
        {
            content: `<h3>Producer - service, controller and configuration</h3>
<code>KafkaTemplate</code> is the producer-side entry point. <code>send(topic, payload)</code> serialises the object, picks a partition and hands it to the broker. It returns immediately - the send is asynchronous.<br><br>

<strong>What the configuration class does:</strong> it builds a <code>ProducerFactory</code> with three settings - where the broker is, how to serialise the key, and how to serialise the value - and wraps it in a <code>KafkaTemplate</code>. With Spring Boot you can drop the whole class and put the same three values in <code>application.properties</code>; the auto-configuration builds the template for you. The explicit class is shown here because it makes the moving parts visible.<br>`,
            codeExamples: [
                `// Step 4 - CustomerService.java (producer side)
package com.velocity.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.velocity.model.Customer;
import com.velocity.util.KafkaConstants;

@Service
public class CustomerService {

    private static final Logger LOG = LoggerFactory.getLogger(CustomerService.class);

    @Autowired
    private KafkaTemplate<String, Customer> kafkaTemplate;

    public String addCustomer(List<Customer> customers) {
        if (customers == null || customers.isEmpty()) {
            return "No customer received - nothing published";
        }
        for (Customer c : customers) {
            // Passing a KEY (here the customer id) is what guarantees that
            // every message for one customer lands in the SAME partition and
            // is therefore read in order. send(topic, value) with no key
            // spreads the records over all partitions and you lose ordering.
            kafkaTemplate.send(KafkaConstants.TOPIC,
                               String.valueOf(c.getCustomerId()), c);
            LOG.info("Message published to Kafka topic {} : {}",
                     KafkaConstants.TOPIC, c);
        }
        return "Customer record added to Kafka queue successfully";
    }
}
// OUTPUT (producer console):
// INFO  c.v.service.CustomerService : Message published to Kafka topic customer :
//       Customer [customerId=101, customerName=ram, customerEmail=ram@gmail.com]
// INFO  c.v.service.CustomerService : Message published to Kafka topic customer :
//       Customer [customerId=102, customerName=ajay, customerEmail=ajay@gmail.com]
// INFO  c.v.service.CustomerService : Message published to Kafka topic customer :
//       Customer [customerId=103, customerName=vikas, customerEmail=vikas@gmail.com]`,
                `// Step 5 - KafkaProducerController.java
package com.velocity.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.model.Customer;
import com.velocity.service.CustomerService;

@RestController
public class KafkaProducerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/getAll")
    public List<Customer> getAll() {
        List<Customer> list = new ArrayList<>();
        list.add(new Customer(101, "ram",   "ram@gmail.com"));
        list.add(new Customer(102, "ajay",  "ajay@gmail.com"));
        list.add(new Customer(103, "vikas", "vikas@gmail.com"));
        return list;
    }

    @PostMapping("/addCustomer")
    public String addCustomer(@RequestBody List<Customer> customers) {
        // The PDF creates a throw-away Customer(105, "anandrao", ...) here and
        // prints it. It is never sent and never used - remove it, it only
        // makes students think a fourth record is being published.
        return customerService.addCustomer(customers);
    }
}`,
                `// Step 6 - KafkaProducerConfig.java
package com.velocity.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import com.velocity.model.Customer;
import com.velocity.util.KafkaConstants;

@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, Customer> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, KafkaConstants.HOST);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // The PDF writes: return new DefaultKafkaProducerFactory(configProps);
        // That is a RAW type. It compiles with an unchecked warning and then
        // silently defeats the <String, Customer> guarantee. Use the diamond.
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Customer> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
// The @Bean(name = "kafkaTemplate") in the PDF is redundant - the bean name
// already defaults to the method name.`,
                `# Step 8 - application.properties (PRODUCER project)
server.port=9090

# Everything the config class above does can be expressed here instead.
# If you keep these lines AND the @Configuration class, the explicit
# @Bean wins and these are ignored - pick one approach, not both.
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer

# Durability. acks=all means the leader waits for the in-sync replicas
# before acknowledging. The default in modern clients is already all.
spring.kafka.producer.acks=all
spring.kafka.producer.properties.enable.idempotence=true`
            ]
        },
        {
            content: `<h3>Postman - request and response</h3>
Start ZooKeeper, then the broker, then the producer application. The producer runs on port 9090.<br><br>

<div class="border">
Method: <code>POST</code><br>
URL: <code>http://localhost:9090/addCustomer</code><br>
Body: <code>raw</code> &rarr; <code>JSON</code><br>
Header: <code>Content-Type: application/json</code>
</div><br>

<code>GET http://localhost:9090/getAll</code> returns the same three customers as JSON, which is a convenient way to copy a valid request body.<br>`,
            codeExamples: [
                `// REQUEST - POST http://localhost:9090/addCustomer
[
  { "customerId": 101, "customerName": "ram",   "customerEmail": "ram@gmail.com" },
  { "customerId": 102, "customerName": "ajay",  "customerEmail": "ajay@gmail.com" },
  { "customerId": 103, "customerName": "vikas", "customerEmail": "vikas@gmail.com" }
]

// RESPONSE - 200 OK
Customer record added to Kafka queue successfully

// If you forget the Content-Type header:
// 415 Unsupported Media Type
// {"status":415,"error":"Unsupported Media Type",
//  "path":"/addCustomer"}`
            ]
        },
        {
            content: `<h3>Consumer - the listener and its configuration</h3>
<code>@KafkaListener</code> marks a method as the destination for a topic. Spring starts a container that polls the broker in a background thread and calls your method once per record. You never write a poll loop.<br><br>

<strong>The consumer group matters more than it looks.</strong> All instances that share a <code>groupId</code> divide the partitions between them - each partition is read by exactly one member. Give a second application a <em>different</em> groupId and it gets its own independent copy of every message.<br><br>

<strong>Trusted packages:</strong> <code>JsonDeserializer</code> refuses to instantiate arbitrary classes named in an incoming message - that would be a remote-code-execution hole. You must tell it which packages are safe.<br>`,
            codeExamples: [
                `// Step 15 - CustomerService.java (consumer side)
package com.velocity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.velocity.model.Customer;
import com.velocity.util.KafkaConstants;

@Service
public class CustomerService {

    private static final Logger LOG = LoggerFactory.getLogger(CustomerService.class);

    // consumes messages from the kafka topic
    @KafkaListener(topics = KafkaConstants.TOPIC, groupId = KafkaConstants.GROUP_ID)
    public void listener(Customer c) {
        LOG.info("Message received from Kafka topic >>> {}", c);
        // Business work goes here - persist it, call another service, ...
    }
}
// The PDF declares "public Customer listener(Customer c)" and returns c.
// A return value from a @KafkaListener is not a no-op: Spring treats it as a
// REPLY and tries to send it to the reply topic named in the KafkaHeaders.REPLY_TOPIC
// header. With no such header it is dropped, but the signature misleads.
// A plain listener should return void.

// OUTPUT (consumer console):
// INFO  o.a.k.c.c.i.ConsumerCoordinator : [Consumer clientId=consumer-group_customer-1,
//       groupId=group_customer] Successfully joined group with generation 1
// INFO  o.a.k.c.c.i.ConsumerCoordinator : Adding newly assigned partitions:
//       customer-0, customer-1, customer-2
// INFO  c.v.service.CustomerService : Message received from Kafka topic >>>
//       Customer [customerId=101, customerName=ram, customerEmail=ram@gmail.com]
// INFO  c.v.service.CustomerService : Message received from Kafka topic >>>
//       Customer [customerId=102, customerName=ajay, customerEmail=ajay@gmail.com]
// INFO  c.v.service.CustomerService : Message received from Kafka topic >>>
//       Customer [customerId=103, customerName=vikas, customerEmail=vikas@gmail.com]`,
                `// Step 16 - KafkaListenerConfig.java
package com.velocity.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import com.velocity.model.Customer;
import com.velocity.util.KafkaConstants;

@Configuration
@EnableKafka
public class KafkaListenerConfig {

    @Bean
    public ConsumerFactory<String, Customer> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, KafkaConstants.HOST);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, KafkaConstants.GROUP_ID);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        // The PDF passes JsonDeserializer.class straight in. Two things then
        // go wrong at runtime:
        //  (1) the class in the __TypeId__ header is the PRODUCER's package,
        //      which is not trusted here, so you get
        //      "The class com.velocity.model.Customer is not in the trusted packages"
        //  (2) a single malformed message makes the container retry the same
        //      offset forever - a poison-pill loop.
        JsonDeserializer<Customer> valueDeserializer = new JsonDeserializer<>(Customer.class);
        valueDeserializer.addTrustedPackages("com.velocity.model");
        valueDeserializer.setUseTypeHeaders(false);   // trust OUR type, not the header

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                new ErrorHandlingDeserializer<>(valueDeserializer));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Customer>
                                        kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Customer> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        // one thread per partition; more threads than partitions just idle
        factory.setConcurrency(3);
        return factory;
    }
}
// As with the producer, the PDF's "new DefaultKafkaConsumerFactory(props)"
// is a raw type. Use the diamond so the <String, Customer> typing survives.`,
                `# Step 18 - application.properties (CONSUMER project)
server.port=7070

# The properties-only equivalent of the whole config class above.
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=group_customer
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=com.velocity.model
spring.kafka.consumer.properties.spring.json.value.default.type=com.velocity.model.Customer

# The producer runs on 9090 and the consumer on 7070. They MUST differ, or the
# second application dies with:
#   Web server failed to start. Port 9090 was already in use.`
            ]
        },
        {
            content: `<h3>Application flow</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">POSTMAN
   |  POST /addCustomer  (list of 3 customers)
   v
KafkaProducerController.addCustomer(...)          [producer app, port 9090]
   |
   v
CustomerService.addCustomer(list)
   |  for each customer:
   |     kafkaTemplate.send("customer", key, customer)
   v
JsonSerializer  -> {"customerId":101,"customerName":"ram",...}
   |
   v
partitioner: murmur2(key) % partitionCount  -> partition 1
   |
   v
+-----------------------------------------------------------+
|  BROKER localhost:9092    topic "customer"                 |
|    partition 0 : [ ... ][102]                              |
|    partition 1 : [ ... ][101]                              |
|    partition 2 : [ ... ][103]                              |
+-----------------------------------------------------------+
   |
   |  listener container polls (group_customer)
   v
JsonDeserializer -> new Customer(...)             [consumer app, port 7070]
   |
   v
CustomerService.listener(Customer c)
   |
   v
"Message received from Kafka topic >>> Customer [customerId=101, ...]"
   |
   v
offset committed for that partition</pre>
<br>

<h3>What to check when nothing arrives</h3>
<table>
<tr><th>Symptom</th><th>Cause</th></tr>
<tr><td>Producer logs "published", consumer prints nothing</td><td>Different topic name, different bootstrap server, or the consumer joined with <code>auto-offset-reset=latest</code> (the default) after the messages were already written. Set it to <code>earliest</code> for a first run.</td></tr>
<tr><td><code>not in the trusted packages</code></td><td>The <code>__TypeId__</code> header names a class the consumer's <code>JsonDeserializer</code> has not been told to trust. Add the package, or turn off type headers and set a default type.</td></tr>
<tr><td>Same message logged forever</td><td>The listener threw, the offset was never committed, and the container is redelivering. Configure a <code>DefaultErrorHandler</code> with a backoff and a dead-letter topic.</td></tr>
<tr><td><code>TimeoutException: Topic customer not present in metadata</code></td><td>The broker is not running, or auto topic creation is off and the topic does not exist. Create it with <code>kafka-topics.bat --create</code>.</td></tr>
<tr><td>Consumer restarts and reprocesses everything</td><td>A new <code>groupId</code> on every run - often because it is generated or was edited. Offsets are stored per group.</td></tr>
</table>`
        }
    ],
    expert: [
        {
            content: `<h3>The model underneath the annotations</h3>
Everything Spring Kafka does is a thin wrapper over four ideas. If you hold these, the rest is configuration.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                        KAFKA CLUSTER
   +--------------------------+  +--------------------------+
   |  BROKER 1                |  |  BROKER 2                |
   |                          |  |                          |
   |  topic "orders"          |  |  topic "orders"          |
   |   P0 (leader)            |  |   P0 (follower/replica)  |
   |    [0][1][2][3][4][5]    |  |   P1 (leader)            |
   |                          |  |    [0][1][2]             |
   +--------------------------+  +--------------------------+
              ^                             ^
              |  append (offset assigned)   |
              |                             |
        +-----------------------------------------+
        |  PRODUCER   send(topic, key, value)     |
        +-----------------------------------------+

              |                             |
              v                             v
   +-----------------------------------------------------+
   |  CONSUMER GROUP "billing"                           |
   |    consumer A  <- P0        consumer B  <- P1       |
   |    committed offset 4        committed offset 2     |
   +-----------------------------------------------------+
   +-----------------------------------------------------+
   |  CONSUMER GROUP "analytics"   (independent offsets) |
   |    consumer C  <- P0, P1                            |
   |    committed offset 6 / 3                           |
   +-----------------------------------------------------+</pre>
<br>

<table>
<tr><th>Concept</th><th>What it really is</th></tr>
<tr><td><strong>Broker</strong></td><td>A process that owns a set of partition replicas on local disk. One replica per partition is the <strong>leader</strong>; all reads and writes for that partition go to the leader. Followers replicate it and form the <strong>ISR</strong> (in-sync replica set) from which a new leader is elected if the old one dies.</td></tr>
<tr><td><strong>Topic</strong></td><td>Nothing but a name. It has no storage of its own - it is the collection of its partitions.</td></tr>
<tr><td><strong>Partition</strong></td><td>The real unit. An append-only, immutable log segment file on disk. Records are appended at the end and read sequentially, which is why Kafka is fast: it is doing sequential disk I/O and using the OS page cache, not random access.</td></tr>
<tr><td><strong>Offset</strong></td><td>A monotonically increasing <code>long</code>, unique <em>within one partition</em>. It is not a message id and it is not comparable across partitions.</td></tr>
<tr><td><strong>Consumer group</strong></td><td>The unit of scaling and of offset bookkeeping. A group's committed offsets live in the internal compacted topic <code>__consumer_offsets</code>. Two groups reading the same topic never affect each other - this is why Kafka is a publish-subscribe log and not a point-to-point queue.</td></tr>
<tr><td><strong>Retention</strong></td><td>Records are deleted by time (<code>retention.ms</code>, default 7 days) or by size, not by consumption. A consumed record stays. A compacted topic (<code>cleanup.policy=compact</code>) instead keeps the latest value per key forever.</td></tr>
</table>`
        },
        {
            content: `<h3>Partitions are the unit of parallelism - and the limit of ordering</h3>
Two facts follow from the model and almost every Kafka mistake is a violation of one of them.<br><br>

<div class="border">
<strong>1. Within one consumer group, a partition is assigned to exactly one consumer.</strong> Ten consumers on a three-partition topic means seven idle processes. Your maximum parallelism is the partition count, decided when the topic is created.<br>
<strong>2. Kafka guarantees order within a partition, and offers no ordering at all across partitions.</strong> "Kafka preserves message order" is a half-truth that costs people production incidents.<br>
</div><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Topic with 3 partitions, consumer group with N members:

 N = 1     c1 -> P0, P1, P2        all order interleaved, one thread
 N = 3     c1 -> P0  c2 -> P1  c3 -> P2      ideal
 N = 5     c1 -> P0  c2 -> P1  c3 -> P2  c4 idle  c5 idle

Adding partitions later increases parallelism but BREAKS key affinity:
   before: hash("cust-101") % 3 = 1   -> partition 1
   after : hash("cust-101") % 6 = 4   -> partition 4
   older records for cust-101 are still sitting in partition 1,
   so the two halves of that customer's history can now be read
   out of order. Size partitions up front.</pre>
<br>

<h3>The key decides the partition</h3>
<code>send(topic, key, value)</code> chooses a partition as <code>murmur2(serialize(key)) % numPartitions</code>. Consequences worth stating explicitly:<br><br>

<table>
<tr><th>Situation</th><th>Behaviour</th></tr>
<tr><td>Key is <code>null</code></td><td>The <strong>sticky partitioner</strong> fills one partition's batch, then moves to another. Records are spread evenly and per-entity ordering is lost. This is what the classroom producer did before the key was added.</td></tr>
<tr><td>Key is the entity id</td><td>Every record for that entity lands in one partition, so its events are consumed in the order they were produced. This is how you get "ordering per customer" without a single-threaded consumer.</td></tr>
<tr><td>Key is low-cardinality (e.g. country)</td><td>Hot partitions. One partition takes 80% of the traffic and one consumer thread becomes the bottleneck while the others idle.</td></tr>
<tr><td>Explicit partition number in <code>ProducerRecord</code></td><td>Bypasses the partitioner entirely. Almost always a mistake - it hard-codes topology into application code.</td></tr>
<tr><td>Key used for compaction</td><td>On a compacted topic the key is also the identity for retention: the latest value per key survives. A <code>null</code> value for a key is a <strong>tombstone</strong> and deletes it.</td></tr>
</table>`,
            codeExamples: [
                `// Ordering per entity, parallelism across entities.
kafkaTemplate.send("orders", order.getCustomerId(), order);

// Verify where a record actually went, and handle the failure.
// send() returns a future - ignoring it is how sends fail silently.
kafkaTemplate.send("orders", key, order)
    .whenComplete((result, ex) -> {
        if (ex != null) {
            LOG.error("publish failed for key {}", key, ex);
        } else {
            RecordMetadata md = result.getRecordMetadata();
            LOG.info("sent to {}-{} @ offset {}",
                     md.topic(), md.partition(), md.offset());
        }
    });
// OUTPUT:
// INFO  sent to orders-1 @ offset 4821
// INFO  sent to orders-1 @ offset 4822      <- same customer, same partition
// INFO  sent to orders-0 @ offset 991       <- different customer
//
// NOTE: whenComplete/CompletableFuture is Spring Kafka 3.x (Boot 3.x).
// On Spring Kafka 2.x the method returns ListenableFuture and you use
// addCallback(...). ListenableFuture was removed in Spring Framework 6.

// Fire-and-forget with no callback:
kafkaTemplate.send("orders", key, order);
// A broker rejection, a serialisation error or a full buffer is then
// invisible to your code. The record is simply gone.`,
                `// Ordering also depends on a producer setting people forget.
// max.in.flight.requests.per.connection defaults to 5. If a batch fails and
// is retried while later batches have already been accepted, records can be
// REORDERED inside a single partition.
//
// enable.idempotence=true (the default since Kafka 3.0) makes the broker
// deduplicate and preserve order for up to 5 in-flight requests, so you keep
// both throughput and ordering. If you ever disable idempotence, you must
// set max.in.flight.requests.per.connection=1 to keep ordering.

props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
props.put(ProducerConfig.ACKS_CONFIG, "all");
props.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
props.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120000);
// acks=1 acknowledges as soon as the LEADER writes. If the leader dies
// before the followers replicate, that record is lost with no error
// anywhere. acks=all plus min.insync.replicas=2 is the durable setting.`
            ]
        },
        {
            content: `<h3>Delivery semantics: what you actually get</h3>
<table>
<tr><th>Guarantee</th><th>How it is produced, and what it costs</th></tr>
<tr><td><strong>At-most-once</strong></td><td>Commit the offset before processing. A crash between commit and processing loses the record. Fast, and acceptable only for metrics or logs.</td></tr>
<tr><td><strong>At-least-once</strong></td><td>Process, then commit. A crash between processing and commit redelivers the record. This is the default in Spring Kafka and what you should assume you have.</td></tr>
<tr><td><strong>Exactly-once (EOS)</strong></td><td>A transactional producer plus <code>isolation.level=read_committed</code> consumers. Kafka can make the read-process-write cycle atomic <em>within Kafka</em>: the consumed offsets and the produced records commit together.</td></tr>
</table>
<br>

<strong>The honest statement about exactly-once:</strong> Kafka's EOS is exactly-once <em>processing within Kafka</em>, not exactly-once <em>delivery to the outside world</em>. The moment your listener writes to MySQL, calls a payment API or sends an email, that side effect is outside the Kafka transaction. There is no distributed two-phase commit between Kafka and your database in a normal Spring Boot application, so the correct design is:<br><br>

<div class="border">
<strong>Assume at-least-once, and make the consumer idempotent.</strong> Processing the same record twice must produce the same end state as processing it once.
</div><br>

Practical ways to be idempotent:<br><br>

<table>
<tr><th>Technique</th><th>How</th></tr>
<tr><td>Natural upsert</td><td><code>INSERT ... ON DUPLICATE KEY UPDATE</code>, or JPA <code>save()</code> on an entity whose id comes from the message. Replaying is harmless.</td></tr>
<tr><td>Processed-id table</td><td>Insert the message key (or an explicit event id) into a table with a unique constraint inside the same transaction as the business write. A duplicate violates the constraint and is skipped.</td></tr>
<tr><td>Offset as a fence</td><td>Store <code>topic-partition-offset</code> with the row; ignore a record whose offset is not greater than the last one recorded for that partition.</td></tr>
<tr><td>Conditional state change</td><td><code>UPDATE order SET status='SHIPPED' WHERE id=? AND status='PAID'</code> - a second delivery updates zero rows.</td></tr>
<tr><td>Transactional outbox</td><td>For the write side: the service writes its business row and an outbox row in one database transaction; a separate relay publishes the outbox to Kafka. This removes the dual-write problem entirely.</td></tr>
</table>`,
            codeExamples: [
                `// Idempotent consumer using a de-duplication table.
// The insert and the business write share ONE database transaction, so
// either both happen or neither does.
@Service
public class OrderConsumer {

    private final ProcessedEventRepository processed;
    private final OrderRepository orders;

    @KafkaListener(topics = "orders", groupId = "billing")
    @Transactional
    public void onOrder(ConsumerRecord<String, Order> record) {
        String eventId = record.topic() + "-" + record.partition()
                       + "-" + record.offset();

        if (processed.existsById(eventId)) {
            LOG.debug("duplicate {} ignored", eventId);
            return;                       // commit offset, do nothing else
        }
        orders.save(toEntity(record.value()));
        processed.save(new ProcessedEvent(eventId, Instant.now()));
    }
}
// OUTPUT on redelivery after a crash:
// DEBUG duplicate orders-1-4821 ignored
// Hibernate: (no insert issued)
//
// Note @Transactional here covers the DATABASE only. The Kafka offset commit
// is separate. That is exactly why the de-dup row is needed.`,
                `// Kafka-to-Kafka exactly-once: transactions.
@Bean
public KafkaTransactionManager<String, Object> ktm(ProducerFactory<String, Object> pf) {
    return new KafkaTransactionManager<>(pf);
}

// spring.kafka.producer.transaction-id-prefix=tx-orders-
// spring.kafka.consumer.isolation-level=read_committed

@KafkaListener(topics = "orders")
@Transactional("ktm")
public void process(Order order) {
    kafkaTemplate.send("orders-enriched", order.getId(), enrich(order));
    // The send AND the consumed offset commit as one atomic unit.
    // A read_committed consumer downstream never sees aborted records.
}
// Cost: transaction markers in the log, higher end-to-end latency, and a
// hard requirement that transaction-id-prefix is STABLE per instance -
// two instances sharing a transactional id fence each other off with
// ProducerFencedException.`
            ]
        },
        {
            content: `<h3>Acknowledgement: who commits the offset, and when</h3>
The offset commit is the only thing that says "I have handled up to here". Getting it wrong is what produces both duplicate processing and silent data loss.<br><br>

<table>
<tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td><code>enable.auto.commit=true</code> (plain client default)</td><td>A background thread commits the last polled offsets every <code>auto.commit.interval.ms</code> (5s), <strong>regardless of whether your code succeeded</strong>. A crash after the commit and before the work loses records. Spring Kafka turns this OFF by default - do not turn it back on.</td></tr>
<tr><td><code>AckMode.BATCH</code> (Spring default)</td><td>The container commits the offsets of the whole poll batch after all its records have been handled without throwing. At-least-once, low commit traffic.</td></tr>
<tr><td><code>AckMode.RECORD</code></td><td>Commits after each record returns normally. Fewer duplicates after a crash, more commit requests.</td></tr>
<tr><td><code>AckMode.MANUAL</code></td><td>Your listener takes an <code>Acknowledgment</code> parameter and calls <code>acknowledge()</code>; the commit is queued and issued at the end of the batch.</td></tr>
<tr><td><code>AckMode.MANUAL_IMMEDIATE</code></td><td>The commit is issued as soon as you call <code>acknowledge()</code>. This is the mode to pick when you genuinely need manual control.</td></tr>
<tr><td><code>AckMode.TIME</code> / <code>COUNT</code> / <code>COUNT_TIME</code></td><td>Commit after an interval, after N records, or whichever comes first. Throughput tuning for high-volume, replay-tolerant consumers.</td></tr>
</table>
<br>

<strong>Manual acknowledgement is not automatically safer.</strong> Its two classic failure modes: acknowledging at the <em>top</em> of the method (which is at-most-once with extra ceremony), and acknowledging in a <code>finally</code> block (which acknowledges failures too, silently discarding them). Acknowledge only on the success path, and let the error handler deal with the rest.<br><br>

<h3>Consumer lag</h3>
<strong>Consumer lag</strong> is <code>log-end-offset - committed-offset</code> per partition: how many records have been written that this group has not yet confirmed. It is the single most useful Kafka metric, because it is a leading indicator - lag grows minutes before users notice anything.<br><br>

<table>
<tr><th>Lag pattern</th><th>What it means</th></tr>
<tr><td>Flat and near zero</td><td>Healthy. Consumers keep up with producers.</td></tr>
<tr><td>Steadily climbing</td><td>Processing is slower than production. Either the listener is too slow (a synchronous downstream call is the usual culprit) or you have fewer consumers than partitions.</td></tr>
<tr><td>Sawtooth</td><td>Bursty producers, or a consumer that periodically stalls - a long GC pause or a rebalance.</td></tr>
<tr><td>Climbing on one partition only</td><td>A hot key. The partitioner is sending most traffic to one partition.</td></tr>
<tr><td>Suddenly drops to zero without processing</td><td>Offsets were reset, or the retention window deleted records the group had not read - genuine data loss. Watch for <code>OffsetOutOfRangeException</code> and <code>auto.offset.reset=latest</code> quietly skipping ahead.</td></tr>
</table>
<br>

<strong>The rebalance trap.</strong> If a listener takes longer than <code>max.poll.interval.ms</code> (default 5 minutes) between polls, the broker assumes the consumer is dead, revokes its partitions and rebalances. The consumer then fails to commit (<code>CommitFailedException</code>), the records are redelivered to someone else, that consumer is also slow, and the group thrashes. Fix it by lowering <code>max.poll.records</code> or raising <code>max.poll.interval.ms</code> - not by adding consumers.<br>`,
            codeExamples: [
                `// Manual acknowledgement done correctly.
@Bean
public ConcurrentKafkaListenerContainerFactory<String, Customer> factory(
        ConsumerFactory<String, Customer> cf) {

    ConcurrentKafkaListenerContainerFactory<String, Customer> f =
            new ConcurrentKafkaListenerContainerFactory<>();
    f.setConsumerFactory(cf);
    f.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
    return f;
}

@KafkaListener(topics = "customer", groupId = "group_customer")
public void listen(Customer c, Acknowledgment ack) {
    try {
        service.handle(c);
        ack.acknowledge();          // ONLY on success
    } catch (TransientException e) {
        // do NOT acknowledge - let the error handler retry / route to DLT
        throw e;
    }
}

// WRONG - at-most-once dressed up as manual control:
//   ack.acknowledge();
//   service.handle(c);            // crash here and the record is gone
//
// WRONG - swallows every failure:
//   try { service.handle(c); } finally { ack.acknowledge(); }`,
                `# Settings that decide lag behaviour and rebalance safety
spring.kafka.listener.ack-mode=manual_immediate
spring.kafka.consumer.enable-auto-commit=false
spring.kafka.consumer.max-poll-records=100
spring.kafka.consumer.properties.max.poll.interval.ms=300000
spring.kafka.consumer.properties.session.timeout.ms=45000
spring.kafka.consumer.properties.heartbeat.interval.ms=3000

# Cooperative rebalancing: partitions are reassigned incrementally instead of
# every consumer stopping and re-joining (the old "stop-the-world" protocol).
spring.kafka.consumer.properties.partition.assignment.strategy=\\
  org.apache.kafka.clients.consumer.CooperativeStickyAssignor

# Expose lag to Prometheus - kafka_consumer_fetch_manager_records_lag_max
management.endpoints.web.exposure.include=health,metrics,prometheus`
            ]
        },
        {
            content: `<h3>Retries, error handling and dead-letter topics</h3>
Without an error handler, a listener that throws is a disaster: the container does not commit, re-polls the same offset, calls your method again, it throws again - a <strong>poison-pill loop</strong> that pins a CPU and stops that partition forever while lag climbs.<br><br>

<code>DefaultErrorHandler</code> (Spring Kafka 2.8+, replacing the deprecated <code>SeekToCurrentErrorHandler</code> and <code>RetryTemplate</code>-based retry) fixes this. It retries in the consumer thread according to a <code>BackOff</code>, and when the attempts are exhausted it hands the record to a <strong>recoverer</strong> - normally a <code>DeadLetterPublishingRecoverer</code> that writes it to a <strong>dead-letter topic</strong> named <code>&lt;topic&gt;.DLT</code>. The offset is then committed and the partition moves on.<br><br>

<table>
<tr><th>Decision</th><th>Guidance</th></tr>
<tr><td>Which exceptions to retry</td><td>Only transient ones - timeouts, connection resets, HTTP 503. A <code>DeserializationException</code>, a validation failure or a <code>NullPointerException</code> will fail identically on every attempt. Register those with <code>addNotRetryableExceptions(...)</code> so they go straight to the DLT.</td></tr>
<tr><td>Which backoff</td><td><code>FixedBackOff</code> for a couple of quick retries; <code>ExponentialBackOffWithMaxRetries</code> when the downstream needs time to recover. Note that this retry <em>blocks the partition</em>, so a 30-second backoff stalls every record behind it.</td></tr>
<tr><td>Blocking vs non-blocking retry</td><td>When a long backoff is needed, use <code>@RetryableTopic</code> instead. It publishes the failed record to <code>topic-retry-0</code>, <code>topic-retry-1</code> ... with increasing delays and finally <code>topic-dlt</code>, so the main partition is never blocked. The cost is that ordering is lost for retried records.</td></tr>
<tr><td>What goes in the DLT</td><td>The original key, value and headers, plus <code>kafka_dlt-exception-fqcn</code>, <code>kafka_dlt-exception-message</code>, <code>kafka_dlt-original-topic</code>, <code>-partition</code> and <code>-offset</code>. Keep the raw bytes - a DLT you cannot replay is a log file with extra steps.</td></tr>
<tr><td>Who reads the DLT</td><td>Someone must. An unmonitored DLT is silent data loss. Alert on its message rate, and provide a replay tool that republishes to the original topic after the bug is fixed.</td></tr>
</table>`,
            codeExamples: [
                `// DefaultErrorHandler with exponential backoff and a dead-letter topic.
@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {

    // where records go when the retries are exhausted:
    // customer -> customer.DLT, same partition number
    DeadLetterPublishingRecoverer recoverer =
        new DeadLetterPublishingRecoverer(template,
            (record, ex) -> new TopicPartition(record.topic() + ".DLT",
                                               record.partition()));

    ExponentialBackOffWithMaxRetries backOff = new ExponentialBackOffWithMaxRetries(3);
    backOff.setInitialInterval(1000L);
    backOff.setMultiplier(2.0);          // 1s, 2s, 4s
    backOff.setMaxInterval(10000L);

    DefaultErrorHandler handler = new DefaultErrorHandler(recoverer, backOff);

    // These can never succeed on a retry - do not waste 3 attempts on them.
    handler.addNotRetryableExceptions(
        DeserializationException.class,
        MethodArgumentNotValidException.class,
        IllegalArgumentException.class);

    handler.setCommitRecovered(true);    // commit the offset once recovered
    return handler;
}

@Bean
public ConcurrentKafkaListenerContainerFactory<String, Customer> factory(
        ConsumerFactory<String, Customer> cf, DefaultErrorHandler handler) {
    ConcurrentKafkaListenerContainerFactory<String, Customer> f =
            new ConcurrentKafkaListenerContainerFactory<>();
    f.setConsumerFactory(cf);
    f.setCommonErrorHandler(handler);
    return f;
}
// OUTPUT when the listener throws a transient failure:
// WARN  o.s.k.l.DefaultErrorHandler : Backing off for 1000 ms, attempt 1/3
// WARN  o.s.k.l.DefaultErrorHandler : Backing off for 2000 ms, attempt 2/3
// WARN  o.s.k.l.DefaultErrorHandler : Backing off for 4000 ms, attempt 3/3
// ERROR o.s.k.l.DeadLetterPublishingRecoverer :
//       Publishing to customer.DLT from customer-1@4821
// INFO  offset 4822 committed - the partition is moving again
//
// And for a non-retryable one, no backoff at all:
// ERROR Publishing to customer.DLT from customer-1@4823 (no retry:
//       DeserializationException)`,
                `// Reading the dead-letter topic and understanding why a record died.
@KafkaListener(topics = "customer.DLT", groupId = "dlt-audit")
public void onDeadLetter(ConsumerRecord<String, byte[]> record) {
    String origTopic = header(record, KafkaHeaders.DLT_ORIGINAL_TOPIC);
    String exception = header(record, KafkaHeaders.DLT_EXCEPTION_FQCN);
    String message   = header(record, KafkaHeaders.DLT_EXCEPTION_MESSAGE);

    LOG.error("DLT key={} from {} : {} - {}",
              record.key(), origTopic, exception, message);
    deadLetterRepository.save(new DeadLetter(record.key(),
                              new String(record.value(), UTF_8),
                              exception, message));
}
// OUTPUT:
// ERROR DLT key=101 from customer :
//   org.springframework.kafka.support.serializer.DeserializationException -
//   failed to deserialize; nested exception is
//   com.fasterxml.jackson.core.JsonParseException: Unexpected character ('<')
//
// The value is read as byte[] deliberately: the record is in the DLT
// PRECISELY because it could not be turned into a Customer.`,
                `// Non-blocking retry - the main partition never stalls.
@RetryableTopic(
    attempts = "4",
    backoff = @Backoff(delay = 2000, multiplier = 3.0),   // 2s, 6s, 18s
    dltStrategy = DltStrategy.FAIL_ON_ERROR,
    exclude = { DeserializationException.class, IllegalArgumentException.class })
@KafkaListener(topics = "customer", groupId = "group_customer")
public void listen(Customer c) {
    remoteService.enrich(c);        // may time out
}

@DltHandler
public void dlt(Customer c, @Header(KafkaHeaders.ORIGINAL_TOPIC) String topic) {
    LOG.error("giving up on {} from {}", c, topic);
}
// Spring creates: customer-retry-0, customer-retry-1, customer-retry-2, customer-dlt
// OUTPUT:
// INFO  o.s.k.r.RetryTopicConfigurer : Created topics [customer-retry-0, ...]
// WARN  record for key 101 failed, forwarded to customer-retry-0
// WARN  record for key 101 failed, forwarded to customer-retry-1
// ERROR giving up on Customer [customerId=101, ...] from customer
//
// TRADE-OFF: the record leaves its original partition, so its ordering
// relative to other records for the same key is gone. Do not use this
// where per-key ordering is a business requirement.`
            ]
        },
        {
            content: `<h3>JSON serialisation, type headers and trusted packages</h3>
Kafka itself carries only <code>byte[]</code> for the key and the value. Everything else is a serialiser convention on top.<br><br>

When Spring's <code>JsonSerializer</code> writes a record it adds a header <code>__TypeId__</code> containing the fully-qualified class name, and by default <code>JsonDeserializer</code> reads that header and instantiates that class. This is convenient and it is also the security-sensitive part: deserialising an attacker-chosen class name is a classic remote-code-execution vector. Hence <strong>trusted packages</strong> - the deserialiser refuses any class outside the allowed list.<br><br>

<table>
<tr><th>Setting</th><th>Effect</th></tr>
<tr><td><code>spring.json.trusted.packages</code></td><td>Comma-separated allow-list of packages the deserialiser may instantiate. <code>*</code> trusts everything and should never appear in production.</td></tr>
<tr><td><code>spring.json.value.default.type</code></td><td>The class to use when there is no type header - for example when the producer is not a Spring application.</td></tr>
<tr><td><code>spring.json.use.type.headers=false</code></td><td>Ignore the header entirely and always use the default type. The most robust setting for services owned by different teams.</td></tr>
<tr><td><code>spring.json.type.mapping</code></td><td>Maps a logical token to a class - <code>customer:com.velocity.model.Customer</code>. The header then carries <code>customer</code>, so the producer and consumer no longer have to share a package name. This is the right answer for cross-service messaging.</td></tr>
<tr><td><code>ErrorHandlingDeserializer</code></td><td>Wraps the real deserialiser. A failure becomes a <code>DeserializationException</code> delivered to the error handler instead of an exception thrown inside the poll loop that no handler can catch.</td></tr>
</table>
<br>

<strong>Why the classroom example breaks in real life:</strong> it works only because both projects happen to declare <code>com.velocity.model.Customer</code>. Rename the package on either side and the consumer fails with <em>"The class ... is not in the trusted packages"</em>. Two independently deployed services should never be coupled by a Java package name.<br><br>

<strong>Schema evolution.</strong> JSON has no schema, so a producer adding a field is fine but a consumer expecting a field that disappears breaks at runtime with no warning. Set <code>FAIL_ON_UNKNOWN_PROPERTIES=false</code> as a minimum. For anything long-lived, <strong>Avro or Protobuf with a Schema Registry</strong> gives you compile-time types, a compact binary payload and enforced backward compatibility - the registry rejects an incompatible schema at publish time rather than at 3 a.m.<br>`,
            codeExamples: [
                `// Decoupling producer and consumer with type mapping instead of packages.

// --- producer ---
# spring.kafka.producer.value-serializer=\\
#   org.springframework.kafka.support.serializer.JsonSerializer
# spring.kafka.producer.properties.spring.json.type.mapping=\\
#   customer:com.acme.orders.dto.Customer

// --- consumer, different package entirely ---
# spring.kafka.consumer.value-deserializer=\\
#   org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
# spring.kafka.consumer.properties.spring.deserializer.value.delegate.class=\\
#   org.springframework.kafka.support.serializer.JsonDeserializer
# spring.kafka.consumer.properties.spring.json.type.mapping=\\
#   customer:com.billing.model.CustomerView
# spring.kafka.consumer.properties.spring.json.trusted.packages=com.billing.model

// The wire header is now:  __TypeId__ : customer
// Neither side knows the other's class name. Renaming a package on either
// side no longer breaks the other service.`,
                `// Inspecting what is actually on the wire.
.\\bin\\windows\\kafka-console-consumer.bat --topic customer --from-beginning ^
    --bootstrap-server localhost:9092 --property print.headers=true ^
    --property print.key=true

// OUTPUT:
// __TypeId__:com.velocity.model.Customer  101
// {"customerId":101,"customerName":"ram","customerEmail":"ram@gmail.com"}
//
// That header is what triggers:
//   java.lang.IllegalArgumentException: The class
//   'com.velocity.model.Customer' is not in the trusted packages:
//   [java.util, java.lang]. If you believe this class is safe to
//   deserialize, please provide its name. If the serialization is only
//   done by a trusted source, you can also enable trust all (*).`,
                `// Tolerant Jackson configuration for evolving JSON messages.
@Bean
public JsonDeserializer<Customer> customerDeserializer() {
    ObjectMapper mapper = JsonMapper.builder()
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES) // producer added a field
        .addModule(new JavaTimeModule())                            // Instant, LocalDate
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        .build();

    JsonDeserializer<Customer> d = new JsonDeserializer<>(Customer.class, mapper, false);
    d.addTrustedPackages("com.velocity.model");
    return d;
}
// Without FAIL_ON_UNKNOWN_PROPERTIES=false, the first time the producing team
// adds a field every consumer instance starts throwing:
//   UnrecognizedPropertyException: Unrecognized field "loyaltyTier"
//   (class com.velocity.model.Customer), not marked as ignorable
// and, without an ErrorHandlingDeserializer, loops on that offset forever.`
            ]
        },
        {
            content: `<h3>When Kafka is the wrong tool</h3>
Kafka is a <strong>distributed, replicated, append-only log</strong>. Almost every misuse comes from treating it as a task queue, because the Spring API - <code>send</code> and a listener - looks exactly like one.<br><br>

<table>
<tr><th>Requirement</th><th>Why Kafka is a poor fit</th></tr>
<tr><td>Per-message acknowledgement or rejection</td><td>There is no per-message ack. The offset is a single high-water mark per partition, so you cannot "leave message 5 unacked while completing message 6". RabbitMQ, ActiveMQ or SQS do this natively.</td></tr>
<tr><td>Priority queues</td><td>A log has one order - arrival order. There is no priority field and no way to jump the queue. You would need a topic per priority and consumer-side arbitration.</td></tr>
<tr><td>Per-message delay or scheduling</td><td>No "deliver after 30 minutes". You have to emulate it with retry topics or an external scheduler.</td></tr>
<tr><td>Selective consumption / routing by attribute</td><td>Consumers read whole partitions. There is no server-side filter, no routing key, no topic exchange. Filtering means reading everything and discarding most of it.</td></tr>
<tr><td>Request/reply with low latency</td><td>Possible with <code>ReplyingKafkaTemplate</code>, but you are paying for a durable disk write and a rebalanceable consumer group to do what an HTTP call does in a millisecond.</td></tr>
<tr><td>Thousands of topics, or a queue per user</td><td>Every partition is open file handles and memory on the broker. Kafka scales to enormous throughput on few topics, not to a topic per entity. Use a key instead.</td></tr>
<tr><td>Very large payloads</td><td><code>message.max.bytes</code> defaults to about 1 MB. Sending files through Kafka is an anti-pattern - put the object in S3 and publish the reference (the <strong>claim-check pattern</strong>).</td></tr>
<tr><td>Strict global ordering across a whole topic</td><td>Only achievable with a single partition, which caps you at one consumer thread and a fraction of Kafka's throughput. If you need that, you probably need a database.</td></tr>
<tr><td>A single small application</td><td>A broker, replication, ZooKeeper or KRaft, monitoring and a rebalance protocol is a large operational surface. If both ends are one deployable, an in-process event or a database table is honest engineering.</td></tr>
<tr><td>Transactional consistency with a relational database</td><td>There is no XA between Kafka and MySQL in practice. You need the outbox pattern or idempotent consumers - see the delivery-semantics section.</td></tr>
</table>
<br>

<div class="border">
<strong>Kafka is right when</strong> multiple independent consumers need the same stream; when replay from an arbitrary point has value; when throughput is high and per-message routing is not needed; when you want an event log that is the source of truth rather than a transient buffer.<br>
<strong>Kafka is wrong when</strong> you wanted a work queue with acks, priorities, delays and selective delivery. That is what a broker like RabbitMQ is for, and using the right one is not a downgrade.
</div>`
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Is Kafka a message queue?</td><td>No - it is a distributed commit log. Reading does not remove a record; records expire on a retention policy. Multiple consumer groups read the same data independently, which a queue cannot do.</td></tr>
<tr><td>What determines the maximum parallelism of a consumer group?</td><td>The partition count. Each partition is assigned to exactly one consumer in the group, so extra consumers beyond the partition count sit idle.</td></tr>
<tr><td>Does Kafka guarantee message order?</td><td>Only within a partition. There is no ordering guarantee across partitions of a topic. To get per-entity ordering you send with the entity id as the key so all its records hash to the same partition.</td></tr>
<tr><td>What does the message key actually do?</td><td>It selects the partition via <code>murmur2(key) % numPartitions</code>, and on a compacted topic it is the identity used for retention. A null key means the sticky partitioner spreads records and per-key ordering is lost.</td></tr>
<tr><td>Why is adding partitions to a live topic risky?</td><td>The modulus changes, so an existing key maps to a new partition while its older records remain in the old one. The key's history is then split and can be consumed out of order.</td></tr>
<tr><td>What is a consumer group and what is stored per group?</td><td>A set of consumers sharing a <code>group.id</code> that divide the partitions between them. The committed offset per topic-partition is stored per group in the internal <code>__consumer_offsets</code> topic.</td></tr>
<tr><td>At-least-once or exactly-once - which do you have by default?</td><td>At-least-once. Spring disables auto-commit and commits after processing, so a crash between processing and commit causes redelivery. Exactly-once needs a transactional producer and <code>read_committed</code> consumers, and even then only within Kafka.</td></tr>
<tr><td>Why must consumers be idempotent?</td><td>Because at-least-once means redelivery is normal, not exceptional - a rebalance, a crash or a commit failure will replay records. Idempotency comes from upserts, a processed-event table with a unique constraint, or conditional state updates.</td></tr>
<tr><td>Difference between <code>AckMode.MANUAL</code> and <code>MANUAL_IMMEDIATE</code>?</td><td><code>MANUAL</code> queues the commit and issues it when the current poll batch finishes; <code>MANUAL_IMMEDIATE</code> commits as soon as <code>acknowledge()</code> is called. Use the latter when manual control is the point.</td></tr>
<tr><td>What is consumer lag and why does it matter?</td><td>Log-end offset minus committed offset per partition - how far behind the group is. It is the earliest warning that consumers cannot keep up, and lag exceeding the retention window means permanent data loss.</td></tr>
<tr><td>What happens if a <code>@KafkaListener</code> throws and there is no error handler?</td><td>The offset is not committed, the container re-polls the same offset and calls the method again - an endless poison-pill loop that blocks that partition. <code>DefaultErrorHandler</code> with a backoff and a <code>DeadLetterPublishingRecoverer</code> is what stops it.</td></tr>
<tr><td>Blocking retry or <code>@RetryableTopic</code>?</td><td><code>DefaultErrorHandler</code> retries in the consumer thread, which preserves ordering but blocks the partition for the whole backoff. <code>@RetryableTopic</code> forwards to retry topics so the partition keeps moving, at the cost of losing per-key ordering for retried records.</td></tr>
<tr><td>What is the trusted-packages setting for?</td><td><code>JsonDeserializer</code> reads the <code>__TypeId__</code> header and would otherwise instantiate any class named there - a deserialisation RCE risk. Only listed packages are allowed. Prefer <code>spring.json.type.mapping</code> so services are not coupled by package name.</td></tr>
<tr><td>Why wrap the deserialiser in <code>ErrorHandlingDeserializer</code>?</td><td>Deserialisation happens inside the poll, before your listener, so a malformed record throws where no listener error handler can see it. The wrapper converts it into a <code>DeserializationException</code> that the error handler can route to the DLT.</td></tr>
<tr><td>What does <code>acks=all</code> cost and buy?</td><td>The leader waits for the in-sync replicas before acknowledging - higher latency, but a record survives the loss of the leader. With <code>acks=1</code>, a leader failure after the write and before replication loses the record silently.</td></tr>
<tr><td>When would you not use Kafka?</td><td>When you need per-message acks, priorities, delayed delivery, server-side filtering or a queue per user - Kafka has none of these. A broker such as RabbitMQ is the correct tool; Kafka is a log, not a task queue.</td></tr>
</table>`
        }
    ]
};
