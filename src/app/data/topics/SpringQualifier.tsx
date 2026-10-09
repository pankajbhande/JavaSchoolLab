import { Topic } from '../coreJava';

export const springQualifier: Topic = {
    id: 'sb-qualifier',
    name: "@Qualifier",
    beginner: [
        {
            content: `<h3>Choosing Between Beans of the Same Type</h3>
Injection is by type. When two beans satisfy the same type, Spring cannot choose, and startup fails. <code>@Qualifier</code> is how you make the choice at the injection point.<br>`,
            codeExamples: [
                `@Component public class StripeGateway implements PaymentGateway { }
@Component public class PaypalGateway implements PaymentGateway { }

@Service
public class OrderService {
    public OrderService(PaymentGateway gateway) { }
}

// OUTPUT:
// NoUniqueBeanDefinitionException: No qualifying bean of type
// 'com.shop.PaymentGateway' available: expected single matching bean
// but found 2: paypalGateway,stripeGateway`,
                `// Fixed - the injection point names the one it wants.
@Service
public class OrderService {

    private final PaymentGateway gateway;

    public OrderService(@Qualifier("stripeGateway") PaymentGateway gateway) {
        this.gateway = gateway;
    }
}

// The annotation goes on the PARAMETER, not the constructor. On a
// field it sits alongside @Autowired:
//
//   @Autowired
//   @Qualifier("stripeGateway")
//   private PaymentGateway gateway;`
            ]
        },
        {
            content: `<h3>What the Value Actually Matches</h3>
This is the part that is usually half-understood. <code>@Qualifier("x")</code> matches a bean in <strong>two</strong> ways, and the second is the one people forget.<br><br>

<table>
<tr><th>Matched against</th><th>Example</th></tr>
<tr><td>A <code>@Qualifier</code> on the bean declaration</td><td><code>@Component @Qualifier("card") class StripeGateway</code> - matched by <code>@Qualifier("card")</code></td></tr>
<tr><td>The bean's <strong>name</strong>, as a fallback</td><td><code>@Component class StripeGateway</code> - matched by <code>@Qualifier("stripeGateway")</code></td></tr>
</table>
<br>
Most code uses the fallback without realising, which is why <code>@Qualifier</code> is commonly described as "inject by name". It is not - the name is the second thing it tries. Declaring the qualifier on the bean is the better habit, because it decouples the injection point from the class name.<br>`,
            codeExamples: [
                `// The fragile form - the qualifier is the bean name, which is the
// class name. Renaming StripeGateway to StripeAdapter silently breaks
// every injection point that named it.

@Component
public class StripeGateway implements PaymentGateway { }

public OrderService(@Qualifier("stripeGateway") PaymentGateway g) { }


// The durable form - the qualifier is a stated role, independent of
// the class name. Rename the class freely.

@Component
@Qualifier("card")
public class StripeGateway implements PaymentGateway { }

@Component
@Qualifier("wallet")
public class PaypalGateway implements PaymentGateway { }

public OrderService(@Qualifier("card") PaymentGateway g) { }

// This also reads better: "card" says why this gateway was chosen.
// "stripeGateway" only says which class it is.`,
                `// On @Bean methods the same applies. Without a qualifier, the
// method name is the fallback:

@Configuration
public class DataConfig {

    @Bean
    @Qualifier("readWrite")
    public DataSource primaryDataSource(...) { ... }

    @Bean
    @Qualifier("readOnly")
    public DataSource replicaDataSource(...) { ... }
}

@Repository
public class ReportRepository {
    public ReportRepository(@Qualifier("readOnly") DataSource ds) { }
}

// "readOnly" states the requirement. If the replica is later moved,
// renamed, or replaced by a different pool, the injection point is
// still correct.`
            ]
        },
        {
            content: `<h3><code>@Qualifier</code> vs <code>@Primary</code></h3>
They solve the same problem from opposite ends, and the choice is about where the knowledge belongs.<br><br>

<table>
<tr><th></th><th><code>@Primary</code></th><th><code>@Qualifier</code></th></tr>
<tr><td>Declared on</td><td>The bean</td><td>The injection point</td></tr>
<tr><td>Says</td><td>"Use me unless told otherwise"</td><td>"I want that specific one"</td></tr>
<tr><td>Scope of effect</td><td>Every unqualified injection point</td><td>One injection point</td></tr>
<tr><td>Precedence</td><td>Lower</td><td><strong>Higher</strong> - a qualifier always beats a primary</td></tr>
</table>
<br>
The combination is the useful pattern: mark the common case <code>@Primary</code> so most code needs no annotation, and use <code>@Qualifier</code> at the few places that need the exception.<br>`,
            codeExamples: [
                `@Component @Primary
public class StripeGateway implements PaymentGateway { }

@Component
@Qualifier("legacy")
public class PaypalGateway implements PaymentGateway { }

// The 20 normal injection points stay clean:
public OrderService(PaymentGateway gateway) { }              // Stripe

// The one exception is explicit about being one:
public MigrationJob(@Qualifier("legacy") PaymentGateway g) { }  // PayPal

// Without @Primary, all 21 would need a qualifier - and the noise
// would hide which one is unusual.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Custom Qualifier Annotations</h3>
A <code>String</code> qualifier is not checked by anything. A typo produces a startup failure at best, and at worst matches a bean you did not mean. Because <code>@Qualifier</code> works as a meta-annotation, you can make the compiler do the checking.<br>`,
            codeExamples: [
                `// Define the roles as annotations.

@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE,
          ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Qualifier                                    // <-- makes it a qualifier
public @interface Card { }

@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE,
          ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Wallet { }


// On the beans:
@Component @Card   public class StripeGateway implements PaymentGateway { }
@Component @Wallet public class PaypalGateway implements PaymentGateway { }


// At the injection point:
@Service
public class OrderService {
    public OrderService(@Card PaymentGateway gateway) { }
}

// What this buys over @Qualifier("card"):
//   * a typo is a compile error, not a startup error
//   * "find usages" on @Card works; on a string it does not
//   * renaming the role is a refactor, not a search-and-replace
//   * the IDE autocompletes the available roles`,
                `// Qualifiers with attributes, for a family of related choices.

@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE,
          ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Gateway {
    Provider value();
    boolean sandbox() default false;
}

public enum Provider { STRIPE, PAYPAL, ADYEN }

@Component @Gateway(Provider.STRIPE)
public class StripeGateway implements PaymentGateway { }

@Component @Gateway(value = Provider.STRIPE, sandbox = true)
public class StripeSandboxGateway implements PaymentGateway { }

// EVERY attribute must match for the bean to be selected:
public OrderService(@Gateway(Provider.STRIPE) PaymentGateway g) { }
// -> StripeGateway. The sandbox one has sandbox=true, which does not
//    match the default false, so it is excluded.

public TestHarness(@Gateway(value = Provider.STRIPE, sandbox = true)
                   PaymentGateway g) { }
// -> StripeSandboxGateway.`
            ]
        },
        {
            content: `<h3>Qualifiers Filter Collections Too</h3>
Less known, and genuinely useful: putting a qualifier on a <code>List</code> injection point selects a <em>subset</em> of the implementations rather than one bean.<br>`,
            codeExamples: [
                `@Component @Qualifier("preCheck")  class AmountValidator  implements Validator {}
@Component @Qualifier("preCheck")  class AddressValidator implements Validator {}
@Component @Qualifier("postCheck") class StockValidator   implements Validator {}
@Component @Qualifier("postCheck") class FraudValidator   implements Validator {}

@Service
public class OrderValidator {

    private final List<Validator> before;
    private final List<Validator> after;

    public OrderValidator(@Qualifier("preCheck")  List<Validator> before,
                          @Qualifier("postCheck") List<Validator> after) {
        this.before = before;
        this.after = after;
    }
}

// 'before' gets two validators, 'after' gets the other two. No
// registry, no manual filtering, no if-statements - the grouping is
// declared on the beans themselves.
//
// Adding a validator to a phase is one annotation on a new class.

// CAUTION: a qualified List that matches NOTHING fails at startup with
// NoSuchBeanDefinitionException, the same as any other empty
// collection injection. If a phase may legitimately be empty:
//     ObjectProvider<Validator> provider;   // then .stream()
// or mark the injection point not required.`
            ]
        },
        {
            content: `<h3>Where It Goes Wrong</h3>`,
            codeExamples: [
                `// 1. A TYPO, OR A NAME THAT DOES NOT EXIST.

public OrderService(@Qualifier("stripGateway") PaymentGateway g) { }
//                               ^ missing 'e'

// OUTPUT:
// NoSuchBeanDefinitionException: No qualifying bean of type
// 'com.shop.PaymentGateway' available: expected at least 1 bean which
// qualifies as autowire candidate. Dependency annotations:
// {@org.springframework.beans.factory.annotation.Qualifier("stripGateway")}
//
// Note it says "at least 1" - the qualifier excluded BOTH candidates,
// so the message is about zero matches even though two beans exist.
// That wording sends people looking for a missing bean rather than a
// misspelt qualifier. Read the "Dependency annotations" line.


// 2. THE DECAPITALISATION RULE, when relying on the name fallback.

@Component public class JWTService { }         // bean name: "JWTService"

@Qualifier("jwtService")                       // FAILS
@Qualifier("JWTService")                       // correct

// Two leading capitals means the name is left alone. Another reason to
// declare an explicit qualifier rather than lean on the class name.`,
                `// 3. QUALIFYING A BEAN THAT DOES NOT EXIST YET AT THAT NAME.
//    @Bean method names are the fallback qualifier, so renaming the
//    METHOD renames the bean and breaks the qualifier silently at the
//    other end of the codebase.

@Bean
public DataSource replicaDataSource(...) { ... }     // renamed to readReplica()

public ReportRepository(@Qualifier("replicaDataSource") DataSource ds) { }
// -> now fails at startup, and the compiler said nothing.
//
// With @Qualifier("readOnly") declared on the @Bean method, the rename
// is invisible to callers.


// 4. EXPECTING @Qualifier TO PICK BETWEEN TWO @Primary BEANS.
//    It does, and that is fine - but two @Primary beans of one type is
//    an error in its own right the moment ANY unqualified injection
//    point exists:
//
//    NoUniqueBeanDefinitionException: more than one 'primary' bean
//    found among candidates: [stripeGateway, paypalGateway]
//
//    @Primary means "the default". There can only be one.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is <code>@Qualifier</code> for?</td><td>Selecting one bean at an injection point when several match the required type.</td></tr>
<tr><td>What does its value match?</td><td>A <code>@Qualifier</code> declared on the bean first; failing that, the bean name as a fallback.</td></tr>
<tr><td>Why prefer declaring a qualifier on the bean?</td><td>It decouples the injection point from the class or method name, so renaming does not break wiring, and it states the bean's role rather than its identity.</td></tr>
<tr><td><code>@Qualifier</code> vs <code>@Primary</code>?</td><td><code>@Primary</code> is on the bean and sets a default for every unqualified injection point. <code>@Qualifier</code> is on the injection point and wins over <code>@Primary</code>.</td></tr>
<tr><td>Can there be two <code>@Primary</code> beans of one type?</td><td>No - any unqualified injection point then fails with "more than one 'primary' bean found".</td></tr>
<tr><td>How do you make a type-safe qualifier?</td><td>Define an annotation meta-annotated with <code>@Qualifier</code>. Typos become compile errors and the IDE can find usages.</td></tr>
<tr><td>Can a custom qualifier carry attributes?</td><td>Yes, and every attribute must match - including defaults - for a bean to be selected.</td></tr>
<tr><td>What does <code>@Qualifier</code> on a <code>List</code> do?</td><td>Filters the collection to the beans carrying that qualifier, which is a clean way to declare groups or phases.</td></tr>
<tr><td>What happens on a misspelt qualifier?</td><td><code>NoSuchBeanDefinitionException</code> saying "expected at least 1 bean which qualifies" - it reads as a missing bean, so check the "Dependency annotations" line in the message.</td></tr>
<tr><td>Where does the qualifier annotation go on a constructor?</td><td>On the parameter, not the constructor. On a field it accompanies <code>@Autowired</code>.</td></tr>
</table>`
        }
    ]
};
