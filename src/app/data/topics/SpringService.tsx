import { Topic } from '../coreJava';

export const springService: Topic = {
    id: 'sb-service',
    name: "@Service",
    beginner: [
        {
            content: `<h3>The Annotation That Does Nothing</h3>
<code>@Service</code> is <code>@Component</code> with a different name. It registers a bean and adds no behaviour whatsoever - no transactions, no proxying, no validation. Swapping every <code>@Service</code> in an application for <code>@Component</code> would change nothing at runtime.<br><br>

So the interesting question is not what it does. It is <strong>what belongs in a class you have decided to call a service</strong>.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  @RestController      HTTP.  Parse the request, call one service,
                       shape the response. No business rules.
        |
        v
  @Service             The decisions. Orchestrates repositories and
                       other services, enforces the rules, owns the
                       transaction boundary.
        |
        v
  @Repository          Persistence. Queries and writes. No rules.</pre>
<br>
The layer above and the layer below are both defined by what they must <em>not</em> contain. The service is where the actual application lives.<br>`
        },
        {
            content: `<h3>What a Service Method Looks Like</h3>
The shape is consistent: validate, decide, act, return. If a method is only forwarding to a repository, it is not carrying its weight.<br>`,
            codeExamples: [
                `@Service
public class OrderService {

    private final OrderRepository orders;
    private final InventoryService inventory;
    private final PaymentGateway payments;

    public OrderService(OrderRepository orders,
                        InventoryService inventory,
                        PaymentGateway payments) {
        this.orders = orders;
        this.inventory = inventory;
        this.payments = payments;
    }

    @Transactional
    public Order place(PlaceOrderCommand command) {

        // 1. rules the type system cannot express
        if (command.items().isEmpty()) {
            throw new EmptyOrderException();
        }
        if (!inventory.canFulfil(command.items())) {
            throw new OutOfStockException(command.items());
        }

        // 2. the decision
        Order order = Order.from(command);
        Money total = order.total();

        // 3. the effects, in one transaction
        inventory.reserve(order.items());
        Receipt receipt = payments.charge(total);
        order.markPaid(receipt);

        return orders.save(order);
    }
}

// The controller calling this has one line. The repository has none of
// these rules. Everything that makes this an ORDER system rather than
// a CRUD table is in this method.`,
                `// The anti-pattern - a "service" that is a forwarding layer.

@Service
public class OrderService {

    private final OrderRepository orders;

    public Order findById(Long id)  { return orders.findById(id).orElseThrow(); }
    public List<Order> findAll()    { return orders.findAll(); }
    public Order save(Order order)  { return orders.save(order); }
    public void delete(Long id)     { orders.deleteById(id); }
}

// Every method is one line and adds nothing. This is a real cost, not
// a style complaint: the layer must be read, tested and maintained,
// and it hides the repository without abstracting it.
//
// Two honest options:
//
//  1. If there genuinely are no rules yet, let the controller use the
//     repository directly and add the service when a rule appears.
//
//  2. If rules exist but live in the CONTROLLER, move them down. That
//     is usually what has happened.
//
// A pass-through service is not "good layering" - it is a layer with
// nothing in it.`
            ]
        },
        {
            content: `<h3>The Transaction Boundary Lives Here</h3>
This is the one structural reason the service layer must exist, and it is not about tidiness.<br><br>

A business operation is usually several writes that must all happen or none of them. That unit of work has to be defined somewhere, and the service method is the only layer where the whole operation is visible.<br>`,
            codeExamples: [
                `// WRONG - @Transactional on the repository.
// Each call is its own transaction, so three separate commits.

@Repository
public class OrderRepository {
    @Transactional public Order save(Order o) { ... }        // commit 1
}

@Service
public class OrderService {
    public Order place(Command c) {
        inventory.reserve(...);       // commit 2
        Order o = orders.save(...);   // commit 1
        payments.record(...);         // commit 3
        return o;
    }
}
// If payments.record() throws, the stock is already reserved and the
// order is already saved. Nothing rolls back, because nothing was ever
// in the same transaction. The database now holds a paid-for order
// that was never paid for.


// RIGHT - one boundary, around the whole operation.
@Service
public class OrderService {

    @Transactional
    public Order place(Command c) {
        inventory.reserve(...);
        Order o = orders.save(...);
        payments.record(...);
        return o;
    }                                 // one commit, or one rollback
}

// This is also why @Transactional does NOT belong on a controller:
// the transaction would stay open while the response is serialised
// and written to the socket, holding a database connection for the
// duration of a slow client.`
            ]
        },
        {
            content: `<h3>Services Are Singletons, So They Must Be Stateless</h3>
One instance serves every request thread. A service may hold its injected dependencies and nothing else.<br><br>

<table>
<tr><th>Belongs as a field</th><th>Must not be a field</th></tr>
<tr><td>Injected collaborators (<code>final</code>)</td><td>The current user, order or request</td></tr>
<tr><td>Configuration bound at startup</td><td>Anything accumulated during a call</td></tr>
<tr><td>Immutable lookup tables built in <code>@PostConstruct</code></td><td>Counters, buffers, "last result" caches</td></tr>
</table>
<br>
Everything in the right column belongs in a method parameter or a local variable. The compiler will not stop you - this rule is enforced only by knowing it.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>The <code>Impl</code> Question</h3>
Java codebases habitually pair every service with an interface: <code>OrderService</code> and <code>OrderServiceImpl</code>. It is worth knowing why that convention exists, because the original reasons have mostly expired.<br><br>

<table>
<tr><th>Historical reason</th><th>Status today</th></tr>
<tr><td>Spring AOP needed an interface to proxy</td><td><strong>Gone.</strong> CGLIB subclass proxies have been the default since Spring Boot 2.0. A concrete class proxies fine.</td></tr>
<tr><td>Mocking frameworks needed an interface</td><td><strong>Gone.</strong> Mockito mocks concrete classes.</td></tr>
<tr><td>There might be a second implementation one day</td><td>Usually false. A one-to-one interface adds a file and an indirection for a substitution that never happens.</td></tr>
</table>
<br>
<strong>When an interface still earns its place:</strong> there really are two implementations (<code>StripeGateway</code> / <code>PayPalGateway</code>); the interface is a port in a hexagonal architecture, owned by the domain and implemented outside it; or it is published in a shared module for other teams to depend on.<br><br>

For a service with exactly one implementation and no architectural boundary, the concrete class alone is the better default. If a second implementation appears, extracting the interface is an IDE keystroke.<br>`,
            codeExamples: [
                `// A port - the interface belongs to the domain, and the adapter
// implementing it lives outside. Here the interface earns its keep,
// because the direction of the dependency is the whole point.

package com.shop.domain.port;
public interface PaymentGateway {                  // domain owns this
    Receipt charge(Money amount);
}

package com.shop.adapter.stripe;
@Service
public class StripeGateway implements PaymentGateway { }   // adapter

// The domain compiles without knowing Stripe exists.


// A one-to-one interface that earns nothing:
public interface OrderService { Order place(Command c); }

@Service
public class OrderServiceImpl implements OrderService { }

// Two files, one behaviour, and every navigation lands on the
// interface first. If nothing else implements it and no boundary
// requires it, delete the interface.`
            ]
        },
        {
            content: `<h3>Two Bugs That Live in Service Classes</h3>
Both come from the proxy, and both are silent.<br>`,
            codeExamples: [
                `// BUG 1: self-invocation. @Transactional on a method called from
//        within the same class does nothing.

@Service
public class OrderService {

    public void placeAll(List<Command> commands) {
        commands.forEach(this::place);      // 'this' is the RAW object
    }

    @Transactional
    public void place(Command c) { ... }    // NOT transactional here
}

// Called through placeAll(), each place() runs with no transaction at
// all. Called directly by a controller, it is transactional. Same
// method, different behaviour, no warning either way.
//
// Fix - put the boundary where the unit of work actually is:
@Service
public class OrderService {

    @Transactional                          // the whole batch is the unit
    public void placeAll(List<Command> commands) {
        commands.forEach(this::place);
    }

    void place(Command c) { ... }           // no annotation needed now
}

// If each item genuinely needs its OWN transaction, the loop and the
// item work must be on different beans - that is what makes the call
// cross a proxy boundary.`,
                `// BUG 2: a checked exception does not roll back.

@Service
public class OrderService {

    @Transactional
    public void place(Command c) throws PaymentFailedException {
        orders.save(order);
        throw new PaymentFailedException();   // checked
    }
}

// OUTPUT: the order is COMMITTED.
//
// @Transactional rolls back on RuntimeException and Error only. A
// checked exception propagates out and the transaction commits on the
// way - which is almost never what the author intended.
//
// Two fixes:
//   @Transactional(rollbackFor = Exception.class)
// or, better, make business failures unchecked:
//   public class PaymentFailedException extends RuntimeException { }
//
// Most modern Spring codebases use unchecked exceptions throughout for
// exactly this reason - Spring's own DataAccessException hierarchy is
// unchecked on the same principle.`
            ]
        },
        {
            content: `<h3>Services Calling Services</h3>
Legitimate and common - but it is where dependency cycles are born, and a cycle now fails startup by default.<br>`,
            codeExamples: [
                `// The cycle that appears naturally:
//   OrderService needs InvoiceService to raise an invoice
//   InvoiceService needs OrderService to look up the order
//
// Startup fails (Spring Boot 2.6+):
//   The dependencies of some of the beans in the application context
//   form a cycle

// FIX A - pass the data, do not fetch it.
//   The cheapest fix and usually the right one. InvoiceService needed
//   an Order, not an OrderService.
@Service
public class InvoiceService {
    public Invoice raise(Order order) { ... }    // no dependency at all
}

// FIX B - extract the shared work into a third bean.
//   A cycle nearly always means one responsibility living in two
//   classes; find it and give it its own name.
@Service
public class OrderPricing { Money total(Order o) { ... } }
// Both services depend on OrderPricing; neither depends on the other.

// FIX C - invert one direction with an event.
@Service
public class OrderService {
    private final ApplicationEventPublisher events;

    @Transactional
    public Order place(Command c) {
        Order order = orders.save(Order.from(c));
        events.publishEvent(new OrderPlaced(order));   // no compile-time edge
        return order;
    }
}

@Component
public class InvoiceListener {
    @TransactionalEventListener            // after commit, not before
    public void on(OrderPlaced event) { invoices.raise(event.order()); }
}

// @TransactionalEventListener over @EventListener matters here: the
// plain one fires inside the transaction, so an invoice is raised for
// an order that may still roll back.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does <code>@Service</code> do that <code>@Component</code> does not?</td><td>Nothing at runtime. It is meta-annotated with <code>@Component</code> and registers a bean identically; the value is intent and convention.</td></tr>
<tr><td>What belongs in a service?</td><td>Business rules, orchestration of repositories and other services, and the transaction boundary. Not HTTP concerns, not queries.</td></tr>
<tr><td>Why does <code>@Transactional</code> belong on the service and not the repository?</td><td>A business operation is several writes that must commit or roll back together. Only the service sees the whole unit of work; per-repository transactions commit each step separately.</td></tr>
<tr><td>Why not on the controller?</td><td>The transaction would stay open through response serialisation, holding a connection for the duration of a slow client.</td></tr>
<tr><td>Are service beans thread-safe?</td><td>Only if stateless. They are singletons shared by all request threads, so instance fields must be final dependencies and immutable configuration.</td></tr>
<tr><td>Do you need an interface for every service?</td><td>No. AOP and Mockito both work on concrete classes. Use an interface when there are real alternative implementations or when it is an architectural port.</td></tr>
<tr><td>Why does <code>@Transactional</code> not apply on a self-invoked method?</td><td>The annotation lives in the proxy; an internal call goes through <code>this</code> and never reaches it. Move the boundary, or split the beans.</td></tr>
<tr><td>Does a checked exception roll back?</td><td>No - only <code>RuntimeException</code> and <code>Error</code>. Use <code>rollbackFor</code>, or make business exceptions unchecked.</td></tr>
<tr><td>Can services call each other?</td><td>Yes, but cycles fail at startup since Boot 2.6. Pass data rather than collaborators, extract a third bean, or invert with an event.</td></tr>
<tr><td><code>@EventListener</code> vs <code>@TransactionalEventListener</code>?</td><td>The first fires immediately, inside the transaction; the second after commit. Use the second for work that must not happen if the transaction rolls back.</td></tr>
</table>`
        }
    ]
};
