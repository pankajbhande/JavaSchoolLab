import { Topic } from '../coreJava';

export const springBootCsvImportExport: Topic = {
    id: 'spring-boot-csv-import-export',
    name: 'CSV Import & Export',
    beginner: [
        {
            content: `<h3>Reading CSV Data - Uploading a CSV into MySQL</h3>
<strong>Business requirement:</strong> read data from a CSV file and store it in the MySQL database.<br>
<strong>Problem statement:</strong> design the REST API to fetch the data from a CSV file and store it into MySQL.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the project &nbsp; 2. Add dependencies &nbsp; 3. Model class &nbsp; 4. Service &nbsp; 5. Service implementation<br>
6. Repository &nbsp; 7. REST controller &nbsp; 8. CommonUtil &nbsp; 9. ResponseMessage &nbsp; 10. application.properties<br>
11. Run &nbsp; 12. Postman &nbsp; 13. Check the database &nbsp; 14. Application flow
</div><br>

The one new dependency is <strong>Apache Commons CSV</strong>, which handles the parsing.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml : the CSV library, on top of the usual three -->
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
</dependency>

<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-csv</artifactId>
    <version>1.8</version>
</dependency>`,
                `// Step 3 - Employee.java
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String city;

    public Employee() {
    }

    public Employee(int id, String name, String city) {
        this.id = id;
        this.name = name;
        this.city = city;
    }

    // getters, setters and toString()
}`
            ]
        },
        {
            content: `<h3>Step 8 - CommonUtil: Parsing the CSV</h3>
This class does the real work. <code>CSVFormat.DEFAULT.withFirstRecordAsHeader()</code> tells Commons CSV that row one holds column names, so each following row can be read by name rather than by position.<br><br>

<table>
<tr><th>Setting</th><th>Effect</th></tr>
<tr><td><code>withFirstRecordAsHeader()</code></td><td>Row 1 becomes the header; <code>record.get("name")</code> works.</td></tr>
<tr><td><code>withIgnoreHeaderCase()</code></td><td><code>Name</code>, <code>NAME</code> and <code>name</code> all match.</td></tr>
<tr><td><code>withTrim()</code></td><td>Strips surrounding whitespace from every value.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

import com.velocity.model.Employee;

public class CommonUtil {

    public static final String TYPE = "text/csv";
    static final String[] HEADERS = { "id", "name", "city" };

    public static boolean hasCSVFormat(MultipartFile file) {
        return TYPE.equals(file.getContentType());
    }

    public static List<Employee> csvToEmployees(InputStream is) {

        try (BufferedReader fileReader =
                     new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader,
                     CSVFormat.DEFAULT
                             .withFirstRecordAsHeader()
                             .withIgnoreHeaderCase()
                             .withTrim())) {

            List<Employee> employees = new ArrayList<>();

            for (CSVRecord csvRecord : csvParser.getRecords()) {
                employees.add(new Employee(
                        Integer.parseInt(csvRecord.get("id")),
                        csvRecord.get("name"),
                        csvRecord.get("city")));
            }
            return employees;

        } catch (IOException e) {
            throw new RuntimeException("fail to parse CSV file: " + e.getMessage());
        }
    }
}
// try-with-resources closes BOTH the reader and the parser even
// when parsing fails - leaving them open leaks a file handle per
// upload until the JVM runs out.`
            ]
        },
        {
            content: `<h3>Steps 4 to 7 and 9 - Service, Repository, Controller</h3>
<code>saveAll()</code> writes the whole parsed list in one call.<br>`,
            codeExamples: [
                `// Step 4/5 - EmployeeService and its implementation
public interface EmployeeService {
    public void save(MultipartFile file);
}

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public void save(MultipartFile file) {
        try {
            List<Employee> employees = CommonUtil.csvToEmployees(file.getInputStream());
            employeeRepository.saveAll(employees);
        } catch (IOException e) {
            throw new RuntimeException("fail to store csv data: " + e.getMessage());
        }
    }
}
// @Transactional matters here: without it, a CSV that fails on row 500
// leaves rows 1-499 committed and the file half-imported.`,
                `// Step 9 - ResponseMessage.java  (a tiny wrapper so the API
// returns JSON rather than a bare string)
package com.velocity.util;

public class ResponseMessage {

    private String message;

    public ResponseMessage(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}`,
                `// Step 7 - EmployeeController.java
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/upload")
    public ResponseEntity<ResponseMessage> uploadFile(
            @RequestParam("file") MultipartFile file) {

        if (!CommonUtil.hasCSVFormat(file)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseMessage("Please upload a csv file!"));
        }

        try {
            employeeService.save(file);
            return ResponseEntity.ok(new ResponseMessage(
                    "Uploaded the file successfully: " + file.getOriginalFilename()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body(new ResponseMessage(
                            "Could not upload the file: " + file.getOriginalFilename() + "!"));
        }
    }
}`,
                `// employees.csv
id,name,city
1,ajay,pune
2,sohan,mumbai
3,vikas,pune

// POST http://localhost:8181/upload
// Body -> form-data:  file = [employees.csv]
// URLs are case-sensitive: /upload, not /Upload.

// RESPONSE (200 OK)
{ "message": "Uploaded the file successfully: employees.csv" }

// CONSOLE:
// Hibernate: insert into employee (city, name, id) values (?, ?, ?)  x3

// RESPONSE for a .txt file (400 Bad Request)
{ "message": "Please upload a csv file!" }`
            ]
        },
        {
            content: `<h3>Writing CSV Data - Exporting the Database to a CSV</h3>
<strong>Business requirement:</strong> fetch employee data from the database and write it into a CSV file.<br>
<strong>Problem statement:</strong> design the REST API to fetch the data from the database and write it into a CSV file.<br><br>

The direction reverses: <code>CSVPrinter</code> instead of <code>CSVParser</code>, and the response streams a file back.<br>`,
            codeExamples: [
                `// CommonUtil.java - the export half
package com.velocity.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.QuoteMode;

import com.velocity.model.Employee;

public class CommonUtil {

    public static ByteArrayInputStream employeesToCSV(List<Employee> employees) {

        final CSVFormat format = CSVFormat.DEFAULT
                .withQuoteMode(QuoteMode.MINIMAL)
                .withHeader("id", "name", "city");     // write the header row

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // try-with-resources closes the printer, which FLUSHES the
        // PrintWriter into the ByteArrayOutputStream.
        try (CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), format)) {

            for (Employee emp : employees) {
                csvPrinter.printRecord(Arrays.asList(
                        String.valueOf(emp.getId()), emp.getName(), emp.getCity()));
            }
            csvPrinter.flush();

            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("fail to import data to CSV file: " + e.getMessage());
        }
    }
}
// THE BUG TO AVOID: calling out.toByteArray() without closing or
// flushing the printer. PrintWriter buffers, so the bytes are still
// in the buffer and the downloaded file comes out EMPTY - with no
// error anywhere to explain why.`,
                `// EmployeeServiceImpl.java
@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public ByteArrayInputStream load() {
        List<Employee> employees = employeeRepository.findAll();
        return CommonUtil.employeesToCSV(employees);
    }
}`,
                `// EmployeeController.java
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/download")
    public ResponseEntity<Resource> getFile() {

        String filename = "employeesList.csv";
        InputStreamResource file = new InputStreamResource(employeeService.load());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }
}`,
                `// GET http://localhost:8181/download
// RESPONSE (200 OK)
// Content-Disposition: attachment; filename=employeesList.csv
// Content-Type: text/csv
//
// id,name,city
// 1,ajay,pune
// 2,sohan,mumbai
// 3,vikas,pune

// Opening the same URL in a browser downloads employeesList.csv
// straight to the Downloads folder.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Two Silent Failures in the Export Path</h3>
Both produce a file with no error message, which makes them harder to find than a crash.<br><br>

<table>
<tr><th>Mistake</th><th>Symptom</th></tr>
<tr><td>Not closing/flushing the <code>CSVPrinter</code></td><td>The <code>PrintWriter</code> buffer is never drained, so <code>toByteArray()</code> returns nothing. <strong>An empty CSV downloads successfully.</strong></td></tr>
<tr><td>No <code>withHeader(...)</code></td><td>The file has data but no column names. Re-importing it treats row 1 as data, or fails on <code>Integer.parseInt("id")</code>.</td></tr>
</table>
<br>
The round trip is the test worth running: export, then import the exported file. If it does not survive that, one of the two is wrong.<br>`,
            codeExamples: [
                `// The failing version - looks fine, produces 0 bytes
ByteArrayOutputStream out = new ByteArrayOutputStream();
CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), format);

for (Employee emp : employees) {
    csvPrinter.printRecord(...);
}
return new ByteArrayInputStream(out.toByteArray());   // <-- still buffered
// OUTPUT: a 0-byte employeesList.csv, HTTP 200, no exception.

// The fix is either try-with-resources or an explicit flush:
try (CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), format)) {
    ...
    csvPrinter.flush();
}
// OUTPUT: the real file.`,
                `// A round-trip test catches both problems at once
@Test
void exportedCsvCanBeReimported() {
    List<Employee> original = List.of(
            new Employee(1, "ajay", "pune"),
            new Employee(2, "sohan", "mumbai"));

    ByteArrayInputStream csv = CommonUtil.employeesToCSV(original);
    List<Employee> reimported = CommonUtil.csvToEmployees(csv);

    assertThat(reimported).hasSize(2);
    assertThat(reimported.get(0).getName()).isEqualTo("ajay");
}
// Fails with "hasSize(2) but was empty" if the printer was not flushed,
// and with NumberFormatException: For input string: "id" if the
// header row is missing.`
            ]
        },
        {
            content: `<h3>CSV Is Harder Than <code>split(",")</code></h3>
This is why Commons CSV exists rather than a loop over <code>String.split</code>. Real files contain all of the following, and a naive split mangles every one of them.<br><br>

<table>
<tr><th>Case</th><th>What it looks like</th></tr>
<tr><td>Comma inside a value</td><td><code>1,"Patil, Ajay",pune</code> - one field, not two.</td></tr>
<tr><td>Quote inside a value</td><td><code>1,"He said ""hi""",pune</code> - a doubled quote is one literal quote.</td></tr>
<tr><td>Newline inside a value</td><td>A quoted field spanning two physical lines.</td></tr>
<tr><td>Empty vs missing</td><td><code>1,,pune</code> is an empty string; a short row is a missing column.</td></tr>
<tr><td>UTF-8 BOM</td><td>Excel writes <code>EF BB BF</code> first, so the first header reads <code>﻿id</code> and lookups by "id" fail.</td></tr>
<tr><td>Leading <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code></td><td>Excel executes it as a formula - <strong>CSV injection</strong>.</td></tr>
</table>
<br>
<code>QuoteMode.MINIMAL</code> handles the first four automatically when writing: it quotes a field only when it contains a delimiter, a quote or a newline.<br>`,
            codeExamples: [
                `// What MINIMAL quoting produces
Employee e = new Employee(1, "Patil, Ajay", "pune");
// OUTPUT:
// id,name,city
// 1,"Patil, Ajay",pune
//    ^ quoted because it contains a comma

Employee e2 = new Employee(2, "He said \\"hi\\"", "mumbai");
// OUTPUT:
// 2,"He said ""hi""",mumbai
//    ^ quoted, and the inner quotes are doubled

// A naive split(",") on row 1 gives:
//   ["1", "\\"Patil", " Ajay\\"", "pune"]   -- four fields, all wrong.`,
                `// The BOM problem, and the standard fix
// Excel saves employees.csv starting with EF BB BF.
// csvRecord.get("id")  ->  IllegalArgumentException:
//   Mapping for id not found, expected one of [﻿id, name, city]

// Fix: strip the BOM by reading with a BOMInputStream (commons-io)
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(new BOMInputStream(is), StandardCharsets.UTF_8))) {
    ...
}
// OUTPUT: the header reads "id" and the lookup works.`,
                `// CSV injection - the export-side security issue nobody expects.
// A user whose name is  =cmd|'/c calc'!A1  is written verbatim,
// and Excel EXECUTES it when someone opens the export.
private static String sanitize(String value) {
    if (value == null || value.isEmpty()) return value;
    char first = value.charAt(0);
    if (first == '=' || first == '+' || first == '-' || first == '@'
            || first == '\\t' || first == '\\r') {
        return "'" + value;          // leading apostrophe -> Excel treats as text
    }
    return value;
}
// OUTPUT:
// 1,'=cmd|'/c calc'!A1,pune
// The cell displays the text instead of running a command.`
            ]
        },
        {
            content: `<h3>Importing Large Files Without Running Out of Memory</h3>
<code>csvParser.getRecords()</code> loads every row into a <code>List</code>, and <code>saveAll()</code> then holds every entity in the persistence context. A 500 MB CSV will exhaust the heap.<br><br>

<table>
<tr><th>Technique</th><th>Effect</th></tr>
<tr><td>Iterate the parser instead of <code>getRecords()</code></td><td>Streams row by row; only one record is in memory.</td></tr>
<tr><td>Batch inserts + <code>flush()</code> + <code>clear()</code></td><td>Bounds the persistence context.</td></tr>
<tr><td><code>hibernate.jdbc.batch_size</code></td><td>Groups inserts into one round trip instead of one per row.</td></tr>
<tr><td>Collect errors, do not abort</td><td>A bad row on line 4,000 should not discard 3,999 good ones - report them all.</td></tr>
</table>`,
            codeExamples: [
                `# Batch the inserts - without this, saveAll() sends one INSERT per row
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true`,
                `@Service
public class CsvImportService {

    @PersistenceContext
    private EntityManager em;

    private static final int BATCH = 50;

    @Transactional
    public ImportResult importCsv(InputStream is) throws IOException {

        List<String> errors = new ArrayList<>();
        int imported = 0, row = 1;

        try (BufferedReader reader = new BufferedReader(
                     new InputStreamReader(is, StandardCharsets.UTF_8));
             CSVParser parser = new CSVParser(reader,
                     CSVFormat.DEFAULT.withFirstRecordAsHeader().withTrim())) {

            // Iterating the parser streams the file - getRecords() would
            // pull every row into memory first.
            for (CSVRecord record : parser) {
                row++;
                try {
                    em.persist(new Employee(
                            Integer.parseInt(record.get("id")),
                            record.get("name"),
                            record.get("city")));
                    imported++;

                    if (imported % BATCH == 0) {
                        em.flush();     // send this batch to the database
                        em.clear();     // and release it from memory
                    }
                } catch (NumberFormatException e) {
                    errors.add("row " + row + ": invalid id '" + record.get("id") + "'");
                }
            }
        }
        return new ImportResult(imported, errors);
    }
}
// OUTPUT for a file with two bad rows:
// {
//   "imported": 4998,
//   "errors": [ "row 12: invalid id 'abc'", "row 907: invalid id ''" ]
// }
// Memory stays flat regardless of file size, and the caller learns
// exactly which rows were rejected.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which library parses CSV here, and why not <code>split(",")</code>?</td><td>Apache Commons CSV. Split breaks on commas inside quoted values, escaped quotes and embedded newlines.</td></tr>
<tr><td>What does <code>withFirstRecordAsHeader()</code> do?</td><td>Treats row 1 as column names so records can be read by name - <code>record.get("city")</code> - instead of by index.</td></tr>
<tr><td>Why does the exported CSV sometimes come out empty?</td><td>The <code>CSVPrinter</code> was never flushed or closed, so the <code>PrintWriter</code> buffer never reached the <code>ByteArrayOutputStream</code>. Use try-with-resources.</td></tr>
<tr><td>Which header makes the browser download the file?</td><td><code>Content-Disposition: attachment; filename=...</code>, with <code>Content-Type: text/csv</code>.</td></tr>
<tr><td>Why should the import be <code>@Transactional</code>?</td><td>Otherwise a failure part-way through leaves the file half-imported, with earlier rows already committed.</td></tr>
<tr><td>What does <code>QuoteMode.MINIMAL</code> mean?</td><td>Quote a field only when it contains the delimiter, a quote character or a newline.</td></tr>
<tr><td>What is CSV injection?</td><td>A value starting with <code>=</code>, <code>+</code>, <code>-</code> or <code>@</code> that Excel executes as a formula when the export is opened. Prefix it with an apostrophe.</td></tr>
<tr><td>Why does a CSV saved by Excel break header lookups?</td><td>Excel writes a UTF-8 BOM, so the first column name becomes <code>﻿id</code>. Strip it with a BOMInputStream.</td></tr>
<tr><td>How do you import a very large CSV safely?</td><td>Iterate the parser rather than calling <code>getRecords()</code>, and flush/clear the EntityManager every N rows.</td></tr>
<tr><td>How do you speed up bulk inserts?</td><td>Set <code>hibernate.jdbc.batch_size</code> so inserts are grouped into one round trip instead of one statement per row.</td></tr>
<tr><td>Should one bad row abort the whole import?</td><td>Usually not - collect per-row errors and report them, so 4,998 good rows are not discarded because of two bad ones.</td></tr>
</table>`
        }
    ]
};
