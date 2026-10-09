import { Topic } from '../coreJava';

export const springBootMailSending: Topic = {
    id: 'spring-boot-mail-sending',
    name: 'Sending Email',
    beginner: [
        {
            content: `<h3>Sending Mail from a Spring Boot Application</h3>
<strong>Business requirement:</strong> an application often has to notify a user by email - a registration confirmation, a password reset link, an invoice, a nightly report. Rather than talking to an SMTP server by hand, Spring Boot gives you a configured mail client and you supply the message.<br><br>

<strong>Problem statement:</strong> design a REST endpoint that accepts an email address and sends a message to it through Gmail's SMTP server.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add <code>spring-boot-starter-mail</code> &nbsp; 3. Configure SMTP in <code>application.properties</code><br>
4. Model class &nbsp; 5. Mail service &nbsp; 6. REST controller &nbsp; 7. Run &nbsp; 8. Call it from Postman<br>
9. Check the mailbox &nbsp; 10. Generate a Google App Password &nbsp; 11. Add email validation &nbsp; 12. Send an attachment
</div><br>

The starter pulls in <strong>Jakarta Mail</strong> (formerly JavaMail) and, more importantly, auto-configures a <strong>JavaMailSender</strong> bean from the <code>spring.mail.*</code> properties. That bean is the single thing you inject; you never open a socket or build a <code>Session</code> yourself.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Only spring-boot-starter-mail creates the JavaMailSender bean.
     Without it the application starts, but injecting JavaMailSender fails with:
     // OUTPUT:
     // Parameter 0 of constructor in com.velocity.service.MailService required
     // a bean of type 'org.springframework.mail.javamail.JavaMailSender'
     // that could not be found. -->`
            ]
        },
        {
            content: `<h3>Step 3 - application.properties</h3>
Every one of these keys is read by Spring Boot's <code>MailSenderAutoConfiguration</code>. Anything under <code>spring.mail.properties.*</code> is passed straight through to Jakarta Mail as a session property.<br><br>

<table>
<tr><th>Property</th><th>Purpose</th></tr>
<tr><td><code>spring.mail.host</code></td><td>The SMTP server. <code>smtp.gmail.com</code> for Gmail.</td></tr>
<tr><td><code>spring.mail.port</code></td><td>587 for STARTTLS, 465 for implicit SSL/TLS.</td></tr>
<tr><td><code>spring.mail.username</code></td><td>The account the mail is sent from.</td></tr>
<tr><td><code>spring.mail.password</code></td><td>A <strong>Google App Password</strong>, never the account password.</td></tr>
<tr><td><code>...mail.smtp.auth</code></td><td>Authenticate before sending; without it Gmail rejects the connection.</td></tr>
<tr><td><code>...mail.smtp.starttls.enable</code></td><td>Upgrade the plain connection on port 587 to TLS.</td></tr>
<tr><td><code>...mail.smtp.connectiontimeout</code></td><td>Cap how long a dead SMTP server can hold your request thread.</td></tr>
</table><br>

<strong>Correction to the source material.</strong> The PDF sets <code>socketFactory.port=465</code>, <code>socketFactory.class=javax.net.ssl.SSLSocketFactory</code> and <code>socketFactory.fallback=false</code>, and it says two-step verification "should not be enabled". Both are out of date. The <code>socketFactory</code> keys are a legacy JavaMail idiom superseded by <code>mail.smtp.ssl.enable</code>, and since May 2022 Google has removed the "less secure app" switch entirely: two-step verification must be <em>on</em>, because that is the only way to obtain an App Password. The steps later in the PDF that turn 2FA back off and paste the App Password into the account password field would leave you with no working credential at all.<br>`,
            codeExamples: [
                `# Step 3 - application.properties  (port 587, STARTTLS - the current recommendation)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=javaindustryexperience@gmail.com
spring.mail.password=\${MAIL_APP_PASSWORD}

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Never let a hung SMTP server pin a Tomcat thread for ever.
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

server.port=8083`,
                `# Alternative: implicit SSL on 465, the port the PDF uses.
spring.mail.host=smtp.gmail.com
spring.mail.port=465
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.ssl.enable=true

# The PDF's older equivalent - still works, but no longer the idiomatic form:
# spring.mail.properties.mail.smtp.socketFactory.port=465
# spring.mail.properties.mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory
# spring.mail.properties.mail.smtp.socketFactory.fallback=false`
            ]
        },
        {
            content: `<h3>Step 4 - The model class</h3>
A plain holder for the recipient address.<br><br>

<strong>Correction to the source material.</strong> The PDF declares the class as <code>Users</code> but every import and injection point refers to <code>User</code>, so the code as printed does not compile. It also annotates the model <code>@Component</code> and injects it into the controller with <code>@Autowired</code>. That makes the recipient address a <strong>singleton</strong> shared by every HTTP request - two users hitting the endpoint at the same moment can overwrite each other's address and the mail goes to the wrong person. A request-scoped value belongs in a local variable or a <code>@RequestBody</code> DTO, never in a singleton bean.<br>`,
            codeExamples: [
                `// Step 4 - User.java  (name corrected from "Users", @Component removed)
package com.velocity.model;

public class User {

    private String emailAddress;

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }
}

// The PDF's version:
//     @Component
//     public class Users { ... }
// injected as:  @Autowired private User user;
// Two problems: the class name does not match the imports, and a singleton
// holding per-request state is a data race under any concurrent load.`
            ]
        },
        {
            content: `<h3>Step 5 - The mail service</h3>
<strong>SimpleMailMessage</strong> is the easy path: a to, a subject and a plain-text body. <code>javaMailSender.send(...)</code> opens the SMTP connection, authenticates, transfers the message and closes.<br><br>

Note the constructor injection. Spring can autowire a single constructor without <code>@Autowired</code> since 4.3, and constructor injection makes the dependency final and the class testable without a container.<br>`,
            codeExamples: [
                `// Step 5 - MailService.java
package com.velocity.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.velocity.model.User;

@Service
public class MailService {

    private final JavaMailSender javaMailSender;

    // Gmail rewrites From to the authenticated account anyway, but setting it
    // explicitly keeps the code honest and works on providers that do not.
    @Value("\${spring.mail.username}")
    private String fromAddress;

    // Single constructor - @Autowired is optional from Spring 4.3 onwards.
    public MailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendMail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmailAddress());
        message.setSubject("Spring Boot - Mail Send");
        message.setText("Congratulations! You have received mail from a Java application.");

        javaMailSender.send(message);
    }
}`
            ]
        },
        {
            content: `<h3>Step 6 - The REST controller</h3>
The endpoint takes the address as a query parameter and delegates to the service. <code>MailException</code> is the root of Spring's mail hierarchy and is unchecked, so catching it is a choice rather than an obligation.<br><br>

<strong>Correction to the source material.</strong> The PDF catches <code>MailException</code>, prints it and still returns "Your mail has been sent successfully". The caller is told the mail went out when it did not. Return an accurate status - and note the URL in the PDF says port 8080 while <code>application.properties</code> sets <code>server.port=8083</code>, which is why the request appears to hang for students copying it verbatim.<br>`,
            codeExamples: [
                `// Step 6 - UserController.java
package com.velocity.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.model.User;
import com.velocity.service.MailService;

@RestController
public class UserController {

    private final MailService mailService;

    public UserController(MailService mailService) {
        this.mailService = mailService;
    }

    @GetMapping("/sendmailapp")
    public ResponseEntity<String> sendingMail(@RequestParam("email") String emailId) {

        // Request-scoped state stays local - not a shared @Component.
        User user = new User();
        user.setEmailAddress(emailId);

        try {
            mailService.sendMail(user);
            return ResponseEntity.ok("Your mail has been sent successfully");
        } catch (MailException e) {
            // The PDF swallows this and still reports success.
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Mail could not be sent: " + e.getMessage());
        }
    }
}`
            ]
        },
        {
            content: `<h3>Steps 7 to 9 - Run, call, and check the mailbox</h3>
Start the application, then send the request from Postman.<br><br>

<div class="border">
<strong>Request</strong> &nbsp; Method: <code>GET</code><br>
URL: <code>http://localhost:8083/sendmailapp?email=velocityjavapune@gmail.com</code><br>
Params: key <code>email</code>, value <code>velocityjavapune@gmail.com</code><br><br>
<strong>Response</strong> &nbsp; <code>200 OK</code> &nbsp; <code>Your mail has been sent successfully</code>
</div><br>

The mail arrives in the recipient's inbox with the subject and body set in the service. The first time it is often filed as spam, because a message sent from a personal Gmail account through SMTP has no DKIM alignment with any sending domain.<br>`,
            codeExamples: [
                `// OUTPUT: console on startup
//  :: Spring Boot ::                (v2.7.14)
//
// Tomcat initialized with port(s): 8083 (http)
// Started MailApplication in 2.146 seconds (JVM running for 2.61)
//
// OUTPUT: with mail debug on (spring.mail.properties.mail.debug=true)
// DEBUG SMTP: connected to host "smtp.gmail.com", port: 587
// DEBUG SMTP: Attempt to authenticate using mechanisms: PLAIN LOGIN
// DEBUG SMTP: AUTH LOGIN succeeded
// 250 2.0.0 OK  1699887421 x12-20020a17090a...smtp.gmail.com

// OUTPUT: when the password is the account password, not an App Password
// org.springframework.mail.authentication.MailAuthenticationException:
//   Authentication failed;
//   nested exception is jakarta.mail.AuthenticationFailedException:
//   535-5.7.8 Username and Password not accepted.`
            ]
        },
        {
            content: `<h3>Steps 10 to 21 - Getting a Google App Password</h3>
Gmail stopped accepting account passwords over SMTP in May 2022. An <strong>App Password</strong> is a 16-character credential tied to one application; it can be revoked on its own without changing your real password, and it does not grant access to the account's web session.<br><br>

<div class="border">
Go to <code>https://myaccount.google.com/apppasswords</code><br>
2-Step Verification must be <strong>ON</strong> - App Passwords do not exist without it<br>
Pick an app and a device name, then <code>Generate</code><br>
Copy the 16-character value and <code>Done</code> - it is shown once and never again<br>
Put it in <code>spring.mail.password</code>, ideally via an environment variable
</div><br>

<strong>Correction to the source material.</strong> Steps 16 to 19 of the PDF instruct you to turn 2-Step Verification back off and then paste the App Password into the Google account's password-change form. Do neither. Turning off 2FA <em>revokes every App Password immediately</em>, and pasting it as your account password replaces the credential you actually use to sign in. Leave 2FA on and leave the account password alone; the App Password is used only in <code>application.properties</code>.<br>`,
            codeExamples: [
                `# Keep the credential OUT of the repository.
# Committed SMTP credentials are found by automated scanners within minutes
# and the account is then used to send spam until the provider suspends it.

# application.properties - reads from the environment, with no default:
spring.mail.password=\${MAIL_APP_PASSWORD}

# Supply it at run time:
#   Linux/macOS :  export MAIL_APP_PASSWORD='abcd efgh ijkl mnop'
#   Windows     :  set MAIL_APP_PASSWORD=abcd efgh ijkl mnop
#   IDE         :  Run Configuration -> Environment tab
#   Container   :  a Kubernetes Secret mounted as an env var

# OUTPUT if the variable is missing:
// Could not resolve placeholder 'MAIL_APP_PASSWORD' in value "\${MAIL_APP_PASSWORD}"
// - which is the correct behaviour. The application refuses to start rather
//   than silently trying to authenticate with an empty password.`
            ]
        },
        {
            content: `<h3>Email validation</h3>
Sending to a malformed address means a wasted SMTP round trip and an exception. Bean Validation rejects it before the service is reached.<br><br>

<table>
<tr><th>Step</th><th>What it does</th></tr>
<tr><td>Add <code>spring-boot-starter-validation</code></td><td>Puts Hibernate Validator on the classpath.</td></tr>
<tr><td><code>@Validated</code> on the class</td><td>Needed for constraints on <strong>method parameters</strong>; <code>@Valid</code> alone only covers request bodies.</td></tr>
<tr><td><code>@Email</code> on the parameter</td><td>Checks the address is syntactically valid.</td></tr>
</table><br>

<strong>What <code>@Email</code> does not do:</strong> it checks syntax only. It cannot tell you the mailbox exists, that the domain has an MX record, or that the address is not a typo like <code>gmial.com</code>. For that you need a verification email with a one-time link - which is why almost every real signup flow has one.<br>`,
            codeExamples: [
                `// UserController.java with validation
package com.velocity.controller;

import javax.validation.constraints.Email;   // Boot 2.x
// Boot 3.x: import jakarta.validation.constraints.Email;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated                      // required for parameter-level constraints
public class UserController {

    private final MailService mailService;

    public UserController(MailService mailService) {
        this.mailService = mailService;
    }

    @GetMapping("/mailSend")
    public String mailSend(@Email @RequestParam("email") String email) {
        User user = new User();
        user.setEmailAddress(email);
        mailService.sendMail(user);
        return "Your mail has been sent successfully...";
    }
}

// OUTPUT: GET /mailSend?email=not-an-address
// 500 Internal Server Error
// javax.validation.ConstraintViolationException:
//   mailSend.email: must be a well-formed email address
//
// A ConstraintViolationException from @Validated is NOT translated to 400
// automatically. Add an @ExceptionHandler to turn it into a proper 400:
//
// @ExceptionHandler(ConstraintViolationException.class)
// @ResponseStatus(HttpStatus.BAD_REQUEST)
// public String onInvalid(ConstraintViolationException e) {
//     return e.getMessage();
// }`
            ]
        },
        {
            content: `<h3>Email with an attachment</h3>
<code>SimpleMailMessage</code> cannot carry a file. An attachment needs a <strong>MimeMessage</strong>, and <strong>MimeMessageHelper</strong> is the wrapper that saves you from building MIME parts by hand.<br><br>

The second constructor argument is the important one: <code>new MimeMessageHelper(mimeMessage, true)</code> switches the message to <strong>multipart</strong> mode. Without that <code>true</code>, <code>addAttachment</code> throws <code>IllegalStateException: Not in multipart mode</code>.<br><br>

<strong>Correction to the source material.</strong> The PDF's catch block is empty apart from a <code>// Handle exception</code> comment. A silently swallowed <code>MessagingException</code> means the caller gets "Email with attachment sent successfully!" for a mail that never left the process. Rethrow it wrapped, or return a failure status.<br>`,
            codeExamples: [
                `// MailService.java - attachment support
import java.io.File;
import javax.mail.MessagingException;      // Boot 2.x  (jakarta.mail in Boot 3.x)
import javax.mail.internet.MimeMessage;

import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.MimeMessageHelper;

public void sendEmailWithAttachment(String to, String subject,
                                    String body, String filePath) {

    MimeMessage mimeMessage = javaMailSender.createMimeMessage();
    try {
        // true  -> multipart. Omit it and addAttachment() throws
        //          IllegalStateException: Not in multipart mode
        // UTF-8 -> otherwise non-ASCII subjects arrive as mojibake
        MimeMessageHelper helper =
                new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);        // true -> body is HTML

        FileSystemResource file = new FileSystemResource(new File(filePath));
        if (!file.exists()) {
            throw new IllegalArgumentException("No such file: " + filePath);
        }
        helper.addAttachment(file.getFilename(), file);

        javaMailSender.send(mimeMessage);

    } catch (MessagingException e) {
        // The PDF leaves this block empty - the caller is then told the mail
        // was sent when nothing happened at all.
        throw new MailSendException("Could not build the message", e);
    }
}`,
                `// EmailRequest.java - the request DTO
package com.velocity.model;

public class EmailRequest {

    private String to;
    private String subject;
    private String body;
    private String attachmentFilePath;

    // getters and setters
}

// Controller
@PostMapping("/send-email-with-attachment")
public String sendEmailWithAttachment(@RequestBody EmailRequest request) {
    mailService.sendEmailWithAttachment(
            request.getTo(), request.getSubject(),
            request.getBody(), request.getAttachmentFilePath());
    return "Email with attachment sent successfully!";
}

// Postman request - POST http://localhost:8083/send-email-with-attachment
// Body -> raw -> JSON:
// {
//   "to": "student@example.com",
//   "subject": "Your invoice",
//   "body": "<h3>Invoice attached</h3><p>Please find it below.</p>",
//   "attachmentFilePath": "C:\\\\reports\\\\invoice-2043.pdf"
// }
//
// OUTPUT: 200 OK
// Email with attachment sent successfully!`
            ]
        },
        {
            content: `<h3>Application flow</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
 Postman
    |  GET /sendmailapp?email=...
    v
 UserController.sendingMail()
    |  builds a User with the address
    v
 MailService.sendMail(user)
    |  SimpleMailMessage: from / to / subject / text
    v
 JavaMailSender.send(message)          <- the auto-configured bean
    |
    |  opens a socket to smtp.gmail.com:587
    |  EHLO -> STARTTLS -> TLS handshake
    |  AUTH LOGIN  (username + App Password)
    |  MAIL FROM / RCPT TO / DATA
    |  250 2.0.0 OK   &lt;- accepted for delivery
    v
 Gmail queues and delivers it
    |
    v
 Controller returns 200 "Your mail has been sent successfully"
</pre>
Note what "250 OK" actually means: Gmail has <em>accepted</em> the message, not delivered it. A later bounce - unknown mailbox, full inbox, spam rejection at the receiving end - arrives asynchronously and your code never sees it.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>JavaMailSender, MimeMessage and MimeMessageHelper</h3>
Three types with distinct roles, and interviewers reliably ask you to separate them.<br><br>

<table>
<tr><th>Type</th><th>Responsibility</th></tr>
<tr><td><strong>MailSender</strong></td><td>The narrow interface. Sends <code>SimpleMailMessage</code> only - no HTML, no attachments, no encoding control.</td></tr>
<tr><td><strong>JavaMailSender</strong></td><td>Extends it with <code>createMimeMessage()</code> and <code>send(MimeMessage)</code>. This is what the starter auto-configures, as a <code>JavaMailSenderImpl</code>.</td></tr>
<tr><td><strong>MimeMessage</strong></td><td>The Jakarta Mail message itself. Assembling multipart bodies on it directly is verbose and easy to get wrong.</td></tr>
<tr><td><strong>MimeMessageHelper</strong></td><td>A thin builder over <code>MimeMessage</code>: <code>setTo</code>, <code>setText(body, isHtml)</code>, <code>addAttachment</code>, <code>addInline</code>, encoding.</td></tr>
<tr><td><strong>MimeMessagePreparator</strong></td><td>A callback form - <code>sender.send(mimeMessage -&gt; {...})</code> - that lets Spring own creation and exception translation.</td></tr>
</table><br>

<strong>addAttachment vs addInline.</strong> <code>addAttachment</code> produces a downloadable file. <code>addInline</code> registers a <code>Content-ID</code> so the HTML body can reference it with <code>&lt;img src="cid:logo"&gt;</code>. Order matters: call <code>setText</code> <em>before</em> <code>addInline</code>, or the inline part is not linked and the image renders broken.<br>`,
            codeExamples: [
                `// An HTML mail with an inline logo and a PDF attachment.
public void sendRichMail(String to) throws MessagingException {

    MimeMessage mime = javaMailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

    helper.setFrom(fromAddress, "JavaSchoolLab");
    helper.setTo(to);
    helper.setSubject("Your certificate");

    // setText MUST come before addInline, otherwise the cid: reference
    // resolves to nothing and the image shows as a broken placeholder.
    helper.setText("<html><body>"
                 + "<img src='cid:brandLogo' width='120'/>"
                 + "<h3>Congratulations</h3>"
                 + "<p>Your certificate is attached.</p>"
                 + "</body></html>", true);

    helper.addInline("brandLogo", new ClassPathResource("static/logo.png"));
    helper.addAttachment("certificate.pdf",
            new ClassPathResource("certs/certificate.pdf"));

    javaMailSender.send(mime);
}

// OUTPUT: the resulting message structure
// Content-Type: multipart/mixed
//   +-- multipart/related
//   |     +-- text/html; charset=UTF-8
//   |     +-- image/png;  Content-ID: <brandLogo>
//   +-- application/pdf;  Content-Disposition: attachment; filename=certificate.pdf`,
                `// MimeMessagePreparator - Spring builds and translates exceptions for you.
public void sendViaPreparator(String to) {
    javaMailSender.send(mimeMessage -> {
        MimeMessageHelper helper =
                new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject("Preparator style");
        helper.setText("<b>No try/catch needed</b>", true);
    });
    // Any MessagingException thrown inside is wrapped by Spring in a
    // MailPreparationException - an unchecked MailException - so the
    // failure surfaces instead of being lost in an empty catch block.
}`
            ]
        },
        {
            content: `<h3>Plain text, HTML and multipart/alternative</h3>
An HTML-only mail is a mistake in production. Text-only clients, screen readers and some spam filters see an empty body, and a body that is HTML with no plain-text alternative measurably raises the spam score.<br><br>

The correct shape is <strong>multipart/alternative</strong>: the same content twice, plain first and HTML second. Clients render the last part they understand.<br><br>

<table>
<tr><th>Form</th><th>When to use</th></tr>
<tr><td><code>SimpleMailMessage</code></td><td>Internal alerts, cron output, anything a human will not look at closely.</td></tr>
<tr><td><code>setText(html, true)</code></td><td>Quick HTML mail. Acceptable internally, weak for customer mail.</td></tr>
<tr><td><code>setText(plain, html)</code></td><td>The production choice. One call, produces multipart/alternative.</td></tr>
</table>`,
            codeExamples: [
                `MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
helper.setTo(to);
helper.setSubject("Password reset");

// Two arguments: plain-text first, HTML second.
// Spring builds multipart/alternative and orders the parts correctly.
helper.setText(
    "Reset your password: https://app.example.com/reset?t=" + token,
    "<p>Reset your password: "
        + "<a href='https://app.example.com/reset?t=" + token + "'>click here</a></p>");

javaMailSender.send(mime);

// OUTPUT: message structure
// Content-Type: multipart/alternative
//   +-- text/plain; charset=UTF-8
//   +-- text/html;  charset=UTF-8
//
// A single-argument setText(html, true) instead yields text/html only.
// Some gateways add up to a full point of spam score for that.`
            ]
        },
        {
            content: `<h3>Why an App Password or OAuth2 - and never a committed credential</h3>
Basic authentication over SMTP hands the server your account password in plain text inside a TLS tunnel. Whoever holds that string holds the whole account. Google closed this off in May 2022 by removing the "less secure apps" toggle.<br><br>

<table>
<tr><th>Credential</th><th>Risk profile</th></tr>
<tr><td>Account password</td><td>Rejected by Gmail since 2022. Would grant full account access if it worked.</td></tr>
<tr><td><strong>App Password</strong></td><td>16 characters, SMTP/IMAP only, revocable individually. Requires 2FA to exist. Still a long-lived static secret.</td></tr>
<tr><td><strong>OAuth2 / XOAUTH2</strong></td><td>Short-lived access token from a refresh token, scoped to <code>gmail.send</code>. Revocable server-side, no password anywhere. The correct choice for a real service.</td></tr>
<tr><td>Transactional API (SES, SendGrid, Postmark)</td><td>An API key rather than SMTP, plus bounce and complaint webhooks, DKIM signing and deliverability reporting.</td></tr>
</table><br>

<strong>Never commit SMTP credentials.</strong> Git history is permanent: deleting the line in a later commit does not remove it, and a repository that is public even briefly is scraped within minutes. A stolen sending credential is used for phishing, which gets the domain blacklisted long before anyone notices. Keep secrets in environment variables, Spring Cloud Config with encryption, Vault, or the platform's secret manager - and if one leaks, rotate it, because you cannot un-publish it.<br><br>

<strong>Why Gmail SMTP is not a production mail channel.</strong> Free Gmail caps you at roughly 500 recipients a day and will lock the account for bursts. It also rewrites the <code>From</code> header to the authenticated account, so your carefully set sender address is discarded, and it gives you no bounce feed. Any real system uses a transactional provider with SPF, DKIM and DMARC aligned to its own domain.<br>`,
            codeExamples: [
                `// OAuth2 (XOAUTH2) instead of a static password.
// The "password" becomes a short-lived access token obtained from a refresh token.
@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender(OAuth2TokenProvider tokens) {

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("smtp.gmail.com");
        sender.setPort(587);
        sender.setUsername("service@yourdomain.com");
        sender.setPassword(tokens.currentAccessToken());   // refreshed, not static

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.auth.mechanisms", "XOAUTH2");
        return sender;
    }
}

// OUTPUT: when the access token has expired
// jakarta.mail.AuthenticationFailedException:
//   535-5.7.8 Username and Password not accepted
// - identical to a wrong password, which is why token refresh must be
//   automatic and a failed send must be retryable.`,
                `// Detecting a leaked credential in your own history:
//   git log -p -- src/main/resources/application.properties | grep -i "mail.password"
//
// If it ever appears with a real value, the ONLY fix is to revoke that
// App Password in the Google account and issue a new one. Rewriting history
// with git filter-repo does not help - the value has already been fetched
// by every clone and by the scanners.`
            ]
        },
        {
            content: `<h3>Sending asynchronously - do not block the HTTP thread</h3>
An SMTP round trip takes 300 ms on a good day and 30 seconds when the provider is degraded. Sending inline means a Tomcat request thread is held for that entire time. With the default pool of 200 threads, a slow mail server takes the whole application down while the database sits idle.<br><br>

<strong>@Async</strong> moves the send onto a separate executor and returns the HTTP response immediately.<br><br>

<div class="border">
<strong>@Async only works through a proxy.</strong> Calling an <code>@Async</code> method from another method of the same class runs it on the caller's thread - the invocation never leaves the object, so the proxy is bypassed. Put the async method on a different bean.<br>
<strong>Never rely on the default executor.</strong> Without an explicit <code>TaskExecutor</code> bean, Boot 2.1+ supplies a <code>ThreadPoolTaskExecutor</code> with an <em>unbounded</em> queue - a mail outage silently grows the queue until the heap is exhausted.<br>
<strong>An @Async void method swallows exceptions.</strong> Return <code>CompletableFuture</code>, or register an <code>AsyncUncaughtExceptionHandler</code>, or the failure is logged nowhere useful.
</div>`,
            codeExamples: [
                `@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Bean(name = "mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(500);          // BOUNDED - this is the point
        executor.setThreadNamePrefix("mail-");
        // When the queue is full, run it on the caller's thread. That applies
        // back-pressure instead of throwing the message away or leaking memory.
        executor.setRejectedExecutionHandler(
                new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        // Without this, an exception from an @Async void method vanishes.
        return (ex, method, params) ->
                log.error("Async mail failed in {} args={}",
                          method.getName(), Arrays.toString(params), ex);
    }
}`,
                `@Service
public class MailService {

    @Async("mailExecutor")
    public CompletableFuture<Void> sendMailAsync(String to, String subject, String body) {
        MimeMessage mime = javaMailSender.createMimeMessage();
        ...
        javaMailSender.send(mime);
        return CompletableFuture.completedFuture(null);
    }
}

// Wrong - self-invocation bypasses the proxy and runs on the caller's thread:
// @Service
// class MailService {
//     public void register() { sendMailAsync(...); }   // NOT async
//     @Async public void sendMailAsync(...) { ... }
// }

// OUTPUT: correct behaviour, with logging on both threads
// [http-nio-8083-exec-1] Registration saved for user 4021 (12 ms)
// [http-nio-8083-exec-1] Response 201 Created returned
// [mail-2]               SMTP handshake to smtp.gmail.com:587
// [mail-2]               Mail queued for student@example.com (868 ms)
//
// The client saw 201 after 12 ms. Sending inline would have made it 880 ms.`
            ]
        },
        {
            content: `<h3>Why a mail failure must not roll back the business transaction</h3>
Consider registration: save the user, then send a welcome mail. If the send happens inside the transaction and SMTP is down, the exception propagates and the <code>INSERT</code> is rolled back. The user filled in the form, got a 500, and has no account - because a notification server was unavailable. That is the wrong trade: the account is the durable business fact and the mail is a courtesy.<br><br>

The inverse failure is just as real. Send inside the transaction and let the transaction roll back afterwards for some other reason, and you have <strong>emailed the user about something that never happened</strong> - "your order is confirmed" for an order that does not exist. Mail cannot be un-sent.<br><br>

<strong>The fix</strong> is to make the send happen strictly <em>after</em> a successful commit, and to isolate its failure. Spring's <code>@TransactionalEventListener(phase = AFTER_COMMIT)</code> does exactly this. For anything that must not be lost, write the message to an outbox table in the same transaction and have a scheduled worker drain it - the <strong>transactional outbox</strong> pattern.<br>`,
            codeExamples: [
                `// Wrong - mail inside the transaction.
@Transactional
public User register(RegistrationForm form) {
    User user = userRepository.save(new User(form));
    mailService.sendWelcome(user.getEmail());   // throws -> INSERT rolled back
    return user;
}
// OUTPUT when SMTP is unreachable:
// MailSendException: Mail server connection failed
// Rolling back JPA transaction on EntityManager [SessionImpl(...)]
// 500 Internal Server Error
// -> the registration is lost because of an unrelated outage.

// Correct - publish an event; the listener runs only after commit.
@Transactional
public User register(RegistrationForm form) {
    User user = userRepository.save(new User(form));
    events.publishEvent(new UserRegistered(user.getId(), user.getEmail()));
    return user;                                 // commit happens here
}

@Component
class WelcomeMailListener {

    @Async("mailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(UserRegistered event) {
        try {
            mailService.sendWelcome(event.email());
        } catch (MailException e) {
            // Log and move on. The account exists; that is what mattered.
            log.error("Welcome mail failed for {}", event.email(), e);
        }
    }
}
// OUTPUT: SMTP down, registration still succeeds
// 201 Created  {"id":4021,"email":"student@example.com"}
// ERROR WelcomeMailListener - Welcome mail failed for student@example.com`,
                `// The transactional outbox - for mail that genuinely must not be lost.
@Transactional
public Order placeOrder(OrderRequest request) {
    Order order = orderRepository.save(new Order(request));
    // Same transaction, same database: either both rows commit or neither does.
    outboxRepository.save(new OutboxMessage(
            "ORDER_CONFIRMATION", order.getCustomerEmail(), toJson(order)));
    return order;
}

@Scheduled(fixedDelay = 10_000)
@Transactional
public void drainOutbox() {
    // SKIP LOCKED lets several instances drain in parallel without collisions.
    for (OutboxMessage m : outboxRepository.lockNextBatch(50)) {
        try {
            mailService.send(m);
            m.markSent();
        } catch (MailException e) {
            m.recordFailure(e.getMessage());     // retried on the next tick
        }
    }
}
// Guarantee: at-least-once. Duplicate sends are possible if the process dies
// between send() and commit, so make the message idempotent (include an id)
// rather than pretending exactly-once is achievable over SMTP.`
            ]
        },
        {
            content: `<h3>Retries, timeouts and knowing what is worth retrying</h3>
SMTP failures split cleanly along the protocol's own reply codes, and retrying the wrong class of error wastes work and damages your sender reputation.<br><br>

<table>
<tr><th>Failure</th><th>Retry?</th></tr>
<tr><td><code>4xx</code> - temporary (<code>421</code> too many connections, <code>451</code> try again)</td><td>Yes, with exponential backoff and jitter.</td></tr>
<tr><td>Connection refused / read timeout</td><td>Yes - the server may simply be restarting.</td></tr>
<tr><td><code>5xx</code> - permanent (<code>550</code> no such mailbox, <code>553</code> bad address)</td><td>No. Retrying a bad address forever looks like an attack to the receiving server.</td></tr>
<tr><td><code>535</code> authentication failed</td><td>No - the credential is wrong or revoked. Alert a human.</td></tr>
</table><br>

<strong>Timeouts are not optional.</strong> Jakarta Mail defaults to no timeout at all. A dead SMTP server holds the socket - and the thread - indefinitely. Always set <code>mail.smtp.connectiontimeout</code>, <code>mail.smtp.timeout</code> and <code>mail.smtp.writetimeout</code>.<br><br>

Beyond retries, a <strong>circuit breaker</strong> stops you hammering a provider that is clearly down: after N consecutive failures the breaker opens, sends fail fast into the outbox, and a probe request tests recovery.<br>`,
            codeExamples: [
                `// Spring Retry - declarative backoff.
// pom.xml: spring-retry  +  spring-boot-starter-aop, then @EnableRetry.

@Retryable(
    retryFor  = { MailSendException.class },       // Spring Retry 2.x
    noRetryFor = { MailAuthenticationException.class,
                   MailParseException.class },     // never retry these
    maxAttempts = 4,
    backoff = @Backoff(delay = 1000, multiplier = 3, maxDelay = 30_000,
                       random = true))             // jitter: avoids a retry storm
public void sendWithRetry(MimeMessage message) {
    javaMailSender.send(message);
}

@Recover
public void giveUp(MailSendException e, MimeMessage message) {
    // Called after the last attempt fails. Park it, alert, or dead-letter it.
    deadLetterRepository.save(DeadLetter.from(message, e));
    log.error("Mail permanently failed after 4 attempts", e);
}

// OUTPUT: a transient outage
// attempt 1  t=0ms      MailSendException: Connection timed out
// attempt 2  t=1.1s     MailSendException: Connection timed out
// attempt 3  t=3.4s     250 2.0.0 OK   <- recovered
//
// Note retryFor/noRetryFor replace the deprecated value/include/exclude
// attributes used in Spring Retry 1.x examples.`,
                `# Timeouts - without these a hung server holds the thread for ever.
spring.mail.properties.mail.smtp.connectiontimeout=5000   # TCP connect
spring.mail.properties.mail.smtp.timeout=5000             # socket read
spring.mail.properties.mail.smtp.writetimeout=5000        # socket write

# JavaMailSenderImpl.testConnection() at startup fails fast on bad config
# rather than at 3 a.m. when the first mail is sent:
#
# @EventListener(ApplicationReadyEvent.class)
# public void verifySmtp() {
#     try {
#         ((JavaMailSenderImpl) javaMailSender).testConnection();
#         log.info("SMTP reachable");
#     } catch (MessagingException e) {
#         log.error("SMTP misconfigured - mail will not work", e);
#     }
# }`
            ]
        },
        {
            content: `<h3>Templating the body with Thymeleaf</h3>
String-concatenated HTML in a service class is unmaintainable and unsafe. A name containing <code>&lt;script&gt;</code> is injected straight into the body; a designer cannot touch the layout without a redeploy; and translations are impossible.<br><br>

<strong>Thymeleaf</strong> renders a template to a string, which then becomes the mail body. Two details matter for mail specifically:<br><br>

<div class="border">
Use <code>TemplateEngine.process(name, context)</code> - <strong>not</strong> a Spring MVC view resolver. There is no HTTP response to write to.<br>
Thymeleaf escapes by default with <code>th:text</code>, so user-supplied values cannot inject markup. <code>th:utext</code> disables that - use it only on content you generated.<br>
Email clients ignore most CSS. Inline styles and table layout are still the norm; Outlook renders with the Word engine.<br>
Every link must be absolute. There is no base URL in an inbox, so <code>/reset</code> resolves to nothing.
</div>`,
            codeExamples: [
                `// src/main/resources/templates/mail/welcome.html
<html xmlns:th="http://www.thymeleaf.org">
<body style="font-family:Arial,sans-serif;">
    <h2 th:text="'Welcome, ' + \${userName} + '!'">Welcome</h2>
    <p>Your enrolment for
       <b th:text="\${courseName}">Course</b> is confirmed.</p>
    <p>
      <a th:href="\${activationUrl}"
         style="background:#2563eb;color:#fff;padding:10px 18px;
                text-decoration:none;border-radius:4px;">Activate</a>
    </p>
    <p th:text="\${#dates.format(startDate, 'dd MMM yyyy')}">date</p>
</body>
</html>`,
                `@Service
public class TemplatedMailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;   // NOT a view resolver

    public void sendWelcome(User user, Course course) throws MessagingException {

        Context ctx = new Context(Locale.forLanguageTag(user.getLocale()));
        ctx.setVariable("userName",   user.getName());     // th:text escapes it
        ctx.setVariable("courseName", course.getName());
        ctx.setVariable("startDate",  course.getStartDate());
        ctx.setVariable("activationUrl",
                "https://app.javaschoollab.com/activate?t=" + user.getToken());

        String html  = templateEngine.process("mail/welcome", ctx);
        String plain = templateEngine.process("mail/welcome.txt", ctx);

        MimeMessage mime = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
        helper.setFrom(fromAddress, "JavaSchoolLab");
        helper.setTo(user.getEmail());
        helper.setSubject(messages.getMessage("mail.welcome.subject",
                                              null, ctx.getLocale()));
        helper.setText(plain, html);               // multipart/alternative

        javaMailSender.send(mime);
    }
}

// OUTPUT: a user whose name is  Ana <script>alert(1)</script>
// renders in the body as
//   <h2>Welcome, Ana &lt;script&gt;alert(1)&lt;/script&gt;!</h2>
// - escaped, inert. Switching th:text to th:utext would inject it live.`
            ]
        },
        {
            content: `<h3>Testing mail without sending any</h3>
Hitting a real SMTP server from a test is slow, flaky, rate-limited, and eventually mails a real person. Two approaches cover almost everything.<br><br>

<table>
<tr><th>Approach</th><th>What it verifies</th></tr>
<tr><td><strong>GreenMail</strong> (in-process SMTP)</td><td>End to end: the message really left the sender and can be read back - headers, body, parts, attachments.</td></tr>
<tr><td><code>@MockBean JavaMailSender</code></td><td>That the service called send, and with what. Fast, but proves nothing about MIME correctness.</td></tr>
<tr><td>MailHog / Mailpit in Docker</td><td>Manual and QA use - a fake SMTP server with a web inbox for eyeballing rendering.</td></tr>
</table>`,
            codeExamples: [
                `@SpringBootTest
class MailServiceTest {

    @RegisterExtension
    static GreenMailExtension smtp = new GreenMailExtension(ServerSetupTest.SMTP)
            .withConfiguration(GreenMailConfiguration.aConfig()
                    .withUser("test@localhost", "test", "secret"));

    @DynamicPropertySource
    static void mailProps(DynamicPropertyRegistry registry) {
        registry.add("spring.mail.host", () -> "127.0.0.1");
        registry.add("spring.mail.port", smtp::getSmtpPort);   // random port
    }

    @Autowired MailService mailService;

    @Test
    void sends_a_multipart_mail_with_the_attachment() throws Exception {

        mailService.sendEmailWithAttachment(
                "student@example.com", "Invoice", "<p>Attached</p>",
                "src/test/resources/invoice.pdf");

        assertTrue(smtp.waitForIncomingEmail(5000, 1));

        MimeMessage received = smtp.getReceivedMessages()[0];
        assertEquals("Invoice", received.getSubject());
        assertEquals("student@example.com",
                     received.getAllRecipients()[0].toString());

        MimeMultipart body = (MimeMultipart) received.getContent();
        assertEquals(2, body.getCount());
        assertEquals("invoice.pdf", body.getBodyPart(1).getFileName());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
// Total time: 1.9 s   - no external SMTP server involved.`
            ]
        },
        {
            content: `<h3>Deliverability, and what actually determines whether the mail is read</h3>
The code is the easy part. Whether the message lands in the inbox or in spam is decided by DNS records you publish for the sending domain.<br><br>

<table>
<tr><th>Mechanism</th><th>What it asserts</th></tr>
<tr><td><strong>SPF</strong></td><td>A TXT record listing which servers may send for the domain.</td></tr>
<tr><td><strong>DKIM</strong></td><td>A cryptographic signature over the headers and body, verified against a public key in DNS.</td></tr>
<tr><td><strong>DMARC</strong></td><td>A policy saying what to do when SPF and DKIM fail to align, plus a reporting address.</td></tr>
<tr><td>List-Unsubscribe</td><td>A one-click unsubscribe header. Since 2024 Gmail and Yahoo require it for bulk senders.</td></tr>
<tr><td>Bounce handling</td><td>Repeatedly mailing dead addresses raises your complaint rate and gets you throttled.</td></tr>
</table><br>

<strong>Legal constraints are real.</strong> Marketing mail under GDPR needs a lawful basis and a working unsubscribe; CAN-SPAM requires a physical postal address and honouring opt-outs within ten days. Transactional mail - password resets, receipts - is treated differently, which is precisely why you must not smuggle marketing content into a transactional message.<br><br>

<strong>What to monitor.</strong> Sends attempted, sends failed by exception type, queue depth on the mail executor, outbox age of the oldest unsent row, and provider-reported bounce and complaint rates. A silently growing outbox is the failure mode that goes unnoticed longest.<br>`
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which bean does <code>spring-boot-starter-mail</code> auto-configure, and from what?</td><td>A <code>JavaMailSenderImpl</code> as <code>JavaMailSender</code>, built by <code>MailSenderAutoConfiguration</code> from the <code>spring.mail.*</code> properties. It backs off if you define your own.</td></tr>
<tr><td>When must you use <code>MimeMessage</code> rather than <code>SimpleMailMessage</code>?</td><td>For HTML bodies, attachments, inline images, explicit character encoding, or custom headers. <code>SimpleMailMessage</code> handles plain text only.</td></tr>
<tr><td>What does the boolean in <code>new MimeMessageHelper(msg, true)</code> do?</td><td>Switches the message to multipart mode. Without it <code>addAttachment</code> throws <code>IllegalStateException: Not in multipart mode</code>.</td></tr>
<tr><td>Why can you not use your Gmail account password?</td><td>Google removed "less secure app access" in May 2022. SMTP now requires an App Password (which needs 2FA enabled) or OAuth2 XOAUTH2; the account password returns <code>535-5.7.8</code>.</td></tr>
<tr><td>Why should a mail failure not roll back the business transaction?</td><td>The durable fact - the registration, the order - matters more than the notification. Rolling it back because SMTP is down loses real data. Publish an <code>AFTER_COMMIT</code> event, or use a transactional outbox.</td></tr>
<tr><td>What breaks if you send mail inside the transaction and it later rolls back?</td><td>You have told the user something happened that did not. Mail cannot be recalled, so the send must be strictly after commit.</td></tr>
<tr><td>Why does <code>@Async</code> sometimes do nothing?</td><td>Self-invocation. Calling the annotated method from another method of the same bean bypasses the proxy, so it runs on the caller's thread. Move it to a separate bean, and ensure <code>@EnableAsync</code> is present.</td></tr>
<tr><td>What is wrong with the default async executor for mail?</td><td>Its queue is unbounded, so a mail outage grows the queue until the heap is exhausted. Define a <code>ThreadPoolTaskExecutor</code> with a fixed <code>queueCapacity</code> and a rejection policy.</td></tr>
<tr><td>Which SMTP failures are worth retrying?</td><td>4xx temporary codes and connection or read timeouts, with exponential backoff and jitter. Never retry 5xx permanent codes such as 550, or 535 authentication failures.</td></tr>
<tr><td>Why set <code>mail.smtp.timeout</code>?</td><td>Jakarta Mail has no default timeout. A hung SMTP server holds the socket and the thread indefinitely, which exhausts the Tomcat pool and takes down endpoints unrelated to mail.</td></tr>
<tr><td>How do you render the body with Thymeleaf?</td><td>Inject <code>TemplateEngine</code> and call <code>process(templateName, context)</code> to get a String, then pass it to <code>helper.setText(plain, html)</code>. Do not go through a Spring MVC view resolver.</td></tr>
<tr><td>Why send both plain text and HTML?</td><td>It produces <code>multipart/alternative</code>. Text-only clients and screen readers get readable content, and HTML with no plain alternative raises the spam score.</td></tr>
<tr><td>How do you test mail without a real server?</td><td>GreenMail as an in-process SMTP server, with <code>@DynamicPropertySource</code> pointing <code>spring.mail.port</code> at its random port, then assert on the received <code>MimeMessage</code>. A <code>@MockBean JavaMailSender</code> only proves the call was made.</td></tr>
<tr><td>What stops the mail landing in the inbox even when the code is correct?</td><td>Missing SPF, DKIM and DMARC records for the sending domain, HTML-only bodies, no List-Unsubscribe header on bulk mail, and a poor sender reputation from unhandled bounces.</td></tr>
</table>`
        }
    ]
};
