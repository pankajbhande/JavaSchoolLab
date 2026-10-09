import { Topic } from '../coreJava';

export const springPrimary: Topic = {
    id: 'sb-primary',
    name: "@Primary",
    beginner: [
        {
            content: `<h3>"Use Me Unless Told Otherwise"</h3>
<code>@Primary</code> marks one bean as the default choice among several of the same type. It is declared on the <strong>bean</strong>, and it applies to every injection point that does not say otherwise.<br><br>

The other beans are not removed or hidden. They still exist and can still be reached - by <code>@Qualifier</code>, by name, or in a <code>List</code>. <code>@Primary</code> only settles the question "which one when nobody said".<br>`,
            codeExamples: [
                `@Component
@Primary
public class StripeGateway implements PaymentGateway { }

@Component
public class PaypalGateway implements PaymentGateway { }

@Service
public class OrderService {
    public OrderService(PaymentGateway gateway) { }   // -> StripeGateway
}

// Without @Primary this is the familiar startup failure:
//   NoUniqueBeanDefinitionException: expected single matching bean
//   but found 2: paypalGateway,stripeGateway
//
// With it, the ambiguity is resolved once, on the bean, rather than at
// every injection point.`,
                `// On a @Bean method it goes next to @Bean:

@Configuration
public class DataConfig {

    @Bean
    @Primary
    public DataSource primaryDataSource(ShopProperties p) { ... }

    @Bean
    public DataSource replicaDataSource(ShopProperties p) { ... }
}

// And the exceptions stay explicit about being exceptions:
@Repository
public class ReportRepository {
    public ReportRepository(@Qualifier("replicaDataSource") DataSource ds) { }
}`
            ]
        },
        {
            content: `<h3>The Rule: Exactly One Per Type</h3>
Two <code>@Primary</code> beans of the same type is an error - but a delayed one. Spring only complains when an unqualified injection point actually forces the choice.<br>`,
            codeExamples: [
                `@Component @Primary public class StripeGateway implements PaymentGateway {}
@Component @Primary public class PaypalGateway implements PaymentGateway {}

// If NOTHING injects a bare PaymentGateway, the application starts.
// The moment something does:
//
// OUTPUT:
// NoUniqueBeanDefinitionException: No qualifying bean of type
// 'com.shop.PaymentGateway' available: more than one 'primary' bean
// found among candidates: [paypalGateway, stripeGateway]
//
// Read that message carefully - "more than one 'primary'" is a
// different problem from "found 2". The first means two beans claim
// to be the default; the second means none does.

// This bites most often when @Primary is added in two places by two
// people, or when a library bean is already @Primary and you add
// another without checking.`
            ]
        },
        {
            content: `<h3>Precedence</h3>
<code>@Qualifier</code> always beats <code>@Primary</code>. The injection point is more specific than the bean, so it wins.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  Candidates of the required type
        |
        v
  @Qualifier at the injection point?   -> yes: that bean wins
        |  no
        v
  Exactly one bean marked @Primary?    -> yes: that bean wins
        |  no
        v
  @Priority(n) on the candidates?      -> yes: lowest n wins
        |  no
        v
  A bean whose NAME equals the field
  or parameter name?                   -> yes: that bean wins
        |  no
        v
  NoUniqueBeanDefinitionException</pre>
<br>
The intended pattern falls out of this: mark the common case <code>@Primary</code> so the majority of the codebase needs no annotation at all, and use <code>@Qualifier</code> at the handful of places that need the other one. The annotations then appear exactly where something unusual is happening.<br>`
        },
        {
            content: `<h3>The Case You Will Actually Meet: Two DataSources</h3>
The most common real use of <code>@Primary</code>, and the one where leaving it out produces a confusing failure.<br>`,
            codeExamples: [
                `@Configuration
public class DataConfig {

    @Bean
    @Primary                                            // <-- required
    @ConfigurationProperties("app.datasource.primary")
    public DataSourceProperties primaryProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary                                            // <-- required
    public DataSource primaryDataSource(
            @Qualifier("primaryProperties") DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }

    @Bean
    @ConfigurationProperties("app.datasource.replica")
    public DataSourceProperties replicaProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource replicaDataSource(
            @Qualifier("replicaProperties") DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }
}

// Why @Primary is not optional here: Spring Boot's own
// auto-configuration injects a bare DataSource to build the
// EntityManagerFactory, the JdbcTemplate and the transaction manager.
// Those are not your code, so you cannot add a @Qualifier to them.
//
// Without @Primary:
//   NoUniqueBeanDefinitionException while creating
//   'entityManagerFactory' - expected single matching bean but found
//   2: primaryDataSource,replicaDataSource
//
// The error names a bean you never wrote, which is what makes it
// confusing. @Primary is how you answer a question asked by code you
// do not control.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>What <code>@Primary</code> Does Not Do</h3>
Three limits, each of which has surprised someone.<br><br>

<table>
<tr><th>Expectation</th><th>Reality</th></tr>
<tr><td>It filters collection injection</td><td><strong>No.</strong> <code>List&lt;PaymentGateway&gt;</code> still receives every implementation, primary or not. <code>@Primary</code> answers "which one", never "which ones".</td></tr>
<tr><td>It orders beans</td><td>No. Sequence in an injected <code>List</code> comes from <code>@Order</code> / <code>Ordered</code>. A primary bean is not placed first.</td></tr>
<tr><td>It affects <code>getBeansOfType()</code></td><td>No - that returns all of them. Only <code>getBean(Type.class)</code> honours primary.</td></tr>
</table>`,
            codeExamples: [
                `@Component @Primary @Order(2) class StripeGateway implements PaymentGateway {}
@Component          @Order(1) class PaypalGateway implements PaymentGateway {}

@Service
public class GatewayRouter {

    public GatewayRouter(PaymentGateway one,            // -> Stripe (primary)
                         List<PaymentGateway> all,      // -> BOTH
                         Map<String, PaymentGateway> byName) {

        // all  == [PaypalGateway, StripeGateway]   <- @Order, not @Primary
        // byName == { "stripeGateway": ..., "paypalGateway": ... }
    }
}

// This is the intended design, not a gap: a fallback strategy list and
// a default choice are different questions, so they use different
// annotations.`
            ]
        },
        {
            content: `<h3><code>@Primary</code> vs <code>@Priority</code></h3>
Both break a tie on the bean side, and they behave differently in one way that matters.<br><br>

<table>
<tr><th></th><th><code>@Primary</code></th><th><code>@Priority</code></th></tr>
<tr><td>From</td><td>Spring</td><td>JSR-250 (<code>jakarta.annotation</code>)</td></tr>
<tr><td>Value</td><td>None - it is a flag</td><td>An <code>int</code>; <strong>lower wins</strong></td></tr>
<tr><td>Several allowed?</td><td>No - two is an error</td><td>Yes - they are ranked</td></tr>
<tr><td>Precedence</td><td>Beats <code>@Priority</code></td><td>Only consulted if no primary</td></tr>
<tr><td>On <code>@Bean</code> methods</td><td>Yes</td><td><strong>No</strong> - class-level only</td></tr>
</table>
<br>
Use <code>@Primary</code> by default. <code>@Priority</code> earns its place when there are three or more candidates that need a genuine fallback order rather than one winner - a chain of resolvers, say, where the ranking is meaningful in itself.<br>`,
            codeExamples: [
                `@Component @Priority(1) class DatabaseResolver  implements ConfigResolver {}
@Component @Priority(2) class FileResolver      implements ConfigResolver {}
@Component @Priority(3) class DefaultResolver   implements ConfigResolver {}

public ConfigService(ConfigResolver resolver) { }   // -> DatabaseResolver

// The ranking is documented once, on the beans, and stays meaningful
// if the top one is later removed - FileResolver takes over with no
// other edit. @Primary would have needed moving.
//
// Note @Priority does NOT work on a @Bean method:
//
//   @Bean @Priority(1) public ConfigResolver resolver() { ... }  // ignored
//
// It is read from the bean's CLASS. For @Bean-declared beans, use
// @Primary.`
            ]
        },
        {
            content: `<h3>Overriding an Auto-Configured Bean</h3>
A frequent misuse: reaching for <code>@Primary</code> to beat Spring Boot, when defining the bean is already enough.<br>`,
            codeExamples: [
                `// USUALLY UNNECESSARY.
@Bean
@Primary
public ObjectMapper objectMapper() { ... }

// Boot's JacksonAutoConfiguration declares its ObjectMapper with
// @ConditionalOnMissingBean, and auto-configuration is processed AFTER
// all user configuration. So yours simply exists first and Boot's
// never registers. There is only one bean, and nothing to be primary
// over.
//
// Adding @Primary is harmless here but misleading - it implies a
// competing bean that is not there.


// WHEN IT IS GENUINELY NEEDED: the auto-configured bean is NOT
// conditional, so both exist.

@Bean
@Primary
public TaskExecutor customTaskExecutor() { ... }

// Some auto-configurations register unconditionally, or register a
// bean under a name you cannot predict. Then two beans of the type
// really do exist and @Primary decides.
//
// How to tell which situation you are in - ask the running context
// rather than guess:
//
//   context.getBeanNamesForType(ObjectMapper.class)
//   -> ["objectMapper"]                  one bean; @Primary is noise
//   -> ["objectMapper", "jacksonObjectMapper"]
//                                        two; @Primary is doing work
//
// or from the command line:
//   curl localhost:8080/actuator/beans | jq '...'`,
                `// The related trap: @Primary does not stop a bean from EXISTING.

@Bean @Primary
public DataSource appDataSource() { ... }

// If an auto-configured DataSource also exists, it is still there -
// still holding a connection pool, still opening connections, still
// participating in health checks. @Primary only means it is not
// injected by default.
//
// To actually remove it:
//     @SpringBootApplication(exclude = DataSourceAutoConfiguration.class)
//
// Symptom that you have this: connection counts or pool metrics twice
// what you expect, or a health endpoint reporting a database you
// thought you had replaced.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does <code>@Primary</code> do?</td><td>Marks one bean as the default among several of its type, for every injection point that carries no qualifier.</td></tr>
<tr><td>Where is it declared?</td><td>On the bean - a <code>@Component</code> class or a <code>@Bean</code> method - not at the injection point.</td></tr>
<tr><td><code>@Primary</code> or <code>@Qualifier</code>?</td><td>Qualifier wins; it is more specific. Use <code>@Primary</code> for the common case and <code>@Qualifier</code> for the exceptions.</td></tr>
<tr><td>Can two beans of a type be <code>@Primary</code>?</td><td>No. The failure appears when an unqualified injection point exists: "more than one 'primary' bean found".</td></tr>
<tr><td>Does it filter <code>List&lt;T&gt;</code> injection?</td><td>No - the list still gets every implementation. It answers "which one", not "which ones".</td></tr>
<tr><td>Does it control order in a list?</td><td>No - that is <code>@Order</code> / <code>Ordered</code>.</td></tr>
<tr><td>Why is it required with two <code>DataSource</code> beans?</td><td>Boot's auto-configuration injects a bare <code>DataSource</code> to build the entity manager factory and transaction manager. You cannot add a qualifier to Boot's code, so the choice must be made on the bean.</td></tr>
<tr><td><code>@Primary</code> vs <code>@Priority</code>?</td><td><code>@Primary</code> is a flag and only one is allowed; <code>@Priority(int)</code> ranks several, lowest wins, and is only consulted if no primary exists. <code>@Priority</code> is ignored on <code>@Bean</code> methods.</td></tr>
<tr><td>Do you need <code>@Primary</code> to override an auto-configured bean?</td><td>Usually not - Boot's bean is <code>@ConditionalOnMissingBean</code> and backs off. Only needed when the auto-configured bean is unconditional, so both exist.</td></tr>
<tr><td>Does <code>@Primary</code> remove the other beans?</td><td>No. They are constructed and hold their resources; they are simply not the default. Use an auto-configuration exclusion to remove one.</td></tr>
</table>`
        }
    ]
};
