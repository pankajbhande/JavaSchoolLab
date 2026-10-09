import { Topic } from '../coreJava';

export const springBootInternalWorking: Topic = {
    id: 'spring-boot-internal-working',
    name: 'Spring Boot - Internal Working',
    beginner: [
        {
            content: `<h3>How Spring Boot Works Internally</h3>
One line starts a Spring Boot application:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">SpringApplication.run(DemoApplication.class, args);</pre>
<br>
Behind that line is a fixed sequence of eight steps. Knowing the order is what lets you place your own code correctly - and what makes startup log messages readable.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1.  Main method
        |
        v
2.  SpringApplication.run()
        |
        v
3.  Stop watch started
        |
        v
4.  Prepare environment      (profiles + property sources)
        |
        v
5.  Print banner
        |
        v
6.  Create Spring IoC container   (ApplicationContext)
        |
        v
7.  Refresh context          (beans created and wired, server started)
        |
        v
8.  Trigger runners          (your code, after startup)
        |
        v
    APPLICATION READY</pre>`
        },
        {
            content: `<h3>The Eight Steps in Detail</h3>

<table>
<tr><th>Step</th><th>What happens</th></tr>
<tr><td>1. Main method</td><td>The starting point of Spring Boot application execution.</td></tr>
<tr><td>2. run() method</td><td>Contains the run() implementation, which calls a further run() internally.</td></tr>
<tr><td>3. Stop watch</td><td>Captures the total time required to run the application or complete the task - this is the number you see in "Started DemoApplication in 1.923 seconds".</td></tr>
<tr><td>4. Prepare Environment</td><td>The configuration interface implemented by all Environment types. Provides facilities for setting active and default profiles and for manipulating the underlying property sources - java home, user home, JVM version and so on. Test, Dev and Production environments are prepared here from application.properties.</td></tr>
<tr><td>5. Print Banner</td><td>Spring Boot shows text as a banner when the application starts up. The banner can be customised.</td></tr>
<tr><td>6. Spring IoC Container</td><td>run() creates the ApplicationContext object.</td></tr>
<tr><td>7. Refresh Context</td><td><code>refreshContext(context)</code> inside run() triggers a refresh of the application context: it is initialised and configured with all the beans and components the application needs.</td></tr>
<tr><td>8. Trigger Runner</td><td>Used to execute code after the Spring Boot application has started.</td></tr>
</table>`
        },
        {
            content: `<h3>Step 5 - Customising the Banner</h3>
Drop a <code>banner.txt</code> into <code>src/main/resources</code> and Spring Boot prints it instead of the default. It is the simplest visible proof that the startup sequence is doing exactly what the list says.<br>`,
            codeExamples: [
                `# src/main/resources/banner.txt

    _  __     __      ____     __         __    __         __
   / |/ /__ _/ _____ / __/____/ /  ___ ___/ /   / /  ___ _ / /
  /    / _ \`/ // / _\\ \\/ __/ _ \\/ _ \`/ _  /   / /__/ _ \`// _ \\
 /_/|_/\\_,_/\\___/____/\\__/_//_/\\_,_/\\_,_/   /____/\\_,_//_.__/

 Application : \${spring.application.name}
 Boot version: \${spring-boot.version}
 Profile     : \${spring.profiles.active}`,
                `# To switch the banner off entirely:
spring.main.banner-mode=off

# Or send it to the log file instead of the console:
spring.main.banner-mode=log`
            ]
        },
        {
            content: `<h3>Step 8 - Trigger Runner</h3>
The runner is where you put code that must run once, after the context is fully built and the server is listening. Spring Boot offers two interfaces for it.<br><br>

<table>
<tr><th>Interface</th><th>Difference</th></tr>
<tr><td>CommandLineRunner</td><td><code>run(String... args)</code> - receives the raw command-line arguments as an array.</td></tr>
<tr><td>ApplicationRunner</td><td><code>run(ApplicationArguments args)</code> - receives them already parsed into option and non-option arguments.</td></tr>
</table>
<br>
Both run after the context refresh, so every bean is available. Use <code>@Order</code> if several runners must go in a fixed sequence.<br>`,
            codeExamples: [
                `@Component
public class StartupRunner implements CommandLineRunner {

    private final StudentRepository repository;

    public StartupRunner(StudentRepository repository) { this.repository = repository; }

    @Override
    public void run(String... args) {
        System.out.println("Application started. Students on file: " + repository.count());
    }
}
// OUTPUT:
// Tomcat started on port(s): 8080 (http)
// Started DemoApplication in 1.923 seconds (JVM running for 2.41)
// Application started. Students on file: 0
//
// Note the order: the runner fires AFTER "Started ... in 1.923 seconds".`,
                `@Component
public class ArgsRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("Option names : " + args.getOptionNames());
        System.out.println("Import mode  : " + args.getOptionValues("mode"));
        System.out.println("Plain args   : " + args.getNonOptionArgs());
    }
}
// Run with:  java -jar app.jar --mode=import data.csv
// OUTPUT:
// Option names : [mode]
// Import mode  : [import]
// Plain args   : [data.csv]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>What refreshContext() Actually Does</h3>
Step 7 is one line in the summary and the bulk of the work in reality. <code>AbstractApplicationContext.refresh()</code> is a fixed twelve-step template method, and every Spring Boot startup error you will ever read comes from one of these steps.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">refresh()
  1  prepareRefresh()                  mark active, validate required properties
  2  obtainFreshBeanFactory()          load bean DEFINITIONS (nothing built yet)
  3  prepareBeanFactory()              register built-in beans, expression resolver
  4  postProcessBeanFactory()          subclass hook -- creates the web server factory
  5  invokeBeanFactoryPostProcessors() @ComponentScan + auto-configuration run HERE
  6  registerBeanPostProcessors()      register @Autowired / @Transactional processors
  7  initMessageSource()               i18n
  8  initApplicationEventMulticaster() event publishing
  9  onRefresh()                       CREATE AND START THE EMBEDDED TOMCAT
 10  registerListeners()               @EventListener beans
 11  finishBeanFactoryInitialization() INSTANTIATE ALL NON-LAZY SINGLETONS
 12  finishRefresh()                   publish ContextRefreshedEvent</pre>
<br>
Three of those repay close reading:<br><br>

<table>
<tr><th>Step</th><th>Why it matters</th></tr>
<tr><td>5 - BeanFactoryPostProcessors</td><td>Component scanning and every auto-configuration class execute here, adding bean <em>definitions</em>. Nothing is instantiated yet, which is why a bean can be defined conditionally on another bean's existence.</td></tr>
<tr><td>9 - onRefresh()</td><td>Tomcat is created and started before your singletons exist. It does not accept traffic yet - the connector is bound at step 12 - but the ordering explains "Tomcat initialized" appearing early in the log.</td></tr>
<tr><td>11 - finishBeanFactoryInitialization()</td><td>Every non-lazy singleton is constructed and wired here. A missing dependency, an ambiguous @Autowired or a failing @PostConstruct throws at this step - which is why those stack traces all mention <code>finishBeanFactoryInitialization</code>.</td></tr>
</table>`
        },
        {
            content: `<h3>Step 4 - Where a Property Value Actually Comes From</h3>
"Prepare environment" builds an ordered list of <strong>property sources</strong>. When something asks for <code>server.port</code>, the Environment walks that list and the <strong>first</strong> source holding the key wins. This ordering is the answer to "why is my application.properties being ignored?".<br><br>

<table>
<tr><th>Priority</th><th>Property source</th></tr>
<tr><td>1 (highest)</td><td>Devtools global settings in <code>~/.config/spring-boot</code></td></tr>
<tr><td>2</td><td><code>@TestPropertySource</code> and test properties</td></tr>
<tr><td>3</td><td>Command-line arguments - <code>--server.port=9090</code></td></tr>
<tr><td>4</td><td><code>SPRING_APPLICATION_JSON</code></td></tr>
<tr><td>5</td><td>ServletConfig / ServletContext init parameters</td></tr>
<tr><td>6</td><td>JNDI attributes</td></tr>
<tr><td>7</td><td>Java System properties - <code>-Dserver.port=9090</code></td></tr>
<tr><td>8</td><td>OS environment variables - <code>SERVER_PORT=9090</code></td></tr>
<tr><td>9</td><td>Profile-specific files outside the jar - <code>application-prod.properties</code></td></tr>
<tr><td>10</td><td>Profile-specific files inside the jar</td></tr>
<tr><td>11</td><td><code>application.properties</code> outside the jar</td></tr>
<tr><td>12</td><td><code>application.properties</code> inside the jar</td></tr>
<tr><td>13 (lowest)</td><td><code>@PropertySource</code> on a @Configuration class</td></tr>
</table>
<br>
The practical shape of it: <strong>command line beats environment variable beats packaged file</strong>, and a profile-specific file always beats the plain one. That is what makes the same jar deployable to dev, test and prod unchanged.<br>`,
            codeExamples: [
                `// Proving the ordering, and listing the live sources at runtime
@Component
public class EnvDumper implements CommandLineRunner {

    private final ConfigurableEnvironment env;

    public EnvDumper(ConfigurableEnvironment env) { this.env = env; }

    @Override
    public void run(String... args) {
        System.out.println("Active profiles: " + Arrays.toString(env.getActiveProfiles()));
        System.out.println("server.port    : " + env.getProperty("server.port"));
        env.getPropertySources().forEach(ps -> System.out.println("  <- " + ps.getName()));
    }
}
// application.properties says server.port=8082
// Run with:  java -jar app.jar --server.port=9090
// OUTPUT:
// Active profiles: []
// server.port    : 9090          <-- the command line won
//   <- commandLineArgs
//   <- systemProperties
//   <- systemEnvironment
//   <- applicationConfig: [classpath:/application.properties]`
            ]
        },
        {
            content: `<h3>Hooking Into Startup - Which Callback, and When</h3>
Runners are step 8, and they are not the only hook. Choosing the wrong one is a common source of "my initialisation code ran too early".<br><br>

<table>
<tr><th>Hook</th><th>Fires when</th></tr>
<tr><td>Constructor</td><td>During bean creation. Setter- and field-injected dependencies are still null.</td></tr>
<tr><td>@PostConstruct</td><td>After that bean's own dependencies are injected. Other beans may still be unbuilt.</td></tr>
<tr><td>InitializingBean.afterPropertiesSet()</td><td>Same point as @PostConstruct, just after it. Ties the class to a Spring interface, so prefer the annotation.</td></tr>
<tr><td>ApplicationListener&lt;ContextRefreshedEvent&gt;</td><td>Step 12 - every singleton exists. Careful: fires again for a child context, e.g. in some test setups.</td></tr>
<tr><td>CommandLineRunner / ApplicationRunner</td><td>Step 8 of the outer sequence - after the context is refreshed AND the server is up. The right place for one-off startup work.</td></tr>
<tr><td>ApplicationListener&lt;ApplicationReadyEvent&gt;</td><td>After the runners. The last hook before the application is declared ready.</td></tr>
</table>
<br>
An exception thrown from a runner <strong>stops the application</strong> - the context closes and the process exits non-zero. That is usually the behaviour you want for a failed startup migration, and a surprise if you were only warming a cache.<br>`,
            codeExamples: [
                `// Ordering several runners explicitly
@Component
@Order(1)
class SchemaMigrationRunner implements CommandLineRunner {
    public void run(String... args) { System.out.println("1. migrating schema"); }
}

@Component
@Order(2)
class CacheWarmRunner implements CommandLineRunner {
    public void run(String... args) { System.out.println("2. warming cache"); }
}
// OUTPUT:
// 1. migrating schema
// 2. warming cache
// Without @Order the sequence is unspecified.`,
                `// A runner that throws takes the application down with it
@Component
class FailingRunner implements CommandLineRunner {
    public void run(String... args) {
        throw new IllegalStateException("required config file missing");
    }
}
// OUTPUT:
// Started DemoApplication in 1.9 seconds
// ...
// Application run failed
// java.lang.IllegalStateException: required config file missing
// (context closed, JVM exits with a non-zero status)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the main steps of the Spring Boot startup sequence?</td><td>main method, SpringApplication.run(), start the stop watch, prepare the environment, print the banner, create the IoC container, refresh the context, trigger the runners.</td></tr>
<tr><td>What is the stop watch for?</td><td>It measures total startup time - the number reported in "Started DemoApplication in 1.923 seconds".</td></tr>
<tr><td>What does "prepare environment" do?</td><td>Sets the active and default profiles and assembles the ordered list of property sources the application will read configuration from.</td></tr>
<tr><td>What does refreshContext() do?</td><td>Runs <code>ApplicationContext.refresh()</code>: loads bean definitions, runs component scanning and auto-configuration, starts the embedded server, and instantiates every non-lazy singleton.</td></tr>
<tr><td>At which refresh step does auto-configuration run?</td><td>invokeBeanFactoryPostProcessors - step 5. It registers bean definitions; nothing is instantiated until step 11.</td></tr>
<tr><td>When is the embedded Tomcat created?</td><td>In onRefresh(), before the application's own singletons are built. It begins accepting requests only at finishRefresh().</td></tr>
<tr><td>What object does SpringApplication.run() return?</td><td>The <code>ConfigurableApplicationContext</code> - the fully built IoC container.</td></tr>
<tr><td>CommandLineRunner vs ApplicationRunner?</td><td>Same timing; CommandLineRunner receives raw <code>String...</code> arguments, ApplicationRunner receives them parsed as <code>ApplicationArguments</code>.</td></tr>
<tr><td>What happens if a runner throws an exception?</td><td>Startup fails - the context closes and the JVM exits with a non-zero status.</td></tr>
<tr><td>Which wins: application.properties or a command-line argument?</td><td>The command-line argument. Command line beats system properties, which beat environment variables, which beat the packaged properties file.</td></tr>
<tr><td>How do you customise or disable the banner?</td><td>Add <code>banner.txt</code> to src/main/resources, or set <code>spring.main.banner-mode</code> to <code>off</code> or <code>log</code>.</td></tr>
<tr><td>Why does initialisation code belong in @PostConstruct, not the constructor?</td><td>Setter- and field-injected dependencies are not yet set when the constructor runs; @PostConstruct fires after injection is complete.</td></tr>
</table>`
        }
    ]
};
