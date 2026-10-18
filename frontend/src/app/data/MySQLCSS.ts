// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };
import mysqlClientServerImg from '../../assets/mysql 1.png';
import mysqlCommandsImg from '../../assets/mysql 2.png';
import mysqlJoin1Img from '../../assets/MysqlJoin 1.png';
import mysqlJoin2Img from '../../assets/MysqlJoin 2.png';
import mysqlJoin3Img from '../../assets/MysqlJoin 3.png';
import mysqlJoin4Img from '../../assets/MysqlJoin 4.png';
import mysqlJoin5Img from '../../assets/MysqlJoin 5.png';
import mysqlJoin6Img from '../../assets/MysqlJoin 6.png';
import { mysqlSyllabusModules } from './mysqlSyllabus';

// ===== Interfaces =====








// ===== Course Data =====
export const MySQLCSS: Course[] = [
  {
    id: 'mysql',
    name: 'MySQL',
    icon: 'Database',

   subTopics: [
  {
    id: 'mysql-topics',
    name: 'MySQL Topics',
    topics: [
      {
        id: 'intro',
        name: 'Introduction & Database',
        beginner: [
          {
            content: `<b>What is MySQL?</b><br>
MySQL is currently the most popular database management system (DBMS) software used for managing databases. <br>
- It is open-source database software which is supported by Oracle Company.<br>
- It is fast, scalable and easy to use database management system.<br>
- Common operations are: insert records, update records, delete records, select records, create tables, drop tables, etc.`
          },
          {
            content: `<b>What is a Database?</b><br>
- A database is an application that stores an organized collection of records.<br>
- It can be accessed and managed by the user very easily.<br>
- It allows us to organize data into tables, rows, columns, and indexes to find the relevant information very quickly.<br>
- Each database contains distinct API for performing database operations such as creating, managing, accessing, and searching the data it stores.<br>
- There are many databases available like MySQL, Sybase, Oracle, MongoDB, PostgreSQL, etc.`,
            codeExamples: [
`CREATE DATABASE school;
USE school;
SHOW DATABASES;

/*
RESULT (SHOW DATABASES):
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql               |
| school              |
+--------------------+
*/`
            ]
          },
          {
            content: `<b>What is a Table?</b><br>
A table is where data actually lives inside a database - organized into rows (records) and columns (fields).`,
            codeExamples: [
`CREATE TABLE student (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50)
);

INSERT INTO student (name) VALUES ('Aditi');
SELECT * FROM student;

/*
RESULT:
+----+--------+
| id | name   |
+----+--------+
|  1 | Aditi  |
+----+--------+
*/`
            ]
          }
        ],
        expert: [
          {
            content: `<h3>RDBMS vs DBMS</h3>
MySQL is a <b>Relational</b> Database Management System (RDBMS) - it stores data in related tables (using keys) rather than a single flat file, and enforces relationships/constraints between them.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>DBMS</th><th>RDBMS</th></tr>
<tr><td>Stores data as files, no relationships enforced.</td><td>Stores data in tables with rows/columns linked by keys.</td></tr>
<tr><td>No constraints like PRIMARY KEY / FOREIGN KEY.</td><td>Supports PRIMARY KEY, FOREIGN KEY, UNIQUE constraints.</td></tr>
<tr><td>Example: file systems, flat XML stores.</td><td>Example: MySQL, PostgreSQL, Oracle, SQL Server.</td></tr>
</table>`
          },
          {
            content: `<h3>ACID Properties</h3>
Every transaction in MySQL (with the InnoDB storage engine) is expected to follow ACID properties - this is a very common interview topic.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Property</th><th>Meaning</th></tr>
<tr><td>Atomicity</td><td>A transaction is all-or-nothing - either every statement in it commits, or none do.</td></tr>
<tr><td>Consistency</td><td>A transaction moves the database from one valid state to another, never violating constraints.</td></tr>
<tr><td>Isolation</td><td>Concurrent transactions don't interfere with each other's intermediate state.</td></tr>
<tr><td>Durability</td><td>Once committed, changes survive even a server crash (written to disk/redo log).</td></tr>
</table>`,
            codeExamples: [
`START TRANSACTION;
UPDATE account SET balance = balance - 500 WHERE id = 1;
UPDATE account SET balance = balance + 500 WHERE id = 2;
COMMIT;   -- both updates persist together (Atomicity)
-- ROLLBACK; would undo both if something failed mid-way`
            ]
          },
          {
            content: `<h3>Storage Engines</h3>
MySQL lets each table choose a storage engine, which decides how data is stored/retrieved and which features (transactions, locking) are available.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Engine</th><th>Transactions</th><th>Row Locking</th><th>Use case</th></tr>
<tr><td>InnoDB (default)</td><td>Yes</td><td>Yes</td><td>General purpose, foreign keys, ACID compliance.</td></tr>
<tr><td>MyISAM</td><td>No</td><td>Table-level only</td><td>Read-heavy, legacy workloads.</td></tr>
</table>`,
            codeExamples: [
`CREATE TABLE orders (
  id INT PRIMARY KEY
) ENGINE = InnoDB;`
            ]
          },
          {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between DBMS and RDBMS?</td><td>RDBMS stores data in related tables and enforces keys/constraints; plain DBMS does not.</td></tr>
<tr><td>What does ACID stand for?</td><td>Atomicity, Consistency, Isolation, Durability - the guarantees a transaction provides.</td></tr>
<tr><td>Which storage engine does MySQL use by default?</td><td>InnoDB, since MySQL 5.5 - it supports transactions and row-level locking.</td></tr>
<tr><td>Is MySQL open-source?</td><td>Yes, it is open-source and currently maintained/supported by Oracle Corporation.</td></tr>
</table>`
          }
        ]
      },

      {
        id: 'client-server',
        name: 'Client Server Architecture',
        beginner: [
          {
            content: `<b>MySQL follows Client-Server Architecture.</b><br><br>
- This model is designed for the end-users called clients to access the resources from a central computer known as a server using network services.<br>
- Here, the clients make requests through a graphical user interface (GUI) or application code, and the server gives back the desired output once the instructions are matched.<br><br>
<img src="${mysqlClientServerImg}" alt="MySQL Client Server Architecture" class="d-block mx-auto h-40"/>`
          },
          {
            content: `<b>Common MySQL Clients:</b><br>
- MySQL Workbench (GUI tool)<br>
- MySQL command-line client<br>
- Application code using a JDBC/driver connection (e.g. a Java or Node.js app)`,
            codeExamples: [
`mysql -u root -p
-- connects the command-line CLIENT to the MySQL SERVER

/*
RESULT:
Enter password: ****
Welcome to the MySQL monitor...
mysql>
*/`
            ]
          }
        ],
        expert: [
          {
            content: `<h3>How a Query Travels: Client to Server</h3>
When a client sends a SQL statement, the MySQL server processes it through several internal stages before returning a result.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Client (App / CLI / Workbench)
      |
      |  1. TCP connection + authentication
      v
+----------------------+
|   Connection Layer    |  - Thread per connection, manages auth
+----------------------+
      |
      v
+----------------------+
|   SQL Parser          |  - Checks syntax, builds parse tree
+----------------------+
      |
      v
+----------------------+
|   Optimizer            |  - Chooses indexes, join order, access path
+----------------------+
      |
      v
+----------------------+
|   Executor              |  - Talks to Storage Engine (InnoDB)
+----------------------+
      |
      v
+----------------------+
|   Storage Engine        |  - Reads/writes data & index pages on disk
+----------------------+
      |
      v
   Result Set --------> back to Client</pre>`
          },
          {
            content: `<h3>Connection Handling</h3>
Each client connection is handled by a dedicated thread on the server. Opening a connection is relatively expensive (TCP handshake + authentication), which is why applications use <b>connection pooling</b> instead of opening a new connection per query.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Without Pooling</th><th>With Pooling</th></tr>
<tr><td>New TCP + auth handshake for every query.</td><td>Connections are reused from a pre-created pool.</td></tr>
<tr><td>High latency under load, connection exhaustion risk.</td><td>Lower latency, predictable resource usage.</td></tr>
</table>`,
            codeExamples: [
`SHOW STATUS LIKE 'Threads_connected';

/*
RESULT:
+-------------------+-------+
| Variable_name     | Value |
+-------------------+-------+
| Threads_connected | 12    |
+-------------------+-------+
*/`
            ]
          },
          {
            content: `<h3>Query Cache / Buffer Pool (InnoDB)</h3>
InnoDB keeps frequently accessed data and index pages in memory in the <b>Buffer Pool</b> so repeated reads avoid disk I/O. This is the single biggest performance lever for read-heavy workloads.`,
            codeExamples: [
`SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

/*
RESULT:
+-------------------------+-----------+
| Variable_name           | Value     |
+-------------------------+-----------+
| innodb_buffer_pool_size | 134217728 |
+-------------------------+-----------+
*/`
            ]
          },
          {
            content: `<h3>Replication (Basics)</h3>
In production, MySQL is often set up with one <b>primary (master)</b> server that handles writes, and one or more <b>replica</b> servers that receive a copy of the data for read scaling and failover.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        writes
Client --------> [ Primary ]
                      |
                bin-log stream
                      v
              [ Replica 1 ]   [ Replica 2 ]
                  ^                 ^
                  |__ reads ________|
                    (Clients)</pre>`
          },
          {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What architecture does MySQL follow?</td><td>Client-Server architecture - clients send SQL requests over the network, the server processes and returns results.</td></tr>
<tr><td>What happens inside the server when a query runs?</td><td>Connection layer -> Parser -> Optimizer -> Executor -> Storage Engine -> Result set.</td></tr>
<tr><td>Why use connection pooling?</td><td>Opening a raw connection is expensive (handshake + auth); pooling reuses connections to cut latency and resource use.</td></tr>
<tr><td>What is the InnoDB buffer pool?</td><td>An in-memory cache of data/index pages that avoids repeated disk I/O for frequently accessed rows.</td></tr>
</table>`
          }
        ]
      },

     {
  id: 'clauses-topic',
  name: 'Data Types & Clauses',
  beginner: [
    {
      content: `<b>What is a Data Type?</b><br>
A Data Type specifies a particular type of data, like integer, floating points, Boolean, etc.<br>
- It identifies the possible values for that type, the operations that can be performed on that type, and the way the values are stored.<br>
- In MySQL, each table column has a specific data type (e.g. INT, VARCHAR, DATE).`,
      codeExamples: [
`CREATE TABLE student (
  id INT,
  name VARCHAR(50),
  city VARCHAR(50),
  salary DECIMAL(10,2)
);`
      ]
    },
    {
      content: `<h3>1. WHERE clause</h3>
Used with SELECT, UPDATE and DELETE to filter which rows the operation applies to.<br><br>
<b>Syntax:</b> SELECT * FROM student WHERE condition;`,
      codeExamples: [
`SELECT * FROM student WHERE city = 'pune';

/*
RESULT:
+----+-------+------+--------+
| id | name  | city | salary |
+----+-------+------+--------+
|  1 | Aditi | pune | 30000  |
+----+-------+------+--------+
*/`
      ]
    },
    {
      content: `<h3>2. DISTINCT clause</h3>
Removes duplicate rows from the result and returns only unique values. Only used with SELECT.`,
      codeExamples: [
`SELECT DISTINCT city FROM student;

/*
RESULT:
+--------+
| city   |
+--------+
| pune   |
| mumbai |
+--------+
*/`
      ]
    },
    {
      content: `<h3>3. FROM clause</h3>
Specifies which table (or tables, via JOIN) to select records from. It always follows the column list in a SELECT statement.`,
      codeExamples: [
`SELECT name FROM student;`
      ]
    },
    {
      content: `<h3>4. ORDER BY clause</h3>
Sorts the result set in ascending (ASC, default) or descending (DESC) order.`,
      codeExamples: [
`SELECT * FROM student WHERE city = 'pune' ORDER BY salary DESC;

/*
RESULT:
+----+--------+------+--------+
| id | name   | city | salary |
+----+--------+------+--------+
|  3 | Rohan  | pune | 45000  |
|  1 | Aditi  | pune | 30000  |
+----+--------+------+--------+
*/`
      ]
    }
  ],
  expert: [
    {
      content: `<h3>Choosing the Right Data Type: Storage & Precision Tradeoffs</h3>
Picking the smallest/most precise data type that fits your data saves storage and speeds up indexes.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Storage</th><th>Notes</th></tr>
<tr><td>TINYINT</td><td>1 byte</td><td>Range -128 to 127 (or 0-255 unsigned) - good for flags/status codes.</td></tr>
<tr><td>INT</td><td>4 bytes</td><td>Standard integer, ~ +/-2.1 billion range.</td></tr>
<tr><td>BIGINT</td><td>8 bytes</td><td>Use for very large IDs (e.g. distributed system IDs).</td></tr>
<tr><td>FLOAT / DOUBLE</td><td>4 / 8 bytes</td><td>Approximate - never use for money (rounding errors).</td></tr>
<tr><td>DECIMAL(p,s)</td><td>Variable</td><td>Exact precision - correct choice for currency/financial data.</td></tr>
<tr><td>VARCHAR(n)</td><td>n+1 or n+2 bytes</td><td>Variable-length, stores only what's used.</td></tr>
<tr><td>CHAR(n)</td><td>n bytes (fixed)</td><td>Fixed-length, padded - faster for fixed-size codes (e.g. country code).</td></tr>
</table>`,
      codeExamples: [
`CREATE TABLE payment (
  id BIGINT PRIMARY KEY,
  amount DECIMAL(10,2),   -- exact, avoids float rounding errors
  currency CHAR(3)        -- fixed length e.g. 'USD'
);`
      ]
    },
    {
      content: `<h3>Logical Clause Execution Order</h3>
SQL is written in one order (SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ...) but the MySQL engine <b>logically executes</b> clauses in a different order. Understanding this explains why you can't reference a SELECT alias in WHERE, but you can in ORDER BY.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1. FROM        -- pick base table(s), resolve JOINs
2. WHERE       -- filter individual rows (no aggregates allowed)
3. GROUP BY    -- group filtered rows into buckets
4. HAVING      -- filter groups (aggregates allowed here)
5. SELECT      -- compute final columns/expressions/aliases
6. ORDER BY    -- sort the final result (aliases allowed)
7. LIMIT       -- cut down to requested row count</pre>`,
      codeExamples: [
`SELECT city, COUNT(*) AS total
FROM student
WHERE salary > 20000        -- step 2: row filter, before grouping
GROUP BY city                -- step 3: group rows
HAVING COUNT(*) > 1          -- step 4: filter groups
ORDER BY total DESC          -- step 6: can use alias "total" here
LIMIT 5;                     -- step 7

/*
RESULT:
+--------+-------+
| city   | total |
+--------+-------+
| pune   |     3 |
| mumbai |     2 |
+--------+-------+
*/`
      ]
    },
    {
      content: `<h3>WHERE vs HAVING</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>WHERE</th><th>HAVING</th></tr>
<tr><td>Filters individual rows before grouping.</td><td>Filters groups after GROUP BY / aggregation.</td></tr>
<tr><td>Cannot use aggregate functions like COUNT(), SUM().</td><td>Designed to use aggregate functions.</td></tr>
<tr><td>Executes earlier (logical step 2).</td><td>Executes later (logical step 4).</td></tr>
</table>`
    },
    {
      content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why prefer DECIMAL over FLOAT for money?</td><td>DECIMAL stores exact fixed-point values; FLOAT/DOUBLE are binary approximations that cause rounding errors.</td></tr>
<tr><td>What is the logical order of SQL clause execution?</td><td>FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.</td></tr>
<tr><td>Why can't you filter on an aggregate in WHERE?</td><td>WHERE runs before grouping/aggregation happens, so aggregate values don't exist yet - use HAVING instead.</td></tr>
<tr><td>Difference between CHAR and VARCHAR?</td><td>CHAR is fixed-length (padded with spaces), VARCHAR is variable-length and stores only the actual data used.</td></tr>
</table>`
    }
  ]
},


      {
        id: 'keys',
        name: 'Keys & Aggregate Functions',
        beginner: [
          {
            content: `<h3>1. Primary Key</h3>
- A primary key is used to identify each record in a table uniquely.<br>
- It cannot be NULL or empty.<br>
- A table can have only one primary key.<br>
- It always contains a unique value in that column.`,
            codeExamples: [
`CREATE TABLE student (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);

INSERT INTO student VALUES (1, 'Aditi');
-- INSERT INTO student VALUES (1, 'Rohan');  -- ERROR: duplicate id

/*
RESULT: ERROR 1062 (23000): Duplicate entry '1' for key 'PRIMARY'
*/`
            ]
          },
          {
            content: `<h3>2. Foreign Key</h3>
- A foreign key is used to link two tables together. It is also known as the referencing key.<br>
- A foreign key column in one table refers to the primary key column of another table.`,
            codeExamples: [
`CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  student_id INT,
  FOREIGN KEY (student_id) REFERENCES student(id)
);
-- student_id in "orders" must match an existing id in "student"`
            ]
          },
          {
            content: `<h3>3. Aggregate Functions - the basics</h3>
Aggregate functions calculate a single value from a set of rows.<br>
- COUNT() returns the number of rows matching a condition.<br>
- MIN() / MAX() return the smallest / largest value in a column.`,
            codeExamples: [
`SELECT COUNT(emp_name) FROM employees;
SELECT MIN(income) AS Minimum_Income FROM employees;

/*
RESULT:
+-------------------+
| COUNT(emp_name)   |
+-------------------+
|                 25 |
+-------------------+

+-----------------+
| Minimum_Income  |
+-----------------+
|          18000  |
+-----------------+
*/`
            ]
          }
        ],
        expert: [
          {
            content: `<h3>Primary Key vs Foreign Key vs Unique Key</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">student table                      orders table
+----+-------+                     +----------+------------+
| id | name  |  <--- referenced --- | order_id | student_id |
+----+-------+     by foreign key   +----------+------------+
| PK |       |                     |    PK    |     FK      |
+----+-------+                     +----------+------------+
"id" is UNIQUE + NOT NULL           "student_id" must exist
in student (Primary Key)            in student.id (Foreign Key)</pre>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Key</th><th>Purpose</th><th>NULL allowed?</th><th>Count per table</th></tr>
<tr><td>Primary Key</td><td>Uniquely identifies each row.</td><td>No</td><td>Only one (can be composite).</td></tr>
<tr><td>Foreign Key</td><td>Links to another table's primary key, enforces referential integrity.</td><td>Yes</td><td>Many allowed.</td></tr>
<tr><td>Unique Key</td><td>Ensures column values are distinct (not necessarily the row identifier).</td><td>Yes (one NULL allowed)</td><td>Many allowed.</td></tr>
</table>`,
            codeExamples: [
`CREATE TABLE employee (
  emp_id INT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,          -- unique key
  dept_id INT,
  FOREIGN KEY (dept_id) REFERENCES department(dept_id)
);`
            ]
          },
          {
            content: `<h3>Composite Keys</h3>
A composite key is a primary (or unique) key made up of two or more columns together - used when no single column is unique on its own.`,
            codeExamples: [
`CREATE TABLE enrollment (
  student_id INT,
  course_id INT,
  enrolled_on DATE,
  PRIMARY KEY (student_id, course_id)   -- composite key
);
-- Same student can enroll in many courses, and vice versa,
-- but the SAME (student_id, course_id) pair cannot repeat.`
            ]
          },
          {
            content: `<h3>Aggregate Functions with GROUP BY - Edge Cases</h3>
Aggregate functions (COUNT, SUM, AVG, MIN, MAX) are usually paired with GROUP BY. A common pitfall: NULL values are ignored by aggregate functions except COUNT(*).<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Function</th><th>Behavior with NULL</th></tr>
<tr><td>COUNT(*)</td><td>Counts all rows, including ones with NULL columns.</td></tr>
<tr><td>COUNT(column)</td><td>Counts only rows where column IS NOT NULL.</td></tr>
<tr><td>SUM(column) / AVG(column)</td><td>NULL values are skipped, not treated as 0.</td></tr>
</table>`,
            codeExamples: [
`SELECT dept_id, COUNT(*) AS total_emp, AVG(income) AS avg_income
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 3;

/*
RESULT:
+---------+-----------+-------------+
| dept_id | total_emp | avg_income  |
+---------+-----------+-------------+
|       1 |         5 |    42000.00 |
|       3 |         4 |    38500.00 |
+---------+-----------+-------------+
*/`
            ]
          },
          {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Can a table have more than one primary key?</td><td>No, only one primary key per table, though it can span multiple columns (composite key).</td></tr>
<tr><td>Difference between Primary Key and Unique Key?</td><td>Primary key disallows NULL and there's only one per table; Unique key allows multiple NULLs (in MySQL, NULL is never equal to NULL) and a table can have several.</td></tr>
<tr><td>Does COUNT(column) count NULL values?</td><td>No - COUNT(column) skips NULLs; only COUNT(*) counts every row regardless of NULLs.</td></tr>
<tr><td>What is a composite key?</td><td>A primary/unique key formed from two or more columns combined, used when no single column is unique.</td></tr>
</table>`
          }
        ]
      },

     {
  id: 'commands',
  name: 'SQL Command Types',
  beginner: [
    {
      content: `<b>SQL commands are grouped into 4 categories</b> based on what they do:<br><br>
<img src="${mysqlCommandsImg}" alt="SQL Command Types" class="d-block mx-auto h-90"/><br><br>
1. <b>DDL</b> (Data Definition Language) - defines structure: CREATE, ALTER, DROP<br>
2. <b>DML</b> (Data Manipulation Language) - works with data: SELECT, INSERT, UPDATE, DELETE<br>
3. <b>DCL</b> (Data Control Language) - manages permissions: GRANT, REVOKE<br>
4. <b>TCL</b> (Transaction Control Language) - manages transactions: COMMIT, ROLLBACK`
    },
    {
      content: `<h3>DDL example - creating structure</h3>`,
      codeExamples: [
`CREATE TABLE student (id INT, name VARCHAR(50));
ALTER TABLE student ADD city VARCHAR(50);
DROP TABLE student;

/*
RESULT:
Query OK, 0 rows affected
*/`
      ]
    },
    {
      content: `<h3>DML example - working with data</h3>`,
      codeExamples: [
`INSERT INTO student VALUES (1, 'Aditi', 'Pune');
UPDATE student SET city = 'Mumbai' WHERE id = 1;
SELECT * FROM student;

/*
RESULT:
+----+-------+--------+
| id | name  | city   |
+----+-------+--------+
|  1 | Aditi | Mumbai |
+----+-------+--------+
*/`
      ]
    },
    {
      content: `<h3>DCL example - controlling access</h3>`,
      codeExamples: [
`GRANT SELECT, INSERT ON school.student TO 'app_user'@'localhost';
REVOKE INSERT ON school.student FROM 'app_user'@'localhost';`
      ]
    },
    {
      content: `<h3>TCL example - controlling a transaction</h3>`,
      codeExamples: [
`START TRANSACTION;
UPDATE student SET city = 'Delhi' WHERE id = 1;
COMMIT;   -- makes the change permanent
-- ROLLBACK;  would undo it instead`
      ]
    }
  ],
  expert: [
    {
      content: `<b>1. DDL Statements</b><br>
DDL is short name of Data Definition Language, which deals with database schemas and
descriptions of how the data should reside in the database.<br><br>

<table style="width:100%; border-collapse: collapse;" border="1" cellpadding="8">
<tr>
<th style="border:1px solid black;">Command</th>
<th style="border:1px solid black;">Description</th>
</tr>

<tr>
<td style="border:1px solid black;">CREATE</td>
<td style="border:1px solid black;">Used to create a database or table.</td>
</tr>

<tr>
<td style="border:1px solid black;">ALTER</td>
<td style="border:1px solid black;">Alters the structure of the existing database or table.</td>
</tr>

<tr>
<td style="border:1px solid black;">DROP</td>
<td style="border:1px solid black;">Deletes objects from the database.</td>
</tr>

<tr>
<td style="border:1px solid black;">TRUNCATE</td>
<td style="border:1px solid black;">Removes all records from a table and frees allocated space.</td>
</tr>

<tr>
<td style="border:1px solid black;">COMMENT</td>
<td style="border:1px solid black;">Adds comments to the data dictionary.</td>
</tr>

<tr>
<td style="border:1px solid black;">RENAME</td>
<td style="border:1px solid black;">Renames an existing database object.</td>
</tr>

</table><br>

<b>2. DML Statements </b><br>
DML is short name of Data Manipulation Language which deals with data manipulation
and includes most common SQL statements such SELECT, INSERT, UPDATE,
DELETE, etc., and it is used to store, modify, retrieve, delete and update data in a
database. <br>
<table style="width:100%; border-collapse: collapse;" border="1" cellpadding="8">
<tr>
<th style="border:1px solid black;">Command</th>
<th style="border:1px solid black;">Description</th>
</tr>

<tr>
<td style="border:1px solid black;">SELECT</td>
<td style="border:1px solid black;">Retrieve data from a database.</td>
</tr>

<tr>
<td style="border:1px solid black;">INSERT</td>
<td style="border:1px solid black;">Insert data into a table.</td>
</tr>

<tr>
<td style="border:1px solid black;">UPDATE</td>
<td style="border:1px solid black;">Updates existing data within a table.</td>
</tr>

<tr>
<td style="border:1px solid black;">DELETE</td>
<td style="border:1px solid black;">Deletes records from a database table.</td>
</tr>

<tr>
<td style="border:1px solid black;">MERGE</td>
<td style="border:1px solid black;">Not available in MySQL (Oracle/standard SQL). MySQL uses <code>INSERT ... ON DUPLICATE KEY UPDATE</code> or <code>REPLACE</code> for upserts.</td>
</tr>

<tr>
<td style="border:1px solid black;">CALL</td>
<td style="border:1px solid black;">Calls a stored procedure (in MySQL these are written in its own procedural SQL; PL/SQL is Oracle).</td>
</tr>

<tr>
<td style="border:1px solid black;">EXPLAIN (MySQL has no EXPLAIN PLAN - that is Oracle)</td>
<td style="border:1px solid black;">Shows interpretation of the data access path.</td>
</tr>

<tr>
<td style="border:1px solid black;">LOCK TABLE</td>
<td style="border:1px solid black;">Used for concurrency control.</td>
</tr>
</table>
<br>
<b>3. DCL Statements </b><br>
DCL is short name of Data Control Language which includes commands such as GRANT
and mostly concerned with rights, permissions and other controls of the database system.<br>
<table style="width:100%; border-collapse: collapse;" border="1" cellpadding="8">
<tr>
<th style="border:1px solid black;">Command</th>
<th style="border:1px solid black;">Description</th>
</tr>

<tr>
<td style="border:1px solid black;">GRANT</td>
<td style="border:1px solid black;">Allows users access privileges to the database.</td>
</tr>

<tr>
<td style="border:1px solid black;">REVOKE</td>
<td style="border:1px solid black;">Withdraws user access privileges previously granted using the GRANT command.</td>
</tr>

</table>
<br>
<b>4. TCL Statements </b><br>
TCL is short name of Transaction Control Language which deals with a transaction within
a database.<br>
<table style="width:100%; border-collapse: collapse;" border="1" cellpadding="8">
<tr>
<th style="border:1px solid black;">Command</th>
<th style="border:1px solid black;">Description</th>
</tr>

<tr>
<td style="border:1px solid black;">COMMIT</td>
<td style="border:1px solid black;">Commits a transaction.</td>
</tr>

<tr>
<td style="border:1px solid black;">ROLLBACK</td>
<td style="border:1px solid black;">Rolls back a transaction if an error occurs.</td>
</tr>

<tr>
<td style="border:1px solid black;">SAVEPOINT</td>
<td style="border:1px solid black;">Creates rollback points within a transaction.</td>
</tr>

<tr>
<td style="border:1px solid black;">SET TRANSACTION</td>
<td style="border:1px solid black;">Specifies characteristics of a transaction.</td>
</tr>

</table>
<br>
`
    },
    {
      content: `<h3>DDL vs DML vs DCL vs TCL - Quick Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Category</th><th>Purpose</th><th>Auto-committed?</th><th>Example</th></tr>
<tr><td>DDL</td><td>Defines/alters schema structure.</td><td>Yes - implicit commit.</td><td>CREATE TABLE, ALTER TABLE, DROP TABLE</td></tr>
<tr><td>DML</td><td>Manipulates row data.</td><td>No - part of a transaction.</td><td>INSERT, UPDATE, DELETE, SELECT</td></tr>
<tr><td>DCL</td><td>Manages permissions/access.</td><td>Yes - implicit commit.</td><td>GRANT, REVOKE</td></tr>
<tr><td>TCL</td><td>Controls DML transactions.</td><td>N/A - this IS the commit control.</td><td>COMMIT, ROLLBACK, SAVEPOINT</td></tr>
</table>
<br>
<b>Key gotcha:</b> DDL statements in MySQL cause an implicit COMMIT - so you cannot ROLLBACK a CREATE/ALTER/DROP once it has run, even inside a transaction.`,
      codeExamples: [
`START TRANSACTION;
INSERT INTO student VALUES (2, 'Raoji', 'Pune');
CREATE TABLE temp_log (id INT);   -- implicit COMMIT happens here!
ROLLBACK;
-- The INSERT is ALSO committed now, because the DDL forced a commit
-- before the ROLLBACK could undo it.`
      ]
    },
    {
      content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the 4 categories of SQL commands?</td><td>DDL (structure), DML (data), DCL (permissions), TCL (transactions).</td></tr>
<tr><td>Is TRUNCATE DDL or DML?</td><td>DDL - it resets the table and cannot be rolled back like DELETE can (in most engines).</td></tr>
<tr><td>Why can't you ROLLBACK after a CREATE TABLE in the same transaction?</td><td>DDL statements cause an implicit COMMIT in MySQL, ending the current transaction early.</td></tr>
<tr><td>What's the difference between GRANT/REVOKE and COMMIT/ROLLBACK?</td><td>GRANT/REVOKE (DCL) manage who can access data; COMMIT/ROLLBACK (TCL) manage whether pending data changes are saved or undone.</td></tr>
</table>`
    }
  ]
},



      {
        id: 'crud',
        name: 'Table Operations',
        beginner: [
          {
            content: `<h3>1. CREATE TABLE</h3>
Creates a new table with the given columns and their data types.<br><br>
<b>Syntax:</b> CREATE TABLE table_name (column_name column_type);`,
            codeExamples: [
`CREATE TABLE User (
  id INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(255),
  City VARCHAR(255),
  Salary VARCHAR(255),
  PRIMARY KEY(id)
);

/*
RESULT:
Query OK, 0 rows affected
*/`
            ]
          },
          {
            content: `<h3>2. INSERT INTO</h3>
Adds new row(s) of data into a table.<br><br>
<b>Syntax:</b> INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...);`,
            codeExamples: [
`INSERT INTO User (FirstName, City, Salary)
VALUES ('Jay', 'pune', 25000);

-- multiple rows at once
INSERT INTO User (FirstName, City, Salary)
VALUES ('Ashok', 'pune', 45000), ('Rajaram', 'pune', 35000);

/*
RESULT:
Query OK, 1 row affected
*/`
            ]
          },
          {
            content: `<h3>3. SELECT</h3>
Retrieves data from a table.<br><br>
<b>Syntax:</b> SELECT field_name1, field_name2 FROM table_name [WHERE condition];`,
            codeExamples: [
`SELECT * FROM User WHERE City = 'pune';

/*
RESULT:
+----+-----------+------+--------+
| id | FirstName | City | Salary |
+----+-----------+------+--------+
|  1 | Jay       | pune | 25000  |
+----+-----------+------+--------+
*/`
            ]
          },
          {
            content: `<h3>4. UPDATE</h3>
Modifies existing rows in a table.<br><br>
<b>Syntax:</b> UPDATE table_name SET column1 = value1 [WHERE condition];`,
            codeExamples: [
`UPDATE User SET FirstName = 'Rohan' WHERE id = 1;

/*
RESULT:
Query OK, 1 row affected
*/`
            ]
          },
          {
            content: `<h3>5. DELETE</h3>
Removes row(s) from a table. Always use a WHERE clause unless you intend to remove every row.<br><br>
<b>Syntax:</b> DELETE FROM table_name WHERE condition;`,
            codeExamples: [
`DELETE FROM User WHERE id = 1;

/*
RESULT:
Query OK, 1 row affected
*/`
            ]
          }
        ],
        expert: [
          {
            content: `<h3>ALTER TABLE - Add, Drop, Modify Columns</h3>
ALTER TABLE changes the structure of an existing table without dropping and recreating it.<br><br>

<table style="width:100%; border-collapse: collapse;" border="1" cellpadding="8">
<tr>
<th style="border:1px solid black;">Table Alter (Add, Drop, Modify)</th>
</tr>

<tr>
<td style="border:1px solid black;">

<b>Add Column</b><br>
ALTER TABLE table_name ADD column_name datatype;<br><br>

<b>Drop Column</b><br>
ALTER TABLE table_name DROP column_name;<br><br>

<b>Modify Column</b><br>
ALTER TABLE table_name MODIFY column_name datatype;

</td>
</tr>
</table>`,
            codeExamples: [
`ALTER TABLE User ADD Email VARCHAR(100);
ALTER TABLE User MODIFY Salary DECIMAL(10,2);
ALTER TABLE User DROP City;

/*
RESULT:
Query OK, 0 rows affected
Records: 0  Duplicates: 0  Warnings: 0
*/`
            ]
          },
          {
            content: `<h3>Constraints on Columns</h3>
Constraints enforce rules on the data a column can hold.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Constraint</th><th>Effect</th></tr>
<tr><td>NOT NULL</td><td>Column cannot store NULL values.</td></tr>
<tr><td>UNIQUE</td><td>All values in the column must be distinct.</td></tr>
<tr><td>DEFAULT</td><td>Sets a fallback value when none is provided.</td></tr>
<tr><td>CHECK</td><td>Validates values against a boolean condition.</td></tr>
<tr><td>AUTO_INCREMENT</td><td>Generates sequential numeric values automatically.</td></tr>
</table>`,
            codeExamples: [
`CREATE TABLE User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  salary DECIMAL(10,2) DEFAULT 0,
  age INT CHECK (age >= 18)
);`
            ]
          },
          {
            content: `<h3>Indexes</h3>
An index speeds up SELECT/WHERE lookups on a column at the cost of slightly slower writes (the index must also be updated).`,
            codeExamples: [
`CREATE INDEX idx_city ON User(City);

EXPLAIN SELECT * FROM User WHERE City = 'pune';

/*
RESULT (EXPLAIN, simplified):
+----+-------+----------+------+---------------+
| id | table | type     | key  | possible_keys |
+----+-------+----------+------+---------------+
|  1 | User  | ref      | idx_city | idx_city  |
+----+-------+----------+------+---------------+
-- "ref" access via idx_city instead of a full table scan
*/`
            ]
          },
          {
            content: `<h3>DELETE vs TRUNCATE</h3>
<table style="width:100%; border-collapse: collapse;" border="1" cellpadding="8">
<tr>
<th style="border:1px solid black;">Sr. No.</th>
<th style="border:1px solid black;">DELETE</th>
<th style="border:1px solid black;">TRUNCATE</th>
</tr>

<tr>
<td style="border:1px solid black;">1</td>
<td style="border:1px solid black;">DELETE command is used to delete specified rows (one or more).</td>
<td style="border:1px solid black;">TRUNCATE command deletes all rows from a table.</td>
</tr>

<tr>
<td style="border:1px solid black;">2</td>
<td style="border:1px solid black;">It is a DML (Data Manipulation Language) command.</td>
<td style="border:1px solid black;">It is a DDL (Data Definition Language) command.</td>
</tr>

<tr>
<td style="border:1px solid black;">3</td>
<td style="border:1px solid black;">DELETE command can use a WHERE clause to filter records.</td>
<td style="border:1px solid black;">TRUNCATE command cannot use a WHERE clause.</td>
</tr>

<tr>
<td style="border:1px solid black;">4</td>
<td style="border:1px solid black;">In DELETE, each row (tuple) is locked before removal.</td>
<td style="border:1px solid black;">In TRUNCATE, the data page is locked before removing table data.</td>
</tr>

</table>`,
            codeExamples: [
`SET SQL_SAFE_UPDATES = 0;
DELETE FROM User;         -- can be rolled back inside a transaction, logs each row
TRUNCATE TABLE User;      -- resets AUTO_INCREMENT too, implicit commit, cannot rollback`
            ]
          },
          {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Difference between DELETE and TRUNCATE?</td><td>DELETE is DML, can use WHERE, can be rolled back; TRUNCATE is DDL, removes all rows, resets AUTO_INCREMENT, cannot be rolled back.</td></tr>
<tr><td>How do you rename a column with ALTER TABLE?</td><td>ALTER TABLE table_name CHANGE old_name new_name datatype;</td></tr>
<tr><td>Why add an index?</td><td>To speed up SELECT/WHERE/JOIN lookups by avoiding a full table scan, at the cost of extra write overhead.</td></tr>
<tr><td>What does AUTO_INCREMENT do?</td><td>Automatically generates the next sequential integer value for a column (typically the primary key) on each INSERT.</td></tr>
</table>`
          }
        ]
      },

      {
  id: 'join-types',
  name: 'Join Types',
  beginner: [
    {
      content: `<h3>Why Join?</h3>
- If we want to retrieve data from multiple tables, we use join queries.<br>
- Using one SELECT statement, we can retrieve data from multiple tables.<br>
- It fetches related records from two or more tables based on a common column.<br><br>

<b>Common Types of MySQL Joins:</b><br>
1. INNER JOIN<br>
2. LEFT (OUTER) JOIN<br>
3. RIGHT (OUTER) JOIN<br>
4. FULL (OUTER) JOIN`
    },
    {
      content: `<h3>INNER JOIN - the basics</h3>
Returns only the rows that have a match in BOTH tables.<br><br>
<b>Syntax:</b><br>
SELECT columns FROM table1<br>
INNER JOIN table2<br>
ON table1.column = table2.column;`,
      codeExamples: [
`-- students table: id, name
-- marks table:    student_id, score

SELECT s.name, m.score
FROM students s
INNER JOIN marks m
ON s.id = m.student_id;

/*
RESULT (only students who HAVE a marks row):
+-------+-------+
| name  | score |
+-------+-------+
| Aditi |    90 |
| Rohan |    75 |
+-------+-------+
*/`
      ]
    },
    {
      content: `<h3>LEFT JOIN - the basics</h3>
Returns ALL rows from the left table, plus matching rows from the right table. Unmatched right-side columns come back as NULL.<br><br>
<b>Syntax:</b><br>
SELECT columns FROM table1<br>
LEFT JOIN table2<br>
ON table1.column = table2.column;`,
      codeExamples: [
`SELECT s.name, m.score
FROM students s
LEFT JOIN marks m
ON s.id = m.student_id;

/*
RESULT (every student, even without a marks row):
+-------+-------+
| name  | score |
+-------+-------+
| Aditi |    90 |
| Rohan |    75 |
| Kabir |  NULL |   -- no matching row in marks
+-------+-------+
*/`
      ]
    }
  ],
  expert: [
    {
      content: `<h3>Setting up the example tables</h3>
<div style="border:2px solid #000; padding:10px;">
<b>Customers Table</b><br>
create table customers(<br>
&nbsp;&nbsp;customerid int(10) primary key auto_increment not null,<br>
&nbsp;&nbsp;customername varchar(32),<br>
&nbsp;&nbsp;email varchar(32),<br>
&nbsp;&nbsp;phone varchar(255)<br>
);<br><br>

<b>Modify Column Size</b><br>
ALTER TABLE customers<br>
MODIFY phone varchar(255);
</div>
               <img src="${mysqlJoin1Img}" alt="Customers table structure" class="d-block mx-auto h-50"/>

<div style="border:2px solid #000; padding:10px;">
<b>Accounts Table</b><br>
create table accounts(<br>
&nbsp;&nbsp;customerid int,<br>
&nbsp;&nbsp;accountsid int primary key auto_increment not null,<br>
&nbsp;&nbsp;accountstype varchar(10),<br>
&nbsp;&nbsp;balance int(50),<br>
&nbsp;&nbsp;foreign key(customerid) references customers(customerid)<br>
);
</div>
               <img src="${mysqlJoin2Img}" alt="Accounts table structure" class="d-block mx-auto h-40"/>`
    },
    {
      content: `<h3>INNER JOIN</h3>
Returns only matching rows from both tables.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   customers          accounts
  +---------+        +---------+
  |    A    |        |    B    |
  |   ___   |        |   ___   |
  |  /   \\  |        |  /   \\  |
  | (  X )--INNER JOIN--( X )  |     result = only the overlap (X)
  |  \\___/  |        |  \\___/  |
  +---------+        +---------+</pre>

describe accounts;<br><br>

Select customers.customerid,<br>
&nbsp;&nbsp;customername,<br>
&nbsp;&nbsp;email,<br>
&nbsp;&nbsp;accountsid,<br>
&nbsp;&nbsp;balance<br>
from customers<br>
INNER JOIN accounts<br>
on customers.customerid = accounts.customerid;
               <img src="${mysqlJoin3Img}" alt="INNER JOIN result" class="d-block mx-auto h-40"/>`,
      codeExamples: [
`SELECT c.customername, a.balance
FROM customers c
INNER JOIN accounts a
ON c.customerid = a.customerid;

/*
RESULT (only customers WITH an account):
+--------------+---------+
| customername | balance |
+--------------+---------+
| Jay Naik     |   25000 |
| Ashok Patil  |   45000 |
+--------------+---------+
*/`
      ]
    },
    {
      content: `<h3>LEFT (OUTER) JOIN</h3>
Returns all rows from the left-hand table (customers) and only matching rows from accounts. If no match exists, NULL values are returned.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   customers (ALL)     accounts
  +----------------+   +---------+
  |  #########      |   |   ___   |
  |  ##  X  ##------LEFT JOIN--( X )   result = ALL of left + overlap
  |  #########      |   |  \\___/  |
  +----------------+   +---------+</pre>

<b>Syntax</b><br>
SELECT columns<br>
FROM table1<br>
LEFT [OUTER] JOIN table2<br>
ON table1.column = table2.column;<br><br>

<b>Example</b><br>
select customername, email, accountsid, balance<br>
from customers<br>
left join accounts<br>
on customers.customerid = accounts.customerid;
               <img src="${mysqlJoin4Img}" alt="LEFT JOIN result" class="d-block mx-auto h-40"/>`,
      codeExamples: [
`SELECT customername, email, accountsid, balance
FROM customers
LEFT JOIN accounts
ON customers.customerid = accounts.customerid;

/*
RESULT (every customer, accounts columns NULL if none):
+---------------+-----------+------------+---------+
| customername  | email     | accountsid | balance |
+---------------+-----------+------------+---------+
| Jay Naik      | jay@x.com |          1 |   25000 |
| Rajaram Patil | ram@x.com |       NULL |    NULL |
+---------------+-----------+------------+---------+
*/`
      ]
    },
    {
      content: `<h3>RIGHT (OUTER) JOIN</h3>
Returns all rows from the right-hand table (accounts) and only matching rows from customers. If no match exists, NULL values are returned.<br><br>

<b>Syntax</b><br>
SELECT columns<br>
FROM table1<br>
RIGHT [OUTER] JOIN table2<br>
ON table1.column = table2.column;<br><br>

<b>Example</b><br>
select customername, email, accountsid, balance<br>
from customers<br>
right join accounts<br>
on customers.customerid = accounts.customerid;
               <img src="${mysqlJoin5Img}" alt="RIGHT JOIN result" class="d-block mx-auto h-40"/>`,
      codeExamples: [
`SELECT customername, email, accountsid, balance
FROM customers
RIGHT JOIN accounts
ON customers.customerid = accounts.customerid;

/*
RESULT (every account row, customer columns NULL if orphaned):
+--------------+---------------+------------+---------+
| customername | email         | accountsid | balance |
+--------------+---------------+------------+---------+
| Jay Naik     | jay@x.com     |          1 |   25000 |
| NULL         | NULL          |          7 |    9000 |
+--------------+---------------+------------+---------+
*/`
      ]
    },
    {
      content: `<h3>FULL (OUTER) JOIN</h3>
MySQL does not directly support FULL OUTER JOIN. It is emulated by combining LEFT JOIN and RIGHT JOIN with UNION (UNION also removes duplicate matching rows).<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   customers            accounts
  +----------------+   +----------------+
  |  ############# |   | ############## |
  |  ####  X  ######FULL JOIN###  X  ### |   result = everything, both sides
  |  ############# |   | ############## |
  +----------------+   +----------------+</pre>

<b>Syntax / Example</b><br>
select * from customers left join accounts<br>
on customers.customerid = accounts.customerid<br>
union<br>
select * from customers right join accounts<br>
on customers.customerid = accounts.customerid;
               <img src="${mysqlJoin6Img}" alt="FULL OUTER JOIN result" class="d-block mx-auto h-40"/>`,
      codeExamples: [
`SELECT *
FROM customers
LEFT JOIN accounts
ON customers.customerid = accounts.customerid

UNION

SELECT *
FROM customers
RIGHT JOIN accounts
ON customers.customerid = accounts.customerid;

/*
RESULT: all customers (even without accounts) + all accounts
(even orphaned ones), each row appearing once.
*/`
      ]
    },
    {
      content: `<h3>CROSS JOIN & SELF JOIN</h3>
<b>CROSS JOIN</b> returns the Cartesian product - every row of table1 paired with every row of table2 (no ON condition).<br>
<b>SELF JOIN</b> joins a table to itself, using table aliases, typically to compare rows within the same table (e.g. employee-manager).`,
      codeExamples: [
`-- CROSS JOIN: 2 sizes x 3 colors = 6 combinations
SELECT s.size, c.color
FROM sizes s
CROSS JOIN colors c;

/*
RESULT:
+------+--------+
| size | color  |
+------+--------+
| S    | Red    |
| S    | Blue   |
| S    | Green  |
| M    | Red    |
| M    | Blue   |
| M    | Green  |
+------+--------+
*/

-- SELF JOIN: find each employee's manager name
SELECT e.name AS employee, m.name AS manager
FROM employee e
JOIN employee m ON e.manager_id = m.id;

/*
RESULT:
+----------+---------+
| employee | manager |
+----------+---------+
| Rohan    | Aditi   |
| Kabir    | Aditi   |
+----------+---------+
*/`
      ]
    },
    {
      content: `<h3>Join Performance & Index Tips</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Tip</th><th>Why</th></tr>
<tr><td>Index the join columns (usually the FK).</td><td>Without an index, MySQL does a full scan of the joined table per outer row.</td></tr>
<tr><td>Join on matching, indexed data types.</td><td>Implicit type conversion (e.g. INT vs VARCHAR) can silently disable index usage.</td></tr>
<tr><td>Filter early with WHERE on indexed columns.</td><td>Reduces the row set the optimizer has to join.</td></tr>
<tr><td>Use EXPLAIN to check the join plan.</td><td>Confirms whether MySQL is using "ref"/"eq_ref" (index) vs "ALL" (full scan).</td></tr>
</table>`,
      codeExamples: [
`EXPLAIN
SELECT c.customername, a.balance
FROM customers c
INNER JOIN accounts a ON c.customerid = a.customerid;

/*
RESULT (simplified):
+----+-------+--------+---------------+
| id | table | type   | key           |
+----+-------+--------+---------------+
|  1 | c     | ALL    | PRIMARY       |
|  1 | a     | ref    | customerid_fk |   <- using index, good
+----+-------+--------+---------------+
*/`
      ]
    },
    {
      content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Difference between INNER JOIN and LEFT JOIN?</td><td>INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all left-table rows plus matches, with NULLs where no match exists.</td></tr>
<tr><td>Does MySQL support FULL OUTER JOIN directly?</td><td>No - it must be emulated using LEFT JOIN UNION RIGHT JOIN.</td></tr>
<tr><td>What is a SELF JOIN used for?</td><td>Comparing rows within the same table, e.g. finding an employee's manager from the same employee table.</td></tr>
<tr><td>What does CROSS JOIN produce?</td><td>The Cartesian product - every row of one table paired with every row of the other, with no ON condition.</td></tr>
<tr><td>How do you speed up a slow JOIN?</td><td>Index the join columns, avoid implicit type conversions, filter early, and check the plan with EXPLAIN.</td></tr>
</table>`
    }
  ]
},



      {
        id: 'nth-salary',
        name: 'Nth Highest Salary',
        beginner: [
          {
            content: `<b>Setup</b><br>
create table employee( id int(10) primary key auto_increment not null,
name varchar(32), salary int);<br><br>

Finding the Nth highest salary in a table is one of the most common SQL interview questions.`,
            codeExamples: [
`CREATE TABLE employee (id INT PRIMARY KEY, name VARCHAR(32), salary INT);
INSERT INTO employee VALUES
(1,'Aditi',90000), (2,'Rohan',80000), (3,'Kabir',80000), (4,'Meera',60000);`
            ]
          },
          {
            content: `<h3>Highest (1st) salary</h3>
The simplest case - just sort descending and take the top row.`,
            codeExamples: [
`SELECT MAX(salary) AS highest_salary FROM employee;

/*
RESULT:
+----------------+
| highest_salary |
+----------------+
|          90000 |
+----------------+
*/`
            ]
          },
          {
            content: `<h3>2nd highest salary - using LIMIT with OFFSET</h3>
Sort all salaries descending, skip the first row (OFFSET 1), then take 1 row.`,
            codeExamples: [
`SELECT DISTINCT salary
FROM employee
ORDER BY salary DESC
LIMIT 1 OFFSET 1;

/*
RESULT:
+--------+
| salary |
+--------+
|  80000 |
+--------+
*/`
            ]
          }
        ],
        expert: [
          {
            content: `<h3>Approach 1: Subquery with LIMIT</h3>
Sort salaries descending, LIMIT to N rows, then re-sort ascending and take the top - the last of the top-N when sorted descending.`,
            codeExamples: [
`-- 1st highest
SELECT salary FROM (
  SELECT salary FROM employee ORDER BY salary DESC LIMIT 1
) AS s ORDER BY salary LIMIT 1;

-- 2nd highest
SELECT salary FROM (
  SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 2
) AS s ORDER BY salary LIMIT 1;

-- 3rd highest
SELECT salary FROM (
  SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 3
) AS s ORDER BY salary LIMIT 1;

/*
RESULT (3rd highest, using sample data above):
+--------+
| salary |
+--------+
|  60000 |
+--------+
*/`
            ]
          },
          {
            content: `<h3>Approach 2: LIMIT with OFFSET (no subquery)</h3>
The shorter, more idiomatic MySQL way - LIMIT offset,count skips "offset" rows then returns "count" rows.<br><br>
<b>Note:</b> use DISTINCT salary, otherwise tied salaries (like Rohan and Kabir both at 80000) will shift the offset incorrectly.`,
            codeExamples: [
`-- 2nd highest salary
SELECT DISTINCT salary FROM employee ORDER BY salary DESC LIMIT 1,1;
-- first "1" = OFFSET (skip 1 row = the highest), second "1" = fetch only 1 row

/*
RESULT:
+--------+
| salary |
+--------+
|  80000 |
+--------+
*/`
            ]
          },
          {
            content: `<h3>Approach 3: DENSE_RANK() window function (MySQL 8.0+)</h3>
The most robust and readable approach - correctly handles duplicate/tied salaries because DENSE_RANK() assigns the same rank to ties without skipping the next rank.`,
            codeExamples: [
`SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employee
) ranked
WHERE rnk = 2;

/*
RESULT (Rohan and Kabir are tied at rank 1 for 80000 being rank 2
after 90000 - DENSE_RANK gives both 80000 rows rank 2):
+--------+
| salary |
+--------+
|  80000 |
|  80000 |
+--------+
*/`
            ]
          },
          {
            content: `<h3>Approach 4: Correlated subquery (COUNT DISTINCT higher salaries)</h3>
Works on any MySQL version (pre-8.0 too, no window functions needed). For each salary, count how many DISTINCT salaries are strictly greater; the Nth highest is where that count equals N-1.`,
            codeExamples: [
`SELECT DISTINCT salary
FROM employee e1
WHERE (
  SELECT COUNT(DISTINCT salary)
  FROM employee e2
  WHERE e2.salary > e1.salary
) = 1;   -- 1 = (N-1) for the 2nd highest

/*
RESULT:
+--------+
| salary |
+--------+
|  80000 |
+--------+
*/`
            ]
          },
          {
            content: `<h3>Which approach should you use?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Approach</th><th>Handles ties correctly</th><th>MySQL version</th><th>Readability</th></tr>
<tr><td>Subquery + LIMIT</td><td>Only with DISTINCT</td><td>Any</td><td>Medium</td></tr>
<tr><td>LIMIT OFFSET</td><td>Only with DISTINCT</td><td>Any</td><td>High (shortest)</td></tr>
<tr><td>DENSE_RANK() window function</td><td>Yes, naturally</td><td>8.0+</td><td>High, most correct</td></tr>
<tr><td>Correlated subquery (COUNT DISTINCT)</td><td>Yes</td><td>Any (pre-8.0 friendly)</td><td>Medium, but scales poorly on large tables</td></tr>
</table>
<br>
<b>Recommendation:</b> use DENSE_RANK() on MySQL 8.0+; fall back to the correlated subquery or DISTINCT + LIMIT OFFSET on older versions.`
          },
          {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>How do you find the 2nd highest salary without LIMIT?</td><td>A correlated subquery: WHERE (SELECT COUNT(DISTINCT salary) FROM t WHERE salary > outer.salary) = 1.</td></tr>
<tr><td>Why use DISTINCT when finding Nth highest with LIMIT?</td><td>Duplicate salary values would otherwise consume extra "slots" and shift the offset, giving a wrong answer.</td></tr>
<tr><td>What's the advantage of DENSE_RANK() over LIMIT/OFFSET?</td><td>It correctly ranks tied values without gaps or skips, avoiding manual DISTINCT handling.</td></tr>
<tr><td>Difference between RANK() and DENSE_RANK()?</td><td>RANK() leaves gaps after ties (1,2,2,4); DENSE_RANK() does not (1,2,2,3).</td></tr>
</table>`
          }
        ]
      }
    ]
  },
  ...mysqlSyllabusModules
],



    cheatNotes: [
      // Database & Architecture
      'CREATE DATABASE dbname - Create a new database',
      'USE dbname - Select database to work with',
      'DROP DATABASE dbname - Permanently delete a database',
      'Client-Server architecture - MySQL server handles requests from client apps/tools',
      'Storage engine - InnoDB (default, supports transactions) vs MyISAM (no transactions)',
      // DDL - Data Definition Language
      'DDL - CREATE, ALTER, DROP, TRUNCATE - Defines/modifies schema structure',
      'CREATE TABLE - Create a new table with columns and constraints',
      'ALTER TABLE - Add/modify/drop columns or constraints',
      'DROP TABLE - Permanently delete a table and its data',
      'TRUNCATE TABLE - Remove all rows, keep table structure (faster than DELETE)',
      // DML - Data Manipulation Language
      'DML - INSERT, UPDATE, DELETE, SELECT - Manipulates data inside tables',
      'INSERT INTO - Add new row(s) of data',
      'SELECT * FROM - Query and retrieve data',
      'UPDATE ... SET - Modify existing rows',
      'DELETE FROM - Remove rows (can use WHERE, logged, rollback-able)',
      // DCL & TCL
      'DCL - GRANT, REVOKE - Controls user access permissions',
      'TCL - COMMIT, ROLLBACK, SAVEPOINT - Controls transactions',
      'COMMIT - Permanently saves transaction changes',
      'ROLLBACK - Undoes changes since last COMMIT',
      'SAVEPOINT - Marks a point within a transaction to rollback to',
      'ACID - Atomicity, Consistency, Isolation, Durability - transaction guarantees',
      // Data Types
      'INT, BIGINT, DECIMAL - Numeric data types',
      'VARCHAR(n), CHAR(n), TEXT - String data types',
      'DATE, DATETIME, TIMESTAMP - Date/time data types',
      'BOOLEAN - Stored as TINYINT(1) internally in MySQL',
      // Keys & Constraints
      'PRIMARY KEY - Uniquely identifies each row, not null, one per table',
      'FOREIGN KEY - Enforces referential integrity between tables',
      'UNIQUE KEY - Ensures non-NULL values are distinct; MySQL permits multiple NULLs',
      'Composite key - Primary key made of two or more columns',
      'NOT NULL - Column cannot store NULL values',
      'DEFAULT - Sets a default value when none is provided',
      'AUTO_INCREMENT - Automatically generates sequential numeric values',
      'CHECK - Validates values against a condition',
      // Clauses
      'WHERE - Filters rows before grouping',
      'GROUP BY - Groups rows sharing a column value',
      'HAVING - Filters groups after aggregation (unlike WHERE)',
      'ORDER BY - Sorts result set (ASC default, or DESC)',
      'LIMIT - Restricts number of rows returned',
      'DISTINCT - Removes duplicate rows from result',
      // Joins
      'INNER JOIN - Returns only matching rows from both tables',
      'LEFT JOIN - All rows from left table + matched rows from right',
      'RIGHT JOIN - All rows from right table + matched rows from left',
      'FULL JOIN - All rows from both tables (emulated in MySQL via UNION)',
      'SELF JOIN - Table joined with itself using aliases',
      'CROSS JOIN - Cartesian product of two tables',
      // Aggregate Functions
      'COUNT() - Counts number of rows',
      'SUM() - Adds up numeric values',
      'AVG() - Calculates average value',
      'MIN()/MAX() - Finds smallest/largest value',
      // Subqueries & Indexes
      'Subquery - Query nested inside another query (WHERE/FROM/SELECT)',
      'Correlated subquery - Inner query depends on outer query per row',
      'INDEX - Speeds up SELECT queries at cost of slower writes',
      'Composite index - Index on multiple columns, order matters',
      // Normalization
      '1NF - Atomic column values, no repeating groups',
      '2NF - 1NF + no partial dependency on composite key',
      '3NF - 2NF + no transitive dependency on non-key columns',
      // Views, Procedures, Triggers
      'VIEW - Virtual table based on a stored SELECT query',
      'Stored Procedure - Precompiled, reusable SQL routine',
      'Trigger - Auto-executes on INSERT/UPDATE/DELETE events',
      // Interview Query Patterns
      'Nth highest salary - Use LIMIT with OFFSET or subquery with DISTINCT',
      'Find duplicates - GROUP BY column HAVING COUNT(*) > 1',
      'Second highest without LIMIT - Correlated subquery with COUNT(DISTINCT)'
    ],

    interviewQuestions: [
      {
        company: 'Oracle',
        questions: [
          'What are different types of joins in MySQL?',
          'Explain normalization and its types',
          'What is the difference between INNER JOIN and LEFT JOIN?',
          'How do you optimize a slow query?',
          'What are indexes and when to use them?'
        ]
      }
    ]
  }
];
