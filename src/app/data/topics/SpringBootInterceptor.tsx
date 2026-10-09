import { Topic } from '../coreJava';

export const springBootInterceptor: Topic = {
    id: 'spring-boot-interceptor',
    name: 'Spring Boot - Interceptor',
    beginner: [
        {
            content: `<h3>What is an Interceptor?</h3>
<div class="border">
• When a request is delivered to a Spring controller, it must travel through one or more <strong>Interceptors</strong> before the controller handles it.<br>
• The concept is similar to a Servlet Filter. The difference: a Spring Interceptor intercepts only requests that are going to a Controller.<br>
• Before the request reaches the controller you can use an Interceptor to perform tasks such as user authentication, writing logs, and adding or modifying configuration.<br>
</div><br>

<h3>When do we use it?</h3>
Use an interceptor when you need to act <strong>before the request reaches the controller</strong> and <strong>before the response is sent back to the client</strong>.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   CLIENT
     |
     |  request
     v
+------------------+
|  preHandle()     |  ---- returns false ----> request stops here
+------------------+
     |  returns true
     v
+------------------+
|  REST CONTROLLER |
+------------------+
     |
     v
+------------------+
|  postHandle()    |   before the response goes to the client
+------------------+
     |
     v
+------------------+
| afterCompletion()|   after request AND response are complete
+------------------+
     |
     v
   CLIENT</pre>

<h3>Interceptor Methods</h3>

<table>
<tr><th>Method</th><th>Purpose</th></tr>
<tr><td>preHandle()</td><td>Performs an operation <strong>before</strong> the request is sent to the controller.</td></tr>
<tr><td>postHandle()</td><td>Performs an operation before the response is sent to the client - that is, it executes after the REST controller.</td></tr>
<tr><td>afterCompletion()</td><td>Performs operations after the request and the response are both complete.</td></tr>
</table>`
        },
        {
            content: `<h3>Steps</h3>

<div class="border">
1. Create the Spring Boot Maven project<br>
2. Add the Maven dependency to pom.xml<br>
3. Create the REST controller<br>
4. Create ExampleInterceptor<br>
5. Create ExampleInterceptorConfig<br>
6. Run the Spring Boot application<br>
7. Open Postman (request and response)<br>
8. Check the console<br>
</div><br>

<h3>Step 1 - Create the Project</h3>
<code>File -> New -> Spring Starter Project -></code> enter the project name, click Next, then Finish.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>`,
                `// Step 3 - the REST controller
package com.velocity.restcontroller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExampleController {

    @GetMapping("/getInterceptor")
    public String getInterceptorDemo() {
        System.out.println("Spring Boot using Interceptor......");
        return "Spring Boot using Interceptor";
    }
}`
            ]
        },
        {
            content: `<h3>Step 4 - Create ExampleInterceptor</h3>
The class implements <code>HandlerInterceptor</code> and overrides its three methods. <code>@Component</code> is a class-level annotation - nothing needs to be injected for the methods in this class to be called.<br><br>

Note that <code>preHandle()</code> returns <code>boolean</code>. Returning <code>true</code> lets the request continue to the controller; returning <code>false</code> stops it dead.<br>`,
            codeExamples: [
                `package com.velocity.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class ExampleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        System.out.println("Inside PreHandle Interceptor..");
        return true;                       // false would stop the request here
    }

    @Override
    public void postHandle(HttpServletRequest request,
                           HttpServletResponse response,
                           Object handler,
                           ModelAndView modelAndView) {

        System.out.println("Inside postHandle interceptor..");
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception exception) {

        System.out.println("Inside afterCompletion iterceptor..");
    }
}
// NOTE on imports: javax.servlet.* is correct for Spring Boot 2.x.
// On Spring Boot 3.x (Jakarta EE 9+) these become jakarta.servlet.*.`
            ]
        },
        {
            content: `<h3>Step 5 - Create ExampleInterceptorConfig</h3>
Writing the interceptor is not enough - it has to be <strong>registered</strong>. That is what this configuration class does.<br><br>

<table>
<tr><th>Element</th><th>Purpose</th></tr>
<tr><td>@Configuration</td><td>Used to create and configure instances of beans.</td></tr>
<tr><td>@Autowired</td><td>Injects the ExampleInterceptor reference into the ExampleInterceptorConfig class.</td></tr>
<tr><td>WebMvcConfigurer</td><td>The interface that contains <code>addInterceptors()</code>, used to register the interceptor against the application's requests.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ExampleInterceptorConfig implements WebMvcConfigurer {

    @Autowired
    ExampleInterceptor exampleInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        System.out.println("in addInterceptors() method..");
        registry.addInterceptor(exampleInterceptor);
    }
}`
            ]
        },
        {
            content: `<h3>Steps 6, 7 and 8 - Run, Send a Request, Read the Console</h3>
Right-click <code>SpringBootInterceptorDemoApplication -> Run As -> Spring Boot App</code>, then hit the endpoint from Postman.<br><br>

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Method</td><td>GET</td></tr>
<tr><td>URL</td><td>http://localhost:8080/getInterceptor</td></tr>
<tr><td>Response body</td><td>Spring Boot using Interceptor</td></tr>
<tr><td>Status</td><td>200 OK</td></tr>
</table>

<h3>Flow of the Application</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">ExampleInterceptorConfig.addInterceptors()   -- called internally at startup
        |
        v
    Hit Postman
        |
        v
ExampleInterceptor -> preHandle()
        |
        v
ExampleController (RestController)
        |
        v
ExampleInterceptor -> postHandle()
        |
        v
ExampleInterceptor -> afterCompletion()</pre>`,
            codeExamples: [
                `// CONSOLE OUTPUT

// ...at startup, before any request:
in addInterceptors() method..
Tomcat started on port(s): 8080 (http)
Started SpringBootInterceptorDemoApplication in 2.2 seconds

// ...after sending GET /getInterceptor from Postman:
Inside PreHandle Interceptor..
Spring Boot using Interceptor......
Inside postHandle interceptor..
Inside afterCompletion iterceptor..

// Read the order carefully - it is the whole lesson:
// the interceptor runs BEFORE and AFTER the controller method,
// and addInterceptors() ran once, at startup, not per request.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>preHandle() Returning false - What Actually Happens</h3>
The <code>boolean</code> return value is the reason interceptors are used for authentication. Return <code>false</code> and the chain stops: the controller is never invoked, <code>postHandle()</code> never runs, and <code>afterCompletion()</code> does not run for this interceptor either.<br><br>

<strong>The trap:</strong> stopping the chain is not the same as sending a response. If you return <code>false</code> without writing a status or body, the client gets an empty <code>200 OK</code> - which looks like success. You must write the response yourself.<br>`,
            codeExamples: [
                `@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String token = request.getHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            // Stopping the chain is NOT enough - write the response too.
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);   // 401
            response.setContentType("application/json");
            response.getWriter().write("{\\"error\\":\\"missing bearer token\\"}");
            return false;                       // controller is never reached
        }

        return true;
    }
}
// OUTPUT:
// GET /api/orders with no Authorization header
//   401 Unauthorized
//   {"error":"missing bearer token"}
//   (console shows preHandle only - no postHandle, no afterCompletion)
//
// Drop the three response lines and the same request returns
// 200 OK with an empty body. That bug is easy to miss.`
            ]
        },
        {
            content: `<h3>The Three Methods Are Not Symmetric</h3>
It is natural to assume the three methods always fire together. They do not, and each exception is worth knowing.<br><br>

<table>
<tr><th>Method</th><th>When it runs, and when it does not</th></tr>
<tr><td>preHandle()</td><td>Always, before the handler. If it returns false, nothing after it runs for this interceptor.</td></tr>
<tr><td>postHandle()</td><td>Only if the handler completed <strong>without throwing</strong>. An exception in the controller skips it entirely.</td></tr>
<tr><td>afterCompletion()</td><td>Always, provided preHandle() returned true - even when the handler threw. The exception is passed in as the last parameter.</td></tr>
</table>
<br>
That makes <code>afterCompletion()</code> the correct place for cleanup - clearing an MDC, closing a resource, stopping a timer - because it is the only one guaranteed to run after a failure.<br><br>

<strong>A second asymmetry</strong> that surprises people: in a <code>@RestController</code>, <code>postHandle()</code> runs <em>before</em> the response body is written by the message converter, and its <code>ModelAndView</code> parameter is always <code>null</code>. Modifying the response body there is too early to be useful - use a <code>ResponseBodyAdvice</code> or a filter instead.<br><br>

<strong>With multiple interceptors</strong>, preHandle runs in registration order and afterCompletion runs in <strong>reverse</strong> order, like nested try/finally blocks.<br>`,
            codeExamples: [
                `// Timing a request correctly - start in preHandle, stop in afterCompletion
@Component
public class TimingInterceptor implements HandlerInterceptor {

    private static final String START = "requestStartTime";

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object h) {
        req.setAttribute(START, System.currentTimeMillis());
        MDC.put("traceId", UUID.randomUUID().toString());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
                                Object h, Exception ex) {
        long ms = System.currentTimeMillis() - (Long) req.getAttribute(START);
        System.out.println(req.getRequestURI() + " -> " + res.getStatus()
                + " in " + ms + "ms" + (ex != null ? " FAILED: " + ex : ""));
        MDC.clear();                       // must happen even on failure
    }
}
// OUTPUT (success):
// /api/orders/5 -> 200 in 43ms
// OUTPUT (controller threw):
// /api/orders/5 -> 500 in 12ms FAILED: java.lang.IllegalStateException: ...
//
// Had the timing been stopped in postHandle(), the failing request
// would never have been measured.`,
                `// Ordering, and restricting an interceptor to certain paths
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor auth;
    private final TimingInterceptor timing;

    public WebConfig(AuthInterceptor auth, TimingInterceptor timing) {
        this.auth = auth;
        this.timing = timing;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(timing)
                .addPathPatterns("/**")
                .order(1);

        registry.addInterceptor(auth)
                .addPathPatterns("/api/**")           // only these
                .excludePathPatterns("/api/public/**", "/api/login")
                .order(2);
    }
}
// OUTPUT for GET /api/orders:
//   timing.preHandle -> auth.preHandle -> controller
//   -> auth.postHandle -> timing.postHandle
//   -> auth.afterCompletion -> timing.afterCompletion
// afterCompletion runs in REVERSE registration order.`
            ]
        },
        {
            content: `<h3>Interceptor vs Filter vs @ControllerAdvice</h3>
All three sit "around" a request, and they sit at different depths. Choosing wrongly means you either cannot see the information you need, or you see it too late.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        HTTP request
             |
             v
   +---------------------+
   |   SERVLET FILTER    |   servlet spec, sees EVERY request
   |                     |   (static files, errors, /actuator too)
   |  +---------------+  |
   |  | DispatcherServlet |
   |  |  +-----------+  |  |
   |  |  |INTERCEPTOR|  |  |   Spring MVC, only mapped handlers
   |  |  | +-------+ |  |  |   knows WHICH controller method
   |  |  | |@Contro| |  |  |
   |  |  | |llerAdv| |  |  |   wraps the handler call itself
   |  |  | +-------+ |  |  |
   |  |  +-----------+  |  |
   |  +---------------+  |
   +---------------------+</pre>

<table>
<tr><th>Aspect</th><th>Filter</th><th>Interceptor</th></tr>
<tr><td>Defined by</td><td>Servlet specification</td><td>Spring MVC</td></tr>
<tr><td>Sees</td><td>Every request, including static resources and errors</td><td>Only requests mapped to a handler</td></tr>
<tr><td>Knows the handler?</td><td>No</td><td>Yes - the <code>Object handler</code> parameter is the controller method</td></tr>
<tr><td>Can modify the raw body</td><td>Yes, by wrapping request/response</td><td>No, not practically</td></tr>
<tr><td>Spring beans available</td><td>Yes, if registered as a bean</td><td>Yes, always</td></tr>
<tr><td>Typical use</td><td>CORS, compression, security filter chain, request wrapping</td><td>Auth checks per handler, logging, timing, MDC, tenant resolution</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> if you need to see the controller method or its annotations, use an interceptor. If you need to touch the raw bytes or catch requests that never reach a controller, use a filter. If you are handling exceptions or reshaping the response body, use <code>@RestControllerAdvice</code>.<br>`,
            codeExamples: [
                `// An interceptor CAN read the target method's annotations - a filter cannot.
// This is what makes per-endpoint rules possible.
@Override
public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {

    if (handler instanceof HandlerMethod hm) {

        RequiresRole required = hm.getMethodAnnotation(RequiresRole.class);

        if (required != null && !currentUserHasRole(required.value())) {
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }
    }
    return true;
}
// Used as:
//   @RequiresRole("ADMIN")
//   @DeleteMapping("/api/students/{id}")
//   public void delete(@PathVariable int id) { ... }
// OUTPUT:
// A non-admin caller gets 403 and the method never runs.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a Spring interceptor?</td><td>A Spring MVC component that a request passes through before and after the controller handles it - used for authentication, logging, timing and configuration changes.</td></tr>
<tr><td>What are its three methods?</td><td>preHandle() before the controller, postHandle() after the controller but before the response is sent, afterCompletion() after the request and response are complete.</td></tr>
<tr><td>Which interface do you implement?</td><td><code>HandlerInterceptor</code>.</td></tr>
<tr><td>How is an interceptor registered?</td><td>In a <code>@Configuration</code> class implementing <code>WebMvcConfigurer</code>, by overriding <code>addInterceptors(InterceptorRegistry)</code>.</td></tr>
<tr><td>When does addInterceptors() run?</td><td>Once, at application startup - not per request.</td></tr>
<tr><td>What does returning false from preHandle() do?</td><td>Stops the chain: the controller and postHandle() never run. You must write the status and body yourself, or the client receives an empty 200.</td></tr>
<tr><td>Does postHandle() run if the controller throws?</td><td>No. afterCompletion() still does, and receives the exception as its last parameter.</td></tr>
<tr><td>Where do you put cleanup code?</td><td>afterCompletion() - the only method guaranteed to run after a failure.</td></tr>
<tr><td>Interceptor vs Filter?</td><td>A filter is servlet-level and sees every request but not the handler; an interceptor is Spring MVC-level, sees only mapped handlers, and knows which controller method will run.</td></tr>
<tr><td>Can an interceptor read the controller method's annotations?</td><td>Yes - cast the <code>handler</code> parameter to <code>HandlerMethod</code>. This is the main thing a filter cannot do.</td></tr>
<tr><td>In what order do multiple interceptors run?</td><td>preHandle in registration order; afterCompletion in reverse order, like nested try/finally blocks.</td></tr>
<tr><td>Why is ModelAndView null in a REST controller's postHandle()?</td><td>There is no view - the return value is serialised by a message converter. To alter a REST response body, use ResponseBodyAdvice instead.</td></tr>
<tr><td>How do you apply an interceptor to only some URLs?</td><td><code>addPathPatterns("/api/**")</code> and <code>excludePathPatterns("/api/login")</code> on the registration.</td></tr>
</table>`
        }
    ]
};
