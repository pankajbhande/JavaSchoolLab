import { Topic } from '../coreJava';

export const httpClientApi: Topic = {
                        id: 'http-client',
                        name: 'HTTP Client API',
                        beginner: [
                            {
                                content: `<h3>HTTP Client API (java.net.http)</h3>
<h4>Introduction</h4>
Java 11 introduced a new <strong>HTTP Client API</strong> in the <strong>java.net.http</strong> package as a standard feature. It replaces the legacy <strong>HttpURLConnection</strong> API and provides a modern, fluent interface for making HTTP requests.
<h4>Key Components</h4>
<ul>
<li><strong>HttpClient</strong> — The main entry point for sending HTTP requests</li>
<li><strong>HttpRequest</strong> — Represents an HTTP request with method, URI, headers, and body</li>
<li><strong>HttpResponse</strong> — Represents the HTTP response with status code, headers, and body</li>
<li><strong>HttpResponse.BodyHandlers</strong> — Predefined handlers for response body processing</li>
</ul>
<h4>Key Features</h4>
<ul>
<li>Supports HTTP/1.1 and HTTP/2</li>
<li>Supports synchronous and asynchronous requests</li>
<li>Built-in WebSocket support</li>
<li>Immutable and thread-safe request/response objects</li>
<li>Builder pattern for creating clients and requests</li>
</ul>`,
                                codeExamples: [
`// Basic HTTP Client usage
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class HttpClientBasic {
    public static void main(String[] args) throws Exception {
        // Create an HttpClient
        HttpClient client = HttpClient.newHttpClient();

        // Create an HttpRequest (GET by default)
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://jsonplaceholder.typicode.com/posts/1"))
            .build();

        // Send the request synchronously
        HttpResponse<String> response = client.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        // Process the response
        System.out.println("Status Code: " + response.statusCode());
        System.out.println("Headers: " + response.headers());
        System.out.println("Body: " + response.body());
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>HTTP Client API — Intermediate Usage</h3>
<h4>POST Requests</h4>
You can send POST requests with different body types using <strong>HttpRequest.BodyPublishers</strong>.
<h4>Setting Headers and Timeouts</h4>
The builder pattern allows configuring headers, timeouts, and other request properties.
<h4>Asynchronous Requests</h4>
Use <strong>sendAsync()</strong> to send non-blocking requests that return a <strong>CompletableFuture</strong>.
<h4>Best Practices</h4>
<ul>
<li>Reuse <strong>HttpClient</strong> instances — they are thread-safe</li>
<li>Set appropriate timeouts to avoid hanging requests</li>
<li>Use asynchronous requests for non-blocking I/O</li>
<li>Handle response status codes appropriately</li>
</ul>`,
                                codeExamples: [
`// Intermediate HTTP Client: POST, async, headers
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

public class HttpClientIntermediate {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        // POST request with JSON body
        String jsonBody = "{\\"title\\":\\"foo\\",\\"body\\":\\"bar\\",\\"userId\\":1}";
        HttpRequest postRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://jsonplaceholder.typicode.com/posts"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .timeout(Duration.ofSeconds(30))
            .build();

        HttpResponse<String> postResponse = client.send(
            postRequest, HttpResponse.BodyHandlers.ofString());
        System.out.println("POST Status: " + postResponse.statusCode());
        System.out.println("POST Body: " + postResponse.body());

        // Asynchronous GET request
        HttpRequest asyncRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://jsonplaceholder.typicode.com/posts/2"))
            .build();

        CompletableFuture<HttpResponse<String>> futureResponse =
            client.sendAsync(asyncRequest, HttpResponse.BodyHandlers.ofString());

        futureResponse.thenApply(HttpResponse::body)
            .thenAccept(body -> System.out.println("Async Body: " + body))
            .join(); // wait for completion
    }
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>HTTP Client API — Expert Deep Dive</h3>
<h4>Internal Architecture</h4>
<ul>
<li>The HTTP Client uses an internal <strong>SelectorManager</strong> for async I/O</li>
<li>HTTP/2 support includes multiplexing and header compression (server push is supported by the API but rarely used)</li>
<li>The client manages a connection pool internally</li>
<li>Uses <strong>Flow API</strong> (Reactive Streams) internally for body processing</li>
</ul>
<h4>Comparison with Legacy HttpURLConnection</h4>
<ul>
<li>HttpURLConnection: Blocking, mutable, verbose, no HTTP/2</li>
<li>New HttpClient: Non-blocking support, immutable, fluent API, HTTP/2 native</li>
</ul>
<h4>Quick Questions</h4>
<ul>
<li><strong>Why was HttpClient introduced?</strong> — To replace the dated HttpURLConnection with a modern, non-blocking, HTTP/2 compatible API</li>
<li><strong>Is HttpClient thread-safe?</strong> — Yes, it is immutable and can be shared across threads</li>
<li><strong>How does async work internally?</strong> — Uses CompletableFuture backed by an internal executor and NIO selectors</li>
<li><strong>Does it support WebSocket?</strong> — Yes, via HttpClient.newWebSocketBuilder()</li>
</ul>`,
                                codeExamples: [
`// Expert HTTP Client: concurrent requests, custom handling
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

public class HttpClientExpert {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

        // Sending multiple concurrent requests
        List<URI> uris = List.of(
            URI.create("https://jsonplaceholder.typicode.com/posts/1"),
            URI.create("https://jsonplaceholder.typicode.com/posts/2"),
            URI.create("https://jsonplaceholder.typicode.com/posts/3")
        );

        List<CompletableFuture<HttpResponse<String>>> futures = uris.stream()
            .map(uri -> HttpRequest.newBuilder().uri(uri).build())
            .map(req -> client.sendAsync(req, HttpResponse.BodyHandlers.ofString()))
            .collect(Collectors.toList());

        // Wait for all responses
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        for (var future : futures) {
            HttpResponse<String> resp = future.get();
            System.out.println("URI: " + resp.uri() +
                " Status: " + resp.statusCode() +
                " Body length: " + resp.body().length());
        }
    }
}`
                                ]
                            }
                        ]
};
