import { Topic } from '../coreJava';

export const springEnvironmentAndProfiles: Topic = {
    id: 'sb-environment-and-profiles',
    name: "Environment & Profiles",
    beginner: [
        {
            content: `<h3>One Abstraction, Two Jobs</h3>
<code>Environment</code> is the part of the container that answers questions about <em>where the application is running</em>. It does exactly two things:<br><br>

<table>
<tr><th>Job</th><th>Question it answers</th></tr>
<tr><td><strong>Property sources</strong></td><td>"What is the value of <code>app.timeout</code>?" - searching command line, environment variables, property files and defaults, in a defined order.</td></tr>
<tr><td><strong>Profiles</strong></td><td>"Which environment is this?" - dev, test, prod - so that beans and configuration can differ.</td></tr>
</table>
<br>
The two work together: a profile decides which property files are loaded, and properties decide which profiles are active.<br>`
        },
        {
            content: `<h3>Property Sources Are Searched in Order</h3>
A property is not looked up in one place. Spring asks each source in turn and takes the <strong>first</strong> answer, so a source higher in the list overrides everything below it.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  HIGHEST PRECEDENCE - wins
    1  Command line arguments        --app.timeout=10s
    2  SPRING_APPLICATION_JSON       inline JSON in an env var
    3  OS environment variables      APP_TIMEOUT=10s
    4  Java system properties        -Dapp.timeout=10s
    5  application-{profile}.properties / .yml
    6  application.properties / .yml
    7  @PropertySource on a @Configuration class
    8  Defaults in code              @Value("\${app.timeout:5s}")
  LOWEST PRECEDENCE</pre>
<br>
This ordering is what makes the same jar deployable everywhere: the file inside the artifact holds sensible defaults, and the environment overrides them without a rebuild.<br>`,
            codeExamples: [
                `# application.properties - baked into the jar
app.timeout=5s
app.batch-size=100

# Overridden per environment, with no rebuild:
java -jar shop.jar --app.timeout=30s          # command line
APP_TIMEOUT=30s java -jar shop.jar            # environment variable
java -Dapp.timeout=30s -jar shop.jar          # system property

# Note the env var name. Spring's RELAXED BINDING maps
# APP_TIMEOUT -> app.timeout, because an environment variable cannot
# contain a dot. The rule: uppercase, and dots and dashes become
# underscores.
#
#   app.batch-size   ->  APP_BATCHSIZE  or  APP_BATCH_SIZE
#   spring.datasource.url -> SPRING_DATASOURCE_URL
#
# This is how every containerised deployment configures Spring.`,
                `// Reading a property - three ways, worst to best.

// (a) Environment - dynamic, untyped, read on every call.
@Service
public class ReportService {
    private final Environment env;
    public ReportService(Environment env) { this.env = env; }

    public void run() {
        Duration timeout = env.getProperty("app.timeout", Duration.class,
                                           Duration.ofSeconds(5));
    }
}

// (b) @Value - resolved once at startup, but untyped and scattered.
public ReportService(@Value("\${app.timeout:5s}") Duration timeout) { }

// (c) @ConfigurationProperties - typed, validated at startup, and the
//     whole group travels as one object.
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(@NotNull Duration timeout,
                            @Min(1) int batchSize) { }

public ReportService(AppProperties props) { }

// (c) is the one to reach for. A missing or malformed value fails at
// STARTUP with the property name in the message, rather than at the
// first call that needed it.`
            ]
        },
        {
            content: `<h3>Profiles: Beans That Only Exist Sometimes</h3>
A profile is a named tag. <code>@Profile</code> on a bean or configuration class means "register this only when that tag is active".<br>`,
            codeExamples: [
                `@Component
@Profile("prod")
public class StripeGateway implements PaymentGateway { }

@Component
@Profile("!prod")                      // dev, test, anything but prod
public class SandboxGateway implements PaymentGateway { }

// Exactly one exists at a time, so injection by type stays
// unambiguous - no @Primary, no @Qualifier.
//
// This is meaningfully safer than a branch inside one bean:
//
//   if (env.matchesProfiles("prod")) { chargeRealCard(); }
//
// With @Profile, the production gateway is not merely unused in dev -
// the class is never instantiated, holds no API key, and cannot be
// reached by any code path.


// On a whole configuration class, so a group moves together:
@Configuration
@Profile("prod")
public class ProdDataConfig {
    @Bean public DataSource dataSource(...) { ... }
    @Bean public CacheManager cacheManager(...) { ... }
}`,
                `# Activating profiles - the same precedence list applies.

spring.profiles.active=dev                    # application.properties
java -jar shop.jar --spring.profiles.active=prod
SPRING_PROFILES_ACTIVE=prod java -jar shop.jar

# Several at once - they are additive, not exclusive:
--spring.profiles.active=prod,metrics,eu-west

# A fallback when nothing is set:
spring.profiles.default=dev

# Profile-specific files are loaded ON TOP of the base file:
#
#   application.properties          always loaded
#   application-prod.properties     loaded too, and WINS on conflicts
#
# So the base file holds what is common and the profile file holds only
# the differences - not a full copy.`
            ]
        },
        {
            content: `<h3>In Tests</h3>
Profiles are how a test picks a configuration without touching production files.<br>`,
            codeExamples: [
                `@SpringBootTest
@ActiveProfiles("test")
class OrderServiceTest {
    // loads application.properties + application-test.properties
    // and registers only the @Profile("test") / @Profile("!prod") beans
}

// src/test/resources/application-test.properties
//   spring.datasource.url=jdbc:h2:mem:testdb
//   app.timeout=1s

// Overriding one value inline, without a file:
@SpringBootTest(properties = "app.timeout=100ms")
class FastTimeoutTest { }

// WATCH THE CONTEXT CACHE: every distinct combination of profiles and
// properties creates a separate application context, each costing a
// full startup. Keeping the whole suite on one @ActiveProfiles("test")
// is often the single biggest test-speed win available.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Profile Expressions</h3>
<code>@Profile</code> accepts a small boolean language, not just a name.<br><br>

<table>
<tr><th>Expression</th><th>Active when</th></tr>
<tr><td><code>@Profile("prod")</code></td><td><code>prod</code> is active</td></tr>
<tr><td><code>@Profile("!prod")</code></td><td><code>prod</code> is not active</td></tr>
<tr><td><code>@Profile({"dev", "test"})</code></td><td>either - the array is OR</td></tr>
<tr><td><code>@Profile("prod &amp; eu")</code></td><td>both</td></tr>
<tr><td><code>@Profile("(dev | test) &amp; !ci")</code></td><td>parenthesised combinations</td></tr>
</table>
<br>
A caution on <code>&amp;</code> and <code>|</code>: they cannot be mixed at the same level without brackets. <code>@Profile("a &amp; b | c")</code> throws <code>IllegalArgumentException: Malformed profile expression</code> at startup - write <code>(a &amp; b) | c</code>.<br>`,
            codeExamples: [
                `// Profile groups - one name activating several. Boot 2.4+.
//
// application.properties:
//   spring.profiles.group.prod=metrics,tracing,cloud-config
//   spring.profiles.group.local=dev,embedded-db
//
// Then --spring.profiles.active=prod activates four profiles:
//   prod, metrics, tracing, cloud-config
//
// This replaced spring.profiles.include, which was removed in 2.4
// because it behaved inconsistently in profile-specific files.

// Checking what is actually active - do this before debugging further:
@Component
class ProfileReport implements ApplicationRunner {
    private final Environment env;
    ProfileReport(Environment env) { this.env = env; }

    public void run(ApplicationArguments args) {
        System.out.println("active:   " +
            Arrays.toString(env.getActiveProfiles()));
        System.out.println("default:  " +
            Arrays.toString(env.getDefaultProfiles()));
    }
}
// OUTPUT:
// active:   [prod, metrics, tracing, cloud-config]
// default:  [default]
//
// An EMPTY active array means no profile was set, so only
// spring.profiles.default applies - a common cause of "my prod beans
// did not load".`
            ]
        },
        {
            content: `<h3>Where Profiles Do Not Reach</h3>
Three limits, and each has produced a confusing bug.<br><br>

<table>
<tr><th>Limit</th><th>Consequence</th></tr>
<tr><td>Profiles are read <strong>before</strong> the context is built</td><td>Setting <code>spring.profiles.active</code> inside a profile-specific file has no effect - the decision was already made. Boot rejects this outright.</td></tr>
<tr><td><code>@Profile</code> is evaluated at <strong>definition</strong> time</td><td>Profiles cannot change at runtime. Switching one means restarting the application.</td></tr>
<tr><td>Profiles do not filter properties already loaded</td><td>A value in <code>application.properties</code> applies under every profile unless a profile file overrides it. There is no "unset in prod".</td></tr>
</table>`,
            codeExamples: [
                `# THE FIRST LIMIT, made concrete.
#
# application-prod.properties:
#   spring.profiles.active=metrics      # <-- illegal

# OUTPUT:
# InvalidConfigDataPropertyException: Property
# 'spring.profiles.active' imported from location
# 'class path resource [application-prod.properties]' is invalid in a
# profile specific resource
#
# Use a profile GROUP instead, declared in the base file:
#   spring.profiles.group.prod=metrics`,
                `// A property source added by your own code, for values Spring cannot
// read on its own - a secrets manager, a config database, a remote
// service.
//
// It must run before the context is built, so it is an
// EnvironmentPostProcessor, not a bean.

public class VaultPropertySourceProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env,
                                       SpringApplication application) {
        if (!Arrays.asList(env.getActiveProfiles()).contains("prod")) return;

        Map<String, Object> secrets = VaultClient.fetchAll();

        // addFirst = highest precedence, addLast = lowest.
        // addLast is usually right: the secret store supplies values
        // nothing else defines, but a command-line override still wins
        // during an incident.
        env.getPropertySources()
           .addLast(new MapPropertySource("vault", secrets));
    }
}

// Registered in
//   src/main/resources/META-INF/spring.factories
//
//   org.springframework.boot.env.EnvironmentPostProcessor=\\
//     com.shop.VaultPropertySourceProcessor
//
// Note this is spring.factories - EnvironmentPostProcessor still uses
// it on Boot 3, unlike auto-configuration which moved to
// AutoConfiguration.imports.`
            ]
        },
        {
            content: `<h3>Two Failures Worth Recognising</h3>`,
            codeExamples: [
                `// 1. NO BEAN OF A TYPE, BECAUSE EVERY CANDIDATE IS PROFILED OUT.

@Component @Profile("prod") class StripeGateway  implements PaymentGateway {}
@Component @Profile("dev")  class SandboxGateway implements PaymentGateway {}

// Running with no profile set:
//
// OUTPUT:
// UnsatisfiedDependencyException: ... No qualifying bean of type
// 'com.shop.PaymentGateway' available
//
// Both classes are annotated, both are scanned, and neither is
// registered. The message reads exactly like a missing @Component.
//
// Guard against it by making one the default rather than naming a
// profile for every case:
//     @Profile("!prod")     // anything that is not prod
// or set spring.profiles.default=dev so there is never "no profile".`,
                `// 2. A PROPERTY THAT SILENTLY DOES NOT BIND.
//
// @Value fails loudly on a missing property:
@Value("\${app.timeout}")     // no default
// -> IllegalArgumentException: Could not resolve placeholder 'app.timeout'

// @ConfigurationProperties does NOT - an unbound field keeps its
// default, and a MISSPELT property in the file is simply ignored:
//
//   app.time-out=30s        # typo: the field is 'timeout'
//
// binds nothing, reports nothing, and the code runs with 5s.

// Two defences:
@Validated                                   // fail startup on nulls
@ConfigurationProperties(prefix = "app")
public record AppProperties(@NotNull Duration timeout) { }

// and, to catch the typo itself, fail on properties that bind to
// nothing:
//   spring.jpa.properties... (application.properties)
//   spring.config.import=optional:...      (unrelated)
//
// The practical tool is the configuration processor, which generates
// metadata so the IDE flags 'app.time-out' as unknown while you type:
//   <dependency>
//     <artifactId>spring-boot-configuration-processor</artifactId>
//     <optional>true</optional>
//   </dependency>`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is <code>Environment</code>?</td><td>The container's abstraction over property sources and profiles - it resolves configuration values and reports which profiles are active.</td></tr>
<tr><td>What is the property precedence order?</td><td>Command line, then <code>SPRING_APPLICATION_JSON</code>, OS environment variables, system properties, profile-specific files, <code>application.properties</code>, <code>@PropertySource</code>, then in-code defaults.</td></tr>
<tr><td>How does an environment variable map to a property?</td><td>Relaxed binding: uppercase with dots and dashes as underscores. <code>spring.datasource.url</code> is <code>SPRING_DATASOURCE_URL</code>.</td></tr>
<tr><td>What does <code>@Profile</code> do?</td><td>Registers a bean or configuration class only when the given profile expression matches. Non-matching beans are never instantiated.</td></tr>
<tr><td>How do you activate profiles?</td><td><code>spring.profiles.active</code> as a property, command-line argument or <code>SPRING_PROFILES_ACTIVE</code>. Several are comma-separated and additive.</td></tr>
<tr><td>Can profile expressions use logic?</td><td>Yes - <code>!</code>, <code>&amp;</code>, <code>|</code> and brackets. Mixing <code>&amp;</code> and <code>|</code> without brackets is a startup error.</td></tr>
<tr><td>What are profile groups?</td><td>Boot 2.4+: <code>spring.profiles.group.prod=metrics,tracing</code> activates several profiles under one name. It replaced <code>spring.profiles.include</code>.</td></tr>
<tr><td>Can you change a profile at runtime?</td><td>No. <code>@Profile</code> is evaluated when bean definitions are registered, so it requires a restart.</td></tr>
<tr><td>How do you add a custom property source?</td><td>An <code>EnvironmentPostProcessor</code> registered in <code>META-INF/spring.factories</code> - it must run before the context exists, so it cannot be a bean.</td></tr>
<tr><td><code>@Value</code> vs <code>@ConfigurationProperties</code>?</td><td><code>@Value</code> fails loudly on a missing placeholder but is untyped and scattered. <code>@ConfigurationProperties</code> is typed and groups related settings, but silently ignores misspelt keys - pair it with <code>@Validated</code>.</td></tr>
</table>`
        }
    ]
};
