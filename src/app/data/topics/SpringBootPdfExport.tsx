import { Topic } from '../coreJava';

export const springBootPdfExport: Topic = {
    id: 'spring-boot-pdf-export',
    name: 'PDF Export with iText',
    beginner: [
        {
            content: `<h3>Writing PDF Data - Exporting from the Database into a PDF</h3>
<strong>Business requirement:</strong> you have employee data stored in the database and want to fetch it and save it into a PDF file.<br><br>

<strong>Problem statement:</strong> design the REST API to fetch the data from the database and write it into a PDF file.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add Maven dependencies &nbsp; 3. Create the model class<br>
4. Create the service &nbsp; 5. Create the service implementation &nbsp; 6. Create the repository<br>
7. Create the REST controller &nbsp; 8. Create PDFUtils &nbsp; 9. application.properties<br>
10. Run &nbsp; 11. Postman &nbsp; 12. Check the output
</div><br>

The new dependency is <strong>iText 7</strong>, a Java library for generating PDFs.<br>`,
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
</dependency>

<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.0.4</version>
    <type>pom</type>
</dependency>
<!-- itext7-core is an aggregate POM, so <type>pom</type> is required.
     Without it Maven looks for a non-existent itext7-core-7.0.4.jar. -->`,
                `// Step 3 - Employee.java
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String city;

    public Employee() {
    }

    public Employee(Long id, String name, String city) {
        this.id = id;
        this.name = name;
        this.city = city;
    }

    // The getter and the field must agree on the type.
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // remaining getters, setters and toString()
}
// The original declares "private Long id" but "public int getId()"
// and "setId(int)". That does not compile - the accessors must
// use Long, or the field must be int.`
            ]
        },
        {
            content: `<h3>The iText 7 Object Model</h3>
Four types, layered from the file outwards.<br><br>

<table>
<tr><th>Type</th><th>Represents</th></tr>
<tr><td>PdfWriter</td><td>Where the bytes go - an output stream or a file.</td></tr>
<tr><td>PdfDocument</td><td>The low-level PDF document wrapped around that writer.</td></tr>
<tr><td>Document</td><td>The high-level layout API - you add paragraphs and tables to this.</td></tr>
<tr><td>Table / Cell / Paragraph</td><td>The content elements themselves.</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">OutputStream
     |
     v
 PdfWriter  ------>  PdfDocument  ------>  Document
                                              |
                                              +--> Paragraph  ("Employee Details")
                                              +--> Table
                                                     +--> Cell  ("id")
                                                     +--> Cell  ("name")
                                                     +--> Cell  ("city")</pre>`
        },
        {
            content: `<h3>Steps 4 to 6 - Service, Implementation, Repository</h3>
The service does one thing: fetch the rows. The PDF building lives in its own utility class.<br>`,
            codeExamples: [
                `// Step 4 - EmployeeService.java
package com.velocity.services;

import java.util.List;
import com.velocity.model.Employee;

public interface EmployeeService {
    public List<Employee> findAllEmployee();
}`,
                `// Step 5 - EmployeeServiceImpl.java
package com.velocity.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.velocity.model.Employee;
import com.velocity.repository.EmployeeRepository;
import com.velocity.services.EmployeeService;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public List<Employee> findAllEmployee() {
        return employeeRepository.findAll();
    }
}`,
                `// Step 6 - EmployeeRepository.java
package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.velocity.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}`
            ]
        },
        {
            content: `<h3>Step 8 - PDFUtils: Building the Document</h3>
<code>new Table(new float[] { 20f, 50f, 30f })</code> creates three columns with those <em>relative</em> widths - so the name column is two and a half times the width of the id column.<br><br>

<code>new Cell(1, 3)</code> creates a cell spanning 1 row and 3 columns - the merged title bar across the top of the table.<br>`,
            codeExamples: [
                `package com.velocity.util;

import java.io.IOException;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;

import com.velocity.model.Employee;

public class PDFUtils {

    public static void employeeDetailReport(HttpServletResponse response,
                                            List<Employee> employees)
            throws IOException {

        PdfWriter writer = new PdfWriter(response.getOutputStream());
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument);

        document.add(new Paragraph("Velocity Corporate Training Center")
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

        Table table = new Table(new float[] { 20f, 50f, 30f });
        table.setWidth(UnitValue.createPercentValue(100)).setFontSize(9);

        // A title cell spanning all three columns
        Cell title = new Cell(1, 3)
                .add(new Paragraph("Employee Details").setBold())
                .setTextAlignment(TextAlignment.CENTER);
        table.addCell(title);

        // Header row
        table.addCell(new Cell().add(new Paragraph("Id").setBold()));
        table.addCell(new Cell().add(new Paragraph("Name").setBold()));
        table.addCell(new Cell().add(new Paragraph("City").setBold()));

        // Data rows
        for (Employee emp : employees) {
            table.addCell(new Cell().add(new Paragraph(String.valueOf(emp.getId()))));
            table.addCell(new Cell().add(new Paragraph(emp.getName())));
            table.addCell(new Cell().add(new Paragraph(emp.getCity())));
        }

        document.add(table);

        // Closing the Document closes the PdfDocument and the writer,
        // which is what actually finalises the PDF structure.
        document.close();
    }
}
// In iText 7, Cell.add() takes an IBlockElement, so a bare String
// does not compile - it must be wrapped: add(new Paragraph("Id")).
// Likewise setWidthPercent() is iText 5; iText 7 uses
// setWidth(UnitValue.createPercentValue(100)).`
            ]
        },
        {
            content: `<h3>Step 7 - The REST Controller</h3>
Same two headers as any other download, with the PDF media type.<br>`,
            codeExamples: [
                `package com.velocity.controller;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.services.EmployeeService;
import com.velocity.util.PDFUtils;

@RestController
public class PDFController {

    @Autowired
    private EmployeeService employeeService;

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public void generateDetailsReport(HttpServletResponse response) throws IOException {

        String fileType = "attachment; filename=employee_details_"
                + dateFormat.format(new Date()) + ".pdf";

        response.setHeader("Content-Disposition", fileType);
        response.setContentType("application/pdf");

        // Call the SERVICE, not the repository - the controller
        // should not know a repository exists.
        PDFUtils.employeeDetailReport(response, employeeService.findAllEmployee());
    }
}
// The original is missing the opening parenthesis on @GetMapping and
// injects employeeRepository into the controller while declaring
// employeeService. Both are corrected here.`,
                `# Step 9 - application.properties
server.port=8181

#MySQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/test?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true`,
                `// Step 11 - the request
// Method: GET
// URL:    http://localhost:8181/pdf     (port 8181, matching server.port)

// RESPONSE (200 OK)
// Content-Type: application/pdf
// Content-Disposition: attachment; filename=employee_details_2023-09-23.pdf
// <binary PDF bytes>

// The downloaded PDF contains:
//
//            Velocity Corporate Training Center
//   +--------------------------------------------------+
//   |               Employee Details                   |
//   +--------+---------------------+-------------------+
//   | Id     | Name                | City              |
//   +--------+---------------------+-------------------+
//   | 1      | ajay                | pune              |
//   | 2      | sohan               | mumbai            |
//   +--------+---------------------+-------------------+

// CONSOLE:
// Hibernate: select employee0_.id, employee0_.city, employee0_.name
//            from employee employee0_`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Swallowing the Exception Produces a Corrupt PDF</h3>
The original wraps the document building in <code>try { ... } catch (IOException e) { e.printStackTrace(); }</code>. Two things go wrong with that.<br><br>

<table>
<tr><th>Problem</th><th>Consequence</th></tr>
<tr><td><code>document.close()</code> is inside the <code>try</code></td><td>If anything throws before it, the PDF is never finalised - no trailer, no cross-reference table. The file downloads and will not open.</td></tr>
<tr><td>The exception is only printed</td><td>The caller has no idea it failed, so the response still says 200 OK.</td></tr>
</table>
<br>
A PDF is only a valid PDF once it has been closed. <code>close()</code> belongs in a <code>finally</code> block or a try-with-resources.<br>`,
            codeExamples: [
                `// The failing shape
try {
    document.add(table);
    document.close();                    // never reached on failure
} catch (IOException e) {
    e.printStackTrace();                 // swallowed
}
// OUTPUT: HTTP 200, a truncated file, and Acrobat saying
// "Failed to load PDF document."

// The correct shape - close always runs, failures propagate
public static void employeeDetailReport(OutputStream out, List<Employee> employees) {

    try (PdfWriter writer = new PdfWriter(out);
         PdfDocument pdfDocument = new PdfDocument(writer);
         Document document = new Document(pdfDocument)) {

        document.add(new Paragraph("Velocity Corporate Training Center").setBold());
        document.add(buildTable(employees));
    }
    // All three are AutoCloseable in iText 7, and they close in
    // reverse order - Document, then PdfDocument, then PdfWriter -
    // which is exactly the order the format requires.
}`,
                `// And build in memory so a failure can still become a 500
@GetMapping("/pdf")
public ResponseEntity<byte[]> report() {

    ByteArrayOutputStream out = new ByteArrayOutputStream();
    PDFUtils.employeeDetailReport(out, employeeService.findAllEmployee());

    String filename = "employee_details_"
            + LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".pdf";

    return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\\"" + filename + "\\"")
            .contentLength(out.size())
            .body(out.toByteArray());
}
// OUTPUT on failure: a clean 500 with a JSON body, because no
// bytes had been written to the response yet.
// OUTPUT on success: 200 with a Content-Length, so the browser
// can show download progress.`
            ]
        },
        {
            content: `<h3>iText Licensing - the Thing to Check Before You Ship</h3>
This matters more than any API detail here.<br><br>

<table>
<tr><th>Version</th><th>Licence</th></tr>
<tr><td>iText 2.1.7 and earlier</td><td>LGPL/MPL - permissive, but ancient and unmaintained.</td></tr>
<tr><td>iText 5 and iText 7</td><td><strong>AGPL</strong>, or a paid commercial licence.</td></tr>
</table>
<br>
AGPL is copyleft that extends over a network: if users interact with your application over HTTP - which is exactly what this endpoint does - you must release your <strong>entire application's source</strong> under the AGPL, or buy a commercial licence from the vendor.<br><br>

For a closed-source commercial product this is a real cost, and it surprises teams late. Permissively-licensed alternatives:<br><br>

<table>
<tr><th>Library</th><th>Licence</th><th>Notes</th></tr>
<tr><td>Apache PDFBox</td><td>Apache 2.0</td><td>Lower-level; you position text yourself.</td></tr>
<tr><td>OpenPDF</td><td>LGPL/MPL</td><td>A fork of the last LGPL iText - closest drop-in.</td></tr>
<tr><td>Flying Saucer</td><td>LGPL</td><td>Renders XHTML + CSS to PDF; good with a Thymeleaf template.</td></tr>
<tr><td>JasperReports</td><td>LGPL</td><td>Full reporting engine with a visual designer.</td></tr>
</table>`,
            codeExamples: [
                `<!-- OpenPDF - the closest permissive substitute -->
<dependency>
    <groupId>com.github.librepdf</groupId>
    <artifactId>openpdf</artifactId>
    <version>1.3.30</version>
</dependency>`,
                `// Flying Saucer: render an HTML template to PDF.
// Often the most maintainable option - designers can edit the layout.
@Service
public class PdfReportService {

    private final TemplateEngine templateEngine;    // Thymeleaf

    public byte[] employeeReport(List<Employee> employees) throws IOException {

        Context context = new Context();
        context.setVariable("employees", employees);
        context.setVariable("generatedOn", LocalDate.now());

        String html = templateEngine.process("employee-report", context);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ITextRenderer renderer = new ITextRenderer();
        renderer.setDocumentFromString(html);
        renderer.layout();
        renderer.createPDF(out);
        return out.toByteArray();
    }
}
// employee-report.html is ordinary HTML with CSS - table styling,
// page breaks, headers and footers all come free, and the layout
// can be changed without touching Java.`
            ]
        },
        {
            content: `<h3>Large Reports: Repeating Headers and Page Breaks</h3>
A table with 5,000 rows spills across a hundred pages. By default the header row appears only on page one, so every page after that is unlabelled columns.<br><br>

<table>
<tr><th>Method</th><th>Effect</th></tr>
<tr><td><code>table.addHeaderCell(...)</code></td><td>Marks a cell as part of the header - repeated on every page.</td></tr>
<tr><td><code>table.addFooterCell(...)</code></td><td>Same for a footer row.</td></tr>
<tr><td><code>setSkipFirstHeader(true)</code></td><td>Omit the header on the first page when a title already covers it.</td></tr>
<tr><td><code>document.add(new AreaBreak())</code></td><td>Force a page break.</td></tr>
<tr><td><code>setLargeTable(true)</code></td><td>Flush rows to the output as they are added, instead of holding the whole table in memory.</td></tr>
</table>`,
            codeExamples: [
                `Table table = new Table(new float[] { 20f, 50f, 30f }, true);   // large table
table.setWidth(UnitValue.createPercentValue(100)).setFontSize(9);

// addHeaderCell - repeats on EVERY page
table.addHeaderCell(new Cell().add(new Paragraph("Id")).setBold());
table.addHeaderCell(new Cell().add(new Paragraph("Name")).setBold());
table.addHeaderCell(new Cell().add(new Paragraph("City")).setBold());

document.add(table);        // add the table BEFORE the rows, for a large table

int count = 0;
for (Employee emp : employees) {
    table.addCell(new Cell().add(new Paragraph(String.valueOf(emp.getId()))));
    table.addCell(new Cell().add(new Paragraph(emp.getName())));
    table.addCell(new Cell().add(new Paragraph(emp.getCity())));

    if (++count % 50 == 0) {
        table.flush();      // written out; memory released
    }
}
table.complete();
// OUTPUT: page 2, page 3 ... all carry the Id / Name / City header,
// and memory stays flat instead of growing with the row count.`,
                `// Page numbers via an event handler
pdfDocument.addEventHandler(PdfDocumentEvent.END_PAGE,
    event -> {
        PdfDocumentEvent e = (PdfDocumentEvent) event;
        PdfPage page = e.getPage();
        int number = pdfDocument.getPageNumber(page);

        new Canvas(new PdfCanvas(page), page.getPageSize())
                .showTextAligned(new Paragraph("Page " + number).setFontSize(8),
                        page.getPageSize().getWidth() / 2, 20,
                        TextAlignment.CENTER)
                .close();
    });
// OUTPUT: "Page 1", "Page 2" centred at the bottom of every page.`
            ]
        },
        {
            content: `<h3>Non-Latin Text Needs an Embedded Font</h3>
The built-in PDF fonts cover Latin-1 only. Hindi, Marathi, Chinese or even a plain rupee sign renders as blanks or boxes - silently, with no exception.<br>`,
            codeExamples: [
                `// The failing case
document.add(new Paragraph("नाम: अजय पाटील"));
// OUTPUT: an empty line in the PDF. No error is thrown.

// The fix - embed a font that has the glyphs
PdfFont devanagari = PdfFontFactory.createFont(
        "fonts/NotoSansDevanagari-Regular.ttf",
        PdfEncodings.IDENTITY_H,
        PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);

document.setFont(devanagari);
document.add(new Paragraph("नाम: अजय पाटील"));
// OUTPUT: the text renders correctly.
//
// IDENTITY_H is the key part - it selects 2-byte Unicode encoding.
// Embedding adds ~200 KB to the file but makes it render the same
// on a machine that does not have the font installed.`,
                `// Currency and symbols hit the same wall
document.add(new Paragraph("Premium: \\u20B9 12,000"));    // rupee sign
// OUTPUT with the default font: "Premium:  12,000"  (the symbol is dropped)
// OUTPUT with an embedded Unicode font: "Premium: ₹ 12,000"

// A quick check for a text-heavy report:
if (!font.containsGlyph(character)) {
    // fall back, or log which characters cannot be rendered
}`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which library generates the PDF here?</td><td>iText 7, via the <code>itext7-core</code> aggregate POM.</td></tr>
<tr><td>What are the four main iText 7 types?</td><td>PdfWriter (where bytes go), PdfDocument (the document), Document (the layout API), and elements like Table, Cell and Paragraph.</td></tr>
<tr><td>Why does <code>&lt;type&gt;pom&lt;/type&gt;</code> matter for itext7-core?</td><td>It is an aggregate POM, not a jar. Without it Maven fails looking for a jar that does not exist.</td></tr>
<tr><td>Why must <code>document.close()</code> always run?</td><td>Closing writes the PDF trailer and cross-reference table. Skip it and the file is structurally invalid and will not open.</td></tr>
<tr><td>What does <code>new Cell(1, 3)</code> do?</td><td>Creates a cell spanning 1 row and 3 columns - a merged title bar.</td></tr>
<tr><td>What do the floats in <code>new Table(new float[]{20f, 50f, 30f})</code> mean?</td><td>Relative column widths, so the middle column is 2.5x the first.</td></tr>
<tr><td>What is the licensing catch with iText 5 and 7?</td><td>AGPL or a paid commercial licence. AGPL triggers over a network, so a web app serving PDFs must open-source its whole codebase or buy a licence.</td></tr>
<tr><td>Which permissive alternatives exist?</td><td>Apache PDFBox (Apache 2.0), OpenPDF (LGPL/MPL), Flying Saucer for HTML-to-PDF, JasperReports.</td></tr>
<tr><td>How do you repeat a table header on every page?</td><td>Use <code>addHeaderCell()</code> instead of <code>addCell()</code> for the header row.</td></tr>
<tr><td>How do you keep a huge report from exhausting memory?</td><td>Create the table with <code>largeTable = true</code>, add it to the document first, then <code>flush()</code> periodically and <code>complete()</code> at the end.</td></tr>
<tr><td>Why does Hindi or a rupee sign come out blank?</td><td>The built-in fonts are Latin-1 only. Embed a Unicode TTF with <code>PdfEncodings.IDENTITY_H</code>.</td></tr>
<tr><td>Why build the PDF in memory rather than streaming to the response?</td><td>Once a byte is written the response is committed, so a later failure cannot become a 500 - the client saves a corrupt file instead.</td></tr>
</table>`
        }
    ]
};
