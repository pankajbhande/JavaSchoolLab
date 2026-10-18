// Module 31 (Software Architecture), part B: microservices, events, queues, CQRS.
import { dd, r, type DeepDive } from './deepDive';

export const m31b: Record<string, DeepDive> = {
    'Microservices': dd(
        [`<b>Microservices</b> split an application into small, independently deployable services, each owning one business capability and its own data, talking over the network (HTTP/gRPC/messages). Below, the "network" is simulated with JSON strings.`,
            r`import json

class InventoryService:                     # service 1 owns stock data
    STOCK = {"pen": 5}
    def handle(self, request_json):         # pretend this is an HTTP endpoint
        req = json.loads(request_json)
        return json.dumps({"sku": req["sku"], "stock": self.STOCK.get(req["sku"], 0)})

class OrderService:                         # service 2 only knows the contract
    def __init__(self, inventory): self.inv = inventory
    def place(self, sku):
        reply = json.loads(self.inv.handle(json.dumps({"sku": sku})))
        return "accepted" if reply["stock"] > 0 else "rejected"

orders = OrderService(InventoryService())
print(orders.place("pen"))
print(orders.place("book"))

# OUTPUT:
# accepted
# rejected`],
        [`A large monolith is deployed, scaled and changed as one block; one team's bug can take everything down. Microservices let teams release independently and scale only the hot parts.`,
            r`replicas = {"catalog": 2, "orders": 10, "auth": 3}   # scale each service on its own load
for name, count in replicas.items():
    print(f"{name:<8} x{count}")

# OUTPUT:
# catalog  x2
# orders   x10
# auth     x3`],
        [`Netflix, Amazon and Uber run hundreds of services. Because networks fail, every remote call needs timeouts, retries and a circuit breaker so one failing service does not drag down its callers.`,
            r`class CircuitBreaker:
    def __init__(self, max_failures=2):
        self.failures, self.max = 0, max_failures
    def call(self, fn):
        if self.failures >= self.max:       # open: stop hammering the broken service
            return "circuit open: fallback"
        try:
            return fn()
        except ConnectionError:
            self.failures += 1
            return "failed"

def payment_service():
    raise ConnectionError("down")

cb = CircuitBreaker()
for _ in range(4):
    print(cb.call(payment_service))

# OUTPUT:
# failed
# failed
# circuit open: fallback
# circuit open: fallback`],
        [`<b>Advantages:</b> independent deploys and scaling, fault isolation, freedom of technology per service, small codebases that a team can own.`,
            r`def catalog():  return "ok"
def reviews():  raise RuntimeError("boom")
def cart():     return "ok"

for name, fn in [("catalog", catalog), ("reviews", reviews), ("cart", cart)]:
    try:
        print(f"{name}: {fn()}")
    except RuntimeError as e:
        print(f"{name}: degraded ({e})")    # the page still renders without reviews

# OUTPUT:
# catalog: ok
# reviews: degraded (boom)
# cart: ok`],
        [`<b>Disadvantages:</b> distributed-system complexity: no shared transaction, partial failures, network latency, harder debugging and operations. Multi-service workflows need sagas with compensating actions.`,
            r`log = []
def create_order():  log.append("order created")
def cancel_order():  log.append("order cancelled")      # compensating action
def charge():        raise RuntimeError("payment declined")

try:
    create_order()
    charge()                                # step 2 in another service fails
except RuntimeError as e:
    log.append(f"error: {e}")
    cancel_order()                          # no rollback exists: undo manually

print(log)

# OUTPUT:
# ['order created', 'error: payment declined', 'order cancelled']`],
        [`<b>Limitations:</b> shared databases or tightly coupled calls turn it into a "distributed monolith" with all the pain and none of the benefit; data consistency across services is eventual.`,
            r`shared = {"price": 10}                    # two services sharing one database

def billing():
    return shared["price"] * 2              # service B depends on A's schema

shared["unit_price"] = shared.pop("price")  # service A renames a column

try:
    billing()
except KeyError as e:
    print("billing broke: KeyError", e)

# OUTPUT:
# billing broke: KeyError 'price'`],
        `
   Client --> [ API Gateway ]
                  |
        +---------+----------+
        v         v          v
   +---------+ +--------+ +--------+
   | Orders  | | Catalog| |  Auth  |     each: own code, own DB, own deploy
   +----+----+ +---+----+ +---+----+
        |          |          |
     [ DB-1 ]   [ DB-2 ]   [ DB-3 ]
        +----- events / HTTP between services -----+
`,
        `Start with a well-structured modular monolith and extract services along bounded contexts when team size or scaling forces it. Budget for observability (tracing, correlation ids), contract tests, idempotent endpoints and sagas. Never share a database between services and avoid chatty synchronous call chains.`
    ),

    'Event-Driven Architecture': dd(
        [`In <b>event-driven architecture</b> components communicate by publishing <b>events</b> (facts that happened, such as "user registered") and reacting to them. Producers do not know who listens.`,
            r`class EventBus:
    def __init__(self): self._handlers = {}
    def subscribe(self, name, fn):
        self._handlers.setdefault(name, []).append(fn)
    def publish(self, name, data):
        for fn in self._handlers.get(name, []):
            fn(data)

bus = EventBus()
bus.subscribe("user.registered", lambda d: print("email to", d["email"]))
bus.subscribe("user.registered", lambda d: print("analytics: signup", d["email"]))
bus.publish("user.registered", {"email": "a@x.com"})

# OUTPUT:
# email to a@x.com
# analytics: signup a@x.com`],
        [`Direct calls couple the producer to every consumer: adding "send SMS" means editing the registration code. With events, a new reaction is a new subscriber and nothing else changes.`,
            r`handlers = {"order.placed": []}

def publish(name, data):
    for h in handlers[name]:
        h(data)

handlers["order.placed"].append(lambda d: print("billing for", d["id"]))
publish("order.placed", {"id": 1})

# later, a new feature: no change to publish() or to the producer
handlers["order.placed"].append(lambda d: print("sms for", d["id"]))
publish("order.placed", {"id": 2})

# OUTPUT:
# billing for 1
# billing for 2
# sms for 2`],
        [`E-commerce flows (OrderPlaced triggers inventory, billing, notification), IoT telemetry, audit trails and data pipelines are event-driven. Storing events lets you rebuild state by replaying them (event sourcing).`,
            r`events = [("deposited", 100), ("withdrawn", 30), ("deposited", 50)]

balance = 0
for kind, amount in events:                 # replay the history to get the state
    balance += amount if kind == "deposited" else -amount

print("balance:", balance)

# OUTPUT:
# balance: 120`],
        [`<b>Advantages:</b> loose coupling, easy extension, natural asynchrony and scalability, built-in audit log, each consumer works at its own pace.`,
            r`import queue

q = queue.Queue()                           # events buffered between producer and consumer
for i in range(3):
    q.put(f"event-{i}")                     # the producer is never blocked by slow consumers

while not q.empty():
    print("handled", q.get())

# OUTPUT:
# handled event-0
# handled event-1
# handled event-2`],
        [`<b>Disadvantages:</b> hard to follow the overall flow, debugging is indirect, ordering and eventual consistency are tricky, and a naive bus lets one failing handler break the rest.`,
            r`ran = []
def bad(data):  raise RuntimeError("boom")
def good(data): ran.append("good")

try:
    for handler in [bad, good]:             # naive publish: no error isolation
        handler({})
except RuntimeError as e:
    print("publisher blew up:", e)
print("good ran:", ran)                     # the second handler never executed

# OUTPUT:
# publisher blew up: boom
# good ran: []`],
        [`<b>Limitations:</b> brokers usually deliver <i>at least once</i>, so duplicates happen. Handlers must be idempotent, and an in-process bus loses events when the process dies.`,
            r`processed = set()
balance = 0

def handle(event):                          # idempotent: remember processed ids
    global balance
    if event["id"] in processed:
        return                              # duplicate delivery ignored
    processed.add(event["id"])
    balance += event["amount"]

for ev in [{"id": 1, "amount": 10}, {"id": 1, "amount": 10}, {"id": 2, "amount": 5}]:
    handle(ev)
print(balance)

# OUTPUT:
# 15`],
        `
   Producer                 Event channel / bus               Consumers
  +---------+  publish   +-----------------------+  deliver  +-------------+
  | Orders  |----------->|  "order.placed"       |---------->| Billing     |
  +---------+            |                       |---------->| Inventory   |
                         |   (broker / queue)    |---------->| Notification|
                         +-----------------------+           +-------------+
   producer does not know who is listening
`,
        `Choose event notification, event-carried state transfer or event sourcing deliberately; each has different coupling and storage costs. Version event schemas, make handlers idempotent, use an outbox table so state change and publish are atomic, and add correlation ids and dead-letter handling from day one.`
    ),

    'Message Queues': dd(
        [`A <b>message queue</b> is a buffer where producers put messages and consumers take them, usually first-in-first-out. Producer and consumer run at different times and speeds. Python's <code>queue.Queue</code> is thread-safe and models the idea in-process.`,
            r`import queue, threading

q = queue.Queue()

def producer():
    for i in range(1, 4):
        q.put(i)
    q.put(None)                             # sentinel: "no more messages"

threading.Thread(target=producer).start()
while True:
    item = q.get()                          # blocks until a message arrives
    if item is None:
        break
    print("got", item)

# OUTPUT:
# got 1
# got 2
# got 3`],
        [`Without a buffer, a fast producer overwhelms a slow consumer, and a slow consumer blocks the producer. A bounded queue gives back-pressure: when full, the producer must wait or drop.`,
            r`import queue

q = queue.Queue(maxsize=2)
q.put(1)
q.put(2)
try:
    q.put_nowait(3)                         # buffer is full
except queue.Full:
    print("queue full - producer must wait or drop")

# OUTPUT:
# queue full - producer must wait or drop`],
        [`Typical use: the web request enqueues "send email" or "resize image" and returns immediately; background workers process jobs (Celery with Redis or RabbitMQ, AWS SQS, Kafka).`,
            r`import queue, threading

jobs = queue.Queue()
results = []

def worker():
    while True:
        job = jobs.get()
        if job is None:
            break
        results.append(f"sent {job}")       # slow work happens here, off the request path

for j in ["a", "b"]:
    jobs.put(j)
jobs.put(None)

t = threading.Thread(target=worker)
t.start()
t.join()
print(results)

# OUTPUT:
# ['sent a', 'sent b']`],
        [`<b>Advantages:</b> decoupling in time, load levelling, retries, scalable parallel workers, priorities. A priority queue handles urgent work first.`,
            r`import queue

pq = queue.PriorityQueue()
pq.put((2, "newsletter"))                   # lower number = higher priority
pq.put((1, "password reset"))
pq.put((3, "report"))

while not pq.empty():
    print(pq.get()[1])

# OUTPUT:
# password reset
# newsletter
# report`],
        [`<b>Disadvantages:</b> extra infrastructure, harder debugging, duplicates and reordering, and "poison" messages that fail forever unless moved to a dead-letter queue.`,
            r`def process(msg):
    if msg == "bad":
        raise ValueError("cannot parse")
    return "done " + msg

dead_letters = []
for m in ["a", "bad", "b"]:
    try:
        print(process(m))
    except ValueError:
        dead_letters.append(m)              # park it for inspection, keep going

print("dead letters:", dead_letters)

# OUTPUT:
# done a
# done b
# dead letters: ['bad']`],
        [`<b>Limitations:</b> <code>queue.Queue</code> lives in one process's memory: it cannot span machines and loses its messages on restart. Real systems need a durable broker.`,
            r`import queue

q = queue.Queue()
q.put("job1")

q = queue.Queue()                           # "restart": a new process starts with a new, empty queue
print(q.qsize(), "messages survived")       # use RabbitMQ / Redis / SQS / Kafka for durability

# OUTPUT:
# 0 messages survived`],
        `
   Producer(s)           +----------------------+          Consumer(s)
  +-----------+  put()  | [m4][m3][m2][m1]     |  get()  +-----------+
  | web app   |-------->|   FIFO queue / topic |-------->| worker 1  |
  +-----------+         |   (durable broker)   |-------->| worker 2  |
                        +----------+-----------+         +-----------+
                                   | repeated failure
                                   v
                              [ dead-letter queue ]
`,
        `Decide delivery guarantees first (at-most-once, at-least-once, effectively-once through idempotency) and ordering needs (per key, not global). Size queues for back-pressure, set visibility timeouts and retry limits with backoff, and monitor queue depth and age as the primary health signal.`
    ),

    'CQRS': dd(
        [`<b>CQRS</b> (Command Query Responsibility Segregation) uses separate models for changing state (<b>commands</b>) and reading it (<b>queries</b>). The write side enforces rules and records events; the read side keeps data shaped for fast queries.`,
            r`class Account:                             # write side: validates and records events
    def __init__(self): self.events = []
    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.events.append(("deposit", amount))

class BalanceView:                          # read side: projection built from events
    def __init__(self): self.balance = 0
    def apply(self, event):
        kind, amount = event
        self.balance += amount if kind == "deposit" else -amount

acc, view = Account(), BalanceView()
acc.deposit(100)
acc.deposit(50)
for ev in acc.events:
    view.apply(ev)
print(view.balance)

# OUTPUT:
# 150`],
        [`Reads and writes have different needs: writes want normalised data and strict rules; reads want pre-joined, denormalised rows and massive scale. One model compromises on both.`,
            r`customers = {1: "Abaji"}                   # write model: normalised tables
orders = [{"id": 10, "cust": 1, "total": 50}]

read_model = [                              # read model: denormalised, no join at query time
    {"id": o["id"], "customer": customers[o["cust"]], "total": o["total"]}
    for o in orders
]
print(read_model)

# OUTPUT:
# [{'id': 10, 'customer': 'Abaji', 'total': 50}]`],
        [`Applications dispatch commands (change something, return nothing meaningful) to command handlers and queries (return data, change nothing) to query handlers, often scaling the read database separately.`,
            r`store = {}

def create_user(cmd):                       # command handler: changes state
    store[cmd["id"]] = cmd["name"]

def get_user(query):                        # query handler: pure read
    return store.get(query["id"])

COMMANDS = {"create_user": create_user}
QUERIES = {"get_user": get_user}

COMMANDS["create_user"]({"id": 1, "name": "Abaji"})
print(QUERIES["get_user"]({"id": 1}))

# OUTPUT:
# Abaji`],
        [`<b>Advantages:</b> read and write sides optimised and scaled independently, simple query models, and clearer intent. Projections answer questions in constant time.`,
            r`from collections import Counter

events = ["view", "buy", "view", "view"]
counts = Counter(events)                    # projection: pre-aggregated for the dashboard
print(dict(counts))
print(counts["view"])                       # O(1) read, no scan of raw events

# OUTPUT:
# {'view': 3, 'buy': 1}
# 3`],
        [`<b>Disadvantages:</b> more moving parts, two models to keep in sync, and eventual consistency: right after a write, a read may return old data.`,
            r`write_log = []
read_balance = 0

write_log.append(100)                       # command accepted
print("read right after write:", read_balance)   # projection has not run yet

read_balance = sum(write_log)               # projector catches up
print("read after projection :", read_balance)

# OUTPUT:
# read right after write: 0
# read after projection : 100`],
        [`<b>Limitations:</b> not worth it for simple CRUD. Projections must be rebuildable, and rebuilding from a long event history takes time, so plan snapshots.`,
            r`events = [("deposit", 1)] * 1000

balance = sum(amount for _, amount in events)      # full replay from the first event
print("rebuilt from", len(events), "events:", balance)   # snapshots avoid replaying everything

# OUTPUT:
# rebuilt from 1000 events: 1000`],
        `
   Command ---> [ Command handler ] ---> Write model --+--> Event store
                 validates rules                       |
                                                       | events (async)
                                                       v
   Query   <--- [ Query handler ]   <--- Read model <-- Projector
                 no business rules      (denormalised)
`,
        `Introduce CQRS only where read and write workloads or models diverge strongly (reporting, high-read APIs, complex domains). Start with the logical split in one codebase and one database, add separate read stores later, and surface eventual consistency in the UX. It combines naturally with event sourcing but does not require it.`
    ),
};
