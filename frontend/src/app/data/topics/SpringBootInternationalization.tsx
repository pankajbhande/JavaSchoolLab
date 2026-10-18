import { Topic } from '../coreJava';

export const springBootInternationalization: Topic = {
    id: 'spring-boot-internationalization',
    name: 'Internationalization (i18n)',
    beginner: [
        {
            content: `<h3>What is Internationalization?</h3>
<div class="border">
• Internationalization, or <strong>I18N</strong>, is the process that makes your application adaptable to different languages.<br>
• For example, you can display messages, currencies, dates and times according to a specific region or language.<br>
• Many web applications on the market support several languages - Spanish, Russian, Japanese and so on.<br>
</div><br>

<strong>Why "i18n"?</strong> It is a numeronym: <code>i</code> + 18 letters + <code>n</code>, because "internationalization" is a long word to keep typing. The related term <strong>L10n</strong> (localization) is the act of supplying the translations themselves.<br><br>

<h3>Business requirement</h3>
Display the "Hello" message in different languages.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot Maven project<br>
2. Add the Maven dependency to pom.xml<br>
3. Create a properties file per country/language<br>
4. Create the REST controller<br>
5. Create InternationalizationConfiguration.java<br>
6. Run the application<br>
7. Open Postman (request and response)
</div>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml : only the web starter is needed.
     MessageSource is part of spring-context, which comes with it. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>`
            ]
        },
        {
            content: `<h3>Step 3 - One Properties File Per Language</h3>
The naming pattern is a <strong>basename</strong> followed by the locale code. The basename is what you configure; the suffix is what Spring matches against the requested locale.<br><br>

<table>
<tr><th>File</th><th>Locale</th><th>Language</th></tr>
<tr><td>welcome.properties</td><td>(default)</td><td>The fallback when nothing else matches</td></tr>
<tr><td>welcome_en.properties</td><td>en</td><td>English</td></tr>
<tr><td>welcome_fr.properties</td><td>fr</td><td>French</td></tr>
<tr><td>welcome_ja.properties</td><td>ja</td><td>Japanese</td></tr>
</table>
<br>
All of them live directly in <code>src/main/resources</code>, and every file uses the <strong>same keys</strong> - only the values differ. That is the whole idea: the code refers to a key, never to a piece of text.<br>`,
            codeExamples: [
                `# src/main/resources/welcome.properties   (default fallback)
welcome.to.country=Hello

# src/main/resources/welcome_en.properties
welcome.to.country=Hello

# src/main/resources/welcome_fr.properties
welcome.to.country=Bonjour

# src/main/resources/welcome_ja.properties
welcome.to.country=Konnichiwa

# Do NOT wrap the values in quotes. In a .properties file the quotes
# are part of the value, so "Hello" is returned literally including
# the quote characters.`
            ]
        },
        {
            content: `<h3>Step 5 - The Configuration Class</h3>
Two beans are needed, and they do different jobs.<br><br>

<table>
<tr><th>Bean</th><th>Job</th></tr>
<tr><td><code>LocaleResolver</code></td><td>Decides <em>which</em> locale this request is for.</td></tr>
<tr><td><code>MessageSource</code></td><td>Looks the key up in the file for that locale.</td></tr>
</table>
<br>
<code>AcceptHeaderLocaleResolver</code> reads the standard <code>Accept-Language</code> HTTP header, which is what browsers send automatically. <code>setDefaultLocale</code> gives it a fallback when the header is absent.<br>`,
            codeExamples: [
                `package com.velocity.config;

import java.util.Locale;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

@Configuration
public class InternationalizationConfiguration {

    @Bean
    public AcceptHeaderLocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setDefaultLocale(Locale.US);
        return resolver;
    }

    @Bean
    public ResourceBundleMessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("welcome");          // welcome_xx.properties
        messageSource.setDefaultEncoding("UTF-8");     // essential - see Expert tab
        return messageSource;
    }
}
// The basename is "welcome", NOT "welcome.properties" and not a path.
// Spring appends the locale and the extension itself.`
            ]
        },
        {
            content: `<h3>Step 4 - The REST Controller</h3>
Inject the <code>MessageSource</code> and ask it for the key, passing the locale.<br><br>

<strong>The header name is <code>Accept-Language</code></strong>, with the hyphen. Writing <code>AcceptLanguage</code> means the header never matches, <code>locale</code> is always null, and every request silently falls back to the default language.<br>`,
            codeExamples: [
                `package com.velocity.controller;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InternationalizationController {

    @Autowired
    private MessageSource messageSource;

    @GetMapping("/getMessage")
    public String getLocaleMessage(
            @RequestHeader(name = "Accept-Language", required = false) Locale locale) {

        return messageSource.getMessage("welcome.to.country", null, locale);
    }
}
// Spring converts the raw header string into a java.util.Locale for you.
// With required = false and no header, locale is null and
// getMessage falls back to the default locale.`,
                `// An even simpler version - Spring already resolved the locale,
// so you can just ask for it:
@GetMapping("/getMessage")
public String getLocaleMessage(Locale locale) {
    return messageSource.getMessage("welcome.to.country", null, locale);
}
// No @RequestHeader needed. Spring injects the locale that the
// configured LocaleResolver produced for this request.`
            ]
        },
        {
            content: `<h3>Steps 6 and 7 - Run and Test</h3>
In Postman, add a <strong>Header</strong> with key <code>Accept-Language</code> and value <code>en</code>, <code>fr</code> or <code>ja</code>.<br><br>

<table>
<tr><th>Accept-Language</th><th>File used</th><th>Response</th></tr>
<tr><td>en</td><td>welcome_en.properties</td><td>Hello</td></tr>
<tr><td>fr</td><td>welcome_fr.properties</td><td>Bonjour</td></tr>
<tr><td>ja</td><td>welcome_ja.properties</td><td>Konnichiwa</td></tr>
<tr><td>de (no file)</td><td>welcome.properties</td><td>Hello (the fallback)</td></tr>
<tr><td>(header absent)</td><td>welcome.properties</td><td>Hello</td></tr>
</table>`,
            codeExamples: [
                `// REQUEST 1
// GET http://localhost:8080/getMessage
// Headers: Accept-Language: en
// RESPONSE: Hello

// REQUEST 2
// GET http://localhost:8080/getMessage
// Headers: Accept-Language: fr
// RESPONSE: Bonjour

// REQUEST 3
// GET http://localhost:8080/getMessage
// Headers: Accept-Language: ja
// RESPONSE: Konnichiwa

// REQUEST 4 - a language with no file
// Headers: Accept-Language: de
// RESPONSE: Hello
// Spring walks the fallback chain: welcome_de -> welcome (default).

// The same thing from the command line:
// curl -H "Accept-Language: fr" http://localhost:8080/getMessage`,
                `// If the key is missing from EVERY file:
// org.springframework.context.NoSuchMessageException:
//   No message found under code 'welcome.to.country' for locale 'fr'.

// To return a fallback instead of throwing:
messageSource.getMessage("welcome.to.country", null, "Hello", locale);
//                                                   ^ default message

// Or configure it globally:
messageSource.setUseCodeAsDefaultMessage(true);
// Now a missing key returns the key itself - useful in development,
// because a raw "welcome.to.country" on screen is obvious, whereas
// a silent fallback to English is not.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Encoding Is the Failure Everyone Hits</h3>
Java <code>.properties</code> files are read as <strong>ISO-8859-1</strong> by default. Any character outside Latin-1 - Japanese, Hindi, Chinese, even a French accent in some setups - is mangled into question marks or mojibake, silently.<br><br>

Notice that the walkthrough uses "Konnichiwa" rather than こんにちは. That romanised spelling sidesteps the problem instead of solving it.<br><br>

<table>
<tr><th>Fix</th><th>Effect</th></tr>
<tr><td><code>setDefaultEncoding("UTF-8")</code></td><td>Required. Without it, non-Latin text is garbage.</td></tr>
<tr><td><code>spring.messages.encoding=UTF-8</code></td><td>The same thing via properties, if you use Boot's auto-configured MessageSource.</td></tr>
<tr><td>Save the files as UTF-8</td><td>The IDE must agree with the code - check the editor's encoding setting.</td></tr>
<tr><td><code>\\uXXXX</code> escapes</td><td>The old workaround; unreadable and now unnecessary.</td></tr>
</table>`,
            codeExamples: [
                `# welcome_ja.properties, saved as UTF-8, read as ISO-8859-1:
welcome.to.country=こんにちは
# OUTPUT: ã\\u0081\\u0093ã\\u0082\\u0093ã\\u0081«ã\\u0081¡ã\\u0081¯

# With setDefaultEncoding("UTF-8"):
# OUTPUT: こんにちは

# The pre-Java-9 workaround, still seen in old codebases:
welcome.to.country=\\u3053\\u3093\\u306B\\u3061\\u306F
# Correct, and nobody can proofread it.`,
                `// Spring Boot auto-configures a MessageSource already, so the whole
// configuration class can be replaced by properties:

# application.properties
spring.messages.basename=welcome
spring.messages.encoding=UTF-8
spring.messages.fallback-to-system-locale=false
spring.messages.use-code-as-default-message=true

// Only the LocaleResolver bean is still needed:
@Bean
public LocaleResolver localeResolver() {
    AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
    resolver.setDefaultLocale(Locale.ENGLISH);
    return resolver;
}
// fallback-to-system-locale=false matters in production: without it,
// a missing translation falls back to the SERVER's locale, so the
// language depends on which machine the app happens to run on.`
            ]
        },
        {
            content: `<h3>How the Locale Is Chosen: the Fallback Chain</h3>
<code>Accept-Language</code> is richer than a two-letter code. Browsers send a weighted list, and Spring resolves it against your available bundles in a defined order.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Accept-Language: fr-CA,fr;q=0.9,en;q=0.8

    q = quality weight, 1.0 when omitted.
    Preference order:  fr-CA  >  fr  >  en

For fr-CA, Spring looks for:
    welcome_fr_CA.properties     most specific
    welcome_fr.properties        language only
    welcome.properties           the default bundle
    -> NoSuchMessageException if none exist</pre>

<table>
<tr><th>LocaleResolver</th><th>Decides the locale from</th></tr>
<tr><td>AcceptHeaderLocaleResolver</td><td>The <code>Accept-Language</code> header. Stateless - ideal for a REST API.</td></tr>
<tr><td>SessionLocaleResolver</td><td>An attribute in the HTTP session. The user's choice persists for the session.</td></tr>
<tr><td>CookieLocaleResolver</td><td>A cookie, so the choice survives across sessions.</td></tr>
<tr><td>FixedLocaleResolver</td><td>Always the same locale. Useful in tests.</td></tr>
</table>
<br>
<strong>AcceptHeaderLocaleResolver cannot be changed at runtime</strong> - <code>setLocale()</code> throws <code>UnsupportedOperationException</code>. If users need a language switcher, use the session or cookie resolver.<br>`,
            codeExamples: [
                `// A language switcher: cookie resolver + a change interceptor
@Configuration
public class I18nConfig implements WebMvcConfigurer {

    @Bean
    public LocaleResolver localeResolver() {
        CookieLocaleResolver resolver = new CookieLocaleResolver("lang");
        resolver.setDefaultLocale(Locale.ENGLISH);
        resolver.setCookieMaxAge(Duration.ofDays(365));
        return resolver;
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }
}
// OUTPUT:
// GET /getMessage?lang=fr  -> Bonjour, and a "lang=fr" cookie is set
// GET /getMessage          -> Bonjour (the cookie is remembered)
// GET /getMessage?lang=ja  -> Konnichiwa, cookie updated`,
                `// Restricting to languages you actually support, so an
// Accept-Language of "xx" does not silently become the server locale
@Bean
public LocaleResolver localeResolver() {
    AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
    resolver.setSupportedLocales(List.of(
            Locale.ENGLISH, Locale.FRENCH, Locale.JAPANESE));
    resolver.setDefaultLocale(Locale.ENGLISH);
    return resolver;
}
// OUTPUT:
// Accept-Language: fr-CA,fr;q=0.9  -> fr  (best supported match)
// Accept-Language: de             -> en  (the configured default)`
            ]
        },
        {
            content: `<h3>Placeholders, Plurals and Formatting</h3>
Real messages are rarely a bare word. <code>MessageSource</code> takes an argument array and formats it with <code>MessageFormat</code>, which handles number, date and currency formatting <em>per locale</em>.<br><br>

<strong>Never build a sentence by concatenating translated fragments</strong> - word order differs between languages, so the fragments cannot be reassembled correctly. Put the whole sentence in the bundle with placeholders.<br>`,
            codeExamples: [
                `# welcome_en.properties
greeting.user=Hello {0}, you have {1} new messages.
policy.premium=Your premium of {0,number,currency} is due on {1,date,long}.

# welcome_fr.properties
greeting.user=Bonjour {0}, vous avez {1} nouveaux messages.
policy.premium=Votre prime de {0,number,currency} est due le {1,date,long}.`,
                `@GetMapping("/greet")
public String greet(Locale locale) {
    return messageSource.getMessage("greeting.user",
            new Object[] { "ajay", 5 }, locale);
}
// OUTPUT:
// Accept-Language: en -> Hello ajay, you have 5 new messages.
// Accept-Language: fr -> Bonjour ajay, vous avez 5 nouveaux messages.

@GetMapping("/premium")
public String premium(Locale locale) {
    return messageSource.getMessage("policy.premium",
            new Object[] { new BigDecimal("12000"), new Date() }, locale);
}
// OUTPUT:
// en_IN -> Your premium of ₹12,000.00 is due on 5 October 2023.
// fr_FR -> Votre prime de 12 000,00 € est due le 5 octobre 2023.
// Note the separators and the symbol position both change -
// MessageFormat handles that from the locale.`,
                `# Plurals: "1 message" vs "5 messages" cannot be solved with an
# if-statement, because languages have different plural categories
# (Polish has three, Arabic six). MessageFormat has a choice syntax:
inbox.count={0,choice,0#no messages|1#one message|1<{0} messages}
// OUTPUT:
// 0 -> no messages
// 1 -> one message
// 7 -> 7 messages`,
                `// Validation messages are localised the same way, for free.
public record EmployeeRequest(
        @NotBlank(message = "{employee.name.required}") String name,
        @NotBlank(message = "{employee.city.required}") String city) { }

# welcome_en.properties
employee.name.required=Name is required
# welcome_fr.properties
employee.name.required=Le nom est obligatoire

// Wire the MessageSource into the validator:
@Bean
public LocalValidatorFactoryBean validator(MessageSource messageSource) {
    LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
    bean.setValidationMessageSource(messageSource);
    return bean;
}
// OUTPUT: a 400 response now carries the error message in the
// caller's own language.`
            ]
        },
        {
            content: `<h3><code>ResourceBundleMessageSource</code> vs <code>ReloadableResourceBundleMessageSource</code></h3>
The example uses the first. The difference matters in development and in deployment.<br><br>

<table>
<tr><th></th><th>ResourceBundleMessageSource</th><th>ReloadableResourceBundleMessageSource</th></tr>
<tr><td>Reads from</td><td>The classpath, via <code>java.util.ResourceBundle</code></td><td>Any Spring <code>Resource</code> - classpath, file system, URL</td></tr>
<tr><td>Caching</td><td>Permanent - a change needs a restart</td><td><code>setCacheSeconds(n)</code> re-reads without a restart</td></tr>
<tr><td>Files outside the jar</td><td>No</td><td>Yes - <code>file:/opt/app/messages</code></td></tr>
<tr><td>Best for</td><td>Production defaults</td><td>Development, and translations updated without redeploying</td></tr>
</table>
<br>
The reloadable version is what lets a translation team fix wording on a running system.<br>`,
            codeExamples: [
                `@Bean
public MessageSource messageSource() {
    ReloadableResourceBundleMessageSource source =
            new ReloadableResourceBundleMessageSource();

    // Classpath defaults, overridden by files on disk if present
    source.setBasenames("classpath:welcome", "file:/opt/app/i18n/welcome");
    source.setDefaultEncoding("UTF-8");
    source.setCacheSeconds(60);              // re-read every minute
    source.setFallbackToSystemLocale(false);
    return source;
}
// Later basenames win, so ops can drop an updated
// /opt/app/i18n/welcome_fr.properties and the fix goes live within
// a minute - no rebuild, no restart.
//
// setCacheSeconds(-1) caches forever; use that in production if
// translations only change with a release.`,
                `// Testing that every bundle has every key - a cheap, high-value test
@Test
void allBundlesHaveTheSameKeys() throws IOException {

    Set<String> reference = keysOf("welcome_en.properties");

    for (String lang : List.of("fr", "ja")) {
        Set<String> keys = keysOf("welcome_" + lang + ".properties");

        assertThat(keys)
                .as("missing keys in " + lang)
                .containsAll(reference);
    }
}
// Catches the commonest i18n bug: a key added to English and
// forgotten everywhere else, which becomes a NoSuchMessageException
// for exactly the users who speak that language.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does i18n mean?</td><td>Internationalization - i, 18 letters, n. Making an application adaptable to different languages and regions.</td></tr>
<tr><td>Difference between i18n and L10n?</td><td>i18n is building the capability; L10n (localization) is supplying the actual translations and regional formats.</td></tr>
<tr><td>What is the properties file naming convention?</td><td><code>basename_language_COUNTRY.properties</code> - e.g. <code>welcome_fr_CA.properties</code>, falling back to <code>welcome_fr</code> then <code>welcome</code>.</td></tr>
<tr><td>Which two beans are required?</td><td>A <code>LocaleResolver</code> to decide the locale, and a <code>MessageSource</code> to look the key up.</td></tr>
<tr><td>What does AcceptHeaderLocaleResolver use?</td><td>The <code>Accept-Language</code> HTTP header. It is stateless, which suits a REST API.</td></tr>
<tr><td>Why can't you change the locale with AcceptHeaderLocaleResolver?</td><td><code>setLocale()</code> throws UnsupportedOperationException - the header is the source of truth. Use Session or Cookie resolvers for a language switcher.</td></tr>
<tr><td>Why does non-Latin text come out as mojibake?</td><td>.properties files default to ISO-8859-1. Call <code>setDefaultEncoding("UTF-8")</code> or set <code>spring.messages.encoding=UTF-8</code>.</td></tr>
<tr><td>What is the basename?</td><td>The file name without the locale suffix or extension - <code>welcome</code>, not <code>welcome.properties</code>.</td></tr>
<tr><td>What happens when a key is missing?</td><td><code>NoSuchMessageException</code>. Pass a default message, or set <code>useCodeAsDefaultMessage</code>.</td></tr>
<tr><td>How do you insert values into a message?</td><td><code>getMessage(code, args, locale)</code> with <code>{0}</code>, <code>{1}</code> placeholders; MessageFormat also formats numbers, currencies and dates per locale.</td></tr>
<tr><td>Why not concatenate translated fragments?</td><td>Word order differs between languages, so fragments cannot be reassembled correctly. Put the whole sentence in the bundle.</td></tr>
<tr><td>Difference between ResourceBundleMessageSource and the Reloadable one?</td><td>The first caches permanently and reads only from the classpath; the second can read from the file system and re-read on a timer, so translations can change without a restart.</td></tr>
<tr><td>Why set <code>fallback-to-system-locale=false</code>?</td><td>Otherwise a missing translation falls back to the server machine's locale, making behaviour depend on where the app runs.</td></tr>
</table>`
        }
    ]
};
