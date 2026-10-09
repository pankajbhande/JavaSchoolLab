// Spring extras, batch smvc25 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc25Extras: Record<string, Extra> = {
    'mvc-internationalization-i18n': x(
        ['<b>Internationalization (i18n)</b> means designing an application so it can be adapted to many languages and regions without changing the code; the 18 stands for the letters between i and n.',
            '<b>Texts move out of code</b>: labels and messages live in <code>messages_xx.properties</code> files and are looked up by a key.',
            '<b>Three Spring pieces</b>: a <code>MessageSource</code> finds the text, a <code>LocaleResolver</code> decides the current locale, and a <code>LocaleChangeInterceptor</code> lets the user switch it.'],
        ['<b>Locale-aware data</b>: i18n also covers dates, numbers and currency, not only text, and Spring formatting uses the request locale.',
            '<b>Fallback chain</b>: <code>messages_fr_CA</code>, then <code>messages_fr</code>, then <code>messages</code>; the last file is the default.',
            '<b>Encoding</b>: set UTF-8 on the message source, otherwise accented and non-Latin text is garbled.'],
        ['<b>Design for expansion</b>: translated text is often longer, so layouts must not depend on fixed widths.',
            '<b>Never concatenate</b> sentences from pieces; use one message with placeholders such as <code>{0}</code> because word order differs by language.',
            '<b>Test</b> with <code>MockMvc</code> by sending an <code>Accept-Language</code> header or a <code>lang</code> parameter and asserting the text.'],
        [['F', 'What is i18n?', 'Preparing an application so it can support several languages and regions without code changes.'],
            ['F', 'Where are the texts stored?', 'In properties files such as messages_fr.properties, found by a key.'],
            ['M', 'Which Spring beans make i18n work?', 'MessageSource for text lookup, LocaleResolver for the current locale and LocaleChangeInterceptor for switching.'],
            ['M', 'What happens if a key is missing in messages_fr?', 'Spring falls back to the base messages file, and then throws NoSuchMessageException unless a default message is given.'],
            ['S', 'Why not build sentences by concatenating translated words?', 'Grammar and word order differ between languages, so each sentence must be one translatable message with placeholders.'],
            ['S', 'How does Spring Boot configure i18n for you?', 'MessageSourceAutoConfiguration creates a MessageSource using spring.messages.basename, which defaults to messages.']],
        [['Create the bundle files.',
            r`# src/main/resources/messages.properties
greeting=Hello
# src/main/resources/messages_fr.properties
greeting=Bonjour
# src/main/resources/messages_es.properties
greeting=Hola

// OUTPUT:
// Three files, one key (greeting), three values.
// Spring picks the file that matches the current locale.`],
            ['Read a message in a controller.',
                r`@RestController
public class HelloController {
    private final MessageSource messages;
    public HelloController(MessageSource messages) { this.messages = messages; }

    @GetMapping("/hello")
    public String hello(Locale locale) {      // resolved by the LocaleResolver
        return messages.getMessage("greeting", null, locale);
    }
}

// OUTPUT:
// GET /hello  (Accept-Language: fr)  ->  Bonjour
// GET /hello  (no header)            ->  Hello`]],
        [['Test the French text.',
            r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void frenchGreeting() throws Exception {
        mvc.perform(get("/hello").header("Accept-Language", "fr"))
           .andExpect(content().string("Bonjour"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Minimal Boot setup.',
                r`# application.properties
spring.messages.basename=messages
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false

// OUTPUT:
// Boot creates a MessageSource bean automatically; no Java config is needed.`]]
    ),

    'mvc-localization-l10n': x(
        ['<b>Localization (l10n)</b> is the work of adapting an internationalized application to one specific locale: translating text and choosing local formats for dates, numbers and currency.',
            '<b>i18n versus l10n</b>: i18n is the one-time design that makes translation possible; l10n is the per-language work done on top of it.',
            '<b>In Spring</b> localization means adding a <code>messages_xx.properties</code> file per language and letting the framework pick it.'],
        ['<b>Beyond text</b>: dates, numbers, plurals, images, colours and even layout direction (right to left) can differ.',
            '<b>Formatting</b>: <code>@DateTimeFormat</code> and <code>@NumberFormat</code> use the request locale when no pattern is given.',
            '<b>Region variants</b>: <code>en_US</code> and <code>en_GB</code> can differ in a few words while sharing <code>messages_en</code>.'],
        ['<b>Translation workflow</b>: keep keys stable, give translators context, and fail the build when a key is missing in a language.',
            '<b>Plurals</b>: simple messages cannot express them in every language; use <code>MessageFormat</code> choice patterns or avoid counts in text.',
            '<b>Content localization</b>: user-generated or database content needs its own translated columns or tables, not property files.'],
        [['F', 'What is l10n?', 'Adapting an application to a specific language and region, such as translating texts and formatting dates.'],
            ['F', 'How do you add a new language in Spring MVC?', 'Add a messages_xx.properties file with the same keys translated.'],
            ['M', 'What is the difference between i18n and l10n?', 'i18n prepares the code for many locales once; l10n supplies the data for each locale.'],
            ['M', 'How do you show a date in the user locale?', 'Format with the request Locale, for example a java.time DateTimeFormatter with localizedBy(locale) or @DateTimeFormat without a pattern.'],
            ['S', 'How do you handle plural forms?', 'Use a MessageFormat choice pattern, or the ICU-style libraries when a language needs more than two forms.'],
            ['S', 'How do you localize database content?', 'Store translations in a separate table keyed by entity id and locale, and select by the current locale.']],
        [['Add Hindi next to English.',
            r`# messages_hi.properties  (saved as UTF-8)
greeting=नमस्ते
welcome=स्वागत है, {0}

# messages.properties
greeting=Hello
welcome=Welcome, {0}

// OUTPUT:
// Locale hi -> नमस्ते ; any other locale -> Hello`],
            ['Format a number by locale.',
                r`NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.GERMANY);
System.out.println(nf.format(1234.5));
NumberFormat us = NumberFormat.getCurrencyInstance(Locale.US);
System.out.println(us.format(1234.5));

// OUTPUT: (non-breaking space before the euro sign)
// 1.234,50 €
// $1,234.50`]],
        [['Localized date in a controller.',
            r`@GetMapping("/today")
public String today(Locale locale) {
    DateTimeFormatter f = DateTimeFormatter
        .ofLocalizedDate(FormatStyle.LONG).withLocale(locale);
    return LocalDate.of(2025, 3, 5).format(f);
}

// OUTPUT:
// en -> March 5, 2025
// fr -> 5 mars 2025`],
            ['Check all languages have all keys.',
                r`@Test
void everyLanguageHasEveryKey() throws Exception {
    Properties base = load("messages.properties");
    Properties fr = load("messages_fr.properties");
    assertThat(fr.keySet()).containsAll(base.keySet());
}

// OUTPUT:
// Tests run: 1, Failures: 0   (fails with the missing key names otherwise)`]]
    ),

    'mvc-locale-i18n': x(
        ['<b>Locale</b> is the <code>java.util.Locale</code> object that holds a language and an optional country, such as <code>fr</code> or <code>en_GB</code>; it tells Java which language and format rules to use.',
            '<b>Created</b> with <code>Locale.of("fr", "CA")</code> (Java 19+), <code>new Locale("fr", "CA")</code> or <code>Locale.forLanguageTag("fr-CA")</code>.',
            '<b>In a controller</b> declare a <code>Locale</code> method parameter and Spring injects the locale chosen by the <code>LocaleResolver</code>.'],
        ['<b>Parts</b>: language (ISO 639), country (ISO 3166) and variant; <code>getLanguage()</code> and <code>getCountry()</code> read them.',
            '<b>Locale.getDefault()</b> is the server JVM locale; do not use it for web users, use the request locale instead.',
            '<b>LocaleContextHolder.getLocale()</b> gives the current request locale anywhere, even in a service class.'],
        ['<b>Thread-bound</b>: <code>LocaleContextHolder</code> stores the locale in a thread-local, so it is lost in new threads and async tasks unless copied.',
            '<b>Language tags</b>: prefer <code>forLanguageTag("fr-CA")</code>, the BCP 47 form; <code>toString()</code> gives <code>fr_CA</code>.',
            '<b>Never</b> store the locale as a plain string in business logic without validating it against the supported list.'],
        [['F', 'What is a Locale?', 'A java.util.Locale object representing a language and region, used to choose texts and formats.'],
            ['F', 'How do you get the locale in a controller?', 'Add a Locale parameter to the handler method.'],
            ['M', 'How do you read the locale in a service?', 'Call LocaleContextHolder.getLocale().'],
            ['M', 'What is the difference between fr and fr_CA?', 'fr is the language only; fr_CA adds the country Canada, so region-specific formats can apply.'],
            ['S', 'Why can the locale be wrong inside an @Async method?', 'LocaleContextHolder uses a thread-local, so the new thread does not inherit it unless you pass it or use a task decorator.'],
            ['S', 'What does Locale.getDefault() return on a server?', 'The JVM or operating system locale, not the user locale, so it is wrong for per-user output.']],
        [['Create and inspect locales.',
            r`Locale a = Locale.forLanguageTag("fr-CA");
Locale b = new Locale("de", "DE");
System.out.println(a + " " + a.getLanguage() + " " + a.getCountry());
System.out.println(b.getDisplayLanguage(Locale.ENGLISH));
System.out.println(a.getDisplayName(Locale.FRENCH));

// OUTPUT:
// fr_CA fr CA
// German
// français (Canada)`],
            ['Locale in a controller.',
                r`@GetMapping("/lang")
public String lang(Locale locale) {
    return locale.toLanguageTag() + " / " + locale.getDisplayLanguage(locale);
}

// OUTPUT:
// Accept-Language: es  ->  es / español
// Accept-Language: en-GB -> en-GB / English`]],
        [['Locale in a service.',
            r`@Service
public class MailService {
    public String subject() {
        Locale l = LocaleContextHolder.getLocale();
        return "Locale for this mail: " + l;
    }
}

// OUTPUT:
// Locale for this mail: fr_FR   (taken from the current request)`],
            ['Test with a fixed locale.',
                r`mvc.perform(get("/lang").locale(Locale.GERMAN))
   .andExpect(content().string("de / Deutsch"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-localeresolver': x(
        ['<b>LocaleResolver</b> is the Spring MVC interface that decides the locale of each request; the <code>DispatcherServlet</code> calls it first and exposes the result.',
            '<b>Built-in types</b>: <code>AcceptHeaderLocaleResolver</code> (default, reads <code>Accept-Language</code>), <code>SessionLocaleResolver</code>, <code>CookieLocaleResolver</code> and <code>FixedLocaleResolver</code>.',
            '<b>Bean name matters</b>: the bean must be called <code>localeResolver</code>, otherwise the DispatcherServlet does not find it.'],
        ['<b>Header resolver</b> is read-only: it cannot change the locale, so <code>setLocale</code> throws <code>UnsupportedOperationException</code>.',
            '<b>Session resolver</b> keeps the choice in the HTTP session; the <b>cookie resolver</b> keeps it in a cookie and survives restarts.',
            '<b>Default locale</b>: <code>setDefaultLocale</code> is used when nothing was chosen yet.'],
        ['<b>Stateless APIs</b> should keep the header resolver or a custom one, since sessions break horizontal scaling.',
            '<b>Custom resolver</b>: implement <code>resolveLocale(HttpServletRequest)</code>, for example to read the locale from a JWT claim or a user profile.',
            '<b>Supported list</b>: <code>AcceptHeaderLocaleResolver.setSupportedLocales</code> avoids using a locale you have no texts for.'],
        [['F', 'What does a LocaleResolver do?', 'It determines the current locale of a request.'],
            ['F', 'What is the default LocaleResolver?', 'AcceptHeaderLocaleResolver, which reads the Accept-Language header.'],
            ['M', 'Which resolver remembers a user choice across visits?', 'CookieLocaleResolver, because the cookie stays in the browser.'],
            ['M', 'Why does my custom resolver bean seem ignored?', 'The bean must be named localeResolver; the DispatcherServlet looks it up by that name.'],
            ['S', 'Why avoid SessionLocaleResolver in a clustered app?', 'The locale lives in the session, so it needs sticky sessions or a shared session store.'],
            ['S', 'How do you read the locale from a user profile?', 'Write a custom LocaleResolver that reads the authenticated user and returns the stored locale, with the header as fallback.']],
        [['Register a cookie resolver.',
            r`@Bean
public LocaleResolver localeResolver() {
    CookieLocaleResolver r = new CookieLocaleResolver("lang");
    r.setDefaultLocale(Locale.ENGLISH);
    r.setCookieMaxAge(Duration.ofDays(30));
    return r;
}

// OUTPUT:
// First visit -> English. After a switch the browser keeps the cookie lang=fr
// for 30 days.`],
            ['Limit accepted languages.',
                r`@Bean
public LocaleResolver localeResolver() {
    AcceptHeaderLocaleResolver r = new AcceptHeaderLocaleResolver();
    r.setSupportedLocales(List.of(Locale.ENGLISH, Locale.FRENCH));
    r.setDefaultLocale(Locale.ENGLISH);
    return r;
}

// OUTPUT:
// Accept-Language: de -> not supported -> default English`]],
        [['Custom resolver from a query parameter.',
            r`public class ParamLocaleResolver implements LocaleResolver {
    public Locale resolveLocale(HttpServletRequest req) {
        String lang = req.getParameter("lang");
        return lang != null ? Locale.forLanguageTag(lang) : Locale.ENGLISH;
    }
    public void setLocale(HttpServletRequest req, HttpServletResponse res,
                          Locale locale) {
        throw new UnsupportedOperationException("read-only");
    }
}

// OUTPUT:
// /page?lang=fr -> fr ; /page -> en`],
            ['Test the cookie.',
                r`mvc.perform(get("/hello").cookie(new Cookie("lang", "fr")))
   .andExpect(content().string("Bonjour"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-localechangeinterceptor': x(
        ['<b>LocaleChangeInterceptor</b> is a <code>HandlerInterceptor</code> that reads a request parameter (default name <code>locale</code>) and calls <code>setLocale</code> on the <code>LocaleResolver</code>.',
            '<b>Usage</b>: a link such as <code>/home?lang=fr</code> switches the language for the following requests.',
            '<b>Needs a writable resolver</b>: it works with session or cookie resolvers, not with the header resolver.'],
        ['<b>Register</b> it in <code>WebMvcConfigurer.addInterceptors</code>; a bean alone is not enough.',
            '<b>setParamName("lang")</b> changes the parameter name; <code>setHttpMethods</code> can limit it to POST or GET.',
            '<b>Order</b>: it runs in <code>preHandle</code>, before the controller, so the new locale is already active for that request.'],
        ['<b>Invalid values</b>: set <code>setIgnoreInvalidLocale(true)</code> so a bad parameter does not give a 500 error.',
            '<b>Security</b>: the parameter is user input; it only selects a locale and is never written to a file or query, but still validate it against a supported list.',
            '<b>Caching</b>: pages that change with a parameter must vary the cache key, or a CDN may serve the wrong language.'],
        [['F', 'What does LocaleChangeInterceptor do?', 'It changes the locale when a request parameter such as lang is present.'],
            ['F', 'What is the default parameter name?', 'locale.'],
            ['M', 'Why does the switch not work with the default resolver?', 'AcceptHeaderLocaleResolver cannot store a locale; use SessionLocaleResolver or CookieLocaleResolver.'],
            ['M', 'How do you register the interceptor?', 'Override addInterceptors in a WebMvcConfigurer and call registry.addInterceptor.'],
            ['S', 'At which interceptor method does it act?', 'In preHandle, so the locale is changed before the handler runs.'],
            ['S', 'What happens with ?lang=xx unknown?', 'Unknown tags still create a Locale; with ignoreInvalidLocale false an invalid tag raises an exception, so enable the flag or validate.']],
        [['Register the interceptor.',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
        lci.setParamName("lang");
        registry.addInterceptor(lci);
    }
}

// OUTPUT:
// /home?lang=fr  -> locale switched to fr and stored by the resolver`],
            ['Pair it with a session resolver.',
                r`@Bean
public LocaleResolver localeResolver() {
    SessionLocaleResolver r = new SessionLocaleResolver();
    r.setDefaultLocale(Locale.ENGLISH);
    return r;
}

// OUTPUT:
// Request 1: /home?lang=es -> Spanish
// Request 2: /home         -> still Spanish (kept in the session)`]],
        [['Test the switch.',
            r`@Test
void switchesLanguage() throws Exception {
    MockHttpSession session = new MockHttpSession();
    mvc.perform(get("/hello").param("lang", "fr").session(session))
       .andExpect(content().string("Bonjour"));
    mvc.perform(get("/hello").session(session))
       .andExpect(content().string("Bonjour"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Ignore bad values.',
                r`LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
lci.setParamName("lang");
lci.setIgnoreInvalidLocale(true);

// OUTPUT:
// /home?lang=@@@ -> request continues with the current locale, no error`]]
    ),

    'mvc-messagesource': x(
        ['<b>MessageSource</b> is the Spring interface that resolves a message key to text for a given <code>Locale</code>, with optional arguments and a default message.',
            '<b>Main method</b>: <code>getMessage(String code, Object[] args, Locale locale)</code>; overloads accept a default message or a <code>MessageSourceResolvable</code>.',
            '<b>Every ApplicationContext</b> is a MessageSource and delegates to the bean named <code>messageSource</code>.'],
        ['<b>Placeholders</b>: <code>welcome=Hello, {0}</code> is filled from the args array using <code>java.text.MessageFormat</code>.',
            '<b>Implementations</b>: <code>ResourceBundleMessageSource</code> (classpath bundles) and <code>ReloadableResourceBundleMessageSource</code> (re-reads files, can use external paths).',
            '<b>Missing key</b>: throws <code>NoSuchMessageException</code> unless you pass a default message or set <code>setUseCodeAsDefaultMessage(true)</code>.'],
        ['<b>Hierarchy</b>: a message source can have a parent through <code>setParentMessageSource</code>, searched when the key is missing.',
            '<b>Validation</b>: Bean Validation messages can use the same source if you register a <code>LocalValidatorFactoryBean</code> with <code>setValidationMessageSource</code>.',
            '<b>Single quote trap</b>: in MessageFormat a single quote hides placeholders, so write two quotes in properties files.'],
        [['F', 'What is MessageSource?', 'A Spring interface that returns a localized text for a message key.'],
            ['F', 'How do you pass a value into a message?', 'Use {0} in the text and pass an Object array to getMessage.'],
            ['M', 'What if the key does not exist?', 'NoSuchMessageException, unless a default message is supplied.'],
            ['M', 'What is the required bean name?', 'messageSource, because the ApplicationContext looks it up by that name.'],
            ['S', 'Which implementation allows reloading without restart?', 'ReloadableResourceBundleMessageSource with setCacheSeconds.'],
            ['S', 'Why does {0} not get replaced in my message?', 'Often a single quote in the text turns off MessageFormat parsing; double the quote.']],
        [['Use getMessage with arguments.',
            r`# messages.properties
welcome=Welcome, {0}! You have {1} new messages.

String text = messageSource.getMessage(
    "welcome", new Object[] {"Asha", 3}, Locale.ENGLISH);
System.out.println(text);

// OUTPUT:
// Welcome, Asha! You have 3 new messages.`],
            ['Default message and fallback.',
                r`String t = messageSource.getMessage(
    "no.such.key", null, "Not translated", Locale.FRENCH);
System.out.println(t);

// OUTPUT:
// Not translated`]],
        [['Controller with MessageSource.',
            r`@RestController
class InboxController {
    private final MessageSource ms;
    InboxController(MessageSource ms) { this.ms = ms; }

    @GetMapping("/inbox/{n}")
    String inbox(@PathVariable int n, Locale locale) {
        return ms.getMessage("inbox.count", new Object[] {n}, locale);
    }
}

// OUTPUT:
// GET /inbox/5 (fr) -> Vous avez 5 messages`],
            ['Test the missing key.',
                r`@Test
void missingKeyThrows() {
    assertThrows(NoSuchMessageException.class,
        () -> ms.getMessage("nope", null, Locale.ENGLISH));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-resourcebundlemessagesource': x(
        ['<b>ResourceBundleMessageSource</b> is the standard <code>MessageSource</code> built on <code>java.util.ResourceBundle</code>; it loads <code>basename_xx.properties</code> files from the classpath.',
            '<b>Configure</b> with <code>setBasename("messages")</code> or <code>setBasenames("messages", "errors")</code> and <code>setDefaultEncoding("UTF-8")</code>.',
            '<b>Lookup order</b>: <code>messages_fr_CA</code>, <code>messages_fr</code>, then the system locale file, then <code>messages</code>.'],
        ['<b>Bean name</b> must be <code>messageSource</code>; with Spring Boot you can instead set <code>spring.messages.basename</code>.',
            '<b>fallbackToSystemLocale</b>: by default the JVM locale file is tried before the base file; set it to false to make the base file the only fallback.',
            '<b>Caching</b>: bundles are cached forever by default; <code>setCacheSeconds</code> is only supported by the reloadable variant.'],
        ['<b>Classpath only</b>: files must be on the classpath (for example <code>src/main/resources</code>); use <code>ReloadableResourceBundleMessageSource</code> for <code>file:</code> paths.',
            '<b>Encoding</b>: the old ISO-8859-1 default breaks non-Latin text; set UTF-8 explicitly.',
            '<b>Common messages</b>: <code>setCommonMessages</code> supplies shared properties for all bundles.'],
        [['F', 'What does ResourceBundleMessageSource load?', 'Properties files from the classpath whose names start with the basename.'],
            ['F', 'How do you set the file prefix?', 'Call setBasename("messages") for messages.properties and messages_xx.properties.'],
            ['M', 'How do you use several bundles?', 'Call setBasenames("messages", "errors"); they are searched in order.'],
            ['M', 'Why does Hindi text look broken?', 'The encoding is not UTF-8; call setDefaultEncoding("UTF-8").'],
            ['S', 'Why is fallbackToSystemLocale important?', 'Without turning it off, a server running in French can show French text for a German user whose file is missing.'],
            ['S', 'How is it different from the reloadable class?', 'It caches bundles through ResourceBundle and cannot reload or read file paths, while the reloadable one re-reads files after a set time.']],
        [['Java configuration.',
            r`@Bean
public MessageSource messageSource() {
    ResourceBundleMessageSource ms = new ResourceBundleMessageSource();
    ms.setBasenames("messages", "errors");
    ms.setDefaultEncoding("UTF-8");
    ms.setFallbackToSystemLocale(false);
    return ms;
}

// OUTPUT:
// Keys are searched in messages*.properties first, then errors*.properties.`],
            ['Spring Boot properties.',
                r`# application.properties
spring.messages.basename=messages,errors
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false
spring.messages.use-code-as-default-message=true

# OUTPUT:
# Boot builds the same ResourceBundleMessageSource from these values.`]],
        [['Reloadable version for development.',
            r`@Bean
public MessageSource messageSource() {
    var ms = new ReloadableResourceBundleMessageSource();
    ms.setBasename("classpath:messages");
    ms.setDefaultEncoding("UTF-8");
    ms.setCacheSeconds(5);        // re-read files every 5 seconds
    return ms;
}

// OUTPUT:
// Edit messages_fr.properties; within 5 seconds the new text is served.`],
            ['Lookup order check.',
                r`ms.getMessage("greeting", null, Locale.CANADA_FRENCH);
// files tried in this order:
// messages_fr_CA.properties
// messages_fr.properties
// messages.properties  (fallbackToSystemLocale=false)

// OUTPUT:
// Bonjour   (found in messages_fr.properties)`]]
    ),

    'mvc-language-properties': x(
        ['<b>Language properties files</b> are plain text files of <code>key=value</code> lines, one file per language, named <code>messages_xx.properties</code> where xx is the language code.',
            '<b>Base file</b> <code>messages.properties</code> is the default used when no language file matches.',
            '<b>Same keys</b> must exist in every file; only the values are translated.'],
        ['<b>Naming</b>: <code>messages_fr.properties</code> for French, <code>messages_pt_BR.properties</code> for Brazilian Portuguese.',
            '<b>Placeholders</b> <code>{0}</code>, <code>{1}</code> are filled with arguments; a literal single quote is written as two quotes.',
            '<b>Key style</b>: group keys with dots such as <code>login.title</code> and <code>login.error.badPassword</code>.'],
        ['<b>Encoding</b>: Java 9+ reads properties as UTF-8 by default for bundles, but Spring still needs <code>setDefaultEncoding("UTF-8")</code>; save the files as UTF-8.',
            '<b>Escapes</b>: older tools write <code>\\u0928</code> style escapes; both forms work, but UTF-8 text is easier to review.',
            '<b>Review</b>: a build check that compares key sets of all files catches missing translations early.'],
        [['F', 'What is a messages_fr.properties file?', 'A properties file holding the French text for each message key.'],
            ['F', 'What is the default file called?', 'messages.properties, used when no language-specific file matches.'],
            ['M', 'How do you write a message with a parameter?', 'Put {0} in the value, and pass the argument when calling getMessage.'],
            ['M', 'How do you write a literal apostrophe?', 'Use two single quotes, because MessageFormat treats one quote as an escape.'],
            ['S', 'How do you keep key sets in sync?', 'Write a test that loads all files and asserts each contains every key of the base file.'],
            ['S', 'Why use dotted key names?', 'They group keys by screen or feature, avoid collisions and make files easy to search.']],
        [['Two files, same keys.',
            r`# messages.properties
login.title=Sign in
login.error=Wrong user name or password
login.welcome=Welcome back, {0}

# messages_fr.properties
login.title=Connexion
login.error=Nom d utilisateur ou mot de passe incorrect
login.welcome=Bon retour, {0}

// OUTPUT:
// Same three keys in both files, values translated.`],
            ['Apostrophe rule.',
                r`# messages.properties
bad=It''s {0} o''clock
# messages_fr.properties
ok=Il est {0} heures

String s = ms.getMessage("bad", new Object[] {5}, Locale.ENGLISH);
System.out.println(s);

// OUTPUT:
// It's 5 o'clock`]],
        [['Test that keys match.',
            r`@Test
void frHasAllKeys() throws IOException {
    Properties base = new Properties(), fr = new Properties();
    try (var a = new FileReader("src/main/resources/messages.properties",
                                StandardCharsets.UTF_8);
         var b = new FileReader("src/main/resources/messages_fr.properties",
                                StandardCharsets.UTF_8)) {
        base.load(a); fr.load(b);
    }
    assertThat(fr.stringPropertyNames())
        .containsAll(base.stringPropertyNames());
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Use in Thymeleaf.',
                r`<h1 th:text="#{login.title}">Sign in</h1>
<p th:text="#{login.welcome(` + r`$` + r`{user.name})}">Welcome back</p>

<!-- OUTPUT -->
<!-- en: Sign in / Welcome back, Asha -->
<!-- fr: Connexion / Bon retour, Asha -->`]]
    ),

    'mvc-multi-language-applications': x(
        ['<b>A multi-language application</b> serves the same pages in several languages and lets the user choose; in Spring MVC it combines message files, a <code>LocaleResolver</code> and a language switch.',
            '<b>Recipe</b>: <code>messages_xx.properties</code> files, a <code>MessageSource</code>, a <code>CookieLocaleResolver</code> or <code>SessionLocaleResolver</code>, and a <code>LocaleChangeInterceptor</code>.',
            '<b>In views</b> use <code>#{key}</code> in Thymeleaf or <code>spring:message</code> in JSP; never hard-code visible text.'],
        ['<b>Language switcher</b>: links such as <code>?lang=en</code> and <code>?lang=fr</code> in the page header.',
            '<b>Validation messages</b> also need translating: <code>messages.properties</code> can define <code>NotBlank.user.name</code> style keys that Spring finds for field errors.',
            '<b>Default</b>: always keep a complete base file so unknown languages still show readable text.'],
        ['<b>URL strategy</b>: a locale in the path (<code>/fr/products</code>) is cache and SEO friendly; a parameter or cookie is simpler but hides the language from crawlers.',
            '<b>Email and PDF</b> output run outside the request, so pass the user locale explicitly to templates.',
            '<b>Content</b>: product names and articles usually need translated database columns, not property files.'],
        [['F', 'What do you need for a multi-language Spring MVC app?', 'Message files per language, a MessageSource, a LocaleResolver and a way to switch such as LocaleChangeInterceptor.'],
            ['F', 'How do you show text in a view?', 'Thymeleaf uses #{key}; JSP uses the spring:message tag.'],
            ['M', 'How do you translate validation errors?', 'Define keys like NotBlank.user.name or use message codes in the annotation, in the same message files.'],
            ['M', 'Where do you keep the user choice?', 'In a cookie or the session through a writable LocaleResolver.'],
            ['S', 'How do you localize emails sent in a background job?', 'Store the user locale and pass it explicitly to the template engine, because there is no request.'],
            ['S', 'Which URL scheme suits search engines?', 'A locale in the path or subdomain, so each language has its own stable URL.']],
        [['Full configuration.',
            r`@Configuration
public class I18nConfig implements WebMvcConfigurer {
    @Bean
    public LocaleResolver localeResolver() {
        CookieLocaleResolver r = new CookieLocaleResolver("lang");
        r.setDefaultLocale(Locale.ENGLISH);
        return r;
    }
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        LocaleChangeInterceptor i = new LocaleChangeInterceptor();
        i.setParamName("lang");
        registry.addInterceptor(i);
    }
}

// OUTPUT:
// Message files come from Boot auto-configuration (spring.messages.basename).
// Any URL accepts ?lang=xx and remembers it in a cookie.`],
            ['Language switcher fragment.',
                r`<nav>
  <a th:href="@{/home(lang='en')}">English</a> |
  <a th:href="@{/home(lang='fr')}">Francais</a> |
  <a th:href="@{/home(lang='hi')}">Hindi</a>
</nav>

<!-- OUTPUT -->
<!-- links render as /home?lang=en, /home?lang=fr, /home?lang=hi -->`]],
        [['Translated validation error.',
            r`# messages.properties
NotBlank.user.name=Name is required
# messages_fr.properties
NotBlank.user.name=Le nom est obligatoire

public record UserForm(@NotBlank String name) {}

// OUTPUT:
// POST name="" (fr) -> field error text: Le nom est obligatoire`],
            ['Locale in the path.',
                r`@GetMapping("/{lang}/products")
public String products(@PathVariable String lang, Model model) {
    LocaleContextHolder.setLocale(Locale.forLanguageTag(lang));
    return "products";
}

// OUTPUT:
// /fr/products -> page rendered in French
// (an interceptor is cleaner than setting the locale in each handler)`]]
    ),

    'mvc-dynamic-language-switching': x(
        ['<b>Dynamic language switching</b> lets a user change the language at run time, with no restart or redeploy, usually by clicking a link or a drop-down.',
            '<b>How</b>: the link sends <code>?lang=fr</code>; <code>LocaleChangeInterceptor</code> calls <code>setLocale</code> on a <code>SessionLocaleResolver</code> or <code>CookieLocaleResolver</code>, and later requests use it.',
            '<b>Needs</b> a writable resolver; the default header resolver cannot switch dynamically.'],
        ['<b>Order of events</b>: request arrives, interceptor reads the parameter, resolver stores the locale, controller and view use it.',
            '<b>Persistence</b>: a cookie keeps the choice between visits; a session keeps it only until the session ends.',
            '<b>Redirect back</b>: after switching, send the user to the same page using the <code>Referer</code> header or a return path.'],
        ['<b>Post-switch redirect</b> must validate the target to avoid an open redirect; allow only local paths.',
            '<b>Logged-in users</b>: store the chosen locale in the user profile and read it in a custom resolver on the next login.',
            '<b>Single page apps</b>: send the locale in a header such as <code>Accept-Language</code> and let the API return text for it.'],
        [['F', 'What is dynamic language switching?', 'Changing the application language at run time without restarting.'],
            ['F', 'Which interceptor is used?', 'LocaleChangeInterceptor.'],
            ['M', 'Why must the resolver be writable?', 'The interceptor calls setLocale to store the new choice, which the header resolver does not allow.'],
            ['M', 'Cookie or session for the choice?', 'Cookie survives browser restarts and needs no server state; session is lost when it expires.'],
            ['S', 'How do you remember the choice for a logged-in user?', 'Save the locale in the user record and use a custom LocaleResolver that reads it.'],
            ['S', 'What is the risk when redirecting back after a switch?', 'An open redirect if you trust a user-supplied URL; accept only relative local paths.']],
        [['Switch and return to the same page.',
            r`@GetMapping("/switch")
public String switchLang(@RequestParam String lang,
                         HttpServletRequest req, HttpServletResponse res,
                         @RequestHeader(value = "Referer", required = false)
                         String referer) {
    resolver.setLocale(req, res, Locale.forLanguageTag(lang));
    return "redirect:" + (referer != null ? referer : "/");
}

// OUTPUT:
// GET /switch?lang=fr  ->  302 Location: (previous page), now in French`],
            ['Dropdown in Thymeleaf.',
                r`<select onchange="location.href='?lang=' + this.value">
  <option value="en" th:selected="$` + r`{#locale.language == 'en'}">English</option>
  <option value="fr" th:selected="$` + r`{#locale.language == 'fr'}">Francais</option>
</select>

<!-- OUTPUT -->
<!-- choosing Francais requests ?lang=fr and the same page reloads in French -->`]],
        [['Test persistence.',
            r`@Test
void languageSticks() throws Exception {
    MockHttpSession s = new MockHttpSession();
    mvc.perform(get("/hello").param("lang", "es").session(s))
       .andExpect(content().string("Hola"));
    mvc.perform(get("/hello").session(s))
       .andExpect(content().string("Hola"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Safe redirect target.',
                r`static String safe(String url) {
    return (url != null && url.startsWith("/") && !url.startsWith("//"))
        ? url : "/";
}

// OUTPUT:
// safe("/products") -> /products
// safe("https://evil.example") -> /`]]
    )
};

export const smvc25Deep: Record<string, Deep> = {
    'mvc-internationalization-i18n': dv(
        [`<p>i18n in Spring MVC is a chain of small steps in the request cycle.</p><ul><li><b>Locale step:</b> the <code>DispatcherServlet</code> calls the <code>LocaleResolver</code> and stores the result in the request, also available through <code>LocaleContextHolder</code>.</li><li><b>Text step:</b> the controller, view or validator asks the <code>MessageSource</code> for a key and locale.</li><li><b>Bundle step:</b> the source loads <code>messages_xx.properties</code> through a <code>ResourceBundle</code> and caches it.</li><li><b>Format step:</b> <code>MessageFormat</code> fills <code>{0}</code> placeholders using the locale.</li></ul>`,
            r`// Simplified view of what the framework does for each request
Locale locale = localeResolver.resolveLocale(request);       // step 1
LocaleContextHolder.setLocale(locale);                       // thread-bound
String text = messageSource.getMessage("greeting", null, locale); // step 2
// ... render view, then DispatcherServlet clears the context

// OUTPUT:
// locale = fr, text = Bonjour`],
        [`<p>Options for supplying messages:</p><ul><li><b>Boot properties:</b> <code>spring.messages.basename</code>, <code>encoding</code>, <code>cache-duration</code>.</li><li><b>Java config:</b> a <code>MessageSource</code> bean named <code>messageSource</code>.</li><li><b>Views:</b> <code>#{key}</code> (Thymeleaf) or <code>spring:message</code> (JSP).</li><li><b>Validation:</b> message codes like <code>Size.user.name</code>.</li></ul>`,
            r`# application.properties
spring.messages.basename=messages,errors
spring.messages.encoding=UTF-8
spring.messages.cache-duration=10m
spring.messages.fallback-to-system-locale=false

# OUTPUT:
# Boot logs nothing; a MessageSource bean named messageSource is created.`],
        [`<p>Typical mistakes:</p><ul><li><b>Wrong bean name:</b> naming it <code>messages</code> instead of <code>messageSource</code>.</li><li><b>Wrong encoding:</b> garbled letters; set UTF-8.</li><li><b>Hard-coded text</b> left in templates.</li><li><b>Sentence building</b> from fragments.</li><li><b>Missing base file:</b> unknown locale then fails.</li></ul>`,
            r`// WRONG: sentence glued from pieces, word order is fixed
String bad = msg("you.have") + " " + count + " " + msg("messages");
// RIGHT: one message with a placeholder
String good = ms.getMessage("inbox.count", new Object[] {count}, locale);

// OUTPUT:
// bad  (de): Sie haben 3 Nachrichten  only by luck
// good (de): Sie haben 3 Nachrichten  and word order is controlled by the file`],
        [`<p>Message lookup is cheap, but a few points matter:</p><ul><li><b>Cache:</b> bundles are cached; reloading in production is rarely needed.</li><li><b>Reloadable source:</b> use only in development with a short cache time.</li><li><b>Hot path:</b> avoid resolving the same message in a tight loop; resolve once per request.</li><li><b>MessageFormat</b> is not thread-safe, Spring handles this internally.</li></ul>`,
            r`@Bean
MessageSource messageSource(Environment env) {
    var ms = new ReloadableResourceBundleMessageSource();
    ms.setBasename("classpath:messages");
    ms.setDefaultEncoding("UTF-8");
    // reload only in the dev profile
    ms.setCacheSeconds(env.acceptsProfiles(Profiles.of("dev")) ? 2 : -1);
    return ms;
}

// OUTPUT:
// dev: edits visible in 2 seconds; prod: cached for the life of the app (-1)`],
        [`<p>Scenario: an online shop for India and France.</p><ul><li>Files <code>messages.properties</code>, <code>messages_fr.properties</code>, <code>messages_hi.properties</code>.</li><li>A cookie resolver keeps the choice for 30 days.</li><li>A test checks all key sets are equal before each release.</li></ul>`,
            r`@SpringBootTest
@AutoConfigureMockMvc
class ShopI18nTest {
    @Autowired MockMvc mvc;

    @ParameterizedTest
    @CsvSource({"en,Add to cart", "fr,Ajouter au panier", "hi,कार्ट में जोड़ें"})
    void buttonText(String lang, String expected) throws Exception {
        mvc.perform(get("/cart/button").header("Accept-Language", lang))
           .andExpect(content().string(expected));
    }
}

// OUTPUT:
// Tests run: 3, Failures: 0, Errors: 0`]
    ),

    'mvc-localization-l10n': dv(
        [`<p>Localization uses the same machinery as i18n but supplies locale-specific data.</p><ul><li><b>Text:</b> resolved from the most specific bundle first (<code>fr_CA</code> then <code>fr</code> then base).</li><li><b>Formats:</b> JDK classes (<code>NumberFormat</code>, <code>DateTimeFormatter</code>) read patterns from CLDR locale data.</li><li><b>Spring formatters:</b> <code>FormattingConversionService</code> picks a formatter per field and uses the current locale from <code>LocaleContextHolder</code>.</li></ul>`,
            r`public record Invoice(
    @NumberFormat(style = NumberFormat.Style.CURRENCY) BigDecimal total,
    @DateTimeFormat(style = "M-") LocalDate date) {}

// Binding "1.234,50 EUR" works with locale de_DE and fails with en_US.

// OUTPUT:
// de_DE -> total = 1234.50, en_US -> typeMismatch field error`],
        [`<p>Localization variants:</p><ul><li><b>Language only:</b> <code>messages_fr</code>.</li><li><b>Language and country:</b> <code>messages_fr_CA</code> overrides only the keys that differ.</li><li><b>Script and variant</b> tags exist but are rare.</li><li><b>Formatting styles:</b> SHORT, MEDIUM, LONG, FULL.</li></ul>`,
            r`LocalDate d = LocalDate.of(2025, 3, 5);
for (FormatStyle s : List.of(FormatStyle.SHORT, FormatStyle.LONG)) {
    System.out.println(DateTimeFormatter.ofLocalizedDate(s)
        .withLocale(Locale.UK).format(d));
}

// OUTPUT:
// 05/03/2025
// 5 March 2025`],
        [`<p>Common localization mistakes:</p><ul><li><b>Parsing user input with the server locale</b> instead of the request locale.</li><li><b>Hard-coded date patterns</b> such as <code>MM/dd/yyyy</code>.</li><li><b>Storing formatted values</b> in the database; store raw numbers and dates.</li><li><b>Upper-casing</b> without a locale (the Turkish i problem).</li></ul>`,
            r`String s = "title";
System.out.println(s.toUpperCase());                       // uses default locale
System.out.println(s.toUpperCase(Locale.ROOT));            // safe for keys
System.out.println(s.toUpperCase(Locale.forLanguageTag("tr")));

// OUTPUT: (first line depends on the server locale)
// TITLE
// TITLE
// TİTLE`],
        [`<p>Performance and tuning:</p><ul><li><b>Format objects:</b> <code>DateTimeFormatter</code> is thread-safe and can be cached per locale; <code>NumberFormat</code> is not thread-safe.</li><li><b>Locale list:</b> restrict supported locales so no time is spent on unsupported ones.</li><li><b>Static content:</b> translate images and large text once and serve from a CDN with a locale key.</li></ul>`,
            r`private static final Map<Locale, DateTimeFormatter> FORMATS =
    new ConcurrentHashMap<>();

static String formatDate(LocalDate d, Locale l) {
    return FORMATS.computeIfAbsent(l,
        k -> DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)
                              .withLocale(k)).format(d);
}

// OUTPUT:
// formatDate(2025-03-05, en_US) -> Mar 5, 2025`],
        [`<p>Scenario: invoices for several countries.</p><ul><li>Amount and date use the customer locale.</li><li>Legal text comes from message files.</li><li>The invoice PDF job receives the stored customer locale.</li></ul>`,
            r`@Service
class InvoiceText {
    private final MessageSource ms;
    InvoiceText(MessageSource ms) { this.ms = ms; }

    String line(BigDecimal total, LocalDate due, Locale l) {
        String amount = NumberFormat.getCurrencyInstance(l).format(total);
        String date = DateTimeFormatter
            .ofLocalizedDate(FormatStyle.LONG).withLocale(l).format(due);
        return ms.getMessage("invoice.due", new Object[] {amount, date}, l);
    }
}

// OUTPUT:
// en_US -> Total $99.00 due March 5, 2025
// fr_FR -> Total 99,00 € a payer le 5 mars 2025`]
    ),

    'mvc-locale-i18n': dv(
        [`<p>How the locale travels through a request:</p><ul><li><code>DispatcherServlet.buildLocaleContext</code> asks the <code>LocaleResolver</code>.</li><li>The result is placed in <code>LocaleContextHolder</code> (a thread-local) for the whole request.</li><li>The argument resolver for <code>Locale</code> method parameters reads the same value.</li><li>After the response, the holder is reset.</li></ul>`,
            r`@GetMapping("/where")
public String where(Locale param) {
    Locale holder = LocaleContextHolder.getLocale();
    return param + " " + holder + " " + param.equals(holder);
}

// OUTPUT:
// fr_FR fr_FR true`],
        [`<p>Ways to obtain a locale:</p><ul><li><b>Method parameter:</b> <code>Locale locale</code>.</li><li><b>Request:</b> <code>RequestContextUtils.getLocale(request)</code>.</li><li><b>Holder:</b> <code>LocaleContextHolder.getLocale()</code>.</li><li><b>Factory:</b> <code>Locale.forLanguageTag</code>, <code>Locale.of</code> (Java 19+), <code>Locale.Builder</code>.</li></ul>`,
            r`Locale a = new Locale.Builder().setLanguage("pt").setRegion("BR").build();
Locale b = Locale.forLanguageTag("pt-BR");
System.out.println(a.equals(b) + " " + a.toLanguageTag() + " " + a);

// OUTPUT:
// true pt-BR pt_BR`],
        [`<p>Mistakes with locales:</p><ul><li><b>Default locale in server code:</b> <code>String.format</code> without a locale.</li><li><b>Parsing tags by hand:</b> splitting on an underscore fails for new tags.</li><li><b>Async loss:</b> the locale is missing in worker threads.</li></ul>`,
            r`// WRONG: runs on another thread, holder is empty -> server default locale
@Async
public void sendMail(User u) {
    Locale l = LocaleContextHolder.getLocale();
}
// RIGHT: pass the locale as an argument
@Async
public void sendMail(User u, Locale l) { /* use l */ }

// OUTPUT:
// WRONG: locale = en_US (server default) for a French user
// RIGHT: locale = fr_FR`],
        [`<p>Performance notes:</p><ul><li>A <code>Locale</code> is immutable and cheap, but <code>getDisplayName</code> loads locale data on first use.</li><li>Use <code>Locale.ROOT</code> for technical case conversion and formatting of keys.</li><li>A <code>TaskDecorator</code> can copy the locale to async threads.</li></ul>`,
            r`@Bean
TaskDecorator localeDecorator() {
    return task -> {
        Locale l = LocaleContextHolder.getLocale();   // caller thread
        return () -> {
            LocaleContextHolder.setLocale(l);          // worker thread
            try { task.run(); } finally { LocaleContextHolder.resetLocaleContext(); }
        };
    };
}

// OUTPUT:
// async tasks now see the caller locale and clean up after themselves`],
        [`<p>Scenario: a welcome email after sign-up.</p><ul><li>The locale is read once in the controller.</li><li>It is saved in the user record.</li><li>The mail job reads it from the record, never from the thread.</li></ul>`,
            r`@PostMapping("/signup")
public String signup(@Valid SignupForm f, Locale locale) {
    User u = users.save(new User(f.email(), locale.toLanguageTag()));
    mailer.sendWelcome(u.getEmail(), locale);
    return "redirect:/thanks";
}

// OUTPUT:
// users table row: email=a@x.com, locale=fr-FR
// mail subject in French: Bienvenue !`]
    ),

    'mvc-localeresolver': dv(
        [`<p>The interface has two methods: <code>resolveLocale(request)</code> and <code>setLocale(request, response, locale)</code>.</p><ul><li><code>DispatcherServlet.initLocaleResolver</code> looks for a bean named <code>localeResolver</code>; if none, it creates <code>AcceptHeaderLocaleResolver</code>.</li><li>On each request <code>buildLocaleContext</code> calls <code>resolveLocale</code> (or a <code>LocaleContextResolver</code>, which can also give a time zone).</li><li><code>SessionLocaleResolver</code> stores the locale in a session attribute; <code>CookieLocaleResolver</code> writes a cookie in <code>setLocale</code>.</li></ul>`,
            r`public interface LocaleResolver {
    Locale resolveLocale(HttpServletRequest request);
    void setLocale(HttpServletRequest request,
                   HttpServletResponse response, Locale locale);
}

// OUTPUT:
// AcceptHeader: resolve reads Accept-Language, setLocale throws
// Session: resolve reads session attribute, setLocale writes it
// Cookie: resolve reads the cookie, setLocale adds Set-Cookie`],
        [`<p>Resolver options:</p><ul><li><b>AcceptHeaderLocaleResolver:</b> stateless, no switching.</li><li><b>SessionLocaleResolver:</b> per session, simple.</li><li><b>CookieLocaleResolver:</b> persistent, cookie name, max age, path, secure flags.</li><li><b>FixedLocaleResolver:</b> always one locale, useful for tests.</li><li><b>Custom:</b> read from user, subdomain or path.</li></ul>`,
            r`CookieLocaleResolver r = new CookieLocaleResolver("lang");
r.setCookieMaxAge(Duration.ofDays(90));
r.setCookiePath("/");
r.setCookieHttpOnly(true);
r.setCookieSecure(true);
r.setDefaultLocale(Locale.ENGLISH);

// OUTPUT:
// Set-Cookie: lang=fr; Max-Age=7776000; Path=/; Secure; HttpOnly`],
        [`<p>Common problems:</p><ul><li><b>Bean named wrongly</b> so it is ignored.</li><li><b>Header resolver plus interceptor</b> gives <code>UnsupportedOperationException</code>.</li><li><b>Cookie flags:</b> cookie missing because of Secure on plain HTTP in development.</li></ul>`,
            r`// WRONG: method name decides the bean name -> "myResolver"
@Bean
public LocaleResolver myResolver() { return new SessionLocaleResolver(); }

// RIGHT
@Bean
public LocaleResolver localeResolver() { return new SessionLocaleResolver(); }

// OUTPUT:
// WRONG: still the header resolver; ?lang=fr throws UnsupportedOperationException
// RIGHT: switching works`],
        [`<p>Tuning and design:</p><ul><li>Header and cookie resolvers are stateless on the server and scale freely.</li><li>The session resolver adds session memory and needs sticky or shared sessions.</li><li>A custom resolver that loads the user from a database should cache the value in the request.</li></ul>`,
            r`public class UserLocaleResolver extends AcceptHeaderLocaleResolver {
    @Override
    public Locale resolveLocale(HttpServletRequest req) {
        Object cached = req.getAttribute("resolvedLocale");
        if (cached != null) return (Locale) cached;
        Locale l = currentUserLocale(req)         // may hit a database
            .orElseGet(() -> super.resolveLocale(req));
        req.setAttribute("resolvedLocale", l);
        return l;
    }
}

// OUTPUT:
// one database call per request even if resolveLocale runs many times`],
        [`<p>Scenario: logged-in users keep their language across devices.</p><ul><li>The profile stores the locale.</li><li>The resolver prefers the profile, then the cookie, then the header.</li></ul>`,
            r`@Override
public Locale resolveLocale(HttpServletRequest req) {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    if (a != null && a.getPrincipal() instanceof AppUser u && u.locale() != null) {
        return u.locale();
    }
    return super.resolveLocale(req);          // cookie or header fallback
}

// OUTPUT:
// anonymous: header language; logged in as Asha: hi`]
    ),

    'mvc-localechangeinterceptor': dv(
        [`<p>The class extends <code>HandlerInterceptorAdapter</code>-style behavior through <code>HandlerInterceptor.preHandle</code>.</p><ul><li>It reads <code>request.getParameter(paramName)</code>.</li><li>It gets the resolver with <code>RequestContextUtils.getLocaleResolver(request)</code>; if none, it throws <code>IllegalStateException</code>.</li><li>It parses the value with <code>StringUtils.parseLocale</code> and calls <code>setLocale</code>.</li><li>It always returns <code>true</code>, so the chain continues.</li></ul>`,
            r`// Simplified from the framework
public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                         Object handler) {
    String value = req.getParameter(getParamName());
    if (value != null) {
        LocaleResolver lr = RequestContextUtils.getLocaleResolver(req);
        lr.setLocale(req, res, StringUtils.parseLocale(value));
    }
    return true;
}

// OUTPUT:
// ?lang=fr -> resolver now holds fr for this and later requests`],
        [`<p>Options:</p><ul><li><code>setParamName</code>: parameter name.</li><li><code>setHttpMethods</code>: allowed methods (all by default).</li><li><code>setIgnoreInvalidLocale</code>: swallow bad values.</li><li><code>setLanguageTagCompliant</code>: parse BCP 47 tags such as <code>fr-CA</code> when true.</li></ul>`,
            r`LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
lci.setParamName("lang");
lci.setHttpMethods("GET", "POST");
lci.setIgnoreInvalidLocale(true);
lci.setLanguageTagCompliant(true);
registry.addInterceptor(lci).addPathPatterns("/**").excludePathPatterns("/api/**");

// OUTPUT:
// /page?lang=fr-CA accepted; /api/data?lang=fr ignored by the interceptor`],
        [`<p>Mistakes:</p><ul><li><b>Not registered:</b> only a bean, never added to the registry.</li><li><b>Header resolver</b> still active.</li><li><b>Lowercase vs tag:</b> <code>fr_CA</code> versus <code>fr-CA</code> confusion; enable the language tag mode if you send tags.</li><li><b>Caching</b> by proxies ignoring the parameter.</li></ul>`,
            r`// WRONG: a bean is not enough
@Bean
public LocaleChangeInterceptor localeChangeInterceptor() {
    return new LocaleChangeInterceptor();
}
// RIGHT: add it in addInterceptors(InterceptorRegistry)

// OUTPUT:
// WRONG: ?locale=fr does nothing
// RIGHT: the locale changes`],
        [`<p>Performance:</p><ul><li>The cost is one parameter read per request, almost nothing.</li><li>Limit it with <code>addPathPatterns</code> to page routes, not static files or APIs.</li><li>For caches add <code>Vary: Accept-Language</code> or include the parameter in the cache key.</li></ul>`,
            r`registry.addInterceptor(lci)
        .addPathPatterns("/", "/products/**", "/account/**")
        .excludePathPatterns("/static/**", "/actuator/**");

// OUTPUT:
// static resources skip the interceptor entirely`],
        [`<p>Scenario: switch with a safe redirect and a test.</p><ul><li>The parameter changes the cookie.</li><li>The cookie is checked in the test response.</li></ul>`,
            r`@Test
void langParamSetsCookie() throws Exception {
    mvc.perform(get("/home").param("lang", "fr"))
       .andExpect(status().isOk())
       .andExpect(cookie().value("lang", "fr"));
}

// OUTPUT:
// Tests run: 1, Failures: 0
// (needs CookieLocaleResolver named lang and the interceptor registered)`]
    ),

    'mvc-messagesource': dv(
        [`<p>Inside the framework:</p><ul><li><b>AbstractMessageSource.getMessage</b> first tries <code>resolveCodeWithoutArguments</code> when args are empty, otherwise <code>resolveCode</code> that returns a cached <code>MessageFormat</code>.</li><li>If not found it asks the parent source, then uses the default message, then throws.</li><li><b>Formats</b> are cached per message and locale.</li><li><b>AbstractApplicationContext.initMessageSource</b> picks the bean named <code>messageSource</code> or creates an empty delegating one.</li></ul>`,
            r`public interface MessageSource {
    String getMessage(String code, Object[] args, String defaultMessage, Locale l);
    String getMessage(String code, Object[] args, Locale l)
        throws NoSuchMessageException;
    String getMessage(MessageSourceResolvable resolvable, Locale l)
        throws NoSuchMessageException;
}

// OUTPUT:
// The ApplicationContext itself implements this interface and delegates.`],
        [`<p>Ways to call it:</p><ul><li>Inject <code>MessageSource</code>.</li><li>Implement <code>MessageSourceAware</code>.</li><li>Use <code>MessageSourceAccessor</code> to avoid passing a locale.</li><li>Use a <code>MessageSourceResolvable</code> such as <code>DefaultMessageSourceResolvable</code> with several candidate codes.</li></ul>`,
            r`MessageSourceAccessor acc = new MessageSourceAccessor(messageSource);
String t = acc.getMessage("greeting");        // locale from LocaleContextHolder
var res = new DefaultMessageSourceResolvable(
    new String[] {"error.custom", "error.default"}, "Unknown error");
String e = messageSource.getMessage(res, Locale.ENGLISH);

// OUTPUT:
// t = Bonjour (fr request); e = first existing code, else Unknown error`],
        [`<p>Mistakes:</p><ul><li><b>Passing null locale</b>.</li><li><b>Forgetting the args array</b> so {0} stays in the text.</li><li><b>Number formatting</b> in args: <code>1234</code> becomes <code>1,234</code>; pass a String if you want it plain.</li><li><b>Single quote</b> problem.</li></ul>`,
            r`// {0} formats numbers with grouping by locale
ms.getMessage("order.no", new Object[] {12345}, Locale.ENGLISH);  // 12,345
// pass text to avoid grouping
ms.getMessage("order.no", new Object[] {"12345"}, Locale.ENGLISH); // 12345

// OUTPUT:
// Order No. 12,345
// Order No. 12345`],
        [`<p>Tuning:</p><ul><li>Parsed <code>MessageFormat</code> objects are cached, so repeated calls are cheap.</li><li>Messages with no args skip the format step.</li><li>Large bundles: split by feature with several basenames.</li></ul>`,
            r`ResourceBundleMessageSource ms = new ResourceBundleMessageSource();
ms.setBasenames("i18n/common", "i18n/orders", "i18n/errors");
ms.setAlwaysUseMessageFormat(false);   // skip MessageFormat when no args

// OUTPUT:
// Messages without arguments are returned as-is, faster and with no quote escaping.`],
        [`<p>Scenario: a service that builds user-facing error text.</p><ul><li>Business code throws a coded exception.</li><li>An advice translates the code using the request locale.</li></ul>`,
            r`@RestControllerAdvice
class ApiErrors {
    private final MessageSource ms;
    ApiErrors(MessageSource ms) { this.ms = ms; }

    @ExceptionHandler(AppException.class)
    ResponseEntity<Map<String, String>> handle(AppException e, Locale l) {
        String text = ms.getMessage(e.code(), e.args(), e.code(), l);
        return ResponseEntity.badRequest().body(Map.of("message", text));
    }
}

// OUTPUT:
// 400 {"message":"Stock insuffisant pour Stylo"}   (fr)
// 400 {"message":"Not enough stock for Pen"}       (en)`]
    ),

    'mvc-resourcebundlemessagesource': dv(
        [`<p>How it loads text:</p><ul><li>It calls <code>ResourceBundle.getBundle(basename, locale, classLoader, control)</code> with a control that reads properties in the chosen encoding.</li><li>Candidate locales are tried from specific to general.</li><li>Bundles are kept in a map keyed by basename and locale, so each file is read once.</li><li>A <code>MessageFormat</code> per message and locale is cached too.</li></ul>`,
            r`// Candidate list for Locale("fr", "CA") when fallbackToSystemLocale=false
// 1. messages_fr_CA.properties
// 2. messages_fr.properties
// 3. messages.properties
ResourceBundle b = ResourceBundle.getBundle("messages", Locale.CANADA_FRENCH);
System.out.println(b.getLocale());

// OUTPUT:
// fr   (when only messages_fr and messages exist)`],
        [`<p>Variants of configuration:</p><ul><li><code>setBasename</code> or <code>setBasenames</code>.</li><li><code>setDefaultEncoding</code> and per-file <code>setFileEncodings</code>.</li><li><code>setFallbackToSystemLocale</code>.</li><li><code>setUseCodeAsDefaultMessage</code>: return the key instead of throwing.</li><li><code>setParentMessageSource</code>.</li></ul>`,
            r`ResourceBundleMessageSource ms = new ResourceBundleMessageSource();
ms.setBasename("messages");
ms.setDefaultEncoding("UTF-8");
ms.setUseCodeAsDefaultMessage(true);
System.out.println(ms.getMessage("unknown.key", null, Locale.ENGLISH));

// OUTPUT:
// unknown.key`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Path style basename:</b> use <code>i18n/messages</code> or dots, not <code>classpath:</code> (that prefix belongs to the reloadable class).</li><li><b>File not copied</b> to <code>target/classes</code> because it sits outside resources.</li><li><b>Wrong file name case</b> on Linux.</li><li><b>Editing in IDE</b> without a rebuild.</li></ul>`,
            r`// WRONG for ResourceBundleMessageSource
ms.setBasename("classpath:messages");
// RIGHT
ms.setBasename("messages");
// RIGHT for the reloadable class
reloadable.setBasename("classpath:messages");

// OUTPUT:
// WRONG: NoSuchMessageException for every key
// RIGHT: keys found`],
        [`<p>Tuning:</p><ul><li>Keep bundles in the jar; classpath reads are fast and cached.</li><li>Do not use the reloadable class in production unless you need live editing.</li><li>Keep the base file complete to avoid repeated failed lookups.</li></ul>`,
            r`@Bean
MessageSource messageSource() {
    var ms = new ResourceBundleMessageSource();
    ms.setBasename("messages");
    ms.setDefaultEncoding("UTF-8");
    ms.setCacheMillis(-1);      // never expire: fastest in production
    return ms;
}

// OUTPUT:
// each bundle parsed once per JVM start`],
        [`<p>Scenario: unit test without starting Spring.</p><ul><li>Build the source by hand.</li><li>Assert the lookup order.</li></ul>`,
            r`class MessagesTest {
    private final ResourceBundleMessageSource ms = new ResourceBundleMessageSource();

    MessagesTest() {
        ms.setBasename("messages");
        ms.setDefaultEncoding("UTF-8");
        ms.setFallbackToSystemLocale(false);
    }

    @Test
    void fallsBackToBase() {
        assertEquals("Hello",
            ms.getMessage("greeting", null, Locale.GERMAN));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0   (no messages_de file, base used)`]
    ),

    'mvc-language-properties': dv(
        [`<p>A properties file is parsed by <code>java.util.Properties.load</code> into a map.</p><ul><li>Lines with <code>#</code> or <code>!</code> start comments.</li><li>The first <code>=</code>, <code>:</code> or space separates key and value.</li><li>A trailing backslash continues a value on the next line.</li><li>The message source then wraps each value in a <code>MessageFormat</code> when args are given.</li></ul>`,
            r`# long text over two lines (note the trailing backslash)
terms.text=By clicking you agree to the terms and \
conditions of the service.
# key with spaces needs escaping, so avoid spaces in keys
order.total=Total: {0}

// OUTPUT:
// terms.text -> By clicking you agree to the terms and conditions of the service.`],
        [`<p>Syntax variants:</p><ul><li><b>Placeholders:</b> <code>{0}</code>, with types such as <code>{0,number,#.##}</code> or <code>{1,date,short}</code>.</li><li><b>Choice:</b> <code>{0,choice,0#no items|1#one item|1&lt;{0} items}</code>.</li><li><b>Unicode escapes:</b> <code>\\u0928</code>.</li></ul>`,
            r`# messages.properties
cart.items=You have {0,choice,0#no items|1#one item|1<{0} items}.
price=Price: {0,number,#.00}

System.out.println(ms.getMessage("cart.items", new Object[] {0}, Locale.ENGLISH));
System.out.println(ms.getMessage("cart.items", new Object[] {1}, Locale.ENGLISH));
System.out.println(ms.getMessage("cart.items", new Object[] {4}, Locale.ENGLISH));

// OUTPUT:
// You have no items.
// You have one item.
// You have 4 items.`],
        [`<p>Frequent mistakes:</p><ul><li><b>Missing key in one language</b>.</li><li><b>Trailing spaces</b> are kept in values.</li><li><b>Quotes:</b> <code>don't</code> loses the placeholder after it.</li><li><b>Duplicate keys</b>: the last one wins silently.</li></ul>`,
            r`# WRONG: one quote hides the placeholder
hello=Don't forget {0}
# RIGHT
hello=Don''t forget {0}

// OUTPUT:
// WRONG: Dont forget {0}
// RIGHT: Don't forget Asha`],
        [`<p>Performance and maintenance:</p><ul><li>Files are read once and cached; size has little effect.</li><li>Keep one file per feature for large apps.</li><li>Sort keys and review them in pull requests.</li><li>Use a translation tool or service that exports properties files.</li></ul>`,
            r`# application.properties - split by feature
spring.messages.basename=i18n/common,i18n/orders,i18n/admin

# src/main/resources/i18n/orders_fr.properties
order.title=Commandes

# OUTPUT:
# Smaller files, fewer merge conflicts between translators.`],
        [`<p>Scenario: release gate that checks all languages.</p><ul><li>The test lists every <code>messages_*.properties</code> file.</li><li>It fails when a key is missing or has an empty value.</li></ul>`,
            r`@Test
void allLanguagesComplete() throws Exception {
    Properties base = load("messages.properties");
    try (var files = Files.list(Path.of("src/main/resources"))) {
        for (Path p : files.filter(f -> f.getFileName().toString()
                .matches("messages_.+\\.properties")).toList()) {
            Properties lang = load(p.getFileName().toString());
            assertThat(lang.stringPropertyNames())
                .as(p.toString()).containsAll(base.stringPropertyNames());
        }
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0   (or: messages_hi.properties is missing login.error)`]
    ),

    'mvc-multi-language-applications': dv(
        [`<p>The full request flow of a multi-language page:</p><ul><li>Interceptor: <code>LocaleChangeInterceptor</code> may change the locale.</li><li>Controller: builds the model; texts may come from <code>MessageSource</code>.</li><li>View: <code>ThymeleafView</code> uses the request locale for <code>#{...}</code> keys, formats and the <code>#locale</code> object.</li><li>Errors: the <code>BindingResult</code> resolves field error codes through the same source.</li></ul>`,
            r`@Controller
class PageController {
    @GetMapping("/page")
    String page(Model model, Locale locale) {
        model.addAttribute("today", LocalDate.now());
        return "page";          // template reads #{page.title} for this locale
    }
}

// OUTPUT:
// <h1>Welcome</h1> (en)  /  <h1>Bienvenue</h1> (fr)`],
        [`<p>Design variants:</p><ul><li><b>Parameter and cookie:</b> simplest.</li><li><b>Path prefix:</b> <code>/fr/...</code>, best for SEO.</li><li><b>Subdomain:</b> <code>fr.example.com</code>.</li><li><b>Header only:</b> best for APIs.</li></ul>`,
            r`@Configuration
class PathLocaleConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry r) {
        r.addInterceptor(new HandlerInterceptor() {
            public boolean preHandle(HttpServletRequest req,
                                     HttpServletResponse res, Object h) {
                String[] parts = req.getRequestURI().split("/");
                if (parts.length > 1 && parts[1].length() == 2) {
                    LocaleContextHolder.setLocale(Locale.forLanguageTag(parts[1]));
                }
                return true;
            }
        });
    }
}

// OUTPUT:
// /fr/products -> locale fr ; /products -> default locale`],
        [`<p>Mistakes:</p><ul><li><b>Untranslated images or buttons</b> with text inside the picture.</li><li><b>Fixed-width layouts</b>.</li><li><b>Language list in code</b> repeated in many places.</li><li><b>Forgetting error pages</b> and emails.</li></ul>`,
            r`// WRONG: supported languages repeated
if (lang.equals("en") || lang.equals("fr")) { ... }
// RIGHT: one list used everywhere
@ConfigurationProperties("app.i18n")
record I18nProps(List<Locale> supported, Locale defaultLocale) {}

// OUTPUT:
// app.i18n.supported=en,fr,hi  (one place to add a language)`],
        [`<p>Tuning:</p><ul><li>Keep pages cacheable by including the language in the URL or the cache key.</li><li>Load only needed bundles per module.</li><li>Use the <code>Content-Language</code> header and <code>lang</code> attribute for correctness.</li></ul>`,
            r`<html th:lang="$` + r`{#locale.language}">
<head><link rel="alternate" hreflang="fr" th:href="@{/fr/home}"></head>

<!-- OUTPUT -->
<!-- <html lang="fr"> and alternate links help browsers and search engines -->`],
        [`<p>Scenario: a learning portal in English, French and Hindi.</p><ul><li>UI text in message files.</li><li>Course titles in a translation table.</li><li>Locale stored in the cookie and the profile.</li></ul>`,
            r`@Entity
class CourseTitle {
    @Id Long id;
    Long courseId;
    String locale;      // en, fr, hi
    String title;
}

interface CourseTitleRepo extends JpaRepository<CourseTitle, Long> {
    Optional<CourseTitle> findByCourseIdAndLocale(Long id, String locale);
}

// OUTPUT:
// findByCourseIdAndLocale(7, "fr") -> "Introduction a Java"
// fall back to "en" when absent`]
    ),

    'mvc-dynamic-language-switching': dv(
        [`<p>Step by step:</p><ul><li>1. The user clicks <code>?lang=fr</code>.</li><li>2. <code>LocaleChangeInterceptor.preHandle</code> parses the value.</li><li>3. The resolver stores it (session attribute or <code>Set-Cookie</code>).</li><li>4. For this request the locale holder is updated, so the page already renders in French.</li><li>5. Later requests read the stored value in <code>resolveLocale</code>.</li></ul>`,
            r`// Request 1: GET /home?lang=fr
// -> Set-Cookie: lang=fr  (CookieLocaleResolver.setLocale)
// Request 2: GET /home   with Cookie: lang=fr
// -> CookieLocaleResolver.resolveLocale returns fr

// OUTPUT:
// HTTP/1.1 200 OK
// Set-Cookie: lang=fr; Path=/
// Content-Language: fr`],
        [`<p>Ways to trigger a switch:</p><ul><li><b>Link or form</b> with a parameter.</li><li><b>Dedicated endpoint</b> that stores the locale and redirects.</li><li><b>JavaScript</b> that sets a cookie and reloads.</li><li><b>REST API</b> that updates the user profile locale.</li></ul>`,
            r`@PostMapping("/api/me/locale")
public ResponseEntity<Void> setLocale(@RequestBody LocaleRequest body,
                                      Principal p) {
    users.updateLocale(p.getName(), body.tag());
    return ResponseEntity.noContent().build();
}
record LocaleRequest(String tag) {}

// OUTPUT:
// 204 No Content   (next login uses the saved language)`],
        [`<p>Mistakes:</p><ul><li><b>Page not reloaded</b> after a JavaScript switch.</li><li><b>Cached HTML</b> served in the old language.</li><li><b>Open redirect</b> after switching.</li><li><b>Locale lost</b> after login because the session id changes; the cookie resolver avoids this.</li></ul>`,
            r`// WRONG: trusts any Referer value
return "redirect:" + referer;
// RIGHT: only relative paths of this site
return "redirect:" + (referer != null && referer.startsWith(baseUrl)
    ? referer.substring(baseUrl.length()) : "/");

// OUTPUT:
// referer https://evil.example -> redirect:/   (safe)`],
        [`<p>Tuning:</p><ul><li>Use a cookie so no session memory is needed.</li><li>Add <code>Vary: Cookie</code> or <code>Vary: Accept-Language</code> on cacheable pages.</li><li>Prefer a path prefix when pages are cached by a CDN.</li></ul>`,
            r`@Bean
FilterRegistrationBean<OncePerRequestFilter> varyFilter() {
    var f = new OncePerRequestFilter() {
        protected void doFilterInternal(HttpServletRequest req,
                HttpServletResponse res, FilterChain chain)
                throws ServletException, IOException {
            res.addHeader("Vary", "Cookie");
            chain.doFilter(req, res);
        }
    };
    return new FilterRegistrationBean<>(f);
}

// OUTPUT:
// Vary: Cookie   (caches keep one copy per language cookie)`],
        [`<p>Scenario: end-to-end test of the switch in a Boot application.</p><ul><li>First request switches to Spanish.</li><li>Second request, with the returned cookie, stays Spanish.</li></ul>`,
            r`@SpringBootTest
@AutoConfigureMockMvc
class SwitchTest {
    @Autowired MockMvc mvc;

    @Test
    void staysInSpanish() throws Exception {
        Cookie c = mvc.perform(get("/hello").param("lang", "es"))
            .andExpect(content().string("Hola"))
            .andReturn().getResponse().getCookie("lang");
        mvc.perform(get("/hello").cookie(c))
            .andExpect(content().string("Hola"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    )
};
