import { Topic } from '../coreJava';

export const springBootBatch: Topic = {
    id: 'spring-boot-batch',
    name: 'Spring Batch',
    beginner: [
        {
            content: `<h3>What is Spring Batch?</h3>
<div class="border">
• <strong>Spring Batch</strong> is a framework for <strong>batch processing</strong>: running a series of automated jobs over a large volume of data with no user sitting in front of it.<br>
• A batch job is not a request/response. Nobody is waiting for an HTTP status code. It starts, it reads a lot of records, it writes them somewhere, and it either finishes or it fails.<br>
• The framework's real contribution is not the reading and writing - it is the bookkeeping: knowing which job ran, when, with what parameters, how far it got, and where to resume if it died halfway.<br>
</div><br>

<h3>Why do you need it?</h3>
Suppose you have to take the data out of a CSV file and load it into a database. You can write a loop: open the file, parse each line, run an <code>INSERT</code>. That works for a hundred rows on your machine. Then reality arrives.<br><br>

<table>
<tr><th>Question</th><th>What a hand-written loop does</th></tr>
<tr><td>The file has 2 million rows and the process dies at row 1.4 million. Now what?</td><td>You start again from row 1, and the first 1.4 million rows are inserted twice.</td></tr>
<tr><td>Did last night's load actually run?</td><td>You grep a log file, if anyone kept one.</td></tr>
<tr><td>Twelve rows have a malformed date. Should the whole load fail?</td><td>It does fail, on the first bad row, and you lose the work already done.</td></tr>
<tr><td>Two million single-row inserts take four hours.</td><td>Nothing batches them, and each one is its own transaction.</td></tr>
<tr><td>Somebody triggers the same load twice by accident.</td><td>It runs twice.</td></tr>
</table>
<br>

Spring Batch answers all five, and that is why it exists. It is not a faster loop; it is a loop with a memory.<br>`
        },
        {
            content: `<h3>Spring Batch architecture</h3>
Six pieces, and they compose in exactly one shape.<br><br>

<table>
<tr><th>Component</th><th>Responsibility</th></tr>
<tr><td><strong>Job</strong></td><td>The unit of work as a whole - "import users from CSV". A single execution containing a series of processes. A Job is made of one or more Steps.</td></tr>
<tr><td><strong>Step</strong></td><td>One independent phase of the Job. A Job is divided into multiple Steps, and each Step has its own reader, processor and writer, and its own transaction boundary.</td></tr>
<tr><td><strong>JobLauncher</strong></td><td>Starts a Job. Its single method is <code>run(Job, JobParameters)</code>. It is what turns a Job definition into a JobExecution.</td></tr>
<tr><td><strong>JobRepository</strong></td><td>Stores everything about a run - start time, end time, status, exit code, parameters, how many items were read, written and skipped. This is the memory that makes restart possible.</td></tr>
<tr><td><strong>ItemReader</strong></td><td>Reads one item at a time from the source. <code>read()</code> returns the next item, or <code>null</code> when the input is exhausted - that <code>null</code> is what ends the Step.</td></tr>
<tr><td><strong>ItemProcessor</strong></td><td>Sits between reader and writer. It transforms, validates or enriches an item. Returning <code>null</code> from <code>process()</code> filters the item out - it is never written.</td></tr>
<tr><td><strong>ItemWriter</strong></td><td>Writes items to the destination. It takes a <em>chunk</em> of items, not one - which is what makes bulk inserts possible.</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                                  JOB  "USER-IMPORT-JOB"
        +--------------------------------------------------------------+
        |                          STEP  "step1"                       |
        |                                                              |
        |   ItemReader  ---->  ItemProcessor  ---->  ItemWriter        |
        |      read()           process(item)         write(chunk)     |
        |        |                   |                     |           |
   CSV  |        | one item          | one item            | 10 items  |  MySQL
 SOURCE +--------+-------------------+---------------------+-----------+ DESTINATION
                 |                                         |
                 +---- repeat 10 times (chunk size) -------+
                                                           |
                                              COMMIT the transaction

Fig - Batch processing internal flow.
The reader and processor work ONE item at a time.
The writer works on the whole CHUNK at once.</pre>
<br>
<strong>Note:</strong> the ItemProcessor is optional. If your Step only moves data unchanged, wire reader straight to writer and leave the processor out. A processor that does nothing but <code>return user;</code> earns nothing.<br>`
        },
        {
            content: `<h3>Problem statement</h3>
Save CSV file data into MySQL using Spring Batch. The application reads <code>test.csv</code> from the classpath, maps each line onto a <code>User</code> object, and inserts every row into the <code>users</code> table.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add the Maven dependencies &nbsp; 3. <code>application.properties</code><br>
4. Create <code>test.csv</code> under <code>src/main/resources</code> &nbsp; 5. Model class <code>User</code><br>
6. <code>UserItemProcessor</code> &nbsp; 7. <code>BatchConfig.java</code> - reader, processor, writer, Step, Job<br>
8. Run the application &nbsp; 9. Check the table in MySQL
</div><br>

<strong>Two things about the dependencies.</strong> First, <code>spring-boot-starter-batch</code> brings in <code>spring-jdbc</code> but not a <code>DataSource</code>; you need a JDBC driver and either <code>spring-boot-starter-data-jpa</code> or <code>spring-boot-starter-jdbc</code>. Second, the artifact <code>mysql:mysql-connector-java</code> that the classroom material uses is the <strong>relocated</strong> coordinate - Oracle moved it to <code>com.mysql:mysql-connector-j</code>. The old one still resolves and prints a relocation warning, but new projects should use the new coordinate and let the Boot BOM choose the version.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- The PDF uses:
       <groupId>mysql</groupId>
       <artifactId>mysql-connector-java</artifactId>
       <version>8.0.33</version>
     Maven then logs:
       [WARNING] The artifact mysql:mysql-connector-java:jar:8.0.33 has been
       relocated to com.mysql:mysql-connector-j:jar:8.0.33
     Use the new coordinate and drop the hard-coded <version> - the Spring
     Boot BOM already manages it. -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.springframework.batch</groupId>
    <artifactId>spring-batch-test</artifactId>
    <scope>test</scope>
</dependency>`,
                `# Step 3 - src/main/resources/application.properties
server.port=8082

# The PDF writes  spring.datasource.driver-class-name=com.mysql.jdbc.Driver
# That class is the LEGACY driver name. It still works through a shim but logs:
#   Loading class 'com.mysql.jdbc.Driver'. This is deprecated. The new driver
#   class is 'com.mysql.cj.jdbc.Driver'.
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# The PDF's URL is broken across two lines as
#   jdbc:mysql://localhost:3306/bootdept
#   h2
# which is one value, "bootdepth2", split by the PDF exporter - not an H2
# database. Use whatever schema you actually created.
spring.datasource.url=jdbc:mysql://localhost:3306/bootdepth2
spring.datasource.username=root
spring.datasource.password=root

# MISSING FROM THE PDF, AND THE MOST COMMON REASON THIS PROJECT FAILS.
# Spring Batch keeps its own metadata in six BATCH_* tables. They do not
# exist in a fresh schema, so the very first run dies with:
#   java.sql.SQLSyntaxErrorException: Table 'bootdepth2.BATCH_JOB_INSTANCE'
#   doesn't exist
# This tells Boot to run the vendor DDL script that creates them.
spring.batch.jdbc.initialize-schema=always
# Spring Boot 2.x spelled this  spring.batch.initialize-schema=always

# The business table has to exist too. Let Hibernate create it for the demo.
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
# ddl-auto=create would DROP AND RECREATE every table on each restart,
# including your data. Never use it against a database you care about.`,
                `# Step 4 - src/main/resources/test.csv
id,name,gender,batchname,position
1,Raoji,Male,JavaFS-Morning,Trainee
2,Suryaji,Female,JavaFS-Morning,Developer
3,Anandrao,Male,JavaFS-Evening,Trainee
4,Prataprao,Female,JavaFS-Evening,Senior Developer
5,Karan,Male,JavaFS-Morning,Developer

# The first line is a HEADER, which is why the reader is told to skip one
# line. Note "Senior Developer" contains a space but no comma - a comma
# inside a value would break DelimitedLineTokenizer unless the value is
# quoted, and even then you must set the quote character.`
            ]
        },
        {
            content: `<h3>Step 5 - the model class</h3>
A plain Java object, one field per CSV column. Spring Batch does not require it to be a JPA entity - the writer in this project is a <code>JdbcBatchItemWriter</code> and works on named SQL parameters, not on Hibernate. The <code>@Entity</code> annotation below is present only so that <code>ddl-auto=update</code> creates the destination table for you.<br><br>

<strong>The no-argument constructor is mandatory.</strong> <code>BeanWrapperFieldSetMapper</code> instantiates the target type reflectively and then calls setters. Without a default constructor the reader fails on the first line.<br>`,
            codeExamples: [
                `// Step 5 - User.java
package com.velocity.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Spring Boot 3.x uses jakarta.persistence.*
// Spring Boot 2.x used  javax.persistence.*  - same annotations, old package.

// "user" is a RESERVED WORD in MySQL 8. The PDF's SQL
//   insert into user(id,name,...) values(...)
// fails with:
//   You have an error in your SQL syntax ... near 'user(id,name,gender,
//   batchname,position)'
// Either quote it as \`user\` everywhere or, better, name the table "users".
@Entity
@Table(name = "users")
public class User {

    @Id
    private long id;
    private String name;
    private String gender;
    private String batchname;
    private String position;

    // Required by BeanWrapperFieldSetMapper. Without it:
    //   org.springframework.beans.BeanInstantiationException: Failed to
    //   instantiate [com.velocity.model.User]: No default constructor found
    public User() {
    }

    public User(long id, String name, String gender,
                String batchname, String position) {
        super();
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.batchname = batchname;
        this.position = position;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBatchname() { return batchname; }
    public void setBatchname(String batchname) { this.batchname = batchname; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    // The PDF omits toString(). Add it - every batch log line that prints an
    // item is otherwise com.velocity.model.User@6f7fd0e6.
    @Override
    public String toString() {
        return "User [id=" + id + ", name=" + name + ", gender=" + gender
             + ", batchname=" + batchname + ", position=" + position + "]";
    }
}`,
                `// Step 6 - UserItemProcessor.java
package com.velocity.config;

import org.springframework.batch.item.ItemProcessor;
import com.velocity.model.User;

// Runs AFTER the reader has produced an item and BEFORE the writer stores it.
// ItemProcessor<I, O> - the input type and the output type may differ. Here
// both are User because nothing changes type.
public class UserItemProcessor implements ItemProcessor<User, User> {

    @Override
    public User process(User user) throws Exception {
        // The PDF's version is exactly "return user;" - a no-op. A processor
        // that changes nothing should be removed from the Step entirely.
        // Below is what a processor is actually for: normalise and filter.

        if (user.getName() == null || user.getName().isBlank()) {
            return null;      // returning null FILTERS the item - it is never
                              // written, and the filterCount metric goes up.
                              // This is not an error and does not stop the job.
        }
        user.setName(user.getName().trim());
        user.setGender(user.getGender() == null
                       ? "Unknown"
                       : user.getGender().trim().toUpperCase());
        return user;
    }
}
// A common misunderstanding: returning null does NOT mean "skip because of an
// error". Skipping on error is what a skip policy does. null means "this item
// is not interesting", and the job stays COMPLETED.`
            ]
        },
        {
            content: `<h3>Step 7 - BatchConfig: reader, writer, Step, Job</h3>
This is the whole application. Read it in four parts.<br><br>

<table>
<tr><th>Bean</th><th>What it does</th></tr>
<tr><td><code>FlatFileItemReader&lt;User&gt;</code></td><td>Reads the file one line at a time. <code>setResource</code> points it at the CSV; <code>setLinesToSkip(1)</code> skips the header row; <code>setLineMapper</code> tells it how to turn a line of text into a <code>User</code>.</td></tr>
<tr><td><code>DefaultLineMapper</code></td><td>The two-stage mapper. A <strong>LineTokenizer</strong> splits the raw line into a <code>FieldSet</code>, then a <strong>FieldSetMapper</strong> turns that <code>FieldSet</code> into an object.</td></tr>
<tr><td><code>DelimitedLineTokenizer</code></td><td>Splits on a delimiter (comma by default). <code>setNames(...)</code> gives each column a name - these names must match the <em>property names of the target class</em>, not the CSV header text.</td></tr>
<tr><td><code>BeanWrapperFieldSetMapper</code></td><td>Creates an instance of the target type and calls the setter matching each column name. Type conversion from <code>String</code> to <code>long</code> happens here.</td></tr>
<tr><td><code>JdbcBatchItemWriter&lt;User&gt;</code></td><td>Executes one SQL statement for the whole chunk using JDBC batching. <code>BeanPropertyItemSqlParameterSourceProvider</code> binds the named parameters <code>:id</code>, <code>:name</code> and so on from the bean's properties.</td></tr>
</table>
<br>

<strong>The version question you will hit immediately.</strong> The classroom code injects <code>JobBuilderFactory</code> and <code>StepBuilderFactory</code>. Those two classes were deprecated in Spring Batch 4.3 and <strong>removed in Spring Batch 5</strong>, which is what Spring Boot 3 ships. Both versions are shown below, because you will meet both.<br>`,
            codeExamples: [
                `// Step 7 - BatchConfig.java  (SPRING BATCH 5 / SPRING BOOT 3 - current)
package com.velocity.config;

import javax.sql.DataSource;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.database.BeanPropertyItemSqlParameterSourceProvider;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.LineMapper;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.PlatformTransactionManager;

import com.velocity.model.User;

@Configuration
// NO @EnableBatchProcessing. With Spring Boot 3 the batch auto-configuration
// supplies the JobRepository, the JobLauncher and the transaction manager.
// Adding @EnableBatchProcessing here switches that auto-configuration OFF and
// you then have to declare all of it yourself.
public class BatchConfig {

    @Bean
    public FlatFileItemReader<User> reader() {
        FlatFileItemReader<User> reader = new FlatFileItemReader<>();
        reader.setResource(new ClassPathResource("test.csv"));
        reader.setLineMapper(lineMapper());
        // The PDF's comment says "if file does not contain column name then
        // skip it" - that is backwards. You skip a line BECAUSE the file has
        // a header. Leave it at 0 for a headerless file, or the header row is
        // parsed as data and you get:
        //   NumberFormatException: For input string: "id"
        reader.setLinesToSkip(1);
        reader.setName("userItemReader");   // needed for restart state keys
        return reader;
    }

    private LineMapper<User> lineMapper() {
        DefaultLineMapper<User> lineMapper = new DefaultLineMapper<>();

        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setDelimiter(",");
        // These names are matched against the SETTERS on User, not against
        // the CSV header line. A typo here is silent: the field is simply
        // never populated and the column arrives as null.
        tokenizer.setNames("id", "name", "gender", "batchname", "position");
        // The PDF also calls setIncludedFields(new int[]{0,1,2,3,4}).
        // That is the default (all columns) - it only matters when you want
        // to IGNORE columns. Redundant here.

        BeanWrapperFieldSetMapper<User> fieldSetMapper = new BeanWrapperFieldSetMapper<>();
        fieldSetMapper.setTargetType(User.class);

        lineMapper.setLineTokenizer(tokenizer);
        lineMapper.setFieldSetMapper(fieldSetMapper);
        return lineMapper;
    }

    @Bean
    public UserItemProcessor processor() {
        return new UserItemProcessor();
    }

    @Bean
    public JdbcBatchItemWriter<User> writer(DataSource dataSource) {
        JdbcBatchItemWriter<User> writer = new JdbcBatchItemWriter<>();
        writer.setItemSqlParameterSourceProvider(
                new BeanPropertyItemSqlParameterSourceProvider<User>());
        // "user" quoted, or renamed to "users" - see the note in User.java.
        writer.setSql("insert into users (id, name, gender, batchname, position) "
                    + "values (:id, :name, :gender, :batchname, :position)");
        writer.setDataSource(dataSource);
        return writer;
    }

    @Bean
    public Step step1(JobRepository jobRepository,
                      PlatformTransactionManager txManager,
                      FlatFileItemReader<User> reader,
                      UserItemProcessor processor,
                      JdbcBatchItemWriter<User> writer) {
        // Spring Batch 5: StepBuilder takes the name AND the JobRepository.
        return new StepBuilder("step1", jobRepository)
                .<User, User>chunk(10, txManager)   // chunk size AND tx manager
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public Job importUserJob(JobRepository jobRepository, Step step1) {
        // Spring Batch 5: JobBuilder takes the name AND the JobRepository.
        return new JobBuilder("USER-IMPORT-JOB", jobRepository)
                .incrementer(new RunIdIncrementer())
                .start(step1)
                .build();
        // The PDF writes .flow(step1()).end().build(). That is the flow API and
        // is equivalent for a single step; .start(step) is the plain form.
    }
}`,
                `// Step 7 - BatchConfig.java  (SPRING BATCH 4 / SPRING BOOT 2 - the PDF's version)
// Kept for reference. Do not copy this into a Boot 3 project: JobBuilderFactory
// and StepBuilderFactory were REMOVED in Spring Batch 5 and the imports will
// not resolve.
@Configuration
@EnableBatchProcessing      // required in Boot 2.x, harmful in Boot 3.x
public class BatchConfig {

    @Autowired private DataSource dataSource;
    @Autowired private JobBuilderFactory jobBuilderFactory;
    @Autowired private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Step step1() {
        return this.stepBuilderFactory.get("step1")
                .<User, User>chunk(10)          // no transaction manager argument
                .reader(reader())
                .processor(processor())
                .writer(writer())
                .build();
    }

    @Bean
    public Job importUserJob() {
        return this.jobBuilderFactory.get("USER-IMPORT-JOB")
                .incrementer(new RunIdIncrementer())
                .flow(step1())
                .end()
                .build();
    }
}
// Migration cheat sheet, Batch 4 -> Batch 5:
//   jobBuilderFactory.get(name)   ->  new JobBuilder(name, jobRepository)
//   stepBuilderFactory.get(name)  ->  new StepBuilder(name, jobRepository)
//   .chunk(10)                    ->  .chunk(10, transactionManager)
//   @EnableBatchProcessing        ->  delete it (Boot 3 auto-configures)`
            ]
        },
        {
            content: `<h3>Steps 8 and 9 - run it and check the database</h3>
There is no controller and no Postman request in this project. Spring Boot's <code>JobLauncherApplicationRunner</code> finds every <code>Job</code> bean in the context and runs it automatically once the application context is ready. The web starter is only there so the process stays alive; a pure batch application does not need it.<br><br>

<strong>Run it a second time and watch what happens.</strong> That is the single most instructive moment in this whole exercise, and it is covered in the expert section.<br>`,
            codeExamples: [
                `// Step 8 - console output of the FIRST run
//
//   :: Spring Boot ::                (v3.2.5)
//
// INFO  o.s.b.c.l.s.SimpleJobLauncher : Job: [SimpleJob: [name=USER-IMPORT-JOB]]
//       launched with the following parameters: [{'run.id':'{value=1, type=class
//       java.lang.Long, identifying=true}'}]
// INFO  o.s.batch.core.job.SimpleStepHandler : Executing step: [step1]
// Hibernate: insert into users (id,name,gender,batchname,position) values (?,?,?,?,?)
// Hibernate: insert into users (id,name,gender,batchname,position) values (?,?,?,?,?)
// INFO  o.s.batch.core.step.AbstractStep : Step: [step1] executed in 231ms
// INFO  o.s.b.c.l.s.SimpleJobLauncher : Job: [SimpleJob: [name=USER-IMPORT-JOB]]
//       completed with the following parameters: [{'run.id':'{value=1,...}'}]
//       and the following status: [COMPLETED] in 289ms

// Step 9 - check the table
// mysql> select * from users;
// +----+-----------+--------+----------------+------------------+
// | id | name      | gender | batchname      | position         |
// +----+-----------+--------+----------------+------------------+
// |  1 | Raoji     | MALE   | JavaFS-Morning | Trainee          |
// |  2 | Suryaji   | FEMALE | JavaFS-Morning | Developer        |
// |  3 | Anandrao  | MALE   | JavaFS-Evening | Trainee          |
// |  4 | Prataprao | FEMALE | JavaFS-Evening | Senior Developer |
// |  5 | Karan     | MALE   | JavaFS-Morning | Developer        |
// +----+-----------+--------+----------------+------------------+
// 5 rows in set (0.00 sec)`,
                `# Two properties worth knowing before you run anything

# 1. Stop the job from firing on every application startup. Useful when the
#    job should be triggered by a REST endpoint or a scheduler instead.
#    Spring Boot 2.x:
spring.batch.job.enabled=false
#    Spring Boot 3.x removed that flag. You now name the jobs to run, and
#    "none" means run nothing:
spring.batch.job.name=none

# 2. If you have several Job beans, Boot 2.x runs ALL of them unless you set
#    spring.batch.job.names=importUserJob. Boot 3.x uses the singular
#    spring.batch.job.name and accepts one job.`,
                `// Common startup failures, and what they actually mean.

// (a) Table 'bootdepth2.BATCH_JOB_INSTANCE' doesn't exist
//     -> spring.batch.jdbc.initialize-schema=always is missing.

// (b) org.springframework.batch.item.ItemStreamException: Failed to
//     initialize the reader
//     Caused by: java.lang.IllegalStateException: Input resource must exist
//     (reader is in 'strict' mode): class path resource [test.csv]
//     -> the file is not on the classpath. It must be under
//        src/main/resources, not next to the pom. If an empty input is
//        legitimate, call reader.setStrict(false).

// (c) FlatFileParseException: Parsing error at line: 1 in resource=[test.csv],
//     input=[id,name,gender,batchname,position]
//     Caused by: NumberFormatException: For input string: "id"
//     -> setLinesToSkip(1) is missing and the header is being parsed as data.

// (d) IncorrectTokenCountException: Incorrect number of tokens found in
//     record: expected 5 actual 6
//     -> a value in the CSV contains a comma. Quote it and configure the
//        tokenizer's quote character, or switch delimiter.

// (e) Duplicate entry '1' for key 'users.PRIMARY'
//     -> you ran the job twice and it re-inserted the same rows. The insert
//        is not idempotent. See the expert section on restart semantics.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The model underneath the annotations</h3>
Spring Batch is small once you see the shape. A <strong>Job</strong> is a container of <strong>Steps</strong>. A chunk-oriented Step is a loop driven by three interfaces. Everything else - listeners, skip policies, partitioning - hangs off that loop.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                            JobLauncher.run(job, jobParameters)
                                        |
                                        v
        +-------------------------------------------------------------+
        |  JobInstance  = job name + IDENTIFYING job parameters        |
        |     |                                                       |
        |     +--> JobExecution #1   FAILED                            |
        |     +--> JobExecution #2   COMPLETED   (a restart)           |
        +-------------------------------------------------------------+
                                        |
                                        v
        +-------------------------------------------------------------+
        |  JOB "USER-IMPORT-JOB"                                      |
        |                                                             |
        |   +---------------+     +---------------+                   |
        |   |  STEP  load   |---->|  STEP  report |  (on COMPLETED)   |
        |   +---------------+     +---------------+                   |
        +---------|---------------------------------------------------+
                  |
                  v
   +---------------------------------------------------------------------+
   |  CHUNK-ORIENTED STEP,  commit-interval = 10                         |
   |                                                                     |
   |   begin transaction                                                 |
   |     repeat 10 times:                                                |
   |         item  = reader.read()          <-- one item                 |
   |         out   = processor.process(item) <-- one item, may be null   |
   |         accumulate out into a List                                  |
   |     writer.write(chunk of <=10)         <-- the WHOLE list at once  |
   |     jobRepository.update(stepExecution) <-- read/write counts, ctx  |
   |   commit transaction                                                |
   |                                                                     |
   |   ...until reader.read() returns null                               |
   +---------------------------------------------------------------------+
                  |
                  v
        JobRepository  ->  BATCH_JOB_INSTANCE
                           BATCH_JOB_EXECUTION       (+_PARAMS, _CONTEXT)
                           BATCH_STEP_EXECUTION      (+_CONTEXT)</pre>
<br>

<table>
<tr><th>Concept</th><th>What it really is</th></tr>
<tr><td><strong>Job</strong></td><td>A definition, not a run. It is a bean, created once at startup, and it is shared across every execution. Anything you store in a Job bean field is shared state - a frequent source of bugs.</td></tr>
<tr><td><strong>JobInstance</strong></td><td>The <em>logical</em> run: job name plus the identifying job parameters. "The import for 2026-09-03" is one JobInstance, whether it took one attempt or four.</td></tr>
<tr><td><strong>JobExecution</strong></td><td>One physical attempt at a JobInstance. It has a start time, an end time, a <code>BatchStatus</code> and an <code>ExitStatus</code>. A JobInstance can have many JobExecutions; only one may be COMPLETED.</td></tr>
<tr><td><strong>Step / StepExecution</strong></td><td>Same distinction one level down. The StepExecution carries the counters - <code>readCount</code>, <code>writeCount</code>, <code>filterCount</code>, <code>skipCount</code>, <code>commitCount</code>, <code>rollbackCount</code> - and the <strong>ExecutionContext</strong> that makes restart possible.</td></tr>
<tr><td><strong>ExecutionContext</strong></td><td>A serialised map of key/value pairs persisted with each execution. A restartable reader writes its position here (<code>FlatFileItemReader</code> stores <code>userItemReader.read.count</code>), which is why the reader must have a <code>name</code>.</td></tr>
<tr><td><strong>ItemStream</strong></td><td>The interface that gives a reader or writer <code>open()</code>, <code>update()</code> and <code>close()</code> callbacks around the Step. It is how the ExecutionContext gets written. Custom readers that skip it are not restartable.</td></tr>
</table>`
        },
        {
            content: `<h3>Chunk-oriented processing: what commit-interval really controls</h3>
<code>.chunk(10, txManager)</code> looks like a batch size. It is a <strong>transaction boundary</strong>, and calling it the <strong>commit-interval</strong> - the name Spring Batch actually uses - makes the consequences obvious.<br><br>

<div class="border">
Every <strong>chunk</strong> is one database transaction. Ten reads, ten processes, one write, one <code>StepExecution</code> update, one commit. If anything in that window throws and no skip policy applies, the <strong>whole chunk rolls back</strong> - all ten items, not the one that failed.
</div><br>

<table>
<tr><th>Commit-interval</th><th>Consequence</th></tr>
<tr><td><code>1</code></td><td>One transaction per item. Maximum restart precision - a failure loses nothing. Also maximum overhead: a commit per row makes a large load an order of magnitude slower.</td></tr>
<tr><td><code>10</code> - <code>1000</code></td><td>The usable range. JDBC batching amortises the network round trips and the commit cost across the chunk.</td></tr>
<tr><td><code>50000</code></td><td>Long-running transactions, a bloated undo/redo log, lock contention with online traffic, and up to 50,000 items of work discarded on a single failure. It also holds 50,000 objects in memory.</td></tr>
</table>
<br>

<strong>The restart-granularity point, stated precisely.</strong> The JobRepository is updated inside the same transaction as the chunk write. So the framework's record of "how far did we get" advances one chunk at a time. On restart, the Step resumes at the last <em>committed</em> chunk boundary - never mid-chunk. With a commit-interval of 1000, a crash at item 4,999 restarts at item 4,000 and re-reads 999 items you had already processed. That is not a bug; it is the price of the commit-interval you chose.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">commit-interval = 1000, input of 10,000 items, crash while processing #4,999

  items 1-1000     [chunk 1]  COMMIT   read.count = 1000  persisted
  items 1001-2000  [chunk 2]  COMMIT   read.count = 2000  persisted
  items 2001-3000  [chunk 3]  COMMIT   read.count = 3000  persisted
  items 3001-4000  [chunk 4]  COMMIT   read.count = 4000  persisted
  items 4001-4999  [chunk 5]  X CRASH  ------ ROLLBACK ------
                                       read.count stays at 4000

  RESTART:  reader.open(executionContext) sees read.count=4000
            and skips forward 4000 lines. Processing resumes at 4001.
            Items 4001-4999 are processed a SECOND time.

  The writer must therefore be idempotent, or those 999 rows
  become duplicate keys. This is the same lesson as at-least-once
  delivery in a message broker.</pre>
<br>

<strong>Where the transaction actually lives.</strong> The transaction manager is the Step's, not the writer's. In Spring Batch 5 you pass it explicitly to <code>chunk(size, txManager)</code>, which was a deliberate change - in Batch 4 it was picked up implicitly and people did not notice they were committing against the wrong DataSource. If the JobRepository and the business data live in different databases, they are two independent transactions and can disagree after a crash.<br>`,
            codeExamples: [
                `// Chunk size is a tuning decision. Measure it.
//
// Same 1,000,000-row CSV into MySQL on the same machine:
//
//   chunk(1)      1,000,000 commits    ~ 41 min
//   chunk(100)       10,000 commits    ~ 3 min 10 s
//   chunk(1000)       1,000 commits    ~ 2 min 05 s
//   chunk(10000)        100 commits    ~ 2 min 00 s  + ~600 MB heap churn
//                                        + 10,000 rows lost per failure
//
// The curve flattens quickly. Beyond a few hundred you are buying almost no
// throughput and paying with memory and restart granularity.

@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager tx) {
    return new StepBuilder("step1", jobRepository)
            .<User, User>chunk(500, tx)
            .reader(reader())
            .processor(processor())
            .writer(writer(null))
            .build();
}`,
                `// Making the writer idempotent so a restart cannot produce duplicates.
// This is the single most important change to the classroom project.

writer.setSql(
    "insert into users (id, name, gender, batchname, position) " +
    "values (:id, :name, :gender, :batchname, :position) " +
    "on duplicate key update " +
    "  name = values(name), gender = values(gender), " +
    "  batchname = values(batchname), position = values(position)");

// MySQL syntax above. PostgreSQL:
//   insert into users (...) values (...)
//   on conflict (id) do update set name = excluded.name, ...
//
// Without this, restarting after a mid-chunk failure gives:
//   org.springframework.dao.DuplicateKeyException: PreparedStatementCallback;
//   Duplicate entry '4001' for key 'users.PRIMARY'
// and the restart itself fails - which is the worst possible outcome,
// because now neither running nor restarting works.`
            ]
        },
        {
            content: `<h3>The JobRepository: six tables that do all the real work</h3>
Everything Spring Batch knows about a run lives in the metadata schema. The DDL ships inside <code>spring-batch-core.jar</code> as <code>org/springframework/batch/core/schema-mysql.sql</code> (one per vendor), and <code>spring.batch.jdbc.initialize-schema=always</code> is what runs it.<br><br>

<table>
<tr><th>Table</th><th>What it holds</th></tr>
<tr><td><code>BATCH_JOB_INSTANCE</code></td><td>One row per <em>logical</em> run. Columns: <code>JOB_INSTANCE_ID</code>, <code>JOB_NAME</code>, <code>JOB_KEY</code>. The <code>JOB_KEY</code> is an MD5 hash of the identifying job parameters, and <code>(JOB_NAME, JOB_KEY)</code> carries a UNIQUE constraint. That constraint is the entire duplicate-run mechanism.</td></tr>
<tr><td><code>BATCH_JOB_EXECUTION_PARAMS</code></td><td>The parameters of one execution, with an <code>IDENTIFYING</code> flag per parameter. Only identifying parameters feed the <code>JOB_KEY</code>.</td></tr>
<tr><td><code>BATCH_JOB_EXECUTION</code></td><td>One row per <em>attempt</em>: <code>CREATE_TIME</code>, <code>START_TIME</code>, <code>END_TIME</code>, <code>STATUS</code>, <code>EXIT_CODE</code>, <code>EXIT_MESSAGE</code> (the stack trace), <code>LAST_UPDATED</code>. Many rows may point at one JobInstance.</td></tr>
<tr><td><code>BATCH_JOB_EXECUTION_CONTEXT</code></td><td>The serialised job-level ExecutionContext, as JSON since Batch 4.</td></tr>
<tr><td><code>BATCH_STEP_EXECUTION</code></td><td>One row per step attempt, and the most useful table for diagnosis: <code>READ_COUNT</code>, <code>FILTER_COUNT</code>, <code>WRITE_COUNT</code>, <code>READ_SKIP_COUNT</code>, <code>PROCESS_SKIP_COUNT</code>, <code>WRITE_SKIP_COUNT</code>, <code>COMMIT_COUNT</code>, <code>ROLLBACK_COUNT</code>, <code>STATUS</code>, <code>EXIT_MESSAGE</code>.</td></tr>
<tr><td><code>BATCH_STEP_EXECUTION_CONTEXT</code></td><td>The step-level ExecutionContext - where the reader's position is stored. This is what a restart reads to know where to resume.</td></tr>
</table>
<br>

<h3>Why a JobInstance cannot run twice</h3>
Run the classroom job, then run it again with no parameters, and you get:<br><br>

<div class="border">
<code>org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException:</code><br>
<code>A job instance already exists and is complete for parameters={}. If you want to run this job again, change the parameters.</code>
</div><br>

This is not a defect. Spring Batch's contract is that <strong>a JobInstance may complete exactly once</strong>. The identity of a JobInstance is job name plus identifying parameters, so an empty parameter set means every run is the <em>same</em> logical run. Once it is COMPLETED, re-running it would mean re-doing finished work - exactly the accident the framework exists to prevent. The rule is enforced by the unique index on <code>(JOB_NAME, JOB_KEY)</code>, not by application code.<br><br>

Three ways forward, in increasing order of correctness:<br><br>

<table>
<tr><th>Approach</th><th>Effect</th></tr>
<tr><td><strong>RunIdIncrementer</strong></td><td>Adds a <code>run.id</code> parameter and increments it on each launch, so every launch is a new JobInstance. Convenient for demos and for jobs that are genuinely idempotent. It also means you can never restart a failed run - the incrementer has moved on.</td></tr>
<tr><td>A meaningful parameter</td><td>Pass the thing that actually distinguishes the run: the input file name, the business date, the batch id. <code>importUserJob(inputFile=users-2026-09-03.csv)</code> is one JobInstance, and re-launching it after a failure <em>restarts</em> it rather than creating a new one. This is what production jobs do.</td></tr>
<tr><td>Non-identifying parameters</td><td><code>new JobParametersBuilder().addString("debug", "true", false)</code> - the <code>false</code> marks it non-identifying, so it is recorded but excluded from the <code>JOB_KEY</code>. Use it for anything that changes behaviour but not identity.</td></tr>
</table>
<br>

<strong>The trap with RunIdIncrementer</strong> is that it silently converts "restart the failed load" into "run the whole load again from the start", because the new <code>run.id</code> creates a fresh JobInstance with an empty ExecutionContext. If your job must be restartable, do not use it.<br>`,
            codeExamples: [
                `-- What the metadata looks like after one failure and one successful restart.

SELECT JOB_INSTANCE_ID, JOB_NAME, JOB_KEY FROM BATCH_JOB_INSTANCE;
-- +-----------------+-----------------+----------------------------------+
-- | JOB_INSTANCE_ID | JOB_NAME        | JOB_KEY                          |
-- +-----------------+-----------------+----------------------------------+
-- |               1 | USER-IMPORT-JOB | 8b2b6c8f9d4e11a0c7f3b5d2e9a41c60 |
-- +-----------------+-----------------+----------------------------------+
-- ONE logical run.

SELECT JOB_EXECUTION_ID, JOB_INSTANCE_ID, STATUS, EXIT_CODE, START_TIME, END_TIME
FROM BATCH_JOB_EXECUTION;
-- +------------------+-----------------+-----------+-----------+---------------------+---------------------+
-- | JOB_EXECUTION_ID | JOB_INSTANCE_ID | STATUS    | EXIT_CODE | START_TIME          | END_TIME            |
-- +------------------+-----------------+-----------+-----------+---------------------+---------------------+
-- |                1 |               1 | FAILED    | FAILED    | 2026-09-03 01:00:02 | 2026-09-03 01:04:47 |
-- |                2 |               1 | COMPLETED | COMPLETED | 2026-09-03 01:20:11 | 2026-09-03 01:22:39 |
-- +------------------+-----------------+-----------+-----------+---------------------+---------------------+
-- TWO attempts at the SAME instance. That is a restart.

SELECT STEP_EXECUTION_ID, STEP_NAME, STATUS, READ_COUNT, WRITE_COUNT,
       WRITE_SKIP_COUNT, COMMIT_COUNT, ROLLBACK_COUNT
FROM BATCH_STEP_EXECUTION;
-- +-------------------+-----------+-----------+------------+-------------+------------------+--------------+----------------+
-- | STEP_EXECUTION_ID | STEP_NAME | STATUS    | READ_COUNT | WRITE_COUNT | WRITE_SKIP_COUNT | COMMIT_COUNT | ROLLBACK_COUNT |
-- +-------------------+-----------+-----------+------------+-------------+------------------+--------------+----------------+
-- |                 1 | step1     | FAILED    |       4000 |        4000 |                0 |            4 |              1 |
-- |                 2 | step1     | COMPLETED |       6000 |        5997 |                3 |            6 |              0 |
-- +-------------------+-----------+-----------+------------+-------------+------------------+--------------+----------------+
-- The restart read 6000, not 10000: it resumed at item 4001.

SELECT SHORT_CONTEXT FROM BATCH_STEP_EXECUTION_CONTEXT WHERE STEP_EXECUTION_ID = 1;
-- {"@class":"java.util.HashMap","userItemReader.read.count":4000}
-- THAT single number is the whole restart mechanism.`,
                `// Launching with a meaningful, identifying parameter instead of run.id.
@Component
public class ImportTrigger {

    private final JobLauncher jobLauncher;
    private final Job importUserJob;

    @Scheduled(cron = "0 0 1 * * *")
    public void nightly() throws Exception {
        JobParameters params = new JobParametersBuilder()
                // IDENTIFYING (the default): this is what makes each night a
                // distinct JobInstance, and what lets a failed night restart.
                .addString("businessDate", LocalDate.now().toString())
                .addString("inputFile", "users-" + LocalDate.now() + ".csv")
                // NON-identifying: recorded, but excluded from the JOB_KEY.
                .addString("triggeredBy", "scheduler", false)
                .toJobParameters();

        JobExecution execution = jobLauncher.run(importUserJob, params);

        // OUTPUT (first run of the day):
        // INFO  Job: [SimpleJob: [name=USER-IMPORT-JOB]] launched with the
        //       following parameters: [{businessDate=2026-09-03,
        //       inputFile=users-2026-09-03.csv, triggeredBy=scheduler}]
        // INFO  ... and the following status: [COMPLETED]

        // OUTPUT (same day, second launch, after the first COMPLETED):
        // org.springframework.batch.core.repository.JobInstanceAlreadyComplete
        // Exception: A job instance already exists and is complete for
        // parameters={businessDate=2026-09-03, inputFile=users-2026-09-03.csv}.
        // If you want to run this job again, change the parameters.

        // OUTPUT (same day, second launch, after the first FAILED):
        // INFO  Job: [SimpleJob: [name=USER-IMPORT-JOB]] launched ...
        // INFO  Executing step: [step1]     <- RESTARTED, resuming mid-file
    }
}
// Note the asymmetry, and it is deliberate:
//   previous execution COMPLETED  -> JobInstanceAlreadyCompleteException
//   previous execution FAILED     -> restart
//   previous execution STARTED    -> JobExecutionAlreadyRunningException
//   previous execution STOPPED    -> restart`,
                `// Using an incrementer to sidestep identity entirely.
@Bean
public Job importUserJob(JobRepository jobRepository, Step step1) {
    return new JobBuilder("USER-IMPORT-JOB", jobRepository)
            .incrementer(new RunIdIncrementer())
            .start(step1)
            .build();
}
// RunIdIncrementer reads the previous JobParameters, takes the Long
// parameter named "run.id" (default 1) and returns it + 1.
//
//   run 1 -> {run.id=1}   JobInstance 1
//   run 2 -> {run.id=2}   JobInstance 2      <- a NEW instance, not a restart
//   run 3 -> {run.id=3}   JobInstance 3
//
// WHAT THIS BUYS:  no JobInstanceAlreadyCompleteException, ever.
// WHAT THIS COSTS: run 2 does NOT resume run 1's failed step. It starts
//                  from item 1 with a fresh ExecutionContext. If run 1 wrote
//                  4000 rows and the writer is not idempotent, run 2 fails
//                  on a duplicate key.
//
// A cheap timestamp incrementer has the same trade-off and is more honest
// about being a "just make it unique" hack:
public class TimestampIncrementer implements JobParametersIncrementer {
    @Override
    public JobParameters getNext(JobParameters parameters) {
        return new JobParametersBuilder(parameters == null
                        ? new JobParameters() : parameters)
                .addLong("run.timestamp", System.currentTimeMillis())
                .toJobParameters();
    }
}`
            ]
        },
        {
            content: `<h3>Restartability, skip and retry</h3>
Three distinct mechanisms that students routinely conflate. They answer three different questions.<br><br>

<table>
<tr><th>Mechanism</th><th>The question it answers</th></tr>
<tr><td><strong>Restart</strong></td><td>"The process died. Can I pick up where it stopped instead of starting over?" - decided by the JobRepository and the ExecutionContext.</td></tr>
<tr><td><strong>Skip</strong></td><td>"This particular item is bad. Can the job carry on without it?" - decided by a skip policy, per item.</td></tr>
<tr><td><strong>Retry</strong></td><td>"That failure was transient. Can I try the same item again in a moment?" - decided by a retry policy, per item, within the same execution.</td></tr>
</table>
<br>

<h3>Restart, precisely</h3>
<div class="border">
• A restart only occurs when the JobInstance already exists and its last JobExecution is <strong>FAILED</strong> or <strong>STOPPED</strong>. Same job name, same identifying parameters.<br>
• A Step whose previous execution COMPLETED is <strong>skipped</strong> on restart, unless it is marked <code>allowStartIfComplete(true)</code>. This is the point of splitting a job into steps: a five-step job that failed in step four restarts at step four.<br>
• <code>preventRestart()</code> on the JobBuilder forbids restart entirely, and any attempt throws <code>JobRestartException</code>. Use it when a partial re-run would be worse than a full one.<br>
• <code>startLimit(n)</code> on a Step caps how many times that Step may be attempted across restarts - a guard against a job that fails, restarts, fails, forever.<br>
</div><br>

<strong>Restart requires a restartable reader.</strong> <code>FlatFileItemReader</code>, <code>JdbcCursorItemReader</code> and <code>JpaPagingItemReader</code> implement <code>ItemStream</code> and persist their position. A reader you wrote yourself, or one wrapping a stream you cannot rewind, does not - and a "restart" then silently reprocesses everything from the beginning. Also note the whole mechanism depends on the reader's <code>name</code>: the ExecutionContext key is <code>&lt;name&gt;.read.count</code>, so an unnamed reader in a multi-reader step will collide. <code>saveState(false)</code> disables the mechanism deliberately - which is required for readers used in a multi-threaded step.<br><br>

<h3>Skip and retry together</h3>
The two interact in a way worth stating: <strong>retry happens first</strong>. An exception listed in both <code>retry()</code> and <code>skip()</code> is retried up to the retry limit, and only if it still fails is it considered for skipping. Also, on a skip during the write phase, Spring Batch <strong>rolls back the chunk and replays it item by item</strong> with a commit-interval of 1 to identify which item was at fault - so a chunk containing one bad row costs you a rollback plus N single-item transactions. A high skip limit on a dirty file is a performance cliff, not just a tolerance setting.<br>`,
            codeExamples: [
                `// Fault-tolerant step: skip bad data, retry transient failures.
@Bean
public Step step1(JobRepository jobRepository, PlatformTransactionManager tx) {
    return new StepBuilder("step1", jobRepository)
            .<User, User>chunk(100, tx)
            .reader(reader())
            .processor(processor())
            .writer(writer(null))

            .faultTolerant()

            // SKIP - the item is bad; drop it and continue.
            .skip(FlatFileParseException.class)
            .skip(IncorrectTokenCountException.class)
            .skipLimit(50)          // the 51st bad row FAILS the whole step
            .noSkip(NullPointerException.class)   // a bug, not bad data

            // RETRY - the operation is bad; do the same item again.
            .retry(DeadlockLoserDataAccessException.class)
            .retry(TransientDataAccessException.class)
            .retryLimit(3)
            .backOffPolicy(exponentialBackOff())

            // Never retry these - retrying will fail identically every time.
            .noRetry(DataIntegrityViolationException.class)

            .listener(skipListener())
            .build();
}

@Bean
public BackOffPolicy exponentialBackOff() {
    ExponentialBackOffPolicy policy = new ExponentialBackOffPolicy();
    policy.setInitialInterval(1000);
    policy.setMultiplier(2.0);
    policy.setMaxInterval(10000);
    return policy;
}

// OUTPUT when a skip fires:
// WARN  o.s.b.c.step.item.FaultTolerantChunkProcessor : Skipping item
//       org.springframework.batch.item.file.FlatFileParseException:
//       Parsing error at line: 3117 in resource=[test.csv],
//       input=[7,,Male,JavaFS,]
// INFO  Step: [step1] executed in 4m 12s
// mysql> select READ_COUNT, WRITE_COUNT, READ_SKIP_COUNT, STATUS
//        from BATCH_STEP_EXECUTION;
// | 200000 | 199997 | 3 | COMPLETED |
//
// Note STATUS=COMPLETED with EXIT_CODE=COMPLETED WITH SKIPS. A job that
// silently discards rows and reports success is a monitoring problem -
// alert on READ_SKIP_COUNT, do not just alert on STATUS.`,
                `// You MUST record what was skipped, or the data is gone with no trace.
@Bean
public SkipListener<User, User> skipListener() {
    return new SkipListener<User, User>() {

        @Override
        public void onSkipInRead(Throwable t) {
            // The item never existed - only the parse exception is available.
            if (t instanceof FlatFileParseException ffpe) {
                rejectLog.write(ffpe.getLineNumber(), ffpe.getInput(), t.getMessage());
            }
        }

        @Override
        public void onSkipInProcess(User item, Throwable t) {
            rejectLog.write(item, "process", t.getMessage());
        }

        @Override
        public void onSkipInWrite(User item, Throwable t) {
            rejectLog.write(item, "write", t.getMessage());
        }
    };
}
// CAREFUL: the SkipListener's callbacks run OUTSIDE the chunk transaction
// (they are called after the rollback), so writing the reject row through
// the same transactional DataSource is fine, but you cannot assume the
// failed business write is visible. Write rejects to a separate table or
// to a file.`,
                `// Restart controls on the Job and the Step.
@Bean
public Job importUserJob(JobRepository repo, Step validate, Step load, Step report) {
    return new JobBuilder("USER-IMPORT-JOB", repo)
            .start(validate)
            .next(load)
            .next(report)
            // .preventRestart()   // uncomment to forbid restart entirely
            .build();
}

@Bean
public Step validate(JobRepository repo, PlatformTransactionManager tx) {
    return new StepBuilder("validate", repo)
            .tasklet(validateTasklet(), tx)
            // Cheap and safe to redo, so run it again on every restart even
            // though it completed last time. Without this, a COMPLETED step
            // is silently skipped on restart.
            .allowStartIfComplete(true)
            // Give up after 3 attempts across all restarts:
            //   org.springframework.batch.core.StartLimitExceededException:
            //   Maximum start limit exceeded for step: validate StartMax: 3
            .startLimit(3)
            .build();
}

// A Tasklet is the other Step type: a single unit of work, one transaction,
// no reader/processor/writer. Use it for "move the file", "truncate the
// staging table", "call the report endpoint".
@Bean
public Tasklet validateTasklet() {
    return (contribution, chunkContext) -> {
        Path input = Path.of("/data/in/users.csv");
        if (!Files.exists(input)) {
            throw new IllegalStateException("input file missing: " + input);
        }
        contribution.getStepExecution()
                    .getExecutionContext()
                    .putString("inputPath", input.toString());
        return RepeatStatus.FINISHED;
    };
}`
            ]
        },
        {
            content: `<h3>Listeners: where to put the cross-cutting work</h3>
Every phase of a Job has a listener interface. They exist so that logging, metrics, notification and cleanup do not end up inside the processor.<br><br>

<table>
<tr><th>Listener</th><th>When it fires and what it is for</th></tr>
<tr><td><strong>JobExecutionListener</strong></td><td><code>beforeJob</code> runs once before any step; <code>afterJob</code> runs once after the last step <em>whether the job succeeded or failed</em>. This is where you send the completion e-mail, publish the duration metric, or archive the input file. Check <code>jobExecution.getStatus()</code> - afterJob on a FAILED job is the normal case, not an exception.</td></tr>
<tr><td><strong>StepExecutionListener</strong></td><td><code>beforeStep</code> receives the <code>StepExecution</code>, which is how you pull values out of the job ExecutionContext into step-scoped state. <code>afterStep</code> returns an <code>ExitStatus</code> - and returning a custom one is how you drive conditional flow between steps.</td></tr>
<tr><td><strong>ChunkListener</strong></td><td><code>beforeChunk</code>, <code>afterChunk</code>, <code>afterChunkError</code>. Useful for progress logging every N items without touching the processor. <code>afterChunkError</code> fires after the rollback.</td></tr>
<tr><td><strong>ItemReadListener / ItemProcessListener / ItemWriteListener</strong></td><td>Per-item hooks, each with a <code>before</code>, <code>after</code> and <code>onError</code> callback. Cheap to add, expensive to abuse - they run once per item.</td></tr>
<tr><td><strong>SkipListener</strong></td><td>Called when an item is skipped. The only place the skipped item is still available. Not optional in production.</td></tr>
<tr><td><strong>RetryListener</strong></td><td>Wraps each retry attempt. Useful for counting retries as a metric rather than reading them out of logs.</td></tr>
</table>
<br>

<strong>Passing data between steps.</strong> The job ExecutionContext is the supported channel, and the idiom is: <code>afterStep</code> promotes a value into it (or use <code>ExecutionContextPromotionListener</code>), and a later step's <code>beforeStep</code> reads it. Do not use a field on a <code>@Configuration</code> class - the Job bean is a singleton shared across executions, and in a partitioned or multi-threaded step that field is a race condition.<br>`,
            codeExamples: [
                `// Annotation form - no interface to implement, methods can be named anything.
@Component
public class ImportJobListener {

    private static final Logger LOG = LoggerFactory.getLogger(ImportJobListener.class);

    @BeforeJob
    public void before(JobExecution jobExecution) {
        LOG.info("Starting {} with parameters {}",
                 jobExecution.getJobInstance().getJobName(),
                 jobExecution.getJobParameters());
    }

    @AfterJob
    public void after(JobExecution jobExecution) {
        Duration took = Duration.between(jobExecution.getStartTime(),
                                         jobExecution.getEndTime());

        // afterJob ALWAYS runs. Branch on the status - do not assume success.
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            long written = jobExecution.getStepExecutions().stream()
                    .mapToLong(StepExecution::getWriteCount).sum();
            LOG.info("Job COMPLETED in {}s, {} rows written", took.toSeconds(), written);
        } else {
            LOG.error("Job {} - {}", jobExecution.getStatus(),
                      jobExecution.getAllFailureExceptions());
            alerting.page("USER-IMPORT-JOB failed: "
                        + jobExecution.getExitStatus().getExitDescription());
        }
    }
}
// OUTPUT:
// INFO  Starting USER-IMPORT-JOB with parameters {businessDate=2026-09-03,
//       inputFile=users-2026-09-03.csv}
// INFO  Job COMPLETED in 134s, 199997 rows written
//
// ...or, on failure:
// ERROR Job FAILED - [org.springframework.dao.DataIntegrityViolationException:
//       PreparedStatementCallback; SQL [insert into users ...];
//       Duplicate entry '4001' for key 'users.PRIMARY']`,
                `// StepExecutionListener driving conditional flow via a custom ExitStatus.
@Component
public class LoadStepListener implements StepExecutionListener {

    @Override
    public void beforeStep(StepExecution stepExecution) {
        // Read a value the previous step promoted into the JOB context.
        String path = stepExecution.getJobExecution()
                                   .getExecutionContext()
                                   .getString("inputPath");
        LOG.info("loading from {}", path);
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        if (stepExecution.getWriteCount() == 0) {
            return new ExitStatus("NOTHING_LOADED");
        }
        if (stepExecution.getSkipCount() > 0) {
            return new ExitStatus("COMPLETED_WITH_REJECTS");
        }
        return ExitStatus.COMPLETED;      // returning null means "unchanged"
    }
}

// The job then branches on that exit code:
@Bean
public Job importUserJob(JobRepository repo, Step load, Step report, Step notifyOps) {
    return new JobBuilder("USER-IMPORT-JOB", repo)
            .start(load)
                .on("COMPLETED_WITH_REJECTS").to(notifyOps)
            .from(load)
                .on("NOTHING_LOADED").end()          // finish, status COMPLETED
            .from(load)
                .on("*").to(report)
            .end()
            .build();
}
// .on("FAILED").fail()  ends the job as FAILED
// .on("X").stopAndRestart(step)  stops so an operator can intervene`,
                `// Promoting a value from a step context to the job context, declaratively.
@Bean
public ExecutionContextPromotionListener promotionListener() {
    ExecutionContextPromotionListener listener = new ExecutionContextPromotionListener();
    listener.setKeys(new String[] { "inputPath", "rowsStaged" });
    listener.setStrict(false);   // do not fail if a key is absent
    return listener;
}
// Attach it with .listener(promotionListener()) on the producing step.
//
// WHY THIS EXISTS: the step ExecutionContext is private to one step. Without
// promotion, a later step cannot see it, and people work around that with a
// static field or a @Configuration field. Both are shared across executions
// and both break under partitioning.
//
// Keep contexts SMALL. They are serialised into
// BATCH_STEP_EXECUTION_CONTEXT.SERIALIZED_CONTEXT on every chunk commit -
// putting a List of 100,000 items in there will produce
//   IllegalArgumentException: Context is too long ...`
            ]
        },
        {
            content: `<h3>Scaling: multi-threaded steps and partitioning</h3>
A single-threaded chunk loop is limited by whichever of read, process and write is slowest. Spring Batch offers several ways out, and choosing the wrong one produces corrupted output rather than an error.<br><br>

<table>
<tr><th>Strategy</th><th>How it works, and what it costs</th></tr>
<tr><td><strong>Multi-threaded step</strong></td><td>One reader, one writer, N threads pulling chunks from the same reader concurrently. Set with <code>.taskExecutor(...)</code>. Simple to switch on and easy to get wrong: <em>the reader and writer must be thread-safe</em>, and restart state is lost.</td></tr>
<tr><td><strong>Partitioning</strong></td><td>A <code>Partitioner</code> splits the input into N logical partitions, each with its own <code>ExecutionContext</code>. Each partition runs the same step definition as a <em>separate StepExecution</em> with its own reader, writer and transaction. This is the recommended approach.</td></tr>
<tr><td><strong>Parallel steps (split)</strong></td><td>Different, independent steps run at the same time via <code>.split(taskExecutor)</code>. Use when two unrelated loads can proceed concurrently - not for scaling one load.</td></tr>
<tr><td><strong>Remote chunking / remote partitioning</strong></td><td>Workers on other JVMs, coordinated over a messaging middleware. Remote chunking sends items over the wire (heavy); remote partitioning sends only partition metadata (light). Reach for these only when one machine is genuinely the ceiling.</td></tr>
</table>
<br>

<h3>Why a non-thread-safe reader breaks a multi-threaded step</h3>
This is the question interviewers use to find out whether you have actually run one.<br><br>

<div class="border">
In a multi-threaded step there is <strong>one reader instance</strong> and N threads calling <code>read()</code> on it. <code>FlatFileItemReader</code>, <code>JdbcCursorItemReader</code> and the paging readers keep their position in a mutable field. Two threads entering <code>read()</code> at once interleave the read of that counter and its increment, so the same line is returned twice, or a line is never returned at all, or the underlying <code>BufferedReader</code> is left mid-line and the parse fails.
</div><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">MULTI-THREADED STEP - one shared reader, four threads

              +----------------------------+
              |  FlatFileItemReader        |
              |  currentItemCount = 41     |   <-- MUTABLE, NOT SYNCHRONIZED
              +----------------------------+
                  ^      ^      ^      ^
              T1  |  T2  |  T3  |  T4  |
                  read() read() read() read()

  T1 reads count 41 ......... T2 reads count 41
  T1 increments to 42 ....... T2 increments to 42
  -> row 42 is read TWICE and row 43 is never read at all.

  Symptoms: duplicate rows in the destination, a row count lower than the
  file's line count, or a FlatFileParseException on a half-consumed line.
  No exception says "your reader is not thread safe".


PARTITIONED STEP - N StepExecutions, each with its OWN reader

  +--------------------------------------------------------------+
  |  Partitioner: split the input into 4 ranges                   |
  +--------------------------------------------------------------+
        |            |            |            |
   partition0   partition1   partition2   partition3
   ctx{1-2500}  ctx{2501-  } ctx{5001-  } ctx{7501-  }
        |            |            |            |
   StepExecution StepExecution StepExecution StepExecution
   own reader    own reader    own reader    own reader
   own writer    own writer    own writer    own writer
   own tx        own tx        own tx        own tx
        |            |            |            |
        +------------+-----+------+------------+
                           v
              all COMPLETED -> master step COMPLETED
              each partition restarts INDEPENDENTLY</pre>
<br>

<strong>Fixes for a multi-threaded step, in order of preference:</strong> use partitioning instead; or use a reader that is genuinely thread-safe (<code>JdbcPagingItemReader</code> with a stable sort is safe because each page is an independent query); or wrap the reader in <code>SynchronizedItemStreamReader</code>, which serialises <code>read()</code> and makes the reader the bottleneck again - it only helps when processing, not reading, is the expensive part. In every case you must call <code>saveState(false)</code>, because the persisted read count is meaningless when threads interleave, and a restart based on it would silently skip data.<br>`,
            codeExamples: [
                `// Multi-threaded step - correct, and note every guard.
@Bean
public Step multiThreadedStep(JobRepository repo, PlatformTransactionManager tx) {
    return new StepBuilder("load", repo)
            .<User, User>chunk(100, tx)
            .reader(synchronizedReader())
            .processor(expensiveProcessor())     // the reason for threading
            .writer(writer(null))
            .taskExecutor(new SimpleAsyncTaskExecutor("batch-"))
            .throttleLimit(4)   // deprecated in Batch 5 - configure the pool
            .build();
}

@Bean
public SynchronizedItemStreamReader<User> synchronizedReader() {
    FlatFileItemReader<User> delegate = new FlatFileItemReaderBuilder<User>()
            .name("userItemReader")
            .resource(new ClassPathResource("test.csv"))
            .linesToSkip(1)
            .delimited().names("id", "name", "gender", "batchname", "position")
            .targetType(User.class)
            .saveState(false)    // MANDATORY here - see below
            .build();

    SynchronizedItemStreamReader<User> reader = new SynchronizedItemStreamReader<>();
    reader.setDelegate(delegate);
    return reader;
}
// saveState(false) is not optional. With state saving on and multiple
// threads, the persisted read.count does not correspond to any consistent
// position in the file, so a restart resumes at the wrong offset and
// silently skips or duplicates rows. Turning it off means the step is NOT
// restartable - which is the honest trade, and the reason to prefer
// partitioning.
//
// Also note SimpleAsyncTaskExecutor creates a NEW THREAD PER TASK and pools
// nothing. For anything sustained use a ThreadPoolTaskExecutor with a
// bounded queue, or you will exhaust the machine's threads.`,
                `// Partitioning - each partition is a real StepExecution with its own reader.
@Bean
public Step masterStep(JobRepository repo, Step workerStep) {
    return new StepBuilder("masterStep", repo)
            .partitioner("workerStep", rangePartitioner())
            .step(workerStep)
            .gridSize(4)
            .taskExecutor(partitionExecutor())
            .build();
}

@Bean
public Partitioner rangePartitioner() {
    return gridSize -> {
        Map<String, ExecutionContext> partitions = new HashMap<>();
        long min = jdbc.queryForObject("select min(id) from staging_users", Long.class);
        long max = jdbc.queryForObject("select max(id) from staging_users", Long.class);
        long size = (max - min) / gridSize + 1;

        for (int i = 0; i < gridSize; i++) {
            ExecutionContext ctx = new ExecutionContext();
            ctx.putLong("minId", min + (i * size));
            ctx.putLong("maxId", Math.min(min + ((i + 1) * size) - 1, max));
            partitions.put("partition" + i, ctx);
        }
        return partitions;
    };
}

// Each worker reader is @StepScope and gets ITS OWN instance, bound to the
// values the partitioner put in that partition's ExecutionContext.
@Bean
@StepScope
public JdbcPagingItemReader<User> partitionedReader(
        DataSource ds,
        @Value("#{stepExecutionContext['minId']}") Long minId,
        @Value("#{stepExecutionContext['maxId']}") Long maxId) {

    // The SpEL above is late binding: stepExecutionContext is only resolvable
    // because the bean is @StepScope, so each partition gets its own reader
    // bound to that partition's min/max.
    return new JdbcPagingItemReaderBuilder<User>()
            .name("partitionedReader")
            .dataSource(ds)
            .selectClause("select id, name, gender, batchname, position")
            .fromClause("from staging_users")
            .whereClause("where id between :minId and :maxId")
            .parameterValues(Map.of("minId", minId, "maxId", maxId))
            .sortKeys(Map.of("id", Order.ASCENDING))   // MUST be unique+stable
            .pageSize(1000)
            .rowMapper(new BeanPropertyRowMapper<>(User.class))
            .build();
}
// OUTPUT:
// INFO  Executing step: [masterStep]
// INFO  Executing step: [workerStep:partition0]
// INFO  Executing step: [workerStep:partition2]
// INFO  Executing step: [workerStep:partition1]
// INFO  Executing step: [workerStep:partition3]
// INFO  Step: [masterStep] executed in 1m 04s        (was 3m 51s single-threaded)
//
// mysql> select STEP_NAME, STATUS, READ_COUNT from BATCH_STEP_EXECUTION;
// | workerStep:partition0 | COMPLETED | 2500 |
// | workerStep:partition1 | COMPLETED | 2500 |
// | workerStep:partition2 | COMPLETED | 2500 |
// | workerStep:partition3 | FAILED    | 1180 |
// | masterStep            | FAILED    |    0 |
//
// On restart ONLY partition3 re-runs, and it resumes at its own read count.
// That is what partitioning buys over a multi-threaded step.`,
                `// @StepScope is what makes late binding work, and it is easy to get wrong.
@Bean
@StepScope     // WITHOUT this, jobParameters cannot be injected: the bean is
               // created at context startup, when no job is running, and you get
               // BeanCreationException: Scope 'step' is not active for the
               // current thread; ... No context holder available for step scope
public FlatFileItemReader<User> reader(
        @Value("#{jobParameters['inputFile']}") String inputFile) {

    return new FlatFileItemReaderBuilder<User>()
            .name("userItemReader")
            .resource(new FileSystemResource(inputFile))
            .linesToSkip(1)
            .delimited().names("id", "name", "gender", "batchname", "position")
            .targetType(User.class)
            .build();
}
// A @StepScope bean is created fresh for each StepExecution - which is
// exactly why partitioned workers each get their own reader instance and a
// multi-threaded step does not.
//
// Gotcha: a @StepScope @Bean method must NOT be declared to return an
// interface if the framework needs the ItemStream callbacks - return the
// concrete FlatFileItemReader type (or ItemStreamReader), otherwise the
// proxy hides open()/close() and the reader is never opened:
//   ItemStreamException / ReaderNotOpenException: Reader must be open
//   before it can be read.`
            ]
        },
        {
            content: `<h3>Spring Batch 5 and Spring Boot 3: what changed</h3>
This is the most common source of "the code in the notes does not compile". Spring Boot 3 ships Spring Batch 5, and Batch 5 made breaking changes deliberately.<br><br>

<table>
<tr><th>Change</th><th>Detail</th></tr>
<tr><td><strong>JobBuilderFactory removed</strong></td><td><code>JobBuilderFactory</code> and <code>StepBuilderFactory</code> were deprecated in 4.3 and deleted in 5.0. Use <code>new JobBuilder(name, jobRepository)</code> and <code>new StepBuilder(name, jobRepository)</code>. The factories existed to hide the JobRepository; hiding it turned out to be the problem, because people did not realise which repository or transaction manager they were using.</td></tr>
<tr><td><strong>chunk() takes a transaction manager</strong></td><td><code>.chunk(10)</code> became <code>.chunk(10, transactionManager)</code>, and <code>.tasklet(t)</code> became <code>.tasklet(t, transactionManager)</code>. Same reason: the implicit lookup was a source of silent misconfiguration when more than one DataSource was present.</td></tr>
<tr><td><strong>@EnableBatchProcessing is no longer needed</strong></td><td>With Boot 3, <code>BatchAutoConfiguration</code> provides the JobRepository, JobLauncher, JobExplorer and JobOperator. Adding <code>@EnableBatchProcessing</code> (or defining a <code>DefaultBatchConfiguration</code> subclass) <em>disables</em> that auto-configuration - the opposite of what most people expect from adding an annotation.</td></tr>
<tr><td><strong>javax to jakarta</strong></td><td><code>javax.persistence</code> to <code>jakarta.persistence</code>, <code>javax.sql.DataSource</code> is unchanged (it is in the JDK). Batch 5 also moved to JSR-352's jakarta namespace.</td></tr>
<tr><td><strong>Metadata schema changes</strong></td><td><code>BATCH_JOB_EXECUTION_PARAMS</code> was restructured: the four typed columns (<code>DATE_VAL</code>, <code>LONG_VAL</code>, <code>DOUBLE_VAL</code>, <code>STRING_VAL</code>) collapsed into <code>PARAMETER_TYPE</code> plus <code>PARAMETER_VALUE</code>, and timestamps moved from <code>TIMESTAMP</code> to <code>DATETIME(6)</code>. An in-place upgrade needs a migration script; it is not a drop-in.</td></tr>
<tr><td><strong>Property renames</strong></td><td><code>spring.batch.initialize-schema</code> to <code>spring.batch.jdbc.initialize-schema</code>. <code>spring.batch.job.enabled</code> was removed - use <code>spring.batch.job.name=none</code>. <code>spring.batch.job.names</code> (plural) became <code>spring.batch.job.name</code> (singular).</td></tr>
<tr><td><strong>Observability</strong></td><td>Batch 5 instruments jobs and steps with Micrometer <code>Observation</code>, so <code>spring.batch.job.active</code>, <code>spring.batch.job</code> and <code>spring.batch.step</code> timers appear in Actuator without extra code.</td></tr>
<tr><td><strong>Java 17 baseline</strong></td><td>Batch 5 requires Java 17 and Spring Framework 6.</td></tr>
</table>
<br>

<h3>Operational things the classroom project does not cover</h3>
<table>
<tr><th>Concern</th><th>What to do about it</th></tr>
<tr><td><code>initialize-schema=always</code> in production</td><td>Set it to <code>never</code> and apply the <code>schema-&lt;vendor&gt;.sql</code> DDL through Flyway or Liquibase like any other migration. Letting the application create its own tables at startup means the application needs DDL privileges it should not have.</td></tr>
<tr><td>Two instances launching the same job</td><td>The JobRepository is the lock. The second instance gets <code>JobExecutionAlreadyRunningException</code> because the unique <code>(JOB_NAME, JOB_KEY)</code> row is already STARTED - provided both share the same metadata database. Two instances with their own H2 databases have no such protection.</td></tr>
<tr><td>A job left STARTED after a JVM kill</td><td>It is not running, but the repository still says STARTED, so a relaunch fails. There is no automatic recovery. Use <code>JobOperator</code> / <code>JobExplorer</code> to mark it ABANDONED, or <code>JobRepository.update()</code> the status to FAILED, before restarting.</td></tr>
<tr><td>Secrets in job parameters</td><td>Job parameters are written verbatim to <code>BATCH_JOB_EXECUTION_PARAMS</code> and echoed in the launch log line. Never pass a password or token as a job parameter.</td></tr>
<tr><td>Growing metadata tables</td><td>Nothing prunes them. A job running every five minutes writes over 100,000 <code>BATCH_JOB_EXECUTION</code> rows a year, plus context blobs. Schedule a purge with the correct delete order (contexts, then params, then step executions, then job executions, then instances).</td></tr>
<tr><td>Memory during a large load</td><td>A cursor reader holds one JDBC connection open for the whole step; a paging reader issues one query per page and is safer for long jobs. <code>JpaPagingItemReader</code> additionally needs the persistence context cleared, or the first-level cache grows with every row read.</td></tr>
<tr><td>Testing</td><td><code>spring-batch-test</code> gives you <code>JobLauncherTestUtils.launchJob(params)</code> and <code>launchStep("step1")</code>, so a step can be tested in isolation. Assert on the counters, not just on <code>BatchStatus.COMPLETED</code>.</td></tr>
</table>`,
            codeExamples: [
                `// Testing a step in isolation.
@SpringBatchTest
@SpringBootTest
class ImportUserJobTest {

    @Autowired private JobLauncherTestUtils jobLauncherTestUtils;
    @Autowired private JobRepositoryTestUtils jobRepositoryTestUtils;

    @AfterEach
    void clearMetadata() {
        // Without this, the SECOND test method hits
        // JobInstanceAlreadyCompleteException from the first one's metadata.
        jobRepositoryTestUtils.removeJobExecutions();
    }

    @Test
    void loadsEveryRowAndSkipsTheHeader() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addString("inputFile", "src/test/resources/test.csv")
                .toJobParameters();

        JobExecution execution = jobLauncherTestUtils.launchJob(params);

        assertThat(execution.getStatus()).isEqualTo(BatchStatus.COMPLETED);

        StepExecution step = execution.getStepExecutions().iterator().next();
        assertThat(step.getReadCount()).isEqualTo(5);     // 6 lines - 1 header
        assertThat(step.getWriteCount()).isEqualTo(5);
        assertThat(step.getSkipCount()).isZero();
        assertThat(step.getRollbackCount()).isZero();
    }

    @Test
    void badRowsAreSkippedNotFatal() throws Exception {
        JobExecution execution = jobLauncherTestUtils.launchStep("step1");
        // OUTPUT:
        // WARN  Skipping item ... FlatFileParseException at line 4
        // assertion: readSkipCount == 1, status COMPLETED, exit
        //            COMPLETED WITH SKIPS
    }
}`,
                `-- Recovering a job stuck in STARTED after the JVM was killed.
-- Symptom on relaunch:
--   org.springframework.batch.core.repository.JobExecutionAlreadyRunning
--   Exception: A job execution for this job is already running: JobInstance:
--   id=17, version=0, Job=[USER-IMPORT-JOB]

SELECT JOB_EXECUTION_ID, JOB_INSTANCE_ID, STATUS, START_TIME, END_TIME, LAST_UPDATED
FROM BATCH_JOB_EXECUTION WHERE STATUS = 'STARTED';
-- | 34 | 17 | STARTED | 2026-09-03 01:00:02 | NULL | 2026-09-03 01:04:47 |
-- END_TIME NULL with LAST_UPDATED hours ago = the JVM died.

-- Preferred: do it through the API so versions and step rows stay consistent.
--   jobOperator.stop(34);  then  jobOperator.abandon(34);
-- Only if the API cannot reach it, and only with the job definitely not
-- running anywhere:
UPDATE BATCH_STEP_EXECUTION SET STATUS = 'FAILED', END_TIME = NOW()
 WHERE JOB_EXECUTION_ID = 34 AND STATUS = 'STARTED';
UPDATE BATCH_JOB_EXECUTION SET STATUS = 'FAILED', EXIT_CODE = 'FAILED',
       END_TIME = NOW()
 WHERE JOB_EXECUTION_ID = 34;
-- The instance can now be restarted.`,
                `# Production-shaped configuration
spring.batch.jdbc.initialize-schema=never
spring.batch.job.name=none

# Metadata schema managed as a migration, not by the application.
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
# V1__batch_schema.sql is a copy of
#   org/springframework/batch/core/schema-mysql.sql from spring-batch-core.jar

# Separate the metadata from the business data if they live in different
# databases - and understand that they are then two transactions. A crash
# between the business commit and the metadata commit leaves the repository
# believing less was done than actually was, and the restart reprocesses it.
# Idempotent writers are the answer, not distributed transactions.

# Actuator: Batch 5 publishes these automatically.
management.endpoints.web.exposure.include=health,metrics,prometheus
# spring.batch.job.active     - gauge, jobs currently running
# spring.batch.job            - timer, duration by name and status
# spring.batch.step           - timer, duration by step name and status
# spring.batch.item.read/process/write - timers per item`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between a JobInstance and a JobExecution?</td><td>A <strong>JobInstance</strong> is the logical run, identified by the job name plus its identifying job parameters. A <strong>JobExecution</strong> is one physical attempt at that instance. A JobInstance may have many executions - one per attempt - but only one of them may be COMPLETED.</td></tr>
<tr><td>Why does re-running a job with the same parameters throw <code>JobInstanceAlreadyCompleteException</code>?</td><td>Because the JobInstance identity is job name plus identifying parameters, and <code>BATCH_JOB_INSTANCE</code> has a unique index on <code>(JOB_NAME, JOB_KEY)</code> where JOB_KEY is a hash of those parameters. A completed instance may not complete twice - that would mean redoing finished work. Change a parameter, or add an incrementer.</td></tr>
<tr><td>What does <code>RunIdIncrementer</code> do, and what is wrong with it?</td><td>It adds an incrementing <code>run.id</code> parameter so every launch is a new JobInstance and the exception never fires. The cost is that you also lose restart: a new instance starts with an empty ExecutionContext, so a failed run is re-run from the beginning rather than resumed. Prefer a meaningful identifying parameter such as the business date or file name.</td></tr>
<tr><td>What does the chunk size actually control?</td><td>The commit interval. Each chunk is one transaction: N reads, N processes, one write of the whole chunk, one JobRepository update, one commit. It is a throughput/restart-granularity trade-off, not just a buffer size.</td></tr>
<tr><td>Where does a restarted step resume?</td><td>At the last committed chunk boundary, never mid-chunk, because the reader's position is written to the step ExecutionContext inside the same transaction as the chunk. With a chunk size of 1000, a crash at item 4,999 resumes at 4,001 and reprocesses 999 items - which is why the writer must be idempotent.</td></tr>
<tr><td>Which tables does the JobRepository use?</td><td><code>BATCH_JOB_INSTANCE</code>, <code>BATCH_JOB_EXECUTION</code>, <code>BATCH_JOB_EXECUTION_PARAMS</code>, <code>BATCH_JOB_EXECUTION_CONTEXT</code>, <code>BATCH_STEP_EXECUTION</code> and <code>BATCH_STEP_EXECUTION_CONTEXT</code>. The step execution table carries the read, write, filter, skip, commit and rollback counts; the step context table carries the reader position that makes restart work.</td></tr>
<tr><td>What is the difference between skip and retry?</td><td><strong>Skip</strong> discards a bad item and continues - the data is at fault. <strong>Retry</strong> attempts the same item again - the operation is at fault, typically a deadlock or a timeout. Retry is evaluated first; an exception configured for both is retried to the limit and only then considered for skipping.</td></tr>
<tr><td>What happens when an exception is skipped during the write phase?</td><td>The chunk transaction rolls back and Spring Batch replays the chunk one item at a time to identify the offending item, then skips it. That makes a dirty input expensive - a chunk of 1000 with one bad row costs a rollback plus 1000 single-item transactions.</td></tr>
<tr><td>What does returning <code>null</code> from an ItemProcessor mean?</td><td>The item is filtered - it is not passed to the writer and <code>filterCount</code> increments. It is not an error and does not affect the job status. Skipping on error is a separate mechanism configured with a skip policy.</td></tr>
<tr><td>When do <code>JobExecutionListener</code> and <code>StepExecutionListener</code> fire?</td><td><code>beforeJob</code>/<code>afterJob</code> wrap the whole job; <code>afterJob</code> runs on failure too, so it must branch on <code>getStatus()</code>. <code>beforeStep</code>/<code>afterStep</code> wrap one step, and <code>afterStep</code> can return a custom <code>ExitStatus</code> that drives conditional flow to the next step.</td></tr>
<tr><td>Why does a multi-threaded step break with a <code>FlatFileItemReader</code>?</td><td>There is one reader shared by all threads, and its position counter is a mutable unsynchronised field. Concurrent <code>read()</code> calls interleave the read and the increment, so items are returned twice or missed entirely, with no exception. Fix it with partitioning, a thread-safe paging reader, or <code>SynchronizedItemStreamReader</code> plus <code>saveState(false)</code>.</td></tr>
<tr><td>How does partitioning differ from a multi-threaded step?</td><td>Partitioning creates N separate StepExecutions, each with its own reader, writer, transaction and ExecutionContext, driven by a <code>Partitioner</code> that splits the input. Nothing is shared, so it is safe and each partition restarts independently. A multi-threaded step shares one reader and writer across threads and is not restartable.</td></tr>
<tr><td>What changed in Spring Batch 5?</td><td><code>JobBuilderFactory</code> and <code>StepBuilderFactory</code> were removed in favour of <code>new JobBuilder(name, jobRepository)</code> and <code>new StepBuilder(name, jobRepository)</code>; <code>chunk()</code> and <code>tasklet()</code> now take an explicit transaction manager; <code>@EnableBatchProcessing</code> is no longer required with Boot 3 and actively disables the auto-configuration if you add it; the metadata schema and several properties changed; Java 17 is the baseline.</td></tr>
<tr><td>Why does the first run fail with "Table BATCH_JOB_INSTANCE doesn't exist"?</td><td>The metadata tables are not created automatically against a real database. Either set <code>spring.batch.jdbc.initialize-schema=always</code> for development, or - in production - apply <code>schema-&lt;vendor&gt;.sql</code> from <code>spring-batch-core.jar</code> through Flyway or Liquibase and leave the setting at <code>never</code>.</td></tr>
</table>`
        }
    ]
};
