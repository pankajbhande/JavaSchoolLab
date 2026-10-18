// Spring extras, batch smvc24 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc24Extras: Record<string, Extra> = {
    'mvc-file-upload': x(
        ['<b>File upload</b> means the browser sends a file to the server in a <code>multipart/form-data</code> request, and Spring MVC hands it to the controller as a <code>MultipartFile</code>.',
            '<b>Form needs</b> <code>method="post"</code> and <code>enctype="multipart/form-data"</code>, otherwise only the file name arrives, not the bytes.',
            '<b>Bind with</b> <code>@RequestParam("file") MultipartFile file</code>, then call <code>getOriginalFilename()</code>, <code>getSize()</code> and <code>transferTo()</code>.'],
        ['<b>MultipartResolver</b>: Spring Boot registers <code>StandardServletMultipartResolver</code>, which wraps the servlet container parsing and wraps each part as a <code>MultipartFile</code>.',
            '<b>Limits</b> are set with <code>spring.servlet.multipart.max-file-size</code> and <code>max-request-size</code> (defaults are 1MB and 10MB).',
            '<b>Mixed parts</b>: use <code>@RequestPart</code> to receive a JSON part and a file part in one request.'],
        ['<b>Never trust the file name</b>: it can contain <code>../</code> (path traversal), so generate your own name and resolve it against a fixed folder.',
            '<b>Store outside the web root</b> or in object storage, and stream with <code>getInputStream()</code> rather than <code>getBytes()</code> for big files.',
            '<b>Temporary storage</b>: parts above <code>file-size-threshold</code> are written to disk and removed after the request.'],
        [['F', 'Which form attribute is required for upload?', 'enctype="multipart/form-data" together with method="post".'],
            ['F', 'Which type represents an uploaded file?', 'org.springframework.web.multipart.MultipartFile.'],
            ['M', 'How do you save the uploaded file?', 'Call file.transferTo(path) or copy file.getInputStream() with Files.copy.'],
            ['M', 'What is the default maximum file size in Spring Boot?', '1MB per file and 10MB per request; change it with spring.servlet.multipart properties.'],
            ['S', 'Why not use the original file name directly?', 'It is client controlled and can hold path segments or overwrite files, so generate a safe name such as a UUID.'],
            ['S', 'What happens when the size limit is exceeded?', 'A MaxUploadSizeExceededException is raised before the controller runs, so handle it with @ExceptionHandler or @ControllerAdvice.']],
        [['Minimal upload controller.',
            r`@RestController
class UploadController {
    private final Path root = Path.of("uploads");

    @PostMapping("/upload")
    String upload(@RequestParam("file") MultipartFile file) throws IOException {
        Files.createDirectories(root);
        Path target = root.resolve(UUID.randomUUID() + ".bin");
        file.transferTo(target);
        return file.getOriginalFilename() + " (" + file.getSize() + " bytes)";
    }
}

// OUTPUT:
// curl -F "file=@notes.txt" http://localhost:8080/upload
// notes.txt (1204 bytes)`],
            ['HTML form for the upload.',
                r`<form method="post" action="/upload" enctype="multipart/form-data">
    <input type="file" name="file">
    <button type="submit">Upload</button>
</form>

<!-- OUTPUT: the browser sends Content-Type: multipart/form-data;
boundary=... -->
// OUTPUT:
// POST /upload 200 OK  body: notes.txt (1204 bytes)`]],
        [['Test the upload with MockMvc.',
            r`@WebMvcTest(UploadController.class)
class UploadControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void uploadsFile() throws Exception {
        var file = new MockMultipartFile("file", "a.txt", "text/plain", "hello".getBytes());
        mvc.perform(multipart("/upload").file(file))
           .andExpect(status().isOk())
           .andExpect(content().string("a.txt (5 bytes)"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Configure limits.',
                r`# application.properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
spring.servlet.multipart.file-size-threshold=1MB

# OUTPUT:
# Files above 5MB are rejected with HTTP 413 (after you map the exception)`]]
    ),
    'mvc-multiple-file-upload': x(
        ['<b>Multiple upload</b> sends several files in one request; bind them as <code>MultipartFile[]</code> or <code>List&lt;MultipartFile&gt;</code>.',
            '<b>HTML side</b>: add the <code>multiple</code> attribute to the file input, or repeat inputs with the same <code>name</code>.',
            '<b>Loop</b> over the files, skip those where <code>isEmpty()</code> is true, and save each one.'],
        ['<b>Same name</b> for all parts: <code>@RequestParam("files") List&lt;MultipartFile&gt; files</code> collects every part named files.',
            '<b>Grouped by name</b>: <code>MultipartHttpServletRequest.getMultiFileMap()</code> returns a map of part name to list of files.',
            '<b>Request size</b>: <code>max-request-size</code> limits the sum of all files, while <code>max-file-size</code> limits each file.'],
        ['<b>All or nothing</b>: decide whether one bad file fails the whole request, or return a per-file result list.',
            '<b>Count limit</b>: the container also caps part count (Tomcat <code>maxPartCount</code> style limits), so cap the number of files in code too.',
            '<b>Clean up</b>: if the third file fails, delete the first two so you do not leave orphans.'],
        [['F', 'How do you receive many files?', 'Use List<MultipartFile> or MultipartFile[] with @RequestParam.'],
            ['F', 'Which HTML attribute lets a user pick many files?', 'The multiple attribute on input type="file".'],
            ['M', 'Which property limits the total upload?', 'spring.servlet.multipart.max-request-size.'],
            ['M', 'How do you ignore empty file slots?', 'Check file.isEmpty() and continue in the loop.'],
            ['S', 'How do you report partial success?', 'Return a list of per-file result objects with name, status and message instead of failing the entire request.'],
            ['S', 'How do you protect against too many files?', 'Check files.size() against a maximum and reject with 400, and also set container part limits.']],
        [['Receive a list of files.',
            r`@PostMapping("/upload-many")
List<String> uploadMany(@RequestParam("files") List<MultipartFile> files)
        throws IOException {
    List<String> saved = new ArrayList<>();
    for (MultipartFile f : files) {
        if (f.isEmpty()) continue;
        Path target = Path.of("uploads", UUID.randomUUID() + "-" + f.getSize());
        f.transferTo(target.toAbsolutePath());
        saved.add(f.getOriginalFilename());
    }
    return saved;
}

// OUTPUT:
// curl -F "files=@a.txt" -F "files=@b.txt" http://localhost:8080/upload-many
// ["a.txt","b.txt"]`],
            ['HTML form with multiple.',
                r`<form method="post" action="/upload-many" enctype="multipart/form-data">
    <input type="file" name="files" multiple>
    <button>Upload all</button>
</form>

// OUTPUT:
// The browser sends one part named files for every selected file`]],
        [['Array binding with a count limit.',
            r`@PostMapping("/upload-max3")
ResponseEntity<String> max3(@RequestParam("files") MultipartFile[] files) {
    if (files.length > 3) {
        return ResponseEntity.badRequest().body("At most 3 files");
    }
    return ResponseEntity.ok(files.length + " files accepted");
}

// OUTPUT:
// 4 files -> 400 At most 3 files
// 2 files -> 200 2 files accepted`],
            ['MockMvc with two files.',
                r`@Test
void uploadsTwo() throws Exception {
    var a = new MockMultipartFile("files", "a.txt", "text/plain", "A".getBytes());
    var b = new MockMultipartFile("files", "b.txt", "text/plain", "B".getBytes());
    mvc.perform(multipart("/upload-many").file(a).file(b))
       .andExpect(status().isOk())
       .andExpect(jsonPath("$.length()").value(2));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-file-validation': x(
        ['<b>File validation</b> checks an upload before you store it: not empty, allowed size, allowed type and a safe name.',
            '<b>Why</b>: a client can send anything, so the server must verify, because browser side <code>accept</code> filters are only a hint.',
            '<b>Where</b>: do quick checks in the controller or a service, or write a custom <code>ConstraintValidator</code> for reuse.'],
        ['<b>No built-in annotation</b>: Bean Validation has nothing for <code>MultipartFile</code>, so write your own, for example <code>@ValidFile</code>.',
            '<b>Custom constraint</b>: an annotation with <code>@Constraint(validatedBy = ...)</code> plus a class implementing <code>ConstraintValidator</code>.',
            '<b>Errors</b>: return 400 with a clear message, using <code>@ControllerAdvice</code> or a <code>BindingResult</code> for form pages.'],
        ['<b>Content sniffing</b>: do not trust the <code>Content-Type</code> header or extension; inspect the first bytes (magic numbers).',
            '<b>Name safety</b>: use <code>StringUtils.cleanPath</code> and reject names containing <code>..</code>.',
            '<b>Defense in depth</b>: store outside the web root, never execute uploads, and scan for malware when risk is high.'],
        [['F', 'Why validate uploaded files?', 'Clients can send any file, so the server must check size, type and name for safety.'],
            ['F', 'What does MultipartFile.isEmpty() tell you?', 'That no file was chosen or the file has zero bytes.'],
            ['M', 'Is there a built-in @NotEmpty for MultipartFile?', 'Not meaningfully; write a custom ConstraintValidator or check isEmpty() in code.'],
            ['M', 'Where do you handle validation failures?', 'In a @ControllerAdvice or a BindingResult, returning 400 with a message.'],
            ['S', 'Why is checking the extension not enough?', 'An attacker can rename a file; check the actual content bytes as well.'],
            ['S', 'How do you stop path traversal?', 'Never use the client file name as a path; generate your own name and resolve it inside a fixed directory.']],
        [['A small validation method.',
            r`void validate(MultipartFile file) {
    if (file == null || file.isEmpty()) {
        throw new IllegalArgumentException("File is required");
    }
    String name = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
    if (name.contains("..")) {
        throw new IllegalArgumentException("Invalid file name");
    }
}

// OUTPUT:
// validate(emptyFile)        -> IllegalArgumentException: File is required
// validate("../../etc/passwd") -> IllegalArgumentException: Invalid file name`],
            ['Map failures to 400.',
                r`@RestControllerAdvice
class UploadErrors {
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> bad(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}

// OUTPUT:
// HTTP/1.1 400
// {"error":"File is required"}`]],
        [['Custom constraint annotation.',
            r`@Target({ElementType.PARAMETER, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FileValidator.class)
public @interface ValidFile {
    String message() default "Invalid file";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class FileValidator implements ConstraintValidator<ValidFile, MultipartFile> {
    public boolean isValid(MultipartFile f, ConstraintValidatorContext c) {
        return f != null && !f.isEmpty();
    }
}

// OUTPUT:
// @ValidFile on a field -> a binding error "Invalid file" when no file is sent`],
            ['Test the bad request.',
                r`@Test
void rejectsEmptyFile() throws Exception {
    var empty = new MockMultipartFile("file", "a.txt", "text/plain", new byte[0]);
    mvc.perform(multipart("/upload").file(empty))
       .andExpect(status().isBadRequest());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-file-size-validation': x(
        ['<b>Size validation</b> limits how large an upload may be, to protect disk, memory and bandwidth.',
            '<b>Global limits</b>: <code>spring.servlet.multipart.max-file-size</code> (each file) and <code>max-request-size</code> (whole request).',
            '<b>Violation</b> raises <code>MaxUploadSizeExceededException</code>, which you should map to HTTP 413 Payload Too Large.'],
        ['<b>Per-endpoint limit</b>: check <code>file.getSize()</code> in code when one endpoint needs a stricter limit than the global one.',
            '<b>Handler</b>: <code>@ExceptionHandler(MaxUploadSizeExceededException.class)</code> inside <code>@RestControllerAdvice</code>.',
            '<b>DataSize</b>: write limits as <code>5MB</code> or <code>512KB</code> in properties; Spring converts them to <code>DataSize</code>.'],
        ['<b>Container limits too</b>: a reverse proxy (nginx <code>client_max_body_size</code>) or Tomcat may reject before Spring sees it.',
            '<b>getSize() is client declared</b> per part, but the container enforces real counting; still re-check after saving if you must be strict.',
            '<b>Unlimited</b> is possible with <code>-1</code>, but dangerous without another guard.'],
        [['F', 'Which property limits a single file?', 'spring.servlet.multipart.max-file-size.'],
            ['F', 'Which HTTP status fits a too large upload?', '413 Payload Too Large.'],
            ['M', 'Which exception signals the limit was exceeded?', 'MaxUploadSizeExceededException (a MultipartException).'],
            ['M', 'Difference between max-file-size and max-request-size?', 'The first caps each file, the second caps the total request including all parts.'],
            ['S', 'Why might the exception handler not run?', 'The error can occur while parsing, so it may surface as a container error; register the handler in a ControllerAdvice and check the resolver.'],
            ['S', 'What else can reject a big upload?', 'A proxy or load balancer limit, or the servlet container settings.']],
        [['Per-endpoint limit in code.',
            r`private static final long MAX = 2 * 1024 * 1024;   // 2 MB

@PostMapping("/avatar")
ResponseEntity<String> avatar(@RequestParam("file") MultipartFile file) {
    if (file.getSize() > MAX) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("Max 2MB, got " + file.getSize());
    }
    return ResponseEntity.ok("ok");
}

// OUTPUT:
// 3 MB file -> 413 Max 2MB, got 3145728
// 100 KB file -> 200 ok`],
            ['Global handler.',
                r`@RestControllerAdvice
class SizeAdvice {
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<Map<String, String>> tooBig(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(413).body(Map.of("error", "File too large"));
    }
}

// OUTPUT:
// HTTP/1.1 413
// {"error":"File too large"}`]],
        [['Properties.',
            r`# application.properties
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=6MB

# OUTPUT:
# 3 MB file -> MaxUploadSizeExceededException -> 413`],
            ['Test the limit.',
                r`@Test
void rejectsLargeFile() throws Exception {
    byte[] big = new byte[3 * 1024 * 1024];
    var file = new MockMultipartFile("file", "big.bin", "application/octet-stream", big);
    mvc.perform(multipart("/avatar").file(file))
       .andExpect(status().isPayloadTooLarge());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-file-type-validation': x(
        ['<b>Type validation</b> allows only chosen kinds of files, such as images (<code>image/png</code>, <code>image/jpeg</code>) or PDFs.',
            '<b>Check</b> <code>file.getContentType()</code> against an allow-list; prefer an allow-list over a block-list.',
            '<b>Also check</b> the extension of the name, because the declared content type is sent by the client.'],
        ['<b>Magic numbers</b>: read the first bytes (PNG starts with 89 50 4E 47, PDF with %PDF) to confirm real content.',
            '<b>Tika</b>: Apache Tika detects the real type from content, if you add the dependency.',
            '<b>Response</b>: return 415 Unsupported Media Type or 400 with a message listing allowed types.'],
        ['<b>Polyglot files</b>: a file can be a valid image and a script at once, so also serve uploads with a fixed safe <code>Content-Type</code> and <code>X-Content-Type-Options: nosniff</code>.',
            '<b>Image re-encoding</b>: decoding and re-writing an image with <code>ImageIO</code> strips hidden payloads.',
            '<b>Never</b> save with the client extension into an executable location such as a script folder.'],
        [['F', 'How do you read the declared type?', 'file.getContentType().'],
            ['F', 'Allow-list or block-list?', 'Allow-list: accept only known good types.'],
            ['M', 'Why not trust Content-Type?', 'The client sets it, so it can be faked; verify the content bytes.'],
            ['M', 'Which status code for a wrong type?', '415 Unsupported Media Type (or 400).'],
            ['S', 'How can you detect the true type?', 'Read magic bytes or use Apache Tika, then compare with the allow-list.'],
            ['S', 'What header reduces browser sniffing risk when serving uploads?', 'X-Content-Type-Options: nosniff, with a correct fixed Content-Type.']],
        [['Allow-list check.',
            r`private static final Set<String> ALLOWED =
        Set.of("image/png", "image/jpeg", "application/pdf");

@PostMapping("/docs")
ResponseEntity<String> docs(@RequestParam("file") MultipartFile file) {
    if (!ALLOWED.contains(file.getContentType())) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body("Type not allowed: " + file.getContentType());
    }
    return ResponseEntity.ok("accepted");
}

// OUTPUT:
// text/html -> 415 Type not allowed: text/html
// image/png -> 200 accepted`],
            ['Magic number check for PNG.',
                r`static boolean isPng(MultipartFile f) throws IOException {
    byte[] sig = {(byte) 0x89, 'P', 'N', 'G'};
    try (InputStream in = f.getInputStream()) {
        byte[] head = in.readNBytes(4);
        return Arrays.equals(head, sig);
    }
}

// OUTPUT:
// real PNG -> true
// renamed text file named x.png -> false`]],
        [['Extension plus type.',
            r`static boolean looksLikeImage(MultipartFile f) {
    String name = Objects.requireNonNullElse(f.getOriginalFilename(), "")
            .toLowerCase(Locale.ROOT);
    boolean ext = name.endsWith(".png") || name.endsWith(".jpg");
    boolean type = f.getContentType() != null && f.getContentType().startsWith("image/");
    return ext && type;
}

// OUTPUT:
// photo.png + image/png -> true
// run.exe + application/x-msdownload -> false`],
            ['Test a rejected type.',
                r`@Test
void rejectsHtml() throws Exception {
    var f = new MockMultipartFile("file", "x.html", "text/html", "<b>".getBytes());
    mvc.perform(multipart("/docs").file(f))
       .andExpect(status().isUnsupportedMediaType());
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-file-download': x(
        ['<b>File download</b> sends a stored file to the client; the controller returns bytes with <code>Content-Type</code> and <code>Content-Disposition: attachment</code>.',
            '<b>Simplest form</b>: return <code>ResponseEntity&lt;Resource&gt;</code> built from a <code>FileSystemResource</code> or <code>UrlResource</code>.',
            '<b>attachment</b> makes the browser save the file; <code>inline</code> lets it show the file (for example a PDF) in the tab.'],
        ['<b>Handled by</b> <code>ResourceHttpMessageConverter</code> (and <code>ResourceRegionHttpMessageConverter</code> for ranges), selected by the return type.',
            '<b>Header helper</b>: <code>ContentDisposition.attachment().filename(name).build()</code> encodes the file name correctly.',
            '<b>Media type</b>: use <code>Files.probeContentType</code> or <code>MediaTypeFactory.getMediaType(resource)</code>, with <code>application/octet-stream</code> as the fallback.'],
        ['<b>Path traversal</b>: resolve the requested name against a base directory, call <code>normalize()</code>, and check <code>startsWith(base)</code>.',
            '<b>Not found</b>: return 404 when the file is missing, instead of a 500.',
            '<b>Caching</b>: add <code>ETag</code> or <code>Last-Modified</code>, and <code>Content-Length</code>, so clients and proxies behave well.'],
        [['F', 'Which header makes the browser download the file?', 'Content-Disposition: attachment; filename="..."'],
            ['F', 'What can a download method return?', 'ResponseEntity<Resource>, byte[], or write to the HttpServletResponse.'],
            ['M', 'Difference between attachment and inline?', 'attachment prompts a save; inline asks the browser to display the content.'],
            ['M', 'Which class builds a safe Content-Disposition?', 'org.springframework.http.ContentDisposition.'],
            ['S', 'How do you prevent downloading files outside the folder?', 'Normalize the resolved path and verify it starts with the base directory.'],
            ['S', 'How do you support resuming a download?', 'Return a Resource with ResponseEntity so Spring honors the Range header with a 206 response.']],
        [['Download endpoint.',
            r`@GetMapping("/files/{name}")
ResponseEntity<Resource> download(@PathVariable String name) throws IOException {
    Path base = Path.of("uploads").toAbsolutePath().normalize();
    Path file = base.resolve(name).normalize();
    if (!file.startsWith(base) || !Files.exists(file)) {
        return ResponseEntity.notFound().build();
    }
    Resource res = new UrlResource(file.toUri());
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename(name).build().toString())
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(res);
}

// OUTPUT:
// GET /files/report.pdf
// HTTP/1.1 200
// Content-Disposition: attachment; filename="report.pdf"`],
            ['Download bytes directly.',
                r`@GetMapping("/hello.txt")
ResponseEntity<byte[]> hello() {
    byte[] data = "Hello".getBytes(StandardCharsets.UTF_8);
    return ResponseEntity.ok()
        .header("Content-Disposition", "attachment; filename=hello.txt")
        .contentLength(data.length)
        .body(data);
}

// OUTPUT:
// HTTP/1.1 200
// Content-Length: 5
// Hello`]],
        [['Traversal attempt is blocked.',
            r`// request: GET /files/..%2F..%2Fsecret.txt
Path base = Path.of("uploads").toAbsolutePath().normalize();
Path file = base.resolve("../../secret.txt").normalize();
System.out.println(file.startsWith(base));

// OUTPUT:
// false   (so the controller returns 404)`],
            ['Test the download.',
                r`@Test
void downloads() throws Exception {
    mvc.perform(get("/hello.txt"))
       .andExpect(status().isOk())
       .andExpect(header().string("Content-Disposition",
               "attachment; filename=hello.txt"))
       .andExpect(content().string("Hello"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-streaming-response': x(
        ['<b>Streaming response</b> writes data to the client as it is produced, instead of building the whole body in memory first.',
            '<b>Main tool</b>: return <code>StreamingResponseBody</code>, a functional interface whose <code>writeTo(OutputStream)</code> runs on an async thread.',
            '<b>Use for</b> big files, generated exports (CSV) and long running output, where holding everything in a <code>byte[]</code> would waste memory.'],
        ['<b>How</b>: Spring MVC starts async processing, frees the request thread, and a task executor runs your <code>writeTo</code> code.',
            '<b>Other types</b>: <code>SseEmitter</code> (server sent events) and <code>ResponseBodyEmitter</code> push many items over time.',
            '<b>Executor</b>: configure <code>spring.mvc.async.request-timeout</code> and a <code>TaskExecutor</code> via <code>WebMvcConfigurer.configureAsyncSupport</code>.'],
        ['<b>Headers first</b>: status and headers are committed on the first flush, so you cannot change them after output starts.',
            '<b>Errors mid-stream</b> cannot become a clean 500; the client sees a truncated body, so log and design for it.',
            '<b>Transactions and open sessions</b> do not span the async thread by default, so avoid lazy loading inside <code>writeTo</code>.'],
        [['F', 'What is StreamingResponseBody?', 'A controller return type that lets you write directly to the response output stream.'],
            ['F', 'Why stream?', 'To avoid loading the full content into memory.'],
            ['M', 'Which thread runs writeTo?', 'A task executor thread, because Spring MVC handles the request asynchronously.'],
            ['M', 'Which type pushes events to the browser?', 'SseEmitter, for server sent events (text/event-stream).'],
            ['S', 'What if an exception occurs halfway?', 'The headers are already sent, so the client gets a truncated response; you can only log and close.'],
            ['S', 'How do you test it with MockMvc?', 'Perform the request, then use asyncDispatch on the MvcResult after asyncStarted().']],
        [['Stream a generated CSV.',
            r`@GetMapping("/export.csv")
ResponseEntity<StreamingResponseBody> export() {
    StreamingResponseBody body = out -> {
        Writer w = new OutputStreamWriter(out, StandardCharsets.UTF_8);
        w.write("id,name\n");
        for (int i = 1; i <= 3; i++) {
            w.write(i + ",user" + i + "\n");
            w.flush();                       // send to the client now
        }
    };
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(body);
}

// OUTPUT:
// id,name
// 1,user1
// 2,user2
// 3,user3`],
            ['Server sent events.',
                r`@GetMapping(value = "/ticks", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
SseEmitter ticks() {
    SseEmitter emitter = new SseEmitter(30_000L);
    Executors.newSingleThreadExecutor().submit(() -> {
        try {
            for (int i = 1; i <= 3; i++) {
                emitter.send("tick " + i);
                Thread.sleep(1000);
            }
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    });
    return emitter;
}

// OUTPUT:
// data:tick 1
// data:tick 2
// data:tick 3`]],
        [['MockMvc test for streaming.',
            r`@Test
void streamsCsv() throws Exception {
    MvcResult started = mvc.perform(get("/export.csv"))
        .andExpect(request().asyncStarted())
        .andReturn();
    mvc.perform(asyncDispatch(started))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("1,user1")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Async configuration.',
                r`@Configuration
class AsyncConfig implements WebMvcConfigurer {
    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer c) {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(4);
        ex.setThreadNamePrefix("stream-");
        ex.initialize();
        c.setTaskExecutor(ex);
        c.setDefaultTimeout(60_000);
    }
}

// OUTPUT:
// Streaming tasks now run on threads named stream-1, stream-2, ...`]]
    ),
    'mvc-resource': x(
        ['<b>Resource</b> is Spring abstraction (<code>org.springframework.core.io.Resource</code>) for any readable content: a file, classpath entry, URL or byte array.',
            '<b>Common types</b>: <code>ClassPathResource</code>, <code>FileSystemResource</code>, <code>UrlResource</code>, <code>ByteArrayResource</code> and <code>InputStreamResource</code>.',
            '<b>Key methods</b>: <code>exists()</code>, <code>getInputStream()</code>, <code>getFile()</code>, <code>contentLength()</code> and <code>getFilename()</code>.'],
        ['<b>Prefixes</b> pick the type: <code>classpath:</code>, <code>file:</code>, <code>http:</code>; no prefix uses the context type.',
            '<b>Injection</b>: <code>@Value("classpath:data/seed.json") Resource seed</code> or the <code>ResourceLoader</code> interface (<code>getResource</code>).',
            '<b>Patterns</b>: <code>ResourcePatternResolver</code> with <code>classpath*:</code> and Ant patterns finds many resources at once.'],
        ['<b>getFile() fails</b> for resources inside a JAR, because they are not files; use <code>getInputStream()</code> instead.',
            '<b>InputStreamResource</b> can be read only once, and has no length, so it is a poor choice for downloads that need Content-Length.',
            '<b>Close streams</b> with try-with-resources; the Resource itself is just a handle, the stream is what you must close.'],
        [['F', 'What is a Resource in Spring?', 'An abstraction over files, classpath entries, URLs and other content sources.'],
            ['F', 'How do you load a classpath file?', 'new ClassPathResource("path") or @Value("classpath:path") Resource.'],
            ['M', 'Which interface loads resources by location string?', 'ResourceLoader, with getResource(String).'],
            ['M', 'Why does getFile() fail inside a JAR?', 'Entries in a JAR are not files on disk; use getInputStream().'],
            ['S', 'Difference between classpath: and classpath*:?', 'classpath: returns the first match; classpath*: finds all matches on every classpath root.'],
            ['S', 'Why is ByteArrayResource good for generated content?', 'It wraps a byte[] with a known length, so it can be returned with Content-Length and read many times.']],
        [['Inject and read a resource.',
            r`@Component
class SeedReader {
    private final Resource seed;

    SeedReader(@Value("classpath:data/seed.txt") Resource seed) {
        this.seed = seed;
    }

    String read() throws IOException {
        try (InputStream in = seed.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}

// OUTPUT:
// read() -> "hello from seed.txt"`],
            ['ResourceLoader and patterns.',
                r`@Autowired ResourceLoader loader;
@Autowired ResourcePatternResolver resolver;

void demo() throws IOException {
    Resource one = loader.getResource("classpath:application.properties");
    Resource[] sql = resolver.getResources("classpath*:db/*.sql");
    System.out.println(one.exists() + " " + sql.length);
}

// OUTPUT:
// true 3`]],
        [['Resource types.',
            r`Resource a = new ClassPathResource("data/seed.txt");
Resource b = new FileSystemResource("/tmp/out.txt");
Resource c = new ByteArrayResource("abc".getBytes());
System.out.println(a.getFilename() + " " + c.contentLength());

// OUTPUT:
// seed.txt 3`],
            ['Test with a test resource.',
                r`@SpringBootTest
class SeedReaderTest {
    @Autowired SeedReader reader;

    @Test
    void readsSeed() throws Exception {
        assertEquals("hello from seed.txt", reader.read().trim());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-responseentity-resource': x(
        ['<b>ResponseEntity&lt;Resource&gt;</b> returns a file or stream together with the status code and headers you choose.',
            '<b>Why it fits downloads</b>: you control <code>Content-Type</code>, <code>Content-Disposition</code>, <code>Content-Length</code> and caching headers, plus 404 for missing files.',
            '<b>Build with</b> <code>ResponseEntity.ok().headers(...).contentType(...).body(resource)</code>.'],
        ['<b>Converter</b>: <code>ResourceHttpMessageConverter</code> writes the resource, and <code>ResourceRegionHttpMessageConverter</code> serves ranges (206 Partial Content).',
            '<b>Content length</b> is taken from <code>resource.contentLength()</code>, so use <code>FileSystemResource</code> or <code>UrlResource</code> rather than <code>InputStreamResource</code>.',
            '<b>Range requests</b> work automatically when the body is a <code>Resource</code> and the client sends <code>Range</code>.'],
        ['<b>Missing file</b>: check <code>resource.exists() &amp;&amp; resource.isReadable()</code> and return <code>ResponseEntity.notFound().build()</code>.',
            '<b>Name encoding</b>: <code>ContentDisposition.filename(name, UTF_8)</code> handles non-ASCII names with the right encoding.',
            '<b>Caching</b>: add <code>cacheControl(CacheControl.maxAge(...))</code> and <code>eTag</code> for static downloads.'],
        [['F', 'Why ResponseEntity instead of returning Resource directly?', 'ResponseEntity lets you set status and headers such as Content-Disposition.'],
            ['F', 'How do you return 404?', 'ResponseEntity.notFound().build().'],
            ['M', 'Which header gives the file name to the browser?', 'Content-Disposition with filename.'],
            ['M', 'Which Resource type suits a file on disk?', 'FileSystemResource or UrlResource built from the path.'],
            ['S', 'How is partial content supported?', 'When the body is a Resource, Spring handles the Range header and answers 206 using the region converter.'],
            ['S', 'Why avoid InputStreamResource for downloads?', 'It has no length and can be read once, so Content-Length is missing and ranges do not work.']],
        [['Full download method.',
            r`@GetMapping("/docs/{name}")
ResponseEntity<Resource> doc(@PathVariable String name) {
    Resource res = new FileSystemResource(Path.of("docs", name));
    if (!res.exists() || !res.isReadable()) {
        return ResponseEntity.notFound().build();
    }
    MediaType type = MediaTypeFactory.getMediaType(res)
            .orElse(MediaType.APPLICATION_OCTET_STREAM);
    return ResponseEntity.ok()
        .contentType(type)
        .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                .filename(name, StandardCharsets.UTF_8).build().toString())
        .body(res);
}

// OUTPUT:
// GET /docs/guide.pdf -> 200 Content-Type: application/pdf
// GET /docs/none.pdf  -> 404`],
            ['Inline display with cache.',
                r`@GetMapping("/logo")
ResponseEntity<Resource> logo() {
    Resource res = new ClassPathResource("static/logo.png");
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS))
        .contentType(MediaType.IMAGE_PNG)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
        .body(res);
}

// OUTPUT:
// Cache-Control: max-age=86400
// Content-Type: image/png`]],
        [['Generated content with ByteArrayResource.',
            r`@GetMapping("/report")
ResponseEntity<Resource> report() {
    byte[] bytes = "total=42".getBytes(StandardCharsets.UTF_8);
    return ResponseEntity.ok()
        .contentLength(bytes.length)
        .contentType(MediaType.TEXT_PLAIN)
        .body(new ByteArrayResource(bytes));
}

// OUTPUT:
// Content-Length: 8
// total=42`],
            ['Test a range request.',
                r`@Test
void servesRange() throws Exception {
    mvc.perform(get("/docs/guide.txt").header("Range", "bytes=0-4"))
       .andExpect(status().isPartialContent())
       .andExpect(header().string("Content-Range", startsWith("bytes 0-4/")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-large-file-handling': x(
        ['<b>Large files</b> must be handled as streams, because loading a whole file into a <code>byte[]</code> can exhaust the heap.',
            '<b>Upload side</b>: use <code>getInputStream()</code> and copy in chunks, or <code>transferTo()</code>, never <code>getBytes()</code>.',
            '<b>Download side</b>: return a <code>Resource</code> or <code>StreamingResponseBody</code> so data flows from disk to socket in small buffers.'],
        ['<b>Multipart temp files</b>: parts above <code>spring.servlet.multipart.file-size-threshold</code> go to disk; set <code>location</code> to a disk with enough space.',
            '<b>Limits</b>: raise <code>max-file-size</code> and <code>max-request-size</code> deliberately, and match proxy limits.',
            '<b>Chunked or resumable</b> uploads split a file into pieces that the client sends one by one and the server joins.'],
        ['<b>Bypass multipart parsing</b>: for very big uploads, accept the raw body (<code>InputStream</code> or <code>HttpServletRequest</code>) with <code>PUT</code> and stream it to storage.',
            '<b>Offload</b>: let clients upload straight to object storage with a pre-signed URL, so your app does not carry the bytes.',
            '<b>Timeouts and threads</b>: slow clients hold a request thread; use async handling, timeouts and a bounded pool.'],
        [['F', 'Why not use getBytes() for a 2GB file?', 'It loads everything into memory and can cause OutOfMemoryError.'],
            ['F', 'What is the safe way to copy an upload?', 'Stream it with transferTo() or Files.copy(getInputStream(), path).'],
            ['M', 'What does file-size-threshold do?', 'Parts bigger than it are written to a temp file instead of being kept in memory.'],
            ['M', 'How do you serve a large file efficiently?', 'Return a Resource or StreamingResponseBody so it is streamed with a small buffer.'],
            ['S', 'What is a chunked upload?', 'The client sends the file as numbered pieces; the server stores them and merges after the last one, allowing resume.'],
            ['S', 'How can you avoid proxying big files through your app?', 'Issue a pre-signed URL so the client uploads or downloads directly with object storage.']],
        [['Stream an upload to disk.',
            r`@PostMapping("/big")
ResponseEntity<String> big(@RequestParam("file") MultipartFile file)
        throws IOException {
    Path target = Path.of("storage", UUID.randomUUID().toString());
    try (InputStream in = file.getInputStream()) {
        long n = Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        return ResponseEntity.ok("stored " + n + " bytes");
    }
}

// OUTPUT:
// stored 524288000 bytes`],
            ['Raw body upload with PUT.',
                r`@PutMapping("/raw/{name}")
ResponseEntity<Void> raw(@PathVariable String name, HttpServletRequest req)
        throws IOException {
    Path target = Path.of("storage").resolve(UUID.randomUUID() + ".part");
    try (InputStream in = req.getInputStream()) {
        Files.copy(in, target);       // no multipart parsing, constant memory
    }
    return ResponseEntity.status(HttpStatus.CREATED).build();
}

// OUTPUT:
// curl -T video.mp4 http://localhost:8080/raw/video.mp4
// HTTP/1.1 201`]],
        [['Stream a large download in chunks.',
            r`@GetMapping("/video")
ResponseEntity<StreamingResponseBody> video() {
    StreamingResponseBody body = out -> {
        try (InputStream in = Files.newInputStream(Path.of("storage/video.mp4"))) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
        }
    };
    return ResponseEntity.ok().contentType(MediaType.valueOf("video/mp4")).body(body);
}

// OUTPUT:
// Memory use stays near 8 KB buffer size, whatever the file size`],
            ['Properties for large uploads.',
                r`# application.properties
spring.servlet.multipart.max-file-size=2GB
spring.servlet.multipart.max-request-size=2GB
spring.servlet.multipart.file-size-threshold=2MB
spring.servlet.multipart.location=/data/tmp

# OUTPUT:
# Parts above 2MB spool to /data/tmp, then are removed after the request`]]
    )
};

export const smvc24Deep: Record<string, Deep> = {
    'mvc-file-upload': dv(
        [`<p>How a multipart upload flows through Spring MVC:</p><ul><li><b>Request:</b> the browser sends <code>multipart/form-data</code> with a boundary string; each field or file is one part.</li><li><b>Parsing:</b> <code>DispatcherServlet.checkMultipart</code> asks the <code>MultipartResolver</code> (Boot: <code>StandardServletMultipartResolver</code>) to wrap the request in a <code>MultipartHttpServletRequest</code>.</li><li><b>Container:</b> the servlet container (Tomcat) parses the parts and decides memory or temp file by <code>file-size-threshold</code>.</li><li><b>Binding:</b> <code>RequestParamMethodArgumentResolver</code> or <code>RequestPartMethodArgumentResolver</code> gives the controller a <code>MultipartFile</code>.</li><li><b>Cleanup:</b> after the response, <code>cleanupMultipart</code> deletes temp files.</li></ul>`,
            r`@PostMapping("/inspect")
String inspect(@RequestParam("file") MultipartFile file,
               HttpServletRequest request) {
    // the request is wrapped by the resolver
    boolean wrapped = request instanceof MultipartHttpServletRequest
            || WebUtils.getNativeRequest(request, MultipartHttpServletRequest.class) != null;
    return file.getClass().getSimpleName() + " wrapped=" + wrapped;
}

// OUTPUT: (varies by container)
// StandardMultipartFile wrapped=true`],
        [`<p>Binding variants for uploads:</p><ul><li><b>@RequestParam:</b> file by part name.</li><li><b>@RequestPart:</b> a part with its own content type, such as JSON read by a message converter.</li><li><b>@ModelAttribute:</b> a form object with a <code>MultipartFile</code> field.</li><li><b>Optional:</b> <code>required = false</code> or <code>Optional&lt;MultipartFile&gt;</code> for a skipped input.</li><li><b>Part:</b> the servlet type <code>jakarta.servlet.http.Part</code> also works.</li></ul>`,
            r`record UserMeta(String name, String email) {}

@PostMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
String profile(@RequestPart("meta") UserMeta meta,
               @RequestPart(value = "photo", required = false) MultipartFile photo) {
    return meta.name() + " photo=" + (photo != null && !photo.isEmpty());
}

// OUTPUT:
// curl -F 'meta={"name":"Abaji","email":"a@x.com"};type=application/json' \
//      -F "photo=@me.png" http://localhost:8080/profile
// Abaji photo=true`],
        [`<p>Typical upload mistakes:</p><ul><li><b>Missing enctype:</b> the form sends text only, so the file is null or empty. Fix: add <code>enctype="multipart/form-data"</code>.</li><li><b>Wrong part name:</b> <code>MissingServletRequestPartException</code>; match the <code>name</code> attribute.</li><li><b>Relative path with transferTo:</b> it resolves against the temp directory in some containers; use an absolute path.</li><li><b>Using the original name as the path:</b> traversal risk.</li><li><b>Reading the file twice:</b> <code>getInputStream()</code> can be called again, but save once and reuse the stored copy.</li><li><b>Setting Content-Type header by hand in a client:</b> the boundary is then missing.</li></ul>`,
            r`// WRONG: client controlled name and relative path
file.transferTo(new File(file.getOriginalFilename()));

// RIGHT: fixed folder, generated name, absolute path
Path dir = Path.of("/data/uploads").toAbsolutePath().normalize();
Path target = dir.resolve(UUID.randomUUID() + ".dat");
file.transferTo(target);

// OUTPUT:
// WRONG case may write outside the intended folder or fail with FileNotFoundException
// RIGHT case writes /data/uploads/<uuid>.dat`],
        [`<p>Tuning uploads:</p><ul><li><b>Threshold:</b> keep <code>file-size-threshold</code> small enough to protect heap, large enough to avoid disk for tiny files.</li><li><b>Streaming:</b> copy with <code>Files.copy</code> rather than reading all bytes.</li><li><b>Temp disk:</b> put <code>location</code> on fast storage with space.</li><li><b>Thread usage:</b> uploads hold a request thread for the whole transfer, so use timeouts.</li><li><b>Compression:</b> do not gzip already compressed formats such as JPEG or ZIP.</li></ul>`,
            r`long t = System.nanoTime();
try (InputStream in = file.getInputStream()) {
    Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
}
log.info("saved {} bytes in {} ms", file.getSize(),
        (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// saved 10485760 bytes in 38 ms`],
        [`<p>Real-world scenario: a profile photo endpoint. It should check size and type, store the image under a generated name, save only the generated name in the database, and serve it later through a controlled download endpoint.</p><ul><li><b>Service:</b> validate, store, return a public id.</li><li><b>Database:</b> keep id, original name, type, size and path.</li><li><b>Serving:</b> by id, never by path.</li></ul>`,
            r`@Service
class PhotoService {
    private final Path root = Path.of("/data/photos");

    String save(MultipartFile f) throws IOException {
        if (f.isEmpty() || f.getSize() > 2_000_000
                || !List.of("image/png", "image/jpeg").contains(f.getContentType())) {
            throw new IllegalArgumentException("Invalid photo");
        }
        String id = UUID.randomUUID().toString();
        Files.createDirectories(root);
        f.transferTo(root.resolve(id));
        return id;
    }
}

// OUTPUT:
// POST /photos -> 201 {"id":"3f1c...-9a"} (varies)`]
    ),
    'mvc-multiple-file-upload': dv(
        [`<p>Internally every file is its own part in the multipart body.</p><ul><li><b>Parsing:</b> the container produces a list of <code>Part</code> objects; the resolver converts them into a <code>MultiValueMap&lt;String, MultipartFile&gt;</code>.</li><li><b>Binding:</b> for <code>List&lt;MultipartFile&gt;</code> or arrays, <code>RequestParamMethodArgumentResolver</code> reads <code>getFiles(name)</code>.</li><li><b>Order:</b> files keep the order sent by the client.</li><li><b>Temp files:</b> each part over the threshold has its own temp file, all removed at the end.</li></ul>`,
            r`@PostMapping("/by-name")
Map<String, Integer> byName(MultipartHttpServletRequest request) {
    Map<String, Integer> counts = new LinkedHashMap<>();
    request.getMultiFileMap().forEach((name, files) -> counts.put(name, files.size()));
    return counts;
}

// OUTPUT:
// curl -F "docs=@a.pdf" -F "docs=@b.pdf" -F "images=@c.png" .../by-name
// {"docs":2,"images":1}`],
        [`<p>Ways to bind several files:</p><ul><li><b>List or array</b> with one shared name.</li><li><b>Map:</b> <code>@RequestParam Map&lt;String, MultipartFile&gt;</code> gets one file per distinct name.</li><li><b>MultiValueMap:</b> all files grouped by name.</li><li><b>Form object:</b> a field <code>List&lt;MultipartFile&gt; files</code> with <code>@ModelAttribute</code>.</li><li><b>Different names:</b> separate parameters, such as <code>cv</code> and <code>photo</code>.</li></ul>`,
            r`@PostMapping("/map")
List<String> map(@RequestParam Map<String, MultipartFile> files) {
    return files.entrySet().stream()
        .map(e -> e.getKey() + "=" + e.getValue().getOriginalFilename())
        .toList();
}

@PostMapping("/multi")
String multi(@RequestParam MultiValueMap<String, MultipartFile> all) {
    return all.keySet() + " " + all.values().stream().mapToInt(List::size).sum();
}

// OUTPUT:
// /map   -> ["cv=cv.pdf","photo=me.png"]
// /multi -> [docs, images] 3`],
        [`<p>Common mistakes:</p><ul><li><b>Using Map&lt;String, MultipartFile&gt; with a shared name:</b> only one file per name is kept; use a list.</li><li><b>Not skipping empty slots:</b> a blank input still sends an empty part.</li><li><b>Total limit confusion:</b> each file passes <code>max-file-size</code> yet the request fails on <code>max-request-size</code>.</li><li><b>One failure leaves earlier files saved.</b> Track saved paths and delete them in a catch block.</li></ul>`,
            r`List<Path> saved = new ArrayList<>();
try {
    for (MultipartFile f : files) {
        if (f.isEmpty()) continue;
        Path p = root.resolve(UUID.randomUUID().toString());
        f.transferTo(p);
        saved.add(p);
    }
} catch (IOException e) {
    for (Path p : saved) Files.deleteIfExists(p);   // roll back
    throw new UncheckedIOException(e);
}

// OUTPUT:
// If file 3 fails, files 1 and 2 are deleted and the client gets an error`],
        [`<p>Performance tips for batches:</p><ul><li><b>Cap the count</b> to bound work per request.</li><li><b>Parallel saves</b> help only with slow storage; disk copies are usually IO bound.</li><li><b>Stream each file</b> instead of reading bytes.</li><li><b>Return early</b> with a job id for heavy processing such as thumbnails, then process in the background.</li></ul>`,
            r`@PostMapping("/batch")
ResponseEntity<Map<String, Object>> batch(@RequestParam("files") List<MultipartFile> files) {
    if (files.size() > 20) return ResponseEntity.badRequest().build();
    String jobId = UUID.randomUUID().toString();
    // store raw files quickly, process thumbnails later
    return ResponseEntity.accepted().body(Map.of("jobId", jobId, "files", files.size()));
}

// OUTPUT:
// HTTP/1.1 202
// {"jobId":"b7d1...","files":5} (varies)`],
        [`<p>Real-world scenario: a document portal where a user attaches several PDFs to a claim. The API returns a result per file so the UI can show which ones succeeded.</p><ul><li><b>Result record:</b> name, status, message.</li><li><b>Status:</b> 207-style body or 200 with details.</li></ul>`,
            r`record FileResult(String name, boolean ok, String message) {}

@PostMapping("/claims/{id}/docs")
List<FileResult> attach(@PathVariable long id,
                        @RequestParam("files") List<MultipartFile> files) {
    return files.stream().map(f -> {
        if (f.isEmpty()) return new FileResult(f.getOriginalFilename(), false, "empty");
        if (!"application/pdf".equals(f.getContentType()))
            return new FileResult(f.getOriginalFilename(), false, "not a PDF");
        return new FileResult(f.getOriginalFilename(), true, "stored");
    }).toList();
}

// OUTPUT:
// [{"name":"a.pdf","ok":true,"message":"stored"},
//  {"name":"b.png","ok":false,"message":"not a PDF"}]`]
    ),
    'mvc-file-validation': dv(
        [`<p>How validation fits the request lifecycle:</p><ul><li><b>Before the controller:</b> the container and resolver enforce size limits.</li><li><b>Argument resolution:</b> a null or missing part raises <code>MissingServletRequestPartException</code> unless optional.</li><li><b>Bean Validation:</b> with <code>@Valid</code> on a model object, a custom constraint on a <code>MultipartFile</code> field runs through <code>ConstraintValidator</code>.</li><li><b>Method validation:</b> with <code>@Validated</code> on the controller class, constraints on parameters are checked by an AOP proxy and raise <code>ConstraintViolationException</code> (Spring 6.1 also has built-in method validation raising <code>HandlerMethodValidationException</code>).</li></ul>`,
            r`@RestControllerAdvice
class ValidationAdvice {
    @ExceptionHandler(MissingServletRequestPartException.class)
    ResponseEntity<String> missing(MissingServletRequestPartException e) {
        return ResponseEntity.badRequest().body("Missing part: " + e.getRequestPartName());
    }
}

// OUTPUT:
// POST /upload without a file part
// HTTP/1.1 400  Missing part: file`],
        [`<p>Validation options:</p><ul><li><b>Manual checks</b> in a service: simple and explicit.</li><li><b>Custom annotation</b> with <code>ConstraintValidator</code>: reusable, with attributes such as max size or allowed types.</li><li><b>Spring Validator</b> interface for form pages with <code>BindingResult</code>.</li><li><b>Library:</b> Apache Tika for content detection.</li></ul>`,
            r`@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SizeAndTypeValidator.class)
@interface UploadRules {
    String message() default "Invalid upload";
    long maxBytes() default 1_000_000;
    String[] types() default {};
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

class SizeAndTypeValidator implements ConstraintValidator<UploadRules, MultipartFile> {
    private UploadRules rules;
    public void initialize(UploadRules a) { this.rules = a; }
    public boolean isValid(MultipartFile f, ConstraintValidatorContext ctx) {
        if (f == null || f.isEmpty()) return false;
        return f.getSize() <= rules.maxBytes()
            && Arrays.asList(rules.types()).contains(f.getContentType());
    }
}

// OUTPUT:
// @UploadRules(maxBytes = 500000, types = {"image/png"}) MultipartFile photo`],
        [`<p>Mistakes and fixes:</p><ul><li><b>Trusting browser accept:</b> add server checks.</li><li><b>Checking only content type:</b> add magic byte or Tika detection.</li><li><b>Forgetting @Valid:</b> the custom constraint never runs.</li><li><b>Leaking internal paths in error messages:</b> return short generic messages.</li><li><b>Dropping the check after refactoring:</b> cover with tests.</li></ul>`,
            r`class FormModel {
    @UploadRules(maxBytes = 500_000, types = {"image/png"})
    MultipartFile photo;
}

@PostMapping("/form")
String form(@Valid @ModelAttribute FormModel form, BindingResult result) {
    return result.hasErrors() ? "error: " + result.getFieldError("photo").getDefaultMessage()
                              : "ok";
}

// OUTPUT:
// empty photo -> error: Invalid upload
// valid png   -> ok`],
        [`<p>Performance: validation should be cheap and happen before expensive work.</p><ul><li><b>Order checks:</b> empty, size, declared type, then content sniffing.</li><li><b>Read few bytes:</b> magic numbers need only the first bytes, not the whole file.</li><li><b>Avoid re-reading:</b> pass the verified stream or path on.</li></ul>`,
            r`static String sniff(MultipartFile f) throws IOException {
    try (InputStream in = f.getInputStream()) {
        byte[] h = in.readNBytes(8);
        if (h.length >= 4 && h[0] == (byte) 0x89 && h[1] == 'P') return "image/png";
        if (h.length >= 4 && h[0] == '%' && h[1] == 'P' && h[2] == 'D') return "application/pdf";
        if (h.length >= 3 && h[0] == (byte) 0xFF && h[1] == (byte) 0xD8) return "image/jpeg";
        return "unknown";
    }
}

// OUTPUT:
// sniff(png) -> image/png   (reads 8 bytes only)`],
        [`<p>Real-world scenario: KYC document upload. Rules: PDF or JPEG, up to 5MB, detected from content, stored with a generated name, and every rejection logged with the reason (not the file content).</p><ul><li><b>Layers:</b> properties for hard limits, a validator for rules, an advice class for the response shape.</li></ul>`,
            r`@Service
class KycUploadService {
    private static final Logger log = LoggerFactory.getLogger(KycUploadService.class);

    void check(MultipartFile f) throws IOException {
        String real = sniff(f);
        if (!Set.of("application/pdf", "image/jpeg").contains(real)) {
            log.warn("rejected upload: detected={}, declared={}", real, f.getContentType());
            throw new IllegalArgumentException("Only PDF or JPEG allowed");
        }
        if (f.getSize() > 5_000_000) {
            throw new IllegalArgumentException("Max 5MB");
        }
    }
}

// OUTPUT:
// WARN rejected upload: detected=unknown, declared=application/pdf`]
    ),
    'mvc-file-size-validation': dv(
        [`<p>Where the size limit is enforced:</p><ul><li><b>Servlet container:</b> Spring Boot turns the properties into a <code>MultipartConfigElement</code> given to the <code>DispatcherServlet</code> registration; Tomcat counts bytes while parsing.</li><li><b>On breach:</b> the container throws <code>IllegalStateException</code>, which <code>StandardServletMultipartResolver</code> wraps as <code>MaxUploadSizeExceededException</code>.</li><li><b>Timing:</b> parsing is lazy by default in the standard resolver, so the exception can appear when the argument is resolved.</li><li><b>Tomcat extras:</b> <code>maxSwallowSize</code> controls how much of an aborted body it reads.</li></ul>`,
            r`@Bean
MultipartConfigElement multipartConfig() {
    MultipartConfigFactory f = new MultipartConfigFactory();
    f.setMaxFileSize(DataSize.ofMegabytes(2));
    f.setMaxRequestSize(DataSize.ofMegabytes(6));
    f.setFileSizeThreshold(DataSize.ofKilobytes(512));
    return f.createMultipartConfig();
}

// OUTPUT:
// Equivalent to the three spring.servlet.multipart properties`],
        [`<p>Size units and options:</p><ul><li><b>Properties:</b> <code>1MB</code>, <code>512KB</code>, <code>2GB</code>, or plain bytes; <code>-1</code> means no limit.</li><li><b>Unit helper:</b> <code>DataSize.ofMegabytes(2).toBytes()</code>.</li><li><b>Per-endpoint limit:</b> compare <code>getSize()</code> to a configured constant.</li><li><b>Type specific:</b> small for avatars, bigger for videos.</li><li><b>Custom property:</b> bind with <code>@ConfigurationProperties</code> for easy changes.</li></ul>`,
            r`@ConfigurationProperties(prefix = "app.upload")
record UploadProps(DataSize avatarMax, DataSize videoMax) {}

@Service
class SizePolicy {
    private final UploadProps props;
    SizePolicy(UploadProps props) { this.props = props; }

    void checkAvatar(MultipartFile f) {
        if (f.getSize() > props.avatarMax().toBytes()) {
            throw new IllegalArgumentException("Avatar too large");
        }
    }
}

# OUTPUT:
# app.upload.avatar-max=2MB  app.upload.video-max=200MB`],
        [`<p>Mistakes:</p><ul><li><b>Raising only the Spring limit:</b> a proxy still returns 413; raise nginx <code>client_max_body_size</code> too.</li><li><b>Handler not applied:</b> the exception is thrown before binding, so make sure the advice class is a bean.</li><li><b>Confusing KB and MB strings:</b> <code>1M</code> and <code>1MB</code> both parse, but be explicit.</li><li><b>Returning 500:</b> unhandled <code>MaxUploadSizeExceededException</code> gives a generic error.</li></ul>`,
            r`@RestControllerAdvice
class UploadAdvice {
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ProblemDetail> tooLarge(MaxUploadSizeExceededException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.PAYLOAD_TOO_LARGE, "Upload exceeds the allowed size");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(pd);
    }
}

// OUTPUT:
// HTTP/1.1 413
// {"type":"about:blank","title":"Payload Too Large","status":413,
//  "detail":"Upload exceeds the allowed size"}`],
        [`<p>Performance and safety:</p><ul><li><b>Reject early:</b> a <code>Content-Length</code> check at the proxy saves bandwidth.</li><li><b>Streaming limit:</b> for raw bodies, wrap the stream with a counting guard (Apache Commons IO <code>BoundedInputStream</code> or your own) so a lying client cannot send more.</li><li><b>Quota:</b> also limit total storage per user.</li></ul>`,
            r`static long copyLimited(InputStream in, Path target, long max) throws IOException {
    try (OutputStream out = Files.newOutputStream(target)) {
        byte[] buf = new byte[8192];
        long total = 0;
        int n;
        while ((n = in.read(buf)) != -1) {
            total += n;
            if (total > max) throw new IOException("Limit exceeded");
            out.write(buf, 0, n);
        }
        return total;
    }
}

// OUTPUT:
// copyLimited(5 MB stream, max 2 MB) -> IOException: Limit exceeded`],
        [`<p>Real-world scenario: an image gallery with an avatar limit of 2MB and a gallery photo limit of 10MB, behind nginx. Configure container limits at the larger value, enforce the small limit in code, and set the proxy limit slightly above the container limit.</p>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=12MB
app.upload.avatar-max=2MB

# nginx
# client_max_body_size 12m;

# OUTPUT:
# avatar 3MB  -> 400 Avatar too large (from code)
# photo 11MB  -> 413 (from Spring)
# photo 13MB  -> 413 (from nginx)`]
    ),
    'mvc-file-type-validation': dv(
        [`<p>How type information reaches you:</p><ul><li><b>Part header:</b> the client writes <code>Content-Type</code> inside each part; the container exposes it via <code>Part.getContentType()</code> and Spring via <code>MultipartFile.getContentType()</code>.</li><li><b>Not verified:</b> neither the container nor Spring inspects bytes.</li><li><b>File name:</b> <code>getOriginalFilename()</code> is also client supplied.</li><li><b>Detection:</b> only your code (magic bytes, Tika, <code>URLConnection.guessContentTypeFromStream</code>) knows the real format.</li></ul>`,
            r`static String detect(MultipartFile f) throws IOException {
    try (InputStream in = new BufferedInputStream(f.getInputStream())) {
        String guess = URLConnection.guessContentTypeFromStream(in);
        return guess != null ? guess : "unknown";
    }
}

// OUTPUT:
// detect(real png)        -> image/png
// detect(text named .png) -> unknown`],
        [`<p>Allow-list styles:</p><ul><li><b>Set of MIME types</b> for simple cases.</li><li><b>Extension map:</b> extension to expected MIME type, compare both.</li><li><b>Tika:</b> <code>new Tika().detect(inputStream)</code> covers hundreds of formats.</li><li><b>Annotation attributes:</b> <code>types</code> in a custom constraint.</li><li><b>MediaType matching:</b> <code>MediaType.IMAGE_PNG.includes(parsed)</code> or wildcards like <code>image/*</code>.</li></ul>`,
            r`static final Map<String, String> EXT_TO_TYPE = Map.of(
        "png", "image/png", "jpg", "image/jpeg", "pdf", "application/pdf");

static boolean consistent(MultipartFile f, String detected) {
    String name = Objects.requireNonNullElse(f.getOriginalFilename(), "");
    String ext = StringUtils.getFilenameExtension(name);
    return ext != null
        && detected.equals(EXT_TO_TYPE.get(ext.toLowerCase(Locale.ROOT)));
}

// OUTPUT:
// consistent(photo.png, image/png) -> true
// consistent(photo.png, image/gif) -> false`],
        [`<p>Mistakes:</p><ul><li><b>Block-list:</b> attackers use a type you forgot; use an allow-list.</li><li><b>Case sensitivity:</b> <code>.PNG</code> versus <code>.png</code>; lower-case with <code>Locale.ROOT</code>.</li><li><b>Double extension:</b> <code>shell.php.png</code> may be executed by a misconfigured server; rename on store.</li><li><b>Serving user files from your own origin</b> with their own type allows stored XSS (an uploaded HTML or SVG); serve from a separate domain or force download.</li><li><b>SVG:</b> it is XML that can hold scripts; avoid or sanitize.</li></ul>`,
            r`// SAFE: ignore client name and extension, derive both from the detected type
String detected = detect(file);                      // e.g. image/png
String ext = switch (detected) {
    case "image/png" -> "png";
    case "image/jpeg" -> "jpg";
    default -> throw new IllegalArgumentException("Unsupported type");
};
Path target = root.resolve(UUID.randomUUID() + "." + ext);

// OUTPUT:
// shell.php (declared image/png, real script) -> IllegalArgumentException`],
        [`<p>Performance:</p><ul><li><b>Read only the header:</b> magic numbers need a few bytes.</li><li><b>Tika:</b> reuse one <code>Tika</code> instance, it is thread safe.</li><li><b>Image decoding</b> for re-encoding costs CPU; do it only for images that are shown to others, and limit dimensions to avoid decompression bombs.</li></ul>`,
            r`private static final Tika TIKA = new Tika();     // reuse, thread safe

static String realType(MultipartFile f) throws IOException {
    try (InputStream in = f.getInputStream()) {
        return TIKA.detect(in);
    }
}

BufferedImage img = ImageIO.read(file.getInputStream());
if (img == null || img.getWidth() > 6000 || img.getHeight() > 6000) {
    throw new IllegalArgumentException("Not an image or too large");
}

// OUTPUT:
// realType(png) -> image/png
// 20000x20000 image -> IllegalArgumentException`],
        [`<p>Real-world scenario: a resume upload that accepts PDF and DOCX only. The service detects the type, compares it with an allow-list, stores under a generated name and returns 415 for everything else.</p>`,
            r`@Service
class ResumeService {
    private static final Set<String> OK = Set.of(
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    String store(MultipartFile f) throws IOException {
        String type = realType(f);
        if (!OK.contains(type)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Only PDF or DOCX");
        }
        String id = UUID.randomUUID().toString();
        f.transferTo(Path.of("/data/resumes").resolve(id));
        return id;
    }
}

// OUTPUT:
// .exe renamed to .pdf -> 415 Only PDF or DOCX`]
    ),
    'mvc-file-download': dv(
        [`<p>What happens on a download request:</p><ul><li><b>Mapping:</b> <code>RequestMappingHandlerMapping</code> finds the method; <code>RequestMappingHandlerAdapter</code> calls it.</li><li><b>Return value:</b> <code>HttpEntityMethodProcessor</code> handles <code>ResponseEntity</code>, writes status and headers, then picks a converter for the body.</li><li><b>Converter:</b> <code>ResourceHttpMessageConverter</code> copies the resource stream to the response output stream in a buffer; content type defaults from the file name if not given.</li><li><b>Ranges:</b> if a <code>Range</code> header exists and the body is a <code>Resource</code>, the entity processor converts to <code>ResourceRegion</code> and replies 206.</li></ul>`,
            r`@GetMapping("/inspect-download")
ResponseEntity<Resource> inspect() {
    Resource res = new ClassPathResource("static/sample.txt");
    return ResponseEntity.ok().body(res);
}

// OUTPUT:
// HTTP/1.1 200
// Content-Type: text/plain          (guessed from the .txt name)
// Content-Length: 12
// Accept-Ranges: bytes`],
        [`<p>Ways to send a file:</p><ul><li><b>ResponseEntity&lt;Resource&gt;:</b> best default.</li><li><b>byte[]:</b> only for small content.</li><li><b>StreamingResponseBody:</b> for generated or huge output.</li><li><b>HttpServletResponse:</b> manual control, return void.</li><li><b>Static handler:</b> <code>ResourceHandlerRegistry</code> maps a URL to a folder without a controller.</li><li><b>Disposition:</b> <code>attachment</code> versus <code>inline</code>.</li></ul>`,
            r`@Configuration
class StaticConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/public-files/**")
                .addResourceLocations("file:/data/public/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));
    }
}

@GetMapping("/legacy")
void legacy(HttpServletResponse resp) throws IOException {
    resp.setContentType("text/plain");
    resp.setHeader("Content-Disposition", "attachment; filename=legacy.txt");
    resp.getWriter().write("old style");
}

// OUTPUT:
// GET /public-files/logo.png -> served from /data/public/logo.png
// GET /legacy -> attachment legacy.txt`],
        [`<p>Mistakes:</p><ul><li><b>Path traversal:</b> never concatenate user input into a path; normalize and check.</li><li><b>Wrong filename encoding:</b> non-ASCII names break; use <code>ContentDisposition</code>.</li><li><b>Loading bytes for big files:</b> use <code>Resource</code>.</li><li><b>Returning 500 for missing files:</b> return 404.</li><li><b>Header injection:</b> a name with a newline; the builder encodes it, manual strings may not.</li><li><b>Authorization:</b> checking login but not ownership of the file.</li></ul>`,
            r`// WRONG: manual header, user name inside, no ownership check
// resp.setHeader("Content-Disposition", "attachment; filename=" + name);

// RIGHT
ContentDisposition cd = ContentDisposition.attachment()
        .filename("rapport-été.pdf", StandardCharsets.UTF_8).build();
System.out.println(cd);

// OUTPUT:
// attachment; filename*=UTF-8''rapport-%C3%A9t%C3%A9.pdf`],
        [`<p>Performance:</p><ul><li><b>Zero copy:</b> the servlet container may use <code>sendfile</code> for static files.</li><li><b>HTTP caching:</b> <code>ETag</code>, <code>Last-Modified</code> and <code>Cache-Control</code> avoid repeat transfers; <code>ShallowEtagHeaderFilter</code> adds ETags but needs the full body in memory.</li><li><b>Compression:</b> not for already compressed files.</li><li><b>CDN:</b> offload public files.</li></ul>`,
            r`@GetMapping("/asset/{name}")
ResponseEntity<Resource> asset(@PathVariable String name) throws IOException {
    Path p = Path.of("assets").resolve(name).normalize();
    Resource res = new FileSystemResource(p);
    return ResponseEntity.ok()
        .lastModified(res.lastModified())
        .eTag("\"" + res.lastModified() + "-" + res.contentLength() + "\"")
        .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
        .body(res);
}

// OUTPUT:
// 1st request -> 200 with ETag
// next request with If-None-Match -> 304 Not Modified`],
        [`<p>Real-world scenario: invoice PDFs. The user must be logged in and must own the invoice; the file is found by invoice id (not by a path) and sent as attachment.</p>`,
            r`@GetMapping("/invoices/{id}/pdf")
ResponseEntity<Resource> invoice(@PathVariable long id, Principal user) {
    Invoice inv = invoices.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (!inv.getOwner().equals(user.getName())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }
    Resource res = new FileSystemResource(inv.getStoredPath());
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                .filename("invoice-" + id + ".pdf").build().toString())
        .body(res);
}

// OUTPUT:
// owner     -> 200 application/pdf
// other user -> 403
// unknown id -> 404`]
    ),
    'mvc-streaming-response': dv(
        [`<p>How a StreamingResponseBody request runs:</p><ul><li><b>Return handler:</b> <code>StreamingResponseBodyReturnValueHandler</code> wraps the body in a <code>WebAsyncTask</code>.</li><li><b>Async start:</b> <code>startAsync()</code> is called on the servlet request, so the container thread is released.</li><li><b>Worker thread:</b> a <code>TaskExecutor</code> runs <code>writeTo(outputStream)</code>; output goes directly to the servlet response.</li><li><b>Completion:</b> when <code>writeTo</code> returns, Spring completes the async context; on error it dispatches an error.</li><li><b>Timeout:</b> <code>spring.mvc.async.request-timeout</code> (default depends on the container) ends a slow stream.</li></ul>`,
            r`@GetMapping("/where")
StreamingResponseBody where() {
    String requestThread = Thread.currentThread().getName();
    return out -> {
        String worker = Thread.currentThread().getName();
        out.write((requestThread + " -> " + worker).getBytes());
    };
}

// OUTPUT: (varies)
// http-nio-8080-exec-1 -> task-1`],
        [`<p>Streaming options:</p><ul><li><b>StreamingResponseBody:</b> raw bytes.</li><li><b>ResponseBodyEmitter:</b> many objects, written as JSON items over time.</li><li><b>SseEmitter:</b> <code>text/event-stream</code> for browsers.</li><li><b>Flux (WebFlux):</b> reactive streaming, a separate stack.</li><li><b>Servlet output stream:</b> synchronous writing in the request thread.</li></ul>`,
            r`@GetMapping("/progress")
ResponseBodyEmitter progress() {
    ResponseBodyEmitter emitter = new ResponseBodyEmitter();
    Executors.newSingleThreadExecutor().submit(() -> {
        try {
            for (int pct = 25; pct <= 100; pct += 25) {
                emitter.send(Map.of("progress", pct));
                Thread.sleep(500);
            }
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    });
    return emitter;
}

// OUTPUT:
// {"progress":25}{"progress":50}{"progress":75}{"progress":100}`],
        [`<p>Mistakes:</p><ul><li><b>Not flushing:</b> data sits in buffers; flush after logical chunks.</li><li><b>Using a request scoped bean or lazy entity</b> inside <code>writeTo</code>; the request context and session are not available the same way.</li><li><b>Unbounded default executor:</b> the simple async executor may create many threads; configure a pool.</li><li><b>Not closing resources:</b> use try-with-resources inside the body.</li><li><b>Ignoring client disconnect:</b> an <code>IOException</code> on write means stop work.</li></ul>`,
            r`StreamingResponseBody body = out -> {
    try (Stream<Order> orders = repo.streamAll()) {      // needs an open transaction
        Iterator<Order> it = orders.iterator();
        while (it.hasNext()) {
            out.write((it.next().toCsv() + "\n").getBytes(StandardCharsets.UTF_8));
            out.flush();
        }
    } catch (IOException clientGone) {
        // the client closed the connection: stop quietly
    }
};

// OUTPUT:
// If the client disconnects, the loop ends and the stream is closed`],
        [`<p>Performance:</p><ul><li><b>Memory:</b> constant, only the buffer size.</li><li><b>Threads:</b> each stream uses a worker for its whole life, so size the pool for concurrent streams.</li><li><b>Flush frequency:</b> too often costs syscalls; too rarely delays the client.</li><li><b>Proxy buffering:</b> nginx may buffer responses; set <code>X-Accel-Buffering: no</code> for live streams.</li><li><b>Database:</b> use fetch size or a cursor, not a full list.</li></ul>`,
            r`@GetMapping("/live")
ResponseEntity<StreamingResponseBody> live() {
    StreamingResponseBody b = out -> {
        for (int i = 0; i < 5; i++) {
            out.write(("event " + i + "\n").getBytes());
            out.flush();
        }
    };
    return ResponseEntity.ok()
        .header("X-Accel-Buffering", "no")
        .contentType(MediaType.TEXT_PLAIN)
        .body(b);
}

// OUTPUT:
// event 0
// event 1
// ... (each line appears as soon as it is flushed)`],
        [`<p>Real-world scenario: exporting a million order rows as CSV without loading them. The query is streamed from the database, rows are written one by one, and the browser starts the download immediately.</p>`,
            r`@GetMapping("/orders/export")
ResponseEntity<StreamingResponseBody> exportOrders() {
    StreamingResponseBody body = out -> {
        try (var w = new BufferedWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            w.write("id,total\n");
            service.forEachOrder(o -> {
                try {
                    w.write(o.getId() + "," + o.getTotal() + "\n");
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        }
    };
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(body);
}

// OUTPUT:
// id,total
// 1,99.50
// 2,15.00
// ... (a million rows, heap stays flat)`]
    ),
    'mvc-resource': dv(
        [`<p>How Spring resolves a resource:</p><ul><li><b>ResourceLoader:</b> the <code>ApplicationContext</code> is itself a <code>ResourceLoader</code>.</li><li><b>Prefix rule:</b> <code>classpath:</code> gives <code>ClassPathResource</code>, <code>file:</code> and URLs give <code>FileUrlResource</code> or <code>UrlResource</code>; no prefix depends on the context (a web context uses <code>ServletContextResource</code>).</li><li><b>Conversion:</b> <code>ResourceEditor</code> and the conversion service turn a string in <code>@Value</code> into a <code>Resource</code> at injection time.</li><li><b>Handle only:</b> creating a <code>Resource</code> does not open anything; I/O starts at <code>getInputStream()</code>.</li></ul>`,
            r`ResourceLoader loader = new DefaultResourceLoader();
Resource a = loader.getResource("classpath:application.properties");
Resource b = loader.getResource("file:/tmp/x.txt");
Resource c = loader.getResource("https://example.com/data.json");
System.out.println(a.getClass().getSimpleName() + " " + b.getClass().getSimpleName()
        + " " + c.getClass().getSimpleName());

// OUTPUT:
// ClassPathResource FileUrlResource UrlResource`],
        [`<p>Resource types at a glance:</p><ul><li><b>ClassPathResource:</b> packaged with the app, read-only in a JAR.</li><li><b>FileSystemResource / PathResource:</b> files on disk, writable via <code>WritableResource</code>.</li><li><b>UrlResource:</b> remote or file URL.</li><li><b>ByteArrayResource:</b> in memory bytes.</li><li><b>InputStreamResource:</b> one shot stream.</li><li><b>ServletContextResource:</b> file under the web application root.</li><li><b>Pattern lookups:</b> <code>classpath*:META-INF/*.xml</code>.</li></ul>`,
            r`ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
Resource[] all = resolver.getResources("classpath*:templates/**/*.html");
for (Resource r : all) {
    System.out.println(r.getFilename());
}

WritableResource out = new FileSystemResource("/tmp/result.txt");
try (OutputStream os = out.getOutputStream()) {
    os.write("done".getBytes());
}

// OUTPUT:
// index.html
// users.html
// (and result.txt is written)`],
        [`<p>Mistakes:</p><ul><li><b>getFile() inside a JAR:</b> throws <code>FileNotFoundException</code> (resource "cannot be resolved to absolute file path"). Use <code>getInputStream()</code>.</li><li><b>Wrong prefix:</b> <code>classpath:/x</code> and <code>classpath:x</code> are fine, but a leading wrong folder is not.</li><li><b>Forgetting to close streams.</b></li><li><b>Reading an InputStreamResource twice</b> fails with IllegalStateException.</li><li><b>Using <code>new File("src/main/resources/...")</code>:</b> works in the IDE only.</li></ul>`,
            r`// WRONG: works in the IDE, fails after packaging
// File f = new File("src/main/resources/data/seed.txt");

// RIGHT
Resource res = new ClassPathResource("data/seed.txt");
try (BufferedReader br = new BufferedReader(
        new InputStreamReader(res.getInputStream(), StandardCharsets.UTF_8))) {
    System.out.println(br.readLine());
}

// OUTPUT:
// hello from seed.txt`],
        [`<p>Performance:</p><ul><li><b>Cache content:</b> read static resources once at startup, not per request.</li><li><b>Pattern scans</b> over the whole classpath are slow; do them at startup.</li><li><b>Buffered reads:</b> use <code>readAllBytes</code> for small files, buffers for large.</li><li><b>Remote URLs:</b> set timeouts; <code>UrlResource</code> alone has none, so prefer <code>RestClient</code> for HTTP.</li></ul>`,
            r`@Component
class TemplateCache {
    private final String welcome;

    TemplateCache(@Value("classpath:mail/welcome.txt") Resource res) throws IOException {
        this.welcome = res.getContentAsString(StandardCharsets.UTF_8);   // read once
    }

    String welcome() { return welcome; }
}

// OUTPUT:
// The file is read one time at startup; welcome() is a plain field read`],
        [`<p>Real-world scenario: loading a seed JSON file at startup to insert default data, then letting an admin download generated reports through <code>ResponseEntity&lt;Resource&gt;</code>. Both use the same abstraction, so tests can swap the location for a test file.</p>`,
            r`@Component
class SeedLoader implements ApplicationRunner {
    private final Resource seed;
    private final ObjectMapper mapper;
    private final ProductRepository repo;

    SeedLoader(@Value("classpath:seed/products.json") Resource seed,
               ObjectMapper mapper, ProductRepository repo) {
        this.seed = seed;
        this.mapper = mapper;
        this.repo = repo;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (InputStream in = seed.getInputStream()) {
            List<Product> list = mapper.readValue(in, new TypeReference<>() {});
            repo.saveAll(list);
        }
    }
}

// OUTPUT:
// INFO SeedLoader : saved 25 products from products.json`]
    ),
    'mvc-responseentity-resource': dv(
        [`<p>Internals of returning <code>ResponseEntity&lt;Resource&gt;</code>:</p><ul><li><b>Processor:</b> <code>HttpEntityMethodProcessor.handleReturnValue</code> copies your headers to the response.</li><li><b>Range check:</b> if the body is a <code>Resource</code> and the request has a <code>Range</code> header, it builds <code>HttpRange</code> to <code>ResourceRegion</code> and uses the region converter; status 206.</li><li><b>Otherwise</b> <code>ResourceHttpMessageConverter</code> writes the whole resource, defaulting the type from the file name.</li><li><b>Headers added:</b> <code>Accept-Ranges: bytes</code> and, when known, <code>Content-Length</code>.</li><li><b>Invalid range:</b> 416 Range Not Satisfiable.</li></ul>`,
            r`// request:
// GET /docs/guide.txt  Range: bytes=0-4
//
// Spring (HttpEntityMethodProcessor) builds a region of 5 bytes
// and the response is:

// OUTPUT:
// HTTP/1.1 206
// Content-Range: bytes 0-4/120
// Content-Length: 5
// Accept-Ranges: bytes`],
        [`<p>Builder options:</p><ul><li><b>Status:</b> <code>ok()</code>, <code>status(...)</code>, <code>notFound()</code>.</li><li><b>Type:</b> <code>contentType</code>, <code>contentLength</code>.</li><li><b>Disposition:</b> <code>ContentDisposition.attachment()</code> or <code>inline()</code>.</li><li><b>Cache:</b> <code>cacheControl</code>, <code>eTag</code>, <code>lastModified</code>.</li><li><b>Resource kinds:</b> <code>FileSystemResource</code>, <code>UrlResource</code>, <code>ClassPathResource</code>, <code>ByteArrayResource</code>, <code>InputStreamResource</code>.</li></ul>`,
            r`@GetMapping("/stream/{id}")
ResponseEntity<Resource> fromStream(@PathVariable long id) throws IOException {
    InputStream in = storage.open(id);                // size known from metadata
    long size = storage.size(id);
    InputStreamResource res = new InputStreamResource(in);
    return ResponseEntity.ok()
        .contentLength(size)                          // set it yourself
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(res);
}

// OUTPUT:
// HTTP/1.1 200
// Content-Length: 4096
// (ranges are not supported for a one shot InputStreamResource)`],
        [`<p>Mistakes:</p><ul><li><b>Not checking exists():</b> a missing file leads to an exception and 500.</li><li><b>Closing the stream yourself:</b> Spring closes it after writing.</li><li><b>Path traversal</b> through <code>@PathVariable</code> names.</li><li><b>Wrong media type guess:</b> set it explicitly when you know it.</li><li><b>Mapping name with dots:</b> <code>/files/{name}</code> may cut the extension off in older setups; use <code>{name:.+}</code> if needed.</li></ul>`,
            r`@GetMapping("/files/{name:.+}")
ResponseEntity<Resource> file(@PathVariable String name) throws MalformedURLException {
    Path base = Path.of("files").toAbsolutePath().normalize();
    Path p = base.resolve(name).normalize();
    if (!p.startsWith(base)) return ResponseEntity.badRequest().build();
    Resource res = new UrlResource(p.toUri());
    return res.exists() && res.isReadable()
            ? ResponseEntity.ok(res)
            : ResponseEntity.notFound().build();
}

// OUTPUT:
// /files/a.pdf       -> 200
// /files/missing.pdf -> 404
// /files/..%2Fx      -> 400`],
        [`<p>Performance:</p><ul><li><b>Use FileSystemResource:</b> length and last modified are cheap; ranges allow seeking in video.</li><li><b>Add caching headers</b> to avoid repeat transfers.</li><li><b>Avoid ByteArrayResource for big data:</b> it is held in memory.</li><li><b>Static files:</b> prefer the resource handler or a CDN for public content.</li></ul>`,
            r`ResponseEntity<Resource> cached(Resource res) throws IOException {
    String etag = "\"" + res.lastModified() + "\"";
    return ResponseEntity.ok()
        .eTag(etag)
        .lastModified(res.lastModified())
        .cacheControl(CacheControl.maxAge(30, TimeUnit.MINUTES).cachePrivate())
        .body(res);
}

// OUTPUT:
// Cache-Control: max-age=1800, private
// ETag: "1735689600000"`],
        [`<p>Real-world scenario: a video endpoint. Browsers send <code>Range</code> requests when users seek. Returning a <code>FileSystemResource</code> inside <code>ResponseEntity</code> lets Spring answer with partial content, so seeking works without extra code.</p>`,
            r`@GetMapping("/videos/{id}")
ResponseEntity<Resource> video(@PathVariable String id) {
    Resource res = new FileSystemResource("/data/videos/" + id + ".mp4");
    if (!res.exists()) return ResponseEntity.notFound().build();
    return ResponseEntity.ok()
        .contentType(MediaType.valueOf("video/mp4"))
        .body(res);
}

// OUTPUT:
// GET /videos/intro  Range: bytes=1000000-
// HTTP/1.1 206 Partial Content
// Content-Range: bytes 1000000-5242879/5242880`]
    ),
    'mvc-large-file-handling': dv(
        [`<p>Memory paths for large data:</p><ul><li><b>Upload:</b> the container spools big parts to a temp file; the controller sees a <code>MultipartFile</code> backed by that file, so memory stays low if you stream.</li><li><b>Danger zone:</b> <code>getBytes()</code>, <code>MultipartFile</code> to <code>byte[]</code>, and JSON/Base64 bodies load everything.</li><li><b>Download:</b> <code>Resource</code> and <code>StreamingResponseBody</code> copy in 8 KB style buffers.</li><li><b>Request thread:</b> a slow upload or download occupies a thread for the whole time unless you go async.</li></ul>`,
            r`// Memory-safe copy
try (InputStream in = file.getInputStream();
     OutputStream out = Files.newOutputStream(target)) {
    in.transferTo(out);          // Java 9+: internal buffer, constant memory
}

// Memory-hungry copy: avoid for big files
// byte[] all = file.getBytes();

// OUTPUT:
// 2 GB upload with transferTo -> heap usage stays small (varies)`],
        [`<p>Strategies:</p><ul><li><b>Multipart streaming:</b> simple, fine up to hundreds of MB.</li><li><b>Raw body with PUT:</b> skips multipart parsing.</li><li><b>Chunked upload:</b> client sends numbered parts, server tracks and merges.</li><li><b>Pre-signed URL:</b> client talks to S3 or similar directly.</li><li><b>Resumable (tus-like):</b> uses offsets so a broken upload continues.</li><li><b>Download ranges:</b> <code>Resource</code> supports <code>Range</code>.</li></ul>`,
            r`@PostMapping("/chunk")
ResponseEntity<String> chunk(@RequestParam String uploadId,
                             @RequestParam int index,
                             @RequestParam("data") MultipartFile data) throws IOException {
    Path dir = Path.of("chunks", uploadId);
    Files.createDirectories(dir);
    data.transferTo(dir.resolve(String.format("%05d.part", index)).toAbsolutePath());
    return ResponseEntity.ok("chunk " + index + " saved");
}

@PostMapping("/chunk/{uploadId}/complete")
ResponseEntity<String> complete(@PathVariable String uploadId) throws IOException {
    Path dir = Path.of("chunks", uploadId);
    Path whole = Path.of("storage", uploadId + ".bin");
    try (OutputStream out = Files.newOutputStream(whole);
         Stream<Path> parts = Files.list(dir).sorted()) {
        for (Path p : (Iterable<Path>) parts::iterator) Files.copy(p, out);
    }
    return ResponseEntity.ok("merged");
}

// OUTPUT:
// chunk 0 saved ... chunk 9 saved
// merged`],
        [`<p>Mistakes:</p><ul><li><b>Forgetting the proxy limit:</b> nginx and load balancers have their own body limits and timeouts.</li><li><b>Temp directory full:</b> the default temp location may be small; set <code>spring.servlet.multipart.location</code>.</li><li><b>Short timeouts:</b> a slow client needs larger idle timeouts.</li><li><b>Compute on the request thread:</b> hashing or virus scanning a big file blocks the response; do it asynchronously.</li><li><b>No cleanup:</b> abandoned chunks pile up; run a scheduled cleanup.</li></ul>`,
            r`@Scheduled(cron = "0 0 3 * * *")
void cleanOldChunks() throws IOException {
    Instant limit = Instant.now().minus(1, ChronoUnit.DAYS);
    try (Stream<Path> dirs = Files.list(Path.of("chunks"))) {
        dirs.filter(d -> Files.getLastModifiedTime(d).toInstant().isBefore(limit))
            .forEach(this::deleteRecursively);
    }
}

// OUTPUT:
// INFO cleaned 3 abandoned upload folders (varies)`],
        [`<p>Tuning checklist:</p><ul><li><b>Buffers:</b> 8 to 64 KB chunks are usual.</li><li><b>Threads:</b> bound concurrent transfers with a pool or a semaphore.</li><li><b>Checksums:</b> compute while copying (a <code>DigestInputStream</code>), not in a second pass.</li><li><b>Disk:</b> use fast storage for temp and target.</li><li><b>Virtual threads:</b> on Java 21 with Spring Boot 3.2+, <code>spring.threads.virtual.enabled=true</code> makes blocking IO cheaper per request.</li></ul>`,
            r`static String copyWithSha256(InputStream in, Path target) throws Exception {
    MessageDigest md = MessageDigest.getInstance("SHA-256");
    try (DigestInputStream din = new DigestInputStream(in, md)) {
        Files.copy(din, target, StandardCopyOption.REPLACE_EXISTING);   // one pass
    }
    return HexFormat.of().formatHex(md.digest());
}

# application.properties
# spring.threads.virtual.enabled=true

// OUTPUT:
// copyWithSha256(...) -> "9f86d081884c7d659a2feaa0c55ad015..." (varies)`],
        [`<p>Real-world scenario: a video platform. Large uploads go straight to object storage with a pre-signed URL. The app only issues the URL and records metadata, so no gigabytes pass through the Spring servers; downloads use a CDN, with Range support as a fallback.</p>`,
            r`record UploadTicket(String url, String objectKey) {}

@PostMapping("/videos/upload-url")
UploadTicket ticket(@RequestParam String fileName, Principal user) {
    String key = user.getName() + "/" + UUID.randomUUID() + "-" + fileName;
    String url = storage.presignPut(key, Duration.ofMinutes(15));   // your storage client
    videos.save(new Video(key, user.getName(), "PENDING"));
    return new UploadTicket(url, key);
}

// OUTPUT:
// {"url":"https://storage.example.com/bucket/abaji/3f1c-intro.mp4?sig=...",
//  "objectKey":"abaji/3f1c-intro.mp4"}   (varies)`]
    )
};
