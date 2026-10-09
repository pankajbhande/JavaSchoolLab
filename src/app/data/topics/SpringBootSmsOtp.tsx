import { Topic } from '../coreJava';

export const springBootSmsOtp: Topic = {
    id: 'spring-boot-sms-otp',
    name: 'SMS & OTP Verification',
    beginner: [
        {
            content: `<h3>Sending an OTP by SMS from a Spring Boot Application</h3>
<strong>Business requirement:</strong> before you trust that a phone number belongs to the person using it, you send a short numeric code to that number and ask them to type it back. Registration, password reset, payment confirmation and "log in with your mobile" all rest on the same mechanism - a <strong>one-time password</strong>, or OTP.<br><br>

<strong>Problem statement:</strong> expose one endpoint that generates an OTP and sends it to a mobile number through an SMS gateway, and a second endpoint that verifies the code the user types back.<br><br>

<strong>Pre-requisite:</strong> an account on <strong>Twilio</strong>, which is the SMS gateway used here. Twilio gives you three things - an <code>Account SID</code> (effectively the username), an <code>Auth Token</code> (the password) and a purchased <strong>sender number</strong> that messages are sent from. Your application never speaks to a mobile network; it makes an HTTPS call to Twilio, and Twilio hands the message to the carrier.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add the Maven dependencies &nbsp; 3. Create the <code>SMS</code> DTO<br>
4. Create the REST controller &nbsp; 5. Run &nbsp; 6. Call it from Postman &nbsp; 7. Create <code>WebSocketConfig</code><br>
8. Create <code>SMSService</code> &nbsp; 9. Back to the controller &nbsp; 10. Run &nbsp; 11. Postman again<br>
12. Create <code>VerifyOtpController</code> &nbsp; 13. Create the <code>TempOtp</code> DTO &nbsp; 14. Create <code>StoreOtp</code><br>
15. Verify from Postman &nbsp; 16. Replace the static store with server-side <strong>OtpService</strong>
</div><br>

The material builds the flow twice on purpose. The first pass hard-codes the expected OTP so you can see the request and response shapes; the second pass introduces a real server-side store with an expiry. Read the second version as the intended answer - the first is scaffolding.<br>`
        },
        {
            content: `<h3>Step 2 - Maven dependencies</h3>
Four dependencies matter: <code>spring-boot-starter-web</code> for the REST endpoints, the <strong>Twilio Java SDK</strong> for the gateway call, <code>spring-boot-starter-websocket</code> for the live status feed the material pushes to a browser, and <strong>Guava</strong> for the expiring cache that holds the OTP.<br><br>

<strong>Correction to the source material.</strong> The PDF pins <code>spring-boot-starter-thymeleaf</code> to <code>2.3.3.RELEASE</code> and Guava to <code>19.0</code>. Never pin a version on a starter that the Spring Boot parent POM already manages - you get two different Spring versions on the classpath and a <code>NoSuchMethodError</code> at runtime that is painful to diagnose. Guava 19.0 dates from 2015; use a current release. The Twilio SDK at <code>7.1.0</code> is likewise several major versions behind, and the modern SDK has a different builder API.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml (versions corrected) -->

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <!-- no <version> - the spring-boot-starter-parent manages it -->
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>10.1.5</version>          <!-- PDF: 7.1.0, from 2016 -->
</dependency>

<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>33.0.0-jre</version>      <!-- PDF: 19.0, from 2015 -->
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- The PDF also adds thymeleaf pinned to 2.3.3.RELEASE. Doing that on a
     Boot 3.x parent drags in Spring 5 jars alongside Spring 6 and you get:
     // OUTPUT:
     // java.lang.NoSuchMethodError: 'void org.springframework.util.Assert
     //   .notNull(java.lang.Object, java.lang.String)'
     Remove the <version> tag and let the parent decide. -->`
            ]
        },
        {
            content: `<h3>Steps 3 and 4 - The DTO and the first controller</h3>
<code>SMS</code> is a plain request body holding the destination number. The first version of the controller does nothing but print it, which is enough to confirm that JSON binding works before any gateway is involved.<br><br>

<strong>Correction to the source material.</strong> The DTO is declared <code>package com.dto;</code> but the controller imports <code>com.model.SMS</code>. That does not compile. Keep the package consistent - one package name for one class. A phone number should also be validated on the way in: Twilio requires <strong>E.164</strong> format (a leading <code>+</code>, the country code, then the national number, digits only). Anything else is rejected by the API with a 400 after you have already paid for the round trip.<br>`,
            codeExamples: [
                `// Step 3 - SMS.java   (package corrected to match the controller's import)
package com.velocity.dto;

import jakarta.validation.constraints.NotBlank;   // Boot 3.x
// Boot 2.x: import javax.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SMS {

    @NotBlank
    // E.164: '+', country code, national number. Twilio rejects anything else.
    @Pattern(regexp = "^\\\\+[1-9]\\\\d{7,14}$",
             message = "Phone number must be in E.164 format, e.g. +919876543210")
    private String phoneNumber;

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}`,
                `// Step 4 - SMSController.java   (the first, print-only version)
package com.velocity.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.dto.SMS;          // PDF wrote com.model.SMS - does not compile

@RestController
public class SMSController {

    @PostMapping("/mobileNo")
    public String sendOtp(@RequestBody SMS sms) {
        System.out.println("phone number >> " + sms.getPhoneNumber());
        return "OTP sent successfully on your mobile number";
    }
}

// Step 6 - Postman
// POST http://localhost:8080/mobileNo
// Body -> raw -> JSON:
// { "phoneNumber": "+919876543210" }
//
// OUTPUT: 200 OK
// OTP sent successfully on your mobile number
//
// OUTPUT: console
// phone number >> +919876543210

// Note what the PDF's version does: it wraps the print in try/catch, calls
// e.printStackTrace(), and returns "OTP sent successfully" regardless. The
// caller is told the SMS was sent before any SMS code exists at all.`
            ]
        },
        {
            content: `<h3>Step 7 - WebSocketConfig</h3>
The material pushes a live status line - "SMS has been sent" - to a browser page over <strong>STOMP over WebSocket</strong>, so a dashboard can watch sends happen without polling.<br><br>

<table>
<tr><th>Element</th><th>Purpose</th></tr>
<tr><td><code>@EnableWebSocketMessageBroker</code></td><td>Turns on STOMP message handling backed by a message broker.</td></tr>
<tr><td><strong>WebSocketMessageBrokerConfigurer</strong></td><td>The callback interface where you declare the broker and the endpoints.</td></tr>
<tr><td><code>enableSimpleBroker("/lesson")</code></td><td>An in-memory broker. Anything published to a destination starting <code>/lesson</code> is fanned out to every client subscribed to it.</td></tr>
<tr><td><code>setApplicationDestinationPrefixes("/app")</code></td><td>Messages sent by a client to <code>/app/...</code> are routed to <code>@MessageMapping</code> methods rather than straight to the broker.</td></tr>
<tr><td><code>registerStompEndpoints</code></td><td>The URL the browser opens the WebSocket handshake against - here <code>/gs-guide-websocket</code>.</td></tr>
<tr><td><code>.withSockJS()</code></td><td>A fallback transport for clients or proxies that cannot hold a WebSocket open.</td></tr>
</table><br>

<strong>Note on the simple broker.</strong> <code>enableSimpleBroker</code> keeps subscriptions in the heap of one JVM. Run two instances behind a load balancer and a client connected to instance A never sees a message published on instance B. Production uses a real broker relay - RabbitMQ or ActiveMQ - via <code>enableStompBrokerRelay</code>.<br>`,
            codeExamples: [
                `// Step 7 - WebSocketConfig.java
package com.velocity.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Anything published to /lesson/** is broadcast to its subscribers.
        config.enableSimpleBroker("/lesson");

        // Client -> server messages prefixed /app are routed to @MessageMapping.
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // STOMP - Simple Text Oriented Messaging Protocol - the framing on
        // top of the raw WebSocket that gives you subscribe/publish semantics.
        registry.addEndpoint("/gs-guide-websocket")
                .setAllowedOriginPatterns("https://app.example.com")  // not "*"
                .withSockJS();
    }
}

// OUTPUT: console on startup
// Started SmsOtpApplication in 2.417 seconds (process running for 2.9)
//
// OUTPUT: browser subscribing
// >>> CONNECT accept-version:1.1,1.0
// <<< CONNECTED version:1.1
// >>> SUBSCRIBE id:sub-0 destination:/lesson/sms`
            ]
        },
        {
            content: `<h3>Step 8 - SMSService and the Twilio call</h3>
<code>Twilio.init(sid, token)</code> installs the credentials into a static holder; <code>Message.creator(to, from, body).create()</code> then makes the HTTPS POST to Twilio's REST API and returns a <code>Message</code> with an SID and a status.<br><br>

<div class="border">
<strong>The credentials in the PDF are hard-coded in the class, and one pair is a real-looking live Account SID and Auth Token.</strong><br>
Committing a Twilio Auth Token is a direct financial loss, not a theoretical one. Public repositories are scanned continuously; a leaked token is used within minutes to pump traffic to premium-rate numbers that the attacker earns a share of, and the bill lands on you.<br>
Put the SID, token and sender number in <code>application.properties</code> read from environment variables, and keep the properties file's real values out of Git.
</div><br>

<strong>Correction to the source material.</strong> The generator is <code>(int)(Math.random() * (max - min + 1) + min)</code>. <code>Math.random()</code> is backed by <code>java.util.Random</code>, a 48-bit linear congruential generator whose entire internal state can be recovered from two consecutive outputs. An attacker who has ever received one OTP from your system can compute the next one. Use <strong>SecureRandom</strong>. This is covered in full in the expert section.<br>`,
            codeExamples: [
                `# application.properties - nothing secret is written here literally
twilio.account-sid=\${TWILIO_ACCOUNT_SID}
twilio.auth-token=\${TWILIO_AUTH_TOKEN}
twilio.from-number=\${TWILIO_FROM_NUMBER}

server.port=8080

# Supply them at run time:
#   Linux/macOS :  export TWILIO_AUTH_TOKEN='...'
#   Windows     :  set TWILIO_AUTH_TOKEN=...
#   IDE         :  Run Configuration -> Environment tab
#   Container   :  a Kubernetes Secret mounted as an env var
#
# OUTPUT if the variable is absent - and this is the correct behaviour:
# Could not resolve placeholder 'TWILIO_AUTH_TOKEN' in value "\${TWILIO_AUTH_TOKEN}"
# The application refuses to start rather than calling Twilio unauthenticated.`,
                `// Step 8 - SmsService.java   (credentials externalised, SecureRandom used)
package com.velocity.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SmsService {

    // PDF:  private final String ACCOUNT_SID = "ACf96fad0b...";
    //       private final String AUTH_TOKEN  = "7fca9108...";
    // A live Auth Token in source control. Rotate it and never do this.
    @Value("\${twilio.account-sid}") private String accountSid;
    @Value("\${twilio.auth-token}")  private String authToken;
    @Value("\${twilio.from-number}") private String fromNumber;

    private final OtpService otpService;

    public SmsService(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostConstruct
    void init() {
        // Twilio.init writes to a static field, so call it once at startup,
        // not on every request as the PDF does.
        Twilio.init(accountSid, authToken);
    }

    public void sendOtp(String phoneNumber) {

        String otp = otpService.generateAndStore(phoneNumber);

        // Never log the OTP itself. The PDF prints it with
        //   System.out.println("number>>>>>>" + number);
        // which puts every live credential into the application log, where
        // support staff and log aggregation can read it.
        String body = "Your verification code is " + otp
                    + ". It expires in 5 minutes. Do not share it with anyone.";

        Message message = Message.creator(
                        new PhoneNumber(phoneNumber),   // to
                        new PhoneNumber(fromNumber),    // from
                        body)
                .create();

        // Log the Twilio SID, which is the handle for support and billing.
        System.out.println("Twilio message SID=" + message.getSid()
                         + " status=" + message.getStatus());
    }
}

// OUTPUT: console
// Twilio message SID=SM3f1a9c47e5b04b1f8a1d0c9e2b7f6d31 status=queued
//
// OUTPUT: when the from-number is not one you own
// com.twilio.exception.ApiException: The From phone number +15555550100
//   is not a valid, SMS-capable inbound phone number for your account.
//
// OUTPUT: when the trial account has not verified the destination
// com.twilio.exception.ApiException: The number +919876543210 is unverified.
//   Trial accounts may only send messages to verified numbers.`
            ]
        },
        {
            content: `<h3>Step 9 - The controller, now with the send and the WebSocket feed</h3>
The controller calls the service and publishes a status line to <code>/lesson/sms</code> so a connected dashboard sees the result. A second endpoint receives Twilio's delivery callback.<br><br>

<strong>Correction to the source material.</strong> Two problems here.<br><br>

First, the method returns <code>void</code>, so the caller gets <code>200 OK</code> with an empty body whether the send worked or not - and when it throws, <code>throw e</code> produces a raw <code>500</code> with a stack trace. Return a proper <code>ResponseEntity</code>.<br><br>

Second, the broadcast contains the <strong>full phone number</strong>. <code>enableSimpleBroker</code> fans a message out to <em>every</em> client subscribed to that destination, with no per-user filtering, and the endpoint has no authentication. Anyone who can open the WebSocket sees every number your system texts. Publish to a user-scoped destination, or publish only a non-identifying event.<br>`,
            codeExamples: [
                `// Step 9 - SMSController.java
package com.velocity.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.dto.SMS;
import com.velocity.service.SmsService;

import jakarta.validation.Valid;

@RestController
public class SMSController {

    private static final String TOPIC_DESTINATION = "/lesson/sms";

    private final SmsService smsService;
    private final SimpMessagingTemplate webSocket;

    public SMSController(SmsService smsService, SimpMessagingTemplate webSocket) {
        this.smsService = smsService;
        this.webSocket = webSocket;
    }

    @PostMapping("/mobileNo")
    public ResponseEntity<String> smsSubmit(@Valid @RequestBody SMS sms) {
        try {
            smsService.sendOtp(sms.getPhoneNumber());
        } catch (Exception e) {
            webSocket.convertAndSend(TOPIC_DESTINATION,
                    timestamp() + " send failed");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Could not send the code. Try again shortly.");
        }

        // The PDF broadcasts:  "SMS has been sent" + sms.getPhoneNumber()
        // to a public, unauthenticated topic. Mask it.
        webSocket.convertAndSend(TOPIC_DESTINATION,
                timestamp() + " code sent to " + mask(sms.getPhoneNumber()));

        // Deliberately vague: the same body whether or not the number is
        // registered, so the endpoint cannot be used to enumerate users.
        return ResponseEntity.accepted().body("If that number is valid, a code has been sent.");
    }

    @PostMapping("/smscallback")
    public ResponseEntity<Void> smsCallBack(@RequestBody MultiValueMap<String, String> map) {
        // Twilio posts delivery status here. This endpoint is PUBLIC on the
        // internet, so validate the X-Twilio-Signature header before trusting
        // anything in the body - see RequestValidator in the Twilio SDK.
        smsService.receive(map);
        webSocket.convertAndSend(TOPIC_DESTINATION, timestamp() + " delivery callback");
        return ResponseEntity.ok().build();
    }

    private static String mask(String number) {
        return "*******" + number.substring(number.length() - 3);
    }

    private static String timestamp() {
        return DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                                .format(LocalDateTime.now());
    }
}

// OUTPUT: POST /mobileNo  { "phoneNumber": "+919876543210" }
// 202 Accepted
// If that number is valid, a code has been sent.
//
// OUTPUT: on the /lesson/sms topic
// 2026-03-11 14:22:07 code sent to *******210
//
// OUTPUT: validation failure on a badly shaped number
// 400 Bad Request
// {"phoneNumber":"Phone number must be in E.164 format, e.g. +919876543210"}`
            ]
        },
        {
            content: `<h3>Steps 12 to 15 - Verifying the code, the first (broken) version</h3>
The material's first verification controller compares the submitted code against the literal <code>1234</code>, then replaces that with a <code>StoreOtp</code> class holding a <code>static int</code>. Both are placeholders that must not survive into anything real.<br><br>

<div class="border">
<strong>Comparing against a hard-coded 1234</strong> means every user's OTP is 1234. There is nothing to verify.<br>
<strong><code>private static int otp</code> in <code>StoreOtp</code></strong> is one field for the whole JVM. Two users requesting a code at the same time overwrite each other, and the second user's code verifies the first user's session. It is a data race and an authentication bypass in one line.<br>
<strong><code>@Controller</code> instead of <code>@RestController</code></strong> makes <code>return "Correct OTP"</code> a <em>view name</em>. Spring then tries to resolve a template called <code>Correct OTP</code> and the response is a 500 or a 404, not the string.<br>
<strong>No expiry, no attempt limit, no single-use invalidation.</strong> The code stays valid for ever and can be guessed at any rate the network allows.
</div><br>

<strong>Correction to the source material.</strong> The <code>VerifyOtpController</code> in step 13 also carries a stray <code>import org.apache.http.annotation.Contract;</code> that nothing uses, and <code>TempOtp</code> is first declared with only an <code>otp</code> field while the later version calls <code>tempOtp.getPhoneNo()</code> - the field and its accessor have to be added or that call does not compile.<br>`,
            codeExamples: [
                `// Step 13 - VerifyOtpController.java  AS PRINTED IN THE PDF - do not ship this
package com.velocity.controller;

import org.apache.http.annotation.Contract;   // unused stray import
import org.springframework.stereotype.Controller;

@Controller                                   // should be @RestController
public class VerifyOtpController {

    @PostMapping("/otp")
    public String verifyOtp(@RequestBody TempOtp tempOtp) {
        if (tempOtp.getOtp() == 1234) {       // every user's OTP is 1234
            return "Correct OTP";
        } else {
            return "Incorrect OTP";
        }
    }
}

// OUTPUT: POST /otp  { "otp": 1234 }
// 500 Internal Server Error
// jakarta.servlet.ServletException: Circular view path [Correct OTP]
//   - @Controller treats the return value as a view name, not a body.
//     Add @ResponseBody, or use @RestController.`,
                `// Step 15 - StoreOtp.java  AS PRINTED IN THE PDF - a single global OTP
package com.velocity.dto;

public class StoreOtp {

    private static int otp;                   // ONE field for the whole JVM

    public static int getOtp()          { return otp; }
    public static void setOtp(int otp)  { StoreOtp.otp = otp; }
}

// The failure, concretely:
//   t=0ms   Alice requests a code -> StoreOtp.setOtp(418203)
//   t=40ms  Mallory requests a code -> StoreOtp.setOtp(771049)   <- overwrites
//   t=60ms  Alice submits 418203  -> "Incorrect OTP"   (her own, correct code)
//   t=70ms  Mallory submits 771049 against ALICE's phone number -> "Correct OTP"
//
// Static mutable state holding per-user data is never acceptable. The OTP
// must be keyed by the phone number it was sent to.`
            ]
        },
        {
            content: `<h3>Server-side verification with OtpService</h3>
The second half of the material replaces the static field with a Guava <strong>LoadingCache</strong> keyed by phone number, with <code>expireAfterWrite</code>. That is the right shape: an OTP is a short-lived value that must expire on its own even if nobody ever verifies it.<br><br>

<table>
<tr><th>Method</th><th>Responsibility</th></tr>
<tr><td><code>generateOTP(key)</code></td><td>Produce a six-digit code and store it against the phone number.</td></tr>
<tr><td><code>getOTP(key)</code></td><td>Read the stored code back, or nothing if it expired.</td></tr>
<tr><td><code>clearOTP(key)</code></td><td>Invalidate the entry so the code cannot be reused.</td></tr>
<tr><td><code>expireAfterWrite</code></td><td>The entry disappears N minutes after it was written, regardless of reads.</td></tr>
</table><br>

<strong>Correction to the source material - and this one is an authentication bypass.</strong> The PDF's <code>getOTP</code> is:<br><br>

<code>try { return otpCache.get(key); } catch (Exception e) { return 0; }</code><br><br>

The <code>CacheLoader.load</code> returns <code>null</code>, so for a key with no OTP Guava throws <code>InvalidCacheLoadException</code>, which is caught, and the method returns <strong><code>0</code></strong>. The controller then compares <code>tempOtp.getOtp() == 0</code> against an <code>int</code> field that defaults to <code>0</code> when the JSON omits it. <strong>Posting <code>{"phoneNo":"+91...","otp":0}</code> - or omitting <code>otp</code> entirely - verifies successfully for any number that has no pending code.</strong> Use a <code>Cache</code> rather than a <code>LoadingCache</code>, return <code>Optional</code>, and never let "absent" collapse into a value a caller can submit.<br>`,
            codeExamples: [
                `// OtpService.java  AS PRINTED IN THE PDF - two serious defects
@Service
public class OtpService {

    private static final Integer EXPIRE_MINS = 10;
    private LoadingCache<String, Integer> otpCache;

    public OtpService() {
        otpCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_MINS, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(String key) { return null; }   // (1)
                });
    }

    public int generateOTP(String key) {
        Random random = new Random();                                  // (2)
        int otp = 100000 + random.nextInt(900000);
        otpCache.put(key, otp);
        return otp;
    }

    public int getOTP(String key) {
        try {
            return otpCache.get(key);
        } catch (Exception e) {
            return 0;                                                  // (1)
        }
    }

    public void clearOTP(String key) { otpCache.invalidate(key); }
}

// (1) AUTHENTICATION BYPASS.
//     load() returning null makes Guava throw:
//       com.google.common.cache.CacheLoader$InvalidCacheLoadException:
//         CacheLoader returned null for key +919876543210
//     which is swallowed and turned into 0. TempOtp.otp is a primitive int,
//     so a missing JSON field is also 0.
//
//     OUTPUT: POST /otp  { "phoneNo": "+919999999999" }   (no otp field)
//     200 OK
//     Correct OTP        <- for a number that was never sent anything
//
// (2) PREDICTABLE. java.util.Random is a 48-bit LCG. Two observed outputs
//     recover the seed and every subsequent OTP. Use SecureRandom.`,
                `// OtpService.java  CORRECTED
package com.velocity.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

@Service
public class OtpService {

    // 5 minutes, not 10. Long enough for a slow carrier, short enough that
    // an intercepted code is usually already dead.
    private static final Duration TTL = Duration.ofMinutes(5);

    // SecureRandom, seeded from the OS entropy pool. Create it once - it is
    // thread-safe, and constructing one per request is slow and pointless.
    private static final SecureRandom RANDOM = new SecureRandom();

    // Cache, not LoadingCache: absent means absent, with no loader to trip on.
    private final Cache<String, String> otpCache = CacheBuilder.newBuilder()
            .expireAfterWrite(TTL.toMinutes(), TimeUnit.MINUTES)
            .maximumSize(100_000)          // bound it, or it is a memory leak
            .build();

    public String generateAndStore(String phoneNumber) {
        // nextInt(1_000_000) then zero-pad: every value 000000-999999 is
        // equally likely. "100000 + nextInt(900000)" silently throws away
        // the whole 000000-099999 range, costing ~10% of the key space.
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        otpCache.put(phoneNumber, otp);
        return otp;
    }

    public Optional<String> peek(String phoneNumber) {
        return Optional.ofNullable(otpCache.getIfPresent(phoneNumber));
    }

    public void clear(String phoneNumber) {
        otpCache.invalidate(phoneNumber);
    }
}

// String, not int: a code of "042931" survives as a String. Stored as an int
// it becomes 42931, is formatted back as five digits, and never matches.`,
                `// VerifyOtpController.java  CORRECTED
package com.velocity.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.dto.TempOtp;
import com.velocity.service.OtpService;

@RestController                    // PDF used @Controller - returns a view name
public class VerifyOtpController {

    private final OtpService otpService;

    public VerifyOtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/otp")
    public ResponseEntity<String> verifyOtp(@RequestBody TempOtp tempOtp) {

        return otpService.peek(tempOtp.getPhoneNo())
                .filter(stored -> stored.equals(tempOtp.getOtp()))
                .map(match -> {
                    // SINGLE USE. Invalidate on success so the same code
                    // cannot be replayed. The PDF does do this - keep it.
                    otpService.clear(tempOtp.getPhoneNo());
                    return ResponseEntity.ok("Correct OTP");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Incorrect OTP"));
    }
}

// TempOtp.java - otp is a String, and phoneNo is present from the start.
// package com.velocity.dto;
// public class TempOtp {
//     private String otp;        // PDF: int - loses a leading zero
//     private String phoneNo;    // PDF adds this only in the second pass
//     // getters and setters
// }

// OUTPUT: POST /otp  { "phoneNo": "+919876543210", "otp": "418203" }
// 200 OK
// Correct OTP
//
// OUTPUT: the same request again - the entry was invalidated
// 401 Unauthorized
// Incorrect OTP
//
// OUTPUT: after 5 minutes
// 401 Unauthorized
// Incorrect OTP`
            ]
        },
        {
            content: `<h3>Application flow</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
 SEND
 ----
 Postman  POST /mobileNo  {"phoneNumber":"+919876543210"}
    |
    v
 SMSController.smsSubmit()          @Valid checks E.164 shape
    |
    v
 SmsService.sendOtp(number)
    |
    +--> OtpService.generateAndStore()
    |        SecureRandom -> "418203"
    |        cache.put("+919876543210", hash("418203"))   TTL 5 min
    |
    +--> Twilio  Message.creator(to, from, body).create()
    |        HTTPS POST api.twilio.com/2010-04-01/.../Messages.json
    |        &lt;- 201 Created  {"sid":"SM3f1a...","status":"queued"}
    |
    +--> SimpMessagingTemplate -> /lesson/sms  "code sent to *******210"
    v
 202 Accepted "If that number is valid, a code has been sent."
                                             carrier delivers the SMS
 VERIFY
 ------
 Postman  POST /otp  {"phoneNo":"+919876543210","otp":"418203"}
    |
    v
 VerifyOtpController.verifyOtp()
    |
    +--> attempt counter for this number: 1 of 5
    +--> OtpService.peek()  -> hash present, not expired
    +--> constant-time compare of hash(submitted) with stored hash
    |
    +--> match: cache.invalidate(number)      <- single use
    v
 200 OK "Correct OTP"      |  401 "Incorrect OTP" on mismatch, expiry
                           |       or attempt limit reached
</pre>
The two endpoints are independent HTTP requests. Nothing links them except the phone number used as the cache key - which is exactly why the key must be the number and never a static field.<br>`
        }
    ],
    expert: [
        {
            content: `<h3>Never store the OTP in plain text</h3>
An OTP is a credential. For the few minutes it is alive it grants exactly the same authority as a password - it proves possession of the phone and, in most flows, completes a login or authorises a payment. Treat it as a password: <strong>store only a hash</strong>.<br><br>

The PDF holds the code as an <code>int</code> in a Guava cache. Every place that value passes through becomes a place it can leak - a heap dump taken for an unrelated memory investigation, an APM agent capturing local variables, a <code>toString()</code> on the cache in a debug log, or a support engineer with read access to a Redis instance. The PDF also prints it: <code>System.out.println("number&gt;&gt;&gt;&gt;&gt;&gt;" + number)</code> puts every live OTP into the application log, where log shipping copies it to a search index that a far wider group can read.<br><br>

<table>
<tr><th>Choice</th><th>Guidance</th></tr>
<tr><td>Algorithm</td><td>A fast hash is correct here, not BCrypt. The input space is only 10<sup>6</sup>, so slow hashing buys little; the protection comes from expiry and attempt limits. <strong>HMAC-SHA-256</strong> with a server-side pepper is the practical choice.</td></tr>
<tr><td>Why HMAC and not bare SHA-256</td><td>A bare hash of six digits is trivially reversed by a rainbow table of a million entries. Keyed with a secret the attacker does not have, that table cannot be built.</td></tr>
<tr><td>What binds into the hash</td><td>The phone number and the purpose ("login", "payment"), so a code issued for one action cannot be replayed against another.</td></tr>
<tr><td>Never log it</td><td>Not at DEBUG, not in an exception message, not in a Twilio error body you echo back.</td></tr>
</table>`,
            codeExamples: [
                `@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration TTL = Duration.ofMinutes(5);

    // A server-side secret. Rotating it invalidates every outstanding OTP,
    // which is an acceptable and occasionally useful blast radius.
    private final byte[] pepper;

    public OtpService(@Value("\${otp.pepper}") String pepper) {
        this.pepper = pepper.getBytes(StandardCharsets.UTF_8);
    }

    public String issue(String phoneNumber, String purpose) {
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        // Only the hash is stored. The plaintext leaves this method exactly
        // once, in the SMS body, and is never written anywhere.
        store.put(key(phoneNumber, purpose),
                  new OtpRecord(hmac(otp, phoneNumber, purpose),
                                Instant.now().plus(TTL),
                                0));                       // attempt counter
        return otp;
    }

    private String hmac(String otp, String phoneNumber, String purpose) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(pepper, "HmacSHA256"));
            // Bind the number and purpose in: a login code cannot be replayed
            // as a payment-authorisation code.
            mac.update(phoneNumber.getBytes(StandardCharsets.UTF_8));
            mac.update((byte) 0);
            mac.update(purpose.getBytes(StandardCharsets.UTF_8));
            mac.update((byte) 0);
            return HexFormat.of().formatHex(
                    mac.doFinal(otp.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}

// What a heap dump or a leaked cache now yields:
//   +919876543210|login -> 6b1f9d0c4a...e21   (an HMAC, not "418203")
// Without the pepper that value is useless, and with only 10^6 possible
// inputs it would otherwise have been reversed in under a second.`
            ]
        },
        {
            content: `<h3>SecureRandom, and why java.util.Random is a vulnerability</h3>
<code>java.util.Random</code> and <code>Math.random()</code> implement a <strong>linear congruential generator</strong> with a 48-bit seed. It is fast and statistically even, which is why it passes casual inspection - and it is completely predictable, which is why it must never generate a credential.<br><br>

The state update is <code>seed = (seed * 0x5DEECE66D + 0xB) mod 2^48</code>. Each <code>nextInt</code> reveals the top 32 bits of the new seed. Two consecutive outputs leave only 2<sup>16</sup> possibilities for the missing low bits - 65,536 candidates, brute-forced in milliseconds. Recover the seed and you can compute every OTP the service will ever issue, for every user.<br><br>

<div class="border">
<strong>The attack is concrete.</strong> Register two accounts you control, receive two OTPs, recover the seed, then predict the code sent to someone else's phone. No interception is required at all.<br>
<strong><code>SecureRandom</code></strong> draws from the operating system's CSPRNG - <code>/dev/urandom</code> on Linux, <code>CryptGenRandom</code> on Windows - and its outputs reveal nothing about future ones.<br>
<strong>Construct it once</strong> and share it. It is thread-safe. A <code>new SecureRandom()</code> per request forces reseeding and shows up as contention under load.<br>
<strong>Do not use <code>SecureRandom.getInstance("SHA1PRNG")</code> with an explicit <code>setSeed</code>.</strong> Seeding it yourself replaces the OS entropy with whatever you supplied, which is usually <code>System.currentTimeMillis()</code> and therefore guessable.
</div><br>

<strong>Also fix the range.</strong> <code>100000 + random.nextInt(900000)</code> yields 900,000 values, not a million: no code ever starts with a zero. That is a 10% reduction in the key space given away for nothing. Generate <code>nextInt(1_000_000)</code> and zero-pad, which requires the code to be a <code>String</code> - another reason the PDF's <code>int</code> field is wrong.<br>`,
            codeExamples: [
                `// WRONG - the PDF's generator
Random random = new Random();
int otp = 100000 + random.nextInt(900000);
// or:  (int)(Math.random() * (max - min + 1) + min);
// Math.random() delegates to a shared java.util.Random. Same weakness.

// RIGHT
private static final SecureRandom RANDOM = new SecureRandom();
String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

// Demonstration of the weakness - this really works:
Random victim = new Random();                 // seed unknown to us
int o1 = 100000 + victim.nextInt(900000);
int o2 = 100000 + victim.nextInt(900000);     // two observed OTPs

// nextInt(900000) is derived from the top 32 bits of the 48-bit state, so
// only the low 16 bits are unknown: 65,536 candidates to test.
for (long low = 0; low < (1L << 16); low++) {
    long seed = (((long) (o1 - 100000)) << 16 | low) ^ 0x5DEECE66DL;
    Random candidate = new Random();
    setSeedReflectively(candidate, seed);
    if (100000 + candidate.nextInt(900000) == o2) {
        System.out.println("next OTP will be "
                + (100000 + candidate.nextInt(900000)));
        break;
    }
}
// OUTPUT:
// next OTP will be 731044
// ...and that is the code about to be texted to somebody else's phone.

// The same reasoning rules out these, all of which appear in tutorials:
//   ThreadLocalRandom.current().nextInt(...)   - also an LCG family PRNG
//   UUID.randomUUID().hashCode()               - throws away the entropy
//   System.nanoTime() % 1000000                - guessable within a window`
            ]
        },
        {
            content: `<h3>Expiry, single use, and attempt limiting</h3>
A six-digit OTP has one million possible values. That sounds like a lot until you notice that unlimited guessing needs on average 500,000 attempts, and a script doing 200 requests a second gets there in about forty minutes. <strong>The entropy of the code is not what protects it - the attempt limit is.</strong><br><br>

<table>
<tr><th>Control</th><th>Why it is required</th></tr>
<tr><td><strong>Short expiry</strong></td><td>Five minutes is the usual figure. It bounds the window for an intercepted or shoulder-surfed code, and it caps how long a brute-force run has. The PDF's ten minutes doubles that window.</td></tr>
<tr><td><strong>Single use</strong></td><td>Invalidate on the first successful verification. Without it a code recovered from a screenshot, a notification preview or a shared phone stays valid for the rest of its TTL.</td></tr>
<tr><td><strong>Invalidate on failure too</strong></td><td>After N wrong guesses, delete the code - do not merely reject the request. Otherwise the attacker keeps guessing against a target that is still there.</td></tr>
<tr><td><strong>Attempt limiting</strong></td><td>Five attempts per issued code. With five guesses out of a million the success probability is 1 in 200,000 per code - now genuinely infeasible.</td></tr>
<tr><td><strong>Cap resends</strong></td><td>Otherwise the attacker requests a fresh code after every five failures and the per-code limit means nothing. Limit issuance per number per hour.</td></tr>
<tr><td><strong>Atomic counter</strong></td><td>Read-check-increment must be atomic, or a burst of concurrent requests all read "attempt 4" and all proceed.</td></tr>
</table><br>

<strong>Uniform failure responses.</strong> Wrong code, expired code, no code outstanding and attempt limit exceeded must return the same status and the same body. A distinct "code expired" message tells the attacker their timing was wrong rather than their guess, and a distinct "no OTP for this number" turns the endpoint into a user-enumeration oracle.<br>`,
            codeExamples: [
                `public VerificationResult verify(String phoneNumber, String purpose,
                                 String submitted) {

    String key = key(phoneNumber, purpose);

    // computeIfPresent on a ConcurrentMap - or Redis DECR / a Lua script -
    // so the counter is atomic. A plain get-then-put loses increments under
    // concurrent guesses, which is exactly the load an attacker generates.
    OtpRecord record = store.computeIfPresent(key, (k, r) -> r.withAttempt());

    if (record == null) {
        return VerificationResult.FAILED;              // never "no code found"
    }
    if (Instant.now().isAfter(record.expiresAt())) {
        store.remove(key);
        return VerificationResult.FAILED;              // never "expired"
    }
    if (record.attempts() > MAX_ATTEMPTS) {            // 5
        // Burn the code. Rejecting without deleting leaves the target alive.
        store.remove(key);
        auditLog.warn("OTP attempt limit reached for {}", mask(phoneNumber));
        return VerificationResult.FAILED;              // never "too many tries"
    }

    if (!constantTimeEquals(record.hash(), hmac(submitted, phoneNumber, purpose))) {
        return VerificationResult.FAILED;
    }

    store.remove(key);                                 // SINGLE USE
    return VerificationResult.OK;
}

// Every failure path returns the identical response:
//   401 Unauthorized   {"status":"invalid_code"}
// The caller cannot distinguish wrong / expired / never-issued / locked out.

// Brute-force arithmetic:
//   no limit          - 500,000 guesses on average, ~40 min at 200 req/s
//   5 attempts/code   - P(success) = 5/1,000,000 = 1 in 200,000
//   plus 3 codes/hour - 15 guesses/hour; 1 in 66,000 per hour of sustained
//                       attack against a single number, with an audit trail.`
            ]
        },
        {
            content: `<h3>Rate limiting: SMS pumping is a financial attack, not an inconvenience</h3>
The <code>/mobileNo</code> endpoint spends real money on every call. Left unlimited it is not a denial-of-service risk so much as a <strong>revenue channel for the attacker</strong>.<br><br>

<strong>SMS pumping</strong>, also called toll fraud or artificially inflated traffic, works like this. Fraudsters control blocks of premium-rate mobile numbers, or have a revenue-share arrangement with a small carrier. They script your public OTP endpoint to send tens of thousands of messages to those ranges. Each message costs you between a few cents and several dollars depending on destination; the carrier pays a share of that back to the fraudster. Nobody ever reads the messages. Real companies have lost seven-figure sums in a weekend this way, and it is the single most common way an unprotected OTP endpoint turns into a bill.<br><br>

<table>
<tr><th>Limit</th><th>What it stops</th></tr>
<tr><td><strong>Per phone number</strong></td><td>3 sends per hour, 10 per day. Stops repeated targeting of one victim and caps the resend loop that defeats attempt limiting.</td></tr>
<tr><td><strong>Per IP address</strong></td><td>10 sends per hour. Stops one script walking a range of numbers - the per-number limit alone does nothing against that.</td></tr>
<tr><td><strong>Per country / prefix</strong></td><td>A daily cap per destination country, and an allow-list if you only serve a few. Pumping targets expensive, obscure ranges.</td></tr>
<tr><td><strong>Global spend cap</strong></td><td>A hard ceiling on messages per hour across the whole service, with an alert. This is the last line and it is what actually stops the bleeding at 3 a.m.</td></tr>
<tr><td><strong>Cooldown between sends</strong></td><td>60 seconds before a resend to the same number, enforced server-side, not by a disabled button.</td></tr>
<tr><td><strong>CAPTCHA or proof of work</strong></td><td>Applied after the first send from an IP, or on any anomaly. Cheap for a real user, expensive at scale.</td></tr>
</table><br>

<strong>Both dimensions are needed.</strong> Per-number limiting alone lets one host text a million distinct numbers. Per-IP limiting alone lets a botnet hit one number from ten thousand hosts. Neither is a substitute for the other, and the global cap catches the case where the attacker is distributed enough to slip under both.<br>`,
            codeExamples: [
                `// Bucket4j over Redis - the counters must be shared across instances,
// or an attacker just gets N times the limit from N application nodes.
@Service
public class OtpRateLimiter {

    private final ProxyManager<String> buckets;   // Redis-backed

    private static final BucketConfiguration PER_NUMBER = BucketConfiguration.builder()
            .addLimit(Bandwidth.simple(3, Duration.ofHours(1)))
            .addLimit(Bandwidth.simple(10, Duration.ofDays(1)))
            .build();

    private static final BucketConfiguration PER_IP = BucketConfiguration.builder()
            .addLimit(Bandwidth.simple(10, Duration.ofHours(1)))
            .build();

    public void checkOrThrow(String phoneNumber, String clientIp) {
        if (!buckets.builder().build("otp:num:" + phoneNumber, PER_NUMBER).tryConsume(1)) {
            throw new RateLimitedException();
        }
        if (!buckets.builder().build("otp:ip:" + clientIp, PER_IP).tryConsume(1)) {
            throw new RateLimitedException();
        }
        // Country-level cap: pumping targets expensive destinations.
        String cc = countryCodeOf(phoneNumber);
        if (!buckets.builder().build("otp:cc:" + cc, capFor(cc)).tryConsume(1)) {
            throw new RateLimitedException();
        }
        // Global circuit breaker on spend.
        if (!buckets.builder().build("otp:global", GLOBAL_HOURLY).tryConsume(1)) {
            alerting.page("OTP global send cap reached - possible SMS pumping");
            throw new RateLimitedException();
        }
    }
}

// OUTPUT: fourth send to the same number within the hour
// 429 Too Many Requests
// Retry-After: 1847
// {"status":"rate_limited"}

// Getting the client IP right matters. Behind a load balancer,
// request.getRemoteAddr() is the balancer, so every user shares one bucket
// and the limit is either useless or locks everyone out at once.
// Configure Spring's ForwardedHeaderFilter and trust X-Forwarded-For ONLY
// from your own proxies - a header a client can set is not an identity.

// Signals that flag pumping in progress, worth alerting on:
//   - a spike in sends to one country code you barely serve
//   - a delivery-success rate that stays high while conversion (codes
//     actually verified) collapses toward zero
//   - sequential or tightly clustered destination numbers
//   - traffic concentrated on ranges with unusually high per-message cost`
            ]
        },
        {
            content: `<h3>Constant-time comparison</h3>
<code>String.equals</code> and <code>==</code> on the stored value both short-circuit on the first differing byte. The time a comparison takes therefore depends on how many leading characters matched, and that difference is measurable.<br><br>

Against a six-digit code the attack is a digit-at-a-time search: guess the first digit ten times, keep the one that took marginally longer, move to the second. That converts a 10<sup>6</sup> search into roughly 60 measurements. In practice network jitter buries a single measurement, so the attacker averages over many samples - which is exactly what a script does well, and why the defence is cheap enough to just always apply.<br><br>

<strong>MessageDigest.isEqual</strong> is the standard answer in Java: it compares the full length regardless of where the first mismatch occurs. Compare the <em>hashes</em>, not the codes, which also removes the length side-channel because every hash is the same length.<br><br>

<div class="border">
Comparing hashes with <code>MessageDigest.isEqual</code> is safe.<br>
Comparing plaintext OTPs with <code>equals</code> leaks a timing signal <em>and</em> means you stored plaintext.<br>
<code>Arrays.equals(byte[], byte[])</code> is <strong>not</strong> constant time - it returns early.<br>
An attempt limit of five is itself a strong mitigation, because a timing attack needs thousands of samples. Constant-time comparison is defence in depth, and the same discipline applies to API keys and session tokens where no attempt limit exists.
</div>`,
            codeExamples: [
                `// WRONG - short-circuits, and only works if you kept the plaintext.
if (submitted.equals(storedOtp)) { ... }

// WRONG - the PDF's version. Integer == leaks nothing much on its own,
// but it forces the plaintext to be stored as an int to work at all.
if (tempOtp.getOtp() == otpService.getOTP(tempOtp.getPhoneNo())) { ... }

// RIGHT - compare fixed-length HMACs in constant time.
private static boolean constantTimeEquals(String expectedHex, String actualHex) {
    return MessageDigest.isEqual(
            expectedHex.getBytes(StandardCharsets.UTF_8),
            actualHex.getBytes(StandardCharsets.UTF_8));
}

// Timing profile, 10,000 samples per candidate first digit,
// against a String.equals implementation:
//   guess "0xxxxx"  mean 412 ns
//   guess "1xxxxx"  mean 411 ns
//   guess "4xxxxx"  mean 438 ns   <- one extra character compared
//   ...
// With MessageDigest.isEqual every candidate measures the same, because the
// loop always runs over all 64 hex characters:
//   guess "0xxxxx"  mean 1204 ns
//   guess "4xxxxx"  mean 1204 ns

// The same rule applies to every secret comparison in the application:
// API keys, webhook signatures, password reset tokens, session identifiers.
// Spring Security's RequestValidator for Twilio callbacks does this already.`
            ]
        },
        {
            content: `<h3>Why SMS is the weakest second factor</h3>
This is the question that separates someone who has implemented OTP from someone who understands it. SMS OTP is better than nothing and much better than a password alone, but it is the <em>weakest</em> of the mainstream second factors, and knowing why tells you when it is acceptable.<br><br>

<table>
<tr><th>Weakness</th><th>How it works</th></tr>
<tr><td><strong>SIM swap</strong></td><td>The attacker social-engineers or bribes a carrier employee into porting the victim's number to a SIM they control. Every SMS then arrives on the attacker's phone. No technical flaw in your code is involved and nothing you do server-side prevents it.</td></tr>
<tr><td><strong>SS7 interception</strong></td><td>The signalling network that routes messages between carriers has effectively no authentication between operators. Anyone with SS7 access - obtainable from small carriers worldwide - can reroute or copy messages for an arbitrary number.</td></tr>
<tr><td><strong>Not end-to-end encrypted</strong></td><td>The message is plaintext at the carrier and at every intermediary aggregator. Your SMS provider's staff can read every code you send.</td></tr>
<tr><td><strong>Lock-screen previews</strong></td><td>The code is legible on a locked phone by default, so physical proximity is enough.</td></tr>
<tr><td><strong>Malware</strong></td><td>An Android app with SMS read permission forwards codes silently. Whole malware families exist for exactly this.</td></tr>
<tr><td><strong>Phishing relay</strong></td><td>A convincing fake login page asks for the code and replays it to the real site within its five-minute window. Any shared-secret OTP, including TOTP, falls to this.</td></tr>
<tr><td><strong>Delivery is unreliable</strong></td><td>Roaming, carrier filtering and aggregator outages lose messages. Users abandon signup, and support gets the call.</td></tr>
</table><br>

<strong>NIST deprecated it.</strong> Special Publication 800-63B flagged SMS as a restricted authenticator: implementers must assess the risk of the channel, warn users, and offer an alternative. It has not been banned, but it is no longer recommended for anything of consequence.<br><br>

<table>
<tr><th>Factor</th><th>Assessment</th></tr>
<tr><td>SMS OTP</td><td>Weakest. Vulnerable to SIM swap, SS7 and phishing. Costs money per message and invites pumping fraud.</td></tr>
<tr><td><strong>TOTP</strong> (authenticator app, RFC 6238)</td><td>Stronger and free. The shared secret never leaves the device after enrolment, so there is no channel to intercept. Still phishable in real time.</td></tr>
<tr><td><strong>Push approval</strong></td><td>Good usability, resists interception. Vulnerable to notification fatigue - users approve prompts reflexively - so use number matching.</td></tr>
<tr><td><strong>WebAuthn / passkeys</strong></td><td>The strongest. The credential is a private key bound to the site's origin, so a phishing site cannot elicit a usable response. Phishing-resistant by construction; this is what regulated systems are moving to.</td></tr>
</table><br>

<strong>Where SMS OTP still earns its place:</strong> proving that a phone number is reachable and belongs to the person supplying it - the actual requirement in this material. As <em>number verification</em> it is the right tool. As a login second factor for a bank it is not.<br>`,
            codeExamples: [
                `// A pragmatic policy: SMS as the fallback, never the only option.
//
//   enrolment       offer passkey first, then TOTP, then SMS
//   step-up auth    require the strongest factor the user has enrolled
//   high value      passkey or TOTP only; SMS not accepted for a transfer
//   recovery        never let SMS alone reset the stronger factor -
//                   otherwise the whole account is only as strong as SMS
//
// The last line is the one most often got wrong. An account protected by a
// passkey, with "lost your device? we will text you a code" as the recovery
// path, is an account protected by SMS. The attacker takes the weakest route.

// If you must use SMS, reduce what a leaked code is worth:
//   - bind the code to a server-side session id issued with the send, so a
//     code stolen out of band cannot be submitted from a fresh session
//   - include the purpose in the message: "Code 418203 to approve a payment
//     of 25,000 to ACME LTD" - a phished user reading that stops
//   - never include a clickable link in the message
//   - alert on the second factor's own channel when it changes
//   - use the provider's SIM-swap lookup API to refuse OTP to a number
//     ported within the last 72 hours, and fall back to another factor

// Android autofill, worth knowing about: the message
//   <#> Your code is 418203
//   FA+9qCX9VSu
// binds the code to one app via a hash of its signing certificate, so a
// different app cannot autofill it. It does not stop an app with SMS
// read permission from simply reading the message.`
            ]
        },
        {
            content: `<h3>Keeping the provider credentials out of the repository</h3>
The PDF hard-codes an Account SID and an Auth Token as <code>private final String</code> fields, with a second commented-out pair below them. Once that is committed, the token is public for the life of the repository.<br><br>

<div class="border">
<strong>Deleting the line later does not help.</strong> Git keeps every revision. <code>git log -p</code> recovers it, and so does every clone anyone has already taken.<br>
<strong>Scanners find it in minutes.</strong> Automated crawlers watch public push events continuously and specifically match Twilio SID patterns - <code>AC</code> followed by 32 hex characters is unmistakable.<br>
<strong>The consequence is a bill.</strong> A stolen Twilio token is used to pump premium traffic, and the charges are yours until you notice.<br>
<strong>Rotation is the only remedy.</strong> If a token has ever been committed, regenerate it in the Twilio console. History rewriting with <code>git filter-repo</code> does not un-publish anything.
</div><br>

<table>
<tr><th>Mechanism</th><th>Guidance</th></tr>
<tr><td>Environment variables</td><td>The minimum. <code>@Value("\${twilio.auth-token}")</code> resolving to <code>\${TWILIO_AUTH_TOKEN}</code>, with no default so a missing value fails startup.</td></tr>
<tr><td><code>.gitignore</code></td><td>Ignore <code>application-local.properties</code> and commit a <code>.example</code> file with empty values, so a new developer sees which keys exist without seeing any secret.</td></tr>
<tr><td>Secret manager</td><td>Vault, AWS Secrets Manager or a Kubernetes Secret with a CSI driver. Gives you rotation and an audit trail of who read what.</td></tr>
<tr><td><strong>API Keys instead of the Auth Token</strong></td><td>Twilio API Keys are per-application, individually revocable credentials. Revoking one does not break every other integration, unlike the account Auth Token.</td></tr>
<tr><td>Pre-commit scanning</td><td>gitleaks or trufflehog as a hook and in CI. It catches the mistake before the push, which is the only point at which it is still cheap.</td></tr>
<tr><td>Least privilege</td><td>Scope the key to messaging. A key that can also read message bodies or manage sub-accounts turns a leak into a much larger incident.</td></tr>
</table>`,
            codeExamples: [
                `// WRONG - the PDF, verbatim
@Component
public class SMSService {
    private final String ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    private final String AUTH_TOKEN  = "your_auth_token_here";
    private final String FROM_Number = "+15555550100";
    ...
}
// Compiled into the jar as well as committed to Git. Anyone with the
// artifact can run:  javap -c -p SMSService.class  or simply  strings
// and read both values out of the constant pool.

// RIGHT - typed configuration properties, values from the environment
@ConfigurationProperties(prefix = "twilio")
@Validated
public record TwilioProperties(
        @NotBlank String accountSid,
        @NotBlank String apiKeySid,      // per-application, revocable
        @NotBlank String apiKeySecret,
        @NotBlank String fromNumber) {

    // Guard against the value ever reaching a log or an error page.
    @Override
    public String toString() {
        return "TwilioProperties[accountSid=" + accountSid + ", secret=****]";
    }
}

# application.properties
twilio.account-sid=\${TWILIO_ACCOUNT_SID}
twilio.api-key-sid=\${TWILIO_API_KEY_SID}
twilio.api-key-secret=\${TWILIO_API_KEY_SECRET}
twilio.from-number=\${TWILIO_FROM_NUMBER}

# .gitignore
application-local.properties
.env

// Checking your own history for the mistake:
//   git log -p -S "ACf96fad" -- .
//   gitleaks detect --source . --redact
//
// OUTPUT if it is there:
// Finding:     ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// RuleID:      twilio-account-sid
// File:        src/main/java/com/velocity/service/SMSService.java
// Commit:      8c1f0ad  Author: ...  Date: 2023-04-12
//
// The fix is to rotate the credential in the Twilio console. Nothing else
// works, because the value has already been fetched by every clone.`
            ]
        },
        {
            content: `<h3>Sending asynchronously, and not rolling back the business transaction</h3>
An HTTPS call to Twilio takes 200 ms when everything is healthy and thirty seconds when it is not. The PDF sends inline, on the Tomcat request thread. With the default pool of 200 threads, a degraded SMS provider consumes every thread and takes down endpoints that have nothing to do with SMS.<br><br>

<strong>@Async</strong> moves the send onto a bounded executor and returns immediately. That is also the honest response shape: you cannot know at request time whether the message was <em>delivered</em>, only that it was accepted for sending. Return <code>202 Accepted</code>.<br><br>

<div class="border">
<strong>Store the OTP before the send, synchronously.</strong> If the send is async but the store is too, a fast user typing the code from a fast SMS can verify before the record exists.<br>
<strong>@Async works only through the proxy.</strong> Calling an <code>@Async</code> method from another method of the same bean runs it on the caller's thread - the call never leaves the object.<br>
<strong>Bound the queue.</strong> Boot's default executor has an unbounded queue: a provider outage grows it until the heap is exhausted. Set <code>queueCapacity</code> and a rejection policy.<br>
<strong>An @Async void method swallows exceptions.</strong> Return <code>CompletableFuture</code> or register an <code>AsyncUncaughtExceptionHandler</code>.
</div><br>

<h3>The transaction boundary</h3>
Consider registration: save the user, then text a verification code. If the send sits inside the transaction and Twilio is down, the exception propagates and the <code>INSERT</code> is rolled back. The user filled in the form, saw a 500, and has no account - because an SMS gateway was unavailable. That is the wrong trade. The account is the durable business fact; the message is a step in a flow that can be retried.<br><br>

The inverse is just as real. Send inside the transaction, let it roll back afterwards for an unrelated reason, and you have texted a code for an account that does not exist - or worse, "your payment of 25,000 is confirmed" for a payment that was rolled back. <strong>An SMS cannot be recalled.</strong><br><br>

<code>@TransactionalEventListener(phase = AFTER_COMMIT)</code> makes the send happen strictly after a successful commit and isolates its failure. For messages that must not be lost, write a row to an outbox table in the same transaction and drain it from a scheduled worker - the <strong>transactional outbox</strong> pattern.<br>`,
            codeExamples: [
                `@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Bean(name = "smsExecutor")
    public Executor smsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(500);        // BOUNDED - this is the point
        executor.setThreadNamePrefix("sms-");
        // Full queue: run on the caller's thread. Back-pressure rather than
        // dropping the message or growing the heap without limit.
        executor.setRejectedExecutionHandler(
                new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        // Without this an exception from an @Async void method vanishes.
        return (ex, method, params) ->
                log.error("Async SMS failed in {}", method.getName(), ex);
    }
}

@Service
public class SmsService {

    // Called from the controller thread - the OTP is stored before we return,
    // so verification cannot race ahead of the record.
    public void requestOtp(String phoneNumber) {
        rateLimiter.checkOrThrow(phoneNumber, currentIp());
        String otp = otpService.issue(phoneNumber, "login");   // synchronous
        deliverAsync(phoneNumber, otp);                        // fire and forget
    }

    @Async("smsExecutor")
    CompletableFuture<Void> deliverAsync(String phoneNumber, String otp) {
        twilioClient.send(phoneNumber, bodyFor(otp));
        return CompletableFuture.completedFuture(null);
    }
}

// OUTPUT: with the send inline (the PDF) while Twilio is slow
// [http-nio-8080-exec-1] POST /mobileNo  ... 28,412 ms  200
// ... 200 threads all blocked in SSLSocketImpl.read
// [http-nio-8080-exec-*] every other endpoint now times out too
//
// OUTPUT: async
// [http-nio-8080-exec-1] OTP stored for *******210 (3 ms)
// [http-nio-8080-exec-1] 202 Accepted returned
// [sms-2]                Twilio SID=SM3f1a... status=queued (241 ms)`,
                `// WRONG - the SMS inside the transaction.
@Transactional
public User register(RegistrationForm form) {
    User user = userRepository.save(new User(form));
    smsService.sendOtp(user.getPhone());     // throws -> INSERT rolled back
    return user;
}
// OUTPUT when Twilio is unreachable:
// com.twilio.exception.ApiConnectionException: Connection timed out
// Rolling back JPA transaction on EntityManager [SessionImpl(...)]
// 500 Internal Server Error
// -> the registration is lost because of an unrelated third-party outage.

// RIGHT - publish an event; the listener runs only after a successful commit.
@Transactional
public User register(RegistrationForm form) {
    User user = userRepository.save(new User(form));
    events.publishEvent(new UserRegistered(user.getId(), user.getPhone()));
    return user;                              // commit happens here
}

@Component
class OtpDispatchListener {

    @Async("smsExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(UserRegistered event) {
        try {
            smsService.requestOtp(event.phone());
        } catch (ApiException e) {
            // Log and move on. The account exists; the user can request a
            // resend. Nothing about an SMS outage should destroy a signup.
            log.error("OTP send failed for {}", mask(event.phone()), e);
        }
    }
}
// OUTPUT: Twilio down, registration still succeeds
// 201 Created  {"id":4021,"status":"PENDING_VERIFICATION"}
// ERROR OtpDispatchListener - OTP send failed for *******210

// Which Twilio failures are worth retrying:
//   connection timeout, 429, 5xx        -> yes, exponential backoff + jitter
//   20003 authentication failed         -> no. Alert a human; the key is wrong
//   21211 invalid 'To' number           -> no. It will never become valid
//   21610 recipient unsubscribed (STOP) -> no, and it is a legal obligation
// Retrying a permanent failure burns money and looks like abuse to the carrier.
// A circuit breaker stops you hammering a provider that is clearly down.`
            ]
        },
        {
            content: `<h3>Where the OTP lives, and what else breaks in production</h3>
The Guava cache is in the heap of one JVM. That is fine for the classroom and wrong the moment there are two instances.<br><br>

<table>
<tr><th>Concern</th><th>Reality</th></tr>
<tr><td><strong>In-memory cache and horizontal scaling</strong></td><td>A load balancer sends the send to instance A and the verify to instance B. Instance B has no record and every verification fails intermittently - a bug that looks random and is very hard to reproduce locally.</td></tr>
<tr><td><strong>Restarts and deployments</strong></td><td>Every outstanding OTP is lost on restart. A rolling deploy during business hours breaks verification for anyone mid-flow.</td></tr>
<tr><td><strong>Unbounded growth</strong></td><td><code>CacheBuilder</code> without <code>maximumSize</code> is a memory leak an attacker can drive by sending requests for a million distinct numbers.</td></tr>
<tr><td><strong>Redis as the store</strong></td><td><code>SET key hash EX 300 NX</code> gives expiry, atomicity and sharing across instances in one command. <code>INCR</code> gives you an atomic attempt counter. This is the standard production answer.</td></tr>
<tr><td><strong>Twilio Verify</strong></td><td>Twilio's own Verify API generates, stores, expires and rate-limits the code server-side. You never see the OTP at all, which removes most of this topic's failure modes. Worth naming in an interview.</td></tr>
<tr><td><strong>Delivery status</strong></td><td><code>status=queued</code> from <code>create()</code> means Twilio accepted it, not that it arrived. Real delivery comes back later on the status callback webhook - validate <code>X-Twilio-Signature</code> before trusting it.</td></tr>
<tr><td><strong>Auditing</strong></td><td>Log every issue and verify with the masked number, source IP, purpose and outcome - never the code itself. This is what an incident investigation actually needs.</td></tr>
<tr><td><strong>Testing</strong></td><td>Twilio publishes magic test credentials and numbers that exercise each error path without sending anything. In unit tests, mock the client and inject a fixed <code>SecureRandom</code>; never call a live gateway from CI.</td></tr>
</table>`,
            codeExamples: [
                `// Redis-backed OTP store - the production shape.
@Service
public class RedisOtpStore {

    private final StringRedisTemplate redis;

    private static final Duration TTL = Duration.ofMinutes(5);
    private static final int MAX_ATTEMPTS = 5;

    public void issue(String phone, String purpose, String hash) {
        // SET ... EX 300 - expiry is enforced by Redis, not by your code.
        redis.opsForValue().set(key(phone, purpose), hash, TTL);
        redis.delete(attemptsKey(phone, purpose));
    }

    public boolean verify(String phone, String purpose, String submittedHash) {
        String k = key(phone, purpose);

        // INCR is atomic across every application instance, which a
        // get-then-put in application code is not.
        Long attempts = redis.opsForValue().increment(attemptsKey(phone, purpose));
        redis.expire(attemptsKey(phone, purpose), TTL);

        if (attempts == null || attempts > MAX_ATTEMPTS) {
            redis.delete(k);                         // burn the code
            return false;
        }

        String stored = redis.opsForValue().get(k);
        if (stored == null) {
            return false;
        }
        if (!MessageDigest.isEqual(stored.getBytes(UTF_8),
                                   submittedHash.getBytes(UTF_8))) {
            return false;
        }
        redis.delete(k);                             // single use
        redis.delete(attemptsKey(phone, purpose));
        return true;
    }
}

// OUTPUT: redis-cli during a verification flow
// > GET otp:+919876543210:login
// "6b1f9d0c4a...e21"
// > TTL otp:+919876543210:login
// (integer) 274
// > GET otp:attempts:+919876543210:login
// "2"
// > GET otp:+919876543210:login        (after a successful verify)
// (nil)`,
                `// Testing without touching a live gateway.
@SpringBootTest
class OtpFlowTest {

    @MockBean TwilioClient twilioClient;      // no HTTP, no cost, no SMS
    @Autowired SmsService smsService;
    @Autowired OtpService otpService;

    @Test
    void code_is_single_use() {
        smsService.requestOtp("+919876543210");

        ArgumentCaptor<String> body = ArgumentCaptor.forClass(String.class);
        verify(twilioClient).send(eq("+919876543210"), body.capture());

        String otp = extractSixDigits(body.getValue());

        assertTrue(otpService.verify("+919876543210", "login", otp));
        // The second attempt must fail - the entry was invalidated.
        assertFalse(otpService.verify("+919876543210", "login", otp));
    }

    @Test
    void sixth_attempt_is_rejected_even_with_the_right_code() {
        smsService.requestOtp("+919876543210");
        String otp = capturedOtp();

        for (int i = 0; i < 5; i++) {
            assertFalse(otpService.verify("+919876543210", "login", "000000"));
        }
        // Correct code, but the limit is spent and the record is gone.
        assertFalse(otpService.verify("+919876543210", "login", otp));
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
// Total time: 2.4 s - no messages sent, nothing billed.

// Twilio's magic test numbers, for exercising error paths against the real API
// with test credentials (no message is sent and nothing is charged):
//   +15005550001  -> 21212 invalid number
//   +15005550009  -> 21606 number is not SMS-capable
//   +15005550004  -> 21610 number is on the blocklist`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why must an OTP never be stored in plain text?</td><td>It is a credential with the same authority as a password for its lifetime. Store an HMAC-SHA-256 keyed with a server-side pepper, so a heap dump, a leaked cache or a debug log yields nothing usable. A bare SHA-256 is insufficient - a rainbow table of a million six-digit codes is trivial to build.</td></tr>
<tr><td>What is wrong with <code>java.util.Random</code> or <code>Math.random()</code> for an OTP?</td><td>It is a 48-bit linear congruential generator. Two consecutive outputs narrow the seed to 2<sup>16</sup> candidates, which is brute-forced in milliseconds; from there every future OTP is predictable. Use <code>SecureRandom</code>, constructed once and shared.</td></tr>
<tr><td>What is wrong with <code>100000 + random.nextInt(900000)</code> beyond the PRNG?</td><td>It generates 900,000 values, not a million - no code can start with zero. Use <code>nextInt(1_000_000)</code> and zero-pad to six characters, which requires the OTP to be a <code>String</code>.</td></tr>
<tr><td>Why is a six-digit code safe at all, given only a million possibilities?</td><td>Because of the attempt limit, not the entropy. Five attempts per code gives a 1-in-200,000 success probability. With unlimited guessing an attacker succeeds in under an hour.</td></tr>
<tr><td>Why must the OTP be invalidated after a failed-attempt limit, not just rejected?</td><td>Rejecting leaves the code alive for the rest of its TTL, so the attacker keeps guessing. Delete the record, and cap resends per number as well, or a fresh code after every five failures defeats the limit entirely.</td></tr>
<tr><td>What is SMS pumping and how do you defend against it?</td><td>Fraudsters script your send endpoint to text premium-rate numbers they earn revenue share on; the messages are never read and you pay for every one. Defend with rate limits per phone number <em>and</em> per IP, per-country caps, a global hourly send ceiling with alerting, a resend cooldown, and CAPTCHA on anomalies.</td></tr>
<tr><td>Why is per-number rate limiting alone not enough?</td><td>It stops repeated targeting of one victim but not one script walking a million distinct numbers. Per-IP limiting stops that but not a botnet hitting one number. Both are needed, plus a global cap for distributed traffic that slips under each.</td></tr>
<tr><td>Why compare OTP hashes in constant time?</td><td><code>String.equals</code> returns on the first differing byte, so response time leaks how many leading characters matched, turning a 10<sup>6</sup> search into about 60 averaged measurements. Use <code>MessageDigest.isEqual</code>. <code>Arrays.equals</code> is not constant time.</td></tr>
<tr><td>Why is SMS the weakest second factor?</td><td>SIM swap moves the number to the attacker with no flaw in your code; SS7 has no inter-carrier authentication, so messages can be rerouted; the text is plaintext at every intermediary; lock-screen previews and SMS-reading malware expose it. NIST SP 800-63B restricts it. TOTP is stronger, and WebAuthn/passkeys are phishing-resistant by construction.</td></tr>
<tr><td>What is the recovery-path mistake with strong factors?</td><td>Protecting an account with a passkey but allowing an SMS code to reset it makes the account only as strong as SMS. An attacker always takes the weakest route.</td></tr>
<tr><td>Where do the Twilio Account SID and Auth Token belong?</td><td>In environment variables or a secret manager, read through <code>@Value</code> or <code>@ConfigurationProperties</code> with no default so a missing value fails startup. Never in source - a committed token is scanned and used within minutes, deleting the line does not remove it from history, and the only remedy is rotation. Prefer a revocable API Key over the account Auth Token.</td></tr>
<tr><td>Why should the send be asynchronous?</td><td>The gateway call takes 200 ms healthy and 30 s degraded. Sending inline pins Tomcat threads and a slow provider takes down unrelated endpoints. Use <code>@Async</code> with a bounded executor and return <code>202 Accepted</code> - you cannot know delivery at request time anyway. Store the OTP synchronously first, or verification can race the store.</td></tr>
<tr><td>Why must an SMS failure not roll back the business transaction?</td><td>The registration or order is the durable fact; the message is a retryable step. Rolling back because a third-party gateway is down loses real data. Equally, sending inside a transaction that later rolls back tells the user something happened that did not - and an SMS cannot be recalled. Use <code>@TransactionalEventListener(AFTER_COMMIT)</code>, or a transactional outbox when the message must not be lost.</td></tr>
<tr><td>What breaks when the OTP lives in an in-memory cache?</td><td>With more than one instance the send lands on A and the verify on B, so verification fails intermittently; a restart drops every outstanding code; and an unbounded cache is a memory leak an attacker can drive. Use Redis with <code>SET ... EX</code> and <code>INCR</code> for an atomic shared attempt counter.</td></tr>
</table>`
        }
    ]
};
