import { Topic } from '../coreJava';

export const springAutowired: Topic = {
    id: 'sb-autowired',
    name: "@Autowired",
    beginner: [
        {
            content: `<h3>"Find a Bean of This Type and Put It Here"</h3>
<code>@Autowired</code> marks an injection point. Spring looks for a bean assignable to the declared type and supplies it.<br><br>

The important word is <strong>type</strong>. The field or parameter name is not what Spring matches on - it is only consulted as a tie-breaker when several beans of the same type exist.<br>`,
            codeExamples: [
                `@Service
public class OrderService {

    @Autowired
    private PaymentGateway gateway;
}

// Spring looks for a bean assignable to PaymentGateway.
// StripeGateway implements it, so StripeGateway is injected.
//
// Rename the field to 'paypal' and nothing changes - still Stripe.
// The name is irrelevant while there is exactly one candidate.`
            ]
        },
        {
            content: `<h3>The Four Places It Can Go</h3>

<table>
<tr><th>Position</th><th>Needed?</th><th>Notes</th></tr>
<tr><td>Constructor</td><td><strong>Optional</strong> since Spring 4.3 when the class has one constructor</td><td>The recommended form. Most modern code omits the annotation entirely.</td></tr>
<tr><td>Setter</td><td>Required</td><td>Without it the setter is never called and the field stays null.</td></tr>
<tr><td>Field</td><td>Required</td><td>Set by reflection. Shortest and least testable.</td></tr>
<tr><td>Any method</td><td>Required</td><td>Less known: <em>any</em> method can be an injection point, with every parameter resolved.</td></tr>
</table>`,
            codeExamples: [
                `// The fourth form - an arbitrary method, called once after
// construction with all parameters injected.

@Service
public class ReportService {

    private Map<String, Formatter> formatters;
    private Clock clock;

    @Autowired
    void configure(List<Formatter> formatters, Clock clock) {
        this.formatters = formatters.stream()
            .collect(toMap(Formatter::name, identity()));
        this.clock = clock;
    }
}

// Occasionally useful for injecting several dependencies while doing
// derived setup in one place. It is still setter injection with the
// same drawbacks - the fields cannot be final, and the object is
// briefly incomplete. Prefer a constructor plus @PostConstruct.`,
                `// The single-constructor rule, which is why @Autowired has largely
// disappeared from modern Spring code.

@Service
public class OrderService {

    private final PaymentGateway gateway;

    public OrderService(PaymentGateway gateway) {    // no @Autowired
        this.gateway = gateway;
    }
}

// With TWO constructors, Spring will not guess - exactly one must be
// annotated, or startup fails with:
//   BeanInstantiationException: No default constructor found`
            ]
        },
        {
            content: `<h3>When the Match Is Not Exactly One</h3>
Three outcomes, and the second and third are the ones you will meet.<br><br>

<table>
<tr><th>Candidates</th><th>Result</th></tr>
<tr><td>One</td><td>Injected.</td></tr>
<tr><td>None</td><td><code>NoSuchBeanDefinitionException</code> at startup - unless <code>required = false</code>.</td></tr>
<tr><td>Several</td><td><code>NoUniqueBeanDefinitionException</code>, unless resolved by <code>@Qualifier</code>, <code>@Primary</code>, or a bean name equal to the field/parameter name.</td></tr>
</table>
<br>
Spring applies them in that last order: <code>@Qualifier</code> first, then <code>@Primary</code>, then the name match. That final fallback resolves silently and is worth avoiding deliberately - it makes a working application depend on a variable name, so a rename during cleanup breaks startup.<br>`,
            codeExamples: [
                `// Two candidates, no disambiguation:
@Component public class StripeGateway  implements PaymentGateway { }
@Component public class PaypalGateway  implements PaymentGateway { }

@Service
public class OrderService {
    public OrderService(PaymentGateway gateway) { }      // which one?
}

// OUTPUT:
// NoUniqueBeanDefinitionException: No qualifying bean of type
// 'com.shop.PaymentGateway' available: expected single matching bean
// but found 2: paypalGateway,stripeGateway


// Three fixes, in order of clarity:

// 1. @Qualifier at the injection point - explicit, and survives renames
//    of the parameter (though not of the bean).
public OrderService(@Qualifier("stripeGateway") PaymentGateway gateway) { }

// 2. @Primary on the default - good when one is genuinely the usual
//    choice and the other is the exception.
@Component @Primary
public class StripeGateway implements PaymentGateway { }

// 3. The name fallback - works, but by accident:
public OrderService(PaymentGateway stripeGateway) { }
//                                 ^ matches the bean name. Rename this
//                                   parameter and startup breaks.`
            ]
        },
        {
            content: `<h3>Injecting Several, and Injecting Maybe-None</h3>
Two cases the by-type rule handles specially.<br>`,
            codeExamples: [
                `// ALL implementations - not an error, a feature. This is how the
// Strategy pattern is wired.

@Service
public class OrderValidator {

    private final List<Validator> validators;      // every implementation

    public OrderValidator(List<Validator> validators) {
        this.validators = validators;
    }
}

// Adding a validator is a new @Component and nothing else.
//
// Sequence is undefined unless declared - use @Order or Ordered:
//     @Component @Order(1) class AmountValidator implements Validator
//
// A Map gives them keyed by BEAN NAME, which is how you dispatch:
//     Map<String, Validator> byName;
//     byName.get(request.type()).check(order);
//
// CAUTION: an empty List is treated as "no candidates", so a
// List<Validator> with no implementations fails at startup with
// NoSuchBeanDefinitionException. If zero is legal:
//     @Autowired(required = false) private List<Validator> validators;
//     // or take ObjectProvider<Validator> and call .stream()`,
                `// OPTIONAL - four ways, worst to best.

// (a) required = false - the field stays null and every use site
//     needs a null check.
@Autowired(required = false)
private AuditService audit;

// (b) @Nullable - same effect, but the intent is in the type system
//     and static analysis can see it.
public OrderService(@Nullable AuditService audit) { }

// (c) Optional<T> - the absence is in the signature, so the compiler
//     forces the caller to deal with it.
public OrderService(Optional<AuditService> audit) {
    this.audit = audit.orElse(AuditService.NO_OP);
}

// (d) ObjectProvider<T> - the most capable. Lazy, handles zero and
//     many without throwing, and resolves a fresh prototype per call.
public OrderService(ObjectProvider<AuditService> audit) {
    this.audit = audit.getIfAvailable(() -> AuditService.NO_OP);
}

// (b), (c) and (d) all keep the field final. (a) does not.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Generics Are Part of the Type</h3>
Spring matches the full generic type, not the raw one. This is more useful than it first appears, and it removes most of the need for qualifiers.<br>`,
            codeExamples: [
                `@Component class MoneyConverter  implements Converter<String, Money>   { }
@Component class InstantConverter implements Converter<String, Instant> { }

@Service
public class Pricing {
    // Unambiguous - two beans implement Converter, but only one
    // implements Converter<String, Money>.
    public Pricing(Converter<String, Money> converter) { }
}

// Works through the whole hierarchy:
public interface Repository<T> { }
@Component class OrderRepository    implements Repository<Order> { }
@Component class CustomerRepository implements Repository<Customer> { }

public Service(Repository<Order> orders) { }        // resolves correctly

// And with collections, the element type is respected:
public Service(List<Handler<OrderEvent>> handlers) { }
// -> only the handlers for OrderEvent, not every Handler.

// LIMIT: type erasure at the injection point still applies to raw
// declarations. Injecting a raw 'Converter converter' matches both and
// fails with NoUniqueBeanDefinitionException - the generics have to be
// written for Spring to use them.`
            ]
        },
        {
            content: `<h3>The Full Resolution Algorithm</h3>
Precisely what Spring does at an injection point, in order:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  1  Collect every bean assignable to the required type,
     including generic parameters

  2  Discard any bean marked autowireCandidate = false

  3  If a @Qualifier is present, keep only beans matching it
     (bean name, or a custom qualifier annotation)

  4  If several remain, keep those marked @Primary
        -> two @Primary beans of one type is itself an error:
           NoUniqueBeanDefinitionException: more than one 'primary'

  5  If several remain, apply @Priority(n) - lowest number wins

  6  If several remain, keep the bean whose NAME equals the
     field or parameter name

  7  Exactly one   -> inject
     Zero          -> NoSuchBeanDefinitionException
                      (unless required=false / Optional / @Nullable)
     More than one -> NoUniqueBeanDefinitionException</pre>
<br>
One rule sits outside this list: <strong>a bean is never a candidate for injection into itself</strong> unless it is the only option. That is what allows a <code>@Bean</code> method taking a <code>List&lt;Validator&gt;</code> to live inside a configuration class that also declares a <code>Validator</code>.<br>`
        },
        {
            content: `<h3><code>@Autowired</code> vs <code>@Inject</code> vs <code>@Resource</code></h3>
Three annotations do overlapping jobs, and mixing them in one codebase produces "why did it inject that one" questions.<br><br>

<table>
<tr><th></th><th><code>@Autowired</code></th><th><code>@Inject</code></th><th><code>@Resource</code></th></tr>
<tr><td>From</td><td>Spring</td><td>JSR-330</td><td>JSR-250</td></tr>
<tr><td>Package</td><td><code>org.springframework...</code></td><td><code>jakarta.inject</code></td><td><code>jakarta.annotation</code></td></tr>
<tr><td>Matches by</td><td><strong>Type</strong>, then name</td><td><strong>Type</strong>, then name</td><td><strong>Name</strong>, then type</td></tr>
<tr><td><code>required = false</code></td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>Qualifier</td><td><code>@Qualifier</code></td><td><code>@Named</code></td><td><code>name</code> attribute</td></tr>
</table>
<br>
Practical advice: use constructor injection and none of them. Where an annotation is unavoidable, use <code>@Autowired</code> - it is the only one with <code>required</code>, and it is what the rest of Spring's documentation assumes. <code>@Resource</code> matching by name first is the surprise that catches people, since it behaves differently from the other two in exactly the ambiguous case where it matters.<br>`,
            codeExamples: [
                `@Component("stripeGateway") class StripeGateway implements PaymentGateway {}
@Component("paypalGateway") class PaypalGateway implements PaymentGateway {}

public class OrderService {

    @Autowired
    private PaymentGateway paypalGateway;
    // by TYPE first -> two candidates -> falls through to the name
    // match -> PaypalGateway. Works, but only via the fallback.

    @Resource
    private PaymentGateway paypalGateway;
    // by NAME first -> "paypalGateway" -> PaypalGateway, immediately.
    // No ambiguity was ever considered.

    @Resource(name = "stripeGateway")
    private PaymentGateway gateway;
    // explicit name - the @Resource equivalent of @Qualifier.
}

// The difference only shows when several beans match the type, which
// is precisely when a bug is expensive. Pick one convention per
// codebase.`
            ]
        },
        {
            content: `<h3>Two Failures That Look Like <code>@Autowired</code> Problems</h3>`,
            codeExamples: [
                `// 1. INJECTING A CONFIGURATION VALUE, NOT A BEAN.
//    @Autowired resolves beans. A String, int or Duration from
//    application.properties is not a bean.

@Autowired
private String apiKey;                          // WRONG

// OUTPUT:
// NoSuchBeanDefinitionException: No qualifying bean of type
// 'java.lang.String' available
//
// (Or worse: if some @Bean method happens to return a String, that
//  unrelated value is injected instead.)

// Correct - @Value reads the Environment:
public OrderService(@Value("\${payment.api-key}") String apiKey) { }

// Better for a group of settings - typed, validated, one bean:
@ConfigurationProperties(prefix = "payment")
public record PaymentProperties(String apiKey, Duration timeout) { }`,
                `// 2. AUTOWIRING INTO AN OBJECT SPRING DID NOT CREATE.

@Component
public class OrderProcessor {
    @Autowired private OrderRepository repository;
}

// somewhere else:
OrderProcessor p = new OrderProcessor();        // compiles fine
p.process(order);

// OUTPUT:
// NullPointerException: Cannot invoke "OrderRepository.save(...)"
// because "this.repository" is null
//
// @Autowired is not a language feature. It is an instruction to the
// container, and the container never saw this object. Nothing will
// ever populate that field.
//
// The fix is to inject OrderProcessor rather than construct it. If it
// genuinely must be created per call, it should take its dependencies
// as constructor arguments and not be a bean at all.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>How does <code>@Autowired</code> resolve a dependency?</td><td>By type, including generic parameters. Name is only a tie-breaker after <code>@Qualifier</code> and <code>@Primary</code>.</td></tr>
<tr><td>Where can it be placed?</td><td>Constructor, setter, field, or any method - and on <code>@Bean</code> method parameters implicitly.</td></tr>
<tr><td>When is it optional on a constructor?</td><td>Since Spring 4.3, when the class has exactly one constructor.</td></tr>
<tr><td>What happens with no matching bean?</td><td><code>NoSuchBeanDefinitionException</code> at startup, unless <code>required = false</code>, <code>@Nullable</code>, <code>Optional</code> or <code>ObjectProvider</code> is used.</td></tr>
<tr><td>What happens with several matches?</td><td><code>NoUniqueBeanDefinitionException</code>, unless resolved by <code>@Qualifier</code>, then <code>@Primary</code>, then <code>@Priority</code>, then a matching bean name.</td></tr>
<tr><td>Can you inject every implementation of an interface?</td><td>Yes - <code>List&lt;T&gt;</code> injects them all, <code>Map&lt;String, T&gt;</code> keys them by bean name, and <code>@Order</code> controls sequence. An empty list fails unless the injection point is optional.</td></tr>
<tr><td>Are generics respected?</td><td>Yes. <code>Converter&lt;String, Money&gt;</code> resolves unambiguously among many <code>Converter</code> beans - provided the injection point declares the generics.</td></tr>
<tr><td><code>@Autowired</code> vs <code>@Resource</code>?</td><td><code>@Autowired</code> matches by type then name; <code>@Resource</code> (JSR-250) by name then type. Only <code>@Autowired</code> supports <code>required = false</code>.</td></tr>
<tr><td>Why is an <code>@Autowired</code> field null?</td><td>Almost always because the object was created with <code>new</code> rather than obtained from the container. Injection is done by Spring, not by the language.</td></tr>
<tr><td>Can <code>@Autowired</code> inject a property value?</td><td>No - it resolves beans. Use <code>@Value</code>, or bind a group of settings with <code>@ConfigurationProperties</code>.</td></tr>
</table>`
        }
    ]
};
