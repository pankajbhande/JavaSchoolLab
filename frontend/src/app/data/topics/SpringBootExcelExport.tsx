import { Topic } from '../coreJava';

export const springBootExcelExport: Topic = {
    id: 'spring-boot-excel-export',
    name: 'Excel Export with Apache POI',
    beginner: [
        {
            content: `<h3>Writing Excel Data - Exporting from MySQL into an Excel File</h3>
<strong>Business requirement:</strong> you have employee data stored in the database and want to fetch it and save it into an Excel file.<br><br>

<strong>Problem statement:</strong> design the REST API to fetch the employee data from the database and store it into an Excel file.<br><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   EMPLOYEE TABLE
 +--------------+
 | id      (PK) |
 | name         |
 | city         |
 +--------------+</pre>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add Maven dependencies &nbsp; 3. Create the model class<br>
4. Create the service &nbsp; 5. Create the service implementation &nbsp; 6. Create the repository<br>
7. Create the REST controller &nbsp; 8. application.properties &nbsp; 9. Run &nbsp; 10. Postman &nbsp; 11. Check the output
</div><br>

The new dependency is <strong>Apache POI</strong> - the Java library for reading and writing Microsoft Office formats.<br>`,
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
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>4.1.2</version>
</dependency>`,
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

    // getters, setters and toString()
}`
            ]
        },
        {
            content: `<h3>The Apache POI Object Model</h3>
Four types, nested inside each other. Once the hierarchy is clear the code reads naturally.<br><br>

<table>
<tr><th>Type</th><th>Represents</th></tr>
<tr><td>Workbook</td><td>The whole file - the .xls or .xlsx document.</td></tr>
<tr><td>Sheet</td><td>One tab inside the workbook.</td></tr>
<tr><td>Row</td><td>One row of that sheet, indexed from 0.</td></tr>
<tr><td>Cell</td><td>One cell in that row, indexed from 0.</td></tr>
</table>
<br>
<strong>Two implementations, two file formats:</strong><br><br>

<table>
<tr><th>Class prefix</th><th>Format</th></tr>
<tr><td>HSSF - <code>HSSFWorkbook</code></td><td>The old binary <code>.xls</code> (Excel 97-2003). Limited to 65,536 rows.</td></tr>
<tr><td>XSSF - <code>XSSFWorkbook</code></td><td>The modern <code>.xlsx</code>. Over a million rows. Needs the <code>poi-ooxml</code> dependency.</td></tr>
</table>
<br>
The walkthrough uses <code>HSSFWorkbook</code>, which is why the download is named <code>employee.xls</code>.<br>`
        },
        {
            content: `<h3>Steps 4 to 6 - Service, Implementation, Repository</h3>
The service builds the workbook and writes it straight into the response's output stream.<br>`,
            codeExamples: [
                `// Step 4 - EmployeeService.java
package com.velocity.services;

import java.io.IOException;
import javax.servlet.http.HttpServletResponse;

public interface EmployeeService {
    public void generateExcel(HttpServletResponse response) throws IOException;
}`,
                `// Step 5 - EmployeeServiceImpl.java
package com.velocity.service.impl;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
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
    public void generateExcel(HttpServletResponse response) throws IOException {

        List<Employee> employees = employeeRepository.findAll();

        // try-with-resources closes the workbook even if writing fails
        try (HSSFWorkbook workbook = new HSSFWorkbook()) {

            HSSFSheet sheet = workbook.createSheet("Employee Info");

            // Row 0 - the header
            HSSFRow header = sheet.createRow(0);
            header.createCell(0).setCellValue("id");
            header.createCell(1).setCellValue("name");
            header.createCell(2).setCellValue("city");

            // Rows 1..n - the data
            int dataRowIndex = 1;
            for (Employee employee : employees) {
                HSSFRow dataRow = sheet.createRow(dataRowIndex++);
                dataRow.createCell(0).setCellValue(employee.getId());
                dataRow.createCell(1).setCellValue(employee.getName());
                dataRow.createCell(2).setCellValue(employee.getCity());
            }

            ServletOutputStream ops = response.getOutputStream();
            workbook.write(ops);
            ops.flush();
        }
    }
}`,
                `// Step 6 - EmployeeRepository.java
package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.velocity.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
// Long, because Employee.id is declared Long.`
            ]
        },
        {
            content: `<h3>Step 7 - The REST Controller</h3>
Two headers turn a plain HTTP response into a file download.<br><br>

<table>
<tr><th>Header</th><th>Purpose</th></tr>
<tr><td><code>Content-Type: application/octet-stream</code></td><td>Tells the browser these are raw bytes, not text to render.</td></tr>
<tr><td><code>Content-Disposition: attachment; filename=employee.xls</code></td><td>Triggers the Save-As dialog and names the file.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity.controller;

import java.io.IOException;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.services.EmployeeService;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/excel")
    public void generateExcelReport(HttpServletResponse response) throws IOException {

        response.setContentType("application/octet-stream");

        String headerKey   = "Content-Disposition";
        String headerValue = "attachment;filename=employee.xls";
        response.setHeader(headerKey, headerValue);

        employeeService.generateExcel(response);
    }
}`,
                `# Step 8 - application.properties
server.port=8181

#MySQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/test?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`,
                `// Step 10 - the request
// Method: GET  (the endpoint is @GetMapping, so GET - not POST)
// URL:    http://localhost:8181/excel
// Body:   nothing

// RESPONSE (200 OK)
// Content-Type: application/octet-stream
// Content-Disposition: attachment;filename=employee.xls
// <binary .xls bytes>

// Opening the same URL in a browser downloads employee.xls.
// The file contains:
//   +----+-------+--------+
//   | id | name  | city   |     <- row 0, the header
//   +----+-------+--------+
//   | 1  | ajay  | pune   |     <- row 1
//   | 2  | sohan | mumbai |     <- row 2
//   +----+-------+--------+

// CONSOLE:
// Hibernate: select employee0_.id, employee0_.city, employee0_.name
//            from employee employee0_`
            ]
        }
    ],

    expert: [
        {
            content: `<h3><code>poi</code> Alone Only Gives You <code>.xls</code></h3>
The dependency list has <code>org.apache.poi:poi</code>, which contains the HSSF classes and produces the 1997-era binary format. That format has hard limits people still hit:<br><br>

<table>
<tr><th>Limit</th><th>.xls (HSSF)</th><th>.xlsx (XSSF)</th></tr>
<tr><td>Rows per sheet</td><td>65,536</td><td>1,048,576</td></tr>
<tr><td>Columns per sheet</td><td>256</td><td>16,384</td></tr>
<tr><td>Dependency</td><td><code>poi</code></td><td><code>poi-ooxml</code></td></tr>
<tr><td>Correct MIME type</td><td><code>application/vnd.ms-excel</code></td><td><code>application/vnd.openxmlformats-officedocument.spreadsheetml.sheet</code></td></tr>
</table>
<br>
Export 70,000 employees to HSSF and POI throws <code>IllegalArgumentException: Invalid row number (65536)</code> part-way through - after the response headers have already been sent, so the browser saves a truncated, corrupt file.<br><br>

<code>application/octet-stream</code> works because it means "unknown binary", but the specific MIME type lets the operating system pick Excel to open it.<br>`,
            codeExamples: [
                `<!-- For .xlsx, poi-ooxml (it pulls in poi transitively) -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>`,
                `// The same code against XSSF - the API is identical
try (XSSFWorkbook workbook = new XSSFWorkbook()) {

    XSSFSheet sheet = workbook.createSheet("Employee Info");

    XSSFRow header = sheet.createRow(0);
    header.createCell(0).setCellValue("id");
    ...
}

// and the accurate headers:
response.setContentType(
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
response.setHeader("Content-Disposition", "attachment; filename=employee.xlsx");
// OUTPUT: Windows and macOS now open it in Excel on double-click
// instead of asking which application to use.`
            ]
        },
        {
            content: `<h3>Large Exports: <code>SXSSFWorkbook</code> and Streaming the Query</h3>
Two independent memory problems sit in this endpoint, and both bite at the same scale.<br><br>

<table>
<tr><th>Problem</th><th>Fix</th></tr>
<tr><td><code>findAll()</code> loads every row as a managed entity</td><td>Stream the results, or page through them</td></tr>
<tr><td><code>HSSFWorkbook</code>/<code>XSSFWorkbook</code> hold the whole sheet in memory</td><td><code>SXSSFWorkbook</code> - keeps a sliding window of rows and flushes the rest to a temp file</td></tr>
</table>
<br>
With 500,000 employees the naive version needs gigabytes; the streaming version stays flat at a few hundred megabytes.<br><br>

<strong>One caveat:</strong> <code>SXSSFWorkbook</code> writes rows to disk as it goes, so you must call <code>dispose()</code> to delete the temp files - otherwise the server's temp directory fills up.<br>`,
            codeExamples: [
                `@Override
public void generateExcel(HttpServletResponse response) throws IOException {

    // 100 rows stay in memory; older ones are flushed to a temp file.
    SXSSFWorkbook workbook = new SXSSFWorkbook(100);
    try {
        Sheet sheet = workbook.createSheet("Employee Info");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("id");
        header.createCell(1).setCellValue("name");
        header.createCell(2).setCellValue("city");

        int rowIndex = 1;
        // Stream instead of findAll(): rows arrive one at a time.
        try (Stream<Employee> employees = employeeRepository.streamAll()) {
            for (Employee e : (Iterable<Employee>) employees::iterator) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(e.getId());
                row.createCell(1).setCellValue(e.getName());
                row.createCell(2).setCellValue(e.getCity());
            }
        }

        workbook.write(response.getOutputStream());
        response.getOutputStream().flush();

    } finally {
        workbook.dispose();     // deletes the temp files - do not skip this
        workbook.close();
    }
}`,
                `// The streaming repository method
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @QueryHints(@QueryHint(name = HINT_FETCH_SIZE, value = "1000"))
    @Query("select e from Employee e")
    Stream<Employee> streamAll();
}
// The method must be called inside a transaction, and the Stream
// must be closed - hence the try-with-resources above.

// Detaching each entity keeps the persistence context from growing:
@Transactional(readOnly = true)
public void export(...) {
    try (Stream<Employee> s = repo.streamAll()) {
        s.forEach(e -> {
            writeRow(e);
            entityManager.detach(e);
        });
    }
}
// OUTPUT: heap usage stays flat whether the table has 1,000 rows
// or 1,000,000.`
            ]
        },
        {
            content: `<h3>Errors After the First Byte Cannot Be Reported</h3>
Writing directly into <code>HttpServletResponse</code> is efficient and has one sharp edge: once any byte has been written, the status code and headers are already sent. A failure after that point cannot become a 500 - the client just receives a truncated file.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">response.setContentType(...)          headers queued
response.setHeader(...)               headers queued
workbook.write(outputStream)          FIRST BYTE -> headers committed
    |
    v
  exception here
    |
    v
Spring tries to send a 500 error page and cannot:
    java.lang.IllegalStateException: Cannot call sendError() after
    the response has been committed
The browser saves a corrupt .xls with HTTP 200.</pre>
<br>
For anything that can plausibly fail, build the workbook in memory first, then write it - so a failure still becomes a proper error response.<br>`,
            codeExamples: [
                `// Build first, send second - errors stay reportable
@GetMapping("/excel")
public ResponseEntity<byte[]> excel() throws IOException {

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    try (XSSFWorkbook workbook = new XSSFWorkbook()) {
        buildSheet(workbook, employeeRepository.findAll());
        workbook.write(out);          // any failure happens HERE,
    }                                 // before a single byte is sent

    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\\"employee.xlsx\\"")
            .contentLength(out.size())
            .body(out.toByteArray());
}
// OUTPUT on success: 200 with a Content-Length, so the browser
//   can show a real progress bar.
// OUTPUT on failure: a clean 500 with a JSON error body, because
//   nothing had been written yet.
//
// The trade-off: the whole file sits in memory. Use this for
// reports up to a few MB, and SXSSF streaming for the big ones.`,
                `// A generated filename makes reports self-describing
String filename = "employees_"
        + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
        + ".xlsx";
// OUTPUT: employees_20230914.xlsx`
            ]
        },
        {
            content: `<h3>Formatting: Types, Widths and a Frozen Header</h3>
<code>setCellValue()</code> is overloaded, and which overload runs decides whether Excel sees a number or a string. Passing everything as a String is the usual reason a spreadsheet cannot be sorted or summed.<br><br>

<table>
<tr><th>Call</th><th>Cell type in Excel</th></tr>
<tr><td><code>setCellValue(long)</code> / <code>(double)</code></td><td>Numeric - sortable, summable</td></tr>
<tr><td><code>setCellValue(String)</code></td><td>Text - <code>"10"</code> sorts before <code>"9"</code></td></tr>
<tr><td><code>setCellValue(boolean)</code></td><td>Boolean</td></tr>
<tr><td><code>setCellValue(Date)</code> + a date style</td><td>Date. Without the style it shows as a serial number like 45183.</td></tr>
</table>`,
            codeExamples: [
                `// A header that looks like a header, and columns you can read
private void buildSheet(Workbook workbook, List<Employee> employees) {

    Sheet sheet = workbook.createSheet("Employee Info");

    // Bold header style
    CellStyle headerStyle = workbook.createCellStyle();
    Font bold = workbook.createFont();
    bold.setBold(true);
    headerStyle.setFont(bold);

    Row header = sheet.createRow(0);
    String[] titles = { "id", "name", "city" };
    for (int i = 0; i < titles.length; i++) {
        Cell cell = header.createCell(i);
        cell.setCellValue(titles[i]);
        cell.setCellStyle(headerStyle);
    }

    int r = 1;
    for (Employee e : employees) {
        Row row = sheet.createRow(r++);
        row.createCell(0).setCellValue(e.getId());     // long -> NUMERIC
        row.createCell(1).setCellValue(e.getName());   // String -> TEXT
        row.createCell(2).setCellValue(e.getCity());
    }

    // Freeze row 0 so the header stays visible when scrolling
    sheet.createFreezePane(0, 1);

    // Auto-size AFTER the data is written, or the widths are wrong
    for (int i = 0; i < titles.length; i++) {
        sheet.autoSizeColumn(i);
    }
}
// OUTPUT: bold header, correct column widths, a frozen top row,
// and an id column Excel will sort numerically.
//
// NOTE: autoSizeColumn is expensive - it measures every cell.
// On a 100,000-row export, set fixed widths with
// sheet.setColumnWidth(i, 20 * 256) instead.`,
                `// Dates need an explicit style or Excel shows the serial number
CellStyle dateStyle = workbook.createCellStyle();
CreationHelper helper = workbook.getCreationHelper();
dateStyle.setDataFormat(helper.createDataFormat().getFormat("dd-MM-yyyy"));

Cell cell = row.createCell(3);
cell.setCellValue(java.sql.Date.valueOf(e.getJoinedOn()));
cell.setCellStyle(dateStyle);
// OUTPUT with the style:    14-07-2023
// OUTPUT without the style: 45121`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which library writes Excel files from Java?</td><td>Apache POI.</td></tr>
<tr><td>What are the four core POI types?</td><td>Workbook, Sheet, Row and Cell - each nested inside the one before it.</td></tr>
<tr><td>Difference between HSSF, XSSF and SXSSF?</td><td>HSSF writes the old binary <code>.xls</code>; XSSF writes <code>.xlsx</code>; SXSSF writes <code>.xlsx</code> with a sliding in-memory window for very large files.</td></tr>
<tr><td>What is the row limit of a .xls file?</td><td>65,536. Exceeding it throws <code>IllegalArgumentException: Invalid row number</code>. <code>.xlsx</code> allows 1,048,576.</td></tr>
<tr><td>Which dependency do you need for .xlsx?</td><td><code>poi-ooxml</code> - <code>poi</code> alone only provides HSSF.</td></tr>
<tr><td>Which headers turn a response into a file download?</td><td><code>Content-Type</code> (the MIME type) and <code>Content-Disposition: attachment; filename=...</code>.</td></tr>
<tr><td>Why must <code>dispose()</code> be called on SXSSFWorkbook?</td><td>It flushes rows to temporary files; without <code>dispose()</code> those files are never deleted.</td></tr>
<tr><td>Why can't you return a 500 after writing to the output stream?</td><td>The first byte commits the response, so headers and status are already sent - <code>sendError()</code> then throws IllegalStateException and the client gets a truncated file.</td></tr>
<tr><td>How do you avoid that?</td><td>Build the workbook into a <code>ByteArrayOutputStream</code> first and return it as a <code>ResponseEntity&lt;byte[]&gt;</code>.</td></tr>
<tr><td>Why do numbers sort wrongly in an export?</td><td>They were written with the <code>String</code> overload of <code>setCellValue</code>, so Excel treats them as text.</td></tr>
<tr><td>Why does a date show as 45183?</td><td>Excel stores dates as serial numbers; the cell needs a <code>CellStyle</code> with a date format applied.</td></tr>
<tr><td>When should you avoid <code>autoSizeColumn</code>?</td><td>On large exports - it measures every cell in the column. Set fixed widths instead.</td></tr>
</table>`
        }
    ]
};
