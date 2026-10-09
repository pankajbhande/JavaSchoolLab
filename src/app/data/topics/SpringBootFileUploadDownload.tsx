import { Topic } from '../coreJava';

export const springBootFileUploadDownload: Topic = {
    id: 'spring-boot-file-upload-download',
    name: 'File Upload & Download',
    beginner: [
        {
            content: `<h3>File Upload - Storing an Image in the Database</h3>
<strong>Business requirement:</strong> save a single image into the database.<br>
<strong>Problem statement:</strong> design the REST API to save a single image into the database.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add Maven dependencies &nbsp; 3. Create the model class<br>
4. Create the service &nbsp; 5. Create the service implementation &nbsp; 6. Create the repository<br>
7. Create the REST controller &nbsp; 8. application.properties &nbsp; 9. Run &nbsp; 10. Postman &nbsp; 11. Check the database
</div><br>

<h3>The pieces that make file upload work</h3>

<table>
<tr><th>Piece</th><th>Purpose</th></tr>
<tr><td><code>MultipartFile</code></td><td>Spring's wrapper around an uploaded file - gives you the bytes, the original filename and the content type.</td></tr>
<tr><td><code>@RequestParam("file")</code></td><td>Binds the multipart form field named <code>file</code> to that parameter.</td></tr>
<tr><td><code>@Lob</code></td><td>Maps a <code>byte[]</code> field to a large-object column (<code>LONGBLOB</code> in MySQL).</td></tr>
<tr><td>Body type in Postman</td><td><strong>form-data</strong>, not raw JSON. A file cannot travel inside a JSON body.</td></tr>
</table>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>`,
                `// Step 3 - Image.java
package com.velocity.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;

@Entity
@Table(name = "images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String name;
    private String type;

    @Lob
    private byte[] imagedetails;

    public Image() {
    }

    public Image(String name, String type, byte[] imagedetails) {
        this.name = name;
        this.type = type;
        this.imagedetails = imagedetails;
    }

    // getters and setters
}
// The no-arg constructor is required by JPA. Adding the three-arg
// constructor removes the default one, so both must be declared.`
            ]
        },
        {
            content: `<h3>Steps 4 to 7 - Single Image Upload</h3>
The service takes the <code>MultipartFile</code>, turns it into an <code>Image</code> entity and saves it.<br>`,
            codeExamples: [
                `// Step 4 - ImageService.java  (the interface)
package com.velocity.service;

import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;
import com.velocity.model.Image;

public interface ImageService {
    public Image uploadImage(MultipartFile file) throws IOException;
}`,
                `// Step 5 - ImageServiceImpl.java  (the IMPLEMENTATION, not a copy
// of the interface - this is the file the original walkthrough repeats)
package com.velocity.service.impl;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.velocity.model.Image;
import com.velocity.repository.ImageRepository;
import com.velocity.service.ImageService;

@Service
public class ImageServiceImpl implements ImageService {

    @Autowired
    private ImageRepository imageRepository;

    @Override
    public Image uploadImage(MultipartFile file) throws IOException {
        Image image = new Image(file.getOriginalFilename(),
                                file.getContentType(),
                                file.getBytes());
        return imageRepository.save(image);
    }
}`,
                `// Step 6 - ImageRepository.java
package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.velocity.model.Image;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {
}
// The import must be JpaRepository, matching what the interface extends.
// Importing CrudRepository while extending JpaRepository will not compile.`,
                `// Step 7 - ImageController.java
package com.velocity.controller;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.velocity.model.Image;
import com.velocity.service.ImageService;

@RestController
public class ImageController {

    @Autowired
    private ImageService imageService;

    // The path here must match the URL you call in Postman.
    @PostMapping("/saveSingleImage")
    public Image uploadImage(@RequestParam("file") MultipartFile file)
            throws IOException {
        return imageService.uploadImage(file);
    }
}`
            ]
        },
        {
            content: `<h3>Steps 8 to 11 - Configure, Run, Upload</h3>

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Method</td><td>POST</td></tr>
<tr><td>URL</td><td>http://localhost:8181/saveSingleImage</td></tr>
<tr><td>Body</td><td><strong>form-data</strong> -> key <code>file</code>, type <strong>File</strong>, then choose an image</td></tr>
</table>`,
            codeExamples: [
                `# Step 8 - application.properties
server.port=8181

#MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/project?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.error.include-stacktrace=never

# Upload size limits - BOTH are needed
spring.servlet.multipart.max-file-size=15MB
spring.servlet.multipart.max-request-size=15MB`,
                `// POST http://localhost:8181/saveSingleImage
// Body -> form-data:   file = [photo.jpg]

// RESPONSE (200 OK)
{
    "id": 1,
    "name": "photo.jpg",
    "type": "image/jpeg",
    "imagedetails": "/9j/4AAQSkZJRgABAQEASABIAAD..."   // base64, very long
}

// CONSOLE:
// Hibernate: insert into images (imagedetails, name, type) values (?, ?, ?)

// DATABASE
// +----+-----------+------------+------------------+
// | id | name      | type       | imagedetails     |
// +----+-----------+------------+------------------+
// |  1 | photo.jpg | image/jpeg | [BLOB - 248 KiB] |
// +----+-----------+------------+------------------+`
            ]
        },
        {
            content: `<h3>Working with Multiple Images</h3>
<strong>Business requirement:</strong> save multiple images into the database.<br><br>

The parameter becomes an array, and the controller loops. Everything else is the same.<br>`,
            codeExamples: [
                `// ImageService.java
public interface ImageService {
    public List<Image> uploadMultipleImages(List<Image> images);
}

// ImageServiceImpl.java
@Service
public class ImageServiceImpl implements ImageService {

    @Autowired
    private ImageRepository imageRepository;

    @Override
    public List<Image> uploadMultipleImages(List<Image> images) {
        return imageRepository.saveAll(images);
    }
}`,
                `// ImageController.java
@PostMapping("/saveMultipleImages")
public List<Image> uploadMultipartFile(@RequestParam("files") MultipartFile[] files)
        throws Exception {

    List<Image> fileList = new ArrayList<Image>();

    for (MultipartFile file : files) {
        String fileName = file.getOriginalFilename();
        Image image = new Image(fileName, file.getContentType(), file.getBytes());

        fileList.add(image);        // <-- this line must NOT be commented out
    }

    return imageService.uploadMultipleImages(fileList);
}
// In the original the add() call sits inside a trailing comment:
//     // Adding file into fileList fileList.add(image);
// so fileList stays empty, saveAll() saves nothing, and the endpoint
// returns [] with no error at all. A silent no-op is the worst kind
// of bug - always check the list is actually populated.`,
                `// POST http://localhost:8181/saveMultipleImages
// Body -> form-data:  files = [a.jpg]   files = [b.png]
//                     (same key repeated, one row per file)

// RESPONSE (200 OK)
[
    { "id": 1, "name": "a.jpg", "type": "image/jpeg", "imagedetails": "..." },
    { "id": 2, "name": "b.png", "type": "image/png",  "imagedetails": "..." }
]`,
                `// Restricting the accepted file types
@PostMapping("/saveMultipleImages")
public List<Image> uploadMultipartFile(@RequestParam("files") MultipartFile[] files)
        throws Exception {

    List<Image> fileList = new ArrayList<>();

    for (MultipartFile file : files) {
        String contentType = file.getContentType();
        System.out.println("file>>>" + contentType);

        // Note the order: "image/jpeg".equals(contentType), NOT
        // contentType.equals("image/jpeg") - getContentType() can
        // return null, and that form throws a NullPointerException.
        if ("image/jpeg".equals(contentType)
                || "image/jpg".equals(contentType)
                || "image/png".equals(contentType)) {

            fileList.add(new Image(file.getOriginalFilename(),
                                   contentType, file.getBytes()));
        }
    }
    return imageService.uploadMultipleImages(fileList);
}
// OUTPUT: a PDF in the upload is silently skipped.
// Better: reject the whole request with 400 and say which file failed.`
            ]
        },
        {
            content: `<h3>File Download - Fetching an Image from the Database</h3>
<strong>Business requirement:</strong> fetch a single image from the database.<br>
<strong>Problem statement:</strong> design the REST API to download or fetch an image from the database.<br><br>

The repository gains one derived finder, and the controller returns the entity.<br>`,
            codeExamples: [
                `// ImageRepository.java
@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {

    // A DIFFERENT name from the inherited findById(), which returns
    // Optional<Image> - redeclaring that signature would not compile.
    Image getFileById(int id);
}

// ImageServiceImpl.java
@Service
public class ImageServiceImpl implements ImageService {

    @Autowired
    private ImageRepository imageRepository;

    @Override
    public Image getFile(int id) {
        return imageRepository.getFileById(id);
    }

    @Override
    public Iterable<Image> getAllImages() {
        return imageRepository.findAll();
    }
}`,
                `// ImageController.java
@RestController
public class ImageController {

    @Autowired
    private ImageService imageService;

    @GetMapping("/getSingleImage/{id}")
    public Image getFileById(@PathVariable("id") Integer id) {
        return imageService.getFile(id);
    }

    @GetMapping("/getAllImages")
    public Iterable<Image> getAllImages() {
        return imageService.getAllImages();
    }
}`,
                `// GET http://localhost:8181/getSingleImage/28
// RESPONSE (200 OK)
{
    "id": 28,
    "name": "photo.jpg",
    "type": "image/jpeg",
    "imagedetails": "/9j/4AAQSkZJRgABAQEASABIAAD..."
}
// The bytes come back as a base64 STRING inside JSON, which is
// about 33% larger than the file and cannot be shown by a browser
// directly. See the Expert tab for returning the real image.

// GET http://localhost:8181/getAllImages
// RESPONSE: an array of the same shape - every image, fully loaded.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Returning JSON Is Not a Download</h3>
The download endpoint returns the entity, so the bytes arrive base64-encoded inside a JSON object. A browser cannot render that, an <code>&lt;img&gt;</code> tag cannot point at it, and the payload is a third larger than the file.<br><br>

A real download sets the content type and streams the raw bytes.<br><br>

<table>
<tr><th>Header</th><th>Effect</th></tr>
<tr><td><code>Content-Type: image/jpeg</code></td><td>The browser renders it instead of showing text.</td></tr>
<tr><td><code>Content-Disposition: inline</code></td><td>Display in the page.</td></tr>
<tr><td><code>Content-Disposition: attachment; filename="x.jpg"</code></td><td>Trigger a Save-As dialog.</td></tr>
<tr><td><code>Content-Length</code></td><td>Lets the browser show a progress bar.</td></tr>
</table>`,
            codeExamples: [
                `@GetMapping("/images/{id}")
public ResponseEntity<byte[]> download(@PathVariable Integer id) {

    Image image = imageRepository.findById(id)
            .orElseThrow(() -> new ImageNotFoundException(id));

    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(image.getType()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\\"" + image.getName() + "\\"")
            .contentLength(image.getImagedetails().length)
            .body(image.getImagedetails());
}
// OUTPUT:
// 200 OK
// Content-Type: image/jpeg
// Content-Length: 254016
// <raw JPEG bytes>
//
// This URL now works directly in an <img src="/images/28"> tag,
// and the payload is the file size rather than 133% of it.`,
                `// Forcing a Save-As dialog instead of inline display
.header(HttpHeaders.CONTENT_DISPOSITION,
        "attachment; filename=\\"" + image.getName() + "\\"")

// Streaming, so the whole file never sits in the heap at once:
@GetMapping("/images/{id}/stream")
public ResponseEntity<Resource> stream(@PathVariable Integer id) {
    Image image = imageRepository.findById(id).orElseThrow();
    Resource resource = new ByteArrayResource(image.getImagedetails());

    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(image.getType()))
            .body(resource);
}`
            ]
        },
        {
            content: `<h3>Storing Files in the Database Is Usually the Wrong Choice</h3>
<code>@Lob byte[]</code> works and is the simplest thing to demonstrate. At any real scale it becomes the bottleneck.<br><br>

<table>
<tr><th>Problem</th><th>Why</th></tr>
<tr><td>Backups explode</td><td>A 200 GB media library makes every database dump 200 GB. Restores go from minutes to hours.</td></tr>
<tr><td>Memory pressure</td><td><code>byte[]</code> loads the entire file into the JVM heap. Twenty 50 MB uploads at once is 1 GB of heap.</td></tr>
<tr><td>Accidental fetches</td><td><code>findAll()</code> on the images table drags every blob into memory - and <code>@Lob</code> is eager by default.</td></tr>
<tr><td>No CDN</td><td>Every image request hits your application and your database. Object storage serves them from the edge.</td></tr>
<tr><td>Replication lag</td><td>Large blobs slow down replication for every other table.</td></tr>
</table>
<br>
<strong>The usual pattern:</strong> put the file in object storage (S3, Azure Blob, GCS) or on disk, and store only the <em>metadata and the key</em> in the database.<br>`,
            codeExamples: [
                `// Metadata in the database, bytes elsewhere
@Entity
@Table(name = "images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String originalName;    // "photo.jpg"
    private String contentType;     // "image/jpeg"
    private long   sizeBytes;
    private String storageKey;      // "images/2023/08/uuid-photo.jpg"
    private Instant uploadedAt;
}
// The row is a few hundred bytes regardless of the file size.`,
                `@Service
public class ImageStorageService {

    private final Path root = Paths.get("uploads");

    @Transactional
    public Image store(MultipartFile file) throws IOException {

        // Never trust the client's filename - it can contain "../"
        String safeName = UUID.randomUUID() + "-"
                + Paths.get(file.getOriginalFilename()).getFileName();

        Path target = root.resolve(safeName).normalize();
        if (!target.startsWith(root)) {
            throw new SecurityException("path traversal attempt");
        }

        Files.createDirectories(root);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        Image image = new Image();
        image.setOriginalName(file.getOriginalFilename());
        image.setContentType(file.getContentType());
        image.setSizeBytes(file.getSize());
        image.setStorageKey(safeName);
        image.setUploadedAt(Instant.now());
        return imageRepository.save(image);
    }
}
// OUTPUT:
// insert into images (content_type, original_name, size_bytes,
//                     storage_key, uploaded_at) values (?, ?, ?, ?, ?)
// The file itself never passes through Hibernate.
//
// Uploading "../../etc/passwd" now throws SecurityException instead of
// writing outside the upload directory.`,
                `// If you MUST keep blobs in the database, at least make them lazy
@Lob
@Basic(fetch = FetchType.LAZY)
private byte[] imagedetails;
// Now findAll() lists names and types without loading a single blob.
// (Hibernate needs bytecode enhancement for this to be honoured on
//  a basic attribute - otherwise split the blob into its own entity.)`
            ]
        },
        {
            content: `<h3>Validating an Upload Properly</h3>
Checking <code>getContentType()</code> is a start and is not a security control - the content type is supplied by the client and can say anything.<br><br>

<table>
<tr><th>Check</th><th>Why</th></tr>
<tr><td>Size limits in properties</td><td>Rejected by Spring before your code runs, so a huge upload never reaches the heap.</td></tr>
<tr><td>Extension allow-list</td><td>Never a deny-list - you will forget one.</td></tr>
<tr><td>Magic bytes</td><td>The real format. A <code>.jpg</code> that starts with <code>MZ</code> is a Windows executable.</td></tr>
<tr><td>Generated filename</td><td>Blocks path traversal and collisions.</td></tr>
<tr><td>Serve from a separate domain</td><td>A stored HTML/SVG file cannot then run scripts against your session.</td></tr>
</table>
<br>
The two size properties do different jobs: <code>max-file-size</code> caps one file, <code>max-request-size</code> caps the whole multipart request. Ten 10 MB files pass the first check and fail the second - which is exactly what you want.<br>`,
            codeExamples: [
                `# Both limits, plus the threshold at which Spring spills to disk
spring.servlet.multipart.max-file-size=15MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.file-size-threshold=2KB

# Exceeding them gives a 500 by default. Turn it into a 413:
@RestControllerAdvice
public class UploadExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> tooLarge() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(Map.of("error", "file exceeds the 15MB limit"));
    }
}`,
                `// Checking the actual bytes, not the declared type
private static final Map<String, byte[]> MAGIC = Map.of(
        "image/jpeg", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF },
        "image/png",  new byte[] { (byte) 0x89, 'P', 'N', 'G' });

private void validate(MultipartFile file) throws IOException {

    if (file.isEmpty()) {
        throw new BadRequestException("file is empty");
    }

    byte[] expected = MAGIC.get(file.getContentType());
    if (expected == null) {
        throw new BadRequestException("unsupported type: " + file.getContentType());
    }

    byte[] header = new byte[expected.length];
    try (InputStream in = file.getInputStream()) {
        if (in.read(header) != expected.length || !Arrays.equals(header, expected)) {
            throw new BadRequestException("file content does not match its type");
        }
    }
}
// OUTPUT:
// An executable renamed to photo.jpg and declared as image/jpeg
// is now rejected: "file content does not match its type".`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which type represents an uploaded file in Spring?</td><td><code>MultipartFile</code> - it exposes the bytes, original filename, size and content type.</td></tr>
<tr><td>Which annotation binds it?</td><td><code>@RequestParam("file")</code>, with the request sent as <code>multipart/form-data</code>, not JSON.</td></tr>
<tr><td>How do you accept several files?</td><td>Declare the parameter as <code>MultipartFile[]</code> or <code>List&lt;MultipartFile&gt;</code> and repeat the same form key per file.</td></tr>
<tr><td>What does <code>@Lob</code> do?</td><td>Maps a <code>byte[]</code> or long <code>String</code> to a large-object column - LONGBLOB or LONGTEXT in MySQL.</td></tr>
<tr><td>Difference between max-file-size and max-request-size?</td><td>The first caps one file; the second caps the whole multipart request, so many small files can still be rejected together.</td></tr>
<tr><td>Why is returning the entity a poor download endpoint?</td><td>The bytes arrive base64-encoded inside JSON - about 33% larger, and unusable by a browser or an img tag. Return the raw bytes with the right Content-Type.</td></tr>
<tr><td>Which header triggers a Save-As dialog?</td><td><code>Content-Disposition: attachment; filename="..."</code>. <code>inline</code> displays it in the page instead.</td></tr>
<tr><td>Why is storing files in the database usually a bad idea?</td><td>Backups balloon, every fetch loads the file into the heap, and you cannot put a CDN in front of it. Store metadata in the DB and the bytes in object storage.</td></tr>
<tr><td>Is checking <code>getContentType()</code> enough validation?</td><td>No - it is supplied by the client. Verify the magic bytes and use an extension allow-list.</td></tr>
<tr><td>Why must you never use the client's filename directly?</td><td>Path traversal: <code>../../etc/passwd</code> writes outside the upload directory. Generate a name and verify the resolved path stays under the root.</td></tr>
<tr><td>Why does <code>"image/jpeg".equals(contentType)</code> beat the other order?</td><td><code>getContentType()</code> can return null, and <code>contentType.equals(...)</code> then throws a NullPointerException.</td></tr>
<tr><td>What status code fits an oversized upload?</td><td>413 Payload Too Large - handle <code>MaxUploadSizeExceededException</code> in a <code>@RestControllerAdvice</code>.</td></tr>
</table>`
        }
    ]
};
